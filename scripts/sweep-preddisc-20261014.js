#!/usr/bin/env node
// scripts/sweep-preddisc-20261014.js — predation-discriminator adjudication
// driver (sim-findings #163, flesh-out 2026-10-14).
//
// Runs the named seeds under baseline policies with the preddisc instrument
// attached (scripts/preddisc-20261014.js, which reuses
// scripts/predation-lib-20261014.js for gorge/lingerer telemetry), then
// classifies each run's pantry-collapse window as RAID-PREDATION /
// INCOME-SHORTFALL / MIXED. Classification is adjudicated by hand-verified
// transcript/trajectory attribution (evidence/2026-10-14/sim-preddisc.md).
//
// NAMED CASES (pre-registered): seed 44 x leadfeast + belongseek (predation
// per the r27/r28 attributions), seed 22 x leadfeast + belongseek (income /
// attrition, not predation per r27/r28). Additional hand-verified seeds:
// 55, 88 x leadfeast.
//
// INSTRUMENT ONLY — no game-code changes, no policy changes. Policies run
// gate-off identical to their baseline form.
//
// Usage:
//   SEEDS=44,22 POLICIES=leadfeast,belongseek DAYS=180 \
//     OUT=evidence/2026-10-14/preddisc-sweep.json \
//     node scripts/sweep-preddisc-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachPreddisc, finalizePreddisc, classifyRun } = require('./preddisc-20261014');

const POLICY_REGISTRY = { leadfeast, belongfeast };
const POLICY_ALIAS = { belongseek: 'belongfeast' };

function scholarDay(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function unlockedWave(Game) { try { return (Game.unlockedWave ? Game.unlockedWave() : 1) | 0; } catch (e) { return 1; } }

// bounded transcript capture around the collapse window for hand verification
const SAY_RE = /gorges at the treeline|starving|spiral|worked out|pantry|raid|linger|drive it off|call for help/i;

async function main() {
  const label = process.env.LEVER || 'preddisc';
  const seeds = (process.env.SEEDS || '44,22').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'leadfeast').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const rows = [];
  for (const pidRaw of policyIds) {
    const pid = POLICY_ALIAS[pidRaw] || pidRaw;
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pidRaw);
    process.env.FEASTSCALE_R13 = '1';
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'preddisc-' + pid });
      await setupGame(Game);
      const track = attachPreddisc(Game);
      const sayCap = { lines: [] };
      const chainedSay = Game.say.bind(Game);
      Game.say = function (msg) {
        try {
          const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
          // RING BUFFER: early-game chatter saturates a straight cap before
          // the collapse window opens (spiralverb r29 review). Keep the
          // LATEST 400 collapse-relevant lines — the window is what the
          // hand-verification reads.
          if (SAY_RE.test(text)) {
            if (sayCap.lines.length >= 400) sayCap.lines.shift();
            sayCap.lines.push({ day: scholarDay(Game),
              text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 220) });
          }
        } catch (e) {}
        return chainedSay(msg);
      };
      const run = { unlockDay5: null };
      const origDaily = base.daily;
      const policy = Object.assign({}, base);
      policy.daily = (G, ctx) => {
        try { track.sampleDay(); } catch (e) {}
        try {
          if (run.unlockDay5 == null && unlockedWave(G) >= 5) run.unlockDay5 = scholarDay(G);
        } catch (e) {}
        if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days });
      const T = finalizePreddisc(Game, track);
      const verdict = classifyRun(T);
      const w = verdict.window;
      const windowSay = (w && sayCap.lines.length)
        ? sayCap.lines.filter(l => l.day >= w.startDay - 10 && l.day <= w.endDay + 3).slice(0, 60)
        : sayCap.lines.filter(l => /gorges at the treeline|starving/i.test(l.text)).slice(0, 20);
      const deaths = (result.samples && result.samples.deaths) || [];
      const causeTallies = {};
      for (const d of deaths) {
        const k = (d.kind || 'unknown') + '/' + (d.player ? 'player' : 'villager');
        causeTallies[k] = (causeTallies[k] || 0) + 1;
      }
      const row = {
        label, policy: pidRaw, seed, days: result.days, endReason: result.endReason,
        unlockDay5: run.unlockDay5,
        verdict: {
          class: verdict.class, confidence: verdict.confidence,
          window: verdict.window, attrWindow: verdict.attrWindow,
          features: verdict.features, markers: verdict.markers,
          verbFor: verdict.verbFor,
        },
        deathCauses: causeTallies,
        scholarDeathDays: T.scholarDeaths,
        gorgeNights: T.gorge.length,
        gorgeKcalTotal: T.gorge.reduce((t, g) => t + (g.totalGorged || 0), 0),
        episodes: (T.episodes || []).map(e => ({
          id: e.id, wave: e.wave, days: e.firstDay + '-' + e.lastDay,
          gorgeNights: e.gorgeNights, gorgeKcal: Math.round(e.gorgeKcal),
          resolution: e.resolution, killer: e.killer || null,
        })),
        pantryTrajectory: T.pantry.filter(p => !w || (p.day >= w.startDay - 14 && p.day <= w.endDay + 3))
          .map(p => ({ day: p.day, kcal: p.kcal, fd: p.freshDays })),
        forageWindow: T.forage.filter(f => !w || (f.day >= w.startDay - 14 && f.day <= w.endDay + 3)),
        workedOut: T.workedOut,
        windowSay,
        instrErrors: T.instrErrors,
      };
      rows.push(row);
      const f = verdict.features;
      console.log(`  [${pidRaw} s${seed}] d=${row.days} ${row.endReason} u5=${run.unlockDay5 != null ? run.unlockDay5 : '-'} ` +
        `class=${verdict.class}(${verdict.confidence}) win=${w ? w.startDay + '-' + w.endDay : 'none'} ` +
        `raidExpl=${f.raidExplains} gorgeN=${f.gorgeNights} gorgeK=${f.gorgeKcal} drain=${f.drain} ` +
        `lingerN=${f.lingerNights} incRatio=${f.incomeRatio} fdDrop=${f.freshDaysDrop}`);
    }
  }
  delete process.env.FEASTSCALE_R13;
  const out = process.env.OUT;
  const rep = { label, seeds, policies: policyIds, days, rows };
  if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  else console.log(JSON.stringify(rows.map(r => ({ seed: r.seed, policy: r.policy, class: r.verdict.class })), null, 1));
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}
