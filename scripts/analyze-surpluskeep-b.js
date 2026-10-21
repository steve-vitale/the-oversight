#!/usr/bin/env node
// analyze-surpluskeep-b.js — paired analysis for sim-surpluskeep-diag-b.
//
// Reads evidence/2026-10-21/perseed-surpluskeep-b/{armed,control}-{leadfeast,belongfeast}.json
// and judges the four pre-registered bars:
//   1. UPKEEP-DOSE: Pearson(trimKcal, upkeepPaidDelta(control-armed)) >= 0.5
//   2. SKIP-SHIFT: armed skipped-upkeep-weeks/link-week > control on >= 12/16 pairs
//   3. DISSOLUTION-ATTRIBUTION: >= 75% of honest-gap pairs attribute to an
//      upkeep-mechanism cause (taxonomy 1-4); n < 4 -> INCONCLUSIVE
//   4. CHAIN-SIGNATURE: >= 50% of upkeep-attributed armed losses carry the
//      full 28d pre-loss chain (skipped weeks or accruing arrears + trust
//      declining below the polity bar)
// Plus wall numbers and the per-pair ledger. Writes flat per-seed summaries
// for the telemetry deviation check.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = 'evidence/2026-10-21/perseed-surpluskeep-b';
const POLICIES = ['leadfeast', 'belongfeast'];
const SEEDS = [8801, 8802, 8803, 8804, 8805, 8806, 8807, 8808];

