// test-doorflee2-b.js — proof test, arm sim-doorflee2-b (finding #2619:
// WHY A WINNING PINNED QUAD STILL FLEES AT DOORS — the P4 hopeless
// read imagines protection 4, so a geared leader's imagined health
// goes deeply negative and drags the whole quad's pooled survival
// below the kill horizon. The DOORFLEE hold (sim-doorflee-b, pilot
// NO-GO) re-read the race on live numbers but guarded only the
// leader's NEXT round — the leader survived one round and died two
// rounds later on 3 of 8 held doors. The DOORFLEE2 hold keeps the
// live-race re-read and replaces the guard with LEADER-SURVIVAL-ONLY:
// the leader's live HP must exceed their incoming rate times the
// rounds left to kill (vHp > leaderRate * rtk) — the leader must
// plausibly survive the WHOLE remaining fight, not just next round.)
// The pin gate (test-pinquaddoor-b.js 35/35) + damage gate
// (test-dmgpin-b.js 29/29) are the base gates; this test proves the
// DOORFLEE2 staying lever on the pinned + damage base.
//
// WHAT IT PROVES (observable effect, not just assertions):
//   §1a STAYING, ARMED: the same staged geared quad vs the wave-4
//     herald, leader at 60 HP, same seed, same staging, DMGPIN=1
//     on BOTH loads (the pilot's control leg is pin+damage without
//     the hold) — control (DOORFLEE2 unset) flees at round 2 on the
//     hopeless branch (everHopeless, "sees how this ends"); armed
//     (DOORFLEE2=1) holds (doorHold 2, "(Door hold)" line once),
//     fights on to the round-6 KILL, leader alive at 21 HP, dealing
//     780 vs the control's 306. Round-1 strikes are identical (no
//     RNG drawn by the lever).
//   §1b TIGHTENING, ARMED: the same staged quad vs the wave-4
//     algorithm, leader at 60 HP — the case DOORFLEE held (doorflee-b
//     §1: armed held to round 3, dealt 462). Under DOORFLEE2 the
//     armed load is IDENTICAL to the control (flee round 2, doorHold
//     0, dealt 306): the new guard releases where the old one held.
//     The arithmetic is checked from the control rec: at the flee
//     the old one-round guard was TRUE (leader 28 HP > 16/round)
//     while the new whole-fight guard is FALSE (28 <= 16 x 5.03
//     rounds to kill) — the tightening, priced in numbers.
//   §2 INERT WITHOUT THE PIN: two no-pin loads (DOORFLEE2 unset vs
//     DOORFLEE2=1, DMGPIN=1 both) stage identically — outcome, rounds
//     and dealt equal exactly, doorHold 0, no hold line. The lever
//     is carried WITH the pin: without it, DOORFLEE2 changes nothing
//     (and DMGPIN does not double either — the no-pin loads deal the
//     undoubled 153, half the pinned control's 306).
//   §3 WAVE GATE: DOORFLEE2=1 + PINQUAD=1 vs a wave-1 monster holds
//     nothing (doorHold 0, no hold line; outcome equals the wave-1
//     control) — the wave-1 duel balance is never touched.
//   §4 NOT A DOOR: DOORFLEE2=1 on a pinned quad that did NOT enter at
//     the door (allyFromStart false — the trio joins through shouts)
//     changes nothing (outcome/rounds/dealt equal the §4 control
//     exactly, doorHold 0) — the hold is a DOOR hold, never a
//     shout-ladder hold.
//   §5 DRIVER SMOKE: the pinquaddoor driver runs one 30d armed seed
//     with DOORFLEE2=1 + DMGPIN=1, exit 0, 0 instrument errors,
//     doorflee2Flag '1' + dmgpinFlag '1' + pinquadFlag '1' on the
//     corpus file, and every v4 row carries a numeric doorHold.
//   §6 BASE GATES: test-dmgpin-b.js re-runs green (29/29) and
//     test-downedtwice-b.js re-runs green on this tip.
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged party
// is a geared wave-4 hunting party — hide_armor + hunting_spear,
// leader at 60 HP (wounded the way door leaders arrive: the
// 106824 control door entered at 40 HP) — never a fresh un-geared
// scholar. The herald is the proof case because it is the wave-4
// monster whose damage spreads thin enough that a 60-HP leader can
// plausibly survive the whole remaining fight (leader rate ~6-9/round
// vs the algorithm's ~16/round, which no 60-HP leader survives for
// the 5 rounds the kill needs). At 90 HP the herald control also
// kills — the hold is not what saves it — so 60 HP is the case
// where the hold is the difference.
// Usage: node scripts/test-doorflee2-b.js
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
  check('§0 fieldFights.js carries the DOORFLEE2 gate (DOORFLEE2 env + doorFlee2Quad + pinnedQuadAllies trio match)',
    /DOORFLEE2/.test(ffSrc) && /doorFlee2Quad/.test(ffSrc) && /doorflee2On/.test(ffSrc) &&
    /allyVid === _df2Pin\[0\] && ally2Vid === _df2Pin\[1\] && ally3Vid === _df2Pin\[2\]/.test(ffSrc));
  check('§0 the gate is wave-gated (>= 4), door-gated (allyFromStart) and env-gated OFF by default',
    /process\.env\.DOORFLEE2 === '1'/.test(ffSrc) && /opts\.allyFromStart/.test(ffSrc) &&
    /\(mdef\.wave \| 0\) >= 4/.test(ffSrc));
  check('§0 the old DOORFLEE flag is no longer read (superseded, held branch keeps it)',
    !/process\.env\.DOORFLEE === '1'/.test(ffSrc));
  check('§0 the hold re-reads the race on live numbers (live party HP vs live taken rate, 1.1 margin)',
    /_df2Live/.test(ffSrc) && /_df2TakenRate/.test(ffSrc) && /_df2Rtk <= _df2Rtd \* 1\.1/.test(ffSrc));
  check('§0 the hold fires only on a P4-hopeless round (hopeless in the gate) and counts it (doorHold)',
    /hopeless && round >= 2/.test(ffSrc) && /rec\.doorHold = \(rec\.doorHold \| 0\) \+ 1/.test(ffSrc));
  check('§0 the LEADER-SURVIVAL-ONLY guard is in the hold (vHp > leaderRate * rounds-to-kill)',
    /_df2LeaderRate/.test(ffSrc) && /vHp > _df2LeaderRate \* _df2Rtk/.test(ffSrc));
  check('§0 the old one-round guard is gone (no bare vHp > leaderRate in the hold)',
    !/vHp > _dfLeaderRate\)/.test(ffSrc));
  check('§0 the hold narrates once per fight (doorHoldLogged + "(Door hold)" line)',
    /rec\.doorHoldLogged/.test(ffSrc) && /holds the door — the fight is theirs/.test(ffSrc));
  check('§0 the hold draws no RNG (no RR() inside the DOORFLEE2 block)',
    (function () {
      const i = ffSrc.indexOf('// DOORFLEE2 (sim-doorflee2-b, finding #2619): a pinned quad at a');
      const j = ffSrc.indexOf('// LEARN-VS-FIGHT', i);
      const block = ffSrc.slice(i, j);
      return block.indexOf('RR()') === -1 && block.indexOf('RR(') === -1;
    })());
  check('§0 learn-first is untouched (intent learn in the hold gate)',
    /rec\.intent !== 'learn'/.test(ffSrc));
})();

