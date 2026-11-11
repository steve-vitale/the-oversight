'use strict';
// test-journey-deepening-r130-analyzer-20261111.js -- R129 analyzer proof
// (runs the REAL r130 analyzer on synthetic inputs; no driver needed —
// all four r130 instruments are analyzer-side).
// summarizeFavorBlock (r130 Q1 — maxRepeat of any single Haven-door
// wording, panel-wide; reframe prefixes normalized out):
//   (1) favorBlockId maps the original + 3 new wordings to their ids;
//       an unrelated line -> 'unknown:...'; a reframe-prefixed original
//       normalizes to 'favorblock-nextto'.
//   (2) 3x the original across 3 sittings -> REPETITIVE, total 3,
//       maxRepeat 3, distinct 1.
//   (3) 3 total, one of each of 3 wordings -> VARIED, distinct 3,
//       maxRepeat 1.
//   (4) 2 total -> THIN-PROBE.
//   (5) a reframe ("As I said — ...") + the bare original in one sitting
//       count as the SAME wording (maxRepeat 2, total 2).
//   (6) the delegated partner wording ("Move next to your partner...")
//       is a different site and is NOT counted (total 0, THIN-PROBE).
// summarizePlaceFrames (r130 Q2 — mirror of r125 teach frames):
//   (7) placeFrameId maps the old frame + 4 new frames to their ids;
//       an unrelated line -> 'unknown:...'.
//   (8) one sitting, 3x the old frame (different places) -> REPETITIVE.
//   (9) one sitting, 2x the old frame -> VARIED (max same-frame 2).
//   (10) no place-frame lines at all -> NO-FRAMES.
//   (11) one of each of the 4 new frames -> VARIED, distinct 4.
// summarizeAwayLineVariety (r130 Q3(a) — maxRepeat of any single
// away-line wording, panel-wide):
//   (12) awayLineId maps the original + 3 new wordings to their ids;
//       an unrelated line -> 'unknown:...'.
//   (13) 3x the original across sittings -> REPETITIVE, maxRepeat 3.
//   (14) one of each of the 4 wordings -> VARIED, distinct 4.
//   (15) 2 total -> THIN-PROBE.
// scanCisternLines (r130 Q3(b) — "1 liters" grammar error):
//   (16) "1 liters" -> bad 1; "1 liter" -> good 1; "2 liters" -> neither;
//       "21 liters" -> neither (word boundary — the old /1 liters/ regex
//       false-matched it).
// Panel (real main() on synthetic seed JSONs + transcripts in a temp dir):
//   (17) a transcript carrying 3x favour-block original + 3x place old
//       frame + 3x away original + 3x partner original + 1x "1 liters" ->
//       Q1-FAVORBLOCK REPETITIVE, Q2-PLACEFRAME REPETITIVE, Q3-AWAY
//       REPETITIVE, Q1-PARTNERBLOCK REPETITIVE, Q3-CISTERN GRAMMAR-ERROR.
// Amendment A2 share bar + partner family:
//   (18) favour-block 10 firings, 4 distinct, maxRepeat 3 (30% share) ->
//       VARIED (was REPETITIVE under the A1 absolute bar).
//   (19) favour-block 10 firings, maxRepeat 6 (60% share) -> REPETITIVE.
//   (20) partnerBlockId maps the original + 3 new wordings to their ids;
//       a reframe-prefixed original normalizes to 'partnerblock-nextto'.
//   (21) 18x the partner original across sittings (14 bare + 4 reframes,
//       the before-panel shape) -> REPETITIVE, total 18, maxRepeat 18.
//   (22) one of each of the 4 partner wordings -> VARIED, distinct 4.
//   (23) the 1890 line is not counted by the partner summary, and the
//       partner line is not counted by the 1890 summary.
// RED/FAILURE MODE: run with ANALYZER=./analyze-journey-deepening-r125-20261111.js
// — (1)-(6) crash (summarizeFavorBlock is not a function), (7)-(11)
// crash (summarizePlaceFrames is not a function), (12)-(15) crash
// (summarizeAwayLineVariety is not a function), (16) crashes
// (scanCisternLines is not a function), (17) fails (no r130 panel lines).
const A = require(process.env.ANALYZER || './analyze-journey-deepening-r130-20261111.js');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function seedJSON(over) {
  const base = { seed: 100009, census: [{ id: 'v_h1' }, { id: 'v_h2' }], deaths: [],
    bond: { tele: [], proposals: [], decisions: [], links: [], sayLines: [], daily: [], convoEvents: [], errors: [] },
    talkReqSnaps: [], langGateOffers: [], langGateDecisions: [],
    langArcSittings: [], langArcDays: [], talkedSittings: [], langGrants: [],
    langArcEnd: { langs: [], learned: {} }, goalSnaps: [], goalLineDays: [],
    goalLines: { counts: {}, total: 0 },
    ladderSnaps: [], trustSnaps: [], trustDeaths: [], secretSittings: [] };
  return Object.assign(base, over || {});
}
function runPanel(name, seeds, transcripts) {
  const dir = fs.mkdtempSync(path.join('/tmp', 'r130-panel-'));
  seeds.forEach((s, i) => fs.writeFileSync(path.join(dir, `journey-deepening-r130-seed${100009 + i}.json`), JSON.stringify(s)));
  (transcripts || []).forEach(t => fs.writeFileSync(path.join(dir, t.name), t.text));
  let out = '';
  try {
    out = execFileSync('node', [path.join(__dirname, process.env.ANALYZER || 'analyze-journey-deepening-r130-20261111.js'), dir], { encoding: 'utf8' });
  } catch (e) { out = (e && e.stdout) ? String(e.stdout) : ''; }
  fs.rmSync(dir, { recursive: true, force: true });
  return out;
}

