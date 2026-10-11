#!/usr/bin/env node
// PROOF: exile must not collapse contest eligibility (journey deepening r2, 2026-10-11).
// Found: 2/3 pilot episodes (seeds 161803 tithe, 31337 tidepool) were announced,
// then the player was exiled overnight, and at grab-day resolveContest the
// System said "no one left to take instead — the show is cancelled" while
// ELEVEN living villagers stood at Haven.
// Root cause: contestEligible() requires a grid position (v.positions[rid]).
// Positions are RENDER state — game.js clears them for NPCs not on the
// player's node. An exiled/walking player is off-node, so every villager
// reads "unaccounted for" and the recast pool is empty.
// Fix: in the no-position branch, consult npcNode() (the authority, defaults
// home to Haven) instead of raw nodePos. At-Haven-but-off-camera villagers
// are eligible; the genuinely away stay out with "away from Haven".
// Canon: "If player isn't involved, put on a watchable show, especially with
// villagers." The show must go on — recast, not cancel.
//
// Usage: node scripts/test-exile-eligibility-deepening-r2-20261011.js
// Run x3 seeds via SEEDS=1,2,3 (default 3).

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [1, 2, 3]);

let _s = 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
function resetRng(seed) { _s = seed >>> 0; }

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global;
const files = [
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js',
  'src/js/convo-mood.js', 'src/js/convoTopics.js', 'src/js/convo-wants.js',
  'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
  'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js',
  'src/js/contests.js', 'src/js/broadcast.js', 'src/js/contestEngine.js',
  'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
  'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js',
  'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/waveLedger.js',
  'src/js/feastBuff.js', 'src/js/ledger.js', 'src/js/abilityActions.js',
  'src/js/monsterBehaviors.js', 'src/js/partyTactics.js',
  'src/js/sigW3a.js', 'src/js/statusEffects.js', 'src/js/sigW3b.js',
  'src/js/metaProgression.js', 'src/js/sigW3c.js',
  'src/js/villager-agency.js', 'src/js/fieldFights.js',
  'src/js/villager-objectives.js', 'src/js/codex-people.js',
  'src/js/membership.js', 'src/js/havenGrowth.js', 'src/js/hierarchy.js',
  'src/js/comms.js', 'src/js/safetynets.js', 'src/js/villageAgency.js',
  'src/js/debug-scenarios.js', 'src/js/build.js',
];
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL: ' + name + (extra ? '\n  ' + String(extra).slice(0, 300) : '')); }
}

function freshGame(seed) {
  resetRng(seed);
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const s = Game.state.scholar;
  s.day = 20;
  Game.state.systemArrived = true;
  s.health = 100; s.kcal = 2000; s.trauma = 0; s.exiled = false;
  Game.state.over = false;
  Game.state.activeContest = null;
  Game.state.pendingContest = null;
  const V = Game.state.village;
  const roster = (V.roster || []).filter(id => id !== Game.villagerId);
  V.positions = V.positions || {};
  V.health = V.health || {};
  roster.forEach((vid, i) => {
    V.positions[vid] = { x: 2 + (i % 5), y: 2 + Math.floor(i / 5) };
    V.health[vid] = 100;
    try { const vp = Game.vpOf(vid); if (vp) { vp.dead = false; vp.age = 30; } } catch (e) {}
  });
  V.severed = {};
  return roster;
}

// simulate the render clear that happens when the player leaves the node
// (game.js: positions cleared for NPCs not on the player's node)
function simulateOffNode() {
  Game.state.village.positions = {};
}

(async () => {
await Game.init();
for (const seed of SEEDS) {
  const roster = freshGame(seed);
  const vHome = roster[0], vHome2 = roster[1], vAway = roster[2];

  // baseline: everyone eligible
  let r = Game.contestEligible();
  check(`seed ${seed}: baseline all villagers eligible`,
    roster.every(id => (r.eligible || []).some(e => e.id === id)),
    `eligible=${(r.eligible || []).length}/${roster.length}`);

  // send one villager genuinely away (expedition pattern: away flag + node)
  try { Game.npcSetNode(vAway, 5, 5); } catch (e) {}
  Game.state.village.away = Game.state.village.away || {};
  Game.state.village.away[vAway] = { nx: 5, ny: 5, purpose: 'expedition' };
  delete Game.state.village.positions[vAway];

  // THE BUG: player off-node (exiled) -> positions cleared for everyone
  Game.state.scholar.exiled = true;
  simulateOffNode();
  r = Game.contestEligible();
  const ids = (r.eligible || []).map(e => e.id);
  const outById = {};
  for (const o of (r.ineligible || [])) outById[o.id] = o.reason;
  check(`seed ${seed}: exiled player out with reason`,
    !ids.includes('player') && /exiled/.test(outById['player'] || ''), outById['player']);
  check(`seed ${seed}: at-Haven villagers STILL eligible when off-camera (the fix)`,
    ids.includes(vHome) && ids.includes(vHome2),
    `eligible=[${ids.join(',')}] out=${JSON.stringify(outById).slice(0, 200)}`);
  check(`seed ${seed}: genuinely-away villager still out with reason`,
    !ids.includes(vAway) && /away from Haven/.test(outById[vAway] || ''), outById[vAway]);
  check(`seed ${seed}: no "unaccounted for" false negatives`,
    !(r.ineligible || []).some(o => o.id !== 'player' && /unaccounted/.test(o.reason || '')),
    JSON.stringify((r.ineligible || []).map(o => o.reason)));

  // END-TO-END: announced contest + overnight exile -> grab day RECASTS,
  // not "no one left to take"
  const lines = [];
  const _sysSay = Game.sysSay;
  Game.sysSay = function (t) { lines.push(String(t)); return _sysSay.call(this, t); };
  // restore pre-exile state for the announcement, then re-exile overnight
  Game.state.scholar.exiled = false;
  roster.forEach((vid, i) => {
    if (vid === vAway) return;
    Game.state.village.positions[vid] = { x: 2 + (i % 5), y: 2 + Math.floor(i / 5) };
  });
  try {
    const c = Game.pickContest();
    Game.state.pilotAired = true; // not testing the pilot here
    Game.fireContest(c);
    const pc = Game.state.pendingContest;
    check(`seed ${seed}: contest announced with pendingContest`, !!pc, 'no pendingContest');
    if (pc) {
      // overnight: exile + off-node render clear (the 161803/31337 sequence)
      Game.state.scholar.exiled = true;
      simulateOffNode();
      Game.state.scholar.day = pc.firesDay;
      // drive the modal if one opens
      Game.resolveContest();
      let guard = 0;
      while (Game.state.activeContest && guard++ < 50) {
        try { Game.contestChoose(1); } catch (e) { break; }
      }
      const said = lines.join('\n');
      check(`seed ${seed}: grab day does NOT say "no one left to take"`,
        !/no one left to take/.test(said),
        said.slice(0, 300));
      check(`seed ${seed}: grab day recasts ("The show must go on") or plays`,
        /The show must go on|CONTEST INTERRUPTION/.test(said),
        said.slice(0, 300));
    }
  } finally {
    Game.sysSay = _sysSay;
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
})();
