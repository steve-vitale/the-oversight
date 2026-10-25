// test-n2beast-b.js — proof for sim-n2beast-b (loop B, axis food-economy).
//
// Audits The Big Beast + the N=2 flagging rule against the deathext 96-seed
// corpus WITHOUT new sims. Every leg recomputes from the corpora and the
// code; nothing here asserts prose. Run: node scripts/test-n2beast-b.js
// (from the repo root). Exit non-zero if any leg fails.
//
// Legs:
//   L1 pooled baseline totals + n=2 stratum == ["The Big Beast"] only.
//   L2 recompute from per-seed corpora: 323 villager deaths; exactly two
//      Big Beast rows with the exact seed/day/who from the evidence file.
//   L3 roster non-match: "The Big Beast" matches no monsters.json id, name,
//      unknown, or curated villageName (case-insensitive).
//   L4 curated villageNames: exactly 3 roster entries have them; "The Glow
//      Stag" is gallowdeer's; "The Big Beast" is in none.
//   L5 generated-pool match: "The Big Beast" is in the steady-pool output
//      for the default traits (replicated from game.js generateMonsterName);
//      "Big Big" and "Big Loud" are too (same shape, n=1).
//   L6 code paths (static greps): expedDeath cause=mName is the only
//      monster-display-name death cause; encDescribeMonster delegates to
//      monsterDisplayName; monsterDisplayName returns villageName first;
//      generateMonsterName holds the 'The ${cap} Beast' steady template.
//   L7 N recomputation by the implemented rule: churnMax=1, N=2.
//   L8 same-shape contrast: Big Big / Big Loud are 1x on 1 seed each and
//      generated; The Glow Stag is 1x and roster.
//   L9 Big Beast rows well-formed, distinct seeds and villager ids.
//   L10 "The Big Beast" string literal appears in no src/js file.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
let pass = 0, fail = 0;
function leg(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name} — ${detail}`); }
  else { fail++; console.log(`FAIL ${name} — ${detail}`); }
}
function read(p) { return fs.readFileSync(path.join(REPO, p), 'utf8'); }
function readJson(p) { return JSON.parse(read(p)); }

// ---- corpora ----
const POOLED = readJson('evidence/2026-10-25/sim-deathext-b-baseline.json');
const CORPUS_DIRS = ['evidence/2026-10-25/perseed-deathrow-b', 'evidence/2026-10-25/perseed-deathext-b'];
const perSeed = [];
for (const dir of CORPUS_DIRS) {
  for (const f of fs.readdirSync(path.join(REPO, dir)).filter(x => x.endsWith('.json') && x !== 'summary.json')) {
    const j = readJson(path.join(dir, f));
    perSeed.push({ dir, file: f, seed: j.seed, deathRows: j.deathRows || [] });
  }
}
const villRows = [];
for (const s of perSeed) for (const r of s.deathRows) {
  if ((r.kind === 'villager' || r.kind === 'person') && !r.isPlayer) villRows.push({ seed: s.seed, file: s.file, row: r });
}
const causes = {}, labelSeeds = {};
for (const v of villRows) {
  causes[v.row.cause] = (causes[v.row.cause] || 0) + 1;
  (labelSeeds[v.row.cause] = labelSeeds[v.row.cause] || new Set()).add(v.seed);
}

// L1
const n2 = Object.keys(causes).filter(l => causes[l] === 2).sort();
leg('L1 pooled totals + n=2 stratum', POOLED.villagerDeaths === 323 && POOLED.pooledTable.length === 31 && n2.length === 1 && n2[0] === 'The Big Beast',
  `villagerDeaths=${POOLED.villagerDeaths} labels=${POOLED.pooledTable.length} n=2 labels=${JSON.stringify(n2)}`);

// L2
const bb = villRows.filter(v => v.row.cause === 'The Big Beast');
const bbKey = bb.map(v => `${v.seed}/day${v.row.day}/${v.row.who}`).sort().join(' | ');
leg('L2 exactly two Big Beast rows, exact seeds/days/who', villRows.length === 323 && bb.length === 2 &&
  bbKey === '73747/day77/gen_ooqx0fl | 73796/day106/gen_8mfjxe0',
  `villagerRows=${villRows.length} bigBeastRows=${bb.length} rows=[${bbKey}]`);

// L3 + L4: roster
const roster = readJson('src/data/monsters.json');
const rosterNames = new Set();
for (const m of roster) {
  for (const f of [m.id, m.name, m.unknown]) if (f) rosterNames.add(String(f).toLowerCase());
  for (const vn of (m.villageNames || [])) rosterNames.add(String(vn).toLowerCase());
}
leg('L3 roster non-match for The Big Beast', !rosterNames.has('the big beast'),
  `rosterEntries=${roster.length} rosterNameStrings=${rosterNames.size}`);
const curated = roster.filter(m => (m.villageNames || []).length);
const gallow = roster.find(m => m.id === 'gallowdeer');
leg('L4 curated villageNames: 3 entries; Glow Stag is gallowdeer\'s',
  curated.map(m => m.id).sort().join(',') === 'gallowdeer,nevermore,nightcourt' &&
  (gallow.villageNames || []).includes('The Glow Stag') &&
  !curated.some(m => (m.villageNames || []).includes('The Big Beast')),
  `curatedIds=${curated.map(m => m.id).sort().join(',')}`);

// L5: generated pool, replicated from game.js generateMonsterName logic.
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const gen = new Set();
for (const t of ['big', 'loud', 'ugly']) {
  gen.add(`The ${cap(t)} Bastard`); gen.add(`Old ${cap(t)}`); gen.add(`${cap(t)}-Bane`);
  gen.add(`The ${cap(t)} Thing`); gen.add(`Don't-Look`); gen.add(`The ${cap(t)} Stare`);
  gen.add(`${cap(t)}-Eyes`); gen.add(`The ${cap(t)} Beast`); gen.add(`Big ${cap(t)}`);
}
leg('L5 generated-pool match (steady, trait big) + same-shape labels',
  gen.has('The Big Beast') && gen.has('Big Big') && gen.has('Big Loud') && gen.size === 25,
  `generatedPoolSize=${gen.size} bigBeastInPool=${gen.has('The Big Beast')}`);
