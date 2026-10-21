#!/usr/bin/env node
// probe-surpluskeep-b.js — sim-surpluskeep-diag-b sweep (DIAGNOSTIC, no lever).
//
// Assignment (the exact named next of the landed-open
// sim-surplusfeed-national-b, c7697540c): armed runs (SURPLUSFEED=1) reach
// the court as often but LOSE THE REALM more often. The
// standing-accumulation-tax hypothesis was REJECTED; this arm instruments
// post-court UPKEEP: tribute/tendLink flows vs trim, link trust/arreas
// trajectories, and link-dissolution cause attribution.
//
// This is probe-surplusfeed-national-b.js with the upkeep instrument
// (probe-surpluskeep-instruments.js) attached on top: same policies
// ({leadfeast, belongfeast}), same horizon (180d death-aware), same env
// (FEASTSCALE_R13=1 SEATDRIVE=0), same seed set (8801-8808, PAIRED REUSE —
// NOT a fresh-seed claim; same exception documented below).
//
// Usage (ARMED): FEASTSCALE_R13=1 SEATDRIVE=0 SURPLUSFEED=1 \
//   SEEDS="8801,...,8808" POLICY=leadfeast|belongfeast \
//   DAYS=180 OUT=<path> node scripts/probe-surpluskeep-b.js
// Usage (CONTROL): same, SURPLUSFEED unset (governor returns give exactly).
// Usage (PRISTINE det-gate): PRISTINE=1 (skips ALL instrument wraps; outcome
//   fields must match the instrumented row on identical seeds — RNG-clean).
//
// EXPLICIT DOCUMENTED EXCEPTION TO SEED FRESHNESS: this arm REUSES seeds
// 8801-8808 as PAIRED before/after against the same-commit control — it is
// NOT a fresh-seed claim. The inline assertion below enforces that every
// seed belongs to the 8801-8808 set; any OTHER seed passes the banned/used list.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachProbe, dayOf } = require('./probe-glut-instruments');
const { attachStandingProbe, checkFeastHonesty } = require('./probe-standnational-instruments');
const { attachUpkeepProbe, pantryKcal } = require('./upkeep-instruments-surpluskeep-b');

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

// the paired seed set
const CONTROL_SET = new Set([8801, 8802, 8803, 8804, 8805, 8806, 8807, 8808]);

const BANNED = new Set();
for (const [a, b] of [[4201, 4208], [4301, 4308], [4401, 4408], [4501, 4508], [4601, 4608],
  [4801, 4808], [4901, 4908], [5101, 5108], [5111, 5118], [5201, 5208], [5411, 5426],
  [5601, 5608], [6201, 6208], [6301, 6308], [7001, 7008], [7501, 7508], [7601, 7608],
  [99101, 99108], [105101, 105104]]) for (let s = a; s <= b; s++) BANNED.add(s);
for (const s of [4811, 4812, 4813, 4814, 4815, 4816, 4817, 4818, 4819, 4820, 4821, 4822,
  6417, 6418, 6419, 6420, 6421, 6422, 6423, 6424,
  6810, 6811, 6813, 6814, 6815, 6816, 6817, 6912,
  8811, 8812, 8813, 8814, 8815, 8816, 8817, 8818, // glutprobe/proof seed sets
  8821, 8822, 8823, 8824, // surpluskeep proof seed sets
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
const OUT = process.env.OUT || ('evidence/2026-10-21/perseed-surpluskeep-b/' + (PRISTINE ? 'pristine-' : '') + (ARMED ? 'armed' : 'control') + '-' + POLICY_ID + '.json');

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'surpluskeep-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = PRISTINE ? null : attachProbe(Game);
  const S = PRISTINE ? null : attachStandingProbe(Game);
  const K = PRISTINE ? null : attachUpkeepProbe(Game);

  // --- surplusFeed governor sensor (from probe-glutcurvecheck-b.js): pure
  // telemetry, calls through, counts calls/trims. ---
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

  // instrument-honesty: unattributed inflow share (glutprobe bar, kept)
  let unattShare = 0;
  if (W) {
    const unatt = W.inflow.unattributed || 0;
    unattShare = W.chokeTotal > 0 ? unatt / W.chokeTotal : 0;
  }

  const end = {
    seed,
    won: !!Game.won,
    national: nationalLive, nationalDay, nationalShape,
    table: tableWaiting, exiled,
    rank, maxWave, arc, rosterEnd,
    days: result.days, endReason: result.endReason,
    unattShare: +unattShare.toFixed(4),
    ms,
  };

  if (!PRISTINE) {
    // feast honesty: engine's own full-length feast say-lines vs recorded paid
    const honest = checkFeastHonesty(S.feastEvents, S.feastLines);
    end.sfeed = sfeed ? {
      govCalls: sfeed.govCalls, trimCalls: sfeed.trimCalls,
      trimKcal: Math.round(sfeed.trimKcal),
      trimDays: Object.keys(sfeed.days).length,
    } : { govCalls: 0, trimCalls: 0, trimKcal: 0, trimDays: 0 };
    end.spend = {
      feast: Math.round(S.spend.feast || 0),
      gift: Math.round(S.spend.gift || 0),
      court: Math.round(S.spend.court || 0),
      unattributed: Math.round(S.spend.unattributed || 0),
      totalAttributed: Math.round(S.spendTotal),
      feastKcal: S.feastEvents.reduce((t, f) => t + f.paid, 0),
      feastEvents: S.feastEvents.map(f => ({ d: f.day, paid: f.paid, q: f.quality })),
      giftEvents: S.giftEvents.map(g => ({ d: g.day, path: g.path, how: g.how, paid: g.paid })),
      courtEvents: S.courtEvents.map(c => ({ d: c.day, shape: c.shape, how: c.how, paid: c.paid })),
    };
    end.feastHonest = { ok: honest.ok, matches: honest.matches, total: honest.total };
    // standing trajectory (dawn samples): compact arrays
    const st = S.stand;
    end.stand = {
      n: st.length,
      traj: st.map(x => [x.d, x.t, x.war, x.dip, x.ple, x.feasts, x.nat, x.pend]),
      endTotal: st.length ? st[st.length - 1].t : 0,
      endWar: st.length ? st[st.length - 1].war : 0,
      endDip: st.length ? st[st.length - 1].dip : 0,
      endPle: st.length ? st[st.length - 1].ple : 0,
    };
    // upkeep instrument fields
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
    console.log(`done seed=${seed} days=${end.days} end=${end.endReason} nat=${end.national}@${end.nationalDay} rank=${end.rank} wave=${end.maxWave}${sf}${uk} (${end.ms}ms)`);
  }
  if (OUT) {
    fs.mkdirSync(OUT.replace(/\/[^/]+$/, ''), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ rows, meta: { armed: ARMED, pristine: PRISTINE, policy: POLICY_ID, seeds: SEEDS, days: DAYS } }, null, 1));
    console.log('wrote ' + OUT);
  }
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
