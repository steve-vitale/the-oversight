#!/usr/bin/env node
// contactfinish-analyze-20261031.js — sim-contactfinish-a analyzer.
//
// Reads splitter output: <corpusDir>/leadfeast/s<seed>.json. Loads no
// game code, runs no sims, changes nothing.
//
// CONTACT = the contactbreak definition, unchanged, via
// scripts/contactbreak-analyze-20261031.js classifyRow (mHpStart <
// 0.15 * mMaxHp AND rounds <= 1 AND mDealt == 0 AND outcome in
// {mFlee, evade}). NOTE: on the LEVER leg a converted meeting ends
// vKill with mDealt > 0 (the strike's damage), so it no longer
// classifies CONTACT — conversions are counted from the engine's
// contactFinishKill flag, and the judged universe is computed on
// the BASELINE leg (same seeds, same trajectories up to the first
// conversion) plus lever-leg attempted rows cross-checked against it.
//
// JUDGED FINISHABLE UNIVERSE (spear-counts-as-melee, coordinator
// decision verbatim): melee equipped/carried OR spear-in-ranged-
// slot OR ranged weapon with ammoAtContact > 0. In recorder fields:
// meleeEqId != null, OR closeCarriedIds non-empty, OR
// rangedIsSpear === true, OR (rangedEqId != null AND
// ammoAtContact > 0). Rows lacking instrument fields are
// INSTRUMENT-UNCLASSIFIED, never forced. Unarmed = none of the
// above (this includes bow-no-arrows and sling-no-arrows fighters
// with no melee/spear: a no-arrows bow is NEVER an instrument).
//
// LIE RATE (remaining drive-off lines): every lever-leg wave-3
// field-fight log line that is a drive-off line (matches /drove
// .* off/ or /breaks away before it ever closed/) is checked
// against the row's held weapons: a line crediting "with the
// <weapon>" must name a weapon the fighter actually holds
// (meleeEqName, a close-carried def name — approximated by the
// carried id list presence, since rows carry ids not names for
// carried items — or rangedEqName when usable/spear), and a
// no-weapon line must occur only when the fighter holds no
// instrument at all. Because carried names are ids, the check is:
// credited name (lowercased) must appear in meleeEqName /
// rangedEqName (lowercased) OR the row holds a carried close
// weapon whose id lowercased contains the credited token.
// Simpler and stricter in practice: the engine writes the
// credited name from the def, so meleeEqName/rangedEqName cover
// equipped cases; carried cases are checked by id-token match.
// A line crediting "the bow" when the fighter holds no usable bow
// is a LIE. A contact-finish kill/strike line is not a drive-off
// line and is not counted in the lie rate (it is judged in the
// sense reads instead).
//
// Wall numbers are per band, never pooled.
//
// Usage: node scripts/contactfinish-analyze-20261031.js <corpusDir> <seed...> [--out <file>]
// Prints a band summary to stdout; with --out writes the full JSON.
'use strict';
const fs = require('fs');
const path = require('path');
const CB = require(path.join(__dirname, 'contactbreak-analyze-20261031.js'));

function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }
function low(s) { return String(s || '').toLowerCase(); }

function classifyUniverse(f) {
  const hasFields = ('rangedEqId' in f) || ('meleeEqId' in f) || ('ammoAtContact' in f);
  if (!hasFields) return { cls: 'INSTRUMENT-UNCLASSIFIED', reason: 'no-instrument-fields' };
  const meleeHeld = f.meleeEqId != null || (Array.isArray(f.closeCarriedIds) && f.closeCarriedIds.length > 0) ||
    (Array.isArray(f.meleeCarriedIds) && f.meleeCarriedIds.length > 0);
  const spearHeld = f.rangedIsSpear === true || /spear/i.test(f.rangedEqName || '');
  const rangedUsable = f.rangedEqId != null && isNum(f.ammoAtContact) && f.ammoAtContact > 0;
  const finishable = meleeHeld || spearHeld || rangedUsable;
  return { cls: finishable ? 'FINISHABLE' : 'NO-REAL-INSTRUMENT', meleeHeld, spearHeld, rangedUsable,
    instrument: meleeHeld ? 'melee' : (spearHeld ? 'spear' : (rangedUsable ? 'ranged' : 'none')) };
}

