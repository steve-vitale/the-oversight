// scripts/analyze-journey-scale-r96-20261104.js — journey-scale r96 analyzer.
// Q1: pilgrimage position trace (postrace rows) -> per-trip cause classification.
// Q2: national stage/answer/dissolve/re-stage timeline (wantwatch rank + capture).
// Q4: census continuity (trust json + wantwatch/hungerwatch final rows).
// Usage: node scripts/analyze-journey-scale-r96-20261104.js [EVIDIR]
// Defaults: evidence/2026-11-04/journey-scale-r96, seeds 85501-85504.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'evidence', '2026-11-04', 'journey-scale-r96');
const SEEDS = [85501, 85502, 85503, 85504];
function read(p) { try { return fs.readFileSync(p, 'utf8'); } catch (e) { return ''; } }
function readJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } }

for (const seed of SEEDS) {
  console.log(`\n===== SEED ${seed} =====`);
  // Q1 trips from postrace
  const pr = read(path.join(EVIDIR, `journey-scale-r96-postrace-${seed}.txt`)).split('\n').filter(Boolean);
  const rows = pr.map(l => {
    const m = l.match(/^d(\d+) (\w+) (\S+) at=\((\d+),(\d+)\) target=\((\d+|null|undefined),(\d+|null|undefined)\) dist=(\d+|null|undefined)(?: after=\((\d+),(\d+)\) dist2=(\d+))?(?: reason=(\w+))?/);
    if (!m) return null;
    return { day: +m[1], stage: m[2], vid: m[3], px: +m[4], py: +m[5], dist: (m[8] === 'null' || m[8] === 'undefined') ? null : +m[8], dist2: m[11] ? +m[11] : null, reason: m[12] || null };
  }).filter(Boolean);
  const trips = [];
  let cur = null;
  for (const r of rows) {
    if (r.stage === 'eval') { if (!cur || cur.vid !== r.vid) { if (cur) trips.push(cur); cur = { vid: r.vid, start: r.day, evals: [], walks: [], outcome: 'open' }; } cur.evals.push(r); }
    else if (cur) {
      if (r.stage === 'walk') cur.walks.push(r);
      else if (r.stage === 'study') { cur.outcome = 'study'; cur.end = r.day; trips.push(cur); cur = null; }
      else if (r.stage === 'drop') { cur.outcome = 'drop:' + (r.reason || '?'); cur.end = r.day; trips.push(cur); cur = null; }
    }
  }
  if (cur) trips.push(cur);
  // persistence-break signature: a walk ending dist2<=2 followed by a later eval dist>2 for the same trip
  let persistBreaks = 0;
  for (const t of trips) {
    for (let i = 0; i < t.walks.length; i++) {
      const w = t.walks[i];
      if (w.dist2 !== null && w.dist2 <= 2) {
        const nextEval = t.evals.find(e => e.day > w.day);
        if (nextEval && nextEval.dist !== null && nextEval.dist > 2) persistBreaks++;
      }
    }
  }
  const hw = read(path.join(EVIDIR, `journey-scale-r96-hungerwatch-${seed}.txt`)).split('\n').filter(Boolean);
  const lastHw = hw[hw.length - 1] || '';
  console.log(`Q1 trips: ${trips.length} (postrace rows ${rows.length}); persistence-breaks (walk-in-range then next-day eval out-of-range): ${persistBreaks}`);
  for (const t of trips) {
    const evalDists = t.evals.map(e => e.dist).join(',');
    const walkEnds = t.walks.map(w => w.dist2).join(',');
    console.log(`  trip ${t.vid} d${t.start}->${t.outcome === 'open' ? 'open' : 'd' + t.end + ' ' + t.outcome} evals=${t.evals.length} evalDists=[${evalDists}] walkEnds=[${walkEnds}]`);
  }
  console.log(`  hungerwatch last: ${lastHw}`);
  // Q2 national timeline
  const ww = read(path.join(EVIDIR, `journey-scale-r96-wantwatch-${seed}.txt`)).split('\n').filter(Boolean).map(l => {
    const m = l.match(/^d(\d+) .* rank=(\w+)/); return m ? { day: +m[1], rank: m[2] } : null;
  }).filter(Boolean);
  const transitions = [];
  for (let i = 1; i < ww.length; i++) if (ww[i].rank !== ww[i - 1].rank) transitions.push(`d${ww[i].day} ${ww[i - 1].rank}->${ww[i].rank}`);
  const cap = read(path.join(EVIDIR, `journey-scale-r96-capture-${seed}.txt`));
  const natLines = cap.split('\n').filter(s => /National beat staged|governance layer: online|realm came apart|climb starts over|The First Court|The Founding Council|The Binding|The Charter|The Iron Court/i.test(s));
  const trust = readJson(path.join(EVIDIR, `journey-scale-r96-trust-${seed}.json`));
  const c = (trust && trust.census) || {};
  console.log(`Q2 rank transitions: ${transitions.join(' | ') || 'none'}; courtNational answers: ${c.courtNational !== undefined ? c.courtNational : '?'}`);
  for (const l of natLines.slice(0, 20)) console.log(`  NAT: ${l.slice(0, 200)}`);
  // Q4 census
  console.log(`Q4 census: day=${c.day} over=${c.over} pop=${c.popAlive}/${c.popTotal} pantry=${c.pantryKcal} rank=${c.scaleRank} seat=${c.tableSeat} arc=${c.arcNow} waiting=${c.tableWaiting} lead=${c.leadActive}/${c.leadSeasoned} tends=${c.tendPeer} pilgrimages=${c.pilgrimages} studies=${c.climbStudies}`);
  const trustTxt = read(path.join(EVIDIR, `journey-scale-r96-trust-${seed}.txt`)).split('\n').filter(Boolean);
  const peers = {};
  for (const l of trustTxt) { const m = l.match(/^d(\d+) (\S+) (\S+) trust=(\d+) formed=d(\d+)/); if (m) peers[m[3]] = { kind: m[2], trust: +m[4], formed: +m[5], lastDay: +m[1] }; }
  for (const [vid, p] of Object.entries(peers)) console.log(`  peer ${vid} kind=${p.kind} trust=${p.trust} formed=d${p.formed} ageAtLast=${p.lastDay - p.formed}d seasoned=${(p.lastDay - p.formed) >= 30 && p.trust >= 40}`);
}
