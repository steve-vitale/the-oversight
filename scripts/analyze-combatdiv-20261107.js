// analyze-combatdiv-20261107.js — combat-divergence analyzer
// (arm sim-combatdiv-b). Reads two combatdiv corpora (C1, P2), aligns the
// per-seed fight streams by global call order (gseq), and names the FIRST
// fight that moved per seed with its D/R/U classification (see the
// prereg: D = damage-taken / combat math, R = pure RNG re-roll with zero
// prior damage/HP difference, U = unclassified). Also prints the
// reproduction table (days / standing / seat / w4 kills) and the wall
// numbers. Pure function over JSON corpora; no game code.
// Usage: node scripts/analyze-combatdiv-20261107.js <c1dir> <p2dir>
'use strict';
const fs = require('fs');
const path = require('path');

function loadDir(dir) {
  const out = {};
  fs.readdirSync(dir).forEach(function (f) {
    if (!/\.json$/.test(f)) return;
    try {
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      if (j && j.seed != null) out[j.seed] = j;
    } catch (e) { /* skip unreadable */ }
  });
  return out;
}

// unify(json): one fight stream in call order (field + TB by gseq).
// Each row carries the compared outcome/state fields plus the context
// fields (hpBefore / varmor / wb) the classifier uses for tracing.
function unify(j) {
  const rows = [];
  (j.fieldFights || []).forEach(function (r) {
    rows.push({
      gseq: r.gseq, channel: 'field', day: r.day,
      fighter: r.fighter || null, fighterName: r.fighterName || null,
      mid: r.mid || null, wave: (r.wave != null) ? r.wave : null,
      outcome: r.outcome || null, rounds: (r.rounds | 0) || 0,
      vTaken: (r.vTaken | 0) || 0, vHpLeft: (r.vHpLeft != null) ? r.vHpLeft : null,
      mHpLeft: (r.mHpLeft != null) ? r.mHpLeft : null,
      allyDealt: (r.allyDealt | 0) || 0, allyVid: r.allyVid || null,
      fleeHopeless: !!r.fleeHopeless,
      scholarHpFracEnd: null, monsterHpFracEnd: null, scholarDiedInFight: false,
      hpBefore: (r.hpBefore != null) ? r.hpBefore : null,
      hpAfter: (r.hpAfter != null) ? r.hpAfter : null,
      varmor: (r.varmor != null) ? r.varmor : null, wb: (r.wb != null) ? r.wb : null,
      tailLog: r.tailLog || null,
    });
  });
  (j.tbRows || []).forEach(function (r) {
    let scholarBefore = null, scholarAfter = null;
    const allyBefore = {}, allyAfter = {};
    try {
      (r.fightersBefore || []).forEach(function (f) {
        if (!f) return;
        if (f.key === 'p') scholarBefore = (f.hp != null) ? f.hp : null;
        else if (f.villagerId) allyBefore[f.villagerId] = (f.hp != null) ? f.hp : null;
      });
      (r.fightersAfter || []).forEach(function (f) {
        if (!f) return;
        if (f.key === 'p') scholarAfter = (f.hp != null) ? f.hp : null;
        else if (f.villagerId) allyAfter[f.villagerId] = (f.hp != null) ? f.hp : null;
      });
    } catch (e) {}
    rows.push({
      gseq: r.gseq, channel: 'tb', day: r.day,
      fighter: r.scholarId || null, fighterName: 'scholar',
      mid: r.mid || null, wave: (r.wave != null) ? r.wave : null,
      outcome: r.outcome || null, rounds: (r.rounds != null) ? (r.rounds | 0) : 0,
      vTaken: null, vHpLeft: scholarAfter, mHpLeft: null,
      allyDealt: null, allyVid: null, fleeHopeless: false,
      scholarHpFracEnd: (r.scholarHpFracEnd != null) ? r.scholarHpFracEnd : null,
      monsterHpFracEnd: (r.monsterHpFracEnd != null) ? r.monsterHpFracEnd : null,
      scholarDiedInFight: !!r.scholarDiedInFight,
      hpBefore: scholarBefore, hpAfter: scholarAfter,
      varmor: (r.scholarProt != null) ? r.scholarProt : null, wb: null,
      allyBefore: allyBefore, allyAfter: allyAfter,
      tailLog: null,
    });
  });
  rows.sort(function (a, b) { return (a.gseq | 0) - (b.gseq | 0); });
  return rows;
}

