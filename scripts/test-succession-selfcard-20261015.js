#!/usr/bin/env node
// test-succession-selfcard-20261015.js — journey-succession r14 proof test.
// The PEOPLE codex screen excluded the player character (r12 blank): the new
// bearer could never re-read their own backstory after the orientation beat
// scrolled by. peopleJournal must pin a self entry first — name, occupation,
// backstory written in from the char record, no knowledge gates — and after
// a succession the NEW bearer must be the self entry (not the dead one).
//
// RED on pristine (patch-swap), GREEN post-fix. Usage:
//   SEEDS=721,722,723 node scripts/test-succession-selfcard-20261015.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

function parseSeeds() {
  const s = process.env.SEEDS || '721,722,723';
  return s.split(',').map(x => parseInt(x, 10)).filter(Number.isFinite);
}
function charOf(Game, vid) {
  try { return (Game.data.villagers || []).find(x => x.id === vid) || {}; } catch (e) { return {}; }
}

let fails = 0;
function ok(id, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${id}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails++;
}

async function playSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'test-selfcard-r14', fullTelemetry: true });
  Game.say = () => {}; Game.sysSay = () => {};
  await setupGame(Game);
  await runDays(Game, competent, { days: 4 });
  if (Game.over) { ok(`seed${seed}-alive`, false, 'village died before day 4'); return; }

  const selfId = Game.villagerId;
  const ch = charOf(Game, selfId);
  const pj = Game.peopleJournal();
  ok(`seed${seed}-self-pinned`, pj.length > 0 && pj[0].self === true && pj[0].vid === selfId,
    `first entry self=${pj.length && pj[0].self}, vid matches=${pj.length && pj[0].vid === selfId}`);
  ok(`seed${seed}-self-name`, !!(pj[0] && pj[0].e.name && pj[0].e.name.value === ch.name),
    `entry=[${pj[0] && pj[0].e.name && pj[0].e.name.value}] char=[${ch.name}]`);
  ok(`seed${seed}-self-occ`, !!(pj[0] && pj[0].e.occupation && pj[0].e.occupation.value && pj[0].e.occupation.sure === true),
    `occ=[${pj[0] && pj[0].e.occupation && pj[0].e.occupation.value}]`);
  if (ch.backstory) {
    ok(`seed${seed}-self-backstory`, !!(pj[0] && (pj[0].e.backstory || []).some(b => b.text === ch.backstory)),
      `backstory entries=${(pj[0] && (pj[0].e.backstory || []).length) || 0}, char len=${(ch.backstory || '').length}`);
  } else {
    ok(`seed${seed}-self-backstory`, true, `char has no backstory (nothing to show)`);
  }
  ok(`seed${seed}-one-self`, pj.filter(f => f.self).length === 1, `self flags=${pj.filter(f => f.self).length}`);

  // --- succession: the NEW bearer becomes the self entry ---
  const oldId = selfId, oldName = ch.name, oldStory = ch.backstory;
  Game.playerDeath('a hushwolf');
  if (Game.over) { ok(`seed${seed}-post-death`, false, 'game over after scripted death'); return; }
  const newId = Game.villagerId;
  const nch = charOf(Game, newId);
  ok(`seed${seed}-mantle-passes`, newId !== oldId, `${oldName} -> ${nch.name}`);
  const pj2 = Game.peopleJournal();
  ok(`seed${seed}-new-self-pinned`, pj2.length > 0 && pj2[0].self === true && pj2[0].vid === newId,
    `new bearer ${nch.name} is self entry`);
  ok(`seed${seed}-new-self-identity`, !!(pj2[0] && pj2[0].e.name && pj2[0].e.name.value === nch.name),
    `entry=[${pj2[0] && pj2[0].e.name && pj2[0].e.name.value}]`);
  if (nch.backstory) {
    ok(`seed${seed}-new-self-story`, !!(pj2[0] && (pj2[0].e.backstory || []).some(b => b.text === nch.backstory)),
      `new backstory present=${!!(pj2[0] && (pj2[0].e.backstory || []).some(b => b.text === nch.backstory))}`);
    ok(`seed${seed}-no-old-story`, !(pj2[0] && (pj2[0].e.backstory || []).some(b => oldStory && b.text === oldStory)),
      `dead bearer's story absent from self card`);
  } else {
    ok(`seed${seed}-new-self-story`, true, `successor char has no backstory (nothing to show)`);
    ok(`seed${seed}-no-old-story`, true, `successor char has no backstory (nothing to compare)`);
  }
  ok(`seed${seed}-old-not-self`, !pj2.some(f => f.vid === oldId && f.self),
    `old bearer not flagged self`);
}

(async () => {
  for (const seed of parseSeeds()) {
    try { await playSeed(seed); }
    catch (e) { ok(`seed${seed}-threw`, false, String((e && e.stack || e)).split('\n').slice(0, 3).join(' | ')); }
  }
  console.log(fails === 0 ? 'ALL GREEN' : `${fails} FAILURES`);
  process.exit(fails === 0 ? 0 : 1);
})();
