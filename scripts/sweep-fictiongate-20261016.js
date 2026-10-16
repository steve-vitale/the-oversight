#!/usr/bin/env node
// scripts/sweep-fictiongate-20261016.js — the sim-fictiongate-b sweep
// (loop B, 2026-10-16, food-economy axis; sim-findings #385/#391).
//
// VOICE-ONLY lever: at the justice stage 0->1 cold-shoulder transition,
// the journal line is gated on the dated-voluntary ledger agreeing
// (trailing-7d voluntary net < 0). Clean-ledger (meal-driven) armings fire
// a distinct meal-aware line; honest armings keep "I know why". Stage,
// heat, timing, say line: untouched.
//
// Sides: CONTROL (pre-fix justice.js) vs ARMED (the gate). 8 fresh seeds x
// {leadfeast, belongfeast} x {control, armed} = 32 runs, 180d death-aware,
// identical seeds across sides (OWN control in the SAME sweep design — run
// control first on the unmodified tree, then armed after the lever lands).
// Substrate (asserted up front): FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
// RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 explicit.
//
// PRE-REGISTERED (evidence header, docs/MEASUREMENT.md §§9-12, 14 — binding):
//   PRIMARY: 0 firings of the honest "I know why" line on a clean dated
//     ledger across the sweep. GO: 100% gated — every clean-ledger journal
//     firing voices the meal-aware line; every honest-ledger journal firing
//     voices the honest line. (The journalNote dedup voices the journal line
//     once per run — the first 0->1 transition; the say line voices every
//     transition. The instrument records journalNote CALLS even when the
//     dedup suppresses them, so scoring uses only VOICED lines — those with
//     a "📓 Journal/Codex:" say-echo.)
//   GUARDRAILS (binding): (G1) per-dawn extended trajectory hash
//     byte-identical armed vs control on all 16 pairs (voice-only must not
//     move mechanics — the journal text is NOT in the hash); (G2)
//     stage-transition sequences identical; (G3) no crash, instrument
//     recon clean, zero instrument errors.
//   INFORMATIONAL (report-only): half-ration rate per day-alive (#384 — a
//     voice lever should not change it); wall metrics (national/table/
//     wins/wave4-5/median survival/death causes).
//   Horizon: 180d death-aware (+10d tail). The cold shoulder arms in the
//     first fortnight and re-arms across successions — 180d covers the
//     two-faces-in-one-run shape (#391).
//   Det-gate: scripts/test-fictiongate-20261016.js PART B green first.
//   SMOKE=1: 1 seed x 1 policy x 1 side x 25d.
//   Sense-test: transcripts of one clean-ledger firing and one honest
//     firing, read for coherence (SENSE-TESTING LAW).
//
// Outputs: per-seed JSON (full wall-metric key set + firings + hashes) to
// PERSEED_DIR, summary to OUT, sense transcripts to TRANSCRIPT_DIR.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//     SIDES=control OUT=evidence/2026-10-16/fictiongate-control.json \
//     PERSEED_DIR=evidence/2026-10-16/perseed-fictiongate-control \
//     TRANSCRIPT_DIR=evidence/2026-10-16/fictiongate-beats-control \
//     node scripts/sweep-fictiongate-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 explicit required.'); process.exit(2); }
process.env.LEDGERDIAG = '1';

