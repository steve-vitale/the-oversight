#!/usr/bin/env node
// pathcensus-20261015.js — READ-ONLY diagnostic instrument over the landed
// win-side stack (flesh-out loop DIAGNOSTIC, 2026-10-15, scale-onramp axis).
//
// Question (sim-findings #309/#311, steve-call #316/#317): all measured wins
// are lesser-seat feared-path walks — the winpursuit drain plays options[0],
// it doesn't choose the door. This run does NOT design path selection.
// It MEASURES the funnel: where does path variety die?
//
// Composition: withPathCensus wraps SD.leadseat / SD.belongseat (the armed
// stack) with a read-only layer. The wrapper:
//   - installs a recording chooseTableOption at run setup (calls through to
//     the original with identical args — zero behavioral change)
//   - pre-dawn, reads invitation state (tablePreview/tableWaiting) and the
//     offer-modal state (windefer.offerPending) — reads only
//   - records every modal answer: phase, options offered, option chosen,
//     resulting path + branch, and a read-only least-walked-door
//     counterfactual computed from the sweep-global walk ledger
//   - closes modal-streak bookkeeping post-drain
// Default-OFF env per loop convention is not needed (the wrapper is the
// instrument; the DET-GATE proves it is trajectory-identical to plain
// armed — read-only proof).
//
// Seeds: 8 fresh [131,242,353,464,575,686,797,908] x {leadfeast,
// belongfeast}, ARMED ONLY (16 runs), 180d death-aware. No control needed
// (no lever change). Substrate asserted up front:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 (asserted) +
//   WINPURSUIT=1 + WINDEFER=1 + SEATDRIVE=1 (set per run inside).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SMOKE=1 node scripts/pathcensus-20261015.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/pathcensus-20261015.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 DET=1 node scripts/pathcensus-20261015.js   # det-gate only
// Targeted re-runs: SEEDS="131,242" ONLY="leadfeast;belongfeast"
'use strict';
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash, checkDeterminism } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [131, 242, 353, 464, 575, 686, 797, 908]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-pathcensus');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-15', 'pathcensus-beats');

const PATH_IDS = ['feared', 'indispensable', 'beloved', 'witness', 'assimilated', 'defiant', 'relay'];

function policyFor(policyId) {
  return policyId === 'leadfeast' ? SD.leadseat : SD.belongseat;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const strip = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 300);

// ---------------------------------------------------------------------
// The instrument: read-only census wrap of a seatdrive policy.
// `ledger` is the sweep-global door-walk ledger (mutated by the sweep
// process only — the instrument's per-answer counterfactual reads it).
function newCensus() {
  return {
    answers: [],        // every modal answer (phase/options/chosen/result)
    doorEvents: [],     // every 'path:' door answer (the funnel's core)
    downgrades: [],     // every downgrade: pick (picked-but-failed evidence)
    streaks: [],        // invited-but-unanswered modal streaks (days)
    inviteDays: 0,      // days with invitation pending (pre-sit)
    announcedDay: null, // first day tableWaiting true
    _streak: 0,         // running unanswered streak
  };
}

function withPathCensus(base, id, desc, ledger) {
  return Object.assign({}, base, {
    id, desc,
    setup(Game, ctx) {
      ctx._census = newCensus();
      ctx._ledger = ledger;
      // Record-through wrap: identical call, recorded. No behavior change.
      const orig = Game.chooseTableOption ? Game.chooseTableOption.bind(Game) : null;
      Game.chooseTableOption = function (optId) {
        const rec = recordAnswer(Game, ctx, String(optId));
        const r = orig ? orig(optId) : null;
        finishAnswer(Game, ctx, rec);
        return r;
      };
      const oSetup = base.setup;
      if (oSetup) return oSetup(Game, ctx);
    },
    daily(Game, ctx) {
      preDawn(Game, ctx);
      const pathAnswersBefore = ctx._census.answers.filter(a => a.kind === 'door').length;
      const r = base.daily(Game, ctx);
      postDawn(Game, ctx, pathAnswersBefore);
      return r;
    },
  });
}

