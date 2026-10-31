#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) R65 — r64 driver + r65 probes.
// (2026-10-30 run, scheduled 19:45 CDT). Rotation index 1 (establishment).
// Base: master f52f08600 at run start. r64 driver verbatim except r64->r65
// renames and default seeds 337-340, PLUS r65 instruments/probes (all run
// AFTER the out JSON is written, so none can move any panel number):
//  GRANT-LOG: grantKnowledge wrap (skill+recipe) for the learn-jump trace.
//  GEAR-WEEKLY: gearCensus every 7th loop day for the equip trace.
//  BARK-CRAFT: attempt Game.craft('bark_armor') directly, up to 5 probe days.
//  CONTEST-DEATH-STAGED: call Game._cxKillContestant(pid,'probe-contest')
//    once (plus a re-entry observation) to verify landed fix 06b502d53.
//  SKIP-FILES: every probe writes its file on every early return.
// PRE-REGISTRATION: hidden_files/evidence/2026-10-30/journey-establishment-r65-prereg.md
// (written BEFORE the pilot run; pilot is seed 337, run first).
// Journey leg: ESTABLISHMENT (days 14-40) R60 — POST-FIX-ALL-ARMOR RE-MEASUREMENT
// (2026-10-30 run, scheduled 09:45 CDT). Rotation index 1 (establishment; this run plays it and
// verifies the 1->2 write at landing). Base: master 4f349fed1 at run start.
// r57 driver verbatim EXCEPT all r57->r63 filenames. The r57 question
// (bridge absent?) is re-asked because the base moved: fix-all armor landed
// 9c650f840 (craft + armory pile live-enabled, bark inflow 15->30%) and
// build-armor landed 062e07a7a (up to 3 seeded bark wearers at creation).
// ARMORVILLAGE env is no longer needed (gates removed); it is harmless if set.
// MEASUREMENT ONLY: this run lands no armor-code change.
// PRE-REGISTRATION: see hidden_files/evidence/2026-10-30/journey-establishment-r65-prereg.md
// (written BEFORE the panel run; pilot is seed 209, run first).
// Usage: SEEDS=325 DAYS=42 node scripts/journey-establishment-r65-20261030.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-30';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const LIGHT = process.env.LIGHT === '1';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [337, 338, 339, 340]);
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
  console.warn('[r63:' + key + ']', (e && e.message) || e);
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

  // ---- R65 GRANT WRAP (read-only logging): grantKnowledge is THE one path
  // for knowledge gains; r64 seed 335 gained 10 skills in probe days 47-48
  // with no teach record. Log skill+recipe grants (day, source type/by,
  // return) with the current phase ('main' or the running probe name) so
  // the analyzer can join learn-probe gains to their grant source.
  let probePhase = 'main';
  const grantLog = [];
  let grantOtherCount = 0;
  const _grant0 = Game.grantKnowledge ? Game.grantKnowledge.bind(Game) : null;
  if (_grant0) {
    Game.grantKnowledge = function (domain, id, level, source) {
      let r = false;
      try { r = _grant0(domain, id, level, source); } catch (e) { grantLog.push({ day: nowDay(Game), phase: probePhase, domain, id, level, error: e.message }); throw e; }
      try {
        if (domain === 'skill' || domain === 'recipe') grantLog.push({ day: nowDay(Game), phase: probePhase, domain, id, level, type: (source && source.type) || null, by: (source && source.by) || null, returned: !!r });
        else grantOtherCount++;
      } catch (e) { warnOnce('grantLog', e); }
      return r;
    };
  }
  const censusStart = census(Game);
  const gearStart = gearCensus(Game);
  const gearWeekly = [];
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
      try { if (d % 7 === 0) gearWeekly.push(gearCensus(Game)); } catch (e) { warnOnce('gearWeekly', e); }
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
  const convoPath = EVID + `/journey-establishment-r65-convo-seed${seed}.txt`;
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
  const probePath = EVID + `/journey-establishment-r65-betrayal-seed${seed}.json`;
  const probe = { seed, run: 'r65', attempts: [], found: null, accepted: null, pre: null, post: null, verdict: 'NOT-ENCOUNTERED' };
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
  const gossipSweepPath = EVID + `/journey-establishment-r65-gossip-seed${seed}.txt`;
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
  const out = { seed, run: 'r65', light: LIGHT, reachedDay: nowDay(Game), over: !!Game.over, overCause, policy: policy.id,
    c1, regressions, c1PassCount: Object.values(c1).filter(Boolean).length,
    c3: { starvationDeaths: starvation.length, maxCrisisStreak, verdict: (starvation.length === 0 && maxCrisisStreak < 3) ? 'GO' : 'NO-GO' },
    c4: { convos: convoTargets.length, nullCount, partySilentCount, quietCloseCount, errorCount,
      verdict: LIGHT ? 'SKIP-light' : ((nullCount === 0 && errorCount === 0) ? 'GO' : 'NO-GO') },
    guardrails: { tier: tierOf(Game), tierUps, stores: storesOf(Game), pantryKcal: Math.round(pantryKcal(Game)),
      waveUnlockDays: waveDay, pilotDay, contests: contests.length, contestList: contests,
      deaths: deaths.length, popAlive: livingVids(Game).length, minAlive, arrivals: arrivals.length },
    censusStartSummary: sumStart, censusEndSummary: sumEnd, mshipSnap, contestDeathSnap,
    censusPantryKcal, meatTrace, meatTestCalls, meatWrap, meatEnd, meatDrawLog, meatDrawWrap,
    censusEnd, deaths, convoPath, gearWeekly, grantLog, grantOtherCount, gearCensusStart: gearStart, gearCensusEnd: gearEnd, armorCraftLog, skillLessonLog, materialTrace: matTrace, materialEnd: matSnap(), addMaterialLog: addMatLog, addMaterialWrap: addMatWrap, donateMaterialLog: donateMatLog, donateMaterialWrap: donateMatWrap, ctxNotes: ctx.notes.slice(0, 10),
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
  const outPath = EVID + `/journey-establishment-r65-seed${seed}.json`;
  try { fs.writeFileSync(outPath, JSON.stringify(out, null, 1)); } catch (e) { warnOnce('outWrite', e); }

  // ---- R61 REPEAT-SITTING PROBE (post-panel: runs AFTER the out JSON is
  // written, so its sleep day cannot move any panel number; writes its own
  // file). Tests the deepening-r67 skillLessonDone stickiness in the
  // establishment window: sitting 1 takes a lesson, sleep a day (clears the
  // canTeachSkill 'today' gate), sitting 2 re-opens the same villager. ----
  const repeatSitProbe = (() => {
    const P = { seed, run: 'r65', verdict: 'NOT-RUN', subject: null, control: null, error: null };
      probePhase = 'repeatsit';
    try {
      if (Game.over) { P.verdict = 'SKIP-over'; try { fs.writeFileSync(EVID + `/journey-establishment-r65-repeatsit-seed${seed}.json`, JSON.stringify(P, null, 1)); } catch (e) { P.writeError = e.message; } return P; }
      const skillChoices = (vid) => {
        try { const c = Game.convoSkillChoices ? Game.convoSkillChoices(vid) : null; return Array.isArray(c) ? c.map(x => x.id) : []; }
        catch (e) { return ['ERROR:' + e.message]; }
      };
      const menuSkillIds = (r) => ((r && r.choices) || []).filter(ch => /^skill_(learn|teach):/.test(ch.id)).map(ch => ch.id);
      const teachable = (vid) => {
        try {
          const list = Game.teachableSkills ? Game.teachableSkills(vid, 'player') : [];
          return list.map(sid => { let why = '?'; try { const res = Game.canTeachSkill(vid, 'player', sid) || {}; why = res.ok ? 'ok' : (res.why || '?'); } catch (e) { why = 'ERR'; } return { sid, why }; });
        } catch (e) { return [{ sid: 'ERROR', why: e.message }]; }
      };
      const lessonDoneFlag = (vid) => { try { return !!((Game.convoGet(vid) || {}).skillLessonDone); } catch (e) { return null; } };
      let subj = null;
      for (const vid of livingVids(Game)) {
        if (String(vid) === String(Game.villagerId)) continue;
        let r0 = null;
        try { r0 = Game.startConvo(vid); } catch (e) { continue; }
        if (!r0 || r0.ended) { try { Game.endConvo(vid, 'done'); } catch (e2) {} continue; }
        const offers = skillChoices(vid);
        const menu = menuSkillIds(r0);
        if (!offers.length && !menu.length) { try { Game.endConvo(vid, 'done'); } catch (e2) {} continue; }
        const pick = (offers.find(id => id.indexOf('skill_learn:') === 0) || offers[0] || menu[0]);
        const before = lessonDoneFlag(vid);
        let lessonLine = null;
        try { const r1 = Game.convoTurn(vid, pick); lessonLine = r1 ? r1.line : null; } catch (e) { lessonLine = 'ERROR:' + e.message; }
        const after = lessonDoneFlag(vid);
        try { Game.endConvo(vid, 'done'); } catch (e2) {}
        subj = { vid, name: nameOf(Game, vid), day1: nowDay(Game), offers1: offers, menu1: menu, pick, lessonLine: lessonLine ? String(lessonLine).slice(0, 200) : null, lessonDoneBefore: before, lessonDoneAfter: after };
        break;
      }
      if (!subj) { P.verdict = 'NO-OFFER'; try { fs.writeFileSync(EVID + `/journey-establishment-r65-repeatsit-seed${seed}.json`, JSON.stringify(P, null, 1)); } catch (e) { P.writeError = e.message; } return P; }
      P.subject = subj;
      try { Game.sleep(); } catch (e) { P.sleepError = e.message; }
      const day2 = nowDay(Game);
      subj.day2 = day2;
      let r2 = null;
      try { r2 = Game.startConvo(subj.vid); } catch (e) { subj.sitting2Error = e.message; }
      if (r2 && !r2.ended) {
        subj.offers2 = skillChoices(subj.vid);
        subj.menu2 = menuSkillIds(r2);
        subj.remaining = teachable(subj.vid);
        subj.lessonDoneDay2 = lessonDoneFlag(subj.vid);
        try { Game.endConvo(subj.vid, 'done'); } catch (e2) {}
      } else { subj.sitting2 = r2 ? 'ended' : 'null'; }
      for (const vid of livingVids(Game)) {
        if (String(vid) === String(subj.vid) || String(vid) === String(Game.villagerId)) continue;
        let rc = null;
        try { rc = Game.startConvo(vid); } catch (e) { continue; }
        if (!rc || rc.ended) { try { Game.endConvo(vid, 'done'); } catch (e2) {} continue; }
        P.control = { vid, name: nameOf(Game, vid), day: nowDay(Game), offers: skillChoices(vid), menu: menuSkillIds(rc) };
        try { Game.endConvo(vid, 'done'); } catch (e2) {}
        break;
      }
      const remOk = (subj.remaining || []).filter(x => x.why === 'ok');
      if ((subj.offers2 || []).length > 0 || (subj.menu2 || []).length > 0) P.verdict = 'OFFERS-RETURN';
      else if (day2 <= subj.day1) P.verdict = 'DAY-NOT-ADVANCED';
      else if (remOk.length > 0) P.verdict = 'STICKY';
      else P.verdict = 'NOTHING-LEFT';
      try { fs.writeFileSync(EVID + `/journey-establishment-r65-repeatsit-seed${seed}.json`, JSON.stringify(P, null, 1)); } catch (e) { P.writeError = e.message; }
    } catch (e) { P.verdict = 'ERROR'; P.error = String(e && e.message || e); }
    return P;
  })();


  // ---- R62 LEARN PROBE (post-panel, post-repeatsit: runs AFTER the out JSON
  // is written, so its sleeps cannot move any panel number; writes its own
  // file). Tests r61's open item #5: now that repeat offers work, does a
  // lesson-SEEKING player actually learn? 5 probe days; the canTeachSkill
  // 'today' gate caps the player at 1 new skill per day, so the probe takes
  // at most one lesson per day (first skill_learn offer in roster order)
  // and sleeps between days. Also snapshots the hide-armor opener state:
  // hide wearers, stash hide, and the player's hide_armor recipe knowledge
  // (NPC craft needs a wearer; the player route needs recipe L1 from
  // handling hide — if neither exists on a hide-present seed, the
  // conversion blank is a circularity, not a supply gap).
  const learnProbe = (() => {
    const L = { seed, run: 'r65', verdict: 'NOT-RUN', before: null, after: null, gained: [], days: [], hideSnap: null, error: null };
      probePhase = 'learn';
    try {
      if (Game.over) { L.verdict = 'SKIP-over'; try { fs.writeFileSync(EVID + `/journey-establishment-r65-learn-seed${seed}.json`, JSON.stringify(L, null, 1)); } catch (e) { L.writeError = e.message; } return L; }
      const playerSkills = () => { try { return (Game.skillsKnownBy ? Game.skillsKnownBy('player') : []).slice(); } catch (e) { return []; } };
      L.before = playerSkills();
      const hideSnap = () => {
        try {
          const wearers = [];
          for (const id of livingVids(Game)) {
            let pp = null; try { pp = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
            if (!pp) continue;
            const worn = Object.values(pp.equipped || {}).map(e => e && e.itemId).filter(Boolean);
            if (worn.includes('hide_armor')) wearers.push(nameOf(Game, id));
          }
          let recipe = null;
          try { recipe = ((Game.state.codex || {}).recipes || {}).hide_armor || null; } catch (e) {}
          const stash = ((Game.state.village || {}).stash || {}).materials || {};
          return { hideWearers: wearers, stashHide: stash.hide || 0, stashBark: stash.bark || 0, playerHideRecipe: recipe };
        } catch (e) { return { error: e.message }; }
      };
      L.hideSnap = hideSnap();
      for (let d = 0; d < 5; d++) {
        const dayRec = { day: nowDay(Game), took: null, noOfferWhy: [] };
        for (const vid of livingVids(Game)) {
          if (String(vid) === String(Game.villagerId)) continue;
          let r0 = null;
          try { r0 = Game.startConvo(vid); } catch (e) { dayRec.noOfferWhy.push({ vid: String(vid), error: e.message }); continue; }
          if (!r0 || r0.ended) { try { Game.endConvo(vid, 'done'); } catch (e2) {} continue; }
          const menu = ((r0.choices || []).filter(ch => /^skill_learn:/.test(ch.id)).map(ch => ch.id));
          let offers = [];
          try { const c = Game.convoSkillChoices ? Game.convoSkillChoices(vid) : []; offers = Array.isArray(c) ? c.map(x => x.id) : []; } catch (e) {}
          const learnId = menu.find(id => id.indexOf('skill_learn:') === 0) || offers.find(id => id.indexOf('skill_learn:') === 0) || null;
          if (!learnId) {
            let why = [];
            try {
              const cand = Game.teachableSkills ? Game.teachableSkills(vid, 'player') : [];
              why = cand.slice(0, 3).map(sid => { let w = '?'; try { const res = Game.canTeachSkill(vid, 'player', sid) || {}; w = res.ok ? 'ok' : (res.why || '?'); } catch (e) { w = 'ERR'; } return { sid, why: w }; });
            } catch (e) { why = [{ sid: 'ERROR', why: e.message }]; }
            dayRec.noOfferWhy.push({ vid: String(vid), name: nameOf(Game, vid), offers, menu, why });
            try { Game.endConvo(vid, 'done'); } catch (e2) {}
            continue;
          }
          let line = null;
          try { const r1 = Game.convoTurn(vid, learnId); line = r1 ? r1.line : null; } catch (e) { line = 'ERROR:' + e.message; }
          dayRec.took = { teacher: String(vid), teacherName: nameOf(Game, vid), skill: learnId.slice('skill_learn:'.length), line: line ? String(line).slice(0, 200) : null, knownAfter: playerSkills() };
          try { Game.endConvo(vid, 'done'); } catch (e2) {}
          break;
        }
        L.days.push(dayRec);
        if (d < 4 && !Game.over) {
          // R62 FIX (pilot): bare Game.sleep() at dawn REFUSES honestly
          // ('barely dawn' guard, game.js sleep()) — the pilot's 5 probe
          // days all stayed day 43 and the 'today' gate blocked every
          // lesson. Advance like the main loop: wait through the parts,
          // then sleep; retry up to 3 cycles and record a stuck day.
          let adv = 0;
          const startDay = nowDay(Game);
          while (nowDay(Game) === startDay && adv < 3 && !Game.over) {
            adv++;
            try { for (let pp = 0; pp < 3; pp++) Game.doAction('wait'); } catch (e) {}
            try { Game.sleep(); } catch (e) { L.sleepError = e.message; break; }
          }
          dayRec.advanceCycles = adv;
          dayRec.dayAfterAdvance = nowDay(Game);
          if (nowDay(Game) === startDay) { dayRec.stuckDay = true; }
        }
      }
      L.after = playerSkills();
      L.gained = L.after.filter(x => L.before.indexOf(x) < 0);
      L.hideSnapEnd = hideSnap();
      L.verdict = L.gained.length >= 2 ? 'LEARN-GO' : (L.gained.length === 1 ? 'LEARN-1' : 'LEARN-0');
      try { fs.writeFileSync(EVID + `/journey-establishment-r65-learn-seed${seed}.json`, JSON.stringify(L, null, 1)); } catch (e) { L.writeError = e.message; }
    } catch (e) { L.verdict = 'ERROR'; L.error = String(e && e.message || e); }
    return L;
  })();


  // ---- R65 HIDE-CRAFT PROBE (post-panel, post-learn: runs AFTER the out JSON
  // is written, so its crafts/sleeps cannot move any panel number; writes its
  // own file). r63's blank: recipe fires, policy never attempts craft.
  // Attempts Game.craft('hide_armor') directly on up to 5 probe days.
  // craft() reads PLAYER PACK materials only (hide 2 + vine 1); stash hide
  // does not count — recorded separately so a stash-rich/pack-poor seed
  // classifies as NO-MATERIALS-IN-PACK, not as a craft failure.
  const hideCraftProbe = (() => {
    const H = { seed, run: 'r65', verdict: 'NOT-RUN', attempts: [], error: null };
      probePhase = 'hidecraft';
    try {
      if (Game.over) { H.verdict = 'SKIP-over'; try { fs.writeFileSync(EVID + `/journey-establishment-r65-hidecraft-seed${seed}.json`, JSON.stringify(H, null, 1)); } catch (e) { H.writeError = e.message; } return H; }
      const packMats = () => { const m = {}; try { for (const it of (Game.state.scholar.inventory || [])) if (it && it.material) m[it.material] = (m[it.material] || 0) + (it.units || 0); } catch (e) {} return m; };
      const stashMats = () => { try { return Object.assign({}, ((Game.state.village || {}).stash || {}).materials || {}); } catch (e) { return {}; } };
      const recipe = () => { try { return ((Game.state.codex || {}).recipes || {}).hide_armor || null; } catch (e) { return null; } };
      const packHas = () => { try { return (Game.state.scholar.inventory || []).some(it => it && it.itemId === 'hide_armor'); } catch (e) { return false; } };
      const wornHide = () => { try { return Object.values((Game.state.scholar || {}).equipped || {}).map(e => e && e.itemId).filter(Boolean).includes('hide_armor'); } catch (e) { return false; } };
      const advance = (rec) => { let adv = 0; const sd = nowDay(Game); while (nowDay(Game) === sd && adv < 3 && !Game.over) { adv++; try { driveFights(Game, policy, ctx); } catch (e) {}
        try { driveContests(Game, policy, ctx); } catch (e) {}
        try { for (let pp = 0; pp < 3; pp++) Game.doAction('wait'); } catch (e) {}
        try { driveFights(Game, policy, ctx); } catch (e) {}
        try { driveContests(Game, policy, ctx); } catch (e) {}
        try { Game.sleep(); } catch (e) { rec.sleepError = e.message; break; } } rec.advanceCycles = adv; rec.dayAfterAdvance = nowDay(Game); if (nowDay(Game) === sd) rec.stuckDay = true; };
      for (let d = 0; d < 5; d++) {
        const att = { day: nowDay(Game), recipe: recipe(), packMats: packMats(), stashMats: stashMats(), packHasBefore: packHas(), wornBefore: wornHide(), result: null, error: null, equip: null };
        try { const r = Game.craft ? Game.craft('hide_armor') : null; att.result = r ? 'made' : 'null'; } catch (e) { att.error = e.message; att.result = 'error'; }
        att.packMatsAfter = packMats(); att.packHasAfter = packHas(); att.wornAfter = wornHide();
        if (att.packHasAfter && !att.wornAfter) {
          try { const inv = Game.state.scholar.inventory || []; const idx = inv.findIndex(it => it && it.itemId === 'hide_armor'); if (idx >= 0) { Game.equip(idx, 'armor'); att.equip = 'attempted'; } else att.equip = 'not-found'; } catch (e) { att.equip = 'ERR:' + e.message; }
          att.wornAfterEquip = wornHide();
        }
        H.attempts.push(att);
        if (att.result === 'made') break;
        if (d < 4 && !Game.over) advance(att);
      }
      const made = H.attempts.some(a => a.result === 'made');
      const everRecipe = H.attempts.some(a => a.recipe && (a.recipe.level || 0) >= 1);
      const everMats = H.attempts.some(a => (a.packMats.hide || 0) >= 2 && (a.packMats.vine || 0) >= 1);
      H.verdict = made ? 'CRAFT-GO' : (!everRecipe ? 'NO-RECIPE' : (!everMats ? 'NO-MATERIALS-IN-PACK' : 'ATTEMPTED-NO-MAKE'));
      try { fs.writeFileSync(EVID + `/journey-establishment-r65-hidecraft-seed${seed}.json`, JSON.stringify(H, null, 1)); } catch (e) { H.writeError = e.message; }
    } catch (e) { H.verdict = 'ERROR'; H.error = String(e && e.message || e); }
    return H;
  })();

  // ---- R65 ARRIVALS-ACCEPT PROBE (post-panel, post-hidecraft: runs AFTER
  // the out JSON is written, so its accept/sleeps cannot move any panel
  // number; writes its own file). r63's blank: applications pending,
  // arrivals 0, driver never attempts accept. Accepts the best-judged
  // pending application via Game.acceptApplication, advances up to 8 days,
  // and records whether the applicant joins the living roster.
  const arrivalsProbe = (() => {
    const A = { seed, run: 'r65', verdict: 'NOT-RUN', before: null, scores: null, accepted: null, days: [], after: null, error: null };
      probePhase = 'arrivals';
    try {
      if (Game.over) { A.verdict = 'SKIP-over'; try { fs.writeFileSync(EVID + `/journey-establishment-r65-arrivals-seed${seed}.json`, JSON.stringify(A, null, 1)); } catch (e) { A.writeError = e.message; } return A; }
      const snapMship = () => { try { const m = Game.mshipState ? Game.mshipState() : null; if (!m) return null; return { applications: (m.applications || []).map(a => ({ id: a.id, name: a.name, occ: a.formerOccupation, day: a.day })), arrivals: (m.arrivals || []).map(a => ({ id: a.id, name: a.name, arriveDay: a.arriveDay })), rosterLen: ((Game.state.village || {}).roster || []).length }; } catch (e) { return { error: e.message }; } };
      const rosterNames = () => { const out = []; try { for (const id of livingVids(Game)) out.push({ id: String(id), name: nameOf(Game, id) }); } catch (e) {} return out; };
      const advance = (rec) => { let adv = 0; const sd = nowDay(Game); while (nowDay(Game) === sd && adv < 3 && !Game.over) { adv++; try { driveFights(Game, policy, ctx); } catch (e) {}
        try { driveContests(Game, policy, ctx); } catch (e) {}
        try { for (let pp = 0; pp < 3; pp++) Game.doAction('wait'); } catch (e) {}
        try { driveFights(Game, policy, ctx); } catch (e) {}
        try { driveContests(Game, policy, ctx); } catch (e) {}
        try { Game.sleep(); } catch (e) { rec.sleepError = e.message; break; } } rec.advanceCycles = adv; rec.dayAfterAdvance = nowDay(Game); if (nowDay(Game) === sd) rec.stuckDay = true; };
      const m0 = Game.mshipState ? Game.mshipState() : null;
      A.before = snapMship();
      if (!m0 || !(m0.applications || []).length) { A.verdict = 'NO-APPLICATIONS'; try { fs.writeFileSync(EVID + `/journey-establishment-r65-arrivals-seed${seed}.json`, JSON.stringify(A, null, 1)); } catch (e) { A.writeError = e.message; } return A; }
      let best = null, bestScore = -1;
      A.scores = [];
      for (const app of m0.applications) {
        let s = null;
        try { const j = Game.judgeApplication ? Game.judgeApplication(app) : null; s = j ? j.score : null; } catch (e) { s = 'ERR:' + e.message; }
        A.scores.push({ id: app.id, name: app.name, score: s });
        if (typeof s === 'number' && s > bestScore) { bestScore = s; best = app; }
      }
      const target = best || m0.applications[0];
      let res = null;
      try { res = Game.acceptApplication ? Game.acceptApplication(target.id) : null; } catch (e) { A.acceptError = e.message; }
      A.accepted = { id: target.id, name: target.name, score: bestScore, returned: res };
      if (!res) { A.verdict = 'ACCEPT-FAILED'; A.after = snapMship(); try { fs.writeFileSync(EVID + `/journey-establishment-r65-arrivals-seed${seed}.json`, JSON.stringify(A, null, 1)); } catch (e) { A.writeError = e.message; } return A; }
      let joined = false;
      for (let d = 0; d < 8; d++) {
        const dayRec = { day: nowDay(Game), mship: snapMship(), roster: rosterNames() };
        dayRec.joined = dayRec.roster.some(r => r.id === target.id || r.name === target.name); // r65 pilot fix: arrived villagers display first name only ('Rosa'), not the application full name ('Rosa Mendez') — id match is the reliable join signal
        if (dayRec.joined) joined = true;
        A.days.push(dayRec);
        if (joined) break;
        if (d < 7 && !Game.over) advance(dayRec);
      }
      A.after = snapMship();
      A.verdict = joined ? 'ARRIVED' : 'ACCEPTED-PENDING';
      try { fs.writeFileSync(EVID + `/journey-establishment-r65-arrivals-seed${seed}.json`, JSON.stringify(A, null, 1)); } catch (e) { A.writeError = e.message; }
    } catch (e) { A.verdict = 'ERROR'; A.error = String(e && e.message || e); }
    return A;
  })();


  // ---- R65 BARK-CRAFT PROBE (post-panel, post-arrivals: runs AFTER the
  // out JSON, so its crafts/sleeps cannot move any panel number; writes
  // its own file). Mirrors the hide-craft probe: bark_armor mats are
  // bark 3 + vine 2 from the PLAYER PACK (stash does not count). The
  // panel tele rows measure NPC attempts; this probe measures whether
  // a direct attempt succeeds at all.
  const barkCraftProbe = (() => {
    const B = { seed, run: 'r65', verdict: 'NOT-RUN', attempts: [], error: null };
    try {
      probePhase = 'barkcraft';
      const packMats = () => { const m = {}; try { for (const it of (Game.state.scholar.inventory || [])) if (it && it.material) m[it.material] = (m[it.material] || 0) + (it.units || 0); } catch (e) {} return m; };
      const stashMats = () => { try { return Object.assign({}, ((Game.state.village || {}).stash || {}).materials || {}); } catch (e) { return {}; } };
      const recipe = () => { try { return ((Game.state.codex || {}).recipes || {}).bark_armor || null; } catch (e) { return null; } };
      const packHas = () => { try { return (Game.state.scholar.inventory || []).some(it => it && it.itemId === 'bark_armor'); } catch (e) { return false; } };
      const wornBark = () => { try { return Object.values((Game.state.scholar || {}).equipped || {}).map(e => e && e.itemId).filter(Boolean).includes('bark_armor'); } catch (e) { return false; } };
      const advance = (rec) => { let adv = 0; const sd = nowDay(Game); while (nowDay(Game) === sd && adv < 3 && !Game.over) { adv++; try { driveFights(Game, policy, ctx); } catch (e) {}
        try { driveContests(Game, policy, ctx); } catch (e) {}
        try { for (let pp = 0; pp < 3; pp++) Game.doAction('wait'); } catch (e) {}
        try { driveFights(Game, policy, ctx); } catch (e) {}
        try { driveContests(Game, policy, ctx); } catch (e) {}
        try { Game.sleep(); } catch (e) { rec.sleepError = e.message; break; } } rec.advanceCycles = adv; rec.dayAfterAdvance = nowDay(Game); if (nowDay(Game) === sd) rec.stuckDay = true; };
      if (Game.over) { B.verdict = 'SKIP-over'; try { fs.writeFileSync(EVID + `/journey-establishment-r65-barkcraft-seed${seed}.json`, JSON.stringify(B, null, 1)); } catch (e) { B.writeError = e.message; } return B; }
      for (let d = 0; d < 5; d++) {
        const att = { day: nowDay(Game), recipe: recipe(), packMats: packMats(), stashMats: stashMats(), packHasBefore: packHas(), wornBefore: wornBark(), result: null, error: null, equip: null };
        try { const r = Game.craft ? Game.craft('bark_armor') : null; att.result = r ? 'made' : 'null'; } catch (e) { att.error = e.message; att.result = 'error'; }
        att.packMatsAfter = packMats(); att.packHasAfter = packHas(); att.wornAfter = wornBark();
        if (att.packHasAfter && !att.wornAfter) {
          try { const inv = Game.state.scholar.inventory || []; const idx = inv.findIndex(it => it && it.itemId === 'bark_armor'); if (idx >= 0) { Game.equip(idx, 'armor'); att.equip = 'attempted'; } else att.equip = 'not-found'; } catch (e) { att.equip = 'ERR:' + e.message; }
          att.wornAfterEquip = wornBark();
        }
        B.attempts.push(att);
        if (att.result === 'made') break;
        if (d < 4 && !Game.over) advance(att);
      }
      const made = B.attempts.some(a => a.result === 'made');
      const everRecipe = B.attempts.some(a => a.recipe && (a.recipe.level || 0) >= 1);
      const everMats = B.attempts.some(a => (a.packMats.bark || 0) >= 3 && (a.packMats.vine || 0) >= 2);
      B.verdict = made ? 'CRAFT-GO' : (!everRecipe ? 'NO-RECIPE' : (!everMats ? 'NO-MATERIALS-IN-PACK' : 'ATTEMPTED-NO-MAKE'));
      try { fs.writeFileSync(EVID + `/journey-establishment-r65-barkcraft-seed${seed}.json`, JSON.stringify(B, null, 1)); } catch (e) { B.writeError = e.message; }
    } catch (e) { B.verdict = 'ERROR'; B.error = String(e && e.message || e); try { fs.writeFileSync(EVID + `/journey-establishment-r65-barkcraft-seed${seed}.json`, JSON.stringify(B, null, 1)); } catch (e2) {} }
    return B;
  })();

  // ---- R65 CONTEST-DEATH STAGED PROBE (post-panel, LAST probe: runs
  // AFTER the out JSON, so the staged death cannot move any panel
  // number; writes its own file). Verifies landed fix 06b502d53
  // (sim-contestdeath-b): villager contest deaths must route through
  // registerDeath (death tele) + a village.fallen entry, with NO field
  // corpse (the body died on camera, off-map — by design). Calls the
  // engine's own choke point _cxKillContestant with a deliberately
  // fake contest id ('probe-contest') so no real contest's death
  // count is inflated. A second immediate call is a re-entry
  // OBSERVATION only: real paths guard re-entry in _contestDie.
  const contestDeathProbe = (() => {
    const C = { seed, run: 'r65', verdict: 'NOT-RUN', subject: null, before: null, after1: null, after1Checks: null, after2: null, after2Checks: null, error: null };
    try {
      probePhase = 'contestdeath';
      const teleDeaths = () => { try { return (Game.state.telemetry || []).filter(t => t && t.type === 'death').map(t => ({ day: t.day, who: t.who, cause: t.cause, kind: t.kind })); } catch (e) { return []; } };
      const ledger = () => { try { return Object.assign({}, (Game.state || {}).contestDeathsById || {}); } catch (e) { return {}; } };
      const fallen = () => { try { return (((Game.state.village || {}).fallen) || []).map(f => ({ villagerId: String(f.villagerId), day: f.day, cause: f.cause })); } catch (e) { return []; } };
      const corpses = () => { try { const l = Game.corpses ? Game.corpses() : []; return Array.isArray(l) ? l.length : null; } catch (e) { return 'ERR:' + e.message; } };
      const rosterHas = (id) => livingVids(Game).some(v => String(v) === String(id));
      const diffRows = (after, before) => { const bset = new Set(before.map(x => JSON.stringify(x))); return after.filter(x => !bset.has(JSON.stringify(x))); };
      const write = () => { try { fs.writeFileSync(EVID + `/journey-establishment-r65-contestdeath-seed${seed}.json`, JSON.stringify(C, null, 1)); } catch (e) { C.writeError = e.message; } };
      if (Game.over) { C.verdict = 'SKIP-over'; write(); return C; }
      let subj = null;
      for (const vid of livingVids(Game)) { if (String(vid) === String(Game.villagerId)) continue; subj = vid; break; }
      if (!subj) { C.verdict = 'NO-SUBJECT'; write(); return C; }
      C.subject = { id: String(subj), name: nameOf(Game, subj) };
      C.before = { teleDeaths: teleDeaths(), ledger: ledger(), fallen: fallen(), corpses: corpses(), onRoster: rosterHas(subj) };
      if (typeof Game._cxKillContestant !== 'function') { C.verdict = 'NO-FUNCTION'; write(); return C; }
      try { Game._cxKillContestant(subj, 'probe-contest'); } catch (e) { C.call1Error = e.message; }
      C.after1 = { teleDeaths: teleDeaths(), ledger: ledger(), fallen: fallen(), corpses: corpses(), onRoster: rosterHas(subj) };
      const newTele = diffRows(C.after1.teleDeaths, C.before.teleDeaths);
      const newFallen = diffRows(C.after1.fallen, C.before.fallen);
      C.after1Checks = { offRoster: !C.after1.onRoster, newTeleContest: newTele.filter(t => t.cause === 'contest'), newTeleOther: newTele.filter(t => t.cause !== 'contest'), newFallenContest: newFallen.filter(f => f.cause === 'contest'), ledgerDelta: (C.after1.ledger['probe-contest'] || 0) - (C.before.ledger['probe-contest'] || 0), corpsesDelta: (typeof C.after1.corpses === 'number' && typeof C.before.corpses === 'number') ? C.after1.corpses - C.before.corpses : null };
      try { Game._cxKillContestant(subj, 'probe-contest'); } catch (e) { C.call2Error = e.message; }
      C.after2 = { teleDeaths: teleDeaths(), ledger: ledger(), fallen: fallen(), corpses: corpses(), onRoster: rosterHas(subj) };
      C.after2Checks = { ledgerDelta2: (C.after2.ledger['probe-contest'] || 0) - (C.after1.ledger['probe-contest'] || 0), teleCountDelta2: C.after2.teleDeaths.length - C.after1.teleDeaths.length, fallenCountDelta2: C.after2.fallen.length - C.after1.fallen.length, corpsesDelta2: (typeof C.after2.corpses === 'number' && typeof C.after1.corpses === 'number') ? C.after2.corpses - C.after1.corpses : null };
      const ch = C.after1Checks;
      const led = ch.offRoster && ch.newTeleContest.length >= 1 && ch.newFallenContest.length >= 1 && ch.ledgerDelta === 1 && ch.corpsesDelta === 0;
      const any = ch.offRoster || ch.newTeleContest.length >= 1 || ch.newFallenContest.length >= 1 || ch.ledgerDelta >= 1;
      C.verdict = led ? 'LEDGERED' : (any ? 'PARTIAL' : 'BYPASS');
      write();
    } catch (e) { C.verdict = 'ERROR'; C.error = String(e && e.message || e); try { fs.writeFileSync(EVID + `/journey-establishment-r65-contestdeath-seed${seed}.json`, JSON.stringify(C, null, 1)); } catch (e2) {} }
    return C;
  })();

  return { seed, outPath, repeatSitProbe, learnProbe, hideCraftProbe, barkCraftProbe, contestDeathProbe, arrivalsProbe, materialTraceDays: matTrace.length, armorCraft: { rows: armorCraftLog.length, ok: armorCraftLog.filter(r => r.ok).length, fail: armorCraftLog.filter(r => !r.ok).length }, skillLessons: { rows: skillLessonLog.length, villagerVia: skillLessonLog.filter(r => r.via === 'villager').length, convoVia: skillLessonLog.filter(r => r.via === 'conversation').length }, c1, regressions: regressions.length, c3: out.c3, c4: out.c4, guardrails: out.guardrails, arrivals: arrivals.length, hunterArrivals: out.hunterArrivals.length, huntingGuideArrivals: out.huntingGuideArrivals.length, minAlive };
}

async function main() {
  for (const seed of SEEDS) {
    console.log(`--- r65 seed=${seed} light=${LIGHT} ---`);
    const r = await runSeed(seed);
    console.log(JSON.stringify({ seed, c1: r.c1, regressions: r.regressions, c3: r.c3, c4: r.c4, guardrails: r.guardrails }, null, 1));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
