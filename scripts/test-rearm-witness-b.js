// test-rearm-witness-b.js — arm sim-rearm-witness-b: wild-corpse
// expedition witness channel for the corpse-transfer re-arm
// (REARM_CELLS=1, corpses.js villagerRearmExpeditionStep, hooked from
// expeditionLeg + objAwayStep), judged on the killbundle staged leg.
//   node scripts/test-rearm-witness-b.js            (pre-run checks:
//       frozen bands, sizing arithmetic, presence checks)
//   node scripts/test-rearm-witness-b.js --live   (live proof on the
//       harness: staged holder dies in the wild with cells on a wild
//       node + a needy villager steps onto that node on expedition ->
//       takes gun + cells, equips, fires 1 shot at wave 4; REARM-off
//       control -> no take, corpse keeps gun + cells; dry-holder /
//       armed-holder / no-cell / scholar-exclusion / Haven-node-exclusion /
//       wrong-node guards)
//   node scripts/test-rearm-witness-b.js --dir-ctl <stagedCtlCorpusDir>
//       corpus validation: 16 files, mode arm, KILLBUNDLE on,
//       STAGE_SEAR on, REARM off, one shared anchor, policySha
//       matches scripts/policies/competent.js, 0 instrument errors,
//       16 staged arrivals bundled, 0 re-arm events.
//   node scripts/test-rearm-witness-b.js --dir-arm <stagedArmCorpusDir>
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

