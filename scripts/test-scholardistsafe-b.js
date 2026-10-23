#!/usr/bin/env node
// test-scholardistsafe-b.js — proof for the scholar-safe layer
// (scripts/layers/scholardistsafe-b.js, SCHOLARDISTSAFE=1).
//
// E0 unit (stubbed Game): gate-off is a noop; armed DAY-1 (burnHistory
//   empty) thin day = ZERO grants, ZERO halve, zero voice, gatedBurn=1
//   (the d1 artifact removed); burn established + scholar hungrier than
//   the hungriest mouth = full meal, no halve, no grant, gatedHunger=1
//   (ties go to the scholar); recipient hungrier than the scholar =
//   halve + grant to hungriest as REAL pantryDraw + fold-in + one
//   deterministic voice; no eligible recipient = full meal
//   (gatedNoMouth=1, never a halve-then-pool); thick day untouched;
//   empty-pantry thin day (gates pass) halves but stays silent (no phantom
//   kcal); stale gift day-guard; pickRecipient skips scholar/dead/away/
//   sub-threshold; zero Math.random; voice deterministic per (day+seed);
//   uninstall restores all four methods.
// E1 det-gate: 60d sim, SCHOLARDISTSAFE unset, install() vs not —
//   digest-identical.
// E2 sim smoke (SCHOLARDISTSAFE=1, 60d x3 seeds): completes, mechanism
//   fires, the thin-meal/gate invariant holds, zero errors.
// E3 armed 60d re-run digest-identical (deterministic).
'use strict';
const assert = require('assert');
const crypto = require('crypto');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const layer = require('./layers/scholardistsafe-b');

let passed = 0;
function ok(name, cond, extra) {
  if (!cond) { console.error('FAIL: ' + name + (extra ? ' — ' + extra : '')); process.exitCode = 1; return; }
  passed++; console.log('ok: ' + name);
}

