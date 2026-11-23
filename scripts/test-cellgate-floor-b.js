// test-cellgate-floor-b.js — arm sim-cellgate-floor-b: CELLGATE_FLOOR
// (sim-findings.md line 2716, [claimed]): CELLGATE holds every
// kill-loot volley below wave 4, and a kill-loot holder's fights are
// almost all waves 1-3 (100 of 102 staged fights, killbundle-b §3).
// The lever: CELLGATE_FLOOR=N moves the hold's wave floor (default 4
// = current behavior when unset; CELLGATE=1 still required). No
// default flip in this arm — this judges the floor; the flip is a
// follow-up decision.
//   node scripts/test-cellgate-floor-b.js            (pre-run checks:
//       frozen bands + derivation arithmetic from the killbundle
//       staged corpus + instrument exports)
//   node scripts/test-cellgate-floor-b.js --live   (live field-fight
//       proof on the harness: a searcaster lead FIRES at wave 3 with
//       CELLGATE_FLOOR=3 and HOLDS at wave 3 with the floor unset;
//       the observable effect, not just green assertions —
//       local-proof-of-effect: the proof artifact IS a wave-3 volley)
//   node scripts/test-cellgate-floor-b.js --dir-ctl <stagedCtlDir>
//       corpus validation: 16 files, floor 4, mode arm, KILLBUNDLE
//       on, STAGE_SEAR on, one shared anchor, policySha match,
//       0 instrument errors, 16/16 bundled arrivals.
//   node scripts/test-cellgate-floor-b.js --dir-arm <stagedArmDir>
//       same, floor 3.
// Reads only; never writes into the repo (live mode runs the harness
// in-memory only).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'killlootbundle-driver-a'));
const { validateCorpus } = require(path.join(REPO, 'scripts', 'test-killbundle-b'));
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { ammoCountOf } = require(path.join(REPO, 'scripts', 'gunrate-driver-a'));

// Frozen from the prereg (sim-cellgate-floor-b).
// Staged band: the killbundle-b staged subset, REUSED BY DESIGN
// (same staged seeds, same forced arrivals — the only difference
// between the two legs is the CELLGATE floor).
const STAGED_START = 107533;
const STAGED_END = 107548;
const STAGED_N = 16;
const MATCHED_START = 107533;
const MATCHED_END = 107581;
// Reserved ranges the staged band must not overlap (killbundle-b §4).
const RESERVED = [
  [107501, 107516, 'journey-endgame-r270 (107501-107508) / Loop A original'],
  [107517, 107532, 'Loop A sim-launchsilence-a (moved band)'],
  [107471, 107494, 'Loop B gateavoid-doorrich-b screen'],
  [107313, 107320, 'sim-killrate-a'],
  [107261, 107268, 'killlootbundle pilot'],
  [107281, 107296, 'killloot16'],
];
// Derivation from the killbundle-b staged corpus (read from
// evidence/2026-11-21/perseed-killbundle-b-stage/*.json before
// freezing — per-holder volley chronology, day-ordered):
// 14 wave-3 fights across 8 holders; 7 holders reach their FIRST
// wave-3 fight while loaded (ammoLeft 2, 0 shots — CELLGATE-held):
// 107535 (d42), 107536 (d34), 107538 (d33), 107539 Emma (d27),
// 107540 (d39), 107544 (d39), 107546 (d33). The 8th holder with a
// wave-3 fight, Caleb Jones 107542, has his only wave-3 fight on
// d106 — AFTER firing at wave 5 on d100 (ammoLeft 0) — so at floor 3
// he still fires once, at wave 5 as before. Upstream of each first
// wave-3 fight the game state is identical on both legs (a hold is
// effect-identical at either floor; only the log line's wave number
// differs), so each of the 7 fires at their first wave-3 fight and
// Caleb fires at wave 5: MECHANISTIC EXPECTATION 8 volleys / 16
// arrivals = 50% fire rate (7 of them wave-3 volleys), vs the floor-4
// control's 2/16 = 12.5% (both wave 4+). The GO bar sits below the
// mechanistic expectation to leave margin for downstream divergence
// after the first wave-3 firing changes a fight's outcome.
const LOADED_FIRST_W3 = 7;
const EXPECTED_ARMED_VOLLEYS = 8;
const EXPECTED_ARMED_W3_VOLLEYS = 7;
const EXPECTED_ARMED_RATE = 0.5;
const GO_MIN_VOLLEYS = 5; // armed-leg kill-loot volleys >= 5/16 (31.25%)
const GO_MIN_W3_VOLLEYS = 3; // of those, wave-3 kill-loot volleys >= 3
const CONTROL_VOLLEYS = 2; // floor-4 staged reproduction of killbundle-b
const PILOT_N = 8; // first 8 staged seeds 107533-107540
const PILOT_EXPECTED_W3 = 5; // 107535, 107536, 107538, 107539, 107540

