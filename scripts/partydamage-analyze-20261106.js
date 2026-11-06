// partydamage-analyze-20261106.js — party-damage analyzer
// (arm sim-partydamage-b). Reads a per-seed corpus directory
// (partydamage-driver output) and classifies every wave-4+
// turn-based fight from its per-turn trace. Pure functions are exported
// for the proof test; the CLI prints the leg summary as JSON.
// Usage: node scripts/fightinterior-analyze-20261106.js <corpus-dir>
'use strict';
const fs = require('fs');
const path = require('path');

const ENDINGS = ['kill', 'rout', 'scholar-death', 'scholar-flee', 'unfinished'];

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(xs) {
  if (!xs.length) return null;
  return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
}

// Pyrrhic match for 'unfinished' traces (sim-midnightkill-b): a wave-4+
// log kill by one of this fight's fighters. The join is fight day ± 1
// (a fight that starts one day and logs its kill the next must match),
// with the same-beast guard — the kill's mid must be one of the trace's
// mids (falling back to tr.mid, and to the old day+fighter+wave check
// only when the trace carries no monster id at all). waveKillLog uses
// {d, w}; killsLive-shaped entries use {day, wave}; accept either.
// NOTE: unlike the fightinterior classifier's 'unfinished' branch this
// matcher carries no mHpLeft === 0 guard — the analyzer never had one,
// and adding it is a separate change, not this arm's. A pyrrhic match
// here counts toward tbKillMatched, never toward a re-derived ending.
function sameBeast(tr, mid) {
  if (!mid) return false;
  try {
    if (Array.isArray(tr.mids) && tr.mids.length) return tr.mids.indexOf(mid) >= 0;
    if (tr.mid) return tr.mid === mid;
  } catch (e) {}
  return true; // trace carries no monster id at all: cannot disprove
}
function matchPyrrhicKills(tr, log) {
  const out = [];
  try {
    (log || []).forEach(function (k) {
      if (!k || typeof k !== 'object') return;
      const kd = (k.d != null) ? k.d : k.day;
      const kw = (k.w != null) ? k.w : k.wave;
      if (kd == null || !k.mid) return;
      if ((kw | 0) < 4) return;
      if (Math.abs((kd | 0) - (tr.day | 0)) > 1) return;
      if (!sameBeast(tr, k.mid)) return;
      if (!(tr.fighters || []).includes(k.by)) return;
      out.push({ day: kd, mid: k.mid, wave: (kw | 0) || 0, by: k.by || null, via: k.via || null });
    });
  } catch (e) {}
  return out;
}
function matchPyrrhicKill(tr, log) {
  const hits = matchPyrrhicKills(tr, log);
  return hits.length ? hits[0] : null;
}

// A trace counts as present when the recorder saw at least one turn or
// one player verb inside the fight. A fight with zero turns AND zero
// verbs means the wrappers never fired for it — an instrument failure,
// not a quiet fight (even a 1-round scholar death has a monster turn).
function tracePresent(tr) {
  if (!tr) return false;
  return ((tr.turns || []).length >= 1) || ((tr.verbs || []).length >= 1);
}

// Damage per round, by side, from the hit log. Player side = the scholar
// plus villager/ally fighters; monster side = monster/hostile fighters.
// Hits whose actor kind is unknown (round-wrap / status ticks) are
// counted separately so neither side's number is inflated silently.
function damageByRound(tr) {
  const rounds = {};
  (tr.hits || []).forEach(function (h) {
    const r = (h.r != null) ? h.r : 0;
    const row = rounds[r] || (rounds[r] = { player: 0, monster: 0, other: 0, hits: 0 });
    row.hits++;
    const d = (h.dmg | 0) || 0;
    if (h.actorKind === 'player' || h.actorKind === 'villager' || h.actorKind === 'ally') row.player += d;
    else if (h.actorKind === 'monster' || h.actorKind === 'hostile') row.monster += d;
    else row.other += d;
  });
  return rounds;
}

