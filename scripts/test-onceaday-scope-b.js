#!/usr/bin/env node
// test-onceaday-scope-b.js — proof for sim-onceaday-scope-b (MEASUREMENT arm:
// zero src/js changes). Pins the once-a-day predictor's cost scope and the
// _actionAvailable target=null button state. See evidence/2026-10-28/
// sim-onceaday-scope-b-prereg.md (committed BEFORE any judged fixture ran).
//
// Predictor paths (function names; line numbers drift):
//   _onceADayPostPaymentDay — private; called ONLY by the war_cry.challenge
//     and intimidating_presence.end_it_before prechecks. Claims pure reads.
//   _actionAvailable — button state; hard-calls every precheck with
//     target=null; wrapped by foodPower.js's hunger gate (a kcal read).
//   activatableAbilities — the UI button list; target:'none' on every row.
//   useAbility — tap path; same precheck with the REAL tap target (the bar
//     passes none, so undefined in practice).
//   god/keepsake activatables — _actionAvailable with no precheck keys, so
//     the predictor never runs there.
//   _legacyActivatables — time_skip / echo_location 1/day buttons bypass
//     _actionAvailable entirely and read the pre-action day flag.
//
// Fixture groups (per seed):
//   A purity: 10x _actionAvailable + 3x activatableAbilities at dayTicks
//     508/509, flag set/unset — every delta must be 0, every button read
//     stable across repeats.
//   B tap contrast: the real payment numbers next to the predictor numbers
//     (challenge/end_it_before cost time_min 5 -> 3 ticks; success also
//     burns a 40 kcal tier per the prior arm).
//   C dive boundary: water_breathing.dive_deep costs time_min 30 -> 15
//     ticks and is once per tile per day, but its precheck reads the
//     PRE-payment day — the predictor's missed coverage. Boundary = 500
//     (500+15 >= 512 rolls the day). Pair: flag-set boundary (expect
//     precheck refuse) vs flag-unset boundary (expect success, new day).
//   D target=null matrix: _actionAvailable (forced null) for every
//     target-sensitive action, in states where a real-target tap would
//     succeed and where it would not. Button state recorded verbatim.
//   E legacy buttons: time_skip / echo_location via activatableAbilities,
//     flag set/unset; pure-read check by state comparison.
// Exit 0 on pass, 1 on any failure, 2 on crash. Mode "dump" writes rows
// JSON instead of asserting (same fixtures, no verdict).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = (process.env.SEEDS || '9981,9982')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);

