// test-dmgpin-b.js — proof test, arm sim-dmgpin-b (finding #2605/#2619:
// DAMAGE carried with the pin — a pinned quad strikes as one unit).
// The pin gate (test-pinquaddoor-b.js 35/35) is the base gate; this test
// proves the DMGPIN lever on the pinned base.
//
// WHAT IT PROVES (observable effect, not just assertions):
//   §1 DOUBLING, ARMED: the same staged geared quad vs the wave-4 audit,
//     same seed, same staging — DMGPIN=1 doubles every round-1 strike
//     exactly (armed[i] == 2 * control[i]), and the coordinated-strikes
//     line appears exactly once in the armed log, never in the control.
//   §2 INERT WITHOUT THE PIN: DMGPIN=1 with PINQUAD unset doubles
//     nothing (round-1 strikes equal the §1 control exactly) — the
//     lever is carried WITH the pin, never alone.
//   §3 WAVE GATE: DMGPIN=1 + PINQUAD=1 vs a wave-1 monster doubles
//     nothing (round-1 strikes equal the wave-1 control exactly) — the
//     canon-anchored wave-1 duel balance is never touched.
//   §4 DRIVER SMOKE: the pinquaddoor driver runs one 30d armed seed
//     with DMGPIN=1, exit 0, 0 instrument errors, dmgpinFlag '1' on
//     the corpus file (pinquadFlag '1' beside it).
//   §5 BASE GATE: test-pinquaddoor-b.js re-runs green on this tip.
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged party is
// a geared wave-4 hunting party — hide_armor + hunting_spear, armor P
// measured back in the live 8–30 range — never a fresh un-geared scholar.
// Usage: node scripts/test-dmgpin-b.js
// Exit 0 = all checks pass.
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function hasLine(rec, re) { return (rec.log || []).some(function (s) { return re.test(s); }); }
function countLine(rec, re) { return (rec.log || []).filter(function (s) { return re.test(s); }).length; }
// Round-1 "strikes for N" values, in log order (fighter + allies; the
// Live Broadcast echo line says "strikes again" and is excluded).
function round1Strikes(rec) {
  const out = [];
  (rec.log || []).forEach(function (s) {
    const m = /^R1: .* strikes for (\d+)/.exec(s);
    if (m) out.push(parseInt(m[1], 10));
  });
  return out;
}

const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');

(function section0() {
  check('§0 fieldFights.js carries the DMGPIN gate (DMGPIN + dmgPinOn + pinnedQuadAllies trio match)',
    /DMGPIN/.test(ffSrc) && /dmgPinOn/.test(ffSrc) && /pinnedQuadAllies\(vid\)/.test(ffSrc) &&
    /allyVid === _dmgPin\[0\] && ally2Vid === _dmgPin\[1\] && ally3Vid === _dmgPin\[2\]/.test(ffSrc));
  check('§0 the gate is wave-gated (wave >= 4) and env-gated OFF by default',
    /\(mdef\.wave \| 0\) >= 4/.test(ffSrc) && /process\.env\.DMGPIN === '1'/.test(ffSrc));
  check('§0 the multiplier is x2 on all four strike sites + the broadcast echo',
    (ffSrc.match(/Math\.round\(vd \* 2\)/g) || []).length >= 1 &&
    (ffSrc.match(/Math\.round\(ad\d? \* 2\)/g) || []).length >= 3 &&
    /Math\.round\(_bd \* 2\)/.test(ffSrc));
  check('§0 the coordinated line is narrated once (dmgPinTell + dmgPinTold)',
    /dmgPinTell/.test(ffSrc) && /rec\.dmgPinTold/.test(ffSrc) &&
    /fights as one — every strike lands with the unit/.test(ffSrc));
  check('§0 the pin is still present (pinnedQuadAllies + PINQUAD in villager-agency.js)',
    /pinnedQuadAllies/.test(fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8')));
  // The pin gate is the base gate — re-run it here so this file is
  // self-contained proof of the base it stands on.
  const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'test-pinquaddoor-b.js')],
    { cwd: REPO, env: process.env, encoding: 'utf8', timeout: 600000 });
  check('§0 pin gate re-runs green (test-pinquaddoor-b.js 35/35)',
    r.status === 0 && /35 passed, 0 failed/.test(r.stdout || ''), (r.stdout || '').split('\n').slice(-2).join(' / '));
})();

