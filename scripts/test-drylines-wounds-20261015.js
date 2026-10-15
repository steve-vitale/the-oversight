#!/usr/bin/env node
// Proof tests: (A) dry-line counter resets per sitting; (B) betrayal:wounds
// is honest when the player has no wounds (journey-social r16 2026-10-15).
//
// (A) convoDryLine's own comment says "past 9 uses in one conversation" —
// but c.dryLines never reset, so it was per-RUN: after 9 lifetime dry uses
// a villager went permanently silent on blocked beats (12 silent "Look at
// me." turns in an r16 grief transcript — a no-silent-actions violation).
// RED: a blocked beat in a new sitting -> null (silence).
// GREEN: -> the honest dry line (counter reset in startConvo).
//
// (B) betrayal:wounds spoke "The wounds speak for themselves." even when
// showWounds found NO wounds (its narration honestly said "You have no
// wounds to show" — but that feed may not be visible inside the
// conversation UI, so the dialogue lied).
// RED: no-wounds pick -> "The wounds speak for themselves."
// GREEN: no-wounds pick -> "Nothing to show. Just my word."; with wounds
//   -> "The wounds speak for themselves." (unchanged).
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '45', 10);
let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
};

async function main() {
  const lg = await loadGame({ seed: SEED, fullTelemetry: true });
  const Game = lg.Game;
  await setupGame(Game);
  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0], accuser = roster[1];

  // ---- (A) dry-line counter resets per sitting ----
  // Sitting 0 ledgers the line; sitting 1 burns all 9 dry uses on
  // cross-sitting blocks; sitting 2 must get a dry line again (GREEN),
  // not silence (RED).
  Game.startConvo(vid);
  Game.sayLine(vid, '"A line for the ledger."');
  Game.endConvo(vid, 'done');
  Game.startConvo(vid);
  let drySeen = 0;
  for (let i = 0; i < 9; i++) {
    const rr = Game.sayLine(vid, '"A line for the ledger."', { fallback: () => Game.convoSelfRepeatLine(vid) });
    if (rr && /lost my train|Never mind|forget it|Where was I|clean out of my head|slipped away|Wasn.t important|coming back|Lost it\. The thought/.test(rr)) drySeen++;
  }
  console.log(`  sitting 1: ${drySeen}/9 dry lines seen (pool exhaustion)`);
  ok(drySeen === 9, '(A) sitting 1 burns the 9-use dry pool');
  Game.endConvo(vid, 'done');
  Game.startConvo(vid);
  const r = Game.sayLine(vid, '"A line for the ledger."', { fallback: () => Game.convoSelfRepeatLine(vid) });
  console.log(`  sitting 2 blocked beat -> ${JSON.stringify(String(r).slice(0, 60))}`);
  ok(r !== null, '(A) blocked beat in a new sitting is NOT silent (dry counter reset)');
  ok(!r || !/did you miss it|just told you|covered this/.test(r), '(A) no false accusation on the dry path');
  Game.endConvo(vid, 'done');

  // ---- (B) wounds honesty ----
  const mkCase = (woundsTaken) => {
    const bs = Game.betrayalState(); bs.cases = bs.cases || [];
    const id = 'case_probe_' + woundsTaken + '_' + Math.floor(Math.random() * 1e6);
    bs.plots = bs.plots || [];
    const plot = { id: 'plot_' + id, woundsTaken, leader: accuser, accomplices: [], witnesses: [] };
    bs.plots.push(plot);
    const cs = { id, plotId: plot.id, charge: 'theft', status: 'open', target: Game.villagerId,
      accused: [Game.villagerId], accuser, playerRole: 'accused', trial: null, dormant: false,
      belief: {}, evidence: [], bribes: [], exposedBribes: [], inconsistencies: [] };
    bs.cases.push(cs);
    try { Game.initBelief(cs); } catch (e) {}
    return id;
  };
  // no wounds
  const caseNo = mkCase(0);
  Game.startConvo(vid);
  const wchoice = (Game.convoChoices(vid) || []).map(x => x.id).find(x => x === 'betrayal:wounds:' + caseNo);
  ok(!!wchoice, '(B) wounds choice offered to accused player-target');
  const res = Game.convoTurn(vid, wchoice);
  const lineNo = String((res && res.line) || '');
  console.log(`  no-wounds NPC line: ${lineNo.slice(0, 70)}`);
  ok(lineNo.indexOf('The wounds speak for themselves') === -1, '(B) no-wounds pick does NOT claim wounds speak');
  ok(/Nothing to show/i.test(lineNo), '(B) no-wounds pick is honest ("Nothing to show")');
  Game.endConvo(vid, 'done');
  // with wounds (fresh villager — the no-repeat ledger is per-villager,
  // so reusing vid would dry-block the line from the previous sitting;
  // also clear the run-wide ledger so the line isn't run-blocked either)
  try { Game.convoRunLedger().length = 0; } catch (e) {}
  const vid2 = roster[2];
  const caseYes = mkCase(3);
  Game.startConvo(vid2);
  const wchoice2 = (Game.convoChoices(vid2) || []).map(x => x.id).find(x => x === 'betrayal:wounds:' + caseYes);
  ok(!!wchoice2, '(B) wounds choice offered for the with-wounds case');
  const res2 = wchoice2 ? Game.convoTurn(vid2, wchoice2) : null;
  const lineYes = String((res2 && res2.line) || '');
  console.log(`  with-wounds NPC line: ${lineYes.slice(0, 70)}`);
  ok(lineYes.indexOf('The wounds speak for themselves') !== -1, '(B) with-wounds pick unchanged');
  Game.endConvo(vid2, 'done');

  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(2); });
