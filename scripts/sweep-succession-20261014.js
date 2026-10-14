#!/usr/bin/env node
// scripts/sweep-succession-20261014.js — SUCCESSION-PROTOCOL SWEEP.
//
// Baseline (SUCCPROTO unset): the succession module exports fourthlink
// unchanged, so this measures the uncapped LEAD courtship (FOURTHLINK=1)
// on identical seeds — the same road the fifthlink and renegans pilots
// measured, so the baseline cross-checks against
// evidence/2026-10-14/sim-renegans-base.json.
// Armed (FOURTHLINK=1 SUCCPROTO=1): leadcourt + the succession-response
// protocol — in the 7-day grief window after a Haven leader death the new
// speaker answers staged renegotiation beats (winseek's bar), tends every
// bond (protocol bar 8000), and keeps tribute current where Haven owes.
//
// PRE-REGISTRATION (evidence/2026-10-14/sim-succession.md — GO finalized
// AFTER the identical-seed baseline, BEFORE the armed run):
//   primary metric : late-link conversion — lead links forming >= day 60
//                    that reach seasoned, armed vs identical-seed baseline
//   guardrails     : median survival within +-10d of identical-seed
//                    baseline; exiled <= baseline+1; national tracked
//   horizon        : 180d death-aware (harnessstop dead-village tail)
//   seeds/policies : 11/22/33/44/55/66/77/88 x leadcourt(+FOURTHLINK)
//
// Usage (baseline, one seed):
//   SEEDS=55 FOURTHLINK=1 OUT=evidence/2026-10-14/sim-succession-base-s55.json \
//   node scripts/sweep-succession-20261014.js
// Usage (lever):
//   SEEDS=55 FOURTHLINK=1 SUCCPROTO=1 OUT=evidence/2026-10-14/sim-succession-armed-s55.json \
//   node scripts/sweep-succession-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
// Graceful degradation (worker-integrity lesson): if the layer was deleted
// per the kill protocol, baseline mode falls back to fourthlink directly;
// armed mode fails LOUDLY instead of measuring the wrong thing.
let policyBase = null;
const ARMED = process.env.SUCCPROTO === '1';
try {
  policyBase = require('./policies/succession').succession;
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e;
  if (ARMED) {
    console.error('FATAL: SUCCPROTO=1 but scripts/policies/succession.js is absent (killed arm). Refusing to measure the baseline as armed.');
    process.exit(2);
  }
  console.error('info: succession layer absent — baseline mode falls back to fourthlink.');
  policyBase = require('./policies/fourthlink').fourthlink;
}
const { attachLinkPipe, finalizeLinkPipe } = require('./link-pipeline-20261014');
// 5th lead link by formation order, from the linkpipe lifecycle.
function fifthLeadLink(lp) {
  const leads = (lp.links || []).filter(l => l.dir === 'lead').sort((a, b) => a.day - b.day);
  const f = leads[4] || null;
  return f ? {
    formedDay: f.day, target: f.target,
    seasonedDay: f.seasonedDay, brokeWhy: f.brokeWhy,
    trustAt30: f.trustAt30, maxTrust: f.maxTrust, tendWeeks: f.tendWeeks, age: f.age,
  } : null;
}
// Late-link conversion: lead links forming >= day 60 that reach seasoned.
function lateLinksConverted(lp) {
  return (lp.links || []).filter(l => l.dir === 'lead' && (l.day | 0) >= 60 && l.seasonedDay != null);
}
const tune = require('./sweep-standing-tune-20261013');
const sr = require('./scale-repro-20261013');
const fc = require('./food-coupling-20261013');

const POLICY_REGISTRY = { leadcourt: policyBase };

function deathCauses(result) {
  const causes = {};
  for (const d of ((result.samples || {}).deaths) || []) {
    const k = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    causes[k] = (causes[k] || 0) + 1;
  }
  return causes;
}