// ================= STAGING HELPERS (same as test-pinquaddoor-b.js) =================
function pickQuad(Game) {
  const v = Game.state.village || {};
  const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
  const roster = (v.roster || []).filter(function (id) { return id !== Game.villagerId; });
  let elig = [];
  try {
    const a = Game.agencyState ? Game.agencyState() : null;
    if (a) {
      a.potential = a.potential || {};
      roster.forEach(function (id) { try { a.potential[id] = true; } catch (e) {} });
      if (a.profiles) roster.forEach(function (id) { try { delete a.profiles[id]; } catch (e) {} });
    }
    elig = roster.filter(function (id) {
      try {
        const prof = Game.npcRangeProfile ? Game.npcRangeProfile(id) : null;
        return prof === 'wanderer' || prof === 'explorer';
      } catch (e) { return false; }
    });
  } catch (e) {}
  if (elig.length < 4) return { ok: false, why: 'only ' + elig.length + ' ranging villagers', hx: hx, hy: hy };
  const q = elig.slice(0, 4);
  v.trust = v.trust || {};
  v.health = v.health || {};
  v.sick = v.sick || {};
  q.forEach(function (id) {
    v.trust[id] = 50; v.health[id] = 100; delete v.sick[id];
    try { Game.npcSetNode(id, hx, hy); } catch (e) {}
  });
  return { ok: true, holder: q[0], c1: q[1], c2: q[2], c3: q[3], hx: hx, hy: hy };
}
function gearUp(Game, ids) {
  const kit = { torso: { itemId: 'hide_armor' }, melee: { itemId: 'hunting_spear' } };
  ids.forEach(function (id) {
    const p = Game.getPerson ? Game.getPerson(id) : (Game.vpOf ? Game.vpOf(id) : null);
    if (p) p.equipped = JSON.parse(JSON.stringify(kit));
  });
}
// Stage one geared pinned quad vs one monster, door opts, and fight it.
// Returns the record. Caller sets the env (PINQUAD / DMGPIN) first.
async function stageDoorFight(monsterId) {
  const { Game } = await loadGame({ seed: 424242, mode: 'pinquaddoor', fullTelemetry: false });
  await setupGame(Game);
  const q = pickQuad(Game);
  if (!q.ok) return { ok: false, why: q.why || q };
  gearUp(Game, [q.holder, q.c1, q.c2, q.c3]);
  const st = Game.agencyState ? Game.agencyState() : null;
  [q.holder, q.c1, q.c2, q.c3].forEach(function (id) {
    Game.startExpedition(id, q.hx, q.hy, false, { tx: 6, ty: 6, duration: 20 });
  });
  const pinned = Game.pinQuadParty(q.holder, [q.c1, q.c2, q.c3]);
  const v = Game.state.village;
  v.health[q.holder] = 84; v.health[q.c1] = 100; v.health[q.c2] = 100; v.health[q.c3] = 100;
  const mdef = (Game.data.monsters || []).find(function (m) { return m.id === monsterId; }) || {};
  const rec = Game.fieldFight(q.holder, mdef, null, { allies: 3, allyVids: [q.c1, q.c2, q.c3], allyFromStart: true });
  return { ok: true, Game: Game, q: q, pinned: pinned, rec: rec, mdef: mdef, st: st };
}

