#!/usr/bin/env node
// test-axearrival-a.js — proof for sim-axearrival-a (prereg:
// evidence/2026-10-30/sim-axearrival-a-prereg.md).
// Part A: static engine facts on this base (hatchet is the only
// fell-tier item; no hatchet recipe in recipes.json).
// Part B: classifier + bracket fixtures (pure, no game run).
// Part C: corpus checks over the committed corpora (judged,
// determinism, control, bankcheck, pilot) — run when the dirs
// exist; skipped with a note when a dir is absent (pre-legs run).
// Corpus checks assert: files present, recorder errs 0, window
// (gameDays 7..20) morning+evening snaps complete, determinism
// byte-identical, src/ + scripts/policies/ diffs empty vs pinned
// base. Exit non-zero on any failure.
// Usage: node scripts/test-axearrival-a.js [--require-corpus]
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { classifyBracket, analyzeSeed } = require('./analyze-axearrival-a');

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (extra ? (' :: ' + extra) : '')); console.log('FAIL: ' + name + (extra ? (' :: ' + extra) : '')); }
}
function eq(name, a, b) { check(name, JSON.stringify(a) === JSON.stringify(b), 'got ' + JSON.stringify(a) + ' want ' + JSON.stringify(b)); }

const ROOT = path.join(__dirname, '..');
const REQUIRE_CORPUS = process.argv.includes('--require-corpus');

// ---- Part A: static facts ----
try {
  const items = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/items.json'), 'utf8'));
  const list = Array.isArray(items) ? items : (items.items || []);
  const fell = list.filter((i) => i && i.tool && i.tool.woodcut === 'fell').map((i) => i.id);
  eq('A1 only fell-tier item is hatchet', fell, ['hatchet']);
  const hatchet = list.find((i) => i.id === 'hatchet');
  check('A2 hatchet tool.woodcut is fell', hatchet && hatchet.tool && hatchet.tool.woodcut === 'fell');
  const knife = list.find((i) => i.id === 'stone_knife');
  check('A3 stone_knife tool.woodcut is whittle', knife && knife.tool && knife.tool.woodcut === 'whittle');
} catch (e) { check('A items.json readable', false, String(e)); }
try {
  const recipesText = fs.readFileSync(path.join(ROOT, 'src/data/recipes.json'), 'utf8');
  check('A4 no hatchet string in recipes.json', !/hatchet/.test(recipesText));
} catch (e) { check('A4 recipes.json readable', false, String(e)); }

