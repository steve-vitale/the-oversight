#!/usr/bin/env node
// test-divedeep-fix-b.js — proof for sim-divedeep-fix-b.
// Re-runs the prior arm's group C (dive boundary pair) against the fixed
// precheck, plus: (1) a boundary button-read purity check for dive,
// (2) a regression guard re-running challenge/end_it_before group B so the
// fix cannot silently move them. See evidence/2026-10-28/
// sim-divedeep-fix-b-prereg.md (committed BEFORE any after-measurement).
//
// Expected AFTER the fix (prereg leg a/b):
//   C-500-flag: button ENABLED, tap succeeds as tomorrow's dive:
//     day+1, dayTicks reset to 0, flag stamped on the NEW day, salvage in pack.
//   C-500-noflag: succeeds as tomorrow's dive (unchanged from before).
//   C-100-flag: button DISABLED, tap refuses pre-payment, 0/0/0 deltas.
//   C-purity: 10x _actionAvailable at dayTicks 500 (flag set/unset) -> deltas 0.
// Expected regression (prior arm's group B numbers, unchanged):
//   B-509-flag: boundary success (day+1, ticks -> 0); B-508-flag: refuse 0/0/0;
//   B-508-noflag: success same day (+3 ticks, -40 kcal tier).
// Exit 0 on pass, 1 on any failure, 2 on crash.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = (process.env.SEEDS || '9981,9983').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const REG_SEEDS = (process.env.REG_SEEDS || '9981,9982').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);

