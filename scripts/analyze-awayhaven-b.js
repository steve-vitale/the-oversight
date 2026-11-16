// analyze-awayhaven-b.js — classifier for arm sim-awayhaven-b (DIAG).
// Resolves the 18 away-while-at-Haven member-dawn rows (9 distinct
// members) from the poolmarginals instrument leg: per-member day-by-day
// away flag + node + activity traces, one frozen class each.
// Requires the poolmarginals analyzer (not copied): reuses its
// classifyMarginals (pool-row validity + the agree check) and
// summarizeMarginals (wall numbers), then classifies from the raw
// pool rows' members arrays joined to the classified dawns and the
// driver's awayTrace daily snapshots.
// Frozen definitions: evidence/2026-11-16/sim-awayhaven-b-prereg.md.
// Classes: (a) linger-after-return, (b) non-spatial absence,
// (c) recorder / node-read artifact, (d) other-with-evidence.
// UNRESOLVED is counted separately and must name the missing hook.
// Usage:
//   node scripts/analyze-awayhaven-b.js <instrumentDir> [controlDir]
// Writes evidence/2026-11-16/awayhaven-b-analysis.json. Exits 0 iff
// every instrument-leg flagged member is classified (a)-(d),
// UNRESOLVED is 0 or fully hook-named, all files parse, and no
// instrument errors.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const PM = require(path.join(REPO, 'scripts', 'analyze-poolmarginals-b.js'));

const W4_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
const W4_SET = new Set(W4_IDS_FROZEN);

function loadDir(dir) {
  const out = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return { bySeed: out, files: files };
}
function round(x, n) { return Math.round(x * Math.pow(10, n)) / Math.pow(10, n); }
function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function atHaven(node, haven) {
  return !!(node && haven && node.nx === haven.nx && node.ny === haven.ny);
}

// extractFlagged(j): distinct members flagged away while their node
// reads Haven, over the marginal-classified dawns only (the same
// denominator the poolmarginals marginal table uses). Returns a list
// of {seed, id, name, profile, engaged, onExped, trust, flagDays,
// flagRows} where flagDays are the dawn days and flagRows carry the
// pool row context (holder vid, target, node) per flag day.
function extractFlagged(j) {
  const base = PM.classifyMarginals(j);
  const byKey = {};
  for (const r of (j.companionPool || [])) {
    if (r && r.vid != null && r.day != null) byKey[r.vid + '|' + r.day + '|' + (r.target || '')] = r;
  }
  const found = {};
  for (const dawn of base.poolDawns) {
    if (!dawn.marginalClassified) continue;
    const row = byKey[dawn.vid + '|' + dawn.day + '|' + (dawn.target || '')] || null;
    if (!row || !Array.isArray(row.members)) continue;
    for (const m of row.members) {
      if (!m || m.firstFail !== 'away' || m.away !== true) continue;
      if (!atHaven(m.node, row.haven)) continue;
      const key = j.seed + '|' + m.id;
      if (!found[key]) {
        found[key] = { seed: j.seed, id: m.id, name: null, profile: m.profile,
          engaged: m.engaged, onExped: m.onExped, trust: m.trust,
          flagDays: [], flagRows: [] };
      }
      found[key].flagDays.push(dawn.day);
      found[key].flagRows.push({ day: dawn.day, holderVid: dawn.vid, target: dawn.target,
        node: m.node, profile: m.profile, engaged: m.engaged, onExped: m.onExped, trust: m.trust });
    }
  }
  const list = Object.values(found);
  for (const f of list) {
    f.flagDays.sort(function (a, b) { return a - b; });
    f.flagRows.sort(function (a, b) { return a.day - b.day; });
  }
  return { classified: base, flagged: list };
}

// buildTrace(j, memberId): the member's full awayTrace series, sorted
// by day. The trace is end-of-day state; the pool row is dawn state,
// so a flag day's trace row may already show a same-day return — the
// classifier reads the spell, not a single row.
function buildTrace(j, memberId) {
  const rows = ((j.awayTrace || []).filter(function (r) { return r && r.id === memberId; }));
  rows.sort(function (a, b) { return a.day - b.day; });
  return rows;
}

