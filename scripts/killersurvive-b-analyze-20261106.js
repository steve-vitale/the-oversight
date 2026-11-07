// killersurvive-b-analyze-20261106.js — ALL-killer death census (arm
// sim-killersurvive-b). Pure function over grind-instrument recorder
// corpora (perseed-grind-a, perseed-killersurvive-b). Extends arm A
// (sim-killersurvive-a, first killers only, band 53001-53008) to EVERY
// wave-4 killer: death channel + cause, kill-to-death days, fought-again
// after the kill, same-chain death, partner alive at death, health /
// whereabouts after the kill. Reuses killerdeath-analyze-20261105
// (killerFates: identity from waveKillLog w>=4, death day/cause split
// from fallen + scholarDeaths + deadMap) and killersurvive-analyze-20261106
// (deathChannel: record-based, never SAY lines). No game reads, no RNG.
// Usage:
//   node scripts/killersurvive-b-analyze-20261106.js <corpusDir> [prefix]
//   prefix defaults to 'grind-s' (matches grind-s<seed>-<run>.json).
// Prints a JSON summary. Exits 1 if any instrument error exists or any
// DEAD killer is unmatched (channel 'unmatched').
'use strict';
const fs = require('fs');
const path = require('path');
const KD = require('./killerdeath-analyze-20261105');
const KS = require('./killersurvive-analyze-20261106');

function median(nums) {
  if (!nums.length) return null;
  const s = nums.slice().sort(function (a, b) { return a - b; });
  return (s[Math.floor((s.length - 1) / 2)] + s[Math.ceil((s.length - 1) / 2)]) / 2;
}

function filesFor(dir, prefix) {
  return fs.readdirSync(dir).filter(function (f) {
    return f.indexOf(prefix) === 0 && f.endsWith('.json');
  }).sort().map(function (f) { return path.join(dir, f); });
}

// Fights (TB traces + field rows) for one killer after their first kill.
// range: (firstDay, deathDay] — death day inclusive so a same-day refight
// counts; for a living killer the range runs to the last daily row.
function foughtAgain(row, fate, ch) {
  const first = fate.firstDay | 0;
  const end = fate.deathDay != null ? (fate.deathDay | 0) :
    ((row.daily || []).length ? (row.daily[row.daily.length - 1].day | 0) : first);
  const by = fate.by;
  const dd = fate.deathDay != null ? (fate.deathDay | 0) : null;
  const deathMid = ch ? (ch.tbRow ? ch.tbRow.mid : (ch.fieldRow ? ch.fieldRow.mid : null)) : null;
  // Join key: traces.tbSeq == tbFights.seq (traces.seq == tbFights.traceSeq
  // is the other, reversed numbering — joining on traceSeq is wrong).
  const deathTraceSeq = (ch && ch.tbRow && ch.tbRow.seq != null) ? ch.tbRow.seq : null;
  const out = [];
  (row.fieldFights || []).forEach(function (f) {
    if (f.vid === by && (f.day | 0) > first && (f.day | 0) <= end) {
      // The death fight itself is the endpoint, not a refight.
      if (dd != null && (f.day | 0) === dd && f.mid === deathMid &&
          (f.outcome === 'vDie' || f.outcome === 'died' || f.outcome === 'scholar-died')) return;
      out.push({ day: f.day, channel: 'field', mid: f.mid, wave: f.wave, outcome: f.outcome });
    }
  });
  // TB traces list every fighter; a killer in the fighters list fought.
  (row.traces || []).forEach(function (t) {
    if ((t.fighters || []).indexOf(by) >= 0 && (t.day | 0) > first && (t.day | 0) <= end) {
      if (deathTraceSeq != null && t.tbSeq === deathTraceSeq) return;
      if (!out.some(function (o) { return o.day === t.day && o.mid === t.mid && o.channel === 'tb'; })) {
        out.push({ day: t.day, channel: 'tb', mid: t.mid, wave: t.wave, outcome: t.outcome });
      }
    }
  });
  // Scholar-TB fights where the killer is the scholar but not listed in the
  // trace fighters (defensive: daily scholarId join).
  const scholarDays = {};
  (row.daily || []).forEach(function (s) { scholarDays[s.day | 0] = s.scholarId; });
  (row.tbFights || []).forEach(function (f) {
    if (scholarDays[f.day | 0] === by && (f.day | 0) > first && (f.day | 0) <= end) {
      if (dd != null && (f.day | 0) === dd && f.mid === deathMid && f.scholarDiedInFight) return;
      if (!out.some(function (o) { return o.day === f.day && o.mid === f.mid && o.channel === 'tb'; })) {
        out.push({ day: f.day, channel: 'tb', mid: f.mid, wave: f.wave, outcome: f.outcome });
      }
    }
  });
  out.sort(function (a, b) { return a.day - b.day; });
  return out;
}

