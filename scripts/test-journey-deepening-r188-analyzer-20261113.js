'use strict';
// test-journey-deepening-r188-analyzer-20261113.js -- R188 analyzer proof
// (runs the REAL r188 analyzer on synthetic inputs; no driver needed).
// summarizePlaceProbe (r184 Q1 — carried):
//   (1) no seed JSONs -> NO-DATA, sittings 0.
//   (2) sittings, none with placesKnown >= 1 -> KNOWLEDGE.
//   (3) places known but no ask_field picks -> ASK.
//   (4) asks drawn but no place frame (non-place ask lines) -> SPEND-FIRST.
//   (5) asks drawing 2 distinct place frames -> FIRES, frames 2.
//   (6) detail rows only for sittings with places or asks.
// summarizeSoftWarm (r184 Q2 — carried; the old 2 lines are gone from
// the game, so these prove the reader still works on old text):
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
// summarizeSecretProbe (r188 Q1 — the confession funnel from the
// driver's secretProbeSittings: trust at sitting start, hasSecret,
// secretSharedBefore, acuteNeed, openerThread, confessionFired):
//   (12) no seed JSONs -> NO-DATA, sittings 0.
//   (13) sittings, none trust >= 40 -> NO-DATA, trust40 0, eligible 0.
//   (14) trust >= 40 but the secret was already shared -> NO-DATA,
//       sharedAlready 1, eligible 0.
//   (15) eligible sitting displaced by a higher-priority opener (want)
//       -> NO-DATA, displaced 1, branchReached 0.
//   (16) 5 eligible branch-reached sittings, 0 fired -> QUIET-PATH.
//   (17) 1 eligible sitting with a confession fired -> FIRES,
//       firedNotEligible 0.
//   (18) a fired confession whose hasSecret reads 'unknown' ->
//       firedNotEligible 1 (the instrument sanity check trips).
// summarizeGuardLines (r188 Q2 — the r134 6-line moodguard pool,
// same trigger-pick attribution as summarizeSoftWarm):
//   (19) one guard line after a YOU pick -> total 1, kind guard-hear.
//   (20) all 6 lines counted, distinct kinds 6.
//   (21) a guard line revealed by goon attributes the TRIGGER pick.
// Panel (real main()):
//   (22) a FIRES-shaped secret-probe seed JSON + a transcript with 1
//       guard line -> Q1-SECRETPROBE verdict=FIRES, Q2-GUARDLINES
//       total=1.
// RED/FAILURE MODE: run with ANALYZER=./analyze-journey-deepening-r187-20261112.js
// — (12)-(18) crash (summarizeSecretProbe is not a function), (19)-(21)
// crash (summarizeGuardLines is not a function), (22) fails (no r188
// panel lines), (23)-(29) crash (scanVInit / scanDoubleAsk are not
// functions).
const A = require(process.env.ANALYZER || './analyze-journey-deepening-r188-20261113.js');
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
  const dir = fs.mkdtempSync(path.join('/tmp', 'r188-panel-'));
  seeds.forEach((s, i) => fs.writeFileSync(path.join(dir, `journey-deepening-r188-seed${100027 + i}.json`), JSON.stringify(s)));
  (transcripts || []).forEach(t => fs.writeFileSync(path.join(dir, t.name), t.text));
  let out = '';
  try {
    out = execFileSync('node', [path.join(__dirname, process.env.ANALYZER || 'analyze-journey-deepening-r188-20261113.js'), dir], { encoding: 'utf8' });
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
const secSit = (over) => Object.assign({ day: 45, vid: 'v_a', trust: 10, hasSecret: true, secretSharedBefore: false, acuteNeed: false, openerThread: 'small', confessionFired: false }, over || {});
// The six guard-beat lines (convo-mood.js convoMoodShift 'moodguard', r134 pool).
const GL_HEAR = 'They hear you out, but something in them stays guarded.';
const GL_NOD = 'They nod — and keep their distance, for now.';
const GL_PASSES = 'The moment passes without landing. Not yet.';
const GL_NOTHING = 'They take it in and give nothing back. Not yet.';
const GL_SHUT = 'Something in them stays shut, for now.';
const GL_SIT = 'They let the words sit there, unanswered.';

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
  const transcripts = [{ name: 'journey-deepening-r188-transcript-100027-day45-v_a.txt',
    text: ['THEM: I left someone behind. Yeah.', 'YOU: [seek_comfort] Tell me it will be all right.', `THEM: ${SW_SOFTENS}`, 'YOU: [promise] I will ask the System about the pods.', `THEM: ${SW_WARMTH}`].join('\n') }];
  const out = runPanel('fires', seeds, transcripts);
  ok('(11) panel prints FIRES probe + softens 1 warmth 1',
    /Q1-PLACEPROBE PANEL:.*bottleneck=FIRES/.test(out) &&
    /Q2-SOFTWARM PANEL:.*softens=1 warmth=1 total=2/.test(out) &&
    /Q2-PLACEFRAME PANEL:.*frames=0.*NO-FRAMES/.test(out),
    out.split('\n').filter(l => /PLACEPROBE PANEL|SOFTWARM PANEL|PLACEFRAME PANEL/.test(l)).join(' | '));
}
// (12) no seed JSONs -> NO-DATA.
{
  const r = A.summarizeSecretProbe([]);
  ok('(12) empty secret-probe input is NO-DATA', r.verdict === 'NO-DATA' && r.sittings === 0, JSON.stringify(r));
}
// (13) sittings, none trust >= 40 -> NO-DATA.
{
  const r = A.summarizeSecretProbe([seedJSON({ secretProbeSittings: [secSit({}), secSit({ day: 60, trust: 39 })] })]);
  ok('(13) no sitting reaches trust 40 -> NO-DATA', r.verdict === 'NO-DATA' && r.sittings === 2 && r.trust40 === 0 && r.eligible === 0, JSON.stringify(r));
}
// (14) trust >= 40 but the secret was already shared -> NO-DATA.
{
  const r = A.summarizeSecretProbe([seedJSON({ secretProbeSittings: [secSit({ trust: 45, secretSharedBefore: true })] })]);
  ok('(14) trust 40 but secret already shared -> NO-DATA', r.verdict === 'NO-DATA' && r.trust40 === 1 && r.sharedAlready === 1 && r.eligible === 0, JSON.stringify(r));
}
// (15) eligible sitting displaced by a higher-priority opener -> NO-DATA.
{
  const r = A.summarizeSecretProbe([seedJSON({ secretProbeSittings: [secSit({ trust: 45, openerThread: 'want' })] })]);
  ok('(15) eligible but want-opener displaced it -> NO-DATA', r.verdict === 'NO-DATA' && r.eligible === 1 && r.displaced === 1 && r.branchReached === 0, JSON.stringify(r));
}
// (16) 5 eligible branch-reached sittings, 0 fired -> QUIET-PATH.
{
  const sits = [0, 1, 2, 3, 4].map(i => secSit({ day: 45 + i * 5, trust: 50, openerThread: 'small' }));
  const r = A.summarizeSecretProbe([seedJSON({ secretProbeSittings: sits })]);
  ok('(16) 5 branch-reached, 0 fired -> QUIET-PATH', r.verdict === 'QUIET-PATH' && r.branchReached === 5 && r.fired === 0, JSON.stringify(r));
}
// (17) 1 eligible sitting with a confession fired -> FIRES.
{
  const r = A.summarizeSecretProbe([seedJSON({ secretProbeSittings: [secSit({ trust: 45, openerThread: 'secret', confessionFired: true })] })]);
  ok('(17) one confession fired -> FIRES', r.verdict === 'FIRES' && r.fired === 1 && r.firedNotEligible === 0 && r.branchReached === 1, JSON.stringify(r));
}
// (18) a fired confession whose hasSecret reads 'unknown' -> sanity check trips.
{
  const r = A.summarizeSecretProbe([seedJSON({ secretProbeSittings: [secSit({ trust: 45, hasSecret: 'unknown', openerThread: 'secret', confessionFired: true })] })]);
  ok('(18) fired but hasSecret unknown -> firedNotEligible 1', r.fired === 1 && r.firedNotEligible === 1, JSON.stringify(r));
}
// (19) one guard line after a YOU pick -> counted with its trigger.
{
  const t = { seed: '100027', day: 45, vid: 'v_a', text: ['THEM: The ridge is quiet this time of year.', 'YOU: [seek_comfort] Tell me it will be all right.', `THEM: ${GL_HEAR}`].join('\n') };
  const r = A.summarizeGuardLines([t]);
  ok('(19) guard-hear line counted with its trigger', r.total === 1 && r.counts['guard-hear'] === 1 && r.detail[0].triggerPick === '[seek_comfort] Tell me it will be all right.', JSON.stringify(r.detail));
}
// (20) all 6 lines counted, distinct kinds 6.
{
  const lines = [GL_HEAR, GL_NOD, GL_PASSES, GL_NOTHING, GL_SHUT, GL_SIT];
  const t = { seed: '100027', day: 45, vid: 'v_a', text: lines.map((l, i) => `THEM: ${l}`).join('\n') };
  const r = A.summarizeGuardLines([t]);
  ok('(20) all six guard lines counted distinctly', r.total === 6 && Object.keys(r.counts).length === 6, JSON.stringify(r.counts));
}
// (21) a guard line revealed by goon attributes the TRIGGER pick.
{
  const t = { seed: '100027', day: 45, vid: 'v_a', text: ['THEM: First line.', 'YOU: [gossip] Tell me something about Joyce.', 'THEM: She hums at the beans.', 'YOU: [goon] "Take your time."', `THEM: ${GL_NOD}`].join('\n') };
  const r = A.summarizeGuardLines([t]);
  ok('(21) goon-revealed guard line attributes the trigger pick, not goon', r.detail[0].triggerPick === '[gossip] Tell me something about Joyce.' && r.detail[0].pick === '[goon] "Take your time."', JSON.stringify(r.detail));
}
// (22) real main() panel: FIRES secret probe + 1 guard line.
{
  const seeds = [seedJSON({ secretProbeSittings: [secSit({ trust: 45, openerThread: 'secret', confessionFired: true })], secretSharedEnd: { count: 2, vids: ['v_a', 'v_b'] } })];
  const transcripts = [{ name: 'journey-deepening-r188-transcript-100027-day45-v_a.txt',
    text: ['THEM: I left someone behind. Yeah.', 'YOU: [seek_comfort] Tell me it will be all right.', `THEM: ${GL_HEAR}`].join('\n') }];
  const out = runPanel('secret-fires', seeds, transcripts);
  ok('(22) panel prints FIRES secret probe + guard total 1 + sharedEnd 2',
    /Q1-SECRETPROBE PANEL:.*fired=1 sharedEnd=2.*-> FIRES/.test(out) &&
    /Q2-GUARDLINES PANEL:.*total=1/.test(out),
    out.split('\n').filter(l => /SECRETPROBE PANEL|GUARDLINES PANEL/.test(l)).join(' | '));
}
// scanVInit (r188 Q1 — the repaired V-INIT scan; r187 corpus shapes):
//   (23) Chantal's true staged proposal (bond pool line, speaker prefix +
//       quotes) -> bondSittings 1, candidates 0.
//   (24) Greta's water-haul outing ask ("come with me ... fill packs") ->
//       bondSittings 0, candidates 1 (broad shape, manual review only).
//   (25) an outing resume ("We still have the outing to finish") ->
//       bondSittings 0, candidates 0 (bare `outing` is out entirely).
//   (26) a link-raise line -> bondSittings 1.
// scanDoubleAsk (r188 Q2 — the Chantal double-ask shape):
//   (27) the same bond line twice with a generic YOU pick between and a
//       bond:accept menu after the second speaking -> doubleSittings 1,
//       betweenPicks captures the generic yes, offeredAfterSecond holds
//       the bond menu.
//   (28) a single speaking -> doubleSittings 0.
// Panel (real main()):
//   (29) a FIRES-shaped secret-probe seed JSON + a transcript with a bond
//       proposal -> V-INIT PANEL bondSittings=1, DOUBLE-ASK PANEL
//       doubleSittings=0.
const CHANTAL_LINE = '"I\'ve been thinking. You and me — we should be bonded. Not just neighbors. Will you stick with me?"';
const GRETA_OUTING = 'I know the creek bend... come with me and we\'ll fill packs before dark.';
const OUTING_RESUME = 'We still have the outing to finish.';
const LINK_LINE = 'We should link with Stonebridge. I know them. We\'d be stronger together.';
{
  const t = { file: 'chantal.txt', seed: '100041', day: 34, vid: 'chantal_mukendi', text: ['want: request', `THEM: Chantal: ${CHANTAL_LINE}`, 'YOU: [generic] Yes.', 'THEM: They nod. "Okay."'].join('\n') };
  const r = A.scanVInit([t]);
  ok('(23) Chantal true proposal counts 1', r.bondSittings === 1 && r.candidates.length === 0, JSON.stringify(r));
}
{
  const t = { file: 'greta.txt', seed: '100041', day: 34, vid: 'greta', text: ['want: outing', `THEM: Greta: "${GRETA_OUTING}"`, 'YOU: [goon] "Take your time."'].join('\n') };
  const r = A.scanVInit([t]);
  ok('(24) water-haul outing ask is a candidate, not a bond', r.bondSittings === 0 && r.candidates.length === 1, JSON.stringify(r));
}
{
  const t = { file: 'resume.txt', seed: '100041', day: 45, vid: 'greta', text: ['want: small', `THEM: Greta: "${OUTING_RESUME}"`, 'YOU: [leave] (leave)'].join('\n') };
  const r = A.scanVInit([t]);
  ok('(25) outing resume counts neither bond nor candidate', r.bondSittings === 0 && r.candidates.length === 0, JSON.stringify(r));
}
{
  const t = { file: 'link.txt', seed: '100041', day: 45, vid: 'henry', text: ['want: request', `THEM: Henry: "${LINK_LINE}"`, 'YOU: [link:accept] Yes, link us.'].join('\n') };
  const r = A.scanVInit([t]);
  ok('(26) link-raise line counts 1', r.bondSittings === 1, JSON.stringify(r));
}
{
  const t = { file: 'double.txt', seed: '100041', day: 34, vid: 'chantal_mukendi', text: ['want: request', `THEM: Chantal: ${CHANTAL_LINE}`, 'YOU: [generic] Yes.', 'THEM: They nod. "Okay."', 'YOU: [teach] Show me the trapline.', `THEM: Chantal: ${CHANTAL_LINE}`, '(offered=bond:accept,bond:decline)', 'YOU: [bond:accept] Stick together, then.'].join('\n') };
  const r = A.scanDoubleAsk([t]);
  ok('(27) double-ask detected with generic yes between + bond menu after', r.doubleSittings === 1 && r.detail[0].count === 2 && r.detail[0].betweenPicks.length >= 1 && /bond:accept/.test(r.detail[0].offeredAfterSecond || ''), JSON.stringify(r.detail));
}
{
  const t = { file: 'single.txt', seed: '100041', day: 34, vid: 'chantal_mukendi', text: ['want: request', `THEM: Chantal: ${CHANTAL_LINE}`, 'YOU: [bond:accept] Stick together, then.'].join('\n') };
  const r = A.scanDoubleAsk([t]);
  ok('(28) single speaking is not a double-ask', r.doubleSittings === 0, JSON.stringify(r));
}
{
  const seeds = [seedJSON({ secretProbeSittings: [secSit({ trust: 45, openerThread: 'secret', confessionFired: true })], secretSharedEnd: { count: 2, vids: ['v_a', 'v_b'] } })];
  const transcripts = [{ name: 'journey-deepening-r188-transcript-100041-day34-chantal_mukendi.txt',
    text: ['want: request', `THEM: Chantal: ${CHANTAL_LINE}`, 'YOU: [bond:accept] Stick together, then.'].join('\n') }];
  const out = runPanel('vinit', seeds, transcripts);
  ok('(29) panel prints V-INIT bondSittings=1 + DOUBLE-ASK doubleSittings=0',
    /V-INIT PANEL:.*bondSittings=1/.test(out) &&
    /DOUBLE-ASK PANEL:.*doubleSittings=0/.test(out),
    out.split('\n').filter(l => /V-INIT PANEL|DOUBLE-ASK PANEL/.test(l)).join(' | '));
}
console.log(`r188 analyzer proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
