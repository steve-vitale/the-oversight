#!/usr/bin/env node
// scripts/sweep-compare.js — the standard before/after lever harness
// (measurement 2026-10-11).
//
// The path of least resistance for lever workers: one command runs identical
// seeds × N policies and emits the standard table. Deterministic: seeds are
// fixed, Math.random is seeded before eval (sim-harness), policies are
// deterministic by contract.
//
// Usage:
//   LEVER="contest fear" SEEDS="7,42,99" POLICIES="competent,risk-aware" \
//   DAYS=60 OUT=/tmp/compare.json node scripts/sweep-compare.js
//
// As a module:
//   const { runComparison } = require('./sweep-compare');
//   const rep = await runComparison({
//     label: 'contest fear',
//     seeds: [7, 42, 99],
//     policies: ['competent', 'risk-aware'],
//     days: 60,
//     extraMetrics: (Game, ctx) => ({ refusals: ctx.contestRefusals || 0 }),
//   });
//
// Standard table per (policy × seed): won, days, wave reach 1–5, arc,
// national reach, table waiting, death-cause shares, pacing means.
// extraMetrics(Game, ctx) adds lever-specific fields (flat object of numbers).
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { riskAware } = require('./policies/risk-aware');
const { larcenyLeaning } = require('./policies/larceny-leaning');
const { kind } = require('./policies/kind');
const { deedSeeking } = require('./policies/deed-seeking');
const { winseek } = require('./policies/winseek');
const idle = require('./policies/idle');

