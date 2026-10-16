#!/usr/bin/env node
// scripts/test-teleflag-20261016.js — proof for the sim-teleflag-b fix
// (loop B, 2026-10-16, food-economy axis / measurement infrastructure;
// fixes sim-findings #400/#403).
//
// BUG: the harness tele('death') can miss player:true when a villager-death
// path registers the scholar's death before playerDeath does — corpses.js's
// double-death guard then no-ops playerDeath's registerDeath call, so the
// tele never carries player:true (proven instance: belongfeast-s529, Olivia
// Bennett, d138 — harness keyed 'person:combat', instrument hook recorded
// the player:true opts).
//
// FIX (two parts, both telemetry-only, zero gameplay effect):
//   1. src/js/corpses.js registerDeath: on the double-death guard's no-op
//      path, when opts.player is true, repair the already-fired death tele
//      in place (player:true) BEFORE the no-op return. Still exactly one
//      registration, one corpse, one fallen entry, one death tele.
//   2. scripts/sim-harness.js live death capture: read player LAZILY off the
//      tele record instead of snapshotting at fire time (the snapshot froze
//      the pre-repair value, so harness teles kept undercounting).
//
// PART A — double-registration race fixtures on the live engine:
//   A1 the s529 race (villager path wins, playerDeath no-ops): tele for the
//      scholar carries player:true AND exactly 1 corpse AND exactly 1 fallen
//      entry AND the mantle passed. REAL RED: on pre-fix code the player:true
//      assertion FAILS (tele carries player:false) — the old code drops the flag.
//   A2 normal order (playerDeath first, duplicate villager-path call after):
//      still exactly 1 tele (player:true), 1 corpse, 1 fallen.
//   A3 non-player double registration: still exactly 1 tele (player:false),
//      1 corpse — behavior unchanged for non-player deaths.
//   A4 harness-visible: the same lazy live-capture projection the harness
//      uses (mirrors scripts/sim-harness.js) sees player:true for the A1 race.
//
// PART B — det-gate (patch dance, 2 seeds x 60d, pre-seat substrate):
//   MODE=control  run PART B on reverted code -> /tmp/teleflag-partb-control.json
//   MODE=armed    run PART B on fixed code   -> /tmp/teleflag-partb-armed.json
//   MODE=compare  assert: per-dawn state hashes byte-identical; death-tele
//                 streams identical with the player flag masked; corpse/fallen
//                 counts identical; the ONLY tele deltas are player:false->true
//                 flips on scholar-death teles.
//
// SMOKE=1 — fixture A1 only (fast, <60s). SMOKE must be green before sweep spend.
//
// Node harness: sim-harness (Math.random seeded BEFORE eval; Game.save never
// stubbed). Never run concurrent jest; --cacheDirectory=/tmp/jest-cache-*.
//
// Usage:
//   SMOKE=1 node scripts/test-teleflag-20261016.js
//   MODE=armed node scripts/test-teleflag-20261016.js            (full: A + B)
//   MODE=control node scripts/test-teleflag-20261016.js         (expect A1 RED)
//   MODE=compare node scripts/test-teleflag-20261016.js
'use strict';

const SMOKE = process.env.SMOKE === '1';
const MODE = process.env.MODE || 'armed'; // control | armed | compare
let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

function substrateEnv() {
  process.env.FEASTSCALE_R13 = '1';
  process.env.TRIBFLOOR = '1';
  process.env.SUCCGRACE = '1';
  process.env.RAIDDENSITY = '1';
  process.env.WINPURSUIT = '1';
  process.env.WINDEFER = '1';
  process.env.SEATDRIVE = '0';
}
substrateEnv();

function scholarVid(Game) {
  try { return (Game.state.scholar || {}).villagerId || Game.villagerId || null; } catch (e) { return null; }
}
function scholarName(Game, vid) {
  try {
    const c = (Game.data.villagers || []).find(x => x && x.id === vid) || {};
    return c.name || 'the scholar';
  } catch (e) { return 'the scholar'; }
}
function deathTeles(Game, vid) {
  try {
    return (Game.state.telemetry || []).filter(e => e && e.type === 'death' && String(e.who) === String(vid));
  } catch (e) { return []; }
}
function corpseCount(Game, vid) {
  try { return (Game.corpses() || []).filter(c => c && String(c.villagerId) === String(vid)).length; } catch (e) { return -1; }
}
function fallenCount(Game, vid) {
  try { return ((Game.state.village || {}).fallen || []).filter(f => f && String(f.villagerId) === String(vid)).length; } catch (e) { return -1; }
}