const SEEDS = (process.env.SEEDS || '137,248,359,470,581,692,803,914').split(',').map(Number);
const POLICIES = (process.env.POLICIES || 'leadfeast,belongfeast').split(',');
const SIDES = (process.env.SIDES || 'control').split(',');
const DAYS = Number(process.env.DAYS || 180);
const SMOKE = process.env.SMOKE === '1';
const OUT = process.env.OUT || null;
const PERSEED_DIR = process.env.PERSEED_DIR || null;
const TRANSCRIPT_DIR = process.env.TRANSCRIPT_DIR || null;

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installLedgerDiag } = require('./ledgerdiag-lib-20261016');
const { normBeat, HONEST_LINE, MEAL_LINE } = require('./test-fictiongate-20261016');
const SD = require('./policies/seatdrive');
const PMAP = { leadfeast: SD.leadseat, belongfeast: SD.belongseat };

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function snap(Game) {
  const o = { rank: 'village', arc: 1, tableWaiting: false, tableEntered: false, won: false, exiled: false, wave: 1 };
  try { o.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; o.arc = pg.arc || 1; o.tableWaiting = !!pg.tableWaiting; o.tableEntered = !!pg.tableDone; } catch (e) {}
  try { o.won = !!Game.won; } catch (e) {}
  try { o.exiled = !!(Game.justiceExiled && Game.justiceExiled()); } catch (e) {}
  try { o.wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  return o;
}

// Extended per-dawn trajectory hash: the mechanics the voice lever must not
// move. The journal TEXT is deliberately not in the hash (voice-only); the
// journal note's existence/dedup key (cat+key) is identical either way.
function extHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const vid = s.villagerId || Game.villagerId;
    let heat = 0, stage = 0;
    try { heat = Game.justiceHeat(); } catch (e) {}
    try { stage = Game.justiceStage(); } catch (e) {}
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length,
      Math.round(((v.takes || {})[vid]) || 0), Math.round(((v.gives || {})[vid]) || 0),
      stage, heat,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)
    ].join('|');
  } catch (e) { return 'ERR'; }
}

