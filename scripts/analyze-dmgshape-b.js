// analyze-dmgshape-b.js — analyzer + judge, arm sim-dmgshape-b (Loop B 0530Z run).
// The damage-per-launch re-measurement (finding #2605) on the DESIGNATED
// band 106181-106188: for every wave-4+ launch, the FIRST fight against
// the launch target (any origin, any fighter), decomposed against the
// 111/round winning shape.
// MERGED FILE (see the frozen prereg evidence/2026-11-20/sim-dmgshape-b-prereg.md):
// the decomposition (log-parsing, decomposeEncounter, aggregate,
// WIN_SHAPE) is moved in-file byte-identical from the 1230Z module — a
// literal copy of analyze-dmgshape-rerun-b.js over this file would
// self-import, since the rerun analyzer requires ./analyze-dmgshape-b.js
// for those functions. The selection/judging/selftest below are the
// rerun analyzer's, adapted to the dmgshape-b names. The 1230Z
// quadKills-based analyzeDir/judge is superseded (preserved in git
// history); its decomposition fixtures (§F synthetic, §F2 Rage/
// ability-excess, §F3 aggregate identity, §E fightcap reproduction)
// are retained in the selftest beside the rerun's §A selection / §B
// classification / §C judge fixtures.
// INSTRUMENT ONLY — no game code changes.
// Usage:
//   node scripts/analyze-dmgshape-b.js --dir evidence/2026-11-20/perseed-dmgshape-b [--out evidence/2026-11-20/dmgshape-b-analysis.json]
//   node scripts/analyze-dmgshape-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const FCB = require(path.join(__dirname, 'analyze-fightcap-b.js'));
const WIN_SHAPE = 111; // fightcap-a ladder winning shape (dmg/round)
const BARS = {
  poolFirstFights: 6, // launches with a first fight against the target
  poolFled: 4,         // fled first-fights (the judged decomposition set)
  classifiedShare: 0.90, // first-fights with >=1 landed strike (pMean != null)
  accounted: 0.70,
  topShare: 0.25,
  reconErr: 0.15,
};
const WINDOW_DAYS = 21;

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(xs) { return xs.length ? xs.reduce(function (a, b) { return a + b; }, 0) / xs.length : null; }

// Launches: v4departs rows with result 'launch', targetWave >= 4,
// target non-null — the survey's counting, all party sizes.
// ---- log parsing -------------------------------------------------
// Strike line shapes (src/js/fieldFights.js):
//   R{n}: {Name} strikes for {d} ({note}) ({hp} left)
//   R{n}: {Name} strikes again for {d} (...)  (extraAlly, [3,6], ally1)
//   R{n}: {Name} strikes again, louder — {d} (...)  (Live Broadcast echo, ally1)
// Join lines (no R prefix; sequential scan tracks the current round):
//   {F} is losing — shouts for help! {A1} charges in!
//   {F} is still losing — shouts again! {A2} charges in!
//   {F} is still losing — shouts a third time! {A3} charges in!
//   {A} is already at the door — charges in with {F}!
//   {A} is already at the door too — charges in with {F}!
// Down line (no R prefix): {Name} goes down!
// Rage line (godpath.js fieldAct): R{n}: {Name}'s eyes go red. Next 3
//   strikes hit twice as hard. (Rage)
// Volley lines: "  loosed — it takes {M} for {d} ({hp} left)."
//   and "  loosed wide — the arrow buries itself in the dirt. (spent)"
var RE_STRIKE = /^R(\d+): (.+?) strikes for (\d+)(.*)$/;
var RE_STRIKE_AGAIN = /^R(\d+): (.+?) strikes again for (\d+)(.*)$/;
var RE_STRIKE_ECHO = /^R(\d+): (.+?) strikes again, louder — (\d+)(.*)$/;
var RE_SHOUT1 = /^(.+?) is losing — shouts for help! (.+?) charges in!$/;
var RE_SHOUT2 = /^(.+?) is still losing — shouts again! (.+?) charges in!$/;
var RE_SHOUT3 = /^(.+?) is still losing — shouts a third time! (.+?) charges in!$/;
var RE_DOOR = /^(.+?) is already at the door(?: too)? — charges in with (.+?)!$/;
var RE_DOWN = /^(.+?) goes down!$/;
var RE_RAGE = /^R(\d+): .*eyes go red.*\(Rage\)/;
var RE_VOLLEY = /^\s+loosed — it takes .* for (\d+) /;
var RE_VOLLEY_MISS = /^\s+loosed wide /;
var RE_WALKIN = /^(.+?) (walks straight into|saw .* in time|was already waiting)/;