// classifyMember(rows, flagDays, haven): the frozen classification.
// rows: full trace series for the member. flagDays: sorted dawn days
// where the pool flagged the member away-at-Haven. haven: {nx, ny}.
// Returns {cls, evidence, window, spell, details}.
//   (a) linger-after-return — the node was off-Haven during the away
//       spell, came back to Haven, and a flag day falls >=1 day after
//       that node-return day.
//   (b) non-spatial absence — the node NEVER left Haven during the
//       spell and the away record's destination IS Haven (departure
//       to a Haven target / expedition to the Haven tile): the flag
//       marks a trip whose destination is home, not a spatial absence.
//   (c) recorder / node-read artifact — no trace spell covers any
//       flag day and the trace is complete on those days: the pool
//       row's away read disagrees with the daily record.
//   (d) other, with evidence — a coherent mechanism visible in the
//       trace that is neither (a) nor (b) (e.g. departure recorded to
//       an off-Haven target but the node never moved; expedition
//       record ended without clearing the away flag).
//   UNRESOLVED — the trace cannot decide; missingHook names what
//       would decide it.
function classifyMember(rows, flagDays, haven) {
  const firstFlag = flagDays[0];
  const lastFlag = flagDays[flagDays.length - 1];
  const defaultStart = firstFlag - 5;
  const defaultEnd = lastFlag + 5;
  if (!rows.length) {
    return { cls: 'UNRESOLVED', missingHook: 'no awayTrace rows for this member at all',
      evidence: 'trace series empty; cannot tell whether the member was away, at Haven, or neither',
      window: { start: defaultStart, end: defaultEnd, widened: false }, spell: null, details: {} };
  }
  const byDay = {};
  for (const r of rows) byDay[r.day] = r;
  // Trace completeness on the flag days.
  const missingFlagDays = flagDays.filter(function (d) { return !byDay[d]; });
  if (missingFlagDays.length) {
    return { cls: 'UNRESOLVED', missingHook: 'awayTrace gap on flag day(s) ' + missingFlagDays.join(','),
      evidence: 'no trace row on the flagged dawn(s); the spell boundaries cannot be read',
      window: { start: defaultStart, end: defaultEnd, widened: false }, spell: null, details: { missingFlagDays: missingFlagDays } };
  }
  // Spells: maximal runs of consecutive away===true trace days.
  const spells = [];
  let cur = null;
  for (const r of rows) {
    if (r.away === true) {
      if (!cur || r.day !== cur.end + 1) {
        cur = { start: r.day, end: r.day, days: [r.day] };
        spells.push(cur);
      } else { cur.end = r.day; cur.days.push(r.day); }
    } else cur = null;
  }
  // The spell(s) covering at least one flag day. A flag day one past
  // a spell's end is a SAME-DAY RETURN: the member was away at dawn
  // (when the pool read them) and came home during that day, so the
  // end-of-day trace already shows them home. The spell covers it in
  // the dawn sense; it is not an artifact.
  const covering = spells.filter(function (sp) {
    return flagDays.some(function (d) { return d >= sp.start && d <= sp.end + 1; });
  });
  if (!covering.length) {
    // No spell covers any flag day: the daily record says the member
    // was NOT away around those dawns. Same-day depart+return inside
    // one flag day is still possible in principle — check the away
    // record's sinceDay on the nearest spell: if a later spell starts
    // after the last flag day with sinceDay > lastFlag, the flag
    // predates any departure the trace knows; if an earlier spell
    // ended before the first flag day, the flag postdates it. Either
    // way the pool row and the daily record disagree.
    const flagAway = flagDays.map(function (d) { return { day: d, away: byDay[d].away, node: byDay[d].node }; });
    return { cls: '(c)', evidence: 'pool row flags the member away-at-Haven on day(s) ' + flagDays.join(',') +
        ' but the daily trace shows away=false on every flag day (end-of-day) with no away spell covering any of them; ' +
        'nearest spells: ' + JSON.stringify(spells.map(function (sp) { return [sp.start, sp.end]; })) +
        '; flag-day trace reads: ' + JSON.stringify(flagAway),
      window: { start: defaultStart, end: defaultEnd, widened: false }, spell: null,
      details: { flagAway: flagAway, spells: spells.map(function (sp) { return [sp.start, sp.end]; }) } };
  }
  // One spell per member in practice; take the spell covering the
  // FIRST flag day (a second covering spell would be a re-departure
  // inside the flag run — reported, not merged).
  const spell = covering[0];
  const spellRows = rows.filter(function (r) { return r.day >= spell.start && r.day <= spell.end; });
  const otherCovering = covering.slice(1).map(function (sp) { return [sp.start, sp.end]; });
  // Flag days covered only by the same-day-return grace (day == end+1).
  const graceDays = flagDays.filter(function (d) { return d === spell.end + 1; });
  // Return day: first trace day after the spell with away===false.
  let returnDay = null;
  for (const r of rows) {
    if (r.day > spell.end && r.away !== true) { returnDay = r.day; break; }
  }
  // Window: default ±5, widened to cover the whole spell when the
  // departure or the return falls outside it.
  let wStart = defaultStart, wEnd = defaultEnd, widened = false, widenNote = null;
  if (spell.start < wStart) { wStart = spell.start; widened = true; }
  if (spell.end > wEnd) { wEnd = spell.end; widened = true; }
  if (widened) widenNote = 'window widened to cover the away spell ' + spell.start + '-' + spell.end;
  // Node trajectory during the spell.
  let everOffHaven = false;
  let nodeReturnDay = null;
  for (const r of spellRows) {
    if (r.node && !atHaven(r.node, haven)) everOffHaven = true;
    if (nodeReturnDay == null && everOffHaven && r.node && atHaven(r.node, haven)) nodeReturnDay = r.day;
  }
  // The away record on the first flag day INSIDE the spell (a grace
  // flag day is the return day itself — its trace row already shows
  // the flag cleared, so read the record off the last spell day).
  const recDay = flagDays.find(function (d) { return d >= spell.start && d <= spell.end; }) || spell.end;
  const flagRow = byDay[recDay];
  const awayRec = (flagRow && flagRow.awayRaw) || null;
  const expedRec = (flagRow && flagRow.exped) || null;
  const objRec = (flagRow && flagRow.objective) || null;
  // Did the expedition record exist earlier in the spell but vanish
  // while the flag stayed set?
  let expedVanished = false;
  let expedFirstDay = null, expedLastDay = null;
  for (const r of spellRows) {
    if (r.exped) { if (expedFirstDay == null) expedFirstDay = r.day; expedLastDay = r.day; }
  }
  if (expedFirstDay != null && expedRec == null) expedVanished = true;
  const details = {
    spell: [spell.start, spell.end],
    otherCoveringSpells: otherCovering,
    graceDays: graceDays,
    returnDay: returnDay,
    everOffHaven: everOffHaven, nodeReturnDay: nodeReturnDay,
    awayRec: awayRec, expedOnFlagDay: expedRec, objectiveOnFlagDay: objRec,
    expedRange: expedFirstDay != null ? [expedFirstDay, expedLastDay] : null,
    expedVanished: expedVanished,
    flagDays: flagDays.slice(),
  };
  const window = { start: wStart, end: wEnd, widened: widened, widenNote: widenNote };
  // (a) linger-after-return: node came back to Haven during the spell
  // and a flag day falls >=1 day after that node-return day.
  if (nodeReturnDay != null) {
    const lateFlags = flagDays.filter(function (d) { return d >= nodeReturnDay + 1; });
    if (lateFlags.length) {
      return { cls: '(a)', evidence: 'node left Haven during the away spell (days ' + spell.start + '-' + spell.end +
          ', purpose ' + ((awayRec && awayRec.purpose) || 'unknown') + '), walked back to Haven on day ' + nodeReturnDay +
          ', and the flag was still set on flag day(s) ' + lateFlags.join(',') + ' — ' +
          (lateFlags[0] - nodeReturnDay) + ' day(s) after the return; the flag cleared on day ' +
          (returnDay != null ? returnDay : ('after ' + spell.end)) + ' when the away clock expired' +
          (graceDays.length ? '; flag day(s) ' + graceDays.join(',') + ' are same-day returns (away at dawn, home by end of day)' : ''),
        window: window, spell: [spell.start, spell.end], details: details };
    }
  }
  // (b) non-spatial absence: the node NEVER left Haven during the
  // spell, and the away record's destination IS Haven.
  if (!everOffHaven) {
    const destHaven = awayRec && awayRec.nx != null && awayRec.ny != null &&
      awayRec.nx === haven.nx && awayRec.ny === haven.ny;
    const expedDestHaven = expedRec && expedRec.tx != null && expedRec.ty != null &&
      expedRec.tx === haven.nx && expedRec.ty === haven.ny;
    if (destHaven || expedDestHaven) {
      const state = expedDestHaven ? 'expedition to the Haven tile' :
        ('objective departure to a Haven target (purpose ' + ((awayRec && awayRec.purpose) || 'unknown') + ')');
      return { cls: '(b)', evidence: 'node never left Haven during the away spell (days ' + spell.start + '-' + spell.end +
          '); the away record itself points at Haven (' + state + ', away.nx,ny=' +
          ((awayRec && awayRec.nx) != null ? awayRec.nx + ',' + awayRec.ny : 'null') +
          (expedDestHaven ? '; expedition tx,ty=' + expedRec.tx + ',' + expedRec.ty : '') +
          ') — the flag marks a trip whose destination is home, not a spatial absence',
        window: window, spell: [spell.start, spell.end], details: details };
    }
    if (awayRec && awayRec.nx != null && awayRec.ny != null) {
      return { cls: '(d)', evidence: 'node never left Haven during the away spell (days ' + spell.start + '-' + spell.end +
          ') yet the away record points off-Haven (nx,ny=' + awayRec.nx + ',' + awayRec.ny +
          ', purpose ' + (awayRec.purpose || 'unknown') + ') — the departure was recorded but the member never moved; ' +
          'the flag is set on a trip that never started walking',
        window: window, spell: [spell.start, spell.end], details: details };
    }
    return { cls: 'UNRESOLVED', missingHook: 'away record unreadable on the flag day (no nx,ny/purpose to name the state)',
      evidence: 'node never left Haven during the spell, but the away record carries no destination or purpose, so the non-spatial state cannot be named',
      window: window, spell: [spell.start, spell.end], details: details };
  }
  // Node left Haven, came back, but no flag day falls >=1 day after
  // the node return — the flag days all fall on/before the return.
  // That is still a linger in the loose sense, but the frozen (a)
  // rule needs a late flag day; the trace lines force (d).
  if (everOffHaven && nodeReturnDay != null) {
    return { cls: '(d)', evidence: 'node left Haven and returned on day ' + nodeReturnDay +
        ', but every flag day (' + flagDays.join(',') + ') falls on or before the return day — the frozen (a) rule ' +
        '(flag still set >=1 day after the return) does not fire; the flag days sit on the return itself, ' +
        'so the dawn read and the return walk share a day (spell ' + spell.start + '-' + spell.end + ')',
      window: window, spell: [spell.start, spell.end], details: details };
  }
  // Node left Haven and never came back within the spell, yet the pool
  // reads the node at Haven on the flag days: the trace and the pool
  // row disagree on the node read.
  if (everOffHaven && nodeReturnDay == null) {
    return { cls: '(c)', evidence: 'trace shows the node off-Haven for the whole away spell (days ' + spell.start + '-' + spell.end +
        ', last node read ' + JSON.stringify((spellRows[spellRows.length - 1] || {}).node) +
        ') while the pool row reads the node at Haven on flag day(s) ' + flagDays.join(',') +
        ' — the node read, not the flag, is the wrong one (or the node moved between the pool read and the end-of-day trace)',
      window: window, spell: [spell.start, spell.end], details: details };
  }
  return { cls: 'UNRESOLVED', missingHook: 'no branch matched the trace shape',
    evidence: 'trace shape falls outside (a)-(d) as implemented', window: window,
    spell: [spell.start, spell.end], details: details };
}

