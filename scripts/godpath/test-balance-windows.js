#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('balance-windows');
const S = require('../lib/balance-scorecard'), W = require('../balance-windows');
const copy = x => JSON.parse(JSON.stringify(x));
function panel() {
  return { schemaVersion: 1, observerDigest: 'same', contractDigest: S.contractDigest, sources: { 'scripts/policies/maker.js': 'same' },
    options: { policies: ['maker'], seeds: [1], days: 150, flags: {}, nodeVersion: process.version },
    validity: { sourcesStable: true, neutrality: [{ policy: 'maker', match: true, warnings: 0 }] },
    rows: [{ row: { policy: 'maker', seed: 1, gameDays: 4, endReason: 'survived', won: 0 }, warnings: [], observerErrors: [], gear: { errors: [] },
      metrics: Object.fromEntries(S.contract.metrics.map(m => [m.id, 0])), samples: [2, 3, 4].map(day => ({ day, livingNpcs: 10, unknownRosterPeople: 0, kcal: 1000, health: 80, hydration: 80, knownNeeds: 10, hungryNpcs: 0 })) }] };
}
let b = panel(), a = copy(b); a.rows[0].samples.push({ ...a.rows[0].samples[0], day: 5, livingNpcs: 0 });
let r = W.summarize(b, a, [[2, 4], [5, 5]]).policies[0];
T.ok('unequal late horizons do not distort equal early windows', r.windows[0].metrics.livingNpcs.delta === 0 && r.windows[1].completePairs === 0);
T.ok('missing calendar days retain exact coverage and case identity', r.windows[1].excluded[0].missingBefore[0] === 5 && r.windows[1].excluded[0].case === 'maker:1');
b.rows[0].row.endReason = 'over-other'; b.rows[0].row.won = 1;
r = W.summarize(b, a, [[5, 5]]).policies[0].windows[0];
T.ok('early victory is a competing outcome, never a fabricated death', r.boundaryStates.before.won === 1 && !r.boundaryStates.before.community_loss && r.metrics.livingNpcs.before === null);
b.rows[0].row.endReason = 'village-lost'; b.rows[0].row.won = 0;
T.ok('actual community loss is retained at the calendar boundary', W.summarize(b, a, [[5, 5]]).policies[0].windows[0].boundaryStates.before.community_loss === 1);
b = panel(); a = copy(b); a.rows[0].samples[1].health = null;
T.ok('unknown resource data excludes a metric pair, without zero imputation', W.summarize(b, a, [[2, 4]]).policies[0].windows[0].metrics.lowHealth.unknownPairs === 1);
a = copy(b); a.rows[0].samples[1].unknownRosterPeople = 1;
T.ok('unknown residents exclude population and need fractions', W.summarize(b, a, [[2, 4]]).policies[0].windows[0].metrics.livingNpcs.pairs === 0);
function rejects(fn, pattern) { try { fn(); return false; } catch (e) { return pattern.test(e.message); } }
a = copy(b); a.rows[0].samples.push(copy(a.rows[0].samples[0]));
T.ok('duplicate dates are rejected instead of overweighted', rejects(() => W.summarize(b, a), /duplicate/));
a = copy(b); a.sources['scripts/policies/maker.js'] = 'changed';
T.ok('policy changes cannot masquerade as game-only windows', rejects(() => W.summarize(b, a), /Policy\/harness/));
a = copy(b); const original = JSON.stringify([b, a]); W.summarize(b, a);
T.ok('analysis leaves retained evidence untouched', JSON.stringify([b, a]) === original);
a.rows[0].samples[1].kcal = NaN;
T.ok('nonfinite calories remain unknown', W.summarize(b, a, [[2, 4]]).policies[0].windows[0].metrics.lowFood.pairs === 0);
a = copy(b); a.rows[0].samples = a.rows[0].samples.filter(s => s.day !== 3);
T.ok('interior holes cannot pass as complete observation', W.summarize(b, a, [[2, 4]]).policies[0].windows[0].completePairs === 0);
T.ok('a cap before a boundary is unknown, not survival through it', W.summarize(b, copy(b), [[5, 5]]).policies[0].windows[0].boundaryStates.before.unobserved_at_boundary === 1);
T.ok('invalid window bounds are rejected', rejects(() => W.summarize(b, a, [[4, 2]]), /Invalid calendar/));
T.done();