// Ability-note multipliers in a strike line's note (after stripping
// the trailing "(N left)"). Returns { mult, flat, touched, kinds }.
// Mult notes: aimed 2.5x, HAYMAKER x2, dead aim x2, debt settled 1.5x,
// GPf (xN.N) — incl. Rage doubling; halving: audited — half strength
// (x0.5), under review — un-taught (x0.7). Flat: stalker's opening +4,
// blood trail +2. Mirrored (0.85^(n-2), n unknown): touched only.
function parseAbilityNote(note) {
  const out = { mult: null, flat: 0, touched: false, kinds: [] };
  if (!note) return out;
  if (/aimed 2\.5x/.test(note)) { out.mult = 2.5; out.touched = true; out.kinds.push('aim'); }
  if (/HAYMAKER x2/.test(note)) { out.mult = 2; out.touched = true; out.kinds.push('haymaker'); }
  if (/dead aim x2/.test(note)) { out.mult = 2; out.touched = true; out.kinds.push('dead_aim'); }
  if (/debt settled 1\.5x/.test(note)) { out.mult = 1.5; out.touched = true; out.kinds.push('trade_of_blows'); }
  var gp = note.match(/\(x(\d+(?:\.\d+)?)\)/);
  if (gp) { out.mult = parseFloat(gp[1]); out.touched = true; out.kinds.push('godpath_x' + gp[1]); }
  if (/audited — half strength/.test(note)) { out.mult = 0.5; out.touched = true; out.kinds.push('audit_tax'); }
  if (/under review — un-taught/.test(note)) { out.mult = 0.7; out.touched = true; out.kinds.push('cancellation'); }
  if (/stalker's opening \+4/.test(note)) { out.flat += 4; out.touched = true; out.kinds.push('stalk'); }
  if (/blood trail \+2/.test(note)) { out.flat += 2; out.touched = true; out.kinds.push('blood_trail'); }
  if (/mirrored — worn thin/.test(note)) { out.touched = true; out.kinds.push('reunion_mirror'); }
  if (/bright frame — mirage miss/.test(note)) { out.touched = true; out.kinds.push('mirage_miss'); }
  return out;
}

function parseFightLog(log) {
  const lines = Array.isArray(log) ? log : [];
  const strikes = []; // {round, name, dmg, kind: strike|extra|echo, note, ab}
  let fighterName = null, currentRound = 0;
  const allyNames = {}; // slot -> name (ally1/ally2/ally3)
  const nameSlot = {}; // name -> slot
  const joinRound = {}; // slot -> round (1 = from start)
  const downRound = {}; // name -> round
  let rageFireRound = null, volleyDmg = 0, volleyShots = 0, volleyMiss = 0;
  let unmappedDown = 0;
  function slotForName(name) {
    if (name === fighterName) return 'fighter';
    return nameSlot[name] || 'unknown';
  }
  for (const raw of lines) {
    const line = String(raw);
    let m = line.match(/^R(\d+): /);
    if (m) currentRound = parseInt(m[1], 10);
    if ((m = line.match(RE_RAGE))) { rageFireRound = parseInt(m[1], 10); continue; }
    if ((m = line.match(RE_STRIKE_ECHO))) {
      strikes.push({ round: parseInt(m[1], 10), name: m[2], dmg: parseInt(m[3], 10), kind: 'echo', note: (m[4] || '').replace(/ \(\d+ left\)\s*$/, ''), ab: parseAbilityNote((m[4] || '').replace(/ \(\d+ left\)\s*$/, '')) });
      continue;
    }
    if ((m = line.match(RE_STRIKE_AGAIN))) {
      strikes.push({ round: parseInt(m[1], 10), name: m[2], dmg: parseInt(m[3], 10), kind: 'extra', note: (m[4] || '').replace(/ \(\d+ left\)\s*$/, ''), ab: parseAbilityNote((m[4] || '').replace(/ \(\d+ left\)\s*$/, '')) });
      continue;
    }
    if ((m = line.match(RE_STRIKE))) {
      const note = (m[4] || '').replace(/ \(\d+ left\)\s*$/, '');
      strikes.push({ round: parseInt(m[1], 10), name: m[2], dmg: parseInt(m[3], 10), kind: 'strike', note: note, ab: parseAbilityNote(note) });
      continue;
    }
    if ((m = line.match(RE_SHOUT1))) {
      if (!fighterName) fighterName = m[1];
      if (!allyNames.ally1) { allyNames.ally1 = m[2]; nameSlot[m[2]] = 'ally1'; joinRound.ally1 = currentRound + 1; }
      continue;
    }
    if ((m = line.match(RE_SHOUT2))) {
      if (!fighterName) fighterName = m[1];
      if (!allyNames.ally2) { allyNames.ally2 = m[2]; nameSlot[m[2]] = 'ally2'; joinRound.ally2 = currentRound + 1; }
      continue;
    }
    if ((m = line.match(RE_SHOUT3))) {
      if (!fighterName) fighterName = m[1];
      if (!allyNames.ally3) { allyNames.ally3 = m[2]; nameSlot[m[2]] = 'ally3'; joinRound.ally3 = currentRound + 1; }
      continue;
    }
    if ((m = line.match(RE_DOOR))) {
      const slot = !allyNames.ally1 ? 'ally1' : (!allyNames.ally2 ? 'ally2' : 'ally3');
      if (!allyNames[slot]) { allyNames[slot] = m[1]; nameSlot[m[1]] = slot; joinRound[slot] = 1; }
      if (!fighterName) fighterName = m[2];
      continue;
    }
    if ((m = line.match(RE_DOWN))) {
      downRound[m[1]] = currentRound;
      if (!nameSlot[m[1]] && m[1] !== fighterName) unmappedDown++;
      continue;
    }
    if ((m = line.match(RE_VOLLEY))) { volleyDmg += parseInt(m[1], 10); volleyShots++; continue; }
    if (RE_VOLLEY_MISS.test(line)) { volleyMiss++; volleyShots++; continue; }
    if (!fighterName && (m = line.match(RE_WALKIN))) { fighterName = m[1]; continue; }
  }
  // Fighter-name fallback: most frequent striker name.
  if (!fighterName && strikes.length) {
    const counts = {};
    for (const s of strikes) counts[s.name] = (counts[s.name] || 0) + 1;
    fighterName = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0];
  }
  for (const s of strikes) s.slot = slotForName(s.name);
  return { strikes: strikes, fighterName: fighterName, allyNames: allyNames,
    joinRound: joinRound, downRound: downRound, rageFireRound: rageFireRound,
    volleyDmg: volleyDmg, volleyShots: volleyShots, volleyMiss: volleyMiss,
    unmappedDown: unmappedDown, logLines: lines.length };
}

