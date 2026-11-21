// analyze-journey-scale-r248-20261121.js — journey-scale r248 analyzer
// (lane A, leg 3 SCALE, PLAYTEST leg — single arm). Reads the r248 panel
// corpus (ONE arm: control B = the r244/r245/r246 control policy verbatim,
// MUSTER_HOLD=sitting, STAGE_CAPSTONE=off, ANSWERMAIL off) and judges
// the prereg's binding questions from files, not from log memory:
//
//   Q1 THE PLAYTEST QUESTION: national /8, table offered (lesser seat
//     priced) /8, full seat /8, wave-4 fights/kills, wave-5 faced,
//     standing-199 stall (phantomDays5 — days the readiness gate holds
//     the village at the t5-1 cap), survival to 140d.
//     Verdict (panel, printed at the end, never sets the exit code):
//     INTERESTING iff national >= 3/8 OR a new blocker class (outside
//     the r245-observed set {TRUST-LOW, NATIONAL, SNAP, FORMATION-FEW,
//     FORMATION-LATE, COLLAPSE}) OR a taxonomy miss (UNKNOWN); else
//     QUIET — the wall stands as measured, the finding is the blocker
//     taxonomy. A fixable defect in the table-approach path is judged
//     by the coordinator in the run note, not by this verdict.
//   Q1 ANSWERMAIL (carried, INERT this run): answermail is OFF (r244
//     judged it NO-GO; the composition stays a branch). The section
//     still reads the ledgers the driver writes (null stats) and
//     prints zeros — proof the lever stayed off, not a verdict.
//   Q2 NATIONAL / DEED GATE + BLOCKER TAXONOMY (measurement, NOT a
//     gate): per seed, parse the natgate file — days with nat=1 (a
//     polity lives), max rank, and the final day's closest road
//     (lead/cov/trade seasoned counts, belong good flag, pending
//     shape). PLUS the blocker class for the closest road, from the
//     census links + the trust-events [formed] lines: COLLAPSE /
//     NATIONAL / FORMATION-FEW / SNAP / FORMATION-LATE / TRUST-LOW /
//     RUNG / UNKNOWN. The census also carries the deed gate
//     (capstoneReady / capstoneDelivered / seatFullDay). Never sets
//     fail by itself.
//   Q3 REGRESSION GUARDS (fail the run): r134 spoken-raise — 0
//     spoken-but-unanswerable raise talks AND >=1 properly-answered
//     talk. Vetbar — zero days where readiness veterans != ladder
//     veterans per wave 4 and wave 5. Trap-line — a mime shown with
//     no gesture answer at turn 0 is a regression. Betrayal sibling —
//     every turn-0 betrayal:accept offer must have its invite label
//     in the same sitting's opening THEM lines.
//   Q3 TRAJECTORY SHAPE: lived-days per-seed mean within +/-25% of the
//     control per-seed mean 123 (492/4 — r233's 8-seed band total 984/8);
//     lesser seat priced >=4/8.
//   SORTIE (r215-owed — INERT): the driver writes an empty sortie
//     ledger (the step never runs); the section prints lingerer days=0
//     by design. Any sortie rows are an instrument error, reported
//     here, never a fail. Measurement only — never sets fail.
//   Q5 SPOTTER: the d90 snapshot plus the end snapshot, per seed.
//   W5-INSTANCE (r207-owed): group wave-5 fights by monster entity
//     and name the shape: ONE, SUCCESSIVE, MIXED, or UNANSWERED.
//     Measurement only — never sets fail.
//   Q4 DAILY-PLAY MIME (read-only, carried): mimes shown in daily play
//     vs nv:accept/betrayal:accept taken in daily play, from the capture
//     + the betray watch. Verdict recorded, never a gate.
//   Q5 CENSUS: per-seed rollup (ladder stage, lesser/full seat,
//     national, deaths by cause, books close).
//   Q1 MUSTER (measurement only): per seed, the muster ledger + the
//     engine's own titan outcomes log + the verb-call log; the band
//     totals (wave-4 fights AND kills, living veterans, tribute,
//     national) and the cost read (lived-days, collapses, starvation,
//     committed blades who died). Verdict per the prereg's rule;
//     never sets fail. Single arm.
//   Q1 MARCH (measurement only): the march ledger + the outcomes log,
//     joined BY DAY with the one-day lag. Verdict per the prereg's
//     rule; never sets fail. Single arm.
//   Q1(a) REFUSAL SPAM, measurement only — per seed, 'refused'
//     outcomes in the titan outcomes log: total, distinct days, worst
//     day. NO BAR: outcomes are recorded on every refusal by design.
//   The guard sections (Q3) run on the single arm: a breach fails the
//   run (exit 1). INCOMPLETE (exit 2) iff the arm has no raise talks at
//   all and no breach — a breach dominates an incomplete. Q1 never
//   sets the exit code: a non-INTERESTING panel verdict is a run-level
//   QUIET the coordinator reads off the Q1 PLAYTEST PANEL VERDICT line,
//   not an analyzer failure.
//
// Usage: node scripts/analyze-journey-scale-r248-20261121.js [EVIDIR]
//   Single arm: the analyzer reads the arm-'b' (control) corpora from
//   EVIDIR (the dated dir, .../2026-11-21). EVIDIR defaults to
//   evidence/2026-11-21 (pass it explicitly; the default is only a
//   fallback).
// Exit 0 = GO (guards hold); exit 1 = NO-GO (a guard breached, a defect
// talk, or a missing/corrupt corpus); exit 2 = INCOMPLETE (no raise talks
// in the band — no wild evidence for the raise guard; the proof test is
// the evidence).
'use strict';