// Same-chain death: the death fight is against the SAME mid as the killer's
// first kill AND is linked to the kill chain by one of:
//   (a) same instance id (field instId / trace instId) as an earlier fight
//       of that mid in the kill-to-death window;
//   (b) exact-HP trail: the death TB trace's entryHp equals a prior
//       trace/field mHpLeft for the same mid (grind-validated method);
//   (c) same-day same-mid TB group (another TB fight vs the same mid on
//       the death day — the same-day grind).
// Same mid with NO link is reported as sameMidUnlinked, never forced.
function sameChain(row, fate, ch) {
  const firstMid = fate.firstMid;
  const deathMid = ch.tbRow ? ch.tbRow.mid : (ch.fieldRow ? ch.fieldRow.mid : null);
  const sameMid = deathMid != null && firstMid != null && deathMid === firstMid;
  if (!sameMid || fate.deathDay == null) {
    return { sameMid: sameMid, sameChain: false, linkRule: null, deathMid: deathMid };
  }
  const dd = fate.deathDay | 0;
  const first = fate.firstDay | 0;
  const mid = deathMid;
  // The death fight itself, to exclude it from the chain (else rule (a)
  // would trivially match the death row's own instance id).
  const deathTrace = (ch.tbRow && ch.tbRow.seq != null) ?
    ((row.traces || []).filter(function (t) { return t.tbSeq === ch.tbRow.seq; })[0] || null) : null;
  const deathField = ch.fieldRow ?
    ((row.fieldFights || []).filter(function (f) {
      return f.vid === fate.by && (f.day | 0) === dd && f.mid === mid &&
        (f.outcome === 'vDie' || f.outcome === 'died' || f.outcome === 'scholar-died');
    })[0] || null) : null;
  // (a) instance-id continuity (chain excludes the death fight itself).
  const chainInst = {};
  (row.fieldFights || []).forEach(function (f) {
    if (f.mid === mid && (f.day | 0) >= first && (f.day | 0) <= dd &&
        !(f.vid === fate.by && (f.day | 0) === dd)) {
      (f.instIds || (f.instId ? [f.instId] : [])).forEach(function (id) { chainInst[id] = true; });
    }
  });
  (row.traces || []).forEach(function (t) {
    if (t.mid === mid && (t.day | 0) >= first && (t.day | 0) <= dd &&
        !(deathTrace && t.tbSeq === deathTrace.tbSeq)) {
      (t.instIds || (t.instId ? [t.instId] : [])).forEach(function (id) { chainInst[id] = true; });
      if (t.instId) chainInst[t.instId] = true;
    }
  });
  const deathInsts = [];
  if (deathField) (deathField.instIds || (deathField.instId ? [deathField.instId] : [])).forEach(function (id) { deathInsts.push(id); });
  if (deathTrace) (deathTrace.instIds || (deathTrace.instId ? [deathTrace.instId] : [])).forEach(function (id) { deathInsts.push(id); });
  if (deathInsts.some(function (id) { return chainInst[id]; })) {
    return { sameMid: true, sameChain: true, linkRule: 'instance-id', deathMid: deathMid };
  }
  // (b) exact-HP trail: death TB trace entryHp == a prior exit for same mid.
  if (deathTrace && deathTrace.entryHp != null) {
    const exits = [];
    (row.traces || []).forEach(function (t) {
      if (t.mid === mid && (t.day | 0) >= first &&
          ((t.day | 0) < dd || (t.tbSeq !== deathTrace.tbSeq && (t.day | 0) === dd))) {
        if (t.mHpLeft != null) exits.push(t.mHpLeft);
      }
    });
    (row.fieldFights || []).forEach(function (f) {
      if (f.mid === mid && (f.day | 0) >= first && (f.day | 0) <= dd && f.mHpLeft != null) exits.push(f.mHpLeft);
    });
    if (exits.indexOf(deathTrace.entryHp) >= 0) {
      return { sameMid: true, sameChain: true, linkRule: 'exact-hp-trail', deathMid: deathMid };
    }
  }
  // (c) same-day same-mid TB group.
  const sameDay = (row.tbFights || []).filter(function (f) {
    return f.mid === mid && (f.day | 0) === dd;
  });
  if (sameDay.length >= 2) {
    return { sameMid: true, sameChain: true, linkRule: 'same-day-group', deathMid: deathMid };
  }
  return { sameMid: true, sameChain: false, linkRule: null, deathMid: deathMid };
}

