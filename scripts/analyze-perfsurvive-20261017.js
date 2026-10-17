#!/usr/bin/env node
// scripts/analyze-perfsurvive-20261017.js — merges the 32 per-seed JSONs
// (26 from the main sweep + 6 from the targeted re-run) into the pilot
// verdict. Reads evidence/2026-10-17/perseed-perfsurvive/*.json.
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-perfsurvive');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
console.log(`per-seed files: ${rows.length}`);
const sum = {};
for (const r of rows) {
  const k = r.gate === '1' ? 'armed' : 'control';
  const s = sum[k] = sum[k] || {
    n: 0, attr: 0, attrW12: 0, perfFights: 0, perfSurvived: 0,
    national: 0, table: 0, wins: 0, exiled: 0,
    sDeaths: 0, sCombat: 0, vDeaths: 0, vCombat: 0, invites: 0, lost: 0,
    days: [], deathCauses: {}, byPolicy: {},
  };
  s.n++;
  s.attr += r.attr; s.attrW12 += r.attrW12 || 0;
  s.perfFights += r.perfFights; s.perfSurvived += r.perfSurvived;
  s.national += r.national; s.table += r.table; s.wins += r.wins; s.exiled += r.exiled;
  s.sDeaths += r.scholarDeaths; s.sCombat += r.scholarCombatDeaths;
  s.vDeaths += r.villagerDeaths; s.vCombat += r.villagerCombatDeaths;
  s.invites += r.psInvitesOk || 0;
  if (/village-lost|village-dead|pop-zero/.test(r.endReason)) s.lost++;
  s.days.push(r.days);
  for (const [c, n] of Object.entries(r.scholarDeathCauses || {})) s.deathCauses[c] = (s.deathCauses[c] || 0) + n;
  const bp = s.byPolicy[r.policy] = s.byPolicy[r.policy] || { n: 0, attr: 0, perfFights: 0, perfSurvived: 0 };
  bp.n++; bp.attr += r.attr; bp.perfFights += r.perfFights; bp.perfSurvived += r.perfSurvived;
}
for (const k of Object.keys(sum)) {
  const s = sum[k];
  s.attrPerRun = +(s.attr / s.n).toFixed(2);
  s.perfSurvivalRate = s.perfFights ? +(s.perfSurvived / s.perfFights).toFixed(4) : null;
  s.perfPerRun = +(s.perfFights / s.n).toFixed(2);
  s.convRate = s.perfFights ? +(s.attr / s.perfFights).toFixed(4) : null;
  s.days.sort((a, b) => a - b);
  s.medianDays = s.days[Math.floor(s.days.length / 2)];
  for (const p of Object.keys(s.byPolicy)) {
    const bp = s.byPolicy[p];
    bp.rate = bp.perfFights ? +(bp.perfSurvived / bp.perfFights).toFixed(4) : null;
  }
}
const c = sum.control, a = sum.armed;
// paired per-seed attr diffs (armed - control) by seed
const paired = [];
for (let seed = 9931; seed <= 9938; seed++) {
  for (const base of ['leadfeast', 'belongfeast']) {
    const cr = rows.find(r => r.policy === base && r.seed === seed);
    const ar = rows.find(r => r.policy === 'perfsurvive-' + base.replace('feast', '') && r.seed === seed);
    if (cr && ar) paired.push({ seed, base, dAttr: ar.attr - cr.attr, dPerf: (ar.perfFights - cr.perfFights) });
  }
}
const verdict = {
  primaryA_attrDiff: a.attr - c.attr, primaryA_bar: 4, primaryA_go: (a.attr - c.attr) >= 4,
  primaryB_survDiff: (a.perfSurvivalRate == null || c.perfSurvivalRate == null) ? null : +(a.perfSurvivalRate - c.perfSurvivalRate).toFixed(4),
  primaryB_bar: 0.15,
  primaryB_go: (a.perfSurvivalRate != null && c.perfSurvivalRate != null) ? (a.perfSurvivalRate - c.perfSurvivalRate) >= 0.15 : false,
};
verdict.go = verdict.primaryA_go || verdict.primaryB_go;
const guard = {
  villagerDeaths: { armed: a.vDeaths, control: c.vDeaths, ok: a.vDeaths <= c.vDeaths },
  scholarCombat: { armed: a.sCombat, control: c.sCombat, ok: a.sCombat <= c.sCombat + 2 },
  national: { armed: a.national, control: c.national, ok: a.national >= c.national - 2 },
  villageLost: { armed: a.lost, control: c.lost },
  medianDays: { armed: a.medianDays, control: c.medianDays },
  newDeathMode: (() => {
    const ck = new Set(Object.keys(c.deathCauses)), ak = new Set(Object.keys(a.deathCauses));
    return [...ak].filter(k => !ck.has(k));
  })(),
};
const report = { verdict, guard, paired, control: c, armed: a };
fs.writeFileSync(path.join(__dirname, '..', 'evidence', '2026-10-17', 'sim-perfsurvive-pilot.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify({ verdict, guard }, null, 1));
console.log('\npaired attr diffs (armed-control):', paired.map(p => `${p.base.replace('feast','')}${p.seed}:${p.dAttr >= 0 ? '+' : ''}${p.dAttr}`).join(' '));
console.log('control byPolicy:', JSON.stringify(c.byPolicy));
console.log('armed byPolicy:', JSON.stringify(a.byPolicy));
console.log('wrote evidence/2026-10-17/sim-perfsurvive-pilot.json');
