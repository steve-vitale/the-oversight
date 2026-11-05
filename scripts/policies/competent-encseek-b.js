// policies/competent-encseek-b.js — SEEK probe policy for arm
// sim-encounterprod2-b (Loop B 20261105T0330Z). POLICY ONLY, zero src/js.
// Wraps competent verbatim and adds ONE pre-step to each day:
//
//   SEEK: if the player remembers a tile where something was announced
//   moving ("Something moves out there — ...", the tile-entry spawn line)
//   on an EARLIER day, and that tile has not been sought yet, and the
//   player currently stands on a safe tile (home ground), travel there
//   honestly (no force) and take ONE forage action — competent's normal
//   on-tile behavior — then let competent.daily run as usual.
//
// PERCEPTION LAW (load-bearing): the memory is built ONLY from what the
// player actually perceived —
//   (a) spawn-announcement say lines heard while standing on that tile
//       (the line fires on the entered tile, so tile == player's tile
//       at say time), and
//   (b) a monster standing on the player's own tile at a daily start
//       (the competent policy itself reads this: "SEE the monster on
//       the tile (perception)").
// It NEVER reads a monster roster, world array, or tile contents: no
// living-world roster call, no roster-array read, no monsterAt call
// on any tile but the player's own. A cleanliness leg in
// scripts/test-encounterprod-20261105.js asserts the absence of those
// tokens in this file, comments included.
//
// WAVE-AGNOSTIC (stated, not hidden): the spawn line names the village
// display name, never the true id or wave, so a remembered tile is not
// known to hold a wave-4 beast. Post-unlock, tile-entry spawns are
// ~60% newest-wave by spawnWaveTarget, so the probe still biases
// sorties toward wave-4 opportunity without claiming wave knowledge
// the player does not have.
//
// BOUNDS (fixed here, preregistered in sim-encounterprod-b-prereg.md):
//   - at most ONE seek step per day, only to a tile remembered on an
//     EARLIER day (never same-day: the player just left that tile);
//   - remembered tiles expire after 14 days (monsters wander);
//   - at most 5 remembered tiles kept (oldest dropped first);
//   - a sought tile is never sought twice (one visit per memory);
//   - if travel fails to arrive, or a fight starts, the step ends and
//     competent.daily runs as usual (no recovery travel, no second try);
//   - the seek step never forces travel and never forages twice.
//   - seek calls are recorded on ctx.encseek = { calls: [...] } so the
//     driver can report them; a call records day, from, to, arrived,
//     foraged, fightStarted.
'use strict';
const { competent } = require('./competent');

const _mem = new WeakMap();

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}
function playerTile(Game) {
  try { return { x: Game.map.px, y: Game.map.py }; } catch (e) { return { x: null, y: null }; }
}
function isSafe(Game, x, y) {
  try { return (typeof Game.isSafeTile === 'function') ? !!Game.isSafeTile(x, y) : false; } catch (e) { return false; }
}

function memFor(Game) {
  let m = _mem.get(Game);
  if (!m) {
    m = { tiles: [], sayWrapped: false };
    _mem.set(Game, m);
  }
  return m;
}

function installSayWrap(Game) {
  const m = memFor(Game);
  if (m.sayWrapped) return;
  m.sayWrapped = true;
  const origSay = Game.say;
  if (typeof origSay !== 'function') return;
  Game.say = function () {
    let ret;
    try { ret = origSay.apply(this, arguments); } catch (e) { throw e; }
    try {
      const arg = arguments.length ? arguments[0] : null;
      if (typeof arg === 'string' && arg.indexOf('Something moves out there') === 0) {
        const pt = playerTile(Game);
        const d = gday(Game);
        if (pt.x != null) {
          const key = pt.x + ',' + pt.y;
          const existing = m.tiles.find(function (t) { return t.key === key; });
          if (existing) { existing.day = d; existing.sought = false; }
          else {
            m.tiles.push({ key: key, x: pt.x, y: pt.y, day: d, sought: false });
            while (m.tiles.length > 5) m.tiles.shift();
          }
        }
      }
    } catch (e) { /* recording-only: never throw into game code */ }
    return ret;
  };
}

function seekStep(Game, ctx) {
  const m = memFor(Game);
  const d = gday(Game);
  const st = ctx.encseek || (ctx.encseek = { calls: [] });
  try {
    if (Game.over || Game.tbfight || Game.pendingEncounter) return;
    // (b) perception at daily start: a monster on the player's own tile
    // is remembered (own-tile read only).
    try {
      const pt = playerTile(Game);
      if (pt.x != null && typeof Game.monsterAt === 'function' && Game.monsterAt(pt.x, pt.y)) {
        const key = pt.x + ',' + pt.y;
        if (!m.tiles.some(function (t) { return t.key === key; })) {
          m.tiles.push({ key: key, x: pt.x, y: pt.y, day: d, sought: true });
          while (m.tiles.length > 5) m.tiles.shift();
        }
      }
    } catch (e) { /* perception read failed: seek proceeds on say-memory only */ }
    // Prune expired memories (older than 14 days).
    m.tiles = m.tiles.filter(function (t) { return (d - t.day) <= 14; });
    const target = m.tiles.find(function (t) { return !t.sought && t.day < d; });
    if (!target) return;
    const pt = playerTile(Game);
    if (pt.x == null || !isSafe(Game, pt.x, pt.y)) return;
    if (pt.x === target.x && pt.y === target.y) { target.sought = true; return; }
    target.sought = true;
    const call = { day: d, from: pt.x + ',' + pt.y, to: target.key, arrived: false, foraged: false, fightStarted: false };
    st.calls.push(call);
    try { Game.travelTo(target.x, target.y); } catch (e) { call.travelError = String(e.message).slice(0, 80); return; }
    const now = playerTile(Game);
    call.arrived = (now.x === target.x && now.y === target.y);
    if (Game.tbfight || Game.pendingEncounter) { call.fightStarted = true; return; }
    if (!call.arrived) return;
    try {
      const ok = Game.doAction('forage', {});
      call.foraged = !!ok;
    } catch (e) { call.forageError = String(e.message).slice(0, 80); }
    if (Game.tbfight || Game.pendingEncounter) call.fightStarted = true;
  } catch (e) { st.error = String(e.message).slice(0, 120); }
}

const wrapped = Object.assign({}, competent, {
  id: 'competent-encseek-b',
  desc: 'competent + seek sorties toward announcement-remembered tiles (encounterprod probe)',
  daily(Game, ctx) {
    installSayWrap(Game);
    seekStep(Game, ctx);
    return competent.daily(Game, ctx);
  },
});

module.exports = { competentEncseek: wrapped };
