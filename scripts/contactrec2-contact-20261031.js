#!/usr/bin/env node
// contactrec2-contact-20261031.js — sim-contactrec2-a contact
// analyzer (question b: contact-finish BUILD readiness).
//
// Reads splitter output: <corpusDir>/leadfeast/s<seed>.json. Loads no
// game code, runs no sims, changes nothing.
//
// CONTACT = the contactbreak definition, unchanged, via
// scripts/contactbreak-analyze-20261031.js classifyRow (mHpStart <
// 0.15 * mMaxHp AND rounds <= 1 AND mDealt == 0 AND outcome in
// {mFlee, evade}).
//
// FINISHABLE-WITH-A-REAL-ACTION (primary, weapon-instrument): the
// fighter at contact holds EITHER (a) a ranged weapon with
// ammoAtContact > 0, OR (b) a melee weapon equipped (meleeEqId) or
// carried (meleeCarriedIds non-empty). NO-REAL-INSTRUMENT: neither.
// Rows lacking instrument fields (old corpora) are
// INSTRUMENT-UNCLASSIFIED, never forced.
//
// LIE: a CONTACT meeting ending mFlee whose drive-off line credits
// "the bow" (the engine always writes that line, fieldFights.js
// volley-break block) while the fighter holds no usable ranged
// weapon — rangedEqId null, or ammoAtContact == 0. Split by the
// ranged weapon actually held: bow-no-arrows, sling-no-arrows,
// no-ranged-at-all. A melee weapon held alongside a lie is reported
// (the meeting is finishable via melee even though the line lies).
//
// EVADE rows are avoidances, not drive-offs: reported as their own
// row and excluded from the BUILD universe. BUILD universe =
// CONTACT meetings ending mFlee that are finishable.
// SENSITIVITY (reported, never folded in): the engine's lead strike
// deals damage unarmed too, so under an "any strike action counts"
// reading every CONTACT meeting is actionable — that count is the
// sensitivity row.
//
// Usage: node scripts/contactrec2-contact-20261031.js <corpusDir> <seed...> [--out <file>]
// Prints a band summary to stdout; with --out writes the full JSON.
'use strict';
const fs = require('fs');
const path = require('path');
const CB = require(path.join(__dirname, 'contactbreak-analyze-20261031.js'));

function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }

function rangedKind(name) {
  const n = String(name || '').toLowerCase();
  if (/sling/.test(n)) return 'sling';
  if (/bow|crossbow/.test(n)) return 'bow';
  return 'other-ranged';
}

function classifyInstrument(f) {
  const hasInstrumentFields = ('rangedEqId' in f) || ('meleeEqId' in f) || ('ammoAtContact' in f);
  if (!hasInstrumentFields) return { cls: 'INSTRUMENT-UNCLASSIFIED', reason: 'no-instrument-fields (old corpus)' };
  const rangedUsable = f.rangedEqId != null && isNum(f.ammoAtContact) && f.ammoAtContact > 0;
  const meleeHeld = f.meleeEqId != null || (Array.isArray(f.meleeCarriedIds) && f.meleeCarriedIds.length > 0);
  const finishable = rangedUsable || meleeHeld;
  const lie = !rangedUsable; // drive-off line always credits "the bow"
  let lieKind = null;
  if (lie) {
    if (f.rangedEqId == null) lieKind = 'no-ranged-at-all';
    else lieKind = rangedKind(f.rangedEqName) + '-no-arrows';
  }
  return { cls: finishable ? 'FINISHABLE' : 'NO-REAL-INSTRUMENT',
    rangedUsable, meleeHeld, lie, lieKind,
    rangedEqId: f.rangedEqId != null ? f.rangedEqId : null,
    rangedEqName: f.rangedEqName != null ? f.rangedEqName : null,
    ammoAtContact: isNum(f.ammoAtContact) ? f.ammoAtContact : null,
    meleeEqId: f.meleeEqId != null ? f.meleeEqId : null,
    meleeEqName: f.meleeEqName != null ? f.meleeEqName : null,
    meleeCarriedIds: Array.isArray(f.meleeCarriedIds) ? f.meleeCarriedIds.slice() : [],
    volleyPost: f.volley || null };
}

