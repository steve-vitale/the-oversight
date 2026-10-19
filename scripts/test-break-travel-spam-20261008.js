// Free boundary crossings must not mint repeated world steps.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('travel-spam');
(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 424242) });
  Game.debugRegion = 'na_eastern_woodlands';
  // This fixture isolates the clock/needs/gossip contract from random encounters.
  Game.checkEncounter = () => {};
  Game.checkAnimals = () => {};
  K.newRun(Game);
  const s = Game.state.scholar, v = Game.state.village;
  const id = v.roster.find(id => id !== Game.villagerId);
  if (!id) throw new Error('No actual NPC for the needs proof');
  const n = Game.npcNeeds(id);
  Object.assign(n, { fear: 80, energy: 10, hunger: 10 });
  v.grief = 5; v.cheer = 5;
  const home = { x: Game.map.px, y: Game.map.py };
  const away = Game.travelTargets().find(t => Math.abs(t.x - home.x) + Math.abs(t.y - home.y) === 1 && !Game.travelBlockage(t.x, t.y));
  if (!away) throw new Error('No unblocked adjacent tile for the crossing proof');
  let needs = 0, gossip = 0;
  const tickNeeds = Game.tickNeeds, spreadGossip = Game.spreadGossip;
  Game.tickNeeds = function (...args) { needs++; return tickNeeds.apply(this, args); };
  Game.spreadGossip = function (...args) { gossip++; return spreadGossip.apply(this, args); };
  const cross = () => {
    const target = Game.map.px === home.x && Game.map.py === home.y ? away : home;
    Game.travelTo(target.x, target.y);
    if (Game.map.px !== target.x || Game.map.py !== target.y) throw new Error('The prepared crossing did not occur');
  };
  try {
    const start = { kcal: s.kcal, ticks: s.dayTicks || 0, day: s.day };
    for (let i = 0; i < 30; i++) cross();
    T.ok('thirty actual free crossings release one needs step', needs === 1);
    T.ok('thirty actual free crossings release one gossip step', gossip === 1);
    T.ok('first crossing retains its authored fear/energy/hunger effects', n.fear === 72 && n.energy === 14 && n.hunger === 18);
    T.ok('free crossings consume no player ticks or calories', (s.dayTicks || 0) === start.ticks && s.kcal === start.kcal);
    T.ok('free crossings do not advance the day', s.day === start.day);
    T.ok('part-scale travel steps do not decay daily grief or cheer', v.grief === 5 && v.cheer === 5);
    const part = Game.TIME.TICKS_PER_PART;
    Game.tickAction(part - 1);
    let before = { needs, gossip };
    cross();
    T.ok('less than a paid part releases no additional travel step', needs === before.needs && gossip === before.gossip);
    T.ok('elapsed ticks remain banked', s._travelStepDebt === part - 1);
    Game.tickAction(1);
    before = { needs, gossip };
    cross();
    T.ok('the final paid tick releases exactly one needs/gossip step', needs === before.needs + 1 && gossip === before.gossip + 1);
    T.ok('the released part consumes the banked debt', s._travelStepDebt === 0);

    // Read the real daily decay before later nightly events can add new grief.
    v.grief = 5; v.cheer = 5;
    const tickJoined = Game.tickJoinedVillage;
    let daily;
    Game.tickJoinedVillage = function (...args) { daily = { grief: v.grief, cheer: v.cheer }; return tickJoined.apply(this, args); };
    const day = s.day;
    try { Game.endDay(); } finally { Game.tickJoinedVillage = tickJoined; }
    T.ok('actual day resolution decays grief and cheer exactly once', daily?.grief === 4 && daily?.cheer === 4);
    T.ok('actual day resolution advances the day', s.day === day + 1);
  } finally { Game.tickNeeds = tickNeeds; Game.spreadGossip = spreadGossip; }
  T.done();
})().catch(error => { console.error(error); process.exitCode = 1; });