function analyzeRow(row) {
  const fates = KD.killerFates(row);
  const w4 = (row.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 4; });
  const firstBloodDay = w4.length ? Math.min.apply(null, w4.map(function (e) { return e.d | 0; })) : null;
  const firstKiller = firstBloodDay != null ?
    (w4.filter(function (e) { return (e.d | 0) === firstBloodDay; })[0] || {}).by : null;
  // First-kill wave/mid per killer (waveKillLog is authoritative; the
  // ad_sponsor killsLive rows with wave null are NOT wave kills — the
  // sponsor-creature add — and correctly have no waveKillLog entry).
  const firstKillInfo = {};
  w4.forEach(function (e) {
    const cur = firstKillInfo[e.by];
    if (!cur || (e.d | 0) < (cur.day | 0)) {
      firstKillInfo[e.by] = { day: e.d | 0, wave: e.w | 0, mid: e.mid, via: e.via };
    }
  });
  const killers = fates.map(function (fate) {
    const ch = KS.deathChannel(row, fate);
    const info = firstKillInfo[fate.by] || { day: fate.firstDay, wave: null, mid: null, via: null };
    fate.firstMid = info.mid;
    const again = foughtAgain(row, fate, ch);
    const chain = sameChain(row, fate, ch);
    const track = (row.killerTrack || []).filter(function (t) { return t.by === fate.by; });
    const post = track.filter(function (t) {
      return (t.day | 0) >= (fate.firstDay | 0) &&
        (fate.deathDay == null || (t.day | 0) < (fate.deathDay | 0));
    });
    const healths = post.map(function (t) { return t.health; }).filter(function (h) { return h != null; });
    return {
      seed: row.seed, by: fate.by,
      isFirstKiller: fate.by === firstKiller,
      firstDay: fate.firstDay, firstKillWave: info.wave, firstKillMid: info.mid,
      firstKillVia: info.via, kills: fate.kills, lastDay: fate.lastDay,
      mids: fate.mids, via: fate.via, channels: fate.channels,
      deathDay: fate.deathDay, killToDeathDays: fate.killToDeathDays,
      aliveAtEnd: fate.aliveAtEnd,
      deathCauseRaw: fate.deathCauseRaw, deathCauseSplit: fate.deathCauseSplit,
      channel: ch.channel, channelDetail: ch.detail,
      partyAtDeath: ch.partyAtDeath,
      foughtAgain: again, foughtAgainCount: again.length,
      foughtAgainFirstDay: again.length ? again[0].day : null,
      sameMidAsKill: chain.sameMid, sameChainDeath: chain.sameChain,
      sameChainLink: chain.linkRule, deathMid: chain.deathMid,
      healthMin: healths.length ? Math.min.apply(null, healths) : null,
      healthLast: healths.length ? healths[healths.length - 1] : null,
      atHavenShare: post.length ? post.filter(function (t) { return t.atHaven; }).length / post.length : null,
      onExpedShare: post.length ? post.filter(function (t) { return t.onExped; }).length / post.length : null,
      postKillDaysTracked: post.length,
    };
  });
  // Partner alive at death: another wave-4 killer living on the death day.
  killers.forEach(function (k) {
    if (k.deathDay != null) {
      k.partnerAliveAtDeath = killers.some(function (o) {
        return o.by !== k.by && (o.firstDay | 0) <= (k.deathDay | 0) &&
          (o.deathDay == null || (o.deathDay | 0) > (k.deathDay | 0));
      });
      k.partnerIdsAtDeath = killers.filter(function (o) {
        return o.by !== k.by && (o.firstDay | 0) <= (k.deathDay | 0) &&
          (o.deathDay == null || (o.deathDay | 0) > (k.deathDay | 0));
      }).map(function (o) { return o.by; });
    } else {
      k.partnerAliveAtDeath = killers.some(function (o) { return o.by !== k.by && o.aliveAtEnd; });
      k.partnerIdsAtDeath = killers.filter(function (o) { return o.by !== k.by && o.aliveAtEnd; }).map(function (o) { return o.by; });
    }
  });
  const daily = row.daily || [];
  let pairSnapshotDay = null;
  daily.forEach(function (s) {
    if (pairSnapshotDay == null && s.readiness5 && (s.readiness5.veterans | 0) >= 2) pairSnapshotDay = s.day;
  });
  const sim = KD.maxSimultaneous(fates);
  return {
    seed: row.seed, days: row.days, endReason: row.endReason, won: !!row.won,
    scaleRank: row.scaleRank, maxWave: row.maxWave, unlockedWave: row.unlockedWave,
    standing: row.standing,
    w4kills: w4.length,
    killersEver: killers.length,
    livingAtEnd: killers.filter(function (k) { return k.aliveAtEnd; }).length,
    maxSimultaneous: sim.max, maxSimultaneousDay: sim.maxDay,
    pairSnapshotDay: pairSnapshotDay, hasLivingPairSnapshot: pairSnapshotDay != null,
    instrumentErrors: (row.instrumentErrors || []).length,
    killers: killers,
  };
}

