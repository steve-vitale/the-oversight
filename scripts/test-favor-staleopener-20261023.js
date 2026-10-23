// test-favor-staleopener-20261023.js — proof test for the r16 staleOpener fix.
//
// BEFORE (journey deepening r16, transcript seed 8905 d45): when a want's
// fresh opener variants were all ledger-blocked, the generic fallback
// convoWantStaleOpener named the want ID as dialogue:
//   "About ask favor — I keep turning it over."
// (want id leaked into spoken text; only seek_taken had a def-level
// staleOpener).
//
// AFTER: the ask_favor def defines staleOpener(vid) — it names the favor's
// real short ("About the pantry run — still on my mind."), never the id.
//
// Proof:
//   A. the generic fallback still produces the id-leak line (documents the
//      before behavior the def-level fix replaces);
//   B. the ask_favor def's staleOpener names the favor short and never the
//      want id;
//   C. with no favor at all it returns null (honest fallback chain).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

async function main() {
  let found = null;
  for (let seed = 1; seed <= 30 && !found; seed++) {
    const { Game } = await loadGame({ seed, mode: 'test-favor-staleopener' });
    global.window = global;
    await setupGame(Game);
    delete global.window;
    const roster = ((Game.state.village || {}).roster || []);
    const vid = roster[0];
    if (!vid) continue;
    // Force a real favor need: hunger 80 -> food_share urgency 4. This
    // exercises the honest need path (convoFindFavorNeed), not a mock.
    const _nn = Game.npcNeeds;
    Game.npcNeeds = function (id) {
      const n = _nn.call(this, id) || {};
      return id === vid ? Object.assign({}, n, { hunger: 80 }) : n;
    };
    let w = null;
    try { w = Game.convoSelectWant(vid); } catch (e) { w = null; }
    Game.npcNeeds = _nn;
    if (w && w.id === 'ask_favor' && w.def) { found = { Game, vid, w }; break; }
  }
  if (!found) { console.log('  FAIL no ask_favor want found in 30 seeds'); process.exit(1); }
  const { Game, vid, w } = found;
  const c = Game.convoGet(vid);
  // give the want a favor with a real short (mirrors the live path where the
  // seed/favor is attached before the stale opener fires)
  let favor = null;
  try { favor = Game.convoGetFavor(vid); } catch (e) {}
  if (!favor) favor = { id: 'f1', kind: 'food', short: 'the pantry run', state: 'asked' };
  c.want = c.want || {};
  c.want.favor = favor;
  const short = favor.short;

  // A. generic fallback (unchanged) — documents the before behavior
  const generic = Game.convoWantStaleOpener(vid, { id: 'ask_favor' });
  ok('generic fallback still names the id (before-behavior doc)',
    typeof generic === 'string' && /About ask favor/.test(generic), generic);

  // B. def-level staleOpener — the fix
  const line = w.def.staleOpener.call(Game, vid);
  ok('def staleOpener returns a line', typeof line === 'string' && line.length > 10, line);
  ok('def staleOpener names the favor short, not the want id',
    typeof line === 'string' && line.toLowerCase().indexOf(short.toLowerCase()) >= 0 && !/ask favor/i.test(line), line);

  // C. no favor -> null (falls back honestly)
  c.want.favor = null;
  const origGet = Game.convoGetFavor;
  Game.convoGetFavor = () => null;
  const line2 = w.def.staleOpener.call(Game, vid);
  Game.convoGetFavor = origGet;
  ok('def staleOpener null with no favor', line2 === null, String(line2));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TEST ERROR:', e); process.exit(2); });