// compareKey(row): the outcome/state identity of a fight. hpBefore /
// varmor / wb are NOT in the key — they are context for tracing, and
// varmor differs by construction wherever retuned armor is worn.
function compareKey(r) {
  return JSON.stringify([
    r.day, r.channel, r.fighter, r.mid, r.outcome, r.rounds,
    r.vTaken, r.vHpLeft, r.mHpLeft, r.allyDealt,
    r.scholarHpFracEnd, r.monsterHpFracEnd, r.scholarDiedInFight,
  ]);
}
function damageKey(r) {
  // The damage-only projection: differs iff damage taken / HP left moved.
  return JSON.stringify([r.vTaken, r.vHpLeft, r.mHpLeft, r.allyDealt, r.scholarHpFracEnd, r.monsterHpFracEnd]);
}
function hpMapsEqual(a, b) {
  const ka = Object.keys(a || {}).sort(), kb = Object.keys(b || {}).sort();
  if (ka.length !== kb.length) return false;
  for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i] || (a[ka[i]] | 0) !== (b[kb[i]] | 0)) return false;
  return true;
}
// firstHpDivDay(c1, p2): first daily-snapshot day whose hpById map differs,
// or null. Returns {day, ids} naming the villagers whose HP moved.
function firstHpDivDay(c1, p2) {
  const d1 = c1.daily || [], d2 = p2.daily || [];
  const n = Math.min(d1.length, d2.length);
  for (let i = 0; i < n; i++) {
    const a = d1[i].hpById || {}, b = d2[i].hpById || {};
    if (!hpMapsEqual(a, b)) {
      const ids = [];
      const keys = {};
      Object.keys(a).forEach(function (k) { keys[k] = true; });
      Object.keys(b).forEach(function (k) { keys[k] = true; });
      Object.keys(keys).sort().forEach(function (k) {
        if ((a[k] | 0) !== (b[k] | 0)) ids.push(k + ':' + (a[k] == null ? '—' : a[k]) + '→' + (b[k] == null ? '—' : b[k]));
      });
      return { day: d1[i].day, ids: ids };
    }
  }
  if (d1.length !== d2.length) {
    const longer = d1.length > d2.length ? d1 : d2;
    return { day: longer[n] ? longer[n].day : null, ids: ['snapshot-count differs ' + d1.length + ' vs ' + d2.length] };
  }
  return null;
}

function firstIndexWhere(list, pred) {
  for (let i = 0; i < list.length; i++) if (pred(list[i], i)) return i;
  return -1;
}

