#!/usr/bin/env node
// analyze-cookdiv-b.js — cook-diversity rotation analysis (rule Y).
// (sim-cookdiv-b, 2026-10-26, oversight-flesh-out-loop-b).
//
// Reads evidence/2026-10-26/sim-cookdiv-b-corpus/ per-seed census
// records (PERSEED-CENSUS shape from scripts/sweep-cookdiv-b.js) and
// prints the identical-seed R-vs-Y paired table plus the pre-registered
// GO evaluation. Racks-bound days come from the B-aux voice days
// (gate B speaks exactly once per racks-bound day).
//
// Usage:
//   node scripts/analyze-cookdiv-b.js [--dir <corpus-dir>] [--confirm]
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
// order; calendar gaps do not break a run) with no Y voice.
function maxVoicelessRun(bDays, yDays) {
  const y = new Set(yDays || []);
  let run = 0, max = 0;
  for (const d of (bDays || []).slice().sort((a, b) => a - b)) {
    if (y.has(d)) run = 0;
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

// Mirror of the rule-Y yield logic (game.js R branch + ROTATE), for
// T1 fixture checks only — the corpus assertions test the real code.
function yieldSim(days) {
  // days: [{cooks: [vid...], fig: number}] — first-listed cook is the
  // first candidate; later cooks candidate in order. Returns voices
  // [{day, cook}] and the max voiceless run over candidate days.
  let lastSpoken = {}; // vid -> last spoken figure
  let lastSpeaker = undefined;
  let silent = 0;
  const voices = [];
  const voicedDays = new Set();
  for (const d of days) {
    let dayMarker = false;
    let yieldDay = false;
    for (const vid of d.cooks) {
      if (yieldDay && lastSpeaker === vid) continue; // re-candidate: plain
      if (dayMarker) break; // day slot spent: later cooks plain
      const wouldChange = (lastSpoken[vid] === undefined || lastSpoken[vid] !== d.fig);
      const wouldReminder = (!wouldChange && silent + 1 >= 7);
      if (wouldChange && lastSpeaker === vid && silent + 1 < 7 && !yieldDay) {
        yieldDay = true;
        silent += 1;
        continue; // slot stays open
      }
      if (wouldChange) {
        lastSpoken[vid] = d.fig; silent = 0; dayMarker = true;
        lastSpeaker = vid; voices.push({ day: d.day, cook: vid }); voicedDays.add(d.day);
      } else {
        if (!yieldDay) silent += 1;
        if (silent >= 7) {
          lastSpoken[vid] = d.fig; silent = 0; dayMarker = true;
          lastSpeaker = vid; voices.push({ day: d.day, cook: vid }); voicedDays.add(d.day);
        } else dayMarker = true;
      }
    }
    void voicedDays;
  }
  // Max voiceless run over candidate days in order.
  let run = 0, max = 0;
  for (const d of days) {
    if (voices.some(v => v.day === d.day)) run = 0;
    else { run += 1; if (run > max) max = run; }
  }
  return { voices, maxVoiceless: max };
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
      const name = `cookdiv-b-${tag}${suf}-pd0-dg1-leadfeast-s${seed}.json`;
      const p = path.join(dir, name);
      if (!fs.existsSync(p)) return null;
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    };
    const R = load('R'), Y = load('Y'), B = load('B');
    if (!R || !Y) throw new Error('missing R or Y file for seed ' + seed);
    const rDetail = R.racksFullDetail || [];
    const yDetail = Y.racksFullDetail || [];
    const bDays = B ? [...new Set((B.racksFullDetail || []).map(d => d.day))].sort((a, b) => a - b) : null;
    const yDays = [...new Set(yDetail.map(d => d.day))];
    rows.push({
      seed,
      R: { voices: R.racksFullLines, distinct: distinctCooks(rDetail), daysAlive: R.daysAlive,
        say: R.sayTotal, worked: R.workedLines, res: R.preserveVillagerResolutions,
        deaths: R.deaths, starv: (R.deathCauses || {}).starvation || 0,
        national: R.national, table: R.table, win: R.win, waveReach: R.waveReach, rank: R.rank },
      Y: { voices: Y.racksFullLines, distinct: distinctCooks(yDetail), daysAlive: Y.daysAlive,
        say: Y.sayTotal, worked: Y.workedLines, res: Y.preserveVillagerResolutions,
        deaths: Y.deaths, starv: (Y.deathCauses || {}).starvation || 0,
        national: Y.national, table: Y.table, win: Y.win, waveReach: Y.waveReach, rank: Y.rank },
      B: B ? { voices: B.racksFullLines } : null,
      numDelta: sameNums(R, Y),
      maxVoiceless: bDays ? maxVoicelessRun(bDays, yDays) : null,
      bDays: bDays ? bDays.length : null,
    });
  }
  return rows;
}

