#!/usr/bin/env node
'use strict';
// test-trickmatter-20261016.js — proof record for the sim-trickmatter arm
// (axis scale-onramp): SELECTIVE FIGHT-OPENING (FIGHTOPEN_SELECTIVE=1).
//
// The named next from evidence/2026-10-16/sim-fightopen.md ("mattering"):
// keep congregation's beam-prevention opener (proven positive value — the
// trick cashes out in round 1), DROP reunion's novelty opener (the
// strike-cost suspect: round-2 treatment 0/7 resolutions, median-survival
// guardrail breach -18d). The other three openers (editor, cancellation,
// audit) keep the landed default. Cost parity holds in both modes: the
// opening IS the round-1 action (no free strike).
//
// The layer lives in src/js/fieldFights.js ONLY, inside the landed
// FIGHTOPEN=1 block of villagerTrickAction: when FIGHTOPEN_SELECTIVE=1 the
// reunion opener is skipped (the fighter strikes round 1; the normal
// 2-strike novelty gate below can still land later).
//
// Sections:
//   RED   — the pre-change file (HEAD materialized) answers every round-1
//           probe with null, FIGHTOPEN=1+FIGHTOPEN_SELECTIVE=1 or not: the
//           selective classification doesn't exist.
//   GREEN — the layer file:
//             FIGHTOPEN=1 + FIGHTOPEN_SELECTIVE=1: congregation round 1 ->
//               argue|congregation-heresy; reunion round 1 -> null (dropped);
//               editor/cancellation/audit round 1 -> their openers (landed
//               default kept).
//             FIGHTOPEN=1 only (selective unset): all five openers fire
//               (no regression of the landed default).
//           NEGATIVES: selective without FIGHTOPEN -> null; unknown trick
//             -> null; congregation round 3 selective -> argue via the
//             EXISTING gate (the opener doesn't break the normal gate);
//             reunion round 2 selective -> null (no strikes yet — opener is
//             round-1-only and the normal gate hasn't matured).
//   DET   — identical-seed 40d pairs: HEAD-bare vs layer-with-both-flags-
//           unset -> byte-identical digests (default OFF = zero trace).
//   SMOKE — synthetic fieldFight: congregation selective -> argue first,
//             round-1 log reads as beam prevention; reunion selective ->
//             NO wait:reunion-novel as the round-1 action (the strike cost
//             is avoided; the fighter's round-1 action is a strike).
//
// RED->GREEN is real: the RED probes run against the HEAD-materialized file
// (the layer file is swapped out and restored with try/finally; the layer
// bytes are backed up under ~/workspace/trickmatter-backup/ first).
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it), full src/js list via the harness, no Game.save stub, one
// harness per node process (children via execSync, sequential). Probe
// children write tmp files to os.tmpdir() only; the file swap is proof
// scaffolding, restored before exit (byte-verified against the backup —
// FAIL LOUDLY otherwise).
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
const BACKUP_DIR = path.join(os.homedir(), 'workspace', 'trickmatter-backup');
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
  const tmpFile = path.join(os.tmpdir(), 'trickmatter-probe-' + seed + '-' + process.pid + '-' + Math.floor(Math.random() * 1e9) + '.js');
  const code = `
process.env.FEASTSCALE_R13 = '1'; process.env.TRIBFLOOR = '1'; process.env.SUCCGRACE = '1';
process.env.RAIDDENSITY = '1'; process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0'; process.env.NODEWITNESS = '1';
const { loadGame, setupGame } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'trickmatter-probe', fullTelemetry: false });
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
function trickProbe(seed, mid, round, tricks, envExtra) {
  const js = TRICK_PROBE
    .replace(/MID/g, JSON.stringify(mid))
    .replace(/ROUND/g, String(round))
    .replace(/TRICKS/g, JSON.stringify(tricks));
  return probeEval(seed, js, envExtra);
}
const KNOWN5 = { congregation: true, reunion: true, editor: true, cancellation: true, audit: true };
const SEL = { FIGHTOPEN: '1', FIGHTOPEN_SELECTIVE: '1' };  // selective treatment arm
const FULL = { FIGHTOPEN: '1' };                            // full-opener control arm
const SELECTIVE_OPEN = {
  congregation: 'argue|congregation-heresy',
  reunion: 'null',  // DROPPED in selective mode
  editor: 'continuity|editor-continuity',
  cancellation: 'offscript|cancellation-offscript',
  audit: 'inefficient|audit-jank',
};
const FULL_OPEN = {
  congregation: 'argue|congregation-heresy',
  reunion: 'wait|reunion-novel',
  editor: 'continuity|editor-continuity',
  cancellation: 'offscript|cancellation-offscript',
  audit: 'inefficient|audit-jank',
};

// ---------- DET: 40d runDays digest ----------
function detDigest(seed, envExtra) {
  const tmpFile = path.join(os.tmpdir(), 'trickmatter-det-' + seed + '-' + process.pid + '.js');
  const code = `