const fs = require('fs');
const path = require('path');
const EVIDIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, '..', '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-21');
const SEEDS = [103911, 103912, 103913, 103914, 103915, 103916, 103917, 103918];
const ROLLING_LIVED_DAYS = 492; // control per-seed mean 123 (492/4 — r233's 8-seed band total 984/8, rolled forward per r233's metric review; the stale 4-seed 119 is retired)
let fail = 0;
function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.log('MISSING/CORRUPT: ' + p + ' — ' + (e && e.message)); fail = 1; return null; }
}
function analyzeArm(arm) {
  let armIncomplete = false;
  const tributeStates = {};
  let livedTotal = 0;
  const rows = [];
  for (const seed of SEEDS) {
    const vb = readJson(path.join(EVIDIR, `journey-scale-r248-${arm}-vetbar-${seed}.json`));
    const tr = readJson(path.join(EVIDIR, `journey-scale-r248-${arm}-trust-${seed}.json`));
    if (!vb || !tr) { rows.push({ seed, error: true }); continue; }
    const daily = vb.daily || [];
    const disagree4 = daily.filter(r => r.r4 !== r.l3);
    const disagree5 = daily.filter(r => r.r5 !== r.l4);
    const ph4 = daily.filter(r => (r.shadow4 | 0) > (r.r4 | 0));
    const ph5 = daily.filter(r => (r.shadow5 | 0) > (r.r5 | 0));
    const maxR4 = daily.reduce((m, r) => Math.max(m, (r.r4 | 0)), 0);
    const maxL3 = daily.reduce((m, r) => Math.max(m, (r.l3 | 0)), 0);
    const maxR5 = daily.reduce((m, r) => Math.max(m, (r.r5 | 0)), 0);
    const maxL4 = daily.reduce((m, r) => Math.max(m, (r.l4 | 0)), 0);
    const bloodedDays = daily.filter(r => r.blooded).length;
    const c = tr.census || {};
    const lc = c.ladderChain || {};
    const dc = c.deathCensus || {};
    livedTotal += (c.day | 0);
    rows.push({
      seed, days: c.day, over: !!c.over, won: !!c.won, pop: (c.popAlive | 0) + '/' + (c.popTotal | 0),
      vetbarRows: daily.length, disagree4: disagree4.length, disagree5: disagree5.length,
      phantomDays4: ph4.map(r => r.day), phantomDays5: ph5.map(r => r.day),
      maxR4, maxL3, maxR5, maxL4, bloodedDays,
      peakStage: lc.peakStage, stage3Day: lc.stage3Day, lesserDay: lc.seatLesserDay, fullDay: lc.seatFullDay,
      capstoneReady: lc.capstoneReady, capstoneDelivered: lc.capstoneDelivered,
      fights: lc.fights, fightsByWave: lc.fightsByWave,
      w4kills: ((lc.killAttrEnd || {}).w4total | 0), // r239 metric review (r233): the ladder's fightsByWave['4'] counts FIGHTS; kills live in killAttrEnd.w4total
      deaths: dc.deaths, byCause: dc.byCause, booksClose: !!dc.booksClose,
      unattributed: dc.unattributed, teleOnly: dc.teleOnly,
      rank: c.scaleRank,
    });
  }
  console.log('=== journey-scale r248 arm ' + arm.toUpperCase() + ' — Q3 GUARD: VETBAR ===');
  for (const r of rows) {
    if (r.error) { console.log(`seed ${r.seed}: ERROR (corpus missing)`); continue; }
    console.log(`seed ${r.seed}: vetbarRows=${r.vetbarRows} disagree4=${r.disagree4} disagree5=${r.disagree5} phantomDays4=[${r.phantomDays4.join(',')}] phantomDays5=[${r.phantomDays5.join(',')}] maxR4=${r.maxR4} maxL3=${r.maxL3} maxR5=${r.maxR5} maxL4=${r.maxL4} bloodedDays=${r.bloodedDays}`);
  }
  const totalDis = rows.reduce((m, r) => m + ((r.disagree4 | 0) + (r.disagree5 | 0)), 0);
  console.log(`Q3 VETBAR GUARD: ${totalDis === 0 ? 'GO' : 'NO-GO'} (total disagreements ${totalDis})`);
  if (totalDis !== 0) fail = 1;
  console.log('\n=== journey-scale r248 arm ' + arm.toUpperCase() + ' — Q3 TRAJECTORY SHAPE ===');
  // r239: 8-seed panel — the guardrail compares the PER-SEED MEAN against
  // the control per-seed mean (492/4 = 123, r233's 8-seed band total
  // 984/8, rolled forward per r233's metric review); a 2-seed sum can
  // never reach a 4-seed rolling total, so the sum comparison would
  // breach on every 2-seed panel by construction.
  const livedMean = livedTotal / Math.max(1, SEEDS.length);
  const rollingMean = ROLLING_LIVED_DAYS / 4;
  console.log(`lived-days mean ${livedMean.toFixed(1)} (total ${livedTotal} over ${SEEDS.length} seeds) vs control per-seed mean ${rollingMean} (${(((livedMean - rollingMean) / rollingMean) * 100).toFixed(1)}%; guardrail +/-25%)`);
  const within = Math.abs(livedMean - rollingMean) / rollingMean <= 0.25;
  console.log(`Q3 lived-days guardrail: ${within ? 'HOLD' : 'BREACH'}`);
  const lesserCount = rows.filter(r => !r.error && r.lesserDay != null).length;
  console.log(`lesser seat priced: ${lesserCount}/8 (bar >=4/8): ${lesserCount >= 4 ? 'HOLD' : 'BREACH'}`);
  if (!within || lesserCount < 4) fail = 1;

  console.log('\n=== journey-scale r248 arm ' + arm.toUpperCase() + ' — Q1 NATIONAL ON-RAMP (measurement, not a gate) ===');
  // Per seed, parse journey-scale-r248-<arm>-natgate-${seed}.txt (driver line:
  //   d{day} rank={rank} nat={0|1} glob={0|1} netLive={0|1} netDay={n}
  //   rung={rungReady} pend={shape}@{day} lead={s}/{a} cov={s}/{a}
  //   trade={s}/{a} belong={other:t{trust}/a{arrears}/age{age}/realm{realm}/good{0|1}|-}
  //   ...). national = any nat=1 day (a polity lives, not just points).
  // Blocker (when natDays == 0) is diagnosed from the census + the FINAL
  // natgate line:
  //   - village OVER (dead/scattered) before national: COLLAPSE — the
  //     frozen road state is detail, not the cause (a dead village's
  //     links can never season).
  //   - alive past d60: the closest road by seasoned count, and what it
  //     lacks (3 - seasoned more seasoned links; active count shows
  //     whether links exist but are unseasoned/low-trust); pending shape
  //     named when a road is staged but unsealed; belong good flag named.
  //   - alive but last natgate day < 60: COLLAPSE before the national
  //     window (should not happen — the pilot gates catch short corpora).
  // A seed with no natgate file at all is an ERROR row (corpus gap — the
  // pilot gates should have caught it; it does not set fail here).
  const RANK_ORDER = ['village', 'regional', 'national', 'global'];
  let nationalCount = 0, natRowsMissing = 0;
  const natDiag = [];
  for (const seed of SEEDS) {
    let text = '';
    try { text = fs.readFileSync(path.join(EVIDIR, `journey-scale-r248-${arm}-natgate-${seed}.txt`), 'utf8'); } catch (e) { text = ''; }
    const lines = text.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) { natRowsMissing += 1; natDiag.push({ seed, error: true }); console.log(`seed ${seed}: ERROR (no natgate file)`); continue; }
    let natDays = 0, firstNat = null, maxRankIdx = 0, lastDay = 0, last = '';
    for (const l of lines) {
      // Real natgate values are booleans (nat=true/false), not 0/1 — the
      // first r207 analyzer draft matched nat=(\d) and parsed nothing.
      const m = l.match(/^d(\d+) rank=(\S+) nat=(true|false|1|0)/);
      if (!m) continue;
      const day = parseInt(m[1], 10), rank = m[2], nat = (m[3] === 'true' || m[3] === '1') ? 1 : 0;
      lastDay = day; last = l;
      const ri = RANK_ORDER.indexOf(rank);
      if (ri > maxRankIdx) maxRankIdx = ri;
      if (nat === 1) { natDays += 1; if (firstNat === null) firstNat = day; }
    }
    const lm = last.match(/lead=(\d+)\/(\d+)/) || [];
    const cm = last.match(/cov=(\d+)\/(\d+)/) || [];
    const tm = last.match(/trade=(\d+)\/(\d+)/) || [];
    const bm = last.match(/belong=(\S+)/) || [];
    const pm = last.match(/pend=(\S+)/) || [];
    const leadS = parseInt(lm[1] || '0', 10), leadA = parseInt(lm[2] || '0', 10);
    const covS = parseInt(cm[1] || '0', 10), covA = parseInt(cm[2] || '0', 10);
    const tradeS = parseInt(tm[1] || '0', 10), tradeA = parseInt(tm[2] || '0', 10);
    const belongGood = /\/good1$/.test(bm[1] || '');
    const pend = pm[1] || '-@-';
    let blocker = null;
    const censusRow = rows.find(r => r.seed === seed);
    if (natDays === 0) {
      if (censusRow && censusRow.over) {
        // The village ended before national — death/scatter is the binding
        // constraint, not the frozen road state (a dead village's links
        // can never season). The final road state is detail, not the cause.
        blocker = `COLLAPSE — village over d${censusRow.days} before national (final: LEAD ${leadS}/3 seasoned, COV ${covS}/3, TRADE ${tradeS}/3${pend !== '-@-' ? ', pending ' + pend : ''})`;
      } else if (lastDay < 60) {
        blocker = `COLLAPSE before the national window (last natgate day d${lastDay})`;
      } else {
        const roads = [['LEAD', leadS, leadA], ['COVENANT', covS, covA], ['TRADE', tradeS, tradeA]];
        roads.sort((a, b) => b[1] - a[1]);
        const best = roads[0];
        const parts = [];
        parts.push(`closest road ${best[0]} ${best[1]}/3 seasoned (${best[2]} active) — needs ${3 - best[1]} more seasoned`);
        if (best[1] === 0 && leadA + covA + tradeA === 0) parts.push('no active links on any road');
        if (pend !== '-@-') parts.push(`pending ${pend}`);
        if (bm[1] && bm[1] !== '-') parts.push(`belong ${belongGood ? 'GOOD' : 'not good'} (${bm[1]})`);
        blocker = parts.join('; ');
      }
    }
    if (natDays > 0) nationalCount += 1;
    natDiag.push({ seed, natDays, firstNat, maxRank: RANK_ORDER[maxRankIdx], lastDay, leadS, leadA, covS, covA, tradeS, tradeA, belongGood, pend, blocker });
    console.log(`seed ${seed}: national days=${natDays}${firstNat == null ? '' : ' (first d' + firstNat + ')'} maxRank=${RANK_ORDER[maxRankIdx]} lastDay=d${lastDay} lead=${leadS}/${leadA} cov=${covS}/${covA} trade=${tradeS}/${tradeA} belongGood=${belongGood ? 1 : 0} pend=${pend}${blocker ? ' — BLOCKER: ' + blocker : ''}`);
  }
  if (natRowsMissing === SEEDS.length) {
    console.log('Q1 NATIONAL: INCOMPLETE (no natgate file on any seed — nothing to judge)');
  } else if (nationalCount >= 1) {
    console.log(`Q1 NATIONAL: GO — on-ramp open (${nationalCount}/8 seeds reached national)`);
  } else if (natDiag.every(d => d.error || d.blocker)) {
    console.log('Q1 NATIONAL: NO-GO on the wall, blocker named per seed (interesting — the finding is the blocker)');
  } else {
    console.log('Q1 NATIONAL: INCOMPLETE (0/8 national with no diagnosable constraint — document and move on)');
  }

  console.log('\n=== journey-scale r248 arm ' + arm.toUpperCase() + ' — Q5 CENSUS ===');
  for (const r of rows) {
    if (r.error) { console.log(`seed ${r.seed}: ERROR`); continue; }
    console.log(`seed ${r.seed}: days=${r.days} over=${r.over} won=${r.won} pop=${r.pop} rank=${r.rank} peakStage=${r.peakStage} stage3=${r.stage3Day == null ? '-' : 'd' + r.stage3Day} lesser=${r.lesserDay == null ? '-' : 'd' + r.lesserDay} full=${r.fullDay == null ? '-' : 'd' + r.fullDay} ready=${JSON.stringify(r.capstoneReady)} delivered=${r.capstoneDelivered ? (r.capstoneDelivered.kind + '@d' + r.capstoneDelivered.day) : '-'} fights=${r.fights} byWave=${JSON.stringify(r.fightsByWave)} w4kills=${r.w4kills} deaths=${r.deaths} byCause=${JSON.stringify(r.byCause)} booksClose=${r.booksClose} unattributed=${r.unattributed} teleOnly=${r.teleOnly}`);
  }

  console.log('\n=== journey-scale r248 arm ' + arm.toUpperCase() + ' — Q1 SPOKEN-RAISE (not-offered split) ===');
  // Q1 classifier (prereg): the raisetalk file's header carries the policy's
  // outcome ('accepted' | 'counter' | 'not-offered' | 'talk-failed' |
  // 'error'). The split is on whether the raise line is in the transcript:
  //   not-offered + raise SPOKEN  = DEFECT (heard, never offered an answer
  //     — the Henry 133101 shape the r197 fix addresses).
  //   not-offered + raise UNSPOKEN = correct r132 hold (never heard, never
  //     offered — the bookkeeping survives, the human moment was never there).
  //   accepted (+ the accept YOU line after the raise) = properly answered.
  //   counter = a proper counter (the village countered the proposal).
  //   talk-failed / error = reported, not a defect (the sitting never opened).
  // The Claudete guard also stays: an accept YOU line with the raise never
  // spoken before it is a defect whatever the outcome field says.
  const RAISE_LINE = /We should link with .* — we'd be stronger together\./;
  const ACCEPT_LINE = /^YOU: "All right\. Let's ask them\."$/;
  let talkTotal = 0, defectTalks = [], properTalks = 0, notOfferedSpoken = 0, notOfferedUnspoken = 0, counters = 0, failed = 0;
  for (const seed of SEEDS) {
    let files = [];
    try { files = fs.readdirSync(EVIDIR).filter(f => f.startsWith(`journey-scale-r248-${arm}-raisetalk-${seed}-`) && f.endsWith('.txt')).sort(); } catch (e) { files = []; }
    for (const f of files) {
      let text = '';
      try { text = fs.readFileSync(path.join(EVIDIR, f), 'utf8'); } catch (e) { continue; }
      const header = (text.split('\n')[0] || '');
      const outcome = (header.match(/outcome (\S+)/) || [])[1] || '?';
      const lines = text.split('\n').slice(1).filter(l => l.trim() !== '');
      talkTotal += 1;
      let raiseSpoken = false, raiseSpokenBeforeAccept = false, acceptIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        if (/^THEM:/.test(l) && RAISE_LINE.test(l)) { raiseSpoken = true; if (acceptIdx === -1) raiseSpokenBeforeAccept = true; }
        if (ACCEPT_LINE.test(l.trim())) { acceptIdx = i; break; }
      }
      if (acceptIdx >= 0 && !raiseSpokenBeforeAccept) {
        defectTalks.push(`${f} (Claudete: accept at line ${acceptIdx + 1}, raise never spoken; outcome ${outcome})`);
      } else if (outcome === 'not-offered' && raiseSpoken) {
        notOfferedSpoken += 1;
        defectTalks.push(`${f} (not-offered-spoken: raise heard, no link:accept offered)`);
      } else if (outcome === 'not-offered') {
        notOfferedUnspoken += 1;
      } else if (outcome === 'accepted') {
        properTalks += 1;
      } else if (outcome === 'counter') {
        counters += 1;
      } else {
        failed += 1;
        console.log(`  note: ${f} outcome ${outcome} (talk-failed/error — reported, not a defect)`);
      }
    }
  }
  console.log(`raise talks: ${talkTotal} (properly-answered ${properTalks}, counter ${counters}, not-offered-spoken ${notOfferedSpoken} [DEFECT], not-offered-unspoken ${notOfferedUnspoken} [correct hold], failed/error ${failed}, defect ${defectTalks.length})`);
  for (const d of defectTalks) console.log('  DEFECT: ' + d);
  const q1go = defectTalks.length === 0 && properTalks >= 1;
  if (talkTotal === 0) {
    console.log('Q1 SPOKEN-RAISE VERDICT: INCOMPLETE (no raise talks in the band — no wild evidence; the proof test is the evidence)');
    armIncomplete = true;
  } else {
    console.log(`Q1 SPOKEN-RAISE VERDICT: ${q1go ? 'GO' : 'NO-GO'} (zero not-offered-spoken AND >=1 properly-answered talk)`);
    if (!q1go) fail = 1;
  }

  console.log('\n=== journey-scale r248 arm ' + arm.toUpperCase() + ' — Q4 GUARD: TRAP-LINE (r133 fix still live) ===');
  // A trap-line sitting is a -nv transcript whose opening shows the mime
  // ("(They mime walking — ...)"). It is a DEFECT sitting iff the mime was
  // shown and the turn-0 menu offered NO gesture answer (nv:accept /
  // nv:decline) — the Tarek/Mario shape. It is ANSWERED iff the policy
  // picked nv:accept or nv:decline in the sitting. The turn-0 choices line
  // is the offered menu; the YOU lines are the picks.
  const MIME_RX = /mime walking/;
  const NV_ANSWER_RX = /^YOU: \[(nv:accept|nv:decline)\]/;
  let trapTotal = 0, trapAnswered = 0, trapDefect = [];
  let mimeInCapture = 0;
  const mimeBySeed = {}; // Q2: per-seed {capture, nv} mime counts (daily-play estimate = capture - nv)
  // NOTE (r197 fix): the glob MUST cover both transcript classes. A
  // nonverbal-threaded sitting can land in the regular day90/day120 file
  // (Boris 135602 d90: mime shown, nv:accept taken, stockpile gifted —
  // the fix live in a driver sitting), while the -nv file holds only the
  // extra nonverbal sitting. The first r197 draft globbed *-nv.txt only
  // and reported SILENT on a band with a live answered mime.
  const TRAP_GLOB = (seed) => (f) => f.startsWith(`journey-scale-r248-${arm}-transcript-${seed}-day`) && f.endsWith('.txt');
  for (const seed of SEEDS) {
    let files = [];
    try { files = fs.readdirSync(EVIDIR).filter(TRAP_GLOB(seed)).sort(); } catch (e) { files = []; }
    let nvMimes = 0;
    for (const f of files) {
      let text = '';
      try { text = fs.readFileSync(path.join(EVIDIR, f), 'utf8'); } catch (e) { continue; }
      if (!MIME_RX.test(text)) continue;
      trapTotal += 1;
      nvMimes += 1;
      const lines = text.split('\n');
      const turn0 = lines.find(l => l.indexOf('(turn0 choices:') !== -1) || '';
      const offered = /nv:accept/.test(turn0) || /nv:decline/.test(turn0);
      const answered = lines.some(l => NV_ANSWER_RX.test(l.trim()));
      if (answered) trapAnswered += 1;
      if (!offered) trapDefect.push(`${f} (mime shown, no nv:accept/nv:decline at turn 0; choices: ${turn0.trim().slice(0, 160)})`);
      console.log(`  ${f}: mime shown, offered=${offered ? 'yes' : 'NO'}, answered=${answered ? 'yes' : 'no'}`);
    }
    try {
      const cap = fs.readFileSync(path.join(EVIDIR, `journey-scale-r248-${arm}-capture-${seed}.txt`), 'utf8');
      const capMimes = (cap.match(/mime walking/g) || []).length;
      mimeInCapture += capMimes;
      mimeBySeed[seed] = { capture: capMimes, nv: nvMimes };
    } catch (e) { mimeBySeed[seed] = { capture: 0, nv: nvMimes }; }
  }
  console.log(`trap-line sittings (driver transcripts): ${trapTotal} (answered ${trapAnswered}, defect ${trapDefect.length}); mimes anywhere in the say-capture: ${mimeInCapture}`);
  for (const d of trapDefect) console.log('  DEFECT: ' + d);
  if (trapTotal === 0) {
    // GUARD, not the r197 bar: no mime in the band means nothing to
    // regress-check — silent, not INCOMPLETE (Q1's evidence is the raise
    // talks, not the trap line).
    console.log('Q4 TRAP-LINE GUARD: SILENT (no mime shown in the band — nothing to regress-check)');
  } else {
    const guardGo = trapDefect.length === 0 && trapAnswered >= 1;
    console.log(`Q4 TRAP-LINE GUARD: ${guardGo ? 'HOLD' : 'BREACH'} (zero defect sittings AND >=1 answered sitting)`);
    if (!guardGo) fail = 1;
  }

  console.log('\n=== journey-scale r248 arm ' + arm.toUpperCase() + ' — Q2 DAILY-PLAY MIME (read-only) ===');
  // Q2 (read-only, never a gate): in DAILY play — not the driver's d90/d120
  // sittings — does a no-shared-words villager's mimed invitation ever get
  // answered now that r133's nv:accept exists? The daily-play chooser
  // (conversation-pages.js + per-policy pickTalkChoice, shared across lanes)
  // never takes betrayal:accept / nv:accept, so a mimed invite in daily play
  // is still left unanswered and re-mimed next sitting. Counts, from files:
  //   daily-play mimes ~= capture mimes - driver-sitting (-nv transcript)
  //     mimes. The capture collects say lines from the whole run (daily +
  //     driver); the -nv transcripts are the driver's nonverbal sittings.
  //     An estimate: the capture dedups consecutive identical lines.
  //   daily-play accepts: the betray watch is day-attributed, but its
  //     accept/nvaccept events are pushed ONLY from the driver's
  //     runConversation (d90/d120 + probe days) — so any accept event on a
  //     day OUTSIDE the driver days would be a daily-play accept (by
  //     construction this is 0; the watch cannot see daily play). The
  //     INDEPENDENT signal is the capture: resolveInvite walk lines ("You
  //     walk to ...", "It's quiet at ...", "shows you where they go to
  //     think", "Halfway to ... freezes", "the ground is torn up") — each
  //     accept that resolves via resolveInvite speaks exactly one (sick
  //     outcomes and armed ambushes do not). walkLines - driverAccepts is
  //     a LOWER bound on daily-play accepts: >0 proves daily accepts
  //     happened; 0 proves none (a daily accept could still hide behind a
  //     sick/ambush driver accept, but nothing in the capture shows one).
  //   Baraka re-check: the comm-'none' villagers seen in the -nv
  //     transcripts (name + vid from the transcript header) and their
  //     mime/answer status. No Baraka-like case = INCONCLUSIVE, as r130–r133
  //     (r134 found Nikolai, answered in the driver sitting).
  // Verdict recorded with the counts; no build claimed; no fail change.
  const CONVO_DAYS = [90, 120];
  const WALK_RX = /You walk to .* with |It's quiet at |shows you where they go to think|Halfway to .* freezes|the ground is torn up/;
  let dailyMimes = 0, driverAccepts = 0, dailyAcceptEvents = [], walkLines = 0;
  const nvVillagers = {}; // vid -> {name, mime, answered}
  for (const seed of SEEDS) {
    const mb = mimeBySeed[seed] || { capture: 0, nv: 0 };
    dailyMimes += Math.max(0, mb.capture - mb.nv);
    let capText = '';
    try { capText = fs.readFileSync(path.join(EVIDIR, `journey-scale-r248-${arm}-capture-${seed}.txt`), 'utf8'); } catch (e) {}
    walkLines += capText.split('\n').filter(l => WALK_RX.test(l)).length;
    let files = [];
    try { files = fs.readdirSync(EVIDIR).filter(TRAP_GLOB(seed)).sort(); } catch (e) { files = []; }
    for (const f of files) {
      let text = '';
      try { text = fs.readFileSync(path.join(EVIDIR, f), 'utf8'); } catch (e) { continue; }
      // Only NONVERBAL sittings belong in the Baraka re-check map: the
      // glob now covers both transcript classes, so a verbal sitting
      // (open thread: want) would otherwise inflate the count with
      // villagers who speak English. Nonverbal sittings carry
      // 'open thread: nonverbal'.
      if (!/open thread: nonverbal/.test(text)) continue;
      // The header is NOT line 0: the transcript opens with a pre-talk
      // line, the '=== seed … — conversation with NAME (vid) ===' header
      // is line 1. Scan for it (the first r197 draft read line 0 and fell
      // back to the filename as the villager's name).
      const hmLine = text.split('\n').find(l => /conversation with (.+) \(([^)]+)\)/.test(l)) || '';
      const hm = hmLine.match(/conversation with (.+) \(([^)]+)\)/);
      const nm = hm ? hm[1] : f, vid = hm ? hm[2] : f;
      const mime = MIME_RX.test(text);
      const answered = text.split('\n').some(l => NV_ANSWER_RX.test(l.trim()));
      if (!nvVillagers[vid]) nvVillagers[vid] = { name: nm, mime: false, answered: false };
      if (mime) nvVillagers[vid].mime = true;
      if (answered) nvVillagers[vid].answered = true;
    }
    try {
      const bet = fs.readFileSync(path.join(EVIDIR, `journey-scale-r248-${arm}-betray-${seed}.txt`), 'utf8');
      for (const l of bet.split('\n')) {
        const m = l.match(/^d(\d+) (accept|nvaccept) /);
        if (!m) continue;
        driverAccepts += 1;
        if (!CONVO_DAYS.includes(parseInt(m[1], 10))) dailyAcceptEvents.push(`${seed}: ${l.trim()}`);
      }
    } catch (e) {}
  }
  const dailyAcceptLower = Math.max(0, walkLines - driverAccepts);
  console.log(`daily-play mimes (capture minus driver sittings with mimes): ${dailyMimes} (capture ${mimeInCapture}, driver sittings with mimes ${trapTotal})`);
  console.log(`driver-sitting accepts (betray watch): ${driverAccepts}; accept events on non-driver days: ${dailyAcceptEvents.length}`);
  for (const d of dailyAcceptEvents) console.log('  DAILY ACCEPT: ' + d);
  console.log(`resolveInvite walk lines in capture: ${walkLines}; daily-play accept LOWER bound (walk lines minus driver accepts): ${dailyAcceptLower}`);
  console.log(`comm-'none' villagers seen in driver transcripts: ${Object.keys(nvVillagers).length}`);
  for (const vid of Object.keys(nvVillagers)) {
    const v = nvVillagers[vid];
    console.log(`  ${v.name} (${vid}): mime shown=${v.mime ? 'yes' : 'no'}, answered=${v.answered ? 'yes' : 'no'}`);
  }
  if (Object.keys(nvVillagers).length === 0) console.log('  Baraka re-check: INCONCLUSIVE (no comm-\'none\' villager in the band — no Baraka-like case, as r130–r133 (r134 found Nikolai, answered in the driver sitting)');
  console.log(`Q2 DAILY-PLAY MIME: RECORDED (read-only — daily mimes ${dailyMimes}, daily accepts proven ${dailyAcceptLower} by the capture lower bound, ${dailyAcceptEvents.length} off-day events in the betray watch; lane decision owed: teach the shared chooser to take betrayal:accept + nv:accept when offered, or keep proving fixes only where the driver looks)`);

  console.log('\n=== journey-scale r248 arm ' + arm.toUpperCase() + ' — Q4 GUARD: BETRAYAL SIBLING (invite label in the opening) ===');
  // Every turn-0 betrayal:accept offer in the d90/d120 transcripts must
  // have its invite label in the same sitting's opening THEM lines (the
  // lines before the first YOU pick — opener + the "(opening: N THEM
  // lines)" block the r207 driver logs). A label is one of the five
  // INVITE_DEFS labels. An offer with no label in the opening is a live
  // defect (answering an invitation never extended); an offer WITH the
  // label is the Thabo shape — honest, not a defect.
  const INVITE_LABEL_RX = /Walk with me\?|Help me haul something back\?|Come get air with me|Come see what I found|Walk my trap line with me\?/;
  let betrayOffers = 0, betrayDefect = [];
  for (const seed of SEEDS) {
    let files = [];
    try { files = fs.readdirSync(EVIDIR).filter(f => f.startsWith(`journey-scale-r248-${arm}-transcript-${seed}-day`) && f.endsWith('.txt')).sort(); } catch (e) { files = []; }
    for (const f of files) {
      let text = '';
      try { text = fs.readFileSync(path.join(EVIDIR, f), 'utf8'); } catch (e) { continue; }
      const lines = text.split('\n');
      const turn0Idx = lines.findIndex(l => l.indexOf('(turn0 choices:') !== -1);
      if (turn0Idx === -1) continue;
      if (!/betrayal:accept/.test(lines[turn0Idx])) continue;
      betrayOffers += 1;
      const opening = lines.slice(0, turn0Idx).filter(l => /^THEM:/.test(l)).join('\n');
      const hasLabel = INVITE_LABEL_RX.test(opening);
      console.log(`  ${f}: turn-0 betrayal:accept offered, invite label in opening=${hasLabel ? 'yes' : 'NO'}`);
      if (!hasLabel) betrayDefect.push(`${f} (betrayal:accept at turn 0, no invite label in the opening THEM lines)`);
    }
  }
  console.log(`betrayal turn-0 offers: ${betrayOffers} (defect ${betrayDefect.length})`);
  for (const d of betrayDefect) console.log('  DEFECT: ' + d);
  if (betrayDefect.length !== 0) fail = 1;
  console.log(`Q4 BETRAYAL GUARD: ${betrayDefect.length === 0 ? 'HOLD (no live defect; Thabo verdict stands)' : 'BREACH'}`);


  console.log('\n=== journey-scale r248 arm ' + arm.toUpperCase() + ' — Q2 GUARD: NOD-LOOP (r132 fix re-proof) ===');
  // A nod-loop sitting repeats one identical nv: react gesture (nod /
  // smile / pointself) 4+ times in a row with no progression — the Mariko
  // 4x shape (r197), Herve 5x (r196). The r132 fix arms the thin-out after
  // the 2nd identical gesture, so a 4-streak is the old loop shape.
  // nv:listen is excluded: it progresses (language exposure, caught words,
  // speak_back unlock). Any other YOU line resets the streak; THEM lines
  // between gestures do not (each gesture gets a response).
  const NV_REACT_RX = /^YOU: \[(nv:nod|nv:smile|nv:pointself)\]/;
  let nodWorst = [];
  for (const seed of SEEDS) {
    let files = [];
    try { files = fs.readdirSync(EVIDIR).filter(TRAP_GLOB(seed)).sort(); } catch (e) { files = []; }
    for (const f of files) {
      let text = '';
      try { text = fs.readFileSync(path.join(EVIDIR, f), 'utf8'); } catch (e) { continue; }
      let cur = null, curN = 0, maxN = 0, maxG = null;
      for (const l of text.split('\n')) {
        const m = l.trim().match(NV_REACT_RX);
        if (m) {
          if (m[1] === cur) { curN += 1; } else { cur = m[1]; curN = 1; }
          if (curN > maxN) { maxN = curN; maxG = cur; }
        } else if (/^YOU:/.test(l.trim())) { cur = null; curN = 0; }
      }
      if (maxN >= 2) nodWorst.push({ f, maxN, maxG });
      console.log(`  ${f}: max identical nv: react streak=${maxN}${maxG ? ' (' + maxG + ')' : ''}`);
    }
  }
  const nodBreach = nodWorst.filter(w => w.maxN >= 4);
  for (const w of nodBreach) console.log('  DEFECT: ' + w.f + ` (nod-loop: ${w.maxN}x consecutive ${w.maxG})`);
  const nodWorstN = nodWorst.length === 0 ? 0 : Math.max(...nodWorst.map(w => w.maxN));
  console.log(`Q2 NOD-LOOP GUARD: ${nodBreach.length === 0 ? 'HOLD' : 'BREACH'} (0 sittings with a >=4 identical nv: react streak; worst ${nodWorstN}x)`);
  if (nodBreach.length !== 0) fail = 1;

  console.log('\n=== journey-scale r248 arm ' + arm.toUpperCase() + ' — TRIBUTE PAYABILITY (M23 metric revision, measurement only) ===');
  // The M23 shape (r194–r204): readiness counts the scholar as a veteran
  // (Steve RULED 2026-11-10), so scholar + 1 villager veteran reads ready,
  // while delivery (table.js:200) needs 2 non-scholar veterans and honestly
  // refuses until a second payable veteran stands. The old "ready" signal
  // therefore overstated deliverability — r204: payable=1 held for 51 and
  // 27 straight days, 0/51 + 0/27 deliveries. This section reports, per
  // seed, the ready day, attempts, deliveries, reason tally, and the
  // payable-veteran count at ready, and names the state:
  //   DELIVERED — ≥1 ok delivery.
  //   READY-UNPAYABLE — ready, 0 deliveries, payable < 2 at ready (the
  //     M23 shape; the bar measures the village, the payment measures who
  //     can leave — not a defect, a named consequence).
  //   READY-PAYABLE-UNDELIVERED — ready, 0 deliveries, payable ≥ 2 at
  //     ready (a NEW shape — would be a defect, not the M23 shape).
  //   NEVER-READY — the tribute never readied.
  // Sources: ladderevents DELIVER lines (attempts + ok + reason) and the
  // scholarcount txt (trib ready/reason + payable per day). Measurement
  // only — never sets fail.
  for (const seed of SEEDS) {
    let evText = '';
    try { evText = fs.readFileSync(path.join(EVIDIR, `journey-scale-r248-${arm}-ladderevents-${seed}.txt`), 'utf8'); } catch (e) { evText = ''; }
    let scText = '';
    try { scText = fs.readFileSync(path.join(EVIDIR, `journey-scale-r248-${arm}-scholarcount-${seed}.txt`), 'utf8'); } catch (e) { scText = ''; }
    let attempts = 0, delivered = 0;
    const reasons = {};
    for (const l of evText.split('\n')) {
      const m = l.match(/^d(\d+) DELIVER military_tribute ok=(\d) reason=(\S+)/);
      if (!m) continue;
      attempts += 1;
      if (m[2] === '1') delivered += 1;
      reasons[m[3]] = (reasons[m[3]] || 0) + 1;
    }
    let readyDay = null, payableAtReady = null;
    for (const l of scText.split('\n')) {
      const m = l.match(/^d(\d+) new=\S+ legacy=\S+ payable=(\S+) trib=(\S+) delivered=(\S+)/);
      if (!m) continue;
      if (readyDay === null && m[3] === 'ready') { readyDay = parseInt(m[1], 10); payableAtReady = (m[2] === '-' ? null : parseInt(m[2], 10)); }
    }
    let state;
    if (delivered >= 1) state = 'DELIVERED';
    else if (readyDay == null) state = 'NEVER-READY';
    else if (payableAtReady != null && payableAtReady < 2) state = 'READY-UNPAYABLE';
    else state = 'READY-PAYABLE-UNDELIVERED';
    tributeStates[seed] = { state, readyDay, payableAtReady, attempts, delivered };
    console.log(`seed ${seed}: tribute ${state} (ready=${readyDay == null ? '-' : 'd' + readyDay} payableAtReady=${payableAtReady == null ? '-' : payableAtReady} attempts=${attempts} delivered=${delivered} reasons=${JSON.stringify(reasons)})`);
    if (state === 'READY-PAYABLE-UNDELIVERED') console.log(`  NOTE: ${seed} is ready AND payable but undelivered — the M23 shape does NOT explain this; read the ladderevents + scholarcount files before calling it a defect.`);
  }

  console.log('\n=== journey-scale r248 arm ' + arm.toUpperCase() + ' — Q5 SPOTTER (r139 wiring — d90 + end reads, measurement only) ===');
  // The r139 wiring grants 1 foodXp['spotter'] per forage resolution
  // (first per day) and spotter skill >= 1 lowers the field recognition
  // threshold. The driver snapshots foodXp.spotter + spotter skill per
  // roster villager at d90 (spotterWatch90 — r207-owed, taken while the
  // roster still lives) AND at seed end (spotterWatch, the r207 end-only
  // read). This section counts both, per seed. A missing snapshot is
  // "unavailable", never a fail (the corpus predates the instrument, or
  // the snapshot errored). The d90 read is the binding one on a
  // collapse-heavy band: the end snapshot is empty on every dead village.
  for (const seed of SEEDS) {
    const tr = readJson(path.join(EVIDIR, `journey-scale-r248-${arm}-trust-${seed}.json`));
    if (!tr) { console.log(`seed ${seed}: ERROR (corpus missing)`); continue; }
    for (const [tag, sw] of [['d90', (tr.census || {}).spotterWatch90], ['end', (tr.census || {}).spotterWatch]]) {
      if (!Array.isArray(sw)) { console.log(`seed ${seed} ${tag}: spotter snapshot unavailable`); continue; }
      const withXp = sw.filter(v => (v.foodXpSpotter | 0) > 0);
      const skilled = sw.filter(v => (v.spotterSkill | 0) >= 1);
      console.log(`seed ${seed} ${tag}: roster ${sw.length} (alive ${sw.filter(v => v.alive).length}) — foodXp.spotter>0: ${withXp.length}${withXp.length ? ' (' + withXp.map(v => `${v.name}:${v.foodXpSpotter}`).join(', ') + ')' : ''}; spotter skill>=1: ${skilled.length}${skilled.length ? ' (' + skilled.map(v => v.name).join(', ') + ')' : ''}`);
    }
  }

  console.log('\n=== journey-scale r248 arm ' + arm.toUpperCase() + ' — SORTIE (r215-owed: the sortie ledger — measurement only) ===');
  // The driver writes one sortie row per day with lingerers (called, or
  // held + the first failing gate) when the step runs. In r239 the step is
  // inert — any row is an instrument error, reported here, never a fail. Per seed: lingerer days, sorties called, wave-5
  // lingerers seen, held-reason tally. The arm-B informative rule (prereg
  // Q1): informative iff >=1 wave-5 lingerer is fought (a sortie call on
  // a w5seen day, cross-checked by the W5-INSTANCE fight count below) OR
  // every lingerer day carries a named held reason.
  let sortieBand = { lingerDays: 0, called: 0, w5days: 0, heldReasons: {} };
  for (const seed of SEEDS) {
    let sj = null;
    try { sj = JSON.parse(fs.readFileSync(path.join(EVIDIR, `journey-scale-r248-${arm}-sortie-${seed}.json`), 'utf8')); } catch (e) { sj = null; }
    if (!sj) { console.log(`seed ${seed}: sortie corpus unavailable`); continue; }
    const rows = sj.rows || [];
    const called = rows.filter(r => r.called);
    const held = {};
    for (const r of rows) if (!r.called && r.held) held[r.held] = (held[r.held] | 0) + 1;
    const w5days = rows.filter(r => (r.w5seen | 0) > 0).length;
    const cleared = rows.reduce((m, r) => m + ((r.cleared | 0)), 0);
    const broke = rows.filter(r => r.broke).length;
    sortieBand.lingerDays += rows.length;
    sortieBand.called += called.length;
    sortieBand.w5days += w5days;
    for (const k of Object.keys(held)) sortieBand.heldReasons[k] = (sortieBand.heldReasons[k] | 0) + held[k];
    console.log(`seed ${seed}: arm=${sj.arm || '?'} lingerer days=${rows.length} (wave-5 seen on ${w5days}) sorties called=${called.length} cleared=${cleared} broke=${broke} held=${JSON.stringify(held)}${rows.length > 0 ? '  NOTE: sortie rows on ARM ' + (sj.arm || '?') + ' — the step should be inert in r239; read the driver before trusting this arm' : ''}`);
  }
  console.log(`SORTIE band: lingerer days=${sortieBand.lingerDays} (wave-5 seen on ${sortieBand.w5days}) sorties called=${sortieBand.called} held=${JSON.stringify(sortieBand.heldReasons)}`);

  console.log('\n=== journey-scale r248 arm ' + arm.toUpperCase() + ' — W5-INSTANCE (r207-owed: one Editor or successive Editors — measurement only) ===');
  // The r207 band fought 31 wave-5 fights and killed 0, with the same
  // linger lines r206 documented for the Herald now spoken by the Editor
  // and the Spoiler — but the corpus carried no monster instance ids, so
  // "one monster pacing the boundary" vs "successive fresh spawns" was
  // unanswerable. The r227 driver records, per fight, the entity
  // fingerprint (lingerKey for lingerers; else id + tile + position + hp
  // + veteran) plus a daily live world-monster census. This section
  // groups wave-5 fights by entity and names the shape per seed:
  //   ONE — one lingerKey (or one hp-trajectory) recurs across days: the
  //     same wounded entity is fought again and again.
  //   SUCCESSIVE — every wave-5 fight meets a fresh full-HP entity and
  //     the daily census turns entities over: new spawns, not one beast.
  //   MIXED — both shapes appear (e.g. one recurring lingerer plus fresh
  //     wild spawns).
  //   UNANSWERED — no wave-5 fights, or no entity data at all.
  // Wild monsters carry no engine instance id (spawnWorldMonster builds
  // no seq), so the wild grouping is a fingerprint, not a proof: two
  // fights against the same (id, hp, maxHp) on different days are ONE
  // candidate entity; two fights at full HP are successive candidates
  // unless the daily census shows one live entity spanning both days.
  // The section never sets fail.
  for (const seed of SEEDS) {
    // Measurement-only read: a missing w5inst file is "unavailable",
    // never a fail (readJson would set fail — the shared loader is for
    // guard corpora, not for this section).
    let w5 = null;
    try { w5 = JSON.parse(fs.readFileSync(path.join(EVIDIR, `journey-scale-r248-${arm}-w5inst-${seed}.json`), 'utf8')); } catch (e) { w5 = null; }
    if (!w5) { console.log(`seed ${seed}: w5-instance corpus unavailable`); continue; }
    const fights = (w5.fights || []).filter(f => (f.wave | 0) === 5);
    const days = w5.monsterDays || [];
    const liveW5 = days.map(d => ({ day: d.day, n: (d.monsters || []).filter(m => (m.wave | 0) === 5).length, ids: (d.monsters || []).filter(m => (m.wave | 0) === 5).map(m => `${m.id || '?'}${m.key ? ':' + m.key : ''}@${m.hp}/${m.maxHp}`) }));
    const maxLive = liveW5.reduce((m, d) => Math.max(m, d.n), 0);
    const daysWithW5 = liveW5.filter(d => d.n > 0).length;
    if (fights.length === 0) {
      console.log(`seed ${seed}: wave-5 fights 0 — UNANSWERED (no wave-5 fights; live wave-5 entities: max ${maxLive}/day on ${daysWithW5}/${days.length} days)`);
      continue;
    }
    // Group by hard identity first (lingerKey — the only per-entity token
    // the engine assigns). Wild fights have no key: their fingerprint is
    // (id + hp + maxHp + veteran), which CANNOT prove recurrence — two
    // fresh full-HP spawns of one species share it, and two beasts
    // wounded to the same hp share it too. The wild signal is the
    // trajectory, not the grouping: a fought-and-survived beast keeps its
    // wounds, so a second meeting at full HP means a different beast
    // (world monsters do not heal between meetings in this engine — the
    // daily census is the cross-check: a live entity spanning both fight
    // days would contradict it, and the analyzer prints the live-span).
    // Verdict:
    //   ONE — a lingerKey recurs (≥2 fights on one key).
    //   SUCCESSIVE — no lingerKey recurs AND every fight meets a fresh
    //     full-HP entity.
    //   MIXED — a lingerKey recurs AND ≥1 fresh full-HP fight exists.
    //   UNANSWERED — no lingerKey recurs AND some fight is wounded
    //     (same-wounded-beast vs two-beasts-wounded-alike is undecidable
    //     without a key — the trajectory is printed, the shape is not
    //     claimed).
    const byKey = {};
    const wildPrints = {};
    const traj = {};
    for (const f of fights) {
      const e = f.ent || {};
      if (e.key) {
        if (!byKey[e.key]) byKey[e.key] = [];
        byKey[e.key].push(f);
      } else {
        const wk = 'wild:' + (e.id || f.monsterId || '?') + ':hp' + (e.hp == null ? '?' : e.hp) + '/' + (e.maxHp == null ? '?' : e.maxHp) + (e.veteran ? ':vet' : '');
        wildPrints[wk] = (wildPrints[wk] | 0) + 1;
      }
      const mid = (e.id || f.monsterId || '?');
      if (!traj[mid]) traj[mid] = [];
      traj[mid].push(`d${f.day}:${e.hp == null ? '?' : e.hp}/${e.maxHp == null ? '?' : e.maxHp}${e.key ? ' [' + e.key + ']' : ''}${f.via === 'field' ? ' (field' + (f.outcome ? ':' + f.outcome : '') + ')' : ''}`);
    }
    const keys = Object.keys(byKey);
    const recurring = keys.filter(k => byKey[k].length >= 2);
    const freshFull = fights.filter(f => { const e = f.ent || {}; return e.hp != null && e.maxHp != null && e.hp >= e.maxHp; }).length;
    // Daily-census live-span per wave-5 monster id (the cross-check for
    // the wild verdict): first/last day a live entity of that id is seen.
    const span = {};
    for (const d of days) for (const m of (d.monsters || [])) {
      if ((m.wave | 0) !== 5) continue;
      const id = m.id || '?';
      if (!span[id]) span[id] = { first: d.day, last: d.day, days: 0 };
      span[id].first = Math.min(span[id].first, d.day);
      span[id].last = Math.max(span[id].last, d.day);
      span[id].days += 1;
    }
    let shape;
    if (recurring.length >= 1 && freshFull === 0) shape = 'ONE';
    else if (recurring.length === 0 && freshFull === fights.length) shape = 'SUCCESSIVE';
    else if (recurring.length >= 1) shape = 'MIXED';
    else shape = 'UNANSWERED';
    console.log(`seed ${seed}: wave-5 fights ${fights.length} (${fights.filter(f => f.via === 'scholar').length} scholar, ${fights.filter(f => f.via === 'field').length} field) — ${shape} — distinct lingerKeys ${keys.length} (recurring ${recurring.length}: ${recurring.map(k => `${k} x${byKey[k].length}`).join(', ') || 'none'}; wild fingerprints ${Object.keys(wildPrints).length} (${Object.keys(wildPrints).map(k => `${k} x${wildPrints[k]}`).join(', ') || 'none'}); fresh full-HP fights ${freshFull}/${fights.length}; live wave-5 entities max ${maxLive}/day on ${daysWithW5}/${days.length} days; live-span ${Object.keys(span).map(id => `${id} d${span[id].first}-d${span[id].last} (${span[id].days}d)`).join(', ') || 'none'})`);
    for (const mid of Object.keys(traj)) console.log(`  ${mid} hp trajectory: ${traj[mid].join(' -> ')}`);
  }


  console.log('\n=== journey-scale r248 arm ' + arm.toUpperCase() + ' — Q1 ANSWERMAIL (mechanism) ===');
  // Per seed, read journey-scale-r248-<arm>-answermail-<seed>.json
  // (driver corpus: { seed, arm, answermail, stats }). Control arm B
  // has stats null by construction (the flag is off) — the section
  // reads "not armed" there, never a failure. Mechanism proof: tends +
  // renegotiation answers + accord answers + demand answers;
  // tendsBlockedPantry counts the 20k pantry gate blocking a tend.
  // A missing corpus file is an ERROR row (the driver writes one per
  // seed on arm C); it does not set fail here — the panel verdict
  // reads the mechanism as not-fired instead.
  let amFiredSeeds = 0, amTends = 0, amReneg = 0, amAccord = 0, amDemand = 0, amBlocked = 0, amMissing = 0;
  for (const seed of SEEDS) {
    let aj = null;
    try { aj = JSON.parse(fs.readFileSync(path.join(EVIDIR, `journey-scale-r248-${arm}-answermail-${seed}.json`), 'utf8')); } catch (e) { aj = null; }
    if (!aj) { amMissing += 1; console.log(`seed ${seed}: answermail corpus unavailable`); continue; }
    const st = aj.stats || {};
    const fired = ((st.tends | 0) + (st.renegotiationAnswers | 0)) > 0;
    if (fired) amFiredSeeds += 1;
    amTends += (st.tends | 0); amReneg += (st.renegotiationAnswers | 0); amAccord += (st.accordAnswers | 0);
    amDemand += (st.demandAnswers | 0); amBlocked += (st.tendsBlockedPantry | 0);
    console.log(`seed ${seed}: armed=${aj.answermail ? 1 : 0} tends=${st.tends | 0} renegAnswers=${st.renegotiationAnswers | 0} accordAnswers=${st.accordAnswers | 0} demandAnswers=${st.demandAnswers | 0} tendsBlockedPantry=${st.tendsBlockedPantry | 0} tendsPaidKcal=${st.tendsPaidKcal | 0} renegGiftKcal=${st.renegotiationGiftKcal | 0} errors=${st.errors | 0}`);
  }
  const amResult = { firedSeeds: amFiredSeeds, tends: amTends, reneg: amReneg, accord: amAccord, demand: amDemand, blocked: amBlocked, missing: amMissing };
  console.log(`ANSWERMAIL arm ${arm.toUpperCase()}: firedSeeds=${amFiredSeeds}/8 tends=${amTends} renegAnswers=${amReneg} accordAnswers=${amAccord} demandAnswers=${amDemand} tendsBlockedPantry=${amBlocked} missing=${amMissing}`);

  console.log('\n=== journey-scale r248 arm ' + arm.toUpperCase() + ' \u2014 SUBCAP GUARD (control behavior — lever OFF this run) ===');
  // Per seed, read the trust JSON's census.linkraise ledger (the driver
  // captures linkraiseStats() per seed) + the natDiag LEAD counts.
  // Mechanism fires on a seed iff raisesLinked >= 2 (a 2nd-or-later sub
  // linked by a raise). raisesPassedSubCapOff counts the raises the
  // lifted guard let through (0 / absent on the control arm — the
  // counter does not exist there; the guard's refusals are
  // raisesSkippedSubCap). A missing trust corpus is an ERROR row; it
  // does not set fail here — the panel verdict reads the mechanism as
  // not-fired instead.
  let scFiredSeeds = 0, scLinked = 0, scPassed = 0, scSkipped = 0, scSeen = 0, scMissing = 0;
  for (const seed of SEEDS) {
    let trj = null;
    try { trj = JSON.parse(fs.readFileSync(path.join(EVIDIR, `journey-scale-r248-${arm}-trust-${seed}.json`), 'utf8')); } catch (e) { trj = null; }
    if (!trj || !trj.census || !trj.census.linkraise) { scMissing += 1; console.log(`seed ${seed}: subcap corpus unavailable`); continue; }
    const lr = trj.census.linkraise;
    const nd = natDiag.find(d => d.seed === seed);
    const fired = (lr.raisesLinked | 0) >= 2;
    if (fired) scFiredSeeds += 1;
    scLinked += (lr.raisesLinked | 0); scPassed += (lr.raisesPassedSubCapOff | 0);
    scSkipped += (lr.raisesSkippedSubCap | 0); scSeen += (lr.raisesSeen | 0);
    console.log(`seed ${seed}: seen=${lr.raisesSeen | 0} answered=${lr.raisesAnswered | 0} linked=${lr.raisesLinked | 0} passedSubCapOff=${lr.raisesPassedSubCapOff | 0} skippedSubCap=${lr.raisesSkippedSubCap | 0} notReady=${lr.raisesSkippedNotReady | 0} leadActive=${nd ? (nd.leadA + '/' + nd.leadS) : '-'} fired=${fired ? 1 : 0}`);
  }
  const subcapResult = { firedSeeds: scFiredSeeds, linked: scLinked, passed: scPassed, skipped: scSkipped, seen: scSeen, missing: scMissing };
  console.log(`SUBCAP arm ${arm.toUpperCase()}: firedSeeds=${scFiredSeeds}/8 linked=${scLinked} passedSubCapOff=${scPassed} skippedSubCap=${scSkipped} seen=${scSeen} missing=${scMissing}`);

  console.log('\n=== journey-scale r248 arm ' + arm.toUpperCase() + ' — Q2 BLOCKER TAXONOMY ===');
  // Per seed, the closest road's blocker class, from the census links
  // + the trust-events [formed] lines + the natDiag row:
  //   COLLAPSE — village over before national.
  //   NATIONAL — no blocker (national reached).
  //   FORMATION-FEW — fewer than 3 links of the closest road ever formed.
  //   SNAP — 3+ formed but fewer active at end (a formed link is gone).
  //   FORMATION-LATE — the 3rd link (by age) formed after d110 (age < 30 at end).
  //   TRUST-LOW — 3rd link old enough (age >= 30) but trust < 40 at end.
  //   RUNG — 3 seasoned on a road but national still false (regional rung too young).
  //   UNKNOWN — none of the above (numbers printed; never silent).
  // Closest road = max seasoned count from natDiag; ties break by the
  // canon shape priority lead > covenant > trade.
  const blockers = [];
  for (const seed of SEEDS) {
    const censusRow = rows.find(r => r.seed === seed);
    const nd = natDiag.find(d => d.seed === seed);
    let trj = null;
    try { trj = JSON.parse(fs.readFileSync(path.join(EVIDIR, `journey-scale-r248-${arm}-trust-${seed}.json`), 'utf8')); } catch (e) { trj = null; }
    if (!censusRow || !nd || !trj || !trj.census) { blockers.push({ seed, blocker: 'UNKNOWN', road: '-', detail: 'corpus gap' }); console.log(`seed ${seed}: BLOCKER UNKNOWN (corpus gap)`); continue; }
    const c = trj.census;
    if (nd.natDays > 0) { blockers.push({ seed, blocker: 'NATIONAL', road: '-', detail: 'national d' + nd.firstNat }); console.log(`seed ${seed}: BLOCKER NATIONAL (national from d${nd.firstNat})`); continue; }
    if (censusRow.over) { blockers.push({ seed, blocker: 'COLLAPSE', road: '-', detail: 'over d' + censusRow.days }); console.log(`seed ${seed}: BLOCKER COLLAPSE (village over d${censusRow.days})`); continue; }
    const roadCounts = [['LEAD', nd.leadS, nd.leadA], ['COVENANT', nd.covS, nd.covA], ['TRADE', nd.tradeS, nd.tradeA]];
    const prio = { LEAD: 0, COVENANT: 1, TRADE: 2 };
    roadCounts.sort((a, b) => (b[1] - a[1]) || (prio[a[0]] - prio[b[0]]));
    const road = roadCounts[0][0], roadS = roadCounts[0][1];
    const kindOf = road === 'LEAD' ? 'primary-sub' : road.toLowerCase();
    const rlinks = (c.links || []).filter(l => l.kind === kindOf && (road !== 'LEAD' || l.primary === true));
    // [formed] lines for this kind: "d<day> <kind> <other> [formed] ..."
    let tev = '';
    try { tev = fs.readFileSync(path.join(EVIDIR, `journey-scale-r248-${arm}-trustevents-${seed}.txt`), 'utf8'); } catch (e) { tev = ''; }
    const formedOthers = new Set(); let formedEvents = 0;
    for (const line of tev.split('\n')) {
      const m = line.match(/^d(\d+) (\S+) (\S+) \[formed\]/);
      if (!m) continue;
      if (m[2] !== kindOf) continue;
      if (road === 'LEAD' && !/village/.test(m[3])) continue;
      formedEvents += 1; formedOthers.add(m[3]);
    }
    let blocker = 'UNKNOWN', detail = '';
    if (roadS >= 3) { blocker = 'RUNG'; detail = `${road} ${roadS}/3 seasoned but national false (pend ${nd.pend})`; }
    else if (formedOthers.size < 3) { blocker = 'FORMATION-FEW'; detail = `${road} ${formedOthers.size}/3 ever formed (${rlinks.length} active)`; }
    else if (rlinks.length < 3) { blocker = 'SNAP'; detail = `${road} ${formedEvents} formed events on ${formedOthers.size} villages but only ${rlinks.length} active at end`; }
    else {
      const sorted = rlinks.slice().sort((a, b) => (b.ageDays | 0) - (a.ageDays | 0));
      const third = sorted[2];
      const formedDay = (c.day | 0) - (third.ageDays | 0);
      if ((third.ageDays | 0) < 30) { blocker = 'FORMATION-LATE'; detail = `${road} 3rd link ${third.other} formed d${formedDay} (age ${third.ageDays}, trust ${third.trust})`; }
      else if ((third.trust | 0) < 40) { blocker = 'TRUST-LOW'; detail = `${road} 3rd link ${third.other} formed d${formedDay} (age ${third.ageDays}, trust ${third.trust})`; }
      else { blocker = 'UNKNOWN'; detail = `${road} 3rd link ${third.other} age ${third.ageDays} trust ${third.trust} — seasoned by the numbers but natDiag says ${roadS}/3`; }
    }
    blockers.push({ seed, blocker, road, detail });
    console.log(`seed ${seed}: BLOCKER ${blocker} (${road}) — ${detail}`);
  }
  const blockerCounts = {};
  for (const b of blockers) blockerCounts[b.blocker] = (blockerCounts[b.blocker] | 0) + 1;
  console.log(`BLOCKER arm ${arm.toUpperCase()}: ${JSON.stringify(blockerCounts)}`);

  return { arm, rows, livedTotal, nationalCount, natDiag, tributeStates, lesserCount, armIncomplete, amResult, subcapResult, blockers };
}

