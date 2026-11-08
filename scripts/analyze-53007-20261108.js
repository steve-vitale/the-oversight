// analyze-53007-20261108.js — the 53007 death classifier + corpus checker
// (arm sim-53007-a, run fleshout-20261108T1622Z). DIAG, zero src/js.
// Implements the prereg classification rule (evidence/2026-11-08/
// sim-53007-a-prereg.md) and the G1/G2/G3 legs used by
// scripts/test-53007-a.js. Pure functions over corpus JSONs; no sim.
// Usage:
//   node scripts/analyze-53007-20261108.js <corpus-dir> [unrecorded-dir]
// Prints the per-seed death table, 53007's classification + last-7-day
// trajectory, corpus-integrity verdicts, and (with a second dir) the
// neutrality comparison.
'use strict';
const fs = require('fs');
const path = require('path');

const VIOLENT = { monster: 1, combat: 1, ambush: 1, contest: 1, arena: 1, 'the wild': 1, betrayal: 1, 'a stranger': 1, 'The Callback': 1, expedition: 1 };
const ATTRITION = { sickness: 1, "a wound that wouldn't close": 1, starvation: 1, thirst: 1 };

function causeOf(f) { return (f && f.cause) ? String(f.cause) : 'unknown'; }

// classify(fallen, livingAt30): the prereg rule, applied in order.
// fallen: [{day, cause}] sorted by day. Returns {mech, detail}.
function classify(fallen, livingAt30) {
  fallen = (fallen || []).slice().sort(function (a, b) { return (a.day | 0) - (b.day | 0); });
  const n = fallen.length;
  if (!n) return { mech: 'no-deaths', detail: 'no fallen entries' };
  const sick = fallen.filter(function (f) { return causeOf(f) === 'sickness'; });
  const violent = fallen.filter(function (f) { return !!VIOLENT[causeOf(f)]; });
  const attr = fallen.filter(function (f) { return !!ATTRITION[causeOf(f)]; });
  const firstViolentDay = violent.length ? Math.min.apply(null, violent.map(function (f) { return f.day | 0; })) : null;
  const thirdSickDay = sick.length >= 3 ? sick[2].day : null;
  // 1. sickness-first
  if (causeOf(fallen[0]) === 'sickness' && sick.length / n >= 0.4 &&
      (firstViolentDay == null || thirdSickDay == null || firstViolentDay > thirdSickDay)) {
    return { mech: 'sickness-first', detail: 'first death sickness d' + fallen[0].day + '; sickness ' + sick.length + '/' + n + '; first violent ' + (firstViolentDay == null ? 'never' : 'd' + firstViolentDay) };
  }
  // 2. attrition-after-thinning
  const first3Violent = fallen.length >= 3 && fallen.slice(0, 3).every(function (f) { return !!VIOLENT[causeOf(f)]; });
  const lateAttr = attr.filter(function (f) { return (f.day | 0) > 30; }).length;
  if (first3Violent && livingAt30 != null && livingAt30 < 8 && lateAttr >= 3) {
    return { mech: 'attrition-after-thinning', detail: 'first 3 deaths violent; living d30=' + livingAt30 + '; ' + lateAttr + ' attrition deaths after d30' };
  }
  // 3. starvation-led
  const starv = fallen.filter(function (f) { return causeOf(f) === 'starvation'; });
  const lastDay = fallen[n - 1].day;
  const tail = fallen.filter(function (f) { return (f.day | 0) >= lastDay - 7; });
  const tailStarv = tail.filter(function (f) { return causeOf(f) === 'starvation'; }).length;
  if (starv.length >= 2 && tailStarv >= 1 && tailStarv >= Math.ceil(tail.filter(function (f) { return !!ATTRITION[causeOf(f)]; }).length / 2)) {
    return { mech: 'starvation-led', detail: starv.length + ' starvation deaths; ' + tailStarv + ' in the final 7 days' };
  }
  // 4. combat-led
  if (violent.length / n >= 0.6) {
    return { mech: 'combat-led', detail: 'violent ' + violent.length + '/' + n };
  }
  // 5. mixed/other — full cause mix, never forced.
  const mix = {};
  fallen.forEach(function (f) { const c = causeOf(f); mix[c] = (mix[c] || 0) + 1; });
  return { mech: 'mixed/other', detail: 'cause mix ' + JSON.stringify(mix) };
}

