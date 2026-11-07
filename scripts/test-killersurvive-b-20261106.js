// test-killersurvive-b-20261106.js — proof for the all-killer death census
// (arm sim-killersurvive-b). Fixtures prove the attribution rules; the
// corpus section pins the grind-band reproduction so analyzer drift is
// caught. Pure function tests + committed-corpus read; no game load.
// Usage: node scripts/test-killersurvive-b-20261106.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const A = require(path.join(REPO, 'scripts', 'killersurvive-b-analyze-20261106'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL: ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(name, got, want) { check(name, got === want, { got: got, want: want }); }

// --- fixture builder -------------------------------------------------------
function dailyRows(seed, days, scholarId) {
  const out = [];
  for (let d = 1; d <= days; d++) {
    out.push({ day: d, scholarId: scholarId, rosterSize: 10, living: 10,
      readiness5: { veterans: 1 }, w4kills: 1, w4killers: 1, partySize: 0, partyIds: [] });
  }
  return out;
}
function baseRow(over) {
  const row = {
    seed: 1, days: 30, endReason: 'survived', won: false, scaleRank: 'village',
    maxWave: 4, unlockedWave: 4, standing: 150,
    waveKillLog: [], killsLive: [], fallen: [], scholarDeaths: [], deadMap: {},
    killerTrack: [], daily: [], tbFights: [], fieldFights: [], traces: [],
    fights: [], instrumentErrors: [],
  };
  return Object.assign(row, over || {});
}
function killEntry(day, mid, wave, by, via) {
  return { d: day, mid: mid, w: wave, by: by, via: via || 'player', trick: null };
}

// F1: TB-fight death, scholar dies in the fight (the dominant grind shape).
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(10, 'strike', 4, 'K1')],
    killsLive: [{ day: 10, mid: 'strike', wave: 4, by: 'K1', via: 'player', scholarAtKill: 'K1', scholarChannel: true }],
    fallen: [{ villagerId: 'K1', day: 15, cause: 'the wild' }],
    scholarDeaths: [{ day: 15, scholarId: 'K1', causeArg: 'the wild', atHaven: true, mapX: 4, mapY: 4, inCombat: true, pendingEncounter: false }],
    tbFights: [{ seq: 1, day: 15, mid: 'reunion', wave: 4, alliesAtEntry: 1, partyAtEntry: 0, outcome: 'lost', scholarDiedInFight: true, scholarHpFracEnd: -0.05, monsterHpFracEnd: 0.6, rounds: 8, traceSeq: 1 }],
    traces: [{ seq: 1, tbSeq: 1, day: 15, mid: 'reunion', wave: 4, entryHp: 900, entryMaxHp: 1200, entryFrac: 0.75, fighters: ['K1'], outcome: 'lost', mHpLeft: 720, rounds: 8, instId: 'tb-a', instIds: ['tb-a'] }],
    daily: dailyRows(1, 15, 'K1'),
    killerTrack: [{ day: 10, by: 'K1', isScholar: true, deadInFallen: false, atHaven: true, health: 100, onExped: false },
      { day: 14, by: 'K1', isScholar: true, deadInFallen: false, atHaven: true, health: 100, onExped: false }],
  });
  const r = A.analyzeRow(row);
  eq('F1 one killer', r.killers.length, 1);
  const k = r.killers[0];
  eq('F1 channel TB-fight:reunion', k.channel, 'TB-fight:reunion');
  eq('F1 kill-to-death 5', k.killToDeathDays, 5);
  eq('F1 first mid strike', k.firstKillMid, 'strike');
  eq('F1 same mid false (reunion != strike)', k.sameMidAsKill, false);
  eq('F1 same chain false', k.sameChainDeath, false);
  eq('F1 health min 100', k.healthMin, 100);
  eq('F1 at haven 1.0', k.atHavenShare, 1);
})();

