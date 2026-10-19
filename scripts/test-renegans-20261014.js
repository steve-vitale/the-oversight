#!/usr/bin/env node
// scripts/test-renegans-20261014.js — PROOF for the renegans arm.
//
// The gap (evidence/2026-10-14/sim-fifthlink.md): leadcourt never clicks
// answerRenegotiation, so every young-link renegotiation beat expires
// unanswered (-6 after 7 days, said aloud). winseek answers them (gift when
// the pantry holds 8000+, visit otherwise). This layer brings that one
// honest bar to the LEAD road.
//
// RED PHASE (honest failure modes this must catch):
//   R1. gate off = baseline: RENEGANS unset -> the renegans module exports
//       fourthlink itself (same object). The file is inert.
//   R2. REAL RED — the gap in-engine: stage a young-link beat through the
//       engine's REAL succession path (Game.successionCrisis: -8 haircut,
//       beat staged, fiction said aloud), then run the gate-off policy
//       daily across the 7-day expiry with the engine's real
//       _renegotiationTick. The beat must EXPIRE unanswered: the
//       "silence answered" note lands, trust drops -6, no answer ever
//       fires. This is the -6 the layer must flip.
// GREEN PHASE (lever):
//   G1. gate on: RENEGANS=1 -> renegans is a distinct policy, desc names
//       renegotiation beats.
//   G2. layer answers honestly: same real staged beat, one layer pass ->
//       the beat clears, 'gift' lands (pantry pinned >8000): trust +8, the
//       engine's own "grief met with grain" fiction says it.
//   G3. thin pantry -> 'visit': the beat clears without spending grain the
//       pantry doesn't hold (winseek's bar: gift iff pantry > 8000).
//   G4. full-policy smoke: the armed renegans.daily (competent +
//       uncapped courtship + answers) runs a day on a live beat without
//       throwing and answers it.
//
// Usage: node scripts/test-renegans-20261014.js
'use strict';
process.env.FOURTHLINK = '1';
process.env.RENEGANS = '1';
const fs = require('fs');
const path = require('path');
const K = require('./godpath/lib');
const { watchRenegotiation } = require('./lib/renegotiation-fixture');
let proofGame;
const { fourthlink } = require('./policies/fourthlink');
// The layer file is DELETED per the kill protocol (arm KILLED AT PILOT).
// The GREEN phase degrades gracefully: armed-phase scenarios info-skip when
// the layer is absent; the RED phase (baseline inertness + the in-engine gap)
// stays fully runnable. This keeps the committed proof green in-tree.
let renegansMod = null;
try { renegansMod = require('./policies/renegans'); }
catch (e) { if (e.code !== 'MODULE_NOT_FOUND' || fs.existsSync(path.join(__dirname, 'policies', 'renegans.js'))) throw e; }
const layerPresent = !!renegansMod;
const renegans = layerPresent ? renegansMod.renegans : null;
const renegotiationAnswers = layerPresent ? renegansMod.renegotiationAnswers : null;

function pinPantry(Game, kcal) {
  const units = Math.max(1, Math.round(kcal / 1500));
  Game.state.village.pantry = [{ name: 'Test grain', kcalEach: 1500, units, spoilDay: 9999 }];
}

async function buildLink({ trust }) {
  if (!proofGame) proofGame = await K.load({ seed: Number(process.env.SEED || 42) });
  const Game = proofGame; K.newRun(Game);
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id: 'dryv', name: 'Dryfield', pantryKcal: 0, population: 0, day: 0, roster: [] },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  const link = {
    id: 'link_testR', primary: 'haven', subordinate: 'dryv',
    day: 0, trust, status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [],
  };
  m.links.push(link);
  Game.state.scholar.day = 10;
  return { Game, link };
}
const trustOf = (Game) => (Game.mshipState().links.find(l => l.id === 'link_testR') || {}).trust | 0;
const beatOf = (Game) => (Game.mshipState().links.find(l => l.id === 'link_testR') || {}).pendingRenegotiation || null;
const renegNotes = (Game) => ((Game.mshipState().links.find(l => l.id === 'link_testR') || {}).history || [])
  .filter(h => h.kind === 'renegotiation').map(h => String(h.note));

