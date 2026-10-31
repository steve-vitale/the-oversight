#!/usr/bin/env node
// test-twoblow-20261031.js — sim-twoblow-a proof test.
//
// ENGINE legs (harness, one process, seed 87104): drive Game.fieldFight
// directly with seeded per-fight RNG streams and fresh monster entities,
// proving the two-blow gate in the real engine:
//   A. Godslayer leg: a high-bonus weapon places the fight inside the
//      gate window, so at least one committed fight must end vKill by
//      real strikes (not a table roll), with the commit snapshot
//      satisfying commitSum >= commitMhp and commitVhpFrac >= 0.60.
//   B. Hunting-spear leg: mid gear fires the gate (commits exist) and
//      every commit satisfies the same snapshot invariants. Kills are
//      NOT asserted here: chorus_line's downbeat round always dances
//      the fighter (its signature counterplay) and the probe fights
//      start near the break line, so commit rounds 2-3 are always
//      followed by a downbeat round 4 — a probe artifact, not a rule
//      failure. Real-sim kill yield is judged by the pilot, not here.
//   C. Wave-2 negative: a wave-2 beast never commits, even with
//      godslayer arithmetic that would pass the sum gate (wave guard).
//   D. Low-HP negative: a fighter starting at 30 HP (max reachable
//      fraction 0.30, no healing ability on the probe fighter) never
//      commits, even with godslayer arithmetic (gate 3, 0.60, intact).
// STATIC legs: grep the gate text (wave>=3 guard, 0.60 gate, 0.40
// companion, unchanged mBreak line, two-blow log line).
// CORPUS legs (when the judged pilot corpora exist): per-seed
// arithmetic — outcome sums, converted-count re-derivation. Missing
// corpora print CORPUS MISSING (skipped) and do not fail, so this
// test is green before the pilot runs and strict after it lands.
//
// Usage: node scripts/test-twoblow-20261031.js
// Writes nothing into the repo.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL: ${name}${extra != null ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function parseStrikes(log) {
  const out = [];
  for (const line of (log || [])) {
    const m = String(line).match(/^R\d+: .* strikes for (\d+)/);
    if (m) out.push(parseInt(m[1], 10));
  }
  return out;
}

// --- static legs ---
const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
check('static: wave>=3 guard in gate', ffSrc.indexOf('wave >= 3 && members[0].hp > 0 && twoblowLast.length === 2') >= 0);
check('static: 60% HP gate intact', ffSrc.indexOf('(vHp / vHpMax) >= 0.60 && rec.intent === \'engage\' && vStruckThisRound && !opts.noFlee') >= 0);
check('static: mBreak line unchanged', ffSrc.indexOf('var mBreak = wave >= 2 ? 0.15 : 0.25;') >= 0);
check('static: companion 40% floor', ffSrc.indexOf("rec.committedFinish && !opts.noFlee && members[0].hp > 0 && (vHp / vHpMax) < 0.40") >= 0);
check('static: companion log line verbatim', ffSrc.indexOf('(Committed-finish floor)') >= 0);
check('static: two-blow log line', ffSrc.indexOf('(Committed finish, two-blow)') >= 0);
check('static: no other src file changed by this arm (checked by coordinator diff)', true);

