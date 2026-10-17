#!/usr/bin/env node
// build-r16-harness.js — clone journey-deepening-r15-20261017.js into
// journey-deepening-r16-20261017.js with the r16 modifications applied.
// R16 question: on the new tip (master@0371ac2f — crisis r20 shelter
// episode, succession r21 double-mantle, establishment r8 combat-wall
// legibility, feastvoice-b), (a) do r15's DEEPENING gains hold (M1-M8, C1,
// C3, C4)? (b) WAVE-2 CONTENT: are wave-2 monsters' counters discovered
// AND performed in real fights (the wave-2 counterpart to the w3 execution
// window)? (c) C2'' (corrected: 0 flee-mid-trick with fledHopeless=true
// and minHpFrac > 0.25) on the new tip? (d) REGIONAL LINKS/SCALE: do the
// scale ladder and inter-village links move in the deepening window?
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'scripts', 'journey-deepening-r15-20261017.js');
const DST = path.join(ROOT, 'scripts', 'journey-deepening-r16-20261017.js');

let s = fs.readFileSync(SRC, 'utf8');

const HEADER = `// journey-deepening-r16-20261017.js -- DEEPENING leg R16: wave-2 content +
// new-tip hold on r15's gains + regional/scale pressure.
// Base: master@0371ac2f (crisis r20 shelter episode, succession r21
// double-mantle, establishment r8 combat-wall legibility, feastvoice-b).
// r15's questions answered: execution window 40% non-lethal, actuation 37%
// given knowledge+contact (knowledge-rich, actuation-poor -- flesh-out lane),
// C2' metric-broken (0 hopeless-path violations; corrected C2'' now
// measurable), C5 queued on scarcity substrate.
// r16 keeps: M1-M8 (hold), C1, C3, C4 (hold), C2'' (corrected bar,
// now instrumented), C5 report-only (pantryMin).
// r16 new: WAVE-2 CONTENT census (distinct types faced, counters discovered
// with via-channels, tricks PERFORMED in real fights, ledger kills by type)
// + REGIONAL/SCALE: scale-ladder trace every 10d, link events, accord/national
// answers.
// PRE-REGISTER (2026-10-17, MEASUREMENT.md sections 9-12, 14):
//   Leg question: (a) do r15's DEEPENING gains hold on the new tip
//     (M1-M8, C1, C3, C4)? (b) are wave-2 monsters' counters DISCOVERED and
//     PERFORMED in the deepening window (the wave-2 execution window)?
//     (c) does the corrected C2'' bar hold (0 flee-mid-trick with
//     fledHopeless=true and minHpFrac > 0.25)? (d) do regional links and
//     the scale ladder move in the window?
//   Binding metrics (NO-GO never re-scored; revisions go to "metric review"):
//     M1 meetings -- player wave-3 fights on >=2/8 seeds (r15: 3/8).
//     M2 seasoning -- >=1/8 seeds with a seasoned link by day 100 (r15: 8/8).
//     M3 counter parity -- 'observed'-via discovery on >=2/8 (r15: 8/8).
//     M4 knowledge -- compounding >0 on >=6/8 seeds (r15: 8/8).
//     M5 people -- >=10 transcripts sense-read, 0 senseless flags.
//     M6 winnable -- alive at day 100 on >=4/8 (r15: 7/8); 0 mislabels.
//     M7' win-side inert -- 0 table|deedgate rows, seat 'none', no Watchers
//       staged (viewership reported, not gated).
//     M8 show-memory -- >=1/8 seeds with a 'show' lately beat (r15: 8/8).
//     C1 counterwire reachability -- >=1 NEW w3 trick PERFORMED in a real
//       field fight on >=2/8 seeds (r15: 2/8).
//     C2'' trick-aware morale (CORRECTED, r15 blank fill) -- 0 flee-mid-trick
//       events with fledHopeless=true and minHpFrac > 0.25.
//     C3 crisis-tier honesty -- >=1 raid aid-crisis at wave >=2 (r15: observed).
//     C4 kill attribution -- >=1 waveKillLog by=<vid> non-null on >=2/8 seeds
//       (r15: 8/8); >=1 via='companion' on >=1/8 (r15: 3/8).
//     C5 unknown flesh -- REPORT-ONLY (competent substrate; track pantryMin).
//     W1 wave-2 contact -- >=4 distinct wave-2 types FACED (player TB or
//       villager field fight) on >=4/8 seeds. (Fresh measurement; the
//       sim-understudy kill says contact is thin for some w2 species.)
//     W2 wave-2 counters -- >=1 wave-2 counter DISCOVERED on >=2/8 seeds
//       (any via channel), and >=1 wave-2 trick PERFORMED in a real fight
//       on >=1/8 seeds. (Fresh; 50%-bar lesson from E1: interesting if the
//       performance channel is non-zero at all on this substrate.)
//     R1 regional links -- >=1 active inter-village link OR >=1 accord/
//       counter/national answered event on >=2/8 seeds (REPORT-ONLY for the
//       bar; the deepening leg asks whether the scale lane even starts).
//   Interesting-finding bar: a wave-2 trick performed in a real fight; a
//   regional link formed; a scale-ladder climb above 'village'; any C2''
//   hopeless-path violation; any seed where wave-2 contact is zero despite
//   wave 2 being unlocked.
//   Horizon: DAYCAP=100, death-aware stop. Seeds: fresh 8901-8904 pilot;
//     EXPAND to 8901-8908 on the interesting-finding bar. Policy: competent.
//     SEATDRIVE unset (= driver ON).
// Canon read: CANON.md (2026-10-17), MONSTER-WAVES.md (wave law; wave-2
// entertainment predators all carry counter fields), no new canon invented.
// Usage: POLICY=competent SEEDS=8901,8902 node scripts/journey-deepening-r16-20261017.js
`;

