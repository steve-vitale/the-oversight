#!/usr/bin/env node
// probe-repairrate-b.js — sim-repairrate-b sweep (LEVER: the repair rate).
//
// Assignment (named next from sim-upkeepgate-b, NO-GO): the SURPLUSFEED
// post-court dissolution tradeoff is structural through the GATE level —
// with grain flowing, succession-heavy trust decay (-8 haircuts, tribute
// shorts) outruns the +8/week repair verb. The named next is the REPAIR
// RATE (tending strength / haircut size / seasoned bar), not the pantry gate.
//
// Treatment (armed rows), all default-OFF, zero src/js changes:
//   REPAIRRATE=1 — scripts/policies/repairrate.js: succession-beat gift
//     answers (+8 trust vs -6 silence per beat; the base policies never
//     answer beats). "Raise tending strength" — additive repair beyond the
//     +8/week tendLink cap, exactly where succession decay lands.
//   SUCCPOLITY=1 — the engine's landed experimental haircut-shrink
//     (sim-succpolity 2026-10-15, GO): polity-membership bars read the
//     link's pre-death standing for 14 days, so the realm doesn't dissolve
//     in the funeral hour. "Shrink the haircut / lower the bar" in its bar
//     effect; zero kcal cost. Engagement attributed separately.
//
// Same paired substrate as the parent: seeds 8801-8808 x
// {leadfeast-repairrate, belongfeast-repairrate} x {control (SURPLUSFEED=1,
// REPAIRRATE/SUCCPOLITY unset), armed (SURPLUSFEED=1, REPAIRRATE=1,
// SUCCPOLITY=1)}, FEASTSCALE_R13=1, SEATDRIVE=0, 180d death-aware.
// NOTE: unlike the parent (which ran UPKEEPGATE=low on BOTH arms), the
// control here is the BASE policies — this arm isolates the repair-rate
// package, not the gate level.
//
// Usage (ARMED): FEASTSCALE_R13=1 SEATDRIVE=0 SURPLUSFEED=1 REPAIRRATE=1 SUCCPOLITY=1 \
//   SEEDS="8801,...,8808" POLICY=leadfeast-repairrate|belongfeast-repairrate \
//   DAYS=180 OUT=<path> node scripts/probe-repairrate-b.js
// Usage (CONTROL): same, REPAIRRATE and SUCCPOLITY unset. SURPLUSFEED=1 on
//   BOTH arms (the substrate under test).
//
// EXPLICIT DOCUMENTED EXCEPTION TO SEED FRESHNESS: PAIRED REUSE of the
// 8801-8808 set — not a fresh-seed claim. The inline assertion enforces it.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { leadfeast_repairrate, belongfeast_repairrate } = require('./policies/repairrate');
const { attachProbe, dayOf } = require('./probe-glut-instruments');
const { attachStandingProbe, checkFeastHonesty } = require('./probe-standnational-instruments');
const { attachLinkProbe, endLinkHistories } = require('./probe-linkdissolve-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}
const ARMED = process.env.SURPLUSFEED === '1';
if (process.env.SURPLUSFEED !== '1') {
  console.error('FATAL: SURPLUSFEED=1 must be set on BOTH arms of this substrate (see Usage header)');
  process.exit(2);
}
const RR = process.env.REPAIRRATE;
if (RR && RR !== '1') {
  console.error('FATAL: REPAIRRATE must be unset (control) or exactly "1" (armed)');
  process.exit(2);
}
const SP = process.env.SUCCPOLITY;
if (SP && SP !== '1') {
  console.error('FATAL: SUCCPOLITY must be unset (control) or exactly "1" (armed)');
  process.exit(2);
}
if (!!RR !== !!SP) {
  console.error('FATAL: REPAIRRATE and SUCCPOLITY must be set together (armed) or unset together (control)');
  process.exit(2);
}
const PRISTINE = process.env.PRISTINE === '1';
console.log(PRISTINE ? 'MODE: PRISTINE — no instrument wraps (det-gate)'
  : `MODE: ${RR === '1' ? 'ARMED' : 'CONTROL'} — SURPLUSFEED=1, REPAIRRATE=${RR || 'off'}, SUCCPOLITY=${SP || 'off'}`);

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
  8811, 8812, 8813, 8814, 8815, 8816, 8817, 8818,
  9292, 9293, 9294, 9295, 9921, 9922, 9923, 9924, 9925, 9926, 9927, 9928,
  17011, 17012, 17013, 17014, 17015, 17016, 17017, 17018]) BANNED.add(s);

