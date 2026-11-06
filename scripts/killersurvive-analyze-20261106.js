// killersurvive-analyze-20261106.js — first-killer death-channel trace +
// party-persistence-across-succession probe (arm sim-killersurvive-a).
// Pure function over the stageally-confirm corpus JSON (+ fresh verification
// legs). Reuses killerdeath-analyze-20261105 for the killer fates; adds the
// death-channel classification (matched fight row + scholar-death context)
// and the succession/party trace. No game reads, no RNG.
// Usage:
//   node scripts/killersurvive-analyze-20261106.js <corpusDir> [verifyDir]
// Prints a JSON summary (per-leg + per-killer + succession rows). Exits 1
// if any instrument error exists or any first killer is unclassified.
'use strict';
const fs = require('fs');
const path = require('path');
const KD = require('./killerdeath-analyze-20261105');

function filesFor(dir, policy) {
  const re = new RegExp('^stageally-s(\\d+)-stageally-confirm-' + policy + '\\.json$');
  return fs.readdirSync(dir).filter(function (f) { return re.test(f); }).sort()
    .map(function (f) { return path.join(dir, f); });
}

function median(nums) {
  if (!nums.length) return null;
  const s = nums.slice().sort(function (a, b) { return a - b; });
  return (s[Math.floor((s.length - 1) / 2)] + s[Math.ceil((s.length - 1) / 2)]) / 2;
}

// Classify one killer's death from the engine records (never SAY lines).
// Returns { channel, detail } where channel is one of:
//   alive-at-end | TB-fight:<mid> | field-fight:<mid> | contest |
//   at-home-not-combat | on-road-not-combat | fallen-monster:<name> |
//   fallen:<cause> | unmatched
function deathChannel(row, fate) {
  const daily = row.daily || [];
  const dd = fate.deathDay == null ? null : (fate.deathDay | 0);
  // For a killer alive at the horizon, the "party at end" is the last daily row.
  const dayRow = dd != null ?
    (daily.filter(function (s) { return (s.day | 0) === dd; })[0] || null) :
    (daily.length ? daily[daily.length - 1] : null);
  const prevRow = dd != null ?
    (daily.filter(function (s) { return (s.day | 0) < dd; }).slice(-1)[0] || null) :
    (daily.length > 1 ? daily[daily.length - 2] : null);
  if (fate.aliveAtEnd || dd == null) {
    return { channel: 'alive-at-end', detail: 'alive at horizon (censored)',
      deathDay: null,
      partyAtDeath: dayRow ? { size: dayRow.partySize, ids: dayRow.partyIds || [] } : { size: null, ids: [] },
      scholarCtx: null, tbRow: null, fieldRow: null, fallenRow: null };
  }
  const by = fate.by;
  const scholarCtx = (row.scholarDeaths || []).filter(function (s) {
    return s.scholarId === by && (s.day | 0) === dd;
  })[0] || null;
  const tb = (row.tbFights || []).filter(function (f) {
    return (f.day | 0) === dd && f.scholarDiedInFight;
  })[0] || null;
  const field = (row.fights || []).filter(function (f) {
    return (f.day | 0) === dd && f.channel === 'field' && f.fighter === by &&
      (f.outcome === 'vDie' || f.outcome === 'died' || f.outcome === 'scholar-died');
  })[0] || null;
  const fallen = (row.fallen || []).filter(function (f) {
    return f.villagerId === by && (f.day | 0) === dd;
  })[0] || null;
  const partyAtDeath = dayRow ? { size: dayRow.partySize, ids: dayRow.partyIds || [] } :
    (prevRow ? { size: prevRow.partySize, ids: prevRow.partyIds || [] } : { size: null, ids: [] });
  const base = { deathDay: dd, partyAtDeath: partyAtDeath,
    scholarCtx: scholarCtx, tbRow: tb, fieldRow: field, fallenRow: fallen };
  // 1. Turn-based fight, scholar died in it. The scholar-death record on the
  // same day proves the killer was the scholar who died in that fight (the
  // daily snapshot for the death day already shows the successor, so the
  // daily row's scholarId must NOT be used here).
  if (tb && scholarCtx) {
    return Object.assign(base, { channel: 'TB-fight:' + tb.mid,
      detail: 'TB fight day ' + dd + ' vs ' + tb.mid + ' (wave ' + tb.wave + '), ' +
        tb.rounds + ' rounds, allies ' + tb.alliesAtEntry + ', party ' + tb.partyAtEntry +
        ', monster HP left ' + Math.round((tb.monsterHpFracEnd || 0) * 100) + '%' });
  }
  // 2. Field fight in which this villager died.
  if (field) {
    return Object.assign(base, { channel: 'field-fight:' + field.mid,
      detail: 'field fight day ' + dd + ' vs ' + field.mid + ' (wave ' + field.wave + ')' });
  }
  // 3. Contest death (scholar-death record, not in combat).
  if (scholarCtx && scholarCtx.causeArg === 'contest') {
    return Object.assign(base, { channel: 'contest',
      detail: 'scholar died in a contest on day ' + dd + ', inCombat=' + scholarCtx.inCombat });
  }
  // 4/5. Scholar death, not in combat: at Haven vs on the road.
  if (scholarCtx && !scholarCtx.inCombat) {
    return Object.assign(base, { channel: scholarCtx.atHaven ? 'at-home-not-combat' : 'on-road-not-combat',
      detail: 'scholar death day ' + dd + ', causeArg=' + scholarCtx.causeArg +
        ', atHaven=' + scholarCtx.atHaven + ', map=(' + scholarCtx.mapX + ',' + scholarCtx.mapY + ')' });
  }
  // 6/7. Fallen record (villager death with cause / killing monster).
  if (fallen) {
    if (fallen.monsterId || fallen.monsterName) {
      return Object.assign(base, { channel: 'fallen-monster:' + (fallen.monsterName || fallen.monsterId),
        detail: 'fallen day ' + dd + ', cause=' + fallen.cause + ', monster=' + (fallen.monsterName || fallen.monsterId) });
    }
    return Object.assign(base, { channel: 'fallen:' + (fallen.cause || '?'),
      detail: 'fallen day ' + dd + ', cause=' + (fallen.cause || '?') });
  }
  // 8. Scholar-death record exists but no fight row matched (in combat, no TB row).
  if (scholarCtx) {
    return Object.assign(base, { channel: 'unmatched',
      detail: 'scholarDeaths day ' + dd + ' causeArg=' + scholarCtx.causeArg +
        ' inCombat=' + scholarCtx.inCombat + ' atHaven=' + scholarCtx.atHaven +
        ' but no TB/field fight row on that day' });
  }
  return Object.assign(base, { channel: 'unmatched',
    detail: 'no scholarDeaths, fallen, or fight row explains death day ' + dd });
}

