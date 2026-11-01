#!/usr/bin/env node
// test-contactfinish-20261031.js — sim-contactfinish-a proof test.
//
// Proves the contact-finish rule (fieldFights.js volley-break block)
// and each measurement: static guards, engine positive/negative
// cases, analyzer universe + lie accounting, baseline corpus legs,
// and (when present) lever corpus legs. Writes nothing into the repo.
//
// Usage: node scripts/test-contactfinish-20261031.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const CF = require(path.join(REPO, 'scripts', 'contactfinish-analyze-20261031.js'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL: ${name}${extra != null ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// --- static legs ---
const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
check('static: contact-finish gate (wave>=3 + instrument + mDealt 0 + !noFlee + alive)',
  ffSrc.indexOf("if (wave >= 3 && _cf && rec.mDealt === 0 && !opts.noFlee && members[0].hp > 0)") >= 0);
check('static: spear rule (ranged def with weapon.type melee)',
  ffSrc.indexOf("weapon.type === 'melee') _cf = { kind: 'spear'") >= 0);
check('static: no-arrows never counts (ranged path needs _cfAmmoBefore > 0)',
  ffSrc.indexOf('_cfAmmoBefore != null && _cfAmmoBefore > 0') >= 0);
check('static: kill line names weapon + (Contact finish)',
  ffSrc.indexOf('(Contact finish)') >= 0);
check('static: no-weapon drive-off line credits no weapon',
  ffSrc.indexOf("rec.log.push(vName + ' drove ' + mPhrase + ' off — it broke before it ever closed.');") >= 0);
check('static: old bow-credit line GONE from the volley-break block',
  ffSrc.indexOf("drove ' + mPhrase + ' off with the bow") < 0);
check('static: mBreak line unchanged', ffSrc.indexOf('var mBreak = wave >= 2 ? 0.15 : 0.25;') >= 0);
check('static: 60% gate unchanged',
  ffSrc.indexOf("(vHp / vHpMax) >= 0.60 && rec.intent === 'engage' && vStruckThisRound && !opts.noFlee") >= 0);
check('static: contactFinish rec fields init',
  ffSrc.indexOf('contactFinishAttempted: false, contactFinishKill: false') >= 0);
check('static: plain tactical roll, no ability multipliers in the strike',
  ffSrc.indexOf('var _cfVd = lroll([4 + wb, 8 + wb]);') >= 0);

// --- analyzer unit legs ---
const rowBase = { wave: 3, mHpStart: 1, mMaxHp: 260, rounds: 0, mDealt: 0, outcome: 'mFlee' };
function rowWith(o) { return Object.assign({}, rowBase, o); }
check('analyzer: melee equipped is FINISHABLE',
  CF.classifyUniverse(rowWith({ meleeEqId: 'crowbar', meleeEqName: 'Crowbar', ammoAtContact: null, rangedEqId: null })).cls === 'FINISHABLE');
check('analyzer: spear in ranged slot is FINISHABLE (spear-counts-as-melee)',
  CF.classifyUniverse(rowWith({ rangedEqId: 'hunting_spear', rangedEqName: 'Hunting spear', rangedIsSpear: true, ammoAtContact: null, meleeEqId: null })).cls === 'FINISHABLE');
check('analyzer: bow with arrows is FINISHABLE via ranged',
  CF.classifyUniverse(rowWith({ rangedEqId: 'crude_bow', rangedEqName: 'Crude bow', ammoAtContact: 3, meleeEqId: null })).cls === 'FINISHABLE');
check('analyzer: bow with NO arrows and no melee is NO-REAL-INSTRUMENT',
  CF.classifyUniverse(rowWith({ rangedEqId: 'crude_bow', rangedEqName: 'Crude bow', ammoAtContact: 0, meleeEqId: null })).cls === 'NO-REAL-INSTRUMENT');
check('analyzer: unarmed is NO-REAL-INSTRUMENT',
  CF.classifyUniverse(rowWith({ rangedEqId: null, ammoAtContact: null, meleeEqId: null })).cls === 'NO-REAL-INSTRUMENT');
check('analyzer: old bow-credit line on a melee fighter is a LIE',
  CF.checkDriveOffLine(rowWith({ meleeEqId: 'crowbar', meleeEqName: 'Crowbar', rangedEqId: null }), 'Weronika drove The Callback off with the bow — it broke before it ever closed.').lie === true);
