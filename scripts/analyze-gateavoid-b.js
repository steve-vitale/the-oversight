// analyze-gateavoid-b.js — analyzer + frozen-bar judge, arm
// sim-gateavoid-b (finding #2695: the DURABLE GATE-AVOID LOG +
// the leaderproj RE-JUDGE — the leaderproj NO-GO, METRIC-BROKEN,
// saw 9 gate fires as 1 note, because gate-avoid notes live on
// the leader's expedition record and expeditionReturn deletes it
// (villager-agency.js:1097; death path :1011), and avoided
// meetings write no v4encounters row. This arm appends one record
// per gate fire to st.gateAvoids at fire time — the durable log —
// and re-judges leaderproj on the SAME band with the attribution
// channel fixed.
//
// THE D1 RULE IS CARRIED VERBATIM FROM THE LEADERPROJ PREREG: a
// door-avoiding lever cannot be priced on the armed leg's
// fought-door pool — a working projection gate leaves NO armed
// fought door in its pool (every projected-collapse door is
// refused, not fought), so a flee rate over armed fought doors is
// unmeasurable BY CONSTRUCTION whenever the gate works. D1 is
// therefore priced on the CONTROL leg's pool, matched door by
// door: for each control fought door whose leader entered
// projected at-or-below the floor (leaderEntryHp <= 75, i.e.
// projHp2 <= 25), the armed leg's outcome on the SAME door
// (same seed + day + monster) is scored GOOD when the projection
// gate avoided it ('proj'-attributed LOG ENTRY), or the armed party
// killed the monster or the monster fled — and BAD when the armed
// party fled or died, the door diverged away with no log entry,
// or another gate ('hold'/'lead') avoided it (not this gate's
// credit — counted bad, conservatively). D1 GO: armed bad rate
// <= control bad rate - 20pp, where the control bad rate is the
// vFlee+vDie share of its own pool. D2/D3 stay per-door on fought
// doors (kill rate, total damage per door), exactly as the
// leaderhpgate arm repriced them — avoiding doors never punishes
// the lever there either.
//   D4 mechanism engagement: armed leaderprojFires >= 1.
//   D5 substrate: every file carries anchorCommit == frozen base,
//      policySha 1884c8852d38, pinquadFlag '1', dmgpinFlag '1',
//      doorflee2Flag '1', hypofloorFlag '1' AND hpgateFlag '1'
//      (BOTH legs — the control IS the hpgate armed configuration),
//      leaderhpgateFlag null (BOTH legs — the leader floor is NOT
//      carried; the projection gate is the only difference),
//      leaderprojFlag null (control) / '1' (armed),
//      leaderprojFires a number, gateAvoidNotes an array,
//      gateAvoidLog an array (the durable log).
//   D6 durability (NEW — the instrument bar): per leg, the durable
//      log is COMPLETE — gateAvoidLog length equals the total gate
//      fires (hpgateFires + leaderhpgateFires + leaderprojFires)
//      AND the per-kind log counts equal the per-kind counters.
//      A D6 miss means the log itself is broken and the re-judge
//      cannot be trusted.
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
// S8 gate-fire census (all three gates), S8b gate-avoid notes
// census (kept for backward compatibility — the notes UNDERCOUNT,
// see the header), S8c durable-log census (the attribution
// channel — day, mid, member name, kind, HP, projected HP),
// S9 avoided-doors census with attribution (gate fire vs trajectory
// divergence, via the gateAvoidLog — 'proj' is the projection
// gate's share), S10 leader-projection census (per fought door, the
// leader's projected HP after one/two rounds of focused wave-4
// damage at 25/round — the hypofloor §4 rate — plus the fired
// doors' projections from their log entries).
//
// Usage:
//   node scripts/analyze-gateavoid-b.js --control <dir> --armed <dir> --anchor <40-hex> [--json]
//   node scripts/analyze-gateavoid-b.js --selftest
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
    // D1 (leaderproj) population: fought doors whose leader entered
    // PROJECTED at-or-below the floor (leaderEntryHp <= 75, i.e.
    // projHp2 <= 25 — the doors the projection gate could touch).
    // Bad = the door ended in a flee or a leader death.
    projPool: 0, projPoolBad: 0, projPoolFlee: 0, projPoolDie: 0,
    projPoolBadRate: null,
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
    if (leh != null && leh <= 75) {
      stats.projPool++;
      if (e.outcome === 'vFlee') { stats.projPoolBad++; stats.projPoolFlee++; }
      if (e.outcome === 'vDie') { stats.projPoolBad++; stats.projPoolDie++; }
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
  stats.projPoolBadRate = stats.projPool > 0 ? stats.projPoolBad / stats.projPool : null;
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
    const wantProj = leg === 'armed' ? '1' : null;
    if (d.anchorCommit !== anchor) bad.push(c.file + ': anchorCommit ' + String(d.anchorCommit).slice(0, 12) + ' != ' + String(anchor).slice(0, 12));
    if (String(d.policySha || '').slice(0, 12) !== POLICY_SHA12) bad.push(c.file + ': policySha ' + String(d.policySha));
    if (d.pinquadFlag !== '1') bad.push(c.file + ': pinquadFlag ' + JSON.stringify(d.pinquadFlag));
    if (d.dmgpinFlag !== '1') bad.push(c.file + ': dmgpinFlag ' + JSON.stringify(d.dmgpinFlag));
    if (d.doorflee2Flag !== '1') bad.push(c.file + ': doorflee2Flag ' + JSON.stringify(d.doorflee2Flag) + ' want "1" (both legs carry the hold)');
    if (d.hypofloorFlag !== '1') bad.push(c.file + ': hypofloorFlag ' + JSON.stringify(d.hypofloorFlag) + ' want "1" (both legs carry the floor — the control IS the hypofloor armed configuration)');
    if (d.hpgateFlag !== '1') bad.push(c.file + ': hpgateFlag ' + JSON.stringify(d.hpgateFlag) + ' want "1" (both legs carry the whole-party gate — the control IS the hpgate armed configuration)');
    if ((d.leaderhpgateFlag || null) !== null) bad.push(c.file + ': leaderhpgateFlag ' + JSON.stringify(d.leaderhpgateFlag) + ' want null (both legs — the leader floor is NOT carried; the projection gate is the only difference)');
    if ((d.leaderprojFlag || null) !== wantProj) bad.push(c.file + ': leaderprojFlag ' + JSON.stringify(d.leaderprojFlag) + ' want ' + JSON.stringify(wantProj));
    if (typeof d.leaderprojFires !== 'number') bad.push(c.file + ': leaderprojFires ' + JSON.stringify(d.leaderprojFires) + ' want a number (driver stamps the agency-state counter)');
    if (typeof d.leaderhpgateFires !== 'number') bad.push(c.file + ': leaderhpgateFires ' + JSON.stringify(d.leaderhpgateFires) + ' want a number (driver stamps the agency-state counter)');
    if (typeof d.hpgateFires !== 'number') bad.push(c.file + ': hpgateFires ' + JSON.stringify(d.hpgateFires) + ' want a number (driver stamps the agency-state counter)');
    if (!Array.isArray(d.gateAvoidNotes)) bad.push(c.file + ': gateAvoidNotes ' + JSON.stringify(d.gateAvoidNotes) + ' want an array (driver parses the gate-avoid encounter notes)');
    if (!Array.isArray(d.gateAvoidLog)) bad.push(c.file + ': gateAvoidLog ' + JSON.stringify(d.gateAvoidLog) + ' want an array (driver stamps the durable log from st.gateAvoids)');
    if (!d.slotPresent || !d.pinPresent) bad.push(c.file + ': slotPresent/pinPresent ' + JSON.stringify(d.slotPresent) + '/' + JSON.stringify(d.pinPresent));
  }
  return { files: corpora.length, bad: bad, pass: bad.length === 0 };
}

