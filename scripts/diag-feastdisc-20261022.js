#!/usr/bin/env node
// diag-feastdisc-20261022.js — sim-feastdiscipline day-1 spike DIAG.
//
// QUESTION: on the non-seat long substrate control (AD.armedFor(base),
// ARMORYDRIVE=1 — the armorydrive baseline), do feasts land BEFORE wave-4
// engagements, and where is the timing gap? The base's feast timing is
// feastscale's cadence (armed feasts >=7d apart, dusk, haven-gated, pantry
// buffer 1.5x, 1500-kcal contribution); the FEASTED buff window is 2 dawns.
// This instrument records, per config: every hostFeast call (day, dayPart,
// armed, ok/why), every grantFeastBuff (granted, window), and every
// scholar TB engagement (wave, feastedActive() at entry).
//
// INSTRUMENT-ONLY: no policy change, no game code change. Writes per-seed
// JSONs ONCE, on purpose, to evidence/2026-10-22/perseed-feastdisc-diag/.
// (Sibling loop B is LIVE on food-economy — this file touches nothing in
// src/js, only wraps Game methods in the sim process.)
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 SEEDS=66011,66012 POLICIES=lead,belong \
//   node scripts/diag-feastdisc-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`DIAG STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('DIAG STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [66011, 66012, 66013, 66014, 66015, 66016]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim().toLowerCase())
  : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-22', 'perseed-feastdisc-diag');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function normBase(b) {
  if (b === 'lead' || b === 'leadfeast') return 'leadfeast';
  if (b === 'belong' || b === 'belongfeast') return 'belongfeast';
  console.error(`DIAG STOP: unrecognized POLICIES entry "${b}".`); process.exit(2);
}

function waveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 0;
  } catch (e) { return 0; }
}

