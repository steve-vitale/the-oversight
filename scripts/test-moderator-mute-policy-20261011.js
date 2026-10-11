// PROOF TEST (journey-scale r2 2026-10-11): the Moderator mute vs the
// journey-harness fight policy.
//
// BUG (found in the trade-road 8-seed run): seed 271828 hit the Moderator
// (wave-2 apex) 102 times and NEVER finished one — max 281,594 rounds.
// The policy struck into the suppression-field mute every turn: each muted
// strike is a violation (+3/Notice each, turn spent, zero damage), and a
// strike-only policy never varies verbs, so the mute never flips. The old
// policy also counted muted flee-moves as progress. The fight is not
// unwinnable for a real player — WAIT is never muted, five quiet rounds
// lift the mute ("it loses the thread", announced plainly), and only ONE
// verb is ever muted at a time (game code, verified below). The stall was
// purely the policy not reading the coaching.
//
// FIX (scripts/test-journey-scale-20261011.js policy.fight): scan the
// previous turn's say-output for "IS MUTED inside the suppression field";
// when seen, tbPlayerWait() instead of striking. Quiet rounds flip the
// mute; the policy resumes striking once the lift lands.
//
// This file demonstrates both sides in one fixture:
//   PART 1 (old behavior): strike-only policy -> stalls (RED documentation)
//   PART 2 (new behavior): mute-aware policy -> adapts, mute lifts, damage
//   lands (GREEN assertions A1..A4)
// Run: node scripts/test-moderator-mute-policy-20261011.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
// mulberry32 seeded BEFORE eval — modules capture Math.random at load.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20261011);
Math.random = rng;
global.window = global; // stub for the eval phase only (equipment.js needs it)
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
for (const f of files) eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
delete global.window; // sync headless path from here on
const Game = globalThis.Scattering.Game;
function flatGrid() { return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 'grass')); }
const P = () => Game.tbFighter('p');
const M = () => Game.tbfight && Game.tbfight.fighters.find(x => Game.modIs(x));
const capture = [];
let failures = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}
function endTurn() {
  if (!Game.tbfight || Game.tbfight.over) return;
  if (!Game.tbIsPlayerTurn()) return;
  const p = P(); p.moveLeft = 0; p.acted = true;
  Game.tbAfterPlayerAction();
}
function strikeLowest() {
  const m = M();
  if (m && Game.tbIsPlayerTurn()) Game.tbPlayerStrike(m.key);
  endTurn();
}
function waitTurn() {
  if (Game.tbIsPlayerTurn()) Game.tbPlayerWait();
  else endTurn();
}
async function setupFight() {
  capture.length = 0;
  await Game.init();
  Game.say = (t) => { capture.push(String(t)); };
  Game.genDetail = () => flatGrid();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart(); Game.dayPart = 1;
  const s = Game.state.scholar;
  s.health = 500;
  s.equipped = { weapon: { itemId: 'fire_hardened_spear', name: 'Fire-hardened spear' } };
  Game.canSee = () => true;
  Game.startCombat('moderator');
  const m = M();
  const p = P(); p.hp = p.maxHp = 5000; // survive the apex's pressure; we test the mute, not the DPS race
  p.mx = 4; p.my = 4; s.mx = 4; s.my = 4; m.mx = 5; m.my = 4;
  // muting phase, player inside the suppression field, and a verb window
  // already full of landed strikes (as after real earlier phases) — the
  // window only shifts on NOTED verbs, muted attempts don't note, so the
  // mute persists until the player varies verbs or waits.
  m.beamPhase = 'muting';
  Game.modProjectField(m, 2, 'suppressed');
  Game.tbfight.modRecent = ['strike', 'strike', 'strike', 'strike', 'strike'];
  return m;
}
(async () => {
  // ---------- PART 1: old strike-only policy (the stall, RED documentation)
  let m = await setupFight();
  const hp0 = m.hp;
  let v0 = 0, mutedAttempts = 0;
  for (let r = 1; r <= 10 && Game.tbfight && !Game.tbfight.over; r++) {
    m = M(); if (!m || !m.alive) break;
    const vBefore = m.modViolations || 0;
    strikeLowest(); // old policy: strike, always strike
    v0 = m.modViolations || 0;
    if (v0 > vBefore) mutedAttempts++;
  }
  const dmgOld = hp0 - (M() ? M().hp : hp0);
  console.log(`PART 1 (old policy): 10 strike-only rounds -> muted strikes=${mutedAttempts}, violations=${v0}, monster damage=${Math.round(dmgOld)}, fight over=${!!(Game.tbfight && Game.tbfight.over)}`);
  check('P1 documents the stall: nearly every strike is muted', mutedAttempts >= 8, `muted=${mutedAttempts}/10`);
  check('P1 documents the stall: ~zero progress for the violations paid', dmgOld < 40, `damage=${Math.round(dmgOld)} for ${v0} violations`);
  check('P1 documents the stall: fight never ends', !(Game.tbfight && Game.tbfight.over), 'still fighting after 10 dead rounds');

  // ---------- PART 2: new mute-aware policy (the fix)
  // (Part 1's fight is still live by design — the stall never ends. Close
  // it explicitly: startCombat rightly refuses to clobber a live fight.)
  try { if (Game.tbfight && !Game.tbfight.over) Game.tbfight.over = true; } catch (e) {}
  m = await setupFight();
  const mhp0 = m.hp;
  let muteCk = 0, muteWait = 0, liftSeen = false, rounds = 0;
  for (let r = 1; r <= 16 && Game.tbfight && !Game.tbfight.over; r++) {
    rounds = r;
    m = M(); if (!m || !m.alive) break;
    let muted = false, lifted = false;
    for (let i = muteCk; i < capture.length; i++) {
      const l = capture[i] || '';
      if (/IS MUTED inside the suppression field/.test(l)) muted = true;
      if (/The mute LIFTS/.test(l)) { lifted = true; liftSeen = true; }
    }
    muteCk = capture.length;
    if (lifted) muteWait = 0;
    else if (muted) muteWait = 6;
    if (muteWait > 0) { muteWait--; waitTurn(); }
    else strikeLowest();
    if (!P() || !P().alive) { console.log('  player died (honest death, not a stall)'); break; }
  }
  const viol = (M() ? M().modViolations : 0) || 0;
  const dmgNew = mhp0 - (M() ? M().hp : mhp0);
  console.log(`PART 2 (new policy): ${rounds} rounds -> violations=${viol}, lift announced=${liftSeen}, monster damage=${Math.round(dmgNew)}`);
  check('A1 never strikes into the mute twice in a row (violations stay tiny)', viol <= 3, `violations=${viol}`);
  check('A2 quiet rounds lift the mute, announced plainly', liftSeen, 'The mute LIFTS in capture');
  check('A3 damage lands once the mute lifts', dmgNew >= 1, `damage=${Math.round(dmgNew)}`);
  check('A4 the fight progresses instead of stalling', dmgNew >= 1 || (Game.tbfight && Game.tbfight.over) || !P() || !P().alive, 'no 281k-round lock');
  console.log(failures ? `\n${failures} FAILURES` : '\nALL GREEN');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