// F2: field-fight death for a non-scholar killer (wild kill, then field death).
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(20, 'influencer', 4, 'K2', 'wild')],
    killsLive: [{ day: 20, mid: 'influencer', wave: 4, by: 'K2', via: 'wild', scholarAtKill: 'S1', scholarChannel: false }],
    fallen: [{ villagerId: 'K2', day: 26, cause: 'monster', monsterId: 'eulogy', monsterName: 'The Eulogy' }],
    fights: [{ day: 26, channel: 'field', fighter: 'K2', mid: 'eulogy', wave: 4, outcome: 'vDie' }],
    fieldFights: [{ seq: 1, day: 26, vid: 'K2', mid: 'eulogy', wave: 4, instId: 'w9', instIds: ['w9'], outcome: 'vDie', mHpLeft: 500 }],
    daily: dailyRows(1, 26, 'S1'),
  });
  const r = A.analyzeRow(row);
  const k = r.killers[0];
  eq('F2 channel field-fight:eulogy', k.channel, 'field-fight:eulogy');
  eq('F2 kill-to-death 6', k.killToDeathDays, 6);
  eq('F2 same mid false', k.sameMidAsKill, false);
})();

// F3: contest death.
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(30, 'eulogy', 4, 'K3')],
    fallen: [{ villagerId: 'K3', day: 31, cause: 'contest' }],
    scholarDeaths: [{ day: 31, scholarId: 'K3', causeArg: 'contest', atHaven: true, mapX: 4, mapY: 4, inCombat: false, pendingEncounter: false }],
    daily: dailyRows(1, 31, 'K3'),
  });
  const k = A.analyzeRow(row).killers[0];
  eq('F3 channel contest', k.channel, 'contest');
  eq('F3 kill-to-death 1', k.killToDeathDays, 1);
})();

// F4: at-home, not in combat (dehydration).
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(40, 'strike', 4, 'K4')],
    fallen: [{ villagerId: 'K4', day: 62, cause: 'dehydration' }],
    scholarDeaths: [{ day: 62, scholarId: 'K4', causeArg: 'dehydration', atHaven: true, mapX: 4, mapY: 4, inCombat: false, pendingEncounter: false }],
    daily: dailyRows(1, 62, 'K4'),
  });
  const k = A.analyzeRow(row).killers[0];
  eq('F4 channel at-home-not-combat', k.channel, 'at-home-not-combat');
  eq('F4 kill-to-death 22', k.killToDeathDays, 22);
})();

// F5: 'a stranger', off-board combat death (no fight row).
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(50, 'strike', 4, 'K5')],
    fallen: [{ villagerId: 'K5', day: 56, cause: 'a stranger' }],
    scholarDeaths: [{ day: 56, scholarId: 'K5', causeArg: 'a stranger', atHaven: false, mapX: 7, mapY: 3, inCombat: true, pendingEncounter: false }],
    daily: dailyRows(1, 56, 'K5'),
  });
  const k = A.analyzeRow(row).killers[0];
  eq('F5 channel fallen:a stranger', k.channel, 'fallen:a stranger');
  eq('F5 kill-to-death 6', k.killToDeathDays, 6);
})();

// F6: same-chain field death via shared instance id.
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(10, 'strike', 4, 'K6', 'wild')],
    fallen: [{ villagerId: 'K6', day: 12, cause: 'monster', monsterId: 'strike', monsterName: 'The Strike' }],
    fights: [{ day: 12, channel: 'field', fighter: 'K6', mid: 'strike', wave: 4, outcome: 'vDie' }],
    fieldFights: [
      { seq: 1, day: 10, vid: 'K6', mid: 'strike', wave: 4, instId: 'w4x', instIds: ['w4x'], outcome: 'vFlee', mHpLeft: 800 },
      { seq: 2, day: 12, vid: 'K6', mid: 'strike', wave: 4, instId: 'w4x', instIds: ['w4x'], outcome: 'vDie', mHpLeft: 790 },
    ],
    daily: dailyRows(1, 12, 'S1'),
  });
  const k = A.analyzeRow(row).killers[0];
  eq('F6 channel field-fight:strike', k.channel, 'field-fight:strike');
  eq('F6 same mid true', k.sameMidAsKill, true);
  eq('F6 same chain true', k.sameChainDeath, true);
  eq('F6 link instance-id', k.sameChainLink, 'instance-id');
  // The death fight is the endpoint, not a refight; the d10 meeting is the
  // kill day itself (day granularity) — so no counted refight.
  eq('F6 fought again 0 (death fight excluded)', k.foughtAgainCount, 0);
})();