function contextOf(channel) {
  if (!channel) return '?';
  if (channel.indexOf('TB-fight') === 0) return 'TB-fight';
  if (channel.indexOf('field-fight') === 0) return 'field-fight';
  if (channel === 'contest') return 'contest';
  if (channel === 'at-home-not-combat') return 'at-home-not-combat';
  if (channel === 'on-road-not-combat') return 'on-road-not-combat';
  if (channel.indexOf('fallen-monster') === 0) return 'fallen-monster';
  if (channel.indexOf('fallen:') === 0) return 'fallen-other';
  if (channel === 'alive-at-end') return 'alive-at-end';
  return channel;
}

function causeTop(split) {
  // The honest cause level: KD's split wraps scholar deaths as
  // 'scholar-death:<causeArg>:<loc>:<comb>' — the wrapper is a record type,
  // not a cause. The cause is the causeArg (e.g. 'the wild', 'contest',
  // 'a stranger'). Counting the wrapper would trivially read 100% and
  // prove nothing. 'monster:<name>' stays whole; literal causes stay.
  if (!split) return '?';
  if (split.indexOf('scholar-death:') === 0) {
    const parts = split.split(':');
    return parts.length > 1 ? parts[1] : split;
  }
  return split.split(':')[0] === 'monster' ? split : split.split(':')[0];
}

