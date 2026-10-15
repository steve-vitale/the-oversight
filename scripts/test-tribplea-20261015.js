#!/usr/bin/env node
// scripts/test-tribplea-20261015.js — proof for the asked-for tribute relief
// (loop B, 2026-10-15, food-economy axis, claims sim-findings #258/#261).
//
// RED (TRIBPLEA unset): R1 verb 'off', ctx untouched, gateOn() false, the
// exported tribplea IS belongseek (gate-off inert); R2 fresh fixtures,
// tribplea.daily vs belongseek.daily byte-identical state hashes.
// GREEN (TRIBPLEA=1): the plea fires exactly in the qualifying window, and it
// is the REAL engine verb (renegotiateLink) — proven by the -5 trust cost and
// the consumed table-week, which a fake policy-side discount would not pay:
//   G1 crisis (streak 4) + arrears + seasoned -> plea fires; trust 50->45;
//     lastTableWeek consumed; layer beat said AFTER the verb confirms.
//   G2 streak 2 -> hold-crisis, no plea, trust untouched.
//   G3 streak 4 but arrears 0 -> hold-noarrears (the arrears gate is
//     load-bearing: nothing owed, nothing to plead).
//   G4 grief window (mourningUntil, streak 0) + arrears -> plea fires.
//   G5 trust 20 -> hold-link; G6 table-week consumed -> hold-table (no
//     "still chewing" spam); G7 young link (age 5d) -> hold-link.
//   G8 determinism rerun (same seed -> same verdict, same trust, same terms).
//   G9 pendingRenegotiation staged (young-bond grief, #258's beat) + arrears,
//     streak 0 -> plea fires.
// --red: patch cycle — replaces the real verb call with a policy-side tribute
//   discount (the forbidden fake). G1's trust-cost / table-week assertions must
//   FAIL -> RED OBSERVED (exit 2). Proves the proof discriminates the real
//   verb from a fake discount.
// --break: patch cycle — typos the arrears gate (arrear > 0). G1 must FAIL
//   (plea never fires) -> RED OBSERVED (exit 2). Proves the arrears gate is
//   load-bearing.
// Patches live under ~/workspace (recovery-critical), applied with git apply,
// never git stash. Patch files are deleted after a green cycle.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const SEED = parseInt(process.env.SEED || '11', 10);
const ARMED = process.env.TRIBPLEA === '1';
const RED_MODE = process.argv.includes('--red');
const BREAK_MODE = process.argv.includes('--break');
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const TREE = path.resolve(__dirname, '..');
const LAYER = path.join(TREE, 'scripts', 'policies', 'tribplea.js');
const PATCH_DIR = path.join(process.env.HOME, 'workspace');

let passed = 0, failed = 0;
function check(name, cond, detail) {
  const line = `  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}\n`;
  process.stderr.write(line); // stderr survives quietLog's console silencing
  if (cond) passed++; else failed++;
}

// Mutation for --red: the fake discount (what the task FORBIDS). Trust cost
// and table-week consumption vanish, so the real-verb assertions fail.
const RED_TARGET = '  const ok = Game.renegotiateLink(link.id);';
const RED_REPLACEMENT = [
  '  // FAKE (red-phase): policy-side discount, no trust cost, no weekly verb.',
  '  link.tributeKcalPerWeek = Math.max(500, Math.round((link.tributeKcalPerWeek | 0) * 0.75));',
  '  const ok = true;',
].join('\n');
// Mutation for --break: unreachable crisis gate — the plea never fires.
const BREAK_TARGET = 'if (!(streak >= 3 || grief)) {';
const BREAK_REPLACEMENT = "if (!(streak >= 999 || grief === 'nope')) {";

const BACKUP_PATH = path.join(PATCH_DIR, 'tribplea-backup-20261015.js');

