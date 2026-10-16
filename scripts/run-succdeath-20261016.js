#!/usr/bin/env node
// scripts/run-succdeath-20261016.js — the sim-succdeath-b sweep driver
// (loop B, 2026-10-16, food-economy axis; classifies sim-findings #390:
// of 119 successions in the sim-rearmlat-b census, 17 bearers died or
// left office within 2 days of taking the mantle — before the bowls
// could re-arm the trust bar.)
//
// 16 fresh-seed runs: seeds [307,418,529,640,751,862,973,84] x
// {leadfeast, belongfeast} on the standard courtship substrate
// (FEASTSCALE_R13+TRIBFLOOR+SUCCGRACE+RAIDDENSITY+WINPURSUIT+WINDEFER,
// SEATDRIVE=0 explicit — the pre-seat spelling per sim-findings #389),
// 180d death-aware, SUCCDEATH=1 instrument. Zero src/js changes, zero
// policy behavior changes.
//
// Per run: loadGame + setupGame, installSuccDeath, wrap policy.daily to
// call track.dawn(Game) first (and track reachability maxima), attach
// succession/death beat capture (sense-test material), runDays, final
// track.dawn (the last night), finalize, uninstall. Writes per-seed JSONs
// (full wall-metric key set) to evidence/2026-10-16/perseed-succdeath/
// and prints the fast-death census table.
//
// Pre-registration (binding, MEASUREMENT §§9-12,14):
//   PRIMARY GO: >= 95% of fast successions (bearer death/office-exit
//   within <=2 days of the mantle) attributed with a cause class and
//   ledger state at death.
//   Horizon: 180d death-aware (dead villages stop simulating, +10d tail).
//   Seeds: 16 fresh runs — 8 fresh seeds x {leadfeast, belongfeast}.
//   Policies: the standard courtship substrate (FEASTSCALE_R13=1,
//   TRIBFLOOR=1, SUCCGRACE=1, RAIDDENSITY=1, WINPURSUIT=1, WINDEFER=1,
//   SEATDRIVE=0 explicit).
//   Reported (not scored): median days-in-mantle; fast-death cause shares
//   (combat vs hunger vs other + the full 8-class table); share of fast
//   deaths whose trust bar re-armed before death; sense-read of 1-2
//   succession sequences in transcript context.
//
// Node harness: sim-harness (Math.random seeded BEFORE eval; Game.save
// never stubbed). Never run concurrent jest.
'use strict';
const fs = require('fs');
const path = require('path');

const SEEDS = [307, 418, 529, 640, 751, 862, 973, 84];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-succdeath');
const BEATDIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'succdeath-beats');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') {
    console.error(`SWEEP STOP: ${k}=1 is required (substrate).`);
    process.exit(2);
  }
}
process.env.WINPURSUIT = '1';
process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0';   // explicit pre-seat substrate (c004b9dd default-ON; #389)
process.env.SUCCDEATH = '1';

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installSuccDeath } = require('./succdeath-20261016');
const SD = require('./policies/seatdrive');
const POLICIES = { leadfeast: SD.leadseat, belongfeast: SD.belongseat };

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function snap(Game) {
  const o = { rank: 'village', arc: 1, tableWaiting: false, tableEntered: false, won: false, exiled: false, wave: 1 };
  try { o.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; o.arc = pg.arc || 1; o.tableWaiting = !!pg.tableWaiting; o.tableEntered = !!pg.tableDone; } catch (e) {}
  try { o.won = !!Game.won; } catch (e) {}
  try { o.exiled = !!(Game.justiceExiled && Game.justiceExiled()); } catch (e) {}
  return o;
}

// Beat capture (sweep-level, winwall pattern): succession/death-focused
// beats for the sense-test read. Ring buffer, capped.
const BEAT_RE = /died|dead|mantle|bearer|journal|funeral|grave|burial|mourn|the wild|starv|combat|wound|arena|expedition|trembles|lockjaw|phoenix/i;
function attachBeats(Game, t) {
  t.beats = [];
  const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '')
        .replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 280);
      if (BEAT_RE.test(s)) {
        const vid = (() => { try { return String((Game.state.scholar || {}).villagerId || ''); } catch (e) { return ''; } })();
        t.beats.push({ day: gday(), vid: vid.slice(0, 24), text: s });
        if (t.beats.length > 6000) t.beats.splice(0, 500);
      }
    } catch (e) {}
  };
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  Game.say = function (msg) { push(msg); return origSay ? origSay(msg) : msg; };
  if (origSys) Game.sysSay = function (msg) { push(msg); return origSys(msg); };
}

