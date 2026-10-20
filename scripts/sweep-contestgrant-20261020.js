#!/usr/bin/env node
// scripts/sweep-contestgrant-20261020.js — CONTESTGRANT corpus sweep
// (flesh-out loop arm sim-contestgrant, run fleshout-20261020T1915Z,
// axis scale-onramp, backlog #698).
//
// The engine fix (src/js/contests.js): contestChoose's d.grantWeapon block
// now calls this.noteGearHandled(def.id) after the direct equip — a
// contest-granted weapon teaches its recipe L1, like every other equip path.
// CANON (Steve 2026-10-09): "handling a gear item with a recipe (equipping
// it, looting it from a corpse) teaches L1 — you've SEEN one up close."
// DESIGN CALL (documented in evidence, Steve can overrule): contest grants
// are real grants ("yours to keep," Steve 2026-10-08) and the grant EQUIPS —
// so the grant teaches.
//
// ARMS (identical seeds; sides are separate invocations against DIFFERENT
// code states — the script self-verifies the fix presence against SIDE):
//   leadfeast   x before/after   (FEASTSCALE_R13=1 standard substrate)
//   belongfeast x before/after
// 8 seeds x 2 policies x 2 sides = 32 runs, 180d death-aware.
//
// Each run plants ONE deterministic grant beat (day 30, the REAL
// contestChoose path with the actual pit weapon-choice shape) so the
// mechanism (grant teaches L1) is measured at scale, while the det-gate
// (per-day behavior hashes) proves zero other behavioral drift.
//
// PRE-REGISTRATION (MEASUREMENT.md §§9-12, 14):
//   PRIMARY: per run, the planted beat teaches iff code has the fix:
//     after-arm:  postBeat > preBeat   (16/16 runs)
//     before-arm: postBeat === preBeat  (16/16 runs)
//   GO: all 32 runs satisfy the primary AND det-gate passes
//       (before/after behavior hashes byte-identical on every day).
//   KILL: any primary miss, or any unexplained trajectory divergence.
//   GUARDRAILS: median survival within -10d noise vs before; starvation
//     shares and wave-4 reach within noise; no new death modes; check.js
//     --quick parity with the pre-existing 4 failures (documented
//     2026-10-20 — not this change).
//   HORIZON: 180d death-aware (dead villages stop; +10d tail max).
//   SEEDS: 65101-65108 (verified filename-unused in evidence/2026-10-20/
//     perseed-* before the sweep).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 \
//     POLICY=leadfeast SIDE=before SEEDS=65101,65102 \
//     OUT=evidence/2026-10-20/perseed-contestgrant/before-lead.json \
//     node scripts/sweep-contestgrant-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const FSP = require('./policies/feastscale');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const tr = require('./sweep-tablerecon-20261013');

// ---- substrate guards ----
if (process.env.FEASTSCALE_R13 !== '1') {
  console.error('FATAL: FEASTSCALE_R13=1 required (standard substrate)'); process.exit(2);
}
if (process.env.SEATDRIVE === '1') {
  console.error('FATAL: SEATDRIVE must not be 1 (pre-seat substrate)'); process.exit(2);
}
if (process.env.SURPLUSFEED) {
  console.error('FATAL: SURPLUSFEED must be unset (base substrate)'); process.exit(2);
}
const SIDE = process.env.SIDE || 'before';
if (SIDE !== 'before' && SIDE !== 'after') {
  console.error('FATAL: SIDE must be before|after'); process.exit(2);
}
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICIES = { leadfeast: FSP.leadfeast, belongfeast: FSP.belongfeast };
const BASE = POLICIES[POLICY_ID];
if (!BASE) { console.error('FATAL: POLICY must be leadfeast|belongfeast'); process.exit(2); }

// ---- code-state self-check: the fix must be present iff SIDE=after ----
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'contests.js'), 'utf8');
  const fixPresent = src.indexOf('this.noteGearHandled(def.id)') !== -1;
  if (SIDE === 'after' && !fixPresent) {
    console.error('FATAL: SIDE=after but the contest grantWeapon fix is NOT in contests.js — wrong code state'); process.exit(2);
  }
  if (SIDE === 'before' && fixPresent) {
    console.error('FATAL: SIDE=before but the fix IS in contests.js — wrong code state'); process.exit(2);
  }
  console.log(`code-state check: SIDE=${SIDE}, fix present=${fixPresent} — OK`);
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [65101, 65102, 65103, 65104, 65105, 65106, 65107, 65108]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;

