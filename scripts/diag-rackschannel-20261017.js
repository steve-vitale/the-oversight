#!/usr/bin/env node
// scripts/diag-rackchannel-20261017.js — RACKS-CHANNEL CENSUS (sim-rackschannel-b, 2026-10-17, food-economy axis).
//
// Pre-registered census (diagnostic, base substrate — FEASTSCALE_R13=1, SEATDRIVE=0):
//   Q1. What share of SCHOLAR intake is preserved vs fresh? (eat()-level + villageMeal share)
//   Q2. What share of scholar PANTRY draws is preserved vs fresh? (competentEat diet composition)
//   Q3. What share of VILLAGE intake (pantryDraw meal paths) is preserved vs fresh?
//   Q4. How often does the RACKS-FULL guard bind (cook stands down smoking with fresh surplus near-expiry)?
//   Q5. How much does the cook actually smoke when the guard is open?
//
// The channel hypothesis (harvstop-b metric review): competentEat draws preserved-first,
// so the scholar drains the preserved stock that the racks-full guard measures; the guard
// lifts and the cook smokes more fresh surplus before it rots. Census decides whether the
// channel is open-but-saturated, closed-by-no-binding, or open with headroom.
//
// Buckets (match the engine's own guard numerator definition):
//   'pres'    = foodState preserved|rendered (exactly what rackCap counts)
//   'pemmican'= foodState pemmican (the payoff; NOT in the guard numerator)
//   'cooked'  = foodState cooked (competentEat scores 10 like preserved, but NOT in guard numerator)
//   'fresh'   = everything else edible (raw, cleaned, ...)
// scholar intake is instrumented at eat() (inventory deltas, pure read + call-through)
// plus the scholar's own nightly villageMeal share (flag-attributed pantryDraw).
//
// NOTE (2026-10-17): a near-duplicate of this file briefly existed as
// scripts/diag-rackchannel-20261017.js (typo'd name) — the original working
// name from the census run. The typo'd copy was removed; this correctly-
// spelled file is canonical. The census outputs (evidence/
// 2026-10-17/perseed-rackschannel/*.json) are the record of the run.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/diag-rackchannel-20261017.js        # 8-run census
//   FEASTSCALE_R13=1 SEATDRIVE=0 DET=1 node scripts/diag-rackchannel-20261017.js # instrument det-gate
//   SEEDS="4601,4602" node scripts/diag-rackchannel-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
process.env.LEANWINTER_LIB = '1';
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`DIAG STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('DIAG STOP: SEATDRIVE=0 is required (pre-seat substrate).'); process.exit(2); }

// coordinator banned ranges (no banned-seeds.txt in this tree): 4201-4208, 4301-4308, 4401-4408, 4501-4508
const BANNED_RANGES = [[4201, 4208], [4301, 4308], [4401, 4408], [4501, 4508]];
const SEEDS = (process.env.SEEDS || '4601,4602,4603,4604').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
for (const s of SEEDS) {
  if (BANNED_RANGES.some(([a, b]) => s >= a && s <= b)) { console.error(`DIAG STOP: seed ${s} is banned/used.`); process.exit(2); }
}
console.log(`seeds: ${SEEDS.join(',')} (banned-check clean)`);
const DET = process.env.DET === '1';

const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-rackschannel');
try { fs.mkdirSync(OUTDIR, { recursive: true }); } catch (e) {}

function bucket(it) {
  if (!it || (it.kcalEach || 0) <= 0) return 'other';
  const fs2 = it.foodState || '';
  if (fs2 === 'preserved' || fs2 === 'rendered') return 'pres';
  if (fs2 === 'pemmican') return 'pemmican';
  if (fs2 === 'cooked') return 'cooked';
  if (it.edible === false) return 'other';
  return 'fresh';
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

function attachInstruments(Game, t) {
  // --- scholar intake at eat() (inventory deltas) ---
  const origEat = Game.eat ? Game.eat.bind(Game) : null;
  if (origEat) {
    Game.eat = function () {
      let before = null;
      try {
        before = new Map();
        for (const it of (Game.state.scholar.inventory || [])) {
          if (!it) continue;
          before.set(it, { b: bucket(it), k: Math.round((it.kcalEach || 0) * (it.units || 1)) });
        }
      } catch (e) { before = null; }
      const r = origEat.apply(this, arguments);
      try {
        if (before) {
          const after = new Map();
          for (const it of (Game.state.scholar.inventory || [])) {
            if (!it) continue;
            after.set(it, Math.round((it.kcalEach || 0) * (it.units || 1)));
          }
          for (const [ref, info] of before) {
            const a = after.get(ref) || 0;
            const consumed = Math.max(0, info.k - a);
            if (consumed > 0) {
              t.scholarIntake[info.b] = (t.scholarIntake[info.b] || 0) + consumed;
            }
          }
          t.scholarIntake.eatCalls = (t.scholarIntake.eatCalls || 0) + 1;
        }
      } catch (e) {}
      return r;
    };
  }
  // --- scholar pantry-take composition (diet-composition probe) ---
  const origTake = Game.takeFromPantry ? Game.takeFromPantry.bind(Game) : null;
  if (origTake) {
    Game.takeFromPantry = function (idx) {
      let snap = null;
      try {
        const pantry = (Game.state.village || {}).pantry || [];
        const it = pantry[idx];
        if (it) snap = { b: bucket(it), k: Math.round(it.kcalEach || 0) };
      } catch (e) {}
      const r = origTake.apply(this, arguments);
      try { if (snap) { t.scholarTake[snap.b] = (t.scholarTake[snap.b] || 0) + snap.k; t.scholarTake.units = (t.scholarTake.units || 0) + 1; } } catch (e) {}
      return r;
    };
  }
  // --- village pantryDraw meal composition (fresh-first nightly draw) ---
  // scholarMeal flag: villageMeal() (the SCHOLAR's own nightly share) sets it
  // around its single pantryDraw call; villagers' villagerMealDay draws run
  // with it clear. Raid carry-off (no opts) is loss, not intake.
  const origVillageMeal = Game.villageMeal ? Game.villageMeal.bind(Game) : null;
  if (origVillageMeal) {
    Game.villageMeal = function () {
      t._scholarMeal = true;
      try { return origVillageMeal.apply(this, arguments); }
      finally { t._scholarMeal = false; }
    };
  }
  const origDraw = Game.pantryDraw ? Game.pantryDraw.bind(Game) : null;
  if (origDraw) {
    Game.pantryDraw = function (v, want, opts) {
      const out = origDraw.apply(this, arguments);
      try {
        opts = opts || {};
        let kind = null;
        if (opts.cook) kind = t._scholarMeal ? 'scholarMeal' : 'meal'; // scholar's nightly share vs villagers' meals
        else if (opts.exposure) kind = 'ration'; // packKcal dawn rations (cook:false + exposure)
        else return out;                        // raid carry-off etc — loss, not intake
        for (const e of (out.items || [])) {
          const b = bucket(e.item);
          const k = Math.round((e.effectiveKcal || 0) * (e.units || 1));
          const tgt = kind === 'scholarMeal' ? t.scholarMeal : kind === 'meal' ? t.villageMeal : t.villageRation;
          tgt[b] = (tgt[b] || 0) + k;
          tgt.total = (tgt.total || 0) + k;
        }
      } catch (e) {}
      return out;
    };
  }
  // --- racks-full guard beats + smoke resolutions ---
  const beatSay = [];
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  const pushBeat = (msg) => {
    try {
      const m = String(msg || '');
      if (/racks are already full/i.test(m)) {
        t.guard.bindDays++;
        const pk = m.match(/([\d,]+) kcal kept/);
        if (pk) t.guard.pkAtBind = (t.guard.pkAtBind || 0) + parseInt(pk[1].replace(/,/g, ''), 10);
        // eligible fresh near-expiry kcal the cook left fresh (the engine's own eligible loop, read-only)
        try {
          const day = gday(Game);
          const v = Game.state.village || {};
          let fk = 0, fn = 0;
          const isSpoiled = Game.isSpoiled ? Game.isSpoiled.bind(Game) : null;
          for (const it of (v.pantry || [])) {
            if (!it || (it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) continue;
            if (it.bonded) continue;
            if (it.foodState === 'preserved' || it.foodState === 'rendered') continue;
            if ((it.foodKind || '') === 'pemmican') continue;
            if (Game.isKeepsake && Game.isKeepsake(it)) continue;
            const sd = it.spoilDay;
            if (sd === undefined || sd === null || sd >= 9999) continue;
            if (isSpoiled && isSpoiled(it, 0)) continue;
            if (sd - day > 2) continue;
            fk += Math.round((it.kcalEach || 0) * (it.units || 1)); fn++;
          }
          t.guard.freshNearExpiryKcal += fk;
          t.guard.freshNearExpiryStacks += fn;
          beatSay.push(`d${day}: racks-full bind — ${fk.toLocaleString()} kcal fresh near-expiry left unsmoked`);
        } catch (e) {}
      } else if (/worked the smoke racks/i.test(m)) {
        t.smoke.batchDays++;
        const kk = m.match(/\(~([\d,]+) kcal/);
        if (kk) t.smoke.kcal += parseInt(kk[1].replace(/,/g, ''), 10);
      }
    } catch (e) {}
  };
  Game.say = function (msg) { pushBeat(msg); return origSay ? origSay.apply(this, arguments) : msg; };
  if (origSys) Game.sysSay = function (msg) { pushBeat(msg); return origSys.apply(this, arguments); };
  t.beats = beatSay;
}

function newTally() {
  return {
    scholarIntake: {}, scholarTake: {}, scholarMeal: {}, villageMeal: {}, villageRation: {},
    guard: { bindDays: 0, pkAtBind: 0, freshNearExpiryKcal: 0, freshNearExpiryStacks: 0 },
    smoke: { batchDays: 0, kcal: 0 },
    stock: { sumPres: 0, sumPk: 0, sumRoster: 0, days: 0 },
    beats: [],
  };
}

async function oneRun(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'rackschannel-diag', fullTelemetry: false });
  await setupGame(Game);
  const t = newTally();
  attachInstruments(Game, t);
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { if (oSetup) return oSetup(G, ctx); };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      // daily stock snapshot (pre-daily): preserved+rendered stock vs roster
      const v = G.state.village || {};
      let pk = 0, pnr = 0;
      for (const it of (v.pantry || [])) {
        if (!it) continue;
        const k = Math.round((it.kcalEach || 0) * (it.units || 1));
        pk += k;
        const fs2 = it.foodState || '';
        if (fs2 === 'preserved' || fs2 === 'rendered') pnr += k;
      }
      t.stock.sumPk += pk; t.stock.sumPres += pnr;
      t.stock.sumRoster += ((v.roster || []).length || 0);
      t.stock.days++;
    } catch (e) {}
    return oDaily ? oDaily(G, ctx) : undefined;
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
  const tot = (o, keys) => keys.reduce((s, k) => s + (o[k] || 0), 0);
  const out = {
    seed, policy: policyId,
    gameDays: result && result.days, endReason: result && (result.endReason || result.ended),
    scholarIntake: t.scholarIntake,
    scholarTake: t.scholarTake,
    scholarMeal: t.scholarMeal,
    villageMeal: t.villageMeal,
    villageRation: t.villageRation,
    guardBindDays: t.guard.bindDays,
    guardBindFreshKcal: t.guard.freshNearExpiryKcal,
    guardBindFreshStacks: t.guard.freshNearExpiryStacks,
    guardPkAtBind: t.guard.pkAtBind,
    smokeBatchDays: t.smoke.batchDays,
    smokeKcal: t.smoke.kcal,
    avgPresStock: t.stock.days ? Math.round(t.stock.sumPres / t.stock.days) : 0,
    avgPantryStock: t.stock.days ? Math.round(t.stock.sumPk / t.stock.days) : 0,
    avgRoster: t.stock.days ? +(t.stock.sumRoster / t.stock.days).toFixed(1) : 0,
    beats: t.beats.slice(0, 12),
  };
  const fp = path.join(OUTDIR, `diag-${policyId}-s${seed}.json`);
  try { fs.writeFileSync(fp, JSON.stringify(out, null, 1)); } catch (e) {}
  const si = t.scholarIntake, sip = tot(si, ['pres', 'pemmican', 'cooked', 'fresh']);
  const st = t.scholarTake, stp = tot(st, ['pres', 'pemmican', 'cooked', 'fresh']);
  const sm = t.scholarMeal, smp = tot(sm, ['pres', 'pemmican', 'cooked', 'fresh']);
  console.log(`  [${policyId} s${seed}] d=${out.gameDays} end=${out.endReason}`);
  console.log(`    scholar intake total=${Math.round(sip / 1000)}k: pres=${Math.round((si.pres || 0) / 1000)}k pem=${Math.round((si.pemmican || 0) / 1000)}k cook=${Math.round((si.cooked || 0) / 1000)}k fresh=${Math.round((si.fresh || 0) / 1000)}k`);
  console.log(`    scholar pantry-take total=${Math.round(stp / 1000)}k: pres=${Math.round((st.pres || 0) / 1000)}k pem=${Math.round((st.pemmican || 0) / 1000)}k cook=${Math.round((st.cooked || 0) / 1000)}k fresh=${Math.round((st.fresh || 0) / 1000)}k`);
  console.log(`    scholar meal total=${Math.round(smp / 1000)}k: pres=${Math.round((sm.pres || 0) / 1000)}k pem=${Math.round((sm.pemmican || 0) / 1000)}k cook=${Math.round((sm.cooked || 0) / 1000)}k fresh=${Math.round((sm.fresh || 0) / 1000)}k`);
  console.log(`    village meal total=${Math.round((t.villageMeal.total || 0) / 1000)}k: pres=${Math.round((t.villageMeal.pres || 0) / 1000)}k cook=${Math.round((t.villageMeal.cooked || 0) / 1000)}k fresh=${Math.round((t.villageMeal.fresh || 0) / 1000)}k; ration total=${Math.round((t.villageRation.total || 0) / 1000)}k`);
  console.log(`    racks guard: bindDays=${out.guardBindDays} freshNearExpiry=${Math.round(out.guardBindFreshKcal / 1000)}k kcal (${out.guardBindFreshStacks} stacks); smoke: batchDays=${out.smokeBatchDays} kcal=${Math.round(out.smokeKcal / 1000)}k`);
  console.log(`    avgPresStock=${out.avgPresStock.toLocaleString()} avgPantry=${Math.round(out.avgPantryStock / 1000)}k avgRoster=${out.avgRoster}`);
  return out;
}

(async () => {
  if (DET) {
    // instrument det-gate: instrumented vs pristine, 40d, identical seeds
    const runs = [];
    for (let rep = 0; rep < 2; rep++) {
      const { Game } = await loadGame({ seed: 4601, mode: 'rackschannel-det' });
      await setupGame(Game);
      if (rep === 0) attachInstruments(Game, newTally());
      const hashes = [];
      const pol = Object.assign({}, belongfeast);
      const oDaily = belongfeast.daily;
      pol.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return oDaily ? oDaily(G, ctx) : undefined; };
      await quietLog(async () => { await runDays(Game, pol, { days: 40, sampleEvery: 40 }); });
      runs.push(hashes);
    }
    const same = runs[0].length === runs[1].length && runs[0].every((h, i) => h === runs[1][i]);
    console.log(`  ${same ? 'PASS' : 'FAIL'} instrument det-gate: instrumented run byte-identical to pristine — n=${runs[0].length}/${runs[1].length}`);
    if (!same) { console.error('DET-GATE FAILED'); process.exit(3); }
    console.log('DET gate green.');
    return;
  }
  const results = [];
  for (const seed of SEEDS) {
    for (const policyId of ['belongfeast', 'leadfeast']) {
      try { results.push(await oneRun(seed, policyId)); }
      catch (e) { console.log(`  [${policyId} s${seed}] ERROR ${String(e && e.message).slice(0, 140)}`); }
    }
  }
  console.log(`census complete: ${results.length} runs`);
})();
