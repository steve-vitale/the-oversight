// analyze-leaderhpgate-b.js — analyzer + frozen-bar judge, arm
// sim-leaderhpgate-b (finding #2619: the LEADER-HP GATE — a pinned
// quad does not walk into a wave-4+ door with its LEADER below 25
// HP, the floor being one round of focused wave-4 damage; the
// hpgate-b §5 sense test showed the flee the whole-party gate
// avoided was really the LEADER collapsing, while the trigger
// member was never hit).
//
// THE METRIC FIX IS THE POINT OF THIS ARM (hpgate-b §9-§10): the
// hpgate leg-total bars (P2 door kills, B1 pin delivery as written)
// punished a door-avoiding lever for avoiding doors, and one gate
// fire rewrote a seed's whole future. This analyzer prices the
// gate DOOR BY DOOR, not by leg totals:
//   D1 (PRIMARY, per-door): flee rate on LEADER-sub-25 FOUGHT
//      doors (leaderEntryHp < 25 — the doors the leader gate could
//      touch): armed rate <= control rate - 20pp. The flee COUNT
//      is a secondary only.
//   D2 kill rate per FOUGHT door: armed vKill rate >= control
//      rate - 2pp (a RATE, not leg-total kills — the armed leg may
//      fight fewer doors because it avoided some).
//   D3 damage guard (carried P3, repriced): armed TOTAL damage per
//      fought door >= 0.9x control.
//   D4 mechanism engagement: armed leaderhpgateFires >= 1 — the
//      lever must fire at least once to be judged a lever at all.
//   D5 substrate: every file carries anchorCommit == frozen base,
//      policySha 1884c8852d38, pinquadFlag '1', dmgpinFlag '1',
//      doorflee2Flag '1', hypofloorFlag '1' AND hpgateFlag '1'
//      (BOTH legs — the control IS the hpgate armed configuration),
//      leaderhpgateFlag null (control) / '1' (armed),
//      leaderhpgateFires a number, gateAvoidNotes an array.
// M5 (balanced panel) and M6 (evidence file) are judged outside
// this file.
// The door definition and the freshness judges are REUSED from the
// shared analyzer (scripts/analyze-pinquaddoor-b.js) — isDoorFight,
// freshDoorKill, deriveDoorEntryHp, dealtBound — never
// re-implemented here. B1 is reported as a RATE ONLY (secondary):
// the shared b1NonInferiority's >= 3-armed-row floor is dropped
// deliberately — hpgate-b §10 showed the floor is structurally
// unreachable for a door-avoiding lever on a thin band.
//
// Secondaries (REPORTED, not binding): S1 hold census, S2 matched
// -pair conversion census (door-scoped), S3 leader-death census,
// S4 B1 rate, S5 door-fight table, S6 wall numbers (evidence file,
// not this analyzer), S7 sub-floor census (leader-sub-25 doors),
// S8 gate-fire census (both gates), S9 avoided-doors census with
// attribution (gate fire vs trajectory divergence, via the
// gateAvoidNotes), S10 leader-projection census (NEW: per fought
// door, the leader's projected HP after one/two rounds of focused
// wave-4 damage at 25/round — the hypofloor §4 rate — plus the
// fired doors' projections from their notes).
//
// Usage:
//   node scripts/analyze-leaderhpgate-b.js --control <dir> --armed <dir> --anchor <40-hex> [--json]
//   node scripts/analyze-leaderhpgate-b.js --selftest
// Exit 0 iff every computed bar passes; exit 1 otherwise (or exit 2
// on a usage/instrument error).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const shared = require(path.join(__dirname, 'analyze-pinquaddoor-b.js'));
const isDoorFight = shared.isDoorFight;
const freshDoorKill = shared.freshDoorKill;

const POLICY_SHA12 = '1884c8852d38';
// Focused wave-4 damage per round (hypofloor-b §4: the d110 monster
// hits 22-25 a round, all on the leader). The projection uses the
// top of the range (25) — the conservative read for "the leader is
// about to die".
const FOCUSED_DMG_PER_ROUND = 25;
// Leader-projection bands, on leader entry HP at the door:
//   dead1: projected-dead after ONE round (entry <= 25 — the gate's
//     own floor, by construction).
//   dead2: projected-dead after TWO rounds (26-50).
//   collapse2: projected at-or-below the floor after two rounds
//     (51-75 — the d57 Patrick case at 67 HP, and the d110 Diana
//     case at 71 HP, both sit here).
//   safe: projected above the floor after two rounds (> 75).
function projectionBand(leaderEntryHp) {
  if (leaderEntryHp == null) return 'unknown';
  if (leaderEntryHp <= 25) return 'dead1';
  if (leaderEntryHp <= 50) return 'dead2';
  if (leaderEntryHp <= 75) return 'collapse2';
  return 'safe';
}

function readCorpusDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  const out = [];
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out.push({ file: f, data: data });
  }
  return out;
}

function foughtDoors(corpora) {
  const rows = [];
  for (const c of corpora) {
    for (const e of (c.data.v4encounters || [])) {
      if (isDoorFight(e) && (e.rounds | 0) >= 1) rows.push({ seed: c.data.seed, file: c.file, row: e });
    }
  }
  return rows;
}