check('analyzer: old bow-credit line on a bow-no-arrows fighter is a LIE',
  CF.checkDriveOffLine(rowWith({ rangedEqId: 'crude_bow', rangedEqName: 'Crude bow', ammoAtContact: 0, meleeEqId: null }), 'Dmitri drove The Callback off with the bow — it broke before it ever closed.').lie === true);
check('analyzer: honest weapon-named line on a melee fighter is NOT a lie',
  CF.checkDriveOffLine(rowWith({ meleeEqId: 'crowbar', meleeEqName: 'Crowbar', rangedEqId: null }), 'Weronika drove The Callback off with the crowbar — it broke before it ever closed.').lie === false);
check('analyzer: honest no-weapon line on an unarmed fighter is NOT a lie',
  CF.checkDriveOffLine(rowWith({ rangedEqId: null, ammoAtContact: null, meleeEqId: null }), 'Dmitri drove The Callback off — it broke before it ever closed.').lie === false);
check('analyzer: honest no-weapon line while HOLDING a weapon IS a lie',
  CF.checkDriveOffLine(rowWith({ meleeEqId: 'crowbar', meleeEqName: 'Crowbar', rangedEqId: null }), 'Weronika drove The Callback off — it broke before it ever closed.').lie === true);

// --- baseline corpus legs ---
const baseAnalysisPath = path.join(REPO, 'evidence', '2026-10-31', 'contactfinish-baseline-pilot-analysis.json');
if (fs.existsSync(baseAnalysisPath)) {
  const base = JSON.parse(fs.readFileSync(baseAnalysisPath, 'utf8'));
  check('corpus baseline: judged universe 11 finishable / 2 unarmed',
    base.band.finishableMfleeN === 11 && base.band.noInstrMfleeN === 2,
    { finishable: base.band.finishableMfleeN, noInstr: base.band.noInstrMfleeN });
  check('corpus baseline: lie rate 13/13 = 100% (pre-fix narration)',
    base.band.driveOffLinesN === 13 && base.band.driveOffLiesN === 13,
    { lines: base.band.driveOffLinesN, lies: base.band.driveOffLiesN });
  check('corpus baseline: wall 7/7/7, wave-4 5, wave-5 0, full seat 0',
    base.band.national === 7 && base.band.table === 7 && base.band.won === 7 &&
    base.band.wave4 === 5 && base.band.wave5 === 0 && base.band.fullSeat === 0,
    { national: base.band.national, table: base.band.table, won: base.band.won, wave4: base.band.wave4, wave5: base.band.wave5, fullSeat: base.band.fullSeat });
  check('corpus baseline: median survival 121, max 197',
    base.band.medianSurvival === 121 && base.band.maxSurvival === 197,
    { median: base.band.medianSurvival, max: base.band.maxSurvival });
  check('corpus baseline: zero attempts (no rule on baseline)',
    base.band.attemptedN === 0 && base.band.convertedN === 0);
} else {
  console.log('BASELINE CORPUS MISSING (skipped)');
}

// --- lever corpus legs (skipped until the lever leg lands) ---
const leverAnalysisPath = path.join(REPO, 'evidence', '2026-10-31', 'contactfinish-lever-pilot-analysis.json');
if (fs.existsSync(leverAnalysisPath)) {
  const lev = JSON.parse(fs.readFileSync(leverAnalysisPath, 'utf8'));
  const base = JSON.parse(fs.readFileSync(baseAnalysisPath, 'utf8'));
  // Lever-leg judged universe (prereg): rows the engine attempted
  // (converted + failed strikes leave the CONTACT class, so they are
  // invisible to finishableMfleeN) PLUS finishable CONTACT meetings
  // still ending mFlee on the lever leg (0 here — no finishable
  // meeting was left unconverted on lever trajectories).
  const levUniverse = lev.band.attemptedN + lev.band.finishableMfleeN;
  const convRate = levUniverse ? lev.band.convertedN / levUniverse : null;
  check('corpus lever: conversion >= 50% of judged finishable meetings',
    convRate != null && convRate >= 0.5, { converted: lev.band.convertedN, universe: levUniverse, attempted: lev.band.attemptedN, remainingFinishable: lev.band.finishableMfleeN, rate: convRate });
  check('corpus lever: lie rate on remaining drive-off lines = 0',
    lev.band.driveOffLiesN === 0, { lines: lev.band.driveOffLinesN, lies: lev.band.driveOffLiesN });
  check('corpus lever: median survival >= baseline -10%',
    lev.band.medianSurvival >= base.band.medianSurvival * 0.9,
    { leverMedian: lev.band.medianSurvival, baseMedian: base.band.medianSurvival });
  check('corpus lever: wave>=3 field deaths <= baseline + 2',
    lev.band.w3Deaths <= base.band.w3Deaths + 2,
    { leverDeaths: lev.band.w3Deaths, baseDeaths: base.band.w3Deaths });
} else {
  console.log('LEVER CORPUS MISSING (skipped)');
}

