// analyze-xphalf-20261107.js — XP-half early-death probe analyzer
// (arm sim-xphalf-b, run fleshout-loop-b-20261108T0013Z). DIAG, zero src/js.
// Reads doorwalk-b baseline-leg per-seed JSONs (one corpus dir) and prints,
// per seed: days/end/seat/sat/standing/maxWave/w4 kills, the death census
// (fallen + deathSays + teleDeaths, bucketed by cause keywords — unmapped
// causes are listed, never silently bucketed), the living trajectory
// (first-death day, deaths by d30/d60, living at d30/d60), and the
// mechanism classification per the sim-xphalf-b prereg rule:
//   violent-thinning: first 3 deaths violent AND first death < d28 AND
//     living < 8 by d30.
//   attrition-after-thinning: early violent deaths thin the roster, but
//     the death day is set by >= 3 starvation/thirst/sickness deaths in
//     the final 15 days.
//   starvation-first / sickness-first / other: first death non-violent,
//     named as found.
//   unclassified: corpus does not name the mechanism.
// With two dirs (C1, P1) it also prints the first-divergence day per seed
// (first day daily living or standing differs) and the contrast table.
// Usage:
//   node scripts/analyze-xphalf-20261107.js <p1dir> [c1dir]
// Exit 0 on a complete read; exit 2 on missing/unreadable input.
'use strict';
const fs = require('fs');
const path = require('path');

function loadCorpus(dir) {
  if (!dir || !fs.existsSync(dir)) return null;
  const out = {};
  fs.readdirSync(dir).filter(function (f) { return f.indexOf('doorwalk-b-s') === 0 && f.endsWith('.json'); }).forEach(function (f) {
    const m = f.match(/doorwalk-b-s(\d+)-/);
    if (!m) return;
    out[parseInt(m[1], 10)] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  });
  return Object.keys(out).length ? out : null;
}

// Cause bucketing — keyword rules only; anything unmapped is returned
// verbatim in `unmapped` so the caller sees it.
function bucketCause(raw) {
  const c = String(raw == null ? '' : raw).toLowerCase();
  if (!c) return { bucket: 'unknown', raw: raw };
  if (/starv|hunger|famine/.test(c)) return { bucket: 'starvation', raw: raw };
  if (/thirst|dehydrat|water/.test(c)) return { bucket: 'thirst', raw: raw };
  if (/sick|disease|fever|plague|infected|illness|pneumonia|flu|dysentery|cholera/.test(c)) return { bucket: 'sickness', raw: raw };
  if (/wound|bled|bleed|injury/.test(c)) return { bucket: 'wounds', raw: raw };
  if (/monster|killed by|slain|ambush|attack|mauled|devoured|eaten|claw|bite|bitten|gored|trampled|crushed|beast|deer|boar|wolf|bear|wire|gavel|chorus|callback|drum/.test(c)) return { bucket: 'violent-monster', raw: raw };
  if (/contest|trial|arena|show|stage/.test(c)) return { bucket: 'violent-contest', raw: raw };
  if (/betray|murder|stabbed|strangled|hanged|executed|exile/.test(c)) return { bucket: 'violent-betrayal', raw: raw };
  if (/wild/.test(c)) return { bucket: 'the-wild', raw: raw };
  if (/old age|age/.test(c)) return { bucket: 'old-age', raw: raw };
  if (/accident|fell|drown/.test(c)) return { bucket: 'accident', raw: raw };
  return { bucket: 'unmapped', raw: raw };
}

function fallenEntries(j) {
  const list = (j && j.fallen) || [];
  return list.map(function (f) {
    if (!f || typeof f !== 'object') return { raw: f };
    const day = (f.day != null ? f.day : (f.diedOn != null ? f.diedOn : (f.deathDay != null ? f.deathDay : null)));
    const name = f.name || f.villagerName || f.who || (f.villagerId != null ? String(f.villagerId) : null);
    const cause = f.cause || f.deathCause || f.how || f.reason || null;
    return { name: name, day: day, cause: cause, raw: f };
  });
}

function deathCensus(j) {
  const entries = fallenEntries(j);
  const byBucket = {};
  const unmapped = [];
  entries.forEach(function (e) {
    const b = bucketCause(e.cause);
    byBucket[b.bucket] = (byBucket[b.bucket] | 0) + 1;
    if (b.bucket === 'unmapped' || b.bucket === 'unknown') unmapped.push(e);
  });
  // teleDeaths (harness samples) as a cross-check, when present.
  const tele = (j && j.teleDeaths) || null;
  return { entries: entries, byBucket: byBucket, unmapped: unmapped, teleDeaths: tele };
}

