// killlootbundle-driver-a.js — LEVER driver, arm sim-killlootbundle-a
// Tests the kill-loot searcaster bundle (KILLBUNDLE=1, game.js
// villagerKillLoot): a kill-loot searcaster arrives with the same 2-cell
// bundle a contest-prize gun gets. Adapted from scripts/grantrate-driver-a.js
// (same wraps + daily census + diff discipline) — reuse, don't rebuild.
//   Wraps (pure reads + driver-local writes; every game function runs
//   exactly once, untouched):
//     _cxItemPrize — contest prize rolls: pre/post snapshot diff finds
//       exactly who gained a gun and how many cells came with it.
//     villagerKillLoot — kill-loot drops: pre/post snapshot diff finds
//       the cells bundled at arrival (the bundle bypasses alienLootGrant).
//     fieldFight — volleys: the fighter's pre-call equipped ranged
//       weapon + rec.volley ({ shots, hits, dmg }); a searcaster volley
//       with shots > 0 is a fired gun.
//     alienLootGrant — grant events with caller taxonomy (attribution).
//     _corpseTakeStack — scholar corpse takes (kill-loot gun recovery).
//     fireContest — contests fired (denominator).
//   Daily census: FULL gun-location census (gunLocationsOf, copied from
//   the grantrate driver) — total guns + holder count + cells per
//   equipped gun per day, so holder-days with cells are visible.
//   TWO legs, ctl vs arm, identical seeds + substrate; only KILLBUNDLE
//   differs. Substrate env (both legs):
//   VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 +
//   SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1 + GUNRATE=1 + CELLGATE=1.
//   LEND unset, PRESENCE unset. Fresh band 107261-107268 (see the
//   sim-killlootbundle-a prereg). Horizon 150d death-aware. Competent
//   verbatim policy.
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=ctl OUTDIR=perseed-killlootbundle-a-ctl SEEDS=107261,107262 RUN=killlootbundle-a node scripts/killlootbundle-driver-a.js
//   (arm leg identical with MODE=arm + KILLBUNDLE=1)
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
const RUN = process.env.RUN || 'killlootbundle-a';
const MODE = process.env.MODE || 'ctl';
const OUTDIR = process.env.OUTDIR || ('perseed-killlootbundle-a-' + MODE);
const RECORDER_ON = process.env.LAUNCHPARTY_RECORDER !== 'off';

const SENSEEXPED_ON = process.env.SENSEEXPED === '1';
const BOWOPEN_ON = process.env.BOWOPEN === '1';
const FIGHTALLY2_ON = process.env.FIGHTALLY2 === '1';
const SPEARGATE_ON = process.env.SPEARGATE === '1';
const GUNRATE_ON = process.env.GUNRATE === '1';
const CELLGATE_ON = process.env.CELLGATE === '1';
const KILLBUNDLE_ON = process.env.KILLBUNDLE === '1';
const STAGE_SEAR_ON = process.env.STAGE_SEAR === '1';
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

