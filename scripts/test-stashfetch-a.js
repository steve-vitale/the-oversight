#!/usr/bin/env node
// test-stashfetch-a.js — proof for sim-stashfetch-a (backlog #1597).
// Parts A (static), B (analyzer fixtures via the real analyzer CLI),
// D (live gate probe on a fresh 15337 load) always run.
// Part C (corpus checks) runs only with --require-corpus, after legs.
// Usage: node scripts/test-stashfetch-a.js [--require-corpus]
// Exit non-zero on any failed check. No repo writes: analyzer
// fixture corpora live under os.tmpdir() and are removed after.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-31');
const REQUIRE_CORPUS = process.argv.includes('--require-corpus');
let pass = 0, fail = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (extra ? ' :: ' + extra : '')); console.log('FAIL: ' + name + (extra ? ' :: ' + extra : '')); }
}
function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function runAnalyzer(corpusDir) {
  const out = execFileSync(process.execPath, [path.join(__dirname, 'analyze-stashfetch-a.js'), corpusDir], { encoding: 'utf8', cwd: ROOT });
  return JSON.parse(out);
}

// ---------- Part A: static engine facts on this base ----------
const items = readJson(path.join(ROOT, 'src', 'data', 'items.json'));
const itemList = Array.isArray(items) ? items : (items.items || []);
const defOf = (id) => itemList.find((d) => d.id === id) || null;
const hatchet = defOf('hatchet');
check('A1 hatchet def exists, weapon class', !!(hatchet && hatchet.class === 'weapon' && hatchet.weapon));
check('A2 hatchet bonus 15', hatchet && hatchet.weapon && hatchet.weapon.bonus === 15, JSON.stringify(hatchet && hatchet.weapon));
check('A3 hatchet woodcut fell', hatchet && hatchet.tool && hatchet.tool.woodcut === 'fell', JSON.stringify(hatchet && hatchet.tool));
check('A4 hatchet is the only fell-tier item', itemList.filter((d) => d.tool && d.tool.woodcut === 'fell').map((d) => d.id).join(',') === 'hatchet');
const bark = defOf('bark_armor');
check('A5 bark_armor def exists, armor', !!(bark && bark.armor), JSON.stringify(bark && bark.armor));
const vb = fs.readFileSync(path.join(ROOT, 'src', 'js', 'villager-build.js'), 'utf8');
check('A6 vesselStashFetch defined', vb.includes('vesselStashFetch()'));
check('A7 weapon-fetch day flag gate', vb.includes('_stashFetchDay') && vb.includes('one fetch per day'));
check('A8 weapon-fetch haven gate', vb.includes('playerAtHaven') && vb.includes('would be a teleport'));
check('A9 weapon-fetch dead/person gates', vb.includes('person.dead') && vb.includes('person.stashed'));
check('A10 weapon-fetch weapon-class + bonus-beats gate', vb.includes("def.class !== 'weapon'") && vb.includes('b > curB'));
check('A11 weapon-fetch no-duplicate gate', vb.includes('already carried/worn: no duplicate'));
check('A12 armor-fetch day flag + gain gate', vb.includes('_armorFetchDay') && vb.includes('gain > 0'));
check('A13 fetch call sites in villagerBuildDay', vb.includes('this.vesselStashFetch()') && vb.includes('this.vesselArmorFetch()'));
const gameJs = fs.readFileSync(path.join(ROOT, 'src', 'js', 'game.js'), 'utf8');
check('A14 villagerBuildDay called from endDay', gameJs.includes('this.villagerBuildDay()'));
check('A15 no policy flag read in fetch routines', (() => {
  const i = vb.indexOf('vesselStashFetch() {');
  const j = vb.indexOf('vesselArmorFetch() {');
  const seg = vb.slice(i, j) + vb.slice(j, j + 6000);
  return !/process\.env|STRANDFIX|WOODWARM|WOODCARRY/.test(seg);
})());

