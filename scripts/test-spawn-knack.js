#!/usr/bin/env node
// test-spawn-knack.js — Steve 2026-10-11: spawn knack (mysterious first ability, pre-System).
// (a) spawn offers exactly 3 latent choices tied to lifeseed
// (b) choice fills slot 1 with no System chrome in copy
// (c) day-7 offer still fires and fills slot 2 honestly (never silently eaten)
// (d) villagers receive latent knacks
// (e) day-7 anomaly beat fires once
// (f) knack pool contains zero system_offer/vile/body_horror
// (g) ontology validator green
// Harness: full src/js list in index.html order (minus DOM-only), mulberry32
// seeded BEFORE eval. Set EXCLUDE_KNACK=1 to simulate the pre-knack base (RED).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const { execSync } = require('child_process');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL:', name, extra === undefined ? '' : extra); }
}

async function main() {
  Math.random = mulberry32(20261011);
  global.fetch = (f) => Promise.resolve({
    json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  });
  let order = execSync(`grep -o 'src/js/[^\\"]*\\.js' index.html | head -80`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
  if (process.env.EXCLUDE_KNACK === '1') order = order.filter(s => !/spawn-knack/.test(s));
  global.window = global;
  for (const f of order) { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { console.log('LOAD FAIL', f, e.message); process.exit(1); } }
  delete global.window;
  const Game = globalThis.Scattering.Game;
  const lines = [];
  Game.say = function (t) { lines.push(t); };
  Game.sysSay = function (t) { lines.push('[SYS]' + t); };
  Game.audioEvent = function () {};
  if (Game.drama === undefined) Game.drama = function () {};
  await Game.init();

  // ABILITY LANES (2026-10-14): the knack pool is Game.knackPool() — magic
  // latent knacks plus System abilities that merged a knack (alsoKnack:
  // night_eyes, iron_stomach <- iron_gut). Waywise/Still Hands/Storm-ear
  // became human skills (pathfinder/steady_hands/weather_read): 9 -> 6.
  const knackIds = () => Game.knackPool().map(a => a.id);

  function freshRun() {
    Game.genRoster('Columbus, Ohio');
    Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
    lines.length = 0;
    return Game.state.scholar;
  }

  // ---------- (f) pool purity ----------
  console.log('(f) knack pool purity');
  const knacks = Game.knackPool();
  ok(knacks.length >= 6, 'knack pool has 6+ entries', knacks.length);
  ok(knacks.every(k => k.pool === 'latent_knack' || k.alsoKnack), 'all knacks pool=latent_knack (or a merged System ability)');
  ok(knacks.every(k => k.lane === 'magic'), 'every knack is magic (no human skill)');
  ok(knacks.every(k => k.alsoKnack || k.unlock.type !== 'system_offer'), 'no pure knack is system_offer unlock');
  ok(knacks.every(k => k.tier !== 'vile' && k.tier !== 'body_horror'), 'no vile/body_horror tiers');
  ok(knacks.every(k => (k.modifiers || []).length > 0), 'every knack has a real modifier');
  ok(knacks.every(k => k.memory && k.memory.includes('{kin}')), 'every knack has a lifeseed memory');
  // Steve 2026-10-14: the knack is System-given, not innate — descriptions must
  // frame it as ARRIVING recently, never as "always had" / lifelong
  const innateRe = /always had|always been|born with|my whole life|lifelong|since I was/i;
  ok(knacks.every(k => !innateRe.test(k.knackDescription || k.description || '')), 'no "always had" in descriptions');
  ok(knacks.every(k => !innateRe.test(k.memory || '')), 'no "always had" in memories');

  // ---------- (a) spawn offers 3 lifeseed-tied choices ----------
  console.log('(a) spawn knack choices');
  const s = freshRun();
  const choices = s.knackChoices || [];
  ok(choices.length === 3, 'exactly 3 knack choices', choices.length);
  const kids = knackIds();
  ok(choices.every(c => kids.includes(c.id)), 'all choices are latent knacks', choices.map(c => c.id).join(','));
  const me = Game.vpOf(Game.villagerId) || {};
  const origins = Object.keys((me.lifeseed || {}).skillOrigins || {});
  const matched = choices.filter(c => {
    const def = knacks.find(k => k.id === c.id);
    return (def.knackOrigins || []).some(o => origins.includes(o));
  });
  ok(matched.length >= 1, 'at least 1 choice tied to lifeseed origins', origins.join(',') + ' -> ' + matched.map(c => c.id).join(','));
  ok(choices.every(c => c.memory && !c.memory.includes('{kin}') && !c.memory.includes('{place}')),
    'memories filled, no raw placeholders', choices.map(c => c.memory).join(' | ').slice(0, 120));
  ok(new Set(choices.map(c => c.id)).size === 3, '3 distinct choices');

  // ---------- (d) villagers get knacks ----------
  console.log('(d) villager knacks');
  const npcKnacks = (Game.state.village || {}).npcKnacks || {};
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  ok(roster.length > 0 && roster.every(id => kids.includes(npcKnacks[id])), 'every villager has a latent knack',
    roster.length + ' villagers, ' + Object.keys(npcKnacks).length + ' knacks');

  // ---------- (b) choice fills slot 1, no System chrome ----------
  console.log('(b) chooseKnack fills slot 1 quietly');
  lines.length = 0;
  const before = lines.length;
  Game.chooseKnack(choices[0].id);
  ok(s.abilities.length === 1, 'slot 1 filled', s.abilities.length);
  ok(s.abilities[0].latent === true, 'knack tagged latent');
  ok(s.knackChoices === null, 'knackChoices cleared');
  const said = lines.slice(before).join(' ');
  ok(!/SYSTEM|🎁|PICK A TRICK|the System/i.test(said), 'no System chrome in knack copy', said.slice(0, 160));
  ok(/💭/.test(said), 'quiet framing present');
  // knack modifier flows through the real pipeline
  const target = knacks.find(k => k.id === choices[0].id).modifiers[0].target;
  const mods = Game.allModifiers().filter(m => m.target === target);
  ok(mods.length > 0, 'knack modifier in pipeline', target);

  // ---------- (c) day-7 offer fires, waits honestly, fills slot 2 ----------
  console.log('(c) day-7 offer slot honesty');
  s.day = 7;
  lines.length = 0;
  Game.checkSystemArrival();
  ok(Game.state.systemArrived === true, 'system arrived');
  ok((s.abilityChoices || []).length === 3, 'day-7 offer fired with 3 choices', (s.abilityChoices || []).length);
  // slots: 1/1 (knack). The offer must NOT be silently eaten.
  const pickId = s.abilityChoices[0].id;
  lines.length = 0;
  const res = Game.chooseAbility(pickId);
  ok(res === null && s.abilities.length === 1, 'refused honestly while slots full');
  ok((s.abilityChoices || []).length === 3, 'offer NOT eaten — still pending');
  ok(/no free ability slots/i.test(lines.join(' ')), 'honest no-slots message');
  // integration 20 opens slot 2; the pending gift fills it.
  Game.integrate(20, 'test');
  ok(Game.abilitySlots() === 2, 'slot 2 opened at integration 20', Game.abilitySlots());
  Game.chooseAbility(pickId);
  ok(s.abilities.length === 2, 'day-7 gift fills slot 2', s.abilities.length);
  ok((s.abilityChoices || []).length === 0 || s.abilityChoices === null, 'offer cleared after honest take');

  // ---------- (e) day-7 anomaly beat fires once ----------
  console.log('(e) anomaly beat');
  const beats = Game.systemArrivalBeats();
  const knackBeats = beats.filter(b => b.id === 'knack');
  ok(knackBeats.length === 1, 'exactly one knack beat', knackBeats.length);
  const beatText = knackBeats[0].lines.map(l => l.text).join(' ');
  ok(/sent that ahead/i.test(beatText), 'beat claims the System sent it ahead');
  ok(/WELCOME/i.test(beatText), 'beat welcomes the early gift');
  ok(!/rounding error/i.test(beatText), 'no more "rounding error" fiction');
  ok(!/BEFORE we got here/.test(beatText), 'no more "always had" fiction');
  // the knack is GIVEN, not innate — the grant line says so
  ok(!/was always there/i.test(said), 'no "always there" in grant copy');
  // no knack, no beat
  s.abilities = [];
  const beats2 = Game.systemArrivalBeats();
  ok(beats2.filter(b => b.id === 'knack').length === 0, 'no beat without a latent knack');

  // ---------- (g) ontology ----------
  console.log('(g) ontology validator');
  try {
    execSync('node scripts/validate-ontology.js', { cwd: ROOT, stdio: 'pipe' });
    ok(true, 'ontology green');
  } catch (e) {
    ok(false, 'ontology green', (e.stdout || '').toString().slice(0, 300));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
