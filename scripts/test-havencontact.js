#!/usr/bin/env node
// test-havencontact.js — sim-havencontact instrument proof.
//
// Gates:
//   E0 shape — module loads; exports installHavencontact/classifyOrigin/
//     classifyPlayerOrigin/classifyVOrigin/HDNS; no src/js touched (namespace check).
//   E1 synthetic RED->GREEN — the havencontact split: RED shows the
//     havendraw-b classifier labels a haven-contact row and a true-field row
//     identically ('field' — the channel is invisible); GREEN shows
//     classifyPlayerOrigin names havencontact, keeps every named class's
//     priority at the haven, and leaves true-field alone.
//   E2 determinism — same seed twice with instruments installed ->
//     byte-identical run digests (instrument is deterministic).
//   E3 off-gate — instrument ON vs OFF, same seed -> identical trajectory
//     digests (instrument is read-only / RNG-neutral; a wrap that drew RNG
//     or mutated state would diverge).
//   E4 live schema — 60d instrumented run: every record table has the
//     pre-registered schema fields (fights carry origin + baseOrigin);
//     instrumentErrors empty; every fight attributed to a named origin class.
//
// Usage env (pinned substrate, matches the census sweep):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 node scripts/test-havencontact.js
'use strict';
const path = require('path');
const crypto = require('crypto');
const REPO = process.env.REPO || path.join(__dirname, '..');
const HC = require(path.join(REPO, 'scripts', 'diag-havencontact'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ok: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
}

function digestOf(Game) {
  const st = Game.state || {};
  const canon = {
    day: (st.scholar || {}).day || 0,
    pop: ((st.village || {}).roster || []).length,
    wkl: (st.waveKillLog || []).length,
    kills: ((st.waveKillLog || []).map(e => [e.d, e.mid, e.by, e.w].join(':')).join('|')),
    deaths: (st.telemetry || []).filter(t => t.type === 'death').length,
    standing: (function () { try { return Game.villageStandingTotal ? Game.villageStandingTotal() : 0; } catch (e) { return 0; } })(),
    maxWave: (function () { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 0; } })(),
  };
  return crypto.createHash('sha256').update(JSON.stringify(canon)).digest('hex');
}

async function runOnce(seed, days, withInst) {
  const { Game } = await loadGame({ seed, mode: 'havencontact-proof', fullTelemetry: false });
  let hc = null;
  if (withInst) hc = HC.installHavencontact(Game);
  const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
  const policy = AD.armedFor(AD.normBase('lead'));
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  const d = digestOf(Game);
  const T = hc ? hc.T : null;
  if (hc) hc.uninstall();
  return { digest: d, T, days: (Game.state.scholar || {}).day || 0 };
}