// ---- per-fight decomposition -------------------------------------
function decomposeEncounter(enc) {
  const rounds = enc.rounds | 0;
  const mDealt = enc.mDealt | 0;
  const mHpStart = (typeof enc.mHpStart === 'number' && isFinite(enc.mHpStart)) ? enc.mHpStart : null;
  const p = parseFightLog(enc.log || []);
  const rd = Array.isArray(enc.roundsDetail) ? enc.roundsDetail : [];
  // Per-member dealt from roundsDetail (engine numbers; fighter =
  // dealt - allyDealt, ally1 = allyDealt - ally2Dealt - ally3Dealt,
  // ally2 = ally2Dealt, ally3 = ally3Dealt). Falls back to the log
  // parse if roundsDetail is empty.
  let fighterDealt = 0, ally1Dealt = 0, ally2Dealt = 0, ally3Dealt = 0, rdRounds = 0;
  let abilityFiredRounds = 0, trickRounds = 0, trickCount = 0;
  for (const r of rd) {
    rdRounds++;
    fighterDealt += (r.dealt || 0) - (r.allyDealt || 0);
    ally1Dealt += (r.allyDealt || 0) - (r.ally2Dealt || 0) - (r.ally3Dealt || 0);
    ally2Dealt += (r.ally2Dealt || 0);
    ally3Dealt += (r.ally3Dealt || 0);
    if ((r.abilities || []).length) abilityFiredRounds++;
    if ((r.tricks || []).length) { trickRounds++; trickCount += r.tricks.length; }
  }
  const volley = (typeof enc.flPreRoundDealt === 'number') ? enc.flPreRoundDealt : p.volleyDmg;
  // Strike stats from the log parse.
  const strikes = p.strikes;
  const landed = strikes.filter(function (s) { return s.dmg > 0; });
  const zero = strikes.filter(function (s) { return s.dmg === 0; });
  const sumDmg = function (arr) { return arr.reduce(function (a, s) { return a + s.dmg; }, 0); };
  const landedDmg = sumDmg(landed);
  const pMean = landed.length ? landedDmg / landed.length : null;
  const fStrikes = strikes.filter(function (s) { return s.slot === 'fighter'; });
  const fLanded = fStrikes.filter(function (s) { return s.dmg > 0; });
  const pFighter = fLanded.length ? sumDmg(fLanded) / fLanded.length : null;
  const aStrikes = strikes.filter(function (s) { return s.slot === 'ally1' || s.slot === 'ally2' || s.slot === 'ally3'; });
  const aLanded = aStrikes.filter(function (s) { return s.dmg > 0; });
  const pAlly = aLanded.length ? sumDmg(aLanded) / aLanded.length : null;
  const echoStrikes = strikes.filter(function (s) { return s.kind === 'echo' || s.kind === 'extra'; });
  // Verb rounds from actionKinds (fighter actions in round order):
  // 'strike' entries are strike rounds; anything else is a verb round.
  let verbRounds = null, fighterStrikeRounds = null;
  if (Array.isArray(enc.actionKinds)) {
    fighterStrikeRounds = enc.actionKinds.filter(function (k) { return k === 'strike'; }).length;
    verbRounds = enc.actionKinds.length - fighterStrikeRounds;
  } else {
    // Fallback: rounds with no fighter strike line (log-only).
    const fRounds = {};
    for (const s of fStrikes) fRounds[s.round] = true;
    fighterStrikeRounds = Object.keys(fRounds).length;
    verbRounds = Math.max(0, rounds - fighterStrikeRounds);
  }
  // Empty striker-slot rounds (ally-delay): per ally slot, rounds
  // before the join round or after the down round. Slot presence
  // from the encounter row (allyVid/ally2Vid/ally3Vid); join round
  // from the log, falling back to the first roundsDetail round with
  // dealt > 0 for that slot.
  function emptyRoundsFor(slot, vidField, dealtField) {
    if (!enc[vidField]) return rounds; // slot never filled
    let jr = p.joinRound[slot];
    if (jr == null) {
      for (const r of rd) {
        if ((r[dealtField] || 0) > 0) { jr = r.round; break; }
      }
      if (jr == null) jr = 1; // present but never dealt: assume R1
    }
    let empty = Math.max(0, jr - 1);
    const name = p.allyNames[slot];
    const dr = name ? p.downRound[name] : null;
    if (dr != null) empty += Math.max(0, rounds - dr);
    return empty;
  }
  const emptyAlly1 = emptyRoundsFor('ally1', 'allyVid', 'allyDealt');
  const emptyAlly2 = emptyRoundsFor('ally2', 'ally2Vid', 'ally2Dealt');
  const emptyAlly3 = emptyRoundsFor('ally3', 'ally3Vid', 'ally3Dealt');
  // Four striker slots on the ported substrate (fighter + 3 allies);
  // the ceiling prices 4 landed strikes every round, so all three
  // ally slots' empty rounds enter the loss (prereg Correction 2).
  const emptyStrikerRounds = emptyAlly1 + emptyAlly2 + emptyAlly3;
  // Ability-touch + excess from strike notes.
  let abTouchDmg = 0, abExcess = 0, abTouchStrikes = 0;
  for (const s of strikes) {
    if (!s.ab.touched) continue;
    abTouchStrikes++;
    abTouchDmg += s.dmg;
    if (s.ab.mult != null && s.ab.mult !== 1 && s.dmg > 0) abExcess += s.dmg - s.dmg / s.ab.mult;
    abExcess += s.ab.flat;
  }
  const dpr = rounds > 0 ? mDealt / rounds : null;
  const dStrike = rounds > 0 ? (mDealt - volley) / rounds : null;
  // Frozen-definition components (per round, pooled denominators
  // applied at aggregation; here per fight).
  const verbLoss = (pFighter != null && rounds > 0) ? (verbRounds / rounds) * pFighter : null;
  const missLoss = (pMean != null && rounds > 0) ? (zero.length / rounds) * pMean : null;
  const allyDelayLoss = (pAlly != null && rounds > 0) ? (emptyStrikerRounds / rounds) * pAlly : null;
  const baseCeiling = (pMean != null) ? WIN_SHAPE - pMean * 4 : null;
  return { seed: enc._seed, day: enc.day, mid: enc.mid, wave: enc.wave, fighter: enc.vid,
    outcome: enc.outcome, rounds: rounds, mDealt: mDealt, mHpStart: mHpStart, dpr: dpr,
    volley: volley, volleyLog: p.volleyDmg, dStrike: dStrike,
    strikesAttempted: strikes.length, strikesLanded: landed.length, strikesZero: zero.length,
    hitRate: strikes.length ? landed.length / strikes.length : null,
    pMean: pMean, pFighter: pFighter, pAlly: pAlly,
    verbRounds: verbRounds, fighterStrikeRounds: fighterStrikeRounds,
    verbLoss: verbLoss, missLoss: missLoss,
    emptyAlly1: emptyAlly1, emptyAlly2: emptyAlly2, emptyAlly3: emptyAlly3,
    emptyStrikerRounds: emptyStrikerRounds, allyDelayLoss: allyDelayLoss,
    baseCeiling: baseCeiling,
    echoStrikes: echoStrikes.length, echoDmg: sumDmg(echoStrikes),
    fighterDealt: fighterDealt, ally1Dealt: ally1Dealt, ally2Dealt: ally2Dealt, ally3Dealt: ally3Dealt,
    rdRounds: rdRounds, rdDealtSum: fighterDealt + ally1Dealt + ally2Dealt + ally3Dealt,
    abTouchDmg: abTouchDmg, abTouchStrikes: abTouchStrikes, abExcess: abExcess,
    abilityFiredRounds: abilityFiredRounds, trickRounds: trickRounds, trickCount: trickCount,
    rageFired: !!enc.rageFired, rageFireRound: p.rageFireRound,
    strikesThrown: enc.strikesThrown != null ? enc.strikesThrown : null,
    logLines: p.logLines, unmappedDown: p.unmappedDown,
    joinRound: p.joinRound, fighterName: p.fighterName,
    killGapHp: mHpStart != null ? mHpStart - mDealt : null,
    killGapRoundsAt111: mHpStart != null ? (mHpStart - mDealt) / WIN_SHAPE : null };
}