// ---- Part B: classifier fixtures ----
{
  // Loot: wrap entry flips hasHatchet + take-from line.
  const row = { fullDaySay: ['You take bow, hatchet, rope from Nina. Your hands know what they did. (+4 trauma)', 'The body is stripped.'], dayEvents: [{ method: 'lootCorpse', loopDay: 12, args: ['c_3', 'true'], before: { hasHatchet: false }, after: { hasHatchet: true } }] };
  const prev = { villagerId: 'v1' }, first = { villagerId: 'v1' };
  const c = classifyBracket(row, prev, first, [], null, null);
  eq('B1 loot classified', c.mechanism, 'loot');
  check('B1 loot evidence non-empty', c.evidence.length >= 1);
}
{
  // Succession: vessel change + death record naming outgoing vessel.
  const row = { fullDaySay: ['A new day.'], dayEvents: [] };
  const prev = { villagerId: 'owen_smith', vesselName: 'Owen' }, first = { villagerId: 'ruby_callaghan', vesselName: 'Ruby' };
  const deaths = [{ villager: 'owen_smith', cause: 'the wild', day: 17 }];
  const c = classifyBracket(row, prev, first, deaths, null, null);
  eq('B2 succession classified', c.mechanism, 'succession');
  check('B2 vesselChanged true', c.vesselChanged === true);
}
{
  // Vessel change WITHOUT death record: NOT succession (unknown).
  const row = { fullDaySay: ['A new day.'], dayEvents: [] };
  const prev = { villagerId: 'v_old' }, first = { villagerId: 'v_new' };
  const c = classifyBracket(row, prev, first, [{ villager: 'someone_else' }], null, null);
  eq('B3 vessel-change w/o death is unknown', c.mechanism, 'unknown');
}
{
  // Stash-equip: equip flip + pool shrink.
  const row = { fullDaySay: ['You shoulder the hatchet.'], dayEvents: [{ method: 'equip', loopDay: 9, args: ['3', 'weapon'], before: { hasHatchet: false }, after: { hasHatchet: true } }] };
  const c = classifyBracket(row, { villagerId: 'v1' }, { villagerId: 'v1' }, [], { stashed: ['hatchet', 'rope'] }, { stashed: ['rope'] });
  eq('B4 stash-equip classified', c.mechanism, 'stash-equip');
}
{
  // Equip flip WITHOUT pool shrink: unconfirmed -> unknown.
  const row = { fullDaySay: ['You shoulder the hatchet.'], dayEvents: [{ method: 'equip', loopDay: 9, args: ['3', 'weapon'], before: { hasHatchet: false }, after: { hasHatchet: true } }] };
  const c = classifyBracket(row, { villagerId: 'v1' }, { villagerId: 'v1' }, [], { stashed: ['rope'] }, { stashed: ['rope'] });
  eq('B5 equip w/o pool shrink is unknown', c.mechanism, 'unknown');
}
{
  // Fell-succeeds line alone is NOT a mechanism.
  const row = { fullDaySay: ['The big tree comes down with a crack that echoes. +5 wood. The ground is clear now.'], dayEvents: [] };
  const c = classifyBracket(row, { villagerId: 'v1' }, { villagerId: 'v1' }, [], null, null);
  eq('B6 fell line alone is unknown', c.mechanism, 'unknown');
}
{
  // Grant: alienLootGrant flip.
  const row = { fullDaySay: ['The System offers a hatchet.'], dayEvents: [{ method: 'alienLootGrant', loopDay: 14, args: ['obj:hatchet'], before: { hasHatchet: false }, after: { hasHatchet: true } }] };
  const c = classifyBracket(row, { villagerId: 'v1' }, { villagerId: 'v1' }, [], null, null);
  eq('B7 grant classified', c.mechanism, 'grant');
}
{
  // analyzeSeed: intraday bracket + window completeness on a fixture.
  const inst = {
    seed: 99999, endReason: 'survived', daysAlive: 30,
    recorder: { errs: 0, errors: [], wrapInstalled: { lootCorpse: true } },
    axeEvents: [],
    spawnSnap: { gameDay: 0, villagerId: 'v1', hasHatchet: false, tier: 'whittle', canFell: false, pool: { stashed: [] } },
    deaths: [],
    mornings: [
      { loopDay: 10, gameDay: 10, axe: { gameDay: 10, villagerId: 'v1', hasHatchet: false, tier: 'whittle', canFell: false, inv: ['stone_knife'], eq: [], pool: { stashed: [] } } },
      { loopDay: 11, gameDay: 11, axe: { gameDay: 11, villagerId: 'v1', hasHatchet: false, tier: 'whittle', canFell: false, inv: ['stone_knife'], eq: [], pool: { stashed: [] } } },
    ],
    evenings: [
      { loopDay: 10, gameDay: 10, eveningAxe: { gameDay: 10, villagerId: 'v1', hasHatchet: false, tier: 'whittle', canFell: false, inv: ['stone_knife'], eq: [] }, woodcarry: { bucket: 'creek', rescued: false }, fullDaySay: [], dayEvents: [] },
      { loopDay: 11, gameDay: 11, eveningAxe: { gameDay: 11, villagerId: 'v1', hasHatchet: true, tier: 'fell', canFell: true, inv: ['stone_knife', 'hatchet'], eq: [] }, woodcarry: { bucket: 'creek', rescued: false }, fullDaySay: ['You take bow, hatchet from Nina.'], dayEvents: [{ method: 'lootCorpse', loopDay: 11, args: ['c_1'], before: { hasHatchet: false }, after: { hasHatchet: true } }] },
    ],
  };
  const a = analyzeSeed(inst);
  check('B8 fixture firstAxe found', !!a.firstAxe);
  eq('B8 fixture bracket intraday', a.firstAxe.bracket, 'intraday loopDay 11');
  eq('B8 fixture mechanism loot', a.firstAxe.mechanism, 'loot');
  check('B8 fixture window complete', a.windowComplete === true);
  eq('B8 fixture strand nights', a.strandNights, [10, 11]);
}
{
  // Stash-fetch: fetch line + pool shrink, no equip wrap entry.
  const row = { fullDaySay: ['You remember the Hatchet at your space in the haven and fetch it — it rides in your pack now.'], dayEvents: [] };
  const c = classifyBracket(row, { villagerId: 'v1' }, { villagerId: 'v1' }, [], { stashed: ['snare_wire', 'hatchet', 'bark_armor'] }, { stashed: ['snare_wire'] });
  eq('B9 stash-fetch classified', c.mechanism, 'stash-fetch');
}
{
  // LoopDay-1 arrival: spawn snap IS the loopDay-1 morning state, so
  // spawn->evening loopDay 1 is intraday and its lines classify.
  const inst = {
    seed: 99998, endReason: 'survived', daysAlive: 30,
    recorder: { errs: 0, errors: [], wrapInstalled: {} }, axeEvents: [],
    spawnSnap: { gameDay: 1, villagerId: 'v1', hasHatchet: false, tier: 'none', canFell: false, pool: { stashed: ['snare_wire', 'hatchet', 'bark_armor'] } },
    deaths: [], mornings: [
      { loopDay: 2, gameDay: 2, axe: { gameDay: 2, villagerId: 'v1', hasHatchet: true, tier: 'fell', canFell: true, inv: ['hatchet'], eq: [], pool: { stashed: ['snare_wire'] } } },
    ],
    evenings: [
      { loopDay: 1, gameDay: 2, eveningAxe: { gameDay: 2, villagerId: 'v1', hasHatchet: true, tier: 'fell', canFell: true, inv: ['hatchet'], eq: [] }, woodcarry: null, fullDaySay: ['You remember the Hatchet at your space in the haven and fetch it — it rides in your pack now.'], dayEvents: [] },
    ],
  };
  const a = analyzeSeed(inst);
  check('B10 loopDay-1 firstAxe found', !!a.firstAxe);
  eq('B10 loopDay-1 bracket intraday', a.firstAxe.bracket, 'intraday loopDay 1');
  eq('B10 loopDay-1 mechanism stash-fetch', a.firstAxe.mechanism, 'stash-fetch');
}

