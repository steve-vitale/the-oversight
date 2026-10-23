#!/usr/bin/env node
// analyze-tierband-20261023.js — the pre-registered judge for
// sim-overtime-yield-b.
//
// BINDING PRE-REGISTRATION (evidence/2026-10-23/sim-overtime-yield-b.md,
// §14 — never re-scored; #829 metric-review proposal adopted):
//   PRIMARY: damage-majority villager wave-4 kills — kill-time villager
//     kills (waveKillLog w=4, by != bearerAtKill, by != 'player') with
//     non-scholar share >= 0.5 of the kill fight's damage.
//     GO = armed total >= control+2 AND >=2/8 armed seeds with >=1
//     damage-majority kill (a seed counts if EITHER policy config reaches it).
//   MECHANISM (reported): tier>=3 wave-4 fights armed: scholar-kill share
//     vs control; tier<3 fights: scSoftens/scHolds vs the splitclose
//     baseline; FEASTED-window attribution of closes.
//   GUARDRAILS (all binding): scholar-combat-mortality/100d paired mean
//     diff <= control+2; median survival (matched, non-winning) >=
//     control-10d; starvation deaths <= control+2; no new death mode
//     (>=2-event rule); laundered kills (scholar >80% of a villager-credited
//     kill's fight damage) <= control+2; wave-4 unlocks not reduced.
//   Wall numbers every run: national/table/wins, wave4-5 unlocks,
//   median/max survival, death-cause shares.
//
// Usage: node scripts/analyze-tierband-20261023.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-23', 'perseed-tierband');

const SEEDS = [65611, 65612, 65613, 65614, 65615, 65616, 65617, 65618];
const POLICIES = ['leadfeast', 'belongfeast'];

