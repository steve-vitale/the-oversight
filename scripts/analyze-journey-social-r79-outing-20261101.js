// analyze-journey-social-r79-outing-20261101.js -- r79 gate-measurement +
// acquittal-batch analyzer. R79 FORK of the r78 analyzer (DIR + filenames
// r79, playerVoter label fix, gate census section). Reads worktree
// evidence/2026-11-01/r79/journey-social-r79-s*.json (driver output) and
// prints: pooled start-block decomposition, dawn-position census,
// per-favor timelines, trial census, autonomous-convening verdict, gate
// census (B7), and the dry guardrail numbers from the driver's own
// verdicts file when present.
// Usage: node scripts/analyze-journey-social-r79-outing-20261101.js
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-11-01', 'r79');
const files = fs.readdirSync(DIR).filter(f => /^journey-social-r79-s\d+\.json$/.test(f)).sort();
if (!files.length) { console.error('no per-seed JSONs in ' + DIR); process.exit(1); }
const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const count = (rows, key) => { const o = {}; for (const r of rows) { const k = key(r); o[k] = (o[k] || 0) + 1; } return o; };
const CASE_MENU_SEGS = new Set(['site', 'witnesses', 'investigate', 'moot', 'letlie', 'expose', 'bribe', 'press', 'pressaccuser', 'approach', 'wounds', 'askheard', 'tellside', 'hearoffer', 'vote_guilty', 'vote_acquit']);
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

// ---- r77 additions: case timelines, betrayal offers, moot probe, away census, post-ending repeat-start window ----
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


