#!/usr/bin/env node
// test-bladequota-formula.js — proves the blade-quota snapshot replica
// (scripts/bladequota-snapshot.js) against the REAL soundTitanCall.
//
// Phase A (deterministic fixture, must pass): on a fresh game, fabricate
// four active links + other-village rosters covering every formula branch
// (trusted 6, base 2, refused 0, free-face-capped 1), take the analytic
// snapshot twice (idempotence + trust invariance), then call the real
// Game.soundTitanCall('herald') and compare per-link yields exactly.
// Expected allied yield: 6 + 2 + 0 + 1 = 9.
// Phase B (live-state check, best effort): competent sim, seed 76101; on
// the first day with >= 1 active link, repeat the comparison on the live
// state. If no linked state appears within 200d, Phase B reports
// INCONCLUSIVE but does not fail the test — Phase A already proves
// fidelity on the real functions; Phase B only adds live coverage.
// Exit 0 = Phase A passes (and Phase B matches when it runs).
// Exit 1 = any mismatch, impurity, or Phase A failure.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { bladeQuotaSnapshot } = require('./bladequota-snapshot');

function mkRoster(prefix, n, opts) {
  opts = opts || {};
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({ id: prefix + i, name: 'Fighter' + i, alive: true, age: 30, health: 100 });
  }
  if (opts.dead) out.push({ id: prefix + 'dead', name: 'Dead', alive: false, age: 30, health: 0 });
  if (opts.child) out.push({ id: prefix + 'child', name: 'Child', alive: true, age: 10, health: 100 });
  return out;
}

function comparePhase(Game, label) {
  const snap1 = bladeQuotaSnapshot(Game, 'herald');
  const snap2 = bladeQuotaSnapshot(Game, 'herald');
  const idempotent = JSON.stringify(snap1) === JSON.stringify(snap2);
  const trustsBefore = snap1.links.map(function (l) { return l.villageId + ':' + l.trust; }).join('|');
  const trustsAfter = snap2.links.map(function (l) { return l.villageId + ':' + l.trust; }).join('|');
  const muster = Game.soundTitanCall('herald');
  const actualByVillage = {};
  (muster.allies || []).forEach(function (a) {
    actualByVillage[a.villageId] = (actualByVillage[a.villageId] || 0) + 1;
  });
  const perLink = snap1.links.map(function (l) {
    return { villageId: l.villageId, trust: l.trust, opinion: l.opinion,
      refused: l.refused, quota: l.quota, freeFaces: l.freeFaces,
      analytic: l.yielded, actual: actualByVillage[l.villageId] || 0 };
  });
  const match = snap1.alliedYield === (muster.allies || []).length &&
    perLink.every(function (r) { return r.analytic === r.actual; });
  return { label: label, analytic: snap1.alliedYield, actual: (muster.allies || []).length,
    perLink: perLink, idempotent: idempotent,
    trustUnchanged: trustsBefore === trustsAfter, match: match };
}

async function main() {
  // ---- Phase A: fabricated fixture on a fresh game ----
  const a = await loadGame({ seed: 76101, mode: 'bladequota-proof' });
  if (a.loadFails && a.loadFails.length) throw new Error('loadFails: ' + a.loadFails.join('; '));
  const Game = a.Game;
  if (typeof Game.soundTitanCall !== 'function') throw new Error('Game.soundTitanCall missing on this base');
  await setupGame(Game, 'Columbus, Ohio');
  Game.state.otherVillages = [
    { id: 'v-trusted', name: 'TrustedFire', opinion: 20, roster: mkRoster('t', 8) },
    { id: 'v-base', name: 'BaseFire', opinion: 0, roster: mkRoster('b', 5) },
    { id: 'v-refused', name: 'RefusedFire', opinion: 0, roster: mkRoster('r', 5) },
    { id: 'v-capped', name: 'CappedFire', opinion: 0, roster: mkRoster('c', 1, { dead: true, child: true }) },
  ];
  const mship = Game.mshipState ? Game.mshipState() : (Game.state.village.mship = {});
  mship.links = [
    { primary: 'haven', subordinate: 'v-trusted', status: 'active', trust: 80 },
    { primary: 'haven', subordinate: 'v-base', status: 'active', trust: 50 },
    { primary: 'haven', subordinate: 'v-refused', status: 'active', trust: 10 },
    { primary: 'haven', subordinate: 'v-capped', status: 'active', trust: 50 },
  ];
  const phaseA = comparePhase(Game, 'fixture');
  console.log('PHASE A: ' + JSON.stringify(phaseA, null, 2));
  if (phaseA.analytic !== 9) { console.error('FAIL Phase A: expected allied 9, got ' + phaseA.analytic); process.exit(1); }
  if (!phaseA.idempotent || !phaseA.trustUnchanged || !phaseA.match) {
    console.error('FAIL Phase A: idempotent=' + phaseA.idempotent + ' trustUnchanged=' + phaseA.trustUnchanged + ' match=' + phaseA.match);
    process.exit(1);
  }
  console.log('PASS Phase A: replica matches real soundTitanCall on all four branches (9 blades)');

  // ---- Phase B: live-state check, seed 76101 ----
  const b = await loadGame({ seed: 76101, mode: 'bladequota-proof-live' });
  if (b.loadFails && b.loadFails.length) throw new Error('loadFails B: ' + b.loadFails.join('; '));
  const G2 = b.Game;
  await setupGame(G2, 'Columbus, Ohio');
  const verdict = { compared: false };
  const wrapped = Object.assign({}, competent, {
    id: 'competent',
    daily: function (G, ctx) {
      if (verdict.compared) return;
      try { if (typeof competent.daily === 'function') competent.daily(G, ctx); } catch (e) {}
      try {
        const snap = bladeQuotaSnapshot(G, 'herald');
        if (!snap.links.length) return;
        verdict.day = ((G.state || {}).scholar || {}).day || 0;
        verdict.phaseB = comparePhase(G, 'live');
        verdict.compared = true;
        G.over = true; // end AFTER the comparison
      } catch (e) {
        verdict.error = String((e && e.message) || e);
        verdict.compared = true;
        G.over = true;
      }
    },
  });
  await runDays(G2, wrapped, { days: 200 });
  if (!verdict.compared) {
    console.log('PHASE B: INCONCLUSIVE — no linked state in 200d on seed 76101 (no live comparison possible)');
  } else if (verdict.error) {
    console.error('FAIL Phase B: ' + verdict.error); process.exit(1);
  } else {
    console.log('PHASE B: ' + JSON.stringify(verdict.phaseB, null, 2));
    if (!verdict.phaseB.match || !verdict.phaseB.idempotent || !verdict.phaseB.trustUnchanged) {
      console.error('FAIL Phase B: live replica mismatch'); process.exit(1);
    }
    console.log('PASS Phase B: live-state replica matches (day ' + verdict.day + ')');
  }
  console.log('PASS: test-bladequota-formula');
}

main().catch(function (e) { console.error('test-bladequota-formula FAILED: ' + (e && e.stack || e)); process.exit(1); });
