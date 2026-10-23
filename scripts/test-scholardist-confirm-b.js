#!/usr/bin/env node
// test-scholardist-confirm-b.js — proof for the scholar's share layer
// (scripts/layers/scholardist-b.js, SCHOLARDIST=1) on the CONFIRM r2 base
// (seeds 92801-92816, anchor 30b6ad6e3). A CONFIRM run is not a redesign —
// the layer is already on master; this proof re-verifies it on the moved
// base BEFORE the r2 sweep (choke-point drift exclusion).
//
// E0 unit (stubbed Game): gate-off is a noop (unwrapped, tele zero,
//   uninstall noop-safe); armed thin-day halves the scholar's draw intent
//   1000->500, draws the conserved half as REAL pantry items at full 500
//   for the hungriest villager, stashes the gift, folds it into the
//   recipient's meal via the day-guarded produced-injection (consumed
//   after), voices once/day first-person scholar with {N} substituted,
//   deterministic (day+seed)%5, zero Math.random, thick day untouched and
//   silent, empty-pantry thin day halves but grants nothing (no phantom
//   kcal) and stays silent, uninstall restores all four.
// E1 det-gate: 60d sim, SCHOLARDIST unset, install() called vs never
//   installed — digest-identical (gate-off byte-identity on the new base).
// E2 sim smoke (SCHOLARDIST=1, 60d, FRESH seed 92801): completes, mechanism
//   fires (thinMeals/halves/grants/grantedKcal/voices > 0), 0 errors.
// E3 armed 60d re-run digest-identical (deterministic).
'use strict';
const assert = require('assert');
const crypto = require('crypto');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const layer = require('./layers/scholardist-b');

let passed = 0;
function ok(name, cond, extra) {
  if (!cond) { console.error('FAIL: ' + name + (extra ? ' — ' + extra : '')); process.exitCode = 1; return; }
  passed++; console.log('ok: ' + name);
}

function stubGame(opts) {
  opts = opts || {};
  const said = [];
  const drawCalls = [];
  const hunger = opts.hunger || { v1: 80, v2: 50, v3: 5 };
  const dead = opts.dead || {};
  const village = {
    roster: opts.roster || ['s1', 'v1', 'v2', 'v3'],
    away: opts.away || {},
  };
  const g = {
    __simSeed: opts.seed || 92801,
    villagerId: 's1',
    state: { scholar: { day: opts.day || 10 }, village },
    _thin: opts.thin !== undefined ? opts.thin : true,
    _takeAll: opts.takeAll !== undefined ? opts.takeAll : true,
    _sbHalve: false, _sdHalve: false, _sdIntent: 0, _sdGiftVid: null,
    say(s) { said.push(s); },
    tele() {},
    pantryFreshDays() { return this._thin ? 1.5 : 5.0; },
    freshExposure() { return {}; },
    _drawCalls: drawCalls,
    pantryDraw(v, want, o) {
      drawCalls.push({ want, cook: !!(o && o.cook) });
      return { taken: this._takeAll ? want : 0, items: [] };
    },
    villageMeal() { this.pantryDraw({}, 1000, {}); return 'meal'; },
    _mealProd: {},
    villagerDayProduction(person, vid, v) { return 400; },
    villagerMealDay(vid, person, v, ctx) {
      const produced = this.villagerDayProduction(person, vid, v);
      this._mealProd[vid] = produced;
      return { ate: produced };
    },
    npcNeeds(vid) { return { hunger: hunger[vid] || 0 }; },
    vpOf(vid) { return dead[vid] ? { dead: true } : { dead: false, name: vid }; },
    npcName(vid) { return { v1: 'Wanjiru', v2: 'Devon', v3: 'Onni' }[vid] || 'Someone'; },
    displayName(vid) { return vid; },
  };
  g._said = said;
  return g;
}

function withEnv(env, fn) {
  const prev = {};
  for (const k of Object.keys(env)) { prev[k] = process.env[k]; process.env[k] = env[k]; }
  try { return fn(); }
  finally {
    for (const k of Object.keys(env)) {
      if (prev[k] === undefined) delete process.env[k]; else process.env[k] = prev[k];
    }
  }
}

const ZERO_TELE = { thinMeals: 0, halves: 0, grants: 0, grantedKcal: 0, voices: 0, errors: 0, beatLines: [] };

