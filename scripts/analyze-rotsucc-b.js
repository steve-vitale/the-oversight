#!/usr/bin/env node
// analyze-rotsucc-b.js — slot-rotation analysis (rule S).
// (sim-rotsucc-b, 2026-10-26, oversight-flesh-out-loop-b).
//
// Reads evidence/2026-10-26/sim-rotsucc-b-corpus/ per-seed census
// records (PERSEED-CENSUS shape from scripts/sweep-rotsucc-b.js) and
// prints the identical-seed R-vs-S paired table plus the pre-registered
// GO evaluation. Racks-bound days come from the B-aux voice days
// (gate B speaks exactly once per racks-bound day).
//
// Usage:
//   node scripts/analyze-rotsucc-b.js [--dir <corpus-dir>] [--confirm]
// Exit 0 on GO, 1 on NO-GO (or on missing/corrupt input).
'use strict';
const fs = require('fs');
const path = require('path');

function distinctCooks(detail) {
  const shares = {};
  for (const d of detail || []) shares[d.cook] = (shares[d.cook] || 0) + 1;
  return { count: Object.keys(shares).length, shares };
}

// Maximal run of consecutive racks-bound days (in racks-bound-day
// order; calendar gaps do not break a run) with no S voice.
function maxVoicelessRun(bDays, sDays) {
  const s = new Set(sDays || []);
  let run = 0, max = 0;
  for (const d of (bDays || []).slice().sort((a, b) => a - b)) {
    if (s.has(d)) run = 0;
    else { run += 1; if (run > max) max = run; }
  }
  return max;
}

function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return 0;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function sameNums(a, b) {
  const keys = ['daysAlive', 'preserveVillagerBatches', 'preserveVillagerResolutions',
    'deaths', 'rank', 'national', 'table', 'win'];
  for (const k of keys) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) return k;
  if (JSON.stringify((a.waveReach || []).slice().sort()) !== JSON.stringify((b.waveReach || []).slice().sort())) return 'waveReach';
  return null;
}

// Mirror of the rule-S slot logic (game.js R branch + SLOT), for
// T1 fixture checks only — the corpus assertions test the real code.
// days: [{day, cooks: [vid...], fig}] — cooks in resolution order.
function slotSim(days) {
  let lastSpoken = {};
  let silent = 0;
  let order = [];
  let idx = 0;
  let slotDay = null;
  let holder = null;
  let silentDay = null;
  const voices = [];
  const voicedDays = new Set();
  for (const d of days) {
    let dayMarker = false;
    for (const vid of d.cooks) {
      if (dayMarker) { if (!order.includes(vid)) order.push(vid); continue; }
      if (slotDay !== d.day) {
        slotDay = d.day;
        if (order.length === 0) { order.push(vid); idx = 0; }
        else idx += 1;
        holder = order[idx % order.length];
      }
      if (holder !== vid) {
        if (!order.includes(vid)) order.push(vid);
        if (silentDay !== d.day) {
          silent += 1;
          silentDay = d.day;
          if (silent >= 7) {
            lastSpoken[vid] = d.fig; silent = 0; dayMarker = true;
            voices.push({ day: d.day, cook: vid }); voicedDays.add(d.day);
          }
        }
        continue;
      }
      dayMarker = true;
      const wouldChange = (lastSpoken[vid] === undefined || lastSpoken[vid] !== d.fig);
      if (wouldChange) {
        lastSpoken[vid] = d.fig; silent = 0;
        voices.push({ day: d.day, cook: vid }); voicedDays.add(d.day);
      } else {
        if (silentDay !== d.day) silent += 1;
        if (silent >= 7) {
          lastSpoken[vid] = d.fig; silent = 0;
          voices.push({ day: d.day, cook: vid }); voicedDays.add(d.day);
        }
      }
    }
  }
  let run = 0, max = 0;
  for (const d of days) {
    if (voicedDays.has(d.day)) run = 0;
    else { run += 1; if (run > max) max = run; }
  }
  return { voices, maxVoiceless: max };
}