function analyzeDir(dir, prefix) {
  const files = filesFor(dir, prefix);
  const rows = files.map(function (f) { return JSON.parse(fs.readFileSync(f, 'utf8')); });
  const seeds = rows.map(analyzeRow);
  const killers = [];
  seeds.forEach(function (s) { s.killers.forEach(function (k) { killers.push(k); }); });
  const dead = killers.filter(function (k) { return !k.aliveAtEnd; });
  const deadW4first = dead.filter(function (k) { return k.firstKillWave === 4; });
  const channelCounts = {}, contextCounts = {}, causeCounts = {};
  const channelCountsW4 = {}, contextCountsW4 = {}, causeCountsW4 = {};
  dead.forEach(function (k) {
    channelCounts[k.channel] = (channelCounts[k.channel] | 0) + 1;
    contextCounts[contextOf(k.channel)] = (contextCounts[contextOf(k.channel)] | 0) + 1;
    causeCounts[causeTop(k.deathCauseSplit)] = (causeCounts[causeTop(k.deathCauseSplit)] | 0) + 1;
  });
  deadW4first.forEach(function (k) {
    channelCountsW4[k.channel] = (channelCountsW4[k.channel] | 0) + 1;
    contextCountsW4[contextOf(k.channel)] = (contextCountsW4[contextOf(k.channel)] | 0) + 1;
    causeCountsW4[causeTop(k.deathCauseSplit)] = (causeCountsW4[causeTop(k.deathCauseSplit)] | 0) + 1;
  });
  const topShare = function (counts, n) {
    if (!n) return { top: null, share: null };
    let best = null, bestN = 0;
    Object.keys(counts).forEach(function (c) { if (counts[c] > bestN) { best = c; bestN = counts[c]; } });
    return { top: best, count: bestN, share: bestN / n };
  };
  const wall = { wins: 0, national: 0, table: 0, wave4unlocks: 0, wave5unlocks: 0,
    wave4kills: 0, wave5kills: 0, medianDays: null };
  rows.forEach(function (r) {
    if (r.won) wall.wins++;
    if (r.scaleRank === 'national' || r.scaleRank === 'global') wall.national++;
    if ((r.unlockedWave | 0) >= 4) wall.wave4unlocks++;
    if ((r.unlockedWave | 0) >= 5) wall.wave5unlocks++;
    wall.wave4kills += (r.waveKillLog || []).filter(function (e) { return (e.w | 0) === 4; }).length;
    wall.wave5kills += (r.waveKillLog || []).filter(function (e) { return (e.w | 0) === 5; }).length;
  });
  wall.medianDays = median(seeds.map(function (s) { return s.days; }));
  return {
    corpusDir: dir, n: seeds.length,
    instrumentErrors: seeds.reduce(function (m, s) { return m + s.instrumentErrors; }, 0),
    killersEver: killers.length, deadKillers: dead.length,
    livingAtEnd: killers.filter(function (k) { return k.aliveAtEnd; }).length,
    killToDeathMedianAll: median(dead.map(function (k) { return k.killToDeathDays; })),
    killToDeathMedianW4first: median(deadW4first.map(function (k) { return k.killToDeathDays; })),
    killToDeathDays: dead.map(function (k) { return k.killToDeathDays; }).sort(function (a, b) { return a - b; }),
    channelCounts: channelCounts, contextCounts: contextCounts, causeCounts: causeCounts,
    dominantContext: topShare(contextCounts, dead.length),
    dominantCause: topShare(causeCounts, dead.length),
    channelCountsW4first: channelCountsW4, contextCountsW4first: contextCountsW4,
    causeCountsW4first: causeCountsW4,
    dominantContextW4first: topShare(contextCountsW4, deadW4first.length),
    dominantCauseW4first: topShare(causeCountsW4, deadW4first.length),
    foughtAgainShare: dead.length ? dead.filter(function (k) { return k.foughtAgainCount > 0; }).length / dead.length : null,
    foughtAgainCount: dead.filter(function (k) { return k.foughtAgainCount > 0; }).length,
    sameChainDeaths: dead.filter(function (k) { return k.sameChainDeath; }).length,
    sameMidDeaths: dead.filter(function (k) { return k.sameMidAsKill; }).length,
    partnerAliveShare: dead.length ? dead.filter(function (k) { return k.partnerAliveAtDeath; }).length / dead.length : null,
    partnerAliveCount: dead.filter(function (k) { return k.partnerAliveAtDeath; }).length,
    unmatched: dead.filter(function (k) { return k.channel === 'unmatched'; }).map(function (k) { return k.seed + ':' + k.by; }),
    pairSnapshotSeeds: seeds.filter(function (s) { return s.hasLivingPairSnapshot; }).length,
    maxSimultaneous: Math.max.apply(null, seeds.map(function (s) { return s.maxSimultaneous; })),
    wall: wall,
    seeds: seeds, killers: killers,
  };
}

function main() {
  const dir = process.argv[2];
  const prefix = process.argv[3] || 'grind-s';
  if (!dir) { console.error('usage: killersurvive-b-analyze-20261106.js <corpusDir> [prefix]'); process.exit(2); }
  const out = analyzeDir(dir, prefix);
  console.log(JSON.stringify(out, null, 2));
  if (out.instrumentErrors > 0) { console.error('KILLERSURVIVE-B STOP: instrument errors=' + out.instrumentErrors); process.exit(1); }
  if (out.unmatched.length > 0) { console.error('KILLERSURVIVE-B STOP: unmatched dead killers: ' + out.unmatched.join(', ')); process.exit(1); }
}

if (require.main === module) main();
module.exports = { analyzeRow: analyzeRow, analyzeDir: analyzeDir, foughtAgain: foughtAgain, sameChain: sameChain, contextOf: contextOf, median: median };
