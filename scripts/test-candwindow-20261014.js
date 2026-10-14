#!/usr/bin/env node
// scripts/test-candwindow-20261014.js — PROOF for the candwindow arm.
//
// Two runs:
//   node scripts/test-candwindow-20261014.js              # pristine: expect REAL RED
//   CANDWINDOW=1 node scripts/test-candwindow-20261014.js # armed: expect GREEN
//
// The test asserts the layer's ARMED behaviors on scripted scenarios. On
// pristine (gate off) they fail — the RED phase proves the behaviors come
// from the layer, not the base stack. On armed they pass — the GREEN phase.
//
// Scripted scenarios (all through _prePass, the layer's pre-stack pass):
//   R1 gate: pristine exports the inert base (id fifthlink-r26); armed exports candwindow.
//   R2 discipline fires: day=30, pantry 13000, known+unlinked candidate, no
//      pending -> COMPETENT_FEAST=0, COMPETENT_AID=0, ctx.cwDisciplineDays=1.
//   R3 restore: pantry 30000 -> toggles back to original values.
//   R4 study fires: window open, candidate within reach, pantry 15000 ->
//      ctx.cwStudies=1 (studyVillageCodex reached, not the distance refusal).
//   R5 far target: candidate >3 tiles away -> no travel, no study.
//   R6 floor: pantry 12500, window open -> layer fires NO tendLink of its own.
//   R7 day<25: no discipline (the window cannot open yet).
//   R8 no candidates: day=30, pantry 13000, nothing known+unlinked -> no discipline.
'use strict';
const ARMED = process.env.CANDWINDOW === '1';
process.env.FOURTHLINK = '1';
process.env.FIFTHLINK = '1';
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
  if (kcal > cur) v.pantry.push({ id: 'cw-rig', name: 'rig grain', kcalEach: Math.round(kcal - cur), units: 1, foodState: 'fresh' });
  else if (kcal < cur && cur > 0) {
    // draw down: strip units proportionally (rig only; prePass reads the total)
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
  const { Game } = await loadGame({ seed, mode: 'candwindow-proof' });
  await setupGame(Game);
  Game.state.scholar.day = 30;
  Game.state.pendingCounter = null;
  Game.state.pendingAccord = null;
  Game.state.pendingNational = null;
  return Game;
}

(async () => {
  console.log(`candwindow proof — ${ARMED ? 'ARMED (CANDWINDOW=1), expect GREEN' : 'PRISTINE (gate off), expect REAL RED'}`);
  const mod = require('./policies/candwindow');
  const { candwindow, _prePass } = mod;

  // R1/R2 — the armed identity assertions. On pristine they FAIL (REAL RED:
  // the layer and its mechanism are absent); on armed they pass.
  ok('R1-layer-present', candwindow.id === 'candwindow', 'id=' + candwindow.id);
  ok('R2-prepass-present', typeof _prePass === 'function', 'typeof=' + typeof _prePass);

  if (!ARMED) {
    const bad = results.filter(r => !r.ok);
    console.log(`\nRED: ${bad.length}/${results.length} failed on pristine (expected — the layer is inert; its behaviors cannot fire).`);
    process.exit(bad.length ? 1 : 0);
  }

  if (typeof _prePass !== 'function') { console.error('FATAL: armed but no prePass'); process.exit(1); }
  const origFeast = process.env.COMPETENT_FEAST, origAid = process.env.COMPETENT_AID;

  // R2 — discipline fires in the zone
  {
    const Game = await rig(11);
    const v = Game.state.otherVillages[0];
    v.rumored = true; // known, unlinked candidate
    const pk = setPantry(Game, 13000);
    const ctx = {};
    _prePass(Game, ctx);
    ok('R3-discipline', process.env.COMPETENT_FEAST === '0' && process.env.COMPETENT_AID === '0' && ctx.cwDisciplineDays === 1,
      `pk=${Math.round(pk)} feast=${process.env.COMPETENT_FEAST} aid=${process.env.COMPETENT_AID} days=${ctx.cwDisciplineDays}`);
  }
  // R3 — restore outside the zone
  {
    const Game = await rig(12);
    const v = Game.state.otherVillages[0];
    v.rumored = true;
    setPantry(Game, 30000);
    const ctx = {};
    _prePass(Game, ctx);
    ok('R4-restore', process.env.COMPETENT_FEAST === origFeast && process.env.COMPETENT_AID === origAid && !ctx.cwDisciplineDays,
      `feast=${process.env.COMPETENT_FEAST} aid=${process.env.COMPETENT_AID}`);
  }
  // R4 — study fires on a reachable candidate (window open)
  {
    const Game = await rig(13);
    const v = Game.state.otherVillages[0];
    v.rumored = true;
    v.codex = { plants: {}, techniques: {}, recipes: {}, animals: {} };
    Game.map.px = v.x; Game.map.py = v.y; // at the village
    setPantry(Game, 15000);
    const ctx = {};
    _prePass(Game, ctx);
    ok('R5-study', ctx.cwStudies === 1, `studies=${ctx.cwStudies || 0}`);
  }
  // R5 — far target: no travel, no study (cheap trips only)
  {
    const Game = await rig(14);
    const v = Game.state.otherVillages[0];
    v.rumored = true;
    v.x = 0; v.y = 0; // haven at 4,4 -> dist 8
    v.codex = { plants: {}, techniques: {}, recipes: {}, animals: {} };
    setPantry(Game, 15000);
    const ctx = {};
    _prePass(Game, ctx);
    ok('R6-far', !ctx.cwStudies && !ctx.cwTravels, `studies=${ctx.cwStudies || 0} travels=${ctx.cwTravels || 0}`);
  }
  // R6 — the layer fires no tend of its own (floor held)
  {
    const Game = await rig(15);
    const v = Game.state.otherVillages[0];
    v.rumored = true;
    setPantry(Game, 12500);
    let tends = 0;
    const orig = Game.tendLink;
    Game.tendLink = function () { tends++; return orig.apply(Game, arguments); };
    const ctx = {};
    _prePass(Game, ctx);
    ok('R7-no-own-tends', tends === 0 && ctx.cwDisciplineDays === 1, `tends=${tends} disciplineDays=${ctx.cwDisciplineDays || 0}`);
  }
  // R7 — day<25: no discipline
  {
    const Game = await rig(16);
    Game.state.scholar.day = 10;
    const v = Game.state.otherVillages[0];
    v.rumored = true;
    setPantry(Game, 13000);
    const ctx = {};
    _prePass(Game, ctx);
    ok('R8-day-gate', process.env.COMPETENT_FEAST !== '0' && !ctx.cwDisciplineDays,
      `feast=${process.env.COMPETENT_FEAST}`);
  }
  // R8 — no candidates: no discipline
  {
    const Game = await rig(17);
    setPantry(Game, 13000);
    const ctx = {};
    _prePass(Game, ctx);
    const w = require('./policies/candwindow')._probe(Game);
    ok('R9-no-cands', process.env.COMPETENT_FEAST !== '0' && !ctx.cwDisciplineDays && w.cands === 0,
      `cands=${w.cands} feast=${process.env.COMPETENT_FEAST}`);
  }
  // restore env for the process
  if (origFeast === undefined) delete process.env.COMPETENT_FEAST; else process.env.COMPETENT_FEAST = origFeast;
  if (origAid === undefined) delete process.env.COMPETENT_AID; else process.env.COMPETENT_AID = origAid;

  const bad = results.filter(r => !r.ok);
  console.log(bad.length ? `\nGREEN-FAIL: ${bad.length}/${results.length}` : `\nGREEN: all ${results.length} proof checks passed.`);
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
