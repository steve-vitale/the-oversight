#!/usr/bin/env node
// sense-disease-transcripts.js — SENSE-TESTING: capture real narration for a
// lockjaw arc and a village sickness outbreak. Read for meaning, coherence,
// consequences — not just counts.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  // T1: player lockjaw arc — apply, diagnose, tick to death, capture every line
  {
    const { Game } = await loadGame({ seed: 7, mode: 'sense' });
    await setupGame(Game);
    const lines = [];
    Game.say = (m) => lines.push(String(m));
    Game.sysSay = (m) => lines.push('[sys] ' + String(m));
    Game.contractDisease('lockjaw', { source: 'a rusty nail on a ruin beam' });
    Game.diagnoseDisease('scholar', 'lockjaw', { by: 'Mara the nurse' });
    Game.state.scholar.health = 100;
    const _pd = Game.playerDeath.bind(Game);
    let cause = null;
    Game.playerDeath = (c) => { cause = c; lines.push('[DEATH] ' + c); Game.playerDeath = _pd; };
    for (let i = 0; i < 20 && !cause; i++) { Game.state.scholar.health = 100; Game.tickStatuses('scholar', 'dayPart'); }
    Game.playerDeath = _pd;
    console.log('=== T1: lockjaw arc (diagnosed, untreated) ===');
    console.log('apply line:', lines[0]);
    console.log('diagnosis line:', lines[1]);
    console.log('warning line:', lines.find(l => /2 days left/.test(l)));
    console.log('death line:', lines.find(l => /lockjaw \u2014/.test(l)));
    console.log('death cause:', cause);
    console.log('tick sample:', lines.filter(l => /Spasms|spasm/.test(l))[0]);
  }
  // T2: village outbreak — seed 4 sick villagers, run the tick, capture lines
  {
    const { Game } = await loadGame({ seed: 42, mode: 'sense' });
    await setupGame(Game);
    const lines = [];
    Game.say = (m) => lines.push(String(m));
    const v = Game.state.village;
    const roster = (v.roster || []).filter(id => id !== Game.villagerId);
    const names = { 0: 'wound fever', 1: 'gut rot', 2: 'tick fever', 3: 'wound fever' };
    roster.slice(0, 4).forEach((id, i) => {
      v.sick = v.sick || {};
      v.sick[id] = { name: names[i], daysLeft: 5, severity: 2 };
    });
    for (let d = 0; d < 6; d++) { try { Game.villageSicknessTick(); } catch (e) { lines.push('[ERR] ' + e.message); } }
    console.log('\n=== T2: village outbreak (4 sick, 6 daily ticks) ===');
    const seen = new Set();
    for (const l of lines) {
      const k = l.slice(0, 60);
      if (!seen.has(k)) { seen.add(k); console.log('-', l.slice(0, 220)); }
      if (seen.size > 14) break;
    }
  }
  // T3: a villager catching a meat-quirk — the weirdness line + howlbeat
  {
    const { Game } = await loadGame({ seed: 99, mode: 'sense' });
    await setupGame(Game);
    const lines = [];
    Game.say = (m) => lines.push(String(m));
    const v = Game.state.village;
    const roster = (v.roster || []).filter(id => id !== Game.villagerId);
    const vid = roster[0];
    const p = Game.getPerson(vid);
    const first = String(p.name).split(' ')[0];
    Game.villagerMonsterWeirdness(vid, { plantId: 'meat_hushwolf', foodState: 'raw', name: 'hushwolf meat' }, 1.0);
    console.log('\n=== T3: villager eats hushwolf meat (forced weirdness) ===');
    console.log(lines.join('\n').slice(0, 400));
    console.log('affliction panel row for villager:', JSON.stringify(Game.hasStatus && Game.hasStatus(p, 'howlbelly')));
  }
})();
