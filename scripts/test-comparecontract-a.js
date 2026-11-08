#!/usr/bin/env node
// test-comparecontract-a.js — COMPARE-CONTRACT repair proof
// (sim-comparecontract-a, oversight-flesh-out-loop, axis food-economy).
//
// Proves the repair in evidence/2026-11-08/sim-comparecontract-a-prereg.md:
// (a) a wrapper-policy pair compares VALID once both legs use the wrapper
// policy and the intervention flag is declared (the procedural rebuild);
// (b) registration-only harness churn between panel legs is tolerated and
// RECORDED, while behavior-changing harness churn still invalidates.
// No game load, no sims: pure comparePanels + normalizer unit tests.
// Usage: node scripts/test-comparecontract-a.js
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const S = require('./lib/balance-scorecard');
const { registrationNormalizedSource, registrationDigest } = require('./balance-panel');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name + (extra ? ' :: ' + extra : '')); }
}
const copy = x => JSON.parse(JSON.stringify(x));
const digest = x => crypto.createHash('sha256').update(x).digest('hex');

// Same synthetic-panel shape as scripts/godpath/test-balance-scorecard.js,
// plus the harness fields this repair reads.
function panel(policies = ['competent'], n = 8) {
  return { schemaVersion: 1, observerDigest: 'same-observer', contractDigest: S.contractDigest,
    registrationDigest: 'reg-same',
    sources: { 'scripts/sweep-compare.js': 'harness-same', 'scripts/policies/competent.js': 'same', 'src/js/game.js': 'runtime' },
    options: { policies, seeds: Array.from({ length: n }, (_, i) => i + 1), days: 150, region: null, origin: 'Columbus, Ohio', flags: {}, nodeVersion: process.version },
    validity: { sourcesStable: true, neutrality: policies.map(policy => ({ policy, seed: 1, match: true, warnings: 0 })) },
    rows: policies.flatMap(policy => Array.from({ length: n }, (_, i) => ({ row: { policy, seed: i + 1 }, warnings: [], observerErrors: [], gear: { errors: [] }, metrics: Object.fromEntries(S.contract.metrics.map(m => [m.id, 0])) }))) };
}

// ---- (a) wrapper-policy match: same wrapper policy both sides, the
// intervention flag declared (the shape the rebuilt cheaptend pair has). ----
{
  const before = panel(['cheaptend-a']), after = copy(before);
  after.options.flags.CHEAPTEND_A = '1';
  for (const r of after.rows) r.metrics.won = 1;
  const undeclared = S.comparePanels(before, after);
  ok('(a) undeclared flag difference still invalidates', undeclared.decision === 'invalid');
  const result = S.comparePanels(before, after, { interventionFlags: ['CHEAPTEND_A'] });
  ok('(a) wrapper-policy pair with declared flag compares valid', result.decision !== 'invalid', result.decision + ' ' + JSON.stringify(result.errors));
  ok('(a) declared flag is recorded on the report', result.interventionFlags && result.interventionFlags.declared.includes('CHEAPTEND_A')
    && result.interventionFlags.before.CHEAPTEND_A === null && result.interventionFlags.after.CHEAPTEND_A === '1');
  ok('(a) compare markdown names the exempted flag', S.markdown(result).includes('CHEAPTEND_A'));
}

// ---- (b) registration-only churn tolerated, and recorded. ----
{
  const before = panel(['competent']), after = copy(before);
  after.sources['scripts/sweep-compare.js'] = 'harness-different'; // raw digest moves ...
  // ... but the registration-normalized digest agrees (registration-only).
  after.sources['scripts/policies/cheaptend-a.js'] = 'new-file';
  after.sources['scripts/policies/competent-darkwit-b.js'] = 'new-file';
  after.sources['scripts/policies/competent-trialcombat-b.js'] = 'new-file';
  const result = S.comparePanels(before, after);
  ok('(b) registration-only churn compares valid', result.decision !== 'invalid', result.decision + ' ' + JSON.stringify(result.errors));
  ok('(b) all four churned files are recorded as exemptions', result.registrationExemptions && result.registrationExemptions.length === 4
    && result.registrationExemptions.some(e => e.startsWith('scripts/sweep-compare.js'))
    && ['cheaptend-a.js', 'competent-darkwit-b.js', 'competent-trialcombat-b.js'].every(f => result.registrationExemptions.some(e => e.includes(f))));
  ok('(b) compare markdown names the tolerated churn', S.markdown(result).includes('Registration-only harness churn tolerated')
    && S.markdown(result).includes('scripts/policies/cheaptend-a.js'));
}

// ---- (b) behavior-changing churn still invalid, in each shape. ----
{
  const before = panel(['competent']);
  let after = copy(before);
  after.sources['scripts/sweep-compare.js'] = 'harness-different'; after.registrationDigest = 'reg-DIFFERENT';
  let r = S.comparePanels(before, after);
  ok('(b) harness change with a moved normalized digest still invalidates', r.decision === 'invalid' && r.errors.some(e => e === 'Policy/harness changed: scripts/sweep-compare.js'), JSON.stringify(r.errors));
  after = copy(before); after.sources['scripts/policies/competent.js'] = 'different';
  r = S.comparePanels(before, after);
  ok('(b) a modified USED policy file still invalidates', r.decision === 'invalid' && r.errors.some(e => e === 'Policy/harness changed: scripts/policies/competent.js'), JSON.stringify(r.errors));
  after = copy(before); after.sources['scripts/sim-harness.js'] = 'different';
  r = S.comparePanels(before, after);
  ok('(b) a modified sim-harness.js still invalidates', r.decision === 'invalid' && r.errors.some(e => e === 'Policy/harness changed: scripts/sim-harness.js'), JSON.stringify(r.errors));
  after = copy(before); after.sources['scripts/sweep-compare.js'] = 'harness-different';
  delete after.registrationDigest; delete before.registrationDigest;
  r = S.comparePanels(before, after);
  ok('(b) old panels without a normalized digest keep the strict behavior', r.decision === 'invalid' && r.errors.some(e => e === 'Policy/harness changed: scripts/sweep-compare.js'), JSON.stringify(r.errors));
  // Exemptions stay visible even when another error invalidates the compare.
  after = copy(before); after.registrationDigest = 'reg-same';
  after.sources['scripts/policies/cheaptend-a.js'] = 'new-file'; after.sources['scripts/sim-harness.js'] = 'different';
  r = S.comparePanels(before, after);
  ok('(b) exemptions are recorded even on an invalid decision', r.decision === 'invalid' && r.registrationExemptions && r.registrationExemptions.some(e => e.includes('cheaptend-a.js')), JSON.stringify(r));
}

