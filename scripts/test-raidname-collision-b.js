#!/usr/bin/env node
// test-raidname-collision-b.js — proof for sim-raidname-collision-b
// (DIAG ONLY: no src/js change is tested here, only the collision
// mechanism of the landed raidname wording + the corpus instrument).
//   T-B1 (fixture): a NON-RAID pending of species X resolving while
//       a raidBorn lingerer of species X sits on the player tile
//       says the raid line — path (b) species misfire, distinct
//       individuals, non-raid provenance. Controls: no raidBorn
//       tile entity -> no line; raid pending resolving -> line
//       (correct case, not a collision).
//   T-A1 (fixture): a raid shadow X live + a NON-MATCHING fight
//       clears the raid pending but KEEPS the shadow (orphan);
//       a later non-raid pending of X resolving then says the
//       raid line — path (a) orphan misfire. Control: a matching
//       first fight consumes the shadow (no orphan).
//   T-ORIGIN (fixture): direct tile fights validate the analyzer's
//       origin model (raidBorn tile entity -> line; non-raid -> none).
//   T-CORPUS (--corpus ON --base-corpus OFF [--analysis FILE]):
//       instrument integrity (shadowLog + collision fields present),
//       OFF-vs-ON neutrality on shared fields (new collision fields
//       stripped), analyzer arithmetic invariants, pilot move counts.
// Run (fixtures only): node scripts/test-raidname-collision-b.js
// Run (full): node scripts/test-raidname-collision-b.js --corpus
//   evidence/2026-10-29/sim-raidname-collision-b-corpus
//   --base-corpus evidence/2026-10-29/sim-raidname-collision-b-corpus-off
//   --analysis evidence/2026-10-29/sim-raidname-collision-b-analysis.json
// Exit 0 = all green (SKIPs reported, never converted to passes).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

let pass = 0, fail = 0, skip = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  PASS ' + label); }
  else { fail++; console.log('  FAIL ' + label); }
}
const args = process.argv.slice(2);
let corpus = null, baseCorpus = null, analysis = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--corpus') corpus = args[++i];
  else if (args[i] === '--base-corpus') baseCorpus = args[++i];
  else if (args[i] === '--analysis') analysis = args[++i];
}
const RAID_LINE = 'This one came with the raid on Haven';

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'raidname-proof', fullTelemetry: true });
  await setupGame(Game);
  await runDays(Game, oracleV2, { days: 10 });
  const v = Game.state.village || {};
  const hx = v.px ?? 4, hy = v.py ?? 4;
  try { Game.map.px = hx; Game.map.py = hy; } catch (e) {}
  try { if (!Game.playerAtHaven()) Game.travelTo(hx, hy); } catch (e) {}
  return { Game, v, hx, hy };
}
function startCombatCapture(Game, monsterId) {
  const lines = [];
  const orig = Game.say;
  Game.say = function (...a) { try { lines.push(String(a[0] || '')); } catch (e) {} return orig.apply(this, a); };
  let err = null;
  try { Game.startCombat(monsterId); } catch (e) { err = String(e && e.message); }
  Game.say = orig;
  return { lines, err };
}
// Tile crowding (raidguard fixture note): staging runDays can leave
// raidBorn lingerers on the haven tile, and monsterAt() returns the
// FIRST tile monster — a bystander shadows the staged monster for
// playerMonster(). Clear the player tile before staging a tile
// entity, and assert playerMonster() is the staged entity.
function clearTileMonsters(Game, hx, hy) {
  try {
    const wms = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    const onTile = wms.filter((m) => m && m.tx === hx && m.ty === hy);
    for (const m of onTile) { try { Game.removeWorldMonster(m); } catch (e) {} }
  } catch (e) {}
}
function playerMonsterId(Game) {
  try { const pm = Game.playerMonster(); return pm ? pm.id : null; } catch (e) { return null; }
}
function endFight(Game) {
  try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd && Game.tbEnd('fled'); } catch (e) {}
}
// Harness-style pending resolution: the harness pending block
// clears the two pending fields, then calls startCombat(mid).
// The shadow is deliberately NOT touched (the harness clears
// only the two pending fields) — that is the raidname design.
function resolvePending(Game, mid) {
  Game.pendingEncounter = false; Game.pendingMonsterId = null;
  return startCombatCapture(Game, mid);
}

