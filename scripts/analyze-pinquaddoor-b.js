// analyze-pinquaddoor-b.js — pin census, arm sim-pinquaddoor-b
// (finding #2619: PIN THE QUAD + OPEN THE DOOR — the lever).
//
// WHAT IT MEASURES: for every v4encounters row in a corpus dir,
//   sense return = len(allyVids) — the sense's return, recorded from
//     opts by the driver (NOT who joined: the engine's joined allies
//     are allyVid / ally2Vid / ally3Vid on the row);
//   shouts fired = count of non-null allyVid/ally2Vid/ally3Vid —
//     each shout IS one hopeless round (fieldFights.js else-if
//     chain, one branch per round's break check, hopeless first
//     evaluated at round >= 2), cross-checked against the SHOUTREC
//     shoutRound / shout2Round / shout3Round fields when present;
//   allyFromStart — the at-the-door path, set only by aidFight;
//   pinned / pinnedAllies — whether the fighter carried a live pin
//     at fight time (Game.pinnedQuadAllies, read by the driver);
//   vKill + ally3Dealt — the frozen bars: the third ally's damage
//     and the wave-4 kill conversion, corpus-wide and pinned-subset.
//   rounds, outcome, and an end cause read from outcome + log
//     (evade / contact-finish / signature-exit / low-HP flee /
//     death / monster-flee / killed / flee).
// WIDE secondaries (sim-pinquaddoor-wide-b, prereg S1–S4; REPORTED,
// never re-scored): S1 pin-subset B1 rate (ally3Vid among pinned
// fights); S2 drive-offs (mFlee) on pinned fights + pinned end-cause
// taxonomy; S3 SEEK decisions split by pinned vs unpinned fighter
// (v4gates rows carry `pinned` + `pinnedAllies` since the wide
// driver); S4 pinned fights at ALL waves (the `pinFights` array —
// the pin's blast radius is wider than the wave-4 census).
// Aggregates: the three-vid encounter census, the ladder-works
// control (shout-2 rate in fights of >= 4 rounds), the
// allyFromStart count, the PIN census (pinned fights, ally3Vid
// rate, ally3Dealt totals, kill conversion corpus-wide and
// pinned-subset), and the wall numbers per corpus.
// No game code is read or executed here — this is a pure reader
// of corpus JSON (the frozen dmgshape corpus or a fresh sense3 leg).
// Usage:
//   node scripts/analyze-pinquaddoor-b.js <corpus-dir> [--json out.json]
//   node scripts/analyze-pinquaddoor-b.js --selftest
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

function shoutsFired(e) {
  return (e.allyVid ? 1 : 0) + (e.ally2Vid ? 1 : 0) + (e.ally3Vid ? 1 : 0);
}
function senseReturn(e) { return (e.allyVids || []).length; }

function endCause(e) {
  const log = (e.log || []).join('\n');
  const rounds = e.rounds | 0;
  if (rounds === 0) {
    if (e.outcome === 'evade') return 'evade';
    if (e.outcome === 'vKill') return 'contact-finish';
    return 'no-fight:' + (e.outcome || 'null');
  }
  if (/can't kill a suburb|They walk out|Navigation is victory/.test(log)) return 'signature-exit';
  if (/stands down/.test(log) && e.outcome === 'mFlee') return 'signature-exit';
  if (e.outcome === 'vDie') return 'death';
  if (e.outcome === 'vFlee') return /past holding/.test(log) ? 'low-HP flee' : 'flee';
  if (e.outcome === 'mFlee') return 'monster-flee';
  if (e.outcome === 'vKill') return 'killed';
  return 'other:' + (e.outcome || 'null');
}

function classifyEncounter(seed, e) {
  const sf = shoutsFired(e);
  // SHOUTREC cross-check: the engine's own shout rounds must agree
  // with the joined-ally fields (shoutRound set ⟺ allyVid set, etc.).
  // shout3Round is null on slot-absent code — recorded, never defaulted.
  // When the corpus carries no SHOUTREC fields at all (the dmgshape
  // driver never recorded them), the check is null — unverifiable,
  // not a failure. PINQUAD: a door fight (allyFromStart) joins allies
  // WITHOUT shouting, so its shout rounds (null) can never agree
  // with its joined allies — the check is null there too, by design:
  // the door path has no shout rounds to cross-check, and counting
  // it as a mismatch would flag every pinned fight as an error.
  const shoutRounds = [];
  if (typeof e.shoutRound === 'number') shoutRounds.push(e.shoutRound);
  if (typeof e.shout2Round === 'number') shoutRounds.push(e.shout2Round);
  if (typeof e.shout3Round === 'number') shoutRounds.push(e.shout3Round);
  const hasShoutRec = ('shoutRound' in e) || ('shout2Round' in e) || ('shout3Round' in e);
  return {
    seed: seed, day: e.day, vid: e.vid, mid: e.mid, wave: e.wave,
    origin: e.origin || null,
    senseReturn: senseReturn(e),
    shoutsFired: sf,
    shoutRounds: shoutRounds,
    shoutCrossOk: (hasShoutRec && !e.allyFromStart) ? (shoutRounds.length === sf) : null,
    allyFromStart: !!e.allyFromStart,
    pinned: !!e.pinned,
    pinnedAllies: (e.pinnedAllies || []).slice(),
    vKill: !!e.vKill,
    rounds: e.rounds | 0,
    outcome: e.outcome || null,
    endCause: endCause(e),
    allyVid: e.allyVid || null,
    ally2Vid: e.ally2Vid || null,
    ally3Vid: e.ally3Vid || null,
    ally3Dealt: (typeof e.ally3Dealt === 'number' ? e.ally3Dealt : null),
    intent: (typeof e.intent === 'string' ? e.intent : null),
    log: e.log || [],
  };
}

const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };

