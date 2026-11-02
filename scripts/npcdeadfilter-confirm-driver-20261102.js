#!/usr/bin/env node
// npcdeadfilter-confirm-driver-20261102.js — corrupt-roster confirm band
// for sim-npcdeadfilter-confirm (Loop fleshout-20261102T1715Z, axis
// scale-onramp). Confirms commit cc370f832 (npcIds dead filter).
//
// Substrate: at the FIRST natural bearer death where the roster
// allows it, kill the highest-trust living non-bearer via a REAL
// removeVillager('killed') death, push the dead id back onto the
// roster (a non-entry-gate path — no application/arrival gate is
// involved), set its trust top, and let the game's own playerDeath
// succession run. FILTERED runs use the shipped npcIds(); CONTROL
// runs replace npcIds() with the pre-fix implementation
// (roster-minus-bearer), which is byte-identical on a clean roster,
// so pre-injection trajectories are identical and the first
// injected succession is paired by construction. CLEAN runs skip
// injection (guardrail vs the pilot postfix band).
//
// One process per seed; never two harnesses in one process. Prints
// one JSON summary line per seed to stdout and writes one per-seed
// JSON file into evidence/2026-11-02/perseed-npcdeadfilter-confirm/.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   DAYS=250 SEEDS=97330 RUN=filtered node scripts/npcdeadfilter-confirm-driver-20261102.js
// RUN is one of: filtered | control | clean.
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const TR = require(path.join(REPO, 'scripts', 'policies', 'titanroute'));
const MC = require(path.join(REPO, 'scripts', 'policies', 'musterclose'));
const MG = require(path.join(REPO, 'scripts', 'policies', 'mustergap'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`NFC STOP: ${k}=1 is required.`); process.exit(2); }
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '250', 10) || 250;
const RUN = process.env.RUN || 'filtered';
if (!SEEDS.length) { console.error('NFC STOP: SEEDS required.'); process.exit(2); }
if (['filtered', 'control', 'clean'].indexOf(RUN) < 0) { console.error('NFC STOP: RUN must be filtered|control|clean.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) { /* anchor stays unknown */ }

function basePolicy() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder');
}
function policyFor() {
  const b = basePolicy();
  const rt = TR.withTitanRoute(b, 'lead-titanroute', 'lead-fullseat + titanroute march/call');
  const mc = MC.withMusterClose(rt, 'lead-musterclose', 'lead-titanroute + musterclose deepening');
  return MG.withMusterGap(mc, 'lead-musterclose-commit', 'lead-musterclose + mustergap commit-own');
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function safe(fn, fallback) { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } }

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const deaths = [];
  const dailySnap = [];
  const sayKept = [];
  const errors = [];
  const injectionSkips = [];
  const failedVictims = {};
  let injection = null; // first successful injection record
  let injected = false;
  let injDay = null;

  function isDeadTriple(id) {
    try {
      const vrec = (Game.data.villagers || []).find(function (r) { return r.id === id; });
      if (vrec && vrec.dead) return true;
      const brec = (Game.data.background_survivors || []).find(function (r) { return r.id === id; });
      if (brec && brec.dead) return true;
      const vp = Game.vpOf ? Game.vpOf(id) : null;
      if (vp && vp.dead) return true;
    } catch (e) {}
    return false;
  }
  function isDead(id) {
    try { if (Game.deadMarked && Game.deadMarked(id)) return true; } catch (e) {}
    return isDeadTriple(id);
  }
  function hasPhoenix(id) {
    try { return !!(Game.npcHasAbility && Game.npcHasAbility(id, 'phoenix_clause')); } catch (e) { return false; }
  }

  // CONTROL PATCH: pre-fix npcIds (roster-minus-bearer, no dead
  // check). Installed UNDER the npcIds trap (patch first, then
  // trap wraps it), and re-asserted after setupGame in case setup
  // resets methods; byte-identical to the filter on a clean
  // roster, so pre-injection trajectories match.
  function installControlPatch() {
    try {
      if (Game.npcIds && (Game.npcIds.__nfcControl || Game.npcIds.__nfcWrapped)) return;
      const patched = function () {
        return ((Game.state.village || {}).roster || []).filter(function (id) { return id !== Game.villagerId; });
      };
      patched.__nfcControl = true;
      Game.npcIds = patched;
    } catch (e) { errors.push('control-patch: ' + String(e.message).slice(0, 80)); }
  }

  // SAY TRAP: keep succession/death lines plus a window around
  // the injection day (for the SENSE read).
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          const d = gday(Game);
          const inWindow = injDay !== null && d >= injDay - 1 && d <= injDay + 5;
          if (inWindow || /is dead|Codex|mantle|successor|village stops|screams|digging|you're not|walks in|Word came|never made it|Accepted|wants to join|Haven grows/i.test(arg)) {
            sayKept.push({ day: d, line: String(arg).slice(0, 500) });
          }
        }
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 120)); }

  // NPCIDS TRAP (clean-run G2 + general audit): every npcIds()
  // return scanned for dead ids. Wraps whatever npcIds currently
  // is — the control patch in control runs, the shipped filter
  // otherwise — so control dead returns are counted, not hidden.
  const npcIdsDeadFirsts = [];
  const npcIdsDeadSeen = {};
  let npcIdsDeadCallCount = 0;
  function installNpcIdsTrap() {
    try {
      const origNpcIds = Game.npcIds;
      if (typeof origNpcIds === 'function' && !origNpcIds.__nfcWrapped) {
        const w = function () {
          const r = origNpcIds.apply(this, arguments);
          try {
            const dead = (r || []).filter(function (id) { return isDeadTriple(id); });
            if (dead.length) {
              npcIdsDeadCallCount++;
              dead.forEach(function (id) {
                if (!npcIdsDeadSeen[id]) { npcIdsDeadSeen[id] = 1; npcIdsDeadFirsts.push({ day: gday(Game), id: id }); }
              });
            }
          } catch (e) {}
          return r;
        };
        w.__nfcWrapped = true;
        Game.npcIds = w;
      }
    } catch (e) { errors.push('npcIds-wrap: ' + String(e.message).slice(0, 80)); }
  }
  if (RUN === 'control') installControlPatch();
  installNpcIdsTrap();

  // PLAYERDEATH WRAP: inject corrupt-roster state at the first
  // qualifying natural bearer death (injected/control arms only),
  // then record the succession outcome.
  try {
    const origPD = Game.playerDeath;
    if (typeof origPD === 'function' && !origPD.__nfcWrapped) {
      const wrapped = function (cause) {
        const day = gday(Game);
        const oldId = Game.villagerId;
        const v = Game.state.village || {};
        const trust = v.trust || {};
        const rosterBefore = (v.roster || []).slice();
        let thisInjection = null;
        if (RUN !== 'clean' && !injected) {
          const livingNonBearers = rosterBefore.filter(function (id) { return id !== oldId && !isDead(id); });
          if (livingNonBearers.length >= 3) {
            const cands = livingNonBearers.filter(function (id) { return !failedVictims[id] && !hasPhoenix(id); });
            cands.sort(function (a, b) { return ((trust[b] || 0) - (trust[a] || 0)) || (rosterBefore.indexOf(a) - rosterBefore.indexOf(b)); });
            const victim = cands[0] || null;
            if (victim) {
              const victimName = safe(function () { return Game.displayName ? Game.displayName(victim) : null; }, null);
              const maxTrust = Math.max.apply(null, livingNonBearers.map(function (id) { return trust[id] || 0; }).concat([0]));
              try { Game.removeVillager(victim, 'killed'); } catch (e) { errors.push('inject-kill: ' + String(e.message).slice(0, 80)); }
              const deadNow = isDead(victim);
              const rosterAfterKill = (Game.state.village.roster || []).slice();
              if (deadNow) {
                if (rosterAfterKill.indexOf(victim) < 0) { try { Game.state.village.roster.push(victim); } catch (e) {} }
                try { (Game.state.village.trust || {})[victim] = maxTrust + 100; } catch (e) {}
                injected = true;
                injDay = day;
                thisInjection = { day: day, victim: victim, victimName: victimName, oldBearer: oldId, rosterSizeAtDeath: rosterBefore.length };
                injection = thisInjection;
              } else {
                failedVictims[victim] = 1;
                injectionSkips.push({ day: day, reason: 'victim-not-dead-after-kill', victim: victim });
              }
            } else {
              injectionSkips.push({ day: day, reason: 'no-eligible-victim', rosterSize: rosterBefore.length });
            }
          } else {
            injectionSkips.push({ day: day, reason: 'roster-too-small', rosterSize: rosterBefore.length, livingNonBearers: livingNonBearers.length });
          }
        }
        let candAtDeath = [], deadCandAtDeath = [];
        try { candAtDeath = Game.npcIds() || []; deadCandAtDeath = candAtDeath.filter(function (id) { return isDeadTriple(id); }); } catch (e) {}
        let result, thrown = null;
        try { result = origPD.apply(this, arguments); } catch (e) { thrown = e; }
        try {
          deaths.push({ day: day, oldBearer: oldId, oldName: safe(function () { return Game.displayName ? Game.displayName(oldId) : null; }, null),
            chosen: Game.villagerId || null, chosenName: Game.villagerId ? safe(function () { return Game.displayName ? Game.displayName(Game.villagerId) : null; }, null) : null,
            chosenDead: Game.villagerId ? isDead(Game.villagerId) : false,
            injection: thisInjection,
            candidatesAtDeath: candAtDeath, deadCandidatesAtDeath: deadCandAtDeath,
            error: thrown ? String(thrown.message).slice(0, 120) : null });
        } catch (e) { errors.push('death-snap: ' + String(e.message).slice(0, 80)); }
        if (thrown) throw thrown;
        return result;
      };
      wrapped.__nfcWrapped = true;
      Game.playerDeath = wrapped;
    }
  } catch (e) { errors.push('playerDeath-wrap: ' + String(e.message).slice(0, 120)); }

  function dailySnapFn() {
    try {
      dailySnap.push({ day: gday(Game), bearer: Game.villagerId || null, bearerDead: Game.villagerId ? isDead(Game.villagerId) : false,
        roster: ((Game.state || {}).village || {}).roster ? ((Game.state || {}).village || {}).roster.slice() : [],
        rosterDead: (((Game.state || {}).village || {}).roster || []).filter(function (id) { return isDeadTriple(id); }) });
    } catch (e) { errors.push('daily-snap: ' + String(e.message).slice(0, 80)); }
  }
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally { dailySnapFn(); }
    },
  });

  await setupGame(Game);
  // Re-assert patch+trap if setupGame reset Game methods.
  if (RUN === 'control' && !(Game.npcIds && (Game.npcIds.__nfcControl || Game.npcIds.__nfcWrapped))) {
    installControlPatch();
    installNpcIdsTrap();
  }
  let result = null;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });

  const st = Game.state || {};
  const bearerAfterDeath = [];
  if (injection) {
    const bd = dailySnap.filter(function (s) { return s.day > injection.day && s.bearerDead; }).map(function (s) { return s.day; });
    if (bd.length) bearerAfterDeath.push({ id: injection.victim, bearerDays: bd });
  }
  // Any dead-bearer days at all (control aftermath signature).
  const deadBearerDays = dailySnap.filter(function (s) { return s.bearerDead; }).map(function (s) { return s.day; });
  let scaleRank = null, national = false;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
  try { national = Game.scaleAtLeast ? !!Game.scaleAtLeast(scaleRank, 'national') : (scaleRank === 'national' || scaleRank === 'global'); } catch (e) {}
  const injectedDeath = deaths.filter(function (d) { return d.injection; })[0] || null;

  return { seed, arm: 'npcdeadfilter-confirm', run: RUN, anchorCommit: ANCHOR,
    gameDays: (st.scholar && st.scholar.day) || 0,
    days: result.days, endReason: result.endReason,
    won: !!Game.won, villageLost: !!Game.villageLost,
    scaleRank: scaleRank, national: national,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: deaths, deathCount: deaths.length,
    injection: injection, injectedDeath: injectedDeath,
    injectionSkips: injectionSkips,
    bearerAfterDeath: bearerAfterDeath, deadBearerDays: deadBearerDays,
    npcIdsDeadFirsts: npcIdsDeadFirsts, npcIdsDeadCallCount: npcIdsDeadCallCount,
    dailySnap: dailySnap, sayKept: sayKept, errors: errors };
}

(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-11-02', 'perseed-npcdeadfilter-confirm');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const rec = await oneRun(seed);
    const file = path.join(outDir, `cf-s${seed}-${RUN}.json`);
    fs.writeFileSync(file, JSON.stringify(rec, null, 2) + '\n');
    const inj = rec.injectedDeath;
    console.log(JSON.stringify({ seed: rec.seed, run: rec.run, gameDays: rec.gameDays, endReason: rec.endReason,
      won: rec.won, scaleRank: rec.scaleRank, maxWaveUnlocked: rec.maxWaveUnlocked,
      deathCount: rec.deathCount,
      injected: inj ? { day: inj.day, victim: inj.injection.victimName || inj.injection.victim, chosen: inj.chosenName, chosenDead: inj.chosenDead } : null,
      injectionSkips: rec.injectionSkips.map(function (s) { return 'd' + s.day + ':' + s.reason; }),
      deadBearerDays: rec.deadBearerDays.length,
      npcIdsDeadCallCount: rec.npcIdsDeadCallCount, errors: rec.errors,
      file: path.relative(REPO, file) }));
  }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
