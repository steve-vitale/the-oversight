// analyze-journey-deepening-r92-20261104.js -- R92 KNOWLEDGE-ECONOMY analyzer
// (tooling only, zero game code). Reads per-seed JSONs and transcript files
// written by scripts/journey-deepening-r92-20261104.js and reports the
// pre-registered K-LESSON / K-MARKERS / K-LINKS / K-CODEX diagnostics, the
// W3-BASE comparison, descriptive M5 (by endReason), and STAY-GREEN
// mislabels. Wave-4 counts print as one descriptive line only — r92 does
// NOT re-judge wave 4 (r90 did, same day). Transcript sense is judged by a
// human reading the files; the scan here only flags verbatim repeats
// (>=3 same NPC line in one sitting) as a senselessness proxy.
//
// Pre-collapse rule (r90 metric review): K-LINKS / K-CODEX / readiness
// read the LAST snapshot with a living village — last deedLog entry with
// pop > 0, last armor.readiness entry with armored+armed > 0 — never a
// post-collapse all-zero final snapshot.
//
// Usage: node scripts/analyze-journey-deepening-r92-20261104.js [evidir]
//   EVIDIR env overrides the default goal hidden_files evidence dir.
// When required as a module it exports summarizeSeed, scanTranscript, median.
'use strict';
const fs = require('fs');
const path = require('path');
const DEFAULT_EVIDIR = path.join(__dirname, '..', '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-04');

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
  // r90 note: raw dmgFrac can exceed 1 on overkill (monster HP goes
  // negative), so medians clamp to [0, 1] — stored per-fight values stay raw.
  const clamp01 = (x) => (x == null ? null : Math.min(1, Math.max(0, x)));
  // K-LESSON
  const lessons = ((s && s.ship && s.ship.lessons) || []);
  const lessonsOk = lessons.filter(l => l && l.ok).length;
  const beast = (s && s.ctxSummary) || {};
  // K-MARKERS
  const know = (s && s.knowCounts) || {};
  // K-LINKS / K-CODEX at the last living snapshot
  const deed = (s && s.deedLog) || [];
  let lastLiving = null;
  for (const d of deed) { if (d && (d.pop || 0) > 0) lastLiving = d; }
  const linksActive = lastLiving ? (lastLiving.links || []).filter(l => l && l.status === 'active').length : 0;
  const propose = ((s && s.regionalLog) || []).filter(e => e && e.ev === 'propose');
  const proposeOutcomes = {};
  for (const p of propose) proposeOutcomes[p.result || '?'] = (proposeOutcomes[p.result || '?'] || 0) + 1;
  // Readiness at the last non-collapsed snapshot
  const readyList = ((s && s.armor && s.armor.readiness) || []);
  let readinessPre = null;
  for (const r of readyList) { if (r && ((r.armored || 0) + (r.armed || 0)) > 0) readinessPre = r; }
  if (!readinessPre) readinessPre = readyList.slice(-1)[0] || null;
  // Plants known, alive villagers only
  const aliveCensus = (s && s.census) || [];
  const alive = aliveCensus.filter(c => c.alive);
  const plantsMean = alive.length ? (alive.reduce((t, c) => t + (c.plantsKnown || 0), 0) / alive.length) : null;
  return {
    seed: s.seed, end: s.endReason || null, maxDay: s.maxGameDay || null,
    finalWave: s.finalWave || null, finalScale: s.finalScale || null,
    engagedW4: ((s.engaged || {}).w4 || 0), engagedW3: ((s.engaged || {}).w3 || 0),
    w4total: w4.length, w4kills: w4.filter(f => f.outcomeClass === 'kill').length,
    w3total: w3.length, w3kills: w3.filter(f => f.outcomeClass === 'kill').length,
    w3classes: classCounts(w3),
    w3dmgMedianFought: median(fought(w3).map(f => clamp01(f.dmgFrac))),
    lessonsN: lessons.length, lessonsOk,
    beastAsked: beast.beasttricksAsked || 0, beastTaught: beast.beasttricksTaught || 0,
    knowExperiment: know.experiment || 0, knowTraderDeep: know.traderDeep || 0, knowMoot: know.moot || 0,
    proposeOutcomes, proposeN: propose.length,
    lastLivingDay: lastLiving ? lastLiving.day : null, lastLivingPop: lastLiving ? lastLiving.pop : null,
    standingLastLiving: lastLiving ? lastLiving.standingTotal : null,
    codexL2: lastLiving ? lastLiving.codexL2 : null,
    sharedKnowN: lastLiving ? lastLiving.sharedKnowN : null,
    traderDeepN: lastLiving ? lastLiving.traderDeepN : null,
    linksActive, scaleLastLiving: lastLiving ? lastLiving.scale : null,
    readinessPre,
    plantsMeanAlive: plantsMean == null ? null : Math.round(plantsMean * 10) / 10,
    plantsDistAlive: alive.map(c => c.plantsKnown || 0).sort((a, b) => a - b),
    plantsMedianAlive: median(alive.map(c => c.plantsKnown || 0)),
    beastAsks: ((s && s.ctxSummary && s.ctxSummary.beastAsks) || []),
    mislabels: ((s.deathHonesty || {}).mislabels || []).length,
    alive: alive.length,
    roster: aliveCensus.length,
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


function summarizeBeastAsks(asks) {
  const classes = {};
  const counterless = {}; // type -> {asks, slainMax}
  let repeatFutile = 0;
  let prevKey = null;
  for (const a of (asks || [])) {
    const cls = a.cls || 'unknown';
    classes[cls] = (classes[cls] || 0) + 1;
    for (const t of (a.noCounter || [])) {
      counterless[t] = counterless[t] || { asks: 0 };
      counterless[t].asks++;
    }
    // repeat-futile: a none-no-counter ask whose noCounter set equals the
    // previous ask's set (same dead end re-asked on a later 5-day tick).
    const key = (a.cls === 'none-no-counter') ? (a.noCounter || []).slice().sort().join(',') : null;
    if (key && prevKey === key) repeatFutile++;
    if (key) prevKey = key; else if (a.cls === 'taught') prevKey = null;
  }
  return { classes, counterless, repeatFutile, total: (asks || []).length };
}

if (require.main === module) {
  const dir = process.argv[2] || process.env.R92_EVIDIR || DEFAULT_EVIDIR;
  let tfiles = [], sfiles = [];
  try {
    tfiles = fs.readdirSync(dir).filter(f => /^journey-deepening-r92-transcript-\d+-day\d+\.txt$/.test(f)).sort();
    sfiles = fs.readdirSync(dir).filter(f => /^journey-deepening-r92-seed\d+\.json$/.test(f)).sort();
  } catch (e) { console.log('EVIDIR read failed: ' + e.message); process.exit(1); }
  if (!sfiles.length) { console.log('No r92 seed JSONs in ' + dir); process.exit(1); }
  console.log('=== R92 KNOWLEDGE-ECONOMY PANEL ===');
  let survived = 0, mislabels = 0, totLessons = 0, totLessonsOk = 0;
  for (const f of sfiles) {
    try {
      const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      const v = summarizeSeed(s);
      if (v.end === 'survived') survived++;
      mislabels += v.mislabels; totLessons += v.lessonsN; totLessonsOk += v.lessonsOk;
      console.log(`${f}: end=${v.end} maxDay=${v.maxDay} wave=${v.finalWave} scale=${v.finalScale} alive=${v.alive}/${v.roster} mislabels=${v.mislabels} W4desc=${v.w4total}f/${v.w4kills}k`);
      console.log(`   K-LESSON: lessons=${v.lessonsN} ok=${v.lessonsOk} beastAsked=${v.beastAsked} beastTaught=${v.beastTaught}`);
      const ba = summarizeBeastAsks(v.beastAsks);
      console.log(`   B-ASK: total=${ba.total} classes=${JSON.stringify(ba.classes)} repeatFutile=${ba.repeatFutile} counterless=${JSON.stringify(ba.counterless)}`);
      console.log(`   P-DIST: plantsAlive=${JSON.stringify(v.plantsDistAlive)} median=${v.plantsMedianAlive}`);
      console.log(`   K-MARKERS: experiment=${v.knowExperiment} traderDeep=${v.knowTraderDeep} moot=${v.knowMoot}`);
      console.log(`   K-LINKS: propose=${v.proposeN} ${JSON.stringify(v.proposeOutcomes)} activeLinks=${v.linksActive} standing=${v.standingLastLiving} (day ${v.lastLivingDay}, pop ${v.lastLivingPop}, scale ${v.scaleLastLiving})`);
      console.log(`   K-CODEX: codexL2=${v.codexL2} sharedKnowN=${v.sharedKnowN} traderDeepN=${v.traderDeepN} plantsMeanAlive=${v.plantsMeanAlive}`);
      console.log(`   readinessPre: ${JSON.stringify(v.readinessPre)}`);
      console.log(`   W3: total=${v.w3total} kills=${v.w3kills} classes=${JSON.stringify(v.w3classes)} dmgMedFought=${v.w3dmgMedianFought}`);
    } catch (e) { console.log(`${f}: JSON read failed: ${e.message}`); }
  }
  let loopFiles = [];
  for (const f of tfiles) {
    const sc = scanTranscript(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (sc.loop) loopFiles.push({ file: f, maxRepeat: sc.maxRepeat, line: (sc.maxLine || '').slice(0, 120) });
    console.log(`${f}: them=${sc.themLines} maxRepeat=${sc.maxRepeat}`);
  }
  console.log('--- verdicts (descriptive; lesson counts carry ok/total) ---');
  console.log(`K-LESSON panel: ${totLessonsOk}/${totLessons} ok lessons`);
  console.log(`M4 transcripts=${tfiles.length} loopFiles=${loopFiles.length}`);
  if (loopFiles.length) console.log('LOOP FILES: ' + JSON.stringify(loopFiles));
  console.log(`M5 winnable (descriptive): survived=${survived}/${sfiles.length} mislabels=${mislabels}`);
}
module.exports = { summarizeSeed, scanTranscript, median, summarizeBeastAsks };
