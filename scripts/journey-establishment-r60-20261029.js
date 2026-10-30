#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) R60 — POST-FIX-ALL-ARMOR RE-MEASUREMENT
// (2026-10-29 run, scheduled 09:45 CDT). Rotation index 1 (establishment; this run plays it and
// verifies the 1->2 write at landing). Base: master 4f349fed1 at run start.
// r57 driver verbatim EXCEPT all r57->r60 filenames. The r57 question
// (bridge absent?) is re-asked because the base moved: fix-all armor landed
// 9c650f840 (craft + armory pile live-enabled, bark inflow 15->30%) and
// build-armor landed 062e07a7a (up to 3 seeded bark wearers at creation).
// ARMORVILLAGE env is no longer needed (gates removed); it is harmless if set.
// MEASUREMENT ONLY: this run lands no armor-code change.
// PRE-REGISTRATION: see hidden_files/evidence/2026-10-29/journey-establishment-r60-prereg.md
// (written BEFORE the panel run; pilot is seed 209, run first).
// Usage: SEEDS=209 DAYS=42 node scripts/journey-establishment-r60-20261029.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-29';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const LIGHT = process.env.LIGHT === '1';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [209, 228, 238, 239]);
const DAYS = parseInt(process.env.DAYS || '42', 10);
const TASKS = ['butcher', 'cook', 'spotter', 'builder', 'preserver'];
// Pristine tables (pre-r35, hardcoded) for the C1/C2 counterfactual re-score.
const OLD = {
  butcher: [['hunter', 3], ['line cook / hunter', 3], ['veterinary tech', 3], ['veterinarian', 3], ['fisherman', 2], ['chef', 2], ['sushi chef', 2], ['farmer', 2], ['park ranger', 2], ['butcher', 3]],
  cook: [['chef', 3], ['sushi chef', 3], ['line cook / hunter', 2], ['cafeteria manager', 2], ['cook', 2], ['baker', 2]],
  spotter: [['botanist', 3], ['gardener', 2], ['farmer', 2], ['hiker', 2], ['park ranger', 2], ['herbalist', 3]],
  builder: [['carpenter', 3], ['construction worker', 3], ['engineer', 2], ['mechanic', 1]],
  preserver: [['fisherman', 3], ['fishing guide', 2], ['hunting guide', 2], ['sailor', 2], ['chef', 2], ['line cook', 2], ['butcher', 2], ['farmer', 2], ['rancher', 2], ['beekeeper', 1], ['mushroom grower', 1]],
};
function oldSkill(occ, task) {
  const o = String(occ || '').toLowerCase();
  let s = 0;
  for (const [m, v] of (OLD[task] || [])) { if (o.includes(m)) s = Math.max(s, v); }
  return s;
}