function causeMix(fallen) {
  const mix = {};
  (fallen || []).forEach(function (f) { const c = causeOf(f); mix[c] = (mix[c] || 0) + 1; });
  return mix;
}

function livingAt(corpus, day) {
  const row = (corpus.daily || []).find(function (r) { return r.day === day; });
  return row ? row.living : null;
}

// checkCorpus(corpus): G3 integrity (Amendment 1: the instrument's daily
// rows are day-change snapshots, NOT one-per-day — day 1 is never
// snapshot, day 3 is skipped in every committed corpus, and the closing
// snapshot duplicates the final day. Gaps are enumerated, not failed).
// Returns {ok, problems[], gaps[]}.
function checkCorpus(corpus) {
  const problems = [];
  const gaps = [];
  const daily = corpus.daily || [];
  if (!daily.length) problems.push('no daily rows');
  const days = daily.map(function (r) { return r.day; });
  if (days.length && days[0] !== 2) problems.push('first daily d' + days[0] + ' != d2');
  for (let i = 1; i < days.length; i++) {
    if (days[i] === days[i - 1]) {
      if (days[i] !== corpus.days) problems.push('duplicate daily d' + days[i] + ' (not the final day)');
    } else if (days[i] !== days[i - 1] + 1) {
      gaps.push('d' + days[i - 1] + ' -> d' + days[i]);
    }
  }
  if (days.length && days[days.length - 1] !== corpus.days) problems.push('last daily d' + days[days.length - 1] + ' != days ' + corpus.days);
  if (!corpus.instrumentOff) {
    const missing = daily.filter(function (r) { return !r.diag; }).length;
    if (missing) problems.push('diag missing on ' + missing + '/' + daily.length + ' rows');
    const nullPantry = daily.filter(function (r) { return r.diag && r.diag.pantryKcal == null; }).length;
    if (nullPantry) problems.push('pantryKcal null on ' + nullPantry + ' rows');
    const nullSick = daily.filter(function (r) { return r.diag && r.diag.sickN == null; }).length;
    if (nullSick) problems.push('sickN null on ' + nullSick + ' rows');
  }
  if ((corpus.instrumentErrors || []).length) problems.push((corpus.instrumentErrors || []).length + ' instrument errors');
  // Fallen list consistent with daily living drops: each fallen day must
  // show a living drop on that day or the day after (the living row lags
  // a day when a death is recorded late in the day — xphalf-rejudge).
  const byDay = {};
  daily.forEach(function (r) { byDay[r.day] = r.living; });
  (corpus.fallen || []).forEach(function (f) {
    const d = f.day | 0;
    const before = byDay[d - 1], on = byDay[d], after = byDay[d + 1];
    if (before == null || on == null) return;
    if (!(on < before || (after != null && after < on))) problems.push('fallen ' + (f.name || '?') + ' d' + d + ' (' + causeOf(f) + ') has no living drop on d' + d + '/d' + (d + 1));
  });
  if (corpus.days == null || corpus.endReason == null) problems.push('missing end snapshot (days/endReason)');
  return { ok: problems.length === 0, problems: problems, gaps: gaps };
}

// stripDiag(corpus): the unrecorded shape of an armed corpus.
function stripDiag(corpus) {
  const c = JSON.parse(JSON.stringify(corpus));
  (c.daily || []).forEach(function (r) { delete r.diag; });
  return c;
}

// neutralityCompare(unrec, rec): G2. Returns {ok, diffs[]}.
function neutralityCompare(unrec, rec) {
  const diffs = [];
  const a = stripDiag(rec);
  function cmp(label, x, y) {
    if (JSON.stringify(x) !== JSON.stringify(y)) diffs.push(label);
  }
  ['days', 'gameDays', 'endReason', 'won', 'over', 'villageLost', 'scaleRank', 'maxWave', 'unlockedWave', 'standing'].forEach(function (k) { cmp('headline.' + k, unrec[k], a[k]); });
  cmp('fallen', unrec.fallen, a.fallen);
  cmp('daily', unrec.daily, a.daily);
  cmp('waveKillLog', unrec.waveKillLog, a.waveKillLog);
  cmp('takeseatStats', unrec.takeseatStats, a.takeseatStats);
  return { ok: diffs.length === 0, diffs: diffs };
}