s = s.replace(/\/\/ journey-deepening-r15-20261017\.js[\s\S]*?\/\/ Usage: POLICY=competent W3TRACE=1 SEEDS=8801,8802 node scripts\/journey-deepening-r15-20261017\.js\n/, HEADER);
s = s.split('journey-deepening-r15').join('journey-deepening-r16');
s = s.split('[8801, 8802, 8803, 8804]').join('[8901, 8902, 8903, 8904]');

// R16: scale-ladder trace — record scale + active-link count every 10 days
// in policy.daily (next to the pantry-min tracker).
s = s.replace(
  `    // R15: pantry-min tracker (C5 report-only: does any seed dip < 5000?)
    try { const _pk = pantryKcal(); if (ctx._pantryMin == null || _pk < ctx._pantryMin) ctx._pantryMin = _pk; } catch (e2) {}`,
  `    // R15: pantry-min tracker (C5 report-only: does any seed dip < 5000?)
    try { const _pk = pantryKcal(); if (ctx._pantryMin == null || _pk < ctx._pantryMin) ctx._pantryMin = _pk; } catch (e2) {}
    // R16: scale-ladder trace -- scale rank + active inter-village links
    // every 10 days (does the scale lane move in the deepening window?)
    try {
      const _d = gday();
      if (_d % 10 === 0 && (ctx._scaleTraceLast || 0) !== _d) {
        ctx._scaleTraceLast = _d;
        ctx.scaleTrace = ctx.scaleTrace || [];
        let _nl = 0;
        try { _nl = (_G.hierarchyState() || []).filter(l => l && l.status === 'active').length; } catch (e3) {}
        ctx.scaleTrace.push({ day: _d, scale: scaleNow(), activeLinks: _nl, pop: popAlive() });
      }
    } catch (e2) {}`);

// R16: wave-2 census block, inserted before the `const out = {` summary.
const W2BLOCK = `
  // R16: WAVE-2 CONTENT census -- the deepening leg's middle fauna.
  // Distinct types faced (player TB fights + villager field fights),
  // ledger kills by type, counter discoveries (via channels) and
  // performances in real fights.
  let w2Ids = new Set();
  try { for (const m of (_G.data.monsters || [])) { if ((m.wave | 0) === 2) w2Ids.add(m.id); } } catch (e2) {}
  const ffW2 = ff14.filter(f => (f.mwave || 1) === 2);
  const ffW2Trick = ffW2.filter(f => (f.trickLog || []).length > 0);
  const w2FacedField = [...new Set(ffW2.map(f => f.mid).filter(id => id && w2Ids.has(id)))];
  const w2FacedPlayer = [...new Set((ctx.fightsLog || []).flatMap(f => (f.monsters || []).filter(m => (m.wave || 1) === 2).map(m => m.id).filter(id => id && w2Ids.has(id))))];
  const w2Faced = [...new Set(w2FacedField.concat(w2FacedPlayer))];
  const w2killsByType = {};
  try {
    const L2 = (Game.ledgerState && Game.ledgerState()[2]) || {};
    for (const [mid, pts] of Object.entries(L2.perType || {})) w2killsByType[mid] = pts;
  } catch (e2) {}
  const w2Discoveries = (counterDiscoveredEvents || []).filter(e => w2Ids.has(e.id));
  const w2Known = (monsterCountersKnown || []).filter(id => w2Ids.has(id));
  const w2ObservedEvents = (counterObservedEvents || []).filter(e => w2Ids.has(e.id));
  const w2TrickFights = ffW2Trick.map(f => ({ day: f.day, who: f.vname, mid: f.mid, tricks: f.trickLog, outcome: f.outcome, rounds: f.rounds, minHpFrac: f.minHpFrac, holdLine: !!f.holdLine }));
  const w2ByType = {};
  for (const id of w2Ids) {
    w2ByType[id] = {
      faced: w2Faced.indexOf(id) >= 0,
      fieldFights: ffW2.filter(f => f.mid === id).length,
      trickFights: ffW2Trick.filter(f => f.mid === id).length,
      ledgerPts: w2killsByType[id] || 0,
      discovered: w2Known.indexOf(id) >= 0,
      via: (w2Discoveries.find(e => e.id === id) || {}).via || null,
    };
  }
  // R16: wave-2 missed-opportunity census -- no-trick field fights where
  // the village ALREADY knew the counter (end-of-run monsterCounters as the
  // honest upper bound, same convention as r15's E1). Plus intent split:
  // how many no-trick w2 fights had intent 'engage' via trick-known.
  let w2KnownSet = {};
  try { w2KnownSet = Game.state.monsterCounters || {}; } catch (e2) {}
  const ffW2NoTrick = ffW2.filter(f => (f.trickLog || []).length === 0);
  const w2Missed = ffW2NoTrick.filter(f => f.mid && w2KnownSet[f.mid]);
  const w2MissedDetail = w2Missed.map(f => ({ day: f.day, who: f.vname, mid: f.mid, outcome: f.outcome, rounds: f.rounds, intent: f.intent, intentWhy: f.intentWhy }));
  const w2NoTrickIntent = {};
  for (const f of ffW2NoTrick) { const k = (f.intentWhy || 'unknown'); w2NoTrickIntent[k] = (w2NoTrickIntent[k] || 0) + 1; }
  // R16: regional/scale summary from the scale trace + regionalLog.
  const scaleTrace = ctx.scaleTrace || [];
  const regionalEvents = (ctx.regionalLog || []).map(e => ({ day: e.day, ev: e.ev, target: e.target || e.name || null, how: e.how || e.result || null }));
  const linkEvents = regionalEvents.filter(e => ['propose', 'counter', 'accord', 'national'].indexOf(e.ev) >= 0);
  const maxScale = scaleTrace.length ? scaleTrace[scaleTrace.length - 1].scale : scaleNow();
`;
const anchor = '  const out = {\n';
if (s.indexOf(anchor) < 0) { console.error('ANCHOR MISSING: const out = {'); process.exit(1); }
s = s.replace(anchor, W2BLOCK + anchor);

