// analyze-departbeat-b.js — analyzer + judge, arm sim-departbeat-b.
// The ordinary wave-4+ departure beat: for every wave-4+ launch on
// the designated band, exactly one fireside beat line must speak at
// the launch (ordinary XOR re-seed), and the beat is fiction-only,
// so armed-vs-control trajectories must not move.
// INSTRUMENT ONLY — no game code changes.
// Reads per-seed corpus dirs (the departbeat driver recorder shape)
// and judges the frozen prereg bars (ARMED leg judged; the control
// leg is analyzed for the comparison numbers, never judged).
// Usage:
//   node scripts/analyze-departbeat-b.js --dir evidence/2026-11-21/perseed-departbeat-b-106771-armed --dir2 evidence/2026-11-21/perseed-departbeat-b-106771-control [--out evidence/2026-11-21/departbeat-b-106771-analysis.json]
//   node scripts/analyze-departbeat-b.js --selftest
// Counting rules (frozen prereg + correction 1, see below):
//   Launches: v4departs rows with result 'launch', targetWave >= 4,
//   target non-null — the reseedexpiry survey's rule. The row's
//   targetWave IS plan.needWave (read after the call), so the rule
//   is the beat's domain (needWave >= 4) plus a target id. Deduped
//   by (vid, day, target), keeping the first row.
//   Beat lines: vetSays lines matching the ordinary-beat regex
//   (/sets out .* — the fire marks the trail\./) or the re-seed
//   regex (/is hunting .* now — the fire found a new trail\./).
//   Join: vetSays rows carry {day, line} only (no holder), so a
//   launch is joined to beat lines by DAY: a launch is "beaten"
//   when >= 1 beat line falls on its day; a day is "spam" when its
//   beat lines exceed its launches. Same-day two-launch collisions
//   are rare (14 launches / 16 seeds on the confirm band) and the
//   per-day counts keep the check exact in the common case; the
//   staged proof (test-departbeat-b.js, 34/34) already proves the
//   per-launch holder/party/target naming, so the analyzer counts
//   rather than re-proving wording.
//   CORRECTION 1 (2026-11-21, before the pilot): a beat line on a
//   day with NO counted launch is reported as an unmatched beat
//   day, not auto-spam. It is explained iff a v4departs launch row
//   exists that day with targetWave >= 4 and target null — a
//   legitimate no-target beat (the hook fires on needWave >= 4
//   regardless of target; the survey rule excludes targetless
//   launches). Zero such rows occurred on the 16-seed confirm band
//   (281 launches, 70 targetWave>=4, 0 targetless), so the case is
//   a diagnostic, not an expected shape. Unexplained unmatched
//   beat days fail B2 as spam.
//   CORRECTION 2 (2026-11-21, after the pilot ran, before judging
//   — INSTRUMENT fix, the frozen metric is unchanged): the first
//   version counted ALL beat lines (ordinary + re-seed) against
//   wave-4+ launch days. That miscounts a wave-3 re-seed launch's
//   beat: the re-seed beat has no wave gate by design (it speaks
//   for ANY expired-plan re-seed launch), so a wave-3 re-seed
//   launch speaks while the wave-4+ survey excludes it. Found on
//   the pilot band itself, seed 106776 d36: Dale Hoffman launched
//   on an expired-plan re-seed to terms_of_service (targetWave 3,
//   stage hunt, party of 2 — v4departs row + dawnbidDeparts seq
//   378 confirm the launch) and the re-seed beat fired exactly
//   once; the counter flagged the line as both "spam" and
//   "unmatched". The frozen B2 metric ("every wave-4+ launch
//   carries exactly 1 beat line") never covered that line — it
//   belongs to a wave-3 launch. The fix: spam/unmatched are
//   counted on ORDINARY beats only (each wave-4+ launch carries
//   at most one ordinary beat, by the hook's stamp — exact), and a
//   re-seed beat on a day with no counted launch is explained iff
//   ANY v4departs launch row exists that day. A re-seed beat with
//   no launch row at all that day stays unexplained and fails B2.
//   The missed check still counts either kind (a wave-4+ launch
//   beaten by a re-seed line is beaten). Limitation, stated
//   plainly: the day-join cannot prove a reseed line on a
//   wave-4+ launch day belongs to that launch rather than to a
//   same-day wave-3 launch — the hook + staged proof (D3) prove
//   the one-beat-per-launch construction; the analyzer counts.
// Frozen bars (prereg evidence/2026-11-21/sim-departbeat-b-prereg.md):
//   B1: armed ordinary-beat vetSays lines > 0; control = 0.
//   B2: every armed wave-4+ launch carries exactly 1 beat line:
//       launches with 0 beats = 0 AND launch-days with more beat
//       lines than launches = 0 AND unexplained unmatched beat
//       days = 0. Floor: >= 4 wave-4+ launches on the band, else
//       REPORTED / LOW-N, not GO.
//   B3: launches and village deaths identical armed vs control,
//       per seed (fiction-only lever must not move trajectories).
//       Any mismatch = regression_signal -> NO-GO.
//   Verdict GO iff B1 + B2 pass and B3 is clean.
'use strict';
const path = require('path');
const fs = require('fs');

