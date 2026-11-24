// gunholder-census-driver-b.js — CENSUS driver, arm sim-gunholder-census-b
// A neutral recorder: what do villagers holding a LOADED gun (searcaster
// equipped + fusion cells > 0) actually do with it — fights faced by wave,
// pick/role, and fire decisions. Pure diagnostic: ONE leg (MODE=arm, the
// rearm substrate with REARM_CELLS=1 live), no before/after, no game-code
// change. Reuses scripts/killlootbundle-driver-a.js exports (gun census,
// kit readers, staging) — reuse, don't rebuild.
//   Wraps (pure reads + driver-local writes; every game function runs
//   exactly once, untouched):
//     fieldFight — EVERY call: lead vid, allyVids, monster wave/id,
//       outcome, rec.volley (may be null), pre-call lead ranged kit
//       (rwId + ammo), rec.allyVid/ally2Vid/ally3Vid (who actually
//       joined), intent, rounds, vTaken, calledHelp.
//     resolveWildMonsterEncounter — pre-call wild-node candidates
//       (npcsOnNode filtered to roster), picked vid, monster wave/id,
//       avoided flag, raid flag. (The fieldFight wrap fires inside
//       it too; the two records link by day + vid + mid.)
//     villagerRearmFromCorpse / alienLootGrant / villagerKillLoot
//       (with STAGE_SEAR staging) / _corpseTakeStack / registerDeath
//       — copied from killlootbundle-driver-a.js with attribution
//       (grant / take / supply-corpse rows; custody retracing).
//   Daily census: FULL gun-location census (gunLocationsOf) + pack
//   cells for vids holding a searcaster anywhere (carried-loaded
//   side table + custody retracing).
// Substrate (this leg): VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1
// FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1
// KILLBUNDLE=1 STAGE_SEAR=1 REARM_CELLS=1; LEND unset, PRESENCE unset.
// Fresh band 107750-107757 (see the sim-gunholder-census-b prereg).
// Horizon 150d death-aware. Competent verbatim policy. ONE process,
// seeds sequential — never parallel drivers (2026-11-24 ~04:22Z OOM).
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 KILLBUNDLE=1 STAGE_SEAR=1 REARM_CELLS=1 MODE=arm OUTDIR=perseed-gunholder-census-b SEEDS=107750,107751 RUN=gunholder-census-b node scripts/gunholder-census-driver-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const kb = require(path.join(REPO, 'scripts', 'killlootbundle-driver-a'));
const gunLocationsOf = kb.gunLocationsOf;
const rangedKitOf = kb.rangedKitOf;
const countItemIn = kb.countItemIn;
const cellCountIn = kb.cellCountIn;
const stageFirstKillLoot = kb.stageFirstKillLoot;
const snapshotGunCells = kb.snapshotGunCells;
const diffGunCells = kb.diffGunCells;
const gday = kb.gday;
const classifyGrantCaller = kb.classifyGrantCaller;
const grantRecipientOf = kb.grantRecipientOf;
const firstCallerFrame = kb.firstCallerFrame;

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'gunholder-census-b';
const MODE = process.env.MODE || 'arm';
const OUTDIR = process.env.OUTDIR || ('perseed-gunholder-census-b');
const RECORDER_ON = process.env.LAUNCHPARTY_RECORDER !== 'off';