async function main() {
  let pass = 0;
  const ok = (name, cond, detail) => {
    if (!cond) { console.error(`FAIL ${name}: ${detail}`); process.exit(1); }
    pass++;
    console.log(`ok ${name}${detail ? ' — ' + detail : ''}`);
  };

  // ---- RED R1: gate off = fourthlink itself (or layer absent: inert by deletion) ----
  delete process.env.RENEGANS;
  if (layerPresent) {
    delete require.cache[require.resolve('./policies/renegans')];
    const off = require('./policies/renegans').renegans;
    ok('R1-gate-off-is-fourthlink', off === fourthlink, 'unset gate exports fourthlink itself');
  } else {
    ok('R1-layer-deleted', !fs.existsSync(path.join(__dirname, 'policies', 'renegans.js')), 'layer absent (killed arm) — inert by deletion, nothing to gate');
  }

  // ---- RED R2: the gap — baseline lets a REAL staged beat expire ----
  {
    const { Game } = await buildLink({ trust: 24 });
    const ret = Game.successionCrisis('link_testR'); // real engine path: -8 + staged beat
    ok('R2-beat-staged-real', ret === 'grace' && beatOf(Game) != null, `successionCrisis -> ${ret}, beat staged`);
    const tStaged = trustOf(Game);
    ok('R2-haircut-applied', tStaged === 16, `trust 24 -> ${tStaged} (-8 succession haircut)`);
    const ctx = {};
    const watch = watchRenegotiation(Game);
    try {
      for (let d = 11; d <= 18; d++) { // 8 days: the beat expires at day 17 unanswered
        Game.state.scholar.day = d;
        pinPantry(Game, 15000);
        fourthlink.daily(Game, ctx); // the baseline policy — never answers
        Game._renegotiationTick();
      }
    } finally { watch.restore(); }
    const notes = renegNotes(Game).join(' | ');
    ok('R2-baseline-lets-expire', beatOf(Game) == null && /silence answered/i.test(notes),
      'beat expired unanswered; engine said the silence answered');
    const expiries = watch.events.filter(event => event.id === 'link_testR' && event.chosen === false);
    ok('R2-one-real-expiry', expiries.length === 1 && expiries[0].result === 'lapsed', JSON.stringify(expiries));
    ok('R2-expiry-costs-6', expiries.length === 1 && expiries[0].delta === -6, JSON.stringify(expiries));
    ok('R2-expiry-not-before-seven-days', expiries.length === 1 && expiries[0].age >= 7, JSON.stringify(expiries));
    ok('R2-no-answer-attempted', !watch.answers.some(row => row.id === 'link_testR'), JSON.stringify(watch.answers));
    console.log('   event receipt ' + JSON.stringify({ stagedTrust: 16, netTrust: trustOf(Game), expiries,
      history: Game.mshipState().links.find(link => link.id === 'link_testR').history }));
    ok('R2-no-answer-fired', !/met grief with grain|speaker rode out/i.test(notes), 'no answer fiction — leadcourt never clicked it');
  }

  // ---- GREEN G1..G4: only when the layer exists; info-skip after the kill ----
  if (!layerPresent) {
    console.log('info SKIP G1-G4: layer deleted per kill protocol (armed-phase results preserved in the evidence file)');
  } else {
  const on = renegansMod;
  ok('G1-gate-on-differs', on.renegans !== fourthlink, 'gated policy is a distinct object');
  ok('G1-desc-names-beats', /renegotiation/i.test(on.renegans.desc || ''), on.renegans.desc);

  // ---- GREEN G2: the layer answers a REAL staged beat with grain ----
  {
    const { Game } = await buildLink({ trust: 24 });
    Game.successionCrisis('link_testR');
    Game.state.scholar.day = 11; pinPantry(Game, 15000);
    const ctx = {};
    renegotiationAnswers(Game, ctx);
    const notes = renegNotes(Game).join(' | ');
    ok('G2-gift-answers-beat', beatOf(Game) == null && /met grief with grain/i.test(notes),
      'beat cleared; engine narrated the gift');
    const tEnd = trustOf(Game);
    ok('G2-trust-up-8', tEnd === 24, `trust 16 -> ${tEnd} (+8 gift)`);
    ok('G2-ctx-counts', (ctx.renegansAnswered | 0) === 1, 'ctx.renegansAnswered = 1');
  }

  // ---- GREEN G3: thin pantry -> visit, no grain spent ----
  {
    const { Game } = await buildLink({ trust: 24 });
    Game.successionCrisis('link_testR');
    Game.state.scholar.day = 11; pinPantry(Game, 3000); // below the 8000 gift bar
    const before = ((Game.state.village.pantry || [])).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    const ctx = {};
    renegotiationAnswers(Game, ctx);
    const notes = renegNotes(Game).join(' | ');
    const after = ((Game.state.village.pantry || [])).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    ok('G3-visit-answers-beat', beatOf(Game) == null && /speaker rode out|word and promises/i.test(notes),
      'beat cleared via the visit path');
    ok('G3-no-grain-spent', after === before, `pantry ${before} -> ${after} (gift never fired)`);
    ok('G3-trust-moved', trustOf(Game) > 16, `trust 16 -> ${trustOf(Game)} (visit gain, honest engine pricing)`);
  }

  // ---- GREEN G4: full armed policy day on a live beat — no throw, answered ----
  {
    const { Game } = await buildLink({ trust: 24 });
    Game.successionCrisis('link_testR');
    Game.state.scholar.day = 11; pinPantry(Game, 15000);
    const ctx = {};
    let threw = null;
    try { on.renegans.daily(Game, ctx); } catch (e) { threw = e; }
    ok('G4-no-throw', !threw, threw ? String(threw).slice(0, 120) : 'armed daily ran clean');
    ok('G4-beat-answered', beatOf(Game) == null && (ctx.renegansAnswered | 0) === 1,
      'the composed policy (competent + courtship + answers) cleared the beat');
  }
  } // end else (layer present): G1-G4

  delete process.env.RENEGANS;
  console.log(`\nPROOF ${pass}/${pass} green — ${layerPresent ? 'engine baseline and available policy arm checked' : 'engine baseline checked; deleted policy arm not evaluated'}.`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
