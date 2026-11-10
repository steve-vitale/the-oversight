// secondlink-driver-20261110.js — second-link road recorder pilot driver
// (arm sim-secondlink-a). Competent policy VERBATIM, default env,
// death-aware horizon (runDays ends on village death / win). Seeds run
// sequentially in one process via the shared harness (loadGame per seed,
// as the trustgrowth driver does).
//
// Two legs on the same seeds:
//   SECONDLINK_MODE=on  (default): instrument installed — daily
//     snapshots + method wraps + lazy tele capture.
//   SECONDLINK_MODE=off: no instrument at all — end-of-run wall
//     numbers only (neutrality leg).
// Per-seed JSON goes to evidence/2026-11-10/perseed-secondlink-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file.
// Usage:
//   DAYS=150 SEEDS=99101,99102 RUN=secondlink-pilot SECONDLINK_MODE=on node scripts/secondlink-driver-20261110.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'secondlink-instrument-20261110'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'secondlink-pilot';
const MODE = (process.env.SECONDLINK_MODE || 'on').toLowerCase();
if (!SEEDS.length) { console.error('SECONDLINK STOP: SEEDS required.'); process.exit(2); }
if (MODE !== 'on' && MODE !== 'off') { console.error('SECONDLINK STOP: SECONDLINK_MODE must be on|off.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-10', 'perseed-secondlink-a');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'secondlink-s' + seed + '-' + RUN + '-' + MODE + '.json');
  if (fs.existsSync(file)) { console.error('SECONDLINK STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-secondlink', fullTelemetry: false });
  const linkSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (/link|bond|raise|polity|realm|season|tribute|trust/i.test(arg) && linkSays.length < 200) linkSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let inst = null;
  if (MODE === 'on') inst = INST.install(Game);
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          if (inst) inst.installTeleLazy();
          const d = gday(Game);
          if (inst && d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (inst) inst.snapshot(); } catch (e) {}
  try { if (inst) inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let linkTotal = null;
  try { linkTotal = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState().length : null; } catch (e) {}

  const out = {
    seed: seed, arm: 'secondlink', run: RUN, mode: MODE, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    linkTotal: linkTotal,
    linkSays: linkSays, sayCount: sayCount,
    instrumentErrors: (inst ? inst.t.instrumentErrors : []).concat(errors),
  };
  if (inst) {
    out.daily = inst.t.daily;
    out.bondEvents = inst.t.bondEvents;
    out.stageCalls = inst.t.stageCalls;
    out.acceptCalls = inst.t.acceptCalls;
    out.declineCalls = inst.t.declineCalls;
    out.proposeCalls = inst.t.proposeCalls;
    out.linkTickCalls = inst.t.linkTickCalls;
  }
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'secondlink-s' + seed + '-' + RUN + '-' + MODE + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const last = (out.daily && out.daily[out.daily.length - 1]) || {};
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      links: out.linkTotal != null ? out.linkTotal : null,
      bondEvents: out.bondEvents ? out.bondEvents.length : null,
      stageCalls: out.stageCalls ? out.stageCalls.length : null,
      snapshots: out.daily ? out.daily.length : null,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
