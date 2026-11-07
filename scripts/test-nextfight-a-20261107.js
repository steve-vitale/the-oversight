#!/usr/bin/env node
// test-nextfight-a-20261107.js — VETERAN'S EDGE (sim-nextfight-a, NEXT-FIGHT
// SURVIVAL shape 2): a wave-4+ kill arms a one-fight x1.5 damage edge for
// the killer, claimed into their next wave-4+ TB fight and spent with it.
// Sizing: sim-killersurvive-b — the median killer death fight ends with
// the beast at 33% HP after ~9.5 rounds, so +50% damage/round flips it.
// Guardrails under test: no first-kill effect (the edge arms at the kill,
// after the killing fight), no claim on wave 1-3 fights, no effect on a
// wave-3 target, spent on fight entry even if fled, re-arms on a new kill.
// Drives REAL fights (startCombat via K.fight) and measures tbDamage deltas
// in-fight, so the multiplier chain (feast/overcharge/etc.) is shared by
// both legs of every comparison and only the edge differs.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('nextfight-a');

function scholarVid(Game) { return Game.villagerId; }

(async () => {
  // ---- 1. ARMING: wave-4+ kills arm, wave-3 kills do not. ----
  T.section('1. arming in recordWaveKill');
  {
    const Game = await K.load({ seed: 7101 });
    K.newRun(Game);
    const vid = scholarVid(Game);
    T.ok('no edge before any kill', !Game.state.veteranEdge || !Game.state.veteranEdge[vid]);
    Game.recordWaveKill('redactor', vid, 'player', null);
    T.ok('wave-3 kill arms nothing', !Game.state.veteranEdge || !Game.state.veteranEdge[vid]);
    Game.recordWaveKill('eulogy', vid, 'player', null);
    T.ok('wave-4 kill arms the edge', !!(Game.state.veteranEdge && Game.state.veteranEdge[vid]));
    const log = (Game.state.waveKillLog || []).filter(e => e && e.mid === 'eulogy' && e.by === vid);
    T.ok('wave-4 kill logged (by=scholar vid, w=4)', log.length === 1 && log[0].w === 4, 'entries ' + log.length);
    Game.recordWaveKill('reunion', vid, 'player', null);
    T.ok('second wave-4 kill keeps the edge armed', !!(Game.state.veteranEdge && Game.state.veteranEdge[vid]));
  }

  // ---- 2. APPLY HOOK in isolation: x1.5 on the veteran's blows only. ----
  T.section('2. tbDamage hook: x1.5 with a claim, x1.0 without');
  {
    const Game = await K.load({ seed: 7102 });
    K.newRun(Game);
    const said = K.captureSays(Game);
    const vid = scholarVid(Game);
    const mf = K.fight(Game, 'eulogy', { hp: 9000, party: false });
    T.ok('solo eulogy fight started', !!Game.tbfight && !!mf, 'mf ' + !!mf);
    T.ok('no claim without an armed edge', !(Game.tbfight.veteranEdge && Game.tbfight.veteranEdge[vid]));
    const hp0 = mf.hp;
    const d0 = Game.tbDamage(mf.key, 100, 'you', null, { quiet: true });
    T.ok('baseline strike lands (>0)', d0 > 0, 'd0 ' + d0 + ' hp ' + hp0 + '->' + mf.hp);
    T.ok('baseline strike has no edge line', !said.some(t => /VETERAN'S EDGE/.test(t)));
    Game.tbfight.veteranEdge = {};
    Game.tbfight.veteranEdge[vid] = true;
    said.length = 0;
    const d1 = Game.tbDamage(mf.key, 100, 'you', null, { quiet: true });
    T.ok('claimed strike deals x1.5', d1 === Math.round(d0 * 1.5), 'd0 ' + d0 + ' d1 ' + d1);
    T.ok('edge line said once', said.filter(t => /VETERAN'S EDGE/.test(t)).length === 1, said.filter(t => /VETERAN'S EDGE/.test(t)).length + ' lines');
    delete Game.tbfight.veteranEdge[vid];
    const d2 = Game.tbDamage(mf.key, 100, 'you', null, { quiet: true });
    T.ok('claim removed: back to x1.0', d2 === d0, 'd2 ' + d2 + ' d0 ' + d0);
    T.ok('no second edge line', said.filter(t => /VETERAN'S EDGE/.test(t)).length === 1);
    T.ok('monster still standing (no accidental kill)', mf.alive && mf.hp > 0, 'hp ' + mf.hp);
    Game.tbEnd('fled');
  }

  // ---- 3. CLAIM at fight start (scholar): wave-4 claims, then spent. ----
  T.section('3. claim at startCombat: wave-4 fight claims and spends');
  {
    const Game = await K.load({ seed: 7103 });
    K.newRun(Game);
    const vid = scholarVid(Game);
    let mf = K.fight(Game, 'eulogy', { hp: 9000, party: false });
    const d0 = Game.tbDamage(mf.key, 100, 'you', null, { quiet: true });
    Game.tbEnd('fled');
    Game.recordWaveKill('eulogy', vid, 'player', null);
    T.ok('edge armed after the kill', !!(Game.state.veteranEdge && Game.state.veteranEdge[vid]));
    mf = K.fight(Game, 'eulogy', { hp: 9000, party: false });
    T.ok('wave-4 fight claims the edge', !!(Game.tbfight.veteranEdge && Game.tbfight.veteranEdge[vid]));
    T.ok('claim removes it from state', !(Game.state.veteranEdge && Game.state.veteranEdge[vid]));
    const d1 = Game.tbDamage(mf.key, 100, 'you', null, { quiet: true });
    T.ok('claimed fight strikes at x1.5', d1 === Math.round(d0 * 1.5), 'd0 ' + d0 + ' d1 ' + d1);
    // Spent on entry: flee, and the next wave-4 fight has no edge.
    Game.tbEnd('fled');
    T.ok('edge stays spent after fleeing', !(Game.state.veteranEdge && Game.state.veteranEdge[vid]));
    mf = K.fight(Game, 'eulogy', { hp: 9000, party: false });
    T.ok('next wave-4 fight has no edge', !(Game.tbfight.veteranEdge && Game.tbfight.veteranEdge[vid]));
    const d2 = Game.tbDamage(mf.key, 100, 'you', null, { quiet: true });
    T.ok('unclaimed strike back to x1.0', d2 === d0, 'd2 ' + d2 + ' d0 ' + d0);
    Game.tbEnd('fled');
    // Re-arm on a new kill.
    Game.recordWaveKill('reunion', vid, 'player', null);
    mf = K.fight(Game, 'reunion', { hp: 9000, party: false });
    T.ok('second kill re-arms; reunion fight claims it', !!(Game.tbfight.veteranEdge && Game.tbfight.veteranEdge[vid]));
    Game.tbEnd('fled');
  }

  // ---- 4. NO CLAIM on wave 1-3 fights; the edge waits. ----
  T.section('4. wave-3 / wave-2 fights do not claim the edge');
  {
    const Game = await K.load({ seed: 7104 });
    K.newRun(Game);
    const vid = scholarVid(Game);
    let mf = K.fight(Game, 'redactor', { hp: 9000, party: false });
    const d0 = Game.tbDamage(mf.key, 100, 'you', null, { quiet: true });
    Game.tbEnd('fled');
    Game.recordWaveKill('eulogy', vid, 'player', null);
    mf = K.fight(Game, 'redactor', { hp: 9000, party: false });
    T.ok('wave-3 fight claims nothing', !(Game.tbfight.veteranEdge && Game.tbfight.veteranEdge[vid]));
    T.ok('edge still armed in state after wave-3 fight', !!(Game.state.veteranEdge && Game.state.veteranEdge[vid]));
    const d1 = Game.tbDamage(mf.key, 100, 'you', null, { quiet: true });
    T.ok('wave-3 target takes unboosted damage', d1 === d0, 'd1 ' + d1 + ' d0 ' + d0);
    Game.tbEnd('fled');
    mf = K.fight(Game, 'voice_mimic_radio', { hp: 9000, party: false });
    T.ok('wave-2 fight claims nothing', !(Game.tbfight.veteranEdge && Game.tbfight.veteranEdge[vid]));
    T.ok('edge still armed in state after wave-2 fight', !!(Game.state.veteranEdge && Game.state.veteranEdge[vid]));
    Game.tbEnd('fled');
    mf = K.fight(Game, 'eulogy', { hp: 9000, party: false });
    T.ok('next wave-4 fight claims the waiting edge', !!(Game.tbfight.veteranEdge && Game.tbfight.veteranEdge[vid]));
    const d2 = Game.tbDamage(mf.key, 100, 'you', null, { quiet: true });
    T.ok('waiting edge still pays x1.5', d2 === Math.round(d0 * 1.5), 'd2 ' + d2 + ' d0 ' + d0);
    Game.tbEnd('fled');
  }

  // ---- 5. COMPANION: a killer companion's own blows get the edge. ----
  T.section('5. companion killer: own strikes boosted, own claim');
  {
    const Game = await K.load({ seed: 7106 });
    K.newRun(Game);
    const said = K.captureSays(Game);
    const svid = scholarVid(Game);
    const roster = (Game.state.village && Game.state.village.roster) || [];
    const cv = roster.find(id => id && id !== svid);
    T.ok('a non-scholar villager exists to companion', !!cv, 'roster ' + roster.length);
    // Park the companion beside the scholar so they join the fight.
    Game.state.village.positions = Game.state.village.positions || {};
    Game.state.village.positions[cv] = { mx: 3, my: 4 };
    Game.state.village.health = Game.state.village.health || {};
    Game.state.village.health[cv] = 9000;
    let mf = K.fight(Game, 'eulogy', { hp: 9000, party: true });
    const cf0 = Game.tbfight.fighters.find(f => f && f.villagerId === cv);
    T.ok('companion joins the fight', !!cf0, 'fighters ' + Game.tbfight.fighters.map(f => f.key).join(','));
    const cname = cf0 ? cf0.name : '?';
    const d0 = Game.tbDamage(mf.key, 100, cname, cf0.key, { quiet: true });
    T.ok('companion baseline strike lands', d0 > 0, 'd0 ' + d0);
    Game.tbEnd('fled');
    Game.recordWaveKill('eulogy', cv, 'companion', null);
    T.ok('companion wave-4 kill arms the companion edge', !!(Game.state.veteranEdge && Game.state.veteranEdge[cv]));
    T.ok('scholar edge untouched by companion kill', !(Game.state.veteranEdge && Game.state.veteranEdge[svid]));
    said.length = 0;
    mf = K.fight(Game, 'eulogy', { hp: 9000, party: true });
    const cf1 = Game.tbfight.fighters.find(f => f && f.villagerId === cv);
    T.ok('companion joins the armed fight', !!cf1);
    T.ok('companion edge claimed into the fight', !!(cf1 && Game.tbfight.veteranEdge && Game.tbfight.veteranEdge[cv]));
    const d1 = cf1 ? Game.tbDamage(mf.key, 100, cname, cf1.key, { quiet: true }) : 0;
    T.ok("companion's own strikes deal x1.5", d1 === Math.round(d0 * 1.5), 'd0 ' + d0 + ' d1 ' + d1);
    T.ok('edge line names the companion', said.some(t => /VETERAN'S EDGE/.test(t) && t.indexOf(cname) >= 0), said.filter(t => /VETERAN'S EDGE/.test(t)).join(' | '));
    Game.tbEnd('fled');
  }

  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