// Walk the daily rows; on each scholarId change (succession) record what
// happened to the party. A party member promoted to scholar is NOT scatter:
// they leave the party by becoming the scholar.
function successionTrace(row) {
  const daily = row.daily || [];
  const out = [];
  let prev = null;
  daily.forEach(function (s) {
    if (prev && s.scholarId !== prev.scholarId) {
      const before = prev;
      const after = s;
      const promoted = (before.partyIds || []).indexOf(after.scholarId) >= 0;
      const carried = (after.partyIds || []).filter(function (id) {
        return (before.partyIds || []).indexOf(id) >= 0;
      });
      const scattered = (before.partyIds || []).filter(function (id) {
        return id !== after.scholarId && (after.partyIds || []).indexOf(id) < 0;
      });
      out.push({ seed: row.seed, day: s.day, from: before.scholarId, to: after.scholarId,
        partyBefore: before.partyIds || [], partyAfter: after.partyIds || [],
        promoted: promoted, carried: carried, scattered: scattered,
        veteransBefore: before.readiness5 ? before.readiness5.veterans : null,
        veteransAfter: after.readiness5 ? after.readiness5.veterans : null,
        w4killersBefore: before.w4killers, w4killersAfter: after.w4killers });
    }
    prev = s;
  });
  return out;
}

