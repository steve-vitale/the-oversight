#!/usr/bin/env node
// test-sanctityaudit-20261019.js — table-sanctity startCombat coverage audit
// (flesh-out loop arm sim-sanctityaudit, 2026-10-19, DIAGNOSTIC, zero src/js
// changes).
//
// PART A (static, default): enumerate every startCombat( call site in
//   src/js/game.js, classify each as (a) ambient router sanctity MUST cover,
//   (b) table's own stakes that must NEVER be gated, or (c) player-initiated
//   (sanctity N/A), citing the covering code line or its absence. FAILS LOUD
//   if any site is unclassified or the site list drifted vs the table.
// PART B (DET=1): instrumented vs bare byte-identical (2 seeds x 60d) — the
//   caller wrapper is call-through + read-only (no state writes, no RNG).
// PART C (SWEEP=1): 16-run instrumented sweep (64201-64208 x
//   {leadfeast,belongfeast}, SEATDRIVE=1 + TABLEPATHS=1 substrate reusing
//   probe-tablepaths-20261019.js's policyFor read-only) recording EVERY
//   startCombat fire with its call site (from the JS stack) + tableActive()
//   at fire time. Writes evidence/2026-10-19/perseed-sanctityaudit/.
//
// Canon: docs/CANON.md + docs/TABLE.md (sanctity of the table, Steve
// 2026-10-12). Pre-registration: evidence/2026-10-19/sim-sanctityaudit.md.
//
// Usage:
//   node scripts/test-sanctityaudit-20261019.js            # static audit
//   DET=1 <substrate env> node scripts/test-sanctityaudit-20261019.js
//   SWEEP=1 <substrate env> node scripts/test-sanctityaudit-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const GAME_JS = path.join(__dirname, '..', 'src', 'js', 'game.js');

// ---------------------------------------------------------------------------
// PART A — the static classification table. Every startCombat( call site in
// src/js/game.js as of this audit. `cover` = the sanctity gate line that
// covers it, or null when no gate exists (the finding).
const SITES = [
  // -- (a) AMBIENT routers: sanctity MUST cover (TABLE.md: no random field
  // fights, no wild encounters, no patrol contact, no new raids while the
  // table sits). All inside monsterTurn() (game.js:21640) except reengage.
  { line: 11085, kind: 'ambient', cover: '11060,11122', via: 'reengageWaitingMonsters',
    note: 'door-fled re-engage (hall-door exit 11060: stash held mid-finale; treeline ambush 11122: returns false, stash intact). GATED by journey-scale r10.door-fled re-engage (hall-door exit 11063: the bearer\'s own fled stash) + treeline ambush (11125: a dead bearer\'s stash when the new bearer leaves Haven). NO sanctity check.' },
  { line: 21690, kind: 'ambient', cover: '21683', via: 'monsterTurn/hummice-sonar',
    note: 'hummice hunts by ear: contact within 1 tile. monsterTurn() has NO tableActive gate (21640).' },
  { line: 21707, kind: 'ambient', cover: '21683', via: 'monsterTurn/hummice-bump',
    note: 'hummice closes to the player tile. GATED upstream by the monsterTurn sanctity gate (game.js:21683, journey-scale r10).' },
  { line: 21732, kind: 'ambient', cover: '21683', via: 'monsterTurn/dark-bump',
    note: 'wander-search bump into the player in the dark. GATED upstream by the monsterTurn sanctity gate (game.js:21683, journey-scale r10).' },
  { line: 21816, kind: 'ambient', cover: '21683', via: 'monsterTurn/ambush',
    note: 'ambush stance: nightlight + dist<=2. GATED upstream by the monsterTurn sanctity gate (game.js:21683, journey-scale r10).' },
  { line: 21854, kind: 'ambient', cover: '21683', via: 'monsterTurn/territorial',
    note: 'territorial warn expiry (warnTurns>=2). GATED upstream by the monsterTurn sanctity gate (game.js:21683, journey-scale r10).' },
  { line: 21887, kind: 'ambient', cover: '21683', via: 'monsterTurn/hungry',
    note: 'hungry stepToward reaches the player tile. GATED upstream by the monsterTurn sanctity gate (game.js:21683, journey-scale r10).' },
  { line: 21904, kind: 'ambient', cover: '21683', via: 'monsterTurn/cautious',
    note: 'cautious circle lands on the player tile. GATED upstream by the monsterTurn sanctity gate (game.js:21683, journey-scale r10).' },
  { line: 21949, kind: 'ambient', cover: '21683', via: 'monsterTurn/default',
    note: 'default stance stepToward reaches the player tile. GATED upstream by the monsterTurn sanctity gate (game.js:21683, journey-scale r10).' },
  // -- (c) PLAYER-INITIATED: the player's own device/choice, not ambient
  // pressure. Sanctity N/A (can still pull the player in mid-finale).
  { line: 21556, kind: 'player', cover: null, via: 'gwTrapTick',
    note: 'glasswing dive onto the PLAYER\'S OWN trap (s.gwTrap). Player-initiated; not ambient pressure.' },
  { line: 22572, kind: 'player', cover: null, via: 'faceTentIntruder',
    note: 'player clicks "Face it" on the tent intruder (app.js:16385/17857). Player-initiated.' },
];