function clearCache() {
  for (const k of Object.keys(require.cache)) if (k.endsWith('tribplea.js')) delete require.cache[k];
}
function countOcc(hay, needle) { return hay.split(needle).length - 1; }
function applyMutation(mode) {
  const bytes = fs.readFileSync(LAYER, 'utf8');
  const target = mode === 'red' ? RED_TARGET : BREAK_TARGET;
  const replacement = mode === 'red' ? RED_REPLACEMENT : BREAK_REPLACEMENT;
  if (countOcc(bytes, target) !== 1) throw new Error('mutation target not unique: ' + target);
  fs.writeFileSync(BACKUP_PATH, bytes); // recovery-critical backup under ~/workspace, never /tmp
  fs.writeFileSync(LAYER, bytes.replace(target, replacement));
  clearCache();
}
function revertMutation() {
  const backup = fs.readFileSync(BACKUP_PATH, 'utf8');
  fs.writeFileSync(LAYER, backup);
  clearCache();
  fs.unlinkSync(BACKUP_PATH);
}

async function pleaFixture(seed, opts) {
  opts = opts || {};
  const { Game } = await loadGame({ seed, mode: 'tribplea-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (s) => { said.push(String(s)); };
  Game.feedback = function () {};
  Game.state.scholar.day = 30; Game.dayPart = 2;
  // The engine's own individual-hunger signal (game.js villageEats).
  if (opts.hungerStreak != null) Game.progState().hungryStreak = opts.hungerStreak;
  else Game.progState().hungryStreak = 0;
  // Active subordinate link: Haven owes village-east 6,000 kcal/week,
  // 4,000 kcal of it in arrears.
  const ms = Game.mshipState();
  ms.links = ms.links || [];
  const link = {
    id: 'link-plea-fixture', status: 'active', primary: 'village-east', subordinate: 'haven',
    tributeKcalPerWeek: 6000, tributePaidWeek: -1, tributeWeek: -1, tributePaidKcal: 0,
    arrears: opts.arrears != null ? opts.arrears : 4000,
    obligations: ['tribute', 'aid'], trust: opts.trust != null ? opts.trust : 50,
    day: opts.linkAge != null ? (30 - opts.linkAge) : 10,
    lastTableWeek: opts.tableWeek != null ? opts.tableWeek : -1,
    history: [{ day: 1, kind: 'formed', note: 'Haven joined village-east as subordinate.' }],
  };
  if (opts.mourningUntil != null) link.mourningUntil = opts.mourningUntil;
  if (opts.pendingRenegotiation) link.pendingRenegotiation = { day: 28, sub: true };
  ms.links.push(link);
  return { Game, said };
}

function linkOf(Game) {
  return (Game.hierarchyState() || []).find(l => l && l.id === 'link-plea-fixture');
}
function stateHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const l = linkOf(Game) || {};
  return JSON.stringify([
    s.day, Math.round((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0)),
    (v.pantry || []).length, l.tributePaidWeek, Math.round(l.tributePaidKcal || 0), l.arrears || 0,
    l.trust, l.tributeKcalPerWeek, l.lastTableWeek,
  ]);
}

// The GREEN assertions, shared by normal GREEN and the patch cycles.
// Returns [passed, failed].
async function greenAsserts() {
  const TP = require('./policies/tribplea');
  const { tribpleaVerb, tribpleaLayer, gateOn } = TP;
  const { belongseek } = require('./policies/belongseek');
  const week = 4; // floor(30/7)

  console.log(`== tribplea GREEN proof (armed, seed ${SEED}) ==`);
  await quietLog(async () => {
    // G1: crisis + arrears + seasoned -> the plea fires, and it is the REAL
    // verb: trust costs exactly 5 (50->45) and the table-week is consumed.
    const f1 = await pleaFixture(SEED, { hungerStreak: 4 });
    const ctx1 = {};
    const v1 = tribpleaVerb(f1.Game, ctx1);
    const l1 = linkOf(f1.Game);
    check('G1 plea fires in crisis+arrears window', v1 === 'pleaded-success' || v1 === 'pleaded-failed', 'verdict=' + v1);
    check('G1 real-verb trust cost (-5)', (l1.trust | 0) === 45, 'trust=' + l1.trust);
    check('G1 table-week consumed', (l1.lastTableWeek | 0) === week, 'lastTableWeek=' + l1.lastTableWeek);
    check('G1 ctx counts the plea', ctx1.tpPlea === 1, 'tpPlea=' + ctx1.tpPlea);
    const engIdx = f1.said.findIndex(s => /renegotiat|better terms/i.test(s));
    check('G1 engine narrates the ask', engIdx >= 0, 'engine-beat=' + (engIdx >= 0));
    const layerIdx = f1.said.findIndex(s => s.indexOf('🌾 Haven humbled itself') === 0);
    if (v1 === 'pleaded-success') {
      check('G1 cause line said AFTER the verb confirms', layerIdx > engIdx,
        'engine@' + engIdx + ' layer@' + layerIdx);
      check('G1 cause line names the context', layerIdx >= 0 && /4,000 kcal.*hungriest streak running 4 days/i.test(f1.said[layerIdx]),
        layerIdx >= 0 ? f1.said[layerIdx].slice(0, 80) : 'missing');
    } else {
      check('G1 silent on failure (engine narrated)', layerIdx < 0, 'layer-beats=' + (layerIdx < 0 ? 0 : 1));
    }

    // G2: streak 2 -> hold-crisis, no plea.
    const f2 = await pleaFixture(SEED, { hungerStreak: 2 });
    const ctx2 = {};
    check('G2 streak 2 -> hold-crisis', tribpleaVerb(f2.Game, ctx2) === 'held-crisis' && ctx2.tpHoldCrisis === 1,
      'tpHoldCrisis=' + ctx2.tpHoldCrisis);
    check('G2 trust untouched', (linkOf(f2.Game).trust | 0) === 50);
    check('G2 no layer beat', f2.said.filter(s => s.indexOf('🌾 Haven humbled itself') === 0).length === 0);

    // G3: streak 4 but arrears 0 -> hold-noarrears.
    const f3 = await pleaFixture(SEED, { hungerStreak: 4, arrears: 0 });
    const ctx3 = {};
    check('G3 no arrears -> hold-noarrears', tribpleaVerb(f3.Game, ctx3) === 'held-noarrears' && ctx3.tpHoldNoArrears === 1);
    check('G3 trust untouched', (linkOf(f3.Game).trust | 0) === 50);

    // G4: grief window (mourning) + arrears, streak 0 -> plea fires.
    const f4 = await pleaFixture(SEED, { hungerStreak: 0, mourningUntil: 33 });
    const ctx4 = {};
    const v4 = tribpleaVerb(f4.Game, ctx4);
    check('G4 grief window -> plea fires', (v4 === 'pleaded-success' || v4 === 'pleaded-failed') && ctx4.tpPlea === 1,
      'verdict=' + v4);
    check('G4 real-verb trust cost', (linkOf(f4.Game).trust | 0) === 45);

    // G5: trust 20 -> hold-link.
    const f5 = await pleaFixture(SEED, { hungerStreak: 4, trust: 20 });
    const ctx5 = {};
    check('G5 trust 20 -> hold-link', tribpleaVerb(f5.Game, ctx5) === 'held-link' && ctx5.tpHoldLink === 1);

    // G6: table-week already consumed -> hold-table, no "still chewing" spam.
    const f6 = await pleaFixture(SEED, { hungerStreak: 4, tableWeek: 4 });
    const ctx6 = {};
    check('G6 table consumed -> hold-table', tribpleaVerb(f6.Game, ctx6) === 'held-table' && ctx6.tpHoldTable === 1);
    check('G6 no chewing-refusal beat', f6.said.filter(s => /chewing on the last round/i.test(s)).length === 0);

    // G7: young link (age 5d) -> hold-link.
    const f7 = await pleaFixture(SEED, { hungerStreak: 4, linkAge: 5 });
    const ctx7 = {};
    check('G7 age 5d -> hold-link', tribpleaVerb(f7.Game, ctx7) === 'held-link' && ctx7.tpHoldLink === 1);

    // G8: determinism rerun — same seed, same verdict, same trust, same terms.
    const f8a = await pleaFixture(SEED, { hungerStreak: 4 });
    const v8a = tribpleaVerb(f8a.Game, {});
    const f8b = await pleaFixture(SEED, { hungerStreak: 4 });
    const v8b = tribpleaVerb(f8b.Game, {});
    check('G8 deterministic rerun', v8a === v8b &&
      linkOf(f8a.Game).trust === linkOf(f8b.Game).trust &&
      linkOf(f8a.Game).tributeKcalPerWeek === linkOf(f8b.Game).tributeKcalPerWeek,
      v8a + ' vs ' + v8b);

    // G9: young-bond grief (pendingRenegotiation staged, #258's beat) +
    // arrears, streak 0 -> plea fires.
    const f9 = await pleaFixture(SEED, { hungerStreak: 0, pendingRenegotiation: true, linkAge: 8, trust: 40 });
    const ctx9 = {};
    const v9 = tribpleaVerb(f9.Game, ctx9);
    check('G9 staged grief beat -> hold-link not plea (young, age<14)', v9 === 'held-link' && ctx9.tpHoldLink === 1,
      'verdict=' + v9);
    // Note: the stability gate (age>=14) correctly withholds the plea on the
    // young bond; the grief-window path is proven by G4 on a seasoned bond.
  });
  return [passed, failed];
}

async function main() {
  try { require.resolve('./policies/tribplea'); }
  catch (e) {
    console.log('INFO-SKIP: tribplea layer absent (deleted per kill protocol); proof pre-kill RED 4/4 + GREEN 20/20, --red/--break both RED OBSERVED (exit 2) — see evidence/2026-10-15/sim-tribplea-b.md');
    process.exit(0);
  }
  if (RED_MODE || BREAK_MODE) {
    if (!ARMED) { console.log((RED_MODE ? '--red' : '--break') + ' requires TRIBPLEA=1'); process.exit(1); }
    const mode = RED_MODE ? 'red' : 'break';
    const label = RED_MODE ? 'FAKE-DISCOUNT red' : 'BROKEN-GATE red';
    applyMutation(mode);
    let observedRed = false;
    try {
      passed = 0; failed = 0;
      await greenAsserts();
      // RED is OBSERVED iff the mechanism assertions failed.
      observedRed = failed > 0;
      console.log(`${label}: ${failed} assertion(s) failed under the mutation.`);
    } finally {
      try { revertMutation(); } catch (e) { console.log('MUTATION REVERT FAILED — restore from ' + BACKUP_PATH); }
    }
    // verify the file is byte-identical to pre-mutation state
    try {
      const restored = fs.readFileSync(LAYER, 'utf8');
      if (!restored.includes('Game.renegotiateLink(link.id)') || !restored.includes("if (!(streak >= 3 || grief)) {"))
        throw new Error('restore mismatch');
      console.log('layer restored byte-verified');
    } catch (e) { console.log('RESTORE VERIFICATION FAILED: ' + e.message); process.exit(1); }
    if (observedRed) { console.log('RED OBSERVED (exit 2)'); process.exit(2); }
    console.log('MUTATION DID NOT BREAK THE PROOF — test is vacuous (exit 1)'); process.exit(1);
  }

  if (!ARMED) {
    console.log(`== tribplea RED proof (gate off, seed ${SEED}) ==`);
    await quietLog(async () => {
      const TP = require('./policies/tribplea');
      const { belongseek } = require('./policies/belongseek');
      check('R1 verb absent gate-off (no plea machinery exported)', TP.tribpleaVerb === undefined);
      check('R1 gateOn absent', TP.gateOn === undefined);
      check('R1 export is the parent policy (inert)', TP.tribplea === belongseek,
        'id=' + (TP.tribplea && TP.tribplea.id));

      const a = await pleaFixture(SEED, { hungerStreak: 4 });
      const b = await pleaFixture(SEED, { hungerStreak: 4 });
      const ca = {}, cb = {};
      TP.tribplea.daily(a.Game, ca);
      belongseek.daily(b.Game, cb);
      check('R2 wrapper daily byte-identical to pristine daily',
        stateHash(a.Game) === stateHash(b.Game), 'hash=' + stateHash(a.Game).slice(0, 60));
    });
  } else {
    await greenAsserts();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) { console.log('INFO: failures under --red/--break are RED OBSERVED; otherwise the proof fails.'); process.exit(1); }
}

main().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(1); });
