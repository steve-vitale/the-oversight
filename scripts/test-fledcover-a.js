#!/usr/bin/env node
// scripts/test-fledcover-a.js — sim-fledcover-a proof + scenario harness.
//
// QUESTION (1122Z ranked-next #2): the fled half of lingerer-keeps is
// unobserved on the 75101-75116 band (0 tbend 'fled' events). This
// script produces fled lingerer fights through the ENGINE and
// classifies their restore outcome — never an outcome table, never a
// direct tbEnd('fled') call.
//
// MODES:
//   node scripts/test-fledcover-a.js
//       fixtures only (pure classifier tests, fast, no harness).
//   node scripts/test-fledcover-a.js --scenarios [--seed N] [--out PATH]
//       fixtures (must pass) + the three scripted scenarios, writing
//       the scenario JSON to --out (or stdout when --out is absent).
//       Exits nonzero if any scenario fails to reach tbEnd('fled'),
//       AFTER writing its JSON — a failed production is loud, not
//       silent, and never re-scored as fled.
//
// SCENARIOS (seed 75102 for the judged run; the RNG stream is seeded
// before eval by sim-harness, so a re-run at the same seed is
// byte-identical modulo nothing stored: no fight ids, no timestamps,
// no absolute paths in the JSON):
//   S-clear:   gallowdeer lingerer (follows:false), scholar inside
//     Haven, >= 2 damaging strikes, then flee through the Haven door
//     (the engine's own door branch: step on a door tile -> tbEnd).
//     Tile clear at tbEnd. Predicted: RESTORED.
//   S-blocked: same, plus a fellow besieger (callback, 200 HP,
//     lingering) spawned on the SAME tile before startCombat, so it
//     still stands on the tile at tbEnd. Predicted: BLOCKED.
//   S-chase:   bulldozer lingerer (follows:true), scholar OUTSIDE
//     Haven, >= 2 damaging strikes, then flee through repeated
//     barrier crossings until pursuit exhausts. Tile clear at tbEnd.
//     Predicted: RESTORED.
// Scenario setup, documented (measurement instrument, not a game
// change): scholar placed on the haven tile (map 4,4); the lingerer
// spawned there with lingering=true, raidBorn=true; all other
// villagers moved to the neighbouring node (3,4) via npcSetNode so
// the scholar faces the besieger alone (solo scholar fights are
// the scholarmelt corpus's own shape); scholar grid position (4,4).
// No Game.save stub, no RNG drawn by the harness itself, no default
// touched. The fight itself is engine-real: strikes land with real
// stats, monster turns advance via tbPlayerEndTurn/tbAdvance, and
// the flee goes through tbPlayerMove + tbBarrierExit (or the door
// branch), exactly as a player's would.
'use strict';
const fs = require('fs');
const path = require('path');

// ---- pure classifier (shared with the analyzer's verdict rule) ----
function isLingerer(origin) { return !!(origin && origin.lingering && !origin.titan); }
function classifyFled(o) {
  if (!o || o.result !== 'fled') return 'NOT-FLED:' + (o ? String(o.result) : 'none');
  if (!isLingerer(o.origin)) return 'NOT-LINGERER';
  if (o.originInWorld) return 'RESTORED';
  if (o.occupant) return 'BLOCKED';
  return 'UNCLASSIFIED';
}
function restoreHpCap(preHp, fighterEndHp) {
  const pre = (preHp != null && isFinite(preHp)) ? preHp : 1;
  const end = (fighterEndHp != null && isFinite(fighterEndHp)) ? fighterEndHp : 1;
  return Math.max(1, Math.min(pre, end));
}

