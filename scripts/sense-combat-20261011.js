#!/usr/bin/env node
// sense-combat-20261011.js — SENSE-TESTING for combat lever (Steve 2026-10-11).
// Captures REAL narration (harness silencing disabled) for:
//   A. a blow-by-blow fight transcript (wave-1 bulldozer + wave-2 grief_counselor)
//   B. villager grief dialogue after a villager death
// Judge: meaning, coherence, relevance, consequences — never just counts.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function freshSay(Game, log) {
  Game.say = function (m) { log.push(['say', String(m).slice(0, 500)]); };
  Game.sysSay = function (m) { log.push(['sys', String(m).slice(0, 500)]); };
}

async function fightTranscript(Game, mid, label) {
  const log = [];
  freshSay(Game, log);
  const rounds = [];
  Game.startCombat(mid);
  let guard = 0;
  const endTurn = () => {
    // turn hygiene (AGENTS.md): strike already advances when the turn is
    // spent; advance manually ONLY if it is still the player's turn.
    try {
      if (Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn()) {
        const p = Game.tbFighter('p');
        if (p) { p.moveLeft = 0; p.acted = true; }
        Game.tbAfterPlayerAction();
      }
    } catch (e) {}
  };
  while (Game.tbfight && !Game.tbfight.over && guard++ < 80) {
    if (Game.tbIsPlayerTurn()) {
      const tgt = Game.tbfight.fighters.find(x => x.kind === 'monster' && (x.hp || 0) > 0);
      const p = Game.tbFighter('p');
      const php = Math.round(p.hp || 0);
      const mhp = tgt ? Math.round(tgt.hp || 0) : -1;
      rounds.push(`R${guard}: you strike ${tgt ? tgt.key : '?'} (you ${php}HP, foe ${mhp}HP)`);
      if (tgt) { Game.tbPlayerStrike(tgt.key); endTurn(); }
      else break;
    } else {
      // monster turn in progress (async path) — nudge via wait
      try { Game.tbPlayerWait(); } catch (e) { break; }
    }
  }
  const p = Game.tbFighter ? Game.tbFighter('p') : null;
  const sayLines = log.filter(([k]) => k === 'say').map(([, m]) => m);
  return { label, rounds, result: Game.tbfight && Game.tbfight.result, playerHP: p ? Math.round(p.hp || 0) : '?', sayLines };
}

(async () => {
  const { Game } = await loadGame({ seed: 7, mode: 'competent', fullTelemetry: true });
  await setupGame(Game);
  // beef the player up a little so we survive to read the transcript
  try { Game.state.scholar.health = 100; } catch (e) {}

  console.log('=========== A. BULLDOZER (wave 1) ===========');
  const a = await fightTranscript(Game, 'bulldozer', 'bulldozer');
  console.log('rounds:', a.rounds.length, 'result:', a.result, 'playerHP:', a.playerHP);
  for (const r of a.rounds.slice(0, 8)) console.log(' ', r);
  console.log('--- narration (first 15 say lines) ---');
  for (const m of a.sayLines.slice(0, 15)) console.log(' ', m.slice(0, 220));

  console.log('\n=========== B. MIRROR STAG (grief counselor) (wave 2) ===========');
  const b = await fightTranscript(Game, 'mirror_stag', 'mirror_stag');
  console.log('rounds:', b.rounds.length, 'result:', b.result, 'playerHP:', b.playerHP);
  for (const r of b.rounds.slice(0, 10)) console.log(' ', r);
  console.log('--- narration (first 20 say lines) ---');
  for (const m of b.sayLines.slice(0, 20)) console.log(' ', m.slice(0, 220));

  console.log('\n=========== C. VILLAGER DEATH + GRIEF ===========');
  const log = [];
  freshSay(Game, log);
  const v = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  if (v) {
    const nm = Game.displayName(v);
    Game.registerDeath({ kind: 'villager', villagerId: v, name: nm, cause: 'combat', witnesses: [Game.villagerId], youWitnessed: true });
    Game.removeVillager(v, 'killed');
  }
  // let a day part tick so reactions fire
  try { Game.tickAction(32); } catch (e) {}
  try { Game.tickAction(32); } catch (e) {}
  const grief = log.filter(([k]) => k === 'say').map(([, m]) => m);
  console.log('--- grief narration (all say lines after a witnessed villager death) ---');
  for (const m of grief.slice(0, 25)) console.log(' ', m.slice(0, 260));
})();
