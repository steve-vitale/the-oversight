// analyze-journey-social-r75-outing-20261030.js -- r75 target-aware walk + dawn step-first retry
// analyzer. Reads worktree evidence/2026-10-30/r75/journey-social-r75-s*.json
// (driver output) and prints: pooled start-block decomposition (adjFail +
// status reason), dawn-position census, per-favor timelines with
// kept-without-start flip days, forage-barren classification, and the
// dry guardrail numbers from the driver's own verdicts file when present.
// Usage: node scripts/analyze-journey-social-r75-outing-20261030.js
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-30', 'r75');
const files = fs.readdirSync(DIR).filter(f => /^journey-social-r75-s\d+\.json$/.test(f)).sort();
if (!files.length) { console.error('no per-seed JSONs in ' + DIR); process.exit(1); }
const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const count = (rows, key) => { const o = {}; for (const r of rows) { const k = key(r); o[k] = (o[k] || 0) + 1; } return o; };
let attempts = [], blocked = [], starts = [], waits = [], nodeBarren = [], cellBlocked = [];
const favorRows = [];
for (const s of seeds) {
  const log = s.outingLog || [];
  attempts.push(...log.filter(r => r.step === 'start' || r.step === 'start-blocked'));
  blocked.push(...log.filter(r => r.step === 'start-blocked'));
  starts.push(...log.filter(r => r.step === 'start'));
  waits.push(...log.filter(r => r.step === 'wait'));
  nodeBarren.push(...log.filter(r => r.step === 'forage-node-barren'));
  cellBlocked.push(...log.filter(r => r.step === 'forage-cell-blocked'));
  const ends = {};
  for (const es of (s.favorEndStates || [])) ends[es.favorId] = es;
  const byFavor = {};
  for (const r of log) { (byFavor[r.favorId] = byFavor[r.favorId] || []).push(r); }
  for (const a of (s.favorAccepts || []).filter(x => x.accepted)) {
    const rows = (byFavor[a.favorId] || []).slice().sort((x, y) => x.day - y.day);
    const es = ends[a.favorId] || null;
    const firstKept = rows.find(r => r.diag && r.diag.promiseKept === true) ||
      (s.outingLog || []).filter(r => r.favorId === a.favorId && r.promiseKept === true).sort((x, y) => x.day - y.day)[0] || null;
    favorRows.push({ seed: s.seed || '?', vidName: a.vidName, favorId: a.favorId,
      acceptDay: a.day, meetDay: a.meetDay, attempts: rows.filter(r => r.step === 'start' || r.step === 'start-blocked').length,
      startDay: (rows.find(r => r.step === 'start') || {}).day || null,
      forages: rows.filter(r => r.step === 'forage').length,
      nodeBarren: rows.filter(r => r.step === 'forage-node-barren').length,
      delivers: rows.filter(r => r.step === 'deliver').length,
      endState: es ? es.state : null, promiseKept: es ? es.promiseKept : null,
      startedDay: es ? es.startedDay : null, deliveredKcal: es ? es.deliveredKcal : null,
      firstKeptDay: firstKept ? firstKept.day : null,
      firstKeptStep: firstKept ? firstKept.step : null,
      adjFails: count(rows.filter(r => r.step === 'start-blocked'), r => (r.diag && r.diag.adjFail) || 'NO-DIAG') });
  }
}
console.log('SEEDS: ' + seeds.map(s => (s.seed || '?') + ' ' + (s.days || s.endState && '') + 'd').join(', '));
for (const s of seeds) console.log('  funnel seed ' + (s.seed || '?') + ': ' + JSON.stringify(s.favorFunnel || {}));
console.log('\nDAWN ATTEMPTS pooled: ' + attempts.length + ' (starts ' + starts.length + ', blocked ' + blocked.length + ', waits ' + waits.length + ')');
console.log('BLOCKED by adjFail: ' + JSON.stringify(count(blocked, r => (r.diag && r.diag.adjFail) || 'NO-DIAG')));
console.log('BLOCKED by status reason: ' + JSON.stringify(count(blocked, r => (r.status && r.status.reason) || 'no-status')));
console.log('BLOCKED with NO diag: ' + blocked.filter(r => !r.diag).length + ' / ' + blocked.length);
const att = attempts.filter(r => r.diag && !r.diag.error);
console.log('DAWN CENSUS over ' + att.length + ' diag-carrying attempts:');
console.log('  playerAtHome: ' + att.filter(r => r.diag.playerAtHome).length);
console.log('  partnerNodeAtHome: ' + att.filter(r => r.diag.partnerNodeAtHome).length);
console.log('  insideMatch (partnerInside===playerInside): ' + att.filter(r => r.diag.partnerInside === r.diag.playerInside).length);
console.log('  partnerAway: ' + att.filter(r => r.diag.partnerAway).length);
console.log('  partnerPos null: ' + att.filter(r => r.diag.partnerPos === null).length);
console.log('  partnerNode defaulted (no nodePos): ' + att.filter(r => r.diag.partnerNode && r.diag.partnerNode.defaulted).length);
console.log('\nFORAGE-NODE-BARREN pooled: ' + nodeBarren.length);
console.log('  by targetCanForage: ' + JSON.stringify(count(nodeBarren, r => String(r.targetCanForage))));
console.log('FORAGE-CELL-BLOCKED pooled: ' + cellBlocked.length);
console.log('  by status reason: ' + JSON.stringify(count(cellBlocked, r => (r.status && r.status.reason) || 'no-status')));
console.log('\nPER-FAVOR TIMELINES (accepted forage favors):');
for (const fr of favorRows) console.log('  ' + JSON.stringify(fr));
const keptNoStart = favorRows.filter(fr => fr.promiseKept === true && !fr.startDay);
console.log('\nKEPT-WITHOUT-START: ' + keptNoStart.length);
for (const fr of keptNoStart) console.log('  ' + JSON.stringify(fr));

