#!/usr/bin/env node
// test-barwhy-b.js — proof for sim-barwhy-b: the action bar shows the why
// reason on disabled buttons, and enabled buttons carry no stale why.
//
// Legs (see evidence/2026-10-28/sim-barwhy-b-prereg.md):
//   (a) every DISABLED row's rendered bar HTML carries its why verbatim.
//   (b) every ENABLED row has why null/empty and its rendered HTML has no why.
//   (c) availability parity vs a before snapshot (dump mode, same seeds/setup).
//   (d) pilot band is separate (sweep-compare, competent, 100d) — not here.
// Bar-render proof: app.js is DOM-only and excluded from the node harness,
// so this script evaluates the REAL abilityBarHTML function source extracted
// from src/js/app.js against stubbed Game/esc — no re-typed template.
// Modes: dump <outfile>  |  assert <before-json>
// Exit 0 pass, 1 failure, 2 crash. Seeds 9981+9982 (prior arm's seeds).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = (process.env.SEEDS || '9981,9982')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const LEGACY = ['time_skip', 'echo_location', 'blood_magic', 'field_medicine',
  'herbal_remedy', 'purify', 'compost_king', 'cannibal_frenzy'];
const DATA_IDS = ['war_cry.challenge', 'intimidating_presence.end_it_before',
  'animal_ken.calm_beast', 'mediator.mediate_dispute',
  'field_dressing.dress_game', 'green_thumb.ask',
  'scream_cheese.scream', 'cheese_wheel.hurl'];

async function base(seed, abilities) {
  const { Game } = await loadGame({ seed, mode: 'barwhy-b', fullTelemetry: false });
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
function setPos(Game, ticks) {
  try { Game.state.scholar.dayTicks = ticks; Game.state.scholar.actionClock = 0; Game.dayPart = Math.floor(ticks / 128); } catch (e) {}
}
function setConvo(Game, v, partner, on) {
  v.conv = {};
  if (on) v.conv[partner] = { active: true };
}
function rowsOf(Game, ids) {
  const list = Game.activatableAbilities() || [];
  const out = {};
  for (const r of list) if (ids.includes(r.id)) out[r.id] = { available: !!r.available, why: (r.why == null ? null : String(r.why)) };
  return out;
}

// ---- bar render: real abilityBarHTML source, stubbed Game/esc ----
function renderBar(rows, inCombat) {
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'app.js'), 'utf8');
  const start = src.indexOf('function abilityBarHTML()');
  const end = src.indexOf('function wireAbilityBar()', start);
  if (start < 0 || end < 0) throw new Error('abilityBarHTML not found in app.js');
  const fnSrc = src.slice(start, end);
  const esc = (s) => String(s).replace(/</g, '&lt;');
  const Game = {
    tbfight: inCombat ? {} : null,
    data: { abilities: [] },
    activatableAbilities: () => rows.map((r) => ({
      id: r.id, name: r.name || r.id, desc: r.desc || '', available: r.available,
      why: r.why == null ? null : r.why, combat: !!r.combat, choiceAvailable: false,
    })),
  };
  const fn = new Function('Game', 'esc', fnSrc + '\nreturn abilityBarHTML();');
  return fn(Game, esc);
}
function buttonSegment(html, id) {
  const marker = 'data-ab="' + id + '"';
  const i = html.indexOf(marker);
  if (i < 0) return null;
  const j = html.indexOf('</button>', i);
  return j < 0 ? null : html.slice(i, j);
}
const escWhy = (w) => String(w).replace(/</g, '&lt;');

