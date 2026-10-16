#!/usr/bin/env node
// scripts/test-godpath-villagers-20261014.js — villagers use the god-path
// subclass verbs, and the passives apply to whoever holds them.
//
// Steve 2026-10-14: "Villagers and players should get the same XP, when in
// doubt we treat them the same way." / "villagers need to act in smart ways".
//
// Proves through the real game code (tbVillagerTurn -> tbVillagerAbility,
// tbDamage, fieldFight):
//   - each of the 14 combat verbs fires for a villager fighter through the
//     same VERBS implementation the player uses, and changes the board/fight
//   - the villager pays the verb's data kcal from their own belly (hunger)
//     and a starving pantry casts nothing
//   - passives held by a villager: Lifeline, Ember Heart (+ Back from the
//     Brink), Last Rites, Rally Aura, Misdirection, Prophecy, Coin Guard
//   - off-screen field fights: the verbs and passives run in that engine's
//     terms and a held kit wins more fights than none
//   - buff everyone (godpath-buff): the original combat kit a villager holds
//     runs off-screen too, and a well-fed villager carries the player's
//     food overcharge
// Never writes into the repo.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('test-godpath-villagers-20261014');

(async () => {
  const Game = await K.load({ seed: 1014 });
  const S = globalThis.Scattering;
  const GP = S.Godpath;
  K.newRun(Game);
  Game.state.systemArrived = true;
  const v = Game.state.village;
  const roster0 = (v.roster || []).filter(id => id !== Game.villagerId);
  const vidA = roster0[0], vidB = roster0[1], vidC = roster0[2];
  T.ok('three villagers to test with', !!(vidA && vidB && vidC), roster0.length);
  Game.villageFoodTier = (() => { const o = Game.villageFoodTier; let forced = null; const f = function () { return forced || o.apply(this, arguments); }; f.force = (t) => { forced = t; }; return f; })();
  Game.villageFoodTier.force('secure');

  function hold(vid, ids) { v.npcAbilities = v.npcAbilities || {}; v.npcAbilities[vid] = ids.slice(); }
  function needs(vid) { const n = Game.npcNeeds(vid); n.hunger = 10; return n; }
  // a tb fight: player far away, villager A (and optionally B, C) in it
  function arena(o) {
    o = o || {};
    Game.tbfight = null; // test arenas: drop the last one (a flee would wound the player)
    Game.state.scholar.health = Game.maxHealth ? Game.maxHealth() : 100; Game.state.scholar.kcal = 3000;
    const _s = K.captureSays(Game);
    const m = K.fight(Game, "hushwolf", { px: 0, py: 0, mx: o.mx != null ? o.mx : 4, my: o.my != null ? o.my : 4 });
    _s.restore();
    if (!Game.tbfight) throw new Error("no fight: " + _s.slice(-4).join(" / ") + " over=" + Game.over);
    const f = Game.tbfight;
    f.round = 1;
    m.hp = m.maxHp = 300;
    const mk = (key, vid, x, y, hp) => {
      const a = { key, kind: 'villager', villagerId: vid, name: 'V' + key, emoji: '🧍', hp: hp || 30, maxHp: 30, speed: 3, mx: x, my: y, alive: true, fled: false, ai: 'brave' };
      f.fighters.push(a); f.order.push(a.key); return a;
    };
    const A = mk('v_a', vidA, o.ax != null ? o.ax : 3, o.ay != null ? o.ay : 4, o.ahp);
    const B = o.b ? mk('v_b', vidB, o.b.x, o.b.y, o.b.hp) : null;
    const C = o.c ? mk('v_c', vidC, o.c.x, o.c.y, o.c.hp) : null;
    const extra = [];
    for (const [x, y] of (o.more || [])) {
      const c = Object.assign({}, m, { key: 'm_x' + extra.length, mx: x, my: y, telegraph: null, hesitate: 0, blind: 0, stunned: 0, threatQueue: [] });
      f.fighters.push(c); f.order.push(c.key); extra.push(c);
    }
    return { f, m, A, B, C, extra };
  }
  const verbs = (who) => K.teleEvents(Game, 'godpath_verb').filter(e => ((e.data || e).who) === who).map(e => (e.data || e).ability);
  function cast(A) { return Game.tbVillagerAbility(A); }

  T.section('the 14 combat verbs, cast by a villager');
  {
    hold(vidA, ['landslide']); const n = needs(vidA);
    const { m, A } = arena({ ax: 3, ay: 4, mx: 4, my: 4, ahp: 15 });
    const r = cast(A);
    T.ok('Landslide: cast spends the turn', r === true);
    T.ok('Landslide: the monster was thrown away from the villager', Math.max(Math.abs(m.mx - A.mx), Math.abs(m.my - A.my)) > 1, `${m.mx},${m.my}`);
    T.ok('Landslide: villager paid 80 kcal from their belly (+3 hunger)', n.hunger === 10 + Math.round(80 / 25), n.hunger);
    T.ok('telemetry names the villager as caster', verbs(vidA).includes('landslide'));
    T.ok('perFight 1: no second Landslide this fight', cast(A) === false);
  }
  {
    hold(vidA, ['raise_earth']); needs(vidA);
    const { f, A } = arena({ ax: 2, ay: 4, mx: 5, my: 4, ahp: 15 });
    T.ok('Raise Earth: a villager raises a real wall on the grid', cast(A) === true && !!f._wardenWall && f._wardenWall.cells.length > 0);
  }
  {
    hold(vidA, ['pack_hunt']); needs(vidA);
    const { m, A } = arena({});
    T.ok('Pack Hunt: the monster is pinned and harried', cast(A) === true && (m._frozen || 0) >= 2 && (m._birdStrike || 0) >= 3);
  }
  {
    hold(vidA, ['mending_hands']); needs(vidA);
    const { A } = arena({ ahp: 10 });
    T.ok('Mending Hands: a hurt villager heals themself', cast(A) === true && A.hp > 10, A.hp);
  }
  {
    hold(vidA, ['bribe']); needs(vidA);
    const { m, A } = arena({ ax: 3, ay: 4, mx: 4, my: 4, ahp: 12 });
    T.ok('Bribe: the monster backs off and hesitates', cast(A) === true && (m.hesitate || 0) >= 2 && m.mx > 4, `${m.mx} h${m.hesitate}`);
  }
  {
    hold(vidA, ['bribe', 'sweetener']); needs(vidA);
    const { m, A } = arena({ ax: 3, ay: 4, mx: 4, my: 4, ahp: 12, more: [[6, 6]] });
    T.ok('Sweetener held by the villager: the bribed monster turns', cast(A) === true && !!m._turncoatTarget);
  }
  {
    hold(vidA, ['stoke']); needs(vidA);
    const { m, A } = arena({ ax: 3, ay: 4, mx: 4, my: 4 });
    const r = cast(A);
    T.ok('Stoke: free (no turn) and arms the next 2 strikes', r === false && A._nextStrikes && A._nextStrikes.n === 2, JSON.stringify(A._nextStrikes));
    T.ok('Stoke: villagerStrikeMult reads it (x1.6, times the food overcharge)', Math.abs(GP.villagerStrikeMult(Game, A, m) - 1.6 * GP.villagerPowerMult(Game, vidA)) < 1e-9);
  }
  {
    hold(vidA, ['coin_guard']); needs(vidA);
    const { m, A } = arena({ ax: 3, ay: 4, mx: 4, my: 4, ahp: 20 });
    cast(A);
    const before = A.hp;
    Game.tbDamage(A.key, 10, 'test', m.key, {});
    T.ok('Coin Guard on a villager absorbs a real tbDamage hit', A.hp === before && A._absorb && A._absorb.hits === 2, `${before}->${A.hp}`);
  }
  {
    hold(vidA, ['foresight', 'prophecy']); needs(vidA);
    const { f, m, A } = arena({ ax: 3, ay: 4, mx: 4, my: 4 });
    cast(A);
    T.ok('Foresight: a villager reads the fight', (A._foresightUntil || 0) >= f.round && (f._foresightUntil || 0) >= f.round);
    let dodged = 0;
    for (let i = 0; i < 200; i++) { A.hp = 30; A.alive = true; if (GP.absorbVillagerHit(Game, A, 10) === 0) dodged++; }
    T.ok('Prophecy held by the villager: ~35% of blows miss while Foresight runs', dodged > 40 && dodged < 110, dodged);
  }
  {
    hold(vidA, ['switcheroo']); needs(vidA);
    const { m, A } = arena({ ax: 2, ay: 4, mx: 4, my: 4 });
    m.telegraph = { kind: 'test', target: A.key };
    const ax = A.mx;
    T.ok('Switcheroo: a wind-up is answered by swapping places', cast(A) === true && A.mx === 4 && m.mx === ax && !m.telegraph);
  }
  {
    hold(vidA, ['blink']); needs(vidA);
    const { m, A } = arena({ ax: 3, ay: 4, mx: 4, my: 4, ahp: 8 });
    cast(A);
    T.ok('Blink: a cornered villager teleports away (no turn)', Math.max(Math.abs(m.mx - A.mx), Math.abs(m.my - A.my)) >= 2, `${A.mx},${A.my}`);
  }
  {
    hold(vidA, ['gravity_well']); needs(vidA);
    const { m, A, extra } = arena({ ax: 2, ay: 4, mx: 5, my: 4, more: [[5, 6]] });
    const d0 = Math.max(Math.abs(m.mx - A.mx), Math.abs(m.my - A.my));
    T.ok('Gravity Well: outnumbered, the villager pulls monsters in', cast(A) === true && Math.max(Math.abs(m.mx - A.mx), Math.abs(m.my - A.my)) < d0);
    void extra;
  }
  {
    hold(vidA, ['live_broadcast']); needs(vidA);
    const { A, B } = arena({ b: { x: 2, y: 5 } });
    T.ok('Live Broadcast: allies emboldened', cast(A) === true && (B.rallyBuff || 0) >= 2);
  }
  {
    hold(vidA, ['the_crowd_moves']); hold(vidB, []); hold(vidC, []); needs(vidA);
    const { A, B, C } = arena({ b: { x: 2, y: 5 }, c: { x: 2, y: 3 } });
    const says = K.captureSays(Game);
    const r = cast(A);
    says.restore();
    T.ok('The Crowd Moves: two NPC allies act and the player receives a controlled third turn', r === true && says.some(l => /The Crowd Moves: 3 extra turns/.test(l)) && Game.tbfight.playerCommands?.length === 1, says.filter(l => /Crowd/.test(l)).join(' | '));
    void B; void C;
  }
  {
    hold(vidA, ['aegis_link']); needs(vidA);
    const { m, A, B } = arena({ ahp: 30, b: { x: 2, y: 5, hp: 10 } });
    T.ok('Aegis Link: a healthy villager links to a hurt one', cast(A) === true && A._aegis && A._aegis.key === B.key);
    const bh = B.hp, ah = A.hp;
    Game.tbDamage(B.key, 6, 'test', m.key, {});
    T.ok('the linked ally\'s hit lands on the linker', B.hp === bh && A.hp < ah, `B ${bh}->${B.hp} A ${ah}->${A.hp}`);
  }

  T.section('food powers villager casts');
  {
    hold(vidA, ['landslide']); const n = Game.npcNeeds(vidA); n.hunger = 79;
    const { A } = arena({ ax: 3, ay: 4, mx: 4, my: 4, ahp: 15 });
    T.ok('a hungry villager (hunger 79) cannot burn 80 kcal: no cast', cast(A) === false && n.hunger === 79);
    needs(vidA);
    Game.villageFoodTier.force('starving');
    const g2 = arena({ ax: 3, ay: 4, mx: 4, my: 4, ahp: 15 });
    T.ok('a starving pantry: villagers conserve every calorie', cast(g2.A) === false);
    Game.villageFoodTier.force('secure');
  }

  T.section('passives apply to whoever holds them');
  {
    hold(vidA, ['lifeline']); hold(vidB, []);
    const { m, A, B } = arena({ b: { x: 2, y: 5, hp: 5 } });
    Game.tbDamage(B.key, 20, 'test', m.key, {});
    T.ok('Lifeline held by a villager: a falling ally holds at 1', B.alive && B.hp === 1, `${B.hp} ${B.alive}`);
    void A;
  }
  {
    hold(vidA, ['ember_heart', 'back_from_the_brink']); needs(vidA);
    const { m, A } = arena({ ahp: 5 });
    Game.tbDamage(A.key, 20, 'test', m.key, {});
    T.ok('Ember Heart held by a villager: they stand back up at 20%', A.alive && A.hp === 6, `${A.hp} ${A.alive}`);
    T.ok('Back from the Brink: their next 3 strikes x1.5', A._nextStrikes && A._nextStrikes.n === 3 && A._nextStrikes.mult === 1.5);
    T.ok('the furnace cost food (600 kcal = +24 hunger)', Game.npcNeeds(vidA).hunger === 34, Game.npcNeeds(vidA).hunger);
  }
  {
    hold(vidA, ['last_rites']); hold(vidB, []);
    const { m, A, B } = arena({ b: { x: 2, y: 5, hp: 3 } });
    Game.tbDamage(B.key, 20, 'test', m.key, {});
    T.ok('Last Rites held by a villager: a fallen ally guards them (2 hits)', !B.alive && A._absorb && A._absorb.hits === 2);
  }
  {
    hold(vidA, ['misdirection']);
    const { m, A } = arena({});
    m.hesitate = 1;
    const pw = GP.villagerPowerMult(Game, vidA);
    T.ok('Misdirection held by a villager: +50% into a confused monster', Math.abs(GP.villagerStrikeMult(Game, A, m) - 1.5 * pw) < 1e-9);
    m.hesitate = 0;
    T.ok('...and nothing into a clear-headed one', GP.villagerStrikeMult(Game, A, m) === pw);
  }
  {
    // Rally Aura: the start-of-fight hook reads every holder on our side
    hold(vidA, ['rally_aura']); hold(vidB, []);
    Game.state.village.roster = roster0.slice(0, 2);
    Game.ensureVillagerPositions && Game.ensureVillagerPositions();
    const pos = Game.state.village.positions || {};
    pos[vidA] = { mx: 1, my: 1 }; pos[vidB] = { mx: 2, my: 1 };
    Game.state.scholar.mx = 0; Game.state.scholar.my = 0;
    Game.state.scholar.monster = { id: 'hushwolf', mx: 6, my: 6 };
    const says = K.captureSays(Game);
    if (Game.tbfight && !Game.tbfight.over) { try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; } }
    Game.startCombat('hushwolf');
    says.restore();
    const f = Game.tbfight;
    const fb = f && f.fighters.find(x => x.villagerId === vidB);
    T.ok('Rally Aura held by a villager: allies near them start emboldened', !!fb && (fb.rallyBuff || 0) >= 2 && says.some(l => /Rally Aura/.test(l)), says.filter(l => /Rally/.test(l)).join(' | ') || (fb ? 'no buff' : 'B not in fight'));
    Game.state.village.roster = roster0.slice();
  }

  T.section('off-screen field fights');
  {
    if (Game.tbfight && !Game.tbfight.over) { try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; } }
    const mdef = (Game.data.monsters || []).find(x => x.id === 'hushwolf');
    const kit = ['landslide', 'coin_guard', 'stoke', 'ember_heart', 'mending_hands', 'misdirection', 'pack_hunt'];
    function trial(ids, n) {
      let wins = 0, deaths = 0, logs = [];
      for (let i = 0; i < n; i++) {
        hold(vidA, ids); needs(vidA);
        v.health = v.health || {}; v.health[vidA] = 100;
        const rec = Game.fieldFight(vidA, mdef, null, {});
        if (rec.outcome === 'vKill' || rec.outcome === 'mFlee') wins++;
        if (rec.outcome === 'vDie') deaths++;
        logs = logs.concat(rec.log || []);
      }
      return { wins, deaths, logs };
    }
    const none = trial([], 60), held = trial(kit, 60);
    const L = held.logs.join('\n');
    T.ok('field: Landslide / Pack Hunt / Coin Guard / Stoke narrate in the fight log', /\(Landslide\)/.test(L) && /\(Pack Hunt\)/.test(L) && /\(Coin Guard\)/.test(L) && /\(Stoke/.test(L));
    T.ok('field: a held kit wins more and dies less than none', held.wins > none.wins && held.deaths <= none.deaths, `wins ${none.wins}->${held.wins} deaths ${none.deaths}->${held.deaths}`);
    T.ok('field: casts reach telemetry with the villager as caster', K.teleEvents(Game, 'godpath_verb').some(e => (e.data || e).field && (e.data || e).who === vidA));
  }

  T.section('the whole kit off-screen + food is fuel for villagers too');
  {
    const mdef = (Game.data.monsters || []).find(x => x.id === 'hushwolf');
    const G0 = GP.fieldBegin(Game, vidA, ['adrenaline_control', 'adrenaline_surge', 'chitin_skin']);
    T.ok('data modifiers held by a villager: strikes x1.3, dodge +15%, armor +30', G0 && Math.abs(G0.strikeMult - 1.3) < 1e-9 && Math.abs(G0.dodge - 0.15) < 1e-9 && G0.armorAdd === 30, G0 && JSON.stringify({ s: G0.strikeMult, d: G0.dodge, a: G0.armorAdd }));
    let L = '';
    for (const id of ['static_toss', 'cheese_wheel', 'rage', 'bird_strike', 'pocket_sand']) {
      for (let i = 0; i < 6; i++) {
        hold(vidA, [id]); needs(vidA);
        v.health[vidA] = 100;
        L += (Game.fieldFight(vidA, mdef, null, {}).log || []).join('\n') + '\n';
      }
    }
    T.ok('field: Static Toss / Cheese Wheel / Rage / Bird Strike / Pocket Sand run off-screen', ['(Static Toss)', '(Cheese Wheel)', '(Rage)', '(Bird Strike)', '(Pocket Sand'].every(k => L.includes(k)), ['(Static Toss)', '(Cheese Wheel)', '(Rage)', '(Bird Strike)', '(Pocket Sand'].filter(k => !L.includes(k)).join(','));
    // detection modifiers held: bird_whisperer +0.2, beast_calm x0.75
    const Gd = GP.fieldBegin(Game, vidA, ['bird_whisperer', 'beast_calm']);
    T.ok('detection held by a villager: the awareness roll reads bird_whisperer (+0.2) and beast_calm (x0.75 noticed)', Gd && Math.abs(GP.fieldEvade(Gd, 0.3) - (1 - (1 - 0.5) * 0.75)) < 1e-9, Gd && GP.fieldEvade(Gd, 0.3));
    // overcharge parity: hunger <= 25 is the villager's "topped up"
    const n = Game.npcNeeds(vidA);
    n.hunger = 10;
    T.ok('a well-fed villager hits x' + Game.overchargeMult() + ' (the player\'s overcharge)', GP.villagerPowerMult(Game, vidA) === Game.overchargeMult());
    n.hunger = 40;
    T.ok('a hungry villager hits x1', GP.villagerPowerMult(Game, vidA) === 1);
    n.hunger = 10;
    Game.villageFoodTier.force('starving');
    T.ok('a starving pantry feeds no one\'s power', GP.villagerPowerMult(Game, vidA) === 1);
    Game.villageFoodTier.force('secure');
    hold(vidA, []);
    const { m, A } = arena({});
    T.ok('tb: a well-fed villager\'s strike carries the overcharge', Math.abs(GP.villagerStrikeMult(Game, A, m) - Game.overchargeMult()) < 1e-9);
    // the original kit in tb fights, cast by a villager
    hold(vidA, ['static_toss']); needs(vidA);
    const t1 = arena({ ax: 3, ay: 4, mx: 5, my: 4 });
    const hp0 = t1.m.hp;
    T.ok('tb: Static Toss cast by a villager hits a monster within 3', cast(t1.A) === true && t1.m.hp < hp0 && verbs(vidA).includes('static_toss'), `${hp0}->${t1.m.hp}`);
    hold(vidA, ['turncoat']); needs(vidA);
    const t2 = arena({ more: [[6, 6]] });
    T.ok('tb: Turncoat turns two monsters on each other', cast(t2.A) === true && !!t2.m._turncoatTarget);
    hold(vidA, ['adrenaline_control']); Game.npcNeeds(vidA).hunger = 50;
    const t3 = arena({});
    T.ok('tb: adrenaline_control (combat.strike_damage x1.3) on a villager\'s strike', Math.abs(GP.villagerStrikeMult(Game, t3.A, t3.m) - 1.3) < 1e-9);
  }

  T.section('ascension: the authored Apex hunt replaces class age');
  {
    if (Game.tbfight) Game.tbfight = null;
    const GH = S.Godhood;
    const s = Game.state.scholar;
    const rule = ((Game.data.godpaths || S.GODPATHS).rules || {}).capstone || {};
    T.ok('data: deedClassDays is set and the payoff + deed gates stay on', rule.deedClassDays > 0 && rule.requirePayoff !== false && rule.requireDeed !== false, JSON.stringify(rule).slice(0, 120));
    K.openSlots(Game, 6);
    s.abilities = [];
    for (const id of ['lucky_rock', 'bloodhound', 'static_toss', 'trophy_room']) K.giveAbility(Game, id, { force: true });
    s.synergies = []; s.activeSynergies = [];
    const rec = Game.recognizeClass('player');
    T.ok('class named: Stalker of the Apex Predator', rec && rec.path === 'hunter' && rec.subclass === 'stalker', JSON.stringify(rec));
    const gh = GH.godhoods().find(g => g.path === 'hunter');
    const n = rule.deedClassDays;
    rec.since = 80;
    const early = GH.godhoodCloseness(s, gh, 80 + n - 1);
    const late = GH.godhoodCloseness(s, gh, 80 + n);
    T.ok(`held ${n - 1} days: the deed is not yet done (no synergy)`, !early.synergy && !early.complete, JSON.stringify(early));
    T.ok(`held ${n} days: class age cannot replace the actual hunt`, !late.synergy && !late.complete, JSON.stringify(late));
    // Prepared requirement fixture; real acquisition has its own shared-kit test.
    Game.state.village.godpathDeeds = { [Game.villagerId]: { apex_hunt: { day: 84, monster: 'moderator', scene: 'tactical', method: 'solo', actorMaxHp: 100, openingHp: 160 } } };
    T.ok('an earned hunt completes the otherwise ready build', GH.godhoodCloseness(s, gh, 80 + n).complete);
    s.abilities = s.abilities.filter(a => (a.id || a) !== 'trophy_room');
    Game.recognizeClass('player');
    const noPay = GH.godhoodCloseness(s, gh, 80 + n + 5);
    T.ok('without the subclass payoff, no god (the payoff gate holds)', !noPay.complete);
    // THE PAYOFF FROM ANY TRACK (rules.offers.payoffAnyTrack): a named
    // Stalker levelling FIELD is offered Trophy Room (a combat-kit payoff)
    s.abilities = [];
    for (const id of ['lucky_rock', 'bloodhound', 'static_toss']) K.giveAbility(Game, id, { force: true });
    const r2 = Game.recognizeClass('player');
    const kits = Game.trackData().kits;
    const offers = Game.levelUpOffers('field').map(o => o.id || o);
    T.ok('setup: Stalker named, Trophy Room is not in the field kit', r2 && r2.subclass === 'stalker' && kits.field.indexOf('trophy_room') < 0 && kits.combat.indexOf('trophy_room') >= 0);
    T.ok('a named class\'s payoff is offered on another track\'s sheet', offers.includes('trophy_room'), offers.join(','));
    T.ok('...with the class still on the sheet\'s other offers (one swap)', offers.length === (Game.trackData().offerSize || 3));
    // and for a villager: the same function
    hold(vidB, ['lucky_rock', 'bloodhound', 'static_toss']);
    Game.recognizeClass(vidB);
    const vo = Game.villagerLevelUpOffers(vidB, 'field');
    T.ok('villager: the same payoff lean (same function)', vo.includes('trophy_room'), vo.join(','));
    hold(vidB, []);
    s.abilities = [];
    Game.recognizeClass('player');
  }

  T.section('wiring');
  {
    const src = K.readSrc('src/js/fieldFights.js') + K.readSrc('src/js/game.js');
    T.ok('fieldFights calls fieldBegin/fieldAct/fieldStrike/fieldIncoming/fieldCheatDeath/fieldAllyDown/fieldAllyShare',
      ['fieldBegin', 'fieldAct', 'fieldStrike', 'fieldIncoming', 'fieldCheatDeath', 'fieldAllyDown', 'fieldAllyShare'].every(n => src.includes('GPf.' + n) || src.includes('GPf && GPf.' + n)));
    T.ok('game.js calls villagerStrikeMult and absorbVillagerHit', /villagerStrikeMult\(this, v, t\)/.test(src) && /absorbVillagerHit\(this, t, final\)/.test(src));
  }
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
