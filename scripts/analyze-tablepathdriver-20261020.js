#!/usr/bin/env node
// analyze-tablepathdriver-20261020.js — per-path attribution + PRIMARY
// verdict for sim-tablepathdriver.
//
// Reads the armed corpus (evidence/2026-10-20/perseed-tablepathdriver/) and
// the committed control corpus
// (evidence/2026-10-19/perseed-posttable-seatdrive/) and reports:
//   - wall numbers armed vs control
//   - per-path: assigned, walked (path/branch), terminal resolution
//   - indispensable/witness: assignments + engine why-strings
//   - ledger-dark margins per sitting (tableBranch dark vs light)
//   - relay/dark: band at sitting on dark-road runs
//   - guardrails + the five PRIMARY legs (GO / NO-GO per leg)
// Usage: node scripts/analyze-tablepathdriver-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');

const ARMED = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-tablepathdriver');
// The control: re-measured on the current tip (f83c41ea6) because FIDELITY=1
// proved the committed 2026-10-19 corpus (base 8c055140a) is stale — the
// sanctity combat gating (7024fd22b) + dialogue changes landed since and
// move trajectories. Same composition, same seeds, current base.
const CONTROL = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-tablepathdriver-control');
const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const POLICIES = ['leadfeast', 'belongfeast'];

