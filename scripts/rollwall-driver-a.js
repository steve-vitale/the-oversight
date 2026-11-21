// rollwall-driver-a.js — DIAG driver, arm sim-rollwall-a
// (finding #2590, the ROLL WALL: fiberfetch-a found all 6 served
// departures that left with 0 ammo failed their 60% departure
// arrow-craft with fiber plentiful. 6/6 at 60% is p~0.004 IF the 6
// were 6 independent draws — but re-derived from the fiberfetch
// corpus they are the failure subset of 20 served-rate attempts
// (14 ok / 6 fail, 0.700 observed vs 0.600 stated). This driver
// records EVERY departure arrow-craft attempt on a fresh band so the
// analyzer can classify every 0-ammo served departure into
// roll-fail vs gate-blocked (no-attempt / no-mats / no-ammo-id /
// no-ranged / no-recipe / timing) and test the roll's calibration
// per rate on fresh seeds.
// Substrate (fiberfetch substrate minus the dead fetch): SPEARGATE=1
// (landed) + BOWOPEN=1 + SENSEEXPED=1 + DEPMAT=1 + ROLL35=1 + AMMO=1
// re-landed from the fiberfetch lever commit 213c4adfd (FIBERFETCH
// NOT re-landed — CONCEPT-DEAD). Common: VETREENGAGE=1 PARTYSIZE4=1
// FLEEREPAIR2=1 FIGHTALLY2=1. BOWKNOW, DEPARTSEE, EVADEOBS unset.
// Wraps (pure reads, no extra Math.random draws, no game-state
// writes — the game runs exactly once, untouched):
//   villagerStageBow -> stageRows: lv[bow]/lv[crude_bow] before and
//     after, pile + own branch/vine/wood at the attempt, spearHolder,
//     return source/itemId/craftedOk/roll35Rate/depmatSite.
//   villagerPocketAmmo -> ammoRows: rangedId, ammoId, carriedBefore/
//     After, stashedBefore, pile stick/stone/fiber + every recipe
//     material, PACK fiber (own carried fiber — the departure craft
//     reads only the pile), ammoLvBefore, pocketed/crafted/craftedOk,
//     ammoRate, ammoServed, failReason (derived from reads + return,
//     never a second call), call path (expedition/patrol/other from
//     the stack — patrols pocket ammo but never stage a bow).
//   villagerAmmoCraftDay -> homeCraftRows: per call, pile fiber
//     before/after + batches made; per maker vid, carried-ammo and
//     level before/after (the timing suspect: the home craft can
//     drain the day's fiber before a departure).
// A shared seq counter orders rows within a day (home craft vs
// departure), and a dawn pile-fiber census per day separates
// "pile was 0 at dawn" (supply) from "drained before departure"
// (timing). Say-lines matching bow/arrow/quiver are sampled (cap
// 400) for the sense-test.
// Policy: competent verbatim (scripts/policies/competent.js), 150d
// death-aware. Pilot band 107121-107128 (FRESH — see prereg §0.1).
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 DEPMAT=1 ROLL35=1 AMMO=1 MODE=diag OUTDIR=perseed-rollwall-a-diag SEEDS=107121,107122 RUN=rollwall-a node scripts/rollwall-driver-a.js
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
const RUN = process.env.RUN || 'rollwall-a';
const MODE = process.env.MODE || 'diag';
const OUTDIR = process.env.OUTDIR || ('perseed-rollwall-a-' + MODE);

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12); } catch (e) {}
let GAME_SHA = 'unknown';
let BOWOPEN_PRESENT = false;
let SPEARGATE_PRESENT = false;
let DEPMAT_PRESENT = false;
let ROLL35_PRESENT = false;
let AMMO_PRESENT = false;
let FIBERFETCH_PRESENT = false;
try {
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  GAME_SHA = crypto.createHash('sha256').update(gameSrc).digest('hex').slice(0, 12);
  BOWOPEN_PRESENT = /BOWOPEN/.test(gameSrc) && /villagerStageBow/.test(gameSrc);
  SPEARGATE_PRESENT = /SPEARGATE/.test(gameSrc) && /villagerStageBow/.test(gameSrc) && /volleyWeaponOf/.test(gameSrc);
  DEPMAT_PRESENT = /DEPMAT/.test(gameSrc) && /villagerStageBow/.test(gameSrc) && /weapon_craft_site/.test(gameSrc);
  ROLL35_PRESENT = /ROLL35/.test(gameSrc) && /villagerStageBow/.test(gameSrc) && /roll35Rate/.test(gameSrc);
  AMMO_PRESENT = /AMMO \(sim-ammo-a/.test(gameSrc) && /villagerPocketAmmo/.test(gameSrc);
  FIBERFETCH_PRESENT = /FIBERFETCH \(sim-fiberfetch-a/.test(gameSrc) && /villagerPocketAmmo/.test(gameSrc);
} catch (e) {}
const SENSEEXPED_ON = process.env.SENSEEXPED === '1';
const BOWOPEN_ON = process.env.BOWOPEN === '1';
const SPEARGATE_ON = process.env.SPEARGATE === '1';
const DEPMAT_ON = process.env.DEPMAT === '1';
const ROLL35_ON = process.env.ROLL35 === '1';
const AMMO_ON = process.env.AMMO === '1';
const FIBERFETCH_ON = process.env.FIBERFETCH === '1';
const BOWKNOW_ON = process.env.BOWKNOW === '1';
let SENSE_PRESENT = false;
try { SENSE_PRESENT = /SENSEEXPED/.test(fs.readFileSync(path.join(REPO, 'src', 'js', 'party-wiring.js'), 'utf8')); } catch (e) {}

process.stdout.on('error', function () {});
process.stderr.on('error', function () {});
function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
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
    } catch (e) { sleepMs(250); }
  }
  return false;
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// countMat(person, mat): own carried count of a material, using the
// villagerAmmoCraftDay isMatEntry rule (string entry, e.material, or
// e.itemId with no weapon/armor def). Pure read.
function countMat(person, mat, defs) {
  let n = 0;
  try {
    const defOf = function (id) { for (let i = 0; i < (defs || []).length; i++) if (defs[i] && defs[i].id === id) return defs[i]; return null; };
    for (const e of (person.items || [])) {
      if (typeof e === 'string') { if (e === mat) n += 1; continue; }
      if (!e) continue;
      if (e.material === mat) { n += (e.units || 1); continue; }
      if (e.itemId === mat) { const d = defOf(mat); if (!(d && (d.weapon || d.armor))) n += (e.units || 1); }
    }
  } catch (e) {}
  return n;
}
function countAmmo(person, ammoId) {
  let n = 0;
  try {
    for (const e of (person.items || [])) {
      const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
      if (eid === ammoId) n += (typeof e === 'string') ? 1 : (e.units || 1);
    }
  } catch (e) {}
  return n;
}
// callPath(stackOverride): the villagerPocketAmmo caller —
// 'expedition' (villager-agency.js depart path, stages first),
// 'patrol' (resolvePatrol — pockets but never stages), or
// 'other:<fn>'. Pure read of the stack.
function callPath(stackOverride) {
  try {
    const st = stackOverride != null ? String(stackOverride) : (new Error().stack || '');
    const lines = st.split('\n').slice(1);
    for (const ln of lines) {
      if (ln.indexOf('rollwall-driver-a.js') !== -1) continue;
      if (ln.indexOf('villager-agency') !== -1) return 'expedition';
      if (ln.indexOf('resolvePatrol') !== -1) return 'patrol';
      const m = ln.match(/at\s+(?:[A-Za-z_$][\w$]*\.)?([A-Za-z_$][\w$]*)\s+\(/);
      if (m && m[1] && m[1] !== 'Object') return 'other:' + m[1];
    }
    return 'unclassified';
  } catch (e) { return 'unclassified'; }
}
// deriveFailReason(reads, ret): the pocketAmmo fail reason from the
// pre-call reads + the return, never a second call. Order mirrors
// the code's early exits.
function deriveFailReason(r, ret) {
  const cap = r.ammoId === 'stone' ? 6 : 5;
  if (!r.rangedId) return 'no-ranged';
  if (!r.ammoId) return 'no-ammo-id';
  if (r.carriedBefore >= cap) return 'already-capped';
  if (ret && ret.crafted === 1 && ret.craftedOk) return 'craft-ok';
  if (ret && ret.crafted === 1 && !ret.craftedOk) return 'craft-fail';
  if (ret && (ret.pocketed | 0) > 0) return 'stock-draw';
  if (r.pileBefore == null) return 'no-pile';
  if (r.ammoId === 'arrow' || r.ammoId === 'bolt') return 'no-mats';
  return 'no-recipe';
}

const SAY_RE = /bow|arrow|quiver|nocks an arrow|no arrows|the string stays drawn/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'rollwall-' + MODE, fullTelemetry: false });
  const errors = [];
  const vetSays = [];
  let sayCount = 0;
  let rowSeq = 0;
  function nextSeq() { return ++rowSeq; }
  const stageRows = [];
  const ammoRows = [];
  const homeCraftRows = [];
  const dawnCensus = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && vetSays.length < 400) vetSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);

  // ---- STAGE RECORDER (villagerStageBow) ----
  try {
    const origStage = Game.villagerStageBow;
    if (typeof origStage === 'function') {
      Game.villagerStageBow = function (vid) {
        const day = gday(Game);
        const seq = nextSeq();
        let lvBowBefore = null, lvCrudeBefore = null, pileBefore = null, ownBefore = null, spearHolder = false;
        try {
          const v = (Game.state || {}).village || {};
          const lv = (v.weaponCraft || {})[vid] || {};
          lvBowBefore = lv.bow || 0;
          lvCrudeBefore = lv.crude_bow || 0;
          const st0 = (Game.stashState) ? Game.stashState() : null;
          const mats0 = (st0 && st0.materials) || {};
          pileBefore = { branch: (mats0.branch | 0), vine: (mats0.vine | 0), wood: (mats0.wood | 0) };
          const pp = Game.getPerson ? Game.getPerson(vid) : null;
          const defs0 = (Game.data && Game.data.items) || [];
          if (pp) {
            ownBefore = { branch: countMat(pp, 'branch', defs0), vine: countMat(pp, 'vine', defs0), wood: countMat(pp, 'wood', defs0) };
            const S0 = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
            if (S0.equipment && S0.equipment.rangedWeaponOf) {
              const rw0 = S0.equipment.rangedWeaponOf(pp, defs0);
              if (rw0) {
                const rid0 = rw0.itemId || rw0.id || null;
                const d0 = defs0.find(function (d) { return d.id === rid0; }) || null;
                spearHolder = !!(d0 && d0.weapon && !d0.weapon.ammo);
              }
            }
          }
        } catch (e) { errors.push('stage-pre: ' + String(e.message).slice(0, 80)); }
        const ret = origStage.apply(this, arguments);
        try {
          const v = (Game.state || {}).village || {};
          const lv = (v.weaponCraft || {})[vid] || {};
          stageRows.push({ seq: seq, day: day, vid: vid,
            lvBowBefore: lvBowBefore, lvCrudeBefore: lvCrudeBefore,
            lvBowAfter: (lv.bow || 0), lvCrudeAfter: (lv.crude_bow || 0),
            pileBefore: pileBefore, ownBefore: ownBefore,
            spearHolder: spearHolder,
            staged: !!(ret && ret.staged), source: (ret && ret.source) || null,
            itemId: (ret && ret.itemId) || null, craftedOk: !!(ret && ret.craftedOk),
            roll35Rate: (ret && ret.roll35Rate != null) ? ret.roll35Rate : null,
            depmatSite: !!(ret && ret.depmatSite),
            siteMats: (ret && Array.isArray(ret.siteMats)) ? ret.siteMats.slice() : null });
        } catch (e) { errors.push('stage-post: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('villagerStageBow-wrap: not a function');
  } catch (e) { errors.push('villagerStageBow-wrap-install: ' + String(e.message).slice(0, 80)); }

  // ---- AMMO RECORDER (villagerPocketAmmo) ----
  try {
    const origPocket = Game.villagerPocketAmmo;
    if (typeof origPocket === 'function') {
      Game.villagerPocketAmmo = function (vid) {
        const day = gday(Game);
        const seq = nextSeq();
        const path = callPath();
        let rangedId = null, ammoId = null, carriedBefore = 0, stashedBefore = 0;
        let pileBefore = null, pileArrowsBefore = 0, packFiberBefore = 0, ammoLvBefore = null;
        let servedThisDepart = false, servedSource = null, servedItemId = null;
        let recipeMats = null;
        try {
          const pp = Game.getPerson ? Game.getPerson(vid) : null;
          const defs0 = (Game.data && Game.data.items) || [];
          const S0 = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
          if (pp && S0.equipment && S0.equipment.rangedWeaponOf) {
            const rw0 = S0.equipment.rangedWeaponOf(pp, defs0);
            if (rw0) {
              rangedId = rw0.itemId || rw0.id || null;
              const rd = defs0.find(function (d) { return d.id === rangedId; }) || null;
              ammoId = (rd && rd.weapon && rd.weapon.ammo) || null;
            }
          }
          if (pp && ammoId) {
            carriedBefore = countAmmo(pp, ammoId);
            for (const e of (pp.stashed || [])) {
              const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
              if (eid === ammoId) stashedBefore += (typeof e === 'string') ? 1 : (e.units || 1);
            }
            packFiberBefore = countMat(pp, 'fiber', defs0);
          }
          try {
            const st0 = (Game.stashState) ? Game.stashState() : null;
            const mats0 = (st0 && st0.materials) || {};
            pileBefore = { stick: (mats0.stick | 0), stone: (mats0.stone | 0), fiber: (mats0.fiber | 0) };
            for (const w of ((st0 && st0.weapons) || [])) {
              const wid = w && (w.itemId || w.id);
              if (wid === 'arrow') pileArrowsBefore += (w.units != null ? w.units : 1);
            }
            if (mats0.arrow) pileArrowsBefore += (mats0.arrow | 0);
          } catch (e) { pileBefore = null; }
          if (ammoId === 'arrow' || ammoId === 'bolt') {
            try {
              const recipe = (Game.data.recipes || []).find(function (r) { return r.id === ammoId; }) || null;
              if (recipe && recipe.materials) {
                recipeMats = {};
                const st0 = (Game.stashState) ? Game.stashState() : null;
                const mats0 = (st0 && st0.materials) || {};
                for (const m of Object.keys(recipe.materials)) {
                  recipeMats[m] = { need: recipe.materials[m], pile: (mats0[m] | 0), pack: pp ? countMat(pp, m, defs0) : 0 };
                }
              }
            } catch (e) {}
          }
          try {
            const vv = (Game.state || {}).village || {};
            ammoLvBefore = ammoId ? ((((vv.ammoCraft || {})[vid] || {})[ammoId]) || 1) : null;
            const rec = (vv.bowOpenByVid || {})[vid] || null;
            if (rec && rec.day === day && (rec.source === 'crafted' || rec.source === 'fromStash' || rec.source === 'fromArmory')) {
              servedThisDepart = true; servedSource = rec.source; servedItemId = rec.itemId || null;
            }
          } catch (e) {}
        } catch (e) { errors.push('ammo-pre: ' + String(e.message).slice(0, 80)); }
        const ret = origPocket.apply(this, arguments);
        try {
          let carriedAfter = 0;
          try {
            const pp2 = Game.getPerson ? Game.getPerson(vid) : null;
            const aid = (ret && ret.ammoId) || ammoId;
            if (pp2 && aid) carriedAfter = countAmmo(pp2, aid);
          } catch (e) {}
          const reads = { rangedId: rangedId, ammoId: ammoId, carriedBefore: carriedBefore, pileBefore: pileBefore };
          ammoRows.push({ seq: seq, day: day, vid: vid, path: path,
            rangedId: rangedId, ammoId: (ret && ret.ammoId) || ammoId,
            servedThisDepart: servedThisDepart, servedSource: servedSource, servedItemId: servedItemId,
            carriedBefore: carriedBefore, carriedAfter: carriedAfter,
            stashedBefore: stashedBefore,
            pile: pileBefore, pileArrowsBefore: pileArrowsBefore,
            packFiberBefore: packFiberBefore,
            recipeMats: recipeMats,
            ammoLvBefore: ammoLvBefore,
            pocketed: (ret && ret.pocketed) | 0,
            crafted: (ret && ret.crafted) | 0,
            craftedOk: !!(ret && ret.craftedOk),
            ammoServed: !!(ret && ret.ammoServed),
            ammoRate: (ret && ret.ammoRate != null) ? ret.ammoRate : null,
            failReason: deriveFailReason(reads, ret) });
        } catch (e) { errors.push('ammo-post: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('villagerPocketAmmo-wrap: not a function');
  } catch (e) { errors.push('villagerPocketAmmo-wrap-install: ' + String(e.message).slice(0, 80)); }

  // ---- HOME-CRAFT RECORDER (villagerAmmoCraftDay) ----
  // The home craft returns only a count, so attribute makers by
  // before/after snapshots: every home bow-holder's carried ammo +
  // level, and pile fiber, read before and after the call.
  try {
    const origHome = Game.villagerAmmoCraftDay;
    if (typeof origHome === 'function') {
      Game.villagerAmmoCraftDay = function () {
        const day = gday(Game);
        const seq = nextSeq();
        let pileFiberBefore = null, beforeByVid = {};
        try {
          const st0 = (Game.stashState) ? Game.stashState() : null;
          pileFiberBefore = ((st0 && st0.materials) || {}).fiber | 0;
          const v = (Game.state || {}).village || {};
          const defs0 = (Game.data && Game.data.items) || [];
          for (const vid of (v.roster || [])) {
            try {
              const p = Game.getPerson ? Game.getPerson(vid) : null;
              if (!p || p.dead) continue;
              const rw = (globalThis.Scattering && globalThis.Scattering.equipment && globalThis.Scattering.equipment.rangedWeaponOf)
                ? globalThis.Scattering.equipment.rangedWeaponOf(p, defs0) : null;
              if (!rw) continue;
              const rd = defs0.find(function (d) { return d.id === (rw.itemId || rw.id); }) || null;
              const aid = (rd && rd.weapon && rd.weapon.ammo) || null;
              if (!aid || (aid !== 'arrow' && aid !== 'bolt')) continue;
              beforeByVid[vid] = { ammoId: aid, carried: countAmmo(p, aid),
                level: ((((v.ammoCraft || {})[vid] || {})[aid]) || 1) };
            } catch (e2) {}
          }
        } catch (e) { errors.push('home-pre: ' + String(e.message).slice(0, 80)); }
        const ret = origHome.apply(this, arguments);
        try {
          let pileFiberAfter = null;
          try { const st1 = (Game.stashState) ? Game.stashState() : null; pileFiberAfter = ((st1 && st1.materials) || {}).fiber | 0; } catch (e) {}
          const makers = [];
          try {
            const v = (Game.state || {}).village || {};
            for (const vid of Object.keys(beforeByVid)) {
              try {
                const p = Game.getPerson ? Game.getPerson(vid) : null;
                if (!p) continue;
                const b = beforeByVid[vid];
                const carriedAfter = countAmmo(p, b.ammoId);
                const levelAfter = ((((v.ammoCraft || {})[vid] || {})[b.ammoId]) || 1);
                if (carriedAfter !== b.carried || levelAfter !== b.level) {
                  makers.push({ vid: vid, ammoId: b.ammoId, carriedBefore: b.carried,
                    carriedAfter: carriedAfter, levelBefore: b.level, levelAfter: levelAfter });
                }
              } catch (e2) {}
            }
          } catch (e) {}
          homeCraftRows.push({ seq: seq, day: day, batchesMade: (ret | 0),
            pileFiberBefore: pileFiberBefore, pileFiberAfter: pileFiberAfter, makers: makers });
        } catch (e) { errors.push('home-post: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('villagerAmmoCraftDay-wrap: not a function');
  } catch (e) { errors.push('villagerAmmoCraftDay-wrap-install: ' + String(e.message).slice(0, 80)); }

  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) {
            lastSnapDay = d;
            let pileFiber = null, pileStick = null, pileStone = null;
            try {
              const st = (Game.stashState) ? Game.stashState() : null;
              const mats = (st && st.materials) || {};
              pileFiber = (mats.fiber | 0); pileStick = (mats.stick | 0); pileStone = (mats.stone | 0);
            } catch (e) {}
            dawnCensus.push({ seq: nextSeq(), day: d, pileFiber: pileFiber, pileStick: pileStick, pileStone: pileStone });
          }
        } catch (e) { errors.push('census: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });

  const st = Game.state || {};
  let scaleRank = null, unlocked = null, standing = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });
  return {
    seed: seed, arm: 'rollwall-a', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR,
    gameSha: GAME_SHA, bowopenPresent: BOWOPEN_PRESENT,
    speargatePresent: SPEARGATE_PRESENT, speargateOn: SPEARGATE_ON,
    depmatPresent: DEPMAT_PRESENT, depmatOn: DEPMAT_ON,
    roll35Present: ROLL35_PRESENT, roll35On: ROLL35_ON,
    ammoPresent: AMMO_PRESENT, ammoOn: AMMO_ON,
    fiberfetchPresent: FIBERFETCH_PRESENT, fiberfetchOn: FIBERFETCH_ON,
    bowknowOn: BOWKNOW_ON,
    senseexpedOn: SENSEEXPED_ON, sensePresent: SENSE_PRESENT,
    bowopenOn: BOWOPEN_ON,
    policySha: POLICY_SHA, policy: 'competent',
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    bowOpen: (st.village && st.village.bowOpen) ? JSON.parse(JSON.stringify(st.village.bowOpen)) : null,
    bowOpenByVid: (st.village && st.village.bowOpenByVid) ? JSON.parse(JSON.stringify(st.village.bowOpenByVid)) : null,
    vetSays: vetSays, sayCount: sayCount,
    instrumentErrors: errors,
    deaths: deaths,
    stageRows: stageRows,
    ammoRows: ammoRows,
    homeCraftRows: homeCraftRows,
    dawnCensus: dawnCensus,
  };
}

if (require.main === module) (async function () {
  if (MODE !== 'diag') { console.error('ROLLWALL STOP: MODE must be diag, got ' + JSON.stringify(MODE)); process.exit(2); }
  if (!SENSE_PRESENT) { console.error('ROLLWALL STOP: SENSEEXPED sense must be present in src/js/party-wiring.js (substrate).'); process.exit(2); }
  if (!SENSEEXPED_ON) { console.error('ROLLWALL STOP: SENSEEXPED=1 required (substrate).'); process.exit(2); }
  if (!BOWOPEN_PRESENT) { console.error('ROLLWALL STOP: villagerStageBow must be present in src/js/game.js (substrate).'); process.exit(2); }
  if (!BOWOPEN_ON) { console.error('ROLLWALL STOP: BOWOPEN=1 required (substrate).'); process.exit(2); }
  if (!SPEARGATE_PRESENT) { console.error('ROLLWALL STOP: SPEARGATE fix must be present in src/js/game.js.'); process.exit(2); }
  if (!SPEARGATE_ON) { console.error('ROLLWALL STOP: SPEARGATE=1 required (substrate).'); process.exit(2); }
  if (!DEPMAT_PRESENT) { console.error('ROLLWALL STOP: DEPMAT trailhead bundle must be present in src/js/game.js (substrate).'); process.exit(2); }
  if (!DEPMAT_ON) { console.error('ROLLWALL STOP: DEPMAT=1 required (substrate).'); process.exit(2); }
  if (!ROLL35_PRESENT) { console.error('ROLLWALL STOP: ROLL35 learned rate must be present in src/js/game.js (substrate).'); process.exit(2); }
  if (!ROLL35_ON) { console.error('ROLLWALL STOP: ROLL35=1 required (substrate).'); process.exit(2); }
  if (!AMMO_PRESENT) { console.error('ROLLWALL STOP: AMMO served-bow quiver must be present in src/js/game.js (substrate).'); process.exit(2); }
  if (!AMMO_ON) { console.error('ROLLWALL STOP: AMMO=1 required (substrate).'); process.exit(2); }
  if (FIBERFETCH_PRESENT) { console.error('ROLLWALL STOP: FIBERFETCH must NOT be present in src/js/game.js (concept-dead, not re-landed).'); process.exit(2); }
  if (FIBERFETCH_ON) { console.error('ROLLWALL STOP: FIBERFETCH must be unset (concept-dead).'); process.exit(2); }
  if (BOWKNOW_ON) { console.error('ROLLWALL STOP: BOWKNOW must be unset (substrate).'); process.exit(2); }
  if (process.env.DEPARTSEE === '1') { console.error('ROLLWALL STOP: DEPARTSEE must be unset (substrate).'); process.exit(2); }
  if (process.env.EVADEOBS === '1') { console.error('ROLLWALL STOP: EVADEOBS must be unset (substrate).'); process.exit(2); }
  if (process.env.VETREENGAGE !== '1') { console.error('ROLLWALL STOP: VETREENGAGE=1 required (substrate).'); process.exit(2); }
  if (process.env.PARTYSIZE4 !== '1') { console.error('ROLLWALL STOP: PARTYSIZE4=1 required (substrate).'); process.exit(2); }
  if (process.env.FLEEREPAIR2 !== '1') { console.error('ROLLWALL STOP: FLEEREPAIR2=1 required (substrate).'); process.exit(2); }
  if (process.env.FIGHTALLY2 !== '1') { console.error('ROLLWALL STOP: FIGHTALLY2=1 required (substrate).'); process.exit(2); }
  if (!SEEDS.length) { console.error('ROLLWALL STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-21', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'rollwall-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('ROLLWALL STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  let lostSeeds = [];
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'rollwall-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    const saved = writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    if (!saved) { lostSeeds.push(seed); console.error('ROLLWALL: write failed for seed ' + seed + ' (flap?) — corpus missing, re-run this seed.'); continue; }
    console.log('ROLLWALL seed ' + seed + ': days=' + out.days + ' end=' + out.endReason + ' maxWave=' + out.maxWave + ' stageRows=' + out.stageRows.length + ' ammoRows=' + out.ammoRows.length + ' homeCraftRows=' + out.homeCraftRows.length + ' errors=' + out.instrumentErrors.length);
  }
  if (lostSeeds.length) { console.error('ROLLWALL: lost seeds: ' + lostSeeds.join(',')); process.exit(4); }
  console.log('ROLLWALL done.');
})().catch(function (e) { console.error('ROLLWALL FATAL: ' + (e && e.stack || e)); process.exit(1); });

module.exports = { oneRun: oneRun, deriveFailReason: deriveFailReason, countMat: countMat, countAmmo: countAmmo, callPath: callPath };
