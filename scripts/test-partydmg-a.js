#!/usr/bin/env node
// scripts/test-partydmg-a.js — proof test, arm sim-partydmg-a (DIAG).
//
// Proves the spear-fight damage measurement chain on a LIVE loaded
// game:
//   1. A staged wave-4 expedition fight with a spear-only lead
//      records a RICH row (w4dmgFights): entry kits per fighter
//      (melee/ranged ids + bonuses + wb replicated from the live
//      defs), per-fighter dealt tallies, volley (null for the
//      spear), contact finish, ambush, the full fight log, and a
//      recovered mHpStart.
//   2. The analyzer parses the live row's log: every strike line
//      attributes to a known fighter (coverage 1.0), the parsed
//      damage reconciles with mDealt (residual 0 on an
//      ability-less fixture party), the spear-only lead's wb is 15
//      (hunting_spear 30 folded in half) and its spear share is 1.0.
//   3. A bow-lead wave-4 fight records a rich row too, its volley
//      fires, and the parsed volley damage equals the row's
//      volley.dmg.
//   4. The spearlead proof chain it extends: spear volley null +
//      silent; bow volley fires + ammo spent; dry bow blocked with
//      the honest "no arrows" line.
//
// Fixture (encounter-gear rule, Steve 2026-11-13): a geared wave-4
// hunter as the launch leaves them — a spear or a bow with arrows,
// plus a geared ally — never a fresh un-geared solo scholar.
//
// ORIGIN NOTE: the driver's fightOrigin reads the CALLER from the
// stack (the real caller is expeditionMonster in
// villager-agency.js, and only callers in src/js/ count). A fresh
// setupGame village has not unlocked wave 4, so the real
// expeditionMonster cannot draw one; the test therefore calls
// fieldFight through a function NAMED expeditionMonster evaluated
// with a src/js/villager-agency.js filename
// (vm.runInThisContext — see the call site below), which produces
// the identical stack signature the classifier reads. It exercises
// the exact wrap code oneRun runs, with a real wave-4 mdef and real
// geared villagers — the name + file are the interface, documented
// here, not a silent fake.
//
// Usage: node scripts/test-partydmg-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const vm = require('vm');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { classifyOpening } = require('./analyze-spearopen-a');
const { parseStrikes, fighterMix, spearShare } = require('./analyze-partydmg-a');
const spearDriver = require('./partydmg-driver-a');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  return ((Game.data.villagers || []).find(x => x.id === vid) || {});
}
function setHealth(Game, vid, hp) {
  (Game.state.village.health = Game.state.village.health || {})[vid] = hp;
}
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
}
function ammoCount(items, ammoId) {
  let n = 0;
  for (const e of (items || [])) {
    const id = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
    if (id === ammoId) n += (typeof e === 'string') ? 1 : (e.units || 1);
  }
  return n;
}
// stageKit(Game, p, keepIds): after villagerGearUp (which may pull
// an extra melee weapon out of the stash — the fixture lead picked
// up a sharpened_stick), keep ONLY the intended items on the
// person and clear any equipped melee/ranged slot holding anything
// else. Equipment reads v.equipped slots, so clearing the slot is
// what makes the kit read. The fight's own gearUp(vid, false) is
// re-equip only — with nothing else carried, the kit holds.
function stageKit(p, keepIds) {
  const idOf = function (e) { return (typeof e === 'string') ? e : (e && (e.itemId || e.id)); };
  p.items = (p.items || []).filter(function (e) { return keepIds.indexOf(idOf(e)) !== -1; });
  try {
    if (p.equipped) {
      for (const slot of ['melee', 'weapon', 'ranged']) {
        const ent = p.equipped[slot];
        if (ent && keepIds.indexOf(ent.itemId || ent.id) === -1) p.equipped[slot] = null;
      }
    }
  } catch (e) {}
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 7, mode: 'partydmg-unit' });
  if (loadFails && loadFails.length) { console.log('  FAIL module load: ' + loadFails.join('; ')); process.exitCode = 1; return; }
  await quietLog(async () => { await setupGame(Game); });
  const S = globalThis.Scattering || {};
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 3) { console.log('  FAIL need 3+ NPCs, have ' + roster.length); process.exitCode = 1; return; }
  const vid = roster[0];
  const cid = roster[1];
  const p = personOf(Game, vid);
  const cp = personOf(Game, cid);
  const mdef = (id) => (Game.data.monsters || []).find(m => m.id === id);
  const defOf = (id) => (Game.data.items || []).find(d => d.id === id);
  const eulogy = mdef('eulogy');
  console.log('holder=' + vid + ' companion=' + cid + ' roster=' + roster.length + ' monster=eulogy(wave ' + (eulogy && eulogy.wave) + ')');
  check('eulogy is a wave-4 monster', !!eulogy && eulogy.wave === 4);

  // The substrate flags, as the driver main() asserts them.
  process.env.BOWOPEN = '1'; process.env.SPEARGATE = '1';
  process.env.VETREENGAGE = '1'; process.env.PARTYSIZE4 = '1';
  process.env.FLEEREPAIR2 = '1'; process.env.FIGHTALLY2 = '1';
  process.env.SENSEEXPED = '1';

  // Install the exact recorder oneRun runs.
  const L = { spearDeparts: [], allStarts: [], expFights: [], spearTrack: [], w4dmgFights: [],
    v4departs: [], dawnbidDeparts: [], v4encounters: [], v4gates: [], open: {} };
  const recErrors = [];
  const rec = spearDriver.installPartydmgRecorder(Game, L, recErrors);
  check('recorder installs with no errors', recErrors.length === 0, JSON.stringify(recErrors));

  // The expedition caller (see ORIGIN NOTE above): the driver
  // reads the caller from the stack, and only a caller in src/js/
  // counts — so the test-local expeditionMonster is evaluated with
  // a src/js/villager-agency.js filename, producing the identical
  // stack signature the real caller has. It exercises the exact
  // wrap code oneRun runs, with a real wave-4 mdef and real geared
  // villagers.
  globalThis.__partydmgTestGame = Game;
  const expeditionMonster = vm.runInThisContext(
    '(function expeditionMonster(v, m, opts) { return globalThis.__partydmgTestGame.fieldFight(v, m, null, opts); })',
    { filename: path.join(__dirname, '..', 'src', 'js', 'villager-agency.js') });

  // ---- 1. A spear-only lead + machete ally vs a wave-4 monster ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'hunting_spear', units: 1 }];
  Game.villagerGearUp(vid, true);
  stageKit(p, ['hunting_spear']);
  setHealth(Game, vid, 100);
  resetVillager(Game, cp);
  cp.items = [{ itemId: 'machete', units: 1 }];
  Game.villagerGearUp(cid, true);
  stageKit(cp, ['machete']);
  setHealth(Game, cid, 100);
  const leadKitBefore = spearDriver.fighterKitOf(Game, vid);
  const allyKitBefore = spearDriver.fighterKitOf(Game, cid);
  check('fighterKitOf: spear-only lead reads hunting_spear, wb 15 (30 folded in half)',
    leadKitBefore.rangedId === 'hunting_spear' && leadKitBefore.rangedBonus === 30 &&
    leadKitBefore.meleeId === null && leadKitBefore.wb === 15,
    JSON.stringify(leadKitBefore));
  check('fighterKitOf: machete ally reads machete, wb 18 (35/2 rounded)',
    allyKitBefore.meleeId === 'machete' && allyKitBefore.meleeBonus === 35 &&
    allyKitBefore.rangedId === null && allyKitBefore.wb === 18,
    JSON.stringify(allyKitBefore));
  check('refNameOf matches the engine rule (firstRef for villagers)',
    typeof spearDriver.refNameOf(Game, vid) === 'string' && spearDriver.refNameOf(Game, vid).length > 0,
    spearDriver.refNameOf(Game, vid));

  let recSpear = null, rowSpear = null;
  for (let s = 0; s < 6 && !rowSpear; s++) {
    // Re-gear each attempt: a fight's wounds persist on the person.
    setHealth(Game, vid, 100); setHealth(Game, cid, 100);
    const before = L.w4dmgFights.length;
    recSpear = expeditionMonster(vid, eulogy, { rng: mulberry32(100 + s), allies: 1, allyVids: [cid] });
    const rows = L.w4dmgFights.slice(before).filter(function (r) { return r.vid === vid && r.mid === 'eulogy'; });
    if (rows.length && (rows[0].rounds | 0) > 0) rowSpear = rows[0];
  }
  check('a live wave-4 expedition fight records a rich w4dmgFights row',
    !!rowSpear, 'rows=' + L.w4dmgFights.length + ' rec=' + JSON.stringify(recSpear && { outcome: recSpear.outcome, rounds: recSpear.rounds }));
  if (rowSpear) {
    check('rich row: expedition origin, wave 4, eulogy',
      rowSpear.origin === 'expedition' && rowSpear.wave === 4 && rowSpear.mid === 'eulogy',
      JSON.stringify({ o: rowSpear.origin, w: rowSpear.wave, m: rowSpear.mid }));
    check('rich row: lead kit is the spear-only kit (wb 15, ranged spear)',
      !!rowSpear.leadKit && rowSpear.leadKit.rangedId === 'hunting_spear' && rowSpear.leadKit.wb === 15 &&
      rowSpear.leadKit.meleeId === null,
      JSON.stringify(rowSpear.leadKit));
    check('rich row: ally kit is the machete kit (wb 18)',
      Array.isArray(rowSpear.fighterKits) && rowSpear.fighterKits.length === 1 &&
      rowSpear.fighterKits[0].meleeId === 'machete' && rowSpear.fighterKits[0].wb === 18,
      JSON.stringify(rowSpear.fighterKits));
    check('rich row: per-fighter tallies split mDealt (lead + ally = total)',
      rowSpear.leadDealt + rowSpear.allyDealt === rowSpear.mDealt &&
      rowSpear.leadDealt >= 0 && rowSpear.allyDealt >= 0,
      JSON.stringify({ lead: rowSpear.leadDealt, ally: rowSpear.allyDealt, total: rowSpear.mDealt }));
    check('rich row: volley is null for the spear lead (the spearopen silence, re-verified)',
      rowSpear.volley === null, JSON.stringify(rowSpear.volley));
    check('rich row: mHpStart recovered (mHpLeft + mDealt) on a fought non-kill',
      rowSpear.outcome !== 'vKill' ? (rowSpear.mHpStart === (recSpear.mHpLeft | 0) + (recSpear.mDealt | 0) && rowSpear.mHpStart > 0) : (rowSpear.mHpStart === null),
      JSON.stringify({ mHpStart: rowSpear.mHpStart, mHpLeft: recSpear.mHpLeft, mDealt: recSpear.mDealt, outcome: rowSpear.outcome }));
    check('rich row: full fight log stored (strike lines present)',
      Array.isArray(rowSpear.log) && rowSpear.log.some(function (l) { return /strikes for \d+/.test(String(l)); }),
      (rowSpear.log || []).slice(0, 3).join(' | '));
    check('rich row: no name collision, no gear-up change on the fixture',
      rowSpear.nameCollision === false && rowSpear.gearUpChanged === false,
      JSON.stringify({ nc: rowSpear.nameCollision, gu: rowSpear.gearUpChanged }));

    // ---- 2. The analyzer parses the LIVE row ----
    const parsed = parseStrikes(rowSpear);
    check('analyzer: every strike line in the live log attributes to a known fighter (coverage 1.0)',
      parsed.strikeLines > 0 && parsed.coveredStrikeLines === parsed.strikeLines,
      parsed.coveredStrikeLines + '/' + parsed.strikeLines);
    check('analyzer: parsed damage reconciles with mDealt (residual 0 on the ability-less fixture party)',
      parsed.unparsedDmg === 0, 'parsed ' + parsed.parsedDmg + ' mDealt ' + rowSpear.mDealt + ' unparsed ' + parsed.unparsedDmg);
    check('analyzer: no unknown damage lines in the live log',
      parsed.unknownDmgLines.length === 0, JSON.stringify(parsed.unknownDmgLines));
    check('analyzer: the spear-only lead is mix spear-only with spear share 1.0',
      fighterMix(rowSpear.leadKit) === 'spear-only' && Math.abs(spearShare(rowSpear.leadKit) - 1) < 1e-9,
      fighterMix(rowSpear.leadKit) + ' / ' + spearShare(rowSpear.leadKit));
    check('analyzer: the machete ally is mix other-melee-only with spear share 0',
      fighterMix(rowSpear.fighterKits[0]) === 'other-melee-only' && spearShare(rowSpear.fighterKits[0]) === 0,
      fighterMix(rowSpear.fighterKits[0]) + ' / ' + spearShare(rowSpear.fighterKits[0]));
    check('analyzer: the lead dealt weapon damage with the spear (parsed lead strikes > 0)',
      (parsed.byVid[vid] || { weaponDmg: 0 }).weaponDmg > 0,
      JSON.stringify(parsed.byVid[vid]));
    // Engine consistency: unmultiplied lead strikes land in the
    // tactical formula [4+wb, 8+wb] = [19,23] for wb 15.
    const leadRaw = parsed.strikes.filter(function (s) { return s.vid === vid && s.kind === 'strike'; });
    const plain = leadRaw.filter(function (s) {
      return !(rowSpear.log || []).some(function (l) { return String(l).indexOf('strikes for ' + s.dmg) !== -1 && /\(x[\d.]+\)|audited/.test(String(l)); });
    });
    if (plain.length) {
      check('engine consistency: unmultiplied lead strikes land in [19,23] (wb 15)',
        plain.every(function (s) { return s.dmg >= 19 && s.dmg <= 23; }),
        JSON.stringify(plain.map(function (s) { return s.dmg; })));
    } else {
      console.log('  PASS engine consistency: (no unmultiplied lead strikes in this fixture fight — vacuous)');
      passed++;
    }
  } else {
    console.log('  FAIL analyzer checks on the live row — skipped (no rich row)');
    failed += 9; fails.push('live-row analyzer checks skipped');
  }

  // ---- 3. A bow-lead wave-4 fight: volley fires, parsed == field ----
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', units: 1 }, { itemId: 'arrow', units: 5 }, { itemId: 'machete', units: 1 }];
  Game.villagerGearUp(vid, true);
  stageKit(p, ['bow', 'arrow', 'machete']);
  setHealth(Game, vid, 100);
  resetVillager(Game, cp);
  cp.items = [{ itemId: 'machete', units: 1 }];
  Game.villagerGearUp(cid, true);
  stageKit(cp, ['machete']);
  setHealth(Game, cid, 100);
  let rowBow = null, recBow = null;
  for (let s = 0; s < 6 && !rowBow; s++) {
    setHealth(Game, vid, 100); setHealth(Game, cid, 100);
    const before = L.w4dmgFights.length;
    recBow = expeditionMonster(vid, eulogy, { rng: mulberry32(200 + s), allies: 1, allyVids: [cid] });
    const rows = L.w4dmgFights.slice(before).filter(function (r) { return r.vid === vid && r.mid === 'eulogy'; });
    if (rows.length && (rows[0].rounds | 0) > 0) rowBow = rows[0];
  }
  check('a live bow-lead wave-4 fight records a rich row too', !!rowBow, 'rows=' + L.w4dmgFights.length);
  if (rowBow) {
    check('bow row: volley fires (shots >= 1) for the bow lead',
      !!rowBow.volley && rowBow.volley.shots >= 1, JSON.stringify(rowBow.volley));
    const parsedBow = parseStrikes(rowBow);
    check('bow row: parsed volley damage equals the row volley.dmg',
      parsedBow.volleyParsed === (rowBow.volley ? rowBow.volley.dmg : 0),
      'parsed ' + parsedBow.volleyParsed + ' field ' + (rowBow.volley ? rowBow.volley.dmg : null));
    check('bow row: strike coverage 1.0 on the live log',
      parsedBow.strikeLines > 0 && parsedBow.coveredStrikeLines === parsedBow.strikeLines,
      parsedBow.coveredStrikeLines + '/' + parsedBow.strikeLines);
    check('bow row: lead kit is bow+melee (bow 22 + machete 35, wb 29)',
      !!rowBow.leadKit && rowBow.leadKit.rangedId === 'bow' && rowBow.leadKit.wb === 29,
      JSON.stringify(rowBow.leadKit));
  } else {
    console.log('  FAIL bow-row checks — skipped (no rich row)');
    failed += 4; fails.push('bow-row checks skipped');
  }

  // ---- 4. The spearopen proof chain (extended, not replaced) ----
  const SPEARS = ['hunting_spear', 'fire_hardened_spear', 'shard_spear', 'starfall_lance', 'godslayer_spear'];
  const defs = {};
  for (const d of Game.data.items) defs[d.id] = d;
  for (const id of SPEARS) {
    const d = defOf(id);
    check('def ' + id + ' is melee range-2 with no ammo',
      !!d && d.weapon && d.weapon.type === 'melee' && d.weapon.range === 2 && !d.weapon.ammo,
      JSON.stringify(d && d.weapon));
  }
  resetVillager(Game, p);
  p.items = [{ itemId: 'hunting_spear', units: 1 }];
  Game.villagerGearUp(vid, true);
  setHealth(Game, vid, 100);
  const rSpear = Game.fieldFight(vid, eulogy, null, { rng: mulberry32(7) });
  check('spear fight: rec.volley is null (opening never fires)', rSpear.volley === null, JSON.stringify(rSpear.volley));
  check('spear fight: no dry-ammo line (the skip is silent, not narrated)',
    !(rSpear.log || []).some(function (l) { return /but no (arrows|stones|bolts|fusion cells)/i.test(String(l)); }),
    (rSpear.log || []).slice(0, 4).join(' | '));
  check('analyzer classifies the live spear record as no-volley-path',
    classifyOpening({ rangedId: 'hunting_spear', ammoAtEntry: 0, volley: rSpear.volley, log: rSpear.log || [] }, defs).cls === 'no-volley-path');
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', units: 1 }, { itemId: 'arrow', units: 5 }];
  Game.villagerGearUp(vid, true);
  setHealth(Game, vid, 100);
  const before = ammoCount(p.items, 'arrow');
  const rBow = Game.fieldFight(vid, eulogy, null, { rng: mulberry32(7) });
  check('bow fight: volley fires (shots >= 1)', !!rBow.volley && rBow.volley.shots >= 1, JSON.stringify(rBow.volley));
  check('bow fight: volley spends real ammo (' + before + ' -> ' + ammoCount(p.items, 'arrow') + ')',
    ammoCount(p.items, 'arrow') === before - (rBow.volley ? rBow.volley.shots : 0));
  check('analyzer classifies the live bow record as fired',
    classifyOpening({ rangedId: 'bow', ammoAtEntry: 5, volley: rBow.volley, log: rBow.log || [] }, defs).cls === 'fired');
  resetVillager(Game, p);
  p.items = [{ itemId: 'bow', units: 1 }];
  Game.villagerGearUp(vid, true);
  setHealth(Game, vid, 100);
  const rDry = Game.fieldFight(vid, eulogy, null, { rng: mulberry32(7) });
  check('dry bow fight: volley is shots 0', !!rDry.volley && rDry.volley.shots === 0, JSON.stringify(rDry.volley));
  check('dry bow fight: the "no arrows" line is narrated',
    (rDry.log || []).some(function (l) { return /but no arrows/i.test(String(l)); }),
    (rDry.log || []).slice(0, 4).join(' | '));
  check('analyzer classifies the live dry-bow record as blocked-empty-ammo',
    classifyOpening({ rangedId: 'bow', ammoAtEntry: 0, volley: rDry.volley, log: rDry.log || [] }, defs).cls === 'blocked-empty-ammo');

  // ---- 5. The partydmg decomposition on the LIVE rows ----
  // Build a one-seed corpus from the two live rich rows above and
  // run the partydmg analyzer on it: the three decompositions must
  // sum to mDealt, the kill-line gap must compute, and the
  // counterfactuals must be finite with C > A (wb 50 beats wb 30)
  // on the spear row. Writes to a temp dir only — nothing in the
  // repo. Requires the partyDmgStats export from the analyzer.
  const { partyDmgStats, judgePartyDmg, counterfactuals, requiredWb } = require('./analyze-partydmg-a');
  const fs2 = require('fs');
  const os2 = require('os');
  const path2 = require('path');
  const liveRows = [];
  if (rowSpear) liveRows.push(rowSpear);
  if (rowBow) liveRows.push(rowBow);
  check('two live rich rows exist to decompose', liveRows.length === 2, 'rows=' + liveRows.length);
  if (liveRows.length === 2) {
    const tmpDir = fs2.mkdtempSync(path2.join(os2.tmpdir(), 'partydmg-proof-'));
    const seedDoc = { seed: 7, days: 150, gameDays: 150, scaleRank: 'regional', won: false,
      maxWave: 4, unlockedWave: 4, endReason: 'survived', villageLost: false,
      instrumentErrors: [], bowopenOn: true, speargateOn: true, senseexpedOn: true, fightally2On: true,
      deaths: [], standing: 150, spearSeen: 0, spearPassed: 0,
      spearDeparts: [], allStarts: [], expFights: [], v4encounters: [], spearTrack: [],
      w4dmgFights: liveRows };
    fs2.writeFileSync(path2.join(tmpDir, 's7.json'), JSON.stringify(seedDoc));
    const live = partyDmgStats(tmpDir);
    check('analyzer: both live fights are in the pool', live.fights === 2, 'fights ' + live.fights);
    check('analyzer: coverage 1.0 on the live logs',
      live.coverage === 1, 'coverage ' + live.coverage);
    check('analyzer: channel decomposition sums to mDealt on live rows',
      Math.abs(live.decomposition.channel - 1) < 1e-9, 'channel ' + live.decomposition.channel);
    check('analyzer: role decomposition sums to mDealt on live rows',
      Math.abs(live.decomposition.role - 1) < 1e-9, 'role ' + live.decomposition.role);
    check('analyzer: mix decomposition sums to mDealt on live rows',
      Math.abs(live.decomposition.mix - 1) < 1e-9, 'mix ' + live.decomposition.mix);
    check('analyzer: tier decomposition sums to mDealt on live rows',
      Math.abs(live.decomposition.tier - 1) < 1e-9, 'tier ' + live.decomposition.tier);
    const spearFight = live.partyDpr.find(function (r) { return r.mid === 'eulogy' && r.rounds > 1; });
    if (spearFight) {
      check('analyzer: the spear-row party dpr is below the 111 kill line (gap > 0)',
        spearFight.partyDpr > 0 && spearFight.partyDpr < 111 && spearFight.gap > 0,
        JSON.stringify({ dpr: spearFight.partyDpr, gap: spearFight.gap }));
      check('analyzer: counterfactuals on the spear row are finite with C > A',
        [spearFight.cfA, spearFight.cfB, spearFight.cfC, spearFight.cfD].every(function (v) { return typeof v === 'number' && isFinite(v); }) &&
        spearFight.cfC > spearFight.cfA,
        JSON.stringify({ A: spearFight.cfA, B: spearFight.cfB, C: spearFight.cfC, D: spearFight.cfD }));
      check('analyzer: required wb on the spear row is finite and positive',
        typeof spearFight.requiredWb === 'number' && spearFight.requiredWb > 0,
        'requiredWb ' + spearFight.requiredWb);
    } else {
      console.log('  FAIL spear-row gap/counterfactual checks — skipped (no multi-round eulogy row)');
      failed += 3; fails.push('spear-row gap/counterfactual checks skipped');
    }
    check('analyzer: bow-row volley damage sits in the volley channel',
      live.byChannel.volley > 0, JSON.stringify(live.byChannel));
    const jLive = judgePartyDmg(Object.assign({}, live, { fights: 8, spearFights: 5 }));
    check('judge: the live 2-fight corpus would be DIAG-GO at pool size (bars pass)',
      jLive.verdict === 'DIAG-GO', JSON.stringify(jLive));
    try { fs2.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  } else {
    console.log('  FAIL live-row decomposition checks — skipped (rows missing)');
    failed += 9; fails.push('live-row decomposition checks skipped');
  }

  // ---- 6. Driver module surface ----
  check('driver exports oneRun + the partydmg recorder + kit helpers',
    typeof spearDriver.oneRun === 'function' &&
    typeof spearDriver.installPartydmgRecorder === 'function' &&
    typeof spearDriver.fighterKitOf === 'function' &&
    typeof spearDriver.refNameOf === 'function' &&
    typeof spearDriver.rangedKitOf === 'function');
  check('driver is the partydmg instrument (SEEDLAND hard-on)', spearDriver.SEEDLAND === true);
  check('recorder left no instrument errors', recErrors.length === 0, JSON.stringify(recErrors));
  try { rec.uninstall(); } catch (e) {}
  delete process.env.BOWOPEN; delete process.env.SPEARGATE;
  delete process.env.VETREENGAGE; delete process.env.PARTYSIZE4;
  delete process.env.FLEEREPAIR2; delete process.env.FIGHTALLY2;
  delete process.env.SENSEEXPED;

  console.log('test-partydmg-a: ' + passed + ' passed, ' + failed + ' failed' + (failed ? ' — ' + fails.join('; ') : ''));
  process.exitCode = failed ? 1 : 0;
}

main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
