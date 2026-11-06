// baseline9-analyze-20261106.js — kill-channel census for the stageally-confirm
// 9-vs-3 split (arm sim-baseline9-a, run fleshout-20261106T1515Z).
// Pure function over the committed confirm corpus; no game reads, no re-scoring,
// zero src/js. Reads waveKillLog (authoritative — pyrrhic kills bypass
// recordWaveKill and never reach killsLive) and cross-checks killsLive.
//
// CHANNEL SEMANTICS (grounded in src/js/game.js at the anchor, verified by
// reading the call sites — NOT by the killsLive flag names):
//   via 'player'    — the scholar landed the killing blow in their own TB
//                      fight (tbEnd ~45861, _killerVia 'player').
//   via 'companion' — a villager COMPANION landed the killing blow IN THE
//                      SCHOLAR'S TB fight (TRICKTAG, ~45850: _tbKilledBy is
//                      a villager/ally fighter key). The scholar IS in the
//                      fight by construction. scholarChannel=false only means
//                      killer != scholar — it does NOT mean the scholar was
//                      absent. The confirm evidence's "scholar NOT in the
//                      fight" gloss for the two companion kills is wrong;
//                      this analyzer matches the winning TB row to check.
//   via 'wild'      — a villager's FIELD-fight kill out in the world
//                      (~20607: resolveWild vKill, scholar not involved).
//   via 'patrol'    — a patrol kill (~7982).
//   pyrrhic         — in waveKillLog but not killsLive: the fight was 'lost'
//                      and recordPyrrhicKill wrote the log directly (~45849).
//                      Classified from the matched lost TB row.
// Usage: node scripts/baseline9-analyze-20261106.js <per-seed-dir> [prefix]
//   (prints a JSON summary to stdout)
'use strict';
const fs = require('fs');
const path = require('path');

function median(xs) {
  const a = (xs || []).filter(function (x) { return x != null && isFinite(x); }).sort(function (p, q) { return p - q; });
  if (!a.length) return null;
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

function normOutcome(o) {
  if (o == null) return 'unfinished';
  if (o === 'routed') return 'rout'; // fightinterior-b D1: engine emits 'routed'
  return o;
}

function loadDir(dir, prefix) {
  prefix = prefix || 'stageally-s';
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf(prefix) === 0 && f.endsWith('.json'); }).sort();
  return files.map(function (f) {
    return { file: f, row: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) };
  });
}

// Match a wave-4 log kill to its fight row(s).
//   player/companion: TB rows, same day + mid; prefer won/routed rows with
//     monsterHpFracEnd 0; among those prefer the row whose allyIds include
//     the killer (companion) — the last-blow fighter stands in the fight.
//   wild/patrol: field rows, same day + mid, fighter == killer, outcome vKill.
//   pyrrhic (log-only): TB rows, same day + mid, outcome lost.
function matchKill(row, kill) {
  const tb = (row.tbFights || []).filter(function (f) { return (f.wave | 0) >= 4 && f.day === kill.d && f.mid === kill.mid; });
  const field = (row.fights || []).filter(function (f) { return (f.wave | 0) >= 4 && f.day === kill.d && f.mid === kill.mid; });
  if (kill.via === 'wild' || kill.via === 'patrol') {
    const hit = field.filter(function (f) { return f.channel === 'field' && f.fighter === kill.by && f.outcome === 'vKill'; });
    if (hit.length) return { kind: kill.via === 'wild' ? 'wild-field' : 'patrol-field', fight: hit[0], tbCandidates: tb.length, fieldCandidates: field.length, ambiguous: hit.length > 1 };
    return { kind: 'unmatched', fight: null, tbCandidates: tb.length, fieldCandidates: field.length, ambiguous: false };
  }
  const won = tb.filter(function (f) { return (normOutcome(f.outcome) === 'won' || normOutcome(f.outcome) === 'rout') && (f.monsterHpFracEnd | 0) === 0; });
  if (won.length) {
    const withKiller = won.filter(function (f) { return (f.allyIds || []).indexOf(kill.by) >= 0; });
    const pick = withKiller.length ? withKiller[withKiller.length - 1] : won[won.length - 1];
    const channel = kill.via === 'companion' ? 'companion-tb-scholar-present' : 'scholar-tb';
    return { kind: channel, fight: pick, tbCandidates: tb.length, fieldCandidates: field.length, ambiguous: won.length > 1 && withKiller.length !== 1 };
  }
  const lost = tb.filter(function (f) { return normOutcome(f.outcome) === 'lost'; });
  if (lost.length) {
    return { kind: 'pyrrhic-tb', fight: lost[lost.length - 1], tbCandidates: tb.length, fieldCandidates: field.length, ambiguous: lost.length > 1 };
  }
  return { kind: 'unmatched', fight: null, tbCandidates: tb.length, fieldCandidates: field.length, ambiguous: false };
}

