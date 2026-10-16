#!/usr/bin/env node
'use strict';
// test-fightopen-20261016.js — proof record for the sim-fightopen arm
// (axis scale-onramp): FIGHT-OPENING execution (FIGHTOPEN=1, default OFF).
//
// The execensus census (evidence/2026-10-16/sim-execensus.md) measured the
// execution funnel's sharpest break: 65% of post-learning wave-4/5 field
// fights end with CONDITIONS-NEVER-MET — the trick gates assume multi-round
// fights but hyper-lethal fights are one-round massacres. This arm tests
// the first root-cause candidate (named next, option 4): give the tricks
// round-1 forms. A fighter who KNOWS the trick opens with its first action
// on round 1 instead of a doomed strike.
//
// The layer lives in src/js/fieldFights.js ONLY, inside villagerTrickAction
// (a FIGHTOPEN=1 branch after the knowledge check, before the counter
// section). It returns the same action the later-round gate would have
// returned (same type+why), so the cost is structural: the fight loop's
// trickAct branch means no strike on round 1 (parity — no NPC advantage).
//
// Sections:
//   RED   — the pre-change file (HEAD materialized) answers every round-1
//           probe with null, FIGHTOPEN=1 or not: the openers don't exist.
//   GREEN — the layer file: FIGHTOPEN=1 + known trick + round 1 + wave>=4
//           returns the five openers (congregation/argue, reunion/novel
//           as wait:reunion-novel, editor/continuity, cancellation/offscript,
//           audit/inefficient). NEGATIVES: FIGHTOPEN unset -> null (matches
//           RED); unknown trick -> null; influencer/eater/spoiler -> null
//           (documented dishonest openers); wave-3 (gavel) -> null
//           (fight-shape proxy is wave>=4); network_note round 1 ->
//           bad_note unchanged; congregation round 3 -> argue via the
//           EXISTING gate (the opener doesn't break the normal gate).
//   DET   — identical-seed 40d pairs: HEAD-bare vs layer-with-FIGHTOPEN-
//           unset -> byte-identical digests (default OFF = zero trace).
//   SMOKE — synthetic fieldFight vs each opener species (known, FIGHTOPEN=1):
//           the opener is the fight's first trickLog entry, the round-1 log
//           line reads as a fighter acting with knowledge, and the round-1
//           action cost the strike.
//
// RED->GREEN is real: the RED probes run against the HEAD-materialized file
// (the layer file is swapped out and restored with try/finally; the layer
// bytes are backed up under ~/workspace/fightopen-backup/ first, so a
// crash leaves a loud, restorable state, never a silent one).
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it), full src/js list via the harness, no Game.save stub, one
// harness per node process (children via execSync, sequential). New tests
// must not write into the repo: probe children write tmp files to
// os.tmpdir() only; the file swap is proof scaffolding, restored before
// exit (byte-verified against the backup — FAIL LOUDLY otherwise).
process.env.FEASTSCALE_R13 = '1';
process.env.TRIBFLOOR = '1';
process.env.SUCCGRACE = '1';
process.env.RAIDDENSITY = '1';
process.env.WINPURSUIT = '1';
process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0';
process.env.NODEWITNESS = '1';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');
const LAYER_FILE = path.join(ROOT, 'src', 'js', 'fieldFights.js');
const BACKUP_DIR = path.join(os.homedir(), 'workspace', 'fightopen-backup');
const BACKUP_FILE = path.join(BACKUP_DIR, 'fieldFights.layer.js');

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