function doorStats(corpora) {
  const fought = foughtDoors(corpora);
  const stats = {
    files: corpora.length, fought: fought.length,
    vFlee: 0, vKill: 0, mFlee: 0, vDie: 0, other: 0,
    fleeRate: null, killRate: null, killsFresh: 0, kills: [],
    dealt: 0, rounds: 0, dmgPerRound: null, dmgPerDoor: null,
    doorHold: 0, everHopeless: 0, holdFights: 0,
    ally3Vid: 0, ally3Dealt: 0, ally3DealtMax: 0,
    // D1 population: fought doors whose LEADER entered below 25 HP
    // (the doors the leader gate could touch).
    leaderSub25: 0, leaderSub25Flee: 0, leaderSub25Kill: 0,
    leaderSub25FleeRate: null, leaderSub25KillRate: null,
    // S10: leader-projection bands over fought doors.
    projBands: { dead1: 0, dead2: 0, collapse2: 0, safe: 0, unknown: 0 },
    rows: [],
  };
  for (const d of fought) {
    const e = d.row;
    if (e.outcome === 'vFlee') stats.vFlee++;
    else if (e.outcome === 'vKill') stats.vKill++;
    else if (e.outcome === 'mFlee') stats.mFlee++;
    else if (e.outcome === 'vDie') stats.vDie++;
    else stats.other++;
    stats.dealt += (e.mDealt | 0);
    stats.rounds += (e.rounds | 0);
    stats.doorHold += (typeof e.doorHold === 'number' ? e.doorHold : 0);
    if (e.everHopeless) stats.everHopeless++;
    if ((typeof e.doorHold === 'number' ? e.doorHold : 0) > 0) stats.holdFights++;
    if (e.ally3Vid) stats.ally3Vid++;
    if (typeof e.ally3Dealt === 'number') {
      stats.ally3Dealt += e.ally3Dealt;
      if (e.ally3Dealt > stats.ally3DealtMax) stats.ally3DealtMax = e.ally3Dealt;
    }
    const fk = freshDoorKill(e, 500);
    if (fk.fresh) { stats.killsFresh++; stats.kills.push({ seed: d.seed, day: e.day, mid: e.mid, entryHp: fk.entryHp, method: fk.method }); }
    const leh = (typeof e.leaderEntryHp === 'number' ? e.leaderEntryHp : null);
    const band = projectionBand(leh);
    stats.projBands[band]++;
    if (leh != null && leh < 25) {
      stats.leaderSub25++;
      if (e.outcome === 'vFlee') stats.leaderSub25Flee++;
      if (e.outcome === 'vKill') stats.leaderSub25Kill++;
    }
    stats.rows.push({
      seed: d.seed, day: e.day, mid: e.mid, wave: e.wave, rounds: e.rounds, outcome: e.outcome,
      dealt: e.mDealt, dmgPerRound: e.rounds > 0 ? +(e.mDealt / e.rounds).toFixed(1) : null,
      fleeHpFrac: (e.fleeHpFrac != null ? e.fleeHpFrac : null),
      everHopeless: !!e.everHopeless, doorHold: (typeof e.doorHold === 'number' ? e.doorHold : 0),
      ally3Vid: !!e.ally3Vid, ally3Dealt: (typeof e.ally3Dealt === 'number' ? e.ally3Dealt : null),
      leaderEntryHp: leh, projBand: band,
      projHp1: leh == null ? null : leh - FOCUSED_DMG_PER_ROUND,
      projHp2: leh == null ? null : leh - 2 * FOCUSED_DMG_PER_ROUND,
    });
  }
  stats.fleeRate = stats.fought > 0 ? stats.vFlee / stats.fought : null;
  stats.killRate = stats.fought > 0 ? stats.vKill / stats.fought : null;
  stats.dmgPerRound = stats.rounds > 0 ? stats.dealt / stats.rounds : null;
  stats.dmgPerDoor = stats.fought > 0 ? stats.dealt / stats.fought : null;
  stats.leaderSub25FleeRate = stats.leaderSub25 > 0 ? stats.leaderSub25Flee / stats.leaderSub25 : null;
  stats.leaderSub25KillRate = stats.leaderSub25 > 0 ? stats.leaderSub25Kill / stats.leaderSub25 : null;
  return stats;
}

function wave4KillRate(corpora) {
  let n = 0, k = 0;
  for (const c of corpora) {
    for (const e of (c.data.v4encounters || [])) {
      if (((e.wave | 0) >= 4)) { n++; if (e.outcome === 'vKill') k++; }
    }
  }
  return { n: n, k: k, rate: n > 0 ? k / n : null };
}

// B2 (carried from the dmgpin bars, same subset): ally3Dealt over the
// PINNED wave-4+ v4encounters rows (any rounds/outcome).
function pinnedWave4Ally3(corpora) {
  let n = 0, total = 0, max = 0;
  for (const c of corpora) {
    for (const e of (c.data.v4encounters || [])) {
      if (e.pinned && ((e.wave | 0) >= 4)) {
        n++;
        if (typeof e.ally3Dealt === 'number') {
          total += e.ally3Dealt;
          if (e.ally3Dealt > max) max = e.ally3Dealt;
        }
      }
    }
  }
  return { n: n, total: total, max: max };
}

// S2 — the conversion census (REPORTED, not binding): matched-seed door
// pairs (same seed + day + monster). For each control vFlee door with a
// same-key armed row: armed vKill = a conversion; armed vFlee at MORE
// rounds = a later flee; armed identical outcome+rounds = no change;
// anything else = other.
function conversions(controlCorpora, armedCorpora) {
  const ctl = foughtDoors(controlCorpora);
  const arm = foughtDoors(armedCorpora);
  const armByKey = {};
  for (const d of arm) armByKey[d.seed + '|' + d.row.day + '|' + d.row.mid] = d.row;
  const out = { pairs: 0, conversions: 0, laterFlees: 0, noChange: 0, other: 0, list: [] };
  for (const d of ctl) {
    if (d.row.outcome !== 'vFlee') continue;
    const a = armByKey[d.seed + '|' + d.row.day + '|' + d.row.mid];
    if (!a) continue;
    out.pairs++;
    let kind = null;
    if (a.outcome === 'vKill') kind = 'conversion';
    else if (a.outcome === 'vFlee' && (a.rounds | 0) > (d.row.rounds | 0)) kind = 'laterFlee';
    else if (a.outcome === d.row.outcome && (a.rounds | 0) === (d.row.rounds | 0)) kind = 'noChange';
    else kind = 'other';
    if (kind === 'conversion') out.conversions++;
    else if (kind === 'laterFlee') out.laterFlees++;
    else if (kind === 'noChange') out.noChange++;
    else out.other++;
    out.list.push({ seed: d.seed, day: d.row.day, mid: d.row.mid, kind: kind,
      controlRounds: d.row.rounds, armedRounds: a.rounds,
      controlOutcome: d.row.outcome, armedOutcome: a.outcome });
  }
  return out;
}