// ---- Part C: corpus checks ----
const CORPORA = {
  pilot: 'evidence/2026-10-30/sim-axearrival-a-corpus-pilot',
  judged: 'evidence/2026-10-30/sim-axearrival-a-corpus-variant-on',
  control: 'evidence/2026-10-30/sim-axearrival-a-corpus-control-on',
  determinism: 'evidence/2026-10-30/sim-axearrival-a-corpus-determinism',
  bankcheck: 'evidence/2026-10-30/sim-axearrival-a-corpus-bankcheck',
};
function corpusFiles(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return null;
  return fs.readdirSync(full).filter((f) => f.endsWith('.json')).sort().map((f) => path.join(full, f));
}
for (const [name, dir] of Object.entries(CORPORA)) {
  const files = corpusFiles(dir);
  if (!files) {
    if (REQUIRE_CORPUS) check('C ' + name + ' corpus present', false, dir + ' missing');
    else console.log('SKIP: corpus ' + name + ' absent (pre-legs)');
    continue;
  }
  check('C ' + name + ' has files', files.length >= 1);
  for (const f of files) {
    let inst;
    try { inst = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { check('C ' + name + ' parses ' + path.basename(f), false, String(e)); continue; }
    check('C ' + name + ' recorder errs 0 seed ' + inst.seed, (inst.recorder || {}).errs === 0, JSON.stringify((inst.recorder || {}).errors));
    const a = analyzeSeed(inst);
    if (name === 'judged' || name === 'pilot') {
      check('C ' + name + ' window complete seed ' + inst.seed, a.windowComplete === true, 'windowEvenings=' + a.windowEvenings);
    }
    check('C ' + name + ' strandfix store sane seed ' + inst.seed, Array.isArray((inst.strandfixStore || {}).attempts));
  }
}
// Determinism: byte-identical judged vs re-run for 15215.
{
  const j = corpusFiles(CORPORA.judged), d = corpusFiles(CORPORA.determinism);
  if (j && d) {
    const jf = j.find((f) => f.includes('-s15215.json'));
    const df = d.find((f) => f.includes('-s15215.json'));
    if (jf && df) {
      const jb = fs.readFileSync(jf, 'utf8'), db = fs.readFileSync(df, 'utf8');
      check('C determinism byte-identical 15215', jb === db, 'lengths ' + jb.length + ' vs ' + db.length);
      if (jb === db) {
        const a = analyzeSeed(JSON.parse(jb));
        check('C determinism same first-axe day+mechanism', !!a.firstAxe && a.firstAxe.mechanism !== 'unknown', a.firstAxe ? (a.firstAxe.gameDay + '/' + a.firstAxe.mechanism) : 'no first axe');
      }
    } else check('C determinism files present for 15215', false);
  } else if (REQUIRE_CORPUS) check('C determinism corpora present', false);
  else console.log('SKIP: determinism comparison (corpora absent)');
}
// Tracked-diff guard: src/ and scripts/policies/ empty vs pinned base.
try {
  const base = 'ae15fd8f1';
  const diff = execSync('git diff ' + base + ' -- src/ scripts/policies/', { cwd: ROOT, encoding: 'utf8' });
  check('C src/ + scripts/policies/ diff empty vs pinned base', diff.trim() === '', diff.slice(0, 300));
} catch (e) { check('C diff guard ran', false, String(e)); }

console.log('test-axearrival-a: ' + pass + ' passed, ' + fail + ' failed');
if (failures.length) { for (const f of failures) console.log('  FAILED: ' + f); }
process.exit(fail ? 1 : 0);