// ================= STAGING HELPERS (same as test-dmgpin-b.js) =================
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
// Stage one geared pinned quad vs one monster and fight it.
// leaderHp sets the holder's health (allies 100). door=true passes
// allyFromStart; door=false lets the trio join through the shout
// ladder instead. Caller sets the env (PINQUAD / DMGPIN / DOORFLEE2) first.
async function stageFight(monsterId, leaderHp, door) {
  const { Game } = await loadGame({ seed: 424242, mode: 'pinquaddoor', fullTelemetry: false });
  await setupGame(Game);
  const q = pickQuad(Game);
  if (!q.ok) return { ok: false, why: q.why || q };
  gearUp(Game, [q.holder, q.c1, q.c2, q.c3]);
  [q.holder, q.c1, q.c2, q.c3].forEach(function (id) {
    Game.startExpedition(id, q.hx, q.hy, false, { tx: 6, ty: 6, duration: 20 });
  });
  const pinned = Game.pinQuadParty(q.holder, [q.c1, q.c2, q.c3]);
  const v = Game.state.village;
  v.health[q.holder] = leaderHp; v.health[q.c1] = 100; v.health[q.c2] = 100; v.health[q.c3] = 100;
  const mdef = (Game.data.monsters || []).find(function (m) { return m.id === monsterId; }) || {};
  const rec = Game.fieldFight(q.holder, mdef, null, { allies: 3, allyVids: [q.c1, q.c2, q.c3], allyFromStart: !!door });
  return { ok: true, Game: Game, q: q, pinned: pinned, rec: rec, mdef: mdef };
}
function summarize(rec) {
  return {
    outcome: rec.outcome, rounds: rec.rounds, mDealt: rec.mDealt, vTaken: rec.vTaken,
    vHpLeft: rec.vHpLeft, everHopeless: !!rec.everHopeless, everWinning: !!rec.everWinning,
    doorHold: (rec.doorHold | 0),
    holdLines: countLine(rec, /holds the door — the fight is theirs/),
    fleeLines: countLine(rec, /sees how this ends/),
    fleeHpFrac: (rec.fleeHpFrac == null ? null : +rec.fleeHpFrac.toFixed(2)),
  };
}