function nonDominantShare(shares, total) {
  if (!total) return null;
  const vals = Object.values(shares);
  if (vals.length < 2) return null;
  return (total - Math.max(...vals)) / total;
}

function analyze(dir, confirm) {
  const suf = confirm ? '-confirm' : '';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const seeds = [...new Set(files.map(f => {
    const m = f.match(/-s(\d+)\.json$/);
    return m ? parseInt(m[1], 10) : null;
  }).filter(Boolean))].sort((a, b) => a - b);
  const rows = [];
  for (const seed of seeds) {
    const load = (tag) => {
      const name = `rotsucc-b-${tag}${suf}-pd0-dg1-competent-nofeast-s${seed}.json`;
      const p = path.join(dir, name);
      if (!fs.existsSync(p)) return null;
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    };
    const R = load('R'), S = load('S'), B = load('B');
    if (!R || !S) throw new Error('missing R or S file for seed ' + seed);
    const rDetail = R.racksFullDetail || [];
    const sDetail = S.racksFullDetail || [];
    const bDays = B ? [...new Set((B.racksFullDetail || []).map(d => d.day))].sort((a, b) => a - b) : null;
    const sDays = [...new Set(sDetail.map(d => d.day))];
    const sDistinct = distinctCooks(sDetail);
    rows.push({
      seed,
      R: { voices: R.racksFullLines, distinct: distinctCooks(rDetail), daysAlive: R.daysAlive,
        say: R.sayTotal, worked: R.workedLines, res: R.preserveVillagerResolutions,
        deaths: R.deaths, starv: (R.deathCauses || {}).starvation || 0,
        national: R.national, table: R.table, win: R.win, waveReach: R.waveReach, rank: R.rank,
        deathCauses: R.deathCauses || {} },
      S: { voices: S.racksFullLines, distinct: sDistinct, daysAlive: S.daysAlive,
        say: S.sayTotal, worked: S.workedLines, res: S.preserveVillagerResolutions,
        deaths: S.deaths, starv: (S.deathCauses || {}).starvation || 0,
        national: S.national, table: S.table, win: S.win, waveReach: S.waveReach, rank: S.rank,
        deathCauses: S.deathCauses || {},
        share: nonDominantShare(sDistinct.shares, S.racksFullLines) },
      B: B ? { voices: B.racksFullLines } : null,
      numDelta: sameNums(R, S),
      maxVoiceless: bDays ? maxVoicelessRun(bDays, sDays) : null,
      bDays: bDays ? bDays.length : null,
    });
  }
  return rows;
}

