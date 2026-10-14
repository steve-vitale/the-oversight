#!/usr/bin/env node
// scripts/test-proposelayer-20261014.js — PROOF for the proposelayer arm.
//
// Two runs:
//   node scripts/test-proposelayer-20261014.js              # pristine: expect REAL RED
//   PROPOSELAYER=1 node scripts/test-proposelayer-20261014.js # armed: expect GREEN
//
// RED phase: the gate is off, the export IS the pinned competent policy
// (reference-equal), and competent.js structurally contains no proposeLink
// call — the verb gap from journey-scale r3, reproduced on the fixture: the
// propose verb cannot fire because no code path invokes it.
// GREEN phase: the layer fires the REAL proposeLink on the open proposal
// window, holds every guard (day/pantry/pending/subs/candidates/cooldown),
// and delegates counter/accord/national answers to the real engine verbs.
//
// The courtship pass is invoked directly (like candwindow's _prePass) —
// running the full competent daily is unnecessary for the verb-gap proof.
'use strict';
const fs = require('fs');
const path = require('path');
const ARMED = process.env.PROPOSELAYER === '1';
const { loadGame, setupGame } = require('./sim-harness');

const results = [];
function ok(name, cond, detail) {
  results.push({ name, ok: !!cond, detail: detail || '' });
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
}

function setPantry(Game, kcal) {
  const v = Game.state.village;
  v.pantry = v.pantry || [];
  const cur = v.pantry.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  if (kcal > cur) v.pantry.push({ id: 'pl-rig', name: 'rig grain', kcalEach: Math.round(kcal - cur), units: 1, foodState: 'fresh' });
  else if (kcal < cur && cur > 0) {
    let need = cur - kcal;
    for (const it of v.pantry) {
      if (need <= 0) break;
      const k = (it.kcalEach || 0) * (it.units || 1);
      if (k <= 0) continue;
      const cut = Math.min(k, need);
      const units = it.units || 1;
      const cutUnits = Math.min(units, Math.ceil(cut / (it.kcalEach || 1)));
      it.units = units - cutUnits;
      need -= cutUnits * (it.kcalEach || 0);
    }
    v.pantry = v.pantry.filter(it => (it.units || 1) > 0);
  }
  return v.pantry.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}

async function rig(seed) {
  const { Game } = await loadGame({ seed, mode: 'proposelayer-proof' });
  await setupGame(Game);
  Game.state.scholar.day = 30;
  Game.state.pendingCounter = null;
  Game.state.pendingAccord = null;
  Game.state.pendingNational = null;
  Game.state.pendingGlobal = null;
  return Game;
}

function spyOn(Game, name) {
  const calls = [];
  const orig = Game[name];
  Game[name] = function (...a) { calls.push(a); return orig.apply(this, a); };
  return { calls, restore() { Game[name] = orig; } };
}

