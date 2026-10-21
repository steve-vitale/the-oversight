#!/usr/bin/env node
// probe-upkeepgate-b.js — sim-upkeepgate-b sweep (LEVER: lowered upkeep gates).
//
// Assignment (named next from sim-linkdissolve-b, landed f4098b567): the
// SURPLUSFEED governor's post-court realm-dissolution tradeoff (+3 pairs net
// armed vs control) is THRESHOLD-gated through the POLICY's own pantry gates
// (leadcourt.js 20k tending gate; belongseek.js 2x-owed tribute gate). This
// arm tests whether lowering those gates (policy-side, UPKEEPGATE=low:
// lead 20k->8k, belong 2x->1.2x owed) closes the gap.
//
// Same paired substrate as the parent diagnostic: seeds 8801-8808 x
// {leadfeast-upkeepgate, belongfeast-upkeepgate} x {control (SURPLUSFEED
// unset), armed (SURPLUSFEED=1)}, FEASTSCALE_R13=1, SEATDRIVE=0, 180d
// death-aware. UPKEEPGATE unset => the variant policies delegate byte-
// identically to leadfeast/belongfeast (RED-equivalence discipline: unset
// rows must match the parent driver's on the same commit).
//
// Usage (ARMED): FEASTSCALE_R13=1 SEATDRIVE=0 SURPLUSFEED=1 UPKEEPGATE=low \
//   SEEDS="8801,...,8808" POLICY=leadfeast-upkeepgate|belongfeast-upkeepgate \
//   DAYS=180 OUT=<path> node scripts/probe-upkeepgate-b.js
// Usage (CONTROL): same, SURPLUSFEED unset. UPKEEPGATE may also be unset
//   (RED-equivalence vs the parent substrate).
//
// EXPLICIT DOCUMENTED EXCEPTION TO SEED FRESHNESS: this arm REUSES seeds
// 8801-8808 as PAIRED before/after against the same-commit control — it is
// NOT a fresh-seed claim. The inline assertion below enforces that every
// seed belongs to the 8801-8808 set; any OTHER seed passes the banned/used list.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { leadfeast_upkeepgate, belongfeast_upkeepgate } = require('./policies/upkeepgate');
const { attachProbe, dayOf } = require('./probe-glut-instruments');
const { attachStandingProbe, checkFeastHonesty } = require('./probe-standnational-instruments');
const { attachLinkProbe, endLinkHistories } = require('./probe-linkdissolve-instruments');

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
const UG = process.env.UPKEEPGATE;
if (UG && UG !== 'low') {
  console.error('FATAL: UPKEEPGATE must be unset (baseline gates) or exactly "low" (lowered gates)');
  process.exit(2);
}
console.log(PRISTINE ? 'MODE: PRISTINE — no instrument wraps (det-gate)'
  : ARMED ? `MODE: ARMED — SURPLUSFEED=1, governor engages in villagerMealDay; UPKEEPGATE=${UG || 'off'}`
  : `MODE: CONTROL — SURPLUSFEED unset, governor returns give exactly; UPKEEPGATE=${UG || 'off'}`);

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
  9292, 9293, 9294, 9295, 9921, 9922, 9923, 9924, 9925, 9926, 9927, 9928,
  17011, 17012, 17013, 17014, 17015, 17016, 17017, 17018]) BANNED.add(s);

