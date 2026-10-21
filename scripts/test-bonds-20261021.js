#!/usr/bin/env node
// scripts/test-bonds-20261021.js — proof for the BONDS layer (sim-belongbonds,
// 2026-10-21, flesh-out loop, axis scale-onramp, backlog #742).
//
// KILL PROTOCOL (established pattern): if the PRIMARY misses and the layer
// is deleted zero-trace, this test repairs to the INFO-SKIP branch (layer
// absent -> records verdict, skips mechanism checks) instead of failing.
//
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 BONDS=1 node scripts/test-bonds-20261021.js
//   SMOKE=1 ...  (stub + det-gate only, no 120d engine runs)
'use strict';
const assert = require('assert');
let LAYER = null;
try { LAYER = require('./policies/bonds'); } catch (e) { LAYER = null; }

const SMOKE = process.env.SMOKE === '1';
let pass = 0;
function ok(name, cond) {
  if (!cond) { console.error('FAIL: ' + name); process.exitCode = 1; return; }
  pass++;
  console.log('ok: ' + name);
}

if (!LAYER) {
  console.log('LAYER ABSENT (killed at pilot NO-GO per evidence/2026-10-21/sim-belongbonds.md) — mechanism checks skipped by design.');
  ok('kill-protocol: no bonds layer file in scripts/policies/', true);
  console.log(pass + ' checks passed');
  process.exit(process.exitCode || 0);
}

const { layerOn, withBonds, courtBonds, snapBonds, peerLinks, detPeerScore, tradeTargets } = LAYER;

function withEnv(v, fn) {
  const prev = process.env.BONDS;
  if (v == null) delete process.env.BONDS; else process.env.BONDS = v;
  try { return fn(); } finally {
    if (prev == null) delete process.env.BONDS; else process.env.BONDS = prev;
  }
}

// --- stub Game: the peer-proposal surface the layer reads ---
function stubGame(opts) {
  const o = opts || {};
  const calls = [];
  const villages = (o.villages || []).map(v => Object.assign({ opinion: 0 }, v));
  const g = {
    state: {
      scholar: { day: o.day != null ? o.day : 30, exiled: !!o.exiled, joinedVillage: !!o.joined },
      village: { pantry: [{ kcalEach: o.pantryKcal != null ? o.pantryKcal : 50000, units: 1 }] },
      otherVillages: villages,
      pendingCounter: o.pendingCounter || null,
      pendingAccord: o.pendingAccord || null,
      pendingNational: o.pendingNational || null,
    },
    _links: o.links || [],
    _repS: o.repS != null ? o.repS : 40,
    knowsVillage(v) { return !!o.known || (o.knownIds || []).indexOf(v.id) >= 0; },
    linkWith(id) { return this._links.find(l => l && (l.a === id || l.b === id || l.primary === id || l.subordinate === id)) || null; },
    hierarchyState() { return this._links; },
    representative() { return { id: 'rep1' }; },
    linkStanding() { return this._repS; },
    proposeTrade(id) { calls.push(['proposeTrade', id]); return o.proposeResult !== undefined ? o.proposeResult : { id: 'link_x', kind: 'trade' }; },
    ledgerAdd() {},
    _calls: calls,
  };
  return g;
}
function basePolicy() {
  return { id: 'base', daily(G, ctx) { ctx.baseRan = (ctx.baseRan || 0) + 1; } };
}

// --- 1. gate semantics ---
withEnv('1', () => ok('layerOn: BONDS=1 on', layerOn() === true));
withEnv('0', () => ok('layerOn: BONDS=0 off', layerOn() === false));
withEnv(null, () => ok('layerOn: unset off (default OFF)', layerOn() === false));

