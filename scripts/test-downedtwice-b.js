#!/usr/bin/env node
'use strict';
// test-downedtwice-b.js — proof test, arm sim-downedtwice-b (finding #2634:
// A DOWNED COMPANION IS STRUCK AGAIN AND "GOES DOWN" A SECOND TIME).
//
// The observed fight (106705 d144, audit, wave 4; recovered transcript +
// rounds detail in the reprereg corpus): Lenkina, ally slot 2, enters at
// 16 HP; R1 "Assessment hits Lenkina for 37 (0 left)" — "Lenkina goes
// down!"; R2 "Assessment hits Lenkina for 42 (0 left)" — "Lenkina goes
// down!" AGAIN (ally2Hp −21 → −63). She then lies at 0 HP without
// striking — down, not dead — but the re-hit with a repeated going-down
// line reads wrong.
//
// WHAT IT PROVES (observable effect, not just assertions):
//   §1 PICK INVARIANT (unit, RED before / GREEN after): the monster-phase
//      ally pick, evaluated exactly as written in src/js/fieldFights.js
//      (the RHS of the `_hitAllyIdx = ...` assignment, extracted from
//      source and run under controlled RR), always resolves to a member
//      of `_liveAllies` — across every live-set shape, INCLUDING the
//      three-slot shapes [1,3] and [2,3] that only exist when a third
//      ally slot is on. On current master code the two-live pick
//      hardcodes slot numbers 1/2 (`RR() < 0.5 ? 1 : 2`), so with a
//      live pair of (1,3) or (2,3) it can resolve to a downed or absent
//      slot — the exact mechanism that hit Lenkina in R2. The fixed
//      pick indexes `_liveAllies` instead. The three-slot shapes cannot
//      be staged as a live fight on master (no ally3 code here), so the
//      invariant is checked at the unit level against the actual line;
//      §2 proves the two-slot case at fight level.
//   §1b RNG PARITY (pin; RED before / GREEN after for the 3-live case,
//      GREEN before and after for the 1- and 2-live cases): the pick
//      consumes exactly one RR draw for 2+ live allies and zero draws
//      for one live ally. On current code the 3-live case draws zero
//      (it falls through to `_liveAllies[0]`, always the first live
//      ally); the fixed pick draws once for any 2+ live set. On master
//      the 3-live case is unreachable, so the change is inert there —
//      the pin is what keeps the fix from shifting the RNG stream
//      (guardrail: identical trajectories).
//   §2 FIGHT-LEVEL NO-REPEAT (real fieldFight, GREEN before and after
//      on master — proves the targeting half is ALREADY correct for
//      the two-slot case): a geared party vs the wave-4 audit, one ally
//      staged at 16 HP (Lenkina's shape) so the monster downs them,
//      across seeded fights. Invariants per fight: no ally's
//      "goes down!" line repeats; no hit line targets an ally after
//      that ally's "goes down!" in the same fight; a downed ally never
//      strikes again. At least one staged fight must actually down the
//      low-HP ally, or the test fails vacuous.
//   §3 FALL GUARD (source-level, RED before / GREEN after): the fall
//      block ("goes down!" + the flat-30 fall settlement) is gated on
//      the transition — the target was live before this blow and is at
//      0 after it. On master a re-hit is unreachable through targeting
//      (§2), so the guard is defense-in-depth against the double
//      settlement the observed fight performed (hurtVillager 30 fired
//      twice for one fall); the check pins the transition condition in
//      source so a future targeting slip cannot re-open it.
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged party is
// a geared wave-4 hunting party — hide_armor + hunting_spear — never a
// fresh un-geared scholar. Fighter entry HP 84 (the live median).
// Usage: FIGHTALLY2=1 node scripts/test-downedtwice-b.js
// Exit 0 = all checks pass.
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

process.env.FIGHTALLY2 = '1';

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');

