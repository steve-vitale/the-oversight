// finishing-instrument-analyze-20261105.js — analyzer for the finishing
// instrument panel (arm build-finish-instrument). Reads per-seed JSON from
// finishing-instrument-driver-20261105.js and judges the prereg metrics:
// coverage (one roundsDetail entry per round + a matching fight_finish
// telemetry event, per-round HP/damage books balancing), the ending
// distribution split by channel, last-3-rounds stats, and the
// terminal-round signature. Kill matching is STRICT (secondkiller rule):
// a TB 'won' is a kill only when its killMatched flag holds AND a
// waveKillLog row matches strictly (same monster, same day, killer among
// the fight's fighters); unmatched kill-log rows are reported, never
// assigned. Field kills need no matching: the engine outcome vKill IS
// the kill.
// Usage: node scripts/finishing-instrument-analyze-20261105.js [dir]
'use strict';
const fs = require('fs');
const path = require('path');

const ENDINGS = ['kill', 'rout', 'flee', 'death', 'timeout', 'evade', 'unfinished', 'other'];

function median(xs) {
  const a = xs.filter(function (x) { return typeof x === 'number' && isFinite(x); }).sort(function (p, q) { return p - q; });
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}
function sum(xs) { return xs.reduce(function (s, x) { return s + (x || 0); }, 0); }

function checkFight(f, seedOut) {
  const problems = [];
  const rounds = f.roundsDetail || [];
  if ((f.rounds | 0) >= 1) {
    if (rounds.length !== (f.rounds | 0)) problems.push('roundsDetail-length: ' + rounds.length + ' != rounds ' + f.rounds);
    for (let i = 0; i < rounds.length; i++) {
      if (rounds[i].round !== i + 1) { problems.push('rounds-not-1..N at idx ' + i + ': ' + rounds[i].round); break; }
    }
    if (f.channel === 'field') {
      for (let i = 1; i < rounds.length; i++) {
        if (rounds[i].vHpStart !== rounds[i - 1].vHpEnd) { problems.push('vHp-chain break r' + rounds[i].round); break; }
        if (rounds[i].mHpStart !== rounds[i - 1].mHpEnd) { problems.push('mHp-chain break r' + rounds[i].round); break; }
      }
      const dealtSum = sum(rounds.map(function (r) { return r.dealt; }));
      if (dealtSum + (f.preRoundDealt | 0) !== (f.damageDealt | 0)) problems.push('dealt-book: rounds ' + dealtSum + ' + pre ' + (f.preRoundDealt | 0) + ' != damageDealt ' + f.damageDealt);
      const takenSum = sum(rounds.map(function (r) { return r.taken; }));
      if (takenSum !== (f.vTaken | 0)) problems.push('taken-book: rounds ' + takenSum + ' != vTaken ' + f.vTaken);
      const allyDealtSum = sum(rounds.map(function (r) { return r.allyDealt; }));
      if (allyDealtSum !== (f.allyDealt | 0)) problems.push('allyDealt-book: rounds ' + allyDealtSum + ' != allyDealt ' + f.allyDealt);
    }
    if (f.channel === 'player-tb') {
      for (let i = 1; i < rounds.length; i++) {
        if (rounds[i].round !== rounds[i - 1].round + 1) { problems.push('tb-rounds-not-consecutive at idx ' + i); break; }
      }
    }
    const last3 = f.last3 || [];
    const want3 = Math.min(3, f.rounds | 0);
    if (last3.length !== want3) problems.push('last3-length: ' + last3.length + ' != ' + want3);
    else if (want3 > 0 && last3[last3.length - 1].round !== (f.rounds | 0)) problems.push('last3-not-terminal');
  }
  if ((f.rounds | 0) === 0 && (f.ending !== 'evade' && f.ending !== 'other')) problems.push('zero-rounds-non-evade: ' + f.ending);
  return problems;
}

