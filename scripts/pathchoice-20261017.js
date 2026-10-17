#!/usr/bin/env node
// pathchoice-20261017.js — READ-ONLY diagnostic instrument tracing the
// take-seat choice function end to end (flesh-out loop DIAGNOSTIC,
// 2026-10-17, scale-onramp axis, arm sim-pathchoice).
//
// Context: wins replicate (12/16 modal across four seed sets) but ALL are
// lesser-seat feared-path walks. sim-pathcensus (2026-10-15) showed the
// funnel dies at the CHOICE: the winpursuit drain plays options[0], and
// PATHS insertion order puts feared ALWAYS at options[0]; witness was never
// offered in 11/11 (prereq ledger.exposed >= 3). sim-pathselect tried a
// max-standing chooser and was KILLED (feared strength saturates at 100 —
// the chooser walked feared 13/13). Path variety is steve-call #316/#317,
// which needs SHARPER EVIDENCE before Steve rules.
//
// This run does NOT design path selection. It TRACES the choice function
// end to end on the winning substrate and returns a mechanism-level
// VERDICT: is the feared-monopoly a DRAIN ARTIFACT (the bot doesn't choose
// — variety unmeasured, not absent) or a DOOR-SIDE TRUTH (doors genuinely
// unopenable/unreachable)? Is witness offerable on this substrate?
//
// Composition (EXPLICIT per the 2026-10-16 method note: SEATDRIVE env unset
// != driver active — the wrapper must be composed, not merely the env set):
//   SD.withSeatDrive(WD.withWinDefer(TF.leadfeast, ...), ...) / belongfeast
// — the same stack as SD.leadseat/SD.belongseat, composed inline here so the
// composition is visible and asserted. The DET-GATE pins byte-identity with
// the landed require-time objects (finding #389 equivalence).
// Substrate asserted up front:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//   WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 (explicit, not unset)
//
// Seeds: 8 FRESH [1931..1938] x {leadfeast, belongfeast}, 180d
// death-aware. Armed only (no lever change — the instrument's read-only
// proof IS the control).
//
// Per run the instrument traces:
//   (a) every door answer's OFFERED doors (the options array the modal would
//       show, with insertion order) + the engine's own tableEarnedPaths()
//       snapshot at decision time (id/earned/strength/why for all 7);
//   (b) what the drain chose (options[0]) and the exact choice-function
//       inputs at each decision (the drain reads ONLY tc.options — frame,
//       prompt and strengths are never read; proven in the proof script);
//   (c) the witness prereq trajectory — ledger.exposed sampled daily, max
//       reached, changes with days, value at each door answer; what drives
//       it (exposeBribery +2 / resolveCase-exile +1, ledger.js) and whether
//       >=3 is reachable on this substrate;
//   (d) the PATHS insertion order in code — read, cited (index.html load
//       order lines 103-111 -> tableRegisterPath -> Object.keys(PATHS) in
//       tableEarnedPaths (table.js:124) -> options built in that order
//       (table.js:543));
//   (e) a read-only counterfactual per answer: which door a least-walked-door
//       policy would have taken and whether it was offered (the pathcensus
//       Q4 shape, instrument reused).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SMOKE=1 node scripts/pathchoice-20261017.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/pathchoice-20261017.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 DET=1 node scripts/pathchoice-20261017.js   # det-gate only
// Targeted re-runs: SEEDS="1931,1932" ONLY="leadfeast;belongfeast"
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
for (const k of ['WINPURSUIT', 'WINDEFER', 'SEATDRIVE']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required EXPLICITLY (method note: unset != active).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() false despite SEATDRIVE=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-pathchoice');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-17', 'pathchoice-beats');

const PATH_IDS = ['feared', 'indispensable', 'beloved', 'witness', 'assimilated', 'defiant', 'relay'];