const SENSEEXPED_ON = process.env.SENSEEXPED === '1';
const BOWOPEN_ON = process.env.BOWOPEN === '1';
const FIGHTALLY2_ON = process.env.FIGHTALLY2 === '1';
const SPEARGATE_ON = process.env.SPEARGATE === '1';
const GUNRATE_ON = process.env.GUNRATE === '1';
const CELLGATE_ON = process.env.CELLGATE === '1';
const CELLGATE_FLOOR = (function () {
  try { const f = parseInt(process.env.CELLGATE_FLOOR, 10); return (f >= 1 && f <= 5) ? f : 4; } catch (e) { return 4; }
})();
const KILLBUNDLE_ON = process.env.KILLBUNDLE === '1';
const STAGE_SEAR_ON = process.env.STAGE_SEAR === '1';
const REARM_ON = process.env.REARM_CELLS === '1';
const LEND_ON = process.env.LEND === '1';
let GUNRATE_PRESENT = false;
try {
  const gameSrc2 = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  const contestsSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'contests.js'), 'utf8');
  GUNRATE_PRESENT = /GUNRATE/.test(gameSrc2) && /searcaster/.test(gameSrc2)
    && /GUNRATE/.test(contestsSrc) && /_gunRateFighter/.test(contestsSrc);
} catch (e) {}
let CELLGATE_PRESENT = false;
try {
  const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
  CELLGATE_PRESENT = /CELLGATE/.test(ffSrc) && /holds the Searcaster/.test(ffSrc);
} catch (e) {}
let KILLBUNDLE_PRESENT = false;
try {
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  const m = gameSrc.match(/villagerKillLoot\(vid, mdef\) \{([\s\S]*?)\n    \},/);
  KILLBUNDLE_PRESENT = !!(m && /KILLBUNDLE/.test(m[1]) && /fusion_cell/.test(m[1]));
} catch (e) {}
let REARM_PRESENT = false;
try {
  const corpsesSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'corpses.js'), 'utf8');
  REARM_PRESENT = /REARM_CELLS/.test(corpsesSrc) && /villagerRearmFromCorpse/.test(corpsesSrc)
    && /villagerRearmWitnessTake/.test(corpsesSrc) && /villagerRearmHavenSweep/.test(corpsesSrc)
    && /villagerRearmExpeditionStep/.test(corpsesSrc);
} catch (e) {}
let LEND_PRESENT = false;
try {
  const gameSrc3 = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  LEND_PRESENT = /_lendSearcaster/.test(gameSrc3) && /_returnLentSearcaster/.test(gameSrc3)
    && /resolveWildMonsterEncounter/.test(gameSrc3);
} catch (e) {}
let SENSE_PRESENT = false;
try {
  const wiringSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'party-wiring.js'), 'utf8');
  SENSE_PRESENT = wiringSrc.indexOf('SENSEEXPED') !== -1;
} catch (e) {}

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12); } catch (e) {}
let GAME_SHA = 'unknown';
try { GAME_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8')).digest('hex').slice(0, 12); } catch (e) {}

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

// Pack cells for vids holding a searcaster anywhere (equipped, carried,
// stashed): the carried-loaded side table + custody retracing. The
// gunLocationsOf census records cells only for equipped guns, so a
// holder who keeps cells in the pack while the gun sits elsewhere
// would otherwise be invisible.
function packCellsByVid(Game) {
  const out = {};
  try {
    const scholarVid = Game.villagerId || null;
    for (const p of ((Game.data && Game.data.villagers) || [])) {
      if (!p || !p.id || p.id === scholarVid) continue;
      const guns = countItemIn(p.items, 'searcaster');
      if (guns <= 0) continue;
      out[p.id] = { guns: guns, cells: cellCountIn(p.items, 'fusion_cell') };
    }
  } catch (e) {}
  return out;
}

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'launchparty-' + MODE, fullTelemetry: false });
  const errors = [];
  const contestEvents = [];
  const prizeEvents = [];
  const grantEvents = [];
  const corpseTakeEvents = [];
  const killLootEvents = [];
  const volleyEvents = [];
  const rearmTakeEvents = [];
  const supplyCorpseRows = [];
  const gunLocRows = [];
  const fightEvents = [];
  const encounterEvents = [];
  let lastSnapDay = -1;
  let prizeSeq = 0;

  function wrapGame(name, fn) {
    try {
      const orig = Game[name];
      if (RECORDER_ON && typeof orig === 'function') {
        Game[name] = fn(orig);
      } else if (RECORDER_ON) errors.push(name + '-wrap: not a function');
    } catch (e) { errors.push(name + '-wrap-install: ' + String(e.message).slice(0, 80)); }
  }
  wrapGame('fireContest', function (orig) {
    return function (contest) {
      let eligibleN = null;
      try { const el = this.contestEligible ? this.contestEligible() : null; eligibleN = el ? (el.eligible || []).length : null; } catch (e) {}
      const ret = orig.apply(this, arguments);
      try {
        contestEvents.push({ day: gday(Game), contestId: (contest && contest.id) || null,
          risk: (contest && contest.risk) || null, variant: (contest && contest.variant) || null,
          eligibleN: eligibleN, fired: (eligibleN == null ? null : eligibleN > 0) });
      } catch (e) { errors.push('contest-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('_cxItemPrize', function (orig) {
    return function (ac, contest, who) {
      const mySeq = ++prizeSeq;
      let before = null, predictedFighter = null, wave = null;
      try { before = snapshotGunCells(this); } catch (e) {}
      try { if (GUNRATE_ON && this._gunRateFighter) predictedFighter = this._gunRateFighter(); } catch (e) {}
      try { wave = this.unlockedWave ? this.unlockedWave() : null; } catch (e) {}
      let ret = null;
      try { ret = orig.apply(this, arguments); }
      finally {}
      try {
        let after = null, gains = [];
        try { after = snapshotGunCells(this); gains = diffGunCells(before, after); } catch (e) {}
        prizeEvents.push({ seq: mySeq, day: gday(Game), who: who || null,
          contestId: (contest && contest.id) || null, risk: (contest && contest.risk) || null,
          variant: (ac && ac.variant) || null, wave: wave,
          predictedFighter: predictedFighter, granted: !!ret, gains: gains });
      } catch (e) { errors.push('prize-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('alienLootGrant', function (orig) {
    return function (itemId, toCorpse) {
      const ret = orig.apply(this, arguments);
      try {
        const rec = grantRecipientOf(this, toCorpse);
        let caller = 'other', frame = null;
        try {
          const st = (new Error('gunholder-census-grant-caller')).stack || '';
          caller = classifyGrantCaller(st);
          frame = firstCallerFrame(st);
        } catch (e) { frame = null; }
        grantEvents.push({ day: gday(Game), itemId: itemId || null,
          toKind: rec.toKind, toVid: rec.toVid, caller: caller, frame: frame });
      } catch (e) { errors.push('grant-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('villagerKillLoot', function (orig) {
    const inner = STAGE_SEAR_ON ? stageFirstKillLoot(orig) : orig;
    return function (vid, mdef) {
      let before = null;
      try { before = snapshotGunCells(this); } catch (e) {}
      const dropId = inner.apply(this, arguments);
      try {
        let after = null, gains = [];
        try { after = snapshotGunCells(this); gains = diffGunCells(before, after); } catch (e) {}
        if (dropId) {
          killLootEvents.push({ day: gday(Game), vid: vid || null, dropId: dropId,
            kind: (dropId === 'fusion_cell' || dropId === 'searcaster') ? 'cell-or-gun' : 'other',
            gains: gains });
        }
      } catch (e) { errors.push('kill-loot-log: ' + String(e.message).slice(0, 80)); }
      return dropId;
    };
  });
  // Volleys: the fighter's pre-call equipped ranged weapon + rec.volley.
  // (Same shape as the killlootbundle driver; the full fight record lives
  // in fightEvents below — this array keeps the old volley analysis working.)
  wrapGame('fieldFight', function (orig) {
    return function (vid, mdef, m, opts) {
      let rwId = null, ammoN = null, cellsAtStart = null;
      let argMid = null, argWave = null;
      try {
        const person = this.getPerson ? this.getPerson(vid) : null;
        if (person) {
          const kit = rangedKitOf(this, person);
          rwId = kit.rwId;
          if (kit.ammoId) ammoN = countItemIn(person.items, kit.ammoId);
          cellsAtStart = cellCountIn(person.items, 'fusion_cell');
        }
      } catch (e) {}
      try {
        argMid = (mdef && mdef.id) || (m && m.id) || null;
        argWave = (mdef && mdef.wave) || (m && m.wave) || null;
        if (argWave == null && argMid) {
          const def = ((this.data && this.data.monsters) || []).find(function (x) { return x.id === argMid; });
          if (def) argWave = def.wave || null;
        }
      } catch (e) {}
      const allyVidsIn = (opts && opts.allyVids) ? opts.allyVids.slice() : [];
      const rec = orig.apply(this, arguments);
      try {
        const v = (rec && rec.volley) || null;
        if (v) {
          volleyEvents.push({ day: gday(Game), vid: vid || null, rwId: rwId,
            wave: argWave, mdefId: argMid,
            shots: v.shots || 0, hits: v.hits || 0, dmg: v.dmg || 0,
            ammoLeft: (v.ammoLeft != null ? v.ammoLeft : null) });
        }
        fightEvents.push({ day: gday(Game), vid: vid || null, rwId: rwId,
          ammoAtStart: ammoN, cellsAtStart: cellsAtStart,
          wave: argWave, mdefId: argMid,
          allyVids: allyVidsIn, allies: (opts && opts.allies) || 0,
          outcome: (rec && rec.outcome) || null,
          volley: v ? { shots: v.shots || 0, hits: v.hits || 0, dmg: v.dmg || 0,
            ammoLeft: (v.ammoLeft != null ? v.ammoLeft : null) } : null,
          allyVid: (rec && rec.allyVid) || null,
          ally2Vid: (rec && rec.ally2Vid) || null,
          ally3Vid: (rec && rec.ally3Vid) || null,
          intent: (rec && rec.intent) || null,
          rounds: (rec && rec.rounds) || 0,
          vTaken: (rec && rec.vTaken) || 0,
          calledHelp: !!(rec && rec.calledHelp) });
      } catch (e) { errors.push('fight-log: ' + String(e.message).slice(0, 80)); }
      return rec;
    };
  });
  // Wild picks: who was ON the monster's node (candidates), who got picked.
  wrapGame('resolveWildMonsterEncounter', function (orig) {
    return function (vid, m, opts) {
      let candidates = null;
      try {
        const roster = (((this.state || {}).village || {}).roster) || [];
        let here = [];
        try { here = this.npcsOnNode ? (this.npcsOnNode(m.tx, m.ty) || []) : []; } catch (e) { here = []; }
        candidates = here.filter(function (id) {
          if (roster.indexOf(id) < 0) return false;
          try { if (this.isSheltered && this.isSheltered(id)) return false; } catch (e) {}
          try { if (this.isPostFleeResting && this.isPostFleeResting(id)) return false; } catch (e) {}
          return true;
        }.bind(this));
      } catch (e) { candidates = null; }
      const ret = orig.apply(this, arguments);
      try {
        let mid = null, wave = null;
        try {
          mid = (m && m.id) || null;
          const def = mid ? (((this.data && this.data.monsters) || []).find(function (x) { return x.id === mid; })) : null;
          wave = (def && def.wave) || null;
        } catch (e) {}
        encounterEvents.push({ day: gday(Game), vid: vid || null, mid: mid, wave: wave,
          candidates: candidates, raid: !!((opts || {}).raid),
          avoided: !!(ret && ret.avoided), avoidReason: (ret && ret.reason) || null,
          retOutcome: (ret && ret.outcome) || null });
      } catch (e) { errors.push('encounter-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('_corpseTakeStack', function (orig) {
    return function (c, it) {
      const ret = orig.apply(this, arguments);
      try {
        corpseTakeEvents.push({ day: gday(Game),
          itemId: (it && (it.itemId || it.plantId)) || null,
          corpseId: (c && c.id) || null, corpseVid: (c && c.villagerId) || null, toKind: 'scholar' });
      } catch (e) { errors.push('corpse-take-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('villagerRearmFromCorpse', function (orig) {
    return function (c, takerVid) {
      const ret = orig.apply(this, arguments);
      try {
        if (ret) {
          rearmTakeEvents.push({ day: gday(Game),
            taker: ret.taker || takerVid || null,
            corpseVid: ret.corpseVid || (c && c.villagerId) || null,
            corpseId: ret.corpseId || (c && c.id) || null,
            kind: ret.kind || null, gun: !!ret.gun, cells: ret.cells || 0,
            channel: ret.channel || 'direct' });
        }
      } catch (e) { errors.push('rearm-take-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('registerDeath', function (orig) {
    return function (opts) {
      const ret = orig.apply(this, arguments);
      try {
        if (ret && (ret.kind === 'person' || ret.kind === 'villager' || !!ret.villagerId)) {
          const cells = countItemIn(ret.items, 'fusion_cell');
          if (cells > 0 && ret.node) {
            supplyCorpseRows.push({ day: gday(Game),
              corpseVid: ret.villagerId || null, corpseId: ret.id || null,
              node: { x: ret.node.x, y: ret.node.y }, cells: cells });
          }
        }
      } catch (e) { errors.push('supply-corpse-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });

  await setupGame(Game);
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) {
            lastSnapDay = d;
            if (RECORDER_ON) {
              try {
                const loc = gunLocationsOf(Game);
                gunLocRows.push({ day: d, locations: loc.locations, total: loc.total,
                  personFlags: loc.personFlags, packCells: packCellsByVid(Game) });
              } catch (e) { errors.push('gun-loc-census: ' + String(e.message).slice(0, 80)); }
            }
          }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  const havenNode = { x: (((st.village || {}).px != null) ? st.village.px : 4), y: (((st.village || {}).py != null) ? st.village.py : 4) };
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let pantryKcal = 0;
  try {
    pantryKcal = ((st.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * ((i.units == null) ? 1 : i.units); }, 0);
  } catch (e) {}

  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  const out = {
    seed: seed, arm: 'gunholder-census-b', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, gameSha: GAME_SHA,
    gunrateOn: GUNRATE_ON, gunratePresent: GUNRATE_PRESENT,
    cellgateOn: CELLGATE_ON, cellgatePresent: CELLGATE_PRESENT,
    cellgateFloor: CELLGATE_FLOOR,
    killbundleOn: KILLBUNDLE_ON, killbundlePresent: KILLBUNDLE_PRESENT,
    stageSearOn: STAGE_SEAR_ON,
    rearmOn: REARM_ON, rearmPresent: REARM_PRESENT,
    lendOn: LEND_ON, lendPresent: LEND_PRESENT,
    senseexpedOn: SENSEEXPED_ON, senseexpedPresent: SENSE_PRESENT,
    bowopenOn: BOWOPEN_ON, fightally2On: FIGHTALLY2_ON, speargateOn: SPEARGATE_ON,
    recorderOn: RECORDER_ON,
    policySha: POLICY_SHA, policy: 'competent',
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    instrumentErrors: errors,
    deaths: deaths,
    samples: result.samples || null,
    v4gunLoc: gunLocRows,
    contestEvents: contestEvents,
    prizeEvents: prizeEvents,
    grantEvents: grantEvents, corpseTakeEvents: corpseTakeEvents,
    killLootEvents: killLootEvents, volleyEvents: volleyEvents,
    rearmTakeEvents: rearmTakeEvents,
    supplyCorpseRows: supplyCorpseRows, havenNode: havenNode,
    fightEvents: fightEvents, encounterEvents: encounterEvents,
  };
  return out;
}

if (require.main === module) (async function () {
  if (MODE !== 'arm') { console.error('GUNHOLDER-CENSUS STOP: single-leg diagnostic, MODE must be arm, got ' + JSON.stringify(MODE)); process.exit(2); }
  if (!GUNRATE_ON) { console.error('GUNHOLDER-CENSUS STOP: GUNRATE=1 required (substrate).'); process.exit(2); }
  if (!CELLGATE_ON) { console.error('GUNHOLDER-CENSUS STOP: CELLGATE=1 required (substrate).'); process.exit(2); }
  if (process.env.CELLGATE_FLOOR !== undefined && process.env.CELLGATE_FLOOR !== '' && !(parseInt(process.env.CELLGATE_FLOOR, 10) >= 1 && parseInt(process.env.CELLGATE_FLOOR, 10) <= 5)) { console.error('GUNHOLDER-CENSUS STOP: CELLGATE_FLOOR must be an integer 1..5 when set (got ' + JSON.stringify(process.env.CELLGATE_FLOOR) + '); an invalid floor would silently fall back to 4.'); process.exit(2); }
  if (!KILLBUNDLE_ON) { console.error('GUNHOLDER-CENSUS STOP: KILLBUNDLE=1 required (substrate).'); process.exit(2); }
  if (!STAGE_SEAR_ON) { console.error('GUNHOLDER-CENSUS STOP: STAGE_SEAR=1 required (substrate).'); process.exit(2); }
  if (!REARM_ON) { console.error('GUNHOLDER-CENSUS STOP: REARM_CELLS=1 required (substrate).'); process.exit(2); }
  if (LEND_ON) { console.error('GUNHOLDER-CENSUS STOP: LEND must be unset.'); process.exit(2); }
  if (process.env.PRESENCE === '1') { console.error('GUNHOLDER-CENSUS STOP: PRESENCE must be unset.'); process.exit(2); }
  if (!GUNRATE_PRESENT) { console.error('GUNHOLDER-CENSUS STOP: the GUNRATE lever code must be present.'); process.exit(2); }
  if (!CELLGATE_PRESENT) { console.error('GUNHOLDER-CENSUS STOP: the CELLGATE gate code must be present.'); process.exit(2); }
  if (!KILLBUNDLE_PRESENT) { console.error('GUNHOLDER-CENSUS STOP: the KILLBUNDLE lever code (game.js villagerKillLoot) must be present.'); process.exit(2); }
  if (!REARM_PRESENT) { console.error('GUNHOLDER-CENSUS STOP: the REARM lever code (corpses.js villagerRearmFromCorpse + expedition step) must be present.'); process.exit(2); }
  if (!LEND_PRESENT) { console.error('GUNHOLDER-CENSUS STOP: the LEND lever code must be present.'); process.exit(2); }
  if (!SENSE_PRESENT) { console.error('GUNHOLDER-CENSUS STOP: the SENSEEXPED sense code must be present.'); process.exit(2); }
  if (!SENSEEXPED_ON) { console.error('GUNHOLDER-CENSUS STOP: SENSEEXPED=1 required (substrate).'); process.exit(2); }
  if (!BOWOPEN_ON) { console.error('GUNHOLDER-CENSUS STOP: BOWOPEN=1 required (substrate).'); process.exit(2); }
  if (!SPEARGATE_ON) { console.error('GUNHOLDER-CENSUS STOP: SPEARGATE=1 required (substrate).'); process.exit(2); }
  if (process.env.VETREENGAGE !== '1') { console.error('GUNHOLDER-CENSUS STOP: VETREENGAGE=1 required (substrate).'); process.exit(2); }
  if (process.env.PARTYSIZE4 !== '1') { console.error('GUNHOLDER-CENSUS STOP: PARTYSIZE4=1 required (substrate).'); process.exit(2); }
  if (process.env.FLEEREPAIR2 !== '1') { console.error('GUNHOLDER-CENSUS STOP: FLEEREPAIR2=1 required (substrate).'); process.exit(2); }
  if (process.env.FIGHTALLY2 !== '1') { console.error('GUNHOLDER-CENSUS STOP: FIGHTALLY2=1 required (substrate).'); process.exit(2); }
  if (!SEEDS.length) { console.error('GUNHOLDER-CENSUS STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-24', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'gunholder-census-b-s' + seed + '-' + RUN + '-arm.json');
    if (fs.existsSync(file)) { console.error('GUNHOLDER-CENSUS STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'gunholder-census-b-s' + seed + '-' + RUN + '-arm.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    const klSear = (out.killLootEvents || []).filter(function (e) { return e.dropId === 'searcaster'; }).length;
    const klBundled = (out.killLootEvents || []).filter(function (e) {
      return e.dropId === 'searcaster' && (e.gains || []).some(function (g) { return g.cellsGained === 2; });
    }).length;
    const searVolleys = (out.volleyEvents || []).filter(function (e) { return e.rwId === 'searcaster' && (e.shots || 0) > 0; }).length;
    let holderDays = 0;
    (out.v4gunLoc || []).forEach(function (row) {
      const seen = {};
      (row.locations || []).forEach(function (l) {
        if (l.loc === 'equipped' && l.vid && l.vid !== '__scholar__' && (l.cells || 0) > 0 && !seen[l.vid]) {
          seen[l.vid] = true; holderDays++;
        }
      });
    });
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      gameSha: out.gameSha, killbundleOn: out.killbundleOn, killbundlePresent: out.killbundlePresent,
      rearmOn: out.rearmOn, rearmPresent: out.rearmPresent,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      deaths: out.deaths.length,
      stageSearOn: out.stageSearOn,
      cellgateFloor: out.cellgateFloor,
      contests: out.contestEvents ? out.contestEvents.length : 0,
      prizeRolls: out.prizeEvents ? out.prizeEvents.length : 0,
      killLoot: out.killLootEvents ? out.killLootEvents.length : 0,
      klSearcaster: klSear, klBundled: klBundled,
      searVolleys: searVolleys,
      fightEvents: out.fightEvents ? out.fightEvents.length : 0,
      encounterEvents: out.encounterEvents ? out.encounterEvents.length : 0,
      corpseTakes: out.corpseTakeEvents ? out.corpseTakeEvents.length : 0,
      rearmTakes: out.rearmTakeEvents ? out.rearmTakeEvents.length : 0,
      gunLocRows: out.v4gunLoc ? out.v4gunLoc.length : 0,
      holderDays: holderDays,
      gunTotalEnd: out.v4gunLoc && out.v4gunLoc.length ? out.v4gunLoc[out.v4gunLoc.length - 1].total : null,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, packCellsByVid: packCellsByVid };