async function base(seed, abilities) {
  const { Game } = await loadGame({ seed, mode: 'onceaday-scope-b', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  const v = Game.state.village || {};
  const abs = (s.abilities || []);
  for (const aid of abilities) if (!abs.some((a) => (a.id || a) === aid)) abs.push({ id: aid, level: 1 });
  s.abilities = abs;
  try { s.kcal = Math.max(s.kcal || 0, 5000); s.health = Math.max(s.health || 0, 100); } catch (e) {}
  const roster = v.roster || [];
  let partner = null;
  for (const vid of roster) {
    if (vid === Game.villagerId) continue;
    let person = null;
    try { person = Game.getPerson(vid); } catch (e) {}
    if (person && person.dead) continue;
    partner = vid; break;
  }
  if (!partner) throw new Error('no partner on roster seed=' + seed);
  return { Game, s, v, partner };
}

function snap(Game) {
  const s = Game.state.scholar;
  return { day: s.day, dayTicks: s.dayTicks, kcal: s.kcal };
}
function delta(a, b) { return { dDay: b.day - a.day, dTicks: b.dayTicks - a.dayTicks, dKcal: b.kcal - a.kcal }; }
function availOf(Game, ability, action) {
  try {
    const def = Game.abilityActionDef(ability, action);
    const a = Game._actionAvailable(ability, def.action);
    return { ok: !!a.ok, why: String(a.why || '') };
  } catch (e) { return { ok: null, why: 'avail-error:' + e.message }; }
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
function setPos(Game, ticks) {
  try { Game.state.scholar.dayTicks = ticks; Game.state.scholar.actionClock = 0; Game.dayPart = Math.floor(ticks / 128); } catch (e) {}
}
function setConvo(Game, v, partner, on) {
  v.conv = {};
  if (on) v.conv[partner] = { active: true };
}
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

const rows = [];
function rec(r) { rows.push(r); return r; }

async function groupA(seed) {
  for (const ab of [{ ability: 'war_cry', action: 'challenge', flag: 'challengeDay' },
                    { ability: 'intimidating_presence', action: 'end_it_before', flag: 'postureDay' }]) {
    for (const flagSet of [true, false]) {
      for (const ticks of [508, 509]) {
        const { Game, s, v, partner } = await base(seed, [ab.ability]);
        setConvo(Game, v, partner, true);
        if (flagSet) s[ab.flag] = s.day; else { try { delete s[ab.flag]; } catch (e) {} }
        setPos(Game, ticks);
        const before = snap(Game);
        const reads = [];
        for (let i = 0; i < 10; i++) reads.push(availOf(Game, ab.ability, ab.action));
        const mid = snap(Game);
        let listCount = null;
        for (let i = 0; i < 3; i++) { try { const l = Game.activatableAbilities() || []; listCount = l.length; } catch (e) { listCount = -1; } }
        const after = snap(Game);
        const stable = reads.every((r) => r.ok === reads[0].ok && r.why === reads[0].why);
        rec({ group: 'A-purity', seed, ability: ab.ability, action: ab.action, flagSet, ticks,
          before, mid, after, dAvail: delta(before, mid), dList: delta(mid, after),
          availOk: reads[0].ok, availWhy: reads[0].why, stable, listCount });
        console.log(`A seed=${seed} ${ab.ability}.${ab.action} flag=${flagSet ? 'set' : 'unset'} ticks=${ticks} avail=${reads[0].ok} dAvail=${JSON.stringify(delta(before, mid))} dList=${JSON.stringify(delta(mid, after))} stable=${stable}`);
      }
    }
  }
}

async function groupB(seed) {
  const cases = [
    { id: 'B-508-flag', ticks: 508, flag: true, expect: 'refuse' },
    { id: 'B-509-flag', ticks: 509, flag: true, expect: 'success-boundary' },
    { id: 'B-508-noflag', ticks: 508, flag: false, expect: 'success-nocross' },
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
      const cap = captureSay(Game);
      let result = null, err = null;
      try { result = Game.useAbility(ab.ability, ab.action, partner); } catch (e) { err = String(e && (e.stack || e.message)); }
      cap.restore();
      const after = snap(Game);
      rec({ group: 'B-tap', seed, case: c.id, ability: ab.ability, action: ab.action,
        before, after, d: delta(before, after), result, err, btnOk: btn.ok, btnWhy: btn.why,
        flagAfter: s[ab.flag], sayTail: cap.lines.slice(-2) });
      console.log(`B ${c.id} seed=${seed} ${ab.ability}.${ab.action} result=${result} day=${before.day}->${after.day} ticks=${before.dayTicks}->${after.dayTicks} kcal=${before.kcal}->${after.kcal} btn=${btn.ok}`);
    }
  }
}

async function groupC(seed) {
  const { Game: G0 } = await base(seed, ['water_breathing']);
  const wt = findWaterTile(G0);
  if (!wt) { rec({ group: 'C-dive', seed, skipped: 'no-water-tile' }); console.log(`C seed=${seed} SKIPPED no water tile`); return; }
  const cases = [
    { id: 'C-500-flag', ticks: 500, flag: true, expect: 'refuse-boundary' },
    { id: 'C-500-noflag', ticks: 500, flag: false, expect: 'success-boundary' },
    { id: 'C-100-flag', ticks: 100, flag: true, expect: 'refuse' },
  ];
  for (const c of cases) {
    const { Game, s, v } = await base(seed, ['water_breathing']);
    const w = findWaterTile(Game);
    Game.map.px = w.x; Game.map.py = w.y;
    const key = w.x + ',' + w.y + ':' + s.day;
    s.diveDayTiles = c.flag ? { [key]: true } : {};
    setPos(Game, c.ticks);
    const before = snap(Game);
    const btn = availOf(Game, 'water_breathing', 'dive_deep');
    const cap = captureSay(Game);
    let result = null, err = null;
    try { result = Game.useAbility('water_breathing', 'dive_deep'); } catch (e) { err = String(e && (e.stack || e.message)); }
    cap.restore();
    const after = snap(Game);
    rec({ group: 'C-dive', seed, case: c.id, tile: w, before, after, d: delta(before, after),
      result, err, btnOk: btn.ok, btnWhy: btn.why, sayTail: cap.lines.slice(-2) });
    console.log(`C ${c.id} seed=${seed} tile=${w.type}@${w.x},${w.y} result=${result} day=${before.day}->${after.day} ticks=${before.dayTicks}->${after.dayTicks} kcal=${before.kcal}->${after.kcal} btn=${btn.ok} why=${(btn.why || '').slice(0, 80)}`);
  }
}

async function groupD(seed) {
  // D1/D2: challenge + end_it_before, convo vs no-convo button, explicit tap.
  for (const ab of [{ ability: 'war_cry', action: 'challenge' },
                    { ability: 'intimidating_presence', action: 'end_it_before' }]) {
    for (const convo of [true, false]) {
      const { Game, s, v, partner } = await base(seed, [ab.ability]);
      setConvo(Game, v, partner, convo);
      setPos(Game, 100);
      const btn = availOf(Game, ab.ability, ab.action);
      rec({ group: 'D-targetnull', seed, ability: ab.ability, action: ab.action, convo,
        btnOk: btn.ok, btnWhy: btn.why });
      console.log(`D seed=${seed} ${ab.ability}.${ab.action} convo=${convo} btn=${btn.ok} why=${(btn.why || '').slice(0, 100)}`);
    }
    // Explicit-target tap with NO convo: the button-vs-tap contrast.
    const { Game, s, v, partner } = await base(seed, [ab.ability]);
    setConvo(Game, v, partner, false);
    setPos(Game, 100);
    const cap = captureSay(Game);
    let result = null, err = null;
    try { result = Game.useAbility(ab.ability, ab.action, partner); } catch (e) { err = String(e && (e.stack || e.message)); }
    cap.restore();
    rec({ group: 'D-targetnull', seed, ability: ab.ability, action: ab.action, convo: false,
      explicitTapResult: result, explicitTapErr: err, sayTail: cap.lines.slice(-2) });
    console.log(`D seed=${seed} ${ab.ability}.${ab.action} explicit-tap-no-convo result=${result} say=${(cap.lines.slice(-1)[0] || '').slice(0, 120)}`);
  }
  // D3: calm_beast — scaffolded fight (repo's own test pattern: direct
  // Game.tbfight assignment, as in test-abilities-break-20261010.js).
  // The precheck only reads tbfight.fighters via tbFighter, so this pins
  // the button half exactly; the tap half is attempted and reported raw.
  {
    const { Game, s, v, partner } = await base(seed, ['animal_ken']);
    const before = snap(Game);
    Game.tbfight = { id: 'scope-b-fight', over: false, round: 1,
      fighters: [
        { key: 'p', kind: 'player', name: 'You', hp: 100, maxHp: 100, alive: true, fled: false, acted: false, mx: 4, my: 4 },
        { key: 'h_x', kind: 'hostile', name: 'Hostile villager', hp: 80, maxHp: 80, alive: true, fled: false, mx: 5, my: 4 },
      ],
      order: ['p', 'h_x'], turnIdx: 0 };
    const btn = availOf(Game, 'animal_ken', 'calm_beast');
    const cap = captureSay(Game);
    let result = null, err = null;
    try { result = Game.useAbility('animal_ken', 'calm_beast', 'h_x'); } catch (e) { err = String(e && (e.stack || e.message)).slice(0, 500); }
    cap.restore();
    const after = snap(Game);
    try { Game.tbfight = null; } catch (e) {}
    rec({ group: 'D-targetnull', seed, ability: 'animal_ken', action: 'calm_beast',
      scaffoldFight: true, btnOk: btn.ok, btnWhy: btn.why, tapResult: result, tapErr: err,
      sayTail: cap.lines.slice(-3), before, after });
    console.log(`D seed=${seed} animal_ken.calm_beast scaffold btn=${btn.ok} why=${(btn.why || '').slice(0, 80)} tap=${result} err=${err ? 'YES' : 'no'}`);
  }
  // D4: mediator — conflicts list decides; target plays no role.
  for (const has of [false, true]) {
    const { Game, s, v } = await base(seed, ['mediator']);
    v.conflicts = has ? [{ resolved: false, known: true }] : [];
    const btn = availOf(Game, 'mediator', 'mediate_dispute');
    rec({ group: 'D-targetnull', seed, ability: 'mediator', action: 'mediate_dispute', hasDispute: has, btnOk: btn.ok, btnWhy: btn.why });
    console.log(`D seed=${seed} mediator.mediate_dispute has=${has} btn=${btn.ok} why=${(btn.why || '').slice(0, 80)}`);
  }
  // D5: field_dressing — pack carcass decides; target plays no role.
  for (const has of [false, true]) {
    const { Game, s } = await base(seed, ['field_dressing']);
    s.inventory = has ? [{ id: 'carcass-test', foodKind: 'meat', foodState: 'carcass' }] : [];
    const btn = availOf(Game, 'field_dressing', 'dress_game');
    rec({ group: 'D-targetnull', seed, ability: 'field_dressing', action: 'dress_game', hasCarcass: has, btnOk: btn.ok, btnWhy: btn.why });
    console.log(`D seed=${seed} field_dressing.dress_game has=${has} btn=${btn.ok} why=${(btn.why || '').slice(0, 80)}`);
  }
  // D6: target-independent daily gates.
  for (const ab of [{ ability: 'scream_cheese', action: 'scream', flag: 'screamDay' },
                    { ability: 'cheese_wheel', action: 'hurl', flag: '_cheeseWheelDay' },
                    { ability: 'green_thumb', action: 'ask', flag: '_askPlantsDay' }]) {
    for (const flagSet of [false, true]) {
      const { Game, s } = await base(seed, [ab.ability]);
      if (flagSet) s[ab.flag] = s.day; else { try { delete s[ab.flag]; } catch (e) {} }
      const btn = availOf(Game, ab.ability, ab.action);
      rec({ group: 'D-targetnull', seed, ability: ab.ability, action: ab.action, flagSet, btnOk: btn.ok, btnWhy: btn.why });
      console.log(`D seed=${seed} ${ab.ability}.${ab.action} flag=${flagSet} btn=${btn.ok} why=${(btn.why || '').slice(0, 80)}`);
    }
  }
  // D7: god/keepsake path — synthetic-action probe of _actionAvailable only
  // (no precheck keys exist for god/keepsake, so the predictor cannot run).
  {
    const { Game } = await base(seed, []);
    const btn = (() => { try { const a = Game._actionAvailable('god', { id: 'probe', cost: {} }); return { ok: !!a.ok, why: String(a.why || '') }; } catch (e) { return { ok: null, why: 'err:' + e.message }; } })();
    rec({ group: 'D-targetnull', seed, ability: 'god', action: '(synthetic probe)', btnOk: btn.ok, btnWhy: btn.why });
    console.log(`D seed=${seed} god.(synthetic probe) btn=${btn.ok} why=${(btn.why || '').slice(0, 80)}`);
  }
}

async function groupE(seed) {
  for (const ab of [{ ability: 'time_skip', flag: 'timeSkipDay' },
                    { ability: 'echo_location', flag: 'echoDay' }]) {
    for (const flagSet of [false, true]) {
      const { Game, s } = await base(seed, [ab.ability]);
      if (flagSet) s[ab.flag] = s.day; else { try { delete s[ab.flag]; } catch (e) {} }
      const before = snap(Game);
      let row = null;
      try { row = (Game.activatableAbilities() || []).find((r) => r.abilityId === ab.ability); } catch (e) { row = { error: String(e.message) }; }
      const after = snap(Game);
      rec({ group: 'E-legacy', seed, ability: ab.ability, flagSet,
        rowAvailable: row ? row.available : null, rowWhy: row ? String(row.why || '') : null,
        before, after, d: delta(before, after) });
      console.log(`E seed=${seed} ${ab.ability} flag=${flagSet} available=${row ? row.available : null} why=${row ? String(row.why || '').slice(0, 60) : null} d=${JSON.stringify(delta(before, after))}`);
    }
  }
}

(async () => {
  const mode = process.argv[2];
  for (const seed of SEEDS) {
    await groupA(seed);
    await groupB(seed);
    await groupC(seed);
    await groupD(seed);
    await groupE(seed);
  }
  if (mode === 'dump') {
    const out = process.argv[3];
    if (!out) { console.error('dump requires an outfile'); process.exit(2); }
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(rows, null, 2) + '\n');
    console.log('dumped ' + rows.length + ' rows to ' + out);
    return;
  }
  const failures = [];
  for (const r of rows) {
    if (r.group === 'A-purity') {
      if (r.dAvail.dDay !== 0 || r.dAvail.dTicks !== 0 || r.dAvail.dKcal !== 0)
        failures.push(`A seed=${r.seed} ${r.ability}.${r.action} flag=${r.flagSet} ticks=${r.ticks}: predictor reads moved state ${JSON.stringify(r.dAvail)}`);
      if (r.dList.dDay !== 0 || r.dList.dTicks !== 0 || r.dList.dKcal !== 0)
        failures.push(`A seed=${r.seed} ${r.ability}.${r.action} flag=${r.flagSet} ticks=${r.ticks}: button-list reads moved state ${JSON.stringify(r.dList)}`);
      if (!r.stable) failures.push(`A seed=${r.seed} ${r.ability}.${r.action}: button read unstable across repeats`);
    } else if (r.group === 'B-tap') {
      if (r.case === 'B-508-flag') {
        if (r.result !== false || r.d.dDay !== 0 || r.d.dTicks !== 0 || r.d.dKcal !== 0)
          failures.push(`B seed=${r.seed} ${r.ability}: 508-flag tap should refuse pre-payment, got result=${r.result} d=${JSON.stringify(r.d)}`);
        if (r.btnOk !== false) failures.push(`B seed=${r.seed} ${r.ability}: 508-flag button should be disabled`);
      } else if (r.case === 'B-509-flag') {
        if (r.result !== true || r.d.dDay !== 1)
          failures.push(`B seed=${r.seed} ${r.ability}: 509-flag tap should succeed on the new day, got result=${r.result} d=${JSON.stringify(r.d)}`);
        if (r.btnOk !== true) failures.push(`B seed=${r.seed} ${r.ability}: 509-flag button should be enabled`);
      } else if (r.case === 'B-508-noflag') {
        if (r.result !== true || r.d.dDay !== 0 || r.d.dTicks !== 3)
          failures.push(`B seed=${r.seed} ${r.ability}: 508-noflag tap should succeed +3 ticks same day, got result=${r.result} d=${JSON.stringify(r.d)}`);
      }
    } else if (r.group === 'C-dive') {
      if (r.skipped) continue;
      if (r.case === 'C-500-flag') {
        if (r.btnOk !== false) failures.push(`C seed=${r.seed}: boundary flag-set dive button should be disabled (pre-payment-day precheck)`);
        if (r.result !== false || r.d.dDay !== 0 || r.d.dTicks !== 0 || r.d.dKcal !== 0)
          failures.push(`C seed=${r.seed}: boundary flag-set dive tap should refuse pre-payment, got result=${r.result} d=${JSON.stringify(r.d)}`);
        if (!(r.btnWhy || '').includes('Already worked this water today'))
          failures.push(`C seed=${r.seed}: boundary dive button reason should be the dive sentence, got: ${(r.btnWhy || '').slice(0, 100)}`);
      } else if (r.case === 'C-500-noflag') {
        // Day roll RESETS dayTicks to 0 (500+15 rolls; remainder discarded —
        // same as challenge 509->0). Assert day+1 and ticks reset, not +15.
        if (r.result !== true || r.d.dDay !== 1 || r.after.dayTicks !== 0)
          failures.push(`C seed=${r.seed}: boundary no-flag dive tap should succeed new day ticks 0, got result=${r.result} d=${JSON.stringify(r.d)} afterTicks=${r.after.dayTicks}`);
      } else if (r.case === 'C-100-flag') {
        if (r.result !== false || r.d.dDay !== 0 || r.d.dTicks !== 0 || r.d.dKcal !== 0)
          failures.push(`C seed=${r.seed}: non-boundary flag-set dive tap should refuse pre-payment, got result=${r.result} d=${JSON.stringify(r.d)}`);
      }
    } else if (r.group === 'D-targetnull') {
      if ((r.ability === 'war_cry' || r.ability === 'intimidating_presence') && r.convo === true) {
        if (r.btnOk !== true) failures.push(`D seed=${r.seed} ${r.ability}: convo button should be enabled, got ${r.btnOk} (${(r.btnWhy || '').slice(0, 80)})`);
      }
      if ((r.ability === 'war_cry' || r.ability === 'intimidating_presence') && r.convo === false && r.btnWhy) {
        if (r.btnOk !== false) failures.push(`D seed=${r.seed} ${r.ability}: no-convo button should be disabled`);
      }
      if (r.ability === 'animal_ken') {
        if (r.btnOk !== false) failures.push(`D seed=${r.seed} calm_beast: null-target button should be disabled, got ${r.btnOk}`);
        if (!(r.btnWhy || '').includes('Nothing here to calm')) failures.push(`D seed=${r.seed} calm_beast: button reason should be 'Nothing here to calm', got: ${(r.btnWhy || '').slice(0, 100)}`);
      }
      if (r.ability === 'mediator') {
        if (r.hasDispute === false && r.btnOk !== false) failures.push(`D seed=${r.seed} mediator: no-dispute button should be disabled`);
        if (r.hasDispute === true && r.btnOk !== true) failures.push(`D seed=${r.seed} mediator: open-dispute button should be enabled`);
      }
      if (r.ability === 'field_dressing') {
        if (r.hasCarcass === false && r.btnOk !== false) failures.push(`D seed=${r.seed} field_dressing: no-carcass button should be disabled`);
        if (r.hasCarcass === true && r.btnOk !== true) failures.push(`D seed=${r.seed} field_dressing: carcass button should be enabled`);
      }
      if (r.ability === 'green_thumb') {
        if (r.flagSet === true && r.btnOk !== false) failures.push(`D seed=${r.seed} green_thumb: flag-set button should be disabled`);
        if (r.flagSet === false && r.btnOk !== true) failures.push(`D seed=${r.seed} green_thumb: flag-unset button should be enabled`);
      }
    } else if (r.group === 'E-legacy') {
      if (r.d.dDay !== 0 || r.d.dTicks !== 0 || r.d.dKcal !== 0)
        failures.push(`E seed=${r.seed} ${r.ability}: legacy button list moved state ${JSON.stringify(r.d)}`);
      if (r.rowAvailable == null) failures.push(`E seed=${r.seed} ${r.ability}: legacy row missing from button list`);
      else if (r.flagSet === true && r.rowAvailable !== false) failures.push(`E seed=${r.seed} ${r.ability}: flag-set legacy button should be disabled`);
      else if (r.flagSet === false && r.rowAvailable !== true) failures.push(`E seed=${r.seed} ${r.ability}: flag-unset legacy button should be enabled`);
    }
  }
  if (failures.length) {
    console.log('FAILURES (' + failures.length + '):');
    for (const f of failures) console.log('  - ' + f);
    process.exit(1);
  }
  console.log('PASS: all ' + rows.length + ' scope rows behave as pre-registered');
})().catch((e) => { console.error('TEST CRASH', e && (e.stack || e)); process.exit(2); });
