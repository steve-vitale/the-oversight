#!/usr/bin/env node
// scripts/sweep-subaid-20261014.js — SUBAID SWEEP (loop B, subaid arm).
//
// The ARMED condition is the ENGINE change (SUBAID-AID-CREDIT in
// src/js/hierarchy.js tendLink), not a policy layer: both sides run the
// identical policy stack (leadcourt + FOURTHLINK=1 + FIFTHLINK=1, the
// fifthlink-r26 stack) on identical seeds. Baseline side = pristine engine,
// armed side = engine + tendLink credits the tended kcal to the
// subordinate's pantry.
//
// SMOKE (instrument-honesty, per the POLICY_REGISTRY unwrap lesson):
//  - the loaded policy's id must be 'fifthlink-r26' (gate on)
//  - ARMED_ENGINE=1 requires the lever marker PRESENT in hierarchy.js;
//    ARMED_ENGINE=0 requires it ABSENT. Mismatch = loud failure.
//
// PRE-REGISTRATION (evidence/2026-10-14/sim-subaid-b.md, written BEFORE sims):
//   primary metric : seasoned conversion = (forming seeds where the 6th lead
//                    link SEASONS 30+d, trust 40+) / (forming seeds),
//                    identical seeds, baseline-engine vs armed-engine
//   GO             : fixed after the 16-seed baseline pre-screen
//   KILL-AT-SCREENING: <4 forming seeds on the 16-seed baseline screen
//   guardrails     : national / exiled / wave-5 per-seed vs identical-seed
//                    baseline; median survival REPORT-ONLY
//   horizon        : 180d death-aware
//   seeds          : 11/22/33/44/55/66/77/88 + 101/202/303/404/505/606/707/808
//   mechanism secondaries: thin+missed tribute weeks per 6th link, arrears
//                    trajectory, _sov.pantryKcal sampled on tend weeks
//
// Usage (baseline pre-screen, PRISTINE engine):
//   FOURTHLINK=1 FIFTHLINK=1 ARMED_ENGINE=0 OUT=evidence/2026-10-14/sim-subaid-b-screen.json \
//   node scripts/sweep-subaid-20261014.js
// Usage (armed, LEVER engine):
//   FOURTHLINK=1 FIFTHLINK=1 ARMED_ENGINE=1 OUT=evidence/2026-10-14/sim-subaid-b-armed.json \
//   node scripts/sweep-subaid-20261014.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fifthlink } = require('./policies/fifthlink-r26');
const { attachLinkPipe, finalizeLinkPipe } = require('./link-pipeline-20261014');
const tune = require('./sweep-standing-tune-20261013');
const sr = require('./scale-repro-20261013');
const fc = require('./food-coupling-20261013');

const ARMED_ENGINE = process.env.ARMED_ENGINE === '1';
const EXPECTED_POLICY_ID = 'fifthlink-r26';
const LEVER_MARKER = 'SUBAID-AID-CREDIT';

// SMOKE: instrument-honesty — fail loudly if the suite ever runs under the
// wrong policy or the wrong engine arm.
const POLICY_REGISTRY = { leadcourt: fifthlink };
if (fifthlink.id !== EXPECTED_POLICY_ID) {
  throw new Error(`policy SMOKE FAIL: expected id ${EXPECTED_POLICY_ID}, got ${fifthlink.id} (FIFTHLINK gate off?)`);
}
const markerPresent = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'hierarchy.js'), 'utf8')
  .indexOf(LEVER_MARKER) >= 0;
if (markerPresent !== ARMED_ENGINE) {
  throw new Error(`engine SMOKE FAIL: ARMED_ENGINE=${ARMED_ENGINE ? 1 : 0} but lever marker ${markerPresent ? 'PRESENT' : 'ABSENT'} in hierarchy.js`);
}

function deathCauses(result) {
  const causes = {};
  for (const d of ((result.samples || {}).deaths) || []) {
    const k = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    causes[k] = (causes[k] || 0) + 1;
  }
  return causes;
}

function subOf(Game, linkId) {
  try {
    const l = (Game.hierarchyState() || []).find(x => x && x.id === linkId);
    if (!l) return null;
    return ((Game.state.otherVillages || []).find(v => v.id === l.subordinate)) || null;
  } catch (e) { return null; }
}

