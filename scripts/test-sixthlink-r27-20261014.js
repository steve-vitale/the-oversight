#!/usr/bin/env node
// scripts/test-sixthlink-r27-20261014.js — PROOF for the sixthlink-r27 arm.
//
// The 6th link's race, scripted in-engine: six active primary-Haven links.
// Five elders (trust 60, seasoned, not thin) and a 6th (trust 35, age 20,
// unseasoned — RACING: needs 40 by age 30). Haven's pantry pinned at 14,000
// kcal (below the baseline's 20,000 tend gate, inside the 13500-20000 lower
// band — exactly one tend fits before the 13500 floor). The 6th's
// subordinate pays FULL tribute (no dry-field history), so linkIsThin is
// FALSE for it: trust 35 >= 30, clean tribute history.
//
// RED PHASE (honest failure modes this must catch):
//   R0. chain-fidelity: sixthlink.daily chains fourthlink.daily, then the
//       priority, then fifthlinkLayer (asserted structurally).
//   R1. gate-off loses the race: the fifthlink stack never tends the 6th —
//       the base needs pantry > 20000, and the thin-first layer skips a
//       trust-35 clean-history link (not thin). Trust 35 + full tribute
//       (+1/week) reaches 39 by age 30 — one short of seasoning, forever.
//   R2. gate off = fifthlink itself (same object): the file is inert.
//   R3. scarce-pantry ordering: with a THIN elder (trust 25) competing for
//       the single daily tend, the fifthlink layer tends the elder first
//       (hierarchyState order) — the racing 6th gets nothing.
// GREEN PHASE (lever):
//   G1. priority fires: sixthlinkPriority tends the racing 6th FIRST —
//       ctx.sixthTended counts it, and the 6th's tendedWeek is stamped.
//   G2. the race flips: trust 35 -> 40+ within the 30-day window (the tend
//       +8 outweighs the clock).
//   G3. no double-tend: after the priority tend, fifthlinkLayer's pass
//       skips the 6th (tendedWeek dedup) — one tend per link per week.
//   G4. comfortable 6th not prioritized: trust 50 is skipped by the racing
//       filter (no wasted tend).
//   G5. deadline ordering: two racing 6th+ links — the earlier deadline is
//       tended first.
//
// Usage: node scripts/test-sixthlink-r27-20261014.js
'use strict';
process.env.FOURTHLINK = '1';
process.env.FIFTHLINK = '1';
process.env.SIXTHLINK = '1';
const { fourthlink } = require('./policies/fourthlink');
const { fifthlink, fifthlinkLayer } = require('./policies/fifthlink-r26');
const { sixthlink, sixthlinkPriority } = require('./policies/sixthlink-r27');
const { loadGame, setupGame } = require('./sim-harness');

function pinPantry(Game, kcal) {
  const units = Math.round(kcal / 1500);
  Game.state.village.pantry = [{ name: 'Test grain', kcalEach: 1500, units, spoilDay: 9999 }];
}

// rich subordinate: full tribute every week (no thin history)
function richVillage(Game, id, name) {
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id, name, pantryKcal: 999999, population: 10, day: 0, roster: [] },
  ]);
}

async function buildRace({ sixthTrust, sixthAge, elderThin }) {
  const { Game } = await loadGame({ seed: 42, mode: 'sixthlink-r27-proof' });
  await setupGame(Game);
  for (let i = 1; i <= 5; i++) richVillage(Game, 'rich' + i, 'Richfield' + i);
  richVillage(Game, 'rich6', 'Richfield6');
  const m = Game.mshipState();
  m.links = m.links || [];
  Game.state.scholar.day = 30;
  const mk = (id, sub, day, trust) => ({
    id, primary: 'haven', subordinate: sub, day, trust,
    status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [],
  });
  for (let i = 1; i <= 5; i++) {
    m.links.push(mk('link_e' + i, 'rich' + i, 0, elderThin && i === 1 ? 25 : 60));
  }
  // the 6th: formed (30 - sixthAge) days ago, trust sixthTrust, racing
  m.links.push(mk('link_test6', 'rich6', 30 - sixthAge, sixthTrust));
  return { Game };
}