// ---------- E0 ----------
delete process.env.SCHOLARDIST;
{
  const g = stubGame({ thin: true });
  const orig = { m: g.villageMeal, d: g.pantryDraw, md: g.villagerMealDay, p: g.villagerDayProduction };
  const { tele, uninstall } = layer.install(g);
  ok('E0 gate-off: all four methods unwrapped',
    g.villageMeal === orig.m && g.pantryDraw === orig.d && g.villagerMealDay === orig.md && g.villagerDayProduction === orig.p);
  ok('E0 gate-off: no namespace marker', g.villageMeal._scholarDist === undefined);
  ok('E0 gate-off: tele all zero', JSON.stringify(tele) === JSON.stringify(ZERO_TELE));
  ok('E0 gate-off: uninstall is noop-safe', (() => { uninstall(); return g.villageMeal === orig.m; })());
}
{
  // armed, thin day with food: halve + grant to hungriest (v1, hunger 80)
  const g = withEnv({ SCHOLARDIST: '1' }, () => {
    const gg = stubGame({ thin: true, day: 10, seed: 92801 });
    gg._layer = layer.install(gg);
    gg.villageMeal();
    return gg;
  });
  ok('E0 armed thin: scholar want halved 1000->500', g._drawCalls[0].want === 500, JSON.stringify(g._drawCalls));
  ok('E0 armed thin: grant drawn at full 500 (never re-halved)', g._drawCalls[1].want === 500, JSON.stringify(g._drawCalls));
  ok('E0 armed thin: grant uses the cooked meal draw', g._drawCalls[1].cook === true);
  ok('E0 armed thin: gift stashed for hungriest v1',
    g.state.village._sdGift && g.state.village._sdGift.vid === 'v1' && g.state.village._sdGift.kcal === 500 && g.state.village._sdGift.day === 10,
    JSON.stringify(g.state.village._sdGift));
  ok('E0 armed thin: flag cleared after meal', g._sdHalve === false && g._sdIntent === 0);
  ok('E0 armed thin: one voice line', g._said.length === 1, JSON.stringify(g._said));
  ok('E0 armed thin: {N} substituted with recipient name', /Wanjiru/.test(g._said[0]) && !/\{N\}/.test(g._said[0]));
  ok('E0 armed thin: first-person scholar voice', /🍽️/.test(g._said[0]) && /You /.test(g._said[0]));
  g.villagerMealDay('v1', {}, g.state.village, {});
  ok('E0 fold-in: recipient produced 400+500', g._mealProd.v1 === 900, 'saw ' + g._mealProd.v1);
  g.villagerMealDay('v2', {}, g.state.village, {});
  ok('E0 fold-in: non-recipient unaffected', g._mealProd.v2 === 400, 'saw ' + g._mealProd.v2);
  ok('E0 fold-in: gift consumed after recipient meal', g.state.village._sdGift === null);
  const t = g._layer.tele;
  ok('E0 tele: thinMeals=1 halves=1 grants=1 grantedKcal=500 voices=1 errors=0',
    t.thinMeals === 1 && t.halves === 1 && t.grants === 1 && t.grantedKcal === 500 && t.voices === 1 && t.errors === 0,
    JSON.stringify(t));
}
{
  // day guard: a stale (yesterday) gift does not inject
  const g = withEnv({ SCHOLARDIST: '1' }, () => {
    const gg = stubGame({ thin: true, day: 10, seed: 92801 });
    layer.install(gg);
    gg.state.village._sdGift = { vid: 'v1', kcal: 500, day: 9 };
    gg.villagerMealDay('v1', {}, gg.state.village, {});
    return gg;
  });
  ok('E0 day-guard: stale gift not injected', g._mealProd.v1 === 400, 'saw ' + g._mealProd.v1);
}
{
  // pickRecipient: skips scholar, dead, away, sub-threshold hunger
  const g = withEnv({ SCHOLARDIST: '1' }, () => {
    const gg = stubGame({ thin: true, hunger: { s1: 100, v1: 80, v2: 50, v3: 5 }, dead: { v1: true }, away: { v2: true } });
    return gg;
  });
  const rec = layer.pickRecipient(g, g.state.village);
  ok('E0 pick: skips dead v1 + away v2, picks nobody (v3 sub-threshold)', rec === null, JSON.stringify(rec));
  const g2 = withEnv({ SCHOLARDIST: '1' }, () => stubGame({ thin: true, hunger: { v1: 30, v2: 90, v3: 90 } }));
  const rec2 = layer.pickRecipient(g2, g2.state.village);
  ok('E0 pick: hungriest wins, roster-order tiebreak', rec2 && rec2.vid === 'v2', JSON.stringify(rec2));
}
{
  // armed, thick day: untouched
  const g = withEnv({ SCHOLARDIST: '1' }, () => {
    const gg = stubGame({ thin: false, day: 10, seed: 92801 });
    gg._layer = layer.install(gg);
    gg.villageMeal();
    return gg;
  });
  ok('E0 armed thick: want untouched', g._drawCalls.length === 1 && g._drawCalls[0].want === 1000, JSON.stringify(g._drawCalls));
  ok('E0 armed thick: silent, no gift', g._said.length === 0 && !g.state.village._sdGift);
}
{
  // armed, thin day, EMPTY pantry: halves the intent, grant takes 0 -> silent, no gift
  const g = withEnv({ SCHOLARDIST: '1' }, () => {
    const gg = stubGame({ thin: true, day: 10, seed: 92801, takeAll: false });
    gg._layer = layer.install(gg);
    gg.villageMeal();
    return gg;
  });
  ok('E0 armed thin empty: intent still halved', g._drawCalls[0].want === 500);
  ok('E0 armed thin empty: no gift stashed (no phantom kcal)', !g.state.village._sdGift);
  ok('E0 armed thin empty: no voice on empty bin', g._said.length === 0);
  ok('E0 armed thin empty: tele grants=0', g._layer.tele.grants === 0);
}
{
  // armed: no Math.random consumed by the layer
  let rngCalls = 0;
  const realRandom = Math.random;
  Math.random = function () { rngCalls++; return realRandom(); };
  try {
    withEnv({ SCHOLARDIST: '1' }, () => {
      const gg = stubGame({ thin: true, day: 10, seed: 92801 });
      layer.install(gg);
      gg.villageMeal();
      layer.pickRecipient(gg, gg.state.village);
      gg.villagerMealDay('v1', {}, gg.state.village, {});
    });
  } finally { Math.random = realRandom; }
  ok('E0 armed: layer consumes zero Math.random', rngCalls === 0, 'calls=' + rngCalls);
}
{
  // armed: deterministic voice across installs (same day+seed -> same line)
  const pick = (seed, day) => withEnv({ SCHOLARDIST: '1' }, () => {
    const gg = stubGame({ thin: true, day, seed });
    layer.install(gg);
    gg.villageMeal();
    return gg._said[0];
  });
  ok('E0 armed: voice deterministic same seed+day', pick(92801, 33) === pick(92801, 33));
  ok('E0 armed: voice varies across days', pick(92801, 33) !== pick(92801, 34),
    'lines repeat only by (day+seed)%5 — the anti-repetition check');
}
{
  // armed: uninstall restores all four originals
  const g = withEnv({ SCHOLARDIST: '1' }, () => {
    const gg = stubGame({ thin: true });
    const orig = { m: gg.villageMeal, d: gg.pantryDraw, md: gg.villagerMealDay, p: gg.villagerDayProduction };
    const { uninstall } = layer.install(gg);
    const marked = gg.villageMeal._scholarDist === 'SCHOLARDIST_B' && gg.pantryDraw._scholarDist === 'SCHOLARDIST_B' &&
      gg.villagerMealDay._scholarDist === 'SCHOLARDIST_B' && gg.villagerDayProduction._scholarDist === 'SCHOLARDIST_B';
    uninstall();
    return { gg, orig, marked };
  });
  ok('E0 armed: namespace markers while installed', g.marked);
  ok('E0 armed: uninstall restores all four',
    g.gg.villageMeal === g.orig.m && g.gg.pantryDraw === g.orig.d &&
    g.gg.villagerMealDay === g.orig.md && g.gg.villagerDayProduction === g.orig.p);
}

