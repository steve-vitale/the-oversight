// analyze-gunloss-a.js — analyzer, arm sim-gunloss-a (DIAG, instrument-only).
// Judges the frozen prereg bars against a gunloss re-run corpus:
//   (1) instrument validity (0 instrument errors),
//   (2) reproduction of the frozen cellcheck corpus on seed 107369
//       (omar census rows days 103-134, scholarId series, scholar
//       cells, deaths days 130-136),
//   (3) attribution of the day-134 loss to a SINGLE call path
//       (file + function + day), or UNATTRIBUTED with the exact gap,
//   (4) det-gate (recorder-on vs recorder-off identical on
//       recorder-independent counters),
//   (5) wall numbers for the re-run window.
// Usage:
//   node scripts/analyze-gunloss-a.js --dir evidence/2026-11-22/perseed-gunloss-a-diag \
//     --frozen evidence/2026-11-22/perseed-cellcheck-a-diag/cellcheck-a-s107369-cellcheck-a-diag.json \
//     --out evidence/2026-11-22/gunloss-a-analysis.json
//   node scripts/analyze-gunloss-a.js --detgate <on-file> <off-file>
//   node scripts/analyze-gunloss-a.js --selftest
// Exit 0 = analysis written (verdict is IN the JSON, not the exit
// code — a NO-GO verdict is still a successful analysis).
'use strict';
const fs = require('fs');
const path = require('path');

function loadJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function sameDeath(a, b) {
  return a && b && a.day === b.day && a.kind === b.kind && a.who === b.who &&
    a.cause === b.cause && !!a.player === !!b.player;
}

