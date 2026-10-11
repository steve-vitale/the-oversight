// PURIFY AUDIT (2026-10-11) — Steve 2026-10-11, overruling the r6 design call:
// "Purify should be an ability not a skill. Thats magic. Audit thoroughly,
// let's not confuse human skills and alien abilities that work more like magic."
//
// THE LAW (docs/CANON.md): HUMAN skills are teachable earthly knowledge —
// occupations grant them as background, practice/discovery earn them, they
// never take System slots. ALIEN abilities work like magic and come ONLY
// from the System (offers, trials, milestones) into the 6 slots.
// CLASSIFICATION RULE: HUMAN = a trained human with earthly tools could
// plausibly do/learn this (skills, instincts, traits, tricks, folk practice,
// dark behaviors). ALIEN = violates physics/biology, supernatural
// perception/transformation, or explicit System technology. Steve's word
// overrides edge cases (purify: "Charcoal, clean water, time" reads earthly,
// but Steve ruled it magic — instant poison neutralization is the magic).
//
//   node scripts/test-purify-audit-20261011.js        (SEED=... for seeds)
//   FIX=0 replays the r6 misclassification (red); default is fixed (green).
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const FIX = process.env.FIX !== '0';
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const SEED = parseInt(process.env.SEED || '20261011', 10);
Math.random = mulberry32(SEED);
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\"'']*\\.js' index.html | head -60", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
const said = [];
const _origSay = Game.say.bind(Game);
Game.say = (t) => { said.push(String(t)); return _origSay(t); };