console.log('\nR79 TRIAL CENSUS (B1: first-trial-appearance per case + SAY announcements; v.moots NEVER a count):');
let pooledTrials = 0, pooledSay = 0;
for (const sd of seeds) {
  const say = sd.mootSayLines || [];
  pooledSay += say.length;
  const probed = new Set((sd.mootProbePicks || []).map(x => x.caseId));
  const byId = {};
  for (const sn of (sd.caseSnaps || [])) for (const c of (sn.cases || [])) {
    const arr = (byId[c.id] = byId[c.id] || []);
    arr.push({ snapDay: sn.day, row: c });
  }
  let trials = 0;
  for (const [id, rows] of Object.entries(byId)) {
    const firstTrial = rows.find(r => r.row.trialDetail);
    if (!firstTrial) continue;
    trials++;
    const td = firstTrial.row.trialDetail;
    const last = rows[rows.length - 1].row;
    const firstRow = rows[0].row;
    const driverMootPick = (sd.betrayalPickConvos || []).some(c => (c.picks || []).some(pk => pk.pickId === 'betrayal:moot:' + id));
    const origin = probed.has(id) ? 'probe' : (driverMootPick ? 'player-picked-fallback (AMENDMENT-A class, pre-fix only)' : (last.playerConvened ? 'player-called-unattributed (ANOMALY if post-fix)' : 'autonomous (npcMootTick/playerCaseTick)'));
    const mootInDay = (firstRow.day || 0) + (firstRow.mootIn || 3); // ambush cases carry mootIn=null; npcMootTick default is 3
    console.log('  seed ' + (sd.seed || '?') + ' arm=' + (sd.arm || '?') + ' case=' + id + ' charge=' + firstRow.charge + ' accused=' + (firstRow.accused || []).join('/') + ' target=' + firstRow.target + ' role=' + firstRow.playerRole + ' opened d' + firstRow.day + ' mootIn=' + firstRow.mootIn + ' (mootInDay~d' + mootInDay + ') firstTrial snap d' + firstTrial.snapDay + ' origin=' + origin + ' status=' + last.status + ' resolution=' + (last.resolution || '-') + ' playerConvened=' + !!last.playerConvened);
    console.log('    VOTE: npcGuilty=' + td.guilty + ' finalGuilty=' + td.finalGuilty + ' present=' + td.present + ' total~' + (td.present + (td.playerVoter ? 1 : 0)) + ' need~' + (Math.floor((td.present + (td.playerVoter ? 1 : 0)) / 2) + 1) + ' convicted=' + td.convicted + ' wildDay=' + td.wildDay + ' playerVoter=' + td.playerVoter + ' votes=' + (td.votes || []).length);
    const gs = (td.votes || []).filter(v => v.vote === 'guilty').map(v => v.score).filter(Number.isFinite);
    const as = (td.votes || []).filter(v => v.vote === 'acquit').map(v => v.score).filter(Number.isFinite);
    const mean = xs => xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) : 'n/a';
    console.log('    SCORE SPREAD: guilty n=' + gs.length + ' mean=' + mean(gs) + ' | acquit n=' + as.length + ' mean=' + mean(as));
    const driverVotes = [];
    for (const c of (sd.betrayalPickConvos || [])) for (const pk of (c.picks || [])) { const m = /^betrayal:vote_(guilty|acquit):(.+)$/.exec(pk.pickId || ''); if (m && m[2] === id) driverVotes.push({ day: c.day, name: c.name, vote: m[1] }); }
    const playerContrib = (td.finalGuilty === null) ? 'pending' : (td.finalGuilty - td.guilty);
    console.log('    PLAYER VOTE: driverVotePicks=' + JSON.stringify(driverVotes) + ' playerVoter=' + td.playerVoter + ' npcGuilty->final=' + td.guilty + '->' + td.finalGuilty + ' (contrib ' + playerContrib + (td.playerVoter === false ? '; backstop: count taken without player' : (driverVotes.length ? '; driver voted in a later convo' : '; playerVoter true but no driver vote pick recorded — playerVoter means MAY vote (trial creation, 90% unless player-convened); no driver vote cast, so the player seat went unused')) + ')');
  }
  console.log('  seed ' + (sd.seed || '?') + ': trials=' + trials + ' mootSayLines=' + say.length + ' legacy mootsConvened=' + (sd.mootsConvened || 0) + ' (ARTIFACT, never a count)');
  pooledTrials += trials;
  for (const s of say.slice(0, 12)) console.log('    SAY d' + s.day + ': ' + s.text.slice(0, 200));
}
console.log('POOLED trials=' + pooledTrials + ' mootSayLines=' + pooledSay);
console.log('\nR79 GATE CENSUS (B7: nonverbal gate in master — case offers while thread=nonverbal with no interpreter must be ZERO):');
let pooledBad = 0, pooledNv = 0, pooledNvNo = 0, pooledNvYes = 0;
for (const sd of seeds) {
  const g = sd.gateCensus || {};
  pooledNv += (g.nvConvos || 0); pooledNvNo += (g.nvNoInterpConvos || 0); pooledNvYes += (g.nvInterpConvos || 0); pooledBad += (g.caseOffersNvNoInterp || 0);
  console.log('  seed ' + (sd.seed || '?') + ' arm=' + (sd.arm || '?') + ': totalConvos=' + (g.totalConvos || 0) + ' nvConvos=' + (g.nvConvos || 0) + ' nvNoInterp=' + (g.nvNoInterpConvos || 0) + ' nvInterp=' + (g.nvInterpConvos || 0) + ' caseOffersNvNoInterp=' + (g.caseOffersNvNoInterp || 0) + ' caseOffersNvInterp=' + (g.caseOffersNvInterp || 0) + ((g.nvConvos || 0) === 0 ? ' (UNMEASURED on this seed: no nonverbal convos)' : ''));
  for (const b of (g.badOffers || [])) console.log('    BAD OFFER d' + b.day + ' ' + b.name + ' ' + b.offer);
}
console.log('POOLED gate: nvConvos=' + pooledNv + ' nvNoInterp=' + pooledNvNo + ' nvInterp=' + pooledNvYes + ' badOffers=' + pooledBad + (pooledBad === 0 ? ' (GATE HOLDS)' : ' (GATE MISS — investigate)'));
console.log('\nR79 AUTONOMOUS-CONVENING VERDICT (hands-off arm) (B2, control arm only; post-Amendment-A rules):');
for (const sd of seeds.filter(s => (s.arm || '') === 'handsoff')) {
  const probed = new Set((sd.mootProbePicks || []).map(x => x.caseId));
  const driverMootPicked = new Set();
  for (const c of (sd.betrayalPickConvos || [])) for (const pk of (c.picks || [])) { const m = /^betrayal:moot:(.+)$/.exec(pk.pickId || ''); if (m) driverMootPicked.add(m[1]); }
  const driverCasePicked = new Set();
  for (const c of (sd.betrayalPickConvos || [])) for (const pk of (c.picks || [])) { const m = /^betrayal:([^:]+):(.+)$/.exec(pk.pickId || ''); if (m && CASE_MENU_SEGS.has(m[1])) driverCasePicked.add(m[2]); }
  const byId = {};
  for (const sn of (sd.caseSnaps || [])) for (const c of (sn.cases || [])) (byId[c.id] = byId[c.id] || []).push({ snapDay: sn.day, row: c });
  let eligible = 0, convened = 0;
  for (const [id, rows] of Object.entries(byId)) {
    if (probed.has(id) || driverMootPicked.has(id) || driverCasePicked.has(id)) continue;
    const first = rows[0].row, last = rows[rows.length - 1].row;
    if (last.playerConvened) continue; // player-called by some other path: not autonomous evidence
    if ((first.accusedIds || []).length && first.accusedIds.some(a => a === 'player')) continue;
    if (!first.targetId) continue;
    if (!rows.some(r => r.row.status === 'open')) continue; // never reached 'open': cannot convene
    const mootInDay = (first.day || 0) + (first.mootIn || 3);
    if ((sd.days || 0) < mootInDay) continue;
    eligible++;
    const trialed = rows.some(r => r.row.trialDetail);
    if (trialed) convened++;
    console.log('  seed ' + (sd.seed || '?') + ' case=' + id + ' opened d' + first.day + ' mootInDay~d' + mootInDay + ' (mootIn field ' + first.mootIn + ', tick default 3) runDays=' + sd.days + ' trialed=' + trialed);
  }
  console.log('  seed ' + (sd.seed || '?') + ': eligible control cases=' + eligible + ' convened=' + convened + ' -> ' + (eligible === 0 ? 'UNISOLATED (no control case reached mootIn without a player pick)' : (convened === eligible ? 'AUTONOMOUS CONVENING OBSERVED' : 'PARTIAL/UNCONVENED')));
}
console.log('\nR78 AWAY-RETURN CENSUS (replication) (B4: computed return = sinceDay + duration):');
let awayRetTotal = 0, awayRetMissing = 0; const retGaps = [];
for (const sd of seeds) {
  for (const r of (sd.outingLog || []).filter(x => x.step === 'start-blocked' && x.diag && x.diag.adjFail === 'away')) {
    awayRetTotal++;
    const d = r.diag;
    if (typeof d.awayComputedReturnDay !== 'number') { awayRetMissing++; console.log('  MISSING seed ' + (sd.seed || '?') + ' d' + r.day + ' ' + (r.vidName || '') + ' diag=' + JSON.stringify(d)); }
    else retGaps.push(d.awayComputedReturnDay - r.day);
  }
}
console.log('  away blocks=' + awayRetTotal + ' missing computed return (binding miss if >0)=' + awayRetMissing);
console.log('  computedReturn-minus-blockDay: ' + JSON.stringify(count(retGaps, g => String(g))));
console.log('\nR78 BROKEN-ORIGIN WINDOWS (final-ledger method, kept for continuity) (B5: final broken favor -> later same-villager start):');
for (const sd of seeds) {
  const log = sd.outingLog || [];
  const startedIds = new Set(log.filter(r => r.step === 'start').map(r => r.favorId));
  const broken = (sd.favorEndStates || []).filter(es => es.promiseKept === 'broken');
  let windows = 0;
  for (const b of broken) {
    const later = (sd.favorAccepts || []).filter(a => a.accepted && (a.vidName === b.vidName) && (a.day || 0) > (b.deadline || 0) && startedIds.has(a.favorId)).sort((x, y) => x.day - y.day)[0];
    if (later) { windows++; console.log('  seed ' + (sd.seed || '?') + ' ' + b.vidName + ': broken favor ' + b.favorId + ' (deadline d' + b.deadline + ') -> later start d' + later.day + ' favor ' + later.favorId + ' (gap ' + (later.day - b.deadline) + 'd past deadline)'); }
  }
  console.log('  seed ' + (sd.seed || '?') + ': broken favors=' + broken.length + ' broken-origin windows=' + windows + (broken.length === 0 ? ' (no broken favor in final ledger — window untestable this seed)' : ''));
}
console.log('\nR78 END-BLOCKED REPETITION CENSUS (decision input, not a game change):');
for (const sd of seeds) {
  const blocks = (sd.outingLog || []).filter(r => r.step === 'outing-end-blocked');
  const byFavor = {};
  for (const b of blocks) (byFavor[b.favorId] = byFavor[b.favorId] || []).push(b);
  const deadNames = new Set((sd.deaths || []).map(d => d.name));
  for (const [fid, rows] of Object.entries(byFavor)) {
    const last = rows[rows.length - 1];
    const partnerDead = deadNames.has(last.vidName);
    console.log('  seed ' + (sd.seed || '?') + ' ' + (last.vidName || '') + ' ' + fid + ': blocks=' + rows.length + ' stuckDays=' + rows.map(r => r.stuckDays).join('/') + ' lastReason=' + JSON.stringify((last.status && last.status.reason) || last.reason || '') + ' partnerInDeaths=' + partnerDead);
  }
  if (!blocks.length) console.log('  seed ' + (sd.seed || '?') + ': no end-blocked entries');
}