// ---- renegotiation-beat instrument (MEASUREMENT ONLY) ----
// Wraps Game.answerRenegotiation with a PURE pass-through recorder (no
// Math.random consumption) and snapshots staged beats daily. A beat is
// "presented" once per (linkId, stagedDay); "answered" when an answer call
// lands on it with a truthy return. (Copied from the renegans instrument —
// that sweep's module requires the deleted renegans layer and cannot load.)
function attachReneg(Game, m) {
  const r = m.reneg = { presented: {}, answers: [] };
  const dayOf = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const beatDayOf = (linkId) => {
    try {
      const links = Game.hierarchyState ? Game.hierarchyState() : [];
      const l = links.find(x => x && x.id === linkId);
      return l && l.pendingRenegotiation ? (l.pendingRenegotiation.day | 0) : null;
    } catch (e) { return null; }
  };
  const orig = Game.answerRenegotiation;
  if (typeof orig === 'function') {
    Game.answerRenegotiation = function (linkId, how) {
      const bd = beatDayOf(linkId);
      let ret;
      try { ret = orig.apply(Game, arguments); }
      catch (e) { ret = { __threw: true }; }
      try {
        if (bd != null) {
          const key = linkId + ':' + bd;
          if (!(key in r.presented)) r.presented[key] = { day: dayOf(), linkId, beatDay: bd };
          if (ret && !ret.__threw) r.answers.push({ day: dayOf(), linkId, how, ret: String(ret), beatDay: bd, key });
        }
      } catch (e) {}
      if (ret && ret.__threw) throw new Error('wrapped answerRenegotiation threw');
      return ret;
    };
  }
  r.snapshot = (G) => {
    try {
      const links = G.hierarchyState ? G.hierarchyState() : [];
      for (const l of links) {
        if (!l || !l.id || !l.pendingRenegotiation) continue;
        const bd = l.pendingRenegotiation.day | 0;
        const key = l.id + ':' + bd;
        if (!(key in r.presented)) r.presented[key] = { day: dayOf(), linkId: l.id, beatDay: bd };
      }
    } catch (e) {}
  };
  return r;
}

function finalizeReneg(Game, m) {
  const r = m.reneg;
  const presented = Object.keys(r.presented);
  const answeredKeys = new Set(r.answers.map(a => a.key));
  const answered = presented.filter(k => answeredKeys.has(k));
  const howCounts = {};
  for (const a of r.answers) howCounts[a.how] = (howCounts[a.how] || 0) + 1;
  return {
    beatsPresented: presented.length,
    beatsAnswered: answered.length,
    beatsLapsed: presented.length - answered.length,
    answerHow: howCounts,
    beatDetail: presented.map(k => Object.assign({ key: k, answered: answeredKeys.has(k) }, r.presented[k])),
  };
}

// ---- succession-event instrument (MEASUREMENT ONLY) ----
// Records the mantle event's footprint: 'succession' notes stamped into
// live link histories (linkId + note-day keys), plus the protocol's own
// counters from the final ctx (succBeatsAnswered / succTends /
// succTributePaid / successionWindows).
function attachSuccession(Game, m) {
  const s = m.succ = { events: {} };
  const dayOf = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  s.snapshot = (G) => {
    try {
      for (const l of (G.hierarchyState ? G.hierarchyState() : [])) {
        if (!l || !l.id) continue;
        for (const h of (l.history || [])) {
          if (!h || h.kind !== 'succession') continue;
          const key = l.id + ':' + (h.day | 0);
          if (!(key in s.events)) s.events[key] = { day: dayOf(), linkId: l.id, noteDay: h.day | 0 };
        }
      }
    } catch (e) {}
  };
  return s;
}

function finalizeSuccession(Game, m) {
  const s = m.succ;
  const events = Object.values(s.events);
  const c = (m._lastCtx) || {};
  return {
    successionEvents: events.length,
    protocolWindows: c.successionWindows | 0,
    protocolBeatsAnswered: c.succBeatsAnswered | 0,
    protocolTends: c.succTends | 0,
    protocolTributePaid: c.succTributePaid | 0,
  };
}