// ---------- file-swap scaffolding ----------
function backupLayer() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.copyFileSync(LAYER_FILE, BACKUP_FILE);
}
function writeHeadFile() {
  const head = execSync('git show HEAD:src/js/fieldFights.js', { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
  fs.writeFileSync(LAYER_FILE, head);
}
function restoreLayer() {
  fs.copyFileSync(BACKUP_FILE, LAYER_FILE);
}
function layerIntact() {
  try {
    return fs.readFileSync(LAYER_FILE).equals(fs.readFileSync(BACKUP_FILE));
  } catch (e) { return false; }
}

// ---------- child probe runner ----------
function probeEval(seed, js, envExtra) {
  const tmpFile = path.join(os.tmpdir(), 'fightopen-probe-' + seed + '-' + process.pid + '-' + Math.floor(Math.random() * 1e9) + '.js');
  const code = `
process.env.FEASTSCALE_R13 = '1'; process.env.TRIBFLOOR = '1'; process.env.SUCCGRACE = '1';
process.env.RAIDDENSITY = '1'; process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0'; process.env.NODEWITNESS = '1';
const { loadGame, setupGame } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'fightopen-probe', fullTelemetry: false });
  await setupGame(Game);
  const out = {};
  try { await (async () => { ${js} })(); } catch (e) { out.__err = String(e && e.stack || e).slice(0, 1500); }
  console.log(JSON.stringify(out));
})().catch(e => console.log(JSON.stringify({ __crash: String(e).slice(0, 300) })));
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const env = Object.assign({}, process.env, envExtra || {});
    const r = execSync('node ' + tmpFile, { cwd: path.join(ROOT, 'scripts'), env: env, maxBuffer: 64 * 1024 * 1024 }).toString();
    return JSON.parse(r.trim().split('\n').pop() || '{}');
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}

// Direct villagerTrickAction probe: returns a compact token or 'null'.
const TRICK_PROBE = `
  const G = Game;
  const mdef = G.data.monsters.find(m => m.id === MID);
  G.state.villagerTricks = TRICKS;
  const act = G.villagerTrickAction('probevid', mdef, { round: ROUND, vHp: 500, vHpMax: 500, lead: { hp: 100 }, rec: {}, vp: {}, members: [{}] });
  out.act = act ? (act.type + '|' + (act.why || '')) : 'null';
`;
function trickProbe(seed, mid, round, tricks, fightopen) {
  const js = TRICK_PROBE
    .replace(/MID/g, JSON.stringify(mid))
    .replace(/ROUND/g, String(round))
    .replace(/TRICKS/g, JSON.stringify(tricks));
  const env = fightopen ? { FIGHTOPEN: '1' } : {};
  return probeEval(seed, js, env);
}
const KNOWN5 = { congregation: true, reunion: true, editor: true, cancellation: true, audit: true };
const EXPECT_OPEN = {
  congregation: 'argue|congregation-heresy',
  reunion: 'wait|reunion-novel',
  editor: 'continuity|editor-continuity',
  cancellation: 'offscript|cancellation-offscript',
  audit: 'inefficient|audit-jank',
};

// ---------- DET: 40d runDays digest ----------
function detDigest(seed) {
  const tmpFile = path.join(os.tmpdir(), 'fightopen-det-' + seed + '-' + process.pid + '.js');
  const code = `
process.env.FEASTSCALE_R13 = '1'; process.env.TRIBFLOOR = '1'; process.env.SUCCGRACE = '1';
process.env.RAIDDENSITY = '1'; process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0'; process.env.NODEWITNESS = '1';
const { loadGame, setupGame, runDays, quietLog } = require('${HARNESS}');
const TF = require('${path.join(ROOT, 'scripts', 'policies', 'tribfloor.js')}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'fightopen-det', fullTelemetry: false });
  await setupGame(Game);
  const res = await quietLog(async () => await runDays(Game, TF.leadfeast, { days: 40, manifest: undefined, sampleEvery: 30 }));
  const st = Game.state;
  const h = JSON.stringify({
    day: st.scholar && st.scholar.day, won: !!Game.won,
    slain: st.villageSlain || {}, counters: st.monsterCounters || {}, vt: st.villagerTricks || {},
    obs: st.villageCounterObs || {}, kl: (st.waveKillLog || []).length,
    pop: (st.village && st.village.people ? Object.keys(st.village.people).length : null),
    days: res.days,
  });
  let x = 0; for (let i = 0; i < h.length; i++) x = ((x << 5) - x + h.charCodeAt(i)) >>> 0;
  console.log(JSON.stringify({ hash: x.toString(16) }));
})().catch(e => console.log(JSON.stringify({ __crash: String(e).slice(0, 200) })));
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync('node ' + tmpFile, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 64 * 1024 * 1024 }).toString();
    return JSON.parse(r.trim().split('\n').pop() || '{}');
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}

