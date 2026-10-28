#!/usr/bin/env node
// test-caughtlift-fix-b.js — caught-lift trust booking fix
// (sim-caughtlift-fix-b; prereg evidence/2026-10-28/sim-caughtlift-fix-b.md
// written BEFORE any after-measurements).
//
// Fix under test: caught-lift and caught-take -20 routed through
// bumpTrust with reason 'caught stealing from the pantry', and
// observe('caught_you_stealing') given a live action-table entry.
//
// Judged (per seed 9820, 9850), one scripted CAUGHT ability lift and
// one scripted CAUGHT ordinary take:
//   (a) v.trust[playerId] delta == -20 exactly (trust preset to 50);
//   (b) narration line VERBATIM equal to the sim-caughtlift-b line;
//   (c) durable trace: a state.telemetry 'trust' event with delta -20
//       and a reason naming the caught stealing (memory/gossip also
//       counted if present; the say line alone does NOT satisfy (c)).
// GO iff (a)+(b)+(c) on EACH seed for BOTH paths, plus the band (c)
// leg: 8/8 seeds complete, no crash. Exit 0 = GO, 1 = judged fail.
// Controls (reported, never flip the verdict unless they break the
// fix's preservation claims): clean lift delta 0 + no tele event;
// unset-trust caught lift floors at 0 (== old direct-write result).
// Witness probe (reported): with a positioned witness, observe()
// must move rep and seed gossip — proving the table entry is live.
//
// Run: node scripts/test-caughtlift-fix-b.js [--band-only|--fixtures-only]
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = [9820, 9850];
const BAND = [10420, 10421, 10422, 10423, 10424, 10425, 10426, 10427];
const LIFT_LINE = 'A hand closes on your wrist. "Really?" -20 trust. The pantry remembers. (Light Fingers — caught.)';
const TAKE_LINE = 'Caught red-handed! They saw you steal. Trust -20.';
let judgedFailures = 0;
const check = (name, ok, detail) => {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  return ok;
};

