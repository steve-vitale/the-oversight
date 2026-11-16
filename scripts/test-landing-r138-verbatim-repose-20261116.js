#!/usr/bin/env node
// Verbatim-repeat counter: exempt the deliberate re-pose — PROOF
// (journey-landing r138, 2026-11-16).
//
// Defect (r137 metric review): the r137 fix re-poses the SAME curious
// question when the player picks the want-thread resume ("We never
// finished — <question>"). The driver's verbatim counter (exact duplicate
// THEM lines in a sitting) counted all four r137 re-poses as VERBATIM
// REPEATS (seeds 1146, 1147, 1148, 1150 — verified against the saved
// r137 corpus before writing the fix: each sitting's opener is a single
// THEM line, the curious question itself; the resume take is followed
// immediately by the same question text).
//
// Fix (driver-only instrument, zero src/js): shared module
// scripts/landing-verbatim.js exports splitVerbatimDupes, which exempts
// a duplicate whose FIRST occurrence is one of the sitting's opener
// THEM lines AND the sitting took a want-thread resume — at most one
// occurrence per distinct line per sitting. The r138 driver requires it;
// this test imports the SAME function (no duplicated predicate).
//
// Cases — the re-pose sitting is REAL (scripted via startConvo/convoTurn,
// Liam shape mirrored on the r137 proof test); the controls evaluate the
// shared function on that real transcript:
//   1. Real re-pose sitting: the re-posed question is exempted (1),
//      nothing else counts as a real repeat.
//   2. Control (same transcript, resumeTakes=0): the question counts
//      as a real repeat — the exemption needs the resume.
//   3. Control (same transcript, openerCount=0): the question counts
//      as a real repeat — the exemption needs the opener position.
//   4. Control (synthetic duplicate of a mid-sitting non-opener line):
//      that dupe is real, not exempt.
//   5. Control (synthetic third speaking of the question): only 1
//      exempted, the extra counts as real.
//   6. Guard: the shared function never mutates its inputs.
//   7. Edge inputs: empty dupes -> empty partition; a dupe with no
//      transcript lines -> real.
//
// Seeded PRNG BEFORE module eval. Full production script list, minus
// DOM-only modules (same list as test-convo-want-resume-repose-20261115).
//
// Usage: node scripts/test-landing-r138-verbatim-repose-20261116.js [SEED=...]

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261116', 10);
const { splitVerbatimDupes } = require('./landing-verbatim');

