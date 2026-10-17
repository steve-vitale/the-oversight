#!/usr/bin/env node
// scripts/sweep-prosefix-20261017.js — the sim-prosefix-b sweep
// (lever loop B, 2026-10-17; sim-findings #437/#438/#439).
//
// VOICE-ONLY lever: three food-narration blanks get honest state-driven voice.
//   #437 feast opener (game.js hostFeast/feastEmotionBit): the emotional
//        register varies by grief / table quality / pantry-days / season.
//   #439 spoil mutter (food.js sweepSpoiled/spoilVoiceLine): the full
//        smoke-rack teaching fires on the FIRST voicing per run; repeats
//        condense; known-smoking mutters rotate 3 variants.
//   #438 bowl beat (villager-objectives.js eat pool/eatBeatLine): variant 3
//        names today's co-eater (or an honest quiet) instead of asserting
//        private eating.
// Zero RNG-draw changes, zero mechanic changes (findings #263/#264).
//
// Sides: CONTROL (pre-fix tree, 56340dda) vs ARMED (the lever).
// 8 fresh seeds x {leadfeast, belongfeast} x {control, armed} = 32 runs,
// 180d death-aware, identical seeds across sides (OWN paired control in the
// SAME sweep — control first on the unmodified tree, armed after the lever
// lands). Substrate (asserted up front): FEASTSCALE_R13=1 TRIBFLOOR=1
// SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 explicit.
//
// PRE-REGISTERED (docs/MEASUREMENT.md §§9-12, 14 — binding):
//   PRIMARY GO: fixtures show feast opener varying across >=3 distinct
//     states; spoil mutter first-full then condensed on repeats; bowl beat
//     no longer asserts private eating; AND det-gate byte-identical
//     trajectories armed vs unmodified control; AND an 8-seed paired sweep
//     with wall metrics identical (national/table/wins/wave/median).
//   GUARDRAILS (report-only): wall metrics (national/table/wins, wave-4/5
//     unlocks, median survival, death-cause shares); no crash; per-seed
//     JSONs carry numeric national/table/wins/exiled/sittings keys.
//   Horizon: 180d death-aware (+10d tail). SMOKE=1: 1 seed x 1 policy x 25d.
//
// Outputs: per-seed JSON + hashes to PERSEED_DIR, summary to OUT, feast/spoil
// transcripts to TRANSCRIPT_DIR.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//     SIDES=control OUT=evidence/2026-10-17/prosefix-control.json \
//     PERSEED_DIR=evidence/2026-10-17/perseed-prosefix \
//     TRANSCRIPT_DIR=evidence/2026-10-17/prosefix-beats-control \
//     node scripts/sweep-prosefix-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 explicit required.'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '141,252,363,474,585,696,807,918').split(',').map(Number);
const POLICIES = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(s => s.trim());
const SIDES = (process.env.SIDES || 'control').split(',').map(s => s.trim());
const DAYS = Number(process.env.DAYS || 180);
const SMOKE = process.env.SMOKE === '1';
const OUT = process.env.OUT || null;
const PERSEED_DIR = process.env.PERSEED_DIR || null;
const TRANSCRIPT_DIR = process.env.TRANSCRIPT_DIR || null;

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const FS = require('./policies/feastscale');
const PMAP = { leadfeast: FS.leadfeast, belongfeast: FS.belongfeast };

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Feast-emotion register classification from the voiced line.
function feastRegister(text) {
  if (/Somebody laughs so hard they cry/.test(text)) return 'harvest';
  if (/grief sits at the fire/.test(text)) return 'grieving';
  if (/isn't plenty/.test(text)) return 'thin';
  if (/pantry is lighter/.test(text)) return 'lean';
  if (/hunger feels like a rumor/.test(text)) return 'comfort';
  return 'other';
}
// Spoil-voicing form classification.
function spoilForm(text) {
  if (/Should've smoked that/.test(text)) return 'full-teach';
  if (/smoke rack going cold|kicks the ash pile|long look/.test(text)) return 'mutter';
  return 'condensed';
}

// Mechanics-only per-dawn trajectory hash. Say TEXT is deliberately NOT in
// the hash (voice-only lever); day counters, health, kcal, roster, takes/
// gives, pantry are. (Same extHash as the sim-ambient-b sweep.)
function extHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const vid = s.villagerId || Game.villagerId;
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length,
      Math.round(((v.takes || {})[vid]) || 0), Math.round(((v.gives || {})[vid]) || 0),
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)
    ].join('|');
  } catch (e) { return 'ERR'; }
}

