// calledname-driver-a.js — REPLAY recorder, arm sim-calledname-a.
// A byte-copy of scripts/departteach-driver-a.js (same wraps, same
// recorder, same per-seed corpus shape) EXCEPT: FROZEN_BASE is the
// sim-calledname-a prereg commit, RUN is 'calledname-a', and it runs
// the ARM leg only. Purpose: replay the departteach pooled 16-seed
// band (109431–109446) on the calledname-fixed code, so the analyzer
// can compare the replay corpora against the RECORDED departteach
// arm corpora (evidence/2026-11-24/perseed-departteach-a-arm) as the
// before-leg: teach counts, drift lines, beat lines, deaths,
// launches, days, endReason must be identical (B2 no-regression),
// except a drift line whose companion carries a use-name, which may
// differ by the name token only. The fix is NOT flag-gated. Anchor:
// FROZEN_BASE below is the prereg commit; the CLI refuses unless
// HEAD is that commit — the fix stays uncommitted during the replay,
// so HEAD never moves and the anchor proves which prereg the replay
// was judged against.
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=arm OUTDIR=perseed-calledname-a-arm SEEDS=109431,109432,109433,109434,109435,109436,109437,109438,109439,109440,109441,109442,109443,109444,109445,109446 RUN=calledname-a node scripts/calledname-driver-a.js
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
const RUN = process.env.RUN || 'calledname-a';
const MODE = process.env.MODE || 'ctl';
const OUTDIR = process.env.OUTDIR || ('perseed-calledname-a-' + MODE);
const RECORDER_ON = process.env.LAUNCHPARTY_RECORDER !== 'off';
// FROZEN_BASE: the prereg commit (evidence/2026-11-24/
// sim-calledname-a-prereg.md). The CLI refuses to run unless HEAD
// IS this commit — the fix stays uncommitted during the replay, so
// HEAD never moves and the anchor proves which prereg the replay
// was judged against.
const FROZEN_BASE = 'c5c0486540fdce8b88cc6c6185936bd99f3f3cba';

// Wave-4+ id set (frozen list from src/data/monsters.json —
// re-read live so the recorder refuses a stale roster silently).
const W4P_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald',
  'cancellation', 'editor', 'rerun', 'spoiler', 'timeslot', 'nielsen', 'finale', 'network_note'];
function loadWave4pIds() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return (m.wave | 0) >= 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return W4P_IDS_FROZEN.slice().sort(); }
}
const W4P_SET = new Set(loadWave4pIds());