// classify(c1json, p2json): the per-seed verdict. Returns
// { cls: 'D'|'R'|'U', firstDivDay, firstDivGseq, rootGseq, rootDay,
//   rootFighter, rootMonster, rootWhat, detail, firstVarmorGseq,
//   firstDamageGseq, firstOutcomeGseq }.
function classify(c1, p2) {
  const A = unify(c1), B = unify(p2);
  const n = Math.min(A.length, B.length);
  const firstVarmor = firstIndexWhere(A, function (a, i) {
    return i < B.length && a.varmor != null && B[i].varmor != null && a.varmor !== B[i].varmor;
  });
  const firstDamage = firstIndexWhere(A, function (a, i) {
    return i < B.length && damageKey(a) !== damageKey(B[i]);
  });
  const firstOutcome = firstIndexWhere(A, function (a, i) {
    return i < B.length && (a.outcome || null) !== (B[i].outcome || null);
  });
  const base = {
    firstVarmorGseq: firstVarmor === -1 ? null : A[firstVarmor].gseq,
    firstDamageGseq: firstDamage === -1 ? null : A[firstDamage].gseq,
    firstOutcomeGseq: firstOutcome === -1 ? null : A[firstOutcome].gseq,
    fightsC1: A.length, fightsP2: B.length,
  };
  let i = -1;
  for (let k = 0; k < n; k++) if (compareKey(A[k]) !== compareKey(B[k])) { i = k; break; }
  if (i === -1 && A.length !== B.length) i = n; // one stream has a fight the other lacks
  if (i === -1) {
    // Streams identical: the HP maps decide.
    const hp = firstHpDivDay(c1, p2);
    if (hp) return Object.assign(base, { cls: 'U', firstDivDay: hp.day, firstDivGseq: null,
      rootGseq: null, rootDay: hp.day, rootFighter: null, rootMonster: null,
      rootWhat: 'hp-diverges-with-identical-fight-streams', detail: 'HP first differs d' + hp.day + ': ' + hp.ids.join(', ') });
    return Object.assign(base, { cls: 'U', firstDivDay: null, firstDivGseq: null,
      rootGseq: null, rootDay: null, rootFighter: null, rootMonster: null,
      rootWhat: 'no-divergence-in-window', detail: 'Fight streams identical (' + A.length + ' fights) and HP maps identical through 150d.' });
  }
  const a = A[i], b = B[i];
  const sameIdentity = !!(a && b && a.day === b.day && a.channel === b.channel &&
    a.fighter === b.fighter && a.mid === b.mid);
  const hpDiv = firstHpDivDay(c1, p2);
  const fightDay = (a && a.day != null) ? a.day : (b && b.day != null ? b.day : null);
  if (sameIdentity) {
    // Same fight, different numbers. compareKey is a superset of
    // damageKey, so the first differing fight IS the first damage delta
    // whenever damage moved — the downstream story (damage root earlier
    // than outcome move) is told by firstDamageGseq vs firstOutcomeGseq,
    // not by a separate branch. Reachable sub-cases at the first
    // difference:
    const dmgDiffersHere = damageKey(a) !== damageKey(b);
    if (dmgDiffersHere) {
      return Object.assign(base, { cls: 'D', firstDivDay: fightDay, firstDivGseq: a.gseq,
        rootGseq: a.gseq, rootDay: a.day, rootFighter: a.fighterName || a.fighter, rootMonster: a.mid,
        rootWhat: 'same-fight-damage', detail: 'd' + a.day + ' ' + (a.fighterName || a.fighter) + ' vs ' + a.mid +
          ': vTaken ' + a.vTaken + '→' + b.vTaken + ', vHpLeft ' + a.vHpLeft + '→' + b.vHpLeft +
          ', outcome ' + a.outcome + '→' + b.outcome + ', rounds ' + a.rounds + '→' + b.rounds +
          (firstOutcome !== -1 && firstOutcome > i ? '; outcome first moves later at gseq ' + A[firstOutcome].gseq + '.' : '') });
    }
    const hpSame = (a.hpBefore == null && b.hpBefore == null) || (a.hpBefore === b.hpBefore);
    if (!hpSame) {
      // HP already differed entering this fight, with no fight damage
      // delta anywhere before it: the HP diverged outside the fight
      // stream (raid / ambush / disease channel) — U, with the HP day.
      return Object.assign(base, { cls: 'U', firstDivDay: fightDay, firstDivGseq: a.gseq,
        rootGseq: null, rootDay: fightDay, rootFighter: a.fighterName || a.fighter, rootMonster: a.mid,
        rootWhat: 'hp-differs-with-no-earlier-damage-delta',
        detail: 'd' + a.day + ' ' + (a.fighterName || a.fighter) + ' vs ' + a.mid + ': hpBefore ' + a.hpBefore + '→' + b.hpBefore +
          ' with identical damage numbers in this fight and no earlier damage delta in the fight stream' +
          (hpDiv ? ('; daily HP first differs d' + hpDiv.day + ': ' + hpDiv.ids.join(', ')) : '') + '.' });
    }
    // Identical damage, identical entry HP, different outcome/rounds:
    // the RNG stream drifted through an untraced draw (narration
    // pickFresh calls consume draws and leave no state trace). U — the
    // instrument cannot name the draw.
    return Object.assign(base, { cls: 'U', firstDivDay: fightDay, firstDivGseq: a.gseq,
      rootGseq: null, rootDay: fightDay, rootFighter: a.fighterName || a.fighter, rootMonster: a.mid,
      rootWhat: 'outcome-differs-with-identical-damage-and-hp',
      detail: 'd' + a.day + ' ' + (a.fighterName || a.fighter) + ' vs ' + a.mid + ': outcome ' + a.outcome + '→' + b.outcome +
        ', rounds ' + a.rounds + '→' + b.rounds + ', but vTaken/vHpLeft/hpBefore identical — RNG drift through an untraced draw.' });
  }
  // Different encounter (monster / day / fighter / present-in-one-only).
  // R only if every prior fight is identical AND daily HP is identical up
  // to the fight's day; otherwise the divergence started earlier, outside
  // the fight stream — U with the HP evidence.
  const hpBeforeFight = hpDiv && fightDay != null && hpDiv.day < fightDay;
  if (!hpBeforeFight) {
    return Object.assign(base, { cls: 'R', firstDivDay: fightDay, firstDivGseq: a ? a.gseq : null,
      rootGseq: a ? a.gseq : null, rootDay: fightDay,
      rootFighter: (a && (a.fighterName || a.fighter)) || (b && (b.fighterName || b.fighter)),
      rootMonster: (a && a.mid) || (b && b.mid),
      rootWhat: 'different-encounter-no-prior-damage',
      detail: 'First difference at gseq ' + (a ? a.gseq : '—') + ': C1 ' +
        (a ? ('d' + a.day + ' ' + (a.fighterName || a.fighter) + ' vs ' + a.mid + ' (' + a.outcome + ')') : '(no fight)') +
        ' vs P2 ' +
        (b ? ('d' + b.day + ' ' + (b.fighterName || b.fighter) + ' vs ' + b.mid + ' (' + b.outcome + ')') : '(no fight)') +
        '; all ' + i + ' prior fights identical and daily HP identical up to d' + fightDay + '.' });
  }
  return Object.assign(base, { cls: 'U', firstDivDay: fightDay, firstDivGseq: a ? a.gseq : null,
    rootGseq: null, rootDay: hpDiv.day, rootFighter: null, rootMonster: null,
    rootWhat: 'hp-diverges-before-first-fight-difference',
    detail: 'Daily HP first differs d' + hpDiv.day + ': ' + hpDiv.ids.join(', ') +
      '; first fight difference only at gseq ' + (a ? a.gseq : '—') + ' (d' + fightDay + ').' });
}

