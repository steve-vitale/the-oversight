// test-sense3-b.js — proof test, arm sim-sense3-b (finding #2619:
// the third ally never reaches a live wave-4+ fight).
// WHAT IT PROVES (the measurement, not just the instrument):
//   §0 BASE + SLOT-ABSENT + POLICY: HEAD is the frozen base
//     d352834ef, src/js carries zero ALLYSLOT3 / ally3Vid (the slot
//     is read from the held port commit, never applied), and the
//     competent policy sha256 is the frozen 1884c8852d38.
//   §1 ANALYZER SELFTEST: analyze-sense3-b.js --selftest 17/17
//     (classification fixtures, synthetic-dir census, driver smoke).
//   §2 LADDER-STRUCTURE FIXTURE (staged, master as-is): a geared
//     quad vs a monster with 3 vids and no allyFromStart fires
//     shout 1 on round 2 and shout 2 on round 3 — one shout per
//     hopeless round — and no third shout exists to fire
//     (ally3Vid null, no "shouts a third time" line). The ladder
//     is rounds-bound, not sense-bound.
//   §3 LIVE-SHAPE FIXTURE (staged, master as-is): the same quad
//     at the LIVE median entry HP (84) with corpus-average gear
//     vs a wave-4 monster (audit) — the corpus taxonomy's
//     prediction, recorded as observed. Asserts instrument
//     consistency (shouts fired == shout lines in the log; the
//     census fields are populated); the MECHANISM verdict on the
//     observed shout count lives in the evidence file, not here.
//   §4 DRIVER SMOKE: covered by the analyzer selftest §D (one 30d
//     seed on the fresh band, exit 0, slot-absent recorded) —
//     re-asserted here by re-running the analyzer selftest
//     (already §1) is NOT repeated; §4 instead runs the driver
//     directly on one 30d seed and checks the corpus file.
//   §5 CORPUS-REPRODUCTION CHECK: the sense3 analyzer run over
//     the FROZEN dmgshape corpus (slot ported, 8 seeds
//     106181–106188) reproduces the census the prereg's M1 bar
//     is priced against: 156 encounters, 8 three-vid, 0 ally3Vid,
//     max 1 shout in three-vid fights, allyFromStart 0/156,
//     shout-2 rate 42/47 in fights of >= 4 rounds. This is a
//     reproduction of the PRIOR corpus through the new instrument
//     — not a judged sim.
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged
// party is a GEARED villager quad — every member armed +
// armored at the live standard. Live launched-quad gate rows
// (v4gates) show armor P 8–30 (median ~18–24); the staged kit
// (hide_armor + hunting_spear — the readiness test's own kit)
// measures armorP 30 / wb 30 through S.equipment, at the top
// edge of the live range, asserted in §2. Never a fresh
// un-geared scholar alone: the fighter is a roster villager,
// the scholar is not in the fight.
// Usage: node scripts/test-sense3-b.js
// Exit 0 = all checks pass.
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { spawnSync, execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const A = require(path.join(REPO, 'scripts', 'analyze-sense3-b.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function hasLine(rec, re) { return (rec.log || []).some(function (s) { return re.test(s); }); }
function shoutLines(rec) { return (rec.log || []).filter(function (s) { return /shouts (for help|again|a third time)/.test(s); }); }

(function section0() {
  let head = '';
  try { head = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
  let baseOk = false, srcClean = false;
  try {
    execSync('git merge-base --is-ancestor d352834ef2ce37b161994ece3b6bffbd26ac1e46 HEAD', { cwd: REPO, stdio: 'pipe' });
    baseOk = true;
  } catch (e) { baseOk = false; }
  try {
    const diff = execSync('git diff --stat d352834ef2ce37b161994ece3b6bffbd26ac1e46 HEAD -- src/ scripts/policies/', { cwd: REPO }).toString().trim();
    srcClean = diff === '';
  } catch (e) { srcClean = false; }
  check('§0 base is the frozen d352834ef (ancestor of HEAD) with zero src/ or policy diff on the branch',
    baseOk && srcClean, { head: head.slice(0, 12), baseOk: baseOk, srcClean: srcClean });
  let slotInSrc = true;
  try {
    for (const f of fs.readdirSync(path.join(REPO, 'src', 'js'))) {
      if (!/\.js$/.test(f)) continue;
      const s = fs.readFileSync(path.join(REPO, 'src', 'js', f), 'utf8');
      if (s.indexOf('ALLYSLOT3') !== -1 || s.indexOf('ally3Vid') !== -1) { slotInSrc = true; break; }
      slotInSrc = false;
    }
  } catch (e) { slotInSrc = true; }
  check('§0 slot absent from src/js (zero ALLYSLOT3 / ally3Vid — read from the port commit, never applied)', slotInSrc === false, null);
  let policySha = '';
  try { policySha = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex'); } catch (e) {}
  check('§0 policy sha256 is the frozen 1884c8852d38', policySha === '1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0', policySha.slice(0, 12));
  check('§0 sense3 driver + analyzer exist', fs.existsSync(path.join(REPO, 'scripts', 'sense3-driver-b.js')) && fs.existsSync(path.join(REPO, 'scripts', 'analyze-sense3-b.js')), null);
})();

(function section1() {
  const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-sense3-b.js'), '--selftest'],
    { cwd: REPO, encoding: 'utf8', timeout: 600000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const m = out.match(/analyze-sense3-b selftest: (\d+) passed, (\d+) failed/);
  check('§1 analyzer selftest exits 0 with 17 passed, 0 failed',
    r.status === 0 && !!m && m[1] === '17' && m[2] === '0', out.slice(-300));
})();

// ================= STAGED QUAD FIGHTS (harness, real fieldFight) =================
function stage(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(function (id) { return id !== Game.villagerId; });
  if (roster.length < 4) { console.log('SKIP need 4+ NPC roster, have ' + roster.length); process.exit(2); }
  const fighter = roster[0], a1 = roster[1], a2 = roster[2], a3 = roster[3];
  Game.npcSetNode(fighter, 5, 5);
  Game.npcSetNode(a1, 5, 5); Game.npcSetNode(a2, 5, 5); Game.npcSetNode(a3, 5, 5);
  v.trust = v.trust || {};
  v.trust[a1] = 50; v.trust[a2] = 50; v.trust[a3] = 50;
  v.health = v.health || {};
  return { v: v, Game: Game, fighter: fighter, a1: a1, a2: a2, a3: a3 };
}
function gearUp(s) {
  // Corpus-average gear: hide_armor + hunting_spear (the readiness
  // test's own kit). Measured back through S.equipment below.
  const kit = { torso: { itemId: 'hide_armor' }, melee: { itemId: 'hunting_spear' } };
  [s.fighter, s.a1, s.a2, s.a3].forEach(function (id) {
    const p = s.Game.getPerson ? s.Game.getPerson(id) : (s.Game.vpOf ? s.Game.vpOf(id) : null);
    if (p) p.equipped = JSON.parse(JSON.stringify(kit));
  });
  return kit;
}
function measuredGear(s) {
  const S = globalThis.Scattering || {};
  const out = {};
  [s.fighter, s.a1, s.a2, s.a3].forEach(function (id) {
    const ap = (s.Game.data.villagers || []).find(function (x) { return x.id === id; }) ||
      (s.Game.data.background_survivors || []).find(function (x) { return x.id === id; });
    out[id] = {
      armorP: S.equipment.armorOf(ap, s.Game.data.items),
      wb: S.equipment.weaponBonusOf(ap, s.Game.data.items, 'melee') + S.equipment.weaponBonusOf(ap, s.Game.data.items, 'ranged'),
    };
  });
  return out;
}

(async () => {
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  // ---------- §2 LADDER-STRUCTURE FIXTURE ----------
  // Same staged shape as the allyslot3 §7 shout proof (holder 200 HP,
  // companions 100 HP, vs gavel) — reproduced on master as-is, where
  // the third-shout branch does not exist. FIGHTALLY2=1 so the second
  // shout can fire; ALLYSLOT3 unset.
  process.env.FIGHTALLY2 = '1'; delete process.env.ALLYSLOT3;
  const { Game } = await loadGame({ seed: 424242, mode: 'sense3', fullTelemetry: false });
  await setupGame(Game);
  const s = stage(Game);
  gearUp(s);
  const g = measuredGear(s);
  const ps = Object.keys(g).map(function (k) { return g[k].armorP; });
  check('§2 staged gear measures inside the live quad-gate range (armor P 8–30, all four)',
    ps.every(function (p) { return p >= 8 && p <= 30; }), g);
  s.v.health[s.fighter] = 200; s.v.health[s.a1] = 100; s.v.health[s.a2] = 100; s.v.health[s.a3] = 100;
  const mdef = (Game.data.monsters || []).find(function (m) { return m.id === 'gavel'; }) || {};
  const rec = Game.fieldFight(s.fighter, mdef, null, { allies: 3, allyVids: [s.a1, s.a2, s.a3] });
  console.log('  [§2 ladder] outcome=' + rec.outcome + ' rounds=' + rec.rounds +
    ' shoutRound=' + rec.shoutRound + ' shout2Round=' + rec.shout2Round + ' shout3Round=' + rec.shout3Round +
    ' allyVid=' + rec.allyVid + ' ally2Vid=' + rec.ally2Vid + ' ally3Vid=' + rec.ally3Vid);
  check('§2 ladder: shout 1 fires on round 2 (one hopeless round in)',
    rec.shoutRound === 2, { shoutRound: rec.shoutRound });
  check('§2 ladder: shout 2 fires on round 3 (one shout per hopeless round)',
    rec.shout2Round === 3, { shout2Round: rec.shout2Round });
  check('§2 ladder: no third shout exists on master (ally3Vid null, no third-shout line, shout3Round undefined)',
    !rec.ally3Vid && !hasLine(rec, /shouts a third time!/) && rec.shout3Round === undefined,
    { ally3Vid: rec.ally3Vid, shout3Round: rec.shout3Round });

  // ---------- §3 LIVE-SHAPE FIXTURE ----------
  // Same quad, but the fighter enters at the LIVE median entry HP
  // (84, from the dmgshape corpus's fought three-vid fights) with
  // corpus-average gear, vs a wave-4 monster (audit). The corpus
  // taxonomy predicts at most one shout before the fight ends.
  // Fresh load (same seed): the §2 fight consumed the RNG stream.
  const { Game: Game3 } = await loadGame({ seed: 424242, mode: 'sense3', fullTelemetry: false });
  await setupGame(Game3);
  const s3 = stage(Game3);
  gearUp(s3);
  s3.v.health[s3.fighter] = 84; s3.v.health[s3.a1] = 100; s3.v.health[s3.a2] = 100; s3.v.health[s3.a3] = 100;
  const mdef3 = (Game3.data.monsters || []).find(function (m) { return m.id === 'audit'; }) || {};
  const rec3 = Game3.fieldFight(s3.fighter, mdef3, null, { allies: 3, allyVids: [s3.a1, s3.a2, s3.a3] });
  const shouts3 = (rec3.allyVid ? 1 : 0) + (rec3.ally2Vid ? 1 : 0) + (rec3.ally3Vid ? 1 : 0);
  console.log('  [§3 live-shape] outcome=' + rec3.outcome + ' rounds=' + rec3.rounds +
    ' shouts=' + shouts3 + ' shoutRound=' + rec3.shoutRound + ' shout2Round=' + rec3.shout2Round +
    ' allyVid=' + rec3.allyVid + ' ally2Vid=' + rec3.ally2Vid);
  check('§3 live-shape: census fields are populated and consistent (shouts fired == shout lines in the log)',
    shouts3 === shoutLines(rec3).length && typeof rec3.rounds === 'number' && typeof rec3.outcome === 'string',
    { shouts: shouts3, shoutLines: shoutLines(rec3).length, rounds: rec3.rounds, outcome: rec3.outcome });
  check('§3 live-shape: the fight ends with at most one shout (the corpus taxonomy prediction — observed, see evidence)',
    shouts3 <= 1, { shouts: shouts3, rounds: rec3.rounds, outcome: rec3.outcome });
  check('§3 live-shape: no third ally (ally3Vid null on master)',
    !rec3.ally3Vid, { ally3Vid: rec3.ally3Vid });

  // ---------- §4 DRIVER SMOKE (direct) ----------
  const smokeDir = 'perseed-sense3-b-smoke';
  const smokePath = path.join(REPO, 'evidence', '2026-11-20', smokeDir);
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1',
    FIGHTALLY2: '1', LAUNCHSURVIVE: '1', MODE: 'sense3', DAYS: '30',
    SEEDS: '106251', RUN: 'sense3-b-smoke', OUTDIR: smokeDir });
  delete env.ALLYSLOT3;
  const r4 = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'sense3-driver-b.js')],
    { cwd: REPO, env: env, encoding: 'utf8', timeout: 600000 });
  check('§4 driver smoke (direct): exit 0 on one 30d seed', r4.status === 0, (r4.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(smokePath, 'sense3-b-s106251-sense3-b-smoke-sense3.json'), 'utf8')); } catch (e) {}
  check('§4 driver smoke (direct): corpus file written, slotAbsent true, arm sense3-b',
    !!dd && dd.slotAbsent === true && dd.arm === 'sense3-b',
    dd && { slotAbsent: dd.slotAbsent, arm: dd.arm });
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}

  // ---------- §5 CORPUS-REPRODUCTION CHECK ----------
  const dir = path.join(REPO, 'evidence', '2026-11-20', 'perseed-dmgshape-b');
  if (!fs.existsSync(dir)) { console.log('SKIP §5: dmgshape corpus not present'); }
  else {
    const a = A.analyzeDir(dir);
    check('§5 frozen dmgshape corpus: 156 encounters, 8 three-vid, 0 ally3Vid',
      a.files === 8 && a.encounters === 156 && a.threeVid === 8 && a.ally3Vid === 0,
      { files: a.files, encounters: a.encounters, threeVid: a.threeVid, ally3Vid: a.ally3Vid });
    check('§5 three-vid fights fired at most 1 shout each (max shouts 1)',
      a.threeVidMaxShouts === 1, a.threeVidMaxShouts);
    check('§5 allyFromStart 0/156 (the at-the-door path never ran live)',
      a.allyFromStart === 0, a.allyFromStart);
    check('§5 ladder-works control: shout 2 in 42/47 fights of >= 4 rounds',
      a.longFights === 47 && a.longWithShout2 === 42,
      { longFights: a.longFights, longWithShout2: a.longWithShout2 });
    check('§5 three-vid end causes: 2 evade, 1 contact-finish, 2 signature-exit, 2 low-HP flee, 1 death',
      (a.threeVidEndCauses['evade'] || 0) === 2 &&
      (a.threeVidEndCauses['contact-finish'] || 0) === 1 &&
      (a.threeVidEndCauses['signature-exit'] || 0) === 2 &&
      (a.threeVidEndCauses['low-HP flee'] || 0) === 2 &&
      (a.threeVidEndCauses['death'] || 0) === 1,
      a.threeVidEndCauses);
    check('§5 instrument clean on the prior corpus (0 errors, 8 files, 6 quad launches)',
      a.errors === 0 && a.files === 8 && a.quadLaunches === 6,
      { errors: a.errors, files: a.files, quadLaunches: a.quadLaunches });
  }

  console.log('test-sense3-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(function (e) { console.error('test-sense3-b FATAL', e && e.stack || e); process.exit(1); });
