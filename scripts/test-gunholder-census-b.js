// test-gunholder-census-b.js — arm sim-gunholder-census-b: census of what
// loaded-gun holders do with their guns (DIAG — no game-code change).
//   node scripts/test-gunholder-census-b.js            (pre-run checks:
//       frozen band, carried numbers, presence checks)
//   node scripts/test-gunholder-census-b.js --live   (live proof on the
//       harness: a staged holder leads a wave-4 fight and fires (T1);
//       leads wave-2 and the CELLGATE hold fires instead (T2); fights as
//       an ally and gets no volley (T3); a day with no fight at all (T4);
//       stands on the wild node while another villager is picked (T5);
//       evades before any volley (T6); leads wave-4 with 0 cells and the
//       trigger clicks on nothing (T7); fixture check — Ella 77 holder-days
//       / 0 searcaster volleys, Wanjiru 27 / 0, from the witness corpora (T8))
//   node scripts/test-gunholder-census-b.js --dir-arm <corpusDir>
//       corpus validation: 8 files, mode arm, substrate flags on, one
//       shared anchor, policySha matches competent.js, 0 instrument
//       errors, 8 staged arrivals bundled, fightEvents + encounterEvents
//       recorded on every file, zero src/js diffs.
// Reads only; never writes into the repo (live mode runs the harness
// in-memory only).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'gunholder-census-driver-b'));
const analyzer = require(path.join(REPO, 'scripts', 'analyze-gunholder-census-b'));
const kbDriver = require(path.join(REPO, 'scripts', 'killlootbundle-driver-a'));
const kbAnalyzer = require(path.join(REPO, 'scripts', 'analyze-killlootbundle-a'));
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

// Frozen from the prereg (sim-gunholder-census-b).
const BAND_START = 107750;
const BAND_END = 107757;
const BAND_N = 8;
const SUPPLY_FLOOR = 60;
// Carried numbers (rearm-witness-b §11) the prereg's bars rest on.
const ELLA_HOLDER_DAYS = 77;
const WANJIRU_HOLDER_DAYS = 27;
const WANJIRU_TAKE_TO_DEATH = 33;
const SAM_LEAD_SEAR_FIGHTS = 24;
// Reserved ranges the pilot band must not overlap.
const RESERVED = [
  [107734, 107749, 'sim-rearm-witness-b staged band (pilot 107734-107741 judged; 107742-107749 named, unused)'],
  [107670, 107733, 'Loop B sibling arm hold (this run)'],
  [107533, 107548, 'sim-rearm-b staged band'],
  [107501, 107532, 'Loop A sim-launchsilence-a / journey-endgame-r270'],
  [107471, 107494, 'Loop B gateavoid-doorrich-b screen'],
  [107313, 107320, 'sim-killrate-a'],
  [107261, 107268, 'killlootbundle pilot'],
  [107281, 107296, 'killloot16'],
];

function validateCorpus(dir) {
  const files = fs.readdirSync(dir).sort().filter(function (f) {
    return /gunholder-census-b-s\d+-gunholder-census-b-arm\.json$/.test(f);
  });
  const policySha = crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8'))
    .digest('hex').slice(0, 12);
  const anchors = {};
  const seeds = [];
  let errors = 0, missingAnchor = 0, policyMismatches = 0;
  let wrongMode = 0, bundleOff = 0, stageWrong = 0, rearmWrong = 0, rearmPresentOff = 0;
  let klArrivals = 0, klBundled = 0;
  let fightEvents = 0, encounterEvents = 0, holderDays = 0;
  files.forEach(function (f) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    seeds.push(c.seed);
    errors += (c.instrumentErrors || []).length;
    if (!c.anchorCommit) missingAnchor++;
    else anchors[c.anchorCommit] = (anchors[c.anchorCommit] || 0) + 1;
    if (c.policySha !== policySha) policyMismatches++;
    if (c.mode !== 'arm') wrongMode++;
    if (!c.killbundleOn) bundleOff++;
    if (!c.stageSearOn) stageWrong++;
    if (!c.rearmOn) rearmWrong++;
    if (!c.rearmPresent) rearmPresentOff++;
    const a = kbAnalyzer.analyzeSeed(c);
    klArrivals += a.klArrivals;
    klBundled += a.klBundled;
    fightEvents += (c.fightEvents || []).length;
    encounterEvents += (c.encounterEvents || []).length;
    (c.v4gunLoc || []).forEach(function (row) {
      const seen = {};
      (row.locations || []).forEach(function (l) {
        if (l.loc === 'equipped' && l.vid && l.vid !== '__scholar__' && (l.cells || 0) > 0 && !seen[l.vid]) {
          seen[l.vid] = true; holderDays++;
        }
      });
    });
  });
  let srcJsDiff = null;
  try {
    srcJsDiff = execSync('git diff --stat HEAD -- src/js', { cwd: REPO }).toString().trim();
  } catch (e) { srcJsDiff = 'GIT-CHECK-FAILED: ' + String(e.message).slice(0, 80); }
  return {
    files: files.length, seeds: seeds, policySha: policySha,
    anchors: anchors, missingAnchor: missingAnchor,
    policyShaMismatches: policyMismatches, instrumentErrors: errors,
    wrongMode: wrongMode, bundleOff: bundleOff, stageWrong: stageWrong,
    rearmWrong: rearmWrong, rearmPresentOff: rearmPresentOff,
    klArrivals: klArrivals, klBundled: klBundled, klDry: klArrivals - klBundled,
    fightEvents: fightEvents, encounterEvents: encounterEvents,
    holderDays: holderDays, srcJsDiff: srcJsDiff,
  };
}