function livingTrajectory(j) {
  const daily = (j && j.daily) || [];
  const rows = daily.map(function (d) { return { day: d.day, living: d.living, standing: (d.raw != null ? d.raw : (d.rawStanding != null ? d.rawStanding : null)) }; });
  let firstDeathDay = null, livingAt30 = null, livingAt60 = null, deathsBy30 = 0, deathsBy60 = 0;
  const startLiving = rows.length ? rows[0].living : null;
  rows.forEach(function (r) {
    if (r.living == null) return;
    if (firstDeathDay == null && startLiving != null && r.living < startLiving) firstDeathDay = r.day;
    if (r.day <= 30) { livingAt30 = r.living; }
    if (r.day <= 60) { livingAt60 = r.living; }
  });
  if (startLiving != null) {
    rows.forEach(function (r) {
      if (r.living == null) return;
      const dead = startLiving - r.living;
      if (r.day <= 30) deathsBy30 = Math.max(deathsBy30, dead);
      if (r.day <= 60) deathsBy60 = Math.max(deathsBy60, dead);
    });
  }
  // Living at d30/d60 = last row at or before that day.
  function livingAt(day) {
    let v = null;
    rows.forEach(function (r) { if (r.day <= day && r.living != null) v = r.living; });
    return v;
  }
  return {
    startLiving: startLiving, firstDeathDay: firstDeathDay,
    livingAt30: livingAt(30), livingAt60: livingAt(60),
    deathsBy30: deathsBy30, deathsBy60: deathsBy60, rows: rows,
  };
}

function isViolent(bucket) {
  return bucket === 'violent-monster' || bucket === 'violent-contest' || bucket === 'violent-betrayal';
}
function isAttrition(bucket) {
  return bucket === 'starvation' || bucket === 'thirst' || bucket === 'sickness';
}

// Prereg classification rule. Returns { mechanism, why }.
function classifyMechanism(j) {
  const census = deathCensus(j);
  const traj = livingTrajectory(j);
  const entries = census.entries.slice().sort(function (a, b) { return (a.day || 0) - (b.day || 0); });
  const dated = entries.filter(function (e) { return e.day != null; });
  if (!dated.length && !entries.length) return { mechanism: 'unclassified', why: 'no fallen entries in corpus', census: census, traj: traj };
  const first3 = dated.slice(0, 3);
  const first3Violent = first3.length === 3 && first3.every(function (e) { return isViolent(bucketCause(e.cause).bucket); });
  const firstDeathDay = dated.length ? dated[0].day : traj.firstDeathDay;
  const deathDay = j.days;
  const lateAttrition = dated.filter(function (e) {
    return isAttrition(bucketCause(e.cause).bucket) && deathDay != null && e.day >= deathDay - 15;
  }).length;
  const anyViolentEarly = dated.some(function (e) { return isViolent(bucketCause(e.cause).bucket) && e.day != null && e.day < 30; });
  if (first3Violent && firstDeathDay != null && firstDeathDay < 28 && traj.livingAt30 != null && traj.livingAt30 < 8) {
    return { mechanism: 'violent-thinning', why: 'first 3 deaths violent, first death d' + firstDeathDay + ', living ' + traj.livingAt30 + ' at d30', census: census, traj: traj };
  }
  if (anyViolentEarly && lateAttrition >= 3) {
    return { mechanism: 'attrition-after-thinning', why: lateAttrition + ' starvation/thirst/sickness deaths in final 15d after early violent deaths', census: census, traj: traj };
  }
  if (dated.length && !isViolent(bucketCause(dated[0].cause).bucket)) {
    const b = bucketCause(dated[0].cause).bucket;
    if (b === 'starvation') return { mechanism: 'starvation-first', why: 'first death d' + dated[0].day + ' starvation (' + (dated[0].name || '?') + ')', census: census, traj: traj };
    if (b === 'sickness') return { mechanism: 'sickness-first', why: 'first death d' + dated[0].day + ' sickness (' + (dated[0].name || '?') + ')', census: census, traj: traj };
    return { mechanism: 'other', why: 'first death d' + dated[0].day + ' bucket ' + b + ' (' + (dated[0].name || '?') + ')', census: census, traj: traj };
  }
  if (census.unmapped.length && !dated.length) {
    return { mechanism: 'unclassified', why: 'fallen entries present but undated/unmapped causes', census: census, traj: traj };
  }
  return { mechanism: 'unclassified', why: 'no prereg rule matched (first3Violent=' + first3Violent + ', lateAttrition=' + lateAttrition + ')', census: census, traj: traj };
}

function seedSummary(j) {
  const ts = j.takeseatStats || {};
  const taken = (ts.seatTaken | 0) > 0;
  const w4 = ((j.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); })).length;
  const w5 = ((j.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 5); })).length;
  const cls = classifyMechanism(j);
  return {
    seed: j.seed, days: j.days, endReason: j.endReason, won: !!j.won,
    sat: taken ? ts.seatDay : null, seat: taken ? (ts.seatKind || null) : null,
    standing: (j.standing == null ? null : j.standing), maxWave: j.maxWave,
    w4kills: w4, w5kills: w5, scholarDeaths: j.scholarDeaths || 0,
    errors: (j.instrumentErrors || []).length, anchor: j.anchorCommit || null,
    mechanism: cls.mechanism, mechanismWhy: cls.why,
    census: cls.census, traj: cls.traj,
  };
}

function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const n = s.length;
  if (!n) return null;
  return (n % 2) ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