function validateStagedCorpus(dir, floor) {
  const v = validateCorpus(dir, { expectStage: true });
  const files = fs.readdirSync(dir).sort().filter(function (f) {
    return /killlootbundle-a-s\d+-killlootbundle-a-arm\.json$/.test(f);
  });
  const floors = {};
  let w3KlVolleys = 0, w4pKlVolleys = 0;
  files.forEach(function (f) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    floors[c.cellgateFloor] = (floors[c.cellgateFloor] || 0) + 1;
    const kl = (c.killLootEvents || []).filter(function (e) { return e.dropId === 'searcaster'; });
    const holders = {};
    kl.forEach(function (e) {
      const g = (e.gains || []).filter(function (x) { return x.gunsGained > 0; })[0];
      holders[g ? g.holder : e.vid] = true;
    });
    (c.volleyEvents || []).forEach(function (e) {
      if (e.rwId === 'searcaster' && (e.shots || 0) > 0 && !!holders[e.vid]) {
        if (e.wave === 3) w3KlVolleys++;
        else if (e.wave >= 4) w4pKlVolleys++;
      }
    });
  });
  return Object.assign(v, { floors: floors, w3KlVolleys: w3KlVolleys, w4pKlVolleys: w4pKlVolleys });
}

function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  return ((Game.data.villagers || []).find(function (x) { return x.id === vid; }) ||
    (Game.data.background_survivors || []).find(function (x) { return x.id === vid; }) || {});
}
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
  try { Game.state.village.ammoCraft = Game.state.village.ammoCraft || {}; delete Game.state.village.ammoCraft[p.id]; } catch (e) {}
  try { Game.state.village.arrowCraftCd = Game.state.village.arrowCraftCd || {}; delete Game.state.village.arrowCraftCd[p.id]; } catch (e) {}
}
function setCellgate(on) { if (on) process.env.CELLGATE = '1'; else delete process.env.CELLGATE; }
function setFloor(v) { if (v === null || v === undefined) delete process.env.CELLGATE_FLOOR; else process.env.CELLGATE_FLOOR = String(v); }
// Gun shot lines: searvoice (Nov 22) made the gun's hit line
// "  the Searcaster fires — ..." and its miss line "  fires wide — ..."
// — the old test-cellgate-a loosedCount (/^  loosed/) counts ZERO of
// them (that test is 10/12 on this base for exactly this stale regex;
// the game spends correctly). Count gun-verb lines instead.
function gunShotLines(rec) {
  return (rec && rec.log || []).filter(function (s) {
    return /^  the .* fires —/.test(String(s)) || /^  fires wide/.test(String(s));
  }).length;
}