(async () => {
  process.env.SENSEEXPED = '1'; process.env.PARTYSIZE4 = '1'; process.env.VETREENGAGE = '1';
  process.env.FIGHTALLY2 = '1'; process.env.ALLYSLOT3 = '1'; process.env.PINQUAD = '1';
  process.env.LAUNCHSURVIVE = '1';

  // ---------- §1 DOUBLING, ARMED vs CONTROL (wave-4 audit) ----------
  delete process.env.DMGPIN;
  const ctl = await stageDoorFight('audit');
  check('§1 staging: control load stages (pinned quad vs audit)', ctl.ok, ctl.why || ctl);
  process.env.DMGPIN = '1';
  const armed = await stageDoorFight('audit');
  check('§1 staging: armed load stages (pinned quad vs audit, DMGPIN=1)', armed.ok, armed.why || armed);
  if (ctl.ok && armed.ok) {
    check('§1 both loads pin the quad (pinQuadParty true)', ctl.pinned === true && armed.pinned === true,
      { ctl: ctl.pinned, armed: armed.pinned });
    check('§1 both loads open at the door with all three allies (ally3Vid set)',
      !!ctl.rec.ally3Vid && !!armed.rec.ally3Vid, { ctl: ctl.rec.ally3Vid, armed: armed.rec.ally3Vid });
    const sCtl = round1Strikes(ctl.rec), sArmed = round1Strikes(armed.rec);
    console.log('  [§1 round-1 strikes] control=' + JSON.stringify(sCtl) + ' armed=' + JSON.stringify(sArmed));
    check('§1 round 1 struck in both loads (>= 1 strike each)', sCtl.length >= 1 && sArmed.length >= 1,
      { ctl: sCtl.length, armed: sArmed.length });
    check('§1 same strike count in round 1 (no RNG drawn by the lever)', sCtl.length === sArmed.length,
      { ctl: sCtl.length, armed: sArmed.length });
    check('§1 every round-1 strike doubles exactly (armed[i] == 2 * control[i])',
      sCtl.length === sArmed.length && sCtl.length >= 1 && sCtl.every(function (v, i) { return sArmed[i] === 2 * v; }),
      { ctl: sCtl, armed: sArmed });
    check('§1 coordinated line appears exactly once in the armed log, never in the control',
      countLine(armed.rec, /fights as one — every strike lands with the unit/) === 1 &&
      countLine(ctl.rec, /fights as one — every strike lands with the unit/) === 0,
      { armed: countLine(armed.rec, /fights as one/), ctl: countLine(ctl.rec, /fights as one/) });
    check('§1 armed deals more total damage (mDealt armed > control)',
      (armed.rec.mDealt || 0) > (ctl.rec.mDealt || 0), { ctl: ctl.rec.mDealt, armed: armed.rec.mDealt });
    check('§1 armed third ally deals more (ally3Dealt armed > control)',
      (armed.rec.ally3Dealt || 0) > (ctl.rec.ally3Dealt || 0), { ctl: ctl.rec.ally3Dealt, armed: armed.rec.ally3Dealt });
  }

  // ---------- §2 INERT WITHOUT THE PIN ----------
  delete process.env.PINQUAD;
  process.env.DMGPIN = '1';
  const { Game: Game2 } = await loadGame({ seed: 424242, mode: 'pinquaddoor', fullTelemetry: false });
  await setupGame(Game2);
  const q2 = pickQuad(Game2);
  check('§2 staging: four launchable villagers found (no-pin load)', q2.ok, q2.why || q2);
  if (q2.ok) {
    gearUp(Game2, [q2.holder, q2.c1, q2.c2, q2.c3]);
    [q2.holder, q2.c1, q2.c2, q2.c3].forEach(function (id) {
      Game2.startExpedition(id, q2.hx, q2.hy, false, { tx: 6, ty: 6, duration: 20 });
    });
    const pinned2 = Game2.pinQuadParty(q2.holder, [q2.c1, q2.c2, q2.c3]);
    check('§2 pinQuadParty writes nothing with PINQUAD unset (returns false)', pinned2 === false, pinned2);
    const v2 = Game2.state.village;
    v2.health[q2.holder] = 84; v2.health[q2.c1] = 100; v2.health[q2.c2] = 100; v2.health[q2.c3] = 100;
    const mdef2 = (Game2.data.monsters || []).find(function (m) { return m.id === 'audit'; }) || {};
    const rec2 = Game2.fieldFight(q2.holder, mdef2, null, { allies: 3, allyVids: [q2.c1, q2.c2, q2.c3], allyFromStart: true });
    const s2 = round1Strikes(rec2);
    console.log('  [§2 round-1 strikes] no-pin DMGPIN=1=' + JSON.stringify(s2) + ' vs §1 control=' + JSON.stringify(round1Strikes(ctl.rec)));
    check('§2 DMGPIN without the pin doubles nothing (round-1 strikes equal the §1 control exactly)',
      ctl.ok && eq(s2, round1Strikes(ctl.rec)), { noPin: s2, control: ctl.ok ? round1Strikes(ctl.rec) : null });
    check('§2 no coordinated line without the pin',
      countLine(rec2, /fights as one — every strike lands with the unit/) === 0, null);
  }

  // ---------- §3 WAVE GATE (wave-1 monster, pin + DMGPIN on) ----------
  process.env.PINQUAD = '1';
  process.env.DMGPIN = '1';
  // Gallowdeer: wave 1, HP [150,170] — sturdy enough to survive round 1
  // against a geared quad (a hushwolf at HP [50,65] could die to the
  // volley before round 1, leaving zero strikes to compare).
  const wave1Id = 'gallowdeer';
  const w1a = await stageDoorFight(wave1Id);
  check('§3 staging: armed wave-1 load stages', w1a.ok, w1a.why || w1a);
  delete process.env.DMGPIN;
  const w1c = await stageDoorFight(wave1Id);
  check('§3 staging: control wave-1 load stages', w1c.ok, w1c.why || w1c);
  if (w1a.ok && w1c.ok) {
    check('§3 both wave-1 loads pin the quad', w1a.pinned === true && w1c.pinned === true, { a: w1a.pinned, c: w1c.pinned });
    check('§3 the wave-1 monster really is wave 1', (w1a.mdef.wave | 0) === 1, w1a.mdef.wave);
    const sA = round1Strikes(w1a.rec), sC = round1Strikes(w1c.rec);
    console.log('  [§3 round-1 strikes] wave-1 armed=' + JSON.stringify(sA) + ' control=' + JSON.stringify(sC));
    check('§3 DMGPIN doubles nothing at wave 1 (round-1 strikes equal the wave-1 control exactly)',
      eq(sA, sC) && sA.length >= 1, { armed: sA, control: sC });
    check('§3 no coordinated line at wave 1',
      countLine(w1a.rec, /fights as one — every strike lands with the unit/) === 0, null);
  }

  // ---------- §4 DRIVER SMOKE (armed leg, direct) ----------
  process.env.ALLYSLOT3 = '1'; process.env.PINQUAD = '1'; process.env.DMGPIN = '1';
  const smokeDir = 'perseed-dmgpin-b-smoke';
  const smokePath = path.join(REPO, 'evidence', '2026-11-21', smokeDir);
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1',
    FIGHTALLY2: '1', LAUNCHSURVIVE: '1', ALLYSLOT3: '1', PINQUAD: '1', DMGPIN: '1',
    MODE: 'pinquaddoor', DAYS: '30', EVIDENCE_DATE: '2026-11-21', CORPUS_PREFIX: 'dmgpin-b',
    SEEDS: '106251', RUN: 'dmgpin-b-smoke', OUTDIR: smokeDir });
  const r4 = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'pinquaddoor-driver-b.js')],
    { cwd: REPO, env: env, encoding: 'utf8', timeout: 600000 });
  check('§4 driver smoke (direct, armed): exit 0 on one 30d seed', r4.status === 0, (r4.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(smokePath, 'dmgpin-b-s106251-dmgpin-b-smoke-pinquaddoor.json'), 'utf8')); } catch (e) {}
  check('§4 driver smoke: corpus file written, dmgpinFlag 1 + pinquadFlag 1 + slotPresent true',
    !!dd && dd.dmgpinFlag === '1' && dd.pinquadFlag === '1' && dd.slotPresent === true,
    dd && { dmgpinFlag: dd.dmgpinFlag, pinquadFlag: dd.pinquadFlag, slotPresent: dd.slotPresent });
  if (dd) {
    check('§4 driver smoke: 0 instrument errors', (dd.instrumentErrors || []).length === 0, dd.instrumentErrors);
  }
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}

  console.log('test-dmgpin-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(function (e) { console.error('test-dmgpin-b FATAL', e && e.stack || e); process.exit(1); });