// classifyLeg(leg): extract + classify every flagged member on a leg.
// leg: {bySeed, files} from loadDir, with classifyMarginals applied.
function classifyLeg(leg) {
  const perSeed = {};
  const flagged = [];
  let flagRows = 0;
  for (const k of Object.keys(leg.bySeed).sort()) {
    const j = leg.bySeed[k];
    const ext = extractFlagged(j);
    perSeed[j.seed] = ext.classified;
    for (const f of ext.flagged) {
      flagRows += f.flagDays.length;
      const rows = buildTrace(j, f.id);
      const haven = (rows.length && rows[0].haven) || { nx: 4, ny: 4 };
      // Name from the trace (displayName); fall back to the id.
      const named = rows.find(function (r) { return r.name; });
      if (named) f.name = named.name;
      const c = classifyMember(rows, f.flagDays, haven);
      flagged.push(Object.assign({}, f, { classification: c.cls, evidence: c.evidence,
        window: c.window, spell: c.spell, details: c.details,
        missingHook: c.missingHook || null,
        traceRows: rows.filter(function (r) { return r.day >= c.window.start && r.day <= c.window.end; }) }));
    }
  }
  const counts = { '(a)': 0, '(b)': 0, '(c)': 0, '(d)': 0, UNRESOLVED: 0 };
  for (const f of flagged) counts[f.classification] = (counts[f.classification] || 0) + 1;
  return { flagged: flagged, flagRows: flagRows, counts: counts,
    classifiedShare: flagged.length ? round(flagged.filter(function (f) { return f.classification !== 'UNRESOLVED'; }).length / flagged.length, 4) : null,
    unresolved: flagged.filter(function (f) { return f.classification === 'UNRESOLVED'; }).length };
}

