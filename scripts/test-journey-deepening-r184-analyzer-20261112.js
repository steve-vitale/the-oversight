'use strict';
// test-journey-deepening-r184-analyzer-20261112.js -- R184 analyzer proof
// (runs the REAL r184 analyzer on synthetic inputs; no driver needed).
// summarizePlaceProbe (r184 Q1 — the place-lesson funnel from the
// driver's placeProbeSittings: placesKnown at sitting start,
// askFieldPicks, askFieldLines; frame counting reuses placeFrameId):
//   (1) no seed JSONs -> NO-DATA, sittings 0.
//   (2) sittings, none with placesKnown >= 1 -> KNOWLEDGE.
//   (3) places known but no ask_field picks -> ASK.
//   (4) asks drawn but no place frame (non-place ask lines) -> SPEND-FIRST.
//   (5) asks drawing 2 distinct place frames -> FIRES, frames 2.
//   (6) detail rows only for sittings with places or asks.
// summarizeSoftWarm (r184 Q2 — the mood-GUARD beat, convo-mood.js:
// two lines picked by convoPickCycle 'moodguard' when the player makes
// a WARMING move toward a villager with negative receptivity. The beat
// is QUEUED on the warming turn and SPOKEN only when the player later
// picks `goon` (the continuer reveals a held beat) — so the trigger is
// the last NON-GOON YOU pick before the firing, never the goon pick):
//   (7) softens line after a YOU pick -> softens 1, pick captured.
//   (8) warmth line -> warmth 1, prevThem is the preceding THEM line.
//   (9) no guard lines -> total 0.
//   (10) a guard line revealed by goon attributes the TRIGGER pick — the
//       last non-goon YOU pick before the firing (the move that queued
//       the beat), not the goon pick that reveals it.
// Panel (real main() on synthetic seed JSONs + transcripts in a temp dir):
//   (11) a FIRES-shaped seed JSON + a transcript with 1 softens + 1
//       warmth -> Q1-PLACEPROBE bottleneck=FIRES, Q2-SOFTWARM softens=1
//       warmth=1, and the Q2-PLACEFRAME panel still reads.
// RED/FAILURE MODE: run with ANALYZER=./analyze-journey-deepening-r183-20261111.js
// — (1)-(6) crash (summarizePlaceProbe is not a function), (7)-(10)
// crash (summarizeSoftWarm is not a function), (11) fails (no r184
// panel lines).
const A = require(process.env.ANALYZER || './analyze-journey-deepening-r184-20261112.js');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function seedJSON(over) {
  const base = { seed: 100027, census: [{ id: 'v_h1' }, { id: 'v_h2' }], deaths: [],
    bond: { tele: [], proposals: [], decisions: [], links: [], sayLines: [], daily: [], convoEvents: [], errors: [] },
    talkReqSnaps: [], langGateOffers: [], langGateDecisions: [],
    langArcSittings: [], langArcDays: [], talkedSittings: [], langGrants: [],
    langArcEnd: { langs: [], learned: {} }, goalSnaps: [], goalLineDays: [],
    goalLines: { counts: {}, total: 0 },
    ladderSnaps: [], trustSnaps: [], trustDeaths: [], secretSittings: [] };
  return Object.assign(base, over || {});
}
function runPanel(name, seeds, transcripts) {
  const dir = fs.mkdtempSync(path.join('/tmp', 'r184-panel-'));
  seeds.forEach((s, i) => fs.writeFileSync(path.join(dir, `journey-deepening-r184-seed${100027 + i}.json`), JSON.stringify(s)));
  (transcripts || []).forEach(t => fs.writeFileSync(path.join(dir, t.name), t.text));
  let out = '';
  try {
    out = execFileSync('node', [path.join(__dirname, process.env.ANALYZER || 'analyze-journey-deepening-r184-20261112.js'), dir], { encoding: 'utf8' });
  } catch (e) { out = (e && e.stdout) ? String(e.stdout) : ''; }
  fs.rmSync(dir, { recursive: true, force: true });
  return out;
}

// The four place frames (villager-agency.js convoTeachPlaceLine).
const PF_TRACE = (place) => `"${place} — trace it with your finger. That's where it is, and it's real."`;
const PF_MARK = (place) => `"${place} — I'll mark it on your map when we're back. It's real, I've stood there."`;
// The two guard-beat lines (convo-mood.js convoMoodShift 'moodguard').
const SW_SOFTENS = "Something in them almost softens — then doesn't. Not yet.";
const SW_WARMTH = "They hear the warmth in it. They're not ready to let it in.";
const probeSit = (over) => Object.assign({ day: 45, vid: 'v_a', placesKnown: 0, askFieldPicks: 0, askFieldLines: [] }, over || {});

