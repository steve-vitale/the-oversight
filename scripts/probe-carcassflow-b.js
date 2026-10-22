#!/usr/bin/env node
// probe-carcassflow-b.js — REPAIRED (sim-carcasshaul-b, 2026-10-22).
// Carcass-flow census on post-SURPLUSFEED master.
// Question: where does arriving carcass kcal actually go — fast-rot,
// rack-smoked, eaten fresh, hauled out? Per-seed ledger on the
// FEASTSCALE_R13=1 / SEATDRIVE=0 substrate, belongfeast control.
//
// Meat classifier: pantry item whose name matches /meat/i
//   ('Game meat' from duty:hunt, 'Snared meat' / 'Pit meat (x)' from traps,
//   hauled meat from away returns; smoked forms 'X (dried)').
// Buckets (kcal, per seed):
//   meatIn[ch]       arrivals at choke points (stockPantry/stockSurplus/
//                    depositPantryPieces), channel-attributed like the
//                    glut instruments (call-path channel stack)
//   meatSmoked       fresh->preserved conversions by the ENGINE cook duty,
//                    classified by the item's PRE-convert name
//   meatEatenFresh   pantryDraw draws of non-preserved meat (village meals +
//                    player takes; the player share is negligible in sims)
//   meatEatenPres    pantryDraw draws of preserved/rendered meat
//   meatRotFast      rotted within 3d of tagged arrival (the #782 fast-rot)
//   meatRotSlow      rotted after 3d
//   meatEndInv       meat still in the pantry at run end
//   meatOutResidual  meatIn - smoked - eaten - rot - endInv  (donations out,
//                    packed, tribute — the "hauled" bucket, by residual)
// Staffing telemetry:
//   cookStaffed      Game.assignTask(task='cook') calls (base-game competent
//                    upkeep staffing — the post-haul staffing that exists)
//   cookResolves     resolveOneAssignment cook resolutions
//   tenderAfterHaul  cook resolves in a part that saw a meat arrival
// Context (from the shared glut instruments): inflow, rotByCh, rotByChFast,
// dutyPreserved.
//
// The original probe (63 lines) under-instrumented: its /game meat/i ledger
// filter never fired because it read assignments at part-start (one-part
// assignments are deleted after resolution) and its fast-rot bucket was
// empty without explanation. This version instruments the flows directly.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/probe-carcassflow-b.js [seed ...] [--days N]
//   default seeds: 68011..68018, default days: 60
'use strict';
for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`PROBE STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROBE STOP: SEATDRIVE=0 required.'); process.exit(2); }
const { belongfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { attachProbe, dayOf } = require('./probe-glut-instruments');

const isMeat = (it) => /meat/i.test(String((it && it.name) || ''));
const isPreserved = (it) => !!((it && (it.foodState === 'preserved' || it.foodState === 'rendered')));
const kcalOf = (it) => (it ? (it.kcalEach || 0) * (it.units || 1) : 0);

async function oneSeed(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await quietLog(async () => { await setupGame(Game); });
  const W = attachProbe(Game);
  const F = {
    seed, days, daysRun: 0,
    meatIn: {}, meatInTotal: 0,
    meatSmoked: 0, meatEatenFresh: 0, meatEatenPres: 0,
    meatRotFast: 0, meatRotSlow: 0, meatEndInv: 0, meatStartInv: 0,
    cookStaffed: 0, cookResolves: 0, tenderAfterHaul: 0,
    haulParts: 0,
  };
  try {
    for (const it of (((Game.state.village || {}).pantry) || [])) {
      if (it && isMeat(it)) F.meatStartInv += kcalOf(it);
    }
  } catch (e) {}
  const chOf = () => (W.chStack.length ? W.chStack[W.chStack.length - 1] : null);

  // --- meat arrivals at the choke points (reuse W's channel stack) ---
  const noteArrival = (kcal, name) => {
    if (!(kcal > 0)) return;
    if (!/meat/i.test(String(name || ''))) return;
    const ch = chOf() || 'unattributed';
    F.meatIn[ch] = (F.meatIn[ch] || 0) + kcal;
    F.meatInTotal += kcal;
    F._haulDay = dayOf(Game); F._haulPart = Game.dayPart; F.haulParts++;
  };
  for (const m of ['stockPantry', 'depositPantryPieces']) {
    const o = Game[m];
    if (typeof o !== 'function') continue;
    Game[m] = function () {
      const r = o.apply(this, arguments);
      try {
        if (m === 'stockPantry') noteArrival(Math.round(Number(arguments[0]) || 0), arguments[1]);
        else noteArrival(Math.round(Number(r) || 0), (arguments[1] && arguments[1].name) || '');
      } catch (e) {}
      return r;
    };
  }
  // stockSurplus is already wrapped by attachProbe (records inflow); add the meat classifier
  {
    const o = Game.stockSurplus;
    if (typeof o === 'function') Game.stockSurplus = function () {
      const r = o.apply(this, arguments);
      try { noteArrival(Math.round(Number(r) || 0), 'share_surplus'); } catch (e) {}
      return r;
    };
  }

  // --- meat smoked: extend the cook-duty measure (pre-convert name) ---
  {
    const o = Game.resolveOneAssignment;
    Game.resolveOneAssignment = function (vid, a) {
      const isCook = a && a.task === 'cook';
      let before = null;
      if (isCook) {
        F.cookResolves++;
        before = new Map();
        try {
          for (const it of (((Game.state.village || {}).pantry) || [])) {
            if (!it) continue;
            before.set(it, { name: String(it.name || ''), pres: isPreserved(it) });
          }
        } catch (e) {}
      }
      const r = o.apply(this, arguments);
      if (isCook && before) {
        try {
          for (const it of (((Game.state.village || {}).pantry) || [])) {
            if (!it || !isPreserved(it)) continue;
            const b = before.get(it);
            const wasPres = b && b.pres;
            if (!wasPres) {
              // fresh -> preserved transition; classify by pre-convert name
              const preName = b ? b.name : String(it.name || '').replace(/\s*\((smoked|dried)\)\s*$/, '');
              if (/meat/i.test(preName)) F.meatSmoked += kcalOf(it);
            }
          }
          // post-haul timing: cook resolved in a part that saw a meat arrival
          if (F._haulDay === dayOf(Game) && F._haulPart === Game.dayPart) F.tenderAfterHaul++;
        } catch (e) {}
      }
      return r;
    };
  }

  // --- meat eaten: pantryDraw classification ---
  {
    const o = Game.pantryDraw;
    if (typeof o === 'function') Game.pantryDraw = function (v, want, opts) {
      const out = o.apply(this, arguments);
      try {
        for (const d of (out.items || [])) {
          if (!d || !d.item || !isMeat(d.item)) continue;
          const k = (d.units || 0) * (d.item.kcalEach || 0);
          if (isPreserved(d.item)) F.meatEatenPres += k;
          else F.meatEatenFresh += k;
        }
      } catch (e) {}
      return out;
    };
  }

  // --- meat rot: sweepSpoiled pre-check, classified + fast/slow ---
  {
    const seen = new Set();
    const o = Game.sweepSpoiled;
    if (typeof o === 'function') Game.sweepSpoiled = function () {
      const rotDay = dayOf(Game);
      try {
        for (const it of (((Game.state.village || {}).pantry) || [])) {
          if (it && !seen.has(it) && isMeat(it) && Game.isSpoiled && Game.isSpoiled(it)) {
            seen.add(it);
            const k = kcalOf(it);
            const arr = (typeof it._diagArr === 'number') ? it._diagArr : null;
            if (arr !== null && (rotDay - arr) <= 3) F.meatRotFast += k;
            else F.meatRotSlow += k;
          }
        }
      } catch (e) {}
      return o.apply(this, arguments);
    };
  }

  // --- cook staffing: who staffs the racks (base-game post-haul staffing) ---
  {
    const o = Game.assignTask;
    if (typeof o === 'function') Game.assignTask = function (vid, task, opts) {
      try { if (task === 'cook') F.cookStaffed++; } catch (e) {}
      return o.apply(this, arguments);
    };
  }

  await quietLog(async () => { await runDays(Game, belongfeast, { days, sampleEvery: 1 }); });
  F.daysRun = (W.dawnSamples || []).length;
  try {
    for (const it of (((Game.state.village || {}).pantry) || [])) {
      if (it && isMeat(it)) F.meatEndInv += kcalOf(it);
    }
  } catch (e) {}
  F.meatOutResidual = Math.round(F.meatStartInv + F.meatInTotal - F.meatSmoked - F.meatEatenFresh - F.meatEatenPres - F.meatRotFast - F.meatRotSlow - F.meatEndInv);
  F.ctx = {
    dutyPreserved: Math.round(W.dutyPreserved || 0),
    rotByCh: W.rotByCh, rotByChFast: W.rotByChFast,
    rotFresh: Math.round(W.rotFresh || 0), rotPreserved: Math.round(W.rotPreserved || 0),
  };
  return F;
}

async function main() {
  const args = process.argv.slice(2);
  let days = 60;
  const seeds = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--days') { days = parseInt(args[i + 1], 10) || 60; i++; }
    else if (/^\d+$/.test(a)) seeds.push(parseInt(a, 10));
  }
  const list = seeds.length ? seeds : [68011, 68012, 68013, 68014, 68015, 68016, 68017, 68018];
  const rows = [];
  for (const s of list) {
    const F = await oneSeed(s, days);
    rows.push(F);
    console.log(JSON.stringify(F));
  }
  // summary
  const sum = (k) => rows.reduce((t, r) => t + (r[k] || 0), 0);
  const n = rows.length;
  console.log('SUMMARY seeds=' + n + ' days=' + days);
  for (const k of ['meatInTotal', 'meatSmoked', 'meatEatenFresh', 'meatEatenPres', 'meatRotFast', 'meatRotSlow', 'meatEndInv', 'meatOutResidual', 'cookStaffed', 'cookResolves', 'tenderAfterHaul', 'haulParts']) {
    console.log(`  ${k}: total=${Math.round(sum(k))} mean/seed=${(sum(k) / n).toFixed(1)}`);
  }
  const chAgg = {};
  for (const r of rows) for (const [ch, v] of Object.entries(r.meatIn)) chAgg[ch] = (chAgg[ch] || 0) + v;
  console.log('  meatIn channels:', JSON.stringify(chAgg));
}
main().catch(e => { console.error('PROBE FAIL', e); process.exit(1); });