function substrateCheck(corpora, leg, anchor) {
  const bad = [];
  for (const c of corpora) {
    const d = c.data;
    const wantLeader = leg === 'armed' ? '1' : null;
    if (d.anchorCommit !== anchor) bad.push(c.file + ': anchorCommit ' + String(d.anchorCommit).slice(0, 12) + ' != ' + String(anchor).slice(0, 12));
    if (String(d.policySha || '').slice(0, 12) !== POLICY_SHA12) bad.push(c.file + ': policySha ' + String(d.policySha));
    if (d.pinquadFlag !== '1') bad.push(c.file + ': pinquadFlag ' + JSON.stringify(d.pinquadFlag));
    if (d.dmgpinFlag !== '1') bad.push(c.file + ': dmgpinFlag ' + JSON.stringify(d.dmgpinFlag));
    if (d.doorflee2Flag !== '1') bad.push(c.file + ': doorflee2Flag ' + JSON.stringify(d.doorflee2Flag) + ' want "1" (both legs carry the hold)');
    if (d.hypofloorFlag !== '1') bad.push(c.file + ': hypofloorFlag ' + JSON.stringify(d.hypofloorFlag) + ' want "1" (both legs carry the floor — the control IS the hypofloor armed configuration)');
    if (d.hpgateFlag !== '1') bad.push(c.file + ': hpgateFlag ' + JSON.stringify(d.hpgateFlag) + ' want "1" (both legs carry the whole-party gate — the control IS the hpgate armed configuration)');
    if ((d.leaderhpgateFlag || null) !== wantLeader) bad.push(c.file + ': leaderhpgateFlag ' + JSON.stringify(d.leaderhpgateFlag) + ' want ' + JSON.stringify(wantLeader));
    if (typeof d.leaderhpgateFires !== 'number') bad.push(c.file + ': leaderhpgateFires ' + JSON.stringify(d.leaderhpgateFires) + ' want a number (driver stamps the agency-state counter)');
    if (typeof d.hpgateFires !== 'number') bad.push(c.file + ': hpgateFires ' + JSON.stringify(d.hpgateFires) + ' want a number (driver stamps the agency-state counter)');
    if (!Array.isArray(d.gateAvoidNotes)) bad.push(c.file + ': gateAvoidNotes ' + JSON.stringify(d.gateAvoidNotes) + ' want an array (driver parses the gate-avoid encounter notes)');
    if (!d.slotPresent || !d.pinPresent) bad.push(c.file + ': slotPresent/pinPresent ' + JSON.stringify(d.slotPresent) + '/' + JSON.stringify(d.pinPresent));
  }
  return { files: corpora.length, bad: bad, pass: bad.length === 0 };
}

// S8 — the gate-fire censuses (REPORTED, the direct evidence): the
// agency-state counters summed over each leg's files, for both gates.
function gateFires(corpora, field) {
  let n = 0;
  for (const c of corpora) n += (c.data[field] | 0);
  return n;
}
// S8b — the gate-avoid notes census: the parsed encounter notes per
// leg, split by gate kind ('hold' = whole-party gate, 'lead' =
// leader gate). The note is the only persisted evidence of a fired
// gate — the meeting leaves no fight row.
function gateNotes(corpora) {
  const out = { hold: 0, lead: 0, list: [] };
  for (const c of corpora) {
    for (const n of (c.data.gateAvoidNotes || [])) {
      if (n.kind === 'lead') out.lead++;
      else if (n.kind === 'hold') out.hold++;
      out.list.push({ seed: c.data.seed, mid: n.mid, name: n.name, kind: n.kind, hp: n.hp, note: n.note || null });
    }
  }
  return out;
}
// S9 — the avoided-doors census (REPORTED, never proof on its own):
// control fought doors with NO armed row on the same seed + day +
// monster, ATTRIBUTED where the armed leg's gate notes name the
// same seed + monster: 'lead' = the leader gate fired on that door,
// 'hold' = the whole-party gate fired on it, 'divergence' = no
// gate note — trajectory divergence dropped the row.
function avoidedDoors(controlCorpora, armedCorpora) {
  const ctl = foughtDoors(controlCorpora);
  const arm = foughtDoors(armedCorpora);
  const armKeys = {};
  for (const d of arm) armKeys[d.seed + '|' + d.row.day + '|' + d.row.mid] = true;
  const armNotesBySeedMid = {};
  for (const c of armedCorpora) {
    for (const n of (c.data.gateAvoidNotes || [])) {
      armNotesBySeedMid[c.data.seed + '|' + n.mid] = n.kind;
    }
  }
  const out = { n: 0, lead: 0, hold: 0, divergence: 0, list: [] };
  for (const d of ctl) {
    if (!armKeys[d.seed + '|' + d.row.day + '|' + d.row.mid]) {
      out.n++;
      const attr = armNotesBySeedMid[d.seed + '|' + d.row.mid] || 'divergence';
      if (attr === 'lead') out.lead++;
      else if (attr === 'hold') out.hold++;
      else out.divergence++;
      out.list.push({ seed: d.seed, day: d.row.day, mid: d.row.mid, controlOutcome: d.row.outcome, controlRounds: d.row.rounds, attribution: attr });
    }
  }
  return out;
}
// S10 — the leader-projection census (REPORTED, the diagnostic): per
// fought door, the leader's projected HP after one/two rounds of
// focused wave-4 damage (25/round); per fired door (gate note), the
// fired member's projection. For 'lead' notes the HP IS the
// leader's; for 'hold' notes it is the fired member's (the leader's
// HP on that door is unknown from the note alone — reported as
// member HP, never attributed to the leader).
function projection(corpora) {
  const fought = foughtDoors(corpora);
  const bands = { dead1: 0, dead2: 0, collapse2: 0, safe: 0, unknown: 0 };
  const foughtList = [];
  for (const d of fought) {
    const leh = (typeof d.row.leaderEntryHp === 'number' ? d.row.leaderEntryHp : null);
    const band = projectionBand(leh);
    bands[band]++;
    foughtList.push({ seed: d.seed, day: d.row.day, mid: d.row.mid, outcome: d.row.outcome,
      leaderEntryHp: leh, projHp1: leh == null ? null : leh - FOCUSED_DMG_PER_ROUND,
      projHp2: leh == null ? null : leh - 2 * FOCUSED_DMG_PER_ROUND, band: band });
  }
  const fired = [];
  for (const c of corpora) {
    for (const n of (c.data.gateAvoidNotes || [])) {
      fired.push({ seed: c.data.seed, mid: n.mid, name: n.name, kind: n.kind, hp: n.hp,
        projHp1: n.hp - FOCUSED_DMG_PER_ROUND, projHp2: n.hp - 2 * FOCUSED_DMG_PER_ROUND,
        projectedDead1: n.hp - FOCUSED_DMG_PER_ROUND <= 0,
        projectedDead2: n.hp - 2 * FOCUSED_DMG_PER_ROUND <= 0,
        // Only a 'lead' note's HP is known to be the leader's.
        leaderKnown: n.kind === 'lead' });
    }
  }
  return { foughtBands: bands, fought: foughtList, fired: fired };
}