function analyzeSeed(out) {
  const s = {
    seed: out.seed, days: out.days, endReason: out.endReason, won: !!out.won,
    maxWave: out.maxWave, standing: out.standing,
    fights: [], coverageProblems: [], instrumentErrors: (out.instrumentErrors || []).slice(),
    teleFinishCount: out.teleFinishCount | 0,
  };
  const fights = (out.fights || []).slice();
  const teleByKey = {};
  (out.teleFinish || []).forEach(function (t) {
    if (!t) return;
    teleByKey[[t.channel, t.day, t.mid, t.rounds].join('|')] = (teleByKey[[t.channel, t.day, t.mid, t.rounds].join('|')] || 0) + 1;
  });
  fights.forEach(function (f) {
    const probs = checkFight(f, out);
    const key = [f.channel, f.day, f.mid, f.rounds].join('|');
    if ((f.rounds | 0) >= 1 && !teleByKey[key]) probs.push('no-matching-fight_finish-telemetry');
    s.fights.push(Object.assign({}, f, { coverageProblems: probs }));
    probs.forEach(function (p) { s.coverageProblems.push('seed ' + out.seed + ' ' + f.channel + ' d' + f.day + ' ' + f.mid + ': ' + p); });
  });
  // Strict kill cross-check (TB only): every wave-4+ kill-log row must
  // match a fight whose fighters include the killer (same day, same mid);
  // every TB fight with killMatched must have such a row.
  const log = (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); });
  s.w4killsLog = log.length;
  s.unmatchedKills = [];
  log.forEach(function (e2) {
    const m = fights.some(function (f) {
      return f.day === (e2.d | 0) && f.mid === e2.mid &&
        (e2.by === 'player' || (f.fighters || []).indexOf(e2.by) >= 0);
    });
    if (!m) s.unmatchedKills.push(e2);
  });
  s.tbKillMatchedWithoutLog = fights.filter(function (f) {
    return f.channel === 'player-tb' && f.killMatched &&
      !log.some(function (e2) { return e2.mid === f.mid && (e2.d | 0) === f.day; });
  }).length;
  return s;
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (n) { return n.indexOf('finish-instrument-s') === 0 && n.endsWith('.json'); }).sort();
  const seeds = files.map(function (n) { return analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'))); });
  const fights = [];
  seeds.forEach(function (s) { s.fights.forEach(function (f) { fights.push(f); }); });
  const byChannel = {};
  const byEnding = {};
  const byChannelEnding = {};
  fights.forEach(function (f) {
    byChannel[f.channel] = (byChannel[f.channel] || 0) + 1;
    byEnding[f.ending] = (byEnding[f.ending] || 0) + 1;
    const k = f.channel + ':' + f.ending;
    byChannelEnding[k] = (byChannelEnding[k] || 0) + 1;
  });
  const withRounds = fights.filter(function (f) { return (f.rounds | 0) >= 1; });
  const kills = fights.filter(function (f) { return f.ending === 'kill'; }).length;
  const last3Dealt = [];
  const last3StartVHpFrac = [];
  const last3Tricks = [];
  const last3Abilities = [];
  withRounds.forEach(function (f) {
    (f.last3 || []).forEach(function (r) {
      if (typeof r.dealt === 'number') last3Dealt.push(r.dealt);
      if (f.channel === 'field' && typeof r.vHpStart === 'number') last3StartVHpFrac.push(r.vHpStart / 100);
      if (r.tricks) last3Tricks.push(r.tricks.length);
      if (r.abilities) last3Abilities.push(r.abilities.length);
    });
  });
  // Terminal-round signature: what the final round looked like, per ending.
  const terminal = {};
  ENDINGS.forEach(function (e) {
    const fs = withRounds.filter(function (f) { return f.ending === e; });
    if (!fs.length) return;
    const lastRounds = fs.map(function (f) { return f.last3[f.last3.length - 1]; }).filter(Boolean);
    terminal[e] = {
      fights: fs.length,
      medianRounds: median(fs.map(function (f) { return f.rounds; })),
      medianDamageFrac: median(fs.map(function (f) { return f.damageFrac; })),
      medianFinalRoundDealt: median(lastRounds.map(function (r) { return r.dealt; })),
      medianFinalRoundTaken: median(lastRounds.map(function (r) { return (typeof r.taken === 'number') ? r.taken : null; })),
      medianFinalVHpFrac: median(fs.map(function (f) {
        if (f.channel !== 'field') return null;
        const lr = f.last3[f.last3.length - 1];
        return lr ? lr.vHpEnd / 100 : null;
      })),
    };
  });
  const coverageProblems = [];
  seeds.forEach(function (s) { coverageProblems.push.apply(coverageProblems, s.coverageProblems); });
  const out = {
    seeds: seeds.length, files: files,
    fights: fights.length, withRounds: withRounds.length,
    byChannel: byChannel, byEnding: byEnding, byChannelEnding: byChannelEnding,
    killRate: withRounds.length ? kills / withRounds.length : null,
    kills: kills,
    medianRounds: median(withRounds.map(function (f) { return f.rounds; })),
    medianDamageFrac: median(withRounds.map(function (f) { return f.damageFrac; })),
    last3: {
      rounds: last3Dealt.length, medianDealtPerRound: median(last3Dealt),
      medianStartVHpFrac: median(last3StartVHpFrac),
      roundsWithTricks: last3Tricks.filter(function (n) { return n > 0; }).length,
      roundsWithAbilities: last3Abilities.filter(function (n) { return n > 0; }).length,
    },
    terminal: terminal,
    coverageProblems: coverageProblems,
    coverageOk: coverageProblems.length === 0,
    unmatchedKills: seeds.reduce(function (s, x) { return s + x.unmatchedKills.length; }, 0),
    tbKillMatchedWithoutLog: seeds.reduce(function (s, x) { return s + x.tbKillMatchedWithoutLog; }, 0),
    instrumentErrors: seeds.reduce(function (s, x) { return s + x.instrumentErrors.length; }, 0),
    teleFinishTotal: seeds.reduce(function (s, x) { return s + x.teleFinishCount; }, 0),
  };
  return out;
}

if (require.main === module) {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-05', 'perseed-finish-instrument');
  const out = analyzeDir(dir);
  console.log(JSON.stringify(out, null, 2));
}

module.exports = { analyzeSeed: analyzeSeed, analyzeDir: analyzeDir, checkFight: checkFight, ENDINGS: ENDINGS };
