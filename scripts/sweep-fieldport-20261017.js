#!/usr/bin/env node
// scripts/sweep-fieldport-20261017.js — sim-fieldport sweep (axis scale-onramp):
// HONEST audit/editor field ports vs RECONSTRUCTED-INVERTED control.
//
// Compares, on identical seeds/policies/env:
//   ARM=honest   — REPO = this worktree (honest ports landed in a3f9e124)
//   ARM=inverted — REPO = ~/workspace/sim-fieldport-control (plain clone at
//                  the same commit, ONLY the sigW4 audit + sigW5 editor
//                  branches swapped to their pre-484fdaaa inverted forms;
//                  fieldFights.js untouched — the honest consumption blocks
//                  are dead code there since the flags are never set)
//
// Substrate (the brief's pre-registration): vetrel trick-game arming —
//   VETREL=1 (scripts/policies/vetrel.js, COMPOSED not modified),
//   SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1.
// Policies: vetrel-lead / vetrel-belong. 8 FRESH seeds 3901-3908 x 2
// policies = 16 runs per arm; run twice (REPO=control, REPO=worktree)
// for the 32-run paired comparison.
//
// Port-event capture: Game.fieldFight is wrapped — every audit/editor
// field fight's full rec.log is captured, plus the say-stream lines spoken
// during the fight. Attribution is classified from observed artifacts:
//   audit:  port fired ⟺ say has "🧾 Audit day".
//           honest-taxed ⟺ rec.log has "(audited — half strength)";
//           honest-defeated ⟺ say has "nothing to tax" (inefficient trick);
//           inverted ⟺ neither (the tax never lands on the villager).
//   editor: port fired ⟺ rec.log has "scissors poise" (honest) or the port
//           CUT line (inverted).
//           honest-cut ⟺ "scissors poise" + a "strikes for 0" beat;
//           honest-defeated ⟺ "scissors poise" + "continuity error", no void;
//           inverted ⟺ CUT line present, no "scissors poise", no voided swing.
//
// Usage:
//   REPO=~/workspace/sim-fieldport-control ARM=inverted node scripts/sweep-fieldport-20261017.js
//   ARM=honest node scripts/sweep-fieldport-20261017.js
// (defaults: REPO=this tree, ARM=honest)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { vetrelLead, vetrelBelong } = require(path.join(REPO, 'scripts', 'policies', 'vetrel'));

const ARM = process.env.ARM || 'honest';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [3901, 3902, 3903, 3904, 3905, 3906, 3907, 3908]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-17', 'perseed-fieldport');
const BEATS = process.env.BEATS || path.join(REPO, 'evidence', '2026-10-17', 'fieldport-beats');

const PORT_BEAT = /Audit day|scissors poise|cutting-room floor|nothing to tax|continuity error|audited — half strength|UNDER REVIEW/i;

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function policyFor(id) { return id === 'vetrel-lead' ? vetrelLead : vetrelBelong; }

function classifyFight(ev) {
  // ev: { mid, log (rec.log joined), say (fight-window say lines joined) }
  const log = ev.log, say = ev.say;
  if (ev.mid === 'audit') {
    if (!/Audit day/.test(say)) return 'no-port';
    if (/audited — half strength/.test(log)) return 'honest-taxed';
    if (/nothing to tax/.test(say)) return 'honest-defeated';
    return 'inverted';
  }
  if (ev.mid === 'editor') {
    const poise = /scissors poise/.test(log);
    const cut = /cutting-room floor/.test(log);
    const voided = /strikes for 0(\D|$)/.test(log);
    if (!poise && !cut) return 'no-port';
    if (poise && voided) return 'honest-cut';
    if (poise && /continuity error/.test(log)) return 'honest-defeated';
    if (!poise && cut) return 'inverted';
    return 'unknown';
  }
  return 'no-port';
}

