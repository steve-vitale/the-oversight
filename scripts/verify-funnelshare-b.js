#!/usr/bin/env node
// verify-funnelshare-b.js — sim-funnelshare-b arm verification (2026-10-23).
//
// FINDING: the arm's assigned lever (behavioral plenty-side easing of the
// autonomous share funnel + the unconditional depositors, per the
// prodrebound-b2 DIAG's named next) is FULLY LANDED on master by the sibling
// arm sim-depositgate-b2 (commit 1ff979f19: game.js +189/-9, hierarchy.js +26;
// VERDICT GO on 64 fresh-seed runs per the b2 adoption evidence
// evidence/2026-10-22/sim-depositgate-b2.md). Building it again would be a
// duplicate. This script does NOT build a lever — it spot-verifies that the
// landed DEPOSITGATE layer engages on current master, and measures its effect
// on a fresh 2-seed x 2-policy corpus so the arm reports real numbers.
//
// Pre-registration (binding, docs/MEASUREMENT.md §14 — written BEFORE sims):
//   PRIMARY (spot-check, not a pilot gate): armed rot/100d vs control —
//     REPORTED, no GO bar (the GO decision already happened in b2; a
//     duplicate confirm adds no information).
//   ENGAGEMENT: eased kcal > 0 on ALL 4 armed runs (the landed layer must
//     engage on current master — FAIL if any armed run shows 0 eased).
//   GUARDRAILS (spot): no new death modes armed vs control; starvation deaths
//     armed <= control + 1 (tiny corpus, spot only).
// Design: 2 FRESH seeds (75001, 75002 — banned-list clean: zero hits in
// scripts/ content or evidence/ filenames) x {leadfeast, belongfeast} x
// {control DEPOSITGATE=0, armed DEPOSITGATE=1} = 8 configs, 100d
// death-aware (dead villages stop, +10d tail max), FEASTSCALE_R13=1 /
// SEATDRIVE=0 (asserted). Death-aware horizons per §11.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
const SIDE = process.env.SIDE || 'control';
const WANT = SIDE === 'armed' ? '1' : '0';
if ((process.env.DEPOSITGATE || '0') !== WANT) {
  console.error(`FATAL: SIDE=${SIDE} requires DEPOSITGATE=${WANT}`);
  process.exit(2);
}
const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SEEDS = (process.env.SEEDS || '75001,75002')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const OUT = process.env.OUT || ('/tmp/verify-funnelshare-b/verify-' + SIDE + '-' + POLICY_ID + '.json');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'funnelshare-b-verify-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = { rot_fresh: 0, deaths: [], say: [] };

  // rot: wrap sweepSpoiled, dedupe by item OBJECT identity (the reference
  // instrument's method — spoilage is computed via Game.isSpoiled, not a
  // .spoiled flag), count fresh rot only
  const rotCounted = new Set();
  const oSweep = Game.sweepSpoiled;
  if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
    try {
      for (const it of (((Game.state.village || {}).pantry) || [])) {
        if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
          rotCounted.add(it);
          const fs = (it.foodState === 'preserved' || it.foodState === 'rendered') ? 'preserved' : 'fresh';
          if (fs === 'fresh') W.rot_fresh += (it.kcalEach || 0) * (it.units || 0);
        }
      }
    } catch (e) {}
    return oSweep.apply(this, arguments);
  };

  // deaths via tele wrap
  const oTele = Game.tele;
  Game.tele = function (type, data) {
    const r = oTele.apply(this, arguments);
    try {
      if (type === 'death') {
        W.deaths.push({ day: ((this.state || {}).scholar || {}).day || 0,
          kind: canonCause(data && data.kind), who: data && data.who, player: !!(data && data.player) });
      }
    } catch (e) {}
    return r;
  };

  // voice lines: capture depositgate-marked says
  const oSay = Game.say;
  Game.say = function (msg) {
    try {
      const s = String(msg || '');
      if (/🍽️|🌿|Tribute wagons|pantry can't take it|shelves are full/i.test(s)) {
        W.say.push({ day: ((Game.state || {}).scholar || {}).day || 0, line: s.slice(0, 160) });
      }
    } catch (e) {}
    return oSay.apply(this, arguments);
  };

  const result = await runDays(Game, POLICY, { days });
  const daysAlive = result.days || 0;

  // depositgate ledger: exact eased kcal per channel (landed instrument point)
  let eased = { share: 0, ret: 0, big: 0, waived: 0, days: 0 };
  try {
    const lg = ((Game.state.village || {})._depositGate || {}).days || {};
    for (const d of Object.values(lg)) {
      if ((d.shareEased || 0) + (d.returnEased || 0) + (d.bigHaulEased || 0) + (d.tributeWaived || 0) > 0) eased.days++;
      eased.share += (d.shareEased || 0);
      eased.ret += (d.returnEased || 0);
      eased.big += (d.bigHaulEased || 0);
      eased.waived += (d.tributeWaived || 0);
    }
  } catch (e) {}

  const starveDeaths = W.deaths.filter(d => d.kind === 'starvation').length;
  const v = Game.state.village || {};
  const alive = (v.roster || []).filter(id => { try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return false; } }).length;
  let rank = '?', maxWave = 1, arc = 1;
  try { rank = Game.scaleRank(); } catch (e) {}
  try { maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  try { arc = (Game.progState() || {}).arc || 1; } catch (e) {}

  return {
    seed, policy: POLICY_ID, side: SIDE, days: daysAlive, endReason: result.endReason,
    rotFresh: Math.round(W.rot_fresh),
    rotPer100d: daysAlive > 0 ? W.rot_fresh / daysAlive * 100 : 0,
    eased: { share: Math.round(eased.share), ret: Math.round(eased.ret),
             big: Math.round(eased.big), waived: Math.round(eased.waived),
             days: eased.days, total: Math.round(eased.share + eased.ret + eased.big + eased.waived) },
    starveDeaths, deaths: W.deaths.length, deathKinds: W.deaths.map(d => d.kind),
    aliveEnd: alive, rank, national: /national/i.test(String(rank)), maxWave, arc,
    sayLines: W.say.slice(0, 6),
  };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed, DAYS);
      rows.push(r);
      console.log(`seed ${seed}: days=${r.days} rot/100d=${Math.round(r.rotPer100d).toLocaleString()} eased=${r.eased.total.toLocaleString()}k (share ${r.eased.share.toLocaleString()}k/ret ${r.eased.ret.toLocaleString()}k/big ${r.eased.big.toLocaleString()}k/waived ${r.eased.waived.toLocaleString()}k, ${r.eased.days}d) starve=${r.starveDeaths} deaths=${r.deaths} alive=${r.aliveEnd} rank=${r.rank} wave=${r.maxWave}`);
    } catch (e) {
      console.error(`seed ${seed} FAILED:`, e.message);
      rows.push({ seed, policy: POLICY_ID, side: SIDE, error: String(e.message) });
    }
  }
  fs.mkdirSync(OUT.split('/').slice(0, -1).join('/'), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ side: SIDE, policy: POLICY_ID, seeds: SEEDS, days: DAYS, rows }, null, 1));
  console.log('wrote', OUT);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
