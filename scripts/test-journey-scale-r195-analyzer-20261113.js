'use strict';
// test-journey-scale-r195-analyzer-20261113.js -- r195 analyzer proof
// (runs the REAL r195 analyzer on synthetic corpora in a temp dir; no
// driver needed). The analyzer reads vetbar/trust JSONs, natgate txt,
// raisetalk files, capture + betray watch per seed.
//
// Cases:
//   (1) national 1/4 (seed 135101 nat=1 from d95) + per-seed blockers
//       named on the other three -> Q1 NATIONAL GO, exit 0.
//   (2) national 0/4, every seed with a named blocker (COLLAPSE d59,
//       LEAD 2/3, TRADE 1/3) -> Q1 NATIONAL NO-GO-on-the-wall with the
//       blocker named, exit 0 (guards hold; the wall is a measurement).
//   (3) a not-offered-spoken raise talk -> DEFECT, exit 1.
//   (4) a vetbar readiness/ladder disagreement -> NO-GO, exit 1.
//   (5) no raise talks in the band -> INCOMPLETE, exit 2.
//   (6) lived-days total outside +/-25% of the r134 band's 471 ->
//       guardrail BREACH, exit 1.
//   (7) a natgate file missing on one seed -> ERROR row printed, exit 0
//       (guards hold; the pilot gates own corpus completeness).
//   (8) a -nv transcript with the pre-talk line first and the header on
//       line 1, mime shown and answered -> trap HOLD and the villager
//       named from the header (not the filename).
//   (9) a -nv transcript with a mime shown, offered, never answered ->
//       trap guard BREACH, exit 1.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const ANALYZER = path.join(__dirname, 'analyze-journey-scale-r195-20261113.js');
const SEEDS = [135101, 135102, 135103, 135104];
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function natgateLines(spec) {
  // spec: {lastDay, firstNat (null = never), lead:[s,a], cov:[s,a],
  // trade:[s,a], belong:'-' | 'X:t55/a0/age21/realm4/good1', pend:'-@-'}
  const lines = [];
  for (let d = 1; d <= spec.lastDay; d++) {
    const nat = (spec.firstNat != null && d >= spec.firstNat) ? 1 : 0;
    const rank = nat === 1 ? 'national' : (d >= 31 ? 'regional' : 'village');
    // Real natgate values are booleans (nat=true/false), not 0/1.
    lines.push(`d${d} rank=${rank} nat=${nat === 1 ? 'true' : 'false'} glob=false netLive=true netDay=28 rung=true exiled=false refused=false pend=${spec.pend || '-@-'} lead=${spec.lead[0]}/${spec.lead[1]} cov=${spec.cov[0]}/${spec.cov[1]} trade=${spec.trade[0]}/${spec.trade[1]} belong=${spec.belong || '-'} foreignMax=0 polities={"lead":null,"belong":null,"cov":null,"trade":null} defer={} view=0`);
  }
  return lines.join('\n');
}
function seedFiles(dir, seed, spec) {
  // spec: {days, over, rank, peakStage, stage3Day, lesserDay, vetbarDisagree,
  //   natgate (spec|null), raiseOutcome ('accepted'|'not-offered-spoken'|null)}
  const vb = { daily: [{ day: 1, r4: 2, l3: spec.vetbarDisagree ? 1 : 2, r5: 0, l4: 0, shadow4: 2, shadow5: 0, blooded: false }] };
  fs.writeFileSync(path.join(dir, `journey-scale-r195-vetbar-${seed}.json`), JSON.stringify(vb));
  const tr = { census: {
    day: spec.days, over: !!spec.over, won: false, popAlive: 8, popTotal: 8,
    ladderChain: { peakStage: spec.peakStage, stage3Day: spec.stage3Day, seatLesserDay: spec.lesserDay, seatFullDay: null, capstoneReady: {}, capstoneDelivered: null, fights: 40, fightsByWave: { 4: 30 } },
    deathCensus: { deaths: 5, byCause: { combat: 5 }, booksClose: true, unattributed: 0, teleOnly: 0 },
    scaleRank: spec.rank,
  } };
  fs.writeFileSync(path.join(dir, `journey-scale-r195-trust-${seed}.json`), JSON.stringify(tr));
  if (spec.natgate) fs.writeFileSync(path.join(dir, `journey-scale-r195-natgate-${seed}.txt`), natgateLines(spec.natgate));
  fs.writeFileSync(path.join(dir, `journey-scale-r195-capture-${seed}.txt`), '');
  fs.writeFileSync(path.join(dir, `journey-scale-r195-betray-${seed}.txt`), '');
  if (spec.raiseOutcome === 'accepted') {
    fs.writeFileSync(path.join(dir, `journey-scale-r195-raisetalk-${seed}-1.txt`),
      `seed ${seed} talk 1 outcome accepted\n` +
      `THEM: "I've heard good things about Stonebridge. We should link with them — we'd be stronger together."\n` +
      `YOU: "All right. Let's ask them."\n`);
  } else if (spec.raiseOutcome === 'not-offered-spoken') {
    fs.writeFileSync(path.join(dir, `journey-scale-r195-raisetalk-${seed}-1.txt`),
      `seed ${seed} talk 1 outcome not-offered\n` +
      `THEM: "I've heard good things about Stonebridge. We should link with them — we'd be stronger together."\n` +
      `THEM: "Right. Go on, then."\n`);
  }
  if (spec.nvTranscript) {
    const nv = spec.nvTranscript;
    fs.writeFileSync(path.join(dir, `journey-scale-r195-transcript-${seed}-day90-nv.txt`),
      `(pre-talk seed: none; takenWantDay=0; convoCount=14)\n` +
      `=== seed ${seed} day 90 — conversation with ${nv.name} (${nv.vid}) ===\n` +
      `occupation=blacksmith temperament=steady trust=90 dead=false\n` +
      `want: none (stage 0)\n` +
      `open thread: nonverbal fromSeed=false\n` +
      `picker: control\n\n` +
      `THEM: ${nv.name} speaks only Polish. No shared words at all — just eyes, hands, and patience.\n` +
      (nv.mime ? `(They mime walking — come with me, they seem to say.)\n` : ``) +
      `(turn0 choices: nv:accept, nv:decline, nv:nod, leave)\n` +
      (nv.answered ? `YOU: [nv:accept] (nod and follow)\n` : `YOU: [nv:nod] (nod slowly)\n`));
  }
  if (spec.dayTranscript) {
    // A REGULAR day90 transcript (not -nv) whose thread is nonverbal:
    // the trap guard must count it too (r195 fix — Boris 135102 d90).
    const nv = spec.dayTranscript;
    fs.writeFileSync(path.join(dir, `journey-scale-r195-transcript-${seed}-day90.txt`),
      `(pre-talk seed: none; takenWantDay=0; convoCount=13)\n` +
      `=== seed ${seed} day 90 — conversation with ${nv.name} (${nv.vid}) ===\n` +
      `occupation=blacksmith temperament=steady trust=90 dead=false\n` +
      `want: none (stage 0)\n` +
      `open thread: nonverbal fromSeed=false\n` +
      `picker: control\n\n` +
      `THEM: ${nv.name} speaks only Polish. No shared words at all — just eyes, hands, and patience.\n` +
      (nv.mime ? `(They mime walking — pointing at themselves, then at you, then toward the tree line. The meaning is unmistakable: come with me.)\n` : ``) +
      `(turn0 choices: nv:accept, nv:decline, nv:nod, nv:smile, nv:pointself, nv:listen, speak_back, leave)\n` +
      (nv.answered ? `YOU: [nv:accept] (follow their gesture — go with them)\n` : `YOU: [nv:nod] (nod slowly)\n`));
  }
  if (spec.verbalTranscript) {
    // A VERBAL day120 transcript (open thread: want): it must NOT enter
    // the Baraka re-check map (r195 fix — the broadened glob would
    // otherwise count English-speaking villagers as comm-'none').
    const v = spec.verbalTranscript;
    fs.writeFileSync(path.join(dir, `journey-scale-r195-transcript-${seed}-day120.txt`),
      `(pre-talk seed: none; takenWantDay=0; convoCount=1)\n` +
      `=== seed ${seed} day 120 — conversation with ${v.name} (${v.vid}) ===\n` +
      `occupation=dockworker temperament=intense trust=27 dead=false\n` +
      `want: curious (stage 1)\n` +
      `open thread: want fromSeed=false\n` +
      `picker: control\n\n` +
      `THEM: "What's something from your old life that's actually useful here?"\n` +
      `(turn0 choices: ans:q_before_skill:a_tell, leave, silence)\n` +
      `YOU: [ans:q_before_skill:a_tell] "Patience."\n`);
  }
}
function baseSpecs() {
  // Lived-days total 141+141+130+59 = 471 = the r134 band exactly.
  return {
    135101: { days: 141, over: false, rank: 'national', peakStage: 3, stage3Day: 95, lesserDay: 100, raiseOutcome: 'accepted',
      natgate: { lastDay: 141, firstNat: 95, lead: [3, 3], cov: [0, 1], trade: [0, 0] } },
    135102: { days: 141, over: false, rank: 'regional', peakStage: 3, stage3Day: 100, lesserDay: 105, raiseOutcome: 'accepted',
      natgate: { lastDay: 141, firstNat: null, lead: [2, 3], cov: [1, 2], trade: [0, 1], pend: 'lead@120' } },
    135103: { days: 130, over: true, rank: 'regional', peakStage: 2, stage3Day: null, lesserDay: 110, raiseOutcome: null,
      natgate: { lastDay: 130, firstNat: null, lead: [1, 2], cov: [0, 1], trade: [1, 3] } },
    135104: { days: 59, over: true, rank: 'village', peakStage: 1, stage3Day: null, lesserDay: null, raiseOutcome: null,
      natgate: { lastDay: 59, firstNat: null, lead: [0, 0], cov: [0, 0], trade: [0, 0] } },
  };
}
function buildCorpus(mut) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'r195-analyzer-'));
  const specs = baseSpecs();
  if (mut) mut(specs);
  for (const seed of SEEDS) seedFiles(dir, seed, specs[seed]);
  return dir;
}
function runAnalyzer(dir) {
  try {
    const out = execFileSync('node', [ANALYZER, dir], { encoding: 'utf8' });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: (e.stdout || '') + (e.stderr || '') };
  }
}