function goEval(rows, confirm) {
  const n = rows.length;
  const needDistinct = confirm ? Math.ceil(n * 0.75) : 6;
  const distinctPassRows = rows.filter(r => r.S.distinct.count >= r.R.distinct.count);
  const distinctPass = distinctPassRows.length;
  const bandR = rows.reduce((a, r) => a + r.R.voices, 0);
  const bandS = rows.reduce((a, r) => a + r.S.voices, 0);
  const medR = median(rows.map(r => r.R.daysAlive));
  const medS = median(rows.map(r => r.S.daysAlive));
  const starvR = rows.reduce((a, r) => a + r.R.starv, 0);
  const starvS = rows.reduce((a, r) => a + r.S.starv, 0);
  const maxV = rows.map(r => r.maxVoiceless);
  const shareRows = rows.filter(r => r.S.distinct.count >= 2 && r.S.voices >= 8);
  const shareFail = shareRows.filter(r => r.S.share === null || r.S.share < 0.20);
  const bars = {
    a_voice: { pass: bandS >= 0.90 * bandR, detail: `S ${bandS} vs R ${bandR} (ratio ${bandR ? (bandS / bandR).toFixed(3) : 'n/a'}, need >= 0.90)` },
    b_distinct: { pass: distinctPass >= needDistinct, detail: `${distinctPass}/${n} seeds S distinct >= R distinct (need ${needDistinct}); misses: ${rows.filter(r => r.S.distinct.count < r.R.distinct.count).map(r => r.seed).join(', ') || 'none'}` },
    c_share: { pass: shareFail.length === 0, detail: shareRows.length ? `${shareRows.length} judged seeds, failures: ${shareFail.map(r => `${r.seed} share ${(r.S.share * 100).toFixed(0)}%`).join('; ') || 'none'} (need >= 20% each)` : 'no judged seeds (all S distinct < 2 or voices < 8)' },
    d_coverage: { pass: maxV.every(v => v !== null && v <= 6), detail: `max voiceless per seed: ${maxV.join(', ')} (need <= 6 every seed)` },
    e_survival: { pass: medS >= medR && starvS <= starvR, detail: `median S ${medS}d vs R ${medR}d (need >= ${medR}); starvation S ${starvS} vs R ${starvR} (need <= ${starvR})` },
    f_neutrality: { pass: rows.every(r => r.numDelta === null && r.R.say === r.S.say && r.R.worked === r.R.res && r.S.worked === r.S.res),
      detail: rows.every(r => r.numDelta === null) ? 'numerics identical, say unchanged, worked == resolutions on all cells'
        : 'FAIL: ' + rows.filter(r => r.numDelta).map(r => `seed ${r.seed} delta ${r.numDelta}`).join('; ') },
  };
  const perSeedCollapse = rows.filter(r => r.R.voices >= 10 && r.S.voices < 0.50 * r.R.voices)
    .map(r => `${r.seed}: S ${r.S.voices} vs R ${r.R.voices}`);
  return { bars, perSeedCollapse, bandR, bandS, medR, medS, starvR, starvS, go: Object.values(bars).every(b => b.pass) };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const di = args.indexOf('--dir');
  const dir = di >= 0 ? args[di + 1] : path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-rotsucc-b-corpus');
  const confirm = args.includes('--confirm');
  const rows = analyze(dir, confirm);
  console.log('seed: R voices/distinct -> S voices/distinct | R say -> S say | maxVoiceless | R days -> S days');
  for (const r of rows) {
    console.log(`${r.seed}: R ${r.R.voices}/${r.R.distinct.count} ${JSON.stringify(r.R.distinct.shares)} -> S ${r.S.voices}/${r.S.distinct.count} ${JSON.stringify(r.S.distinct.shares)} share=${r.S.share === null ? 'n/a' : (r.S.share * 100).toFixed(0) + '%'} | say ${r.R.say} -> ${r.S.say} | maxV ${r.maxVoiceless} (B days ${r.bDays}) | days ${r.R.daysAlive} -> ${r.S.daysAlive} | starv ${r.R.starv} -> ${r.S.starv}`);
  }
  const ev = goEval(rows, confirm);
  console.log('--- GO EVALUATION ---');
  for (const [k, b] of Object.entries(ev.bars)) console.log(`${k}: ${b.pass ? 'PASS' : 'FAIL'} — ${b.detail}`);
  if (ev.perSeedCollapse.length) console.log('per-seed voice collapse (named, not a bar): ' + ev.perSeedCollapse.join('; '));
  const nat = rows.filter(r => r.S.national).length;
  const tab = rows.filter(r => r.S.table).length;
  const win = rows.filter(r => r.S.win).length;
  const w4 = rows.filter(r => (r.S.waveReach || []).includes(4)).length;
  const w5 = rows.filter(r => (r.S.waveReach || []).includes(5)).length;
  const causes = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.S.deathCauses || {})) causes[k] = (causes[k] || 0) + v;
  console.log(`WALL: national-or-better ${nat}/${rows.length}, table ${tab}/${rows.length}, wins ${win}/${rows.length}, wave-4 ${w4}/${rows.length}, wave-5 ${w5}/${rows.length}, median survival ${ev.medS}d`);
  console.log(`DEATH-CAUSES (S band): ${JSON.stringify(causes)}`);
  console.log('VERDICT: ' + (ev.go ? 'GO' : 'NO-GO'));
  process.exit(ev.go ? 0 : 1);
}

module.exports = { distinctCooks, maxVoicelessRun, median, sameNums, slotSim, nonDominantShare, analyze, goEval };