const armResults = {};
for (const arm of ['b']) {
  armResults[arm] = analyzeArm(arm);
}

console.log('\n=== journey-scale r248 — Q1 MUSTER (the r223-owed lever — measurement only) ===');
// Per arm, per seed: the muster ledger + the engine's own titan outcomes
// log (state.titans.outcomes: refused / fought -> slain / fled) + the
// verb-call log. The A/B deltas (wave-4 kills, living veterans, tribute,
// national) come from the arm results above; the cost bar (lived-days B
// vs A, B-only collapses, starvation, committed blades who died) is read
// here. The committed-deaths join uses the ledger's committedVids (the
// vids recorded at commit time — the end-state muster drops the dead at
// the next dawn reconcile, so only the ledger can join a committed blade
// to a later death) against the death census (death day >= commit day).
// Measurement only — never sets fail.
const MUSTER_ARMS = {};
for (const arm of ['b']) {
  const perSeed = {};
  const band = { titanDays: 0, called: 0, readyDays: 0, slain: 0, fought: 0, refused: 0, fled: 0, committed: 0, committedDeaths: 0, heldReasons: {}, verbCalls: {}, verbErrors: 0, missing: 0 };
  for (const seed of SEEDS) {
    let mj = null;
    try { mj = JSON.parse(fs.readFileSync(path.join(EVIDIR, `journey-scale-r248-${arm}-muster-${seed}.json`), 'utf8')); } catch (e) { mj = null; }
    if (!mj) { band.missing += 1; console.log(`seed ${seed} arm ${arm.toUpperCase()}: muster corpus unavailable`); perSeed[seed] = null; continue; }
    const mrows = mj.rows || [];
    const te = mj.titanEnd || {};
    const outcomes = te.outcomes || [];
    const slain = outcomes.filter(o => o.outcome === 'slain');
    const fought = outcomes.filter(o => o.outcome === 'fought' || o.outcome === 'slain' || o.outcome === 'fled');
    const refused = outcomes.filter(o => o.outcome === 'refused');
    const fled = outcomes.filter(o => o.outcome === 'fled');
    const called = mrows.filter(r => r.called);
    const readyDays = mrows.filter(r => r.ready).length;
    const held = {};
    for (const r of mrows) if (!r.called && r.held) held[r.held] = (held[r.held] | 0) + 1;
    const committed = [];
    for (const r of mrows) {
      for (const vid of (r.committedVids || [])) {
        if (!committed.find(c => c.vid === vid)) committed.push({ vid, day: r.day, titan: r.titan });
      }
    }
    let dcDeaths = [];
    try { const dc = JSON.parse(fs.readFileSync(path.join(EVIDIR, `journey-scale-r248-${arm}-deathcensus-${seed}.json`), 'utf8')); dcDeaths = dc.deaths || []; } catch (e) {}
    const committedDeaths = [];
    for (const cv of committed) {
      const d = dcDeaths.find(x => x.vid === cv.vid && (x.day | 0) >= cv.day);
      if (d) committedDeaths.push({ vid: cv.vid, titan: cv.titan, commitDay: cv.day, day: d.day, cause: d.cause });
    }
    const vc = {};
    for (const c of (mj.verbCalls || [])) vc[c.fn] = (vc[c.fn] | 0) + 1;
    band.titanDays += mrows.length;
    band.called += called.length;
    band.readyDays += readyDays;
    band.slain += slain.length;
    band.fought += fought.length;
    band.refused += refused.length;
    band.fled += fled.length;
    band.committed += committed.length;
    band.committedDeaths += committedDeaths.length;
    for (const k of Object.keys(held)) band.heldReasons[k] = (band.heldReasons[k] | 0) + held[k];
    for (const k of Object.keys(vc)) band.verbCalls[k] = (band.verbCalls[k] | 0) + vc[k];
    band.verbErrors += (mj.verbErrors || []).length;
    perSeed[seed] = { rows: mrows.length, called: called.length, readyDays, held, slain: slain.length, fought: fought.length, refused: refused.length, fled: fled.length, committed: committed.length, committedDeaths, outcomes };
    console.log(`seed ${seed} arm ${arm.toUpperCase()}: titan days=${mrows.length} called=${called.length} readyDays=${readyDays} held=${JSON.stringify(held)} outcomes slain=${slain.length} fought=${fought.length} refused=${refused.length} fled=${fled.length} committed=${committed.length} committedDeaths=${committedDeaths.length}${committedDeaths.length ? ' (' + committedDeaths.map(d => d.vid + ' d' + d.day + ' ' + (d.cause || '?')).join(', ') + ')' : ''} verbCalls=${JSON.stringify(vc)} verbErr=${(mj.verbErrors || []).length}`);
  }
  MUSTER_ARMS[arm] = { perSeed, band };
}
function bandW4(R) { return R.rows.reduce((m, r) => m + (((r.fightsByWave || {})['4'] | 0)), 0); }
function bandW4Kills(R) { return R.rows.reduce((m, r) => m + ((r.w4kills | 0)), 0); } // r239: kills, not fights (killAttrEnd.w4total)
function bandPeakVets(R) { return R.rows.reduce((m, r) => Math.max(m, (r.maxR4 | 0)), 0); }
function bandStarv(R) { return R.rows.reduce((m, r) => m + (((r.byCause || {})['starvation'] | 0)), 0); }
const B = armResults['b'];
const MB = MUSTER_ARMS['b'].band;
console.log(`MUSTER band B: titan days=${MB.titanDays} called=${MB.called} readyDays=${MB.readyDays} slain=${MB.slain} fought=${MB.fought} refused=${MB.refused} fled=${MB.fled} committed=${MB.committed} committedDeaths=${MB.committedDeaths} held=${JSON.stringify(MB.heldReasons)} verbCalls=${JSON.stringify(MB.verbCalls)} verbErr=${MB.verbErrors} missing=${MB.missing}`);
console.log(`band wave-4 fights (ladder count, refused meetings included): B=${bandW4(B)}`);
console.log(`band wave-4 kills (killAttr w4total): B=${bandW4Kills(B)}`);
console.log(`band titan fights started (outcomes log, authoritative): B=${MB.fought}; refused meetings: B=${MB.refused}`);
console.log(`band living-veteran peak (readiness w4): B=${bandPeakVets(B)}; national: B=${B.nationalCount}/8`);
console.log(`band tribute: B=${Object.values(B.tributeStates).map(s => s.state).join(',')}`);
// Cost read (prereg Q2, measurement only): lived-days vs the control
// per-seed mean; collapses named per seed; starvation deaths counted.
// Single arm — no B-vs-A delta (r242's panel carried the before/after;
// this run's before-measurement is r242's band, read in the run note).
const livedMeanB = B.livedTotal / Math.max(1, SEEDS.length);
const starvB = bandStarv(B);
console.log(`COST READ B: lived-days total=${B.livedTotal} mean=${livedMeanB.toFixed(1)}/seed; collapses: ${B.rows.filter(r => r.over).map(r => r.seed).join(',') || 'none'}; starvation deaths ${starvB}`);
console.log(`COST READ B: committed Haven blades who died: B=${MB.committedDeaths} (the price, read against the kill gain — not gated)`);
// Q1 MUSTER verdict (prereg rule, measurement only — single arm).
function musterVerdictFor(M, R) {
  if (M.slain >= 1) return 'MOVED — the muster slew ' + M.slain + ' titan(s); wave-4 fights ' + bandW4(R) + ' / kills ' + bandW4Kills(R) + ', living-veteran peak ' + bandPeakVets(R) + ', national ' + R.nationalCount + '/8';
  if (M.fought >= 1) return 'FOUGHT-NOT-SLAIN — the coalition fought but no titan died; the fight rows above name the cost';
  if (M.called >= 1) return 'CALLED-NOT-FOUGHT — the call sounded but no coalition fight started; the held rows above name the reason';
  return 'NOT-CALLED — the call never sounded; the held rows above name the reason';
}
console.log('Q1 MUSTER VERDICT B: ' + musterVerdictFor(MB, B));