// The explicit composition. Method note honored: the driver is active
// because withSeatDrive is WRAPPED here, not because the env var is set.
const WD_LEAD = WD.withWinDefer(TF.leadfeast, 'leadfeast-windefer',
  'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base');
const WD_BELONG = WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer',
  'belongfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base');
const EXPLICIT_LEAD = SD.withSeatDrive(WD_LEAD, 'leadfeast-windefer',
  'leadfeast-windefer + seatdrive EXPLICITLY composed (method note: unset != active)');
const EXPLICIT_BELONG = SD.withSeatDrive(WD_BELONG, 'belongfeast-windefer',
  'belongfeast-windefer + seatdrive EXPLICITLY composed (method note: unset != active)');
const EXPLICIT_STACK = 'SD.withSeatDrive(WD.withWinDefer(TF.{leadfeast,belongfeast})) + WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1';

function policyFor(policyId) {
  return policyId === 'leadfeast' ? EXPLICIT_LEAD : EXPLICIT_BELONG;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const strip = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 300);
const exposedOf = (Game) => { try { return (Game.ledger ? Game.ledger().exposed : 0) | 0; } catch (e) { return 0; } };

// Engine's own door pricing read at the decision moment (read-only).
function earnedSnapshot(Game) {
  try {
    const paths = Game.tableEarnedPaths ? Game.tableEarnedPaths() : [];
    return paths.map(p => ({ id: p.id, earned: !!p.earned, strength: p.strength | 0, why: strip(p.why).slice(0, 120) }));
  } catch (e) { return []; }
}

// ---------------------------------------------------------------------
// The instrument: read-only choice-function trace over the explicit stack.
// `ledger` is the sweep-global door-walk ledger (mutated by the sweep
// process only — the instrument's per-answer counterfactual reads it).
function newCensus() {
  return {
    answers: [], doorEvents: [], downgrades: [],
    inviteDays: 0, announcedDay: null,
    exposedMax: 0, exposedChanges: [], // {day, exposed}
    _lastExposed: null,
  };
}

function withPathChoice(base, id, desc, ledger) {
  return Object.assign({}, base, {
    id, desc,
    setup(Game, ctx) {
      ctx._choice = newCensus();
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
      const r = base.daily(Game, ctx);
      postDawn(Game, ctx);
      return r;
    },
  });
}

// Read-only pre-dawn snapshot: invitation state + exposed trajectory.
function preDawn(Game, ctx) {
  const C = ctx._choice;
  try {
    const pg = Game.progState ? Game.progState() : {};
    if (pg.tableWaiting && C.announcedDay == null) C.announcedDay = gday(Game);
    let pv = null;
    try { pv = (typeof Game.tablePreview === 'function') ? Game.tablePreview() : null; } catch (e) {}
    if (pv && !pg.tableDone && !(ctx.sdSeatTaken > 0)) C.inviteDays++;
  } catch (e) {}
}

function postDawn(Game, ctx) {
  const C = ctx._choice;
  try {
    const ex = exposedOf(Game);
    if (C._lastExposed == null || ex !== C._lastExposed) {
      C.exposedChanges.push({ day: gday(Game), exposed: ex });
      C._lastExposed = ex;
    }
    if (ex > C.exposedMax) C.exposedMax = ex;
  } catch (e) {}
}