process.env.FEASTSCALE_R13 = '1'; process.env.TRIBFLOOR = '1'; process.env.SUCCGRACE = '1';
process.env.RAIDDENSITY = '1'; process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0'; process.env.NODEWITNESS = '1';
const { loadGame, setupGame, runDays, quietLog } = require('${HARNESS}');
const TF = require('${path.join(ROOT, 'scripts', 'policies', 'tribfloor.js')}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'trickmatter-det', fullTelemetry: false });
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
    const env = Object.assign({}, process.env, envExtra || {});
    const r = execSync('node ' + tmpFile, { cwd: path.join(ROOT, 'scripts'), env: env, maxBuffer: 64 * 1024 * 1024 }).toString();
    return JSON.parse(r.trim().split('\n').pop() || '{}');
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}

// ---------- SMOKE: synthetic fieldFight ----------
function smokeFight(seed, mid, envExtra) {
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
    out.r1line = (rec.log || []).filter(l => /^R1:/.test(l)).slice(0, 4);
    out.strikesThrown = rec.strikesThrown | 0;
    out.round1acts = (rec.log || []).filter(l => /^R1:/.test(l)).join(' || ');
  `;
  return probeEval(seed, js, envExtra);
}

// ================= RUN =================
console.log('== setup: syntax + backup ==');
try {
  execSync('node --check ' + LAYER_FILE, { cwd: ROOT });
  ok(true, 'setup: node --check on fieldFights.js');
} catch (e) { ok(false, 'setup: node --check on fieldFights.js: ' + String(e.message).slice(0, 120)); }
backupLayer();
ok(fs.existsSync(BACKUP_FILE), 'setup: layer backed up under ~/workspace/trickmatter-backup/');

try {
  // ---------- RED ----------
  // The pre-change file has the landed full opener but no selective
  // classification: FIGHTOPEN=1 opens ALL five, FIGHTOPEN_SELECTIVE=1 is
  // ignored (reunion still opens).
  console.log('== RED: pre-change file ignores the selective flag (full opener fires) ==');
  writeHeadFile();
  for (const mid of Object.keys(FULL_OPEN)) {
    const o = trickProbe(940, mid, 1, KNOWN5, SEL);
    ok(!o.__err && !o.__crash && o.act === FULL_OPEN[mid], 'red: ' + mid + ' round 1 HEAD FIGHTOPEN=1+SELECTIVE=1 -> ' + FULL_OPEN[mid] + ' (got ' + o.act + (o.__err ? ' ERR' : '') + ')');
  }
  // DET-bare digests (pre-change file), for the DET comparison below.
  console.log('== DET: bare (HEAD file) 40d digests ==');
  const bareA = detDigest(951, {}), bareB = detDigest(952, {});
  ok(!bareA.__crash, 'det: bare seed 951 completes');
  ok(!bareB.__crash, 'det: bare seed 952 completes');
  ok(bareA.hash !== bareB.hash, 'det: bare digests live (seeds differ)');

  // ---------- GREEN ----------
  console.log('== GREEN: selective mode keeps congregation/editor/cancellation/audit, drops reunion ==');
  restoreLayer();
  ok(layerIntact(), 'green: layer file restored byte-identical after RED');
  for (const mid of Object.keys(SELECTIVE_OPEN)) {
    const o = trickProbe(940, mid, 1, KNOWN5, SEL);
    ok(!o.__err && !o.__crash && o.act === SELECTIVE_OPEN[mid], 'green-sel: ' + mid + ' round 1 SELECTIVE -> ' + SELECTIVE_OPEN[mid] + ' (got ' + o.act + (o.__err ? ' ERR' : '') + ')');
  }
  console.log('== GREEN: full mode (FIGHTOPEN=1 only) unchanged — all five open ==');
  for (const mid of Object.keys(FULL_OPEN)) {
    const o = trickProbe(940, mid, 1, KNOWN5, FULL);
    ok(!o.__err && !o.__crash && o.act === FULL_OPEN[mid], 'green-full: ' + mid + ' round 1 FIGHTOPEN=1 -> ' + FULL_OPEN[mid] + ' (got ' + o.act + (o.__err ? ' ERR' : '') + ')');
  }
  console.log('== GREEN negatives ==');
  {
    const o = trickProbe(940, 'reunion', 1, KNOWN5, { FIGHTOPEN_SELECTIVE: '1' });
    ok(o.act === 'null', 'green-neg: selective flag WITHOUT FIGHTOPEN -> null (got ' + o.act + ')');
    const oc = trickProbe(940, 'congregation', 1, KNOWN5, { FIGHTOPEN_SELECTIVE: '1' });
    ok(oc.act === 'null', 'green-neg: congregation selective-without-FIGHTOPEN -> null (got ' + oc.act + ')');
    const ou = trickProbe(940, 'congregation', 1, {}, SEL);
    ok(ou.act === 'null', 'green-neg: unknown trick SELECTIVE -> null');
    const o3 = trickProbe(941, 'congregation', 3, { congregation: true }, SEL);
    ok(o3.act === 'argue|congregation-heresy', 'green-neg: congregation round 3 SELECTIVE -> argue via normal gate (got ' + o3.act + ')');
    const or2 = trickProbe(941, 'reunion', 2, { reunion: true }, SEL);
    ok(or2.act === 'null', 'green-neg: reunion round 2 SELECTIVE -> null, normal novelty gate needs 2 strikes (got ' + or2.act + ')');
    const or3 = trickProbe(941, 'reunion', 3, { reunion: true }, SEL);
    ok(or3.act === 'null', 'green-neg: reunion round 3 SELECTIVE with no strikes -> null (got ' + or3.act + ')');
  }
  // DET-off digests (layer file, both flags unset).
  console.log('== DET: layer file, both flags OFF, 40d digests ==');
  const offA = detDigest(951, {}), offB = detDigest(952, {});
  ok(!offA.__crash && !offB.__crash, 'det: layer-off seeds complete');
  ok(offA.hash === bareA.hash, 'det: 951 bare == layer-off (' + bareA.hash + ' vs ' + offA.hash + ')');
  ok(offB.hash === bareB.hash, 'det: 952 bare == layer-off (' + bareB.hash + ' vs ' + offB.hash + ')');

  // ---------- SMOKE ----------
  console.log('== SMOKE: synthetic fieldFight, selective mode ==');
  {
    const s = smokeFight(940, 'congregation', SEL);
    ok(!s.__err && !s.__crash && s.first === 'argue',
      'smoke: congregation SELECTIVE trickLog[0]===argue (got ' + s.first + (s.__err ? ' ERR' : '') + ')');
    if (s.r1line) { console.log('  sense: congregation SELECTIVE R1 lines:'); s.r1line.forEach(l => console.log('    ' + l)); }
  }
  {
    const s = smokeFight(941, 'reunion', SEL);
    ok(!s.__err && !s.__crash && s.first !== 'wait:reunion-novel',
      'smoke: reunion SELECTIVE round-1 action is NOT the novelty (got ' + s.first + (s.__err ? ' ERR' : '') + ')');
    ok(!s.__err && s.trickLog.join(',').indexOf('wait:reunion-novel') === -1 || (s.trickLog[0] !== 'wait:reunion-novel'),
      'smoke: reunion SELECTIVE trickLog does not open with reunion-novel (log=' + s.trickLog.slice(0, 4).join(',') + ')');
    if (s.r1line) { console.log('  sense: reunion SELECTIVE R1 lines:'); s.r1line.forEach(l => console.log('    ' + l)); }
  }
  {
    // Full mode still opens the reunion novelty (landed default preserved).
    const s = smokeFight(941, 'reunion', FULL);
    ok(!s.__err && !s.__crash && s.first === 'wait:reunion-novel',
      'smoke: reunion FULL trickLog[0]===wait:reunion-novel (got ' + s.first + (s.__err ? ' ERR' : '') + ')');
  }
} finally {
  restoreLayer();
}

console.log('== final: worktree file state ==');
ok(layerIntact(), 'final: fieldFights.js is the layer file (byte-identical to backup)');

console.log('\n==== RESULT: ' + pass + ' passed, ' + fail + ' failed ====');
if (fails.length) { console.log('failures:'); fails.forEach(f => console.log(' - ' + f)); process.exit(1); }