const POLICY_REGISTRY = {
  'competent': competent,
  'risk-aware': riskAware,
  'larceny-leaning': larcenyLeaning,
  'kind': kind,
  'deed-seeking': deedSeeking,
  'winseek': winseek,
  'zero': idle.zero, 'mvc': idle.mvc, 'leader': idle.leader,
};
try { POLICY_REGISTRY['oraclev2'] = require('./policies/oracleV2').oraclev2 || require('./policies/oracleV2'); } catch (e) {}
// capable (2026-10-14, Steve "Build a bot"): the bot that uses the game —
// real flee, combat abilities, scored choices, held talks, the Table.
try { POLICY_REGISTRY['capable'] = require('./policies/capable').capable; } catch (e) { console.warn('capable policy failed to load: ' + e.message); }
const livelihoods = require('./policies/livelihood');
for (const id of ['maker', 'merchant', 'caregiver']) POLICY_REGISTRY[id] = livelihoods[id];
const marketBuilds = require('./policies/market-build');
for (const id of ['dealer', 'hoarder']) POLICY_REGISTRY['market-'+id] = marketBuilds[id];
try { POLICY_REGISTRY['socialite'] = require('./policies/socialite').socialite || require('./policies/socialite'); } catch (e) {}
// perfsurvive pilot (flesh-out loop 2026-10-17, finding #433): the
// pre-seat courtship policies + the companion-screen layer, for the §15
// balanced-panel before/after. Additive; zero behavior change to existing
// entries.
try { const f = require('./policies/feastscale'); POLICY_REGISTRY['leadfeast'] = f.leadfeast; POLICY_REGISTRY['belongfeast'] = f.belongfeast; } catch (e) {}
try { const p = require('./policies/perfsurvive'); POLICY_REGISTRY['perfsurvive-lead'] = p.perfsurviveLead; POLICY_REGISTRY['perfsurvive-belong'] = p.perfsurviveBelong; } catch (e) {}
// helpcost instrument (flesh-out loop 2026-10-17, sim-helpcost): the
// aid-engaging helpcall stack + the cost-accounting observation layer, for
// the §15 balanced-panel before/after (gate-off vs HELPCALL=1). Additive;
// zero behavior change to existing entries.
try { const h = require('./policies/helpcost'); POLICY_REGISTRY['leadcost'] = h.leadCost; POLICY_REGISTRY['belongcost'] = h.belongCost; } catch (e) {}
// spearfund instrument (flesh-out loop 2026-10-20, sim-spearfund): the
// leadcourt courtship stack + the spear-acquisition drive layer, for the
// §15 balanced-panel before/after (gate-off vs SPEARFUND=1). Additive;
// zero behavior change to existing entries.
try { const l = require('./policies/leadcourt'); POLICY_REGISTRY['leadcourt'] = l.leadcourt; } catch (e) {}
// vest-census instrument (sim-vests-b, DIAG only): leanlink in the
// registry so the balanced panel can build the courting column. Additive;
// zero behavior change to existing entries (leanlink itself stays
// default-OFF behind LEANLINK=1; see scripts/policies/leanlink.js).
try { const ll = require('./policies/leanlink'); POLICY_REGISTRY['leanlink'] = ll.leanlink; } catch (e) {}
try { const p = require('./policies/spearfund'); POLICY_REGISTRY['spearfund-lead'] = p.spearfundLead; } catch (e) {}

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  // Everything behind try/catch: a hostile read must never kill a run.
  const out = {
    won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village',
    breadth: 0, stage: 0, vests: 0, vestsVillager: 0,
  };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.breadth = Game.codexBreadth ? Game.codexBreadth() : 0; } catch (e) {}
  try { out.stage = Game.integrationStage ? Game.integrationStage() : 0; } catch (e) {}
  // VESTS (longsim scale-wall r5 2026-10-13): the mission's measure list
  // includes vests; the driver never tracked them. military/swat vest in the
  // scholar's pack or equipped slots at snapshot time.
  //
  // VEST-COUNTER FIX (sim-vestcounter-b, 2026-10-30, instrument only):
  // inventory entries are stored under `.itemId` (game.js alienLootGrant,
  // marketDeliveryEntry, capstone grant) and equipped slots store
  // `{itemId, name, ...}` (equipment.js — never `.id`). The old read of
  // entry `.id` only therefore reported 0 on every panel case, including
  // seeds where the scholar was wearing a vest (sim-vests-b). The read
  // below is `itemId || id` (string entries pass through); old `.id`-form
  // entries still count. No game behavior changes: this is a pure read.
  //
  // vestsVillager (same commit, optional metric): distinct (holder, vestId)
  // pairs held by LIVE roster villagers in pack or equipped at snapshot
  // time. Dedupe matters: a worn villager vest appears in BOTH pack and
  // equipped in this engine (census day-0, seed 9915: Grace Obi's one swat
  // vest shows pack + equipped), so the pair counts once. The scholar's
  // person record (Game.villagerId) is skipped here — its live pack IS
  // state.scholar, counted in `vests` above. Dead holders are skipped.
  // Stashed, generation-pool and armory-pile holdings are NOT counted
  // (they are not held). Pure reads only; a hostile read never kills a run.
  try {
    const VEST_IDS = ['military_vest', 'swat_vest'];
    const vestEntryId = (e) => {
      if (!e) return null;
      if (typeof e === 'string') return e;
      return e.itemId || e.id || null;
    };
    let n = 0;
    for (const it of ((Game.state.scholar || {}).inventory || [])) if (VEST_IDS.includes(vestEntryId(it))) n += (it.units || 1);
    for (const v of Object.values((Game.state.scholar || {}).equipped || {})) if (VEST_IDS.includes(vestEntryId(v))) n++;
    out.vests = n;
    const seenPairs = new Set();
    const scholarVid = Game.villagerId;
    const roster = ((Game.state.village || {}).roster || []);
    const people = (Game.data || {}).villagers || [];
    const survivors = (Game.data || {}).background_survivors || [];
    for (const vid of roster) {
      if (vid === scholarVid) continue;
      const p = people.find(x => x && x.id === vid) || survivors.find(x => x && x.id === vid);
      if (!p || p.dead) continue;
      for (const it of (p.items || [])) {
        const id = vestEntryId(it);
        if (VEST_IDS.includes(id)) seenPairs.add(vid + '|' + id);
      }
      for (const v of Object.values(p.equipped || {})) {
        const id = vestEntryId(v);
        if (VEST_IDS.includes(id)) seenPairs.add(vid + '|' + id);
      }
    }
    out.vestsVillager = seenPairs.size;
  } catch (e) {}
  return out;
}

