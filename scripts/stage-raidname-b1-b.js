#!/usr/bin/env node
// stage-raidname-b1-b.js — staged-B1 leg driver
// (sim-raidname-b1-b; prereg:
// evidence/2026-10-29/sim-raidname-b1-b-prereg.md, committed
// BEFORE any judged run).
//
// MEASUREMENT ONLY: zero src/js changes, zero policy changes.
// Runs insideevening 30-loop-day sims. AFTER each original
// upkeep returns, checks the B1 precondition (player-tile
// world monster is raidBorn, no live fight, no pending,
// raid shadow NULL) and — ON leg only, once per seed —
// injects exactly one wanderer-style pending for that
// species (pendingEncounter + pendingMonsterId, shadow
// already null), which the harness pending block then
// resolves via startCombat(mid) exactly like a natural
// wanderer pending. The lingerer itself is never created,
// moved, or edited: it must have arisen naturally from a
// real raid in the live trajectory. OFF leg (STAGE_B1=0)
// counts the same opportunity windows with no injection.
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY=insideevening
//   STAGE_B1=1 (on) or 0 (off, default 0)
//   SEEDS="10710,...,10717" (pilot default)
//   DAYS=30
//   OUTDIR (default evidence/2026-10-29/sim-raidname-b1-b-corpus-on
//     when STAGE_B1=1, ...-corpus-off when 0)
// Write transport: failed writes are kept in memory and
// flushed at the end; a still-pending file at the end exits
// loudly (no /tmp staging — staging dir inside this
// worktree, removed on success by the caller via git status).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { insideevening } = require('./policies/insideevening');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (process.env.POLICY !== 'insideevening') { console.error('FATAL: POLICY must be insideevening (policy-leg driver only)'); process.exit(2); }

const STAGE_ON = process.env.STAGE_B1 === '1';
const SEEDS = (process.env.SEEDS || '10710,10711,10712,10713,10714,10715,10716,10717')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-29',
  STAGE_ON ? 'sim-raidname-b1-b-corpus-on' : 'sim-raidname-b1-b-corpus-off');
