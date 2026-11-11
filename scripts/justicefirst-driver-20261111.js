// justicefirst-driver-20261111.js — justice + moot first-numbers pilot driver
// (arm sim-justicefirst-a, run fleshout-20261111T1115Z). Competent policy
// verbatim, 150d death-aware horizon, fresh band 190311–190318.
//
// Two legs on the same seeds; the ONLY difference is whether the
// instrument is installed:
//   JUSTICEFIRST_MODE=control -> instrument ON (the judged leg)
//   JUSTICEFIRST_MODE=neutral -> instrument OFF (no wraps, no snapshots;
//     end-of-run wall numbers only) — the neutrality leg.
// Per-seed JSON goes to evidence/2026-11-11/perseed-justicefirst-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=190311,190312 RUN=justicefirst-pilot JUSTICEFIRST_MODE=control node scripts/justicefirst-driver-20261111.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const JF = require(path.join(REPO, 'scripts', 'justicefirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'justicefirst-pilot';
const MODE = (process.env.JUSTICEFIRST_MODE || 'control').toLowerCase();
const INST_ON = MODE !== 'neutral';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-11', 'perseed-justicefirst-a');

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
// cap can exhaust early — narrowed to justice/moot language so generic
// fire flavor does not eat it).
const SAY_RE = /moot|justice|⚖|accused|verdict|guilty|not guilty|exile|exiled|confront|cold shoulder|uprising|weregild|schism|cold war|stands accused|summons|bribe|accusation|case file|the moot|a moot|your vote|the count is taken|The count falls|ADVISORY sense|the fire (said|remembers|wouldn|can't|couldn)|silence is an answer|restitution|amends/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-justicefirst', fullTelemetry: false });
  const justiceSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && justiceSays.length < 200) justiceSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let jf = null;
  if (INST_ON) jf = JF.install(Game);
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (jf && d !== lastSnapDay) { lastSnapDay = d; jf.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (jf) jf.snapshot(); } catch (e) {}
  try { if (jf) jf.uninstall(); } catch (e) { errors.push('uninstall-jf: ' + String(e.message).slice(0, 80)); }

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
    seed: seed, arm: 'justicefirst', run: RUN, mode: MODE,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    justiceSays: justiceSays, sayCount: sayCount,
    instrumentErrors: (jf ? jf.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
  };
  if (jf) {
    out.crimeEvents = jf.t.crimeEvents;
    out.tickEvents = jf.t.tickEvents;
    out.heatEvents = jf.t.heatEvents;
    out.confrontEvents = jf.t.confrontEvents;
    out.respondEvents = jf.t.respondEvents;
    out.demandEvents = jf.t.demandEvents;
    out.syncEvents = jf.t.syncEvents;
    out.aftermathEvents = jf.t.aftermathEvents;
    out.uprisingEvents = jf.t.uprisingEvents;
    out.uprisingAfterEvents = jf.t.uprisingAfterEvents;
    out.exileColdEvents = jf.t.exileColdEvents;
    out.exileCutsEvents = jf.t.exileCutsEvents;
    out.exilePlayerEvents = jf.t.exilePlayerEvents;
    out.theftConfEvents = jf.t.theftConfEvents;
    out.stealEvents = jf.t.stealEvents;
    out.openCaseEvents = jf.t.openCaseEvents;
    out.openPlayerCaseEvents = jf.t.openPlayerCaseEvents;
    out.considerEvents = jf.t.considerEvents;
    out.forceEvents = jf.t.forceEvents;
    out.conveneHeldEvents = jf.t.conveneHeldEvents;
    out.callMootEvents = jf.t.callMootEvents;
    out.trialEvents = jf.t.trialEvents;
    out.tallyEvents = jf.t.tallyEvents;
    out.quorumEvents = jf.t.quorumEvents;
    out.voteEvents = jf.t.voteEvents;
    out.finishEvents = jf.t.finishEvents;
    out.sentenceEvents = jf.t.sentenceEvents;
    out.resolveEvents = jf.t.resolveEvents;
    out.bribeEvents = jf.t.bribeEvents;
    out.exposeEvents = jf.t.exposeEvents;
    out.investigateEvents = jf.t.investigateEvents;
    out.removeEvents = jf.t.removeEvents;
    out.bumpTrustEvents = jf.t.bumpTrustEvents;
    out.grievanceEvents = jf.t.grievanceEvents;
    out.daily = jf.t.daily;
    out.wrapLive = jf.t.wrapLive;
    out.wrapCounts = jf.t.wrapCounts;
  }
  return out;
}

(async function () {
  if (!SEEDS.length) { console.error('JUSTICEFIRST STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'neutral') { console.error('JUSTICEFIRST MODE must be control|neutral.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'justicefirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('JUSTICEFIRST STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'justicefirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      crimes: out.crimeEvents ? out.crimeEvents.length : null,
      ticks: out.tickEvents ? out.tickEvents.length : null,
      confronts: out.confrontEvents ? out.confrontEvents.length : null,
      responds: out.respondEvents ? out.respondEvents.length : null,
      demands: out.demandEvents ? out.demandEvents.length : null,
      uprisings: out.uprisingEvents ? out.uprisingEvents.length : null,
      cases: (out.openCaseEvents ? out.openCaseEvents.length : 0) + (out.openPlayerCaseEvents ? out.openPlayerCaseEvents.length : 0),
      moots: out.callMootEvents ? out.callMootEvents.length : null,
      trials: out.trialEvents ? out.trialEvents.length : null,
      verdicts: out.finishEvents ? out.finishEvents.length : null,
      sentences: out.sentenceEvents ? out.sentenceEvents.length : null,
      resolves: out.resolveEvents ? out.resolveEvents.length : null,
      votes: out.voteEvents ? out.voteEvents.length : null,
      bribes: out.bribeEvents ? out.bribeEvents.length : null,
      exiles: out.exilePlayerEvents ? out.exilePlayerEvents.length : null,
      removalsExiled: out.removeEvents ? out.removeEvents.filter(function (r) { return r.reason === 'exiled'; }).length : null,
      bumpTrust: out.bumpTrustEvents ? out.bumpTrustEvents.length : null,
      grievances: out.grievanceEvents ? out.grievanceEvents.length : null,
      snapshots: out.daily ? out.daily.length : null,
      justiceSays: out.justiceSays.length,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
