// test-fleefloor-a.js — proof test, arm sim-fleefloor-a (finding #2602:
// THE FLOOR FLEE ENDS FIGHTS THE PARTY WOULD WIN NEXT ROUND. The
// bravery floor ("past holding") fires on the leader's live HP alone
// and never looks at the monster's remaining HP — the telling case
// fled with the monster at 58 HP, one godslayer strike from death.
// FLOORFINISH=1 adds the "finish the kill" override: when the lead
// monster is within one round of the party's live damage rate
// (lead-monster HP <= rec.mDealt / round), the floor does not fire —
// the party holds for the killing strike(s).
//
// WHAT IT PROVES (observable effect, not just assertions):
//   §1 STAYING, ARMED: staged geared parties vs a low-HP herald
//     variant (mechanism fixture — see below) where the control
//     (FLOORFINISH unset) flees on the floor branch with the monster
//     within one round of live party damage — armed (FLOORFINISH=1)
//     holds (floorFinishHold >= 1, "(Finish the kill)" line exactly
//     once), fights on, and kills. Round-1 strikes identical (no RNG
//     drawn by the lever). The same fixture's floor-far seed
//     (monster more than one round away) is armed == control.
//   §2 OFF-MODE BYTE-IDENTICAL: the same staged fights with
//     FLOORFINISH unset reproduce the pre-change record exactly
//     (outcome, rounds, mDealt, vTaken, vHpLeft, mHpLeft, dpr,
//     fleeHpFrac, log hash + line count) — frozen expected values
//     captured from unmodified code before the edit (stash capture,
//     pre-change vs changed-off outputs identical — see evidence).
//   §3 HOPELESS + FAR UNTOUCHED: on staged hopeless-branch flees
//     (real herald) and floor-far flees, armed == control exactly —
//     the override never touches the hopeless read or a monster more
//     than one round away, and never fires when the party dealt
//     nothing (the _ffDpr > 0 guard, static §0 + far-case behavior).
//   §4 DRIVER SMOKE: the fleefloor driver runs one 30d armed seed
//     in-process, 0 instrument errors, floorFinishOn true +
//     floorFinishPresent true on the corpus object, and every v4 row
//     carries a numeric floorFinishHold.
//   §5 BASE GATES: test-fleeguard-b.js re-runs green (the guard this
//     arm does not touch) and test-fleecall-b.js re-runs green (the
//     DIAG this arm answers).
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged party
// is a geared wave-4 hunting party — hide_armor + hunting_spear,
// leader at 30/100 HP in the §1 fixture — never a fresh un-geared
// solo scholar. The §1 monster is a herald VARIANT with hp [80,80]
// (a real herald is 700–900 HP): a MECHANISM fixture, stated plainly.
// The corpus probe (prereg §0b) shows the floor-within-one-round
// geometry is 0/14 in real play, so no real monster stages the case
// in a short staged fight — the fixture isolates the override's
// arithmetic on the identical engine path (same floor branch, same
// dpr read, same lead-monster HP read). The pilot measures the real
// population; this test proves the mechanism fires correctly when
// the condition holds.
// Usage: node scripts/test-fleefloor-a.js
// Exit 0 = all checks pass.
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
const FC = require(path.join(REPO, 'scripts', 'analyze-fleecall-b'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function hasLine(rec, re) { return (rec.log || []).some(function (s) { return re.test(s); }); }
function countLine(rec, re) { return (rec.log || []).filter(function (s) { return re.test(s); }).length; }
function round1Strikes(rec) {
  const out = [];
  (rec.log || []).forEach(function (s) {
    const m = /^R1: .* strikes for (\d+)/.exec(s);
    if (m) out.push(parseInt(m[1], 10));
  });
  return out;
}

// Extended flee-variant classification: the fleecall line-based
// classifier, PLUS the door-floor fallback. A floor flee in a door
// fight (allyFromStart) logs NO line at all — JOINENDLINES and
// SOLOENDLINES both skip allyFromStart fights — so a vFlee with a
// fleeHpFrac and fleeLearn false IS the floor branch (the morale read
// never ran at round 1, so hopeless is false there by construction;
// learn needs round >= 3; the committed-finish floor carries its own
// line; the hopeless branch always logs its line, so a lineless vFlee
// cannot be hopeless — and the floor branch sets fleeHopeless =
// hopeless, so the flag may be true on a floor flee). Same rule as the
// analyzer (scripts/analyze-fleefloor-a.js).
function classifyVariant(rec) {
  const line = FC.classifyFleeVariant(rec.log || []);
  if (line !== 'other') return line;
  if (rec.outcome === 'vFlee' && rec.fleeHpFrac != null && !rec.fleeLearn) return 'floor';
  return 'other';
}
function summarize(rec) {
  const mLeft = (rec.mHpLeft != null ? rec.mHpLeft : (rec.mHpStart != null ? rec.mHpStart - rec.mDealt : null));
  const dpr = rec.rounds ? rec.mDealt / rec.rounds : 0;
  const logJoined = (rec.log || []).join('\n');
  return {
    outcome: rec.outcome, rounds: rec.rounds, mDealt: rec.mDealt, vTaken: rec.vTaken,
    vHpLeft: rec.vHpLeft, mHpLeft: mLeft, dpr: +dpr.toFixed(2),
    variant: classifyVariant(rec), lineVariant: FC.classifyFleeVariant(rec.log || []),
    fleeHpFrac: (rec.fleeHpFrac == null ? null : +rec.fleeHpFrac.toFixed(2)),
    floorFinishHold: (rec.floorFinishHold | 0),
    holdLines: countLine(rec, /Finish the kill/),
    logHash: crypto.createHash('sha256').update(logJoined).digest('hex').slice(0, 16),
    logLines: (rec.log || []).length,
    r1: round1Strikes(rec),
  };
}

const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');

(function section0() {
  check('§0 fieldFights.js carries the FLOORFINISH gate (FLOORFINISH env + floorFinishOn + finish-the-kill hold)',
    /FLOORFINISH/.test(ffSrc) && /floorFinishOn/.test(ffSrc) && /floorFinishHold/.test(ffSrc) &&
    /Finish the kill/.test(ffSrc));
  check('§0 the gate is env-gated OFF by default (no wave gate — the rule as specified is wave-agnostic)',
    /process\.env\.FLOORFINISH === '1'/.test(ffSrc));
  check('§0 the hold compares lead-monster HP against one round of live party damage (mDealt / round)',
    /_ffDpr = rec\.mDealt \/ round/.test(ffSrc) && /_ffHold = _ffDpr > 0 && _ffLead\.hp <= _ffDpr/.test(ffSrc));
  check('§0 the hold never fires on a zero-damage party (dpr 0 guard)',
    /_ffDpr > 0/.test(ffSrc));
  check('§0 the hold sits in the floor branch non-sealed path and counts it (floorFinishHold)',
    /rec\.floorFinishHold = \(rec\.floorFinishHold \| 0\) \+ 1/.test(ffSrc) &&
    ffSrc.indexOf('rec.floorFinishHold') > ffSrc.indexOf('SCREAM CHEESE') &&
    ffSrc.indexOf('rec.floorFinishHold') < ffSrc.indexOf('// THE LEAD FALLS'));
  check('§0 the hold draws no RNG (no RR() inside the FLOORFINISH hold block)',
    (function () {
      const i = ffSrc.indexOf('if (_ffHold) {');
      const j = ffSrc.indexOf('// THE LEAD FALLS', i);
      const block = ffSrc.slice(i, j);
      return block.indexOf('RR()') === -1 && block.indexOf('RR(') === -1;
    })());
  check('§0 the committed-finish 40% floor is untouched (no FLOORFINISH reference in its block)',
    (function () {
      const i = ffSrc.indexOf('Committed-finish floor');
      const j = ffSrc.indexOf('COUNTER EXECUTION', i);
      return ffSrc.slice(i, j).indexOf('FLOORFINISH') === -1;
    })());
  check('§0 the hold narrates once per fight (floorFinishHoldLogged + "(Finish the kill)" line)',
    /rec\.floorFinishHoldLogged/.test(ffSrc) && /holds — .* is one strike from dead, and they are finishing it/.test(ffSrc));
})();

// ================= STAGING HELPERS (same as test-fleeguard-b.js) =================
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
// hpRange replaces the monster's hp range (null = real def).
// leaderHp sets the holder's health (allies 100). door=true passes
// allyFromStart. Caller sets the env (FLOORFINISH) first.
async function stageFight(monsterId, hpRange, leaderHp, door, seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'pinquaddoor', fullTelemetry: false });
  await setupGame(Game);
  const q = pickQuad(Game);
  if (!q.ok) return { ok: false, why: q.why || q };
  gearUp(Game, [q.holder, q.c1, q.c2, q.c3]);
  [q.holder, q.c1, q.c2, q.c3].forEach(function (id) {
    Game.startExpedition(id, q.hx, q.hy, false, { tx: 6, ty: 6, duration: 20 });
  });
  const v = Game.state.village;
  v.health[q.holder] = leaderHp; v.health[q.c1] = 100; v.health[q.c2] = 100; v.health[q.c3] = 100;
  const realDef = (Game.data.monsters || []).find(function (m) { return m.id === monsterId; }) || {};
  const mdef = hpRange ? Object.assign({}, realDef, { hp: hpRange.slice() }) : realDef;
  const rec = Game.fieldFight(q.holder, mdef, null, { allies: 3, allyVids: [q.c1, q.c2, q.c3], allyFromStart: !!door });
  return { ok: true, rec: rec, mdef: mdef };
}