// ---------- Part B: analyzer fixtures (real analyzer CLI) ----------
function synthInst(overrides) {
  const base = {
    seed: 1, cell: 'test', policy: 'nighttravel', woodcarry: '1', woodwarm: '1', strandfix: '1',
    recorder: { errs: 0 },
    spawnSnap: { villagerId: 'v1', inv: ['search_locket'], eq: [], pool: { fullPool: ['search_locket', 'hatchet'], stashed: ['hatchet'] } },
    fetchEvents: [{ loopDay: 1, method: 'vesselStashFetch', result: { item: 'hatchet', slot: 'melee' }, before: {} }],
    teleEvents: [{ loopDay: 1, event: 'vessel_stash_fetch', data: { item: 'hatchet', via: 'own_stash', slot: 'melee' } }],
    evenings: [
      { loopDay: 1, eveningAxe: { inv: ['search_locket', 'hatchet'], eq: [] }, fetchLines: ['You remember the Hatchet at your space in the haven and fetch it — it rides in your pack now.'], morningAxe: null },
      { loopDay: 2, morningAxe: { pool: { stashed: [] } }, eveningAxe: { inv: ['search_locket'], eq: ['hatchet'] } },
    ],
    daysAlive: 5, endReason: 'days',
  };
  return Object.assign(base, overrides);
}
function fixtureCensus(insts) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stashfetch-fixture-'));
  try {
    for (const inst of insts) fs.writeFileSync(path.join(dir, `stashfetch-a-s${inst.seed}.json`), JSON.stringify(inst));
    return runAnalyzer(dir);
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  }
}
{
  const c = fixtureCensus([synthInst({})]);
  check('B1 all-five-channels -> FETCH', c.seeds['1'].weaponFetch.indicator === 'FETCH', c.seeds['1'].weaponFetch.indicator);
  check('B2 FETCH item is hatchet', c.seeds['1'].weaponFetch.item === 'hatchet');
  const noFetch = synthInst({ seed: 2, spawnSnap: { villagerId: 'v1', inv: ['search_locket'], eq: [], pool: { fullPool: ['search_locket', 'snare_wire'], stashed: ['snare_wire'] } }, fetchEvents: [{ loopDay: 1, method: 'vesselStashFetch', result: null, before: {} }], teleEvents: [], evenings: [
    { loopDay: 1, eveningAxe: { inv: ['search_locket'], eq: [] }, fetchLines: [], morningAxe: null },
    { loopDay: 2, morningAxe: { pool: { stashed: ['snare_wire'] } }, eveningAxe: { inv: ['search_locket'], eq: [] } },
  ] });
  const c2 = fixtureCensus([noFetch]);
  check('B3 no-channel -> NOFETCH', c2.seeds['2'].weaponFetch.indicator === 'NOFETCH', c2.seeds['2'].weaponFetch.indicator);
  const disagree = synthInst({ seed: 3, teleEvents: [] });
  const c3 = fixtureCensus([disagree]);
  check('B4 missing tele channel -> INVALID', c3.seeds['3'].weaponFetch.indicator === 'INVALID', c3.seeds['3'].weaponFetch.indicator);
  const incomplete = synthInst({ seed: 4, evenings: [
    { loopDay: 1, eveningAxe: { inv: ['search_locket', 'hatchet'], eq: [] }, fetchLines: ['You remember the Hatchet at your space in the haven and fetch it — it rides in your pack now.'], morningAxe: null },
  ] });
  const c4 = fixtureCensus([incomplete]);
  check('B5 missing day-2 morning -> INVALID', c4.seeds['4'].weaponFetch.indicator === 'INVALID', c4.seeds['4'].weaponFetch.indicator);
}

