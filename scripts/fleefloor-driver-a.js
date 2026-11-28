// fleefloor-driver-a.js — sweep driver, arm sim-fleefloor-a
// (FLOORFINISH: the "finish the kill" override on the bravery floor.
// When the lead monster is within one round of the party's live damage
// rate, the floor does not fire — the party holds for the killing
// strike(s). Finding #2602; prereg evidence/2026-11-27/sim-fleefloor-a-prereg.md.)
// Lean driver: wraps fieldFight only (every wave-4+ fight, any origin,
// rich rows + full log) and records per-seed wall numbers at end of run.
// Two legs, identical seeds: MODE=ctl (FLOORFINISH unset) vs MODE=arm
// (FLOORFINISH=1). Substrate on BOTH legs: SENSEEXPED=1 PARTYSIZE4=1
// VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1; carriers FIELDCAPDMG /
// RAGEFREE / FREESTRIKE asserted OFF; FLEEGUARD / DOORFLEE2 / HYPOFLOOR /
// SPEARGATE / BOWOPEN OFF. main() asserts the MODE label matches the
// flag (arm <=> FLOORFINISH=1) and stops otherwise — a leg/flag mismatch
// is a loud stop, never a silent mislabel. The corpus files carry
// wiringSha / fieldSha / flag reads so each file self-describes which
// code+flags it ran under. rowSeq is reset at the start of each seed's
// oneRun (partydmg-a §6 lesson: process-position-dependent seq broke
// byte-identical reruns).
// Policy: competent verbatim (scripts/policies/competent.js), 150d
// death-aware. Pilot band 112301-112308 (fresh — see prereg §2).
// Usage:
//   SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 MODE=ctl OUTDIR=perseed-fleefloor-a-ctl SEEDS=112301,112302 RUN=fleefloor-a node scripts/fleefloor-driver-a.js
//   ... MODE=arm FLOORFINISH=1 ... OUTDIR=perseed-fleefloor-a-arm ...
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
const RUN = process.env.RUN || 'fleefloor-a';
const MODE = process.env.MODE || 'ctl';
const OUTDIR = process.env.OUTDIR || ('perseed-fleefloor-a-' + MODE);
const RECORDER_ON = process.env.LAUNCHPARTY_RECORDER !== 'off';

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12); } catch (e) {}
let FIELD_SHA = 'unknown';
let FLOORFINISH_PRESENT = false;
try {
  const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
  FIELD_SHA = crypto.createHash('sha256').update(ffSrc).digest('hex').slice(0, 12);
  FLOORFINISH_PRESENT = /FLOORFINISH/.test(ffSrc) && /floorFinishHold/.test(ffSrc) && /Finish the kill/.test(ffSrc);
} catch (e) {}
const FLOORFINISH_ON = process.env.FLOORFINISH === '1';
const SENSEEXPED_ON = process.env.SENSEEXPED === '1';
const PARTYSIZE4_ON = process.env.PARTYSIZE4 === '1';
const VETREENGAGE_ON = process.env.VETREENGAGE === '1';
const FLEEREPAIR2_ON = process.env.FLEEREPAIR2 === '1';
const FIGHTALLY2_ON = process.env.FIGHTALLY2 === '1';
const FIELDCAPDMG_ON = process.env.FIELDCAPDMG === '1';
const RAGEFREE_ON = process.env.RAGEFREE === '1';
const FREESTRIKE_ON = process.env.FREESTRIKE === '1';
const FLEEGUARD_ON = process.env.FLEEGUARD === '1';
const DOORFLEE2_ON = process.env.DOORFLEE2 === '1';
const HYPOFLOOR_ON = process.env.HYPOFLOOR === '1';
const SPEARGATE_ON = process.env.SPEARGATE === '1';
const BOWOPEN_ON = process.env.BOWOPEN === '1';

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
// Write-flap guard (copied from partydmg-driver-a.js): a refused fresh
// write is retried for up to 10 minutes; a lost seed is re-run after
// the flap clears, never faked from stdout.
process.stdout.on('error', function () {});
process.stderr.on('error', function () {});
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 2400; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return true;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return true;
    } catch (e) {
      sleepMs(250);
    }
  }
  return false;
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// Monotonic row sequence, reset per seed (partydmg-a §6 lesson).
let rowSeq = 0;
function nextSeq() { return ++rowSeq; }