// ---- Normalizer on the real harness text (no git history needed). ----
{
  const root = path.join(__dirname, '..');
  const text = fs.readFileSync(path.join(root, 'scripts/sweep-compare.js'), 'utf8');
  const base = digest(registrationNormalizedSource(text, ['competent']));
  ok('normalizer: exported digest is a 64-hex sha256', /^[a-f0-9]{64}$/.test(registrationDigest(root, ['competent'])));
  ok('normalizer: exported digest matches the direct computation', registrationDigest(root, ['competent']) === base);
  // (i) Adding a registration block for an UNUSED policy changes nothing.
  const addedBlock = '\n// cheaptend-z instrument (test-only, unused policy):\n// registered so the balanced panel can build its column. Additive.\ntry { const cz = require(\'./policies/cheaptend-z\'); POLICY_REGISTRY[\'cheaptend-z\'] = cz.cheaptendZ; } catch (e) {}\n';
  ok('normalizer: an added registration for an unused policy is inert', digest(registrationNormalizedSource(text + addedBlock, ['competent'])) === base);
  ok('normalizer: the same addition is inert for a cheaptend-a panel too', digest(registrationNormalizedSource(text + addedBlock, ['cheaptend-a'])) === digest(registrationNormalizedSource(text, ['cheaptend-a'])));
  // (ii) Removing a registration for an unused policy changes nothing.
  const removed = text.replace(/try \{ const ct = require\('\.\/policies\/cheaptend-a'\); POLICY_REGISTRY\['cheaptend-a'\] = ct\.cheaptendA; \} catch \(e\) \{\}\n/, '');
  ok('normalizer: removing an unused registration is inert (doublenight linkseek shape)', removed !== text && digest(registrationNormalizedSource(removed, ['competent'])) === base, 'cheaptend try-line not found');
  // (iii) A behavior change in the driver moves the digest.
  const driven = text.replace('function stdSnapshot(Game) {', 'function stdSnapshot(Game, extra) {');
  ok('normalizer: a driver-code change moves the digest', driven !== text && digest(registrationNormalizedSource(driven, ['competent'])) !== base, 'stdSnapshot anchor not found');
  // (iv) Re-pointing a USED policy moves the digest (core registry literal is kept text).
  const repointed = text.replace("'competent': competent,", "'competent': riskAware,");
  ok('normalizer: re-pointing a used policy moves the digest', repointed !== text && digest(registrationNormalizedSource(repointed, ['competent'])) !== base, 'competent literal not found');
  // (v) A registration for the panel's OWN policy is kept, so it is not free.
  ok('normalizer: the panel keeps its own policy registration', digest(registrationNormalizedSource(text, ['cheaptend-a'])) !== base);
}

// ---- Existing compare cases still green. ----
{
  const before = panel(['competent']);
  let after = copy(before); after.options.policies = ['risk-aware'];
  ok('existing: mismatched policies still invalidate', S.comparePanels(before, after).decision === 'invalid');
  after = copy(before); after.contractDigest = 'old-contract';
  ok('existing: mismatched contract digest still invalidates', S.comparePanels(before, after).decision === 'invalid');
  after = copy(before); after.options.flags.OTHER_FLAG = 'x';
  ok('existing: undeclared flag difference still invalidates', S.comparePanels(before, after).decision === 'invalid');
  after = copy(before); after.sources['src/js/game.js'] = 'candidate-game';
  ok('existing: a matched runtime change is still the intended comparison', S.comparePanels(before, after).decision === 'no_material_signal');
  // Sweep-corpus path untouched. (Pre-existing behavior, pinned here: with
  // only the five sweep-mapped metrics carried, the unmapped contract
  // metrics are not_observed, which is a review item — so identical sweep
  // corpora compare as review_required, with the carried metrics clean.)
  const sweepRows = seeds => seeds.map(seed => ({ policy: 'competent', seed, won: 0, entered: 0, table: 0, national: 0, deaths: {} }));
  const sweepResult = S.comparePanels(sweepRows([1, 2, 3, 4, 5, 6, 7, 8]), sweepRows([1, 2, 3, 4, 5, 6, 7, 8]));
  const sweepWon = sweepResult.policies[0].metrics.find(m => m.id === 'won');
  ok('existing: sweep-corpus comparison still works', sweepResult.source === 'sweep-corpus' && ['descriptive', 'no_material_signal'].includes(sweepWon.status) && sweepResult.decision === 'review_required', JSON.stringify(sweepResult).slice(0, 200));
}

console.log(`\ntest-comparecontract-a: ${pass} passed, ${fail} failed`);
if (fail) process.exitCode = 1;