// installLazyCapture — test-local mirror of the harness live death capture
// (scripts/sim-harness.js, TELEFLAG block): lazy player off the tele record.
function installLazyCapture(Game) {
  const captured = [];
  const orig = Game.tele;
  Game.tele = function (type, data) {
    let r;
    try { r = orig.apply(this, arguments); } catch (e) { throw e; }
    try {
      if (type === 'death') {
        const tel = (this.state && this.state.telemetry) || [];
        const rec = tel.length ? tel[tel.length - 1] : null;
        const entry = { kind: data && data.kind, who: data && data.who, cause: data && data.cause };
        if (rec && rec.type === 'death' && String(rec.who) === String(entry.who)) {
          Object.defineProperty(entry, 'player', { enumerable: true, configurable: true, get: function () { return !!rec.player; } });
        } else {
          entry.player = !!(data && data.player);
        }
        captured.push(entry);
      }
    } catch (e) {}
    return r;
  };
  return captured;
}

async function freshGame(seed, harness) {
  const { loadGame, setupGame } = harness;
  const { Game } = await loadGame({ seed, mode: 'teleflag-fixture', fullTelemetry: true });
  await setupGame(Game);
  return Game;
}

async function fixtureA1(harness, quietLog) {
  // The s529 race: villager-death path registers the scholar FIRST (kind
  // 'person', no player flag), then the real playerDeath runs and its
  // internal registerDeath call no-ops on the double-death guard.
  console.log('A1 — s529 race: villager path wins, playerDeath no-ops');
  const Game = await freshGame(307, harness);
  const captured = installLazyCapture(Game);
  const vid = scholarVid(Game);
  const nm = scholarName(Game, vid);
  let r1 = null;
  await quietLog(async () => {
    r1 = Game.registerDeath({ kind: 'person', villagerId: vid, name: nm, cause: 'combat' });
    Game.playerDeath('combat');
  });
  const teles = deathTeles(Game, vid);
  check('A1 first registration made the corpse', !!(r1 && r1.id));
  check('A1 exactly one death tele for the scholar', teles.length === 1, `got ${teles.length}`);
  check('A1 tele carries player:true', teles.length === 1 && teles[0].player === true,
    teles.length ? `player=${teles[0].player}` : 'no tele');
  check('A1 exactly one corpse', corpseCount(Game, vid) === 1, `got ${corpseCount(Game, vid)}`);
  check('A1 exactly one fallen entry', fallenCount(Game, vid) === 1, `got ${fallenCount(Game, vid)}`);
  check('A1 mantle passed to a successor', scholarVid(Game) !== null && String(scholarVid(Game)) !== String(vid),
    `now ${scholarVid(Game)}`);
  const cap = captured.filter(e => String(e.who) === String(vid));
  check('A1 harness-style live capture sees player:true', cap.length === 1 && cap[0].player === true,
    cap.length ? `player=${cap[0].player}` : `captured ${cap.length}`);
}

async function fixtureA2(harness, quietLog) {
  // Normal order: playerDeath first, then a duplicate villager-path call.
  console.log('A2 — normal order: playerDeath first, duplicate after');
  const Game = await freshGame(418, harness);
  const vid = scholarVid(Game);
  const nm = scholarName(Game, vid);
  let r2 = 'unset';
  await quietLog(async () => {
    Game.playerDeath('combat');
    r2 = Game.registerDeath({ kind: 'person', villagerId: vid, name: nm, cause: 'combat' });
  });
  const teles = deathTeles(Game, vid);
  check('A2 duplicate registration no-op\'d', r2 === null, `got ${JSON.stringify(r2)}`);
  check('A2 exactly one death tele', teles.length === 1, `got ${teles.length}`);
  check('A2 tele carries player:true', teles.length === 1 && teles[0].player === true);
  check('A2 exactly one corpse', corpseCount(Game, vid) === 1, `got ${corpseCount(Game, vid)}`);
  check('A2 exactly one fallen entry', fallenCount(Game, vid) === 1, `got ${fallenCount(Game, vid)}`);
}

async function fixtureA3(harness, quietLog) {
  // Non-player double registration: behavior unchanged.
  console.log('A3 — non-player double registration (unchanged)');
  const Game = await freshGame(529, harness);
  const svid = scholarVid(Game);
  const w = ((Game.state.village || {}).roster || []).find(id => String(id) !== String(svid));
  if (!w) { check('A3 roster has a non-scholar villager', false); return; }
  const nm = scholarName(Game, w);
  let r = 'unset';
  await quietLog(async () => {
    Game.registerDeath({ kind: 'villager', villagerId: w, name: nm, cause: 'combat' });
    r = Game.registerDeath({ kind: 'villager', villagerId: w, name: nm, cause: 'combat' });
  });
  const teles = deathTeles(Game, w);
  check('A3 duplicate registration no-op\'d', r === null);
  check('A3 exactly one death tele', teles.length === 1, `got ${teles.length}`);
  check('A3 tele player stays false', teles.length === 1 && teles[0].player === false,
    teles.length ? `player=${teles[0].player}` : 'no tele');
  check('A3 exactly one corpse', corpseCount(Game, w) === 1, `got ${corpseCount(Game, w)}`);
}

