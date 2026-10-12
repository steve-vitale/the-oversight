#!/usr/bin/env node
// sim-harness.js — THE shared node harness for world sims (Steve 2026-10-09).
// Every sim script must require this instead of copying the eval boilerplate.
// (The idle-village sim's evidence lists 4 bugs that were pure harness
// mistakes, not game bugs — one shared module kills that whole class.)
//
// Usage:
//   const { loadGame, runDays } = require('./sim-harness');
//   const { Game, manifest } = await loadGame({ seed: 42, mode: 'mvc', fullTelemetry: true });
//   const result = await runDays(Game, policy, { days: 365, manifest });
//   // result: { days, endReason, telemetry, samples, ms, manifest }
//
// Rules (AGENTS.md, hard-won):
// - mulberry32 seeded BEFORE eval — modules capture Math.random at load.
// - Full src/js list in index.html order, minus DOM-only
//   (app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js).
// - window stubbed for eval, then deleted (else combat goes async and stalls).
// - Never run two harnesses concurrently in one process (shared transform
//   state + fixture state) — sweep.js runs seeds sequentially.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function gitCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim();
  } catch (e) { return 'unknown'; }
}

// SIM-OPT (2026-10-10): harness-level process optimizations for sims.
// SIMOPT=0 disables all of them. Game balance, policy decisions, and sim
// semantics are untouched — only UI-only recomputation is slimmed.
// Honesty proof: scripts/test-simopt-trajectory-20261010.js asserts
// identical per-day trajectory hashes ON vs OFF, plus the tent-shred
// scenario still converging.
const SIMOPT = process.env.SIMOPT !== '0';

// quietLog(fn): run fn (may be async) with console.log silenced, restored
// afterwards. Game code's only console.log calls are the two [SLEEP]
// diagnostics, which fire every simulated night — pure noise in sweeps.
// Sweep scripts' own progress logging happens between seeds, OUTSIDE this
// wrapper, so it keeps working. console.warn / console.error are untouched.
async function quietLog(fn) {
  const orig = console.log;
  console.log = function () {};
  try { return await fn(); } finally { console.log = orig; }
}

// applySimOpt(Game): slim the two UI-only hot spots for sims. Called from
// loadGame when SIMOPT is on.
function applySimOpt(Game) {
  // SLIM status(): the full status() builds a ~60-field UI object on every
  // call, and both advancePart and sleep end in `this.save(); return
  // this.status();` — so it runs ~4x per simulated day (~10% of sim wall,
  // plus kcalCap/feastState/packCapacity recomputation it drags in).
  // Policies never read status() returns (verified 2026-10-10: no game-code
  // consumer reads fields off it; sim drivers discard the returns).
  // Only three calls have side effects, and all three are kept:
  //   migrateReserve(), migrateLumps() — one-time save migrations;
  //   validateInsideTent() — the tent-shred choke (must keep working).
  // The full builder survives as Game._fullStatus for any script that needs
  // real UI fields in a sim context.
  const fullStatus = Game.status;
  Game._fullStatus = fullStatus;
  Game.status = function () {
    const s = this.state.scholar;
    if (this.migrateReserve) this.migrateReserve();
    if (this.migrateLumps) this.migrateLumps();
    try { this.validateInsideTent(); } catch (e) {}
    return {
      day: s && s.day, dayPart: this.dayPart,
      over: !!this.over, won: !!this.won,
      inCombat: !!this.tbfight, pendingEncounter: !!this.pendingEncounter,
    };
  };
  // SAVE STUB REMOVED (2026-10-10): the stub assumed "sims never load
  // saves", but proof tests legitimately exercise save/load in the harness
  // (e.g. test-feast-buff.js G10). The ~2% stringify cost is not worth
  // breaking save/load semantics — correctness over speed. Real Game.save
  // is kept; only status() stays slimmed above.
}

function manifest(seed, mode) {
  return {
    seed: seed,
    commit: gitCommit(),
    mode: mode || '?',
    date: new Date().toISOString().slice(0, 10),
    node: process.version,
  };
}

