// test-foodpower-20261014.js — Steve 2026-10-14: "Abilities should be stronger,
// and they were always meant to be powered by food."
// Proves (RED→GREEN):
// (a) every activatable ability has a kcal cost — data-declared wins, tier table fills gaps
// (b) useAbility deducts kcal and narrates the burn (no silent drains)
// (c) hunger gate: kcal < 500 refuses, deducts nothing, says "eat first"
// (d) overcharge: kcal >= 75% cap → abilityPowerMult 1.25; feasted takes max, never stacks
// (e) village tiers gate villager casts: starving=none, tight=only outmatched, abundant=bonus cast
// (f) ability buttons show kcal cost + overcharge before use
// Set EXCLUDE_FOOTPOWER=1 to simulate the pre-foodpower base (RED).
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
  Math.random = mulberry32(20261014);
  global.fetch = (f) => Promise.resolve({
    json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  });
  let order = execSync(`grep -o 'src/js/[^\\"]*\\.js' index.html | head -80`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
  if (process.env.EXCLUDE_FOOTPOWER === '1') order = order.filter(s => !/foodPower/.test(s));
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
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  const s = Game.state.scholar;
  const grant = (id) => { s.abilities.push({ id, name: id, desc: id, level: 1, xp: 0 }); };

  const FP = process.env.EXCLUDE_FOOTPOWER === '1';
  console.log(FP ? '(RED mode: foodPower.js excluded)' : '(GREEN mode)');

  // ---------- (a) costs ----------
  console.log('(a) ability kcal costs');
  ok(typeof Game.abilityKcalCost === 'function', 'abilityKcalCost exists');
  if (!FP) {
    ok(Game.abilityKcalCost('scream_cheese', 'scream') === 20, 'data-declared cost wins', Game.abilityKcalCost('scream_cheese', 'scream'));
    ok(Game.abilityKcalCost('game_sense', 'read_sign') === 40, 'tier default fills gap (tier None → 40)', Game.abilityKcalCost('game_sense', 'read_sign'));
    ok(Game.abilityKcalCost('pocket_sand', 'throw_sand') === 40, 'wacky tier → 40', Game.abilityKcalCost('pocket_sand', 'throw_sand'));
    ok(Game.abilityKcalCost('fear_aura', 'loom') === 120, 'vile tier → 120', Game.abilityKcalCost('fear_aura', 'loom'));
  }

  // ---------- (b) burn + narration ----------
  console.log('(b) useAbility burns kcal, narrates');
  grant('game_sense');
  s.kcal = 2000;
  lines.length = 0;
  const before = s.kcal;
  const r = Game.useAbility('game_sense', 'read_sign');
  if (!FP) {
    ok(r !== false, 'read_sign fired');
    ok(s.kcal === before - 40, 'kcal deducted (2000 → 1960)', s.kcal);
    ok(lines.some(l => /−40 kcal/.test(l)), 'burn narrated', lines.slice(-2).join(' | '));
  }

  // ---------- (c) hunger gate ----------
  console.log('(c) hunger gate');
  s.kcal = 400;
  lines.length = 0;
  const r2 = Game.useAbility('game_sense', 'read_sign');
  if (!FP) {
    ok(r2 === false, 'refused below 500 kcal');
    ok(s.kcal === 400, 'nothing deducted on refusal', s.kcal);
    ok(lines.some(l => /Eat first/i.test(l)), 'says eat first', lines.join(' | ').slice(0, 120));
    const av = Game._actionAvailable('game_sense', { id: 'read_sign', cost: {} });
    ok(!av.ok && /eat first/i.test(av.why), 'button shows eat-first', av.why);
  }

  // ---------- (d) overcharge ----------
  console.log('(d) overcharge');
  if (!FP) {
    const cap = Game.kcalCap();
    s.kcal = Math.ceil(cap * 0.8);
    ok(Game.overcharged() === true, 'topped up → overcharged', s.kcal + '/' + cap);
    ok(Game.abilityPowerMult() === 1.25, 'mult 1.25', Game.abilityPowerMult());
    ok(/OVERCHARGED/.test(Game.overchargeLine()), 'overcharge label', Game.overchargeLine().slice(0, 40));
    s.kcal = Math.floor(cap * 0.5);
    ok(Game.overcharged() === false, 'half bank → not overcharged');
    ok(Game.abilityPowerMult() === 1, 'mult 1 when not topped up');
    ok(Game.overchargeLine() === '', 'no label when not topped up');
    // feasted takes max, never stacks
    s.kcal = Math.ceil(cap * 0.8);
    s.feastBuff = { mult: 1.5, untilDay: (s.day || 0) + 2, untilPart: 0 };
    Game.dayPart = 0;
    ok(Game.abilityPowerMult() === 1.5, 'feasted 1.5 beats overcharge 1.25 (max, no stack)', Game.abilityPowerMult());
    delete s.feastBuff;
  }

  // ---------- (e) village tiers ----------
  console.log('(e) village food tiers gate villager casts');
  if (!FP) {
    const v = Game.state.village;
    v.burnHistory = [];
    // abundant: 10 days of food
    const need = Game.villageDailyNeed();
    v.pantry = [{ kcalEach: need * 10, units: 1 }];
    ok(Game.villageFoodTier() === 'abundant', 'abundant tier', Game.villageFoodDays().toFixed(1) + 'd');
    // starving: bare pantry
    v.pantry = [];
    ok(Game.villageFoodTier() === 'starving', 'starving tier', Game.villageFoodDays().toFixed(1) + 'd');
    // tight: 2 days
    v.pantry = [{ kcalEach: need * 2, units: 1 }];
    ok(Game.villageFoodTier() === 'tight', 'tight tier');
    // secure: 5 days
    v.pantry = [{ kcalEach: need * 5, units: 1 }];
    ok(Game.villageFoodTier() === 'secure', 'secure tier');

    // villager cast gating: mock a fight with one monster, villager with pocket_sand
    v.pantry = [];
    const vid = (v.roster || [])[1] || (v.roster || [])[0];
    Game.tbfight = { id: 'testfight', round: 1, fighters: [
      { kind: 'monster', alive: true, fled: false, mx: 4, my: 4, hp: 50 },
    ]};
    const mockV = { villagerId: vid, name: 'TestVillager', mx: 4, my: 5, maxHp: 100, alive: true };
    Game.npcHasAbility = () => true;
    const castStarving = Game.tbVillagerAbility(mockV);
    ok(castStarving === false, 'starving village: no casts');
    // abundant: first cast allowed, then bonus cast (mock grants all 4 abilities:
    // scream 1/day + sand 1/fight + rage 1/fight = 3 normal, loom's trigger fails w/ 1 monster)
    v.pantry = [{ kcalEach: need * 10, units: 1 }];
    const mv2 = { villagerId: vid, name: 'TestVillager', mx: 4, my: 5, maxHp: 100, alive: true };
    let casts = 0;
    for (let i = 0; i < 8; i++) { if (Game.tbVillagerAbility(mv2)) casts++; else break; }
    ok(casts === 4, 'abundant: 3 normal casts + 1 bonus cast per fight', casts + ' casts');
    Game.tbfight = null;
    delete Game.npcHasAbility;
  }

  // ---------- (f) buttons show costs ----------
  console.log('(f) ability buttons show costs + overcharge');
  if (!FP) {
    const cap = Game.kcalCap();
    s.kcal = Math.ceil(cap * 0.8);
    const acts = Game.activatableAbilities().filter(a => a.abilityId === 'game_sense');
    ok(acts.length > 0, 'game_sense listed');
    ok(acts.every(a => /kcal/.test(a.desc || '')), 'kcal cost visible on button', (acts[0] && acts[0].desc || '').slice(0, 80));
    ok(acts.every(a => /OVERCHARGED/.test(a.desc || '')), 'overcharge visible on button');
    s.kcal = Math.floor(cap * 0.5);
    const acts2 = Game.activatableAbilities().filter(a => a.abilityId === 'game_sense');
    ok(acts2.every(a => !/OVERCHARGED/.test(a.desc || '')), 'no overcharge label when not topped up');
  }

  // ---------- (g) ontology ----------
  console.log('(g) ontology validator');
  if (!FP) {
    try {
      execSync('node scripts/validate-ontology.js', { cwd: ROOT, stdio: 'pipe' });
      ok(true, 'ontology green');
    } catch (e) {
      ok(false, 'ontology green', [e.message, e.stdout, e.stderr].filter(Boolean).map(x => String(x)).join('\n').slice(-3000));
    }
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