async function runComparison(opts) {
  opts = opts || {};
  const label = opts.label || process.env.LEVER || 'unlabeled';
  const seeds = opts.seeds || (process.env.SEEDS || '7,42,99').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'competent').split(',').map(s => s.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '60', 10);
  const extraMetrics = opts.extraMetrics || null;
  const region = opts.region || process.env.REGION || null;
  const origin = opts.origin || process.env.ORIGIN || null;
  const occupation = opts.occupation == null ? null : opts.occupation;

  const runs = [], exclusions = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error(`unknown policy: ${pid} (see scripts/policies/README.md)`);
    for (const seed of seeds) {
      const { Game, manifest } = await loadGame({ seed, mode: 'compare-' + pid, fullTelemetry: false });
      if (region) {
        if (!Game.playableRegions().some(r => r.id === region)) throw Error('Region is not playable: '+region);
        Game.debugRegion = region;
      }
      const selection = await setupGame(Game, origin, undefined, occupation == null ? undefined : { occupation });
      if (selection?.status === 'excluded') { exclusions.push({ policy: pid, seed, selection }); continue; }
      if (region && Game.state.region !== region) throw Error('Wrong comparison region: '+Game.state.region);
      // Shallow copy: never mutate the shared policy object. Wrap daily to
      // track max scale rank / arc / table — reachability needs history,
      // not just the end state.
      const policy = Object.assign({}, base);
      let policyContext;
      if (typeof base.diagnostics === 'function') policy.setup = (G, ctx) => {
        policyContext = ctx;
        if (base.setup) return base.setup(G, ctx);
      };
      const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false, maxVests: 0, maxVestsVillager: 0 };
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try {
          const s = stdSnapshot(G);
          hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
          hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
          hist.maxVests = Math.max(hist.maxVests, s.vests || 0);
          hist.maxVestsVillager = Math.max(hist.maxVestsVillager, s.vestsVillager || 0);
          if (s.tableWaiting) hist.everTable = true;
          if (s.tableEntered) hist.everEntered = true;
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
      const end = stdSnapshot(Game);
      const deaths = {};
      try {
        for (const d of (result.samples.deaths || [])) {
          const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
          deaths[k] = (deaths[k] || 0) + 1;
        }
      } catch (e) {}
      const row = {
        label, policy: pid, seed,
        days: result.days, gameDays: result.gameDays,
        endReason: result.endReason,
        stop: result.stop,
        communityExposure: result.communityExposure,
        won: end.won ? 1 : 0,
        waveReach: result.maxWaveUnlocked || 1,
        maxArc: hist.maxArc,
        maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
        // end.rank too: a run that ends via Game.over before daily misses its last rank (audit 2026-10-14)
        national: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
        // 'table' = INVITED (tableWaiting ever set), not reached; 'entered' = sat at the table (audit 2026-10-14)
        table: hist.everTable || end.tableWaiting ? 1 : 0,
        entered: hist.everEntered || end.tableEntered ? 1 : 0,
        vests: Math.max(hist.maxVests, end.vests || 0),
        vestsVillager: Math.max(hist.maxVestsVillager, end.vestsVillager || 0),
        deaths,
        pacing: result.pacing ? {
          verbs: result.pacing.meanDeliberatePerDay,
          policyCalls: result.pacing.meanPolicyCallsPerDay,
          ticks: result.pacing.meanTicksPerDay,
          perDay: result.pacing.perDay,
        } : null,
      };
      if (selection) row.selection = selection;
      if (typeof base.diagnostics === 'function') row.policyDiagnostics = base.diagnostics(policyContext);
      if (extraMetrics) {
        try { row.extra = extraMetrics(Game, result) || {}; }
        catch (e) { row.extra = { _err: String(e.message).slice(0, 80) }; }
      }
      runs.push(row);
      console.log(`  [${pid} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} rank=${row.maxRank} table=${row.table} won=${row.won}`);
    }
  }

  // Aggregate per policy.
  const byPolicy = {};
  for (const pid of policyIds) {
    const rs = runs.filter(r => r.policy === pid);
    const daysArr = rs.map(r => r.days).sort((a, b) => a - b);
    const median = daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0;
    const deathTotals = {};
    for (const r of rs) for (const [k, v] of Object.entries(r.deaths || {})) deathTotals[k] = (deathTotals[k] || 0) + v;
    const extraMeans = {};
    for (const r of rs) {
      for (const [k, v] of Object.entries(r.extra || {})) {
        if (typeof v !== 'number') continue;
        extraMeans[k] = extraMeans[k] || [];
        extraMeans[k].push(v);
      }
    }
    for (const k of Object.keys(extraMeans)) {
      const vs = extraMeans[k];
      extraMeans[k] = +(vs.reduce((a, b) => a + b, 0) / vs.length).toFixed(2);
    }
    byPolicy[pid] = {
      n: rs.length,
      won: rs.reduce((t, r) => t + r.won, 0),
      medianDays: median,
      maxDays: daysArr.length ? daysArr[daysArr.length - 1] : 0,
      maxWave: Math.max.apply(null, rs.map(r => r.waveReach).concat([1])),
      nationalPct: +(100 * rs.reduce((t, r) => t + r.national, 0) / Math.max(1, rs.length)).toFixed(0),
      tablePct: +(100 * rs.reduce((t, r) => t + r.table, 0) / Math.max(1, rs.length)).toFixed(0),
      enteredPct: +(100 * rs.reduce((t, r) => t + (r.entered || 0), 0) / Math.max(1, rs.length)).toFixed(0),
      vests: rs.reduce((t, r) => t + (r.vests || 0), 0),
      vestsVillager: rs.reduce((t, r) => t + (r.vestsVillager || 0), 0),
      deaths: deathTotals,
      meanVerbsPerDay: rs.length && rs[0].pacing
        ? +(rs.reduce((t, r) => t + (r.pacing.verbs || 0), 0) / rs.length).toFixed(1) : null,
      extra: extraMeans,
    };
    if (occupation != null) {
      Object.assign(byPolicy[pid], { attempted: seeds.length, excluded: exclusions.filter(r => r.policy === pid).length });
      if (!rs.length) for (const field of ['medianDays', 'maxDays', 'maxWave', 'nationalPct', 'tablePct', 'enteredPct']) byPolicy[pid][field] = null;
    }
  }

  const report = { label, seeds, policies: policyIds, days, runs, byPolicy,
    generated: new Date().toISOString() };
  if (occupation != null) Object.assign(report, { occupation, exclusions });
  return report;
}

