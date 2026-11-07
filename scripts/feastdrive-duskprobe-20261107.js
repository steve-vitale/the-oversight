// feastdrive-duskprobe-20261107.js — the dusk-gate probe
// (arm sim-feastdrive-b, DIAG follow-up, prereg v1.1). The diag
// replay showed 5/8 seeds armed for months with 42–116
// feasible-feast snapshot days and ZERO feasts hosted —
// competent.eveningFeast never fires. Its gates are dusk-time
// state (at haven at dusk? recent gives ≥1500 kcal/week?), which
// the end-of-daily snapshot cannot see. This probe replays the
// FROZEN staged policy on the 5 armed-no-feast seeds and records,
// at EVERY dusk upkeep, the eveningFeast gate state verbatim:
// at-haven, armed, feast plan ok/cost/have, cumulative gives, and
// reactor online. No policy change, no new verdict bar — it names
// WHICH gate blocks the feast so the drive targets it instead of
// guessing. Corpus: evidence/2026-11-07/perseed-feastdrive-b-dusk/.
// Usage:
//   DAYS=150 SEEDS=53001,53002,53003,53007,53008 RUN=feastdrive-dusk node scripts/feastdrive-duskprobe-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const STAGED = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const INST = require(path.join(REPO, 'scripts', 'feastdrive-instrument-20261107'));

function expandSeeds(raw) {
  const out = [];
  (raw || '').split(',').forEach(function (part) {
    const t = part.trim();
    if (!t) return;
    const m = t.match(/^(\d+)\.\.(\d+)$/);
    if (m) { for (let s = parseInt(m[1], 10); s <= parseInt(m[2], 10); s++) out.push(s); }
    else if (Number.isFinite(parseInt(t, 10))) out.push(parseInt(t, 10));
  });
  return out;
}

const SEEDS = expandSeeds(process.env.SEEDS);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'feastdrive-dusk';
if (!SEEDS.length) { console.error('DUSKPROBE STOP: SEEDS required.'); process.exit(2); }
const policy = STAGED.stagedPolicy;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-07', 'perseed-feastdrive-b-dusk');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'feastdrive-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('DUSKPROBE STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function givesCum(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const g = (v.gives || {})[Game.villagerId];
    return (g == null) ? 0 : (g | 0);
  } catch (e) { return null; }
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-feastdrive-dusk', fullTelemetry: false });
  const errors = [];
  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  const duskRows = [];
  const givesByDay = {};
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
          try { if (givesByDay[d] == null) givesByDay[d] = givesCum(Game); } catch (e) {}
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
    upkeep: function (Gm, ctx) {
      let r = undefined;
      try { r = policy.upkeep ? policy.upkeep(Gm, ctx) : undefined; } finally {
        try {
          const d = gday(Game);
          if (givesByDay[d] == null) givesByDay[d] = givesCum(Game);
          if (Game.dayPart === 2) {
            const s = (Game.state || {}).scholar || {};
            const pg = s.prog || {};
            let plan = null;
            try { const p = (typeof Game.feastPlan === 'function') ? Game.feastPlan() : null; if (p) plan = { ok: !!p.ok, cost: (p.cost | 0), have: (p.have | 0), why: p.why || null }; } catch (e) {}
            let atHaven = null;
            try { atHaven = (typeof Game.playerAtHaven === 'function') ? !!Game.playerAtHaven() : null; } catch (e) {}
            let reactor = null;
            try { reactor = (typeof Game.fusionReactorOnline === 'function') ? !!Game.fusionReactorOnline() : null; } catch (e) {}
            duskRows.push({ day: d, part: Game.dayPart, atHaven: atHaven,
              armed: (pg.feastSurge === false || pg.feastSurge == null) ? false : pg.feastSurge,
              plan: plan, givesCum: givesCum(Game), reactorOnline: reactor,
              feastDayToday: s.feastDay === d });
          }
        } catch (e) { errors.push('dusk: ' + String(e.message).slice(0, 80)); }
      }
      return r;
    },
  });

  try { RALLY.resetBankkillerStats(); } catch (e) { errors.push('rally-reset: ' + String(e.message).slice(0, 80)); }
  try { STAGED.resetStageallyStats(); } catch (e) { errors.push('stageally-reset: ' + String(e.message).slice(0, 80)); }
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  let fin = null;
  try { fin = inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  // Recent-7d gives at each dusk: givesCum(day) - givesCum(day-7).
  const recentGives = {};
  Object.keys(givesByDay).forEach(function (k) {
    const d = parseInt(k, 10);
    const now = givesByDay[d];
    const week = givesByDay[d - 7];
    if (now != null && week != null) recentGives[d] = now - week;
  });
  duskRows.forEach(function (row) { row.recentGives7d = (recentGives[row.day] == null) ? null : recentGives[row.day]; });

  const out = {
    seed: seed, arm: 'feastdrive-dusk', run: RUN, policy: 'staged', anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, standing: fin ? fin.standing : null,
    duskRows: duskRows, givesByDay: givesByDay,
    feastEvents: fin ? fin.feastEvents : null,
    firstArmDay: fin ? fin.firstArmDay : null, firstFeastDay: fin ? fin.firstFeastDay : null,
    endFeastGate: fin ? fin.endFeastGate : null,
    daily: t.daily, instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'feastdrive-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const dusks = out.duskRows || [];
    const armedDusks = dusks.filter(function (r) { return !!r.armed; });
    const armedAtHaven = armedDusks.filter(function (r) { return r.atHaven; });
    const armedFeasible = armedDusks.filter(function (r) { return r.atHaven && r.plan && r.plan.ok && r.plan.have >= r.plan.cost * 1.5 && (r.recentGives7d == null || r.recentGives7d >= 1500); });
    const armedGivesShort = armedDusks.filter(function (r) { return r.atHaven && r.plan && r.plan.ok && r.plan.have >= r.plan.cost * 1.5 && r.recentGives7d != null && r.recentGives7d < 1500; });
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason,
      dusks: dusks.length, armedDusks: armedDusks.length,
      armedAtHaven: armedAtHaven.length, armedAway: armedDusks.length - armedAtHaven.length,
      armedFeasible: armedFeasible.length, armedGivesShort: armedGivesShort.length,
      feasts: (out.feastEvents && out.feastEvents.feasts.length) || 0,
      endFeastGate: out.endFeastGate, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
