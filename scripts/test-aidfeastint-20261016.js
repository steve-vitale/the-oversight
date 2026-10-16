#!/usr/bin/env node
// scripts/test-aidfeastint-20261016.js — PROOF for the SIM-AIDFEASTINT-B
// factorial (loop B, 2026-10-16, food-economy axis — aid×feast interaction
// diagnostic). Proves the belong-road variants and the both-cell
// composition of the rebuilt drivers (scripts/policies/aiddrain.js +
// scripts/policies/feastdrawdown.js). The lead-road wrappers are already
// pinned RED→GREEN by the kept 20261015 proof scripts; this script covers
// what they don't: the belong variants and the composed both-cell.
//
// Cells: neither (pristine road, both gates off), aid-only (AIDDRAIN=1),
// feast-only (FEASTDRAWDOWN=1 + FEASTSCALE_R13=1), both (all three gates).
// Env gates are read at CALL time by the drivers (driverOn()/armed()),
// so one process can exercise several cells by flipping process.env
// between fixture runs (fixtures are independent loadGame worlds).
//
// Usage:
//   FEASTSCALE_R13=1 node scripts/test-aidfeastint-20261016.js   # runs all phases
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
let AD = null, FD = null;
try {
  AD = require('./policies/aiddrain');
  FD = require('./policies/feastdrawdown');
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: aid/feast drivers absent (diagnostic layers deleted post-measurement); status in evidence/2026-10-16/sim-aidfeastint-b.md');
    process.exit(0);
  }
  throw e;
}
const { belongfeast, leadfeast } = require('./policies/feastscale');