// D1 — the matched-pool bad-outcome census (the primary's
// instrument): for each CONTROL fought door in the projection
// pool (leaderEntryHp <= 75, i.e. projHp2 <= 25), the armed leg's
// outcome on the SAME door (same seed + day + monster). GOOD: the
// projection gate avoided it ('proj'-attributed LOG ENTRY), the
// armed party killed the monster, or the monster fled. BAD: the
// armed party fled or died, the door diverged away with no log
// entry, or another gate ('hold'/'lead') avoided it — not this
// gate's credit, counted bad conservatively. An 'other' armed
// outcome (neither kill/flee/die/mFlee) is also counted bad — the
// door was fought and the leader was not saved by the gate.
// The attribution reads the DURABLE LOG (gateAvoidLog, keyed
// seed+day+mid — the log carries the day the parsed notes never
// had), not the parsed notes: the notes live on expedition records
// that expeditionReturn deletes, so they undercount fires (the
// leaderproj NO-GO saw 9 fires as 1 note). The frozen D1 rule is
// unchanged; only the channel that answers it is.
function matchedPool(controlCorpora, armedCorpora) {
  const ctl = foughtDoors(controlCorpora);
  const arm = foughtDoors(armedCorpora);
  const armByKey = {};
  for (const d of arm) armByKey[d.seed + '|' + d.row.day + '|' + d.row.mid] = d.row;
  const armLogBySeedDayMid = {};
  for (const c of armedCorpora) {
    for (const n of (c.data.gateAvoidLog || [])) {
      armLogBySeedDayMid[c.data.seed + '|' + n.day + '|' + n.mid] = n.kind;
    }
  }
  const out = { pool: 0, controlBad: 0, armedBad: 0, good: 0, bad: 0, projAvoids: 0, kills: 0, mFlees: 0, flees: 0, dies: 0, divergence: 0, otherGate: 0, other: 0, list: [] };
  for (const d of ctl) {
    const leh = (typeof d.row.leaderEntryHp === 'number' ? d.row.leaderEntryHp : null);
    if (leh == null || leh > 75) continue;
    out.pool++;
    if (d.row.outcome === 'vFlee' || d.row.outcome === 'vDie') out.controlBad++;
    const a = armByKey[d.seed + '|' + d.row.day + '|' + d.row.mid];
    let kind = null;
    if (a) {
      if (a.outcome === 'vKill') kind = 'kill';
      else if (a.outcome === 'mFlee') kind = 'mFlee';
      else if (a.outcome === 'vFlee') kind = 'flee';
      else if (a.outcome === 'vDie') kind = 'die';
      else kind = 'other';
    } else {
      const attr = armLogBySeedDayMid[d.seed + '|' + d.row.day + '|' + d.row.mid];
      if (attr === 'proj') kind = 'projAvoid';
      else if (attr === 'hold' || attr === 'lead') kind = 'otherGate';
      else kind = 'divergence';
    }
    if (kind === 'projAvoid') { out.good++; out.projAvoids++; }
    else if (kind === 'kill') { out.good++; out.kills++; }
    else if (kind === 'mFlee') { out.good++; out.mFlees++; }
    else if (kind === 'flee') { out.bad++; out.armedBad++; out.flees++; }
    else if (kind === 'die') { out.bad++; out.armedBad++; out.dies++; }
    else if (kind === 'divergence') { out.bad++; out.armedBad++; out.divergence++; }
    else if (kind === 'otherGate') { out.bad++; out.armedBad++; out.otherGate++; }
    else { out.bad++; out.armedBad++; out.other++; }
    out.list.push({ seed: d.seed, day: d.row.day, mid: d.row.mid, controlOutcome: d.row.outcome, leaderEntryHp: leh, armedKind: kind });
  }
  return out;
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
// leader gate, 'proj' = projection gate). KEPT for backward
// compatibility only: the note is NOT the persisted evidence of a
// fired gate anymore — the notes live on expedition records that
// expeditionReturn deletes, so they undercount (9 fires as 1 note
// on the leaderproj band). The durable log (S8c) is the channel.
function gateNotes(corpora) {
  const out = { hold: 0, lead: 0, proj: 0, list: [] };
  for (const c of corpora) {
    for (const n of (c.data.gateAvoidNotes || [])) {
      if (n.kind === 'lead') out.lead++;
      else if (n.kind === 'hold') out.hold++;
      else if (n.kind === 'proj') out.proj++;
      out.list.push({ seed: c.data.seed, mid: n.mid, name: n.name, kind: n.kind, hp: n.hp, projHp2: (n.projHp2 != null ? n.projHp2 : null), note: n.note || null });
    }
  }
  return out;
}
// S8c — the durable-log census (REPORTED, the attribution
// channel): the log entries per leg, split by gate kind, with the
// day each fire happened. Every fire is one entry, written at fire
// time onto the agency state — so the log count per kind should
// equal the counter per kind (D6 judges exactly that).
function gateLog(corpora) {
  const out = { hold: 0, lead: 0, proj: 0, other: 0, list: [] };
  for (const c of corpora) {
    for (const n of (c.data.gateAvoidLog || [])) {
      if (n.kind === 'lead') out.lead++;
      else if (n.kind === 'hold') out.hold++;
      else if (n.kind === 'proj') out.proj++;
      else out.other++;
      out.list.push({ seed: c.data.seed, day: (typeof n.day === 'number' ? n.day : null), mid: n.mid, name: n.name, kind: n.kind, hp: n.hp, projHp2: (n.projHp2 != null ? n.projHp2 : null), note: n.note || null });
    }
  }
  return out;
}
// S9 — the avoided-doors census (REPORTED, never proof on its own):
// control fought doors with NO armed row on the same seed + day +
// monster, ATTRIBUTED where the armed leg's durable log names the
// same seed + day + monster: 'proj' = the projection gate fired on
// that door, 'lead' = the leader gate fired on it, 'hold' = the
// whole-party gate fired on it, 'divergence' = no log entry —
// trajectory divergence dropped the row.
function avoidedDoors(controlCorpora, armedCorpora) {
  const ctl = foughtDoors(controlCorpora);
  const arm = foughtDoors(armedCorpora);
  const armKeys = {};
  for (const d of arm) armKeys[d.seed + '|' + d.row.day + '|' + d.row.mid] = true;
  const armLogBySeedDayMid = {};
  for (const c of armedCorpora) {
    for (const n of (c.data.gateAvoidLog || [])) {
      armLogBySeedDayMid[c.data.seed + '|' + n.day + '|' + n.mid] = n.kind;
    }
  }
  const out = { n: 0, proj: 0, lead: 0, hold: 0, divergence: 0, list: [] };
  for (const d of ctl) {
    if (!armKeys[d.seed + '|' + d.row.day + '|' + d.row.mid]) {
      out.n++;
      const attr = armLogBySeedDayMid[d.seed + '|' + d.row.day + '|' + d.row.mid] || 'divergence';
      if (attr === 'proj') out.proj++;
      else if (attr === 'lead') out.lead++;
      else if (attr === 'hold') out.hold++;
      else out.divergence++;
      out.list.push({ seed: d.seed, day: d.row.day, mid: d.row.mid, controlOutcome: d.row.outcome, controlRounds: d.row.rounds, attribution: attr });
    }
  }
  return out;
}
// S10 — the leader-projection census (REPORTED, the diagnostic): per
// fought door, the leader's projected HP after one/two rounds of
// focused wave-4 damage (25/round); per fired door (durable-log
// entry), the fired member's projection. For 'lead' entries the HP
// IS the leader's; for 'hold' entries it is the fired member's (the
// leader's HP on that door is unknown from the entry alone —
// reported as member HP, never attributed to the leader).
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
    for (const n of (c.data.gateAvoidLog || [])) {
      fired.push({ seed: c.data.seed, day: (typeof n.day === 'number' ? n.day : null), mid: n.mid, name: n.name, kind: n.kind, hp: n.hp,
        projHp1: n.hp - FOCUSED_DMG_PER_ROUND, projHp2: n.hp - 2 * FOCUSED_DMG_PER_ROUND,
        projectedDead1: n.hp - FOCUSED_DMG_PER_ROUND <= 0,
        projectedDead2: n.hp - 2 * FOCUSED_DMG_PER_ROUND <= 0,
        // A 'lead' entry's HP is the leader's, and so is a 'proj'
        // entry's — the projection gate reads the leader only. A
        // 'hold' entry's HP is the fired member's (unknown leader).
        leaderKnown: n.kind === 'lead' || n.kind === 'proj' });
    }
  }
  return { foughtBands: bands, fought: foughtList, fired: fired };
}

