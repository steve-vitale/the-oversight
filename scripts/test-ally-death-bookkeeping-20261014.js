#!/usr/bin/env node
// test-ally-death-bookkeeping-20261014.js — a dead allied blade is really dead.
//
// Bug (2026-10-14): the end-of-fight snapshots in titans.js and
// finale-campaign.js read the ally id from f.vid, but injected ally fighters
// carry it as f.villagerId (titanInjectAllies). Every snapshot ally had
// vid undefined, so:
//   (a) the dead never left the finale muster (dead_stay_dead was a lie), and
//   (b) a dead titan ally was never marked dead on their home roster, and a
//       fallen speaker never triggered succession (ally_death_costs).
// network-campaign.js already read `f.vid || f.villagerId` — the reference.
//
// This drives REAL fights (startCombat -> injected allies -> tbEnd), no
// hand-built snapshots, so it would have caught the field mismatch.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('ally-death-bookkeeping');

(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  const said = K.captureSays(Game);
  Game.recordMoment = () => {};
  Game.ledgerAdd = () => {};

  // one allied village, ten named blades, the speaker among them
  const roster = [];
  for (let i = 0; i < 20; i++) roster.push({ id: 'ash_' + i, name: 'Blade ' + i, alive: true });
  Game.state.otherVillages = [{ id: 'ashford', name: 'Ashford', opinion: 30, roster }];
  const link = { primary: 'haven', subordinate: 'ashford', status: 'active', trust: 60, theirSpeaker: { id: 'ash_0', name: 'Blade 0' }, arrears: 0, day: 0 };
  Game.hierarchyState = () => [link];
  Game._linkOther = (l) => l.subordinate;
  let succession = 0;
  Game._designateSpeaker = () => { succession++; };
  const mk = (n) => ({
    allies: roster.slice(0, n).map(r => ({ villageId: 'ashford', vid: r.id, name: r.name, hp: 100, outfitted: [], gearValue: 0, wbonus: 3, varmor: 3 })),
    haven: [], day: Game.state.scholar.day, outfitted: {},
  });

  T.section('1. titan fight (herald): a dead ally marks the home roster');
  Game.titanCast();
  const st = Game.state.titans;
  st.musters.herald = mk(10);
  K.fight(Game, 'herald');
  const f1 = Game.tbfight;
  const allies1 = f1 ? f1.fighters.filter(f => f.kind === 'ally') : [];
  T.ok('herald fight started with 10 injected allies', !!f1 && allies1.length === 10, 'allies ' + allies1.length);
  const spk = allies1.find(f => f.villagerId === 'ash_0');
  T.ok('injected ally carries its id as villagerId', !!spk);
  if (spk) spk.alive = false;
  const trust0 = link.trust;
  said.length = 0;
  Game.tbEnd('fled');
  T.ok('dead ally marked dead on Ashford’s roster', roster[0].alive === false, 'alive=' + roster[0].alive);
  T.ok('survivors stay alive on the roster', roster.slice(1, 10).every(r => r.alive));
  T.ok('trust −10 for the death', link.trust === trust0 - 10, trust0 + ' -> ' + link.trust);
  T.ok('the fallen speaker triggers succession (said aloud)', succession === 1 && said.some(t => /their speaker — fell/.test(t)), 'succession ' + succession);
  T.ok('grief said aloud', said.some(t => /did not get up/.test(t)));

  T.section('2. finale node (the commercial break): the dead leave the muster');
  roster.forEach(r => { r.alive = true; });
  link.trust = 60;
  Game.state.worldMonsters = [];
  Game.map.px = 4; Game.map.py = 4;
  Game.finaleCampaignPlace('finale');
  st.musters.finale = mk(20);
  Game.state.scholar.health = 9000;
  Game.state.scholar.mx = 4; Game.state.scholar.my = 4;
  Game.startCombat('finale_crew');
  const f2 = Game.tbfight;
  const allies2 = f2 ? f2.fighters.filter(f => f.kind === 'ally') : [];
  T.ok('crew node started with 20 injected allies', !!f2 && (st._fight || {}).campaign === 'finale_crew' && allies2.length === 20, 'allies ' + allies2.length);
  const fallen = allies2.find(f => f.villagerId === 'ash_5');
  if (fallen) fallen.alive = false;
  const trust1 = link.trust;
  said.length = 0;
  Game.tbEnd('fled');
  const m = st.musters.finale;
  T.ok('the dead blade left the muster (20 -> 19)', m && m.allies.length === 19, 'muster ' + (m && m.allies.length));
  T.ok('it is the fallen one who is gone', m && !m.allies.some(a => a.vid === 'ash_5'));
  T.ok('dead blade marked dead on the home roster', roster[5].alive === false);
  T.ok('trust −10 for the death', link.trust === trust1 - 10, trust1 + ' -> ' + link.trust);
  T.ok('grief said aloud', said.some(t => /did not get up/.test(t)));

  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