// Read-only pre-dawn snapshot: invitation state + modal state.
function preDawn(Game, ctx) {
  const C = ctx._census;
  try {
    const pg = Game.progState ? Game.progState() : {};
    if (pg.tableWaiting && C.announcedDay == null) C.announcedDay = gday(Game);
    let pv = null;
    try { pv = (typeof Game.tablePreview === 'function') ? Game.tablePreview() : null; } catch (e) {}
    if (pv && !pg.tableDone && !(ctx.sdSeatTaken > 0)) C.inviteDays++;
    C._offerPendingDawn = WD.offerPending(Game);
  } catch (e) {}
}

function postDawn(Game, ctx, pathAnswersBefore) {
  const C = ctx._census;
  const pathAnswersNow = C.answers.filter(a => a.kind === 'door').length;
  const answered = pathAnswersNow > pathAnswersBefore;
  try {
    const stillPending = WD.offerPending(Game);
    if (C._offerPendingDawn && !answered && stillPending) {
      C._streak++; // offered, unanswered, still offered — streak continues
    } else {
      if (C._streak > 0) C.streaks.push(C._streak);
      C._streak = 0;
    }
  } catch (e) { C._streak = 0; }
}

// Record BEFORE the call-through (pre-answer state).
function recordAnswer(Game, ctx, optId) {
  const C = ctx._census;
  const day = gday(Game);
  let phase = '?', options = [], prompt = '';
  try {
    const T = Game.tableState ? Game.tableState() : {};
    phase = T.phase || '?';
    const tc = (Game.state.scholar || {}).tableChoices || {};
    options = (tc.options || []).map(o => String((o && o.id) || ''));
    prompt = strip(tc.prompt);
  } catch (e) {}
  const kind = optId.indexOf('path:') === 0 ? 'door'
    : optId.indexOf('downgrade:') === 0 ? 'downgrade'
    : optId.indexOf('finals') === 0 || phase === 'finals' ? 'final'
    : 'beat';
  const rec = { day, phase, kind, optId, options, prompt };
  if (kind === 'door') {
    const chosen = optId.slice(5);
    const offered = options.filter(o => o.indexOf('path:') === 0).map(o => o.slice(5));
    rec.chosen = chosen;
    rec.offered = offered;
    rec.offeredFirst = offered.length ? offered[0] === chosen : null;
    // Read-only least-walked-door counterfactual: the least-walked of the
    // 7 paths GLOBALLY so far (sweep order), and whether it was offered.
    const L = ctx._ledger || { walks: {} };
    let cf = PATH_IDS[0], cfN = Infinity;
    for (const pid of PATH_IDS) {
      const n = (L.walks[pid] | 0);
      if (n < cfN) { cfN = n; cf = pid; }
    }
    rec.cfDoor = cf; rec.cfDoorWalks = cfN; rec.cfOffered = offered.indexOf(cf) >= 0;
  }
  return rec;
}

