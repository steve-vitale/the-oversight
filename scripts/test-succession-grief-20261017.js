#!/usr/bin/env node
// test-succession-grief-20261017.js — PROOF for journey-succession r23:
// "the successor's own grief."
//
// The handoff never read the successor's personal bond with the dead bearer
// (v.bonds): every successor woke up with the same flat shock. Fix:
//   - close bond (v>=20 or depth>=1) -> grief beat names the person, +5 trauma (15)
//   - hostile bond (v<=-20 or depth<=-1) -> complexity beat names it, trauma stays 10
//   - neutral -> silence, trauma 10 (unchanged)
//   - convo half: the mantle-memory mourning lines acknowledge the PLAYER's
//     loss ("I know you and X were close. I'm sorry.") when the bond was close.
//
// RED: revert src/js/ledger.js + src/js/convoTopics.js (patch-file round
// trip, never stash) -> the new assertions fail. GREEN: re-apply -> all pass.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const caseId=process.argv[2];

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; /* console.log('ok:', name); */ }
  else { fail++; console.error('FAIL:', name); }
}
function firstName(Game, vid) {
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name.split(' ')[0]; } catch (e) {}
  return String(vid).slice(0, 8);
}

// One handoff: fresh game, forced successor, scripted bond, real playerDeath.
async function handoffCase(seed, bondV, bondDepth) {
  const { Game } = await loadGame({ seed, mode: 'succession-grief-proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const others = (v.roster || []).filter(id => id !== oldId);
  const succ = others[0];
  v.trust = v.trust || {};
  for (const id of others) v.trust[id] = 10;
  v.trust[succ] = 100;
  v.bonds = v.bonds || {};
  v.bonds[Game.bondKey(oldId, succ)] = { v: bondV, depth: bondDepth, day: 1, dayGain: 0 };
  const said = [];
  const _say = Game.say;
  Game.say = function (t) { said.push(String(t || '')); return _say ? _say.call(this, t) : undefined; };
  Game.playerDeath('test-cause');
  Game.say = _say;
  return {
    Game, oldId, succ,
    choseRight: Game.villagerId === succ,
    trauma: Game.state.scholar.trauma,
    griefBeats: said.filter(t => /not the office, the person/.test(t)),
    hostileBeats: said.filter(t => /never found easy ground/.test(t)),
  };
}

// One convo-half probe: stub the bearer-branch mourning event, read the lines.
async function convoCase(seed, bondV) {
  const { Game } = await loadGame({ seed, mode: 'succession-grief-proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const others = (v.roster || []).filter(id => id !== oldId);
  const succ = others[0], npc = others[1];
  v.trust = v.trust || {};
  for (const id of others) v.trust[id] = 10;
  v.trust[succ] = 100;
  v.bonds = v.bonds || {};
  v.bonds[Game.bondKey(oldId, succ)] = { v: bondV, depth: bondV >= 20 ? 2 : 0, day: 1, dayGain: 0 };
  Game.playerDeath('test-cause');
  const oldFirst = firstName(Game, oldId);
  Game.t2LatelyEvent = function () { return { kind: 'mourning', name: oldFirst, bearer: true, bearerId: oldId }; };
  const lines = Game.t2gen_lately(npc) || [];
  return { lines, ack: lines.filter(l => /were close\. I'm sorry/i.test(l)) };
}

async function main() {
  // 1. CLOSE bond -> grief beat once, trauma 15
  if (caseId === "close") {
    const r = await handoffCase(701, 55, 2);
    ok(r.choseRight, 'close: successor chosen by trust');
    ok(r.trauma === 15, `close: trauma 15 (got ${r.trauma})`);
    ok(r.griefBeats.length === 1, `close: grief beat fires exactly once (got ${r.griefBeats.length})`);
    ok(r.hostileBeats.length === 0, 'close: no hostile beat');
    ok(/Aurora|Blanca|João|Domingo|Booker|Anjali|Vincent|Aubrey|Abdelaziz|\b\w+\b/.test(r.griefBeats[0] || '') && /not the office, the person/.test(r.griefBeats[0] || ''), 'close: beat names the person, not the office');
    ok(/\(\+5 trauma\)/.test(r.griefBeats[0] || ''), 'close: beat names the +5 trauma');
  }
  // 2. HOSTILE bond -> hostile beat once, trauma stays 10
  if (caseId === "hostile") {
    const r = await handoffCase(702, -45, -2);
    ok(r.choseRight, 'hostile: successor chosen by trust');
    ok(r.trauma === 10, `hostile: trauma stays 10 (got ${r.trauma})`);
    ok(r.hostileBeats.length === 1, `hostile: hostile beat fires exactly once (got ${r.hostileBeats.length})`);
    ok(r.griefBeats.length === 0, 'hostile: no grief beat');
  }
  // 3. NEUTRAL bond -> silence, trauma 10 (old behavior preserved)
  if (caseId === "neutral") {
    const r = await handoffCase(703, 0, 0);
    ok(r.choseRight, 'neutral: successor chosen by trust');
    ok(r.trauma === 10, `neutral: trauma stays 10 (got ${r.trauma})`);
    ok(r.griefBeats.length === 0 && r.hostileBeats.length === 0, 'neutral: no grief/hostile beat');
  }
  // 4. DEPTH-only close (sediment of a long quiet friendship) -> grief path
  if (caseId === "depth-close") {
    const r = await handoffCase(704, 5, 1);
    ok(r.griefBeats.length === 1, 'depth-only: grief beat fires on depth>=1');
    ok(r.trauma === 15, `depth-only: trauma 15 (got ${r.trauma})`);
  }
  // 5. DEPTH-only hostile -> hostile path
  if (caseId === "depth-hostile") {
    const r = await handoffCase(705, -5, -1);
    ok(r.hostileBeats.length === 1, 'depth-only hostile: hostile beat fires on depth<=-1');
    ok(r.trauma === 10, `depth-only hostile: trauma stays 10 (got ${r.trauma})`);
  }
  // 6. CONVO half: close bond -> acknowledgment line offered
  if (caseId === "convo-close") {
    const r = await convoCase(706, 55);
    ok(r.ack.length === 1, `convo close: acknowledgment line offered exactly once (got ${r.ack.length})`);
    ok(r.lines.length >= 2, 'convo close: mourning lines still present');
  }
  // 7. CONVO half: neutral bond -> no acknowledgment
  if (caseId === "convo-neutral") {
    const r = await convoCase(707, 0);
    ok(r.ack.length === 0, 'convo neutral: no acknowledgment line');
    ok(r.lines.length >= 1, 'convo neutral: mourning lines still present');
  }
  // 8. CONVO half: hostile bond -> no acknowledgment (the village doesn't pry)
  if (caseId === "convo-hostile") {
    const r = await convoCase(708, -45);
    ok(r.ack.length === 0, 'convo hostile: no acknowledgment line');
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

if (caseId) {
  if (!["close","hostile","neutral","depth-close","depth-hostile","convo-close","convo-neutral","convo-hostile"].includes(caseId)) throw Error('Unknown proof case '+caseId);
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
} else {
  // One harness per process: module/global state survives repeated loads.
  const cp=require('child_process');let total=0;
  for (const id of ["close","hostile","neutral","depth-close","depth-hostile","convo-close","convo-neutral","convo-hostile"]) {
    const r=cp.spawnSync(process.execPath,[__filename,id],{encoding:'utf8',env:process.env});
    const counts=(r.stdout || '').match(/(\d+) passed, (\d+) failed/);
    if(r.status!==0 || !counts || Number(counts[2])!==0){console.error(id,r.stdout,r.stderr);process.exitCode=1;break;}
    total+=Number(counts[1]);
  }
  if(!process.exitCode)console.log(total+' passed, 0 failed (eight isolated cases)');
}
