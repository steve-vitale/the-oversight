#!/usr/bin/env node
// test-teaching-transcripts.js — SENSE-TESTING for teach/learn (longsim agency r4, 2026-10-11).
//
// Captures the ACTUAL spoken lines of every teaching channel over short runs
// (60 days, several seeds) and prints them for human judgement: coherence,
// character, relevance to backstory/situation — meaning, not counts.
//
// Channels captured:
//   1. conversation 'teach' beat   (player -> villager, convo-beats.js)
//   2. teachPlant                    (player asks villager -> player learns)
//   3. agencyTeachVillager           (villager -> villager, teach chore)
//   4. agencyTeachPlant/Monster      (villager -> player, ask path)
//   5. spreadPlantKnowledge/fireside (ambient word of mouth narration)
//
// To exercise the player-initiated channels in a sim (no UI), this script
// drives the real conversation paths once per day: startConvo with a random
// villager, and if a 'teach' choice exists, take it; plus one ask_expedition
// when explorerNews exists.
//
// Usage: node scripts/test-teaching-transcripts.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = [3, 7, 21];
const DAYS = 60;

(async () => {
  const allLines = [];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'competent', fullTelemetry: false });
    await setupGame(Game);

    // RESTORE narration capture (harness silences it): record every say line
    // with the game day. This is sense-testing tooling, not game code.
    const lines = [];
    Game.say = function (msg) {
      let day = 0, part = '?';
      try { day = Game.state.scholar.day; part = Game.dayPart; } catch (e) {}
      lines.push({ seed, day, part, msg: String(msg).slice(0, 320) });
    };

    const policy = Object.assign({}, competent);
    const origDaily = competent.daily;
    let teachDriven = 0, askDriven = 0;
    policy.daily = (G, ctx) => {
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      // drive the real conversation teach path once a day with a random villager
      try {
        const v = G.state.village || {};
        const roster = (v.roster || []).filter(id => id !== G.villagerId);
        if (roster.length) {
          const vid = roster[Math.floor(Math.random() * roster.length)];
          try {
            if (G.startConvo(vid)) {
              const choices = G.convoChoices(vid) || [];
              const teach = choices.find(c => String(c.id || '').toLowerCase().indexOf('teach') !== -1);
              if (teach) { G.convoTurn(vid, teach.id); teachDriven++; }
              else {
                // fall back: ask about the wild when news exists (agency path)
                const news = (v.explorerNews || {})[vid];
                const ask = choices.find(c => String(c.id || '').indexOf('agency:') === 0);
                if (news && ask) { G.convoTurn(vid, ask.id); askDriven++; }
              }
              try { G.endConvo(vid, 'left'); } catch (e) {}
            }
          } catch (e) {}
        }
      } catch (e) {}
    };

    await runDays(Game, policy, { days: DAYS, sampleEvery: 999 });
    for (const l of lines) allLines.push(l);
    console.log(`seed=${seed}: ${lines.length} narration lines, teachDriven=${teachDriven}, askDriven=${askDriven}`);
  }

  // filter teaching-relevant lines
  const TEACH_RE = /teach|showed|taught|lesson|📖|learn|identify|remember it|word gets around|shows you/i;
  const teachLines = allLines.filter(l => TEACH_RE.test(l.msg));
  console.log(`\n=== ${teachLines.length} teaching lines of ${allLines.length} total ===\n`);
  // dedupe identical lines to judge variety: show unique lines + counts
  const uniq = {};
  for (const l of teachLines) {
    const key = l.msg;
    if (!uniq[key]) uniq[key] = { count: 0, firstDay: l.day, seed: l.seed };
    uniq[key].count++;
  }
  const sorted = Object.entries(uniq).sort((a, b) => b[1].count - a[1].count);
  for (const [msg, m] of sorted) {
    console.log(`[x${m.count} seed=${m.seed} d${m.firstDay}] ${msg}`);
  }
  // also write full raw dump for the evidence file
  const fs = require('fs');
  fs.writeFileSync('/tmp/teach-transcripts-raw.json', JSON.stringify(allLines, null, 1));
  console.log('\nraw dump: /tmp/teach-transcripts-raw.json');
})();
