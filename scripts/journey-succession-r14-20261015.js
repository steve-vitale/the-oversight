#!/usr/bin/env node
// journey-succession-r14-20261015.js — SUCCESSION LEG (7) r14: "the second week"
//
// Pre-registered (evidence/2026-10-15/journey-succession-r14.md): after the
// r12 orientation fix and r13 snippet fix, play the bearer's second week —
// days ~16-26 after a day-16 death. Does the village treat the bearer as
// bearer, do favors re-ask, does the dead bearer's name persist sensibly,
// do transcripts hold up? Plus the self-card fix's live behavior in-world.
//
// Usage: SEEDS=721,722,723 DAYS2=10 node scripts/journey-succession-r14-20261015.js
// Output: one JSON line per seed to stdout; transcripts + census to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const DAYS1 = parseInt(process.env.DAYS1 || '16', 10);
const DAYS2 = parseInt(process.env.DAYS2 || '10', 10);
function parseSeeds() {
  const s = process.env.SEEDS || '721,722,723';
  return s.split(',').map(x => parseInt(x, 10)).filter(Number.isFinite);
}
function charOf(Game, vid) {
  try { return (Game.data.villagers || []).find(x => x.id === vid) || {}; } catch (e) { return {}; }
}
function nameOf(Game, vid) {
  const c = charOf(Game, vid);
  return c.name || String(vid).slice(0, 12);
}

async function playSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'journey-succession-r14', fullTelemetry: true });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  Game.sysSay = (t) => { says.push(String(t)); };
  await setupGame(Game);
  const rec = { seed, census: {}, week2: {}, convo: [] };

  await runDays(Game, competent, { days: DAYS1 });
  if (Game.over) { rec.census = { error: 'village died before death script' }; return rec; }
  const oldId = Game.villagerId, oldName = nameOf(Game, oldId), oldFirst = oldName.split(' ')[0];
  const deathDay = (Game.state.scholar || {}).day;

  Game.playerDeath('a hushwolf');
  if (Game.over) { rec.census = { error: 'game over on scripted death' }; return rec; }
  const newId = Game.villagerId, newName = nameOf(Game, newId), newFirst = newName.split(' ')[0];
  rec.death = { day: deathDay, oldBearer: oldName, newBearer: newName };

  const sayMark = says.length;
  for (let d = 0; d < DAYS2; d++) await runDays(Game, competent, { days: 1 });
  const week2 = says.slice(sayMark);
  const endDay = (Game.state.scholar || {}).day;

  // --- census ---
  const v = Game.state.village || {};
  const roster = (v.roster || []).map(id => nameOf(Game, id));
  const fallen = (v.fallen || []).map(f => `${nameOf(Game, f.villagerId)} (d${f.day}, ${f.cause})`);
  let pantryKcal = 0;
  try { pantryKcal = Game.pantryKcal ? Game.pantryKcal() : 0; } catch (e) {}
  let breadth = -1;
  try { breadth = Game.codexBreadth(); } catch (e) {}
  const trust = (v.trust || {})[newId];
  rec.census = {
    day: endDay, alive: roster.length, roster: roster.join(', '),
    fallen: fallen.join(' | ') || '(none)',
    bearerTrust: trust, pantryKcal, codexBreadth: breadth,
    integrationStage: (() => { try { return Game.integrationStage(); } catch (e) { return -1; } })(),
  };

  // --- week-2 name traffic: dead bearer vs new bearer ---
  const deadLines = week2.filter(t => t.includes(oldFirst));
  const newLines = week2.filter(t => t.includes(newFirst));
  rec.week2 = {
    days: `${deathDay + 1}-${endDay}`,
    deadBearerMentions: deadLines.length,
    newBearerMentions: newLines.length,
    deadSample: deadLines.slice(0, 4).map(t => t.slice(0, 160)),
    newSample: newLines.slice(0, 4).map(t => t.slice(0, 160)),
  };

  // --- self card live check (against the CURRENT bearer, not the scripted one) ---
  const curBearer = Game.villagerId, curName = nameOf(Game, curBearer);
  try {
    const pj = Game.peopleJournal();
    rec.selfcard = {
      bearer: curName,
      pinned: !!(pj[0] && pj[0].self && pj[0].vid === curBearer),
      name: pj[0] && pj[0].e.name && pj[0].e.name.value,
      occ: pj[0] && pj[0].e.occupation && pj[0].e.occupation.value,
      backstoryEntries: pj[0] && (pj[0].e.backstory || []).length,
    };
  } catch (e) { rec.selfcard = { error: String(e.message) }; }

  // --- PEOPLE CHECK: full conversation as the CURRENT bearer, ~day 26 ---
  const trustMap = v.trust || {};
  const cands = (v.roster || []).filter(id => id !== curBearer)
    .sort((a, b) => (trustMap[b] || 0) - (trustMap[a] || 0));
  const talked = cands[0];
  if (talked) {
    const out = [`## seed ${seed}: bearer [${curName}] talks to ${nameOf(Game, talked)} (trust ${trustMap[talked] || 0}), day ${endDay}`];
    const seen = new Set(); // no repeats this sitting — a real player varies
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
    rec.convo.push(out.join('\n'));
  }
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