function printTable(report) {
  console.log(`\n=== ${report.label} ===  (${report.policies.join(', ')}) seeds=[${report.seeds.join(',')}] days=${report.days}`);
  console.log('policy        n  won  medD  maxD  maxWave  nat%  inv%  sat%  vests  delib/d  deaths');
  for (const pid of report.policies) {
    const b = report.byPolicy[pid];
    const dstr = Object.entries(b.deaths).map(([k, v]) => `${k}:${v}`).join(',') || '-';
    console.log(
      `${pid.padEnd(13)} ${String(b.n).padEnd(2)} ${String(b.won).padEnd(4)} ` +
      `${String(b.medianDays).padEnd(5)} ${String(b.maxDays).padEnd(5)} ${String(b.maxWave).padEnd(8)} ` +
      `${String(b.nationalPct).padEnd(5)} ${String(b.tablePct).padEnd(5)} ${String(b.enteredPct).padEnd(5)} ${String(b.vests).padEnd(6)} ${String(b.meanVerbsPerDay).padEnd(8)} ${dstr}`
    );
    const ex = Object.entries(b.extra || {});
    if (ex.length) console.log(`  extra: ${ex.map(([k, v]) => `${k}=${v}`).join(' ')}`);
  }
  console.log('');
}

// fleeExitSummary(fights, ctx) — flee EXIT telemetry (scale-wall r17 arm 3,
// tooling only). The policy ctx.fled counter is per-TICK: every flee()
// invocation increments it — edge walks, held ground, no-op barrier pushes,
// real exits, all of them. It counts ATTEMPTS, not exits. This summarizes
// actual fight EXITS from per-fight audit records (attachDmgAudit or any
// records carrying `result`): a genuine disengage exit is a fight closed
// with result 'fled' — door flee, barrier push with no chasers / into Haven
// / all chasers gave up at the barrier, or the tbEndCheck p.fled path
// (game.js). 'dissolved' (death mid-barrier-crossing, or a fight abandoned
// without tbEnd) is NOT an exit: nobody walked out of it.
//
// Returns { attempts, exits, dissolved, nFights, byResult, exitRate }.
// Read attempts vs exits together: 5410 attempts / 0 exits (leadcourt s22,
// scale-wall r16) is the signature of a flee that never exits. Wall-suite
// drivers with per-fight records should report both every run.
function fleeExitSummary(fights, ctx) {
  const arr = Array.isArray(fights) ? fights : [];
  const byResult = {};
  let exits = 0, dissolved = 0;
  for (const f of arr) {
    const r = String((f && f.result) || 'unknown');
    byResult[r] = (byResult[r] || 0) + 1;
    if (r === 'fled') exits += 1;
    else if (r === 'dissolved') dissolved += 1;
  }
  const attempts = (ctx && Number.isFinite(ctx.fled)) ? ctx.fled : 0;
  return {
    attempts, exits, dissolved, nFights: arr.length, byResult,
    exitRate: attempts > 0 ? +(exits / attempts).toFixed(4) : null,
  };
}

if (require.main === module) {
  (async () => {
    const report = await runComparison({});
    printTable(report);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(report, null, 1)); console.log('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runComparison, printTable, POLICY_REGISTRY, stdSnapshot, fleeExitSummary };

// Explicit opt-in comparison configuration. Omission preserves the standard driver.
module.exports.comparisonCapabilities = {schemaVersion:1,origin:true,region:true,occupation:true};