function load(arm) {
  const rows = [];
  for (const p of POLICIES) {
    const tag = arm === 'control' ? p : p + '-tierband';
    for (const seed of SEEDS) {
      const fp = path.join(DIR, `${arm}-${tag}-s${seed}.json`);
      if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
      rows.push({ policy: p, seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
    }
  }
  return rows;
}
// Kill-time villager wave-4 kills (sim-killtime MANDATORY).
function villagerKills(r) {
  return (r.w4killsDetail || []).filter(e => e.by && e.by !== 'player' && e.by !== e.bearerAtKill);
}
// Damage join for a kill-time row.
function dmgRow(r, e) {
  return (r.w4killRows || []).find(k => k.day === e.d && k.mid === e.mid && String(k.by) === String(e.by)) || null;
}
// BINDING PRIMARY: damage-majority villager wave-4 kills — kill-time +
// non-scholar share >= 0.5 of the kill fight's damage.
function dmgMajKills(r) {
  const out = [];
  for (const e of villagerKills(r)) {
    const k = dmgRow(r, e);
    if (!k) continue;
    const tot = (k.dmgScholar | 0) + (k.dmgCompanion | 0) + (k.dmgOther | 0);
    if (tot <= 0) continue;
    if (((k.dmgCompanion | 0) + (k.dmgOther | 0)) / tot >= 0.5) out.push({ e, k });
  }
  return out;
}
// TRICKTAG cross-check: companion landed the killing blow.
function tricktagKills(r) {
  return (r.w4killRows || []).filter(k => k.via === 'companion');
}
// Laundered kills: villager-credited (kill-time) but scholar dealt >80%.
function launderedKills(r) {
  const out = [];
  for (const e of villagerKills(r)) {
    const k = dmgRow(r, e);
    if (!k) continue;
    const tot = (k.dmgScholar | 0) + (k.dmgCompanion | 0) + (k.dmgOther | 0);
    if (tot > 0 && (k.dmgScholar | 0) / tot > 0.8) out.push({ day: e.d, mid: e.mid, by: e.by, scholarShare: ((k.dmgScholar | 0) / tot).toFixed(2) });
  }
  return out;
}
function median(a) {
  if (!a.length) return null;
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function sum(a) { return a.reduce((t, x) => t + x, 0); }
// Overtime tier for a kill row: join w4killRows -> w4EngageDetail
// (day+mid) -> tierByFight (fightId) from the fight-start sampler.
function tierOfKill(r, k) {
  try {
    const g = (r.w4EngageDetail || []).find(x => x.day === k.day && x.mid === k.mid && x.fightId);
    if (!g) return null;
    const row = (r.tierByFight || {})[String(g.fightId)];
    return row ? (row.tier | 0) : null;
  } catch (e) { return null; }
}
function isScholarKill(r, k) {
  const e = (r.w4killsDetail || []).find(x => x.d === k.day && x.mid === k.mid && String(x.by) === String(k.by));
  if (!e) return k.by === 'player';
  return e.by === e.bearerAtKill || e.by === 'player';
}

const control = load('control'), armed = load('tierband');
const bySeed = {};
for (const r of [...control, ...armed]) {
  const k = r.seed;
  bySeed[k] = bySeed[k] || { control: {}, armed: {} };
  const arm = control.includes(r) ? 'control' : 'armed';
  bySeed[k][arm][r.policy] = r.r;
}

console.log('=== sim-overtime-yield-b pilot: pre-registered judge ===\n');

// ---------- BINDING PRIMARY ----------
let armedSeeds = 0, controlSeeds = 0;
const armedSeedList = [], controlSeedList = [];
for (const seed of SEEDS) {
  const ac = Object.values(bySeed[seed].armed).some(r => dmgMajKills(r).length >= 1);
  const cc = Object.values(bySeed[seed].control).some(r => dmgMajKills(r).length >= 1);
  if (ac) { armedSeeds++; armedSeedList.push(seed); }
  if (cc) { controlSeeds++; controlSeedList.push(seed); }
}
const armedDM = sum(armed.map(r => dmgMajKills(r.r).length));
const controlDM = sum(control.map(r => dmgMajKills(r.r).length));
console.log('PRIMARY (binding): damage-majority villager wave-4 kills (kill-time + non-scholar share>=0.5)');
console.log(`  armed seeds with >=1: ${armedSeeds}/8 [${armedSeedList.join(',')}] (bar >=2/8)`);
console.log(`  control seeds with >=1: ${controlSeeds}/8 [${controlSeedList.join(',')}]`);
console.log(`  armed kill total: ${armedDM} vs control ${controlDM} (bar >= control+2 = ${controlDM + 2})`);
const primaryGo = armedSeeds >= 2 && armedDM >= controlDM + 2;
console.log(`  VERDICT: ${primaryGo ? 'GO' : 'NO-GO'}`);

console.log('\nPer-seed damage-majority kills (armed lead/belong vs control lead/belong):');
for (const seed of SEEDS) {
  const a = Object.entries(bySeed[seed].armed).map(([p, r]) => `${p}:${dmgMajKills(r).length}`).join(' ');
  const c = Object.entries(bySeed[seed].control).map(([p, r]) => `${p}:${dmgMajKills(r).length}`).join(' ');
  console.log(`  s${seed}  armed[${a}]  control[${c}]`);
}

// ---------- SECONDARY ----------
const armedKT = sum(armed.map(r => villagerKills(r.r).length));
const controlKT = sum(control.map(r => villagerKills(r.r).length));
const armedTT = sum(armed.map(r => tricktagKills(r.r).length));
const controlTT = sum(control.map(r => tricktagKills(r.r).length));
console.log(`\nSECONDARY (reported): kill-time villager kills: armed=${armedKT} control=${controlKT}`);
console.log(`TRICKTAG cross-check (via=companion): armed=${armedTT} control=${controlTT}`);

// ---------- MECHANISM ----------
console.log('\nMECHANISM (reported):');
const tbSum = k => sum(armed.map(r => ((r.r.tb || {})[k] | 0)));
const scSumArmed = k => sum(armed.map(r => ((r.r.sc || {})[k] | 0)));
const scSumControl = k => sum(control.map(r => ((r.r.sc || {})[k] | 0)));
console.log(`  armed tierband counters: tbW4Fights=${tbSum('tbW4Fights')} tbHighTierFights=${tbSum('tbHighTierFights')} tbLowTierFights=${tbSum('tbLowTierFights')} tbHighTierBypasses=${tbSum('tbHighTierBypasses')} tbFightErrors=${tbSum('tbFightErrors')}`);
console.log(`  tier<3 fights: scSoftens armed=${scSumArmed('scSoftens')} control=${scSumControl('scSoftens')}; scHolds armed=${scSumArmed('scHolds')} control=${scSumControl('scHolds')}; scStallFinishes armed=${scSumArmed('scStallFinishes')} control=${scSumControl('scStallFinishes')}`);
console.log(`  control high-tier discipline exposure: control scHolds at all tiers=${scSumControl('scHolds')} (the wasteful holds the arm bypasses)`);

// Tier-split of wave-4 kills by arm.
function tierSplit(rows) {
  const hi = { scholar: 0, villager: 0 }, lo = { scholar: 0, villager: 0 }, unk = { scholar: 0, villager: 0 };
  for (const r of rows) for (const k of (r.r.w4killRows || [])) {
    const tier = tierOfKill(r.r, k);
    const bucket = tier === null ? unk : (tier >= 3 ? hi : lo);
    const scholar = isScholarKill(r.r, k);
    if (scholar) bucket.scholar++; else bucket.villager++;
  }
  return { hi, lo, unk };
}
const tsA = tierSplit(armed), tsC = tierSplit(control);
console.log(`  tier>=3 wave-4 kills — armed: scholar=${tsA.hi.scholar} villager=${tsA.hi.villager} | control: scholar=${tsC.hi.scholar} villager=${tsC.hi.villager}`);
console.log(`  tier<3  wave-4 kills — armed: scholar=${tsA.lo.scholar} villager=${tsA.lo.villager} | control: scholar=${tsC.lo.scholar} villager=${tsC.lo.villager}`);

// Overtime prevalence on the pilot corpus (the sampler, both arms).
function tierHist(rows) {
  const h = {};
  for (const r of rows) for (const fid of Object.keys(r.r.tierByFight || {})) {
    const t = (r.r.tierByFight[fid].tier | 0);
    h[t] = (h[t] | 0) + 1;
  }
  return h;
}
console.log(`  overtime tier histogram (wave-4 TB fights, sampler): control=${JSON.stringify(tierHist(control))} armed=${JSON.stringify(tierHist(armed))}`);

// FEASTED-window attribution of damage-majority closes.
function feastedSplit(rows) {
  let f = 0, s = 0, u = 0;
  for (const r of rows) for (const { k } of dmgMajKills(r.r)) {
    if (k.feasted === true) f++; else if (k.feasted === false) s++; else u++;
  }
  return { feasted: f, sober: s, unknown: u };
}
console.log(`  FEASTED-window attribution of damage-majority closes: armed=${JSON.stringify(feastedSplit(armed))} control=${JSON.stringify(feastedSplit(control))}`);

// Laundering guardrail
const armedLaun = sum(armed.map(r => launderedKills(r.r).length));
const controlLaun = sum(control.map(r => launderedKills(r.r).length));
console.log(`\nLaundered kills (scholar>80% of a villager-credited kill): armed=${armedLaun} control=${controlLaun} (bar <= ${controlLaun + 2}) ${armedLaun <= controlLaun + 2 ? 'PASS' : 'FAIL'}`);

// ---------- GUARDRAILS ----------
console.log('\nGUARDRAILS (all binding):');
const scm = r => (r.scholarCombatDeaths * 100 / Math.max(1, r.gameDays));
const pairedDiffs = [];
for (const seed of SEEDS) for (const p of POLICIES) {
  pairedDiffs.push(scm(bySeed[seed].armed[p]) - scm(bySeed[seed].control[p]));
}
const scmDiff = sum(pairedDiffs) / pairedDiffs.length;
console.log(`  scholar-combat-mortality/100d paired mean diff: ${scmDiff >= 0 ? '+' : ''}${scmDiff.toFixed(2)} (bar <= +2) ${scmDiff <= 2 ? 'PASS' : 'FAIL'}`);
const survDiffs = [];
for (const seed of SEEDS) for (const p of POLICIES) {
  const a = bySeed[seed].armed[p], c = bySeed[seed].control[p];
  if (!a.won && !c.won) survDiffs.push(a.gameDays - c.gameDays);
}
const medSurv = median(survDiffs);
console.log(`  median survival diff (matched, non-winning, n=${survDiffs.length}): ${medSurv} (bar >= -10) ${medSurv >= -10 ? 'PASS' : 'FAIL'}`);
const starvA = sum(armed.map(r => r.r.starvationDeaths)), starvC = sum(control.map(r => r.r.starvationDeaths));
console.log(`  starvation deaths: armed=${starvA} control=${starvC} (bar <= ${starvC + 2}) ${starvA <= starvC + 2 ? 'PASS' : 'FAIL'}`);
// New death mode (>=2 armed events, 0 control).
const dcA = {}, dcC = {};
for (const r of armed) for (const [k, v] of Object.entries(r.r.deathCauses || {})) dcA[k] = (dcA[k] | 0) + v;
for (const r of control) for (const [k, v] of Object.entries(r.r.deathCauses || {})) dcC[k] = (dcC[k] | 0) + v;
const newModes = Object.keys(dcA).filter(k => dcA[k] >= 2 && !(dcC[k] > 0));
console.log(`  new death modes (>=2 armed, 0 control): ${newModes.length ? newModes.map(k => k + '=' + dcA[k]).join(', ') : 'none'} ${newModes.length ? 'FAIL' : 'PASS'}`);
const w4A = sum(armed.map(r => r.r.wave4)), w4C = sum(control.map(r => r.r.wave4));
console.log(`  wave-4 unlocks: armed=${w4A}/16 control=${w4C}/16 (not reduced) ${w4A >= w4C ? 'PASS' : 'FAIL'}`);

// ---------- WALL NUMBERS ----------
console.log('\nWall numbers (16 configs per arm, 180d death-aware):');
const wallLine = rows => `national=${sum(rows.map(r => r.r.national))} table=${sum(rows.map(r => r.r.table))} won=${sum(rows.map(r => r.r.won))} wave4=${sum(rows.map(r => r.r.wave4))}/16 wave5=${sum(rows.map(r => r.r.wave5))}/16 exiled=${sum(rows.map(r => r.r.exiled))} w5vets2max=${rows.filter(r => r.r.w5vetsMax >= 2).length}/16 medSurv=${median(rows.map(r => r.r.gameDays))} maxSurv=${Math.max(...rows.map(r => r.r.gameDays))}`;
console.log(`  control : ${wallLine(control)}`);
console.log(`  tierband: ${wallLine(armed)}`);
console.log('\nDeath-cause shares (armed):');
const tot = sum(Object.values(dcA));
for (const [k, v] of Object.entries(dcA).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  ${k}: ${v} (${(100 * v / tot).toFixed(1)}%)`);
}

const guardPass = scmDiff <= 2 && medSurv >= -10 && starvA <= starvC + 2 && newModes.length === 0 && armedLaun <= controlLaun + 2 && w4A >= w4C;
console.log(`\nOVERALL: primary ${primaryGo ? 'GO' : 'NO-GO'} | guardrails ${guardPass ? 'ALL PASS' : 'FAIL'} | verdict: ${primaryGo && guardPass ? 'GO' : 'NO-GO'}`);
