#!/usr/bin/env node
// scripts/test-exile-selfeed.js — longsim scale-wall r7 PILOT (2026-10-13, lever 5).
//
// The exile-foreclosure clean test: run the selfeed policy (belongseek +
// ZERO pantry takes) on the r6 repro seeds and measure whether the
// courtship-window exile un-forecloses.
//
// PRE-REGISTRATION (see evidence/2026-10-13/sim-exile-r1.md):
//   primary metric: courtship-window exile rate on scale-push policy.
//   baseline (r6, same seeds 11/22/33/44): belongseek 3/4 exiled (d18/d32/d37).
//   GO: selfeed exile <=1/4 AND >=2/4 runs with seasoned links and no exile.
//   horizon: 150d death-aware. seeds: 11/22/33/44.
//
// TOOLING ONLY — no game balance changes. selfeed is a script policy;
// the only engine touch is the harness-level villageMeal/takeFromPantry
// refusal inside the policy (a diagnostic, modeling "I eat my own").
//
// Usage:
//   SEEDS="11,22,33,44" DAYS=150 OUT=/tmp/r7-pilot.json node scripts/test-exile-selfeed.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { selfeed } = require('./policies/selfeed');
const { kindseek } = require('./policies/kindseek');
const fc = require('./food-coupling-20261013');
const { attachScale, scaleRow, finalizeScale } = require('./scale-repro-20261013');

const POLICY_REGISTRY = { selfeed, kindseek };

const day = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }; };

const JUSTICE_RE = /moot|exil|theft|confront|⚖|freeload|grievance|hoard|cold shoulder|justice|weregild|schism|accus|verdict|sentence|carried you|hands:.*exile|pulling weight|warned/i;

function attachLedger(Game, m) {
  const led = m.ledger = { daily: [], justice: [] };
  // SENSE-TESTING: the harness silences Game.say for sims — restore a
  // capturing say so moot/exile/confrontation beats are readable.
  const origEmit = Game.emit ? Game.emit.bind(Game) : null;
  Game.say = function (msg) {
    try {
      const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
      // keep the FIRST 600 justice lines (the exile story), not the last —
      // post-exile "pantry is not yours" spam would otherwise evict them.
      if (text && JUSTICE_RE.test(text) && led.justice.length < 600) {
        led.justice.push({ day: day(Game), msg: text.slice(0, 300) });
      }
    } catch (e) {}
    if (origEmit) { try { return origEmit(msg, 'narration'); } catch (e) {} }
    return null;
  };
  return led;
}

function ledgerRow(Game) {
  const row = { day: 0, takes: 0, gives: 0, net: 0, trust: null, jstage: 0, heat: null };
  try {
    const v = Game.state.village || {};
    const vid = Game.villagerId;
    row.day = day(Game);
    row.takes = Math.round((v.takes || {})[vid] || 0);
    row.gives = Math.round((v.gives || {})[vid] || 0);
    row.net = row.gives - row.takes;
    row.trust = (v.trust || {})[vid] == null ? null : Math.round((v.trust || {})[vid]);
    row.jstage = ((Game.justiceState && Game.justiceState()) || {}).stage || 0;
    row.heat = (typeof Game.justiceHeat === 'function') ? Game.justiceHeat() : null;
  } catch (e) {}
  return row;
}

function finalizeLedger(Game, m, ctx) {
  const led = m.ledger, out = {};
  const rows = led.daily;
  out.ledgerRows = rows.length;
  out.takesEnd = rows.length ? rows[rows.length - 1].takes : null;
  out.givesEnd = rows.length ? rows[rows.length - 1].gives : null;
  out.netEnd = rows.length ? rows[rows.length - 1].net : null;
  out.maxJstage = Math.max(0, ...rows.map(r => r.jstage || 0));
  out.maxHeat = Math.max(0, ...rows.map(r => (r.heat == null ? 0 : r.heat)));
  // first day the ledger bar tripped (should never happen)
  const tripped = rows.find(r => r.takes >= 4000);
  out.ledgerTrippedDay = tripped ? tripped.day : null;
  out.refusedPantryTakes = ctx.refusedPantryTakes || 0;
  out.refusedMealK = Math.round(ctx.refusedMealK || 0);
  out.refusedMealDays = ctx.refusedMealDays || 0;
  out.takeEvents = (m.ledger.takeEvents || []).slice(0, 40);
  // net trajectory (sampled every 5th daily row): when did the drain peak?
  out.netCurve = rows.filter((_, i) => i % 5 === 0).map(r => [r.day, r.net, r.trust]);
  // moot/exile transcript: the beats that matter
  const j = led.justice;
  out.justiceLines = j.length;
  const mootLines = j.filter(l => /moot|exil|weregild|schism|verdict|sentence|⚖/i.test(l.msg));
  out.mootTranscript = mootLines.slice(0, 60);
  out.confrontLines = j.filter(l => /confront|freeload|hoard|cold shoulder|accus/i.test(l.msg)).slice(0, 30);
  // moot case forensics: who accused, what charge, fabricated?
  out.cases = [];
  try {
    const bs = Game.betrayalState ? Game.betrayalState() : null;
    for (const c of ((bs && bs.cases) || [])) {
      if (!(c.accused || []).includes(Game.villagerId)) continue;
      let accuserName = c.accuser;
      try { accuserName = Game.displayName ? Game.displayName(c.accuser) : c.accuser; } catch (e) {}
      out.cases.push({
        day: c.day, charge: c.charge, status: c.status, resolution: c.resolution || null,
        accuser: String(accuserName || c.accuser || '?').slice(0, 40),
        fabricated: !!c.fabricated,
        crimeKeys: (c.crimeKeys || []).slice(0, 4),
      });
    }
  } catch (e) {}
  return out;
}

