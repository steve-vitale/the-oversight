// vetguard-driver-b.js — DIAGNOSTIC driver, arm sim-vetguard-b
// (finding #2506 veteran-guard half: the fight-gate rule that guards a
// table-stage veteran never fired anywhere on the fightgate census
// band — no table-stage veteran existed on it. This driver answers
// whether one ever exists in organic play, and whether the guard fires
// when its preconditions hold.)
// Two legs, one recorder:
//   MODE=survey — 8 seeds 104301-104308, 150d, competent verbatim,
//     fightgate substrate. Pure-read recorder: daily table-veteran
//     census, EVERY winPlanFightGate call with wave >= 3 (the guard's
//     floor is 3 — the fightgate driver only recorded wave >= 4), and
//     every winPlanDepart row for a table-stage veteran.
//   MODE=stage — 1 seed (104301). Same recorder, plus deterministic
//     staging: at the first day >= 60 with a living organic wave-4
//     killer, the driver supplies ONLY the two game-state inputs the
//     game itself would produce at standing 200 —
//     state._standingDeferBeat[5] = day and a 'standing'-stage plan
//     seed for that killer — and lets GAME CODE (winPlanHavenTick)
//     advance them to 'table', lets winPlanDepart hold/launch them,
//     and records any natural gate call. If no organic wave-4 killer
//     exists by day 120, ONE kill is granted through the real choke
//     point (Game.recordWaveKill('eater', vid, 'vetguard-stage', null))
//     to a living ranger at Haven; the ledger path is real, only the
//     fight that would have produced the kill is staged. A single
//     end-of-run probe call on the staged veteran's live state is
//     supplementary only (probe:true) and never judges T1.
// No lever, no contrast, no game-code change. Policy: competent
// verbatim (scripts/policies/competent.js), 150d death-aware.
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 MODE=survey OUTDIR=perseed-vetguard-b-survey SEEDS=104301,104302 RUN=vetguard-b node scripts/vetguard-driver-b.js
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
const RUN = process.env.RUN || 'vetguard-b';
const MODE = process.env.MODE || 'survey';
const OUTDIR = process.env.OUTDIR || ('perseed-vetguard-b-' + MODE);
const RECORDER_ON = process.env.VETGUARD_RECORDER !== 'off';
const STAGE_DAY = parseInt(process.env.VETGUARD_STAGE_DAY || '60', 10) || 60;
const GRANT_DAY = parseInt(process.env.VETGUARD_GRANT_DAY || '120', 10) || 120;

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12); } catch (e) {}

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
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
function safe(fn, fallback) { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } }

// gearOfReplica(Game, vid): the win-plan gear read, replicated here as
// pure reads (win-plan.js gearOf is module-internal). Copied from the
// fightgate-scope driver (same replica, same semantics). Used ONLY to
// record gate/party inputs — never to decide anything.
function gearOfReplica(Game, vid) {
  try {
    let person = null;
    try { if (Game.getPerson) person = Game.getPerson(vid); } catch (e) {}
    if (!person) { try { if (Game.vpOf) person = Game.vpOf(vid); } catch (e) {} }
    if (!person) return { armed: false, armored: false, armorP: 0, weaponB: 0 };
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    const eq = S.equipment || null;
    const items = (Game.data && Game.data.items) || [];
    let armorP = 0, weaponB = 0;
    try { armorP = (eq && eq.armorOf) ? (eq.armorOf(person, items) || 0) : 0; } catch (e) {}
    try { weaponB = (eq && eq.weaponBonusOf) ? (eq.weaponBonusOf(person, items) || 0) : 0; } catch (e) {}
    let carriesWeapon = false;
    try {
      for (let i = 0; i < ((person.items || []).length); i++) {
        const ent = person.items[i] || {};
        const iid = ent.itemId || ent.id || ent;
        let def = null;
        for (let j = 0; j < items.length; j++) if (items[j] && items[j].id === iid) { def = items[j]; break; }
        if (def && def.weapon) { carriesWeapon = true; break; }
      }
    } catch (e) {}
    return { armed: !!(weaponB > 0 || carriesWeapon), armored: armorP > 0, armorP: armorP, weaponB: weaponB };
  } catch (e) { return { armed: false, armored: false, armorP: 0, weaponB: 0 }; }
}
function isWave4Killer(Game, vid) {
  try {
    const log = (Game.state && Game.state.waveKillLog) || [];
    for (let i = 0; i < log.length; i++) if (log[i] && log[i].by === vid && ((log[i].w | 0) >= 4)) return true;
  } catch (e) {}
  return false;
}
function isWave3Killer(Game, vid) {
  try {
    const log = (Game.state && Game.state.waveKillLog) || [];
    for (let i = 0; i < log.length; i++) if (log[i] && log[i].by === vid && ((log[i].w | 0) >= 3)) return true;
  } catch (e) {}
  return false;
}
function planOf(Game, vid) { try { const v = (Game.state || {}).village || {}; return (v.winPlan || {})[vid] || null; } catch (e) { return null; } }
function needWaveOf(Game) {
  try {
    const beat = (Game.state || {})._standingDeferBeat || {};
    if (beat[5] != null && Game.waveUnlockReady) { const r5 = Game.waveUnlockReady(5); if (r5 && (r5.short || []).indexOf('veterans') !== -1) return 4; }
    if (beat[4] != null && Game.waveUnlockReady) { const r4 = Game.waveUnlockReady(4); if (r4 && (r4.short || []).indexOf('veterans') !== -1) return 3; }
  } catch (e) {}
  return null;
}
function havenTile(Game) {
  try { const v = (Game.state || {}).village || {}; return { nx: (v.px != null ? v.px : 4), ny: (v.py != null ? v.py : 4) }; } catch (e) { return { nx: 4, ny: 4 }; }
}
function atHaven(Game, vid) {
  try {
    const h = havenTile(Game);
    const n = Game.npcNode ? Game.npcNode(vid) : null;
    return !!(n && n.nx === h.nx && n.ny === h.ny);
  } catch (e) { return false; }
}
function alive(Game, vid) {
  try { const p = Game.getPerson ? Game.getPerson(vid) : null; return !!(p && !p.dead); } catch (e) { return true; }
}
function rangerProfile(Game, vid) {
  try { const p = Game.npcRangeProfile ? Game.npcRangeProfile(vid) : null; return p; } catch (e) { return null; }
}

// stageTableVeteran(Game, vid, day): the harness staging step, shared
// by the driver (MODE=stage) and the proof test. Supplies ONLY the two
// game-state inputs the game itself would produce at standing 200:
//   - state._standingDeferBeat[5] = day (the fifth-draft deferral beat)
//   - a 'standing'-stage plan seed for the veteran
// and returns {vid, day, beatSet, planSeeded}. The advance to 'table'
// is GAME CODE's job (winPlanHavenTick) — this function never writes
// stage 'table' itself. If the veteran has no wave-4 kill yet, the
// caller must grant one first (recordWaveKill) — this function refuses
// a non-veteran rather than silently staging a non-veteran.
function stageTableVeteran(Game, vid, day) {
  if (!Game || !vid) return { vid: vid || null, day: day, ok: false, why: 'no-vid' };
  if (!isWave4Killer(Game, vid)) return { vid: vid, day: day, ok: false, why: 'not-a-veteran' };
  try { Game.state._standingDeferBeat = Game.state._standingDeferBeat || {}; } catch (e) { return { vid: vid, day: day, ok: false, why: 'no-state' }; }
  try { Game.state._standingDeferBeat[5] = day; } catch (e) { return { vid: vid, day: day, ok: false, why: 'beat-write-failed' }; }
  try {
    const v = (Game.state || {}).village || {};
    v.winPlan = v.winPlan || {};
    const existing = v.winPlan[vid];
    if (existing) {
      existing.stage = 'standing';
      existing.target = existing.target || 'eater';
      existing.needWave = 4;
      if (!existing.party) existing.party = [];
      if (existing.holdSinceDay == null) existing.holdSinceDay = -1;
    } else {
      v.winPlan[vid] = { stage: 'standing', target: 'eater', needWave: 4, node: null, party: [], sinceDay: day, holdSinceDay: -1 };
    }
  } catch (e) { return { vid: vid, day: day, ok: false, why: 'plan-write-failed' }; }
  return { vid: vid, day: day, ok: true, why: null };
}

