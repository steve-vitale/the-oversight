#!/usr/bin/env node
// scripts/analyze-fullseat-a.js — per-seed + aggregate analysis of the
// sim-fullseat-a pilot corpus (evidence/2026-10-29/perseed-fullseat-a/).
// Read-only: prints the per-seed gate-attribution table and corrected
// aggregates (the sweep's first summary.json computed starvationTotal
// from a wrong field name — rows carry starvationDeaths — so this
// analyzer is the corrected record; the sweep script itself is fixed
// in the same commit).
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-29', 'perseed-fullseat-a');
const rows = [];
for (const f of fs.readdirSync(DIR)) {
  if (!f.endsWith('.json') || f === 'summary.json') continue;
  rows.push(JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
}
rows.sort((a, b) => (a.seed - b.seed) || (a.policy < b.policy ? -1 : 1));
const seeds = [...new Set(rows.map(r => r.seed))].sort((a, b) => a - b);
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
console.log('PER-SEED (off = substrate, on = fullseat-pursuit)');
console.log('seed arm days end won rankF/max arc wave natE table ent kind fullOff fullRdy gateFull endSeat endBind(maxDist) sent surge unlock(st/t4/t5/uw) patrol chan feast skip starv');
for (const s of seeds) {
  for (const pid of ['off', 'on']) {
    const r = rows.find(x => x.seed === s && x.policy === pid);
    if (!r) { console.log(`${s} ${pid} MISSING`); continue; }
    const e = r.endSnap || {};
    const d = r.diag || {};
    const u = (r.endSnapFull && r.endSnapFull.unlock) || {};
    const md = (d.maxDist) || {};
    console.log(`${s} ${pid} ${r.days} ${r.endReason} won=${r.won} ${r.finalRank}/${r.maxRank} arc=${r.maxArc} wv=${r.waveReach} nat=${r.nationalEver} tbl=${r.table} ent=${r.entered} ${r.enteredKind || '-'} fullOff=${r.fullOffer} fullRdy=${r.fullReady} gateFull=${r.gateFullEver} endSeat=${e.seat || '?'} bind=${(e.binding || []).join('+') || '-'} maxDist=${JSON.stringify(md)} sent=${d.sentDay ?? '-'} surge=${d.surgeDay ?? '-'} unlock=${u.standing ?? '?'}/${u.t4 ?? '?'}/${u.t5 ?? '?'}/uw${u.unlockedWave ?? '?'} patrol=${r.fsc.fsPatrols || 0} chan=${r.fsc.fsChannels || 0} feast=${r.fsc.fsFeasts || 0} skip=${r.fsc.fsLesserSkipped || 0} starv=${r.starvationDeaths} deaths=${JSON.stringify(r.deaths)}`);
  }
}
for (const pid of ['off', 'on']) {
  const rs = rows.filter(r => r.policy === pid);
  const starv = rs.reduce((t, r) => t + r.starvationDeaths, 0);
  console.log(`\nAGG ${pid}: n=${rs.length} won=${rs.reduce((t, r) => t + r.won, 0)} medDays=${medianOf(rs.map(r => r.days))} natEver=${rs.reduce((t, r) => t + r.nationalEver, 0)} natFinal=${rs.reduce((t, r) => t + r.nationalFinal, 0)} table=${rs.reduce((t, r) => t + r.table, 0)} entered=${rs.reduce((t, r) => t + r.entered, 0)} fullOffer=${rs.reduce((t, r) => t + r.fullOffer, 0)} fullReady=${rs.reduce((t, r) => t + r.fullReady, 0)} fullEntered=${rs.reduce((t, r) => t + r.fullEntered, 0)} gateFullEver=${rs.reduce((t, r) => t + r.gateFullEver, 0)} wave4=${rs.filter(r => r.waveReach >= 4).length} wave5=${rs.filter(r => r.waveReach >= 5).length} starvTotal=${starv} armStarvBySeed=${JSON.stringify(Object.fromEntries(rs.map(r => [r.seed, r.starvationDeaths])))}`);
}
let armOnly = 0;
for (const s of seeds) {
  const c = rows.find(r => r.policy === 'off' && r.seed === s);
  const a = rows.find(r => r.policy === 'on' && r.seed === s);
  if (c && a && c.starvationDeaths === 0 && a.starvationDeaths > 0) armOnly += a.starvationDeaths;
}
const off = rows.filter(r => r.policy === 'off'), on = rows.filter(r => r.policy === 'on');
const offStarv = off.reduce((t, r) => t + r.starvationDeaths, 0);
const onStarv = on.reduce((t, r) => t + r.starvationDeaths, 0);
const onFullOffer = on.reduce((t, r) => t + r.fullOffer, 0);
const onFullEntered = on.reduce((t, r) => t + r.fullEntered, 0);
console.log(`\nVERDICT-INPUTS (corrected): primaryPass=${onFullOffer >= 2 || onFullEntered >= 1} (onFullOffer=${onFullOffer} need>=2, onFullEntered=${onFullEntered} need>=1); cost1=${onStarv <= offStarv + 2} (on=${onStarv} off=${offStarv}); cost2=${armOnly <= 2} (armOnly=${armOnly}); cost3=${medianOf(on.map(r => r.days)) >= 0.8 * medianOf(off.map(r => r.days))} (onMed=${medianOf(on.map(r => r.days))} offMed=${medianOf(off.map(r => r.days))})`);
console.log(`VERDICT: ${(onFullOffer >= 2 || onFullEntered >= 1) && onStarv <= offStarv + 2 && armOnly <= 2 && medianOf(on.map(r => r.days)) >= 0.8 * medianOf(off.map(r => r.days)) ? 'GO' : 'NO-GO'}`);