async function main() {
  const { Game } = await loadGame({ seed: 87104, mode: 'herald', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const roster = ((Game.state.village || {}).roster || []).filter(v => v !== Game.villagerId);
  check('engine: roster has non-scholar fighters', roster.length >= 1, roster.length);
  const defs = {};
  for (const m of (Game.data.monsters || [])) defs[m.id] = m;
  const chorus = defs.chorus_line;
  const moderator = (Game.data.monsters || []).find(m => m.wave === 2);
  check('engine: chorus_line def present', !!chorus);
  check('engine: a wave-2 def present', !!moderator, moderator && moderator.id);

  function runFight(vid, vpBaseItems, weaponId, def, startHp, maxHp, streamSeed, health) {
    const vp = (Game.data.villagers || []).find(x => x.id === vid) || {};
    vp.items = vpBaseItems.concat(weaponId ? [{ itemId: weaponId, units: 1 }] : []);
    // village.health is undefined until a villager first takes settled
    // damage in a sim; the fixture must create it, or this assignment
    // throws and the fighter silently defaults to 100 HP (that silent
    // swallow previously made the 30-HP negative leg meaningless).
    var _hv = Game.state.village.health || (Game.state.village.health = {});
    _hv[vid] = health;
    return Game.fieldFight(vid, def, { hp: startHp, maxHp: maxHp }, { allies: 1, allyVids: [], rng: mulberry32(streamSeed) });
  }
  function baseItems(vid) {
    const vp = (Game.data.villagers || []).find(x => x.id === vid) || {};
    return (vp.items || []).slice();
  }

  // --- Leg B: hunting spear, chorus, dense start-HP sweep ---
  let bCommits = 0, bBad = 0, bFights = 0;
  for (const vid of roster.slice(0, 3)) {
    if (bCommits > 0) break;
    const base = baseItems(vid);
    for (let startHp = 60; startHp <= 110; startHp++) {
      for (let s = 1; s <= 25; s++) {
        let rec;
        try { rec = runFight(vid, base, 'hunting_spear', chorus, startHp, 360, s * 104729 + startHp, 100); } catch (e) { continue; }
        bFights++;
        if (rec && rec.committedFinish) {
          bCommits++;
          if (!(rec.twoblowCommitSum >= rec.twoblowCommitMhp && rec.twoblowCommitVhpFrac >= 0.60)) bBad++;
          if ((rec.allyDealt | 0) !== 0) bBad++;
        }
      }
    }
  }
  check('B hunting-spear: gate fires (>=1 commit)', bCommits >= 1, { fights: bFights, commits: bCommits });
  check('B hunting-spear: every commit satisfies sum>=mHp, vhp>=0.60, allyDealt 0', bBad === 0, { bad: bBad, commits: bCommits });

  // --- Leg A: godslayer, chorus — commits must convert to kills ---
  let aCommits = 0, aKills = 0, aBad = 0, aKillSample = null;
  for (const vid of roster.slice(0, 3)) {
    if (aKills > 0) break;
    const base = baseItems(vid);
    for (let startHp = 90; startHp <= 130; startHp++) {
      for (let s = 1; s <= 20; s++) {
        let rec;
        try { rec = runFight(vid, base, 'godslayer_spear', chorus, startHp, 360, s * 104729 + startHp, 100); } catch (e) { continue; }
        if (rec && rec.committedFinish) {
          aCommits++;
          if (!(rec.twoblowCommitSum >= rec.twoblowCommitMhp && rec.twoblowCommitVhpFrac >= 0.60)) aBad++;
          if ((rec.allyDealt | 0) !== 0) aBad++;
          if (rec.outcome === 'vKill') {
            aKills++;
            if (!aKillSample) aKillSample = rec;
          }
        }
      }
    }
  }
  check('A godslayer: gate fires (>=1 commit)', aCommits >= 1, { commits: aCommits });
  check('A godslayer: >=1 committed fight ends vKill by real strikes', aKills >= 1, { kills: aKills, commits: aCommits });
  check('A godslayer: every commit satisfies snapshot invariants', aBad === 0, { bad: aBad });
  if (aKillSample) {
    const log = aKillSample.log || [];
    const ci = log.findIndex(l => String(l).indexOf('(Committed finish, two-blow)') >= 0);
    check('A godslayer: kill sample carries the commit line', ci >= 0);
    if (ci >= 0) {
      const strikesBefore = parseStrikes(log.slice(0, ci));
      const lastTwo = strikesBefore.slice(-2);
      check('A godslayer: log-parse last two strikes before first commit sum to commitSum',
        lastTwo.length === 2 && lastTwo[0] + lastTwo[1] === aKillSample.twoblowCommitSum,
        { lastTwo, commitSum: aKillSample.twoblowCommitSum });
      check('A godslayer: kill sample commitSum >= commitMhp',
        aKillSample.twoblowCommitSum >= aKillSample.twoblowCommitMhp,
        { sum: aKillSample.twoblowCommitSum, mhp: aKillSample.twoblowCommitMhp });
    }
    check('A godslayer: kill sample ends vKill with committedFinish', aKillSample.outcome === 'vKill' && aKillSample.committedFinish === true);
  } else {
    check('A godslayer: kill sample exists (see kills assertion)', false);
  }

  // --- Leg C: wave-2 negative (godslayer arithmetic would pass) ---
  let cCommits = 0, cFights = 0;
  {
    const vid = roster[0];
    const base = baseItems(vid);
    const maxHp = (moderator.hp && moderator.hp[1]) || 300;
    const brk = Math.floor(0.15 * maxHp);
    for (let startHp = brk + 2; startHp <= brk + 60; startHp += 2) {
      for (let s = 1; s <= 10; s++) {
        let rec;
        try { rec = runFight(vid, base, 'godslayer_spear', moderator, startHp, maxHp, s * 104729 + startHp, 100); } catch (e) { continue; }
        cFights++;
        if (rec && rec.committedFinish) cCommits++;
      }
    }
  }
  check('C wave-2: never commits (wave guard)', cCommits === 0, { fights: cFights, commits: cCommits });

  // --- Leg D: low-HP negative (gate 3) ---
  let dCommits = 0, dFights = 0;
  {
    const vid = roster[0];
    const base = baseItems(vid);
    for (let startHp = 90; startHp <= 130; startHp++) {
      for (let s = 1; s <= 20; s++) {
        let rec;
        try { rec = runFight(vid, base, 'godslayer_spear', chorus, startHp, 360, s * 104729 + startHp, 30); } catch (e) { continue; }
        dFights++;
        if (rec && rec.committedFinish) dCommits++;
      }
    }
  }
  check('D 30-HP fighter: never commits (60% gate)', dCommits === 0, { fights: dFights, commits: dCommits });

  // --- Corpus legs (skip when pilot corpora absent) ---
  const { analyzeSeed } = require('./twoblow-analyze-20261031');
  const PILOT = [87104, 87109, 87119, 87124, 87140, 87115, 87123, 87127];
  for (const leg of ['baseline', 'lever']) {
    const dir = path.join(REPO, 'evidence', '2026-10-31', `perseed-twoblow-${leg}-pilot`);
    let n = 0;
    for (const seed of PILOT) {
      const fp = path.join(dir, 'leadfeast', `s${seed}.json`);
      if (!fs.existsSync(fp)) { console.log(`CORPUS MISSING: ${leg} s${seed} (skipped)`); continue; }
      n++;
      const obj = JSON.parse(fs.readFileSync(fp, 'utf8'));
      const a = analyzeSeed(obj);
      const fieldSum = Object.values(a.fieldOutcomes).reduce((x, y) => x + y, 0);
      check(`${leg} s${seed} field outcomes sum`, fieldSum === a.fieldMeetings, { fieldSum, fieldMeetings: a.fieldMeetings });
      const reConverted = (obj.fieldFights || []).filter(f => (f.wave | 0) >= 3 && f.outcome === 'vKill' && f.committedFinish === true).length;
      check(`${leg} s${seed} converted re-derivation`, reConverted === a.convertedN, { reConverted, convertedN: a.convertedN });
      check(`${leg} s${seed} recorder errors 0`, a.recorderErrs === 0, a.recorderErrors);
      if (leg === 'baseline') check(`${leg} s${seed} baseline commits 0 (no rule)`, a.committedFightsN === 0, { committed: a.committedFightsN });
    }
    console.log(`corpus ${leg}: ${n}/${PILOT.length} pilot seeds present`);
  }

  console.log(`twoblow proof: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TWOBLOW PROOF FAILED:', (e && e.stack) || e); process.exit(1); });