// (1) national 1/4 + blockers named -> GO, exit 0.
{
  const dir = buildCorpus();
  const r = runAnalyzer(dir);
  ok('(1) national 1/4 exit 0', r.code === 0, 'code=' + r.code + '\n' + r.out.slice(-600));
  ok('(1) Q1 NATIONAL GO printed', /Q1 NATIONAL: GO — on-ramp open \(1\/4/.test(r.out), r.out);
  ok('(1) collapse blocker named for 135104', /135104: .*COLLAPSE — village over d59 before national \(final: LEAD 0\/3 seasoned, COV 0\/3, TRADE 0\/3\)/.test(r.out), r.out);
  ok('(1) LEAD blocker named for 135102', /135102: .*closest road LEAD 2\/3 seasoned/.test(r.out), r.out);
  ok('(1) raise guard GO', /Q1 SPOKEN-RAISE VERDICT: GO/.test(r.out), r.out);
}
// (2) national 0/4, blockers named -> NO-GO-on-the-wall, exit 0.
{
  const dir = buildCorpus((s) => {
    s[135101].natgate.firstNat = null; s[135101].natgate.lead = [2, 3];
    s[135101].rank = 'regional';
  });
  const r = runAnalyzer(dir);
  ok('(2) national 0/4 with blockers exit 0', r.code === 0, 'code=' + r.code);
  ok('(2) Q1 NATIONAL NO-GO-on-the-wall printed', /Q1 NATIONAL: NO-GO on the wall, blocker named per seed/.test(r.out), r.out);
}
// (3) not-offered-spoken raise talk -> DEFECT, exit 1.
{
  const dir = buildCorpus((s) => { s[135103].raiseOutcome = 'not-offered-spoken'; });
  const r = runAnalyzer(dir);
  ok('(3) raise defect exit 1', r.code === 1, 'code=' + r.code);
  ok('(3) DEFECT line printed', /DEFECT: journey-scale-r195-raisetalk-135103-1\.txt \(not-offered-spoken/.test(r.out), r.out);
}
// (4) vetbar disagreement -> NO-GO, exit 1.
{
  const dir = buildCorpus((s) => { s[135102].vetbarDisagree = true; });
  const r = runAnalyzer(dir);
  ok('(4) vetbar disagreement exit 1', r.code === 1, 'code=' + r.code);
  ok('(4) VETBAR NO-GO printed', /Q3 VETBAR GUARD: NO-GO/.test(r.out), r.out);
}
// (5) no raise talks -> INCOMPLETE, exit 2.
{
  const dir = buildCorpus((s) => { s[135101].raiseOutcome = null; s[135102].raiseOutcome = null; });
  const r = runAnalyzer(dir);
  ok('(5) no raise talks exit 2', r.code === 2, 'code=' + r.code);
  ok('(5) INCOMPLETE printed', /Q1 SPOKEN-RAISE VERDICT: INCOMPLETE/.test(r.out), r.out);
}
// (6) lived-days breach -> exit 1.
{
  const dir = buildCorpus((s) => { s[135101].days = 40; s[135102].days = 40; s[135103].days = 40; s[135104].days = 40; });
  const r = runAnalyzer(dir);
  ok('(6) lived-days breach exit 1', r.code === 1, 'code=' + r.code);
  ok('(6) guardrail BREACH printed', /lived-days guardrail: BREACH/.test(r.out), r.out);
}
// (7) natgate missing on one seed -> ERROR row, exit 0.
{
  const dir = buildCorpus((s) => { s[135103].natgate = null; });
  const r = runAnalyzer(dir);
  ok('(7) missing natgate exit 0', r.code === 0, 'code=' + r.code);
  ok('(7) ERROR row printed', /seed 135103: ERROR \(no natgate file\)/.test(r.out), r.out);
}
// (8) -nv transcript: pre-talk line first, header on line 1, mime shown
// and answered -> trap HOLD, villager named (not the filename).
{
  const dir = buildCorpus((s) => { s[135102].nvTranscript = { name: 'Boris', vid: 'boris_kowalski', mime: true, answered: true }; });
  const r = runAnalyzer(dir);
  ok('(8) -nv mime answered exit 0', r.code === 0, 'code=' + r.code);
  ok('(8) trap guard HOLD', /Q4 TRAP-LINE GUARD: HOLD/.test(r.out), r.out);
  ok('(8) villager named from header, not filename', /Boris \(boris_kowalski\): mime shown=yes, answered=yes/.test(r.out), r.out);
}
// (9) -nv transcript: mime shown, offered, never answered -> guard BREACH.
{
  const dir = buildCorpus((s) => { s[135103].nvTranscript = { name: 'Boris', vid: 'boris_kowalski', mime: true, answered: false }; });
  const r = runAnalyzer(dir);
  ok('(9) -nv mime unanswered exit 1', r.code === 1, 'code=' + r.code);
  ok('(9) trap guard BREACH printed', /Q4 TRAP-LINE GUARD: BREACH/.test(r.out), r.out);
}
// (10) REGULAR day90 transcript (not -nv) with a mime shown and answered
// -> the trap guard counts it (r195 fix — the Boris 135102 d90 shape).
{
  const dir = buildCorpus((s) => { s[135101].dayTranscript = { name: 'Boris', vid: 'boris_kowalski', mime: true, answered: true }; });
  const r = runAnalyzer(dir);
  ok('(10) regular-transcript mime counted exit 0', r.code === 0, 'code=' + r.code);
  ok('(10) trap sittings 1 answered 1', /trap-line sittings \(driver transcripts\): 1 \(answered 1, defect 0\)/.test(r.out), r.out);
  ok('(10) trap guard HOLD', /Q4 TRAP-LINE GUARD: HOLD/.test(r.out), r.out);
}
// (11) a VERBAL sitting (open thread: want) must not enter the Baraka
// re-check map — only nonverbal sittings count as comm-'none'.
{
  const dir = buildCorpus((s) => {
    s[135102].nvTranscript = { name: 'Boris', vid: 'boris_kowalski', mime: true, answered: true };
    s[135101].verbalTranscript = { name: 'Miguel', vid: 'miguel_santos' };
  });
  const r = runAnalyzer(dir);
  ok('(11) verbal sitting excluded exit 0', r.code === 0, 'code=' + r.code);
  ok('(11) Baraka map counts 1 villager', /comm-'none' villagers seen in driver transcripts: 1/.test(r.out), r.out);
  ok('(11) Miguel not in the Baraka map', !/Miguel \(miguel_santos\): mime/.test(r.out), r.out);
  ok('(11) Boris in the Baraka map', /Boris \(boris_kowalski\): mime shown=yes, answered=yes/.test(r.out), r.out);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
