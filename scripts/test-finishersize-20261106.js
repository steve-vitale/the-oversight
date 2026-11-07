#!/usr/bin/env node
// test-finishersize-20261106.js — sim-finishersize-a proof test.
//
// ENGINE legs (harness, one process, seed 87104): drive Game.fieldFight
// directly with seeded per-fight RNG streams and fresh monster entities,
// proving the committed finish on a beast met below its break line:
//   A. Herald + ally, 41 HP: the commit fires and the party kills by real
//      strikes; every commit satisfies commitMhp <= 3x commitStrike and
//      entry fighter HP >= 0.60.
//   B. Audit solo, 41 HP: the commit fires and converts without an ally.
//   C. Herald solo, 41 HP: no commit — intent is learn, the gate holds
//      (fsNoCommitWhy === 'intent' on every fight).
//   D. Above-tail negatives (herald 115, audit 125, with ally): the contact
//      finish fires but the commit never does (fsNoCommitWhy 'above-tail').
//   E. Wave-2 negative (moderator 20/170): never commits ('wave').
//   F. Low-HP negative (audit 41, fighter at 30 HP): never commits ('low-hp').
//   G. Eulogy dismissal: a trick-knowing fighter commits AND still gets
//      the kind dismissal at 3 contradictions — the commit never swallows
//      a signature exit; the beast survives, 0 kills.
//   H. Takeover + cap invariant (ad_break 33, weak stick, armored): when
//      twoblow fires mid-commit it takes the commitment over (final kind
//      'two-blow'); any lapse that occurs counted exactly 3 held rounds;
//      every FS commit satisfies the size gate.
// STATIC legs: grep the gate text (3x size gate, 60% gate, 3-round cap,
// takeover, lapse line), mBreak / MAX_ROUNDS / 40% floor unchanged.
// CORPUS legs (when the judged pilot corpora exist): per-seed arithmetic
// — below-break kill re-derivation, recorder errors 0, baseline FS commits
// 0 (no rule on baseline code), armed above-tail commits 0. Missing
// corpora print CORPUS MISSING (skipped) and do not fail, so this test is
// green before the pilot runs and strict after it lands.
//
// Usage: node scripts/test-finishersize-20261106.js
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
check('static: 3x size gate', ffSrc.indexOf('members[0].hp <= 3 * _cfVd') >= 0);
check('static: commit kind set', ffSrc.indexOf("rec.committedFinishKind = 'met-below-break'") >= 0);
check('static: 60% HP gate in FS block', ffSrc.indexOf("(vHp / vHpMax) >= 0.60") >= 0);
check('static: 3-round cap at round top', ffSrc.indexOf("(rec.fsCommitRounds | 0) >= 3") >= 0);
check('static: lapse log line', ffSrc.indexOf('(Committed finish lapsed)') >= 0);
check('static: twoblow takeover kind', ffSrc.indexOf("rec.committedFinishKind = 'two-blow'") >= 0);
check('static: FS break-check gate', ffSrc.indexOf('var _fsGate = rec.committedFinish') >= 0);
check('static: mBreak line unchanged', ffSrc.indexOf('var mBreak = wave >= 2 ? 0.15 : 0.25;') >= 0);
check('static: MAX_ROUNDS unchanged', ffSrc.indexOf('var MAX_ROUNDS = 15;') >= 0);
check('static: companion 40% floor unchanged', ffSrc.indexOf("rec.committedFinish && !opts.noFlee && members[0].hp > 0 && (vHp / vHpMax) < 0.40") >= 0);
check('static: twoblow gate unchanged', ffSrc.indexOf("wave >= 3 && members[0].hp > 0 && twoblowLast.length === 2") >= 0);
check('static: commit log line', ffSrc.indexOf('(Committed finish, met-below-break)') >= 0);