// classifyPinFight(seed, e): the S4 row — a pinned fight at ANY
// wave. The pin row carries no allyVids/log (no sense to re-derive),
// so endCause reads outcome + rounds only; the log-based
// signature-exit / low-HP-flee readings are unavailable here and
// never faked — a pin row's endCause is the outcome taxonomy.
function classifyPinFight(seed, e) {
  const rounds = e.rounds | 0;
  let endCauseV;
  if (rounds === 0) {
    if (e.outcome === 'evade') endCauseV = 'evade';
    else if (e.outcome === 'vKill') endCauseV = 'contact-finish';
    else endCauseV = 'no-fight:' + (e.outcome || 'null');
  } else if (e.outcome === 'vDie') endCauseV = 'death';
  else if (e.outcome === 'vFlee') endCauseV = 'flee';
  else if (e.outcome === 'mFlee') endCauseV = 'monster-flee';
  else if (e.outcome === 'vKill') endCauseV = 'killed';
  else endCauseV = 'other:' + (e.outcome || 'null');
  return {
    seed: seed, day: e.day, vid: e.vid, mid: e.mid, wave: e.wave,
    origin: e.origin || null,
    rounds: rounds, outcome: e.outcome || null, endCause: endCauseV,
    vKill: !!e.vKill,
    ally3Vid: e.ally3Vid || null,
    ally3Dealt: (typeof e.ally3Dealt === 'number' ? e.ally3Dealt : null),
    allyFromStart: !!e.allyFromStart,
    pinnedAllies: (e.pinnedAllies || []).slice(),
  };
}

