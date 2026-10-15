#!/usr/bin/env node
// scripts/test-windefer-20261015.js — proof for the windefer layer
// (sim-findings #310, deferral-window discipline, 2026-10-15).
//
// Substrate contract (#312 lesson — asserted up front, fail loudly):
// FEASTSCALE_R13=1 (the table road) and WINPURSUIT=1 (the drain this layer
// wraps) must be set; the proof sets them itself so it can never test
// nothing.
//
// RED (the gap, on shipped code): with WINDEFER unset the wrapper
// delegates byte-identically (30d day-hashes identical to the unwrapped
// feastscale policy) — the layer changes nothing when off. The decision
// RED: on a stub offer, the old behavior (winpursuit drain) answers
// immediately; shouldHoldOffer must HOLD a healthy pre-floor offer and
// WALK a sick one.
// GREEN: the decision matrix on stubs + a real 70d run (leadfeast s22 —
// the table sits ~d47 there) with the decision log asserted.
// HONESTY: layerOn() reads the env exactly; SMOKE=1 fails loudly if the
// suite ever runs policy-less (policy id asserted).
//
// Usage: node scripts/test-windefer-20261015.js
//        SMOKE=1 node scripts/test-windefer-20261015.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.WINPURSUIT = '1';
for (const k of ['FEASTSCALE_R13', 'WINPURSUIT']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
const WD = require('./policies/windefer');
const WP = require('./policies/winpursuit');
const FS = require('./policies/feastscale');

let pass = 0, fail = 0;
const fails = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; fails.push(name); console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function smokeId(policy, expected) {
  const ok = policy && policy.id === expected;
  if (process.env.SMOKE === '1' && !ok) {
    console.error(`SMOKE FAIL: expected policy id ${expected}, got ${(policy && policy.id) || 'none'} (suite ran policy-less)`);
    process.exit(1);
  }
  return ok;
}

// Minimal stub Game for the decision matrix. Uses the REAL read path:
// village.health[vid] (0-100) for wounds, scholar.health for the scholar,
// village.sick[vid].daysLeft for disease.
function stubGame(o) {
  o = o || {};
  const roster = [];
  const persons = {};
  const sick = {};
  const health = {};
  const n = o.pop == null ? 12 : o.pop;
  for (let i = 0; i < n; i++) {
    const vid = 'v' + i;
    roster.push(vid);
    persons[vid] = { dead: false };
    health[vid] = 100;
  }
  for (const i of (o.sickIdx || [])) sick['v' + i] = { daysLeft: 10 };
  for (const i of (o.woundedIdx || [])) health['v' + i] = 40;
  const scholarSick = !!o.scholarSick;
  if (scholarSick) sick.scholar1 = { daysLeft: 10 };
  roster.push('scholar1');
  persons.scholar1 = { dead: false };
  const scholarHealth = o.scholarHpFrac == null ? 100 : Math.round(100 * o.scholarHpFrac);
  health.scholar1 = scholarHealth;
  const scholar = {
    day: o.day == null ? 60 : o.day,
    health: scholarHealth,
    tableChoices: o.noModal ? null : {
      frame: 'the Table',
      options: (o.options || ['feared', 'beloved']).map(id => ({ id: 'path:' + id, label: 'Walk ' + id })),
    },
  };
  return {
    state: { scholar, village: { roster, sick, health } },
    villagerId: 'scholar1',
    getPerson: vid => persons[vid] || null,
    pantryFreshDays: () => (o.freshDays == null ? 40 : o.freshDays),
    tableState: () => ({ phase: o.phase == null ? 'paths' : o.phase, path: o.path || null }),
  };
}

(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');

  async function runWith(policy, seed, days) {
    const { Game } = await loadGame({ seed, mode: 'windefer-proof', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    let runCtx = null;
    const wrapped = Object.assign({}, policy);
    const base = policy.daily;
    wrapped.daily = (G, ctx) => { hs.push(G.state.scholar.day + ':' + dayHash(G)); return base ? base(G, ctx) : undefined; };
    const oSetup = policy.setup;
    wrapped.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
    await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 30 }); });
    return { hs, runCtx, won: !!Game.won, Game };
  }

  console.log('RED — gate-off purity (the layer changes nothing when off)');
  delete process.env.WINDEFER;
  check('layerOn false when unset', WD.layerOn() === false);
  check('SMOKE id: armed policy named', smokeId(WD.leaddefer, 'leadfeast-windefer'));
  {
    const a = await runWith(FS.leadfeast, 11, 30);
    const b = await runWith(WD.leaddefer, 11, 30);
    const same = a.hs.length === b.hs.length && a.hs.every((h, i) => h === b.hs[i]);
    check('gate-off byte-identical to unwrapped (30d)', same, `lengths ${a.hs.length}/${b.hs.length}`);
  }

  console.log('DECISION MATRIX — shouldHoldOffer on stubs (the walk-now-vs-defer discipline)');
  {
    const g = stubGame({ day: 60, freshDays: 40 }); // window 30d, pantry 40d, all healthy
    const d = WD.shouldHoldOffer(g);
    check('healthy pre-floor offer → HOLD (defer-survivable)', d.hold === true && d.reason === 'defer-survivable',
      `hold=${d.hold} reason=${d.reason}`);
    check('estimator: window=30 survivable', d.L && d.L.window === 30 && d.L.survivable === true);
  }
  {
    const g = stubGame({ day: 60, freshDays: 40, sickIdx: [0] });
    const d = WD.shouldHoldOffer(g);
    check('sick villager → WALK NOW', d.hold === false && d.reason === 'walk-now', `hold=${d.hold} reason=${d.reason} why=${d.L && d.L.why.join('|')}`);
  }
  {
    const g = stubGame({ day: 60, freshDays: 40, woundedIdx: [0, 1] });
    const d = WD.shouldHoldOffer(g);
    check('2 wounded → WALK NOW', d.hold === false && d.reason === 'walk-now', `wounded=${d.L && d.L.wounded}`);
  }
  {
    const g = stubGame({ day: 60, freshDays: 10 }); // window 30d, pantry 10d
    const d = WD.shouldHoldOffer(g);
    check('thin pantry → WALK NOW', d.hold === false && d.reason === 'walk-now', `fresh=${d.L && d.L.freshDays} window=${d.L && d.L.window}`);
  }
  {
    const g = stubGame({ day: 60, freshDays: 40, scholarSick: true });
    const d = WD.shouldHoldOffer(g);
    check('scholar sick → WALK NOW', d.hold === false && d.reason === 'walk-now', `why=${d.L && d.L.why.join('|')}`);
  }
  {
    const g = stubGame({ day: 60, freshDays: 40, scholarHpFrac: 0.3 });
    const d = WD.shouldHoldOffer(g);
    check('scholar hurt → WALK NOW', d.hold === false && d.reason === 'walk-now', `hpFrac=${d.L && d.L.scholarHpFrac}`);
  }
  {
    const g = stubGame({ day: 95, freshDays: 40 });
    const d = WD.shouldHoldOffer(g);
    check('floor met (d95) → never hold', d.hold === false && d.reason === 'floor-met', `reason=${d.reason}`);
  }
  {
    // Mid-challenge modal (finals): must drain, never stall.
    const g = stubGame({ day: 60, freshDays: 40, phase: 'challenge', path: 'feared',
      options: undefined });
    g.state.scholar.tableChoices = { frame: 'the Table', options: [{ id: 'final:mercy', label: 'Show mercy' }] };
    const d = WD.shouldHoldOffer(g);
    check('mid-challenge modal → never hold', d.hold === false, `reason=${d.reason}`);
  }
  {
    const g = stubGame({ day: 60, freshDays: 40, noModal: true });
    const d = WD.shouldHoldOffer(g);
    check('no modal → no decision', d.hold === false && d.reason === 'no-offer', `reason=${d.reason}`);
  }
  {
    // Offer modal shape: only 'path:' options count as the 7-door offer.
    const g = stubGame({ day: 60, freshDays: 40 });
    g.state.scholar.tableChoices = { frame: 'the Table', options: [{ id: 'downgrade:feared', label: 'Take the smaller door' }] };
    const d = WD.shouldHoldOffer(g);
    check('downgrade modal → never hold', d.hold === false, `reason=${d.reason}`);
  }

  console.log('GREEN — real run: the layer engages honestly (leadfeast s22, 70d)');
  process.env.WINDEFER = '1';
  check('layerOn true when set', WD.layerOn() === true);
  {
    const r = await runWith(WD.leaddefer, 22, 70);
    check('SMOKE id on the run policy', smokeId(WD.leaddefer, 'leadfeast-windefer'));
    let invited = false;
    try { const pg = r.Game.progState(); invited = !!(pg.tableWaiting || pg.tableDone); } catch (e) {}
    const decs = (r.runCtx && r.runCtx._windefer && r.runCtx._windefer.decisions) || [];
    check('table was invited on s22', invited === true);
    check('offer decisions logged iff invited', !invited || decs.length > 0, `decisions=${decs.length}`);
    const wellformed = decs.every(d => typeof d.hold === 'boolean' && typeof d.reason === 'string' && d.day > 0);
    check('every decision well-formed', wellformed, `n=${decs.length}`);
    const answers = (r.runCtx && r.runCtx.tableAnswers) || 0;
    const holds = decs.filter(d => d.hold).length;
    console.log(`    (s22: decisions=${decs.length} holds=${holds} tableAnswers=${answers})`);
    for (const d of decs.slice(0, 6)) {
      console.log(`    d${d.day}: ${d.hold ? 'HOLD' : 'walk'} (${d.reason}) sick=${d.sick} wounded=${d.wounded} pantry=${d.freshDays}d window=${d.window}d — ${d.why}`);
    }
  }
  delete process.env.WINDEFER;

  console.log(`\nproof windefer: ${pass} pass, ${fail} fail${fail ? ' — FAILED: ' + fails.join(', ') : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