// loadGame({seed, mode, fullTelemetry}) -> { Game, manifest }
// fullTelemetry sets TELEMETRY_FULL=1 so Game.tele() keeps the whole stream
// (production keeps the 300-event ring cap — memory).
async function loadGame(opts) {
  opts = opts || {};
  const seed = opts.seed != null ? opts.seed : 20261009;
  const mode = opts.mode || '?';
  if (opts.fullTelemetry) process.env.TELEMETRY_FULL = '1';

  Math.random = mulberry32(seed);

  global.fetch = (f) => Promise.resolve({
    json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  });

  const order = execSync(`grep -o 'src/js/[^"'"'"']*\\.js' index.html | head -80`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));

  global.window = global;
  const loadFails = [];
  order.forEach(f => {
    try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
    catch (e) { loadFails.push(f + ': ' + e.message); }
  });
  delete global.window;

  const Game = globalThis.Scattering.Game;
  // Silence narration/audio/drama for sims — telemetry + state carry the signal.
  Game.say = function () {};
  Game.sysSay = function () {};
  Game.audioEvent = function () {};
  if (Game.drama === undefined) Game.drama = function () {};

  if (SIMOPT) applySimOpt(Game);

  await Game.init();
  return { Game, manifest: manifest(seed, mode), loadFails };
}

// Standard new-game setup shared by sims: generate roster, start, depart.
async function setupGame(Game, place, rosterId) {
  place = place || 'Columbus, Ohio';
  Game.genRoster(place);
  const rid = rosterId != null ? rosterId : Game.generatedRoster[0].id;
  Game.newGame(place, null, rid);
  Game.depart();
}