function recipeLevel(Game, id) {
  try { return (((Game.state.codex || {}).recipes || {})[id] || {}).level || 0; } catch (e) { return 0; }
}
function behHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const pan = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    const parts = [(s.day | 0), Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, (Game.map && Game.map.px) | 0, (Game.map && Game.map.py) | 0,
      Game.unlockedWave ? Game.unlockedWave() : 0, Math.round(pan / 100)];
    return parts.join('|');
  } catch (e) { return 'ERR'; }
}
function knowHash(Game) {
  try {
    const recs = ((Game.state.codex || {}).recipes) || {};
    return Object.keys(recs).sort().map(k => k + ':' + (((recs[k] || {}).level) | 0)).join(',');
  } catch (e) { return 'ERR'; }
}
// The planted beat: the REAL contestChoose path with the actual pit
// weapon-choice shape (line 3020: "Take a spear — yours to keep").
function plantGrant(Game) {
  const pre = recipeLevel(Game, 'hunting_spear');
  const saved = Game.state.activeContest;
  Game.state.activeContest = {
    phaseIdx: 0, phase: 'playing', contestId: 'fixture-pit-spear',
    participant: 'player', kind: 'contest',
    phases: [{ choices: [{ label: 'Take a spear',
      do: { grantWeapon: 'hunting_spear', note: 'You take a spear. Three waves. No rest.' } }] }],
  };
  try { Game.contestChoose(0); } catch (e) { /* fixture surface; must not throw */ }
  Game.state.activeContest = saved;
  return { fired: true, pre, post: recipeLevel(Game, 'hunting_spear') };
}
const REGIONAL_PLUS = (r) => r === 'regional' || r === 'national' || r === 'global';
const med = (a) => { const s = (a || []).slice().sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };

(async () => {
  const t0 = Date.now();
  const rows = [];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'contestgrant-' + POLICY_ID });
    await setupGame(Game);
    const m = fc.attachInstruments(Game);
    sr.attachScale(Game, m);
    const t = tr.attachTable(Game, m);
    const traj = [];
    const track = { planted: false, grant: null };
    const origDaily = BASE.daily;
    const wrapped = Object.assign({}, BASE, {
      daily(G, dctx) {
        try {
          const d = (G.state.scholar || {}).day || 0;
          traj.push(d + ':' + behHash(G) + '#' + knowHash(G));
          if (!track.planted && d >= 30 && !G.state.over) {
            track.grant = plantGrant(G);
            track.planted = true;
          }
          try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
          try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
          try {
            if (d % 5 === 0) { const r = tr.tableRow(G); t.rows.push(r); tr.trackBest(t, r); }
          } catch (e) {}
        } catch (e) {}
        if (origDaily) { try { origDaily(G, dctx); } catch (e) {} }
      },
    });
    wrapped.setup = undefined;
    const result = await runDays(Game, wrapped, { days: DAYS, sampleEvery: DAYS + 1 });
    m._days = result.days;
    try { const rf = tr.tableRow(Game); t.rows.push(rf); tr.trackBest(t, rf); } catch (e) {}
    let regionalHeldDays = 0, regionalFirstDay = null;
    try {
      for (const r of (m.scale.daily || [])) {
        if (REGIONAL_PLUS(r.rank)) {
          regionalHeldDays++;
          if (regionalFirstDay == null || r.day < regionalFirstDay) regionalFirstDay = r.day;
        }
      }
    } catch (e) {}
    const row = Object.assign(
      { label: 'contestgrant', side: SIDE, policy: POLICY_ID, seed, commit: '' },
      fc.finalize(Game, m, result),
      sr.finalizeScale(Game, m),
      tr.finalizeTable(Game, m),
      {
        days: result.days, endReason: result.endReason || 'unknown',
        regionalHeldDays, regionalFirstDay,
        cgGrant: track.grant || { fired: false, pre: null, post: null },
        traj,
      }
    );
    rows.push(row);
    const g = row.cgGrant;
    console.log(`  [${POLICY_ID} ${SIDE} s${seed}] d=${row.days} ${row.endReason} grantFired=${g.fired ? 1 : 0} preBeat=${g.pre} postBeat=${g.post} finalDays=${row.days}`);
  }
  const out = process.env.OUT;
  const payload = { label: 'contestgrant', side: SIDE, policy: POLICY_ID, seeds: SEEDS, days: DAYS, rows };
  if (out) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(payload, null, 1));
    console.error('wrote ' + out);
  }
  const medDays = med(rows.map(r => r.days));
  console.log(`\n=== ${POLICY_ID} ${SIDE} === seeds=[${SEEDS.join(',')}] days=${DAYS} (${((Date.now() - t0) / 1000).toFixed(0)}s) medianDays=${medDays}`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
