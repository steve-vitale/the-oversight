#!/usr/bin/env node
// scripts/sweep-spearfund-20261020.js — SPEARFUND pilot sweep (flesh-out
// loop arm sim-spearfund, run fleshout-20261020T1215Z, axis scale-onramp,
// backlog #69 named next).
//
// buildfund r19 KILLED AT PILOT: the gear recipe chain's first link never
// fires on the courtship road — 0/8 seeds put a hunting_spear in the
// scholar's hands. This sweep measures the spearfund policy layer
// (scripts/policies/spearfund.js, gate SPEARFUND=1): the stash-armory
// borrow leg (the honest channel the probe showed fires — declared in the
// layer header) + one blind craft attempt/day when L1+ and funded.
//
// Arms (identical seeds, 180d death-aware):
//   BASELINE (gate off): leadcourt
//   ARMED (gate on):     spearfundLead (SPEARFUND=1)
//
// PRE-REGISTRATION (written before the pilot; MEASUREMENT.md §§9-12, 14):
//   PRIMARY: seeds where the spear recipe reaches L1+ — recipe level >= 1
//     AND at least one craft attempt (sfSpearTries >= 1).
//   GO: armed >= 3/8 seeds (baseline measured 0/8 in r19).
//   KILL: armed < 3/8.
//   SECONDARY: wave-3 ledger kills >= 2/8 seeds (reachability direction).
//   GUARDRAILS: median survival >= control -10d; no new death modes.
//   HORIZON: 180d death-aware (dead villages stop simulating).
//   SEEDS: 64001-64008 (this run's shared control seeds per the claim).
//
// Usage:
//   SEEDS="64001,64002" DAYS=180 OUT=evidence/2026-10-20/sim-spearfund.json \
//   node scripts/sweep-spearfund-20261020.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { spearfundLead } = require('./policies/spearfund');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const tr = require('./sweep-tablerecon-20261013');

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const REGIONAL_PLUS = (r) => r === 'regional' || r === 'national' || r === 'global';
const med = (a) => { const s = (a || []).slice().sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };
const agg = (rows, f) => rows.reduce((t, r) => t + (f(r) || 0), 0);

function recipeLevel(Game, id) {
  try { return (((Game.state.codex || {}).recipes || {})[id] || {}).level || 0; } catch (e) { return 0; }
}
function scholarHasSpear(Game) {
  try {
    const s = Game.state.scholar || {};
    const inInv = (s.inventory || []).some(i => i && (i.itemId === 'hunting_spear' || i.id === 'hunting_spear'));
    const eq = s.equipped || {};
    const worn = Object.keys(eq).some(k => eq[k] && (eq[k].itemId === 'hunting_spear' || eq[k].id === 'hunting_spear'));
    return inInv || worn;
  } catch (e) { return false; }
}
function wave3Kills(Game) {
  // wave-3 ledger points are the kill currency (waveLedger.js: "kills only —
  // not near-misses"); >=1 point means at least one wave-3 kill.
  try { return (typeof Game.waveLedgerPoints === 'function' ? Game.waveLedgerPoints(3) : 0) | 0; }
  catch (e) { return 0; }
}

const SNAP_KEYS = ['proposedLead', 'tended', 'courtCounters', 'courtAccords',
  'sfLooted', 'sfSpearTries', 'sfSpearCrafts', 'sfFaults'];