async function base(seed, abilities) {
  const { Game } = await loadGame({ seed, mode: 'divedeep-fix-b', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  const v = Game.state.village || {};
  const abs = (s.abilities || []);
  for (const aid of abilities) if (!abs.some((a) => (a.id || a) === aid)) abs.push({ id: aid, level: 1 });
  s.abilities = abs;
  try { s.kcal = Math.max(s.kcal || 0, 5000); s.health = Math.max(s.health || 0, 100); } catch (e) {}
  let partner = null;
  for (const vid of (v.roster || [])) {
    if (vid === Game.villagerId) continue;
    let person = null;
    try { person = Game.getPerson(vid); } catch (e) {}
    if (person && person.dead) continue;
    partner = vid; break;
  }
  if (!partner) throw new Error('no partner on roster seed=' + seed);
  return { Game, s, v, partner };
}
function snap(Game) { const s = Game.state.scholar; return { day: s.day, dayTicks: s.dayTicks, kcal: s.kcal }; }
function delta(a, b) { return { dDay: b.day - a.day, dTicks: b.dayTicks - a.dayTicks, dKcal: b.kcal - a.kcal }; }
function availOf(Game, ability, action) {
  try {
    const def = Game.abilityActionDef(ability, action);
    const a = Game._actionAvailable(ability, def.action);
    return { ok: !!a.ok, why: String(a.why || '') };
  } catch (e) { return { ok: null, why: 'avail-error:' + e.message }; }
}
function setPos(Game, ticks) {
  try { Game.state.scholar.dayTicks = ticks; Game.state.scholar.actionClock = 0; Game.dayPart = Math.floor(ticks / 128); } catch (e) {}
}
function setConvo(Game, v, partner, on) { v.conv = {}; if (on) v.conv[partner] = { active: true }; }
function findWaterTile(Game) {
  const tiles = (Game.map && Game.map.tiles) || [];
  for (let y = 0; y < tiles.length; y++) {
    const row = tiles[y] || [];
    for (let x = 0; x < row.length; x++) {
      const t = row[x];
      if (t && (t.type === 'creek' || t.type === 'wetland')) return { x, y, type: t.type };
    }
  }
  return null;
}
function captureSay(Game) {
  const lines = [];
  const orig = Game.say;
  if (typeof orig === 'function') {
    Game.say = function (...args) {
      try { if (lines.length < 200) lines.push(String(args[0] || '').slice(0, 500)); } catch (e) {}
      return orig.apply(this, args);
    };
  }
  return { lines, restore() { try { Game.say = orig; } catch (e) {} } };
}

const failures = [];
const rows = [];
function check(cond, msg) { if (!cond) failures.push(msg); return cond; }

async function groupC(seed) {
  const { Game: G0 } = await base(seed, ['water_breathing']);
  const wt0 = findWaterTile(G0);
  if (!wt0) { console.log(`C seed=${seed} SKIPPED no water tile`); rows.push({ group: 'C', seed, skipped: 'no-water-tile' }); return; }
  const cases = [
    { id: 'C-500-flag', ticks: 500, flag: true },
    { id: 'C-500-noflag', ticks: 500, flag: false },
    { id: 'C-100-flag', ticks: 100, flag: true },
  ];
  for (const c of cases) {
    const { Game, s } = await base(seed, ['water_breathing']);
    const w = findWaterTile(Game);
    Game.map.px = w.x; Game.map.py = w.y;
    const key = w.x + ',' + w.y + ':' + s.day;
    s.diveDayTiles = c.flag ? { [key]: true } : {};
    setPos(Game, c.ticks);
    const invBefore = (s.inventory || []).length;
    const before = snap(Game);
    const btn = availOf(Game, 'water_breathing', 'dive_deep');
    const cap = captureSay(Game);
    let result = null, err = null;
    try { result = Game.useAbility('water_breathing', 'dive_deep'); } catch (e) { err = String(e && (e.stack || e.message)); }
    cap.restore();
    const after = snap(Game);
    const d = delta(before, after);
    const newKey = w.x + ',' + w.y + ':' + after.day;
    const flagNewDay = !!(s.diveDayTiles || {})[newKey];
    const salvaged = (s.inventory || []).filter((it) => it.salvaged).length;
    rows.push({ group: 'C', seed, case: c.id, tile: w, before, after, d, result, err, btnOk: btn.ok, btnWhy: btn.why, flagNewDay, invDelta: (s.inventory || []).length - invBefore, salvaged, sayTail: cap.lines.slice(-2) });
    console.log(`C ${c.id} seed=${seed} tile=${w.type}@${w.x},${w.y} result=${result} day=${before.day}->${after.day} ticks=${before.dayTicks}->${after.dayTicks} kcal=${before.kcal}->${after.kcal} btn=${btn.ok} flagNewDay=${flagNewDay} invDelta=${(s.inventory || []).length - invBefore}`);
    if (c.id === 'C-500-flag') {
      check(btn.ok === true, `C-500-flag seed=${seed}: button must be ENABLED after fix, got ok=${btn.ok} why=${btn.why}`);
      check(result === true, `C-500-flag seed=${seed}: tap must succeed, got ${result} err=${err}`);
      check(d.dDay === 1 && after.dayTicks === 0, `C-500-flag seed=${seed}: must roll to new day ticks 0, got ${JSON.stringify(d)} afterTicks=${after.dayTicks}`);
      check(flagNewDay, `C-500-flag seed=${seed}: dive flag must stamp the NEW day`);
      check((s.inventory || []).length - invBefore === 1, `C-500-flag seed=${seed}: salvage must land in pack`);
    }
    if (c.id === 'C-500-noflag') {
      check(result === true && d.dDay === 1 && after.dayTicks === 0, `C-500-noflag seed=${seed}: boundary no-flag must still succeed new day, got result=${result} ${JSON.stringify(d)}`);
    }
    if (c.id === 'C-100-flag') {
      check(btn.ok === false, `C-100-flag seed=${seed}: button must stay DISABLED, got ok=${btn.ok}`);
      check(result === false || result === null, `C-100-flag seed=${seed}: tap must refuse, got ${result}`);
      check(d.dDay === 0 && d.dTicks === 0 && d.dKcal === 0, `C-100-flag seed=${seed}: refusal must be pre-payment 0/0/0, got ${JSON.stringify(d)}`);
    }
  }
}

async function groupPurity(seed) {
  // 10x button read at the boundary, flag set and unset: deltas must be 0.
  for (const flagSet of [true, false]) {
    const { Game, s } = await base(seed, ['water_breathing']);
    const w = findWaterTile(Game);
    if (!w) { console.log(`P seed=${seed} SKIPPED no water tile`); continue; }
    Game.map.px = w.x; Game.map.py = w.y;
    const key = w.x + ',' + w.y + ':' + s.day;
    s.diveDayTiles = flagSet ? { [key]: true } : {};
    setPos(Game, 500);
    const before = snap(Game);
    const reads = [];
    for (let i = 0; i < 10; i++) reads.push(availOf(Game, 'water_breathing', 'dive_deep'));
    const after = snap(Game);
    const d = delta(before, after);
    const stable = reads.every((r) => r.ok === reads[0].ok && r.why === reads[0].why);
    rows.push({ group: 'P-purity', seed, flagSet, d, stable, availOk: reads[0].ok });
    console.log(`P seed=${seed} flag=${flagSet} avail=${reads[0].ok} d=${JSON.stringify(d)} stable=${stable}`);
    check(d.dDay === 0 && d.dTicks === 0 && d.dKcal === 0, `P seed=${seed} flag=${flagSet}: button reads must be pure, got ${JSON.stringify(d)}`);
    check(stable, `P seed=${seed} flag=${flagSet}: button reads must be stable`);
    // Post-fix, the boundary (dayTicks 500) button is ENABLED whether or not
    // today is flagged: the tap lands tomorrow either way. (Pre-fix, flag-set
    // read false here — that was the bug, now fixed and proven by group C.)
  }
}

async function groupBReg(seed) {
  // Regression guard: prior arm's group B numbers, unchanged.
  const cases = [
    { id: 'B-508-flag', ticks: 508, flag: true },
    { id: 'B-509-flag', ticks: 509, flag: true },
    { id: 'B-508-noflag', ticks: 508, flag: false },
  ];
  for (const ab of [{ ability: 'war_cry', action: 'challenge', flag: 'challengeDay' },
                    { ability: 'intimidating_presence', action: 'end_it_before', flag: 'postureDay' }]) {
    for (const c of cases) {
      const { Game, s, v, partner } = await base(seed, [ab.ability]);
      setConvo(Game, v, partner, true);
      if (c.flag) s[ab.flag] = s.day; else { try { delete s[ab.flag]; } catch (e) {} }
      setPos(Game, c.ticks);
      const before = snap(Game);
      const btn = availOf(Game, ab.ability, ab.action);
      let result = null, err = null;
      try { result = Game.useAbility(ab.ability, ab.action, partner); } catch (e) { err = String(e && (e.stack || e.message)); }
      const after = snap(Game);
      const d = delta(before, after);
      rows.push({ group: 'B-reg', seed, case: c.id, ability: ab.ability, before, after, d, result, err, btnOk: btn.ok });
      console.log(`B ${c.id} seed=${seed} ${ab.ability}.${ab.action} result=${result} day=${before.day}->${after.day} ticks=${before.dayTicks}->${after.dayTicks} kcal=${before.kcal}->${after.kcal} btn=${btn.ok}`);
      if (c.id === 'B-508-flag') check(result !== true && d.dDay === 0 && d.dTicks === 0 && d.dKcal === 0, `B-508-flag seed=${seed} ${ab.ability}: must refuse pre-payment, got result=${result} ${JSON.stringify(d)}`);
      if (c.id === 'B-509-flag') check(result === true && d.dDay === 1 && after.dayTicks === 0, `B-509-flag seed=${seed} ${ab.ability}: boundary must succeed new day, got result=${result} ${JSON.stringify(d)}`);
      if (c.id === 'B-508-noflag') check(result === true && d.dDay === 0 && d.dTicks === 3, `B-508-noflag seed=${seed} ${ab.ability}: must succeed +3 ticks same day, got result=${result} ${JSON.stringify(d)}`);
    }
  }
}

(async () => {
  try {
    for (const seed of SEEDS) { await groupC(seed); await groupPurity(seed); }
    for (const seed of REG_SEEDS) await groupBReg(seed);
    console.log(failures.length ? `\nFAILURES (${failures.length}):\n- ${failures.join('\n- ')}` : '\nALL CHECKS PASS');
    process.exit(failures.length ? 1 : 0);
  } catch (e) {
    console.error('CRASH', e && (e.stack || e.message));
    process.exit(2);
  }
})();
