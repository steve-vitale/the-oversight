// congtrace-analyze-20261106.js — Congregation-kill trace analyzer
// (arm sim-congtrace-a, run fleshout-20261106T1515Z). DIAG ONLY.
// Reads one fresh congtrace corpus file (congtrace-driver output, seed
// 53006 staged) and the committed stageally-confirm corpus file, and:
//  (1) compares trajectories (determinism check): days, endReason,
//      standing, wave-4 kill ledger, succession days, scholar deaths;
//  (2) builds the damage account for the day-149 Congregation fight
//      from its per-turn trace: entry HP, damage per round by source,
//      scholar HP at end, rounds — and whether the account closes
//      (damage to the monster >= entry HP, monster HP left 0).
//  (3) if the d149 kill does NOT reproduce, names the ledger diff and
//      traces the nearest equivalent wave-4 kill on the fresh leg.
// Pure functions are exported for the proof test; the CLI prints the
// comparison + account as JSON.
// Usage: node scripts/congtrace-analyze-20261106.js <fresh-file> <corpus-file>
'use strict';
const fs = require('fs');
const path = require('path');

const CORPUS_W4_KILLS = [
  { day: 89, mid: 'strike', by: 'olivia_bennett', via: 'player' },
  { day: 149, mid: 'congregation', by: 'gen_y8hmuwz', via: 'player' },
];

function w4kills(run) {
  return ((run.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }))
    .map(function (e) { return { day: e.d, mid: e.mid, by: e.by, via: e.via }; });
}
function successionDays(run) {
  const out = [];
  let prev = null;
  (run.daily || []).forEach(function (d) {
    if (d.scholarId && prev !== null && d.scholarId !== prev) out.push({ day: d.day, from: prev, to: d.scholarId });
    if (d.scholarId) prev = d.scholarId;
  });
  return out;
}
function scholarDeathDays(run) {
  return (run.scholarDeaths || []).map(function (e) { return { day: e.day, scholarId: e.scholarId, causeArg: e.causeArg, inCombat: e.inCombat }; });
}

// Determinism comparison: same driver, same seed. A trajectory matches
// when the headline state and the kill ledger agree; succession days
// and scholar deaths are compared as the trajectory fingerprint.
function compareTrajectories(corpus, fresh) {
  const ck = w4kills(corpus), fk = w4kills(fresh);
  const cs = successionDays(corpus), fs = successionDays(fresh);
  const cd = scholarDeathDays(corpus), fd = scholarDeathDays(fresh);
  const killLedgerSame = JSON.stringify(ck) === JSON.stringify(fk);
  const successionSame = JSON.stringify(cs.map(function (x) { return x.day; })) === JSON.stringify(fs.map(function (x) { return x.day; }));
  const deathsSame = JSON.stringify(cd) === JSON.stringify(fd);
  return {
    corpusAnchor: corpus.anchorCommit || null, freshAnchor: fresh.anchorCommit || null,
    days: { corpus: corpus.days, fresh: fresh.days, same: corpus.days === fresh.days },
    endReason: { corpus: corpus.endReason, fresh: fresh.endReason, same: corpus.endReason === fresh.endReason },
    standing: { corpus: corpus.standing, fresh: fresh.standing, same: corpus.standing === fresh.standing },
    w4kills: { corpus: ck, fresh: fk, same: killLedgerSame },
    successionDays: { corpus: cs.map(function (x) { return x.day; }), fresh: fs.map(function (x) { return x.day; }), same: successionSame, detail: { corpus: cs, fresh: fs } },
    scholarDeaths: { corpus: cd, fresh: fd, same: deathsSame },
    instrumentErrors: (fresh.instrumentErrors || []).length,
    reproduced: killLedgerSame && successionSame && deathsSame,
  };
}

