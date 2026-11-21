// grantrate-driver-a.js — DIAG driver, arm sim-grantrate-a
// (finding #2635 follow-up, named by sim-vanishcause-a §6: 4 of 8
// pilot seeds see ZERO searcaster grants in 150 days, 5 grants in 8
// runs; the gun enters only through contest prizes. This arm measures
// the grant stream itself: grants per seed, grants per contest entered,
// the searcaster's weight in the contest prize table, cells per gun at
// grant, and second-chance behaviour — does a village that never wins
// a gun (or loses its first one) ever get another grant?
// NO game-code change: all recorders are driver wraps (pure reads +
// driver-local writes; every game function runs exactly once,
// untouched) + a daily pure-read census. Pattern: the vanishcause
// driver (wraps + daily census + diff), compact — this diag needs only
// the contest/grant funnel, the gun census, and wall fields.
//   The funnel, as the wraps see it:
//     fireContest(contest) — a contest is fired (entered).
//     _contestEnd(ac, outcome, prize) — each participant resolves;
//       only WINNERS get a prize roll.
//     _cxItemPrize(ac, contest, who) — the prize roll: chance 0.60
//       (0.75 hardened, +risk), tier capped at 3, tier 4 only for
//       extreme-risk + apex + a 25% roll (contests.js:201).
//     rollAlienLoot(mdef, fighter) — the shared loot table: tier-4
//       contest pool is 15 items, searcaster 1/15 unweighted, 4/18
//       with GUNRATE=1 (verified against live data in the prereg).
//     alienLootGrant(itemId, toCorpse) — the single shared grant path.
//       A player-won searcaster/fusion_cell is REDIRECTED to the
//       lead-weighted living villager (_gunRateFighter) and a
//       searcaster prize BUNDLES 2 fusion cells to the same recipient
//       (pushed direct to person.items, bypassing alienLootGrant — so
//       the _cxItemPrize wrap diffs the recipient's cells pre/post
//       instead of trusting the grant wrap).
//     villagerKillLoot + _corpseTakeStack — the kill-loot entry: a
//       searcaster drop lands on the monster's corpse until the
//       scholar takes it.
//   Daily census: FULL gun-location census (gunLocationsOf, copied
//   from the vanishcause driver) — total guns + holder count per day,
//   so loss days (gun total falls to 0 after >= 1) are visible for
//   the second-chance question.
//   TWO legs, IDENTICAL env (leg1/leg2): this is a diag with no
//   lever — the second leg is the instrument-neutrality proof for
//   the frozen guardrail (the balanced-panel compare runs leg1 ->
//   leg2; the honest result is no-material-signal everywhere).
//   Substrate env (both legs):
//   VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 +
//   SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1 + GUNRATE=1 + CELLGATE=1.
//   LEND unset, PRESENCE unset. Fresh band 107237-107244 (see the
//   sim-grantrate-a prereg). Horizon 150d death-aware. Competent
//   verbatim policy.
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=leg1 OUTDIR=perseed-grantrate-a-leg1 SEEDS=107237,107238 RUN=grantrate-a node scripts/grantrate-driver-a.js
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
const RUN = process.env.RUN || 'grantrate-a';
const MODE = process.env.MODE || 'leg1';
const OUTDIR = process.env.OUTDIR || ('perseed-grantrate-a-' + MODE);
const RECORDER_ON = process.env.LAUNCHPARTY_RECORDER !== 'off';

