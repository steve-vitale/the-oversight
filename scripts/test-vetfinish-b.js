#!/usr/bin/env node
// test-vetfinish-b.js — sim-vetfinish-b proof test.
//
// The constructed wall-delivery instrument's proof: the committed finish
// (sim-finishersize-a, landed 8a4ce0eab) is already in the tree, and the
// wild field effect was DIAG twice (0 addressable meetings in 24 seeds).
// This test re-drives the OBSERVED shapes through the real engine and
// measures the addressable-window conversion rate the wild cannot show:
//   H. Harvest legs: the grind / FS-pilot / FS-adopt / vetfinish-before
//      corpora re-derive exactly (pool arithmetic the prereg binds).
//   V1. The 2 wild addressable shapes (99643 d112 influencer 76 HP,
//      99645 d85 herald 89 HP) re-driven with a real weapon: the FS gate
//      is live on these HPs, and the wild non-conversion was the
//      recorded weak strike (14 / 22), not a code failure.
//   V2. Volley-softened construction: a bow fighter meets an audit at
//      180/200/220 HP (15–18%); the real volley softens it below the
//      break line and the contact + commit are judged at FS sizing.
//   V3. Driven-crossing construction: a fighter meets an audit at
//      250/300 HP (above break) with a weak and a middling weapon; the
//      crossing rate is measured, and the negative control holds —
//      an FS commit NEVER fires on a beast met above the break line.
//   V4. Causal-channel leg: the commit's only causal channel is the
//      morale suppression (fsHoldLogged — the commit changing a flee
//      decision into a hold). 60 losing-shape fights count how often
//      that channel fires, and how many of those holds kill.
// STATIC legs: the flee-component default (mCanFlee off unless the kind
// carries flee) — the fact that makes below-break wave-4 beasts stand
// and die in ordinary rounds — plus the FS gate text and the untouched
// caps. Writes nothing into the repo.
// Usage: node scripts/test-vetfinish-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const VFIN = require(path.join(REPO, 'scripts', 'vetfinish-instrument-20261109'));
const FSA = require(path.join(REPO, 'scripts', 'finishersize-analyze-20261106'));

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
check('static: mCanFlee default-off (flee component only)', ffSrc.indexOf('var mCanFlee = !!(mdef && mdef.flee);') >= 0);
check('static: default-off comment present', ffSrc.indexOf('default off; lockpick_raccoon is the') >= 0);
check('static: FS commit kind present', ffSrc.indexOf("rec.committedFinishKind = 'met-below-break'") >= 0);
check('static: 3x size gate present', ffSrc.indexOf('members[0].hp <= 3 * _cfVd') >= 0);
check('static: 3-round cap present', ffSrc.indexOf("(rec.fsCommitRounds | 0) >= 3") >= 0);
check('static: mBreak line unchanged', ffSrc.indexOf('var mBreak = wave >= 2 ? 0.15 : 0.25;') >= 0);
check('static: MAX_ROUNDS unchanged', ffSrc.indexOf('var MAX_ROUNDS = 15;') >= 0);
check('static: morale-suppression (fsHoldLogged) present', ffSrc.indexOf('rec.fsHoldLogged = true;') >= 0);
const monsters = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const w4plus = monsters.filter(function (m) { return (m.wave | 0) >= 4; });
const w4Flee = w4plus.filter(function (m) { return !!m.flee; });
check('static: no wave-4+ monster kind carries a flee component', w4Flee.length === 0, { w4plus: w4plus.length, flee: w4Flee.map(function (m) { return m.id; }) });
check('static: wave-4+ roster non-empty', w4plus.length >= 10, { n: w4plus.length });

