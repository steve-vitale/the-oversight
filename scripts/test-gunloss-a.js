#!/usr/bin/env node
// scripts/test-gunloss-a.js — proof test, arm sim-gunloss-a (omar gun-loss tracer).
//
// Proves the gun-loss instrument (scripts/gunloss-recorder-a.js):
// the splice tripwire catches a staged pack removal and names the
// caller; the reassignment watch catches `person.items = []` and names
// the caller; the mantle transfer preserves a holder's searcaster +
// cells live (the transfer the cellcheck refutation relies on); the
// fieldFight named wrap sees a real volley spend; install + uninstall
// restores every wrapped function and Array.prototype.splice
// (neutrality — the det-gate run proves it at scale, this proves the
// mechanism in-process); and installing with a NON-ROSTER target
// returns at once with found:false (regression: the first build called
// Game.getPerson, which hydrates background seeds — hydrateSeed draws
// RNG and calls autoEquip, which the recorder wraps, so a snapshot
// re-entered getPerson -> hydrateSeed -> autoEquip forever; the
// recorder now reads data.villagers directly and never hydrates).
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged holder
// is a geared wave-4 hunter — a searcaster with 2 cells, equipped —
// the same kit omar carried on seed 107369. The recorder target is the
// staged holder (install takes the target as an argument; the driver
// passes omar_farouk, the judged target).
//
// Usage: GUNRATE=1 CELLGATE=1 node scripts/test-gunloss-a.js
// Exit 0 = all checks pass. Exit 1 = a failure. Writes NOTHING into
// the repo; prints PASS/FAIL lines to stdout. Harness: shared
// sim-harness (seeded Math.random BEFORE eval, full src/js list in
// index.html order minus DOM-only files).
'use strict';
process.env.GUNRATE = '1';
process.env.CELLGATE = '1';
delete process.env.KILLBUNDLE;
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { ammoCountOf } = require('./cellcheck-driver-a');
const { gunlossGearSnap, gunlossScholarSnap, gunlossDelta,
  installGunlossRecorder } = require('./gunloss-recorder-a');
const { attributeLoss, lossPieces, packPieces } = require('./analyze-gunloss-a');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  return ((Game.data.villagers || []).find(x => x.id === vid) ||
    (Game.data.background_survivors || []).find(x => x.id === vid) || {});
}
// Staged removers (named helpers so the tripwire/watch stacks name them).
function stagedSpliceRemoval(Game, p) {
  for (let i = 0; i < p.items.length; i++) {
    const e = p.items[i];
    const id = (typeof e === 'string') ? e : (e && (e.itemId || e.id));
    if (id === 'searcaster') { p.items.splice(i, 1); return true; }
  }
  return false;
}
function stagedWipe(Game, p) { p.items = []; }