const POLICIES = {
  leadfeast, belongfeast,
  'leadfeast-upkeepgate': leadfeast_upkeepgate,
  'belongfeast-upkeepgate': belongfeast_upkeepgate,
};
const POLICY_ID = process.env.POLICY || 'leadfeast-upkeepgate';
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
const OUT = process.env.OUT || ('evidence/2026-10-21/perseed-upkeepgate-b/' + (PRISTINE ? 'pristine-' : '') + (UG === 'low' ? 'uglow-' : '') + (ARMED ? 'armed' : 'control') + '-' + POLICY_ID + '.json');

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'upkeepgate-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = PRISTINE ? null : attachProbe(Game);
  const S = PRISTINE ? null : attachStandingProbe(Game);
  const L = PRISTINE ? null : attachLinkProbe(Game);
  // capture the policy ctx (engagement counters) without touching the sim
  let capCtx = null;
  const capPolicy = Object.assign({}, POLICY, {
    daily(Game, ctx) { try { POLICY.daily(Game, ctx); } finally { capCtx = ctx; } },
  });

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
  const result = await runDays(Game, capPolicy, { days, manifest: null });
  const ms = Date.now() - t0;

  let nationalLive = false, nationalDay = 0, nationalShape = '', tableWaiting = false, rank = '?', maxWave = 1, arc = 1, rosterEnd = 0;
  try {
    nationalLive = !!((Game.state || {}).nationalLive);
    nationalDay = (Game.state || {}).nationalDay || 0;
    nationalShape = (Game.state || {}).nationalShape || '';
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
    table: tableWaiting,
    rank, maxWave, arc, rosterEnd,
    days: result.days, endReason: result.endReason,
    unattShare: +unattShare.toFixed(4),
    ugMode: UG || 'off',
    ms,
  };

  // engagement: the lowered-gate second pass's footprint (ctx counters)
  if (capCtx) {
    end.ug = {
      tendCalls: capCtx.ugTendCalls || 0,
      tribCalls: capCtx.ugTribCalls || 0,
      gateSkips: capCtx.ugGateSkips || 0,
      baseTended: capCtx.tended || 0,
      baseTribute: capCtx.belongTribute || 0,
    };
  }
  // death-cause shares (guardrails): live-captured, independent of the tele cap
  {
    const dc = {};
    let n = 0, starv = 0;
    for (const d of (result.samples.deaths || [])) {
      n++;
      const k = String((d && d.cause) || 'unknown');
      dc[k] = (dc[k] || 0) + 1;
      if (/starv/i.test(k)) starv++;
    }
    end.deathCauses = dc; end.deathN = n; end.starvDeaths = starv;
  }

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
    end.pantryEnd = Math.round(pantryKcal(Game));
    // --- link-dissolution instrument (additive; zero drift by construction) ---
    end.dissolve = {
      courts: L.courts,
      dissolutions: L.dissolutions,
      dissolveLines: L.dissolveLines,
      agreeN: L.agreeN, agreeBad: L.agreeBad,
      linkTraj: L.linkTraj.map(t => ({
        d: t.d, nat: t.nat, natDay: t.natDay,
        eng: t.engShape, my: t.myShape, agree: t.agree,
        pantry: t.pantry, links: t.links,
      })),
      upkeepDay: L.upkeepDay,
      upkeepCalls: L.upkeepCalls,
      linkHist: endLinkHistories(Game),
    };
  }
  return end;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const end = await oneRun(seed, DAYS);
    rows.push(end);
    const sf = end.sfeed ? ` trim=${Math.round(end.sfeed.trimKcal / 1000)}k/${end.sfeed.trimDays}d` : '';
    const sp = end.spend ? ` feast=${Math.round(end.spend.feastKcal / 1000)}k gift=${Math.round(end.spend.gift / 1000)}k court=${Math.round(end.spend.court / 1000)}k` : '';
    const sd = end.stand ? ` stand=${end.stand.endTotal}(w${end.stand.endWar}/d${end.stand.endDip}/p${end.stand.endPle})` : '';
    const dz = end.dissolve ? ` courts=${end.dissolve.courts.length} diss=${end.dissolve.dissolutions.length} agree=${end.dissolve.agreeN - end.dissolve.agreeBad}/${end.dissolve.agreeN}` : '';
    const ugu = end.ug ? ` ug={tend:${end.ug.tendCalls},trib:${end.ug.tribCalls},skips:${end.ug.gateSkips}}` : '';
    console.log(`done seed=${seed} days=${end.days} end=${end.endReason} nat=${end.national}@${end.nationalDay} rank=${end.rank} wave=${end.maxWave}${sf}${sp}${sd}${dz}${ugu} (${end.ms}ms)`);
  }
  if (OUT) {
    fs.mkdirSync(OUT.replace(/\/[^/]+$/, ''), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ rows, meta: { armed: ARMED, pristine: PRISTINE, policy: POLICY_ID, ugMode: UG || 'off', seeds: SEEDS, days: DAYS } }, null, 1));
    console.log('wrote ' + OUT);
  }
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
