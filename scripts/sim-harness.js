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

// instrumentCatches(src, file): rewrite empty catch blocks to report into
// global.__simSwallowed[site] = {n, msg}. Line count is preserved.
// Matches `catch (x) {}`, `catch (x) { /* note */ }` and `catch {}`.
function instrumentCatches(src, file) {
  if (!global.__simSwallow) {
    global.__simSwallowed = global.__simSwallowed || {};
    global.__simSwallow = function (e, site) {
      const r = global.__simSwallowed[site] || (global.__simSwallowed[site] = { n: 0, msg: '' });
      r.n++;
      if (!r.msg) r.msg = String((e && (e.message || e)) || e).slice(0, 160);
    };
  }
  return src.split('\n').map((ln, i) => ln
    .replace(/catch\s*\(\s*([A-Za-z_$][\w$]*)\s*\)\s*\{\s*(?:\/\*[^*]*\*\/\s*)?\}/g,
      (m, v) => `catch (${v}) { __simSwallow(${v}, '${file}:${i + 1}'); }`)
    .replace(/catch\s*\{\s*\}/g, `catch (__se) { __simSwallow(__se, '${file}:${i + 1}'); }`)
  ).join('\n');
}
// swallowReport(): sorted [{site, n, msg}] of everything swallowed so far.
function swallowReport() {
  const o = global.__simSwallowed || {};
  return Object.keys(o).map(k => ({ site: k, n: o[k].n, msg: o[k].msg })).sort((a, b) => b.n - a.n);
}

