#!/usr/bin/env node
// test-comfort-pool-depth-20261019.js — PROOF for journey landing r29:
// the r27-documented blank — the seek_comfort engage pool was 2 lines, so a
// multi-turn comfort exchange cycled verbatim (A,B,A,B). The fix expands the
// engage pool to 6 and the opener pool to 4.
// RED on the pre-fix code: a 5-turn comfort exchange cycles the 2-line
// pool verbatim (first-cycle-6-distinct fails: only 2 variants). GREEN:
// the engine's R18 no-repeat-within-3 guarantee holds AND the first full
// cycle is 6 distinct lines. Seeded, deterministic.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 777001, mode: 'mvc' });
  setupGame(Game);

  let pass = 0, fail = 0;
  const t = (name, cond, extra) => {
    if (cond) { pass++; }
    else { fail++; console.log('  FAIL: ' + name + (extra ? ' :: ' + extra : '')); }
  };

  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  t('roster has NPCs', roster.length >= 6);
  // avoid taken-kin villagers (seek_taken would compete at weight 2)
  const vid = roster.find(id => { try { return !(Game.takenKinOf(id) || []).length; } catch (e) { return true; } }) || roster[0];

  // Deterministic grief: this NPC is grieving, so seek_comfort picks at 3.
  // ask_favor is 0 with no favor need (structural kill of contentless
  // favors); other wants sit at <=2.5. Set the sitting count directly
  // (past the first-meeting curiosity floor) instead of running throwaway
  // conversations — throwaways plant question seeds, and seeds outrank
  // weight selection.
  const origMood = Game.npcMood;
  Game.npcMood = (id) => (id === vid ? 'grieving' : origMood.call(Game, id));
  Game.convoGet(vid).count = 2;
  const st = Game.startConvo(vid);
  t('sitting opens', !!st && !!st.line);
  const want = Game.convoGet(vid).want || {};
  t('want is seek_comfort (grieving, repeat sitting)', want.id === 'seek_comfort', 'got ' + want.id);
  const def = want.def;
  t('want def reachable', !!def && typeof def.engageBeat === 'function');

  if (def) {
    // 8 consecutive engage beats through the REAL def (convoPickCycle
    // per-vid ledger, seeded RNG). Two bars:
    // (a) the engine's own guarantee (R18 memory window): no verbatim
    //     repeat within 3 turns — every window of 4 is distinct;
    // (b) pool depth: the first 6 beats (one full cycle) are all distinct,
    //     so a 5-turn comfort exchange never cycles verbatim (r27 blank).
    const beats = [];
    for (let i = 0; i < 8; i++) beats.push(String(def.engageBeat.call(Game, vid) || ''));
    t('8 engage beats delivered', beats.every(b => b.length > 10));
    let windowDupes = 0;
    for (let s = 0; s + 4 <= beats.length; s++) {
      const w = beats.slice(s, s + 4);
      if (new Set(w).size !== 4) windowDupes++;
    }
    t('no verbatim repeat within 3 turns (R18 window)', windowDupes === 0,
      windowDupes ? JSON.stringify(beats) : '');
    t('first full cycle is 6 distinct lines (pool depth)',
      new Set(beats.slice(0, 6)).size === 6, JSON.stringify(beats.slice(0, 6)));
    // Opener pool: 4 consecutive openers distinct.
    const opens = [];
    for (let i = 0; i < 4; i++) opens.push(String(def.opener.call(Game, vid) || ''));
    t('4 consecutive openers distinct', new Set(opens).size === 4,
      JSON.stringify(opens));
  }
  Game.npcMood = origMood;

  console.log(`comfort-pool-depth: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
