#!/usr/bin/env node
// Verbatim-repeat counter: exempt the deliberate re-pose, GREETING-OPENER
// shape — PROOF (journey-landing r139, 2026-11-16).
//
// Defect (r139 pilot, seed 1164 day 6, Henry): the sitting opens with a
// GREETING ("Can we talk?..." — openerCount 1) and the curious question
// ("Is there someone here you don't trust? Be honest.") is spoken on the
// NEXT turn, so its first occurrence sits at THEM index 1, NOT among the
// opener lines. The r138 opener rule (first occurrence index <
// openerCount) therefore misses the deliberate re-pose after the player
// takes the want-thread resume ("We never finished — who you don't
// trust.") and the counter reads a VERBATIM REPEAT for by-design
// behavior — the same false flag r137's re-poses got, in a new shape.
//
// Fix (driver-only instrument, zero src/js): the driver records, at each
// want-thread resume take, the THEM index the re-posed line will occupy
// (the current THEM count — the engine speaks the re-posed question as
// the very next THEM line after the take). The shared module
// scripts/landing-verbatim.js gains an optional 5th argument,
// reposeIndices: a duplicate occurrence is exempt when its occurrence
// index is one of the recorded indices ('repose' rule), alongside the
// unchanged R138 opener rule. At most one exemption per distinct line
// and one per recorded index.
//
// Cases — the re-pose sitting is REAL (scripted via startConvo/convoTurn,
// Henry shape: greeting opener -> react speaks the question -> deflect
// -> resume -> re-pose); the controls evaluate the shared function on
// that real transcript:
//   1. Real greeting-opener sitting: the re-posed question is exempted
//      via the 'repose' rule (exactly once), nothing else counts.
//      (The R138 opener rule does NOT fire for this shape — firstIdx
//      >= openerCount — so the exemption must come from reposeIndices.)
//   2. Control (same transcript, reposeIndices=[]): the question counts
//      as a real repeat — the exemption needs the recorded index.
//   3. Control (repose index pointing at a non-duplicate line): nothing
//      is exempted; the question counts as a real repeat.
//   4. Control (synthetic duplicate of a mid-sitting non-opener line,
//      with the real repose index present): that dupe is real, not
//      exempt; the question stays exempted.
//   5. Control (synthetic third speaking of the question): only 1
//      exempted, the extra counts as real.
//   6. Regression (synthetic Liam shape — question among the opener
//      lines, no reposeIndices): the R138 opener rule still exempts it
//      via 'opener'. (The full r138 proof test is the live regression
//      for this rule; this case pins the rule inside this test too.)
//   7. Guard: the shared function never mutates its inputs (dupes,
//      themNorm, reposeIndices).
//   8. Edge inputs: empty dupes -> empty partition; a dupe with no
//      transcript lines -> real; reposeIndices null -> R138 behavior.
//
// Seeded PRNG BEFORE module eval. Full production script list, minus
// DOM-only modules (same list as test-landing-r138-verbatim-repose-20261116).
//
// Usage: node scripts/test-landing-r139-verbatim-repose-greeting-20261116.js [SEED=...]

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
// Drive a sitting until the menu offers alive:thread:<tid> (bounded),
// capturing the repose index the R139 driver records: the THEM count
// just before the resume convoTurn — the index the re-posed line will
// occupy in the final transcript.
// (Walk copied from test-convo-want-resume-repose-20261115.js: the resume
// is suppressed while the beat thread IS the planted thread, and the
// plant fires when a topic ask moves the beat thread off it — so the walk
// is topic ask -> change subject -> resume.)
function takeResumeWithIndex(vid, tid, r0) {
  let r = r0;
  let moved = false;
  for (let turn = 0; turn < 12; turn++) {
    const choices = choicesOf(r, vid);
    const resume = (choices || []).find(x => x && x.id === 'alive:thread:' + tid);
    if (resume) {
      // R139 driver behavior, verbatim: the THEM count at take time.
      const reposeIdx = (Game.convoGet(vid).transcript || []).filter(e => e && e.who === 'them').length;
      const rr = Game.convoTurn(vid, resume.id);
      return { rr, reposeIdx };
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

  // ---- REAL re-pose sitting (Henry shape) ----
  // Find a curious villager whose question is NOT in the opener
  // transcript — the greeting-opener shape. The question is spoken on
  // the first engaging turn (dlg:react, the way the driver listens),
  // so its first occurrence lands AFTER the opener lines.
  let A = null;
  for (const vid of commAble) {
    try { Game.state.village.trust[vid] = 65; } catch (e) {}
    // Stage a talk request first: the Henry shape opens with THEIR reason
    // for coming to talk (the "Just... talk" greeting from talkReason),
    // and the curious question is spoken on a later turn — never as the
    // opener itself. Without the request, a fresh-game startConvo opens
    // with the question directly (the Liam shape).
    try {
      const v0 = Game.state.village;
      v0.talkRequests = v0.talkRequests || {};
      v0.talkRequests[vid] = { line: '"Can we talk?" __NAME__ sits down near you. "Just... talk. Like people used to."', day: Game.state.scholar.day };
    } catch (e) {}
    const r0 = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    if (r0.refused || !c.want || c.want.id !== 'curious') { Game.endConvo(vid, 'left'); continue; }
    // With a talk-request opener the question is NOT pending at open —
    // it surfaces on an engaging turn (react/more, 60% beat roll).
    // A pendingQ here means the opener WAS the question (Liam shape).
    if (c.pendingQ && c.pendingQ.id) { Game.endConvo(vid, 'left'); continue; }
    const openerCount = (c.transcript || []).filter(e => e && e.who === 'them').length;
    const qd0 = Game.convoQuestionDef((c.pendingQ && c.pendingQ.id) || '');
    // The question is not pending yet: drive engaging turns (react, then
    // more) until the want surfaces it, the way the driver listens.
    // dlg:react rolls a 60% thread beat and stops being offered after two
    // dead reacts in a row, so alternate react/more across a few turns.
    let rCur = r0;
    let foundQ = null;
    for (let t = 0; t < 8 && !foundQ; t++) {
      const ch = choicesOf(rCur, vid);
      const pick = (ch || []).find(x => x && x.id === 'dlg:react')
        || (ch || []).find(x => x && x.id === 'dlg:more');
      if (!pick) break;
      rCur = Game.convoTurn(vid, pick.id);
      if (rCur.ended) break;
      const cNow = Game.convoGet(vid);
      if (cNow.pendingQ && cNow.pendingQ.id) {
        const qdN = Game.convoQuestionDef(cNow.pendingQ.id);
        foundQ = { qid: cNow.pendingQ.id, qNorm: stripQuotes(String((qdN && qdN.q) || '')) };
      }
    }
    if (!foundQ) { Game.endConvo(vid, 'left'); continue; }
    const cAfter = Game.convoGet(vid);
    const themAfter = (cAfter.transcript || []).filter(e => e && e.who === 'them').map(e => stripQuotes(String(e.text || '')));
    if (!themAfter.includes(foundQ.qNorm)) { Game.endConvo(vid, 'left'); continue; }
    if (themAfter.indexOf(foundQ.qNorm) < openerCount) { Game.endConvo(vid, 'left'); continue; } // Liam shape, not Henry shape
    A = { vid, qid: foundQ.qid, openerCount, qNorm: foundQ.qNorm, rCur };
    console.log(`\n--- curious villager (Henry shape): ${vname(vid)} qid=${foundQ.qid} openerCount=${openerCount} ---`);
    console.log(`question spoken at THEM index ${themAfter.indexOf(foundQ.qNorm)}`);
    break;
  }
  ok('found a curious villager with a greeting opener (Henry shape)', !!A, 'none found — try another SEED');
  if (!A) { console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`); process.exit(1); }

  const qdA = Game.convoQuestionDef(A.qid);
  const qCoreA = String((qdA && qdA.q) || '').replace(/^"|"$/g, '').slice(0, 40);
  let r = Game.convoTurn(A.vid, 'deflect_q');
  if (r.line) console.log(`THEM: ${r.line}`);
  const took = takeResumeWithIndex(A.vid, 'want', r);
  ok('the resume choice was offered and taken', !!took, 'never offered');
  if (!took) { Game.endConvo(A.vid, 'left'); console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`); process.exit(1); }
  const resumeLine = String(took.rr.line || '');
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
  console.log(`\ntranscript THEM lines: ${themNorm.length}; openerCount=${A.openerCount}; dupes=${dupes.length}; reposeIdx=${took.reposeIdx}`);
  console.log(`question (normalized): ${qNorm.slice(0, 100)}`);
  ok('the real sitting carries the re-posed question as a duplicate',
    dupes.filter(d => d === qNorm).length === 1,
    `dupes=${JSON.stringify(dupes.map(d => d.slice(0, 60)))}`);
  const firstIdx = themNorm.indexOf(qNorm);
  ok('the question first occurs AFTER the opener lines (Henry shape)',
    firstIdx >= 0 && firstIdx >= A.openerCount, `firstIdx=${firstIdx} openerCount=${A.openerCount}`);
  ok('the recorded repose index lands on the re-posed occurrence',
    themNorm[took.reposeIdx] === qNorm && themNorm.indexOf(qNorm, firstIdx + 1) === took.reposeIdx,
    `reposeIdx=${took.reposeIdx} secondOccurrence=${themNorm.indexOf(qNorm, firstIdx + 1)}`);

  // ---- CASE 1: the repose rule exempts the re-pose ----
  const split1 = splitVerbatimDupes(dupes, themNorm, A.openerCount, 1, [took.reposeIdx]);
  ok('case 1: the re-posed question is exempted (exactly once)',
    split1.exempted.filter(d => d === qNorm).length === 1,
    `exempted=${JSON.stringify(split1.exempted.map(d => d.slice(0, 60)))}`);
  ok('case 1: the exemption came from the repose rule, not the opener rule',
    split1.exemptedBy[split1.exempted.indexOf(qNorm)] === 'repose',
    `exemptedBy=${JSON.stringify(split1.exemptedBy)}`);
  ok('case 1: the re-posed question is NOT counted as a real repeat',
    !split1.real.includes(qNorm), `real=${JSON.stringify(split1.real.map(d => d.slice(0, 60)))}`);
  ok('case 1: nothing else in this sitting counts as a real repeat',
    split1.real.length === 0,
    `real=${JSON.stringify(split1.real.map(d => d.slice(0, 80)))}`);

  // ---- CASE 2: no recorded repose index -> the same duplicate is real ----
  const split2 = splitVerbatimDupes(dupes, themNorm, A.openerCount, 1, []);
  ok('case 2: with reposeIndices=[] the question counts as a real repeat',
    split2.real.filter(d => d === qNorm).length === 1 && split2.exempted.length === 0,
    `real=${split2.real.length} exempted=${split2.exempted.length}`);

  // ---- CASE 3: a repose index on a non-duplicate line exempts nothing ----
  const split3 = splitVerbatimDupes(dupes, themNorm, A.openerCount, 1, [0]);
  ok('case 3: a repose index on a first occurrence exempts nothing',
    split3.real.filter(d => d === qNorm).length === 1 && split3.exempted.length === 0,
    `real=${split3.real.length} exempted=${split3.exempted.length}`);

  // ---- CASE 4: a mid-sitting non-opener repeat is real (repose present) ----
  const midIdx = themNorm.findIndex((l, i) => i >= A.openerCount && l && l !== qNorm);
  ok('case 4: the sitting has a mid-sitting non-opener line to duplicate',
    midIdx >= 0, `themNorm=${JSON.stringify(themNorm.map(d => d.slice(0, 40)))}`);
  if (midIdx >= 0) {
    const midLine = themNorm[midIdx];
    const themNorm4 = themNorm.concat([midLine]);
    const dupes4 = driverDupes(themNorm4);
    const split4 = splitVerbatimDupes(dupes4, themNorm4, A.openerCount, 1, [took.reposeIdx]);
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
  const split5 = splitVerbatimDupes(dupes5, themNorm5, A.openerCount, 1, [took.reposeIdx]);
  ok('case 5: only ONE occurrence is exempted, the extra counts as real',
    split5.exempted.filter(d => d === qNorm).length === 1 &&
    split5.real.filter(d => d === qNorm).length === 1,
    `exempted=${split5.exempted.filter(d => d === qNorm).length} real=${split5.real.filter(d => d === qNorm).length}`);

  // ---- CASE 6: R138 opener rule still works without reposeIndices ----
  const themNorm6 = [qNorm, 'Some other line entirely.', qNorm];
  const dupes6 = driverDupes(themNorm6);
  const split6 = splitVerbatimDupes(dupes6, themNorm6, 1, 1);
  ok('case 6: the opener rule still exempts a Liam-shape re-pose (no reposeIndices)',
    split6.exempted.filter(d => d === qNorm).length === 1 &&
    split6.exemptedBy[split6.exempted.indexOf(qNorm)] === 'opener' &&
    split6.real.length === 0,
    `exempted=${JSON.stringify(split6.exempted.map(d => d.slice(0, 60)))} exemptedBy=${JSON.stringify(split6.exemptedBy)} real=${split6.real.length}`);

  // ---- CASE 7: inputs are never mutated ----
  const dupesBefore = JSON.stringify(dupes);
  const themBefore = JSON.stringify(themNorm);
  const reposeBefore = JSON.stringify([took.reposeIdx]);
  splitVerbatimDupes(dupes, themNorm, A.openerCount, 1, [took.reposeIdx]);
  ok('case 7: inputs unchanged after the call',
    JSON.stringify(dupes) === dupesBefore && JSON.stringify(themNorm) === themBefore &&
    JSON.stringify([took.reposeIdx]) === reposeBefore);

  // ---- CASE 8: edge inputs ----
  const split8a = splitVerbatimDupes([], themNorm, A.openerCount, 1, [took.reposeIdx]);
  ok('case 8a: empty dupes -> empty partition',
    split8a.real.length === 0 && split8a.exempted.length === 0);
  const split8b = splitVerbatimDupes([qNorm], [], A.openerCount, 1, [took.reposeIdx]);
  ok('case 8b: a dupe with no transcript lines is real (no occurrence index)',
    split8b.real.length === 1 && split8b.exempted.length === 0);
  const split8c = splitVerbatimDupes(dupes, themNorm, A.openerCount, 1, null);
  ok('case 8c: reposeIndices null behaves like R138 (question real here)',
    split8c.real.filter(d => d === qNorm).length === 1 && split8c.exempted.length === 0,
    `real=${split8c.real.length} exempted=${split8c.exempted.length}`);

  console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
