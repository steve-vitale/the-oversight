#!/usr/bin/env node
// test-chorus-20261031.js — sim-chorus-a proof test.
//
// CHORUS-HOLD: a committed fighter holds through a downbeat dance
// round instead of losing the finish to it. Proves, in the real
// engine (harness, one process, seed 87104):
//   H1. At least one chorus fight carries the chorus-hold line with
//       chorusHoldRounds >= 1 (the branch fires).
//   H2. In every hold fight the commit line precedes the hold line,
//       and a dance line sits between them (hold follows a dance,
//       not any other round shape).
//   H3. No hold fight ends in a break-line flight on the hold round
//       itself: every hold fight either ends vKill or has a strike
//       line after the hold line (the fight continued past the
//       dance round and re-gated honestly).
//   H4. No hold without a prior commitment: every hold fight has
//       committedFinish true.
//   H5. Negative (non-dance species): across a spool sweep, zero
//       hold lines and zero chorusHoldRounds (the branch cannot
//       fire where no dance round exists).
// STATIC legs: grep the hold branch (prior-commit + dance +
//   alive + !noFlee guards), the dancedThisRound flag, the
//   chorusHoldRounds init, and the UNCHANGED twoblow gate (60%
//   gate, mBreak line, two-blow log line, 40% companion floor).
// CORPUS legs (when judged pilot corpora exist): re-derive the
//   prereg leak count and hold count from the per-seed JSONs.
//   Missing corpora print CORPUS MISSING (skipped) and do not
//   fail, so this test is green before the pilot runs and strict
//   after it lands.
//
// Usage: node scripts/test-chorus-20261031.js
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

// --- static legs ---
const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
check('static: hold branch guards (prior commit + dance + alive + !noFlee)',
  ffSrc.indexOf('if (rec.committedFinish && dancedThisRound && members[0].hp > 0 && !opts.noFlee)') >= 0);
check('static: chorus-hold log line', ffSrc.indexOf('(Committed finish, chorus hold)') >= 0);
check('static: chorusHoldRounds init', ffSrc.indexOf('chorusHoldRounds: 0') >= 0);
check('static: dancedThisRound declared + reset + set',
  ffSrc.indexOf('var dancedThisRound = false') >= 0 &&
  ffSrc.indexOf('dancedThisRound = false;') >= 0 &&
  ffSrc.indexOf('dancedThisRound = true;') >= 0);
check('static: twoblow gate UNCHANGED (60% gate)',
  ffSrc.indexOf("(vHp / vHpMax) >= 0.60 && rec.intent === 'engage' && vStruckThisRound && !opts.noFlee") >= 0);
check('static: mBreak line unchanged', ffSrc.indexOf('var mBreak = wave >= 2 ? 0.15 : 0.25;') >= 0);
check('static: two-blow log line intact', ffSrc.indexOf('(Committed finish, two-blow)') >= 0);
check('static: companion 40% floor intact',
  ffSrc.indexOf("rec.committedFinish && !opts.noFlee && members[0].hp > 0 && (vHp / vHpMax) < 0.40") >= 0);
check('static: dance rule itself untouched (round % 4)',
  ffSrc.indexOf("if (mid === 'chorus_line' && (fctx.round % 4 === 0))") >= 0);

function idxOf(log, needle) {
  for (let i = 0; i < (log || []).length; i++) if (String(log[i]).indexOf(needle) >= 0) return i;
  return -1;
}
function hasStrikeAfter(log, fromIdx) {
  for (let i = fromIdx + 1; i < (log || []).length; i++) if (/^R\d+: .* strikes for \d+/.test(String(log[i]))) return true;
  return false;
}