// Other-file startCombat call sites, for the record (not game.js, outside
// the primary audit list but needed for the "table's own stakes" class):
const OTHER_SITES = [
  { file: 'src/js/table-feared.js', line: 158, kind: 'table-stake',
    note: "startCombat('finale', {tableTrial:true}) — trial by combat. The table's own stake; must NEVER be sanctity-gated. startCombat itself carves tableTrial out of the breach crisis." },
  { file: 'src/js/contests.js', line: 4727, kind: 'table-stake',
    note: 'in-contest beast fight — the contest\'s own stakes (a System show), never ambient.' },
  { file: 'src/js/contests.js', line: 4751, kind: 'table-stake',
    note: 'contest arc wave fight — the contest\'s own stakes.' },
  { file: 'src/js/feastBuff.js', line: 515, kind: 'player',
    note: 'faceFeastDraw — the player chooses to face the beast circling the firelight. Player-initiated.' },
  { file: 'src/js/app.js', line: 1172, kind: 'player',
    note: 'UI "Fight" button on an adjacent monster. Player-initiated.' },
  { file: 'src/js/app.js', line: 1746, kind: 'player',
    note: 'UI "Fight" action (fighterDistTo<=1). Player-initiated.' },
  { file: 'src/js/app.js', line: 17861, kind: 'player',
    note: '"Face it" button — resolves pendingEncounter (incl. the raid night-beat\'s raider-at-the-bedroll, havenGrowth.js:629). Player-initiated.' },
  { file: 'src/js/app.js', line: 19648, kind: 'player',
    note: 'dev-panel fight trigger. Player-initiated.' },
];

// ENGINE sanctity gates (every tableActive check in game.js):
const GATES = [
  { line: 7307, fn: 'resolvePatrol', what: 'nearestWorldMonster nulled — patrols walk an empty perimeter' },
  { line: 11060, fn: 'exitBuilding (hall-door)', what: 'door-fled stash HELD mid-finale (not consumed) — r10 gate' },
  { line: 11122, fn: 'treelineAmbush', what: 'returns false mid-finale, killer stash intact — r10 gate' },
  { line: 18818, fn: 'villagerMonsterTick', what: 'early return — no wild encounters target villagers' },
  { line: 21683, fn: 'monsterTurn', what: 'ambient contact block gated — hummice/dark/stance sites cannot engage — r10 gate' },
];

