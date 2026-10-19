#!/usr/bin/env node
// build-r21-harness.js — clone journey-deepening-r20-20261019.js into
// journey-deepening-r21-20261019.js with the r21 modifications applied.
// R21 question (adopted from r20 metric review + r14 proposals):
//   (a) CONTACT-CONDITIONED wave-3 reachability — r20's raw metric conflated
//       contact with the kill economy (9304 faced 1 wave-2 type in 94 days).
//       Pre-register unlock rate conditioned on contact: seeds with >=3
//       distinct wave-2 types faced. Bar: >=2/4 conditioned (pilot-equiv).
//   (b) KILL-SOURCE attribution widened — r20 sampled 30 kills; the game
//       keeps the full waveKillLog + waveKillByChannel counters (via.w+wave).
//       This run reports the full-log split: player ('p') vs villager vs
//       unattributed, plus the channel counters. Who lands ledger points.
//   (c) MOOD HOLDING continued — r13 6%, r14 11%, bar <20% on audits.
//       r14's proposal (a): audit-at-final-day — seeds that never hit gd=100
//       still count. Nina-class reads (trust>=80 + >=6/10 company days yet
//       'lonely') flagged for human sense-review, never auto-metriced.
//   (d) PEOPLE check report-only — dialogue engine is the social loop's lane
//       (r19/r20): NO dialogue code changes. Track the r20 handover clusters:
//       mashed stage-0 openers, cross-conversation verbatim repeats.
// PRE-REGISTER (2026-10-19, MEASUREMENT.md sections 9-12, 14 — BINDING):
//   R1 (contact-conditioned, PRIMARY): among competent seeds with >=3
//     distinct wave-2 types faced, >=2/4 pilot-equivalent unlock wave 3 by
//     day 80. Raw bar: >=2/4 unlocks. A conditioned miss = reachability
//     finding for Steve (his gate, never levered here).
//   R2 (kill-source, report-only): full-log byPlayer/byVillager/byNull +
//     byChannel; who lands ledger points. INTERESTING: an apex ledger kill
//     (moderator / grief_counselor / performance_review).
//   M1 (mood holding): 'lonely' <20% across audits (day-100 + final-day).
//     Nina-class reads flagged for human review.
//   M4 (people): >=10 transcripts sense-read, 0 senseless (report-only).
//   M5 (winnable): >=3/4 pilot seeds alive at end; 0 death-honesty mislabels.
//   INTERESTING-FINDING BAR: unlock before day 40; >=8 types faced with 0
//     kills; apex ledger kill; Nina-class read; new transcript defect cluster.
//   Seeds: fresh 9401-9404 competent pilot (expand 9405-9408 only on
//     GO-shaped signal). DAYCAP=100, death-aware stop (+10d tail max).
// RACE GUARDS: (1) wave pacing/encounter scheduling is flesh-out territory —
//   this run OBSERVES contact scheduling, takes NO pacing lever. (2)
//   dialogue engine is the social loop's lane — report-only, no dialogue code
//   changes. (3) the kills-only wave-3 gate is Steve's design — measured,
//   never moved. (4) telemetry baseline: interpret sums per-seed (r20 lesson:
//   sum swings are seed-count artifacts).
// Canon read: CANON.md, MONSTER-WAVES.md (2026-10-19). No new canon.
// Usage: POLICY=competent SEEDS=9401,9402 node scripts/journey-deepening-r21-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'scripts', 'journey-deepening-r20-20261019.js');
const SRC13 = path.join(ROOT, 'scripts', 'journey-deepening-r13fix-20261018.js');
const DST = path.join(ROOT, 'scripts', 'journey-deepening-r21-20261019.js');

let s = fs.readFileSync(SRC, 'utf8');
const s13 = fs.readFileSync(SRC13, 'utf8');

