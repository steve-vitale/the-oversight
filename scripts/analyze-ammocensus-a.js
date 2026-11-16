// analyze-ammocensus-a.js — analyzer, arm sim-ammocensus-a.
// Reads evidence/2026-11-15/perseed-ammocensus-a/*.json, computes the
// per-meeting census table, pooled classification shares, gate
// over-count rates, volley outcomes, and wall numbers. Writes
// evidence/2026-11-15/ammocensus-a-analysis.json and prints a summary.
// Usage: node scripts/analyze-ammocensus-a.js [--dir <corpus-dir>]
// Exit 0 on success; exit 1 when any per-seed file fails to parse or
// any instrumentErrors are present (those are reported, not hidden).
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const DIR = process.env.CORPUS_DIR || path.join(REPO, 'evidence', '2026-11-15', 'perseed-ammocensus-a');
const OUT = path.join(REPO, 'evidence', '2026-11-15', 'ammocensus-a-analysis.json');

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const files = fs.readdirSync(DIR).filter(function (f) { return /\.json$/.test(f); }).sort();
if (!files.length) { console.error('AMMOCENSUS-ANALYZE STOP: no per-seed files in ' + DIR); process.exit(2); }
const seeds = [];
let parseErrors = 0;
let instrumentErrorCount = 0;
for (const f of files) {
  try {
    const out = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    seeds.push(out);
    instrumentErrorCount += (out.instrumentErrors || []).length;
  } catch (e) {
    parseErrors++;
    console.error('AMMOCENSUS-ANALYZE: parse failure ' + f + ': ' + e.message);
  }
}

// ---- per-meeting census ----
const CLASSES = ['armed-with-ammo', 'armed-no-ammo', 'unarmed', 'unclassified'];
function emptyCounts() { const o = {}; CLASSES.forEach(function (c) { o[c] = 0; }); return o; }
const fighterClass = emptyCounts();
const allyClass = emptyCounts();
const calledAllyClass = emptyCounts();
let meetings = 0, meetingsUnclassified = 0, meetingsWithGate = 0;
let volleyNull = 0, volleyZero = 0, volleyFired = 0, volleyShots = 0, volleyHits = 0, volleyDmg = 0;
let noArrowsLines = 0;
const noArrowsQuotes = [];
const dryNeeds = {}; // ammoNeed -> count of armed-no-ammo fighters
let dryWrongAmmo = 0; // armed-no-ammo with otherAmmoN > 0
let dryOnlyNoMelee = 0; // armed-no-ammo fighters with no melee fallback
let spearSlot = 0; // unarmed fighters with a spear in the ranged slot
let packRanged = 0; // unarmed fighters carrying an unequipped ranged weapon
const perSeed = [];