// loadGame({seed, mode, fullTelemetry}) -> { Game, manifest }
// fullTelemetry sets TELEMETRY_FULL=1 so Game.tele() keeps the whole stream
// (production keeps the 300-event ring cap — memory).
async function loadGame(opts) {
  opts = opts || {};
  const seed = opts.seed != null ? opts.seed : 20261009;
  const mode = opts.mode || '?';
  // Per call, never sticky (audit 2026-10-14: a prior fullTelemetry load
  // leaked TELEMETRY_FULL into later loads in the same process).
  // Default FULL in sims (audit 2026-10-14: ~15 analysis scripts read the
  // stream without asking and silently saw only the last 300 events). The
  // 300-event ring is a phone-memory guard; pass fullTelemetry:false to keep it.
  if (opts.fullTelemetry !== false) process.env.TELEMETRY_FULL = '1'; else delete process.env.TELEMETRY_FULL;

  Math.random = mulberry32(seed);

  // DETERMINISTIC CLOCK (entropy-hunt r27, 2026-10-14): game code embeds
  // Date.now() in generated IDs (villager app_<ts>_<rand> in membership.js,
  // fighter keys 'm_ur_'+Date.now()%100000, link/scam/visitor/fight IDs).
  // Real wall-clock makes those IDs differ on every run, and at least one
  // consumer is order-sensitive — s11/s22/s33/s88 diverged A/A on days
  // 41-86 even after the r26 contest-seed fix, while freezing Date.now()
  // flips all four to bit-identical. The sim clock is monotonic and
  // deterministic: FIXED_BASE + per-loadGame call count. Uniqueness within
  // a run is preserved (every call yields a fresh value, like wall-clock);
  // reproducibility across runs holds (same seed → same call sequence →
  // same IDs). No game logic branches on wall-clock VALUES — the
  // expedition clock is game-time (abilityActions.js), pacing telemetry
  // uses performance.now and is decision-free, everything else is ID
  // generation or log timestamps — so this changes nothing but
  // reproducibility. Reset per loadGame (closure counter); sweeps run
  // seeds sequentially, so no interleaving.
  let __clockCalls = 0;
  Date.now = () => 1760400000000 + (__clockCalls++);

  global.fetch = (f) => Promise.resolve({
    ok: true, status: 200,
    json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, decodeURIComponent(new URL(f, 'https://sim.invalid/').pathname).slice(1)), 'utf8')))
  });

  // HEAD-80 BUG (fix-disease 2026-10-13): the old `head -80` silently dropped
  // every script after position 80 in index.html — including safetynets.js
  // (the entire crisis-relief system), villageAgency.js, and memdepth.js.
  // Sims were measuring a game without its recovery mechanics. No cap: load
  // the full list in index.html order.
  const order = execSync(`grep -o 'src/js/[^"'"'"']*\\.js' index.html`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));

  global.window = global;
  const loadFails = [];
  // TWO-PASS EVAL (crisis 2026-10-11): game.js first, then expose global.Game
  // the way the browser's global lexical scope does — later modules' load-time
  // code resolves bare `Game` against it. Before, the function-scope
  // `const Game` below TDZ-shadowed every eval, and titans.js failed to load
  // SILENTLY in every sim (loadFails was collected but never asserted).
  const gameIdx = order.indexOf('src/js/game.js');
  const evalFile = (f) => {
    // EXPORT SHIELD (journey establishment 2026-10-13): several game files
    // end with `if (typeof module !== 'undefined' && module.exports)
    // module.exports = ...` guards for direct node requires. Under this
    // eval, `module` resolves to SIM-HARNESS's own module object — the last
    // such file eval'd silently REPLACED our exports (driveFights etc.
    // became undefined for any require after loadGame). Shadow it: the
    // guards write to a throwaway, our exports survive.
    const module = { exports: {} };
    const exports = module.exports;
    let __src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    // SWALLOW COUNTER (sim audit 2026-10-14): SIM_CATCH=1 rewrites every
    // empty `catch (e) {}` into a counted report (same line, same flow —
    // the error is still swallowed). Answers "which features silently
    // throw?" — 4.5k empty catches hide failures from every sim otherwise.
    if (process.env.SIM_CATCH === '1') __src = instrumentCatches(__src, f);
    // sourceURL: names the eval'd file in stack traces and V8 coverage
    // (NODE_V8_COVERAGE) without changing semantics or line numbers.
    __src += '\n//# sourceURL=' + f;
    try { eval(__src); }
    catch (e) { loadFails.push(f + ': ' + e.message); }
  };
  // game.js in index.html position (after engine/*, which populate
  // globalThis.Scattering): its IIFE captures `const S = global.Scattering`
  // at load, so it must not run before them.
  order.forEach((f, i) => { if (gameIdx < 0 || i < gameIdx) evalFile(f); });
  if (gameIdx >= 0) evalFile(order[gameIdx]);
  global.Game = globalThis.Scattering.Game;
  order.forEach((f, i) => { if (i > gameIdx) evalFile(f); });
  delete global.window;

  // MACROTASK YIELD (journey-succession 2026-10-13): some modules install
  // load-order-critical wraps on a deferred macrotask — journal.js's mantle
  // wrap (writeEpitaph/welcomeBearer on playerDeath) uses setTimeout(0)
  // because ledger.js loads after journal.js. In the browser each <script>
  // tag is its own task so the timer fires after all scripts attach; in
  // node the whole eval is one synchronous block and every subsequent
  // await is a microtask, so the timer STARVED until the sim ended — every
  // sim silently ran without the journal mantle feature (epitaphs never
  // written, new-hand lines never recorded). Yield one macrotask here so
  // deferred installers attach before init(), matching the browser.
  await new Promise(r => setTimeout(r, 0));

  const G = globalThis.Scattering.Game;
  G.__simSeed = seed; // per-run policy RNG derives from it (runDays)
  // Silence narration/audio/drama for sims — telemetry + state carry the signal.
  // opts.narration: true keeps say/sysSay live (tests that assert on
  // Game.log fiction text need it; sims leave it off).
  if (!opts.narration) {
    G.say = function () {};
    G.sysSay = function () {};
  }
  // GAP 349/610 (sysSay-deaf probes): opts.captureSysSay (an array) routes
  // System voice into the array INSTEAD of the no-op, without turning on
  // full narration. Default behavior is unchanged (still silenced) when
  // the option is absent, so existing sims' trajectories are untouched.
  if (Array.isArray(opts.captureSysSay)) {
    const cap = opts.captureSysSay;
    G.sysSay = function () { cap.push(Array.prototype.slice.call(arguments).join(' ')); };
  }
  G.audioEvent = function () {};
  if (G.drama === undefined) G.drama = function () {};

  if (SIMOPT) applySimOpt(G);

  await G.init();
  return { Game: G, manifest: manifest(seed, mode), loadFails };
}

