// test-fleeguard-b.js — proof test, arm sim-fleeguard-b (finding #2602:
// WHY A WINNING PARTY STILL FLEES AT WILD FIGHTS — the P4 hopeless
// read imagines protection 4, so a geared leader's imagined health
// goes deeply negative and a party that is winning on live numbers
// reads as hopeless and runs. The FLEEGUARD hold generalizes the
// DOORFLEE2 door hold to every wild wave-4+ fight: when the P4 read
// says hopeless, re-read the SAME race on live numbers (live party
// HP vs live taken rate, 1.1 margin) with the LEADER-SURVIVAL-ONLY
// guard (the leader must survive the WHOLE remaining fight:
// vHp > leaderRate * rtk). The bravery floor is untouched.
//
// WHAT IT PROVES (observable effect, not just assertions):
//   §1a STAYING, ARMED: the same staged geared pinned quad vs the
//     wave-4 herald, leader at 60 HP, same seed, same staging,
//     DMGPIN=1 + PINQUAD=1 on BOTH loads (the doorflee2 §1a case,
//     with FLEEGUARD the only difference) — control (FLEEGUARD
//     unset) flees at round 2 on the hopeless branch (everHopeless,
//     "sees how this ends", 306 dealt); armed (FLEEGUARD=1) holds
//     (fleeguardHold 2, "(Live-numbers guard)" line once), fights
//     on to the round-6 KILL, leader alive at 21 HP, dealing 780
//     vs the control's 306. Round-1 strikes are identical (no RNG
//     drawn by the lever). The guard reproduces the DOORFLEE2
//     numbers exactly on the same case — same live-race arithmetic.
//   §1b WILD STAYING: the same staged geared trio vs the wave-4
//     herald, leader at 100 HP, NOT at the door (shout ladder, no
//     pin, no DMGPIN — the corpus shape) — control flees at round 9
//     (489 dealt); armed holds 4 times, fights to round 10 (543
//     dealt) and STILL flees at 27 HP: the guard fires on wild
//     fights and releases when the live race turns. The hold is a
//     re-read, not a veto.
//   §1c TIGHTENING, ARMED: the same staged trio vs the wave-4
//     herald (leader 60, door, no pin/DMGPIN) and vs the wave-4
//     algorithm (leader 60, shout ladder) — the cases the old
//     one-round guard would have held. Under FLEEGUARD the armed
//     load is IDENTICAL to the control (flee round 2, fleeguardHold
//     0): the leader cannot survive the whole remaining fight, so
//     the new guard releases. The arithmetic is checked from the
//     control rec. The algorithm case also documents the floor
//     branch carrying fleeHopeless=true (prereg CORRECTION: the
//     variant cross-check is one-directional).
//   §2 FLOOR UNTOUCHED: the fleecall §1 staged solo eulogy (trick
//     known, rng 19) flees on the bravery floor at 0.41 HP —
//     FLEEGUARD=1 is byte-identical to unset (fleeHpFrac 0.41,
//     vTaken 59, rounds 3, fleeguardHold 0). The guard never
//     touches "past holding".
//   §3 WAVE GATE: FLEEGUARD=1 + PINQUAD=1 vs a wave-1 gallowdeer
//     holds nothing (fleeguardHold 0, outcome/rounds/dealt equal
//     the control exactly) — wave 1–3 balance is never touched.
//   §4 OFF-MODE DETERMINISM: the same staged wild fight with
//     FLEEGUARD unset, run twice, reproduces the record exactly.
//   §5 DRIVER SMOKE: the fleeguard driver runs one 30d armed seed
//     with FLEEGUARD=1, exit 0, 0 instrument errors,
//     fleeguardOn true + fleeguardPresent true on the corpus file,
//     and every v4 row carries a numeric fleeguardHold + vTakenP4 +
//     vHpHypoLeft.
//   §6 BASE GATES: test-fleecall-b.js re-runs green (the DIAG the
//     guard answers) and test-doorflee2-b.js re-runs green (the
//     same morale block).
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged party
// is a geared wave-4 hunting party — hide_armor + hunting_spear,
// leader at 60/100 HP — never a fresh un-geared scholar.
// Usage: node scripts/test-fleeguard-b.js
// Exit 0 = all checks pass.
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, mulberry32 } = require(path.join(REPO, 'scripts', 'sim-harness'));

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
  check('§0 fieldFights.js carries the FLEEGUARD gate (FLEEGUARD env + fleeguardOn + live-numbers hold)',
    /FLEEGUARD/.test(ffSrc) && /fleeguardOn/.test(ffSrc) && /fleeguardHold/.test(ffSrc) &&
    /Live-numbers guard/.test(ffSrc));
  check('§0 the gate is wave-gated (>= 4) and env-gated OFF by default',
    /process\.env\.FLEEGUARD === '1'/.test(ffSrc) && /\(mdef\.wave \| 0\) >= 4/.test(ffSrc));
  check('§0 the hold re-reads the race on live numbers (live party HP vs live taken rate, 1.1 margin)',
    /_fgLive/.test(ffSrc) && /_fgTakenRate/.test(ffSrc) && /_fgRtk <= _fgRtd \* 1\.1/.test(ffSrc));
  check('§0 the hold fires only on a P4-hopeless round (hopeless in the gate) and counts it (fleeguardHold)',
    /fleeguardOn && !opts\.noFlee && rec\.intent !== 'learn' && hopeless && round >= 2/.test(ffSrc) &&
    /rec\.fleeguardHold = \(rec\.fleeguardHold \| 0\) \+ 1/.test(ffSrc));
  check('§0 the LEADER-SURVIVAL-ONLY guard is in the hold (vHp > leaderRate * rounds-to-kill)',
    /_fgLeaderRate/.test(ffSrc) && /vHp > _fgLeaderRate \* _fgRtk/.test(ffSrc));
  check('§0 the hold narrates once per fight (fleeguardHoldLogged + "(Live-numbers guard)" line)',
    /rec\.fleeguardHoldLogged/.test(ffSrc) && /holds — the numbers they can see say this fight is theirs/.test(ffSrc));
  check('§0 the hold draws no RNG (no RR() inside the FLEEGUARD hold block)',
    (function () {
      // Slice from the hold block itself (not the first FLEEGUARD
      // comment — the setup comment is far above the hold).
      const i = ffSrc.indexOf('if (fleeguardOn && !opts.noFlee');
      const j = ffSrc.indexOf('// LEARN-VS-FIGHT', i);
      const block = ffSrc.slice(i, j);
      return block.indexOf('RR()') === -1 && block.indexOf('RR(') === -1;
    })());
  check('§0 learn-first is untouched (intent learn in the hold gate)',
    /fleeguardOn && !opts\.noFlee && rec\.intent !== 'learn'/.test(ffSrc));
  check('§0 the hold sits after the DOORFLEE2 block and does not replace it (doorHold still counted)',
    ffSrc.indexOf('rec.fleeguardHold') > ffSrc.indexOf('rec.doorHold = (rec.doorHold | 0) + 1') &&
    /rec\.doorHold = \(rec\.doorHold \| 0\) \+ 1/.test(ffSrc));
})();