const SAY_RE = /table|veteran|FINAL DRAFT|fifth draft|blooded/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'vetguard-' + MODE, fullTelemetry: false });
  const vetSays = [];
  let sayCount = 0;
  const errors = [];
  if (RECORDER_ON) try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && vetSays.length < 200) vetSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);

  const v3gates = [];      // every winPlanFightGate call, wave >= 3
  const vetDeparts = [];   // every winPlanDepart row for a table-stage veteran
  const dailyCensus = [];  // one row per day: chain counts
  const tableEvents = [];  // first-appearance of each table-stage veteran
  const stagingEvents = []; // MODE=stage only
  const probeRows = [];    // MODE=stage end-of-run probe only
  const knownTableVets = {};
  let staged = null;       // MODE=stage: {vid, day, grantedKill, stageResult}
  let lastSnapDay = -1;

  function waveOf(mdef) { try { return (mdef && mdef.wave) | 0; } catch (e) { return 0; } }
  function trickKnownOf(mid) { try { return !!(Game.villageKnowsTrick && Game.villageKnowsTrick(mid)); } catch (e) { return false; } }

  // ---- GATE WRAP (wave >= 3 — the guard's floor, not the fightgate
  // driver's wave >= 4). Pure reads around the real call; the gate
  // runs exactly once, untouched. Plan stage is read BEFORE the call
  // (the guard demotes it on fire) and AFTER (to observe the fallback).
  try {
    const origGate = Game.winPlanFightGate;
    if (RECORDER_ON && typeof origGate === 'function') {
      Game.winPlanFightGate = function (vid, mdef) {
        const w = waveOf(mdef);
        const planBefore = planOf(Game, vid);
        const stageBefore = planBefore ? planBefore.stage : null;
        const vetBefore = isWave4Killer(Game, vid);
        const ret = origGate.apply(this, arguments);
        try {
          if (w >= 3 && mdef && mdef.id) {
            const judged = (ret && ret.party) ? ret.party.slice() : [vid];
            let allArmed = true, allArmored = true;
            const gear = {};
            for (const p of judged) { const g = gearOfReplica(Game, p); gear[p] = { armed: g.armed, armored: g.armored, armorP: g.armorP }; if (!g.armed) allArmed = false; if (!g.armored) allArmored = false; }
            const planAfter = planOf(Game, vid);
            v3gates.push({ day: gday(Game), vid: vid, mid: mdef.id, wave: w,
              result: ret ? (ret.avoid ? 'avoid' : (ret.seek ? 'seek' : 'other')) : 'null',
              reason: (ret && ret.reason) || null,
              partySize: judged.length, party: judged.slice(),
              allArmed: allArmed, allArmored: allArmored, gear: gear,
              trickKnown: trickKnownOf(mdef.id),
              planStage: stageBefore, planStageAfter: planAfter ? planAfter.stage : null,
              isVeteran: vetBefore, isTableVeteran: (stageBefore === 'table') ? vetBefore : false,
              planParty: planBefore && planBefore.party ? planBefore.party.slice() : [],
              needWave: needWaveOf(Game), probe: false });
          }
        } catch (e) { errors.push('v3gate-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanFightGate-wrap: not a function');
  } catch (e) { errors.push('winPlanFightGate-wrap-install: ' + String(e.message).slice(0, 80)); }

  // ---- HAVENTICK WRAP (T2-v3 availability inspection) ----
  // Records every winPlanHavenTick call for the STAGED veteran only
  // (vid === staged.vid, once staged), with the plan stage before /
  // after and Haven presence — the tick is what advances a standing
  // plan to 'table', so a staged veteran who never reaches table
  // must be explained by the tick never running for them (or running
  // while they were out / at another stage), not assumed. All other
  // calls are counted only (havenTickCalls). Pure reads around the
  // real call; the tick runs exactly once, untouched.
  let havenTickCalls = 0;
  const havenTicks = [];
  try {
    const origHavenTick = Game.winPlanHavenTick;
    if (RECORDER_ON && typeof origHavenTick === 'function') {
      Game.winPlanHavenTick = function (vid, hx, hy) {
        havenTickCalls++;
        const planBefore = planOf(Game, vid);
        const stageBefore = planBefore ? planBefore.stage : null;
        const havenBefore = atHaven(Game, vid);
        const ret = origHavenTick.apply(this, arguments);
        try {
          if (staged && vid === staged.vid) {
            const planAfter = planOf(Game, vid);
            havenTicks.push({ day: gday(Game), vid: vid,
              stageBefore: stageBefore, stageAfter: planAfter ? planAfter.stage : null,
              atHaven: havenBefore, returnedPlan: !!ret });
          }
        } catch (e) { errors.push('haventick-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanHavenTick-wrap: not a function');
  } catch (e) { errors.push('winPlanHavenTick-wrap-install: ' + String(e.message).slice(0, 80)); }

  // ---- DEPART WRAP (table-stage veterans only). The depart-side
  // guard (VETERAN_GUARD_DAYS hold) lives here; every hold/launch/
  // normal for a table veteran is a row.
  try {
    const origDepart = Game.winPlanDepart;
    if (RECORDER_ON && typeof origDepart === 'function') {
      Game.winPlanDepart = function (vid, hx, hy, playerAtHaven) {
        const planBefore = planOf(Game, vid);
        const stageBefore = planBefore ? planBefore.stage : null;
        const vetBefore = isWave4Killer(Game, vid);
        const ret = origDepart.apply(this, arguments);
        try {
          if (stageBefore === 'table' && vetBefore) {
            const planAfter = planOf(Game, vid);
            vetDeparts.push({ day: gday(Game), vid: vid, result: ret,
              stageBefore: stageBefore, stageAfter: planAfter ? planAfter.stage : null,
              target: planBefore ? (planBefore.target || null) : null,
              party: (planAfter && planAfter.party) ? planAfter.party.slice() : [],
              holdSinceDay: planAfter ? (planAfter.holdSinceDay != null ? planAfter.holdSinceDay : null) : null,
              atHaven: atHaven(Game, vid) });
          }
        } catch (e) { errors.push('vetdepart-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanDepart-wrap: not a function');
  } catch (e) { errors.push('winPlanDepart-wrap-install: ' + String(e.message).slice(0, 80)); }

  function dailyCensusRow() {
    try {
      const v = (Game.state || {}).village || {};
      const roster = v.roster || [];
      const wp = v.winPlan || {};
      const beat = (Game.state || {})._standingDeferBeat || {};
      let nTablePlans = 0, nTableVeterans = 0, livingVets4 = 0;
      const tableVeteranVids = [], livingVets4Vids = [], tablePlanVids = [];
      const stages = {};
      for (const vid of roster) {
        if (!vid) continue;
        const pl = wp[vid] || null;
        if (pl) {
          stages[pl.stage || '?'] = (stages[pl.stage || '?'] || 0) + 1;
          if (pl.stage === 'table') { nTablePlans++; tablePlanVids.push(vid); }
        }
        const isVet = isWave4Killer(Game, vid);
        const al = alive(Game, vid);
        if (isVet && al) { livingVets4++; livingVets4Vids.push(vid); }
        if (pl && pl.stage === 'table' && isVet) {
          nTableVeterans++;
          tableVeteranVids.push(vid);
          if (!knownTableVets[vid]) {
            knownTableVets[vid] = gday(Game);
            tableEvents.push({ day: gday(Game), vid: vid, via: 'census',
              alive: al, atHaven: atHaven(Game, vid), planTarget: pl.target || null });
          }
        }
      }
      let standing = null, capped = null, peakWave = null;
      // PURE READS ONLY (2026-11-18 contamination fix): the recorder
      // used to call villageStandingTotal() + unlockedWave() daily —
      // both ADVANCE the standing gates as a side effect (peak ratchet
      // + hold/release beats, standing.js), so the recorder fired beats
      // early and diverged seed 104308 from the fightgate census band
      // (77 deaths / village-lost d143 vs 74 / survived). The breakdown
      // below is computed from villageStanding() (pure) + the plenty
      // cap; the peak is read straight from state. Never call a
      // gate-advancing function from a recorder.
      try {
        const br = Game.villageStanding ? Game.villageStanding() : null;
        const cfg = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : null;
        const cap = (cfg && (cfg.plentyCapT5 | 0)) || 100;
        if (br) {
          standing = (br.total | 0) || 0;
          capped = (((br.war | 0) + (br.diplomacy | 0) + Math.min((br.plenty | 0), cap)) | 0) || 0;
        }
      } catch (e) {}
      try { peakWave = ((Game.state || {})._standingPeakWave | 0) || 0; } catch (e) {}
      // VETDETAIL: per living wave-4 killer, the plan stage + Haven
      // presence — the next link of the chain (why no table plan forms
      // even when beat[5] exists): a veteran must HOLD a standing/hunt
      // plan AND be at Haven for winPlanHavenTick to advance them.
      const vetDetail = [];
      const scholarIdD = (function () { try { return Game.villagerId || null; } catch (e) { return null; } })();
      for (const vid of roster) {
        if (!vid) continue;
        if (!alive(Game, vid) || !isWave4Killer(Game, vid)) continue;
        const pl = wp[vid] || null;
        // isScholar: the guard can only ever fire for NPCs (the gate
        // is consulted in expeditionMonster, NPC agency only; the
        // plan ticks skip the scholar) — flag it so the chain can be
        // read NPC-only as well as overall.
        vetDetail.push({ vid: vid, planStage: pl ? pl.stage : null, atHaven: atHaven(Game, vid), isScholar: vid === scholarIdD });
      }
      dailyCensus.push({ day: gday(Game), rosterN: roster.length,
        stages: stages, nTablePlans: nTablePlans, tablePlanVids: tablePlanVids,
        nTableVeterans: nTableVeterans, tableVeteranVids: tableVeteranVids,
        livingVets4: livingVets4, livingVets4Vids: livingVets4Vids, vetDetail: vetDetail,
        beat4: (beat[4] != null ? beat[4] : null), beat5: (beat[5] != null ? beat[5] : null),
        standing: standing, cappedStanding: capped, peakWave: peakWave });
    } catch (e) { errors.push('daily-census: ' + String(e.message).slice(0, 80)); }
  }

  // MODE=stage: attempt the staging once the day floor is reached.
  // Prefer a living ORGANIC wave-4 killer at Haven; from GRANT_DAY
  // on, grant one kill through the real choke point to a living
  // ranger at Haven if no organic killer exists yet.
  function tryStage() {
    if (MODE !== 'stage' || staged) return;
    const d = gday(Game);
    if (d < STAGE_DAY) return;
    try {
      const v = (Game.state || {}).village || {};
      const roster = v.roster || [];
      let pick = null, pickAtHaven = false;
      const scholarId = (function () { try { return Game.villagerId || null; } catch (e) { return null; } })();
      for (const vid of roster) {
        if (!vid || vid === scholarId) continue; // the scholar is
        // skipped: agencyTick (villager-agency.js) `continue`s past
        // the scholar, so winPlanHavenTick / winPlanDepart NEVER run
        // for the player character — staging the scholar can never
        // reach 'table' through game code (T2-v1 proved it the hard
        // way: james_okonkwo, scholar from day 108, sat at Haven
        // 6 days with a standing plan + beat[5] and never advanced).
        if (!alive(Game, vid) || !isWave4Killer(Game, vid)) continue;
        if (atHaven(Game, vid)) { pick = vid; pickAtHaven = true; break; }
        if (!pick) pick = vid;
      }
      let grantedKill = false;
      if (!pick && d >= GRANT_DAY) {
        for (const vid of roster) {
          if (!vid || vid === scholarId) continue;
          if (!alive(Game, vid) || !atHaven(Game, vid)) continue;
          const prof = rangerProfile(Game, vid);
          if (prof !== 'wanderer' && prof !== 'explorer') continue;
          try {
            if (typeof Game.recordWaveKill === 'function') {
              Game.recordWaveKill('eater', vid, 'vetguard-stage', null);
              if (isWave4Killer(Game, vid)) { pick = vid; pickAtHaven = true; grantedKill = true; }
            }
          } catch (e) { errors.push('stage-grant-kill: ' + String(e.message).slice(0, 80)); }
          break;
        }
      }
      if (!pick) return;
      const res = stageTableVeteran(Game, pick, d);
      staged = { vid: pick, day: d, grantedKill: grantedKill,
        atHaven: pickAtHaven, stageOk: res.ok, stageWhy: res.why || null };
      stagingEvents.push(Object.assign({}, staged));
    } catch (e) { errors.push('try-stage: ' + String(e.message).slice(0, 80)); }
  }

  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) {
            lastSnapDay = d;
            tryStage();
            dailyCensusRow();
          }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });
  // Final census row at end of run (runDays may end mid-day).
  try { dailyCensusRow(); } catch (e) {}

  // MODE=stage end-of-run probe (supplementary only): one live gate
  // call on the staged veteran's CURRENT state. Recorded as
  // probe:true; the firing demotes the plan, so it runs AFTER all
  // natural observation, and never judges T1 (the proof test does).
  if (MODE === 'stage' && staged && staged.stageOk) {
    try {
      const vid = staged.vid;
      const plan = planOf(Game, vid);
      if (alive(Game, vid) && plan && plan.stage === 'table' && isWave4Killer(Game, vid)) {
        const mdef = ((Game.data || {}).monsters || []).find(function (m) { return m && m.wave === 3; }) || { id: 'redactor', wave: 3 };
        const stageBefore = plan.stage;
        const ret = Game.winPlanFightGate(vid, mdef);
        const planAfter = planOf(Game, vid);
        const judged = (ret && ret.party) ? ret.party.slice() : [vid];
        probeRows.push({ day: gday(Game), vid: vid, mid: mdef.id, wave: 3,
          result: ret ? (ret.avoid ? 'avoid' : (ret.seek ? 'seek' : 'other')) : 'null',
          reason: (ret && ret.reason) || null,
          partySize: judged.length, party: judged.slice(),
          planStage: stageBefore, planStageAfter: planAfter ? planAfter.stage : null,
          isVeteran: true, isTableVeteran: true, probe: true });
      } else {
        probeRows.push({ day: gday(Game), vid: vid, mid: null, wave: null,
          result: 'skipped', reason: (alive(Game, vid) ? 'not-table-stage' : 'veteran-dead'),
          partySize: null, party: null,
          planStage: plan ? plan.stage : null, planStageAfter: null,
          isVeteran: isWave4Killer(Game, vid), isTableVeteran: false, probe: true });
      }
    } catch (e) { errors.push('probe: ' + String(e.message).slice(0, 80)); }
  }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null, capped = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  try { capped = (typeof Game.standingPlentyCappedTotal === 'function') ? Game.standingPlentyCappedTotal() : null; } catch (e) {}
  let pantryKcal = 0;
  try {
    pantryKcal = ((st.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) {}
  let ready4 = null, ready5 = null, ladderVets4 = null, winPlanStats = null;
  try { ready4 = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null; } catch (e) { errors.push('ready4: ' + String(e.message).slice(0, 80)); }
  try { ready5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { errors.push('ready5: ' + String(e.message).slice(0, 80)); }
  try { ladderVets4 = (typeof Game._ladderLivingVeterans === 'function') ? Game._ladderLivingVeterans(4) : null; } catch (e) { errors.push('ladderVets4: ' + String(e.message).slice(0, 80)); }
  try { winPlanStats = (typeof Game.winPlanStats === 'function') ? Game.winPlanStats() : null; } catch (e) { errors.push('winPlanStats: ' + String(e.message).slice(0, 80)); }

  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  const maxStanding = dailyCensus.reduce(function (m, r) { const s = (r.standing && r.standing.total != null) ? r.standing.total : ((typeof r.standing === 'number') ? r.standing : null); return (s != null && s > m) ? s : m; }, 0);
  const maxCapped = dailyCensus.reduce(function (m, r) { const s = (r.cappedStanding != null) ? r.cappedStanding : null; return (s != null && s > m) ? s : m; }, 0);

  const out = {
    seed: seed, arm: 'vetguard-b', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR,
    recorderOn: RECORDER_ON,
    policySha: POLICY_SHA, policy: 'competent',
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    cappedStanding: capped, maxStanding: maxStanding, maxCappedStanding: maxCapped,
    endPantryKcal: pantryKcal,
    ready4: ready4, ready5: ready5, ladderVets4: ladderVets4,
    winPlanStats: winPlanStats,
    vetSays: vetSays, sayCount: sayCount,
    instrumentErrors: errors,
    deaths: deaths,
    samples: result.samples || null,
    v3gates: v3gates, vetDeparts: vetDeparts, dailyCensus: dailyCensus,
    tableEvents: tableEvents, stagingEvents: stagingEvents, probeRows: probeRows,
    havenTicks: havenTicks, havenTickCalls: havenTickCalls,
  };
  return out;
}

if (require.main === module) (async function () {
  if (MODE !== 'survey' && MODE !== 'stage') { console.error('VETGUARD STOP: MODE must be survey|stage, got ' + JSON.stringify(MODE)); process.exit(2); }
  if (process.env.VETREENGAGE !== '1') { console.error('VETGUARD STOP: VETREENGAGE=1 required (substrate).'); process.exit(2); }
  if (process.env.PARTYSIZE4 !== '1') { console.error('VETGUARD STOP: PARTYSIZE4=1 required (substrate).'); process.exit(2); }
  if (process.env.FLEEREPAIR2 !== '1') { console.error('VETGUARD STOP: FLEEREPAIR2=1 required (substrate).'); process.exit(2); }
  if (process.env.SEEKGATE === '1') { console.error('VETGUARD STOP: SEEKGATE must be unset (gate not on this base).'); process.exit(2); }
  if (process.env.WILDAVOID === '1') { console.error('VETGUARD STOP: WILDAVOID must be unset (census cross-check band).'); process.exit(2); }
  if (!SEEDS.length) { console.error('VETGUARD STOP: SEEDS required.'); process.exit(2); }
  if (MODE === 'stage' && SEEDS.length !== 1) { console.error('VETGUARD STOP: MODE=stage takes exactly 1 seed.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-18', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'vetguard-b-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('VETGUARD STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'vetguard-b-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      policySha: out.policySha, recorderOn: out.recorderOn,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      maxStanding: out.maxStanding, maxCapped: out.maxCappedStanding,
      vetSays: out.vetSays.length, deaths: out.deaths.length,
      v3gates: out.v3gates.length, vetDeparts: out.vetDeparts.length,
      censusDays: out.dailyCensus.length, tableEvents: out.tableEvents.length,
      staging: out.stagingEvents.length, probes: out.probeRows.length,
      havenTicks: out.havenTicks.length, havenTickCalls: out.havenTickCalls,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, gearOfReplica: gearOfReplica, isWave4Killer: isWave4Killer, isWave3Killer: isWave3Killer, planOf: planOf, needWaveOf: needWaveOf, havenTile: havenTile, atHaven: atHaven, alive: alive, stageTableVeteran: stageTableVeteran };