async function collect(seed) {
  const scenarios = [];
  // L1: legacy, everything live (flags unset, healthy-ish, no sickness).
  {
    const { Game, s, v } = await base(seed, LEGACY);
    setPos(Game, 100);
    s.diseases = []; s.poisons = []; s.inventory = [];
    try { delete s.timeSkipDay; delete s.echoDay; delete s.herbalDay; delete s.purifyDay; } catch (e) {}
    s.health = 80;
    scenarios.push({ scenario: 'L1-live', rows: rowsOf(Game, LEGACY) });
  }
  // L2: legacy, everything spent (flags set, caps hit, food present).
  {
    const { Game, s, v } = await base(seed, LEGACY);
    setPos(Game, 100);
    s.timeSkipDay = s.day; s.echoDay = s.day;
    s.bloodPriceDayPart = s.day + '-' + Game.dayPart; s.bloodPriceUses = 2;
    s.fieldMedDayPart = s.day + '-' + Game.dayPart;
    s.diseases = [{ id: 'test-sick' }]; s.herbalDay = s.day;
    s.poisons = [{ id: 'test-poison' }]; s.purifyDay = s.day;
    s.inventory = [{ id: 'test-food', kcalEach: 100 }];
    s.health = 100;
    scenarios.push({ scenario: 'L2-spent', rows: rowsOf(Game, LEGACY) });
  }
  // L3: sick/poisoned but unused, full health (herbal+purify live, medicine full).
  {
    const { Game, s, v } = await base(seed, LEGACY);
    setPos(Game, 100);
    s.diseases = [{ id: 'test-sick' }]; s.poisons = [{ id: 'test-poison' }];
    try { delete s.herbalDay; delete s.purifyDay; delete s.fieldMedDayPart; } catch (e) {}
    s.inventory = []; s.health = 100;
    scenarios.push({ scenario: 'L3-sick-live', rows: rowsOf(Game, LEGACY) });
  }
  // L4: blood wound + low HP (two more disabled blood reasons).
  {
    const { Game, s, v } = await base(seed, LEGACY);
    setPos(Game, 100);
    s.bloodPriceWound = 50; s.health = 5;
    scenarios.push({ scenario: 'L4-blood-blocked', rows: rowsOf(Game, LEGACY) });
  }
  // D1: convo on, no dispute, empty pack, ask unused.
  {
    const { Game, s, v, partner } = await base(seed,
      ['war_cry', 'intimidating_presence', 'animal_ken', 'mediator', 'field_dressing', 'green_thumb']);
    setPos(Game, 100);
    setConvo(Game, v, partner, true);
    v.conflicts = []; s.inventory = [];
    try { delete s._askPlantsDay; } catch (e) {}
    scenarios.push({ scenario: 'D1-convo', rows: rowsOf(Game, DATA_IDS) });
  }
  // D2: no convo, open dispute, carcass in pack, ask used.
  {
    const { Game, s, v, partner } = await base(seed,
      ['war_cry', 'intimidating_presence', 'animal_ken', 'mediator', 'field_dressing', 'green_thumb']);
    setPos(Game, 100);
    setConvo(Game, v, partner, false);
    v.conflicts = [{ resolved: false, known: true }];
    s.inventory = [{ id: 'carcass-test', foodKind: 'meat', foodState: 'carcass' }];
    s._askPlantsDay = s.day;
    scenarios.push({ scenario: 'D2-noconvo', rows: rowsOf(Game, DATA_IDS) });
  }
  // C1: scaffolded fight — combat rows incl. calm_beast (still disabled by design).
  {
    const { Game, s, v } = await base(seed, ['animal_ken', 'scream_cheese', 'cheese_wheel']);
    setPos(Game, 100);
    Game.tbfight = { id: 'barwhy-fight', over: false, round: 1,
      fighters: [
        { key: 'p', kind: 'player', name: 'You', hp: 100, maxHp: 100, alive: true, fled: false, acted: false, mx: 4, my: 4 },
        { key: 'h_x', kind: 'hostile', name: 'Hostile villager', hp: 80, maxHp: 80, alive: true, fled: false, mx: 5, my: 4 },
      ],
      order: ['p', 'h_x'], turnIdx: 0 };
    let rows = {};
    try { rows = rowsOf(Game, DATA_IDS); } finally { try { Game.tbfight = null; } catch (e) {} }
    scenarios.push({ scenario: 'C1-combat', rows, inCombat: true });
  }
  return scenarios;
}

