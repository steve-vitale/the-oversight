// PROOF TEST: THE FINALE is a three-node super-special campaign (Steve 2026-10-11)
// "Maybe the finale is super special. Fights across multiple nodes, etc,
// including the big one on the 12x12. Really go all out for it. Maybe
// require even more people."
//
// (a) 20 blades to start (minAllies 20, largest army in the game)
// (b) campaign placement: the commercial break spawns first (not the heart)
// (c) crew gate: refused without 20; trio injected with 20 (9x9 skirmish)
// (d) opening gate: refused before crew cleared; 12x12 after
// (e) heart gate: order enforced, 10-survivor floor, reinforce path
// (f) node resolve: crew win -> opening spawns, dead leave muster, camp heals
// (g) heart: spoils granted; part two at bloodied (sky zones, credits, growth, encore)
// (h) spoils work: red pen / leaked script / bad note; encore takes items only
// (i) campaign nodes never wander (campaignOnly filtered from pool)
// (j) defeat pauses the campaign (muster holds, node re-faceable)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261012', 10);

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}

function mkMuster(n) {
  const allies = [];
  for (let i = 0; i < n; i++) {
    allies.push({ villageId: 'v' + (i % 10), vid: 'vid' + i, name: 'Fighter ' + i, hp: 100, outfitted: [], gearValue: 0, wbonus: 3, varmor: 5 });
  }
  return { allies, haven: [], day: 40, outfitted: {} };
}

function endFight() { try { Game.tbfight.over = true; } catch (e) {} Game.tbfight = null; }

