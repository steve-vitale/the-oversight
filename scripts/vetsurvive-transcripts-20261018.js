#!/usr/bin/env node
// vetsurvive-transcripts-20261018.js — sense-testing side-runs for
// sim-vetsurvive: capture the muster / stand-down / scholar-hold SAY beats
// in context, so a human can judge whether the protection reads as
// villagers acting like people (SENSE-TESTING LAW).
//
// Runs the ARMED policy on seeds where the pilot's telemetry shows the
// muster fired (vsMusters > 0), capturing MUSTER / STAND DOWN / holds-the-
// hall beats plus surrounding SAY context.
//
// Usage: SEEDS="51904,52001" OUT=evidence/2026-10-18/vetsurvive-transcripts/
//        node scripts/vetsurvive-transcripts-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { vetsurviveLead, vetsurviveBelong } = require('./policies/vetsurvive');

const SEEDS = (process.env.SEEDS || '').split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const OUT = process.env.OUT || 'evidence/2026-10-18/vetsurvive-transcripts';
const DAYS = parseInt(process.env.DAYS || '180', 10);

function baseEnv() {
  process.env.VETSURVIVE = '1';
  process.env.VETREL = '1';
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  process.env.TRIBFLOOR = '1';
  process.env.SUCCGRACE = '1';
  process.env.RAIDDENSITY = '1';
}

async function runOne(policy, seed) {
  baseEnv();
  const { Game } = await loadGame({ seed, mode: 'vetsurvive-transcript-' + policy.id });
  await setupGame(Game);
  const says = [];
  const oSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try { says.push({ day: (Game.state.scholar || {}).day || 0, msg: String(msg) }); } catch (e) {}
    return oSay(msg);
  };
  const ctx = {};
  const base = policy;
  const origDaily = base.daily;
  const wrapped = Object.assign({}, base, {
    daily(G, c) {
      Object.assign(ctx, c);
      if (origDaily) return origDaily(G, c);
    },
  });
  await quietLog(async () => runDays(Game, wrapped, { days: DAYS }));
  // keep muster/hold beats + 3 lines of context each side
  const hits = [];
  const want = /MUSTER|STAND DOWN|holds the hall|mustered home|hall door/i;
  says.forEach((s, i) => {
    if (want.test(s.msg)) {
      for (let j = Math.max(0, i - 3); j <= Math.min(says.length - 1, i + 3); j++) {
        hits.push(`[d${says[j].day}] ${says[j].msg}`);
      }
      hits.push('---');
    }
  });
  return { seed, policy: policy.id, musterBeats: hits, ctx: {
    vsMusters: ctx.vsMusters || 0, vsMusteredTotal: ctx.vsMusteredTotal || 0,
    vsReleases: ctx.vsReleases || 0, vsScholarHoldDays: ctx.vsScholarHoldDays || 0,
    vsTravelBlocked: ctx.vsTravelBlocked || 0,
  }};
}

async function main() {
  if (!SEEDS.length) { console.error('SEEDS required'); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  for (const seed of SEEDS) {
    for (const pol of [vetsurviveLead, vetsurviveBelong]) {
      console.log(`transcript seed=${seed} policy=${pol.id} ...`);
      const r = await runOne(pol, seed);
      fs.writeFileSync(path.join(OUT, `transcript-${pol.id}-s${seed}.txt`),
        `seed=${r.seed} policy=${r.policy}\n` +
        `telemetry: ${JSON.stringify(r.ctx)}\n\n` +
        (r.musterBeats.length ? r.musterBeats.join('\n') : '(no muster/hold beats captured)'));
      console.log(`  beats: ${r.musterBeats.filter(l => l === '---').length}, telemetry: ${JSON.stringify(r.ctx)}`);
    }
  }
}

main().catch(e => { console.error('TRANSCRIPT CRASH:', e && e.stack || e); process.exit(2); });
