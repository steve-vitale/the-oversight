// scripts/traderoad-instrument-20261109.js — journey-scale r113 Q1+Q2
// (lane A, leg 3 SCALE). The trade-road trace + wild wave-4 watch.
//
// POLICY-SIDE ONLY. ZERO src/js changes. Read-only daily snapshot +
// pure-delegation wrappers (same pattern as the r112 ladder
// instrument, required unchanged — not a copy — alongside this one):
// every wrapper logs its call and forwards exactly — no behavior
// change, no RNG draw, no state write of its own.
//
// Q1 (TRADE ROAD): a delegating wrapper on Game.answerNationalChoice
// logs {day, shape, how} for every beat answer, plus a daily
// trade-road snapshot {day, subs, trN, trSeasoned, covN, viable,
// sealed, charteredLinks, candidates, pendingCounter, pendingShape}.
// The viability read is the policy's own tradeViable (required from
// the trade-road policy file, not re-implemented).
//
// Q2 (WILD WAVE-4): a delegating wrapper on Game.fieldFight logs
// every off-screen villager-vs-monster fight: {day, vid, cls
// (scholar/villager by the day-joined rule — the same rule the r112
// kill attribution uses, borrowed from the ladder instrument),
// mid, wave (from mdef.wave), outcome, rounds}. Outcomes:
// 'evade' (saw it, gave it room — no contact), 'vKill', 'vDie',
// 'vFlee', 'mFlee', 'alreadyDead'. A villager-class call vs a
// wave-4+ monster IS a reach; a fight outcome (not evade) IS a face.
//
// Daily snapshot fields (same point as the ladder snapshot — after
// baseDaily, before endDay): day, subs, trN, trSeasoned, covN,
// viable, sealed, charteredLinks, candidates, pendingCounter,
// pendingShape. The snapshot also records the day's scholarVid into
// scholarVidsByDay (the day-joined map for the wild-fight
// classification; the wrapper itself also reads Game.villagerId at
// call time as the current day's scholar).
//
// Usage (driver):
//   const TRINST = require('./traderoad-instrument-20261109');
//   const trInst = TRINST.install(Game);   // after setupGame
//   trInst.snapshot(ctx);                  // once per policy day
//   const fin = trInst.finalize();         // at seed end
//   trInst.uninstall();
// PRE-REGISTER: evidence/2026-11-09/journey-scale-r113-prereg.md
'use strict';
const LI = require('./ladder-instrument-20261109');
const TR = require('./policies/scalecourt-traderoad-r113');

