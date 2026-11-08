// scripts/analyze-journey-scale-r110-20261107.js — journey-scale r109 analyzer
// (r103 analyzer + nat-gate section), single leg: the before/after
// comparison is REMOVED (r110 is a DIAG, one leg) and a feast-chain
// section is added (Q1: per-seed stage table S0–S7 from the daily
// feastchain rows + the wrapper event logs).
// Q1: pilgrimage position trace (postrace rows) -> per-trip cause classification.
// Q1b: morning trace (morntrace rows) -> overnight-reset segment classification.
// Q2: national stage/answer/dissolve/re-stage timeline (wantwatch rank + capture).
// Q4: census continuity (trust json + wantwatch/hungerwatch final rows).
// Usage: node scripts/analyze-journey-scale-r110-20261107.js [EVIDIR] [PREFIX]
// Defaults: evidence/2026-11-07/journey-scale-r110, PREFIX journey-scale-r110, seeds 97001-97004.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'evidence', '2026-11-07', 'journey-scale-r110');
const PREFIX = process.argv[3] || 'journey-scale-r110'; // arm run passes the same prefix; only EVIDIR changes
const SEEDS = [97001, 97002, 97003, 97004];
const _REGGATE = require('./regionalstep-instrument-20261107'); // r107 Q1: same classifyGate rule as the recorder (require, not a copy)
function read(p) { try { return fs.readFileSync(p, 'utf8'); } catch (e) { return ''; } }
function readJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } }
// Q1 nat-gate classifier (r103): names the blocking gate for one daily
// natGateWatch row, mirroring hierarchy.js _checkNational + the four
// polity candidates. STAGE-EXPECTED means a candidate exists, the rung is
// ready, nothing is deferred, yet no beat is pending — the beat should stage
// at the next day boundary, so a single day is expected and only persistence
// (see summarizeNatGate's max-run count) is a signal.
function classifyNatGate(r) {
  if (!r || typeof r.day !== 'number') return 'BAD-ROW';
  if (r.nationalLive) return 'STAGED';
  if (r.pendingShape) return 'PENDING:' + r.pendingShape;
  if (r.scaleRefused) return 'REFUSED';
  if (r.exiled) return 'EXILED';
  if (!r.rungReady) return 'RUNG';
  const cands = [];
  if (r.leadPolity) cands.push(r.leadPolity.shape || 'lead');
  if (r.belongPolity) cands.push(r.belongPolity.shape || 'belong');
  if (r.covPolity) cands.push(r.covPolity.shape || 'covenant');
  if (r.tradePolity) cands.push(r.tradePolity.shape || 'trade');
  if (!cands.length) return 'NO-SHAPE';
  const deferred = cands.filter(s => (r.defer || {})[s] != null && (r.defer || {})[s] > r.day);
  if (deferred.length === cands.length) return 'DEFERRED:' + deferred.join('+');
  if (deferred.length) return 'DEFERRED-PARTIAL:' + deferred.join('+') + '|open:' + cands.filter(s => !deferred.includes(s)).join('+');
  return 'STAGE-EXPECTED:' + cands.join('+');
}
function summarizeNatGate(rows) {
  const counts = {};
  for (const r of (rows || [])) { const g = classifyNatGate(r); counts[g] = (counts[g] || 0) + 1; }
  let run = 0, maxRun = 0;
  for (const r of (rows || [])) { if (classifyNatGate(r).startsWith('STAGE-EXPECTED')) { run++; maxRun = Math.max(maxRun, run); } else run = 0; }
  return { counts, stageExpectedMaxRun: maxRun, rows: (rows || []).length };
}