(async () => {
  console.log('E0 shape');
  ok(HC.HDNS === 'havencontact', 'namespace is havencontact');
  ok(typeof HC.installHavencontact === 'function', 'installHavencontact exported');
  ok(typeof HC.classifyOrigin === 'function', 'classifyOrigin exported');
  ok(typeof HC.classifyPlayerOrigin === 'function', 'classifyPlayerOrigin exported');
  ok(typeof HC.classifyVOrigin === 'function', 'classifyVOrigin exported');
  ok(!/src\/js/.test(require('fs').readFileSync(path.join(REPO, 'scripts', 'diag-havencontact.js'), 'utf8').split('\n').filter(l => /require\(/.test(l)).join('')), 'instrument requires no src/js files');

  console.log('E1 synthetic RED->GREEN (havencontact split)');
  // RED: the havendraw-b taxonomy (the parent DIAG's fidelity) — a
  // checkEncounter contact AT the haven and one in the true field get the
  // same label. The 89% channel is invisible inside 'field'.
  const Hb = require(path.join(REPO, 'scripts', 'diag-havendraw-b'));
  const redHaven = Hb.classifyOrigin({ mid: 'eater' }); // atHaven context lost
  const redField = Hb.classifyOrigin({ mid: 'eater' });  // true field
  ok(redHaven === 'field' && redField === 'field' && redHaven === redField,
    'RED: havendraw-b labels haven contact and true field identically ("field")');
  // GREEN: classifyPlayerOrigin splits them.
  const P = HC.classifyPlayerOrigin;
  ok(P({ mid: 'eater' }, true) === 'havencontact', 'GREEN: field ctx + atHaven -> havencontact');
  ok(P({ mid: 'eater' }, false) === 'field', 'GREEN: field ctx + away -> field');
  ok(P(null, true) === 'field', 'GREEN: null ctx stays field (no phantom havencontact)');
  ok(P({ mid: null }, true) === 'field', 'GREEN: null mid stays field (unverifiable contact)');
  ok(P({ mid: 'eater', feastDrawMid: 'eater' }, true) === 'feastdraw', 'GREEN: named classes keep priority at the haven (feastdraw)');
  ok(P({ mid: 'eater', markFaceDraw: true }, true) === 'feastdraw', 'GREEN: markFaceDraw at haven -> feastdraw');
  ok(P({ mid: 'x', markTrap: true }, true) === 'trap', 'GREEN: trap at haven stays trap');
  ok(P({ mid: 'x', markReengage: true }, true) === 'reengage', 'GREEN: reengage at haven stays reengage');
  ok(P({ mid: 'x', pendingInTent: true }, true) === 'tent', 'GREEN: tent at haven stays tent');
  ok(P({ mid: 'audit', raidReachMid: 'audit', pendingEncounter: true, pendingMonsterId: 'audit' }, true) === 'raidreach', 'GREEN: raidreach at haven stays raidreach');
  ok(P({ mid: 'x', pendingEncounter: true, pendingMonsterId: 'x' }, true) === 'pending-other', 'GREEN: pending-other at haven stays pending-other');
  // base classifier matrix (unchanged from havendraw-b).
  const C = HC.classifyOrigin;
  ok(C({ mid: 'eater', feastDrawMid: 'eater' }) === 'feastdraw', 'GREEN: base feastDrawMid -> feastdraw');
  ok(C({ mid: 'x' }) === 'field', 'GREEN: base bare row -> field');
  const V = HC.classifyVOrigin;
  ok(V({ raid: true }) === 'raiddefense', 'GREEN: v opts.raid -> raiddefense');
  ok(V({ lingering: true }) === 'lingerer', 'GREEN: v lingering -> lingerer');
  ok(V({ distHaven: 1 }) === 'havengrounds', 'GREEN: v distHaven 1 -> havengrounds');
  ok(V({ distHaven: 2 }) === 'field', 'GREEN: v distHaven 2 -> field');

  console.log('E2 determinism (same seed twice, instruments on)');
  const a = await runOnce(65821, 60, true);
  const b = await runOnce(65821, 60, true);
  ok(a.digest === b.digest, `byte-identical digests on instrumented path (${a.digest.slice(0, 12)})`);

  console.log('E3 off-gate (instrument ON vs OFF, same seed)');
  const c = await runOnce(65822, 60, false);
  const d2 = await runOnce(65822, 60, true);
  ok(c.digest === d2.digest, `instrument does not perturb trajectories (${c.digest.slice(0, 12)})`);

  console.log('E4 live schema (60d instrumented run)');
  const T = d2.T;
  ok(T && Array.isArray(T.fights) && Array.isArray(T.ends) && Array.isArray(T.vfights)
    && Array.isArray(T.raids) && Array.isArray(T.musters) && Array.isArray(T.draws), 'all six record tables present');
  const req = { fights: ['day', 'mid', 'wave', 'atHaven', 'feasted', 'origin', 'baseOrigin', 'party'],
    ends: ['day', 'result', 'perFighter', 'compDmg'],
    vfights: ['day', 'vid', 'mid', 'wave', 'origin', 'outcome'],
    raids: ['day', 'fired', 'raiders', 'palisade'],
    musters: ['day', 'kind'],
    draws: ['day', 'kind'] };
  let schemaOk = true;
  for (const k of Object.keys(req)) {
    for (const row of (T[k] || [])) for (const f of req[k]) { if (!(f in row)) { schemaOk = false; } }
  }
  ok(schemaOk, 'every row carries its pre-registered schema fields (fights: origin + baseOrigin)');
  ok(T.instrumentErrors.length === 0, `instrumentErrors empty (got ${T.instrumentErrors.length})`);
  const named = new Set(['feastdraw', 'raidreach', 'tent', 'trap', 'reengage', 'pending-other', 'havencontact', 'field']);
  const unattributed = (T.fights || []).filter(f => !named.has(f.origin));
  ok(unattributed.length === 0, `all live fights attributed to named classes (${(T.fights || []).length} fights)`);
  const splitHolds = (T.fights || []).every(f => (f.origin === 'havencontact') === (f.baseOrigin === 'field' && f.atHaven === true && f.mid != null));
  ok(splitHolds, 'origin/baseOrigin split consistent: havencontact <=> (base field AND atHaven AND verifiable mid)');
  const origins = [...new Set((T.fights || []).map(f => f.origin))];
  console.log(`  note: live origin classes in 60d: ${origins.join(',') || '(no fights)'}`);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', (e && e.stack) || e); process.exit(1); });
