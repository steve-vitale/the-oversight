'use strict';
// test-journey-scale-r206-analyzer-20261115.js -- r206 analyzer proof
// (runs the REAL r206 analyzer on synthetic corpora in a temp dir; no
// driver needed). The analyzer reads vetbar/trust JSONs, natgate txt,
// raisetalk files, capture + betray watch per seed.
//
// Cases:
//   (1) national 1/4 (seed 135501 nat=1 from d95) + per-seed blockers
//       named on the other three -> Q1 NATIONAL GO, exit 0.
//   (2) national 0/4, every seed with a named blocker (COLLAPSE d59,
//       LEAD 2/3, TRADE 1/3) -> Q1 NATIONAL NO-GO-on-the-wall with the
//       blocker named, exit 0 (guards hold; the wall is a measurement).
//   (3) a not-offered-spoken raise talk -> DEFECT, exit 1.
//   (4) a vetbar readiness/ladder disagreement -> NO-GO, exit 1.
//   (5) no raise talks in the band -> INCOMPLETE, exit 2.
//   (6) lived-days total outside +/-25% of the r204 band's 419 ->
//       guardrail BREACH, exit 1.
//   (7) a natgate file missing on one seed -> ERROR row printed, exit 0
//       (guards hold; the pilot gates own corpus completeness).
//   (8) a -nv transcript with the pre-talk line first and the header on
//       line 1, mime shown and answered -> trap HOLD and the villager
//       named from the header (not the filename).
//   (9) a -nv transcript with a mime shown, offered, never answered ->
//       trap guard BREACH, exit 1.
//   (12) a -nv transcript with 4x consecutive nv:nod -> nod-loop guard
//       BREACH, exit 1 (the Mariko r197 shape; r132 fix re-proof).
//   (13) a -nv transcript with 2x consecutive nv:nod -> nod guard HOLD,
//       exit 0 (the r132 thin-out arms after the 2nd identical gesture).
//   (14) a -nv transcript with 4x consecutive nv:listen -> exit 0
//       (listen progresses and is excluded from the streak guard).
//   (15) a tribute ready d90, 51 attempts all veterans-short,
//       payable=1 at ready -> READY-UNPAYABLE (the M23 shape), exit 0.
//   (16) a tribute delivered d96, 1/1 ok, payable=2 -> DELIVERED, exit 0.
//   (17) a tribute that never readies -> NEVER-READY, exit 0.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const ANALYZER = path.join(__dirname, 'analyze-journey-scale-r206-20261115.js');
const SEEDS = [135501, 135502, 135503, 135504];
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
  fs.writeFileSync(path.join(dir, `journey-scale-r206-vetbar-${seed}.json`), JSON.stringify(vb));
  const tr = { census: {
    day: spec.days, over: !!spec.over, won: false, popAlive: 8, popTotal: 8,
    ladderChain: { peakStage: spec.peakStage, stage3Day: spec.stage3Day, seatLesserDay: spec.lesserDay, seatFullDay: null, capstoneReady: {}, capstoneDelivered: null, fights: 40, fightsByWave: { 4: 30 } },
    deathCensus: { deaths: 5, byCause: { combat: 5 }, booksClose: true, unattributed: 0, teleOnly: 0 },
    scaleRank: spec.rank,
  } };
  fs.writeFileSync(path.join(dir, `journey-scale-r206-trust-${seed}.json`), JSON.stringify(tr));
  if (spec.natgate) fs.writeFileSync(path.join(dir, `journey-scale-r206-natgate-${seed}.txt`), natgateLines(spec.natgate));
  fs.writeFileSync(path.join(dir, `journey-scale-r206-capture-${seed}.txt`), '');
  fs.writeFileSync(path.join(dir, `journey-scale-r206-betray-${seed}.txt`), '');
  if (spec.raiseOutcome === 'accepted') {
    fs.writeFileSync(path.join(dir, `journey-scale-r206-raisetalk-${seed}-1.txt`),
      `seed ${seed} talk 1 outcome accepted\n` +
      `THEM: "I've heard good things about Stonebridge. We should link with them — we'd be stronger together."\n` +
      `YOU: "All right. Let's ask them."\n`);
  } else if (spec.raiseOutcome === 'not-offered-spoken') {
    fs.writeFileSync(path.join(dir, `journey-scale-r206-raisetalk-${seed}-1.txt`),
      `seed ${seed} talk 1 outcome not-offered\n` +
      `THEM: "I've heard good things about Stonebridge. We should link with them — we'd be stronger together."\n` +
      `THEM: "Right. Go on, then."\n`);
  }
  if (spec.tribute) {
    // Tribute fixture: ladderevents DELIVER lines (one per attempt,
    // the first `delivered` of them ok=1) + scholarcount daily rows
    // (trib ready from readyDay, payable fixed at payableAtReady).
    const t = spec.tribute;
    const evLines = [];
    for (let i = 0; i < t.attempts; i++) {
      evLines.push(`d${t.readyDay + i} DELIVER military_tribute ok=${i < t.delivered ? 1 : 0} reason=${i < t.delivered ? 'none' : 'veterans-short'}`);
    }
    fs.writeFileSync(path.join(dir, `journey-scale-r206-ladderevents-${seed}.txt`), evLines.join('\n'));
    const scLines = [];
    for (let d = 1; d <= spec.days; d++) {
      const ready = t.readyDay != null && d >= t.readyDay;
      scLines.push(`d${d} new=${ready ? 2 : 1} legacy=${ready ? 2 : 1} payable=${t.payableAtReady} trib=${ready ? 'ready' : 'veterans-short'} delivered=${t.delivered > 0 && d >= t.readyDay + t.delivered - 1 ? 'military_tribute' : '-'}`);
    }
    fs.writeFileSync(path.join(dir, `journey-scale-r206-scholarcount-${seed}.txt`), scLines.join('\n'));
  }
  if (spec.nvTranscript) {
    const nv = spec.nvTranscript;
    fs.writeFileSync(path.join(dir, `journey-scale-r206-transcript-${seed}-day90-nv.txt`),
      `(pre-talk seed: none; takenWantDay=0; convoCount=14)\n` +
      `=== seed ${seed} day 90 — conversation with ${nv.name} (${nv.vid}) ===\n` +
      `occupation=blacksmith temperament=steady trust=90 dead=false\n` +
      `want: none (stage 0)\n` +
      `open thread: nonverbal fromSeed=false\n` +
      `picker: control\n\n` +
      `THEM: ${nv.name} speaks only Polish. No shared words at all — just eyes, hands, and patience.\n` +
      (nv.mime ? `(They mime walking — come with me, they seem to say.)\n` : ``) +
      `(turn0 choices: nv:accept, nv:decline, nv:nod, leave)\n` +
      (nv.streak ? Array.from({ length: nv.streak.count }, () => `YOU: [nv:${nv.streak.gesture}] (${nv.streak.gesture} again)\n`).join('') :
        (nv.answered ? `YOU: [nv:accept] (nod and follow)\n` : `YOU: [nv:nod] (nod slowly)\n`)));
  }
  if (spec.dayTranscript) {
    // A REGULAR day90 transcript (not -nv) whose thread is nonverbal:
    // the trap guard must count it too (r206 fix — Boris 135502 d90).
    const nv = spec.dayTranscript;
    fs.writeFileSync(path.join(dir, `journey-scale-r206-transcript-${seed}-day90.txt`),
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
    // the Baraka re-check map (r197 fix — the broadened glob would
    // otherwise count English-speaking villagers as comm-'none').
    const v = spec.verbalTranscript;
    fs.writeFileSync(path.join(dir, `journey-scale-r206-transcript-${seed}-day120.txt`),
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
  // Lived-days total 141+109+102+67 = 419 = +0.0% vs the r204 band's
  // 419, inside the +/-25% guardrail (HOLD). The days reuse r204's
  // actual band (alive d141, over d109/d102, scattered d67).
  return {
    135501: { days: 141, over: false, rank: 'national', peakStage: 3, stage3Day: 95, lesserDay: 100, raiseOutcome: 'accepted',
      natgate: { lastDay: 141, firstNat: 95, lead: [3, 3], cov: [0, 1], trade: [0, 0] } },
    135502: { days: 109, over: false, rank: 'regional', peakStage: 3, stage3Day: 100, lesserDay: 105, raiseOutcome: 'accepted',
      natgate: { lastDay: 109, firstNat: null, lead: [2, 3], cov: [1, 2], trade: [0, 1], pend: 'lead@120' } },
    135503: { days: 102, over: true, rank: 'regional', peakStage: 2, stage3Day: null, lesserDay: 100, raiseOutcome: null,
      natgate: { lastDay: 102, firstNat: null, lead: [1, 2], cov: [0, 1], trade: [1, 3] } },
    135504: { days: 67, over: true, rank: 'village', peakStage: 1, stage3Day: null, lesserDay: null, raiseOutcome: null,
      natgate: { lastDay: 67, firstNat: null, lead: [0, 0], cov: [0, 0], trade: [0, 0] } },
  };
}
function buildCorpus(mut) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'r206-analyzer-'));
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
  ok('(1) collapse blocker named for 135504', /135504: .*COLLAPSE — village over d67 before national \(final: LEAD 0\/3 seasoned, COV 0\/3, TRADE 0\/3\)/.test(r.out), r.out);
  ok('(1) LEAD blocker named for 135502', /135502: .*closest road LEAD 2\/3 seasoned/.test(r.out), r.out);
  ok('(1) raise guard GO', /Q1 SPOKEN-RAISE VERDICT: GO/.test(r.out), r.out);
}
// (2) national 0/4, blockers named -> NO-GO-on-the-wall, exit 0.
{
  const dir = buildCorpus((s) => {
    s[135501].natgate.firstNat = null; s[135501].natgate.lead = [2, 3];
    s[135501].rank = 'regional';
  });
  const r = runAnalyzer(dir);
  ok('(2) national 0/4 with blockers exit 0', r.code === 0, 'code=' + r.code);
  ok('(2) Q1 NATIONAL NO-GO-on-the-wall printed', /Q1 NATIONAL: NO-GO on the wall, blocker named per seed/.test(r.out), r.out);
}
// (3) not-offered-spoken raise talk -> DEFECT, exit 1.
{
  const dir = buildCorpus((s) => { s[135503].raiseOutcome = 'not-offered-spoken'; });
  const r = runAnalyzer(dir);
  ok('(3) raise defect exit 1', r.code === 1, 'code=' + r.code);
  ok('(3) DEFECT line printed', /DEFECT: journey-scale-r206-raisetalk-135503-1\.txt \(not-offered-spoken/.test(r.out), r.out);
}
// (4) vetbar disagreement -> NO-GO, exit 1.
{
  const dir = buildCorpus((s) => { s[135502].vetbarDisagree = true; });
  const r = runAnalyzer(dir);
  ok('(4) vetbar disagreement exit 1', r.code === 1, 'code=' + r.code);
  ok('(4) VETBAR NO-GO printed', /Q3 VETBAR GUARD: NO-GO/.test(r.out), r.out);
}
// (5) no raise talks -> INCOMPLETE, exit 2.
{
  const dir = buildCorpus((s) => { s[135501].raiseOutcome = null; s[135502].raiseOutcome = null; });
  const r = runAnalyzer(dir);
  ok('(5) no raise talks exit 2', r.code === 2, 'code=' + r.code);
  ok('(5) INCOMPLETE printed', /Q1 SPOKEN-RAISE VERDICT: INCOMPLETE/.test(r.out), r.out);
}
// (6) lived-days breach -> exit 1.
{
  const dir = buildCorpus((s) => { s[135501].days = 40; s[135502].days = 40; s[135503].days = 40; s[135504].days = 40; });
  const r = runAnalyzer(dir);
  ok('(6) lived-days breach exit 1', r.code === 1, 'code=' + r.code);
  ok('(6) guardrail BREACH printed', /lived-days guardrail: BREACH/.test(r.out), r.out);
}
// (7) natgate missing on one seed -> ERROR row, exit 0.
{
  const dir = buildCorpus((s) => { s[135503].natgate = null; });
  const r = runAnalyzer(dir);
  ok('(7) missing natgate exit 0', r.code === 0, 'code=' + r.code);
  ok('(7) ERROR row printed', /seed 135503: ERROR \(no natgate file\)/.test(r.out), r.out);
}
// (8) -nv transcript: pre-talk line first, header on line 1, mime shown
// and answered -> trap HOLD, villager named (not the filename).
{
  const dir = buildCorpus((s) => { s[135502].nvTranscript = { name: 'Boris', vid: 'boris_kowalski', mime: true, answered: true }; });
  const r = runAnalyzer(dir);
  ok('(8) -nv mime answered exit 0', r.code === 0, 'code=' + r.code);
  ok('(8) trap guard HOLD', /Q4 TRAP-LINE GUARD: HOLD/.test(r.out), r.out);
  ok('(8) villager named from header, not filename', /Boris \(boris_kowalski\): mime shown=yes, answered=yes/.test(r.out), r.out);
}
// (9) -nv transcript: mime shown, offered, never answered -> guard BREACH.
{
  const dir = buildCorpus((s) => { s[135503].nvTranscript = { name: 'Boris', vid: 'boris_kowalski', mime: true, answered: false }; });
  const r = runAnalyzer(dir);
  ok('(9) -nv mime unanswered exit 1', r.code === 1, 'code=' + r.code);
  ok('(9) trap guard BREACH printed', /Q4 TRAP-LINE GUARD: BREACH/.test(r.out), r.out);
}
// (10) REGULAR day90 transcript (not -nv) with a mime shown and answered
// -> the trap guard counts it (r197 fix — the Boris 135302 d90 shape).
{
  const dir = buildCorpus((s) => { s[135501].dayTranscript = { name: 'Boris', vid: 'boris_kowalski', mime: true, answered: true }; });
  const r = runAnalyzer(dir);
  ok('(10) regular-transcript mime counted exit 0', r.code === 0, 'code=' + r.code);
  ok('(10) trap sittings 1 answered 1', /trap-line sittings \(driver transcripts\): 1 \(answered 1, defect 0\)/.test(r.out), r.out);
  ok('(10) trap guard HOLD', /Q4 TRAP-LINE GUARD: HOLD/.test(r.out), r.out);
}
// (11) a VERBAL sitting (open thread: want) must not enter the Baraka
// re-check map — only nonverbal sittings count as comm-'none'.
{
  const dir = buildCorpus((s) => {
    s[135502].nvTranscript = { name: 'Boris', vid: 'boris_kowalski', mime: true, answered: true };
    s[135501].verbalTranscript = { name: 'Miguel', vid: 'miguel_santos' };
  });
  const r = runAnalyzer(dir);
  ok('(11) verbal sitting excluded exit 0', r.code === 0, 'code=' + r.code);
  ok('(11) Baraka map counts 1 villager', /comm-'none' villagers seen in driver transcripts: 1/.test(r.out), r.out);
  ok('(11) Miguel not in the Baraka map', !/Miguel \(miguel_santos\): mime/.test(r.out), r.out);
  ok('(11) Boris in the Baraka map', /Boris \(boris_kowalski\): mime shown=yes, answered=yes/.test(r.out), r.out);
}

// (12) -nv transcript: 4x consecutive nv:nod -> nod-loop BREACH, exit 1.
{
  const dir = buildCorpus((s) => { s[135503].nvTranscript = { name: 'Mariko', vid: 'mariko_tanaka', mime: false, answered: false, streak: { gesture: 'nod', count: 4 } }; });
  const r = runAnalyzer(dir);
  ok('(12) 4x nv:nod exit 1', r.code === 1, 'code=' + r.code);
  ok('(12) nod-loop BREACH printed', /Q2 NOD-LOOP GUARD: BREACH/.test(r.out), r.out);
  ok('(12) DEFECT line printed', /DEFECT: journey-scale-r206-transcript-135503-day90-nv\.txt \(nod-loop: 4x consecutive nv:nod\)/.test(r.out), r.out);
}
// (13) -nv transcript: 2x consecutive nv:nod -> nod guard HOLD, exit 0.
{
  const dir = buildCorpus((s) => { s[135503].nvTranscript = { name: 'Mariko', vid: 'mariko_tanaka', mime: false, answered: false, streak: { gesture: 'nod', count: 2 } }; });
  const r = runAnalyzer(dir);
  ok('(13) 2x nv:nod exit 0', r.code === 0, 'code=' + r.code);
  ok('(13) nod-loop HOLD printed', /Q2 NOD-LOOP GUARD: HOLD/.test(r.out), r.out);
  ok('(13) worst streak 2x reported', /worst 2x/.test(r.out), r.out);
}
// (14) -nv transcript: 4x consecutive nv:listen -> excluded, exit 0.
{
  const dir = buildCorpus((s) => { s[135503].nvTranscript = { name: 'Mariko', vid: 'mariko_tanaka', mime: false, answered: false, streak: { gesture: 'listen', count: 4 } }; });
  const r = runAnalyzer(dir);
  ok('(14) 4x nv:listen exit 0', r.code === 0, 'code=' + r.code);
  ok('(14) nod-loop HOLD printed', /Q2 NOD-LOOP GUARD: HOLD/.test(r.out), r.out);
}
// (15) tribute ready d90, 51 attempts all veterans-short, payable=1
// -> READY-UNPAYABLE (the M23 shape), exit 0 (measurement, no fail).
{
  const dir = buildCorpus((s) => { s[135501].tribute = { readyDay: 90, attempts: 51, delivered: 0, payableAtReady: 1 }; });
  const r = runAnalyzer(dir);
  ok('(15) ready-unpayable exit 0', r.code === 0, 'code=' + r.code);
  ok('(15) READY-UNPAYABLE printed', /seed 135501: tribute READY-UNPAYABLE \(ready=d90 payableAtReady=1 attempts=51 delivered=0 reasons=\{"veterans-short":51\}\)/.test(r.out), r.out);
}
// (16) tribute delivered d96, 1/1 ok, payable=2 -> DELIVERED, exit 0.
{
  const dir = buildCorpus((s) => { s[135502].tribute = { readyDay: 96, attempts: 1, delivered: 1, payableAtReady: 2 }; });
  const r = runAnalyzer(dir);
  ok('(16) delivered exit 0', r.code === 0, 'code=' + r.code);
  ok('(16) DELIVERED printed', /seed 135502: tribute DELIVERED \(ready=d96 payableAtReady=2 attempts=1 delivered=1 reasons=\{"none":1\}\)/.test(r.out), r.out);
}
// (17) tribute never readies (no tribute files at all) -> NEVER-READY, exit 0.
{
  const dir = buildCorpus();
  const r = runAnalyzer(dir);
  ok('(17) never-ready exit 0', r.code === 0, 'code=' + r.code);
  ok('(17) NEVER-READY printed for all seeds', /seed 135501: tribute NEVER-READY/.test(r.out) && /seed 135504: tribute NEVER-READY/.test(r.out), r.out);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
