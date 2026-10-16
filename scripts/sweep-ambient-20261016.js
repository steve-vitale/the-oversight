#!/usr/bin/env node
// scripts/sweep-ambient-20261016.js — the sim-ambient-b sweep
// (lever loop B, 2026-10-16, food-economy axis; sim-findings #394).
//
// VOICE-ONLY lever: 9 single-template ambient villager beats
// (REST/EAT/HAVEN_CHORE fire|repair|cook|sweep in villager-objectives.js,
//  finds + visit beats, and the game.js sick-recovery line) get >=3
// verb-phrase renderings each, selected by a DETERMINISTIC pure function
// of (villager-id, day) via this._hashStr — never R()/Math.random()
// (findings #263/#264: any RNG draw-count change shifts downstream sims
// and fails the det-gate).
//
// Sides: CONTROL (pre-fix tree) vs ARMED (the lever). 8 fresh seeds x
// {leadfeast, belongfeast} x {control, armed} = 32 runs, 180d death-aware,
// identical seeds across sides (OWN paired control in the SAME sweep —
// control first on the unmodified tree, armed after the lever lands).
// Substrate (asserted up front): FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
// RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 explicit.
//
// PRE-REGISTERED (evidence header, docs/MEASUREMENT.md §§9-12, 14 — binding):
//   PRIMARY: >=3 distinct verb-phrase renderings per template observed
//     across the 16-run sense sweep. GO requires BOTH: variety observed
//     AND det-gate 16/16 byte-identical trajectories armed vs control
//     (voice-only must not move mechanics — say TEXT is not in the hash)
//     AND a sense PASS (transcripts read, villagers read as people).
//   GUARDRAILS (report-only): wall metrics (national/table/wins/wave4-5/
//     median survival/death-cause shares); no crash; instrument clean.
//   Horizon: 180d death-aware (+10d tail). Ambient beats fire all run.
//   SMOKE=1: 1 seed x 1 policy x 25d x 1 side.
//   Sense-test: 2+ transcript reads in the evidence file (SENSE-TESTING LAW).
//
// Outputs: per-seed JSON (numeric national/table/wins/exiled/sittings +
// ambient variety + hashes) to PERSEED_DIR, summary to OUT, ambient beat
// transcripts to TRANSCRIPT_DIR.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//     SIDES=control OUT=evidence/2026-10-16/ambient-control.json \
//     PERSEED_DIR=evidence/2026-10-16/perseed-ambient \
//     TRANSCRIPT_DIR=evidence/2026-10-16/ambient-beats-control \
//     node scripts/sweep-ambient-20261016.js
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
const SD = require('./policies/seatdrive');
const PMAP = { leadfeast: SD.leadseat, belongfeast: SD.belongseat };

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Core phrases of the 9 pre-fix templates (control-side classification).
// Armed-side variety is measured from the ambientPick instrument (key, idx),
// which is authoritative; say-text matching is the control fallback.
const TEMPLATE_CORES = {
  rest: ['sleeping by the fire'],
  eat: ['not talking, just eating'],
  chore_fire: ['tending the fire'],
  chore_repair: ['mending something by the door'],
  chore_cook: ['working the cookpot'],
  chore_sweep: ['sweeping the hall'],
  finds: ['going over their finds'],
  visit: ['talking low. Not business'],
  mend: ['is on the mend'],
};

function classifyControl(text) {
  for (const k of Object.keys(TEMPLATE_CORES)) {
    if (TEMPLATE_CORES[k].some(c => text.includes(c))) return k;
  }
  return null;
}

