// test-hypofloor-b.js — proof test, arm sim-hypofloor-b (finding #2619:
// WHY A WINNING PINNED QUAD STILL FLEES AT DOORS — the P4 hopeless
// read imagines protection 4, so a geared leader's imagined health
// goes deeply negative and drags the whole quad's pooled survival
// below the kill horizon. The DOORFLEE2 hold (sim-doorflee2-b, pilot
// NO-GO on F1 only) re-reads the race on live numbers but only fires
// where the leader survives the whole remaining fight — and the P4
// read itself is never corrected. The HYPOFLOOR lever floors each
// fighter's hypothetical HP at 0 in the P4 pool, so one
// deeply-negative term stops dragging the pooled survival below the
// kill horizon — attacking the flee at its source (the misread)
// while the hold catches the fights that still read hopeless even
// floored. The pin gate (test-pinquaddoor-b.js 35/35) + damage gate
// (test-dmgpin-b.js 29/29) + staying gate (test-doorflee2-b.js 49/49)
// are the base gates; this test proves the HYPOFLOOR floor on the
// pinned + damage + hold base.
//
// WHAT IT PROVES (observable effect, not just assertions):
//   §1a CONVERSION, ARMED: the same staged geared quad vs the wave-4
//     eater, leader at 100 HP, staging seed 4, DMGPIN=1 + DOORFLEE2=1
//     on BOTH loads (the pilot's control leg is pin+damage+hold
//     without the floor) — control (HYPOFLOOR unset) holds once
//     (doorHold 1, "(Door hold)" line once) then flees at round 6 on
//     the hopeless branch (everHopeless, "sees how this ends", monster
//     at 135 HP, 12% left); armed (HYPOFLOOR=1) NEVER reads hopeless
//     (everHopeless false, doorHold 0 — the hold never even fires),
//     fights on to the round-7 KILL, leader alive at 3 HP, dealing
//     1156 vs the control's 1010. Round-1 strikes are identical (no
//     RNG drawn by the lever). The arithmetic is checked from the
//     control rec: unfloored pool rtd ~0.17 < rtk*0.85 ~0.68
//     (hopeless) while the floored pool rtd ~1.59 > 0.68 (winning).
//   §1b READ FIX WITHOUT RESCUE (wave-4 eater, leader 100, seed 3):
//     BOTH loads die at round 5 with identical damage (512) — but the
//     control reads hopeless and holds once (hold 1) while the armed
//     load never reads hopeless (hold 0). The floor changes the READ
//     even where it cannot change the outcome: it is a read fix, not
//     a survival buff, and a dying leader still dies.
//   §2 INERT WITHOUT THE PIN: two no-pin loads (HYPOFLOOR unset vs
//     HYPOFLOOR=1, DOORFLEE2=1 + DMGPIN=1 both) stage identically —
//     outcome, rounds and dealt equal exactly, doorHold 0, no hold
//     line. The floor is carried WITH the pin: without it, HYPOFLOOR
//     changes nothing (and DMGPIN does not double either — the no-pin
//     loads deal the undoubled 153, half the pinned control's 306).
//   §3 WAVE GATE: HYPOFLOOR=1 + PINQUAD=1 vs a wave-1 monster holds
//     nothing (doorHold 0, no hold line; outcome equals the wave-1
//     control) — the wave-1 duel balance is never touched.
//   §4 NOT A DOOR: HYPOFLOOR=1 on a pinned quad that did NOT enter at
//     the door (allyFromStart false — the trio joins through shouts)
//     changes nothing (outcome/rounds/dealt equal the §4 control
//     exactly, doorHold 0) — the floor is a DOOR floor, never a
//     shout-ladder floor.
//   §5 DRIVER SMOKE: the pinquaddoor driver runs one 30d armed seed
//     with HYPOFLOOR=1 + DOORFLEE2=1 + DMGPIN=1, exit 0, 0 instrument
//     errors, hypofloorFlag '1' + doorflee2Flag '1' + dmgpinFlag '1' +
//     pinquadFlag '1' on the corpus file, and every v4 row carries a
//     numeric doorHold.
//   §6 BASE GATES: test-dmgpin-b.js re-runs green (29/29) and
//     test-downedtwice-b.js re-runs green on this tip.
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged party
// is a geared wave-4 hunting party — hide_armor + hunting_spear,
// leader at 100 HP — never a fresh un-geared scholar. The eater is
// the proof case because its damage SPREADS onto allies in rounds
// 2–5 (ally P4 totals 66/70/61), so the party branch of the morale
// read actually engages and the floor can flip it — the algorithm
// focuses the leader for the first rounds (ally P4 0/0/0), so the
// party branch never engages and the floor is invisible there
// (probed: algorithm/eater/audit/strike/suburb/reunion/congregation/
// eulogy/herald at leader 60/80/100, seed 424242, all identical;
// the sweep over 8 staging seeds found the eater seed-4 conversion
// and the eater seed-3 read-fix among 5 differing of 150 cases —
// the other 3 are flee→death stretches, reported honestly in the
// evidence file, not hidden: the floor keeps a losing quad in the
// fight longer, and a leader at 3 HP can still die there).
// Usage: node scripts/test-hypofloor-b.js
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
  check('§0 fieldFights.js carries the HYPOFLOOR gate (HYPOFLOOR env + hypoFloorQuad + pinnedQuadAllies trio match)',
    /HYPOFLOOR/.test(ffSrc) && /hypoFloorQuad/.test(ffSrc) && /hypoFloorOn/.test(ffSrc) &&
    /allyVid === _hfPin\[0\] && ally2Vid === _hfPin\[1\] && ally3Vid === _hfPin\[2\]/.test(ffSrc));
  check('§0 the gate is wave-gated (>= 4), door-gated (allyFromStart) and env-gated OFF by default',
    /process\.env\.HYPOFLOOR === '1'/.test(ffSrc) && /opts\.allyFromStart/.test(ffSrc) &&
    /\(mdef\.wave \| 0\) >= 4/.test(ffSrc));
  check('§0 the leader hypothetical floors at 0, gated on hypoFloorQuad (if (hypoFloorQuad && vHpHypo < 0) vHpHypo = 0)',
    /if \(hypoFloorQuad && vHpHypo < 0\) vHpHypo = 0;/.test(ffSrc));
  check('§0 each ally term floors at 0 in the pool (three Math.max(0, allyEntryHp - rec.allyTakenP4) terms)',
    /Math\.max\(0, allyEntryHp - rec\.allyTakenP4\)/.test(ffSrc) &&
    /Math\.max\(0, ally2EntryHp - rec\.ally2TakenP4\)/.test(ffSrc) &&
    /Math\.max\(0, ally3EntryHp - rec\.ally3TakenP4\)/.test(ffSrc));
  check('§0 the floor draws no RNG (no RR() inside the HYPOFLOOR gate block or the pool floor lines)',
    (function () {
      const g = ffSrc.indexOf('// HYPOFLOOR (sim-hypofloor-b, finding #2619): floor each');
      const gEnd = ffSrc.indexOf('// ABILITY — TRIPWIRE', g);
      const gateBlock = ffSrc.slice(g, gEnd);
      const p = ffSrc.indexOf('// HYPOFLOOR (sim-hypofloor-b): a fighter cannot be');
      const pEnd = ffSrc.indexOf('winning = rtk <= rtd * 1.1;', p);
      const poolBlock = ffSrc.slice(p, pEnd);
      return gateBlock.indexOf('RR(') === -1 && poolBlock.indexOf('RR(') === -1;
    })());
  check('§0 off-mode is byte-identical by construction (every floor line is guarded by hypoFloorQuad, which needs HYPOFLOOR=1)',
    /hypoFloorQuad \? Math\.max\(0, allyEntryHp/.test(ffSrc) &&
    /hypoFloorQuad \? Math\.max\(0, ally2EntryHp/.test(ffSrc) &&
    /hypoFloorQuad \? Math\.max\(0, ally3EntryHp/.test(ffSrc));
})();

// ================= STAGING HELPERS (same as test-doorflee2-b.js, + seed) =================
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
// ladder instead. seed stages the monster + the fight RNG (default
// 424242, the doorflee2 staging seed). Caller sets the env (PINQUAD /
// DMGPIN / DOORFLEE2 / HYPOFLOOR) first.
async function stageFight(monsterId, leaderHp, door, seed) {
  const { Game } = await loadGame({ seed: (seed == null ? 424242 : seed), mode: 'pinquaddoor', fullTelemetry: false });
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
  process.env.LAUNCHSURVIVE = '1'; process.env.DMGPIN = '1'; process.env.DOORFLEE2 = '1';

  // ---------- §1a CONVERSION, ARMED vs CONTROL (wave-4 eater, leader 100, seed 4) ----------
  // DMGPIN=1 + DOORFLEE2=1 on BOTH loads: the control is pin+damage+hold
  // without the floor (the pilot's control leg), the armed adds
  // HYPOFLOOR=1 only.
  delete process.env.HYPOFLOOR;
  const eCtl = await stageFight('eater', 100, true, 4);
  check('§1a staging: control load stages (pinned quad vs eater, leader 100, seed 4)', eCtl.ok, eCtl.why || eCtl);
  process.env.HYPOFLOOR = '1';
  const eArm = await stageFight('eater', 100, true, 4);
  check('§1a staging: armed load stages (pinned quad vs eater, HYPOFLOOR=1)', eArm.ok, eArm.why || eArm);
  if (eCtl.ok && eArm.ok) {
    const sc = summarize(eCtl.rec), sa = summarize(eArm.rec);
    console.log('  [§1a] control=' + JSON.stringify(sc) + ' armed=' + JSON.stringify(sa));
    check('§1a both loads pin the quad (pinQuadParty true)', eCtl.pinned === true && eArm.pinned === true,
      { ctl: eCtl.pinned, armed: eArm.pinned });
    check('§1a both loads open at the door with all three allies (ally3Vid set)',
      !!eCtl.rec.ally3Vid && !!eArm.rec.ally3Vid, { ctl: eCtl.rec.ally3Vid, armed: eArm.rec.ally3Vid });
    check('§1a round-1 strikes are identical (the lever draws no RNG before the floor)',
      eq(round1Strikes(eCtl.rec), round1Strikes(eArm.rec)) && round1Strikes(eCtl.rec).length >= 1,
      { ctl: round1Strikes(eCtl.rec), armed: round1Strikes(eArm.rec) });
    check('§1a control flees at round 6 on the hopeless branch (vFlee, everHopeless, flee line, monster at 135 HP)',
      sc.outcome === 'vFlee' && sc.rounds === 6 && sc.everHopeless === true && sc.fleeLines === 1 && sc.mDealt === 1010, sc);
    check('§1a control held once first (doorHold 1, "(Door hold)" line exactly once) — the hold alone could not convert it',
      sc.doorHold === 1 && sc.holdLines === 1, sc);
    check('§1a armed never reads hopeless (everHopeless false, doorHold 0 — the hold never even fires)',
      sa.everHopeless === false && sa.doorHold === 0 && sa.holdLines === 0, sa);
    check('§1a armed fights on to the kill (vKill at round 7, not a later flee)',
      sa.outcome === 'vKill' && sa.rounds === 7, sa);
    check('§1a armed deals more (mDealt 1156 > 1010) — the extra round lands',
      sa.mDealt === 1156 && sa.mDealt > sc.mDealt, sa);
    check('§1a armed leader survives the whole fight (vHpLeft 3 > 0)',
      sa.vHpLeft === 3 && sa.vHpLeft > 0, sa);
    check('§1a the UNFLOORED pool reads hopeless at the flee (rtd ~0.17 < rtk*0.85 ~0.68, from the control rec)',
      (function () {
        const r = eCtl.rec;
        const poolRaw = (100 - (r.vTakenP4 | 0)) + (100 - (r.allyTakenP4 | 0)) + (100 - (r.ally2TakenP4 | 0)) + (100 - (r.ally3TakenP4 | 0));
        const rateP4 = ((r.vTakenP4 | 0) + (r.allyTakenP4 | 0) + (r.ally2TakenP4 | 0) + (r.ally3TakenP4 | 0)) / (r.rounds | 0);
        const rtdRaw = poolRaw / Math.max(1, rateP4);
        const rtk = ((r.mHpStart | 0) - (r.mDealt | 0)) / Math.max(1, (r.mDealt | 0) / (r.rounds | 0));
        return rtdRaw < rtk * 0.85;
      })(), { vTakenP4: eCtl.rec.vTakenP4, aP4: [eCtl.rec.allyTakenP4, eCtl.rec.ally2TakenP4, eCtl.rec.ally3TakenP4], mDealt: eCtl.rec.mDealt, mHpStart: eCtl.rec.mHpStart, rounds: eCtl.rec.rounds });
    check('§1a the FLOORED pool reads winning at the same flee (rtd ~1.59 > rtk*0.85 ~0.68, same control rec)',
      (function () {
        const r = eCtl.rec;
        const poolFloor = Math.max(0, 100 - (r.vTakenP4 | 0)) + Math.max(0, 100 - (r.allyTakenP4 | 0)) + Math.max(0, 100 - (r.ally2TakenP4 | 0)) + Math.max(0, 100 - (r.ally3TakenP4 | 0));
        const rateP4 = ((r.vTakenP4 | 0) + (r.allyTakenP4 | 0) + (r.ally2TakenP4 | 0) + (r.ally3TakenP4 | 0)) / (r.rounds | 0);
        const rtdFloor = poolFloor / Math.max(1, rateP4);
        const rtk = ((r.mHpStart | 0) - (r.mDealt | 0)) / Math.max(1, (r.mDealt | 0) / (r.rounds | 0));
        return rtdFloor > rtk * 0.85 && rtk <= rtdFloor * 1.1;
      })(), { vTakenP4: eCtl.rec.vTakenP4, aP4: [eCtl.rec.allyTakenP4, eCtl.rec.ally2TakenP4, eCtl.rec.ally3TakenP4], mDealt: eCtl.rec.mDealt, mHpStart: eCtl.rec.mHpStart, rounds: eCtl.rec.rounds });
  }

  // ---------- §1b READ FIX WITHOUT RESCUE (wave-4 eater, leader 100, seed 3) ----------
  // Same staging, different seed: both loads die at round 5 with
  // identical damage — the floor changes the READ (no hopeless, no
  // hold) but not the outcome. A dying leader still dies.
  delete process.env.HYPOFLOOR;
  const dCtl = await stageFight('eater', 100, true, 3);
  check('§1b staging: control load stages (pinned quad vs eater, leader 100, seed 3)', dCtl.ok, dCtl.why || dCtl);
  process.env.HYPOFLOOR = '1';
  const dArm = await stageFight('eater', 100, true, 3);
  check('§1b staging: armed load stages (pinned quad vs eater, HYPOFLOOR=1)', dArm.ok, dArm.why || dArm);
  if (dCtl.ok && dArm.ok) {
    const sc = summarize(dCtl.rec), sa = summarize(dArm.rec);
    console.log('  [§1b] control=' + JSON.stringify(sc) + ' armed=' + JSON.stringify(sa));
    check('§1b both loads die at round 5 with identical damage (vDie, R5, dealt 512, leader 0 HP)',
      sc.outcome === 'vDie' && sa.outcome === 'vDie' && sc.rounds === 5 && sa.rounds === 5 &&
      sc.mDealt === 512 && sa.mDealt === 512 && sc.vHpLeft === 0 && sa.vHpLeft === 0, { control: sc, armed: sa });
    check('§1b control reads hopeless and holds once (everHopeless true, doorHold 1)',
      sc.everHopeless === true && sc.doorHold === 1, sc);
    check('§1b armed never reads hopeless and never holds (everHopeless false, doorHold 0)',
      sa.everHopeless === false && sa.doorHold === 0, sa);
    check('§1b round-1 strikes are identical (the floor draws no RNG)',
      eq(round1Strikes(dCtl.rec), round1Strikes(dArm.rec)) && round1Strikes(dCtl.rec).length >= 1,
      { ctl: round1Strikes(dCtl.rec), armed: round1Strikes(dArm.rec) });
  }

  // ---------- §2 INERT WITHOUT THE PIN (two no-pin loads) ----------
  delete process.env.PINQUAD;
  process.env.DMGPIN = '1'; process.env.DOORFLEE2 = '1';
  delete process.env.HYPOFLOOR;
  const npC = await stageFight('algorithm', 60, true);
  check('§2 staging: no-pin control load stages (PINQUAD unset)', npC.ok, npC.why || npC);
  process.env.HYPOFLOOR = '1';
  const npA = await stageFight('algorithm', 60, true);
  check('§2 staging: no-pin armed load stages (HYPOFLOOR=1, PINQUAD unset)', npA.ok, npA.why || npA);
  if (npC.ok && npA.ok) {
    check('§2 pinQuadParty writes nothing with PINQUAD unset (returns false on both loads)',
      npC.pinned === false && npA.pinned === false, { c: npC.pinned, a: npA.pinned });
    const sc = summarize(npC.rec), sa = summarize(npA.rec);
    console.log('  [§2] no-pin control=' + JSON.stringify(sc) + ' armed=' + JSON.stringify(sa));
    check('§2 HYPOFLOOR without the pin changes nothing (outcome/rounds/dealt equal exactly)',
      sa.outcome === sc.outcome && sa.rounds === sc.rounds && sa.mDealt === sc.mDealt, { noPinCtl: sc, noPinArmed: sa });
    check('§2 no hold without the pin (doorHold 0 both legs, no hold line)',
      sc.doorHold === 0 && sa.doorHold === 0 && sa.holdLines === 0, { noPinCtl: sc, noPinArmed: sa });
    check('§2 the no-pin loads deal undoubled damage (153 — DMGPIN needs the pin too)',
      sc.mDealt === 153 && sa.mDealt === 153, { noPinCtl: sc, noPinArmed: sa });
  }

  // ---------- §3 WAVE GATE (wave-1 gallowdeer, pin + HYPOFLOOR on) ----------
  process.env.PINQUAD = '1';
  process.env.DMGPIN = '1'; process.env.DOORFLEE2 = '1';
  process.env.HYPOFLOOR = '1';
  const w1a = await stageFight('gallowdeer', 60, true);
  check('§3 staging: armed wave-1 load stages', w1a.ok, w1a.why || w1a);
  delete process.env.HYPOFLOOR;
  const w1c = await stageFight('gallowdeer', 60, true);
  check('§3 staging: control wave-1 load stages', w1c.ok, w1c.why || w1c);
  if (w1a.ok && w1c.ok) {
    const sa = summarize(w1a.rec), sc = summarize(w1c.rec);
    console.log('  [§3] wave-1 armed=' + JSON.stringify(sa) + ' control=' + JSON.stringify(sc));
    check('§3 both wave-1 loads pin the quad', w1a.pinned === true && w1c.pinned === true, { a: w1a.pinned, c: w1c.pinned });
    check('§3 the wave-1 monster really is wave 1', (w1a.mdef.wave | 0) === 1, w1a.mdef.wave);
    check('§3 HYPOFLOOR holds nothing at wave 1 (doorHold 0 both legs, no hold line)',
      sa.doorHold === 0 && sc.doorHold === 0 && sa.holdLines === 0, { armed: sa, control: sc });
    check('§3 wave-1 outcome is identical with the lever on (no behavior change below wave 4)',
      sa.outcome === sc.outcome && sa.rounds === sc.rounds && sa.mDealt === sc.mDealt, { armed: sa, control: sc });
  }

  // ---------- §4 NOT A DOOR (allyFromStart false — shout ladder, not door) ----------
  process.env.PINQUAD = '1';
  process.env.DMGPIN = '1'; process.env.DOORFLEE2 = '1';
  delete process.env.HYPOFLOOR;
  const ndC = await stageFight('algorithm', 60, false);
  check('§4 staging: control non-door load stages', ndC.ok, ndC.why || ndC);
  process.env.HYPOFLOOR = '1';
  const ndA = await stageFight('algorithm', 60, false);
  check('§4 staging: armed non-door load stages', ndA.ok, ndA.why || ndA);
  if (ndC.ok && ndA.ok) {
    const sc = summarize(ndC.rec), sa = summarize(ndA.rec);
    console.log('  [§4] non-door control=' + JSON.stringify(sc) + ' armed=' + JSON.stringify(sa));
    check('§4 both non-door loads pin the quad', ndC.pinned === true && ndA.pinned === true, { c: ndC.pinned, a: ndA.pinned });
    check('§4 HYPOFLOOR holds nothing off the door (doorHold 0 both legs, no hold line)',
      sa.doorHold === 0 && sc.doorHold === 0 && sa.holdLines === 0, { armed: sa, control: sc });
    check('§4 non-door outcome is identical with the lever on',
      sa.outcome === sc.outcome && sa.rounds === sc.rounds && sa.mDealt === sc.mDealt, { armed: sa, control: sc });
  }

  // ---------- §5 DRIVER SMOKE (armed leg, direct) ----------
  process.env.ALLYSLOT3 = '1'; process.env.PINQUAD = '1'; process.env.DMGPIN = '1'; process.env.DOORFLEE2 = '1'; process.env.HYPOFLOOR = '1';
  const smokeDir = 'perseed-hypofloor-b-smoke';
  const smokePath = path.join(REPO, 'evidence', '2026-11-22', smokeDir);
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1',
    FIGHTALLY2: '1', LAUNCHSURVIVE: '1', ALLYSLOT3: '1', PINQUAD: '1', DMGPIN: '1', DOORFLEE2: '1', HYPOFLOOR: '1',
    MODE: 'pinquaddoor', DAYS: '30', EVIDENCE_DATE: '2026-11-22', CORPUS_PREFIX: 'hypofloor-b',
    SEEDS: '106251', RUN: 'hypofloor-b-smoke', OUTDIR: smokeDir });
  const r5 = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'pinquaddoor-driver-b.js')],
    { cwd: REPO, env: env, encoding: 'utf8', timeout: 600000 });
  check('§5 driver smoke (direct, armed): exit 0 on one 30d seed', r5.status === 0, (r5.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(smokePath, 'hypofloor-b-s106251-hypofloor-b-smoke-pinquaddoor.json'), 'utf8')); } catch (e) {}
  check('§5 driver smoke: corpus file written, hypofloorFlag 1 + doorflee2Flag 1 + dmgpinFlag 1 + pinquadFlag 1 + slotPresent true',
    !!dd && dd.hypofloorFlag === '1' && dd.doorflee2Flag === '1' && dd.dmgpinFlag === '1' && dd.pinquadFlag === '1' && dd.slotPresent === true,
    dd && { hypofloorFlag: dd.hypofloorFlag, doorflee2Flag: dd.doorflee2Flag, dmgpinFlag: dd.dmgpinFlag, pinquadFlag: dd.pinquadFlag, slotPresent: dd.slotPresent });
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

  console.log('test-hypofloor-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(function (e) { console.error('test-hypofloor-b FATAL', e && e.stack || e); process.exit(1); });