function seedSummary(j) {
  const ts = j.takeseatStats || {};
  return {
    seed: j.seed, days: j.days, end: j.endReason || null, won: !!j.won,
    standing: j.standing, maxWave: j.maxWave, scaleRank: j.scaleRank || null,
    sat: (ts.seatDay != null) ? ts.seatDay : null, seat: (ts.seatKind != null) ? ts.seatKind : null,
    seatTaken: (ts.seatTaken | 0) || 0,
    w4kills: (j.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length,
    w5kills: (j.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 5); }).length,
    errors: (j.instrumentErrors || []).length,
    fieldFights: (j.fieldFights || []).length, tbRows: (j.tbRows || []).length,
    itemsSha: j.itemsSha || null,
  };
}
function seedSummaries(dir) {
  const loaded = loadDir(dir);
  const out = {};
  Object.keys(loaded).forEach(function (s) { out[s] = seedSummary(loaded[s]); });
  return out;
}
function median(arr) {
  const a = arr.slice().sort(function (x, y) { return x - y; });
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return (a.length % 2) ? a[m] : ((a[m - 1] + a[m]) / 2);
}
function wallNumbers(summaries) {
  const ss = Object.keys(summaries).map(function (k) { return summaries[k]; });
  return {
    seeds: ss.length,
    national: ss.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    tableSat: ss.filter(function (s) { return s.seatTaken > 0; }).length,
    wins: ss.filter(function (s) { return s.won; }).length,
    wave4unlocks: ss.filter(function (s) { return (s.maxWave | 0) >= 4; }).length,
    wave5unlocks: ss.filter(function (s) { return (s.maxWave | 0) >= 5; }).length,
    medianDays: median(ss.map(function (s) { return s.days; })),
  };
}
function divTable(c1dir, p2dir) {
  const c1 = loadDir(c1dir), p2 = loadDir(p2dir);
  const lines = [];
  lines.push('| Seed | Class | First-div day | Root fight (day, fighter vs monster) | What moved |');
  lines.push('|---|---|---|---|---|');
  Object.keys(c1).sort(function (a, b) { return a - b; }).forEach(function (s) {
    if (!p2[s]) { lines.push('| ' + s + ' | — | — | missing P2 corpus | — |'); return; }
    const r = classify(c1[s], p2[s]);
    lines.push('| ' + s + ' | ' + r.cls + ' | ' + (r.firstDivDay != null ? 'd' + r.firstDivDay : '—') +
      ' | d' + (r.rootDay != null ? r.rootDay : '—') + ' ' + (r.rootFighter || '—') + ' vs ' + (r.rootMonster || '—') +
      ' (' + r.rootWhat + ') | ' + r.detail + ' |');
  });
  return lines.join('\n');
}

