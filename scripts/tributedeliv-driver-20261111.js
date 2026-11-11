// tributedeliv-driver-20261111.js — tribute-delivery diag driver
// (arm sim-tributedeliv-b). Instrument-only, ZERO src/js.
//
// One leg, competent policy verbatim, 150d death-aware. Per day per seed
// it records ladderCapstoneReady('military_tribute') + the delivery
// gate's own `seen` replication + every ladderDeliverCapstone attempt
// (expected: zero — the policy never calls the Haven entry point).
//
// Re-trace seeds 190393 / 190397 must reproduce the vetphantom fix leg:
// end tribute {ready:true, veterans:2, payable:1} on both. The driver
// prints REPRODUCED / MISMATCH per re-trace seed against that
// expectation (read from the vetphantom per-seed JSONs before this run).
//
// Per-seed JSON goes to evidence/2026-11-11/perseed-tributedeliv-b/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries).
// Usage:
//   DAYS=150 SEEDS=190393,190397 RUN=tributedeliv-retrace node scripts/tributedeliv-driver-20261111.js
//   DAYS=150 SEEDS=190411,190412,190413,190414,190415,190416,190417,190418 RUN=tributedeliv-band node scripts/tributedeliv-driver-20261111.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const TD = require(path.join(REPO, 'scripts', 'tributedeliv-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'tributedeliv';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// Vetphantom fix-leg end expectations for the re-trace seeds.
const RETRACE_EXPECT = {
  190393: { ready: true, veterans: 2, payable: 1 },
  190397: { ready: true, veterans: 2, payable: 1 },
};

const outDir = path.join(REPO, 'evidence', '2026-11-11', 'perseed-tributedeliv-b');

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

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-tributedeliv', fullTelemetry: false });
  await setupGame(Game);
  const inst = TD.install(Game);
  let lastSnapDay = -1;
  const errors = [];
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });
  try { inst.snapshot(); } catch (e) {}
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null, standing = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let pantryKcal = 0;
  try {
    pantryKcal = ((st.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) {}
  let tribute = null, ladderVets4 = null, blooded = null;
  try { tribute = (typeof Game.ladderCapstoneReady === 'function') ? Game.ladderCapstoneReady('military_tribute') : null; } catch (e) { errors.push('tribute: ' + String(e.message).slice(0, 80)); }
  try { ladderVets4 = (typeof Game._ladderLivingVeterans === 'function') ? Game._ladderLivingVeterans(4) : null; } catch (e) { errors.push('ladderVets4: ' + String(e.message).slice(0, 80)); }
  try { blooded = (typeof Game.villageBlooded === 'function') ? Game.villageBlooded() : null; } catch (e) { errors.push('blooded: ' + String(e.message).slice(0, 80)); }

  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  let retrace = null;
  if (RETRACE_EXPECT[seed]) {
    const exp = RETRACE_EXPECT[seed];
    const got = tribute || {};
    retrace = {
      expected: exp,
      got: { ready: !!got.ready, veterans: got.veterans | 0, payable: got.payable | 0 },
      reproduced: !!got.ready === exp.ready && (got.veterans | 0) === exp.veterans && (got.payable | 0) === exp.payable,
    };
  }

  return {
    seed: seed, arm: 'tributedeliv', run: RUN,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    tribute: tribute, ladderVets4: ladderVets4, blooded: blooded,
    retrace: retrace,
    tributeSays: inst.t.tributeSays, sayCount: inst.t.sayCount,
    attempts: inst.t.attempts,
    instrumentErrors: inst.t.instrumentErrors.concat(errors),
    deaths: deaths,
    daily: inst.t.daily,
    samples: result.samples || null,
  };
}

(async function () {
  if (!SEEDS.length) { console.error('TRIBUTEDLIV STOP: SEEDS required.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'tributedeliv-s' + seed + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('TRIBUTEDLIV STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'tributedeliv-s' + seed + '-' + RUN + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    const readyDays = (out.daily || []).filter(function (d) { return d.tribute && d.tribute.ready; }).length;
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      tributeEnd: out.tribute, retrace: out.retrace,
      readyDays: readyDays, attempts: out.attempts.length, tributeSays: out.tributeSays.length,
      snapshots: out.daily ? out.daily.length : null, deaths: out.deaths.length,
      errors: out.instrumentErrors.length, file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