function cellsOf(person) {
  let n = 0;
  for (const e of (person.items || [])) {
    const id = (typeof e === 'string') ? e : (e.itemId || e.id);
    if (id === 'fusion_cell') n += (typeof e === 'string') ? 1 : (e.units == null ? 1 : e.units);
  }
  return n;
}
function gunsOf(person) {
  let n = 0;
  for (const e of (person.items || [])) {
    const id = (typeof e === 'string') ? e : (e.itemId || e.id);
    if (id === 'searcaster') n += (typeof e === 'string') ? 1 : (e.units == null ? 1 : e.units);
  }
  return n;
}
function equippedGun(Game, person) {
  try {
    const S = globalThis.Scattering || {};
    const rw = (S.equipment && S.equipment.rangedWeaponOf) ? S.equipment.rangedWeaponOf(person, Game.data.items) : null;
    return rw ? (rw.itemId || rw.id) : null;
  } catch (e) { return null; }
}
function livePerson(Game, vid) {
  return Game.getPerson ? Game.getPerson(vid) : null;
}
function stageArrival(Game, vid) {
  const staged = kbDriver.stageFirstKillLoot(Game.villagerKillLoot);
  return staged.call(Game, vid, { wave: 4, id: 'test-beast' });
}
function giveGun(Game, vid, cells) {
  const p = livePerson(Game, vid);
  p.items = p.items || [];
  p.items.push('searcaster');
  for (let i = 0; i < cells; i++) p.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: 1, kg: 0.4 });
  try { if (Game.villagerGearUp) Game.villagerGearUp(vid, false); } catch (e) {}
  return p;
}