async function main() {
  console.log('T-B1: non-raid pending + raidBorn same-species lingerer on tile');
  {
    const { Game, hx, hy } = await freshGame(515011);
    clearTileMonsters(Game, hx, hy);
    const m = Game.spawnWorldMonster({ id: 'bulldozer' }, hx, hy, {});
    m.raidBorn = true;
    try { Game.syncMonsterAlias(); } catch (e) {}
    ok(playerMonsterId(Game) === 'bulldozer', 'B1 precondition: tile monster is the staged bulldozer');
    // Stage a NON-RAID pending (wanderer provenance in fiction;
    // the fixture stages the pending state — the corpus leg
    // classifies real setter stacks, this fixture proves the
    // naming decision given a non-raid pending + raidBorn tile).
    Game.pendingEncounter = true; Game.pendingMonsterId = 'bulldozer';
    Game.raidPendingMonsterId = null;
    const r = resolvePending(Game, 'bulldozer');
    ok(!r.err, 'B1 resolution runs (err=' + r.err + ')');
    ok(r.lines.some((l) => l.includes(RAID_LINE)), 'B1 raid line FIRES on non-raid pending (collision: fought monster is a fresh instantiation, tile entity is a different individual)');
    endFight(Game);
  }
  {
    const { Game, hx, hy } = await freshGame(515012);
    clearTileMonsters(Game, hx, hy);
    Game.spawnWorldMonster({ id: 'bulldozer' }, hx, hy, {});
    try { Game.syncMonsterAlias(); } catch (e) {}
    ok(playerMonsterId(Game) === 'bulldozer', 'B1-control precondition: tile monster is the staged bulldozer');
    Game.pendingEncounter = true; Game.pendingMonsterId = 'bulldozer';
    Game.raidPendingMonsterId = null;
    const r = resolvePending(Game, 'bulldozer');
    ok(!r.err, 'B1-control runs (err=' + r.err + ')');
    ok(!r.lines.some((l) => l.includes(RAID_LINE)), 'B1-control no raid line without raidBorn tile entity');
    endFight(Game);
  }
  {
    const { Game } = await freshGame(515013);
    Game.pendingEncounter = true; Game.pendingMonsterId = 'bulldozer';
    Game.raidPendingMonsterId = 'bulldozer';
    const r = resolvePending(Game, 'bulldozer');
    ok(!r.err, 'B1-raid-control runs (err=' + r.err + ')');
    ok(r.lines.some((l) => l.includes(RAID_LINE)), 'B1-raid-control raid line fires for a genuine raid pending (correct case)');
    ok(!Game.raidPendingMonsterId, 'B1-raid-control shadow consumed on match');
    endFight(Game);
  }
  console.log('T-A1: mismatch fight orphans the shadow; later non-raid same-species fight misnames');
  {
    const { Game } = await freshGame(515014);
    Game.pendingEncounter = true; Game.pendingMonsterId = 'bulldozer';
    Game.raidPendingMonsterId = 'bulldozer';
    const r1 = startCombatCapture(Game, 'murkcap');
    ok(!r1.err, 'A1 mismatch fight runs (err=' + r1.err + ')');
    ok(!r1.lines.some((l) => l.includes(RAID_LINE)), 'A1 no raid line on the mismatch fight');
    ok(Game.pendingEncounter === false, 'A1 mismatch fight clears the raid pending');
    ok(Game.raidPendingMonsterId === 'bulldozer', 'A1 shadow KEPT after mismatch fight (orphan created)');
    endFight(Game);
    Game.pendingEncounter = true; Game.pendingMonsterId = 'bulldozer';
    const r2 = resolvePending(Game, 'bulldozer');
    ok(!r2.err, 'A1 orphan resolution runs (err=' + r2.err + ')');
    ok(r2.lines.some((l) => l.includes(RAID_LINE)), 'A1 raid line FIRES on non-raid pending via orphan shadow (collision: raid pending is dead)');
    ok(!Game.raidPendingMonsterId, 'A1 orphan shadow consumed by the misfire');
    endFight(Game);
  }
  {
    const { Game } = await freshGame(515015);
    Game.pendingEncounter = true; Game.pendingMonsterId = 'bulldozer';
    Game.raidPendingMonsterId = 'bulldozer';
    const r = resolvePending(Game, 'bulldozer');
    ok(!r.err, 'A1-control runs (err=' + r.err + ')');
    ok(r.lines.some((l) => l.includes(RAID_LINE)), 'A1-control raid line fires on the matching raid fight');
    ok(!Game.raidPendingMonsterId, 'A1-control shadow consumed, no orphan');
    endFight(Game);
  }
  console.log('T-ORIGIN: direct tile fights validate the origin model');
  {
    const { Game, hx, hy } = await freshGame(515016);
    clearTileMonsters(Game, hx, hy);
    const m = Game.spawnWorldMonster({ id: 'hushwolf' }, hx, hy, {});
    m.raidBorn = true;
    try { Game.syncMonsterAlias(); } catch (e) {}
    ok(playerMonsterId(Game) === 'hushwolf', 'ORIGIN-raid precondition: tile monster is the staged hushwolf');
    const r = startCombatCapture(Game, 'hushwolf');
    ok(!r.err, 'ORIGIN-raid runs (err=' + r.err + ')');
    ok(r.lines.some((l) => l.includes(RAID_LINE)), 'ORIGIN-raid direct tile fight against raidBorn entity says the line (correct case)');
    endFight(Game);
  }
  {
    const { Game, hx, hy } = await freshGame(515017);
    clearTileMonsters(Game, hx, hy);
    Game.spawnWorldMonster({ id: 'hushwolf' }, hx, hy, {});
    try { Game.syncMonsterAlias(); } catch (e) {}
    ok(playerMonsterId(Game) === 'hushwolf', 'ORIGIN-control precondition: tile monster is the staged hushwolf');
    const r = startCombatCapture(Game, 'hushwolf');
    ok(!r.err, 'ORIGIN-control runs (err=' + r.err + ')');
    ok(!r.lines.some((l) => l.includes(RAID_LINE)), 'ORIGIN-control direct tile fight against non-raid entity says no line');
    endFight(Game);
  }

  if (corpus && baseCorpus) {
    console.log('T-CORPUS: instrument integrity + OFF/ON neutrality + analyzer invariants');
    const stripCollision = (o) => {
      if (Array.isArray(o)) return o.map(stripCollision);
      if (o && typeof o === 'object') {
        const out = {};
        for (const [k, val] of Object.entries(o)) {
          if (k === 'shadowLog' || k === 'shadowLogError' || k === 'collisionTraceOn') continue;
          if (k === 'shadowAtEntry' || k === 'originAtEntry' || k === 'fightSpecies' ||
              k === 'raidLineFired' || k === 'pendingMatch' || k === 'entityMatchCandidate') continue;
          if (k === 'stackLines' && Array.isArray(val) && o.why !== undefined) continue; // pendingLog stackLines (ON only)
          // Attempt-only fields (ON only): caller stacks + post-call
          // position on attempt records (attempts carry hadLive).
          // Creation stacks/positions exist OFF and ON and are kept.
          if (o.hadLive !== undefined && (k === 'stackFrames' || k === 'stackLines' || k === 'pos')) continue;
          // foSeq is the SHARED fight-origin order counter: the ON
          // instrument adds shadow transitions to that order, so
          // ON foSeq values run ahead of OFF values after the
          // first shadow. Recorder metadata, not trajectory
          // content — same class as the stackLines strip in
          // test-raidname-b.js. The comparison therefore proves
          // every non-order field deep-equal; the order itself
          // is validated by the analyzer running self-
          // consistently on the ON corpus (invariants below).
          if (k === 'foSeq') continue;
          out[k] = stripCollision(val);
        }
        return out;
      }
      return o;
    };
    const files = fs.readdirSync(corpus).filter((f) => f.endsWith('.json')).sort();
    const baseFiles = fs.readdirSync(baseCorpus).filter((f) => f.endsWith('.json')).sort();
    let neutBad = 0, integBad = 0, shadowSets = 0;
    const pilotMoves = { 10710: 328, 10711: 283, 10712: 230, 10713: 281, 10714: 225, 10715: 214, 10716: 182, 10717: 261 };
    let movesBad = 0;
    for (const f of files) {
      const on = JSON.parse(fs.readFileSync(path.join(corpus, f), 'utf8'));
      if (!Array.isArray(on.shadowLog)) integBad++;
      else shadowSets += on.shadowLog.filter((e) => e.newValue !== null && e.oldValue !== e.newValue).length;
      for (const c of (on.fightCreations || [])) {
        if (c.shadowAtEntry === undefined || c.originAtEntry === undefined || c.raidLineFired === undefined) integBad++;
      }
      for (const a of (on.fightAttempts || [])) {
        if (!a.hadLive && !a.liveNow) {
          if (a.shadowAtEntry === undefined || a.originAtEntry === undefined || a.raidLineFired === undefined || a.fightSpecies === undefined) integBad++;
        }
      }
      if (pilotMoves[on.seed] !== undefined && on.moves.length !== pilotMoves[on.seed]) movesBad++;
      if (!baseFiles.includes(f)) continue;
      const base = JSON.parse(fs.readFileSync(path.join(baseCorpus, f), 'utf8'));
      if (JSON.stringify(stripCollision(base)) !== JSON.stringify(stripCollision(on))) neutBad++;
    }
    ok(integBad === 0, `instrument integrity: shadowLog + collision fields present on all ON files/creations (bad=${integBad})`);
    ok(neutBad === 0, `OFF/ON neutrality: shared fields deep-equal (${files.length - neutBad}/${files.length} ON files matched to OFF)`);
    ok(movesBad === 0, `pilot move counts match raidname band (bad=${movesBad})`);
    ok(shadowSets > 0, `shadowLog records raid shadows on the band (sets=${shadowSets})`);
    if (analysis) {
      const an = JSON.parse(fs.readFileSync(analysis, 'utf8'));
      const t = an.totals || {};
      ok(Array.isArray(an.collisions) && an.collisions.length === t.collisions, `analyzer invariant: collisions list length == totals.collisions (${(an.collisions || []).length} == ${t.collisions})`);
      ok(t.collisionA + t.collisionB === t.collisions, `analyzer invariant: A + B == collisions (${t.collisionA} + ${t.collisionB} == ${t.collisions})`);
      ok(Array.isArray(an.oppBList) && an.oppBList.length === t.oppB, `analyzer invariant: oppB list == totals.oppB (${(an.oppBList || []).length} == ${t.oppB})`);
      ok(t.oppBFired + t.oppBNotFired === t.oppB, `analyzer invariant: oppB fired + not-fired == oppB (${t.oppBFired} + ${t.oppBNotFired} == ${t.oppB})`);
    } else {
      skip++; console.log('  SKIP analyzer invariants (no --analysis given)');
    }
  } else {
    console.log('T-CORPUS skipped (no --corpus/--base-corpus given)');
  }
  console.log(`RESULT pass=${pass} fail=${fail} skip=${skip}`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('FATAL', e && e.stack || e); process.exit(2); });