// Frozen from the prereg (sim-rearm-witness-b).
const STAGED_START = 107734;
const STAGED_END = 107749;
const STAGED_N = 16;
const PILOT_N = 8;
// Rearm-b staged leg, carried: 16 arrivals, 13 supply deaths, 4 Haven
// takes (all second-life), 0 witness takes, 9 supply deaths unconverted.
const RB_STAGED_ARRIVALS = 16;
const RB_SUPPLY_DEATHS = 13;
const RB_HAVEN_TAKES = 4;
const RB_WITNESS_TAKES = 0;
const RB_UNCONVERTED = 9;
// Reserved ranges the staged band must not overlap (rearm-b §4 + this arm §4).
const RESERVED = [
  [107670, 107733, 'Loop B sibling arm hold (this run)'],
  [107533, 107548, 'sim-rearm-b staged band'],
  [107501, 107532, 'Loop A sim-launchsilence-a / journey-endgame-r270'],
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
  let scholarTakes = 0, expeditionEvents = 0, expeditionVolleys = 0, wildSupply = 0;
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
    expeditionEvents += a.expeditionRearmEvents || 0;
    expeditionVolleys += a.expeditionRearmVolleys || 0;
    wildSupply += a.wildSupplyDeaths || 0;
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
    expeditionRearmEvents: expeditionEvents, expeditionRearmVolleys: expeditionVolleys,
    wildSupplyDeaths: wildSupply,
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
// A wild node distinct from Haven (4,4) and from the other live-test nodes.
function wildNode(i) {
  const nodes = [[1, 1], [2, 5], [6, 1], [1, 6], [7, 7], [3, 7], [6, 6], [0, 2]];
  return { x: nodes[i % nodes.length][0], y: nodes[i % nodes.length][1] };
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
  const { Game } = await loadGame({ seed: 7, mode: 'rearm-witness-test', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state.village || {}).roster || []).filter(function (r) { return r && r !== Game.villagerId; });
  check('live: at least 10 living roster villagers to stage with', roster.length >= 10, 'roster=' + roster.length);
  if (roster.length < 10) { console.log('TEST-REARM-WITNESS-B-LIVE: ' + pass + ' passed, ' + fail + ' failed'); return fail === 0; }
  const mdef = (Game.data.monsters || []).find(function (m) { return m.wave === 4; });
  check('live: a wave-4 monster def exists', !!mdef, mdef && mdef.id);
  const v = Game.state.village || {};
  const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);

  // --- Test 1: expedition second-life + wave-4 volley (REARM on) ---
  // Holder dies in the wild with NO witnesses (the witness channel must
  // NOT fire); a gun-less walker steps onto the death node on expedition.
  const h1 = roster[0], t1 = roster[1];
  const holder1 = livePerson(Game, h1), taker1 = livePerson(Game, t1);
  const n1 = wildNode(0);
  check('live T1: staged arrival returns searcaster', stageArrival(Game, h1) === 'searcaster');
  check('live T1: holder gains exactly 1 gun', gunsOf(holder1) === 1, 'guns=' + gunsOf(holder1));
  check('live T1: holder gains exactly 2 cells', cellsOf(holder1) === 2, 'cells=' + cellsOf(holder1));
  const corpse1 = Game.registerDeath({ kind: 'villager', villagerId: h1, name: holder1.name || 'holder', cause: 'combat', witnesses: [] });
  check('live T1: corpse registered', !!corpse1);
  if (corpse1) { corpse1.node = { x: n1.x, y: n1.y }; }
  check('live T1: no death-time take without witnesses (walker still empty)',
    gunsOf(taker1) === 0 && cellsOf(taker1) === 0, 'guns=' + gunsOf(taker1) + ' cells=' + cellsOf(taker1));
  try { if (Game.npcSetNode) Game.npcSetNode(t1, n1.x, n1.y); } catch (e) {}
  const rec1 = Game.villagerRearmExpeditionStep ? Game.villagerRearmExpeditionStep(t1, n1.x, n1.y) : null;
  check('live T1: expedition step takes once', !!rec1, JSON.stringify(rec1 || null));
  check('live T1: take is second-life via the expedition channel',
    !!(rec1 && rec1.kind === 'second-life' && rec1.channel === 'expedition' && rec1.taker === t1),
    JSON.stringify(rec1 || null));
  check('live T1: taker gains exactly 1 gun from the corpse', gunsOf(taker1) === 1, 'guns=' + gunsOf(taker1));
  check('live T1: taker gains exactly 1 cell (corpse supply cap)', cellsOf(taker1) === 1, 'cells=' + cellsOf(taker1));
  check('live T1: taker equips the gun (re-seated by the take)', equippedGun(Game, taker1) === 'searcaster', 'equipped=' + equippedGun(Game, taker1));
  check('live T1: corpse gun is gone', corpseGuns(corpse1) === 0, 'guns=' + corpseGuns(corpse1));
  check('live T1: corpse cells are gone', corpseCells(corpse1) === 0, 'cells=' + corpseCells(corpse1));
  const vol1 = Game.fieldFight(t1, mdef, null, { allies: 1, allyFromStart: true });
  check('live T1: expedition second-life volley fires at wave 4 (shots >= 1)', !!(vol1 && vol1.volley && (vol1.volley.shots || 0) >= 1),
    'volley=' + JSON.stringify(vol1 && vol1.volley));
  check('live T1: the volley spends the corpse cell (ammoLeft 0)', !!(vol1 && vol1.volley && vol1.volley.ammoLeft === 0),
    'volley=' + JSON.stringify(vol1 && vol1.volley));

  // --- Test 2: REARM-off control — the same step takes nothing ---
  delete process.env.REARM_CELLS;
  check('live T2: gate reads off once unset', Game._rearmCellsOn ? Game._rearmCellsOn() === false : false);
  const h2 = roster[2], t2 = roster[3];
  const holder2 = livePerson(Game, h2), taker2 = livePerson(Game, t2);
  const n2 = wildNode(1);
  check('live T2: staged arrival returns searcaster', stageArrival(Game, h2) === 'searcaster');
  check('live T2: holder gains exactly 2 cells', cellsOf(holder2) === 2, 'cells=' + cellsOf(holder2));
  const corpse2 = Game.registerDeath({ kind: 'villager', villagerId: h2, name: holder2.name || 'holder', cause: 'combat', witnesses: [] });
  check('live T2: corpse registered', !!corpse2);
  if (corpse2) { corpse2.node = { x: n2.x, y: n2.y }; }
  try { if (Game.npcSetNode) Game.npcSetNode(t2, n2.x, n2.y); } catch (e) {}
  const rec2 = Game.villagerRearmExpeditionStep ? Game.villagerRearmExpeditionStep(t2, n2.x, n2.y) : 'MISSING';
  check('live T2: expedition step takes nothing (REARM off)', rec2 === null, JSON.stringify(rec2));
  check('live T2: taker gains no gun (REARM off)', gunsOf(taker2) === 0, 'guns=' + gunsOf(taker2));
  check('live T2: taker gains no cells (REARM off)', cellsOf(taker2) === 0, 'cells=' + cellsOf(taker2));
  check('live T2: corpse keeps the gun', corpseGuns(corpse2) === 1, 'guns=' + corpseGuns(corpse2));
  check('live T2: corpse keeps exactly 1 cell (units:1 collapse)', corpseCells(corpse2) === 1, 'cells=' + corpseCells(corpse2));

  // --- Test 3: dry holder takes cells only on the wild node ---
  process.env.REARM_CELLS = '1';
  const h3 = roster[4], dryVid = roster[5];
  const holder3 = livePerson(Game, h3), dry = livePerson(Game, dryVid);
  const n3 = wildNode(2);
  dry.items = dry.items || []; dry.items.push('searcaster'); // dry holder: gun, 0 cells
  try { if (Game.villagerGearUp) Game.villagerGearUp(dryVid, false); } catch (e) {}
  check('live T3: dry holder staged (gun, 0 cells)', gunsOf(dry) === 1 && cellsOf(dry) === 0,
    'guns=' + gunsOf(dry) + ' cells=' + cellsOf(dry));
  check('live T3: staged arrival returns searcaster', stageArrival(Game, h3) === 'searcaster');
  const corpse3 = Game.registerDeath({ kind: 'villager', villagerId: h3, name: holder3.name || 'holder', cause: 'combat', witnesses: [] });
  check('live T3: corpse registered', !!corpse3);
  if (corpse3) { corpse3.node = { x: n3.x, y: n3.y }; }
  try { if (Game.npcSetNode) Game.npcSetNode(dryVid, n3.x, n3.y); } catch (e) {}
  const rec3 = Game.villagerRearmExpeditionStep ? Game.villagerRearmExpeditionStep(dryVid, n3.x, n3.y) : null;
  check('live T3: expedition step takes (dry holder)', !!rec3 && rec3.kind === 'rearm' && rec3.channel === 'expedition',
    JSON.stringify(rec3 || null));
  check('live T3: dry holder gains exactly 1 cell', cellsOf(dry) === 1, 'cells=' + cellsOf(dry));
  check('live T3: dry holder still holds exactly 1 gun', gunsOf(dry) === 1, 'guns=' + gunsOf(dry));
  check('live T3: gun stays on the corpse (cells-only take)', corpseGuns(corpse3) === 1, 'guns=' + corpseGuns(corpse3));

  // --- Test 4: armed holder takes nothing on the wild node ---
  const h4 = roster[6], armedVid = roster[1]; // taker1 re-armed? No: taker1 spent their cell in T1.
  const armed = livePerson(Game, armedVid);
  armed.items = armed.items || [];
  if (cellsOf(armed) === 0) armed.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: 1, kg: 0.4 });
  const n4 = wildNode(3);
  check('live T4: armed walker staged (gun + cells)', gunsOf(armed) === 1 && cellsOf(armed) >= 1,
    'guns=' + gunsOf(armed) + ' cells=' + cellsOf(armed));
  const holder4 = livePerson(Game, h4);
  check('live T4: staged arrival returns searcaster', stageArrival(Game, h4) === 'searcaster');
  const corpse4 = Game.registerDeath({ kind: 'villager', villagerId: h4, name: holder4.name || 'holder', cause: 'combat', witnesses: [] });
  check('live T4: corpse registered', !!corpse4);
  if (corpse4) { corpse4.node = { x: n4.x, y: n4.y }; }
  const cellsBefore4 = cellsOf(armed);
  try { if (Game.npcSetNode) Game.npcSetNode(armedVid, n4.x, n4.y); } catch (e) {}
  const rec4 = Game.villagerRearmExpeditionStep ? Game.villagerRearmExpeditionStep(armedVid, n4.x, n4.y) : 'MISSING';
  check('live T4: expedition step takes nothing (already armed)', rec4 === null, JSON.stringify(rec4));
  check('live T4: armed walker gains no more cells', cellsOf(armed) === cellsBefore4, 'before=' + cellsBefore4 + ' after=' + cellsOf(armed));
  check('live T4: corpse keeps its cell', corpseCells(corpse4) === 1, 'cells=' + corpseCells(corpse4));

  // --- Test 5: no-cells corpse — no take even for a gun-less walker ---
  const h5 = roster[7], glVid = roster[8];
  const n5 = wildNode(4);
  const gl = livePerson(Game, glVid);
  check('live T5: gun-less walker staged', gunsOf(gl) === 0 && cellsOf(gl) === 0,
    'guns=' + gunsOf(gl) + ' cells=' + cellsOf(gl));
  const corpse5 = Game.registerDeath({ kind: 'villager', villagerId: h5, name: (livePerson(Game, h5).name || 'holder'), cause: 'combat', witnesses: [] });
  check('live T5: plain corpse registered', !!corpse5);
  check('live T5: plain corpse holds no cells', corpseCells(corpse5) === 0, 'cells=' + corpseCells(corpse5));
  try { if (Game.npcSetNode) Game.npcSetNode(glVid, n5.x, n5.y); } catch (e) {}
  const rec5 = Game.villagerRearmExpeditionStep ? Game.villagerRearmExpeditionStep(glVid, n5.x, n5.y) : 'MISSING';
  check('live T5: no-cells corpse gives nothing', rec5 === null, JSON.stringify(rec5));
  check('live T5: walker still holds nothing', gunsOf(gl) === 0 && cellsOf(gl) === 0,
    'guns=' + gunsOf(gl) + ' cells=' + cellsOf(gl));

  // --- Test 6: wrong node — a walker one node over sees nothing ---
  const h6 = roster[9];
  const n6 = wildNode(5), n6near = { x: n6.x === 0 ? 1 : n6.x - 1, y: n6.y };
  const holder6 = livePerson(Game, h6);
  check('live T6: staged arrival returns searcaster', stageArrival(Game, h6) === 'searcaster');
  const corpse6 = Game.registerDeath({ kind: 'villager', villagerId: h6, name: holder6.name || 'holder', cause: 'combat', witnesses: [] });
  check('live T6: corpse registered', !!corpse6);
  if (corpse6) { corpse6.node = { x: n6.x, y: n6.y }; }
  // gl (roster[8]) is still gun-less and cell-less: walk them to the NEIGHBOR node.
  try { if (Game.npcSetNode) Game.npcSetNode(glVid, n6near.x, n6near.y); } catch (e) {}
  const rec6 = Game.villagerRearmExpeditionStep ? Game.villagerRearmExpeditionStep(glVid, n6near.x, n6near.y) : 'MISSING';
  check('live T6: wrong-node step takes nothing (perception is the node you stand on)', rec6 === null, JSON.stringify(rec6));
  check('live T6: corpse keeps gun + cell', corpseGuns(corpse6) === 1 && corpseCells(corpse6) === 1,
    'guns=' + corpseGuns(corpse6) + ' cells=' + corpseCells(corpse6));

  // --- Test 7: Haven-node corpse — the expedition step refuses (Haven sweep owns it) ---
  // gl walks the death node itself this time, but the corpse is at Haven.
  if (corpse6) { corpse6.node = { x: hx, y: hy }; }
  try { if (Game.npcSetNode) Game.npcSetNode(glVid, hx, hy); } catch (e) {}
  const rec7 = Game.villagerRearmExpeditionStep ? Game.villagerRearmExpeditionStep(glVid, hx, hy) : 'MISSING';
  check('live T7: Haven-node step takes nothing (expedition channel is wild-only)', rec7 === null, JSON.stringify(rec7));
  check('live T7: corpse keeps gun + cell for the Haven sweep', corpseGuns(corpse6) === 1 && corpseCells(corpse6) === 1,
    'guns=' + corpseGuns(corpse6) + ' cells=' + corpseCells(corpse6));

  // --- Test 8: scholar as walker — excluded, no take ---
  const rec8 = Game.villagerRearmExpeditionStep ? Game.villagerRearmExpeditionStep(Game.villagerId, n2.x, n2.y) : 'MISSING';
  check('live T8: scholar walker takes nothing (scholar has their own corpse-take)', rec8 === null, JSON.stringify(rec8));
  check('live T8: T2 corpse keeps gun + cell', corpseGuns(corpse2) === 1 && corpseCells(corpse2) === 1,
    'guns=' + corpseGuns(corpse2) + ' cells=' + corpseCells(corpse2));

  delete process.env.KILLBUNDLE;
  delete process.env.REARM_CELLS;
  delete process.env.CELLGATE;
  console.log('TEST-REARM-WITNESS-B-LIVE: ' + pass + ' passed, ' + fail + ' failed');
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
    console.log('TEST-REARM-WITNESS-B-CORPUS-CTL: ' + (ok ? 'PASS' : 'FAIL'));
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
    console.log('TEST-REARM-WITNESS-B-CORPUS-ARM: ' + (ok ? 'PASS' : 'FAIL') +
      ' (rearmEvents=' + v.rearmEvents + ' expeditionRearmEvents=' + v.expeditionRearmEvents +
      ' supplyDeaths=' + v.supplyDeaths + ' wildSupplyDeaths=' + v.wildSupplyDeaths +
      ' expeditionRearmVolleys=' + v.expeditionRearmVolleys + ' scholarTakes=' + v.scholarTakes + ')');
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
  // Frozen staged band (fresh — named nowhere before this prereg).
  check('band: 16 contiguous staged seeds', STAGED_END - STAGED_START + 1 === STAGED_N,
    STAGED_START + '-' + STAGED_END);
  check('band: pilot is the first 8 staged seeds', PILOT_N === 8);
  check('band: no overlap with any reserved range',
    RESERVED.every(function (r) { return STAGED_END < r[0] || STAGED_START > r[1]; }),
    JSON.stringify(RESERVED.filter(function (r) { return !(STAGED_END < r[0] || STAGED_START > r[1]); })));
  check('band: fresh — starts above the highest named seed (107669)',
    STAGED_START > 107669, 'start=' + STAGED_START);
  // Carried numbers (rearm-b §2) the prereg's bars rest on.
  check('carry: 16 staged arrivals in rearm-b', RB_STAGED_ARRIVALS === 16);
  check('carry: 13 supply deaths in rearm-b', RB_SUPPLY_DEATHS === 13);
  check('carry: 4 Haven takes in rearm-b', RB_HAVEN_TAKES === 4);
  check('carry: 0 witness takes in rearm-b', RB_WITNESS_TAKES === 0);
  check('carry: 9 supply deaths unconverted in rearm-b', RB_UNCONVERTED === 9);
  check('carry: supply - haven - witness = unconverted', RB_SUPPLY_DEATHS - RB_HAVEN_TAKES - RB_WITNESS_TAKES === RB_UNCONVERTED);
  check('carry: expected pilot supply ≈ 6 (half of 13)', approx(RB_SUPPLY_DEATHS / 2, 6, 0.5));
  // Volley base rate behind the frozen GO bar (12.5% per arrival).
  check('carry: P(>=1 volley | 2 takes) ≈ 23%', approx(1 - Math.pow(0.875, 2), 0.23, 0.03),
    'got ' + (1 - Math.pow(0.875, 2)).toFixed(3));
  check('carry: P(>=1 volley | 4 takes) ≈ 41%', approx(1 - Math.pow(0.875, 4), 0.41, 0.03),
    'got ' + (1 - Math.pow(0.875, 4)).toFixed(3));
  // Presence: the lever code the driver gates on.
  let corpsesSrc = '';
  try { corpsesSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'corpses.js'), 'utf8'); } catch (e) {}
  check('presence: REARM_CELLS env gate in corpses.js', /REARM_CELLS/.test(corpsesSrc));
  check('presence: villagerRearmFromCorpse in corpses.js', /villagerRearmFromCorpse/.test(corpsesSrc));
  check('presence: villagerRearmWitnessTake in corpses.js', /villagerRearmWitnessTake/.test(corpsesSrc));
  check('presence: villagerRearmHavenSweep in corpses.js', /villagerRearmHavenSweep/.test(corpsesSrc));
  check('presence: villagerRearmExpeditionStep in corpses.js', /villagerRearmExpeditionStep/.test(corpsesSrc));
  check('presence: expedition channel string in corpses.js', /'expedition'/.test(corpsesSrc));
  let agencySrc = '';
  try { agencySrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8'); } catch (e) {}
  check('presence: expedition hook in expeditionLeg (villager-agency.js)',
    /villagerRearmExpeditionStep\(vid, nx, ny\)/.test(agencySrc));
  let objSrc = '';
  try { objSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-objectives.js'), 'utf8'); } catch (e) {}
  check('presence: expedition hook in objAwayStep (villager-objectives.js)',
    /villagerRearmExpeditionStep\(rid, nx, ny\)/.test(objSrc));
  check('presence: objAwayStep hook sits beside mapmemNoticeNode',
    /mapmemNoticeNode\(rid, nx, ny\)[\s\S]{0,800}villagerRearmExpeditionStep\(rid, nx, ny\)/.test(objSrc));
  // Driver + analyzer exports the instrument needs.
  check('driver: stageFirstKillLoot exported', typeof driver.stageFirstKillLoot === 'function');
  check('driver: REARM_PRESENT requires the expedition step',
    (function () {
      const src = fs.readFileSync(path.join(REPO, 'scripts', 'killlootbundle-driver-a.js'), 'utf8');
      return /villagerRearmExpeditionStep/.test(src);
    })());
  check('analyzer: judgeRearmWitnessCompare exported', typeof analyzer.judgeRearmWitnessCompare === 'function');
  check('analyzer: analyzeSeed carries expedition fields',
    (function () {
      const s = analyzer.analyzeSeed({ seed: 1, mode: 'arm', gameDays: 150, endReason: 'survived',
        contestEvents: [], prizeEvents: [], grantEvents: [],
        killLootEvents: [{ day: 71, vid: 'amina', dropId: 'searcaster', gains: [{ holder: 'amina', gunsGained: 1, cellsGained: 2, cellsAfter: 2 }] }],
        volleyEvents: [],
        rearmTakeEvents: [{ day: 85, taker: 'bob', corpseVid: 'amina', kind: 'second-life', gun: true, cells: 1, channel: 'expedition' }],
        corpseTakeEvents: [], v4gunLoc: [], deaths: [{ day: 85, who: 'amina', cause: 'monster' }],
        supplyCorpseRows: [{ day: 85, corpseVid: 'amina', node: { x: 1, y: 1 }, cells: 1 }],
        havenNode: { x: 4, y: 4 }, instrumentErrors: [] });
      return s.expeditionRearmEvents === 1 && s.wildSupplyDeaths === 1 && s.supplyDeaths === 1;
    })());
  console.log('TEST-REARM-WITNESS-B: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { STAGED_START: STAGED_START, STAGED_END: STAGED_END, STAGED_N: STAGED_N,
  PILOT_N: PILOT_N, RESERVED: RESERVED, validateCorpus: validateCorpus };