async function oneRun(pid, seed, side) {
  const base = PMAP[pid];
  if (!base) throw new Error('unknown policy ' + pid);
  const policy = Object.assign({}, base);
  const od = base.daily, ou = base.upkeep, os = base.setup;
  const hashes = [];
  const sayBuf = [];
  let sayHookErr = 0, runCtx = null;
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everWon: false, maxWave: 1 };
  policy.setup = (G, ctx) => { runCtx = ctx; return os ? os(G, ctx) : undefined; };
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      hist.maxArc = Math.max(hist.maxArc, pg.arc || 1);
      if (pg.tableWaiting) hist.everTable = true;
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[(G.scaleRank ? G.scaleRank() : 'village') || 'village'] || 0);
      if (G.won) hist.everWon = true;
      try { hist.maxWave = Math.max(hist.maxWave, G.unlockedWave ? G.unlockedWave() : 1); } catch (e) {}
    } catch (e) {}
    try { hashes.push(G.state.scholar.day + ':' + extHash(G)); } catch (e) {}
    return od ? od(G, ctx) : undefined;
  };
  if (ou) policy.upkeep = (G, ctx) => ou(G, ctx);
  let fin = null, result = null;
  await quietLog(async () => {
    const { Game } = await loadGame({ seed, mode: 'prosefix-' + side });
    await setupGame(Game);
    const oSay = Game.say;
    Game.say = function (t) {
      try {
        const s = String(t);
        sayBuf.push({ day: (Game.state.scholar || {}).day || 0, text: s.slice(0, 400) });
        if (sayBuf.length > 20000) sayBuf.splice(0, sayBuf.length - 20000);
      } catch (e) { sayHookErr++; }
      return oSay.apply(this, arguments);
    };
    try {
      result = await runDays(Game, policy, { days: SMOKE ? 25 : DAYS, sampleEvery: 1 });
    } finally {
      Game.say = oSay;
    }
  });
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  // Prose instruments.
  const feastRegs = {}, spoilForms = {};
  const feastSamples = [], spoilSamples = [], shareSamples = [];
  let feastN = 0, spoilN = 0, shareN = 0, bowlAssertN = 0;
  for (const b of sayBuf) {
    const t = b.text;
    if (t.includes('🍖 FEAST')) {
      feastN++;
      const r = feastRegister(t);
      feastRegs[r] = (feastRegs[r] || 0) + 1;
      if (feastSamples.length < 10) feastSamples.push({ day: b.day, reg: r, text: t.slice(0, 280) });
    } else if (/threw out spoiled stores/.test(t)) {
      spoilN++;
      const f = spoilForm(t);
      spoilForms[f] = (spoilForms[f] || 0) + 1;
      if (spoilSamples.length < 10) spoilSamples.push({ day: b.day, form: f, text: t.slice(0, 220) });
    }
    if (/🍲 .+ eats with .+ — bowls side by side/.test(t)) {
      shareN++;
      if (shareSamples.length < 8) shareSamples.push({ day: b.day, text: t.slice(0, 160) });
    }
    if (/Neither one is being shared/.test(t)) bowlAssertN++;
  }
  const rankMax = hist.maxRank;
  const out = {
    policy: pid, seed, side,
    days: result.days, gameDays: result.gameDays || result.days, endReason: result.endReason,
    national: rankMax >= 2 ? 1 : 0, table: hist.everTable ? 1 : 0,
    wins: hist.everWon ? 1 : 0, exiled: 0,
    sittings: (runCtx && runCtx.sdSeatTaken) | 0,
    maxArc: hist.maxArc, maxWave: hist.maxWave, wave45: hist.maxWave >= 4 ? 1 : 0,
    deaths,
    prose: {
      feastN, feastRegs, feastSamples,
      spoilN, spoilForms, spoilSamples,
      shareN, shareSamples, bowlAssertN,
    },
    hashes,
    sayHookErr,
    nSays: sayBuf.length,
  };
  if (result.samples && result.samples.exiled) out.exiled = 1;
  return { out, sayBuf };
}

