#!/usr/bin/env node
// test-succession-ownrecord-20261016.js — journey-succession r15 proof test.
// BLANK (r15): the handoff never named the successor's OWN record as a
// villager — the inheritance formula's own-record term (own*0.4) was invisible
// in the fiction. The handoff named only the dead bearer's trust in them
// ("Cameron trusted them"), or nothing at all when nobody vouched. Fix: when
// the successor stood real with the village as a villager (own trust >= 40),
// the handoff says so — "The fire knew <name> before the Codex did."
// RED on pristine (patch-swap), GREEN post-fix. Usage:
//   SEEDS=731,732,733 node scripts/test-succession-ownrecord-20261016.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

function parseSeeds() {
  const s = process.env.SEEDS || '731,732,733';
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

async function deathWithTrust(Game, seed, succTrust, otherTrust) {
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  Game.sysSay = (t) => { says.push(String(t)); };
  const oldId = Game.villagerId;
  const cands = Game.npcIds().filter(id => id !== oldId);
  const succId = cands[0], otherId = cands[1];
  const v = Game.state.village;
  v.trust = {};
  for (const id of cands) v.trust[id] = 5;
  v.trust[oldId] = 20;
  v.trust[succId] = succTrust;
  if (otherId) v.trust[otherId] = otherTrust;
  Game.playerDeath('a hushwolf');
  return { says, oldId, succId, newId: Game.villagerId, over: Game.over,
           newFirst: (charOf(Game, Game.villagerId).name || '').split(' ')[0],
           oldFirst: (charOf(Game, oldId).name || '').split(' ')[0] };
}

function ownRecordLines(says, newFirst) {
  return says.filter(t => t.includes('The fire knew') && t.includes(newFirst));
}

async function playSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'test-ownrecord-r15', fullTelemetry: true });
  Game.say = () => {}; Game.sysSay = () => {};
  await setupGame(Game);
  await runDays(Game, competent, { days: 4 });
  if (Game.over) { ok(`seed${seed}-alive`, false, 'village died before day 4'); return; }

  // --- HIGH tier (own 80): own-record line + vouch line co-fire ---
  {
    const r = await deathWithTrust(Game, seed, 80, 62);
    ok(`seed${seed}-high-mantle`, r.newId === r.succId && !r.over, `successor=${r.newFirst}`);
    const lines = ownRecordLines(r.says, r.newFirst);
    ok(`seed${seed}-high-line`, lines.length === 1, `own-record lines=${lines.length}`);
    ok(`seed${seed}-high-tier`, lines[0] && /carried weight/.test(lines[0]), `line=[${lines[0] || ''}]`.slice(0, 120));
    ok(`seed${seed}-high-notold`, lines[0] && !lines[0].includes(r.oldFirst), 'dead bearer not named in own-record line');
    ok(`seed${seed}-high-vouch`, r.says.some(t => /speaks? for/.test(t) && t.includes('grave')), 'vouch line co-fires');
    ok(`seed${seed}-high-page`, r.says.some(t => t.includes('The Codex turns a page')), 'turns-a-page line intact');
    ok(`seed${seed}-high-mirror`, r.says.some(t => t.includes('You wake up somebody else')), 'mirror line intact');
  }
}

async function playSeedMid(seed) {
  const { Game } = await loadGame({ seed: seed + 1000, mode: 'test-ownrecord-r15m', fullTelemetry: true });
  Game.say = () => {}; Game.sysSay = () => {};
  await setupGame(Game);
  await runDays(Game, competent, { days: 4 });
  if (Game.over) { ok(`seed${seed}-mid-alive`, false, 'village died before day 4'); return; }
  // --- MID tier (own 50): solid-ground line, no vouch, no high-tier wording ---
  {
    const r = await deathWithTrust(Game, seed, 50, 10);
    const lines = ownRecordLines(r.says, r.newFirst);
    ok(`seed${seed}-mid-line`, lines.length === 1, `own-record lines=${lines.length}`);
    ok(`seed${seed}-mid-tier`, lines[0] && /solid ground/.test(lines[0]) && !/carried weight/.test(lines[0]),
      `line=[${lines[0] || ''}]`.slice(0, 120));
    ok(`seed${seed}-mid-novouch`, !r.says.some(t => /speaks? for/.test(t) && t.includes('grave')), 'no vouch line (nobody >= 60)');
  }
}

async function playSeedLow(seed) {
  const { Game } = await loadGame({ seed: seed + 2000, mode: 'test-ownrecord-r15l', fullTelemetry: true });
  Game.say = () => {}; Game.sysSay = () => {};
  await setupGame(Game);
  await runDays(Game, competent, { days: 4 });
  if (Game.over) { ok(`seed${seed}-low-alive`, false, 'village died before day 4'); return; }
  // --- LOW tier (own 15): no own-record line at all ---
  {
    const r = await deathWithTrust(Game, seed, 15, 10);
    const lines = ownRecordLines(r.says, r.newFirst);
    ok(`seed${seed}-low-none`, lines.length === 0, `own-record lines=${lines.length}`);
    ok(`seed${seed}-low-page`, r.says.some(t => t.includes('The Codex turns a page')), 'turns-a-page line intact');
  }
}

(async () => {
  for (const seed of parseSeeds()) {
    try {
      await playSeed(seed);
      await playSeedMid(seed);
      await playSeedLow(seed);
    } catch (e) {
      ok(`seed${seed}-threw`, false, String((e && e.message) || e));
    }
  }
  console.log(fails === 0 ? 'ALL GREEN' : `${fails} FAILURES`);
  process.exit(fails === 0 ? 0 : 1);
})();