async function liveTests() {
  let pass = 0, fail = 0;
  function check(name, cond, detail) {
    if (cond) { pass++; console.log('ok   ' + name); }
    else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
  }
  process.env.KILLBUNDLE = '1';
  process.env.REARM_CELLS = '1';
  process.env.CELLGATE = '1';
  const { Game } = await loadGame({ seed: 7, mode: 'gunholder-census-test', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state.village || {}).roster || []).filter(function (r) { return r && r !== Game.villagerId; });
  check('live: at least 10 living roster villagers to stage with', roster.length >= 10, 'roster=' + roster.length);
  if (roster.length < 10) { console.log('TEST-GUNHOLDER-CENSUS-B-LIVE: ' + pass + ' passed, ' + fail + ' failed'); return fail === 0; }
  const mdef4 = (Game.data.monsters || []).find(function (m) { return m.wave === 4; });
  const mdef2 = (Game.data.monsters || []).find(function (m) { return m.wave === 2; });
  check('live: a wave-4 monster def exists', !!mdef4, mdef4 && mdef4.id);
  check('live: a wave-2 monster def exists', !!mdef2, mdef2 && mdef2.id);

  // --- T1: lead wave-4 fires ---
  const t1 = roster[0];
  const p1 = giveGun(Game, t1, 2);
  check('live T1: holder staged (gun + 2 cells)', gunsOf(p1) === 1 && cellsOf(p1) === 2,
    'guns=' + gunsOf(p1) + ' cells=' + cellsOf(p1));
  check('live T1: gun equipped', equippedGun(Game, p1) === 'searcaster', 'equipped=' + equippedGun(Game, p1));
  const rec1 = Game.fieldFight(t1, mdef4, null, { allies: 1, allyFromStart: true });
  check('live T1: wave-4 volley fires (shots >= 1)', !!(rec1 && rec1.volley && (rec1.volley.shots || 0) >= 1),
    'volley=' + JSON.stringify(rec1 && rec1.volley));
  check('live T1: volley spends cells (ammoLeft < 2)', !!(rec1 && rec1.volley && (rec1.volley.ammoLeft || 0) < 2),
    'volley=' + JSON.stringify(rec1 && rec1.volley));

  // --- T2: lead wave-2 holds (CELLGATE) ---
  const t2 = roster[1];
  const p2 = giveGun(Game, t2, 2);
  check('live T2: holder staged (gun + 2 cells)', gunsOf(p2) === 1 && cellsOf(p2) === 2,
    'guns=' + gunsOf(p2) + ' cells=' + cellsOf(p2));
  const rec2 = Game.fieldFight(t2, mdef2, null, { allies: 1, allyFromStart: true });
  check('live T2: wave-2 volley holds (shots 0, cells kept)', !!(rec2 && rec2.volley && (rec2.volley.shots || 0) === 0 && (rec2.volley.ammoLeft || 0) === 2),
    'volley=' + JSON.stringify(rec2 && rec2.volley));
  check('live T2: hold line names the floor', !!(rec2 && (rec2.log || []).some(function (l) { return String(l).indexOf('holds the Searcaster') !== -1; })),
    'log=' + JSON.stringify((rec2 && rec2.log || []).slice(0, 3)));

  // --- T3: holder as ally gets no volley ---
  const t3lead = roster[2], t3ally = roster[3];
  const p3 = giveGun(Game, t3ally, 2);
  check('live T3: ally holder staged (gun + 2 cells)', gunsOf(p3) === 1 && cellsOf(p3) === 2,
    'guns=' + gunsOf(p3) + ' cells=' + cellsOf(p3));
  // The ally's own volley is never computed: fieldFight's volley block reads
  // only the LEAD's kit. Prove it by fighting with the ally in the party and
  // showing the ally still holds both cells afterwards (no shot was spent).
  const cellsBefore3 = cellsOf(p3);
  const rec3 = Game.fieldFight(t3lead, mdef4, null, { allies: 1, allyVids: [t3ally], allyFromStart: true });
  check('live T3: fight ran with the ally named', !!(rec3 && (rec3.allyVid === t3ally || (rec3.log || []).join(' ').indexOf((p3.name || '').split(' ')[0]) !== -1)),
    'allyVid=' + (rec3 && rec3.allyVid) + ' outcome=' + (rec3 && rec3.outcome));
  check('live T3: ally holder spent no cells (no ally volley exists)', cellsOf(p3) === cellsBefore3,
    'before=' + cellsBefore3 + ' after=' + cellsOf(p3));

  // --- T4: no fight in a day — the census's no-fight class is real ---
  // (A holder who simply never meets a monster: nothing to observe in the
  // engine, so this test asserts the census input instead — the holder
  // holds a loaded gun and no fieldFight call was made for them.)
  const t4 = roster[4];
  const p4 = giveGun(Game, t4, 2);
  check('live T4: holder staged (gun + 2 cells), no fight staged', gunsOf(p4) === 1 && cellsOf(p4) === 2,
    'guns=' + gunsOf(p4) + ' cells=' + cellsOf(p4));
  check('live T4: gun still equipped, cells untouched', equippedGun(Game, p4) === 'searcaster' && cellsOf(p4) === 2,
    'equipped=' + equippedGun(Game, p4) + ' cells=' + cellsOf(p4));

  // --- T5: holder stands on the wild node, another villager is picked ---
  const t5holder = roster[5], t5picked = roster[6];
  const p5 = giveGun(Game, t5holder, 2);
  check('live T5: holder staged (gun + 2 cells)', gunsOf(p5) === 1 && cellsOf(p5) === 2,
    'guns=' + gunsOf(p5) + ' cells=' + cellsOf(p5));
  const node5 = { x: 2, y: 5 };
  try { if (Game.npcSetNode) { Game.npcSetNode(t5holder, node5.x, node5.y); Game.npcSetNode(t5picked, node5.x, node5.y); } } catch (e) {}
  let onNode = [];
  try { onNode = Game.npcsOnNode ? (Game.npcsOnNode(node5.x, node5.y) || []) : []; } catch (e) {}
  check('live T5: both villagers are on the monster node (candidates)', onNode.indexOf(t5holder) !== -1 && onNode.indexOf(t5picked) !== -1,
    'onNode=' + JSON.stringify(onNode));
  // Observe the lead through a test-local fieldFight wrap (the census's
  // own wrap reads the same argument).
  let observedLead = null;
  const origFF = Game.fieldFight;
  Game.fieldFight = function (vid) { observedLead = vid; return origFF.apply(this, arguments); };
  const m5 = { id: mdef2.id, tx: node5.x, ty: node5.y };
  let rec5 = null;
  try { rec5 = Game.resolveWildMonsterEncounter(t5picked, m5, {}); } catch (e) { rec5 = { error: String(e.message).slice(0, 80) }; }
  Game.fieldFight = origFF;
  check('live T5: the picked villager led the fight, not the holder', observedLead === t5picked,
    'observedLead=' + observedLead + ' picked=' + t5picked);
  check('live T5: holder spent no cells (never led)', cellsOf(p5) === 2, 'cells=' + cellsOf(p5));
  check('live T5: encounter returned a fight record', !!(rec5 && rec5.outcome), 'outcome=' + (rec5 && rec5.outcome));

  // --- T6: lead evades before any volley ---
  // Awareness evade is probabilistic (tracking vs stealth); run the same
  // wave-1 fight up to 12 times with fresh leads until an evade lands, and
  // assert the evade record carries no volley. If no evade lands in 12
  // tries, the test reports the miss rather than faking the class.
  const mdef1 = (Game.data.monsters || []).find(function (m) { return m.wave === 1; });
  let evadeSeen = null;
  for (let i = 0; i < 12 && !evadeSeen; i++) {
    const vid = roster[7];
    const p = livePerson(Game, vid);
    if (gunsOf(p) === 0) giveGun(Game, vid, 2);
    // Awareness only applies when opts.awareness is set (expedition path).
    const rec = Game.fieldFight(vid, mdef1, null, { awareness: true });
    if (rec && rec.outcome === 'evade') evadeSeen = rec;
  }
  check('live T6: an evade landed within 12 tries (awareness path)', !!evadeSeen, evadeSeen ? 'outcome=evade' : 'no evade in 12 tries');
  check('live T6: the evade record carries no volley (volley never reached)', !!(evadeSeen && !evadeSeen.volley),
    'volley=' + JSON.stringify(evadeSeen && evadeSeen.volley));

  // --- T7: gun with 0 cells leads wave-4 — trigger clicks on nothing ---
  const t7 = roster[8];
  const p7 = giveGun(Game, t7, 0);
  check('live T7: holder staged (gun, 0 cells)', gunsOf(p7) === 1 && cellsOf(p7) === 0,
    'guns=' + gunsOf(p7) + ' cells=' + cellsOf(p7));
  const rec7 = Game.fieldFight(t7, mdef4, null, { allies: 1, allyFromStart: true });
  check('live T7: 0-cell volley fires nothing (shots 0, ammoLeft 0)', !!(rec7 && rec7.volley && (rec7.volley.shots || 0) === 0 && (rec7.volley.ammoLeft || 0) === 0),
    'volley=' + JSON.stringify(rec7 && rec7.volley));

  // --- T8: fixture check on the witness corpora (repro cases) ---
  const ellaFile = path.join(REPO, 'evidence', '2026-11-21', 'perseed-rearm-witness-b-arm', 'killlootbundle-a-s107737-killlootbundle-a-arm.json');
  const wanjiruFile = path.join(REPO, 'evidence', '2026-11-21', 'perseed-rearm-witness-b-arm', 'killlootbundle-a-s107741-killlootbundle-a-arm.json');
  let ella = null, wanjiru = null;
  try { ella = analyzer.fixtureHolder(ellaFile, 'ella_johnson'); } catch (e) { ella = { error: String(e.message).slice(0, 80) }; }
  try { wanjiru = analyzer.fixtureHolder(wanjiruFile, 'wanjiru_kamau'); } catch (e) { wanjiru = { error: String(e.message).slice(0, 80) }; }
  check('live T8: Ella fixture — 77 holder-days', !!(ella && ella.holderDays === ELLA_HOLDER_DAYS), JSON.stringify(ella));
  check('live T8: Ella fixture — 0 searcaster volleys fired', !!(ella && ella.searFired === 0), JSON.stringify(ella));
  check('live T8: Ella fixture — expedition take d73', !!(ella && (ella.takes || []).some(function (t) { return t.day === 73 && t.channel === 'expedition'; })), JSON.stringify(ella && ella.takes));
  check('live T8: Wanjiru fixture — 27 census holder-days', !!(wanjiru && wanjiru.holderDays === WANJIRU_HOLDER_DAYS), JSON.stringify(wanjiru));
  check('live T8: Wanjiru fixture — 0 searcaster volleys fired', !!(wanjiru && wanjiru.searFired === 0), JSON.stringify(wanjiru));
  check('live T8: Wanjiru fixture — expedition take d97', !!(wanjiru && (wanjiru.takes || []).some(function (t) { return t.day === 97 && t.channel === 'expedition'; })), JSON.stringify(wanjiru && wanjiru.takes));

  delete process.env.KILLBUNDLE;
  delete process.env.REARM_CELLS;
  delete process.env.CELLGATE;
  console.log('TEST-GUNHOLDER-CENSUS-B-LIVE: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

if (require.main === module) (async function () {
  const armIdx = process.argv.indexOf('--dir-arm');
  if (armIdx !== -1) {
    const v = validateCorpus(process.argv[armIdx + 1]);
    console.log(JSON.stringify(v, null, 2));
    const ok = v.files === BAND_N && v.instrumentErrors === 0
      && v.missingAnchor === 0 && v.policyShaMismatches === 0
      && Object.keys(v.anchors).length === 1
      && v.wrongMode === 0 && v.bundleOff === 0 && v.stageWrong === 0
      && v.rearmWrong === 0 && v.rearmPresentOff === 0
      && v.seeds.length === BAND_N
      && v.seeds.every(function (s, i) { return s === BAND_START + i; })
      && v.klArrivals === BAND_N && v.klBundled === BAND_N && v.klDry === 0
      && v.fightEvents > 0 && v.encounterEvents > 0
      && v.holderDays >= SUPPLY_FLOOR
      && v.srcJsDiff === '';
    console.log('TEST-GUNHOLDER-CENSUS-B-CORPUS-ARM: ' + (ok ? 'PASS' : 'FAIL') +
      ' (fightEvents=' + v.fightEvents + ' encounterEvents=' + v.encounterEvents +
      ' holderDays=' + v.holderDays + ' srcJsDiff=' + JSON.stringify(v.srcJsDiff) + ')');
    process.exit(ok ? 0 : 1);
  }
  if (process.argv.indexOf('--live') !== -1) {
    process.exit((await liveTests()) ? 0 : 1);
  }
  let pass = 0, fail = 0;
  function check(name, cond, detail) {
    if (cond) { pass++; console.log('ok   ' + name); }
    else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
  }
  function approx(a, b, eps) { return Math.abs(a - b) <= (eps || 1e-9); }
  // Frozen pilot band (fresh — named nowhere before this prereg).
  check('band: 8 contiguous pilot seeds', BAND_END - BAND_START + 1 === BAND_N,
    BAND_START + '-' + BAND_END);
  check('band: no overlap with any reserved range',
    RESERVED.every(function (r) { return BAND_END < r[0] || BAND_START > r[1]; }),
    JSON.stringify(RESERVED.filter(function (r) { return !(BAND_END < r[0] || BAND_START > r[1]); })));
  check('band: fresh — starts above the highest named seed (107749)',
    BAND_START > 107749, 'start=' + BAND_START);
  check('band: fresh — does not reuse the witness judged band 107734-107741',
    BAND_START > 107741, 'start=' + BAND_START);
  // Carried numbers (rearm-witness-b §11) the prereg's bars rest on.
  check('carry: Ella 77 holder-days', ELLA_HOLDER_DAYS === 77);
  check('carry: Wanjiru 27 census holder-days', WANJIRU_HOLDER_DAYS === 27);
  check('carry: Wanjiru take-to-death span 33 days', WANJIRU_TAKE_TO_DEATH === 33);
  check('carry: Sam Wilson led 24 searcaster fights, all holds', SAM_LEAD_SEAR_FIGHTS === 24);
  check('carry: two takers alone supplied 104 holder-days', ELLA_HOLDER_DAYS + WANJIRU_HOLDER_DAYS === 104);
  check('carry: floor 60 is ~60% of the takers-only count', approx(SUPPLY_FLOOR / (ELLA_HOLDER_DAYS + WANJIRU_HOLDER_DAYS), 0.58, 0.03),
    'got ' + (SUPPLY_FLOOR / (ELLA_HOLDER_DAYS + WANJIRU_HOLDER_DAYS)).toFixed(3));
  // Presence: the code the instrument reads.
  let ffSrc = '';
  try { ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8'); } catch (e) {}
  check('presence: CELLGATE hold in fieldFights.js', /holds the Searcaster/.test(ffSrc));
  check('presence: volley computed from the lead only (rangedWeaponOf(vp))', /rangedWeaponOf\(vp/.test(ffSrc));
  check('presence: evade returns before the volley block', (function () {
    const ev = ffSrc.indexOf("rec.outcome = 'evade'");
    const vol = ffSrc.indexOf('RANGED OPENING VOLLEY');
    return ev !== -1 && vol !== -1 && ev < vol;
  })());
  let gameSrc = '';
  try { gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8'); } catch (e) {}
  check('presence: wild tick picks a random villager on the node', /npcIds\[Math\.floor\(Math\.random\(\) \* npcIds\.length\)\]/.test(gameSrc));
  check('presence: npcsOnNode exists (game.js)', /npcsOnNode\(nx, ny\) \{/.test(gameSrc));
  check('presence: resolveWildMonsterEncounter returns the fight rec', /return rec;\n/.test(gameSrc));
  // Driver + analyzer exports the instrument needs.
  check('driver: oneRun exported', typeof driver.oneRun === 'function');
  check('driver: packCellsByVid exported', typeof driver.packCellsByVid === 'function');
  check('driver: reuses the killlootbundle census (gunLocationsOf)', (function () {
    const src = fs.readFileSync(path.join(REPO, 'scripts', 'gunholder-census-driver-b.js'), 'utf8');
    return /require\(.*killlootbundle-driver-a/.test(src) && /gunLocationsOf/.test(src);
  })());
  check('driver: wraps fieldFight for every call', (function () {
    const src = fs.readFileSync(path.join(REPO, 'scripts', 'gunholder-census-driver-b.js'), 'utf8');
    return /wrapGame\('fieldFight'/.test(src) && /fightEvents\.push/.test(src);
  })());
  check('driver: wraps resolveWildMonsterEncounter with candidates', (function () {
    const src = fs.readFileSync(path.join(REPO, 'scripts', 'gunholder-census-driver-b.js'), 'utf8');
    return /wrapGame\('resolveWildMonsterEncounter'/.test(src) && /npcsOnNode/.test(src) && /encounterEvents\.push/.test(src);
  })());
  check('analyzer: analyzeSeed exported', typeof analyzer.analyzeSeed === 'function');
  check('analyzer: judgeLeg exported', typeof analyzer.judgeLeg === 'function');
  check('analyzer: fixtureHolder exported', typeof analyzer.fixtureHolder === 'function');
  check('analyzer: nine classes frozen', Array.isArray(analyzer.CLASSES) && analyzer.CLASSES.length === 9);
  check('analyzer: supply floor frozen at 60', analyzer.SUPPLY_FLOOR === 60);
  check('analyzer: selftest green', analyzer.selftest());
  check('lineage: killlootbundle analyzer selftest green', kbAnalyzer.selftest());
  console.log('TEST-GUNHOLDER-CENSUS-B: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { BAND_START: BAND_START, BAND_END: BAND_END, BAND_N: BAND_N,
  SUPPLY_FLOOR: SUPPLY_FLOOR, RESERVED: RESERVED, validateCorpus: validateCorpus };
