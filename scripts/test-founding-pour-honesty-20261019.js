#!/usr/bin/env node
// FOUNDING-POUR HONESTY PROOF (journey scale r12, 2026-10-19):
// The Founding Council's POOL answer founds the shared granary — the beat's
// copy says "X, Y, Z each pour 2,000 kcal into one pool". The engine's
// real-food rule (break-it regional r3 2026-10-11) makes each fire pour
// min(rate, its own pantry): a fire with an empty pantry pours 0, and the
// shortfall IS said aloud ("Some fires poured short — the council's book
// shows every grain, and every gap."). But the lead clause still asserts
// "each pour 2,000 kcal" — a false sentence sitting next to the honest one.
// On journey-scale r12 seed 12010 (pool answer, one fire poured 0), the
// copy read "each pour 2,000 kcal into one pool — 6,000 kcal" + "Some fires
// poured short" in the SAME beat — copy contradicting copy, the exact
// copy/engine-honesty standard the thin-air fix was built on.
// FIX: when a shortfall fired, the lead clause says "were called to pour
// X kcal each — Y kcal came in" (states the rate asked and the true total);
// the full-pour path keeps "each pour X".
// Run: node scripts/test-founding-pour-honesty-20261019.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [7, 42, 99]);

let failures = 0;
function ok(cond, label) {
  if (cond) { console.log(`  PASS ${label}`); }
  else { failures++; console.log(`  FAIL ${label}`); }
}

async function setupCovenant(Game, ovs) {
  const day0 = Game.state.scholar.day || 0;
  // the rung gate is proven elsewhere (test-scale-pacing.js) — set the
  // regional rung old enough that the beat can stage
  Game.state.networkLive = true;
  Game.state.networkLiveDay = day0 - 31;
  // 3 seasoned covenant peers (31d, trust 45)
  for (const v of [ovs[0], ovs[1], ovs[2]]) {
    const l = Game._formPeerLink(v.id, { kind: 'covenant' });
    l.trust = 45; l.day = day0 - 31;
    v.pantryKcal = 50000;
  }
  Game._checkNational();
  const pn = Game.state.pendingNational;
  ok(!!pn && pn.shape === 'covenant', `founding council staged (got ${pn && pn.shape})`);
  return day0;
}

function giveHavenPantry(Game, kcal) {
  // realistic pantry: many small items (a single 50,000-kcal item would be
  // taken WHOLE by _removePantryKcal's whole-units doctrine — break-it food
  // r3 2026-10-10 — which is designed, not the blank under test)
  const n = Math.ceil(kcal / 1000);
  Game.state.village.pantry = [];
  for (let i = 0; i < n; i++) {
    Game.state.village.pantry.push({ itemId: 'smoked_meat', name: 'Smoked meat', kcalEach: 1000, units: 1, spoilDay: 99999 });
  }
}

async function runSeed(seed) {
  console.log(`\n### SEED ${seed}`);
  // --- case A: one fire's pantry is empty (shortfall path) ---
  {
    const { Game } = await loadGame({ seed });
    await setupGame(Game);
    const says = [];
    const osay = Game.say.bind(Game);
    Game.say = (t) => { says.push(String(t)); return osay(t); };
    while (Game.state.otherVillages.filter(v => v && v.id !== 'haven').length < 7) {
      const base = Game.state.otherVillages.filter(v => v && v.id !== 'haven');
      const t = Object.assign({}, base[base.length - 1]);
      const n = base.length;
      t.id = 'village_pour' + n; t.name = 'Pourholm' + n; t.x = (t.x + 3 * n) % 9;
      t.generated = true; t.rumored = false; t.opinion = 0;
      Game.state.otherVillages.push(t);
    }
    const ovs = (Game.state.otherVillages || []).filter(v => v && v.id !== 'haven');
    ovs.forEach(v => { v.generated = true; v.opinion = 0; });
    setupCovenant(Game, ovs);
    giveHavenPantry(Game, 50000);
    // the third fire's pantry is EMPTY — it pours 0
    const links = Game.hierarchyState().filter(l => l.kind === 'covenant' && l.status === 'active');
    const emptyVid = links[2].b === 'haven' ? links[2].a : links[2].b;
    ovs.find(v => v.id === emptyVid).pantryKcal = 0;
    const poolBefore = Game.leaguePool();
    says.length = 0;
    ok(Game.answerNationalChoice('pool') === true, 'council answered: pool');
    const beat = says.find(t => /shared granary is founded/.test(t)) || '(no founding line)';
    console.log(`  FOUNDING LINE: ${beat.slice(0, 260)}`);
    ok(/Some fires poured short/.test(beat), 'shortfall said aloud');
    // THE BLANK: the lead clause must not claim "each pour 2,000" when one
    // fire poured 0 — copy contradicting copy.
    ok(!/each pour [\d,]+ kcal into one pool/.test(beat),
       'shortfall path does not assert full pours ("each pour X" absent)');
    ok(/were called to pour [\d,]+ kcal each/.test(beat),
       'shortfall path states the rate asked and the true total ("were called to pour X each")');
    // real-food honesty: the pool grew by exactly what was poured
    ok(Game.leaguePool() === poolBefore + 6000,
       `pool grew by the true poured total (haven 2000 + 2 rich fires, got ${Game.leaguePool() - poolBefore})`);
    const shortLink = Game.hierarchyState().find(l => l.id === links[2].id);
    ok(shortLink && Math.round(shortLink.trust) === 49,
       `shortfall link: trust +6 then -2 = 49 (got ${shortLink && Math.round(shortLink.trust)})`);
  }
  // --- case B: all fires pour in full (no shortfall) ---
  {
    const { Game } = await loadGame({ seed });
    await setupGame(Game);
    const says = [];
    const osay = Game.say.bind(Game);
    Game.say = (t) => { says.push(String(t)); return osay(t); };
    while (Game.state.otherVillages.filter(v => v && v.id !== 'haven').length < 7) {
      const base = Game.state.otherVillages.filter(v => v && v.id !== 'haven');
      const t = Object.assign({}, base[base.length - 1]);
      const n = base.length;
      t.id = 'village_pour' + n; t.name = 'Pourholm' + n; t.x = (t.x + 3 * n) % 9;
      t.generated = true; t.rumored = false; t.opinion = 0;
      Game.state.otherVillages.push(t);
    }
    const ovs = (Game.state.otherVillages || []).filter(v => v && v.id !== 'haven');
    ovs.forEach(v => { v.generated = true; v.opinion = 0; });
    setupCovenant(Game, ovs);
    giveHavenPantry(Game, 50000);
    const poolBefore = Game.leaguePool();
    says.length = 0;
    ok(Game.answerNationalChoice('pool') === true, 'council answered: pool (full)');
    const beat = says.find(t => /shared granary is founded/.test(t)) || '(no founding line)';
    console.log(`  FOUNDING LINE: ${beat.slice(0, 200)}`);
    ok(/each pour 2,000 kcal into one pool — 8,000 kcal/.test(beat),
       'full-pour path keeps "each pour 2,000" (haven 2000 + 3 fires = 8000)');
    ok(!/Some fires poured short/.test(beat), 'no shortfall line when all pour in full');
    ok(Game.leaguePool() === poolBefore + 8000,
       `pool grew by the true total (got ${Game.leaguePool() - poolBefore})`);
  }
}

(async () => {
  for (const s of SEEDS) await runSeed(s);
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
