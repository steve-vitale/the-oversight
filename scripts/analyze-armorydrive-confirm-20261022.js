#!/usr/bin/env node
// analyze-armorydrive-confirm-20261022.js — the pre-registered judge for the
// sim-armorydrive CONFIRM (see the confirm brief at
// ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/
// arm-briefs-20261022/sim-armorydrive-confirm-brief.md, §14 binding header).
//
// Reads evidence/2026-10-22/perseed-armorydrive-confirm/*.json and prints:
//   PRIMARY: villager wave-4 kills (kill-time attributed, killdisc v2) —
//     armed total >= control total + 2 AND >=4/16 armed SEEDS with >=1
//     villager wave-4 kill (a seed counts if EITHER policy config reaches
//     it; the pilot's 3/8 rate kept as a 25% floor; 12-seed fallback bar
//     >=3/12 — recorded in metric review if used).
//   GUARDRAILS: median survival |diff|<=10d (matched per-seed); starvation
//     <= control+2; no new death mode (>=2-event rule); wave-4 unlocks
//     armed >= control; armor not bled (#735: end-run armored P>=10 median
//     armed >= control median - 1); laundering (scholar >80% of kill-fight
//     damage) armed <= control + 2; scholar-combat-mortality/100d (paired:
//     mean of per-(seed,policy) paired differences of combat*100/gameDays)
//     armed <= control + 2 (NEW per the pilot's metric review; the pilot's
//     +4.4/100d turnover cost is the honest risk being bounded).
//   MECHANISM (diagnostic): companion damage per wave-4 fight, armed/control
//     >= 1.25x expected; if the primary GOes without damage movement,
//     record as luck/staging.
//   WALL: national / table / wins / exiled, wave 4-5 unlocks, w5vets2,
//     median/max survival, death-cause shares.
//
// Usage: node scripts/analyze-armorydrive-confirm-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-22', 'perseed-armorydrive-confirm');
// FRESH_SEEDS — verified 0 filename hits across evidence/ + scripts/ on
// master before the confirm sweep (see evidence file for verification log).
const SEEDS = [65471, 65472, 65473, 65474, 65475, 65476, 65477, 65478,
               65479, 65480, 65481, 65482, 65483, 65484, 65485, 65486];
const POLICIES = ['leadfeast', 'belongfeast'];