async function partA() {
  console.log('PART A — double-registration race fixtures');
  const harness = require('./sim-harness');
  const quietLog = harness.quietLog || (async (fn) => fn());
  await fixtureA1(harness, quietLog);
  if (SMOKE) return;
  await fixtureA2(harness, quietLog);
  await fixtureA3(harness, quietLog);
}

async function runFingerprint(policyId, seed) {
  // 60d run returning per-dawn state hashes + death-tele stream + counts.
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const SD = require('./policies/seatdrive');
  const POLICIES = { leadfeast: SD.leadseat, belongfeast: SD.belongseat };
  const { Game, manifest } = await loadGame({ seed, mode: 'teleflag-partb', fullTelemetry: true });
  await setupGame(Game);
  const hs = [];
  const base = POLICIES[policyId];
  const policy = Object.assign({}, base);
  const od = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = G.state.scholar || {}, v = G.state.village || {};
      const m = (o) => Object.keys(o || {}).sort().map(k => k + '=' + Math.round(o[k] || 0)).join(',');
      hs.push([s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
        (v.roster || []).length, m(v.trust), m(v.takes), m(v.gives)].join('|'));
    } catch (e) { hs.push('ERR'); }
    if (od) { try { return od(G, ctx); } catch (e) {} }
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 60, manifest }); });
  let teles = [];
  try {
    teles = (Game.state.telemetry || []).filter(e => e && e.type === 'death')
      .map(e => ({ day: e.day, kind: e.kind, who: String(e.who), cause: e.cause, player: !!e.player }));
  } catch (e) {}
  let corpses = 0, fallen = 0;
  try { corpses = (Game.corpses() || []).length; } catch (e) {}
  try { fallen = ((Game.state.village || {}).fallen || []).length; } catch (e) {}
  return { policy: policyId, seed, hashes: hs, teles, corpses, fallen, days: result && result.days };
}

async function partB() {
  console.log(`PART B — det-gate fingerprints (MODE=${MODE})`);
  const fs = require('fs');
  const out = [];
  for (const [pid, seed] of [['leadfeast', 307], ['belongfeast', 529]]) {
    console.log(`  run ${pid} s${seed}`);
    out.push(await runFingerprint(pid, seed));
  }
  const path = `/tmp/teleflag-partb-${MODE}.json`;
  fs.writeFileSync(path, JSON.stringify(out));
  console.log(`  wrote ${path}`);
}

function partCompare() {
  console.log('PART B — compare control vs armed');
  const fs = require('fs');
  const c = JSON.parse(fs.readFileSync('/tmp/teleflag-partb-control.json', 'utf8'));
  const a = JSON.parse(fs.readFileSync('/tmp/teleflag-partb-armed.json', 'utf8'));
  check('compare same run set', c.length === a.length && c.length === 2, `${c.length} vs ${a.length}`);
  for (let i = 0; i < c.length; i++) {
    const tag = `${c[i].policy}/s${c[i].seed}`;
    check(`compare ${tag} per-dawn state hashes identical`,
      JSON.stringify(c[i].hashes) === JSON.stringify(a[i].hashes));
    const mask = (t) => t.map(e => ({ day: e.day, kind: e.kind, who: e.who, cause: e.cause }));
    check(`compare ${tag} death teles identical (player masked)`,
      JSON.stringify(mask(c[i].teles)) === JSON.stringify(mask(a[i].teles)));
    check(`compare ${tag} corpse count identical`, c[i].corpses === a[i].corpses,
      `${c[i].corpses} vs ${a[i].corpses}`);
    check(`compare ${tag} fallen count identical`, c[i].fallen === a[i].fallen,
      `${c[i].fallen} vs ${a[i].fallen}`);
    check(`compare ${tag} days identical`, c[i].days === a[i].days, `${c[i].days} vs ${a[i].days}`);
    // the ONLY allowed tele delta: player:false -> true flips
    let bad = 0, flips = 0;
    const amap = new Map(a[i].teles.map(e => [`${e.day}|${e.who}|${e.cause}`, e]));
    for (const e of c[i].teles) {
      const k = `${e.day}|${e.who}|${e.cause}`;
      const ae = amap.get(k);
      if (!ae) { bad++; continue; }
      if (ae.player === e.player) continue;
      if (e.player === false && ae.player === true) { flips++; continue; }
      bad++;
    }
    if (amap.size !== c[i].teles.length) bad++;
    check(`compare ${tag} only player:false->true flips differ`, bad === 0, `flips=${flips} bad=${bad}`);
    if (flips) console.log(`    (info) ${tag}: ${flips} tele(s) flipped player:false->true (the fix)`);
  }
}

async function main() {
  if (MODE === 'compare') { partCompare(); }
  else {
    await partA();
    if (!SMOKE) await partB();
  }
  console.log(failures ? `\n${failures} FAILURES` : '\nALL GREEN');
  process.exit(failures ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
