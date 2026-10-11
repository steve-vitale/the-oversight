#!/usr/bin/env node
// PROBE: courtship scoring reality-check (scale leg 2026-10-11).
// Plays seed 20261011 to day 25, then samples Game.judgeLink() 20x:
//   cold, +courtship opinion (+5/+3), and the full counter-band claim.
// Tests the hierarchy.js header claim: "cold proposals usually draw a
// counter-offer in the 35-54 band (judgeLink base 38)".
//
// Usage: node scripts/probe-courtship-20261011.js

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let _s = 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
function resetRng(seed) { _s = seed >>> 0; }
global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global;
const files = [
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js',
  'src/js/convo-mood.js', 'src/js/convo-wants.js',
  'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
  'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js',
  'src/js/contests.js', 'src/js/broadcast.js', 'src/js/contestEngine.js',
  'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
  'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js',
  'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/waveLedger.js',
  'src/js/feastBuff.js', 'src/js/ledger.js', 'src/js/abilityActions.js',
  'src/js/monsterBehaviors.js', 'src/js/partyTactics.js',
  'src/js/sigW3a.js', 'src/js/statusEffects.js', 'src/js/sigW3b.js',
  'src/js/metaProgression.js', 'src/js/sigW3c.js',
  'src/js/villager-agency.js', 'src/js/fieldFights.js',
  'src/js/villager-objectives.js', 'src/js/codex-people.js',
  'src/js/membership.js', 'src/js/havenGrowth.js', 'src/js/hierarchy.js',
  'src/js/comms.js', 'src/js/safetynets.js', 'src/js/villageAgency.js',
  'src/js/debug-scenarios.js', 'src/js/build.js',
];
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window;
const Game = globalThis.Scattering.Game;
const { competent } = require('./policies/competent.js');
const { driveFights, driveContests } = require('./sim-harness.js');

function sample(label, fn, n) {
  const xs = [];
  for (let i = 0; i < (n || 20); i++) xs.push(fn().score);
  xs.sort((a, b) => a - b);
  const band = xs.map(x => x >= 55 ? 'A' : (x >= 35 ? 'C' : 'D')).join('');
  console.log(label, 'min=' + xs[0], 'median=' + xs[10], 'max=' + xs[19], 'bands=' + band);
}

async function main() {
  resetRng(20261011);
  const ctx = {};
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  if (competent.setup) competent.setup(Game, ctx);
  // play to day 25 with the plain competent policy (no regional play)
  for (let day = 1; day <= 25; day++) {
    for (let p = 0; p < 3; p++) {
      try { if (competent.upkeep) competent.upkeep(Game, ctx); } catch (e) {}
      driveFights(Game, competent, ctx);
      driveContests(Game, competent, ctx);
      if (Game.over) break;
      try { Game.tickAction(128); } catch (e) {}
      if (Game.over) break;
    }
    if (Game.over) break;
    try { if (competent.daily) competent.daily(Game, ctx); } catch (e) {}
    try { Game.sleep(); } catch (e) {}
  }
  const target = 'village_0';
  const ov = (Game.state.otherVillages || []).find(v => v.id === target);
  const rep = Game.representative ? Game.representative() : null;
  let repS = 0, ourS = 0, theirS = 0;
  try { repS = rep ? Game.linkStanding(rep.id) : 0; } catch (e) {}
  try { ourS = Game.regionalStanding(); theirS = Game.villageStandingOf(target); } catch (e) {}
  console.log('day 25 state: over=' + !!Game.over, 'known=' + (ov ? Game.knowsVillage(ov) : '?'),
    'opinion=' + (ov && ov.opinion), 'repS=' + repS, 'ourS=' + ourS, 'theirS=' + theirS);
  if (!ov || !Game.knowsVillage(ov)) { console.log('PROBE BLOCKED: village_0 not known at day 25'); return; }

  sample('COLD judgeLink      ', () => Game.judgeLink(target));
  // courtship: join + codex study (+8 opinion total)
  if (ov) ov.opinion = (ov.opinion || 0) + 8;
  sample('COURTED (+8 opin)   ', () => Game.judgeLink(target));
  // asSubordinate (+10, +8 generosity at opinion>=5)
  sample('COURTED subordinate ', () => Game.judgeLink(target, { asSubordinate: true, tributeKcalPerWeek: 4000 }));
  // peer (covenant) path
  if (Game._judgePeer) {
    const xs = [];
    for (let i = 0; i < 20; i++) xs.push(Game._judgePeer(target).score);
    xs.sort((a, b) => a - b);
    const band = xs.map(x => x >= 55 ? 'A' : (x >= 35 ? 'C' : 'D')).join('');
    console.log('PEER _judgePeer      ', 'min=' + xs[0], 'median=' + xs[10], 'max=' + xs[19], 'bands=' + band);
  }
  console.log('band key: A=accept(>=55) C=counter(35-54) D=decline(<35)');
}
main().catch(e => { console.error('PROBE ERROR:', e); process.exit(2); });