function goEval(rows, confirm) {
  const n = rows.length;
  const needDistinct = confirm ? Math.ceil(n * 0.75) : 6;
  const distinctPass = rows.filter(r => r.Y.distinct.count >= 2).length;
  const bandR = rows.reduce((a, r) => a + r.R.voices, 0);
  const bandY = rows.reduce((a, r) => a + r.Y.voices, 0);
  const medR = median(rows.map(r => r.R.daysAlive));
  const medY = median(rows.map(r => r.Y.daysAlive));
  const starvR = rows.reduce((a, r) => a + r.R.starv, 0);
  const starvY = rows.reduce((a, r) => a + r.Y.starv, 0);
  const maxV = rows.map(r => r.maxVoiceless);
  const bars = {
    a_distinct: { pass: distinctPass >= needDistinct, detail: `${distinctPass}/${n} seeds >= 2 cooks (need ${needDistinct})` },
    b_voice: { pass: bandY >= 0.80 * bandR, detail: `Y ${bandY} vs R ${bandR} (ratio ${bandR ? (bandY / bandR).toFixed(3) : 'n/a'}, need >= 0.80)` },
    c_survival: { pass: medY >= 0.80 * medR, detail: `median Y ${medY}d vs R ${medR}d (need >= ${(0.80 * medR).toFixed(1)})` },
    d_starvation: { pass: starvY <= starvR + 2, detail: `starvation Y ${starvY} vs R ${starvR} (need <= ${starvR + 2})` },
    e_coverage: { pass: maxV.every(v => v !== null && v <= 6), detail: `max voiceless per seed: ${maxV.join(', ')} (need <= 6 every seed)` },
    f_neutrality: { pass: rows.every(r => r.numDelta === null && r.R.say === r.Y.say && r.R.worked === r.R.res && r.Y.worked === r.Y.res),
      detail: rows.every(r => r.numDelta === null) ? 'numerics identical, say unchanged, worked == resolutions on all cells'
        : 'FAIL: ' + rows.filter(r => r.numDelta).map(r => `seed ${r.seed} delta ${r.numDelta}`).join('; ') },
  };
  const perSeedCollapse = rows.filter(r => r.R.voices >= 10 && r.Y.voices < 0.50 * r.R.voices)
    .map(r => `${r.seed}: Y ${r.Y.voices} vs R ${r.R.voices}`);
  return { bars, perSeedCollapse, bandR, bandY, medR, medY, starvR, starvY, go: Object.values(bars).every(b => b.pass) };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const di = args.indexOf('--dir');
  const dir = di >= 0 ? args[di + 1] : path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-cookdiv-b-corpus');
  const confirm = args.includes('--confirm');
  const rows = analyze(dir, confirm);
  console.log('seed: R voices/distinct -> Y voices/distinct | R say -> Y say | maxVoiceless | R days -> Y days');
  for (const r of rows) {
    console.log(`${r.seed}: R ${r.R.voices}/${r.R.distinct.count} ${JSON.stringify(r.R.distinct.shares)} -> Y ${r.Y.voices}/${r.Y.distinct.count} ${JSON.stringify(r.Y.distinct.shares)} | say ${r.R.say} -> ${r.Y.say} | maxV ${r.maxVoiceless} (B days ${r.bDays}) | days ${r.R.daysAlive} -> ${r.Y.daysAlive} | starv ${r.R.starv} -> ${r.Y.starv}`);
  }
  const ev = goEval(rows, confirm);
  console.log('--- GO EVALUATION ---');
  for (const [k, b] of Object.entries(ev.bars)) console.log(`${k}: ${b.pass ? 'PASS' : 'FAIL'} — ${b.detail}`);
  if (ev.perSeedCollapse.length) console.log('per-seed voice collapse (named, not a bar): ' + ev.perSeedCollapse.join('; '));
  // Wall numbers (Y arm; R identical on numerics by bar f).
  const nat = rows.filter(r => r.Y.national).length;
  const tab = rows.filter(r => r.Y.table).length;
  const win = rows.filter(r => r.Y.win).length;
  const w4 = rows.filter(r => (r.Y.waveReach || []).includes(4)).length;
  const w5 = rows.filter(r => (r.Y.waveReach || []).includes(5)).length;
  const causes = {};
  for (const r of rows) { /* death-cause shares need full rows; see test */ }
  console.log(`WALL: national-or-better ${nat}/${rows.length}, table ${tab}/${rows.length}, wins ${win}/${rows.length}, wave-4 ${w4}/${rows.length}, wave-5 ${w5}/${rows.length}, median survival ${ev.medY}d`);
  console.log('VERDICT: ' + (ev.go ? 'GO' : 'NO-GO'));
  process.exit(ev.go ? 0 : 1);
}

module.exports = { distinctCooks, maxVoicelessRun, median, sameNums, yieldSim, analyze, goEval };