// Read-only wraps (before/after, no behavior change).
function instrument(Game, t) {
  function wrap(name, before, after) {
    const orig = Game[name];
    if (typeof orig !== 'function') return;
    Game[name] = function (...args) {
      let pre = null;
      try { pre = before ? before.apply(this, args) : null; } catch (e) { t.wrapErrors = (t.wrapErrors | 0) + 1; }
      const r = orig.apply(this, args);
      try { if (after) after.call(this, r, pre, args); } catch (e) { t.wrapErrors = (t.wrapErrors | 0) + 1; }
      return r;
    };
  }
  function dayNow() { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
  function partNow() { try { return (Game.dayPart == null ? 0 : Game.dayPart); } catch (e) { return 0; } }
  wrap('hostFeast', function () {
    let armed = false;
    try { armed = !!((((Game.state || {}).scholar || {}).prog || {}).feastSurge); } catch (e) {}
    return { day: dayNow(), part: partNow(), armed };
  }, function (r, pre) {
    t.feastCalls.push({ day: pre.day, part: pre.part, armed: pre.armed,
      ok: !!(r && r.ok), why: (r && r.why) ? String(r.why).slice(0, 70) : '' });
  });
  wrap('grantFeastBuff', function () {
    return { day: dayNow(), part: partNow() };
  }, function (r, pre) {
    t.buffGrants.push({ day: pre.day, part: pre.part,
      granted: !!(r && r.granted),
      untilDay: (r && r.untilDay) || null, untilPart: (r && r.untilPart) || null });
  });
  wrap('startCombat', function (monsterId) {
    let beforeId = null;
    try { beforeId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
    return { monsterId, beforeId, day: dayNow(), part: partNow() };
  }, function (r, pre) {
    if (!pre) return;
    let afterId = null;
    try { afterId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
    const started = !!(afterId && afterId !== pre.beforeId);
    let feasted = false;
    try { feasted = !!(Game.feastedActive && Game.feastedActive()); } catch (e) {}
    t.engagements.push({ day: pre.day, part: pre.part, mid: pre.monsterId,
      wave: waveOf(Game, pre.monsterId), started, feasted });
  });
}

async function one(seed, base) {
  const t = { seed, base, feasts: [], feastCalls: [], buffGrants: [], engagements: [],
    days: 0, wrapErrors: 0, endReason: 'done' };
  const { Game } = await loadGame({ seed, mode: 'feastdisc-diag', fullTelemetry: false });
  await setupGame(Game);
  instrument(Game, t);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, AD.armedFor(base), { days: DAYS }); });
  try { t.days = ((Game.state || {}).scholar || {}).day || 0; } catch (e) {}
  try { t.endReason = (Game.over ? 'over' : 'done') + ((Game.won || (Game.state || {}).won) ? '-won' : ''); } catch (e) {}
  return t;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const b of BASES) {
      const base = normBase(b);
      const t = await one(seed, base);
      const fn = path.join(EVID, `control-${base.replace('feast', '')}-s${seed}.json`);
      fs.writeFileSync(fn, JSON.stringify(Object.assign({ anchor: ANCHOR, substrate: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 ARMORYDRIVE=1' }, t), null, 1));
      // Analysis row
      const armedFeasts = t.feastCalls.filter(f => f.ok && f.armed);
      const allFeasts = t.feastCalls.filter(f => f.ok);
      const whyTop = {};
      for (const f of t.feastCalls) if (!f.ok) whyTop[f.why || '(blank)'] = (whyTop[f.why || '(blank)'] | 0) + 1;
      const w4 = t.engagements.filter(e => e.started && e.wave >= 4);
      const w4feasted = w4.filter(e => e.feasted);
      // Timing gap: days since last armed feast at each w4 engagement.
      let gaps = [];
      for (const e of w4) {
        const prior = armedFeasts.filter(f => f.day <= e.day).map(f => f.day);
        gaps.push(prior.length ? e.day - Math.max(...prior) : null);
      }
      const gapsSeen = gaps.filter(g => g !== null);
      rows.push({
        seed, base, days: t.days, end: t.endReason,
        armedFeasts: armedFeasts.map(f => f.day),
        allFeasts: allFeasts.map(f => `${f.day}${f.armed ? '*' : ''}`),
        nW4: w4.length, nW4feasted: w4feasted.length,
        gapMedian: gapsSeen.length ? gapsSeen.slice().sort((a, b) => a - b)[Math.floor(gapsSeen.length / 2)] : null,
        gaps: gapsSeen.sort((a, b) => a - b),
        whyTop: Object.entries(whyTop).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([w, n]) => `${n}x ${w.slice(0, 50)}`),
      });
      console.log(`done seed=${seed} base=${base} days=${t.days} armedFeasts=${armedFeasts.length} w4=${w4.length} w4feasted=${w4feasted.length}`);
    }
  }
  const fs2 = path.join(EVID, 'diag-summary.json');
  fs.writeFileSync(fs2, JSON.stringify(rows, null, 1));
  // Console summary
  console.log('\n=== DIAG summary ===');
  for (const r of rows) {
    console.log(`s${r.seed} ${r.base} d${r.days} end=${r.end}: armedFeasts[${r.armedFeasts.join(',')}] allFeasts[${r.allFeasts.join(',')}] w4=${r.nW4} w4feasted=${r.nW4feasted} gapMedian=${r.gapMedian} gaps=[${r.gaps.join(',')}]`);
    console.log(`   refusals: ${r.whyTop.join(' | ')}`);
  }
  const tot = rows.reduce((a, r) => ({ w4: a.w4 + r.nW4, w4f: a.w4f + r.nW4feasted, af: a.af + r.armedFeasts.length }), { w4: 0, w4f: 0, af: 0 });
  console.log(`\nTOTALS: armedFeasts=${tot.af} w4engagements=${tot.w4} w4feasted=${tot.w4f} (natural conjunction ${(tot.w4 ? (100 * tot.w4f / tot.w4) : 0).toFixed(1)}%)`);
})().catch(e => { console.error('DIAG FATAL', e); process.exit(1); });