// ---------- Part D: live gate probe (fresh 15337 load) ----------
async function gateProbe() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 15337, mode: 'nighttravel-b', fullTelemetry: false });
  await setupGame(Game);
  const sch = Game.state.scholar || {};
  const vid = sch.villagerId || Game.villagerId || null;
  const pp = Game.getPerson ? Game.getPerson(vid) : null;
  const stash = pp ? (pp.stashed || []).map((e) => (e && (e.itemId || e.id)) || e) : null;
  check('D1 probe vessel id present', !!vid, String(vid));
  check('D2 probe spawn stash is [snare_wire, hatchet, bark_armor]', JSON.stringify(stash) === JSON.stringify(['snare_wire', 'hatchet', 'bark_armor']), JSON.stringify(stash));
  check('D3 probe not over at spawn', !Game.over);
  check('D4 probe day flags unset at spawn', sch._stashFetchDay === undefined || sch._stashFetchDay === null, String(sch._stashFetchDay));
  check('D5 probe armor day flag unset at spawn', sch._armorFetchDay === undefined || sch._armorFetchDay === null, String(sch._armorFetchDay));
  let atHaven = null;
  try { atHaven = (typeof Game.playerAtHaven === 'function') ? !!Game.playerAtHaven() : true; } catch (e) { atHaven = null; }
  check('D6 probe at haven at spawn', atHaven === true, String(atHaven));
  check('D7 probe person alive at spawn', !!(pp && !pp.dead));
  check('D8 probe melee slot empty at spawn (bonus 0)', !(sch.equipped && sch.equipped.melee && sch.equipped.melee.itemId), JSON.stringify(sch.equipped && sch.equipped.melee));
  const r1 = Game.vesselStashFetch();
  check('D9 probe direct weapon fetch returns hatchet/melee', !!(r1 && r1.item === 'hatchet' && r1.slot === 'melee'), JSON.stringify(r1));
  const stashAfter = pp ? (pp.stashed || []).map((e) => (e && (e.itemId || e.id)) || e) : null;
  check('D10 probe stash shrinks by hatchet', JSON.stringify(stashAfter) === JSON.stringify(['snare_wire', 'bark_armor']), JSON.stringify(stashAfter));
  check('D11 probe scholar inv gains hatchet', (sch.inventory || []).some((i) => (i.itemId || i.id) === 'hatchet'));
  const r2 = Game.vesselStashFetch();
  check('D12 probe second same-day weapon fetch returns null (day-flag gate)', r2 === null || r2 === undefined, JSON.stringify(r2));
  const r3 = Game.vesselArmorFetch();
  check('D13 probe direct armor fetch returns bark_armor', !!(r3 && r3.item === 'bark_armor'), JSON.stringify(r3));
  const r4 = Game.vesselArmorFetch();
  check('D14 probe second same-day armor fetch returns null (armor day-flag gate)', r4 === null || r4 === undefined, JSON.stringify(r4));
}