function load(arm, pol) {
  const p = path.join(DIR, `${arm}-${pol}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8')).rows;
}

const C = {}, A = {};
for (const pol of POLICIES) {
  C[pol] = load('control', pol); A[pol] = load('armed', pol);
}
const crow = (pol, s) => C[pol].find(r => r.seed === s);
const arow = (pol, s) => A[pol].find(r => r.seed === s);

// ---- per-run upkeep rollups ----
function upkeepOf(row) {
  const u = row.upkeep || {};
  const tributePaid = u.tributePaid || 0, tendPaid = u.tendPaid || 0;
  // per-link week accounting from dawn snapshots
  // compact: [d, other, kindInt, dir, st, trust, arr, tpw, tdw, lkd, tkpw]
  const byOther = {};
  for (const l of (u.links || [])) {
    const o = l[1];
    (byOther[o] = byOther[o] || []).push(l);
  }
  let linkWeeks = 0, skipped = 0, tribSkipped = 0, tendSkipped = 0, tribWeeks = 0, tendWeeks = 0;
  for (const o of Object.keys(byOther)) {
    const rows = byOther[o].sort((a, b) => a[0] - b[0]);
    const dir = rows[0][3];
    if (dir === 2) continue; // peer league links: no tribute/tend verb
    const weeks = new Set(rows.map(l => Math.floor(l[0] / 7)));
    linkWeeks += weeks.size;
    const paid = new Set();
    for (const l of rows) {
      const mark = dir === 0 ? l[7] : l[8]; // tpw for tribute, tdw for tend
      if (mark >= 0) paid.add(mark);
    }
    const sk = weeks.size - paid.size;
    skipped += Math.max(0, sk);
    if (dir === 0) { tribWeeks += weeks.size; tribSkipped += Math.max(0, sk); }
    else { tendWeeks += weeks.size; tendSkipped += Math.max(0, sk); }
  }
  return {
    upkeepPaid: tributePaid + tendPaid, tributePaid, tendPaid,
    linkWeeks, skipped, skipRate: linkWeeks ? skipped / linkWeeks : 0,
    tribWeeks, tribSkipped, tendWeeks, tendSkipped,
    trimKcal: (row.sfeed || {}).trimKcal || 0,
    breaks: (u.breaks || []).length,
    natEvents: u.natEvents || [],
  };
}

// ---- dissolution classification (pre-registered taxonomy) ----
function classifyLoss(row) {
  // returns {cause, detail} for an ever-national run that lost the realm
  const u = row.upkeep || {};
  const natDay = row.nationalDay || 0;
  if (!natDay) return { cause: 'never-national', detail: '' };
  if (row.national) return { cause: 'held', detail: '' };
  const lostEv = (u.natEvents || []).find(e => e.kind === 'lost' && e.d >= natDay - 1);
  if (!lostEv) return { cause: 'unattributed', detail: 'nationalDay>0, end !national, no lost edge' };
  const lostDay = lostEv.d;
  const shape = row.nationalShape || lostEv.shape || '';
  // breaks inside the collapse window
  const winBreaks = (u.breaks || []).filter(b => b.d >= natDay - 7 && b.d <= lostDay);
  const links = u.links || [];
  const atLoss = links.filter(l => l[0] <= lostDay && l[0] > lostDay - 8); // last week snapshots
  const latestByOther = {};
  for (const l of links) { if (l[0] <= lostDay) latestByOther[l[1]] = l; }
  const lat = Object.values(latestByOther);
  if (shape === 'belong') {
    const sub = lat.find(l => l[3] === 0); // Haven subordinate link
    if (sub) {
      const trust = sub[5], arr = sub[6];
      if (arr > 0 || trust < 50) {
        return { cause: 'arrears-disqualify', detail: `sub-link trust ${trust}, arrears ${arr} at loss (good-standing: trust>=50, arrears=0)` };
      }
      return { cause: 'primary-realm-collapse', detail: 'Haven link good; primary realm collapsed' };
    }
    if (winBreaks.length) {
      const b = winBreaks[0];
      return { cause: 'break-' + b.how, detail: `break ${b.how} on ${b.other} at d${b.d}` };
    }
    return { cause: 'unattributed', detail: 'belong loss, sub-link not found in snapshots' };
  }
  // lead / conquest / covenant / trade shapes: count seasoned subs
  const subs = lat.filter(l => l[3] === 1 && l[4] === 0);
  const seasoned = subs.filter(l => l[5] >= 40);
  if (winBreaks.length) {
    const b = winBreaks[0];
    const map = { succession: 'break-succession-neglect', revolt: 'break-revolt' };
    const cause = map[b.how] || ('break-policy-' + b.how);
    return { cause, detail: `break ${b.how} on ${b.other} (trust ${b.trust}, arrears ${b.arrears}, kept ${b.keptDays}d) at d${b.d}` };
  }
  if (seasoned.length < 3) {
    const fell = subs.filter(l => l[5] < 40).map(l => `${l[1]}:${l[5]}`).join(',');
    return { cause: 'trust-crater-below-seasoned', detail: `${seasoned.length}/3+ seasoned at loss; fell: ${fell || 'none'}` };
  }
  return { cause: 'unattributed', detail: `${seasoned.length} seasoned at loss, no window break` };
}

function chainSignature(row, cause) {
  // 28d pre-loss window on polity links: skipped weeks or accruing arrears,
  // plus trust declining below the polity bar
  const u = row.upkeep || {};
  const natDay = row.nationalDay || 0;
  const lostEv = (u.natEvents || []).find(e => e.kind === 'lost' && e.d >= natDay - 1);
  if (!lostEv) return { ok: false, detail: 'no lost edge' };
  const lostDay = lostEv.d, shape = row.nationalShape || '';
  const links = u.links || [];
  const win = links.filter(l => l[0] > lostDay - 28 && l[0] <= lostDay);
  const byOther = {};
  for (const l of win) (byOther[l[1]] = byOther[l[1]] || []).push(l);
  let skippedW = 0, arrearsUp = false, trustLow = false;
  const bar = shape === 'belong' ? 50 : 40;
  for (const o of Object.keys(byOther)) {
    const rows = byOther[o].sort((a, b) => a[0] - b[0]);
    const dir = rows[0][3];
    if (dir === 2) continue;
    const weeks = [...new Set(rows.map(l => Math.floor(l[0] / 7)))];
    const paid = new Set();
    for (const l of rows) { const m = dir === 0 ? l[7] : l[8]; if (m >= 0) paid.add(m); }
    skippedW += Math.max(0, weeks.length - paid.size);
    const arrs = rows.map(l => l[6]);
    if (arrs.length > 1 && arrs[arrs.length - 1] > arrs[0]) arrearsUp = true;
    if (rows.some(l => l[5] < bar)) trustLow = true;
  }
  const ok = (skippedW >= 2 || arrearsUp) && trustLow;
  return { ok, detail: `skippedW=${skippedW} arrearsUp=${arrearsUp} trustLow(<${bar})=${trustLow}` };
}

// ---- main ----
const pairs = [];
for (const pol of POLICIES) for (const s of SEEDS) pairs.push({ pol, s });

let doseX = [], doseY = [];
let skipWins = 0;
const gapRows = [];
const ledger = [];

for (const { pol, s } of pairs) {
  const c = crow(pol, s), a = arow(pol, s);
  const cu = upkeepOf(c), au = upkeepOf(a);
  doseX.push(au.trimKcal); doseY.push(cu.upkeepPaid - au.upkeepPaid);
  if (au.skipRate > cu.skipRate) skipWins++;
  // honest-gap: armed ever-national, armed lost it, control held, armed survived to control's court day
  const cNat = c.nationalDay || 0;
  const honestGap = (a.nationalDay > 0) && !a.national && c.national && a.days >= cNat;
  let cls = null, chain = null;
  if ((a.nationalDay > 0) && !a.national) {
    cls = classifyLoss(a);
    if (/^(arrears-disqualify|trust-crater-below-seasoned|break-succession-neglect|break-revolt)$/.test(cls.cause)) {
      chain = chainSignature(a, cls.cause);
    }
  }
  if (honestGap) gapRows.push({ pol, s, cls, chain });
  ledger.push({
    pol, s,
    days: `${c.days}/${a.days}`,
    natEnd: `${c.national ? 1 : 0}/${a.national ? 1 : 0}`,
    natDay: `${cNat}/${a.nationalDay || 0}`,
    trimK: Math.round(au.trimKcal / 1000),
    upkeep: `${Math.round(cu.upkeepPaid / 1000)}k/${Math.round(au.upkeepPaid / 1000)}k`,
    skipRate: `${cu.skipRate.toFixed(2)}/${au.skipRate.toFixed(2)}`,
    breaks: `${cu.breaks}/${au.breaks}`,
    cause: cls ? cls.cause : '-',
  });
}

function pearson(xs, ys) {
  const n = xs.length, mx = xs.reduce((t, x) => t + x, 0) / n, my = ys.reduce((t, y) => t + y, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  return (sxx && syy) ? sxy / Math.sqrt(sxx * syy) : 0;
}

const r = pearson(doseX, doseY);
const upkeepCauses = gapRows.filter(g => g.cls && /^(arrears-disqualify|trust-crater-below-seasoned|break-succession-neglect|break-revolt)$/.test(g.cls.cause));
const chainOk = upkeepCauses.filter(g => g.chain && g.chain.ok);

// wall numbers
function wall(rows) {
  const n = rows.length;
  const w = {
    won: rows.filter(r => r.won).length,
    natEver: rows.filter(r => (r.nationalDay || 0) > 0).length,
    natEnd: rows.filter(r => r.national).length,
    table: rows.filter(r => r.table).length,
    w4: rows.filter(r => (r.maxWave || 1) >= 4).length,
    w5: rows.filter(r => (r.maxWave || 1) >= 5).length,
    exiled: rows.filter(r => r.exiled).length,
  };
  const ds = rows.map(r => r.days).sort((a, b) => a - b);
  w.median = ds.length % 2 ? ds[(ds.length - 1) / 2] : (ds[ds.length / 2 - 1] + ds[ds.length / 2]) / 2;
  w.max = Math.max(...ds);
  return w;
}
const allC = pairs.map(({ pol, s }) => crow(pol, s));
const allA = pairs.map(({ pol, s }) => arow(pol, s));
const wc = wall(allC), wa = wall(allA);

console.log('=== WALL (control / armed, n=16) ===');
console.log(`won ${wc.won}/${wa.won} | natEver ${wc.natEver}/${wa.natEver} | natEnd ${wc.natEnd}/${wa.natEnd} | table ${wc.table}/${wa.table} | w4 ${wc.w4}/${wa.w4} | w5 ${wc.w5}/${wa.w5} | exiled ${wc.exiled}/${wa.exiled}`);
console.log(`median ${wc.median}d/${wa.median}d | max ${wc.max}d/${wa.max}d`);

console.log('\n=== BAR 1 — UPKEEP-DOSE: Pearson(trimKcal, upkeepPaidDelta) >= 0.5 ===');
console.log(`r = ${r.toFixed(3)}  ${r >= 0.5 ? 'GO' : 'MISS'}`);

console.log('\n=== BAR 2 — SKIP-SHIFT: armed skipRate > control on >= 12/16 pairs ===');
console.log(`${skipWins}/16  ${skipWins >= 12 ? 'GO' : 'MISS'}`);

console.log('\n=== BAR 3 — DISSOLUTION-ATTRIBUTION: >= 75% of honest-gap pairs -> upkeep cause (1-4); n<4 INCONCLUSIVE ===');
console.log(`honest-gap pairs: ${gapRows.length}`);
for (const g of gapRows) {
  console.log(`  ${g.s} ${g.pol}: cause=${g.cls ? g.cls.cause : '?'} ${g.cls ? g.cls.detail : ''}${g.chain ? ` | chain: ${g.chain.ok ? 'FULL' : 'partial'} (${g.chain.detail})` : ''}`);
}
if (gapRows.length < 4) {
  console.log('INCONCLUSIVE — fewer than 4 honest-gap pairs (pre-registered rule)');
} else {
  const share = upkeepCauses.length / gapRows.length;
  console.log(`upkeep-attributed: ${upkeepCauses.length}/${gapRows.length} = ${share.toFixed(2)}  ${share >= 0.75 ? 'GO' : 'MISS'}`);
}

console.log('\n=== BAR 4 — CHAIN-SIGNATURE: >= 50% of upkeep-attributed armed losses carry the full 28d chain ===');
if (upkeepCauses.length) {
  console.log(`${chainOk.length}/${upkeepCauses.length}  ${chainOk.length / upkeepCauses.length >= 0.5 ? 'GO' : 'MISS'}`);
} else console.log('n/a — no upkeep-attributed losses');

console.log('\n=== PER-PAIR LEDGER (control / armed) ===');
console.log('seed pol days natEnd natDay trimK upkeep(c/a) skipRate(c/a) breaks cause(armed)');
for (const l of ledger) {
  console.log(`${l.s} ${l.pol} ${l.days} ${l.natEnd} ${l.natDay} ${l.trimK}k ${l.upkeep} ${l.skipRate} ${l.breaks} ${l.cause}`);
}

// flat per-seed summaries for the telemetry deviation check
const flatDir = path.join(DIR, 'flat');
fs.mkdirSync(flatDir, { recursive: true });
for (const { pol, s } of pairs) {
  for (const [arm, row] of [['control', crow(pol, s)], ['armed', arow(pol, s)]]) {
    fs.writeFileSync(path.join(flatDir, `${arm}-${pol}-${s}.json`),
      JSON.stringify({ seed: s, policy: pol, armed: arm === 'armed', national: !!row.national, table: !!row.table, won: !!row.won, exiled: !!row.exiled }) + '\n');
  }
}
console.log('\nwrote flat per-seed summaries to ' + flatDir);

// verdict rollup for the evidence file
const verdict = {
  bar1: { r: +r.toFixed(3), go: r >= 0.5 },
  bar2: { wins: skipWins, go: skipWins >= 12 },
  bar3: gapRows.length < 4 ? { inconclusive: true, n: gapRows.length }
    : { n: gapRows.length, upkeep: upkeepCauses.length, share: +(upkeepCauses.length / gapRows.length).toFixed(2), go: upkeepCauses.length / gapRows.length >= 0.75 },
  bar4: upkeepCauses.length ? { n: upkeepCauses.length, full: chainOk.length, go: chainOk.length / upkeepCauses.length >= 0.5 } : { n: 0 },
  wall: { control: wc, armed: wa },
};
fs.writeFileSync(path.join(DIR, 'verdict-surpluskeep-b.json'), JSON.stringify(verdict, null, 1) + '\n');
console.log('wrote ' + path.join(DIR, 'verdict-surpluskeep-b.json'));
