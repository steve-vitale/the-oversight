#!/usr/bin/env node
// sweep-surpluskeep2-b.js — sim-surpluskeep2-b sweep (DIAGNOSTIC, no lever).
//
// The threshold-gated SURPLUSFEED CONFIRM: the named next of
// sim-surpluskeep-diag-b (evidence/2026-10-21/sim-surpluskeep-diag-b.md).
// Parent rejected the dose-proportional trim->upkeep hypothesis twice;
// this arm tests the THRESHOLD-GATED mechanism: pantry falls through the
// policy's absolute 20,000 tendLink gate -> tending stops -> trust erodes ->
// no-break dissolution.
//
// Instrument-only: ZERO src/js changes, zero policy edits. New wraps in
// scripts/surpluskeep2-instruments.js (gate sensor) + the parent's
// proof-tested upkeep probe (required, unmodified) + the sfeed governor
// telemetry sensor (call-through, RNG-clean per the parent proof).
//
// Usage (ARMED): FEASTSCALE_R13=1 SEATDRIVE=0 SURPLUSFEED=1 \
//   SEEDS="8801,...,8808" POLICY=leadfeast|belongfeast \
//   DAYS=180 OUT=<path> node scripts/sweep-surpluskeep2-b.js
// Usage (CONTROL): same, SURPLUSFEED unset (governor returns give exactly).
// Usage (PRISTINE det-gate): PRISTINE=1 (skips ALL instrument wraps).
//
// EXPLICIT DOCUMENTED EXCEPTION TO SEED FRESHNESS: PAIRED REUSE of seeds
// 8801-8808 as before/after against the same-commit control — NOT a
// fresh-seed claim (same exception as the parent arm). The inline gate
// below enforces the paired set; any OTHER seed hits the banned/used list.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachUpkeepProbe, attachGateSensor, dayOf, pantryKcal } = require('./surpluskeep2-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}
const ARMED = process.env.SURPLUSFEED === '1';
if (process.env.SURPLUSFEED && process.env.SURPLUSFEED !== '1') {
  console.error('FATAL: SURPLUSFEED must be unset (control) or exactly "1" (armed)');
  process.exit(2);
}
const PRISTINE = process.env.PRISTINE === '1';
console.log(PRISTINE ? 'MODE: PRISTINE — no instrument wraps (det-gate)'
  : ARMED ? 'MODE: ARMED — SURPLUSFEED=1, governor engages in villagerMealDay'
  : 'MODE: CONTROL — SURPLUSFEED unset, governor returns give exactly');

// the paired seed set (PAIRED REUSE EXCEPTION — documented above)
const CONTROL_SET = new Set([8801, 8802, 8803, 8804, 8805, 8806, 8807, 8808]);

const BANNED = new Set();
for (const [a, b] of [[4201, 4208], [4301, 4308], [4401, 4408], [4501, 4508], [4601, 4608],
  [4801, 4808], [4901, 4908], [5101, 5108], [5111, 5118], [5201, 5208], [5411, 5426],
  [5601, 5608], [6201, 6208], [6301, 6308], [7001, 7008], [7501, 7508], [7601, 7608],
  [99101, 99108], [105101, 105104]]) for (let s = a; s <= b; s++) BANNED.add(s);
for (const s of [4811, 4812, 4813, 4814, 4815, 4816, 4817, 4818, 4819, 4820, 4821, 4822,
  6417, 6418, 6419, 6420, 6421, 6422, 6423, 6424,
  6810, 6811, 6813, 6814, 6815, 6816, 6817, 6912,
  8811, 8812, 8813, 8814, 8815, 8816, 8817, 8818,
  8821, 8822, 8823, 8824, 8825, 8826, 8827, // surpluskeep(-2) proof seed sets
  9292, 9293, 9294, 9295, 9921, 9922, 9923, 9924, 9925, 9926, 9927, 9928,
  17011, 17012, 17013, 17014, 17015, 17016, 17017, 17018]) BANNED.add(s);