function install(Game) {
  const t = { daily: [], beatAnswers: [], wildFights: [], errors: [], scholarVidsByDay: {} };
  const orig = {};
  const gday = () => { try { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) { return 0; } };
  function err(where, e) {
    try { t.errors.push({ day: gday(), where: String(where), err: String((e && e.message) || e).slice(0, 200) }); } catch (e2) {}
  }
  // Seasoned mirrors the natGateWatch rule exactly: 30+ days old AND
  // trust 40+ (conquered: the season, not the trust; MERCY grace
  // counts while mercyUntil holds).
  function seasoned(l, day) {
    try {
      if (!l || l.status !== 'active') return false;
      if ((day - (l.day | 0)) < 30) return false;
      if (l.conquered) return true;
      if (l.mercyUntil && day < l.mercyUntil) return true;
      return (l.trust | 0) >= 40;
    } catch (e) { return false; }
  }
  function links() {
    try { return (typeof Game.hierarchyState === 'function' ? Game.hierarchyState() : []) || []; }
    catch (e) { return []; }
  }
  // answerNationalChoice wrapper: log the beat answer (shape read
  // BEFORE the call — the call clears pendingNational), forward
  // exactly, return the original return verbatim.
  try {
    if (typeof Game.answerNationalChoice !== 'function') throw new Error('answerNationalChoice missing');
    orig.answerNationalChoice = Game.answerNationalChoice;
    Game.answerNationalChoice = function (how) {
      let shape = null;
      try { shape = ((Game.state || {}).pendingNational || {}).shape || null; } catch (e) {}
      let out;
      try { out = orig.answerNationalChoice.apply(Game, arguments); }
      catch (e) { err('answerNationalChoice', e); throw e; }
      try { t.beatAnswers.push({ day: gday(), shape: shape, how: how, out: (out == null ? null : String(out).slice(0, 40)) }); } catch (e) {}
      return out;
    };
  } catch (e) { err('install:answerNationalChoice', e); }
  // fieldFight wrapper: log the fight, forward exactly. The monster
  // wave comes from mdef.wave; the fighter class uses the day-joined
  // rule with the live scholar vid as "today" (fights run during the
  // day, before the snapshot) and the map's yesterday entry.
  try {
    if (typeof Game.fieldFight !== 'function') throw new Error('fieldFight missing');
    orig.fieldFight = Game.fieldFight;
    Game.fieldFight = function (vid, mdef, m, opts) {
      let rec;
      try { rec = orig.fieldFight.apply(Game, arguments); }
      catch (e) { err('fieldFight', e); throw e; }
      try {
        const day = gday();
        let today = null, yest = null;
        try { today = Game.villagerId || null; } catch (e) {}
        try { yest = t.scholarVidsByDay[day - 1] || null; } catch (e) {}
        const cls = LI.classifyKill(vid, today, yest);
        t.wildFights.push({
          day: day, vid: (vid == null ? null : vid), cls: cls,
          mid: (mdef && mdef.id) || null, wave: (mdef && mdef.wave != null) ? (mdef.wave | 0) : null,
          outcome: (rec && rec.outcome) || null, rounds: (rec && rec.rounds != null) ? (rec.rounds | 0) : null,
        });
      } catch (e) { err('fieldFight:record', e); }
      return rec;
    };
  } catch (e) { err('install:fieldFight', e); }
  function snapshot(ctx) {
    try {
      const day = gday();
      try { t.scholarVidsByDay[day] = Game.villagerId || null; } catch (e) {}
      const ls = links();
      const active = ls.filter(l => l && l.status === 'active');
      const tr = active.filter(l => l.kind === 'trade');
      const trSeasoned = tr.filter(l => seasoned(l, day)).length;
      let candidates = 0;
      try {
        const cands = ((Game.state || {}).otherVillages || []).filter(v => v && v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v) && !(Game.linkWith && Game.linkWith(v.id)));
        candidates = cands.filter(v => (v.opinion || 0) >= 10).length;
      } catch (e) { candidates = 0; }
      let viable = null, sealed = null, pool = 0;
      try { viable = TR.tradeViable(Game); } catch (e) { err('snapshot:tradeViable', e); }
      try { sealed = TR.tradeSealed(Game); } catch (e) { err('snapshot:tradeSealed', e); }
      try { pool = TR.tradePool(Game); } catch (e) { err('snapshot:tradePool', e); }
      t.daily.push({
        day: day,
        subs: TR.subCount(Game),
        trN: tr.length, trSeasoned: trSeasoned,
        covN: active.filter(l => l.kind === 'covenant').length,
        viable: viable, sealed: sealed,
        charteredLinks: tr.filter(l => l.chartered === true).length,
        candidates: candidates, pool: pool,
        pendingCounter: !!(Game.state && Game.state.pendingCounter),
        pendingShape: ((Game.state || {}).pendingNational || {}).shape || null,
      });
    } catch (e) { err('snapshot', e); }
  }
  function finalize() {
    try {
      return {
        daily: t.daily, beatAnswers: t.beatAnswers, wildFights: t.wildFights,
        scholarVidsByDay: t.scholarVidsByDay, errors: t.errors,
      };
    } catch (e) {
      return { daily: t.daily, beatAnswers: t.beatAnswers, wildFights: t.wildFights, scholarVidsByDay: t.scholarVidsByDay, errors: t.errors.concat([{ day: -1, where: 'finalize', err: String(e && e.message) }]) };
    }
  }
  function uninstall() {
    try { if (orig.answerNationalChoice) Game.answerNationalChoice = orig.answerNationalChoice; } catch (e) {}
    try { if (orig.fieldFight) Game.fieldFight = orig.fieldFight; } catch (e) {}
  }
  return { t: t, snapshot: snapshot, finalize: finalize, uninstall: uninstall };
}

module.exports = { install: install };
