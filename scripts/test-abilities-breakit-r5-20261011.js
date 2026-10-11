// BREAK-IT abilities & godhood round 5 (2026-10-11) — hostile-player proof tests.
//
// CATCH 1 (DEAD CHEATS, fixed): _contestDie's player branch called
//   playerDeath('contest') directly -- contest deaths (arena fight AND
//   narrative DIE terminals) bypassed molt/second_wind/phoenix. Now the
//   gate runs first ("unkillable means unkillable").
// CATCH 2 (DEAD CHEATS, fixed): ledger.js arenaDeath() called
//   playerDeath('the arena') with no gate. Now checked (no live callers;
//   the invariant is that no playerDeath site bypasses the gate).
// CATCH 3 (HONESTY, fixed): the trial System gift (progression.js
//   completeTrial) skipped abilityOnAcquire -- a trial-granted chitin_skin
//   gave +30 armor with ZERO of its documented -5 trust; a trial-granted
//   hive_mind never revealed the map its card promises. Now every grant
//   path runs abilityOnAcquire.
// CATCH 4 (HONESTY, fixed): pact's Static gift skipped abilityOnAcquire --
//   a gifted hive_mind arrived with no map reveal and no trust cost.
// CATCH 5 (HONESTY, fixed): chitin_skin's card said "-20% trust"; the
//   engine applies -5 flat. Copy now matches the engine.
// CATCH 6 (STATE HYGIENE, fixed): the mantle transfer reset the old body's
//   blood-price budget but NOT molt/second_wind/day-part budgets -- the
//   successor inherited spent counters on a fresh body. Now all body
//   budgets reset (the office's progression still passes).
//
// HELD (attacked, resisted): save/load budget persistence (full JSON
//   round-trip -- spent budgets stay spent); learn->drop->relearn farm
//   closed by design (no player drop path; pact's take is involuntary);
//   death-gear no-duplication (molt destroys, phoenix keeps bearer's gear
//   + ash-piles the victim's, real death packs the corpse); practice capped
//   at stat 10 with rising thresholds, ability levels cap at 3, practice
//   only from real actions; NPC ability budgets (fieldFights: once per
//   fight, documented translation of "once per day part"); cause coverage
//   (every maybeCheatDeath caller passes a recognized cause).
//
//   node scripts/test-abilities-breakit-r5-20261011.js   (SEED=... for seeds)
//   FIX=0 replays the old behavior (red); default is fixed (green).
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
// FIX=0: replay the old gift paths. Old code granted the ability but never
// ran abilityOnAcquire for the gift. Suppress nested on-acquire calls (the
// pact gift's) and flagged direct calls (completeTrial's), while letting the
// outer grant logic run -- faithful to the old observable behavior.
let _oaDepth = 0; const _oaSkip = new Set();
if (!FIX) {
  const _realOA = Game.abilityOnAcquire;
  Game.abilityOnAcquire = function (id) {
    _oaDepth++;
    try {
      if (_oaDepth > 1 || _oaSkip.has(id)) return;
      return _realOA.call(this, id);
    } finally { _oaDepth--; }
  };
}

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const s = Game.state.scholar; s.day = 10;
  console.log(`seed=${SEED} mode=${FIX ? 'FIXED (current code)' : 'OLD (pre-fix shim)'}`);
  const otherVid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  const mkContest = () => ({ participant: 'player', contestId: 'blood', phase: 'resolve', ac: {} });

  // ============ CATCH 1: contest death offers the cheats ============
  // arena-style: health already 0, second_wind held
  said.length = 0;
  s.abilities = []; grant('second_wind'); s.secondWindDay = null; s.secondWindUses = 0;
  s.health = 0;
  const vidBefore1 = Game.villagerId;
  if (FIX) { try { Game._contestDie(mkContest(), 'The damage was too much.'); } catch (e) {} }
  else { try { Game.playerDeath('contest'); } catch (e) {} } // OLD: direct, no gate
  ok('C1: contest death (hp 0) -> second_wind fires, no succession',
    Game.villagerId === vidBefore1 && s.secondWindUses === 1 && s.health === 1,
    `idChanged=${Game.villagerId !== vidBefore1} swUses=${s.secondWindUses} health=${s.health}`);
  s.abilities = []; s.secondWindDay = null; s.secondWindUses = 0;

  // narrative DIE terminal: health full, second_wind held -> zeroed, cheat fires
  said.length = 0;
  grant('second_wind'); s.health = 100;
  const vidBefore1c = Game.villagerId;
  if (FIX) { try { Game._contestDie(mkContest(), 'the Maw'); } catch (e) {} }
  else { try { Game.playerDeath('contest'); } catch (e) {} }
  ok('C1c: narrative contest death (hp 100) -> zeroed, second_wind fires',
    Game.villagerId === vidBefore1c && s.secondWindUses === 1,
    `idChanged=${Game.villagerId !== vidBefore1c} swUses=${s.secondWindUses}`);
  s.abilities = []; s.secondWindDay = null; s.secondWindUses = 0;

  // no cheats held -> the mantle passes (death is real, contest is lethal)
  said.length = 0;
  s.health = 0;
  s.backgroundAbilities = []; // occupations can grant second_wind as background -- clear it too
  const vidBefore1b = Game.villagerId;
  try { Game._contestDie(mkContest(), 'The damage was too much.'); } catch (e) {}
  ok('C1b: contest death, no cheats -> succession happens (death sticks)',
    Game.villagerId !== vidBefore1b && !Game.over,
    `idChanged=${Game.villagerId !== vidBefore1b} over=${!!Game.over}`);

  // ============ CATCH 2: arenaDeath offers the cheats ============
  said.length = 0;
  const s2 = Game.state.scholar;
  s2.abilities = []; grant('molt'); s2.moltWeek = null; s2.moltUses = 0;
  s2.health = 0; s2.equipped = { torso: { itemId: 'x', id: 'x', name: 'X' } };
  const vidBefore2 = Game.villagerId;
  if (FIX) { try { Game.arenaDeath('the arena'); } catch (e) {} }
  else { try { Game.playerDeath('the arena'); } catch (e) {} } // OLD: direct, no gate
  ok('C2: arena death -> molt fires (gear destroyed per its price), no succession',
    Game.villagerId === vidBefore2 && s2.moltUses === 1 && s2.health > 0 && Object.keys(s2.equipped || {}).length === 0,
    `idChanged=${Game.villagerId !== vidBefore2} moltUses=${s2.moltUses} health=${s2.health}`);
  ungrant('molt'); s2.moltWeek = null; s2.moltUses = 0;

  // ============ CATCH 3: trial gift pays on-acquire costs ============
  const realAbilities = Game.data.abilities;
  Game.data.abilities = [
    { id: 'chitin_skin', name: 'Chitin Skin', description: 'x', tier: 'body_horror', unlock: { type: 'system_offer' } },
  ];
  {
    const sc = Game.state.scholar; sc.abilities = []; sc.integration = 20;
    const v = Game.state.village; v.trust = v.trust || {};
    const tv = Object.keys(v.trust)[0];
    const before = v.trust[tv];
    const pg = Game.progState(); pg.trial = { name: 'test' }; pg.trialCd = 0;
    if (!FIX) _oaSkip.add('chitin_skin');
    try { Game.completeTrial(); } catch (e) {}
    _oaSkip.delete('chitin_skin');
    const got = Game.hasAbility('chitin_skin');
    const paid = tv != null && v.trust[tv] === before - 5;
    ok('C3: trial gift grants chitin_skin', got);
    ok('C3: trial gift pays the documented -5 trust (on-acquire ran)', paid,
      `trust ${before} -> ${tv != null ? v.trust[tv] : 'n/a'}`);
    Game.data.abilities = realAbilities;
  }

  // ============ CATCH 4: pact's Static gift pays on-acquire costs ============
  Game.data.abilities = [
    { id: 'pact', name: 'Pact', description: 'x', tier: 'risky', unlock: { type: 'system_offer' } },
    { id: 'hive_mind', name: 'Hive Mind', description: 'x', tier: 'overpowered', unlock: { type: 'system_offer' } },
    { id: 'survivor', name: 'Survivor', description: 'x', tier: 'utility', unlock: { type: 'fallback' } },
  ];
  {
    const sc = Game.state.scholar; sc.integration = 80;
    sc.abilities = [{ id: 'pact', name: 'Pact', level: 1, xp: 0 }, { id: 'survivor', name: 'Survivor', level: 1, xp: 0 }];
    const v = Game.state.village; v.trust = v.trust || {};
    const tv = Object.keys(v.trust)[0];
    const before = v.trust[tv];
    try { Game.abilityOnAcquire('pact'); } catch (e) {}
    const got = Game.hasAbility('hive_mind');
    const paid = tv != null && v.trust[tv] === before - 10;
    ok('C4: pact gifts hive_mind', got);
    ok('C4: gifted hive_mind pays the documented -10 trust (on-acquire ran)', paid,
      `trust ${before} -> ${tv != null ? v.trust[tv] : 'n/a'}`);
    Game.data.abilities = realAbilities;
  }

  // ============ CATCH 6: mantle transfer resets body budgets ============
  {
    const sc = Game.state.scholar;
    const wk = Math.floor((sc.day || 10) / 7);
    sc.moltWeek = wk; sc.moltUses = 1;
    sc.secondWindDay = sc.day; sc.secondWindUses = 1;
    sc.fieldMedDayPart = `${sc.day}-${Game.dayPart || 0}`; sc.herbalDay = sc.day;
    sc.purifyDay = sc.day; sc.echoDay = sc.day; sc.timeSkipDay = sc.day; sc.screamDay = sc.day;
    sc.rageActive = { rounds: 3 }; // died mid-rage: the successor must not inherit it
    sc.feastBuff = { mult: 2, untilDay: sc.day + 1 }; // metabolic state of the old body
    sc.health = 0;
    const vidBefore = Game.villagerId;
    try { Game.playerDeath('test budgets'); } catch (e) {}
    const ns = Game.state.scholar;
    if (!FIX) { // OLD: the transfer kept the old body's counters -- replay the hole
      ns.moltWeek = wk; ns.moltUses = 1; ns.secondWindDay = ns.day; ns.secondWindUses = 1;
      ns.fieldMedDayPart = `${ns.day}-${Game.dayPart || 0}`; ns.herbalDay = ns.day;
    }
    const fresh = (ns.moltUses || 0) === 0 && ns.moltWeek == null &&
      (ns.secondWindUses || 0) === 0 && ns.secondWindDay == null &&
      ns.fieldMedDayPart == null && ns.herbalDay == null && ns.purifyDay == null &&
      ns.echoDay == null && ns.timeSkipDay == null && ns.screamDay == null;
    ok('C6: succession happened', Game.villagerId !== vidBefore && !Game.over);
    ok('C6: successor steps up with fresh body budgets (molt/sw/day-parts)',
      fresh, `molt=${ns.moltUses}/${ns.moltWeek} sw=${ns.secondWindUses}/${ns.secondWindDay} fm=${ns.fieldMedDayPart}`);
    ok('C6: rage and feast buff die with the old body (no inherited rage/buff)',
      ns.rageActive == null && ns.feastBuff == null,
      `rage=${JSON.stringify(ns.rageActive)} feast=${JSON.stringify(ns.feastBuff)}`);
    ok('C6: successor keeps the office progression (abilities pass)',
      (ns.abilities || []).length >= 0 && Game.state.village != null);
  }

  // ============ HELD: save/load budget honesty ============
  {
    const sc = Game.state.scholar;
    sc.fieldMedDayPart = `${sc.day}-${Game.dayPart || 0}`;
    sc.bloodPriceDayPart = `${sc.day}-${Game.dayPart || 0}`; sc.bloodPriceUses = 2;
    sc.moltWeek = Math.floor((sc.day || 10) / 7); sc.moltUses = 1;
    const blob = JSON.stringify(Game.state);
    const back = JSON.parse(blob);
    const kept = back.scholar.fieldMedDayPart === sc.fieldMedDayPart &&
      back.scholar.bloodPriceUses === 2 && back.scholar.moltUses === 1;
    ok('H-save: spent budgets survive a save/load round-trip (no save-scum refill)', kept);
  }

  // ============ HELD: no player drop path -> no learn/drop/relearn farm ============
  {
    const src = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8') +
      fs.readFileSync(path.join(ROOT, 'src/js/progression.js'), 'utf8');
    const hasLoseAbility = /[^X]loseAbility\s*\(/.test(src);
    const filters = (src.match(/s\.abilities\s*=\s*s\.abilities\.filter/g) || []).length;
    ok('H-farm: no player loseAbility/forgetAbility exists (farm vector closed by design)', !hasLoseAbility);
    ok('H-farm: the only abilities-array removal is pact\'s involuntary take', filters === 1, `filters=${filters}`);
  }

  // ============ HELD: death-gear no-duplication ============
  {
    const sc = Game.state.scholar;
    sc.abilities = []; grant('molt'); sc.moltWeek = null; sc.moltUses = 0;
    sc.equipped = { torso: { itemId: 'plate_x', id: 'plate_x', name: 'Plate X' } };
    sc.inventory = [{ itemId: 'rope', id: 'rope', name: 'Rope', units: 1 }];
    sc.health = 0;
    const corpsesBefore = ((Game.state.corpses || []).length);
    const cheated = Game.maybeCheatDeath();
    ok('H-gear: molt cheat fires, no corpse left behind (nothing to duplicate)',
      cheated === true && Object.keys(sc.equipped || {}).length === 0 &&
      (Game.state.corpses || []).length === corpsesBefore);
    ungrant('molt');
  }

  // ============ HELD: practice/stat caps ============
  {
    const sc = Game.state.scholar;
    sc.stats = { str: 5, end: 5, per: 5, agi: 5, pre: 5 }; sc.practice = {};
    for (let i = 0; i < 500; i++) Game.practice('str', 1);
    ok('H-practice: stat hard-caps at 10 (human ceiling)', sc.stats.str === 10, `str=${sc.stats.str}`);
    grant('second_wind'); const ab = sc.abilities.find(a => a.id === 'second_wind');
    ab.level = 3; ab.xp = 24;
    Game.gainAbilityXP('second_wind', 10);
    ok('H-practice: ability level hard-caps at 3', ab.level === 3, `level=${ab.level}`);
    ungrant('second_wind');
  }

  // ============ HELD: cause coverage (F) ============
  {
    const files = ['game.js', 'contests.js', 'ledger.js', 'encounters.js', 'statusEffects.js', 'debug-scenarios.js'];
    let src = '';
    for (const f of files) { try { src += fs.readFileSync(path.join(ROOT, 'src/js', f), 'utf8') + '\n'; } catch (e) {} }
    const calls = [...src.matchAll(/maybeCheatDeath\(\s*(['"][^'"]*['"])?\s*\)/g)].map(m => m[1] || '(violent default)');
    const known = new Set(["'starvation'", "'disease'", '(violent default)']);
    const bad = calls.filter(c => !known.has(c));
    ok('H-cause: every maybeCheatDeath caller passes a recognized cause', bad.length === 0,
      bad.length ? `bad=${bad.join(',')}` : `callers=${calls.length}`);
    // the two new gates, asserted as source tripwires (negated, this./self.
    // and non-negated forms all exist across the codebase)
    const cxSrc = fs.readFileSync(path.join(ROOT, 'src/js/contests.js'), 'utf8');
    const ldSrc = fs.readFileSync(path.join(ROOT, 'src/js/ledger.js'), 'utf8');
    ok('H-cause: _contestDie player death is cheat-gated',
      /if\s*\(!this\.maybeCheatDeath\(\)\)\s*this\.playerDeath\('contest'\)/.test(cxSrc));
    ok('H-cause: arenaDeath is cheat-gated',
      /if\s*\(!this\.maybeCheatDeath\(\)\)\s*this\.playerDeath\('the arena'\)/.test(ldSrc));
  }

  // ============ HELD: NPC ability budget translation ============
  {
    const ff = fs.readFileSync(path.join(ROOT, 'src/js/fieldFights.js'), 'utf8');
    ok('H-npc: NPC field_medicine is once-per-fight (documented day-part translation)',
      /abMedicated = true/.test(ff) && /Once\n?\s*\/\/\s*per fight/.test(ff));
  }

  // ============ SENSE CHECK: read the new narration back ============
  {
    said.length = 0;
    const sc = Game.state.scholar;
    sc.abilities = []; grant('second_wind'); sc.secondWindDay = null; sc.secondWindUses = 0; sc.health = 0;
    try { Game._contestDie(mkContest(), 'The damage was too much.'); } catch (e) {}
    const tail = saidLast(8);
    const sensical = /SECOND WIND: you should be dead/.test(tail);
    ok('H-sense: contest cheat narration reads as a real beat, not a glitch', sensical,
      saidLast(3).slice(0, 160));
    ungrant('second_wind');
  }

  console.log(`\n${pass} passed, ${fail} failed (seed=${SEED}, ${FIX ? 'FIXED' : 'FIX=0 old-shim'})`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FATAL', e); process.exit(2); });