// Record BEFORE the call-through (pre-answer state). Captures the drain's
// exact choice-function inputs: tc.frame + tc.options (the drain reads
// ONLY options[0].id — winseek.js tableRoad; never the prompt, strengths,
// or the earned snapshot — the proof script pins this positionally).
function recordAnswer(Game, ctx, optId) {
  const C = ctx._choice;
  const day = gday(Game);
  let phase = '?', options = [], frame = '', prompt = '';
  try {
    const T = Game.tableState ? Game.tableState() : {};
    phase = T.phase || '?';
    const tc = (Game.state.scholar || {}).tableChoices || {};
    options = (tc.options || []).map(o => String((o && o.id) || ''));
    frame = String(tc.frame || '');
    prompt = strip(tc.prompt);
  } catch (e) {}
  const kind = optId.indexOf('path:') === 0 ? 'door'
    : optId.indexOf('downgrade:') === 0 ? 'downgrade'
    : optId.indexOf('finals') === 0 || phase === 'finals' ? 'final'
    : 'beat';
  const rec = { day, phase, kind, optId, options, frame, prompt,
    drainInputs: { frame, optionCount: options.length, options } };
  if (kind === 'door') {
    const chosen = optId.slice(5);
    const offered = options.filter(o => o.indexOf('path:') === 0).map(o => o.slice(5));
    rec.chosen = chosen;
    rec.offered = offered;
    rec.offeredFirst = offered.length ? offered[0] === chosen : null;
    rec.chosenIndex = offered.indexOf(chosen);
    // The engine's own pricing at the decision moment — what the modal's
    // priced-but-unearned lines said aloud, and the witness prereq state.
    rec.earnedSnapshot = earnedSnapshot(Game);
    rec.exposedAtDoor = exposedOf(Game);
    const wit = rec.earnedSnapshot.find(p => p.id === 'witness');
    rec.witnessWhy = wit ? wit.why : null;
    // Read-only least-walked-door counterfactual (pathcensus Q4 shape).
    const L = ctx._ledger || { walks: {} };
    let cf = PATH_IDS[0], cfN = Infinity;
    for (const pid of PATH_IDS) {
      const n = (L.walks[pid] | 0);
      if (n < cfN) { cfN = n; cf = pid; }
    }
    rec.cfDoor = cf; rec.cfDoorWalks = cfN; rec.cfOffered = offered.indexOf(cf) >= 0;
    // Least-walked OFFERED door (the variety actually on the menu).
    let cfO = offered[0] || null, cfON = Infinity;
    for (const pid of offered) {
      const n = (L.walks[pid] | 0);
      if (n < cfON) { cfON = n; cfO = pid; }
    }
    rec.cfOfferedDoor = cfO; rec.cfOfferedWalks = cfON;
  }
  return rec;
}