// ---------- E1/E2/E3: sim proofs ----------
async function simDigest(opts) {
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { leadfeast } = require('./policies/feastscale');
  const { Game, manifest } = await loadGame({ seed: opts.seed, mode: 'scholardist-confirm-r2-proof' });
  await setupGame(Game, 'Columbus, Ohio');
  let tele = null, uninstall = null;
  if (opts.installLayer) {
    const r = layer.install(Game);
    tele = r.tele; uninstall = r.uninstall;
  }
  const result = await runDays(Game, leadfeast, { days: 60, manifest });
  if (uninstall) uninstall();
  const snap = {
    day: Game.state.scholar.day,
    kcal: Math.round(Game.state.scholar.kcal || 0),
    pantry: Math.round(((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)),
    roster: ((Game.state.village || {}).roster || []).slice().sort().join(','),
    trust: Math.round((Game.state.village.trust || {})[Game.villagerId] || 0),
    deaths: (result.samples.deaths || []).length,
  };
  const digest = crypto.createHash('sha256').update(JSON.stringify(snap)).digest('hex').slice(0, 16);
  return { digest, snap, tele, deaths: result.samples.deaths };
}

(async () => {
  const { execSync } = require('child_process');
  const anchor = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
  const seed = 92801; // FRESH confirm-r2 seed (filename-criterion verified, never used)
  // Substrate fidelity (the pilot substrate): FEASTSCALE_R13=1 / SEATDRIVE=0.
  const prevSub = { FEASTSCALE_R13: process.env.FEASTSCALE_R13, SEATDRIVE: process.env.SEATDRIVE };
  process.env.FEASTSCALE_R13 = '1'; process.env.SEATDRIVE = '0';
  try {
    ok('base: anchor matches confirm-r2 base 30b6ad6e3', anchor === '30b6ad6e3', 'saw ' + anchor);

    // E1: gate-off det — install() called vs never installed, SCHOLARDIST unset
    delete process.env.SCHOLARDIST;
    const a = await simDigest({ seed, installLayer: false });
    const b = await simDigest({ seed, installLayer: true });
    ok('E1 det-gate: gate-off install is digest-identical', a.digest === b.digest,
      'no-install=' + a.digest + ' install=' + b.digest + ' ' + JSON.stringify(a.snap));

    // E2: armed smoke — mechanism fires, zero errors.
    process.env.SCHOLARDIST = '1';
    const c = await simDigest({ seed, installLayer: true });
    delete process.env.SCHOLARDIST;
    ok('E2 armed smoke: sim completes', c.snap.day > 30, 'day=' + c.snap.day);
    ok('E2 armed smoke: thin meals seen', c.tele.thinMeals > 0, JSON.stringify(c.tele));
    ok('E2 armed smoke: halves applied', c.tele.halves > 0, JSON.stringify(c.tele));
    ok('E2 armed smoke: grants fired', c.tele.grants > 0, JSON.stringify(c.tele));
    ok('E2 armed smoke: granted kcal > 0', c.tele.grantedKcal > 0, JSON.stringify(c.tele));
    ok('E2 armed smoke: voices fired', c.tele.voices > 0, JSON.stringify(c.tele));
    ok('E2 armed smoke: zero layer errors', c.tele.errors === 0, JSON.stringify(c.tele));

    // E3: armed determinism — re-run digest-identical
    process.env.SCHOLARDIST = '1';
    const d = await simDigest({ seed, installLayer: true });
    delete process.env.SCHOLARDIST;
    ok('E3 armed det: digest-identical re-run', c.digest === d.digest,
      c.digest + ' vs ' + d.digest);
    ok('E3 armed det: tele-identical re-run',
      JSON.stringify({ ...c.tele, beatLines: c.tele.beatLines.length }) === JSON.stringify({ ...d.tele, beatLines: d.tele.beatLines.length }));

    console.log('\n' + passed + ' checks passed' + (process.exitCode ? ' (WITH FAILURES)' : ' — ALL GREEN') + ' [anchor ' + anchor + ']');
  } finally {
    if (prevSub.FEASTSCALE_R13 === undefined) delete process.env.FEASTSCALE_R13; else process.env.FEASTSCALE_R13 = prevSub.FEASTSCALE_R13;
    if (prevSub.SEATDRIVE === undefined) delete process.env.SEATDRIVE; else process.env.SEATDRIVE = prevSub.SEATDRIVE;
  }
})().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exitCode = 1; });