function summarizeLeg(leg) {
  const summary = PM.summarizeMarginals(leg);
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  let w4kills = 0, w4fights = 0, w4flees = 0, w4deaths = 0, w4evades = 0, deaths = 0;
  const deathKinds = {};
  for (const s of seeds) {
    for (const e of (s.v4encounters || [])) {
      w4fights++;
      if (e.outcome === 'vKill') w4kills++;
      else if (e.outcome === 'vFlee') w4flees++;
      else if (e.outcome === 'vDie') w4deaths++;
      else if (e.outcome === 'evade') w4evades++;
    }
    deaths += (s.deaths || []).length;
    for (const d of (s.deaths || [])) deathKinds[d.kind || 'unknown'] = (deathKinds[d.kind || 'unknown'] || 0) + 1;
  }
  return Object.assign({}, summary, { wave4Kills: w4kills, wave4Fights: w4fights,
    wave4Flees: w4flees, wave4Deaths: w4deaths, wave4Evades: w4evades,
    deaths: deaths, deathKinds: deathKinds });
}

function main() {
  const instrumentDir = process.argv[2];
  const controlDir = process.argv[3] || null;
  if (!instrumentDir) { console.error('AWAYHAVEN ANALYZE STOP: instrumentDir required.'); process.exit(2); }
  let liveW4 = null;
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    liveW4 = list.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) {}
  const frozenSorted = W4_IDS_FROZEN.slice().sort();
  const w4Match = liveW4 && JSON.stringify(liveW4) === JSON.stringify(frozenSorted);

  const inst = loadDir(instrumentDir);
  for (const k of Object.keys(inst.bySeed)) inst.bySeed[k] = PM.classifyMarginals(inst.bySeed[k]);
  const instClass = classifyLeg(inst);
  const instSummary = summarizeLeg(inst);
  let ctrlClass = null, ctrlSummary = null;
  if (controlDir) {
    const ctrl = loadDir(controlDir);
    for (const k of Object.keys(ctrl.bySeed)) ctrl.bySeed[k] = PM.classifyMarginals(ctrl.bySeed[k]);
    ctrlClass = classifyLeg(ctrl);
    ctrlSummary = summarizeLeg(ctrl);
  }
  const instErrors = instSummary.firstFail.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0);
  const ctrlErrors = ctrlSummary ? ctrlSummary.firstFail.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0) : 0;
  const unresolvedNamed = instClass.flagged.filter(function (f) { return f.classification === 'UNRESOLVED'; })
    .every(function (f) { return !!f.missingHook; });
  const bar1 = instClass.flagged.length > 0 && instClass.classifiedShare === 1 && unresolvedNamed;
  const bar2 = inst.files.length === 8 && (!ctrlSummary || ctrlSummary.firstFail.files === 8);
  const bar3 = instErrors === 0 && ctrlErrors === 0;

  const out = {
    arm: 'awayhaven-b', run: 'awayhaven-b',
    instrumentDir: path.basename(instrumentDir), controlDir: controlDir ? path.basename(controlDir) : null,
    wave4IdsMatch: !!w4Match, wave4IdsLive: liveW4, wave4IdsFrozen: frozenSorted,
    instrument: { summary: instSummary, classification: instClass },
    control: ctrlSummary ? { summary: ctrlSummary, classification: ctrlClass } : null,
    bars: {
      classification: { pass: bar1, flaggedMembers: instClass.flagged.length, flagRows: instClass.flagRows,
        classifiedShare: instClass.classifiedShare, unresolved: instClass.unresolved,
        unresolvedAllNamed: unresolvedNamed, counts: instClass.counts },
      corpus: { pass: bar2, instrumentFiles: inst.files.length, controlFiles: ctrlSummary ? ctrlSummary.firstFail.files : null },
      instrumentErrors: { pass: bar3, instrument: instErrors, control: ctrlErrors },
    },
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-16', 'awayhaven-b-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  console.log('=== awayhaven-b classification (instrument leg) ===');
  console.log('flagged members: ' + instClass.flagged.length + '  flag rows: ' + instClass.flagRows +
    '  classified share: ' + instClass.classifiedShare + '  unresolved: ' + instClass.unresolved);
  console.log('counts: ' + JSON.stringify(instClass.counts));
  for (const f of instClass.flagged) {
    console.log('  seed ' + f.seed + ' ' + f.id + ' (' + (f.name || '?') + ', ' + f.profile +
      ', flag days ' + f.flagDays.join(',') + ') -> ' + f.classification +
      (f.window && f.window.widened ? ' [window widened]' : ''));
  }
  console.log('wall (instrument): ' + JSON.stringify(instSummary.wall) + '  medianSurvival: ' + instSummary.medianSurvival +
    '  wave4Kills: ' + instSummary.wave4Kills + '/' + instSummary.wave4Fights + ' fights  deaths: ' + instSummary.deaths);
  if (ctrlSummary) {
    console.log('--- control leg ---');
    console.log('flagged members: ' + ctrlClass.flagged.length + '  flag rows: ' + ctrlClass.flagRows +
      '  counts: ' + JSON.stringify(ctrlClass.counts));
    for (const f of ctrlClass.flagged) {
      console.log('  seed ' + f.seed + ' ' + f.id + ' (' + (f.name || '?') + ', ' + f.profile +
        ', flag days ' + f.flagDays.join(',') + ') -> ' + f.classification);
    }
    console.log('wall (control): ' + JSON.stringify(ctrlSummary.wall) + '  medianSurvival: ' + ctrlSummary.medianSurvival +
      '  wave4Kills: ' + ctrlSummary.wave4Kills + '/' + ctrlSummary.wave4Fights + ' fights  deaths: ' + ctrlSummary.deaths);
  }
  console.log('bars: classification=' + (bar1 ? 'PASS' : 'FAIL') +
    ' corpus=' + (bar2 ? 'PASS' : 'FAIL') + ' instrumentErrors=' + (bar3 ? 'PASS' : 'FAIL') +
    ' wave4Ids=' + (w4Match ? 'MATCH' : 'MISMATCH'));
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!bar1 || !bar2 || !bar3 || !w4Match) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { extractFlagged: extractFlagged, buildTrace: buildTrace,
  classifyMember: classifyMember, classifyLeg: classifyLeg, summarizeLeg: summarizeLeg };