(async () => {
  const mode = process.argv[2];
  const all = [];
  for (const seed of SEEDS) {
    const scs = await collect(seed);
    for (const sc of scs) {
      for (const id of Object.keys(sc.rows)) {
        const r = sc.rows[id];
        all.push({ seed, scenario: sc.scenario, id, available: r.available, why: r.why, inCombat: !!sc.inCombat });
        console.log(`${sc.scenario} seed=${seed} ${id} available=${r.available} why=${r.why === null ? '(null)' : JSON.stringify(r.why)}`);
      }
      // Render check per scenario (bar rows need desc/combat flags for the template).
      const barRows = Object.keys(sc.rows).map((id) => ({
        id, name: id, desc: 'effect text', available: sc.rows[id].available,
        why: sc.rows[id].why, combat: sc.inCombat || false,
      }));
      let html = '';
      try { html = renderBar(barRows, !!sc.inCombat); } catch (e) { console.log(`RENDER-ERROR ${sc.scenario} seed=${seed}: ${e.message}`); }
      for (const id of Object.keys(sc.rows)) {
        const seg = html ? buttonSegment(html, id) : null;
        const r = sc.rows[id];
        if (!seg) { console.log(`RENDER ${sc.scenario} seed=${seed} ${id}: NO SEGMENT`); continue; }
        if (!r.available) console.log(`RENDER ${sc.scenario} seed=${seed} ${id}: disabled segHasWhy=${r.why ? seg.includes(escWhy(r.why)) : false} segHasDisabled=${seg.includes('disabled')}`);
        else console.log(`RENDER ${sc.scenario} seed=${seed} ${id}: enabled segHasWhySpan=${seg.includes('ctx-why')} segHasDisabled=${seg.includes('disabled')}`);
      }
    }
  }
  if (mode === 'dump') {
    const out = process.argv[3];
    if (!out) { console.error('dump requires an outfile'); process.exit(2); }
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(all, null, 2) + '\n');
    console.log('dumped ' + all.length + ' rows to ' + out);
    return;
  }
  if (mode !== 'assert') { console.error('usage: test-barwhy-b.js dump <out> | assert <before-json>'); process.exit(2); }
  const beforePath = process.argv[3];
  if (!beforePath) { console.error('assert requires a before-json'); process.exit(2); }
  const before = JSON.parse(fs.readFileSync(beforePath, 'utf8'));
  const bkey = (r) => r.seed + '|' + r.scenario + '|' + r.id;
  const bmap = new Map(before.map((r) => [bkey(r), r]));
  const failures = [];
  // Render checks need the HTML again: recompute from `all` grouped by scenario.
  const grouped = new Map();
  for (const r of all) {
    const k = r.seed + '|' + r.scenario;
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k).push(r);
  }
  for (const [k, rs] of grouped) {
    const inCombat = rs[0].inCombat;
    const barRows = rs.map((r) => ({ id: r.id, name: r.id, desc: 'effect text', available: r.available, why: r.why, combat: !!inCombat }));
    let html = '';
    try { html = renderBar(barRows, !!inCombat); } catch (e) { failures.push(`${k}: render failed: ${e.message}`); continue; }
    for (const r of rs) {
      const seg = buttonSegment(html, r.id);
      if (!seg) { failures.push(`${k} ${r.id}: no button segment in rendered bar`); continue; }
      if (!r.available) {
        if (!r.why) failures.push(`${k} ${r.id}: DISABLED but why is empty`);
        else if (!seg.includes(escWhy(r.why))) failures.push(`${k} ${r.id}: DISABLED but rendered bar lacks why ${JSON.stringify(r.why)}`);
        if (!seg.includes('disabled')) failures.push(`${k} ${r.id}: DISABLED but button lacks disabled attr`);
      } else {
        if (r.why) failures.push(`${k} ${r.id}: ENABLED but why=${JSON.stringify(r.why)} (stale)`);
        if (seg.includes('ctx-why')) failures.push(`${k} ${r.id}: ENABLED but rendered bar carries a why span`);
        if (seg.includes('disabled')) failures.push(`${k} ${r.id}: ENABLED but button has disabled attr`);
      }
      // (c) availability parity vs before.
      const b = bmap.get(bkey(r));
      if (!b) failures.push(`${k} ${r.id}: no before row (row appeared/disappeared)`);
      else if (b.available !== r.available) failures.push(`${k} ${r.id}: AVAILABILITY CHANGED before=${b.available} after=${r.available}`);
    }
  }
  // Rows present before but missing now also break parity.
  for (const b of before) {
    if (!all.some((r) => bkey(r) === bkey(b))) failures.push(`${b.seed}|${b.scenario} ${b.id}: before row missing after`);
  }
  if (failures.length) {
    console.log('\nFAILURES (' + failures.length + '):');
    for (const f of failures) console.log('  FAIL ' + f);
    process.exit(1);
  }
  console.log('\nPASS: ' + all.length + ' rows — disabled carry visible why, enabled carry none, availability parity holds.');
})().catch((e) => { console.error('CRASH: ' + (e && (e.stack || e.message))); process.exit(2); });