for (const s of seeds) {
  const ms = s.w4meetings || [];
  const row = { seed: s.seed, days: s.days, endReason: s.endReason, standing: s.standing,
    maxWave: s.maxWave, scaleRank: s.scaleRank, meetings: ms.length, classified: 0,
    unclassified: 0, gateRows: (s.w4gates || []).length,
    fighterClass: emptyCounts(), allyClass: emptyCounts(),
    volleyNull: 0, volleyZero: 0, volleyFired: 0, noArrowsLines: 0 };
  for (const m of ms) {
    meetings++;
    let ok = true;
    const f = m.fighter || {};
    fighterClass[f.class] = (fighterClass[f.class] || 0) + 1;
    row.fighterClass[f.class] = (row.fighterClass[f.class] || 0) + 1;
    if (f.class === 'unclassified' || f.error) ok = false;
    if (f.class === 'armed-no-ammo') {
      dryNeeds[f.ammoNeed || 'unknown'] = (dryNeeds[f.ammoNeed || 'unknown'] || 0) + 1;
      if ((f.otherAmmoN | 0) > 0) dryWrongAmmo++;
      if (!f.meleeWeapon) dryOnlyNoMelee++;
    }
    if (f.class === 'unarmed' && f.spearInRangedSlot) spearSlot++;
    if (f.class === 'unarmed' && f.carriesRangedUnequipped) packRanged++;
    for (const a of (m.allies || [])) {
      allyClass[a.class] = (allyClass[a.class] || 0) + 1;
      row.allyClass[a.class] = (row.allyClass[a.class] || 0) + 1;
      if (a.class === 'unclassified' || a.error) ok = false;
      if (a.class === 'armed-no-ammo') {
        dryNeeds[a.ammoNeed || 'unknown'] = (dryNeeds[a.ammoNeed || 'unknown'] || 0) + 1;
        if ((a.otherAmmoN | 0) > 0) dryWrongAmmo++;
        if (!a.meleeWeapon) dryOnlyNoMelee++;
      }
      if (a.class === 'unarmed' && a.spearInRangedSlot) spearSlot++;
      if (a.class === 'unarmed' && a.carriesRangedUnequipped) packRanged++;
    }
    if (m.calledAlly) {
      calledAllyClass[m.calledAlly.class] = (calledAllyClass[m.calledAlly.class] || 0) + 1;
      if (m.calledAlly.class === 'unclassified' || m.calledAlly.error) ok = false;
      if (m.calledAlly.class === 'armed-no-ammo') {
        dryNeeds[m.calledAlly.ammoNeed || 'unknown'] = (dryNeeds[m.calledAlly.ammoNeed || 'unknown'] || 0) + 1;
        if ((m.calledAlly.otherAmmoN | 0) > 0) dryWrongAmmo++;
        if (!m.calledAlly.meleeWeapon) dryOnlyNoMelee++;
      }
    }
    if (m.gate) meetingsWithGate++;
    if (!ok) { meetingsUnclassified++; row.unclassified++; } else row.classified++;
    if (!m.volley) { volleyNull++; row.volleyNull++; }
    else if ((m.volley.shots | 0) < 1) { volleyZero++; row.volleyZero++; }
    else { volleyFired++; row.volleyFired++; volleyShots += m.volley.shots | 0; volleyHits += m.volley.hits | 0; volleyDmg += m.volley.dmg | 0; }
    const n = (m.noArrowsLines || []).length;
    noArrowsLines += n; row.noArrowsLines += n;
    for (const q of (m.noArrowsLines || [])) {
      if (noArrowsQuotes.length < 10) noArrowsQuotes.push({ seed: s.seed, day: m.day, vid: m.vid, mid: m.mid, line: q });
    }
  }
  perSeed.push(row);
}

// ---- gate over-count ----
let gateRows = 0, gateAllArmedRows = 0, gateOverCountRows = 0, gateOverCountDryOnlyRows = 0;
let gateCountedArmed = 0, gateCountedArmedDryOnly = 0, gateCountedArmedDryAny = 0;
let gateMembers = 0, gateMembersEffectivelyArmed = 0;
const gateOutcomes = {};
for (const s of seeds) {
  for (const g of (s.w4gates || [])) {
    gateRows++;
    gateOutcomes[g.result] = (gateOutcomes[g.result] || 0) + 1;
    if (g.gateAllArmed) gateAllArmedRows++;
    if ((g.overCounted || []).length) gateOverCountRows++;
    if ((g.overCountedDryOnly || []).length) gateOverCountDryOnlyRows++;
    for (const m of (g.members || [])) {
      gateMembers++;
      if (m.effectivelyArmed) gateMembersEffectivelyArmed++;
      if (m.gateArmed) {
        gateCountedArmed++;
        if (m.class === 'armed-no-ammo') {
          gateCountedArmedDryAny++;
          if (!m.meleeWeapon) { gateCountedArmedDryOnly++; }
        }
      }
    }
  }
}