leg('L5b no roster entry defines nameTraits (default traits apply to all)',
  roster.every(m => !m.nameTraits),
  `entriesWithNameTraits=${roster.filter(m => m.nameTraits).length}`);

// L6: code paths
const agency = read('src/js/villager-agency.js');
const encounters = read('src/js/encounters.js');
const game = read('src/js/game.js');
const expedDeath = agency.includes('expedDeath(vid, mName, nm') && agency.includes('cause: mName');
const otherNameCause = (agency.match(/cause: mName/g) || []).length;
leg('L6a expedDeath is the monster-display-name death cause',
  expedDeath && otherNameCause === 1, `cause:mName occurrences in villager-agency.js=${otherNameCause}`);
leg('L6b encDescribeMonster delegates to monsterDisplayName',
  encounters.includes('encDescribeMonster = function') && encounters.includes('this.monsterDisplayName(mdef.id)'),
  'encounters.js:136-141');
const mdFn = game.slice(game.indexOf('monsterDisplayName(mid) {'));
const mdBody = mdFn.slice(0, mdFn.indexOf('monsterNoun(mid)'));
leg('L6c monsterDisplayName returns villageName before true name',
  mdBody.includes('e.villageName') && mdBody.indexOf('e.villageName') < mdBody.indexOf('systemArrived'),
  'villageName check precedes systemArrived in monsterDisplayName');
leg('L6d generateMonsterName steady pool holds The ${cap} Beast template',
  game.includes('generateMonsterName(mid, vid)') && game.includes('The ${cap(t)} Beast'),
  'steady pool template present in game.js');

// L7: N recomputation (implemented rule)
let churnMax = 0;
for (const label of Object.keys(causes)) {
  const churn = causes[label] <= 2 && (labelSeeds[label].size === 1 || rosterNames.has(label.toLowerCase()));
  if (churn && causes[label] > churnMax) churnMax = causes[label];
}
leg('L7 N recomputation churnMax=1 N=2', churnMax === 1 && churnMax + 1 === 2,
  `churnMax=${churnMax} N=${churnMax + 1} labels=${Object.keys(causes).length}`);

// L8: same-shape contrast
leg('L8 Big Big / Big Loud 1x 1 seed generated; Glow Stag 1x roster',
  causes['Big Big'] === 1 && labelSeeds['Big Big'].size === 1 && gen.has('Big Big') &&
  causes['Big Loud'] === 1 && labelSeeds['Big Loud'].size === 1 && gen.has('Big Loud') &&
  causes['The Glow Stag'] === 1 && rosterNames.has('the glow stag'),
  `BigBig=${causes['Big Big']} BigLoud=${causes['Big Loud']} GlowStag=${causes['The Glow Stag']}`);

// L9: row well-formedness
leg('L9 Big Beast rows well-formed, distinct seeds/ids',
  bb.every(v => v.row.day && v.row.kind === 'villager' && v.row.who && v.row.cause && v.row.player === false) &&
  new Set(bb.map(v => v.seed)).size === 2 && new Set(bb.map(v => v.row.who)).size === 2,
  `rows=${bb.length} kinds=${[...new Set(bb.map(v => v.row.kind))]} playerFlags=${[...new Set(bb.map(v => v.row.player))]}`);

// L10: no literal in src/js
function walkJs(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkJs(p, out);
    else if (e.name.endsWith('.js')) out.push(p);
  }
}
const jsFiles = [];
walkJs(path.join(REPO, 'src/js'), jsFiles);
const hits = jsFiles.filter(f => fs.readFileSync(f, 'utf8').includes('The Big Beast'));
leg('L10 no "The Big Beast" literal in src/js', hits.length === 0,
  `jsFilesScanned=${jsFiles.length} hits=${hits.length}`);

console.log(`\ntest-n2beast-b: ${pass} PASS, ${fail} FAIL`);
if (fail) process.exit(1);
