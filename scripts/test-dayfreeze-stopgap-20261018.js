#!/usr/bin/env node
// test-dayfreeze-stopgap-20261018.js — PROOF for the driveFights dayfreeze
// stopgap (arm b, sim-dayfreeze-green).
//
// Replays the winseat corpus (seeds 59101-59108 x {leadfeast, belongfeast},
// 180 loop-days, death-aware) TWICE on identical seeds: control
// (DF_STOPGAP=0, old 'not-player-turn' break) and armed (stopgap drives
// stranded AI turns via sync tbAdvance). Compares freeze incidence,
// stopgap engagement, and guardrails.
//
// Pre-registered (evidence header):
//   PRIMARY (binding): freezes on the reproduction corpus.
//     control bar: 2/16 (matches the dayfreeze diagnostic RED).
//     GO (armed): 0 freezes.
//   ENGAGEMENT (binding): the stranded fights complete — armed stopgap
//     recoveries > 0 on the corpus.
//   GUARDRAILS (binding): no new death cause armed vs control; median
//     survival (gameDays) armed >= control minus noise.
//   §14: a miss is NO-GO, never re-scored.
//
// Writes evidence/2026-10-18/dayfreeze-stopgap-20261018.json (per-run rows
// for both arms). Exits 0 on GO, 1 on NO-GO.
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./winloss-sweep-20261018');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['SEATDRIVE', 'VETREL', 'REPOSITION', 'NODEWITNESS', 'FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required (winseat).`); process.exit(2); }
process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';

const SEEDS = [59101, 59102, 59103, 59104, 59105, 59106, 59107, 59108];
const POLICIES = ['belongfeast', 'leadfeast'];
const DAYS = 180;
const OUT = path.join(__dirname, '..', 'evidence', '2026-10-18', 'dayfreeze-stopgap-20261018.json');

async function oneRun(seed, policyId, armed) {
  process.env.DF_STOPGAP = armed ? '1' : '0';
  const base = SW.policyFor(policyId);
  const policy = Object.assign({}, base, { id: base.id + (armed ? '-dfarmed' : '-dfcontrol'), desc: base.desc + (armed ? ' [DF-ARMED]' : ' [DF-CONTROL]') });
  const { Game } = await loadGame({ seed, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const gameDays = result.gameDays | 0;
  const frozen = !Game.over && !Game.won && gameDays < DAYS;
  const deaths = (result.samples && result.samples.deaths) || [];
  const causes = {};
  for (const d of deaths) { const c = String((d && d.cause) || 'unknown'); causes[c] = (causes[c] || 0) + 1; }
  return {
    seed, policyId, armed, frozen, gameDays,
    over: !!Game.over, won: !!Game.won, villageLost: !!Game.villageLost,
    stopgap: Game.__dfStopgap || { fires: 0, recovered: 0, stuck: 0, threw: 0 },
    nDeaths: deaths.length, causes,
  };
}

function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}

(async () => {
  const rows = [];
  for (const armed of [false, true]) {
    for (const pid of POLICIES) {
      for (const seed of SEEDS) {
        const r = await oneRun(seed, pid, armed);
        rows.push(r);
        const sg = r.stopgap;
        console.log(`${armed ? 'ARMED  ' : 'CONTROL'} ${r.policyId} s${r.seed}: frozen=${r.frozen} gameDays=${r.gameDays} over=${r.over} won=${r.won} sg=${sg.fires}/${sg.recovered}/${sg.stuck}/${sg.threw} deaths=${r.nDeaths}`);
      }
    }
  }
  const control = rows.filter(r => !r.armed), armed = rows.filter(r => r.armed);
  const cFrozen = control.filter(r => r.frozen), aFrozen = armed.filter(r => r.frozen);
  const aRec = armed.reduce((n, r) => n + r.stopgap.recovered, 0);
  const aStuck = armed.reduce((n, r) => n + r.stopgap.stuck, 0);
  const aThrew = armed.reduce((n, r) => n + r.stopgap.threw, 0);
  const cMed = median(control.map(r => r.gameDays)), aMed = median(armed.map(r => r.gameDays));
  const cCauses = new Set(), aCauses = new Set();
  for (const r of control) for (const c of Object.keys(r.causes)) cCauses.add(c);
  for (const r of armed) for (const c of Object.keys(r.causes)) aCauses.add(c);
  const newCauses = [...aCauses].filter(c => !cCauses.has(c));
  const verdict = {
    primary: { controlFreezes: cFrozen.length, armedFreezes: aFrozen.length, go: aFrozen.length === 0 },
    engagement: { armedRecoveries: aRec, armedStuck: aStuck, armedThrew: aThrew, go: aRec > 0 },
    guardrails: { medianGameDaysControl: cMed, medianGameDaysArmed: aMed, newDeathCauses: newCauses, go: newCauses.length === 0 && aMed >= cMed - 5 },
  };
  verdict.overall = verdict.primary.go && verdict.engagement.go && verdict.guardrails.go ? 'GO' : 'NO-GO';
  fs.writeFileSync(OUT, JSON.stringify({ ts: new Date().toISOString(), verdict, rows }, null, 1));
  console.log('\nwrote', OUT);
  console.log(`PRIMARY: control ${cFrozen.length}/16 freezes (${cFrozen.map(r => r.policyId + ' s' + r.seed).join(', ')}) vs armed ${aFrozen.length}/16 -> ${verdict.primary.go ? 'GO' : 'NO-GO'}`);
  console.log(`ENGAGEMENT: armed recoveries=${aRec} stuck=${aStuck} threw=${aThrew} -> ${verdict.engagement.go ? 'GO' : 'NO-GO'}`);
  console.log(`GUARDRAILS: median gameDays control=${cMed} armed=${aMed}; new death causes: ${newCauses.length ? newCauses.join(', ') : 'none'} -> ${verdict.guardrails.go ? 'GO' : 'NO-GO'}`);
  console.log(`VERDICT: ${verdict.overall}`);
  process.exit(verdict.overall === 'GO' ? 0 : 1);
})().catch(e => { console.error('STOPGAP-TEST CRASH:', e); process.exit(2); });
