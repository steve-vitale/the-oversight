#!/usr/bin/env node
// scripts/sweep-huntdecomp-b.js — DIAG sweep for sim-huntstaff-decomp-b
// (food-economy axis, loop B, backlog #703 named next).
//
// QUESTION: WHY did additive hunt-duty staffing (killed arm sim-huntstaff-b,
// 446a61101: +2550 kcal/day hunt inflow yet starvation 11v7, median survival
// 121v174, fast-rot 2.8x, new death causes) fail? Attribute three mechanisms:
//   H1 HAUL-DISPLACEMENT — hunt staffing pulled haul labor off foraging.
//   H2 HUNT-MEAT FAST-ROT — the +2550 kcal/d never lands (rot attribution).
//   H3 HUNTER-MORTALITY — the hunters die to what they hunt.
//
// The staffing layer is RECONSTRUCTED in-sweep from the killed arm's evidence
// spec (evidence/2026-10-21/sim-huntstaff-b.md D1–D6, minus the narration-only
// say line D5 — zero mechanical effect; noted in the evidence metric review).
// It is NOT scripts/policies/* — nothing here can ship as a lever (kill
// protocol semantics preserved: instrument-only, zero src/js).
//
// DESIGN: 8 seeds 8901–8908 x {leadfeast,belongfeast} x {control,armed} x
// {rep 1 (measurement), rep 2 (det-gate pair)} = 64 runs, 180d death-aware,
// paired same-commit control (historical corpora are not controls — #746).
// control = pristine base policy (leadfeast/belongfeast); the RED pin in
// test-huntdecomp-b.js asserts control day-hashes == pristine policy
// day-hashes with the probe on — i.e. the instrument is behavior-preserving.
// armed = control + staffHunt at START of daily (≤2 free villagers,
// occupation-preferred via Game.occHuntTier + villagerCompetence, deterministic
// roster tiebreak, person gates HP>=40 / trust>=40 / alive / not-scholar /
// not-garden-keeper, silent skip when scholar away from Haven).
//
// INSTRUMENTS (read-only wraps — zero RNG draws, zero state writes):
//   - scripts/probe-glut-instruments.js attachProbe: call-path channel
//     attribution (W.inflow incl. 'duty:hunt', 'duty:forage', 'duty:fish',
//     'away_wild'...), rotByCh / rotByChFast via arrival tags, deaths,
//     throttle calls/engagements, laundered, starveDays, sayLines.
//     Honesty gate: unattributed < 1% of chokeTotal on every run.
//   - assignTask wrap: per-day active-assignment census by task (labor-days),
//     free-villager count at dawn, every staffed hunter {day, vid, name,
//     occ, trust, tier, comp}.
//   - registerDeath wrap: vid-linked deaths {day, villagerId, name, cause}
//     for hunter-death attribution.
//
// Per-seed panel JSONs (schema 'huntdecomp/1') for §15.
//
// Usage (READ THIS HEADER BEFORE EVERY RUN — the env trap):
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-huntdecomp-b.js
// Targeted: SEEDS="8901" ONLY="leadfeast" SIDES="armed" REPS="1" node ...
//   OUT=<dir> node scripts/sweep-huntdecomp-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ---- substrate asserts (LOUD STOP — the env trap) ----
for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required in the env (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required in the env (pre-seat substrate).'); process.exit(2); }
if (process.env.SURPLUSFEED) { console.error('SWEEP STOP: SURPLUSFEED must be unset (DIAG substrate).'); process.exit(2); }

const { leadfeast, belongfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { attachProbe } = require('./probe-glut-instruments');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [8901, 8902, 8903, 8904, 8905, 8906, 8907, 8908]).filter(Number.isFinite);
const POLICIES = process.env.ONLY ? [process.env.ONLY] : ['leadfeast', 'belongfeast'];
const SIDES = process.env.SIDES ? process.env.SIDES.split(',').map(s => s.trim()) : ['control', 'armed'];
const REPS = process.env.REPS ? [parseInt(process.env.REPS, 10)] : [1, 2];
const DAYS = 180;
const DATE = '2026-10-21';
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', DATE, 'perseed-huntdecomp-b');

// ---- staffing reconstruction (killed arm spec D1–D6 minus narration D5) ----
function staffHunt(Game, ctx) {
  // D4: silent skip when the scholar is away from Haven (assignTask's
  // in-person honest line would refuse anyway; skip loudly-quiet).
  try { if (!Game.playerAtHaven || !Game.playerAtHaven()) return 0; } catch (e) { return 0; }
  const v = (Game.state && Game.state.village) || {};
  const asg = v.assignments || {};
  const roster = v.roster || [];
  const cand = [];
  for (const vid of roster) {
    try {
      if (vid === Game.villagerId) continue;          // not the scholar
      if (asg[vid]) continue;                          // FREE only — never re-tasks (D1)
      if (v.gardenKeeper === vid) continue;            // named domain (D4)
      let p = null;
      try { p = Game.getPerson(vid); } catch (e) { p = null; }
      if (!p || p.dead) continue;                      // alive, in roster (D4)
      const h0 = ((v.health || {})[vid]);
      const hp = (h0 === undefined) ? 100 : h0;
      if (hp < 40) continue;                           // engine's outdoor fitness line (D4)
      const t0 = ((v.trust || {})[vid]);
      const trust = (t0 === undefined) ? 10 : t0;
      if (trust < 40) continue;                        // person gate (D4)
      cand.push(vid);
    } catch (e) {}
  }
  // D2: occupation-preferred via the engine's own substrate + deterministic
  // roster-order tiebreak.
  const score = (vid) => {
    let s = 0;
    try {
      const vp = Game.getPerson(vid) || {};
      const ht = Game.occHuntTier ? Game.occHuntTier(vp) : 0;
      if (ht === 1.4) s += 2;
      else if (ht === 1.2) s += 1;
      if (Game.villagerCompetence) s += Game.villagerCompetence(vid, 'hunt') || 0;
    } catch (e) {}
    return s;
  };
  const order = new Map(roster.map((id, i) => [id, i]));
  cand.sort((a, b) => (score(b) - score(a)) || ((order.get(a) || 0) - (order.get(b) || 0)));
  let n = 0;
  ctx._hdStaffedToday = ctx._hdStaffedToday || [];
  for (const vid of cand) {
    if (n >= 2) break;                                 // N=2 cap (D1)
    const hadAssignment = !!((Game.state.village || {}).assignments || {})[vid]; // DIAG: D1 audit
    try {
      const r = Game.assignTask(vid, 'hunt', { via: 'in-person' });
      if (r && r.ok === false) continue;               // refusal: try next candidate
      n++;
      let p = {}; try { p = Game.getPerson(vid) || {}; } catch (e) {}
      const vp = p || {};
      const tier = Game.occHuntTier ? Game.occHuntTier(vp) : 0;
      ctx._hdStaffedToday.push({
        day: (Game.state.scholar || {}).day || 0,
        part: (typeof Game.dayPart !== 'undefined' ? Game.dayPart : '?'),
        hadAssignment, // DIAG: D1 audit — the "never re-tasks" guard, as coded
        vid, name: (Game.displayName ? Game.displayName(vid) : vid),
        occ: vp.formerOccupation || vp.occupationId || '?',
        tier, comp: Game.villagerCompetence ? Game.villagerCompetence(vid, 'hunt') : 0,
        trust: (((v.trust || {})[vid]) === undefined) ? 10 : (v.trust || {})[vid],
      });
    } catch (e) {}
  }
  return n;
}

const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : 0);