(async () => {
  try { await gateProbe(); } catch (e) { check('D-probe threw', false, String((e && e.stack) || e)); }

  // ---------- Part C: corpus checks (only with --require-corpus) ----------
  if (REQUIRE_CORPUS) {
    const corpus = (name) => path.join(EVID, name);
    const expectDir = (name, nSeeds) => {
      const dir = corpus(name);
      check('C dir present: ' + name, fs.existsSync(dir), dir);
      if (!fs.existsSync(dir)) return null;
      const files = fs.readdirSync(dir).filter((f) => f.startsWith('stashfetch-a-s') && f.endsWith('.json')).sort();
      check('C file count ' + name + ' == ' + nSeeds, files.length === nSeeds, files.join(','));
      return runAnalyzer(dir);
    };
    const pilot = expectDir('sim-stashfetch-a-corpus-pilot', 8);
    if (pilot) {
      check('C pilot recorder errs 0', pilot.summary.recorderErrsTotal === 0, String(pilot.summary.recorderErrsTotal));
      check('C pilot complete 8/8', pilot.summary.complete === 8, String(pilot.summary.complete));
      check('C pilot no INVALID weapon indicators', pilot.summary.weaponInvalid === 0, String(pilot.summary.weaponInvalid));
      check('C pilot no INVALID armor indicators', pilot.summary.armorInvalid === 0, String(pilot.summary.armorInvalid));
      check('C pilot 15337 weapon FETCH', pilot.seeds['15337'] && pilot.seeds['15337'].weaponFetch.indicator === 'FETCH', pilot.seeds['15337'] ? pilot.seeds['15337'].weaponFetch.indicator : 'missing');
      check('C pilot 15337 armor FETCH', pilot.seeds['15337'] && pilot.seeds['15337'].armorFetch.indicator === 'FETCH', pilot.seeds['15337'] ? pilot.seeds['15337'].armorFetch.indicator : 'missing');
    }
    const cells = { V: 'sim-stashfetch-a-corpus-cell-V', A: 'sim-stashfetch-a-corpus-cell-A', B: 'sim-stashfetch-a-corpus-cell-B', C: 'sim-stashfetch-a-corpus-cell-C', P: 'sim-stashfetch-a-corpus-cell-P' };
    const cellCensus = {};
    for (const [k, dir] of Object.entries(cells)) {
      const cen = expectDir(dir, 1);
      cellCensus[k] = cen;
      if (cen) {
        const s = cen.seeds['15337'];
        check('C cell ' + k + ' present 15337', !!s);
        if (s) {
          check('C cell ' + k + ' complete', s.complete === true);
          check('C cell ' + k + ' recorder errs 0', s.recorderErrs === 0, String(s.recorderErrs));
          check('C cell ' + k + ' weapon indicator valid (FETCH or NOFETCH)', s.weaponFetch.indicator === 'FETCH' || s.weaponFetch.indicator === 'NOFETCH', s.weaponFetch.indicator);
          check('C cell ' + k + ' armor indicator valid (FETCH or NOFETCH)', s.armorFetch.indicator === 'FETCH' || s.armorFetch.indicator === 'NOFETCH', s.armorFetch.indicator);
          check('C cell ' + k + ' spawn stash matches axearrival record', JSON.stringify(s.spawnStash) === JSON.stringify(['snare_wire', 'hatchet', 'bark_armor']), JSON.stringify(s.spawnStash));
        }
      }
    }
    const det = expectDir('sim-stashfetch-a-corpus-cell-V-determinism', 1);
    if (det && cellCensus.V) {
      const a = fs.readFileSync(path.join(corpus('sim-stashfetch-a-corpus-cell-V'), 'stashfetch-a-s15337.json'), 'utf8');
      const b = fs.readFileSync(path.join(corpus('sim-stashfetch-a-corpus-cell-V-determinism'), 'stashfetch-a-s15337.json'), 'utf8');
      check('C determinism cell-V re-run byte-identical', a === b);
      check('C determinism 15337 weapon FETCH', det.seeds['15337'] && det.seeds['15337'].weaponFetch.indicator === 'FETCH');
    }
    const confirm = expectDir('sim-stashfetch-a-corpus-confirm', 12);
    if (confirm) {
      check('C confirm recorder errs 0', confirm.summary.recorderErrsTotal === 0, String(confirm.summary.recorderErrsTotal));
      check('C confirm complete 12/12', confirm.summary.complete === 12, String(confirm.summary.complete));
      check('C confirm no INVALID weapon indicators', confirm.summary.weaponInvalid === 0, String(confirm.summary.weaponInvalid));
      check('C confirm no INVALID armor indicators', confirm.summary.armorInvalid === 0, String(confirm.summary.armorInvalid));
    }
    // Tracked-diff guard: src/ + scripts/policies/ unchanged vs pinned base.
    try {
      const diff = execSync('git diff f44ec6957 -- src scripts/policies', { encoding: 'utf8', cwd: ROOT });
      check('C tracked diff src/ + scripts/policies/ empty vs f44ec6957', diff.trim() === '', diff.slice(0, 300));
    } catch (e) { check('C tracked diff guard ran', false, String((e && e.message) || e)); }
  }

  console.log(`stashfetch-a proof: ${pass} passed, ${fail} failed`);
  if (fail) { console.log('failures:'); for (const f of failures) console.log(' - ' + f); process.exit(1); }
})().catch((e) => { console.error('FATAL: ' + ((e && e.stack) || e)); process.exit(1); });