function heldNames(f) {
  const names = [];
  if (f.meleeEqName) names.push(low(f.meleeEqName));
  if (f.rangedEqName) names.push(low(f.rangedEqName));
  return names;
}
function creditedWeapon(line) {
  const m = line.match(/with the (.+?) —/);
  return m ? low(m[1]).trim() : null;
}
function isDriveOffLine(line) {
  return /drove .* off/i.test(line) || /breaks away before it ever closed/i.test(line);
}
function checkDriveOffLine(f, line) {
  const credited = creditedWeapon(line);
  if (credited === null) {
    // Honest non-weapon wording: allowed only when the fighter holds
    // no finish instrument at all (unarmed class).
    const u = classifyUniverse(f);
    return u.cls === 'NO-REAL-INSTRUMENT' ? { lie: false } : { lie: true, reason: 'no-weapon line while holding an instrument (' + u.instrument + ')' };
  }
  // Credited weapon must be held: equipped name match, or a carried
  // close id whose token appears in the credited name, or the
  // credited token appears in a held name.
  const names = heldNames(f);
  if (names.some(n => n.indexOf(credited) >= 0 || credited.indexOf(n) >= 0)) return { lie: false };
  const carried = (f.closeCarriedIds || []).concat(f.meleeCarriedIds || []);
  if (carried.some(id => { const t = low(id).replace(/_/g, ' '); return credited.indexOf(t) >= 0 || t.indexOf(credited) >= 0; })) return { lie: false };
  // A credited bow is usable only with ammo; a credited spear is held
  // only when rangedIsSpear or name-matched (already covered above).
  return { lie: true, reason: 'credited "' + credited + '" not held (held: ' + (names.join(', ') || 'none') + ')' };
}

