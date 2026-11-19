// rageholder-driver-b.js — SURVEY driver, arm sim-rageholder-survey-b.
// Screens fresh 8-seed bands for Rage-holder rate: per wave-4+
// encounter it records whether the fighter holds Rage
// (rec.holdsRage) and whether Rage fired (rec.rageFired), with the
// full (uncapped) fight log — the same recorder as the
// laterage-driver-b.js fieldFight wrap (SEEDLAND semantics, wave
// >= 4), reused verbatim apart from arm/mode/output naming, so the
// laterage re-run's pool is measured on the identical instrument.
//
// DIAG survey: instrument-only, ZERO src/js game-code changes.
// Substrate (frozen in the prereg): current master, competent
// verbatim, 150d death-aware, SENSEEXPED=1 PARTYSIZE4=1
// VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 — the laterage-b
// substrate exactly, no ALLYSLOT3 port (finding #2616: a survey
// designation only transfers under the re-run's full substrate).
// The RAGEFREE/FIELDCAPDMG carrier is NOT used and the FREESTRIKE
// ordering is NOT ported — real Rage (godpath.js fieldAct) on
// master substrate.
// Usage:
//   SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 MODE=rageholder OUTDIR=perseed-rageholder-survey-b-106121-106128 SEEDS=106121,... RUN=rageholder-survey-b node scripts/rageholder-driver-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'rageholder-survey-b';
const MODE = process.env.MODE || 'rageholder';
const OUTDIR = process.env.OUTDIR || 'perseed-rageholder-survey-b';

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12); } catch (e) {}