async function main() {
  const { Game } = await loadGame({ seed: 7, mode: 'gunloss-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const p = personOf(Game, vid);
  console.log('holder=' + vid + ' roster=' + roster.length);

  // ---- 1. helpers read staged gear ----
  p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 },
    { itemId: 'fusion_cell', name: 'Fusion cell', units: 2, kg: 0.4 }];
  p.stashed = [];
  Game.villagerGearUp(vid, true);
  const snap = gunlossGearSnap(Game, vid);
  check('gearSnap: holder found, gun 1, cells 2', snap.found && snap.gun === 1 && snap.cells === 2,
    JSON.stringify({ found: snap.found, gun: snap.gun, cells: snap.cells }));
  check('gearSnap: searcaster is the equipped ranged weapon', snap.gunEquipped === 'searcaster',
    'gunEquipped=' + snap.gunEquipped);
  check('gearSnap: the carried fusion_cell is worn as a hat (autoEquip head fallback)',
    snap.equipped.head === 'fusion_cell',
    'head=' + JSON.stringify(snap.equipped.head));
  const sSnap = gunlossScholarSnap(Game);
  check('scholarSnap: scholar holds no gun/cells at staging', sSnap.gunInv === 0 && sSnap.cells === 0 && !sSnap.gunEq);

  // ---- 2. install the recorder (target = staged holder); capture originals ----
  const origSplice = Array.prototype.splice;
  const origMantle = Game.mantleBecome;
  const origFieldFight = Game.fieldFight;
  const origAutoEquip = (globalThis.Scattering && globalThis.Scattering.equipment || {}).autoEquip;
  const events = [];
  const errors = [];
  const rec = installGunlossRecorder(Game, events, errors, vid);
  check('recorder installs with 0 install errors', errors.length === 0, errors.join('; '));
  check('recorder wraps mantleBecome + fieldFight', Game.mantleBecome !== origMantle && Game.fieldFight !== origFieldFight);
  check('recorder patches Array.prototype.splice', Array.prototype.splice !== origSplice);

  // ---- 3. tripwire catches a staged splice removal, names the caller ----
  const removed = stagedSpliceRemoval(Game, p);
  check('staged splice removes the searcaster', removed === true && ammoCountOf(p.items, 'searcaster') === 0);
  const spliceEvs = events.filter(function (e) { return e.kind === 'splice'; });
  check('tripwire records exactly 1 splice event', spliceEvs.length === 1, 'n=' + spliceEvs.length);
  check('tripwire names stagedSpliceRemoval in the stack',
    spliceEvs.length === 1 && /stagedSpliceRemoval/.test(String(spliceEvs[0].stack)),
    spliceEvs.length ? spliceEvs[0].stack : 'no event');
  check('tripwire before/after: gun 1->0, cells stay 2',
    spliceEvs.length === 1 && spliceEvs[0].before.gun === 1 && spliceEvs[0].after.gun === 0 &&
    spliceEvs[0].before.cells === 2 && spliceEvs[0].after.cells === 2,
    JSON.stringify(spliceEvs[0] && { before: spliceEvs[0].before, after: spliceEvs[0].after }));

  // ---- 4. reassignment watch catches `person.items = []`, names the caller ----
  p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 },
    { itemId: 'fusion_cell', name: 'Fusion cell', units: 2, kg: 0.4 }];
  Game.villagerGearUp(vid, true);
  stagedWipe(Game, p);
  const reEvs = events.filter(function (e) { return e.kind === 'reassign' && e.label === vid && e.prop === 'items'; });
  const wipeEvs = reEvs.filter(function (e) { return /stagedWipe/.test(String(e.stack)); });
  check('watch records the staged wipe', wipeEvs.length === 1, 'reassign=' + reEvs.length + ' wipe=' + wipeEvs.length);
  check('watch before/after: gun 1->0, cells 2->0',
    wipeEvs.length === 1 && wipeEvs[0].before.gun === 1 && wipeEvs[0].after.gun === 0 &&
    wipeEvs[0].before.cells === 2 && wipeEvs[0].after.cells === 0,
    JSON.stringify(wipeEvs[0] && { before: wipeEvs[0].before, after: wipeEvs[0].after }));

  // ---- 5. fieldFight named wrap sees a real volley spend ----
  p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 },
    { itemId: 'fusion_cell', name: 'Fusion cell', units: 2, kg: 0.4 }];
  p.stashed = [];
  Game.villagerGearUp(vid, true);
  const mdef = (Game.data.monsters || []).find(function (m) { return m.id === 'eulogy'; }) || (Game.data.monsters || [])[0];
  let fightRec = null;
  try { fightRec = Game.fieldFight(vid, mdef, null, { allies: 1 }); } catch (e) { console.log('fieldFight error: ' + e.message); }
  const ffEvs = events.filter(function (e) { return e.kind === 'wrap' && e.fn === 'fieldFight'; });
  check('fieldFight wrap records the volley spend (delta-only row)',
    ffEvs.length >= 1 && ffEvs.some(function (e) { return (e.delta.cells || 0) < 0; }),
    'ffEvs=' + ffEvs.length + ' ' + JSON.stringify(ffEvs.map(function (e) { return e.delta; })));
  check('volley spends exactly its shots in cells',
    fightRec && fightRec.volley && ammoCountOf(p.items, 'fusion_cell') === 2 - fightRec.volley.shots,
    'left=' + ammoCountOf(p.items, 'fusion_cell') + ' shots=' + (fightRec && fightRec.volley && fightRec.volley.shots));

  // ---- 6. neutrality: uninstall restores everything ----
  const eventsBefore = events.length;
  rec.uninstall();
  check('uninstall restores Array.prototype.splice', Array.prototype.splice === origSplice);
  check('uninstall restores Game.mantleBecome + Game.fieldFight',
    Game.mantleBecome === origMantle && Game.fieldFight === origFieldFight);
  check('uninstall restores Scattering.equipment.autoEquip',
    (globalThis.Scattering && globalThis.Scattering.equipment || {}).autoEquip === origAutoEquip);
  p.items = p.items || [];
  p.items.push({ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 });
  p.items.splice(0, 1);
  check('no events recorded after uninstall', events.length === eventsBefore, 'before=' + eventsBefore + ' after=' + events.length);
  check('recorder raised 0 errors across the test', errors.length === 0, errors.join('; '));
  check('callCounts tally saw the named calls',
    (rec.callCounts.mantleBecome || 0) >= 0 && (rec.callCounts.fieldFight || 0) >= 1,
    JSON.stringify(rec.callCounts));

  // ---- 7. mantle transfer preserves gear live (fresh install, target = successor) ----
  // Use the second roster villager, fresh (the first may be hurt/dead
  // from the §5 fight — the mantle needs a living successor).
  const vid2 = roster[1] || roster[0];
  const p2 = personOf(Game, vid2);
  const events2 = [];
  const errors2 = [];
  const rec2 = installGunlossRecorder(Game, events2, errors2, vid2);
  check('second install: 0 install errors', errors2.length === 0, errors2.join('; '));
  p2.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0, alienLoot: true, alienEffectHidden: true },
    { itemId: 'fusion_cell', name: 'Fusion cell', units: 2, kg: 0.4 }];
  p2.stashed = [{ itemId: 'stone_knife', name: 'Stone knife', units: 1, kg: 0.3 }];
  Game.villagerGearUp(vid2, true);
  const preMantle = gunlossGearSnap(Game, vid2);
  check('mantle staging: holder equipped searcaster + 2 cells',
    preMantle.gun === 1 && preMantle.cells === 2 && preMantle.gunEquipped === 'searcaster',
    JSON.stringify({ gun: preMantle.gun, cells: preMantle.cells, gunEq: preMantle.gunEquipped }));
  const oldScholar = Game.villagerId;
  let mantOk = false;
  try { mantOk = Game.mantleBecome(oldScholar, vid2); } catch (e) { console.log('mantleBecome error: ' + e.message); }
  check('mantleBecome returns true', mantOk === true, 'mantOk=' + mantOk);
  const postScholar = gunlossScholarSnap(Game);
  check('mantle: gun lands in scholar.equipped.ranged', postScholar.gunEq === 'searcaster',
    'gunEq=' + postScholar.gunEq + ' equipped=' + JSON.stringify(postScholar.equipped));
  check('mantle: 1 cell lands worn as scholar.equipped.head (the hat)',
    postScholar.equipped.head === 'fusion_cell' && postScholar.cellsEq === 1,
    'equipped=' + JSON.stringify(postScholar.equipped) + ' cellsEq=' + postScholar.cellsEq);
  check('mantle: scholar inventory holds no cells (they left the pack for slots)',
    postScholar.cellsInv === 0, 'cellsInv=' + postScholar.cellsInv + ' items=' + JSON.stringify(postScholar.items));
  check('mantle: scholar cells total is 1 (2-stack collapsed to one worn unit)',
    postScholar.cells === 1, 'cells=' + postScholar.cells);
  const postHolder = gunlossGearSnap(Game, vid2);
  check('mantle: villager record wiped (gun 0, cells 0)', postHolder.gun === 0 && postHolder.cells === 0,
    JSON.stringify({ gun: postHolder.gun, cells: postHolder.cells }));
  const mantEvs = events2.filter(function (e) { return e.kind === 'wrap' && e.fn === 'mantleBecome'; });
  check('mantle wrap records the transfer (person -1/-2, scholar +1/+1)',
    mantEvs.length >= 1 && mantEvs.some(function (e) {
      return e.delta.gun === -1 && e.delta.cells === -2 && e.delta.scholarGun === 1 && e.delta.scholarCells === 1;
    }), JSON.stringify(mantEvs.map(function (e) { return e.delta; })));
  const mantPieces = mantEvs.length ? lossPieces(mantEvs[mantEvs.length - 1]) : null;
  check('analyzer: mantle net loss is 0 guns, 1 cell (the collapsed unit)',
    !!mantPieces && mantPieces.gun === 0 && mantPieces.cells === 1, JSON.stringify(mantPieces));
  const mantPack = mantEvs.length ? packPieces(mantEvs[mantEvs.length - 1]) : null;
  check('analyzer: mantle empties the pack of gun + 2 cells (pack pieces 1/2)',
    !!mantPack && mantPack.gun === 1 && mantPack.cells === 2, JSON.stringify(mantPack));
  const mantAttr = attributeLoss(mantEvs, mantEvs.length ? mantEvs[mantEvs.length - 1].day : 0);
  check('analyzer: mantle transfer attributes (one call emptied the pack)',
    mantAttr.verdict === 'ATTRIBUTED' && mantAttr.fn === 'mantleBecome', JSON.stringify(mantAttr));
  check('analyzer: attribution destination names the head slot',
    mantAttr.destination && mantAttr.destination.scholarEquippedAfter && mantAttr.destination.scholarEquippedAfter.head === 'fusion_cell',
    JSON.stringify(mantAttr.destination));
  // Daily census row shape (from the second install).
  const row = rec2.census();
  check('census row: day + scholarId + omar + scholar present',
    row && typeof row.day === 'number' && ('scholarId' in row) && row.omar && row.scholar,
    JSON.stringify(Object.keys(row || {})));
  check('second install raised 0 errors', errors2.length === 0, errors2.join('; '));
  rec2.uninstall();
  check('second uninstall restores Array.prototype.splice', Array.prototype.splice === origSplice);

  // ---- 8. non-roster target regression (the hydrateSeed recursion) ----
  // omar_farouk is a background seed on this seed, not roster: the old
  // build hung here (getPerson -> hydrateSeed -> autoEquip -> snapshot
  // -> getPerson, forever). The fixed build must return at once with
  // found:false and no errors — and never hydrate (no RNG drawn).
  const events3 = [];
  const errors3 = [];
  const t0 = process.hrtime.bigint();
  const rec3 = installGunlossRecorder(Game, events3, errors3, 'omar_farouk');
  const dtMs = Number(process.hrtime.bigint() - t0) / 1e6;
  check('non-roster install returns at once (< 1000ms)', dtMs < 1000, 'dtMs=' + dtMs.toFixed(1));
  check('non-roster install: 0 errors', errors3.length === 0, errors3.join('; '));
  const row3 = rec3.census();
  check('non-roster census: target found:false, gun 0, cells 0',
    row3 && row3.omar && row3.omar.found === false && row3.omar.gun === 0 && row3.omar.cells === 0,
    JSON.stringify(row3 && row3.omar));
  rec3.ensureWatch();
  check('non-roster ensureWatch: 0 errors', errors3.length === 0, errors3.join('; '));
  rec3.uninstall();
  check('third uninstall restores Array.prototype.splice', Array.prototype.splice === origSplice);

  console.log('GUNLOSS_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('GUNLOSS_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