// ---- fixtures ----
function runFixtures() {
  const cases = [
    // [name, input, expected]
    ['clear fled restores', { result: 'fled', origin: { lingering: true, titan: false }, originInWorld: true, occupant: null }, 'RESTORED'],
    ['blocked fled melts', { result: 'fled', origin: { lingering: true, titan: false }, originInWorld: false, occupant: { id: 'callback', hp: 1 } }, 'BLOCKED'],
    ['blocked by lingering-cleared besieger still blocks (occupancy, not lingering)', { result: 'fled', origin: { lingering: true, titan: false }, originInWorld: false, occupant: { id: 'spool', lingering: false } }, 'BLOCKED'],
    ['absent origin + no occupant is unclassified, never restored', { result: 'fled', origin: { lingering: true, titan: false }, originInWorld: false, occupant: null }, 'UNCLASSIFIED'],
    ['lost is not fled', { result: 'lost', origin: { lingering: true, titan: false }, originInWorld: true, occupant: null }, 'NOT-FLED:lost'],
    ['won is not fled', { result: 'won', origin: { lingering: true, titan: false }, originInWorld: false, occupant: null }, 'NOT-FLED:won'],
    ['routed lingerer is not fled (by-design, not in population)', { result: 'routed', origin: { lingering: true, titan: false }, originInWorld: false, occupant: null }, 'NOT-FLED:routed'],
    ['dissolved is not fled', { result: 'dissolved-no-tbend', origin: { lingering: true, titan: false }, originInWorld: true, occupant: null }, 'NOT-FLED:dissolved-no-tbend'],
    ['fled titan is not a lingerer fight', { result: 'fled', origin: { lingering: false, titan: true }, originInWorld: true, occupant: null }, 'NOT-LINGERER'],
    ['fled wild monster (no origin) is not a lingerer fight', { result: 'fled', origin: null, originInWorld: false, occupant: null }, 'NOT-LINGERER'],
    ['fled non-lingering world monster is not a lingerer fight', { result: 'fled', origin: { lingering: false, titan: false }, originInWorld: true, occupant: null }, 'NOT-LINGERER'],
    ['restore cap: fighter end HP below pre-fight HP wins', {}, null], // placeholder replaced below
  ];
  let pass = 0, fail = 0;
  const failures = [];
  for (const [name, input, expected] of cases) {
    if (expected === null) continue;
    let got;
    try { got = classifyFled(input); } catch (e) { got = 'THREW:' + String((e && e.message) || e); }
    if (got === expected) pass++;
    else { fail++; failures.push(name + ': got ' + got + ', want ' + expected); }
  }
  // restore-cap unit checks (wall-wounds rule: min(preHp, fighterEndHp), floor 1)
  const capCases = [
    ['cap below preHp', 400, 130, 130],
    ['cap at preHp when fighter above it', 150, 158, 150],
    ['cap floor 1', 400, 0, 1],
    ['cap floor 1 on negative', 400, -5, 1],
  ];
  for (const [name, pre, end, want] of capCases) {
    const got = restoreHpCap(pre, end);
    if (got === want) pass++;
    else { fail++; failures.push('restore-cap ' + name + ': got ' + got + ', want ' + want); }
  }
  // isLingerer checks
  const lingCases = [
    ['lingering non-titan is lingerer', { lingering: true, titan: false }, true],
    ['lingering titan is not (titan branch)', { lingering: true, titan: true }, false],
    ['non-lingering is not', { lingering: false, titan: false }, false],
    ['null is not', null, false],
  ];
  for (const [name, input, want] of lingCases) {
    const got = isLingerer(input);
    if (got === want) pass++;
    else { fail++; failures.push('isLingerer ' + name + ': got ' + got + ', want ' + want); }
  }
  return { pass, fail, failures, total: pass + fail };
}

// ---- scenario harness (engine-real fights) ----
function cheb(a, b) { return Math.max(Math.abs(a.mx - b.mx), Math.abs(a.my - b.my)); }