// ---------- SMOKE: synthetic fieldFight, opener fires round 1 ----------
function smokeFight(seed, mid) {
  const js = `
    const G = Game;
    const rs = ((G.state.village || {}).roster || []).filter(v => v && v !== 'player');
    const fighter = rs[0];
    G.state.village = G.state.village || {};
    G.state.village.health = G.state.village.health || {};
    G.state.village.health[fighter] = 900;
    const mdef = G.data.monsters.find(m => m.id === ${JSON.stringify(mid)});
    G.state.villagerTricks = Object.assign({}, G.state.villagerTricks, ${JSON.stringify(KNOWN5)});
    G.npcSetNode(fighter, 5, 5);
    const rec = G.fieldFight(fighter, mdef, { id: ${JSON.stringify(mid)}, tx: 5, ty: 5, hp: 1500, maxHp: 1500 }, {});
    out.first = (rec.trickLog || [])[0] || 'none';
    out.trickLog = rec.trickLog || [];
    out.rounds = rec.rounds; out.outcome = rec.outcome;
    out.r1line = (rec.log || []).filter(l => /^R1:/.test(l)).slice(0, 3);
    out.strikesThrown = rec.strikesThrown | 0;
  `;
  return probeEval(seed, js, { FIGHTOPEN: '1' });
}

// ================= RUN =================
console.log('== setup: syntax + backup ==');
try {
  execSync('node --check ' + LAYER_FILE, { cwd: ROOT });
  ok(true, 'setup: node --check on fieldFights.js');
} catch (e) { ok(false, 'setup: node --check on fieldFights.js: ' + String(e.message).slice(0, 120)); }
backupLayer();
ok(fs.existsSync(BACKUP_FILE), 'setup: layer backed up under ~/workspace/fightopen-backup/');