function gateCounts(list) {
  return {
    total: list.length,
    seek: list.filter(function (g) { return g.result === 'seek'; }).length,
    avoid: list.filter(function (g) { return g.result === 'avoid'; }).length,
    other: list.filter(function (g) { return g.result !== 'seek' && g.result !== 'avoid'; }).length,
  };
}
function analyzeFile(data) {
  const seed = data.seed;
  const rows = (data.v4encounters || []).map(function (e) { return classifyEncounter(seed, e); });
  const threeVid = rows.filter(function (r) { return r.senseReturn >= 3; });
  const fought = rows.filter(function (r) { return r.rounds > 0; });
  const longFights = fought.filter(function (r) { return r.rounds >= 4; });
  const longWithShout2 = longFights.filter(function (r) { return !!r.ally2Vid; });
  // WIDE secondaries (S1–S4). pinRows are the all-waves census;
  // the wave-4+ pinned subset is read off the v4 rows above, so
  // S1 is computed BOTH ways and they must agree on the wave-4+
  // slice. Gate rows without a `pinned` field (pre-wide corpora)
  // are `unknown` — never counted as unpinned.
  const pinRows = (data.pinFights || []).map(function (e) { return classifyPinFight(seed, e); });
  const pinFought = pinRows.filter(function (r) { return r.rounds > 0; });
  const gates = data.v4gates || [];
  const gatePinned = gates.filter(function (g) { return g.pinned === true; });
  const gateUnpinned = gates.filter(function (g) { return g.pinned === false; });
  const gateUnknown = gates.filter(function (g) { return g.pinned !== true && g.pinned !== false; });
  return {
    seed: seed,
    files: 1,
    encounters: rows.length,
    threeVid: threeVid.length,
    threeVidFought: threeVid.filter(function (r) { return r.rounds > 0; }).length,
    threeVidMaxShouts: threeVid.reduce(function (m, r) { return Math.max(m, r.shoutsFired); }, 0),
    threeVidAlly3: threeVid.filter(function (r) { return !!r.ally3Vid; }).length,
    threeVidEndCauses: threeVid.reduce(function (o, r) { o[r.endCause] = (o[r.endCause] || 0) + 1; return o; }, {}),
    allyFromStart: rows.filter(function (r) { return r.allyFromStart; }).length,
    allyFromStartExpedition: rows.filter(function (r) { return r.allyFromStart && r.origin === 'expedition'; }).length,
    ally3Vid: rows.filter(function (r) { return !!r.ally3Vid; }).length,
    // PIN census (frozen bars B1–B3): pinned fights, the third ally's
    // entries + damage, and kill conversion corpus-wide + pinned-subset.
    pinnedFights: rows.filter(function (r) { return r.pinned; }).length,
    pinnedAlly3Vid: rows.filter(function (r) { return r.pinned && !!r.ally3Vid; }).length,
    pinnedAlly3Dealt: rows.filter(function (r) { return r.pinned; }).reduce(function (a, r) { return a + (r.ally3Dealt || 0); }, 0),
    pinnedAlly3DealtMax: rows.filter(function (r) { return r.pinned; }).reduce(function (m, r) { return Math.max(m, r.ally3Dealt || 0); }, 0),
    pinnedKills: rows.filter(function (r) { return r.pinned && r.vKill; }).length,
    pinnedKillConv: (function () { var pf = rows.filter(function (r) { return r.pinned; }); return pf.length ? rows.filter(function (r) { return r.pinned && r.vKill; }).length / pf.length : null; })(),
    // WIDE secondaries (S1–S4; REPORTED, never re-scored).
    pinFightsAll: pinRows.length,
    pinFightsByWave: pinRows.reduce(function (o, r) { const k = 'w' + (r.wave | 0); o[k] = (o[k] || 0) + 1; return o; }, {}),
    pinFightsFought: pinFought.length,
    pinAlly3VidAll: pinRows.filter(function (r) { return !!r.ally3Vid; }).length,
    pinAlly3RateAll: pinRows.length ? pinRows.filter(function (r) { return !!r.ally3Vid; }).length / pinRows.length : null,
    pinAlly3RateFought: pinFought.length ? pinFought.filter(function (r) { return !!r.ally3Vid; }).length / pinFought.length : null,
    pinDriveOffs: pinRows.filter(function (r) { return r.outcome === 'mFlee'; }).length,
    pinEndCauses: pinRows.reduce(function (o, r) { o[r.endCause] = (o[r.endCause] || 0) + 1; return o; }, {}),
    pinAlly3DealtAll: pinRows.reduce(function (a, r) { return a + (r.ally3Dealt || 0); }, 0),
    pinKillsAll: pinRows.filter(function (r) { return r.vKill; }).length,
    gateSeekPinned: gateCounts(gatePinned),
    gateSeekUnpinned: gateCounts(gateUnpinned),
    gateSeekUnknown: gateCounts(gateUnknown),
    pinRows: pinRows,
    rows: rows,
    ally3DealtTotal: rows.reduce(function (a, r) { return a + (r.ally3Dealt || 0); }, 0),
    ally3DealtMax: rows.reduce(function (m, r) { return Math.max(m, r.ally3Dealt || 0); }, 0),
    kills: rows.filter(function (r) { return r.vKill; }).length,
    killConv: rows.length ? rows.filter(function (r) { return r.vKill; }).length / rows.length : null,
    shout1: rows.filter(function (r) { return !!r.allyVid; }).length,
    shout2: rows.filter(function (r) { return !!r.ally2Vid; }).length,
    longFights: longFights.length,
    longWithShout2: longWithShout2.length,
    shoutCrossBad: rows.filter(function (r) { return r.shoutCrossOk === false; }).length,
    launches: (data.v4departs || []).filter(function (r) { return r.result === 'launch' && (r.targetWave | 0) >= 4; }).length,
    quadLaunches: (data.v4departs || []).filter(function (r) { return r.result === 'launch' && (r.targetWave | 0) >= 4 && (r.partySize | 0) >= 4; }).length,
    // Wall numbers (per-seed, descriptive).
    won: !!data.won,
    national: (RANK_ORDER[data.scaleRank] || 0) >= 3,
    nationalStanding: (data.standing | 0) >= 200,
    table: !!data.won,
    maxWave: data.maxWave | 0,
    standing: data.standing | 0,
    days: data.days | 0,
    gameDays: data.gameDays | 0,
    endReason: data.endReason || null,
    villageLost: !!data.villageLost,
    deaths: (data.deaths || []).length,
    instrumentErrors: (data.instrumentErrors || []).length,
    slotPresent: data.slotPresent === true,
    pinPresent: data.pinPresent === true,
    allyslot3Flag: (data.allyslot3Flag === undefined ? null : data.allyslot3Flag),
    pinquadFlag: (data.pinquadFlag === undefined ? null : data.pinquadFlag),
    rows: rows,
  };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  const out = {
    dir: dir, files: 0, errors: 0,
    encounters: 0, threeVid: 0, threeVidFought: 0, threeVidMaxShouts: 0,
    threeVidAlly3: 0, threeVidEndCauses: {},
    allyFromStart: 0, allyFromStartExpedition: 0, ally3Vid: 0, shout1: 0, shout2: 0,
    longFights: 0, longWithShout2: 0, shoutCrossBad: 0,
    launches: 0, quadLaunches: 0,
    pinnedFights: 0, pinnedAlly3Vid: 0, pinnedAlly3Dealt: 0, pinnedAlly3DealtMax: 0,
    pinnedKills: 0, ally3DealtTotal: 0, ally3DealtMax: 0, kills: 0,
    pinFightsAll: 0, pinFightsByWave: {}, pinFightsFought: 0,
    pinAlly3VidAll: 0, pinDriveOffs: 0, pinEndCauses: {},
    pinAlly3DealtAll: 0, pinKillsAll: 0,
    gateSeekPinned: { total: 0, seek: 0, avoid: 0, other: 0 },
    gateSeekUnpinned: { total: 0, seek: 0, avoid: 0, other: 0 },
    gateSeekUnknown: { total: 0, seek: 0, avoid: 0, other: 0 },
    pinRowsAll: [],
    wins: 0, national: 0, nationalStanding: 0, table: 0,
    wave5: 0, wave4: 0, survived: 0, villageLost: 0,
    standings: [], gameDays: [], deaths: 0, instrumentErrors: 0,
    threeVidRows: [], perSeed: [],
  };
  for (const f of files) {
    let data;
    try { data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch (e) { out.errors++; continue; }
    out.files++;
    const a = analyzeFile(data);
    out.encounters += a.encounters;
    out.threeVid += a.threeVid;
    out.threeVidFought += a.threeVidFought;
    out.threeVidMaxShouts = Math.max(out.threeVidMaxShouts, a.threeVidMaxShouts);
    out.threeVidAlly3 += a.threeVidAlly3;
    for (const k of Object.keys(a.threeVidEndCauses)) out.threeVidEndCauses[k] = (out.threeVidEndCauses[k] || 0) + a.threeVidEndCauses[k];
    out.allyFromStart += a.allyFromStart;
    out.allyFromStartExpedition += a.allyFromStartExpedition;
    out.ally3Vid += a.ally3Vid;
    out.pinnedFights += a.pinnedFights;
    out.pinnedAlly3Vid += a.pinnedAlly3Vid;
    out.pinnedAlly3Dealt += a.pinnedAlly3Dealt;
    out.pinnedAlly3DealtMax = Math.max(out.pinnedAlly3DealtMax, a.pinnedAlly3DealtMax);
    out.pinnedKills += a.pinnedKills;
    out.pinFightsAll += a.pinFightsAll;
    for (const k of Object.keys(a.pinFightsByWave)) out.pinFightsByWave[k] = (out.pinFightsByWave[k] || 0) + a.pinFightsByWave[k];
    out.pinFightsFought += a.pinFightsFought;
    out.pinAlly3VidAll += a.pinAlly3VidAll;
    out.pinDriveOffs += a.pinDriveOffs;
    for (const k of Object.keys(a.pinEndCauses)) out.pinEndCauses[k] = (out.pinEndCauses[k] || 0) + a.pinEndCauses[k];
    out.pinAlly3DealtAll += a.pinAlly3DealtAll;
    out.pinKillsAll += a.pinKillsAll;
    for (const k of ['total', 'seek', 'avoid', 'other']) {
      out.gateSeekPinned[k] += a.gateSeekPinned[k];
      out.gateSeekUnpinned[k] += a.gateSeekUnpinned[k];
      out.gateSeekUnknown[k] += a.gateSeekUnknown[k];
    }
    out.pinRowsAll = out.pinRowsAll.concat(a.pinRows);
    out.ally3DealtTotal += a.ally3DealtTotal;
    out.ally3DealtMax = Math.max(out.ally3DealtMax, a.ally3DealtMax);
    out.kills += a.kills;
    out.shout1 += a.shout1;
    out.shout2 += a.shout2;
    out.longFights += a.longFights;
    out.longWithShout2 += a.longWithShout2;
    out.shoutCrossBad += a.shoutCrossBad;
    out.launches += a.launches;
    out.quadLaunches += a.quadLaunches;
    if (a.won) out.wins++;
    if (a.national) out.national++;
    if (a.nationalStanding) out.nationalStanding++;
    if (a.table) out.table++;
    if (a.maxWave >= 5) out.wave5++;
    if (a.maxWave >= 4) out.wave4++;
    if (a.endReason === 'survived' || (a.gameDays | 0) >= 150) out.survived++;
    if (a.villageLost) out.villageLost++;
    out.standings.push(a.standing);
    out.gameDays.push(a.gameDays);
    out.deaths += a.deaths;
    out.instrumentErrors += a.instrumentErrors;
    out.threeVidRows = out.threeVidRows.concat(a.rows.filter(function (r) { return r.senseReturn >= 3; }));
    out.pinnedRows = (out.pinnedRows || []).concat(a.rows.filter(function (r) { return r.pinned; }));
    out.perSeed.push({
      seed: a.seed, encounters: a.encounters, threeVid: a.threeVid,
      threeVidMaxShouts: a.threeVidMaxShouts, allyFromStart: a.allyFromStart,
      allyFromStartExpedition: a.allyFromStartExpedition,
      ally3Vid: a.ally3Vid, ally3DealtTotal: a.ally3DealtTotal,
      pinnedFights: a.pinnedFights, pinnedAlly3Vid: a.pinnedAlly3Vid,
      pinnedAlly3Dealt: a.pinnedAlly3Dealt, pinnedKills: a.pinnedKills,
      pinFightsAll: a.pinFightsAll, pinFightsByWave: a.pinFightsByWave,
      pinAlly3VidAll: a.pinAlly3VidAll, pinDriveOffs: a.pinDriveOffs,
      pinKillsAll: a.pinKillsAll, gateSeekPinned: a.gateSeekPinned,
      gateSeekUnpinned: a.gateSeekUnpinned,
      kills: a.kills, killConv: a.killConv,
      shout1: a.shout1, shout2: a.shout2, longFights: a.longFights,
      longWithShout2: a.longWithShout2, launches: a.launches,
      quadLaunches: a.quadLaunches, maxWave: a.maxWave,
      standing: a.standing, gameDays: a.gameDays,
      endReason: a.endReason, won: a.won,
    });
  }
  out.medianSurvival = out.gameDays.length
    ? out.gameDays.slice().sort(function (x, y) { return x - y; })[Math.floor(out.gameDays.length / 2)] : null;
  out.killConv = out.encounters ? out.kills / out.encounters : null;
  out.pinnedKillConv = out.pinnedFights ? out.pinnedKills / out.pinnedFights : null;
  // WIDE secondaries (S1–S4): the pin-subset B1 rate on the wave-4+
  // slice must equal the all-waves rate restricted to wave 4+; both
  // are printed so a disagreement is visible, not hidden.
  out.pinAlly3RateW4 = out.pinnedFights ? out.pinnedAlly3Vid / out.pinnedFights : null;
  out.pinAlly3RateAll = out.pinFightsAll ? out.pinAlly3VidAll / out.pinFightsAll : null;
  out.pinAlly3RateFought = out.pinFightsFought ? out.pinRowsAll.filter(function (r) { return r.rounds > 0 && !!r.ally3Vid; }).length / out.pinFightsFought : null;
  return out;
}

function printCensus(a) {
  console.log('pinquaddoor census: ' + a.files + ' files, ' + a.errors + ' errors, ' + a.encounters + ' encounters');
  console.log('  three-vid encounters: ' + a.threeVid + ' (fought ' + a.threeVidFought + '), max shouts ' + a.threeVidMaxShouts + ', ally3Vid ' + a.threeVidAlly3);
  console.log('  three-vid end causes: ' + JSON.stringify(a.threeVidEndCauses));
  console.log('  allyFromStart rows: ' + a.allyFromStart + ' (expedition ' + a.allyFromStartExpedition + ') | ally3Vid rows: ' + a.ally3Vid);
  console.log('  PIN: pinned fights ' + a.pinnedFights + ', pinned ally3Vid ' + a.pinnedAlly3Vid +
    ', pinned ally3Dealt ' + a.pinnedAlly3Dealt + ' (max ' + a.pinnedAlly3DealtMax + '), pinned kills ' + a.pinnedKills +
    ' / ' + a.pinnedFights + ' (' + (a.pinnedKillConv == null ? 'n/a' : (a.pinnedKillConv * 100).toFixed(1) + '%') + ')');
  console.log('  KILLS: vKill ' + a.kills + ' / ' + a.encounters + ' (' + (a.killConv == null ? 'n/a' : (a.killConv * 100).toFixed(1) + '%') +
    ') | ally3Dealt total ' + a.ally3DealtTotal + ' (max ' + a.ally3DealtMax + ')');
  // WIDE secondaries (S1–S4; REPORTED, never re-scored).
  console.log('  S1 pin-subset B1: wave-4+ pinned ally3Vid ' + a.pinnedAlly3Vid + '/' + a.pinnedFights +
    ' (' + (a.pinAlly3RateW4 == null ? 'n/a' : (a.pinAlly3RateW4 * 100).toFixed(1) + '%') +
    ') | all-waves ' + a.pinAlly3VidAll + '/' + a.pinFightsAll +
    ' (' + (a.pinAlly3RateAll == null ? 'n/a' : (a.pinAlly3RateAll * 100).toFixed(1) + '%') +
    '); fought (' + (a.pinAlly3RateFought == null ? 'n/a' : (a.pinAlly3RateFought * 100).toFixed(1) + '%') + ')');
  console.log('  S2 pinned drive-offs (mFlee): ' + a.pinDriveOffs + ' / ' + a.pinFightsAll +
    ' pinned fights | pinned end causes: ' + JSON.stringify(a.pinEndCauses) +
    ' | pinned kills (all waves) ' + a.pinKillsAll + ' | pinned ally3Dealt (all waves) ' + a.pinAlly3DealtAll);
  console.log('  S3 SEEK by pin: pinned ' + JSON.stringify(a.gateSeekPinned) +
    ' | unpinned ' + JSON.stringify(a.gateSeekUnpinned) +
    ' | unknown (pre-wide rows) ' + JSON.stringify(a.gateSeekUnknown));
  console.log('  S4 pinned fights, all waves: ' + a.pinFightsAll + ' (fought ' + a.pinFightsFought + ') by wave ' + JSON.stringify(a.pinFightsByWave));
  console.log('  shout1 ' + a.shout1 + ' / shout2 ' + a.shout2 + ' | long fights (>=4r) ' + a.longFights + ', with shout2 ' + a.longWithShout2);
  console.log('  launches ' + a.launches + ' (quads ' + a.quadLaunches + ')');
  console.log('  wall: wins ' + a.wins + ' national ' + a.national + ' (standing>=200: ' + a.nationalStanding + ') table ' + a.table +
    ' wave5 ' + a.wave5 + '/' + a.files + ' wave4 ' + a.wave4 + '/' + a.files + ' survived ' + a.survived + '/' + a.files + ' median ' + a.medianSurvival + 'd deaths ' + a.deaths);
  for (const r of a.threeVidRows) {
    console.log('  3vid seed ' + r.seed + ' d' + r.day + ' ' + r.mid + ' fighter=' + r.vid + ' ' + r.origin +
      ' rounds=' + r.rounds + ' shouts=' + r.shoutsFired + ' ' + r.outcome + ' (' + r.endCause + ')' +
      ' allyVid=' + (r.allyVid || '-') + ' ally2Vid=' + (r.ally2Vid || '-'));
  }
  for (const r of (a.pinnedRows || [])) {
    console.log('  PIN seed ' + r.seed + ' d' + r.day + ' ' + r.mid + ' fighter=' + r.vid + ' ' + r.origin +
      ' pinned=[' + (r.pinnedAllies || []).join(',') + '] rounds=' + r.rounds + ' ' + r.outcome +
      ' ally3Vid=' + (r.ally3Vid || '-') + ' ally3Dealt=' + (r.ally3Dealt == null ? '-' : r.ally3Dealt) +
      ' door=' + !!r.allyFromStart);
  }
  for (const r of (a.pinRowsAll || [])) {
    if ((r.wave | 0) >= 4) continue; // wave-4+ pinned rows print above
    console.log('  PIN-SUBW4 seed ' + r.seed + ' d' + r.day + ' ' + r.mid + ' wave=' + r.wave + ' fighter=' + r.vid + ' ' + r.origin +
      ' pinned=[' + (r.pinnedAllies || []).join(',') + '] rounds=' + r.rounds + ' ' + r.outcome +
      ' (' + r.endCause + ')' + ' ally3Vid=' + (r.ally3Vid || '-') + ' ally3Dealt=' + (r.ally3Dealt == null ? '-' : r.ally3Dealt));
  }
}

// ================= SELFTEST =================
// DMGPIN RE-REGISTRATION (sim-dmgpin-reprereg-b, findings #2605/#2619):
// P1 freshness is priced WITHOUT mHpStart — recoverMHpStart nulls it
// on every vKill row by design (driver: the killing blow may overkill,
// so entry HP is refused rather than guessed). The judge is the
// roundsDetail-derived entry HP, cross-checked by the dealt bound and
// by mHpStartRec (the diagnostic CONTACTREC value — never a judge).
// A "door fight" is a wave-4+ encounter row with origin 'expedition',
// allyFromStart true, and pinned true (the frozen definition).
function isDoorFight(e) {
  return !!e && e.origin === 'expedition' && !!e.allyFromStart && !!e.pinned && ((e.wave | 0) >= 4);
}
// Entry HP from the row's own roundsDetail: R1 mHpStart is the
// monster's HP at the start of round 1 (after the volley) and
// flPreRoundDealt is the pre-round damage (the volley), so their sum
// is the entry HP. Exact, structured fields only. Null when the row
// carries no roundsDetail (only 36/73 kill rows across prior corpora
// do — the dealt bound is the fallback for those).
function deriveDoorEntryHp(e) {
  if (!e || !Array.isArray(e.roundsDetail) || e.roundsDetail.length === 0) return null;
  const r1 = e.roundsDetail[0];
  if (!r1 || typeof r1.mHpStart !== 'number' || !isFinite(r1.mHpStart)) return null;
  const pre = (typeof e.flPreRoundDealt === 'number' && isFinite(e.flPreRoundDealt)) ? e.flPreRoundDealt : 0;
  return r1.mHpStart + pre;
}
// The final blow: the last "strikes for N" value in the row's log.
// Strike lines are the only log lines matching that shape (the volley
// reads "it takes X for N", the broadcast echo "strikes again" with no
// number). Null when no strike line exists.
function finalBlowFromLog(e) {
  const log = (e && Array.isArray(e.log)) ? e.log : [];
  for (let i = log.length - 1; i >= 0; i--) {
    const m = /strikes for (\d+)/.exec(String(log[i]));
    if (m) return parseInt(m[1], 10);
  }
  return null;
}
// Dealt bound: entry HP > mDealt - final blow. The entry HP equals
// (damage before the final blow) + (HP remaining before the final
// blow), and mDealt - final blow IS the damage before the final blow,
// so entry HP >= the bound, with equality only when the final blow
// lands on exactly the HP remaining. A strict lower bound — looser
// than the derived value, but computable from any kill row with a
// strike line. Null when mDealt or the final blow is missing.
function dealtBound(e) {
  if (!e || typeof e.mDealt !== 'number' || !isFinite(e.mDealt)) return null;
  const fb = finalBlowFromLog(e);
  if (fb == null) return null;
  return e.mDealt - fb;
}
// The re-registered P1 judge. Returns { fresh, entryHp, method,
// dealtBound, boundOk, mHpStartRec, recAgrees }.
//   method 'roundsDetail': derived entry HP judges; the dealt bound
//     must not exceed it (boundOk) and mHpStartRec must equal it
//     when present (recAgrees) — both are cross-checks, recorded.
//   method 'dealt-bound-only': no roundsDetail; the bound alone
//     judges (bound >= floor suffices, since entry HP > bound).
//   method 'unjudgeable': neither derivation available — fresh false,
//     never guessed.   method 'not-a-door-kill': not a P1 candidate.
function freshDoorKill(e, floor) {
  const fl = (typeof floor === 'number') ? floor : 500;
  const rec = (e && typeof e.mHpStartRec === 'number' && isFinite(e.mHpStartRec)) ? e.mHpStartRec : null;
  if (!isDoorFight(e) || e.outcome !== 'vKill') {
    return { fresh: false, entryHp: null, method: 'not-a-door-kill', dealtBound: null, boundOk: null, mHpStartRec: rec, recAgrees: null };
  }
  const derived = deriveDoorEntryHp(e);
  const bound = dealtBound(e);
  if (derived != null) {
    return { fresh: derived >= fl, entryHp: derived, method: 'roundsDetail', dealtBound: bound,
      boundOk: bound == null ? null : derived >= bound,
      mHpStartRec: rec, recAgrees: rec == null ? null : rec === derived };
  }
  if (bound != null) {
    return { fresh: bound >= fl, entryHp: null, method: 'dealt-bound-only', dealtBound: bound,
      boundOk: null, mHpStartRec: rec, recAgrees: null };
  }
  return { fresh: false, entryHp: null, method: 'unjudgeable', dealtBound: null,
    boundOk: null, mHpStartRec: rec, recAgrees: null };
}
// The re-registered B1 judge: non-inferiority on the fought-subset
// ally3Vid rate, mirroring B3(a) for kills. armedFought/controlFought
// are the fought pinned-fight denominators, armedVid/controlVid the
// ally3Vid row counts; marginPp is the allowed shortfall in points
// (frozen 10pp — one row is ~7-8pp at denominators of 12-15).
// The >= 3 armed ally3Vid rows floor is kept: a rate on 1-2 rows is
// not a delivery claim. Zero denominators make the rate null and the
// bar fail (no rate, no pass).
function b1NonInferiority(armedFought, armedVid, controlFought, controlVid, marginPp) {
  const m = (typeof marginPp === 'number') ? marginPp : 10;
  const armedRate = (armedFought | 0) > 0 ? armedVid / armedFought : null;
  const controlRate = (controlFought | 0) > 0 ? controlVid / controlFought : null;
  const floorRate = controlRate == null ? null : controlRate - m / 100;
  const pass = armedRate != null && floorRate != null && armedRate >= floorRate && (armedVid | 0) >= 3;
  return { armedRate: armedRate, controlRate: controlRate, floorRate: floorRate, marginPp: m,
    armedRows: armedVid | 0, controlRows: controlVid | 0, pass: pass };
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('PASS ' + name); }
    else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  // §A classification fixtures (synthetic rows).
  const base = { day: 100, vid: 'h1', mid: 'eulogy', wave: 4, origin: 'expedition', rounds: 2,
    outcome: 'vFlee', allyVids: ['c1', 'c2', 'c3'], allyVid: 'c1', ally2Vid: null, ally3Vid: null,
    ally3Dealt: 0, allyFromStart: false, log: ['Tashi is losing — shouts for help! Daniyar charges in!',
    "Daniyar answered Tashi's shout, but Tashi is past holding — they run while running still works."] };
  const c1 = classifyEncounter(1, base);
  check('§A three-vid low-HP flee: senseReturn 3, shouts 1, endCause low-HP flee',
    c1.senseReturn === 3 && c1.shoutsFired === 1 && c1.endCause === 'low-HP flee', c1);
  check('§A SHOUTREC cross-check: recorded shoutRound agrees with the joined ally (1 recorded round, 1 shout)',
    (function () { const c = classifyEncounter(1, Object.assign({}, base, { shoutRound: 2 })); return c.shoutCrossOk === true && c.shoutRounds.length === 1; })(), null);
  check('§A SHOUTREC cross-check: a recorded shoutRound with NO joined ally is flagged as a mismatch, not hidden',
    (function () { const c = classifyEncounter(1, Object.assign({}, base, { allyVid: null, shoutRound: 2 })); return c.shoutCrossOk === false; })(), null);
  const evade = classifyEncounter(1, Object.assign({}, base, { rounds: 0, outcome: 'evade', allyVid: null, allyVids: ['c1', 'c2', 'c3'], log: ['Tashi saw Loud-Eyes in time and gave it room.'] }));
  check('§A evade: 0 rounds, endCause evade, shouts 0',
    evade.endCause === 'evade' && evade.shoutsFired === 0 && evade.rounds === 0, evade);
  const contact = classifyEncounter(1, Object.assign({}, base, { rounds: 0, outcome: 'vKill', allyVid: null, log: ['Tashi does not let it slip away — they close in and strike with the kitchen knife for 12 — Big Big falls. (Contact finish)'] }));
  check('§A contact finish: 0 rounds + vKill = contact-finish',
    contact.endCause === 'contact-finish', contact);
  const suburb = classifyEncounter(1, Object.assign({}, base, { rounds: 1, mid: 'suburb', outcome: 'vFlee', allyVid: null, log: ["R1: Jorge reads the sterile streets — you can't kill a suburb. They walk out. (Navigation is victory.)"] }));
  check('§A suburb signature exit: 1 round, no shout, endCause signature-exit',
    suburb.endCause === 'signature-exit' && suburb.shoutsFired === 0, suburb);
  const death = classifyEncounter(1, Object.assign({}, base, { rounds: 3, outcome: 'vDie', allyVid: 'c1', log: ['Olivia is losing — shouts for help! Kieran charges in!'] }));
  check('§A death after one shout: endCause death, shouts 1',
    death.endCause === 'death' && death.shoutsFired === 1, death);
  const long2 = classifyEncounter(1, Object.assign({}, base, { rounds: 5, outcome: 'vFlee', allyVid: 'c1', ally2Vid: 'c2', allyVids: ['c1', 'c2'], log: ['Hassan is losing — shouts for help! Frank charges in!', 'Hassan is still losing — shouts again! Si-chan charges in!'] }));
  check('§A long two-vid fight: shouts 2, endCause flee (no past-holding line)',
    long2.shoutsFired === 2 && long2.endCause === 'flee', long2);
  const door = classifyEncounter(1, Object.assign({}, base, { allyFromStart: true, rounds: 4, outcome: 'vFlee', allyVid: 'c1', ally2Vid: 'c2', log: [] }));
  check('§A allyFromStart is carried, not dropped',
    door.allyFromStart === true, door);
  // §C analyzeDir over a synthetic two-file corpus in tmp.
  // NOTE: fixtures here are RAW encounter rows (what a driver
  // writes), not classified rows — classifyEncounter reads the raw
  // allyVids / allyVid / rounds / outcome / log fields.
  const rawEvade = { day: 100, vid: 'h1', mid: 'eater', wave: 4, origin: 'expedition', rounds: 0,
    outcome: 'evade', allyVids: ['c1', 'c2', 'c3'], allyVid: null, ally2Vid: null, ally3Vid: null,
    allyFromStart: false, log: ['Tashi saw Loud-Eyes in time and gave it room.'] };
  const rawLong2 = { day: 114, vid: 'h1', mid: 'eulogy', wave: 4, origin: 'expedition', rounds: 5,
    outcome: 'vFlee', allyVids: ['c1', 'c2'], allyVid: 'c1', ally2Vid: 'c2', ally3Vid: null,
    allyFromStart: false, log: ['Hassan is losing — shouts for help! Frank charges in!', 'Hassan is still losing — shouts again! Si-chan charges in!'] };
  // PINQUAD fixture: a pinned quad enters at the door and kills — the
  // frozen bars B1–B3 read off rows exactly like this one.
  const rawPinKill = { day: 120, vid: 'h1', mid: 'eater', wave: 4, origin: 'expedition', rounds: 6,
    outcome: 'vKill', vKill: true, allyVids: ['c1', 'c2', 'c3'], allyVid: 'c1', ally2Vid: 'c2', ally3Vid: 'c3',
    ally3Dealt: 45, allyFromStart: true, pinned: true, pinnedAllies: ['c1', 'c2', 'c3'],
    shoutRound: null, shout2Round: null, shout3Round: null,
    log: ['c1 is already at the door — charges in with h1!', 'c2 is already at the door too — charges in with h1!', 'c3 is already at the door too — charges in with h1!'] };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pinquaddoor-analyze-'));
  try {
    const f1 = { seed: 900001, won: false, scaleRank: 'regional', maxWave: 4, standing: 199, days: 150, gameDays: 150, endReason: 'survived', villageLost: false, deaths: [], instrumentErrors: [], v4departs: [{ result: 'launch', targetWave: 4, partySize: 4 }], v4encounters: [base, rawEvade] };
    const f2 = { seed: 900002, won: false, scaleRank: 'regional', maxWave: 5, standing: 530, days: 150, gameDays: 150, endReason: 'survived', villageLost: false, deaths: [], instrumentErrors: [], v4departs: [], v4encounters: [rawLong2, rawPinKill] };
    fs.writeFileSync(path.join(tmp, 'a.json'), JSON.stringify(f1));
    fs.writeFileSync(path.join(tmp, 'b.json'), JSON.stringify(f2));
    const a = analyzeDir(tmp);
    check('§C synthetic dir: 2 files, 4 encounters, 3 three-vid, max shouts 3 in three-vid (the door row joins all three without shouting)',
      a.files === 2 && a.encounters === 4 && a.threeVid === 3 && a.threeVidMaxShouts === 3,
      { files: a.files, encounters: a.encounters, threeVid: a.threeVid, threeVidMaxShouts: a.threeVidMaxShouts });
    check('§C synthetic dir: door row is not a SHOUTREC mismatch (door joins have no shout rounds — cross-check null, not false)',
      a.shoutCrossBad === 0, a.shoutCrossBad);
    check('§C synthetic dir: pin census reads the door row (1 pinned fight, 1 pinned ally3Vid, ally3Dealt 45, 1 pinned kill, killConv 1/4)',
      a.pinnedFights === 1 && a.pinnedAlly3Vid === 1 && a.pinnedAlly3Dealt === 45 && a.pinnedKills === 1 &&
      a.kills === 1 && a.ally3Vid === 1 && a.allyFromStartExpedition === 1,
      { pinnedFights: a.pinnedFights, pinnedAlly3Vid: a.pinnedAlly3Vid, pinnedAlly3Dealt: a.pinnedAlly3Dealt, pinnedKills: a.pinnedKills, kills: a.kills, ally3Vid: a.ally3Vid, allyFromStartExpedition: a.allyFromStartExpedition });
    check('§C synthetic dir: long-fight control 2/2 shout-2 (the 6-round door row counts), wall wave5 1/2, standing>=200 1/2',
      a.longFights === 2 && a.longWithShout2 === 2 && a.wave5 === 1 && a.nationalStanding === 1,
      { longFights: a.longFights, longWithShout2: a.longWithShout2, wave5: a.wave5, nationalStanding: a.nationalStanding });
    check('§C synthetic dir: allyFromStart 1, ally3Vid 1, 0 errors (both from the door row)',
      a.allyFromStart === 1 && a.ally3Vid === 1 && a.errors === 0, a);
  } finally { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {} }
  // §D driver smoke: one 30d seed on the fresh band, armed substrate
  // (slot present + PINQUAD=1).
  const { spawnSync } = require('child_process');
  const smokeDir = 'perseed-pinquaddoor-b-smoke';
  const smokePath = path.join(__dirname, '..', 'evidence', '2026-11-20', smokeDir);
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1',
    FIGHTALLY2: '1', LAUNCHSURVIVE: '1', ALLYSLOT3: '1', PINQUAD: '1',
    MODE: 'pinquaddoor', DAYS: '30',
    SEEDS: '106251', RUN: 'pinquaddoor-b-smoke', OUTDIR: smokeDir });
  const r = spawnSync(process.execPath, [path.join(__dirname, 'pinquaddoor-driver-b.js')],
    { cwd: path.join(__dirname, '..'), env: env, encoding: 'utf8', timeout: 600000 });
  check('§D driver smoke: exit 0 on one 30d seed', r.status === 0, (r.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(smokePath, 'pinquaddoor-wide-b-s106251-pinquaddoor-b-smoke-pinquaddoor.json'), 'utf8')); } catch (e) {}
  check('§D driver smoke: corpus file written', !!dd, null);
  if (dd) {
    check('§D driver smoke: flags self-describe (slotPresent true, pinPresent true, allyslot3Flag 1, pinquadFlag 1, arm pinquaddoor-b)',
      dd.slotPresent === true && dd.pinPresent === true && dd.allyslot3Flag === '1' && dd.pinquadFlag === '1' && dd.arm === 'pinquaddoor-b',
      { slotPresent: dd.slotPresent, pinPresent: dd.pinPresent, allyslot3Flag: dd.allyslot3Flag, pinquadFlag: dd.pinquadFlag, arm: dd.arm });
    check('§D driver smoke: 0 instrument errors', (dd.instrumentErrors || []).length === 0, dd.instrumentErrors);
    check('§D driver smoke: encounter rows carry intent + shout rounds + pin fields',
      (dd.v4encounters || []).every(function (e) { return ('intent' in e) && ('shoutRound' in e) && ('shout2Round' in e) && ('shout3Round' in e) && ('pinned' in e) && ('pinnedAllies' in e); }),
      (dd.v4encounters || []).length);
    // WIDE: the all-waves pin census exists (possibly empty on a
    // 30d smoke) and every gate row carries the pin fields.
    check('§D driver smoke: pinFights array present (S4 census)',
      Array.isArray(dd.pinFights), typeof dd.pinFights);
    check('§D driver smoke: every gate row carries pinned + pinnedAllies (S3 census)',
      (dd.v4gates || []).every(function (g) { return ('pinned' in g) && Array.isArray(g.pinnedAllies); }),
      (dd.v4gates || []).length);
    check('§D driver smoke: every pinFights row carries the full field set',
      (dd.pinFights || []).every(function (r) { return ('day' in r) && ('vid' in r) && ('mid' in r) && ('wave' in r) && ('origin' in r) && ('outcome' in r) && ('rounds' in r) && ('vKill' in r) && ('ally3Vid' in r) && ('ally3Dealt' in r) && ('allyFromStart' in r) && Array.isArray(r.pinnedAllies); }),
      (dd.pinFights || []).length);
  }
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  // §E wide secondaries (S1–S4) over a synthetic corpus: one
  // pinned wave-4 kill (also a v4encounters row), one pinned wave-2
  // drive-off, one pinned wave-3 evade; gate rows pinned seek +
  // pinned avoid + unpinned seek + unpinned other + one legacy row
  // with no `pinned` field (pre-wide corpora must read as unknown,
  // never as unpinned).
  const tmpE = fs.mkdtempSync(path.join(os.tmpdir(), 'pinquaddoor-wide-'));
  try {
    const pinW2 = { day: 90, vid: 'h2', mid: 'moderator', wave: 2, origin: 'expedition', rounds: 3,
      outcome: 'mFlee', vKill: false, ally3Vid: 'c3', ally3Dealt: 12, allyFromStart: true, pinnedAllies: ['c1', 'c2', 'c3'] };
    const pinW4 = { day: 120, vid: 'h1', mid: 'eater', wave: 4, origin: 'expedition', rounds: 6,
      outcome: 'vKill', vKill: true, ally3Vid: 'c3', ally3Dealt: 45, allyFromStart: true, pinnedAllies: ['c1', 'c2', 'c3'] };
    const pinW3 = { day: 105, vid: 'h3', mid: 'spool', wave: 3, origin: 'expedition', rounds: 0,
      outcome: 'evade', vKill: false, ally3Vid: null, ally3Dealt: null, allyFromStart: false, pinnedAllies: ['c1', 'c2', 'c3'] };
    const gates = [
      { day: 90, vid: 'h2', mid: 'moderator', wave: 2, result: 'seek', pinned: true, pinnedAllies: ['c1', 'c2', 'c3'] },
      { day: 95, vid: 'h2', mid: 'moderator', wave: 2, result: 'avoid', pinned: true, pinnedAllies: ['c1', 'c2', 'c3'] },
      { day: 91, vid: 'h4', mid: 'moderator', wave: 2, result: 'seek', pinned: false, pinnedAllies: [] },
      { day: 92, vid: 'h4', mid: 'moderator', wave: 2, result: 'other', pinned: false, pinnedAllies: [] },
      { day: 93, vid: 'h5', mid: 'moderator', wave: 2, result: 'seek' },
    ];
    const f3 = { seed: 900003, won: false, scaleRank: 'regional', maxWave: 4, standing: 150, days: 150, gameDays: 150, endReason: 'survived', villageLost: false, deaths: [], instrumentErrors: [], v4departs: [], v4encounters: [rawPinKill], pinFights: [pinW2, pinW4, pinW3], v4gates: gates };
    fs.writeFileSync(path.join(tmpE, 'c.json'), JSON.stringify(f3));
    const e = analyzeDir(tmpE);
    check('§E S4: 3 pinned fights at all waves, by wave {w2:1, w3:1, w4:1}, fought 2',
      e.pinFightsAll === 3 && e.pinFightsByWave.w2 === 1 && e.pinFightsByWave.w3 === 1 && e.pinFightsByWave.w4 === 1 && e.pinFightsFought === 2,
      { pinFightsAll: e.pinFightsAll, byWave: e.pinFightsByWave, fought: e.pinFightsFought });
    check('§E S1: pin-subset B1 rate — wave-4+ 1/1, all-waves 2/3, fought 2/2',
      e.pinAlly3RateW4 === 1 && e.pinAlly3RateAll === 2 / 3 && e.pinAlly3RateFought === 1,
      { w4: e.pinAlly3RateW4, all: e.pinAlly3RateAll, fought: e.pinAlly3RateFought });
    check('§E S2: 1 pinned drive-off (mFlee) + end-cause taxonomy {monster-flee:1, killed:1, evade:1} + 1 pinned kill all-waves + ally3Dealt 57',
      e.pinDriveOffs === 1 && e.pinEndCauses['monster-flee'] === 1 && e.pinEndCauses.killed === 1 && e.pinEndCauses.evade === 1 &&
      e.pinKillsAll === 1 && e.pinAlly3DealtAll === 57,
      { driveOffs: e.pinDriveOffs, endCauses: e.pinEndCauses, kills: e.pinKillsAll, dealt: e.pinAlly3DealtAll });
    check('§E S3: SEEK split — pinned {seek:1, avoid:1}, unpinned {seek:1, other:1}, legacy row unknown {seek:1}',
      e.gateSeekPinned.total === 2 && e.gateSeekPinned.seek === 1 && e.gateSeekPinned.avoid === 1 &&
      e.gateSeekUnpinned.total === 2 && e.gateSeekUnpinned.seek === 1 && e.gateSeekUnpinned.other === 1 &&
      e.gateSeekUnknown.total === 1 && e.gateSeekUnknown.seek === 1,
      { pinned: e.gateSeekPinned, unpinned: e.gateSeekUnpinned, unknown: e.gateSeekUnknown });
  } finally { try { fs.rmSync(tmpE, { recursive: true, force: true }); } catch (e2) {} }
  console.log('analyze-pinquaddoor-b selftest: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) { process.exit(selftest() ? 0 : 1); }
  const dir = args[0];
  if (!dir) { console.error('usage: node scripts/analyze-pinquaddoor-b.js <corpus-dir> [--json out.json] | --selftest'); process.exit(2); }
  const a = analyzeDir(dir);
  printCensus(a);
  const ji = args.indexOf('--json');
  if (ji !== -1 && args[ji + 1]) fs.writeFileSync(args[ji + 1], JSON.stringify(a, null, 2) + '\n');
}

module.exports = { classifyEncounter: classifyEncounter, classifyPinFight: classifyPinFight, gateCounts: gateCounts, endCause: endCause, shoutsFired: shoutsFired, senseReturn: senseReturn, analyzeFile: analyzeFile, analyzeDir: analyzeDir, selftest: selftest, isDoorFight: isDoorFight, deriveDoorEntryHp: deriveDoorEntryHp, finalBlowFromLog: finalBlowFromLog, dealtBound: dealtBound, freshDoorKill: freshDoorKill, b1NonInferiority: b1NonInferiority };
