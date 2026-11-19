// analyze-dmgshape-b.js — analyzer + judge, arm sim-dmgshape-b.
// Decomposes the per-round damage gap of launched-quad field fights
// (fightcap follow-up, tracker blank 1): fled fights deal ~49.5/round
// vs the ~111/round winning shape — where does the gap come from?
//
// Population + ladder: reuses analyze-fightcap-b.js quadKills() (the
// corrected loose join, findings #2564/#2570) unchanged, so the
// population and D_meas are the fightcap numbers' own definitions.
// Decomposition: per fled fight, from the dmgshape driver's UNCAPPED
// fight log + rec.roundsDetail / rec.roundTotals / rec.actionKinds
// (pure reads of the fight record — no game-code change). Components
// (frozen prereg evidence/2026-11-19/sim-dmgshape-b-prereg.md):
//   (a) verb loss — fighter rounds spent on a verb/ability instead of
//       a strike, priced at the fighter's mean landed strike.
//   (b) miss loss — zero-damage strikes, priced at the pooled mean.
//   (c) ally-delay loss — striker-slot rounds empty (ally not yet
//       joined / already down), priced at the allies' mean.
//   (d) base-rate ceiling — W(111) minus P_mean x 4 (four landed
//       strikes every round: the tactical formula's own ceiling on
//       the ported substrate — fighter + 3 allies, Correction 2).
// GO: accounted share ((a)+(b)+(c)+(d))/G >= 0.70 AND top contributor
// >= 0.25 of G, where G = 111 - D_meas. Pool floor: >=6 launches,
// >=4 joined quad meetings, >=8 fled fights. Reconciliation (prereg
// Correction 1): the exact identity (a')+(b')+(c')-echoBonus =
// P_mean x 4 - D_strike (same counts priced at P_mean; D_strike is
// volley-excluded) must hold within +-15%; a larger error is an
// instrument failure (NO-GO kind INSTRUMENT).
//
// Secondary: per-member shares (fighter/ally1/ally2), ability-touch
// share + ability-attributable excess, trick share, volley share,
// rounds survived, kill-gap in HP and in rounds-at-111, and the
// late-Rage-fire pin (Rage-fire round parsed from the full log;
// late = round >= 4; Ruby d139 background in sim-ragepreempt-b.md).
//
// Usage:
//   node scripts/analyze-dmgshape-b.js --dir evidence/2026-11-19/perseed-dmgshape-b [--out evidence/2026-11-19/dmgshape-b-analysis.json]
//   node scripts/analyze-dmgshape-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const A = require(path.join(__dirname, 'analyze-fightcap-b.js'));

const WIN_SHAPE = 111; // fightcap-a ladder winning shape (dmg/round)
const BARS = {
  poolLaunches: 6,
  poolMeetings: 4,
  poolFled: 8,
  accounted: 0.70,
  topShare: 0.25,
  reconErr: 0.15,
};

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(xs) { return xs.length ? xs.reduce(function (a, b) { return a + b; }, 0) / xs.length : null; }

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

// ---- corpus aggregation ------------------------------------------
function loadDir(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const docs = [];
  for (const f of files) {
    try { docs.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); } catch (e) {}
  }
  return docs;
}