console.log('\n=== journey-scale r248 — Q1 MARCH (the r227-owed lever — measurement only) ===');
// Per arm, per seed: the march ledger + the engine's own titan outcomes
// log, joined BY DAY (outcomes carry day) WITH A ONE-DAY LAG: a
// fought/slain outcome on a march-arrival day OR the day after, same
// titan, is a march-completed fight (the scholar stands on the lair tile
// the morning after the march returns him there); a fought/slain 2+ days
// after the last arrival is the meeting flow's own doing (or a field
// mauling — which the outcomes log does NOT count as slain, per the r227
// metric-review correction). Measurement only — never sets fail.
const MARCH_ARMS = {};
for (const arm of ['b']) {
  const perSeed = {};
  const band = { marchDays: 0, arrivedDays: 0, onTileDays: 0, pendingDays: 0, foughtOnMarch: 0, slainOnMarch: 0, foughtOffMarch: 0, slainOffMarch: 0, heldReasons: {}, missing: 0 };
  for (const seed of SEEDS) {
    let mj = null;
    try { mj = JSON.parse(fs.readFileSync(path.join(EVIDIR, `journey-scale-r248-${arm}-march-${seed}.json`), 'utf8')); } catch (e) { mj = null; }
    if (!mj) { band.missing += 1; console.log(`seed ${seed} arm ${arm.toUpperCase()}: march corpus unavailable`); perSeed[seed] = null; continue; }
    const mrows = mj.rows || [];
    const te = mj.titanEnd || {};
    const outcomes = te.outcomes || [];
    const marchDaySet = {};
    for (const r of mrows) if (r.arrived) marchDaySet[r.day + ':' + (r.titan || '')] = true;
    // LAGGED JOIN (r239 closeout correction — the prereg rule counts any
    // march-completed fight, not a same-day one): the fight engages when
    // the scholar STANDS on the lair tile, which is the morning after the
    // march returns him there as often as the march day itself (135614 B:
    // marched d134–137, fight d138 while still on the tile). A fight on
    // a march-arrival day OR the day after, same titan, is
    // march-completed. A fight 2+ days after the last arrival is the
    // meeting flow's own doing (or a field mauling — which the outcomes
    // log does NOT count as slain).
    let foughtOn = 0, slainOn = 0, foughtOff = 0, slainOff = 0;
    for (const o of outcomes) {
      const isFight = (o.outcome === 'fought' || o.outcome === 'slain' || o.outcome === 'fled');
      if (!isFight) continue;
      const onMarch = !!marchDaySet[o.day + ':' + (o.titan || '')] || !!marchDaySet[(o.day - 1) + ':' + (o.titan || '')];
      if (onMarch) { foughtOn += 1; if (o.outcome === 'slain') slainOn += 1; }
      else { foughtOff += 1; if (o.outcome === 'slain') slainOff += 1; }
    }
    const held = {};
    for (const r of mrows) if (r.held) held[r.held] = (held[r.held] | 0) + 1;
    const arrivedDays = mrows.filter(r => r.arrived).length;
    const onTileDays = mrows.filter(r => r.onTile).length;
    const pendingDays = mrows.filter(r => r.pending).length;
    band.marchDays += mrows.length;
    band.arrivedDays += arrivedDays;
    band.onTileDays += onTileDays;
    band.pendingDays += pendingDays;
    band.foughtOnMarch += foughtOn;
    band.slainOnMarch += slainOn;
    band.foughtOffMarch += foughtOff;
    band.slainOffMarch += slainOff;
    for (const k of Object.keys(held)) band.heldReasons[k] = (band.heldReasons[k] | 0) + held[k];
    perSeed[seed] = { rows: mrows.length, arrivedDays, onTileDays, pendingDays, held, foughtOnMarch: foughtOn, slainOnMarch: slainOn, foughtOffMarch: foughtOff, slainOffMarch: slainOff };
    console.log(`seed ${seed} arm ${arm.toUpperCase()}: march days=${mrows.length} arrived=${arrivedDays} onTile=${onTileDays} pending=${pendingDays} held=${JSON.stringify(held)} fights on-march=${foughtOn} slain-on-march=${slainOn} fights off-march=${foughtOff} slain-off-march=${slainOff}`);
  }
  MARCH_ARMS[arm] = { perSeed, band };
}
const KB = MARCH_ARMS['b'].band;
console.log(`MARCH band B: march days=${KB.marchDays} arrived=${KB.arrivedDays} onTile=${KB.onTileDays} pending=${KB.pendingDays} fought-on-march=${KB.foughtOnMarch} slain-on-march=${KB.slainOnMarch} fought-off-march=${KB.foughtOffMarch} slain-off-march=${KB.slainOffMarch} held=${JSON.stringify(KB.heldReasons)} missing=${KB.missing}`);
// Q1 MARCH verdict (prereg rule, measurement only — single arm).
// ENGINE-slain only: a field mauling never lands in the outcomes log as
// slain, so the outcomes count is already the honest one — the join only
// attributes the fight to the march.
function marchVerdictFor(K, M, R) {
  if (K.slainOnMarch >= 1) return 'MOVED — a march-completed fight slew ' + K.slainOnMarch + ' titan(s); wave-4 fights ' + bandW4(R) + ' / kills ' + bandW4Kills(R);
  if (K.foughtOnMarch >= 1) return 'FOUGHT-NOT-SLAIN — the march engaged the coalition fight but no titan died; the fight rows above name the cost';
  if (K.marchDays >= 1 && K.arrivedDays === 0) return 'NO-ARRIVAL — the march step fired but never arrived at a lair; the held rows above name the reason';
  if (K.arrivedDays >= 1) return 'ARRIVED-NO-FIGHT — the march arrived ' + K.arrivedDays + ' day(s) but no coalition fight started; the held/pending rows above name the reason';
  if (M.called >= 1) return 'NO-MARCH — the muster completed but the march never fired (no ready-muster day reached the step); the muster held rows above name the reason';
  return 'NO-MARCH — the call never sounded; the held rows above name the reason';
}
console.log('Q1 MARCH VERDICT B: ' + marchVerdictFor(KB, MB, B));