// Standard new-game setup shared by sims: generate roster, start, depart.
async function setupGame(Game, place, rosterId, options) {
  place = place || 'Columbus, Ohio';
  const occupation = options && options.occupation;
  if (occupation != null) {
    if (rosterId != null) throw Error('Choose occupation or rosterId, not both');
    if (typeof occupation !== 'string' || !Game.data.characterGen.occupations.some(o => o.id === occupation)) throw Error('Unknown occupation: ' + occupation);
    if (process.env.FORCE_OCC) throw Error('Unset FORCE_OCC; occupation cohorts select actual offered cards');
  }
  Game.genRoster(place);
  let selection;
  if (occupation != null) {
    const offered = Game.generatedRoster.filter(p => p.candidate !== false).map(p => ({ id: p.id, occupation: p.occupationId }));
    const selectedOfferIndex = offered.findIndex(p => p.occupation === occupation);
    selection = { schemaVersion: 1, requestedOccupation: occupation, origin: place, offered,
      rosterHash: require('crypto').createHash('sha256').update(JSON.stringify(Game.generatedRoster)).digest('hex') };
    if (selectedOfferIndex < 0) return { ...selection, status: 'excluded', reason: 'occupation_not_offered' };
    selection = { ...selection, status: 'played', selectedOfferIndex, selectedId: offered[selectedOfferIndex].id };
  }
  const rid = selection ? selection.selectedId : rosterId != null ? rosterId : Game.generatedRoster[0].id;
  Game.newGame(place, null, rid);
  Game.depart();
  if (selection) {
    const person = Game.getPerson(Game.villagerId);
    if (Game.villagerId !== rid || person?.occupationId !== occupation) throw Error('Started bearer does not match the offered occupation');
    return { ...selection, startingBearer: Game.villagerId, occupation: person.occupationId, region: Game.state.region };
  }
}

