#!/usr/bin/env node
// scripts/test-cascade-b.js — sim-cascade-b proof: the lingerer-holds-
// the-treeline lever (src/js/game.js monsterTurn).
//
// THE LEVER (see evidence/2026-11-15/sim-cascade-b-prereg.md + the
// Stage 1 diag in sim-cascade-b.md): a lingering raider is a siege,
// answered by sortie or endurance — not a duel. monsterTurn() had no
// safe-tile check, so the besieger pinned to the Haven tile stepped
// onto the scholar (inside the hall, on the Haven tile) and started a
// turn-based fight it always wins solo; on 'lost' tbEnd restores it
// wounded and it kills the next bearer the same way. The guard returns
// early from monsterTurn() when the player-tile monster is lingering:
// it does not move onto the scholar and does not start combat on
// contact. The scholar may still walk up and press Fight (startCombat
// untouched), the sortie still fights it (fieldFight), the nightly
// gorge and the ~6-night drift valve are untouched, and non-lingering
// intruders still breach exactly as before. Nothing despawns.
//
// Cases (one fixture, one process per case — harness rule: never two
// harnesses in one node process). The 'all' runner spawns one child
// process per case and aggregates; exit 1 if any case fails. Each case
// prints one JSON line.
//   static          guard text present inside monsterTurn; only
//                   src/js/game.js differs vs HEAD among src files;
//                   competent.js + competent-answercourt-b.js
//                   unmodified; no flee/toughness/damage code touched.
//   unit-lingering  real harness, seed 100207, staged scenarios on one
//                   Game: (1) lingering raider adjacent to the scholar
//                   at Haven — monsterTurn moves nothing, starts no
//                   fight; (2) lingering raider ON the scholar's cell
//                   — monsterTurn starts no fight; (3) NON-lingering
//                   raider adjacent with a staged 'hungry' stance —
//                   monsterTurn steps it onto the scholar and starts
//                   combat (positive control: the turn is live and the
//                   guard is selective); (4) direct startCombat on a
//                   lingering raider still starts the fight (the
//                   Fight-button path is preserved). No quietLog wrapper:
//                   it swallows console output, and this case's fail()
//                   prints through console.log — a failure inside it
//                   would exit 1 silently.
//   sim-mechanism   armed driver oneRun, seed 100207, 100 days (the
//                   control leg's showcase cascade is d92-93, six
//                   scholars to one lingering algorithm): zero scholar
//                   `the wild` deaths to a lockstep lingering killer,
//                   zero gap-0 followers, and at least one breach-
//                   provenance session still occurs (the breach
//                   survives for non-lingering intruders).
//   determinism     the armed driver oneRun twice on seed 100207, 60
//                   days: deaths, days, endReason, series length
//                   identical.
// Usage: node scripts/test-cascade-b.js [seed] [case]
'use strict';
const path = require('path');
const fs = require('fs');
const { execFileSync, execSync } = require('child_process');
const repo = path.join(__dirname, '..');
const seed = Number(process.argv[2] || '100207');
const kase = process.argv[3] || 'all';

function out(o) { console.log(JSON.stringify(o)); }
function fail(k, detail, extra) { out(Object.assign({ case: k, pass: false, detail: detail }, extra || {})); process.exit(1); }
function pass(k, extra) { out(Object.assign({ case: k, pass: true }, extra || {})); process.exit(0); }

if (kase === 'all') {
  const cases = ['static', 'unit-lingering', 'sim-mechanism', 'determinism'];
  let allOk = true;
  for (const c of cases) {
    try {
      const r = execFileSync(process.execPath, [path.join(__dirname, 'test-cascade-b.js'), String(seed), c], { cwd: repo, encoding: 'utf8', timeout: 900000 });
      const lines = r.trim().split('\n').filter(Boolean);
      for (const l of lines) { try { const j = JSON.parse(l); if (j.pass === false) allOk = false; console.log(l); } catch (e) { console.log(l); } }
    } catch (e) {
      allOk = false;
      console.log(JSON.stringify({ case: c, pass: false, detail: 'child failed: ' + String((e.stdout || '') + (e.stderr || '') + e.message).slice(0, 800) }));
    }
  }
  process.exit(allOk ? 0 : 1);
}

