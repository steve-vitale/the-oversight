#!/usr/bin/env node
// test-caughtlift-b.js — caught-lift trust narration blank
// (sim-caughtlift-b; prereg evidence/2026-10-28/sim-caughtlift-b-prereg.md
// committed as b2ea808f0 BEFORE any judged probe).
//
// Measurement only: zero src/js changes. Fixture setup (grant thief,
// preset trust, force the 50% coin) touches only the fixture's own
// fresh game state and is printed in output.
//
// Judged (per seed 9820, 9850), one scripted CAUGHT ability lift:
//   (a) v.trust[playerId] delta == -20 exactly (trust preset to 50,
//       so the 0 floor cannot clamp it);
//   (b) >= 1 say() line captured during the lift (quoted in output);
//   (c) >= 1 DURABLE record beyond the transient say line: a
//       state.telemetry 'trust' event (delta -20, player id), a
//       v.memory entry (caught_you_stealing/theft), a v.gossip entry
//       (caught_you_stealing/theft/hoard), or a ledger foodHoarded
//       move. The say line alone does NOT satisfy (c).
// DIAG-GO iff (a)+(b)+(c) on EACH seed. Exit 0 = DIAG-GO (or, for the
// secondary diagnostics, all probes completed and reported); exit 1
// = a judged leg failed. Secondary probes never flip the verdict.
//
// Run: node scripts/test-caughtlift-b.js [--band-only|--fixtures-only]
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = [9820, 9850];
const BAND = [10420, 10421, 10422, 10423, 10424, 10425, 10426, 10427];
let judgedFailures = 0;
const check = (name, ok, detail) => {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  return ok;
};

async function freshGame(seed, tag) {
  const { Game } = await loadGame({ seed, mode: 'caughtlift-b-' + tag, fullTelemetry: true });
  const sayLines = [];
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (...args) {
      try { if (sayLines.length < 5000) sayLines.push(String(args[0] || '')); } catch (e) {}
      return origSay.apply(this, args);
    };
  }
  await setupGame(Game);
  return { Game, sayLines };
}