// STAGE_SEAR (sim-killbundle-b): stage one armed arrival per seed —
// the first villagerKillLoot call's roll is forced to 'searcaster'
// (the natural roll is discarded), then rollAlienLoot is restored
// in a finally. Once-only per wrapper instance (one per seed, created
// in oneRun). Env-gated, arm-only; the natural loot stream is untouched
// after the first call. Exported for the arm proof test.
function stageFirstKillLoot(orig) {
  let forced = false;
  return function (vid, mdef) {
    if (forced) return orig.apply(this, arguments);
    forced = true;
    const origRoll = this.rollAlienLoot;
    try {
      this.rollAlienLoot = function () { return 'searcaster'; };
      return orig.apply(this, arguments);
    } finally { this.rollAlienLoot = origRoll; }
  };
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function itemIdOf(e) {
  if (!e) return null;
  if (typeof e === 'string') return e;
  return e.itemId || e.id || e.material || null;
}
function countItemIn(items, id) {
  let n = 0;
  try {
    for (const e of (items || [])) {
      if (itemIdOf(e) === id) n += (typeof e === 'string') ? 1 : ((e.units == null) ? 1 : e.units);
    }
  } catch (e) {}
  return n;
}
function cellCountIn(items, cellId) { return countItemIn(items, cellId || 'fusion_cell'); }
function rangedKitOf(Game, person) {
  try {
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    let rw = null;
    try { rw = (S.equipment && S.equipment.rangedWeaponOf) ? S.equipment.rangedWeaponOf(person, Game.data.items) : null; } catch (e) {}
    if (!rw) rw = (person.equipped || {}).ranged || null;
    if (!rw) return { rw: null, rwId: null, ammoId: null };
    const rwId = rw.itemId || rw.id || null;
    const def = (Game.data.items || []).find(function (d) { return d.id === rwId; });
    const ammoId = (def && def.weapon && def.weapon.ammo) || null;
    return { rw: rw, rwId: rwId, ammoId: ammoId };
  } catch (e) { return { rw: null, rwId: null, ammoId: null }; }
}
function firstCallerFrame(stack) {
  try {
    const lines = String(stack || '').split('\n').slice(1);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] || '';
      if (line.indexOf('killlootbundle-driver-a.js') !== -1) continue;
      if (line.indexOf('sim-harness') !== -1) continue;
      const m = line.match(/at\s+(?:[A-Za-z_$][\w$]*\.)?([A-Za-z_$][\w$]*)\s+\(([^)]+)\)/) ||
                line.match(/at\s+([^\s(]+)\s+\(([^)]+)\)/);
      if (!m) continue;
      return (m[1] || '?') + '@' + (m[2] || '?').split('/').slice(-2).join('/');
    }
    return null;
  } catch (e) { return null; }
}
function classifyGrantCaller(stack) {
  const st = String(stack || '');
  if (st.indexOf('_cxItemPrize') !== -1) return 'contest-prize';
  if (st.indexOf('_showVillagerEnd') !== -1 || st.indexOf('apWackyGift') !== -1) return 'show-gift';
  if (st.indexOf('betrayal') !== -1) return 'trade';
  if (st.indexOf('tbKillRewards') !== -1 || st.indexOf('corpseForKill') !== -1) return 'kill-loot-corpse';
  return 'other';
}
function grantRecipientOf(Game, toCorpse) {
  if (!toCorpse) return { toKind: 'scholar', toVid: null };
  if (toCorpse.items) {
    const id = toCorpse.id || null;
    let isPerson = false;
    try { isPerson = !!(id && Game.getPerson && Game.getPerson(id)); } catch (e) { isPerson = false; }
    if (isPerson) return { toKind: 'villager', toVid: id };
    return { toKind: 'corpse', toVid: id };
  }
  return { toKind: 'other', toVid: null };
}
// gunLocationsOf — copied from grantrate-driver-a.js (vanishcause
// provenance). Every searcaster in the world, one location each.
function gunLocationsOf(Game) {
  const locations = [];
  const personFlags = {};
  try {
    const st = Game.state || {};
    const scholarVid = Game.villagerId || null;
    const rosterSet = {};
    for (const r of (((st.village || {}).roster) || [])) rosterSet[r] = true;
    const people = (Game.data && Game.data.villagers) || [];
    for (const p of people) {
      if (!p || !p.id) continue;
      const vid = p.id;
      personFlags[vid] = { dead: !!p.dead, onRoster: !!rosterSet[vid] };
      if (vid === scholarVid) continue;
      let equippedGun = false, cells = 0;
      try {
        const kit = rangedKitOf(Game, p);
        if (kit.rwId === 'searcaster') {
          equippedGun = true;
          cells = cellCountIn(p.items, 'fusion_cell');
          locations.push({ loc: 'equipped', vid: vid, count: 1, cells: cells });
        }
      } catch (e) {}
      try {
        const inItems = countItemIn(p.items, 'searcaster');
        const carried = inItems - (equippedGun ? 1 : 0);
        if (carried > 0) locations.push({ loc: 'carried', vid: vid, count: carried });
      } catch (e) {}
      try {
        const inStash = countItemIn(p.stashed, 'searcaster');
        if (inStash > 0) locations.push({ loc: 'stashed', vid: vid, count: inStash });
      } catch (e) {}
    }
    try {
      const s = st.scholar || {};
      const inPack = countItemIn(s.inventory, 'searcaster');
      if (inPack > 0) locations.push({ loc: 'scholar-pack', vid: '__scholar__', count: inPack });
      const eq = s.equipped || {};
      for (const slot of Object.keys(eq)) {
        const e = eq[slot];
        if (e && itemIdOf(e) === 'searcaster') locations.push({ loc: 'scholar-equipped', vid: '__scholar__', slot: slot, count: 1 });
      }
    } catch (e) {}
    try {
      const stash = (Game.stashState) ? Game.stashState() : null;
      if (stash) {
        for (const sec of ['weapons', 'armor', 'tools', 'medicine']) {
          const n = countItemIn(stash[sec], 'searcaster');
          if (n > 0) locations.push({ loc: 'stash', section: sec, count: n });
        }
      }
    } catch (e) {}
    try {
      const corpses = (Game.corpses) ? Game.corpses() : (st.corpses || []);
      for (const c of (corpses || [])) {
        if (!c) continue;
        const n = countItemIn(c.items, 'searcaster');
        if (n > 0) locations.push({ loc: 'corpse', cid: c.id || null, cvid: c.villagerId || null, kind: c.kind || null, buried: !!c.buried, count: n });
      }
    } catch (e) {}
  } catch (e) {}
  let total = 0;
  for (const l of locations) total += l.count || 0;
  return { locations: locations, total: total, personFlags: personFlags };
}
function snapshotGunCells(Game) {
  const out = { scholar: { guns: 0, cells: 0 }, villagers: {} };
  try {
    const st = Game.state || {};
    const s = st.scholar || {};
    let guns = countItemIn(s.inventory, 'searcaster');
    const eq = s.equipped || {};
    for (const slot of Object.keys(eq)) if (eq[slot] && itemIdOf(eq[slot]) === 'searcaster') guns += 1;
    out.scholar = { guns: guns, cells: cellCountIn(s.inventory, 'fusion_cell') };
    const scholarVid = Game.villagerId || null;
    for (const p of ((Game.data && Game.data.villagers) || [])) {
      if (!p || !p.id || p.id === scholarVid) continue;
      out.villagers[p.id] = { guns: countItemIn(p.items, 'searcaster'), cells: cellCountIn(p.items, 'fusion_cell') };
    }
  } catch (e) {}
  return out;
}
function diffGunCells(before, after) {
  const out = [];
  try {
    const b = (before && before.scholar) || { guns: 0, cells: 0 };
    const a = (after && after.scholar) || { guns: 0, cells: 0 };
    if ((a.guns - b.guns) !== 0 || (a.cells - b.cells) !== 0) {
      out.push({ holder: '__scholar__', gunsGained: (a.guns - b.guns), cellsGained: (a.cells - b.cells), cellsAfter: a.cells });
    }
    const bv = (before && before.villagers) || {};
    const av = (after && after.villagers) || {};
    const ids = {};
    for (const k of Object.keys(bv)) ids[k] = true;
    for (const k of Object.keys(av)) ids[k] = true;
    for (const vid of Object.keys(ids).sort()) {
      const bb = bv[vid] || { guns: 0, cells: 0 };
      const aa = av[vid] || { guns: 0, cells: 0 };
      if ((aa.guns - bb.guns) !== 0 || (aa.cells - bb.cells) !== 0) {
        out.push({ holder: vid, gunsGained: (aa.guns - bb.guns), cellsGained: (aa.cells - bb.cells), cellsAfter: aa.cells });
      }
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
  const gunLocRows = [];
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
          const st = (new Error('killlootbundle-grant-caller')).stack || '';
          caller = classifyGrantCaller(st);
          frame = firstCallerFrame(st);
        } catch (e) { frame = null; }
        grantEvents.push({ day: gday(Game), itemId: itemId || null,
          toKind: rec.toKind, toVid: rec.toVid, caller: caller, frame: frame });
      } catch (e) { errors.push('grant-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  // Kill-loot drops: pre/post snapshot diff sees the bundle (it bypasses
  // alienLootGrant, so the grant wrap alone cannot see it). STAGE_SEAR
  // (sim-killbundle-b) routes the first call per seed through the staged
  // forcer so the seed carries exactly one guaranteed armed arrival.
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
  wrapGame('fieldFight', function (orig) {
    return function (vid, mdef, m, opts) {
      let rwId = null;
      try {
        const person = this.getPerson ? this.getPerson(vid) : null;
        if (person) rwId = rangedKitOf(this, person).rwId;
      } catch (e) {}
      const rec = orig.apply(this, arguments);
      try {
        const v = (rec && rec.volley) || null;
        if (v) {
          volleyEvents.push({ day: gday(Game), vid: vid || null, rwId: rwId,
            wave: (mdef && mdef.wave) || null, mdefId: (mdef && mdef.id) || null,
            shots: v.shots || 0, hits: v.hits || 0, dmg: v.dmg || 0,
            ammoLeft: (v.ammoLeft != null ? v.ammoLeft : null) });
        }
      } catch (e) { errors.push('volley-log: ' + String(e.message).slice(0, 80)); }
      return rec;
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
                gunLocRows.push({ day: d, locations: loc.locations, total: loc.total, personFlags: loc.personFlags });
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
    seed: seed, arm: 'killlootbundle-a', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, gameSha: GAME_SHA,
    gunrateOn: GUNRATE_ON, gunratePresent: GUNRATE_PRESENT,
    cellgateOn: CELLGATE_ON, cellgatePresent: CELLGATE_PRESENT,
    killbundleOn: KILLBUNDLE_ON, killbundlePresent: KILLBUNDLE_PRESENT,
    stageSearOn: STAGE_SEAR_ON,
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
  };
  return out;
}

if (require.main === module) (async function () {
  if (MODE !== 'ctl' && MODE !== 'arm') { console.error('KILLLOOTBUNDLE STOP: MODE must be ctl|arm, got ' + JSON.stringify(MODE)); process.exit(2); }
  if (!GUNRATE_ON) { console.error('KILLLOOTBUNDLE STOP: GUNRATE=1 required (substrate).'); process.exit(2); }
  if (!CELLGATE_ON) { console.error('KILLLOOTBUNDLE STOP: CELLGATE=1 required (substrate).'); process.exit(2); }
  if (MODE === 'arm' && !KILLBUNDLE_ON) { console.error('KILLLOOTBUNDLE STOP: arm leg requires KILLBUNDLE=1.'); process.exit(2); }
  if (STAGE_SEAR_ON && (MODE !== 'arm' || !KILLBUNDLE_ON)) { console.error('KILLLOOTBUNDLE STOP: STAGE_SEAR=1 requires MODE=arm + KILLBUNDLE=1.'); process.exit(2); }
  if (MODE === 'ctl' && KILLBUNDLE_ON) { console.error('KILLLOOTBUNDLE STOP: ctl leg requires KILLBUNDLE unset.'); process.exit(2); }
  if (LEND_ON) { console.error('KILLLOOTBUNDLE STOP: LEND must be unset.'); process.exit(2); }
  if (process.env.PRESENCE === '1') { console.error('KILLLOOTBUNDLE STOP: PRESENCE must be unset.'); process.exit(2); }
  if (!GUNRATE_PRESENT) { console.error('KILLLOOTBUNDLE STOP: the GUNRATE lever code must be present.'); process.exit(2); }
  if (!CELLGATE_PRESENT) { console.error('KILLLOOTBUNDLE STOP: the CELLGATE gate code must be present.'); process.exit(2); }
  if (!KILLBUNDLE_PRESENT) { console.error('KILLLOOTBUNDLE STOP: the KILLBUNDLE lever code (game.js villagerKillLoot) must be present.'); process.exit(2); }
  if (!LEND_PRESENT) { console.error('KILLLOOTBUNDLE STOP: the LEND lever code must be present.'); process.exit(2); }
  if (!SENSE_PRESENT) { console.error('KILLLOOTBUNDLE STOP: the SENSEEXPED sense code must be present.'); process.exit(2); }
  if (!SENSEEXPED_ON) { console.error('KILLLOOTBUNDLE STOP: SENSEEXPED=1 required (substrate).'); process.exit(2); }
  if (!BOWOPEN_ON) { console.error('KILLLOOTBUNDLE STOP: BOWOPEN=1 required (substrate).'); process.exit(2); }
  if (!SPEARGATE_ON) { console.error('KILLLOOTBUNDLE STOP: SPEARGATE=1 required (substrate).'); process.exit(2); }
  if (process.env.VETREENGAGE !== '1') { console.error('KILLLOOTBUNDLE STOP: VETREENGAGE=1 required (substrate).'); process.exit(2); }
  if (process.env.PARTYSIZE4 !== '1') { console.error('KILLLOOTBUNDLE STOP: PARTYSIZE4=1 required (substrate).'); process.exit(2); }
  if (process.env.FLEEREPAIR2 !== '1') { console.error('KILLLOOTBUNDLE STOP: FLEEREPAIR2=1 required (substrate).'); process.exit(2); }
  if (process.env.FIGHTALLY2 !== '1') { console.error('KILLLOOTBUNDLE STOP: FIGHTALLY2=1 required (substrate).'); process.exit(2); }
  if (!SEEDS.length) { console.error('KILLLOOTBUNDLE STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-21', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'killlootbundle-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('KILLLOOTBUNDLE STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'killlootbundle-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    const klSear = (out.killLootEvents || []).filter(function (e) { return e.dropId === 'searcaster'; }).length;
    const klBundled = (out.killLootEvents || []).filter(function (e) {
      return e.dropId === 'searcaster' && (e.gains || []).some(function (g) { return g.cellsGained === 2; });
    }).length;
    const searVolleys = (out.volleyEvents || []).filter(function (e) { return e.rwId === 'searcaster' && (e.shots || 0) > 0; }).length;
    const searGrants = (out.grantEvents || []).filter(function (e) { return e.itemId === 'searcaster'; }).length;
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      gameSha: out.gameSha, killbundleOn: out.killbundleOn, killbundlePresent: out.killbundlePresent,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      deaths: out.deaths.length,
      stageSearOn: out.stageSearOn,
      contests: out.contestEvents ? out.contestEvents.length : 0,
      prizeRolls: out.prizeEvents ? out.prizeEvents.length : 0,
      searGrants: searGrants,
      killLoot: out.killLootEvents ? out.killLootEvents.length : 0,
      klSearcaster: klSear, klBundled: klBundled,
      searVolleys: searVolleys,
      corpseTakes: out.corpseTakeEvents ? out.corpseTakeEvents.length : 0,
      gunLocRows: out.v4gunLoc ? out.v4gunLoc.length : 0,
      gunTotalEnd: out.v4gunLoc && out.v4gunLoc.length ? out.v4gunLoc[out.v4gunLoc.length - 1].total : null,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, gunLocationsOf: gunLocationsOf,
  stageFirstKillLoot: stageFirstKillLoot,
  classifyGrantCaller: classifyGrantCaller,
  grantRecipientOf: grantRecipientOf, firstCallerFrame: firstCallerFrame,
  snapshotGunCells: snapshotGunCells, diffGunCells: diffGunCells,
  rangedKitOf: rangedKitOf, countItemIn: countItemIn, cellCountIn: cellCountIn,
  itemIdOf: itemIdOf, gday: gday };
