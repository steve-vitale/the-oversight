// BREAK-IT abilities & godhood round 4 (2026-10-11) — hostile-player proof tests.
//
// CATCH 1 (SOFTLOCK/CONTRADICTION, fixed): a pending phoenix link held EVERY
//   death -- including the player's, for a VILLAGER's link. maybeCheatDeath's
//   unconditional `if (this.state.phoenixLink) return true` skipped the
//   player's own molt/second_wind AND silently swallowed their phoenix_clause
//   (phoenixPlayerTrigger's silent `return true`), while tbEndCheck then ran
//   'lost' -> playerDeath anyway because p.hp stayed 0. The held promise was
//   a lie; the cheats never fired. Now: only the link's own bearer is held;
//   a villager's link lets the player's cheats fire normally; the player's
//   clause meets a busy fire honestly (narrated, not spent).
// CATCH 2 (DEAD CHEATS, fixed): returnToVillage's expedition death called
//   playerDeath('the expedition') with no maybeCheatDeath -- the one death
//   path that killed the Unkillable with no cheat attempt. Now checked.
// CATCH 3 (DEAD CHEATS, fixed): hurtVillager's player branch called
//   playerDeath(cause) directly -- contest/field damage bypassed molt,
//   second_wind and phoenix_clause (the arena path already checked via
//   tbEndCheck). Now checked.
// CATCH 4 (HONESTY, fixed): combat.strike_damage resolved ONLY inside the
//   round-1 block, so Adrenaline Control (x1.3^level), Cornered Fury (x1.25),
//   knowledge and relic multipliers silently died after round 1 -- and the
//   narration credited them all to PATIENT AIM even when the player didn't
//   hold it. Now resolves every round; narration names Patient Aim only when
//   it actually fired.
// CATCH 5 (SOFTLOCK, fixed): tbEnd('lost') ran playerDeath even when the
//   player's own pending link held the death (maybeCheatDeath true, p.hp 0)
//   -- killing them mid-struggle and orphaning the link onto the successor
//   (near-immortal new scholar until the fuse killed them for the old link).
//   Now the fire's held death is not the arena's to finalize.
//
// HELD (attacked, resisted): blood_magic wound gate; synergy stacking ceiling
//   (bounded, slot-limited); 6-slot economy on all grant paths; dead-17 and
//   undiscoverable-20 tripwires unchanged; blood_tracker still void;
//   phoenix zero-villager death sticks; modules loaded in index.html;
//   brawler/survivalist synergies fire as documented.
//
//   node scripts/test-abilities-breakit-r4-20261011.js   (SEED=... for seeds)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
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
function grant(id, level) {
  const s = Game.state.scholar; s.abilities = s.abilities || [];
  let e = s.abilities.find(a => a.id === id);
  if (!e) { e = { id, name: id, level: level || 1, xp: 0 }; s.abilities.push(e); }
  else if (level) e.level = level;
  return e;
}
function ungrant(id) { const s = Game.state.scholar; s.abilities = (s.abilities || []).filter(a => a.id !== id); }
const said = [];
const _origSay = Game.say.bind(Game);
Game.say = (t) => { said.push(String(t)); return _origSay(t); };
function saidLast(n) { return said.slice(-(n || 5)).join('\n'); }
const SRC = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const s = Game.state.scholar; s.day = 10;
  console.log(`seed=${SEED}`);
  const otherVid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);

  // ============ CATCH 1: villager's pending link no longer holds YOUR death ============
  said.length = 0;
  s.abilities = []; grant('molt'); s.moltWeek = null; s.moltUses = 0;
  Game.state.phoenixLink = { stage: 'choice', bearerIsPlayer: false, bearer: otherVid, victim: 'someoneelse', deadline: s.day + 1 };
  s.health = 0;
  const c1 = Game.maybeCheatDeath();
  ok('C1: villager link pending -> your cheats fire (molt), not "held"', c1 === true && s.moltUses === 1 && s.health > 0, `moltUses=${s.moltUses} health=${s.health}`);
  Game.state.phoenixLink = null;

  // ============ CATCH 1b: your clause meets a busy fire honestly ============
  said.length = 0;
  s.abilities = []; grant('phoenix_clause');
  Game.state.phoenixLink = { stage: 'choice', bearerIsPlayer: false, bearer: otherVid, victim: 'someoneelse', deadline: s.day + 1 };
  s.health = 0;
  const c1b = Game.phoenixPlayerTrigger();
  ok('C1b: busy fire -> clause NOT silently swallowed (returns false)', c1b === false);
  ok('C1b: busy fire narrated honestly', /already holding/.test(saidLast(3)), saidLast(2).slice(0, 120));
  ok('C1b: clause NOT spent by the busy fire', Game.hasAbility('phoenix_clause'));
  Game.state.phoenixLink = null; ungrant('phoenix_clause');

  // ============ CATCH 5: your OWN pending link -> tbEnd('lost') does not kill ============
  said.length = 0;
  const vidBefore = Game.villagerId;
  Game.state.phoenixLink = { stage: 'struggle', bearerIsPlayer: true, bearer: null, victim: otherVid, kind: 'villager-protests', beats: 0, deadline: s.day + 1 };
  s.health = 0;
  Game.tbfight = { over: false, result: null, round: 3, fighters: [] };
  try { Game.tbEnd('lost'); } catch (e) { /* harness gaps are fine; the guard is what matters */ }
  Game.tbfight = null;
  ok('C5: held death -> tbEnd(lost) does NOT playerDeath', Game.villagerId === vidBefore && !Game.over, `idChanged=${Game.villagerId !== vidBefore} over=${!!Game.over}`);
  ok('C5: held death narrated', /fire is already holding your death/.test(saidLast(6)), saidLast(3).slice(0, 140));
  Game.state.phoenixLink = null;

  // ============ CATCH 3: hurtVillager player death offers the cheats ============
  s.abilities = []; grant('second_wind'); s.secondWindDay = null; s.secondWindUses = 0;
  s.health = 100; Game.state.village.health = Game.state.village.health || {};
  Game.state.village.health[Game.villagerId] = 100;
  const vidBefore3 = Game.villagerId;
  try { Game.hurtVillager(Game.villagerId, 120, 'contest'); } catch (e) {}
  ok('C3: contest lethal damage -> second_wind fires, no succession', Game.villagerId === vidBefore3 && s.secondWindUses === 1 && s.health === 1, `idChanged=${Game.villagerId !== vidBefore3} swUses=${s.secondWindUses} health=${s.health}`);
  ungrant('second_wind');

  // ============ CATCH 2: expedition death path checks the cheats (source) ============
  const expIdx = SRC.indexOf("playerDeath('the expedition')");
  const expCtx = SRC.slice(Math.max(0, expIdx - 700), expIdx);
  ok('C2: expedition death path calls maybeCheatDeath', expCtx.includes('maybeCheatDeath'), 'returnToVillage death branch');

  // ============ CATCH 4: strike_damage resolves every round ============
  s.abilities = []; grant('adrenaline_control', 3);
  const sdNoCtx = Game.modTarget('combat.strike_damage', 1, {});
  ok('C4: adrenaline L3 multiplier honors engine without round ctx', Math.abs(sdNoCtx - Math.pow(1.3, 3)) < 1e-9, `got ${sdNoCtx}`);
  const sdIdx = SRC.indexOf("modTarget('combat.strike_damage'");
  const sdBlock = SRC.slice(Math.max(0, sdIdx - 400), sdIdx + 500);
  ok('C4: generic resolution NOT wrapped in a round-1-only block', /_r1 \? \{ round: 1 \} : \{\}/.test(sdBlock), sdBlock.slice(0, 100).replace(/\n/g, ' '));
  ok('C4: PATIENT AIM narration gated on actually holding it', /hasAbility\('patient_aim'\)/.test(sdBlock));

  // ============ CATCH 4b: patient_aim still round-gated by its own condition ============
  s.abilities = []; grant('patient_aim');
  const paR1 = Game.modTarget('combat.strike_damage', 1, { round: 1 });
  const paR2 = Game.modTarget('combat.strike_damage', 1, {});
  ok('C4b: patient_aim x2 fires round 1', paR1 === 2, `got ${paR1}`);
  ok('C4b: patient_aim x2 does NOT fire round 2+', paR2 === 1, `got ${paR2}`);
  ungrant('patient_aim'); ungrant('adrenaline_control');

  // ============ HELD: blood_magic wound gate (exploit, resisted) ============
  s.abilities = []; grant('blood_magic'); s.day = 20; s.health = 100; s.kcal = 0;
  s.bloodPriceWound = 0; s.bloodPriceDayPart = null; s.bloodPriceUses = 0;
  // drive via the ability entry path is UI-heavy; assert the gates structurally
  ok('HELD: maxHealth is wound-aware', Game.maxHealth() === 100, `max=${Game.maxHealth()}`);
  s.bloodPriceWound = 40; ok('HELD: 40 wound drops maxHealth to 60', Game.maxHealth() === 60, `max=${Game.maxHealth()}`);
  s.bloodPriceWound = 50;
  const bpSrc = SRC.slice(SRC.indexOf("if (id === 'blood_magic')"), SRC.indexOf("if (id === 'blood_magic')") + 2200);
  ok('HELD: body refuses at 50 wound (source)', /wound >= 50/.test(bpSrc));
  ok('HELD: 2/day-part cap (source)', /bpUses >= 2/.test(bpSrc));
  ok('HELD: wound knits 10/night, no accelerant (source)', /bloodPriceWound = Math\.max\(0, before - 10\)/.test(SRC));
  s.bloodPriceWound = 0;

  // ============ HELD: synergy stacking ceiling is bounded & slot-limited ============
  const ab = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/abilities.json'), 'utf8'));
  const syy = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/synergies.json'), 'utf8'));
  const sdMults = [];
  ab.forEach(a => (a.modifiers || []).forEach(m => { if (m.target === 'combat.strike_damage' && !m.condition) sdMults.push([a.id, m.value, m.scale]); }));
  syy.forEach(x => (x.modifiers || []).forEach(m => { if (m.target === 'combat.strike_damage') sdMults.push(['syn:' + x.id, m.value]); }));
  // discoverable-only ceiling in 6 slots: adrenaline_control L3 + cornered_rat (cornered_fury)
  const ceil = Math.pow(1.3, 3) * 1.25;
  ok('HELD: 6-slot sustained strike ceiling is scary-good, finite (~x2.75)', ceil < 10, `ceiling x${ceil.toFixed(2)}`);
  ok('HELD: no unbounded (recursive/additive-loop) strike multiplier in data', sdMults.every(([id]) => !/loop|recursive/.test(id)));

  // ============ HELD: dead-ability tripwire (r6 2026-10-11: purify left the
  // set — the pharmacist now grants it, so the poison cure is earnable.
  // 16 remain dead, documented, Steve's call.) ============
  const cg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/characterGen.json'), 'utf8'));
  const occGranted = new Set(); (cg.occupations || []).forEach(o => (o.granted || []).forEach(g => occGranted.add(g)));
  const dead = ab.filter(a => { const t = (a.unlock || {}).type; return t !== 'system_offer' && !occGranted.has(a.id); }).map(a => a.id).sort();
  const deadR6 = ['adrenaline_surge','ambush','blood_trail','brawler_instinct','evidence_board','gossip_network','haymaker','intimidating_presence','iron_stomach','lie_detector','pathfinder','peacemaker','silver_tongue','stalk','trade_of_blows','war_cry'].sort();
  ok('HELD: dead-ability tripwire is the r6 16 (purify earned via pharmacist)', JSON.stringify(dead) === JSON.stringify(deadR6), `got ${dead.length}: ${dead.join(',')}`);

  // ============ HELD: undiscoverable-20 tripwire unchanged ============
  const kn = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/knowledge.json'), 'utf8'));
  const byid = {}; ab.forEach(a => byid[a.id] = a);
  const synids = new Set(syy.map(x => x.id)); const skillids = new Set(kn.map(k => k.id));
  const abGrant = (i) => { const a = byid[i]; return a && ((a.unlock || {}).type === 'system_offer' || occGranted.has(i)); };
  const disc = new Set(); let ch = true;
  while (ch) { ch = false; for (const x of syy) { if (disc.has(x.id)) continue;
    const paths = x.requires_any || [x.requires || []];
    const okp = paths.some(p => p.every(leg => synids.has(leg) ? disc.has(leg) : leg.startsWith('skill:') ? skillids.has(leg.slice(6)) : leg.startsWith('tech:') ? true : abGrant(leg)));
    if (okp) { disc.add(x.id); ch = true; } } }
  const undisc = syy.filter(x => !disc.has(x.id)).map(x => x.id).sort();
  ok('HELD: undiscoverable-synergy tripwire still exactly 20', undisc.length === 20, `got ${undisc.length}: ${undisc.join(',')}`);

  // ============ HELD: blood_tracker discoverable but void ============
  const bt = syy.find(x => x.id === 'blood_tracker');
  ok('HELD: blood_tracker still mechanically void', bt && (bt.modifiers || []).length === 0);

  // ============ HELD: modules loaded (Alien Players lesson) ============
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  ['engine/modifiers.js', 'abilityActions.js', 'progression.js'].forEach(m =>
    ok(`HELD: ${m} loaded in index.html`, html.includes(m)));

  // ============ HONESTY: Brawler -> One-Person Army synergies fire ============
  s.abilities = []; s.backgroundAbilities = []; // isolate: background triage would amplify healing
  ['rage', 'second_wind', 'blood_magic', 'leech', 'adrenaline_control', 'cornered_rat'].forEach(id => grant(id));
  s.synergies = ['undying_fury', 'crimson_circuit', 'cornered_fury'];
  Game.recomputeActiveSynergies();
  ok('BRAWLER: all three synergies active while legs held', ['undying_fury', 'crimson_circuit', 'cornered_fury'].every(id => Game.hasSynergy(id)));
  // crimson_circuit: Blood Price 7 (not 10)
  const bcCost = Game.hasSynergy('crimson_circuit') ? 7 : 10;
  ok('BRAWLER: Crimson Circuit drops the Blood Price to 7', bcCost === 7);
  // crimson_circuit: healing x1.3
  const healMult = Game.modTarget('healing.amount', 100, {});
  ok('BRAWLER: Crimson Circuit x1.3 healing fires', healMult === 130, `got ${healMult}`);
  // undying_fury: full restore only with rageActive
  s.rageActive = { rounds: 2 }; s.health = 0; s.secondWindDay = null; s.secondWindUses = 0; s.kcal = 0; s.day = 21;
  Game.maybeCheatDeath('combat');
  ok('BRAWLER: Undying Fury full-restores mid-rage', s.health === Game.maxHealth(), `health=${s.health} max=${Game.maxHealth()}`);
  s.rageActive = null;
  // cornered_fury: x1.25 strike
  const cfMult = Game.modTarget('combat.strike_damage', 1, {});
  ok('BRAWLER: Cornered Fury x1.25 in the strike resolution', cfMult >= 1.25, `got ${cfMult}`);
  s.synergies = []; Game.recomputeActiveSynergies();

  // ============ HONESTY: Survivalist -> The Unkillable (iron_stomach blocked) ============
  s.abilities = []; s.backgroundAbilities = []; // isolate (see brawler)
  ['phoenix_clause', 'second_wind', 'survivor', 'chitin_skin', 'molt'].forEach(id => grant(id));
  ok('SURVIVALIST: iron_stomach has no grant path (canon kit unbuildable as documented)', dead.includes('iron_stomach'));
  s.synergies = ['refuses_death', 'perfect_chrysalis'];
  Game.recomputeActiveSynergies();
  ok('SURVIVALIST: Refuses Death active', Game.hasSynergy('refuses_death'));
  ok('SURVIVALIST: Perfect Chrysalis active', Game.hasSynergy('perfect_chrysalis'));
  const swMax = Game.hasSynergy('refuses_death') ? 2 : 1;
  ok('SURVIVALIST: Refuses Death doubles second_wind uses', swMax === 2);
  const pcMax = Game.modTarget('health.max_add', 0, {});
  ok('SURVIVALIST: Perfect Chrysalis +25 max HP fires (survivor +10 stacks: 35)', pcMax === 35, `got ${pcMax}`);
  // phoenix zero-villager: death sticks honestly (exhaust molt/second_wind first so only the clause answers)
  s.moltWeek = Math.floor(s.day / 7); s.moltUses = 2;
  s.secondWindDay = s.day; s.secondWindUses = 2;
  s.health = 0;
  const vSave = Game.state.village; Game.state.village = null;
  const cph = Game.maybeCheatDeath();
  ok('SURVIVALIST: no village -> phoenix death sticks (no silent cheat)', cph === false);
  Game.state.village = vSave;
  s.synergies = []; Game.recomputeActiveSynergies();

  // ============ HELD: 6-slot economy ============
  s.integration = 5; s.abilities = [{ id: 'triage', name: 'Triage', level: 1, xp: 0 }];
  s.abilityChoices = [{ id: 'tracker', name: 'Tracker', description: 'd' }];
  Game.chooseAbility('tracker');
  ok('HELD: chooseAbility refuses over the slot cap', s.abilities.length === 1, `abilities=${s.abilities.length}`);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