function classifyRow(entry) {
  const row = entry.row;
  const log = (row.waveKillLog || []).filter(function (k) { return ((k.w | 0) >= 4); });
  const live = (row.killsLive || []).filter(function (k) { return (k.wave | 0) >= 4; });
  const liveKeys = {};
  live.forEach(function (k) { liveKeys[k.day + '|' + k.mid + '|' + k.by + '|' + k.via] = true; });
  const kills = log.map(function (k) {
    const inLive = !!liveKeys[k.d + '|' + k.mid + '|' + k.by + '|' + k.via];
    const m = matchKill(row, k);
    const f = m.fight;
    // Wound trail: same-day same-mid TB fights BEFORE the matched fight
    // (same monster ground down across the day — monster HP persists).
    let trail = [];
    let priorDeaths = 0;
    if (f) {
      const same = (row.tbFights || []).filter(function (x) { return x.day === k.d && x.mid === k.mid && x.seq < f.seq; });
      trail = same.map(function (x) { return { seq: x.seq, outcome: normOutcome(x.outcome), rounds: x.rounds, monsterHp: x.monsterHpFracEnd, scholarDied: !!x.scholarDiedInFight }; });
      priorDeaths = same.filter(function (x) { return !!x.scholarDiedInFight; }).length;
    }
    const scholarDeathsDay = (row.scholarDeaths || []).filter(function (s) { return s.day === k.d && s.inCombat; }).length;
    return {
      day: k.d, mid: k.mid, by: k.by, via: k.via, pyrrhic: !inLive,
      channel: m.kind, matched: !!f,
      matchAmbiguous: !!m.ambiguous, tbCandidates: m.tbCandidates,
      rounds: f ? f.rounds : null,
      alliesAtEntry: f ? f.alliesAtEntry : null,
      partyAtEntry: f ? f.partyAtEntry : null,
      allyIds: f ? (f.allyIds || []) : null,
      scholarHpEnd: f ? f.scholarHpFracEnd : null,
      scholarDiedInFight: f ? !!f.scholarDiedInFight : null,
      monsterHpEnd: f ? f.monsterHpFracEnd : null,
      fightOutcome: f ? normOutcome(f.outcome) : null,
      priorSameDayFights: trail.length, priorScholarDeaths: priorDeaths,
      woundTrail: trail, scholarDeathsInCombatThatDay: scholarDeathsDay,
    };
  });
  return { file: entry.file, seed: row.seed, policy: row.policy, kills: kills,
    logW4: log.length, liveW4: live.length, instrumentErrors: (row.instrumentErrors || []).length };
}

