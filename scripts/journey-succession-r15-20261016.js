#!/usr/bin/env node
// journey-succession-r15-20261016.js — SUCCESSION LEG (7) r15: "the second life"
//
// Pre-registered (evidence/2026-10-16/journey-succession-r15.md): the mantle
// passes; the successor was a villager with their own past. Does the game
// honor that — or does the village treat them as a stranger?
//   (A) HANDOFF AUDIT: capture every death/transfer say-line. Is the
//       successor's OWN record (their work, their standing as a villager)
//       ever named, or is the fiction only about the dead bearer?
//   (B) FIRST-WEEK CONVERSATION AUDIT: two conversations per seed — one with
//       the highest-trust living villager, one with the living villager whose
//       memory record mentions the new bearer most (their "old associate").
//       Sense-tested against the conversation quality bar + no-fabricated-
//       history (r12) + no stranger-treatment of a known face.
// Binding metric: PASS/FAIL per transcript; GO = all 6 PASS; any FAIL ->
// blank documented, fix drafted if safe. Census + handoff capture.
// Horizon: 16d competent + scripted death (r14 substrate) + 10d tail.
// Seeds: 731,732,733. Policy: competent.
// Usage: SEEDS=731,732,733 DAYS2=10 node scripts/journey-succession-r15-20261016.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const DAYS1 = parseInt(process.env.DAYS1 || '16', 10);
const DAYS2 = parseInt(process.env.DAYS2 || '10', 10);
function parseSeeds() {
  const s = process.env.SEEDS || '731,732,733';
  return s.split(',').map(x => parseInt(x, 10)).filter(Number.isFinite);
}
function charOf(Game, vid) {
  try { return (Game.data.villagers || []).find(x => x.id === vid) || {}; } catch (e) { return {}; }
}
function nameOf(Game, vid) {
  const c = charOf(Game, vid);
  return c.name || String(vid).slice(0, 12);
}

