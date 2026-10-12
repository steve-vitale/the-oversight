#!/usr/bin/env node
// PROOF: gossip openers ("Did you hear? ...") are not extracted as generic
// questions. (journey-scale r3 2026-10-11)
//
// The bug: classifyQuestion took the first "?""-sentence of a gossip line —
// "Did you hear? Luz just walked away..." → "Did you hear?" — and hung it as
// a generic question. When the player said "go on" (dodging it), the
// follow-up fired: '"Sorry — I asked you something there." Did you hear?'
// — nonsense, in two separate transcripts. "Did you hear?" is gossip
// framing, never a genuine question.
//
// The fix: "did you hear" joins the rhetorical-opener guard in
// classifyQuestion — no genericQ is created for it.

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let _s = 999;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

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
  if (cond) { pass++; console.log(`  ok: ${name}`); }
  else { fail++; console.log(`  FAIL: ${name}${extra ? ' — ' + extra : ''}`); }
}

(async () => {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  Game.startConvo(vid);
  // Clean slate: startConvo may leave reactiveQ/pendingQ hanging, which
  // would block genericQ extraction for reasons unrelated to this test.
  const c0 = Game.convoGet(vid);
  c0.genericQ = null; c0.reactiveQ = null; c0.pendingQ = null; c0.heldAsk = false;

  // The gossip line from the transcript.
  const r1 = Game.convoGenericQ(vid, '"Did you hear? Luz just walked away from Haven. Didn\'t look back. Not that it matters."');
  check('gossip "Did you hear?" extracts no generic question', r1 === null, 'got ' + JSON.stringify(r1));

  // A genuine direct question still extracts (clean state — startConvo may
  // have left a reactiveQ hanging).
  const c2 = Game.convoGet(vid);
  c2.genericQ = null; c2.reactiveQ = null; c2.pendingQ = null; c2.heldAsk = false;
  const r2 = Game.convoGenericQ(vid, '"Are you eating enough? You look thin."');
  check('genuine "Are you eating enough?" still extracts', r2 !== null && /eating enough/.test(r2.q), 'got ' + JSON.stringify(r2));

  // Another rhetorical opener stays excluded.
  Game.convoGet(vid).genericQ = null;
  const r3 = Game.convoGenericQ(vid, '"You know what I miss? Minneapolis rain."');
  check('"You know what I miss?" stays excluded', r3 === null, 'got ' + JSON.stringify(r3));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROBE ERROR: ' + (e && e.stack || e)); process.exit(2); });
