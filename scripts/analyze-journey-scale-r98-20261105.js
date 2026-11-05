// scripts/analyze-journey-scale-r98-20261104.js — journey-scale r96 analyzer.
// Q1: pilgrimage position trace (postrace rows) -> per-trip cause classification.
// Q1b: morning trace (morntrace rows) -> overnight-reset segment classification.
// Q2: national stage/answer/dissolve/re-stage timeline (wantwatch rank + capture).
// Q4: census continuity (trust json + wantwatch/hungerwatch final rows).
// Usage: node scripts/analyze-journey-scale-r98-20261104.js [EVIDIR]
// Defaults: evidence/2026-11-05/journey-scale-r98, seeds 85501-85504.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'evidence', '2026-11-05', 'journey-scale-r98');
const SEEDS = [85501, 85502, 85503, 85504];
function read(p) { try { return fs.readFileSync(p, 'utf8'); } catch (e) { return ''; } }
function readJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } }

for (const seed of SEEDS) {
  console.log(`\n===== SEED ${seed} =====`);
  // Q1 trips from postrace
  const pr = read(path.join(EVIDIR, `journey-scale-r98-postrace-${seed}.txt`)).split('\n').filter(Boolean);
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
  const hw = read(path.join(EVIDIR, `journey-scale-r98-hungerwatch-${seed}.txt`)).split('\n').filter(Boolean);
  const lastHw = hw[hw.length - 1] || '';
  console.log(`Q1 trips: ${trips.length} (postrace rows ${rows.length}); persistence-breaks (walk-in-range then next-day eval out-of-range): ${persistBreaks}`);
  for (const t of trips) {
    const evalDists = t.evals.map(e => e.dist).join(',');
    const walkEnds = t.walks.map(w => w.dist2).join(',');
    console.log(`  trip ${t.vid} d${t.start}->${t.outcome === 'open' ? 'open' : 'd' + t.end + ' ' + t.outcome} evals=${t.evals.length} evalDists=[${evalDists}] walkEnds=[${walkEnds}]`);
  }
  console.log(`  hungerwatch last: ${lastHw}`);
  // Q1b morning trace: overnight-window segment classification (r98 instrument).
  const mr = read(path.join(EVIDIR, `journey-scale-r98-morntrace2-${seed}.txt`)).split('\n').filter(Boolean).map(l => {
    const m = l.match(/^d(\d+) (\w+) at=\((\d+),(\d+)\) hyd=(\S+) pilgrim=(\S+) ret=(\d) packW=(\d+) tile=(\S+) tent=(\d) wx=(\S+) ticks=(\d+) drank=(\d+)(?: dThirst=(\d+) dForage=(\d+) dStanding=(\d+) dDetours=(\d+) dDrank=(\d+))?/);
    if (!m) return null;
    return { day: +m[1], stage: m[2], px: +m[3], py: +m[4], hyd: m[5], pilgrim: m[6] === '-' ? null : m[6], ret: +m[7], packW: +m[8], tile: m[9], tent: +m[10], wx: m[11], ticks: +m[12], drank: +m[13], dThirst: m[14] ? +m[14] : null, dForage: m[15] ? +m[15] : null, dStanding: m[16] ? +m[16] : null, dDetours: m[17] ? +m[17] : null, dDrank: m[18] ? +m[18] : null };
  }).filter(Boolean);
  // target coords per (day, vid) from postrace walks/evals are not in morn rows;
  // recover target from postrace rows: last walk/eval target is not stored in the
  // analyzer's rows, so re-read raw postrace lines for target=(x,y) by day+vid.
  const targetByDayVid = {};
  for (const l of pr) {
    const m = l.match(/^d(\d+) \w+ (\S+) at=\(\d+,\d+\) target=\((\d+),(\d+)\)/);
    if (m) targetByDayVid[m[1] + ':' + m[2]] = { tx: +m[3], ty: +m[4] };
  }
  let prevPostCourt = null, lastEntry = null, resets = [], held = 0, courtMoves = 0;
  for (const r of mr) {
    if (r.stage === 'entry') {
      if (prevPostCourt && prevPostCourt.pilgrim && !(prevPostCourt.px === 4 && prevPostCourt.py === 4) && r.px === 4 && r.py === 4) {
        const tgt = targetByDayVid[(r.day - 1) + ':' + prevPostCourt.pilgrim] || targetByDayVid[r.day + ':' + prevPostCourt.pilgrim] || null;
        resets.push({ day: r.day, vid: prevPostCourt.pilgrim, segment: 'SLEEP-WAITS', from: `(${prevPostCourt.px},${prevPostCourt.py})`, hyd: r.hyd, edge: tgt ? (tgt.tx === 8 || tgt.ty === 8 || tgt.tx === 0 || tgt.ty === 0) : null, tgt: tgt ? `(${tgt.tx},${tgt.ty})` : '?' });
      } else if (prevPostCourt && prevPostCourt.pilgrim && prevPostCourt.px === r.px && prevPostCourt.py === r.py) { held++; }
      lastEntry = r;
    } else if (r.stage === 'postCompetent') {
      if (lastEntry && lastEntry.pilgrim && !(lastEntry.px === 4 && lastEntry.py === 4) && r.px === 4 && r.py === 4) {
        const tgt = targetByDayVid[r.day + ':' + lastEntry.pilgrim] || null;
        resets.push({ day: r.day, vid: lastEntry.pilgrim, segment: 'COMPETENT', from: `(${lastEntry.px},${lastEntry.py})`, hyd: lastEntry.hyd, dThirst: r.dThirst, dForage: r.dForage, dStanding: r.dStanding, dDetours: r.dDetours, edge: tgt ? (tgt.tx === 8 || tgt.ty === 8 || tgt.tx === 0 || tgt.ty === 0) : null, tgt: tgt ? `(${tgt.tx},${tgt.ty})` : '?' });
      }
    } else if (r.stage === 'postCourt') {
      if (lastEntry && (r.px !== lastEntry.px || r.py !== lastEntry.py)) courtMoves++;
      prevPostCourt = r;
    }
  }
  const segCount = {};
  for (const x of resets) segCount[x.segment] = (segCount[x.segment] || 0) + 1;
  console.log(`Q1b morntrace rows=${mr.length} resets=${resets.length} ${JSON.stringify(segCount)} heldNights=${held} courtMoves=${courtMoves}`);
  for (const x of resets) console.log(`  RESET d${x.day} ${x.vid} seg=${x.segment} from=${x.from}->(4,4) target=${x.tgt} edge=${x.edge} hydEntry=${x.hyd}` + (x.dThirst != null ? ` dThirst=${x.dThirst} dForage=${x.dForage} dStanding=${x.dStanding} dDetours=${x.dDetours}` : ''));
  // Q1c drain classifier (r98): every pilgrimage night = postCourt at a target
  // tile -> next entry. drain = postCourt hyd - entry hyd. Attempt number =
  // count of postrace trips to that vid started on/before the postCourt day
  // (1 = first attempt, 2+ = retry after a stale drop). Predicted burn =
  // calories.hydrationBurn: 30 + dayBurn(wx) + floor(ticks/32); dayBurn 18
  // clear / 9 cold / 12 else. Overnight drinks = entry.drank - postCourt.drank
  // (morning upkeep's drinkSafe runs before the entry snapshot).
  const burnPred = (wx, ticks) => 30 + (wx === 'clear' ? 18 : wx === 'cold' ? 9 : 12) + Math.floor((ticks || 0) / 32);
  const nights = [];
  let lastPC = null;
  for (const r of mr) {
    if (r.stage === 'postCourt') { lastPC = r; continue; }
    if (r.stage === 'entry' && lastPC && lastPC.pilgrim) {
      const pc = lastPC;
      const attempt = trips.filter(t => t.vid === pc.pilgrim && t.start <= pc.day).length || 1;
      const drain = (pc.hyd === 'null' || r.hyd === 'null') ? null : (+pc.hyd - +r.hyd);
      nights.push({ day: r.day, vid: pc.pilgrim, attempt, drain, hydOut: pc.hyd, hydIn: r.hyd,
        packWOut: pc.packW, packWIn: r.packW, packDelta: r.packW - pc.packW,
        tile: pc.tile, tent: pc.tent, wx: pc.wx, ticks: pc.ticks,
        burn: burnPred(pc.wx, pc.ticks), drankNight: r.drank - pc.drank,
        pos: `(${pc.px},${pc.py})` });
      lastPC = null;
    }
  }
  const firstN = nights.filter(n => n.attempt === 1);
  const retryN = nights.filter(n => n.attempt >= 2);
  const avg = (a, f) => a.length ? (a.reduce((t, n) => t + (f(n) || 0), 0) / a.length).toFixed(1) : 'n/a';
  console.log(`Q1c nights=${nights.length} first=${firstN.length} (drain avg ${avg(firstN, n => n.drain)}, burn avg ${avg(firstN, n => n.burn)}, packWOut avg ${avg(firstN, n => n.packWOut)}, drankNight avg ${avg(firstN, n => n.drankNight)}) retry=${retryN.length} (drain avg ${avg(retryN, n => n.drain)}, burn avg ${avg(retryN, n => n.burn)}, packWOut avg ${avg(retryN, n => n.packWOut)}, drankNight avg ${avg(retryN, n => n.drankNight)})`);
  for (const n of nights) console.log(`  NIGHT d${n.day} ${n.vid} att=${n.attempt} drain=${n.drain} (${n.hydOut}->${n.hydIn}) burn~${n.burn} packW ${n.packWOut}->${n.packWIn} (d${n.packDelta}) tile=${n.tile} tent=${n.tent} wx=${n.wx} ticks=${n.ticks} drankNight=${n.drankNight} pos=${n.pos}`);
  // Q2 national timeline
  const ww = read(path.join(EVIDIR, `journey-scale-r98-wantwatch-${seed}.txt`)).split('\n').filter(Boolean).map(l => {
    const m = l.match(/^d(\d+) .* rank=(\w+)/); return m ? { day: +m[1], rank: m[2] } : null;
  }).filter(Boolean);
  const transitions = [];
  for (let i = 1; i < ww.length; i++) if (ww[i].rank !== ww[i - 1].rank) transitions.push(`d${ww[i].day} ${ww[i - 1].rank}->${ww[i].rank}`);
  const cap = read(path.join(EVIDIR, `journey-scale-r98-capture-${seed}.txt`));
  const natLines = cap.split('\n').filter(s => /National beat staged|governance layer: online|realm came apart|climb starts over|The First Court|The Founding Council|The Binding|The Charter|The Iron Court/i.test(s));
  const trust = readJson(path.join(EVIDIR, `journey-scale-r98-trust-${seed}.json`));
  const c = (trust && trust.census) || {};
  console.log(`Q2 rank transitions: ${transitions.join(' | ') || 'none'}; courtNational answers: ${c.courtNational !== undefined ? c.courtNational : '?'}`);
  for (const l of natLines.slice(0, 20)) console.log(`  NAT: ${l.slice(0, 200)}`);
  // Q4 census
  console.log(`Q4 census: day=${c.day} over=${c.over} pop=${c.popAlive}/${c.popTotal} pantry=${c.pantryKcal} rank=${c.scaleRank} seat=${c.tableSeat} arc=${c.arcNow} waiting=${c.tableWaiting} lead=${c.leadActive}/${c.leadSeasoned} tends=${c.tendPeer} pilgrimages=${c.pilgrimages} studies=${c.climbStudies}`);
  const trustTxt = read(path.join(EVIDIR, `journey-scale-r98-trust-${seed}.txt`)).split('\n').filter(Boolean);
  const peers = {};
  for (const l of trustTxt) { const m = l.match(/^d(\d+) (\S+) (\S+) trust=(\d+) formed=d(\d+)/); if (m) peers[m[3]] = { kind: m[2], trust: +m[4], formed: +m[5], lastDay: +m[1] }; }
  for (const [vid, p] of Object.entries(peers)) console.log(`  peer ${vid} kind=${p.kind} trust=${p.trust} formed=d${p.formed} ageAtLast=${p.lastDay - p.formed}d seasoned=${(p.lastDay - p.formed) >= 30 && p.trust >= 40}`);
}
