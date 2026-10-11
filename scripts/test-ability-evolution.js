#!/usr/bin/env node
// test-ability-evolution.js — Steve 2026-10-11: ability EVOLUTION at L3 mastery.
// (a) L3 mastery offers an evolution CHOICE (not auto-granted); deferral works.
// (b) Evolutions are qualitative AND impactful: every evolution has a verb
//     (qualitative) + modifiers on live targets (needle).
// (c) Synergy legs resolve after evolution (evolvedFrom lineage).
// (d) XP retune: focused abilities reach L3 within a 120-day run.
// (e) Human/alien lane separation holds.
// (f) Base ability needle audit: every ability has a real mechanic.
// Harness: full src/js list in index.html order (minus DOM-only), mulberry32
// seeded BEFORE eval.
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
  const order = execSync(`grep -o 'src/js/[^\\"]*\\.js' index.html | head -80`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
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

  function freshRun() {
    Game.genRoster('Columbus, Ohio');
    Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
    lines.length = 0;
    return Game.state.scholar;
  }

  // ---------- (b) evolution data: qualitative + impactful ----------
  console.log('(b) evolution data quality');
  const evos = Game.data.evolutions.evolutions;
  ok(evos.length === 26, '26 evolutions', evos.length);
  const fams = {};
  evos.forEach(e => { fams[e.family] = (fams[e.family] || 0) + 1; });
  ok(Object.keys(fams).length === 13 && Object.values(fams).every(n => n === 2),
    '13 families x 2 paths', JSON.stringify(fams));
  // Qualitative: every evolution has a verb (not just numbers).
  ok(evos.every(e => e.verb && e.verb.length > 20 && !/^\+\d/.test(e.verb)),
    'every evolution has a qualitative verb');
  // Impactful: every evolution has modifiers on live targets.
  const liveTargets = new Set();
  try {
    const out = execSync(`grep -rho "modTarget('[^']*'" src/js/ 2>/dev/null`, { cwd: ROOT }).toString();
    for (const m of out.matchAll(/modTarget\('([^']+)'/g)) liveTargets.add(m[1]);
    const modSrc = fs.readFileSync(path.join(ROOT, 'src/js/engine/modifiers.js'), 'utf8');
    for (const m of modSrc.matchAll(/target:\s*'([^']+)'/g)) liveTargets.add(m[1]);
    const fgSrc = fs.readFileSync(path.join(ROOT, 'src/js/engine/forage.js'), 'utf8');
    for (const m of fgSrc.matchAll(/resolve\([^,]+,\s*'([^']+)'/g)) liveTargets.add(m[1]);
  } catch (e) {}
  const deadEvo = [];
  evos.forEach(e => {
    (e.modifiers || []).forEach(m => { if (!liveTargets.has(m.target)) deadEvo.push(e.id + ':' + m.target); });
  });
  ok(deadEvo.length === 0, 'all evolution modifier targets live', deadEvo.join(', '));
  ok(evos.every(e => (e.modifiers || []).length > 0), 'every evolution has a mechanical needle');
  // Knowledge-gated: choiceText has no raw numbers/mechanics spoilers.
  ok(evos.every(e => !/\+\d+%|\bx\d\.?\d*\b/i.test(e.choiceText)), 'choiceText has no mechanics spoilers');

  // ---------- (e) lane separation ----------
  console.log('(e) lane separation');
  ok(evos.filter(e => e.lane === 'alien' || e.lane === 'alien-dark').every(e => /System|gift/i.test(e.flavor) || /System|gift/i.test(e.choiceText)),
    'alien evolutions reference the System/gift');
  ok(evos.filter(e => e.lane === 'human' || e.lane === 'human-deep').every(e => !/System.*gift|the System/i.test(e.flavor)),
    'human evolutions have no System voice');
  const knackEvos = evos.filter(e => e.family === 'latent_knack');
  ok(knackEvos.every(e => e.lane === 'human-deep'), 'knack evolutions are human-deep');

  // ---------- (a) L3 stages a choice, not auto-grant ----------
  console.log('(a) L3 evolution choice');
  const s = freshRun();
  // Grant tracker and drive to L3 via XP (thresholds 6/12).
  s.abilities.push({ id: 'tracker', name: 'Tracker', level: 1, xp: 0 });
  lines.length = 0;
  for (let i = 0; i < 20; i++) Game.gainAbilityXP('tracker', 2);
  const tr = s.abilities.find(a => a.id === 'tracker' || a.evolvedFrom === 'tracker');
  ok(tr && tr.level === 3, 'tracker reached L3', tr && `L${tr.level} xp${tr.xp}`);
  ok(Array.isArray(s.evolutionChoices) && s.evolutionChoices.length === 2,
    'evolution choice staged (2 options)', (s.evolutionChoices || []).length);
  ok(s.pendingEvolution === 'tracker', 'pendingEvolution set');
  ok(!s.abilities.some(a => a.evolution), 'nothing auto-granted');
  const said = lines.join(' ');
  ok(/STRAINING|become something/.test(said), 'evolution beat narrated');
  // Deferral.
  Game.chooseEvolution('defer');
  ok(s.evolutionDeferred === true && tr.level === 3 && !tr.evolution, 'deferral keeps L3 unevolved');
  // Choose.
  const evoId = s.evolutionChoices[0].id;
  lines.length = 0;
  Game.chooseEvolution(evoId);
  ok(tr.evolution && tr.evolvedFrom === 'tracker', 'evolution applied with lineage');
  ok(tr.id === evoId && tr.level === 3, 'evolved form is L3 capstone');
  ok(s.evolutionChoices === null && !s.pendingEvolution, 'choice cleared');
  ok(/🌀/.test(lines.join(' ')), 'evolution moment narrated');
  // Evolution modifiers flow through the pipeline.
  const evoDef = evos.find(e => e.id === evoId);
  const target = evoDef.modifiers[0].target;
  const hasEvoMod = Game.allModifiers().some(m => m.source === 'evolution:' + evoId && m.target === target);
  ok(hasEvoMod, 'evolution modifier in pipeline', target);
  // Root modifiers still apply (lineage).
  ok(Game.abilityLevel('tracker') >= 3, 'abilityLevel(tracker) resolves through lineage');

  // ---------- (c) synergy legs survive evolution ----------
  console.log('(c) synergy lineage');
  // apex_sense requires tracker + echo_location (check actual data).
  const syns = Game.data.synergies;
  const synList = Array.isArray(syns) ? syns : Object.values(syns);
  const withTracker = synList.find(sy => (sy.requires || []).includes('tracker'));
  if (withTracker) {
    s.synergies = s.synergies || [];
    if (!s.synergies.includes(withTracker.id)) s.synergies.push(withTracker.id);
    // Hold all legs at minLevel.
    for (const rid of (withTracker.requires || [])) {
      if (rid === 'tracker') continue; // evolved
      if (!s.abilities.some(a => (a.id || a) === rid)) s.abilities.push({ id: rid, name: rid, level: withTracker.minLevel || 1, xp: 0 });
    }
    Game.recomputeActiveSynergies();
    ok((s.activeSynergies || []).includes(withTracker.id),
      'synergy with evolved leg stays active', withTracker.id);
  } else {
    console.log('  (no tracker synergy in data — skipping leg check)');
    pass++;
  }

  // ---------- (d) XP retune: L3 reachable ----------
  console.log('(d) XP thresholds');
  // Thresholds are 6/12 (was 10/25). Simulate: 0.2 xp/day focused use -> L3 by ~day 90.
  // Direct assertion: total XP for L3 = 18.
  const s2 = freshRun();
  s2.abilities.push({ id: 'tracker', name: 'Tracker', level: 1, xp: 0 });
  let gains = 0;
  for (let i = 0; i < 9; i++) { Game.gainAbilityXP('tracker', 2); gains += 2; if (s2.abilities.find(a => (a.id || a) === 'tracker').level >= 3) break; }
  const tr2 = s2.abilities.find(a => (a.id || a) === 'tracker');
  ok(tr2.level >= 3 && gains <= 20, `L3 reachable at ${gains} total XP (was 35)`, `gains=${gains}`);

  // ---------- (f) base ability needles: no dead abilities ----------
  console.log('(f) base ability audit');
  const abs = Game.data.abilities;
  const abList = abs.abilities || abs;
  // eagle_eye retune: live target.
  const ee = abList.find(a => a.id === 'eagle_eye');
  ok(ee.modifiers[0].target === 'ruin.find_mult', 'eagle_eye retuned to live target');
  // Every ability has deepening text.
  ok(abList.every(a => a.deepening && a.deepening['2'] && a.deepening['3']),
    'all 94 have L2/L3 deepening', abList.filter(a => !(a.deepening && a.deepening['2'])).map(a => a.id).join(','));
  // abilityLevelBonus reads data.
  ok(Game.abilityLevelBonus('bloodhound', 3).includes('smell truth'), 'data-driven L2/L3');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
