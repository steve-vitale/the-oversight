#!/usr/bin/env node
// heraldhp-instrument-20261031.js — Herald HP ledger (sim-heraldhp-b,
// 2026-10-31, axis scale-onramp). DIAGNOSTIC — no lever.
//
// Answers #1595: where does the Herald entity's HP go between
// mustercall-b's refusals? Snapshots EVERY herald world entity per
// wrapped call (tag = object identity via a per-run WeakMap, never
// written to game state), so an entity replacement cannot masquerade
// as damage. Every wrapped call whose exit snapshot differs from its
// entry snapshot pushes a ledger row {seq, fn, day, depth, span,
// parent, before[], after[], detail}. Spans nest (parent = enclosing
// wrapped call's span, or null); the analyzer attributes each delta
// to the DEEPEST (childless) row covering it, so a fight inside
// villagerMonsterTick inside worldTick attributes to the fight.
//
// Env-gated on HERALDHP=1. Contract: install(Game, t), uninstall;
// when unset the wrappers are never installed. All wrappers are
// call-through, pure reads + allocation only, zero game-state
// writes, zero RNG draws. Snapshot reads state.worldMonsters
// directly (never Game.worldMonsters(), which would create the
// array when absent).
//
// Wrapped when present as Game methods (missing names are recorded
// in t.wrapped[name] = false, never an error): fieldFight (ALL
// waves/mids — the herald instrument's >= 4 filter is NOT reused
// here, so agency-style fights with a world-object mdef are still
// seen), aidFight, startCombat, tbEnd, spawnWorldMonster,
// removeWorldMonster, titanDawnTick, monsterTurn, animalTurn,
// villagerMonsterTick, resolveWildMonsterEncounter, resolvePatrol,
// worldTick, wanderWorldMonsters, maintainWorldMonsters, sleep.
// NOT Game methods, hence NOT wrappable here (closure-internal in
// titans.js): titanPlace, titanAdvanceOmen, titanEscalate,
// titanMusterUpkeep, titanTurnTick, titanRepairPlacements. Their
// effects surface at the titanDawnTick / sleep / titanSelfActions
// level instead, and the analyzer says so explicitly — a dawn
// -internal delta is attributed to DAWN/TITAN-TICK, never
// guessed finer.
//
// v2 (2026-10-31, after the pilot): havenRaidTick +
// havenGrowthDaily added — the pilot proved the 175-HP drops
// happen OUTSIDE all v1 wrappers (daily snapshots move
// 700 -> 525 -> 350 -> 118 with no ledger row), and the raid
// draft in havenGrowth.js is the code-level suspect (palisade
// wall = round(maxHp * 0.25) = 175 for the Herald). Snapshot
// entries also carry raidBorn from v2 on, so a drafted
// entity is provable from the row itself.
'use strict';

function instrumentOn() { return process.env.HERALDHP === '1'; }

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function snapKey(ents) {
  return JSON.stringify(ents);
}