// Best-round composition (sim-partydamage-b prereg secondary): for the
// round with the highest player-side damage, split it into scholar vs
// ally damage, count strikes, list ability verbs fired that round, and
// monster-side damage taken. The sizing bound repeats the best round
// every round; this composition says whether that round is repeatable
// (scholar + ally focus fire, possibly with an ability) or a one-off
// spike (a single actor, a crit cluster, a wounded-entry round).
function bestRoundComposition(tr) {
  const byRound = damageByRound(tr);
  const rounds = Object.keys(byRound).map(function (k) { return parseInt(k, 10); });
  if (!rounds.length) return null;
  let bestR = rounds[0], bestDmg = byRound[bestR].player;
  rounds.forEach(function (r) { if (byRound[r].player > bestDmg) { bestR = r; bestDmg = byRound[r].player; } });
  let scholar = 0, ally = 0, strikes = 0;
  (tr.hits || []).forEach(function (h) {
    if (h.r !== bestR || (h.dmg | 0) <= 0) return;
    if (h.tgtKind !== 'monster' && h.tgtKind !== 'hostile') return;
    if (h.actor === 'p') { scholar += (h.dmg | 0); }
    else if (h.actorKind === 'villager' || h.actorKind === 'ally') { ally += (h.dmg | 0); }
  });
  (tr.verbs || []).forEach(function (v) {
    if (v.r === bestR && v.verb === 'strike' && v.ok) strikes++;
  });
  const abilityVerbs = (tr.verbs || []).filter(function (v) { return v.r === bestR && v.verb === 'ability'; })
    .map(function (v) { return v.aid + ':' + (v.act || '?'); });
  return { round: bestR, total: bestDmg, scholar: scholar, ally: ally,
    strikes: strikes, abilityVerbs: abilityVerbs,
    monsterDmg: byRound[bestR].monster, entryHp: tr.entryHp || null,
    shareOfEntry: tr.entryHp ? +(bestDmg / tr.entryHp).toFixed(3) : null };
}

// Rally cost: in a fight where the rally fired, did the scholar strike
// in the rally round? And what did round-1 player-side damage look like
// with vs without a rally? Returns per-fight rows for the analyzer.
function rallyCostRows(traces) {
  return traces.map(function (tr) {
    const r1 = damageByRound(tr)[tr.rallyRound != null ? tr.rallyRound : 1] || { player: 0, monster: 0, other: 0, hits: 0 };
    const verbs = tr.verbs || [];
    const rally = verbs.some(function (v) { return v.verb === 'rally' && v.ok; });
    const scholarStrikesR1 = verbs.filter(function (v) { return v.verb === 'strike' && v.ok && v.r === (tr.rallyRound != null ? tr.rallyRound : 1); }).length;
    const scholarStrikes = verbs.filter(function (v) { return v.verb === 'strike' && v.ok; }).length;
    return {
      seq: tr.seq, day: tr.day, mid: tr.mid, ending: tr.ending, rounds: tr.rounds,
      rally: rally, rallyRound: tr.rallyRound,
      scholarStruckRallyRound: tr.scholarStruckRallyRound,
      r1PlayerDmg: r1.player, scholarStrikesR1: scholarStrikesR1, scholarStrikes: scholarStrikes,
    };
  });
}

// Stage-2-style sizing of the next lever, finishprobe shape: for each
// LOST wave-4 TB fight, the generous upper bound is "the party dealt its
// best observed damage-per-round on EVERY round it survived, plus one
// aimed strike at 2.5x that round's damage" — zero movement, zero
// misses, full survived rounds granted. A fight flips when the bound
// meets or beats its entry HP. The ceiling kill rate is the bound's
// kill count over all TB fights. The lever this sizes is named by the
// caller (the arm's job is to say WHICH lever and WHAT SIZE, not to
// build it here).
function sizeNextLever(traces) {
  const lost = traces.filter(function (tr) { return tr.ending === 'scholar-death' || tr.ending === 'scholar-flee'; });
  let flips = 0;
  const flipRows = [];
  lost.forEach(function (tr) {
    const byRound = damageByRound(tr);
    const rounds = Object.keys(byRound).map(function (k) { return parseInt(k, 10); });
    const playerPerRound = rounds.map(function (r) { return byRound[r].player; });
    const bestRound = playerPerRound.length ? Math.max.apply(null, playerPerRound) : 0;
    const survived = (tr.rounds != null && tr.rounds > 0) ? tr.rounds : rounds.length;
    const bound = bestRound * survived + Math.round(bestRound * 2.5);
    const entry = (tr.entryHp != null) ? tr.entryHp : 0;
    const flipped = bound >= entry && entry > 0;
    if (flipped) { flips++; flipRows.push({ seq: tr.seq, day: tr.day, mid: tr.mid, entry: entry, bound: bound, rounds: survived, bestRound: bestRound }); }
  });
  const kills = traces.filter(function (tr) { return tr.ending === 'kill'; }).length;
  const ceilingRate = traces.length ? (kills + flips) / traces.length : null;
  return { lostFights: lost.length, flips: flips, flipRows: flipRows, kills: kills, total: traces.length, ceilingRate: ceilingRate };
}

