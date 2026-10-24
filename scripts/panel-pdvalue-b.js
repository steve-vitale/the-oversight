#!/usr/bin/env node
// panel-pdvalue-b.js — §15 balanced-panel attempt for sim-pdvalue-b.
// The factor under test (PLENTYDEPRI) is an env-gated policy layer on
// IDENTICAL game code: PD=1 and PD=0 campaigns differ ONLY in process.env
// flags. comparePanels (scripts/lib/balance-scorecard.js) requires
// before.options.flags === after.options.flags, so any env-gated
// before/after compare returns decision:invalid with "Unmatched flags" —
// the documented #797 invalidity by construction (see also
// evidence/2026-10-24/pdtradeoff-b-panel-compare.md and
// evidence/2026-10-23/depinteraction-b-panel-compare.md).
//
// This script MECHANICALLY demonstrates that invalidity on synthetic
// panels differing only in flags (identical contractDigest/observerDigest,
// complete policy x seed coverage, passing neutrality proofs), writes the
// markdown compare to evidence/2026-10-24/pdvalue-b-panel-compare.md, and
// exits 0 with the invalid decision recorded. The verdict is judged on
// the analyzer's manual paired rows, never re-scored from this panel.
'use strict';
const fs = require('fs');
const path = require('path');
const { comparePanels, markdown, contractDigest } = require('./lib/balance-scorecard');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'evidence', '2026-10-24', 'pdvalue-b-panel-compare.md');

function panel(flags) {
  const rows = [];
  const seeds = [94001];
  const policies = ['leadfeast'];
  for (const policy of policies) for (const seed of seeds) {
    rows.push({ row: { policy, seed }, metrics: {}, gear: {}, observerErrors: [] });
  }
  return {
    schemaVersion: 1,
    observerDigest: 'synthetic-pdvalue',
    contractDigest,
    sources: {},
    options: { days: 100, policies, seeds, region: null, origin: null, occupation: null, flags, nodeVersion: process.version },
    rows,
    exclusions: [],
    validity: {
      sourcesStable: true,
      neutrality: policies.map(policy => ({ policy, seed: 94001, match: true })),
      selection: [],
    },
  };
}

const before = panel({ FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '0' });
const after = panel({ FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: '1', DEPOSITGATE: '0' });
const result = comparePanels(before, after);
console.log('panel decision: ' + result.decision);
console.log('panel errors: ' + JSON.stringify(result.errors));
const md = markdown(result) + '\n<!--\n' +
  'sim-pdvalue-b (2026-10-24, LEVER verdict, backlog #871): the automated panel compare is invalid\n' +
  'BY CONSTRUCTION for env-gated levers (#797). The factor under test (PLENTYDEPRI) is an env-gated\n' +
  'policy layer on IDENTICAL game code: the PD=1 and PD=0 campaigns differ ONLY in process.env flags.\n' +
  'comparePanels (scripts/lib/balance-scorecard.js) requires before.options.flags === after.options.flags,\n' +
  'so any env-gated before/after compare returns decision:invalid with "Unmatched flags" — mechanically\n' +
  'verified here on synthetic panels differing only in flags (PLENTYDEPRI 0 vs 1, identical\n' +
  'contractDigest/observerDigest, complete coverage, passing neutrality proofs): decision=' + result.decision + '\n' +
  'errors=' + JSON.stringify(result.errors) + '. (Any "Incomplete panel"-style extra errors are synthetic-panel\n' +
  'artifacts of the 1-seed demonstration panel, not of the real corpus; the flags error alone fires on\n' +
  'real panels, as documented in evidence/2026-10-23/depinteraction-b-panel-compare.md.)\n' +
  'Per MEASUREMENT.md §15 the panel is the instrument but an invalid panel judges nothing: the LEVER\n' +
  'verdict was computed by scripts/analyze-pdvalue-b.js on identical-seed paired PD=1/PD=0 configs\n' +
  '(the instrument is proved in scripts/test-pdvalue-b.js: P1 derivation-confined diff, P2\n' +
  'within-environment byte-identical re-runs, P6 C1 freshness, P7 verdict-logic), with the manual\n' +
  'paired row analysis attached in the analyzer report (./pdvalue-b-analyzer-report.txt, section\n' +
  '"MANUAL PAIRED ROWS (§15 fallback)"). The metric is NOT re-scored.\n' +
  '-->\n';
fs.writeFileSync(OUT, md);
console.log('wrote ' + OUT);
if (result.decision !== 'invalid' || !result.errors.includes('Unmatched flags')) {
  console.error('PANEL ATTEMPT UNEXPECTED: expected decision=invalid with "Unmatched flags"');
  process.exit(2);
}