function captureConvo(Game, seed, talked, label, endDay) {
  const out = [`## seed ${seed} ${label}: bearer [${nameOf(Game, Game.villagerId)}] talks to ${nameOf(Game, talked)} (trust ${(Game.state.village.trust || {})[talked] || 0}), day ${endDay}`];
  const seen = new Set();
  try {
    Game.startConvo(talked);
    for (let t = 0; t < 16; t++) {
      const choices = Game.convoChoices(talked) || [];
      if (!choices.length) { out.push('(no choices)'); break; }
      const live = choices.filter(c => !/^(betrayal:|leave|bye|goodbye)/.test(c.id));
      let pick = live.find(c => !seen.has(c.id)) || live.find(c => !/^(leave|bye|goodbye)/.test(c.id));
      if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
      seen.add(pick.id);
      out.push(`> YOU [${pick.id}] ${(pick.text || pick.label || '').slice(0, 90)}`);
      try { Game.convoTurn(talked, pick.id); } catch (e) { out.push('(turn threw: ' + e.message + ')'); break; }
      const c = Game.convoGet(talked);
      if (!c || !c.active) { out.push('(ended by engine)'); break; }
    }
    try { Game.endConvo(talked, 'left'); } catch (e) {}
    const c = Game.convoGet(talked);
    out.push('### FULL TRANSCRIPT');
    for (const e of ((c && c.transcript) || [])) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`);
  } catch (e) { out.push('(convo threw: ' + e.message + ')'); }
  return out.join('\n');
}

async function playSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'journey-succession-r15', fullTelemetry: true });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  Game.sysSay = (t) => { says.push(String(t)); };
  await setupGame(Game);
  const rec = { seed, census: {}, handoff: {}, convo: [] };

  await runDays(Game, competent, { days: DAYS1 });
  if (Game.over) { rec.census = { error: 'village died before death script' }; return rec; }
  const oldId = Game.villagerId, oldName = nameOf(Game, oldId), oldFirst = oldName.split(' ')[0];
  const deathDay = (Game.state.scholar || {}).day;
  const trustBefore = Object.assign({}, Game.state.village.trust || {});

  const handoffMark = says.length;
  Game.playerDeath('a hushwolf');
  if (Game.over) { rec.census = { error: 'game over on scripted death' }; return rec; }
  const newId = Game.villagerId, newName = nameOf(Game, newId), newFirst = newName.split(' ')[0];
  rec.death = { day: deathDay, oldBearer: oldName, newBearer: newName };
  rec.trustBefore = { old: trustBefore[oldId], new: trustBefore[newId] };

  // two days of aftermath for burial/recovery beats
  for (let d = 0; d < 2; d++) await runDays(Game, competent, { days: 1 });
  const handoffLines = says.slice(handoffMark);
  const newBearerLines = handoffLines.filter(t => t.includes(newFirst));
  rec.handoff = {
    totalLines: handoffLines.length,
    vouched: handoffLines.some(t => /speaks? for/.test(t) && t.includes('grave')),
    youreNotHer: handoffLines.some(t => t.includes("You're not")),
    namesSuccessorRecord: newBearerLines.some(t => /trust|stood|work|hands|vouch|knew/i.test(t) && !t.includes(oldFirst)),
    lines: handoffLines.map(t => t.slice(0, 220)),
  };

  for (let d = 0; d < (DAYS2 - 2); d++) await runDays(Game, competent, { days: 1 });
  const endDay = (Game.state.scholar || {}).day;

  // --- census ---
  const v = Game.state.village || {};
  const roster = (v.roster || []).map(id => nameOf(Game, id));
  const fallen = (v.fallen || []).map(f => `${nameOf(Game, f.villagerId)} (d${f.day}, ${f.cause})`);
  let pantryKcal = 0;
  try { pantryKcal = Game.pantryKcal ? Game.pantryKcal() : 0; } catch (e) {}
  let breadth = -1;
  try { breadth = Game.codexBreadth(); } catch (e) {}
  const curBearer = Game.villagerId, curName = nameOf(Game, curBearer);
  rec.census = {
    day: endDay, alive: roster.length, roster: roster.join(', '),
    fallen: fallen.join(' | ') || '(none)',
    bearer: curName, bearerTrust: (v.trust || {})[curBearer],
    pantryKcal, codexBreadth: breadth,
    integrationStage: (() => { try { return Game.integrationStage(); } catch (e) { return -1; } })(),
  };
  if (curBearer !== newId) rec.census.secondDeath = `bearer changed again: ${curName}`;

  // --- PEOPLE CHECK: two conversations as the (current) bearer ---
  const trustMap = v.trust || {};
  const living = (v.roster || []).filter(id => id !== curBearer);
  const partnerA = living.slice().sort((a, b) => (trustMap[b] || 0) - (trustMap[a] || 0))[0];
  // partner B: "old associate" — most memory mentions of the new bearer's first name
  const curFirst = curName.split(' ')[0];
  let partnerB = null, bestHits = 0;
  for (const id of living) {
    if (id === partnerA) continue;
    const mems = (v.memory || {})[id] || [];
    const hits = mems.filter(m => m && String(m.note || '').includes(curFirst)).length;
    if (hits > bestHits) { bestHits = hits; partnerB = id; }
  }
  rec.associate = partnerB ? { name: nameOf(Game, partnerB), memHits: bestHits,
    memEntries: ((v.memory || {})[partnerB] || []).filter(m => m && String(m.note || '').includes(curFirst)).map(m => ({ t: m.t, day: m.day, note: String(m.note || '').slice(0, 140) })) } : null;
  if (partnerA) rec.convo.push(captureConvo(Game, seed, partnerA, 'highest-trust', endDay));
  if (partnerB) rec.convo.push(captureConvo(Game, seed, partnerB, 'old-associate', endDay));
  return rec;
}

(async () => {
  for (const seed of parseSeeds()) {
    try {
      const rec = await playSeed(seed);
      console.log(JSON.stringify(rec));
    } catch (e) {
      console.log(JSON.stringify({ seed, error: String(e && e.message || e) }));
      console.error('SEED ' + seed + ' THREW: ' + (e && e.stack || e));
    }
  }
})();