function analyzeSeed(obj) {
  const rows = (obj.fieldFights || []).filter(f => f.wave === 3);
  const contact = [];
  let total = 0, unclassified = 0;
  const converted = [];
  const attempted = [];
  const driveOffChecks = [];
  let w3Deaths = 0;
  for (const f of rows) {
    total++;
    if (f.outcome === 'vDie') w3Deaths++;
    if (f.contactFinishAttempted) attempted.push(f);
    if (f.contactFinishKill) converted.push(f);
    if (Array.isArray(f.log)) {
      for (const line of f.log) {
        if (isDriveOffLine(line)) {
          const chk = checkDriveOffLine(f, line);
          driveOffChecks.push({ seed: String(obj.seed), day: f.day, vid: f.vid, mid: f.mid, line, lie: chk.lie, reason: chk.reason || null });
        }
      }
    }
    const c = CB.classifyRow(f);
    if (c.cls !== 'CONTACT') { if (c.cls === 'UNCLASSIFIED') unclassified++; continue; }
    const inst = classifyUniverse(f);
    contact.push(Object.assign({ seed: String(obj.seed), day: f.day, vid: f.vid, mid: f.mid,
      outcome: f.outcome, rounds: f.rounds, mHpStart: f.mHpStart, mMaxHp: f.mMaxHp,
      mDealt: f.mDealt, intent: f.intent || null, caller: f.caller || null,
      log: f.log || null }, inst));
  }
  const mFlee = contact.filter(r => r.outcome === 'mFlee');
  const evade = contact.filter(r => r.outcome === 'evade');
  const finishableMflee = mFlee.filter(r => r.cls === 'FINISHABLE');
  const noInstrMflee = mFlee.filter(r => r.cls === 'NO-REAL-INSTRUMENT');
  const lies = driveOffChecks.filter(d => d.lie);
  return { seed: obj.seed, total, contactN: contact.length, unclassified,
    mFleeN: mFlee.length, evadeN: evade.length,
    finishableMfleeN: finishableMflee.length, noInstrMfleeN: noInstrMflee.length,
    finishableN: contact.filter(r => r.cls === 'FINISHABLE').length,
    noRealInstrumentN: contact.filter(r => r.cls === 'NO-REAL-INSTRUMENT').length,
    instrumentUnclassifiedN: contact.filter(r => r.cls === 'INSTRUMENT-UNCLASSIFIED').length,
    contact, attemptedN: attempted.length, convertedN: converted.length,
    converted, attempted: attempted.map(f => ({ seed: String(obj.seed), day: f.day, vid: f.vid, mid: f.mid, weapon: f.contactFinishWeapon, dmg: f.contactFinishDmg, instrument: f.contactFinishInstrument, beastHp: f.contactFinishBeastHp, outcome: f.outcome })),
    driveOffLinesN: driveOffChecks.length, driveOffLiesN: lies.length, driveOffLies: lies,
    w3Deaths,
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
  if (!corpusDir || !seedArgs.length) { console.error('usage: contactfinish-analyze-20261031.js <corpusDir> <seed...> [--out <file>]'); process.exit(2); }
  const perSeed = [];
  for (const seed of seedArgs) {
    const obj = JSON.parse(fs.readFileSync(path.join(corpusDir, 'leadfeast', `s${seed}.json`), 'utf8'));
    perSeed.push(analyzeSeed(obj));
  }
  const sum = (fn) => perSeed.reduce((a, s) => a + (fn(s) || 0), 0);
  const median = (xs) => { const s = xs.slice().sort((a, b) => a - b); if (!s.length) return null; const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const band = { seeds: seedArgs.map(Number), nSeeds: perSeed.length,
    national: sum(s => s.national), table: sum(s => s.table), won: sum(s => s.won),
    wave4: sum(s => s.wave4), wave5: sum(s => s.wave5),
    medianSurvival: median(perSeed.map(s => s.gameDays)), maxSurvival: Math.max.apply(null, perSeed.map(s => s.gameDays)),
    fullSeat: perSeed.every(s => s.fullSeat != null) ? sum(s => s.fullSeat) : null,
    total: sum(s => s.total), contactN: sum(s => s.contactN), unclassified: sum(s => s.unclassified),
    mFleeN: sum(s => s.mFleeN), evadeN: sum(s => s.evadeN),
    finishableMfleeN: sum(s => s.finishableMfleeN), noInstrMfleeN: sum(s => s.noInstrMfleeN),
    finishableN: sum(s => s.finishableN), noRealInstrumentN: sum(s => s.noRealInstrumentN),
    instrumentUnclassifiedN: sum(s => s.instrumentUnclassifiedN),
    attemptedN: sum(s => s.attemptedN), convertedN: sum(s => s.convertedN),
    driveOffLinesN: sum(s => s.driveOffLinesN), driveOffLiesN: sum(s => s.driveOffLiesN),
    lieRateRemaining: sum(s => s.driveOffLinesN) ? sum(s => s.driveOffLiesN) / sum(s => s.driveOffLinesN) : null,
    w3Deaths: sum(s => s.w3Deaths) };
  const result = { band, perSeed };
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 1) + '\n');
  console.log(JSON.stringify(band, null, 1));
  for (const s of perSeed) {
    console.log(`s${s.seed}: total=${s.total} contact=${s.contactN} (mFlee ${s.mFleeN} evade ${s.evadeN}) BUILD-universe=${s.finishableMfleeN} noInstrMflee=${s.noInstrMfleeN} attempted=${s.attemptedN} converted=${s.convertedN} driveOffLines=${s.driveOffLinesN} lies=${s.driveOffLiesN} w3Deaths=${s.w3Deaths} nat=${s.national} table=${s.table} won=${s.won} w4=${s.wave4} w5=${s.wave5} days=${s.gameDays} seat=${s.bestSeat}`);
  }
}
if (require.main === module) main();
module.exports = { analyzeSeed, classifyUniverse, checkDriveOffLine, creditedWeapon, isDriveOffLine };