// install(Game, t): t = {ledger, fieldRows, daily, errors, wrapped}.
// Returns uninstall.
function install(Game, t) {
  if (!t.ledger) t.ledger = [];
  if (!t.fieldRows) t.fieldRows = [];
  if (!t.daily) t.daily = [];
  if (!t.errors) t.errors = [];
  if (!t.wrapped) t.wrapped = {};
  const orig = {};
  const tags = new WeakMap();
  let nextTag = 1;
  let seq = 0;
  let spanSeq = 0;
  const stack = []; // active wrapped frames: {span, fn}

  function snapshot() {
    try {
      const arr = ((Game.state || {}).worldMonsters) || [];
      const out = [];
      for (let i = 0; i < arr.length; i++) {
        const m = arr[i];
        if (!m || m.id !== 'herald') continue;
        let tag = tags.get(m);
        if (tag === undefined) { tag = nextTag++; tags.set(m, tag); }
        out.push({
          tag: tag, idx: i,
          tx: (m.tx !== undefined ? m.tx : null), ty: (m.ty !== undefined ? m.ty : null),
          mx: (m.mx !== undefined ? m.mx : null), my: (m.my !== undefined ? m.my : null),
          hp: (m.hp !== undefined ? m.hp : null), maxHp: (m.maxHp !== undefined ? m.maxHp : null),
          titan: !!m.titan, lingering: !!m.lingering, raidBorn: !!m.raidBorn,
        });
      }
      return out;
    } catch (e) {
      try { t.errors.push('snapshot: ' + String((e && e.message) || e)); } catch (e2) {}
      return [];
    }
  }

  function wrap(name, detailFn) {
    if (typeof Game[name] !== 'function') { t.wrapped[name] = false; return; }
    t.wrapped[name] = true;
    const o = Game[name];
    orig[name] = o;
    Game[name] = function () {
      const args = Array.prototype.slice.call(arguments);
      const frame = { span: ++spanSeq, fn: name };
      const parent = stack.length ? stack[stack.length - 1].span : null;
      const before = snapshot();
      const dayBefore = gday(Game);
      stack.push(frame);
      let r, thrown = null;
      try {
        r = o.apply(this, args);
      } catch (e) { thrown = e; }
      stack.pop();
      try {
        const after = snapshot();
        if (snapKey(before) !== snapKey(after)) {
          let detail = null;
          try { detail = detailFn ? detailFn(args, r) : null; } catch (e) { detail = null; }
          t.ledger.push({
            seq: ++seq, fn: name, day: gday(Game), dayBefore: dayBefore,
            depth: stack.length, span: frame.span, parent: parent,
            before: before, after: after, detail: detail,
          });
        }
        if (name === 'fieldFight') {
          try {
            const mdef = args[1] || {};
            const mid = (mdef && mdef.id) || null;
            const rec = (r && typeof r === 'object') ? r : null;
            t.fieldRows.push({
              seq: seq, span: frame.span, day: gday(Game),
              vid: (args[0] === undefined || args[0] === null) ? null : String(args[0]),
              mid: mid,
              mdefIsWorldObject: !!(mdef && mdef.tx !== undefined),
              worldArgNull: (args[2] === null || args[2] === undefined),
              outcome: rec ? (rec.outcome || null) : null,
              rounds: rec ? (rec.rounds != null ? rec.rounds : null) : null,
              mDealt: rec ? (rec.mDealt != null ? rec.mDealt : null) : null,
              mHpLeft: rec ? (rec.mHpLeft != null ? rec.mHpLeft : null) : null,
              vTaken: rec ? (rec.vTaken != null ? rec.vTaken : null) : null,
              entryHp: before.length ? before[0].hp : null,
              exitHp: after.length ? after[0].hp : null,
            });
          } catch (e) { try { t.errors.push('fieldRow: ' + String(e && e.message)); } catch (e2) {} }
        }
        if (name === 'sleep') {
          try { t.daily.push({ day: gday(Game), ents: snapshot() }); } catch (e) {}
        }
      } catch (e) { try { t.errors.push('wrap.' + name + ': ' + String((e && e.message) || e)); } catch (e2) {} }
      if (thrown) throw thrown;
      return r;
    };
  }

  wrap('fieldFight', function (args, r) {
    try {
      const rec = (r && typeof r === 'object') ? r : null;
      return {
        vid: (args[0] === undefined || args[0] === null) ? null : String(args[0]),
        mid: (args[1] && args[1].id) || null,
        outcome: rec ? (rec.outcome || null) : null,
        mDealt: rec ? (rec.mDealt != null ? rec.mDealt : null) : null,
        mHpLeft: rec ? (rec.mHpLeft != null ? rec.mHpLeft : null) : null,
      };
    } catch (e) { return null; }
  });
  wrap('aidFight', function (args, r) {
    try {
      const rec = (r && typeof r === 'object') ? r : null;
      return {
        vid: (args[0] === undefined || args[0] === null) ? null : String(args[0]),
        mid: (args[1] && args[1].id) || null,
        outcome: rec ? (rec.outcome || null) : null,
        mDealt: rec ? (rec.mDealt != null ? rec.mDealt : null) : null,
      };
    } catch (e) { return null; }
  });
  wrap('startCombat', function (args) {
    return { mid: args[0] || null };
  });
  wrap('tbEnd', function (args) {
    return { result: (args[0] === undefined || args[0] === null) ? null : String(args[0]) };
  });
  wrap('spawnWorldMonster', function (args) {
    try {
      const mdef = args[0];
      return {
        id: (typeof mdef === 'string') ? mdef : (mdef && mdef.id) || null,
        tx: args[1] !== undefined ? args[1] : null, ty: args[2] !== undefined ? args[2] : null,
        hpOpt: (args[3] && args[3].hp !== undefined) ? args[3].hp : null,
        titanOpt: !!(args[3] && args[3].titan),
      };
    } catch (e) { return null; }
  });
  wrap('removeWorldMonster', function (args) {
    try {
      const m = args[0] || {};
      return { id: m.id || null, tx: m.tx !== undefined ? m.tx : null, ty: m.ty !== undefined ? m.ty : null, hp: m.hp !== undefined ? m.hp : null };
    } catch (e) { return null; }
  });
  wrap('titanDawnTick', null);
  wrap('monsterTurn', null);
  wrap('animalTurn', null);
  wrap('villagerMonsterTick', null);
  wrap('resolveWildMonsterEncounter', function (args) {
    try { const m = args[1] || {}; return { vid: String(args[0]), mid: m.id || null }; } catch (e) { return null; }
  });
  wrap('resolvePatrol', function (args) {
    try { const m = args[1] || {}; return { vid: String(args[0]), mid: m.id || null }; } catch (e) { return null; }
  });
  wrap('worldTick', null);
  wrap('wanderWorldMonsters', null);
  wrap('maintainWorldMonsters', null);
  wrap('havenRaidTick', function (args, r) {
    return { result: (r === undefined || r === null) ? null : !!r };
  });
  wrap('havenGrowthDaily', null);
  wrap('sleep', null);

  return function uninstall() {
    for (const k of Object.keys(orig)) { try { Game[k] = orig[k]; } catch (e) {} }
  };
}

module.exports = { instrumentOn, install };