async function oneRun(seed, policyId) {
  process.env.VETREL = '1';
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'fieldport-' + ARM, fullTelemetry: false });
  await setupGame(Game);

  const deaths = [];
  const portFights = [];
  let sayWindow = null; // { mid, lines: [] } while inside a captured fieldFight
  const _t = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    try { if (type === 'death') deaths.push({ day: gday(Game), kind: data && data.kind, who: data && data.who, cause: data && data.cause, player: !!(data && data.player) }); } catch (e) {}
    return _t(type, data);
  };
  const _s = Game.say.bind(Game);
  Game.say = function (t) {
    try { if (sayWindow && PORT_BEAT.test(String(t))) sayWindow.lines.push(String(t).slice(0, 280)); } catch (e) {}
    return _s(t);
  };
  const _ff = Game.fieldFight.bind(Game);
  Game.fieldFight = function (vid, mdef, m, opts) {
    const mid = mdef && mdef.id;
    const capture = (mid === 'audit' || mid === 'editor');
    if (capture) sayWindow = { mid, lines: [] };
    let rec;
    try { rec = _ff(vid, mdef, m, opts); }
    finally { if (capture) { /* sayWindow kept for classification below */ } }
    if (capture && rec) {
      try {
        const log = (rec.log || []).join('\n');
        const say = (sayWindow ? sayWindow.lines : []).join('\n');
        const ev = { seed, policyId, arm: ARM, mid, day: gday(Game), rounds: rec.rounds | 0, outcome: rec.outcome || null, log, say };
        ev.verdict = classifyFight(ev);
        portFights.push(ev);
      } catch (e) {}
      sayWindow = null;
    } else { sayWindow = null; }
    return rec;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  Game.tele = _t; Game.say = _s; Game.fieldFight = _ff;

  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const won = !!Game.won ? 1 : 0;
  const maxWave = result.maxWaveUnlocked || 1;
  let exiled = 0;
  try { exiled = (Game.state.scholar && Game.state.scholar.exiled) ? 1 : 0; } catch (e) {}

  const out = {
    seed, policyId, arm: ARM, repo: REPO,
    substrate: 'vetrel arming (VETREL=1), SEATDRIVE=0 explicit, FEASTSCALE_R13=1, pre-seat',
    days: result.days, endReason: result.endReason,
    national, table, won, wins: won, exiled,
    maxWave, wave4Reached: maxWave >= 4 ? 1 : 0, wave5Reached: maxWave >= 5 ? 1 : 0,
    deaths: deaths.length,
    deathCauses: deaths.reduce((o, d) => { const c = String(d.cause || '?').slice(0, 60); o[c] = (o[c] || 0) + 1; return o; }, {}),
    portFights: portFights.length,
    portVerdicts: portFights.reduce((o, f) => { o[f.verdict] = (o[f.verdict] || 0) + 1; return o; }, {}),
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `fieldport-${policyId}-s${seed}-${ARM}.json`), JSON.stringify(out, null, 1));
  if (portFights.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `fieldport-${policyId}-s${seed}-${ARM}.json`),
      JSON.stringify(portFights.map(f => ({ seed: f.seed, policyId: f.policyId, arm: f.arm, mid: f.mid, day: f.day, rounds: f.rounds, outcome: f.outcome, verdict: f.verdict, say: f.say, log: f.log })), null, 1));
  }
  const pv = out.portVerdicts;
  console.log(`  [${ARM} ${policyId} s${seed}] days=${result.days} end=${result.endReason} maxWave=${maxWave} nat=${national} won=${won} deaths=${deaths.length} portFights=${portFights.length} ` +
    `verdicts=${Object.keys(pv).map(k => k + ':' + pv[k]).join(',') || 'none'}`);
  return out;
}

(async () => {
  for (const policyId of ['vetrel-lead', 'vetrel-belong']) {
    for (const seed of SEEDS) {
      await oneRun(seed, policyId);
    }
  }
  console.log('done.');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(1); });