// ---- r74 additions: raw-kept audit, barren split, escalations, pos history ----
const barren = [];
const endedStuck = [], endBlocked = [], travelBlocked = [], travelWalked = [];
for (const sd of seeds) {
  const log = sd.outingLog || [];
  barren.push(...log.filter(r => r.step === 'forage-barren'));
  endedStuck.push(...log.filter(r => r.step === 'outing-ended-stuck'));
  endBlocked.push(...log.filter(r => r.step === 'outing-end-blocked'));
  travelBlocked.push(...log.filter(r => r.step === 'forage-travel-blocked'));
  travelWalked.push(...log.filter(r => r.step === 'forage-travel-walked'));
}
console.log('\nBARREN SPLIT (forage-barren days): ' + barren.length);
console.log('  by barrenKind: ' + JSON.stringify(count(barren, r => r.barrenKind || 'MISSING')));
console.log('TRAVEL-BLOCKED entries: ' + travelBlocked.length + ' (walkAttempted: ' + travelBlocked.filter(r => r.walkAttempted).length + ', pathFound: ' + travelBlocked.filter(r => r.pathFound).length + ')');
console.log('TRAVEL-WALKED entries: ' + travelWalked.length);
console.log('ESCALATIONS: ended-stuck ' + endedStuck.length + ', end-blocked ' + endBlocked.length);
for (const r of endedStuck) console.log('  ENDED-STUCK: ' + JSON.stringify({ seed: '?', day: r.day, vid: r.vidName, favorId: r.favorId, stuckDays: r.stuckDays, deliveredKcal: r.deliveredKcal, favorState: r.favorState }));
for (const r of endBlocked) console.log('  END-BLOCKED: ' + JSON.stringify({ day: r.day, vid: r.vidName, favorId: r.favorId, stuckDays: r.stuckDays, reason: r.reason || (r.status && r.status.reason) }));
console.log('\nRAW-KEPT AUDIT:');
let missedTrue = 0, deliverTotal = 0;
for (const sd of seeds) for (const r of (sd.outingLog || [])) {
  if (r.step === 'deliver' && r.ok) { deliverTotal++; if (/missed/i.test(String(r.line || '')) && r.promiseKept === true) missedTrue++; }
}
console.log('  deliver events ok: ' + deliverTotal + '; missed-line-but-kept-true (must be 0): ' + missedTrue);
console.log('  funnel completes: events vs snapshot per seed:');
for (const sd of seeds) console.log('    seed ' + (sd.seed || '?') + ': events=' + (sd.favorFunnel && sd.favorFunnel.completeOutingsEvents) + ' snapshot=' + (sd.favorFunnel && sd.favorFunnel.completeOutings) + ' keptStrict=' + (sd.favorFunnel && sd.favorFunnel.keptMatchedStrict) + ' keptMatched=' + (sd.favorFunnel && sd.favorFunnel.keptMatched));
console.log('\nPOSITION HISTORY (no-micro-pos blocks: ever vs never before):');
let ever = 0, never = 0, unknown = 0;
for (const sd of seeds) {
  const hist = sd.posHistory || {};
  for (const r of (sd.outingLog || []).filter(x => x.step === 'start-blocked' && x.diag && x.diag.adjFail === 'no-micro-pos')) {
    const h = hist[r.vid];
    if (!h) never++;
    else if (h.firstDay < r.day) ever++;
    else if (h.firstDay === r.day) unknown++;
    else never++;
  }
}
console.log('  no-micro-pos blocks: ever-before=' + ever + ' never-before=' + never + ' same-day-ambiguous=' + unknown);
for (const sd of seeds) {
  const hist = sd.posHistory || {};
  const neverVids = Object.keys(hist).length;
  console.log('    seed ' + (sd.seed || '?') + ': posHistory villagers=' + neverVids);
}

