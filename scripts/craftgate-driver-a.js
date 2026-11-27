#!/usr/bin/env node
// craftgate-driver-a.js — home-duty craft-gate DIAG driver (arm
// sim-craftgate-a, Loop A 20261127T1915Z, axis scale-onramp).
// One process per seed; never two harnesses in one process. Prints one
// JSON summary line per seed to stdout and writes one per-seed JSON file
// into evidence/2026-11-27/perseed-craftgate-a/ (sims write once, on
// purpose, into evidence/<date>/). Refuses to overwrite an existing
// per-seed file.
//
// POLICY: competent verbatim (scripts/policies/competent.js). No policy
// variant, no game-code change — instrument only
// (scripts/craftgate-instrument-a.js: daily pile-material +
// at-home-carrier snapshots, gate-state rows, attempt rows, and the
// aidammo ammo-provenance ledger).
//
// Substrate (asserted, stops otherwise): VETREENGAGE=1 PARTYSIZE4=1
// FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 SPEARGATE=1 BOWOPEN=1 — the
// aidammo pilot ground, so numbers compare.
//
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 SPEARGATE=1 BOWOPEN=1 MODE=diag OUTDIR=perseed-craftgate-a SEEDS=110801,...,110808 RUN=craftgate-a node scripts/craftgate-driver-a.js
// Determinism re-run: same SEEDS (one seed) + RUN=craftgate-a-rerun into
// a second OUTDIR, then compare the craftgate hash (analyzer).
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'craftgate-instrument-a'));
const { writeFileFlapSafe } = require(path.join(REPO, 'scripts', 'muster-b-write'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'craftgate-a';
const MODE = process.env.MODE || 'diag';
const OUTDIR = process.env.OUTDIR || ('perseed-craftgate-a');

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12); } catch (e) {}
let GAME_SHA = 'unknown', BOWOPEN_PRESENT = false, SPEARGATE_PRESENT = false;
try {
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  GAME_SHA = crypto.createHash('sha256').update(gameSrc).digest('hex').slice(0, 12);
  BOWOPEN_PRESENT = /BOWOPEN/.test(gameSrc) && /villagerStageBow/.test(gameSrc);
  SPEARGATE_PRESENT = /SPEARGATE/.test(gameSrc) && /villagerStageBow/.test(gameSrc) && /volleyWeaponOf/.test(gameSrc);
} catch (e) {}
let WIRING_SHA = 'unknown', SENSE_PRESENT = false;
try {
  const wiringSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'party-wiring.js'), 'utf8');
  WIRING_SHA = crypto.createHash('sha256').update(wiringSrc).digest('hex').slice(0, 12);
  SENSE_PRESENT = /SENSEEXPED/.test(wiringSrc) && /exped/.test(wiringSrc) && /villagerFightAllies/.test(wiringSrc);
} catch (e) {}
let VILLAGER_BUILD_SHA = 'unknown', GATE_PRESENT = false;
try {
  const vbSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-build.js'), 'utf8');
  VILLAGER_BUILD_SHA = crypto.createHash('sha256').update(vbSrc).digest('hex').slice(0, 12);
  GATE_PRESENT = /villagerAmmoCraftDay/.test(vbSrc) && /arrowCraftCd/.test(vbSrc);
} catch (e) {}
const SENSEEXPED_ON = process.env.SENSEEXPED === '1';
const BOWOPEN_ON = process.env.BOWOPEN === '1';
const SPEARGATE_ON = process.env.SPEARGATE === '1';
const FIGHTALLY2_ON = process.env.FIGHTALLY2 === '1';

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function summarizeProv(ledger) {
  const out = {};
  try {
    const AID = require(path.join(REPO, 'scripts', 'aidammo-driver-a.js'));
    for (const vid of Object.keys(ledger.prov)) {
      out[vid] = {};
      for (const ammoId of Object.keys(ledger.prov[vid])) {
        out[vid][ammoId] = { carried: AID.provShares(ledger, vid, ammoId, 'carried'), stashed: AID.provShares(ledger, vid, ammoId, 'stashed') };
      }
    }
  } catch (e) {}
  return out;
}

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'craftgate-' + MODE, fullTelemetry: false });
  const errors = [];
  await setupGame(Game);
  const inst = INST.install(Game);
  let lastCtx = null;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      lastCtx = ctx;
      try { return policy.daily(Gm, ctx); } finally {
        try { inst.daily(Game, gday(Game)); } catch (e) { errors.push('craftgate-daily: ' + String(e.message).slice(0, 80)); }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

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
  const led = inst.ammoLedger;
  const out = {
    seed: seed, arm: 'craftgate-a', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, gameSha: GAME_SHA, wiringSha: WIRING_SHA,
    villagerBuildSha: VILLAGER_BUILD_SHA, gatePresent: GATE_PRESENT,
    bowopenPresent: BOWOPEN_PRESENT, speargatePresent: SPEARGATE_PRESENT,
    sensePresent: SENSE_PRESENT, speargateOn: SPEARGATE_ON,
    senseexpedOn: SENSEEXPED_ON, fightally2On: FIGHTALLY2_ON, bowopenOn: BOWOPEN_ON,
    policySha: POLICY_SHA, policy: 'competent',
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    ammoLedger: { events: led.events, other: led.other,
      unattributedSpend: led.unattributedSpend, transfers: led.transfers,
      spends: led.spends, counters: led.counters,
      finalProv: summarizeProv(led) },
    ammoCraftLevels: (st.village && st.village.ammoCraft) ? JSON.parse(JSON.stringify(st.village.ammoCraft)) : null,
    dutyCalls: inst.dutyCalls(),
    gateDays: inst.gateDays, attempts: inst.attempts, pileDaily: inst.pileDaily,
    v4encounters: inst.v4encounters,
    instrumentErrors: inst.errors.concat(errors),
    deaths: deaths,
  };
  return out;
}

