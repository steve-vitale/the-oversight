#!/usr/bin/env node
// hatchequip-trace-b.js — stashed-hatchet equip-choice recorder
// (sim-hatchequip-b; prereg: evidence/2026-10-30/sim-hatchequip-b-prereg.md,
// committed BEFORE any judged leg).
// DIAG ONLY, zero src/js changes, zero policy-default flips. Wrappers below
// call the original function with the original arguments and return its
// return value unchanged; they append to in-memory logs only. No state edit,
// no verb call, no clock-setting, no top-up, no travelTo.
// Substrate identical to the axeacq guard leg (nighttravel + woodcarry,
// WOODWARM=0) so traces are comparable to the axeacq corpus.
// Env gates (FATAL unless exact): COMPETENT_FEAST=0 SEATDRIVE=0
// PLENTYDEPRI=0 DEPOSITGATE=1 POLICY=nighttravel WOODCARRY=1 WOODWARM=0.
// SEEDS default 16101-16116; DAYS default 60.
// OUTDIR default evidence/2026-10-30/sim-hatchequip-b-corpus.
// Write transport mirrors axeacq: failed writes kept in memory, flushed at
// end; deadline exhaustion stages inside this worktree (.hatchequip-staging,
// never /tmp) and exits loudly.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (process.env.WOODCARRY !== '1') { console.error('FATAL: WOODCARRY must be 1'); process.exit(2); }
if (process.env.WOODWARM !== '0') { console.error('FATAL: WOODWARM must be 0 (guard leg)'); process.exit(2); }
if (process.env.POLICY !== 'nighttravel') { console.error('FATAL: POLICY must be nighttravel'); process.exit(2); }
if (process.env.WOODDAY === '1') { console.error('FATAL: no woodday probe in this driver'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '16101,16102,16103,16104,16105,16106,16107,16108,16109,16110,16111,16112,16113,16114,16115,16116')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '60', 10);
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-30', 'sim-hatchequip-b-corpus');
const STAGING_DIR = path.join(__dirname, '..', '.hatchequip-staging');

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
const idOf = (e) => (e && (e.itemId || e.id)) || (typeof e === 'string' ? e : null);
const idsOf = (arr) => (arr || []).map(idOf).filter(Boolean);
function stackTop(n) {
  try {
    const st = (new Error().stack || '').split('\n').slice(2, 2 + (n || 5))
      .map((l) => l.trim().replace(/^at\s+/, '').replace(/.*\/([^\/:]+\.js):(\d+).*/, '$1:$2'));
    return st;
  } catch (e) { return []; }
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'nighttravel-b', fullTelemetry: false });
  const log = {
    gearUpVessel: [], gearUpOther: { total: 0, acquireTrue: 0, acquireFalse: 0 },
    autoEquipVessel: [], autoEquipOther: 0,
    crafts: [], craftCounts: {}, equips: [], hatchetLines: [],
    wrapErrors: [],
  };
  const dayOf = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const vesselId = () => { try { return Game.villagerId || null; } catch (e) { return null; } };
  function personSnap(vid) {
    try {
      const p = (typeof Game.getPerson === 'function' && vid) ? Game.getPerson(vid) : null;
      if (!p) return null;
      const eq = p.equipped || {};
      const melee = eq.melee || eq.weapon || null;
      let wb = null;
      try {
        const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
        if (S.equipment && S.equipment.weaponBonusOf) wb = S.equipment.weaponBonusOf(p, Game.data.items) || 0;
      } catch (e) {}
      return { stash: idsOf(p.stashed), items: idsOf(p.items), eq: idsOf(Object.values(eq)), melee: melee ? idOf(melee) : null, wb };
    } catch (e) { return { error: String((e && (e.message || e)) || e).slice(0, 200) }; }
  }
  function scholarSnap() {
    try {
      const sch = (Game.state || {}).scholar || {};
      const eq = sch.equipped || {};
      return { inv: idsOf(sch.inventory), eq: idsOf(Object.values(eq)) };
    } catch (e) { return { error: String((e && (e.message || e)) || e).slice(0, 200) }; }
  }
  // --- wrappers (log-only; original called with original args, value returned) ---
  try {
    const origGearUp = Game.villagerGearUp;
    if (typeof origGearUp === 'function') {
      Game.villagerGearUp = function (vid, acquire) {
        const isVessel = (vid === vesselId());
        let pre = null;
        if (isVessel) pre = personSnap(vid);
        else log.gearUpOther.total++;
        const ret = origGearUp.apply(this, arguments);
        if (isVessel) {
          log.gearUpVessel.push({ day: dayOf(), vid, acquire: !!acquire, pre, post: personSnap(vid), stack: stackTop(6) });
        } else {
          if (acquire) log.gearUpOther.acquireTrue++; else log.gearUpOther.acquireFalse++;
        }
        return ret;
      };
    }
  } catch (e) { log.wrapErrors.push('gearUp:' + String((e && e.message) || e).slice(0, 120)); }
  try {
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    const eqObjs = [];
    if (S.equipment) eqObjs.push(S.equipment);
    try { const S2 = (typeof globalThis !== 'undefined' ? globalThis.S : null) || {}; if (S2.equipment && eqObjs.indexOf(S2.equipment) < 0) eqObjs.push(S2.equipment); } catch (e) {}
    for (const eqObj of eqObjs) {
      if (typeof eqObj.autoEquip !== 'function' || eqObj.autoEquip.__hatchequipWrapped) continue;
      const orig = eqObj.autoEquip;
      const wrapped = function (v, itemDefs) {
        const isVessel = !!(v && (v.id === vesselId() || v === ((Game.state || {}).scholar || null)));
        let preMelee = null;
        if (isVessel) { try { const eq = v.equipped || {}; const m = eq.melee || eq.weapon || null; preMelee = m ? idOf(m) : null; } catch (e) {} }
        const ret = orig.apply(this, arguments);
        if (isVessel) {
          try { const eq = v.equipped || {}; const m = eq.melee || eq.weapon || null; log.autoEquipVessel.push({ day: dayOf(), preMelee, postMelee: m ? idOf(m) : null, hadHatchetInItems: idsOf(v.items).indexOf('hatchet') >= 0, stack: stackTop(5) }); } catch (e) {}
        } else log.autoEquipOther++;
        return ret;
      };
      wrapped.__hatchequipWrapped = true;
      eqObj.autoEquip = wrapped;
    }
  } catch (e) { log.wrapErrors.push('autoEquip:' + String((e && e.message) || e).slice(0, 120)); }
  try {
    const origCraft = Game.craft;
    if (typeof origCraft === 'function') {
      Game.craft = function (recipeId) {
        const ret = origCraft.apply(this, arguments);
        log.craftCounts[recipeId] = (log.craftCounts[recipeId] || 0) + 1;
        if (log.crafts.length < 5000) log.crafts.push({ day: dayOf(), recipe: recipeId, ok: !!ret });
        return ret;
      };
    }
  } catch (e) { log.wrapErrors.push('craft:' + String((e && e.message) || e).slice(0, 120)); }
  try {
    const origEquip = Game.equip;
    if (typeof origEquip === 'function') {
      Game.equip = function (index, slot) {
        let itemId = null;
        try { const inv = (Game.state.scholar || {}).inventory || []; itemId = idOf(inv[index]); } catch (e) {}
        const ret = origEquip.apply(this, arguments);
        let ok = false;
        try { const eq = (Game.state.scholar || {}).equipped || {}; ok = !!((eq[slot] && idOf(eq[slot]) === itemId)); } catch (e) {}
        if (log.equips.length < 5000) log.equips.push({ day: dayOf(), slot, item: itemId, ok });
        return ret;
      };
    }
  } catch (e) { log.wrapErrors.push('equip:' + String((e && e.message) || e).slice(0, 120)); }
  try {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { const line = String(args[0] || ''); if (/hatchet/i.test(line) && log.hatchetLines.length < 500) log.hatchetLines.push({ day: dayOf(), line: line.slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  } catch (e) { log.wrapErrors.push('say:' + String((e && e.message) || e).slice(0, 120)); }

  await setupGame(Game);
  const vid = vesselId();
  let spawnPool = null;
  try {
    const pp = (typeof Game.getPerson === 'function' && vid) ? Game.getPerson(vid) : null;
    if (pp) spawnPool = { fullPool: idsOf(pp.fullPool), stashed: idsOf(pp.stashed) };
  } catch (e) { spawnPool = { error: String((e && (e.message || e)) || e).slice(0, 200) }; }
  const spawnSnap = { person: personSnap(vid), scholar: scholarSnap(), pool: spawnPool };
  try { const wt = (typeof Game.woodcutTier === 'function') ? Game.woodcutTier() : null; spawnSnap.tier = wt ? (wt.tier || null) : null; } catch (e) {}
  try { const ci = (typeof Game.cutInfo === 'function') ? Game.cutInfo('bigtree') : null; spawnSnap.canFell = ci ? !!ci.canFell : null; } catch (e) {}

  const mornings = [];
  let callIdx = 0;
  const wcStore = newStore();
  const base = withWoodcarry(nighttravel, wcStore);
  const wwStore = newWwStore();
  const warmed = withWoodwarm(base, wwStore);
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      if (callIdx > 1) {
        const p = personSnap(vid);
        const s = scholarSnap();
        let tier = null, canFell = null;
        try { const wt = (typeof Game2.woodcutTier === 'function') ? Game2.woodcutTier() : null; if (wt) tier = wt.tier || null; } catch (e) {}
        try { const ci = (typeof Game2.cutInfo === 'function') ? Game2.cutInfo('bigtree') : null; if (ci) canFell = !!ci.canFell; } catch (e) {}
        mornings.push({ loopDay: callIdx, gameDay: (Game2.state.scholar || {}).day || 0, person: p, scholar: s, tier, canFell });
      }
      warmed.daily(Game2, ctx);
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  let endState = null;
  try {
    endState = { villageLost: !!Game.villageLost, won: !!((result.stop || {}).won) };
  } catch (e) { endState = { error: String((e && (e.message || e)) || e).slice(0, 200) }; }
  return {
    seed, policy: 'nighttravel', woodcarry: 1, woodwarm: 0, days: DAYS,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, endState,
    spawnSnap, mornings, log,
    woodcarryStore: { records: wcStore.records, errs: wcStore.errs },
    warmthStore: { acted: wwStore.acted, errs: wwStore.errs },
  };
}

(async () => {
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    done++;
    const name = `hatchequip-b-nighttravel-s${seed}.json`;
    const summary = `hatchequip seed=${seed} end=${inst.endReason} days=${inst.daysAlive} mornings=${inst.mornings.length} gearUpVessel=${inst.log.gearUpVessel.length} gearUpOther=${inst.log.gearUpOther.total} crafts=${inst.log.crafts.length} equips=${inst.log.equips.length}`;
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
  console.log('wrote ' + done + ' hatchequip files to ' + OUTDIR);
})().catch((e) => { console.error('HATCHEQUIP CRASH', e && (e.stack || e)); process.exit(2); });
