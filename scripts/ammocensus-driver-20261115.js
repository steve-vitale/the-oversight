// ammocensus-driver-20261115.js — DIAG driver, arm sim-ammocensus-a
// (ammo census at wave-4 meetings). ONE leg on the instrument tip:
// the vetfirst T-class instrument (daily snapshots) PLUS the WAVE-4
// AMMO CENSUS RECORDER (wraps fieldFight wave-4 only and
// winPlanFightGate wave-4 only). Policy: competent verbatim
// (scripts/policies/competent.js), 150d death-aware.
// All recorder wraps are pure reads plus writes to driver-local
// arrays — no game-state writes, no RNG. No src/js/ file is touched.
// RECORDER=off installs no census wraps (the determinism leg).
// RECORDER ROWS (per seed, top-level w4meetings / w4gates): a meeting
// row is one fieldFight call vs a wave-4 monster: {day, vid, mid,
// wave, outcome, rounds, vTaken, mDealt, calledHelp, allyVid,
// volley, noArrowsLines, gate, fighter, allies[], calledAlly,
// log[]}. A gate row is one winPlanFightGate call vs a wave-4 mdef:
// {day, vid, mid, wave, result, reason, party, members[],
// gateAllArmed, ammoAwareAllArmed, overCounted, overCountedDryOnly}.
// A member classification: {vid, name, class, gateArmed,
// effectivelyArmed, rangedWeapon, ammoNeed, ammoN, otherAmmoN,
// meleeWeapon, spearInRangedSlot, carriesRangedUnequipped, error}.
// Usage:
//   SEEDS=100861,100862 DAYS=150 RUN=ammocensus-a OUTDIR=perseed-ammocensus-a node scripts/ammocensus-driver-20261115.js
//   RECORDER=off SEEDS=100861 DAYS=60 RUN=ammocensus-a-det OUTDIR=perseed-ammocensus-a-det-off node scripts/ammocensus-driver-20261115.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const VF = require(path.join(REPO, 'scripts', 'vetfirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'ammocensus-a';
const OUTDIR = process.env.OUTDIR || 'perseed-ammocensus-a';
const RECORDER = (process.env.RECORDER || 'on').toLowerCase();
if (RECORDER !== 'on' && RECORDER !== 'off') { console.error('AMMOCENSUS STOP: RECORDER must be on|off, got ' + JSON.stringify(RECORDER)); process.exit(2); }