if (require.main === module) (async function () {
  if (MODE !== 'diag') { console.error('CRAFTGATE STOP: MODE must be diag (single-leg DIAG), got ' + JSON.stringify(MODE)); process.exit(2); }
  if (!SENSE_PRESENT) { console.error('CRAFTGATE STOP: the SENSEEXPED launch-preference sense must be present in src/js/party-wiring.js (substrate).'); process.exit(2); }
  if (!SENSEEXPED_ON) { console.error('CRAFTGATE STOP: SENSEEXPED=1 required (substrate).'); process.exit(2); }
  if (!BOWOPEN_PRESENT) { console.error('CRAFTGATE STOP: the bow-staging mechanism (villagerStageBow) must be present in src/js/game.js.'); process.exit(2); }
  if (!BOWOPEN_ON) { console.error('CRAFTGATE STOP: BOWOPEN=1 required (substrate — same ground as the aidammo pilot).'); process.exit(2); }
  if (!SPEARGATE_PRESENT) { console.error('CRAFTGATE STOP: the spear-gate fix (SPEARGATE + volleyWeaponOf in villagerStageBow) must be present in src/js/game.js (substrate).'); process.exit(2); }
  if (!SPEARGATE_ON) { console.error('CRAFTGATE STOP: SPEARGATE=1 required (fixed gate ground).'); process.exit(2); }
  if (!GATE_PRESENT) { console.error('CRAFTGATE STOP: villagerAmmoCraftDay + arrowCraftCd must be present in src/js/villager-build.js (the gate under study).'); process.exit(2); }
  if (process.env.VETREENGAGE !== '1') { console.error('CRAFTGATE STOP: VETREENGAGE=1 required (substrate).'); process.exit(2); }
  if (process.env.PARTYSIZE4 !== '1') { console.error('CRAFTGATE STOP: PARTYSIZE4=1 required (substrate).'); process.exit(2); }
  if (process.env.FLEEREPAIR2 !== '1') { console.error('CRAFTGATE STOP: FLEEREPAIR2=1 required (substrate).'); process.exit(2); }
  if (process.env.FIGHTALLY2 !== '1') { console.error('CRAFTGATE STOP: FIGHTALLY2=1 required (substrate).'); process.exit(2); }
  if (!SEEDS.length) { console.error('CRAFTGATE STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-27', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'craftgate-a-s' + seed + '.json');
    if (fs.existsSync(file)) { console.error('CRAFTGATE STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  let lostSeeds = [];
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'craftgate-a-s' + seed + '.json');
    try {
      writeFileFlapSafe(file, JSON.stringify(out, null, 2) + '\n');
    } catch (e) {
      lostSeeds.push(seed);
      console.error('CRAFTGATE STOP: could not write ' + path.relative(REPO, file) + ' (write flap?) — seed ' + seed + ' NOT saved; re-run this seed after the flap clears.');
    }
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      gameSha: out.gameSha, villagerBuildSha: out.villagerBuildSha, gatePresent: out.gatePresent,
      bowopenPresent: out.bowopenPresent, speargatePresent: out.speargatePresent,
      speargateOn: out.speargateOn, senseexpedOn: out.senseexpedOn,
      fightally2On: out.fightally2On, bowopenOn: out.bowopenOn,
      policySha: out.policySha,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      deaths: out.deaths.length,
      dutyCalls: out.dutyCalls,
      gateDays: out.gateDays.length, attempts: out.attempts.length,
      pileDaily: out.pileDaily.length, v4encounters: out.v4encounters.length,
      ledgerEvents: out.ammoLedger ? out.ammoLedger.events.length : null,
      ledgerOther: out.ammoLedger ? out.ammoLedger.other.length : null,
      ledgerUnattributed: out.ammoLedger ? out.ammoLedger.unattributedSpend.length : null,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
  if (lostSeeds.length) {
    console.error('CRAFTGATE STOP: ' + lostSeeds.length + ' seed(s) NOT saved (' + lostSeeds.join(',') + ') — re-run them after the flap clears. Exit 4.');
    process.exitCode = 4;
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