const fails = [];
function check(name, cond, detail) {
  const ok = !!cond;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails.push(name);
}
function setEnv(aid, feast) {
  if (aid) process.env.AIDDRAIN = '1'; else delete process.env.AIDDRAIN;
  if (feast) process.env.FEASTDRAWDOWN = '1'; else delete process.env.FEASTDRAWDOWN;
}
function dayHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, Game.map.px, Game.map.py,
      Game.unlockedWave ? Game.unlockedWave() : 0,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
    return parts.join('|');
  } catch (e) { return 'ERR'; }
}
async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'aidfeastint-proof' });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  await runDays(Game, wrapped, { days, sampleEvery: 1 });
  return hashes;
}
function freshItem(Game, name, kcal, daysLeft) {
  const day = (Game.state.scholar || {}).day || 1;
  return { name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true, spoilDay: day + daysLeft };
}
// Overstock fixture usable by BOTH drivers: thin sub link (aid channel) +
// tribute history (feast contribution) + dusk.
async function buildBothWorld(seed) {
  const { Game } = await loadGame({ seed, mode: 'aidfeastint-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  Game.state.scholar.day = 30;
  Game.dayPart = 2; // dusk
  const v = Game.state.village;
  v.burnHistory = [24000, 23500, 24200, 23800, 24100, 23900, 24000];
  v.pantry = [freshItem(Game, 'Foraged food', 150000, 3)]; // ~6.3 fresh-days
  v.lastRaidDay = 0;
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id: 'thinval', name: 'Thinvale', pantryKcal: 1000, population: 10, day: 0, roster: [] },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  m.links.push({
    id: 'link_thin', primary: 'haven', subordinate: 'thinval',
    day: 0, trust: 30, status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [], mourningUntil: 0,
  });
  return { Game, said, ctx: { _tribHist: [{ day: 29, kcal: 2000 }] } };
}
const aidFeastBoth = AD.withAidDrain(FD.feastDrawdown, 'aidFeastBoth');
const aidFeastBothBelong = AD.withAidDrain(FD.feastBelongDrawdown, 'aidFeastBothBelong');

(async () => {
  if (process.env.FEASTSCALE_R13 !== '1') {
    console.log('FEASTSCALE_R13=1 required for this proof (the factorial road)');
    process.exit(1);
  }

  // ---------- B1: belong variants gate-off byte-identical ----------
  console.log('== B1. belong variants gate-off byte-identical (40d) ==');
  setEnv(false, false);
  for (const [wrap, base, name] of [[AD.aidBelong, belongfeast, 'aidBelong'], [FD.feastBelongDrawdown, belongfeast, 'feastBelongDrawdown']]) {
    const hW = await runHashes(wrap, 11, 40), hB = await runHashes(base, 11, 40);
    check(`B1 gate-off: ${name} == belongfeast (seed 11)`,
      hW.length === hB.length && hW.every((h, i) => h === hB[i]), `n=${hW.length}/${hB.length}`);
    const hW2 = await runHashes(wrap, 22, 40), hB2 = await runHashes(base, 22, 40);
    check(`B1 gate-off: ${name} == belongfeast (seed 22)`,
      hW2.length === hB2.length && hW2.every((h, i) => h === hB2[i]), `n=${hW2.length}/${hB2.length}`);
  }

  // ---------- B2: both-cell gate-off byte-identical ----------
  console.log('== B2. both-cell gate-off byte-identical to its road ==');
  setEnv(false, false);
  {
    const hW = await runHashes(aidFeastBoth, 11, 40), hB = await runHashes(leadfeast, 11, 40);
    check('B2 gate-off: aidFeastBoth == leadfeast (seed 11)',
      hW.length === hB.length && hW.every((h, i) => h === hB[i]), `n=${hW.length}/${hB.length}`);
    const hW2 = await runHashes(aidFeastBothBelong, 11, 40), hB2 = await runHashes(belongfeast, 11, 40);
    check('B2 gate-off: aidFeastBothBelong == belongfeast (seed 11)',
      hW2.length === hB2.length && hW2.every((h, i) => h === hB2[i]), `n=${hW2.length}/${hB2.length}`);
  }

  // ---------- B3: aid-only fires on the belong road ----------
  console.log('== B3. aid-only cell fires on the belong road ==');
  setEnv(true, false);
  {
    const { Game, said, ctx } = await buildBothWorld(61);
    AD.aidBelong.setup(Game, ctx);
    AD.aidBelong.daily(Game, ctx);
    check('B3 aid fired on belong road (adAid=1, 1500 kcal)',
      ctx.adAid === 1 && ctx.adAidKcal === 1500, `adAid=${ctx.adAid} kcal=${ctx.adAidKcal}`);
    check('B3 no feast fired (feast gate off)', ctx.fdFeasts === undefined, `fdFeasts=${ctx.fdFeasts}`);
    check('B3 cause line narrated', said.some(s => /not the rot/.test(s)));
  }

  // ---------- B4: feast-only fires on the belong road ----------
  console.log('== B4. feast-only cell fires on the belong road ==');
  setEnv(false, true);
  {
    const { Game, said, ctx } = await buildBothWorld(62);
    const before = ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    FD.feastBelongDrawdown.setup(Game, ctx);
    FD.feastBelongDrawdown.upkeep(Game, ctx);
    const after = ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    check('B4 feast fired on belong road (fdFeasts=1)', ctx.fdFeasts === 1 && (ctx.fdFeastKcal || 0) > 0,
      `fdFeasts=${ctx.fdFeasts} kcal=${ctx.fdFeastKcal}`);
    check('B4 pantry really drawn', after < before, `${before} -> ${after}`);
    check('B4 no aid fired (aid gate off)', ctx.adAid === undefined, `adAid=${ctx.adAid}`);
    check('B4 cause line narrated', said.some(s => /eats itself/.test(s)));
  }

  // ---------- B5: both-cell fires BOTH verbs, no double-feast ----------
  console.log('== B5. both-cell fires aid + feast on the same day ==');
  setEnv(true, true);
  {
    const { Game, said, ctx } = await buildBothWorld(63);
    const before = ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    aidFeastBoth.setup(Game, ctx);
    aidFeastBoth.upkeep(Game, ctx); // dusk: the driver's feast fires first
    aidFeastBoth.daily(Game, ctx);  // end of day: the driver's aid fires
    const after = ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    check('B5 feast fired in the both-cell', ctx.fdFeasts === 1, `fdFeasts=${ctx.fdFeasts}`);
    check('B5 aid fired in the both-cell', ctx.adAid === 1 && ctx.adAidKcal === 1500,
      `adAid=${ctx.adAid} kcal=${ctx.adAidKcal}`);
    check('B5 pantry drawn by both (feast ~5000 + aid 1500)',
      before - after >= 6000, `${before} -> ${after}`);
    check('B5 engine feastDay set once (no double-feast)', (Game.state.scholar || {}).feastDay === 30,
      'feastDay=' + (Game.state.scholar || {}).feastDay);
    check('B5 shared cadence untouched', ctx._fsLastFeastDay === undefined,
      '_fsLastFeastDay=' + ctx._fsLastFeastDay);
    const tendIx = said.findIndex(s => /Haven sends .* kcal of grain to Thinvale/.test(s));
    const aidCauseIx = said.findIndex(s => /not the rot/.test(s));
    const feastIx = said.findIndex(s => /🍖 FEAST/.test(s));
    const feastCauseIx = said.findIndex(s => /eats itself/.test(s));
    check('B5 both cause lines narrated after their verbs',
      tendIx >= 0 && aidCauseIx > tendIx && feastIx >= 0 && feastCauseIx > feastIx,
      `tend@${tendIx} aidCause@${aidCauseIx} feast@${feastIx} feastCause@${feastCauseIx}`);
  }

  // ---------- B6: both-cell armed determinism ----------
  console.log('== B6. both-cell armed determinism ==');
  setEnv(true, true);
  {
    const h1 = await runHashes(aidFeastBoth, 11, 40);
    const h2 = await runHashes(aidFeastBoth, 11, 40);
    check('B6 aidFeastBoth armed bit-identical across runs',
      h1.length === h2.length && h1.every((h, i) => h === h2[i]), `n=${h1.length}`);
  }

  console.log(fails.length ? `\nPROOF: ${fails.length} FAILURE(S) — ${fails.join(', ')}` : '\nPROOF: all checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