// runDays(Game, policy, opts) — the shared day loop.
// policy: { id, setup?(Game, ctx), upkeep?(Game, ctx), daily?(Game, ctx),
//           fight?(Game, ctx), contest?(Game, ctx) }
// opts: { days, manifest, sampleEvery }
// Returns { days, endReason, telemetry, samples, pacing, ms, manifest, policyId }.
// Telemetry comes from Game.state.telemetry (full stream when
// TELEMETRY_FULL=1); samples are daily [day, value] curves; pacing is the
// always-on per-day player-verb proxy (see PACING PROXY block).
async function runDays(Game, policy, opts) {
  opts = opts || {};
  const days = opts.days || 365;
  const sampleEvery = opts.sampleEvery || 1;
  const ctx = { policyId: policy.id, notes: [] };
  const t0 = Date.now();

  const samples = { pop: [], pantry: [], knowledge: [], trust: [], deaths: [], villagers: [] };
  // VILLAGER SNAPSHOT (coverage 2026-10-09): per-villager differentiation —
  // are villagers becoming different people? Captured every 30 loop-days:
  // occupation/profile, held abilities, agency XP tracks, key life stats.
  const villagerSnapshot = () => {
    try {
      const v = Game.state.village || {};
      const out = [];
      for (const vid of (v.roster || [])) {
        let person = null, ag = null;
        try { person = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
        try { ag = Game.agencyOf ? Game.agencyOf(vid) : null; } catch (e) {}
        const axp = ((ag || {}).xp || {})[vid] || {};
        const astats = ((ag || {}).stats || {})[vid] || {};
        out.push({
          vid: String(vid).slice(0, 12),
          occ: (person && (person.occupationId || person.formerOccupation)) || '?',
          profile: ((ag && ag.profiles && ag.profiles[vid]) || '?'),
          abilities: ((v.npcAbilities || {})[vid] || []).slice(),
          xp: { t: axp.tracking || 0, s: axp.survival || 0, b: axp.bravery || 0 },
          kills: astats.monsterKills || 0, exped: astats.expeditions || 0,
        });
      }
      return out;
    } catch (e) { return []; }
  };
  const pop = () => ((Game.state.village || {}).roster || []).length;
  const pantryKcal = () => {
    try {
      return ((Game.state.village || {}).pantry || [])
        .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    } catch (e) { return 0; }
  };
  const knownPlants = () => {
    try { return Object.keys((Game.state.codex || {}).plants || {}).length; }
    catch (e) { return 0; }
  };
  const trustStats = () => {
    try {
      const tr = Object.values((Game.state.village || {}).trust || {});
      if (!tr.length) return null;
      const mean = tr.reduce((a, b) => a + b, 0) / tr.length;
      return { mean: +mean.toFixed(1), min: Math.min.apply(null, tr), n: tr.length };
    } catch (e) { return null; }
  };

  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { ctx.notes.push('setup: ' + e.message); } }

  // PACING PROXY (measurement 2026-10-11): headless sims can't measure wall
  // clock, so we count what a live player spends time on: player-verb
  // invocations per game-day. Cheap, always on. result.pacing.perDay rows:
  // { day, verbs, policyCalls, dayTicks }.
  //   verbs: calls to the documented player-verb list below. Caveat: a few
  //     are also called internally by game code (notably eat), so this is an
  //     UPPER bound on deliberate player decisions.
  //   policyCalls: upkeep/daily/fight/contest hook firings — the STRICT lower
  //     bound (every one is a player-side decision point).
  //   dayTicks: scholar.dayTicks sampled pre-sleep — how much of the 512-tick
  //     day budget got consumed.
  // Neither touches RNG: determinism unaffected.
  const PACING_VERBS = ['doAction', 'contestChoose', 'tbPlayerStrike', 'tbPlayerWait',
    'talkTo', 'convoTurn', 'eat', 'takeFromPantry', 'donateToPantry', 'stealFrom', 'travelTo'];
  const pacingDays = {};
  const pacingDay = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const pacingBump = (kind) => {
    const d = pacingDay();
    const row = pacingDays[d] || (pacingDays[d] = { day: d, verbs: 0, policyCalls: 0, dayTicks: 0 });
    row[kind]++;
  };
  ctx._pacingBump = pacingBump;
  for (const v of PACING_VERBS) {
    try {
      const orig = Game[v];
      if (typeof orig === 'function' && !orig._pacingWrapped) {
        const w = function (...a) { pacingBump('verbs'); return orig.apply(this, a); };
        w._pacingWrapped = true;
        Game[v] = w;
      }
    } catch (e) {}
  }

  let day;
  // TIME-FREEZE WATCHDOG (crisis leg 2026-10-11): a fight that neither side
  // can advance freezes the day clock (tickAction no-ops mid-fight) — probed
  // 160 loop-days stuck on day 22 with fight=true. Mirrors winrate-iter4's
  // proven guard: 8 loop-days with no day advance + an unresolved fight ->
  // the player is routed (flee), the honest in-fiction resolution.
  let lastSday = null, frozenIters = 0;
  // SIM-OPT: silence the [SLEEP] diagnostics during the day loop only.
  await quietLog(async () => {
  for (day = 1; day <= days; day++) {
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { if (ctx._pacingBump) ctx._pacingBump('policyCalls'); policy.upkeep(Game, ctx); } catch (e) {} }
      driveFights(Game, policy, ctx);
      driveContests(Game, policy, ctx);
      if (Game.over) break;
      // DAY LOOP (crisis leg 2026-10-11): villagerTurn-corrected — NEVER raw
      // tickAction(128). doAction('wait') ticks to the part boundary AND runs
      // villagerTurn (NPCs act as individuals); raw tickAction skipped the
      // villager turn entirely (0 calls in 30 parts probed) and stalled the
      // day clock (~0.1 day/loop-day under a real policy: sleep() then
      // refused on the half-spent day). Pattern matches winrate-iter4's
      // proven runOne: wait, then drive fights+contests again after.
      try { Game.doAction('wait'); } catch (e) {}
      driveFights(Game, policy, ctx);
      driveContests(Game, policy, ctx);
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { if (ctx._pacingBump) ctx._pacingBump('policyCalls'); policy.daily(Game, ctx); } catch (e) {} }
    // PACING PROXY: sample the consumed tick budget before sleep rolls the day.
    try {
      const pd = pacingDay(), prow = pacingDays[pd];
      if (prow) prow.dayTicks = (Game.state.scholar || {}).dayTicks || 0;
    } catch (e) {}
    try { Game.sleep(); } catch (e) {}
    driveContests(Game, policy, ctx);
    if (Game.over) break;
    try {
      const sday = (Game.state.scholar || {}).day || 0;
      if (lastSday !== null && sday === lastSday) {
        if (++frozenIters >= 8 && Game.tbfight && !Game.tbfight.over) {
          try { Game.tbEnd('routed'); ctx.timeFreezeCleared = (ctx.timeFreezeCleared || 0) + 1; } catch (e) {}
          frozenIters = 0;
        }
      } else { frozenIters = 0; lastSday = sday; }
    } catch (e) {}
    if (day % sampleEvery === 0) {
      samples.pop.push([day, pop()]);
      samples.pantry.push([day, Math.round(pantryKcal())]);
      samples.knowledge.push([day, knownPlants()]);
      const ts = trustStats();
      samples.trust.push([day, ts ? ts.mean : null]);
      if (day % 30 === 0) samples.villagers.push([day, villagerSnapshot()]);
    }
    if (pop() === 0) break;
  }
  }); // end quietLog day loop

  // Deaths also come from the telemetry stream; keep a compact list here.
  try {
    for (const ev of (Game.state.telemetry || [])) {
      if (ev.type === 'death') samples.deaths.push({ day: ev.day, kind: ev.kind, who: ev.who, cause: ev.cause });
    }
  } catch (e) {}
  // Final villager snapshot (coverage 2026-10-09): short runs never reach
  // the 30-day cadence — always capture the end state for differentiation.
  try { samples.villagers.push([day > days ? days : day, villagerSnapshot()]); } catch (e) {}

  const endReason = Game.over
    ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (day > days ? 'survived' : 'pop-zero');

  // End-state learned sets (coverage 2026-10-09): unioned across runs, these
  // answer "which skills/plants were NEVER learned". Cheaper than tele events.
  let learnedPlants = [], learnedSkills = [];
  try { learnedPlants = Object.keys((Game.state.codex || {}).plants || {}); } catch (e) {}
  try { learnedSkills = Object.keys((Game.state.codex || {}).skills || {}); } catch (e) {}
  let gameDays = 0;
  try { gameDays = Game.state.scholar.day || 0; } catch (e) {}
  // WAVE UNLOCK STATE (gap triage 2026-10-09): "not reached in N seeds"
  // should say whether the wave even unlocked — trigger vs reachability.
  let maxWaveUnlocked = 1;
  try { maxWaveUnlocked = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  let waveKills = {};
  try { waveKills = Object.assign({}, Game.state.waveKills || {}); } catch (e) {}

  // PACING PROXY summary: per-day rows + means for the standard table.
  const perDay = Object.keys(pacingDays).map(Number).sort((a, b) => a - b)
    .map(d => pacingDays[d]);
  const meanOf = (k) => perDay.length
    ? +(perDay.reduce((t, r) => t + (r[k] || 0), 0) / perDay.length).toFixed(1) : 0;

  return {
    days: day > days ? days : day,
    gameDays,
    maxWaveUnlocked, waveKills,
    endReason,
    telemetry: Game.state.telemetry || [],
    samples,
    learnedPlants, learnedSkills,
    pacing: {
      perDay,
      meanVerbsPerDay: meanOf('verbs'),
      meanPolicyCallsPerDay: meanOf('policyCalls'),
      meanTicksPerDay: meanOf('dayTicks'),
    },
    ms: Date.now() - t0,
    manifest: opts.manifest || manifest('?', policy.id),
    policyId: policy.id,
    notes: ctx.notes,
  };
}

