#!/usr/bin/env node
// test-misjudged-path-20261021.js -- PROBE TEST (journey-social r37).
// The misjudged path: a fabricated case fires when an enemy has motive>=60,
// trustInPlayer<25, and no real crimes (betrayal.js considerPlayerAccusation,
// the false-accusation branch) — then the defense tools (speak / alibi /
// press-accuser) and the moot acquittal path must work end to end.
// The r37 pilot (4x140d hostile-lawabiding, seeds 3401-3404) fired 0
// fabricated cases: this probe forces the preconditions and verifies the
// MACHINERY, so the pilot's blank reads as a reachability gap (preconditions
// unreachable through honest social hostility), not broken code.
// GREEN = fabricated case opens, defense tools move belief and expose the
// lie, and the moot acquits.
// Usage: node scripts/test-misjudged-path-20261021.js
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

async function main() {
  const { Game } = await loadGame({ seed: 4343, mode: 'misjudged-path-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const roster = (Game.state.village.roster || []).filter(id => id !== sid);
  const npc = roster[0];
  console.log(`player=${safe(() => Game.displayName(sid), sid)} enemy=${safe(() => Game.displayName(npc), npc)}`);

  // 1. Force the false-accusation preconditions: grievance 80 -> motive 64;
  //    trust slots at default 10 -> trustInPlayer 10 < 25. No crimes exist.
  Game.recordGrievance(npc, sid, 'probe-hostility', 80);
  const v = Game.state.village;
  v.trust = v.trust || {};
  for (const id of roster) v.trust[id] = 10;
  const motive = safe(() => Game.strongestMotiveVsPlayer(), null);
  check('strongestMotiveVsPlayer >= 60', motive && motive.score >= 60,
    `score=${motive && motive.score}`);
  check('strongestMotiveVsPlayer is our enemy', motive && motive.id === npc);
  const tip = safe(() => Game.trustInPlayer(), 999);
  check('trustInPlayer < 25', tip < 25, `tip=${tip}`);
  const crimes = safe(() => (Game.justiceState().crimes || []).length, -1);
  check('no crimes on the books', crimes === 0, `crimes=${crimes}`);

  // 2. Run the daily consideration until the fabricated branch fires
  //    (25% roll per call; ~200 calls is plenty).
  let fab = null;
  for (let i = 0; i < 200 && !fab; i++) {
    try { Game.considerPlayerAccusation(); } catch (e) { /* keep trying */ }
    const cases = safe(() => Game.betrayalState().cases || [], []);
    fab = cases.find(c => c && c.fabricated && (c.accused || []).includes(sid)) || null;
  }
  check('fabricated case opened', !!fab, fab ? '' : 'no fabricated case in 200 considerations');
  if (!fab) { console.log(`\nRESULT: ${pass} pass, ${fail} fail`); process.exit(fail ? 1 : 0); }
  check('accuser is the enemy', fab.accuser === npc, `accuser=${fab.accuser}`);
  check('charge is theft|assault', fab.charge === 'theft' || fab.charge === 'assault',
    `charge=${fab.charge}`);
  check('inconsistencies planted (the lie has seams)',
    Array.isArray(fab.inconsistencies) && fab.inconsistencies.length === 2,
    `n=${(fab.inconsistencies || []).length}`);

  // 3. Defense tools, one per "day": speak -> alibi -> press accuser.
  const beliefBefore = JSON.stringify(fab.belief || {});
  check('defendSpeak works', !!safe(() => Game.defendSpeak(fab.id), false));
  check('defendSpeak moved belief', JSON.stringify(fab.belief || {}) !== beliefBefore);
  check('defendSpeak counted', fab.defenseSpeeches === 1);
  check('defendAlibi works', !!safe(() => Game.defendAlibi(fab.id), false) || fab.alibiDone === true);
  const incBefore = (fab.inconsistencies || []).filter(i => i.found).length;
  check('defendPressAccuser works', !!safe(() => Game.defendPressAccuser(fab.id), false));
  const incAfter = (fab.inconsistencies || []).filter(i => i.found).length;
  check('press exposed a lie seam', incAfter === incBefore + 1,
    `found ${incBefore} -> ${incAfter}`);
  check('accuser exposed', !!fab.accuserExposed);

  // 4. The moot: convene; the accused does NOT vote in their own trial
  // (betrayal.js:1615 — "player votes if present and not accused"; the
  // accused player's agency is the defense tools, not a ballot). The room
  // judges on the belief the defense tools moved.
  const trial = safe(() => Game.callMoot(fab.id, sid), null);
  check('callMoot ran the trial', !!trial && !!fab.trial, 'no trial');
  if (fab.trial) {
    check('accused does not vote in own trial (design)',
      !fab.trial.awaitingPlayerVote && fab.trial.playerVoter === false,
      `awaiting=${!!fab.trial.awaitingPlayerVote} playerVoter=${fab.trial.playerVoter}`);
    check('verdict acquitted', fab.resolution === 'acquitted' && fab.status === 'acquitted',
      `resolution=${fab.resolution} status=${fab.status}`);
  }

  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROBE ERROR:', e && e.stack || e); process.exit(2); });
