#!/usr/bin/env node
// analyze-tableconfirm-20261020.js — per-path attribution + PRIMARY verdict
// for the sim-tablepathdriver scoped confirm (relay/dark + witness, fresh
// seeds 81301–81312).
//
// Reads the confirm corpora (evidence/2026-10-20/perseed-tableconfirm/{armed,control}/)
// and reports wall numbers armed vs control, per-path attribution, the
// three pre-registered PRIMARY legs + guardrails, and writes
// evidence/2026-10-20/tableconfirm-analysis.json (per-run details the
// transcripts script consumes).
//
// Walk derivation mirrors the pilot's analyzer (landed, read-only):
// walks from doorEvents + finalsEvents (the drain's own record); terminal =
// tableDoneDay != null && phaseTrace includes 'done'.
// Usage: node scripts/analyze-tableconfirm-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const ARMED = path.join(REPO, 'evidence', '2026-10-20', 'perseed-tableconfirm', 'armed');
const CONTROL = path.join(REPO, 'evidence', '2026-10-20', 'perseed-tableconfirm', 'control');
const SEEDS = [81301, 81302, 81303, 81304, 81305, 81306, 81307, 81308, 81309, 81310, 81311, 81312];
const POLICIES = ['leadfeast', 'belongfeast'];

function loadRuns(dir) {
  const rows = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const fp = path.join(dir, policyId, `s${seed}.json`);
      if (!fs.existsSync(fp)) { rows.push({ policyId, seed, r: null }); continue; }
      rows.push({ policyId, seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
    }
  }
  return rows;
}
function median(a) {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function wall(rows) {
  const ok = rows.filter(x => x.r);
  const n = (f) => ok.filter(x => f(x.r)).length;
  return {
    n: ok.length, national: n(r => r.national), table: n(r => r.table),
    wins: n(r => r.won), wave4: n(r => r.wave45), wave5: n(r => r.wave5),
    sat: n(r => r.satEver), invited: n(r => r.tableDay != null),
    medianSurvival: median(ok.map(x => x.r.gameDays || 0)),
    maxSurvival: Math.max(0, ...ok.map(x => x.r.gameDays || 0)),
  };
}

function analyzeRun(x) {
  const r = x.r;
  if (!r) return { policyId: x.policyId, seed: x.seed, missing: true };
  const tpd = r.tpdSummary || {};
  const rd = r.rdSummary || {};
  const doorEvents = tpd.doorEvents || [];
  const finalsByPath = {};
  for (const f of (tpd.finalsEvents || [])) finalsByPath[f.path] = f;
  const walked = doorEvents.map(d => {
    const pid = String(d.picked || '').replace(/^path:/, '');
    const fin = finalsByPath[pid];
    return {
      path: pid, branch: fin ? fin.branch : null, day: d.day,
      fellBack: !!d.fellBack, finalId: fin ? fin.finalId : null,
      missWhy: d.missWhy || null,
    };
  });
  const terminal = r.tableDoneDay != null && (r.phaseTrace || []).indexOf('done') >= 0;
  const seatedDeaths = (((r.deathsAttributed || {}).attributed) || []).filter(d => ((d.tableAtDeath || {}).sitting | 0) > 0);
  return {
    policyId: x.policyId, seed: x.seed,
    endReason: r.endReason, won: !!r.won, national: !!r.national,
    invited: r.tableDay != null, sat: !!r.satEver, sittingDay: r.sittingDay,
    assigned: r.tpAssigned || null,
    walked, terminal,
    doorEvents,
    branchMargins: tpd.branchMargins || {},
    relayAtSit: r.relayAtSit || null,
    rdActive: !!(rd && rd.active), rdDone: !!(rd && rd.done), rdClaimed: !!((rd && rd.claimed) | 0),
    rd: { claimDay: rd.claimDay, doneDay: rd.doneDay, floorStop: !!(rd && rd.floorStop), deepens: (rd && rd.deepens) | 0, rewrites: (rd && rd.rewrites) | 0, skims: (rd && rd.skims) | 0, nullVerbs: (rd && rd.nullVerbs) | 0, noDarkAbil: (rd && rd.noDarkAbil) | 0 },
    seatedDeaths: seatedDeaths.map(d => ({ who: d.name || d.who, day: d.day, channel: d.channel, cause: d.cause, phase: (d.tableAtDeath || {}).phase, path: (d.tableAtDeath || {}).path })),
    engineErrors: ((tpd.drainError | 0) + (rd.verbError | 0) + (rd.rdError | 0) + (r.instrumentErrors | 0)),
    complete: true,
  };
}

function causeSpace(rows) {
  const space = {};
  for (const x of rows) {
    if (!x.r) continue;
    const attr = (x.r.deathsAttributed || {}).attributed || [];
    for (const d of attr) { const k = String(d.cause || 'unknown'); space[k] = (space[k] | 0) + 1; }
    const samples = ((x.r.deaths || {}) && typeof x.r.deaths === 'object') ? x.r.deaths : {};
    for (const k of Object.keys(samples)) space['sample:' + k] = (space['sample:' + k] | 0) + samples[k];
  }
  return space;
}

function main() {
  const armedRows = loadRuns(ARMED), controlRows = loadRuns(CONTROL);
  const armed = armedRows.map(analyzeRun);
  const control = controlRows.map(analyzeRun);
  const missing = armed.filter(a => a.missing).concat(control.filter(a => a.missing));
  if (missing.length) { console.log(`MISSING files: ${missing.length}`); process.exit(2); }

  const w = wall(armedRows), c = wall(controlRows);
  console.log('WALL armed  : ' + JSON.stringify(w));
  console.log('WALL control: ' + JSON.stringify(c));

  // Per-path attribution.
  const byPath = {};
  for (const a of armed) {
    for (const wk of a.walked) {
      const p = byPath[wk.path] || (byPath[wk.path] = { walked: 0, terminal: 0, branches: {}, runs: [] });
      p.walked++;
      if (a.terminal) p.terminal++;
      p.branches[wk.branch || '?'] = (p.branches[wk.branch || '?'] | 0) + 1;
      p.runs.push(`${a.policyId}-s${a.seed}${wk.fellBack ? '(fallback)' : ''}${a.terminal ? '' : ' (NON-TERMINAL)'}`);
    }
  }
  console.log('\nPER-PATH (walked -> terminal):');
  for (const [p, s] of Object.entries(byPath)) {
    console.log(`  ${p}: walked=${s.walked} terminal=${s.terminal} branches=${JSON.stringify(s.branches)} runs=[${s.runs.join(', ')}]`);
  }

  // Relay/dark detail.
  console.log('\nRELAY/DARK (relay-assigned):');
  for (const a of armed) {
    if (a.assigned !== 'relay') continue;
    const rs = a.relayAtSit || {};
    const wk = a.walked[0];
    console.log(`  ${a.policyId}-s${a.seed} sat=${a.sat} walked=${wk ? wk.path + '/' + wk.branch : '—'} terminal=${a.terminal}` +
      ` claimDay=${a.rd.claimDay} done=${a.rdDone} doneDay=${a.rd.doneDay}` +
      ` | at-sit: lean=${rs.lean} band=${rs.band} grounding=${rs.grounding} darkUses=${rs.darkUses} lightUses=${rs.lightUses} bond=${rs.bond} stage=${rs.stage}`);
  }

  // Witness detail.
  console.log('\nWITNESS (witness-assigned):');
  for (const a of armed) {
    if (a.assigned !== 'witness') continue;
    const de = (a.doorEvents || [])[0] || {};
    const wk = a.walked[0];
    console.log(`  ${a.policyId}-s${a.seed} sat=${a.sat} walked=${wk ? wk.path + '/' + wk.branch : '—'}${wk && wk.fellBack ? ' (FALLBACK)' : ''} terminal=${a.terminal}` +
      (wk && wk.fellBack ? ` missWhy="${(wk.missWhy || '').slice(0, 140)}"` : ''));
  }

  // Margins.
  console.log('\nLEDGER-DARK margins at door-walk:');
  for (const a of armed) {
    const m = a.branchMargins || {};
    const keys = Object.keys(m);
    if (!keys.length) { console.log(`  ${a.policyId}-s${a.seed}: no margins (no sitting)`); continue; }
    console.log(`  ${a.policyId}-s${a.seed}: ` + keys.map(k => `${k}:${m[k].dark}v${m[k].light}`).join(' '));
  }

  // Seated deaths + engine errors.
  const seated = [];
  for (const a of armed) for (const d of a.seatedDeaths) seated.push({ ...d, run: `${a.policyId}-s${a.seed}` });
  console.log(`\nSEATED DEATHS: ${seated.length}`);
  for (const d of seated) console.log(`  ${d.run} ${d.who} d${d.day} ${d.channel} (${d.cause}) phase=${d.phase} path=${d.path}`);
  const errs = armed.filter(a => a.engineErrors > 0);
  console.log(`\nENGINE ERRORS: ${errs.length} runs with nonzero`);
  for (const a of errs) console.log(`  ${a.policyId}-s${a.seed}: ${a.engineErrors}`);

  // ---- PRIMARY verdict ----
  const leg = {};
  // L1: relay-assigned & sat -> walked relay/dark & terminal, >= 3/4.
  const relaySat = armed.filter(a => a.assigned === 'relay' && a.sat);
  const relayDark = relaySat.filter(a => { const wk = a.walked[0]; return wk && wk.path === 'relay' && wk.branch === 'dark' && a.terminal; });
  leg.L1 = { num: relayDark.length, den: relaySat.length, go: relaySat.length > 0 && relayDark.length / relaySat.length >= 0.75 };
  // L2: witness-assigned & sat -> walked witness & terminal, >= 3/4.
  const witSat = armed.filter(a => a.assigned === 'witness' && a.sat);
  const witWalked = witSat.filter(a => { const wk = a.walked[0]; return wk && wk.path === 'witness' && a.terminal; });
  leg.L2 = { num: witWalked.length, den: witSat.length, go: witSat.length > 0 && witWalked.length / witSat.length >= 0.75 };
  // L3: margins on >= 3 sittings.
  const margSits = armed.filter(a => Object.keys(a.branchMargins || {}).length > 0).length;
  leg.L3 = { num: margSits, go: margSits >= 3 };

  // ---- Guardrails ----
  const guard = {};
  guard.errors = { n: errs.length, go: errs.length === 0 };
  const armedSpace = causeSpace(armedRows), controlSpace = causeSpace(controlRows);
  const newModes = Object.keys(armedSpace).filter(k => !(k in controlSpace));
  guard.deathModes = { new: newModes, go: newModes.length === 0 };
  const conv = w.invited > 0 ? w.sat / w.invited : 0;
  guard.conversion = { sat: w.sat, invited: w.invited, ratio: conv, go: conv >= 0.70 };
  guard.national = { armed: w.national, control: c.national, go: Math.abs(w.national - c.national) <= 2 };
  guard.table = { armed: w.table, control: c.table, go: Math.abs(w.table - c.table) <= 2 };

  console.log('\n---- PRIMARY ----');
  for (const [k, v] of Object.entries(leg)) console.log(`  ${k}: ${JSON.stringify(v)} -> ${v.go ? 'GO' : 'NO-GO'}`);
  console.log('---- GUARDRAILS ----');
  for (const [k, v] of Object.entries(guard)) console.log(`  ${k}: ${JSON.stringify(v)} -> ${v.go ? 'GO' : 'NO-GO'}`);
  const allGo = Object.values(leg).every(v => v.go) && Object.values(guard).every(v => v.go);
  console.log(`\nCONFIRM VERDICT: ${allGo ? 'GO' : 'NO-GO'}`);

  fs.writeFileSync(path.join(REPO, 'evidence', '2026-10-20', 'tableconfirm-analysis.json'),
    JSON.stringify({ wall: { armed: w, control: c }, legs: leg, guardrails: guard, verdict: allGo ? 'GO' : 'NO-GO', runs: armed }, null, 2) + '\n');
  console.log('wrote evidence/2026-10-20/tableconfirm-analysis.json');
}
main();