// Wave-4 id set (frozen list from src/data/monsters.json, wave 4 —
// re-read live so the recorder refuses a stale roster silently).
const W4_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
function loadWave4Ids() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return W4_IDS_FROZEN.slice().sort(); }
}
const W4_SET = new Set(loadWave4Ids());

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12); } catch (e) {}
let STANDING_MARKER = false;
try { STANDING_MARKER = fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8').indexOf('ROSTER CHECK') !== -1; } catch (e) {}

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

// ---- ammo census classifier (pure reads) ----
// itemDef lookup over Game.data.items.
function defOf(Game, id) {
  try {
    const items = (Game.data && Game.data.items) || [];
    for (let i = 0; i < items.length; i++) if (items[i] && items[i].id === id) return items[i];
  } catch (e) {}
  return null;
}
function entryId(ent) {
  if (typeof ent === 'string') return ent;
  if (!ent) return null;
  return ent.itemId || ent.id || null;
}
function entryMaterial(ent) {
  if (!ent || typeof ent === 'string') return null;
  return ent.material || null;
}
function entryUnits(ent) {
  if (!ent) return 0;
  if (typeof ent === 'string') return 1;
  return ent.units || 1;
}
// All ammo ids known to the data: every weapon.ammo value plus every
// def with class 'ammo'.
function ammoIdSet(Game) {
  const set = {};
  try {
    const items = (Game.data && Game.data.items) || [];
    for (let i = 0; i < items.length; i++) {
      const d = items[i];
      if (!d) continue;
      if (d.weapon && d.weapon.ammo) set[d.weapon.ammo] = true;
      if (d.class === 'ammo') set[d.id] = true;
    }
  } catch (e) {}
  return set;
}
function countAmmo(Game, person, ammoId) {
  let n = 0;
  try {
    const items = person.items || [];
    for (let i = 0; i < items.length; i++) {
      const ent = items[i];
      if (entryId(ent) === ammoId || entryMaterial(ent) === ammoId) n += entryUnits(ent);
    }
  } catch (e) {}
  return n;
}
// gearOf replica (win-plan.js): armed iff melee weapon bonus > 0 OR
// carries any item with def.weapon. weaponBonusOf with no slot reads
// the MELEE slot only — replicated exactly.
function gateArmedOf(Game, person) {
  try {
    const eq = (person && person.equipped) || {};
    const meleeEnt = eq.melee || eq.weapon || null;
    let weaponB = 0;
    if (meleeEnt) {
      const d = defOf(Game, entryId(meleeEnt));
      weaponB = (d && d.weapon && d.weapon.bonus) || 0;
    }
    let carriesWeapon = false;
    const items = person.items || [];
    for (let i = 0; i < items.length; i++) {
      const d = defOf(Game, entryId(items[i]));
      if (d && d.weapon) { carriesWeapon = true; break; }
    }
    return { armed: !!(weaponB > 0 || carriesWeapon), weaponB: weaponB, carriesWeapon: carriesWeapon };
  } catch (e) { return { armed: false, weaponB: 0, carriesWeapon: false, error: String(e.message).slice(0, 60) }; }
}

// classifyFighter(Game, vid): the frozen classification. Pure reads.
// Returns {vid, name, class, gateArmed, effectivelyArmed,
// rangedWeapon, ammoNeed, ammoN, otherAmmoN, meleeWeapon,
// spearInRangedSlot, carriesRangedUnequipped, error}.
function classifyFighter(Game, vid) {
  const out = { vid: vid, name: null, class: 'unclassified', gateArmed: false,
    effectivelyArmed: false, rangedWeapon: null, ammoNeed: null, ammoN: 0,
    otherAmmoN: 0, meleeWeapon: null, spearInRangedSlot: false,
    carriesRangedUnequipped: null, error: null };
  try {
    let person = null;
    try { if (Game.getPerson) person = Game.getPerson(vid); } catch (e) {}
    if (!person) { try { if (Game.vpOf) person = Game.vpOf(vid); } catch (e) {} }
    if (!person) { out.error = 'no-person'; return out; }
    out.name = person.name || person.displayName || null;
    const eq = person.equipped || {};
    const ammoIds = ammoIdSet(Game);
    // Equipped ranged entry: a REAL ranged weapon has weapon.type
    // 'ranged' AND a weapon.ammo field. A spear in the ranged slot
    // (melee type, range 2, no ammo) is recorded, not counted.
    let rangedEnt = eq.ranged || null;
    let rangedDef = rangedEnt ? defOf(Game, entryId(rangedEnt)) : null;
    if (rangedDef && rangedDef.weapon && rangedDef.weapon.type === 'ranged' && rangedDef.weapon.ammo) {
      out.rangedWeapon = rangedDef.id;
      out.ammoNeed = rangedDef.weapon.ammo;
      out.ammoN = countAmmo(Game, person, rangedDef.weapon.ammo);
    } else if (rangedDef && rangedDef.weapon) {
      out.spearInRangedSlot = true;
      out.meleeWeapon = rangedDef.id;
    } else if (rangedEnt) {
      out.error = 'ranged-entry-no-def';
    }
    // Melee: equipped melee slot, else any carried melee-type weapon.
    if (!out.meleeWeapon) {
      const meleeEnt = eq.melee || eq.weapon || null;
      const meleeDef = meleeEnt ? defOf(Game, entryId(meleeEnt)) : null;
      if (meleeDef && meleeDef.weapon) out.meleeWeapon = meleeDef.id;
    }
    if (!out.meleeWeapon) {
      const items = person.items || [];
      for (let i = 0; i < items.length; i++) {
        const d = defOf(Game, entryId(items[i]));
        if (d && d.weapon && d.weapon.type !== 'ranged') { out.meleeWeapon = d.id; break; }
      }
    }
    // Carried-but-unequipped ranged weapon (gate counts pack weapons
    // as armed; the volley cannot fire them).
    const items = person.items || [];
    for (let i = 0; i < items.length; i++) {
      const d = defOf(Game, entryId(items[i]));
      if (d && d.weapon && d.weapon.type === 'ranged' && d.weapon.ammo && d.id !== out.rangedWeapon) {
        out.carriesRangedUnequipped = { id: d.id, ammoNeed: d.weapon.ammo, ammoN: countAmmo(Game, person, d.weapon.ammo) };
        break;
      }
    }
    // Other ammo on hand (the wrong-ammo shape): units of any ammo
    // id/class that is NOT the equipped weapon's need.
    let other = 0;
    for (let i = 0; i < items.length; i++) {
      const ent = items[i];
      const eid = entryId(ent);
      const mat = entryMaterial(ent);
      const d = eid ? defOf(Game, eid) : null;
      const isAmmo = !!(ammoIds[eid] || ammoIds[mat] || (d && d.class === 'ammo'));
      if (!isAmmo) continue;
      if (eid === out.ammoNeed || mat === out.ammoNeed) continue;
      other += entryUnits(ent);
    }
    out.otherAmmoN = other;
    // Gate-armed (replica) and effectively-armed (ammo-aware).
    const g = gateArmedOf(Game, person);
    out.gateArmed = !!g.armed;
    if (g.error) out.error = out.error || g.error;
    out.effectivelyArmed = !!(out.meleeWeapon || (out.rangedWeapon && out.ammoN >= 1));
    // Class.
    if (out.rangedWeapon) {
      out.class = out.ammoN >= 1 ? 'armed-with-ammo' : 'armed-no-ammo';
    } else {
      out.class = 'unarmed';
    }
    if (out.error) out.class = 'unclassified';
    return out;
  } catch (e) {
    out.error = String(e.message).slice(0, 80);
    out.class = 'unclassified';
    return out;
  }
}

// installRecorder(Game): wraps fieldFight + winPlanFightGate for
// wave-4 only. Returns {w4meetings, w4gates, errors, uninstall}.
function installRecorder(Game) {
  const w4meetings = [];
  const w4gates = [];
  const errors = [];
  const lastGateByVid = {};
  const wrapped = {};
  function waveOf(mdef) { try { return (mdef && mdef.wave) | 0; } catch (e) { return 0; } }
  try {
    const origGate = Game.winPlanFightGate;
    if (typeof origGate === 'function') {
      wrapped.winPlanFightGate = origGate;
      Game.winPlanFightGate = function (vid, mdef) {
        const ret = origGate.apply(this, arguments);
        try {
          const w = waveOf(mdef);
          if (w === 4 && mdef && mdef.id) {
            const party = (ret && ret.party) ? ret.party.slice() : [vid];
            const members = party.map(function (p) { return classifyFighter(Game, p); });
            let gateAllArmed = true, ammoAwareAllArmed = true;
            const overCounted = [], overCountedDryOnly = [];
            for (let i = 0; i < members.length; i++) {
              const m = members[i];
              if (!m.gateArmed) gateAllArmed = false;
              if (!m.effectivelyArmed) {
                ammoAwareAllArmed = false;
                if (m.gateArmed) {
                  overCounted.push(m.vid);
                  if (m.class === 'armed-no-ammo' && !m.meleeWeapon) overCountedDryOnly.push(m.vid);
                }
              }
            }
            const row = { day: gday(Game), vid: vid, mid: mdef.id, wave: w,
              result: ret ? (ret.avoid ? 'avoid' : (ret.seek ? 'seek' : 'other')) : 'null',
              reason: (ret && ret.reason) || null,
              party: party.slice(), members: members,
              gateAllArmed: gateAllArmed, ammoAwareAllArmed: ammoAwareAllArmed,
              overCounted: overCounted, overCountedDryOnly: overCountedDryOnly };
            w4gates.push(row);
            lastGateByVid[vid] = row;
          }
        } catch (e) { errors.push('w4gate-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('winPlanFightGate-wrap: not a function');
  } catch (e) { errors.push('winPlanFightGate-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origFF = Game.fieldFight;
    if (typeof origFF === 'function') {
      wrapped.fieldFight = origFF;
      Game.fieldFight = function (vid, mdef, m, opts) {
        const w = waveOf(mdef);
        const watch = w === 4 && mdef && mdef.id;
        let row = null;
        let fighterPre = null, alliesPre = [];
        if (watch) {
          try { fighterPre = classifyFighter(this, vid); } catch (e) { fighterPre = { vid: vid, class: 'unclassified', error: String(e.message).slice(0, 60) }; }
          try {
            const av = ((opts && opts.allyVids) || []).slice(0, 2);
            for (let i = 0; i < av.length; i++) alliesPre.push(classifyFighter(this, av[i]));
          } catch (e) { errors.push('w4meet-ally-pre: ' + String(e.message).slice(0, 80)); }
          const lg = lastGateByVid[vid] || null;
          row = { day: gday(Game), vid: vid, mid: mdef.id, wave: w,
            alliesN: (opts && opts.allies) | 0,
            allyVids: ((opts && opts.allyVids) || []).slice(0, 2),
            allyFromStart: !!(opts && opts.allyFromStart),
            gate: lg ? { result: lg.result, reason: lg.reason,
              party: lg.party.slice(), gateAllArmed: lg.gateAllArmed,
              ammoAwareAllArmed: lg.ammoAwareAllArmed,
              overCounted: lg.overCounted.slice(),
              overCountedDryOnly: lg.overCountedDryOnly.slice() } : null,
            outcome: null, rounds: null, vTaken: null, mDealt: null,
            calledHelp: null, allyVid: null,
            volley: null, noArrowsLines: [],
            fighter: fighterPre, allies: alliesPre, calledAlly: null, log: [] };
        }
        let rec = null;
        try { rec = origFF.apply(this, arguments); }
        finally { if (watch) { /* row closed below */ } }
        try {
          if (watch && row && rec) {
            row.outcome = rec.outcome || null;
            row.rounds = rec.rounds | 0;
            row.vTaken = rec.vTaken | 0;
            row.mDealt = rec.mDealt | 0;
            row.calledHelp = !!rec.calledHelp;
            row.allyVid = rec.allyVid || null;
            try { row.volley = rec.volley ? { shots: rec.volley.shots | 0, hits: rec.volley.hits | 0, dmg: rec.volley.dmg | 0, ammoLeft: rec.volley.ammoLeft } : null; } catch (e) { row.volley = null; }
            try {
              const lg2 = (rec.log || []).slice(0, 20).map(function (s) { return String(s).slice(0, 400); });
              row.log = lg2;
              for (let i = 0; i < lg2.length; i++) if (/but no arrows/.test(lg2[i])) row.noArrowsLines.push(lg2[i]);
            } catch (e) { row.log = []; }
            if (row.calledHelp && row.allyVid) {
              try { row.calledAlly = classifyFighter(this, row.allyVid); } catch (e) { row.calledAlly = { vid: row.allyVid, class: 'unclassified', error: String(e.message).slice(0, 60) }; }
            }
            w4meetings.push(row);
          } else if (watch) {
            errors.push('w4meet-log: fieldFight returned no record for ' + String(mdef && mdef.id));
          }
        } catch (e) { errors.push('w4meet-log: ' + String(e.message).slice(0, 80)); }
        return rec;
      };
    } else errors.push('fieldFight-wrap: not a function');
  } catch (e) { errors.push('fieldFight-wrap-install: ' + String(e.message).slice(0, 80)); }
  function uninstall() {
    Object.keys(wrapped).forEach(function (name) {
      try { Game[name] = wrapped[name]; } catch (e) { errors.push('uninstall-' + name + ': ' + String(e.message).slice(0, 80)); }
    });
  }
  return { w4meetings: w4meetings, w4gates: w4gates, errors: errors, uninstall: uninstall };
}

async function oneRun(seed, opts) {
  opts = opts || {};
  const recorderOn = opts.recorder !== 'off';
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'ammocensus-' + (recorderOn ? 'on' : 'off'), fullTelemetry: false });
  const errors = [];
  await setupGame(Game);
  let vf = null;
  vf = VF.install(Game);
  let rec = null;
  if (recorderOn) rec = installRecorder(Game);
  let lastSnapDay = -1;
  let lastCtx = null;

  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      lastCtx = ctx;
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (vf && d !== lastSnapDay) {
            lastSnapDay = d;
            vf.snapshot();
          }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });
  try { if (vf) vf.snapshot(); } catch (e) {}
  try { if (vf) vf.uninstall(); } catch (e) { errors.push('uninstall-vf: ' + String(e.message).slice(0, 80)); }
  try { if (rec) rec.uninstall(); } catch (e) { errors.push('uninstall-rec: ' + String(e.message).slice(0, 80)); }

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
  let ready4 = null, ready5 = null, ladderVets4 = null, winPlanStats = null;
  try { ready4 = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null; } catch (e) { errors.push('ready4: ' + String(e.message).slice(0, 80)); }
  try { ready5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { errors.push('ready5: ' + String(e.message).slice(0, 80)); }
  try { ladderVets4 = (typeof Game._ladderLivingVeterans === 'function') ? Game._ladderLivingVeterans(4) : null; } catch (e) { errors.push('ladderVets4: ' + String(e.message).slice(0, 80)); }
  try { winPlanStats = (typeof Game.winPlanStats === 'function') ? Game.winPlanStats() : null; } catch (e) { errors.push('winPlanStats: ' + String(e.message).slice(0, 80)); }

  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  const out = {
    seed: seed, arm: 'ammocensus-a', run: RUN, mode: recorderOn ? 'census' : 'det-off',
    anchorCommit: ANCHOR, standingMarker: STANDING_MARKER,
    policySha: POLICY_SHA, policy: 'competent', recorderOn: recorderOn,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    ready4: ready4, ready5: ready5, ladderVets4: ladderVets4,
    winPlanStats: winPlanStats,
    instrumentErrors: (vf ? vf.t.instrumentErrors : []).concat(errors).concat(rec ? rec.errors : []),
    deaths: deaths,
    samples: result.samples || null,
    w4meetings: rec ? rec.w4meetings : [], w4gates: rec ? rec.w4gates : [],
    wave4Ids: loadWave4Ids(),
  };
  if (vf) {
    out.killCalls = vf.t.killCalls;
    out.pyrrhicCalls = vf.t.pyrrhicCalls;
    out.casts = vf.t.casts;
    out.spawns = vf.t.spawns;
    out.fights = vf.t.fights;
    out.teleCounts = vf.t.teleCounts;
    out.teleRows = vf.t.teleRows;
    out.regDeaths = vf.t.deaths;
    out.daily = vf.t.daily;
    out.wrapLive = vf.t.wrapLive;
  }
  return out;
}

if (require.main === module) (async function () {
  if (!SEEDS.length) { console.error('AMMOCENSUS STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-15', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'ammocensus-a-s' + seed + '-' + RUN + '-' + (RECORDER === 'on' ? 'on' : 'off') + '.json');
    if (fs.existsSync(file)) { console.error('AMMOCENSUS STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed, { recorder: RECORDER });
    const file = path.join(outDir, 'ammocensus-a-s' + seed + '-' + RUN + '-' + (RECORDER === 'on' ? 'on' : 'off') + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, recorder: out.recorderOn ? 'on' : 'off',
      anchor: (out.anchorCommit || '').slice(0, 12),
      policySha: out.policySha, standingMarker: out.standingMarker,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      killCalls: out.killCalls ? out.killCalls.length : null,
      snapshots: out.daily ? out.daily.length : null,
      deaths: out.deaths.length,
      w4meetings: out.w4meetings.length, w4gates: out.w4gates.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, loadWave4Ids: loadWave4Ids, classifyFighter: classifyFighter, installRecorder: installRecorder, ammoIdSet: ammoIdSet, gateArmedOf: gateArmedOf };