function tbAnatomy(rows) {
  const tb = [];
  rows.forEach(function (r) { (r.tbFights || []).filter(function (f) { return (f.wave | 0) >= 4; }).forEach(function (f) { tb.push(f); }); });
  const outcomes = {};
  tb.forEach(function (f) { const o = normOutcome(f.outcome); outcomes[o] = (outcomes[o] | 0) + 1; });
  const lost = tb.filter(function (f) { return normOutcome(f.outcome) === 'lost'; });
  const won = tb.filter(function (f) { return normOutcome(f.outcome) === 'won' || normOutcome(f.outcome) === 'rout'; });
  const withAlly = tb.filter(function (f) { return (f.alliesAtEntry | 0) >= 1; }).length;
  const withParty = tb.filter(function (f) { return (f.partyAtEntry | 0) >= 1; }).length;
  const died = tb.filter(function (f) { return !!f.scholarDiedInFight; }).length;
  function winSplit(list) {
    const w = list.filter(function (f) { return normOutcome(f.outcome) === 'won'; }).length;
    return { n: list.length, wins: w, winRate: list.length ? w / list.length : null };
  }
  // Grind groups: same (day, mid) fought 2+ times in one run.
  const groups = {};
  rows.forEach(function (r) {
    (r.tbFights || []).filter(function (f) { return (f.wave | 0) >= 4; }).forEach(function (f) {
      const key = r.seed + '|' + f.day + '|' + f.mid;
      (groups[key] = groups[key] || []).push(f);
    });
  });
  const multi = Object.keys(groups).filter(function (k) { return groups[k].length >= 2; });
  const grindWins = multi.filter(function (k) { return groups[k].some(function (f) { return normOutcome(f.outcome) === 'won'; }); }).length;
  const grindDeaths = multi.reduce(function (m, k) { return m + groups[k].filter(function (f) { return !!f.scholarDiedInFight; }).length; }, 0);
  return {
    tbFightsW4: tb.length, outcomes: outcomes,
    tbFightsW4WithAlly: withAlly, tbFightsW4WithParty: withParty,
    allyPresence: tb.length ? withAlly / tb.length : null,
    partyPresence: tb.length ? withParty / tb.length : null,
    tbSurvival: tb.length ? (tb.length - died) / tb.length : null,
    wins: won.length, losses: lost.length,
    medianRoundsLost: median(lost.map(function (f) { return f.rounds; })),
    medianRoundsWon: median(won.map(function (f) { return f.rounds; })),
    medianMonsterHpEndLost: median(lost.map(function (f) { return f.monsterHpFracEnd; })),
    medianScholarHpEndWon: median(won.map(function (f) { return f.scholarHpFracEnd; })),
    winsByParty: winSplit(tb.filter(function (f) { return (f.partyAtEntry | 0) >= 1; })),
    winsNoParty: winSplit(tb.filter(function (f) { return (f.partyAtEntry | 0) === 0; })),
    winsByAlly: winSplit(tb.filter(function (f) { return (f.alliesAtEntry | 0) >= 1; })),
    winsNoAlly: winSplit(tb.filter(function (f) { return (f.alliesAtEntry | 0) === 0; })),
    grindGroups: multi.length,
    grindGroupsWon: grindWins,
    grindScholarDeaths: grindDeaths,
    grindGroupSizes: multi.map(function (k) { return groups[k].length; }).sort(),
  };
}

function fieldAnatomy(rows) {
  const field = [];
  rows.forEach(function (r) { (r.fights || []).filter(function (f) { return (f.wave | 0) >= 4 && f.channel === 'field'; }).forEach(function (f) { field.push(f); }); });
  const outcomes = {};
  field.forEach(function (f) { const o = f.outcome || 'null'; outcomes[o] = (outcomes[o] | 0) + 1; });
  return { fieldW4Fights: field.length, fieldOutcomes: outcomes,
    fieldVKills: outcomes.vKill || 0, fieldVFlees: outcomes.vFlee || 0, fieldVDies: outcomes.vDie || 0 };
}

function rallyProxy(rows) {
  // Armed leg only: rallyCalls (day + w4mids) matched to TB rows same day+mid.
  // A rally fires in ONE fight, but the call carries no fight seq, so a call
  // can match several same-day same-mid rows (grind groups) — the match is
  // "fought on a day+mid where a rally fired", and the over-match count is
  // reported. The ally-restricted split removes the no-ally confound (rallies
  // only fire with an ally present).
  const rallied = [], plain = [];
  const calls = [];
  rows.forEach(function (r) { (r.rallyCalls || []).forEach(function (c) { calls.push(c); }); });
  rows.forEach(function (r) {
    const rc = r.rallyCalls || [];
    (r.tbFights || []).filter(function (f) { return (f.wave | 0) >= 4; }).forEach(function (f) {
      const hit = rc.some(function (c) { return c.day === f.day && (c.w4mids || []).indexOf(f.mid) >= 0; });
      (hit ? rallied : plain).push(f);
    });
  });
  function summ(list) {
    const wins = list.filter(function (f) { return normOutcome(f.outcome) === 'won'; }).length;
    return { n: list.length, wins: wins, winRate: list.length ? wins / list.length : null,
      medianRounds: median(list.map(function (f) { return f.rounds; })),
      medianMonsterHpEnd: median(list.map(function (f) { return f.monsterHpFracEnd; })) };
  }
  const withAlly = function (list) { return list.filter(function (f) { return (f.alliesAtEntry | 0) >= 1; }); };
  return { rallyCalls: calls.length, ralliedRows: rallied.length,
    overMatch: rallied.length - calls.length,
    rallied: summ(rallied), nonRallied: summ(plain),
    ralliedWithAlly: summ(withAlly(rallied)), nonRalliedWithAlly: summ(withAlly(plain)) };
}