// ---- r75 additions: target-aware walk, hopHome detail, dawn retry, post-ending starts, midday positions ----
const retries = [], noHomes = [], walked = [];
for (const sd of seeds) {
  const log = sd.outingLog || [];
  retries.push(...log.filter(r => r.step === 'start-step-retry'));
  noHomes.push(...log.filter(r => r.step === 'forage-no-home' || r.step === 'deliver-no-home' || (r.step === 'outing-end-blocked' && r.reason === 'no-home')));
  walked.push(...log.filter(r => r.step === 'forage-travel-walked'));
}
console.log('\nDAWN STEP-FIRST RETRIES: ' + retries.length);
console.log('  stepOk: ' + retries.filter(r => r.stepOk).length + ', stepAssigned: ' + retries.filter(r => r.stepAssigned).length + ', retryStarted: ' + retries.filter(r => r.retryStarted).length);
console.log('  retryStarted without stepAssigned (must be 0): ' + retries.filter(r => r.retryStarted && !r.stepAssigned).length);
console.log('  retries by dayPartAfter: ' + JSON.stringify(count(retries, r => String(r.dayPartAfter))));
console.log('  retries missing stepAssigned field (binding miss if >0): ' + retries.filter(r => !('stepAssigned' in r)).length);
console.log('\nNO-HOME ENTRIES (must all carry walk detail): ' + noHomes.length);
console.log('  missing walkPathFound (binding miss if >0): ' + noHomes.filter(r => !('walkPathFound' in r)).length);
console.log('  by step: ' + JSON.stringify(count(noHomes, r => r.step)));
console.log('  by walkRefusedReason: ' + JSON.stringify(count(noHomes, r => String(r.walkRefusedReason || 'at-home-or-unknown'))));
console.log('TRAVEL-WALKED entries: ' + walked.length);
console.log('TRAVEL-BLOCKED refusals naming a step (walkRefusedAt present): ' + travelBlocked.filter(r => r.walkRefusedAt).length + ' / ' + travelBlocked.length);
console.log('TRAVEL-BLOCKED missing blockage read (binding miss if >0): ' + travelBlocked.filter(r => !('blockage' in r)).length);
console.log('\nPOST-ENDING STARTS (a start dated after an ending in the same seed):');
for (const sd of seeds) {
  const log = (sd.outingLog || []).slice().sort((a, b) => a.day - b.day);
  const ends = log.filter(r => r.step === 'outing-ended-stuck' || r.step === 'outing-end-blocked');
  for (const e of ends) {
    const after = log.filter(r => r.step === 'start' && r.day > e.day);
    const sameVid = after.filter(r => r.vid === e.vid);
    console.log('  seed ' + (sd.seed || '?') + ': ending ' + e.step + ' day ' + e.day + ' ' + e.vidName + ' -> later starts ' + after.length + ' (same villager ' + sameVid.length + ')' + (after.length ? ' first day ' + after[0].day + ' ' + after[0].vidName + (after[0].retryFromStep ? ' (retry)' : '') : ' NONE'));
  }
  if (!ends.length) console.log('  seed ' + (sd.seed || '?') + ': no endings');
}
console.log('\nMIDDAY POSITIONS (no-micro-pos dawn blocks vs midday history):');
for (const sd of seeds) {
  const mid = sd.posHistoryMidday || {};
  let midEver = 0, midNever = 0;
  for (const r of (sd.outingLog || []).filter(x => x.step === 'start-blocked' && x.diag && x.diag.adjFail === 'no-micro-pos')) {
    const h = mid[r.vid];
    if (h && h.firstDay <= r.day) midEver++; else midNever++;
  }
  console.log('  seed ' + (sd.seed || '?') + ': midday-ever=' + midEver + ' midday-never=' + midNever + ' midday villagers=' + Object.keys(mid).length);
}

const verdictsPath = path.join(DIR, 'r75-verdicts.json');
if (fs.existsSync(verdictsPath)) {
  try { const v = JSON.parse(fs.readFileSync(verdictsPath, 'utf8')); console.log('\nDRIVER VERDICTS FILE: ' + JSON.stringify(v).slice(0, 2000)); }
  catch (e) { console.log('\nverdicts file unreadable: ' + e.message); }
}
