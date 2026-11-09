// scripts/analyze-journey-scale-r113-20261109.js — journey-scale r112 analyzer
// cloned, PLUS two r113 sections (TRADE ROAD + WILD W4) and the Q3
// re-scope (lesser seat PRICED, not taken — the pilot addendum defers
// the lesser sit, SEATDRIVE=0, so "won" is unmeasurable by design).
// Q1: pilgrimage position trace (postrace rows) -> per-trip cause classification.
// Q1b: morning trace (morntrace rows) -> overnight-reset segment classification.
// Q2: national stage/answer/dissolve/re-stage timeline (wantwatch rank + capture).
// Q4: census continuity (trust json + wantwatch/hungerwatch final rows).
// TRADE: per-seed trade-road step table (proposals/links/seasoned/staged/sealed/
// delivered) + trade-link trust trajectories (the seasoning wall's mechanism).
// WILD: villager wave-4+ field fights by outcome (the wild-w4 question).
// Usage: node scripts/analyze-journey-scale-r113-20261109.js [EVIDIR] [PREFIX]
// Defaults: evidence/2026-11-09/journey-scale-r113, PREFIX journey-scale-r113, seeds 97901-97904.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'evidence', '2026-11-09', 'journey-scale-r113');
const PREFIX = process.argv[3] || 'journey-scale-r113'; // arm run passes the same prefix; only EVIDIR changes
const SEEDS = [97901, 97902, 97903, 97904];
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
    // R113 Q1 LADDER: per-seed ladder table from the daily rows + the
    // wrapper event logs. The stall stage is the highest stage reached;
    // the verdict (OPENS / PARTIAL / STALLS / INCOMPLETE) is judged in
    // the run note from these tables.
    const parseLadderRow = (l) => {
      const g = (re) => { const m = l.match(re); return m ? m[1] : null; };
      const n = (x) => (x === null || x === '-' || x === undefined) ? null : +x;
      const day = n(g(/^d(\d+)/));
      if (day == null) return null;
      const tr = l.match(/fight=(\d+) forage=(\d+) craft=(\d+) talk=(\d+) explore=(\d+)/);
      const ct = l.match(/cfight=(\d+) cforage=(\d+) ccraft=(\d+) ctalk=(\d+) cexplore=(\d+)/);
      const det = l.match(/led=(\d+) fXp=(\d+) cXp=(\d+) links=(\d+) cont=(\d+) disc=(\d+) brd=(\d+) aLinks=(\d+) bb=(\d+) bStages=\[([^\]]*)\](?: banked=(\d+))?/);
      const caps = l.match(/caps: trade_charter=([^,]+),feast_embassy=([^,]+),military_tribute=(\S+)/);
      const mech = l.match(/vets=(\S+) charterLinks=(\S+) bundle=(\S+)/);
      // R113 attribution columns (trailing, after seat — seat is no
      // longer end-of-line): scholar vid, sentiment taught, killAttr.
      const attr = l.match(/ scholar=(\S+) sent=(\S+)(?: kAttr=w4:(\d+)\/sch:(\d+)\/vil:(\d+)\/null:(\d+)\/dist:(\d+)\/liv:(\d+))?/);
      return {
        day,
        stage: n(g(/ stage=(\d+)/)), peakStage: n(g(/ peak=(\d+)/)),
        counted: n(g(/ counted=(\d+)/)), cap: n(g(/ cap=(\d+)/)),
        nextThreshold: n(g(/ next=(\S+)/)), shortfall: n(g(/ short=(\d+)/)),
        tracks: tr ? { fight: +tr[1], forage: +tr[2], craft: +tr[3], talk: +tr[4], explore: +tr[5] } : null,
        countedTracks: ct ? { fight: +ct[1], forage: +ct[2], craft: +ct[3], talk: +ct[4], explore: +ct[5] } : null,
        capped: (() => { const c = g(/ capped=\[([^\]]*)\]/); return c ? c.split(',').filter(Boolean) : []; })(),
        detail: det ? { fightLedger: +det[1], fieldXp: +det[2], craftXp: +det[3], links: +det[4], contests: +det[5], discovery: +det[6], breadth: +det[7], activeLinks: +det[8], bundleBonus: +det[9], bundleStages: det[10] ? det[10].split(',').filter(Boolean).map(x => +x) : [], bankedHeadStart: det[11] != null ? +det[11] : 0 } : null,
        caps: caps ? { trade_charter: caps[1], feast_embassy: caps[2], military_tribute: caps[3] } : null,
        mech: mech ? { vets: n(mech[1]), charterLinks: n(mech[2]), bundle: n(mech[3]) } : null,
        delivered: g(/ delivered=(\S+)/),
        seat: g(/ seat=(\S+)/),
        scholarVid: attr ? (attr[1] === '-' ? null : attr[1]) : null,
        sentimentTaught: attr ? (attr[2] === '-' ? null : attr[2] === '1') : null,
        killAttr: attr && attr[3] != null ? { w4total: +attr[3], w4scholar: +attr[4], w4villager: +attr[5], w4null: +attr[6], w4distinctVillagers: +attr[7], w4livingVillagers: +attr[8] } : null,
      };
    };
    const ladRows = read(path.join(EVIDIR, `${PREFIX}-ladder-${seed}.txt`)).split('\n').filter(Boolean).map(parseLadderRow).filter(Boolean);
    const ladEv = read(path.join(EVIDIR, `${PREFIX}-ladderevents-${seed}.txt`)).split('\n').filter(Boolean);
    const deliveries = ladEv.filter(l => / DELIVER /.test(l));
    const ladFights = ladEv.filter(l => / FIGHT /.test(l));
    const ladErrs = ladEv.filter(l => / INSTRUMENT-ERROR /.test(l));
    const firstDay = (pred) => { const r = ladRows.find(pred); return r ? r.day : null; };
    const s1 = firstDay(r => (r.stage | 0) >= 1);
    const s2 = firstDay(r => (r.stage | 0) >= 2);
    const s3 = firstDay(r => (r.stage | 0) >= 3);
    const peak = ladRows.reduce((m, r) => Math.max(m, (r.peakStage | 0)), 0);
    const last = ladRows[ladRows.length - 1] || null;
    const readyDay = {};
    for (const k of ['trade_charter', 'feast_embassy', 'military_tribute']) {
      const r = ladRows.find(x => x.caps && x.caps[k] === 'ready');
      readyDay[k] = r ? r.day : null;
    }
    const notReadyReason = {};
    for (const k of ['trade_charter', 'feast_embassy', 'military_tribute']) {
      const r = last && last.caps ? last.caps[k] : null;
      notReadyReason[k] = (r && r !== 'ready') ? r : null;
    }
    const delivOk = deliveries.filter(l => /ok=1/.test(l));
    const delivFirst = delivOk.length ? (() => { const m = delivOk[0].match(/^d(\d+) DELIVER (\S+)/); return m ? { day: +m[1], kind: m[2] } : null; })() : null;
    const seatLesser = firstDay(r => r.seat === 'lesser' || r.seat === 'full');
    const seatFull = firstDay(r => r.seat === 'full');
    const fightsByWave = {};
    for (const l of ladFights) { const m = l.match(/wave=(\d+)/); if (m) fightsByWave[m[1]] = (fightsByWave[m[1]] | 0) + 1; }
    const maxVets = ladRows.reduce((m, r) => Math.max(m, (r.mech && r.mech.vets != null) ? r.mech.vets : 0), 0);
    const endMech = last && last.mech ? last.mech : null;
    const stall = peak >= 3 ? 'NATIONAL' : (peak === 2 ? 'STALL@Regional' : (peak === 1 ? 'STALL@Village' : 'STALL@Unranked'));
    console.log(`Q1 LADDER: rows=${ladRows.length} errs=${ladErrs.length} peak=${peak} verdict-seed=${stall}`);
    console.log(`  stages: Village d${s1 == null ? '-' : s1} | Regional d${s2 == null ? '-' : s2} | National d${s3 == null ? '-' : s3}`);
    if (last) console.log(`  end: d${last.day} counted=${last.counted} short=${last.shortfall} cap=${last.cap} tracks=${JSON.stringify(last.tracks)} countedTracks=${JSON.stringify(last.countedTracks)} capped=[${last.capped.join(',')}] detail=${JSON.stringify(last.detail)}`);
    console.log(`  capstones ready: charter d${readyDay.trade_charter == null ? '-' : readyDay.trade_charter} (last: ${notReadyReason.trade_charter || 'ready'}) | embassy d${readyDay.feast_embassy == null ? '-' : readyDay.feast_embassy} (last: ${notReadyReason.feast_embassy || 'ready'}) | tribute d${readyDay.military_tribute == null ? '-' : readyDay.military_tribute} (last: ${notReadyReason.military_tribute || 'ready'})`);
    console.log(`  mechanism: maxVets=${maxVets} endMech=${endMech ? JSON.stringify(endMech) : '-'}`);
    console.log(`  deliveries: ${delivOk.length}/${deliveries.length} ok` + (delivFirst ? ` first=${delivFirst.kind}@d${delivFirst.day}` : '') + ` | seat: lesser d${seatLesser == null ? '-' : seatLesser} full d${seatFull == null ? '-' : seatFull} | fights=${ladFights.length} byWave=${JSON.stringify(fightsByWave)}`);
    for (const l of deliveries) console.log(`  DELIVER: ${l}`);
    for (const l of ladErrs.slice(0, 5)) console.log(`  INSTRUMENT-ERROR: ${l}`);
    // R113 Q1 VETERAN WALL: attribute every wave-4+ kill from the
    // vetkill corpus (waveKillLog wave>=3 + scholarVidsByDay) with the
    // day-joined rule (classifyKill from the instrument — same function
    // the proof test covers), then join each distinct villager killer
    // to its fate from the census deathLog (a killer with no death
    // entry is alive at end — the telemetry deathLog is the run's own
    // death record; a missing entry is read as alive, never assumed
    // dead). The mechanism bars (WALL-SCHOLAR / WALL-MORTALITY /
    // WALL-THIN / MIXED) are judged in the run note from these numbers.
    const _LI = require('./ladder-instrument-20261109');
    const _vet = readJson(path.join(EVIDIR, `${PREFIX}-vetkill-${seed}.json`));
    const _wkl = (_vet && _vet.waveKillLog) || [];
    const _svd = (_vet && _vet.scholarVidsByDay) || {};
    // Killer fates: death DAY from the instrument's daily death watch
    // (the telemetry deathLog is a 300-event ring — early deaths fall
    // out of it, so it is used ONLY for the cause, keyed by vid);
    // alive-at-end from the end roster's dead flags (a killer removed
    // from the roster, e.g. paid as tribute, is not alive for the
    // tribute's purposes; a killer with no death entry and no roster
    // entry is reported as GONE, never silently alive).
    const _deaths = ((trust && trust.census && trust.census.deathLog) || []);
    const _causeByVid = {};
    for (const _d of ((_vet && _vet.deaths) || [])) { if (_d && _d.vid != null && _d.cause != null && _causeByVid[_d.vid] == null) _causeByVid[_d.vid] = _d.cause; }
    for (const _d of _deaths) { if (_d && _d.who != null && _causeByVid[_d.who] == null) _causeByVid[_d.who] = _d.cause || null; }
    const _deathDayByVid = {};
    for (const _d of ((_vet && _vet.deaths) || [])) { if (_d && _d.vid != null && _deathDayByVid[_d.vid] == null) _deathDayByVid[_d.vid] = _d.day; }
    const _rosterDead = {};
    for (const _r of ((_vet && _vet.finalRoster) || [])) { if (_r && _r.vid != null) _rosterDead[_r.vid] = _r.dead; }
    const _w4 = _wkl.filter(e => e && ((e.w | 0) >= 4));
    const _cls = { scholar: 0, villager: 0, unknown: 0 };
    const _killers = {};
    for (const _e of _w4) {
      const _c = _LI.classifyKill(_e.by, _svd[String(_e.d)], _svd[String((_e.d | 0) - 1)]);
      _cls[_c] = (_cls[_c] | 0) + 1;
      if (_c === 'villager') {
        const _k = _killers[_e.by] || (_killers[_e.by] = { vid: _e.by, kills: 0, firstDay: _e.d, lastDay: _e.d, vias: {} });
        _k.kills++; _k.firstDay = Math.min(_k.firstDay, _e.d); _k.lastDay = Math.max(_k.lastDay, _e.d);
        _k.vias[_e.via || 'unknown'] = (_k.vias[_e.via || 'unknown'] | 0) + 1;
      }
    }
    const _killerList = Object.values(_killers);
    let _deadKillers = 0, _diedOnKillDay = 0;
    const _killToDeath = [];
    for (const _k of _killerList) {
      const _dd = _deathDayByVid[_k.vid];
      const _onRoster = Object.prototype.hasOwnProperty.call(_rosterDead, _k.vid);
      _k.deathDay = (_dd != null) ? _dd : null;
      _k.deathCause = (_causeByVid[_k.vid] != null) ? _causeByVid[_k.vid] : null;
      _k.alive = (_dd == null) && _onRoster && _rosterDead[_k.vid] === false;
      _k.gone = !_onRoster;
      if (_dd != null) {
        _deadKillers++;
        if (_dd === _k.lastDay || _dd === _k.firstDay) _diedOnKillDay++;
        _killToDeath.push(_dd - _k.lastDay);
      }
    }
    _killToDeath.sort((a, b) => a - b);
    const _med = _killToDeath.length ? _killToDeath[Math.floor(_killToDeath.length / 2)] : null;
    const _sentDay = firstDay(r => r.sentimentTaught === true);
    const _lastKillAttr = last && last.killAttr ? last.killAttr : null;
    console.log(`Q1 VETERAN: w4kills=${_w4.length} scholar=${_cls.scholar} villager=${_cls.villager} unknown=${_cls.unknown} (null-share=${_w4.length ? (_cls.unknown / _w4.length).toFixed(2) : '-'})`);
    console.log(`  distinct villager killers=${_killerList.length} dead=${_deadKillers} alive=${_killerList.length - _deadKillers} diedOnKillDay=${_diedOnKillDay} medianDaysLastKillToDeath=${_med == null ? '-' : _med} maxLivingVets=${maxVets} killAttrEnd=${_lastKillAttr ? JSON.stringify(_lastKillAttr) : '-'}`);
    console.log(`  channels: ${JSON.stringify(_vet ? (_vet.waveKillByChannel || {}) : {})}`);
    for (const _k of _killerList.sort((a, b) => b.kills - a.kills)) console.log(`  KILLER ${_k.vid} kills=${_k.kills} d${_k.firstDay}-d${_k.lastDay} ${ _k.alive ? 'ALIVE' : (_k.gone ? 'GONE-from-roster' : ('DEAD d' + _k.deathDay + ' ' + (_k.deathCause || 'cause-?')))} vias=${JSON.stringify(_k.vias)}`);
    console.log(`  sentimentTaught day: ${_sentDay == null ? 'never' : 'd' + _sentDay} (lesser priced d${seatLesser == null ? '-' : seatLesser})`);
    // Trust rows (parsed once here; the SEASONING section below reuses
    // them): daily per-link trust snapshots from the trust txt.
    const _trustRows = read(path.join(EVIDIR, `${PREFIX}-trust-${seed}.txt`)).split('\n').filter(Boolean).map(l => {
      const m = l.match(/^d(\d+) (\S+) (\S+) trust=(\d+) formed=d(\d+)/); return m ? { day: +m[1], kind: m[2], other: m[3], trust: +m[4], formed: +m[5] } : null;
    }).filter(Boolean);
    // R113 Q1 TRADE ROAD: per-seed step table from the traderoad corpus
    // (daily snapshots + beat answers). The mechanism bars
    // (CHARTER-SEALED / WALL-PROPOSE / WALL-SEASON / WALL-BEAT /
    // WALL-SEAL / MIXED) are judged in the run note from these tables.
    const _tr = readJson(path.join(EVIDIR, `${PREFIX}-traderoad-${seed}.json`));
    const _trDaily = (_tr && _tr.daily) || [];
    const _trBeats = (_tr && _tr.beatAnswers) || [];
    const _wild = (_tr && _tr.wildFights) || [];
    const _firstTradeDay = (() => { const r = _trDaily.find(x => (x.trN | 0) >= 1); return r ? r.day : null; })();
    const _maxTrade = _trDaily.reduce((m, x) => Math.max(m, (x.trN | 0)), 0);
    const _maxTrSeasoned = _trDaily.reduce((m, x) => Math.max(m, (x.trSeasoned | 0)), 0);
    const _firstSeasoned3 = (() => { const r = _trDaily.find(x => (x.trSeasoned | 0) >= 3); return r ? r.day : null; })();
    const _maxSubs = _trDaily.reduce((m, x) => Math.max(m, (x.subs | 0)), 0);
    const _trErrs = ((_tr && _tr.instrumentErrors) || []).length;
    const _charterBeat = _trBeats.find(b => b.shape === 'trade');
    const _covWalks = _trBeats.filter(b => b.shape === 'covenant' && b.how === 'walk').length;
    const _sealedDay = (() => { const r = _trDaily.find(x => (x.charteredLinks | 0) >= 1); return r ? r.day : null; })();
    const _subCapSkips = (c.linkraise && c.linkraise.raisesSkippedSubCap != null) ? c.linkraise.raisesSkippedSubCap : (fillC.linkraise ? fillC.linkraise.raisesSkippedSubCap : '?');
    console.log(`Q1 TRADE: rows=${_trDaily.length} errs=${_trErrs} firstTrade=${_firstTradeDay == null ? '-' : 'd' + _firstTradeDay} maxTrade=${_maxTrade} maxSeasoned=${_maxTrSeasoned} seasoned3=${_firstSeasoned3 == null ? '-' : 'd' + _firstSeasoned3} maxSubs=${_maxSubs} subCapSkips=${_subCapSkips} covWalks=${_covWalks} charterStaged=${_charterBeat ? 'd' + _charterBeat.day + ' (' + _charterBeat.how + ')' : '-'} sealed=${_sealedDay == null ? '-' : 'd' + _sealedDay} beats=[${_trBeats.map(b => b.shape + ':' + b.how + '@d' + b.day).join(',') || '-'}]`);
    // Trade-link trust trajectories (the seasoning wall's mechanism):
    // per trade link, max trust, days at/above the 40 bar, and any dip
    // below 40 AFTER first seasoning (the flicker that un-seasons).
    const _tradeLinks = {};
    for (const _r of _trustRows) { if (_r.kind === 'trade') { (_tradeLinks[_r.other] || (_tradeLinks[_r.other] = [])).push(_r); } }
    for (const [_vid, _rows] of Object.entries(_tradeLinks)) {
      const _maxT = _rows.reduce((m, r) => Math.max(m, r.trust), 0);
      const _daysGe40 = _rows.filter(r => r.trust >= 40).length;
      const _first40 = _rows.find(r => r.trust >= 40);
      const _firstSeasoned = _rows.find(r => ((r.day - r.formed) >= 30) && r.trust >= 40);
      let _flicker = null;
      if (_firstSeasoned) {
        const _after = _rows.filter(r => r.day > _firstSeasoned.day && r.trust < 40);
        if (_after.length) _flicker = 'd' + _after[0].day + ' (trust ' + _after[0].trust + ')';
      }
      console.log(`  TRADE-LINK ${_vid} formed=d${_rows[0].formed} maxTrust=${_maxT} daysGe40=${_daysGe40} firstTrust40=${_first40 ? 'd' + _first40.day : '-'} firstSeasoned=${_firstSeasoned ? 'd' + _firstSeasoned.day : '-'} flicker=${_flicker || '-'} lastTrust=${_rows[_rows.length - 1].trust}`);
    }
    // R113 Q2 WILD W4: villager wave-4+ field fights by outcome. A
    // villager-class call vs a wave-4+ monster IS a reach; a fight
    // outcome (not evade) IS a face. The bars (FACES / REACHES-AVOIDS /
    // NEVER-REACHES / MIXED) are judged in the run note from these
    // counts. Scholar-class calls and the w1-3 baseline are printed
    // alongside so a zero is a real zero, not a blind watch.
    const _vw4 = _wild.filter(f => f.cls === 'villager' && (f.wave | 0) >= 4);
    const _vw4By = {};
    for (const f of _vw4) _vw4By[f.outcome || '?'] = (_vw4By[f.outcome || '?'] | 0) + 1;
    const _vw4Rounds = _vw4.filter(f => f.rounds != null).map(f => f.rounds);
    const _vw4MedRounds = _vw4Rounds.length ? _vw4Rounds.slice().sort((a, b) => a - b)[Math.floor(_vw4Rounds.length / 2)] : null;
    const _sw4 = _wild.filter(f => f.cls === 'scholar' && (f.wave | 0) >= 4);
    const _vw13By = {};
    for (const f of _wild.filter(f => f.cls === 'villager' && (f.wave | 0) >= 1 && (f.wave | 0) <= 3)) _vw13By[f.outcome || '?'] = (_vw13By[f.outcome || '?'] | 0) + 1;
    const _firstW4 = _vw4.length ? Math.min.apply(null, _vw4.map(f => f.day)) : null;
    const _faces = _vw4.filter(f => ['vKill', 'vDie', 'vFlee', 'mFlee'].includes(f.outcome)).length;
    console.log(`Q2 WILDW4: wildFights=${_wild.length} villW4=${_vw4.length} firstW4=${_firstW4 == null ? '-' : 'd' + _firstW4} byOutcome=${JSON.stringify(_vw4By)} faces=${_faces} medianRounds=${_vw4MedRounds == null ? '-' : _vw4MedRounds} scholarW4=${_sw4.length} villW1-3=${JSON.stringify(_vw13By)}`);
    for (const f of _vw4.filter(f => f.outcome === 'vKill' || f.outcome === 'vDie')) console.log(`  WILDW4 ${f.outcome} d${f.day} ${f.vid || '-'} ${f.mid || '?'} w${f.wave} rounds=${f.rounds == null ? '-' : f.rounds}`);
    // R113 Q2 SEASONING: first seasoned day per link from the trust rows
    // (parsed above; seasoned = 30+ days old AND trust 40+ — the
    // ladder's _linkSeasoned rule, conquered links excepted here
    // because the trust rows carry no conquered flag; the count is
    // the courtship-seasoning count, and any conquered link would
    // only make it look better, never worse).
    const _byLink = {};
    for (const _r of _trustRows) { const _k = _r.other + '|' + _r.kind; (_byLink[_k] || (_byLink[_k] = [])).push(_r); }
    const _seasoned = [];
    for (const [_k, _rows] of Object.entries(_byLink)) {
      const _first = _rows.find(_r => ((_r.day - _r.formed) >= 30) && _r.trust >= 40);
      const _lastR = _rows[_rows.length - 1];
      _seasoned.push({ link: _k, formed: _rows[0].formed, firstSeasonedDay: _first ? _first.day : null, lastTrust: _lastR.trust, lastAge: _lastR.day - _lastR.formed });
    }
    const _nSeasoned = _seasoned.filter(s => s.firstSeasonedDay != null).length;
    console.log(`Q2 SEASONING: links=${_seasoned.length} everSeasoned=${_nSeasoned} verdict-seed=${_nSeasoned > 0 ? 'SEASONS' : 'STILL-WALLED'}`);
    for (const _s of _seasoned) console.log(`  LINK ${_s.link} formed=d${_s.formed} firstSeasoned=${_s.firstSeasonedDay == null ? 'never' : 'd' + _s.firstSeasonedDay} lastTrust=${_s.lastTrust} lastAge=${_s.lastAge}d`);
  }
}


if (require.main === module) { main(); }
module.exports = { classifyNatGate, summarizeNatGate };
