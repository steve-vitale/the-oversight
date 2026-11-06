// linkseek-driver-20261106.js — link-seeking probe pilot driver
// (arm sim-linkseek-b). Two legs per seed on IDENTICAL seeds:
// BASELINE competent verbatim, ARMED linkseek. Default env,
// death-aware horizon (runDays ends on village death / win).
// Seeds run sequentially in one process via the shared harness
// (loadGame per leg, as the standaccum driver does). Per-seed JSON
// goes to evidence/2026-11-06/perseed-linkseek-b/ (sims write once,
// on purpose). Refuses to overwrite an existing per-seed file.
// Usage:
//   DAYS=150 SEEDS=56001,56002 RUN=linkseek-pilot node scripts/linkseek-driver-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const { linkseek } = require(path.join(REPO, 'scripts', 'policies', 'linkseek'));
const INST = require(path.join(REPO, 'scripts', 'linkseek-instrument-20261106'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'linkseek-pilot';
if (!SEEDS.length) { console.error('LINKSEEK STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-06', 'perseed-linkseek-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  for (const leg of ['baseline', 'armed']) {
    const file = path.join(outDir, 'linkseek-s' + seed + '-' + leg + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('LINKSEEK STOP: refusing to overwrite ' + file); process.exit(3); }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// Tight say filter: the standaccum filter drowned in pantry lines
// ('standing' matches 'leaves the fish nets standing'; 'link'
// matches 'blink'). Word-boundary on link, standing only with a
// number, plus the courtship verbs that matter.
const SAY_RE = /Standing \d|FEAST|HELD|draft waits|smoke on the horizon|declines|counter|codex|study|\blink\b|bond|realm|polity|propose|tribute|doesn't answer the knock|doesn't say no/i;

async function oneRun(seed, leg) {
  const policy = (leg === 'armed') ? linkseek : competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-linkseek', fullTelemetry: false });
  const linkSays = [];
  let sayCount = 0;
  const errors = [];
  let proposeCalls = 0;
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && linkSays.length < 200) linkSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }
  // Spy (not stub): count proposeLink calls to pin the baseline's
  // never-asked claim in the run itself.
  try {
    const origPropose = Game.proposeLink;
    if (typeof origPropose === 'function') {
      Game.proposeLink = function () { proposeCalls++; return origPropose.apply(this, arguments); };
    }
  } catch (e) { errors.push('propose-spy: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  let lastSnapDay = -1;
  let courtLog = [];
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          if (ctx && Array.isArray(ctx.courtLog) && ctx.courtLog.length > courtLog.length) {
            courtLog = ctx.courtLog.slice();
          }
        } catch (e) { errors.push('courtlog-drain: ' + String(e.message).slice(0, 80)); }
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let w4kills = null;
  try {
    const log = st.waveKillLog || [];
    w4kills = log.length;
  } catch (e) { w4kills = null; }
  let w4faced = null;
  try { w4faced = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) > 0) : null; } catch (e) {}

  const out = {
    seed: seed, arm: 'linkseek', leg: leg, run: RUN, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    w4faced: w4faced, waveKillLogEntries: w4kills,
    proposeCalls: proposeCalls,
    courtLog: courtLog,
    daily: t.daily, linkSays: linkSays, sayCount: sayCount,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    for (const leg of ['baseline', 'armed']) {
      const out = await oneRun(seed, leg);
      const file = path.join(outDir, 'linkseek-s' + seed + '-' + leg + '-' + RUN + '.json');
      fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
      const last = out.daily[out.daily.length - 1] || {};
      const r5 = last.readiness5 || {};
      const maxKnown = out.daily.reduce(function (m, s) { return Math.max(m, ((s.knowledge || {}).knownCount || 0)); }, 0);
      const maxLinks = out.daily.reduce(function (m, s) { return Math.max(m, (s.linkTotal || 0)); }, 0);
      const maxDiplo = out.daily.reduce(function (m, s) { return Math.max(m, ((s.standing || {}).diplomacy || 0)); }, 0);
      console.log(JSON.stringify({
        seed: out.seed, leg: out.leg, days: out.days, endReason: out.endReason, won: out.won,
        maxWave: out.maxWave, standing: out.standing,
        endGated: last.gated != null ? last.gated : null,
        endRaw: last.standing ? last.standing.total : null,
        endReady: r5.ready != null ? r5.ready : null,
        maxKnown: maxKnown, maxLinks: maxLinks, maxDiplo: maxDiplo,
        proposeCalls: out.proposeCalls, courtEvents: out.courtLog.length,
        snapshots: out.daily.length, errors: out.instrumentErrors.length,
        file: path.relative(REPO, file),
      }));
    }
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