// fightOrigin(stackOverride): the fieldFight caller, read from the call
// stack at the wrap — the gatelever driver's fightOrigin taxonomy
// (`expedition` | `world-tick` | `patrol` | `aid` | `other:<fn>` |
// `unclassified`). Copied from scripts/fleeguard-driver-b.js.
function fightOrigin(stackOverride) {
  try {
    const st = stackOverride != null ? String(stackOverride) : (new Error().stack || '');
    const lines = st.split('\n').slice(1);
    for (const ln of lines) {
      const m = ln.match(/at\s+(?:[A-Za-z_$][\w$]*\.)?([A-Za-z_$][\w$]*)\s+\(([^)]+)\)/) ||
                ln.match(/at\s+([^\s(]+)\s+\(([^)]+)\)/);
      if (!m) continue;
      const fn = m[1] || '';
      const file = m[2] || '';
      if (file.indexOf('fleefloor-driver-a.js') !== -1) continue;
      if (file.indexOf('sim-harness') !== -1) continue;
      if (file.indexOf('src/js/') === -1 && file.indexOf('src\\js\\') === -1) continue;
      if (fn === 'fieldFight') continue;
      if (fn === 'expeditionMonster') return 'expedition';
      if (fn === 'resolveWildMonsterEncounter') return 'world-tick';
      if (fn === 'resolvePatrol') return 'patrol';
      if (fn === 'aidFight') return 'aid';
      return 'other:' + fn;
    }
    return 'unclassified';
  } catch (e) { return 'unclassified'; }
}

// recoverMHpStart(rec, preHp): the spawned monster HP, recovered AFTER
// the fight from the fight record (copied from fleeguard-driver-b.js /
// launchparty recorder). Wave-4/5 monsters are pack-1, so mDealt is
// lead-only and mHpLeft + mDealt is exact.
function recoverMHpStart(rec, preHp) {
  var pre = (typeof preHp === 'number' && isFinite(preHp) && preHp > 0) ? preHp : null;
  if (!rec) return { mHpStart: pre, vKill: false, noContact: false };
  var rounds = rec.rounds | 0;
  var dealt = rec.mDealt | 0;
  var noContact = rec.outcome === 'evade' || rec.outcome === 'alreadyDead' || (rounds === 0 && dealt === 0);
  if (noContact) return { mHpStart: null, vKill: false, noContact: true };
  if (rec.outcome === 'vKill') return { mHpStart: null, vKill: true, noContact: false };
  if (rec.mHpLeft != null && rec.mDealt != null) {
    var v = Math.max(0, rec.mHpLeft) + Math.max(0, rec.mDealt);
    if (v > 0) return { mHpStart: v, vKill: false, noContact: false };
  }
  return { mHpStart: pre, vKill: false, noContact: false };
}

