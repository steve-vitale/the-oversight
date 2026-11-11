// abilityfirst-driver-20261111.js — abilities + XP first-numbers pilot driver
// (arm sim-abilityfirst-a, run fleshout-20261111T1015Z). Competent policy
// verbatim, 150d death-aware horizon, fresh band 190221–190228.
//
// Two legs on the same seeds; the ONLY difference is whether the
// instrument is installed:
//   ABILITYFIRST_MODE=control -> instrument ON (the judged leg)
//   ABILITYFIRST_MODE=neutral -> instrument OFF (no wraps, no snapshots;
//     end-of-run wall numbers only) — the neutrality leg.
// Per-seed JSON goes to evidence/2026-11-11/perseed-abilityfirst-a/
// (sims write once, on purpose). Refuses to overwrite an existing
// per-seed file. Writes use the fishstaff-b writeRobust pattern
// (tmp + readback + @@FALLBACK stdout after 60 retries) so an EPERM
// flap cannot silently lose a seed.
// Usage:
//   DAYS=150 SEEDS=190221,190222 RUN=abilityfirst-pilot ABILITYFIRST_MODE=control node scripts/abilityfirst-driver-20261111.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const AF = require(path.join(REPO, 'scripts', 'abilityfirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'abilityfirst-pilot';
const MODE = (process.env.ABILITYFIRST_MODE || 'control').toLowerCase();
const INST_ON = MODE !== 'neutral';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-11', 'perseed-abilityfirst-a');

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
// cap can exhaust early — narrowed to ability/XP/synergy/slot language so
// generic "gift" flavor does not eat it).
const SAY_RE = /abilit|level up|LEVEL UP|synergy|synergies|deepened|evolution|evolv|ability slot|slots?:|resonance|trial|gift|✨ Ability|◈ THE SPARK|◈ THE MENTOR|◈ THE TRIAL|◈ THE CREEP|◈ THE GRANT|keepsake|channel/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-abilityfirst', fullTelemetry: false });
  const abilitySays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && abilitySays.length < 200) abilitySays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let af = null;
  if (INST_ON) af = AF.install(Game);
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (af && d !== lastSnapDay) { lastSnapDay = d; af.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (af) af.snapshot(); } catch (e) {}
  try { if (af) af.uninstall(); } catch (e) { errors.push('uninstall-af: ' + String(e.message).slice(0, 80)); }

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
    seed: seed, arm: 'abilityfirst', run: RUN, mode: MODE,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    abilitySays: abilitySays, sayCount: sayCount,
    instrumentErrors: (af ? af.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
  };
  if (af) {
    out.xpEvents = af.t.xpEvents;
    out.deedEvents = af.t.deedEvents;
    out.synergyXpEvents = af.t.synergyXpEvents;
    out.abilityXpEvents = af.t.abilityXpEvents;
    out.pickEvents = af.t.pickEvents;
    out.keepEvents = af.t.keepEvents;
    out.pumpEvents = af.t.pumpEvents;
    out.offerEvents = af.t.offerEvents;
    out.villGrantEvents = af.t.villGrantEvents;
    out.skillEvents = af.t.skillEvents;
    out.villResolveEvents = af.t.villResolveEvents;
    out.useEvents = af.t.useEvents;
    out.npcAbilityEvents = af.t.npcAbilityEvents;
    out.synergyUnlockEvents = af.t.synergyUnlockEvents;
    out.evolutionEvents = af.t.evolutionEvents;
    out.channelEvents = af.t.channelEvents;
    out.slotEvents = af.t.slotEvents;
    out.passiveEvents = af.t.passiveEvents;
    out.teleEvents = af.t.teleEvents;
    out.daily = af.t.daily;
    out.wrapLive = af.t.wrapLive;
    out.wrapCounts = af.t.wrapCounts;
  }
  return out;
}

(async function () {
  if (!SEEDS.length) { console.error('ABILITYFIRST STOP: SEEDS required.'); process.exit(2); }
  if (MODE !== 'control' && MODE !== 'neutral') { console.error('ABILITYFIRST STOP: ABILITYFIRST_MODE must be control|neutral.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'abilityfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('ABILITYFIRST STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'abilityfirst-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      xpEvents: out.xpEvents ? out.xpEvents.length : null,
      deedEvents: out.deedEvents ? out.deedEvents.length : null,
      synergyXp: out.synergyXpEvents ? out.synergyXpEvents.length : null,
      abilityXp: out.abilityXpEvents ? out.abilityXpEvents.length : null,
      picks: out.pickEvents ? out.pickEvents.length : null,
      keeps: out.keepEvents ? out.keepEvents.length : null,
      pumps: out.pumpEvents ? out.pumpEvents.length : null,
      offers: out.offerEvents ? out.offerEvents.length : null,
      villGrants: out.villGrantEvents ? out.villGrantEvents.length : null,
      skills: out.skillEvents ? out.skillEvents.length : null,
      villResolves: out.villResolveEvents ? out.villResolveEvents.length : null,
      uses: out.useEvents ? out.useEvents.length : null,
      npcUses: out.npcAbilityEvents ? out.npcAbilityEvents.length : null,
      synergyUnlocks: out.synergyUnlockEvents ? out.synergyUnlockEvents.length : null,
      evolutions: out.evolutionEvents ? out.evolutionEvents.length : null,
      channels: out.channelEvents ? out.channelEvents.length : null,
      slots: out.slotEvents ? out.slotEvents.length : null,
      passives: out.passiveEvents ? out.passiveEvents.length : null,
      tele: out.teleEvents ? out.teleEvents.length : null,
      snapshots: out.daily ? out.daily.length : null,
      abilitySays: out.abilitySays.length,
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