const HEADER = `// journey-deepening-r21-20261019.js -- DEEPENING leg R21: contact-conditioned
// wave-3 reachability + widened kill-source attribution + mood-audit hold.
// Base: master@929a6ae90 (r20 measurement on master).
// R21 question (r20 metric-review + r14 proposals, adopted verbatim):
//   (a) CONTACT-CONDITIONED reachability: r20's raw metric conflated contact
//       with the kill economy (9304 faced 1 wave-2 type in 94d). Pre-register
//       unlock rate | seeds with >=3 distinct wave-2 types faced. Bar: >=2/4
//       conditioned (pilot-equiv), raw >=2/4.
//   (b) KILL-SOURCE widened: full waveKillLog + waveKillByChannel (via.w+wave)
//       — player ('p') vs villager vs unattributed. Who lands ledger points.
//   (c) MOOD HOLDING: r13 6%, r14 11%, bar <20%. Audit-at-final-day so short
//       seeds count. Nina-class reads (trust>=80 + >=6/10 company days yet
//       'lonely') -> human sense-review, never auto-metric.
//   (d) PEOPLE report-only (dialogue lane = social loop's: NO dialogue code
//       changes). Track r20 handover clusters: mashed stage-0 openers,
//       cross-conversation verbatim repeats.
// PRE-REGISTER (2026-10-19, MEASUREMENT.md 9-12, 14 - BINDING):
//   R1 conditioned unlock >=2/4; raw >=2/4. R2 report byPlayer/byVillager/
//     byNull + byChannel. M1 lonely <20% across audits. M4 >=10 transcripts
//     0 senseless (report-only). M5 >=3/4 alive, 0 mislabels.
//   Seeds: fresh 9401-9404 competent pilot (expand 9405-9408 on GO signal).
//     DAYCAP=100, death-aware stop.
// RACE GUARDS: no pacing lever (flesh-out territory); no dialogue changes
//   (social loop's lane); gate is Steve's design, measured never moved.
// Canon: CANON.md, MONSTER-WAVES.md (2026-10-19). No new canon.
// Usage: POLICY=competent SEEDS=9401,9402 node scripts/journey-deepening-r21-20261019.js
`;

// 1. Replace the header block (everything up to 'use strict';)
s = s.replace(/^[\s\S]*?'use strict';\n/, HEADER + "'use strict';\n");

// 2. Naming
s = s.split('journey-deepening-r20-').join('journey-deepening-r21-');
s = s.split('journey-deepening-r20-POLICYX').join('journey-deepening-r21-POLICYX');

// 3. Insert moodAudit() (from r13fix) before runSeed.
const m13 = s13.match(/\/\/ ---- R12 M7 mood-honesty audit ----[\s\S]*?\n}\n/);
if (!m13) throw new Error('moodAudit not found in r13fix harness');
const MOODFN = m13[0];
if (s.indexOf('function moodAudit()') < 0) {
  s = s.replace('async function runSeed(seed) {', MOODFN + '\nasync function runSeed(seed) {');
} else {
  throw new Error('moodAudit already present');
}

// 4. Fire the audit at gd===100 (set flag), inside the deed-checkpoint block.
const CP_ANCHOR = `      try {
        const td = JSON.parse(JSON.stringify((_G.state.village || {}).traderDeep || {}));
        ctx.traderDeepSnaps.push({ day: gd, deep: td });
      } catch (e) {}
    }`;
const CP_ADD = `      try {
        const td = JSON.parse(JSON.stringify((_G.state.village || {}).traderDeep || {}));
        ctx.traderDeepSnaps.push({ day: gd, deep: td });
      } catch (e) {}
      // R21: audit-at-final-day (r14 metric review) — record whether gd=100
      // fired; the fallback (after runDays) covers short seeds.
      if (gd === 100) {
        try { ctx.moodAudit100 = moodAudit(); } catch (e) { ctx.moodAudit100 = { err: String(e && e.message) }; }
        ctx._auditFired100 = true;
      }
    }`;
if (s.indexOf(CP_ANCHOR) < 0) throw new Error('checkpoint anchor not found');
s = s.split(CP_ANCHOR).join(CP_ADD);

// 5. Final-day fallback audit, right after ctx is resolved post-runDays.
const CTX_ANCHOR = `  const ctx = policy._ctx || {};`;
const CTX_ADD = `  const ctx = policy._ctx || {};
  // R21: audit-at-final-day fallback — seeds that never hit gd=100 still
  // count in the census (r14 documented 5/8 seeds missing the day-100 audit).
  if (!ctx._auditFired100) {
    try { ctx.moodAuditFinal = { day: result.gameDays, rows: moodAudit() }; }
    catch (e) { ctx.moodAuditFinal = { day: result.gameDays, err: String(e && e.message) }; }
  }`;
if (s.indexOf(CTX_ANCHOR) < 0) throw new Error('ctx anchor not found');
s = s.split(CTX_ANCHOR).join(CTX_ADD);

// 6. Widened kill-source attribution (full log + game-side channel counters).
const KILL_ANCHOR = `  let killLog = [], killByNonNull = 0, killViaCompanion = 0, killWithTrick = 0;
  try {
    killLog = (Game.state.waveKillLog || []).slice(-400);
    for (const k of killLog) {
      if (k && k.by) killByNonNull++;
      if (k && k.via === 'companion') killViaCompanion++;
      if (k && k.trick) killWithTrick++;
    }
  } catch (e2) {}`;
