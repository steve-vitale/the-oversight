#!/usr/bin/env node
// sense-villagers-20261011.js — SENSE-TESTING villager behavior (Steve 2026-10-11).
// Runs a 30-day sim with narration CAPTURED, then samples:
//   A. villager dialogue (conversations, gossip, grief)
//   B. villager routines (what do they DO all day — agency snapshot)
// Judge: meaning, coherence, relevance — do they act like people?
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  const { Game } = await loadGame({ seed: 11, mode: 'competent', fullTelemetry: true });
  await setupGame(Game);
  const sayLog = [];
  Game.say = (m) => sayLog.push(['say', String(m).slice(0, 400)]);
  Game.sysSay = (m) => sayLog.push(['sys', String(m).slice(0, 400)]);
  const policy = Object.assign({}, competent);
  // talk to a different villager each day and capture the exchange
  const baseDaily = competent.daily;
  const convos = [];
  policy.daily = (G, ctx) => {
    try {
      const vv = G.state.village || {};
      const roster = (vv.roster || []).filter(id => id !== G.villagerId);
      if (roster.length && G.talkTo) {
        const vid = roster[(G.state.scholar.day || 1) % roster.length];
        const before = sayLog.length;
        G.talkTo(vid);
        // ask about the village
        try { G.askAbout(vid, 'village'); } catch (e) {}
        try { G.endConvo(vid, 'left'); } catch (e2) {}
        convos.push({ day: G.state.scholar.day, vid, lines: sayLog.slice(before).map(([, m]) => m) });
      }
    } catch (e) {}
    if (baseDaily) try { return baseDaily(G, ctx); } catch (e) {}
  };
  await runDays(Game, policy, { days: 30 });
  console.log('=========== A. CONVERSATION SAMPLES (3 days) ===========');
  for (const c of [convos[2], convos[9], convos[19]].filter(Boolean)) {
    let nm = c.vid;
    try { nm = Game.displayName(c.vid); } catch (e) {}
    console.log(`--- day ${c.day}: with ${nm} ---`);
    for (const l of c.lines.slice(0, 10)) console.log('   ' + l.slice(0, 200));
  }
  console.log('\n=========== B. VILLAGER AGENCY SNAPSHOT (day 30) ===========');
  try {
    const v = Game.state.village || {};
    for (const vid of (v.roster || []).slice(0, 6)) {
      let person = null, ag = null;
      try { person = Game.getPerson(vid); } catch (e) {}
      try { ag = Game.agencyOf(vid); } catch (e) {}
      const axp = ((ag || {}).xp || {})[vid] || {};
      console.log(`- ${Game.displayName(vid)}: occ=${(person && person.occupationId) || '?'}, profile=${((ag && ag.profiles && ag.profiles[vid]) || '?')}, xp=${JSON.stringify({ t: axp.tracking || 0, s: axp.survival || 0, b: axp.bravery || 0 })}`);
    }
  } catch (e) { console.log('agency snapshot failed: ' + e.message); }
  console.log('\n=========== C. GRIEF/GOSSIP LINES (sample) ===========');
  const grief = sayLog.filter(([, m]) => /dead|died|grave|mourn|grief|digging|fire feels/i.test(m)).map(([, m]) => m);
  const seen = new Set();
  for (const g of grief) {
    const k = g.slice(0, 60);
    if (seen.has(k)) continue;
    seen.add(k);
    console.log('   ' + g.slice(0, 220));
    if (seen.size >= 8) break;
  }
})();