// First day on which daily living or standing differs between two runs.
function firstDivergence(a, b) {
  const ra = (a.daily || []).map(function (d) { return { day: d.day, living: d.living, standing: (d.raw != null ? d.raw : d.rawStanding) }; });
  const rb = {};
  (b.daily || []).forEach(function (d) { rb[d.day] = { living: d.living, standing: (d.raw != null ? d.raw : d.rawStanding) }; });
  for (let i = 0; i < ra.length; i++) {
    const other = rb[ra[i].day];
    if (!other) continue;
    if (ra[i].living !== other.living || ra[i].standing !== other.standing) return ra[i].day;
  }
  return null;
}

function main() {
  const p1dir = process.argv[2], c1dir = process.argv[3];
  if (!p1dir) { console.error('USAGE: node analyze-xphalf-20261107.js <p1dir> [c1dir]'); process.exit(2); }
  const p1 = loadCorpus(p1dir);
  if (!p1) { console.error('XPHALF-ANALYZE STOP: empty or missing P1 dir.'); process.exit(2); }
  const c1 = c1dir ? loadCorpus(c1dir) : null;
  if (c1dir && !c1) { console.error('XPHALF-ANALYZE STOP: empty or missing C1 dir.'); process.exit(2); }
  const seeds = Object.keys(p1).map(Number).sort(function (a, b) { return a - b; });
  const days = seeds.map(function (s) { return p1[s].days; });
  const sits = seeds.filter(function (s) { const ts = p1[s].takeseatStats || {}; return (ts.seatTaken | 0) > 0; }).length;
  console.log('P1: n=' + seeds.length + ' median=' + median(days) + 'd sits=' + sits + '/8');
  console.log('| Seed | Days | End | Seat/sat | Stand | MaxW | w4 | w5 | 1st death | Dead≤d30 | Dead≤d60 | Living d30/d60 | Mechanism |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  seeds.forEach(function (s) {
    const sum = seedSummary(p1[s]);
    console.log('| ' + s + ' | ' + sum.days + ' | ' + sum.endReason + ' | ' + (sum.seat ? sum.seat + ' d' + sum.sat : '—') + ' | ' +
      (sum.standing == null ? '—' : sum.standing) + ' | ' + sum.maxWave + ' | ' + sum.w4kills + ' | ' + sum.w5kills + ' | ' +
      (sum.traj.firstDeathDay == null ? '—' : 'd' + sum.traj.firstDeathDay) + ' | ' + sum.traj.deathsBy30 + ' | ' + sum.traj.deathsBy60 + ' | ' +
      sum.traj.livingAt30 + '/' + sum.traj.livingAt60 + ' | ' + sum.mechanism + ' |');
  });
  seeds.forEach(function (s) {
    const sum = seedSummary(p1[s]);
    console.log('\n--- seed ' + s + ' (' + sum.days + 'd, ' + sum.mechanism + ': ' + sum.mechanismWhy + ') ---');
    console.log('cause mix: ' + JSON.stringify(sum.census.byBucket));
    sum.census.entries.forEach(function (e) {
      console.log('  d' + (e.day == null ? '?' : e.day) + ' ' + (e.name || '?') + ' — ' + (e.cause == null ? '(no cause field)' : String(e.cause)) + ' [' + bucketCause(e.cause).bucket + ']');
    });
    if (sum.census.unmapped.length) console.log('UNMAPPED causes: ' + sum.census.unmapped.map(function (e) { return JSON.stringify(e.cause); }).join(', '));
    (p1[s].deathSays || []).slice(0, 12).forEach(function (d) { console.log('  say d' + d.day + ': ' + d.line.slice(0, 200)); });
  });
  if (c1) {
    console.log('\n--- C1 vs P1 first divergence (daily living/standing) ---');
    seeds.forEach(function (s) {
      if (!c1[s]) { console.log('seed ' + s + ': no C1 corpus'); return; }
      console.log('seed ' + s + ': C1 ' + c1[s].days + 'd vs P1 ' + p1[s].days + 'd, first divergence d' + firstDivergence(c1[s], p1[s]));
    });
    const c1days = Object.keys(c1).map(Number).sort(function (a, b) { return a - b; }).map(function (s) { return c1[s].days; });
    const c1sits = Object.keys(c1).filter(function (s) { const ts = c1[s].takeseatStats || {}; return (ts.seatTaken | 0) > 0; }).length;
    console.log('C1: n=' + c1days.length + ' median=' + median(c1days) + 'd sits=' + c1sits + '/8');
  }
  const errs = seeds.reduce(function (t, s) { return t + ((p1[s].instrumentErrors || []).length); }, 0);
  console.log(JSON.stringify({ p1Median: median(days), p1Sits: sits, errors: errs }));
}

if (require.main === module) main();
module.exports = { loadCorpus: loadCorpus, bucketCause: bucketCause, fallenEntries: fallenEntries, deathCensus: deathCensus, livingTrajectory: livingTrajectory, classifyMechanism: classifyMechanism, seedSummary: seedSummary, median: median, firstDivergence: firstDivergence };