// ---- attribution core (pure; selftested) ----
// Two measures, kept apart because the question has two parts:
//   packPieces(ev): {gun, cells} that LEFT THE HOLDER'S PACK in one
//     event — the person-side delta only (wrap delta, or splice /
//     reassign before-after). This is what the frozen census measured
//     (omar's pack gun 1->0, cells 2->0 between days 133-134).
//   lossPieces(ev): {gun, cells} NET-destroyed by one event — what
//     left the pack MINUS what the scholar gained in ANY slot
//     (inventory + equipped). A transfer to the scholar is a move,
//     not a loss; a stack that collapses on transfer (2 cells worn
//     as one head item) destroys the difference.
// For splice/reassign events there is no scholar side, so the two
// measures agree (pack loss = net loss).
function packPieces(ev) {
  const out = { gun: 0, cells: 0 };
  try {
    if (!ev || typeof ev !== 'object') return out;
    if (ev.kind === 'wrap' && ev.delta) {
      const d = ev.delta;
      if ((d.gun || 0) < 0) out.gun = -(d.gun || 0);
      if ((d.cells || 0) < 0) out.cells = -(d.cells || 0);
      return out;
    }
    if ((ev.kind === 'splice' || ev.kind === 'reassign') && ev.before && ev.after) {
      if ((ev.after.gun | 0) < (ev.before.gun | 0)) out.gun = (ev.before.gun | 0) - (ev.after.gun | 0);
      if ((ev.after.cells | 0) < (ev.before.cells | 0)) out.cells = (ev.before.cells | 0) - (ev.after.cells | 0);
      return out;
    }
  } catch (e) { /* pure core: never throw on malformed rows */ }
  return out;
}
function lossPieces(ev) {
  const out = { gun: 0, cells: 0 };
  try {
    if (!ev || typeof ev !== 'object') return out;
    if (ev.kind === 'wrap' && ev.delta) {
      const d = ev.delta;
      const pack = packPieces(ev);
      out.gun = Math.max(0, pack.gun - Math.max(0, d.scholarGun || 0));
      out.cells = Math.max(0, pack.cells - Math.max(0, d.scholarCells || 0));
      // A scholar-side loss (scholar inventory/equipped drops with no
      // person gain) is a loss too — e.g. a post-mantle wipe.
      if ((d.scholarGun || 0) < 0 && pack.gun === 0) out.gun = Math.max(out.gun, -(d.scholarGun || 0));
      if ((d.scholarCells || 0) < 0 && pack.cells === 0) out.cells = Math.max(out.cells, -(d.scholarCells || 0));
      return out;
    }
    return packPieces(ev);
  } catch (e) { /* pure core: never throw on malformed rows */ }
  return out;
}
function eventPath(ev) {
  if (ev.kind === 'wrap') return (ev.file || 'unknown-file') + ' :: ' + (ev.fn || 'unknown-fn');
  if (ev.kind === 'splice') {
    const st = String(ev.stack || '');
    const m = st.match(/at\s+(?:[A-Za-z_$][\w$]*\.)?([A-Za-z_$][\w$]*)\s+\(([^)]+)\)/);
    if (m) return m[2] + ' :: ' + m[1];
    return 'splice-tripwire :: ' + (st.split('\n')[0] || '').slice(0, 120);
  }
  if (ev.kind === 'reassign') {
    const st = String(ev.stack || '');
    const m = st.match(/at\s+(?:[A-Za-z_$][\w$]*\.)?([A-Za-z_$][\w$]*)\s+\(([^)]+)\)/);
    const where = m ? (m[2] + ' :: ' + m[1]) : (st.split('\n')[0] || '').slice(0, 120);
    return where + ' [' + (ev.label || '?') + '.' + (ev.prop || '?') + ']';
  }
  return 'unknown';
}
// callerFn(ev): the function that CALLED the wrapped function (or
// performed the splice/reassign), from the event's first stack frame
// — e.g. 'playerDeath' for a mantleBecome called inside playerDeath.
function callerFn(ev) {
  const st = String((ev && ev.stack) || '');
  const m = st.match(/at\s+(?:[A-Za-z_$][\w$]*\.)?([A-Za-z_$][\w$]*)\s+\(/);
  return m ? m[1] : null;
}
// mutationActors(events, day): the functions named by the pack-moving
// splice/reassign rows' stacks on that day — the functions whose OWN
// lines performed the mutations (as opposed to outer spans whose
// pre/post delta merely covers an inner call). On the judged day the
// splices at villager-build.js:648 and the wipe at :701 all name
// mantleBecome; playerDeath's own lines (ledger.js:725/726) moved
// 0 gun/cells (the dead bearer's gear, which held none).
function mutationActors(events, day) {
  const fns = {};
  for (const ev of (events || [])) {
    if (!ev || ev.day !== day) continue;
    if (ev.kind !== 'splice' && ev.kind !== 'reassign') continue;
    const p = packPieces(ev);
    if (p.gun === 0 && p.cells === 0) continue;
    const fn = callerFn(ev);
    if (fn) fns[fn] = (fns[fn] || 0) + 1;
  }
  return Object.keys(fns);
}
// attributeLoss(events, day): the day-134 attribution. Returns
// {verdict: 'ATTRIBUTED'|'UNATTRIBUTED', path, day, fn, file,
//  gunEvents, cellEvents, destination, netLoss, nesting, gap}.
// ATTRIBUTED requires ONE event that takes BOTH the gun and the 2
// cells OUT OF THE HOLDER'S PACK (the day-134 loss is gun -1 AND
// cells -2 from the same holder on the same day, per the frozen
// census). Where the pieces WENT is reported separately in
// `destination` (scholar gains in any slot + the scholar's equipped
// map after the call) and the net destruction in `netLoss` (pack loss
// minus scholar gain — a transfer is a move, a collapsed stack
// destroys the difference). NESTING: a wrap's pre/post delta spans
// everything inside it, so an outer call (playerDeath) shows the
// SAME pack delta as the inner call (mantleBecome) that actually
// moved the pieces. When several both-piece events share the day,
// the splice/reassign backstops decide: the mutation rows name the
// function whose own lines moved the pieces, and the attribution
// goes to that inner call, with the outer span named in `nesting`.
// Anything else is UNATTRIBUTED with the gap named — never a faked
// single path.
function attributeLoss(events, day) {
  const inWindow = (events || []).filter(function (ev) { return ev && ev.day === day; });
  const scored = inWindow.map(function (ev) {
    return { ev: ev, path: eventPath(ev), pieces: packPieces(ev), net: lossPieces(ev) };
  }).filter(function (s) { return s.pieces.gun > 0 || s.pieces.cells > 0; });
  const gunEvents = scored.filter(function (s) { return s.pieces.gun > 0; });
  const cellEvents = scored.filter(function (s) { return s.pieces.cells > 0; });
  const both = scored.filter(function (s) { return s.pieces.gun > 0 && s.pieces.cells > 0; });
  // Candidate ACTORS are the named calls (wraps). Splice/reassign
  // rows are backstop evidence, not rival calls: a splice inside
  // mantleBecome's worn loop moves the same pieces the mantle wrap
  // already accounts for, so it must never block the attribution or
  // be named as an "outer span".
  const wrapBoth = both.filter(function (s) { return s.ev.kind === 'wrap'; });
  const wrapGun = gunEvents.filter(function (s) { return s.ev.kind === 'wrap'; });
  const wrapCell = cellEvents.filter(function (s) { return s.ev.kind === 'wrap'; });
  function attributedResult(b, nesting) {
    const d = (b.ev && b.ev.delta) || {};
    const destination = {
      scholarGun: d.scholarGun || 0, scholarCells: d.scholarCells || 0,
      scholarEquippedAfter: ((b.ev && b.ev.post && b.ev.post.scholar) || {}).equipped || null,
      scholarItemsAfter: ((b.ev && b.ev.post && b.ev.post.scholar) || {}).items || null };
    return { verdict: 'ATTRIBUTED', path: b.path, day: day,
      fn: b.ev.fn || b.ev.kind, file: b.ev.file || null,
      gunEvents: gunEvents.length, cellEvents: cellEvents.length,
      event: b.ev, destination: destination, netLoss: b.net,
      nesting: nesting || null, gap: null };
  }
  if (wrapBoth.length === 1 && wrapGun.length === 1 && wrapCell.length === 1) {
    return attributedResult(wrapBoth[0], null);
  }
  if (wrapBoth.length === 0 && both.length === 1) {
    return attributedResult(both[0], 'no named call wraps the loss; the backstop row is the only evidence');
  }
  if (wrapBoth.length > 1) {
    const actors = mutationActors(events, day);
    const inner = wrapBoth.filter(function (s) { return actors.indexOf(s.ev.fn) !== -1; });
    if (inner.length === 1) {
      const outer = wrapBoth.filter(function (s) { return s !== inner[0]; }).map(function (s) { return s.path; }).join(' | ');
      return attributedResult(inner[0],
        'mutation rows name ' + inner[0].ev.fn + ' (its own lines moved the pieces); outer span(s) ' + outer + ' show the same pack delta because their pre/post snapshot covers the inner call');
    }
  }
  const gaps = [];
  if (gunEvents.length === 0) gaps.push('no event takes the searcaster out of the pack on day ' + day);
  if (cellEvents.length === 0) gaps.push('no event takes the 2 fusion cells out of the pack on day ' + day);
  if (gunEvents.length > 1) gaps.push(gunEvents.length + ' distinct events take the searcaster out of the pack on day ' + day + ': ' + gunEvents.map(function (s) { return s.path; }).join(' | '));
  if (cellEvents.length > 1) gaps.push(cellEvents.length + ' distinct events take cells out of the pack on day ' + day + ': ' + cellEvents.map(function (s) { return s.path; }).join(' | '));
  if (both.length === 0 && gunEvents.length === 1 && cellEvents.length === 1) {
    gaps.push('gun and cells leave the pack by DIFFERENT single calls: gun via ' + gunEvents[0].path + ', cells via ' + cellEvents[0].path);
  }
  if (both.length > 1) gaps.push(both.length + ' events each take gun+cells out of the pack on day ' + day + ': ' + both.map(function (s) { return s.path; }).join(' | '));
  return { verdict: 'UNATTRIBUTED', path: null, day: day, fn: null, file: null,
    gunEvents: gunEvents.length, cellEvents: cellEvents.length,
    event: null, destination: null, netLoss: null, nesting: null,
    gap: gaps.join('; ') || 'no pack-loss events in window' };
}

// ---- reproduction core (pure; selftested) ----
function compareReproduction(fresh, frozen) {
  const diffs = [];
  // omar census rows days 103-134 (rangedId/cells/away/exped)
  const fRows = {};
  for (const r of (frozen.ammoCensus || [])) if (r.vid === 'omar_farouk') fRows[r.day] = r;
  const nRows = {};
  for (const r of (fresh.ammoCensus || [])) if (r.vid === 'omar_farouk') nRows[r.day] = r;
  for (let d = 103; d <= 134; d++) {
    const f = fRows[d], n = nRows[d];
    if (!f) { diffs.push('frozen: no omar census row day ' + d); continue; }
    if (!n) { diffs.push('fresh: no omar census row day ' + d); continue; }
    for (const k of ['rangedId', 'cells', 'away', 'exped']) {
      if ((f[k] === null ? null : f[k]) !== (n[k] === null ? null : n[k])) {
        diffs.push('omar day ' + d + ' ' + k + ': frozen=' + JSON.stringify(f[k]) + ' fresh=' + JSON.stringify(n[k]));
      }
    }
  }
  // scholarId series days 125-136
  const fDaily = {};
  for (const r of (frozen.daily || [])) fDaily[r.day] = r;
  const nDaily = {};
  for (const r of (fresh.daily || [])) nDaily[r.day] = r;
  for (let d = 125; d <= 136; d++) {
    const f = fDaily[d], n = nDaily[d];
    if (!f || !n) { diffs.push('daily row missing day ' + d + ' (frozen=' + !!f + ' fresh=' + !!n + ')'); continue; }
    if (f.scholarId !== n.scholarId) diffs.push('scholarId day ' + d + ': frozen=' + f.scholarId + ' fresh=' + n.scholarId);
  }
  // scholar cells every day (cellPile scholar.cells)
  const fPile = {};
  for (const r of (frozen.cellPile || [])) fPile[r.day] = r;
  const nPile = {};
  for (const r of (fresh.cellPile || [])) nPile[r.day] = r;
  for (const d of Object.keys(fPile)) {
    const f = fPile[d], n = nPile[d];
    if (!n) { diffs.push('fresh: no cellPile row day ' + d); continue; }
    if ((f.scholar || {}).cells !== (n.scholar || {}).cells) {
      diffs.push('scholar cells day ' + d + ': frozen=' + (f.scholar || {}).cells + ' fresh=' + (n.scholar || {}).cells);
    }
  }
  // deaths days 130-136
  const fDeaths = (frozen.deaths || []).filter(function (e) { return e.day >= 130 && e.day <= 136; });
  const nDeaths = (fresh.deaths || []).filter(function (e) { return e.day >= 130 && e.day <= 136; });
  if (fDeaths.length !== nDeaths.length) diffs.push('deaths days 130-136 count: frozen=' + fDeaths.length + ' fresh=' + nDeaths.length);
  for (let i = 0; i < Math.min(fDeaths.length, nDeaths.length); i++) {
    if (!sameDeath(fDeaths[i], nDeaths[i])) {
      diffs.push('death[' + i + '] days 130-136: frozen=' + JSON.stringify(fDeaths[i]) + ' fresh=' + JSON.stringify(nDeaths[i]));
    }
  }
  return diffs;
}

// ---- det-gate core (pure; selftested) ----
// DET_FIELDS are RECORDER-INDEPENDENT game counters only. sayCount
// is deliberately NOT here: the say lines are counted by the
// instrument itself, so the recorder-off leg records 0 by
// construction (on=13836, off=0 on seed 107369) — a counting artifact,
// not a game divergence (deaths/killCalls/fights/casts/spawns/daily
// are all identical across the legs).
const DET_FIELDS = ['days', 'gameDays', 'endReason', 'won', 'over', 'villageLost',
  'scaleRank', 'maxWave', 'unlockedWave', 'standing', 'endPantryKcal'];
function compareDetgate(on, off) {
  const diffs = [];
  for (const k of DET_FIELDS) {
    if (JSON.stringify(on[k]) !== JSON.stringify(off[k])) {
      diffs.push(k + ': on=' + JSON.stringify(on[k]) + ' off=' + JSON.stringify(off[k]));
    }
  }
  const lists = [['deaths', sameDeath], ['killCalls', null], ['fights', null], ['casts', null], ['spawns', null]];
  for (const pair of lists) {
    const k = pair[0], eq = pair[1];
    const a = on[k] || [], b = off[k] || [];
    if (a.length !== b.length) { diffs.push(k + '.length: on=' + a.length + ' off=' + b.length); continue; }
    for (let i = 0; i < a.length; i++) {
      const same = eq ? eq(a[i], b[i]) : (JSON.stringify(a[i]) === JSON.stringify(b[i]));
      if (!same) { diffs.push(k + '[' + i + '] differs: on=' + JSON.stringify(a[i]).slice(0, 200) + ' off=' + JSON.stringify(b[i]).slice(0, 200)); break; }
    }
  }
  const aD = (on.daily || []).length, bD = (off.daily || []).length;
  if (aD !== bD) diffs.push('daily.length: on=' + aD + ' off=' + bD);
  return diffs;
}

function analyzeDir(dir, frozenFile) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('gunloss-a-s') === 0 && f.endsWith('.json'); }).sort();
  if (!files.length) throw new Error('no gunloss corpus files in ' + dir);
  const fresh = loadJson(path.join(dir, files[0]));
  const frozen = loadJson(frozenFile);
  const result = { seed: fresh.seed, anchorCommit: fresh.anchorCommit,
    recorderOn: fresh.recorderOn, files: files };
  // bar 1 — instrument validity
  const errs = fresh.instrumentErrors || [];
  result.bar1Instrument = { errors: errs.length, pass: errs.length === 0 };
  // bar 2 — reproduction
  const reproDiffs = compareReproduction(fresh, frozen);
  result.bar2Reproduction = { diffs: reproDiffs, pass: reproDiffs.length === 0 };
  // bar 3 — attribution (day 134, from the gunloss events)
  const events = fresh.gunlossEvents || [];
  result.gunlossEventCount = events.length;
  result.gunlossCallCounts = fresh.gunlossCallCounts || {};
  result.gunCensusDays = (fresh.gunCensus || []).length;
  const attr = attributeLoss(events, 134);
  result.bar3Attribution = attr;
  // loss window context: events days 133-135, any kind
  result.windowEvents = events.filter(function (ev) { return ev && ev.day >= 133 && ev.day <= 135; })
    .map(function (ev) { return { kind: ev.kind, fn: ev.fn || null, day: ev.day, path: eventPath(ev), pieces: lossPieces(ev) }; });
  // bar 5 — wall numbers (single-seed re-run window)
  result.bar5Wall = { wins: fresh.won ? 1 : 0, seeds: 1, national: (fresh.scaleRank === 'national' || (fresh.scaleRank || '') === 'National') ? 1 : 0,
    table: 'not instrumented', maxWave: fresh.maxWave, unlockedWave: fresh.unlockedWave,
    days: fresh.days, standing: fresh.standing, villageLost: !!fresh.villageLost,
    scaleRank: fresh.scaleRank };
  // verdict
  let verdict;
  if (!result.bar1Instrument.pass) verdict = 'NO-GO';
  else if (!result.bar2Reproduction.pass) verdict = 'REPRODUCTION-FAILED';
  else if (attr.verdict === 'ATTRIBUTED') verdict = 'DIAG-GO';
  else verdict = 'DIAG-GO-UNATTRIBUTED';
  result.verdict = verdict;
  result.bars = { bar1: result.bar1Instrument.pass, bar2: result.bar2Reproduction.pass,
    bar3: attr.verdict, bar5: true };
  return result;
}