// Complete the record AFTER the call-through (post-answer state).
function finishAnswer(Game, ctx, rec) {
  const C = ctx._choice;
  try {
    const T = Game.tableState ? Game.tableState() : {};
    rec.postPath = T.path || null;
    rec.postPhase = T.phase || null;
    rec.postBranch = (T.path === 'relay' && T.band) ? T.band : (T.branch || null);
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
        day: rec.day, chosen: rec.chosen, chosenIndex: rec.chosenIndex,
        branch: rec.postBranch,
        offered: rec.offered, offeredFirst: rec.offeredFirst,
        earnedSnapshot: rec.earnedSnapshot, exposedAtDoor: rec.exposedAtDoor,
        witnessWhy: rec.witnessWhy,
        drainInputs: rec.drainInputs,
        cfDoor: rec.cfDoor, cfDoorWalks: rec.cfDoorWalks, cfOffered: rec.cfOffered,
        cfOfferedDoor: rec.cfOfferedDoor, cfOfferedWalks: rec.cfOfferedWalks,
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
const BEAT_RE = /table|seat|ring of pale|path of|defer|overtime|won|win |died|dead|starv|national|regional|exile|crisis|wave [345]|ascend|treaty|◈|the feared|the beloved|expose|exposure|docket|trial|moot/i;
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
  if (origSys) Game.sysSay = function (msg) { push(msg); return origSys(msg); };
}

// ---------------------------------------------------------------------
// SMOKE gate: layers live, explicit composition live, run completes,
// per-seed JSON schema-valid, instrument left counters.
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  check('composition: explicit withSeatDrive in desc', /EXPLICITLY composed/.test(EXPLICIT_LEAD.desc) && /EXPLICITLY composed/.test(EXPLICIT_BELONG.desc), '');
  check('composition: NOT the require-time objects', EXPLICIT_LEAD !== SD.leadseat && EXPLICIT_BELONG !== SD.belongseat, 'distinct objects');
  check('composition: desc still names the win-side stack', /windefer|WINDEFER/i.test(EXPLICIT_LEAD.desc), '');
  for (const policyId of POLICIES) {
    const { Game } = await loadGame({ seed: 11, mode: `pathchoice-smoke-${policyId}`, fullTelemetry: false });
    await setupGame(Game);
    let ctxLive = null, seatLive = null, deferLive = null, choiceLive = false, seatDriven = false;
    const base = policyFor(policyId);
    const ledger = { walks: {} };
    const policy = withPathChoice(base, base.id + '-choice', base.desc + ' [PATHCHOICE]', ledger);
    const oSetup = policy.setup;
    policy.setup = (G, ctx) => {
      if (oSetup) oSetup(G, ctx);
      choiceLive = !!(ctx && ctx._choice);
      seatLive = SD.layerOn(); deferLive = WD.layerOn();
      ctxLive = ctx;
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`${policyId}: seat+defer layers live`, seatLive === true && deferLive === true, `seat=${seatLive} defer=${deferLive}`);
    check(`${policyId}: choice instrument live`, choiceLive === true, '');
    check(`${policyId}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`${policyId}: exposed sampled`, !!(ctxLive && ctxLive._choice && ctxLive._choice._lastExposed != null), `last=${ctxLive && ctxLive._choice && ctxLive._choice._lastExposed}`);
  }
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

// ---------------------------------------------------------------------
// DET-GATE: explicit-composed+instrument trajectory-identical to the landed
// require-time stack (SD.leadseat plain), 4 seeds x 60d.
// Both-repeat design: [plain, plain] and [traced, traced] distinguish a real
// instrument leak from the known timestamp-entropy issue (det-gate.js).
async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'pathchoice-det', fullTelemetry: false });
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
  const seeds = [1931, 1942, 1953, 1964];
  const days = 60;
  let green = 0, total = 0;
  for (const seed of seeds) {
    const ledger = { walks: {} };
    const traced = withPathChoice(EXPLICIT_LEAD, EXPLICIT_LEAD.id + '-choice', EXPLICIT_LEAD.desc + ' [PATHCHOICE]', ledger);
    const plain = SD.leadseat; // landed require-time stack (explicit composition, default-ON env form)
    process.env.SEATDRIVE = '1';
    const hP1 = await runHashes(plain, seed, days);
    const hP2 = await runHashes(plain, seed, days);
    const hT1 = await runHashes(traced, seed, days);
    const hT2 = await runHashes(traced, seed, days);
    const plainStable = hP1 === hP2;
    const tracedStable = hT1 === hT2;
    const identical = plainStable && tracedStable && hP1 === hT1;
    total++;
    if (identical) green++;
    console.log(`  seed ${seed}: plain-stable=${plainStable} traced-stable=${tracedStable} ` +
      `explicit==landed=${hP1 === hT1} ${identical ? 'PASS' : 'FAIL'}`);
  }
  console.log(`DET-GATE: ${green}/${total} identical (plain-repeat + traced-repeat + explicit==landed).`);
  if (green < total) { console.error('DET GATE FAILED — instrument/composition is not provably read-only.'); process.exit(4); }
  console.log('DET gate green: explicit composition == the landed stack, instrument read-only.');
}

// ---------------------------------------------------------------------
// The sweep.
async function oneRun(seed, policyId, ledger) {
  const base = policyFor(policyId);
  const policy = withPathChoice(base, base.id + '-choice', base.desc + ' [PATHCHOICE]', ledger);
  const { Game } = await loadGame({ seed, mode: `pathchoice-armed`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  const beats = { beats: [] };
  attachBeats(Game, beats);
  const oDaily = policy.daily;
  const hist = { everTable: false, everFull: false };
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
  const C = (runCtx && runCtx._choice) || newCensus();
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
  let finalExposed = 0, rank = null, tableSeat = null;
  try {
    finalExposed = exposedOf(Game);
    const pg = Game.progState ? Game.progState() : {};
    rank = (typeof Game.scaleRank === 'function') ? Game.scaleRank() : null;
    const ts = Game.tableSeat ? Game.tableSeat() : null;
    tableSeat = ts && ts.seat;
  } catch (e) {}
  const out = {
    seed, policyId, side: 'armed', stack: EXPLICIT_STACK,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    invitations: C.inviteDays,
    sittings: (runCtx && runCtx.sdSeatTaken) | 0,
    answers: (runCtx && runCtx.tableAnswers) | 0,
    doorAnswers,
    pathStarts, branchStarts,
    downgradeFails: C.downgrades.length,
    announcedDay: C.announcedDay, seatDay: (runCtx && runCtx.sdSeatDay) || null,
    seatKind: (runCtx && runCtx.sdSeatKind) || null,
    // Witness prereq trajectory (c)
    exposedMax: C.exposedMax, exposedFinal: finalExposed, exposedChanges: C.exposedChanges,
    won: won ? 1 : 0, rank, tableSeat, everTable: hist.everTable,
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
    `exposedMax=${out.exposedMax} paths=${Object.entries(pathStarts).map(([k, v]) => k + 'x' + v).join(',') || '-'} won=${out.won}`);
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

  if (process.env.SMOKE === '1') { await smokeGate(); return; }
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
  console.log('\n== pathchoice trace ==');
  const sum = (f) => recs.reduce((a, r) => a + (r[f] | 0), 0);
  const med = (xs) => {
    if (!xs.length) return 0;
    const s = xs.slice().sort((a, b) => a - b); const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  console.log(`runs=${recs.length} sittings=${sum('sittings')} answers=${sum('answers')} doorAnswers=${sum('doorAnswers')}`);
  // (a)+(b): per door event — offered set (insertion order), chosen, choice inputs
  let attr = 0, attrTotal = 0;
  for (const r of recs) {
    for (const ev of r.doorEvents) {
      attrTotal++;
      if (ev.offered && ev.chosen != null && ev.drainInputs && ev.earnedSnapshot) attr++;
    }
  }
  console.log(`attribution: ${attr}/${attrTotal} door answers fully traced (offered+chosen+drainInputs+earnedSnapshot)`);
  // (c): witness prereq
  console.log(`witness: max exposedMax=${Math.max(...recs.map(r => r.exposedMax))} ` +
    `runs with exposed>=3: ${recs.filter(r => r.exposedMax >= 3).length}/${recs.length}`);
  const witOffered = recs.reduce((a, r) => a + r.doorEvents.filter(e => e.offered.indexOf('witness') >= 0).length, 0);
  console.log(`witness offered on ${witOffered} door answers (of ${attrTotal})`);
  // 14-cell
  const cells = {};
  for (const r of recs) for (const [k, v] of Object.entries(r.branchStarts)) cells[k] = (cells[k] || 0) + v;
  console.log('  branch cells: ' + (Object.keys(cells).sort().map(k => k + 'x' + cells[k]).join(', ') || '(none)'));
  // (e): counterfactuals
  const cf = {};
  for (const r of recs) for (const ev of r.doorEvents) {
    const k = ev.cfOfferedDoor || '?';
    cf[k] = (cf[k] || 0) + 1;
  }
  console.log('  least-walked-OFFERED counterfactual: ' + Object.entries(cf).map(([k, v]) => k + 'x' + v).join(', '));
})().catch(e => { console.error('SWEEP FATAL', e); process.exit(1); });

if (require.main !== module) {
  module.exports = { withPathChoice, newCensus, PATH_IDS, policyFor, EXPLICIT_STACK, EXPLICIT_LEAD, EXPLICIT_BELONG, earnedSnapshot, exposedOf };
}
