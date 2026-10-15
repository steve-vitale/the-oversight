#!/usr/bin/env node
// test-invite-reward-grammar-20261015.js — PROOF for the crisis-leg r10 blank:
//
// "you digs up a wrapped bundle" — inviteReward built its reward lines with
// third-person verbs on the whoTag, but whoTag returns 'you' when the PLAYER
// is the inviter (the player walks an NPC out and shares their own secret).
// BEFORE: "you digs up", "you has been stockpiling", "you stops and actually
// teaches you something", "you presses something into your hand".
// AFTER: verbs agree with the tag, and the gift direction mirrors
// (player-inviter teaches/gives the NPC; NPC-inviter teaches/gives you).
//
// Uses the shared kit (scripts/godpath/lib.js). Seeded via the kit.
// Usage: node scripts/test-invite-reward-grammar-20261015.js
'use strict';
const { load, newRun } = require('./godpath/lib');

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; fails.push(name + (extra ? ' :: ' + extra : '')); }
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name);
}

async function main() {
  const Game = await load({ seed: 20261015 });
  newRun(Game);
  const playerVid = Game.villagerId;
  const npcVid = (Game.state.village.roster || []).find(id => id !== playerVid);
  if (!npcVid) { console.log('FAIL setup: no NPC on roster'); process.exit(1); }
  const npcFirst = String(Game.displayName(npcVid)).split(' ')[0];
  console.log('player tag: ' + Game.whoTag(playerVid) + ' | npc tag: ' + Game.whoTag(npcVid));

  // collect one reward line per kind per inviter (kind is RNG-picked)
  const seen = { you: {}, npc: {} };
  for (let i = 0; i < 60 && (Object.keys(seen.you).length < 4 || Object.keys(seen.npc).length < 4); i++) {
    const a = Game.inviteReward(playerVid);
    const b = Game.inviteReward(npcVid);
    if (a && !seen.you[a.kind]) seen.you[a.kind] = a.line;
    if (b && !seen.npc[b.kind]) seen.npc[b.kind] = b.line;
  }
  ok(Object.keys(seen.you).length === 4, 'all 4 kinds observed (player inviter)', JSON.stringify(Object.keys(seen.you)));
  ok(Object.keys(seen.npc).length === 4, 'all 4 kinds observed (npc inviter)', JSON.stringify(Object.keys(seen.npc)));

  const badYou = [/you digs\b/, /you has been\b/, /you stops\b/, /you presses\b/];
  for (const k of Object.keys(seen.you)) {
    const line = seen.you[k];
    ok(!badYou.some(rx => rx.test(line)), `player/${k}: no third-person verb on 'you'`, line.slice(0, 120));
  }
  // positive shape per kind (player inviter)
  ok(/you dig up a wrapped bundle/.test(seen.you.cache || ''), 'player/cache: "you dig up"', (seen.you.cache || '').slice(0, 100));
  ok(/you have been stockpiling/.test(seen.you.bundle || ''), 'player/bundle: "you have been"', (seen.you.bundle || '').slice(0, 100));
  ok(/you stop and actually teach them/.test(seen.you.knowledge || ''), 'player/knowledge: teaches THEM', (seen.you.knowledge || '').slice(0, 100));
  ok(/You press something into their hand/.test(seen.you.item || ''), 'player/item: presses into THEIR hand', (seen.you.item || '').slice(0, 100));
  // npc inviter keeps the original direction (tag may be a descriptor
  // pre-System, e.g. "the person in their 50s, ..., the paramedic" — the
  // verb still agrees in the third person)
  ok(/digs up a wrapped bundle/.test(seen.npc.cache || ''), 'npc/cache: third-person "digs up"', (seen.npc.cache || '').slice(0, 100));
  ok(/has been stockpiling/.test(seen.npc.bundle || ''), 'npc/bundle: third-person "has been"', (seen.npc.bundle || '').slice(0, 100));
  ok(/actually teaches you something/.test(seen.npc.knowledge || ''), 'npc/knowledge: teaches YOU', (seen.npc.knowledge || '').slice(0, 100));
  ok(/presses something into your hand/.test(seen.npc.item || ''), 'npc/item: into YOUR hand', (seen.npc.item || '').slice(0, 100));

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fails.length) { console.log('failures:'); fails.forEach(f => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
