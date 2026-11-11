// relayfirst-driver-20261111.js — relay / Network campaign first-numbers pilot driver
// (arm sim-relayfirst-a, run fleshout-20261111T1115Z). Competent policy
// verbatim, 150d death-aware horizon, fresh band 190331–190338.
//
// Two legs on the same seeds; the ONLY difference is whether the
// instrument is installed:
//   RELAYFIRST_MODE=control -> instrument ON (the judged leg)
//   RELAYFIRST_MODE=neutral -> instrument OFF (no wraps, no snapshots;
//     end-of-run wall numbers only) — the neutrality leg.
// Per-seed JSON goes to evidence/2026-11-11/perseed-relayfirst-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=190331,190332 RUN=relayfirst-pilot RELAYFIRST_MODE=control node scripts/relayfirst-driver-20261111.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const RF = require(path.join(REPO, 'scripts', 'relayfirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'relayfirst-pilot';
const MODE = (process.env.RELAYFIRST_MODE || 'control').toLowerCase();
const INST_ON = MODE !== 'neutral';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-11', 'perseed-relayfirst-a');

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 60; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 59) {
        process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n');
        return;
      }
      const t0 = Date.now(); while (Date.now() - t0 < 2000) {}
    }
  }
}

// Prereg regex (same early-game-only caveat as the siblings: the 200-line
// cap can exhaust early — narrowed to relay/binding/Network/finale/
// overtime/titan language so generic flavor does not eat it).
const SAY_RE = /relay|switchboard|📡|leaning|grounding|sysbond|sysBond|commune|The Binding|binding|BELONG|First Court|GOVERNANCE LAYER|OVERTIME|THE NETWORK|network|finale|FINALE|titan|herald|nielsen|spoiler|mast|limb|THE HEART|THE HOSTS|hosts|table|seat|oath|swear/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-relayfirst', fullTelemetry: false });
  const relaySays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && relaySays.length < 200) relaySays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let rf = null;
  if (INST_ON) rf = RF.install(Game);
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (rf && d !== lastSnapDay) { lastSnapDay = d; rf.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (rf) rf.snapshot(); } catch (e) {}
  try { if (rf) rf.uninstall(); } catch (e) { errors.push('uninstall-rf: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let pantryKcal = 0;
  try {
    pantryKcal = ((st.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) {}

  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  const out = {
    seed: seed, arm: 'relayfirst', run: RUN, mode: MODE,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    relaySays: relaySays, sayCount: sayCount,
    instrumentErrors: (rf ? rf.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
  };
  if (rf) {
    out.relayEvents = rf.t.relayEvents;
    out.grantEvents = rf.t.grantEvents;
    out.abilityUseEvents = rf.t.abilityUseEvents;
    out.unlockEvents = rf.t.unlockEvents;
    out.summonEvents = rf.t.summonEvents;
    out.titanCallEvents = rf.t.titanCallEvents;
    out.titanSlewEvents = rf.t.titanSlewEvents;
    out.spawnEvents = rf.t.spawnEvents;
    out.faceEvents = rf.t.faceEvents;
    out.fightEvents = rf.t.fightEvents;
    out.teleEvents = rf.t.teleEvents;
    out.daily = rf.t.daily;
    out.wrapLive = rf.t.wrapLive;
    out.wrapCounts = rf.t.wrapCounts;
  }
  return out;
}

(async function () {
  if (!SEEDS.length) { console.error('RELAYFIRST STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'neutral') { console.error('RELAYFIRST STOP: RELAYFIRST_MODE must be control|neutral.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'relayfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('RELAYFIRST STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'relayfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      relayEvents: out.relayEvents ? out.relayEvents.length : null,
      grants: out.grantEvents ? out.grantEvents.length : null,
      abilityUses: out.abilityUseEvents ? out.abilityUseEvents.length : null,
      unlocks: out.unlockEvents ? out.unlockEvents.length : null,
      summons: out.summonEvents ? out.summonEvents.length : null,
      titanCalls: out.titanCallEvents ? out.titanCallEvents.length : null,
      titanSlews: out.titanSlewEvents ? out.titanSlewEvents.length : null,
      spawns: out.spawnEvents ? out.spawnEvents.length : null,
      faces: out.faceEvents ? out.faceEvents.length : null,
      fights: out.fightEvents ? out.fightEvents.length : null,
      tele: out.teleEvents ? out.teleEvents.length : null,
      snapshots: out.daily ? out.daily.length : null,
      relaySays: out.relaySays.length,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