// runDays(Game, policy, opts) — the shared day loop.
// policy: { id, setup?(Game, ctx), upkeep?(Game, ctx), daily?(Game, ctx),
//           fight?(Game, ctx), contest?(Game, ctx) }
// opts: { days, manifest, sampleEvery }
// Returns { days, endReason, telemetry, samples, pacing, ms, manifest, policyId }.
// Telemetry comes from Game.state.telemetry (full stream when
// TELEMETRY_FULL=1); samples are daily [day, value] curves; pacing is the
// always-on per-day player-verb proxy (see PACING PROXY block).
// A diagnostic read must not hydrate people or initialize agency.
function snapshotVillagers(Game){
  const v=Game.state.village||{},a=v.agency||{};
  return (v.roster||[]).map(vid=>{
    const p=(Game.data.villagers||[]).find(p=>p.id===vid)||(Game.data.background_survivors||[]).find(p=>p.id===vid),xp=a.xp?.[vid]||{},stats=a.stats?.[vid]||{};
    return{vid:String(vid).slice(0,12),occ:p&&(p.occupationId||p.formerOccupation)||'?',
      profile:a.profiles?.[vid]||'?',agencyObserved:!!a.xp?.[vid],abilities:(v.npcAbilities?.[vid]||[]).slice(),
      xp:{t:xp.tracking||0,s:xp.survival||0,b:xp.bravery||0},kills:stats.monsterKills||0,exped:stats.expeditions||0};
  });
}
async function runDays(Game, policy, opts) {
  opts = opts || {};
  const days = opts.days || 365;
  const sampleEvery = opts.sampleEvery || 1;
  const ctx = { policyId: policy.id, notes: [] };
  const t0 = Date.now();

  // LIVE EVENT CAPTURE (audit 2026-10-14): deaths used to be read from the
  // telemetry ring AFTER the run — capped at 300 events, so long runs lost
  // 55-67% of deaths. Capture them as they happen, independent of the cap.
  // POLICY RNG (audit 2026-10-14): policies get their own seeded stream
  // (global.__policyRandom) so a policy change no longer shifts the GAME's
  // Math.random sequence (which confounded lever A/B comparisons).
  const _liveDeaths = [];
  const _origTele = Game.tele;
  Game.tele = function (type, data) {
    let r;
    try { r = _origTele.apply(this, arguments); } catch (e) { throw e; }
    try {
      if (type === 'death') {
        const s0 = (this.state && this.state.scholar) || {};
        // TELEFLAG (2026-10-16, sim-findings #400/#403): read player LAZILY off
        // the tele record. corpses.js registerDeath can repair a death tele's
        // player flag in place after the fire (double-registration race: a
        // villager-death path wins, playerDeath's call no-ops on the guard) —
        // a snapshot here would freeze the pre-repair value and the harness
        // would keep undercounting player deaths. day/kind/who/cause never
        // change after the fire; only player can be repaired.
        const tel = (this.state && this.state.telemetry) || [];
        const rec = tel.length ? tel[tel.length - 1] : null;
        const entry = { day: s0.day || 0, kind: data && data.kind, who: data && data.who, cause: data && data.cause };
        if (rec && rec.type === 'death' && String(rec.who) === String(entry.who)) {
          Object.defineProperty(entry, 'player', { enumerable: true, configurable: true, get: function () { return !!rec.player; } });
        } else {
          entry.player = !!(data && data.player);
        }
        _liveDeaths.push(entry);
      }
    } catch (e) {}
    return r;
  };
  global.__policyRandom = mulberry32((((((opts.manifest && opts.manifest.seed) || Game.__simSeed || 1)) * 2654435761) ^ 0x5eed) >>> 0);
  const samples = { pop: [], pantry: [], knowledge: [], trust: [], deaths: [], villagers: [],
    scale: [], codexM: [], codexS: [], standing: [], ledger: [] };
  // VILLAGER SNAPSHOT (coverage 2026-10-09): per-villager differentiation —
  // are villagers becoming different people? Captured every 30 loop-days:
  // occupation/profile, held abilities, agency XP tracks, key life stats.
  const villagerSnapshot = () => {
    try {
      return snapshotVillagers(Game);
    } catch (e) { ctx.notes.push('villagerSnapshot read error: '+e.message);return []; }
  };
  const pop = () => ((Game.state.village || {}).roster || []).length;
  // Population observation is not an ending. Unknown records conservatively
  // interrupt a known-zero streak and retain an explicit coverage count.
  const livingNPCs = () => {
    try {
      const v = Game.state.village || {};
      const sid = Game.villagerId;
      let unknown = false;
      const count = (v.roster || []).filter(id => {
        if (id === sid) return false;
        try { const p=(Game.data.villagers||[]).find(p=>p.id===id)||
          (Game.data.background_survivors||[]).find(p=>p.id===id);if(!p)unknown=true;else if(p.dead)return false; }
        catch (e) { unknown=true;ctx.notes.push('livingNPCs person read error: '+e.message); }
        return true;
      }).length;
      return {count,unknown};
    } catch (e) { ctx.notes.push('livingNPCs read error: ' + e.message); return {count:1,unknown:true}; }
  };
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
  // PROGRESS AXES (telemetry 2026-10-13): stall detection needs per-day
  // movement on leadership vector, scale stage, codex counts, Standing.
  const codexCount = (k) => {
    try { return Object.keys((Game.state.codex || {})[k] || {}).length; }
    catch (e) { return 0; }
  };
  const scaleRankNow = () => {
    try { return Game.scaleRank ? (Game.scaleRank() || 'village') : 'village'; }
    catch (e) { return 'village'; }
  };
  const standingNow = () => {
    try { return Game.villageStanding ? ((Game.villageStanding() || {}).total | 0) : null; }
    catch (e) { return null; }
  };
  const ledgerMag = () => {
    try {
      const L = ((Game.progState ? Game.progState() : {}) || {}).ledger || {};
      return Object.values(L).reduce((t, v) => t + Math.abs(v || 0), 0);
    } catch (e) { return null; }
  };
  const trustStats = () => {
    try {
      const tr = Object.values((Game.state.village || {}).trust || {});
      if (!tr.length) return null;
      const mean = tr.reduce((a, b) => a + b, 0) / tr.length;
      return { mean: +mean.toFixed(1), min: Math.min.apply(null, tr), n: tr.length };
    } catch (e) { return null; }
  };

  // Origin helper (defined before setup so the setup hook counts as player-origin).
  const withOrigin = (origin, fn) => {
    const prev = ctx._verbOrigin;
    ctx._verbOrigin = origin;
    try { return fn(); } finally { ctx._verbOrigin = prev; }
  };
  ctx._withOrigin = withOrigin;

  if (policy.setup) { try { await withOrigin('policy', () => policy.setup(Game, ctx)); } catch (e) { ctx.notes.push('setup: ' + e.message); } }

  // PLAYER-VERB TELEMETRY (measurement 2026-10-13: exhaustive rebuild of the
  // 2026-10-11 PACING PROXY). Headless sims can't measure wall clock, so we
  // count what a live player spends time on: player-verb invocations per
  // game-day, audited against every Game.* call site in scripts/policies/
  // (the policy IS the player in headless sims).
  //
  // ORIGIN SEPARATION (the old block's "UPPER bound" caveat, fixed
  // honestly): a verb call is DELIBERATE iff it fires while a policy hook
  // is executing (origin 'policy'). Harness drivers that stand in for
  // default player behavior (driveFights strikes, driveContests picks, the
  // day-loop waits) record origin 'driver'. Game-code-internal calls record
  // 'internal' and are EXCLUDED from the deliberate-action budget — the
  // internal bucket exists so contamination is visible, not hidden.
  // doAction (the master field-action dispatch) records its kind, routed to
  // a category via DOACTION_CAT. result.pacing.perDay rows:
  // { day, acts, verbs, policyCalls, dayTicks } where acts keys are
  // "origin:verb" (doAction: "origin:doAction:kind") and verbs is the legacy
  // raw count (all origins) for comparison with the old metric.
  // Neither touches RNG: determinism unaffected.
  // READ-NOT-VERB (quiet-links 2026-10-13): linkWith (hierarchy.js:184) and
  // switchboard (comms.js:827) are pure state reads — zero ticks, zero
  // mutation. Instrumenting them counted policy read-checks as deliberate
  // decisions and game-code lookups (foreignCrisisTick, link maintenance)
  // as internal traffic, inflating the verb stream with ~2k noise verbs/run.
  // They are deliberately NOT wrapped: reads are not player verbs.
  const VERB_CAT = {
    // food
    eat: 'food', eatOne: 'food', cookFood: 'food', takeFromPantry: 'food',
    takeFromPantryBulk: 'food', donateToPantry: 'food', stockPantry: 'food',
    stealFrom: 'food', villageMeal: 'food', testMonsterMeat: 'food', prepStash: 'food',
    // water
    fillWater: 'water', boilWater: 'water',
    // health
    treatDisease: 'health', treatVillager: 'health', useMedicine: 'health',
    removeTick: 'health', tendVillager: 'health',
    // field work
    setTrap: 'field', craft: 'field', makePlot: 'field', sowPlot: 'field',
    readBook: 'field', sortBag: 'field',
    // combat
    tbPlayerStrike: 'combat', tbPlayerWait: 'combat', tbPlayerMove: 'combat',
    tbPlayerShout: 'combat', tbPlayerOfferFood: 'combat', tbBarrierExit: 'combat',
    standGround: 'combat', answerDefenseCall: 'combat', useAbility: 'combat',
    activateAbility: 'combat', feastBurn: 'combat',
    // social
    talkTo: 'social', convoTurn: 'social', endConvo: 'social', askAbout: 'social',
    teachPlant: 'social', teachVillager: 'social', assignTask: 'social',
    channelSentiment: 'social', tendLink: 'social', proposeLink: 'social',
    proposeTrade: 'social', proposeCovenant: 'social', answerAidBeg: 'social',
    answerAidOffer: 'social', answerDemand: 'social', answerCounter: 'social',
    answerAccord: 'social', answerNationalChoice: 'social',
    answerGlobalChoice: 'social', chooseTableOption: 'social',
    handInAidQuest: 'social', payTribute: 'social', rallyVillage: 'social',
    offerSystemQuest: 'social', corpseTakeItem: 'food',
    corpseLootAll: 'food', // batch-loot 2026-10-13: loot verbs file under food (taxonomy fix 1ab8a2bc)
    studyVillageCodex: 'field', proveWorth: 'social', agencyTurn: 'social',
    // travel
    travelTo: 'travel', pathStep: 'travel', beginPathWalk: 'travel', clearBlockage: 'travel',
    // shows / contests
    contestChoose: 'show', faceFeastDraw: 'show', yieldChallenge: 'show', hostFeast: 'show',
  };
  const DOACTION_CAT = { forage: 'field', rest: 'rest', wait: 'wait', drink: 'water' };
  // TELEMETRY_VERBS=0: skip all verb wrapping (no-behavior-change control).
  const VERBS_ON = process.env.TELEMETRY_VERBS !== '0';
  const pacingDays = {};
  const pacingDay = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const pacingRecord = (verb, sub, origin) => {
    if (!VERBS_ON) return;
    const d = pacingDay();
    const row = pacingDays[d] || (pacingDays[d] = { day: d, acts: {}, verbs: 0, policyCalls: 0, dayTicks: 0 });
    const key = origin + ':' + verb + (sub ? ':' + sub : '');
    row.acts[key] = (row.acts[key] || 0) + 1;
    row.verbs++;
  };
  // Compat: the old ctx._pacingBump('policyCalls') call sites now bump through
  // the origin-aware row; anything else records a policy-origin legacy bump.
  ctx._pacingBump = (kind) => {
    const d = pacingDay();
    const row = pacingDays[d] || (pacingDays[d] = { day: d, acts: {}, verbs: 0, policyCalls: 0, dayTicks: 0 });
    if (kind === 'policyCalls') row.policyCalls++;
    else pacingRecord('legacyBump', null, 'policy');
  };
  for (const v of Object.keys(VERB_CAT)) {
    if (!VERBS_ON) break;
    try {
      const orig = Game[v];
      if (typeof orig === 'function' && !orig._verbWrapped) {
        const w = function (...a) {
          // RE-ENTRANCY (telemetry 2026-10-13): a verb fired from INSIDE
          // another verb's execution is game-code-internal by construction
          // (e.g. foreignCrisisTick calling linkWith during a wait's part
          // advance) — it inherits 'internal' regardless of the outer
          // origin. Only the outermost verb call takes the ambient origin.
          const depth = (ctx._verbDepth = (ctx._verbDepth || 0) + 1);
          try {
            pacingRecord(v, null, depth > 1 ? 'internal' : (ctx._verbOrigin || 'internal'));
            return orig.apply(this, a);
          } finally { ctx._verbDepth--; }
        };
        w._verbWrapped = true;
        Game[v] = w;
      }
    } catch (e) {}
  }
  if (VERBS_ON) try {
    const orig = Game.doAction;
    if (typeof orig === 'function' && !orig._verbWrapped) {
      const w = function (kind, ...rest) {
        const depth = (ctx._verbDepth = (ctx._verbDepth || 0) + 1);
        try {
          pacingRecord('doAction', String(kind == null ? '?' : kind), depth > 1 ? 'internal' : (ctx._verbOrigin || 'internal'));
          return orig.apply(this, [kind, ...rest]);
        } finally { ctx._verbDepth--; }
      };
      w._verbWrapped = true;
      Game.doAction = w;
    }
  } catch (e) {}

  let day,iterationsStarted=0;
  // Preserve the historical ten-iteration community-loss observation while
  // allowing the living bearer to continue. This is outside saved Game state.
  let deadTail = 0;
  const communityExposure={version:1,thresholdIterations:10,observations:0,
    zeroObservations:0,unknownObservations:0,maxConsecutiveZero:0,
    sustainedEmpty:false,sustainedEpisodes:0,firstEmpty:null,firstSustainedEmpty:null,
    recoveredAfterSustained:false,firstRecovery:null};
  // TIME-FREEZE WATCHDOG (crisis leg 2026-10-11): a fight that neither side
  // can advance freezes the day clock (tickAction no-ops mid-fight) — probed
  // 160 loop-days stuck on day 22 with fight=true. Mirrors winrate-iter4's
  // proven guard: 8 loop-days with no day advance + an unresolved fight ->
  // the player is routed (flee), the honest in-fiction resolution.
  let lastSday = null, frozenIters = 0;
  // SIM-OPT: silence the [SLEEP] diagnostics during the day loop only.
  await quietLog(async () => {
  for (day = 1; day <= days&&!Game.over; day++) {
    iterationsStarted++;
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { withOrigin('policy', () => { ctx._pacingBump('policyCalls'); policy.upkeep(Game, ctx); }); } catch (e) {} }
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
      try { withOrigin('driver', () => Game.doAction('wait')); } catch (e) {}
      driveFights(Game, policy, ctx);
      driveContests(Game, policy, ctx);
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { withOrigin('policy', () => { ctx._pacingBump('policyCalls'); policy.daily(Game, ctx); }); } catch (e) {} }
    if(Game.over)break;
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
      samples.codexM.push([day, codexCount('monsters')]);
      samples.codexS.push([day, codexCount('skills')]);
      samples.scale.push([day, scaleRankNow()]);
      samples.standing.push([day, standingNow()]);
      samples.ledger.push([day, ledgerMag()]);
      const ts = trustStats();
      samples.trust.push([day, ts ? ts.mean : null]);
      if (day % 30 === 0) samples.villagers.push([day, villagerSnapshot()]);
    }
    const population=livingNPCs(),at={iteration:day,gameDay:Game.state.scholar.day};
    communityExposure.observations++;
    if(population.unknown)communityExposure.unknownObservations++;
    if(!population.unknown&&population.count===0){
      deadTail++;communityExposure.zeroObservations++;
      communityExposure.maxConsecutiveZero=Math.max(communityExposure.maxConsecutiveZero,deadTail);
      if(!communityExposure.firstEmpty)communityExposure.firstEmpty=at;
      if(deadTail===communityExposure.thresholdIterations){
        communityExposure.sustainedEmpty=true;communityExposure.sustainedEpisodes++;
        if(!communityExposure.firstSustainedEmpty)communityExposure.firstSustainedEmpty=at;
      }
    }else{
      if(!population.unknown&&population.count>0&&deadTail>=communityExposure.thresholdIterations){
        communityExposure.recoveredAfterSustained=true;
        if(!communityExposure.firstRecovery)communityExposure.firstRecovery=at;
      }
      deadTail=0;
    }
  }
  }); // end quietLog day loop

  // Deaths also come from the telemetry stream; keep a compact list here.
  // player flag (scale-wall r17): tele 'death' events from the scholar's own
  // death (ledger.js playerDeath -> corpses.js registerDeath) carry
  // player:true — the sampler keys those as player-kind so scholar death
  // causes are attributable. Backward-compatible: older runs just lack it.
  samples.deaths = _liveDeaths.slice();
  Game.tele = _origTele;
  // Final villager snapshot (coverage 2026-10-09): short runs never reach
  // the 30-day cadence — always capture the end state for differentiation.
  try { samples.villagers.push([day > days ? days : day, villagerSnapshot()]); } catch (e) {}

  const endReason = Game.over
    ? (Game.villageLost ? 'village-lost' : 'over-other')
    : 'survived';

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

  // PLAYER-VERB TELEMETRY summary: per-day rows + origin-separated means.
  const perDay = Object.keys(pacingDays).map(Number).sort((a, b) => a - b)
    .map(d => pacingDays[d]);
  const meanOf = (k) => perDay.length
    ? +(perDay.reduce((t, r) => t + (r[k] || 0), 0) / perDay.length).toFixed(1) : 0;
  // Origin accounting: deliberate (policy) vs driver vs internal.
  const catOf = (verb, sub) => verb === 'doAction'
    ? (DOACTION_CAT[sub] || ('doAction:' + sub)) : (VERB_CAT[verb] || verb);
  const totals = { policy: 0, driver: 0, internal: 0 };
  const byCat = {}, byCatDriver = {}, internalByVerb = {};
  const deliberatePerDay = [];
  for (const r of perDay) {
    let d = 0;
    for (const k of Object.keys(r.acts || {})) {
      const n = r.acts[k];
      const parts = k.split(':');
      const o = parts[0], v = parts[1], s = parts.slice(2).join(':');
      totals[o] = (totals[o] || 0) + n;
      if (o === 'policy') { d += n; const c = catOf(v, s); byCat[c] = (byCat[c] || 0) + n; }
      else if (o === 'driver') { const c = catOf(v, s); byCatDriver[c] = (byCatDriver[c] || 0) + n; }
      else { const vk = v + (s ? ':' + s : ''); internalByVerb[vk] = (internalByVerb[vk] || 0) + n; }
    }
    deliberatePerDay.push(d);
  }
  deliberatePerDay.sort((a, b) => a - b);
  const medianDeliberate = deliberatePerDay.length
    ? deliberatePerDay[Math.floor(deliberatePerDay.length / 2)] : 0;
  const meanTicks = meanOf('dayTicks');

  return {
    days: day > days ? days : day,
    gameDays,
    maxWaveUnlocked, waveKills,
    endReason,
    stop:{version:1,kind:Game.over?'engine-ending':'observation-cap',
      engineOver:!!Game.over,won:!!Game.won,villageLost:!!Game.villageLost,
      iterations:iterationsStarted,gameDay:gameDays},
    communityExposure,
    telemetry: Game.state.telemetry || [],
    samples,
    learnedPlants, learnedSkills,
    pacing: {
      perDay,
      totalDeliberate: totals.policy,
      totalDriver: totals.driver,
      totalInternal: totals.internal,
      meanDeliberatePerDay: perDay.length ? +(totals.policy / perDay.length).toFixed(1) : 0,
      medianDeliberatePerDay: medianDeliberate,
      meanDriverPerDay: perDay.length ? +(totals.driver / perDay.length).toFixed(1) : 0,
      byCategory: byCat,
      byCategoryDriver: byCatDriver,
      internalByVerb,
      meanVerbsPerDayLegacy: meanOf('verbs'),
      meanPolicyCallsPerDay: meanOf('policyCalls'),
      meanTicksPerDay: meanTicks,
      tickUtilization: +(meanTicks / 512).toFixed(3),
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
  const run = () => driveFightsImpl(Game, policy, ctx);
  return (ctx && ctx._withOrigin) ? ctx._withOrigin('driver', run) : run();
}
function driveFightsImpl(Game, policy, ctx) {
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
      try { handled = (ctx && ctx._withOrigin) ? ctx._withOrigin('policy', () => { ctx._pacingBump('policyCalls'); return policy.fight(Game, ctx); }) : policy.fight(Game, ctx); } catch (e) { if (TR) TR('policy.fight threw: ' + (e && e.message)); }
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
        Game.tbPlayerWait(); // same public end-turn action as the phone
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
  const run = () => driveContestsImpl(Game, policy, ctx);
  return (ctx && ctx._withOrigin) ? ctx._withOrigin('driver', run) : run();
}
function driveContestsImpl(Game, policy, ctx) {
  let guard = 0;
  while (Game.state.activeContest && guard++ < 400) {
    driveFights(Game, policy, ctx);
    if (Game.over) break;
    if (policy.contest) {
      let handled = false;
      try { handled = (ctx && ctx._withOrigin) ? ctx._withOrigin('policy', () => { ctx._pacingBump('policyCalls'); return policy.contest(Game, ctx); }) : policy.contest(Game, ctx); } catch (e) {}
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
  // Give an explicit bot choice the same opportunity as the phone before
  // the historical fight fallback. Profiles without a callback are unchanged.
  if (Game.pendingEncounter && Game.pendingMonsterId && typeof policy.pending === 'function') {
    try {
      const respond = () => { if (ctx && ctx._pacingBump) ctx._pacingBump('policyCalls'); return policy.pending(Game, ctx); };
      if (ctx && ctx._withOrigin) ctx._withOrigin('policy', respond); else respond();
    } catch (e) { console.warn('[sim-harness] policy.pending threw: ' + (e && e.message)); }
  }
  if (Game.pendingEncounter && Game.pendingMonsterId) {
    try {
      const mid = Game.pendingMonsterId;
      // RAID-PROVENANCE (sim-raidname-fix-b 2026-10-30): do NOT
      // pre-clear the pending — startCombat is the single
      // pending-clearer, exactly like the live Face-it button
      // (app.js p-face calls startCombat() with the pending
      // live). Pre-clearing hid pending-resolved provenance
      // from startCombat's raid-naming gate: a pending-resolved
      // fight must never read the tile entity's raidBorn flag.
      // startCombat clears the pending fields unconditionally,
      // so net behavior is identical except on a startCombat
      // throw, where the pending now survives (as live).
      Game.startCombat(mid);
      driveFights(Game, policy, ctx);
    } catch (e) {}
  }
}

module.exports = { swallowReport, instrumentCatches, mulberry32, loadGame, setupGame, runDays, manifest, driveFights, driveContests, quietLog, snapshotVillagers,ROOT };