// Complete the record AFTER the call-through (post-answer state).
function finishAnswer(Game, ctx, rec) {
  const C = ctx._census;
  try {
    const T = Game.tableState ? Game.tableState() : {};
    rec.postPath = T.path || null;
    rec.postPhase = T.phase || null;
    rec.postBranch = (T.path === 'relay' && T.band) ? T.band : (T.branch || null);
    // Downgrade answers: the drain picked a lesser door — the previous
    // door failed mid-challenge. Mark the latest open door event.
    if (rec.kind === 'downgrade') {
      const d = rec.optId.slice('downgrade:'.length);
      C.downgrades.push({ day: rec.day, picked: d, options: rec.options });
      for (let i = C.doorEvents.length - 1; i >= 0; i--) {
        if (!C.doorEvents[i].outcome) { C.doorEvents[i].outcome = 'failed-downgrade'; break; }
      }
    }
    if (rec.kind === 'door') {
      const L = ctx._ledger || { walks: {} };
      const ev = {
        day: rec.day, chosen: rec.chosen, branch: rec.postBranch,
        offered: rec.offered, offeredFirst: rec.offeredFirst,
        cfDoor: rec.cfDoor, cfDoorWalks: rec.cfDoorWalks, cfOffered: rec.cfOffered,
        optionsRaw: rec.options, outcome: null, // 'won' | 'failed-downgrade' | 'open'
      };
      C.doorEvents.push(ev);
      L.walks[rec.chosen] = (L.walks[rec.chosen] | 0) + 1;
      C.answers.push(rec);
      return;
    }
    C.answers.push(rec);
  } catch (e) { C.answers.push(rec); }
}

// ---------------------------------------------------------------------
// Beat capture (SENSE-TESTING read): ring buffer like sweep-winconfirm.
const BEAT_RE = /table|seat|ring of pale|path of|defer|overtime|won|win |died|dead|starv|national|regional|exile|crisis|wave [345]|ascend|treaty|◈|the feared|the beloved/i;
function attachBeats(Game, t) {
  t.beats = [];
  const push = (text) => {
    try {
      const s = strip((text && (text.text || text.msg || text.message)) || text);
      if (BEAT_RE.test(s)) {
        t.beats.push({ day: gday(Game), text: s });
        if (t.beats.length > 6000) t.beats.splice(0, 500);
      }
    } catch (e) {}
  };
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  Game.say = function (msg) { push(msg); return origSay ? origSay(msg) : msg; };
  if (origSys) Game.sysSay = function (msg) { push(msg); return origSys ? origSys(msg) : msg; };
}