function analyzeDir(dir, prefix) {
  const entries = loadDir(dir, prefix);
  const rows = entries.map(function (e) { return e.row; });
  const baseline = rows.filter(function (r) { return r.policy === 'baseline'; });
  const armed = rows.filter(function (r) { return r.policy === 'staged'; });
  const classified = entries.map(classifyRow);
  const kills = [];
  classified.forEach(function (c) { c.kills.forEach(function (k) { kills.push(Object.assign({ seed: c.seed, policy: c.policy }, k)); }); });
  const byLeg = {};
  ['baseline', 'staged'].forEach(function (leg) {
    const legRows = leg === 'baseline' ? baseline : armed;
    const legKills = kills.filter(function (k) { return k.policy === leg; });
    const channels = {};
    legKills.forEach(function (k) { channels[k.channel] = (channels[k.channel] | 0) + 1; });
    const perSeed = {};
    legKills.forEach(function (k) { perSeed[k.seed] = (perSeed[k.seed] | 0) + 1; });
    const days = legRows.map(function (r) { return r.gameDays != null ? r.gameDays : r.days; });
    byLeg[leg] = {
      kills: legKills.length, channels: channels, perSeedKills: perSeed,
      medianSurvival: median(days),
      tb: tbAnatomy(legRows), field: fieldAnatomy(legRows),
      rally: leg === 'staged' ? rallyProxy(legRows) : null,
    };
  });
  const unclassified = kills.filter(function (k) { return k.channel === 'unmatched'; });
  const ambiguous = kills.filter(function (k) { return k.matchAmbiguous; });
  const pyrrhic = kills.filter(function (k) { return k.pyrrhic; });
  // Gap decomposition (baseline minus armed), kill by kill.
  const gap = byLeg.baseline.kills - byLeg.staged.kills;
  const channelGap = {};
  Object.keys(byLeg.baseline.channels).forEach(function (c) {
    channelGap[c] = (byLeg.baseline.channels[c] | 0) - (byLeg.staged.channels[c] | 0);
  });
  Object.keys(byLeg.staged.channels).forEach(function (c) {
    if (channelGap[c] == null) channelGap[c] = 0 - (byLeg.staged.channels[c] | 0);
  });
  const verdict = (unclassified.length === 0 && kills.length > 0)
    ? { verdict: 'DIAG-GO', reason: 'all ' + kills.length + ' wave-4 kills classified with matched fight rows; gap decomposed by channel (see channelGap); rally-cost proxy computed from the corpus' }
    : { verdict: 'DIAG-NO-GO', reason: 'classification incomplete: ' + unclassified.length + ' unmatched kills of ' + kills.length + ' total' };
  return {
    corpus: dir, files: entries.length,
    baselineSeeds: baseline.length, armedSeeds: armed.length,
    instrumentErrors: entries.reduce(function (m, e) { return m + ((e.row.instrumentErrors || []).length); }, 0),
    kills: kills, perSeed: classified,
    byLeg: byLeg, gap: gap, channelGap: channelGap,
    unclassified: unclassified.length, ambiguousMatches: ambiguous.length,
    pyrrhicKills: pyrrhic.length,
    verdict: verdict,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: baseline9-analyze-20261106.js <per-seed-dir> [prefix]'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir, process.argv[3]), null, 2));
}

module.exports = { analyzeDir: analyzeDir, matchKill: matchKill, classifyRow: classifyRow,
  tbAnatomy: tbAnatomy, fieldAnatomy: fieldAnatomy, rallyProxy: rallyProxy, median: median, normOutcome: normOutcome };