const DEPART_BEAT_RE = /sets out .* — the fire marks the trail\./;
const RESEED_BEAT_RE = /is hunting .* now — the fire found a new trail\./;
// Structural shape of a well-formed ordinary beat line: holder,
// optional party, optional target — never an empty name slot.
const DEPART_STRUCT_RE = /^(.+?) sets out( with .+?)?( after .+?)? — the fire marks the trail\.$/;
const RESEED_STRUCT_RE = /^(.+?) is hunting (.+?) now — the fire found a new trail\.$/;

const MIN_LAUNCHES = 4; // B2 floor (prereg)

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Launches: v4departs rows with result 'launch', targetWave >= 4,
// target non-null — the reseedexpiry survey's rule. Dedupe by
// (vid, day, target), keeping the first row.
function launchesOf(d) {
  const out = [];
  const seen = {};
  let duplicates = 0;
  for (const r of (d.v4departs || [])) {
    if (r.result !== 'launch' || (r.targetWave | 0) < 4 || !r.target) continue;
    const key = [r.vid, r.day, r.target].join('|');
    if (seen[key]) { duplicates++; continue; }
    seen[key] = true;
    out.push({ seed: d.seed, day: r.day, vid: r.vid, target: r.target,
      targetWave: r.targetWave, party: [r.vid].concat(r.party || []),
      partySize: r.partySize != null ? r.partySize : ((r.party || []).length + 1),
      source: r.source || null });
  }
  return { launches: out, duplicates: duplicates };
}

// Beat lines in a corpus: ordinary + re-seed, with day.
function beatsOf(d) {
  const out = [];
  for (const s of (d.vetSays || [])) {
    const line = String(s.line || '');
    if (DEPART_BEAT_RE.test(line)) out.push({ seed: d.seed, day: s.day, kind: 'ordinary', line: line });
    else if (RESEED_BEAT_RE.test(line)) out.push({ seed: d.seed, day: s.day, kind: 'reseed', line: line });
  }
  return out;
}

// Targetless needWave>=4 launch rows (the no-target beat's launch):
// result 'launch', targetWave >= 4, target null. Used only to
// explain unmatched beat days (correction 1).
function targetlessLaunchesOf(d) {
  const out = [];
  for (const r of (d.v4departs || [])) {
    if (r.result !== 'launch' || (r.targetWave | 0) < 4 || r.target) continue;
    out.push({ seed: d.seed, day: r.day, vid: r.vid });
  }
  return out;
}

