#!/usr/bin/env node
// Conversation want-system gaps (Steve 2026-10-11: "Address any gaps!").
// RED test first: simulate first meetings across seeds and assert:
//   (a) >=50% of first meetings open with curious/question (design: strangers
//       are curious; acute needs excepted)
//   (b) question pool non-empty at low trust, even after village-wide use
//   (c) run-ledger blocks don't produce the lying snap
//   (d) the snap never repeats verbatim in one conversation
//
// Harness: full index.html script list (minus DOM-only app.js/sprites.js/
// tile-scenes.js/move-anim.js + drama.js). Seeded PRNG BEFORE module eval
// (modules capture Math.random at load).

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [20261011, 777, 424242]);

let _s = 0;
function seedRng(seed) {
  _s = seed | 0;
  Math.random = function () {
    _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
    let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
seedRng(SEEDS[0]);

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global; // stub for eval phase only
const files = [
  'src/js/engine/state.js',
  'src/js/engine/modifiers.js',
  'src/js/engine/calories.js',
  'src/js/engine/day.js',
  'src/js/engine/forage.js',
  'src/js/engine/combat.js',
  'src/js/game.js',
  'src/js/encounters.js',
  'src/js/conversation.js',
  'src/js/convo-mood.js',
  'src/js/convoTopics.js',
  'src/js/convo-wants.js',
  'src/js/convo-dialogue.js',
  'src/js/convo-beats.js',
  'src/js/convo-scene.js',
  'src/js/voice-piper.js',
  'src/js/examine.js',
  'src/js/equipment.js',
  'src/js/journal.js',
  'src/js/party.js',
  'src/js/party-formal.js',
  'src/js/truth.js',
  'src/js/contests.js',
  'src/js/broadcast.js',
  'src/js/contestEngine.js',
  'src/js/alienPlayers.js',
  'src/js/storage.js',
  'src/js/perceive.js',
  'src/js/carexplore.js',
  'src/js/justice.js',
  'src/js/food.js',
  'src/js/betrayal.js',
  'src/js/corpses.js',
  'src/js/corruption.js',
  'src/js/lifeseed.js',
  'src/js/progression.js',
  'src/js/waveLedger.js',
  'src/js/feastBuff.js',
  'src/js/ledger.js',
  'src/js/abilityActions.js',
  'src/js/monsterBehaviors.js',
  'src/js/partyTactics.js',
  'src/js/sigW3a.js',
  'src/js/sigW3b.js',
  'src/js/metaProgression.js',
  'src/js/sigW3c.js',
  'src/js/villager-agency.js',
  'src/js/fieldFights.js',
  'src/js/villager-objectives.js',
  'src/js/codex-people.js',
  'src/js/membership.js',
  'src/js/havenGrowth.js',
  'src/js/hierarchy.js',
  'src/js/comms.js',
  'src/js/table.js',
  'src/js/table-feared.js',
  'src/js/table-indispensable.js',
  'src/js/table-beloved.js',
  'src/js/table-witness.js',
  'src/js/table-assimilated.js',
  'src/js/table-defiant.js',
  'src/js/relay-ext.js',
  'src/js/relay-dialogue.js',
  'src/js/table-relay.js',
  'src/js/safetynets.js',
  'src/js/villageAgency.js',
  'src/js/debug-scenarios.js',
  'src/js/build.js',
];
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window; // sync headless path from here on
const Game = globalThis.Scattering.Game;

let failures = [];
function check(name, cond, detail) {
  if (!cond) failures.push(name + (detail ? ' — ' + detail : ''));
  else console.log('ok: ' + name);
}

async function main() {
await Game.init();

function freshGame(seed) {
  seedRng(seed);
  Game.genRoster('Minneapolis, USA');
  const chars = Game.generatedRoster || [];
  const char = chars[0];
  if (!char) throw new Error('no generated characters');
  Game.newGame('Minneapolis, USA', null, char.id, [], 'Test Convo Gaps');
  return Game.state;
}

function rosterIds() {
  const v = Game.state.village || {};
  return (v.roster || []).filter(rid => rid !== Game.villagerId);
}

// ---------- (a) first-meeting want distribution ----------
let curiousWins = 0, totalFirst = 0, acuteFavorWins = 0;
for (const seed of SEEDS) {
  freshGame(seed);
  for (const vid of rosterIds()) {
    const c = Game.convoGet(vid);
    // first meeting: no prior conversations
    if ((c.count || 0) > 1) continue;
    let want = null;
    try { want = Game.convoSelectWant(vid); } catch (e) { want = null; }
    if (!want || !want.id) continue;
    totalFirst++;
    if (want.id === 'curious') curiousWins++;
    // acute need check: hunger>70 / sick / health<60
    let acute = false;
    try {
      const n = Game.npcNeeds(vid) || {};
      const vp = Game.vpOf(vid) || {};
      if ((n.hunger || 0) > 70 || (n.health != null && n.health < 60)) acute = true;
      const sick = ((Game.state.village.sick || {})[vid] || {}).daysLeft || 0;
      if (sick > 0) acute = true;
    } catch (e) {}
    if (want.id === 'ask_favor' && acute) acuteFavorWins++;
  }
}
const curiousShare = totalFirst ? curiousWins / totalFirst : 0;
console.log(`first meetings: ${totalFirst}, curious opens: ${curiousWins} (${(curiousShare * 100).toFixed(1)}%), acute-favor opens: ${acuteFavorWins}`);
check('(a) >=50% of first meetings open curious', curiousShare >= 0.5,
  `got ${(curiousShare * 100).toFixed(1)}% over ${totalFirst} first meetings`);

// (a2) acute needs still lead on first meetings: starve a villager, assert ask_favor wins
{
  freshGame(SEEDS[2]);
  const ids = rosterIds();
  const vid = ids[0];
  const v = Game.state.village;
  v.needs = v.needs || {};
  v.needs[vid] = { hunger: 85, fear: 20, social: 40, energy: 70 };
  let want = null;
  try { want = Game.convoSelectWant(vid); } catch (e) {}
  check('(a2) acute need (hunger>70) still leads first meeting', want && want.id === 'ask_favor',
    `got ${want && want.id}`);
}

// ---------- (b) question pool at low trust, after village-wide exhaustion ----------
// Drain the village-wide pool completely, then a fresh low-trust villager
// must still get a question (per-villager fallback) — a small camp circles
// back to the same worries rather than going silent.
let poolAfterUse = null, drained = 0;
{
  freshGame(SEEDS[0]);
  const ids = rosterIds();
  for (let round = 0; round < 10; round++) {
    let hung = 0;
    for (const vid of ids) {
      const c = Game.convoGet(vid);
      c.pendingQ = null; c.reactiveQ = null; c.genericQ = null; // allow re-hang
      let q = null;
      try { q = Game.convoHangWantQuestion(vid); } catch (e) {}
      if (q) hung++;
    }
    if (!hung) break;
    drained += hung;
  }
  const probe = ids[0];
  const c = Game.convoGet(probe);
  c.askedQs = []; c.pendingQ = null; c.reactiveQ = null; c.genericQ = null;
  let q = null;
  try { q = Game.convoPickUnaskedQuestion(probe); } catch (e) {}
  poolAfterUse = q;
}
console.log(`village-wide questions drained: ${drained}; fresh low-trust pick after: ${poolAfterUse ? poolAfterUse.id : 'null'}`);
check('(b) question pool non-empty at low trust after village-wide exhaustion', !!poolAfterUse,
  poolAfterUse ? '' : 'convoPickUnaskedQuestion returned null');

// ---------- (c) run-ledger block must not produce the lying snap ----------
{
  freshGame(SEEDS[1]);
  const ids = rosterIds();
  const A = ids[0], B = ids[1];
  Game.startConvo(A); Game.startConvo(B);
  const shared = '"Another time, then. Knowledge keeps."';
  const outA = Game.sayLine(A, shared, {});
  // B says the same shared line: run-ledger blocks it (A said it moments ago)
  const outB = Game.sayLine(B, shared, { fallback: '"I just said — did you miss it?"' });
  const snapped = outB && outB.indexOf('did you miss it') !== -1;
  console.log(`ledger block: A spoke shared line; B got: ${JSON.stringify(outB)}`);
  check('(c) no lying snap on run-ledger block', !snapped,
    snapped ? 'B claimed "I just said" for a line A said' : '');
  // (d) second block in the same conversation must not parrot the fallback
  const shared2 = '"Yeah. Thought so — and I\'m glad it\'s you saying it."';
  Game.sayLine(A, shared2, {});
  const outB2 = Game.sayLine(B, shared2, { fallback: '"I just said — did you miss it?"' });
  console.log(`second block in same convo: ${JSON.stringify(outB2)}`);
  check('(d) no verbatim repeat of the snap', outB2 !== outB,
    `both blocks returned ${JSON.stringify(outB)}`);
}

console.log(failures.length ? `\nFAIL: ${failures.length} checks failed` : '\nALL GREEN');
for (const f of failures) console.log(' - ' + f);
process.exit(failures.length ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e.message); process.exit(2); });