(async () => {
  const H = require('./sim-harness.js');
  const { Game: G } = await H.loadGame({ seed: SEED });
  await H.setupGame(G);
  G.depart();
  const said = [];
  G.say = (t) => { said.push(String(t)); };
  G.sysSay = (t) => { said.push('[SYS] ' + String(t)); };
  G.audioEvent = () => {};
  G.recordMoment = () => {};
  G.ledgerAdd = () => {};
  // stub villages for grief/reinforce paths
  G._otherVillage = (id) => ({ id, name: 'Testville ' + id, opinion: 20, roster: [{ id: 'vid0', name: 'Fighter 0', alive: true }] });
  const mkLink = (id) => ({ primary: 'haven', subordinate: id, status: 'active', trust: 60, theirSpeaker: { id: 'spk' + id, name: 'Speaker' }, arrears: 0 });
  G.hierarchyState = () => { const out = []; for (let i = 0; i < 10; i++) out.push(mkLink('v' + i)); return out; };
  G._linkOther = (l) => l.subordinate;

  // (a) 20 blades
  console.log('(a) twenty blades');
  check('finale minAllies is 20', G.titanDef('finale').minAllies === 20);
  check('herald still 10', G.titanDef('herald').minAllies === 10);
  check('nielsen still 12', G.titanDef('nielsen').minAllies === 12);

  // (b) campaign placement
  console.log('(b) the march, not a lair');
  G.state.titans = null;
  G.map.px = 4; G.map.py = 4;
  G.state.worldMonsters = [];
  said.length = 0;
  G.finaleCampaignPlace('finale');
  const wm = G.worldMonsters();
  check('crew world monster placed (not the heart)', wm.some(m => m.id === 'finale_crew'), wm.map(m => m.id).join(','));
  check('heart NOT placed yet', !wm.some(m => m.id === 'finale'));
  check('placement said aloud', said.some(t => /COMMERCIAL BREAK/i.test(t)));

  // (c) crew gate + trio
  console.log('(c) the commercial break');
  G.state.titans.musters.finale = mkMuster(19);
  said.length = 0;
  let r = G.startCombat('finale_crew');
  check('crew refused at 19 blades', r === null);
  check('refusal names the 20', said.some(t => /20 allied blades/i.test(t)), said.join('|').slice(0, 200));
  G.state.titans.musters.finale = mkMuster(20);
  G.state.scholar.health = 9000;
  G.state.scholar.mx = 4; G.state.scholar.my = 4;
  r = G.startCombat('finale_crew');
  check('crew fight starts at 20', !!G.tbfight && !G.tbfight.over);
  const mids = G.tbfight.fighters.filter(f => f.kind === 'monster').map(f => f.mdef.id).sort();
  check('trio injected: crew + spoiler + network_note', JSON.stringify(mids) === JSON.stringify(['finale_crew', 'network_note', 'spoiler']), mids.join(','));
  check('crew fight is 9x9 skirmish', G.tbfight.gridSize === 9);
  const crewAllies = G.tbfight.fighters.filter(f => f.kind === 'ally');
  check('20 allies injected', crewAllies.length === 20, 'got ' + crewAllies.length);
  check('campaign marked on _fight', (G.state.titans._fight || {}).campaign === 'finale_crew');
  check('_fight.titan null (titans.js resolve stays out)', (G.state.titans._fight || {}).titan == null);

  // (d) opening gate
  console.log('(d) the opening credits');
  endFight();
  G.state.titans._fight = null;
  said.length = 0;
  r = G.startCombat('finale_opening');
  check('opening refused before crew cleared', r === null);
  check('refusal names node 1', said.some(t => /node 1 of 3|COMMERCIAL BREAK/i.test(t)));
  // clear the crew via resolve
  const crewSnap = {
    campaign: 'finale_crew', result: 'won',
    allies: G.state.titans.musters.finale.allies.map(a => ({ key: 'a_' + a.vid, name: a.name, villageId: a.villageId, vid: a.vid, alive: a.vid !== 'vid0' && a.vid !== 'vid1' })),
  };
  said.length = 0;
  G._finaleTest.finaleResolveNode(crewSnap);
  const camp = G.finaleCampaign();
  check('crew cleared', camp.crew === true);
  check('two dead left the muster (20 -> 18)', G.state.titans.musters.finale.allies.length === 18);
  check('opening spawned at +5', G.worldMonsters().some(m => m.id === 'finale_opening'));
  check('crew world monster removed', !G.worldMonsters().some(m => m.id === 'finale_crew'));
  check('interlude said aloud (camp)', said.some(t => /makes camp/i.test(t)));
  // now the opening works
  G.state.scholar.health = 9000;
  r = G.startCombat('finale_opening');
  check('opening starts after crew', !!G.tbfight && !G.tbfight.over);
  check('opening is 12x12', G.tbfight.gridSize === 12);
  const opM = G.tbfight.fighters.find(f => f.kind === 'monster');
  check('opening fighter is the credits', opM && opM.mdef.id === 'finale_opening');
  check('18 surviving allies injected', G.tbfight.fighters.filter(f => f.kind === 'ally').length === 18);

  // (e) heart gate
  console.log('(e) the heart gate');
  endFight();
  G.state.titans._fight = null;
  const gate = (id) => G.titanEntryGate(id);
  check('non-finale titan: no override', gate('herald') === null);
  G.state.titans.campaigns.finale = { started: true, crew: false, opening: false };
  let g = gate('finale');
  check('heart refused before crew', g && g.ok === false);
  G.state.titans.campaigns.finale = { started: true, crew: true, opening: false };
  g = gate('finale');
  check('heart refused before opening', g && g.ok === false);
  G.state.titans.campaigns.finale = { started: true, crew: true, opening: true };
  G.state.titans.musters.finale = mkMuster(9);
  g = gate('finale');
  check('heart refused at 9 survivors (floor 10)', g && g.ok === false && /10 surviving/i.test(g.reason), JSON.stringify(g));
  G.state.titans.musters.finale = mkMuster(10);
  g = gate('finale');
  check('heart opens at 10 survivors', g && g.ok === true);
  check('no campaign: default gate (null)', (() => { G.state.titans.campaigns.finale = { started: false, crew: false, opening: false }; return gate('finale') === null; })());

  // (f) opening win -> heart spawns
  console.log('(f) the sky opens');
  G.state.titans.campaigns.finale = { started: true, crew: true, opening: false };
  G.state.titans.musters.finale = mkMuster(18);
  const opSnap = {
    campaign: 'finale_opening', result: 'won',
    allies: G.state.titans.musters.finale.allies.map(a => ({ key: 'a_' + a.vid, name: a.name, villageId: a.villageId, vid: a.vid, alive: true })),
  };
  said.length = 0;
  G._finaleTest.finaleResolveNode(opSnap);
  check('opening cleared', G.finaleCampaign().opening === true);
  check('heart spawned at +7', G.worldMonsters().some(m => m.id === 'finale'));
  check('opening world monster removed', !G.worldMonsters().some(m => m.id === 'finale_opening'));

  // (g) the heart: spoils + part two
  console.log('(g) the heart');
  G.state.scholar.health = 9000;
  r = G.startCombat('finale');
  check('heart starts (gate passed)', !!G.tbfight && !G.tbfight.over);
  check('heart is 12x12', G.tbfight.gridSize === 12);
  check('spoils granted', !!(G.tbfight.fiCrewSpoils && G.tbfight.fiCrewSpoils.redpen === 1 && G.tbfight.fiCrewSpoils.script === 1 && G.tbfight.fiCrewSpoils.badnote === 1));
  check('campaign marked finale_heart', (G.state.titans._fight || {}).campaign === 'finale_heart');
  check('_fight.titan finale (titans.js owns resolve)', (G.state.titans._fight || {}).titan === 'finale');
  const HB = globalThis.MonsterBehaviorHooks;
  check('fiFinaleHeart registered', typeof HB.fiFinaleHeart === 'function');
  check('finale dispatches to fiFinaleHeart', (G.data.monsterBehaviors.behaviors.finale.preTurnHooks || [])[0] === 'fiFinaleHeart');
  const heart = G.tbfight.fighters.find(f => f.kind === 'monster' && f.mdef.id === 'finale');
  check('heart fighter present', !!heart);
  // bloodied -> part two (trigger turn: announces; the arena wakes next turn)
  heart.hp = Math.floor(heart.maxHp * 0.4);
  said.length = 0;
  HB.fiFinaleHeart(G, heart);
  check('part two triggered at bloodied', heart.fiPartTwo === true);
  check('credits flagged', G.tbfight.fiCredits === true);
  check('part two said aloud', said.some(t => /PART TWO/i.test(t)));
  check('growth accelerated', (heart.fiGrowth || 0) >= 2);
  check('no zones on the trigger turn (the sky wakes next)', (G.tbfight.fiSkyArmed || []).length === 0);
  // feed the declared countdown so the title card doesn't complicate arena tests
  heart.fiCountdown = null;
  HB.fiFinaleHeart(G, heart); // arena turn: zones arm, credits burn
  check('sky zones armed (2-3)', (G.tbfight.fiSkyArmed || []).length >= 2, JSON.stringify(G.tbfight.fiSkyArmed));
  // sky falls
  const z = G.tbfight.fiSkyArmed[0];
  const p = G.tbFighter('p');
  p.mx = z.x; p.my = z.y;
  const phpBefore = p.hp;
  said.length = 0;
  HB.fiFinaleHeart(G, heart);
  check('sky falls for [40,60] on zoned fighter', p.hp < phpBefore && (phpBefore - p.hp) >= 35, 'lost ' + (phpBefore - p.hp));
  // credits burn on the edge (clear zones so only the credits hit)
  G.tbfight.fiSkyArmed = [];
  p.mx = 0; p.my = 5; p.hp = 9000;
  const php2 = p.hp;
  HB.fiFinaleHeart(G, heart);
  const lostEdge = php2 - p.hp;
  check('credits burn edge tiles [10,20]', lostEdge >= 10 && lostEdge <= 20, 'lost ' + lostEdge);

  // (h) encore + spoils
  console.log('(h) the encore and the spoils');
  heart.fiPartTwo = false; heart.fiDeclared = true; heart.fiCountdown = null;
  heart.hp = Math.floor(heart.maxHp * 0.4);
  said.length = 0;
  HB.fiFinaleHeart(G, heart);
  check('encore declared (countdown was fed)', heart.fiEncore === true && heart.fiCountdown === 3);
  check('encore card [120,170]', JSON.stringify(heart.fiCardRange) === '[120,170]');
  check('encore said aloud', said.some(t => /ENCORE/i.test(t)));
  // one more turn: the arena arms zones under the encore
  HB.fiFinaleHeart(G, heart);
  // force player turn for spoil buttons
  const order = G.tbfight.order;
  G.tbfight.turnIdx = order.indexOf('p');
  p.acted = false; p.mx = 5; p.my = 5; p.hp = 9000;
  check('player turn forced', G.tbIsPlayerTurn() === true);
  const btns = G.finaleCampaignButtons();
  check('spoil buttons render (red pen while zones armed)', /data-finale="tbFiRedPen"/.test(btns), btns.slice(0, 200));
  check('leaked script button (countdown running)', /data-finale="tbFiLeakedScript"/.test(btns));
  check('bad note button', /data-finale="tbFiBadNote"/.test(btns));
  const zonesBefore = (G.tbfight.fiSkyArmed || []).length;
  G.tbFiRedPen();
  check('red pen crosses out the sky', (G.tbfight.fiSkyArmed || []).length === 0 && zonesBefore > 0);
  check('red pen consumed', G.tbfight.fiCrewSpoils.redpen === 0);
  const cdBefore = heart.fiCountdown;
  p.acted = false;
  G.tbFiLeakedScript();
  check('leaked script buys a round', heart.fiCountdown === cdBefore + 1);
  p.acted = false;
  G.tbFiBadNote();
  check('bad note lands (fiNoteVuln 2)', heart.fiNoteVuln === 2);
  // encore sacrifice: items only
  p.acted = false;
  G.state.scholar.inventory = [{ id: 'x', itemId: 'torch', name: 'Torch', units: 1 }];
  G.state.scholar.kcal = 9000;
  said.length = 0;
  const memResult = G.tbFiSacrifice('memory');
  check('encore refuses memories', memResult === false && said.some(t => /REAL thing/i.test(t)));
  p.acted = false;
  const itemResult = G.tbFiSacrifice('item');
  check('encore takes items', itemResult === true && !(heart.fiCountdown > 0));

  // (i) campaign nodes never wander
  console.log('(i) the march, not the wild');
  const pool = G.monsterWavePool();
  check('pool excludes finale_crew', !pool.some(m => m.id === 'finale_crew'));
  check('pool excludes finale_opening', !pool.some(m => m.id === 'finale_opening'));

  // (j) defeat pauses (muster holds)
  console.log('(j) defeat pauses the march');
  endFight();
  G.state.titans._fight = null;
  G.state.titans.campaigns.finale = { started: true, crew: false, opening: false };
  G.state.titans.musters.finale = mkMuster(20);
  G.spawnWorldMonster({ id: 'finale_crew' }, 7, 4, { titan: true });
  const fledSnap = {
    campaign: 'finale_crew', result: 'fled',
    allies: G.state.titans.musters.finale.allies.map(a => ({ key: 'a_' + a.vid, name: a.name, villageId: a.villageId, vid: a.vid, alive: a.vid !== 'vid5' })),
  };
  said.length = 0;
  G._finaleTest.finaleResolveNode(fledSnap);
  check('crew NOT cleared on flee', G.finaleCampaign().crew === false);
  check('muster holds (19, dead removed)', G.state.titans.musters.finale.allies.length === 19);
  check('crew world monster stays (re-faceable)', G.worldMonsters().some(m => m.id === 'finale_crew'));
  check('pause said aloud', said.some(t => /falls back in good order|pauses/i.test(t)));

  // interlude healing
  console.log('(k) the coalition camps');
  G.state.scholar.health = 100;
  const maxH = G.maxHealth();
  G.state.titans.musters.finale = mkMuster(10);
  G.state.titans.musters.finale.allies.forEach(a => { a.hp = 40; });
  G._finaleTest.finaleInterlude('finale_crew');
  check('player heals 50% of missing', G.state.scholar.health === 100 + Math.round((maxH - 100) * 0.5), 'hp=' + G.state.scholar.health);
  check('allies heal 25% of missing', G.state.titans.musters.finale.allies[0].hp === 40 + Math.round(60 * 0.25));

  endFight();
  console.log(`\n${pass} passed, ${fail} failed (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
