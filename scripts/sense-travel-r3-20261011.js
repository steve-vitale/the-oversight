#!/usr/bin/env node
// sense-travel-r3-20261011.js — SENSE-TESTING transcript capture (travel lever r3).
// Steve 2026-10-11: read transcripts, don't just count.
// Part 1: replay seed 1 (the sweep's belong-beat seed) with say-capture —
//   extract the Regional Dawn, the staged+answered Binding beat, trader
//   polity news, and any schism lines, in order, with day stamps.
// Part 2: schism sense — force all 5 causes on a fresh game, deliver the
//   rumor, walk up to the new fire (first-sight line). Read as a player.
// Part 3: the Watchers — stage + answer 'champion' and 'decline' (fresh
//   games). The beat never fires organically in sims; the copy still has
//   to feel like a moment.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { winseek } = require('./policies/winseek');

function capture(Game) {
  const say = [];
  const osay = Game.say;
  Game.say = function (m) {
    if (typeof m === 'string') {
      let day = 0;
      try { day = (Game.state.scholar || {}).day || 0; } catch (e) {}
      say.push('[d' + day + '] ' + m);
    }
    return osay.apply(this, arguments);
  };
  return say;
}
const FILTER = /dawn|network|four fires|first court|court|binding|oath|covenant|council|charter|iron court|watchers|broadcast|split|schism|red table|hungry road|bloodied|quiet ones|cast out|new fire|smoke on the horizon|bound itself|map is being redrawn|realm came apart|refuse the scale|free fire/i;

async function part1() {
  console.log('############ PART 1: seed-1 organic replay (belong beat) ############');
  const { Game } = await loadGame({ seed: 1, mode: 'travelwinseek', fullTelemetry: false });
  await setupGame(Game);
  const say = capture(Game);
  const policy = Object.assign({}, winseek, { id: 'travelwinseek' });
  const res = await runDays(Game, policy, { days: 200 });
  console.log(`ended: days=${res.days} reason=${res.endReason}`);
  const hits = say.filter(m => FILTER.test(m));
  console.log(`captured ${say.length} say lines, ${hits.length} scale/schism-relevant:\n`);
  for (const m of hits) console.log(m + '\n');
}

async function part2() {
  console.log('############ PART 2: schism sense, all 5 causes ############');
  const CAUSES = ['cannibal', 'famine-flight', 'hardline', 'peaceful', 'succession-loser'];
  for (const cause of CAUSES) {
    const { Game } = await loadGame({ seed: 4242, mode: 'senseschism', fullTelemetry: false });
    await setupGame(Game);
    const say = capture(Game);
    const v = Game.state.otherVillages[0];
    v.rumored = true; // the rumor pipeline only carries known fires
    const res = Game.fireSplinter(v.id, cause);
    const nv = res && res.newVillage;
    // let the rumor deliver (1/day, delayed a few days)
    const idle = { id: 'idle', daily() {} };
    await runDays(Game, idle, { days: 8 });
    // walk up to the new fire: first-sight line
    if (nv) {
      try {
        Game.map.px = Math.max(0, Math.min(8, nv.x - 1));
        Game.map.py = Math.max(0, Math.min(8, nv.y));
        Game.checkVillageProximity();
      } catch (e) { console.log('proximity ERR: ' + e.message); }
    }
    console.log(`\n---- cause: ${cause} | parent: ${v.name} | new fire: ${nv && nv.name} ----`);
    for (const m of say.filter(m => FILTER.test(m))) console.log(m + '\n');
  }
}

async function part3() {
  console.log('############ PART 3: the Watchers (champion + decline) ############');
  for (const how of ['champion', 'decline']) {
    const { Game } = await loadGame({ seed: 7, mode: 'sensewatch', fullTelemetry: false });
    await setupGame(Game);
    const say = capture(Game);
    try { Game.state.village.pantry.push({ name: 'Grain reserve', kcalEach: 1000, units: 60 }); } catch (e) {}
    Game.stageGlobalBeat(45);
    for (const m of say.splice(0).filter(m => /watchers|broadcast|audience|planet/i.test(m))) console.log(m + '\n');
    const r = Game.answerGlobalChoice(how);
    console.log(`answer '${how}' -> ${r}`);
    for (const m of say.splice(0)) console.log(m + '\n');
    console.log('globalLive:', !!Game.state.globalLive, '| rank:', Game.scaleRank());
  }
}

async function main() {
  const which = process.env.PART || '123';
  if (which.includes('1')) await part1();
  if (which.includes('2')) await part2();
  if (which.includes('3')) await part3();
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