// Frozen off-mode expectations (capture3: staged fixtures run on
// unmodified code via git stash, then on changed code with
// FLOORFINISH unset — outputs identical; frozen here as the §2 bar).
// Keys: A = herald hp [80,80] leader 30 door; B = herald hp [400,400]
// leader 30 door; C = real herald leader 100 door. Fields are the
// summarize() output minus r1 (checked separately where it matters).
const EXPECTED = {
  "A-11": {
    "outcome": "vFlee",
    "rounds": 1,
    "mDealt": 62,
    "vTaken": 0,
    "vHpLeft": 30,
    "mHpLeft": 18,
    "dpr": 62,
    "variant": "other",
    "fleeHpFrac": 0.3,
    "floorFinishHold": 0,
    "logHash": "d7532903a8574d35",
    "logLines": 7
  },
  "A-22": {
    "outcome": "vDie",
    "rounds": 1,
    "mDealt": 46,
    "vTaken": 35,
    "vHpLeft": 0,
    "mHpLeft": 34,
    "dpr": 46,
    "variant": "other",
    "fleeHpFrac": null,
    "floorFinishHold": 0,
    "logHash": "1dda19c1ee32071f",
    "logLines": 7
  },
  "A-31337": {
    "outcome": "vFlee",
    "rounds": 1,
    "mDealt": 38,
    "vTaken": 14,
    "vHpLeft": 16,
    "mHpLeft": 42,
    "dpr": 38,
    "variant": "other",
    "fleeHpFrac": 0.16,
    "floorFinishHold": 0,
    "logHash": "0706d2d2a6f3b8d0",
    "logLines": 7
  },
  "A-33": {
    "outcome": "vFlee",
    "rounds": 1,
    "mDealt": 65,
    "vTaken": 4,
    "vHpLeft": 26,
    "mHpLeft": 15,
    "dpr": 65,
    "variant": "other",
    "fleeHpFrac": 0.26,
    "floorFinishHold": 0,
    "logHash": "a44c2e93270df39f",
    "logLines": 7
  },
  "A-424242": {
    "outcome": "vFlee",
    "rounds": 1,
    "mDealt": 51,
    "vTaken": 11,
    "vHpLeft": 19,
    "mHpLeft": 29,
    "dpr": 51,
    "variant": "other",
    "fleeHpFrac": 0.19,
    "floorFinishHold": 0,
    "logHash": "ec83bcaf468f3d6b",
    "logLines": 7
  },
  "A-44": {
    "outcome": "vFlee",
    "rounds": 1,
    "mDealt": 44,
    "vTaken": 0,
    "vHpLeft": 30,
    "mHpLeft": 36,
    "dpr": 44,
    "variant": "other",
    "fleeHpFrac": 0.3,
    "floorFinishHold": 0,
    "logHash": "f1f2a5341271503f",
    "logLines": 7
  },
  "A-55": {
    "outcome": "vKill",
    "rounds": 2,
    "mDealt": 92,
    "vTaken": 0,
    "vHpLeft": 30,
    "mHpLeft": 0,
    "dpr": 46,
    "variant": "other",
    "fleeHpFrac": null,
    "floorFinishHold": 0,
    "logHash": "7773ba61d08bfd2b",
    "logLines": 12
  },
  "A-66": {
    "outcome": "vFlee",
    "rounds": 1,
    "mDealt": 48,
    "vTaken": 8,
    "vHpLeft": 22,
    "mHpLeft": 32,
    "dpr": 48,
    "variant": "other",
    "fleeHpFrac": 0.22,
    "floorFinishHold": 0,
    "logHash": "10b2a89575f82712",
    "logLines": 7
  },
  "A-77": {
    "outcome": "vKill",
    "rounds": 2,
    "mDealt": 92,
    "vTaken": 0,
    "vHpLeft": 30,
    "mHpLeft": 0,
    "dpr": 46,
    "variant": "other",
    "fleeHpFrac": null,
    "floorFinishHold": 0,
    "logHash": "5390f88593aa0876",
    "logLines": 13
  },
  "A-777001": {
    "outcome": "vFlee",
    "rounds": 1,
    "mDealt": 68,
    "vTaken": 8,
    "vHpLeft": 22,
    "mHpLeft": 12,
    "dpr": 68,
    "variant": "other",
    "fleeHpFrac": 0.22,
    "floorFinishHold": 0,
    "logHash": "04b053e2f35b9408",
    "logLines": 7
  },
  "B-11": {
    "outcome": "vFlee",
    "rounds": 1,
    "mDealt": 62,
    "vTaken": 0,
    "vHpLeft": 30,
    "mHpLeft": 338,
    "dpr": 62,
    "variant": "other",
    "fleeHpFrac": 0.3,
    "floorFinishHold": 0,
    "logHash": "21d37961eed6172a",
    "logLines": 7
  },
  "B-22": {
    "outcome": "vFlee",
    "rounds": 1,
    "mDealt": 46,
    "vTaken": 11,
    "vHpLeft": 19,
    "mHpLeft": 354,
    "dpr": 46,
    "variant": "other",
    "fleeHpFrac": 0.19,
    "floorFinishHold": 0,
    "logHash": "f0e79d9f00f7d8e5",
    "logLines": 7
  },
  "B-31337": {
    "outcome": "vFlee",
    "rounds": 1,
    "mDealt": 38,
    "vTaken": 14,
    "vHpLeft": 16,
    "mHpLeft": 362,
    "dpr": 38,
    "variant": "other",
    "fleeHpFrac": 0.16,
    "floorFinishHold": 0,
    "logHash": "5d8976ab43f26517",
    "logLines": 7
  },
  "B-33": {
    "outcome": "vFlee",
    "rounds": 1,
    "mDealt": 65,
    "vTaken": 4,
    "vHpLeft": 26,
    "mHpLeft": 335,
    "dpr": 65,
    "variant": "other",
    "fleeHpFrac": 0.26,
    "floorFinishHold": 0,
    "logHash": "a2ae5fd04971dea5",
    "logLines": 7
  },
  "B-424242": {
    "outcome": "vFlee",
    "rounds": 1,
    "mDealt": 51,
    "vTaken": 11,
    "vHpLeft": 19,
    "mHpLeft": 349,
    "dpr": 51,
    "variant": "other",
    "fleeHpFrac": 0.19,
    "floorFinishHold": 0,
    "logHash": "b2978cea3eecaa79",
    "logLines": 7
  },
  "B-44": {
    "outcome": "vFlee",
    "rounds": 1,
    "mDealt": 44,
    "vTaken": 0,
    "vHpLeft": 30,
    "mHpLeft": 356,
    "dpr": 44,
    "variant": "other",
    "fleeHpFrac": 0.3,
    "floorFinishHold": 0,
    "logHash": "fe8bc80dc39eeae9",
    "logLines": 7
  },
  "B-55": {
    "outcome": "vFlee",
    "rounds": 5,
    "mDealt": 288,
    "vTaken": 17,
    "vHpLeft": 13,
    "mHpLeft": 112,
    "dpr": 57.6,
    "variant": "hopeless",
    "fleeHpFrac": 0.13,
    "floorFinishHold": 0,
    "logHash": "a0e1e2b68d1aab80",
    "logLines": 29
  },
  "B-66": {
    "outcome": "vFlee",
    "rounds": 1,
    "mDealt": 48,
    "vTaken": 8,
    "vHpLeft": 22,
    "mHpLeft": 352,
    "dpr": 48,
    "variant": "other",
    "fleeHpFrac": 0.22,
    "floorFinishHold": 0,
    "logHash": "f54f58cc17e00e54",
    "logLines": 7
  },
  "B-77": {
    "outcome": "vDie",
    "rounds": 6,
    "mDealt": 235,
    "vTaken": 60,
    "vHpLeft": 0,
    "mHpLeft": 165,
    "dpr": 39.17,
    "variant": "other",
    "fleeHpFrac": null,
    "floorFinishHold": 0,
    "logHash": "37cd98694b8daad3",
    "logLines": 29
  },
  "B-777001": {
    "outcome": "vFlee",
    "rounds": 1,
    "mDealt": 68,
    "vTaken": 9,
    "vHpLeft": 21,
    "mHpLeft": 332,
    "dpr": 68,
    "variant": "other",
    "fleeHpFrac": 0.21,
    "floorFinishHold": 0,
    "logHash": "ebb8237c3896415e",
    "logLines": 7
  },
  "C-11": {
    "outcome": "vDie",
    "rounds": 7,
    "mDealt": 444,
    "vTaken": 107,
    "vHpLeft": 0,
    "mHpLeft": 269,
    "dpr": 63.43,
    "variant": "other",
    "fleeHpFrac": null,
    "floorFinishHold": 0,
    "logHash": "24b7bd2ffb81dc27",
    "logLines": 37
  },
  "C-22": {
    "outcome": "vFlee",
    "rounds": 11,
    "mDealt": 435,
    "vTaken": 60,
    "vHpLeft": 40,
    "mHpLeft": 457,
    "dpr": 39.55,
    "variant": "hopeless",
    "fleeHpFrac": 0.4,
    "floorFinishHold": 0,
    "logHash": "2759051d80452934",
    "logLines": 56
  },
  "C-31337": {
    "outcome": "vFlee",
    "rounds": 5,
    "mDealt": 191,
    "vTaken": 61,
    "vHpLeft": 39,
    "mHpLeft": 638,
    "dpr": 38.2,
    "variant": "hopeless",
    "fleeHpFrac": 0.39,
    "floorFinishHold": 0,
    "logHash": "0af1b6735597cabf",
    "logLines": 28
  },
  "C-33": {
    "outcome": "vKill",
    "rounds": 13,
    "mDealt": 800,
    "vTaken": 39,
    "vHpLeft": 61,
    "mHpLeft": 0,
    "dpr": 61.54,
    "variant": "other",
    "fleeHpFrac": null,
    "floorFinishHold": 0,
    "logHash": "2eec568a5cc5156e",
    "logLines": 67
  },
  "C-424242": {
    "outcome": "vFlee",
    "rounds": 9,
    "mDealt": 489,
    "vTaken": 50,
    "vHpLeft": 50,
    "mHpLeft": 286,
    "dpr": 54.33,
    "variant": "hopeless",
    "fleeHpFrac": 0.5,
    "floorFinishHold": 0,
    "logHash": "7d87b03810261d13",
    "logLines": 48
  },
  "C-44": {
    "outcome": "vFlee",
    "rounds": 7,
    "mDealt": 317,
    "vTaken": 35,
    "vHpLeft": 65,
    "mHpLeft": 468,
    "dpr": 45.29,
    "variant": "hopeless",
    "fleeHpFrac": 0.65,
    "floorFinishHold": 0,
    "logHash": "adffdba7096ced1f",
    "logLines": 38
  },
  "C-55": {
    "outcome": "vFlee",
    "rounds": 9,
    "mDealt": 534,
    "vTaken": 72,
    "vHpLeft": 28,
    "mHpLeft": 236,
    "dpr": 59.33,
    "variant": "hopeless",
    "fleeHpFrac": 0.28,
    "floorFinishHold": 0,
    "logHash": "27f346d8409e6a89",
    "logLines": 48
  },
  "C-66": {
    "outcome": "vFlee",
    "rounds": 15,
    "mDealt": 618,
    "vTaken": 67,
    "vHpLeft": 33,
    "mHpLeft": 82,
    "dpr": 41.2,
    "variant": "hopeless",
    "fleeHpFrac": 0.33,
    "floorFinishHold": 0,
    "logHash": "e6bf84026822b890",
    "logLines": 75
  },
  "C-77": {
    "outcome": "vFlee",
    "rounds": 3,
    "mDealt": 135,
    "vTaken": 61,
    "vHpLeft": 39,
    "mHpLeft": 621,
    "dpr": 45,
    "variant": "hopeless",
    "fleeHpFrac": 0.39,
    "floorFinishHold": 0,
    "logHash": "5021b1bd0d54ebee",
    "logLines": 18
  },
  "C-777001": {
    "outcome": "vFlee",
    "rounds": 5,
    "mDealt": 341,
    "vTaken": 51,
    "vHpLeft": 49,
    "mHpLeft": 435,
    "dpr": 68.2,
    "variant": "hopeless",
    "fleeHpFrac": 0.49,
    "floorFinishHold": 0,
    "logHash": "8beea1647d42050b",
    "logLines": 28
  }
};