function stubGame(opts) {
  opts = opts || {};
  const said = [];
  const drawCalls = [];
  const hunger = Object.assign({ v1: 80, v2: 50, v3: 5, s1: opts.scholarHunger !== undefined ? opts.scholarHunger : 25 }, opts.hunger || {});
  const dead = opts.dead || {};
  const village = {
    roster: opts.roster || ['s1', 'v1', 'v2', 'v3'],
    away: opts.away || {},
    burnHistory: opts.burn !== undefined ? opts.burn : [24000], // established clock by default
  };
  const g = {
    __simSeed: opts.seed || 67517,
    villagerId: 's1',
    state: { scholar: { day: opts.day || 10 }, village },
    _thin: opts.thin !== undefined ? opts.thin : true,
    _takeAll: opts.takeAll !== undefined ? opts.takeAll : true,
    _sdsHalve: false, _sdsIntent: 0, _sdsGiftVid: null,
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

const ZERO_TELE = { thinMeals: 0, halves: 0, grants: 0, grantedKcal: 0, voices: 0, errors: 0, gatedBurn: 0, gatedHunger: 0, gatedNoMouth: 0, beatLines: [] };

// ---------- E0 ----------
delete process.env.SCHOLARDISTSAFE;
{
  const g = stubGame({ thin: true });
  const orig = { m: g.villageMeal, d: g.pantryDraw, md: g.villagerMealDay, p: g.villagerDayProduction };
  const { tele, uninstall } = layer.install(g);
  ok('E0 gate-off: all four methods unwrapped',
    g.villageMeal === orig.m && g.pantryDraw === orig.d && g.villagerMealDay === orig.md && g.villagerDayProduction === orig.p);
  ok('E0 gate-off: no namespace marker', g.villageMeal._scholarDistSafe === undefined);
  ok('E0 gate-off: tele all zero', JSON.stringify(tele) === JSON.stringify(ZERO_TELE));
  ok('E0 gate-off: uninstall is noop-safe', (() => { uninstall(); return g.villageMeal === orig.m; })());
}
{
  // THE VARIANT'S CORE: day-1 thin day (burnHistory empty) — the artifact
  // fires ZERO. No halve, no grant, no voice; the meal is the full share.
  const g = withEnv({ SCHOLARDISTSAFE: '1' }, () => {
    const gg = stubGame({ thin: true, day: 1, seed: 67517, burn: [] });
    gg._layer = layer.install(gg);
    gg.villageMeal();
    return gg;
  });
  ok('E0 d1-gate: scholar want NOT halved (full 1000)', g._drawCalls.length === 1 && g._drawCalls[0].want === 1000, JSON.stringify(g._drawCalls));
  ok('E0 d1-gate: zero grants', g._layer.tele.grants === 0);
  ok('E0 d1-gate: silent (nothing happened, nothing narrated)', g._said.length === 0);
  ok('E0 d1-gate: no gift stashed', !g.state.village._sdsGift);
  ok('E0 d1-gate: tele gatedBurn=1 thinMeals=1', g._layer.tele.gatedBurn === 1 && g._layer.tele.thinMeals === 1, JSON.stringify(g._layer.tele));
}
{
  // burn established, scholar HUNGRIER than the hungriest mouth (90 vs
  // 80): the scholar-safe choice is to eat the full share — no halve,
  // no grant, no voice. Ties go to the scholar.
  const g = withEnv({ SCHOLARDISTSAFE: '1' }, () => {
    const gg = stubGame({ thin: true, day: 10, seed: 67517, burn: [24000], scholarHunger: 90,
      hunger: { v1: 80, v2: 50, v3: 5, s1: 90 } });
    gg._layer = layer.install(gg);
    gg.villageMeal();
    return gg;
  });
  ok('E0 hunger-gate: scholar want NOT halved (full 1000)', g._drawCalls.length === 1 && g._drawCalls[0].want === 1000, JSON.stringify(g._drawCalls));
  ok('E0 hunger-gate: zero grants, silent', g._layer.tele.grants === 0 && g._said.length === 0);
  ok('E0 hunger-gate: tele gatedHunger=1', g._layer.tele.gatedHunger === 1, JSON.stringify(g._layer.tele));
}
{
  // the relative rule's other side: scholar hungry (80) but the hungriest
  // mouth is hungrier (90) — "eat. You need it more than I do." fires.
  const g = withEnv({ SCHOLARDISTSAFE: '1' }, () => {
    const gg = stubGame({ thin: true, day: 10, seed: 67517, burn: [24000], scholarHunger: 80,
      hunger: { v1: 90, v2: 50, v3: 5, s1: 80 } });
    gg._layer = layer.install(gg);
    gg.villageMeal();
    return gg;
  });
  ok('E0 relative-gate: grant fires when recipient hungrier (80<90)',
    g._drawCalls[0].want === 500 && g._layer.tele.grants === 1 && g._said.length === 1,
    JSON.stringify(g._drawCalls) + ' ' + JSON.stringify(g._layer.tele));
}
{
  // burn established, scholar FED (<=30), thin day: halve + grant to
  // hungriest (v1, hunger 80), fold-in, one voice.
  const g = withEnv({ SCHOLARDISTSAFE: '1' }, () => {
    const gg = stubGame({ thin: true, day: 10, seed: 67517, burn: [24000], scholarHunger: 25 });
    gg._layer = layer.install(gg);
    gg.villageMeal();
    return gg;
  });
  ok('E0 armed thin: scholar want halved 1000->500', g._drawCalls[0].want === 500, JSON.stringify(g._drawCalls));
  ok('E0 armed thin: grant drawn at full 500 (never re-halved)', g._drawCalls[1].want === 500, JSON.stringify(g._drawCalls));
  ok('E0 armed thin: grant uses the cooked meal draw', g._drawCalls[1].cook === true);
  ok('E0 armed thin: gift stashed for hungriest v1',
    g.state.village._sdsGift && g.state.village._sdsGift.vid === 'v1' && g.state.village._sdsGift.kcal === 500 && g.state.village._sdsGift.day === 10,
    JSON.stringify(g.state.village._sdsGift));
  ok('E0 armed thin: flag cleared after meal', g._sdsHalve === false && g._sdsIntent === 0);
  ok('E0 armed thin: one voice line', g._said.length === 1, JSON.stringify(g._said));
  ok('E0 armed thin: {N} substituted with recipient name', /Wanjiru/.test(g._said[0]) && !/\{N\}/.test(g._said[0]));
  ok('E0 armed thin: first-person scholar voice', /🍽️/.test(g._said[0]) && /You /.test(g._said[0]));
  g.villagerMealDay('v1', {}, g.state.village, {});
  ok('E0 fold-in: recipient produced 400+500', g._mealProd.v1 === 900, 'saw ' + g._mealProd.v1);
  g.villagerMealDay('v2', {}, g.state.village, {});
  ok('E0 fold-in: non-recipient unaffected', g._mealProd.v2 === 400, 'saw ' + g._mealProd.v2);
  ok('E0 fold-in: gift consumed after recipient meal', g.state.village._sdsGift === null);
  const t = g._layer.tele;
  ok('E0 tele: thinMeals=1 halves=1 grants=1 grantedKcal=500 voices=1 gated*=0 errors=0',
    t.thinMeals === 1 && t.halves === 1 && t.grants === 1 && t.grantedKcal === 500 && t.voices === 1 &&
    t.gatedBurn === 0 && t.gatedHunger === 0 && t.gatedNoMouth === 0 && t.errors === 0,
    JSON.stringify(t));
}
{
  // gates pass but NO eligible mouth: full delegation — never a
  // halve-then-pool. The scholar eats; the pantry is untouched.
  const g = withEnv({ SCHOLARDISTSAFE: '1' }, () => {
    const gg = stubGame({ thin: true, day: 10, seed: 67517, burn: [24000], scholarHunger: 25,
      hunger: { v1: 5, v2: 10, v3: 15, s1: 25 } });
    gg._layer = layer.install(gg);
    gg.villageMeal();
    return gg;
  });
  ok('E0 no-mouth: scholar want NOT halved (full 1000)', g._drawCalls.length === 1 && g._drawCalls[0].want === 1000, JSON.stringify(g._drawCalls));
  ok('E0 no-mouth: zero grants, silent', g._layer.tele.grants === 0 && g._said.length === 0);
  ok('E0 no-mouth: tele gatedNoMouth=1', g._layer.tele.gatedNoMouth === 1, JSON.stringify(g._layer.tele));
}
{
  // day guard: a stale (yesterday) gift does not inject
  const g = withEnv({ SCHOLARDISTSAFE: '1' }, () => {
    const gg = stubGame({ thin: true, day: 10, seed: 67517 });
    layer.install(gg);
    gg.state.village._sdsGift = { vid: 'v1', kcal: 500, day: 9 };
    gg.villagerMealDay('v1', {}, gg.state.village, {});
    return gg;
  });
  ok('E0 day-guard: stale gift not injected', g._mealProd.v1 === 400, 'saw ' + g._mealProd.v1);
}
{
  // pickRecipient: skips scholar, dead, away, sub-threshold hunger
  const g = withEnv({ SCHOLARDISTSAFE: '1' }, () => {
    const gg = stubGame({ thin: true, hunger: { s1: 100, v1: 80, v2: 50, v3: 5 }, dead: { v1: true }, away: { v2: true } });
    return gg;
  });
  const rec = layer.pickRecipient(g, g.state.village);
  ok('E0 pick: skips dead v1 + away v2, picks nobody (v3 sub-threshold)', rec === null, JSON.stringify(rec));
  const g2 = withEnv({ SCHOLARDISTSAFE: '1' }, () => stubGame({ thin: true, hunger: { v1: 30, v2: 90, v3: 90 } }));
  const rec2 = layer.pickRecipient(g2, g2.state.village);
  ok('E0 pick: hungriest wins, roster-order tiebreak', rec2 && rec2.vid === 'v2', JSON.stringify(rec2));
}
{
  // gate helpers: burnEstablished / scholarHungerOk on the stubs
  const g1 = stubGame({ burn: [] });
  const g2 = stubGame({ burn: [24000] });
  ok('E0 burnEstablished: empty=false, [24000]=true', layer.burnEstablished(g1) === false && layer.burnEstablished(g2) === true);
  const h1 = stubGame({ scholarHunger: 25, hunger: { v1: 80, s1: 25 } });
  const h2 = stubGame({ scholarHunger: 80, hunger: { v1: 80, s1: 80 } });
  const h3 = stubGame({ scholarHunger: 80, hunger: { v1: 90, s1: 80 } });
  ok('E0 scholarHungrierThan: 25>=80 false, 80>=80 true (tie->scholar), 80>=90 false',
    layer.scholarHungrierThan(h1, 80) === false && layer.scholarHungrierThan(h2, 80) === true && layer.scholarHungrierThan(h3, 90) === false);
}
{
  // armed, thick day: untouched
  const g = withEnv({ SCHOLARDISTSAFE: '1' }, () => {
    const gg = stubGame({ thin: false, day: 10, seed: 67517 });
    gg._layer = layer.install(gg);
    gg.villageMeal();
    return gg;
  });
  ok('E0 armed thick: want untouched', g._drawCalls.length === 1 && g._drawCalls[0].want === 1000, JSON.stringify(g._drawCalls));
  ok('E0 armed thick: silent, no gift', g._said.length === 0 && !g.state.village._sdsGift);
}
{
  // armed, thin day (gates pass), EMPTY pantry: halves the intent, grant
  // takes 0 -> silent, no gift (no phantom kcal)
  const g = withEnv({ SCHOLARDISTSAFE: '1' }, () => {
    const gg = stubGame({ thin: true, day: 10, seed: 67517, burn: [24000], scholarHunger: 25, takeAll: false });
    gg._layer = layer.install(gg);
    gg.villageMeal();
    return gg;
  });
  ok('E0 armed thin empty: intent still halved', g._drawCalls[0].want === 500);
  ok('E0 armed thin empty: no gift stashed (no phantom kcal)', !g.state.village._sdsGift);
  ok('E0 armed thin empty: no voice on empty bin', g._said.length === 0);
  ok('E0 armed thin empty: tele grants=0', g._layer.tele.grants === 0);
}
{
  // armed: no Math.random consumed by the layer
  let rngCalls = 0;
  const realRandom = Math.random;
  Math.random = function () { rngCalls++; return realRandom(); };
  try {
    withEnv({ SCHOLARDISTSAFE: '1' }, () => {
      const gg = stubGame({ thin: true, day: 10, seed: 67517, burn: [24000], scholarHunger: 25 });
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
  const pick = (seed, day) => withEnv({ SCHOLARDISTSAFE: '1' }, () => {
    const gg = stubGame({ thin: true, day, seed, burn: [24000], scholarHunger: 25 });
    layer.install(gg);
    gg.villageMeal();
    return gg._said[0];
  });
  ok('E0 armed: voice deterministic same seed+day', pick(67517, 33) === pick(67517, 33));
  ok('E0 armed: voice varies across days', pick(67517, 33) !== pick(67517, 34),
    'lines repeat only by (day+seed)%5 — the anti-repetition check');
}
{
  // armed: uninstall restores all four originals
  const g = withEnv({ SCHOLARDISTSAFE: '1' }, () => {
    const gg = stubGame({ thin: true });
    const orig = { m: gg.villageMeal, d: gg.pantryDraw, md: gg.villagerMealDay, p: gg.villagerDayProduction };
    const { uninstall } = layer.install(gg);
    const marked = gg.villageMeal._scholarDistSafe === 'SCHOLARDISTSAFE_B' && gg.pantryDraw._scholarDistSafe === 'SCHOLARDISTSAFE_B' &&
      gg.villagerMealDay._scholarDistSafe === 'SCHOLARDISTSAFE_B' && gg.villagerDayProduction._scholarDistSafe === 'SCHOLARDISTSAFE_B';
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
  const { Game, manifest } = await loadGame({ seed: opts.seed, mode: 'scholardistsafe-proof' });
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
  const seed = 67517;
  // Substrate fidelity (the deathcause-b / scholarbowl-b / scholardist
  // pilot / confirm substrate): FEASTSCALE_R13=1 / SEATDRIVE=0 for all sim
  // proofs.
  const prevSub = { FEASTSCALE_R13: process.env.FEASTSCALE_R13, SEATDRIVE: process.env.SEATDRIVE };
  process.env.FEASTSCALE_R13 = '1'; process.env.SEATDRIVE = '0';
  try {
    // E1: gate-off det — install() called vs never installed, SCHOLARDISTSAFE unset
    delete process.env.SCHOLARDISTSAFE;
    const a = await simDigest({ seed, installLayer: false });
    const b = await simDigest({ seed, installLayer: true });
    ok('E1 det-gate: gate-off install is digest-identical', a.digest === b.digest,
      'no-install=' + a.digest + ' install=' + b.digest + ' ' + JSON.stringify(a.snap));

    // E2: armed smoke across 3 fresh seeds — mechanism fires in the wild,
    // the thin-meal/gate invariant holds on every seed, zero errors.
    process.env.SCHOLARDISTSAFE = '1';
    const agg = { thinMeals: 0, halves: 0, grants: 0, grantedKcal: 0, voices: 0, errors: 0, gatedBurn: 0, gatedHunger: 0, gatedNoMouth: 0 };
    for (const s of [67517, 67518, 67519]) {
      const r = await simDigest({ seed: s, installLayer: true });
      const t = r.tele;
      for (const k of Object.keys(agg)) agg[k] += t[k] || 0;
      ok(`E2 wild s${s}: thinMeals === halves+gatedBurn+gatedHunger+gatedNoMouth`,
        t.thinMeals === t.halves + t.gatedBurn + t.gatedHunger + t.gatedNoMouth, JSON.stringify(t));
      ok(`E2 wild s${s}: sim completes`, r.snap.day > 30, 'day=' + r.snap.day);
    }
    delete process.env.SCHOLARDISTSAFE;
    ok('E2 wild: thin meals seen', agg.thinMeals > 0, JSON.stringify(agg));
    ok('E2 wild: halves applied', agg.halves > 0, JSON.stringify(agg));
    ok('E2 wild: grants fired', agg.grants > 0, JSON.stringify(agg));
    ok('E2 wild: granted kcal > 0', agg.grantedKcal > 0, JSON.stringify(agg));
    ok('E2 wild: voices fired', agg.voices > 0, JSON.stringify(agg));
    ok('E2 wild: zero layer errors', agg.errors === 0, JSON.stringify(agg));
    console.log('E2 wild: gate census (thinMeals=' + agg.thinMeals + ' gatedBurn=' + agg.gatedBurn +
      ' gatedHunger=' + agg.gatedHunger + ' gatedNoMouth=' + agg.gatedNoMouth + ' grants=' + agg.grants + ')');

    // E3: armed determinism — re-run digest-identical
    process.env.SCHOLARDISTSAFE = '1';
    const c = await simDigest({ seed, installLayer: true });
    const d = await simDigest({ seed, installLayer: true });
    delete process.env.SCHOLARDISTSAFE;
    ok('E3 armed det: digest-identical re-run', c.digest === d.digest,
      c.digest + ' vs ' + d.digest);
    ok('E3 armed det: tele-identical re-run',
      JSON.stringify({ ...c.tele, beatLines: c.tele.beatLines.length }) === JSON.stringify({ ...d.tele, beatLines: d.tele.beatLines.length }));

    console.log('\n' + passed + ' checks passed' + (process.exitCode ? ' (WITH FAILURES)' : ' — ALL GREEN'));
  } finally {
    if (prevSub.FEASTSCALE_R13 === undefined) delete process.env.FEASTSCALE_R13; else process.env.FEASTSCALE_R13 = prevSub.FEASTSCALE_R13;
    if (prevSub.SEATDRIVE === undefined) delete process.env.SEATDRIVE; else process.env.SEATDRIVE = prevSub.SEATDRIVE;
  }
})().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exitCode = 1; });