function loadRuns(dir) {
  const rows = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const fp = path.join(dir, policyId, `s${seed}.json`);
      if (!fs.existsSync(fp)) { rows.push({ policyId, seed, r: null, fp }); continue; }
      rows.push({ policyId, seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')), fp });
    }
  }
  return rows;
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
function median(a) {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

function analyzeRun(x) {
  const r = x.r;
  if (!r) return { missing: true };
  const tpd = r.tpdSummary || {};
  const rd = r.rdSummary || {};
  // Walks are derived from doorEvents + finalsEvents (the drain's own
  // record). NOTE (instrument bug, this arm): the old `walked` array used
  // a too-narrow condition (after.phase === 'challenge') which the relay
  // path's door transition does not satisfy — its walks were recorded in
  // doorEvents + finalsEvents but not in `walked`. Derived walks are the
  // source of truth; the raw `walked` is kept for the record.
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
  const walkedRaw = (tpd.walked || []).map(w => ({ path: w.path, branch: w.branch, day: w.day, fellBack: !!w.fellBack }));
  const terminal = r.tableDoneDay != null && (r.phaseTrace || []).indexOf('done') >= 0;
  const seatedDeaths = (((r.deathsAttributed || {}).attributed) || []).filter(d => {
    const t = d.tableAtDeath || {};
    return (t.sitting | 0) > 0;
  });
  return {
    seed: x.seed, policyId: x.policyId,
    endReason: r.endReason, won: !!r.won, national: !!r.national,
    invited: r.tableDay != null, sat: !!r.satEver, sittingDay: r.sittingDay,
    assigned: r.tpAssigned || null,
    walked, walkedRaw, terminal,
    doorEvents,
    branchMargins: tpd.branchMargins || {},
    relayAtSit: r.relayAtSit || null,
    rdActive: !!(rd && rd.active), rdDone: !!(rd && rd.done), rdClaimed: !!((rd && rd.claimed) | 0),
    rd: { claimDay: rd.claimDay, doneDay: rd.doneDay, floorStop: !!(rd && rd.floorStop), waitingLink: (rd && rd.waitingLink) | 0, deepens: (rd && rd.deepens) | 0, efficients: (rd && rd.efficients) | 0, rewrites: (rd && rd.rewrites) | 0, skims: (rd && rd.skims) | 0, nullVerbs: (rd && rd.nullVerbs) | 0, noDarkAbil: (rd && rd.noDarkAbil) | 0 },
    seatedDeaths: seatedDeaths.map(d => ({ who: d.name || d.who, day: d.day, channel: d.channel, cause: d.cause, phase: (d.tableAtDeath || {}).phase, path: (d.tableAtDeath || {}).path })),
    engineErrors: ((tpd.drainError | 0) + (rd.verbError | 0) + (rd.rdError | 0) + (r.instrumentErrors | 0)),
    complete: true,
  };
}

function main() {
  const armed = loadRuns(ARMED).map(analyzeRun);
  const control = loadRuns(CONTROL);
  const missing = armed.filter(a => a.missing);
  if (missing.length) { console.log(`MISSING armed files: ${missing.length}`); process.exit(2); }

  const w = wall(loadRuns(ARMED)), c = wall(control);
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
      p.runs.push(`${a.policyId}-s${a.seed}${a.terminal ? '' : ' (NON-TERMINAL)'}`);
    }
  }
  console.log('\nPER-PATH (walked -> terminal):');
  for (const [p, s] of Object.entries(byPath)) {
    console.log(`  ${p}: walked=${s.walked} terminal=${s.terminal} branches=${JSON.stringify(s.branches)} runs=[${s.runs.join(', ')}]`);
  }

  // Indispensable / witness: assignments + engine why-strings.
  console.log('\nINDISPENSABLE/WITNESS probes:');
  for (const a of armed) {
    if (a.assigned === 'indispensable' || a.assigned === 'witness') {
      const de = (a.doorEvents || [])[0] || {};
      console.log(`  ${a.policyId}-s${a.seed} assigned=${a.assigned} sat=${a.sat} picked=${de.picked || '—'} fellBack=${de.fellBack} missWhy="${(de.missWhy || '').slice(0, 140)}"`);
    }
  }

  // Ledger-dark margins per sitting.
  console.log('\nLEDGER-DARK margins at door-walk (dark vs light, engine tableBranch):');
  for (const a of armed) {
    const m = a.branchMargins || {};
    const keys = Object.keys(m);
    if (!keys.length) { console.log(`  ${a.policyId}-s${a.seed}: no margins (no sitting)`); continue; }
    const cells = keys.map(k => `${k}:${m[k].dark}v${m[k].light}`).join(' ');
    console.log(`  ${a.policyId}-s${a.seed}: ${cells}`);
  }

  // Relay/dark: the dark road on relay-assigned runs.
  console.log('\nRELAY/DARK road (relay-assigned runs):');
  for (const a of armed) {
    if (a.assigned !== 'relay') continue;
    const rs = a.relayAtSit || {};
    console.log(`  ${a.policyId}-s${a.seed} sat=${a.sat} roadActive=${a.rdActive} claimed=${a.rdClaimed} claimDay=${a.rd.claimDay} done=${a.rdDone} doneDay=${a.rd.doneDay} floorStop=${a.rd.floorStop} noDarkAbil=${a.rd.noDarkAbil} nullVerbs=${a.rd.nullVerbs}` +
      ` | at-sit: lean=${rs.lean} band=${rs.band} grounding=${rs.grounding} darkUses=${rs.darkUses} lightUses=${rs.lightUses} bond=${rs.bond} stage=${rs.stage} held=${rs.held}` +
      ` | walked=${a.walked.map(x => x.path + '/' + x.branch).join(',') || '—'} terminal=${a.terminal}`);
  }

  // Seated deaths.
  const seated = [];
  for (const a of armed) for (const d of a.seatedDeaths) seated.push({ ...d, run: `${a.policyId}-s${a.seed}` });
  console.log(`\nSEATED DEATHS: ${seated.length}`);
  for (const d of seated) console.log(`  ${d.run} ${d.who} d${d.day} ${d.channel} (${d.cause}) phase=${d.phase} path=${d.path}`);

  // Engine errors.
  const errs = armed.filter(a => a.engineErrors > 0);
  console.log(`\nENGINE ERRORS: ${errs.length} runs with nonzero (drain/verb/rd/instrument)`);
  for (const a of errs) console.log(`  ${a.policyId}-s${a.seed}: ${a.engineErrors}`);

  // ---- PRIMARY verdict (the five pre-registered legs) ----
  const leg = {};
  const relayWalks = armed.filter(a => a.walked.some(x => x.path === 'relay'));
  leg.relay = relayWalks.length >= 4
    ? (relayWalks.filter(a => a.terminal).length >= Math.ceil(relayWalks.length * 0.75) ? 'GO' : 'NO-GO')
    : (relayWalks.length > 0 ? 'NO-GO (n<4)' : 'NO-GO (0 walks)');
  const defWalks = armed.filter(a => a.walked.some(x => x.path === 'defiant'));
  leg.defiant = defWalks.length >= 4
    ? (defWalks.filter(a => a.terminal).length >= Math.ceil(defWalks.length * 0.75) ? 'GO' : 'NO-GO')
    : (defWalks.length > 0 ? 'NO-GO (n<4)' : 'NO-GO (0 walks)');
  const indProbes = armed.filter(a => a.assigned === 'indispensable' && (a.doorEvents || []).length > 0);
  const witProbes = armed.filter(a => a.assigned === 'witness' && (a.doorEvents || []).length > 0);
  leg.unreachable = (indProbes.length >= 2 && witProbes.length >= 2) ? 'GO' : 'NO-GO';
  const margins = armed.filter(a => Object.keys(a.branchMargins || {}).length > 0);
  leg.margins = margins.length >= 3 ? 'GO' : 'NO-GO';
  const darkRoad = armed.filter(a => a.assigned === 'relay' && a.rdActive && a.sat);
  const darkBand = darkRoad.filter(a => (a.relayAtSit || {}).band === 'dark');
  leg.relaydark = darkBand.length >= 1 ? `GO (${darkBand.length} dark-band sitting(s))`
    : (darkRoad.length > 0 ? 'NO-GO (road ran, band never dark)' : 'NO-GO (no relay sittings)');
  console.log('\nPRIMARY (five legs):');
  console.log(`  (1) relay terminal ≥3/4 walked: ${leg.relay} [${relayWalks.length} walks]`);
  console.log(`  (2) defiant terminal ≥3/4 walked: ${leg.defiant} [${defWalks.length} walks]`);
  console.log(`  (3) indispensable/witness ≥2 probes each w/ engine why: ${leg.unreachable} [ind=${indProbes.length} wit=${witProbes.length}]`);
  console.log(`  (4) ledger-dark margins on ≥3 sittings: ${leg.margins} [${margins.length}]`);
  console.log(`  (5) relay/dark band on ≥1 dark-road sitting: ${leg.relaydark}`);

  // ---- Guardrails ----
  const conv = w.invited ? w.sat / w.invited : 0;
  const armedChans = new Set(), controlChans = new Set();
  for (const x of loadRuns(ARMED)) {
    if (!x.r) continue;
    for (const d of (((x.r.deathsAttributed || {}).attributed) || [])) armedChans.add(d.channel);
  }
  for (const x of control) {
    if (!x.r) continue;
    for (const d of (((x.r.deathsAttributed || {}).attributed) || [])) controlChans.add(d.channel);
  }
  const newModes = [...armedChans].filter(ch => !controlChans.has(ch));
  console.log('\nGUARDRAILS:');
  console.log(`  conversion sat/invited: ${(conv * 100).toFixed(1)}% (bar ≥70%, control 83.3%) ${conv >= 0.7 ? 'PASS' : 'FAIL'}`);
  console.log(`  new death modes: [${newModes.join(',') || 'none'}] ${newModes.length === 0 ? 'PASS' : 'FAIL'}`);
  console.log(`  national ±2: armed=${w.national} control=${c.national} ${Math.abs(w.national - c.national) <= 2 ? 'PASS' : 'FAIL'}`);
  console.log(`  table ±2: armed=${w.table} control=${c.table} ${Math.abs(w.table - c.table) <= 2 ? 'PASS' : 'FAIL'}`);
  console.log(`  engine errors: ${errs.length} runs ${errs.length === 0 ? 'PASS' : 'REVIEW'}`);

  const summary = { wallArmed: w, wallControl: c, byPath, legs: leg, guardrails: { conversion: conv, newModes, national: [w.national, c.national], table: [w.table, c.table], errRuns: errs.length } };
  fs.writeFileSync(path.join(__dirname, '..', 'evidence', '2026-10-20', 'tablepathdriver-corpus-summary.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log('\nwrote evidence/2026-10-20/tablepathdriver-corpus-summary.json');
}

if (require.main === module) main();
module.exports = { analyzeRun, loadRuns, wall, SEEDS, POLICIES, ARMED, CONTROL };