function trustOf(Game, vid) {
  const t = (Game.state.village || {}).trust || {};
  return t[vid];
}
function repSnap(Game, vid) {
  try { const r = Game.repOf(vid); return { generous: r.generous || 0, brave: r.brave || 0, honest: r.honest || 0, competent: r.competent || 0 }; } catch (e) { return { _err: String(e.message) }; }
}
function memFlat(Game) {
  const m = (Game.state.village || {}).memory || {};
  const out = [];
  for (const [rid, arr] of Object.entries(m)) for (const e of (arr || [])) out.push(rid + ':' + (e.t || '?') + ':' + (e.note || ''));
  return out;
}
function gossipFlat(Game) {
  return ((Game.state.village || {}).gossip || []).map(g => (g.action || '?') + ':' + JSON.stringify(g.dims || {}));
}
function ledgerSnap(Game) {
  try { const L = Game.ledger(); return { foodShared: L.foodShared || 0, foodHoarded: L.foodHoarded || 0 }; } catch (e) { return { _err: String(e.message) }; }
}
function pantryKcal(Game) {
  return (Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}

function logFlat(Game) {
  return (Game.log || []).map(e => String(e));
}
async function fixtureAbilityCaught(seed) {
  const { Game, sayLines } = await freshGame(seed, 'lift-caught');
  const s = Game.state.scholar, v = Game.state.village, vid = s.villagerId;
  s.abilities = s.abilities || [];
  if (!Game.hasAbility('thief')) s.abilities.push({ id: 'thief', name: 'Light Fingers', level: 1, xp: 0 });
  v.trust = v.trust || {}; v.trust[vid] = 50;
  const pre = { trust: trustOf(Game, vid), rep: repSnap(Game, vid), teleN: (Game.state.telemetry || []).length,
    mem: memFlat(Game), gossip: gossipFlat(Game), ledger: ledgerSnap(Game), pantry: pantryKcal(Game),
    log: logFlat(Game),
    invKcal: (s.inventory || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0) };
  const mark = sayLines.length;
  const realRandom = Math.random;
  let ret;
  try { Math.random = () => 0.1; ret = Game.useAbility('thief', 'steal_pantry'); } finally { Math.random = realRandom; }
  const lines = sayLines.slice(mark);
  const post = { trust: trustOf(Game, vid), rep: repSnap(Game, vid),
    teleTrust: (Game.state.telemetry || []).slice(pre.teleN).filter(e => e.type === 'trust'),
    memNew: memFlat(Game).filter(x => !pre.mem.includes(x)),
    gossipNew: gossipFlat(Game).filter(x => !pre.gossip.includes(x)),
    logNew: logFlat(Game).filter(x => !pre.log.includes(x)),
    ledger: ledgerSnap(Game), pantry: pantryKcal(Game),
    invKcal: (s.inventory || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0) };
  const delta = post.trust - pre.trust;
  const lifted = pre.pantry - post.pantry;
  const legC = { teleTrust: post.teleTrust, memNew: post.memNew, gossipNew: post.gossipNew,
    ledgerDelta: { foodHoarded: (post.ledger.foodHoarded || 0) - (pre.ledger.foodHoarded || 0),
      foodShared: (post.ledger.foodShared || 0) - (pre.ledger.foodShared || 0) } };
  const cPass = post.teleTrust.length > 0 || post.memNew.length > 0 || post.gossipNew.length > 0 ||
    legC.ledgerDelta.foodHoarded !== 0;
  console.log(`[ability-caught seed=${seed}] held=${Game.hasAbility('thief')} ret=${ret} trust ${pre.trust}->${post.trust} (delta ${delta}) liftedKcal=${lifted} invGain=${post.invKcal - pre.invKcal}`);
  console.log(`  SAY: ${JSON.stringify(lines)}`);
  console.log(`  REP pre=${JSON.stringify(pre.rep)} post=${JSON.stringify(post.rep)}`);
  console.log(`  TRACE teleTrust=${JSON.stringify(post.teleTrust)} memNew=${JSON.stringify(post.memNew)} gossipNew=${JSON.stringify(post.gossipNew)} ledgerDelta=${JSON.stringify(legC.ledgerDelta)}`);
  console.log(`  LOGRING (diagnostic, NOT a leg-c record): ${JSON.stringify(post.logNew)}`);
  if (!check(`ability-caught/${seed} (a) delta==-20`, delta === -20, `delta=${delta}`)) judgedFailures++;
  if (!check(`ability-caught/${seed} (b) >=1 narration line`, lines.length >= 1, `lines=${lines.length}`)) judgedFailures++;
  if (!check(`ability-caught/${seed} (c) durable trace`, cPass, 'no tele/memory/gossip/ledger record')) judgedFailures++;
  return { seed, ret, delta, lines, legC, lifted };
}

async function fixtureOrdinaryCaught(seed) {
  const { Game, sayLines } = await freshGame(seed, 'take-caught');
  const s = Game.state.scholar, v = Game.state.village, vid = s.villagerId;
  s.abilities = s.abilities || [];
  if (!Game.hasAbility('thief')) s.abilities.push({ id: 'thief', name: 'Light Fingers', level: 1, xp: 0 });
  v.trust = v.trust || {}; v.trust[vid] = 50;
  // Force the trailing-7d net take rate to exactly the 3000 bar:
  // one 21000-kcal history entry on the current day -> 21000/7 = 3000.
  try { Game.recordTakeHist(vid, 21000); } catch (e) { console.log('  recordTakeHist failed: ' + e.message); }
  const rate = (() => { try { return Game.takeRate7(vid) - Game.giveRate7(vid); } catch (e) { return null; } })();
  const idx = (v.pantry || []).findIndex(i => (i.kcalEach || 0) > 0 && (i.units || 1) > 0);
  const pre = { trust: trustOf(Game, vid), teleN: (Game.state.telemetry || []).length,
    mem: memFlat(Game), gossip: gossipFlat(Game), trusts: JSON.parse(JSON.stringify(v.trust || {})) };
  const mark = sayLines.length;
  const realRandom = Math.random;
  let ret;
  try { Math.random = () => 0.9; ret = Game.takeFromPantry(idx); } finally { Math.random = realRandom; }
  const lines = sayLines.slice(mark);
  const postTrust = trustOf(Game, vid);
  const post = { teleTrust: (Game.state.telemetry || []).slice(pre.teleN).filter(e => e.type === 'trust'),
    memNew: memFlat(Game).filter(x => !pre.mem.includes(x)),
    gossipNew: gossipFlat(Game).filter(x => !pre.gossip.includes(x)),
    trusts: JSON.parse(JSON.stringify(v.trust || {})) };
  const otherMoves = Object.entries(post.trusts).filter(([k, val]) => k !== vid && (pre.trusts[k] || 0) !== val)
    .map(([k, val]) => k + ':' + (pre.trusts[k] || 0) + '->' + val);
  console.log(`[ordinary-caught seed=${seed}] idx=${idx} rate7=${rate} ret=${ret} trust ${pre.trust}->${postTrust} (delta ${postTrust - pre.trust}) otherTrustMoves=${JSON.stringify(otherMoves)}`);
  console.log(`  SAY: ${JSON.stringify(lines)}`);
  console.log(`  TRACE teleTrust=${JSON.stringify(post.teleTrust)} memNew=${JSON.stringify(post.memNew)} gossipNew=${JSON.stringify(post.gossipNew)}`);
  console.log(`  LEGS (diagnostic): a=${(postTrust - pre.trust) === -20} b=${lines.length >= 1} c=${post.teleTrust.length > 0 || post.memNew.length > 0 || post.gossipNew.length > 0}`);
  return { seed, delta: postTrust - pre.trust, lines, otherMoves };
}

async function fixtureClean(seed) {
  const { Game, sayLines } = await freshGame(seed, 'lift-clean');
  const s = Game.state.scholar, v = Game.state.village, vid = s.villagerId;
  s.abilities = s.abilities || [];
  if (!Game.hasAbility('thief')) s.abilities.push({ id: 'thief', name: 'Light Fingers', level: 1, xp: 0 });
  v.trust = v.trust || {}; v.trust[vid] = 50;
  const mark = sayLines.length;
  const realRandom = Math.random;
  let ret;
  try { Math.random = () => 0.9; ret = Game.useAbility('thief', 'steal_pantry'); } finally { Math.random = realRandom; }
  const lines = sayLines.slice(mark);
  console.log(`[ability-clean seed=${seed}] ret=${ret} trust 50->${trustOf(Game, vid)} (delta ${trustOf(Game, vid) - 50}) SAY=${JSON.stringify(lines)}`);
  check(`ability-clean/${seed} delta==0`, trustOf(Game, vid) === 50, `trust=${trustOf(Game, vid)}`);
  return { seed, lines };
}

async function band() {
  const RANK = { village: 0, regional: 1, national: 2, global: 3 };
  const rows = [];
  for (const seed of BAND) {
    const { Game } = await loadGame({ seed, mode: 'caughtlift-band', fullTelemetry: false });
    let liftCalls = 0; const liftLines = [];
    const origUse = Game.useAbility;
    if (typeof origUse === 'function') {
      Game.useAbility = function (...args) {
        try { if (args[0] === 'thief' || (args[1] || '') === 'steal_pantry') liftCalls++; } catch (e) {}
        return origUse.apply(this, args);
      };
    }
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { const l = String(args[0] || ''); if (/Light Fingers/i.test(l) && liftLines.length < 50) liftLines.push(l); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
    await setupGame(Game);
    const hist = { maxRank: 0, maxArc: 1, everTable: false };
    const base = competent;
    const policy = Object.assign({}, base);
    const origDaily = base.daily;
    policy.daily = (G, ctx) => {
      try {
        const pg = G.progState ? G.progState() : {};
        hist.maxArc = Math.max(hist.maxArc, pg.arc || 1);
        if (pg.tableWaiting) hist.everTable = true;
        const r = (G.scaleRank ? G.scaleRank() : 'village') || 'village';
        hist.maxRank = Math.max(hist.maxRank, RANK[r] || 0);
      } catch (e) {}
      if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
    };
    const result = await runDays(Game, policy, { days: 100, sampleEvery: 10 });
    const endRank = (() => { try { return Game.scaleRank() || 'village'; } catch (e) { return '?'; } })();
    const maxRank = Object.keys(RANK).find(k => RANK[k] === hist.maxRank) || 'village';
    const row = { seed, days: result.days, end: result.endReason, wave: result.maxWaveUnlocked || 1,
      arc: hist.maxArc, rank: maxRank, national: Math.max(hist.maxRank, RANK[endRank] || 0) >= 2 ? 1 : 0,
      table: hist.everTable ? 1 : 0, won: Game.won ? 1 : 0, liftCalls, liftLines: liftLines.length };
    rows.push(row);
    console.log(`  [band seed=${seed}] days=${row.days} end=${row.end} wave=${row.wave} arc=${row.arc} rank=${row.rank} national=${row.national} table=${row.table} won=${row.won} liftCalls=${liftCalls} liftLines=${liftLines.length}`);
    if (liftLines.length) console.log(`    LIFT LINES: ${JSON.stringify(liftLines)}`);
  }
  const daysSorted = rows.map(r => r.days).sort((a, b) => a - b);
  const median = daysSorted.length ? daysSorted[Math.floor(daysSorted.length / 2)] : 0;
  const agg = { seeds: rows.length, liftCalls: rows.reduce((t, r) => t + r.liftCalls, 0),
    national: rows.reduce((t, r) => t + r.national, 0), table: rows.reduce((t, r) => t + r.table, 0),
    won: rows.reduce((t, r) => t + r.won, 0), wave45: rows.filter(r => r.wave >= 4).length,
    wave5: rows.filter(r => r.wave >= 5).length, medianDays: median, maxDays: daysSorted[daysSorted.length - 1] || 0 };
  console.log('BAND AGGREGATE ' + JSON.stringify(agg));
  return { rows, agg };
}

(async () => {
  const args = process.argv.slice(2);
  const doFixtures = !args.includes('--band-only');
  const doBand = !args.includes('--fixtures-only');
  if (doFixtures) {
    for (const seed of SEEDS) {
      await fixtureAbilityCaught(seed);
      await fixtureOrdinaryCaught(seed);
      await fixtureClean(seed);
    }
  }
  if (doBand) await band();
  if (judgedFailures) { console.log('JUDGED LEGS FAILED: ' + judgedFailures); process.exit(1); }
  console.log('JUDGED LEGS: all passed (or fixtures skipped by flag)');
})().catch(e => { console.error('FIXTURE CRASH', e && e.stack || e); process.exit(2); });