(async () => {
  process.env.SENSEEXPED = '1'; process.env.PARTYSIZE4 = '1'; process.env.VETREENGAGE = '1';
  process.env.FIGHTALLY2 = '1'; process.env.ALLYSLOT3 = '1'; process.env.PINQUAD = '1';
  process.env.LAUNCHSURVIVE = '1'; process.env.DMGPIN = '1';

  // ---------- §1a STAYING, ARMED vs CONTROL (wave-4 herald, leader 60) ----------
  // DMGPIN=1 on BOTH loads: the control is pin+damage without the
  // hold (the pilot's control leg), the armed adds DOORFLEE2=1 only.
  process.env.DMGPIN = '1';
  delete process.env.DOORFLEE2;
  const hCtl = await stageFight('herald', 60, true);
  check('§1a staging: control load stages (pinned quad vs herald, leader 60)', hCtl.ok, hCtl.why || hCtl);
  process.env.DOORFLEE2 = '1';
  const hArm = await stageFight('herald', 60, true);
  check('§1a staging: armed load stages (pinned quad vs herald, DOORFLEE2=1)', hArm.ok, hArm.why || hArm);
  if (hCtl.ok && hArm.ok) {
    const sc = summarize(hCtl.rec), sa = summarize(hArm.rec);
    console.log('  [§1a] control=' + JSON.stringify(sc) + ' armed=' + JSON.stringify(sa));
    check('§1a both loads pin the quad (pinQuadParty true)', hCtl.pinned === true && hArm.pinned === true,
      { ctl: hCtl.pinned, armed: hArm.pinned });
    check('§1a both loads open at the door with all three allies (ally3Vid set)',
      !!hCtl.rec.ally3Vid && !!hArm.rec.ally3Vid, { ctl: hCtl.rec.ally3Vid, armed: hArm.rec.ally3Vid });
    check('§1a round-1 strikes are identical (the lever draws no RNG before the hold)',
      eq(round1Strikes(hCtl.rec), round1Strikes(hArm.rec)) && round1Strikes(hCtl.rec).length >= 1,
      { ctl: round1Strikes(hCtl.rec), armed: round1Strikes(hArm.rec) });
    check('§1a control flees at round 2 on the hopeless branch (vFlee, everHopeless, flee line)',
      sc.outcome === 'vFlee' && sc.rounds === 2 && sc.everHopeless === true && sc.fleeLines === 1, sc);
    check('§1a armed holds (doorHold 2, "(Door hold)" line exactly once)',
      sa.doorHold === 2 && sa.holdLines === 1, sa);
    check('§1a armed fights on to the kill (vKill at round 6, not a later flee)',
      sa.outcome === 'vKill' && sa.rounds === 6, sa);
    check('§1a armed deals more (mDealt 780 > 306) — the held rounds land',
      sa.mDealt === 780 && sa.mDealt > sc.mDealt, sa);
    check('§1a armed leader survives the whole fight (vHpLeft 21 > 0)',
      sa.vHpLeft === 21 && sa.vHpLeft > 0, sa);
  }

  // ---------- §1b TIGHTENING (wave-4 algorithm, leader 60 — DOORFLEE held here) ----------
  // The doorflee-b §1 case: under the old one-round guard the armed
  // load held to round 3 and dealt 462. Under DOORFLEE2 the armed
  // load must be IDENTICAL to the control — the new guard releases.
  process.env.DMGPIN = '1';
  delete process.env.DOORFLEE2;
  const aCtl = await stageFight('algorithm', 60, true);
  check('§1b staging: control load stages (pinned quad vs algorithm, leader 60)', aCtl.ok, aCtl.why || aCtl);
  process.env.DOORFLEE2 = '1';
  const aArm = await stageFight('algorithm', 60, true);
  check('§1b staging: armed load stages (pinned quad vs algorithm, DOORFLEE2=1)', aArm.ok, aArm.why || aArm);
  if (aCtl.ok && aArm.ok) {
    const sc = summarize(aCtl.rec), sa = summarize(aArm.rec);
    console.log('  [§1b] control=' + JSON.stringify(sc) + ' armed=' + JSON.stringify(sa));
    check('§1b control flees at round 2 on the hopeless branch (the doorflee-b control shape)',
      sc.outcome === 'vFlee' && sc.rounds === 2 && sc.everHopeless === true && sc.fleeLines === 1, sc);
    check('§1b armed is identical to control under DOORFLEE2 (outcome/rounds/dealt equal, doorHold 0)',
      sa.outcome === sc.outcome && sa.rounds === sc.rounds && sa.mDealt === sc.mDealt && sa.doorHold === 0,
      { control: sc, armed: sa });
    check('§1b the old one-round guard WAS true at the flee (leader HP > incoming rate)',
      (function () {
        // Leader HP at the flee from the flee fraction (max 100),
        // cross-checked against entry HP minus damage taken.
        const vHpAtFlee = Math.round(aCtl.rec.fleeHpFrac * 100);
        const vHpCheck = 60 - (aCtl.rec.vTaken | 0);
        if (Math.abs(vHpAtFlee - vHpCheck) > 1) return false;
        const leaderRate = (aCtl.rec.vTaken | 0) / (aCtl.rec.rounds | 0);
        return vHpAtFlee > leaderRate;
      })(), { fleeHpFrac: aCtl.rec.fleeHpFrac, vTaken: aCtl.rec.vTaken, rounds: aCtl.rec.rounds });
    check('§1b the new whole-fight guard is FALSE at the flee (leader HP <= rate x rounds-to-kill)',
      (function () {
        const vHpAtFlee = Math.round(aCtl.rec.fleeHpFrac * 100);
        const leaderRate = (aCtl.rec.vTaken | 0) / (aCtl.rec.rounds | 0);
        const dealtPerRound = (aCtl.rec.mDealt | 0) / (aCtl.rec.rounds | 0);
        const monsterLeft = (aCtl.rec.mHpStart | 0) - (aCtl.rec.mDealt | 0);
        const rtk = monsterLeft / Math.max(1, dealtPerRound);
        return vHpAtFlee <= leaderRate * rtk;
      })(), { fleeHpFrac: aCtl.rec.fleeHpFrac, vTaken: aCtl.rec.vTaken, mDealt: aCtl.rec.mDealt, mHpStart: aCtl.rec.mHpStart, rounds: aCtl.rec.rounds });
  }

  // ---------- §2 INERT WITHOUT THE PIN (two no-pin loads) ----------
  delete process.env.PINQUAD;
  process.env.DMGPIN = '1';
  delete process.env.DOORFLEE2;
  const npC = await stageFight('algorithm', 60, true);
  check('§2 staging: no-pin control load stages (PINQUAD unset)', npC.ok, npC.why || npC);
  process.env.DOORFLEE2 = '1';
  const npA = await stageFight('algorithm', 60, true);
  check('§2 staging: no-pin armed load stages (DOORFLEE2=1, PINQUAD unset)', npA.ok, npA.why || npA);
  if (npC.ok && npA.ok) {
    check('§2 pinQuadParty writes nothing with PINQUAD unset (returns false on both loads)',
      npC.pinned === false && npA.pinned === false, { c: npC.pinned, a: npA.pinned });
    const sc = summarize(npC.rec), sa = summarize(npA.rec);
    console.log('  [§2] no-pin control=' + JSON.stringify(sc) + ' armed=' + JSON.stringify(sa));
    check('§2 DOORFLEE2 without the pin changes nothing (outcome/rounds/dealt equal exactly)',
      sa.outcome === sc.outcome && sa.rounds === sc.rounds && sa.mDealt === sc.mDealt, { noPinCtl: sc, noPinArmed: sa });
    check('§2 no hold without the pin (doorHold 0 both legs, no hold line)',
      sc.doorHold === 0 && sa.doorHold === 0 && sa.holdLines === 0, { noPinCtl: sc, noPinArmed: sa });
    check('§2 the no-pin loads deal undoubled damage (153 — DMGPIN needs the pin too)',
      sc.mDealt === 153 && sa.mDealt === 153, { noPinCtl: sc, noPinArmed: sa });
  }

  // ---------- §3 WAVE GATE (wave-1 gallowdeer, pin + DOORFLEE2 on) ----------
  process.env.PINQUAD = '1';
  process.env.DMGPIN = '1'; process.env.DOORFLEE2 = '1';
  const w1a = await stageFight('gallowdeer', 60, true);
  check('§3 staging: armed wave-1 load stages', w1a.ok, w1a.why || w1a);
  delete process.env.DOORFLEE2;
  const w1c = await stageFight('gallowdeer', 60, true);
  check('§3 staging: control wave-1 load stages', w1c.ok, w1c.why || w1c);
  if (w1a.ok && w1c.ok) {
    const sa = summarize(w1a.rec), sc = summarize(w1c.rec);
    console.log('  [§3] wave-1 armed=' + JSON.stringify(sa) + ' control=' + JSON.stringify(sc));
    check('§3 both wave-1 loads pin the quad', w1a.pinned === true && w1c.pinned === true, { a: w1a.pinned, c: w1c.pinned });
    check('§3 the wave-1 monster really is wave 1', (w1a.mdef.wave | 0) === 1, w1a.mdef.wave);
    check('§3 DOORFLEE2 holds nothing at wave 1 (doorHold 0 both legs, no hold line)',
      sa.doorHold === 0 && sc.doorHold === 0 && sa.holdLines === 0, { armed: sa, control: sc });
    check('§3 wave-1 outcome is identical with the lever on (no behavior change below wave 4)',
      sa.outcome === sc.outcome && sa.rounds === sc.rounds && sa.mDealt === sc.mDealt, { armed: sa, control: sc });
  }

  // ---------- §4 NOT A DOOR (allyFromStart false — shout ladder, not door) ----------
  process.env.PINQUAD = '1';
  process.env.DMGPIN = '1';
  delete process.env.DOORFLEE2;
  const ndC = await stageFight('algorithm', 60, false);
  check('§4 staging: control non-door load stages', ndC.ok, ndC.why || ndC);
  process.env.DOORFLEE2 = '1';
  const ndA = await stageFight('algorithm', 60, false);
  check('§4 staging: armed non-door load stages', ndA.ok, ndA.why || ndA);
  if (ndC.ok && ndA.ok) {
    const sc = summarize(ndC.rec), sa = summarize(ndA.rec);
    console.log('  [§4] non-door control=' + JSON.stringify(sc) + ' armed=' + JSON.stringify(sa));
    check('§4 both non-door loads pin the quad', ndC.pinned === true && ndA.pinned === true, { c: ndC.pinned, a: ndA.pinned });
    check('§4 DOORFLEE2 holds nothing off the door (doorHold 0 both legs, no hold line)',
      sa.doorHold === 0 && sc.doorHold === 0 && sa.holdLines === 0, { armed: sa, control: sc });
    check('§4 non-door outcome is identical with the lever on',
      sa.outcome === sc.outcome && sa.rounds === sc.rounds && sa.mDealt === sc.mDealt, { armed: sa, control: sc });
  }

  // ---------- §5 DRIVER SMOKE (armed leg, direct) ----------
  process.env.ALLYSLOT3 = '1'; process.env.PINQUAD = '1'; process.env.DMGPIN = '1'; process.env.DOORFLEE2 = '1';
  const smokeDir = 'perseed-doorflee2-b-smoke';
  const smokePath = path.join(REPO, 'evidence', '2026-11-21', smokeDir);
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1',
    FIGHTALLY2: '1', LAUNCHSURVIVE: '1', ALLYSLOT3: '1', PINQUAD: '1', DMGPIN: '1', DOORFLEE2: '1',
    MODE: 'pinquaddoor', DAYS: '30', EVIDENCE_DATE: '2026-11-21', CORPUS_PREFIX: 'doorflee2-b',
    SEEDS: '106251', RUN: 'doorflee2-b-smoke', OUTDIR: smokeDir });
  const r5 = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'pinquaddoor-driver-b.js')],
    { cwd: REPO, env: env, encoding: 'utf8', timeout: 600000 });
  check('§5 driver smoke (direct, armed): exit 0 on one 30d seed', r5.status === 0, (r5.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(smokePath, 'doorflee2-b-s106251-doorflee2-b-smoke-pinquaddoor.json'), 'utf8')); } catch (e) {}
  check('§5 driver smoke: corpus file written, doorflee2Flag 1 + dmgpinFlag 1 + pinquadFlag 1 + slotPresent true',
    !!dd && dd.doorflee2Flag === '1' && dd.dmgpinFlag === '1' && dd.pinquadFlag === '1' && dd.slotPresent === true,
    dd && { doorflee2Flag: dd.doorflee2Flag, dmgpinFlag: dd.dmgpinFlag, pinquadFlag: dd.pinquadFlag, slotPresent: dd.slotPresent });
  if (dd) {
    check('§5 driver smoke: 0 instrument errors', (dd.instrumentErrors || []).length === 0, dd.instrumentErrors);
    const rows = (dd.v4encounters || []);
    check('§5 driver smoke: every v4 row carries a numeric doorHold',
      rows.every(function (r) { return typeof r.doorHold === 'number'; }), { rows: rows.length });
  }
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}

  // ---------- §6 BASE GATES ----------
  const r6a = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'test-dmgpin-b.js')],
    { cwd: REPO, env: process.env, encoding: 'utf8', timeout: 600000 });
  check('§6 damage gate re-runs green (test-dmgpin-b.js 29/29)',
    r6a.status === 0 && /29 passed, 0 failed/.test(r6a.stdout || ''), (r6a.stdout || '').split('\n').slice(-2).join(' / '));
  const r6b = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'test-downedtwice-b.js')],
    { cwd: REPO, env: process.env, encoding: 'utf8', timeout: 600000 });
  check('§6 downedtwice regression re-runs green (test-downedtwice-b.js, exit 0)',
    r6b.status === 0, (r6b.stdout || '').split('\n').slice(-3).join(' / ') + ' / ' + (r6b.stderr || '').slice(0, 200));

  console.log('test-doorflee2-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(function (e) { console.error('test-doorflee2-b FATAL', e && e.stack || e); process.exit(1); });
