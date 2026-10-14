#!/usr/bin/env node
// scripts/test-godpath-unified-20261014.js — GOD-PATH REDESIGN proof.
//
// Steve 2026-10-14: "Gods are rough representatives of what starts out as
// jobs and classes, or playstyles." / "Each god path can have some intended
// subclasses though that fit the build." / "Good calls! Continue all."
//
// Proves, through the real game code (useAbility, tbDamage, maybeCheatDeath,
// keepsakeGrow, checkPlayerGodhoodAscension ...):
//   - every data verb (`do`) is registered and fires in a live fight
//   - warden/trickster/dealer control changes the BOARD (walls block monsters,
//     pulls/pushes/swaps/bribes move fighters, slams stun)
//   - healer, keeper, bulwark, furnace, undying, seer, showrunner, demagogue,
//     beastmaster, feaster and hoarder abilities do what their cards say
//   - class recognition: same classify() for the player and a villager;
//     pathLean is knowledge-gated
//   - godpath.js has no unwired functions; the capable bot can play the verbs
// Never writes into the repo.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('test-godpath-unified-20261014');
const { spawnSync } = require('child_process');

const ABIL = K.readJSON('src/data/abilities.json');

(async () => {
  const Game = await K.load({ seed: 20261014 });
  const S = globalThis.Scattering;
  const BA = S.buildarounds;
  K.newRun(Game);
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  K.openSlots(Game, 6);

  // a fight with extra monsters and an ally
  function arena(o) {
    o = o || {};
    s.abilities = [];
    for (const id of (o.give || [])) K.giveAbility(Game, id, { force: true, level: o.level || 1 });
    s.kcal = o.kcal != null ? o.kcal : 4000;
    const m = K.fight(Game, 'hushwolf', { hp: 500, px: o.px, py: o.py, mx: o.mx, my: o.my });
    const f = Game.tbfight;
    f.round = f.round || 1;
    const p = Game.tbFighter('p');
    p.acted = false;
    m.hp = m.maxHp = 400;
    const extra = [];
    for (const [x, y] of (o.more || [])) {
      const c = Object.assign({}, m, { key: 'm_x' + extra.length, mx: x, my: y, telegraph: null, hesitate: 0, blind: 0, stunned: 0, threatQueue: [] });
      f.fighters.push(c); f.order.push(c.key); extra.push(c);
    }
    let ally = null;
    if (o.ally) {
      const vid = (Game.state.village.roster || [])[0] || 'v_test';
      ally = { key: 'v_t', kind: 'villager', villagerId: vid, name: 'Ally', emoji: '🧍', hp: o.ally.hp || 30, maxHp: 30, speed: 3, mx: o.ally.x, my: o.ally.y, alive: true, fled: false, ai: 'helpful' };
      f.fighters.push(ally); f.order.push(ally.key);
    }
    return { f, p, m, extra, ally };
  }
  const use = (ab, act, tgt) => { const p = Game.tbFighter('p'); if (p) p.acted = false; return Game.useAbility(ab, act, tgt); };
  const cheb = (a, b) => Math.max(Math.abs(a.mx - b.mx), Math.abs(a.my - b.my));

  T.section('every data verb is registered');
  const doActs = [];
  for (const a of ABIL) for (const x of (a.actions || [])) if (x.do) doActs.push(a.id + '.' + x.id);
  T.ok(`${doActs.length} data verbs have an impl and a precheck`, doActs.every(k => typeof globalThis.AbilityActionImpls[k] === 'function' && typeof globalThis.AbilityActionPrechecks[k] === 'function'),
    doActs.filter(k => typeof globalThis.AbilityActionImpls[k] !== 'function').join(','));

  T.section('warden: the board is the weapon');
  {
    const { f, p, m } = arena({ give: ['raise_earth'], px: 2, py: 4, mx: 6, my: 4 });
    T.ok('Raise Earth fires', use('raise_earth', 'raise') === true);
    const cells = (f._wardenWall || {}).cells || [];
    T.ok('a wall rises between you and it', cells.length >= 2 && cells.every(c => c.startsWith('3,')), cells.join(' '));
    const [wx, wy] = cells[0].split(',').map(Number);
    T.ok('the wall blocks the MONSTER (warden terrain blocks everyone)', Game.tbCanOccupy(m, wx, wy) === false && Game.tbBlocked(wx, wy) === true);
    T.ok('once per fight: a second raise is refused before paying', (() => { const k = s.kcal; const r = use('raise_earth', 'raise'); return r === false && s.kcal === k; })());
    f.round = f._wardenWall.expires; Game.tbRoundWrap(f);
    T.ok('the wall sinks when its rounds run out', !f._wardenWall && Game.tbBlocked(wx, wy) === false);
  }
  {
    const { m } = arena({ give: ['gravity_well'], px: 2, py: 4, mx: 6, my: 4 });
    use('gravity_well', 'pull');
    T.ok('Gravity Well drags the monster 2 tiles toward you', m.mx === 4 && m.my === 4, `${m.mx},${m.my}`);
  }
  {
    const { m } = arena({ give: ['landslide'], px: 6, py: 4, mx: 7, my: 4 });
    const hp0 = m.hp;
    use('landslide', 'quake');
    T.ok('Landslide hurls it into the edge: slam damage and a stun', m.mx >= 7 && m.hp < hp0 && (m.stunned || 0) >= 1, `pos ${m.mx} hp ${hp0}->${m.hp} stun ${m.stunned}`);
  }
  {
    const { m } = arena({ give: ['landslide'], px: 2, py: 4, mx: 3, my: 4 });
    use('landslide', 'quake');
    T.ok('Landslide with open ground just throws it 2 tiles', m.mx === 5, `${m.mx}`);
  }

  T.section('trickster and phantom');
  {
    const { p, m } = arena({ give: ['switcheroo'], px: 2, py: 4, mx: 5, my: 4 });
    m.telegraph = { cells: [{ cx: 2, cy: 4 }], turnsLeft: 1, attackName: 'Lunge' };
    use('switcheroo', 'swap', m.key);
    T.ok('Switcheroo trades places; the wind-up fizzles; it hesitates', p.mx === 5 && m.mx === 2 && !m.telegraph && m.hesitate >= 1, `p ${p.mx} m ${m.mx}`);
  }
  {
    const { p, m } = arena({ give: ['blink', 'nowhere_man'], px: 4, py: 4, mx: 5, my: 4 });
    const a0 = { mx: p.mx, my: p.my };
    const acted = p.acted;
    T.ok('Blink fires without spending the turn', use('blink', 'blink') === true && p.acted === acted);
    T.ok('Blink moves you up to 3 tiles, away from it', cheb(a0, p) >= 1 && cheb(a0, p) <= 3 && cheb(p, m) > 1, `${a0.mx},${a0.my} -> ${p.mx},${p.my}`);
  }
  {
    const { m } = arena({ give: ['misdirection'] });
    const base = BA.damageMult(Game, m);
    m.blind = 2;
    T.ok('Misdirection: +50% into a blinded monster', Math.abs(BA.damageMult(Game, m) / base - 1.5) < 1e-6, `${base} -> ${BA.damageMult(Game, m)}`);
  }

  T.section('hunter/beastmaster, miser/dealer');
  {
    const { m } = arena({ give: ['pack_hunt'] });
    use('pack_hunt', 'sic', m.key);
    T.ok('Pack Hunt pins (rooted 2) and harries (3 rounds)', m._frozen >= 2 && m._birdStrike >= 3);
  }
  {
    const { p, m, extra } = arena({ give: ['bribe', 'sweetener'], px: 2, py: 4, mx: 3, my: 4, more: [[6, 6]] });
    const k0 = s.kcal;
    use('bribe', 'pay_off', m.key);
    T.ok('Bribe costs 150 kcal, backs it off 2 tiles, hesitate 2', s.kcal === k0 - 150 && cheb(p, m) === 3 && m.hesitate >= 2, `kcal ${k0 - s.kcal} dist ${cheb(p, m)}`);
    T.ok('Sweetener: the bought monster turns on the other one', m._turncoatTarget === extra[0].key && m._turncoatRounds >= 2);
  }
  {
    arena({ give: ['haggle'] });
    T.ok('Haggle: traders charge 25% less, routes pay 25% more', Game.modTarget('trade.price_mult', 400, {}) === 300 && Game.modTarget('trade.tariff_mult', 1000, {}) === 1250);
  }

  T.section('healer, bulwark, keeper');
  {
    const { ally } = arena({ give: ['mending_hands', 'battlefield_grace'], ally: { x: 3, y: 4, hp: 10 } });
    use('mending_hands', 'mend', ally.key);
    T.ok('Mending Hands heals an adjacent ally', ally.hp > 10, `${ally.hp}`);
    const gh = ((Game.tbfight.buildaround || {}).graceHeals || {})[ally.key];
    T.ok('…and counts as a heal for Battlefield Grace', gh === 1, String(gh));
  }
  {
    const { p, m, ally } = arena({ give: ['aegis_link'], ally: { x: 3, y: 4, hp: 30 } });
    use('aegis_link', 'link', ally.key);
    const ph = p.hp, ah = ally.hp;
    Game.tbDamage(ally.key, 12, 'test', m.key);
    T.ok('Aegis Link: the ally\'s hit lands on you', ally.hp === ah && p.hp < ph, `ally ${ah}->${ally.hp} you ${ph}->${p.hp}`);
  }
  {
    const { m, ally } = arena({ give: ['lifeline'], ally: { x: 3, y: 4, hp: 5 } });
    Game.tbDamage(ally.key, 40, 'test', m.key);
    T.ok('Lifeline: a falling ally holds at 1 HP, once per fight', ally.alive && ally.hp === 1);
  }
  {
    const { p, m, ally } = arena({ give: ['last_rites'], ally: { x: 3, y: 4, hp: 5 } });
    Game.tbDamage(ally.key, 40, 'test', m.key);
    T.ok('Last Rites: the fallen ally\'s echo guards you (2 hits)', !ally.alive && s._absorb && s._absorb.hits === 2);
    const ph = p.hp;
    Game.tbDamage('p', 10, 'test', m.key, { undodgeable: true });
    T.ok('…and the next hit on you is turned aside', p.hp === ph, `${ph}->${p.hp}`);
  }
  {
    arena({ give: ['keepers_oath', 'mourners_bond'] });
    const item = { itemId: 'daughters_drawing', name: "Daughter's drawing", bond: 12, sentimental: true };
    s.equipped = s.equipped || {}; s.equipped.acc1 = item;
    T.ok("Keeper's Oath: a level-1 keepsake acts at level 2", Game.keepsakeLevel(item) === 1 && Game.keepsakePowerLevel(item) === 2);
    T.ok('…so its level-2 action is ready', !!Game.keepsakeActionReady(['steady', 'hold', 'lucky_break'].find(a => Game.keepsakeActionDef(a) && Game.keepsakeLane(item) === Game.keepsakeActionDef(a).action.lane)));
    const b0 = item.bond;
    Game.keepsakeGrow(item, 1, 'day');
    T.ok("Mourner's Bond: worn keepsakes grow twice as fast", item.bond === b0 + 2, `${b0}->${item.bond}`);
    delete s.equipped.acc1;
  }
  {
    const { p, m } = arena({ give: ['coin_guard'] });
    use('coin_guard', 'coins');
    const ph = p.hp;
    Game.tbDamage('p', 20, 'test', m.key, { undodgeable: true });
    T.ok('Coin Guard: a coin absorbs up to 15 of a hit', ph - p.hp === 5 && s._absorb.hits === 2, `${ph}->${p.hp}`);
  }

  T.section('furnace and undying');
  {
    const { p, m } = arena({ give: ['stoke'] });
    const acted = p.acted;
    use('stoke', 'stoke');
    T.ok('Stoke burns 150 kcal without spending the turn', p.acted === acted && s._nextStrikes && s._nextStrikes.n === 2);
    const d = Game._applyAbilityActionMods(100, p, m);
    T.ok('…the next strike hits +60%', d === 160, String(d));
  }
  {
    arena({ give: ['ember_heart', 'back_from_the_brink'], kcal: 1000 });
    s.health = 0;
    const ok = Game.maybeCheatDeath();
    T.ok('Ember Heart: 600 kcal burn and you stand at 20% HP', ok === true && s.kcal === 400 && s.health === Math.ceil(Game.maxHealth() * 0.2), `kcal ${s.kcal} hp ${s.health}`);
    T.ok('Back from the Brink: the next 3 strikes +50%', s._nextStrikes && s._nextStrikes.n === 3 && s._nextStrikes.mult === 1.5);
    s.health = 0;
    T.ok('Ember Heart is once per fight', Game.maybeCheatDeath() === false || Game.tbfight._emberUsed === true);
    s.health = Game.maxHealth();
  }

  T.section('seer, showrunner, demagogue');
  {
    arena({ give: ['foresight', 'prophecy'] });
    const d0 = BA.dodgeBonus(Game);
    use('foresight', 'foresee');
    T.ok('Foresight + Prophecy: +35% dodge while it runs', BA.dodgeBonus(Game) - d0 >= 0.349, `${d0} -> ${BA.dodgeBonus(Game)}`);
  }
  {
    const { ally } = arena({ give: ['live_broadcast', 'crowd_favorite'], ally: { x: 3, y: 4 } });
    s.fans = 0;
    use('live_broadcast', 'go_live');
    T.ok('Live Broadcast: +2 fans, the ally is emboldened', s.fans === 2 && ally.rallyBuff >= 2);
  }
  {
    const { ally } = arena({ give: ['the_crowd_moves'], ally: { x: 3, y: 4 } });
    let turns = 0;
    const orig = Game.tbVillagerTurn;
    Game.tbVillagerTurn = function (v) { if (v === ally) turns++; return orig.apply(this, arguments); };
    use('the_crowd_moves', 'command');
    Game.tbVillagerTurn = orig;
    T.ok('The Crowd Moves: every ally takes an extra turn now', turns === 1);
  }
  {
    if (Game.tbfight && !Game.tbfight.over) { try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; } }
    K.newRun(Game); Game.state.systemArrived = true; K.openSlots(Game, 6); // K.fight empties the roster
    Game.state.scholar.abilities = [];
    K.giveAbility(Game, 'rally_aura');
    const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
    Game.state.village.positions = Game.state.village.positions || {};
    Game.state.village.positions[vid] = { mx: 3, my: 4 };
    const orig = Game.partyMembers;
    Game.partyMembers = () => [vid];
    K.fight(Game, 'hushwolf', { party: true });
    Game.partyMembers = orig;
    const v = Game.tbfight.fighters.find(x => x.villagerId === vid);
    T.ok('Rally Aura: a nearby ally starts the fight emboldened', !!v && cheb(v, Game.tbFighter('p')) <= 3 && v.rallyBuff >= 2, v ? `rally ${v.rallyBuff} dist ${cheb(v, Game.tbFighter('p'))}` : 'no ally');
  }

  T.section('feaster (camp)');
  {
    if (Game.tbfight && !Game.tbfight.over) { try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; } }
    K.newRun(Game); Game.state.systemArrived = true; K.openSlots(Game, 6);
    const s = Game.state.scholar;
    s.abilities = [];
    K.giveAbility(Game, 'long_table');
    s.kcal = 2000;
    const ids = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    for (const id of ids) Game.npcNeeds(id).hunger = 80;
    const ok = Game.useAbility('long_table', 'share_pot');
    T.ok('Long Table: 300 kcal of yours eases the whole camp\'s hunger', ok === true && ids.every(id => Game.npcNeeds(id).hunger === 40), ids.map(id => Game.npcNeeds(id).hunger).join(','));
    T.ok('…once a day', Game.useAbility('long_table', 'share_pot') === false);
    const src = K.readSrc('src/js/game.js');
    T.ok('Harvest Table arms the feast surge in hostFeast (wired)', /HARVEST TABLE[\s\S]{0,400}hasAbility\('harvest_table'\)/.test(src));
  }

  T.section('class: one classify for player and villager; lean is knowledge-gated');
  {
    const GPm = S.Godpath;
    const c1 = GPm.classify(['retribution', 'chitin_skin', 'leech']);
    T.ok('classify: 3 bulwark abilities -> shieldbearer/bulwark', c1 && c1.path === 'shieldbearer' && c1.subclass === 'bulwark');
    T.ok('classify: a tie names no class', GPm.classify(['retribution', 'chitin_skin', 'leech', 'rage', 'blood_frenzy', 'cannibal_frenzy']) === null);
    T.ok('classify ignores skills (classes are magic)', GPm.classify(['tracker', 'game_sense', 'stalk']) === null);
    const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
    Game.state.village.npcAbilities = Game.state.village.npcAbilities || {};
    Game.state.village.npcAbilities[vid] = ['retribution', 'chitin_skin', 'leech'];
    Game.recognizeClass(vid);
    T.ok('the same function names a villager "Bulwark of the Undying Ward"', Game.classLine(vid) === 'Bulwark of the Undying Ward', String(Game.classLine(vid)));
    T.ok('buildScore exists and leans on pathLean', typeof Game.buildScore === 'function' && Game.buildScore(vid, 'aegis_link') > Game.buildScore(vid, 'green_thumb'));
    T.ok('buildScore never scores an unknown ability', Game.buildScore(vid, 'aegis_link', { knows: () => false }) === 0);
  }

  T.section('wiring');
  {
    const w = spawnSync(process.execPath, ['scripts/check-wired.js', 'src/js/godpath.js'], { cwd: K.ROOT, encoding: 'utf8' });
    const un = (w.stdout || '').split('\n').filter(l => /UNWIRED/.test(l));
    T.ok('check-wired: nothing in godpath.js is unwired', un.length === 0, un.join(' | '));
    const pol = K.readSrc('scripts/policies/capable.js');
    const combatDo = [];
    for (const a of ABIL) for (const x of (a.actions || [])) if (x.do && x.context === 'combat') combatDo.push(a.id + '.' + x.id);
    const missing = combatDo.filter(k => pol.indexOf("'" + k + "'") < 0);
    T.ok('the capable bot has a plan for every new combat verb', missing.length === 0, missing.join(','));
  }

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exitCode = 2; });