function loadDir(dir) {
  const out = {};
  fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).forEach(function (f) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[c.seed] = c;
  });
  return out;
}

function trajectory(corpus, daysBack) {
  const last = corpus.days;
  return (corpus.daily || []).filter(function (r) { return r.day > last - daysBack; }).map(function (r) {
    const g = r.diag || {};
    return { day: r.day, living: r.living, pantryKcal: g.pantryKcal, foodDays: g.foodDays, sickN: g.sickN, sick: (g.sickList || []).map(function (s) { return s.name + ':' + (s.disease || '?') + (s.daysLeft != null ? '(' + s.daysLeft + 'd)' : ''); }).join(','), woundedN: g.woundedN, hungryN: g.hungryN, wave: r.unlockedWaveSnap, maxWave: r.maxWave, seat: r.seat };
  });
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node scripts/analyze-53007-20261108.js <corpus-dir> [unrecorded-dir]'); process.exit(2); }
  const corpora = loadDir(dir);
  const seeds = Object.keys(corpora).sort();
  console.log('seed | days | end | standing | maxWave | seat | w4 | mech | cause mix');
  seeds.forEach(function (s) {
    const c = corpora[s];
    const cl = classify(c.fallen, livingAt(c, 30));
    const w4 = (c.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 4; }).length;
    const sat = (c.takeseatStats || {}).seatDay;
    console.log(s + ' | ' + c.days + ' | ' + c.endReason + ' | ' + c.standing + ' | ' + c.maxWave + ' | ' + (sat ? 'lesser d' + sat : '—') + ' | ' + w4 + ' | ' + cl.mech + ' | ' + JSON.stringify(causeMix(c.fallen)));
  });
  const c7 = corpora['53007'];
  if (c7) {
    console.log('\n53007 classification: ' + JSON.stringify(classify(c7.fallen, livingAt(c7, 30))));
    console.log('53007 fallen: ' + JSON.stringify(c7.fallen.map(function (f) { return 'd' + f.day + ' ' + f.name + ' (' + f.cause + ')'; })));
    console.log('\n53007 last-7-day trajectory (death d' + c7.days + '):');
    trajectory(c7, 7).forEach(function (r) { console.log(JSON.stringify(r)); });
    console.log('\n53007 full diag trajectory (sick/pantry):');
    (c7.daily || []).forEach(function (r) {
      const g = r.diag || {};
      console.log('d' + r.day + ' living=' + r.living + ' pantry=' + g.pantryKcal + ' foodDays=' + g.foodDays + ' sick=' + g.sickN + ' wounded=' + g.woundedN + ' hungry=' + g.hungryN + ' wave=' + r.unlockedWaveSnap);
    });
  }
  console.log('\nG3 corpus integrity:');
  seeds.forEach(function (s) {
    const ck = checkCorpus(corpora[s]);
    console.log(s + ': ' + (ck.ok ? 'PASS' : 'FAIL — ' + ck.problems.join('; ')) + (ck.gaps.length ? ' (gaps: ' + ck.gaps.join(', ') + ')' : ''));
  });
  const unrecDir = process.argv[3];
  if (unrecDir) {
    const unrec = loadDir(unrecDir);
    console.log('\nG2 neutrality (unrecorded vs recorded):');
    Object.keys(unrec).sort().forEach(function (s) {
      if (!corpora[s]) { console.log(s + ': no recorded match'); return; }
      const n = neutralityCompare(unrec[s], corpora[s]);
      console.log(s + ': ' + (n.ok ? 'PASS' : 'FAIL — ' + n.diffs.join(', ')));
    });
  }
}

module.exports = { classify: classify, causeMix: causeMix, livingAt: livingAt, checkCorpus: checkCorpus, stripDiag: stripDiag, neutralityCompare: neutralityCompare, loadDir: loadDir, trajectory: trajectory, VIOLENT: VIOLENT, ATTRITION: ATTRITION };