if (kase === 'static') {
  const gamePath = path.join(repo, 'src', 'js', 'game.js');
  const raw = fs.readFileSync(gamePath, 'utf8');
  const mtIdx = raw.indexOf('monsterTurn() {');
  if (mtIdx < 0) fail('static', 'monsterTurn not found in game.js');
  const mtEnd = raw.indexOf('\n    },', mtIdx);
  const mtBody = raw.slice(mtIdx, mtEnd < 0 ? mtIdx + 8000 : mtEnd);
  if (!/if \(m\.lingering\) return;/.test(mtBody)) fail('static', 'lingering guard not inside monsterTurn');
  if (!/CASCADE \(sim-cascade-b/.test(mtBody)) fail('static', 'guard comment missing in monsterTurn');
  // STATIC (gorgeprice2-b fix 2026-11-15): the original check diffed the
  // worktree against HEAD, which only works while the lever is
  // uncommitted. The lever is now committed, so diff against the
  // merge-base with master instead — the intent is unchanged: the
  // game.js change vs master is exactly the guard hunk.
  let base = '';
  try { base = execSync('git merge-base HEAD master', { cwd: repo, encoding: 'utf8' }).trim(); } catch (e) { fail('static', 'git merge-base failed: ' + e.message); }
  let changed = [];
  try { changed = execSync('git diff ' + base + ' --name-only', { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch (e) { fail('static', 'git diff failed: ' + e.message); }
  if (changed.indexOf('scripts/policies/competent.js') >= 0) fail('static', 'competent.js modified');
  if (changed.indexOf('scripts/policies/competent-answercourt-b.js') >= 0) fail('static', 'competent-answercourt-b.js modified');
  const srcChanged = changed.filter(function (f) { return f.indexOf('src/') === 0; });
  if (srcChanged.length !== 1 || srcChanged[0] !== 'src/js/game.js') fail('static', 'src change must be exactly src/js/game.js, got: ' + srcChanged.join(','));
  let diff = '';
  try { diff = execSync('git diff ' + base + ' -- src/js/game.js', { cwd: repo, encoding: 'utf8' }); } catch (e) { fail('static', 'git diff game.js failed: ' + e.message); }
  if (/tbBarrierExit|tbPlayerEndTurn|fleeRepair/i.test(diff)) fail('static', 'diff touches flee code');
  if (/tbDamage\(|maxHealth\(\)|damage\s*[:=]/i.test(diff)) fail('static', 'diff touches damage/toughness code');
  const hunks = (diff.match(/^@@/gm) || []).length;
  if (hunks !== 1) fail('static', 'game.js diff must be exactly 1 hunk (the guard), got ' + hunks);
  const added = (diff.match(/^\+[^+]/gm) || []).length;
  if (added !== 16) fail('static', 'guard hunk must add exactly 16 lines, got ' + added);
  pass('static', { base: base.slice(0, 12), changedTracked: changed.length, srcChanged: srcChanged, hunks: hunks, addedLines: added });
}

if (kase === 'unit-lingering') (async function () {
  const { loadGame, setupGame } = require(path.join(repo, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed: seed, mode: 'cascade-test-unit', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  // Stage the scholar at Haven hall centre (4,4), awake, on the haven tile.
  Game.map.px = 4; Game.map.py = 4;
  s.mx = 4; s.my = 4; s.insideHaven = true;
  try { Game._sleeping = false; } catch (e) {}
  function spawn(id, mx, my, lingering) {
    const opts = { mx: mx, my: my };
    if (lingering) opts.lingering = true;
    const m = Game.spawnWorldMonster(id, 4, 4, opts);
    if (!m) throw new Error('spawnWorldMonster returned nothing for ' + id);
    if (lingering && !m.lingering) throw new Error('spawned monster did not carry lingering=true');
    return m;
  }
  function endFightIfAny() {
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
    try { Game.tbfight = null; } catch (e) {}
  }
  const results = {};
  // NOTE: no quietLog wrapper here — quietLog swallows console output,
  // and this case's fail() prints through console.log; a failure inside
  // quietLog would exit 1 with nothing printed (that is how this case
  // first failed: silently). Game.say is captured by the harness, so the
  // run stays quiet without it.
  // (1) Lingering raider adjacent: no move, no fight.
  let m1 = spawn('algorithm', 4, 5, true);
  Game.monsterTurn();
  results.adjacentLingering = { moved: !(m1.mx === 4 && m1.my === 5), fought: !!Game.tbfight };
  if (Game.tbfight) fail('unit-lingering', 'lingering adjacent raider started a fight');
  if (m1.mx !== 4 || m1.my !== 5) fail('unit-lingering', 'lingering adjacent raider moved onto the scholar: (' + m1.mx + ',' + m1.my + ')');
  try { Game.removeWorldMonster(m1); } catch (e) {}
  // (2) Lingering raider ON the scholar's cell: no fight.
  let m2 = spawn('algorithm', 4, 4, true);
  Game.monsterTurn();
  results.onCellLingering = { fought: !!Game.tbfight };
  if (Game.tbfight) fail('unit-lingering', 'lingering raider on the scholar cell started a fight');
  try { Game.removeWorldMonster(m2); } catch (e) {}
  // (3) NON-lingering raider adjacent (positive control): it steps
  // onto the scholar and starts combat. The stance is staged 'hungry'
  // (the stance machine's immediate-engagement stance) because a
  // freshly drawn stance may be territorial (warns twice, then fights
  // on the third turn) or curious/cautious (escalates over turns) —
  // a single monsterTurn proves nothing about those. 'hungry' steps
  // onto the scholar and starts combat in one turn, which is exactly
  // what this control must prove: the turn is live and the guard is
  // the only thing stopping the lingering case.
  let m3 = spawn('algorithm', 4, 5, false);
  m3.stance = 'hungry';
  Game.monsterTurn();
  results.adjacentPlain = { fought: !!Game.tbfight, monsterCell: [m3.mx, m3.my] };
  if (!Game.tbfight) fail('unit-lingering', 'non-lingering hungry adjacent raider did NOT engage (positive control failed — monsterTurn may be dead in this fixture)');
  endFightIfAny();
  try { Game.removeWorldMonster(m3); } catch (e) {}
  // (4) Direct startCombat on a lingering raider still works (the
  // Fight-button path is preserved — the guard is AI-initiation only).
  let m4 = spawn('algorithm', 4, 5, true);
  Game.startCombat('algorithm');
  results.directStartCombat = { fought: !!Game.tbfight };
  if (!Game.tbfight) fail('unit-lingering', 'direct startCombat on a lingering raider did NOT start a fight (Fight-button path broken)');
  endFightIfAny();
  try { Game.removeWorldMonster(m4); } catch (e) {}
  pass('unit-lingering', results);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

if (kase === 'sim-mechanism' || kase === 'determinism') (async function () {
  if (kase === 'sim-mechanism') {
    process.env.DAYS = '100';
    const driver = require(path.join(repo, 'scripts', 'cascade-driver-20261115'));
    const r = await driver.oneRun(seed, 'competent-answercourt-b');
    const byId = {};
    for (const s of (r.cascade.sessions || [])) byId[s.id] = s;
    const endById = {};
    for (const e of (r.cascade.ends || [])) endById[e.id] = e;
    let lingerDeaths = 0, gap0 = 0, breachSessions = 0;
    const wild = (r.deaths || []).filter(function (d) { return d.player && d.cause === 'the wild'; })
      .sort(function (a, b) { return a.day - b.day; });
    let prevDay = null;
    for (const d of wild) {
      if (prevDay !== null && d.day === prevDay) gap0 += 1;
      prevDay = d.day;
      const c = (r.cascade.deaths || []).find(function (x) { return x.day === d.day && x.who === d.who && x.cause === d.cause && x.player === true; });
      const s = c && c.sessionId != null ? byId[c.sessionId] : null;
      const e = c && c.sessionId != null ? endById[c.sessionId] : null;
      const mf = s ? (s.fighters || []).find(function (x) { return x && x.kind === 'monster'; }) : null;
      if (mf && s.worldMonsterInstance != null && mf.hp === s.worldMonsterHp && e && e.worldOrigin) lingerDeaths += 1;
    }
    for (const s of (r.cascade.sessions || [])) if (s.provenance === 'breach') breachSessions += 1;
    if (lingerDeaths !== 0) fail('sim-mechanism', 'armed leg still has ' + lingerDeaths + ' lockstep lingering scholar deaths on seed ' + seed);
    if (gap0 !== 0) fail('sim-mechanism', 'armed leg still has ' + gap0 + ' gap-0 scholar deaths on seed ' + seed);
    if (breachSessions < 1) fail('sim-mechanism', 'no breach-provenance session at all — the breach may be gone, not just the lingerer duels');
    pass('sim-mechanism', { seed: seed, days: r.days, endReason: r.endReason,
      wildScholarDeaths: wild.length, lingerDeaths: lingerDeaths, gap0: gap0,
      breachSessions: breachSessions, totalDeaths: (r.deaths || []).length });
  } else {
    process.env.DAYS = '60';
    const driver = require(path.join(repo, 'scripts', 'cascade-driver-20261115'));
    const a = await driver.oneRun(seed, 'competent-answercourt-b');
    const b = await driver.oneRun(seed, 'competent-answercourt-b');
    const digest = function (r) {
      return JSON.stringify({ deaths: r.deaths, days: r.days, endReason: r.endReason,
        seriesLen: r.series.length });
    };
    if (digest(a) !== digest(b)) fail('determinism', 'two identical runs diverged', { a: digest(a), b: digest(b) });
    pass('determinism', { seed: seed, days: a.days, deaths: a.deaths.length });
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
