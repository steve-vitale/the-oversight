// scripts/analyze-journey-scale-r66-20261101.js — journey-scale r66 analyzer.
// Q1 WEAPONLESS-SPLIT: decomposes daily wsplit rows per the r66 prereg
// (effective-knower, armed class, matsOK, cooldown, eligible upper bound,
// transition rule for unexplained non-attempts, stick counterfactual).
// Q3 counts: weapon-craft lines + deadfall-duty lines per capture.
// Purity: capture diff vs r65 committed capture + census scalars vs r65.
// Usage: node scripts/analyze-journey-scale-r66-20261101.js [EVIDIR]
// Defaults: evidence/2026-11-01/journey-scale-r66, seeds 85001-85004.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const LADDER = ['hunting_spear', 'fire_hardened_spear', 'bow', 'crude_bow'];

function loadJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function itemIdOf(e) {
  if (typeof e === 'string') return e;
  if (!e) return null;
  return e.itemId || e.id || null;
}
function packMatCount(pack, mat, weaponSet, armorSet) {
  let n = 0;
  for (const e of (pack || [])) {
    if (typeof e === 'string') { if (e === mat) n += 1; continue; }
    if (!e) continue;
    if (e.material === mat) { n += 1; continue; }
    if ((e.itemId === mat || e.id === mat) && !weaponSet.has(mat) && !armorSet.has(mat)) n += 1;
  }
  return n;
}

// classifyRow(row, pile, weaponSet, armorSet, recipesById) -> prereg classes.
// row: {day, vid, dead, away, equipped[], pack[], stashed[], wc{}, cd}
// Returns null for non-home rows (dead/away/missing).
function classifyRow(row, pile, weaponSet, armorSet, recipesById) {
  if (!row || row.missing || row.dead || row.away) return null;
  const day = row.day;
  const ownGear = [].concat(row.equipped || [], (row.pack || []).map(itemIdOf).filter(Boolean), (row.stashed || []).map(itemIdOf).filter(Boolean));
  let firstKnown = null;
  for (const rung of LADDER) {
    const recorded = ((row.wc || {})[rung] || 0) >= 1;
    const seeded = ownGear.indexOf(rung) >= 0;
    if (recorded || seeded) { firstKnown = rung; break; }
  }
  const armedItems = [].concat(row.equipped || [], (row.pack || []).map(itemIdOf).filter(Boolean)).filter(id => weaponSet.has(id));
  let armedClass = 'none';
  if (armedItems.length) {
    const hasStick = armedItems.indexOf('sharpened_stick') >= 0;
    const hasReal = armedItems.some(id => id !== 'sharpened_stick');
    armedClass = (hasStick && hasReal) ? 'both' : (hasStick ? 'stick-only' : 'real');
  }
  let matsOK = false, matsDetail = null;
  if (firstKnown) {
    const recipe = recipesById[firstKnown] || {};
    const mats = recipe.materials || {};
    matsDetail = {};
    matsOK = true;
    for (const [m, need] of Object.entries(mats)) {
      const have = packMatCount(row.pack, m, weaponSet, armorSet) + ((pile || {})[m] || 0);
      matsDetail[m] = { need, have };
      if (have < need) matsOK = false;
    }
  }
  const cd = (row.cd === undefined || row.cd === null) ? null : row.cd;
  const cooldownClear = (cd === null || cd <= day - 3);
  const knower = !!firstKnown;
  const weaponless = armedClass === 'none';
  const eligible = knower && weaponless && matsOK && cooldownClear;
  return { day, vid: row.vid, knower, firstKnown, armedClass, armedItems, matsOK, matsDetail, cd, cooldownClear, weaponless, eligible };
}