// D6 — the durability check (the instrument bar): per leg, the
// durable log is COMPLETE — one entry per fire, per kind. The log
// length must equal the total gate fires, and each kind's log count
// must equal its counter. Any gap means a fire left no durable
// trace and the re-judge cannot be trusted.
function durability(corpora) {
  const fires = { hold: gateFires(corpora, 'hpgateFires'), lead: gateFires(corpora, 'leaderhpgateFires'), proj: gateFires(corpora, 'leaderprojFires') };
  const logged = { hold: 0, lead: 0, proj: 0, other: 0 };
  let entries = 0;
  for (const c of corpora) {
    for (const e of (c.data.gateAvoidLog || [])) {
      entries++;
      if (e.kind === 'hold') logged.hold++;
      else if (e.kind === 'lead') logged.lead++;
      else if (e.kind === 'proj') logged.proj++;
      else logged.other++;
    }
  }
  const totalFires = fires.hold + fires.lead + fires.proj;
  const bad = [];
  if (entries !== totalFires) bad.push('log entries ' + entries + ' != total fires ' + totalFires);
  if (logged.hold !== fires.hold) bad.push('hold log ' + logged.hold + ' != hpgateFires ' + fires.hold);
  if (logged.lead !== fires.lead) bad.push('lead log ' + logged.lead + ' != leaderhpgateFires ' + fires.lead);
  if (logged.proj !== fires.proj) bad.push('proj log ' + logged.proj + ' != leaderprojFires ' + fires.proj);
  if (logged.other) bad.push('log has ' + logged.other + ' entries with unknown kind');
  return { entries: entries, fires: totalFires, byKind: logged, counters: fires, bad: bad, pass: bad.length === 0 };
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
  const cLog = gateLog(control);
  const aLog = gateLog(armed);
  const projC = projection(control);
  const projA = projection(armed);
  const mp = matchedPool(control, armed);
  // D1 (PRIMARY, matched-pool): bad-outcome rate on the CONTROL
  // leg's projection-pool doors (leader entered <= 75 HP, i.e.
  // projHp2 <= 25), scored on the ARMED leg's outcome for the
  // SAME door. A working door-avoiding gate leaves no armed fought
  // door in its pool, so the armed leg is NEVER priced on its own
  // fought doors here — the pool is the control leg's, and an
  // armed 'proj' avoid is a GOOD outcome. Unmeasurable when the
  // control pool is empty: the gate then has nothing to price.
  // (The leaderhpgate-style flee rate on fought pool doors
  // survives only as a reported secondary — see D1fought below.)
  const d1 = {
    pool: mp.pool,
    controlBad: mp.controlBad,
    armedBad: mp.armedBad,
    controlBadRate: mp.pool > 0 ? mp.controlBad / mp.pool : null,
    armedBadRate: mp.pool > 0 ? mp.armedBad / mp.pool : null,
    rateDropPp: mp.pool > 0 ? ((mp.controlBad - mp.armedBad) / mp.pool) * 100 : null,
    projAvoids: mp.projAvoids, kills: mp.kills, mFlees: mp.mFlees,
    flees: mp.flees, dies: mp.dies, divergence: mp.divergence, otherGate: mp.otherGate, other: mp.other,
    reason: null, pass: false,
  };
  if (mp.pool === 0) {
    d1.reason = 'unmeasurable: control projection-pool empty (no fought door with leader entry <= 75 HP) — the gate has nothing to price';
    d1.pass = false;
  } else {
    d1.pass = ((mp.controlBad - mp.armedBad) / mp.pool) >= 0.20;
    d1.reason = d1.pass ? null : 'bad-rate drop below 20pp';
  }
  // D1fought (REPORTED secondary, the leaderhpgate-style bar):
  // flee rate on fought pool doors per leg. Expected to be
  // unmeasurable on the armed leg when the gate works (it refuses
  // every pool door, so none is fought) — never re-scored.
  const d1fought = {
    controlN: cs.projPool, armedN: as.projPool,
    controlFlees: cs.projPoolFlee, armedFlees: as.projPoolFlee,
    controlRate: cs.projPoolBadRate != null ? cs.projPoolFlee / cs.projPool : null,
    armedRate: as.projPool > 0 ? as.projPoolFlee / as.projPool : null,
    reason: null,
  };
  if (cs.projPool === 0 || as.projPool === 0) {
    d1fought.reason = 'unmeasurable on a leg: projection-pool fought doors control ' + cs.projPool + ', armed ' + as.projPool + ' (a working gate leaves no armed pool door — expected, not a failure)';
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
  // D4 mechanism engagement: the projection gate must fire at
  // least once. Pre-registered expectation: >= 1 — the S10 census
  // on the prior band says the pool exists (4 of 6 fought doors
  // sat in dead2/collapse2), so a 0 here would mean the gate's
  // condition never met a door, not a subsumption.
  const d4 = {
    armedProjFires: gateFires(armed, 'leaderprojFires'),
    controlProjFires: gateFires(control, 'leaderprojFires'),
    armedLeaderFires: gateFires(armed, 'leaderhpgateFires'),
    controlLeaderFires: gateFires(control, 'leaderhpgateFires'),
    armedHpFires: gateFires(armed, 'hpgateFires'),
    controlHpFires: gateFires(control, 'hpgateFires'),
    pass: false, reason: null,
  };
  d4.pass = d4.armedProjFires >= 1;
  if (!d4.pass) d4.reason = 'the projection gate never fired (0 fires — no door met its condition)';
  // D6 durability (NEW — the instrument bar): the durable log is
  // complete on BOTH legs — every fire left one log entry, per
  // kind. A miss voids trust in the re-judge's attribution.
  const d6c = durability(control);
  const d6a = durability(armed);
  const d6 = {
    control: d6c, armed: d6a,
    pass: d6c.pass && d6a.pass,
    reason: null,
  };
  if (!d6.pass) d6.reason = 'durable log incomplete: control [' + d6c.bad.join('; ') + '] armed [' + d6a.bad.join('; ') + ']';
  const bars = {
    D1: d1, D1fought: d1fought, D2: d2, D3: d3, D4: d4,
    D5: { control: subC, armed: subA, pass: subC.pass && subA.pass },
    D6: d6,
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
  const pass = bars.D1.pass && bars.D2.pass && bars.D3.pass && bars.D4.pass && bars.D5.pass && bars.D6.pass;
  return {
    control: cs, armed: as,
    controlKillRate: ckr, armedKillRate: akr,
    conversions: conv,
    matchedPool: mp,
    controlGateFires: gateFires(control, 'hpgateFires'),
    armedGateFires: gateFires(armed, 'hpgateFires'),
    controlLeaderFires: gateFires(control, 'leaderhpgateFires'),
    armedLeaderFires: gateFires(armed, 'leaderhpgateFires'),
    controlProjFires: gateFires(control, 'leaderprojFires'),
    armedProjFires: gateFires(armed, 'leaderprojFires'),
    controlGateNotes: cNotes, armedGateNotes: aNotes,
    controlGateLog: cLog, armedGateLog: aLog,
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
      hpgateFires: 0,
      leaderhpgateFlag: null,
      leaderhpgateFires: 0,
      leaderprojFlag: leg === 'armed' ? '1' : null,
      leaderprojFires: 0,
      gateAvoidNotes: [],
      gateAvoidLog: [],
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
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gateavoid-analyze-'));
  try {
    // §A — the EXPECTED production shape: control fights 4 doors
    // (leaders 67 vFlee, 71 vKill, 83 vKill, 46 mFlee); armed
    // identical, projection gate never fired. D1's matched pool is
    // 3 (67, 71, 46 <= 75; 83 excluded) with 1 control bad and 1
    // armed bad — 0pp drop, D1 fails; D4 fails.
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
    check('§A expected shape: D1 matched pool is 3 (67/71/46 <= 75, 83 excluded), 1 control bad vs 1 armed bad — 0pp drop, D1 fails',
      jA.bars.D1.pass === false && jA.bars.D1.pool === 3 && jA.bars.D1.controlBad === 1 && jA.bars.D1.armedBad === 1 && jA.bars.D1.rateDropPp === 0, jA.bars.D1);
    check('§A expected shape: D4 fails (projection gate never fired, 0 fires)',
      jA.bars.D4.pass === false && jA.bars.D4.armedProjFires === 0, jA.bars.D4);
    check('§A expected shape: identical legs tie D2 (kill rate) and D3 (damage) — both pass',
      jA.bars.D2.pass === true && jA.bars.D3.pass === true, { D2: jA.bars.D2, D3: jA.bars.D3 });
    check('§A expected shape: D5 substrate passes (hpgateFlag 1 both legs, leaderhpgateFlag null both, leaderprojFlag null/1, gateAvoidNotes array, gateAvoidLog array)',
      jA.bars.D5.pass === true, jA.bars.D5);
    check('§A expected shape: S10 bands read the leaders (0 dead1, 1 dead2 at 46, 2 collapse2 at 67/71, 1 safe at 83)',
      jA.control.projBands.dead1 === 0 && jA.control.projBands.dead2 === 1 && jA.control.projBands.collapse2 === 2 && jA.control.projBands.safe === 1, jA.control.projBands);
    check('§A expected shape: judge overall FAIL (D1 + D4 miss)',
      jA.pass === false, jA.bars);
    check('§A D6 passes when nothing fired (0 fires, empty log on both legs)',
      jA.bars.D6.pass === true && jA.bars.D6.control.entries === 0 && jA.bars.D6.armed.entries === 0, jA.bars.D6);
    // §B — D1 GO math (the working-gate shape): control pool 4
    // doors (60 vFlee, 65 vFlee, 70 vDie, 75 vKill — 3 bad of 4);
    // armed avoids all four with 'proj' LOG entries and fights one
    // safe door (90 vKill). D1: 75pp drop, passes; D4: 4 fires,
    // passes. The log entries carry the control rows' days — the
    // attribution keys on seed+day+mid.
    const ctlB = [
      doorRow({ day: 90, mid: 'algorithm', outcome: 'vFlee', leaderEntryHp: 60 }),
      doorRow({ day: 91, mid: 'eater', outcome: 'vFlee', leaderEntryHp: 65 }),
      doorRow({ day: 92, mid: 'audit', outcome: 'vDie', leaderEntryHp: 70 }),
      doorRow({ day: 93, mid: 'herald', outcome: 'vKill', rounds: 5, mDealt: 1100, leaderEntryHp: 75, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'] }),
    ];
    const armB = [doorRow({ day: 94, mid: 'reunion', outcome: 'vKill', rounds: 5, mDealt: 1100, leaderEntryHp: 90, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'] })];
    const projLogB = ctlB.map(function (r) {
      return { vid: 'h1', day: r.day, mid: r.mid, name: 'Petra', kind: 'proj', hp: r.leaderEntryHp, projHp2: r.leaderEntryHp - 50,
        note: 'gave ' + r.mid + ' room — Petra is too hurt to lead a door (projected ' + r.leaderEntryHp + ' HP, ' + (r.leaderEntryHp - 50) + ' HP in two rounds)' };
    });
    const cBDir = path.join(tmp, 'ctlb'), aBDir = path.join(tmp, 'armb');
    fs.mkdirSync(cBDir); fs.mkdirSync(aBDir);
    fs.writeFileSync(path.join(cBDir, 'c1.json'), JSON.stringify(file(1, 'control', ctlB, { hpgateFires: 0 })));
    fs.writeFileSync(path.join(aBDir, 'a1.json'), JSON.stringify(file(1, 'armed', armB, { hpgateFires: 0, leaderprojFires: 4, gateAvoidLog: projLogB })));
    const jB = judge(cBDir, aBDir, ANCHOR);
    check('§B D1 GO math: control 3/4 bad vs armed 0/4 bad on the matched pool — 75pp drop, D1 passes (4 proj avoids)',
      jB.bars.D1.pass === true && jB.bars.D1.pool === 4 && jB.bars.D1.controlBad === 3 && jB.bars.D1.armedBad === 0 && jB.bars.D1.rateDropPp === 75 && jB.bars.D1.projAvoids === 4, jB.bars.D1);
    check('§B D4 passes when the projection gate fired (4 fires)',
      jB.bars.D4.pass === true && jB.bars.D4.armedProjFires === 4, jB.bars.D4);
    check('§B D2 per-door kill rate: armed 1/1 vs control 1/4 — passes',
      jB.bars.D2.pass === true && jB.bars.D2.armedKillRate === 1, jB.bars.D2);
    check('§B D3 damage: armed 1100/door vs control 500/door — passes',
      jB.bars.D3.pass === true && jB.bars.D3.armedDmgPerDoor === 1100, jB.bars.D3);
    check('§B the GO-shaped synthetic passes all computed bars',
      jB.pass === true, jB.bars);
    check('§B S9: all 4 avoided control doors are proj-attributed',
      jB.avoided.n === 4 && jB.avoided.proj === 4 && jB.avoided.divergence === 0, jB.avoided);
    check('§B D6 passes on the GO shape (4 proj fires, 4 proj log entries)',
      jB.bars.D6.pass === true && jB.bars.D6.armed.entries === 4 && jB.bars.D6.armed.byKind.proj === 4, jB.bars.D6);
    // §C — D2 rate regression: armed fights the pool doors and
    // flees all four (gate never fired).
    const armC = ctlB.map(function (r) { return Object.assign({}, r, { outcome: 'vFlee', rounds: 2 }); });
    const aCDir = path.join(tmp, 'armc');
    fs.mkdirSync(aCDir);
    fs.writeFileSync(path.join(aCDir, 'a1.json'), JSON.stringify(file(1, 'armed', armC, { leaderprojFires: 0 })));
    const jC = judge(cBDir, aCDir, ANCHOR);
    check('§C D2 regression: armed kill rate 0 vs control 0.25 — D2 fails',
      jC.bars.D2.pass === false && jC.bars.D2.armedKillRate === 0, jC.bars.D2);
    // §D — D3 damage regression: armed kills the pool doors but
    // deals 100/door vs control ~500.
    const armD = ctlB.map(function (r) { return Object.assign({}, r, { outcome: 'vKill', rounds: 5, mDealt: 100 }); });
    const aDDir = path.join(tmp, 'armd');
    fs.mkdirSync(aDDir);
    fs.writeFileSync(path.join(aDDir, 'a1.json'), JSON.stringify(file(1, 'armed', armD, { leaderprojFires: 1 })));
    const jD = judge(cBDir, aDDir, ANCHOR);
    check('§D D3 regression: armed 100/door vs control 500/door — D3 fails',
      jD.bars.D3.pass === false && jD.bars.D3.armedDmgPerDoor === 100, jD.bars.D3);
    // §E — substrate: armed file without leaderprojFlag.
    const badFile = file(1, 'armed', armB);
    delete badFile.leaderprojFlag;
    const aBadDir = path.join(tmp, 'armbad');
    fs.mkdirSync(aBadDir);
    fs.writeFileSync(path.join(aBadDir, 'a1.json'), JSON.stringify(badFile));
    const jE = judge(cBDir, aBadDir, ANCHOR);
    check('§E substrate: armed file without leaderprojFlag — D5 fails and names the file',
      jE.bars.D5.pass === false && jE.bars.D5.armed.bad.length === 1 && /leaderprojFlag/.test(jE.bars.D5.armed.bad[0]), jE.bars.D5);
    // §E2 — substrate: control file carrying leaderhpgateFlag '1'
    // (both legs must be null — the leader floor is NOT carried).
    const badLh = file(1, 'control', ctlA, { leaderhpgateFlag: '1' });
    const cLhDir = path.join(tmp, 'ctllh');
    fs.mkdirSync(cLhDir);
    fs.writeFileSync(path.join(cLhDir, 'c1.json'), JSON.stringify(badLh));
    const jE2 = judge(cLhDir, aDir, ANCHOR);
    check('§E2 substrate: control file carrying leaderhpgateFlag — D5 fails and names the file',
      jE2.bars.D5.pass === false && jE2.bars.D5.control.bad.length === 1 && /leaderhpgateFlag/.test(jE2.bars.D5.control.bad[0]), jE2.bars.D5);
    // §E3 — substrate: control file with hpgateFlag null (both legs
    // must carry the whole-party gate).
    const badHp = file(1, 'control', ctlA, { hpgateFlag: null });
    const cHpDir = path.join(tmp, 'ctlhp');
    fs.mkdirSync(cHpDir);
    fs.writeFileSync(path.join(cHpDir, 'c1.json'), JSON.stringify(badHp));
    const jE3 = judge(cHpDir, aDir, ANCHOR);
    check('§E3 substrate: control file without hpgateFlag — D5 fails and names the file',
      jE3.bars.D5.pass === false && jE3.bars.D5.control.bad.length === 1 && /hpgateFlag/.test(jE3.bars.D5.control.bad[0]), jE3.bars.D5);
    // §E4 — substrate: armed file without gateAvoidNotes.
    const badNotes = file(1, 'armed', armB);
    delete badNotes.gateAvoidNotes;
    const aNDir = path.join(tmp, 'armnotes');
    fs.mkdirSync(aNDir);
    fs.writeFileSync(path.join(aNDir, 'a1.json'), JSON.stringify(badNotes));
    const jE4 = judge(cBDir, aNDir, ANCHOR);
    check('§E4 substrate: armed file without gateAvoidNotes — D5 fails and names the file',
      jE4.bars.D5.pass === false && jE4.bars.D5.armed.bad.length === 1 && /gateAvoidNotes/.test(jE4.bars.D5.armed.bad[0]), jE4.bars.D5);
    // §F — anchor: wrong expected anchor fails D5 on both legs.
    const jF = judge(cDir, aDir, 'b'.repeat(40));
    check('§F anchor: wrong expected anchor — D5 fails on both legs',
      jF.bars.D5.pass === false && jF.bars.D5.control.bad.length > 0 && jF.bars.D5.armed.bad.length > 0, jF.bars.D5);
    // §G — S9 attribution: control door with no armed counterpart,
    // armed file carries a 'proj' LOG entry for the same
    // seed+day+mid -> proj-attributed. The parsed notes are EMPTY
    // here (the old blind channel) — the log alone attributes it.
    const ctlG = [
      doorRow({ day: 90, mid: 'reunion', outcome: 'vFlee', leaderEntryHp: 60 }),
      doorRow({ day: 91, mid: 'eater', outcome: 'vKill', rounds: 5, mDealt: 1100, leaderEntryHp: 80, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'] }),
    ];
    const armG = [doorRow({ day: 91, mid: 'eater', outcome: 'vKill', rounds: 5, mDealt: 1100, leaderEntryHp: 80, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'] })];
    const cGDir = path.join(tmp, 'ctlg'), aGDir = path.join(tmp, 'armg');
    fs.mkdirSync(cGDir); fs.mkdirSync(aGDir);
    fs.writeFileSync(path.join(cGDir, 'c1.json'), JSON.stringify(file(1, 'control', ctlG)));
    fs.writeFileSync(path.join(aGDir, 'a1.json'), JSON.stringify(file(1, 'armed', armG, {
      leaderprojFires: 1,
      gateAvoidNotes: [],
      gateAvoidLog: [{ vid: 'h1', day: 90, mid: 'reunion', name: 'Petra', kind: 'proj', hp: 60, projHp2: 10, note: 'gave reunion room — Petra is too hurt to lead a door (projected 60 HP, 10 HP in two rounds)' }],
    })));
    const jG = judge(cGDir, aGDir, ANCHOR);
    check('§G S9 attribution: the missing reunion door is proj-attributed (armed proj LOG entry, same seed+day+mid)',
      jG.avoided.n === 1 && jG.avoided.proj === 1 && jG.avoided.divergence === 0 &&
      jG.avoided.list[0].attribution === 'proj' && jG.avoided.list[0].mid === 'reunion', jG.avoided);
    check('§G S8c log: armed leg carries 1 proj log entry (Petra, 60 HP, proj 10 HP, day 90) and no notes at all',
      jG.armedGateLog.proj === 1 && jG.armedGateLog.hold === 0 && jG.armedGateLog.lead === 0 &&
      jG.armedGateLog.list[0].hp === 60 && jG.armedGateLog.list[0].projHp2 === 10 && jG.armedGateLog.list[0].name === 'Petra' &&
      jG.armedGateLog.list[0].day === 90 && jG.armedGateNotes.proj === 0, jG.armedGateLog);
    check('§G S10 fired: the proj log entry projects the leader 35 HP after one round, 10 after two, and the leader IS known',
      jG.armedProjection.fired.length === 1 && jG.armedProjection.fired[0].projHp1 === 35 &&
      jG.armedProjection.fired[0].projHp2 === 10 && jG.armedProjection.fired[0].projectedDead1 === false &&
      jG.armedProjection.fired[0].projectedDead2 === false &&
      jG.armedProjection.fired[0].leaderKnown === true && jG.armedProjection.fired[0].day === 90, jG.armedProjection.fired);
    check('§G D1 matched pool: the avoided reunion door scores GOOD (proj avoid) — armed bad 0 of 1, D1 passes',
      jG.matchedPool.pool === 1 && jG.matchedPool.projAvoids === 1 && jG.matchedPool.armedBad === 0 &&
      jG.bars.D1.pass === true, jG.matchedPool);
    check('§G D6 passes on the attributed shape (1 proj fire, 1 proj log entry)',
      jG.bars.D6.pass === true && jG.bars.D6.armed.entries === 1 && jG.bars.D6.armed.byKind.proj === 1, jG.bars.D6);
    // §G2 — divergence: same control doors, armed file with NO
    // log entries -> the avoided door is divergence, and D1 scores
    // it BAD.
    const aG2Dir = path.join(tmp, 'armg2');
    fs.mkdirSync(aG2Dir);
    fs.writeFileSync(path.join(aG2Dir, 'a1.json'), JSON.stringify(file(1, 'armed', armG, { leaderprojFires: 0, gateAvoidNotes: [], gateAvoidLog: [] })));
    const jG2 = judge(cGDir, aG2Dir, ANCHOR);
    check('§G2 S9 divergence: no armed log entry for the missing door -> divergence, not a gate fire; D1 scores it bad (armedBad 1 of 1)',
      jG2.avoided.n === 1 && jG2.avoided.divergence === 1 && jG2.avoided.proj === 0 &&
      jG2.matchedPool.armedBad === 1 && jG2.matchedPool.divergence === 1 && jG2.bars.D1.pass === false, jG2.avoided);
    check('§G2 D6 passes on the divergence shape (0 fires, empty log)',
      jG2.bars.D6.pass === true && jG2.bars.D6.armed.entries === 0, jG2.bars.D6);
    // §G3 — other-gate conservatism: the armed leg avoided the pool
    // door with a 'hold' LOG entry (whole-party gate, not this gate)
    // -> D1 scores it BAD, not good.
    const aG3Dir = path.join(tmp, 'armg3');
    fs.mkdirSync(aG3Dir);
    fs.writeFileSync(path.join(aG3Dir, 'a1.json'), JSON.stringify(file(1, 'armed', armG, { leaderprojFires: 0, hpgateFires: 1,
      gateAvoidNotes: [],
      gateAvoidLog: [{ vid: 'h1', day: 90, mid: 'reunion', name: 'Eckart', kind: 'hold', hp: 15, projHp2: null, note: 'gave reunion room — Eckart is too hurt to hold a door (15 HP)' }] })));
    const jG3 = judge(cGDir, aG3Dir, ANCHOR);
    check('§G3 other-gate conservatism: a hold-avoided pool door scores BAD for D1 (not this gate\u2019s credit)',
      jG3.matchedPool.otherGate === 1 && jG3.matchedPool.armedBad === 1 && jG3.bars.D1.pass === false, jG3.matchedPool);
    check('§G3 D6 passes on the other-gate shape (1 hold fire, 1 hold log entry)',
      jG3.bars.D6.pass === true && jG3.bars.D6.armed.entries === 1 && jG3.bars.D6.armed.byKind.hold === 1, jG3.bars.D6);
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
    check('§I non-door rows excluded: control with only a world-tick row has 0 fought doors and D1 fails as unmeasurable',
      jI.control.fought === 0 && jI.bars.D1.pass === false && /unmeasurable/.test(jI.bars.D1.reason || ''), jI.control);
    // §J — B1 secondary is rate-only: armed 1/1 vs control 1/1
    // passes on rate even though the armed row count is below the
    // old >= 3 floor (the floor is dropped for this arm).
    check('§J B1 secondary (rate-only): armed 1/1 ally3Vid vs control 1/1 — passes without the row floor',
      jG.bars.B1rate.pass === true && jG.bars.B1rate.armedRows === 1, jG.bars.B1rate);
    // §K — D1 empty pool with fought doors: control fights only
    // safe doors (leaders 90, 100) -> pool 0 -> D1 unmeasurable.
    const safeCtl = [
      doorRow({ day: 90, outcome: 'vKill', rounds: 5, mDealt: 1100, leaderEntryHp: 90, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'] }),
      doorRow({ day: 91, outcome: 'vKill', rounds: 5, mDealt: 1100, leaderEntryHp: 100, roundsDetail: [{ round: 1, mHpStart: 1050 }], flPreRoundDealt: 50, mHpStartRec: 1100, log: ['R1: h1 strikes for 40 (1060 left)', 'R5: c3 strikes for 60 (0 left)'] }),
    ];
    const cKDir = path.join(tmp, 'ctlk'), aKDir = path.join(tmp, 'armk');
    fs.mkdirSync(cKDir); fs.mkdirSync(aKDir);
    fs.writeFileSync(path.join(cKDir, 'c1.json'), JSON.stringify(file(1, 'control', safeCtl)));
    fs.writeFileSync(path.join(aKDir, 'a1.json'), JSON.stringify(file(1, 'armed', safeCtl)));
    const jK = judge(cKDir, aKDir, ANCHOR);
    check('§K D1 empty pool with fought doors: control pool 0 (leaders 90/100) — D1 fails as unmeasurable',
      jK.bars.D1.pass === false && jK.bars.D1.pool === 0 && /unmeasurable/.test(jK.bars.D1.reason || ''), jK.bars.D1);
    // §L — D1fought secondary: a working gate leaves no armed
    // fought door in its pool (the §B shape) — reported, never a
    // failure on its own.
    check('§L D1fought secondary: §B armed leg fought 0 pool doors (all avoided) — reported as unmeasurable on the armed leg, not a failure',
      jB.bars.D1fought.armedN === 0 && jB.bars.D1fought.controlN === 4 && /unmeasurable/.test(jB.bars.D1fought.reason || ''), jB.bars.D1fought);
    // §M — D6 durability, mixed kinds: armed fires 1 hold + 1 lead
    // + 2 proj and the log carries exactly those 4 entries, per
    // kind — D6 passes and the per-kind breakdown matches.
    const cMDir = path.join(tmp, 'ctlm'), aMDir = path.join(tmp, 'armm');
    fs.mkdirSync(cMDir); fs.mkdirSync(aMDir);
    fs.writeFileSync(path.join(cMDir, 'c1.json'), JSON.stringify(file(1, 'control', ctlG)));
    fs.writeFileSync(path.join(aMDir, 'a1.json'), JSON.stringify(file(1, 'armed', armG, {
      hpgateFires: 1, leaderhpgateFires: 1, leaderprojFires: 2,
      gateAvoidLog: [
        { vid: 'h1', day: 90, mid: 'reunion', name: 'Eckart', kind: 'hold', hp: 15, projHp2: null, note: 'gave reunion room — Eckart is too hurt to hold a door (15 HP)' },
        { vid: 'h1', day: 91, mid: 'eater', name: 'Petra', kind: 'lead', hp: 20, projHp2: null, note: 'gave eater room — Petra is too hurt to lead a door (20 HP)' },
        { vid: 'h1', day: 92, mid: 'audit', name: 'Petra', kind: 'proj', hp: 60, projHp2: 10, note: 'gave audit room — Petra is too hurt to lead a door (projected 60 HP, 10 HP in two rounds)' },
        { vid: 'h1', day: 93, mid: 'herald', name: 'Petra', kind: 'proj', hp: 70, projHp2: 20, note: 'gave herald room — Petra is too hurt to lead a door (projected 70 HP, 20 HP in two rounds)' },
      ],
    })));
    const jM = judge(cMDir, aMDir, ANCHOR);
    check('§M D6 durability, mixed kinds: 4 fires (1 hold + 1 lead + 2 proj) and 4 log entries — D6 passes',
      jM.bars.D6.pass === true && jM.bars.D6.armed.entries === 4 && jM.bars.D6.armed.fires === 4, jM.bars.D6);
    check('§M D6 per-kind breakdown matches the counters (hold 1, lead 1, proj 2, other 0)',
      jM.bars.D6.armed.byKind.hold === 1 && jM.bars.D6.armed.byKind.lead === 1 && jM.bars.D6.armed.byKind.proj === 2 && jM.bars.D6.armed.byKind.other === 0 &&
      jM.bars.D6.armed.counters.hold === 1 && jM.bars.D6.armed.counters.lead === 1 && jM.bars.D6.armed.counters.proj === 2, jM.bars.D6.armed);
    // §N — D6 durability, a missing entry: the same mixed-kind
    // fires, but the log is short one proj entry — D6 fails and
    // names the proj gap.
    const aNDir2 = path.join(tmp, 'armn');
    fs.mkdirSync(aNDir2);
    fs.writeFileSync(path.join(aNDir2, 'a1.json'), JSON.stringify(file(1, 'armed', armG, {
      hpgateFires: 1, leaderhpgateFires: 1, leaderprojFires: 2,
      gateAvoidLog: [
        { vid: 'h1', day: 90, mid: 'reunion', name: 'Eckart', kind: 'hold', hp: 15, projHp2: null, note: 'gave reunion room — Eckart is too hurt to hold a door (15 HP)' },
        { vid: 'h1', day: 91, mid: 'eater', name: 'Petra', kind: 'lead', hp: 20, projHp2: null, note: 'gave eater room — Petra is too hurt to lead a door (20 HP)' },
        { vid: 'h1', day: 92, mid: 'audit', name: 'Petra', kind: 'proj', hp: 60, projHp2: 10, note: 'gave audit room — Petra is too hurt to lead a door (projected 60 HP, 10 HP in two rounds)' },
      ],
    })));
    const jN = judge(cMDir, aNDir2, ANCHOR);
    check('§N D6 fails when the log is short one proj entry (3 entries vs 4 fires) and names the proj gap',
      jN.bars.D6.pass === false && jN.bars.D6.armed.entries === 3 && jN.bars.D6.armed.fires === 4 &&
      /proj log 1 != leaderprojFires 2/.test(jN.bars.D6.reason || ''), jN.bars.D6);
    // §O — substrate: armed file without gateAvoidLog.
    const badLog = file(1, 'armed', armB);
    delete badLog.gateAvoidLog;
    const aODir = path.join(tmp, 'armlog');
    fs.mkdirSync(aODir);
    fs.writeFileSync(path.join(aODir, 'a1.json'), JSON.stringify(badLog));
    const jO = judge(cBDir, aODir, ANCHOR);
    check('§O substrate: armed file without gateAvoidLog — D5 fails and names the file',
      jO.bars.D5.pass === false && jO.bars.D5.armed.bad.length === 1 && /gateAvoidLog/.test(jO.bars.D5.armed.bad[0]), jO.bars.D5);
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
  console.log('analyze-gateavoid-b selftest: ' + passed + ' passed, ' + failed + ' failed');
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
    console.error('usage: node scripts/analyze-gateavoid-b.js --control <dir> --armed <dir> --anchor <40-hex> [--json] | --selftest');
    process.exit(2);
  }
  const result = judge(control, armed, anchor);
  if (asJson) console.log(JSON.stringify(result, null, 2));
  else {
    console.log('gateavoid judge: ' + (result.pass ? 'PASS' : 'FAIL'));
    console.log('  control fought doors: ' + result.control.fought + ' (vFlee ' + result.control.vFlee + ', vKill ' + result.control.vKill + ', mFlee ' + result.control.mFlee + ', vDie ' + result.control.vDie + ')');
    console.log('  armed fought doors: ' + result.armed.fought + ' (vFlee ' + result.armed.vFlee + ', vKill ' + result.armed.vKill + ', mFlee ' + result.armed.mFlee + ', vDie ' + result.armed.vDie + ')');
    console.log('  D1 bad-outcome rate on the matched projection pool (PRIMARY, control pool ' + result.bars.D1.pool + ' doors, leader <= 75 HP): control bad ' + result.bars.D1.controlBad + '/' + result.bars.D1.pool + ' vs armed bad ' + result.bars.D1.armedBad + '/' + result.bars.D1.pool +
      ' (drop ' + (result.bars.D1.rateDropPp == null ? 'null' : result.bars.D1.rateDropPp.toFixed(1)) + 'pp; proj avoids ' + result.bars.D1.projAvoids + ', kills ' + result.bars.D1.kills + ', mFlees ' + result.bars.D1.mFlees + ', flees ' + result.bars.D1.flees + ', dies ' + result.bars.D1.dies + ', divergence ' + result.bars.D1.divergence + ', other-gate ' + result.bars.D1.otherGate + ') -> ' + (result.bars.D1.pass ? 'PASS' : 'FAIL') +
      (result.bars.D1.reason ? ' (' + result.bars.D1.reason + ')' : ''));
    console.log('  D1fought (reported secondary): fought pool doors control ' + result.bars.D1fought.controlN + ' / armed ' + result.bars.D1fought.armedN +
      (result.bars.D1fought.reason ? ' (' + result.bars.D1fought.reason + ')' : ''));
    console.log('  D2 kill rate per fought door: armed ' + (result.armed.killRate == null ? 'null' : result.armed.killRate.toFixed(3)) +
      ' (' + result.armed.vKill + '/' + result.armed.fought + ') vs control ' +
      (result.control.killRate == null ? 'null' : result.control.killRate.toFixed(3)) +
      ' (' + result.control.vKill + '/' + result.control.fought + ') -> ' + (result.bars.D2.pass ? 'PASS' : 'FAIL'));
    console.log('  D3 dmg/door: armed ' + (result.armed.dmgPerDoor == null ? 'null' : result.armed.dmgPerDoor.toFixed(1)) +
      ' vs control ' + (result.control.dmgPerDoor == null ? 'null' : result.control.dmgPerDoor.toFixed(1)) + ' (per-round: armed ' +
      (result.armed.dmgPerRound == null ? 'null' : result.armed.dmgPerRound.toFixed(1)) + ' vs control ' +
      (result.control.dmgPerRound == null ? 'null' : result.control.dmgPerRound.toFixed(1)) + ') -> ' + (result.bars.D3.pass ? 'PASS' : 'FAIL'));
    console.log('  D4 projection-gate fires: armed ' + result.armedProjFires + ' vs control ' + result.controlProjFires +
      ' (leader fires: armed ' + result.armedLeaderFires + ', control ' + result.controlLeaderFires +
      '; whole-party fires: armed ' + result.armedGateFires + ', control ' + result.controlGateFires + ') -> ' + (result.bars.D4.pass ? 'PASS' : 'FAIL') +
      (result.bars.D4.reason ? ' (' + result.bars.D4.reason + ')' : ''));
    console.log('  D5 substrate: control bad ' + result.bars.D5.control.bad.length + ', armed bad ' + result.bars.D5.armed.bad.length + ' -> ' + (result.bars.D5.pass ? 'PASS' : 'FAIL'));
    if (!result.bars.D5.pass) {
      result.bars.D5.control.bad.concat(result.bars.D5.armed.bad).forEach(function (b) { console.log('    D5: ' + b); });
    }
    console.log('  D6 durability: control log ' + result.bars.D6.control.entries + ' entries vs ' + result.bars.D6.control.fires + ' fires, armed log ' + result.bars.D6.armed.entries + ' entries vs ' + result.bars.D6.armed.fires + ' fires -> ' + (result.bars.D6.pass ? 'PASS' : 'FAIL') +
      (result.bars.D6.reason ? ' (' + result.bars.D6.reason + ')' : ''));
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
      '; projection control ' + result.controlProjFires + ' / armed ' + result.armedProjFires +
      '; notes hold/lead/proj armed ' + result.armedGateNotes.hold + '/' + result.armedGateNotes.lead + '/' + result.armedGateNotes.proj +
      '; log hold/lead/proj armed ' + result.armedGateLog.hold + '/' + result.armedGateLog.lead + '/' + result.armedGateLog.proj);
    console.log('  avoided doors (S9, reported): ' + result.avoided.n + ' control doors with no armed counterpart' +
      ' (proj-attributed ' + result.avoided.proj + ', lead-attributed ' + result.avoided.lead + ', hold-attributed ' + result.avoided.hold + ', divergence ' + result.avoided.divergence + ')' +
      (result.avoided.n > 0 ? ' — ' + result.avoided.list.map(function (x) { return x.seed + ' d' + x.day + ' ' + x.mid + ' (' + x.controlOutcome + ', ' + x.attribution + ')'; }).join(', ') : ''));
    console.log('  conversions (S2, reported): ' + result.conversions.pairs + ' matched control flees -> ' +
      result.conversions.conversions + ' kills, ' + result.conversions.laterFlees + ' later flees, ' +
      result.conversions.noChange + ' no-change, ' + result.conversions.other + ' other');
    console.log('  S10 leader projection (fought doors): control ' + JSON.stringify(result.control.projBands) + ', armed ' + JSON.stringify(result.armed.projBands) +
      ' (dead1 = projected-dead in 1 round, dead2 = in 2, collapse2 = at/below floor in 2)');
    if (result.armedProjection.fired.length || result.controlProjection.fired.length) {
      console.log('  S10 fired doors: ' + result.armedProjection.fired.concat(result.controlProjection.fired).map(function (x) {
        return x.seed + ' d' + x.day + ' ' + x.mid + ' ' + x.name + ' ' + x.hp + ' HP (' + x.kind + ', proj1 ' + x.projHp1 + ', proj2 ' + x.projHp2 + (x.leaderKnown ? ', leader' : ', member') + ')';
      }).join('; '));
    }
  }
  process.exit(result.pass ? 0 : 1);
}

module.exports = { doorStats: doorStats, foughtDoors: foughtDoors, substrateCheck: substrateCheck, wave4KillRate: wave4KillRate, conversions: conversions, matchedPool: matchedPool, gateFires: gateFires, gateNotes: gateNotes, gateLog: gateLog, durability: durability, avoidedDoors: avoidedDoors, projection: projection, projectionBand: projectionBand, judge: judge, selftest: selftest };