function analyzeSeed(obj) {
  const rows = (obj.fieldFights || []).filter(f => f.wave === 3);
  const contact = [];
  let total = 0, unclassified = 0;
  const evadeCapture = { evadeRows: 0, evadeCaptured: 0 };
  for (const f of rows) {
    total++;
    if (f.outcome === 'evade') {
      evadeCapture.evadeRows++;
      if (isNum(f.mHpStart) && isNum(f.mMaxHp)) evadeCapture.evadeCaptured++;
    }
    const c = CB.classifyRow(f);
    if (c.cls !== 'CONTACT') { if (c.cls === 'UNCLASSIFIED') unclassified++; continue; }
    const inst = classifyInstrument(f);
    contact.push(Object.assign({ seed: String(obj.seed), day: f.day, vid: f.vid, mid: f.mid,
      outcome: f.outcome, rounds: f.rounds, mHpStart: f.mHpStart, mMaxHp: f.mMaxHp,
      mDealt: f.mDealt, intent: f.intent || null, caller: f.caller || null,
      log: f.log || null }, inst));
  }
  const mFlee = contact.filter(r => r.outcome === 'mFlee');
  const evade = contact.filter(r => r.outcome === 'evade');
  // Spear sensitivity (D4): a hunting spear in the ranged slot is
  // counted no-instrument in the primary (engine isRangedWeapon:
  // range > 1), but is plainly a melee instrument in fiction.
  // spearInclusiveBuild = buildUniverse + no-instr mFlee rows whose
  // ranged weapon is a spear.
  const spearNoInstrMflee = mFlee.filter(r => r.cls === 'NO-REAL-INSTRUMENT' &&
    /spear/i.test(String(r.rangedEqName || '')));
  const classified = contact.filter(r => r.cls !== 'INSTRUMENT-UNCLASSIFIED');
  const finishableMflee = mFlee.filter(r => r.cls === 'FINISHABLE');
  const noInstrMflee = mFlee.filter(r => r.cls === 'NO-REAL-INSTRUMENT');
  const lieMflee = mFlee.filter(r => r.lie === true);
  const lieByKind = {};
  for (const r of lieMflee) lieByKind[r.lieKind || 'unknown'] = (lieByKind[r.lieKind || 'unknown'] || 0) + 1;
  const lieWithMelee = lieMflee.filter(r => r.meleeHeld).length;
  return { seed: obj.seed, total, contactN: contact.length, unclassified,
    evadeCapture, evadeCaptureRate: evadeCapture.evadeRows ? evadeCapture.evadeRows && (evadeCapture.evadeCaptured / evadeCapture.evadeRows) : null,
    contact, mFleeN: mFlee.length, evadeN: evade.length,
    classifiedN: classified.length, instrumentUnclassifiedN: contact.length - classified.length,
    finishableN: contact.filter(r => r.cls === 'FINISHABLE').length,
    noRealInstrumentN: contact.filter(r => r.cls === 'NO-REAL-INSTRUMENT').length,
    buildUniverseN: finishableMflee.length, noInstrMfleeN: noInstrMflee.length,
    spearNoInstrMfleeN: spearNoInstrMflee.length,
    spearInclusiveBuildN: finishableMflee.length + spearNoInstrMflee.length,
    lieMfleeN: lieMflee.length, lieByKind, lieWithMelee,
    lieRateMflee: mFlee.length ? lieMflee.length / mFlee.length : null,
    // Sensitivity: every CONTACT meeting is actionable under an
    // "any strike action counts" reading (unarmed strikes deal damage).
    sensitivityAllActionableN: contact.length,
    national: obj.national | 0, table: obj.table | 0, won: obj.won | 0,
    wave4: obj.wave4 | 0, wave5: obj.wave5 | 0, gameDays: obj.gameDays | 0,
    bestSeat: obj.bestSeat || null, fullSeat: obj.fullSeat != null ? obj.fullSeat : null };
}