function analyzeLeg(dir, policy) {
  const files = filesFor(dir, policy);
  const rows = files.map(function (f) { return JSON.parse(fs.readFileSync(f, 'utf8')); });
  const legSeeds = rows.map(function (r) { return KD.classifySeed(r); });
  const killers = [];
  const successions = [];
  rows.forEach(function (row) {
    const fates = KD.killerFates(row);
    const w4 = (row.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 4; });
    const firstBloodDay = w4.length ? Math.min.apply(null, w4.map(function (e) { return e.d | 0; })) : null;
    const firstKiller = firstBloodDay != null ?
      (w4.filter(function (e) { return (e.d | 0) === firstBloodDay; })[0] || {}).by : null;
    fates.forEach(function (fate) {
      const ch = deathChannel(row, fate);
      const track = (row.killerTrack || []).filter(function (t) { return t.by === fate.by; });
      // Only the killer's LIVING days after the kill (rows continue past death
      // with deadInFallen set — those must not dilute health/location shares).
      const post = track.filter(function (t) {
        return (t.day | 0) >= (fate.firstDay | 0) &&
          (fate.deathDay == null || (t.day | 0) < (fate.deathDay | 0));
      });
      const healths = post.map(function (t) { return t.health; }).filter(function (h) { return h != null; });
      killers.push({ seed: row.seed, policy: policy, by: fate.by,
        isFirstKiller: fate.by === firstKiller, firstDay: fate.firstDay, lastDay: fate.lastDay,
        kills: fate.kills, via: fate.via, mids: fate.mids,
        deathDay: fate.deathDay, killToDeathDays: fate.killToDeathDays,
        aliveAtEnd: fate.aliveAtEnd, deathCauseSplit: fate.deathCauseSplit,
        channel: ch.channel, channelDetail: ch.detail,
        partyAtDeath: ch.partyAtDeath, scholarCtx: ch.scholarCtx,
        healthMin: healths.length ? Math.min.apply(null, healths) : null,
        healthLast: healths.length ? healths[healths.length - 1] : null,
        atHavenShare: post.length ? post.filter(function (t) { return t.atHaven; }).length / post.length : null,
        onExpedShare: post.length ? post.filter(function (t) { return t.onExped; }).length / post.length : null });
    });
    successionTrace(row).forEach(function (s) { successions.push(s); });
  });
  const deadKillers = killers.filter(function (k) { return !k.aliveAtEnd && k.killToDeathDays != null; });
  const firstKillers = killers.filter(function (k) { return k.isFirstKiller; });
  const firstDead = firstKillers.filter(function (k) { return !k.aliveAtEnd && k.killToDeathDays != null; });
  const channelCounts = {};
  killers.forEach(function (k) {
    const c = k.channel.split(':')[0];
    channelCounts[c] = (channelCounts[c] | 0) + 1;
  });
  const firstChannelCounts = {};
  firstKillers.forEach(function (k) {
    const c = k.channel.split(':')[0];
    firstChannelCounts[c] = (firstChannelCounts[c] | 0) + 1;
  });
  const unmatchedFirst = firstKillers.filter(function (k) { return k.channel === 'unmatched'; });
  const succAgg = {
    total: successions.length,
    promoted: successions.filter(function (s) { return s.promoted; }).length,
    partyPersisted: successions.filter(function (s) { return s.carried.length > 0; }).length,
    partyEmptied: successions.filter(function (s) { return s.partyBefore.length > 0 && s.partyAfter.length === 0; }).length,
    scatteredMembers: successions.reduce(function (m, s) { return m + s.scattered.length; }, 0),
    veteransLost: successions.filter(function (s) { return (s.veteransBefore | 0) > (s.veteransAfter | 0); }).length
  };
  return { policy: policy, n: rows.length,
    instrumentErrors: rows.reduce(function (m, r) { return m + (r.instrumentErrors || []).length; }, 0),
    w4kills: rows.reduce(function (m, r) { return m + (r.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 4; }).length; }, 0),
    killersEver: killers.length,
    deadKillers: deadKillers.length,
    killToDeathMedianAll: median(deadKillers.map(function (k) { return k.killToDeathDays; })),
    firstKillers: firstKillers.length,
    firstKillToDeathMedian: median(firstDead.map(function (k) { return k.killToDeathDays; })),
    channelCounts: channelCounts, firstChannelCounts: firstChannelCounts,
    unmatchedFirst: unmatchedFirst.map(function (k) { return k.seed + ':' + k.by; }),
    pairSnapshotSeeds: legSeeds.filter(function (s) { return s.hasLivingPairSnapshot; }).length,
    maxSimultaneous: Math.max.apply(null, legSeeds.map(function (s) { return s.maxSimultaneous; })),
    succAgg: succAgg,
    killers: killers, successions: successions };
}

function main() {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: killersurvive-analyze-20261106.js <corpusDir>'); process.exit(2); }
  const staged = analyzeLeg(dir, 'staged');
  const baseline = analyzeLeg(dir, 'baseline');
  const out = { corpusDir: dir, staged: staged, baseline: baseline };
  console.log(JSON.stringify(out, null, 2));
  const bad = staged.instrumentErrors + baseline.instrumentErrors;
  if (bad > 0) { console.error('KILLERSURVIVE STOP: instrument errors=' + bad); process.exit(1); }
  if (staged.unmatchedFirst.length + baseline.unmatchedFirst.length > 0) {
    console.error('KILLERSURVIVE STOP: unmatched first killers: ' +
      staged.unmatchedFirst.concat(baseline.unmatchedFirst).join(', '));
    process.exit(1);
  }
}

if (require.main === module) main();
module.exports = { analyzeLeg: analyzeLeg, deathChannel: deathChannel, successionTrace: successionTrace, median: median };