// ---------- §1 PICK INVARIANT ----------
(function section1() {
  const m = ffSrc.match(/if\s*\(hittingAlly\)\s*_hitAllyIdx\s*=\s*([^;]+);/);
  check('§1 pick assignment found in fieldFights.js', !!m, m ? m[0].slice(0, 80) : null);
  if (!m) return;
  let pick;
  try { pick = new Function('_liveAllies', 'RR', 'return (' + m[1] + ')'); }
  catch (e) { check('§1 pick RHS evaluates', false, String(e)); return; }
  const shapes = [[1], [2], [1, 2], [1, 3], [2, 3], [1, 2, 3]];
  const draws = [0.0, 0.1, 0.49, 0.5, 0.51, 0.9, 0.99];
  let bad = [];
  for (const live of shapes) {
    for (const r of draws) {
      let got;
      try { got = pick(live.slice(), function () { return r; }); }
      catch (e) { bad.push({ live: live, r: r, err: String(e) }); continue; }
      if (live.indexOf(got) < 0) bad.push({ live: live, r: r, got: got });
    }
  }
  check('§1 pick always resolves to a live ally (all shapes × draws)', bad.length === 0, bad.slice(0, 4));
  // §1b RNG parity: one draw for 2+ live, zero for one live.
  let counts = {};
  for (const live of [[1], [2], [1, 2], [1, 3], [1, 2, 3]]) {
    let n = 0;
    pick(live.slice(), function () { n++; return 0.3; });
    counts[live.join(',')] = n;
  }
  check('§1b pick draws exactly once for 2+ live allies, zero for one',
    counts['1'] === 0 && counts['2'] === 0 && counts['1,2'] === 1 && counts['1,3'] === 1 && counts['1,2,3'] === 1, counts);
})();