// 6th lead link lifecycle + mechanism secondaries.
function sixthLeadLink(Game, lp, pipeRaw) {
  const leads = (lp.links || []).filter(l => l.dir === 'lead').sort((a, b) => a.day - b.day);
  const f = leads[5] || null;
  if (!f) return null;
  const out = {
    formedDay: f.day, target: f.target,
    seasonedDay: f.seasonedDay, brokeWhy: f.brokeWhy,
    trustAt30: f.trustAt30, maxTrust: f.maxTrust, tendWeeks: f.tendWeeks, age: f.age,
  };
  // arrears trajectory + missed (arrears-rising) weeks from the daily roll
  try {
    const rows = (pipeRaw.roll || []).filter(r => (r.links || []).some(x => x.id === f.id));
    const a0 = rows.length ? (rows[0].links.find(x => x.id === f.id).arrears | 0) : null;
    const r30 = rows.find(r => (r.links.find(x => x.id === f.id).age | 0) >= 30);
    const a30 = r30 ? (r30.links.find(x => x.id === f.id).arrears | 0) : null;
    const aEnd = rows.length ? (rows[rows.length - 1].links.find(x => x.id === f.id).arrears | 0) : null;
    let missedWeeks = 0, lastArrears = null;
    for (const r of rows) {
      const a = (r.links.find(x => x.id === f.id).arrears | 0);
      if (lastArrears != null && a > lastArrears) missedWeeks++;
      lastArrears = a;
    }
    out.arrearsAtForm = a0; out.arrearsAt30 = a30; out.arrearsEnd = aEnd;
    out.missedWeeks = missedWeeks;
  } catch (e) { out.arrearsNote = 'roll-unavailable'; }
  // tend-paid totals for this link + sub pantry sampled on tend weeks
  try {
    const tends = (pipeRaw.tends || []).filter(t => t.linkId === f.id);
    out.tendPaidTotal = tends.reduce((x, t) => x + (t.paid | 0), 0);
    out.subPantryOnTends = pipeRaw.subaidSamples || [];
  } catch (e) {}
  return out;
}

async function runSweep(opts) {
  opts = opts || {};
  const label = opts.label || (ARMED_ENGINE ? 'subaid-armed' : 'subaid-baseline');
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44,55,66,77,88,101,202,303,404,505,606,707,808').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'leadcourt').split(',').map(x => x.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '180', 10);
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    if (base.id !== EXPECTED_POLICY_ID) throw new Error(`policy SMOKE FAIL: expected id ${EXPECTED_POLICY_ID}, got ${base.id}`);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'subaid-' + pid });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      sr.attachScale(Game, m);
      tune.attachStanding(Game, m);
      attachLinkPipe(Game, m);
      m.linkpipe.subaidSamples = [];
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      const pp = m.linkpipe;
      let tendsSeen = 0;
      policy.daily = (G, ctx) => {
        try { pp.snapshot(G, pid); } catch (e) {}
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
        try { m.standing.rows.push(tune.standingSample(G)); } catch (e) {}
        if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
        // SUBAID secondary: sample the subordinate's pantry on days a tend fired
        // (no `return` above — the sampler must run after the policy's daily)
        try {
          const nt = (pp.tends || []).length;
          if (nt > tendsSeen) {
            tendsSeen = nt;
            const t = pp.tends[pp.tends.length - 1];
            const sov = subOf(G, t.linkId);
            pp.subaidSamples.push({ day: t.day, linkId: t.linkId, paid: t.paid | 0,
              subPantryAfter: sov ? Math.round(sov.pantryKcal || 0) : null });
          }
        } catch (e) {}
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      m._days = result.days;
      let w4faced = 0;
      try { w4faced = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) | 0) : 0; } catch (e) {}
      const lp = finalizeLinkPipe(Game, m);
      const row = Object.assign(
        { label, policy: pid, seed, armed: ARMED_ENGINE },
        fc.finalize(Game, m, result),
        sr.finalizeScale(Game, m),
        tune.finalizeStanding(Game, m),
        { linkpipe: lp, w4faced, deathCauses: deathCauses(result) }
      );
      row.sixth = sixthLeadLink(Game, lp, pp);
      rows.push(row);
      const fl = row.sixth;
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} ` +
        `6th=${fl ? `d${fl.formedDay}->${fl.seasonedDay == null ? 'x' : 's' + fl.seasonedDay}(t30:${fl.trustAt30},tw:${fl.tendWeeks},arr:${fl.arrearsAtForm}->${fl.arrearsAt30}->${fl.arrearsEnd},miss:${fl.missedWeeks})` : '-'} ` +
        `stand=${row.endStanding.total} nat=${row.nationalFirstDay == null ? '-' : 'd' + row.nationalFirstDay} ` +
        `w4=${row.wave4Day == null ? '-' : 'd' + row.wave4Day} w5=${row.wave5Day == null ? '-' : 'd' + row.wave5Day}`);
    }
  }
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const forming = rows.filter(r => r.sixth);
  const seasoned = forming.filter(r => r.sixth.seasonedDay != null);
  const summary = {
    label, seeds, policies: policyIds, days, armed: ARMED_ENGINE, runs: rows.length,
    sixthFormed: forming.length,
    sixthFormedSeeds: forming.map(r => r.seed),
    sixthSeasoned: seasoned.length,
    sixthSeasonedSeeds: seasoned.map(r => r.seed),
    medianDays: med(rows.map(r => r.days)),
    national: agg(r => (r.national ? 1 : 0)),
    table: agg(r => r.table), won: agg(r => r.won),
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
    console.log(`PRIMARY 6th-link seasoned: ${s.sixthSeasoned}/${s.sixthFormed} forming [${s.sixthSeasonedSeeds.join(' ') || '-'}] (6th formed on ${s.sixthFormed}/${s.runs}: ${s.sixthFormedSeeds.join(' ') || '-'})`);
    console.log(`guardrail: median survival ${s.medianDays}d`);
    console.log(`wall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.won}/${s.runs} wave4 ${s.wave4Unlock}/${s.runs} wave5 ${s.wave5Unlock}/${s.runs} maxStanding ${s.maxStanding} medianEnd ${s.medianEndStanding}`);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runSweep, sixthLeadLink };