// ---------------------------------------------------------------------
// SMOKE gate: layer-live markers honest + run completes on both policies.
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const policyId of POLICIES) {
    process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1'; process.env.SEATDRIVE = '1';
    const { Game } = await loadGame({ seed: 11, mode: `pathcensus-smoke-${policyId}`, fullTelemetry: false });
    await setupGame(Game);
    let ctxLive = null, seatLive = null, deferLive = null, censusLive = false;
    const base = policyFor(policyId);
    const ledger = { walks: {} };
    const policy = withPathCensus(base, base.id + '-census', base.desc + ' [PATHCENSUS]', ledger);
    const oSetup = policy.setup;
    policy.setup = (G, ctx) => {
      if (oSetup) oSetup(G, ctx);
      censusLive = !!(ctx && ctx._census);
      seatLive = SD.layerOn(); deferLive = WD.layerOn();
      ctxLive = ctx;
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`${policyId}: seat+defer layers live`, seatLive === true && deferLive === true, `seat=${seatLive} defer=${deferLive}`);
    check(`${policyId}: census instrument live`, censusLive === true, '');
    check(`${policyId}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`${policyId}: instrument left counters`, !!(ctxLive && ctxLive._census), 'ctx._census present');
  }
  delete process.env.SEATDRIVE;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

// ---------------------------------------------------------------------
// DET-GATE: armed+instrument trajectory-identical to plain armed, 4 seeds.
// Both-repeat design: [plain, plain] and [census, census] distinguish a
// real instrument leak from the known timestamp-entropy issue
// (det-gate.js header).
async function runHashes(policy, seed, days) {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1'; process.env.SEATDRIVE = '1';
  const { Game } = await loadGame({ seed, mode: 'pathcensus-det', fullTelemetry: false });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
  let r = null;
  await quietLog(async () => { r = await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
  return hashes.join('\n');
}

async function detGate() {
  const seeds = [131, 242, 353, 464];
  const days = 60;
  let green = 0, total = 0;
  for (const seed of seeds) {
    const ledger = { walks: {} };
    const census = withPathCensus(SD.leadseat, SD.leadseat.id + '-census', SD.leadseat.desc + ' [PATHCENSUS]', ledger);
    const plain = SD.leadseat;
    const hP1 = await runHashes(plain, seed, days);
    const hP2 = await runHashes(plain, seed, days);
    const hC1 = await runHashes(census, seed, days);
    const hC2 = await runHashes(census, seed, days);
    const plainStable = hP1 === hP2;
    const censusStable = hC1 === hC2;
    const identical = plainStable && censusStable && hP1 === hC1;
    total++;
    if (identical) green++;
    console.log(`  seed ${seed}: plain-stable=${plainStable} census-stable=${censusStable} ` +
      `instrument-identical=${hP1 === hC1} ${identical ? 'PASS' : 'FAIL'}`);
  }
  delete process.env.SEATDRIVE;
  console.log(`DET-GATE: ${green}/${total} identical (plain-repeat + census-repeat + plain==census).`);
  if (green < total) { console.error('DET GATE FAILED — instrument is not provably read-only.'); process.exit(4); }
  console.log('DET gate green.');
}

// ---------------------------------------------------------------------
// The sweep.
async function oneRun(seed, policyId, ledger) {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1'; process.env.SEATDRIVE = '1';
  const base = policyFor(policyId);
  const policy = withPathCensus(base, base.id + '-census', base.desc + ' [PATHCENSUS]', ledger);
  const { Game } = await loadGame({ seed, mode: `pathcensus-armed`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  const beats = { beats: [] };
  attachBeats(Game, beats);
  const oDaily = policy.daily;
  const hist = { maxRank: 0, everTable: false };
  const hashes = [];
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
    } catch (e) {}
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  delete process.env.SEATDRIVE;
  const C = (runCtx && runCtx._census) || newCensus();
  // Outcomes: doors still 'open' at run end — won ones get 'won'.
  const won = !!Game.won;
  for (const ev of C.doorEvents) if (!ev.outcome) ev.outcome = won ? 'won' : 'open';
  const pathStarts = {};
  const branchStarts = {};
  for (const ev of C.doorEvents) {
    pathStarts[ev.chosen] = (pathStarts[ev.chosen] | 0) + 1;
    const b = ev.branch || '?';
    branchStarts[ev.chosen + ':' + b] = (branchStarts[ev.chosen + ':' + b] | 0) + 1;
  }
  const doorAnswers = C.doorEvents.length;
  const out = {
    seed, policyId, side: 'armed',
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    // EXACT numeric funnel keys (telemetry-check schema):
    invitations: C.inviteDays,
    sittings: (runCtx && runCtx.sdSeatTaken) | 0,
    answers: (runCtx && runCtx.tableAnswers) | 0,
    doorAnswers,
    pathStarts, branchStarts,
    downgradeFails: C.downgrades.length,
    announcedDay: C.announcedDay, seatDay: (runCtx && runCtx.sdSeatDay) || null,
    seatKind: (runCtx && runCtx.sdSeatKind) || null,
    unansweredStreaks: C.streaks,
    won: won ? 1 : 0,
    doorEvents: C.doorEvents,
    downgrades: C.downgrades,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-armed-s${seed}.json`), JSON.stringify(out, null, 1));
  if (beats.beats.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-armed-s${seed}.json`), JSON.stringify(beats.beats, null, 1));
  }
  const seatN = out.sittings, doors = doorAnswers;
  console.log(`  [armed ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} ` +
    `invDays=${out.invitations} sits=${seatN} ans=${out.answers} doors=${doors} ` +
    `paths=${Object.entries(pathStarts).map(([k, v]) => k + 'x' + v).join(',') || '-'} won=${out.won}`);
  return out;
}

(async () => {
  // Only the sweep runs as the entry point. As a module (required by the
  // proof script), export the instrument without running anything.
  if (require.main !== module) return;
  let only = null;
  if (process.env.ONLY) {
    only = new Set();
    for (const part of String(process.env.ONLY).split(';')) {
      const p = part.trim();
      if (p) only.add(p);
    }
  }
  const match = (p) => !only || only.has(p);

  if (process.env.SMOKE === '1') { await smokeGate(); }
  if (process.env.DET === '1') { await detGate(); return; }

  const ledger = { walks: {} }; // sweep-global least-walked ledger, fixed order
  const recs = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      if (!match(policyId)) continue;
      recs.push(await oneRun(seed, policyId, ledger));
    }
  }

  // ---- summary ----
  console.log('\n== pathcensus funnel ==');
  const sum = (f) => recs.reduce((a, r) => a + (r[f] | 0), 0);
  const med = (xs) => {
    if (!xs.length) return 0;
    const s = xs.slice().sort((a, b) => a - b); const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  console.log(`runs=${recs.length} invitations(days pending)=${sum('invitations')} ` +
    `sittings=${sum('sittings')} answers=${sum('answers')} doorAnswers=${sum('doorAnswers')}`);
  console.log(`  medians: invDays=${med(recs.map(r => r.invitations)).toFixed(1)} ` +
    `announcedDay=${med(recs.filter(r => r.announcedDay != null).map(r => r.announcedDay)).toFixed(0)} ` +
    `seatDay=${med(recs.filter(r => r.seatDay != null).map(r => r.seatDay)).toFixed(0)}`);
  // 14-cell: path x branch
  const cells = {};
  for (const r of recs) for (const [k, v] of Object.entries(r.branchStarts)) cells[k] = (cells[k] || 0) + v;
  console.log('  branch cells: ' + Object.keys(cells).sort().map(k => k + 'x' + cells[k]).join(', '));
  // where doors die: per door event, offered-but-not-first counts + never-offered counts
  const offeredNotFirst = {}, neverOffered = {}, pickedFailed = {}, pickedWon = {}, cfTaken = {}, cfNotOffered = {};
  for (const pid of PATH_IDS) { offeredNotFirst[pid] = 0; neverOffered[pid] = 0; }
  for (const r of recs) {
    for (const ev of r.doorEvents) {
      for (const pid of PATH_IDS) {
        if (ev.offered.indexOf(pid) < 0) neverOffered[pid]++;
        else if (pid !== ev.chosen) offeredNotFirst[pid]++;
      }
      if (ev.outcome === 'won') pickedWon[ev.chosen] = (pickedWon[ev.chosen] | 0) + 1;
      if (ev.outcome === 'failed-downgrade') pickedFailed[ev.chosen] = (pickedFailed[ev.chosen] | 0) + 1;
      if (ev.cfDoor === ev.chosen) cfTaken[ev.cfDoor] = (cfTaken[ev.cfDoor] | 0) + 1;
      if (!ev.cfOffered) cfNotOffered[ev.cfDoor] = (cfNotOffered[ev.cfDoor] | 0) + 1;
    }
  }
  console.log('  neverOffered: ' + PATH_IDS.map(p => p + 'x' + neverOffered[p]).join(', '));
  console.log('  offeredNotFirst (drain picked options[0]): ' + PATH_IDS.map(p => p + 'x' + offeredNotFirst[p]).join(', '));
  console.log('  picked outcomes: won=' + JSON.stringify(pickedWon) + ' failed=' + JSON.stringify(pickedFailed));
  console.log('  least-walked counterfactual taken: ' + JSON.stringify(cfTaken) + ' notOffered: ' + JSON.stringify(cfNotOffered));
  const streaks = recs.flatMap(r => r.unansweredStreaks);
  console.log(`  unanswered modal streaks: n=${streaks.length} max=${streaks.length ? Math.max(...streaks) : 0}d`);
  console.log('  ledger walks (sweep order): ' + JSON.stringify(ledger.walks));
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { withPathCensus, newCensus, recordAnswer, finishAnswer, PATH_IDS, policyFor };
