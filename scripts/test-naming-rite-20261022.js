// Player naming rite proof (rogue P0-8, 2026-10-22).
// Vermilion/Nuzlocke talk: permadeath + naming is the genre's cheapest
// attachment multiplier. The monster-naming verb exists; this extends it to
// people — name newborns, bestow use-names at high trust.
//
// Usage: node scripts/test-naming-rite-20261022.js
// Asserts: the naming beat fires at the right conditions, the name sticks on
// the villager record, use-name bestowal requires the trust threshold, and
// transcript output contains the name. Prints the voiced beats for a
// sense-read (the moment must feel meaningful, not menu-ish).
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}`); }
}
function logSlice(Game, from) {
  return Game.log.slice(from).join('\n');
}

(async () => {
  const { Game, loadFails } = await loadGame({ seed: 20261022, narration: true, mode: 'naming-rite' });
  ok('all scripts loaded', loadFails.length === 0);
  if (loadFails.length) console.log('loadFails:', loadFails.slice(0, 5));
  await setupGame(Game, 'Columbus, Ohio');
  const mark0 = Game.log.length;

  // ============ USE-NAME: the trust gate ============
  const vid = Game.state.village.roster.find(id => id !== Game.state.scholar.villagerId);
  const v = Game.data.villagers.find(x => x.id === vid);
  const trueName = v.name;
  ok('useNameThreshold is 75 (loyal band)', Game.useNameThreshold() === 75);
  ok('not available at low trust', Game.useNameAvailable(vid) === false);
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[vid] = 74;
  ok('not available at trust 74', Game.useNameAvailable(vid) === false);
  Game.state.village.trust[vid] = 75;
  ok('gated when the name is still unknown (knowledge-gating)', Game.useNameAvailable(vid) === false);
  // you've talked, so the name is known (displayName's gate)
  Game.revealName(vid, 'intro');
  ok('available at trust 75 once the name is known', Game.useNameAvailable(vid) === true);

  // ============ USE-NAME: the beat ============
  const mBeat = Game.log.length;
  const r = Game.askAbout(vid, 'usename', { inConvo: true });
  ok('usename topic returns the naming hook', !!(r && r.ok && r.useNaming && r.useNaming.vid === vid));
  const beatText = logSlice(Game, mBeat);
  console.log('\n--- USE-NAME BEAT (trust 75) ---\n' + beatText + '\n--- end ---\n');
  ok('beat is voiced (player asks)', /Can I call you something/.test(beatText));
  ok('beat reacts as a person (not a menu)', beatText.split('\n').length >= 2);

  // ============ USE-NAME: bestowal ============
  const mBestow = Game.log.length;
  const b = Game.bestowUseName(vid, '  Sparrow  ');
  ok('bestowal ok', b && b.ok === true);
  ok('name sticks on the villager record', v.calledName === 'Sparrow');
  ok('name sanitized (trimmed)', b.name === 'Sparrow');
  ok('true name never overwritten (unique-person law)', v.name === trueName);
  ok('displayName prefers the use-name', Game.displayName(vid) === 'Sparrow');
  ok('npcName prefers the use-name', Game.npcName(vid) === 'Sparrow');
  const bestowText = logSlice(Game, mBestow);
  console.log('--- BESTOWAL ---\n' + bestowText + '\n--- end ---\n');
  ok('transcript contains the name', /Sparrow/.test(bestowText));
  ok('beat says the true name stays', /true name stays theirs|not a replacement/.test(bestowText));
  const mem = (Game.state.village.memory[vid] || []).find(e => e.t === 'usename');
  ok('memory records the bestowal (sticky)', !!(mem && mem.sticky && /Sparrow/.test(mem.note || '')));
  ok('no longer available once named', Game.useNameAvailable(vid) === false);

  // re-bestowal: nicknames evolve
  const b2 = Game.bestowUseName(vid, 'Sparrowhawk');
  ok('re-bestowal allowed', b2 && b2.ok && b2.replaced === true);
  ok('new name sticks', v.calledName === 'Sparrowhawk' && v.name === trueName);

  // empty name: honest refusal, nothing set
  const b3 = Game.bestowUseName(vid, '   ');
  ok('empty name refused honestly', b3 && !b3.ok && b3.empty === true);
  ok('refusal does not clobber', v.calledName === 'Sparrowhawk');

  // ============ BABY: birth leaves the baby unnamed ============
  Game.state.scholar.day = 280;
  const ov = {
    id: 'test_vil', name: 'Testville', x: Game.map.px, y: Game.map.py,
    day: 280, population: 4, pantryKcal: 100000, trust: 15,
    knowledgeProfile: { focus: 'forager', plants: {} },
    codex: { plants: {} },
    roster: [
      { id: 'tp1', name: 'Mara Ellison', age: 30, alive: true, partner: 'tp2', children: [], parents: [] },
      { id: 'tp2', name: 'Joren Ellison', age: 32, alive: true, partner: 'tp1', children: [], parents: [] },
      { id: 'tp3', name: 'Ash Rivera', age: 28, alive: true, partner: 'tp4', children: [], parents: [] },
      { id: 'tp4', name: 'Lena Rivera', age: 27, alive: true, partner: 'tp3', children: [], parents: [] },
    ],
    news: [],
  };
  Game.state.otherVillages = Game.state.otherVillages || [];
  Game.state.otherVillages.push(ov);
  const realRandom = Math.random;
  Math.random = () => 0.0049; // force the 0.005/day birth roll; nothing else breaks
  const mBirth = Game.log.length;
  Game.simVillageDay(ov);
  Math.random = realRandom;
  const baby = ov.roster.find(p => p.unnamed && p.alive);
  ok('birth happened in the sim', !!baby);
  ok('baby is born UNNAMED (never automatic)', baby && baby.name === null && baby.unnamed === true);
  ok('birth stamped for the 30-day fallback', baby && baby.birthDay === 280);
  const birthNews = ov.news.join('\n');
  ok('birth news holds the name, no "null"', /still unnamed/.test(birthNews) && !/null/.test(birthNews));
  console.log('--- BIRTH NEWS ---\n' + birthNews + '\n--- end ---\n');

  // ============ BABY: the villageTalk beat ============
  const mTalk = Game.log.length;
  Game.villageTalk('test_vil');
  const talkText = logSlice(Game, mTalk);
  console.log('--- VILLAGETALK BEAT ---\n' + talkText + '\n--- end ---\n');
  ok('parents ask the bearer (voiced beat)', /We haven't named them yet/.test(talkText));
  ok('beat fires once per baby', baby.namingAsked === true);
  const pend = Game.babyNamingPending('test_vil');
  ok('naming offer pending for the player', !!(pend && pend.babyId === baby.id));

  // ============ BABY: the naming ============
  const mName = Game.log.length;
  const nb = Game.nameBaby('test_vil', baby.id, 'Wren');
  ok('nameBaby ok', nb && nb.ok === true);
  ok('baby record carries the name', baby.name === 'Wren' && baby.unnamed === false);
  ok('named-by-bearer recorded', baby.namedBy === 'bearer');
  ok('offer clears after naming', Game.babyNamingPending('test_vil') === null);
  const nameText = logSlice(Game, mName);
  console.log('--- NAMING ---\n' + nameText + '\n--- end ---\n');
  ok('transcript contains the name', /Wren/.test(nameText));
  ok('naming moment is a scene, not a menu', /repeats it softly/.test(nameText));
  ok('village news records the naming', ov.news.some(n => /Wren/.test(n) && /named by the bearer/.test(n)));

  // ============ BABY: the 30-day fallback (parents' right) ============
  const baby2 = {
    id: 'test_vil_p2', name: null, unnamed: true, birthDay: 280 - 31,
    age: 0, alive: true, partner: null, children: [],
    parents: ['tp3', 'tp4'],
  };
  ov.roster.push(baby2);
  ov.population++;
  Game.nameUnnamedBabies(ov);
  ok('parents name the child at 30 days', baby2.name !== null && baby2.unnamed === false);
  ok('fallback marked as parents-given', baby2.namedBy === 'parents');
  ok('fallback news names the child', ov.news.some(n => /was named/.test(n) && !/null/.test(n)));

  // ============ BABY: the beat never re-fires ============
  Game.state.scholar.day = 281;
  const mTalk2 = Game.log.length;
  Game.villageTalk('test_vil');
  const askCount = logSlice(Game, mTalk2).split('We haven\'t named them yet').length - 1;
  ok('no second ask once every baby is named', askCount === 0);

  // ============ SAFETY: null names never render ============
  ok('distantShortName guards null', Game.distantShortName({ name: null }) === 'the baby');
  ok('distantShortName passes real names', Game.distantShortName({ name: 'Mara Ellison' }) === 'Mara');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