console.log('\n=== journey-scale r248 \u2014 Q1 PLAYTEST PANEL VERDICT (the leg verdict) ===');
// Prereg rule (binding, single arm): INTERESTING iff national >= 3/8
// OR a new blocker class (outside the r245-observed set {TRUST-LOW,
// NATIONAL, SNAP, FORMATION-FEW, FORMATION-LATE, COLLAPSE}) OR a
// taxonomy miss (UNKNOWN — the classifier could not name the blocker).
// Else QUIET — the wall stands as measured, the finding is the blocker
// taxonomy. A fixable defect in the table-approach path is judged by
// the coordinator in the run note, not by this verdict. Never sets the
// exit code: the coordinator reads the Q1 PLAYTEST PANEL VERDICT line.
const fullCount = B.rows.filter(r => (r.fullDay | 0) > 0).length;
const w5Faced = B.rows.filter(r => (((r.fightsByWave || {})['5'] | 0)) > 0).length;
const stallSeeds = B.rows.filter(r => (r.phantomDays5 || []).length > 0).length;
const stallDays = B.rows.reduce((m, r) => m + ((r.phantomDays5 || []).length), 0);
const survived = B.rows.filter(r => !r.over).length;
const observedBlockers = new Set(['TRUST-LOW', 'NATIONAL', 'SNAP', 'FORMATION-FEW', 'FORMATION-LATE', 'COLLAPSE']);
const newBlockers = B.blockers.filter(b => !observedBlockers.has(b.blocker));
console.log(`PANEL national: B=${B.nationalCount}/8 tableOffered(lesser)=${B.lesserCount}/8 fullSeat=${fullCount}/8`);
console.log(`PANEL fights: wave-4 fights=${bandW4(B)} wave-4 kills=${bandW4Kills(B)} wave-5 faced=${w5Faced}/8`);
console.log(`PANEL stall: standing-199 stall seeds=${stallSeeds}/8 stallDays=${stallDays} survival=${survived}/8`);
// r248 stall revision (r247 proposed, §14): split stalled days by whether
// the village was otherwise ready — SEED-level, not day-level: a stalled
// seed counts ready if it reached national (natDays > 0) OR held 2+ living
// wave-4 veterans at any day (maxR4 >= 2) OR released readiness-5 (maxR5 > 0).
// The as-written stall total above stays the binding Q1 metric; this split
// is the proposed revision in force.
const stallSplit = B.rows.reduce((acc, r) => {
  const days = (r.phantomDays5 || []).length;
  if (days === 0) return acc;
  const nd = B.natDiag.find(d => d.seed === r.seed);
  const ready = (nd && (nd.natDays | 0) > 0) || ((r.maxR4 | 0) >= 2) || ((r.maxR5 | 0) > 0);
  if (ready) { acc.readyDays += days; acc.readySeeds += 1; } else { acc.notReadyDays += days; acc.notReadySeeds += 1; }
  return acc;
}, { readyDays: 0, readySeeds: 0, notReadyDays: 0, notReadySeeds: 0 });
console.log(`PANEL stall split (r248 revision, seed-level): stalled-while-otherwise-ready ${stallSplit.readyDays}d on ${stallSplit.readySeeds}/8 seeds; stalled-while-not-ready ${stallSplit.notReadyDays}d on ${stallSplit.notReadySeeds}/8 seeds`);
console.log(`PANEL blockers B: ${JSON.stringify(B.blockers.map(b => b.seed + ':' + b.blocker))}`);
const natInteresting = B.nationalCount >= 3;
if (natInteresting) console.log(`Q1 PLAYTEST PANEL VERDICT: INTERESTING \u2014 national reached on ${B.nationalCount}/8 seeds (bar >=3/8); table offered ${B.lesserCount}/8, full seat ${fullCount}/8, wave-5 faced ${w5Faced}/8`);
else if (newBlockers.length > 0) console.log(`Q1 PLAYTEST PANEL VERDICT: INTERESTING \u2014 new blocker class: ${JSON.stringify(newBlockers.map(b => b.seed + ':' + b.blocker))}; national ${B.nationalCount}/8, table offered ${B.lesserCount}/8`);
else console.log(`Q1 PLAYTEST PANEL VERDICT: QUIET \u2014 the wall stands as measured: national ${B.nationalCount}/8, table offered ${B.lesserCount}/8, full seat ${fullCount}/8, wave-5 faced ${w5Faced}/8, stall ${stallSeeds}/8 seeds (${stallDays}d); the finding is the blocker taxonomy above`);

