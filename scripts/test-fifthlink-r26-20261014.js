#!/usr/bin/env node
// scripts/test-fifthlink-r26-20261014.js — PROOF for the fifthlink-r26 arm.
//
// The tend-vs-decay race, scripted in-engine: a thin late link (trust 24)
// whose subordinate's fields are dry (tribute = nothing every week ->
// -2/week via hierarchy.js linkTick), Haven's pantry pinned at 15,000 kcal
// (below the baseline's 20,000 tend gate, inside the layer's 13500-20000
// lower band). 28 days, real Game.linkTick + Game._renegotiationTick, no RNG
// consumed on either side (dry tribute path has no rolls) — the race is pure
// mechanism, identical engine state before/after.
//
// RED PHASE (honest failure modes this must catch):
//   R0. copy-fidelity: the baseline tend loop in this test IS leadcourt's
//       loop (asserted against leadcourt.js source).
//   R1. baseline lets it decay: leadcourt/fourthlink tends nothing at
//       pantry 15000, so thin tribute ticks bleed the trust net-negative.
//       (Note: for primary-Haven links each linkTick call IS a tribute
//       week — no week-1 settlement grace like the subordinate-Haven
//       branch; the lastLinkWeek guard makes it fire once per week.)
//   R2. gate off = fourthlink: FIFTHLINK unset -> the module exports
//       fourthlink itself (same object). The file is inert.
// GREEN PHASE (lever):
//   G1. layer flips the race: the thin link (trust<30) is tended at the
//       lower gate -> +8/week outweighs -2/week -> trust rises net-positive.
//   G2. young-link grief answered: a staged pendingRenegotiation is met
//       with 'gift' (+8, pendingRenegotiation cleared); the baseline
//       leaves the same beat to expire aloud (-6 after 7 days).
//   G3. tribute-history thin: a link at trust 35 (not <30) with dry fields
//       becomes thin by history (2+ short-tribute weeks in 3) and gets
//       tended; the baseline lets it slide.
//
// Usage: node scripts/test-fifthlink-r26-20261014.js
'use strict';
process.env.FOURTHLINK = '1';
process.env.FIFTHLINK = '1';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const { fourthlink } = require('./policies/fourthlink');
const { fifthlink, fifthlinkLayer, linkIsThin } = require('./policies/fifthlink-r26');

// ---- the baseline tend loop, copied from scripts/policies/leadcourt.js ----
// (copy-fidelity asserted against the source in R0 below)
function baselineTendLoop(Game, ctx) {
  let links = [];
  try { links = Game.hierarchyState() || []; } catch (e) {}
  const week = (Game._week ? Game._week() : 0);
  const pantryKcal = ((Game.state.village || {}).pantry || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  for (const link of links) {
    if (!link || link.status !== 'active') continue;
    if (link.primary === 'haven' && Game.tendLink) {
      if (link.tendedWeek !== week && pantryKcal > 20000) {
        try { Game.tendLink(link.id); } catch (e) {}
        ctx.tended = (ctx.tended || 0) + 1;
      }
    }
  }
}
function layerDaily(Game, ctx) { baselineTendLoop(Game, ctx); fifthlinkLayer(Game, ctx); }

function pinPantry(Game, kcal) {
  // whole-unit takes: 1500-kcal units so tends remove exactly 1500.
  const units = Math.round(kcal / 1500);
  Game.state.village.pantry = [{ name: 'Test grain', kcalEach: 1500, units, spoilDay: 9999 }];
}

async function buildRace({ trust }) {
  const { Game } = await loadGame({ seed: 42, mode: 'fifthlink-r26-proof' });
  await setupGame(Game);
  // dry subordinate: empty fields, no mouths — tribute is nothing, weekly.
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id: 'dryv', name: 'Dryfield', pantryKcal: 0, population: 0, day: 0, roster: [] },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  const link = {
    id: 'link_test5', primary: 'haven', subordinate: 'dryv',
    day: 0, trust, status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [],
  };
  m.links.push(link);
  Game.state.scholar.day = 0;
  return { Game, link };
}

function drive(Game, daily, days) {
  const ctx = {};
  for (let d = 1; d <= days; d++) {
    Game.state.scholar.day = d;
    pinPantry(Game, 15000);
    daily(Game, ctx);
    Game.linkTick();
    Game._renegotiationTick();
  }
  return ctx;
}
const trustOf = (Game) => (Game.mshipState().links.find(l => l.id === 'link_test5') || {}).trust | 0;