function analyzeSeed(d) {
  const seed = d.seed;
  const lq = launchesOf(d);
  const launches = lq.launches;
  const beats = beatsOf(d);
  const targetless = targetlessLaunchesOf(d);
  const ordinary = beats.filter(function (b) { return b.kind === 'ordinary'; });
  const reseed = beats.filter(function (b) { return b.kind === 'reseed'; });
  // Per-day join, on ORDINARY beats only (correction 2): a wave-4+
  // launch carries at most one ordinary beat (the hook's stamp),
  // and a wave-3 launch never fires one — so the ordinary count is
  // exact per day. A re-seed beat may belong to a wave-4+ launch
  // (its beat) or to a wave-3 re-seed launch (out of population);
  // the day-join cannot tell them apart, so re-seed beats are
  // checked separately below (any launch row that day explains one).
  const launchesByDay = {};
  for (const l of launches) launchesByDay[l.day] = (launchesByDay[l.day] || 0) + 1;
  const ordinaryByDay = {};
  for (const b of ordinary) ordinaryByDay[b.day] = (ordinaryByDay[b.day] || 0) + 1;
  const beatsByDay = {};
  for (const b of beats) beatsByDay[b.day] = (beatsByDay[b.day] || 0) + 1;
  // Any launch row, any wave/target, by day — explains re-seed beats
  // on days with no counted wave-4+ launch (correction 2).
  const anyLaunchByDay = {};
  for (const r of (d.v4departs || [])) {
    if (r.result !== 'launch') continue;
    anyLaunchByDay[r.day] = (anyLaunchByDay[r.day] || 0) + 1;
  }
  let missed = 0;
  const missedLaunches = [];
  for (const l of launches) {
    if (!(beatsByDay[l.day] > 0)) { missed++; missedLaunches.push(l); }
  }
  let spamDays = 0;
  const spamDayList = [];
  for (const day of Object.keys(ordinaryByDay)) {
    const n = ordinaryByDay[day];
    const ln = launchesByDay[day] || 0;
    if (n > ln) { spamDays++; spamDayList.push({ day: Number(day), beats: n, launches: ln }); }
  }
  // Unmatched ORDINARY beat days: ordinary lines on a day with no
  // counted launch. Explained iff a targetless needWave>=4 launch
  // row exists that day (correction 1). Disjoint from spamDays by
  // construction (spam needs launches that day; unmatched has none).
  const targetlessDays = {};
  for (const t of targetless) targetlessDays[t.day] = (targetlessDays[t.day] || 0) + 1;
  let unmatched = 0;
  const unmatchedDays = [];
  let explainedUnmatched = 0;
  for (const day of Object.keys(ordinaryByDay)) {
    if (launchesByDay[day]) continue;
    const n = ordinaryByDay[day];
    if (targetlessDays[day]) { explainedUnmatched += n; continue; }
    unmatched += n;
    unmatchedDays.push({ day: Number(day), beats: n });
  }
  // Unexplained RE-SEED beats: a re-seed line on a day with no
  // counted launch AND no launch row of any kind (correction 2).
  // A re-seed line on a day with a counted launch is that launch's
  // beat (or a same-day wave-3 launch's — the hook proves at most
  // one beat per launch; the day-join cannot split the two, and
  // does not try).
  let unexplainedReseed = 0;
  const unexplainedReseedDays = [];
  for (const b of reseed) {
    if (launchesByDay[b.day]) continue;
    if (anyLaunchByDay[b.day]) continue;
    unexplainedReseed++;
    unexplainedReseedDays.push({ day: b.day, line: b.line });
  }
  // Structural check: every ordinary beat line must parse as
  // holder (+ party) (+ target) + the frozen tail; same for reseed.
  const malformed = [];
  for (const b of beats) {
    const re = b.kind === 'ordinary' ? DEPART_STRUCT_RE : RESEED_STRUCT_RE;
    if (!re.test(b.line.replace(/^📺 SYSTEM: "/, '').replace(/"$/, ''))) malformed.push(b);
  }
  const deaths = (d.deaths || []).length;
  return {
    seed: seed, endReason: d.endReason || null, days: d.days || null,
    won: d.won || 0, standing: d.standing || null, maxWave: d.maxWave || null,
    launches: launches.length, duplicates: lq.duplicates,
    ordinaryBeats: ordinary.length, reseedBeats: reseed.length,
    beatsTotal: beats.length,
    missedLaunches: missed, missedList: missedLaunches,
    spamDays: spamDays, spamDayList: spamDayList,
    unmatchedBeatLines: unmatched, unmatchedDays: unmatchedDays,
    explainedUnmatched: explainedUnmatched,
    unexplainedReseedBeats: unexplainedReseed, unexplainedReseedDays: unexplainedReseedDays,
    targetlessLaunches: targetless.length,
    malformedBeatLines: malformed.length, malformedList: malformed,
    deaths: deaths,
    departbeatFlag: (d.departbeatFlag == null ? null : d.departbeatFlag),
    planreseedFlag: (d.planreseedFlag == null ? null : d.planreseedFlag),
    instrumentErrors: (d.instrumentErrors || []).length,
    launchesDetail: launches,
    beatsDetail: beats,
  };
}

function loadDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  const out = [];
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out.push(d);
  }
  return out;
}

function judgePooled(armed, control) {
  const aLaunches = armed.reduce(function (s, x) { return s + x.launches; }, 0);
  const aOrdinary = armed.reduce(function (s, x) { return s + x.ordinaryBeats; }, 0);
  const cOrdinary = control.reduce(function (s, x) { return s + x.ordinaryBeats; }, 0);
  const aMissed = armed.reduce(function (s, x) { return s + x.missedLaunches; }, 0);
  const aSpamDays = armed.reduce(function (s, x) { return s + x.spamDays; }, 0);
  const aUnmatched = armed.reduce(function (s, x) { return s + x.unmatchedBeatLines; }, 0);
  const aUnexplainedReseed = armed.reduce(function (s, x) { return s + x.unexplainedReseedBeats; }, 0);
  const aMalformed = armed.reduce(function (s, x) { return s + x.malformedBeatLines; }, 0);
  const aDeaths = armed.reduce(function (s, x) { return s + x.deaths; }, 0);
  const cDeaths = control.reduce(function (s, x) { return s + x.deaths; }, 0);
  const aLaunchesBySeed = {};
  const cLaunchesBySeed = {};
  for (const x of armed) aLaunchesBySeed[x.seed] = x.launches;
  for (const x of control) cLaunchesBySeed[x.seed] = x.launches;
  const aDeathsBySeed = {};
  const cDeathsBySeed = {};
  for (const x of armed) aDeathsBySeed[x.seed] = x.deaths;
  for (const x of control) cDeathsBySeed[x.seed] = x.deaths;
  // B3: per-seed equality of launches and deaths.
  const guardrailMismatches = [];
  const seeds = Object.keys(aLaunchesBySeed);
  for (const sd of seeds) {
    if (cLaunchesBySeed[sd] == null) { guardrailMismatches.push({ seed: Number(sd), kind: 'missing-control-seed' }); continue; }
    if (aLaunchesBySeed[sd] !== cLaunchesBySeed[sd]) {
      guardrailMismatches.push({ seed: Number(sd), kind: 'launches', armed: aLaunchesBySeed[sd], control: cLaunchesBySeed[sd] });
    }
    if (aDeathsBySeed[sd] !== cDeathsBySeed[sd]) {
      guardrailMismatches.push({ seed: Number(sd), kind: 'deaths', armed: aDeathsBySeed[sd], control: cDeathsBySeed[sd] });
    }
  }
  const b1 = aOrdinary > 0 && cOrdinary === 0;
  const lowN = aLaunches < MIN_LAUNCHES;
  const b2 = !lowN && aMissed === 0 && aSpamDays === 0 && aUnmatched === 0 && aUnexplainedReseed === 0 && aMalformed === 0;
  const b3 = guardrailMismatches.length === 0;
  let verdict;
  if (lowN) verdict = 'REPORTED / LOW-N';
  else if (b1 && b2 && b3) verdict = 'GO';
  else verdict = 'NO-GO';
  return {
    verdict: verdict,
    bars: {
      B1_ordinaryBeatsArmed: aOrdinary, B1_ordinaryBeatsControl: cOrdinary, B1_pass: b1,
      B2_launchesArmed: aLaunches, B2_missedLaunches: aMissed, B2_spamDays: aSpamDays,
      B2_unmatchedBeatLines: aUnmatched, B2_unexplainedReseedBeats: aUnexplainedReseed,
      B2_malformedBeatLines: aMalformed,
      B2_floor: MIN_LAUNCHES, B2_lowN: lowN, B2_pass: b2,
      B3_guardrailMismatches: guardrailMismatches, B3_pass: b3,
    },
    totals: {
      armedSeeds: armed.length, controlSeeds: control.length,
      armedLaunches: aLaunches,
      controlLaunches: control.reduce(function (s, x) { return s + x.launches; }, 0),
      armedOrdinaryBeats: aOrdinary, armedReseedBeats: armed.reduce(function (s, x) { return s + x.reseedBeats; }, 0),
      controlOrdinaryBeats: cOrdinary, controlReseedBeats: control.reduce(function (s, x) { return s + x.reseedBeats; }, 0),
      armedDeaths: aDeaths, controlDeaths: cDeaths,
      armedSurvived: armed.filter(function (x) { return x.endReason === 'survived'; }).length,
      controlSurvived: control.filter(function (x) { return x.endReason === 'survived'; }).length,
      armedMedianDays: median(armed.map(function (x) { return x.days; })),
      controlMedianDays: median(control.map(function (x) { return x.days; })),
    },
  };
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('PASS ' + name); }
    else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  function seedDoc(seed, rows, says, deaths) {
    return { seed: seed, endReason: 'survived', days: 150, won: 0, standing: 100, maxWave: 4,
      v4departs: rows, vetSays: says, deaths: deaths || [],
      departbeatFlag: null, planreseedFlag: '1', instrumentErrors: [] };
  }
  function launchRow(day, vid, target) {
    return { day: day, vid: vid, result: 'launch', source: 'brain', target: target,
      targetWave: 4, party: ['c1'], partySize: 2 };
  }
  // S1: one ordinary beat on the launch day — beaten, no spam.
  const s1 = analyzeSeed(seedDoc(1, [launchRow(50, 'amina', 'herald')],
    [{ day: 50, line: 'Amina sets out with Diana after Herald — the fire marks the trail.' }]));
  check('S1 ordinary beat on the launch day: beaten, no miss, no spam',
    s1.launches === 1 && s1.ordinaryBeats === 1 && s1.missedLaunches === 0 && s1.spamDays === 0 && s1.unmatchedBeatLines === 0, s1);
  // S2: re-seed beat on the launch day counts as the launch's beat.
  const s2 = analyzeSeed(seedDoc(2, [launchRow(60, 'amina', 'eater')],
    [{ day: 60, line: 'Amina is hunting Eater now — the fire found a new trail.' }]));
  check('S2 re-seed beat on the launch day: beaten, reseed counted, no ordinary',
    s2.launches === 1 && s2.reseedBeats === 1 && s2.ordinaryBeats === 0 && s2.missedLaunches === 0, s2);
  // S3: launch with no beat that day — missed.
  const s3 = analyzeSeed(seedDoc(3, [launchRow(70, 'amina', 'herald')], []));
  check('S3 launch with no beat line: missed = 1',
    s3.launches === 1 && s3.missedLaunches === 1 && s3.missedList.length === 1, s3);
  // S4: two beat lines, one launch that day — spam day.
  const s4 = analyzeSeed(seedDoc(4, [launchRow(80, 'amina', 'herald')],
    [{ day: 80, line: 'Amina sets out with Diana after Herald — the fire marks the trail.' },
     { day: 80, line: 'Amina sets out with Diana after Herald — the fire marks the trail.' }]));
  check('S4 two beats one launch: spam day = 1',
    s4.spamDays === 1 && s4.spamDayList.length === 1 && s4.spamDayList[0].beats === 2, s4);
  // S5: beat on a day with no counted launch, no targetless row — unmatched.
  const s5 = analyzeSeed(seedDoc(5, [],
    [{ day: 90, line: 'Amina sets out with Diana after Herald — the fire marks the trail.' }]));
  check('S5 beat with no launch that day: unmatched = 1',
    s5.unmatchedBeatLines === 1 && s5.unmatchedDays.length === 1, s5);
  // S6: beat on a day with a targetless needWave>=4 launch row — explained.
  const s6doc = seedDoc(6, [], [{ day: 95, line: 'Amina sets out with Diana — the fire marks the trail.' }]);
  s6doc.v4departs = [{ day: 95, vid: 'amina', result: 'launch', source: 'brain', target: null, targetWave: 4, party: ['c1'], partySize: 2 }];
  const s6 = analyzeSeed(s6doc);
  check('S6 beat explained by a targetless needWave>=4 launch row (correction 1)',
    s6.targetlessLaunches === 1 && s6.unmatchedBeatLines === 0 && s6.explainedUnmatched === 1, s6);
  // S7: malformed beat line (empty holder slot) is flagged.
  const s7 = analyzeSeed(seedDoc(7, [launchRow(100, 'amina', 'herald')],
    [{ day: 100, line: ' sets out after Herald — the fire marks the trail.' }]));
  check('S7 malformed ordinary beat line is flagged',
    s7.malformedBeatLines === 1, s7);
  // S8: SYSTEM-wrapped beat line parses (prefix stripped for the structure check).
  const s8 = analyzeSeed(seedDoc(8, [launchRow(110, 'amina', 'herald')],
    [{ day: 110, line: '📺 SYSTEM: "Amina sets out with Diana after Herald — the fire marks the trail."' }]));
  check('S8 SYSTEM-wrapped beat line counts and parses',
    s8.ordinaryBeats === 1 && s8.malformedBeatLines === 0 && s8.missedLaunches === 0, s8);
  // S9: duplicate launch rows dedupe by (vid, day, target).
  const s9 = analyzeSeed(seedDoc(9, [launchRow(120, 'amina', 'herald'), launchRow(120, 'amina', 'herald')],
    [{ day: 120, line: 'Amina sets out with Diana after Herald — the fire marks the trail.' }]));
  check('S9 duplicate launch rows dedupe to one launch',
    s9.launches === 1 && s9.duplicates === 1, s9);
  // S10: pooled judge — GO shape (4 launches, 4 beats, identical guardrail).
  const armed = [];
  const control = [];
  for (let i = 0; i < 4; i++) {
    armed.push(analyzeSeed(seedDoc(100 + i, [launchRow(50 + i, 'amina', 'herald')],
      [{ day: 50 + i, line: 'Amina sets out with Diana after Herald — the fire marks the trail.' }],
      [{ day: 5, kind: 'monster', who: 'x', cause: 'villager combat', player: false }])));
    control.push(analyzeSeed(seedDoc(100 + i, [launchRow(50 + i, 'amina', 'herald')], [],
      [{ day: 5, kind: 'monster', who: 'x', cause: 'villager combat', player: false }])));
  }
  const j10 = judgePooled(armed, control);
  check('S10 pooled GO shape: B1+B2+B3 pass -> GO',
    j10.verdict === 'GO' && j10.bars.B1_pass && j10.bars.B2_pass && j10.bars.B3_pass, j10);
  // S11: guardrail mismatch (one extra death armed) -> NO-GO.
  const armed11 = armed.slice();
  armed11[0] = Object.assign({}, armed11[0], { deaths: armed11[0].deaths + 1 });
  const j11 = judgePooled(armed11, control);
  check('S11 one extra armed death -> guardrail mismatch, NO-GO',
    j11.verdict === 'NO-GO' && !j11.bars.B3_pass && j11.bars.B3_guardrailMismatches.length === 1, j11);
  // S12: control with an ordinary beat -> B1 fails -> NO-GO.
  const control12 = control.slice();
  control12[0] = Object.assign({}, control12[0], { ordinaryBeats: 1 });
  const j12 = judgePooled(armed, control12);
  check('S12 ordinary beat on control -> B1 fails, NO-GO',
    j12.verdict === 'NO-GO' && !j12.bars.B1_pass, j12);
  // S13: fewer than 4 launches -> REPORTED / LOW-N, not GO.
  const j13 = judgePooled(armed.slice(0, 2), control.slice(0, 2));
  check('S13 under the launch floor -> REPORTED / LOW-N',
    j13.verdict === 'REPORTED / LOW-N' && j13.bars.B2_lowN, j13);
  // S14: wave-3 launch rows (targetWave 3) are not launches.
  const s14 = analyzeSeed(seedDoc(14, [{ day: 130, vid: 'amina', result: 'launch', source: 'brain', target: 'spool', targetWave: 3, party: ['c1'], partySize: 2 }], []));
  check('S14 wave-3 launch row is not a wave-4+ launch',
    s14.launches === 0, s14);
  // S15 (correction 2): a re-seed beat on a wave-3 launch day — the
  // launch row exists (targetWave 3), no counted launch — is
  // explained, not spam, not unmatched. (The 106776 d36 shape.)
  const s15doc = seedDoc(15, [], [{ day: 36, line: 'Dale is hunting The Terms of Service now — the fire found a new trail.' }]);
  s15doc.v4departs = [{ day: 36, vid: 'dale_hoffman', result: 'launch', source: 'brain', target: 'terms_of_service', targetWave: 3, party: ['maya_singh'], partySize: 2 }];
  const s15 = analyzeSeed(s15doc);
  check('S15 wave-3 re-seed launch beat is explained by its launch row (correction 2)',
    s15.launches === 0 && s15.reseedBeats === 1 && s15.spamDays === 0 && s15.unmatchedBeatLines === 0 && s15.unexplainedReseedBeats === 0, s15);
  // S16: one wave-4+ launch day carrying an ordinary beat AND a
  // re-seed beat (a same-day wave-3 re-seed launch) — the ordinary
  // count is exact, the re-seed line is explained by the day's
  // counted launch; no spam, no miss.
  const s16doc = seedDoc(16, [launchRow(50, 'amina', 'herald')],
    [{ day: 50, line: 'Amina sets out with Diana after Herald — the fire marks the trail.' },
     { day: 50, line: 'Dale is hunting The Terms of Service now — the fire found a new trail.' }]);
  const s16 = analyzeSeed(s16doc);
  check('S16 ordinary + re-seed beats on one launch day: no spam, no miss',
    s16.launches === 1 && s16.spamDays === 0 && s16.missedLaunches === 0 && s16.unexplainedReseedBeats === 0, s16);
  // S17: a re-seed beat with NO launch row at all that day stays
  // unexplained and fails B2.
  const s17 = analyzeSeed(seedDoc(17, [], [{ day: 60, line: 'Dale is hunting The Terms of Service now — the fire found a new trail.' }]));
  check('S17 re-seed beat with no launch row that day is unexplained',
    s17.unexplainedReseedBeats === 1, s17);
  const j17 = judgePooled(
    [analyzeSeed(seedDoc(117, [launchRow(60, 'amina', 'herald')],
      [{ day: 60, line: 'Amina sets out with Diana after Herald — the fire marks the trail.' }], [])),
     analyzeSeed(seedDoc(118, [launchRow(61, 'amina', 'herald')],
      [{ day: 61, line: 'Amina sets out with Diana after Herald — the fire marks the trail.' }], [])),
     analyzeSeed(seedDoc(119, [launchRow(62, 'amina', 'herald')],
      [{ day: 62, line: 'Amina sets out with Diana after Herald — the fire marks the trail.' }], [])),
     analyzeSeed(seedDoc(120, [launchRow(63, 'amina', 'herald')],
      [{ day: 63, line: 'Amina sets out with Diana after Herald — the fire marks the trail.' }], []))].map(function (x, i) {
        return i === 3 ? Object.assign({}, x, { unexplainedReseedBeats: 1 }) : x;
      }),
    [analyzeSeed(seedDoc(117, [launchRow(60, 'amina', 'herald')], [], [])),
     analyzeSeed(seedDoc(118, [launchRow(61, 'amina', 'herald')], [], [])),
     analyzeSeed(seedDoc(119, [launchRow(62, 'amina', 'herald')], [], [])),
     analyzeSeed(seedDoc(120, [launchRow(63, 'amina', 'herald')], [], []))]);
  check('S17 pooled: an unexplained re-seed beat fails B2 -> NO-GO',
    j17.verdict === 'NO-GO' && !j17.bars.B2_pass, j17);
  console.log('analyze-departbeat-b selftest: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  const dirs = [];
  let dir2 = null;
  let outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dirs.push(args[++i]);
    else if (args[i] === '--dir2') dir2 = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!dirs.length) { console.error('usage: analyze-departbeat-b.js --dir DIR [--dir2 DIR2] [--out FILE] | --selftest'); process.exit(2); }
  const armedDocs = [];
  for (const dir of dirs) armedDocs.push.apply(armedDocs, loadDir(dir));
  const armed = armedDocs.map(analyzeSeed);
  let control = [];
  if (dir2) control = loadDir(dir2).map(analyzeSeed);
  const judged = judgePooled(armed, control);
  const result = { arm: 'sim-departbeat-b', band: '106771-106778', horizonDays: 150,
    armedDirs: dirs, controlDir: dir2, perSeed: armed, perSeedControl: control,
    judge: judged };
  console.log(JSON.stringify({ verdict: judged.verdict, bars: judged.bars, totals: judged.totals }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}

module.exports = { launchesOf: launchesOf, beatsOf: beatsOf, targetlessLaunchesOf: targetlessLaunchesOf,
  analyzeSeed: analyzeSeed, judgePooled: judgePooled, selftest: selftest,
  DEPART_BEAT_RE: DEPART_BEAT_RE, RESEED_BEAT_RE: RESEED_BEAT_RE };
