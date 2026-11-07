// vetkilltale-driver-20261107.js — veteran-kill fireside tale pilot driver
// (arm sim-vetkilltale-a, run fleshout-20261107T0515Z). Competent policy
// verbatim, unmodified — TWO legs on identical seeds (baseline with
// VETKILLTALE_OFF=1, armed with the lever on). Death-aware horizon
// (runDays ends on village death / win). Seeds run sequentially in one
// process via the shared harness (loadGame per seed).
// Per-seed JSON goes to evidence/2026-11-07/perseed-vetkilltale-a/
// (sims write once, on purpose), or $OUTDIR when set. Refuses to
// overwrite. The instrument is self-contained: it wraps queueKillerTale
// / queueVetKillerTale (queue events with reported-at-queue), Game.tele
// (killer_tale / vet_killer_tale events), and Game.say (tale lines) —
// no grind instrument, no shared state.
// Usage:
//   DAYS=150 SEEDS=99641..99648 RUN=vetkilltale-baseline VETKILLTALE_OFF=1 node scripts/vetkilltale-driver-20261107.js
//   DAYS=150 SEEDS=99641..99648 RUN=vetkilltale-armed node scripts/vetkilltale-driver-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

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
const RUN = process.env.RUN || 'vetkilltale-baseline';
if (!SEEDS.length) { console.error('VETKILLTALE STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-07', 'perseed-vetkilltale-a');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'vetkilltale-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('VETKILLTALE STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'vetkilltale-baseline', fullTelemetry: false });
  const queueEvents = [];   // {kind:'first'|'vet', day, mid, killer, wave, reportedAtQueue}
  const teleEvents = [];    // {kind, day, id, killer}
  const taleLines = [];     // {kind:'first'|'vet', day, line}
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (/put another one down today/.test(arg) && taleLines.length < 100) {
            taleLines.push({ kind: 'vet', day: gday(Game), line: String(arg).slice(0, 1200) });
          } else if (/I put it down today/.test(arg) && taleLines.length < 100) {
            taleLines.push({ kind: 'first', day: gday(Game), line: String(arg).slice(0, 1200) });
          }
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origTele = Game.tele;
    if (typeof origTele === 'function') {
      Game.tele = function (kind, arg) {
        try {
          if (kind === 'killer_tale' || kind === 'vet_killer_tale') {
            teleEvents.push({ kind: kind, day: gday(Game), id: arg && arg.id, killer: arg && arg.killer });
          }
        } catch (e) { errors.push('tele-wrap: ' + String(e.message).slice(0, 80)); }
        return origTele.apply(this, arguments);
      };
    }
  } catch (e) { errors.push('tele-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origQ = Game.queueKillerTale;
    if (typeof origQ === 'function') {
      Game.queueKillerTale = function (mid, vid) {
        try {
          const e = ((Game.state.codex || {}).monsters || {})[mid] || {};
          const mdef = (Game.data.monsters || []).find(m => m.id === mid) || {};
          const before = (Game.state.killerTales || []).length;
          const r = origQ.apply(this, arguments);
          const after = (Game.state.killerTales || []).length;
          // record only an actual queue (the call returns silently for
          // reported types — routed to the vet queue — and for dupes)
          if (after > before) {
            queueEvents.push({ kind: 'first', day: gday(Game), mid: mid, killer: vid,
              wave: mdef.wave || 1, reportedAtQueue: !!(e.reported || e.namingKicked || e.villageName) });
          }
          return r;
        } catch (e2) { errors.push('queue-wrap: ' + String(e2.message).slice(0, 80)); return origQ.apply(this, arguments); }
      };
    }
    const origVQ = Game.queueVetKillerTale;
    if (typeof origVQ === 'function') {
      Game.queueVetKillerTale = function (mid, vid) {
        try {
          const e = ((Game.state.codex || {}).monsters || {})[mid] || {};
          const mdef = (Game.data.monsters || []).find(m => m.id === mid) || {};
          const before = (Game.state.vetKillerTales || []).length;
          const r = origVQ.apply(this, arguments);
          const after = (Game.state.vetKillerTales || []).length;
          // record only an actual queue (switch-off, wave gate, and dupe
          // all return without queueing)
          if (after > before) {
            queueEvents.push({ kind: 'vet', day: gday(Game), mid: mid, killer: vid,
              wave: mdef.wave || 1, reportedAtQueue: !!(e.reported || e.namingKicked || e.villageName) });
          }
          return r;
        } catch (e2) { errors.push('queue-vet-wrap: ' + String(e2.message).slice(0, 80)); return origVQ.apply(this, arguments); }
      };
    }
  } catch (e) { errors.push('queue-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let result = null;
  await quietLog(async function () { result = await runDays(Game, competent, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });

  const st = Game.state || {};
  let scaleRank = null, standing = null, unlockedWave = null;
  try { scaleRank = typeof Game.scaleRank === 'function' ? Game.scaleRank() : null; } catch (e) {}
  try { standing = typeof Game.villageStandingTotal === 'function' ? Game.villageStandingTotal() : null; } catch (e) {}
  try { unlockedWave = typeof Game.unlockedWave === 'function' ? Game.unlockedWave() : null; } catch (e) {}
  const reportedMap = {};
  try {
    const cm = (st.codex || {}).monsters || {};
    for (const mid of Object.keys(cm)) {
      reportedMap[mid] = { reported: !!cm[mid].reported, villageName: cm[mid].villageName || null };
    }
  } catch (e) {}
  const out = {
    seed: seed, arm: 'vetkilltale', run: RUN, policy: 'competent', anchorCommit: ANCHOR,
    vetSwitchOff: process.env.VETKILLTALE_OFF === '1',
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank, maxWave: result.maxWaveUnlocked || 1,
    unlockedWave: unlockedWave, standing: standing,
    queueEvents: queueEvents, teleEvents: teleEvents, taleLines: taleLines, sayCount: sayCount,
    waveKillLog: ((st.waveKillLog) || []).slice(),
    killerTaleLog: ((st.killerTaleLog) || []).slice(),
    vetKillerTaleLog: ((st.vetKillerTaleLog) || []).slice(),
    fallen: (((st.village || {}).fallen) || []).slice(),
    reportedMap: reportedMap,
    instrumentErrors: errors,
  };
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'vetkilltale-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, run: out.run, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      vetQueued: out.queueEvents.filter(function (e2) { return e2.kind === 'vet'; }).length,
      vetTold: (out.vetKillerTaleLog || []).length,
      firstTold: (out.killerTaleLog || []).length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