async function oneRun(pid, seed) {
  const t = { beats: [] };
  const { Game, manifest } = await loadGame({ seed, mode: 'sd-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const track = installSuccDeath(Game);
  if (!track.on) throw new Error('instrument did not arm (SUCCDEATH=1)');
  attachBeats(Game, t);
  const base = POLICIES[pid];
  const policy = Object.assign({}, base);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false, maxWave: 1, everExiled: false };
  const od = base.daily;
  policy.daily = (G, ctx) => {
    track.dawn(G);
    try {
      const s = snap(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      if (s.tableEntered) hist.everEntered = true;
      if (s.exiled) hist.everExiled = true;
    } catch (e) {}
    if (od) { try { return od(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: DAYS, manifest, sampleEvery: 10 });
  try { track.dawn(Game); } catch (e) {} // row the final night
  const fin = track.finalize();
  track.uninstall();
  const end = snap(Game);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  try { hist.maxWave = result.maxWaveUnlocked || 1; } catch (e) {}
  const rankMax = Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0);
  const fast = (fin.successions || []).filter(e => e.fast);
  return {
    policy: pid, seed, days: result.days, endReason: result.endReason,
    // full wall-metric key set (schema-drift guard)
    national: rankMax >= 2 ? 1 : 0,
    table: hist.everTable || end.tableWaiting ? 1 : 0,
    wins: end.won ? 1 : 0,
    exiled: hist.everExiled || end.exiled ? 1 : 0,
    entered: hist.everEntered || end.tableEntered ? 1 : 0,
    maxArc: hist.maxArc, maxWave: hist.maxWave,
    deaths,
    succdeath: fin,
    beats: t.beats,
    _fast: fast.map(e => ({
      vid: e.vid, name: e.name, initial: e.initial, mantleDay: e.mantleDay,
      exitDay: e.exitDay, exitType: e.exitType, cause: e.cause,
      causeClass: e.causeClass, attributed: e.attributed,
      reArmedBeforeDeath: e.reArmedBeforeDeath, stateSource: e.stateSource,
      cumNet: e.state && e.state.cumNet, voluntaryNet: e.state && e.state.voluntaryNet,
      voluntaryNet7: e.state && e.state.voluntaryNet7, mealShare: e.state && e.state.mealShare,
    })),
  };
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.mkdirSync(BEATDIR, { recursive: true });
  const runs = [];
  const t0 = process.hrtime.bigint();
  for (const pid of Object.keys(POLICIES)) {
    for (const seed of SEEDS) {
      console.log(`-- ${pid} s${seed}`);
      const r = await quietLog(async () => oneRun(pid, seed));
      const beats = r.beats; delete r.beats;
      fs.writeFileSync(path.join(OUTDIR, `${pid}-s${seed}.json`), JSON.stringify(r, null, 1));
      fs.writeFileSync(path.join(BEATDIR, `${pid}-s${seed}.json`), JSON.stringify(beats, null, 1));
      runs.push(r);
    }
  }
  const dt = Number(process.hrtime.bigint() - t0) / 1e9;
  console.log(`\nsweep wall: ${dt.toFixed(0)}s for ${runs.length} runs`);

  // fast-death census table
  console.log('\npolicy/seed | days | nSucc | nFast | nAttr | classes (fast) | reArmed');
  for (const r of runs) {
    const a = (r.succdeath || {}).aggregate || {};
    const cls = Object.entries(a.causeClasses || {}).map(([k, v]) => `${k}:${v}`).join(',');
    console.log(`${r.policy}/${r.seed} | ${r.days} | ${a.nSuccessions} | ${a.nFast} | ` +
      `${a.nFastAttributed} | ${cls || '-'} | ${a.fastReArmedBeforeDeath}`);
  }

  // pooled summary
  const succ = [], fast = [];
  let attr = 0, reArmed = 0, officeExits = 0, errs = 0;
  const cls = {};
  for (const r of runs) {
    for (const e of ((r.succdeath || {}).successions || [])) succ.push(e);
    for (const e of ((r.succdeath || {}).successions || []).filter(x => x.fast)) {
      fast.push(e); if (e.attributed) attr++;
      if (e.reArmedBeforeDeath === true) reArmed++;
      const k = e.causeClass || 'unattributed';
      cls[k] = (cls[k] || 0) + 1;
    }
    officeExits += ((r.succdeath || {}).aggregate || {}).officeExits || 0;
    errs += (((r.succdeath || {}).errors) || []).length;
  }
  const dioms = succ.filter(e => e.exitDay != null).map(e => e.daysInOffice).sort((a, b) => a - b);
  const inCombat = (c) => c === 'combat' || c === 'villager-combat' || c === 'monster';
  const summary = {
    nRuns: runs.length,
    seeds: SEEDS,
    primary: {
      nFast: fast.length, nFastAttributed: attr,
      rate: fast.length ? attr / fast.length : null,
      go: fast.length > 0 && attr / fast.length >= 0.95,
    },
    causeClasses: cls,
    fastShares: fast.length ? {
      combat: fast.filter(e => inCombat(e.causeClass)).length / fast.length,
      hunger: fast.filter(e => e.causeClass === 'starvation').length / fast.length,
      other: fast.filter(e => !inCombat(e.causeClass) && e.causeClass !== 'starvation').length / fast.length,
    } : null,
    fastReArmedBeforeDeath: reArmed,
    fastReArmedShare: fast.length ? reArmed / fast.length : null,
    daysInMantle: {
      median: dioms.length ? dioms[Math.floor(dioms.length / 2)] : null,
      min: dioms.length ? dioms[0] : null, max: dioms.length ? dioms[dioms.length - 1] : null,
      n: dioms.length,
    },
    officeExits, instrumentErrors: errs,
    wall: {
      national: runs.reduce((s, r) => s + r.national, 0),
      table: runs.reduce((s, r) => s + r.table, 0),
      wins: runs.reduce((s, r) => s + r.wins, 0),
      exiled: runs.reduce((s, r) => s + r.exiled, 0),
      wave4: runs.filter(r => r.maxWave >= 4).length,
      wave5: runs.filter(r => r.maxWave >= 5).length,
      medianSurvival: (() => { const d = runs.map(r => r.days).sort((a, b) => a - b); return d[Math.floor(d.length / 2)]; })(),
      maxSurvival: Math.max(...runs.map(r => r.days)),
    },
  };
  fs.writeFileSync(path.join(OUTDIR, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log('\nPOOLED: ' + JSON.stringify(summary, null, 1));
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