const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID];
if (!POLICY) { console.error('FATAL: unknown POLICY ' + POLICY_ID); process.exit(2); }
const SEEDS = (process.env.SEEDS || '8801,8802,8803,8804,8805,8806,8807,8808')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
if (!SEEDS.length) { console.error('FATAL: no seeds'); process.exit(2); }
for (const s of SEEDS) {
  if (CONTROL_SET.has(s)) continue; // PAIRED REUSE EXCEPTION — documented above, no fresh-seed claim
  if (BANNED.has(s)) { console.error('FATAL: seed ' + s + ' is on the banned/used list and not in the paired set'); process.exit(2); }
}
console.log('seed gate OK: PAIRED REUSE of the 8801-8808 set: ' + SEEDS.join(','));
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('evidence/2026-10-21/perseed-surpluskeep2-b/' + (PRISTINE ? 'pristine-' : '') + (ARMED ? 'armed' : 'control') + '-' + POLICY_ID + '.json');

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'surpluskeep2-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const K = PRISTINE ? null : attachUpkeepProbe(Game);
  const G = PRISTINE ? null : attachGateSensor(Game);

  // surplusFeed governor sensor (parent pattern): pure telemetry, calls
  // through, counts calls/trims. RNG-clean per the parent det-gate.
  let sfeed = null;
  if (!PRISTINE) {
    sfeed = { govCalls: 0, trimCalls: 0, trimKcal: 0, days: {} };
    const o = Game.surplusFeedGovernor;
    if (typeof o === 'function') Game.surplusFeedGovernor = function (v, give) {
      const r = o.apply(this, arguments);
      try {
        sfeed.govCalls++;
        if (r < give) {
          sfeed.trimCalls++;
          sfeed.trimKcal += (give - r);
          const d = dayOf(Game);
          const cell = sfeed.days[d] || (sfeed.days[d] = { trimCalls: 0, trimKcal: 0 });
          cell.trimCalls++; cell.trimKcal += (give - r);
        }
      } catch (e) {}
      return r;
    };
  }

  const t0 = Date.now();
  const result = await runDays(Game, POLICY, { days, manifest: null });
  const ms = Date.now() - t0;

  let nationalLive = false, nationalDay = 0, nationalShape = '', tableWaiting = false, rank = '?', maxWave = 1, arc = 1, rosterEnd = 0, exiled = false;
  try {
    nationalLive = !!((Game.state || {}).nationalLive);
    nationalDay = (Game.state || {}).nationalDay || 0;
    nationalShape = (Game.state || {}).nationalShape || '';
    exiled = !!((Game.state || {}).scholar || {}).exiled;
    const ps = Game.progState ? Game.progState() : {};
    tableWaiting = !!(ps.tableWaiting);
    rank = Game.scaleRank ? Game.scaleRank() : '?';
    maxWave = Game.unlockedWave ? Game.unlockedWave() : 1;
    arc = (ps || {}).arc || 1;
    rosterEnd = (((Game.state || {}).village || {}).roster || []).length;
  } catch (e) {}

  const end = {
    seed,
    won: !!Game.won,
    national: nationalLive, nationalDay, nationalShape,
    table: tableWaiting, exiled,
    rank, maxWave, arc, rosterEnd,
    days: result.days, endReason: result.endReason,
    ms,
  };

  if (!PRISTINE) {
    end.sfeed = sfeed ? {
      govCalls: sfeed.govCalls, trimCalls: sfeed.trimCalls,
      trimKcal: Math.round(sfeed.trimKcal),
      trimDays: Object.keys(sfeed.days).length,
    } : { govCalls: 0, trimCalls: 0, trimKcal: 0, trimDays: 0 };
    const KIND = { vassal: 0, covenant: 1, trade: 2 };
    end.upkeep = {
      tributeEvents: K.tributeEvents.map(e => [e.d, e.other, e.paid, e.pantryBefore]),
      tendEvents: K.tendEvents.map(e => [e.d, e.other, e.paid, e.pantryBefore]),
      breaks: K.breaks.map(b => ({
        d: b.d, how: b.how, other: b.other, kind: b.kind,
        trust: b.trust, arrears: b.arrears, keptDays: b.keptDays, tkpw: b.tkpw,
        natLive: b.natLive ? 1 : 0, natDay: b.natDay,
      })),
      natEvents: K.natEvents.map(n => ({
        d: n.d, kind: n.kind, shape: n.shape, natDay: n.natDay,
        subs: n.subs.map(s => [s.other, s.trust, s.arrears]),
      })),
      // compact per-link dawn snapshots: [d, other, kindInt, dir, st, trust, arr, tpw, tdw, lkd, tkpw]
      // dir: 0 = Haven subordinate (tribute verb), 1 = Haven primary (tend verb), 2 = peer
      links: K.links.map(l => [l.d, l.other, KIND[l.kind] != null ? KIND[l.kind] : 3, l.dir | 0, l.st, l.trust, l.arr, l.tpw, l.tdw, l.lkd, l.tkpw]),
      dissolveLines: K.dissolveLines.map(x => [x.d, x.line]),
    };
    end.upkeep.tributePaid = K.tributeEvents.reduce((t, e) => t + (e.paid > 0 ? e.paid : 0), 0);
    end.upkeep.tendPaid = K.tendEvents.reduce((t, e) => t + (e.paid > 0 ? e.paid : 0), 0);
    // gate sensor: daily dawn pantry series (the threshold instrument)
    end.gate = { pantryDaily: G.pantryDaily.map(([d, k]) => [d, k]) };
    end.pantryEnd = Math.round(pantryKcal(Game));
  }
  return end;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const end = await oneRun(seed, DAYS);
    rows.push(end);
    const sf = end.sfeed ? ` trim=${Math.round(end.sfeed.trimKcal / 1000)}k/${end.sfeed.trimDays}d` : '';
    const uk = end.upkeep ? ` trib=${Math.round(end.upkeep.tributePaid / 1000)}k tend=${Math.round(end.upkeep.tendPaid / 1000)}k breaks=${end.upkeep.breaks.length}` : '';
    const gp = end.gate ? ` panDailies=${end.gate.pantryDaily.length}` : '';
    console.log(`done seed=${seed} days=${end.days} end=${end.endReason} nat=${end.national}@${end.nationalDay} rank=${end.rank} wave=${end.maxWave}${sf}${uk}${gp} (${end.ms}ms)`);
  }
  if (OUT) {
    fs.mkdirSync(OUT.replace(/\/[^/]+$/, ''), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ rows, meta: { armed: ARMED, pristine: PRISTINE, policy: POLICY_ID, seeds: SEEDS, days: DAYS } }, null, 1));
    console.log('wrote ' + OUT);
  }
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
