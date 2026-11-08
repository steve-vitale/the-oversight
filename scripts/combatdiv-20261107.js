// combatdiv-20261107.js — the combat-divergence driver
// (arm sim-combatdiv-b, run fleshout-loop-b-20261108T0013Z). DIAG, zero
// src/js. Replays the doorwalk BASELINE leg (policy
// competent-doorwalk-b, TAKESEAT_B=1, door drive off) on the frozen band
// 53001–53008 with the sitstep instrument, plus combat-divergence wraps
// that record EVERY fight in call order with the numbers that decide
// whether the gear-protection retune moved it: fighter HP before/after,
// worn armor protection at entry (the same S.equipment.armorOf helper
// the engine reads), weapon bonus at entry, and the returned record's
// outcome / rounds / vTaken / vHpLeft / mHpLeft / ally numbers / flee
// fields. Turn-based fights get per-fighter HP snapshots at entry and
// end. A daily HP map per villager catches HP divergence outside any
// fight. The narrative log is dropped (numbers only, last 2 lines kept
// for the sense-test). Pure reads + counting wraps only; zero
// game-state writes, zero RNG draws. Wraps never throw into game code.
// Usage:
//   DAYS=150 SEEDS=53001..53008 RUN=combatdiv-c1 OUTDIR=/tmp/... node scripts/combatdiv-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const STAGED = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const DOORWALK = require(path.join(REPO, 'scripts', 'policies', 'competent-doorwalk-b'));
const INST = require(path.join(REPO, 'scripts', 'sitstep-instrument-20261107'));

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
const RUN = process.env.RUN || 'combatdiv-c1';
if (!SEEDS.length) { console.error('COMBATDIV STOP: SEEDS required.'); process.exit(2); }
process.env.TAKESEAT_B = '1';
delete process.env.DOORWALK_B;
const policy = DOORWALK.doorwalk;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}
let ITEMS_SHA = null;
try { ITEMS_SHA = execSync('git hash-object src/data/items.json', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-07', 'perseed-combatdiv-b-' + RUN);
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'combatdiv-b-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('COMBATDIV STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function healthOf(Game, vid) {
  // The engine defaults a missing health entry to 100 (fieldFights.js:
  // vHp = (vv.health && vv.health[vid] !== undefined) ? ... : 100), so
  // the instrument reads the same default — never null for a real fighter.
  try {
    const h = ((Game.state || {}).village || {}).health || {};
    if (vid === 'p') vid = Game.villagerId;
    return (vid != null && h[vid] !== undefined) ? h[vid] : 100;
  } catch (e) { return null; }
}
function personOf(Game, vid) {
  try {
    if (vid === 'p') vid = Game.villagerId;
    const vs = (Game.data || {}).villagers || [];
    let p = vs.find(function (x) { return x && x.id === vid; });
    if (!p) p = ((Game.data || {}).background_survivors || []).find(function (x) { return x && x.id === vid; });
    return p || null;
  } catch (e) { return null; }
}
function personName(Game, vid) {
  try {
    const p = personOf(Game, vid);
    if (p && p.name) return String(p.name);
    if (p) return ((p.firstName || '') + ' ' + (p.lastName || '')).trim() || String(vid);
    return String(vid);
  } catch (e) { return String(vid); }
}
function equipNumbers(Game, vid) {
  // Mirror the engine's own reads: fieldFight computes varmor via
  // S.equipment.armorOf(vp, items) and wb from weaponBonusOf melee+ranged.
  const out = { varmor: null, wb: null };
  try {
    const g = (typeof globalThis !== 'undefined') ? globalThis : {};
    const S = g.S || ((g.Scattering || {}).S) || {};
    const p = personOf(Game, vid);
    if (p && S.equipment) {
      if (typeof S.equipment.armorOf === 'function') out.varmor = S.equipment.armorOf(p, Game.data.items) || 0;
      if (typeof S.equipment.weaponBonusOf === 'function') {
        out.wb = Math.round(((S.equipment.weaponBonusOf(p, Game.data.items, 'melee') || 0) +
          (S.equipment.weaponBonusOf(p, Game.data.items, 'ranged') || 0)) / 2);
      }
    }
  } catch (e) {}
  return out;
}
function waveOf(Game, mid) {
  try {
    const m = ((Game.data || {}).monsters || []).find(function (x) { return x && x.id === mid; });
    return (m && m.wave != null) ? (m.wave | 0) : null;
  } catch (e) { return null; }
}

async function oneRun(seed) {
  process.env.DOORWALK_SEED = String(seed);
  const { Game } = await loadGame({ seed: seed, mode: 'combatdiv-' + RUN, fullTelemetry: false });
  const deathSays = [];
  let sayCount = 0;
  const errors = [];
  // --- combat-divergence records (driver-owned; live outside the instrument).
  let gseq = 0;
  const fieldFights = [];
  const tbRows = [];
  let tbCurrent = null, tbCurrentFight = null, tbLastFight = null;
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (/dead|died|didn't come back|grave|buried|screams|starts digging|slain|is dead|veteran/i.test(arg) && deathSays.length < 400) deathSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;

  // --- daily HP snapshot: extend the instrument snapshot (doorwalk pattern).
  const origSnapshot = inst.snapshot;
  inst.snapshot = function () {
    const snap = origSnapshot();
    try {
      const hpById = {};
      const health = ((Game.state || {}).village || {}).health || {};
      ((Game.data || {}).villagers || []).forEach(function (p) {
        if (p && p.id && !p.dead) hpById[p.id] = (health[p.id] !== undefined) ? health[p.id] : 100;
      });
      ((Game.data || {}).background_survivors || []).forEach(function (p) {
        if (p && p.id && !p.dead && hpById[p.id] === undefined) hpById[p.id] = (health[p.id] !== undefined) ? health[p.id] : 100;
      });
      snap.hpById = hpById;
    } catch (e) { errors.push('snapshot-hp: ' + String(e.message).slice(0, 80)); }
    return snap;
  };

  // --- fieldFight wrap: rich per-fight row (installed after inst.install,
  // so it chains on top of the killerdeath wrap; uninstall drops it).
  const origField = Game.fieldFight;
  if (typeof origField === 'function') {
    Game.fieldFight = function (vid, mdef, m, opts) {
      let pre = null;
      try {
        const eq = equipNumbers(Game, vid);
        pre = { hpBefore: healthOf(Game, vid), varmor: eq.varmor, wb: eq.wb };
      } catch (e) { errors.push('field-pre: ' + String(e.message).slice(0, 80)); pre = { hpBefore: null, varmor: null, wb: null }; }
      let ret;
      try { ret = origField.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        gseq += 1;
        const mid = (mdef && mdef.id) || (m && m.id) || null;
        const rec = ret || {};
        // hpAfter: the health map when the engine wrote one (death may
        // clear the entry — then the record's own vHpLeft is authoritative).
        let hpAfter = null;
        try {
          const h = ((Game.state || {}).village || {}).health || {};
          const rv = (vid === 'p') ? Game.villagerId : vid;
          hpAfter = (rv != null && h[rv] !== undefined) ? h[rv] : ((rec.vHpLeft != null) ? rec.vHpLeft : null);
        } catch (e2) { hpAfter = (rec.vHpLeft != null) ? rec.vHpLeft : null; }
        let tailLog = null;
        try {
          if (rec.log && rec.log.length) tailLog = rec.log.slice(-2).map(function (l) { return String(l).slice(0, 200); });
        } catch (e2) {}
        fieldFights.push({
          gseq: gseq, channel: 'field', day: gday(Game),
          fighter: (vid === 'p') ? (Game.villagerId || 'p') : (vid || null),
          fighterName: personName(Game, vid),
          mid: mid, wave: waveOf(Game, mid),
          allies: (opts && opts.allies) | 0,
          hpBefore: pre ? pre.hpBefore : null, hpAfter: hpAfter,
          varmor: pre ? pre.varmor : null, wb: pre ? pre.wb : null,
          outcome: rec.outcome || rec.result || null, rounds: (rec.rounds | 0) || 0,
          vTaken: (rec.vTaken | 0) || 0, mDealt: (rec.mDealt | 0) || 0,
          // FIGHTLOOP-B (2026-11-08): raw (unmitigated) incoming totals the
          // morale read uses after the fix; null on unfixed code (fields
          // absent). Pure read, no state writes, no RNG draws.
          vTakenRaw: (rec.vTakenRaw != null) ? rec.vTakenRaw : null,
          allyTakenRaw: (rec.allyTakenRaw != null) ? rec.allyTakenRaw : null,
          vHpLeft: (rec.vHpLeft != null) ? rec.vHpLeft : null,
          mHpLeft: (rec.mHpLeft != null) ? rec.mHpLeft : null,
          allyDealt: (rec.allyDealt | 0) || 0, allyVid: rec.allyVid || null,
          fleeHopeless: !!rec.fleeHopeless, fleeHpFrac: (rec.fleeHpFrac != null) ? rec.fleeHpFrac : null,
          minHpFrac: (rec.minHpFrac != null) ? rec.minHpFrac : null,
          everWinning: !!rec.everWinning, everHopeless: !!rec.everHopeless,
          tailLog: tailLog,
        });
      } catch (e) { errors.push('field-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { errors.push('fieldFight-missing'); }

  // --- turn-based wraps: per-fighter HP at entry and end.
  function snapFighters(f) {
    const rows = [];
    try {
      (f.fighters || []).forEach(function (o) {
        if (!o) return;
        rows.push({ key: o.key || null, kind: o.kind || null, name: o.name || null,
          villagerId: o.villagerId || null, hp: (o.hp != null) ? o.hp : null,
          maxHp: (o.maxHp != null) ? o.maxHp : null,
          varmor: (o.varmor != null) ? o.varmor : null });
      });
    } catch (e) {}
    return rows;
  }
  const origStart = Game.startCombat;
  if (typeof origStart === 'function') {
    Game.startCombat = function () {
      const mid = arguments.length ? arguments[0] : null;
      let ret;
      try { ret = origStart.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        // Close a stale current row the same way the stageally instrument
        // does (fight dissolved without tbEnd): its outcome comes from
        // the fight object's own result.
        if (tbCurrent && tbCurrentFight && tbCurrentFight.over) {
          tbCurrent.outcome = tbCurrentFight.result != null ? String(tbCurrentFight.result) : 'dissolved';
          tbCurrent = null; tbCurrentFight = null;
        }
        const f = Game.tbfight;
        if (f && !f.over && f !== tbLastFight) {
          tbLastFight = f;
          gseq += 1;
          let scholarProt = null;
          try { scholarProt = (typeof Game.armorBonus === 'function') ? Game.armorBonus() : null; } catch (e2) {}
          const row = { gseq: gseq, channel: 'tb', day: gday(Game), mid: mid || null,
            wave: waveOf(Game, mid), scholarId: Game.villagerId || null,
            scholarProt: scholarProt,
            fightersBefore: snapFighters(f), fightersAfter: null,
            outcome: null, scholarDiedInFight: false };
          tbRows.push(row);
          tbCurrent = row; tbCurrentFight = f;
        }
      } catch (e) { errors.push('startCombat-tbrow: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { errors.push('startCombat-missing'); }
  const origTbEnd = Game.tbEnd;
  if (typeof origTbEnd === 'function') {
    Game.tbEnd = function (result) {
      const f0 = Game.tbfight;
      const row0 = tbCurrent;
      const isCurrent = !!(row0 && tbCurrentFight && f0 === tbCurrentFight);
      let ret;
      try { ret = origTbEnd.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        if (row0 && isCurrent) {
          row0.outcome = (result == null ? null : String(result));
          try { row0.fightersAfter = snapFighters(f0); } catch (e2) {}
          try {
            const p = (f0 && f0.fighters ? f0.fighters : []).find(function (o) { return o && o.key === 'p'; });
            if (p) row0.scholarHpFracEnd = +(((p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1)).toFixed(3));
          } catch (e2) {}
          try {
            let hp = 0, max = 0;
            (f0.fighters || []).forEach(function (o) {
              if (o && (o.kind === 'monster' || o.kind === 'hostile')) { hp += Math.max(0, o.hp || 0); max += Math.max(0, o.maxHp || o.hp || 0); }
            });
            if (max > 0) row0.monsterHpFracEnd = +(hp / max).toFixed(3);
          } catch (e2) {}
          try { row0.rounds = (f0 && f0.round != null) ? f0.round : null; } catch (e2) {}
          // Nested startCombat inside tbEnd already advanced tbCurrent to
          // the NEW fight: clear only pointers that still name THIS fight.
          if (tbCurrent === row0) tbCurrent = null;
          if (tbCurrentFight === f0) tbCurrentFight = null;
        }
      } catch (e) { errors.push('tbEnd-tbrow: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { errors.push('tbEnd-missing'); }
  // playerDeath chain-wrap: flag scholar-death-in-fight on the current TB row.
  const origPlayerDeath = Game.playerDeath;
  if (typeof origPlayerDeath === 'function') {
    Game.playerDeath = function () {
      let ret;
      try { ret = origPlayerDeath.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        if (tbCurrent && tbCurrentFight && Game.tbfight === tbCurrentFight) tbCurrent.scholarDiedInFight = true;
      } catch (e) { errors.push('playerDeath-tbflag: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { errors.push('playerDeath-missing'); }

  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  try { RALLY.resetBankkillerStats(); } catch (e) { errors.push('rally-reset: ' + String(e.message).slice(0, 80)); }
  try { STAGED.resetStageallyStats(); } catch (e) { errors.push('stageally-reset: ' + String(e.message).slice(0, 80)); }
  try { DOORWALK.resetLinkdriveStats(); } catch (e) { errors.push('linkdrive-reset: ' + String(e.message).slice(0, 80)); }
  try { DOORWALK.resetFeastdriveStats(); } catch (e) { errors.push('feastdrive-reset: ' + String(e.message).slice(0, 80)); }
  try { DOORWALK.resetTakeseatStats(); } catch (e) { errors.push('takeseat-reset: ' + String(e.message).slice(0, 80)); }
  try { DOORWALK.resetDoorwalkStats(); } catch (e) { errors.push('doorwalk-reset: ' + String(e.message).slice(0, 80)); }
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  let fin = null;
  try { fin = inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  let takeStats = null;
  try { takeStats = DOORWALK.takeseatStats(); } catch (e) { errors.push('takeseat-stats: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'combatdiv-b', run: RUN, policy: 'doorwalk-baseline',
    anchorCommit: ANCHOR, itemsSha: ITEMS_SHA,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive, scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
    tbFights: t.tbFights || [],
    fieldFights: fieldFights, tbRows: tbRows,
    takeseatStats: takeStats,
    deathSays: deathSays, sayCount: sayCount,
    waveKillLog: fin ? fin.waveKillLog : null, fallen: fin ? fin.fallen : null, wavesFaced: fin ? fin.wavesFaced : null,
    deadMap: fin ? fin.deadMap : null, endScholarId: fin ? fin.endScholarId : null,
    finalSeat: fin ? fin.finalSeat : null, finalFullShortfall: fin ? fin.finalFullShortfall : null,
    teleDeaths: (result.samples && result.samples.deaths) || null,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'combatdiv-b-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const ts = out.takeseatStats || {};
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      finalSeat: out.finalSeat ? out.finalSeat.seat : null,
      tsTaken: ts.seatTaken | 0, tsDay: ts.seatDay, tsKind: ts.seatKind,
      fieldFights: (out.fieldFights || []).length, tbRows: (out.tbRows || []).length,
      tbStageally: (out.tbFights || []).length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      snapshots: (out.daily || []).length, errors: out.instrumentErrors.length,
      itemsSha: out.itemsSha, file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
