// analyze-journey-deepening-r90-20261103.js -- R90 W4-WILD analyzer
// (tooling only, zero game code). Reads per-seed JSONs and transcript files
// written by scripts/journey-deepening-r90-20261103.js and reports the
// pre-registered W4-REACH / W4-KILL / W4-OUTCOME diagnostics, the W3-BASE
// comparison, descriptive M5 (by endReason), and STAY-GREEN mislabels.
// Transcript sense is judged by a human reading the files; the scan here
// only flags verbatim repeats (>=3 same NPC line in one sitting) as a
// senselessness proxy.
//
// Usage: node scripts/analyze-journey-deepening-r90-20261103.js [evidir]
//   EVIDIR env overrides the default goal hidden_files evidence dir.
// When required as a module it exports summarizeSeed, scanTranscript, median.
'use strict';
const fs = require('fs');
const path = require('path');
const DEFAULT_EVIDIR = path.join(__dirname, '..', '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-03');

function median(xs) {
  const v = (xs || []).filter(x => x != null && isFinite(x)).slice().sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

function maxWaveOf(f) {
  const ws = f.waves || (f.monsters || []).map(m => m.wave || 1);
  return ws.length ? Math.max.apply(null, ws) : 1;
}

// A fight counts as W4 iff its highest monster wave is 4; W3 iff highest is 3.
function summarizeSeed(s) {
  const table = (s && s.wildFightTable) || [];
  const w4 = table.filter(f => maxWaveOf(f) === 4);
  const w3 = table.filter(f => maxWaveOf(f) === 3);
  const classCounts = (arr) => {
    const c = {};
    for (const f of arr) c[f.outcomeClass || '?'] = (c[f.outcomeClass || '?'] || 0) + 1;
    return c;
  };
  const fought = (arr) => arr.filter(f => (f.outcomeClass || '') !== 'player-fled');
  // r90 throwaway note: raw dmgFrac can exceed 1 on overkill (monster HP goes
  // negative), so medians clamp to [0, 1] — the stored per-fight values stay raw.
  const clamp01 = (x) => (x == null ? null : Math.min(1, Math.max(0, x)));
  const lastReady = ((s && s.armor && s.armor.readiness) || []).slice(-1)[0] || null;
  return {
    seed: s.seed, end: s.endReason || null, maxDay: s.maxGameDay || null,
    finalWave: s.finalWave || null, finalScale: s.finalScale || null,
    engagedW4: ((s.engaged || {}).w4 || 0), engagedW3: ((s.engaged || {}).w3 || 0),
    w4total: w4.length, w4kills: w4.filter(f => f.outcomeClass === 'kill').length,
    w4classes: classCounts(w4),
    w4dmgMedianFought: median(fought(w4).map(f => clamp01(f.dmgFrac))),
    w4dmgMedianAll: median(w4.map(f => clamp01(f.dmgFrac))),
    w3total: w3.length, w3kills: w3.filter(f => f.outcomeClass === 'kill').length,
    w3classes: classCounts(w3),
    w3dmgMedianFought: median(fought(w3).map(f => clamp01(f.dmgFrac))),
    w4ship: (s.w4ship || []).length,
    w4rows: w4.map(f => ({
      day: f.day, rounds: f.rounds, mons: (f.monsters || []).map(m => m.mid + (m.veteran ? ':vet' : '')).join('+'),
      party: f.partySize, weapon: (f.weapon && f.weapon.name) || null, range: (f.weapon && f.weapon.range) || null,
      armor: f.armor, dmg: f.dmgFrac, cls: f.outcomeClass, result: f.result,
    })),
    readinessLast: lastReady,
    mislabels: ((s.deathHonesty || {}).mislabels || []).length,
    alive: (s.census || []).filter(c => c.alive).length,
    roster: (s.census || []).length,
  };
}

function scanTranscript(text) {
  const lines = String(text || '').split('\n');
  const themLines = [];
  for (const l of lines) {
    const m = /^THEM: (.*)$/.exec(l);
    if (m) themLines.push(m[1]);
  }
  const counts = {};
  for (const l of themLines) counts[l] = (counts[l] || 0) + 1;
  let maxRepeat = 0, maxLine = null;
  for (const [l, n] of Object.entries(counts)) {
    if (n > maxRepeat) { maxRepeat = n; maxLine = l; }
  }
  return { themLines: themLines.length, maxRepeat, maxLine, loop: maxRepeat >= 3 };
}

if (require.main === module) {
  const dir = process.argv[2] || process.env.R90_EVIDIR || DEFAULT_EVIDIR;
  let tfiles = [], sfiles = [];
  try {
    tfiles = fs.readdirSync(dir).filter(f => /^journey-deepening-r90-transcript-\d+-day\d+\.txt$/.test(f)).sort();
    sfiles = fs.readdirSync(dir).filter(f => /^journey-deepening-r90-seed\d+\.json$/.test(f)).sort();
  } catch (e) { console.log('EVIDIR read failed: ' + e.message); process.exit(1); }
  if (!sfiles.length) { console.log('No r90 seed JSONs in ' + dir); process.exit(1); }
  console.log('=== R90 W4-WILD PANEL ===');
  let reach = 0, kills = 0, fights = 0, survived = 0, mislabels = 0;
  for (const f of sfiles) {
    try {
      const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      const v = summarizeSeed(s);
      if (v.w4total > 0) reach++;
      kills += v.w4kills; fights += v.w4total;
      if (v.end === 'survived') survived++;
      mislabels += v.mislabels;
      console.log(`${f}: end=${v.end} maxDay=${v.maxDay} wave=${v.finalWave} scale=${v.finalScale} engagedW4=${v.engagedW4} alive=${v.alive}/${v.roster} W4=${v.w4total} kills=${v.w4kills} classes=${JSON.stringify(v.w4classes)} dmgMedFought=${v.w4dmgMedianFought} w4ship=${v.w4ship} mislabels=${v.mislabels}`);
      console.log(`   W3: total=${v.w3total} kills=${v.w3kills} classes=${JSON.stringify(v.w3classes)} dmgMedFought=${v.w3dmgMedianFought}`);
      console.log(`   readinessLast: ${JSON.stringify(v.readinessLast)}`);
      for (const r of v.w4rows) console.log(`   W4 day${r.day} r${r.rounds} ${r.mons} party=${r.party} weapon=${r.weapon} range=${r.range} armor=${r.armor} dmg=${r.dmg} cls=${r.cls} result=${r.result}`);
    } catch (e) { console.log(`${f}: JSON read failed: ${e.message}`); }
  }
  let loopFiles = [];
  for (const f of tfiles) {
    const sc = scanTranscript(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (sc.loop) loopFiles.push({ file: f, maxRepeat: sc.maxRepeat, line: (sc.maxLine || '').slice(0, 120) });
    console.log(`${f}: them=${sc.themLines} maxRepeat=${sc.maxRepeat}`);
  }
  console.log('--- verdicts (descriptive; W4-KILL carries its denominator) ---');
  console.log(`W4-REACH: ${reach}/${sfiles.length} seeds with >=1 wild W4 fight`);
  console.log(`W4-KILL: ${kills}/${fights} wild W4 fights ended in a kill`);
  console.log(`M4 transcripts=${tfiles.length} loopFiles=${loopFiles.length}`);
  if (loopFiles.length) console.log('LOOP FILES: ' + JSON.stringify(loopFiles));
  console.log(`M5 winnable (descriptive): survived=${survived}/${sfiles.length} mislabels=${mislabels}`);
}
module.exports = { summarizeSeed, scanTranscript, median };