const _warned = {};
function warnOnce(key, e) {
  if (_warned[key]) return;
  _warned[key] = true;
  console.warn('[r60:' + key + ']', (e && e.message) || e);
}
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function packKcal(Game) {
  try {
    return (((Game.state.scholar || {}).inventory) || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function livingVids(Game) {
  try {
    const v = Game.state.village || {};
    return (v.roster || []).filter(id => {
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) { warnOnce('livingVids', e); }
      return true;
    });
  } catch (e) { return []; }
}
function nameOf(Game, id) {
  try { return id === 'player' ? 'You' : (Game.displayName ? Game.displayName(id) : id); } catch (e) { return String(id); }
}
function occOf(Game, vid) {
  try { const p = Game.getPerson ? Game.getPerson(vid) : {}; return p.occupation || p.formerOccupation || '?'; } catch (e) { return '?'; }
}
function skillOf(Game, vid, task) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    return (Game.specialistSkill ? Game.specialistSkill(p || {}, task) : 0) || 0;
  } catch (e) { return 0; }
}
function tierOf(Game) {
  try { return Game.havenTier ? Game.havenTier() : ((Game.state.village || {}).havenTier || 0); } catch (e) { return 0; }
}
function storesOf(Game) {
  try {
    if (Game.havenStores) { const s = Game.havenStores(); return { food: s.food, wood: s.wood, stone: s.stone }; }
  } catch (e) { warnOnce('havenStores', e); }
  return { food: Math.round(pantryKcal(Game)), wood: 0, stone: 0 };
}
function census(Game) {
  const rows = [];
  for (const id of livingVids(Game)) {
    const occ = occOf(Game, id);
    const row = { id: String(id), name: nameOf(Game, id), occ };
    for (const t of TASKS) {
      row[t] = skillOf(Game, id, t);
      row['old_' + t] = oldSkill(occ, t);
    }
    rows.push(row);
  }
  return rows;
}
function censusSummary(rows) {
  const out = {};
  for (const t of TASKS) {
    out[t] = {
      n1: rows.filter(r => r[t] >= 1).length,
      n2: rows.filter(r => r[t] >= 2).length,
      old_n1: rows.filter(r => r['old_' + t] >= 1).length,
      names: rows.filter(r => r[t] >= 1).map(r => r.name + ' (' + r.occ + ':' + r[t] + ')'),
    };
  }
  return out;
}
function gearCensus(Game) {
  const rows = [];
  try {
    const v = Game.state.village || {};
    const mats = Object.assign({}, (v.stash && v.stash.materials) || {});
    const av = v.avCraft || {};
    for (const id of livingVids(Game)) {
      let p = null;
      try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
      if (!p) { rows.push({ id: String(id), name: nameOf(Game, id), equipped: [], spares: [] }); continue; }
      let equipped = [];
      try { equipped = Object.values(p.equipped || {}).map(e => e && e.itemId).filter(Boolean); } catch (e) {}
      let spares = [];
      try { spares = (p.items || []).filter(it => it && (it.itemId === 'bark_armor' || it.itemId === 'hide_armor')).map(it => it.itemId); } catch (e) {}
      rows.push({ id: String(id), name: nameOf(Game, id), equipped, spares,
        armorPieces: equipped.filter(x => x === 'bark_armor' || x === 'hide_armor').concat(spares),
        avCraft: av[String(id)] || null });
    }
    return { day: nowDay(Game), stashMaterials: mats, villagers: rows,
      wornBark: rows.filter(r => r.equipped.includes('bark_armor')).length,
      wornHide: rows.filter(r => r.equipped.includes('hide_armor')).length,
      sparePieces: rows.reduce((t, r) => t + r.spares.length, 0) };
  } catch (e) { warnOnce('gearCensus', e); return { error: String(e && e.message || e) }; }
}
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('policy.setup', e); } }

  // ---- R44 H INSTRUMENT (read-only logging) ----
  // Wraps the health funnels WITHOUT mutating state or consuming RNG:
  // hurtVillager (expedition flee + fight + sickness damage all funnel
  // here), hurtFromStarvation, expedHurt (narrative scar), and
  // villageSicknessTick (health-map diff across the tick). Also a
  // per-part health+sick snapshot after every day-part. This names the
  // hit behind r43's 239 Stepan crash (health 99 at d23 meal -> 17 at
  // d24 meal): sickness ticks deal 1+sev*2, so a -82 crash must come
  // through hurtVillager or not at all.
  let curPart = -1;
  const hurtLog = [], sickTickLog = [], healthSnaps = [];
  function healthMap() {
    const m = {};
    try {
      const hm = ((Game.state.village || {}).health || {});
      for (const id of livingVids(Game)) m[String(id)] = (hm[id] !== undefined ? hm[id] : null);
      const sch = Game.state.scholar || {};
      if (sch.health !== undefined) m.player = sch.health;
    } catch (e) { warnOnce('healthMap', e); }
    return m;
  }
  function sickMap() {
    const m = {};
    try {
      const sk = ((Game.state.village || {}).sick || {});
      for (const id of Object.keys(sk)) {
        const r = sk[id] || {};
        m[String(id)] = { name: r.name || null, severity: r.severity || null, daysLeft: r.daysLeft || null, diagnosed: r.diagnosed || null };
      }
    } catch (e) { warnOnce('sickMap', e); }
    return m;
  }
  function snapHealth(tag) {
    try { healthSnaps.push({ day: nowDay(Game), part: curPart, tag, health: healthMap(), sick: sickMap() }); }
    catch (e) { warnOnce('snapHealth', e); }
  }
  function wrapHurt(name) {
    const orig = (typeof Game[name] === 'function') ? Game[name].bind(Game) : null;
    if (!orig) return;
    Game[name] = function () {
      const args = Array.prototype.slice.call(arguments);
      const vid = args[0];
      let before = null;
      try { before = healthMap()[String(vid)]; } catch (e) {}
      const r = orig.apply(Game, args);
      let after = null;
      try { after = healthMap()[String(vid)]; } catch (e) {}
      try {
        hurtLog.push({ day: nowDay(Game), part: curPart, fn: name, vid: String(vid), name: nameOf(Game, vid),
          argDmg: (args[1] !== undefined ? args[1] : null), cause: (args[2] !== undefined ? String(args[2]) : null),
          healthBefore: before, healthAfter: after });
      } catch (e) { warnOnce('hurtLog', e); }
      return r;
    };
  }
  wrapHurt('hurtVillager');
  wrapHurt('hurtFromStarvation');
  wrapHurt('expedHurt');
  const _vst = (typeof Game.villageSicknessTick === 'function') ? Game.villageSicknessTick.bind(Game) : null;
  if (_vst) Game.villageSicknessTick = function () {
    const before = healthMap(), sickBefore = sickMap();
    const r = _vst();
    try {
      const after = healthMap(), sickAfter = sickMap();
      const changed = [];
      for (const id of new Set([...Object.keys(before), ...Object.keys(after)])) {
        if (before[id] !== after[id]) changed.push({ vid: id, name: nameOf(Game, id), before: before[id], after: after[id] });
      }
      if (changed.length) sickTickLog.push({ day: nowDay(Game), part: curPart, changed, sickBefore, sickAfter });
    } catch (e) { warnOnce('sickTickLog', e); }
    return r;
  };
  snapHealth('setup');
  // ---- end R44 H instrument ----

  // ---- R45 S INSTRUMENT (read-only logging) ----
  // Wraps the scholar (player) health funnel the way r44 wrapped the
  // villager funnels: Game.addHealth is the scholar's damage/heal
  // entry (betrayal ambushes, disease, food risks, feast heals all
  // funnel here). The wrapper calls the original exactly once, so
  // RNG consumption is identical to the unwrapped game; it only
  // records amount, opts.scene/minHealth, and scholar health
  // before/after. Closes r44's open instrument gap (player-drop
  // coverage was unwrapped: villager drops used hurtVillager, but
  // scholar drops flow through addHealth).
  const scholarHurtLog = [];
  let scholarWrap = false;
  const _ah = (typeof Game.addHealth === 'function') ? Game.addHealth.bind(Game) : null;
  if (_ah) {
    scholarWrap = true;
    Game.addHealth = function () {
      const args = Array.prototype.slice.call(arguments);
      let before = null;
      try { before = healthMap().player; } catch (e) {}
      const r = _ah.apply(Game, args);
      let after = null;
      try { after = healthMap().player; } catch (e) {}
      try {
        scholarHurtLog.push({ day: nowDay(Game), part: curPart, amount: (args[0] !== undefined ? args[0] : null),
          scene: (args[1] && args[1].scene) ? String(args[1].scene) : null,
          minHealth: (args[1] && args[1].minHealth !== undefined) ? args[1].minHealth : null,
          healthBefore: before, healthAfter: after });
      } catch (e) { warnOnce('scholarHurtLog', e); }
      return r;
    };
  }
  // ---- R46 T INSTRUMENT (read-only logging) ----
  // Wraps Game.tbDamage, the choke point that syncs fighter 'p' hp into
  // scholar.health (game.js ~37050). r45 proved addHealth does NOT cover
  // scholar damage; this wrap logs every tbDamage call whose target is
  // the player fighter, with fighter hp + scholar health before/after,
  // so the analyzer can sum landed damage over the day-1..day window
  // for each scholar snap drop >= 30. Calls the original exactly once;
  // no state mutation, no RNG consumption (tbDamage's own RNG untouched).
  const tbDamageLog = [];
  let tbDamageWrap = false;
  const _tbd = (typeof Game.tbDamage === 'function') ? Game.tbDamage.bind(Game) : null;
  function tbPlayerHp() {
    try { const f = Game.tbFighter ? Game.tbFighter('p') : null; return f ? f.hp : null; } catch (e) { return null; }
  }
  if (_tbd) {
    tbDamageWrap = true;
    Game.tbDamage = function (key, dmg, src, srcKey, opts) {
      let hpBefore = null, schBefore = null;
      try { hpBefore = tbPlayerHp(); schBefore = healthMap().player; } catch (e) {}
      const r = _tbd(key, dmg, src, srcKey, opts);
      try {
        if (String(key) === 'p') tbDamageLog.push({ day: nowDay(Game), part: curPart,
          dmgArg: (dmg !== undefined ? dmg : null), src: (src !== undefined ? String(src) : null),
          hpBefore, hpAfter: tbPlayerHp(), schBefore, schAfter: healthMap().player,
          landed: (hpBefore != null && tbPlayerHp() != null) ? (hpBefore - tbPlayerHp()) : null });
      } catch (e) { warnOnce('tbDamageLog', e); }
      return r;
    };
  }
  // ---- R45 G INSTRUMENT (read-only logging) ----
  // Wraps Game._cxGossip (contest-outcome gossip seeding): one entry
  // per (day, contest, how, pid) with partKey, so multi-take
  // co-winners each seed their own entry under the same show name.
  // The wrapper calls the original exactly once (the original's own
  // heard-pick RNG is untouched) and logs the seed. Lets the r45
  // analyzer adjudicate any double-winner gossip line in held convos:
  // two distinct pids for that contest+how = co-winners (r44's
  // hypothesis); one pid = a real double-count bug.
  const gossipLog = [];
  let gossipWrap = false;
  const _cxg = (typeof Game._cxGossip === 'function') ? Game._cxGossip.bind(Game) : null;
  if (_cxg) {
    gossipWrap = true;
    Game._cxGossip = function (how, pid, contestName) {
      const r = _cxg(how, pid, contestName);
      try {
        const day = nowDay(Game);
        gossipLog.push({ day, how: String(how), pid: String(pid), name: nameOf(Game, pid), contest: contestName || null,
          partKey: day + ':contest:' + (contestName || '') + ':' + how + ':' + pid });
      } catch (e) { warnOnce('gossipLog', e); }
      return r;
    };
  }

  // ---- R49 T-COMBINED INSTRUMENT (read-only logging) ----
  // Wraps Game.sysSay and parses ONLY the two contest-damage narrations
  // (contests.js: 'You take N damage.' and 'The lights take their cut...
  // (-5 health.)' - the only two such lines in src/js). Calls the original
  // exactly once; logs day + amount; no state mutation, no RNG. Combined
  // with tbDamageLog, the analyzer can test whether tbDamage + contest
  // damage covers every scholar snap drop >= 30 (r46: 3 covered, 2 contest).
  const contestDamageLog = [];
  let contestDamageWrap = false;
  const _sys = (typeof Game.sysSay === 'function') ? Game.sysSay.bind(Game) : null;
  if (_sys) {
    contestDamageWrap = true;
    Game.sysSay = function (...args) {
      const r = _sys(...args);
      try {
        const text = args.map(a => String(a)).join(' ');
        let m = text.match(/You take (\d+) damage/);
        if (m) contestDamageLog.push({ day: nowDay(Game), kind: 'contest-damage', amt: parseInt(m[1], 10), text: text.slice(0, 120) });
        else if (/lights take their cut/.test(text)) contestDamageLog.push({ day: nowDay(Game), kind: 'lights-cut', amt: 5, text: text.slice(0, 120) });
      } catch (e) { warnOnce('contestDamageLog', e); }
      return r;
    };
  }

  // ---- R43 INTAKE INSTRUMENT (read-only) ----
  // Wraps villagerMealDay + villageEats after load. The wraps record
  // returns and pantry snapshots only: no state mutation, no RNG.
  // Streak signal uses the villageEats definition exactly:
  //   !fasting && ate < 0.6 * needBase, needBase = kcalPerDay (x0.5
  //   under a voted ration). ownEat = ate - drawn (ate = ownEat +
  //   pantry/pack draw, by villagerMealDay's own accounting).
  const intakeDays = [];
  let _mealRows = null, _mealDay = null;
  function pantrySnap(Game) {
    try {
      const v = Game.state.village || {};
      let total = 0, fresh = 0, zeroUnits = 0, slab = 0;
      const items = [];
      for (const it of (v.pantry || [])) {
        const k = (it.kcalEach || 0) * (it.units || 0);
        total += k;
        let spoiled = false;
        try { spoiled = !!(Game.isSpoiled && Game.isSpoiled(it)); } catch (e) {}
        if (!spoiled) fresh += k;
        if (!(it.kcalEach > 0)) zeroUnits += (it.units || 0);
        if ((it.kcalEach || 0) > 2000) slab += k;
        items.push({ name: it.name || it.itemId || '?', kcalEach: it.kcalEach || 0, units: it.units || 0,
          spoilDay: (it.spoilDay === undefined ? null : it.spoilDay), foodState: it.foodState || null,
          foodKind: it.foodKind || null, spoiled });
      }
      return { day: nowDay(Game), total: Math.round(total), fresh: Math.round(fresh),
        zeroKcalUnits: zeroUnits, slabKcal: Math.round(slab), items };
    } catch (e) { return { day: nowDay(Game), error: e.message }; }
  }
  const _vmd = (typeof Game.villagerMealDay === 'function') ? Game.villagerMealDay.bind(Game) : null;
  if (_vmd) Game.villagerMealDay = function (vid, person, v, ctxArg) {
    let pre = null;
    try { pre = pantrySnap(Game); } catch (e) {}
    const r = _vmd(vid, person, v, ctxArg);
    try {
      const day = nowDay(Game);
      const away = !!(v.away && v.away[vid]);
      const health = (v.health && v.health[vid] != null) ? v.health[vid] : null;
      const prod = ((v.contribLog || {})[vid] || {}).produced;
      const needBase = (person.kcalPerDay || 2000) * ((v.rationing && v.rationing.until >= day) ? 0.5 : 1);
      let rhythm = null;
      try { rhythm = Game.mealRhythm ? Game.mealRhythm(vid) : null; } catch (e) {}
      const row = { day, vid: String(vid), name: nameOf(Game, vid), ate: Math.round(r.ate || 0),
        drawn: Math.round(r.drawn || 0), ownEat: Math.round((r.ate || 0) - (r.drawn || 0)),
        fasting: !!r.fasting, away, health, produced: (prod === undefined ? null : prod),
        needBase: Math.round(needBase), starving: (!r.fasting && (r.ate || 0) < needBase * 0.6),
        rhythm, pantryBefore: pre ? pre.total : null, freshBefore: pre ? pre.fresh : null };
      if (!_mealRows || _mealDay !== day) { _mealRows = []; _mealDay = day; }
      _mealRows.push(row);
    } catch (e) { warnOnce('intakeRow', e); }
    return r;
  };
  const _ve = (typeof Game.villageEats === 'function') ? Game.villageEats.bind(Game) : null;
  if (_ve) Game.villageEats = function () {
    const snap = pantrySnap(Game);
    _mealRows = []; _mealDay = nowDay(Game);
    const r = _ve();
    try { intakeDays.push({ day: nowDay(Game), pantrySnap: snap, meals: _mealRows.slice(),
      starving: _mealRows.filter(x => x.starving).map(x => x.vid) }); } catch (e) { warnOnce('intakeDay', e); }
    _mealRows = null;
    return r;
  };
  // ---- end R43 intake instrument ----

  const dayLines = {};
  Game.say = function (...a) {
    try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SAY: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('say', e); }
  };
  if (typeof Game.sysSay === 'function') {
    // R49 FIX: the dayLines wrapper below REPLACES the earlier contest-damage
    // wrap (both assign Game.sysSay; later wins), so the contest parse lives
    // HERE, in the winning wrapper. Same two narrations, same read-only rule.
    Game.sysSay = function (...a) {
      try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SYS: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('sysSay', e); }
      try {
        const text = a.map(x => String(x)).join(' ');
        let m = text.match(/You take (\d+) damage/);
        if (m) contestDamageLog.push({ day: nowDay(Game), kind: 'contest-damage', amt: parseInt(m[1], 10), text: text.slice(0, 120) });
        else if (/lights take their cut/.test(text)) contestDamageLog.push({ day: nowDay(Game), kind: 'lights-cut', amt: 5, text: text.slice(0, 120) });
      } catch (e) { warnOnce('contestDamageLog2', e); }
    };
  }

  // ---- R49 MEAT INSTRUMENT (read-only logging) ----
  // Measures Steve 2026-10-27's haul->reveal->test->cook channel WITHOUT
  // changing it: per-dawn snapshots of every meat_* stack in pantry/pack/
  // prepStash (units, kcalEach, edible, foodState) + codex tested/safe mids
  // + a read-only testMonsterMeat call counter. All wraps call the original
  // exactly once, log only, no state mutation, no RNG consumption.
  const meatTrace = [];
  const meatTestCalls = [];
  let meatWrap = false;
  function meatSnap() {
    try {
      const scan = (cont) => {
        const out = [];
        for (const it of (cont || [])) {
          if (!it) continue;
          const pid = String(it.plantId || '');
          if (pid.startsWith('meat_') || String(it.name || '') === 'unknown flesh') {
            out.push({ plantId: pid || null, name: it.name || null, units: it.units || 0,
              kcalEach: it.kcalEach || 0, edible: !!it.edible, foodState: it.foodState || null,
              foodKind: it.foodKind || null, spoilDay: (it.spoilDay === undefined ? null : it.spoilDay) });
          }
        }
        return out;
      };
      const codex = [];
      try {
        const cm = (Game.state.codex || {}).monsters || {};
        for (const mid of Object.keys(cm)) {
          const e = cm[mid] || {};
          if (e.foodTested !== undefined || e.foodSafe !== undefined || e.foodTestedBy !== undefined)
            codex.push({ mid, foodTested: e.foodTested || null, foodSafe: (e.foodSafe === undefined ? null : e.foodSafe), foodTestedBy: e.foodTestedBy || null });
        }
      } catch (e) { warnOnce('meatCodex', e); }
      return { day: nowDay(Game),
        pantry: scan((Game.state.village || {}).pantry),
        pack: scan((Game.state.scholar || {}).inventory),
        prep: scan((Game.state.scholar || {}).prepStash),
        codexTested: codex };
    } catch (e) { return { day: nowDay(Game), error: e.message }; }
  }
  const _tmm = (typeof Game.testMonsterMeat === 'function') ? Game.testMonsterMeat.bind(Game) : null;
  if (_tmm) {
    meatWrap = true;
    Game.testMonsterMeat = function () {
      const args = Array.prototype.slice.call(arguments);
      const r = _tmm.apply(Game, args);
      try { meatTestCalls.push({ day: nowDay(Game), part: curPart, idx: args[0], container: (args[1] ? 'given' : 'pack'), returned: (r ? 'item' : 'null') }); } catch (e) { warnOnce('meatTestCall', e); }
      return r;
    };
  }
  // ---- R49 MEAT-DRAW INSTRUMENT (read-only logging) ----
  // Wraps Game.pantryDraw: calls the original exactly once, logs only.
  // Per call: want, cook flag, taken, and every meat row returned
  // (units, effectiveKcal, cooked flag, foodState, spoilDay) plus the
  // pantry meat present BEFORE the call. A call with meat present
  // before and no meat row returned is a MISS — the draw stopped
  // before reaching the meat (fresh-first sort + need already met).
  // No state mutation, no RNG consumption (pantryDraw's own sort/draw
  // untouched; this reads state only, before and after the call).
  const meatDrawLog = [];
  let meatDrawWrap = false;
  const _pd = (typeof Game.pantryDraw === 'function') ? Game.pantryDraw.bind(Game) : null;
  if (_pd) {
    meatDrawWrap = true;
    Game.pantryDraw = function (v, want, opts) {
      let beforeMeat = [];
      try {
        const pp = (v && v.pantry) || [];
        for (const it of pp) if (it && it.foodKind === 'meat') beforeMeat.push({ plantId: it.plantId || null, units: it.units || 0, kcalEach: it.kcalEach || 0, foodState: it.foodState || null, spoilDay: (it.spoilDay === undefined ? null : it.spoilDay), edible: !!it.edible });
      } catch (e) {}
      const r = _pd(v, want, opts);
      try {
        const meatRows = [];
        for (const dd of ((r && r.items) || [])) {
          const it = dd.item;
          if (it && it.foodKind === 'meat') meatRows.push({ plantId: it.plantId || null, units: dd.units || 0, effectiveKcal: dd.effectiveKcal || 0, cooked: !!dd.cooked, foodState: it.foodState || null, spoilDay: (it.spoilDay === undefined ? null : it.spoilDay) });
        }
        meatDrawLog.push({ day: nowDay(Game), want: want || 0, cookOpt: !!(opts && opts.cook), taken: (r && r.taken) || 0, nItems: ((r && r.items) || []).length, meatRows, pantryMeatBefore: beforeMeat });
      } catch (e) { warnOnce('meatDrawLog', e); }
      return r;
    };
  }



  // ---- R56 MATERIAL INSTRUMENT (read-only logging) ----
  // Traces bark/vine/hide from source to resting place per dawn: the stash
  // pile the craft beat reads, the player pack addMaterial writes into,
  // and every living NPC's pack (material-bearing items + worn/spare armor
  // pieces). Wraps addMaterial + donateMaterial: each calls the original
  // exactly once, logs only, no state mutation, no RNG consumption.
  const matTrace = [];
  const addMatLog = [], donateMatLog = [];
  let addMatWrap = false, donateMatWrap = false;
  function matSnap() {
    try {
      const v = Game.state.village || {};
      const stash = Object.assign({}, (v.stash && v.stash.materials) || {});
      const pack = {};
      for (const it of ((Game.state.scholar || {}).inventory || [])) {
        if (it && it.material) pack[it.material] = (pack[it.material] || 0) + (it.units || 0);
      }
      const npcTotal = {};
      const npcDetail = [];
      for (const id of livingVids(Game)) {
        let p = null;
        try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
        if (!p) continue;
        const mats = {};
        const armor = [];
        for (const it of (p.items || [])) {
          if (!it) continue;
          if (it.material) { mats[it.material] = (mats[it.material] || 0) + (it.units || 0); }
          if (it.itemId === 'bark_armor' || it.itemId === 'hide_armor') armor.push(it.itemId);
        }
        for (const m of Object.keys(mats)) npcTotal[m] = (npcTotal[m] || 0) + mats[m];
        if (Object.keys(mats).length || armor.length) npcDetail.push({ vid: String(id), name: nameOf(Game, id), mats, armor });
      }
      return { day: nowDay(Game), stash, pack, npcTotal, npcDetail };
    } catch (e) { return { day: nowDay(Game), error: e.message }; }
  }
  const _am = (typeof Game.addMaterial === 'function') ? Game.addMaterial.bind(Game) : null;
  if (_am) {
    addMatWrap = true;
    Game.addMaterial = function (mat, n) {
      const r = _am(mat, n);
      try { addMatLog.push({ day: nowDay(Game), part: curPart, mat: String(mat), n: n || 0, returned: r }); } catch (e) { warnOnce('addMatLog', e); }
      return r;
    };
  }
  const _dm = (typeof Game.donateMaterial === 'function') ? Game.donateMaterial.bind(Game) : null;
  if (_dm) {
    donateMatWrap = true;
    Game.donateMaterial = function (mat, n) {
      const r = _dm(mat, n);
      try { donateMatLog.push({ day: nowDay(Game), part: curPart, mat: String(mat), n: n || 0, returned: (r === undefined ? null : r) }); } catch (e) { warnOnce('donateMatLog', e); }
      return r;
    };
  }
  // ---- end R56 MATERIAL instrument ----

  // ---- R51 TACKLE INSTRUMENT (read-only logging) ----
  // Wraps the four tackle channels WITHOUT mutating state or consuming RNG:
  // teachSkill (human-skill lessons, all vias), npcLearnFromTalk (ledger
  // conversation ability-teaches), npcInviteDecision (character-driven
  // invitation decisions), performForageFavor (joint-outing actions).
  // Each wrapper calls the original exactly once and records only args +
  // before/after reads. Plus a daily favorLedger/promises snapshot taken
  // at dawn next to pantryTrace. This closes r50's gap: sitting (day-43)
  // events fall outside every foodLedger window, and the drive policy
  // never takes commit choices, so drive-only telemetry cannot see
  // favors, invites, or held-conversation teaches at all.
  const teachLog = [], talkTeachLog = [], inviteLog = [], forageLog = [], favorSnaps = [];
  let teachWrap = false, talkTeachWrap = false, inviteWrap = false, forageWrap = false;
  const _ts = (typeof Game.teachSkill === 'function') ? Game.teachSkill.bind(Game) : null;
  if (_ts) {
    teachWrap = true;
    Game.teachSkill = function (teacher, learner, skillId, opts) {
      let knewBefore = null;
      try { knewBefore = Game.personKnowsSkill ? Game.personKnowsSkill(learner, skillId) : null; } catch (e) {}
      if (knewBefore === null) { try { const known = Game.skillsKnownBy ? Game.skillsKnownBy(learner) : []; knewBefore = known.indexOf(skillId) >= 0; } catch (e) {} }
      const r = _ts(teacher, learner, skillId, opts);
      let failWhy = null;
      if (!r) { try { const chk = Game.canTeachSkill ? Game.canTeachSkill(teacher, learner, skillId) : null; failWhy = chk ? (chk.why || null) : null; } catch (e) {} }
      try { teachLog.push({ day: nowDay(Game), part: curPart, teacher: String(teacher), learner: String(learner), skill: String(skillId), via: (opts && opts.via) || null, knewBefore, ok: !!r, failWhy }); } catch (e) { warnOnce('teachLog', e); }
      return r;
    };
  }
  const _nlt = (typeof Game.npcLearnFromTalk === 'function') ? Game.npcLearnFromTalk.bind(Game) : null;
  if (_nlt) {
    talkTeachWrap = true;
    Game.npcLearnFromTalk = function (learnerVid, teacherId) {
      let knowMap = {};
      try {
        const ids = ((Game.data && Game.data.abilities) || []).map(a => (a && (a.id || a)) || null).filter(Boolean);
        for (const id of ids) { try { knowMap[id] = Game.abilityKnowledge ? Game.abilityKnowledge(learnerVid, id) : null; } catch (e) {} }
      } catch (e) {}
      const r = _nlt(learnerVid, teacherId);
      try { talkTeachLog.push({ day: nowDay(Game), part: curPart, learner: String(learnerVid), teacher: String(teacherId || 'player'), ability: r || null, knowBefore: (r && knowMap.hasOwnProperty(r)) ? knowMap[r] : null }); } catch (e) { warnOnce('talkTeachLog', e); }
      return r;
    };
  }
  const _nid = (typeof Game.npcInviteDecision === 'function') ? Game.npcInviteDecision.bind(Game) : null;
  if (_nid) {
    inviteWrap = true;
    Game.npcInviteDecision = function (invitee, inviter, opts) {
      const r = _nid(invitee, inviter, opts);
      try { inviteLog.push({ day: nowDay(Game), part: curPart, invitee: String(invitee), inviter: String(inviter), kind: (opts && opts.kind) || null, chance: (r && r.chance !== undefined) ? r.chance : null, accept: (r && r.accept !== undefined) ? !!r.accept : null, reasons: (r && r.reasons) ? r.reasons : null }); } catch (e) { warnOnce('inviteLog', e); }
      return r;
    };
  }
  const _pff = (typeof Game.performForageFavor === 'function') ? Game.performForageFavor.bind(Game) : null;
  if (_pff) {
    forageWrap = true;
    Game.performForageFavor = function (vid, favor, ending) {
      const r = _pff(vid, favor, ending);
      try {
        let run = null;
        try { const f = ((Game.state.village || {}).favorLedger || {})[vid]; if (f && f.forageRun) { const fr = f.forageRun; run = { startedDay: fr.startedDay || null, returned: !!fr.returned, deliveredKcal: fr.deliveredKcal || 0, forageCount: fr.forageCount || 0, talked: !!fr.talked }; } } catch (e) {}
        forageLog.push({ day: nowDay(Game), part: curPart, vid: String(vid), kind: (favor && favor.kind) || null, ending: !!ending, ok: (r && r.ok !== undefined) ? !!r.ok : null, line: (r && typeof r.line === 'string') ? r.line.slice(0, 120) : null, run });
      } catch (e) { warnOnce('forageLog', e); }
      return r;
    };
  }
  // r52: startConvo log (read-only) — proves bearer exclusion: any sitting
  // that talked to the bearer shows up here as self=true.
  const startConvoLog = [];
  const _sc = (typeof Game.startConvo === 'function') ? Game.startConvo.bind(Game) : null;
  if (_sc) {
    Game.startConvo = function (vid) {
      const r = _sc(vid);
      try { startConvoLog.push({ day: nowDay(Game), part: curPart, vid: String(vid), self: String(vid) === String(Game.villagerId) }); } catch (e) { warnOnce('startConvoLog', e); }
      return r;
    };
  }
  function favorSnap() {
    const v = Game.state.village || {};
    const favors = [], promises = [], runs = [];
    try {
      for (const [vid, f] of Object.entries(v.favorLedger || {})) {
        if (!f) continue;
        favors.push({ vid: String(vid), kind: f.kind || null, state: f.state || null, hasRun: !!(f.forageRun), returned: !!(f.forageRun && f.forageRun.returned) });
        if (f.forageRun) { const fr = f.forageRun; runs.push({ vid: String(vid), startedDay: fr.startedDay || null, returned: !!fr.returned, deliveredKcal: fr.deliveredKcal || 0, forageCount: fr.forageCount || 0, talked: !!fr.talked }); }
      }
    } catch (e) { warnOnce('favorSnapLedger', e); }
    try {
      for (const [vid, pr] of Object.entries(v.promises || {})) {
        if (!pr) continue;
        promises.push({ vid: String(vid), kind: pr.kind || null, favorId: pr.favorId || null, kept: !!pr.kept, maker: pr.maker || null });
      }
    } catch (e) { warnOnce('favorSnapPromises', e); }
    return { day: nowDay(Game), favors, promises, runs };
  }
  // ---- end R51 tackle instrument ----

  const contests = [];
  let pilotDay = null;
  const _fireContest = Game.fireContest ? Game.fireContest.bind(Game) : null;
  if (_fireContest) {
    Game.fireContest = function (contest) {
      const wasPilotAired = !!Game.state.pilotAired;
      const r = _fireContest(contest);
      try { if (!wasPilotAired && Game.state.pilotAired) pilotDay = nowDay(Game); }
      catch (e) { warnOnce('fireContest', e); }
      return r;
    };
  }
  const armorCraftLog = [], skillLessonLog = [];
  const _tele0 = Game.tele;
  Game.tele = function (type, data) {
    const r = _tele0.apply(this, arguments);
    try { if (type === 'contest_end') contests.push({ day: nowDay(Game), cid: (data && data.id) || '?', outcome: (data && data.outcome) || '?' }); }
    catch (e) { warnOnce('tele.contest_end', e); }
    try {
      if (type === 'armor_craft') armorCraftLog.push({ day: nowDay(Game), vid: String((data && data.vid) || ''), name: nameOf(Game, (data && data.vid) || ''), item: (data && data.item) || '?', ok: !!(data && data.ok) });
      if (type === 'skill_lesson') skillLessonLog.push({ day: nowDay(Game), teacher: String((data && data.teacher) || ''), teacherName: (data && data.teacher) === 'player' ? 'You' : nameOf(Game, (data && data.teacher) || ''), learner: String((data && data.learner) || ''), learnerName: (data && data.learner) === 'player' ? 'You' : nameOf(Game, (data && data.learner) || ''), skill: (data && data.skill) || '?', via: (data && data.via) || null });
    } catch (e) { warnOnce('tele.craftlesson', e); }
    return r;
  };

  const censusStart = census(Game);
  const gearStart = gearCensus(Game);
  const knownIds = new Set(censusStart.map(r => r.id));
  const arrivals = [];
  const pantryTrace = [];
  // r42 FOOD LEDGER (read-only): one row per dawn — pantry/pack/alive/
  // hungryStreak + telemetry event-type counts for events added since the
  // previous dawn. Reading Game.state.telemetry never mutates game state.
  const foodLedger = [];
  let teleMark = 0;
  try { teleMark = ((Game.state.telemetry || []).length); } catch (e) { teleMark = 0; }
  let minAlive = livingVids(Game).length;
  function noteArrivals() {
    try {
      for (const id of livingVids(Game)) {
        const k = String(id);
        if (!knownIds.has(k)) {
          knownIds.add(k);
          let rosterLen = null;
          try { rosterLen = ((Game.state.village || {}).roster || []).length; } catch (e) { warnOnce('rosterLen', e); }
          arrivals.push({ day: nowDay(Game), id: k, name: nameOf(Game, id), occ: occOf(Game, id), rosterLen, aliveAtArrival: livingVids(Game).length });
        }
      }
    } catch (e) { warnOnce('arrivals', e); }
  }
  let crisisStreak = 0, maxCrisisStreak = 0;
  const waveDay = {};
  const tierUps = [];
  const _tierUp = Game.havenTierUp ? Game.havenTierUp.bind(Game) : null;
  if (_tierUp) {
    Game.havenTierUp = function (...a) {
      const before = tierOf(Game);
      const r = _tierUp(...a);
      try { tierUps.push({ day: nowDay(Game), from: before, to: tierOf(Game) }); }
      catch (e) { warnOnce('tierUp', e); }
      return r;
    };
  }

  for (let d = 1; d <= DAYS; d++) {
    for (let p = 0; p < 3; p++) {
      curPart = p; // r44 fix: label hurts with the part in progress, not the previous one
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) { warnOnce('upkeep', e); } }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('driveFights', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('driveContests', e); }
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) { warnOnce('doAction', e); }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('driveFights2', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('driveContests2', e); }
      try { curPart = p; snapHealth('part'); } catch (e) { warnOnce('snapPart', e); }
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) { warnOnce('daily', e); } }
    try { Game.sleep(); } catch (e) { warnOnce('sleep', e); }
    try { curPart = 3; snapHealth('dawn'); } catch (e) { warnOnce('snapDawn', e); }
    try { noteArrivals(); const al = livingVids(Game).length; if (al < minAlive) minAlive = al; pantryTrace.push({ day: nowDay(Game), pantryKcal: Math.round(pantryKcal(Game)), alive: al }); } catch (e) { warnOnce('trace', e); }
    try { favorSnaps.push(favorSnap()); } catch (e) { warnOnce('favorSnap', e); }
    try {
      const w = Game.unlockedWave ? Game.unlockedWave() : 1;
      const gd = nowDay(Game);
      if (waveDay[w] == null) waveDay[w] = gd;
    } catch (e) { warnOnce('waveDay', e); }
    const liv = livingVids(Game).length;
    if (liv === 0) { ctx._deadTail = (ctx._deadTail || 0) + 1; if (ctx._deadTail >= 10) break; }
    else ctx._deadTail = 0;
    try {
      let hs = 0;
      try { hs = (Game.progState ? Game.progState() : {}).hungryStreak || 0; } catch (e2) { warnOnce('hungryStreak', e2); }
      const p = Math.round(pantryKcal(Game)), pk = Math.round(packKcal(Game));
      const crisis = hs >= 3 && (p + pk) < liv * 2000;
      crisisStreak = crisis ? crisisStreak + 1 : 0;
      if (crisisStreak > maxCrisisStreak) maxCrisisStreak = crisisStreak;
    } catch (e) { warnOnce('foodTrace', e); }
    try {
      const allTele = (Game.state.telemetry || []).slice();
      const fresh = allTele.slice(teleMark); teleMark = allTele.length;
      const typeCounts = {};
      for (const t of fresh) { const k = (t && t.type) || '?'; typeCounts[k] = (typeCounts[k] || 0) + 1; }
      let hs2 = 0; try { hs2 = (Game.progState ? Game.progState() : {}).hungryStreak || 0; } catch (e2) {}
      foodLedger.push({ day: nowDay(Game), pantryKcal: Math.round(pantryKcal(Game)), packKcal: Math.round(packKcal(Game)), alive: livingVids(Game).length, hungryStreak: hs2, newTele: fresh.length, typeCounts });
      try { meatTrace.push(meatSnap()); } catch (e) { warnOnce('meatTrace', e); }
      try { matTrace.push(matSnap()); } catch (e) { warnOnce('matTrace', e); }
    } catch (e) { warnOnce('foodLedger', e); }
  }

  const tele = (() => { try { return (Game.state.telemetry || []).slice(); } catch (e) { return []; } })();
  const deaths = [];
  for (const t of tele) {
    if (t && t.type === 'death') deaths.push({ day: t.day, who: nameOf(Game, t.who), cause: t.cause, kind: t.kind, player: !!t.player });
  }
  const censusEnd = census(Game);
  const gearEnd = gearCensus(Game);
  const censusPantryKcal = Math.round(pantryKcal(Game));
  const meatEnd = meatSnap();
  const sumStart = censusSummary(censusStart);
  const sumEnd = censusSummary(censusEnd);
  const regressions = [];
  for (const r of censusEnd) {
    for (const t of TASKS) { if (r[t] < r['old_' + t]) regressions.push({ who: r.name, occ: r.occ, task: t, now: r[t], old: r['old_' + t] }); }
  }
  const c1 = {};
  for (const t of ['butcher', 'cook', 'spotter', 'builder']) c1[t] = sumEnd[t].n1 > sumEnd[t].old_n1;
  const starvation = deaths.filter(x => x.day >= 15 && /starvat|hunger|thirst/.test(String(x.cause || '')));

  // ---- C4: people — 2 held convos per seed (top cook + top builder); LIGHT scan skips convos ----
  const convoPath = EVID + `/journey-establishment-r60-convo-seed${seed}.txt`;
  const convoLines = [];
  const byTask = (t) => censusEnd.filter(r => r[t] >= 1 && String(r.id) !== String(Game.villagerId)).sort((a, b) => b[t] - a[t])[0]; // r52: bearer excluded from sitting targets
  const convoTargets = [];
  if (!LIGHT) {
    for (const t of ['cook', 'builder']) {
      const b = byTask(t);
      if (b && !convoTargets.some(x => x.id === b.id)) convoTargets.push({ id: b.id, why: 'top-' + t });
    }
    for (const vid of livingVids(Game)) {
      if (convoTargets.length >= 2) break;
      if (String(vid) === String(Game.villagerId)) continue; // r52: bearer excluded
      if (convoTargets.some(x => String(x.id) === String(vid))) continue;
      convoTargets.push({ id: vid, why: 'fellow-villager' });
    }
  } else {
    convoLines.push('LIGHT scan mode: convos skipped by design (arrival hunt only).');
  }
  const STRUCT = { leave: 1, bye: 1, goon: 1, 'menu:more': 1, deflect_q: 1, honest_pass: 1, silence: 1 };
  let nullCount = 0, partySilentCount = 0, errorCount = 0, quietCloseCount = 0;
  for (const tg of convoTargets.slice(0, 2)) {
    const vid = tg.id;
    const nm = nameOf(Game, vid);
    const p = (Game.getPerson ? Game.getPerson(vid) : {}) || {};
    convoLines.push(`\n-- ${nm} (${String(vid)}) occ=${p.occupation || p.formerOccupation || '?'} role=${tg.why} --`);
    try {
      let r = Game.startConvo(vid);
      convoLines.push(`OPENING: ${r.line}`);
      if (r.line == null) nullCount++;
      const seen = {};
      let lastPick = null;
      for (let turn = 0; turn < 8; turn++) {
        const choices = (r.choices && r.choices.length) ? r.choices : [];
        if (!choices.length) break;
        const fresh = (id) => choices.find(ch => ch.id === id) && !seen[id];
        let pick = null;
        if (fresh('ask:personal')) pick = choices.find(ch => ch.id === 'ask:personal');
        else pick = choices.find(ch => /work|food|teach|help|craft|build/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /gossip|rumor/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /^want:/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => !STRUCT[ch.id] && !seen[ch.id] && ch.id !== 'leave' && ch.id !== 'bye')
          || null;
        if (!pick) break;
        seen[pick.id] = 1;
        lastPick = pick.id;
        convoLines.push(`YOU: [${pick.id}] ${(pick.label || '').slice(0, 80)}`);
        r = Game.convoTurn(vid, pick.id);
        const isPartyPick = typeof lastPick === 'string' && (lastPick.startsWith('party_namepick') || lastPick.startsWith('party_rolepick'));
        if (r.line == null && isPartyPick) { partySilentCount++; convoLines.push('THEM: (silent confirmation — party pick, announced in main area)'); }
        else if (r.line == null && r.ended) { quietCloseCount++; convoLines.push('THEM: (quiet close — null line on an ended turn, r36 metric-review exemption)'); }
        else if (r.line == null) { nullCount++; convoLines.push('THEM: null'); }
        else convoLines.push(`THEM: ${r.line}`);
        if (r.ended) { convoLines.push('(ended by engine)'); break; }
      }
      try { const end = Game.endConvo(vid, 'done'); if (end && end.line) convoLines.push('closing: ' + end.line); } catch (e) { convoLines.push('endConvo: ' + e.message); }
    } catch (e) { errorCount++; convoLines.push('ERROR: ' + e.message); }
  }
  try { fs.writeFileSync(convoPath, convoLines.join('\n')); } catch (e) { warnOnce('convoWrite', e); }


  // ---- B-PROBE (r40): betrayal:accept state consequence (scale r36 named next:
  // "measure accept's state consequence first"). Runs AFTER census (so the probe's
  // trust/pantry/time effects cannot move C1/C2/C3) and writes its own file, never
  // touching the panel JSON shape. One accept per seed max: scan living villagers
  // in roster order, open (no picks) until a betrayal:accept choice appears, then
  // snapshot state, accept, snapshot again, stop. No invite found = NOT-ENCOUNTERED.
  const probePath = EVID + `/journey-establishment-r60-betrayal-seed${seed}.json`;
  const probe = { seed, run: 'r60', attempts: [], found: null, accepted: null, pre: null, post: null, verdict: 'NOT-ENCOUNTERED' };
  const snapState = (vid) => {
    const snap = {};
    try { snap.day = nowDay(Game); } catch (e) { snap.day = null; }
    try { snap.trust = ((Game.state.village || {}).trust || {})[vid]; } catch (e) { snap.trust = null; }
    try { snap.pendingInvite = Game.pendingInvite ? Game.pendingInvite(vid) : null; } catch (e) { snap.pendingInvite = 'ERR:' + e.message; }
    try { const h = Game.inviteHistory ? Game.inviteHistory(vid) : null; snap.inviteHistory = h ? { count: h.count, accepted: h.accepted, outcomes: (h.outcomes || []).slice(-3) } : null; } catch (e) { snap.inviteHistory = 'ERR:' + e.message; }
    try { snap.pantryKcal = Math.round(pantryKcal(Game)); } catch (e) { snap.pantryKcal = null; }
    try { const st = Game.stashState ? Game.stashState() : null; snap.stashMaterials = st ? (st.materials || null) : null; } catch (e) { snap.stashMaterials = 'ERR:' + e.message; }
    try { snap.alive = !(Game.getPerson(vid) || {}).dead; } catch (e) { snap.alive = null; }
    try { const bs = Game.betrayalState ? Game.betrayalState() : null; snap.betrayalPlots = bs ? (bs.plots || []).filter(pl => pl.active).map(pl => ({ id: pl.id, inviter: pl.inviter, target: pl.target })) : null; snap.betrayalInvitesKeys = bs && bs.invites ? Object.keys(bs.invites) : null; } catch (e) { snap.betrayalPlots = 'ERR:' + e.message; }
    return snap;
  };
  if (!LIGHT) {
    for (const vid of livingVids(Game)) {
      if (probe.found) break;
      if (String(vid) === String(Game.villagerId)) continue; // r52: bearer excluded
      let r0 = null;
      try { r0 = Game.startConvo(vid); } catch (e) { probe.attempts.push({ vid: String(vid), error: e.message }); continue; }
      const choices = (r0 && r0.choices) || [];
      const hasAccept = choices.some(ch => ch.id === 'betrayal:accept');
      const hasDecline = choices.some(ch => ch.id === 'betrayal:decline');
      probe.attempts.push({ vid: String(vid), name: nameOf(Game, vid), opening: r0 ? (r0.line || null) : null, hasAccept, hasDecline, nChoices: choices.length });
      if (!hasAccept) { try { Game.endConvo(vid, 'done'); } catch (e) {} continue; }
      probe.found = { vid: String(vid), name: nameOf(Game, vid), opening: r0.line || null };
      probe.pre = snapState(vid);
      let r1 = null;
      try { r1 = Game.convoTurn(vid, 'betrayal:accept'); } catch (e) { probe.accepted = { error: e.message }; }
      if (r1) probe.accepted = { line: r1.line || null, ended: !!r1.ended };
      probe.post = snapState(vid);
      probe.verdict = 'ACCEPT-DRIVEN';
      try { Game.endConvo(vid, 'done'); } catch (e) {}
    }
  } else {
    probe.verdict = 'SKIP-light';
  }
  try { fs.writeFileSync(probePath, JSON.stringify(probe, null, 1)); } catch (e) { warnOnce('probeWrite', e); }

  // ---- R46 GOSSIP SWEEP (read-only adjudication aid; runs AFTER census) ----
  // Opens every living villager, takes ONE gossip/rumor pick if offered,
  // records the line, ends the convo. Lets the analyzer adjudicate any
  // double-winner gossip line against the _cxGossip seed log: two
  // distinct pids for that contest+how = co-winners; one pid = a real
  // double-count bug. Skipped in LIGHT mode (pantry band only). Runs
  // after census AND after the betrayal probe, so neither the probe's
  // openings nor C1/C2/C3 can be moved by sweep sittings.
  const gossipSweepPath = EVID + `/journey-establishment-r60-gossip-seed${seed}.txt`;
  const gossipSweepLines = [];
  let gossipSweepCount = 0, gossipSweepContestLines = 0;
  const SWEEP_STRUCT = { leave: 1, bye: 1, goon: 1, 'menu:more': 1, deflect_q: 1, honest_pass: 1, silence: 1 };
  if (!LIGHT) {
    // ask:gossip is NOT an opening choice: it appears only after the
    // subject navigation (dlg:subject), as the standard sittings show.
    // Drive each convo with the standard pick order, taking ask:gossip
    // the moment it appears (max 8 turns, same as standard sittings).
    for (const vid of livingVids(Game)) {
      if (String(vid) === String(Game.villagerId)) continue; // r52: bearer excluded
      try {
        let r = Game.startConvo(vid);
        const seen = {};
        let got = false;
        for (let turn = 0; turn < 8; turn++) {
          const choices = (r.choices && r.choices.length) ? r.choices : [];
          if (!choices.length) break;
          const fresh = (id) => choices.find(ch => ch.id === id) && !seen[id];
          let pick = null;
          if (fresh('ask:gossip')) pick = choices.find(ch => ch.id === 'ask:gossip');
          else if (fresh('ask:personal')) pick = choices.find(ch => ch.id === 'ask:personal');
          else pick = choices.find(ch => /work|food|teach|help|craft|build/.test(ch.id) && !seen[ch.id])
            || choices.find(ch => /^want:/.test(ch.id) && !seen[ch.id])
            || choices.find(ch => !SWEEP_STRUCT[ch.id] && !seen[ch.id] && ch.id !== 'leave' && ch.id !== 'bye')
            || null;
          if (!pick) break;
          seen[pick.id] = 1;
          r = Game.convoTurn(vid, pick.id);
          if (pick.id === 'ask:gossip') {
            gossipSweepCount++;
            const line = (r && r.line) ? r.line : null;
            gossipSweepLines.push(`${nameOf(Game, vid)} [ask:gossip]: ${line}`);
            if (line) {
              const contestNames = [...new Set((gossipLog || []).map(g => g.contest).filter(Boolean))];
              if (contestNames.some(c => line.includes(c))) gossipSweepContestLines++;
            }
            got = true;
            break;
          }
          if (r.ended) break;
        }
        if (!got) gossipSweepLines.push(`${nameOf(Game, vid)}: (no gossip offered in 8 turns)`);
        try { Game.endConvo(vid, 'done'); } catch (e) {}
      } catch (e) { gossipSweepLines.push(`${nameOf(Game, vid)}: ERROR ${e.message}`); }
    }
  } else {
    gossipSweepLines.push('LIGHT scan mode: gossip sweep skipped by design (pantry band only).');
  }
  // ---- R49 G PASS 2: re-open every living villager, take a second gossip pick.
  // Gossip lines rotate per sitting; a second draw doubles the chance of
  // catching a line that names two winners of one multi-winner show.
  // Runs after pass 1, still after census + probe, so it cannot move them.
  if (!LIGHT) {
    gossipSweepLines.push('--- PASS 2 ---');
    for (const vid of livingVids(Game)) {
      if (String(vid) === String(Game.villagerId)) continue; // r52: bearer excluded
      try {
        let r = Game.startConvo(vid);
        const seen = {};
        let got = false;
        for (let turn = 0; turn < 8; turn++) {
          const choices = (r.choices && r.choices.length) ? r.choices : [];
          if (!choices.length) break;
          const fresh = (id) => choices.find(ch => ch.id === id) && !seen[id];
          let pick = null;
          if (fresh('ask:gossip')) pick = choices.find(ch => ch.id === 'ask:gossip');
          else if (fresh('ask:personal')) pick = choices.find(ch => ch.id === 'ask:personal');
          else pick = choices.find(ch => /work|food|teach|help|craft|build/.test(ch.id) && !seen[ch.id])
            || choices.find(ch => /^want:/.test(ch.id) && !seen[ch.id])
            || choices.find(ch => !SWEEP_STRUCT[ch.id] && !seen[ch.id] && ch.id !== 'leave' && ch.id !== 'bye')
            || null;
          if (!pick) break;
          seen[pick.id] = 1;
          r = Game.convoTurn(vid, pick.id);
          if (pick.id === 'ask:gossip') {
            gossipSweepCount++;
            const line = (r && r.line) ? r.line : null;
            gossipSweepLines.push(`${nameOf(Game, vid)} [ask:gossip#2]: ${line}`);
            if (line) {
              const contestNames = [...new Set((gossipLog || []).map(g => g.contest).filter(Boolean))];
              if (contestNames.some(c => line.includes(c))) gossipSweepContestLines++;
            }
            got = true;
            break;
          }
          if (r.ended) break;
        }
        if (!got) gossipSweepLines.push(`${nameOf(Game, vid)}: (no gossip offered in 8 turns, pass 2)`);
        try { Game.endConvo(vid, 'done'); } catch (e) {}
      } catch (e) { gossipSweepLines.push(`${nameOf(Game, vid)}: ERROR ${e.message}`); }
    }
  }
  // ---- R49 G PASS 3: re-open every living villager, take a second gossip pick.
  // A third draw: r47 pass 2 proved the pool exhausts honestly, but the
  // formal two-winner catch is still uncaught — pass 3 is the bigger net.
  // Runs after pass 1, still after census + probe, so it cannot move them.
  if (!LIGHT) {
    gossipSweepLines.push('--- PASS 3 ---');
    for (const vid of livingVids(Game)) {
      if (String(vid) === String(Game.villagerId)) continue; // r52: bearer excluded
      try {
        let r = Game.startConvo(vid);
        const seen = {};
        let got = false;
        for (let turn = 0; turn < 8; turn++) {
          const choices = (r.choices && r.choices.length) ? r.choices : [];
          if (!choices.length) break;
          const fresh = (id) => choices.find(ch => ch.id === id) && !seen[id];
          let pick = null;
          if (fresh('ask:gossip')) pick = choices.find(ch => ch.id === 'ask:gossip');
          else if (fresh('ask:personal')) pick = choices.find(ch => ch.id === 'ask:personal');
          else pick = choices.find(ch => /work|food|teach|help|craft|build/.test(ch.id) && !seen[ch.id])
            || choices.find(ch => /^want:/.test(ch.id) && !seen[ch.id])
            || choices.find(ch => !SWEEP_STRUCT[ch.id] && !seen[ch.id] && ch.id !== 'leave' && ch.id !== 'bye')
            || null;
          if (!pick) break;
          seen[pick.id] = 1;
          r = Game.convoTurn(vid, pick.id);
          if (pick.id === 'ask:gossip') {
            gossipSweepCount++;
            const line = (r && r.line) ? r.line : null;
            gossipSweepLines.push(`${nameOf(Game, vid)} [ask:gossip#3]: ${line}`);
            if (line) {
              const contestNames = [...new Set((gossipLog || []).map(g => g.contest).filter(Boolean))];
              if (contestNames.some(c => line.includes(c))) gossipSweepContestLines++;
            }
            got = true;
            break;
          }
          if (r.ended) break;
        }
        if (!got) gossipSweepLines.push(`${nameOf(Game, vid)}: (no gossip offered in 8 turns, pass 3)`);
        try { Game.endConvo(vid, 'done'); } catch (e) {}
      } catch (e) { gossipSweepLines.push(`${nameOf(Game, vid)}: ERROR ${e.message}`); }
    }
  }
  try { fs.writeFileSync(gossipSweepPath, gossipSweepLines.join('\n')); } catch (e) { warnOnce('gossipSweepWrite', e); }
  try { favorSnaps.push(favorSnap()); } catch (e) { warnOnce('favorSnapEnd', e); }

  const overCause = (() => { try { return { over: !!Game.over, villageLost: !!Game.villageLost, won: !!Game.won }; } catch (e) { return { over: !!Game.over, error: e.message }; } })();
  const crashDays = new Set();
  for (const h of hurtLog) { if ((h.argDmg != null && h.argDmg >= 20) || (h.healthBefore != null && h.healthAfter != null && h.healthAfter - h.healthBefore <= -20)) crashDays.add(h.day); }
  for (let i = 1; i < healthSnaps.length; i++) {
    const a = healthSnaps[i - 1], b = healthSnaps[i];
    for (const id of Object.keys(b.health)) {
      if (a.health[id] != null && b.health[id] != null && b.health[id] - a.health[id] <= -30) crashDays.add(b.day);
    }
  }
  const crashDayLines = {};
  for (const d of [...crashDays].sort((x, y) => x - y)) for (const dd of [d - 1, d, d + 1]) if (dayLines[dd]) crashDayLines[dd] = dayLines[dd];
  // R60 ADDITIVE INSTRUMENT (read-only): membership snapshot at census end,
  // so the arrivals question is measured, not just counted. No policy or
  // game-code change; all other traces identical to r59.
  const mshipSnap = (() => { try { const m = Game.mshipState ? Game.mshipState() : null; return { applications: ((m && m.applications) || []).map(a => ({ name: a.name, occ: a.formerOccupation, day: a.day, rep: a.reputation })), pendingArrivals: ((m && m.arrivals) || []).map(a => ({ name: a.name, arriveDay: a.arriveDay })), notability: Game.villageNotability ? Game.villageNotability() : null, housingCap: Game.housingCap ? Game.housingCap() : null, rosterLen: ((Game.state.village || {}).roster || []).length, visitors: ((Game.state.village || {}).visitors || []).map(v => ({ name: v.name, type: v.type })) }; } catch (e) { return { error: String(e && e.message || e) }; } })();
  // R60 ADDITIVE INSTRUMENT (read-only): contest-death ledger snapshot at
  // census end, for the landing-r69 blank (contest deaths bypass the death
  // record). Compares state.contestDeathsById against death telemetry and
  // the census pop change; measurement only, no fix (design call pending).
  const contestDeathSnap = (() => { try { return { contestDeathsById: (Game.state || {}).contestDeathsById || null, deathTeleCount: deaths.length, deathTele: deaths, rosterStartLen: (censusStart || []).length, rosterEndLen: (censusEnd || []).length }; } catch (e) { return { error: String(e && e.message || e) }; } })();
  const out = { seed, run: 'r60', light: LIGHT, reachedDay: nowDay(Game), over: !!Game.over, overCause, policy: policy.id,
    c1, regressions, c1PassCount: Object.values(c1).filter(Boolean).length,
    c3: { starvationDeaths: starvation.length, maxCrisisStreak, verdict: (starvation.length === 0 && maxCrisisStreak < 3) ? 'GO' : 'NO-GO' },
    c4: { convos: convoTargets.length, nullCount, partySilentCount, quietCloseCount, errorCount,
      verdict: LIGHT ? 'SKIP-light' : ((nullCount === 0 && errorCount === 0) ? 'GO' : 'NO-GO') },
    guardrails: { tier: tierOf(Game), tierUps, stores: storesOf(Game), pantryKcal: Math.round(pantryKcal(Game)),
      waveUnlockDays: waveDay, pilotDay, contests: contests.length, contestList: contests,
      deaths: deaths.length, popAlive: livingVids(Game).length, minAlive, arrivals: arrivals.length },
    censusStartSummary: sumStart, censusEndSummary: sumEnd, mshipSnap, contestDeathSnap,
    censusPantryKcal, meatTrace, meatTestCalls, meatWrap, meatEnd, meatDrawLog, meatDrawWrap,
    censusEnd, deaths, convoPath, gearCensusStart: gearStart, gearCensusEnd: gearEnd, armorCraftLog, skillLessonLog, materialTrace: matTrace, materialEnd: matSnap(), addMaterialLog: addMatLog, addMaterialWrap: addMatWrap, donateMaterialLog: donateMatLog, donateMaterialWrap: donateMatWrap, ctxNotes: ctx.notes.slice(0, 10),
    arrivals, pantryTrace, foodLedger, intakeDays, hurtLog, sickTickLog, healthSnaps, scholarHurtLog, gossipLog, scholarWrap, gossipWrap, tbDamageLog, tbDamageWrap, contestDamageLog, contestDamageWrap, gossipSweepCount, gossipSweepContestLines, gossipSweepPath, teachLog, teachWrap, talkTeachLog, talkTeachWrap, inviteLog, inviteWrap, forageLog, forageWrap, favorSnaps, startConvoLog, bearerId: String(Game.villagerId), crashDays: [...crashDays].sort((a, b) => a - b), crashDayLines,
    // r40 FIX vs r37: exact-match 'hunter' only — r37's /hunter/i also matched
    // 'hunting guide' (the one hunt-occupation in the 100-person bg pool).
    // huntingGuideArrivals reported separately so the two channels never mix.
    hunterArrivals: arrivals.filter(a => String(a.occ || '').toLowerCase().trim() === 'hunter').map(a => {
      const end = censusEnd.find(r => r.id === a.id);
      return { ...a, aliveAtEnd: !!end, preserverAtEnd: end ? end.preserver : null, butcherAtEnd: end ? end.butcher : null, old_preserver: end ? end.old_preserver : null };
    }),
    huntingGuideArrivals: arrivals.filter(a => String(a.occ || '').toLowerCase().includes('hunting guide')).map(a => {
      const end = censusEnd.find(r => r.id === a.id);
      return { ...a, aliveAtEnd: !!end, preserverAtEnd: end ? end.preserver : null };
    }) };
  const outPath = EVID + `/journey-establishment-r60-seed${seed}.json`;
  try { fs.writeFileSync(outPath, JSON.stringify(out, null, 1)); } catch (e) { warnOnce('outWrite', e); }

  return { seed, outPath, materialTraceDays: matTrace.length, armorCraft: { rows: armorCraftLog.length, ok: armorCraftLog.filter(r => r.ok).length, fail: armorCraftLog.filter(r => !r.ok).length }, skillLessons: { rows: skillLessonLog.length, villagerVia: skillLessonLog.filter(r => r.via === 'villager').length, convoVia: skillLessonLog.filter(r => r.via === 'conversation').length }, c1, regressions: regressions.length, c3: out.c3, c4: out.c4, guardrails: out.guardrails, arrivals: arrivals.length, hunterArrivals: out.hunterArrivals.length, huntingGuideArrivals: out.huntingGuideArrivals.length, minAlive };
}

async function main() {
  for (const seed of SEEDS) {
    console.log(`--- r60 seed=${seed} light=${LIGHT} ---`);
    const r = await runSeed(seed);
    console.log(JSON.stringify({ seed, c1: r.c1, regressions: r.regressions, c3: r.c3, c4: r.c4, guardrails: r.guardrails }, null, 1));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
