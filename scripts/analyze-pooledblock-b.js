#!/usr/bin/env node
// analyze-pooledblock-b.js — pooled-block sign-flip analysis for sim-pooledblock-b.
// MEASUREMENT ONLY. Common instrument across all 3 blocks:
//   v(s,PD) = extra.glutInflowByChannel.scholarHomecoming / extra.glutDays
// Δ(b,s) = v(s,PD=1) − v(s,PD=0); block Δ = median; pooled Δ = median over 48.
// Pre-registered GO (sim-pooledblock-b.md): same sign on all 3 blocks for
// belongfeast/dg0 AND |pooled Δ| >= 400 kcal/glut-day.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-23');
const BLOCKS = [
  { id: 'B1', name: 'easingchannels (9250-9265)', dir: 'easingchannels-b-corpus', prefix: 'easingchannels-b', seeds: s9250to9265() },
  { id: 'B2', name: 'homecoming-diag-b (92801-92816)', dir: 'perseed-homecoming-diag-b', prefix: 'homecoming-diag-b', seeds: range(92801, 92816) },
  { id: 'B3', name: 'pooledblock-b (92831-92846)', dir: 'perseed-pooledblock-b', prefix: 'pooledblock-b', seeds: range(92831, 92846) },
];
function range(a, b) { const r = []; for (let s = a; s <= b; s++) r.push(s); return r; }
function s9250to9265() { const r = []; for (let s = 9250; s <= 9265; s++) r.push(s); return r; }
const CELLS = ['pd0dg0', 'pd0dg1', 'pd1dg0', 'pd1dg1'];
const POLICIES = ['leadfeast', 'belongfeast'];
const med = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };

function load(block, cell, policy, seed) {
  const p = path.join(EVID, block.dir, `${block.prefix}-${cell}-${policy}-s${seed}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const out = { blocks: {}, cells: {}, pooled: {}, verdict: null, guardrails: {}, wall: {}, excludes: [] };

// per-seed values and deltas per block x cell(policy:cell)
for (const b of BLOCKS) {
  out.blocks[b.id] = { name: b.name, seedsExpected: b.seeds.length, seedsLoaded: 0 };
  for (const policy of POLICIES) {
    for (const cell of CELLS) {
      const key = policy + '/' + cell;
      const pd0 = [], pd1 = [], pairs = [];
      const cell0 = 'pd0' + cell.slice(3), cell1 = 'pd1' + cell.slice(3);
      for (const s of b.seeds) {
        let j0, j1;
        try { j0 = load(b, cell0, policy, s); } catch (e) { continue; }
        try { j1 = load(b, cell1, policy, s); } catch (e) { continue; }
        const g0 = j0.extra.glutDays, g1 = j1.extra.glutDays;
        if (!g0 || !g1) { out.excludes.push({ block: b.id, cell: key, seed: s, glutDays: [g0, g1] }); continue; }
        const v0 = (j0.extra.glutInflowByChannel.scholarHomecoming || 0) / g0;
        const v1 = (j1.extra.glutInflowByChannel.scholarHomecoming || 0) / g1;
        pd0.push(v0); pd1.push(v1); pairs.push({ seed: s, d: v1 - v0, v0, v1 });
      }
      const dk = b.id + '/' + key;
      out.cells[dk] = {
        n: pairs.length,
        medPd0: med(pd0), medPd1: med(pd1),
        blockDelta: pairs.length ? med(pairs.map(p => p.d)) : null,
        deltas: pairs.map(p => ({ seed: p.seed, d: +p.d.toFixed(1) })),
      };
      out.blocks[b.id].seedsLoaded += pairs.length;
    }
  }
}

const sign = x => (x > 0 ? '+' : x < 0 ? '-' : '0');

// primary: belongfeast/dg0
const primaryKey = 'belongfeast/pd0dg0';
const blockSigns = {}, blockDeltas = {};
let allDeltas = [];
for (const b of BLOCKS) {
  const c = out.cells[b.id + '/' + primaryKey];
  blockDeltas[b.id] = c.blockDelta == null ? null : +c.blockDelta.toFixed(1);
  blockSigns[b.id] = c.blockDelta == null ? '?' : sign(c.blockDelta);
  allDeltas = allDeltas.concat(c.deltas.map(d => d.d));
}
const pooled = med(allDeltas);
out.pooled = { n: allDeltas.length, delta: +pooled.toFixed(1), blockDeltas, blockSigns };
const signsAgree = new Set(Object.values(blockSigns)).size === 1 && !Object.values(blockSigns).includes('?');
out.verdict = (signsAgree && Math.abs(pooled) >= 400)
  ? `GO (sign ${Object.values(blockSigns)[0]} on all 3 blocks, pooled |Δ|=${Math.abs(+pooled.toFixed(1))} >= 400)`
  : `NO-GO (${signsAgree ? 'signs agree (' + Object.values(blockSigns)[0] + ') but' : 'sign disagreement: ' + JSON.stringify(blockSigns)} pooled |Δ|=${Math.abs(+pooled.toFixed(1))} ${Math.abs(pooled) >= 400 ? '>=' : '<'} 400)`;

// secondaries: sign census on the other 3 cells
out.secondaries = {};
for (const key of ['leadfeast/pd0dg0', 'leadfeast/pd0dg1', 'belongfeast/pd0dg1']) {
  const bs = {}, bd = {};
  for (const b of BLOCKS) {
    const c = out.cells[b.id + '/' + key];
    bd[b.id] = c.blockDelta == null ? null : +c.blockDelta.toFixed(1);
    bs[b.id] = c.blockDelta == null ? '?' : sign(c.blockDelta);
  }
  out.secondaries[key] = { blockDeltas: bd, blockSigns: bs, agree: new Set(Object.values(bs)).size === 1 };
}

// guardrails on B3 (report + FAIL bars)
out.guardrails = {};
for (const policy of POLICIES) {
  for (const dg of ['dg0', 'dg1']) {
    const c0 = 'pd0' + dg, c1 = 'pd1' + dg, key = policy + '/' + dg;
    const surv = [], starve = [];
    const causes0 = new Set(), causes1 = new Set();
    let vd0 = 0, sd0 = 0, vd1 = 0, sd1 = 0;
    for (const s of BLOCKS[2].seeds) {
      let j0, j1;
      try { j0 = load(BLOCKS[2], c0, policy, s); } catch (e) { continue; }
      try { j1 = load(BLOCKS[2], c1, policy, s); } catch (e) { continue; }
      surv.push(j1.daysAlive - j0.daysAlive);
      const st0 = (j0.extra.starveDeaths || 0), st1 = (j1.extra.starveDeaths || 0);
      starve.push(st1 - st0);
      vd0 += j0.villageDays || 0; vd1 += j1.villageDays || 0;
      sd0 += (j0.extra.starveDays || 0); sd1 += (j1.extra.starveDays || 0);
      Object.keys(j0.deathCauses || {}).forEach(k => causes0.add(k.split(':')[1] || k));
      Object.keys(j1.deathCauses || {}).forEach(k => causes1.add(k.split(':')[1] || k));
    }
    const newModes = [...causes1].filter(k => ![...causes0].some(c0k => (c0k || '').split('/')[0] === (k || '').split('/')[0]));
    out.guardrails[key] = {
      n: surv.length,
      medSurvDiff: surv.length ? +med(surv).toFixed(1) : null,
      starveDeathDiff: starve.reduce((t, x) => t + x, 0),
      exposureStarve0: vd0 ? +(sd0 / vd0 * 100).toFixed(3) : null,
      exposureStarve1: vd1 ? +(sd1 / vd1 * 100).toFixed(3) : null,
      pd1OnlyCauseNames: [...causes1].filter(k => ![...causes0].includes(k)).slice(0, 12),
      failG1: med(surv) < -10, failG2: starve.reduce((t, x) => t + x, 0) >= 6,
    };
  }
}

// wall on B3
const wall = { national: 0, everNational: 0, table: 0, wins: 0, wave4: 0, wave5: 0, surv: [], cells: {} };
const deathCauses = {};
for (const policy of POLICIES) {
  for (const cell of CELLS) {
    const key = policy + '/' + cell;
    const c = { national: 0, table: 0, wins: 0, wave4: 0, wave5: 0, surv: [], n: 0 };
    for (const s of BLOCKS[2].seeds) {
      let j;
      try { j = load(BLOCKS[2], cell, policy, s); } catch (e) { continue; }
      c.n++;
      c.national += j.national ? 1 : 0; wall.national += j.national ? 1 : 0;
      wall.everNational += (j.extra.everNational ? 1 : 0);
      c.table += j.table ? 1 : 0; wall.table += j.table ? 1 : 0;
      c.wins += j.win ? 1 : 0; wall.wins += j.win ? 1 : 0;
      c.wave4 += j.extra.wave4 ? 1 : 0; wall.wave4 += j.extra.wave4 ? 1 : 0;
      c.wave5 += j.extra.wave5 ? 1 : 0; wall.wave5 += j.extra.wave5 ? 1 : 0;
      c.surv.push(j.daysAlive); wall.surv.push(j.daysAlive);
      for (const [k, n] of Object.entries(j.deathCauses || {})) deathCauses[k] = (deathCauses[k] || 0) + n;
    }
    c.medSurv = c.surv.length ? +med(c.surv).toFixed(0) : null;
    wall.cells[key] = c;
  }
}
wall.medSurv = wall.surv.length ? +med(wall.surv).toFixed(0) : null;
wall.maxSurv = wall.surv.length ? Math.max(...wall.surv) : null;
wall.deathCauses = Object.fromEntries(Object.entries(deathCauses).sort((a, b) => b[1] - a[1]).slice(0, 15));
out.wall = wall;

const repPath = path.join(EVID, 'pooledblock-b-analyzer-report.json');
fs.writeFileSync(repPath, JSON.stringify(out, null, 1));
console.log('wrote ' + repPath);
console.log('\n# POOLED-BLOCK VERDICT (primary: belongfeast/dg0)');
console.log('block signs: ' + JSON.stringify(blockSigns));
console.log('block Δ medians (kcal/glut-day): ' + JSON.stringify(blockDeltas));
console.log('pooled Δ over ' + allDeltas.length + ' seeds: ' + (+pooled.toFixed(1)));
console.log('VERDICT: ' + out.verdict);
console.log('\n# secondaries (sign census)');
for (const [k, v] of Object.entries(out.secondaries)) console.log(k, JSON.stringify(v.blockSigns), JSON.stringify(v.blockDeltas), 'agree=' + v.agree);
console.log('\n# guardrails (B3)');
for (const [k, v] of Object.entries(out.guardrails)) console.log(k, 'medSurvDiff=' + v.medSurvDiff, 'starveDeathDiff=' + v.starveDeathDiff, 'expStarve ' + v.exposureStarve0 + '->' + v.exposureStarve1, 'failG1=' + v.failG1, 'failG2=' + v.failG2);
console.log('\n# wall (B3, n=' + wall.surv.length + ')');
console.log('national=' + wall.national, 'everNational=' + wall.everNational, 'table=' + wall.table, 'wins=' + wall.wins, 'wave4=' + wall.wave4, 'wave5=' + wall.wave5, 'medSurv=' + wall.medSurv);
for (const [k, c] of Object.entries(wall.cells)) console.log('  ' + k + ': nat=' + c.national + ' tab=' + c.table + ' win=' + c.wins + ' w4=' + c.wave4 + ' w5=' + c.wave5 + ' medSurv=' + c.medSurv + ' n=' + c.n);
console.log('\nexcludes (glutDays=0): ' + out.excludes.length);