// Substrate presence (frozen): SENSEEXPED sense code, FIGHTALLY2
// ally-2 join, and the real-Rage mechanism (fieldAct rage branch
// + fieldStrike nextN consumption). A missing piece is a loud stop,
// never a silent re-scope to a different substrate.
let SENSE_PRESENT = false, FIGHTALLY2_PRESENT = false, RAGE_PRESENT = false;
try {
  SENSE_PRESENT = fs.readFileSync(path.join(REPO, 'src', 'js', 'party-wiring.js'), 'utf8').indexOf('SENSEEXPED') !== -1;
  const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
  FIGHTALLY2_PRESENT = ffSrc.indexOf('FIGHTALLY2') !== -1;
  const gpSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'godpath.js'), 'utf8');
  RAGE_PRESENT = gpSrc.indexOf("h.rage && !u('rage')") !== -1 &&
    gpSrc.indexOf('Next 3 strikes hit twice as hard. (Rage)') !== -1 &&
    gpSrc.indexOf('if (G.nextN > 0) { m *= G.nextMult; G.nextN--; }') !== -1;
} catch (e) {}

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
// writeRobust: flap-hardened write (write-flap lesson: a refused
// write must retry, never silently drop). Same pattern as the
// dmgshape driver.
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 480; i++) {
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
      if (i === 479) { process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n'); return; }
      sleepMs(250);
    }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'rageholder-' + MODE, fullTelemetry: false });
  const errors = [];
  await setupGame(Game);

  // ---- WAVE-4+ PER-ENCOUNTER RECORDER (uncapped log) ----
  const v4encounters = [];
  function waveOf(mdef) { try { return (mdef && mdef.wave) | 0; } catch (e) { return 0; } }
  try {
    const origFF = Game.fieldFight;
    if (typeof origFF === 'function') {
      Game.fieldFight = function (vid, mdef, m, opts) {
        const w = waveOf(mdef);
        const watch = w >= 4 && mdef && mdef.id;
        let row = null;
        if (watch) {
          row = { day: gday(Game), vid: vid, mid: mdef.id, wave: w,
            alliesN: (opts && opts.allies) | 0,
            outcome: null, rounds: null, vTaken: null, mDealt: null,
            holdsRage: null, rageFired: false,
            log: [], roundsDetail: null, actionKinds: null, strikesThrown: null };
        }
        let rec = null;
        try { rec = origFF.apply(this, arguments); }
        finally { /* row closed below */ }
        try {
          if (watch && row && rec) {
            row.outcome = rec.outcome || null;
            row.rounds = rec.rounds | 0;
            row.vTaken = rec.vTaken | 0;
            row.mDealt = rec.mDealt | 0;
            row.holdsRage = !!rec.holdsRage;
            row.rageFired = !!rec.rageFired;
            try { row.log = (rec.log || []).slice(0, 500).map(function (s) { return String(s).slice(0, 400); }); } catch (e) { row.log = []; }
            row.roundsDetail = rec.roundsDetail || null;
            row.actionKinds = rec.actionKinds || null;
            row.strikesThrown = (typeof rec.strikesThrown === 'number' ? rec.strikesThrown : null);
            v4encounters.push(row);
          }
        } catch (e) { errors.push('v4enc-log: ' + String(e.message).slice(0, 80)); }
        return rec;
      };
    } else errors.push('fieldFight-wrap: not a function');
  } catch (e) { errors.push('fieldFight-wrap-install: ' + String(e.message).slice(0, 80)); }

  let result = null;
  await quietLog(async function () { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  return {
    seed: seed, arm: 'rageholder-survey-b', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR,
    senseexpedPresent: SENSE_PRESENT, fightally2Present: FIGHTALLY2_PRESENT, ragePresent: RAGE_PRESENT,
    senseexpedFlag: process.env.SENSEEXPED || null, partysize4Flag: process.env.PARTYSIZE4 || null,
    vetreengageFlag: process.env.VETREENGAGE || null, fleerepair2Flag: process.env.FLEEREPAIR2 || null,
    fightally2Flag: process.env.FIGHTALLY2 || null,
    policySha: POLICY_SHA, policy: 'competent',
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    instrumentErrors: errors,
    deaths: deaths,
    samples: result.samples || null,
    v4encounters: v4encounters,
  };
}

if (require.main === module) (async function () {
  if (MODE !== 'rageholder') { console.error('RAGEHOLDER STOP: MODE must be rageholder, got ' + JSON.stringify(MODE)); process.exit(2); }
  if (!SENSE_PRESENT) { console.error('RAGEHOLDER STOP: the SENSEEXPED sense code (party-wiring.js) must be present.'); process.exit(2); }
  if (!FIGHTALLY2_PRESENT) { console.error('RAGEHOLDER STOP: the FIGHTALLY2 code (fieldFights.js) must be present.'); process.exit(2); }
  if (!RAGE_PRESENT) { console.error('RAGEHOLDER STOP: the real-Rage mechanism (godpath.js fieldAct rage branch + fieldStrike nextN) must be present.'); process.exit(2); }
  if (process.env.SENSEEXPED !== '1') { console.error('RAGEHOLDER STOP: SENSEEXPED=1 required (substrate).'); process.exit(2); }
  if (process.env.PARTYSIZE4 !== '1') { console.error('RAGEHOLDER STOP: PARTYSIZE4=1 required (substrate).'); process.exit(2); }
  if (process.env.VETREENGAGE !== '1') { console.error('RAGEHOLDER STOP: VETREENGAGE=1 required (substrate).'); process.exit(2); }
  if (process.env.FLEEREPAIR2 !== '1') { console.error('RAGEHOLDER STOP: FLEEREPAIR2=1 required (substrate).'); process.exit(2); }
  if (process.env.FIGHTALLY2 !== '1') { console.error('RAGEHOLDER STOP: FIGHTALLY2=1 required (substrate).'); process.exit(2); }
  if (!SEEDS.length) { console.error('RAGEHOLDER STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-19', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'rageholder-survey-b-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('RAGEHOLDER STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'rageholder-survey-b-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      senseexpedPresent: out.senseexpedPresent, fightally2Present: out.fightally2Present, ragePresent: out.ragePresent,
      policySha: out.policySha,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      deaths: out.deaths.length,
      v4encounters: out.v4encounters.length,
      rageFiredRows: out.v4encounters.filter(function (e) { return e.rageFired; }).length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