function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

async function main() {
  const t0 = Date.now();
  if (PERSEED_DIR) fs.mkdirSync(PERSEED_DIR, { recursive: true });
  if (TRANSCRIPT_DIR) fs.mkdirSync(TRANSCRIPT_DIR, { recursive: true });
  const perSeed = [];
  for (const side of SIDES) {
    for (const seed of SEEDS) {
      for (const pid of POLICIES) {
        console.log(`  run ${side} ${pid} s${seed} ...`);
        const { out, sayBuf } = await oneRun(pid, seed, side);
        perSeed.push(out);
        if (PERSEED_DIR) {
          fs.writeFileSync(path.join(PERSEED_DIR, `${side}-${pid}-s${seed}.json`), JSON.stringify(out, null, 1));
          fs.writeFileSync(path.join(PERSEED_DIR, `${side}-${pid}-s${seed}.hashes.json`), JSON.stringify(out.hashes));
        }
        if (TRANSCRIPT_DIR) {
          const feasts = sayBuf.filter(b => b.text.includes('🍖 FEAST')).map(b => `[d${b.day}] ${b.text}`);
          const spoils = sayBuf.filter(b => /threw out spoiled stores/.test(b)).map(b => `[d${b.day}] ${b.text}`);
          const shares = sayBuf.filter(b => /eats with .+ — bowls side by side/.test(b.text)).map(b => `[d${b.day}] ${b.text}`);
          fs.writeFileSync(path.join(TRANSCRIPT_DIR, `${side}-${pid}-s${seed}.feasts.md`),
            `# feasts — ${side} ${pid} s${seed}\n\n${feasts.join('\n\n') || '(none)'}\n`);
          fs.writeFileSync(path.join(TRANSCRIPT_DIR, `${side}-${pid}-s${seed}.spoils.md`),
            `# spoil voicings — ${side} ${pid} s${seed}\n\n${spoils.join('\n\n') || '(none)'}\n`);
          if (shares.length) fs.writeFileSync(path.join(TRANSCRIPT_DIR, `${side}-${pid}-s${seed}.shares.md`),
            `# eat sharing lines — ${side} ${pid} s${seed}\n\n${shares.join('\n\n') || '(none)'}\n`);
        }
      }
    }
  }
  const days = perSeed.map(p => p.gameDays);
  const summary = {
    sides: SIDES, seeds: SEEDS, policies: POLICIES, days: DAYS, smoke: SMOKE,
    runs: perSeed.length,
    wall: {
      national: perSeed.filter(p => p.national).length,
      table: perSeed.filter(p => p.table).length,
      wins: perSeed.filter(p => p.wins).length,
      wave45: perSeed.filter(p => p.wave45).length,
      medianDays: median(days), maxDays: Math.max(...days),
      maxArc: Math.max(...perSeed.map(p => p.maxArc)),
      maxWave: Math.max(...perSeed.map(p => p.maxWave)),
    },
    elapsedMin: ((Date.now() - t0) / 60000).toFixed(1),
  };
  console.log(JSON.stringify(summary, null, 1));
  if (OUT) fs.writeFileSync(OUT, JSON.stringify({ summary, perSeed: perSeed.map(p => Object.assign({}, p, { hashes: p.hashes.length })) }, null, 1));
}

main().catch(e => { console.error('SWEEP ERROR: ' + (e && e.stack || e)); process.exit(1); });