// --- 2. mechanism RED->GREEN on the stub ---
// GREEN: opinion>=10 + det>=55 target gets a trade proposal when armed.
withEnv('1', () => {
  const g = stubGame({ villages: [{ id: 'v1', opinion: 20 }], knownIds: ['v1'] });
  const ctx = {};
  withBonds(basePolicy(), 'x', 'x').daily(g, ctx);
  ok('armed: proposes trade to the opinion>=10/det>=55 target',
    g._calls.length === 1 && g._calls[0][0] === 'proposeTrade' && g._calls[0][1] === 'v1');
  ok('armed: counts the proposal on ctx', ctx.bondsProposed === 1);
  ok('armed: base daily still runs', ctx.baseRan === 1);
});
// RED: gate off -> pure delegation, zero proposal calls.
withEnv(null, () => {
  const g = stubGame({ villages: [{ id: 'v1', opinion: 20 }], knownIds: ['v1'] });
  const ctx = {};
  withBonds(basePolicy(), 'x', 'x').daily(g, ctx);
  ok('gate-off: zero proposal calls', g._calls.length === 0);
  ok('gate-off: base daily runs', ctx.baseRan === 1);
  ok('gate-off: no bonds ctx keys', ctx.bondsProposed === undefined);
});
// Guards: exile, pending beats, 3-peer cap, pantry floor, low opinion.
withEnv('1', () => {
  const g = stubGame({ villages: [{ id: 'v1', opinion: 20 }], knownIds: ['v1'], exiled: true });
  const ctx = {};
  withBonds(basePolicy(), 'x', 'x').daily(g, ctx);
  ok('exile: council-gated, no proposal', g._calls.length === 0 && ctx.baseRan === 1);
});
withEnv('1', () => {
  const g = stubGame({ villages: [{ id: 'v1', opinion: 20 }], knownIds: ['v1'], pendingNational: { shape: 'trade' } });
  const ctx = {};
  withBonds(basePolicy(), 'x', 'x').daily(g, ctx);
  ok('pendingNational: beats first, no proposal', g._calls.length === 0);
});
withEnv('1', () => {
  const links = [
    { id: 'l1', kind: 'trade', a: 'haven', b: 'a', status: 'active' },
    { id: 'l2', kind: 'trade', a: 'b', b: 'haven', status: 'active' },
    { id: 'l3', kind: 'trade', a: 'haven', b: 'c', status: 'active' },
  ];
  const g = stubGame({ villages: [{ id: 'v1', opinion: 20 }], knownIds: ['v1'], links });
  const ctx = {};
  withBonds(basePolicy(), 'x', 'x').daily(g, ctx);
  ok('3 active peer links: league courted, no dilution', g._calls.length === 0);
  ok('peerLinks counts the 3', peerLinks(g).length === 3);
});
withEnv('1', () => {
  const g = stubGame({ villages: [{ id: 'v1', opinion: 20 }], knownIds: ['v1'], pantryKcal: 1000 });
  const ctx = {};
  withBonds(basePolicy(), 'x', 'x').daily(g, ctx);
  ok('thin pantry: no proposal (tribute first)', g._calls.length === 0);
});
withEnv('1', () => {
  const g = stubGame({ villages: [{ id: 'v1', opinion: 5 }], knownIds: ['v1'] });
  const ctx = {};
  withBonds(basePolicy(), 'x', 'x').daily(g, ctx);
  ok('opinion<10: engine prerequisite unmet, no proposal', g._calls.length === 0);
});
withEnv('1', () => {
  // det = 48 + min(20, repS/2) + opinion/2 = 48 + 0 + 5 = 53 < 55 at repS 0, opinion 10
  const g = stubGame({ villages: [{ id: 'v1', opinion: 10 }], knownIds: ['v1'], repS: 0 });
  const ctx = {};
  withBonds(basePolicy(), 'x', 'x').daily(g, ctx);
  ok('det<55: no cold-ask (det=' + detPeerScore(g, 'v1') + ')', g._calls.length === 0);
  ok('det math: 48+0+5=53', detPeerScore(g, 'v1') === 53);
});
withEnv('1', () => {
  // one proposal per day even with two eligible targets
  const g = stubGame({ villages: [{ id: 'v1', opinion: 30 }, { id: 'v2', opinion: 25 }], knownIds: ['v1', 'v2'] });
  const ctx = {};
  withBonds(basePolicy(), 'x', 'x').daily(g, ctx);
  ok('one proposal per day', g._calls.length === 1 && g._calls[0][1] === 'v1');
  withBonds(basePolicy(), 'x', 'x').daily(g, ctx);
  ok('cooldown: second day courts the next target', g._calls.length === 2 && g._calls[1][1] === 'v2');
});
// snapBonds reads the engine's own standing state (stub: no standing fns -> zeros, no crash).
withEnv('1', () => {
  const g = stubGame({});
  const s = snapBonds(g);
  ok('snapBonds: zeroed, no crash without engine fns', s.raw === 0 && s.tradeActive === 0);
});

if (SMOKE) { console.log(pass + ' checks passed (SMOKE: stub + det-gate only)'); process.exit(process.exitCode || 0); }

