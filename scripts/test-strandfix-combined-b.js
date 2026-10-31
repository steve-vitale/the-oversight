// test-strandfix-combined-b.js — proof for sim-strandfix-combined-b.
// Pure unit tests always run. Corpus checks run when PROOF_LEGS
// (JSON: {legName: corpusDir}) is set; determinism when
// PROOF_DET is set to {dir, legDir, seed}. Usage:
//   node scripts/test-strandfix-combined-b.js
//   PROOF_LEGS='{"offGuard":"...","offOn":"..."}' \
//   PROOF_DET='{"dir":"...","legDir":"...","seed":15215}' \
//   node scripts/test-strandfix-combined-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const P = require('./policies/strandfix-combined-diag');
const A = require('./analyze-strandfix-combined-b');

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(name, a, b) { check(name, JSON.stringify(a) === JSON.stringify(b), { got: a, want: b }); }

// ---------- Pure: decision gates ----------
check('decision game-over', P.strandfixDecision({ gameOver: true, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'creek', insideHaven: false }).skip === 'game-over');
check('decision combat', P.strandfixDecision({ gameOver: false, combatLive: true, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'creek', insideHaven: false }).skip === 'combat');
check('decision prev-not-stranded (rescued)', P.strandfixDecision({ gameOver: false, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: true, wakeTileType: 'creek', insideHaven: false }).skip === 'prev-not-stranded');
check('decision prev-not-stranded (null prev)', P.strandfixDecision({ gameOver: false, combatLive: false, prevOutcome: null, prevBucket: null, prevRescued: null, wakeTileType: 'creek', insideHaven: false }).skip === 'prev-not-stranded');
check('decision haven', P.strandfixDecision({ gameOver: false, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'haven', insideHaven: false }).skip === 'haven-morning');
check('decision fire', P.strandfixDecision({ gameOver: false, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'creek', insideHaven: false }).fire === true);

// ---------- Pure: tick budget (RESERVE 136) ----------
eq('budget east full 115 on 256 allows', P.budgetDecision(256, 115), { allow: true, ticksLeftAfter: 141 });
check('budget west full 123 on 256 denies', P.budgetDecision(256, 123).allow === false);
check('budget press 17 on 128 denies', P.budgetDecision(128, 17).allow === false);
check('budget fell 96 on 256 allows (after 160)', P.budgetDecision(256, 96).allow === true);
check('budget null denies', P.budgetDecision(null, 17).allow === false);
check('budget exact reserve boundary allows', P.budgetDecision(256, 120).allow === true);
check('budget one over boundary denies', P.budgetDecision(256, 121).allow === false);

// ---------- Pure: sensed-view planning ----------
// Fixture: wake (0,0); row0 dirt,grass,plant,plant,bigtree; row1 water,grass,grass,dirt,bigtree.
function fixtureView(cells) {
  const v = new Map();
  for (const [x, y, type, extra] of cells) v.set(x + ',' + y, { type, ...(extra || {}) });
  return v;
}
const creekLike = fixtureView([
  [0, 0, 'dirt'], [1, 0, 'grass'], [2, 0, 'plant'], [3, 0, 'plant'], [4, 0, 'bigtree'],
  [0, 1, 'water'], [1, 1, 'grass'], [2, 1, 'grass'], [3, 1, 'dirt'], [4, 1, 'bigtree'],
]);
eq('bfs west to bigtree standing cell', P.bfsPath(creekLike, [0, 0], (x, y, c) => {
  const t = c && c.type;
  if (!P.isWalkableCell(t)) return false;
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const cc = creekLike.get((x + dx) + ',' + (y + dy));
    if (cc && cc.type === 'bigtree') return true;
  }
  return false;
}), [[1, 0], [2, 0], [3, 0]]);
check('bfs unsensed bigtree invisible', P.bfsPath(fixtureView([[0, 0, 'dirt'], [1, 0, 'grass'], [0, 1, 'water'], [1, 1, 'grass']]), [0, 0], (x, y, c) => {
  const t = c && c.type;
  if (!P.isWalkableCell(t)) return false;
  return false;
}) === null);
eq('fell target prefers bigtree', P.findFellTarget(fixtureView([[3, 0, 'bigtree'], [2, 1, 'tree'], [4, 1, 'tree']]), [3, 1]), { tx: 3, ty: 0, kind: 'bigtree' });
check('fell target none when no tree adjacent', P.findFellTarget(fixtureView([[0, 0, 'dirt'], [1, 0, 'grass']]), [0, 0]) === null);
eq('brush target', P.findBrushTarget(fixtureView([[1, 0, 'bush']]), [0, 0]), { tx: 1, ty: 0, kind: 'bush' });
const foodView = fixtureView([
  [7, 0, 'plant', { assigned: true, known: true, forageable: true, species: 'muscadine' }],
  [8, 0, 'plant', { assigned: true, known: false, forageable: true, species: 'chickweed' }],
  [7, 1, 'dirt'], [8, 1, 'plant', { assigned: true, known: false, forageable: true, species: 'mayapple' }],
]);
eq('known food counts only known+assigned', P.findKnownFood(foodView), { count: 1, species: ['muscadine'] });
check('walkable: water blocked, grass open', P.isWalkableCell('water') === false && P.isWalkableCell('grass') === true && P.isWalkableCell('bigtree') === false);

