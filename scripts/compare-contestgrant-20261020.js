#!/usr/bin/env node
// scripts/compare-contestgrant-20261020.js — merges the 4 per-side sweep OUT
// files (before/after x leadfeast/belongfeast) into the PRIMARY verdict,
// the det-gate, guardrails, and wall numbers.
//
// PRE-REGISTERED PRIMARY: the planted day-30 grant beat teaches iff the fix
// is present. Per run (conditioned on preBeat==0):
//   after-arm:  postBeat >= 1
//   before-arm: postBeat === 0
// GO: all conditioned runs satisfy the primary AND the det-gate passes.
// KILL: any primary miss, or any unexplained trajectory divergence.
//
// DET-GATE: before/after trajectories on identical seed+policy must have
// byte-identical BEHAVIOR hashes on every day. The only permitted
// divergence: knowledge hashes differing in hunting_spear after the
// planted-grant day on the after arm (the mechanism's own footprint).
//
// GUARDRAILS: median survival within -10d noise vs before; starvation
// shares / wave-4 reach within noise; no new death modes; check.js --quick
// parity with the pre-existing 4 failures (documented 2026-10-20).
//
// Usage:
//   node scripts/compare-contestgrant-20261020.js \
//     <before-lead.json> <after-lead.json> <before-belong.json> <after-belong.json>
'use strict';
const fs = require('fs');
const [bLeadP, aLeadP, bBelP, aBelP] = process.argv.slice(2);
if (!bLeadP || !aLeadP || !bBelP || !aBelP) {
  console.error('usage: compare-contestgrant-20261020.js <before-lead> <after-lead> <before-belong> <after-belong>');
  process.exit(2);
}
const load = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const B_L = load(bLeadP), A_L = load(aLeadP), B_B = load(bBelP), A_B = load(aBelP);
const med = (a) => { const s = (a || []).slice().sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };
const sum = (a) => (a || []).reduce((t, x) => t + (x || 0), 0);

for (const [f, d] of [[bLeadP, B_L], [aLeadP, A_L], [bBelP, B_B], [aBelP, A_B]]) {
  if (d.policy !== (f.includes('lead') ? 'leadfeast' : 'belongfeast') || d.side !== (f.includes('before') ? 'before' : 'after')) {
    console.error(`FATAL: file ${f} has policy=${d.policy} side=${d.side} — naming mismatch`); process.exit(2);
  }
}
for (const [x, y, tag] of [[B_L, A_L, 'leadfeast'], [B_B, A_B, 'belongfeast']]) {
  if (JSON.stringify(x.seeds) !== JSON.stringify(y.seeds)) {
    console.error(`FATAL: seed sets differ on ${tag}`); process.exit(2);
  }
}

// ---- PRIMARY ----
let primary = { afterMet: 0, afterCond: 0, beforeMet: 0, beforeCond: 0, alreadyKnown: 0, rows: [] };
for (const [D, side] of [[B_L, 'before'], [A_L, 'after'], [B_B, 'before'], [A_B, 'after']]) {
  for (const r of D.rows) {
    const g = r.cgGrant || {};
    if (!g.fired) { primary.rows.push(`${side} ${D.policy} s${r.seed}: BEAT-NOT-FIRED`); continue; }
    if ((g.pre || 0) >= 1) {
      primary.alreadyKnown++;
      primary.rows.push(`${side} ${D.policy} s${r.seed}: already-known pre=${g.pre} post=${g.post}`);
      continue;
    }
    if (side === 'after') {
      primary.afterCond++;
      const met = (g.post || 0) >= 1;
      if (met) primary.afterMet++;
      primary.rows.push(`after ${D.policy} s${r.seed}: ${met ? 'TAUGHT' : 'NOT-TAUGHT (MISS)'} pre=${g.pre} post=${g.post}`);
    } else {
      primary.beforeCond++;
      const met = (g.post || 0) === 0;
      if (met) primary.beforeMet++;
      primary.rows.push(`before ${D.policy} s${r.seed}: ${met ? 'not-taught' : 'TAUGHT (MISS — impossible on before code)'} pre=${g.pre} post=${g.post}`);
    }
  }
}
const primaryGo = primary.afterMet === primary.afterCond && primary.beforeMet === primary.beforeCond
  && primary.afterCond > 0 && primary.beforeCond > 0;