// The frozen-bar judge. Returns { bars, pass } and prints nothing
// (callers print). M5/M6 are NOT computed here.
function judge(controlDir, armedDir, anchor) {
  const control = readCorpusDir(controlDir);
  const armed = readCorpusDir(armedDir);
  const cs = doorStats(control);
  const as = doorStats(armed);
  const ckr = wave4KillRate(control);
  const akr = wave4KillRate(armed);
  const cB2 = pinnedWave4Ally3(control);
  const aB2 = pinnedWave4Ally3(armed);
  const subC = substrateCheck(control, 'control', anchor);
  const subA = substrateCheck(armed, 'armed', anchor);
  const conv = conversions(control, armed);
  const cNotes = gateNotes(control);
  const aNotes = gateNotes(armed);
  const projC = projection(control);
  const projA = projection(armed);
  // D1 (PRIMARY, per-door): flee rate on leader-sub-25 FOUGHT
  // doors. Unmeasurable when either leg's pool is empty — the
  // pre-registered expectation is an EMPTY control pool (HPGATE,
  // on both legs, already refuses every leader-sub-25 door, so no
  // such door is ever fought on the control leg). An empty pool is
  // a failed bar, not a pass: the gate has nothing to price.
  const d1 = {
    controlN: cs.leaderSub25, armedN: as.leaderSub25,
    controlFlees: cs.leaderSub25Flee, armedFlees: as.leaderSub25Flee,
    controlRate: cs.leaderSub25FleeRate, armedRate: as.leaderSub25FleeRate,
    rateDropPp: (cs.leaderSub25FleeRate != null && as.leaderSub25FleeRate != null)
      ? (cs.leaderSub25FleeRate - as.leaderSub25FleeRate) * 100 : null,
    reason: null, pass: false,
  };
  if (cs.leaderSub25 === 0 || as.leaderSub25 === 0) {
    d1.reason = 'unmeasurable: leader-sub-25 fought-door pool empty (control ' + cs.leaderSub25 + ', armed ' + as.leaderSub25 + ') — HPGATE already refuses these doors';
    d1.pass = false;
  } else {
    d1.pass = (cs.leaderSub25FleeRate - as.leaderSub25FleeRate) >= 0.20;
    d1.reason = d1.pass ? null : 'flee-rate drop below 20pp';
  }
  // D2 (per-door kill rate, NOT leg-total kills): armed vKill rate
  // per fought door >= control rate - 2pp.
  const d2 = {
    armedKillRate: as.killRate, controlKillRate: cs.killRate,
    armedKills: as.vKill, controlKills: cs.vKill,
    armedFought: as.fought, controlFought: cs.fought,
    pass: as.killRate != null && cs.killRate != null && as.killRate >= cs.killRate - 0.02,
    reason: null,
  };
  if (as.fought === 0 || cs.fought === 0) { d2.pass = false; d2.reason = 'unmeasurable: a leg fought 0 doors'; }
  // D3 (carried P3, repriced): TOTAL damage per fought door.
  const d3 = {
    armedDmgPerDoor: as.dmgPerDoor, controlDmgPerDoor: cs.dmgPerDoor,
    armedDmgPerRound: as.dmgPerRound, controlDmgPerRound: cs.dmgPerRound,
    pass: as.dmgPerDoor != null && cs.dmgPerDoor != null && as.dmgPerDoor >= 0.9 * cs.dmgPerDoor,
    reason: null,
  };
  if (as.dmgPerDoor == null || cs.dmgPerDoor == null) { d3.pass = false; d3.reason = 'unmeasurable: a leg fought 0 doors'; }
  // D4 mechanism engagement: the leader gate must fire at least
  // once. Pre-registered expectation: 0 — the leader floor is
  // subsumed by the whole-party floor on the same leg (see prereg).
  const d4 = {
    armedLeaderFires: gateFires(armed, 'leaderhpgateFires'),
    controlLeaderFires: gateFires(control, 'leaderhpgateFires'),
    armedHpFires: gateFires(armed, 'hpgateFires'),
    controlHpFires: gateFires(control, 'hpgateFires'),
    pass: false, reason: null,
  };
  d4.pass = d4.armedLeaderFires >= 1;
  if (!d4.pass) d4.reason = 'the leader gate never fired (0 marginal fires — subsumed by HPGATE)';
  const bars = {
    D1: d1, D2: d2, D3: d3, D4: d4,
    D5: { control: subC, armed: subA, pass: subC.pass && subA.pass },
    // Secondaries (reported, not binding): B1 rate only (the >= 3
    // armed-row floor is dropped — see header), B2, B3a.
    B1rate: { armedRate: as.fought > 0 ? as.ally3Vid / as.fought : null,
      controlRate: cs.fought > 0 ? cs.ally3Vid / cs.fought : null,
      armedRows: as.ally3Vid, controlRows: cs.ally3Vid,
      pass: as.fought > 0 && cs.fought > 0 && (as.ally3Vid / as.fought) >= (cs.ally3Vid / cs.fought) - 0.10 },
    B2: { armedAlly3Dealt: aB2.total, armedAlly3DealtMax: aB2.max, armedPinnedWave4Rows: aB2.n,
      controlAlly3Dealt: cB2.total, controlAlly3DealtMax: cB2.max, controlPinnedWave4Rows: cB2.n,
      pass: aB2.total > 0 && aB2.max >= 10 },
    B3a: { armedRate: akr.rate, controlRate: ckr.rate, armedN: akr.n, controlN: ckr.n,
      armedK: akr.k, controlK: ckr.k,
      pass: akr.rate != null && ckr.rate != null && akr.rate >= ckr.rate - 0.02 },
  };
  const pass = bars.D1.pass && bars.D2.pass && bars.D3.pass && bars.D4.pass && bars.D5.pass;
  return {
    control: cs, armed: as,
    controlKillRate: ckr, armedKillRate: akr,
    conversions: conv,
    controlGateFires: gateFires(control, 'hpgateFires'),
    armedGateFires: gateFires(armed, 'hpgateFires'),
    controlLeaderFires: gateFires(control, 'leaderhpgateFires'),
    armedLeaderFires: gateFires(armed, 'leaderhpgateFires'),
    controlGateNotes: cNotes, armedGateNotes: aNotes,
    avoided: avoidedDoors(control, armed),
    controlProjection: projC, armedProjection: projA,
    bars: bars, pass: pass,
  };
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('PASS ' + name); }
    else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  const ANCHOR = 'a'.repeat(40);
  function file(seed, leg, rows, extra) {
    const d = Object.assign({
      seed: seed, anchorCommit: ANCHOR, policySha: POLICY_SHA12 + 'deadbeef',
      pinquadFlag: '1', dmgpinFlag: '1', doorflee2Flag: '1',
      hypofloorFlag: '1', hpgateFlag: '1',
      hpgateFires: leg === 'armed' ? 1 : 1,
      leaderhpgateFlag: leg === 'armed' ? '1' : null,
      leaderhpgateFires: leg === 'armed' ? 0 : 0,
      gateAvoidNotes: [],
      slotPresent: true, pinPresent: true, instrumentErrors: [],
      v4encounters: rows,
    }, extra || {});
    return d;
  }
  function doorRow(o) {
    return Object.assign({
      day: 100, vid: 'h1', mid: 'algorithm', wave: 4, origin: 'expedition',
      allyFromStart: true, pinned: true, pinnedAllies: ['c1', 'c2', 'c3'],
      allyVids: ['c1', 'c2', 'c3'], allyVid: 'c1', ally2Vid: 'c2', ally3Vid: 'c3',
      ally3Dealt: 50, rounds: 3, outcome: 'vFlee', mDealt: 300, vTaken: 40,
      fleeHpFrac: 0.35, everHopeless: true, doorHold: 0, leaderEntryHp: 100,
      roundsDetail: [{ round: 1, mHpStart: 1000 }], flPreRoundDealt: 0,
      mHpStartRec: 1000, log: ['R1: h1 strikes for 40 (960 left)'],
    }, o || {});
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'leaderhpgate-analyze-'));
  try {
    // §A — the EXPECTED production shape: control fights 4 doors,
    // all with healthy leaders (min entry 46); armed identical.
    // D1's pool is empty on both legs -> D1 fails as unmeasurable.
    const ctlA = [
      doorRow({ day: 90, outcome: 'vFlee', leaderEntryHp: 67 }),
      doorRow({ day: 91, outcome: 'vKill', rounds: 5, mDealt: 1100, leaderEntryHp: 71, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'] }),
      doorRow({ day: 92, outcome: 'vKill', rounds: 6, mDealt: 1000, leaderEntryHp: 83, roundsDetail: [{ round: 1, mHpStart: 950 }], flPreRoundDealt: 50, mHpStartRec: 1000, log: ['R1: h1 strikes for 40 (960 left)', 'R6: c3 strikes for 50 (0 left)'] }),
      doorRow({ day: 93, outcome: 'mFlee', rounds: 1, mDealt: 0, doorHold: 0, everHopeless: false, leaderEntryHp: 46 }),
    ];
    const cDir = path.join(tmp, 'ctl'), aDir = path.join(tmp, 'arm');
    fs.mkdirSync(cDir); fs.mkdirSync(aDir);
    fs.writeFileSync(path.join(cDir, 'c1.json'), JSON.stringify(file(1, 'control', ctlA)));
    fs.writeFileSync(path.join(aDir, 'a1.json'), JSON.stringify(file(1, 'armed', ctlA)));
    const jA = judge(cDir, aDir, ANCHOR);
    check('§A expected shape: control leader-sub-25 pool is 0 (healthy leaders only) — D1 fails as unmeasurable, not as a lever failure',
      jA.bars.D1.pass === false && jA.bars.D1.controlN === 0 && jA.bars.D1.armedN === 0 && /unmeasurable/.test(jA.bars.D1.reason || ''), jA.bars.D1);
    check('§A expected shape: D4 fails (leader gate never fired, 0 marginal fires)',
      jA.bars.D4.pass === false && jA.bars.D4.armedLeaderFires === 0, jA.bars.D4);
    check('§A expected shape: identical legs tie D2 (kill rate) and D3 (damage) — both pass',
      jA.bars.D2.pass === true && jA.bars.D3.pass === true, { D2: jA.bars.D2, D3: jA.bars.D3 });
    check('§A expected shape: D5 substrate passes (hpgateFlag 1 both legs, leaderhpgateFlag null/1, gateAvoidNotes array)',
      jA.bars.D5.pass === true, jA.bars.D5);
    check('§A expected shape: S10 bands read healthy leaders (0 dead1, 1 dead2 at 46, 2 collapse2 at 67/71, 1 safe at 83)',
      jA.control.projBands.dead1 === 0 && jA.control.projBands.dead2 === 1 && jA.control.projBands.collapse2 === 2 && jA.control.projBands.safe === 1, jA.control.projBands);
    check('§A expected shape: judge overall FAIL (D1 + D4 miss)',
      jA.pass === false, jA.bars);
    // §B — D1 GO math (synthetic only: a band where leader-sub-25
    // doors ARE fought on both legs — impossible under HPGATE, but
    // the judge must price it if it ever happens): control 3 flees
    // / 4 sub-25 doors, armed 0 flees / 4 — 75pp drop, D1 passes.
    const ctlB = [];
    for (let i = 0; i < 3; i++) ctlB.push(doorRow({ day: 90 + i, outcome: 'vFlee', leaderEntryHp: 21 }));
    ctlB.push(doorRow({ day: 93, outcome: 'vKill', rounds: 5, mDealt: 1100, leaderEntryHp: 24, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'] }));
    const armB = ctlB.map(function (r) {
      return Object.assign({}, r, { outcome: 'vKill', rounds: 5, mDealt: 1100, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'] });
    });
    const cBDir = path.join(tmp, 'ctlb'), aBDir = path.join(tmp, 'armb');
    fs.mkdirSync(cBDir); fs.mkdirSync(aBDir);
    fs.writeFileSync(path.join(cBDir, 'c1.json'), JSON.stringify(file(1, 'control', ctlB, { hpgateFires: 0 })));
    fs.writeFileSync(path.join(aBDir, 'a1.json'), JSON.stringify(file(1, 'armed', armB, { hpgateFires: 0, leaderhpgateFires: 4, gateAvoidNotes: [] })));
    const jB = judge(cBDir, aBDir, ANCHOR);
    check('§B D1 GO math: control 3/4 flees vs armed 0/4 on leader-sub-25 doors — 75pp drop, D1 passes',
      jB.bars.D1.pass === true && jB.bars.D1.controlN === 4 && jB.bars.D1.armedN === 4 && jB.bars.D1.rateDropPp === 75, jB.bars.D1);
    check('§B D4 passes when the leader gate fired (4 marginal fires)',
      jB.bars.D4.pass === true && jB.bars.D4.armedLeaderFires === 4, jB.bars.D4);
    check('§B D2 per-door kill rate: armed 4/4 vs control 1/4 — passes',
      jB.bars.D2.pass === true && jB.bars.D2.armedKillRate === 1, jB.bars.D2);
    check('§B the GO-shaped synthetic passes all computed bars',
      jB.pass === true, jB.bars);
    check('§B S10: all 4 control doors are dead1 (entry 21/24)',
      jB.control.projBands.dead1 === 4, jB.control.projBands);
    // §C — D2 rate regression: armed kills 0/4 vs control 3/4.
    const armC = ctlB.map(function (r) { return Object.assign({}, r, { outcome: 'vFlee', rounds: 2 }); });
    const aCDir = path.join(tmp, 'armc');
    fs.mkdirSync(aCDir);
    fs.writeFileSync(path.join(aCDir, 'a1.json'), JSON.stringify(file(1, 'armed', armC, { leaderhpgateFires: 1 })));
    const jC = judge(cBDir, aCDir, ANCHOR);
    check('§C D2 regression: armed kill rate 0 vs control 0.25 — D2 fails',
      jC.bars.D2.pass === false && jC.bars.D2.armedKillRate === 0, jC.bars.D2);
    // §D — D3 damage regression: armed deals 100/door vs control ~600.
    const armD = armB.map(function (r) { return Object.assign({}, r, { mDealt: 100, rounds: 1 }); });
    const aDDir = path.join(tmp, 'armd');
    fs.mkdirSync(aDDir);
    fs.writeFileSync(path.join(aDDir, 'a1.json'), JSON.stringify(file(1, 'armed', armD, { leaderhpgateFires: 1 })));
    const jD = judge(cBDir, aDDir, ANCHOR);
    check('§D D3 regression: armed 100/door vs control ~600/door — D3 fails',
      jD.bars.D3.pass === false && jD.bars.D3.armedDmgPerDoor === 100, jD.bars.D3);
    // §E — substrate: armed file without leaderhpgateFlag.
    const badFile = file(1, 'armed', armB);
    delete badFile.leaderhpgateFlag;
    const aBadDir = path.join(tmp, 'armbad');
    fs.mkdirSync(aBadDir);
    fs.writeFileSync(path.join(aBadDir, 'a1.json'), JSON.stringify(badFile));
    const jE = judge(cBDir, aBadDir, ANCHOR);
    check('§E substrate: armed file without leaderhpgateFlag — D5 fails and names the file',
      jE.bars.D5.pass === false && jE.bars.D5.armed.bad.length === 1 && /leaderhpgateFlag/.test(jE.bars.D5.armed.bad[0]), jE.bars.D5);
    // §E2 — substrate: control file with hpgateFlag null (both legs
    // must carry the whole-party gate).
    const badHp = file(1, 'control', ctlA, { hpgateFlag: null });
    const cHpDir = path.join(tmp, 'ctlhp');
    fs.mkdirSync(cHpDir);
    fs.writeFileSync(path.join(cHpDir, 'c1.json'), JSON.stringify(badHp));
    const jE2 = judge(cHpDir, aDir, ANCHOR);
    check('§E2 substrate: control file without hpgateFlag — D5 fails and names the file',
      jE2.bars.D5.pass === false && jE2.bars.D5.control.bad.length === 1 && /hpgateFlag/.test(jE2.bars.D5.control.bad[0]), jE2.bars.D5);
    // §E3 — substrate: armed file without gateAvoidNotes.
    const badNotes = file(1, 'armed', armB);
    delete badNotes.gateAvoidNotes;
    const aNDir = path.join(tmp, 'armnotes');
    fs.mkdirSync(aNDir);
    fs.writeFileSync(path.join(aNDir, 'a1.json'), JSON.stringify(badNotes));
    const jE3 = judge(cBDir, aNDir, ANCHOR);
    check('§E3 substrate: armed file without gateAvoidNotes — D5 fails and names the file',
      jE3.bars.D5.pass === false && jE3.bars.D5.armed.bad.length === 1 && /gateAvoidNotes/.test(jE3.bars.D5.armed.bad[0]), jE3.bars.D5);
    // §F — anchor: wrong expected anchor fails D5 on both legs.
    const jF = judge(cDir, aDir, 'b'.repeat(40));
    check('§F anchor: wrong expected anchor — D5 fails on both legs',
      jF.bars.D5.pass === false && jF.bars.D5.control.bad.length > 0 && jF.bars.D5.armed.bad.length > 0, jF.bars.D5);
    // §G — S9 attribution: control door with no armed counterpart,
    // armed file carries a 'lead' note for the same seed+mid ->
    // lead-attributed; a second control door with no note ->
    // divergence.
    const ctlG = [
      doorRow({ day: 90, mid: 'reunion', outcome: 'vFlee', leaderEntryHp: 21 }),
      doorRow({ day: 91, mid: 'eater', outcome: 'vKill', rounds: 5, mDealt: 1100, leaderEntryHp: 80, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'] }),
    ];
    const armG = [doorRow({ day: 91, mid: 'eater', outcome: 'vKill', rounds: 5, mDealt: 1100, leaderEntryHp: 80, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'] })];
    const cGDir = path.join(tmp, 'ctlg'), aGDir = path.join(tmp, 'armg');
    fs.mkdirSync(cGDir); fs.mkdirSync(aGDir);
    fs.writeFileSync(path.join(cGDir, 'c1.json'), JSON.stringify(file(1, 'control', ctlG)));
    fs.writeFileSync(path.join(aGDir, 'a1.json'), JSON.stringify(file(1, 'armed', armG, {
      leaderhpgateFires: 1,
      gateAvoidNotes: [{ vid: 'h1', mid: 'reunion', name: 'Patrick', kind: 'lead', hp: 21, note: 'gave reunion room — Patrick is too hurt to lead a door (21 HP)' }],
    })));
    const jG = judge(cGDir, aGDir, ANCHOR);
    check('§G S9 attribution: the missing reunion door is lead-attributed (armed lead note, same seed+mid)',
      jG.avoided.n === 1 && jG.avoided.lead === 1 && jG.avoided.divergence === 0 &&
      jG.avoided.list[0].attribution === 'lead' && jG.avoided.list[0].mid === 'reunion', jG.avoided);
    check('§G S8 notes: armed leg carries 1 lead note (Patrick, 21 HP)',
      jG.armedGateNotes.lead === 1 && jG.armedGateNotes.hold === 0 &&
      jG.armedGateNotes.list[0].hp === 21 && jG.armedGateNotes.list[0].name === 'Patrick', jG.armedGateNotes);
    check('§G S10 fired: the lead note projects the leader dead after one round (21 - 25 = -4) and after two (-29)',
      jG.armedProjection.fired.length === 1 && jG.armedProjection.fired[0].projHp1 === -4 &&
      jG.armedProjection.fired[0].projHp2 === -29 && jG.armedProjection.fired[0].projectedDead1 === true &&
      jG.armedProjection.fired[0].leaderKnown === true, jG.armedProjection.fired);
    // §G2 — divergence: same control doors, armed file with NO
    // notes -> the avoided door is divergence, not a gate fire.
    const aG2Dir = path.join(tmp, 'armg2');
    fs.mkdirSync(aG2Dir);
    fs.writeFileSync(path.join(aG2Dir, 'a1.json'), JSON.stringify(file(1, 'armed', armG, { leaderhpgateFires: 0, gateAvoidNotes: [] })));
    const jG2 = judge(cGDir, aG2Dir, ANCHOR);
    check('§G2 S9 divergence: no armed note for the missing door -> divergence, not a gate fire',
      jG2.avoided.n === 1 && jG2.avoided.divergence === 1 && jG2.avoided.lead === 0, jG2.avoided);
    // §H — conversions: 1 conversion + 1 later flee + 1 no-change.
    const convCtl = [
      doorRow({ day: 90, mid: 'algorithm', outcome: 'vFlee', rounds: 2, leaderEntryHp: 60 }),
      doorRow({ day: 91, mid: 'eater', outcome: 'vFlee', rounds: 3, leaderEntryHp: 55 }),
      doorRow({ day: 92, mid: 'audit', outcome: 'vFlee', rounds: 2, leaderEntryHp: 90 }),
    ];
    const convArm = [
      doorRow({ day: 90, mid: 'algorithm', outcome: 'vKill', rounds: 5, mDealt: 1100, leaderEntryHp: 60, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'] }),
      doorRow({ day: 91, mid: 'eater', outcome: 'vFlee', rounds: 5, leaderEntryHp: 55 }),
      doorRow({ day: 92, mid: 'audit', outcome: 'vFlee', rounds: 2, leaderEntryHp: 90 }),
    ];
    const cCvDir = path.join(tmp, 'ctlcv'), aCvDir = path.join(tmp, 'armcv');
    fs.mkdirSync(cCvDir); fs.mkdirSync(aCvDir);
    fs.writeFileSync(path.join(cCvDir, 'c1.json'), JSON.stringify(file(1, 'control', convCtl)));
    fs.writeFileSync(path.join(aCvDir, 'a1.json'), JSON.stringify(file(1, 'armed', convArm)));
    const jH = judge(cCvDir, aCvDir, ANCHOR);
    check('§H conversions: 1 conversion + 1 later flee + 1 no-change over 3 control flees',
      jH.conversions.pairs === 3 && jH.conversions.conversions === 1 && jH.conversions.laterFlees === 1 && jH.conversions.noChange === 1, jH.conversions);
    // §I — non-door rows never enter the fought-doors denominator.
    const nonDoor = doorRow({ origin: 'world-tick', allyFromStart: false, pinned: false });
    const cNdDir = path.join(tmp, 'ctlnd');
    fs.mkdirSync(cNdDir);
    fs.writeFileSync(path.join(cNdDir, 'c1.json'), JSON.stringify(file(1, 'control', [nonDoor])));
    const jI = judge(cNdDir, aDir, ANCHOR);
    check('§I non-door rows excluded: control with only a world-tick row has 0 fought doors',
      jI.control.fought === 0 && jI.bars.D1.pass === false, jI.control);
    // §J — B1 secondary is rate-only: armed 2/2 vs control 3/3
    // passes on rate even though the armed row count is below the
    // old >= 3 floor (the floor is dropped for this arm).
    check('§J B1 secondary (rate-only): armed 2/2 ally3Vid vs control 3/3 — passes without the row floor',
      jG.bars.B1rate.pass === true && jG.bars.B1rate.armedRows === 1, jG.bars.B1rate);
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
  console.log('analyze-leaderhpgate-b selftest: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  let control = null, armed = null, anchor = null, asJson = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--control') control = args[++i];
    else if (args[i] === '--armed') armed = args[++i];
    else if (args[i] === '--anchor') anchor = args[++i];
    else if (args[i] === '--json') asJson = true;
  }
  if (!control || !armed || !anchor) {
    console.error('usage: node scripts/analyze-leaderhpgate-b.js --control <dir> --armed <dir> --anchor <40-hex> [--json] | --selftest');
    process.exit(2);
  }
  const result = judge(control, armed, anchor);
  if (asJson) console.log(JSON.stringify(result, null, 2));
  else {
    console.log('leaderhpgate judge: ' + (result.pass ? 'PASS' : 'FAIL'));
    console.log('  control fought doors: ' + result.control.fought + ' (vFlee ' + result.control.vFlee + ', vKill ' + result.control.vKill + ', mFlee ' + result.control.mFlee + ', vDie ' + result.control.vDie + ')');
    console.log('  armed fought doors: ' + result.armed.fought + ' (vFlee ' + result.armed.vFlee + ', vKill ' + result.armed.vKill + ', mFlee ' + result.armed.mFlee + ', vDie ' + result.armed.vDie + ')');
    console.log('  D1 flee rate on leader-sub-25 fought doors (PRIMARY): armed ' + result.armed.leaderSub25Flee + '/' + result.armed.leaderSub25 + ' vs control ' + result.control.leaderSub25Flee + '/' + result.control.leaderSub25 +
      ' (drop ' + (result.bars.D1.rateDropPp == null ? 'null' : result.bars.D1.rateDropPp.toFixed(1)) + 'pp) -> ' + (result.bars.D1.pass ? 'PASS' : 'FAIL') +
      (result.bars.D1.reason ? ' (' + result.bars.D1.reason + ')' : ''));
    console.log('  D2 kill rate per fought door: armed ' + (result.armed.killRate == null ? 'null' : result.armed.killRate.toFixed(3)) +
      ' (' + result.armed.vKill + '/' + result.armed.fought + ') vs control ' +
      (result.control.killRate == null ? 'null' : result.control.killRate.toFixed(3)) +
      ' (' + result.control.vKill + '/' + result.control.fought + ') -> ' + (result.bars.D2.pass ? 'PASS' : 'FAIL'));
    console.log('  D3 dmg/door: armed ' + (result.armed.dmgPerDoor == null ? 'null' : result.armed.dmgPerDoor.toFixed(1)) +
      ' vs control ' + (result.control.dmgPerDoor == null ? 'null' : result.control.dmgPerDoor.toFixed(1)) + ' (per-round: armed ' +
      (result.armed.dmgPerRound == null ? 'null' : result.armed.dmgPerRound.toFixed(1)) + ' vs control ' +
      (result.control.dmgPerRound == null ? 'null' : result.control.dmgPerRound.toFixed(1)) + ') -> ' + (result.bars.D3.pass ? 'PASS' : 'FAIL'));
    console.log('  D4 leader-gate fires: armed ' + result.armedLeaderFires + ' vs control ' + result.controlLeaderFires +
      ' (whole-party fires: armed ' + result.armedGateFires + ', control ' + result.controlGateFires + ') -> ' + (result.bars.D4.pass ? 'PASS' : 'FAIL') +
      (result.bars.D4.reason ? ' (' + result.bars.D4.reason + ')' : ''));
    console.log('  D5 substrate: control bad ' + result.bars.D5.control.bad.length + ', armed bad ' + result.bars.D5.armed.bad.length + ' -> ' + (result.bars.D5.pass ? 'PASS' : 'FAIL'));
    if (!result.bars.D5.pass) {
      result.bars.D5.control.bad.concat(result.bars.D5.armed.bad).forEach(function (b) { console.log('    D5: ' + b); });
    }
    console.log('  B1 rate (secondary): armed ' + (result.bars.B1rate.armedRate == null ? 'null' : result.bars.B1rate.armedRate.toFixed(3)) +
      ' vs control ' + (result.bars.B1rate.controlRate == null ? 'null' : result.bars.B1rate.controlRate.toFixed(3)) + ' -> ' + (result.bars.B1rate.pass ? 'PASS' : 'FAIL'));
    console.log('  B2 ally3Dealt (pinned w4+ subset): armed total ' + result.bars.B2.armedAlly3Dealt + ' (' + result.bars.B2.armedPinnedWave4Rows + ' rows), max ' + result.bars.B2.armedAlly3DealtMax + ' -> ' + (result.bars.B2.pass ? 'PASS' : 'FAIL'));
    console.log('  B3a kill conv: armed ' + (result.armedKillRate.rate == null ? 'null' : result.armedKillRate.rate.toFixed(3)) +
      ' (' + result.armedKillRate.k + '/' + result.armedKillRate.n + ') vs control ' +
      (result.controlKillRate.rate == null ? 'null' : result.controlKillRate.rate.toFixed(3)) +
      ' (' + result.controlKillRate.k + '/' + result.controlKillRate.n + ') -> ' + (result.bars.B3a.pass ? 'PASS' : 'FAIL'));
    console.log('  doorHold rounds: control ' + result.control.doorHold + ', armed ' + result.armed.doorHold +
      ' (fights with a hold: ' + result.armed.holdFights + '; everHopeless fights: control ' + result.control.everHopeless + ', armed ' + result.armed.everHopeless + ')');
    console.log('  gate fires (S8): whole-party control ' + result.controlGateFires + ' / armed ' + result.armedGateFires +
      '; leader control ' + result.controlLeaderFires + ' / armed ' + result.armedLeaderFires +
      '; notes hold/lead armed ' + result.armedGateNotes.hold + '/' + result.armedGateNotes.lead);
    console.log('  avoided doors (S9, reported): ' + result.avoided.n + ' control doors with no armed counterpart' +
      ' (lead-attributed ' + result.avoided.lead + ', hold-attributed ' + result.avoided.hold + ', divergence ' + result.avoided.divergence + ')' +
      (result.avoided.n > 0 ? ' — ' + result.avoided.list.map(function (x) { return x.seed + ' d' + x.day + ' ' + x.mid + ' (' + x.controlOutcome + ', ' + x.attribution + ')'; }).join(', ') : ''));
    console.log('  conversions (S2, reported): ' + result.conversions.pairs + ' matched control flees -> ' +
      result.conversions.conversions + ' kills, ' + result.conversions.laterFlees + ' later flees, ' +
      result.conversions.noChange + ' no-change, ' + result.conversions.other + ' other');
    console.log('  S10 leader projection (fought doors): control ' + JSON.stringify(result.control.projBands) + ', armed ' + JSON.stringify(result.armed.projBands) +
      ' (dead1 = projected-dead in 1 round, dead2 = in 2, collapse2 = at/below floor in 2)');
    if (result.armedProjection.fired.length || result.controlProjection.fired.length) {
      console.log('  S10 fired doors: ' + result.armedProjection.fired.concat(result.controlProjection.fired).map(function (x) {
        return x.seed + ' ' + x.mid + ' ' + x.name + ' ' + x.hp + ' HP (' + x.kind + ', proj1 ' + x.projHp1 + ', proj2 ' + x.projHp2 + (x.leaderKnown ? ', leader' : ', member') + ')';
      }).join('; '));
    }
  }
  process.exit(result.pass ? 0 : 1);
}

module.exports = { doorStats: doorStats, foughtDoors: foughtDoors, substrateCheck: substrateCheck, wave4KillRate: wave4KillRate, conversions: conversions, gateFires: gateFires, gateNotes: gateNotes, avoidedDoors: avoidedDoors, projection: projection, projectionBand: projectionBand, judge: judge, selftest: selftest };