async function oneRun(pid, seed, side) {
  const base = PMAP[pid];
  if (!base) throw new Error('unknown policy ' + pid);
  const policy = Object.assign({}, base);
  const od = base.daily, ou = base.upkeep;
  let track = null;
  const hashes = [];
  const sayBuf = []; // ring buffer for sense-test transcripts
  policy.daily = (G, ctx) => {
    try { track.dawn(G); } catch (e) {}
    try { hashes.push(G.state.scholar.day + ':' + extHash(G)); } catch (e) {}
    return od ? od(G, ctx) : undefined;
  };
  if (ou) policy.upkeep = (G, ctx) => ou(G, ctx);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false, maxWave: 1, everExiled: false, everWon: false };
  let fin = null, result = null, sayHookErr = 0;
  await quietLog(async () => {
    const { Game } = await loadGame({ seed, mode: 'fictiongate-' + side });
    await setupGame(Game);
    track = installLedgerDiag(Game);
    if (!track.on) throw new Error('LEDGERDIAG did not arm');
    const oSay = Game.say;
    Game.say = function (t) {
      try {
        const s = String(t);
        sayBuf.push({ day: (Game.state.scholar || {}).day || 0, text: s.slice(0, 500) });
        if (sayBuf.length > 8000) sayBuf.splice(0, sayBuf.length - 8000);
      } catch (e) { sayHookErr++; }
      return oSay.apply(this, arguments);
    };
    const wrapped2 = Object.assign({}, policy);
    const od2 = policy.daily;
    wrapped2.daily = (G, ctx) => {
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
        if (s.exiled) hist.everExiled = true;
        if (s.won) hist.everWon = true;
        hist.maxWave = Math.max(hist.maxWave, s.wave || 1);
      } catch (e) {}
      return od2(G, ctx);
    };
    if (policy.upkeep) wrapped2.upkeep = policy.upkeep;
    result = await runDays(Game, wrapped2, { days: SMOKE ? 25 : DAYS });
    try { track.dawn(Game); } catch (e) {}
    fin = track.finalize();
    track.uninstall();
    Game.say = oSay;
  });
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const cs = (fin && fin.coldShoulder) || {};
  // The LEDGERDIAG journalNote wrap records the CALL even when the engine's
  // cat+key dedup suppresses the voicing (no "📓 Journal/Codex:" say-echo).
  // Only a voiced line counts as a firing of the fiction.
  const firings = (cs.firings || []).map(f => {
    const jbeats = (f.beats || []).filter(b => b.cls === 'COLD_SHOULDER_JOURNAL');
    const voiced = jbeats.find(b => /^📓 (Journal|Codex): /.test(b.text));
    return {
      day: f.day, vid: f.vid, heat: f.heat,
      cumNet: f.cumNet, voluntaryNet: f.voluntaryNet, voluntaryNet7: f.voluntaryNet7,
      mealShare: f.mealShare,
      journalVoiced: !!voiced,
      journalText: voiced ? normBeat(voiced.text) : null,
      journalCalls: jbeats.length,
      say: (f.beats || []).filter(b => b.cls === 'COLD_SHOULDER_SAY').map(b => b.text),
    };
  });
  const stageEvents = ((fin && fin.stageEvents) || []).map(e => ({ day: e.day, from: e.from, to: e.to }));
  const rows = (fin && fin.rows) || [];
  const halfRation = rows.filter(r => r.halfRation).length;
  const rankMax = hist.maxRank;
  return {
    policy: pid, seed, side, days: result.days, endReason: result.endReason,
    national: rankMax >= 2 ? 1 : 0, table: hist.everTable ? 1 : 0,
    wins: hist.everWon ? 1 : 0, exiled: hist.everExiled ? 1 : 0, entered: hist.everEntered ? 1 : 0,
    maxArc: hist.maxArc, maxWave: hist.maxWave, deaths,
    nFirings: cs.nFirings || 0, firings, stageEvents,
    halfRation, nRows: rows.length,
    halfRationRate: rows.length ? +(halfRation / rows.length).toFixed(4) : null,
    hashes,
    recon: fin && fin.recon ? { tr7Mismatch: fin.recon.tr7Mismatch, tr7Checked: fin.recon.tr7Checked, negMealRows: fin.recon.negMealRows } : null,
    instrErrors: (fin && fin.instrErrors) || [],
    sayHookErr,
    sayBuf: TRANSCRIPT_DIR ? sayBuf : undefined,
  };
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
        const r = await oneRun(pid, seed, side);
        perSeed.push(r);
        if (PERSEED_DIR) {
          const slim = Object.assign({}, r); delete slim.sayBuf; delete slim.hashes;
          slim.hashesKept = r.hashes.length;
          fs.writeFileSync(path.join(PERSEED_DIR, `${side}-${pid}-s${seed}.json`), JSON.stringify(slim, null, 1));
          fs.writeFileSync(path.join(PERSEED_DIR, `${side}-${pid}-s${seed}.hashes.json`), JSON.stringify(r.hashes));
        }
        if (TRANSCRIPT_DIR && r.sayBuf) {
          // Sense-test transcripts: each firing with ±2 days of context.
          for (const f of r.firings) {
            const ctx = r.sayBuf.filter(b => Math.abs(b.day - f.day) <= 2);
            const txt = [`# cold-shoulder firing: ${side} ${pid} s${seed} day ${f.day}`,
              `# voluntaryNet7=${f.voluntaryNet7} voluntaryNet=${f.voluntaryNet} mealShare=${f.mealShare}`,
              `# journal voiced: ${f.journalVoiced} text: ${JSON.stringify(f.journalText)}`, ''];
            for (const b of ctx) txt.push(`[d${b.day}] ${b.text}`);
            fs.writeFileSync(path.join(TRANSCRIPT_DIR, `${side}-${pid}-s${seed}-d${f.day}.txt`), txt.join('\n'));
          }
        }
        console.log(`    done: days=${r.days} end=${r.endReason} firings=${r.nFirings} halfRationRate=${r.halfRationRate} recon=${r.recon && r.recon.tr7Mismatch}`);
      }
    }
  }
  const summary = {
    seeds: SEEDS, policies: POLICIES, sides: SIDES, days: SMOKE ? 25 : DAYS,
    wall_s: ((Date.now() - t0) / 1000).toFixed(0),
    runs: perSeed.map(r => {
      const c = Object.assign({}, r); delete c.sayBuf; delete c.hashes; delete c.firings; return c;
    }),
  };
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(summary, null, 1));
  // Console: the primary-relevant table (voiced journal lines only).
  for (const r of perSeed) {
    for (const f of r.firings) {
      if (!f.journalVoiced) continue;
      const jt = f.journalText;
      const tag = jt === HONEST_LINE ? 'HONEST' : jt === MEAL_LINE ? 'MEAL-AWARE' : 'UNKNOWN';
      console.log(`  JOURNAL [${r.side} ${r.policy} s${r.seed} d${f.day}] vn7=${f.voluntaryNet7} vn=${f.voluntaryNet} -> ${tag}`);
    }
  }
  console.log('SWEEP DONE');
}

main().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