function aggregate(fled) {
  const n = fled.length;
  const totalRounds = fled.reduce(function (a, f) { return a + f.rounds; }, 0);
  const totalDealt = fled.reduce(function (a, f) { return a + f.mDealt; }, 0);
  const totalVolley = fled.reduce(function (a, f) { return a + f.volley; }, 0);
  const totalAttempts = fled.reduce(function (a, f) { return a + f.strikesAttempted; }, 0);
  const totalLanded = fled.reduce(function (a, f) { return a + f.strikesLanded; }, 0);
  const totalZero = fled.reduce(function (a, f) { return a + f.strikesZero; }, 0);
  const totalVerb = fled.reduce(function (a, f) { return a + (f.verbRounds || 0); }, 0);
  const totalEmpty = fled.reduce(function (a, f) { return a + f.emptyStrikerRounds; }, 0);
  const totalEcho = fled.reduce(function (a, f) { return a + f.echoStrikes; }, 0);
  const totalAbTouch = fled.reduce(function (a, f) { return a + f.abTouchDmg; }, 0);
  const totalAbExcess = fled.reduce(function (a, f) { return a + f.abExcess; }, 0);
  const totalTricks = fled.reduce(function (a, f) { return a + f.trickCount; }, 0);
  const landedDmg = fled.reduce(function (a, f) { return a + (f.pMean != null ? f.pMean * f.strikesLanded : 0); }, 0);
  const pMean = totalLanded ? landedDmg / totalLanded : null;
  const dMeas = mean(fled.map(function (f) { return f.dpr; }));
  const dStrikePooled = totalRounds ? (totalDealt - totalVolley) / totalRounds : null;
  // Frozen components, pooled per-round rates:
  // (a) uses the pooled fighter mean: sum over fights of
  // verbRounds x pFighter / totalRounds.
  const verbLossNum = fled.reduce(function (a, f) { return a + (f.verbRounds || 0) * (f.pFighter || 0); }, 0);
  const missLossNum = fled.reduce(function (a, f) { return a + f.strikesZero * (f.pMean || 0); }, 0);
  const allyDelayNum = fled.reduce(function (a, f) { return a + f.emptyStrikerRounds * (f.pAlly || 0); }, 0);
  const compA = totalRounds ? verbLossNum / totalRounds : null;
  const compB = totalRounds ? missLossNum / totalRounds : null;
  const compC = totalRounds ? allyDelayNum / totalRounds : null;
  const compD = pMean != null ? WIN_SHAPE - pMean * 4 : null;
  const gap = dMeas != null ? WIN_SHAPE - dMeas : null;
  const accounted = (gap != null && gap > 0 && compA != null && compB != null && compC != null && compD != null)
    ? (compA + compB + compC + compD) / gap : null;
  const comps = { verbLoss: compA, missLoss: compB, allyDelayLoss: compC, baseCeiling: compD };
  let top = null, topVal = -Infinity;
  for (const k of Object.keys(comps)) { if (comps[k] != null && comps[k] > topVal) { top = k; topVal = comps[k]; } }
  // Reconciliation (Correction 1, exact identity): (a')+(b')+(c')
  // - echoBonus vs P_mean x 4 - D_strike, all pooled at P_mean.
  const aPrime = totalRounds ? (totalVerb / totalRounds) * pMean : null;
  const bPrime = totalRounds ? (totalZero / totalRounds) * pMean : null;
  const cPrime = totalRounds ? (totalEmpty / totalRounds) * pMean : null;
  const echoBonus = totalRounds ? (totalEcho / totalRounds) * pMean : null;
  const reconTarget = (pMean != null && dStrikePooled != null) ? pMean * 4 - dStrikePooled : null;
  const reconSum = (aPrime != null && bPrime != null && cPrime != null && echoBonus != null)
    ? aPrime + bPrime + cPrime - echoBonus : null;
  const reconErr = (reconSum != null && reconTarget != null && Math.abs(reconTarget) > 1e-9)
    ? Math.abs(reconSum - reconTarget) / Math.abs(reconTarget) : null;
  // Per-member shares (roundsDetail engine numbers).
  const fDealt = fled.reduce(function (a, f) { return a + f.fighterDealt; }, 0);
  const a1Dealt = fled.reduce(function (a, f) { return a + f.ally1Dealt; }, 0);
  const a2Dealt = fled.reduce(function (a, f) { return a + f.ally2Dealt; }, 0);
  const a3Dealt = fled.reduce(function (a, f) { return a + f.ally3Dealt; }, 0);
  const rdSum = fDealt + a1Dealt + a2Dealt + a3Dealt;
  const rageFights = fled.filter(function (f) { return f.rageFired; });
  const lateRage = rageFights.filter(function (f) { return f.rageFireRound != null && f.rageFireRound >= 4; });
  const rageNoRound = rageFights.filter(function (f) { return f.rageFireRound == null; });
  return { n: n, totalRounds: totalRounds, totalDealt: totalDealt, totalVolley: totalVolley,
    dMeas: dMeas, dStrikePooled: dStrikePooled, gap: gap,
    strikesAttempted: totalAttempts, strikesLanded: totalLanded, strikesZero: totalZero,
    hitRate: totalAttempts ? totalLanded / totalAttempts : null,
    attemptsPerRound: totalRounds ? totalAttempts / totalRounds : null,
    pMean: pMean, verbRounds: totalVerb, emptyStrikerRounds: totalEmpty, echoStrikes: totalEcho,
    components: comps, accounted: accounted, topContributor: top, topValue: topVal,
    topShareOfGap: (gap != null && gap > 0 && topVal !== -Infinity) ? topVal / gap : null,
    recon: { aPrime: aPrime, bPrime: bPrime, cPrime: cPrime, echoBonus: echoBonus,
      reconSum: reconSum, reconTarget: reconTarget, reconErr: reconErr },
    perMember: { fighter: fDealt, ally1: a1Dealt, ally2: a2Dealt, ally3: a3Dealt, total: rdSum,
      fighterShare: rdSum ? fDealt / rdSum : null, ally1Share: rdSum ? a1Dealt / rdSum : null,
      ally2Share: rdSum ? a2Dealt / rdSum : null, ally3Share: rdSum ? a3Dealt / rdSum : null },
    ability: { touchDmg: totalAbTouch, touchShare: totalDealt ? totalAbTouch / totalDealt : null,
      excess: totalAbExcess, excessShare: totalDealt ? totalAbExcess / totalDealt : null },
    tricks: { trickCount: totalTricks, trickRounds: fled.reduce(function (a, f) { return a + f.trickRounds; }, 0) },
    volleyShare: totalDealt ? totalVolley / totalDealt : null,
    roundsMedian: median(fled.map(function (f) { return f.rounds; })),
    roundsMean: mean(fled.map(function (f) { return f.rounds; })),
    killGapHpMean: mean(fled.map(function (f) { return f.killGapHp; }).filter(function (x) { return x != null; })),
    killGapRoundsMean: mean(fled.map(function (f) { return f.killGapRoundsAt111; }).filter(function (x) { return x != null; })),
    rage: { fights: rageFights.length, late: lateRage.length, noRound: rageNoRound.length,
      fireRounds: rageFights.map(function (f) { return { seed: f.seed, day: f.day, mid: f.mid, round: f.rageFireRound, rounds: f.rounds }; }) } };
}

function launchesOf(d) {
  const out = [];
  for (const r of (d.v4departs || [])) {
    if (r.result !== 'launch' || (r.targetWave | 0) < 4 || !r.target) continue;
    out.push({ seed: d.seed, day: r.day, vid: r.vid, target: r.target,
      targetWave: r.targetWave, party: [r.vid].concat(r.party || []),
      partySize: r.partySize != null ? r.partySize : ((r.party || []).length + 1),
      source: r.source || null });
  }
  return out;
}

// First fight against the launch target (frozen): the earliest
// v4encounters row with mid === launch.target (the monster TYPE id —
// the recorder carries no instance id), day in [launch.day,
// launch.day + 21], fought (rounds > 0 or mDealt > 0), ANY origin,
// ANY fighter. Earliest day wins; the first row in file order wins a
// same-day tie (the recorder appends chronologically, so a single
// forward scan with a strict < keeps the earliest). Returns null
// when no such row exists in the window.
function firstFight(d, launch) {
  let best = null;
  for (const e of (d.v4encounters || [])) {
    if (e.mid !== launch.target) continue;
    if (e.day < launch.day || e.day > launch.day + WINDOW_DAYS) continue;
    if ((e.rounds | 0) === 0 && (e.mDealt | 0) === 0) continue; // no-contact evade
    if (!best || e.day < best.day) best = e;
  }
  return best;
}

// Classification (frozen prereg gloss, see §"Classification" in the
// evidence): a first-fight is classified when it has >=1 landed
// strike (pMean != null) — something to price the components from.
// A 0-damage / 0-landed-strike fight is unclassified, never scored
// at zero. The strict reading (all four per-fight components
// non-null) is reported beside the judged share in analyzeDir:
// a fighter-only fight has pAlly null, so its ally-delay term is
// unpriceable per-fight (the frozen aggregate prices it at the
// pooled level) — the strict count would punish fights for being
// solo, which is the phenomenon, not an instrument gap.
function isClassified(dec) {
  return dec.pMean != null;
}
function isStrictClassified(dec) {
  return dec.verbLoss != null && dec.missLoss != null &&
    dec.allyDelayLoss != null && dec.baseCeiling != null;
}

// One per-seed file: every launch -> its first fight (or none).
function analyzeFile(d) {
  const launches = launchesOf(d);
  const rows = [];
  for (const launch of launches) {
    const fight = firstFight(d, launch);
    if (!fight) {
      rows.push({ seed: d.seed, launch: launch, fight: null, sameDay: false,
        dec: null, classified: false, strictClassified: false });
      continue;
    }
    const enc = Object.assign({}, fight);
    enc._seed = d.seed;
    const dec = decomposeEncounter(enc);
    rows.push({ seed: d.seed, launch: launch, fight: fight,
      sameDay: fight.day === launch.day, dec: dec,
      classified: isClassified(dec), strictClassified: isStrictClassified(dec) });
  }
  return { seed: d.seed, launches: launches.length, rows: rows };
}