function load(arm) {
  const rows = [];
  for (const p of POLICIES) {
    const tag = arm === 'control' ? p : p + '-armorydrive';
    for (const s of SEEDS) {
      const fp = path.join(DIR, `${arm}-${tag}-s${s}.json`);
      if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
      rows.push({ policy: p, seed: s, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
    }
  }
  return rows;
}
function med(a) {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
// Villager-attributed wave-4 kill events (kill-time, sim-killtime):
// by != bearerAtKill && by != 'player'.
function villagerW4Kills(r) {
  return (r.w4killsDetail || []).filter(e => e.by && e.by !== 'player' && e.by !== e.bearerAtKill);
}
const control = load('control');
const armed = load('armorydrive');

const cVK = control.map(r => villagerW4Kills(r.r).length);
const aVK = armed.map(r => villagerW4Kills(r.r).length);
const cVKsum = cVK.reduce((t, x) => t + x, 0), aVKsum = aVK.reduce((t, x) => t + x, 0);
function seedsWith(rows) {
  const out = [];
  for (const s of SEEDS) {
    const cfgs = rows.filter(r => r.seed === s);
    if (cfgs.some(r => villagerW4Kills(r.r).length >= 1)) out.push(s);
  }
  return out;
}
const cSeeds = seedsWith(control), aSeeds = seedsWith(armed);
const seedBar = SEEDS.length >= 16 ? 4 : 3;
const primaryA = aVKsum >= cVKsum + 2;
const primaryB = aSeeds.length >= seedBar;

console.log('=== PRIMARY (binding) ===');
console.log(`villager wave-4 kills: control=${cVKsum} armed=${aVKsum} (bar: armed >= control+2 = ${cVKsum + 2}) -> ${primaryA ? 'GO' : 'NO-GO'}`);
console.log(`armed seeds with >=1 villager wave-4 kill: ${aSeeds.length}/${SEEDS.length} [${aSeeds.join(',')}] (bar >=${seedBar}/${SEEDS.length}) -> ${primaryB ? 'GO' : 'NO-GO'}`);
console.log(`control seeds with >=1: ${cSeeds.length}/${SEEDS.length} [${cSeeds.join(',')}]`);
console.log(`VERDICT: ${primaryA && primaryB ? 'GO' : 'NO-GO'} (§14 — not re-scored)`);

console.log('\n=== GUARDRAILS (binding) ===');
function perSeedMed(rows) {
  return SEEDS.map(s => med(rows.filter(r => r.seed === s).map(r => r.r.gameDays || 0)));
}
const cSurv = med(perSeedMed(control)), aSurv = med(perSeedMed(armed));
const gSurv = Math.abs(aSurv - cSurv) <= 10;
console.log(`median survival: control=${cSurv.toFixed(1)}d armed=${aSurv.toFixed(1)}d diff=${(aSurv - cSurv).toFixed(1)} (bar |diff|<=10) -> ${gSurv ? 'PASS' : 'FAIL'}`);
const cStarv = control.reduce((t, r) => t + (r.r.starvationDeaths | 0), 0);
const aStarv = armed.reduce((t, r) => t + (r.r.starvationDeaths | 0), 0);
const gStarv = aStarv <= cStarv + 2;
console.log(`starvation deaths: control=${cStarv} armed=${aStarv} (bar <= ${cStarv + 2}) -> ${gStarv ? 'PASS' : 'FAIL'}`);
// New death mode: >=2 events armed, 0 control.
const cModes = {}, aModes = {};
for (const r of control) for (const [k, v] of Object.entries(r.r.deathCauses || {})) cModes[k] = (cModes[k] || 0) + v;
for (const r of armed) for (const [k, v] of Object.entries(r.r.deathCauses || {})) aModes[k] = (aModes[k] || 0) + v;
const newModes = Object.keys(aModes).filter(k => aModes[k] >= 2 && !(cModes[k] | 0));
console.log(`new death modes (>=2 events, 0 control): ${newModes.length ? newModes.join(', ') : 'none'} -> ${newModes.length ? 'FAIL' : 'PASS'}`);
const cW4 = control.filter(r => r.r.wave4).length, aW4 = armed.filter(r => r.r.wave4).length;
const gW4 = aW4 >= cW4;
console.log(`wave-4 unlocks: control=${cW4}/${control.length} armed=${aW4}/${armed.length} (bar armed >= control) -> ${gW4 ? 'PASS' : 'FAIL'}`);
const cArm = med(control.map(r => r.r.armoredVillagersP10 | 0)), aArm = med(armed.map(r => r.r.armoredVillagersP10 | 0));
const gArm = aArm >= cArm - 1;
console.log(`armor (end-run armored P>=10, median): control=${cArm} armed=${aArm} (bar >= ${cArm - 1}) -> ${gArm ? 'PASS' : 'FAIL'} [#735 catch-22]`);
// Laundering: villager-attributed wave-4 kill where scholar dealt >80% of
// the kill fight's damage (killdisc per-source dmg table, joined by day+mid).
function launderedCount(rows) {
  let n = 0;
  const detail = [];
  for (const r of rows) {
    for (const e of villagerW4Kills(r.r)) {
      const row = (r.r.w4killRows || []).find(k => k.day === e.d && k.mid === e.mid && k.by === e.by);
      if (!row || row.dmgScholar == null) continue;
      const tot = (row.dmgScholar | 0) + (row.dmgCompanion | 0) + (row.dmgOther | 0);
      if (tot <= 0) continue;
      const share = row.dmgScholar / tot;
      if (share > 0.8) { n++; detail.push({ seed: r.seed, policy: r.policy, day: e.d, mid: e.mid, by: e.byName, share: share.toFixed(2) }); }
    }
  }
  return { n, detail };
}
const cL = launderedCount(control), aL = launderedCount(armed);
const gL = aL.n <= cL.n + 2;
console.log(`laundered villager kills (scholar >80% of fight dmg): control=${cL.n} armed=${aL.n} (bar <= ${cL.n + 2}) -> ${gL ? 'PASS' : 'FAIL'}`);
if (aL.detail.length) console.log('  armed laundered:', JSON.stringify(aL.detail));
// NEW guardrail (pilot metric review): scholar-combat-mortality per 100d,
// paired per (seed, policy): mean of (armed_rate - control_rate),
// rate = deathCauses.combat * 100 / gameDays.
function combatRate(r) {
  const gd = r.gameDays || 0;
  if (gd <= 0) return null;
  return ((r.deathCauses || {}).combat | 0) * 100 / gd;
}
const pairDeltas = [], pairRows = [];
for (const s of SEEDS) {
  for (const p of POLICIES) {
    const cr = control.find(r => r.seed === s && r.policy === p);
    const ar = armed.find(r => r.seed === s && r.policy === p);
    const cRate = combatRate(cr.r), aRate = combatRate(ar.r);
    if (cRate == null || aRate == null) continue;
    pairDeltas.push(aRate - cRate);
    pairRows.push({ seed: s, policy: p, c: cRate.toFixed(2), a: aRate.toFixed(2), d: (aRate - cRate).toFixed(2) });
  }
}
const meanDelta = pairDeltas.reduce((t, x) => t + x, 0) / pairDeltas.length;
const medDelta = med(pairDeltas.slice().sort((x, y) => x - y));
const posPairs = pairDeltas.filter(d => d > 0).length;
const gMort = meanDelta <= 2;
console.log(`scholar-combat-mortality/100d (paired, n=${pairDeltas.length} pairs): mean armed-control delta=${meanDelta.toFixed(2)} median=${medDelta.toFixed(2)} positive=${posPairs}/${pairDeltas.length} (bar mean <= +2) -> ${gMort ? 'PASS' : 'FAIL'}`);
const allGuard = gSurv && gStarv && !newModes.length && gW4 && gArm && gL && gMort;
console.log(`GUARDRAILS OVERALL: ${allGuard ? 'ALL PASS' : 'FAIL — see above'}`);

console.log('\n=== MECHANISM (diagnostic, not binding) ===');
function fightDmg(rows) {
  const out = [];
  for (const r of rows) for (const f of (r.r.w4FightDmg || [])) out.push(f.companion | 0);
  return out;
}
const cFD = fightDmg(control), aFD = fightDmg(armed);
const cFDM = cFD.length ? cFD.reduce((t, x) => t + x, 0) / cFD.length : 0;
const aFDM = aFD.length ? aFD.reduce((t, x) => t + x, 0) / aFD.length : 0;
console.log(`companion dmg per wave-4 fight: control=${cFDM.toFixed(1)} (n=${cFD.length}) armed=${aFDM.toFixed(1)} (n=${aFD.length}) ratio=${cFDM > 0 ? (aFDM / cFDM).toFixed(2) : 'n/a'}x (bar >=1.25x)`);
const cArmedC = med(control.map(r => r.r.armedVillagers | 0)), aArmedC = med(armed.map(r => r.r.armedVillagers | 0));
console.log(`end-run armed villagers (wbonus>=12, median): control=${cArmedC} armed=${aArmedC}`);
const cDon = control.reduce((t, r) => t + (r.r.donations | 0), 0), aDon = armed.reduce((t, r) => t + (r.r.donations | 0), 0);
const aInv = armed.reduce((t, r) => t + (r.r.invites | 0), 0);
const aAdD = armed.reduce((t, r) => t + ((r.r.ad || {}).adDonations | 0), 0);
const aAdC = armed.reduce((t, r) => t + ((r.r.ad || {}).adCraftDonations | 0), 0);
const aBonus = armed.reduce((t, r) => t + ((r.r.ad || {}).adDonatedBonus | 0), 0);
console.log(`donations: control=${cDon} armed=${aDon} (layer adDonations=${aAdD}, craft=${aAdC}, bonus-sum=${aBonus}); invites armed=${aInv}`);
const cEng = control.reduce((t, r) => t + (r.r.w4EngageEvents | 0), 0), aEng = armed.reduce((t, r) => t + (r.r.w4EngageEvents | 0), 0);
console.log(`wave-4 engagement events (party>=1): control=${cEng} armed=${aEng}`);

console.log('\n=== WALL ===');
function wall(rows) {
  return {
    national: rows.filter(r => r.r.national).length,
    table: rows.filter(r => r.r.table).length,
    won: rows.filter(r => r.r.won).length,
    exiled: rows.filter(r => r.r.exiled).length,
    wave4: rows.filter(r => r.r.wave4).length,
    wave5: rows.filter(r => r.r.wave5).length,
    vets2: rows.filter(r => (r.r.w5vetsMax | 0) >= 2).length,
    medSurv: med(rows.map(r => r.r.gameDays || 0)).toFixed(0),
    maxSurv: Math.max(...rows.map(r => r.r.gameDays || 0)),
  };
}
console.log('control:', JSON.stringify(wall(control)));
console.log('armed:  ', JSON.stringify(wall(armed)));
console.log('death-cause shares control:', JSON.stringify(cModes));
console.log('death-cause shares armed:  ', JSON.stringify(aModes));

console.log('\n=== PER-SEED villager wave-4 kills (armed) ===');
for (const s of SEEDS) {
  const cfgs = armed.filter(r => r.seed === s);
  const kills = cfgs.flatMap(r => villagerW4Kills(r.r).map(e => `${r.policy}:d${e.d} ${e.mid} by ${e.byName || e.by}`));
  console.log(`s${s}: ${kills.length ? kills.join(' | ') : '—'}`);
}
const iErr = control.concat(armed).reduce((t, r) => t + ((r.r.instrumentErrors || []).length), 0);
console.log(`\ninstrument errors: ${iErr}`);