async function oneRun(seed) {
  rowSeq = 0; // reset per seed: reruns are byte-identical.
  const errors = [];
  const { Game } = await loadGame({ seed: seed, mode: 'fleefloor-' + MODE, fullTelemetry: false });
  await setupGame(Game);
  const v4fights = [];
  function waveOf(mdef) { try { return (mdef && mdef.wave) | 0; } catch (e) { return 0; } }
  try {
    const origFF = Game.fieldFight;
    if (RECORDER_ON && typeof origFF === 'function') {
      Game.fieldFight = function (vid, mdef, m, opts) {
        const w = waveOf(mdef);
        const watch = w >= 4 && mdef && mdef.id;
        let origin = null, preHp = null, row = null;
        try { origin = fightOrigin(); } catch (e) { origin = 'unclassified'; }
        try {
          var hpOf = function (o) { if (!o) return null; var v = (o.maxHp != null ? o.maxHp : o.hp); return (typeof v === 'number' && isFinite(v) && v > 0) ? v : null; };
          preHp = hpOf(m) || hpOf(mdef);
        } catch (e) {}
        if (watch) {
          row = { seq: nextSeq(), day: gday(Game), vid: vid, mid: mdef.id, wave: w,
            origin: origin, mHpStart: null, vKill: false,
            alliesN: (opts && opts.allies) | 0,
            allyVids: ((opts && opts.allyVids) || []).slice(0, 3),
            allyFromStart: !!(opts && opts.allyFromStart),
            outcome: null, rounds: null, vTaken: null, mDealt: null, mHpLeft: null,
            calledHelp: null, allyVid: null, ally2Vid: null,
            fleeHpFrac: null, fleeWise: null, fleeLearn: null,
            floorFinishHold: null, fleeguardHold: null, doorHold: null,
            fleeHopeless: null, vTakenP4: null, vHpHypoLeft: null,
            allyDealt: null, ally2Dealt: null, ally3Dealt: null,
            log: [] };
        }
        const rec = origFF.apply(this, arguments);
        try {
          if (watch && row && rec) {
            var recov = recoverMHpStart(rec, preHp);
            row.mHpStart = recov.mHpStart;
            row.vKill = !!recov.vKill;
            row.outcome = rec.outcome || null;
            row.rounds = rec.rounds | 0;
            row.vTaken = rec.vTaken | 0;
            row.mDealt = rec.mDealt | 0;
            try { row.mHpLeft = (typeof rec.mHpLeft === 'number' ? rec.mHpLeft : null); } catch (e) { row.mHpLeft = null; }
            row.calledHelp = !!rec.calledHelp;
            row.allyVid = rec.allyVid || null;
            row.ally2Vid = rec.ally2Vid || null;
            row.fleeHpFrac = (rec.fleeHpFrac != null ? +rec.fleeHpFrac.toFixed(2) : null);
            row.fleeWise = !!rec.fleeWise;
            row.fleeLearn = !!rec.fleeLearn;
            try { row.floorFinishHold = rec.floorFinishHold | 0; } catch (e) { row.floorFinishHold = 0; }
            try { row.fleeguardHold = rec.fleeguardHold | 0; } catch (e) { row.fleeguardHold = 0; }
            try { row.doorHold = rec.doorHold | 0; } catch (e) { row.doorHold = 0; }
            try { row.fleeHopeless = !!rec.fleeHopeless; } catch (e) { row.fleeHopeless = false; }
            try { row.vTakenP4 = (typeof rec.vTakenP4 === 'number' ? rec.vTakenP4 : null); } catch (e) { row.vTakenP4 = null; }
            try { row.vHpHypoLeft = (typeof rec.vHpHypoLeft === 'number' ? rec.vHpHypoLeft : null); } catch (e) { row.vHpHypoLeft = null; }
            try { row.allyDealt = rec.allyDealt | 0; row.ally2Dealt = rec.ally2Dealt | 0; row.ally3Dealt = rec.ally3Dealt | 0; } catch (e) {}
            try { row.log = (rec.log || []).map(function (s) { return String(s).slice(0, 400); }); } catch (e) { row.log = []; }
            v4fights.push(row);
          }
        } catch (e) { errors.push('v4-log: ' + String(e.message).slice(0, 80)); }
        return rec;
      };
    } else if (RECORDER_ON) errors.push('fieldFight-wrap: not a function');
  } catch (e) { errors.push('fieldFight-wrap-install: ' + String(e.message).slice(0, 80)); }

  let result = null;
  await quietLog(async function () { result = await runDays(Game, competent, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  const out = {
    seed: seed, arm: 'fleefloor-a', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, fieldSha: FIELD_SHA, floorFinishPresent: FLOORFINISH_PRESENT,
    floorFinishOn: FLOORFINISH_ON,
    senseexpedOn: SENSEEXPED_ON, partysize4On: PARTYSIZE4_ON, vetreengageOn: VETREENGAGE_ON,
    fleerepair2On: FLEEREPAIR2_ON, fightally2On: FIGHTALLY2_ON,
    fieldcapdmgOn: FIELDCAPDMG_ON, ragefreeOn: RAGEFREE_ON, freestrikeOn: FREESTRIKE_ON,
    fleeguardOn: FLEEGUARD_ON, doorflee2On: DOORFLEE2_ON, hypofloorOn: HYPOFLOOR_ON,
    speargateOn: SPEARGATE_ON, bowopenOn: BOWOPEN_ON,
    recorderOn: RECORDER_ON,
    policySha: POLICY_SHA, policy: 'competent',
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    instrumentErrors: errors,
    deaths: deaths,
    v4fights: v4fights,
  };
  return out;
}

async function main() {
  if (!FLOORFINISH_PRESENT) { console.error('FLOORFINISH STOP: the FLOORFINISH override must be present in src/js/fieldFights.js (lever code).'); process.exit(2); }
  if (MODE === 'arm' && !FLOORFINISH_ON) { console.error('FLOORFINISH STOP: MODE=arm requires FLOORFINISH=1.'); process.exit(2); }
  if (MODE === 'ctl' && FLOORFINISH_ON) { console.error('FLOORFINISH STOP: MODE=ctl requires FLOORFINISH unset.'); process.exit(2); }
  if (!SENSEEXPED_ON || !PARTYSIZE4_ON || !VETREENGAGE_ON || !FLEEREPAIR2_ON || !FIGHTALLY2_ON) {
    console.error('FLOORFINISH STOP: substrate flags SENSEEXPED/PARTYSIZE4/VETREENGAGE/FLEEREPAIR2/FIGHTALLY2 must all be 1.'); process.exit(2);
  }
  if (FIELDCAPDMG_ON || RAGEFREE_ON || FREESTRIKE_ON || FLEEGUARD_ON || DOORFLEE2_ON || HYPOFLOOR_ON || SPEARGATE_ON || BOWOPEN_ON) {
    console.error('FLOORFINISH STOP: carriers FIELDCAPDMG/RAGEFREE/FREESTRIKE and levers FLEEGUARD/DOORFLEE2/HYPOFLOOR/SPEARGATE/BOWOPEN must all be OFF.'); process.exit(2);
  }
  if (!SEEDS.length) { console.error('FLOORFINISH STOP: SEEDS is empty.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-27', OUTDIR);
  try { fs.mkdirSync(outDir, { recursive: true }); } catch (e) {}
  let failed = 0;
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'fleefloor-a-s' + seed + '-fleefloor-a-' + MODE + '.json');
    const data = JSON.stringify(out, null, 2);
    const ok = writeRobust(file, data);
    console.log('seed ' + seed + ' ' + MODE + ' days=' + out.days + ' end=' + out.endReason +
      ' standing=' + out.standing + ' rank=' + out.scaleRank + ' maxWave=' + out.maxWave +
      ' v4fights=' + out.v4fights.length + ' errors=' + out.instrumentErrors.length +
      ' write=' + (ok ? 'ok' : 'FAILED'));
    if (!ok) failed++;
  }
  if (failed) { console.error('FLOORFINISH STOP: ' + failed + ' seed file(s) failed to write (flap?). Re-run after it clears.'); process.exit(3); }
}

if (require.main === module) {
  main().catch(function (e) { console.error('FLOORFINISH FATAL: ' + (e && e.stack || e)); process.exit(1); });
}

module.exports = { oneRun: oneRun, fightOrigin: fightOrigin, recoverMHpStart: recoverMHpStart };