// ---------- Pure: evening classification ----------
function evWith(wood, kcal, ticks, kcalLive) {
  return { woodcarry: { classification: { woodPlayer: wood, kcal, kcalLive: kcalLive === undefined ? kcal : kcalLive, ticksToDayEnd: ticks } } };
}
eq('class pass', A.classifyEvening(evWith(4, 240, 238)).cls, 'pass');
eq('class wood-only', A.classifyEvening(evWith(3, 240, 238)).cls, 'wood-only');
eq('class kcal-only', A.classifyEvening(evWith(4, 0, 239)).cls, 'kcal-only');
eq('class ticks-only', A.classifyEvening(evWith(4, 2254, 47)).cls, 'ticks-only');
eq('class both', A.classifyEvening(evWith(3, 0, 111)).cls, 'both');
eq('class wood+ticks', A.classifyEvening(evWith(0, 1246, 93)).cls, 'wood+ticks');
eq('class wood+kcal+ticks', A.classifyEvening(evWith(2, 0, 95)).cls, 'wood+kcal+ticks');
eq('class unclassified on nulls', A.classifyEvening(evWith(null, null, null)).cls, 'unclassified');
const fb = A.classifyEvening({ woodcarry: { classification: { woodPlayer: 4, kcal: null, kcalLive: 240, ticksToDayEnd: 238 } } });
check('class kcalLive fallback', fb.cls === 'pass' && fb.kcalFallback === true);

// ---------- Pure: strand extraction ----------
const strandEvs = [7, 8, 9, 11, 12].map((d) => ({ loopDay: d, woodcarry: { bucket: 'creek', outcome: 'travel-refused', rescued: false } }));
eq('strand runs break on gaps', A.extractStrands(strandEvs), [[7, 8, 9], [11, 12]]);

// ---------- Pure: warmfuel counterfactual fixture (kcalshort ON table) ----------
const warmRows = [
  { loopDay: 7, cls: 'ticks-only', wood: 4, kcal: 2254, ticks: 47, warmthLogSpent: 0 },
  { loopDay: 8, cls: 'kcal-only', wood: 4, kcal: 0, ticks: 239, warmthLogSpent: 0 },
  { loopDay: 9, cls: 'kcal-only', wood: 4, kcal: 0, ticks: 109, warmthLogSpent: 1 },
  { loopDay: 10, cls: 'wood-only', wood: 3, kcal: 240, ticks: 238, warmthLogSpent: 0 },
  { loopDay: 11, cls: 'both', wood: 3, kcal: 0, ticks: 111, warmthLogSpent: 1 },
  { loopDay: 12, cls: 'both', wood: 2, kcal: 0, ticks: 239, warmthLogSpent: 1 },
  { loopDay: 13, cls: 'both', wood: 1, kcal: 0, ticks: 111, warmthLogSpent: 1 },
  { loopDay: 14, cls: 'wood-only', wood: 0, kcal: 240, ticks: 238, warmthLogSpent: 0 },
  { loopDay: 15, cls: 'both', wood: 0, kcal: 0, ticks: 111, warmthLogSpent: 0 },
  { loopDay: 16, cls: 'both', wood: 0, kcal: 0, ticks: 111, warmthLogSpent: 0 },
];
const cf = A.protectedCounterfactual(warmRows);
eq('counterfactual rescued', cf.rescued, [10, 14]);
eq('counterfactual first rescue', cf.firstRescue, 10);
eq('counterfactual shortening', cf.shortening, 7);
check('counterfactual both never rescued at cfLogs 4', cf.rows.filter((r) => r.cls === 'both').every((r) => r.independentlyRescued === false));