async function main() {
  const { Game } = await loadGame({ seed: 87104, mode: 'herald', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  // Fixture knowledge: the village knows the chorus counter, so the
  // downbeat dance is the fighter's action on %4 rounds (as in the
  // judged sims, where the village had learned it).
  try { (Game.state.villagerTricks || (Game.state.villagerTricks = {})).chorus_line = true; } catch (e) {}
  const roster = ((Game.state.village || {}).roster || []).filter(v => v !== Game.villagerId);
  check('engine: roster has non-scholar fighters', roster.length >= 1, roster.length);
  const defs = {};
  for (const m of (Game.data.monsters || [])) defs[m.id] = m;
  const chorus = defs.chorus_line;
  const spool = defs.spool;
  check('engine: chorus_line def present', !!chorus);
  check('engine: spool def present', !!spool);

  function runFight(vid, vpBaseItems, weaponId, def, startHp, maxHp, streamSeed, health) {
    const vp = (Game.data.villagers || []).find(x => x.id === vid) || {};
    vp.items = vpBaseItems.concat(weaponId ? [{ itemId: weaponId, units: 1 }] : []);
    var _hv = Game.state.village.health || (Game.state.village.health = {});
    _hv[vid] = health;
    return Game.fieldFight(vid, def, { hp: startHp, maxHp: maxHp }, { allies: 1, allyVids: [], rng: mulberry32(streamSeed) });
  }
  function baseItems(vid) {
    const vp = (Game.data.villagers || []).find(x => x.id === vid) || {};
    return (vp.items || []).slice();
  }

  // --- Legs H1-H4: chorus sweeps (godslayer + hunting spear) ---
  // Pristine bases captured ONCE: runFight overwrites vp.items, so
  // re-capturing between weapons would silently stack both weapons
  // on the fighter (that bug made the first version of this test
  // kill every beast before any round-4 dance). Start HP 90-220:
  // beasts starting just above the break line die in 2-3 rounds
  // and never reach a dance round; the hold needs a commit on
  // round 3+ followed by a %4 dance round.
  const pristineBase = {};
  for (const vid of roster.slice(0, 3)) pristineBase[vid] = baseItems(vid);
  const holdFights = [];
  let chorusFights = 0, chorusCommits = 0;
  for (const weapon of ['godslayer_spear', 'hunting_spear']) {
    for (const vid of roster.slice(0, 3)) {
      for (let startHp = 90; startHp <= 220; startHp += 5) {
        for (let s = 1; s <= 25; s++) {
          let rec;
          try { rec = runFight(vid, pristineBase[vid], weapon, chorus, startHp, 360, s * 104729 + startHp, 100); } catch (e) { continue; }
          chorusFights++;
          if (rec && rec.committedFinish) chorusCommits++;
          if (rec && (rec.chorusHoldRounds | 0) >= 1) holdFights.push(rec);
        }
      }
    }
  }
  check('H1: >=1 chorus fight carries a chorus hold', holdFights.length >= 1,
    { fights: chorusFights, commits: chorusCommits, holds: holdFights.length });
  let h2bad = 0, h3bad = 0, h4bad = 0;
  for (const rec of holdFights) {
    const log = rec.log || [];
    const ci = idxOf(log, '(Committed finish, two-blow)');
    const hi = idxOf(log, '(Committed finish, chorus hold)');
    // A dance BETWEEN commit and hold (not the fight's first dance:
    // a fighter may dance on an early downbeat before committing).
    let danceBetween = false;
    if (ci >= 0 && hi > ci) {
      for (let i = ci + 1; i < hi; i++) if (String(log[i]).indexOf('dances on the downbeat') >= 0) danceBetween = true;
    }
    if (!(ci >= 0 && hi > ci && danceBetween)) h2bad++;
    if (rec.outcome === 'mFlee' && !hasStrikeAfter(log, hi)) h3bad++;
    // A hold fight that ends mFlee must also not carry a break line
    // as its very next line after the hold (that would be the leak,
    // un-fixed, on the hold round itself).
    if (rec.outcome === 'mFlee' && String(log[hi + 1] || '').indexOf('breaks — wounded past its line') >= 0) h3bad++;
    if (rec.committedFinish !== true) h4bad++;
  }
  check('H2: every hold follows a commit and a dance (commit < dance < hold)', h2bad === 0, { bad: h2bad, holds: holdFights.length });
  check('H3: no hold fight flees on its hold round (kills or strikes after)', h3bad === 0, { bad: h3bad, holds: holdFights.length });
  check('H4: every hold fight has committedFinish true', h4bad === 0, { bad: h4bad });
  const holdOutcomes = {};
  for (const rec of holdFights) holdOutcomes[rec.outcome || 'null'] = (holdOutcomes[rec.outcome || 'null'] || 0) + 1;
  console.log(`chorus holds: ${holdFights.length} fights, outcomes ${JSON.stringify(holdOutcomes)}`);

  // --- Leg H5: spool negative (no dance species, no holds) ---
  let spoolFights = 0, spoolHolds = 0;
  for (const vid of roster.slice(0, 2)) {
    for (let startHp = 60; startHp <= 130; startHp += 2) {
      for (let s = 1; s <= 10; s++) {
        let rec;
        try { rec = runFight(vid, pristineBase[vid], 'godslayer_spear', spool, startHp, 340, s * 104729 + startHp, 100); } catch (e) { continue; }
        spoolFights++;
        if (rec && ((rec.chorusHoldRounds | 0) >= 1 || idxOf(rec.log || [], '(Committed finish, chorus hold)') >= 0)) spoolHolds++;
      }
    }
  }
  check('H5: spool fights never hold (no dance round exists)', spoolHolds === 0, { fights: spoolFights, holds: spoolHolds });

  // --- Corpus legs (skip when pilot corpora absent) ---
  const { analyzeSeed } = require('./chorus-analyze-20261031');
  const PILOT = [87104, 87109, 87119, 87124, 87140, 87115, 87123, 87127];
  for (const leg of ['baseline', 'lever']) {
    const dir = path.join(REPO, 'evidence', '2026-10-31', `perseed-chorus-${leg}-pilot`);
    let n = 0;
    for (const seed of PILOT) {
      const fp = path.join(dir, 'leadfeast', `s${seed}.json`);
      if (!fs.existsSync(fp)) { console.log(`CORPUS MISSING: ${leg} s${seed} (skipped)`); continue; }
      n++;
      const obj = JSON.parse(fs.readFileSync(fp, 'utf8'));
      const a = analyzeSeed(obj);
      const reLeak = (obj.fieldFights || []).filter(f => {
        if (!(f.committedFinish === true && f.mid === 'chorus_line' && f.outcome === 'mFlee')) return false;
        const log = f.log || [];
        let ci = -1;
        for (let i = 0; i < log.length; i++) {
          if (String(log[i]).indexOf('Committed finish, two-blow') >= 0) ci = i;
          if (ci >= 0 && i > ci && String(log[i]).indexOf('dances on the downbeat') >= 0) return true;
        }
        return false;
      }).length;
      check(`${leg} s${seed} leak re-derivation`, reLeak === a.chorusLeakN, { reLeak, leakN: a.chorusLeakN });
      const reHold = (obj.fieldFights || []).filter(f => Array.isArray(f.log) && f.log.some(l => String(l).indexOf('Committed finish, chorus hold') >= 0)).length;
      check(`${leg} s${seed} hold re-derivation`, reHold === a.chorusHoldN, { reHold, holdN: a.chorusHoldN });
      check(`${leg} s${seed} recorder errors 0`, a.recorderErrs === 0, a.recorderErrors);
      if (leg === 'baseline') check(`${leg} s${seed} baseline holds 0 (no rule)`, a.chorusHoldN === 0, { holdN: a.chorusHoldN });
    }
    console.log(`corpus ${leg}: ${n}/${PILOT.length} pilot seeds present`);
  }

  console.log(`chorus proof: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('chorus proof crashed:', e); process.exit(1); });
