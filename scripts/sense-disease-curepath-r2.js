#!/usr/bin/env node
// sense-disease-curepath-r2.js — SENSE-TESTING (Steve 2026-10-11): the r2 lever
// is the diagnosis->cure arc. Read the narration for meaning, coherence,
// relevance, consequences — never just counts.
//
// S1: full cure arc — apply -> tick -> diagnosis (named diagnoser, ruin
//     direction hint) -> antibiotics -> cure narration -> recovery.
// S2: villager-tending beat — a medical villager eases your sickness unasked.
// S3: outbreak beat — sick villagers, tending, recovery; regression check on
//     r1's "A stands up" fix (now via Game.firstRef).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function capture(Game) {
  const lines = [];
  const _say = Game.say.bind(Game);
  Game.say = (m) => { lines.push(String(m)); };
  return { lines, restore: () => { Game.say = _say; } };
}

(async () => {
  // ---- S1: full cure arc ----
  {
    const { Game } = await loadGame({ seed: 7, mode: 'sense-curepath' });
    await setupGame(Game);
    const { lines } = capture(Game);
    Game.contractDisease('lockjaw', { source: 'a rusty nail on a ruin beam' });
    Game.state.scholar.health = 100;
    Game.tickStatuses('scholar', 'dayPart'); // one tick: the "you" fix fires here
    Game.diagnoseDisease('scholar', 'lockjaw', { by: 'Mara the nurse' });
    Game.state.scholar.inventory.push({ plantId: 'med_antibiotics', itemId: 'med_antibiotics', medType: 'antibiotics', name: 'Antibiotics (amoxicillin)', doses: 3, units: 1, kcalEach: 0, spoilDay: 9999, unit: 'bottle', kg: 0.1 });
    Game.useMedicine('antibiotics');
    console.log('=== S1: lockjaw cure arc ===');
    for (const l of lines) console.log('-', l.slice(0, 300));
    console.log('cured:', Game.sickDiseases().filter(e => e.id === 'lockjaw').length === 0);
  }
  // ---- S2: villager-tending beat ----
  {
    const { Game } = await loadGame({ seed: 42, mode: 'sense-curepath' });
    await setupGame(Game);
    const { lines } = capture(Game);
    // ensure a medical villager exists in the roster
    const v = Game.state.village || {};
    const roster = (v.roster || []).filter(id => id !== Game.villagerId);
    let med = roster[0];
    try {
      const p = Game.getPerson(med);
      if (p) p.formerOccupation = 'nurse';
    } catch (e) {}
    Game.contractDisease('wound_fever', { source: 'a cut gone wrong' });
    // player at haven: park on the haven tile
    try { Game.map.px = 4; Game.map.py = 4; } catch (e) {}
    // villagerTreatTick is 35%/call when at haven — call until it fires (max 40)
    let fired = 0;
    for (let i = 0; i < 40 && !fired; i++) {
      const before = lines.length;
      try { Game.villagerTreatTick(); } catch (e) { lines.push('[ERR] ' + e.message); break; }
      if (lines.length > before) fired = before + 1;
    }
    console.log('\n=== S2: villager-tending beat ===');
    if (fired) for (const l of lines.slice(fired - 1)) console.log('-', l.slice(0, 300));
    else { console.log('treat tick never fired in 40 calls (occupation set on', med, ')'); for (const l of lines.slice(0, 6)) console.log('-', l.slice(0, 200)); }
  }
  // ---- S3: outbreak beat ----
  {
    const { Game } = await loadGame({ seed: 99, mode: 'sense-curepath' });
    await setupGame(Game);
    const { lines } = capture(Game);
    const v = Game.state.village;
    const roster = (v.roster || []).filter(id => id !== Game.villagerId);
    const names = { 0: 'wound fever', 1: 'gut rot', 2: 'tick fever', 3: 'wound fever' };
    roster.slice(0, 4).forEach((id, i) => {
      v.sick = v.sick || {};
      v.sick[id] = { name: names[i], daysLeft: 5, severity: 2 };
    });
    for (let d = 0; d < 6; d++) { try { Game.villageSicknessTick(); } catch (e) { lines.push('[ERR] ' + e.message); } }
    console.log('\n=== S3: outbreak beat (4 sick, 6 ticks) ===');
    const seen = new Set();
    for (const l of lines) {
      const k = l.slice(0, 50);
      if (!seen.has(k)) { seen.add(k); console.log('-', l.slice(0, 260)); }
      if (seen.size > 16) break;
    }
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
