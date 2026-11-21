// vanishcause-driver-a.js — DIAG driver, arm sim-vanishcause-a
// (finding #2635: gun-vanish CAUSE — three censuses all ~70-80%
// unexplained; the next work needs a cause, not another census.
// This driver attributes EVERY searcaster holder change to a CAUSE
// by tracking the gun's FULL location every day + wrapping the
// actual transfer/loss paths in code. NO game-code change: all
// recorders are driver wraps (pure reads + driver-local writes;
// every game function runs exactly once, untouched) + a daily
// pure-read census. Pattern: the gunrate/cellgate driver family
// (wraps + daily census + diff); this driver is COMPACT — it needs
// only the gun census, the transfer wraps, and wall fields, not the
// 2500-line launch-funnel instrument.
//   Gun locations tracked daily (one location per gun):
//     equipped:<vid> — villager with searcaster in the ranged slot
//     carried:<vid>  — searcaster in a villager's items, unequipped
//     stashed:<vid>  — searcaster in a villager's personal stash
//     scholar-pack   — searcaster in the scholar's inventory
//     scholar-equipped:<slot> — searcaster worn by the scholar
//       (the OLD holder map could not see this: Game.equip splices
//       the piece OUT of inventory — an equipped scholar gun read
//       as a VANISH, unequipping it as a NEW-HOLDER)
//     stash:<section> — searcaster in the communal stash
//     corpse:<cid>   — searcaster on a corpse (buried or not;
//       buryCorpse keeps items on the corpse object)
//   A gun in NO tracked location is a true sink (dropItem splices
//   it out of existence; nothing else found in code removes a gun).
//   Wraps name the mechanism: alienLootGrant (+caller taxonomy),
//   _cxItemPrize, villagerKillLoot, _corpseTakeStack, lootCorpse,
//   equip/unequip, Scattering.equipment.autoEquip (villager re-equip),
//   stealFrom, dropItem, giftArmor, registerDeath, removeVillager,
//   playerDeath, buryCorpse, _lendSearcaster/_returnLentSearcaster
//   (guard — LEND off, must stay 0).
//   The legacy v4transfers rows are reproduced EXACTLY (same diff
//   logic as presence/lendpool, incl. the old detector's scholar
//   blind spot) so the attribution rate is comparable to the
//   shape2 baseline (~20-22% explained); the analyzer adds the
//   `cause` + `evidence` per row.
//   TWO legs, IDENTICAL env (leg1/leg2): this is a diag with no
//   lever — the second leg is the instrument-neutrality proof for
//   the frozen guardrail (the balanced-panel compare runs leg1 ->
//   leg2; the honest result is no-material-signal everywhere).
//   Substrate env (both legs):
//   VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 +
//   SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1 + GUNRATE=1 + CELLGATE=1.
//   LEND unset, PRESENCE unset. Fresh band 107221-107228 (see the
//   sim-vanishcause-a prereg). Horizon 150d death-aware. Competent
//   verbatim policy.
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=leg1 OUTDIR=perseed-vanishcause-a-leg1 SEEDS=107221,107222 RUN=vanishcause-a node scripts/vanishcause-driver-a.js
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
const RUN = process.env.RUN || 'vanishcause-a';
const MODE = process.env.MODE || 'leg1';
const OUTDIR = process.env.OUTDIR || ('perseed-vanishcause-a-' + MODE);
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
      if (itemIdOf(e) === id) n += (typeof e === 'string') ? 1 : (e.units || 1);
    }
  } catch (e) {}
  return n;
}
function ammoCountOf(items, ammoId) { return countItemIn(items, ammoId); }
function cellCountIn(items, cellId) { return ammoCountOf(items, cellId || 'fusion_cell'); }
// rangedKitOf — copied from lendpool-driver-a.js (provenance: the
// gunrate/cellgate driver family). Reads the EQUIPPED ranged slot
// only: a gun sitting in items is not a holder until autoEquip seats
// it (villagerGearUp runs at fight entry, fieldFights.js:599).
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
// firstCallerFrame — copied from lendpool-driver-a.js.
function firstCallerFrame(stack) {
  try {
    const lines = String(stack || '').split('\n').slice(1);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] || '';
      if (line.indexOf('vanishcause-driver-a.js') !== -1) continue;
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
// lendpool-driver-a.js (provenance: the gunrate/cellgate driver
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

// ---- GUN-LOCATION CENSUS ----
// gunLocationsOf(Game): every searcaster in the world, one location
// each. A villager's equipped gun ALSO sits in their items (autoEquip
// builds equipped entries as copies over items — it never removes the
// entry), so "carried" counts items MINUS the equipped one: one gun,
// one location, never double-counted. The scholar is read ONLY from
// state.scholar.* (inventory + equipped) — the scholar's person record
// is not a second pack. Corpses are scanned buried or not (buryCorpse
// keeps items on the corpse object). personFlags records dead +
// on-roster per vid so the analyzer can tell a death from a departure.
// Pure reads.
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
    // Scholar: inventory + equipped slots only (equip() splices out
    // of inventory, so the two are mutually exclusive).
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
    // Communal stash (all four sections; a searcaster would sit in weapons).
    try {
      const stash = (Game.stashState) ? Game.stashState() : null;
      if (stash) {
        for (const sec of ['weapons', 'armor', 'tools', 'medicine']) {
          const n = countItemIn(stash[sec], 'searcaster');
          if (n > 0) locations.push({ loc: 'stash', section: sec, count: n });
        }
      }
    } catch (e) {}
    // Corpses (monster + person, buried or not).
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
// legacyHoldersOf(Game): the OLD equipped-only holder map, reproduced
// EXACTLY (presence/lendpool gunHoldersOf): villagers with a searcaster
// in the ranged slot + __scholar__ iff the scholar's INVENTORY holds
// one. The scholar-equipped blind spot is INTENTIONAL here — the
// v4transfers rows must reproduce the old censuses (shape2 baseline)
// so the attribution rate is comparable; the analyzer's `cause` is the
// judged field, the row's legacy `attribution` is preserved for
// comparability. Pure reads.
function legacyHoldersOf(Game) {
  const holders = {};
  try {
    const st = Game.state || {};
    const scholarVid = Game.villagerId || null;
    const roster = ((st.village || {}).roster) || [];
    for (const vid of roster) {
      if (vid === scholarVid) continue;
      let p = null;
      try { p = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
      if (!p || p.dead) continue;
      const kit = rangedKitOf(Game, p);
      if (kit.rwId === 'searcaster') holders[vid] = { cells: cellCountIn(p.items, 'fusion_cell'), stashCells: cellCountIn(p.stashed, 'fusion_cell') };
    }
    const inv = ((st.scholar || {}).inventory) || [];
    for (const ent of inv) {
      if (itemIdOf(ent) === 'searcaster') { holders['__scholar__'] = { cells: cellCountIn(inv, 'fusion_cell'), stashCells: 0 }; break; }
    }
  } catch (e) {}
  return holders;
}
// holderKeysOf(locations): the legacy holder-map KEYS derived from a
// gun-location census — equipped villagers + __scholar__ iff a
// scholar-pack location exists (scholar-equipped does NOT count: the
// old blind spot, reproduced). Used by the analyzer's consistency
// check (recomputed v4transfers rows must equal the driver's).
function holderKeysOf(locations) {
  const keys = {};
  for (const l of (locations || [])) {
    if (l.loc === 'equipped') keys[l.vid] = true;
    if (l.loc === 'scholar-pack') keys['__scholar__'] = true;
  }
  return Object.keys(keys).sort();
}

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'launchparty-' + MODE, fullTelemetry: false });
  const errors = [];
  // ---- event stores (driver-local writes only) ----
  const grantEvents = [];
  const corpseTakeEvents = [];
  const lootCorpseEvents = [];
  const killLootEvents = [];
  const contestPrizeEvents = [];
  const equipEvents = [];
  const unequipEvents = [];
  const autoEquipEvents = [];
  const stealEvents = [];
  const dropEvents = [];
  const giftArmorEvents = [];
  const deathEvents = [];
  const removeEvents = [];
  const playerDeathEvents = [];
  const buryEvents = [];
  const lendEvents = [];
  const gunLocRows = [];
  const v4transfers = [];
  let prevHolders = null;
  let prevGunLoc = null;
  let lastSnapDay = -1;

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
  // Grants: the single shared path for kill loot AND contest/show
  // prizes AND trade (game.js alienLootGrant header).
  wrapGame('alienLootGrant', function (orig) {
    return function (itemId, toCorpse) {
      const ret = orig.apply(this, arguments);
      try {
        const rec = grantRecipientOf(this, toCorpse);
        let caller = 'other', frame = null;
        try {
          const st = (new Error('vanishcause-grant-caller')).stack || '';
          caller = classifyGrantCaller(st);
          frame = firstCallerFrame(st);
        } catch (e) { frame = null; }
        grantEvents.push({ day: gday(Game), itemId: itemId || null,
          toKind: rec.toKind, toVid: rec.toVid, caller: caller, frame: frame });
      } catch (e) { errors.push('grant-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('_cxItemPrize', function (orig) {
    return function (ac, contest, who) {
      const ret = orig.apply(this, arguments);
      try {
        contestPrizeEvents.push({ day: gday(Game), who: who || null,
          contest: (contest && contest.id) || null, granted: !!ret });
      } catch (e) { errors.push('prize-log: ' + String(e.message).slice(0, 80)); }
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
  // corpseTakeItem and corpseLootAll; lootCorpse has its own takeOne
  // and is wrapped separately (pre/post searcaster diff on the corpse).
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
  wrapGame('lootCorpse', function (orig) {
    return function (id, takeAll) {
      let before = 0, cvid = null;
      try {
        const list = (this.corpses) ? this.corpses() : ((this.state || {}).corpses || []);
        const c = (list || []).find(function (x) { return x && x.id === id; });
        if (c) { before = countItemIn(c.items, 'searcaster'); cvid = c.villagerId || null; }
      } catch (e) {}
      const ret = orig.apply(this, arguments);
      try {
        let after = before;
        try {
          const list = (this.corpses) ? this.corpses() : ((this.state || {}).corpses || []);
          const c = (list || []).find(function (x) { return x && x.id === id; });
          if (c) after = countItemIn(c.items, 'searcaster');
        } catch (e) {}
        if (before > after) {
          lootCorpseEvents.push({ day: gday(Game), itemId: 'searcaster',
            corpseId: id || null, corpseVid: cvid, took: (ret && Array.isArray(ret)) ? ret.map(function (t) { return itemIdOf(t); }) : null });
        }
      } catch (e) { errors.push('lootcorpse-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  // Scholar pack moves: equip splices OUT of inventory (the blind
  // spot); unequip pushes back; dropItem splices out of existence
  // (the woods take it); stealFrom moves kcal only (recorded to
  // prove theft never moves a gun); giftArmor is armor-only.
  // equip ALSO displaces: equipping another weapon over an equipped
  // searcaster sends the gun back to the pack with NO unequip call
  // (the policy's ammo-aware gearUp does exactly this to a dry
  // searcaster) — so the displaced piece is recorded too.
  wrapGame('equip', function (orig) {
    return function (itemIdx, slot) {
      let itemId = null, displacedId = null;
      try { const inv = ((this.state || {}).scholar || {}).inventory || []; const it = inv[itemIdx]; itemId = itemIdOf(it); } catch (e) {}
      try { const eq = ((this.state || {}).scholar || {}).equipped || {}; const e = eq[slot]; displacedId = itemIdOf(e); } catch (e) {}
      const ret = orig.apply(this, arguments);
      try { if (itemId === 'searcaster' || displacedId === 'searcaster') equipEvents.push({ day: gday(Game), itemId: itemId, slot: slot || null, displacedId: displacedId || null }); } catch (e) { errors.push('equip-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('unequip', function (orig) {
    return function (slot) {
      let itemId = null;
      try { const eq = ((this.state || {}).scholar || {}).equipped || {}; const e = eq[slot]; itemId = itemIdOf(e); } catch (e) {}
      const ret = orig.apply(this, arguments);
      try { if (itemId === 'searcaster') unequipEvents.push({ day: gday(Game), itemId: itemId, slot: slot || null }); } catch (e) { errors.push('unequip-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('stealFrom', function (orig) {
    return function (vid) {
      const ret = orig.apply(this, arguments);
      try { stealEvents.push({ day: gday(Game), vid: vid || null, ret: (ret == null ? null : String(ret)) }); } catch (e) { errors.push('steal-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('dropItem', function (orig) {
    return function (idx) {
      let itemId = null;
      try { const inv = ((this.state || {}).scholar || {}).inventory || []; const it = inv[idx]; itemId = itemIdOf(it); } catch (e) {}
      const ret = orig.apply(this, arguments);
      try { dropEvents.push({ day: gday(Game), itemId: itemId || null }); } catch (e) { errors.push('drop-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('giftArmor', function (orig) {
    return function (invIdx, vid) {
      let itemId = null;
      try { const inv = ((this.state || {}).scholar || {}).inventory || []; const it = inv[invIdx]; itemId = itemIdOf(it); } catch (e) {}
      const ret = orig.apply(this, arguments);
      try { giftArmorEvents.push({ day: gday(Game), itemId: itemId || null, vid: vid || null }); } catch (e) { errors.push('giftarmor-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  // Death / departure: registerDeath is THE hook (every death);
  // removeVillager is the one removal choke point (killed/exiled/
  // fled/splinter); playerDeath is the scholar-death choke point
  // (inventory + equipped gear -> corpse death pack, nothing
  // auto-transfers); buryCorpse keeps items on the corpse object.
  wrapGame('registerDeath', function (orig) {
    return function (opts) {
      const ret = orig.apply(this, arguments);
      try {
        const items = ((opts || {}).items) || [];
        deathEvents.push({ day: gday(Game), vid: (opts && opts.villagerId) || null,
          kind: (opts && opts.kind) || null, cause: (opts && opts.cause) || null,
          player: !!((opts && opts.player)), corpseId: (ret && ret.id) || null,
          items: items.map(function (i) { return itemIdOf(i); }),
          hasGun: items.some(function (i) { return itemIdOf(i) === 'searcaster'; }) });
      } catch (e) { errors.push('death-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('removeVillager', function (orig) {
    return function (vid, how) {
      let gunBefore = [];
      try {
        const loc = gunLocationsOf(this);
        gunBefore = loc.locations.filter(function (l) { return l.vid === vid; }).map(function (l) { return l.loc + (l.slot ? ':' + l.slot : '') + (l.cid ? ':' + l.cid : ''); });
      } catch (e) {}
      const ret = orig.apply(this, arguments);
      try { removeEvents.push({ day: gday(Game), vid: vid || null, how: how || null, gunBefore: gunBefore }); } catch (e) { errors.push('remove-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('playerDeath', function (orig) {
    return function (cause) {
      const oldVid = this.villagerId || null;
      let hadGun = null;
      try {
        const s = (this.state || {}).scholar || {};
        hadGun = (countItemIn(s.inventory, 'searcaster') > 0) ? 'pack' : null;
        if (!hadGun) {
          const eq = s.equipped || {};
          for (const slot of Object.keys(eq)) if (itemIdOf(eq[slot]) === 'searcaster') { hadGun = 'equipped:' + slot; break; }
        }
      } catch (e) {}
      const ret = orig.apply(this, arguments);
      try {
        const newVid = this.villagerId || null;
        let corpseId = null;
        try {
          const pend = (((this.state || {}).village || {}).pendingBurials) || [];
          if (pend.length) corpseId = pend[pend.length - 1].corpseId || null;
        } catch (e) {}
        playerDeathEvents.push({ day: gday(Game), oldVid: oldVid, newVid: newVid, corpseId: corpseId, hadGun: hadGun, cause: cause || null });
      } catch (e) { errors.push('playerdeath-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('buryCorpse', function (orig) {
    return function (id) {
      let hadGun = false, items = [];
      try {
        const list = (this.corpses) ? this.corpses() : ((this.state || {}).corpses || []);
        const c = (list || []).find(function (x) { return x && x.id === id; });
        if (c) { items = (c.items || []).map(function (i) { return itemIdOf(i); }); hadGun = items.indexOf('searcaster') !== -1; }
      } catch (e) {}
      const ret = orig.apply(this, arguments);
      try { buryEvents.push({ day: gday(Game), corpseId: id || null, hadGun: hadGun, items: items }); } catch (e) { errors.push('bury-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  // Lend guard (LEND off — a lend must never FIRE). _lendSearcaster
  // returns null when LEND is off (or the wave/earshot gates fail),
  // so only a non-null return is a real lend: record fires, not
  // calls (the first smoke logged 62 calls, all null returns).
  wrapGame('_lendSearcaster', function (orig) {
    return function () {
      const ret = orig.apply(this, arguments);
      try { if (ret) lendEvents.push({ day: gday(Game), fn: '_lendSearcaster', ret: true,
        lender: ret.lender || null, borrower: ret.borrower || null, kind: ret.kind || null,
        cellsMoved: ret.cellsMoved | 0 }); } catch (e) { errors.push('lend-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('_returnLentSearcaster', function (orig) {
    return function (lend) {
      const ret = orig.apply(this, arguments);
      try { if (ret) lendEvents.push({ day: gday(Game), fn: '_returnLentSearcaster', ret: true }); } catch (e) { errors.push('lend-return-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  // Villager re-equip: the shared namespace function. Callers read
  // the property at call time, so wrapping the property sees every
  // call. Installed per-run and RESTORED after the run (the namespace
  // object is shared across seeds in one process — a double-wrap
  // would double-log). Only rows where a searcaster is involved are
  // kept (spawn seating floods otherwise).
  let origAutoEquip = null, autoEquipWrapped = false;
  try {
    const SC = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    const EQ = SC.equipment || null;
    if (RECORDER_ON && EQ && typeof EQ.autoEquip === 'function' && !EQ.autoEquip.__vcWrapped) {
      origAutoEquip = EQ.autoEquip;
      const origAE = origAutoEquip;
      EQ.autoEquip = function (v, itemDefs) {
        let before = null, hadGunBefore = false;
        try {
          before = ((v && v.equipped && v.equipped.ranged) || {}).itemId || ((v && v.equipped && v.equipped.ranged) || {}).id || null;
          hadGunBefore = countItemIn(v && v.items, 'searcaster') > 0;
        } catch (e) {}
        const ret = origAE.apply(this, arguments);
        try {
          let after = null, hadGunAfter = false;
          try {
            after = ((v && v.equipped && v.equipped.ranged) || {}).itemId || ((v && v.equipped && v.equipped.ranged) || {}).id || null;
            hadGunAfter = countItemIn(v && v.items, 'searcaster') > 0;
          } catch (e) {}
          if (before !== after && (before === 'searcaster' || after === 'searcaster' || hadGunBefore || hadGunAfter)) {
            let frame = null;
            try { frame = firstCallerFrame((new Error('vanishcause-autoequip-caller')).stack || ''); } catch (e) {}
            autoEquipEvents.push({ day: gday(Game), vid: (v && v.id) || null,
              rangedBefore: before, rangedAfter: after, frame: frame });
          }
        } catch (e) { errors.push('autoequip-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
      EQ.autoEquip.__vcWrapped = true;
      autoEquipWrapped = true;
    } else if (RECORDER_ON) errors.push('autoEquip-wrap: not a function or already wrapped');
  } catch (e) { errors.push('autoEquip-wrap-install: ' + String(e.message).slice(0, 80)); }

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
            // LEGACY transfer detector — same diff logic as
            // presence/lendpool, so rows reproduce the old censuses.
            if (RECORDER_ON) {
              try {
                const nowH = legacyHoldersOf(Game);
                if (prevHolders === null) { prevHolders = nowH; }
                else {
                  const prevIds = Object.keys(prevHolders);
                  const nowIds = Object.keys(nowH);
                  for (const to of nowIds) {
                    if (prevHolders[to]) continue;
                    let from = null;
                    for (const p of prevIds) { if (!nowH[p]) { from = p; break; } }
                    let attribution = 'unexplained';
                    try {
                      const ge = grantEvents.find(function (e) { return e.day === d && e.itemId === 'searcaster' && e.toVid === to; });
                      if (ge) attribution = 'grant-' + (ge.caller || 'other');
                      else if (killLootEvents.some(function (e) { return e.day === d && e.vid === to && e.dropId === 'searcaster'; })) attribution = 'kill-loot';
                      else if (corpseTakeEvents.some(function (e) { return e.day === d && e.itemId === 'searcaster'; })) attribution = 'corpse-take';
                    } catch (e2) {}
                    v4transfers.push({ day: d, kind: from ? 'transfer' : 'new-holder', from: from, to: to, attribution: attribution });
                  }
                  for (const from of prevIds) {
                    if (nowH[from]) continue;
                    if (nowIds.length > 0) continue; // someone else holds it — covered by the arrival row
                    let dead = false;
                    try { if (from !== '__scholar__') { const pp = Game.getPerson ? Game.getPerson(from) : null; dead = !!(pp && pp.dead); } } catch (e2) {}
                    v4transfers.push({ day: d, kind: dead ? 'holder-died' : 'vanish', from: from, to: null, attribution: dead ? 'holder-died' : 'unexplained' });
                  }
                  prevHolders = nowH;
                }
              } catch (e) { errors.push('gun-transfer: ' + String(e.message).slice(0, 80)); }
            }
          }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });
  // Restore the shared autoEquip (see the install note above).
  try {
    const SC = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    const EQ = SC.equipment || null;
    if (autoEquipWrapped && EQ && origAutoEquip) { EQ.autoEquip = origAutoEquip; }
  } catch (e) { errors.push('autoEquip-restore: ' + String(e.message).slice(0, 80)); }

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

  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  const out = {
    seed: seed, arm: 'vanishcause-a', run: RUN, mode: MODE, leg: MODE,
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
    // VANISHCAUSE: the gun-location census + legacy transfer rows +
    // the wrapped transfer/loss events. The analyzer attributes
    // every v4transfers row from these.
    v4gunLoc: gunLocRows,
    v4transfers: v4transfers,
    grantEvents: grantEvents, corpseTakeEvents: corpseTakeEvents,
    lootCorpseEvents: lootCorpseEvents, killLootEvents: killLootEvents,
    contestPrizeEvents: contestPrizeEvents,
    equipEvents: equipEvents, unequipEvents: unequipEvents,
    autoEquipEvents: autoEquipEvents,
    stealEvents: stealEvents, dropEvents: dropEvents,
    giftArmorEvents: giftArmorEvents,
    deathEvents: deathEvents, removeEvents: removeEvents,
    playerDeathEvents: playerDeathEvents, buryEvents: buryEvents,
    lendEvents: lendEvents,
  };
  return out;
}

if (require.main === module) (async function () {
  if (MODE !== 'leg1' && MODE !== 'leg2') { console.error('VANISHCAUSE STOP: MODE must be leg1|leg2, got ' + JSON.stringify(MODE)); process.exit(2); }
  if (!GUNRATE_ON) { console.error('VANISHCAUSE STOP: GUNRATE=1 required (rebuilt substrate).'); process.exit(2); }
  if (!CELLGATE_ON) { console.error('VANISHCAUSE STOP: CELLGATE=1 required (rebuilt substrate).'); process.exit(2); }
  if (LEND_ON) { console.error('VANISHCAUSE STOP: LEND must be unset — this arm diagnoses with the lend OFF.'); process.exit(2); }
  if (process.env.PRESENCE === '1') { console.error('VANISHCAUSE STOP: PRESENCE must be unset (reverted lever).'); process.exit(2); }
  if (!GUNRATE_PRESENT) { console.error('VANISHCAUSE STOP: the GUNRATE lever code (game.js + contests.js) must be present.'); process.exit(2); }
  if (!CELLGATE_PRESENT) { console.error('VANISHCAUSE STOP: the CELLGATE gate code (fieldFights.js) must be present.'); process.exit(2); }
  if (!LEND_PRESENT) { console.error('VANISHCAUSE STOP: the LEND lever code (game.js _lendSearcaster + _returnLentSearcaster) must be present.'); process.exit(2); }
  if (!SENSE_PRESENT) { console.error('VANISHCAUSE STOP: the SENSEEXPED sense code (party-wiring.js) must be present.'); process.exit(2); }
  if (!SENSEEXPED_ON) { console.error('VANISHCAUSE STOP: SENSEEXPED=1 required (substrate).'); process.exit(2); }
  if (!BOWOPEN_ON) { console.error('VANISHCAUSE STOP: BOWOPEN=1 required (substrate).'); process.exit(2); }
  if (!SPEARGATE_ON) { console.error('VANISHCAUSE STOP: SPEARGATE=1 required (substrate).'); process.exit(2); }
  if (process.env.VETREENGAGE !== '1') { console.error('VANISHCAUSE STOP: VETREENGAGE=1 required (substrate).'); process.exit(2); }
  if (process.env.PARTYSIZE4 !== '1') { console.error('VANISHCAUSE STOP: PARTYSIZE4=1 required (substrate).'); process.exit(2); }
  if (process.env.FLEEREPAIR2 !== '1') { console.error('VANISHCAUSE STOP: FLEEREPAIR2=1 required (substrate).'); process.exit(2); }
  if (process.env.FIGHTALLY2 !== '1') { console.error('VANISHCAUSE STOP: FIGHTALLY2=1 required (substrate).'); process.exit(2); }
  if (process.env.FUSIONCELL === '1') { console.error('VANISHCAUSE STOP: FUSIONCELL must be unset (reverted fix).'); process.exit(2); }
  if (process.env.SEARSUPPLY === '1') { console.error('VANISHCAUSE STOP: SEARSUPPLY must be unset (reverted lever).'); process.exit(2); }
  if (process.env.BOWCRAFT === '1') { console.error('VANISHCAUSE STOP: BOWCRAFT must be unset.'); process.exit(2); }
  if (!SEEDS.length) { console.error('VANISHCAUSE STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-21', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'vanishcause-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('VANISHCAUSE STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'vanishcause-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      gameSha: out.gameSha, gunrateOn: out.gunrateOn, gunratePresent: out.gunratePresent,
      cellgateOn: out.cellgateOn, cellgatePresent: out.cellgatePresent,
      lendOn: out.lendOn, lendPresent: out.lendPresent,
      policySha: out.policySha, recorderOn: out.recorderOn,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      deaths: out.deaths.length,
      gunLocRows: out.v4gunLoc ? out.v4gunLoc.length : 0,
      gunTotalEnd: out.v4gunLoc && out.v4gunLoc.length ? out.v4gunLoc[out.v4gunLoc.length - 1].total : null,
      transfers: out.v4transfers ? out.v4transfers.length : 0,
      grants: out.grantEvents ? out.grantEvents.length : 0,
      corpseTakes: out.corpseTakeEvents ? out.corpseTakeEvents.length : 0,
      lootCorpseTakes: out.lootCorpseEvents ? out.lootCorpseEvents.length : 0,
      equips: out.equipEvents ? out.equipEvents.length : 0,
      unequips: out.unequipEvents ? out.unequipEvents.length : 0,
      autoEquips: out.autoEquipEvents ? out.autoEquipEvents.length : 0,
      deathsEv: out.deathEvents ? out.deathEvents.length : 0,
      removes: out.removeEvents ? out.removeEvents.length : 0,
      playerDeaths: out.playerDeathEvents ? out.playerDeathEvents.length : 0,
      lends: out.lendEvents ? out.lendEvents.length : 0,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, gunLocationsOf: gunLocationsOf, legacyHoldersOf: legacyHoldersOf,
  holderKeysOf: holderKeysOf, rangedKitOf: rangedKitOf, classifyGrantCaller: classifyGrantCaller,
  grantRecipientOf: grantRecipientOf, firstCallerFrame: firstCallerFrame,
  countItemIn: countItemIn, cellCountIn: cellCountIn, itemIdOf: itemIdOf, gday: gday };
