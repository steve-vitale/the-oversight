'use strict';
// test-journey-deepening-r212-analyzer-20261115.js -- R212 analyzer proof
// (runs the REAL r212 analyzer on synthetic inputs; no driver needed).
// (11)-(14) NEW r212: the A2 floor (total < 6 -> THIN-PROBE) in
// summarizeFavorBlock / summarizePartnerBlock — thin panels read
// THIN-PROBE, real repetition at total >= 6 still reads REPETITIVE.
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
// RED/FAILURE MODE: run with ANALYZER=./analyze-journey-deepening-r193-20261114.js
// — (1)-(7) pass (direct calls, carried), (8)-(10) FAIL on filename
// mismatch (r193 reads only r193 seed files — expected, same shape as the
// r193 proof's own red mode), (11)/(13) FAIL on the missing floor (r193
// reads total=4 as REPETITIVE, not THIN-PROBE — the discriminating
// failure), (12)/(14) pass (the share bar is unchanged at total >= 6).
// The AWAY summarizer is NOT floored: its total < 3 rule is untouched,
// so a total=4 away panel still reads REPETITIVE by share.
const A = require(process.env.ANALYZER || './analyze-journey-deepening-r212-20261115.js');
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
  const dir = fs.mkdtempSync(path.join('/tmp', 'r212-panel-'));
  seeds.forEach((s, i) => fs.writeFileSync(path.join(dir, `journey-deepening-r212-seed${100051 + i}.json`), JSON.stringify(s)));
  (transcripts || []).forEach(t => fs.writeFileSync(path.join(dir, t.name), t.text));
  let out = '';
  try {
    out = execFileSync('node', [path.join(__dirname, process.env.ANALYZER || 'analyze-journey-deepening-r212-20261115.js'), dir], { encoding: 'utf8' });
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
  const transcripts = [{ name: 'journey-deepening-r212-transcript-100051-day60-stan_kowalski.txt', text: stanTranscript(60) }];
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
console.log(`r212 analyzer proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
