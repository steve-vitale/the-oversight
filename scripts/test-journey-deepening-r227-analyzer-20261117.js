'use strict';
// test-journey-deepening-r227-analyzer-20261117.js -- R226 analyzer proof
// (runs the REAL r227 analyzer on synthetic inputs; no driver needed).
// (31)-(35) NEW r227: the titan-muster summarizer — (31) BLANK shape,
// (32) MOVED shape, (33) NO-TITAN shape, (34) wave-split stall
// (the r222 metric-review owed item: old stall 'flows' masks a stalled
// wave-4 pipeline), (35) panel wiring for the Q1-TITAN print.
// (27)-(30) NEW r222: the trick-pipeline summarizer — (27) flows shape,
// (28) teachable-never-seen, (29) obs-stalled (wave-3, 1/2 observations),
// (30) panel verdict TRICK-PIPELINE-FINDING on taughtRate=0.
// RED CONTROL: run with ANALYZER=./analyze-journey-deepening-r218-20261115.js
// — (27)-(30) FAIL (summarizeTrickPipeline absent in r218), (22)-(26)
// behave as the r218 proof documents.
// (22)-(25) NEW r222: the winddown parting measure (22)-(24) and the frozen
// W4 id set (25). (22) proves the verdict moved off `closing line:`: a
// plain-pool line carried only by a winddown line still reads PLAIN-
// PARTING. (23)/(24) pin OTHER-CLOSE / NO-CLOSE on the winddown lines.
// RED CONTROL: run with ANALYZER=./analyze-journey-deepening-r213-20261115.js
// — (22)-(24) FAIL (r213 reads only `closing line:`), (25)/(26) FAIL
// (functions absent in r213), (21) passes (the helper still emits a
// closing line),
// carried (1)-(20) behave as the r213 proof documents.
// (11)-(14) CARRIED r212: the A2 floor (total < 6 -> THIN-PROBE) in
// summarizeFavorBlock / summarizePartnerBlock — thin panels read
// THIN-PROBE, real repetition at total >= 6 still reads REPETITIVE.
// (15)-(21) NEW r222: the third branch (WATCH-CONTINUES when the
// dominant wording spreads across >= 4 independent sittings, <= 1 firing
// each) in all three block summarizers; the frozen W5 id set; the
// parting-close read. (19) RED CONTROL: run with
// ANALYZER=./analyze-journey-deepening-r212-20261115.js — (15)/(17)/(18)
// FAIL (r212 reads REPETITIVE), (16) passes, (20)/(21) fail (functions
// absent in r212), carried (1)-(14) behave as the r212 proof documents.
// classifyOrphanTrace (carried from r189 — the Stan r188 orphan joined to
// the driver favor trace; the only new analyzer function that run):
//   (1) Stan shape: orphan, favor built the same day as the re-ask,
//       followup site stage0-guard -> NEVER-SPOKEN-SAME-SITTING.
//   (2) Seed-planted earlier build, no prior driver sitting named the
//       short -> SPOKEN-BEFORE (the ask surfaced in a policy talkTo
//       sitting the driver never transcribed; instrument artifact).
//   (3) Prior driver sitting DID name the short (classifier-level) ->
//       SPOKEN-BEFORE.
//   (4) Earlier build, no seed ever planted, no prior sitting ->
//       NEVER-SPOKEN-EARLIER-BUILD.
//   (5) Orphan whose want line carried fromSeed -> FROMSEED (no trace
//       lookup; the favor predates the panel window).
//   (6) Orphan with no followup event in the trace -> UNTRACED (trace
//       gap; never a verdict).
//   (7) Site names map: 692 opener-fromSeed, 721 opener-inherited,
//       7017 stage0-guard, anything else 'other'.
// Panel (real main() on synthetic seed JSONs + transcripts in a temp dir):
//   (8) a Stan-shaped seed JSON + transcript -> ORPHAN-TRACE PANEL
//       NEVER-SPOKEN-SAME-SITTING=1 and RE-ASK-ORPHAN PANEL
//       true-no-thread=1.
//   (9) carried r193: seed JSON with knowCounts.moot=12, markerCounts.moot=9,
//       mootEventDays=3 -> K-CONTEXT prints mootMentions=12 mootEvents=3.
//   (10) carried r193: seed JSON without mootEventDays (old shape) -> K-CONTEXT
//       prints mootEvents=n/a (backward compat, no crash).
// RED/FAILURE MODE: run with ANALYZER=./analyze-journey-deepening-r212-20261115.js
// — (1)-(7) pass (direct calls, carried), (8)-(10) FAIL on filename
// mismatch (r212 reads only r212 seed files — expected, same shape as the
// r212 proof's own red mode), (11)-(14) pass (the floor is unchanged),
// (15)/(17)/(18) FAIL on the missing third branch (r212 reads the
// spread shapes as REPETITIVE — the discriminating failure), (16)
// passes (the stuck shape stays REPETITIVE under both), (20)/(21) FAIL
// (summarizeWave5 / summarizeParting are absent in r212 — the test
// records the missing function instead of throwing).
// The AWAY summarizer is NOT floored: its total < 3 rule is untouched,
// so a total=4 away panel still reads REPETITIVE by share; the third
// branch applies to AWAY, the floor does not move.
const A = require(process.env.ANALYZER || './analyze-journey-deepening-r227-20261117.js');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function seedJSON(over) {
  const base = { seed: 100051, census: [{ id: 'v_h1' }, { id: 'v_h2' }], deaths: [],
    bond: { tele: [], proposals: [], decisions: [], links: [], sayLines: [], daily: [], convoEvents: [], errors: [] },
    talkReqSnaps: [], langGateOffers: [], langGateDecisions: [],
    langArcSittings: [], langArcDays: [], talkedSittings: [], langGrants: [],
    langArcEnd: { langs: [], learned: {} }, goalSnaps: [], goalLineDays: [],
    goalLines: { counts: {}, total: 0 },
    ladderSnaps: [], trustSnaps: [], trustDeaths: [], secretSittings: [] };
  return Object.assign(base, over || {});
}
function runPanel(name, seeds, transcripts) {
  const dir = fs.mkdtempSync(path.join('/tmp', 'r227-panel-'));
  seeds.forEach((s, i) => fs.writeFileSync(path.join(dir, `journey-deepening-r227-on-seed${100051 + i}.json`), JSON.stringify(s)));
  (transcripts || []).forEach(t => fs.writeFileSync(path.join(dir, t.name), t.text));
  let out = '';
  try {
    out = execFileSync('node', [path.join(__dirname, process.env.ANALYZER || 'analyze-journey-deepening-r227-20261117.js'), dir], { encoding: 'utf8' });
  } catch (e) { out = (e && e.stdout) ? String(e.stdout) : ''; }
  fs.rmSync(dir, { recursive: true, force: true });
  return out;
}
const STAN_SHORT = 'the food I needed';
const STAN_LINE = '"About the food I needed — the need hasn\'t gone anywhere. I\'m still asking."';
function stanTranscript(day) {
  return ['=== seed 100051 day ' + day + ' — conversation with Stan (stan_kowalski) ===',
    'occupation=exterminator temperament=dry trust=95 dead=false mood=hungry',
    'want: ask_favor (stage 1)', '',
    'THEM: ' + STAN_LINE,
    '(offered=dlg:commit,dlg:favor_requirements,dlg:details,dlg:cant,goon,dlg:subject,leave,silence)',
    'YOU: [dlg:commit] "I’ll come back to help."',
    'THEM: "Thank you. I won\'t forget who fed me when it mattered."',
    '(want=ask_favor stage=3 resolution=promised)',
    'YOU: (leave)',
    'closing line: "Well. That was almost a conversation. We\'re improving."',
    'betrayal branch: none',
    'want final: id=ask_favor stage=3 resolution=promised'].join('\n');
}
function trace(over) {
  const base = { builds: [], seeds: [], followups: [] };
  return Object.assign(base, over || {});
}
// (1) Stan shape: built + re-asked the same day, stage0-guard site.
{
  const orphans = [{ seed: '100051', day: 60, vid: 'stan_kowalski', short: STAN_SHORT, line: STAN_LINE, fromSeed: false }];
  const transcripts = [{ seed: '100051', day: 60, vid: 'stan_kowalski', text: stanTranscript(60) }];
  const ft = { 100051: { trace: trace({
    builds: [{ day: 60, vid: 'stan_kowalski', favorId: 'favor-stan_kowalski-60-1', short: STAN_SHORT, kind: 'food_share', state: 'asked' }],
    followups: [{ day: 60, vid: 'stan_kowalski', favorId: 'favor-stan_kowalski-60-1', short: STAN_SHORT, state: 'asked', line: STAN_LINE, site: 'conversation.js:7017' }],
  }), sittings: [] } };
  const r = A.classifyOrphanTrace(orphans, transcripts, ft);
  ok('(1) Stan shape -> NEVER-SPOKEN-SAME-SITTING, siteName stage0-guard',
    r.detail[0].cls === 'NEVER-SPOKEN-SAME-SITTING' && r.detail[0].siteName === 'stage0-guard' && r.detail[0].buildDay === 60 && r.counts['NEVER-SPOKEN-SAME-SITTING'] === 1, JSON.stringify(r.detail));
}
// (2) Earlier build + planted seed, no prior driver sitting -> SPOKEN-BEFORE.
{
  const orphans = [{ seed: '100051', day: 60, vid: 'stan_kowalski', short: STAN_SHORT, line: STAN_LINE, fromSeed: false }];
  const transcripts = [{ seed: '100051', day: 60, vid: 'stan_kowalski', text: stanTranscript(60) }];
  const ft = { 100051: { trace: trace({
    builds: [{ day: 52, vid: 'stan_kowalski', favorId: 'favor-stan_kowalski-52-1', short: STAN_SHORT, kind: 'food_share', state: 'asked' }],
    seeds: [{ day: 53, vid: 'stan_kowalski', wantId: 'ask_favor', favorId: 'favor-stan_kowalski-52-1', note: 'the help I asked you for' }],
    followups: [{ day: 60, vid: 'stan_kowalski', favorId: 'favor-stan_kowalski-52-1', short: STAN_SHORT, state: 'asked', line: STAN_LINE, site: 'convo-wants.js:692' }],
  }), sittings: [] } };
  const r = A.classifyOrphanTrace(orphans, transcripts, ft);
  ok('(2) earlier build + planted seed, no prior driver sitting -> SPOKEN-BEFORE, siteName opener-fromSeed',
    r.detail[0].cls === 'SPOKEN-BEFORE' && r.detail[0].siteName === 'opener-fromSeed' && r.detail[0].seedPlantedDay === 53, JSON.stringify(r.detail));
}
// (3) Prior driver sitting named the short -> SPOKEN-BEFORE.
{
  const orphans = [{ seed: '100051', day: 60, vid: 'stan_kowalski', short: STAN_SHORT, line: STAN_LINE, fromSeed: false }];
  const earlier = ['want: ask_favor (stage 1)', '', 'THEM: "I hate to ask, but do you have anything to eat? Anything at all? My hands shake when I try to work."', 'THEM: "About the food I needed — still on my mind. I keep coming back to it."'].join('\n');
  const transcripts = [
    { seed: '100051', day: 45, vid: 'stan_kowalski', text: earlier },
    { seed: '100051', day: 60, vid: 'stan_kowalski', text: stanTranscript(60) },
  ];
  const ft = { 100051: { trace: trace({
    builds: [{ day: 45, vid: 'stan_kowalski', favorId: 'favor-stan_kowalski-45-1', short: STAN_SHORT, kind: 'food_share', state: 'asked' }],
    followups: [{ day: 60, vid: 'stan_kowalski', favorId: 'favor-stan_kowalski-45-1', short: STAN_SHORT, state: 'asked', line: STAN_LINE, site: 'convo-wants.js:692' }],
  }), sittings: [] } };
  const r = A.classifyOrphanTrace(orphans, transcripts, ft);
  ok('(3) prior driver sitting named the short -> SPOKEN-BEFORE, priorSittings=1 priorNamed=true',
    r.detail[0].cls === 'SPOKEN-BEFORE' && r.detail[0].priorSittings === 1 && r.detail[0].priorNamed === true, JSON.stringify(r.detail));
}
// (4) Earlier build, no seed, no prior sitting -> NEVER-SPOKEN-EARLIER-BUILD.
{
  const orphans = [{ seed: '100051', day: 60, vid: 'stan_kowalski', short: STAN_SHORT, line: STAN_LINE, fromSeed: false }];
  const transcripts = [{ seed: '100051', day: 60, vid: 'stan_kowalski', text: stanTranscript(60) }];
  const ft = { 100051: { trace: trace({
    builds: [{ day: 52, vid: 'stan_kowalski', favorId: 'favor-stan_kowalski-52-1', short: STAN_SHORT, kind: 'food_share', state: 'asked' }],
    followups: [{ day: 60, vid: 'stan_kowalski', favorId: 'favor-stan_kowalski-52-1', short: STAN_SHORT, state: 'asked', line: STAN_LINE, site: 'convo-wants.js:721' }],
  }), sittings: [] } };
  const r = A.classifyOrphanTrace(orphans, transcripts, ft);
  ok('(4) earlier build, no seed, no prior sitting -> NEVER-SPOKEN-EARLIER-BUILD, siteName opener-inherited',
    r.detail[0].cls === 'NEVER-SPOKEN-EARLIER-BUILD' && r.detail[0].siteName === 'opener-inherited' && r.detail[0].seedPlantedDay === null, JSON.stringify(r.detail));
}
// (5) fromSeed orphan -> FROMSEED, no trace lookup.
{
  const orphans = [{ seed: '100051', day: 60, vid: 'stan_kowalski', short: STAN_SHORT, line: STAN_LINE, fromSeed: true }];
  const transcripts = [{ seed: '100051', day: 60, vid: 'stan_kowalski', text: stanTranscript(60) }];
  const r = A.classifyOrphanTrace(orphans, transcripts, {});
  ok('(5) fromSeed orphan -> FROMSEED with null site/buildDay',
    r.detail[0].cls === 'FROMSEED' && r.detail[0].site === null && r.detail[0].buildDay === null, JSON.stringify(r.detail));
}
// (6) No followup event -> UNTRACED.
{
  const orphans = [{ seed: '100051', day: 60, vid: 'stan_kowalski', short: STAN_SHORT, line: STAN_LINE, fromSeed: false }];
  const transcripts = [{ seed: '100051', day: 60, vid: 'stan_kowalski', text: stanTranscript(60) }];
  const ft = { 100051: { trace: trace({ builds: [], seeds: [], followups: [] }), sittings: [] } };
  const r = A.classifyOrphanTrace(orphans, transcripts, ft);
  ok('(6) no followup event -> UNTRACED',
    r.detail[0].cls === 'UNTRACED' && r.counts['UNTRACED'] === 1, JSON.stringify(r.detail));
}
// (7) Unknown site -> siteName 'other'.
{
  const orphans = [{ seed: '100051', day: 60, vid: 'stan_kowalski', short: STAN_SHORT, line: STAN_LINE, fromSeed: false }];
  const transcripts = [{ seed: '100051', day: 60, vid: 'stan_kowalski', text: stanTranscript(60) }];
  const ft = { 100051: { trace: trace({
    builds: [{ day: 60, vid: 'stan_kowalski', favorId: 'favor-stan_kowalski-60-1', short: STAN_SHORT, kind: 'food_share', state: 'asked' }],
    followups: [{ day: 60, vid: 'stan_kowalski', favorId: 'favor-stan_kowalski-60-1', short: STAN_SHORT, state: 'asked', line: STAN_LINE, site: 'convo-wants.js:9999' }],
  }), sittings: [] } };
  const r = A.classifyOrphanTrace(orphans, transcripts, ft);
  ok('(7) unknown call site -> siteName other, cls still NEVER-SPOKEN-SAME-SITTING',
    r.detail[0].siteName === 'other' && r.detail[0].cls === 'NEVER-SPOKEN-SAME-SITTING', JSON.stringify(r.detail));
}
// (8) Panel: real main() on a Stan-shaped seed JSON + transcript.
{
  const seeds = [seedJSON({ favorTrace: trace({
    builds: [{ day: 60, vid: 'stan_kowalski', favorId: 'favor-stan_kowalski-60-1', short: STAN_SHORT, kind: 'food_share', state: 'asked' }],
    followups: [{ day: 60, vid: 'stan_kowalski', favorId: 'favor-stan_kowalski-60-1', short: STAN_SHORT, state: 'asked', line: STAN_LINE, site: 'conversation.js:7017' }],
  }), favorTraceSittings: [{ day: 60, vid: 'stan_kowalski', start: { favor: null, seed: null }, end: { favor: { id: 'favor-stan_kowalski-60-1', short: STAN_SHORT, kind: 'food_share', state: 'promised', askedDay: 60 }, seed: null } }] })];
  const transcripts = [{ name: 'journey-deepening-r227-on-transcript-100051-day60-stan_kowalski.txt', text: stanTranscript(60) }];
  const out = runPanel('orphan-trace', seeds, transcripts);
  ok('(8) panel prints ORPHAN-TRACE NEVER-SPOKEN-SAME-SITTING=1 + RE-ASK-ORPHAN true-no-thread=1',
    /ORPHAN-TRACE PANEL:.*NEVER-SPOKEN-SAME-SITTING=1/.test(out) &&
    /RE-ASK-ORPHAN PANEL:.*true-no-thread=1/.test(out),
    out.split('\n').filter(l => /ORPHAN-TRACE PANEL|RE-ASK-ORPHAN PANEL/.test(l)).join(' | '));
}
// (9) NEW r212: moot-events K-CONTEXT line.
{
  const seeds = [seedJSON({ knowCounts: { experiment: 0, traderDeep: 0, moot: 12 },
    markerCounts: { exile: 0, moot: 9, theft: 0, confrontation: 0 },
    mootEventDays: 3, mootEventDayList: [12, 33, 61] })];
  const out = runPanel('moot-events', seeds, []);
  ok('(9) K-CONTEXT prints mootMentions=12 mootEvents=3 (not knowMoot=)',
    /K-CONTEXT:.*mootMentions=12 mootEvents=3/.test(out) && !/knowMoot=/.test(out),
    out.split('\n').filter(l => /K-CONTEXT/.test(l)).join(' | '));
}
// (10) NEW r212: old-shape seed JSON (no mootEventDays) -> mootEvents=n/a.
{
  const seeds = [seedJSON({ knowCounts: { experiment: 0, traderDeep: 0, moot: 5 },
    markerCounts: { exile: 0, moot: 4, theft: 0, confrontation: 0 } })];
  const out = runPanel('moot-events-na', seeds, []);
  ok('(10) K-CONTEXT prints mootEvents=n/a for old-shape seed JSON',
    /K-CONTEXT:.*mootMentions=5 mootEvents=n\/a/.test(out),
    out.split('\n').filter(l => /K-CONTEXT/.test(l)).join(' | '));
}
// (11)-(14) NEW r212: the A2 floor. Synthetic block transcripts, one
// THEM line per sitting, built from the analyzer's own patterns.
const FB_NEXTTO = 'Move next to them, on the same side of the Haven door, to help.';
const FB_BESIDE = 'Stand beside them first — same side of the Haven door — then help.';
const FB_RIGHTNEXT = 'You need to be right next to them, same side of the Haven door, to help.';
const PB_NEXTTO = 'Move next to your partner, on the same side of the Haven door.';
const PB_BESIDE = 'Stand beside your partner first — same side of the Haven door — then help.';
const PB_RIGHTNEXT = 'You need to be right next to your partner, same side of the Haven door, to help.';
function blockTranscript(seed, day, vid, lines) {
  return { seed: String(seed), day, vid, text: lines.map(l => 'THEM: ' + l).join('\n') };
}
// (11) Favorblock, the r193 shape: total=4 distinct=3 maxRepeat=2 -> THIN-PROBE.
{
  const ts = [
    blockTranscript(100091, 45, 'v_a', [FB_RIGHTNEXT]),
    blockTranscript(100092, 60, 'v_b', [FB_RIGHTNEXT]),
    blockTranscript(100093, 45, 'v_c', [FB_NEXTTO]),
    blockTranscript(100094, 80, 'v_d', [FB_BESIDE]),
  ];
  const r = A.summarizeFavorBlock(ts);
  ok('(11) favorblock total=4 distinct=3 maxRepeat=2 -> THIN-PROBE (was REPETITIVE)',
    r.total === 4 && r.distinct === 3 && r.maxRepeat === 2 && r.verdict === 'THIN-PROBE', JSON.stringify(r));
}
// (12) Favorblock at total=6, share 0.5 -> REPETITIVE still fires.
{
  const ts = [
    blockTranscript(100091, 45, 'v_a', [FB_RIGHTNEXT]),
    blockTranscript(100092, 60, 'v_b', [FB_RIGHTNEXT]),
    blockTranscript(100093, 80, 'v_c', [FB_RIGHTNEXT]),
    blockTranscript(100094, 45, 'v_d', [FB_NEXTTO]),
    blockTranscript(100095, 60, 'v_e', [FB_NEXTTO]),
    blockTranscript(100096, 45, 'v_f', [FB_BESIDE]),
  ];
  const r = A.summarizeFavorBlock(ts);
  ok('(12) favorblock total=6 distinct=3 maxRepeat=3 share 0.5 -> REPETITIVE',
    r.total === 6 && r.distinct === 3 && r.maxRepeat === 3 && r.verdict === 'REPETITIVE', JSON.stringify(r));
}
// (13) Partnerblock, the r193 shape: total=4 distinct=3 maxRepeat=2 -> THIN-PROBE.
{
  const ts = [
    blockTranscript(100091, 45, 'v_a', [PB_RIGHTNEXT]),
    blockTranscript(100092, 60, 'v_b', [PB_RIGHTNEXT]),
    blockTranscript(100093, 45, 'v_c', [PB_NEXTTO]),
    blockTranscript(100094, 80, 'v_d', [PB_BESIDE]),
  ];
  const r = A.summarizePartnerBlock(ts);
  ok('(13) partnerblock total=4 distinct=3 maxRepeat=2 -> THIN-PROBE (was REPETITIVE)',
    r.total === 4 && r.distinct === 3 && r.maxRepeat === 2 && r.verdict === 'THIN-PROBE', JSON.stringify(r));
}
// (14) Partnerblock at total=6, share 0.5 -> REPETITIVE still fires.
{
  const ts = [
    blockTranscript(100091, 45, 'v_a', [PB_RIGHTNEXT]),
    blockTranscript(100092, 60, 'v_b', [PB_RIGHTNEXT]),
    blockTranscript(100093, 80, 'v_c', [PB_RIGHTNEXT]),
    blockTranscript(100094, 45, 'v_d', [PB_NEXTTO]),
    blockTranscript(100095, 60, 'v_e', [PB_NEXTTO]),
    blockTranscript(100096, 45, 'v_f', [PB_BESIDE]),
  ];
  const r = A.summarizePartnerBlock(ts);
  ok('(14) partnerblock total=6 distinct=3 maxRepeat=3 share 0.5 -> REPETITIVE',
    r.total === 6 && r.distinct === 3 && r.maxRepeat === 3 && r.verdict === 'REPETITIVE', JSON.stringify(r));
}
// (15)-(18) NEW r222: the third branch. Synthetic block transcripts,
// one THEM line per sitting unless the check says otherwise.
const AWAY_RIGHTNOW = '"Wait — I\'m away from Haven right now, out on the road. I can\'t promise a dawn meet from out here — find me when I\'m back and we\'ll set it then."';
const AWAY_DAWNMEET = '"Out on the road, away from Haven. A dawn meet\'s not something I can promise while I\'m out — when I\'m back, find me, and we\'ll set it then."';
const AWAY_OUTROAD = '"I\'m out on the road, away from Haven — no dawn meet while I\'m out, I\'m afraid. Catch me when I\'m back and we\'ll set it then."';
// (15) Partnerblock, the r212 panel shape: total=11 distinct=3 beside 7
// across 7 sittings (1 each) -> WATCH-CONTINUES (was REPETITIVE).
{
  const ts = [
    blockTranscript(100111, 45, 'v_a', [PB_BESIDE]),
    blockTranscript(100112, 60, 'v_b', [PB_BESIDE]),
    blockTranscript(100113, 45, 'v_c', [PB_BESIDE]),
    blockTranscript(100114, 80, 'v_d', [PB_BESIDE]),
    blockTranscript(100115, 45, 'v_e', [PB_BESIDE]),
    blockTranscript(100116, 60, 'v_f', [PB_BESIDE]),
    blockTranscript(100117, 45, 'v_g', [PB_BESIDE]),
    blockTranscript(100118, 60, 'v_h', [PB_NEXTTO]),
    blockTranscript(100111, 60, 'v_i', [PB_NEXTTO]),
    blockTranscript(100112, 45, 'v_j', [PB_RIGHTNEXT]),
    blockTranscript(100113, 80, 'v_k', [PB_RIGHTNEXT]),
  ];
  const r = A.summarizePartnerBlock(ts);
  ok('(15) partnerblock total=11 distinct=3 beside 7 across 7 sittings -> WATCH-CONTINUES',
    r.total === 11 && r.distinct === 3 && r.maxRepeat === 7 && r.dominant === 'partnerblock-beside' && r.dominantSittings === 7 && r.dominantMaxPerSitting === 1 && r.dominantSeeds === 7 && r.verdict === 'WATCH-CONTINUES', JSON.stringify(r));
}
// (16) Partnerblock, same totals but beside 7 stuck in 2 sittings (4+3)
// -> REPETITIVE (the branch must NOT fire on a stuck shape).
{
  const ts = [
    blockTranscript(100111, 45, 'v_a', [PB_BESIDE, PB_BESIDE, PB_BESIDE, PB_BESIDE]),
    blockTranscript(100112, 60, 'v_b', [PB_BESIDE, PB_BESIDE, PB_BESIDE]),
    blockTranscript(100113, 45, 'v_c', [PB_NEXTTO, PB_NEXTTO]),
    blockTranscript(100114, 80, 'v_d', [PB_RIGHTNEXT, PB_RIGHTNEXT]),
  ];
  const r = A.summarizePartnerBlock(ts);
  ok('(16) partnerblock total=11 beside 7 in 2 sittings (4+3) -> REPETITIVE',
    r.total === 11 && r.distinct === 3 && r.maxRepeat === 7 && r.verdict === 'REPETITIVE' &&
    (r.dominantSittings === undefined || (r.dominantSittings === 2 && r.dominantMaxPerSitting === 4)), JSON.stringify(r));
}
// (17) Favorblock, the r212 panel shape -> WATCH-CONTINUES.
{
  const ts = [
    blockTranscript(100111, 45, 'v_a', [FB_BESIDE]),
    blockTranscript(100112, 60, 'v_b', [FB_BESIDE]),
    blockTranscript(100113, 45, 'v_c', [FB_BESIDE]),
    blockTranscript(100114, 80, 'v_d', [FB_BESIDE]),
    blockTranscript(100115, 45, 'v_e', [FB_BESIDE]),
    blockTranscript(100116, 60, 'v_f', [FB_BESIDE]),
    blockTranscript(100117, 45, 'v_g', [FB_BESIDE]),
    blockTranscript(100118, 60, 'v_h', [FB_NEXTTO]),
    blockTranscript(100111, 60, 'v_i', [FB_NEXTTO]),
    blockTranscript(100112, 45, 'v_j', [FB_RIGHTNEXT]),
    blockTranscript(100113, 80, 'v_k', [FB_RIGHTNEXT]),
  ];
  const r = A.summarizeFavorBlock(ts);
  ok('(17) favorblock total=11 distinct=3 beside 7 across 7 sittings -> WATCH-CONTINUES',
    r.total === 11 && r.distinct === 3 && r.maxRepeat === 7 && r.dominant === 'favorblock-beside' && r.dominantSittings === 7 && r.dominantMaxPerSitting === 1 && r.verdict === 'WATCH-CONTINUES', JSON.stringify(r));
}
// (18) Away, the r212 shape: total=9 distinct=3 rightnow 5 across 5
// sittings (1 each) -> WATCH-CONTINUES (was REPETITIVE).
{
  const ts = [
    blockTranscript(100111, 45, 'v_a', [AWAY_RIGHTNOW]),
    blockTranscript(100112, 60, 'v_b', [AWAY_RIGHTNOW]),
    blockTranscript(100113, 45, 'v_c', [AWAY_RIGHTNOW]),
    blockTranscript(100114, 80, 'v_d', [AWAY_RIGHTNOW]),
    blockTranscript(100115, 45, 'v_e', [AWAY_RIGHTNOW]),
    blockTranscript(100116, 60, 'v_f', [AWAY_DAWNMEET]),
    blockTranscript(100117, 45, 'v_g', [AWAY_DAWNMEET]),
    blockTranscript(100118, 60, 'v_h', [AWAY_DAWNMEET]),
    blockTranscript(100111, 60, 'v_i', [AWAY_OUTROAD]),
  ];
  const r = A.summarizeAwayLineVariety(ts);
  ok('(18) away total=9 distinct=3 rightnow 5 across 5 sittings -> WATCH-CONTINUES',
    r.total === 9 && r.distinct === 3 && r.maxRepeat === 5 && r.dominant === 'awayline-rightnow' && r.dominantSittings === 5 && r.dominantMaxPerSitting === 1 && r.verdict === 'WATCH-CONTINUES', JSON.stringify(r));
}
// (19) RED CONTROL is the ANALYZER=./analyze-journey-deepening-r212-20261115.js
// run (see the header): (15)/(17)/(18) fail there, (16) passes. No code
// here — the control is the invocation, not an assertion.
// (20) Frozen W5 id set still matches the monsters.json wave-5 roster.
{
  const hasFn = typeof A.loadWave5Ids === 'function' && Array.isArray(A.W5_IDS);
  let idsMatch = false, n = null;
  if (hasFn) {
    try {
      const live = A.loadWave5Ids().slice().sort();
      const frozen = A.W5_IDS.slice().sort();
      idsMatch = JSON.stringify(live) === JSON.stringify(frozen);
      n = frozen.length;
    } catch (e) { idsMatch = false; }
  }
  ok('(20) frozen W5 id set matches src/data/monsters.json wave-5 roster (10 ids)',
    hasFn && idsMatch && n === 10 && A.W5_IDS.indexOf('editor') !== -1,
    hasFn ? ('frozen=' + JSON.stringify(A.W5_IDS)) : 'loadWave5Ids/W5_IDS missing in this analyzer');
}
  function partingTranscript(seed, day, vid, closing, winddown) {
    const lines = ['=== seed ' + seed + ' day ' + day + ' — conversation with X (' + vid + ') ===',
      'want: ask_favor (stage 1)', '', 'THEM: "Hello."'];
    if (closing) lines.push('closing line: ' + closing);
    if (winddown === undefined) winddown = closing;
    if (winddown) lines.push('winddown THEM: ' + winddown);
    return { seed: String(seed), day, vid, text: lines.join('\n') };
  }