// Mechanics-only per-dawn trajectory hash. Say TEXT is deliberately NOT in
// the hash (voice-only lever); day counters, health, kcal, roster, takes/
// gives, pantry are.
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
  const pickLog = [];
  let sayHookErr = 0, pickHookErr = 0, runCtx = null;
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
    const { Game } = await loadGame({ seed, mode: 'ambient-' + side });
    await setupGame(Game);
    const oSay = Game.say;
    Game.say = function (t) {
      try {
        const s = String(t);
        sayBuf.push({ day: (Game.state.scholar || {}).day || 0, text: s.slice(0, 400) });
        if (sayBuf.length > 15000) sayBuf.splice(0, sayBuf.length - 15000);
      } catch (e) { sayHookErr++; }
      return oSay.apply(this, arguments);
    };
    // ambientPick instrument: log (vid, key, idx) per variant selection.
    // Absent on the control tree (guarded); the wrap returns the same value.
    let oPick = null;
    try {
      if (typeof Game.ambientPick === 'function') {
        oPick = Game.ambientPick;
        const self = Game;
        Game.ambientPick = function (vid, key, n) {
          let idx = 0;
          try { idx = oPick.apply(self, [vid, key, n]); } catch (e) { pickHookErr++; }
          try { pickLog.push({ day: (self.state.scholar || {}).day || 0, vid: String(vid), key, idx, n }); } catch (e) {}
          return idx;
        };
      }
    } catch (e) { pickHookErr++; }
    try {
      result = await runDays(Game, policy, { days: SMOKE ? 25 : DAYS, sampleEvery: 1 });
    } finally {
      Game.say = oSay;
      if (oPick) { try { Game.ambientPick = oPick; } catch (e) {} }
    }
  });
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  // Ambient variety summary.
  const perKey = {};
  for (const k of Object.keys(TEMPLATE_CORES)) perKey[k] = { firings: 0, idxs: {}, texts: {}, samples: [] };
  for (const p of pickLog) {
    const e = perKey[p.key] || (perKey[p.key] = { firings: 0, idxs: {}, texts: {}, samples: [] });
    e.firings++; e.idxs[p.idx] = (e.idxs[p.idx] || 0) + 1;
  }
  for (const b of sayBuf) {
    const k = classifyControl(b.text);
    if (!k) continue;
    const e = perKey[k];
    e.firingsCtl = (e.firingsCtl || 0) + 1;
    e.texts[b.text] = (e.texts[b.text] || 0) + 1;
    if (e.samples.length < 8 && !e.samples.includes(b.text)) e.samples.push(b.text);
  }
  const variety = {};
  for (const k of Object.keys(perKey)) {
    const e = perKey[k];
    variety[k] = {
      pickFirings: e.firings,
      distinctIdx: Object.keys(e.idxs).length,
      idxHist: e.idxs,
      sayFirings: e.firingsCtl || 0,
      distinctTexts: Object.keys(e.texts).length,
      samples: e.samples,
    };
  }
  const rankMax = hist.maxRank;
  const out = {
    policy: pid, seed, side,
    days: result.days, gameDays: result.gameDays || result.days, endReason: result.endReason,
    national: rankMax >= 2 ? 1 : 0, table: hist.everTable ? 1 : 0,
    wins: hist.everWon ? 1 : 0, exiled: 0,
    sittings: (runCtx && runCtx.sdSeatTaken) | 0,
    maxArc: hist.maxArc, maxWave: hist.maxWave, wave45: hist.maxWave >= 4 ? 1 : 0,
    deaths, variety,
    hashes,
    sayHookErr, pickHookErr,
    nPicks: pickLog.length, nSays: sayBuf.length,
  };
  if (result.samples && result.samples.exiled) out.exiled = 1;
  return { out, sayBuf, pickLog };
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
  const transcriptSeeds = {};
  for (const side of SIDES) {
    for (const seed of SEEDS) {
      for (const pid of POLICIES) {
        console.log(`  run ${side} ${pid} s${seed} ...`);
        const { out, sayBuf, pickLog } = await oneRun(pid, seed, side);
        perSeed.push(out);
        if (PERSEED_DIR) {
          const slim = Object.assign({}, out); delete slim.hashes;
          slim.hashesKept = out.hashes.length;
          fs.writeFileSync(path.join(PERSEED_DIR, `${side}-${pid}-s${seed}.json`), JSON.stringify(slim, null, 1));
          fs.writeFileSync(path.join(PERSEED_DIR, `${side}-${pid}-s${seed}.hashes.json`), JSON.stringify(out.hashes));
          fs.writeFileSync(path.join(PERSEED_DIR, `${side}-${pid}-s${seed}.picks.json`), JSON.stringify(pickLog));
        }
        // Keep ambient beats + context for sense transcripts (2 seeds/side).
        const key = side;
        transcriptSeeds[key] = transcriptSeeds[key] || [];
        if (transcriptSeeds[key].length < 2) {
          const beats = [];
          for (let i = 0; i < sayBuf.length; i++) {
            if (classifyControl(sayBuf[i].text)) {
              for (let j = Math.max(0, i - 3); j <= Math.min(sayBuf.length - 1, i + 3); j++) {
                beats.push({ day: sayBuf[j].day, text: sayBuf[j].text, mark: j === i });
              }
              beats.push({ day: -1, text: '---', mark: false });
              if (beats.length > 400) break;
            }
          }
          transcriptSeeds[key].push({ seed, pid, beats });
        }
      }
    }
  }
  if (TRANSCRIPT_DIR) {
    for (const side of Object.keys(transcriptSeeds)) {
      for (const t of transcriptSeeds[side]) {
        const lines = [`# ambient beats — ${side} ${t.pid} seed ${t.seed}`, ''];
        for (const b of t.beats) {
          if (b.day === -1) { lines.push(''); continue; }
          lines.push(`${b.mark ? '>>>' : '   '} d${b.day} ${b.text}`);
        }
        fs.writeFileSync(path.join(TRANSCRIPT_DIR, `${side}-${t.pid}-s${t.seed}.md`), lines.join('\n'));
      }
    }
  }
  // Summary: wall metrics + variety aggregate per side.
  // (No wall-clock timing: the harness freezes Date.now, so elapsed ms is
  // meaningless here.)
  const summary = { sides: {} };
  for (const side of SIDES) {
    const rows = perSeed.filter(r => r.side === side);
    const aggVar = {};
    for (const k of Object.keys(TEMPLATE_CORES)) {
      let firings = 0;
      for (const r of rows) firings += (r.variety[k].pickFirings || r.variety[k].sayFirings || 0);
      aggVar[k] = { firings };
    }
    // Sweep-level distinctness (distinct idx/texts across all 16 runs) is
    // computed by scripts/analyze-ambient-20261016.js from the per-seed
    // .picks.json files — per-seed distinct counts understate rotation.
    summary.sides[side] = {
      n: rows.length,
      national: rows.reduce((a, r) => a + r.national, 0),
      table: rows.reduce((a, r) => a + r.table, 0),
      wins: rows.reduce((a, r) => a + r.wins, 0),
      exiled: rows.reduce((a, r) => a + r.exiled, 0),
      sittings: rows.reduce((a, r) => a + r.sittings, 0),
      wave45: rows.reduce((a, r) => a + r.wave45, 0),
      medianDays: median(rows.map(r => r.gameDays || 0)),
      maxDays: Math.max.apply(null, rows.map(r => r.gameDays || 0)),
      deaths: rows.reduce((acc, r) => {
        for (const k of Object.keys(r.deaths || {})) acc[k] = (acc[k] || 0) + r.deaths[k];
        return acc;
      }, {}),
      variety: aggVar,
      sayHookErr: rows.reduce((a, r) => a + (r.sayHookErr || 0), 0),
      pickHookErr: rows.reduce((a, r) => a + (r.pickHookErr || 0), 0),
    };
  }
  if (OUT) fs.writeFileSync(OUT, JSON.stringify({ seeds: SEEDS, policies: POLICIES, sides: SIDES, summary, perSeed }, null, 1));
  console.log(JSON.stringify(summary, null, 1));
  console.log('\ndone.');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