// F7: same-chain TB death via exact-HP trail. Kill d10 (TB won); a d11
// fight leaves a second audit at 400 HP; the d12 death fight enters at
// exactly 400 HP. The d11 fight counts as fought-again; the d12 death
// fight does not.
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(10, 'audit', 4, 'K7')],
    fallen: [{ villagerId: 'K7', day: 12, cause: 'the wild' }],
    scholarDeaths: [{ day: 12, scholarId: 'K7', causeArg: 'the wild', atHaven: true, mapX: 4, mapY: 4, inCombat: true, pendingEncounter: false }],
    tbFights: [
      { seq: 1, day: 10, mid: 'audit', wave: 4, alliesAtEntry: 0, partyAtEntry: 0, outcome: 'won', scholarDiedInFight: false, monsterHpFracEnd: 0, rounds: 9, traceSeq: 1 },
      { seq: 2, day: 11, mid: 'audit', wave: 4, alliesAtEntry: 0, partyAtEntry: 0, outcome: 'lost', scholarDiedInFight: false, monsterHpFracEnd: 0.36, rounds: 6, traceSeq: 2 },
      { seq: 3, day: 12, mid: 'audit', wave: 4, alliesAtEntry: 0, partyAtEntry: 0, outcome: 'lost', scholarDiedInFight: true, monsterHpFracEnd: 0.3, rounds: 5, traceSeq: 3 },
    ],
    traces: [
      { seq: 1, tbSeq: 1, day: 10, mid: 'audit', wave: 4, entryHp: 1100, entryMaxHp: 1100, entryFrac: 1, fighters: ['K7'], outcome: 'won', mHpLeft: 0, rounds: 9, instId: 'tb-1', instIds: ['tb-1'] },
      { seq: 2, tbSeq: 2, day: 11, mid: 'audit', wave: 4, entryHp: 1100, entryMaxHp: 1100, entryFrac: 1, fighters: ['K7'], outcome: 'lost', mHpLeft: 400, rounds: 6, instId: 'tb-2', instIds: ['tb-2'] },
      { seq: 3, tbSeq: 3, day: 12, mid: 'audit', wave: 4, entryHp: 400, entryMaxHp: 1100, entryFrac: 0.36, fighters: ['K7'], outcome: 'lost', mHpLeft: 330, rounds: 5, instId: 'tb-3', instIds: ['tb-3'] },
    ],
    daily: dailyRows(1, 12, 'K7'),
  });
  const k = A.analyzeRow(row).killers[0];
  eq('F7 channel TB-fight:audit', k.channel, 'TB-fight:audit');
  eq('F7 kill-to-death 2', k.killToDeathDays, 2);
  eq('F7 same chain true', k.sameChainDeath, true);
  eq('F7 link exact-hp-trail', k.sameChainLink, 'exact-hp-trail');
  eq('F7 fought again 1 (d11 wounding fight)', k.foughtAgainCount, 1);
  eq('F7 refight day 11', k.foughtAgainFirstDay, 11);
})();

// F8: same mid, NO link (fresh beast, different instance, entry HP matches
// no prior exit, single TB fight that day) — must NOT force same-chain.
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(10, 'audit', 4, 'K8')],
    fallen: [{ villagerId: 'K8', day: 20, cause: 'the wild' }],
    scholarDeaths: [{ day: 20, scholarId: 'K8', causeArg: 'the wild', atHaven: true, mapX: 4, mapY: 4, inCombat: true, pendingEncounter: false }],
    tbFights: [
      { seq: 1, day: 10, mid: 'audit', wave: 4, alliesAtEntry: 0, partyAtEntry: 0, outcome: 'lost', scholarDiedInFight: false, monsterHpFracEnd: 0.5, rounds: 6, traceSeq: 1 },
      { seq: 2, day: 20, mid: 'audit', wave: 4, alliesAtEntry: 0, partyAtEntry: 0, outcome: 'lost', scholarDiedInFight: true, monsterHpFracEnd: 0.8, rounds: 4, traceSeq: 2 },
    ],
    traces: [
      { seq: 1, tbSeq: 1, day: 10, mid: 'audit', wave: 4, entryHp: 1100, entryMaxHp: 1100, entryFrac: 1, fighters: ['K8'], outcome: 'lost', mHpLeft: 550, rounds: 6, instId: 'tb-1', instIds: ['tb-1'] },
      { seq: 2, tbSeq: 2, day: 20, mid: 'audit', wave: 4, entryHp: 1100, entryMaxHp: 1100, entryFrac: 1, fighters: ['K8'], outcome: 'lost', mHpLeft: 880, rounds: 4, instId: 'tb-9', instIds: ['tb-9'] },
    ],
    daily: dailyRows(1, 20, 'K8'),
  });
  const k = A.analyzeRow(row).killers[0];
  eq('F8 same mid true', k.sameMidAsKill, true);
  eq('F8 same chain false (unlinked)', k.sameChainDeath, false);
  eq('F8 link null', k.sameChainLink, null);
})();