const POLICIES = {
  leadfeast, belongfeast,
  'leadfeast-repairrate': leadfeast_repairrate,
  'belongfeast-repairrate': belongfeast_repairrate,
};
const POLICY_ID = process.env.POLICY || 'leadfeast-repairrate';
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
const OUT = process.env.OUT || ('evidence/2026-10-21/perseed-repairrate-b/' + (PRISTINE ? 'pristine-' : '') + (RR === '1' ? 'rr-' : '') + (ARMED ? 'armed' : 'control') + '-' + POLICY_ID + '.json');

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}
function dirOfLink(l) {
  try {
    if (l.kind === 'covenant') return 'C';
    if (l.kind === 'trade') return 'T';
    if (l.primary === 'haven') return 'P';
    if (l.subordinate === 'haven') return 'S';
    return '?';
  } catch (e) { return '?'; }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'repairrate-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = PRISTINE ? null : attachProbe(Game);
  const S = PRISTINE ? null : attachStandingProbe(Game);
  const L = PRISTINE ? null : attachLinkProbe(Game);
  // capture the policy ctx (engagement counters) without touching the sim
  let capCtx = null;
  const capPolicy = Object.assign({}, POLICY, {
    daily(Game, ctx) { try { POLICY.daily(Game, ctx); } finally { capCtx = ctx; } },
  });

  // --- SUCCPOLITY grace sensor (additive, RNG-clean: pure reads at dawn) ---
  // Per dawn: for each link, [id, dir, trust, _succDay|-1, _succTrust|-1].
  // The analyzer counts grace windows and load-bearing dawns (bar reads
  // _succTrust >= bar while link.trust < bar, national live).
  const succScan = [];
  if (!PRISTINE) {
    const oSleep = Game.sleep;
    if (typeof oSleep === 'function') Game.sleep = function () {
      const r = oSleep.apply(this, arguments);
      try {
        const d = dayOf(Game);
        const nat = !!((Game.state || {}).nationalLive);
        const rows = [];
        const links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
        for (const l of links) {
          if (!l || l.status !== 'active') continue;
          rows.push([l.id || '?', dirOfLink(l), Math.round(l.trust || 0),
            (l._succDay != null ? l._succDay : -1), (l._succTrust != null ? Math.round(l._succTrust) : -1)]);
        }
        succScan.push({ d, nat: nat ? 1 : 0, links: rows });
      } catch (e) {}
      return r;
    };
  }

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
    rrMode: RR || 'off', spMode: SP || 'off',
    ms,
  };

  // engagement: the repair-rate package's footprint (ctx counters + grace scan)
  if (capCtx) {
    end.rr = {
      beatGifts: capCtx.rrBeatGifts || 0,
      beatSkips: capCtx.rrBeatSkips || 0,
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
    const honest = checkFeastHonesty(S.feastEvents, S.feastLines);
    end.sfeed = sfeed ? {
      govCalls: sfeed.govCalls, trimCalls: sfeed.trimCalls,
      trimKcal: Math.round(sfeed.trimKcal),
      trimDays: Object.keys(sfeed.days).length,
    } : { govCalls: 0, trimCalls: 0, trimKcal: 0, trimDays: 0 };
    end.feastHonest = { ok: honest.ok, matches: honest.matches, total: honest.total };
    const st = S.stand;
    end.stand = {
      n: st.length,
      endTotal: st.length ? st[st.length - 1].t : 0,
    };
    end.pantryEnd = Math.round(pantryKcal(Game));
    end.dissolve = {
      courts: L.courts,
      dissolutions: L.dissolutions,
      dissolveLines: L.dissolveLines,
      agreeN: L.agreeN, agreeBad: L.agreeBad,
      upkeepDay: L.upkeepDay,
      upkeepCalls: L.upkeepCalls,
      linkHist: endLinkHistories(Game),
    };
    // compact the grace scan: keep only dawns with at least one stamped link
    // (_succDay >= 0) to bound corpus size; the analyzer re-derives windows.
    end.succScan = succScan.filter(s => s.links.some(l => l[3] >= 0));
  }
  return end;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const end = await oneRun(seed, DAYS);
    rows.push(end);
    const sf = end.sfeed ? ` trim=${Math.round(end.sfeed.trimKcal / 1000)}k/${end.sfeed.trimDays}d` : '';
    const dz = end.dissolve ? ` courts=${end.dissolve.courts.length} diss=${end.dissolve.dissolutions.length} agree=${end.dissolve.agreeN - end.dissolve.agreeBad}/${end.dissolve.agreeN}` : '';
    const rru = end.rr ? ` rr={gifts:${end.rr.beatGifts},skips:${end.rr.beatSkips}}` : '';
    const sg = end.succScan ? ` gracedawns=${end.succScan.length}` : '';
    console.log(`done seed=${seed} days=${end.days} end=${end.endReason} nat=${end.national}@${end.nationalDay} rank=${end.rank} wave=${end.maxWave}${sf}${dz}${rru}${sg} (${end.ms}ms)`);
  }
  if (OUT) {
    fs.mkdirSync(OUT.replace(/\/[^/]+$/, ''), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ rows, meta: { armed: ARMED, pristine: PRISTINE, policy: POLICY_ID, rrMode: RR || 'off', spMode: SP || 'off', seeds: SEEDS, days: DAYS } }, null, 1));
    console.log('wrote ' + OUT);
  }
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