// Default fight driver: strike nearest live monster on the player's turn.
// Policies override via policy.fight(Game, ctx) returning true when handled.
function driveFights(Game, policy, ctx) {
  const TR = process.env.FIGHTTRACE ? (m) => { try { console.error('[DF] ' + m); } catch (e) {} } : null;
  let guard = 0, still = 0, lastSig = '';
  let exitWhy = 'loop-end';
  // NO-PROGRESS BREAK (coverage 2026-10-09): a policy no-op that never
  // advances the fight (e.g. out-of-range strikes) used to spin 200× while
  // the game clock froze. Break when the fight state stops changing.
  const sig = () => {
    try {
      const f = Game.tbfight;
      if (!f) return 'none';
      // Positions included: a stall where nobody moves or bleeds (the
      // turtle standoff — journey-scale r2 2026-10-11) must read as
      // no-progress. turnIdx alone always changes and masked it.
      return f.fighters.map(x => Math.round(x.hp || 0) + '@' + (x.mx != null ? x.mx : '?') + ',' + (x.my != null ? x.my : '?')).join(';') + ':' + (f.over ? 1 : 0);
    } catch (e) { return 'err'; }
  };
  while (Game.tbfight && !Game.tbfight.over && guard++ < 200) {
    if (Game.over) { exitWhy = 'game-over'; break; }
    if (policy.fight) {
      let handled = false;
      try { if (ctx._pacingBump) ctx._pacingBump('policyCalls'); handled = policy.fight(Game, ctx); } catch (e) { if (TR) TR('policy.fight threw: ' + (e && e.message)); }
      if (handled) continue;
    }
    // ABILITY-USING POLICIES (longsim food 2026-10-11): a policy's fight hook
    // (e.g. useAbility) can END the fight — tbfight null or over — and return
    // handled=false. The old code dereferenced tbfight right after.
    if (!Game.tbfight || Game.tbfight.over) break;
    const tgt = Game.tbfight.fighters.find(x => x.kind === 'monster' && (x.hp || 0) > 0);
    if (tgt && Game.tbIsPlayerTurn()) {
      try { Game.tbPlayerStrike(tgt.key); } catch (e) {}
    }
    if (!Game.tbfight || Game.tbfight.over) { exitWhy = 'fight-null-or-over'; break; }
    if (Game.tbIsPlayerTurn()) {
      try {
        const p = Game.tbFighter('p');
        p.moveLeft = 0; p.acted = true;
        Game.tbAfterPlayerAction();
      } catch (e) { exitWhy = 'default-turn-threw'; break; }
    } else { exitWhy = 'not-player-turn'; break; }
    const s = sig();
    if (s === lastSig) { if (++still > 10) { try { (ctx.notes || (ctx.notes = [])).push('driveFights: no progress for 10 rounds, breaking'); } catch (e2) {} exitWhy = 'no-progress'; break; } }
    else { still = 0; lastSig = s; }
  }
  if (TR) TR(`exit: ${exitWhy} guard=${guard} fight=${Game.tbfight ? Game.tbfight.id + ' round=' + Game.tbfight.round + ' over=' + Game.tbfight.over : 'none'}`);
}

// Default contest driver: pick choice 0 until the contest clears.
// Policies override via policy.contest(Game, ctx) returning true when handled.
function driveContests(Game, policy, ctx) {
  let guard = 0;
  while (Game.state.activeContest && guard++ < 400) {
    driveFights(Game, policy, ctx);
    if (Game.over) break;
    if (policy.contest) {
      let handled = false;
      try { if (ctx._pacingBump) ctx._pacingBump('policyCalls'); handled = policy.contest(Game, ctx); } catch (e) {}
      if (handled) continue;
    }
    try {
      if (Game.state.activeContest && !(Game.tbfight && !Game.tbfight.over)) {
        Game.contestChoose(0);
      }
    } catch (e) { break; }
    if (Game.over) break;
  }
  driveFights(Game, policy, ctx);
  if (Game.pendingEncounter && Game.pendingMonsterId) {
    try {
      const mid = Game.pendingMonsterId;
      Game.pendingEncounter = false; Game.pendingMonsterId = null;
      Game.startCombat(mid);
      driveFights(Game, policy, ctx);
    } catch (e) {}
  }
}

module.exports = { mulberry32, loadGame, setupGame, runDays, manifest, driveFights, driveContests, quietLog, ROOT };