// Aggregate one corpus dir.
function analyzeDir(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const perSeed = [];
  let rows = [];
  let errors = 0, filesRead = 0;
  const seeds = [];
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    filesRead++;
    seeds.push(d.seed);
    errors += ((d.instrumentErrors || []).length);
    const a = analyzeFile(d);
    rows = rows.concat(a.rows);
    perSeed.push({ seed: d.seed, launches: a.launches,
      firstFights: a.rows.filter(function (r) { return !!r.fight; }).length,
      fled: a.rows.filter(function (r) { return r.fight && r.fight.outcome === 'vFlee'; }).length,
      killed: a.rows.filter(function (r) { return r.fight && r.fight.outcome === 'vKill'; }).length,
      died: a.rows.filter(function (r) { return r.fight && r.fight.outcome === 'vDie'; }).length,
      other: a.rows.filter(function (r) { return r.fight && ['vFlee', 'vKill', 'vDie'].indexOf(r.fight.outcome) === -1; }).length,
      noFight: a.rows.filter(function (r) { return !r.fight; }).length });
  }
  const firstFights = rows.filter(function (r) { return !!r.fight; });
  const fledRows = firstFights.filter(function (r) { return r.fight.outcome === 'vFlee'; });
  const killedRows = firstFights.filter(function (r) { return r.fight.outcome === 'vKill'; });
  const diedRows = firstFights.filter(function (r) { return r.fight.outcome === 'vDie'; });
  const otherRows = firstFights.filter(function (r) { return ['vFlee', 'vKill', 'vDie'].indexOf(r.fight.outcome) === -1; });
  const fled = fledRows.map(function (r) { return r.dec; });
  const agg = aggregate(fled);
  // Exploratory (NOT the verdict): the same decomposition over ALL
  // first-fights regardless of outcome.
  const aggAll = aggregate(firstFights.map(function (r) { return r.dec; }));
  const classified = firstFights.filter(function (r) { return r.classified; }).length;
  const strictClassified = firstFights.filter(function (r) { return r.strictClassified; }).length;
  const distinctKeys = {};
  for (const r of firstFights) {
    distinctKeys[[r.seed, r.fight.day, r.fight.mid, r.fight.vid].join('|')] = true;
  }
  const byOrigin = {};
  const byOutcome = {};
  for (const r of firstFights) {
    byOrigin[r.fight.origin || 'null'] = (byOrigin[r.fight.origin || 'null'] || 0) + 1;
    byOutcome[r.fight.outcome || 'null'] = (byOutcome[r.fight.outcome || 'null'] || 0) + 1;
  }
  const sameDay = firstFights.filter(function (r) { return r.sameDay; }).length;
  return { dir: dir, files: filesRead, seeds: seeds, errors: errors,
    launches: rows.length, perSeed: perSeed, rows: rows,
    firstFights: firstFights.length, distinctFights: Object.keys(distinctKeys).length,
    fled: fledRows.length, killed: killedRows.length, died: diedRows.length, other: otherRows.length,
    noFight: rows.length - firstFights.length,
    classified: classified, strictClassified: strictClassified,
    classifiedShare: firstFights.length ? classified / firstFights.length : null,
    strictClassifiedShare: firstFights.length ? strictClassified / firstFights.length : null,
    byOrigin: byOrigin, byOutcome: byOutcome, sameDayFirstFights: sameDay,
    agg: agg, aggAll: aggAll };
}

