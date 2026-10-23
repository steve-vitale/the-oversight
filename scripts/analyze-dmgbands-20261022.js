#!/usr/bin/env node
// analyze-dmgbands-20261022.js — the pre-registered judge for the
// sim-dmg-bands DIAG corpus.
//
// Reads evidence/2026-10-22/perseed-dmg-bands/*.json and emits:
//   1. The band table: per (monster, band) and per band — nFights, nKills,
//      killRate, companion dmg/fight, scholar dmg/fight, pool range,
//      kill-time villager kills, damage-majority villager kills.
//   2. Kill-fight vs non-kill companion damage/fight.
//   3. The DIAG-GO verdict:
//        (a) attribution coverage: >=95% of all wave-4 encounter
//            companion damage sits in named band cells {L,M,H};
//        (b) zero unattributed: no TB 'other'-source damage on wave-4
//            monsters AND zero orphan kills.
//   4. Wall numbers: national / table / wins, wave 4-5 unlocks, median
//      survival.
//
// Usage: node scripts/analyze-dmgbands-20261022.js [--write]
// --write also writes evidence/2026-10-22/dmgbands-band-table.md
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-22', 'perseed-dmg-bands');

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json')).sort();
if (!files.length) { console.error('ANALYZE STOP: no per-seed JSONs in ' + EVID); process.exit(2); }
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));

const enc = [];
for (const r of runs) for (const e of (r.encounters || [])) enc.push(Object.assign({ _policy: r.policy, _seed: r.seed }, e));

const NAMED = new Set(['L', 'M', 'H']);
const compDmg = e => Math.round(e.dmgCompanion || 0);
const schDmg = e => Math.round(e.dmgScholar || 0);

// baseBand(e): the monster's canon band with the overtime RERUN scaling
// removed (overtime.js: hpPerTier 0.25). The tier is the named mechanism
// multiplier; the band names the monster. Encounters with tier 0 (or
// missing tier) use the measured pool directly.
function baseBand(e) {
  const tier = e.rerunTier | 0;
  if (!tier || e.pool == null) return e.band;
  const base = e.pool / (1 + 0.25 * tier);
  if (base >= 850 && base <= 1050) return 'L';
  if (base > 1050 && base <= 1250) return 'M';
  if (base > 1250 && base <= 1500) return 'H';
  return 'UNK';
}
for (const e of enc) e.baseBand = baseBand(e);

function cell() {
  return { n: 0, kills: 0, comp: 0, sch: 0, pools: [], tiers: {}, killTimeV: 0, dmgMajV: 0, mids: {} };
}
const byMidBand = {}, byBand = {};
function get(map, k) { return map[k] || (map[k] = cell()); }
for (const e of enc) {
  const mb = get(byMidBand, e.mid + '|' + e.baseBand);
  const b = get(byBand, e.baseBand);
  for (const c of [mb, b]) {
    c.n++;
    if (e.kill) c.kills++;
    c.comp += compDmg(e); c.sch += schDmg(e);
    if (e.pool != null) c.pools.push(e.pool);
    const t = 't' + (e.rerunTier | 0);
    c.tiers[t] = (c.tiers[t] || 0) + 1;
    if (e.killTimeVillager) c.killTimeV++;
    if (e.kill && e.dmgMaj) c.dmgMajV++;
  }
  mb.mids[e.mid] = true;
}

const r1 = x => Math.round(x * 10) / 10;
let md = '# sim-dmg-bands — companion damage vs wave-4 bands (DIAG corpus)\n\n';
md += `Corpus: ${runs.length} configs (${files.length} JSONs), ${enc.length} wave-4 encounters.\n\n`;
md += '## Band table (per monster x base-band; tiers in parens)\n\n';
md += '| monster | band | fights | kills | killRate | compDmg/fight | schDmg/fight | poolRange | tiers | killTimeV | dmgMajV |\n';
md += '|---|---|---|---|---|---|---|---|---|---|---|\n';
for (const k of Object.keys(byMidBand).sort()) {
  const c = byMidBand[k], mid = k.split('|')[0], band = k.split('|')[1];
  const pr = c.pools.length ? `${Math.min(...c.pools)}-${Math.max(...c.pools)}` : '—';
  const tr = Object.keys(c.tiers).sort().map(t => `${t}:${c.tiers[t]}`).join(' ');
  md += `| ${mid} | ${band} | ${c.n} | ${c.kills} | ${r1(c.kills / c.n)} | ${r1(c.comp / c.n)} | ${r1(c.sch / c.n)} | ${pr} | ${tr} | ${c.killTimeV} | ${c.dmgMajV} |\n`;
}
md += '\n## Band table (base-band aggregate)\n\n';
md += '| band | fights | kills | killRate | compDmg/fight | schDmg/fight | poolRange | tiers | killTimeV | dmgMajV |\n';
md += '|---|---|---|---|---|---|---|---|---|---|\n';
for (const band of ['L', 'M', 'H', 'UNK']) {
  const c = byBand[band]; if (!c) continue;
  const pr = c.pools.length ? `${Math.min(...c.pools)}-${Math.max(...c.pools)}` : '—';
  const tr = Object.keys(c.tiers).sort().map(t => `${t}:${c.tiers[t]}`).join(' ');
  md += `| ${band} | ${c.n} | ${c.kills} | ${r1(c.kills / c.n)} | ${r1(c.comp / c.n)} | ${r1(c.sch / c.n)} | ${pr} | ${tr} | ${c.killTimeV} | ${c.dmgMajV} |\n`;
}