async function runSF(opts) {
  opts = opts || {};
  const label = opts.label || process.env.LEVER || 'spearfund';
  const seeds = opts.seeds || (process.env.SEEDS || '64001,64002,64003,64004,64005,64006,64007,64008').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const days = opts.days || parseInt(process.env.DAYS || '180', 10);
  const arms = opts.arms || [
    { policy: leadcourt, gate: '0', arm: 'baseline' },
    { policy: spearfundLead, gate: '1', arm: 'armed' },
  ];
  const rows = [];
  for (const a of arms) {
    if (a.gate === '1') process.env.SPEARFUND = '1'; else delete process.env.SPEARFUND;
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'spearfund-' + a.policy.id });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      sr.attachScale(Game, m);
      const t = tr.attachTable(Game, m);
      const snap = {};
      const track = { recipeEver: 0, spearEver: 0 };
      const base = a.policy;
      const origDaily = base.daily;
      const policy = Object.assign({}, base, {
        daily(G, ctx) {
          try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
          try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
          try {
            const d = dayOf(G);
            if (d % 5 === 0) { const r = tr.tableRow(G); t.rows.push(r); tr.trackBest(t, r); }
          } catch (e) {}
          try {
            track.recipeEver = Math.max(track.recipeEver, recipeLevel(G, 'hunting_spear'));
            if (scholarHasSpear(G)) track.spearEver = 1;
          } catch (e) {}
          if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
          try { for (const k of SNAP_KEYS) if (ctx[k] != null) snap[k] = ctx[k]; } catch (e) {}
        },
      });
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      m._days = result.days;
      try { const rf = tr.tableRow(Game); t.rows.push(rf); tr.trackBest(t, rf); } catch (e) {}
      let regionalHeldDays = 0, regionalFirstDay = null;
      try {
        for (const r of (m.scale.daily || [])) {
          if (REGIONAL_PLUS(r.rank)) {
            regionalHeldDays++;
            if (regionalFirstDay == null || r.day < regionalFirstDay) regionalFirstDay = r.day;
          }
        }
      } catch (e) {}
      let w3pts = 0;
      try { w3pts = (typeof Game.waveLedgerPoints === 'function' ? Game.waveLedgerPoints(3) : 0) | 0; } catch (e) {}
      const row = Object.assign(
        { label, arm: a.arm, policy: a.policy.id, gate: a.gate, seed, commit: '' },
        fc.finalize(Game, m, result),
        sr.finalizeScale(Game, m),
        tr.finalizeTable(Game, m),
        {
          regionalHeldDays, regionalFirstDay, snap, w3pts, w3kills: wave3Kills(Game),
          recipeEver: track.recipeEver, spearEver: track.spearEver,
        }
      );
      // PRIMARY (pre-registered): recipe L1+ AND at least one craft attempt.
      row.go = (row.recipeEver >= 1 && (snap.sfSpearTries || 0) >= 1) ? 1 : 0;
      rows.push(row);
      console.log(`  [${a.policy.id} s${seed}] d=${row.days} ${row.endReason} recipeEver=${row.recipeEver} spearEver=${row.spearEver} tries=${snap.sfSpearTries || 0} crafts=${snap.sfSpearCrafts || 0} looted=${snap.sfLooted || 0} w3kills=${row.w3kills} GO=${row.go ? 'YES' : '-'}`);
    }
  }
  delete process.env.SPEARFUND;

  const byPolicy = {};
  for (const r of rows) {
    const p = byPolicy[r.policy] = byPolicy[r.policy] || { policy: r.policy, arm: r.arm, n: 0, go: 0, w3k: [], days: [], nat: 0, tries: 0, borrowed: 0 };
    p.n++; p.go += r.go; p.w3k.push(r.w3kills); p.days.push(r.days);
    if (r.nationalFirstDay != null) p.nat++;
    p.tries += (r.snap.sfSpearTries || 0); p.looted += (r.snap.sfLooted || 0);
  }
  const base = byPolicy.leadcourt || { days: [], go: 0, n: 0, w3k: [] };
  const armed = byPolicy['spearfund-lead'] || { days: [], go: 0, n: 0, w3k: [] };
  const baseMed = med(base.days), armedMed = med(armed.days);
  const goMet = armed.go >= 3;
  const survOk = armedMed != null && baseMed != null && armedMed >= baseMed - 10;
  const w3kSeedsArmed = armed.w3k.filter(k => k >= 1).length;
  const summary = {
    label, seeds, days, runs: rows.length,
    perPolicy: Object.values(byPolicy).map(p => ({
      policy: p.policy, arm: p.arm, n: p.n,
      GO: `${p.go}/${p.n}`,
      w3killSeeds: `${p.w3k.filter(k => k >= 1).length}/${p.n}`,
      national: `${p.nat}/${p.n}`,
      daysMed: med(p.days),
      totalTries: p.tries, totalLooted: p.looted,
    })),
    verdict: {
      goSeeds: `${armed.go}/${armed.n}`, goMet,
      medianDaysBase: baseMed, medianDaysArmed: armedMed,
      survivalGuardrail: survOk,
      w3killSeedsArmed: `${w3kSeedsArmed}/${armed.n}`,
      GO: goMet && survOk,
    },
    // wall numbers (all runs)
    national: agg(rows, r => (r.nationalFirstDay != null ? 1 : 0)),
    table: agg(rows, r => r.table), won: agg(rows, r => r.won),
    wave4ever: agg(rows, r => ((r.bestGW || [])[3] || 0) > 0 ? 1 : 0),
    wave5ever: agg(rows, r => ((r.bestGW || [])[4] || 0) > 0 ? 1 : 0),
    medianDays: med(rows.map(r => r.days)),
    maxDays: Math.max(0, ...rows.map(r => r.days)),
    vests: agg(rows, r => r.vests), exiled: agg(rows, r => r.exiledEver || 0),
    peopleDeaths: agg(rows, r => r.peopleDeaths || 0),
    starveDays: agg(rows, r => r.starveDays || 0),
  };
  return { summary, rows };
}

if (require.main === module) {
  (async () => {
    const t0 = Date.now();
    const rep = await runSF({});
    const s = rep.summary;
    console.log(`\n=== ${s.label} === seeds=[${s.seeds.join(',')}] days=${s.days} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    for (const p of s.perPolicy) {
      console.log(`  ${p.arm} ${p.policy}: GO ${p.GO} | w3killSeeds ${p.w3killSeeds} | national ${p.national} | daysMed ${p.daysMed} | tries ${p.totalTries} looted ${p.totalLooted}`);
    }
    console.log(`VERDICT: GO-seeds ${s.verdict.goSeeds} (need >=3/8: ${s.verdict.goMet ? 'MET' : 'MISS'}) | medianDays base ${s.verdict.medianDaysBase} armed ${s.verdict.medianDaysArmed} (>=base-10: ${s.verdict.survivalGuardrail ? 'OK' : 'MISS'}) | w3kills armed ${s.verdict.w3killSeedsArmed} | ==> ${s.verdict.GO ? 'GO' : 'NO-GO'}`);
    console.log(`wall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.won}/${s.runs} wave4ever ${s.wave4ever}/${s.runs} wave5ever ${s.wave5ever}/${s.runs} medianDays ${s.medianDays} maxDays ${s.maxDays} vests ${s.vests} exiled ${s.exiled}/${s.runs} peopleDeaths ${s.peopleDeaths} starveDays ${s.starveDays}`);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}
module.exports = { runSF };