// F9: partner alive at death; F10: fought again; F11: ad_sponsor ignored.
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(10, 'strike', 4, 'KA'), killEntry(12, 'congregation', 4, 'KB')],
    killsLive: [
      { day: 10, mid: 'strike', wave: 4, by: 'KA', via: 'player', scholarAtKill: 'KA', scholarChannel: true },
      { day: 12, mid: 'congregation', wave: 4, by: 'KB', via: 'player', scholarAtKill: 'KB', scholarChannel: true },
      { day: 13, mid: 'ad_sponsor', wave: null, by: 'KA', via: 'player', scholarAtKill: 'KA', scholarChannel: true },
    ],
    fallen: [{ villagerId: 'KA', day: 18, cause: 'the wild' }],
    scholarDeaths: [{ day: 18, scholarId: 'KA', causeArg: 'the wild', atHaven: true, mapX: 4, mapY: 4, inCombat: true, pendingEncounter: false }],
    tbFights: [{ seq: 1, day: 18, mid: 'eater', wave: 4, alliesAtEntry: 0, partyAtEntry: 0, outcome: 'lost', scholarDiedInFight: true, monsterHpFracEnd: 0.7, rounds: 6, traceSeq: 1 }],
    traces: [{ seq: 1, tbSeq: 1, day: 18, mid: 'eater', wave: 4, entryHp: 1000, entryMaxHp: 1000, entryFrac: 1, fighters: ['KA'], outcome: 'lost', mHpLeft: 700, rounds: 6, instId: 'tb-e', instIds: ['tb-e'] }],
    fieldFights: [{ seq: 1, day: 14, vid: 'KA', mid: 'reunion', wave: 4, instId: 'w7', instIds: ['w7'], outcome: 'vFlee', mHpLeft: 900 }],
    daily: dailyRows(1, 18, 'KA'),
  });
  const r = A.analyzeRow(row);
  eq('F9/F11 two killers (ad_sponsor is not a kill)', r.killers.length, 2);
  const ka = r.killers.filter(function (k) { return k.by === 'KA'; })[0];
  const kb = r.killers.filter(function (k) { return k.by === 'KB'; })[0];
  eq('F9 partner alive at KA death', ka.partnerAliveAtDeath, true);
  check('F9 partner is KB', ka.partnerIdsAtDeath.indexOf('KB') >= 0, ka.partnerIdsAtDeath);
  eq('F10 KA fought again (field d14)', ka.foughtAgainCount, 1);
  eq('F10 refight day 14', ka.foughtAgainFirstDay, 14);
  eq('F10 KB never refought', kb.foughtAgainCount, 0);
  eq('F9 KB alive at end', kb.aliveAtEnd, true);
  eq('F9 KB partner alive at end (KA dead, so false)', kb.partnerAliveAtDeath, false);
})();

// F12: a bare fallen 'the wild' with no scholar context classifies as
// 'fallen:the wild' — the residual label, never cited as a cause.
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(10, 'strike', 4, 'KX')],
    fallen: [{ villagerId: 'KX', day: 15, cause: 'the wild' }],
    daily: dailyRows(1, 15, 'KX'),
  });
  const k = A.analyzeRow(row).killers[0];
  eq('F12 fallen-only the wild is the residual label', k.channel, 'fallen:the wild');
  eq('F12 kill-to-death 5', k.killToDeathDays, 5);
})();

// F13: the 'unmatched' tripwire itself, called directly: a scholar-death
// record says in-combat, but no TB/field fight row and no fallen entry
// explain the day — the classifier must say so, not guess.
(function () {
  const KS = require(path.join(REPO, 'scripts', 'killersurvive-analyze-20261106'));
  const row = baseRow({
    scholarDeaths: [{ day: 15, scholarId: 'KY', causeArg: 'the wild', atHaven: false, mapX: 7, mapY: 3, inCombat: true, pendingEncounter: false }],
    daily: dailyRows(1, 15, 'KY'),
  });
  const ch = KS.deathChannel(row, { by: 'KY', deathDay: 15, aliveAtEnd: false });
  eq('F13 unmatched when no record explains an in-combat scholar death', ch.channel, 'unmatched');
})();