async function runScenario(Game, name, opts) {
  const hx = Game.map.px, hy = Game.map.py;
  if (opts.outside) Game.state.scholar.insideHaven = false;
  for (const rid of (Game.state.village.roster || [])) {
    if (rid !== Game.villagerId) { try { Game.npcSetNode(rid, 3, 4); } catch (e) {} }
  }
  const lingerer = Game.spawnWorldMonster(opts.monster, hx, hy,
    { lingering: true, raidBorn: true, mx: 5, my: 5, hp: opts.hp, maxHp: opts.hp });
  let blockerPre = null;
  if (opts.blocker) {
    const b = Game.spawnWorldMonster(opts.blocker, hx, hy,
      { lingering: true, raidBorn: true, mx: 6, my: 6, hp: opts.blockerHp, maxHp: opts.blockerHp });
    blockerPre = { id: b.id, hp: b.hp, maxHp: b.maxHp, wave: b.wave || null, lingering: !!b.lingering, raidBorn: !!b.raidBorn, tx: b.tx, ty: b.ty };
  }
  const preHp = lingerer.hp;
  Game.state.scholar.mx = 4; Game.state.scholar.my = 4;
  Game.startCombat(opts.monster);
  const f = Game.tbfight;
  const origin = f && f.worldOrigin;
  const log = { scenario: name, monster: opts.monster, blockerPre,
    origin: origin ? { id: origin.id, lingering: !!origin.lingering, titan: !!origin.titan, tx: origin.tx, ty: origin.ty, hp: origin.hp } : null,
    fighters: f ? f.fighters.map(x => x.kind + ':' + x.key) : null,
    strikes: [], steps: [], fledVia: null, barrierCrossings: 0 };
  if (!f || !origin) { log.production = 'FAILED-NO-ORIGIN'; log.classification = 'NOT-LINGERER'; return log; }
  let dmgStrikes = 0, guard = 0;
  while (f && !f.over && guard++ < 150) {
    const p = Game.tbFighter('p');
    if (!p || !p.alive) { log.production = 'FAILED-SCHOLAR-DOWN'; break; }
    if (Game.tbIsPlayerTurn()) {
      const tgt = f.fighters.find(x => x.kind === 'monster' && x.alive && !x.fled);
      if (!tgt) break;
      if (dmgStrikes < 2) {
        if (cheb(p, tgt) <= 1) {
          const before = tgt.hp;
          const ok = Game.tbPlayerStrike(tgt.key);
          const dealt = before - tgt.hp;
          log.strikes.push({ round: f.round, ok: !!ok, dealt, monsterHp: before + '->' + tgt.hp, playerHp: p.hp });
          if (dealt > 0) dmgStrikes++;
          if (!f.over && Game.tbIsPlayerTurn()) Game.tbPlayerEndTurn();
        } else {
          let moved = false;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
            const tx = tgt.mx + dx, ty = tgt.my + dy;
            if (tx < 0 || tx > 8 || ty < 0 || ty > 8) continue;
            const path = Game.findPath(p.mx, p.my, tx, ty);
            if (!path || !path.length) continue;
            let cost = 0, take = 0;
            for (const [ax, ay] of path) { const c = Game.tbTerrainCost(ax, ay); if (cost + c > p.moveLeft) break; cost += c; take++; }
            if (!take) continue;
            const dest = path[take - 1];
            Game.tbPlayerMove(dest[0], dest[1]);
            log.strikes.push({ round: f.round, action: 'approach', to: dest, now: p.mx + ',' + p.my, playerHp: p.hp });
            moved = true; break;
          }
          if (!moved) log.strikes.push({ round: f.round, action: 'approach-failed', at: p.mx + ',' + p.my, tgt: tgt.mx + ',' + tgt.my });
          if (!f.over && Game.tbIsPlayerTurn()) Game.tbPlayerEndTurn();
        }
        continue;
      }
      // flee phase
      if (!opts.outside) {
        const path = Game.findPath(p.mx, p.my, 4, 6);
        if (!path || !path.length) { log.steps.push({ stuck: 'no-path-door', at: p.mx + ',' + p.my }); break; }
        let cost = 0, take = 0;
        for (const [tx, ty] of path) { const c = Game.tbTerrainCost(tx, ty); if (cost + c > p.moveLeft) break; cost += c; take++; }
        if (take === 0) { Game.tbPlayerEndTurn(); continue; }
        const dest = path[take - 1];
        Game.tbPlayerMove(dest[0], dest[1]);
        log.steps.push({ move: dest, now: p.mx + ',' + p.my, over: !!f.over, result: f.result || null });
        if (f.over) { log.fledVia = 'door'; break; }
        if (Game.tbIsPlayerTurn()) Game.tbPlayerEndTurn();
      } else {
        if (p.mx === 0 || p.mx === 8 || p.my === 0 || p.my === 8) {
          const dx = p.mx === 0 ? -1 : (p.mx === 8 ? 1 : 0);
          const dy = p.my === 0 ? -1 : (p.my === 8 ? 1 : 0);
          const ok = Game.tbBarrierExit(dx, dy);
          log.barrierCrossings++;
          log.steps.push({ at: p.mx + ',' + p.my, barrierExit: !!ok, over: !!f.over, result: f.result || null, map: Game.map.px + ',' + Game.map.py });
          if (f.over) { log.fledVia = 'barrier'; break; }
          if (Game.tbIsPlayerTurn()) Game.tbPlayerEndTurn();
          continue;
        }
        const edges = [[0, p.my], [8, p.my], [p.mx, 0], [p.mx, 8]];
        let path = null;
        for (const e of edges) { path = Game.findPath(p.mx, p.my, e[0], e[1]); if (path && path.length) break; }
        if (!path || !path.length) { log.steps.push({ stuck: 'no-path-edge', at: p.mx + ',' + p.my }); break; }
        let cost = 0, take = 0;
        for (const [tx, ty] of path) { const c = Game.tbTerrainCost(tx, ty); if (cost + c > p.moveLeft) break; cost += c; take++; }
        if (take === 0) { Game.tbPlayerEndTurn(); continue; }
        const dest = path[take - 1];
        Game.tbPlayerMove(dest[0], dest[1]);
        log.steps.push({ move: dest, now: p.mx + ',' + p.my, moveLeft: p.moveLeft });
        if (Game.tbIsPlayerTurn()) Game.tbPlayerEndTurn();
      }
    } else { Game.tbAdvance(); }
  }
  const inWorld = Game.worldMonsters().find(m => m === origin);
  const occ = origin ? Game.monsterAt(origin.tx, origin.ty) : null;
  const fighterEnd = (f.fighters || []).find(x => x.kind === 'monster');
  log.result = f.result || null;
  log.over = !!f.over;
  log.damagingStrikes = dmgStrikes;
  // After tbEnd the fight object is cleared, so tbFighter('p') reads
  // null here; tbEnd overwrites scholar.health with the fighter's end
  // HP, which is the honest post-fight scholar HP.
  try { log.playerHpEnd = (Game.state && Game.state.scholar) ? Math.round(Game.state.scholar.health) : null; } catch (e) { log.playerHpEnd = null; }
  log.fighterEndHp = fighterEnd ? fighterEnd.hp : null;
  log.originInWorld = !!inWorld;
  log.originHpAfter = inWorld ? inWorld.hp : null;
  log.originTileAfter = inWorld ? (inWorld.tx + ',' + inWorld.ty) : null;
  log.occupantAfter = occ ? { id: occ.id, hp: occ.hp, wave: occ.wave || null, lingering: !!occ.lingering, raidBorn: !!occ.raidBorn, tx: occ.tx, ty: occ.ty, sameAsOrigin: occ === origin } : null;
  log.restoreCapCheck = (log.originInWorld && fighterEnd)
    ? { expected: restoreHpCap(preHp, fighterEnd.hp), actual: inWorld.hp, match: restoreHpCap(preHp, fighterEnd.hp) === inWorld.hp }
    : null;
  log.classification = classifyFled({ result: f.result, origin: log.origin, originInWorld: log.originInWorld, occupant: log.occupantAfter });
  log.production = (f.result === 'fled' && isLingerer(log.origin)) ? 'FLED-LINGERER' : 'FAILED-PRODUCTION:' + String(f.result);
  return log;
}