// Damage account for one trace. Sources are split by the hit's actor:
// scholar ('p'), ally/villager fighters, ability verbs (srcLabel
// 'ability' or a useAbility verb in the same round), trick (srcLabel
// 'heresy' / other named trick sources), monster-side damage (the
// beast hitting back — not part of the kill account), and other
// (unknown actor kind). The account CLOSES when damage dealt TO the
// monster sums to >= entry HP and the monster ends at 0 HP; otherwise
// the shortfall is the unexplained remainder (a non-tbDamage kill path
// would show up exactly here).
function damageAccount(tr) {
  if (!tr) return null;
  const bySource = { scholar: 0, ally: 0, ability: 0, trick: 0, other: 0, monsterSide: 0 };
  const byRound = {};
  const abilityRounds = {};
  (tr.verbs || []).forEach(function (v) {
    if (v.verb === 'ability' && v.ok && v.r != null) abilityRounds[v.r] = abilityRounds[v.r] || [];
  });
  (tr.hits || []).forEach(function (h) {
    const d = (h.dmg | 0) || 0;
    const r = (h.r != null) ? h.r : 0;
    const row = byRound[r] || (byRound[r] = { scholar: 0, ally: 0, ability: 0, trick: 0, other: 0, monsterSide: 0, totalToMonster: 0 });
    const toMonster = (h.tgtKind === 'monster' || h.tgtKind === 'hostile');
    let bucket = 'other';
    if (!toMonster) bucket = 'monsterSide';
    else if (h.srcLabel === 'heresy' || (h.srcLabel && /heresy|trick|counter/i.test(h.srcLabel))) bucket = 'trick';
    else if (h.actor === 'p') bucket = 'scholar';
    else if (h.actorKind === 'villager' || h.actorKind === 'ally' || h.actorKind === 'player') bucket = 'ally';
    else if (abilityRounds[r] && h.srcLabel && /ability/i.test(h.srcLabel)) bucket = 'ability';
    bySource[bucket] += d;
    row[bucket] += d;
    if (toMonster) row.totalToMonster += d;
  });
  const toMonsterTotal = bySource.scholar + bySource.ally + bySource.ability + bySource.trick + bySource.other;
  const entry = (tr.entryHp != null) ? tr.entryHp : null;
  const closes = entry != null && toMonsterTotal >= entry && tr.mHpLeft === 0;
  return {
    seq: tr.seq, day: tr.day, mid: tr.mid, wave: tr.wave, ending: tr.ending, outcome: tr.outcome,
    rounds: tr.rounds, entryHp: entry, entryMaxHp: tr.entryMaxHp, entryFrac: tr.entryFrac,
    mHpLeft: tr.mHpLeft, mHpLeftFrac: tr.mHpLeftFrac,
    scholarHpEnd: tr.scholarHpEnd, scholarHpFracEnd: tr.scholarHpFracEnd,
    alliesAtEntry: tr.alliesAtEntry, partyAtEntry: tr.partyAtEntry,
    bySource: bySource, byRound: byRound, toMonsterTotal: toMonsterTotal,
    shortfall: (entry != null) ? entry - toMonsterTotal : null,
    closes: closes,
    verbs: (tr.verbs || []).map(function (v) { return { r: v.r, verb: v.verb, ok: v.ok, aid: v.aid || null, target: v.target || null }; }),
    hitCount: (tr.hits || []).length,
  };
}

function findTrace(run, day, mid) {
  return ((run.traces || []).filter(function (x) { return x.day === day && x.mid === mid; }))[0] || null;
}
function findTbFight(run, day, mid) {
  return ((run.tbFights || []).filter(function (f) { return f.day === day && f.mid === mid; }))[0] || null;
}

// Nearest equivalent wave-4 kill on the fresh leg: any wave-4 kill in
// waveKillLog with a trace, preferring a kill by the scholar, then the
// latest day. Returns the damage account for that fight.
function nearestEquivalentKill(run) {
  const kills = w4kills(run);
  if (!kills.length) return null;
  const withTrace = kills.map(function (k) {
    const tr = findTrace(run, k.day, k.mid);
    return { kill: k, trace: tr, account: tr ? damageAccount(tr) : null };
  }).filter(function (x) { return x.trace; });
  if (!withTrace.length) return { kills: kills, traced: null };
  withTrace.sort(function (a, b) {
    const aSch = a.kill.by === (run.endScholarId || null) ? 0 : 1;
    const bSch = b.kill.by === (run.endScholarId || null) ? 0 : 1;
    if (aSch !== bSch) return aSch - bSch;
    return b.kill.day - a.kill.day;
  });
  return { kills: kills, traced: withTrace[0] };
}

function main() {
  const freshFile = process.argv[2];
  const corpusFile = process.argv[3];
  if (!freshFile || !corpusFile) {
    console.error('Usage: node scripts/congtrace-analyze-20261106.js <fresh-file> <corpus-file>');
    process.exit(2);
  }
  const fresh = JSON.parse(fs.readFileSync(freshFile, 'utf8'));
  const corpus = JSON.parse(fs.readFileSync(corpusFile, 'utf8'));
  const comparison = compareTrajectories(corpus, fresh);
  const out = { comparison: comparison, d149: null, nearestEquivalent: null };
  const d149tr = findTrace(fresh, 149, 'congregation');
  const d149tb = findTbFight(fresh, 149, 'congregation');
  if (d149tr) {
    out.d149 = { reproduced: true, tbFight: d149tb, account: damageAccount(d149tr) };
  } else {
    out.d149 = { reproduced: false, tbFight: d149tb, account: null };
    out.nearestEquivalent = nearestEquivalentKill(fresh);
  }
  console.log(JSON.stringify(out, null, 2));
}

if (require.main === module) main();
module.exports = {
  compareTrajectories: compareTrajectories, damageAccount: damageAccount,
  findTrace: findTrace, findTbFight: findTbFight,
  nearestEquivalentKill: nearestEquivalentKill, w4kills: w4kills,
  successionDays: successionDays, scholarDeathDays: scholarDeathDays,
  CORPUS_W4_KILLS: CORPUS_W4_KILLS,
};