const SEEDS = [424242, 777001, 31337, 11, 22, 33, 44, 55, 66, 77];

(async () => {
  process.env.SENSEEXPED = '1'; process.env.PARTYSIZE4 = '1'; process.env.VETREENGAGE = '1';
  process.env.FIGHTALLY2 = '1'; process.env.FLEEREPAIR2 = '1';
  delete process.env.FLEEGUARD; delete process.env.FLOORFINISH;
  delete process.env.ALLYSLOT3; delete process.env.PINQUAD; delete process.env.DMGPIN;

  // ---------- §1 STAYING, ARMED (fixture A: herald [80,80], leader 30, door) ----------
  // Find the seeds where the control flees on the floor with the
  // monster within one round of live party damage, then run the
  // armed leg on exactly those seeds.
  const staging = [];
  const farSeeds = [];
  for (const seed of SEEDS) {
    delete process.env.FLOORFINISH;
    const ctl = await stageFight('herald', [80, 80], 30, true, seed);
    if (!ctl.ok) { check('§1 staging seed ' + seed, false, ctl.why); continue; }
    const s = summarize(ctl.rec);
    const within1 = s.mHpLeft != null && s.dpr > 0 && s.mHpLeft <= s.dpr;
    if (s.variant === 'floor' && s.outcome === 'vFlee' && within1) staging.push({ seed: seed, ctl: s, rec: ctl.rec });
    else if (s.variant === 'floor' && s.outcome === 'vFlee' && !within1) farSeeds.push({ seed: seed, ctl: s, rec: ctl.rec });
  }
  console.log('  [§1] floor-within-1rd staging seeds: ' + staging.map(function (x) { return x.seed; }).join(', ') +
    ' | floor-far seeds: ' + farSeeds.map(function (x) { return x.seed; }).join(', '));
  check('§1 at least two seeds stage the floor-within-one-round case (control flees on the floor, monster within one round)',
    staging.length >= 2, { staging: staging.map(function (x) { return x.seed; }) });
  for (const st of staging) {
    process.env.FLOORFINISH = '1';
    const arm = await stageFight('herald', [80, 80], 30, true, st.seed);
    check('§1 staging: armed load stages (seed ' + st.seed + ')', arm.ok, arm.why || arm);
    if (!arm.ok) continue;
    const sa = summarize(arm.rec);
    console.log('  [§1] seed ' + st.seed + ' control=' + JSON.stringify(st.ctl) + ' armed=' + JSON.stringify(sa));
    check('§1 seed ' + st.seed + ': round-1 strikes identical (the lever draws no RNG before the hold)',
      eq(st.ctl.r1, sa.r1), { ctl: st.ctl.r1, armed: sa.r1 });
    check('§1 seed ' + st.seed + ': armed holds (floorFinishHold >= 1, "(Finish the kill)" line exactly once)',
      sa.floorFinishHold >= 1 && sa.holdLines === 1, sa);
    check('§1 seed ' + st.seed + ': armed fights on to the kill (vKill, more rounds, more damage than the control)',
      sa.outcome === 'vKill' && sa.rounds > st.ctl.rounds && sa.mDealt > st.ctl.mDealt, sa);
  }
  // The floor-far seed(s) at the same fixture: armed == control exactly.
  check('§1 at least one floor-far seed stages (monster more than one round away)',
    farSeeds.length >= 1, { far: farSeeds.map(function (x) { return x.seed; }) });
  for (const st of farSeeds) {
    process.env.FLOORFINISH = '1';
    const arm = await stageFight('herald', [80, 80], 30, true, st.seed);
    if (!arm.ok) { check('§1 far-seed armed staging ' + st.seed, false, arm.why); continue; }
    const sa = summarize(arm.rec);
    check('§1 seed ' + st.seed + ': floor-far armed == control exactly (no hold, same flee)',
      sa.floorFinishHold === 0 && sa.holdLines === 0 && eq(sa, st.ctl), { ctl: st.ctl, armed: sa });
  }

  // ---------- §2 OFF-MODE BYTE-IDENTICAL (frozen pre-change expectations) ----------
  delete process.env.FLOORFINISH;
  let offOk = 0, offTotal = 0;
  for (const seed of SEEDS) {
    for (const fx of [{ key: 'A', hp: [80, 80], lh: 30 }, { key: 'B', hp: [400, 400], lh: 30 }, { key: 'C', hp: null, lh: 100 }]) {
      const r = await stageFight('herald', fx.hp, fx.lh, true, seed);
      if (!r.ok) { check('§2 staging ' + fx.key + '-' + seed, false, r.why); continue; }
      const s = summarize(r.rec);
      const exp = EXPECTED[fx.key + '-' + seed];
      offTotal++;
      // Project onto the frozen fields: the capture's `variant` is
      // line-based, so compare s.lineVariant against it; holdLines
      // must be 0 with the flag off (checked separately).
      const proj = { outcome: s.outcome, rounds: s.rounds, mDealt: s.mDealt, vTaken: s.vTaken,
        vHpLeft: s.vHpLeft, mHpLeft: s.mHpLeft, dpr: s.dpr, variant: s.lineVariant,
        fleeHpFrac: s.fleeHpFrac, floorFinishHold: s.floorFinishHold, logHash: s.logHash, logLines: s.logLines };
      if (eq(proj, exp) && s.holdLines === 0) offOk++;
      else check('§2 off-mode ' + fx.key + '-' + seed + ' matches the frozen pre-change record', false, { got: proj, exp: exp, holdLines: s.holdLines });
    }
  }
  check('§2 off-mode byte-identical on all ' + offTotal + ' staged fights (' + offOk + '/' + offTotal + ' match the frozen pre-change records)',
    offOk === offTotal && offTotal === 30, { offOk: offOk, offTotal: offTotal });

  // ---------- §3 HOPELESS UNTOUCHED (fixture C: real herald, leader 100, door) ----------
  delete process.env.FLOORFINISH;
  const hopelessSeeds = [];
  for (const seed of SEEDS) {
    const ctl = await stageFight('herald', null, 100, true, seed);
    if (!ctl.ok) continue;
    const s = summarize(ctl.rec);
    if (s.variant === 'hopeless' && s.outcome === 'vFlee') hopelessSeeds.push({ seed: seed, ctl: s });
  }
  console.log('  [§3] hopeless staging seeds: ' + hopelessSeeds.map(function (x) { return x.seed; }).join(', '));
  check('§3 at least two seeds stage a hopeless-branch flee (real herald)',
    hopelessSeeds.length >= 2, { hopeless: hopelessSeeds.map(function (x) { return x.seed; }) });
  for (const st of hopelessSeeds) {
    process.env.FLOORFINISH = '1';
    const arm = await stageFight('herald', null, 100, true, st.seed);
    if (!arm.ok) { check('§3 hopeless-seed armed staging ' + st.seed, false, arm.why); continue; }
    const sa = summarize(arm.rec);
    check('§3 seed ' + st.seed + ': hopeless flee armed == control exactly (the override never touches hopeless)',
      sa.floorFinishHold === 0 && eq(sa, st.ctl), { ctl: st.ctl, armed: sa });
  }

  // ---------- §4 DRIVER SMOKE (one 30d armed seed, in-process) ----------
  process.env.FLOORFINISH = '1';
  process.env.SENSEEXPED = '1'; process.env.PARTYSIZE4 = '1'; process.env.VETREENGAGE = '1';
  process.env.FIGHTALLY2 = '1'; process.env.FLEEREPAIR2 = '1';
  process.env.DAYS = '30';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'fleefloor-driver-a'))];
  const driver = require(path.join(REPO, 'scripts', 'fleefloor-driver-a'));
  let smoke = null, smokeErr = null;
  try { smoke = await driver.oneRun(112301); } catch (e) { smokeErr = e; }
  check('§4 driver smoke: oneRun(112301) completes without throwing', smokeErr == null && smoke != null, smokeErr && String(smokeErr.message || smokeErr).slice(0, 120));
  if (smoke) {
    check('§4 driver smoke: floorFinishOn true + floorFinishPresent true on the corpus object',
      smoke.floorFinishOn === true && smoke.floorFinishPresent === true,
      { on: smoke.floorFinishOn, present: smoke.floorFinishPresent });
    check('§4 driver smoke: 0 instrument errors', (smoke.instrumentErrors || []).length === 0, smoke.instrumentErrors);
    check('§4 driver smoke: every v4 row carries a numeric floorFinishHold',
      (smoke.v4fights || []).every(function (r) { return typeof r.floorFinishHold === 'number'; }),
      { rows: (smoke.v4fights || []).length });
    console.log('  [§4] smoke seed 112301 days=' + smoke.days + ' end=' + smoke.endReason + ' v4fights=' + (smoke.v4fights || []).length);
  }

  // ---------- §5 BASE GATES ----------
  for (const t of ['test-fleeguard-b.js', 'test-fleecall-b.js']) {
    const res = spawnSync(process.execPath, [path.join(REPO, 'scripts', t)], { encoding: 'utf8', timeout: 600000 });
    check('§5 base gate: ' + t + ' re-runs green', res.status === 0, { status: res.status, tail: String(res.stdout || '').slice(-300) });
  }

  console.log('\n' + passed + ' passed, ' + failed + ' failed.');
  process.exit(failed ? 1 : 0);
})();