// ---------- §3 FALL GUARD ----------
(function section3() {
  const start = ffSrc.indexOf('if (hittingAlly) {');
  const end = ffSrc.indexOf("// FIGHTALLY2: write the target's HP back", start);
  const block = (start >= 0 && end > start) ? ffSrc.slice(start, end) : '';
  check('§3 ally-hit block located', block.length > 0);
  if (!block) return;
  const capAt = block.indexOf('_hHp -= ');
  check('§3 was-live captured before the HP subtraction',
    capAt > 0 && /var _hWasLive = _hHp > 0;/.test(block.slice(0, capAt)), null);
  check('§3 fall block gated on the transition (was-live AND now down)',
    /if\s*\(\s*_hWasLive\s*&&\s*_hHp\s*<=\s*0\s*\)\s*\{/.test(block), null);
})();

// ---------- §2 FIGHT-LEVEL NO-REPEAT ----------
function pickTrio(Game) {
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
  if (elig.length < 3) return { ok: false, why: 'only ' + elig.length + ' ranging villagers', hx: hx, hy: hy };
  const q = elig.slice(0, 3);
  v.trust = v.trust || {};
  v.health = v.health || {};
  v.sick = v.sick || {};
  q.forEach(function (id) {
    v.trust[id] = 50; v.health[id] = 100; delete v.sick[id];
    try { Game.npcSetNode(id, hx, hy); } catch (e) {}
  });
  return { ok: true, holder: q[0], c1: q[1], c2: q[2], hx: hx, hy: hy };
}
function gearUp(Game, ids) {
  const kit = { torso: { itemId: 'hide_armor' }, melee: { itemId: 'hunting_spear' } };
  ids.forEach(function (id) {
    const p = Game.getPerson ? Game.getPerson(id) : (Game.vpOf ? Game.vpOf(id) : null);
    if (p) p.equipped = JSON.parse(JSON.stringify(kit));
  });
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Scan one fight record for the downed-targeting invariants.
function auditFight(rec) {
  const log = rec.log || [];
  const downAt = {}; // name -> first "goes down!" line index
  const problems = [];
  let downCount = 0;
  for (let i = 0; i < log.length; i++) {
    const line = String(log[i]);
    const dm = line.match(/^(.+) goes down!$/);
    if (dm) {
      downCount++;
      if (downAt[dm[1]] != null) problems.push('repeat goes-down for ' + dm[1] + ' (lines ' + downAt[dm[1]] + ' and ' + i + ')');
      else downAt[dm[1]] = i;
      continue;
    }
    const hm = line.match(/^R\d+: .* hits (.+?) for \d+ \(\d+ left\)/);
    if (hm && downAt[hm[1]] != null) problems.push('re-hit on downed ' + hm[1] + ' at line ' + i + ' (down at ' + downAt[hm[1]] + ')');
    const sm = line.match(/^R\d+: (.+?) strikes for /);
    if (sm && downAt[sm[1]] != null) problems.push('downed ' + sm[1] + ' strikes again at line ' + i);
  }
  return { problems: problems, downCount: downCount, downNames: Object.keys(downAt) };
}

async function section2() {
  const auditDef = function (Game) {
    return (Game.data.monsters || []).find(function (m) { return m.id === 'audit'; }) || {};
  };
  // Rigged-RNG fight first: the monster hits an ally almost every round,
  // so the staged 16-HP ally is downed early and the later rounds are the
  // re-hit opportunity. The RNG is a fixed LCG stream (not the harness
  // stream) so the staging is reproducible.
  const riggedSeeds = [11, 23, 47, 59, 71, 83];
  let stagedDowns = 0, fights = 0;
  for (const rs of riggedSeeds) {
    const { Game } = await loadGame({ seed: 424242, mode: 'downedtwice', fullTelemetry: false });
    await setupGame(Game);
    const q = pickTrio(Game);
    check('§2 staging: trio found (rigged seed ' + rs + ')', q.ok, q.why || q);
    if (!q.ok) continue;
    gearUp(Game, [q.holder, q.c1, q.c2]);
    const v = Game.state.village;
    v.health[q.holder] = 84; v.health[q.c1] = 100; v.health[q.c2] = 16; // Lenkina's shape: slot-2 ally at 16 HP
    const rng = mulberry32(rs);
    const rec = Game.fieldFight(q.holder, auditDef(Game), null,
      { allies: 2, allyVids: [q.c1, q.c2], allyFromStart: true, rng: rng });
    fights++;
    const a = auditFight(rec);
    if (a.downCount > 0) stagedDowns++;
    console.log('  [§2 rigged ' + rs + '] outcome=' + rec.outcome + ' rounds=' + rec.rounds +
      ' downs=' + a.downCount + ' (' + a.downNames.join(', ') + ')' +
      ' ally2HpLeft=' + rec.ally2HpLeft);
    check('§2 rigged ' + rs + ': no downed-targeting violation', a.problems.length === 0, a.problems.slice(0, 3));
  }
  check('§2 rigged fights staged at least one down (else vacuous)', stagedDowns > 0, { fights: fights, stagedDowns: stagedDowns });
  // Natural-RNG sweep: same staging, harness stream, several seeds.
  let natDowns = 0, natFights = 0;
  for (const seed of [101, 202, 303, 404, 505, 606]) {
    const { Game } = await loadGame({ seed: seed, mode: 'downedtwice', fullTelemetry: false });
    await setupGame(Game);
    const q = pickTrio(Game);
    if (!q.ok) { check('§2 staging: trio found (natural seed ' + seed + ')', false, q.why); continue; }
    gearUp(Game, [q.holder, q.c1, q.c2]);
    const v = Game.state.village;
    v.health[q.holder] = 84; v.health[q.c1] = 100; v.health[q.c2] = 16;
    const rec = Game.fieldFight(q.holder, auditDef(Game), null,
      { allies: 2, allyVids: [q.c1, q.c2], allyFromStart: true });
    natFights++;
    const a = auditFight(rec);
    if (a.downCount > 0) natDowns++;
    check('§2 natural seed ' + seed + ': no downed-targeting violation', a.problems.length === 0, a.problems.slice(0, 3));
  }
  console.log('  [§2 natural] fights=' + natFights + ' with a down=' + natDowns);
}

async function main() {
  await section2();
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  if (failed) process.exitCode = 1;
}
main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