// (1) no seed JSONs -> NO-DATA.
{
  const r = A.summarizePlaceProbe([]);
  ok('(1) empty probe input is NO-DATA', r.bottleneck === 'NO-DATA' && r.sittings === 0, JSON.stringify(r));
}
// (2) sittings, none with places -> KNOWLEDGE.
{
  const r = A.summarizePlaceProbe([seedJSON({ placeProbeSittings: [probeSit({}), probeSit({ day: 60 })] })]);
  ok('(2) no sitting knows a place -> KNOWLEDGE', r.bottleneck === 'KNOWLEDGE' && r.sittings === 2 && r.withPlaces === 0, JSON.stringify(r));
}
// (3) places known but no asks -> ASK.
{
  const r = A.summarizePlaceProbe([seedJSON({ placeProbeSittings: [probeSit({ placesKnown: 3 })] })]);
  ok('(3) places known, no ask_field pick -> ASK', r.bottleneck === 'ASK' && r.withPlaces === 1 && r.askPicks === 0, JSON.stringify(r));
}
// (4) asks drawn but no place frame -> SPEND-FIRST.
{
  const r = A.summarizePlaceProbe([seedJSON({ placeProbeSittings: [probeSit({ placesKnown: 2, askFieldPicks: 1, askFieldLines: ['Nothing out there worth naming.'] })] })]);
  ok('(4) ask drawn, no place frame -> SPEND-FIRST', r.bottleneck === 'SPEND-FIRST' && r.askPicks === 1 && r.askLines === 1 && r.frames === 0, JSON.stringify(r));
}
// (5) asks drawing 2 distinct place frames -> FIRES.
{
  const r = A.summarizePlaceProbe([seedJSON({ placeProbeSittings: [probeSit({ placesKnown: 2, askFieldPicks: 2, askFieldLines: [PF_TRACE('a burned farmhouse'), PF_MARK('an old trapline')] })] })]);
  ok('(5) two distinct place frames -> FIRES', r.bottleneck === 'FIRES' && r.frames === 2 && Object.keys(r.frameCounts).length === 2, JSON.stringify(r));
}
// (6) detail rows only for sittings with places or asks.
{
  const r = A.summarizePlaceProbe([seedJSON({ placeProbeSittings: [probeSit({}), probeSit({ day: 60, placesKnown: 1 }), probeSit({ day: 80, askFieldPicks: 1, askFieldLines: ['x'] })] })]);
  ok('(6) detail rows only for places/asks sittings', r.detail.length === 2 && r.detail[0].day === 60 && r.detail[1].day === 80, JSON.stringify(r.detail));
}
// (7) softens line after a YOU pick -> counted, pick captured.
{
  const t = { seed: '100027', day: 45, vid: 'v_a', text: ['THEM: The ridge is quiet this time of year.', 'YOU: [seek_comfort] Tell me it will be all right.', `THEM: ${SW_SOFTENS}`].join('\n') };
  const r = A.summarizeSoftWarm([t]);
  ok('(7) softens line counted with its pick', r.softens === 1 && r.total === 1 && r.detail[0].pick === '[seek_comfort] Tell me it will be all right.', JSON.stringify(r.detail));
}
// (8) warmth line -> counted, prevThem is the preceding THEM line.
{
  const t = { seed: '100027', day: 45, vid: 'v_a', text: ['THEM: I left someone behind. Yeah.', 'YOU: [promise] I will ask the System about the pods.', `THEM: ${SW_WARMTH}`].join('\n') };
  const r = A.summarizeSoftWarm([t]);
  ok('(8) warmth line counted with prev THEM line', r.warmth === 1 && r.total === 1 && r.detail[0].prevThem === 'I left someone behind. Yeah.', JSON.stringify(r.detail));
}
// (9) no guard lines -> total 0.
{
  const t = { seed: '100027', day: 45, vid: 'v_a', text: 'THEM: The beans are coming up.\nYOU: [leave] (leave)\n' };
  const r = A.summarizeSoftWarm([t]);
  ok('(9) no guard lines is total 0', r.total === 0 && r.detail.length === 0, JSON.stringify(r));
}
// (10) a guard line revealed by goon attributes the TRIGGER pick — the
// last non-goon YOU pick (the move that queued the beat), not the goon.
{
  const t = { seed: '100027', day: 45, vid: 'v_a', text: ['THEM: First line.', 'YOU: [gossip] Tell me something about Joyce.', 'THEM: She hums at the beans.', 'YOU: [goon] "Take your time."', `THEM: ${SW_SOFTENS}`].join('\n') };
  const r = A.summarizeSoftWarm([t]);
  ok('(10) goon-revealed beat attributes the trigger pick, not goon', r.detail[0].triggerPick === '[gossip] Tell me something about Joyce.' && r.detail[0].pick === '[goon] "Take your time."', JSON.stringify(r.detail));
}
// (11) real main() panel: FIRES probe + softens 1 + warmth 1.
{
  const seeds = [seedJSON({ placeProbeSittings: [probeSit({ placesKnown: 2, askFieldPicks: 2, askFieldLines: [PF_TRACE('a burned farmhouse'), PF_MARK('an old trapline')] })] })];
  const transcripts = [{ name: 'journey-deepening-r184-transcript-100027-day45-v_a.txt',
    text: ['THEM: I left someone behind. Yeah.', 'YOU: [seek_comfort] Tell me it will be all right.', `THEM: ${SW_SOFTENS}`, 'YOU: [promise] I will ask the System about the pods.', `THEM: ${SW_WARMTH}`].join('\n') }];
  const out = runPanel('fires', seeds, transcripts);
  ok('(11) panel prints FIRES probe + softens 1 warmth 1',
    /Q1-PLACEPROBE PANEL:.*bottleneck=FIRES/.test(out) &&
    /Q2-SOFTWARM PANEL:.*softens=1 warmth=1 total=2/.test(out) &&
    /Q2-PLACEFRAME PANEL:.*frames=0.*NO-FRAMES/.test(out),
    out.split('\n').filter(l => /PLACEPROBE PANEL|SOFTWARM PANEL|PLACEFRAME PANEL/.test(l)).join(' | '));
}
console.log(`r184 analyzer proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