if (require.main === module) {
  const c1dir = process.argv[2], p2dir = process.argv[3];
  if (!c1dir || !p2dir) { console.error('usage: node scripts/analyze-combatdiv-20261107.js <c1dir> <p2dir>'); process.exit(2); }
  const c1 = loadDir(c1dir), p2 = loadDir(p2dir);
  const s1 = seedSummaries(c1dir), s2 = seedSummaries(p2dir);
  console.log('== reproduction ==');
  console.log('| Seed | C1 days | P2 days | C1 sat | P2 sat | C1 stand | P2 stand | C1 w4 | P2 w4 | C1 items | P2 items |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|');
  Object.keys(s1).sort(function (a, b) { return a - b; }).forEach(function (s) {
    const a = s1[s], b = s2[s] || {};
    console.log('| ' + s + ' | ' + a.days + ' | ' + (b.days != null ? b.days : '—') + ' | ' +
      (a.sat != null ? a.seat + ' d' + a.sat : '—') + ' | ' + (b.sat != null ? b.seat + ' d' + b.sat : '—') + ' | ' +
      a.standing + ' | ' + (b.standing != null ? b.standing : '—') + ' | ' + a.w4kills + ' | ' + (b.w4kills != null ? b.w4kills : '—') +
      ' | ' + (a.itemsSha || '—') + ' | ' + (b.itemsSha || '—') + ' |');
  });
  const w1 = wallNumbers(s1), w2 = wallNumbers(s2);
  console.log('C1 wall: national ' + w1.national + '/' + w1.seeds + ', table-sat ' + w1.tableSat + '/' + w1.seeds +
    ', wins ' + w1.wins + '/' + w1.seeds + ', wave-4 ' + w1.wave4unlocks + '/' + w1.seeds + ', wave-5 ' + w1.wave5unlocks +
    '/' + w1.seeds + ', median ' + w1.medianDays + 'd');
  console.log('P2 wall: national ' + w2.national + '/' + w2.seeds + ', table-sat ' + w2.tableSat + '/' + w2.seeds +
    ', wins ' + w2.wins + '/' + w2.seeds + ', wave-4 ' + w2.wave4unlocks + '/' + w2.seeds + ', wave-5 ' + w2.wave5unlocks +
    '/' + w2.seeds + ', median ' + w2.medianDays + 'd');
  console.log('== first divergence ==');
  console.log(divTable(c1dir, p2dir));
  const classes = {};
  Object.keys(c1).sort(function (a, b) { return a - b; }).forEach(function (s) {
    if (!p2[s]) return;
    const r = classify(c1[s], p2[s]);
    classes[r.cls] = (classes[r.cls] | 0) + 1;
  });
  console.log('classes: ' + JSON.stringify(classes));
}

module.exports = { loadDir: loadDir, unify: unify, compareKey: compareKey, damageKey: damageKey,
  firstHpDivDay: firstHpDivDay, classify: classify, seedSummary: seedSummary,
  seedSummaries: seedSummaries, median: median, wallNumbers: wallNumbers, divTable: divTable };