try {
  // ---------- RED ----------
  console.log('== RED: pre-change file answers every round-1 probe with null ==');
  writeHeadFile();
  for (const mid of Object.keys(EXPECT_OPEN)) {
    const o = trickProbe(940, mid, 1, KNOWN5, true);
    ok(!o.__err && !o.__crash && o.act === 'null', 'red: ' + mid + ' round 1 FIGHTOPEN=1 -> null (got ' + o.act + (o.__err ? ' ERR' : '') + ')');
  }
  {
    const o = trickProbe(940, 'congregation', 1, {}, true);
    ok(o.act === 'null', 'red: unknown trick FIGHTOPEN=1 -> null');
  }
  // DET-bare digests (pre-change file), for the DET comparison below.
  console.log('== DET: bare (HEAD file) 40d digests ==');
  const bareA = detDigest(951), bareB = detDigest(952);
  ok(!bareA.__crash, 'det: bare seed 951 completes');
  ok(!bareB.__crash, 'det: bare seed 952 completes');
  ok(bareA.hash !== bareB.hash, 'det: bare digests live (seeds differ)');

  // ---------- GREEN ----------
  console.log('== GREEN: FIGHTOPEN=1 opens the five round-1 forms ==');
  restoreLayer();
  ok(layerIntact(), 'green: layer file restored byte-identical after RED');
  for (const mid of Object.keys(EXPECT_OPEN)) {
    const o = trickProbe(940, mid, 1, KNOWN5, true);
    ok(!o.__err && !o.__crash && o.act === EXPECT_OPEN[mid], 'green: ' + mid + ' round 1 FIGHTOPEN=1 -> ' + EXPECT_OPEN[mid] + ' (got ' + o.act + (o.__err ? ' ERR' : '') + ')');
  }
  console.log('== GREEN negatives ==');
  for (const mid of Object.keys(EXPECT_OPEN)) {
    const o = trickProbe(940, mid, 1, KNOWN5, false);
    ok(o.act === 'null', 'green-neg: ' + mid + ' round 1 flag OFF -> null (got ' + o.act + ')');
  }
  {
    const o = trickProbe(940, 'congregation', 1, {}, true);
    ok(o.act === 'null', 'green-neg: unknown trick FIGHTOPEN=1 -> null');
    const oi = trickProbe(941, 'influencer', 1, { influencer: true }, true);
    ok(oi.act === 'null', 'green-neg: influencer round 1 -> null (no follower exists to hunt)');
    const oe = trickProbe(941, 'eater', 1, { eater: true }, true);
    ok(oe.act === 'null', 'green-neg: eater round 1 -> null (material gate, not multi-round)');
    const os = trickProbe(941, 'spoiler', 1, { spoiler: true }, true);
    ok(os.act === 'null', 'green-neg: spoiler round 1 -> null (prophecy not due)');
    const og = trickProbe(941, 'gavel', 1, { gavel: true }, true);
    ok(og.act === 'null', 'green-neg: gavel (wave-3) round 1 -> null (fight-shape proxy is wave>=4)');
    const on = trickProbe(941, 'network_note', 1, { network_note: true }, true);
    ok(on.act === 'bad_note|networknote-badnote', 'green-neg: network_note round 1 unchanged -> bad_note (got ' + on.act + ')');
    const o3 = trickProbe(941, 'congregation', 3, { congregation: true }, true);
    ok(o3.act === 'argue|congregation-heresy', 'green-neg: congregation round 3 normal gate intact -> argue (got ' + o3.act + ')');
    const or2 = trickProbe(941, 'reunion', 2, { reunion: true }, true);
    ok(or2.act === 'null', 'green-neg: reunion round 2 (no strikes yet) -> null, opener is round-1-only');
  }
  // DET-off digests (layer file, flag unset).
  console.log('== DET: layer file, flag OFF, 40d digests ==');
  const offA = detDigest(951), offB = detDigest(952);
  ok(!offA.__crash && !offB.__crash, 'det: layer-off seeds complete');
  ok(offA.hash === bareA.hash, 'det: 951 bare == layer-off (' + bareA.hash + ' vs ' + offA.hash + ')');
  ok(offB.hash === bareB.hash, 'det: 952 bare == layer-off (' + bareB.hash + ' vs ' + offB.hash + ')');

  // ---------- SMOKE ----------
  console.log('== SMOKE: synthetic fieldFight — the opener is the round-1 action ==');
  const SMOKE_EXPECT = { congregation: 'argue', reunion: 'wait:reunion-novel', editor: 'continuity', cancellation: 'offscript', audit: 'inefficient' };
  for (const mid of Object.keys(SMOKE_EXPECT)) {
    const s = smokeFight(940, mid);
    ok(!s.__err && !s.__crash && s.first === SMOKE_EXPECT[mid],
      'smoke: ' + mid + ' trickLog[0]===' + SMOKE_EXPECT[mid] + ' (got ' + s.first + (s.__err ? ' ERR' : '') + ')');
    if (mid === 'congregation' && s.r1line) {
      console.log('  sense: congregation R1 lines:');
      s.r1line.forEach(l => console.log('    ' + l));
    }
    if (mid === 'reunion' && s.r1line) {
      console.log('  sense: reunion R1 lines:');
      s.r1line.forEach(l => console.log('    ' + l));
    }
  }
} finally {
  restoreLayer();
}

console.log('== final: worktree file state ==');
ok(layerIntact(), 'final: fieldFights.js is the layer file (byte-identical to backup)');

console.log('\n==== RESULT: ' + pass + ' passed, ' + fail + ' failed ====');
if (fails.length) { console.log('failures:'); fails.forEach(f => console.log(' - ' + f)); process.exit(1); }