function drive(Game, daily, days) {
  const ctx = {};
  for (let d = 31; d < 31 + days; d++) {
    Game.state.scholar.day = d;
    pinPantry(Game, 15000);
    daily(Game, ctx);
    Game.linkTick();
    try { Game._renegotiationTick(); } catch (e) {}
  }
  return ctx;
}
const trustOf = (Game, id) => (Game.mshipState().links.find(l => l.id === id) || {}).trust | 0;
const weekOf = (Game) => (Game._week ? Game._week() : 0);

function offDaily(Game, ctx) { baseTendLoop(Game, ctx); fifthlinkLayer(Game, ctx); }
function onDaily(Game, ctx) { baseTendLoop(Game, ctx); sixthlinkPriority(Game, ctx); fifthlinkLayer(Game, ctx); }

// ---- the baseline tend loop, copied from scripts/policies/leadcourt.js ----
// (isolates the tend mechanism like the fifthlink proof; the full-policy
// integration is proven by the sims, not the unit race)
function baseTendLoop(Game, ctx) {
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

async function main() {
  let pass = 0;
  const ok = (name, cond, detail) => {
    if (!cond) { console.error(`FAIL ${name}: ${detail}`); process.exit(1); }
    pass++;
    console.log(`ok ${name}${detail ? ' — ' + detail : ''}`);
  };

  // R0: chain fidelity — sixthlink.daily is fourthlink.daily + priority + layer
  ok('R0-armed-id', sixthlink.id === 'sixthlink-r27', 'armed export carries the arm id');
  const src = require('fs').readFileSync(require('path').join(__dirname, 'policies', 'sixthlink-r27.js'), 'utf8');
  ok('R0-chains-fourthlink', src.includes('fourthlink.daily(Game, ctx)'), 'daily chains fourthlink.daily');
  ok('R0-runs-priority', src.includes('sixthlinkPriority(Game, ctx)'), 'daily runs sixthlinkPriority');
  ok('R0-runs-layer', src.includes('fifthlinkLayer(Game, ctx)'), 'daily runs fifthlinkLayer after');
  ok('R0-priority-before-layer',
    src.indexOf('sixthlinkPriority(Game, ctx)') < src.indexOf('fifthlinkLayer(Game, ctx)'),
    'priority runs BEFORE the thin-first pass');
  const leadSrc = require('fs').readFileSync(require('path').join(__dirname, 'policies', 'leadcourt.js'), 'utf8');
  ok('R0-base-copy-fidelity', leadSrc.includes('tendedWeek !== week && pantryKcal(Game) > 20000'),
    'leadcourt.js still carries the 20000 tend gate this test replicates');

  // R1: gate-off loses the race — the 6th (trust 35, clean history) is never tended
  {
    const { Game } = await buildRace({ sixthTrust: 35, sixthAge: 20 });
    const ctx = drive(Game, offDaily, 10); // age 20 -> 30
    const t = trustOf(Game, 'link_test6');
    ok('R1-off-never-tends-6th', (ctx.sixthTended | 0) === 0 && (ctx.fifthTended | 0) === 0,
      `no tends fired (6th not thin, pantry < 20000): sixthTended=${ctx.sixthTended | 0}`);
    ok('R1-race-lost', t < 40, `trust 35 -> ${t} at age 30 — one short of seasoning, the season closes`);
  }

  // R2: gate off = fifthlink itself
  delete process.env.SIXTHLINK;
  for (const k of Object.keys(require.cache)) if (k.endsWith('policies/sixthlink-r27.js')) delete require.cache[k];
  const off = require('./policies/sixthlink-r27').sixthlink;
  ok('R2-gate-off-is-fifthlink', off === fifthlink, 'unset gate exports the fifthlink stack itself');
  process.env.SIXTHLINK = '1';
  for (const k of Object.keys(require.cache)) if (k.endsWith('policies/sixthlink-r27.js')) delete require.cache[k];

  // R3: scarce pantry — thin elder eats the single tend, racing 6th starves
  {
    const { Game } = await buildRace({ sixthTrust: 35, sixthAge: 20, elderThin: true });
    const ctx = drive(Game, offDaily, 7);
    const t6 = trustOf(Game, 'link_test6');
    const te = trustOf(Game, 'link_e1');
    ok('R3-elder-first', (ctx.fifthTended | 0) >= 1 && te > 25,
      `thin elder tended first (trust 25 -> ${te}), 6th left at ${t6}`);
    ok('R3-6th-starves', t6 < 40, `racing 6th at ${t6} — hierarchyState order buries it`);
  }

  // G1: priority fires — the racing 6th is tended first
  {
    const { Game } = await buildRace({ sixthTrust: 35, sixthAge: 20, elderThin: true });
    Game.state.scholar.day = 31;
    pinPantry(Game, 15000);
    const ctx = {};
    sixthlinkPriority(Game, ctx);
    const l6 = Game.mshipState().links.find(l => l.id === 'link_test6');
    ok('G1-6th-tended-first', (ctx.sixthTended | 0) === 1, 'one priority tend fired');
    ok('G1-week-stamped', l6.tendedWeek === weekOf(Game), 'tendedWeek stamped on the 6th');
    ok('G1-trust-up', (l6.trust | 0) === 43, `trust 35 -> ${l6.trust} (+8)`);
  }

  // G2: the race flips — 35 reaches 40+ inside the window
  {
    const { Game } = await buildRace({ sixthTrust: 35, sixthAge: 20 });
    const ctx = drive(Game, onDaily, 10); // age 20 -> 30
    const t = trustOf(Game, 'link_test6');
    ok('G2-race-won', t >= 40, `trust 35 -> ${t} at age 30 — seasons (priority tends: ${ctx.sixthTended})`);
  }

  // G3: no double-tend between priority and layer
  {
    const { Game } = await buildRace({ sixthTrust: 35, sixthAge: 20 });
    Game.state.scholar.day = 31;
    pinPantry(Game, 15000);
    const ctx = {};
    sixthlinkPriority(Game, ctx);
    fifthlinkLayer(Game, ctx);
    const notes = (Game.mshipState().links.find(l => l.id === 'link_test6').history || [])
      .filter(h => h.kind === 'tended');
    ok('G3-single-tend', notes.length === 1, `one tend note (dedup holds), sixthTended=${ctx.sixthTended}, fifthTended=${ctx.fifthTended | 0}`);
  }

  // G4: comfortable 6th not prioritized
  {
    const { Game } = await buildRace({ sixthTrust: 50, sixthAge: 20 });
    Game.state.scholar.day = 31;
    pinPantry(Game, 15000);
    const ctx = {};
    sixthlinkPriority(Game, ctx);
    ok('G4-comfortable-skipped', (ctx.sixthTended | 0) === 0, 'trust 50 is not racing — no tend spent');
  }

  // G5: deadline ordering — two racing 6th+ links, earlier deadline first
  {
    const { Game } = await buildRace({ sixthTrust: 35, sixthAge: 20 });
    const m = Game.mshipState();
    richVillage(Game, 'rich7', 'Richfield7');
    m.links.push({
      id: 'link_test7', primary: 'haven', subordinate: 'rich7',
      day: 30 - 10, trust: 30, status: 'active', tributeKcalPerWeek: 4000,
      tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1, arrears: 0, history: [],
    });
    Game.state.scholar.day = 31;
    pinPantry(Game, 15000); // one tend fits
    const ctx = {};
    sixthlinkPriority(Game, ctx);
    const l6 = m.links.find(l => l.id === 'link_test6');
    const l7 = m.links.find(l => l.id === 'link_test7');
    // link_test6: formed day 10, deadline day 40 (9 days left). link_test7: formed day 20, deadline day 50 (19 left).
    ok('G5-earlier-deadline-first', (l6.tendedWeek === weekOf(Game)) && (l7.tendedWeek !== weekOf(Game)),
      'test6 (deadline d40) tended before test7 (deadline d50)');
  }

  console.log(`\nPROOF ${pass}/${pass} green — RED observed (gate-off loses the 6th's race), priority flips it.`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