// The four Haven-door wordings (convo-wants.js convoFavorBlockLine).
const FB_ORIG = 'Move next to them, on the same side of the Haven door, to help.';
const FB_BESIDE = 'Stand beside them first — same side of the Haven door — then help.';
const FB_RIGHTNEXT = 'You need to be right next to them, same side of the Haven door, to help.';
const FB_THEIRSIDE = 'Get to their side of the Haven door and stand next to them — then you can help.';
const PB_ORIG = 'Move next to your partner, on the same side of the Haven door.';
const PB_BESIDE = 'Stand beside your partner first — same side of the Haven door — then help.';
const PB_RIGHTNEXT = 'You need to be right next to your partner, same side of the Haven door, to help.';
const PB_THEIRSIDE = "Get to your partner's side of the Haven door and stand next to them — then you can help.";
// The four away-line wordings (convo-wants.js convoFavorAwayLine).
const AW_ORIG = '"Wait — I\'m away from Haven, out on the road. I can\'t promise a dawn meet while I\'m out — find me when I\'m back, and we\'ll set it then."';
const AW_OUTROAD = '"I\'m out on the road, away from Haven — no dawn meet while I\'m out, I\'m afraid. Catch me when I\'m back and we\'ll set it then."';
const AW_RIGHTNOW = '"Wait — I\'m away from Haven right now, out on the road. I can\'t promise a dawn meet from out here — find me when I\'m back and we\'ll set it then."';
const AW_DAWNMEET = '"Out on the road, away from Haven. A dawn meet\'s not something I can promise while I\'m out — when I\'m back, find me, and we\'ll set it then."';
// The five place frames (villager-agency.js convoTeachPlaceLine).
const PF_ORIG = (place) => `"${place} — I'll show you on the map sometime. It's real."`;
const PF_TRACE = (place) => `"${place} — trace it with your finger. That's where it is, and it's real."`;
const PF_MARK = (place) => `"${place} — I'll mark it on your map when we're back. It's real, I've stood there."`;
const PF_WALK = (place) => `"${place} — walk it with me sometime and you'll know the ground. It's real."`;
const PF_REMEMBER = (place) => `"${place} — remember the shape of it. It's real, and it's worth knowing."`;