async function runScenarios(seed) {
  // sim-harness is required lazily so fixture-only runs stay harness-free.
  const { loadGame, setupGame } = require('./sim-harness');
  const out = [];
  const defs = [
    ['S-clear', { monster: 'gallowdeer', hp: 400 }],
    ['S-blocked', { monster: 'gallowdeer', hp: 400, blocker: 'callback', blockerHp: 200 }],
    ['S-chase', { monster: 'bulldozer', hp: 400, outside: true }],
  ];
  for (const [name, opts] of defs) {
    const { Game } = await loadGame({ seed, mode: 'fledcover-a', fullTelemetry: false });
    await setupGame(Game);
    out.push(await runScenario(Game, name, opts));
  }
  return { seed, scenarios: out };
}

async function main() {
  const args = process.argv.slice(2);
  const fx = runFixtures();
  if (fx.fail) {
    console.log('FIXTURES-FAIL ' + fx.pass + '/' + fx.total);
    for (const m of fx.failures) console.log('  FAIL ' + m);
    process.exit(1);
  }
  console.log('FIXTURES-PASS ' + fx.pass + '/' + fx.total);
  if (!args.includes('--scenarios')) return;
  let seed = 75102, outPath = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--seed') seed = parseInt(args[i + 1], 10);
    if (args[i] === '--out') outPath = args[i + 1];
  }
  const doc = await runScenarios(seed);
  const body = JSON.stringify(doc, null, 1) + '\n';
  if (outPath) fs.writeFileSync(outPath, body);
  else process.stdout.write(body);
  const bad = doc.scenarios.filter(s => s.production !== 'FLED-LINGERER');
  console.log('SCENARIOS ' + doc.scenarios.map(s => s.scenario + '=' + s.classification).join(' '));
  if (bad.length) {
    console.log('SCENARIO-FAIL ' + bad.map(s => s.scenario + ':' + s.production).join(' '));
    process.exit(1);
  }
  console.log('SCENARIOS-PASS 3/3 fled lingerer fights classified');
}
main().catch(e => { console.error('TEST-FLEDCOVER-FAIL', e && e.stack || e); process.exit(1); });

module.exports = { isLingerer, classifyFled, restoreHpCap, runFixtures };