// --- corpus reproduction: grind band --------------------------------------
(function () {
  const dir = path.join(REPO, 'evidence', '2026-11-06', 'perseed-grind-a');
  const out = A.analyzeDir(dir, 'grind-s');
  eq('C1 instrument errors 0', out.instrumentErrors, 0);
  eq('C2 killers ever 15', out.killersEver, 15);
  eq('C3 dead killers 11', out.deadKillers, 11);
  eq('C4 living at end 4', out.livingAtEnd, 4);
  eq('C5 median kill-to-death 6', out.killToDeathMedianAll, 6);
  eq('C6 median w4-first 6', out.killToDeathMedianW4first, 6);
  eq('C7 TB-fight context 7', out.contextCounts['TB-fight'], 7);
  eq('C8 fallen-other 2', out.contextCounts['fallen-other'], 2);
  eq('C9 contest 2', out.contextCounts['contest'], 2);
  eq('C10 cause the wild 7', out.causeCounts['the wild'], 7);
  eq('C11 cause a stranger 2', out.causeCounts['a stranger'], 2);
  eq('C12 cause contest 2', out.causeCounts['contest'], 2);
  eq('C13 fought again 5 (death fight itself excluded)', out.foughtAgainCount, 5);
  eq('C14 same-chain deaths 0', out.sameChainDeaths, 0);
  eq('C15 same-mid deaths 0', out.sameMidDeaths, 0);
  eq('C16 partner alive 3', out.partnerAliveCount, 3);
  eq('C17 unmatched none', out.unmatched.length, 0);
  eq('C18 pair snapshot seeds 1', out.pairSnapshotSeeds, 1);
  eq('C19 max simultaneous 2', out.maxSimultaneous, 2);
  eq('C20 wall w4 kills 16', out.wall.wave4kills, 16);
  eq('C21 wall w5 kills 2', out.wall.wave5kills, 2);
  eq('C22 wall median days 128.5', out.wall.medianDays, 128.5);
  eq('C23 wall wins 0', out.wall.wins, 0);
  eq('C24 wall national 0', out.wall.national, 0);
  eq('C25 dominant context TB-fight', out.dominantContext.top, 'TB-fight');
  check('C26 dominant context share >= 0.5', out.dominantContext.share >= 0.5, out.dominantContext);
})();

// --- corpus reproduction: fresh pilot + confirm band (99681-99696) -------
(function () {
  const dir = path.join(REPO, 'evidence', '2026-11-06', 'perseed-killersurvive-b');
  const out = A.analyzeDir(dir, 'grind-s');
  eq('P1 instrument errors 0', out.instrumentErrors, 0);
  eq('P2 killers ever 22', out.killersEver, 22);
  eq('P3 dead killers 20', out.deadKillers, 20);
  eq('P4 living at end 2', out.livingAtEnd, 2);
  eq('P5 median kill-to-death 7.5', out.killToDeathMedianAll, 7.5);
  eq('P6 TB-fight context 17', out.contextCounts['TB-fight'], 17);
  eq('P7 fallen-other 2', out.contextCounts['fallen-other'], 2);
  eq('P8 at-home-not-combat 1', out.contextCounts['at-home-not-combat'], 1);
  eq('P9 cause the wild 14', out.causeCounts['the wild'], 14);
  eq('P10 cause the arena 2', out.causeCounts['the arena'], 2);
  eq('P11 fought again 12', out.foughtAgainCount, 12);
  eq('P12 same-chain deaths 0', out.sameChainDeaths, 0);
  eq('P13 same-mid deaths 1', out.sameMidDeaths, 1);
  eq('P14 partner alive 3', out.partnerAliveCount, 3);
  eq('P15 unmatched none', out.unmatched.length, 0);
  eq('P16 pair snapshot seeds 1', out.pairSnapshotSeeds, 1);
  eq('P17 max simultaneous 2', out.maxSimultaneous, 2);
  eq('P18 wall w4 kills 27', out.wall.wave4kills, 27);
  eq('P19 wall w5 kills 1', out.wall.wave5kills, 1);
  eq('P20 wall median days 105.5', out.wall.medianDays, 105.5);
  eq('P21 wall wins 0', out.wall.wins, 0);
  eq('P22 dominant context TB-fight', out.dominantContext.top, 'TB-fight');
  check('P23 dominant context share >= 0.5', out.dominantContext.share >= 0.5, out.dominantContext);
})();

console.log('test-killersurvive-b-20261106: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