// ---- wall numbers ----
const standings = seeds.map(function (s) { return s.standing; });
const days = seeds.map(function (s) { return s.days; });
const wall = {
  seeds: seeds.length,
  national: seeds.filter(function (s) { return (s.standing || 0) >= 200; }).length,
  table: seeds.filter(function (s) { return !!s.won; }).length,
  wins: seeds.filter(function (s) { return !!s.won; }).length,
  wave4Reached: seeds.filter(function (s) { return (s.maxWave || 1) >= 4; }).length,
  wave5Reached: seeds.filter(function (s) { return (s.maxWave || 1) >= 5; }).length,
  medianSurvival: median(days),
  survived: seeds.filter(function (s) { return s.endReason !== 'village-lost' && !s.villageLost; }).length,
};

const totalFighters = fighterClass['armed-with-ammo'] + fighterClass['armed-no-ammo'] + fighterClass.unarmed;
const totalAllies = allyClass['armed-with-ammo'] + allyClass['armed-no-ammo'] + allyClass.unarmed;
const analysis = {
  arm: 'ammocensus-a', corpusDir: path.relative(REPO, DIR), files: files.length,
  parseErrors: parseErrors, instrumentErrorCount: instrumentErrorCount,
  meetings: meetings, meetingsUnclassified: meetingsUnclassified,
  meetingsWithGate: meetingsWithGate,
  classifiedShare: meetings ? (meetings - meetingsUnclassified) / meetings : null,
  fighterClass: fighterClass, allyClass: allyClass, calledAllyClass: calledAllyClass,
  totalFighters: totalFighters, totalAllies: totalAllies,
  fighterAmmoLessShare: totalFighters ? fighterClass['armed-no-ammo'] / totalFighters : null,
  dryNeeds: dryNeeds, dryWrongAmmo: dryWrongAmmo, dryOnlyNoMelee: dryOnlyNoMelee,
  spearSlot: spearSlot, packRanged: packRanged,
  volley: { null: volleyNull, zero: volleyZero, fired: volleyFired, shots: volleyShots, hits: volleyHits, dmg: volleyDmg },
  noArrowsLines: noArrowsLines, noArrowsQuotes: noArrowsQuotes,
  gate: { rows: gateRows, outcomes: gateOutcomes, gateAllArmedRows: gateAllArmedRows,
    overCountRows: gateOverCountRows, overCountDryOnlyRows: gateOverCountDryOnlyRows,
    overCountRateAmongAllArmed: gateAllArmedRows ? gateOverCountRows / gateAllArmedRows : null,
    members: gateMembers, membersEffectivelyArmed: gateMembersEffectivelyArmed,
    countedArmed: gateCountedArmed, countedArmedDryAny: gateCountedArmedDryAny,
    countedArmedDryOnly: gateCountedArmedDryOnly,
    ammoLessShareAmongCountedArmed: gateCountedArmed ? gateCountedArmedDryAny / gateCountedArmed : null,
    dryOnlyShareAmongCountedArmed: gateCountedArmed ? gateCountedArmedDryOnly / gateCountedArmed : null },
  wall: wall,
  perSeed: perSeed,
};
fs.writeFileSync(OUT, JSON.stringify(analysis, null, 2) + '\n');
console.log(JSON.stringify({
  files: files.length, parseErrors: parseErrors, instrumentErrors: instrumentErrorCount,
  meetings: meetings, unclassified: meetingsUnclassified,
  classifiedShare: analysis.classifiedShare,
  fighterClass: fighterClass, allyClass: allyClass,
  gateRows: gateRows, gateAllArmedRows: gateAllArmedRows,
  overCountRows: gateOverCountRows,
  overCountRateAmongAllArmed: analysis.gate.overCountRateAmongAllArmed,
  countedArmed: gateCountedArmed,
  countedArmedDryAny: gateCountedArmedDryAny,
  countedArmedDryOnly: gateCountedArmedDryOnly,
  ammoLessShareAmongCountedArmed: analysis.gate.ammoLessShareAmongCountedArmed,
  dryOnlyShareAmongCountedArmed: analysis.gate.dryOnlyShareAmongCountedArmed,
  volley: analysis.volley, noArrowsLines: noArrowsLines,
  wall: wall,
  out: path.relative(REPO, OUT),
}, null, 2));
if (parseErrors || instrumentErrorCount) process.exit(1);