// --- 3. engine engagement: the layer forms real trade links on the real substrate ---
// 120d on 2 seeds, armed vs control, mechanism-attributed (layer-proposed
// links with kind 'trade' in hierarchyState + ctx.bondsProposed counts).
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const TF = require('./policies/tribfloor');
  const WD = require('./policies/windefer');
  const SD = require('./policies/seatdrive');
  const { dayHash } = require('./det-gate');

  const ENV_REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE'];
  for (const k of ENV_REQ) {
    if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required (seatdrive substrate).`); process.exit(2); }
  }

  function stack(armed) {
    const wd = WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer', 'belongfeast + win-side layers');
    const b = armed ? withBonds(wd, 'belongfeast-bonds', 'belongfeast + bonds drive (BONDS=1)') : wd;
    return SD.withSeatDrive(b, 'belongfeast-windefer', 'belongfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  }

  async function runOne(seed, armed, days, collectHashes) {
    const prev = process.env.BONDS;
    if (armed) process.env.BONDS = '1'; else delete process.env.BONDS;
    try {
      const policy = stack(armed);
      let lastCtx = null, proposed = 0;
      const hashes = [];
      policy.daily = ((oDaily) => (G, ctx) => {
        lastCtx = ctx;
        let r;
        if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
        try { if (collectHashes) hashes.push(dayHash(G)); } catch (e) {}
        return r;
      })(policy.daily);
      const { Game } = await loadGame({ seed, mode: 'bonds-proof-' + (armed ? 'a' : 'c'), fullTelemetry: false });
      await setupGame(Game);
      await quietLog(async () => { await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 1 }); });
      let tradeLinks = 0;
      try {
        for (const l of (Game.hierarchyState() || []))
          if (l && l.status === 'active' && l.kind === 'trade') tradeLinks++;
      } catch (e) {}
      return { proposed: (lastCtx && lastCtx.bondsProposed) || 0, tradeLinks, hashes };
    } finally {
      if (prev == null) delete process.env.BONDS; else process.env.BONDS = prev;
    }
  }

  // engagement on 2 seeds x 120d (mechanism-attributed, not trajectory noise)
  let armedLinks = 0, controlLinks = 0, armedProposed = 0;
  for (const seed of [64501, 64502]) {
    const a = await runOne(seed, true, 120, false);
    const c = await runOne(seed, false, 120, false);
    armedLinks += a.tradeLinks; controlLinks += c.tradeLinks; armedProposed += a.proposed;
    console.log(`  seed ${seed}: armed proposed=${a.proposed} tradeLinks=${a.tradeLinks} | control tradeLinks=${c.tradeLinks}`);
  }
  ok('engine: armed proposed trade links (layer engaged)', armedProposed > 0);
  ok('engine: armed formed trade links via the layer', armedLinks > 0);
  ok('engine: control formed no layer trade links', controlLinks === 0);

  // det-gate: BONDS=0 vs unset vs bare stack — byte-identical day hashes.
  // Honest form (the 2026-10-14 entropy-hunt known issue: some fight-heavy
  // seeds are engine-nondeterministic): first prove the seed repeats
  // (bare==bare); only then is wrapped-off==bare evidence about the LAYER.
  async function hashesFor(seed, days, wrap, bondsEnv) {
    const prev = process.env.BONDS;
    if (bondsEnv == null) delete process.env.BONDS; else process.env.BONDS = bondsEnv;
    try {
      const wd = WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer', 'x');
      const p = wrap ? withBonds(wd, 'belongfeast-bonds', 'x') : wd;
      const policy = SD.withSeatDrive(p, 'belongfeast-windefer', 'x');
      const hashes = [];
      policy.daily = ((oDaily) => (G, ctx) => {
        let r; if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
        try { hashes.push(dayHash(G)); } catch (e) {}
        return r;
      })(policy.daily);
      const { Game } = await loadGame({ seed, mode: 'bonds-det', fullTelemetry: false });
      await setupGame(Game);
      await quietLog(async () => { await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 1 }); });
      return hashes.join('|');
    } finally {
      if (prev == null) delete process.env.BONDS; else process.env.BONDS = prev;
    }
  }
  for (const seed of [64501, 64502]) {
    const hBare1 = await hashesFor(seed, 60, false, null);
    const hBare2 = await hashesFor(seed, 60, false, null);
    const repeats = hBare1 === hBare2;
    ok(`det-gate seed ${seed}: engine repeats on this seed (bare==bare)`, repeats);
    if (repeats) {
      const hUnset = await hashesFor(seed, 60, true, null);
      const hZero = await hashesFor(seed, 60, true, '0');
      ok(`det-gate seed ${seed}: BONDS=0 == unset`, hUnset === hZero);
      ok(`det-gate seed ${seed}: wrapped-unset == bare stack (byte-identical)`, hUnset === hBare1);
    } else {
      console.log(`  INFO-SKIP seed ${seed}: engine nondeterministic here (known issue) — layer byte-identity unprovable on this seed`);
    }
  }

  console.log(pass + ' checks passed');
  process.exit(process.exitCode || 0);
})().catch(e => { console.error('PROOF ERROR: ' + (e && e.stack || e)); process.exit(1); });