async function freshGame(seed, tag) {
  const { Game } = await loadGame({ seed, mode: 'caughtlift-fix-' + tag, fullTelemetry: true });
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
function trustOf(Game, vid) { return (Game.state.village || {}).trust || {}; }
function memFlat(Game) {
  const m = (Game.state.village || {}).memory || {};
  const out = [];
  for (const [rid, arr] of Object.entries(m)) for (const e of (arr || [])) out.push(rid + ':' + (e.t || '?') + ':' + (e.note || ''));
  return out;
}
function gossipFlat(Game) {
  return ((Game.state.village || {}).gossip || []).map(g => (g.action || '?') + ':' + JSON.stringify(g.dims || {}));
}
function pantryKcal(Game) {
  return (Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}

async function fixtureAbilityCaught(seed) {
  const { Game, sayLines } = await freshGame(seed, 'lift-caught');
  const s = Game.state.scholar, v = Game.state.village, vid = s.villagerId;
  s.abilities = s.abilities || [];
  if (!Game.hasAbility('thief')) s.abilities.push({ id: 'thief', name: 'Light Fingers', level: 1, xp: 0 });
  v.trust = v.trust || {}; v.trust[vid] = 50;
  const pre = { trust: v.trust[vid], teleN: (Game.state.telemetry || []).length,
    mem: memFlat(Game), gossip: gossipFlat(Game), pantry: pantryKcal(Game),
    invKcal: (s.inventory || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0) };
  const mark = sayLines.length;
  const realRandom = Math.random;
  let ret;
  try { Math.random = () => 0.1; ret = Game.useAbility('thief', 'steal_pantry'); } finally { Math.random = realRandom; }
  const lines = sayLines.slice(mark);
  const teleTrust = (Game.state.telemetry || []).slice(pre.teleN).filter(e => e.type === 'trust');
  const post = { trust: v.trust[vid], teleTrust,
    memNew: memFlat(Game).filter(x => !pre.mem.includes(x)),
    gossipNew: gossipFlat(Game).filter(x => !pre.gossip.includes(x)),
    pantry: pantryKcal(Game),
    invKcal: (s.inventory || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0) };
  const delta = post.trust - pre.trust;
  const teleOk = teleTrust.some(e => Number(e.delta) === -20 && /caught stealing/i.test(String((e.reason || e.why) || '')) || teleTrust.some(e => Number(e.delta) === -20 && JSON.stringify(e).toLowerCase().includes('caught')));
  console.log(`[ability-caught seed=${seed}] ret=${ret} trust ${pre.trust}->${post.trust} (delta ${delta}) liftedKcal=${pre.pantry - post.pantry} invGain=${post.invKcal - pre.invKcal}`);
  console.log(`  SAY: ${JSON.stringify(lines)}`);
  console.log(`  TRACE teleTrust=${JSON.stringify(teleTrust)} memNew=${JSON.stringify(post.memNew)} gossipNew=${JSON.stringify(post.gossipNew)}`);
  if (!check(`ability-caught/${seed} (a) delta==-20`, delta === -20, `delta=${delta}`)) judgedFailures++;
  if (!check(`ability-caught/${seed} (b) narration verbatim`, lines[0] === LIFT_LINE, `first=${JSON.stringify(lines[0])}`)) judgedFailures++;
  if (!check(`ability-caught/${seed} (c) tele -20 + reason`, teleOk, 'no tele trust event with -20 and caught-stealing reason')) judgedFailures++;
  return { seed, delta, lines, teleTrust };
}

async function fixtureOrdinaryCaught(seed) {
  const { Game, sayLines } = await freshGame(seed, 'take-caught');
  const s = Game.state.scholar, v = Game.state.village, vid = s.villagerId;
  s.abilities = s.abilities || [];
  if (!Game.hasAbility('thief')) s.abilities.push({ id: 'thief', name: 'Light Fingers', level: 1, xp: 0 });
  v.trust = v.trust || {}; v.trust[vid] = 50;
  try { Game.recordTakeHist(vid, 21000); } catch (e) { console.log('  recordTakeHist failed: ' + e.message); }
  const idx = (v.pantry || []).findIndex(i => (i.kcalEach || 0) > 0 && (i.units || 1) > 0);
  const pre = { trust: v.trust[vid], teleN: (Game.state.telemetry || []).length,
    mem: memFlat(Game), gossip: gossipFlat(Game), trusts: JSON.parse(JSON.stringify(v.trust || {})) };
  const mark = sayLines.length;
  const realRandom = Math.random;
  let ret;
  try { Math.random = () => 0.9; ret = Game.takeFromPantry(idx); } finally { Math.random = realRandom; }
  const lines = sayLines.slice(mark);
  const teleTrust = (Game.state.telemetry || []).slice(pre.teleN).filter(e => e.type === 'trust');
  const postTrust = v.trust[vid];
  const memNew = memFlat(Game).filter(x => !pre.mem.includes(x));
  const gossipNew = gossipFlat(Game).filter(x => !pre.gossip.includes(x));
  const otherMoves = Object.entries(JSON.parse(JSON.stringify(v.trust || {}))).filter(([k, val]) => k !== vid && (pre.trusts[k] || 0) !== val)
    .map(([k, val]) => k + ':' + (pre.trusts[k] || 0) + '->' + val);
  const teleOk = teleTrust.some(e => Number(e.delta) === -20 && JSON.stringify(e).toLowerCase().includes('caught'));
  console.log(`[ordinary-caught seed=${seed}] idx=${idx} ret=${ret} trust ${pre.trust}->${postTrust} (delta ${postTrust - pre.trust}) otherTrustMoves=${JSON.stringify(otherMoves)}`);
  console.log(`  SAY: ${JSON.stringify(lines)}`);
  console.log(`  TRACE teleTrust=${JSON.stringify(teleTrust)} memNew=${JSON.stringify(memNew)} gossipNew=${JSON.stringify(gossipNew)}`);
  if (!check(`ordinary-caught/${seed} (a) delta==-20`, (postTrust - pre.trust) === -20, `delta=${postTrust - pre.trust}`)) judgedFailures++;
  if (!check(`ordinary-caught/${seed} (b) narration verbatim`, lines[0] === TAKE_LINE, `first=${JSON.stringify(lines[0])}`)) judgedFailures++;
  if (!check(`ordinary-caught/${seed} (c) tele -20 + reason`, teleOk, 'no tele trust event with -20 and caught-stealing reason')) judgedFailures++;
  return { seed, delta: postTrust - pre.trust, lines, teleTrust };
}

async function fixtureClean(seed) {
  const { Game, sayLines } = await freshGame(seed, 'lift-clean');
  const s = Game.state.scholar, v = Game.state.village, vid = s.villagerId;
  s.abilities = s.abilities || [];
  if (!Game.hasAbility('thief')) s.abilities.push({ id: 'thief', name: 'Light Fingers', level: 1, xp: 0 });
  v.trust = v.trust || {}; v.trust[vid] = 50;
  const teleN = (Game.state.telemetry || []).length;
  const mark = sayLines.length;
  const realRandom = Math.random;
  let ret;
  try { Math.random = () => 0.9; ret = Game.useAbility('thief', 'steal_pantry'); } finally { Math.random = realRandom; }
  const lines = sayLines.slice(mark);
  const teleTrust = (Game.state.telemetry || []).slice(teleN).filter(e => e.type === 'trust');
  console.log(`[ability-clean seed=${seed}] ret=${ret} trust 50->${v.trust[vid]} teleTrust=${JSON.stringify(teleTrust)} SAY=${JSON.stringify(lines)}`);
  check(`ability-clean/${seed} delta==0 + no tele`, v.trust[vid] === 50 && teleTrust.length === 0, `trust=${v.trust[vid]} tele=${teleTrust.length}`);
}

async function fixtureUnset(seed) {
  const { Game } = await freshGame(seed, 'lift-unset');
  const s = Game.state.scholar, v = Game.state.village, vid = s.villagerId;
  s.abilities = s.abilities || [];
  if (!Game.hasAbility('thief')) s.abilities.push({ id: 'thief', name: 'Light Fingers', level: 1, xp: 0 });
  v.trust = v.trust || {}; delete v.trust[vid];
  const realRandom = Math.random;
  try { Math.random = () => 0.1; Game.useAbility('thief', 'steal_pantry'); } finally { Math.random = realRandom; }
  console.log(`[ability-unset seed=${seed}] trust unset -> ${v.trust[vid]} (old direct-write result was also 0)`);
  check(`ability-unset/${seed} floors at 0`, v.trust[vid] === 0, `trust=${v.trust[vid]}`);
}

async function witnessProbe(seed) {
  const { Game } = await freshGame(seed, 'witness');
  const v = Game.state.village, s = Game.state.scholar;
  const roster = (v.roster || []).filter(id => id !== s.villagerId);
  if (!roster.length) { console.log('[witness-probe] no roster members, skipped'); return; }
  const wit = roster[0];
  v.positions = v.positions || {}; s.mx = 4; s.my = 4;
  v.positions[wit] = { mx: 5, my: 4 };
  const repPre = JSON.parse(JSON.stringify(Game.repOf(wit)));
  const gossipPre = (v.gossip || []).length;
  try { Game.observe('caught_you_stealing'); } catch (e) { console.log('[witness-probe] observe threw: ' + e.message); }
  const repPost = Game.repOf(wit);
  const gossipPost = (v.gossip || []).length;
  console.log(`[witness-probe seed=${seed}] witness=${wit} rep honest ${repPre.honest}->${repPost.honest} generous ${repPre.generous}->${repPost.generous} gossip ${gossipPre}->${gossipPost}`);
  check(`witness-probe/${seed} entry live (rep moves, gossip seeds)`, repPost.honest < repPre.honest && gossipPost > gossipPre,
    `honest ${repPre.honest}->${repPost.honest}, gossip ${gossipPre}->${gossipPost}`);
}

async function band() {
  const RANK = { village: 0, regional: 1, national: 2, global: 3 };
  const rows = [];
  for (const seed of BAND) {
    const { Game } = await loadGame({ seed, mode: 'caughtlift-fix-band', fullTelemetry: false });
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
  if (!check('band completes 8/8', rows.length === 8, `rows=${rows.length}`)) judgedFailures++;
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
      await fixtureUnset(seed);
    }
    await witnessProbe(SEEDS[0]);
  }
  if (doBand) await band();
  if (judgedFailures) { console.log('JUDGED LEGS FAILED: ' + judgedFailures); process.exit(1); }
  console.log('JUDGED LEGS: all passed (or fixtures skipped by flag)');
})().catch(e => { console.error('FIXTURE CRASH', e && e.stack || e); process.exit(2); });