async function oneRun(seed, policyId, side, rep) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: `huntdecompb-${side}-${policyId}-r${rep}`, fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const W = attachProbe(Game);

  // ---- DIAG instruments (read-only) ----
  const assignEvents = [];       // {day, vid, task, byLayer}
  const laborDays = {};          // task -> labor-days (active assignments at dawn, post-staffing)
  const staffedAll = [];         // every staffed hunter {day, vid, ...}
  const staffedVids = new Set(); // vids ever staffed by the layer
  const huntResolves = [];       // {day, vid, kcal} — DIAG: staffing→resolve matching
  let layerActive = false;
  const freeAtDawn = [];         // {day, free}
  {
    const oAssign = Game.assignTask.bind(Game);
    Game.assignTask = function (vid, task, opts) {
      const r = oAssign.apply(this, arguments);
      try {
        assignEvents.push({ day: (Game.state.scholar || {}).day || 0, vid, task, byLayer: !!layerActive });
      } catch (e) {}
      return r;
    };
    const oHunt = Game.villagerHuntResolve && Game.villagerHuntResolve.bind(Game);
    if (typeof oHunt === 'function') Game.villagerHuntResolve = function (vid, eff) {
      const r = oHunt.apply(this, arguments);
      try {
        huntResolves.push({ day: (Game.state.scholar || {}).day || 0, vid: String(vid),
          kcal: (r && typeof r.kcal === 'number') ? r.kcal : 0 });
      } catch (e) {}
      return r;
    };
    const oReg = Game.registerDeath && Game.registerDeath.bind(Game);
    if (typeof oReg === 'function') Game.registerDeath = function (opts) {
      try {
        const kind = String((opts && opts.kind) || '');
        if (kind === 'person' || kind === 'villager') {
          const vid = String((opts && opts.villagerId) || '?');
          const name = String((opts && (opts.name || opts.displayName)) || '?');
          const day = (Game.state.scholar || {}).day || 0;
          W._vidDeaths = W._vidDeaths || [];
          W._vidDeaths.push({ day, vid, name: name.slice(0, 40), cause: String((opts && opts.cause) || '?') });
        }
      } catch (e) {}
      return oReg.apply(this, arguments);
    };
  }

  const hashes = [];
  const pol = Object.assign({}, base);
  const oDaily = base.daily;
  pol.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    if (side === 'armed') {
      layerActive = true;
      try {
        ctx._hdStaffedToday = [];
        staffHunt(Game, ctx);
        for (const e of ctx._hdStaffedToday) { staffedAll.push(e); staffedVids.add(e.vid); }
      } finally { layerActive = false; }
    }
    // dawn labor census: active assignments by task (post-staffing), free count
    try {
      const v = Game.state.village || {};
      const asg = v.assignments || {};
      const byTask = {};
      for (const k of Object.keys(asg)) {
        const t = asg[k] && asg[k].task;
        if (t) byTask[t] = (byTask[t] || 0) + 1;
      }
      for (const t of Object.keys(byTask)) laborDays[t] = (laborDays[t] || 0) + byTask[t];
      const roster = v.roster || [];
      let free = 0;
      for (const vid of roster) if (!asg[vid] && vid !== Game.villagerId) free++;
      freeAtDawn.push({ day: Game.state.scholar.day, free });
    } catch (e) {}
    return oDaily ? oDaily(G, ctx) : undefined;
  };

  const t0 = Date.now();
  let r;
  await quietLog(async () => { r = await runDays(Game, pol, { days: DAYS, sampleEvery: 1 }); });
  const ms = Date.now() - t0;

  // wall numbers (loop convention)
  let nationalLive = false, tableWaiting = false, rank = '?', maxWave = 1;
  try {
    nationalLive = !!((Game.state || {}).nationalLive);
    const ps = Game.progState ? Game.progState() : {};
    tableWaiting = !!(ps.tableWaiting);
    rank = Game.scaleRank ? Game.scaleRank() : '?';
    maxWave = Game.unlockedWave ? Game.unlockedWave() : 1;
  } catch (e) {}

  const inflow = W.inflow || {};
  const rotByCh = W.rotByCh || {};
  const rotByChFast = W.rotByChFast || {};
  const sum = (m) => Object.values(m).reduce((t, x) => t + num(x), 0);
  const chokeTotal = num(W.chokeTotal);
  const unatt = num(inflow.unattributed);
  const unattShare = chokeTotal > 0 ? unatt / chokeTotal : 0;
  const detHash = crypto.createHash('sha256').update(hashes.join('\n')).digest('hex');

  // hunter deaths (vid-linked): any death whose villagerId was staffed by the layer
  const vidDeaths = W._vidDeaths || [];
  const hunterDeaths = vidDeaths.filter(d => staffedVids.has(d.vid));
  const deaths = W.deaths || [];
  const starvDeaths = deaths.filter(d => /starv/i.test(String(d.cause || ''))).length;
  const huntDays = staffedAll.length; // staffings (≤2/day) — hunter-days

  // DIAG: staffing→resolve matching. A dusk staffing (day D, vid) should
  // resolve as a hunt on day D or D+1. If the base policy re-tasks the vid
  // first (dawn upkeep race), the staffing is CHURNED — the hunt never happens.
  // Also: what task did the drafted vid do most recently before being staffed
  // (chore-worker drafting = direct cannibalization signal for H1)?
  const staffMatch = { resolved: 0, churned: 0, other: 0, resolvedKcal: 0, draftedChore: 0 };
  const staffPartHist = {};
  const lastTaskBefore = (vid, day) => {
    let t = null;
    for (const e of assignEvents) { if (e.vid === vid && (e.day < day || e.day === day) && !e.byLayer) t = e.task; }
    return t;
  };
  for (const s of staffedAll) {
    staffPartHist[String(s.part)] = (staffPartHist[String(s.part)] || 0) + 1;
    const prev = lastTaskBefore(s.vid, s.day);
    if (prev === 'water' || prev === 'fish' || prev === 'wood' || prev === 'cook' || prev === 'garden') staffMatch.draftedChore++;
    const res = huntResolves.find(rr => rr.vid === s.vid && (rr.day === s.day || rr.day === s.day + 1));
    if (res) { staffMatch.resolved++; staffMatch.resolvedKcal += res.kcal; continue; }
    const retask = assignEvents.find(e => e.vid === s.vid && !e.byLayer && e.task !== 'hunt' && (e.day === s.day || e.day === s.day + 1));
    if (retask) { staffMatch.churned++; continue; }
    staffMatch.other++;
  }

  const end = {
    schema: 'huntdecomp/1',
    arm: 'sim-huntstaff-decomp-b', side, policy: base.id, seed, rep,
    days: r.days, endReason: r.endReason,
    won: !!Game.won, national: nationalLive, table: tableWaiting,
    rank, maxWave,
    inflow: Object.fromEntries(Object.entries(inflow).map(([k, v]) => [k, Math.round(num(v))])),
    chokeTotal: Math.round(chokeTotal),
    unattributed: Math.round(unatt), unattShare: +unattShare.toFixed(4),
    rotByCh: Object.fromEntries(Object.entries(rotByCh).map(([k, v]) => [k, Math.round(num(v))])),
    rotByChFast: Object.fromEntries(Object.entries(rotByChFast).map(([k, v]) => [k, Math.round(num(v))])),
    rotFresh: Math.round(num(W.rotFresh)), rotPreserved: Math.round(num(W.rotPreserved)),
    fastRotTotal: Math.round(sum(rotByChFast)),
    rotTotal: Math.round(sum(rotByCh)),
    laundered: num(W.laundered),
    starveDays: num(W.starveDays), starvationDeaths: starvDeaths,
    throttleCalls: num(W.throttleCalls), throttleEngaged: num(W.throttleEngaged),
    deaths: deaths.map(d => ({ day: d.day, kind: d.kind, cause: d.cause })),
    vidDeaths: vidDeaths.slice(0, 400),
    hunterDeaths,
    staffed: staffedAll.length, hunterDays: huntDays,
    staffDays: freeAtDawn.length ? freeAtDawn.filter(f => staffedAll.some(e => e.day === f.day)).length : 0,
    staffPartHist, staffMatch,
    huntResolves: huntResolves.length,
    assignLog: staffedAll,
    laborDays: Object.fromEntries(Object.entries(laborDays).map(([k, v]) => [k, v])),
    freeAtDawn: freeAtDawn.map(f => f.free),
    sayLines: (W.sayLines || []).slice(0, 400),
    detHash, ms,
  };
  return end;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const rows = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      for (const side of SIDES) {
        for (const rep of REPS) {
          let end;
          try { end = await oneRun(seed, policyId, side, rep); }
          catch (e) { console.error(`RUN CRASH seed=${seed} ${policyId}/${side}/rep${rep}: ${e && e.stack || e}`); process.exit(2); }
          rows.push(end);
          const f = path.join(OUT, `${side}-${policyId}-s${seed}-rep${rep}.json`);
          fs.writeFileSync(f, JSON.stringify(end, null, 1));
          const hunt = Math.round((end.inflow['duty:hunt'] || 0) / 1000);
          const forg = Math.round((end.inflow['duty:forage'] || 0) / 1000);
          console.log(`done seed=${seed} ${policyId}/${side}/rep${rep} days=${end.days} end=${end.endReason} ` +
            `hunt=${hunt}k forage=${forg}k fastRot=${Math.round(end.fastRotTotal / 1000)}k ` +
            `throttle=${end.throttleEngaged}/${end.throttleCalls} starvD=${end.starvationDeaths} ` +
            `hunters=${end.staffed} hunterDeaths=${end.hunterDeaths.length} ` +
            `unatt=${(end.unattShare * 100).toFixed(2)}% (${end.ms}ms)`);
          if (end.unattShare >= 0.01) console.error(`  HONESTY FLAG: unattributed ${(end.unattShare * 100).toFixed(2)}% on ${f}`);
        }
      }
    }
  }
  if (REPS.includes(1) && REPS.includes(2)) {
    let pairs = 0, okN = 0; const fails = [];
    for (const seed of SEEDS) for (const policyId of POLICIES) for (const side of SIDES) {
      pairs++;
      const a = rows.find(r => r.seed === seed && r.policy === policyId && r.side === side && r.rep === 1);
      const b = rows.find(r => r.seed === seed && r.policy === policyId && r.side === side && r.rep === 2);
      if (a && b && a.detHash === b.detHash) okN++;
      else fails.push(`${seed}/${policyId}/${side}`);
    }
    console.log(`\nDET-GATE: ${okN}/${pairs} repeat-pairs bit-identical${fails.length ? ' — FAILED: ' + fails.join(', ') : ''}`);
    if (fails.length) process.exit(3);
  }
  console.log('sweep complete.');
}

main().catch(e => { console.error('SWEEP CRASH', e && e.stack || e); process.exit(2); });