// R16: extend the out object with wave2 + scale/regional.
s = s.replace(
  `    r14Markers: { counts: r14MarkerCounts, lines: r14MarkerLines, multiNameMourning },
  };`,
  `    r14Markers: { counts: r14MarkerCounts, lines: r14MarkerLines, multiNameMourning },
    // R16: wave-2 content census + regional/scale
    wave2: {
      distinctFaced: w2Faced.length, facedList: w2Faced,
      facedField: w2FacedField, facedPlayer: w2FacedPlayer,
      fieldFights: ffW2.length, trickFights: ffW2Trick.length,
      discoveries: w2Discoveries, observedEvents: w2ObservedEvents.length,
      known: w2Known, byType: w2ByType, killsByType: w2killsByType,
      trickFightDetails: w2TrickFights,
      missedOpportunities: w2Missed.length, missedDetail: w2MissedDetail,
      noTrickIntent: w2NoTrickIntent, noTrickFights: ffW2NoTrick.length,
    },
    regional: { scaleTrace, regionalEvents, linkEvents, maxScale },
  };`);

// R16: extend the per-seed DONE line with w2/regional stats.
s = s.replace(
  `hopelessOver=\${fleeMidTrickHopelessOver.length} res=\${JSON.stringify(resolution.trickFights)} aidC=\${aidCrises.length} comp=\${killViaCompanion} uFlesh=\${unknownFleshUnits} maxPiece=\${maxPieceKcal} ms=\${result.ms} -> \${fp}\`);`,
  `hopelessOver=\${fleeMidTrickHopelessOver.length} res=\${JSON.stringify(resolution.trickFights)} aidC=\${aidCrises.length} comp=\${killViaCompanion} uFlesh=\${unknownFleshUnits} maxPiece=\${maxPieceKcal} w2faced=\${w2Faced.length} w2disc=\${w2Discoveries.length} w2trick=\${ffW2Trick.length} scale=\${maxScale} links=\${linkEvents.length} ms=\${result.ms} -> \${fp}\`);`);

// R16: extend the summary line.
s = s.replace(
  `aidC=\${((s.aidCrises) || []).length} comp=\${(((s.killAttribution) || {}).viaCompanion) || 0}\${s.fatal ? ' FATAL: ' + s.fatal : ''}\`);`,
  `aidC=\${((s.aidCrises) || []).length} comp=\${(((s.killAttribution) || {}).viaCompanion) || 0} w2=\${(((s.wave2) || {}).distinctFaced) || 0} w2d=\${(((s.wave2) || {}).discoveries || []).length} w2t=\${(((s.wave2) || {}).trickFights) || 0} scale=\${(((s.regional) || {}).maxScale) || '?'} links=\${(((s.regional) || {}).linkEvents || []).length}\${s.fatal ? ' FATAL: ' + s.fatal : ''}\`);`);

fs.writeFileSync(DST, s);
console.log('wrote', DST, s.length, 'bytes');
try { require('child_process').execSync(`node --check ${DST}`, { stdio: 'inherit' }); console.log('node --check OK'); }
catch (e) { console.error('node --check FAILED'); process.exit(1); }