function analyzeSeed(evidir, r65dir, seed, weaponSet, armorSet, recipesById) {
  const wsplitPath = path.join(evidir, `journey-scale-r66-wsplit-${seed}.json`);
  const rows = fs.existsSync(wsplitPath) ? loadJson(wsplitPath) : [];
  const byVid = {}; // vid -> [{day, cls, pile}] in day order
  const totals = { villagerDays: 0, knowerDays: 0, stickOnlyDays: 0, realArmedDays: 0, bothArmedDays: 0, weaponlessKnowerDays: 0, weaponlessKnowerMatsDays: 0, eligibleDays: 0, stickBlockedDays: 0, attempts: 0 };
  const blockShares = { armed: 0, mats: 0, cooldown: 0 };
  for (const dayRow of rows) {
    for (const r of (dayRow.rows || [])) {
      const cls = classifyRow(r, dayRow.pile, weaponSet, armorSet, recipesById);
      if (!cls) continue;
      totals.villagerDays++;
      if (cls.knower) totals.knowerDays++;
      if (cls.knower && cls.armedClass === 'stick-only') totals.stickOnlyDays++;
      if (cls.knower && cls.armedClass === 'real') totals.realArmedDays++;
      if (cls.knower && cls.armedClass === 'both') totals.bothArmedDays++;
      if (cls.knower && cls.weaponless) {
        totals.weaponlessKnowerDays++;
        if (cls.matsOK) totals.weaponlessKnowerMatsDays++;
        if (!cls.matsOK) blockShares.mats++;
        else if (!cls.cooldownClear) blockShares.cooldown++;
      }
      if (cls.knower && !cls.weaponless) blockShares.armed++;
      if (cls.knower && cls.armedClass === 'stick-only' && cls.matsOK && cls.cooldownClear) totals.stickBlockedDays++;
      if (cls.eligible) totals.eligibleDays++;
      (byVid[cls.vid] = byVid[cls.vid] || []).push(cls);
    }
  }
  // Attempts: Cd advances per villager (a new Cd value appearing).
  for (const vid of Object.keys(byVid)) {
    const seq = byVid[vid];
    let prev = null;
    for (const cls of seq) {
      if (cls.cd !== null && cls.cd !== prev) totals.attempts++;
      prev = cls.cd;
    }
  }
  // Transitions: eligible day D, next row still weaponless+knower+matsOK with Cd unchanged.
  const unexplained = [];
  for (const vid of Object.keys(byVid)) {
    const seq = byVid[vid];
    for (let i = 0; i + 1 < seq.length; i++) {
      const a = seq[i], b = seq[i + 1];
      if (a.eligible && b.knower && b.weaponless && b.matsOK && b.cd === a.cd) {
        unexplained.push({ vid, day: a.day, nextDay: b.day, firstKnown: a.firstKnown, cd: a.cd });
      }
    }
  }
  // Capture counts + purity vs r65.
  const capPath = path.join(evidir, `journey-scale-r66-capture-${seed}.txt`);
  const cap = fs.existsSync(capPath) ? fs.readFileSync(capPath, 'utf8') : '';
  const capLines = cap ? cap.split('\n') : [];
  const wcLines = capLines.filter(s => /spent the afternoon at the workbench and made/.test(s)).length;
  const deadfallLines = capLines.filter(s => /deadfall/i.test(s) && !/gathers deadfall —/.test(s)).length;
  const deadfallDutyLines = capLines.filter(s => /gathers deadfall —/.test(s)).length;
  let diffLines = null, firstDiff = null;
  const r65cap = path.join(r65dir, `journey-scale-r65-capture-${seed}.txt`);
  if (fs.existsSync(r65cap) && fs.existsSync(capPath)) {
    const d = spawnSync('diff', [r65cap, capPath], { encoding: 'utf8' });
    const out = (d.stdout || '');
    diffLines = out.split('\n').filter(l => l.startsWith('<') || l.startsWith('>')).length;
    if (diffLines > 0) {
      const a = capLines, b = fs.readFileSync(r65cap, 'utf8').split('\n');
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if (a[i] !== b[i]) { firstDiff = { line: i + 1, r65: (b[i] || '').slice(0, 160), r66: (a[i] || '').slice(0, 160) }; break; }
      }
    }
  }
  // Census scalars vs r65.
  let census = null, censusDiff = null;
  const trustPath = path.join(evidir, `journey-scale-r66-trust-${seed}.json`);
  const r65trust = path.join(r65dir, `journey-scale-r65-trust-${seed}.json`);
  if (fs.existsSync(trustPath)) census = loadJson(trustPath).census || null;
  if (census && fs.existsSync(r65trust)) {
    const rc = loadJson(r65trust).census || {};
    censusDiff = {};
    for (const k of Object.keys(census)) {
      if (JSON.stringify(census[k]) !== JSON.stringify(rc[k])) censusDiff[k] = { r65: rc[k], r66: census[k] };
    }
    // Only report scalar keys (skip deathLog detail by keeping it, it is comparable too).
  }
  return { seed, totals, blockShares, unexplained: unexplained.slice(0, 20), unexplainedCount: unexplained.length, wcLines, deadfallLines, deadfallDutyLines, diffLines, firstDiff, census, censusDiff };
}

function main() {
  const evid = process.argv[2] || path.join(ROOT, 'evidence', '2026-11-01', 'journey-scale-r66');
  const r65dir = path.join(ROOT, 'evidence', '2026-10-31', 'journey-scale-r65');
  const items = loadJson(path.join(ROOT, 'src', 'data', 'items.json'));
  const recipes = loadJson(path.join(ROOT, 'src', 'data', 'recipes.json'));
  const weaponSet = new Set(items.filter(d => d.weapon).map(d => d.id));
  const armorSet = new Set(items.filter(d => d.armor).map(d => d.id));
  const recipesById = {};
  for (const r of recipes) recipesById[r.id] = r;
  const out = {};
  for (const seed of [85001, 85002, 85003, 85004]) {
    out[seed] = analyzeSeed(evid, r65dir, seed, weaponSet, armorSet, recipesById);
    const s = out[seed];
    console.log(`seed ${seed}: villagerDays=${s.totals.villagerDays} knowerDays=${s.totals.knowerDays} armed(stick-only=${s.totals.stickOnlyDays} real=${s.totals.realArmedDays} both=${s.totals.bothArmedDays}) weaponlessKnower=${s.totals.weaponlessKnowerDays} eligibleDays=${s.totals.eligibleDays} attempts(Cd)=${s.totals.attempts} unexplained=${s.unexplainedCount} stickBlocked=${s.totals.stickBlockedDays} wcLines=${s.wcLines} deadfallDuty=${s.deadfallDutyLines} captureDiff=${s.diffLines} censusDiffKeys=${s.censusDiff ? Object.keys(s.censusDiff).length : 'n/a'}`);
  }
  fs.writeFileSync(path.join(evid, 'journey-scale-r66-wsplit-analysis.json'), JSON.stringify(out, null, 1));
}
if (require.main === module) main();
module.exports = { classifyRow, LADDER, packMatCount };