(async () => {
  console.log(`proposelayer proof — ${ARMED ? 'ARMED (PROPOSELAYER=1), expect GREEN' : 'PRISTINE (gate off), expect REAL RED'}`);
  const mod = require('./policies/proposelayer');
  const { proposelayer, courtshipPass, PROPOSELAYER_ON } = mod;
  const { competent } = require('./policies/competent');

  if (!ARMED) {
    // ---- RED: the verb gap, reproduced ----
    // R1 asserts the ARMED behavior and FAILS on pristine (REAL RED): the
    // layer is inert, its behaviors cannot fire. R2/R3 are the evidence half:
    // zero fires under bare competent on the same fixture, structurally and
    // behaviorally.
    ok('R1-armed-identity', proposelayer.id === 'proposelayer' && PROPOSELAYER_ON === true,
      `id=${proposelayer.id} on=${PROPOSELAYER_ON} — the layer is inert on pristine`);
    const src = fs.readFileSync(path.join(__dirname, 'policies', 'competent.js'), 'utf8');
    ok('R2-no-propose-verb', !src.includes('proposeLink'), 'competent.js has zero proposeLink calls — no code path can form a link');
    // R3 behavioral: drive the exported (inert = competent) policy's real
    // daily on the OPEN-WINDOW fixture — the propose verb must not fire.
    const Game = await rig(11);
    Game.state.otherVillages[0].rumored = true; // known, unlinked candidate
    setPantry(Game, 13000);                    // window's pantry predicate met
    const sp = spyOn(Game, 'proposeLink');
    try { proposelayer.daily(Game, {}); } catch (e) { /* policy-internal */ }
    sp.restore();
    ok('R3-zero-fires-bare', sp.calls.length === 0, `proposeLink calls under bare competent on the open-window fixture: ${sp.calls.length}`);
    const bad = results.filter(r => !r.ok);
    console.log(`\nRED: ${bad.length}/${results.length} failed on pristine (expected — the layer is inert; the propose verb cannot fire).`);
    process.exit(bad.length ? 1 : 0);
  }

  // ---- GREEN ----
  ok('G1-armed-identity', proposelayer.id === 'proposelayer' && PROPOSELAYER_ON === true && typeof courtshipPass === 'function',
    `id=${proposelayer.id} on=${PROPOSELAYER_ON}`);

  // G2 — the propose verb fires on the open window, through the real engine
  {
    const Game = await rig(11);
    const ovs = Game.state.otherVillages;
    const v = ovs[0];
    v.rumored = true;
    const opBefore = v.opinion || 0;
    setPantry(Game, 13000);
    const sp = spyOn(Game, 'proposeLink');
    const ctx = {};
    courtshipPass(Game, ctx);
    sp.restore();
    const [tgt, opts] = sp.calls[0] || [];
    const links = Game.hierarchyState() || [];
    const formed = links.some(l => l && l.status === 'active');
    const countered = Game.state.pendingCounter != null;
    const declined = (v.courtshipDeclined != null) || ((v.opinion || 0) < opBefore);
    ok('G2-propose-fires', sp.calls.length >= 1 && ctx.plProposed === 1 &&
      tgt === v.id && opts && opts.asSubordinate === false && opts.tributeKcalPerWeek === 4000 &&
      (formed || countered || declined),
      `calls=${sp.calls.length} proposed=${ctx.plProposed} engine-adjudicated=${formed ? 'linked' : countered ? 'counter' : declined ? 'declined' : 'NONE'}`);
  }

  // G3 — 7-day per-target cooldown: same day, no second proposal
  {
    const Game = await rig(12);
    Game.state.otherVillages[0].rumored = true;
    setPantry(Game, 13000);
    const sp = spyOn(Game, 'proposeLink');
    const ctx = {};
    courtshipPass(Game, ctx);
    courtshipPass(Game, ctx);
    sp.restore();
    ok('G3-cooldown', sp.calls.length === 1 && ctx.plProposed === 1, `calls=${sp.calls.length} proposed=${ctx.plProposed}`);
  }

  // G4 — day<25: the window cannot open
  {
    const Game = await rig(13);
    Game.state.scholar.day = 20;
    Game.state.otherVillages[0].rumored = true;
    setPantry(Game, 13000);
    const sp = spyOn(Game, 'proposeLink');
    const ctx = {};
    courtshipPass(Game, ctx);
    sp.restore();
    ok('G4-day-gate', sp.calls.length === 0 && !ctx.plProposed, `calls=${sp.calls.length}`);
  }

  // G5 — pantry<=12000: the window cannot open
  {
    const Game = await rig(14);
    Game.state.otherVillages[0].rumored = true;
    setPantry(Game, 10000);
    const sp = spyOn(Game, 'proposeLink');
    const ctx = {};
    courtshipPass(Game, ctx);
    sp.restore();
    ok('G5-pantry-gate', sp.calls.length === 0 && !ctx.plProposed, `calls=${sp.calls.length}`);
  }

  // G6 — pendingCounter: no new proposal; the counter is ANSWERED (real verb)
  {
    const Game = await rig(15);
    const v = Game.state.otherVillages[0];
    v.rumored = true;
    setPantry(Game, 13000);
    Game.state.pendingCounter = { targetId: v.id, opts: { asSubordinate: false, tributeKcalPerWeek: 4000 }, asSubordinate: true, tributeKcalPerWeek: 5000, day: 30 };
    const sp = spyOn(Game, 'proposeLink');
    const ctx = {};
    courtshipPass(Game, ctx);
    sp.restore();
    const links = Game.hierarchyState() || [];
    const answered = Game.state.pendingCounter == null && ctx.plCounters === 1;
    const formedSub = links.some(l => l && l.status === 'active' && l.subordinate === 'haven');
    ok('G6-counter-answered', sp.calls.length === 0 && answered && formedSub,
      `proposeCalls=${sp.calls.length} answered=${answered} subordinate-link=${formedSub} (pantry<25000 -> accept their terms: the BELONG road, real 5000/wk cost)`);
  }

  // G7 — no known+unlinked candidates: no proposal
  {
    const Game = await rig(16);
    for (const ov of Game.state.otherVillages) { ov.rumored = false; ov.generated = false; }
    setPantry(Game, 13000);
    const sp = spyOn(Game, 'proposeLink');
    const ctx = {};
    courtshipPass(Game, ctx);
    sp.restore();
    ok('G7-no-candidates', sp.calls.length === 0 && !ctx.plProposed, `calls=${sp.calls.length}`);
  }

  // G8 — subs>=3 (base layer cap): no proposal
  {
    const Game = await rig(17);
    Game.state.otherVillages[0].rumored = true;
    setPantry(Game, 13000);
    const fakes = [1, 2, 3].map(i => ({ id: 'fake' + i, status: 'active', primary: 'haven', conquered: false, subordinate: 'v' + i }));
    const origHS = Game.hierarchyState;
    Game.hierarchyState = () => fakes;
    const sp = spyOn(Game, 'proposeLink');
    const ctx = {};
    courtshipPass(Game, ctx);
    sp.restore();
    Game.hierarchyState = origHS;
    ok('G8-subs-cap', sp.calls.length === 0 && !ctx.plProposed, `calls=${sp.calls.length} (3 haven-primary subs: window closed)`);
  }

  // G9 — tend fires on an untended primary link when the pantry can carry it
  {
    const Game = await rig(18);
    const origHS = Game.hierarchyState;
    Game.hierarchyState = () => [{ id: 'ltend', status: 'active', primary: 'haven', tendedWeek: -1, subordinate: 'vx' }];
    setPantry(Game, 25000);
    const sp = spyOn(Game, 'tendLink');
    const ctx = {};
    courtshipPass(Game, ctx);
    sp.restore();
    Game.hierarchyState = origHS;
    ok('G9-tend', sp.calls.length === 1 && sp.calls[0][0] === 'ltend' && ctx.plTended === 1,
      `tendCalls=${sp.calls.length} tended=${ctx.plTended} (real 1500 kcal grain verb)`);
  }

  // G10 — pendingAccord delegated to the real answer verb with 'gift'
  {
    const Game = await rig(19);
    Game.state.pendingAccord = { linkId: 'fake', day: 30 };
    const calls = [];
    const orig = Game.answerAccord;
    Game.answerAccord = function (how) { calls.push(how); return 'delegated'; };
    const ctx = {};
    courtshipPass(Game, ctx);
    Game.answerAccord = orig;
    ok('G10-accord', calls.length === 1 && calls[0] === 'gift' && ctx.plAccords === 1, `answerAccord(${calls.join(',')})`);
  }

  // G11 — pendingNational delegated with the LEAD pick
  {
    const Game = await rig(20);
    Game.state.pendingNational = { shape: 'lead', villages: ['vx'], day: 30 };
    const calls = [];
    const orig = Game.answerNationalChoice;
    Game.answerNationalChoice = function (how) { calls.push(how); return 'delegated'; };
    const ctx = {};
    courtshipPass(Game, ctx);
    Game.answerNationalChoice = orig;
    ok('G11-national', calls.length === 1 && calls[0] === 'feast' && ctx.plNational === 1, `answerNationalChoice(${calls.join(',')})`);
  }

  const bad = results.filter(r => !r.ok);
  console.log(`\n${bad.length ? 'RED' : 'GREEN'}: ${results.length - bad.length}/${results.length} passed${bad.length ? ' — FIX BEFORE SPEND' : ' — the layer fires the real propose verb under the window and holds its guards.'}`);
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
