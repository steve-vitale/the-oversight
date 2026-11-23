// test-rearm-b.js — arm sim-rearm-b: corpse-transfer re-arm path
// (REARM_CELLS=1, corpses.js villagerRearmFromCorpse + witness take +
// Haven sweep), judged on the killbundle staged leg.
//   node scripts/test-rearm-b.js            (pre-run checks: frozen
//       bands, sizing arithmetic, presence checks)
//   node scripts/test-rearm-b.js --live   (live proof on the harness:
//       staged holder dies with a witness -> witness takes gun + 1
//       cell, equips, fires 1 shot at wave 4; REARM-off control ->
//       no take, corpse keeps gun + cell; dry-holder / armed-holder /
//       no-cell / scholar-exclusion guards; Haven sweep channel)
//   node scripts/test-rearm-b.js --dir-ctl <stagedCtlCorpusDir>
//       corpus validation: 16 files, mode arm, KILLBUNDLE on,
//       STAGE_SEAR on, REARM off, one shared anchor, policySha
//       matches scripts/policies/competent.js, 0 instrument errors,
//       16 staged arrivals bundled, 0 re-arm events.
//   node scripts/test-rearm-b.js --dir-arm <stagedArmCorpusDir>
//       corpus validation: same structure with REARM on; re-arm
//       counts reported (judged by the analyzer, not here).
// Reads only; never writes into the repo (live mode runs the harness
// in-memory only).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'killlootbundle-driver-a'));
const analyzer = require(path.join(REPO, 'scripts', 'analyze-killlootbundle-a'));
const { tallyDir } = require(path.join(REPO, 'scripts', 'test-killrate-analysis-a'));
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

// Frozen from the prereg (sim-rearm-b).
const STAGED_START = 107533;
const STAGED_END = 107548;
const STAGED_N = 16;
const PILOT_N = 8;
// Killbundle-b staged leg, carried: 16 arrivals, 2 fired, both died dry;
// 12 of 16 died holding cells; 2 survived holding cells.
const KB_STAGED_ARRIVALS = 16;
const KB_STAGED_FIRED = 2;
const KB_SUPPLY_DEATHS = 12;
// Reserved ranges the staged band must not overlap (killbundle-b §4).
const RESERVED = [
  [107501, 107516, 'journey-endgame-r270 (107501-107508) / Loop A original'],
  [107517, 107532, 'Loop A sim-launchsilence-a (moved band)'],
  [107471, 107494, 'Loop B gateavoid-doorrich-b screen'],
  [107313, 107320, 'sim-killrate-a'],
  [107261, 107268, 'killlootbundle pilot'],
  [107281, 107296, 'killloot16'],
];