const STAGING_DIR = path.join(__dirname, '..', '.stage-b1-staging');

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function tryWrite(filePath, data, attempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data);
      const back = fs.readFileSync(filePath, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      return true;
    } catch (e) {
      if (i === attempts - 1) return false;
      realSleepMs(2000);
    }
  }
  return false;
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'morningpersist-b', fullTelemetry: false });
  const sayLines = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 80000) sayLines.push(String(args[0] || '').slice(0, 400)); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);

  let upkeepCalls = 0;
  let stagedThisSeed = false;
  let pendingStaged = null; // staged event awaiting its startCombat
  const stagedEvents = [];
  const windows = []; // opportunity windows (post-upkeep checks)
  const fights = []; // creations + ended-inside attempts, in call order
  let stagedFightIdx = -1; // index into fights of the staged fight
  let stagedSayFull = null;
  let stagedSayStartIdx = -1;

  function tileMonster() {
    try {
      const mp = Game.map || {};
      const wms = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
      const o = (wms || []).find((m) => m && m.tx === mp.px && m.ty === mp.py) || null;
      if (!o) return null;
      return {
        id: o.id || null, raidBorn: !!o.raidBorn, lingering: !!o.lingering,
        hp: (o.hp === undefined ? null : o.hp), tx: (o.tx === undefined ? null : o.tx),
        ty: (o.ty === undefined ? null : o.ty),
      };
    } catch (e) { return null; }
  }
  function snapFighters() {
    try {
      const f = Game.tbfight;
      if (!f || !Array.isArray(f.fighters)) return null;
      return f.fighters.map((ft) => ({
        key: ft.key || null, kind: ft.kind || null,
        monsterId: ft.monsterId || null, name: ft.name || null,
        hp: (ft.hp === undefined ? null : ft.hp), maxHp: (ft.maxHp === undefined ? null : ft.maxHp),
        alive: !!ft.alive, fled: !!ft.fled,
      }));
    } catch (e) { return null; }
  }
  function tileType() {
    try { const t = Game.playerTile(); return t ? (t.type || null) : null; } catch (e) { return null; }
  }

  // startCombat wrapper (read-only around the original call).
  try {
    const origStartCombat = Game.startCombat;
    if (typeof origStartCombat === 'function') {
      Game.startCombat = function (...args) {
        const hadLive = !!(Game.tbfight && !Game.tbfight.over);
        const sayBeforeIdx = sayLines.length;
        let shadowAtEntry = null, originAtEntry = null;
        try { shadowAtEntry = Game.raidPendingMonsterId || null; } catch (e) {}
        originAtEntry = tileMonster();
        const argMonsterId = (args[0] === null || args[0] === undefined) ? null : String(args[0]).slice(0, 80);
        let ret = null, err = null;
        try { ret = origStartCombat.apply(this, args); } catch (e) { err = String(e && e.message).slice(0, 160); }
        const liveNow = !!(Game.tbfight && !Game.tbfight.over);
        const kind = (!hadLive && liveNow) ? 'creation' : 'attempt';
        const fightersNow = snapFighters();
        const monsNow = fightersNow ? [...new Set(fightersNow.filter((x) => x.monsterId).map((x) => x.monsterId))] : [];
        const fightSpecies = monsNow.length ? monsNow[0] : (hadLive ? null : argMonsterId);
        const sayTail = sayLines.slice(sayBeforeIdx).map((x) => x).slice(-12);
        const rec = {
          seq: fights.length, loopDay: Math.floor((upkeepCalls - 1) / 3) + 1,
          kind, argMonsterId, fightSpecies, hadLive, liveNow, err,
          shadowAtEntry, originAtEntry,
          fighters: fightersNow, fightOver: Game.tbfight ? !!Game.tbfight.over : null,
          sayTail,
          raidLineFired: sayTail.some((l) => l.includes('This one came with the raid on Haven')),
          pendingMatch: !!(shadowAtEntry && fightSpecies && shadowAtEntry === fightSpecies),
          entityMatchCandidate: !!(originAtEntry && originAtEntry.raidBorn && fightSpecies && originAtEntry.id === fightSpecies),
        };
        // Staged-event linkage: the first startCombat after the
        // staged event decides it. Same species arg = the staged
        // fight; anything else = the pending died with another
        // fight (staging miss).
        if (pendingStaged) {
          if (argMonsterId === pendingStaged.species) {
            pendingStaged.status = 'linked';
            pendingStaged.fightSeq = rec.seq;
            pendingStaged.fightKind = kind;
            stagedFightIdx = rec.seq;
            stagedSayStartIdx = sayBeforeIdx;
            if (kind === 'attempt') {
              // Ended inside startCombat: full tail is already said.
              stagedSayFull = sayLines.slice(sayBeforeIdx).map((x) => x);
            }
          } else {
            pendingStaged.status = 'miss';
            pendingStaged.missReason = 'other-fight-first';
            pendingStaged.firstFightArg = argMonsterId;
          }
          pendingStaged = null;
        }
        fights.push(rec);
        if (err) throw new Error(err);
        return ret;
      };
    }
  } catch (e) {}

  const policy = Object.assign({}, insideevening, {
    upkeep(Game2, ctx) {
      insideevening.upkeep(Game2, ctx);
      upkeepCalls++;
      const loopDay = Math.floor((upkeepCalls - 1) / 3) + 1;
      // Post-upkeep B1 check (read-only unless staging fires).
      try {
        if (Game2.over) return;
        if (Game2.tbfight && !Game2.tbfight.over) return;
        if (Game2.pendingEncounter) return;
        const tm = tileMonster();
        if (!tm || !tm.raidBorn || !(tm.hp > 0)) return;
        const shadow = Game2.raidPendingMonsterId || null;
        const win = {
          loopDay, upkeepCalls, gameDay: (Game2.state.scholar || {}).day || 0,
          species: tm.id, tile: tileType(),
          inside: ((Game2.state.scholar || {}).insideHaven === undefined ? null : !!(Game2.state.scholar || {}).insideHaven),
          shadowBefore: shadow, origin: tm,
        };
        if (!STAGE_ON) { win.decision = 'off-counted'; windows.push(win); return; }
        if (stagedThisSeed) { win.decision = 'skipped-already-staged'; windows.push(win); return; }
        if (shadow !== null) { win.decision = 'skipped-shadow'; windows.push(win); return; }
        // Inject exactly one wanderer-style pending.
        Game2.pendingEncounter = true;
        Game2.pendingMonsterId = tm.id;
        Game2.pendingInTent = false;
        Game2.raidPendingMonsterId = null; // already null; wanderer path's own clear
        stagedThisSeed = true;
        const ev = Object.assign({}, win, { decision: 'staged', status: 'pending-link', injectedSpecies: tm.id });
        stagedEvents.push(ev);
        pendingStaged = ev;
        windows.push(win);
      } catch (e) { /* check failure must never perturb the sim */ }
    },
    fight(Game2, ctx) {
      let r = false;
      try { r = insideevening.fight(Game2, ctx); } catch (e) { throw e; }
      // Capture the staged fight's full say tail at fight end.
      try {
        if (stagedFightIdx >= 0 && stagedSayFull === null && stagedSayStartIdx >= 0) {
          const f = Game2.tbfight;
          if (!f || f.over) {
            stagedSayFull = sayLines.slice(stagedSayStartIdx).map((x) => x);
          }
        }
      } catch (e) {}
      return r;
    },
    daily(Game2, ctx) {
      insideevening.daily(Game2, ctx);
    },
  });

  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  // A staged event never resolved by run end is a miss.
  if (pendingStaged) {
    pendingStaged.status = 'miss';
    pendingStaged.missReason = 'never-resolved';
    pendingStaged = null;
  }
  let scaleLast = null, standingLast = null;
  try {
    const sc = (result.samples && result.samples.scale) || [];
    if (sc.length) scaleLast = sc[sc.length - 1][1];
    const st = (result.samples && result.samples.standing) || [];
    if (st.length) standingLast = st[st.length - 1][1];
  } catch (e) {}
  return {
    seed, policy: 'insideevening', stageOn: STAGE_ON,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    scaleLast, standingLast,
    won: !!(result.stop && result.stop.won), villageLost: !!Game.villageLost,
    stagedEvents, windows, fights, stagedFightIdx,
    stagedSayFull,
    stagedFight: stagedFightIdx >= 0 ? fights[stagedFightIdx] : null,
  };
}

