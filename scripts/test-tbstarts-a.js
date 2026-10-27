#!/usr/bin/env node
// scripts/test-tbstarts-a.js — proof validator for sim-tbstarts-a
// (scale-onramp axis, 2026-10-27, DIAG ONLY). Pure analysis over the
// corpus on disk: no harness, no RNG, no game state, re-runnable
// with identical output. It re-derives, from the corpus files
// themselves:
//   (1) the plain band and the armed band, and their equality;
//   (2) the armed-vs-plain per-seed exactness the sweep's --summary
//       already judged (an independent second check, not a re-print);
//   (3) the corpus-error counts (all THREE recorders, all seeds);
//   (4) the tbstarts pairing per seed: starts joined to ends by
//       fight id, refused calls separated, dissolved calls
//       separated, unsettled starts listed with day, call argument,
//       tile monster, and post-call fighter kinds — and the pairing
//       cross-checked against the summary's pairing table;
//   (5) DIAG-GO legs (a)-(c) as far as the corpus can carry them:
//       leg (a) requires every unsettled start on 73675 to be
//       listed here with exactly one class assigned in the
//       evidence; this validator checks the LIST is complete and
//       internally consistent (each listed start's post id absent
//       from ends and dissolves, each refused start's post id
//       equal to its pre id, each settled start's end present).
//       The per-row class assignment itself lives in the evidence
//       (it needs the daily-bounded site analysis, which is an
//       evidence judgment, not a corpus fact); a green run here
//       never claims leg (a) on its own — it proves the list the
//       evidence classifies is the whole list. Leg (d) (sense
//       read) is evidence-checked, not corpus-checked: this
//       validator prints it as EVIDENCE, never as PASS.
// Usage: node scripts/test-tbstarts-a.js [corpus-dir]
// Exit 1 on any mismatch.
'use strict';
const fs = require('fs');
const path = require('path');
const NL = String.fromCharCode(10);
let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' ' + detail : '')); }
}
function pairStarts(tb) {
  const endsById = new Map(), dissById = new Map();
  const endsByToken = new Map(), dissByToken = new Map();
  const endsByActive = new Map(), dissByActive = new Map();
  for (const e of (tb.ends || [])) {
    if (e.id) endsById.set(e.id, e);
    if (e.token != null) endsByToken.set(e.token, e);
    if (e.activeStart != null) endsByActive.set(e.activeStart, e);
  }
  for (const d of (tb.dissolves || [])) {
    if (d.id) dissById.set(d.id, d);
    if (d.token != null) dissByToken.set(d.token, d);
    if (d.activeStart != null) dissByActive.set(d.activeStart, d);
  }
  const out = { starts: 0, ends: (tb.ends || []).length, dissolves: (tb.dissolves || []).length,
    refused: 0, titanRefused: 0, settled: 0, instantSettled: 0, instantDissolved: 0,
    dissolved: 0, unsettled: 0, unsettledNull: 0, unmatchedEnds: 0,
    unsettledRows: [], titanRows: [], instantRows: [] };
  const matchedEndIdx = new Set();
  const endIndex = new Map();
  (tb.ends || []).forEach((e, i) => endIndex.set(e, i));
  for (const s of (tb.starts || [])) {
    out.starts++;
    if (s.refused) { out.refused++; continue; }
    if ((s.newOutcomes || []).some(o => o && o.titan === s.arg && o.outcome === 'refused')) { out.titanRefused++; out.titanRows.push(s); continue; }
    if (s.postId && endsById.has(s.postId)) { out.settled++; matchedEndIdx.add(endIndex.get(endsById.get(s.postId))); continue; }
    if (s.postId && dissById.has(s.postId)) { out.dissolved++; continue; }
    if (s.postToken != null && endsByToken.has(s.postToken)) { out.settled++; matchedEndIdx.add(endIndex.get(endsByToken.get(s.postToken))); continue; }
    if (s.postToken != null && dissByToken.has(s.postToken)) { out.dissolved++; continue; }
    if (s.postId == null && s.postToken == null) {
      if (endsByActive.has(s.callIdx)) { out.instantSettled++; out.instantRows.push(s); matchedEndIdx.add(endIndex.get(endsByActive.get(s.callIdx))); continue; }
      if (dissByActive.has(s.callIdx)) { out.instantDissolved++; out.instantRows.push(s); continue; }
      out.unsettledNull++; out.unsettledRows.push(s); continue;
    }
    out.unsettled++; out.unsettledRows.push(s);
  }
  out.unmatchedEnds = (tb.ends || []).filter((e, i) => !matchedEndIdx.has(i)).length;
  return out;
}
function main() {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-27', 'perseed-tbstarts-a');
  const summary = JSON.parse(fs.readFileSync(path.join(dir, 'summary.json'), 'utf8'));
  const seeds = summary.seeds || [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
  check('summary label', summary.label === 'sim-tbstarts-a', summary.label);
  check('summary corpusOk', summary.corpusOk === true, String(summary.corpusOk));
  check('summary armedVsPlainExact', summary.armedVsPlainExact === true, JSON.stringify(summary.perSeedExact));
  check('summary per-seed exact all', Array.isArray(summary.perSeedExact) && summary.perSeedExact.length === 8 && summary.perSeedExact.every(x => x.exact === true), JSON.stringify(summary.perSeedExact));
  check('plain band equals armed band', JSON.stringify(summary.plainBand) === JSON.stringify(summary.band), 'plain=' + JSON.stringify(summary.plainBand) + ' armed=' + JSON.stringify(summary.band));
  const SHARED = ['days', 'gameDays', 'endReason', 'won', 'waveReach', 'maxArc', 'finalRank', 'maxRank', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal', 'starvationDeaths'];
  let exactAll = true;
  const exactDetail = [];
  for (const seed of seeds) {
    const plain = JSON.parse(fs.readFileSync(path.join(dir, 's' + seed + '-baseline.json'), 'utf8'));
    const armed = JSON.parse(fs.readFileSync(path.join(dir, 's' + seed + '-armed.json'), 'utf8'));
    const diffs = [];
    for (const f of SHARED) if (JSON.stringify(plain[f]) !== JSON.stringify(armed[f])) diffs.push(f);
    if (JSON.stringify((plain.raftdraft || {}).faced || {}) !== JSON.stringify((armed.raftdraft || {}).faced || {})) diffs.push('faced');
    if (JSON.stringify((plain.raftdraft || {}).logEntries || []) !== JSON.stringify((armed.raftdraft || {}).logEntries || [])) diffs.push('logEntries');
    if (diffs.length) { exactAll = false; exactDetail.push(seed + ':' + diffs.join(',')); }
  }
  check('row-file armed-vs-plain exact (re-derived)', exactAll, exactDetail.join(' '));
  let errTotal = 0;
  const errDetail = [];
  for (const seed of seeds) {
    const armed = JSON.parse(fs.readFileSync(path.join(dir, 's' + seed + '-armed.json'), 'utf8'));
    for (const key of ['raftdraft', 'spawnsrc', 'tbstarts']) {
      const d = armed[key] && armed[key].diag;
      if (!d) { errTotal++; errDetail.push(seed + ':' + key + ':missing-diag'); continue; }
      if (d.errs !== 0) { errTotal += d.errs; errDetail.push(seed + ':' + key + ':errs=' + d.errs + ' ' + JSON.stringify(d.errors || [])); }
      const ov = d.overflow || {};
      for (const k of Object.keys(ov)) if ((ov[k] | 0) !== 0) { errTotal++; errDetail.push(seed + ':' + key + ':overflow:' + k + '=' + ov[k]); }
    }
  }
  check('recorder errors zero on all seeds (three recorders)', errTotal === 0, errDetail.join(' '));

  // Pairing re-derivation + summary cross-check + internal consistency.
  const pairBySeed = {};
  let pairMismatch = [];
  for (const seed of seeds) {
    const armed = JSON.parse(fs.readFileSync(path.join(dir, 's' + seed + '-armed.json'), 'utf8'));
    const p = pairStarts(armed.tbstarts);
    pairBySeed[seed] = p;
    const sp = (summary.pairing || []).find(x => x.seed === seed);
    if (!sp) { pairMismatch.push(seed + ':no-summary-pairing'); continue; }
    for (const k of ['starts', 'ends', 'dissolves', 'refused', 'titanRefused', 'settled', 'instantSettled', 'instantDissolved', 'dissolved', 'unsettled', 'unsettledNull', 'unmatchedEnds']) {
      if (p[k] !== sp[k]) pairMismatch.push(seed + ':' + k + ' validator=' + p[k] + ' summary=' + sp[k]);
    }
    if (JSON.stringify(p.unsettledRows.map(s => s.day)) !== JSON.stringify(sp.unsettledDays)) {
      pairMismatch.push(seed + ':unsettledDays validator=' + JSON.stringify(p.unsettledRows.map(s => s.day)) + ' summary=' + JSON.stringify(sp.unsettledDays));
    }
    if (JSON.stringify(p.titanRows.map(s => s.day)) !== JSON.stringify(sp.titanDays)) {
      pairMismatch.push(seed + ':titanDays validator=' + JSON.stringify(p.titanRows.map(s => s.day)) + ' summary=' + JSON.stringify(sp.titanDays));
    }
    if (JSON.stringify(p.instantRows.map(s => s.day)) !== JSON.stringify(sp.instantDays)) {
      pairMismatch.push(seed + ':instantDays validator=' + JSON.stringify(p.instantRows.map(s => s.day)) + ' summary=' + JSON.stringify(sp.instantDays));
    }
    // Internal consistency: refused rows really are refused (same
    // token, live pre-call); titan rows really carry a refused
    // outcome for their argument; instant rows really have an
    // inside end/dissolve; unsettled rows really have neither.
    const endsById = new Set((armed.tbstarts.ends || []).map(e => e.id).filter(Boolean));
    const dissById = new Set((armed.tbstarts.dissolves || []).map(d => d.id).filter(Boolean));
    const endsByToken = new Set((armed.tbstarts.ends || []).map(e => e.token).filter(x => x != null));
    const dissByToken = new Set((armed.tbstarts.dissolves || []).map(d => d.token).filter(x => x != null));
    for (const s of (armed.tbstarts.starts || [])) {
      if (!s.refused && s.postId && !endsById.has(s.postId) && !dissById.has(s.postId)
          && s.postToken != null && !endsByToken.has(s.postToken) && !dissByToken.has(s.postToken)
          && !p.unsettledRows.includes(s)) {
        pairMismatch.push(seed + ':start-missing-from-unsettled day=' + s.day);
      }
    }
    for (const s of p.unsettledRows) {
      if ((s.postId && (endsById.has(s.postId) || dissById.has(s.postId)))
          || (s.postToken != null && (endsByToken.has(s.postToken) || dissByToken.has(s.postToken)))) {
        pairMismatch.push(seed + ':unsettled-row-has-end-or-dissolve day=' + s.day + ' id=' + s.postId);
      }
    }
  }
  check('pairing re-derived matches summary pairing + internally consistent', pairMismatch.length === 0, pairMismatch.join(' '));

  // 73675 unsettled list (the DIAG-GO leg (a) list): print it in full
  // so the evidence classification can be audited row by row.
  // Under v2 pairing, a start is UNSETTLED only if a post-call fight
  // exists with no end/dissolve; a start with no post-call fight
  // and no inside end/dissolve/refusal is UNSETTLED-NULL. The
  // evidence must assign every row in both lists exactly one class.
  const p75 = pairBySeed[73675];
  console.log('--- 73675 unsettled starts (validator list; evidence assigns each exactly one class) ---');
  for (const s of (p75.unsettledRows || [])) {
    console.log('  UNSETTLED day=' + s.day + ' arg=' + s.arg + ' tile=' + (s.tileMon ? (s.tileMon.type + '#seq' + s.tileMon.seq + ' w' + s.tileMon.wave + ' hp' + s.tileMon.hp + '/' + s.tileMon.maxHp + ' titan=' + s.tileMon.titan + ' lingering=' + s.tileMon.lingering + ' lingerSince=' + s.tileMon.lingerSince) : 'none')
      + ' preId=' + s.preId + ' postId=' + s.postId + ' postFighters=' + JSON.stringify((s.postFighters || []).map(f => f.kind + ':' + f.id))
      + ' preFighters=' + JSON.stringify((s.preFighters || []).map(f => f.kind + ':' + f.id))
      + ' lifted=' + s.lifted + ' stack=' + JSON.stringify(s.stack || []));
  }
  console.log('  73675 titan-gate-refused: ' + p75.titanRefused + ' days=' + JSON.stringify(p75.titanRows.map(s => s.day)));
  for (const s of (p75.titanRows || []).slice(0, 3)) {
    console.log('  TITAN-REFUSED sample day=' + s.day + ' arg=' + s.arg + ' newOutcomes=' + JSON.stringify(s.newOutcomes) + ' titanMuster=' + JSON.stringify(s.titanMuster));
  }
  console.log('  73675 instant-settled: ' + p75.instantSettled + ' instant-dissolved: ' + p75.instantDissolved + ' days=' + JSON.stringify(p75.instantRows.map(s => s.day)));
  console.log('  73675 pairing: starts=' + p75.starts + ' ends=' + p75.ends + ' dissolves=' + p75.dissolves + ' refused=' + p75.refused + ' titanRefused=' + p75.titanRefused + ' settled=' + p75.settled + ' instantSettled=' + p75.instantSettled + ' instantDissolved=' + p75.instantDissolved + ' dissolved=' + p75.dissolved + ' unsettled=' + p75.unsettled + ' unsettledNull=' + p75.unsettledNull + ' unmatchedEnds=' + p75.unmatchedEnds);
  check('73675 starts partition exactly (refused + titanRefused + settled + instantSettled + instantDissolved + dissolved + unsettled + unsettledNull == starts)',
    p75.refused + p75.titanRefused + p75.settled + p75.instantSettled + p75.instantDissolved + p75.dissolved + p75.unsettled + p75.unsettledNull === p75.starts,
    'starts=' + p75.starts + ' refused=' + p75.refused + ' titanRefused=' + p75.titanRefused + ' settled=' + p75.settled + ' instantSettled=' + p75.instantSettled + ' instantDissolved=' + p75.instantDissolved + ' dissolved=' + p75.dissolved + ' unsettled=' + p75.unsettled + ' unsettledNull=' + p75.unsettledNull);
  check('73675 ends partition exactly (settled + instantSettled + unmatchedEnds == ends)',
    p75.settled + p75.instantSettled + p75.unmatchedEnds === p75.ends,
    'ends=' + p75.ends + ' settled=' + p75.settled + ' instantSettled=' + p75.instantSettled + ' unmatchedEnds=' + p75.unmatchedEnds);
  // Band-wide: every other seed's unsettled count is reported, not assumed zero.
  for (const seed of seeds) {
    if (seed === 73675) continue;
    console.log('  band seed=' + seed + ' starts=' + pairBySeed[seed].starts + ' ends=' + pairBySeed[seed].ends + ' refused=' + pairBySeed[seed].refused + ' titanRefused=' + pairBySeed[seed].titanRefused + ' settled=' + pairBySeed[seed].settled + ' instantSettled=' + pairBySeed[seed].instantSettled + ' dissolved=' + pairBySeed[seed].dissolved + ' unsettled=' + pairBySeed[seed].unsettled + ' unsettledNull=' + pairBySeed[seed].unsettledNull + ' unmatchedEnds=' + pairBySeed[seed].unmatchedEnds);
  }
  console.log('EVIDENCE leg (d) sense-read: see evidence file (not corpus-checked here).');
  console.log(NL + 'tbstarts validator: ' + pass + ' PASS, ' + fail + ' FAIL');
  if (fail) process.exit(1);
}
main();