// (21) Parting synthetic: each plain-pool line -> PLAIN-PARTING, a warm
// line -> WARM/COLD-PARTING, another closing line -> OTHER-CLOSE, a
// sitting with no closing line -> NO-CLOSE.
{
  const hasFn = typeof A.summarizeParting === 'function';
  let r = null;
  if (hasFn) {
    r = A.summarizeParting([
      partingTranscript(100111, 45, 'v_a', '"See you around."'),
      partingTranscript(100112, 60, 'v_b', '"Take care out there."'),
      partingTranscript(100113, 45, 'v_c', '"Same time tomorrow, maybe."'),
      partingTranscript(100114, 80, 'v_d', 'They\'re smiling as you go. "Come back anytime."'),
      partingTranscript(100115, 45, 'v_e', '"Good. We\'ve got a plan forming. I can feel it."'),
      partingTranscript(100116, 60, 'v_f', null),
    ]);
  }
  ok('(21) parting: 3 plain + 1 warm/cold + 1 other + 1 no-close (total 6)',
    hasFn && r.total === 6 && r.plain === 3 && r.warmCold === 1 && r.other === 1 && r.noClose === 1,
    hasFn ? JSON.stringify(r) : 'summarizeParting missing in this analyzer');
}
// (22) NEW r222: the winddown measure — a plain-pool line carried ONLY by
// a winddown line (closing line is a non-pool line) still reads
// PLAIN-PARTING, proving the verdict moved off `closing line:`.
{
  const hasFn = typeof A.summarizeParting === 'function';
  let r = null;
  if (hasFn) {
    r = A.summarizeParting([
      partingTranscript(100111, 45, 'v_a', '"Good. We\'ve got a plan forming. I can feel it."', '\"See you around.\"'),
      partingTranscript(100112, 60, 'v_b', '"Good. We\'ve got a plan forming. I can feel it."', '\"Take care out there.\"'),
      partingTranscript(100113, 45, 'v_c', '"Good. We\'ve got a plan forming. I can feel it."', '\"Same time tomorrow, maybe.\"'),
    ]);
  }
  ok('(22) parting winddown: 3 plain-pool winddown lines -> PLAIN-PARTING x3',
    hasFn && r.total === 3 && r.plain === 3 && r.noClose === 0,
    hasFn ? JSON.stringify(r) : 'summarizeParting missing in this analyzer');
}
// (23) NEW r222: winddown lines present, no pool match -> OTHER-CLOSE.
{
  const hasFn = typeof A.summarizeParting === 'function';
  let r = null;
  if (hasFn) {
    r = A.summarizeParting([
      partingTranscript(100111, 45, 'v_a', '"Later."', '"Later."'),
      partingTranscript(100112, 60, 'v_b', '"Good talk."', '"Good talk."'),
    ]);
  }
  ok('(23) parting winddown: non-pool winddown lines -> OTHER-CLOSE x2',
    hasFn && r.total === 2 && r.other === 2 && r.noClose === 0,
    hasFn ? JSON.stringify(r) : 'summarizeParting missing in this analyzer');
}
// (24) NEW r222: closing line present but NO winddown lines -> NO-CLOSE.
{
  const hasFn = typeof A.summarizeParting === 'function';
  let r = null;
  if (hasFn) {
    r = A.summarizeParting([
      partingTranscript(100111, 45, 'v_a', '"Later."', null),
      partingTranscript(100112, 60, 'v_b', '"Good talk."', null),
    ]);
  }
  ok('(24) parting winddown: no winddown lines -> NO-CLOSE x2 (closing line alone does not close)',
    hasFn && r.total === 2 && r.noClose === 2,
    hasFn ? JSON.stringify(r) : 'summarizeParting missing in this analyzer');
}
// (25) NEW r222: frozen W4 id set still matches the monsters.json wave-4 roster.
{
  const hasFn = typeof A.loadWave4Ids === 'function' && Array.isArray(A.W4_IDS);
  let idsMatch = false, n = null;
  if (hasFn) {
    try {
      const live = A.loadWave4Ids().slice().sort();
      const frozen = A.W4_IDS.slice().sort();
      idsMatch = JSON.stringify(live) === JSON.stringify(frozen);
      n = frozen.length;
    } catch (e) { idsMatch = false; }
  }
  ok('(25) frozen W4 id set matches src/data/monsters.json wave-4 roster (10 ids)',
    hasFn && idsMatch && n === 10 && A.W4_IDS.indexOf('reunion') !== -1,
    hasFn ? ('frozen=' + JSON.stringify(A.W4_IDS)) : 'loadWave4Ids/W4_IDS missing in this analyzer');
}
// (26) NEW r222 (Amendment A1): the w4 guard compares FIGHTS to FIGHTS —
// a triple-monster pack counts 1 fight in the table and 1 foughtWaves
// entry, but 3 in fightsByWave. No error, w4fights=1, w4kills=3.
{
  const hasFn = typeof A.summarizeWave4 === 'function';
  let r = null;
  if (hasFn) {
    const s = seedJSON({
      wildFightTable: [{ day: 50, result: 'won', partySize: 3, party: [{ kind: 'player' }],
        monsters: [{ wave: 4 }, { wave: 4 }, { wave: 4 }] }],
      foughtWaves: [{ day: 50, waves: [4, 4, 4], result: 'won' }],
      fightsByWave: { 1: 2, 4: 3 },
      waveLog: [{ day: 50, wave: 4, villageSlain: { reunion: 3 } }],
      deaths: [],
      deathHonesty: { playerDeaths: [{ day: 50, cause: 'the wild' }], mislabels: [] },
      finalWave: 4,
    });
    r = A.summarizeWave4([s]);
  }
  ok('(26) wave4 guard: triple pack -> fights=1 kills=3, no mismatch error, banked2, 1 wild playerDeath',
    hasFn && r.errors.length === 0 && r.totFights === 1 && r.totKills === 3 &&
    r.perSeed[0].villageSlainW4 === 3 && r.perSeed[0].banked2 === true &&
    r.totPlayerDeaths === 1 && r.totWildPlayerDeaths === 1,
    hasFn ? JSON.stringify(r) : 'summarizeWave4 missing in this analyzer');
}
// (27) NEW r222: trick pipeline FLOWS — all three countered12 types taught,
// wave-3 redactor learned, wave-4 reunion kill with the trick known.
// (r227: a third countered12 type, mirror_stag, so the taughtRate
// denominator floor (>= 3) is met and the rate still reads 1.)
{
  const hasFn = typeof A.summarizeTrickPipeline === 'function';
  let r = null;
  if (hasFn) {
    const s = seedJSON({
      ctxSummary: { beastAsks: [
        { day: 45, trigger: 'hushwolf', slainUnknown: ['hushwolf'], noCounter: [], teachableBefore: 'hushwolf', taught: 'hushwolf', none: false, cls: 'taught' },
        { day: 50, trigger: 'bulldozer', slainUnknown: ['bulldozer'], noCounter: [], teachableBefore: 'bulldozer', taught: 'bulldozer', none: false, cls: 'taught' },
        { day: 55, trigger: 'mirror_stag', slainUnknown: ['mirror_stag'], noCounter: [], teachableBefore: 'mirror_stag', taught: 'mirror_stag', none: false, cls: 'taught' },
      ], beasttricksAsked: 3, beasttricksTaught: 3 },
      counterEvents: [{ day: 46, mid: 'hushwolf', via: 'observed' }, { day: 51, mid: 'bulldozer', via: 'scholar-observed' }, { day: 56, mid: 'mirror_stag', via: 'observed' }],
      trickEnd: { slainUnknown: ['hushwolf', 'bulldozer', 'mirror_stag', 'redactor'], countersKnown: ['hushwolf', 'bulldozer', 'mirror_stag'], tricksHeld: ['redactor', 'reunion'], obsCounts: { redactor: 2, reunion: 2 } },
      wildFightTable: [{ day: 60, result: 'won', partySize: 3, monsters: [{ mid: 'reunion', wave: 4 }] }],
      foughtWaves: [{ day: 60, waves: [4], result: 'won' }],
      waveLog: [{ day: 60, villageSlain: { reunion: 1 } }],
      finalWave: 4,
    });
    r = A.summarizeTrickPipeline([s]);
  }
  ok('(27) trick pipeline flows: taught 3/3, learned 1/1, w4 kill known, stall flows',
    hasFn && r.perSeed[0].stall === 'flows' && r.perSeed[0].taughtN === 3 &&
    r.perSeed[0].tricksHeldN === 2 && r.perSeed[0].w4killsKnown === 1 &&
    r.perSeed[0].w4killsUnknown === 0 && r.taughtRate === 1 && r.learnedRate === 1,
    hasFn ? JSON.stringify(r) : 'summarizeTrickPipeline missing in this analyzer');
}
// (28) NEW r222: teachable-never-seen — countered type slain, asks ran,
// the gate never opened (teachableBefore null on every ask).
{
  const hasFn = typeof A.summarizeTrickPipeline === 'function';
  let r = null;
  if (hasFn) {
    const s = seedJSON({
      ctxSummary: { beastAsks: [
        { day: 45, trigger: 'hushwolf', slainUnknown: ['hushwolf'], noCounter: [], teachableBefore: null, taught: null, none: true, cls: 'none-other' },
      ], beasttricksAsked: 1, beasttricksTaught: 0 },
      counterEvents: [],
      trickEnd: { slainUnknown: ['hushwolf'], countersKnown: [], tricksHeld: [], obsCounts: {} },
      wildFightTable: [], foughtWaves: [], waveLog: [], finalWave: 2,
    });
    r = A.summarizeTrickPipeline([s]);
  }
  ok('(28) trick pipeline teachable-never-seen: stall pinned, taughtRate null (r227 floor: denominator 1)',
    hasFn && r.perSeed[0].stall === 'teachable-never-seen' && r.taughtRate === null &&
    r.perSeed[0].asksNoneOther === 1,
    hasFn ? JSON.stringify(r) : 'summarizeTrickPipeline missing in this analyzer');
}
// (29) NEW r222: obs-stalled — wave-3 spool seen once, never twice, no
// discovery; teachable correctly never applies to wave-3 (no counter def).
{
  const hasFn = typeof A.summarizeTrickPipeline === 'function';
  let r = null;
  if (hasFn) {
    const s = seedJSON({
      ctxSummary: { beastAsks: [
        { day: 45, trigger: 'spool', slainUnknown: ['spool'], noCounter: ['spool'], teachableBefore: null, taught: null, none: true, cls: 'none-no-counter' },
      ], beasttricksAsked: 1, beasttricksTaught: 0 },
      counterEvents: [],
      trickEnd: { slainUnknown: ['spool'], countersKnown: [], tricksHeld: [], obsCounts: { spool: 1 } },
      wildFightTable: [], foughtWaves: [], waveLog: [], finalWave: 3,
    });
    r = A.summarizeTrickPipeline([s]);
  }
  ok('(29) trick pipeline obs-stalled: spool at 1/2 observations, learnedRate 0, taughtRate null (no countered12)',
    hasFn && r.perSeed[0].stall === 'obs-stalled' && r.learnedRate === 0 &&
    r.taughtRate === null && JSON.stringify(r.perSeed[0].obsStalled) === '["spool"]',
    hasFn ? JSON.stringify(r) : 'summarizeTrickPipeline missing in this analyzer');
}
// (30) NEW r222: panel verdict — six teachable-never-seen seeds read
// TRICK-PIPELINE-FINDING via the stall-count bar (topStall 6 >= 6), with
// taughtRate=null: the r227 floor means a one-type denominator no longer
// carries the verdict — the stall does.
{
  const mkSeed = () => seedJSON({
    ctxSummary: { beastAsks: [{ day: 45, trigger: 'hushwolf', slainUnknown: ['hushwolf'], noCounter: [], teachableBefore: null, taught: null, none: true, cls: 'none-other' }], beasttricksAsked: 1, beasttricksTaught: 0 },
    counterEvents: [], trickEnd: { slainUnknown: ['hushwolf'], countersKnown: [], tricksHeld: [], obsCounts: {} },
    wildFightTable: [], foughtWaves: [], waveLog: [], finalWave: 2,
  });
  const out = runPanel('trick-panel', [mkSeed(), mkSeed(), mkSeed(), mkSeed(), mkSeed(), mkSeed()]);
  ok('(30) trick panel: six teachable-never-seen seeds -> TRICK-PIPELINE-FINDING via stall bar, taughtRate=null',
    out.indexOf('Q1-TRICK PANEL:') !== -1 && out.indexOf('TRICK-PIPELINE-FINDING') !== -1 &&
    out.indexOf('taughtRate=null') !== -1,
    out.slice(0, 400));
}
// (31) NEW r227: titan muster BLANK — Herald present 3 lingerer days,
// 0 muster verbs, muster empty, reunion stuck at 1/2 observations.
{
  const hasFn = typeof A.summarizeTitanMuster === 'function';
  const s = seedJSON({
    ctxSummary: { beastAsks: [], beasttricksAsked: 0, beasttricksTaught: 0 },
    counterEvents: [],
    trickEnd: { slainUnknown: ['reunion'], countersKnown: [], tricksHeld: [], obsCounts: { reunion: 1 } },
    wildFightTable: [], foughtWaves: [], waveLog: [], finalWave: 4,
    titanEnd: { omens: { herald: { stage: 2, day: 61 } }, musters: {}, slain: {}, cast: { herald: 'herald', apocalypse: 'finale' }, ready: { herald: false } },
    monsterWatch: [
      { day: 61, monsters: [{ key: null, id: 'herald', wave: 4, tx: 1, ty: 1, mx: 0, my: 0, hp: 820, maxHp: 900, veteran: false, lingering: true }] },
      { day: 62, monsters: [{ key: null, id: 'herald', wave: 4, tx: 1, ty: 1, mx: 0, my: 0, hp: 820, maxHp: 900, veteran: false, lingering: true }] },
      { day: 63, monsters: [{ key: null, id: 'herald', wave: 4, tx: 1, ty: 1, mx: 0, my: 0, hp: 790, maxHp: 900, veteran: false, lingering: true }] },
    ],
    titanVerbCalls: [], titanVerbErrors: [],
  });
  let r = null;
  try { r = A.summarizeTitanMuster([s]); } catch (e) { r = { err: String(e && e.message) }; }
  ok('(31) titan muster BLANK: herald 3 lingerer days, 0 verbs, muster empty, reunion obs 1',
    hasFn && r.verdict === 'TITAN-MUSTER-BLANK' && r.perSeed[0].titanDays === 3 && r.perSeed[0].lingerDays === 3 &&
    r.perSeed[0].verbsTotal === 0 && r.perSeed[0].musterTotal === 0 &&
    JSON.stringify(r.perSeed[0].w4stuck1) === '["reunion"]' && r.seedsWithTitan === 1,
    hasFn ? JSON.stringify(r) : 'summarizeTitanMuster missing in this analyzer');
}
// (32) NEW r227: titan muster MOVED — one soundTitanCall + 3 allies.
{
  const hasFn = typeof A.summarizeTitanMuster === 'function';
  const s = seedJSON({
    ctxSummary: { beastAsks: [], beasttricksAsked: 0, beasttricksTaught: 0 },
    counterEvents: [],
    trickEnd: { slainUnknown: [], countersKnown: [], tricksHeld: [], obsCounts: {} },
    wildFightTable: [], foughtWaves: [], waveLog: [], finalWave: 4,
    titanEnd: { omens: { herald: { stage: 2, day: 61 } },
      musters: { herald: { allies: [{ villageId: 'x', vid: 'a' }, { villageId: 'x', vid: 'b' }, { villageId: 'y', vid: 'c' }], haven: [], day: 70, outfitted: {} } },
      slain: {}, cast: { herald: 'herald', apocalypse: 'finale' }, ready: { herald: false } },
    monsterWatch: [
      { day: 61, monsters: [{ key: null, id: 'herald', wave: 4, tx: 1, ty: 1, mx: 0, my: 0, hp: 820, maxHp: 900, veteran: false, lingering: true }] },
    ],
    titanVerbCalls: [{ day: 70, fn: 'soundTitanCall', arg: 'herald', ok: true, err: null }], titanVerbErrors: [],
  });
  let r = null;
  try { r = A.summarizeTitanMuster([s]); } catch (e) { r = { err: String(e && e.message) }; }
  ok('(32) titan muster MOVED: 1 sound call, 3 allies, verdict moved',
    hasFn && r.verdict === 'TITAN-MUSTER-MOVED' && r.perSeed[0].verbCounts.sound === 1 &&
    r.perSeed[0].musterTotal === 3 && r.perSeed[0].musterAllies === 3,
    hasFn ? JSON.stringify(r) : 'summarizeTitanMuster missing in this analyzer');
}
// (33) NEW r227: NO-TITAN — a seed with no titan fields at all.
{
  const hasFn = typeof A.summarizeTitanMuster === 'function';
  const s = seedJSON({
    ctxSummary: { beastAsks: [], beasttricksAsked: 0, beasttricksTaught: 0 },
    counterEvents: [],
    trickEnd: { slainUnknown: [], countersKnown: [], tricksHeld: [], obsCounts: {} },
    wildFightTable: [], foughtWaves: [], waveLog: [], finalWave: 3,
  });
  let r = null;
  try { r = A.summarizeTitanMuster([s]); } catch (e) { r = { err: String(e && e.message) }; }
  ok('(33) titan muster NO-TITAN: bare seed reads no titan, no verbs, no muster',
    hasFn && r.verdict === 'NO-TITAN' && r.seedsWithTitan === 0 && r.totVerbs === 0 && r.totTitanDays === 0,
    hasFn ? JSON.stringify(r) : 'summarizeTitanMuster missing in this analyzer');
}
// (34) NEW r227: wave-split stall — the r222 mask reproduced and unmasked.
// hushwolf taught (W12 flows); spool seen once, never twice (W3+ stalled).
// The OLD single stall reads 'flows' — the mask. The split fields must say
// stallW12='flows' and stallW3plus='obs-stalled'.
{
  const hasFn = typeof A.summarizeTrickPipeline === 'function';
  const s = seedJSON({
    ctxSummary: { beastAsks: [
      { day: 45, trigger: 'hushwolf', slainUnknown: ['hushwolf'], noCounter: [], teachableBefore: 'hushwolf', taught: 'hushwolf', none: false, cls: 'taught' },
    ], beasttricksAsked: 1, beasttricksTaught: 1 },
    counterEvents: [{ day: 40, mid: 'hushwolf', via: 'observed' }],
    trickEnd: { slainUnknown: ['hushwolf', 'spool'], countersKnown: ['hushwolf'], tricksHeld: [], obsCounts: { spool: 1 } },
    wildFightTable: [], foughtWaves: [], waveLog: [], finalWave: 3,
  });
  let r = null;
  try { r = A.summarizeTrickPipeline([s]); } catch (e) { r = { err: String(e && e.message) }; }
  ok('(34) wave-split stall: old stall flows (masked) but stallW12 flows + stallW3plus obs-stalled, spool in obsStalled3',
    hasFn && r.perSeed[0].stall === 'flows' && r.perSeed[0].stallW12 === 'flows' &&
    r.perSeed[0].stallW3plus === 'obs-stalled' &&
    JSON.stringify(r.perSeed[0].obsStalled3) === '["spool"]' &&
    JSON.stringify(r.perSeed[0].obsStalled12) === '[]',
    hasFn ? JSON.stringify(r) : 'summarizeTrickPipeline missing in this analyzer');
}
// (35) NEW r227: panel wiring — a BLANK seed through the real analyzer
// main prints the Q1-TITAN panel with TITAN-MUSTER-BLANK.
{
  const s1 = seedJSON({
    ctxSummary: { beastAsks: [], beasttricksAsked: 0, beasttricksTaught: 0 },
    counterEvents: [],
    trickEnd: { slainUnknown: ['reunion'], countersKnown: [], tricksHeld: [], obsCounts: { reunion: 1 } },
    wildFightTable: [], foughtWaves: [], waveLog: [], finalWave: 4,
    titanEnd: { omens: { herald: { stage: 2, day: 61 } }, musters: {}, slain: {}, cast: { herald: 'herald', apocalypse: 'finale' }, ready: { herald: false } },
    monsterWatch: [
      { day: 61, monsters: [{ key: null, id: 'herald', wave: 4, tx: 1, ty: 1, mx: 0, my: 0, hp: 820, maxHp: 900, veteran: false, lingering: true }] },
    ],
    titanVerbCalls: [], titanVerbErrors: [],
  });
  const out = runPanel('titan-panel', [s1]);
  ok('(35) titan panel: BLANK seed -> Q1-TITAN PANEL TITAN-MUSTER-BLANK, seedsWithTitan=1',
    out.indexOf('Q1-TITAN PANEL:') !== -1 && out.indexOf('TITAN-MUSTER-BLANK') !== -1 &&
    out.indexOf('seedsWithTitan=1') !== -1,
    out.slice(0, 400));
}
// (36)-(42) NEW r227: the muster-policy summarizer + taughtRate floor.
// (36) MUSTER-SLAIN, (37) MUSTER-BLOCKED, (38) MUSTER-READY-NO-FIGHT,
// (39) MUSTER-NOT-TRIED, (40) MUSTER-FOUGHT, (41) taughtRate floor
// (panelCountered12 = 1 -> taughtRate null, not 0 — the r226
// denominator-of-one artifact), (42) panel wiring for Q1-MUSTER-POLICY.
{
  const hasFn = typeof A.summarizeMusterPolicy === 'function';
  const s = seedJSON({
    ctxSummary: { beastAsks: [], beasttricksAsked: 0, beasttricksTaught: 0 },
    counterEvents: [],
    trickEnd: { slainUnknown: [], countersKnown: [], tricksHeld: [], obsCounts: {} },
    wildFightTable: [{ day: 78, rounds: 40, result: 'won', over: true, tileType: 'field',
      monsters: [{ mid: 'herald', wave: 4, name: 'The Herald', veteran: false }], partySize: 11, party: [], hp0Total: 700, endMonsterHp: 0, dmgFrac: 1, outcomeClass: 'won' }],
    foughtWaves: [], waveLog: [], finalWave: 5,
    titanEnd: { omens: { herald: { stage: 2, day: 61 } },
      musters: { herald: { allies: [{ villageId: 'x', vid: 'a' }, { villageId: 'x', vid: 'b' }, { villageId: 'y', vid: 'c' }], haven: [{ vid: 'v_h1' }, { vid: 'v_h2' }], day: 70, outfitted: {} } },
      slain: { herald: true }, cast: {}, ready: { herald: true } },
    monsterWatch: [{ day: 61, monsters: [{ key: null, id: 'herald', wave: 4, tx: 1, ty: 1, mx: 0, my: 0, hp: 700, maxHp: 700, veteran: false, lingering: false }] }],
    titanVerbCalls: [{ day: 62, fn: 'titanWarCouncil', arg: 'herald', ok: true, err: null }, { day: 62, fn: 'soundTitanCall', arg: 'herald', ok: true, err: null }, { day: 62, fn: 'titanCommitOwn', arg: 'herald', ok: true, err: null }, { day: 62, fn: 'titanCommitOwn', arg: 'herald', ok: true, err: null }],
    titanVerbErrors: [],
    musterLog: [{ day: 62, stage: 2, present: true, links: 2, before: { allies: 0, haven: 0, ready: false }, call: true, council: true, commit: true, results: { council: 'sat', call: 'answered', commit: { first: 'confirm', second: 'done' } }, after: { allies: 3, haven: 2, ready: false } }],
    musterReadyDay: 70, titanFightsStood: 1,
    musterSayCounts: { refuses: 0, answers: 2, havenCommits: 1 },
  });
  let r = null;
  try { r = A.summarizeMusterPolicy([s]); } catch (e) { r = { err: String(e && e.message) }; }
  ok('(36) muster policy SLAIN: 1 call day 62, ready day 70, titan fight won day 78, gained 3 allies + 2 haven',
    hasFn && r.verdict === 'MUSTER-SLAIN' && r.seedsCalled === 1 && r.seedsReady === 1 && r.seedsFought === 1 && r.seedsSlain === 1 &&
    r.perSeed[0].firstCallDay === 62 && r.perSeed[0].firstReadyDay === 70 &&
    r.perSeed[0].alliesGained === 3 && r.perSeed[0].havenGained === 2 && r.perSeed[0].titanFightsWon === 1 &&
    JSON.stringify(r.perSeed[0].titanFightDays) === '[78]',
    hasFn ? JSON.stringify(r) : 'summarizeMusterPolicy missing in this analyzer');
}
{
  const hasFn = typeof A.summarizeMusterPolicy === 'function';
  const s = seedJSON({
    ctxSummary: { beastAsks: [], beasttricksAsked: 0, beasttricksTaught: 0 },
    counterEvents: [],
    trickEnd: { slainUnknown: [], countersKnown: [], tricksHeld: [], obsCounts: {} },
    wildFightTable: [], foughtWaves: [], waveLog: [], finalWave: 4,
    titanEnd: { omens: { herald: { stage: 2, day: 61 } },
      musters: { herald: { allies: [], haven: [], day: 70, outfitted: {} } },
      slain: {}, cast: {}, ready: { herald: false } },
    monsterWatch: [{ day: 61, monsters: [{ key: null, id: 'herald', wave: 4, tx: 1, ty: 1, mx: 0, my: 0, hp: 700, maxHp: 700, veteran: false, lingering: false }] }],
    titanVerbCalls: [{ day: 62, fn: 'soundTitanCall', arg: 'herald', ok: true, err: null }],
    titanVerbErrors: [],
    musterLog: [{ day: 62, stage: 2, present: true, links: 1, before: { allies: 0, haven: 0, ready: false }, call: true, council: true, commit: true, results: { council: 'sat', call: 'answered', commit: { first: 'none', second: 'none' } }, after: { allies: 0, haven: 0, ready: false } }],
    musterReadyDay: null, titanFightsStood: 0,
    musterSayCounts: { refuses: 1, answers: 0, havenCommits: 0 },
  });
  let r = null;
  try { r = A.summarizeMusterPolicy([s]); } catch (e) { r = { err: String(e && e.message) }; }
  ok('(37) muster policy BLOCKED: call sounded, 0 allies gained, 1 refusal, never ready, no fight',
    hasFn && r.verdict === 'MUSTER-BLOCKED' && r.seedsCalled === 1 && r.seedsReady === 0 && r.seedsFought === 0 &&
    r.perSeed[0].alliesGained === 0 && r.perSeed[0].refuses === 1 && r.perSeed[0].answers === 0,
    hasFn ? JSON.stringify(r) : 'summarizeMusterPolicy missing in this analyzer');
}
{
  const hasFn = typeof A.summarizeMusterPolicy === 'function';
  const s = seedJSON({
    ctxSummary: { beastAsks: [], beasttricksAsked: 0, beasttricksTaught: 0 },
    counterEvents: [],
    trickEnd: { slainUnknown: [], countersKnown: [], tricksHeld: [], obsCounts: {} },
    wildFightTable: [], foughtWaves: [], waveLog: [], finalWave: 4,
    titanEnd: { omens: { herald: { stage: 2, day: 61 } },
      musters: { herald: { allies: [{ villageId: 'x', vid: 'a' }], haven: [], day: 70, outfitted: {} } },
      slain: {}, cast: {}, ready: { herald: true } },
    monsterWatch: [], titanVerbCalls: [], titanVerbErrors: [],
    musterLog: [{ day: 62, stage: 2, present: true, links: 2, before: { allies: 0, haven: 0, ready: false }, call: true, council: false, commit: false, results: { call: 'answered' }, after: { allies: 1, haven: 0, ready: false } }],
    musterReadyDay: 70, titanFightsStood: 0,
    musterSayCounts: { refuses: 0, answers: 1, havenCommits: 0 },
  });
  let r = null;
  try { r = A.summarizeMusterPolicy([s]); } catch (e) { r = { err: String(e && e.message) }; }
  ok('(38) muster policy READY-NO-FIGHT: ready true, 0 titan fights',
    hasFn && r.verdict === 'MUSTER-READY-NO-FIGHT' && r.seedsReady === 1 && r.seedsFought === 0,
    hasFn ? JSON.stringify(r) : 'summarizeMusterPolicy missing in this analyzer');
}
{
  const hasFn = typeof A.summarizeMusterPolicy === 'function';
  const s = seedJSON({
    ctxSummary: { beastAsks: [], beasttricksAsked: 0, beasttricksTaught: 0 },
    counterEvents: [],
    trickEnd: { slainUnknown: [], countersKnown: [], tricksHeld: [], obsCounts: {} },
    wildFightTable: [], foughtWaves: [], waveLog: [], finalWave: 3,
  });
  let r = null;
  try { r = A.summarizeMusterPolicy([s]); } catch (e) { r = { err: String(e && e.message) }; }
  ok('(39) muster policy NOT-TRIED: no musterLog, no calls',
    hasFn && r.verdict === 'MUSTER-NOT-TRIED' && r.seedsCalled === 0,
    hasFn ? JSON.stringify(r) : 'summarizeMusterPolicy missing in this analyzer');
}
{
  const hasFn = typeof A.summarizeMusterPolicy === 'function';
  const s = seedJSON({
    ctxSummary: { beastAsks: [], beasttricksAsked: 0, beasttricksTaught: 0 },
    counterEvents: [],
    trickEnd: { slainUnknown: [], countersKnown: [], tricksHeld: [], obsCounts: {} },
    wildFightTable: [{ day: 80, rounds: 25, result: 'fled', over: true, tileType: 'field',
      monsters: [{ mid: 'herald', wave: 4, name: 'The Herald', veteran: false }], partySize: 11, party: [], hp0Total: 700, endMonsterHp: 400, dmgFrac: 0.429, outcomeClass: 'fled' }],
    foughtWaves: [], waveLog: [], finalWave: 4,
    titanEnd: { omens: { herald: { stage: 2, day: 61 } },
      musters: { herald: { allies: [{ villageId: 'x', vid: 'a' }], haven: [], day: 70, outfitted: {} } },
      slain: {}, cast: {}, ready: { herald: true } },
    monsterWatch: [], titanVerbCalls: [], titanVerbErrors: [],
    musterLog: [{ day: 62, stage: 2, present: true, links: 2, before: { allies: 0, haven: 0, ready: false }, call: true, council: false, commit: false, results: { call: 'answered' }, after: { allies: 1, haven: 0, ready: false } }],
    musterReadyDay: 70, titanFightsStood: 1,
    musterSayCounts: { refuses: 0, answers: 1, havenCommits: 0 },
  });
  let r = null;
  try { r = A.summarizeMusterPolicy([s]); } catch (e) { r = { err: String(e && e.message) }; }
  ok('(40) muster policy FOUGHT: titan fight fired day 80 (fled), not slain',
    hasFn && r.verdict === 'MUSTER-FOUGHT' && r.seedsFought === 1 && r.seedsSlain === 0 && r.perSeed[0].titanFightsWon === 0,
    hasFn ? JSON.stringify(r) : 'summarizeMusterPolicy missing in this analyzer');
}
{
  const hasFn = typeof A.summarizeTrickPipeline === 'function';
  const s = seedJSON({
    ctxSummary: { beastAsks: [], beasttricksAsked: 0, beasttricksTaught: 0 },
    counterEvents: [{ day: 40, mid: 'hushwolf', via: 'observed' }],
    trickEnd: { slainUnknown: ['hushwolf'], countersKnown: [], tricksHeld: [], obsCounts: { hushwolf: 1 } },
    wildFightTable: [], foughtWaves: [], waveLog: [], finalWave: 3,
  });
  let r = null;
  try { r = A.summarizeTrickPipeline([s]); } catch (e) { r = { err: String(e && e.message) }; }
  ok('(41) taughtRate floor: a single countered wave 1-2 type reads taughtRate=null, not 0 (r227 denominator floor)',
    hasFn && r.taughtRate === null && JSON.stringify(r.panelCountered12) === '["hushwolf"]',
    hasFn ? JSON.stringify(r) : 'summarizeTrickPipeline missing in this analyzer');
}
{
  const s1 = seedJSON({
    ctxSummary: { beastAsks: [], beasttricksAsked: 0, beasttricksTaught: 0 },
    counterEvents: [],
    trickEnd: { slainUnknown: [], countersKnown: [], tricksHeld: [], obsCounts: {} },
    wildFightTable: [{ day: 78, rounds: 40, result: 'won', over: true, tileType: 'field',
      monsters: [{ mid: 'herald', wave: 4, name: 'The Herald', veteran: false }], partySize: 11, party: [], hp0Total: 700, endMonsterHp: 0, dmgFrac: 1, outcomeClass: 'won' }],
    foughtWaves: [], waveLog: [], finalWave: 5,
    titanEnd: { omens: { herald: { stage: 2, day: 61 } },
      musters: { herald: { allies: [{ villageId: 'x', vid: 'a' }], haven: [], day: 70, outfitted: {} } },
      slain: { herald: true }, cast: {}, ready: { herald: true } },
    monsterWatch: [{ day: 61, monsters: [{ key: null, id: 'herald', wave: 4, tx: 1, ty: 1, mx: 0, my: 0, hp: 700, maxHp: 700, veteran: false, lingering: false }] }],
    titanVerbCalls: [{ day: 62, fn: 'soundTitanCall', arg: 'herald', ok: true, err: null }],
    titanVerbErrors: [],
    musterLog: [{ day: 62, stage: 2, present: true, links: 2, before: { allies: 0, haven: 0, ready: false }, call: true, council: true, commit: true, results: { council: 'sat', call: 'answered', commit: { first: 'confirm', second: 'done' } }, after: { allies: 1, haven: 0, ready: false } }],
    musterReadyDay: 70, titanFightsStood: 1,
    musterSayCounts: { refuses: 0, answers: 1, havenCommits: 0 },
  });
  const out = runPanel('muster-panel', [s1]);
  ok('(42) muster panel: SLAIN seed -> Q1-MUSTER-POLICY PANEL MUSTER-SLAIN, called=1 slain=1',
    out.indexOf('Q1-MUSTER-POLICY PANEL:') !== -1 && out.indexOf('MUSTER-SLAIN') !== -1 &&
    out.indexOf('called=1') !== -1 && out.indexOf('slain=1') !== -1,
    out.slice(0, 400));
}
console.log(`r227 analyzer proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