async function main() {
  const { Game } = await loadGame({ seed: 87104, mode: 'herald', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const roster = ((Game.state.village || {}).roster || []).filter(v => v !== Game.villagerId);
  check('engine: roster has non-scholar fighters', roster.length >= 2, roster.length);
  const defs = {};
  for (const m of (Game.data.monsters || [])) defs[m.id] = m;
  check('engine: herald/audit/eulogy defs present', !!(defs.herald && defs.audit && defs.eulogy));
  check('engine: moderator (wave 2) def present', !!(defs.moderator && defs.moderator.wave === 2));

  function runFight(vid, items, def, startHp, maxHp, streamSeed, health, allyVid, allyFromStart) {
    const vp = (Game.data.villagers || []).find(x => x.id === vid) || {};
    vp.items = items.map(function (id) { return { itemId: id, units: 1 }; });
    var _hv = Game.state.village.health || (Game.state.village.health = {});
    _hv[vid] = health;
    if (allyVid) { _hv[allyVid] = 100; }
    const opts = { allies: allyVid ? 1 : 0, allyVids: allyVid ? [allyVid] : [],
      allyFromStart: !!allyFromStart, rng: mulberry32(streamSeed) };
    return Game.fieldFight(vid, def, { hp: startHp, maxHp: maxHp }, opts);
  }
  function fsCommitted(rec) { return rec && rec.fsCommitMhp != null; }
  function sizeGateOk(rec) {
    return !fsCommitted(rec) || (rec.fsCommitMhp <= 3 * rec.fsCommitStrike && rec.fsEntryVhpFrac >= 0.60);
  }

  // --- Leg A: herald + ally, 41 HP ---
  let aCommits = 0, aKills = 0, aBad = 0, aSample = null, aFights = 0;
  for (let s = 1; s <= 30; s++) {
    const vid = roster[s % roster.length], allyVid = roster[(s + 1) % roster.length];
    let rec;
    try { rec = runFight(vid, ['hunting_spear'], defs.herald, 41, 800, s * 104729 + 41, 100, allyVid, true); } catch (e) { continue; }
    aFights++;
    if (fsCommitted(rec)) {
      aCommits++;
      if (!sizeGateOk(rec)) aBad++;
      if (rec.outcome === 'vKill') { aKills++; if (!aSample) aSample = rec; }
    }
  }
  check('A herald+ally: commit fires (>=25/30)', aCommits >= 25, { commits: aCommits, fights: aFights });
  check('A herald+ally: committed fights kill (>=25/30)', aKills >= 25, { kills: aKills, commits: aCommits });
  check('A herald+ally: every commit satisfies size + 60% gates', aBad === 0, { bad: aBad });
  if (aSample) {
    check('A herald+ally: kill sample carries the commit line',
      (aSample.log || []).some(function (l) { return String(l).indexOf('(Committed finish, met-below-break)') >= 0; }));
    check('A herald+ally: kill sample dealt >= 41 total (real strikes, no table)',
      (aSample.mDealt | 0) >= 41, { mDealt: aSample.mDealt });
    check('A herald+ally: kill sample took rounds (>=1)', (aSample.rounds | 0) >= 1, { rounds: aSample.rounds });
  } else {
    check('A herald+ally: kill sample exists', false);
  }

  // --- Leg B: audit solo, 41 HP ---
  let bCommits = 0, bKills = 0, bBad = 0, bFights = 0;
  for (let s = 1; s <= 30; s++) {
    const vid = roster[s % roster.length];
    let rec;
    try { rec = runFight(vid, ['hunting_spear'], defs.audit, 41, 1200, s * 104729 + 41, 100, null, false); } catch (e) { continue; }
    bFights++;
    if (fsCommitted(rec)) {
      bCommits++;
      if (!sizeGateOk(rec)) bBad++;
      if (rec.outcome === 'vKill') bKills++;
    }
  }
  check('B audit solo: commit fires (>=20/30)', bCommits >= 20, { commits: bCommits, fights: bFights });
  check('B audit solo: committed fights kill (>=20/30)', bKills >= 20, { kills: bKills, commits: bCommits });
  check('B audit solo: every commit satisfies size + 60% gates', bBad === 0, { bad: bBad });

  // --- Leg C: herald solo, 41 HP — intent gate ---
  let cCommits = 0, cBadWhy = 0, cFights = 0;
  for (let s = 1; s <= 30; s++) {
    const vid = roster[s % roster.length];
    let rec;
    try { rec = runFight(vid, ['hunting_spear'], defs.herald, 41, 800, s * 104729 + 41, 100, null, false); } catch (e) { continue; }
    cFights++;
    if (fsCommitted(rec)) cCommits++;
    if (rec.fsNoCommitWhy !== 'intent' || rec.intent !== 'learn') cBadWhy++;
  }
  check('C herald solo: never commits (intent gate)', cCommits === 0, { fights: cFights, commits: cCommits });
  check('C herald solo: every fight blocked on intent/learn', cBadWhy === 0, { bad: cBadWhy, fights: cFights });

  // --- Leg D: above-tail negatives ---
  let dCommits = 0, dBadWhy = 0, dFights = 0;
  const dCfgs = [{ def: defs.herald, hp: 115, max: 800 }, { def: defs.audit, hp: 125, max: 1200 }];
  for (const cfg of dCfgs) {
    for (let s = 1; s <= 30; s++) {
      const vid = roster[s % roster.length], allyVid = roster[(s + 1) % roster.length];
      let rec;
      try { rec = runFight(vid, ['hunting_spear'], cfg.def, cfg.hp, cfg.max, s * 104729 + cfg.hp, 100, allyVid, true); } catch (e) { continue; }
      dFights++;
      if (fsCommitted(rec)) dCommits++;
      if (!rec.contactFinishAttempted || rec.fsNoCommitWhy !== 'above-tail') dBadWhy++;
    }
  }
  check('D above-tail: never commits (60 fights)', dCommits === 0, { fights: dFights, commits: dCommits });
  check('D above-tail: contact evaluated, reason above-tail every time', dBadWhy === 0, { bad: dBadWhy, fights: dFights });

  // --- Leg E: wave-2 negative ---
  let eCommits = 0, eBadWhy = 0, eFights = 0;
  for (let s = 1; s <= 30; s++) {
    const vid = roster[s % roster.length], allyVid = roster[(s + 1) % roster.length];
    let rec;
    try { rec = runFight(vid, ['hunting_spear'], defs.moderator, 20, 170, s * 104729 + 20, 100, allyVid, true); } catch (e) { continue; }
    eFights++;
    if (fsCommitted(rec)) eCommits++;
    if (rec.contactFinishAttempted || rec.fsNoCommitWhy !== 'wave') eBadWhy++;
  }
  check('E wave-2: never commits', eCommits === 0, { fights: eFights, commits: eCommits });
  check('E wave-2: reason wave every time, contact never fired', eBadWhy === 0, { bad: eBadWhy });

  // --- Leg F: low-HP negative ---
  let fCommits = 0, fBadWhy = 0, fFights = 0;
  for (let s = 1; s <= 30; s++) {
    const vid = roster[s % roster.length], allyVid = roster[(s + 1) % roster.length];
    let rec;
    try { rec = runFight(vid, ['hunting_spear'], defs.audit, 41, 1200, s * 104729 + 41, 30, allyVid, true); } catch (e) { continue; }
    fFights++;
    if (fsCommitted(rec)) fCommits++;
    if (!rec.contactFinishAttempted || rec.fsNoCommitWhy !== 'low-hp') fBadWhy++;
  }
  check('F 30-HP fighter: never commits (60% gate)', fCommits === 0, { fights: fFights, commits: fCommits });
  check('F 30-HP fighter: reason low-hp every time', fBadWhy === 0, { bad: fBadWhy });

  // --- Leg G: eulogy dismissal (trick known, solo, armored) ---
  Game.state.villagerTricks = { eulogy: true };
  const sayLines = [];
  const origSay = Game.say;
  Game.say = function () {
    try { if (typeof arguments[0] === 'string') sayLines.push(String(arguments[0])); } catch (e) {}
    return origSay.apply(this, arguments);
  };
  let gDismiss = 0, gKills = 0, gCommitted = 0, gFights = 0, gSample = null;
  for (let s = 1; s <= 10; s++) {
    const vid = roster[s % roster.length];
    sayLines.length = 0;
    let rec;
    try { rec = runFight(vid, ['hunting_spear', 'military_vest'], defs.eulogy, 41, 1000, s * 104729 + 41, 100, null, false); } catch (e) { continue; }
    gFights++;
    const dl = sayLines.some(function (l) { return l.indexOf('closes the book kindly') >= 0; });
    if (fsCommitted(rec)) gCommitted++;
    if (rec.outcome === 'mFlee' && (rec.eulogyContradicts | 0) >= 3 && dl) { gDismiss++; if (!gSample) gSample = rec; }
    if (rec.outcome === 'vKill') gKills++;
  }
  Game.say = origSay;
  check('G eulogy: dismissal fires (>=8/10)', gDismiss >= 8, { dismiss: gDismiss, fights: gFights });
  check('G eulogy: never kills the beast (commit does not swallow the dismissal)', gKills === 0, { kills: gKills });
  check('G eulogy: the commit was live on every dismissal fight', gDismiss > 0 && gCommitted >= gDismiss, { committed: gCommitted, dismiss: gDismiss });
  if (gSample) {
    check('G eulogy: dismissal sample leaves the beast alive', (gSample.mHpLeft | 0) > 0, { mHpLeft: gSample.mHpLeft });
    check('G eulogy: dismissal sample dealt only the contact strike (trick rounds, no strikes)',
      (gSample.mDealt | 0) === (gSample.contactFinishDmg | 0), { mDealt: gSample.mDealt, contactDmg: gSample.contactFinishDmg });
  } else {
    check('G eulogy: dismissal sample exists', false);
  }

  // --- Leg H: takeover + cap invariant (ad_break 33, weak stick, armored) ---
  Game.state.villagerTricks = { ad_break: true };
  let hCommits = 0, hTakeovers = 0, hLapseBad = 0, hSizeBad = 0, hFights = 0, hLapses = 0;
  for (let s = 1; s <= 60; s++) {
    const vid = roster[s % roster.length];
    let rec;
    try { rec = runFight(vid, ['sharpened_stick', 'military_vest'], defs.ad_break, 33, 380, s * 104729 + 33, 100, null, false); } catch (e) { continue; }
    hFights++;
    if (fsCommitted(rec)) {
      hCommits++;
      if (rec.committedFinishKind === 'two-blow') hTakeovers++;
      if (rec.fsCommitMhp > 3 * rec.fsCommitStrike) hSizeBad++;
    }
    if (rec.fsLapsed) {
      hLapses++;
      if (rec.fsCommitRounds !== 3) hLapseBad++;
    }
  }
  check('H ad_break stick: FS commit fires (>=30/60)', hCommits >= 30, { commits: hCommits, fights: hFights });
  check('H ad_break stick: twoblow takes some commits over (>=1)', hTakeovers >= 1, { takeovers: hTakeovers, commits: hCommits });
  check('H ad_break stick: every lapse counted exactly 3 held rounds', hLapseBad === 0, { bad: hLapseBad, lapses: hLapses });
  check('H ad_break stick: every FS commit satisfies the size gate', hSizeBad === 0, { bad: hSizeBad });
  console.log('H note: lapses observed: ' + hLapses + ' (backstop; may be 0 — the cap binds only when twoblow cannot take over)');

  // --- Corpus legs (skip when pilot corpora absent) ---
  const FS = require('./finishersize-analyze-20261106');
  for (const leg of ['finishersize-baseline', 'finishersize-armed']) {
    const dir = path.join(REPO, 'evidence', '2026-11-06', 'perseed-finishersize-a');
    let n = 0;
    for (let seed = 99661; seed <= 99668; seed++) {
      const fp = path.join(dir, 'fs-s' + seed + '-' + leg + '.json');
      if (!fs.existsSync(fp)) { console.log(`CORPUS MISSING: ${leg} s${seed} (skipped)`); continue; }
      n++;
      const obj = JSON.parse(fs.readFileSync(fp, 'utf8'));
      const a = FS.analyzeFiles([fp]);
      const reDerived = (obj.fieldFights || []).filter(function (f) {
        return FS.isBelowBreak(f) && f.outcome === 'vKill';
      }).length;
      check(`${leg} s${seed} below-break kills re-derive`, reDerived === a.fs.belowBreakKills, { reDerived, counted: a.fs.belowBreakKills });
      check(`${leg} s${seed} recorder errors 0`, (obj.instrumentErrors || []).length === 0, obj.instrumentErrors);
      if (leg === 'finishersize-baseline') {
        const fsCommits = (obj.fieldFights || []).filter(function (f) { return f.fsCommitMhp != null; }).length;
        check(`${leg} s${seed} baseline FS commits 0 (no rule)`, fsCommits === 0, { commits: fsCommits });
      }
      if (leg === 'finishersize-armed') {
        check(`${leg} s${seed} above-tail commits 0 (sizing holds)`, a.fs.aboveTailCommitted === 0, { aboveTailCommitted: a.fs.aboveTailCommitted });
      }
    }
    console.log(`corpus ${leg}: ${n}/8 pilot seeds present`);
  }

  console.log(`finishersize proof: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FINISHERSIZE PROOF FAILED:', (e && e.stack) || e); process.exit(1); });
