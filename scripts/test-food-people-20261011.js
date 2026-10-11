#!/usr/bin/env node
// test-food-people-20261011.js — sense-testing: villager behavior around food.
// Runs short sims, captures FULL conversation transcripts (not ended), plus
// villager daily routines/agency around food: who forages, who cooks,
// who teaches, what they SAY about scarcity. Output is transcripts to read,
// not counts.
// Usage: SEED=11 DAYS=20 node scripts/test-food-people-20261011.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '11', 10);
const DAYS = parseInt(process.env.DAYS || '20', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'people-food' });
  await setupGame(Game);
  const transcripts = []; // {day, vid, name, lines[]}
  const policy = Object.assign({}, competent);
  const origDaily = competent.daily;
  policy.daily = (G, ctx) => {
    try {
      const vv = G.state.village;
      const roster = (vv.roster || []).filter(id => id !== G.villagerId);
      if (roster.length && transcripts.length < 8) {
        const vid = roster[transcripts.length % roster.length];
        try {
          G.talkTo(vid);
          const c = G.convoGet ? G.convoGet(vid) : null;
          // play a few beats with a human-ish choice policy: prefer substance
          // (news, subject menu, teach) over "tell me more" filler loops.
          let guard = 0, picks = 0;
          while (c && c.transcript && c.transcript.length < 18 && guard++ < 10 && !c.over) {
            const ui = G.convoUI ? G.convoUI(vid) : null;
            const choices = (ui && ui.choices) || [];
            if (!choices.length) break;
            const rank = (id) => {
              if (/share_news|subject/.test(id)) return 3;
              if (/teach|want|news|ask/.test(id)) return 2;
              if (/^leave|silence$/.test(id)) return picks < 4 ? -1 : 1;
              if (/more/.test(id)) return 0;
              return 1;
            };
            const scored = choices.map(ch => ({ ch, r: rank(ch.id) + Math.random() * 0.5 }))
              .sort((a, b) => b.r - a.r);
            try { G.convoTurn(vid, scored[0].ch.id); picks++; } catch (e) { break; }
          }
          const person = G.getPerson ? G.getPerson(vid) : {};
          const lines = (c && c.transcript ? c.transcript : []).map(t => ({
            who: t.speaker || (t.you ? 'you' : '?'), text: String(t.line || t.text || '').slice(0, 300),
          }));
          transcripts.push({ day: G.state.scholar.day, vid: String(vid).slice(0, 8), name: person.name || '?', occ: person.formerOccupation || '?', n: lines.length, lines });
          try { G.endConvo(vid, 'left'); } catch (e) {}
        } catch (e) {}
      }
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, sampleEvery: 10 }); });
  // village routines: what do the agency tracks say villagers did?
  let routines = [];
  try {
    const ag = Game.agencyOf ? Game.agencyOf() : null;
    routines = Object.entries(((ag || {}).stats) || {}).map(([vid, st]) => ({
      vid: String(vid).slice(0, 8), ...st,
    }));
  } catch (e) {}
  console.log(JSON.stringify({ seed: SEED, day: Game.state.scholar.day, transcripts, routines }, null, 1));
})();
