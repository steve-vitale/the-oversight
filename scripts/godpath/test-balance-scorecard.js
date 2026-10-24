#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('balance-scorecard'), S = require('../lib/balance-scorecard');
const copy = x => JSON.parse(JSON.stringify(x));
function panel(policies = ['maker'], n = 8) {
  return { schemaVersion: 1, observerDigest: 'same-observer', contractDigest: S.contractDigest, sources: { 'scripts/policies/maker.js': 'same', 'src/js/game.js': 'runtime' },
    options: { policies, seeds: Array.from({ length: n }, (_, i) => i + 1), days: 150, region: null, origin: 'Columbus, Ohio', flags: {}, nodeVersion: process.version },
    validity: { sourcesStable: true, neutrality: policies.map(policy => ({ policy, seed: 1, match: true, warnings: 0 })) },
    rows: policies.flatMap(policy => Array.from({ length: n }, (_, i) => ({ row: { policy, seed: i + 1 }, warnings: [], observerErrors: [], gear: { errors: [] }, metrics: Object.fromEntries(S.contract.metrics.map(m => [m.id, 0])) }))) };
}
let before = panel(), after = copy(before);
for (const r of after.rows) { r.metrics.won = 1; r.metrics.lowFood = 0.5; }
let result = S.comparePanels(before, after);
T.ok('increased wins cannot cancel a food-security regression', result.decision === 'review_required' && result.policies[0].metrics.find(m => m.id === 'lowFood').status === 'regression_signal');
before = panel(['capable', 'maker']); after = copy(before);
for (const r of before.rows) r.metrics.won = r.row.policy === 'maker' ? 1 : 0;
for (const r of after.rows) r.metrics.won = r.row.policy === 'maker' ? 0 : 1;
result = S.comparePanels(before, after);
T.ok('an equal aggregate does not hide either playstyles win-rate change', result.policies.find(p => p.policy === 'maker').decision === 'review_required');
const spec = S.contract.metrics.find(m => m.id === 'survival60');
let metric = S.compareMetric(Array(8).fill(null), Array(8).fill(null), spec, 'censored');
T.ok('unobserved survival remains unknown rather than zero', metric.status === 'not_observed' && metric.before === null && metric.pairs === 0);
metric = S.compareMetric([null, ...Array(8).fill(1)], Array(9).fill(1), spec, 'coverage');
T.ok('changed censoring/exposure coverage is a review item', metric.status === 'coverage_changed' && metric.eligibleBefore === 8 && metric.eligibleAfter === 9);
metric = S.compareMetric(Array(7).fill(1), Array(7).fill(0), spec, 'tiny');
T.ok('tiny samples are not declared a validated regression', metric.status === 'insufficient');
const mixed = [1, -1, 2, -2, 3, -3, 4, -4];
T.ok('paired bootstrap intervals are repeatable without global RNG', JSON.stringify(S.interval(mixed, 'fixed')) === JSON.stringify(S.interval(mixed, 'fixed')));
T.ok('tails and paired better/worse counts remain visible', (metric = S.compareMetric(Array(8).fill(0), mixed, spec, 'tails')).pairedP10 < 0 && metric.pairedP90 > 0 && metric.better === 4 && metric.worse === 4);
before = panel(); after = copy(before); after.sources['scripts/policies/maker.js'] = 'different';
T.ok('a policy change invalidates a game-only comparison', S.comparePanels(before, after).decision === 'invalid');
after = copy(before); after.options.flags.CAPABLE_GREEDY = '1';
T.ok('different policy flags invalidate pairing', S.comparePanels(before, after).decision === 'invalid');
after = copy(before); after.options.flags.CAPABLE_GREEDY = '1';
const exempt = S.comparePanels(before, after, { interventionFlags: ['CAPABLE_GREEDY'] });
T.ok('a declared intervention flag is exempted from the flags match and recorded', exempt.decision !== 'invalid' && exempt.interventionFlags && exempt.interventionFlags.declared.includes('CAPABLE_GREEDY') && exempt.interventionFlags.before.CAPABLE_GREEDY === null && exempt.interventionFlags.after.CAPABLE_GREEDY === '1');
T.ok('the compare markdown names the exempted flag', S.markdown(exempt).includes('CAPABLE_GREEDY'));
after = copy(before); after.options.flags.CAPABLE_GREEDY = '1'; after.options.flags.OTHER_FLAG = 'x';
T.ok('a declared exemption does not excuse an undeclared flag difference', S.comparePanels(before, after, { interventionFlags: ['CAPABLE_GREEDY'] }).decision === 'invalid');
after = copy(before); after.options.flags.CAPABLE_GREEDY = '1';
T.ok('declaring an absent flag does not excuse a real flag difference', S.comparePanels(before, after, { interventionFlags: ['SOME_OTHER_FLAG'] }).decision === 'invalid');
T.ok('a malformed intervention declaration invalidates instead of silently passing', S.comparePanels(before, after, { interventionFlags: 'CAPABLE_GREEDY' }).decision === 'invalid');
after = copy(before); after.rows.push(copy(after.rows[0]));
T.ok('duplicate or incomplete cases are rejected', S.comparePanels(before, after).decision === 'invalid');
after = copy(before); after.rows[0].row.seed = 999;
T.ok('the declared seed set is enforced even when row count is right', S.comparePanels(before, after).decision === 'invalid');
after = copy(before); after.validity.neutrality = [];
T.ok('a comparison needs a passing neutrality proof for every policy', S.comparePanels(before, after).decision === 'invalid');
after = copy(before); after.rows[0].observerErrors.push('sample failed');
T.ok('swallowed observer failures cannot produce a valid scorecard', S.comparePanels(before, after).decision === 'invalid');
after = copy(before); after.contractDigest = 'old-contract';
T.ok('threshold changes cannot silently reinterpret an old metric contract', S.comparePanels(before, after).decision === 'invalid');
after = copy(before); after.sources['src/js/game.js'] = 'candidate-game';
T.ok('a properly matched runtime change is the intended comparison', S.comparePanels(before, after).decision === 'no_material_signal');
after.rows[0].metrics.goodGear = null;
T.ok('missing gear observations trigger review instead of a success claim', S.comparePanels(before, after).decision === 'review_required');
const { mergePanels } = require('../lib/balance-merge');
const left = panel(), right = copy(left);
left.sourceDigest = right.sourceDigest = 'same-content'; left.reused = right.reused = 0;
right.options.seeds = right.options.seeds.map(n => n + 8); right.rows.forEach(r => { r.row.seed += 8; }); right.validity.neutrality[0].seed += 8;
T.ok('disjoint shards preserve every paired case', mergePanels([left, right]).rows.length === 16 && mergePanels([left, right]).options.seeds.length === 16);
let rejected = false; try { mergePanels([left, left]); } catch (e) { rejected = /Overlapping/.test(e.message); }
T.ok('overlapping shards are rejected rather than double-counted', rejected);
right.sourceDigest = 'other-runtime'; rejected = false; try { mergePanels([left, right]); } catch (e) { rejected = /sourceDigest/.test(e.message); }
T.ok('shards with different game contents cannot be pooled', rejected);
const featurePanel = panel();
for (const r of featurePanel.rows) { r.gear = { observedMethods: ['craft', 'absent', 'unused'], calls: { craft: 1 }, effects: { craft: 0 }, missing: ['absent'], recipeAccess: { tool: { knownSamples: 1, materialsReadySamples: 1 } }, crafts: { failed: { attempts: 1, successes: 0 } }, grants: [] }; r.classes = r.gods = { player: [], npc: [] }; r.endings = []; }
const summary = require('../balance-features').summarize(featurePanel)[0];
T.ok('feature summaries separate unavailable methods from reached calls', summary.features.find(f => f.name === 'absent').status === 'unavailable' && summary.features.find(f => f.name === 'craft').status === 'reached');
T.ok('zero-call methods stay in the denominator instead of disappearing', summary.completeMethodCoverage && summary.features.find(f => f.name === 'unused').status === 'not_reached');
T.ok('ready unused recipes and failed attempts are different dead-spot leads', summary.recipes.find(r => r.id === 'tool').status === 'ready_unused' && summary.recipes.find(r => r.id === 'failed').status === 'attempted_no_success');
metric = S.compareMetric(Array(8).fill(0), Array(8).fill(1), S.contract.metrics.find(m => m.id === 'corpseGear'), 'neutral');
T.ok('descriptive movement is not mislabeled better or worse', metric.increased === 8 && metric.better === null && metric.worse === null);
const win = S.contract.metrics.find(m => m.id === 'won');
for (const [b, a] of [[1, 0], [0, 1]]) {
  metric = S.compareMetric(Array(8).fill(b), Array(8).fill(a), win, 'challenge');
  T.ok('win movement ' + b + ' to ' + a + ' prompts investigation without a better/worse verdict', metric.status === 'change_signal' && metric.better === null && metric.worse === null);
}
metric = S.compareMetric([1,0,0,0,0,0,0,0], [0,1,1,0,0,0,0,0], win, 'challenge-watch');
T.ok('uncertain material win movement remains an investigation watch', metric.status === 'change_watch');
metric = S.compareMetric(Array(8).fill(1), Array(8).fill(1), win, 'unchanged');
T.ok('unchanged wins make no difficulty claim', metric.status === 'descriptive');
let exposure = require('../balance-features').summarize(featurePanel)[0].npcExposure;
T.ok('legacy NPC exposure remains unknown rather than fabricated zero', exposure.measuredRuns === 0 && exposure.eligiblePersonDays === null && exposure.holderDays === null);
const exposurePanel = panel();
for (const r of exposurePanel.rows) {
  r.gear = copy(featurePanel.rows[0].gear); r.classes = r.gods = { player: [], npc: ['hunter/stalker'] }; r.endings = [];
  r.npcExposure = { schemaVersion: 1, sampledIdentities: ['a'], unknownIdentities: [], days: [{ day: 85, eligible: ['a'], unknown: [], duplicateRosterEntries: 1,
    classes: [{ who: 'a', build: 'hunter/stalker' }, { who: 'a', build: 'hunter/stalker' }], gods: [], excludedBuildRecords: { classes: { currentBearer: 1 }, gods: {} } }] };
}
exposure = require('../balance-features').summarize(exposurePanel)[0].npcExposure;
T.ok('NPC holder-day census deduplicates each person/day/build and retains exclusions', exposure.holderDays.classes['hunter/stalker'].holderDays === 8 && exposure.holderDays.classes['hunter/stalker'].runs === 8 && exposure.excludedBuildRecordSamples.classes.currentBearer === 8);
T.ok('class access fraction has an explicit eligibility and unknown-coverage contract', S.contract.metrics.find(m => m.id === 'npcClassAccess').unit.includes('unknown roster makes value null'));
T.done();