const KILL_ADD = `  // R21: widened kill-source attribution — the game keeps the FULL
  // waveKillLog (capped at 1000) + waveKillByChannel counters keyed
  // via.w+wave, so no sampling is needed. ATTRIBUTION SEMANTICS (verified
  // in src/js/game.js:41391-41398): in TB fights _killerVid defaults to the
  // scholar's villagerId and _killerVia stays 'player' ONLY when the scholar
  // landed the killing blow (by is never literally 'p'); a companion kill
  // reassigns _killerVia='companion'. So byChannel['player.w*'] = the
  // scholar's own killing blows; 'companion.w*' = companion blows in TB;
  // wild/patrol/agency/aid-crisis = villager field paths; contest = contest
  // kills. Note: waveKillLog ALSO includes pyrrhic kills (lost TB fights
  // where the beast died anyway — recordPyrrhicKill does NOT score the
  // ledger), so the channel census is "kills the village made", a superset
  // of ledger-scored kills.
  let killLog = [], killByNonNull = 0, killByPlayer = 0, killByVillager = 0, killViaCompanion = 0, killWithTrick = 0, killByChannel = {};
  try {
    killLog = (Game.state.waveKillLog || []);
    for (const k of killLog) {
      if (k && k.by) killByNonNull++;
      if (k && k.via === 'companion') killViaCompanion++;
      if (k && k.trick) killWithTrick++;
    }
    killByChannel = JSON.parse(JSON.stringify(Game.state.waveKillByChannel || {}));
    // scholar's own killing blows = 'player'-channel entries (see semantics)
    for (const [ch, n] of Object.entries(killByChannel)) {
      if (ch.indexOf('player.') === 0) killByPlayer += (n | 0);
      else if (ch.indexOf('companion.') !== 0) killByVillager += (n | 0);
    }
  } catch (e2) {}`;
if (s.indexOf(KILL_ANCHOR) < 0) throw new Error('kill attribution anchor not found');
s = s.split(KILL_ANCHOR).join(KILL_ADD);

const KA_ANCHOR = `    killAttribution: { logSampled: killLog.length, byNonNull: killByNonNull, viaCompanion: killViaCompanion, withTrick: killWithTrick,
      companionSample: killLog.filter(k => k && k.via === 'companion').slice(0, 5) },`;
const KA_ADD = `    killAttribution: { logSampled: killLog.length, byNonNull: killByNonNull, byPlayer: killByPlayer, byVillager: killByVillager,
      byNull: killLog.length - killByNonNull, viaCompanion: killViaCompanion, withTrick: killWithTrick, byChannel: killByChannel,
      companionSample: killLog.filter(k => k && k.via === 'companion').slice(0, 5) },`;
if (s.indexOf(KA_ANCHOR) < 0) throw new Error('killAttribution JSON anchor not found');
s = s.split(KA_ANCHOR).join(KA_ADD);

// 7. w3unlock summary derived from ctx.waveLog (unlock day + ledger points).
const FW_ANCHOR = `    finalWave: waveNow(), finalScale: scaleNow(), probed: !!ctx.probed,`;
const FW_ADD = `    finalWave: waveNow(), finalScale: scaleNow(), probed: !!ctx.probed,
    w3unlock: (() => { const e = (ctx.waveLog || []).find(x => x && (x.wave || 0) >= 3); return e ? { day: e.day, w2pointsAtUnlock: e.w2points } : { day: null }; })(),`;
if (s.indexOf(FW_ANCHOR) < 0) throw new Error('finalWave anchor not found');
s = s.split(FW_ANCHOR).join(FW_ADD);

// 8. mood audits into the per-seed JSON.
const WL_ANCHOR = `    waveLog: ctx.waveLog || [], deedLog: ctx.deedLog || [],`;
const WL_ADD = `    waveLog: ctx.waveLog || [], deedLog: ctx.deedLog || [],
    moodAudit100: ctx.moodAudit100 || null, moodAuditFinal: ctx.moodAuditFinal || null,`;
if (s.indexOf(WL_ANCHOR) < 0) throw new Error('waveLog anchor not found');
s = s.split(WL_ANCHOR).join(WL_ADD);

fs.writeFileSync(DST, s);
console.log('wrote', DST, s.length, 'bytes');