function main() {
  for (const seed of SEEDS) {
    console.log(`\n===== SEED ${seed} =====`);
    // Q1 trips from postrace
    const pr = read(path.join(EVIDIR, `${PREFIX}-postrace-${seed}.txt`)).split('\n').filter(Boolean);
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
    const hw = read(path.join(EVIDIR, `${PREFIX}-hungerwatch-${seed}.txt`)).split('\n').filter(Boolean);
    const lastHw = hw[hw.length - 1] || '';
    console.log(`Q1 trips: ${trips.length} (postrace rows ${rows.length}); persistence-breaks (walk-in-range then next-day eval out-of-range): ${persistBreaks}`);
    for (const t of trips) {
      const evalDists = t.evals.map(e => e.dist).join(',');
      const walkEnds = t.walks.map(w => w.dist2).join(',');
      console.log(`  trip ${t.vid} d${t.start}->${t.outcome === 'open' ? 'open' : 'd' + t.end + ' ' + t.outcome} evals=${t.evals.length} evalDists=[${evalDists}] walkEnds=[${walkEnds}]`);
    }
    console.log(`  hungerwatch last: ${lastHw}`);
    // Q1b morning trace: overnight-window segment classification (r99 instrument).
    const mr = read(path.join(EVIDIR, `${PREFIX}-morntrace3-${seed}.txt`)).split('\n').filter(Boolean).map(l => {
      const m = l.match(/^d(\d+) (\w+) at=\((\d+),(\d+)\) hyd=(\S+) pilgrim=(\S+) ret=(\d) packW=(\d+) tile=(\S+) tent=(\d) wx=(\S+) ticks=(\d+) drank=(\d+) packKg=(\S+) cap=(\S+) cist=(\S+)\/(\S+) top=(\S+)(?: dThirst=(\d+) dForage=(\d+) dStanding=(\d+) dDetours=(\d+) dDrank=(\d+))?/);
      if (!m) return null;
      const num = (x) => (x === 'null' || x === 'undefined' || x === '-') ? null : +x;
      return { day: +m[1], stage: m[2], px: +m[3], py: +m[4], hyd: m[5], pilgrim: m[6] === '-' ? null : m[6], ret: +m[7], packW: +m[8], tile: m[9], tent: +m[10], wx: m[11], ticks: +m[12], drank: +m[13], packKg: num(m[14]), carryCap: num(m[15]), cistClean: num(m[16]), cistDirty: num(m[17]), packTop: m[18], dThirst: m[19] ? +m[19] : null, dForage: m[20] ? +m[20] : null, dStanding: m[21] ? +m[21] : null, dDetours: m[22] ? +m[22] : null, dDrank: m[23] ? +m[23] : null };
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
    // Q1c drain classifier (r98, carried): every pilgrimage night = postCourt at a target
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
    // Q1 walk-out classifier (r99, binding): walk-out day D = entry at Haven
    // (4,4) + postCourt away from Haven with a pilgrim set. FIRST vs RETRY:
    // RETRY if any earlier postrace trip to that vid ended without study.
    // Candidates at entry AND postCompetent: cistern clean liters, pack room
    // floor(cap - kg), packW. Corroboration: the day's water-refusal lines.
    const waterLines = read(path.join(EVIDIR, `${PREFIX}-water-${seed}.txt`)).split('\n').filter(Boolean).map(l => {
      const m = l.match(/^d(\d+) \[([\w-]+)\]/); return m ? { day: +m[1], cls: m[2] } : null;
    }).filter(Boolean);
    const byDayStage = {};
    for (const r of mr) byDayStage[r.day + ':' + r.stage] = r;
    const walkouts = [];
    const daysSeen = [...new Set(mr.map(r => r.day))].sort((a, b) => a - b);
    for (const d of daysSeen) {
      const entry = byDayStage[d + ':entry'], pc = byDayStage[d + ':postCourt'], pm = byDayStage[d + ':postCompetent'];
      if (!entry || !pc || !pc.pilgrim) continue;
      if (!(entry.px === 4 && entry.py === 4)) continue;
      if (pc.px === 4 && pc.py === 4) continue;
      const retry = trips.some(t => t.vid === pc.pilgrim && t.end != null && t.end < d && t.outcome !== 'study');
      const roomAt = (r) => (r && r.carryCap != null && r.packKg != null) ? Math.floor(r.carryCap - r.packKg) : null;
      const refusals = waterLines.filter(w => w.day === d).map(w => w.cls);
      walkouts.push({ day: d, vid: pc.pilgrim, attempt: retry ? 'RETRY' : 'FIRST',
        packWEntry: entry.packW, packWOut: pc.packW,
        cistEntry: entry.cistClean, cistMid: pm ? pm.cistClean : null,
        roomEntry: roomAt(entry), roomMid: roomAt(pm),
        packKgEntry: entry.packKg, capEntry: entry.carryCap, topEntry: entry.packTop,
        refusals: refusals.length ? refusals.join(',') : '-' });
    }
    const firstW = walkouts.filter(w => w.attempt === 'FIRST'), retryW = walkouts.filter(w => w.attempt === 'RETRY');
    console.log(`Q1 walkouts=${walkouts.length} FIRST=${firstW.length} RETRY=${retryW.length}`);
    for (const w of walkouts) console.log(`  WALKOUT d${w.day} ${w.vid} ${w.attempt} packW ${w.packWEntry}->${w.packWOut} cist entry=${w.cistEntry} mid=${w.cistMid} room entry=${w.roomEntry} mid=${w.roomMid} packKg=${w.packKgEntry} cap=${w.capEntry} top=[${w.topEntry}] refusals=${w.refusals}`);
    // Q1b rain catch (r99, report-only): overnight packW increases (entry
    // packW > previous postCourt packW) with tile/weather — rain addWater
    // vs Haven/creek fill.
    let lastPC2 = null;
    const gains = [];
    for (const r of mr) {
      if (r.stage === 'postCourt') { lastPC2 = r; continue; }
      if (r.stage === 'entry' && lastPC2 && lastPC2.day === r.day - 1 && r.packW > lastPC2.packW) gains.push({ day: r.day, vid: lastPC2.pilgrim || '-', delta: r.packW - lastPC2.packW, fromTile: lastPC2.tile, atTile: r.tile, wxEntry: r.wx, wxPC: lastPC2.wx, pos: `(${lastPC2.px},${lastPC2.py})->(${r.px},${r.py})` });
    }
    console.log(`Q1b overnight packW gains=${gains.length}`);
    for (const g of gains) console.log(`  GAIN d${g.day} ${g.vid} +${g.delta} tile ${g.fromTile}->${g.atTile} wx ${g.wxPC}->${g.wxEntry} pos=${g.pos}`);
    // Q1 count (r102, pre-registered — REVISED DRY-vs-WET gate from the
    // r99 metric review, judged arm-vs-control in the run note): walk-outs
    // split on postCourt packW — DRY (0), PARTIAL (1), WET (>=2). The
    // analyzer prints the counts only; the cross-quad verdict (PASS /
    // INSUFFICIENT-DATA / PARTIAL / FAIL per the r102 prereg) is computed
    // in the run note from the control and arm analyzer outputs. The
    // FIRST-vs-RETRY cut is NOT the judge this run. Fill counters from
    // the trust-json census show whether the arm fired.
    const dryW = walkouts.filter(w => w.packWOut === 0);
    const partialW = walkouts.filter(w => w.packWOut === 1);
    const wetW = walkouts.filter(w => w.packWOut >= 2);
    console.log(`Q1 GATE: dry=${dryW.length} partial=${partialW.length} wet=${wetW.length} walkouts=${walkouts.length} (cross-quad verdict in run note)`);
    for (const w of dryW) console.log(`  DRY SURVIVOR d${w.day} ${w.vid} ${w.attempt} packW ${w.packWEntry}->${w.packWOut} cist entry=${w.cistEntry} mid=${w.cistMid} room entry=${w.roomEntry} mid=${w.roomMid} refusals=${w.refusals}`);
    // Fill-arm counters (r102; skip counters prove the narrowed gate):
    // from the trust-json census for this seed.
    const fillTrust = readJson(path.join(EVIDIR, `${PREFIX}-trust-${seed}.json`));
    const fillC = (fillTrust && fillTrust.census) || {};
    console.log(`Q1 FILL: fillTopUps=${fillC.fillTopUps !== undefined ? fillC.fillTopUps : '?'} fillTopUpLiters=${fillC.fillTopUpLiters !== undefined ? fillC.fillTopUpLiters : '?'} fillUnloads=${fillC.fillUnloads !== undefined ? fillC.fillUnloads : '?'} fillSkipStudy=${fillC.fillSkipStudy !== undefined ? fillC.fillSkipStudy : '?'} fillSkipFull=${fillC.fillSkipFull !== undefined ? fillC.fillSkipFull : '?'}`);
    // Q2 national timeline
    const ww = read(path.join(EVIDIR, `${PREFIX}-wantwatch-${seed}.txt`)).split('\n').filter(Boolean).map(l => {
      const m = l.match(/^d(\d+) .* rank=(\w+)/); return m ? { day: +m[1], rank: m[2] } : null;
    }).filter(Boolean);
    const transitions = [];
    for (let i = 1; i < ww.length; i++) if (ww[i].rank !== ww[i - 1].rank) transitions.push(`d${ww[i].day} ${ww[i - 1].rank}->${ww[i].rank}`);
    const cap = read(path.join(EVIDIR, `${PREFIX}-capture-${seed}.txt`));
    const natLines = cap.split('\n').filter(s => /National beat staged|governance layer: online|realm came apart|climb starts over|The First Court|The Founding Council|The Binding|The Charter|The Iron Court/i.test(s));
    const trust = readJson(path.join(EVIDIR, `${PREFIX}-trust-${seed}.json`));
    const c = (trust && trust.census) || {};
    console.log(`Q2 rank transitions: ${transitions.join(' | ') || 'none'}; courtNational answers: ${c.courtNational !== undefined ? c.courtNational : '?'}`);
    for (const l of natLines.slice(0, 20)) console.log(`  NAT: ${l.slice(0, 200)}`);
    // Q1 nat-gate (r103): daily staging-gate classification from the trust-json
    // census natGateWatch rows (full objects — no txt parsing). Days per gate +
    // closest shape at the last blocking day + first-qualify day per shape.
    const ngRows = ((trust && trust.census && trust.census.natGateWatch) || []);
    const ngSum = summarizeNatGate(ngRows);
    const _firstQual = {};
    for (const _r of ngRows) {
      const _pols = [['lead', _r.leadPolity], ['belong', _r.belongPolity], ['covenant', _r.covPolity], ['trade', _r.tradePolity]];
      for (const [_s, _pol] of _pols) if (_pol && _firstQual[_s] == null) _firstQual[_s] = _r.day;
    }
    console.log(`Q1 NATGATE: rows=${ngSum.rows} gates=${JSON.stringify(ngSum.counts)} firstQual=${JSON.stringify(_firstQual)} stageExpectedMaxRun=${ngSum.stageExpectedMaxRun}`);
    const _lastNg = ngRows[ngRows.length - 1] || null;
    if (_lastNg) {
      const _lg = classifyNatGate(_lastNg);
      const _daysToRung = (_lastNg.networkLiveDay == null) ? 'never-regional' : ((_lastNg.networkLiveDay + 30) - _lastNg.day);
      console.log(`  NATGATE last: d${_lastNg.day} gate=${_lg} rank=${_lastNg.rank} rung=${_lastNg.rungReady} (daysToRung=${_daysToRung}) lead=${_lastNg.leadSeasoned}/${_lastNg.leadActive} cov=${_lastNg.covSeasoned}/${_lastNg.covActive} trade=${_lastNg.tradeSeasoned}/${_lastNg.tradeActive} belong=${_lastNg.belong ? (_lastNg.belong.other + ':t' + _lastNg.belong.trust + '/a' + _lastNg.belong.arrears + '/age' + _lastNg.belong.age + '/realm' + _lastNg.belong.realm + '/good' + (_lastNg.belong.good ? 1 : 0)) : '-'} foreignMax=${_lastNg.foreignMax} pend=${_lastNg.pendingShape || '-'} defer=${JSON.stringify(_lastNg.defer)}`);
    }
    // Q4 census
    console.log(`Q4 census: day=${c.day} over=${c.over} pop=${c.popAlive}/${c.popTotal} pantry=${c.pantryKcal} rank=${c.scaleRank} seat=${c.tableSeat} arc=${c.arcNow} waiting=${c.tableWaiting} lead=${c.leadActive}/${c.leadSeasoned} tends=${c.tendPeer} pilgrimages=${c.pilgrimages} studies=${c.climbStudies}`);
    const trustTxt = read(path.join(EVIDIR, `${PREFIX}-trust-${seed}.txt`)).split('\n').filter(Boolean);
    const peers = {};
    for (const l of trustTxt) { const m = l.match(/^d(\d+) (\S+) (\S+) trust=(\d+) formed=d(\d+)/); if (m) peers[m[3]] = { kind: m[2], trust: +m[4], formed: +m[5], lastDay: +m[1] }; }
    for (const [vid, p] of Object.entries(peers)) console.log(`  peer ${vid} kind=${p.kind} trust=${p.trust} formed=d${p.formed} ageAtLast=${p.lastDay - p.formed}d seasoned=${(p.lastDay - p.formed) >= 30 && p.trust >= 40}`);
    // R107 Q1 REGGATE: regional-gate decomposition from the recorder corpus.
    const _reg = readJson(path.join(EVIDIR, `${PREFIX}-regional-${seed}.json`));
    const _regDaily = (_reg && _reg.daily) || [];
    const _regTally = {};
    _regDaily.forEach(d => { const g = ((_REGGATE.classifyGate(d) || {}).gate || d.gate || '?'); _regTally[g] = (_regTally[g] | 0) + 1; });
    const _noReg = _regDaily.filter(d => (d.scale || 'village') === 'village' && !d.networkLive).length;
    const _tl = { known: null, courtshipReady: null, attempt: null, counter: null, link: null, accord: null, regional: null };
    _regDaily.forEach(d => {
      if (_tl.known == null && ((d.knownCount | 0)) > 0) _tl.known = d.day;
      if (_tl.courtshipReady == null && d.bestDet != null && (d.bestDet + 10) >= 35) _tl.courtshipReady = d.day;
      if (_tl.attempt == null && (((d.proposeCalls | 0)) > 0 || ((d.acceptLinkRaiseCalls | 0)) > 0)) _tl.attempt = d.day;
      if (_tl.counter == null && ((d.proposeCounter | 0)) > 0) _tl.counter = d.day;
      if (_tl.link == null && ((d.activeLinks | 0)) > 0) _tl.link = d.day;
      if (_tl.accord == null && (d.firstAccordDay != null)) _tl.accord = d.firstAccordDay;
      if (_tl.regional == null && d.networkLive) _tl.regional = d.day;
    });
    const _last = _regDaily[_regDaily.length - 1] || {};
    console.log(`Q1 REGGATE: rows=${_regDaily.length} noRegional=${_noReg} gates=${JSON.stringify(_regTally)} timeline=${JSON.stringify(_tl)} propose=${_last.proposeCalls | 0} raisesAcc=${_last.acceptLinkRaiseCalls | 0} counters=${_last.proposeCounter | 0} links=${_last.activeLinks | 0}/${_last.everLinks | 0} errors=${((_reg && _reg.instrumentErrors) || []).length}`);
    const _att = ((_reg && _reg.regionalAttempts) || []);
    _att.slice(0, 20).forEach(a => console.log(`  ATTEMPT d${a.day} ${a.call} -> ${a.target || '-'} = ${a.result}`));
    // R110 Q1 FEAST-CHAIN: per-seed stage table S0–S7 from the daily rows
    // + the wrapper event logs. The stall stage is the first stage never
    // reached; the verdict (FINDING / CHAIN-COMPLETES / INCOMPLETE) is
    // judged in the run note from these tables.
    const fcRows = read(path.join(EVIDIR, `${PREFIX}-feastchain-${seed}.txt`)).split('\n').filter(Boolean).map(l => {
      const m = l.match(/^d(\d+) sentiment=(\d) slot60=(\d) keeps=(\d+|null) res=(\d+) l3=(\d+|null) armed=([\d.]+) reactor=(\d) pantry=(\d+) gives=(\d+|null) feastDay=(\S+) feasts=(\d+)\/(\d+) devChan=(\d+) feasted=(\d) buffUsed=(\d) buffUntil=(\S+) surgeUsed=(\d) plan=(\S+) cost=(\S+) have=(\S+)$/);
      if (!m) return null;
      const num = (x) => (x === 'null' || x === '-' || x === undefined) ? null : +x;
      return { day: +m[1], sentiment: +m[2] === 1, slot60: +m[3] === 1, keeps: num(m[4]), res: +m[5], l3: num(m[6]), armed: +m[7], reactor: +m[8] === 1, pantry: +m[9], gives: num(m[10]), feastDay: num(m[11]), feasts: +m[12], surplusFeasts: +m[13], devChan: +m[14], feasted: +m[15] === 1, buffUsed: +m[16] === 1, buffUntil: num(m[17]), surgeUsed: +m[18] === 1, plan: m[19], planCost: num(m[20]), planHave: num(m[21]) };
    }).filter(Boolean);
    const fcEv = read(path.join(EVIDIR, `${PREFIX}-feastevents-${seed}.txt`)).split('\n').filter(Boolean);
    const feastCalls = fcEv.filter(l => / FEAST /.test(l));
    const grants = fcEv.filter(l => / GRANT /.test(l));
    const channels = fcEv.filter(l => / CHANNEL /.test(l));
    const deeds = fcEv.filter(l => / DEED-MARKED/.test(l));
    const fights = fcEv.filter(l => / FIGHT /.test(l));
    const fcErrs = fcEv.filter(l => / INSTRUMENT-ERROR /.test(l));
    const firstDay = (pred) => { const r = fcRows.find(pred); return r ? r.day : null; };
    const firstEvDay = (list) => { if (!list.length) return null; const m = list[0].match(/^d(\d+)/); return m ? +m[1] : null; };
    const maxRes = fcRows.reduce((m, r) => Math.max(m, r.res | 0), 0);
    const maxL3 = fcRows.reduce((m, r) => Math.max(m, r.l3 | 0), 0);
    const keepsDays = fcRows.filter(r => (r.keeps | 0) > 0).length;
    const feastedDays = fcRows.filter(r => r.feasted).length;
    const reactorDays = fcRows.filter(r => r.reactor).length;
    const givesByDay = {}; fcRows.forEach(r => { if (r.gives != null) givesByDay[r.day] = r.gives; });
    let maxGives7 = 0, gives7Days = 0;
    for (const r of fcRows) { const g0 = givesByDay[r.day - 7]; if (r.gives != null && g0 != null) { const d = r.gives - g0; if (d > maxGives7) maxGives7 = d; if (d >= 1500) gives7Days++; } }
    const planNo = {};
    for (const r of fcRows) if (r.plan !== 'ok') planNo[r.plan] = (planNo[r.plan] || 0) + 1;
    const topPlanNo = Object.entries(planNo).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => k + 'x' + v).join(', ') || '-';
    const grantRefWhy = {};
    for (const l of grants) { const m = l.match(/granted=0 why=(\S+)/); if (m) grantRefWhy[m[1]] = (grantRefWhy[m[1]] || 0) + 1; }
    const topRef = Object.entries(grantRefWhy).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => k + 'x' + v).join(', ') || '-';
    const grantsOk = grants.filter(l => /granted=1/.test(l)).length;
    const feastOk = feastCalls.filter(l => /ok=1/.test(l)).length;
    const fightsFeasted = fights.filter(l => /feasted=1/.test(l)).length;
    const s0 = firstDay(r => r.sentiment), s0b = firstDay(r => r.slot60);
    const s1 = firstDay(r => (r.keeps | 0) > 0);
    const s2 = firstDay(r => r.armed > 0);
    const s3 = firstEvDay(feastCalls);
    const s4 = grantsOk ? firstEvDay(grants.filter(l => /granted=1/.test(l))) : null;
    const s5 = firstDay(r => r.feasted);
    const s6 = firstEvDay(deeds);
    const s7 = firstDay(r => r.surgeUsed);
    // Stall order (r110 metric review): the deed/surge checks come BEFORE
    // the feasted-days check — a seed whose feaster dies the same day they
    // mark the deed (97004: feast+grant+fight+deed+death all on d98, the
    // successor's snapshot reads feasted=0) completed the chain even though
    // no daily snapshot ever caught the window live. S5-window means grants
    // with no deed AND no feasted day observed; S6-use means a window was
    // observed but no deed marked.
    const stall = s0 == null ? 'S0-lesson' : s1 == null ? 'S1-keepsake' : s2 == null ? 'S2-arming' : feastCalls.length === 0 ? 'S3-feast' : grantsOk === 0 ? 'S4-grant' : deeds.length === 0 ? (feastedDays === 0 ? 'S5-window' : 'S6-use') : s7 == null ? 'S7-seat' : 'COMPLETE';
    console.log(`Q1 FEASTCHAIN: rows=${fcRows.length} errs=${fcErrs.length} stall=${stall}`);
    console.log(`  S0 lesson d${s0 == null ? '-' : s0} slot60 d${s0b == null ? '-' : s0b} | S1 keepsake d${s1 == null ? '-' : s1} keepsDays=${keepsDays} | S2 maxRes=${maxRes}/35 maxL3=${maxL3} armed d${s2 == null ? '-' : s2} channels=${channels.length}`);
    console.log(`  S3 feasts ok=${feastOk}/${feastCalls.length} first d${s3 == null ? '-' : s3} maxGives7=${maxGives7} gives7okDays=${gives7Days} planNo: ${topPlanNo}`);
    console.log(`  S4 grants=${grantsOk}/${grants.length} first d${s4 == null ? '-' : s4} refusals: ${topRef} | S5 feastedDays=${feastedDays} first d${s5 == null ? '-' : s5} | S6 fights=${fights.length} feasted=${fightsFeasted} deeds=${deeds.length} d${s6 == null ? '-' : s6} | S7 surgeUsed d${s7 == null ? '-' : s7} reactorDays=${reactorDays}`);
    for (const l of fcErrs.slice(0, 5)) console.log(`  INSTRUMENT-ERROR: ${l}`);
  }
}


if (require.main === module) { main(); }
module.exports = { classifyNatGate, summarizeNatGate };
