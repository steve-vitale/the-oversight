#!/usr/bin/env node
// probe-inherited-thread-20261020.js — one-off diagnostic for r31: does a
// thread planted with the predecessor (a) stay open at death, (b) get the
// inh stamp at playerDeath, (c) resume as "You're wearing X's shoes now"
// when driven post-death? Replays the 9602 profile shape.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '9602', 10);
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }

function dumpThreads(Game, vid, label) {
  const v = Game.state.village || {};
  let totalOpen = 0, totalLapsed = 0;
  for (const k of Object.keys(v.topicLog || {})) {
    const L = v.topicLog[k] || {};
    totalOpen += (L.open || []).length;
    totalLapsed += (L.lapsed || []).length;
  }
  console.error(`${label}: village-wide ${totalOpen} open / ${totalLapsed} lapsed threads`);
  const L = (v.topicLog || {})[vid] || {};
  const open = (L.open || []).map(o => ({ label: o.label || o.topic || o.tid, day: o.day, inh: o.inh || null, pred: Game.inheritedName ? Game.inheritedName(o) : '?' }));
  console.error(`${label}: ${open.length} open threads for ${firstName(rawName(Game, vid))}`);
  for (const o of open.slice(0, 8)) console.error(`   ${JSON.stringify(o)}`);
  const seeds = Object.keys(v.convoSeeds || {}).filter(s => { const sd = v.convoSeeds[s] || {}; return sd.vid === vid; });
  console.error(`${label}: ${seeds.length} convoSeeds for vid`);
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'probe-inherited-thread', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  for (let d = 1; d <= 9; d++) { if (!Game.over) await runDays(Game, competent, { days: 1 }); }
  const v = Game.state.village || {};
  const bearer0 = Game.villagerId;
  const tgt = (v.roster || []).find(id => id !== bearer0);
  E(`bearer <redacted> ${firstName(rawName(Game, bearer0))}, planting with ${firstName(rawName(Game, tgt))}`);
  // plant: open a convo and run a few turns like the driver
  Game.startConvo(tgt);
  for (let t = 0; t < 8; t++) {
    const choices = Game.convoChoices(tgt) || [];
    if (!choices.length) break;
    const wantC = choices.find(x => /^want:/.test(x.id)) || choices.find(x => !/^(leave|bye|goodbye)/.test(x.id));
    if (!wantC || /^(leave|bye|goodbye)/.test(wantC.id)) break;
    Game.convoTurn(tgt, wantC.id);
    const cc = Game.convoGet(tgt);
    if (!cc || !cc.active) break;
  }
  try { Game.endConvo(tgt, 'left'); } catch (e) {}
  dumpThreads(Game, tgt, 'PRE-DEATH');
  const oldFirst = firstName(rawName(Game, bearer0));
  Game.playerDeath('a hushwolf');
  const newFirst = firstName(rawName(Game, Game.villagerId));
  E(`death: ${oldFirst} -> ${newFirst}`);
  dumpThreads(Game, tgt, 'POST-DEATH');
  // drive a convo with the plant NPC and look for the inherited resume
  Game.startConvo(tgt);
  let fired = false;
  for (let t = 0; t < 12; t++) {
    const choices = Game.convoChoices(tgt) || [];
    if (!choices.length) break;
    const th = choices.find(x => /thread/i.test(x.id)) || choices.find(x => !/^(leave|bye|goodbye)/.test(x.id));
    if (!th || /^(leave|bye|goodbye)/.test(th.id)) break;
    Game.convoTurn(tgt, th.id);
    const cc = Game.convoGet(tgt);
    const tr = ((cc && cc.transcript) || []).map(e2 => String(e2.text || ''));
    if (tr.some(l => /wearing .*?'s shoes now/.test(l) || /never did finish talking about/.test(l) && new RegExp(oldFirst).test(l))) { fired = true; E('INHERITED RESUME FIRED at turn ' + t); break; }
    if (!cc || !cc.active) break;
  }
  const cc = Game.convoGet(tgt);
  const tr = ((cc && cc.transcript) || []).map(e2 => `${e2.who === 'you' ? 'YOU' : 'NPC'}: ${String(e2.text).slice(0, 220)}`);
  E('--- driven convo transcript ---');
  for (const l of tr.slice(-10)) E(l);
  E(`INHERITED-RESUME fired: ${fired}`);
  try { Game.endConvo(tgt, 'left'); } catch (e) {}
}
main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
