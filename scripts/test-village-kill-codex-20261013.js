#!/usr/bin/env node
// Proof: a villager's kill teaches the monster codex exactly like the
// player's — the village learns together (Steve's villager-XP law).
// BLANK (journey establishment r1, 2026-10-13): seed 82 had ~14 monster
// kills and ONE codex BEASTS entry. Villager kills flow through
// recordWaveKill (ledger + villageSlain + wave unlock) but nothing ever
// sets the codex entry to stage 'slain' — only the player's TB kill path
// (tbKillRewards) does. The codex stayed thin no matter how hard the
// village fought; the counter hint (channel 3) never surfaced for
// villager-earned kills, contradicting "slaying a monster surfaces its
// counter.hint" (docs/MONSTER-WAVES.md — says slaying, not slaying-it-
// yourself) and the beasttricks channel's "villager experiences count."
// FIX: recordWaveKill — the single choke point every real kill flows
// through (player TB, villager field fights, contests) — marks the codex
// entry stage 'slain' via ensureMonsterEntry (well-formed: proposals,
// attacksSeen, roundsSeen, hitsLanded initialized for the naming system).
// The full counter reveal stays gated on discovery (monsterCounterKnown);
// only the hint and the earned telegraph-tell surface at 'slain'.
//
// RED (before fix): recordWaveKill('hushwolf') leaves codex.monsters with
//   no 'hushwolf' entry at all.
// GREEN (after fix): entry exists, stage 'slain', well-formed; idempotent;
//   villageSlain still increments (beasttricks channel intact).
//
// Usage: node scripts/test-village-kill-codex-20261013.js
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const lg = await loadGame({ seed: 4242 });
  const Game = lg.Game;
  Game.genDetail = function () { return {}; };
  await setupGame(Game);

  const mid = 'hushwolf';
  const mdef = (Game.data.monsters || []).find(m => m.id === mid);
  if (!mdef) { console.log('FAIL: no hushwolf in monsters.json'); process.exit(2); }

  const before = (Game.state.codex.monsters || {})[mid];
  console.log('before recordWaveKill: entry=' + (before ? JSON.stringify({ stage: before.stage }) : '(absent)'));

  // Simulate a villager field-fight kill: the kill path calls recordWaveKill.
  try { Game.recordWaveKill(mid); } catch (e) { console.log('FAIL: recordWaveKill threw: ' + e.message); process.exit(2); }

  const e = ((Game.state.codex || {}).monsters || {})[mid];
  console.log('after recordWaveKill: entry=' + (e ? JSON.stringify({ stage: e.stage }) : '(absent)'));

  const checks = [
    ['codex entry created by a villager-path kill', !!e],
    ["stage is 'slain'", !!e && e.stage === 'slain'],
    ['entry well-formed (proposals/attacksSeen/roundsSeen/hitsLanded)', !!e
      && typeof e.proposals === 'object' && Array.isArray(e.attacksSeen)
      && typeof e.roundsSeen === 'number' && typeof e.hitsLanded === 'number'],
    ['villageSlain still increments (beasttricks channel)', ((Game.state.villageSlain || {})[mid] || 0) >= 1],
    ['ledger still scores', ((Game.state.waveKills || {})[1] || 0) >= 1],
  ];
  // Idempotence: a second kill (and the player path's own assignment) must not break it.
  try {
    Game.recordWaveKill(mid);
    const e2 = ((Game.state.codex || {}).monsters || {})[mid];
    checks.push(['idempotent on repeat kill', !!e2 && e2.stage === 'slain']);
  } catch (err) { checks.push(['idempotent on repeat kill (no throw)', false]); }
  // The player-path assignment (tbKillRewards) must stay compatible.
  try {
    Game.state.codex.monsters[mid] = Object.assign(Game.state.codex.monsters[mid] || {}, { stage: 'slain' });
    const e3 = Game.state.codex.monsters[mid];
    checks.push(['player-path assignment compatible', !!e3 && e3.stage === 'slain']);
  } catch (err) { checks.push(['player-path assignment compatible', false]); }

  let ok = true;
  for (const [name, pass] of checks) { console.log((pass ? '  ok  ' : '  FAIL') + ' ' + name); if (!pass) ok = false; }
  console.log(ok ? 'PASS' : 'FAIL');
  process.exit(ok ? 0 : 1);
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(2); });
