#!/usr/bin/env node
// probe-r21-carryover-20261017.js — identify the carried-over ability id on seed 3050.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const SEED = parseInt(process.env.SEED || '3050', 10);

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function abIds(Game) { return ((Game.state.scholar || {}).abilities || []).map(a => a && (a.id || a)); }

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r21-probe', fullTelemetry: false });
  await setupGame(Game);
  const E = console.error;
  // phase 1 -> d14 kill1
  await runDays(Game, competent, { days: 12 });
  E(`d${dayOf(Game)} kill1: bearer=${firstName(rawName(Game, Game.villagerId))} abilities=${JSON.stringify(abIds(Game))}`);
  const b1 = Game.villagerId;
  Game.playerDeath('the expedition');
  const b2 = Game.villagerId;
  E(`d${dayOf(Game)} mantle1: ${firstName(rawName(Game, b1))} -> ${firstName(rawName(Game, b2))} | npcAbilities[${b2.slice(0,8)}] was cleared=${!((Game.state.village.npcAbilities || {})[b2])}`);
  E(`   scholar.abilities after mantle1: ${JSON.stringify(abIds(Game))}`);
  // phase 2 -> d26 (expect natural death d16 per the r21 run)
  for (let i = 0; i < 14 && !Game.over && dayOf(Game) < 26; i++) await runDays(Game, competent, { days: 1 });
  E(`d${dayOf(Game)} pre-kill2: bearer=${firstName(rawName(Game, Game.villagerId))} abilities=${JSON.stringify(abIds(Game))}`);
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  E(`lineage: ${lin.map(e => `${(e.name||'?').split(' ')[0]} d${e.day} (${e.cause||e.outcome||'?'})`).join(' -> ')}`);
  const v = Game.state.village || {};
  const b3cand = Game.villagerId;
  // Pania's own npcAbilities BEFORE the second mantle (the record mantleBecome will read)
  let paniaId = null;
  try {
    const trust = v.trust || {};
    const cands = (Game.npcIds ? Game.npcIds() : []).filter(id => id !== b3cand);
    cands.sort((a, b) => (trust[b] || 0) - (trust[a] || 0));
    paniaId = cands[0];
    E(`predicted successor: ${firstName(rawName(Game, paniaId))}; their npcAbilities BEFORE mantle2: ${JSON.stringify(((v.npcAbilities || {})[paniaId] || []))}`);
    E(`npcKnacks: ${JSON.stringify((v.npcKnacks || {})[paniaId] || null)}`);
  } catch (e) { E('predict err: ' + e.message); }
  Game.playerDeath('the expedition');
  const b3 = Game.villagerId;
  E(`d${dayOf(Game)} mantle2: ${firstName(rawName(Game, b3cand))} -> ${firstName(rawName(Game, b3))} | scholar.abilities after: ${JSON.stringify(abIds(Game))}`);
  console.log(JSON.stringify({ seed: SEED, ok: true }));
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