function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  let outFile = null;
  if (outIdx >= 0) { outFile = args[outIdx + 1]; args.splice(outIdx, 2); }
  const [corpusDir, ...seedArgs] = args;
  if (!corpusDir || !seedArgs.length) { console.error('usage: contactrec2-contact-20261031.js <corpusDir> <seed...> [--out <file>]'); process.exit(2); }
  const perSeed = [];
  for (const seed of seedArgs) {
    const obj = JSON.parse(fs.readFileSync(path.join(corpusDir, 'leadfeast', `s${seed}.json`), 'utf8'));
    perSeed.push(analyzeSeed(obj));
  }
  const sum = (fn) => perSeed.reduce((a, s) => a + (fn(s) || 0), 0);
  const median = (xs) => { const s = xs.slice().sort((a, b) => a - b); if (!s.length) return null; const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const lieByKind = perSeed.reduce((a, s) => { for (const [k, v] of Object.entries(s.lieByKind || {})) a[k] = (a[k] || 0) + v; return a; }, {});
  const band = { seeds: seedArgs.map(Number), nSeeds: perSeed.length,
    national: sum(s => s.national), table: sum(s => s.table), won: sum(s => s.won),
    wave4: sum(s => s.wave4), wave5: sum(s => s.wave5),
    medianSurvival: median(perSeed.map(s => s.gameDays)), maxSurvival: Math.max.apply(null, perSeed.map(s => s.gameDays)),
    fullSeat: perSeed.every(s => s.fullSeat != null) ? sum(s => s.fullSeat) : null,
    total: sum(s => s.total), contactN: sum(s => s.contactN), unclassified: sum(s => s.unclassified),
    mFleeN: sum(s => s.mFleeN), evadeN: sum(s => s.evadeN),
    classifiedN: sum(s => s.classifiedN), instrumentUnclassifiedN: sum(s => s.instrumentUnclassifiedN),
    finishableN: sum(s => s.finishableN), noRealInstrumentN: sum(s => s.noRealInstrumentN),
    buildUniverseN: sum(s => s.buildUniverseN), noInstrMfleeN: sum(s => s.noInstrMfleeN),
    spearNoInstrMfleeN: sum(s => s.spearNoInstrMfleeN),
    spearInclusiveBuildN: sum(s => s.spearInclusiveBuildN),
    lieMfleeN: sum(s => s.lieMfleeN), lieByKind, lieWithMelee: sum(s => s.lieWithMelee),
    lieRateMflee: sum(s => s.mFleeN) ? sum(s => s.lieMfleeN) / sum(s => s.mFleeN) : null,
    sensitivityAllActionableN: sum(s => s.sensitivityAllActionableN),
    evadeRows: sum(s => s.evadeCapture.evadeRows), evadeCaptured: sum(s => s.evadeCapture.evadeCaptured) };
  band.evadeCaptureRate = band.evadeRows ? band.evadeCaptured / band.evadeRows : null;
  const result = { band, perSeed };
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 1) + '\n');
  console.log(JSON.stringify(band, null, 1));
  for (const s of perSeed) {
    console.log(`s${s.seed}: total=${s.total} contact=${s.contactN} (mFlee ${s.mFleeN} evade ${s.evadeN}) classified=${s.classifiedN} instrUnc=${s.instrumentUnclassifiedN} finishable=${s.finishableN} noInstr=${s.noRealInstrumentN} BUILD=${s.buildUniverseN} lieMflee=${s.lieMfleeN} lieKinds=${JSON.stringify(s.lieByKind)} evadeCap=${s.evadeCapture.evadeCaptured}/${s.evadeCapture.evadeRows} nat=${s.national} table=${s.table} won=${s.won} w4=${s.wave4} w5=${s.wave5} days=${s.gameDays} seat=${s.bestSeat}`);
  }
}
if (require.main === module) main();
module.exports = { analyzeSeed, classifyInstrument, rangedKind };