console.log('\nR78 HANDS-OFF PICK AUDIT (binding: zero case-menu picks on handsoff seeds):');
for (const sd of seeds.filter(s => (s.arm || '') === 'handsoff')) {
  const casePicks = [];
  for (const c of (sd.betrayalPickConvos || [])) for (const pk of (c.picks || [])) {
    const m = /^betrayal:([^:]+):/.exec(pk.pickId || '');
    if (m && CASE_MENU_SEGS.has(m[1])) casePicks.push({ day: c.day, name: c.name, pickId: pk.pickId });
  }
  console.log('  seed ' + (sd.seed || '?') + ': case-menu picks=' + casePicks.length + (casePicks.length ? ' BINDING MISS: ' + JSON.stringify(casePicks) : ' (arm was hands-off)'));
}
console.log('\nR78 BROKEN-ORIGIN BY LOG TRACE (B5: promise-broken-seen -> later same-villager start):');
for (const sd of seeds) {
  const log = (sd.outingLog || []).slice().sort((x, y) => x.day - y.day);
  const brokens = log.filter(r => r.step === 'promise-broken-seen');
  const starts = log.filter(r => r.step === 'start');
  let windows = 0;
  for (const b of brokens) {
    const later = starts.filter(r => r.vid === b.vid && r.day > b.day && r.favorId !== b.favorId).sort((x, y) => x.day - y.day)[0];
    if (later) { windows++; console.log('  seed ' + (sd.seed || '?') + ' ' + (b.vidName || '') + ': broken d' + b.day + ' favor ' + b.favorId + ' -> later start d' + later.day + ' favor ' + later.favorId + ' (gap ' + (later.day - b.day) + 'd)'); }
  }
  console.log('  seed ' + (sd.seed || '?') + ': broken-seen=' + brokens.length + ' broken-origin windows=' + windows);
}
console.log('\nR78 SAY TV EXCLUSION CENSUS:');
for (const sd of seeds) {
  console.log('  seed ' + (sd.seed || '?') + ': mootSayLines=' + (sd.mootSayLines || []).length + ' mootSayTvExcluded=' + (sd.mootSayTvExcluded || []).length);
  for (const s of (sd.mootSayTvExcluded || []).slice(0, 6)) console.log('    TV-EXCLUDED d' + s.day + ': ' + s.text.slice(0, 200));
}

const verdictsPath = path.join(DIR, 'r79-verdicts.json');
if (fs.existsSync(verdictsPath)) {
  try { const v = JSON.parse(fs.readFileSync(verdictsPath, 'utf8')); console.log('\nDRIVER VERDICTS FILE: ' + JSON.stringify(v).slice(0, 2000)); }
  catch (e) { console.log('\nverdicts file unreadable: ' + e.message); }
}