async function runPilot(opts) {
  opts = opts || {};
  const label = opts.label || 'r7-exile-pilot';
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'kindseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '150', 10);
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'exilepilot-' + pid });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      attachScale(Game, m);
      attachLedger(Game, m);
      const policy = Object.assign({}, base);
      const origSetup = base.setup, origDaily = base.daily;
      // NOTE: runDays passes its OWN ctx to setup/daily — the policy must use
      // this run's ctx object or the refused-meal counters land elsewhere.
      const ctx = { policyId: pid };
      policy.setup = (G) => { if (origSetup) { try { origSetup(G, ctx); } catch (e) {} } };
      let prevTakes = 0;
      policy.daily = (G) => {
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(scaleRow(G)); } catch (e) {}
        try { m.ledger.daily.push(ledgerRow(G)); } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
        // takes-delta tracer: if the ledger moved today, record where/how
        try {
          const v = G.state.village || {};
          const t = Math.round(((v.takes || {})[G.villagerId]) || 0);
          if (t > prevTakes) {
            let inReach = null, loc = null;
            try { inReach = G.pantryInReach(); } catch (e) {}
            try { const pt = G.playerTile && G.playerTile(); loc = pt && pt.type; } catch (e) {}
            m.ledger.takeEvents = m.ledger.takeEvents || [];
            m.ledger.takeEvents.push({ day: day(G), delta: t - prevTakes, inReach, loc });
          }
          prevTakes = t;
        } catch (e) {}
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      const ledOut = finalizeLedger(Game, m, ctx);
      const row = Object.assign({ label, policy: pid, seed },
        fc.finalize(Game, m, result), finalizeScale(Game, m), ledOut);
      rows.push(row);
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} rank=${row.rank} ` +
        `exiled=${row.exiledEver}${row.exileDay != null ? ('@' + row.exileDay) : ''} ` +
        `seas=${row.linksSeasonedEver} nat=${row.national} ` +
        `TAKES=${row.takesEnd} gives=${row.givesEnd} refusedMeals=${row.refusedMealDays}/${(row.refusedMealK / 1000).toFixed(0)}k ` +
        `jstage=${row.maxJstage} heat=${row.maxHeat} jlines=${row.justiceLines}`);
    }
  }
  const agg = (fn) => rows.reduce((t, r) => t + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const summary = {
    label, seeds, policies: policyIds, days, runs: rows.length,
    national: agg(r => r.national), table: agg(r => r.table), won: agg(r => r.won),
    medianDays: med(rows.map(r => r.days)),
    exiledEver: agg(r => r.exiledEver),
    exileDays: rows.filter(r => r.exiledEver).map(r => r.exileDay),
    seasonedRuns: rows.filter(r => (r.linksSeasonedEver || 0) >= 1 && !r.exiledEver).length,
    takesAllZero: rows.every(r => (r.takesEnd || 0) === 0),
    maxTakes: Math.max(0, ...rows.map(r => r.takesEnd || 0)),
    minNet: Math.min(0, ...rows.map(r => r.netEnd || 0)),
    refusedMealK: agg(r => r.refusedMealK),
  };
  return { summary, rows };
}

function printSummary(rep) {
  const s = rep.summary;
  console.log(`\n=== ${s.label} === policies=[${s.policies.join(',')}] seeds=[${s.seeds.join(',')}] days=${s.days}`);
  console.log(`wall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.won}/${s.runs} medianDays ${s.medianDays}`);
  console.log(`exile: ${s.exiledEver}/${s.runs} exileDays=[${s.exileDays.join(',')}] seasonedNoExileRuns=${s.seasonedRuns}/${s.runs}`);
  console.log(`ledger: takesAllZero=${s.takesAllZero} maxTakes=${s.maxTakes} minNet=${s.minNet} refusedMealK=${(s.refusedMealK / 1000).toFixed(1)}k`);
  console.log(`GO (pilot): exile<=1/4 AND seasonedNoExileRuns>=2/4  =>  ${s.exiledEver <= 1 && s.seasonedRuns >= 2 ? 'GO (confirm)' : 'NO-GO (name the route)'}`);
}

if (require.main === module) {
  (async () => {
    const rep = await runPilot({});
    printSummary(rep);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runPilot };