async function liveTests() {
  let pass = 0, fail = 0;
  function check(name, cond, extra) {
    if (cond) { pass++; console.log('ok   ' + name); }
    else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
  }
  const { Game } = await loadGame({ seed: 7, mode: 'cellgate-floor-test', fullTelemetry: false });
  await quietLog(async function () { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(function (id) { return id !== Game.villagerId; });
  const vid = roster[0];
  const p = personOf(Game, vid);
  check('live: a living roster villager exists', !!vid && !!p);
  const moth = (Game.data.monsters || []).find(function (m) { return m.id === 'mirrormoth'; });
  const stag = (Game.data.monsters || []).find(function (m) { return m.id === 'mirror_stag'; });
  const spool = (Game.data.monsters || []).find(function (m) { return m.id === 'spool'; });
  const eulogy = (Game.data.monsters || []).find(function (m) { return m.id === 'eulogy'; });
  check('live: mirrormoth fixture is wave 1', moth && (moth.wave || 1) === 1);
  check('live: mirror_stag fixture is wave 2', stag && (stag.wave || 1) === 2);
  check('live: spool fixture is wave 3', spool && (spool.wave || 1) === 3);
  check('live: eulogy fixture is wave 4', eulogy && (eulogy.wave || 1) === 4);
  function armSearcaster(cells) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    if (cells > 0) p.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: cells, kg: 0.4 });
    Game.villagerGearUp(vid, true);
  }
  function fight(mdef) {
    try { return Game.fieldFight(vid, mdef, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); return null; }
  }
  function holdLine(rec, waveN) {
    return (rec && rec.log || []).some(function (s) {
      return /holds the Searcaster/i.test(String(s)) && String(s).indexOf('below wave ' + waveN) !== -1;
    });
  }
  function anyHoldLine(rec) {
    return (rec && rec.log || []).some(function (s) { return /holds the Searcaster/i.test(String(s)); });
  }
  try {
    // (a) Default floor: wave 3 HOLDS (control identity — the
    // killbundle-b staged corpus: 14 wave-3 fights, 0 shots).
    setCellgate(true); setFloor(null);
    armSearcaster(2);
    const recH = fight(spool);
    check('live: floor unset holds at wave 3 (0 shots)', recH && recH.volley && recH.volley.shots === 0, JSON.stringify(recH && recH.volley));
    check('live: floor unset keeps both cells at wave 3', recH && recH.volley && recH.volley.ammoLeft === 2 && ammoCountOf(p.items, 'fusion_cell') === 2);
    check('live: floor-unset hold line names wave 4', holdLine(recH, 4), JSON.stringify((recH && recH.log) || []));

    // (b) THE OBSERVABLE EFFECT: floor 3 FIRES at wave 3.
    setCellgate(true); setFloor(3);
    armSearcaster(2);
    const cellsBefore = ammoCountOf(p.items, 'fusion_cell');
    const recF = fight(spool);
    const spent = cellsBefore - ammoCountOf(p.items, 'fusion_cell');
    check('live: floor 3 FIRES at wave 3 (shots > 0) — the effect itself',
      recF && recF.volley && recF.volley.shots > 0, JSON.stringify(recF && recF.volley));
    check('live: floor-3 wave-3 volley spends cells per gun-verb line',
      recF && spent >= 1 && spent === gunShotLines(recF),
      'spent=' + spent + ' gunLines=' + gunShotLines(recF) + ' planned=' + (recF && recF.volley && recF.volley.shots));
    check('live: floor-3 wave-3 volley spends exactly its loosed shots (cells 2 -> ' + (2 - spent) + ')',
      recF && spent >= 1 && spent <= 2, 'spent=' + spent);
    check('live: floor-3 wave-3 fire has NO hold line', recF && !anyHoldLine(recF),
      JSON.stringify((recF && recF.log) || []));

    // (c) Floor 3 still holds below wave 3 — the floor moved, the
    // gate did not vanish.
    armSearcaster(2);
    const recW2 = fight(stag);
    check('live: floor 3 holds at wave 2 (0 shots)', recW2 && recW2.volley && recW2.volley.shots === 0, JSON.stringify(recW2 && recW2.volley));
    check('live: floor-3 wave-2 hold line names wave 3', holdLine(recW2, 3), JSON.stringify((recW2 && recW2.log) || []));
    armSearcaster(2);
    const recW1 = fight(moth);
    check('live: floor 3 holds at wave 1 (0 shots)', recW1 && recW1.volley && recW1.volley.shots === 0, JSON.stringify(recW1 && recW1.volley));
    check('live: floor-3 wave-1 hold line names wave 3', holdLine(recW1, 3));

    // (d) Floor 3 fires at wave 4+ exactly as floor 4 did.
    armSearcaster(2);
    const recW4 = fight(eulogy);
    check('live: floor 3 fires at wave 4+ (shots > 0)', recW4 && recW4.volley && recW4.volley.shots > 0, JSON.stringify(recW4 && recW4.volley));

    // (e) Invalid floors fall back to 4 (never silently arm wave 1).
    setFloor(9);
    armSearcaster(2);
    const recBad = fight(spool);
    check('live: CELLGATE_FLOOR=9 falls back to floor 4 (wave 3 holds)', recBad && recBad.volley && recBad.volley.shots === 0, JSON.stringify(recBad && recBad.volley));
    check('live: CELLGATE_FLOOR=9 hold line names wave 4', holdLine(recBad, 4));
    setFloor(0);
    armSearcaster(2);
    const recZero = fight(spool);
    check('live: CELLGATE_FLOOR=0 falls back to floor 4 (wave 3 holds)', recZero && recZero.volley && recZero.volley.shots === 0);

    // (f) The floor alone does nothing without the gate.
    setCellgate(false); setFloor(3);
    armSearcaster(2);
    const recOff = fight(spool);
    check('live: floor 3 + CELLGATE unset still fires at wave 3 (gate off)', recOff && recOff.volley && recOff.volley.shots > 0, JSON.stringify(recOff && recOff.volley));

    // (g) A bow is untouched by the floor at wave 3.
    setCellgate(true); setFloor(3);
    resetVillager(Game, p);
    p.items = [{ itemId: 'crude_bow', name: 'Crude bow', units: 1, kg: 1.0 },
      { itemId: 'arrow', name: 'Arrow', units: 5, kg: 0.1 }];
    Game.villagerGearUp(vid, true);
    const recBow = fight(spool);
    check('live: bow volleys at wave 3 with floor 3 (gate is searcaster-only)',
      recBow && recBow.volley && recBow.volley.shots > 0, JSON.stringify(recBow && recBow.volley));

    // (h) A cell-less searcaster still says "no fusion cells" at
    // wave 3 with floor 3 — the hold needs cells to save.
    setCellgate(true); setFloor(3);
    armSearcaster(0);
    const rec0 = fight(spool);
    check('live: 0-cell searcaster volleys 0 shots at wave 3 (floor 3)',
      rec0 && rec0.volley && rec0.volley.shots === 0, JSON.stringify(rec0 && rec0.volley));
    check('live: 0-cell wave-3 volley names fusion cells (not the hold line)',
      rec0 && (rec0.log || []).some(function (s) { return /no fusion cells/i.test(String(s)); }) && !anyHoldLine(rec0),
      JSON.stringify((rec0 && rec0.log) || []));
  } finally {
    setCellgate(false); setFloor(null);
  }
  console.log('TEST-CELLGATE-FLOOR-B-LIVE: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

if (require.main === module) (async function () {
  const ctlIdx = process.argv.indexOf('--dir-ctl');
  const armIdx = process.argv.indexOf('--dir-arm');
  if (ctlIdx !== -1 || armIdx !== -1) {
    const isArm = armIdx !== -1;
    const dir = process.argv[(isArm ? armIdx : ctlIdx) + 1];
    const floor = isArm ? 3 : 4;
    const v = validateStagedCorpus(dir, floor);
    console.log(JSON.stringify(v, null, 2));
    const ok = v.files === STAGED_N && v.instrumentErrors === 0
      && v.missingAnchor === 0 && v.policyShaMismatches === 0
      && Object.keys(v.anchors).length === 1
      && v.wrongMode === 0 && v.bundleOff === 0 && v.stageWrong === 0
      && v.seeds.length === STAGED_N
      && v.seeds.every(function (s, i) { return s === STAGED_START + i; })
      && v.klArrivals === STAGED_N && v.klBundled === STAGED_N && v.klDry === 0
      && Object.keys(v.floors).length === 1 && v.floors[floor] === STAGED_N;
    console.log('TEST-CELLGATE-FLOOR-B-CORPUS-' + (isArm ? 'ARM' : 'CTL') + ': ' + (ok ? 'PASS' : 'FAIL'));
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
  // Frozen staged band (reuses the killbundle-b staged subset BY DESIGN).
  check('band: 16 contiguous staged seeds', STAGED_END - STAGED_START + 1 === STAGED_N,
    STAGED_START + '-' + STAGED_END);
  check('band: staged subset of the killarrive matched band (no new band)',
    STAGED_START >= MATCHED_START && STAGED_END <= MATCHED_END);
  check('band: no overlap with any reserved range',
    RESERVED.every(function (r) { return STAGED_END < r[0] || STAGED_START > r[1]; }),
    JSON.stringify(RESERVED.filter(function (r) { return !(STAGED_END < r[0] || STAGED_START > r[1]); })));
  // Derivation from the killbundle-b staged corpus (frozen inputs).
  check('derive: 7 holders reach a loaded first wave-3 fight', LOADED_FIRST_W3 === 7);
  check('derive: mechanistic expectation 8 armed volleys (7 wave-3 + Caleb wave-5)',
    EXPECTED_ARMED_VOLLEYS === 8 && EXPECTED_ARMED_W3_VOLLEYS === 7);
  check('derive: expected armed fire rate 50% vs control 12.5%',
    approx(EXPECTED_ARMED_RATE, 0.5) && approx(CONTROL_VOLLEYS / STAGED_N, 0.125));
  check('derive: GO bar 5/16 sits below the mechanistic 8', GO_MIN_VOLLEYS === 5 && GO_MIN_VOLLEYS < EXPECTED_ARMED_VOLLEYS);
  check('derive: wave-3 GO bar 3 sits below the mechanistic 7', GO_MIN_W3_VOLLEYS === 3 && GO_MIN_W3_VOLLEYS < EXPECTED_ARMED_W3_VOLLEYS);
  check('derive: pilot (first 8 staged seeds) expects 5 wave-3 volleys', PILOT_EXPECTED_W3 === 5 && PILOT_N === 8);
  // Instrument: driver exports the staged forcer + records the floor.
  check('driver: stageFirstKillLoot exported',
    typeof driver.stageFirstKillLoot === 'function');
  const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'killlootbundle-driver-a.js'), 'utf8');
  check('driver: records cellgateFloor per seed file', /cellgateFloor/.test(driverSrc));
  check('driver: refuses an out-of-range CELLGATE_FLOOR (no silent fallback)',
    /CELLGATE_FLOOR must be an integer 1\.\.5/.test(driverSrc));
  const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
  check('game: fieldFights reads CELLGATE_FLOOR', /CELLGATE_FLOOR/.test(ffSrc));
  check('game: hold compares wave against the live floor', /wave < _cgFloor/.test(ffSrc));
  check('game: hold line names the live floor', /below wave ' \+ _cgFloor/.test(ffSrc));
  check('game: floor defaults to 4 (current behavior when unset)', /var _cgFloor = 4;/.test(ffSrc));
  check('game: floor clamped to 1..5', /_cgF >= 1 && _cgF <= 5/.test(ffSrc));
  console.log('TEST-CELLGATE-FLOOR-B: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { STAGED_START: STAGED_START, STAGED_END: STAGED_END, STAGED_N: STAGED_N,
  RESERVED: RESERVED, LOADED_FIRST_W3: LOADED_FIRST_W3,
  EXPECTED_ARMED_VOLLEYS: EXPECTED_ARMED_VOLLEYS,
  EXPECTED_ARMED_W3_VOLLEYS: EXPECTED_ARMED_W3_VOLLEYS,
  GO_MIN_VOLLEYS: GO_MIN_VOLLEYS, GO_MIN_W3_VOLLEYS: GO_MIN_W3_VOLLEYS,
  CONTROL_VOLLEYS: CONTROL_VOLLEYS, PILOT_N: PILOT_N,
  PILOT_EXPECTED_W3: PILOT_EXPECTED_W3, validateStagedCorpus: validateStagedCorpus };