// Q2 TRADE-ROAD WATCH (prereg): the r113 rationale for the guard was
// keeping the village budget for trade routes \u2014 if the lift kills trade,
// that is the lever's cost, reported plainly. Per arm: seeds with TRADE
// 3/3 seasoned at end, and national seeds whose closest road (max
// seasoned, lead > covenant > trade) is TRADE.
function tradeWatchFor(R, label) {
  let tradeSeasoned = 0, tradeNat = 0; const natTotal = R.nationalCount;
  const prio = { LEAD: 0, COVENANT: 1, TRADE: 2 };
  for (const nd of R.natDiag) {
    if ((nd.tradeS | 0) >= 3) tradeSeasoned += 1;
    if ((nd.natDays | 0) > 0) {
      const counts = [['LEAD', nd.leadS | 0], ['COVENANT', nd.covS | 0], ['TRADE', nd.tradeS | 0]];
      counts.sort((a, b) => (b[1] - a[1]) || (prio[a[0]] - prio[b[0]]));
      if (counts[0][0] === 'TRADE') tradeNat += 1;
    }
  }
  console.log(`TRADE WATCH ${label}: tradeSeasoned3of3=${tradeSeasoned}/8 nationalViaTrade=${tradeNat}/${natTotal} national`);
}
tradeWatchFor(B, 'B');

// Exit code: a guard breach (fail=1) dominates; otherwise an arm with no
// raise talks at all is INCOMPLETE (exit 2). Q1 never sets the exit code:
// a non-GO echo verdict is a run-level NO-GO the coordinator reads off
// the Q1 PLAYTEST PANEL VERDICT line, not an analyzer failure.
if (fail === 0 && B.armIncomplete) fail = 2;
process.exit(fail);