const SENSEEXPED_ON = process.env.SENSEEXPED === '1';
const BOWOPEN_ON = process.env.BOWOPEN === '1';
const FIGHTALLY2_ON = process.env.FIGHTALLY2 === '1';
const SPEARGATE_ON = process.env.SPEARGATE === '1';
const GUNRATE_ON = process.env.GUNRATE === '1';
const CELLGATE_ON = process.env.CELLGATE === '1';
const KILLBUNDLE_ON = process.env.KILLBUNDLE === '1';
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
// The lever lives in win-plan.js + villager-brain.js: record both
// files' shas so the analyzer can prove which code each leg ran on
// (ctl = pre-fix shas, arm = post-fix shas). Passed to the analyzer
// as --ctl-winplan/--ctl-brain/--arm-winplan/--arm-brain.
let WINPLAN_SHA = 'unknown';
try { WINPLAN_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8')).digest('hex').slice(0, 12); } catch (e) {}
let BRAIN_SHA = 'unknown';
try { BRAIN_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8')).digest('hex').slice(0, 12); } catch (e) {}

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
      if (line.indexOf('departteach-driver-a.js') !== -1) continue;
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

// ---- NEEDWAVE attribute reads (pure reads; NEVER call
// villagerGearUp — it spends village gear — and never write game
// state or draw RNG) ----
// gearOfReplica(Game, vid): the win-plan gear read, replicated here
// as pure reads (win-plan.js gearOf is module-internal). Copied
// from scripts/launchstate-driver-b.js.
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
// attrsOf(Game, vid): the needwave member snapshot — every attribute
// the code itself uses to judge a fighter (wave kills, gear, HP,
// veteran, range profile) plus the identity fields the diagnosis
// compares (temper, goal, occupation, npcSkills). No numeric
// combat-skill field exists in the code; none is invented here.
// Returns null only when the person record itself is unreadable;
// every field is read in its own try/catch and defaults explicitly.
function attrsOf(Game, vid) {
  try {
    const st = Game.state || {};
    const v = st.village || {};
    const scholarVid = Game.villagerId || null;
    const isScholar = (vid === '__scholar__' || vid === scholarVid);
    let person = null;
    try { if (Game.getPerson) person = Game.getPerson(vid); } catch (e) {}
    if (!person) { try { if (Game.vpOf) person = Game.vpOf(vid); } catch (e) {} }
    if (!person && !isScholar) return null;
    const dead = !!(person && person.dead);
    let hp = 100;
    try { const h = ((v.health || {})[vid] !== undefined) ? v.health[vid] : 100; hp = h; } catch (e) {}
    const g = gearOfReplica(Game, vid);
    let profile = null;
    try { profile = Game.npcRangeProfile ? Game.npcRangeProfile(vid) : null; } catch (e) {}
    let temper = null;
    try { temper = Game.npcTemper ? Game.npcTemper(vid) : null; } catch (e) {}
    let goal = null;
    try { goal = Game.npcGoal ? Game.npcGoal(vid) : null; } catch (e) {}
    let occupation = null;
    try { occupation = (person && person.occupationId) || null; } catch (e) {}
    let skills = null;
    try { const ns = (v.npcSkills || {})[vid]; skills = Array.isArray(ns) ? ns.slice() : null; } catch (e) {}
    let kills3 = 0, kills4 = 0, killsTotal = 0, maxKillWave = 0;
    try {
      const log = st.waveKillLog || [];
      for (let i = 0; i < log.length; i++) {
        const e = log[i] || {};
        if (e.by !== vid) continue;
        killsTotal++;
        const w = e.w | 0;
        if (w > maxKillWave) maxKillWave = w;
        if (w >= 3) kills3++;
        if (w >= 4) kills4++;
      }
    } catch (e) {}
    // Gun: equipped ranged kit + carried count + cells on hand.
    let gunEquipped = false, gunCarried = 0, cells = 0;
    try {
      if (isScholar) {
        const s = st.scholar || {};
        const eq = s.equipped || {};
        for (const slot of Object.keys(eq)) {
          const e = eq[slot];
          if (e && itemIdOf(e) === 'searcaster') gunEquipped = true;
        }
        gunCarried = countItemIn(s.inventory, 'searcaster');
        cells = cellCountIn(s.inventory, 'fusion_cell');
      } else if (person) {
        const kit = rangedKitOf(Game, person);
        gunEquipped = (kit.rwId === 'searcaster');
        const inItems = countItemIn(person.items, 'searcaster');
        gunCarried = inItems - (gunEquipped ? 1 : 0);
        if (gunCarried < 0) gunCarried = 0;
        cells = cellCountIn(person.items, 'fusion_cell');
      }
    } catch (e) {}
    let plan = null;
    try {
      const p = (v.winPlan || {})[vid];
      if (p) plan = { stage: p.stage || null, target: p.target || null, needWave: (p.needWave != null ? (p.needWave | 0) : null), party: (p.party || []).slice() };
    } catch (e) {}
    let atHaven = null, away = false, engaged = false, onExped = false, sick = false;
    try { away = !!((v.away || {})[vid]); } catch (e) {}
    try { sick = !!((v.sick || {})[vid]); } catch (e) {}
    try { engaged = !!(Game.isEngaged && Game.isEngaged(vid)); } catch (e) {}
    try {
      const a = Game.agencyState ? Game.agencyState() : null;
      onExped = !!(a && a.exped && a.exped[vid]);
    } catch (e) {}
    try {
      const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
      let n = null;
      try { n = Game.npcNode ? Game.npcNode(vid) : null; } catch (e) {}
      atHaven = !!(n && n.nx === hx && n.ny === hy);
    } catch (e) {}
    return { vid: vid, dead: dead, hp: hp, armed: g.armed, armored: g.armored,
      armorP: g.armorP, weaponB: g.weaponB, profile: profile, temper: temper,
      goal: goal, occupation: occupation, skills: skills,
      killsTotal: killsTotal, kills3: kills3, kills4: kills4, maxKillWave: maxKillWave,
      veteran3: kills3 > 0, veteran4: kills4 > 0,
      gunEquipped: gunEquipped, gunCarried: gunCarried, cells: cells,
      plan: plan, atHaven: atHaven, away: away, engaged: engaged,
      onExped: onExped, sick: sick };
  } catch (e) { return null; }
}
function planOfGame(Game, vid) {
  try { const v = (Game.state || {}).village || {}; return (v.winPlan || {})[vid] || null; } catch (e) { return null; }
}
// ---- NEEDWAVE helpers (pure reads; driver-local writes only) ----
// snapshotNeedWaves(Game): {vid: needWave|null} for every plan on
// the books. diffNeedWaves(before, after, holderVid): the companion
// plans whose needWave moved across one depart call — the lever's
// own trace. The holder is excluded: the holder's plan can re-seed
// during the call (winPlanCommitDeadTarget), which is not a copy.
function snapshotNeedWaves(Game) {
  const out = {};
  try {
    const wp = ((Game.state || {}).village || {}).winPlan || {};
    for (const k of Object.keys(wp)) {
      const p = wp[k];
      out[k] = (p && p.needWave != null) ? (p.needWave | 0) : null;
    }
  } catch (e) {}
  return out;
}
function diffNeedWaves(before, after, holderVid) {
  const rows = [];
  try {
    for (const k of Object.keys(after)) {
      if (k === holderVid) continue;
      const b = (k in before) ? before[k] : null;
      const a = after[k];
      if (b !== a && a != null) rows.push({ companion: k, from: b, to: a });
    }
  } catch (e) {}
  return rows;
}
const DEPART_BEAT_RE = /sets out .* — the fire marks the trail\./;
const DRIFT_RE = /A name drifts over from the fire:/;
// snapshotKnownNames(Game): the set of vids the scholar knows by
// name right now (pure read of village.knownNames). The teach
// measurement compares the before/after sets around one beat call.
function snapshotKnownNames(Game) {
  try {
    const kn = ((Game.state || {}).village || {}).knownNames || {};
    const out = {};
    for (const k of Object.keys(kn)) if (kn[k]) out[k] = true;
    return out;
  } catch (e) { return {}; }
}

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'departteach-' + MODE, fullTelemetry: false });
  const errors = [];
  const contestEvents = [];
  const prizeEvents = [];
  const grantEvents = [];
  const corpseTakeEvents = [];
  const killLootEvents = [];
  const volleyEvents = [];
  const gunLocRows = [];
  // NEEDWAVE rows.
  const v4departs = [];
  const v4fights = [];
  const planSeeds = [];
  const planCensus = [];
  const needWaveCopies = [];
  const departBeats = [];
  const reseedBeats = [];
  const beatLines = [];
  // DEPARTTEACH rows: teachRows (one row per companion slot per
  // named departure beat — knownBefore/knownAfter/taught, plus the
  // holder scope note) and driftLines (every teach say line).
  const teachRows = [];
  const driftLines = [];
  const departCalls = [];
  const scorePicks = [];
  const dawnPool = [];
  let sayWrap = false;
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
          const st = (new Error('departteach-grant-caller')).stack || '';
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
  // alienLootGrant, so the grant wrap alone cannot see it).
  wrapGame('villagerKillLoot', function (orig) {
    return function (vid, mdef) {
      let before = null;
      try { before = snapshotGunCells(this); } catch (e) {}
      const dropId = orig.apply(this, arguments);
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
  // NEEDWAVE: the same wrap also records wave-4+ fights (v4fights)
  // with lead + ally attributes.
  wrapGame('fieldFight', function (orig) {
    return function (vid, mdef, m, opts) {
      let rwId = null;
      try {
        const person = this.getPerson ? this.getPerson(vid) : null;
        if (person) rwId = rangedKitOf(this, person).rwId;
      } catch (e) {}
      const wPre = (mdef && mdef.wave) | 0;
      const watchW4 = wPre >= 4 && mdef && mdef.id;
      let leadAttrs = null, allyAttrs = null, planPartyPre = null;
      if (RECORDER_ON && watchW4) {
        try { leadAttrs = attrsOf(this, vid); } catch (e) { leadAttrs = null; }
        try {
          const av = ((opts && opts.allyVids) || []).slice();
          allyAttrs = av.map(function (a) { try { return attrsOf(this, a); } catch (e2) { return null; } }.bind(this));
        } catch (e) { allyAttrs = null; }
        try { const pl = planOfGame(this, vid); planPartyPre = pl && pl.party ? pl.party.slice() : null; } catch (e) {}
      }
      const rec = orig.apply(this, arguments);
      let v = null;
      try {
        v = (rec && rec.volley) || null;
        if (v) {
          volleyEvents.push({ day: gday(Game), vid: vid || null, rwId: rwId,
            wave: (mdef && mdef.wave) || null, mdefId: (mdef && mdef.id) || null,
            shots: v.shots || 0, hits: v.hits || 0, dmg: v.dmg || 0,
            ammoLeft: (v.ammoLeft != null ? v.ammoLeft : null) });
        }
      } catch (e) { errors.push('volley-log: ' + String(e.message).slice(0, 80)); }
      try {
        if (RECORDER_ON && watchW4 && rec) {
          const av = ((opts && opts.allyVids) || []).slice();
          v4fights.push({ day: gday(Game), vid: vid || null, mid: mdef.id, wave: wPre,
            alliesN: (opts && opts.allies) | 0, allyVids: av,
            allyFromStart: !!(opts && opts.allyFromStart),
            outcome: rec.outcome || null, rounds: rec.rounds | 0,
            vTaken: rec.vTaken | 0, mDealt: rec.mDealt | 0,
            calledHelp: !!rec.calledHelp, allyVid: rec.allyVid || null,
            volley: v ? { rwId: rwId, shots: v.shots || 0, hits: v.hits || 0, dmg: v.dmg || 0, ammoLeft: (v.ammoLeft != null ? v.ammoLeft : null) } : null,
            planParty: planPartyPre, lead: leadAttrs, allies: allyAttrs });
        }
      } catch (e) { errors.push('v4fight-log: ' + String(e.message).slice(0, 80)); }
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

  // NEEDWAVE: wave-4+ departures — the launch is the lead question
  // (the holder IS the lead by construction). Record every hold /
  // launch on a wave-4+ plan, with lead + member attributes live at
  // the decision. Both departure paths (agencyTick's winPlanDepart
  // and the brain's vbrainExecuteDepart) are wrapped; the source
  // field tells them apart.
  wrapGame('winPlanDepart', function (orig) {
    return function (vid, hx, hy, playerAtHaven) {
      let nwBefore = null;
      try { nwBefore = snapshotNeedWaves(this); } catch (e) {}
      // DEPARTTEACH: plan + commit at call time (the call mutates stage/party).
      let dcPre = null, dcCommit = null;
      try { const _p0 = planOfGame(this, vid); dcPre = _p0 ? { stage: _p0.stage || null, target: _p0.target || null, needWave: (_p0.needWave != null ? (_p0.needWave | 0) : null) } : null; } catch (e) {}
      try { dcCommit = (typeof this.vbrainCommit === 'function') ? this.vbrainCommit(vid) : null; } catch (e) {}
      const ret = orig.apply(this, arguments);
      try {
        let prof = null, occ = null;
        try { prof = this.npcRangeProfile ? this.npcRangeProfile(vid) : null; } catch (e) {}
        try { const pp = this.getPerson ? this.getPerson(vid) : null; occ = pp ? (pp.occupationId || null) : null; } catch (e) {}
        departCalls.push({ day: gday(Game), part: (Game.dayPart | 0), vid: vid || null, source: 'winPlanDepart',
          commitWinPlanAction: dcCommit ? (dcCommit.winPlanAction || null) : null,
          commitKind: dcCommit ? (dcCommit.kind || null) : null,
          result: ret || null,
          planStage: dcPre ? dcPre.stage : null, planTarget: dcPre ? dcPre.target : null,
          planNeedWave: dcPre ? dcPre.needWave : null, profile: prof, occupation: occ });
      } catch (e) { errors.push('departcall-log: ' + String(e.message).slice(0, 80)); }
      try {
        const nwAfter = snapshotNeedWaves(this);
        for (const c of diffNeedWaves(nwBefore || {}, nwAfter, vid)) {
          needWaveCopies.push({ day: gday(Game), holder: vid || null, companion: c.companion,
            from: c.from, to: c.to, source: 'winPlanDepart' });
        }
      } catch (e) { errors.push('nwcopy-log: ' + String(e.message).slice(0, 80)); }
      try {
        const plan = planOfGame(this, vid);
        if (plan && ((plan.needWave | 0) >= 4 || (plan.target && W4P_SET.has(plan.target)))) {
          const party = (plan.party || []).slice();
          const members = [vid].concat(party).map(function (m) { try { return attrsOf(this, m); } catch (e2) { return null; } }.bind(this));
          v4departs.push({ day: gday(Game), vid: vid || null, source: 'winPlanDepart',
            result: ret || null, stage: plan.stage || null, target: plan.target || null,
            needWave: (plan.needWave != null ? (plan.needWave | 0) : null),
            party: party, partySize: party.length + 1, members: members });
        }
      } catch (e) { errors.push('v4depart-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('vbrainExecuteDepart', function (orig) {
    return function (vid, hx, hy, playerAtHaven) {
      let commit = null;
      try { commit = (typeof this.vbrainCommit === 'function') ? this.vbrainCommit(vid) : null; } catch (e) {}
      // DEPARTTEACH: plan at call time (the call mutates stage/party).
      let dcPre = null;
      try { const _p0 = planOfGame(this, vid); dcPre = _p0 ? { stage: _p0.stage || null, target: _p0.target || null, needWave: (_p0.needWave != null ? (_p0.needWave | 0) : null) } : null; } catch (e) {}
      let nwBefore = null;
      try { nwBefore = snapshotNeedWaves(this); } catch (e) {}
      const ret = orig.apply(this, arguments);
      try {
        let prof = null, occ = null;
        try { prof = this.npcRangeProfile ? this.npcRangeProfile(vid) : null; } catch (e) {}
        try { const pp = this.getPerson ? this.getPerson(vid) : null; occ = pp ? (pp.occupationId || null) : null; } catch (e) {}
        departCalls.push({ day: gday(Game), part: (Game.dayPart | 0), vid: vid || null, source: 'brain',
          commitWinPlanAction: commit ? (commit.winPlanAction || null) : null,
          commitKind: commit ? (commit.kind || null) : null,
          result: ret || null,
          planStage: dcPre ? dcPre.stage : null, planTarget: dcPre ? dcPre.target : null,
          planNeedWave: dcPre ? dcPre.needWave : null, profile: prof, occupation: occ });
      } catch (e) { errors.push('departcall-log: ' + String(e.message).slice(0, 80)); }
      try {
        const nwAfter = snapshotNeedWaves(this);
        for (const c of diffNeedWaves(nwBefore || {}, nwAfter, vid)) {
          needWaveCopies.push({ day: gday(Game), holder: vid || null, companion: c.companion,
            from: c.from, to: c.to, source: 'brain' });
        }
      } catch (e) { errors.push('nwcopy-log: ' + String(e.message).slice(0, 80)); }
      try {
        const plan = planOfGame(this, vid);
        if (plan && ((plan.needWave | 0) >= 4 || (plan.target && W4P_SET.has(plan.target)))) {
          const party = (plan.party || []).slice();
          const members = [vid].concat(party).map(function (m) { try { return attrsOf(this, m); } catch (e2) { return null; } }.bind(this));
          v4departs.push({ day: gday(Game), vid: vid || null, source: 'brain',
            result: ret || null, winPlanAction: commit ? (commit.winPlanAction || null) : null,
            companion: commit ? (commit.companion || null) : null,
            companion2: commit ? (commit.companion2 || null) : null,
            companion3: commit ? (commit.companion3 || null) : null,
            stage: plan.stage || null, target: plan.target || null,
            needWave: (plan.needWave != null ? (plan.needWave | 0) : null),
            party: party, partySize: party.length + 1, members: members });
        }
      } catch (e) { errors.push('v4braindepart-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  // NEEDWAVE: departure beats — every winPlanDepartLaunchBeat call,
  // with whether the re-seed beat spoke first (a re-seed speak
  // returns true WITHOUT the ordinary beat). The paired
  // winPlanReseedLaunchBeat wrap counts rows across the synchronous
  // call, so the flag is exact, never guessed.
  wrapGame('winPlanReseedLaunchBeat', function (orig) {
    return function (vid) {
      const ret = orig.apply(this, arguments);
      try {
        const plan = planOfGame(this, vid);
        reseedBeats.push({ day: gday(Game), vid: vid || null,
          target: (plan && plan.target) || null,
          needWave: (plan && plan.needWave != null) ? (plan.needWave | 0) : null,
          spoke: !!ret });
      } catch (e) { errors.push('reseedbeat-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapGame('winPlanDepartLaunchBeat', function (orig) {
    return function (vid, launched) {
      const rbBefore = reseedBeats.length;
      // DEPARTTEACH: the knownNames snapshot around the call — the
      // teach fires synchronously inside departLaunchBeat, so the
      // before/after diff is exactly what this beat taught. Pure
      // reads; the game function runs exactly once, untouched.
      let knownBefore = null, sysBefore = null;
      try { knownBefore = snapshotKnownNames(this); } catch (e) { knownBefore = {}; }
      try { sysBefore = !!((this.state || {}).systemArrived); } catch (e) { sysBefore = null; }
      const ret = orig.apply(this, arguments);
      let reseedSpoke = false;
      try {
        for (let i = rbBefore; i < reseedBeats.length; i++) {
          if (reseedBeats[i].vid === vid && reseedBeats[i].spoke) { reseedSpoke = true; break; }
        }
        const plan = planOfGame(this, vid);
        departBeats.push({ day: gday(Game), vid: vid || null,
          launched: (launched || []).slice(),
          target: (plan && plan.target) || null,
          needWave: (plan && plan.needWave != null) ? (plan.needWave | 0) : null,
          ret: !!ret, reseedSpoke: reseedSpoke,
          ordinarySpoke: !!ret && !reseedSpoke });
      } catch (e) { errors.push('departbeat-log: ' + String(e.message).slice(0, 80)); }
      try {
        const knownAfter = snapshotKnownNames(this);
        const sysAfter = !!((this.state || {}).systemArrived);
        const slots = [];
        for (const cv of (launched || [])) {
          if (!cv || cv === vid) continue;
          const kb = !!((knownBefore || {})[cv]);
          const ka = !!((knownAfter || {})[cv]);
          slots.push({ companion: cv, knownBefore: kb, knownAfter: ka, taught: !kb && ka });
        }
        teachRows.push({ day: gday(Game), vid: vid || null,
          launched: (launched || []).slice(),
          ret: !!ret, reseedSpoke: reseedSpoke,
          ordinarySpoke: !!ret && !reseedSpoke,
          systemArrivedBefore: sysBefore, systemArrivedAfter: sysAfter,
          holderKnownBefore: !!((knownBefore || {})[vid]),
          holderKnownAfter: !!((knownAfter || {})[vid]),
          slots: slots });
      } catch (e) { errors.push('teach-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  // NEEDWAVE: verbatim departure-beat lines for the sense-test.
  // Cheap filter (one regex per say call); only matches are kept.
  // Best-effort: if say is not wrappable, sayWrap stays false and
  // the sense-test instantiates the deterministic template instead.
  try {
    const sayOrig = Game.say;
    if (typeof sayOrig === 'function') {
      Game.say = function () {
        const ret = sayOrig.apply(this, arguments);
        try {
          const line = String(arguments[0] == null ? '' : arguments[0]);
          if (DEPART_BEAT_RE.test(line)) beatLines.push({ day: gday(Game), text: line });
          if (DRIFT_RE.test(line)) driftLines.push({ day: gday(Game), text: line });
        } catch (e) {}
        return ret;
      };
      sayWrap = true;
    }
  } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
  // NEEDWAVE: plan seeds — who gets a plan at all, and from what.
  wrapGame('winPlanSeedFromFight', function (orig) {
    return function (vid, mdef, outcome) {
      let before = null;
      try { const p0 = planOfGame(this, vid); before = p0 ? { stage: p0.stage || null, target: p0.target || null, needWave: (p0.needWave != null ? (p0.needWave | 0) : null) } : null; } catch (e) {}
      const ret = orig.apply(this, arguments);
      try {
        if (mdef && (mdef.wave | 0) >= 3) {
          let after = null;
          try { const p1 = planOfGame(this, vid); after = p1 ? { stage: p1.stage || null, target: p1.target || null, needWave: (p1.needWave != null ? (p1.needWave | 0) : null) } : null; } catch (e) {}
          planSeeds.push({ day: gday(Game), vid: vid || null, mid: mdef.id || null,
            wave: (mdef.wave | 0), outcome: outcome || null,
            seeded: !!ret, before: before, after: after });
        }
      } catch (e) { errors.push('planseed-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });

  // DEPARTTEACH: the dawn bid — every vbrainScorePick call, read AFTER
  // the call from vbrainLastLog + vbrainCommit (the log entry the call
  // just wrote, and the commit it left behind). Pure reads; the call
  // itself runs exactly once, untouched.
  wrapGame('vbrainScorePick', function (orig) {
    return function (vid, cands, opts) {
      const ret = orig.apply(this, arguments);
      try {
        let log = null, commit = null;
        try { log = (typeof this.vbrainLastLog === 'function') ? this.vbrainLastLog(vid) : null; } catch (e) {}
        try { commit = (typeof this.vbrainCommit === 'function') ? this.vbrainCommit(vid) : null; } catch (e) {}
        scorePicks.push({ day: gday(Game), part: (Game.dayPart | 0), vid: vid || null,
          pickKind: log ? (log.pick || null) : null,
          winPlanAction: log ? (log.winPlanAction || null) : null,
          override: log ? (log.override || null) : null,
          deferred: log ? (log.deferred || null) : null,
          commitKind: commit ? (commit.kind || null) : null,
          commitWinPlanAction: commit ? (commit.winPlanAction || null) : null,
          commitDay: commit ? (commit.day != null ? commit.day : null) : null });
      } catch (e) { errors.push('scorepick-log: ' + String(e.message).slice(0, 80)); }
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
              // NEEDWAVE daily census: one row per villager who holds
              // ANY plan or holds a gun (equipped/carried) — the two
              // populations the diagnosis compares. Dead gun holders
              // are skipped for attribution (ghost rule) but still
              // listed with dead:true so the analyzer can see them.
              try {
                const seen = {};
                const rows = [];
                const wp = ((Game.state || {}).village || {}).winPlan || {};
                for (const k of Object.keys(wp)) if (!seen[k]) { seen[k] = true; rows.push(k); }
                try {
                  const loc2 = gunLocationsOf(Game);
                  for (const l of (loc2.locations || [])) {
                    if ((l.loc === 'equipped' || l.loc === 'carried') && l.vid && !seen[l.vid]) { seen[l.vid] = true; rows.push(l.vid); }
                    if (l.loc === 'scholar-equipped' && !seen['__scholar__']) { seen['__scholar__'] = true; rows.push('__scholar__'); }
                  }
                } catch (e2) {}
                for (const vid of rows) {
                  let a = null;
                  try { a = attrsOf(Game, vid); } catch (e2) { a = null; }
                  if (a) {
                    // DEPARTTEACH: today's commit + last-log override/deferred
                    // for this holder, read at census time (pure reads).
                    let commitSnap = null;
                    try {
                      let c = null, lg = null;
                      try { c = (typeof Game.vbrainCommit === 'function') ? Game.vbrainCommit(vid) : null; } catch (e3) {}
                      try { lg = (typeof Game.vbrainLastLog === 'function') ? Game.vbrainLastLog(vid) : null; } catch (e3) {}
                      commitSnap = { winPlanAction: c ? (c.winPlanAction || null) : null,
                        kind: c ? (c.kind || null) : null, day: c ? (c.day != null ? c.day : null) : null,
                        override: lg ? (lg.override || null) : null,
                        deferred: lg ? (lg.deferred || null) : null };
                    } catch (e3) { commitSnap = null; }
                    planCensus.push({ day: d, vid: vid, attrs: a, commit: commitSnap });
                  }
                  else errors.push('plan-census-attrs-null: ' + vid);
                }
                // DEPARTTEACH: daily dawn pool — roster by range profile at
                // Haven + the findCompanion-eligible count (wanderer/
                // explorer at Haven, trust >= 15, alive, not away/engaged/
                // out). Replicates findCompanion's eligibility as pure
                // reads; no game function is called that writes or rolls.
                try {
                  const vv = ((Game.state || {}).village || {});
                  const roster = vv.roster || [];
                  const hx = (vv.px != null ? vv.px : 4), hy = (vv.py != null ? vv.py : 4);
                  const trust = vv.trust || {};
                  const away = vv.away || {};
                  let byProfileAtHaven = {};
                  let eligible = 0;
                  let ag = null;
                  try { ag = Game.agencyState ? Game.agencyState() : null; } catch (e2) {}
                  for (const rid of roster) {
                    let p = null;
                    try { p = Game.getPerson ? Game.getPerson(rid) : null; } catch (e2) {}
                    if (p && p.dead) continue;
                    if (away[rid]) continue;
                    let n = null;
                    try { n = Game.npcNode ? Game.npcNode(rid) : null; } catch (e2) {}
                    if (!n || n.nx !== hx || n.ny !== hy) continue;
                    let prof = null;
                    try { prof = Game.npcRangeProfile ? Game.npcRangeProfile(rid) : null; } catch (e2) {}
                    byProfileAtHaven[prof || 'unknown'] = (byProfileAtHaven[prof || 'unknown'] || 0) + 1;
                    if (rid === Game.villagerId) continue;
                    if (((trust[rid] === undefined) ? 10 : trust[rid]) < 15) continue;
                    try { if (Game.isEngaged && Game.isEngaged(rid)) continue; } catch (e2) {}
                    if (prof !== 'wanderer' && prof !== 'explorer') continue;
                    if (ag && ag.exped && ag.exped[rid]) continue;
                    eligible++;
                  }
                  dawnPool.push({ day: d, byProfileAtHaven: byProfileAtHaven, eligibleCompanions: eligible, rosterN: roster.length });
                } catch (e) { errors.push('dawn-pool: ' + String(e.message).slice(0, 80)); }
              } catch (e) { errors.push('plan-census: ' + String(e.message).slice(0, 80)); }
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
    seed: seed, arm: 'departteach-a', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, gameSha: GAME_SHA,
    winplanSha: WINPLAN_SHA, brainSha: BRAIN_SHA,
    gunrateOn: GUNRATE_ON, gunratePresent: GUNRATE_PRESENT,
    cellgateOn: CELLGATE_ON, cellgatePresent: CELLGATE_PRESENT,
    killbundleOn: KILLBUNDLE_ON, killbundlePresent: KILLBUNDLE_PRESENT,
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
    v4departs: v4departs, v4fights: v4fights, planSeeds: planSeeds,
    planCensus: planCensus,
    needWaveCopies: needWaveCopies, departBeats: departBeats,
    reseedBeats: reseedBeats, beatLines: beatLines, sayWrap: sayWrap,
    teachRows: teachRows, driftLines: driftLines,
    departCalls: departCalls, scorePicks: scorePicks, dawnPool: dawnPool,
  };
  return out;
}

if (require.main === module) (async function () {
  if (MODE !== 'ctl' && MODE !== 'arm') { console.error('CALLEDNAME STOP: MODE must be ctl or arm, got ' + JSON.stringify(MODE)); process.exit(2); }
  if (ANCHOR !== FROZEN_BASE) { console.error('CALLEDNAME STOP: HEAD ' + ANCHOR + ' is not the frozen prereg base ' + FROZEN_BASE + ' — refuse to run (fix stays uncommitted during both legs).'); process.exit(2); }
  if (process.env.PLANRESEED === '1') { console.error('CALLEDNAME STOP: PLANRESEED must be unset (both legs).'); process.exit(2); }
  if (!GUNRATE_ON) { console.error('CALLEDNAME STOP: GUNRATE=1 required (substrate).'); process.exit(2); }
  if (!CELLGATE_ON) { console.error('CALLEDNAME STOP: CELLGATE=1 required (substrate).'); process.exit(2); }
  if (KILLBUNDLE_ON) { console.error('CALLEDNAME STOP: KILLBUNDLE must be unset (both legs).'); process.exit(2); }
  if (LEND_ON) { console.error('CALLEDNAME STOP: LEND must be unset.'); process.exit(2); }
  if (process.env.PRESENCE === '1') { console.error('CALLEDNAME STOP: PRESENCE must be unset.'); process.exit(2); }
  if (process.env.HPGATE === '1') { console.error('CALLEDNAME STOP: HPGATE must be unset.'); process.exit(2); }
  if (process.env.PINQUAD === '1') { console.error('CALLEDNAME STOP: PINQUAD must be unset.'); process.exit(2); }
  if (!GUNRATE_PRESENT) { console.error('CALLEDNAME STOP: the GUNRATE lever code must be present.'); process.exit(2); }
  if (!CELLGATE_PRESENT) { console.error('CALLEDNAME STOP: the CELLGATE gate code must be present.'); process.exit(2); }
  if (!KILLBUNDLE_PRESENT) { console.error('CALLEDNAME STOP: the KILLBUNDLE lever code (game.js villagerKillLoot) must be present.'); process.exit(2); }
  if (!LEND_PRESENT) { console.error('CALLEDNAME STOP: the LEND lever code must be present.'); process.exit(2); }
  if (!SENSE_PRESENT) { console.error('CALLEDNAME STOP: the SENSEEXPED sense code must be present.'); process.exit(2); }
  if (!SENSEEXPED_ON) { console.error('CALLEDNAME STOP: SENSEEXPED=1 required (substrate).'); process.exit(2); }
  if (!BOWOPEN_ON) { console.error('CALLEDNAME STOP: BOWOPEN=1 required (substrate).'); process.exit(2); }
  if (!SPEARGATE_ON) { console.error('CALLEDNAME STOP: SPEARGATE=1 required (substrate).'); process.exit(2); }
  if (process.env.VETREENGAGE !== '1') { console.error('CALLEDNAME STOP: VETREENGAGE=1 required (substrate).'); process.exit(2); }
  if (process.env.PARTYSIZE4 !== '1') { console.error('CALLEDNAME STOP: PARTYSIZE4=1 required (substrate).'); process.exit(2); }
  if (process.env.FLEEREPAIR2 !== '1') { console.error('CALLEDNAME STOP: FLEEREPAIR2=1 required (substrate).'); process.exit(2); }
  if (process.env.FIGHTALLY2 !== '1') { console.error('CALLEDNAME STOP: FIGHTALLY2=1 required (substrate).'); process.exit(2); }
  if (!SEEDS.length) { console.error('CALLEDNAME STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-24', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'departteach-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('CALLEDNAME STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'departteach-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    const klSear = (out.killLootEvents || []).filter(function (e) { return e.dropId === 'searcaster'; }).length;
    const searVolleys = (out.volleyEvents || []).filter(function (e) { return e.rwId === 'searcaster' && (e.shots || 0) > 0; }).length;
    const searGrants = (out.grantEvents || []).filter(function (e) { return e.itemId === 'searcaster'; }).length;
    const w4launches = (out.v4departs || []).filter(function (r) { return r.result === 'launch'; }).length;
    const w4fights = (out.v4fights || []).length;
    const w4seeds = (out.planSeeds || []).filter(function (r) { return r.seeded; }).length;
    const w4attempts = (out.departCalls || []).filter(function (r) { return r.source === 'brain' && ((r.planNeedWave | 0) >= 4 || (r.planTarget && W4P_SET.has(r.planTarget))); }).length;
    const w4attemptLaunches = (out.departCalls || []).filter(function (r) { return r.source === 'brain' && r.result === 'launch' && ((r.planNeedWave | 0) >= 4 || (r.planTarget && W4P_SET.has(r.planTarget))); }).length;
    const scorePickRows = (out.scorePicks || []).length;
    const partyLaunchPicks = (out.scorePicks || []).filter(function (r) { return r.winPlanAction === 'party_launch'; }).length;
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      gameSha: out.gameSha, killbundleOn: out.killbundleOn, killbundlePresent: out.killbundlePresent,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      deaths: out.deaths.length,
      contests: out.contestEvents ? out.contestEvents.length : 0,
      prizeRolls: out.prizeEvents ? out.prizeEvents.length : 0,
      searGrants: searGrants,
      killLoot: out.killLootEvents ? out.killLootEvents.length : 0,
      klSearcaster: klSear,
      searVolleys: searVolleys,
      corpseTakes: out.corpseTakeEvents ? out.corpseTakeEvents.length : 0,
      gunLocRows: out.v4gunLoc ? out.v4gunLoc.length : 0,
      gunTotalEnd: out.v4gunLoc && out.v4gunLoc.length ? out.v4gunLoc[out.v4gunLoc.length - 1].total : null,
      w4launches: w4launches, w4fights: w4fights, w4seeds: w4seeds,
      w4attempts: w4attempts, w4attemptLaunches: w4attemptLaunches,
      scorePickRows: scorePickRows, partyLaunchPicks: partyLaunchPicks,
      departCallRows: out.departCalls ? out.departCalls.length : 0,
      planCensusRows: out.planCensus ? out.planCensus.length : 0,
      nwCopies: out.needWaveCopies ? out.needWaveCopies.length : 0,
      departBeats: out.departBeats ? out.departBeats.length : 0,
      ordinaryBeats: (out.departBeats || []).filter(function (b) { return b.ordinarySpoke; }).length,
      beatLines: out.beatLines ? out.beatLines.length : 0, sayWrap: !!out.sayWrap,
      teachRows: out.teachRows ? out.teachRows.length : 0,
      teachSlots: (out.teachRows || []).reduce(function (a, r) { return a + (r.slots || []).length; }, 0),
      taughtSlots: (out.teachRows || []).reduce(function (a, r) { return a + (r.slots || []).filter(function (s) { return s.taught; }).length; }, 0),
      driftLines: out.driftLines ? out.driftLines.length : 0,
      winplanSha: out.winplanSha, brainSha: out.brainSha,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, gunLocationsOf: gunLocationsOf,
  classifyGrantCaller: classifyGrantCaller,
  grantRecipientOf: grantRecipientOf, firstCallerFrame: firstCallerFrame,
  snapshotGunCells: snapshotGunCells, diffGunCells: diffGunCells,
  rangedKitOf: rangedKitOf, countItemIn: countItemIn, cellCountIn: cellCountIn,
  itemIdOf: itemIdOf, gday: gday, attrsOf: attrsOf, gearOfReplica: gearOfReplica,
  planOfGame: planOfGame, W4P_SET: W4P_SET,
  snapshotNeedWaves: snapshotNeedWaves, diffNeedWaves: diffNeedWaves,
  snapshotKnownNames: snapshotKnownNames };