// --- harvest legs ---
const H = VFIN.harvestShapes(REPO);
check('H1 grind: 128 wave-4 field fights', H.grind.w4fieldRows === 128, { n: H.grind.w4fieldRows });
check('H1 grind: 1 field wave-4 kill', H.grind.w4fieldKills === 1, { n: H.grind.w4fieldKills });
check('H1 grind: 1 below-break meeting', H.grind.belowBreak.length === 1, { n: H.grind.belowBreak.length });
check('H1 grind: 1 contact finish attempted', H.grind.contactAttempted.length === 1, { n: H.grind.contactAttempted.length });
check('H1 grind: near-tail exits 3 (246 / 285 / 212 HP)', H.grind.nearTailExits.length === 3, { n: H.grind.nearTailExits.length });
check('H2 vetfinish-before: 168 wave-4 field fights', H.vetfinishBefore.w4fieldRows === 168, { n: H.vetfinishBefore.w4fieldRows });
check('H2 vetfinish-before: 9 field wave-4 kills', H.vetfinishBefore.w4fieldKills === 9, { n: H.vetfinishBefore.w4fieldKills });
check('H2 vetfinish-before: 11 below-break meetings', H.vetfinishBefore.belowBreak.length === 11, { n: H.vetfinishBefore.belowBreak.length });
check('H2 vetfinish-before: 8 contact finishes attempted', H.vetfinishBefore.contactAttempted.length === 8, { n: H.vetfinishBefore.contactAttempted.length });
check('H2 vetfinish-before: 0 FS met-below-break commits', H.vetfinishBefore.fsCommits === 0, { n: H.vetfinishBefore.fsCommits });
check('H2 vetfinish-before: no-commit reasons re-derive', JSON.stringify(H.vetfinishBefore.noCommitReasons) === JSON.stringify({ 'above-tail': 4, 'volley-damage': 1, 'no-instrument': 1 }), H.vetfinishBefore.noCommitReasons);
check('H3 pilot+adopt: 2 below-break meetings in 24 seeds of wild', H.pilotAdopt.belowBreak.length === 2, { n: H.pilotAdopt.belowBreak.length });
// Addressable re-derivation on the vetfinish-before corpus rows (adopt-a definition).
const vbFiles = fs.readdirSync(path.join(REPO, 'evidence', '2026-11-09', 'perseed-vetfinish-b'))
  .filter(function (x) { return x.indexOf('vetfinish-before') >= 0; })
  .map(function (x) { return path.join(REPO, 'evidence', '2026-11-09', 'perseed-vetfinish-b', x); });
const vbAnalyzed = FSA.analyzeFiles(vbFiles);
check('H3 vetfinish-before: analyzer below-break meetings 11', vbAnalyzed.fs.belowBreakMeetings === 11, { n: vbAnalyzed.fs.belowBreakMeetings });
check('H3 vetfinish-before: analyzer below-break kills 8', vbAnalyzed.fs.belowBreakKills === 8, { n: vbAnalyzed.fs.belowBreakKills });
check('H3 vetfinish-before: analyzer FS committed kills 0', vbAnalyzed.fs.committedKills === 0, { n: vbAnalyzed.fs.committedKills });
check('H3 vetfinish-before: addressable 2', vbAnalyzed.addressable.addressable === 2, { n: vbAnalyzed.addressable.addressable });
check('H3 vetfinish-before: addressable convertible 0', vbAnalyzed.addressable.addressableConvertible === 0, { n: vbAnalyzed.addressable.addressableConvertible });
check('H3 vetfinish-before: wall wave-4 kills 27', vbAnalyzed.w4killsAllChannels === 27, { n: vbAnalyzed.w4killsAllChannels });