function waveMap() {
  // wavesFaced is a per-TYPE count map (monster id -> times faced), not a
  // per-wave count — count distinct faced types per wave from the roster.
  // Fixed 2026-11-06: the first version read wavesFaced[4]/[5] and
  // reported 0 faced on both legs while 59 wave-4 TB fights stood in
  // the corpus. The underlying data is unchanged; only the read is fixed.
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
    const list = Array.isArray(raw) ? raw : raw.monsters;
    const map = {};
    (list || []).forEach(function (m) { if (m && m.id) map[m.id] = (m.wave | 0) || 1; });
    return map;
  } catch (e) { return {}; }
}
const WAVE_BY_ID = waveMap();

function analyzeLeg(files) {
  const legs = {};
  files.forEach(function (file) {
    const run = JSON.parse(fs.readFileSync(file, 'utf8'));
    const leg = run.policy || 'unknown';
    const L = legs[leg] || (legs[leg] = {
      policy: leg, seeds: [], days: [], endReasons: {}, won: 0, national: 0, table: 0,
      w4unlocks: 0, w4faced: 0, w5unlocks: 0, w5faced: 0, w4kills: 0, w5kills: 0,
      ready5days: 0, tbFights: 0, traces: 0, unclassified: 0, tracePresent: 0,
      traceMissing: [], endings: {}, rounds: [], mHpLeftFrac: [], entryHp: [],
      dmgPerRoundPlayer: [], dmgPerRoundMonster: [], verbs: {}, abilities: {},
      rallyRows: [], sizing: null, anomalies: [], instrumentErrors: 0,
      bestRounds: [], tbKillMatched: 0, pyrrhicKills: 0, logW4Kills: 0,
    });
    L.seeds.push(run.seed);
    L.days.push(run.days);
    L.endReasons[run.endReason] = (L.endReasons[run.endReason] || 0) + 1;
    if (run.won) L.won++;
    if (run.scaleRank === 'national' || run.scaleRank === 'global') L.national++;
    if (run.wavesFaced && run.wavesFaced.table) L.table++;
    if ((run.unlockedWave | 0) >= 4) L.w4unlocks++;
    if ((run.unlockedWave | 0) >= 5) L.w5unlocks++;
    // wavesFaced is a per-type map: count distinct wave-4/5 types faced.
    try {
      const wf = run.wavesFaced || {};
      let f4 = 0, f5 = 0;
      Object.keys(wf).forEach(function (id) {
        if (!(wf[id] > 0)) return;
        if (WAVE_BY_ID[id] === 4) f4++;
        if (WAVE_BY_ID[id] === 5) f5++;
      });
      if (f4 > 0) L.w4faced++;
      if (f5 > 0) L.w5faced++;
    } catch (e) {}
    const w4k = (run.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length;
    const w5k = (run.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 5); }).length;
    L.w4kills += w4k; L.w5kills += w5k;
    (run.daily || []).forEach(function (d) {
      if (d.readiness5 && (d.readiness5.veterans | 0) >= 2) L.ready5days++;
    });
    L.instrumentErrors += (run.instrumentErrors || []).length;
    const tb = (run.tbFights || []).filter(function (f) { return (f.wave | 0) >= 4; });
    const trs = (run.traces || []).filter(function (x) { return (x.wave | 0) >= 4; });
    L.tbFights += tb.length;
    L.traces += trs.length;
    // Classification completeness: every wave-4+ TB fight row must have
    // a trace with an ending in the taxonomy. Join on traceSeq, then on
    // (day, mid) order as a fallback for rows the trace missed.
    const bySeq = {};
    trs.forEach(function (x) { if (x.tbSeq != null) bySeq[x.tbSeq] = x; });
    tb.forEach(function (row) {
      const tr = bySeq[row.seq] || trs.filter(function (x) { return x.day === row.day && x.mid === row.mid; })[0] || null;
      if (!tr || !tr.ending || ENDINGS.indexOf(tr.ending) < 0) {
        L.unclassified++;
        L.traceMissing.push({ seed: run.seed, seq: row.seq, day: row.day, mid: row.mid, outcome: row.outcome, hasTrace: !!tr });
      } else {
        L.endings[tr.ending] = (L.endings[tr.ending] || 0) + 1;
      }
    });
    trs.forEach(function (tr) {
      if (tracePresent(tr)) L.tracePresent++;
      else L.traceMissing.push({ seed: run.seed, seq: tr.seq, day: tr.day, mid: tr.mid, outcome: tr.outcome, hasTrace: true, noTurnsOrVerbs: true });
      if (tr.rounds != null) L.rounds.push(tr.rounds);
      if (tr.mHpLeftFrac != null) L.mHpLeftFrac.push(tr.mHpLeftFrac);
      if (tr.entryHp != null) L.entryHp.push(tr.entryHp);
      const byRound = damageByRound(tr);
      Object.keys(byRound).forEach(function (r) {
        L.dmgPerRoundPlayer.push(byRound[r].player);
        L.dmgPerRoundMonster.push(byRound[r].monster);
      });
      (tr.verbs || []).forEach(function (v) {
        L.verbs[v.verb] = (L.verbs[v.verb] || 0) + 1;
        if (v.verb === 'ability' && v.aid) L.abilities[v.aid] = (L.abilities[v.aid] || 0) + 1;
      });
      // Best-round composition (prereg secondary): recorded for every
      // trace; the summary below splits lost fights (the sizing
      // population) from kills.
      const comp = bestRoundComposition(tr);
      if (comp) L.bestRounds.push({ seed: run.seed, seq: tr.seq, day: tr.day,
        mid: tr.mid, ending: tr.ending, rounds: tr.rounds, comp: comp });
      // Anomaly: a kill in 1 round, or a single round dealing >50% of
      // entry HP — the 53006-day-149 shape (solo 1-round Congregation
      // kill) needs a damage trace to explain; flag it, don't average it.
      if (tr.ending === 'kill' && (tr.rounds != null && tr.rounds <= 1)) {
        L.anomalies.push({ kind: 'one-round-kill', seed: run.seed, seq: tr.seq, day: tr.day, mid: tr.mid, entryHp: tr.entryHp, hits: (tr.hits || []).length });
      }
      const maxRoundDmg = Object.keys(byRound).map(function (r) { return byRound[r].player; });
      const maxDmg = maxRoundDmg.length ? Math.max.apply(null, maxRoundDmg) : 0;
      if (tr.entryHp && maxDmg > 0.5 * tr.entryHp) {
        L.anomalies.push({ kind: 'one-round-half-hp', seed: run.seed, seq: tr.seq, day: tr.day, mid: tr.mid, entryHp: tr.entryHp, maxRoundPlayerDmg: maxDmg });
      }
    });
    // PRIMARY METRIC (prereg): wave-4 TB kill rate from waveKillLog, not
    // from fight endings — fight-level counts undercount the log by the
    // pyrrhic kills (the pyrrhic attribution path writes waveKillLog
    // directly and bypasses recordWaveKill, the instrument's kill hook).
    // A trace counts as a TB kill when its ending is 'kill', OR when it
    // is 'unfinished' and the log holds a same-day wave-4 kill by one of
    // the fight's fighters (pyrrhic: beast dead, scholar dead, fight
    // never closed through tbEnd). Field kills are NOT counted here —
    // the denominator is traced wave-4 TB fights only.
    const log = run.waveKillLog || [];
    L.logW4Kills += log.filter(function (e) { return ((e.w | 0) >= 4); }).length;
    trs.forEach(function (tr) {
      if (tr.ending === 'kill') { L.tbKillMatched++; return; }
      if (tr.ending !== 'unfinished') return;
      const matched = matchPyrrhicKill(tr, log);
      if (matched) { L.tbKillMatched++; L.pyrrhicKills++; }
    });
    L.rallyRows = L.rallyRows.concat(rallyCostRows(trs));
    L._allTraces = (L._allTraces || []).concat(trs);
  });
  Object.keys(legs).forEach(function (k) {
    const L = legs[k];
    L.medianSurvival = median(L.days);
    L.medianRounds = median(L.rounds);
    L.medianMHpLeftFrac = median(L.mHpLeftFrac);
    L.medianEntryHp = median(L.entryHp);
    L.medianDmgPerRoundPlayer = median(L.dmgPerRoundPlayer);
    L.medianDmgPerRoundMonster = median(L.dmgPerRoundMonster);
    L.meanDmgPerRoundPlayer = mean(L.dmgPerRoundPlayer);
    L.meanDmgPerRoundMonster = mean(L.dmgPerRoundMonster);
    L.sizing = sizeNextLever(L._allTraces || []);
    // Primary metric: matched TB kills / traced wave-4 TB fights.
    L.tbKillRate = L.traces ? L.tbKillMatched / L.traces : null;
    // Best-round composition summary (lost fights = sizing population).
    const lostBest = (L.bestRounds || []).filter(function (b) { return b.ending === 'scholar-death' || b.ending === 'scholar-flee'; });
    const allBest = L.bestRounds || [];
    const compSummary = function (rows) {
      if (!rows.length) return { n: 0 };
      return { n: rows.length,
        medianBestRound: median(rows.map(function (b) { return b.comp.total; })),
        medianScholarShare: median(rows.map(function (b) { return b.comp.total ? b.comp.scholar / b.comp.total : 0; })),
        allyContributed: rows.filter(function (b) { return b.comp.ally > 0; }).length,
        abilityInBestRound: rows.filter(function (b) { return (b.comp.abilityVerbs || []).length > 0; }).length,
        singleActorSpike: rows.filter(function (b) { return (b.comp.ally === 0 && b.comp.scholar === 0) || (b.comp.scholar === 0 && b.comp.ally > 0) || (b.comp.ally === 0 && b.comp.scholar > 0 && b.comp.strikes <= 1); }).length,
        medianShareOfEntry: median(rows.map(function (b) { return b.comp.shareOfEntry; }).filter(function (x) { return x != null; })),
      };
    };
    L.bestRoundSummary = { lost: compSummary(lostBest), all: compSummary(allBest) };
    // Rally cost summary: round-1 player damage with vs without rally.
    const rr = L.rallyRows;
    const withR = rr.filter(function (x) { return x.rally; });
    const withoutR = rr.filter(function (x) { return !x.rally; });
    L.rallySummary = {
      fights: rr.length, rallyFights: withR.length,
      rallyRoundScholarStruck: withR.filter(function (x) { return x.scholarStruckRallyRound; }).length,
      medianR1PlayerDmgRally: median(withR.map(function (x) { return x.r1PlayerDmg; })),
      medianR1PlayerDmgNoRally: median(withoutR.map(function (x) { return x.r1PlayerDmg; })),
      medianScholarStrikesRally: median(withR.map(function (x) { return x.scholarStrikes; })),
      medianScholarStrikesNoRally: median(withoutR.map(function (x) { return x.scholarStrikes; })),
    };
    delete L._allTraces;
  });
  return legs;
}

function main() {
  const dir = process.argv[2];
  if (!dir) { console.error('Usage: node scripts/partydamage-analyze-20261106.js <corpus-dir>'); process.exit(2); }
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); })
    .map(function (f) { return path.join(dir, f); }).sort();
  if (!files.length) { console.error('PARTYDAMAGE ANALYZE STOP: no .json files in ' + dir); process.exit(3); }
  const legs = analyzeLeg(files);
  console.log(JSON.stringify(legs, null, 2));
}

if (require.main === module) main();
module.exports = { analyzeLeg: analyzeLeg, tracePresent: tracePresent, damageByRound: damageByRound, bestRoundComposition: bestRoundComposition, rallyCostRows: rallyCostRows, sizeNextLever: sizeNextLever, median: median, mean: mean, ENDINGS: ENDINGS, matchPyrrhicKill: matchPyrrhicKill, matchPyrrhicKills: matchPyrrhicKills, sameBeast: sameBeast };