const SENSEEXPED_ON = process.env.SENSEEXPED === '1';
const BOWOPEN_ON = process.env.BOWOPEN === '1';
const FIGHTALLY2_ON = process.env.FIGHTALLY2 === '1';
const SPEARGATE_ON = process.env.SPEARGATE === '1';
const GUNRATE_ON = process.env.GUNRATE === '1';
const CELLGATE_ON = process.env.CELLGATE === '1';
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
      // units === 0 is a TAKEN stack, not a gun: _corpseTakeStack
      // (corpses.js:463) zeroes it.units instead of splicing the
      // entry out (vanishcause pilot catch: a taken gun read as still
      // on the corpse). Missing units still means one.
      if (itemIdOf(e) === id) n += (typeof e === 'string') ? 1 : ((e.units == null) ? 1 : e.units);
    }
  } catch (e) {}
  return n;
}
function ammoCountOf(items, ammoId) { return countItemIn(items, ammoId); }
function cellCountIn(items, cellId) { return ammoCountOf(items, cellId || 'fusion_cell'); }
// rangedKitOf — copied from vanishcause-driver-a.js (provenance: the
// gunrate/cellgate driver family). Reads the EQUIPPED ranged slot only.
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
// firstCallerFrame — copied from vanishcause-driver-a.js.
function firstCallerFrame(stack) {
  try {
    const lines = String(stack || '').split('\n').slice(1);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] || '';
      if (line.indexOf('grantrate-driver-a.js') !== -1) continue;
      if (line.indexOf('sim-harness') !== -1) continue;
      const m = line.match(/at\s+(?:[A-Za-z_$][\w$]*\.)?([A-Za-z_$][\w$]*)\s+\(([^)]+)\)/) ||
                line.match(/at\s+([^\s(]+)\s+\(([^)]+)\)/);
      if (!m) continue;
      return (m[1] || '?') + '@' + (m[2] || '?').split('/').slice(-2).join('/');
    }
    return null;
  } catch (e) { return null; }
}
// classifyGrantCaller / grantRecipientOf — copied from
// vanishcause-driver-a.js (provenance: the gunrate/cellgate driver
// family). The grant side of rollAlienLoot has four callers:
// contest prizes (_cxItemPrize), show gifts (_showVillagerEnd /
// apWackyGift), trade (betrayal.js), kill loot (corpseForKill ->
// alienLootGrant -> corpse).
function classifyGrantCaller(stack) {
  const st = String(stack || '');
  if (st.indexOf('_cxItemPrize') !== -1) return 'contest-prize';
  if (st.indexOf('_showVillagerEnd') !== -1 || st.indexOf('apWackyGift') !== -1) return 'show-gift';
  if (st.indexOf('betrayal') !== -1) return 'trade';
  if (st.indexOf('corpseForKill') !== -1) return 'kill-loot-corpse';
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
// classifyRollCaller(stack): the rollAlienLoot caller taxonomy —
// contest prizes go through _cxItemPrize; kill loot through
// villagerKillLoot / corpseForKill; anything else is 'other' with its
// first caller frame for audit. Pure string match, never game state.
function classifyRollCaller(stack) {
  const st = String(stack || '');
  if (st.indexOf('_cxItemPrize') !== -1) return 'contest-prize';
  if (st.indexOf('villagerKillLoot') !== -1 || st.indexOf('corpseForKill') !== -1) return 'kill-loot';
  return 'other';
}

// ---- GUN-LOCATION CENSUS (copied from vanishcause-driver-a.js) ----
// gunLocationsOf(Game): every searcaster in the world, one location
// each. A villager's equipped gun ALSO sits in their items (autoEquip
// builds equipped entries as copies over items — it never removes the
// entry), so "carried" counts items MINUS the equipped one: one gun,
// one location, never double-counted. The scholar is read ONLY from
// state.scholar.* (inventory + equipped) — the scholar's person record
// is not a second pack. Corpses are scanned buried or not (buryCorpse
// keeps items on the corpse object).
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

// ---- GRANT-DIFF SNAPSHOT ----
// snapshotGunCells(Game): searcaster count + fusion_cell units for the
// scholar (inventory + equipped slots — equip() splices out of
// inventory, so the two are mutually exclusive) and for every person
// in data.villagers (items — the equipped copy stays in items for
// villagers, so one count covers both). Pure reads. The _cxItemPrize
// wrap diffs two snapshots to find EXACTLY who gained a gun and how
// many cells came with it — the GUNRATE bundle bypasses
// alienLootGrant, so the grant wrap alone cannot see it.
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
// diffGunCells(before, after): the per-holder gains between two
// snapshots — [{ holder, gunsGained, cellsGained, cellsAfter }].
// A holder with no change is omitted. Pure function.
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
  // ---- event stores (driver-local writes only) ----
  const contestEvents = [];
  const contestEndEvents = [];
  const prizeEvents = [];
  const rollEvents = [];
  const grantEvents = [];
  const corpseTakeEvents = [];
  const killLootEvents = [];
  const gunLocRows = [];
  let lastSnapDay = -1;
  // Monotonic prize seq + the currently-open _cxItemPrize call, so a
  // rollAlienLoot row joins to the prize roll that contains it (the
  // roll is synchronous inside the prize call — save/restore is safe).
  let prizeSeq = 0;
  let prizeSeqCurrent = null;

  // ---- wraps (pure reads + driver-local writes; each game
  // function runs exactly once, untouched) ----
  function wrapGame(name, fn) {
    try {
      const orig = Game[name];
      if (RECORDER_ON && typeof orig === 'function') {
        Game[name] = fn(orig);
      } else if (RECORDER_ON) errors.push(name + '-wrap: not a function');
    } catch (e) { errors.push(name + '-wrap-install: ' + String(e.message).slice(0, 80)); }
  }
  // Contests fired: fireContest returns early with no eligible people
  // (no contest) — the wrap reads contestEligible pre-call so a
  // no-cast call is marked fired:false instead of counting as entered.
  wrapGame('fireContest', function (orig) {
    return function (contest) {
      let eligibleN = null;
      try { const el = this.contestEligible ? this.contestEligible() : null; eligibleN = el ? (el.eligible || []).length : null; } catch (e) {}
      const ret = orig.apply(this, arguments);
      try {
        contestEvents.push({ day: gday(Game), contestId: (contest && contest.id) || null,
          risk: (contest && contest.risk) || null, variant: (contest && contest.variant) || null,
          participantsData: (contest && contest.participants) || null,
          eligibleN: eligibleN, fired: (eligibleN == null ? null : eligibleN > 0), isPilot: !!(this.state && !this.state.pilotAired) });
      } catch (e) { errors.push('contest-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  // Contest resolutions: only winners get a prize roll.
  wrapGame('_contestEnd', function (orig) {
    return function (ac, outcome, prize) {
      const ret = orig.apply(this, arguments);
      try {
        contestEndEvents.push({ day: gday(Game), contestId: (ac && ac.contestId) || null,
          participant: (ac && ac.participant) || null, outcome: outcome || null,
          prize: !!prize, prizeId: (prize && (prize.id || prize.itemId)) || null });
      } catch (e) { errors.push('contestend-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  // The prize roll itself: pre/post snapshot diff finds EXACTLY who
  // gained a gun and how many cells came with it (the GUNRATE bundle
  // bypasses alienLootGrant). The predicted redirect target is read
  // pre-call (pure) so the analyzer can check the redirect picked the
  // diff recipient.
  wrapGame('_cxItemPrize', function (orig) {
    return function (ac, contest, who) {
      const mySeq = ++prizeSeq;
      let before = null, predictedFighter = null, wave = null, wins = null, favor = null;
      try { before = snapshotGunCells(this); } catch (e) {}
      try { if (GUNRATE_ON && this._gunRateFighter) predictedFighter = this._gunRateFighter(); } catch (e) {}
      try { wave = this.unlockedWave ? this.unlockedWave() : null; } catch (e) {}
      try { wins = (((this.state.notability || {})[who || 'player'] || {}).contestWin || 0); } catch (e) {}
      try { favor = this.apFavor ? this.apFavor() : null; } catch (e) {}
      const prevSeq = prizeSeqCurrent;
      prizeSeqCurrent = mySeq;
      let ret = null;
      try { ret = orig.apply(this, arguments); }
      finally { prizeSeqCurrent = prevSeq; }
      try {
        let after = null, gains = [];
        try { after = snapshotGunCells(this); gains = diffGunCells(before, after); } catch (e) {}
        prizeEvents.push({ seq: mySeq, day: gday(Game), who: who || null,
          contestId: (contest && contest.id) || null, risk: (contest && contest.risk) || null,
          variant: (ac && ac.variant) || null, wave: wave, wins: wins, favor: favor,
          predictedFighter: predictedFighter, granted: !!ret, gains: gains });
      } catch (e) { errors.push('prize-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  // Every loot-table roll: args (chance, tier, rewardSource) + result.
  // The enclosing prize seq joins a contest roll to its _cxItemPrize call.
  wrapGame('rollAlienLoot', function (orig) {
    return function (mdef, fighter) {
      const ret = orig.apply(this, arguments);
      try {
        let caller = 'other', frame = null;
        try {
          const st = (new Error('grantrate-roll-caller')).stack || '';
          caller = classifyRollCaller(st);
          frame = firstCallerFrame(st);
        } catch (e) { frame = null; }
        const loot = (mdef || {}).loot || {};
        rollEvents.push({ seq: prizeSeqCurrent, day: gday(Game),
          caller: caller, frame: frame,
          chance: (loot.chance != null ? loot.chance : null),
          tier: (loot.tier != null ? loot.tier : null),
          rewardSource: loot.rewardSource || null,
          wave: (mdef && mdef.wave) || null, mdefId: (mdef && mdef.id) || null,
          result: ret || null });
      } catch (e) { errors.push('roll-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  // Grants: the single shared path for kill loot AND contest/show
  // prizes AND trade (game.js alienLootGrant header).
  wrapGame('alienLootGrant', function (orig) {
    return function (itemId, toCorpse) {
      const ret = orig.apply(this, arguments);
      try {
        const rec = grantRecipientOf(this, toCorpse);
        let caller = 'other', frame = null;
        try {
          const st = (new Error('grantrate-grant-caller')).stack || '';
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
    return function (vid, mdef) {
      const dropId = orig.apply(this, arguments);
      try {
        if (dropId) {
          killLootEvents.push({ day: gday(Game), vid: vid || null, dropId: dropId,
            kind: (dropId === 'fusion_cell' || dropId === 'searcaster') ? 'cell-or-gun' : 'other' });
        }
      } catch (e) { errors.push('kill-loot-log: ' + String(e.message).slice(0, 80)); }
      return dropId;
    };
  });
  // Corpse takes: _corpseTakeStack is the choke point shared by
  // corpseTakeItem and corpseLootAll (scholar-only takes).
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
            // FULL gun-location census (pure reads).
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
    seed: seed, arm: 'grantrate-a', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, gameSha: GAME_SHA,
    gunrateOn: GUNRATE_ON, gunratePresent: GUNRATE_PRESENT,
    cellgateOn: CELLGATE_ON, cellgatePresent: CELLGATE_PRESENT,
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
    // GRANTRATE: the contest/grant funnel + the daily gun census.
    // The analyzer builds the per-seed funnel and the second-chance
    // answers (S1-S5) from these.
    v4gunLoc: gunLocRows,
    contestEvents: contestEvents, contestEndEvents: contestEndEvents,
    prizeEvents: prizeEvents, rollEvents: rollEvents,
    grantEvents: grantEvents, corpseTakeEvents: corpseTakeEvents,
    killLootEvents: killLootEvents,
  };
  return out;
}

if (require.main === module) (async function () {
  if (MODE !== 'leg1' && MODE !== 'leg2') { console.error('GRANTRATE STOP: MODE must be leg1|leg2, got ' + JSON.stringify(MODE)); process.exit(2); }
  if (!GUNRATE_ON) { console.error('GRANTRATE STOP: GUNRATE=1 required (rebuilt substrate).'); process.exit(2); }
  if (!CELLGATE_ON) { console.error('GRANTRATE STOP: CELLGATE=1 required (rebuilt substrate).'); process.exit(2); }
  if (LEND_ON) { console.error('GRANTRATE STOP: LEND must be unset — this arm diagnoses with the lend OFF.'); process.exit(2); }
  if (process.env.PRESENCE === '1') { console.error('GRANTRATE STOP: PRESENCE must be unset (reverted lever).'); process.exit(2); }
  if (!GUNRATE_PRESENT) { console.error('GRANTRATE STOP: the GUNRATE lever code (game.js + contests.js) must be present.'); process.exit(2); }
  if (!CELLGATE_PRESENT) { console.error('GRANTRATE STOP: the CELLGATE gate code (fieldFights.js) must be present.'); process.exit(2); }
  if (!LEND_PRESENT) { console.error('GRANTRATE STOP: the LEND lever code (game.js _lendSearcaster + _returnLentSearcaster) must be present.'); process.exit(2); }
  if (!SENSE_PRESENT) { console.error('GRANTRATE STOP: the SENSEEXPED sense code (party-wiring.js) must be present.'); process.exit(2); }
  if (!SENSEEXPED_ON) { console.error('GRANTRATE STOP: SENSEEXPED=1 required (substrate).'); process.exit(2); }
  if (!BOWOPEN_ON) { console.error('GRANTRATE STOP: BOWOPEN=1 required (substrate).'); process.exit(2); }
  if (!SPEARGATE_ON) { console.error('GRANTRATE STOP: SPEARGATE=1 required (substrate).'); process.exit(2); }
  if (process.env.VETREENGAGE !== '1') { console.error('GRANTRATE STOP: VETREENGAGE=1 required (substrate).'); process.exit(2); }
  if (process.env.PARTYSIZE4 !== '1') { console.error('GRANTRATE STOP: PARTYSIZE4=1 required (substrate).'); process.exit(2); }
  if (process.env.FLEEREPAIR2 !== '1') { console.error('GRANTRATE STOP: FLEEREPAIR2=1 required (substrate).'); process.exit(2); }
  if (process.env.FIGHTALLY2 !== '1') { console.error('GRANTRATE STOP: FIGHTALLY2=1 required (substrate).'); process.exit(2); }
  if (process.env.FUSIONCELL === '1') { console.error('GRANTRATE STOP: FUSIONCELL must be unset (reverted fix).'); process.exit(2); }
  if (process.env.SEARSUPPLY === '1') { console.error('GRANTRATE STOP: SEARSUPPLY must be unset (reverted lever).'); process.exit(2); }
  if (process.env.BOWCRAFT === '1') { console.error('GRANTRATE STOP: BOWCRAFT must be unset.'); process.exit(2); }
  if (!SEEDS.length) { console.error('GRANTRATE STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-21', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'grantrate-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('GRANTRATE STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'grantrate-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    const searGrants = (out.grantEvents || []).filter(function (e) { return e.itemId === 'searcaster'; }).length;
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      gameSha: out.gameSha, gunrateOn: out.gunrateOn, gunratePresent: out.gunratePresent,
      cellgateOn: out.cellgateOn, cellgatePresent: out.cellgatePresent,
      lendOn: out.lendOn, lendPresent: out.lendPresent,
      policySha: out.policySha, recorderOn: out.recorderOn,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      deaths: out.deaths.length,
      contests: out.contestEvents ? out.contestEvents.length : 0,
      contestEnds: out.contestEndEvents ? out.contestEndEvents.length : 0,
      prizeRolls: out.prizeEvents ? out.prizeEvents.length : 0,
      lootRolls: out.rollEvents ? out.rollEvents.length : 0,
      grants: out.grantEvents ? out.grantEvents.length : 0,
      searGrants: searGrants,
      killLoot: out.killLootEvents ? out.killLootEvents.length : 0,
      corpseTakes: out.corpseTakeEvents ? out.corpseTakeEvents.length : 0,
      gunLocRows: out.v4gunLoc ? out.v4gunLoc.length : 0,
      gunTotalEnd: out.v4gunLoc && out.v4gunLoc.length ? out.v4gunLoc[out.v4gunLoc.length - 1].total : null,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, gunLocationsOf: gunLocationsOf,
  classifyGrantCaller: classifyGrantCaller, classifyRollCaller: classifyRollCaller,
  grantRecipientOf: grantRecipientOf, firstCallerFrame: firstCallerFrame,
  snapshotGunCells: snapshotGunCells, diffGunCells: diffGunCells,
  rangedKitOf: rangedKitOf, countItemIn: countItemIn, cellCountIn: cellCountIn,
  itemIdOf: itemIdOf, gday: gday };