async function runSweep(opts) {
  opts = opts || {};
  const label = opts.label || (ARMED ? 'succession-armed' : 'succession-baseline');
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'leadcourt').split(',').map(x => x.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '180', 10);
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'succession-' + pid });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      sr.attachScale(Game, m);
      tune.attachStanding(Game, m);
      attachLinkPipe(Game, m);
      attachReneg(Game, m);
      attachSuccession(Game, m);
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      const pp = m.linkpipe;
      const rg = m.reneg;
      const sc = m.succ;
      policy.daily = (G, ctx) => {
        try { pp.snapshot(G, pid); } catch (e) {}
        try { rg.snapshot(G); } catch (e) {}
        try { sc.snapshot(G); } catch (e) {}
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
        try { m.standing.rows.push(tune.standingSample(G)); } catch (e) {}
        if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
        try { m._lastCtx = ctx; } catch (e) {}
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      m._days = result.days;
      let w4faced = 0;
      try { w4faced = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) | 0) : 0; } catch (e) {}
      let exiled = 0;
      try { exiled = !!((Game.state.scholar || {}).exiled) ? 1 : 0; } catch (e) {}
      const row = Object.assign(
        { label, policy: pid, seed, armed: ARMED },
        fc.finalize(Game, m, result),
        sr.finalizeScale(Game, m),
        tune.finalizeStanding(Game, m),
        { linkpipe: finalizeLinkPipe(Game, m), reneg: finalizeReneg(Game, m), succession: finalizeSuccession(Game, m), w4faced, deathCauses: deathCauses(result), exiled }
      );
      rows.push(row);
      const fl = fifthLeadLink(row.linkpipe);
      const late = lateLinksConverted(row.linkpipe);
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} ` +
        `succ=${row.succession.successionEvents} beats=${row.reneg.beatsAnswered}/${row.reneg.beatsPresented} ` +
        `lateConv=${late.length} 5th=${fl ? `d${fl.formedDay}->${fl.seasonedDay == null ? 'x' : 's' + fl.seasonedDay}(t30:${fl.trustAt30})` : '-'} ` +
        `stand=${row.endStanding.total} nat=${row.nationalFirstDay == null ? '-' : 'd' + row.nationalFirstDay} ` +
        `w4=${row.wave4Day == null ? '-' : 'd' + row.wave4Day} exiled=${row.exiled}`);
    }
  }
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const fifthSeasonedRows = rows.filter(r => { const f = fifthLeadLink(r.linkpipe); return f && f.seasonedDay != null; });
  const fifthFormedRows = rows.filter(r => fifthLeadLink(r.linkpipe));
  const summary = {
    label, seeds, policies: policyIds, days, armed: ARMED, runs: rows.length,
    successionEvents: agg(r => r.succession.successionEvents),
    protocolBeatsAnswered: agg(r => r.succession.protocolBeatsAnswered),
    protocolTends: agg(r => r.succession.protocolTends),
    protocolTributePaid: agg(r => r.succession.protocolTributePaid),
    renegPresented: agg(r => r.reneg.beatsPresented),
    renegAnswered: agg(r => r.reneg.beatsAnswered),
    lateConverted: agg(r => lateLinksConverted(r.linkpipe).length),
    lateFormed: agg(r => (r.linkpipe.links || []).filter(l => l.dir === 'lead' && (l.day | 0) >= 60).length),
    fifthSeasoned: fifthSeasonedRows.length,
    fifthFormed: fifthFormedRows.length,
    fifthSeeds: fifthSeasonedRows.map(r => r.policy + ' s' + r.seed),
    medianDays: med(rows.map(r => r.days)),
    national: agg(r => (r.national ? 1 : 0)),
    table: agg(r => r.table), won: agg(r => r.won), exiled: agg(r => r.exiled),
    wave4Unlock: agg(r => r.wave4Day != null ? 1 : 0),
    wave5Unlock: agg(r => r.wave5Day != null ? 1 : 0),
    maxStanding: Math.max(0, ...rows.map(r => r.endStanding.total)),
    medianEndStanding: med(rows.map(r => r.endStanding.total)),
  };
  return { summary, rows };
}

if (require.main === module) {
  (async () => {
    const t0 = Date.now();
    const rep = await runSweep({});
    const s = rep.summary;
    console.log(`\n=== ${s.label} === policies=[${s.policies.join(',')}] seeds=[${s.seeds.join(',')}] days=${s.days} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    console.log(`succession events: ${s.successionEvents}; protocol: beats=${s.protocolBeatsAnswered} tends=${s.protocolTends} tribute=${s.protocolTributePaid}`);
    console.log(`PRIMARY late-link conversion (formed>=d60, seasoned): ${s.lateConverted} (late formed: ${s.lateFormed})`);
    console.log(`5th-link seasoned: ${s.fifthSeasoned}/${s.runs} (5th formed on ${s.fifthFormed}/${s.runs})`);
    console.log(`guardrail: median survival ${s.medianDays}d, exiled ${s.exiled}/${s.runs}`);
    console.log(`wall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.won}/${s.runs} wave4 ${s.wave4Unlock}/${s.runs} wave5 ${s.wave5Unlock}/${s.runs} maxStanding ${s.maxStanding} medianEnd ${s.medianEndStanding}`);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runSweep, fifthLeadLink, lateLinksConverted };