// ---------- Pure: paired conversion fixture ----------
const fakeControl = { 15215: { evenings: [
  { loopDay: 10, woodcarry: { bucket: 'creek', outcome: 'travel-refused', rescued: false, classification: { woodPlayer: 3, kcal: 240, ticksToDayEnd: 238 } } },
  { loopDay: 11, woodcarry: { bucket: 'creek', outcome: 'travel-refused', rescued: false, classification: { woodPlayer: 3, kcal: 0, ticksToDayEnd: 111 } } },
  { loopDay: 12, woodcarry: { bucket: 'creek', outcome: 'travel-refused', rescued: false, classification: { woodPlayer: 2, kcal: 0, ticksToDayEnd: 239 } } },
] } };
const fakeVariant = { 15215: { evenings: [
  { loopDay: 10, woodcarry: { bucket: 'creek', outcome: 'travel-refused', rescued: false, classification: { woodPlayer: 3, kcal: 240, ticksToDayEnd: 238 } } },
  { loopDay: 11, woodcarry: { bucket: 'creek', outcome: 'completed', rescued: true, classification: { woodPlayer: 4, kcal: 240, ticksToDayEnd: 200 } } },
] } };
const paired = A.pairedConversion(fakeControl, fakeVariant, 15215);
eq('paired both-converted', paired.find((p) => p.loopDay === 11).verdict, 'both-converted');
eq('paired still', paired.find((p) => p.loopDay === 10).verdict, 'still');
eq('paired prevented', paired.find((p) => p.loopDay === 12).verdict, 'prevented-early-rescue');

// ---------- Corpus checks (only with PROOF_LEGS) ----------
let corpusChecks = 0;
if (process.env.PROOF_LEGS) {
  const legs = JSON.parse(process.env.PROOF_LEGS);
  const corpora = {};
  for (const [name, dir] of Object.entries(legs)) {
    corpora[name] = A.loadCorpus(dir);
    const files = Object.keys(corpora[name]).length;
    check('corpus ' + name + ' has 10 seeds', files === 10, { files });
    corpusChecks++;
    for (const [seed, inst] of Object.entries(corpora[name])) {
      check('corpus ' + name + ' seed ' + seed + ' 30 evenings', (inst.evenings || []).length === 30);
      check('corpus ' + name + ' seed ' + seed + ' 30 days alive', inst.daysAlive === 30);
      check('corpus ' + name + ' seed ' + seed + ' strandfix errs 0', ((inst.strandfixStore || {}).errs || 0) === 0);
      corpusChecks += 3;
    }
  }
  if (corpora.offGuard && corpora.freshGuard) {
    const a = A.census(corpora.offGuard), b = A.census(corpora.freshGuard);
    eq('OFF guard == fresh guard totals', a.totals, b.totals);
    eq('OFF guard == fresh guard per-seed', a.perSeed, b.perSeed);
    corpusChecks += 2;
  }
  if (corpora.offOn && corpora.freshOn) {
    const a = A.census(corpora.offOn), b = A.census(corpora.freshOn);
    eq('OFF ON == fresh ON totals', a.totals, b.totals);
    eq('OFF ON == fresh ON per-seed', a.perSeed, b.perSeed);
    corpusChecks += 2;
  }
  if (process.env.PROOF_DET) {
    const det = JSON.parse(process.env.PROOF_DET);
    const detCorpus = A.loadCorpus(det.dir);
    const legCorpus = A.loadCorpus(det.legDir);
    const detFile = fs.readFileSync(path.join(det.dir, fs.readdirSync(det.dir).find((f) => f.includes('-s' + det.seed + '.json'))), 'utf8');
    const legFile = fs.readFileSync(path.join(det.legDir, fs.readdirSync(det.legDir).find((f) => f.includes('-s' + det.seed + '.json'))), 'utf8');
    check('determinism byte-identical seed ' + det.seed, detFile === legFile);
    corpusChecks++;
  }
  // Tracked-diff guard: src/ clean; scripts/policies/ only the new file.
  try {
    const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
    const modified = execSync('git diff --name-only', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    const badModified = modified.filter((f) => f.startsWith('src/') || f.startsWith('scripts/'));
    check('tracked diff guard: no modified src/scripts files', badModified.length === 0, { badModified });
    const status = execSync('git status --porcelain -- src scripts/policies', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    const badStatus = status.filter((l) => !l.endsWith('scripts/policies/strandfix-combined-diag.js'));
    check('status guard: src + policies only new strandfix file', badStatus.length === 0, { badStatus });
    corpusChecks += 2;
  } catch (e) {
    check('tracked diff guard ran', false, { error: String(e.message).slice(0, 200) });
  }
}

console.log('strandfix proof: ' + pass + ' pass, ' + fail + ' fail' + (corpusChecks ? (' (corpus checks ' + corpusChecks + ')') : ' (pure only; corpus checks skipped, PROOF_LEGS unset)'));
if (fail) { for (const f of failures) console.log('FAIL: ' + f); process.exit(1); }
