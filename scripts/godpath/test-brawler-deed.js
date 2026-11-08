'use strict';
// Lived One-Person Army deed: solo kill above your weight after you bled.
// Prepared fights prove the callers; natural campaign rate is not claimed.
const K = require('./lib'), T = K.reporter('brawler-deed');
(async () => {
  const saves = new Map();
  global.localStorage = {
    getItem: k => saves.get(String(k)) ?? null,
    setItem: (k, v) => saves.set(String(k), String(v)),
    removeItem: k => saves.delete(String(k)),
    key: i => [...saves.keys()][i] ?? null,
    get length() { return saves.size; },
  };
  const G = await K.load({ seed: Number(process.env.SEED || 7), narration: true });
  const S = globalThis.Scattering, GH = S.Godhood, GP = S.Godpath;
  const god = GH.byId('one_person_army');
  const berserker = ['blood_frenzy', 'rage', 'blood_magic', 'cannibal_frenzy'];
  const juggernaut = ['trade_of_blows', 'unbreakable', 'adrenaline_surge', 'cornered_rat'];
  let s, v, roster, id, m, f, p;

  function fresh(ids = berserker) {
    G.tbfight = null; G.over = false; G.won = false; K.newRun(G);
    s = G.state.scholar; v = G.state.village; roster = v.roster.slice();
    id = roster.find(x => x !== G.villagerId);
    s.day = 85; s.kcal = 6000; s.health = G.maxHealth();
    s.abilities = ids.map(aid => ({ id: aid, level: 1 }));
    s.activeSynergies = []; s.godhood = { active: [], recognized: {} };
    G.state.systemArrived = true; G.recognizeClass('player');
  }
  const status = who => G.godpathDeedStatus(who || 'player', 'one_person_army') || { observed: false, complete: false };
  const book = who => v.godpathDeeds?.[who || G.villagerId]?.outmatched_kill;

  function fight(mid = 'moderator', body = {}, party = false) {
    v.roster = party ? [id] : [];
    s.mx = 0; s.my = 0;
    if (party) { v.positions = { [id]: { mx: 1, my: 0 } }; v.health = { [id]: 100 }; G.npcNeeds(id).hunger = 0; }
    s.monster = { id: mid, mx: 8, my: 8, ...body };
    G.startCombat(mid);
    f = G.tbfight; m = f.fighters.find(x => x.kind === 'monster'); p = G.tbFighter('p');
    p.acted = false; f.order = ['p', m.key]; f.turnIdx = 0;
  }
  function helper() {
    const x = { key: 'v_brawl', kind: 'villager', villagerId: id, name: 'Prepared ally', hp: 100, maxHp: 100, mx: 1, my: 0, alive: true, fled: false, ai: 'brave' };
    f.fighters.push(x); f.order.push(x.key); G.npcNeeds(id).hunger = 0;
    return x;
  }
  function bleed(n = 12) {
    const before = p.hp;
    G.tbDamage(p.key, n, 'prepared wound', m.key, { undodgeable: true });
    return before - p.hp;
  }
  function kill() {
    for (const x of f.fighters.filter(x => x.kind === 'monster' && x.alive && !x.fled))
      G.tbDamage(x.key, 10000, 'you', 'p', { undodgeable: true });
    G.tbEndCheck();
  }
  function load() {
    const ok = G.load(G.state.runKey);
    s = G.state.scholar; v = G.state.village; f = G.tbfight;
    m = f?.fighters.find(x => x.kind === 'monster'); p = G.tbFighter('p');
    return ok;
  }

  fresh();
  T.ok('Brawler declares the authored outmatched kill deed', G.data.godpaths.paths.brawler.god.deed?.event === 'outmatched_kill');
  s.godpath.since = 1; s.activeSynergies = (god.requires.synergies || []).slice();
  const before = JSON.stringify(G.state);
  T.ok('old class age and every synergy cannot replace the lived fight', !GH.godhoodCloseness(s, god, 85).synergy && !status().observed);
  T.ok('reading missing deed progress invents no history', JSON.stringify(G.state) === before && !v.godpathDeeds);
  T.ok('known class receives the real outmatched objective', G.godpathDeedHint('player')?.includes('Alone'));

  fresh(); fight();
  T.ok('opening records a fresh stronger body against full capacity', f._gpApexHunt?.prey[0].hp > f._gpApexHunt?.actors[0].maxHp && f._gpApexHunt.prey[0].full);
  const wound = bleed();
  T.ok('actual undodgeable hit draws blood', wound > 0 && (p._taken || 0) === wound);
  kill();
  T.ok('bloodied solo kill above weight earns the Brawler deed', status().complete && book()?.scene === 'tactical' && book()?.wound === wound);
  T.ok('real deed unlocks only the existing complete build/day gates', GH.godhoodCloseness(s, god, 85).complete);
  G.save();
  T.ok('actual save/load preserves the person-owned victory', load() && status().complete && book()?.monster === 'moderator');
  const rec = JSON.stringify(book());
  fight(); bleed(); kill();
  T.ok('another kill cannot grind or replace the first receipt', JSON.stringify(book()) === rec);

  fresh(); fight('bulldozer'); bleed(); kill();
  T.ok('a weaker body is not above your weight', !status().observed);

  fresh(); fight(); kill();
  T.ok('an unbloodied solo kill earns no One-Person Army deed', !status().observed);

  fresh(); fight(); helper(); bleed(); kill();
  T.ok('bringing a helper voids the solo Brawler deed', !status().observed);

  fresh(); v.roster = []; s.insideHaven = true;
  G.state.doorFledMonsters = [{ id: 'moderator', hp: 140 }];
  G.exitBuilding(); f = G.tbfight; m = f.fighters.find(x => x.kind === 'monster'); p = G.tbFighter('p');
  T.ok('real door re-entry restores a prior wounded body', m.hp === 140 && m.hp < m.maxHp);
  bleed(); kill();
  T.ok('known wounded prey cannot earn the deed', !status().observed);

  fresh(); fight(); bleed(); m.fled = true; m.alive = false; G.tbEnd('won');
  T.ok('a false won label or routed living foe is not a kill', !status().observed);

  fresh(); fight(); bleed(); G.tbEnd('won');
  T.ok('declaring victory over a live monster earns nothing', !status().observed);

  // Failing control: remove the lived-fight finish hook.
  fresh(); fight(); bleed();
  const finish = GP.finishApexHunt;
  let hooked = 0;
  GP.finishApexHunt = function () { hooked += 1; };
  kill();
  T.ok('removing the lived-fight finish hook earns no Brawler deed', hooked === 1 && !status().observed && !book());
  GP.finishApexHunt = finish;

  // Failing control: remove the authored deed gate — class age would pass again.
  fresh();
  s.godpath.since = 1; s.activeSynergies = (god.requires.synergies || []).slice();
  const req = god.requires, authored = req.deed;
  req.deed = null;
  T.ok('removing the authored deed restores the old age/synergy proxy', GH.godhoodCloseness(s, god, 85).synergy === true);
  req.deed = authored;
  T.ok('restoring the authored deed again blocks the proxy', !GH.godhoodCloseness(s, god, 85).synergy);

  fresh(); fight(); bleed(); G.save();
  T.ok('mid-fight load retains opening evidence and the wound ledger', load() && (p._taken || 0) > 0 && !!f._gpApexHunt);
  kill();
  T.ok('loaded bloodied solo can finish the same real deed', status().complete);

  fresh(); fight(); G.save();
  const key = G.state.runKey, raw = JSON.parse(saves.get(key));
  T.ok('actual fight snapshot contains the opening ledger', !!raw.run?.tbfight?.godpathApexHunt);
  delete raw.run.tbfight.godpathApexHunt; saves.set(key, JSON.stringify(raw));
  load(); bleed(); kill();
  T.ok('an old fight without opening evidence gets no retroactive deed', !status().observed);

  fresh(); fight(); bleed(); kill();
  T.ok('fulfilled fight still cannot ascend before day 80', !GH.godhoodCloseness(s, god, 79).complete);
  s.abilities = [];
  T.ok('fulfilled fight does not waive the four-ability path kit', !GH.godhoodCloseness(s, god, 85).complete);

  fresh(); fight(); bleed(); kill();
  const predecessor = G.villagerId;
  G.villagerId = id; s.health = 100;
  T.ok('a successor cannot inherit a predecessors outmatched kill', !status().observed && !!book(predecessor));
  G.villagerId = predecessor;

  fresh(); fight(); bleed(); kill();
  G.checkPlayerGodhoodAscension();
  const gift = GH.capstoneItemFor(god);
  T.ok('actual player ceremony recognizes the earned fight and grants its capstone', s.godhood?.active?.includes(god.id) && s.godhood.recognized[god.id] === 85 && s.inventory.some(x => x.itemId === gift));
  const gifts = s.inventory.filter(x => x.itemId === gift).length;
  G.checkPlayerGodhoodAscension();
  T.ok('repeat ceremony cannot farm a Brawler capstone', s.inventory.filter(x => x.itemId === gift).length === gifts);

  fresh(); fight(); bleed(); kill();
  s.abilities = [{ id: 'rage', level: 1 }]; G.recognizeClass('player'); G.checkPlayerGodhoodAscension();
  T.ok('an earned fight alone cannot bypass the class and payoff', status().complete && !s.godhood?.active?.includes(god.id));

  fresh(); s.godhood = { active: [god.id], recognized: { [god.id]: 70 } };
  G.checkPlayerGodhoodAscension();
  T.ok('existing recognized Brawler gods persist without invented fights', s.godhood.active.includes(god.id) && !book());

  // NPC field parity: prepared solo kill above weight after taking damage.
  const md = G.data.monsters.find(x => x.id === 'moderator');
  function field({ body = { hp: 160, maxHp: 160 }, allies = 0 } = {}) {
    fresh(juggernaut);
    v.roster = roster; v.npcAbilities = { [id]: juggernaut.slice() }; v.health = { [id]: 100 };
    v.pantry = [{ name: 'Prepared stores', units: 100, kcalEach: 500, safe: true, spoilDay: 9999 }];
    G.npcNeeds(id).hunger = 0;
    G.getPerson(id).items = ['worldbreaker_maul', 'bloodplate'];
    G.state.villagerTricks = { moderator: true };
    return G.fieldFight(id, md, body, { allies, rng: () => 0.99 });
  }
  let result = field();
  T.ok('prepared real field engine reaches a living bloodied solo kill', result.outcome === 'vKill' && result.vHpLeft > 0 && result.vTaken > 0, JSON.stringify({ outcome: result.outcome, taken: result.vTaken, hp: result.vHpLeft }));
  T.ok('NPC field victory uses the same outmatched personal receipt', !!book(id) && book(id)?.scene === 'field' && book(id)?.wound === result.vTaken);

  result = field({ body: { hp: 159, maxHp: 160 } });
  T.ok('actual wounded field victory earns no fresh-fight credit', result.outcome === 'vKill' && !book(id));

  result = field({ allies: 1 });
  T.ok('available field support cannot silently count as solo', result.outcome === 'vKill' && !book(id));

  fresh(juggernaut);
  v.roster = roster; v.npcAbilities = { [id]: juggernaut.slice() }; v.health = { [id]: 100 };
  v.pantry = [{ name: 'Prepared stores', units: 100, kcalEach: 500, safe: true, spoilDay: 9999 }];
  G.npcNeeds(id).hunger = 0; G.getPerson(id).items = ['worldbreaker_maul', 'bloodplate'];
  G.state.villagerTricks = { moderator: true };
  G.recognizeClass(id);
  result = G.fieldFight(id, md, { hp: 160, maxHp: 160 }, { allies: 0, rng: () => 0.99 });
  G.checkVillagerGodhoodAscension(id);
  T.ok('actual NPC ceremony recognizes only its own earned fight and capstone', result.outcome === 'vKill' && !!book(id) && v.npcGodhood?.[id]?.active?.includes(god.id) && G.vpOf(id).items.some(x => (typeof x === 'string' ? x : x.itemId || x.id) === gift) && !s.godhood?.active?.includes(god.id));

  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