// Kill-fight vs non-kill companion damage/fight.
const killF = enc.filter(e => e.kill), noKillF = enc.filter(e => !e.kill);
const avg = (xs, f) => xs.length ? r1(xs.reduce((t, e) => t + f(e), 0) / xs.length) : 0;
md += '\n## Kill-fight vs non-kill (companion damage per fight)\n\n';
md += `| class | fights | compDmg/fight | schDmg/fight |\n|---|---|---|---|\n`;
md += `| kill fights | ${killF.length} | ${avg(killF, compDmg)} | ${avg(killF, schDmg)} |\n`;
md += `| non-kill fights | ${noKillF.length} | ${avg(noKillF, compDmg)} | ${avg(noKillF, schDmg)} |\n`;

// Mechanism split (tb vs field).
const tbF = enc.filter(e => e.mechanism === 'tb'), flF = enc.filter(e => e.mechanism === 'field');
md += '\n## Mechanism split\n\n';
md += `| mechanism | fights | kills | compDmg/fight | schDmg/fight |\n|---|---|---|---|---|\n`;
md += `| tb (scholar fight + companions) | ${tbF.length} | ${tbF.filter(e => e.kill).length} | ${avg(tbF, compDmg)} | ${avg(tbF, schDmg)} |\n`;
md += `| field (villager off-screen) | ${flF.length} | ${flF.filter(e => e.kill).length} | ${avg(flF, compDmg)} | ${avg(flF, schDmg)} |\n`;

// DIAG-GO metric. Pre-registered form (§14 binding): coverage on the
// MEASURED band; the refined read (base-band, overtime scaling removed)
// is reported alongside — the verdict follows the pre-registered form.
const totalComp = enc.reduce((t, e) => t + compDmg(e), 0);
const namedComp = enc.filter(e => NAMED.has(e.band)).reduce((t, e) => t + compDmg(e), 0);
const coverage = totalComp > 0 ? namedComp / totalComp : null;
const namedBaseComp = enc.filter(e => NAMED.has(e.baseBand)).reduce((t, e) => t + compDmg(e), 0);
const coverageBase = totalComp > 0 ? namedBaseComp / totalComp : null;
const otherDmg = Math.round(enc.reduce((t, e) => t + (e.dmgOther || 0), 0));
const orphans = runs.reduce((t, r) => t + ((r.orphanKills || []).length), 0);
const joins = runs.reduce((t, r) => t + ((r.midfightJoins || []).length), 0);
const nErr = runs.reduce((t, r) => t + ((r.instrumentErrors || []).length), 0);
const goA = coverage != null && coverage >= 0.95;
const goB = otherDmg === 0 && orphans === 0;
md += '\n## DIAG-GO verdict (pre-registered)\n\n';
md += `- (a) attribution coverage (measured band): ${totalComp} companion dmg total, ${namedComp} in named bands {L,M,H} -> ${coverage == null ? 'n/a (no companion damage)' : r1(coverage * 100) + '%'} (bar >=95%) -> **${goA ? 'GO' : 'NO-GO'}**\n`;
md += `- (a-refined) coverage on base-band (overtime scaling removed): ${r1((coverageBase || 0) * 100)}% in named bands\n`;
md += `- (b) zero unattributed: TB other-source dmg=${otherDmg}, orphan kills=${orphans} -> **${goB ? 'GO' : 'NO-GO'}**\n`;
md += `- mid-fight joiners (informational, damage kept): ${joins}\n`;
md += `- instrument errors across corpus: ${nErr}\n`;
const rerunN = enc.filter(e => (e.rerunTier | 0) > 0).length;
md += `- overtime rerun encounters: ${rerunN}/${enc.length}\n`;
md += `\n**DIAG verdict (pre-registered form): ${goA && goB ? 'DIAG-GO' : 'DIAG-NO-GO'}**\n`;

// Wall numbers.
const sum = k => runs.reduce((t, r) => t + ((r[k] | 0) || 0), 0);
const surv = runs.filter(r => !r.won).map(r => r.gameDays || 0).sort((a, b) => a - b);
const med = surv.length ? surv[Math.floor(surv.length / 2)] : 0;
md += '\n## Wall numbers\n\n';
md += `national=${sum('national')} table=${sum('table')} won=${sum('won')} wave4=${sum('wave4')} wave5=${sum('wave5')} medianSurvival(non-winning)=${med}d maxSurv=${Math.max(...runs.map(r => r.gameDays || 0))}d\n`;

console.log(md);
if (process.argv.includes('--write')) {
  fs.writeFileSync(path.join(REPO, 'evidence', '2026-10-22', 'dmgbands-band-table.md'), md);
  console.log('wrote evidence/2026-10-22/dmgbands-band-table.md');
}