function judge(a, leg) {
  const bars = [];
  const poolOk = a.firstFights >= BARS.poolFirstFights && a.fled >= BARS.poolFled;
  bars.push({ id: 'pool-first-fights', pass: a.firstFights >= BARS.poolFirstFights,
    detail: 'launches with a first fight against the target ' + a.firstFights + ' (floor ' + BARS.poolFirstFights + '); launches total ' + a.launches + '; distinct first-fight rows ' + a.distinctFights });
  bars.push({ id: 'pool-fled', pass: a.fled >= BARS.poolFled,
    detail: 'fled first-fights ' + a.fled + ' (floor ' + BARS.poolFled + '); killed ' + a.killed + ', died ' + a.died + ', other ' + a.other });
  bars.push({ id: 'instrument', pass: a.errors === 0 && a.files === 8,
    detail: 'instrument errors ' + a.errors + ' (bar 0); files ' + a.files + '/8' });
  const classPass = a.classifiedShare != null && a.classifiedShare >= BARS.classifiedShare;
  bars.push({ id: 'classification', pass: classPass,
    detail: 'classified first-fights ' + a.classified + '/' + a.firstFights + ' = ' + (a.classifiedShare == null ? 'n/a' : a.classifiedShare.toFixed(3)) + ' (bar >= ' + BARS.classifiedShare.toFixed(2) + '); strict-reading share ' + (a.strictClassifiedShare == null ? 'n/a' : a.strictClassifiedShare.toFixed(3)) + ' (' + a.strictClassified + '/' + a.firstFights + ')' });
  const reconOk = a.agg.recon.reconErr != null && a.agg.recon.reconErr <= BARS.reconErr;
  bars.push({ id: 'reconciliation', pass: reconOk,
    detail: 'exact-identity error ' + (a.agg.recon.reconErr == null ? 'n/a' : (a.agg.recon.reconErr * 100).toFixed(1) + '%') + ' (band 15%)' });
  const accOk = a.agg.accounted != null && a.agg.accounted >= BARS.accounted;
  bars.push({ id: 'accounted-share', pass: accOk,
    detail: 'accounted ' + (a.agg.accounted == null ? 'n/a' : a.agg.accounted.toFixed(3)) + ' (bar 0.70); gap ' +
      (a.agg.gap == null ? 'n/a' : a.agg.gap.toFixed(1)) + '/round; D_meas ' + (a.agg.dMeas == null ? 'n/a' : a.agg.dMeas.toFixed(1)) });
  const topOk = a.agg.topShareOfGap != null && a.agg.topShareOfGap >= BARS.topShare;
  bars.push({ id: 'top-contributor', pass: topOk,
    detail: 'top ' + a.agg.topContributor + ' ' + (a.agg.topValue == null || a.agg.topValue === -Infinity ? 'n/a' : a.agg.topValue.toFixed(1)) +
      '/round = ' + (a.agg.topShareOfGap == null ? 'n/a' : (a.agg.topShareOfGap * 100).toFixed(1) + '%') + ' of gap (bar 25%)' });
  let verdict = 'GO', kind = null;
  if (a.firstFights < BARS.poolFirstFights || a.fled < BARS.poolFled) { verdict = 'NO-GO'; kind = 'METRIC-BROKEN'; }
  else if (a.errors || a.files !== 8) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (!classPass) { verdict = 'NO-GO'; kind = 'METRIC-BROKEN'; }
  else if (!reconOk) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (a.agg.gap == null || a.agg.gap <= 0) { verdict = 'NO-GO'; kind = 'NO-GAP'; }
  else if (!accOk || !topOk) { verdict = 'NO-GO'; kind = 'UNEXPLAINED-GAP'; }
  return { verdict: verdict, kind: kind, bars: bars, leg: leg, agg: a.agg, aggAll: a.aggAll,
    wall: leg ? leg.wall : null };
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('PASS ' + name); }
    else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  // §A FIRST-FIGHT SELECTION (synthetic per-seed doc).
  function mkEnc(day, vid, mid, origin, outcome, rounds, mDealt) {
    return { day: day, vid: vid, mid: mid, wave: 4, origin: origin, outcome: outcome,
      rounds: rounds, mDealt: mDealt, mHpStart: 1000, log: [], roundsDetail: [],
      actionKinds: [], allyVid: null, ally2Vid: null, ally3Vid: null };
  }
  function mkLaunch(day, vid, target, wave) {
    return { day: day, vid: vid, result: 'launch', target: target, targetWave: wave || 4,
      party: ['c1', 'c2'], partySize: 3, source: 'brain' };
  }
  const d = {
    seed: 999002,
    instrumentErrors: [],
    v4departs: [
      mkLaunch(10, 'h1', 'eater'),
      mkLaunch(20, 'h2', 'audit'),
      mkLaunch(30, 'h3', 'herald'),
      mkLaunch(40, 'h4', 'reunion'),
      mkLaunch(42, 'h5', 'reunion'),
      mkLaunch(50, 'h6', 'eulogy'),
      mkLaunch(60, 'h7', 'cancellation', 5),
    ],
    v4encounters: [
      mkEnc(9, 'h1', 'eater', 'world-tick', 'vFlee', 2, 30),   // before window: excluded
      mkEnc(10, 'x1', 'eater', 'world-tick', 'vFlee', 3, 95),  // same-day, other party: SELECTED for h1
      mkEnc(12, 'h1', 'eater', 'expedition', 'vFlee', 4, 120), // later: not selected
      mkEnc(25, 'h2', 'audit', 'aid', 'vKill', 6, 400),        // SELECTED for h2 (killed)
      mkEnc(42, 'h2', 'audit', 'world-tick', 'vFlee', 2, 40),  // outside h2's window? d20+21=41: excluded
      mkEnc(45, 'h4', 'reunion', 'expedition', 'vFlee', 5, 200), // shared by h4 + h5
      mkEnc(52, 'h6', 'eulogy', 'world-tick', 'vFlee', 0, 0),  // no-contact evade: NOT a fight
      mkEnc(55, 'h6', 'eulogy', 'aid', 'vFlee', 1, 0),         // 0-damage fled: SELECTED, unclassified
      mkEnc(80, 'h7', 'cancellation', 'world-tick', 'vFlee', 3, 90), // outside h7's window (d60+21=81? 80 <= 81: INSIDE)
    ],
  };
  const a = analyzeFile(d);
  check('§A seven launches counted', a.launches === 7, a.launches);
  const byVid = {};
  for (const r of a.rows) byVid[r.launch.vid] = r;
  check('§A h1: same-day world-tick fight by another party is the first fight (day 10, origin world-tick, 95 dealt)',
    !!byVid.h1.fight && byVid.h1.fight.day === 10 && byVid.h1.fight.origin === 'world-tick' && byVid.h1.fight.mDealt === 95,
    byVid.h1.fight);
  check('§A h1: same-day flag set', byVid.h1.sameDay === true, byVid.h1.sameDay);
  check('§A h2: aid kill on d25 is the first fight (d42 row is outside the 21-day window)',
    !!byVid.h2.fight && byVid.h2.fight.day === 25 && byVid.h2.fight.outcome === 'vKill',
    byVid.h2.fight);
  check('§A h3: no herald fight in window, no first fight', byVid.h3.fight === null, byVid.h3.fight);
  check('§A h4+h5 share one first fight (d45 reunion)',
    !!byVid.h4.fight && !!byVid.h5.fight && byVid.h4.fight === byVid.h5.fight && byVid.h4.fight.day === 45,
    { h4: byVid.h4.fight && byVid.h4.fight.day, h5: byVid.h5.fight && byVid.h5.fight.day });
  check('§A h6: no-contact evade skipped, 0-damage aid fight on d55 is the first fight',
    !!byVid.h6.fight && byVid.h6.fight.day === 55 && byVid.h6.fight.mDealt === 0,
    byVid.h6.fight);
  check('§A h7: wave-5 cancellation fight on d80 is inside the 21-day window (d60+21=81)',
    !!byVid.h7.fight && byVid.h7.fight.day === 80 && byVid.h7.fight.mid === 'cancellation',
    byVid.h7.fight);
  // §B CLASSIFICATION: a fight with landed strikes classifies; a
  // 0-damage fight does not; a fighter-only fight classifies under
  // the frozen gloss (pMean != null) but not under the strict reading.
  const goodLog = [
    'Fighter walks straight into The Eater. No avoiding it.',
    'R1: Fighter strikes for 20 (980 left)',
    'R2: Fighter strikes for 18 (962 left)',
  ];
  const goodRd = [
    { round: 1, dealt: 20, allyDealt: 0, ally2Dealt: 0, abilities: [], tricks: [] },
    { round: 2, dealt: 18, allyDealt: 0, ally2Dealt: 0, abilities: [], tricks: [] },
  ];
  const goodDec = decomposeEncounter({ day: 10, mid: 'eater', wave: 4, vid: 'fighter',
    outcome: 'vFlee', rounds: 2, mDealt: 38, mHpStart: 1000, log: goodLog,
    roundsDetail: goodRd, actionKinds: ['strike', 'strike'],
    strikesThrown: 2, rageFired: false, flPreRoundDealt: 0,
    allyVid: null, ally2Vid: null, ally3Vid: null, allyDealt: 0, ally2Dealt: 0 });
  check('§B fighter-only fled fight: pMean 19, baseCeiling 35 (111-19x4)',
    goodDec.pMean === 19 && goodDec.baseCeiling === 35, { pMean: goodDec.pMean, baseCeiling: goodDec.baseCeiling });
  check('§B fighter-only fight classifies under the frozen gloss', isClassified(goodDec) === true, goodDec);
  check('§B fighter-only fight does NOT classify under the strict reading (pAlly null -> allyDelayLoss null)',
    isStrictClassified(goodDec) === false, { allyDelayLoss: goodDec.allyDelayLoss, pAlly: goodDec.pAlly });
  const zeroDec = decomposeEncounter({ day: 55, mid: 'eulogy', wave: 4, vid: 'fighter',
    outcome: 'vFlee', rounds: 1, mDealt: 0, mHpStart: 1000,
    log: ['Fighter walks straight into The Eulogy. No avoiding it.',
      'Fighter falls back — the fight is lost.'],
    roundsDetail: [{ round: 1, dealt: 0, allyDealt: 0, ally2Dealt: 0, abilities: [], tricks: [] }],
    actionKinds: ['ability'], strikesThrown: 0, rageFired: false, flPreRoundDealt: 0,
    allyVid: null, ally2Vid: null, ally3Vid: null, allyDealt: 0, ally2Dealt: 0 });
  check('§B 0-damage fled fight: pMean null, baseCeiling null', zeroDec.pMean == null && zeroDec.baseCeiling == null, zeroDec);
  check('§B 0-damage fight does not classify under either reading',
    isClassified(zeroDec) === false && isStrictClassified(zeroDec) === false, zeroDec);
  // §C JUDGE fixtures.
  function mkAgg(o) {
    return Object.assign({ dir: 'x', files: 8, seeds: [1], errors: 0, launches: 8,
      firstFights: 6, distinctFights: 6, fled: 5, killed: 1, died: 0, other: 0, noFight: 2,
      classified: 6, strictClassified: 4, classifiedShare: 1.0, strictClassifiedShare: 4 / 6,
      byOrigin: {}, byOutcome: {}, sameDayFirstFights: 0,
      agg: { gap: 80, dMeas: 31, accounted: 0.8, topContributor: 'baseCeiling',
        topValue: 40, topShareOfGap: 0.5, recon: { reconErr: 0.05 } },
      aggAll: { gap: 75, dMeas: 36, accounted: 0.75, topContributor: 'baseCeiling',
        topValue: 38, topShareOfGap: 0.5, recon: { reconErr: 0.05 } } }, o);
  }
  let j = judge(mkAgg({}), null);
  check('§C judge GO shape passes', j.verdict === 'GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(mkAgg({ firstFights: 5 }), null);
  check('§C judge METRIC-BROKEN below the first-fight floor (5 < 6)', j.verdict === 'NO-GO' && j.kind === 'METRIC-BROKEN', JSON.stringify(j));
  j = judge(mkAgg({ fled: 3 }), null);
  check('§C judge METRIC-BROKEN below the fled floor (3 < 4)', j.verdict === 'NO-GO' && j.kind === 'METRIC-BROKEN', JSON.stringify(j));
  j = judge(mkAgg({ classified: 4, classifiedShare: 4 / 6 }), null);
  check('§C judge NO-GO when classified share is 0.667 (< 0.90)', j.verdict === 'NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  j = judge(mkAgg({ errors: 1 }), null);
  check('§C judge INSTRUMENT on instrument errors', j.verdict === 'NO-GO' && j.kind === 'INSTRUMENT' && !j.bars[2].pass, JSON.stringify(j.bars));
  j = judge(mkAgg({ agg: { gap: 80, dMeas: 31, accounted: 0.8, topContributor: 'baseCeiling', topValue: 40, topShareOfGap: 0.5, recon: { reconErr: 0.20 } } }), null);
  check('§C judge INSTRUMENT when reconciliation error is 0.20 (> 0.15)', j.verdict === 'NO-GO' && j.kind === 'INSTRUMENT', JSON.stringify(j));
  j = judge(mkAgg({ agg: { gap: -5, dMeas: 116, accounted: 1.0, topContributor: 'baseCeiling', topValue: 40, topShareOfGap: 0.5, recon: { reconErr: 0.05 } } }), null);
  check('§C judge NO-GAP when the gap is <= 0', j.verdict === 'NO-GO' && j.kind === 'NO-GAP', JSON.stringify(j));
  j = judge(mkAgg({ agg: { gap: 80, dMeas: 31, accounted: 0.6, topContributor: 'baseCeiling', topValue: 40, topShareOfGap: 0.5, recon: { reconErr: 0.05 } } }), null);
  check('§C judge UNEXPLAINED-GAP when accounted is 0.60 (< 0.70)', j.verdict === 'NO-GO' && j.kind === 'UNEXPLAINED-GAP', JSON.stringify(j));
  // §E REPRODUCTION (frozen fightcap arm corpus): the population +
  // ladder definitions reproduce the published numbers exactly.
  const fcArm = path.join(__dirname, '..', 'evidence', '2026-11-19', 'perseed-fightcap-b-arm');
  if (fs.existsSync(fcArm)) {
    const qk = FCB.quadKills(fcArm);
    check('§E fightcap arm corpus: 18 joined quad meetings, 0 kills', qk.meetings === 18 && qk.kills === 0, { meetings: qk.meetings, kills: qk.kills });
    check('§E fightcap arm vFlee ladder: n=15, mean 49.4744/round',
      qk.ladder.vFlee && qk.ladder.vFlee.n === 15 && Math.abs(qk.ladder.vFlee.dmgPerRoundMean - 49.47444444444445) < 1e-9, qk.ladder.vFlee);
    const d58 = qk.rows.filter(function (r) { return r.seed === 104771 && r.day === 58; })[0];
    check('§E d58 Congregation pair row: 686 dealt in 9 rounds (76.2/round)',
      !!d58 && d58.mDealt === 686 && d58.rounds === 9 && Math.abs(d58.dmgPerRound - 686 / 9) < 1e-9, d58);
  } else { console.log('SKIP §E: fightcap arm corpus not present'); }
  // §F SYNTHETIC decomposition: hand-built 6-round fled fight with
  // known strikes / one verb round / one miss / ally joins R3.
  const synLog = [
    'Test Fighter walks straight into The Congregation. No avoiding it.',
    '  Test Fighter sees it coming and nocks an arrow — the fight opens at range (2 shots).',
    '  loosed — it takes The Congregation for 7 (992 left).',
    '  loosed — it takes The Congregation for 5 (987 left).',
    'R1: Test Fighter strikes for 20 (967 left)',
    'R1: Absolution hits Test Fighter for 10 (50 left)',
    'R2: Test Fighter strikes for 20 (947 left)',
    'R2: Absolution hits Test Fighter for 10 (40 left)',
    'Test Fighter is losing — shouts for help! Ally One charges in!',
    'R3: Test Fighter stops mid-fight and binds the wound — field medicine, +20 HP.',
    'R3: Ally One strikes for 10 (937 left)',
    'R3: Absolution hits Test Fighter for 10 (50 left)',
    'R4: Test Fighter strikes for 20 (917 left)',
    'R4: Ally One strikes for 10 (907 left)',
    'R4: Absolution hits Ally One for 8 (40 left)',
    'R5: Test Fighter strikes for 0 (bright frame — mirage miss) (907 left)',
    'R5: Ally One strikes for 10 (897 left)',
    'R5: Absolution hits Test Fighter for 10 (40 left)',
    'R6: Test Fighter strikes for 20 (877 left)',
    'R6: Ally One strikes for 10 (867 left)',
    'R6: Absolution hits Test Fighter for 10 (30 left)',
    'Test Fighter falls back — the fight is lost.',
  ];
  const synRd = [
    { round: 1, dealt: 20, allyDealt: 0, ally2Dealt: 0, abilities: [], tricks: [] },
    { round: 2, dealt: 20, allyDealt: 0, ally2Dealt: 0, abilities: [], tricks: [] },
    { round: 3, dealt: 10, allyDealt: 10, ally2Dealt: 0, abilities: [], tricks: [] },
    { round: 4, dealt: 30, allyDealt: 10, ally2Dealt: 0, abilities: [], tricks: [] },
    { round: 5, dealt: 10, allyDealt: 10, ally2Dealt: 0, abilities: [], tricks: [] },
    { round: 6, dealt: 30, allyDealt: 10, ally2Dealt: 0, abilities: [], tricks: [] },
  ];
  const syn = decomposeEncounter({ day: 1, mid: 'congregation', wave: 4, vid: 'test_fighter',
    outcome: 'vFlee', rounds: 6, mDealt: 132, mHpStart: 999, log: synLog, roundsDetail: synRd,
    actionKinds: ['strike', 'strike', 'ability', 'strike', 'strike', 'strike'],
    strikesThrown: 5, rageFired: false, flPreRoundDealt: 12,
    allyVid: 'ally_one', ally2Vid: null, ally3Vid: null, allyDealt: 40, ally2Dealt: 0 });
  check('§F synthetic: strikes 9 attempted, 8 landed, 1 zero (hit rate 0.889)',
    syn.strikesAttempted === 9 && syn.strikesLanded === 8 && syn.strikesZero === 1, syn);
  check('§F synthetic: P_mean 15, P_fighter 20, P_ally 10',
    syn.pMean === 15 && syn.pFighter === 20 && syn.pAlly === 10, { pMean: syn.pMean, pFighter: syn.pFighter, pAlly: syn.pAlly });
  check('§F synthetic: verbRounds 1, verbLoss 10/3 per round',
    syn.verbRounds === 1 && Math.abs(syn.verbLoss - 10 / 3) < 1e-9, { verbRounds: syn.verbRounds, verbLoss: syn.verbLoss });
  check('§F synthetic: missLoss 2.5/round, allyDelayLoss 70/3 per round (14 empty slots: ally1 2 + ally2 6 + ally3 6)',
    Math.abs(syn.missLoss - 2.5) < 1e-9 && syn.emptyStrikerRounds === 14 && Math.abs(syn.allyDelayLoss - 70 / 3) < 1e-9,
    { missLoss: syn.missLoss, empty: syn.emptyStrikerRounds, allyDelayLoss: syn.allyDelayLoss });
  check('§F synthetic: baseCeiling 51/round (111 - 15x4, four strikers on the ported substrate)',
    syn.baseCeiling === 51, syn.baseCeiling);
  check('§F synthetic: per-member fighter 80 / ally1 40 / ally2 0 / ally3 0',
    syn.fighterDealt === 80 && syn.ally1Dealt === 40 && syn.ally2Dealt === 0 && syn.ally3Dealt === 0, syn);
  check('§F synthetic: volley 12, dStrike 20/round',
    syn.volley === 12 && syn.dStrike === 20, { volley: syn.volley, dStrike: syn.dStrike });
  // §F3: the aggregate over the synthetic fight must satisfy the
  // exact identity (Correction 1, four strikers after Correction 2):
  // recon error 0, baseCeiling 51, accounted 80.17/89.
  const synAgg = aggregate([syn]);
  check('§F3 aggregate identity on the synthetic fight: recon error 0, baseCeiling 51/round',
    synAgg.recon.reconErr != null && synAgg.recon.reconErr < 1e-9 && synAgg.components.baseCeiling === 51,
    { reconErr: synAgg.recon.reconErr, baseCeiling: synAgg.components.baseCeiling });
  check('§F3 aggregate accounted share 80.17/89 = 0.901 on the synthetic fight',
    synAgg.accounted != null && Math.abs(synAgg.accounted - 80.16666666666667 / 89) < 1e-9, synAgg.accounted);
  // §F2: Rage-fire round parse + ability excess.
  const rageLog = [
    'Ruby walks straight into The Algorithm. No avoiding it.',
    "R1: Ruby's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
    'R1: Ruby strikes for 42 (x2.0) (900 left)',
    'R2: Ruby strikes for 26 (aimed 2.5x) (874 left)',
    'R2: Ruby strikes for 30 (HAYMAKER x2) (844 left)',
  ];
  const rp = parseFightLog(rageLog);
  check('§F2 Rage line parses to fire round 1', rp.rageFireRound === 1, rp.rageFireRound);
  const ra = decomposeEncounter({ day: 139, mid: 'algorithm', wave: 4, vid: 'ruby_callaghan',
    outcome: 'vFlee', rounds: 2, mDealt: 98, mHpStart: 1000, log: rageLog,
    roundsDetail: [{ round: 1, dealt: 42, allyDealt: 0, ally2Dealt: 0, abilities: ['rage'], tricks: [] },
      { round: 2, dealt: 56, allyDealt: 0, ally2Dealt: 0, abilities: [], tricks: [] }],
    actionKinds: ['strike', 'strike'], strikesThrown: 3, rageFired: true, flPreRoundDealt: 0,
    allyVid: null, ally2Vid: null, ally3Vid: null, allyDealt: 0, ally2Dealt: 0 });
  check('§F2 ability excess: Rage 21 + aim 15.6 + haymaker 15 = 51.6',
    Math.abs(ra.abExcess - (21 + 15.6 + 15)) < 1e-9, ra.abExcess);
  check('§F2 ability-touch damage 98 (all three strikes noted)',
    ra.abTouchDmg === 98 && ra.abTouchStrikes === 3, { touch: ra.abTouchDmg, n: ra.abTouchStrikes });
  // §D DRIVER SMOKE (subprocess): one 30d seed on the designated
  // band, exit 0, 0 errors, flags self-describing, port present.
  const { spawnSync } = require('child_process');
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dmgshape-smoke-'));
  const smokeDir = 'perseed-dmgshape-b-smoke';
  const smokePath = path.join(__dirname, '..', 'evidence', '2026-11-20', smokeDir);
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env, { SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1',
    FLEEREPAIR2: '1', FIGHTALLY2: '1', ALLYSLOT3: '1', LAUNCHSURVIVE: '1', MODE: 'dmgshape', DAYS: '30',
    SEEDS: '106181', RUN: 'dmgshape-b-smoke', OUTDIR: smokeDir });
  const r = spawnSync(process.execPath, [path.join(__dirname, 'dmgshape-driver-b.js')],
    { cwd: path.join(__dirname, '..'), env: env, encoding: 'utf8', timeout: 600000 });
  check('§D driver smoke: exit 0 on one 30d seed', r.status === 0, (r.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(smokePath, 'dmgshape-b-s106181-dmgshape-b-smoke-dmgshape.json'), 'utf8')); } catch (e) {}
  check('§D driver smoke: corpus file written', !!dd, null);
  if (dd) {
    check('§D driver smoke: flags self-describe (leverPresent true — slot ported, allyslot3Flag 1, senseexpedFlag 1, launchTrackOn true)',
      dd.leverPresent === true && dd.allyslot3Flag === '1' && dd.senseexpedFlag === '1' && dd.launchTrackOn === true,
      { leverPresent: dd.leverPresent, allyslot3Flag: dd.allyslot3Flag, senseexpedFlag: dd.senseexpedFlag, launchTrackOn: dd.launchTrackOn });
    check('§D driver smoke: 0 instrument errors',
      (dd.instrumentErrors || []).length === 0, dd.instrumentErrors);
    check('§D driver smoke: anchor is a 40-hex commit (never a pinned hash)',
      /^[0-9a-f]{40}$/.test(String(dd.anchorCommit || '')), dd.anchorCommit);
    check('§D driver smoke: arm label is dmgshape-b',
      dd.arm === 'dmgshape-b', dd.arm);
    const rowsWithRd = (dd.v4encounters || []).filter(function (e) { return Array.isArray(e.roundsDetail); });
    check('§D driver smoke: encounter rows carry roundsDetail (uncapped-log instrument present)',
      (dd.v4encounters || []).length === 0 || rowsWithRd.length === (dd.v4encounters || []).length,
      { encounters: (dd.v4encounters || []).length, withRd: rowsWithRd.length });
  }
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('analyze-dmgshape-b selftest: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  let dir = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!dir) { console.error('usage: analyze-dmgshape-b.js --dir DIR [--out FILE] | --selftest'); process.exit(2); }
  const a = analyzeDir(dir);
  const leg = FCB.summarizeLeg(dir);
  const j = judge(a, leg);
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars, analysis: a,
    wall: leg.wall, medianDays: leg.medianDays, launches: leg.launches, errors: leg.errors };
  console.log(JSON.stringify({ verdict: j.verdict, kind: j.kind, bars: j.bars,
    launches: a.launches, firstFights: a.firstFights, distinctFights: a.distinctFights,
    fled: a.fled, killed: a.killed, died: a.died, other: a.other, noFight: a.noFight,
    classified: a.classified, classifiedShare: a.classifiedShare,
    strictClassified: a.strictClassified, strictClassifiedShare: a.strictClassifiedShare,
    byOrigin: a.byOrigin, byOutcome: a.byOutcome, sameDayFirstFights: a.sameDayFirstFights,
    agg: a.agg, aggAll: a.aggAll, wall: leg.wall, medianDays: leg.medianDays }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}

module.exports = { parseFightLog: parseFightLog, parseAbilityNote: parseAbilityNote,
  decomposeEncounter: decomposeEncounter, aggregate: aggregate,
  launchesOf: launchesOf, firstFight: firstFight, isClassified: isClassified,
  isStrictClassified: isStrictClassified, analyzeFile: analyzeFile, analyzeDir: analyzeDir,
  judge: judge, WIN_SHAPE: WIN_SHAPE, BARS: BARS, WINDOW_DAYS: WINDOW_DAYS, selftest: selftest };