function findCallSites(src) {
  const lines = src.split('\n');
  const found = [];
  lines.forEach((ln, i) => {
    const lno = i + 1;
    const trimmed = ln.trim();
    if (trimmed.startsWith('//')) return; // comment, not a call site
    // real invocations: this.startCombat( / Game.startCombat( / .startCombat(
    if (!/(^|[^a-zA-Z0-9_$])this\.startCombat\s*\(/.test(ln)) return;
    // the definition itself (startCombat(monsterId, options) {) is not a call site
    if (/^\s*startCombat\(monsterId/.test(ln)) return;
    found.push(lno);
  });
  return found;
}

function staticAudit() {
  const src = fs.readFileSync(GAME_JS, 'utf8');
  const found = findCallSites(src);
  const known = SITES.map(s => s.line).sort((a, b) => a - b);
  const fsrt = found.slice().sort((a, b) => a - b);
  console.log('=== sim-sanctityaudit STATIC AUDIT ===');
  console.log(`startCombat call sites in src/js/game.js: ${fsrt.join(', ')}`);
  let ok = true;
  const missing = fsrt.filter(l => !known.includes(l));
  const stale = known.filter(l => !fsrt.includes(l));
  if (missing.length) { console.log(`FAIL: UNCLASSIFIED call sites: ${missing.join(', ')}`); ok = false; }
  if (stale.length) { console.log(`FAIL: table lists sites no longer present: ${stale.join(', ')} (line drift — update the table)`); ok = false; }
  // verify the two gates still exist where cited
  for (const g of GATES) {
    const ln = src.split('\n')[g.line - 1] || '';
    if (!/tableActive/.test(ln)) { console.log(`FAIL: gate cited at game.js:${g.line} no longer mentions tableActive: ${ln.trim()}`); ok = false; }
  }
  // verify no NEW tableActive gate appeared that changes the coverage picture
  const gateLines = [];
  src.split('\n').forEach((ln, i) => { if (/tableActive\(\)/.test(ln) && !/^\s*\/\//.test(ln)) gateLines.push(i + 1); });
  console.log(`tableActive() call sites in game.js: ${gateLines.join(', ')}`);
  const knownGateLines = GATES.map(g => g.line);
  const newGates = gateLines.filter(l => !knownGateLines.includes(l) && !/table\.js/.test(src.split('\n')[l - 1] || ''));
  if (newGates.length) { console.log(`NOTE: additional tableActive uses (review): ${newGates.join(', ')}`); }
  console.log('');
  console.log('--- classification table (ambient = sanctity MUST cover) ---');
  for (const s of SITES) {
    console.log(`game.js:${s.line} [${s.kind}] cover=${s.cover == null ? 'NONE' : 'game.js:' + s.cover} — ${s.via}: ${s.note}`);
  }
  console.log('');
  console.log('--- other-file sites (for the record) ---');
  for (const s of OTHER_SITES) {
    console.log(`${s.file}:${s.line} [${s.kind}] — ${s.note}`);
  }
  console.log('');
  const uncoveredAmbient = SITES.filter(s => s.kind === 'ambient' && s.cover == null);
  console.log(`ambient sites: ${SITES.filter(s => s.kind === 'ambient').length}, uncovered: ${uncoveredAmbient.length} (${uncoveredAmbient.map(s => s.line).join(', ')})`);
  console.log(ok ? 'STATIC AUDIT: PASS (every site classified)' : 'STATIC AUDIT: FAIL');
  process.exit(ok ? 0 : 1);
}

// ---------------------------------------------------------------------------
// PART B/C/D — dynamic instrumentation
const MODE = process.env.SWEEP === '1' ? 'sweep' : (process.env.DET === '1' ? 'det' : (process.env.REPLAY === '1' ? 'replay' : 'static'));
if (MODE === 'static') staticAudit();

const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required.`); process.exit(2); }
}
if (process.env.TABLEPATHS !== '1') { console.error('SWEEP STOP: TABLEPATHS=1 is required.'); process.exit(2); }
if (process.env.SEATDRIVE !== '1') { console.error('SWEEP STOP: SEATDRIVE=1 is required.'); process.exit(2); }
if (process.env.VETREL === '1' || process.env.REPOSITION === '1') { console.error('SWEEP STOP: VETREL/REPOSITION must not be 1.'); process.exit(2); }

const TP = require('./probe-tablepaths-20261019.js');
const TF = require('./policies/tribfloor');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208]).filter(Number.isFinite);
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const SITE_LINES = new Set(SITES.map(s => s.line));
const isBare = () => process.env.SANCT_BARE === '1';

function writeFileRetry(fp, data) {
  let last = null;
  for (let i = 0; i < 15; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) { last = e; if (e && e.code === 'EPERM') { const t = Date.now(); while (Date.now() - t < 4000) {} continue; } throw e; }
  }
  throw last;
}

const scholarDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// Resolve the startCombat call site from the wrapper's stack: the first
// src/js/game.js frame whose line is a known call-site line (works through
// one level of indirection, e.g. reengageWaitingMonsters -> 11077).
function resolveSite(stack) {
  const frames = String(stack || '').split('\n');
  let firstGame = null;
  for (const f of frames) {
    const m = f.match(/src\/js\/game\.js:(\d+):\d+/);
    if (!m) continue;
    const line = parseInt(m[1], 10);
    if (!firstGame) firstGame = line;
    if (SITE_LINES.has(line)) return { site: line, via: (SITES.find(s => s.line === line) || {}).via || '?' };
  }
  return { site: firstGame != null ? firstGame : -1, via: 'unmapped' };
}

function installSanctityCapture(Game, C) {
  const sayBuf = C.sayBuf;
  try {
    const oSay = Game.say.bind(Game);
    Game.say = function (txt) {
      const r = oSay.apply(this, arguments);
      try { sayBuf.push(String(txt == null ? '' : txt).slice(0, 220)); if (sayBuf.length > 300) sayBuf.splice(0, sayBuf.length - 300); }
      catch (e) {}
      return r;
    };
  } catch (e) { C.instrumentErrors++; }
  try {
    const oSC = Game.startCombat.bind(Game);
    Game.startCombat = function (monsterId, options) {
      try {
        const { site, via } = resolveSite(new Error().stack);
        let active = null, phase = null, atHaven = false;
        try { active = !!(Game.tableActive && Game.tableActive()); } catch (e) {}
        try { const T = Game.tableState && Game.tableState(); phase = T && T.phase != null ? String(T.phase) : null; } catch (e) {}
        try { atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
        let mid = monsterId;
        try { if (mid == null) mid = Game.pendingMonsterId || null; } catch (e) {}
        C.fights.push({
          day: scholarDay(Game), mid: mid != null ? String(mid) : null,
          site, via, active, phase, atHaven,
          sayTail: sayBuf.slice(-30),
        });
      } catch (e) { C.instrumentErrors++; }
      return oSC.apply(this, arguments);
    };
  } catch (e) { C.instrumentErrors++; }
}

async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const base = TP.policyFor(policyId, seed);
  const bare = isBare();
  const C = { fights: [], sayBuf: [], instrumentErrors: 0, hashes: [], activeDays: 0, sittingDay: null };
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    if (!bare) { try { installSanctityCapture(G, C); } catch (e) { C.instrumentErrors++; } }
    return r;
  };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { C.hashes.push(scholarDay(G) + ':' + dayHash(Game)); } catch (e) {}
    if (!bare) {
      try {
        let active = false;
        try { active = !!(G.tableActive && G.tableActive()); } catch (e) {}
        if (active) C.activeDays++;
        const pg = G.progState ? G.progState() : null;
        if (pg && (pg.tableSittingId | 0) > 0 && C.sittingDay == null) C.sittingDay = scholarDay(G);
      } catch (e) { C.instrumentErrors++; }
    }
    return r;
  };
  const days = opts.days || (process.env.DAYS ? parseInt(process.env.DAYS, 10) : 180);
  const { Game } = await loadGame({ seed, mode: 'posttable', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  const out = {
    seed, policyId, bare, days: result.days, gameDays: result.gameDays,
    sittingDay: C.sittingDay, activeDays: C.activeDays,
    fights: C.fights, instrumentErrors: C.instrumentErrors, hashes: C.hashes,
    fightsDuringSanctity: C.fights.filter(f => f.active === true),
  };
  if (!opts.noWrite) {
    // SWEEP_EVIDIR (journey-scale r10): lets a gated-engine sweep write
    // beside the audit corpus instead of overwriting it. Default preserves
    // the audit's original path.
    const eviRoot = process.env.SWEEP_EVIDIR || path.join('evidence', '2026-10-19', 'perseed-sanctityaudit');
    const dir = path.join(__dirname, '..', eviRoot, policyId);
    fs.mkdirSync(dir, { recursive: true });
    writeFileRetry(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1));
  }
  return out;
}

async function main() {
  if (MODE === 'det') {
    const dseeds = [64201, 64203];
    const odays = process.env.DAYS; process.env.DAYS = '60';
    let ok = true;
    for (const seed of dseeds) {
      for (const policyId of POLICIES) {
        process.env.SANCT_BARE = '1';
        const b = await runOne(seed, policyId, { noWrite: true });
        delete process.env.SANCT_BARE;
        const c = await runOne(seed, policyId, { noWrite: true });
        const hb = b.hashes.join('|'), hc = c.hashes.join('|');
        const pass = hb === hc && hb.length > 0;
        console.log(`  DET s${seed} ${policyId}: ${pass ? 'PASS' : 'FAIL'} (bare-vs-instrumented byte-identical, ${b.hashes.length} days)`);
        if (!pass) ok = false;
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    console.log(ok ? 'DET: ALL PASS — instrument is read-only' : 'DET: FAILURES');
    process.exit(ok ? 0 : 1);
  }
  if (MODE === 'replay') {
    // REPLAY: reconstruct the corpus incident's mechanism in the harness and
    // prove it fires while tableActive() is true.
    //   1. Player at Haven; a wave-4 'suburb' LINGERS on the Haven tile —
    //      exactly the raid night-beat's product (havenGrowth.js: m.tx=hx,
    //      m.ty=hy, m.lingering=true; pre-sitting raid, d89 in the corpus).
    //   2. Table forced to sitting (tableActive() verified true).
    //   3. Tick monsterTurn() — the stance machine has NO sanctity gate.
    // EXPECTED (the gap): startCombat fires at an ambient site with
    // tableActive() true. A gated engine would refuse.
    const seed = 64203;
    const { Game } = await loadGame({ seed, mode: 'posttable', fullTelemetry: false });
    await setupGame(Game);
    const v = Game.state.village || {};
    const hx = v.px ?? 4, hy = v.py ?? 4;
    Game.map.px = hx; Game.map.py = hy; // player at Haven
    const s = Game.state.scholar; s.mx = 4; s.my = 4;
    // the raid night-beat's product, pre-sitting:
    const m = Game.spawnWorldMonster({ id: 'suburb' }, hx, hy, { mx: 4, my: 6 });
    m.lingering = true;
    // sit the table:
    const pg = Game.progState(); pg.tableDone = true; pg.tableSittingId = 1;
    const T = Game.tableState(); T.phase = 'challenge'; T.path = 'feared';
    const activeNow = !!(Game.tableActive && Game.tableActive());
    console.log(`  replay setup: suburb lingerer on Haven tile (${hx},${hy}), player at Haven=${!!(Game.playerAtHaven && Game.playerAtHaven())}, tableActive()=${activeNow}`);
    if (!activeNow) { console.log('REPLAY: FAIL — could not force tableActive() true'); process.exit(1); }
    const sayLines = [];
    try {
      const oSay = Game.say.bind(Game);
      Game.say = function (t) { const r = oSay.apply(this, arguments); try { sayLines.push(String(t).slice(0, 180)); } catch (e) {} return r; };
    } catch (e) {}
    const fired = [];
    try {
      const oSC = Game.startCombat.bind(Game);
      Game.startCombat = function (monsterId, options) {
        try {
          const { site, via } = resolveSite(new Error().stack);
          fired.push({ mid: monsterId != null ? String(monsterId) : null, site, via,
            active: !!(Game.tableActive && Game.tableActive()) });
        } catch (e) {}
        return oSC.apply(this, arguments);
      };
    } catch (e) { console.log('REPLAY: FAIL — could not wrap startCombat'); process.exit(1); }
    let ticks = 0;
    await quietLog(async () => {
      for (let i = 0; i < 200 && !fired.length; i++) { ticks++; Game.monsterTurn(); }
    });
    console.log(`  monsterTurn ticks: ${ticks}, startCombat fires: ${fired.length}`);
    for (const f of fired) {
      console.log(`  FIRED: mid=${f.mid} site=game.js:${f.site} via=${f.via} tableActive=${f.active}`);
    }
    console.log('  --- say (fiction at the moment of the breach) ---');
    for (const ln of sayLines.slice(-10)) console.log('   ' + ln);
    const ambientFire = fired.find(f => f.active === true && SITE_LINES.has(f.site) &&
      (SITES.find(x => x.line === f.site) || {}).kind === 'ambient');
    if (ambientFire) {
      console.log(`REPLAY: GAP PROVEN — ambient site game.js:${ambientFire.site} (${ambientFire.via}) started combat while tableActive() was true.`);
      process.exit(0);
    }
    console.log('REPLAY: no ambient fire during sanctity (gap NOT reproduced in this construction)');
    process.exit(1);
  }
  // sweep
  const results = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      const out = await runOne(seed, policyId);
      results.push(out);
      const ds = out.fightsDuringSanctity;
      const summ = ds.map(f => `${f.mid}@d${f.day}:site${f.site}`).join('; ') || 'none';
      console.log(`  [${policyId} s${seed}] days=${out.gameDays} sit=${out.sittingDay} sanctityDays=${out.activeDays} fights=${out.fights.length} DURING-SANCTITY=[${summ}] ierr=${out.instrumentErrors}`);
    }
  }
  const nDS = results.reduce((a, r) => a + r.fightsDuringSanctity.length, 0);
  console.log(`SWEEP COMPLETE: ${results.length} runs, fights during sanctity: ${nDS}`);
}

if (require.main === module) main().catch(e => { console.error('SWEEP FATAL:', e && e.message); process.exit(1); });
module.exports = { SITES, OTHER_SITES, GATES, findCallSites, staticAudit };
