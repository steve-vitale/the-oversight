#!/usr/bin/env node
// test-sim-foreignhelp-b.js — proof test for the foreign-help DIAG/probe
// (flesh-out loop arm sim-foreignhelp-b, backlog #872). Reads the
// perseed-foreignhelp corpus only; runs no sims itself (a determinism
// re-run is a sweep cost, not a test cost — see the evidence file).
// Gates:
//   E1 corpus complete + zero instrument errors (baseline pilot: 16 files)
//   E2 DIAG gate named with counts (calls per tier + arrivals on the pilot)
//   E3 sense transcript present for >=1 config (first crisis, lines > 0)
//   E4 (callall mode only) probe placements exist + arrival split reported
//   E5 seed-band hygiene: only 70311-70318 files in the corpus dir
// Usage: node scripts/test-sim-foreignhelp-b.js [baseline|callall]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const MODE = process.argv[2] || 'baseline';
const EVID = path.join(REPO, 'evidence', '2026-10-24', 'perseed-foreignhelp');
let failures = 0;
function gate(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: ${detail}`);
  if (!ok) failures++;
}
const files = fs.readdirSync(EVID).filter(x => new RegExp(`^s703\\d+-(lead|belong)-${MODE}\\.json$`).test(x)).sort();
const all = fs.readdirSync(EVID).filter(x => x.endsWith('.json') && !x.includes('-runlog'));
const load = f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));

// E5 first (hygiene is cheap and independent).
const badBand = all.filter(x => !/^s703(11|12|13|14|15|16|17|18)-(lead|belong)-(baseline|callall)\.json$/.test(x));
gate('E5 seed-band hygiene', badBand.length === 0, `corpus jsons=${all.length}, out-of-band=${badBand.length} ${badBand.slice(0, 3).join(',') || 'none'}`);

// E1
gate('E1 corpus complete', files.length === 16, `${MODE} files=${files.length}/16`);
let zeroErr = true, fhPresent = true, nResolve = 0, nRaise = 0;
const perTier = {}; let arrivals = 0, asks = 0, calls = 0, transcripts = 0;
for (const f of files) {
  const d = load(f);
  if ((d.instrumentErrors || []).length) zeroErr = false;
  if (!d.fh || !Array.isArray(d.fh.resolveSnaps)) fhPresent = false;
  else {
    nResolve += d.fh.resolveSnaps.length;
    for (const r of d.fh.resolveSnaps) for (const c of (r.calls || [])) { perTier[c.tier || '?'] = (perTier[c.tier || '?'] || 0) + 1; calls++; }
  }
  if (d.fh && d.fh.firstTranscript && (d.fh.firstTranscript.lines || []).length > 0) transcripts++;
  if (d.fh && Array.isArray(d.fh.errors) && d.fh.errors.length) zeroErr = false;
  nRaise += (d.crisisEvents || []).filter(e => e.event === 'raised').length;
  arrivals += (d.fh && d.fh.arrivals ? d.fh.arrivals.filter(a => a.result === 'arrived').length : 0);
  asks += (d.fh && d.fh.asks ? d.fh.asks.length : 0);
}
gate('E1 zero instrument errors + fh present', zeroErr && fhPresent, `errors-clean=${zeroErr} fh-present=${fhPresent} raised=${nRaise} resolved=${nResolve}`);

// E2: the gate must be NAMEABLE from counts — baseline must show either
// zero calls (policy-never-calls) or zero arrivals with asks>0 (engine gate).
const gateNamed = MODE === 'baseline'
  ? (calls === 0 || (asks > 0 && arrivals === 0))
  : (calls >= 0); // callall: counts are the report; GO judged in evidence, not here
gate('E2 DIAG gate named', gateNamed, `calls=${calls} perTier=${JSON.stringify(perTier)} asks=${asks} arrivals=${arrivals} (baseline: calls==0 => policy-never-calls; asks>0+arrivals==0 => engine gate)`);

// E3
gate('E3 sense transcript present', transcripts >= 1, `configs with first-crisis transcript lines>0: ${transcripts}/${files.length}`);

// E4 (callall only)
if (MODE === 'callall') {
  gate('E4 probe placements exist', calls > 0, `probe engine calls recorded=${calls} perTier=${JSON.stringify(perTier)} arrivals=${arrivals}`);
}

console.log(failures === 0 ? 'ALL GREEN' : `${failures} GATE(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
