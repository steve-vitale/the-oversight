// analyze-journey-social-r76-outing-20261031.js -- r75 target-aware walk + dawn step-first retry
// analyzer. Reads worktree evidence/2026-10-30/r75/journey-social-r75-s*.json
// (driver output) and prints: pooled start-block decomposition (adjFail +
// status reason), dawn-position census, per-favor timelines with
// kept-without-start flip days, forage-barren classification, and the
// dry guardrail numbers from the driver's own verdicts file when present.
// Usage: node scripts/analyze-journey-social-r75-outing-20261030.js
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-31', 'r76');
const files = fs.readdirSync(DIR).filter(f => /^journey-social-r76-s\d+\.json$/.test(f)).sort();
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

// ---- r76 additions: case timelines, betrayal offers, moot probe, away census, post-ending repeat-start window ----
console.log('\nCASE TIMELINES (from change-only daily caseSnaps):');
for (const sd of seeds) {
  const snaps = sd.caseSnaps || [];
  const byCase = {};
  for (const sn of snaps) for (const c of (sn.cases || [])) {
    (byCase[c.id] = byCase[c.id] || []).push({ day: sn.day, status: c.status, charge: c.charge, accused: (c.accused || []).join('/'), target: c.target, role: c.playerRole, known: c.knownToPlayer, mootIn: c.mootIn, trial: c.trial });
  }
  const ids = Object.keys(byCase);
  console.log('  seed ' + (sd.seed || '?') + ': caseSnaps=' + snaps.length + ' distinct cases=' + ids.length + ' mootsConvened=' + (sd.mootsConvened || 0));
  for (const id of ids) {
    const rows = byCase[id];
    const trans = [];
    for (const r of rows) { const last = trans[trans.length - 1]; if (!last || last.status !== r.status || last.trial !== r.trial) trans.push(r); }
    console.log('    case ' + id + ': ' + trans.map(r => 'd' + r.day + ':' + r.status + (r.trial ? '+trial' : '')).join(' -> ') + ' | charge=' + rows[0].charge + ' accused=' + rows[0].accused + ' target=' + rows[0].target + ' role=' + rows[0].role + ' known=' + rows[0].known + ' mootIn=' + rows[0].mootIn);
  }
  if (!ids.length) console.log('    (no cases ever snapshotted)');
}
console.log('\nBETRAYAL-OFFER CENSUS + MOOT PROBE:');
for (const sd of seeds) {
  const convos = sd.betrayalOfferConvos || [];
  const mootOffers = [];
  for (const c of convos) for (const m of (c.mootOffers || [])) if (!mootOffers.some(x => x.caseId === m.caseId)) mootOffers.push(m);
  const probes = sd.mootProbePicks || [];
  console.log('  seed ' + (sd.seed || '?') + ' arm=' + (sd.arm || '?') + ': betrayalOfferConvos=' + convos.length + ' distinct moot-offer cases=' + mootOffers.length + ' probePicks=' + probes.length + ' mootsConvened=' + (sd.mootsConvened || 0));
  for (const c of convos.slice(0, 12)) console.log('    offer d' + c.day + ' ' + c.name + ' (' + c.tag + '): ' + c.offers.map(o => o.id).join(', ') + (c.mootProbePick ? ' PROBE->' + c.mootProbePick : ''));
  for (const pr of probes) {
    // trial presence for the probed case in any later snap
    let trialed = false;
    for (const sn of (sd.caseSnaps || [])) { const c = (sn.cases || []).find(x => x.id === pr.caseId); if (c && c.trial) { trialed = true; break; } }
    console.log('    PROBE d' + pr.day + ' ' + pr.vidName + ' case=' + pr.caseId + ' laterTrial=' + trialed);
  }
}
console.log('\nAWAY CENSUS (start-blocks with adjFail=away):');
let awayTotal = 0, awayMissing = 0;
const awayPurposes = {}, awayGaps = [], awayDists = [];
for (const sd of seeds) {
  const home = (sd.outingLog || []).find(r => r.diag && r.diag.home) || null;
  const hx = home ? home.diag.home.x : null, hy = home ? home.diag.home.y : null;
  for (const r of (sd.outingLog || []).filter(x => x.step === 'start-blocked' && x.diag && x.diag.adjFail === 'away')) {
    awayTotal++;
    const d = r.diag;
    if (!('awayPurpose' in d) || (d.awayPurpose === null && d.awayNode === null && d.awayReturnDay === null && !d.partnerAway)) awayMissing++;
    const pur = d.awayPurpose || 'unknown';
    awayPurposes[pur] = (awayPurposes[pur] || 0) + 1;
    if (typeof d.awayReturnDay === 'number') awayGaps.push(d.awayReturnDay - r.day);
    if (d.awayNode && hx !== null) awayDists.push(Math.max(Math.abs(d.awayNode.nx - hx), Math.abs(d.awayNode.ny - hy)));
  }
}
console.log('  away blocks: ' + awayTotal + '; missing away record (binding miss if >0): ' + awayMissing);
console.log('  by purpose: ' + JSON.stringify(awayPurposes));
console.log('  returnDay-minus-blockDay: ' + JSON.stringify(count(awayGaps, g => String(g))));
console.log('  node distance from home (Chebyshev): ' + JSON.stringify(count(awayDists, g => String(g))));
console.log('\nPOST-ENDING REPEAT-START WINDOW (B4: ended favor -> later same-villager start):');
for (const sd of seeds) {
  const log = sd.outingLog || [];
  const startedIds = new Set(log.filter(r => r.step === 'start').map(r => r.favorId));
  const deliveredIds = new Set(log.filter(r => r.step === 'deliver').map(r => r.favorId));
  const acc = (sd.favorAccepts || []).filter(a => a.accepted).slice().sort((a, b) => (a.day || 0) - (b.day || 0));
  const byVid = {};
  for (const a of acc) (byVid[a.vidName || a.vid] = byVid[a.vidName || a.vid] || []).push(a);
  let windows = 0;
  for (const [vidName, lst] of Object.entries(byVid)) {
    for (let i = 0; i < lst.length; i++) {
      const a = lst[i];
      const aStarted = startedIds.has(a.favorId), aDelivered = deliveredIds.has(a.favorId);
      const endedKind = aDelivered ? 'delivered' : (!aStarted ? 'unstarted' : 'started-undelivered');
      for (let j = i + 1; j < lst.length; j++) {
        const b = lst[j];
        if (startedIds.has(b.favorId)) {
          windows++;
          console.log('    seed ' + (sd.seed || '?') + ' ' + vidName + ': ' + endedKind + ' d' + a.day + ' -> later start d' + b.day + ' (gap ' + (b.day - a.day) + 'd)');
          break;
        }
      }
    }
  }
  if (!windows) console.log('  seed ' + (sd.seed || '?') + ': no post-ending repeat-start window');
}

const verdictsPath = path.join(DIR, 'r76-verdicts.json');
if (fs.existsSync(verdictsPath)) {
  try { const v = JSON.parse(fs.readFileSync(verdictsPath, 'utf8')); console.log('\nDRIVER VERDICTS FILE: ' + JSON.stringify(v).slice(0, 2000)); }
  catch (e) { console.log('\nverdicts file unreadable: ' + e.message); }
}
