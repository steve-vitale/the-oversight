#!/usr/bin/env node
// analyze-armorydrive-20261022.js — the pre-registered judge for the
// sim-armorydrive pilot (see evidence/2026-10-22/sim-armorydrive.md,
// §14 binding header).
//
// Reads evidence/2026-10-22/perseed-armorydrive/*.json and prints:
//   PRIMARY: villager wave-4 kills (kill-time attributed) — armed total >=
//     control total + 2 AND >=2/8 armed seeds with >=1 villager wave-4 kill
//     (either config).
//   GUARDRAILS: median survival |diff|<=10d; starvation <= control+2; no new
//     death mode (>=2-event rule); wave-4 unlocks armed >= control; armor
//     not bled (end-run armored P>=10 median >= control median - 1);
//     laundering (scholar >80% of kill-fight damage) armed <= control + 2.
//   MECHANISM (diagnostic): companion damage per wave-4 fight, armed/control.
//   WALL: national / table / wins, wave 4-5 unlocks, median survival.
//
// Usage: node scripts/analyze-armorydrive-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-22', 'perseed-armorydrive');
const SEEDS = [65461, 65462, 65463, 65464, 65465, 65466, 65467, 65468];
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
const primaryA = aVKsum >= cVKsum + 2;
const primaryB = aSeeds.length >= 2;

console.log('=== PRIMARY (binding) ===');
console.log(`villager wave-4 kills: control=${cVKsum} armed=${aVKsum} (bar: armed >= control+2 = ${cVKsum + 2}) -> ${primaryA ? 'GO' : 'NO-GO'}`);
console.log(`armed seeds with >=1 villager wave-4 kill: ${aSeeds.length}/8 [${aSeeds.join(',')}] (bar >=2/8) -> ${primaryB ? 'GO' : 'NO-GO'}`);
console.log(`control seeds with >=1: ${cSeeds.length}/8 [${cSeeds.join(',')}]`);
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
console.log(`wave-4 unlocks: control=${cW4}/16 armed=${aW4}/16 (bar armed >= control) -> ${gW4 ? 'PASS' : 'FAIL'}`);
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

console.log('\n=== MECHANISM (diagnostic, not binding) ===');
function fightDmg(rows) {
  const out = [];
  for (const r of rows) for (const f of (r.r.w4FightDmg || [])) out.push(f.companion | 0);
  return out;
}
const cFD = fightDmg(control), aFD = fightDmg(armed);
const cFDM = cFD.length ? cFD.reduce((t, x) => t + x, 0) / cFD.length : 0;
const aFDM = aFD.length ? aFD.reduce((t, x) => t + x, 0) / aFD.length : 0;
console.log(`companion dmg per wave-4 fight: control=${cFDM.toFixed(1)} (n=${cFD.length}) armed=${aFDM.toFixed(1)} (n=${aFD.length}) ratio=${cFDM > 0 ? (aFDM / cFDM).toFixed(2) : 'n/a'}x`);
// Armed-companion census at end of run (the drive's footprint).
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
    wave4: rows.filter(r => r.r.wave4).length,
    wave5: rows.filter(r => r.r.wave5).length,
    vets2: rows.filter(r => (r.r.w5vetsMax | 0) >= 2).length,
    medSurv: med(rows.map(r => r.r.gameDays || 0)).toFixed(0),
    maxSurv: Math.max(...rows.map(r => r.r.gameDays || 0)),
  };
}
console.log('control:', JSON.stringify(wall(control)));
console.log('armed:  ', JSON.stringify(wall(armed)));

console.log('\n=== PER-SEED villager wave-4 kills (armed) ===');
for (const s of SEEDS) {
  const cfgs = armed.filter(r => r.seed === s);
  const kills = cfgs.flatMap(r => villagerW4Kills(r.r).map(e => `${r.policy}:d${e.d} ${e.mid} by ${e.byName || e.by}`));
  console.log(`s${s}: ${kills.length ? kills.join(' | ') : '—'}`);
}
const iErr = control.concat(armed).reduce((t, r) => t + ((r.r.instrumentErrors || []).length), 0);
console.log(`\ninstrument errors: ${iErr}`);