async function main() {
  const { Game } = await loadGame({ seed: 87104, mode: 'herald', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const roster = ((Game.state.village || {}).roster || []).filter(v => v !== Game.villagerId);
  check('engine: roster has non-scholar fighters', roster.length >= 1, roster.length);
  const defs = {};
  for (const m of (Game.data.monsters || [])) defs[m.id] = m;
  const callback = defs.callback;
  const deer = defs.gallowdeer || defs.highbeam_deer || (Game.data.monsters || []).find(m => m.wave === 1);
  check('engine: callback def present (wave 3)', !!callback && callback.wave === 3);
  check('engine: wave-1 def present', !!deer);

  function runFight(vid, equipped, items, def, startHp, maxHp, streamSeed) {
    const vp = (Game.data.villagers || []).find(x => x.id === vid) || (Game.data.background_survivors || []).find(x => x.id === vid) || {};
    vp.items = items.slice();
    vp.equipped = equipped;
    const hv = Game.state.village.health || (Game.state.village.health = {});
    hv[vid] = 100;
    return Game.fieldFight(vid, def, { hp: startHp, maxHp: maxHp }, { allies: 0, allyVids: [], rng: mulberry32(streamSeed) });
  }
  const vid = roster[0];
  const meleeEq = { melee: { itemId: 'crowbar' } };
  const meleeItems = [{ itemId: 'crowbar', units: 1 }];

  // E1: melee crowbar vs 1-HP callback -> attempted, kill, weapon named.
  let e1kills = 0, e1att = 0, e1bad = 0;
  for (let s = 1; s <= 20; s++) {
    let rec;
    try { rec = runFight(vid, meleeEq, meleeItems, callback, 1, 260, s * 7919); } catch (e) { continue; }
    if (rec.contactFinishAttempted) e1att++;
    if (rec.contactFinishKill) e1kills++;
    if (rec.contactFinishAttempted && (rec.outcome !== 'vKill' || rec.contactFinishInstrument !== 'melee' ||
        !String((rec.log || []).join(' ')).match(/strike with the crowbar/) ||
        !String((rec.log || []).join(' ')).match(/\(Contact finish\)/))) e1bad++;
  }
  check('E1: melee vs 1-HP beast attempts and kills (weapon named, Contact finish line)',
    e1att === 20 && e1kills === 20 && e1bad === 0, { att: e1att, kills: e1kills, bad: e1bad });

  // E2: weak melee (sharpened stick, vd 7-11) vs 36-HP callback -> attempted,
  // never kills, always ends mFlee with a strike line + flight (no vDie).
  let e2att = 0, e2kill = 0, e2flee = 0, e2die = 0, e2bad = 0;
  for (let s = 1; s <= 30; s++) {
    let rec;
    try { rec = runFight(vid, { melee: { itemId: 'sharpened_stick' } }, [{ itemId: 'sharpened_stick', units: 1 }], callback, 36, 260, s * 104729); } catch (e) { continue; }
    if (rec.contactFinishAttempted) e2att++;
    if (rec.contactFinishKill) e2kill++;
    if (rec.outcome === 'mFlee') e2flee++;
    if (rec.outcome === 'vDie') e2die++;
    if (rec.contactFinishAttempted && rec.outcome === 'mFlee' &&
        !String((rec.log || []).join(' ')).match(/strikes with the sharpened stick/)) e2bad++;
  }
  check('E2: weak melee vs 36-HP beast attempts, never kills, flees honestly, never dies',
    e2att === 30 && e2kill === 0 && e2flee === 30 && e2die === 0 && e2bad === 0,
    { att: e2att, kills: e2kill, flee: e2flee, die: e2die, bad: e2bad });

  // E3: spear in ranged slot vs 1-HP callback -> attempted, instrument spear.
  let e3att = 0, e3kill = 0, e3bad = 0;
  for (let s = 1; s <= 10; s++) {
    let rec;
    try { rec = runFight(vid, { ranged: { itemId: 'hunting_spear' } }, [{ itemId: 'hunting_spear', units: 1 }], callback, 1, 260, s * 31337); } catch (e) { continue; }
    if (rec.contactFinishAttempted) e3att++;
    if (rec.contactFinishKill) e3kill++;
    if (rec.contactFinishAttempted && (rec.contactFinishInstrument !== 'spear' ||
        !String((rec.log || []).join(' ')).match(/strike with the hunting spear/))) e3bad++;
  }
  check('E3: spear-in-ranged-slot attempts as spear, kills, names the spear',
    e3att === 10 && e3kill === 10 && e3bad === 0, { att: e3att, kills: e3kill, bad: e3bad });

  // E4: bow with NO arrows vs 1-HP callback -> never attempts, honest
  // no-weapon drive-off line, never credits the bow.
  let e4att = 0, e4bad = 0, e4flee = 0;
  for (let s = 1; s <= 10; s++) {
    let rec;
    try { rec = runFight(vid, { ranged: { itemId: 'crude_bow' } }, [{ itemId: 'crude_bow', units: 1 }], callback, 1, 260, s * 27183); } catch (e) { continue; }
    if (rec.contactFinishAttempted) e4att++;
    if (rec.outcome === 'mFlee') e4flee++;
    const log = String((rec.log || []).join(' '));
    if (log.match(/with the bow/) || log.match(/with the crude bow/)) e4bad++;
    if (rec.outcome === 'mFlee' && !log.match(/drove .* off — it broke before it ever closed/)) e4bad++;
  }
  check('E4: bow-no-arrows never attempts, drive-off credits no weapon',
    e4att === 0 && e4flee === 10 && e4bad === 0, { att: e4att, flee: e4flee, bad: e4bad });

  // E5: unarmed vs 1-HP callback -> never attempts, honest no-weapon line.
  let e5att = 0, e5bad = 0;
  for (let s = 1; s <= 10; s++) {
    let rec;
    try { rec = runFight(vid, {}, [], callback, 1, 260, s * 18289); } catch (e) { continue; }
    if (rec.contactFinishAttempted) e5att++;
    const log = String((rec.log || []).join(' '));
    if (rec.outcome === 'mFlee' && log.match(/with the /)) e5bad++;
  }
  check('E5: unarmed never attempts, drive-off credits no weapon',
    e5att === 0 && e5bad === 0, { att: e5att, bad: e5bad });

  // E6: wave-1 beast below its break line, melee held -> outcome unchanged
  // (mFlee), never attempts, but the line names the real weapon.
  let e6att = 0, e6flee = 0, e6named = 0;
  if (deer) {
    for (let s = 1; s <= 10; s++) {
      let rec;
      try { rec = runFight(vid, meleeEq, meleeItems, deer, 1, deer.hp ? deer.hp[1] : 170, s * 911); } catch (e) { continue; }
      if (rec.contactFinishAttempted) e6att++;
      if (rec.outcome === 'mFlee') e6flee++;
      if (String((rec.log || []).join(' ')).match(/with the crowbar/)) e6named++;
    }
  }
  check('E6: wave-1 meeting keeps its outcome, never attempts, names the crowbar',
    deer ? (e6att === 0 && e6flee === 10 && e6named === 10) : false,
    { att: e6att, flee: e6flee, named: e6named });

  // E7: volley-softened beast (above break, volley drops it below) with
  // melee held -> mDealt > 0, so never attempts (not a contact meeting).
  let e7att = 0, e7soft = 0;
  for (let s = 1; s <= 30; s++) {
    let rec;
    try {
      rec = runFight(vid, { ranged: { itemId: 'crude_bow' }, melee: { itemId: 'crowbar' } },
        [{ itemId: 'crude_bow', units: 1 }, { itemId: 'arrow', units: 4 }, { itemId: 'crowbar', units: 1 }],
        callback, 45, 260, s * 5051);
    } catch (e) { continue; }
    if ((rec.mDealt | 0) > 0 && rec.outcome === 'mFlee') e7soft++;
    if (rec.contactFinishAttempted) e7att++;
  }
  check('E7: volley-softened drive-offs never attempt (mDealt > 0 gate)',
    e7att === 0 && e7soft >= 1, { att: e7att, softFlees: e7soft });

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e && e.stack); process.exit(1); });