let _s = SEED >>> 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.window = global;
const files = [
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/text.js', 'src/js/conversation.js',
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

if (typeof Game.emit !== 'function') {
  Game.emit = function (msg) {
    try { (this.log = this.log || []).push(String(msg)); } catch (e) {}
    return msg;
  };
}

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS: ${name}`); }
  else { fail++; console.log(`FAIL: ${name}` + (extra ? ` — ${extra}` : '')); }
}
function vname(vid) {
  try { return Game.villagerName(vid) || vid; } catch (e) { return vid; }
}
function choicesOf(r, vid) {
  return (r && r.choices && r.choices.length) ? r.choices : Game.convoChoices(vid);
}
// The driver's verbatim normalization, verbatim (driver line ~1633):
// quote-sensitive exact-match fix (r38) — strip surrounding quotes first.
const stripQuotes = (s) => String(s || '').trim().replace(/^"+|"+$/g, '').trim();
// The driver's duplicate computation, verbatim (driver line ~1635).
function driverDupes(themNorm) {
  return themNorm.filter((x, i) => themNorm.indexOf(x) !== i);
}
// Drive a sitting until the menu offers alive:thread:<tid> (bounded).
// (Copied from test-convo-want-resume-repose-20261115.js: the resume is
// suppressed while the beat thread IS the planted thread, and the plant
// fires when a topic ask moves the beat thread off it — so the walk is
// topic ask -> change subject -> resume.)
function takeResume(vid, tid, r0) {
  let r = r0;
  let moved = false;
  for (let turn = 0; turn < 12; turn++) {
    const choices = choicesOf(r, vid);
    const resume = (choices || []).find(x => x && x.id === 'alive:thread:' + tid);
    if (resume) {
      const rr = Game.convoTurn(vid, resume.id);
      return rr;
    }
    let nav = null;
    if (!moved) {
      nav = (choices || []).find(x => x && x.id === 'ask:village')
        || (choices || []).find(x => x && x.id && x.id.indexOf('ask:') === 0);
      if (nav) moved = true;
    }
    if (!nav) nav = (choices || []).find(x => x && x.id === 'dlg:subject');
    if (!nav) nav = (choices || []).find(x => x && x.id === 'menu:more');
    if (!nav) nav = (choices || []).find(x => x && x.id === 'goon');
    if (!nav) return null;
    r = Game.convoTurn(vid, nav.id);
    if (r.ended) return null;
  }
  return null;
}

async function main() {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = 20;

  const npcs = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const commAble = npcs.filter(id => { try { return Game.npcComm(id).level !== 'none'; } catch (e) { return true; } });
  ok('has comm-able villagers', commAble.length >= 3, `npcs=${npcs.length} commAble=${commAble.length}`);

  // ---- REAL re-pose sitting (Liam shape) ----
  let A = null;
  for (const vid of commAble) {
    try { Game.state.village.trust[vid] = 65; } catch (e) {}
    const r0 = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    if (!r0.refused && c.want && c.want.id === 'curious' && c.pendingQ && c.pendingQ.id) {
      // Opener THEM count, as the driver captures it (_startThem).
      const openerCount = (c.transcript || []).filter(e => e && e.who === 'them').length;
      A = { vid, qid: c.pendingQ.id, openerCount };
      console.log(`\n--- curious villager: ${vname(vid)} qid=${c.pendingQ.id} openerCount=${openerCount} ---`);
      console.log(`THEM: ${r0.line}`);
      break;
    }
    Game.endConvo(vid, 'left');
  }
  ok('found a curious villager with a hanging question', !!A, 'none found');
  if (!A) { console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`); process.exit(1); }

  const qdA = Game.convoQuestionDef(A.qid);
  const qCoreA = String((qdA && qdA.q) || '').replace(/^"|"$/g, '').slice(0, 40);
  let r = Game.convoTurn(A.vid, 'deflect_q');
  if (r.line) console.log(`THEM: ${r.line}`);
  const rr = takeResume(A.vid, 'want', r);
  ok('the resume choice was offered and taken', !!rr, 'never offered');
  if (!rr) { Game.endConvo(A.vid, 'left'); console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`); process.exit(1); }
  const resumeLine = String(rr.line || '');
  ok('the resume line IS the same question (re-posed)', resumeLine.includes(qCoreA),
    `line=${resumeLine.slice(0, 140)}`);
  Game.endConvo(A.vid, 'left');

  // The driver's verbatim inputs, built the driver's way from the final
  // transcript (post-endConvo, same as the driver reads it).
  const c2 = Game.convoGet(A.vid);
  const themT = ((c2 && c2.transcript) || []).filter(e => e && e.who === 'them').map(e => String(e.text || ''));
  const themNorm = themT.map(stripQuotes);
  const dupes = driverDupes(themNorm);
  const qNorm = stripQuotes(String((qdA && qdA.q) || ''));
  console.log(`\ntranscript THEM lines: ${themNorm.length}; openerCount=${A.openerCount}; dupes=${dupes.length}`);
  console.log(`question (normalized): ${qNorm.slice(0, 100)}`);
  ok('the real sitting carries the re-posed question as a duplicate',
    dupes.filter(d => d === qNorm).length === 1,
    `dupes=${JSON.stringify(dupes.map(d => d.slice(0, 60)))}`);
  const firstIdx = themNorm.indexOf(qNorm);
  ok('the question first occurs among the opener lines',
    firstIdx >= 0 && firstIdx < A.openerCount, `firstIdx=${firstIdx} openerCount=${A.openerCount}`);

  // ---- CASE 1: the exemption fires on the real sitting ----
  const split1 = splitVerbatimDupes(dupes, themNorm, A.openerCount, 1);
  ok('case 1: the re-posed question is exempted (exactly once)',
    split1.exempted.filter(d => d === qNorm).length === 1,
    `exempted=${JSON.stringify(split1.exempted.map(d => d.slice(0, 60)))}`);
  ok('case 1: the re-posed question is NOT counted as a real repeat',
    !split1.real.includes(qNorm), `real=${JSON.stringify(split1.real.map(d => d.slice(0, 60)))}`);
  ok('case 1: nothing else in this sitting counts as a real repeat',
    split1.real.length === 0,
    `real=${JSON.stringify(split1.real.map(d => d.slice(0, 80)))}`);

  // ---- CASE 2: no resume taken -> the same duplicate is real ----
  const split2 = splitVerbatimDupes(dupes, themNorm, A.openerCount, 0);
  ok('case 2: with resumeTakes=0 the question counts as a real repeat',
    split2.real.filter(d => d === qNorm).length === 1 && split2.exempted.length === 0,
    `real=${split2.real.length} exempted=${split2.exempted.length}`);

  // ---- CASE 3: not an opener line -> the same duplicate is real ----
  const split3 = splitVerbatimDupes(dupes, themNorm, 0, 1);
  ok('case 3: with openerCount=0 the question counts as a real repeat',
    split3.real.filter(d => d === qNorm).length === 1 && split3.exempted.length === 0,
    `real=${split3.real.length} exempted=${split3.exempted.length}`);

  // ---- CASE 4: a mid-sitting non-opener repeat is real ----
  // Pick a non-opener THEM line (index >= openerCount) and duplicate it.
  const midIdx = themNorm.findIndex((l, i) => i >= A.openerCount && l && l !== qNorm);
  ok('case 4: the sitting has a mid-sitting non-opener line to duplicate',
    midIdx >= 0, `themNorm=${JSON.stringify(themNorm.map(d => d.slice(0, 40)))}`);
  if (midIdx >= 0) {
    const midLine = themNorm[midIdx];
    const themNorm4 = themNorm.concat([midLine]);
    const dupes4 = driverDupes(themNorm4);
    const split4 = splitVerbatimDupes(dupes4, themNorm4, A.openerCount, 1);
    ok('case 4: the mid-sitting duplicate is real, not exempt',
      split4.real.includes(midLine) && !split4.exempted.includes(midLine),
      `real=${JSON.stringify(split4.real.map(d => d.slice(0, 60)))} exempted=${JSON.stringify(split4.exempted.map(d => d.slice(0, 60)))}`);
    ok('case 4: the question stays exempted alongside it',
      split4.exempted.filter(d => d === qNorm).length === 1,
      `exempted=${JSON.stringify(split4.exempted.map(d => d.slice(0, 60)))}`);
  }

  // ---- CASE 5: a third speaking of the question still counts ----
  const themNorm5 = themNorm.concat([qNorm]);
  const dupes5 = driverDupes(themNorm5);
  ok('case 5: setup — the question now has two duplicate occurrences',
    dupes5.filter(d => d === qNorm).length === 2, `dupes5=${dupes5.filter(d => d === qNorm).length}`);
  const split5 = splitVerbatimDupes(dupes5, themNorm5, A.openerCount, 1);
  ok('case 5: only ONE occurrence is exempted, the extra counts as real',
    split5.exempted.filter(d => d === qNorm).length === 1 &&
    split5.real.filter(d => d === qNorm).length === 1,
    `exempted=${split5.exempted.filter(d => d === qNorm).length} real=${split5.real.filter(d => d === qNorm).length}`);

  // ---- CASE 6: inputs are never mutated ----
  const dupesBefore = JSON.stringify(dupes);
  const themBefore = JSON.stringify(themNorm);
  splitVerbatimDupes(dupes, themNorm, A.openerCount, 1);
  ok('case 6: inputs unchanged after the call',
    JSON.stringify(dupes) === dupesBefore && JSON.stringify(themNorm) === themBefore);

  // ---- CASE 7: edge inputs ----
  const split7a = splitVerbatimDupes([], themNorm, A.openerCount, 1);
  ok('case 7a: empty dupes -> empty partition',
    split7a.real.length === 0 && split7a.exempted.length === 0);
  const split7b = splitVerbatimDupes([qNorm], [], A.openerCount, 1);
  ok('case 7b: a dupe with no transcript lines is real (firstIdx -1)',
    split7b.real.length === 1 && split7b.exempted.length === 0);

  console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