function selftest() {
  let passed = 0, failed = 0;
  const fails = [];
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('  PASS ' + name); }
    else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
  }
  // attribution: single mantleBecome wrap losing gun + cells
  const mant = { kind: 'wrap', fn: 'mantleBecome', file: 'src/js/villager-build.js', day: 134,
    delta: { gun: -1, cells: -2, scholarGun: 0, scholarCells: 0, gunEqChanged: true } };
  check('lossPieces: mantle wrap gun+2cells', (function () { const p = lossPieces(mant); return p.gun === 1 && p.cells === 2; })());
  check('packPieces: mantle wrap takes gun+2cells out of the pack', (function () { const p = packPieces(mant); return p.gun === 1 && p.cells === 2; })());
  const a1 = attributeLoss([mant], 134);
  check('attributeLoss: single mantle call ATTRIBUTED', a1.verdict === 'ATTRIBUTED' && a1.fn === 'mantleBecome' && a1.day === 134, JSON.stringify(a1));
  // attribution: transfer to scholar is a MOVE (net loss 0) but still
  // the call that emptied the pack — attribution keys on the pack.
  const transfer = { kind: 'wrap', fn: 'mantleBecome', file: 'src/js/villager-build.js', day: 134,
    delta: { gun: -1, cells: -2, scholarGun: 1, scholarCells: 2, gunEqChanged: true },
    post: { scholar: { equipped: { ranged: 'searcaster' }, items: [{ id: 'fusion_cell', units: 2 }] } } };
  check('lossPieces: mantle transfer to scholar is not a loss', (function () { const p = lossPieces(transfer); return p.gun === 0 && p.cells === 0; })());
  const aT = attributeLoss([transfer], 134);
  check('attributeLoss: transfer still attributes (pack emptied by one call)', aT.verdict === 'ATTRIBUTED' && aT.destination && aT.destination.scholarGun === 1 && aT.destination.scholarCells === 2, JSON.stringify(aT));
  // attribution: the hat collapse — gun to ranged, 1 cell to head,
  // 1 cell destroyed by the worn transfer's unit collapse.
  const collapse = { kind: 'wrap', fn: 'mantleBecome', file: 'src/js/villager-build.js', day: 134,
    delta: { gun: -1, cells: -2, scholarGun: 1, scholarCells: 1, gunEqChanged: true },
    post: { scholar: { equipped: { ranged: 'searcaster', head: 'fusion_cell' }, items: [] } } };
  check('lossPieces: hat collapse destroys exactly 1 cell', (function () { const p = lossPieces(collapse); return p.gun === 0 && p.cells === 1; })());
  const aC = attributeLoss([collapse], 134);
  check('attributeLoss: hat collapse attributes, destination names head', aC.verdict === 'ATTRIBUTED' && aC.netLoss && aC.netLoss.cells === 1 && aC.destination && aC.destination.scholarEquippedAfter && aC.destination.scholarEquippedAfter.head === 'fusion_cell', JSON.stringify(aC));
  // attribution: gun and cells by different calls
  const gunOnly = { kind: 'splice', day: 134, stack: 'at shedGear (src/js/godpath.js:1830:10)', before: { gun: 1, cells: 2 }, after: { gun: 0, cells: 2 } };
  const cellsOnly = { kind: 'wrap', fn: 'fieldFight', file: 'src/js/fieldFights.js', day: 134,
    delta: { gun: 0, cells: -2, scholarGun: 0, scholarCells: 0, gunEqChanged: false } };
  const a2 = attributeLoss([gunOnly, cellsOnly], 134);
  check('attributeLoss: split calls UNATTRIBUTED with gap', a2.verdict === 'UNATTRIBUTED' && /DIFFERENT/.test(a2.gap), a2.gap);
  // attribution: no events
  const a3 = attributeLoss([], 134);
  check('attributeLoss: no events UNATTRIBUTED, gap names both pieces', a3.verdict === 'UNATTRIBUTED' && /searcaster/.test(a3.gap) && /fusion cells/.test(a3.gap), a3.gap);
  // attribution: two events each losing gun+cells
  const a4 = attributeLoss([mant, Object.assign({}, mant, { fn: 'playerDeath', file: 'src/js/ledger.js' })], 134);
  check('attributeLoss: two both-events UNATTRIBUTED', a4.verdict === 'UNATTRIBUTED' && /2 events/.test(a4.gap), a4.gap);
  // attribution: NESTED pair — mantleBecome inside playerDeath, with
  // the splice/reassign backstops naming mantleBecome's own lines.
  // The outer span's identical delta must NOT block the attribution.
  const nestedMant = { kind: 'wrap', fn: 'mantleBecome', file: 'src/js/villager-build.js', day: 134,
    stack: 'at Object.playerDeath (src/js/ledger.js:935:59)',
    delta: { gun: -1, cells: -2, scholarGun: 1, scholarCells: 1, gunEqChanged: true },
    post: { scholar: { equipped: { ranged: 'searcaster', acc3: 'fusion_cell' }, items: [] } } };
  const nestedOuter = { kind: 'wrap', fn: 'playerDeath', file: 'src/js/ledger.js', day: 134,
    stack: 'at Object.tbEnd (src/js/game.js:48315:24)',
    delta: { gun: -1, cells: -2, scholarGun: 1, scholarCells: 1, gunEqChanged: true } };
  const sp1 = { kind: 'splice', day: 134, stack: 'at Object.mantleBecome (src/js/villager-build.js:648:16)', before: { gun: 1, cells: 2 }, after: { gun: 0, cells: 2 } };
  const sp2 = { kind: 'splice', day: 134, stack: 'at Object.mantleBecome (src/js/villager-build.js:648:16)', before: { gun: 0, cells: 2 }, after: { gun: 0, cells: 0 } };
  const re1 = { kind: 'reassign', label: 'omar_farouk', prop: 'items', day: 134, stack: 'at Object.mantleBecome (src/js/villager-build.js:701:36)', before: { len: 7, gun: 1, cells: 2 }, after: { len: 0, gun: 0, cells: 0 } };
  const aN = attributeLoss([nestedMant, nestedOuter, sp1, sp2, re1], 134);
  check('attributeLoss: nested mantle inside playerDeath attributes to mantleBecome',
    aN.verdict === 'ATTRIBUTED' && aN.fn === 'mantleBecome' && /outer span/.test(aN.nesting || ''), JSON.stringify(aN));
  check('attributeLoss: nested destination names acc3 cell slot',
    aN.destination && aN.destination.scholarEquippedAfter && aN.destination.scholarEquippedAfter.acc3 === 'fusion_cell', JSON.stringify(aN.destination));
  check('attributeLoss: nested net loss is 1 cell (collapsed unit)',
    aN.netLoss && aN.netLoss.gun === 0 && aN.netLoss.cells === 1, JSON.stringify(aN.netLoss));
  // attribution: reassign wipe
  const re = { kind: 'reassign', label: 'omar', prop: 'items', day: 134, stack: 'at mantleBecome (src/js/villager-build.js:701:20)',
    before: { len: 5, gun: 1, cells: 2 }, after: { len: 0, gun: 0, cells: 0 } };
  check('lossPieces: reassign wipe gun+2cells', (function () { const p = lossPieces(re); return p.gun === 1 && p.cells === 2; })());
  check('attributeLoss: single reassign ATTRIBUTED', attributeLoss([re], 134).verdict === 'ATTRIBUTED');
  // reproduction: identical fixtures pass
  const mkRow = function (d, ranged, cells) { return { day: d, vid: 'omar_farouk', rangedId: ranged, cells: cells, away: true, exped: false }; };
  const mkDaily = function (d, sid) { return { day: d, scholarId: sid }; };
  const fresh = { ammoCensus: [mkRow(103, 'searcaster', 2), mkRow(133, 'searcaster', 2), mkRow(134, null, 0)],
    daily: [mkDaily(125, 'gen_e478zbq'), mkDaily(134, 'omar_farouk'), mkDaily(136, 'app_x')],
    cellPile: [{ day: 130, scholar: { cells: 0 } }, { day: 134, scholar: { cells: 0 } }],
    deaths: [{ day: 134, kind: 'villager', who: 'gen_e478zbq', cause: 'the arena', player: true }] };
  const frozen = JSON.parse(JSON.stringify(fresh));
  // fill the full 103-134 + 125-136 ranges the comparator reads
  for (let d = 103; d <= 134; d++) {
    if (!fresh.ammoCensus.some(function (r) { return r.day === d; })) {
      fresh.ammoCensus.push(mkRow(d, 'searcaster', 2)); frozen.ammoCensus.push(mkRow(d, 'searcaster', 2));
    }
  }
  for (let d = 125; d <= 136; d++) {
    if (!fresh.daily.some(function (r) { return r.day === d; })) {
      const sid = d < 134 ? 'gen_e478zbq' : (d < 136 ? 'omar_farouk' : 'app_x');
      fresh.daily.push(mkDaily(d, sid)); frozen.daily.push(mkDaily(d, sid));
    }
  }
  check('reproduction: identical fixtures pass', compareReproduction(fresh, frozen).length === 0);
  const fresh2 = JSON.parse(JSON.stringify(fresh));
  fresh2.ammoCensus.find(function (r) { return r.day === 134; }).cells = 2;
  check('reproduction: one changed cell count is a diff', compareReproduction(fresh2, frozen).length === 1, JSON.stringify(compareReproduction(fresh2, frozen)));
  const fresh3 = JSON.parse(JSON.stringify(fresh));
  fresh3.daily.find(function (r) { return r.day === 134; }).scholarId = 'gen_e478zbq';
  check('reproduction: scholarId change is a diff', compareReproduction(fresh3, frozen).length === 1);
  // det-gate: identical passes, one changed field fails
  const on = { days: 145, gameDays: 145, endReason: 'lost', won: false, over: true, villageLost: true,
    scaleRank: 'regional', maxWave: 4, unlockedWave: 4, standing: 199, endPantryKcal: 100, sayCount: 5,
    deaths: [{ day: 1, kind: 'monster', who: 'x', cause: 'c', player: false }], killCalls: [], fights: [], casts: [], spawns: [], daily: [{ day: 1 }] };
  const off = JSON.parse(JSON.stringify(on));
  check('det-gate: identical passes', compareDetgate(on, off).length === 0);
  off.standing = 200;
  check('det-gate: one changed counter is a diff', compareDetgate(on, off).length === 1, JSON.stringify(compareDetgate(on, off)));
  console.log('GUNLOSS_ANALYZER_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('GUNLOSS_ANALYZER_PASSED ' + passed + '/' + (passed + failed));
  return failed;
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exitCode = selftest() ? 1 : 0;
    return;
  }
  if (args.indexOf('--detgate') !== -1) {
    const i = args.indexOf('--detgate');
    const on = loadJson(args[i + 1]), off = loadJson(args[i + 2]);
    const diffs = compareDetgate(on, off);
    console.log(JSON.stringify({ mode: 'detgate', diffs: diffs, pass: diffs.length === 0 }, null, 2));
    process.exitCode = 0;
    return;
  }
  let dir = null, frozen = null, out = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    if (args[i] === '--frozen') frozen = args[++i];
    if (args[i] === '--out') out = args[++i];
  }
  if (!dir || !frozen || !out) {
    console.error('usage: analyze-gunloss-a.js --dir <dir> --frozen <file> --out <file> | --detgate <on> <off> | --selftest');
    process.exit(2);
  }
  const result = analyzeDir(dir, frozen);
  fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ verdict: result.verdict, bar1: result.bars.bar1,
    bar2diffs: result.bar2Reproduction.diffs.length, bar3: result.bar3Attribution.verdict,
    bar3path: result.bar3Attribution.path, events: result.gunlossEventCount,
    out: out }, null, 2));
}

if (require.main === module) main();
module.exports = { lossPieces: lossPieces, packPieces: packPieces,
  eventPath: eventPath,
  attributeLoss: attributeLoss, compareReproduction: compareReproduction,
  compareDetgate: compareDetgate };