// (1) favorBlockId.
{
  ok('(1) favour-block wordings map to their ids',
    A.favorBlockId(FB_ORIG) === 'favorblock-nextto' &&
    A.favorBlockId(FB_BESIDE) === 'favorblock-beside' &&
    A.favorBlockId(FB_RIGHTNEXT) === 'favorblock-rightnext' &&
    A.favorBlockId(FB_THEIRSIDE) === 'favorblock-theirside' &&
    A.favorBlockId('Something else entirely.').indexOf('unknown:') === 0 &&
    A.favorBlockId('As I said — ' + FB_ORIG) === 'favorblock-nextto' &&
    A.normalizeFavorBlock('Like I said — ' + FB_ORIG) === FB_ORIG,
    JSON.stringify([A.favorBlockId(FB_BESIDE), A.favorBlockId('As I said — ' + FB_ORIG)]));
}
// (2) 3x original across sittings -> REPETITIVE.
{
  const mk = (seed, day) => ({ seed: String(seed), day, vid: 'v_a', text: `THEM: ${FB_ORIG}\n` });
  const r = A.summarizeFavorBlock([mk(100009, 45), mk(100010, 60), mk(100003, 80)]);
  ok('(2) same favour-block wording 3x panel-wide is repetitive', r.verdict === 'REPETITIVE' && r.total === 3 && r.maxRepeat === 3 && r.distinct === 1, JSON.stringify(r));
}
// (3) one of each of 3 wordings -> VARIED.
{
  const t = { seed: '100009', day: 45, vid: 'v_a', text: [`THEM: ${FB_ORIG}`, `THEM: ${FB_BESIDE}`, `THEM: ${FB_RIGHTNEXT}`].join('\n') };
  const r = A.summarizeFavorBlock([t]);
  ok('(3) three distinct favour-block wordings is varied', r.verdict === 'VARIED' && r.total === 3 && r.distinct === 3 && r.maxRepeat === 1, JSON.stringify(r));
}
// (4) 2 total -> THIN-PROBE.
{
  const t = { seed: '100009', day: 45, vid: 'v_a', text: [`THEM: ${FB_ORIG}`, `THEM: ${FB_ORIG}`].join('\n') };
  const r = A.summarizeFavorBlock([t]);
  ok('(4) 2 favour-block firings is thin-probe', r.verdict === 'THIN-PROBE' && r.total === 2 && r.maxRepeat === 2, JSON.stringify(r));
}
// (5) reframe + bare original count as one wording.
{
  const t = { seed: '100009', day: 45, vid: 'v_a', text: [`THEM: ${FB_ORIG}`, `THEM: As I said — ${FB_ORIG}`].join('\n') };
  const r = A.summarizeFavorBlock([t]);
  ok('(5) reframe counts as the same wording', r.verdict === 'THIN-PROBE' && r.total === 2 && r.maxRepeat === 2 && r.distinct === 1, JSON.stringify(r));
}
// (6) partner wording is a different site — not counted.
{
  const t = { seed: '100009', day: 45, vid: 'v_a', text: 'THEM: Move next to your partner, on the same side of the Haven door.\nTHEM: Move next to your partner, on the same side of the Haven door.\n' };
  const r = A.summarizeFavorBlock([t]);
  ok('(6) partner wording is not counted here', r.verdict === 'THIN-PROBE' && r.total === 0 && r.distinct === 0, JSON.stringify(r));
}
// (7) placeFrameId.
{
  ok('(7) place frames map to their ids',
    A.placeFrameId(PF_ORIG('an old trapline')) === 'teachplace-mapshow' &&
    A.placeFrameId(PF_TRACE('an old trapline')) === 'teachplace-trace' &&
    A.placeFrameId(PF_MARK('an old trapline')) === 'teachplace-mark' &&
    A.placeFrameId(PF_WALK('an old trapline')) === 'teachplace-walk' &&
    A.placeFrameId(PF_REMEMBER('an old trapline')) === 'teachplace-remember' &&
    A.placeFrameId('"Something else entirely."').indexOf('unknown:') === 0,
    JSON.stringify([A.placeFrameId(PF_TRACE('an old trapline'))]));
}
// (8) 3x old place frame, different places -> REPETITIVE.
{
  const t = { seed: '100009', day: 80, vid: 'v_a', text: [
    `THEM: ${PF_ORIG('an old trapline')}`,
    `THEM: ${PF_ORIG('the dry creek bed')}`,
    `THEM: ${PF_ORIG('a burned ridge')}`,
  ].join('\n') };
  const r = A.summarizePlaceFrames([t]);
  ok('(8) same place frame 3x in one sitting is repetitive', r.verdict === 'REPETITIVE' && r.frames === 3 && r.maxSameFrame === 3 && r.distinctFrames === 1, JSON.stringify(r));
}
// (9) 2x -> VARIED.
{
  const t = { seed: '100009', day: 80, vid: 'v_a', text: [`THEM: ${PF_ORIG('an old trapline')}`, `THEM: ${PF_ORIG('the dry creek bed')}`].join('\n') };
  const r = A.summarizePlaceFrames([t]);
  ok('(9) same place frame 2x is varied', r.verdict === 'VARIED' && r.frames === 2 && r.maxSameFrame === 2, JSON.stringify(r));
}
// (10) no place frames -> NO-FRAMES.
{
  const t = { seed: '100009', day: 80, vid: 'v_a', text: 'THEM: "Something else entirely."\nTHEM: "And another line."\n' };
  const r = A.summarizePlaceFrames([t]);
  ok('(10) no place frames is no-frames', r.verdict === 'NO-FRAMES' && r.frames === 0, JSON.stringify(r));
}
// (11) one of each new place frame -> VARIED, distinct 4.
{
  const t = { seed: '100009', day: 80, vid: 'v_a', text: [
    `THEM: ${PF_TRACE('an old trapline')}`,
    `THEM: ${PF_MARK('the dry creek bed')}`,
    `THEM: ${PF_WALK('a burned ridge')}`,
    `THEM: ${PF_REMEMBER('the old mill')}`,
  ].join('\n') };
  const r = A.summarizePlaceFrames([t]);
  ok('(11) one of each new place frame is varied', r.verdict === 'VARIED' && r.frames === 4 && r.distinctFrames === 4 && r.maxSameFrame === 1, JSON.stringify(r));
}
// (12) awayLineId.
{
  ok('(12) away-line wordings map to their ids',
    A.awayLineId(AW_ORIG) === 'awayline-wait' &&
    A.awayLineId(AW_OUTROAD) === 'awayline-outroad' &&
    A.awayLineId(AW_RIGHTNOW) === 'awayline-rightnow' &&
    A.awayLineId(AW_DAWNMEET) === 'awayline-dawnmeet' &&
    A.awayLineId('"Something else entirely."').indexOf('unknown:') === 0,
    JSON.stringify([A.awayLineId(AW_OUTROAD)]));
}
// (13) 3x original away line -> REPETITIVE.
{
  const mk = (seed, day) => ({ seed: String(seed), day, vid: 'v_a', text: `THEM: ${AW_ORIG}\n` });
  const r = A.summarizeAwayLineVariety([mk(100009, 45), mk(100010, 60), mk(100003, 80)]);
  ok('(13) same away line 3x panel-wide is repetitive', r.verdict === 'REPETITIVE' && r.total === 3 && r.maxRepeat === 3 && r.distinct === 1, JSON.stringify(r));
}
// (14) one of each of 4 -> VARIED.
{
  const t = { seed: '100009', day: 45, vid: 'v_a', text: [`THEM: ${AW_ORIG}`, `THEM: ${AW_OUTROAD}`, `THEM: ${AW_RIGHTNOW}`, `THEM: ${AW_DAWNMEET}`].join('\n') };
  const r = A.summarizeAwayLineVariety([t]);
  ok('(14) four distinct away lines is varied', r.verdict === 'VARIED' && r.total === 4 && r.distinct === 4 && r.maxRepeat === 1, JSON.stringify(r));
}
// (15) 2 total -> THIN-PROBE.
{
  const t = { seed: '100009', day: 45, vid: 'v_a', text: [`THEM: ${AW_ORIG}`, `THEM: ${AW_ORIG}`].join('\n') };
  const r = A.summarizeAwayLineVariety([t]);
  ok('(15) 2 away lines is thin-probe', r.verdict === 'THIN-PROBE' && r.total === 2 && r.maxRepeat === 2, JSON.stringify(r));
}
// (16) scanCisternLines.
{
  const t = { seed: '100009', day: 45, vid: 'v_a', text: [
    'THEM: "The cistern\'s nearly dry — 1 liters left. I need someone to haul water with me at first light. Two of us, half the trips. Will you come?"',
    'THEM: "The cistern\'s nearly dry — 1 liter left. I need someone to haul water with me at first light."',
    'THEM: "The cistern\'s nearly dry — 2 liters left. I need someone to haul water with me at first light."',
    'THEM: "We\'re down to 21 liters of clean water."',
  ].join('\n') };
  const r = A.scanCisternLines([t]);
  ok('(16) cistern scan: 1 bad, 1 good, 2 and 21 liters ignored', r.length === 1 && r[0].bad === 1 && r[0].good === 1, JSON.stringify(r));
}
// (17) panel lines via real main().
{
  const out = runPanel('r130', [seedJSON({ seed: 100009 }), seedJSON({ seed: 100010 })], [
    { name: 'journey-deepening-r130-transcript-100009-day45-v_a.txt', text: [
      `THEM: ${FB_ORIG}`,
      `THEM: ${FB_ORIG}`,
      `THEM: ${FB_ORIG}`,
      `THEM: ${PF_ORIG('an old trapline')}`,
      `THEM: ${PF_ORIG('the dry creek bed')}`,
      `THEM: ${PF_ORIG('a burned ridge')}`,
      `THEM: ${AW_ORIG}`,
      `THEM: ${AW_ORIG}`,
      `THEM: ${AW_ORIG}`,
      `THEM: ${PB_ORIG}`,
      `THEM: ${PB_ORIG}`,
      `THEM: ${PB_ORIG}`,
      'THEM: "The cistern\'s nearly dry — 1 liters left. I need someone to haul water with me at first light."',
    ].join('\n') },
  ]);
  ok('(17) panel lines say repetitive / repetitive / repetitive / repetitive / grammar-error',
    /Q1-FAVORBLOCK PANEL:.*total=3.*maxRepeat=3.*REPETITIVE/.test(out) &&
    /Q2-PLACEFRAME PANEL:.*frames=3.*maxSameFrame=3.*REPETITIVE/.test(out) &&
    /Q3-AWAY PANEL:.*total=3.*maxRepeat=3.*REPETITIVE/.test(out) &&
    /Q1-PARTNERBLOCK PANEL:.*total=3.*maxRepeat=3.*REPETITIVE/.test(out) &&
    /Q3-CISTERN PANEL:.*bad1Liters=1.*GRAMMAR-ERROR/.test(out),
    out.split('\n').filter(l => /Q1-FAVORBLOCK PANEL|Q2-PLACEFRAME PANEL|Q3-AWAY PANEL|Q1-PARTNERBLOCK PANEL|Q3-CISTERN PANEL/.test(l)).join(' | '));
}
// (18) Amendment A2 share bar: 10 firings, 4 distinct, maxRepeat 3
// (30% share) -> VARIED (was REPETITIVE under the A1 absolute bar).
{
  const lines = [FB_ORIG, FB_ORIG, FB_ORIG, FB_BESIDE, FB_BESIDE, FB_BESIDE, FB_RIGHTNEXT, FB_RIGHTNEXT, FB_THEIRSIDE, FB_THEIRSIDE];
  const t = { seed: '100009', day: 45, vid: 'v_a', text: lines.map(l => `THEM: ${l}`).join('\n') };
  const r = A.summarizeFavorBlock([t]);
  ok('(18) share bar: maxRepeat 3 of 10 is varied', r.verdict === 'VARIED' && r.total === 10 && r.distinct === 4 && r.maxRepeat === 3, JSON.stringify(r));
}
// (19) Amendment A2 share bar: 10 firings, maxRepeat 6 (60% share) ->
// REPETITIVE even though 4 distinct wordings fire.
{
  const lines = [FB_ORIG, FB_ORIG, FB_ORIG, FB_ORIG, FB_ORIG, FB_ORIG, FB_BESIDE, FB_BESIDE, FB_RIGHTNEXT, FB_THEIRSIDE];
  const t = { seed: '100009', day: 45, vid: 'v_a', text: lines.map(l => `THEM: ${l}`).join('\n') };
  const r = A.summarizeFavorBlock([t]);
  ok('(19) share bar: maxRepeat 6 of 10 is repetitive', r.verdict === 'REPETITIVE' && r.total === 10 && r.maxRepeat === 6, JSON.stringify(r));
}
// (20) partnerBlockId.
{
  ok('(20) partner-block wordings map to their ids',
    A.partnerBlockId(PB_ORIG) === 'partnerblock-nextto' &&
    A.partnerBlockId(PB_BESIDE) === 'partnerblock-beside' &&
    A.partnerBlockId(PB_RIGHTNEXT) === 'partnerblock-rightnext' &&
    A.partnerBlockId(PB_THEIRSIDE) === 'partnerblock-theirside' &&
    A.partnerBlockId('Something else entirely.').indexOf('unknown:') === 0 &&
    A.partnerBlockId('As I said — ' + PB_ORIG) === 'partnerblock-nextto' &&
    A.normalizePartnerBlock('Like I said — ' + PB_ORIG) === PB_ORIG,
    JSON.stringify([A.partnerBlockId(PB_BESIDE), A.partnerBlockId('As I said — ' + PB_ORIG)]));
}
// (21) 18x the partner original across sittings -> REPETITIVE (the
// before-panel shape: 14 bare + 4 reframes).
{
  const mk = (seed, day, reframe) => ({ seed: String(seed), day, vid: 'v_a', text: `THEM: ${reframe ? 'As I said — ' : ''}${PB_ORIG}\n` });
  const ts = [];
  for (let i = 0; i < 14; i++) ts.push(mk(100009 + (i % 8), 45 + i, false));
  for (let i = 0; i < 4; i++) ts.push(mk(100009 + i, 60 + i, true));
  const r = A.summarizePartnerBlock(ts);
  ok('(21) same partner wording 18x panel-wide is repetitive', r.verdict === 'REPETITIVE' && r.total === 18 && r.maxRepeat === 18 && r.distinct === 1, JSON.stringify(r));
}
// (22) one of each of the 4 partner wordings -> VARIED.
{
  const t = { seed: '100009', day: 45, vid: 'v_a', text: [`THEM: ${PB_ORIG}`, `THEM: ${PB_BESIDE}`, `THEM: ${PB_RIGHTNEXT}`, `THEM: ${PB_THEIRSIDE}`].join('\n') };
  const r = A.summarizePartnerBlock([t]);
  ok('(22) four distinct partner wordings is varied', r.verdict === 'VARIED' && r.total === 4 && r.distinct === 4 && r.maxRepeat === 1, JSON.stringify(r));
}
// (23) the 1890 line is NOT counted by the partner summary, and the
// partner line is NOT counted by the 1890 summary (sites stay separate).
{
  const t = { seed: '100009', day: 45, vid: 'v_a', text: `THEM: ${FB_ORIG}\nTHEM: ${PB_ORIG}\n` };
  const rp = A.summarizePartnerBlock([t]);
  const rf = A.summarizeFavorBlock([t]);
  ok('(23) partner and 1890 summaries stay separate', rp.total === 1 && rp.maxRepeat === 1 && rf.total === 1 && rf.maxRepeat === 1, JSON.stringify({ rp: rp.total, rf: rf.total }));
}
console.log(`r130 analyzer proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