// ---- DET-GATE ----
function splitTraj(traj) {
  return (traj || []).map(row => {
    const m = String(row).match(/^(\d+):([^#]*)#(.*)$/);
    return m ? { day: parseInt(m[1], 10), beh: m[2], know: m[3] } : null;
  }).filter(Boolean);
}
function spearLevelIn(know) {
  const m = String(know).match(/(?:^|,)hunting_spear:(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}
function knowDiff(a, b) {
  // returns 'spear-only' | 'other'
  if (a === b) return 'identical';
  const pa = Object.fromEntries(String(a).split(',').filter(Boolean).map(x => x.split(':')));
  const pb = Object.fromEntries(String(b).split(',').filter(Boolean).map(x => x.split(':')));
  const keys = new Set([...Object.keys(pa), ...Object.keys(pb)]);
  let other = false;
  for (const k of keys) {
    if ((pa[k] || '0') !== (pb[k] || '0') && k !== 'hunting_spear') other = true;
  }
  return other ? 'other' : 'spear-only';
}
let detPass = 0, detFail = 0, detNotes = [];
for (const [B, A, tag] of [[B_L, A_L, 'leadfeast'], [B_B, A_B, 'belongfeast']]) {
  for (let i = 0; i < B.rows.length; i++) {
    const rb = B.rows[i], ra = A.rows[i];
    if (rb.seed !== ra.seed) { detNotes.push(`${tag} s?: row order mismatch`); detFail++; continue; }
    const tb = splitTraj(rb.traj), ta = splitTraj(ra.traj);
    let ok = true, note = '';
    if (tb.length !== ta.length) { ok = false; note = `traj length ${tb.length} vs ${ta.length}`; }
    else {
      for (let k = 0; k < tb.length && ok; k++) {
        if (tb[k].day !== ta[k].day) { ok = false; note = `day row ${k}: ${tb[k].day} vs ${ta[k].day}`; break; }
        if (tb[k].beh !== ta[k].beh) {
          ok = false; note = `behavior divergence day ${tb[k].day} row ${k}: B=${tb[k].beh} A=${ta[k].beh}`;
          break;
        }
        const kd = knowDiff(tb[k].know, ta[k].know);
        if (kd === 'other') {
          ok = false; note = `knowledge divergence beyond hunting_spear day ${tb[k].day} row ${k}`;
          break;
        }
        if (kd === 'spear-only') {
          // permitted ONLY on the after arm's side, at/after the planted grant day,
          // and only as a raise (after-arm learns, before-arm doesn't).
          const grantDay = 30;
          if (!(tb[k].day >= grantDay && spearLevelIn(ta[k].know) > spearLevelIn(tb[k].know))) {
            ok = false; note = `unexplained spear knowledge diff day ${tb[k].day} row ${k}: B=${tb[k].know} A=${ta[k].know}`;
            break;
          }
        }
      }
    }
    if (ok) detPass++; else { detFail++; detNotes.push(`${tag} s${rb.seed}: ${note}`); }
  }
}
const detGo = detFail === 0 && detPass > 0;

// ---- guardrails + wall numbers ----
function wall(D) {
  const rs = D.rows;
  return {
    n: rs.length,
    medianDays: med(rs.map(r => r.days)),
    maxDays: Math.max(0, ...rs.map(r => r.days)),
    national: rs.filter(r => r.nationalFirstDay != null).length,
    table: sum(rs.map(r => r.table || 0)),
    won: sum(rs.map(r => r.won || 0)),
    wave4: rs.filter(r => (((r.bestGW || [])[3]) || 0) > 0).length,
    starveDays: sum(rs.map(r => r.starveDays || 0)),
    deaths: {},
  };
}
for (const D of [B_L, A_L, B_B, A_B]) {
  const w = wall(D); D._wall = w;
  for (const r of D.rows) { const k = r.endReason || 'unknown'; w.deaths[k] = (w.deaths[k] || 0) + 1; }
}
const survGo = med([B_L._wall.medianDays, B_B._wall.medianDays]) != null && med([A_L._wall.medianDays, A_B._wall.medianDays]) != null
  && med([A_L._wall.medianDays, A_B._wall.medianDays]) >= med([B_L._wall.medianDays, B_B._wall.medianDays]) - 10;

console.log('=== PRIMARY (planted grant beat teaches iff fix present) ===');
for (const r of primary.rows) console.log('  ' + r);
console.log(`  after: ${primary.afterMet}/${primary.afterCond} taught | before: ${primary.beforeMet}/${primary.beforeCond} not-taught | already-known: ${primary.alreadyKnown}`);
console.log(`  PRIMARY: ${primaryGo ? 'GO' : 'NO-GO'}`);
console.log('\n=== DET-GATE (before/after behavior byte-identical per day) ===');
console.log(`  ${detPass} PASS, ${detFail} FAIL`);
for (const n of detNotes) console.log('  FAIL ' + n);
console.log(`  DET-GATE: ${detGo ? 'PASS' : 'FAIL'}`);
console.log('\n=== GUARDRAILS ===');
console.log(`  medianDays before ${B_L._wall.medianDays}/${B_B._wall.medianDays} after ${A_L._wall.medianDays}/${A_B._wall.medianDays} (>=before-10: ${survGo ? 'OK' : 'MISS'})`);
console.log(`  starveDays before ${B_L._wall.starveDays + B_B._wall.starveDays} after ${A_L._wall.starveDays + A_B._wall.starveDays}`);
console.log(`  wave4 reach before ${B_L._wall.wave4 + B_B._wall.wave4} after ${A_L._wall.wave4 + A_B._wall.wave4}`);
console.log(`  deaths before: ${JSON.stringify(Object.assign({}, B_L._wall.deaths, B_B._wall.deaths))}`);
console.log(`  deaths after:  ${JSON.stringify(Object.assign({}, A_L._wall.deaths, A_B._wall.deaths))}`);
console.log('\n=== WALL (before -> after) ===');
for (const D of [B_L, A_L, B_B, A_B]) {
  const w = D._wall;
  console.log(`  ${D.side} ${D.policy}: n=${w.n} nat=${w.national} table=${w.table} won=${w.won} w4=${w.wave4} medD=${w.medianDays} maxD=${w.maxDays}`);
}
const VERDICT = primaryGo && detGo && survGo ? 'GO' : 'NO-GO';
console.log(`\nVERDICT: ${VERDICT} (primary ${primaryGo ? 'GO' : 'NO-GO'}, det-gate ${detGo ? 'PASS' : 'FAIL'}, survival ${survGo ? 'OK' : 'MISS'})`);
process.exit(VERDICT === 'GO' ? 0 : 1);