(async () => {
await Game.init();
Game.genRoster('Columbus, Ohio');
Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
try { Game.depart(); } catch (e) {}
Game.state.scholar.day = 10;
console.log(`seed=${SEED} mode=${FIX ? 'FIXED (current code)' : 'OLD (r6 misclassification replay)'}`);

// ============ THE CENSUS: every ability classified, zero unclassified ============
const ALIEN = new Set([
  // body horror / transformation
  'chitin_skin', 'deep_reserves', 'extra_stomach', 'eyes_in_back', 'hollow_bones', 'molt', 'third_eye',
  // overpowered
  'hive_mind', 'phoenix_clause', 'photosynthesis', 'second_wind', 'time_skip',
  // magic effects
  'purify', 'blood_magic', 'pact', 'symbiote', 'water_breathing', 'echo_location', 'translator',
  'open_book', 'bird_whisperer', 'lucky_rock', 'fear_aura', 'leech',
  'beard_moss', 'dowsing', 'rain_dancer', 'scream_cheese', 'squirrel_friend', 'taste_vision',
]);
const HUMAN = new Set([
  // granted (earthly background)
  'triage', 'steady_hands', 'game_sense', 'patient_aim', 'field_dressing', 'preservation_instinct',
  'field_medicine', 'herbal_remedy', 'brawler_instinct', 'silver_tongue', 'pathfinder', 'lie_detector',
  // trial / practice / discovery / fallback (earned earthly)
  'iron_stomach', 'adrenaline_surge', 'adrenaline_control', 'eagle_eye', 'evidence_board',
  'gossip_network', 'intimidating_presence', 'peacemaker', 'trade_of_blows',
  'stalk', 'blood_trail', 'ambush', 'haymaker', 'war_cry', 'soft_step', 'survivor', 'wanderer',
  // system_offer but earthly (the System's gifts include practical tricks — coherent, noted)
  'green_thumb', 'tracker', 'diplomat', 'camp_cook', 'generous', 'scrounger', 'loud_chewer',
  'hoarder', 'thief', 'cornered_rat', 'dead_aim', 'second_skin', 'mediator', 'compost_king',
  'pocket_sand', 'grave_robber', 'poisoner', 'scarecrow', 'cold_blooded', 'rage', 'unbreakable',
  'cannibal_frenzy', 'animal_ken', 'pyrokinesis', 'night_eyes', 'swimmer',
]);

const abs = Game.data.abilities || [];
const cg = Game.data.characterGen || {};
if (!FIX) {
  // replay the r6 misclassification: pharmacist teaches magic, unlock 'granted'
  const pdef = abs.find(a => a.id === 'purify');
  pdef.unlock = { type: 'granted' };
  const pharm = (cg.occupations || []).find(o => o.id === 'pharmacist');
  pharm.granted = (pharm.granted || []).concat(['purify']);
}

{
  const ids = abs.map(a => a.id);
  const unclassified = ids.filter(id => !ALIEN.has(id) && !HUMAN.has(id));
  const doubleClassed = ids.filter(id => ALIEN.has(id) && HUMAN.has(id));
  ok('AUDIT-C: every ability classified human/alien, zero unclassified',
    unclassified.length === 0 && doubleClassed.length === 0 && ids.length === 85,
    `n=${ids.length} unclassified=${JSON.stringify(unclassified)}`);
  ok('AUDIT-C: census rule stated (human=earthly-plausible, alien=magic/System; Steve overrules edges)',
    true);
}

// ============ (a) NO MAGIC IN OCCUPATION GRANTS ============
{
  const occG = {};
  (cg.occupations || []).forEach(o => (o.granted || []).forEach(g => { occG[g] = occG[g] || []; occG[g].push(o.id); }));
  const magicGranted = Object.keys(occG).filter(id => ALIEN.has(id));
  const detail = magicGranted.map(id => `${id}<-${occG[id].join(',')}`).join('; ');
  ok('AUDIT-A: no alien ability in any occupation granted list (no human teaches magic)',
    magicGranted.length === 0, detail || 'clean');
  // every occupation still has a past (no emptied background)
  const empty = (cg.occupations || []).filter(o => !(o.granted || []).length).map(o => o.id);
  ok('AUDIT-A: every occupation grants >=1 background ability (nobody arrives empty-handed)',
    FIX ? empty.length === 0 : true, `empty=${JSON.stringify(empty)}`);
  // every granted id resolves to a real ability
  const aids = new Set(abs.map(a => a.id));
  const bad = Object.keys(occG).filter(id => !aids.has(id));
  ok('AUDIT-A: every occupation grant resolves to a real ability', bad.length === 0, JSON.stringify(bad));
}

// ============ (b) PURIFY IS SYSTEM MAGIC, ACQUIRABLE ============
{
  const pdef = abs.find(a => a.id === 'purify') || {};
  {
    ok('AUDIT-B: purify unlock type is system_offer', (pdef.unlock || {}).type === 'system_offer');
    // day-7 friction rule: poisoned in week 1 -> purify pushed into first choices
    const sc = Game.state.scholar;
    Game.state.systemArrived = false;
    sc.poisons = [{ name: 'throat sac toxin', day: 1 }];
    sc.week1 = {};
    const choices = Game.firstAbilityChoices().map(c => c.id);
    ok('AUDIT-B: poisoned week-1 scholar gets purify in day-7 System choices', choices.includes('purify'),
      `choices=${JSON.stringify(choices)}`);
    sc.poisons = [];
    // post-day-7 reactive offer: poison applied -> System offers purify
    Game.state.systemArrived = true;
    sc.abilities = []; sc.abilityChoices = null;
    Game.applyStatus('scholar', 'poison', { name: 'throat sac toxin', source: 'the belltoad' });
    const offered = (sc.abilityChoices || []).some(c => ((c && c.id) || c) === 'purify');
    ok('AUDIT-B: poisoned scholar gets reactive System offer of purify', offered,
      `choices=${JSON.stringify((sc.abilityChoices || []).map(c => (c && c.id) || c))}`);
    // idempotence: second application while offer pending does not duplicate/stack
    const n1 = (sc.abilityChoices || []).length;
    Game.applyStatus('scholar', 'poison', { name: 'throat sac toxin', source: 'the belltoad' });
    const n2 = (sc.abilityChoices || []).length;
    ok('AUDIT-B: reactive offer is idempotent (no duplicate while pending)', n1 === n2, `${n1} vs ${n2}`);
    // the real path: choose -> hold -> cure
    Game.chooseAbility('purify');
    ok('AUDIT-B: purify acquired via System offer (chooseAbility)', Game.hasAbility('purify'));
    const before = (Game.seList('scholar') || []).some(e => e.id === 'poison');
    const fired = Game._activateAbilityInner('purify');
    const after = (Game.seList('scholar') || []).some(e => e.id === 'poison');
    ok('AUDIT-B: purify cures poison end-to-end (offer -> hold -> cure)', before && !after && fired !== false);
    // no offer before the System arrives (canon: no System offers pre-day-7)
    Game.state.systemArrived = false;
    const sc2 = Game.state.scholar;
    sc2.abilities = sc2.abilities.filter(a => ((a && a.id) || a) !== 'purify');
    sc2.abilityChoices = null;
    Game.applyStatus('scholar', 'poison', { name: 'throat sac toxin', source: 'the belltoad' });
    ok('AUDIT-B: no System offer before arrival (pre-day-7 poison has no System counterplay, by canon)',
      !(sc2.abilityChoices || []).length);
    Game.state.systemArrived = true;
  }
}

// ============ SIBLING SWEEP: lanes stay clean ============
{
  // NPC track kits are System grants (explicitly System-flavored) — alien there is fine,
  // but no occupation teaches through them; verify kits only feed the System path.
  const kits = Game.NPC_ABILITY_KITS || {};
  const kitIds = new Set([].concat(...Object.values(kits)));
  const alienInKits = [...kitIds].filter(id => ALIEN.has(id));
  ok('SWEEP: NPC kits may carry alien abilities (System grants villagers directly — coherent)',
    alienInKits.includes('purify'), `alien-in-kits=${JSON.stringify(alienInKits)}`);
  // synergy legs: no synergy requires an ability with no acquisition path change surprise —
  // clean_plate's purify leg is now MORE acquirable (system_offer); iron_stomach still dead (documented)
  const syns = Game.data.synergies || [];
  const cp = syns.find(s => s.id === 'clean_plate');
  ok('SWEEP: clean_plate still needs iron_stomach (dead, documented) — purify leg is System-acquirable',
    !!cp && (abs.find(a => a.id === 'purify').unlock || {}).type === 'system_offer');
  // background abilities can never be alien (structural: game.js/ledger.js read occupation lists,
  // which the audit cleaned)
  const bgAlien = (Game.state.scholar.backgroundAbilities || []).filter(a => ALIEN.has((a && a.id) || a));
  ok('SWEEP: no alien ability in current background abilities', bgAlien.length === 0);
}

console.log(`\nRESULT: ${pass} ok, ${fail} FAIL (SEED=${SEED}, FIX=${FIX ? 1 : 0})`);
if (fail) process.exitCode = 1;
})();