async function main() {
  let pass = 0;
  const ok = (name, cond, detail) => {
    if (!cond) { console.error(`FAIL ${name}: ${detail}`); process.exit(1); }
    pass++;
    console.log(`ok ${name}${detail ? ' — ' + detail : ''}`);
  };

  // ---- R0: the baseline loop in this test IS leadcourt's loop ----
  const src = fs.readFileSync(path.join(__dirname, 'policies', 'leadcourt.js'), 'utf8');
  ok('R0-copy-fidelity', src.includes('tendedWeek !== week && pantryKcal(Game) > 20000'),
    'leadcourt.js still carries the 20000 tend gate this test replicates');

  // ---- RED R1: baseline lets the thin link decay net-negative ----
  {
    const { Game } = await buildRace({ trust: 24 });
    drive(Game, baselineTendLoop, 28);
    const t = trustOf(Game);
    ok('R1-baseline-decays', t <= 24, `trust 24 -> ${t} (thin tribute ticks, no tends at pantry 15000)`);
    ok('R1-net-negative', t < 24, `delta ${t - 24} < 0 — the race is lost without the layer`);
  }

  // ---- RED R2: gate off = fourthlink itself (require-cache surgery, env read at load) ----
  delete process.env.FIFTHLINK;
  for (const k of Object.keys(require.cache)) if (k.replace(/\\/g, '/').endsWith('policies/fifthlink-r26.js')) delete require.cache[k];
  const off = require('./policies/fifthlink-r26').fifthlink;
  ok('R2-gate-off-is-fourthlink', off === fourthlink, 'unset gate exports fourthlink itself');
  process.env.FIFTHLINK = '1';
  for (const k of Object.keys(require.cache)) if (k.replace(/\\/g, '/').endsWith('policies/fifthlink-r26.js')) delete require.cache[k];
  const on = require('./policies/fifthlink-r26');
  ok('R2-gate-on-differs', on.fifthlink !== fourthlink, 'gated policy is a distinct object');
  ok('R2-armed-id', on.fifthlink.id === 'fifthlink-r26', 'armed export carries the arm id');

  // ---- GREEN G1: the layer flips the race net-positive ----
  {
    const { Game } = await buildRace({ trust: 24 });
    const ctx = drive(Game, layerDaily, 28);
    const t = trustOf(Game);
    ok('G1-layer-grows-trust', t > 24, `trust 24 -> ${t} (+8 tends outweigh -2 decay)`);
    ok('G1-tends-fired', (ctx.fifthTended | 0) >= 4, `${ctx.fifthTended} thin-priority tends`);
  }

  // ---- GREEN G2: young-link grief answered vs left to expire ----
  {
    const b = await buildRace({ trust: 24 });
    b.link.pendingRenegotiation = { day: 5, sub: false };
    b.Game.state.scholar.day = 5; pinPantry(b.Game, 15000);
    fifthlinkLayer(b.Game, {});
    const cleared = b.link.pendingRenegotiation == null;
    const tAfter = trustOf(b.Game);
    ok('G2-gift-answers-beat', cleared && tAfter >= 24 + 8, `beat cleared, trust 24 -> ${tAfter} (grief met with grain)`);
  }
  {
    const b = await buildRace({ trust: 24 });
    b.link.pendingRenegotiation = { day: 5, sub: false };
    drive(b.Game, baselineTendLoop, 12); // beat expires at day 12 unanswered
    const notes = (b.link.history || []).filter(h => h.kind === 'renegotiation').map(h => String(h.note));
    const expired = notes.some(n => n.indexOf('silence') >= 0);
    ok('G2-baseline-lets-expire', expired, 'baseline leaves the beat; the silence answers (-6)');
  }

  // ---- GREEN G3: history-based thin (trust 35, dry fields) ----
  {
    const { Game } = await buildRace({ trust: 35 });
    const ctx = drive(Game, layerDaily, 28);
    const t = trustOf(Game);
    ok('G3-history-thin-tended', t > 35, `trust 35 -> ${t} (dry-field history made it thin, tends fired: ${ctx.fifthTended})`);
  }
  {
    const { Game } = await buildRace({ trust: 35 });
    drive(Game, baselineTendLoop, 28);
    const t = trustOf(Game);
    ok('G3-baseline-slides', t < 35, `baseline trust 35 -> ${t} (no tend, decay only)`);
  }

  // ---- predicate sanity ----
  {
    const { link } = await buildRace({ trust: 24 });
    ok('P-thin-by-trust', linkIsThin(link) === true, 'trust 24 < 30 is thin');
    link.trust = 60; link.history = [];
    ok('P-fat-link', linkIsThin(link) === false, 'trust 60, clean history is not thin');
    link.history = [
      { day: 9, kind: 'tribute', note: 'Dryfield paid nothing — empty fields.' },
      { day: 16, kind: 'tribute', note: 'Dryfield paid thin: 500 of 4,000 kcal.' },
      { day: 23, kind: 'tribute', note: 'Dryfield paid. The pantry grows.' },
    ];
    ok('P-thin-by-history', linkIsThin(link) === true, '2 short weeks in 3 -> thin before trust slides');
  }

  console.log(`\nPROOF ${pass}/${pass} green — RED observed (baseline decays, gate-off inert), layer flips the race.`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