(async () => {
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    done++;
    const name = `stage-b1-b-insideevening-s${seed}.json`;
    const summary = `stage-b1 policy=insideevening stage=${STAGE_ON ? 1 : 0} seed=${seed} end=${inst.endReason} days=${inst.daysAlive} fights=${inst.fights.length} windows=${inst.windows.length} staged=${inst.stagedEvents.length}`;
    const data = JSON.stringify(inst);
    if (tryWrite(path.join(OUTDIR, name), data, 6)) console.log(summary + ' written');
    else { pending.push({ name, data }); console.error(summary + ' WRITE PENDING (EPERM flap) — kept in memory'); }
  }
  if (pending.length) {
    const deadline = Date.now() + 45 * 60 * 1000;
    while (pending.length && Date.now() < deadline) {
      for (let i = pending.length - 1; i >= 0; i--) {
        if (tryWrite(path.join(OUTDIR, pending[i].name), pending[i].data, 5)) {
          console.log('flushed pending ' + pending[i].name);
          pending.splice(i, 1);
        }
      }
      if (pending.length && Date.now() < deadline) realSleepMs(30000);
    }
  }
  if (pending.length) {
    for (const p of pending) {
      if (tryWrite(path.join(STAGING_DIR, p.name), p.data, 30)) console.error('STAGED (not evidence) ' + p.name);
      else console.error('STAGE FAIL LOUDLY ' + p.name);
    }
    console.error('PENDING STAGED: ' + pending.length + ' files in ' + STAGING_DIR + ' — copy to ' + OUTDIR + ' before judging');
    process.exit(3);
  }
  console.log('wrote ' + done + ' stage-b1 files to ' + OUTDIR);
})().catch((e) => { console.error('STAGE-B1 CRASH', e && (e.stack || e)); process.exit(2); });