function validateCorpus(dir, opts) {
  const files = fs.readdirSync(dir).sort().filter(function (f) {
    return /killlootbundle-a-s\d+-killlootbundle-a-arm\.json$/.test(f);
  });
  const policySha = crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8'))
    .digest('hex').slice(0, 12);
  const anchors = {};
  const seeds = [];
  let errors = 0, missingAnchor = 0, policyMismatches = 0;
  let wrongMode = 0, bundleOff = 0, stageWrong = 0, rearmWrong = 0, rearmPresentOff = 0;
  let klArrivals = 0, klBundled = 0, rearmEvents = 0, supplyDeaths = 0, rearmVolleys = 0;
  let scholarTakes = 0;
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
    if (!!c.rearmOn !== !!opts.expectRearm) rearmWrong++;
    if (!c.rearmPresent) rearmPresentOff++;
    const a = analyzer.analyzeSeed(c);
    klArrivals += a.klArrivals;
    klBundled += a.klBundled;
    rearmEvents += a.rearmEvents;
    supplyDeaths += a.supplyDeaths;
    rearmVolleys += a.rearmVolleys;
    scholarTakes += a.scholarTakes;
  });
  const tally = tallyDir(dir);
  return {
    files: files.length, seeds: seeds, policySha: policySha,
    anchors: anchors, missingAnchor: missingAnchor,
    policyShaMismatches: policyMismatches, instrumentErrors: errors,
    wrongMode: wrongMode, bundleOff: bundleOff, stageWrong: stageWrong,
    rearmWrong: rearmWrong, rearmPresentOff: rearmPresentOff,
    klArrivals: klArrivals, klBundled: klBundled, klDry: klArrivals - klBundled,
    rearmEvents: rearmEvents, supplyDeaths: supplyDeaths,
    rearmVolleys: rearmVolleys, scholarTakes: scholarTakes,
    tally: { total: tally.total, t4: tally.t4, t4Rate: tally.t4Rate,
      sear: tally.sear, dropsPerSeed: tally.dropsPerSeed },
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
function corpseCells(c) {
  let n = 0;
  for (const it of ((c && c.items) || [])) {
    if (!it || (it.units == null ? 1 : it.units) <= 0) continue;
    const id = (typeof it === 'string') ? it : (it.itemId || it.id);
    if (id === 'fusion_cell') n += (typeof it === 'string') ? 1 : (it.units == null ? 1 : it.units);
  }
  return n;
}
function corpseGuns(c) {
  let n = 0;
  for (const it of ((c && c.items) || [])) {
    if (!it || (it.units == null ? 1 : it.units) <= 0) continue;
    const id = (typeof it === 'string') ? it : (it.itemId || it.id);
    if (id === 'searcaster') n += (typeof it === 'string') ? 1 : (it.units == null ? 1 : it.units);
  }
  return n;
}
function livePerson(Game, vid) {
  return Game.getPerson ? Game.getPerson(vid) : null;
}
function stageArrival(Game, vid) {
  const staged = driver.stageFirstKillLoot(Game.villagerKillLoot);
  return staged.call(Game, vid, { wave: 4, id: 'test-beast' });
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
  const { Game } = await loadGame({ seed: 7, mode: 'rearm-test', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state.village || {}).roster || []).filter(function (r) { return r && r !== Game.villagerId; });
  check('live: at least 8 living roster villagers to stage with', roster.length >= 8, 'roster=' + roster.length);
  if (roster.length < 8) { console.log('TEST-REARM-B-LIVE: ' + pass + ' passed, ' + fail + ' failed'); return fail === 0; }
  const mdef = (Game.data.monsters || []).find(function (m) { return m.wave === 4; });
  check('live: a wave-4 monster def exists', !!mdef, mdef && mdef.id);

  // --- Test 1: witness second-life + wave-4 volley (REARM on) ---
  const h1 = roster[0], t1 = roster[1];
  const holder1 = livePerson(Game, h1), taker1 = livePerson(Game, t1);
  check('live T1: staged arrival returns searcaster', stageArrival(Game, h1) === 'searcaster');
  check('live T1: holder gains exactly 1 gun', gunsOf(holder1) === 1, 'guns=' + gunsOf(holder1));
  check('live T1: holder gains exactly 2 cells', cellsOf(holder1) === 2, 'cells=' + cellsOf(holder1));
  const corpse1 = Game.registerDeath({ kind: 'villager', villagerId: h1, name: holder1.name || 'holder', cause: 'combat', witnesses: [t1] });
  check('live T1: corpse registered', !!corpse1);
  check('live T1: taker gains exactly 1 gun from the corpse', gunsOf(taker1) === 1, 'guns=' + gunsOf(taker1));
  check('live T1: taker gains exactly 1 cell (corpse supply cap)', cellsOf(taker1) === 1, 'cells=' + cellsOf(taker1));
  check('live T1: taker equips the gun (re-seated by the take)', equippedGun(Game, taker1) === 'searcaster', 'equipped=' + equippedGun(Game, taker1));
  check('live T1: corpse gun is gone', corpseGuns(corpse1) === 0, 'guns=' + corpseGuns(corpse1));
  check('live T1: corpse cells are gone', corpseCells(corpse1) === 0, 'cells=' + corpseCells(corpse1));
  const rec1 = Game.fieldFight(t1, mdef, null, { allies: 1, allyFromStart: true });
  check('live T1: second-life volley fires at wave 4 (shots >= 1)', !!(rec1 && rec1.volley && (rec1.volley.shots || 0) >= 1),
    'volley=' + JSON.stringify(rec1 && rec1.volley));
  check('live T1: the volley spends the corpse cell (ammoLeft 0)', !!(rec1 && rec1.volley && rec1.volley.ammoLeft === 0),
    'volley=' + JSON.stringify(rec1 && rec1.volley));

  // --- Test 2: REARM-off control — the same death takes nothing ---
  delete process.env.REARM_CELLS;
  check('live T2: gate reads off once unset', Game._rearmCellsOn ? Game._rearmCellsOn() === false : false);
  const h2 = roster[2], t2 = roster[3];
  const holder2 = livePerson(Game, h2), taker2 = livePerson(Game, t2);
  check('live T2: staged arrival returns searcaster', stageArrival(Game, h2) === 'searcaster');
  check('live T2: holder gains exactly 2 cells', cellsOf(holder2) === 2, 'cells=' + cellsOf(holder2));
  const corpse2 = Game.registerDeath({ kind: 'villager', villagerId: h2, name: holder2.name || 'holder', cause: 'combat', witnesses: [t2] });
  check('live T2: corpse registered', !!corpse2);
  check('live T2: taker gains no gun (REARM off)', gunsOf(taker2) === 0, 'guns=' + gunsOf(taker2));
  check('live T2: taker gains no cells (REARM off)', cellsOf(taker2) === 0, 'cells=' + cellsOf(taker2));
  check('live T2: corpse keeps the gun', corpseGuns(corpse2) === 1, 'guns=' + corpseGuns(corpse2));
  check('live T2: corpse keeps exactly 1 cell (units:1 collapse)', corpseCells(corpse2) === 1, 'cells=' + corpseCells(corpse2));

  // --- Test 3: dry holder takes cells only; gun-less witness gets nothing ---
  process.env.REARM_CELLS = '1';
  const h3 = roster[4], dryVid = roster[5], glVid = roster[6];
  const holder3 = livePerson(Game, h3), dry = livePerson(Game, dryVid), gl = livePerson(Game, glVid);
  dry.items = dry.items || []; dry.items.push('searcaster'); // dry holder: gun, 0 cells
  try { if (Game.villagerGearUp) Game.villagerGearUp(dryVid, false); } catch (e) {}
  check('live T3: dry holder staged (gun, 0 cells)', gunsOf(dry) === 1 && cellsOf(dry) === 0,
    'guns=' + gunsOf(dry) + ' cells=' + cellsOf(dry));
  check('live T3: staged arrival returns searcaster', stageArrival(Game, h3) === 'searcaster');
  const corpse3 = Game.registerDeath({ kind: 'villager', villagerId: h3, name: holder3.name || 'holder', cause: 'combat', witnesses: [dryVid, glVid] });
  check('live T3: corpse registered', !!corpse3);
  check('live T3: dry holder gains exactly 1 cell', cellsOf(dry) === 1, 'cells=' + cellsOf(dry));
  check('live T3: dry holder still holds exactly 1 gun', gunsOf(dry) === 1, 'guns=' + gunsOf(dry));
  check('live T3: gun stays on the corpse (cells-only take)', corpseGuns(corpse3) === 1, 'guns=' + corpseGuns(corpse3));
  check('live T3: gun-less second witness gains nothing', gunsOf(gl) === 0 && cellsOf(gl) === 0,
    'guns=' + gunsOf(gl) + ' cells=' + cellsOf(gl));

  // --- Test 4: armed holder takes nothing ---
  const h4 = roster[7], armedVid = roster[1]; // taker1 is armed again? No: taker1 spent their cell in T1.
  // Re-arm taker1 by hand for this guard: gun + 1 cell, then they witness h4's death.
  const armed = livePerson(Game, armedVid);
  armed.items = armed.items || [];
  if (cellsOf(armed) === 0) armed.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: 1, kg: 0.4 });
  check('live T4: armed witness staged (gun + cells)', gunsOf(armed) === 1 && cellsOf(armed) >= 1,
    'guns=' + gunsOf(armed) + ' cells=' + cellsOf(armed));
  const holder4 = livePerson(Game, h4);
  check('live T4: staged arrival returns searcaster', stageArrival(Game, h4) === 'searcaster');
  const cellsBefore = cellsOf(armed);
  const corpse4 = Game.registerDeath({ kind: 'villager', villagerId: h4, name: holder4.name || 'holder', cause: 'combat', witnesses: [armedVid] });
  check('live T4: corpse registered', !!corpse4);
  check('live T4: armed holder gains no more cells', cellsOf(armed) === cellsBefore, 'before=' + cellsBefore + ' after=' + cellsOf(armed));
  check('live T4: corpse keeps its cell', corpseCells(corpse4) === 1, 'cells=' + corpseCells(corpse4));

  // --- Test 5: no-cells corpse — no take even for a gun-less witness ---
  const freshVid = roster.find(function (r) { return !livePerson(Game, r).dead && gunsOf(livePerson(Game, r)) === 0 && cellsOf(livePerson(Game, r)) === 0 && r !== glVid; });
  check('live T5: a fresh gear-less villager exists for the no-cells guard', !!freshVid);
  if (!freshVid) { console.log('TEST-REARM-B-LIVE: ' + pass + ' passed, ' + fail + ' failed'); return fail === 0; }
  const gl2 = livePerson(Game, glVid);
  const gunsBefore5 = gunsOf(gl2), cellsBefore5 = cellsOf(gl2);
  const corpse5 = Game.registerDeath({ kind: 'villager', villagerId: freshVid, name: (livePerson(Game, freshVid).name || 'holder'), cause: 'combat', witnesses: [glVid] });
  check('live T5: plain corpse registered', !!corpse5);
  check('live T5: no-cells corpse gives nothing', gunsOf(gl2) === gunsBefore5 && cellsOf(gl2) === cellsBefore5,
    'guns=' + gunsOf(gl2) + ' cells=' + cellsOf(gl2));

  // --- Test 6: scholar as sole witness — excluded, no take ---
  // Kill a fresh staged holder with only the scholar witnessing.
  const holder6 = livePerson(Game, roster.find(function (r) { return r !== h1 && r !== h2 && r !== h3 && r !== h4 && r !== freshVid && !livePerson(Game, r).dead && gunsOf(livePerson(Game, r)) === 0; }));
  let corpse6 = null;
  if (holder6) {
    const h6vid = holder6.id;
    check('live T6: staged arrival returns searcaster', stageArrival(Game, h6vid) === 'searcaster');
    corpse6 = Game.registerDeath({ kind: 'villager', villagerId: h6vid, name: holder6.name || 'holder', cause: 'combat', witnesses: [Game.villagerId] });
    check('live T6: corpse registered', !!corpse6);
    check('live T6: scholar-only witness takes nothing (corpse keeps gun + cell)',
      corpseGuns(corpse6) === 1 && corpseCells(corpse6) === 1,
      'guns=' + corpseGuns(corpse6) + ' cells=' + corpseCells(corpse6));
  } else {
    check('live T6: a fresh holder exists for the scholar-witness guard', false, 'no fresh villager left');
  }

  // --- Test 7: Haven sweep channel ---
  const v = Game.state.village || {};
  const havenNode = { x: (v.px != null ? v.px : 4), y: (v.py != null ? v.py : 4) };
  const havenPeople = (Game.campPeopleIds ? Game.campPeopleIds('haven') : []).filter(function (id) { return id && id !== Game.villagerId; });
  const sweepTakerVid = havenPeople.find(function (id) {
    const p = livePerson(Game, id);
    return p && !p.dead && gunsOf(p) === 0;
  });
  check('live T7: a gun-less villager is at Haven', !!sweepTakerVid, 'haven=' + JSON.stringify(havenPeople));
  if (sweepTakerVid) {
    const sweepTaker = livePerson(Game, sweepTakerVid);
    const holder7 = livePerson(Game, roster.find(function (r) {
      return r !== h1 && r !== h2 && r !== h3 && r !== h4 && r !== freshVid && r !== sweepTakerVid && !livePerson(Game, r).dead && gunsOf(livePerson(Game, r)) === 0 && r !== (holder6 && holder6.id);
    }));
    if (holder7) {
      const h7vid = holder7.id;
      check('live T7: staged arrival returns searcaster', stageArrival(Game, h7vid) === 'searcaster');
      // Home death: no witnesses. Stage the corpse at the Haven node
      // (a home death registers where the scholar stands; the node is
      // set explicitly so the test does not depend on the scholar's
      // harness position).
      const corpse7 = Game.registerDeath({ kind: 'villager', villagerId: h7vid, name: holder7.name || 'holder', cause: 'a wound that would not close' });
      check('live T7: corpse registered', !!corpse7);
      if (corpse7) { corpse7.node = { x: havenNode.x, y: havenNode.y }; }
      // Drain the earlier staged corpses (T2/T4/T6 kept a gun + 1 cell
      // each): they sit at the scholar's node too, and the sweep would
      // take from them first. Zero their cells and lift their guns so
      // the sweep's single take is attributable to corpse7 alone.
      [corpse2, corpse3, corpse4, corpse6].forEach(function (cc) {
        if (!cc || !cc.items) return;
        for (let i = cc.items.length - 1; i >= 0; i--) {
          const it = cc.items[i];
          if (!it) continue;
          const id = (typeof it === 'string') ? it : (it.itemId || it.id);
          if (id === 'fusion_cell') it.units = 0;
          if (id === 'searcaster') cc.items.splice(i, 1);
        }
      });
      const recs = Game.villagerRearmHavenSweep ? Game.villagerRearmHavenSweep() : [];
      check('live T7: sweep takes exactly once', recs.length === 1, 'takes=' + recs.length);
      check('live T7: sweep take is second-life via the haven channel',
        !!(recs[0] && recs[0].kind === 'second-life' && recs[0].channel === 'haven' && recs[0].taker === sweepTakerVid),
        JSON.stringify(recs[0] || null));
      check('live T7: sweep taker gains gun + 1 cell', gunsOf(sweepTaker) === 1 && cellsOf(sweepTaker) === 1,
        'guns=' + gunsOf(sweepTaker) + ' cells=' + cellsOf(sweepTaker));
    } else {
      check('live T7: a fresh holder exists for the sweep', false, 'no fresh villager left');
    }
  }
  delete process.env.KILLBUNDLE;
  delete process.env.REARM_CELLS;
  delete process.env.CELLGATE;
  console.log('TEST-REARM-B-LIVE: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

if (require.main === module) (async function () {
  const ctlIdx = process.argv.indexOf('--dir-ctl');
  const armIdx = process.argv.indexOf('--dir-arm');
  if (ctlIdx !== -1) {
    const v = validateCorpus(process.argv[ctlIdx + 1], { expectRearm: false });
    console.log(JSON.stringify(v, null, 2));
    const ok = v.files === STAGED_N && v.instrumentErrors === 0
      && v.missingAnchor === 0 && v.policyShaMismatches === 0
      && Object.keys(v.anchors).length === 1
      && v.wrongMode === 0 && v.bundleOff === 0 && v.stageWrong === 0
      && v.rearmWrong === 0 && v.rearmPresentOff === 0
      && v.seeds.length === STAGED_N
      && v.seeds.every(function (s, i) { return s === STAGED_START + i; })
      && v.klArrivals === STAGED_N && v.klBundled === STAGED_N && v.klDry === 0
      && v.rearmEvents === 0;
    console.log('TEST-REARM-B-CORPUS-CTL: ' + (ok ? 'PASS' : 'FAIL'));
    process.exit(ok ? 0 : 1);
  }
  if (armIdx !== -1) {
    const v = validateCorpus(process.argv[armIdx + 1], { expectRearm: true });
    console.log(JSON.stringify(v, null, 2));
    const ok = v.files === STAGED_N && v.instrumentErrors === 0
      && v.missingAnchor === 0 && v.policyShaMismatches === 0
      && Object.keys(v.anchors).length === 1
      && v.wrongMode === 0 && v.bundleOff === 0 && v.stageWrong === 0
      && v.rearmWrong === 0 && v.rearmPresentOff === 0
      && v.seeds.length === STAGED_N
      && v.seeds.every(function (s, i) { return s === STAGED_START + i; })
      && v.klArrivals === STAGED_N && v.klBundled === STAGED_N && v.klDry === 0;
    console.log('TEST-REARM-B-CORPUS-ARM: ' + (ok ? 'PASS' : 'FAIL') +
      ' (rearmEvents=' + v.rearmEvents + ' supplyDeaths=' + v.supplyDeaths +
      ' rearmVolleys=' + v.rearmVolleys + ' scholarTakes=' + v.scholarTakes + ')');
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
  // Frozen staged band (reuses the killbundle staged subset BY DESIGN).
  check('band: 16 contiguous staged seeds', STAGED_END - STAGED_START + 1 === STAGED_N,
    STAGED_START + '-' + STAGED_END);
  check('band: staged subset of the matched killarrive band (107533-107581)',
    STAGED_START >= 107533 && STAGED_END <= 107581);
  check('band: pilot is the first 8 staged seeds', PILOT_N === 8);
  check('band: no overlap with any reserved range',
    RESERVED.every(function (r) { return STAGED_END < r[0] || STAGED_START > r[1]; }),
    JSON.stringify(RESERVED.filter(function (r) { return !(STAGED_END < r[0] || STAGED_START > r[1]); })));
  // Carried numbers (killbundle-b §3/§5) the prereg's bars rest on.
  check('carry: 16 staged arrivals in killbundle-b', KB_STAGED_ARRIVALS === 16);
  check('carry: 2 staged holders fired', KB_STAGED_FIRED === 2);
  check('carry: 12 staged holders died holding cells', KB_SUPPLY_DEATHS === 12);
  check('carry: expected pilot supply ≈ 6 (half of 12)', approx(KB_SUPPLY_DEATHS / 2, 6, 0.5));
  // Volley base rate behind the frozen GO bar (12.5% per arrival).
  check('carry: P(>=1 volley | 6 takes) ≈ 55%', approx(1 - Math.pow(0.875, 6), 0.55, 0.03),
    'got ' + (1 - Math.pow(0.875, 6)).toFixed(3));
  // Presence: the lever code the driver gates on.
  let corpsesSrc = '';
  try { corpsesSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'corpses.js'), 'utf8'); } catch (e) {}
  check('presence: REARM_CELLS env gate in corpses.js', /REARM_CELLS/.test(corpsesSrc));
  check('presence: villagerRearmFromCorpse in corpses.js', /villagerRearmFromCorpse/.test(corpsesSrc));
  check('presence: villagerRearmWitnessTake in corpses.js', /villagerRearmWitnessTake/.test(corpsesSrc));
  check('presence: villagerRearmHavenSweep in corpses.js', /villagerRearmHavenSweep/.test(corpsesSrc));
  check('presence: witness hook in registerDeath', /villagerRearmWitnessTake\(corpse\)/.test(corpsesSrc));
  let gameSrc = '';
  try { gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8'); } catch (e) {}
  check('presence: Haven sweep hook in endDay (game.js)', /villagerRearmHavenSweep\(\)/.test(gameSrc));
  // Driver + analyzer exports the instrument needs.
  check('driver: stageFirstKillLoot exported', typeof driver.stageFirstKillLoot === 'function');
  check('analyzer: judgeRearmCompare exported', typeof analyzer.judgeRearmCompare === 'function');
  check('analyzer: analyzeSeed carries rearm fields',
    (function () {
      const s = analyzer.analyzeSeed({ seed: 1, mode: 'arm', gameDays: 150, endReason: 'survived',
        contestEvents: [], prizeEvents: [], grantEvents: [], killLootEvents: [], volleyEvents: [],
        rearmTakeEvents: [], corpseTakeEvents: [], v4gunLoc: [], deaths: [], instrumentErrors: [] });
      return s.rearmEvents === 0 && s.supplyDeaths === 0 && s.rearmVolleys === 0 && s.scholarTakes === 0;
    })());
  console.log('TEST-REARM-B: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { STAGED_START: STAGED_START, STAGED_END: STAGED_END, STAGED_N: STAGED_N,
  PILOT_N: PILOT_N, RESERVED: RESERVED, validateCorpus: validateCorpus };