// ================= STAGING HELPERS (same as test-doorflee2-b.js) =================
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
// Stage one geared trio vs one monster and fight it.
// leaderHp sets the holder's health (allies 100). door=true passes
// allyFromStart; door=false lets the trio join through the shout
// ladder instead. Caller sets the env (PINQUAD / DMGPIN / FLEEGUARD) first.
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
    fleeguardHold: (rec.fleeguardHold | 0), doorHold: (rec.doorHold | 0),
    holdLines: countLine(rec, /Live-numbers guard/),
    fleeLines: countLine(rec, /sees how this ends/),
    fleeHpFrac: (rec.fleeHpFrac == null ? null : +rec.fleeHpFrac.toFixed(2)),
    fleeHopeless: !!rec.fleeHopeless,
  };
}

(async () => {
  process.env.SENSEEXPED = '1'; process.env.PARTYSIZE4 = '1'; process.env.VETREENGAGE = '1';
  process.env.FIGHTALLY2 = '1'; process.env.FLEEREPAIR2 = '1';
  // ALLYSLOT3 is set per-section, not here: the pinned-door sections
  // (§1a, §3) run it (doorflee2 env), the wild sections (§1b, §1c,
  // §4) run WITHOUT it — the corpus substrate has no third shout
  // slot, and the §1b/§1c numbers below were measured on that
  // substrate.

  // ---------- §1a STAYING, ARMED vs CONTROL (door + pin + DMGPIN, herald, leader 60) ----------
  // DMGPIN=1 + PINQUAD=1 on BOTH loads: the control is pin+damage
  // without the hold (the doorflee2 §1a case), the armed adds
  // FLEEGUARD=1 only.
  process.env.ALLYSLOT3 = '1';
  process.env.PINQUAD = '1'; process.env.DMGPIN = '1';
  delete process.env.FLEEGUARD; delete process.env.DOORFLEE2;
  const hCtl = await stageFight('herald', 60, true);
  check('§1a staging: control load stages (pinned quad vs herald, leader 60)', hCtl.ok, hCtl.why || hCtl);
  process.env.FLEEGUARD = '1';
  const hArm = await stageFight('herald', 60, true);
  check('§1a staging: armed load stages (pinned quad vs herald, FLEEGUARD=1)', hArm.ok, hArm.why || hArm);
  if (hCtl.ok && hArm.ok) {
    const sc = summarize(hCtl.rec), sa = summarize(hArm.rec);
    console.log('  [§1a] control=' + JSON.stringify(sc) + ' armed=' + JSON.stringify(sa));
    check('§1a both loads pin the quad (pinQuadParty true)', hCtl.pinned === true && hArm.pinned === true,
      { ctl: hCtl.pinned, armed: hArm.pinned });
    check('§1a round-1 strikes are identical (the lever draws no RNG before the hold)',
      eq(round1Strikes(hCtl.rec), round1Strikes(hArm.rec)) && eq(round1Strikes(hCtl.rec), [16, 46, 40, 48]),
      { ctl: round1Strikes(hCtl.rec), armed: round1Strikes(hArm.rec) });
    check('§1a control flees at round 2 on the hopeless branch (vFlee, everHopeless, flee line, 306 dealt)',
      sc.outcome === 'vFlee' && sc.rounds === 2 && sc.everHopeless === true && sc.fleeLines === 1 && sc.mDealt === 306, sc);
    check('§1a armed holds (fleeguardHold 2, "(Live-numbers guard)" line exactly once)',
      sa.fleeguardHold === 2 && sa.holdLines === 1, sa);
    check('§1a armed fights on to the kill (vKill at round 6, not a later flee)',
      sa.outcome === 'vKill' && sa.rounds === 6, sa);
    check('§1a armed deals more (mDealt 780 > 306) — the held rounds land',
      sa.mDealt === 780 && sa.mDealt > sc.mDealt, sa);
    check('§1a armed leader survives the whole fight (vHpLeft 21 > 0)',
      sa.vHpLeft === 21 && sa.vHpLeft > 0, sa);
    check('§1a the guard reproduces the DOORFLEE2 numbers exactly on the same case (780 / round 6 / 21 HP)',
      sa.mDealt === 780 && sa.rounds === 6 && sa.vHpLeft === 21, sa);
  }

  // ---------- §1b WILD STAYING (herald, leader 100, trio at the door, NO pin/DMGPIN) ----------
  delete process.env.ALLYSLOT3;
  delete process.env.PINQUAD; delete process.env.DMGPIN;
  delete process.env.FLEEGUARD;
  const wCtl = await stageFight('herald', 100, true);
  check('§1b staging: wild control load stages (trio vs herald, leader 100)', wCtl.ok, wCtl.why || wCtl);
  process.env.FLEEGUARD = '1';
  const wArm = await stageFight('herald', 100, true);
  check('§1b staging: wild armed load stages (trio vs herald, FLEEGUARD=1)', wArm.ok, wArm.why || wArm);
  if (wCtl.ok && wArm.ok) {
    const sc = summarize(wCtl.rec), sa = summarize(wArm.rec);
    console.log('  [§1b] wild control=' + JSON.stringify(sc) + ' armed=' + JSON.stringify(sa));
    check('§1b control flees at round 9 on the hopeless branch (489 dealt)',
      sc.outcome === 'vFlee' && sc.rounds === 9 && sc.everHopeless === true && sc.mDealt === 489, sc);
    check('§1b armed holds on wild fights (fleeguardHold 4, guard line once)',
      sa.fleeguardHold === 4 && sa.holdLines === 1, sa);
    check('§1b armed fights a round longer and deals more (round 10, 543 > 489)',
      sa.rounds === 10 && sa.mDealt === 543 && sa.mDealt > sc.mDealt, sa);
    check('§1b armed still flees when the live race turns (vFlee at 27 HP — a re-read, not a veto)',
      sa.outcome === 'vFlee' && sa.fleeHpFrac === 0.27, sa);
  }

  // ---------- §1c TIGHTENING (herald 60 door + algorithm 60 shout-ladder, no pin/DMGPIN) ----------
  delete process.env.PINQUAD; delete process.env.DMGPIN;
  delete process.env.FLEEGUARD;
  const tCtl = await stageFight('herald', 60, true);
  check('§1c staging: tightening control stages (trio vs herald, leader 60)', tCtl.ok, tCtl.why || tCtl);
  process.env.FLEEGUARD = '1';
  const tArm = await stageFight('herald', 60, true);
  check('§1c staging: tightening armed stages (trio vs herald, FLEEGUARD=1)', tArm.ok, tArm.why || tArm);
  if (tCtl.ok && tArm.ok) {
    const sc = summarize(tCtl.rec), sa = summarize(tArm.rec);
    console.log('  [§1c] herald60 control=' + JSON.stringify(sc) + ' armed=' + JSON.stringify(sa));
    check('§1c control flees at round 2 on the hopeless branch (107 dealt, 38 HP left)',
      sc.outcome === 'vFlee' && sc.rounds === 2 && sc.everHopeless === true && sc.mDealt === 107, sc);
    check('§1c armed is identical to control under FLEEGUARD (outcome/rounds/dealt equal, fleeguardHold 0)',
      sa.outcome === sc.outcome && sa.rounds === sc.rounds && sa.mDealt === sc.mDealt && sa.fleeguardHold === 0,
      { control: sc, armed: sa });
    check('§1c the leader-survival guard is FALSE at the flee (38 HP <= 11/round x 12.5 rounds to kill)',
      (function () {
        const vHpAtFlee = Math.round(tCtl.rec.fleeHpFrac * 100);
        const leaderRate = (tCtl.rec.vTaken | 0) / (tCtl.rec.rounds | 0);
        const dealtPerRound = (tCtl.rec.mDealt | 0) / (tCtl.rec.rounds | 0);
        const monsterLeft = (tCtl.rec.mHpStart | 0) - (tCtl.rec.mDealt | 0);
        const rtk = monsterLeft / Math.max(1, dealtPerRound);
        return vHpAtFlee <= leaderRate * rtk;
      })(), { fleeHpFrac: tCtl.rec.fleeHpFrac, vTaken: tCtl.rec.vTaken, mDealt: tCtl.rec.mDealt, mHpStart: tCtl.rec.mHpStart, rounds: tCtl.rec.rounds });
  }
  delete process.env.FLEEGUARD;
  const aCtl = await stageFight('algorithm', 60, false);
  check('§1c staging: algorithm control stages (shout ladder vs algorithm, leader 60)', aCtl.ok, aCtl.why || aCtl);
  process.env.FLEEGUARD = '1';
  const aArm = await stageFight('algorithm', 60, false);
  check('§1c staging: algorithm armed stages (shout ladder vs algorithm, FLEEGUARD=1)', aArm.ok, aArm.why || aArm);
  if (aCtl.ok && aArm.ok) {
    const sc = summarize(aCtl.rec), sa = summarize(aArm.rec);
    console.log('  [§1c] algorithm60 control=' + JSON.stringify(sc) + ' armed=' + JSON.stringify(sa));
    check('§1c algorithm control flees at round 2 (17 dealt, 20 HP left, fleeguardHold 0)',
      sc.outcome === 'vFlee' && sc.rounds === 2 && sc.mDealt === 17 && sc.fleeguardHold === 0, sc);
    check('§1c algorithm armed is identical to control (outcome/rounds/dealt equal, fleeguardHold 0)',
      sa.outcome === sc.outcome && sa.rounds === sc.rounds && sa.mDealt === sc.mDealt && sa.fleeguardHold === 0,
      { control: sc, armed: sa });
    check('§1c the algorithm flee is a FLOOR flee carrying fleeHopeless=true (prereg CORRECTION: cross-check is one-directional)',
      sc.fleeLines === 0 && sc.fleeHopeless === true && aCtl.rec.log[aCtl.rec.log.length - 1].indexOf('past holding') !== -1,
      { fleeLines: sc.fleeLines, fleeHopeless: sc.fleeHopeless, terminal: aCtl.rec.log[aCtl.rec.log.length - 1] });
  }

  // ---------- §2 FLOOR UNTOUCHED (fleecall §1 staged solo eulogy, trick known, rng 19) ----------
  async function floorFight() {
    const { Game } = await loadGame({ seed: 7, mode: 'test' });
    await setupGame(Game);
    const mdef = (Game.data.monsters || []).find(function (m) { return m.id === 'eulogy'; });
    const roster = (Game.state.village.roster || []).filter(function (id) { return id !== Game.villagerId; });
    const vid = roster[0];
    Game.state.villagerTricks = Game.state.villagerTricks || {};
    Game.state.villagerTricks.eulogy = true;
    ((Game.state.village.health = Game.state.village.health || {}))[vid] = 100;
    return Game.fieldFight(vid, mdef, null, { awareness: false, rng: mulberry32(19) });
  }
  delete process.env.FLEEGUARD;
  const fCtl = await floorFight();
  process.env.FLEEGUARD = '1';
  const fArm = await floorFight();
  console.log('  [§2] floor control=' + JSON.stringify(summarize(fCtl)) + ' armed=' + JSON.stringify(summarize(fArm)));
  check('§2 floor flee is identical with the lever on (fleeHpFrac 0.41, vTaken 59, rounds 3, fleeguardHold 0)',
    fCtl.outcome === 'vFlee' && fArm.outcome === 'vFlee' &&
    fCtl.fleeHpFrac === 0.41 && fArm.fleeHpFrac === 0.41 &&
    fCtl.vTaken === 59 && fArm.vTaken === 59 &&
    fCtl.rounds === 3 && fArm.rounds === 3 &&
    (fCtl.fleeguardHold | 0) === 0 && (fArm.fleeguardHold | 0) === 0,
    { ctl: summarize(fCtl), armed: summarize(fArm) });
  check('§2 the floor flee is a floor flee on both legs (terminal "past holding", fleeHopeless false)',
    fCtl.log[fCtl.log.length - 1].indexOf('past holding') !== -1 &&
    fArm.log[fArm.log.length - 1].indexOf('past holding') !== -1 &&
    fCtl.fleeHopeless === false && fArm.fleeHopeless === false,
    { ctlTerminal: fCtl.log[fCtl.log.length - 1], armTerminal: fArm.log[fArm.log.length - 1] });

  // ---------- §3 WAVE GATE (wave-1 gallowdeer, pin + FLEEGUARD on) ----------
  process.env.ALLYSLOT3 = '1';
  process.env.PINQUAD = '1'; process.env.DMGPIN = '1';
  delete process.env.FLEEGUARD;
  const w1c = await stageFight('gallowdeer', 60, true);
  check('§3 staging: control wave-1 load stages', w1c.ok, w1c.why || w1c);
  process.env.FLEEGUARD = '1';
  const w1a = await stageFight('gallowdeer', 60, true);
  check('§3 staging: armed wave-1 load stages', w1a.ok, w1a.why || w1a);
  if (w1a.ok && w1c.ok) {
    const sa = summarize(w1a.rec), sc = summarize(w1c.rec);
    console.log('  [§3] wave-1 armed=' + JSON.stringify(sa) + ' control=' + JSON.stringify(sc));
    check('§3 the wave-1 monster really is wave 1', (w1a.mdef.wave | 0) === 1, w1a.mdef.wave);
    check('§3 FLEEGUARD holds nothing at wave 1 (fleeguardHold 0 both legs, no guard line)',
      sa.fleeguardHold === 0 && sc.fleeguardHold === 0 && sa.holdLines === 0, { armed: sa, control: sc });
    check('§3 wave-1 outcome is identical with the lever on (vKill round 2, 158 dealt)',
      sa.outcome === sc.outcome && sa.rounds === sc.rounds && sa.mDealt === sc.mDealt &&
      sa.outcome === 'vKill' && sa.rounds === 2 && sa.mDealt === 158, { armed: sa, control: sc });
  }

  // ---------- §4 OFF-MODE DETERMINISM ----------
  delete process.env.ALLYSLOT3;
  delete process.env.PINQUAD; delete process.env.DMGPIN; delete process.env.FLEEGUARD;
  const d1 = await stageFight('herald', 100, false);
  const d2 = await stageFight('herald', 100, false);
  check('§4 staging: determinism loads stage', d1.ok && d2.ok, (d1.why || d2.why || ''));
  if (d1.ok && d2.ok) {
    check('§4 same staged fight with FLEEGUARD unset reproduces the record exactly (determinism)',
      JSON.stringify(d1.rec) === JSON.stringify(d2.rec),
      { a: summarize(d1.rec), b: summarize(d2.rec) });
  }

  // ---------- §5 DRIVER SMOKE (armed leg, direct) ----------
  process.env.FLEEGUARD = '1';
  const smokeDir = 'perseed-fleeguard-b-smoke';
  const smokePath = path.join(REPO, 'evidence', '2026-11-24', smokeDir);
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1',
    FIGHTALLY2: '1', FLEEGUARD: '1',
    MODE: 'arm', DAYS: '30',
    SEEDS: '109501', RUN: 'fleeguard-b-smoke', OUTDIR: smokeDir });
  const r5 = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'fleeguard-driver-b.js')],
    { cwd: REPO, env: env, encoding: 'utf8', timeout: 600000 });
  check('§5 driver smoke (direct, armed): exit 0 on one 30d seed', r5.status === 0, (r5.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(smokePath, 'fleeguard-b-s109501-fleeguard-b-smoke-arm.json'), 'utf8')); } catch (e) {}
  check('§5 driver smoke: corpus file written, fleeguardOn true + fleeguardPresent true + mode arm',
    !!dd && dd.fleeguardOn === true && dd.fleeguardPresent === true && dd.mode === 'arm',
    dd && { fleeguardOn: dd.fleeguardOn, fleeguardPresent: dd.fleeguardPresent, mode: dd.mode });
  if (dd) {
    check('§5 driver smoke: 0 instrument errors', (dd.instrumentErrors || []).length === 0, dd.instrumentErrors);
    const rows = (dd.v4encounters || []);
    check('§5 driver smoke: every v4 row carries a numeric fleeguardHold + vTakenP4 + vHpHypoLeft',
      rows.every(function (r) { return typeof r.fleeguardHold === 'number' && (typeof r.vTakenP4 === 'number' || r.vTakenP4 === null) && (typeof r.vHpHypoLeft === 'number' || r.vHpHypoLeft === null); }),
      { rows: rows.length });
  }
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}

  // ---------- §6 BASE GATES ----------
  // Clean env: the base gates must run exactly as they run
  // standalone — no FLEEGUARD (or pin/damage/door flag) leaking in
  // from the sections above.
  delete process.env.FLEEGUARD; delete process.env.PINQUAD;
  delete process.env.DMGPIN; delete process.env.DOORFLEE2; delete process.env.ALLYSLOT3;
  const r6a = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'test-fleecall-b.js')],
    { cwd: REPO, env: process.env, encoding: 'utf8', timeout: 600000 });
  check('§6 fleecall base gate re-runs green (test-fleecall-b.js, exit 0)',
    r6a.status === 0, (r6a.stdout || '').split('\n').slice(-2).join(' / ') + ' / ' + (r6a.stderr || '').slice(0, 200));
  const r6b = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'test-doorflee2-b.js')],
    { cwd: REPO, env: process.env, encoding: 'utf8', timeout: 900000 });
  check('§6 doorflee2 base gate re-runs green (test-doorflee2-b.js, exit 0)',
    r6b.status === 0, (r6b.stdout || '').split('\n').slice(-3).join(' / ') + ' / ' + (r6b.stderr || '').slice(0, 200));

  console.log('test-fleeguard-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(function (e) { console.error('test-fleeguard-b FATAL', e && e.stack || e); process.exit(1); });