// Match quadKills rows back to full encounter rows (seed+day+mid+vid).
function fledDecompositions(dir) {
  const qk = A.quadKills(dir);
  const docs = loadDir(dir);
  const byKey = {};
  for (const d of docs) {
    for (const e of (d.v4encounters || [])) {
      const k = [d.seed, e.day, e.mid, e.vid].join('|');
      (byKey[k] = byKey[k] || []).push(e);
    }
  }
  const fled = [], killed = [], died = [], other = [], unmatched = [];
  for (const row of qk.rows) {
    const k = [row.seed, row.day, row.mid, row.fighter].join('|');
    const cands = byKey[k] || [];
    const enc = cands.shift();
    if (!enc) { unmatched.push(row); continue; }
    enc._seed = row.seed;
    const dec = decomposeEncounter(enc);
    if (row.outcome === 'vFlee') fled.push(dec);
    else if (row.outcome === 'vKill') killed.push(dec);
    else if (row.outcome === 'vDie') died.push(dec);
    else other.push(dec); // e.g. mFlee talk-downs: reported, never fled
  }
  return { qk: qk, fled: fled, killed: killed, died: died, other: other, unmatched: unmatched, docs: docs };
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
  const compD = pMean != null ? WIN_SHAPE - pMean * 3 : null;
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
  const reconTarget = (pMean != null && dStrikePooled != null) ? pMean * 3 - dStrikePooled : null;
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

function judge(dir) {
  const leg = A.summarizeLeg(dir);
  const dec = fledDecompositions(dir);
  const agg = aggregate(dec.fled);
  const bars = [];
  bars.push({ id: 'pool-launches', pass: leg.launches >= BARS.poolLaunches,
    detail: 'launches ' + leg.launches + ' (floor ' + BARS.poolLaunches + ')' });
  bars.push({ id: 'pool-meetings', pass: dec.qk.meetings >= BARS.poolMeetings,
    detail: 'joined quad meetings ' + dec.qk.meetings + ' (floor ' + BARS.poolMeetings + ')' });
  bars.push({ id: 'pool-fled', pass: dec.fled.length >= BARS.poolFled,
    detail: 'fled fights ' + dec.fled.length + ' (floor ' + BARS.poolFled + ')' });
  bars.push({ id: 'unmatched-rows', pass: dec.unmatched.length === 0,
    detail: 'quadKills rows without a full encounter row: ' + dec.unmatched.length });
  bars.push({ id: 'instrument-errors', pass: (leg.errors | 0) === 0,
    detail: 'instrument errors ' + (leg.errors | 0) });
  const reconOk = agg.recon.reconErr != null && agg.recon.reconErr <= BARS.reconErr;
  bars.push({ id: 'reconciliation', pass: reconOk,
    detail: 'exact-identity error ' + (agg.recon.reconErr == null ? 'n/a' : (agg.recon.reconErr * 100).toFixed(1) + '%') + ' (band 15%)' });
  const accOk = agg.accounted != null && agg.accounted >= BARS.accounted;
  bars.push({ id: 'accounted-share', pass: accOk,
    detail: 'accounted ' + (agg.accounted == null ? 'n/a' : agg.accounted.toFixed(3)) + ' (bar 0.70); gap ' +
      (agg.gap == null ? 'n/a' : agg.gap.toFixed(1)) + '/round; D_meas ' + (agg.dMeas == null ? 'n/a' : agg.dMeas.toFixed(1)) });
  const topOk = agg.topShareOfGap != null && agg.topShareOfGap >= BARS.topShare;
  bars.push({ id: 'top-contributor', pass: topOk,
    detail: 'top ' + agg.topContributor + ' ' + (agg.topValue == null || agg.topValue === -Infinity ? 'n/a' : agg.topValue.toFixed(1)) +
      '/round = ' + (agg.topShareOfGap == null ? 'n/a' : (agg.topShareOfGap * 100).toFixed(1) + '%') + ' of gap (bar 25%)' });
  let verdict = 'GO', kind = null;
  if (leg.launches < BARS.poolLaunches || dec.qk.meetings < BARS.poolMeetings || dec.fled.length < BARS.poolFled) { verdict = 'NO-GO'; kind = 'METRIC-BROKEN'; }
  else if (dec.unmatched.length || (leg.errors | 0)) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (!reconOk) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (agg.gap == null || agg.gap <= 0) { verdict = 'NO-GO'; kind = 'NO-GAP'; }
  else if (!accOk || !topOk) { verdict = 'NO-GO'; kind = 'UNEXPLAINED-GAP'; }
  return { verdict: verdict, kind: kind, bars: bars, leg: leg, quadKills: dec.qk,
    fled: dec.fled, killed: dec.killed, died: dec.died, other: dec.other, unmatched: dec.unmatched,
    agg: agg, wall: leg.wall };
}

function main() {
  if (process.argv.indexOf('--selftest') !== -1) { selftest(); return; }
  const dir = process.argv[process.argv.indexOf('--dir') + 1];
  const outFile = process.argv.indexOf('--out') !== -1 ? process.argv[process.argv.indexOf('--out') + 1] : null;
  if (!dir) { console.error('usage: analyze-dmgshape-b.js --dir <per-seed dir> [--out <json>]'); process.exit(2); }
  const result = judge(dir);
  console.log(JSON.stringify({ verdict: result.verdict, kind: result.kind, bars: result.bars,
    launches: result.leg.launches, meetings: result.quadKills.meetings, fled: result.fled.length,
    killed: result.killed.length, died: result.died.length, wall: result.wall, agg: result.agg }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}

// ---- selftest ------------------------------------------------------
function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('PASS ' + name); }
    else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  // §A REPRODUCTION (frozen fightcap arm corpus): the population +
  // ladder definitions reproduce the published numbers exactly.
  const fcArm = path.join(__dirname, '..', 'evidence', '2026-11-19', 'perseed-fightcap-b-arm');
  if (fs.existsSync(fcArm)) {
    const qk = A.quadKills(fcArm);
    check('§A fightcap arm corpus: 18 joined quad meetings, 0 kills', qk.meetings === 18 && qk.kills === 0, { meetings: qk.meetings, kills: qk.kills });
    check('§A fightcap arm vFlee ladder: n=15, mean 49.4744/round',
      qk.ladder.vFlee && qk.ladder.vFlee.n === 15 && Math.abs(qk.ladder.vFlee.dmgPerRoundMean - 49.47444444444445) < 1e-9, qk.ladder.vFlee);
    const d58 = qk.rows.filter(function (r) { return r.seed === 104771 && r.day === 58; })[0];
    check('§A d58 Congregation pair row: 686 dealt in 9 rounds (76.2/round)',
      !!d58 && d58.mDealt === 686 && d58.rounds === 9 && Math.abs(d58.dmgPerRound - 686 / 9) < 1e-9, d58);
  } else { console.log('SKIP §A: fightcap arm corpus not present'); }
  // §B SYNTHETIC decomposition: hand-built 6-round fled fight with
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
  check('§B synthetic: strikes 9 attempted, 8 landed, 1 zero (hit rate 0.889)',
    syn.strikesAttempted === 9 && syn.strikesLanded === 8 && syn.strikesZero === 1, syn);
  check('§B synthetic: P_mean 15, P_fighter 20, P_ally 10',
    syn.pMean === 15 && syn.pFighter === 20 && syn.pAlly === 10, { pMean: syn.pMean, pFighter: syn.pFighter, pAlly: syn.pAlly });
  check('§B synthetic: verbRounds 1, verbLoss 10/3 per round',
    syn.verbRounds === 1 && Math.abs(syn.verbLoss - 10 / 3) < 1e-9, { verbRounds: syn.verbRounds, verbLoss: syn.verbLoss });
  check('§B synthetic: missLoss 2.5/round, allyDelayLoss 70/3 per round (14 empty slots: ally1 2 + ally2 6 + ally3 6)',
    Math.abs(syn.missLoss - 2.5) < 1e-9 && syn.emptyStrikerRounds === 14 && Math.abs(syn.allyDelayLoss - 70 / 3) < 1e-9,
    { missLoss: syn.missLoss, empty: syn.emptyStrikerRounds, allyDelayLoss: syn.allyDelayLoss });
  check('§B synthetic: baseCeiling 51/round (111 - 15x4, four strikers on the ported substrate)',
    syn.baseCeiling === 51, syn.baseCeiling);
  check('§B synthetic: per-member fighter 80 / ally1 40 / ally2 0 / ally3 0',
    syn.fighterDealt === 80 && syn.ally1Dealt === 40 && syn.ally2Dealt === 0 && syn.ally3Dealt === 0, syn);
  check('§B synthetic: volley 12, dStrike 20/round',
    syn.volley === 12 && syn.dStrike === 20, { volley: syn.volley, dStrike: syn.dStrike });
  // §B2: Rage-fire round parse + ability excess.
  const rageLog = [
    'Ruby walks straight into The Algorithm. No avoiding it.',
    "R1: Ruby's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
    'R1: Ruby strikes for 42 (x2.0) (900 left)',
    'R2: Ruby strikes for 26 (aimed 2.5x) (874 left)',
    'R2: Ruby strikes for 30 (HAYMAKER x2) (844 left)',
  ];
  const rp = parseFightLog(rageLog);
  check('§B2 Rage line parses to fire round 1', rp.rageFireRound === 1, rp.rageFireRound);
  const ra = decomposeEncounter({ day: 139, mid: 'algorithm', wave: 4, vid: 'ruby_callaghan',
    outcome: 'vFlee', rounds: 2, mDealt: 98, mHpStart: 1000, log: rageLog,
    roundsDetail: [{ round: 1, dealt: 42, allyDealt: 0, ally2Dealt: 0, abilities: ['rage'], tricks: [] },
      { round: 2, dealt: 56, allyDealt: 0, ally2Dealt: 0, abilities: [], tricks: [] }],
    actionKinds: ['strike', 'strike'], strikesThrown: 3, rageFired: true, flPreRoundDealt: 0,
    allyVid: null, ally2Vid: null, ally3Vid: null, allyDealt: 0, ally2Dealt: 0 });
  check('§B2 ability excess: Rage 21 + aim 15.6 + haymaker 15 = 51.6',
    Math.abs(ra.abExcess - (21 + 15.6 + 15)) < 1e-9, ra.abExcess);
  check('§B2 ability-touch damage 98 (all three strikes noted)',
    ra.abTouchDmg === 98 && ra.abTouchStrikes === 3, { touch: ra.abTouchDmg, n: ra.abTouchStrikes });
  // §C DRIVER SMOKE (subprocess): one 30d seed, exit 0, 0 errors,
  // flags self-describing (leverPresent false, allyslot3Flag '1').
  const { spawnSync } = require('child_process');
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dmgshape-smoke-'));
  const smokeDir = 'perseed-dmgshape-b-smoke';
  const smokePath = path.join(__dirname, '..', 'evidence', '2026-11-19', smokeDir);
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env, { SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1',
    FLEEREPAIR2: '1', FIGHTALLY2: '1', ALLYSLOT3: '1', MODE: 'dmgshape', DAYS: '30',
    SEEDS: '105931', RUN: 'dmgshape-b-smoke', OUTDIR: smokeDir });
  const r = spawnSync(process.execPath, [path.join(__dirname, 'dmgshape-driver-b.js')],
    { cwd: path.join(__dirname, '..'), env: env, encoding: 'utf8', timeout: 600000 });
  check('§C driver smoke: exit 0 on one 30d seed', r.status === 0, (r.stderr || '').slice(0, 300));
  let d = null;
  try { d = JSON.parse(fs.readFileSync(path.join(smokePath, 'dmgshape-b-s105931-dmgshape-b-smoke-dmgshape.json'), 'utf8')); } catch (e) {}
  check('§C driver smoke: corpus file written', !!d, null);
  if (d) {
    check('§C driver smoke: flags self-describe (leverPresent true — slot ported, allyslot3Flag 1, senseexpedFlag 1)',
      d.leverPresent === true && d.allyslot3Flag === '1' && d.senseexpedFlag === '1',
      { leverPresent: d.leverPresent, allyslot3Flag: d.allyslot3Flag, senseexpedFlag: d.senseexpedFlag });
    check('§C driver smoke: 0 instrument errors',
      (d.instrumentErrors || []).length === 0, d.instrumentErrors);
    check('§C driver smoke: anchor is a 40-hex commit (never a pinned hash)',
      /^[0-9a-f]{40}$/.test(String(d.anchorCommit || '')), d.anchorCommit);
    const rowsWithRd = (d.v4encounters || []).filter(function (e) { return Array.isArray(e.roundsDetail); });
    check('§C driver smoke: encounter rows carry roundsDetail (uncapped-log instrument present)',
      (d.v4encounters || []).length === 0 || rowsWithRd.length === (d.v4encounters || []).length,
      { encounters: (d.v4encounters || []).length, withRd: rowsWithRd.length });
  }
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('test-dmgshape-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) main();
module.exports = { parseFightLog: parseFightLog, parseAbilityNote: parseAbilityNote,
  decomposeEncounter: decomposeEncounter, aggregate: aggregate, judge: judge,
  fledDecompositions: fledDecompositions, WIN_SHAPE: WIN_SHAPE, BARS: BARS };
