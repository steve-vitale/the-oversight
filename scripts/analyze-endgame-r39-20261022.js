#!/usr/bin/env node
// analyze-endgame-r39-20261022.js — PRIMARY verdict for journey-endgame r39
// (lane B, 2026-10-22): THE OVERTIME WINDOW AS LIVED PLAY.
//
// Reads evidence/2026-10-22/perseed-endgame-r39/endgame-r39-*.json and
// reports the pre-registered legs:
//
//  M1 tier narration: on every sat seed, every tier 1..maxTier has BOTH an
//     overtime_tier tele and a "◈ OVERTIME ×N" SAY line. GO = 4/4 sat seeds.
//  M2 populated window: on every sat seed, every waiting-week (7d from the
//     announce) has ≥1 tele event AND ≥3 SAY lines. SAY density per week is
//     approximated: windowSayLines / windowWeeks >= 3 (the instrument notes
//     this approximation). GO = 4/4 sat seeds.
//  M3 deferral surfaced: ≥3/4 sat seeds have ≥1 "Take your seat" beat in the
//     window transcript. GO = ≥3/4.
//  REG r35: 0 silent audits on sat seeds with nonzero w4/w5 deeds.
//  REG r37: satPenalty present + voiced-line match on sat seeds.
//  GUARD: ≥3/4 seeds reach the table window (announceDay != null).
//
// Exit 1 = NO-GO on any binding leg. A miss is reported, never re-scored.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-22', 'perseed-endgame-r39');
const files = fs.readdirSync(DIR).filter(f => /^endgame-r39-\d+\.json$/.test(f));
if (!files.length) { console.error('no seed JSONs'); process.exit(2); }
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

let m1go = 0, m1n = 0, m2go = 0, m2n = 0, m3go = 0, m3n = 0;
let reg35bad = 0, reg37bad = 0, reached = 0;
const lines = [];
for (const r of rows) {
  if (r.announceDay != null) reached++;
  const sat = r.satDay != null;
  let m1 = '—', m2 = '—', m3 = '—', rg35 = '—', rg37 = '—';
  if (sat) {
    // M1
    m1n++;
    const tiers = (r.tierNarration || []);
    const silent = tiers.filter(t => !(t.sayOk && t.teleOk));
    if (r.maxTier >= 0 && silent.length === 0 && tiers.length === r.maxTier) { m1 = 'GO'; m1go++; }
    else m1 = `NO-GO silent=${JSON.stringify(silent)}`;
    // M2
    m2n++;
    const deadWeeks = (r.weekRows || []).filter(w => (w.teleEvents | 0) < 1);
    const sayPerWeek = r.windowWeeks > 0 ? r.windowSayLines / r.windowWeeks : 0;
    if (deadWeeks.length === 0 && sayPerWeek >= 3) { m2 = 'GO'; m2go++; }
    else m2 = `NO-GO deadWeeks=${deadWeeks.map(w => w.day).join(',')||'none'} sayPerWeek=${sayPerWeek.toFixed(1)}`;
    // M3
    m3n++;
    if ((r.deferBeats | 0) >= 1) { m3 = `GO beats=${r.deferBeats}`; m3go++; }
    else m3 = 'NO-GO no defer beats';
    // REG r35
    const w45 = r.satWaves ? (r.satWaves.w4 | 0) + (r.satWaves.w5 | 0) : 0;
    if (w45 > 0) {
      if (r.auditNamed) rg35 = 'GO named';
      else { rg35 = 'NO-GO SILENT'; reg35bad++; }
    } else rg35 = 'vacuous';
    // REG r37
    if (r.otMismatch) { rg37 = `NO-GO ${r.otMismatch}`; reg37bad++; }
    else rg37 = r.satPenalty ? `GO pen=${r.satPenalty.penalty}` : 'GO (no penalty)';
  }
  lines.push(`seed ${r.seed}: ann=${r.announceDay} sat=${r.satDay} seat=${r.satSeatKind} maxTier=${r.maxTier} weeks=${r.windowWeeks} say/wk=${r.windowWeeks ? (r.windowSayLines / r.windowWeeks).toFixed(1) : '—'} teleEvs=${r.windowTeleEvents} defer=${r.deferBeats} path=${r.walkedPath}/${r.walkedBranch} won=${r.won} end=${r.endReason} alive=${r.census.alive} | M1=${m1} M2=${m2} M3=${m3} REG35=${rg35} REG37=${rg37}`);
}
console.log(lines.join('\n'));
console.log('---');
const go = (g, n) => `${g}/${n} ${g === n ? 'GO' : 'NO-GO'}`;
console.log(`M1 tier-narration:      ${go(m1go, m1n)}`);
console.log(`M2 populated-window:    ${go(m2go, m2n)}`);
console.log(`M3 deferral-surfaced:   ${m3go}/${m3n} ${m3go >= 3 ? 'GO' : 'NO-GO'}`);
console.log(`REG r35 audit-naming:   ${reg35bad === 0 ? 'GO' : 'NO-GO ' + reg35bad}`);
console.log(`REG r37 ot-record:      ${reg37bad === 0 ? 'GO' : 'NO-GO ' + reg37bad}`);
console.log(`GUARD reached-window:   ${reached}/${rows.length} ${reached >= 3 ? 'GO' : 'NO-GO'}`);
const allGo = m1go === m1n && m2go === m2n && m3go >= 3 && reg35bad === 0 && reg37bad === 0 && reached >= 3;
console.log(allGo ? 'PRIMARY: GO' : 'PRIMARY: NO-GO');
process.exit(allGo ? 0 : 1);