async function main() {
  const { Game } = await loadGame({ seed: 87104, mode: 'herald', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const roster = ((Game.state.village || {}).roster || []).filter(function (v) { return v !== Game.villagerId; });
  check('engine: roster has non-scholar fighters', roster.length >= 2, roster.length);
  const defs = {};
  for (const m of (Game.data.monsters || [])) defs[m.id] = m;
  check('engine: audit/herald/influencer defs present', !!(defs.audit && defs.herald && defs.influencer));

  // items: [{id, units}] or plain ids; equipped: {melee:{itemId}, ranged:{itemId}}
  function runFight(vid, items, def, startHp, maxHp, streamSeed, health, allyVid, allyFromStart, equipped) {
    const vp = (Game.data.villagers || []).find(function (x) { return x.id === vid; }) || {};
    vp.items = items.map(function (it) {
      if (typeof it === 'string') return { itemId: it, units: 1 };
      return { itemId: it.id, units: it.units || 1 };
    });
    if (equipped) vp.equipped = equipped;
    else delete vp.equipped;
    var hv = Game.state.village.health || (Game.state.village.health = {});
    hv[vid] = health;
    if (allyVid) { hv[allyVid] = 100; }
    const opts = { allies: allyVid ? 1 : 0, allyVids: allyVid ? [allyVid] : [],
      allyFromStart: !!allyFromStart, rng: mulberry32(streamSeed) };
    return Game.fieldFight(vid, def, { hp: startHp, maxHp: maxHp }, opts);
  }
  function fsCommitted(rec) { return rec && rec.fsCommitMhp != null; }
  function sizeGateOk(rec) {
    return !fsCommitted(rec) || (rec.fsCommitMhp <= 3 * rec.fsCommitStrike && rec.fsEntryVhpFrac >= 0.60);
  }

  // --- V1: the 2 wild addressable shapes, re-driven with a real weapon ---
  // Wild strikes were 14 (influencer 76 HP) and 22 (herald 89 HP): post-contact
  // 62 > 3x14 and 67 > 3x22, so no commit — correct per the gate. With a
  // hunting spear the same entry HPs commit about half the time and kill
  // when they commit: the gate is live, the wild non-conversion was the
  // recorded weak strike, not a code failure. STRIKE CORRECTION (probe,
  // 2026-11-09): the spear's contact strike lands [19,23], not [34,38] —
  // wb = round((melee+ranged)/2) = 15 (fieldFights.js:613), so the commit
  // needs strike >= entry/4 (76 HP needs >= 19, 89 HP needs >= 22.25).
  // Thresholds below are set from that measured distribution (32 commits,
  // 29 kills on the first run), not from the pre-probe guess.
  const v1Cfgs = [
    { def: defs.influencer, hp: 76, max: 850, label: 'influencer-76' },
    { def: defs.herald, hp: 89, max: 700, label: 'herald-89' },
  ];
  let v1Commits = 0, v1Kills = 0, v1Bad = 0, v1Hold = 0, v1Fights = 0;
  for (const cfg of v1Cfgs) {
    for (let s = 1; s <= 30; s++) {
      const vid = roster[s % roster.length], allyVid = roster[(s + 1) % roster.length];
      let rec;
      try { rec = runFight(vid, ['hunting_spear'], cfg.def, cfg.hp, cfg.max, s * 104729 + cfg.hp, 100, allyVid, true); } catch (e) { continue; }
      v1Fights++;
      if (fsCommitted(rec)) {
        v1Commits++;
        if (!sizeGateOk(rec)) v1Bad++;
        if (rec.outcome === 'vKill') v1Kills++;
      }
      if (rec.fsHoldLogged) v1Hold++;
    }
  }
  check('V1 wild shapes with spear: commit fires (>=25/60)', v1Commits >= 25, { commits: v1Commits, fights: v1Fights });
  check('V1 wild shapes with spear: committed fights kill (>=25)', v1Kills >= 25, { kills: v1Kills, commits: v1Commits });
  check('V1 wild shapes with spear: every commit satisfies size gate', v1Bad === 0, { bad: v1Bad });
  console.log('V1 note: fsHoldLogged (commit changed a flee into a hold) = ' + v1Hold + ' / ' + v1Fights);

  // --- V2: volley-softened construction ---
  // Bow-ONLY fighter (bow + 4 arrows + ally) meets an audit at 180/200/220
  // HP of 1200 (15–18%). Bow-only is the shape the wild actually produces:
  // autoEquip puts a spear in the RANGED slot when one is carried (spears
  // score as ranged, range 2), so a bow+spear fighter never volleys at all
  // (probe, 2026-11-09: rec.volley null on 6/6 streams). The real volley
  // softens the beast below the break line; the contact + commit are judged
  // at FS sizing. The current code EXCLUDES volley-softened meetings from
  // the contact finish by design (mDealt === 0 required), so the expected
  // result is: the volley drops below break often, the reason recorded is
  // 'volley-damage', and FS commits are 0 — the window exists as meetings,
  // the gate never sees them.
  let v2VolleyBelow = 0, v2Contact = 0, v2Commits = 0, v2Kills = 0, v2Bad = 0, v2Hold = 0, v2Fights = 0, v2VolleyKills = 0, v2VolleyDamageWhy = 0;
  for (const hp of [180, 200, 220]) {
    for (let s = 1; s <= 30; s++) {
      const vid = roster[s % roster.length], allyVid = roster[(s + 1) % roster.length];
      let rec;
      try {
        rec = runFight(vid, ['bow', { id: 'arrow', units: 4 }], defs.audit, hp, 1200,
          s * 104729 + hp, 100, allyVid, true);
      } catch (e) { continue; }
      v2Fights++;
      const vdmg = (rec.volley && rec.volley.dmg) || 0;
      if (vdmg > 0 && (hp - vdmg) / 1200 < 0.15 && (hp - vdmg) > 0) v2VolleyBelow++;
      if (hp - vdmg <= 0) v2VolleyKills++;
      if (rec.contactFinishAttempted) v2Contact++;
      if (rec.fsNoCommitWhy === 'volley-damage') v2VolleyDamageWhy++;
      if (fsCommitted(rec)) {
        v2Commits++;
        if (!sizeGateOk(rec)) v2Bad++;
        if (rec.outcome === 'vKill') v2Kills++;
      }
      if (rec.fsHoldLogged) v2Hold++;
    }
  }
  check('V2 volley: the construction reaches the window (volley drops below break >=10/90)', v2VolleyBelow >= 10, { volleyBelow: v2VolleyBelow, fights: v2Fights, volleyKills: v2VolleyKills });
  check('V2 volley: volley-softened meetings are excluded by design (reason volley-damage >=1)', v2VolleyDamageWhy >= 1, { volleyDamageWhy: v2VolleyDamageWhy, volleyBelow: v2VolleyBelow });
  check('V2 volley: FS commit never fires on a volley-softened meeting', v2Commits === 0, { commits: v2Commits });
  check('V2 volley: every commit satisfies size gate', v2Bad === 0, { bad: v2Bad });
  console.log('V2 note: volley-below-break ' + v2VolleyBelow + ', contact attempted ' + v2Contact +
    ', FS commits ' + v2Commits + ', FS commit kills ' + v2Kills + ', fsHoldLogged ' + v2Hold + ' / ' + v2Fights);

  // --- V3: driven-crossing construction + negative control ---
  // Fighter meets an audit at 250/300 HP (above break) with a weak stick and
  // a middling spear. Measure the crossing rate; an FS commit must NEVER fire
  // on a beast met above the break line.
  let v3Crossed = 0, v3NearTail = 0, v3Kills = 0, v3Fs = 0, v3Fights = 0;
  const v3Cfgs = [
    { item: 'sharpened_stick', label: 'stick' },
    { item: 'fire-hardened_spear', label: 'firespear' },
  ];
  for (const wc of v3Cfgs) {
    for (const hp of [250, 300]) {
      for (let s = 1; s <= 30; s++) {
        const vid = roster[s % roster.length], allyVid = roster[(s + 1) % roster.length];
        let rec;
        try { rec = runFight(vid, [wc.item], defs.audit, hp, 1200, s * 104729 + hp, 100, allyVid, true); } catch (e) { continue; }
        v3Fights++;
        if (fsCommitted(rec)) v3Fs++;
        if ((rec.mHpLeft | 0) > 0 && (rec.mHpLeft / 1200) < 0.15) v3Crossed++;
        else if ((rec.mHpLeft | 0) > 0 && (rec.mHpLeft / 1200) >= 0.15 && (rec.mHpLeft / 1200) < 0.30) v3NearTail++;
        if (rec.outcome === 'vKill') v3Kills++;
      }
    }
  }
  check('V3 driven-crossing: FS commit never fires above break (negative control)', v3Fs === 0, { fs: v3Fs, fights: v3Fights });
  console.log('V3 note: crossed below break alive ' + v3Crossed + ', near-tail exits ' + v3NearTail +
    ', kills ' + v3Kills + ' / ' + v3Fights + ' (stick + firespear, audit 250/300 HP)');

  // --- V4: causal-channel leg ---
  // Herald 41 HP, fighter at 60 HP with a weak stick + ally: the commit fires
  // on some streams; count how often its morale suppression (fsHoldLogged)
  // actually changes a flee into a hold, and how many of those holds kill.
  let v4Commits = 0, v4Hold = 0, v4HoldKills = 0, v4Bad = 0, v4Fights = 0, v4Kills = 0;
  for (let s = 1; s <= 60; s++) {
    const vid = roster[s % roster.length], allyVid = roster[(s + 1) % roster.length];
    let rec;
    try { rec = runFight(vid, ['sharpened_stick'], defs.herald, 41, 800, s * 104729 + 41, 60, allyVid, true); } catch (e) { continue; }
    v4Fights++;
    if (fsCommitted(rec)) {
      v4Commits++;
      if (!sizeGateOk(rec)) v4Bad++;
      if (rec.outcome === 'vKill') v4Kills++;
    }
    if (rec.fsHoldLogged) {
      v4Hold++;
      if (rec.outcome === 'vKill') v4HoldKills++;
    }
  }
  check('V4 causal channel: every commit satisfies size gate', v4Bad === 0, { bad: v4Bad });
  console.log('V4 note: commits ' + v4Commits + ', fsHoldLogged ' + v4Hold + ', hold-kills ' + v4HoldKills +
    ', commit-kills ' + v4Kills + ' / ' + v4Fights + ' (herald 41 HP, fighter 60 HP, stick)');

  console.log(`vetfinish proof: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(function (e) { console.error('VETFINISH PROOF FAILED:', (e && e.stack) || e); process.exit(1); });
