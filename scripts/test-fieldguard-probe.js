#!/usr/bin/env node
// scripts/test-fieldguard-probe.js — sim-fieldguard-a DIRECTED PROBE.
// (scale-onramp axis, 2026-10-25. Game code: fieldFights.js guard +
//  game.js resolve flag + villager-agency.js expedition flag.)
//
// QUESTION: does a villager below the guard line (15 HP on the
// 100-point villager scale) withdraw from a FIELD fight before round 1,
// while raid defenders, healthy villagers, and unflagged fights are
// untouched?
//
// Cases (all on one seeded Game, seed 73671, setupGame defaults):
//   P1 resolve, wild, villager at 7 HP  -> outcome 'vWithdraw', 0 rounds,
//      0 taken, 0 dealt, HP unchanged, monster untouched.
//   P2 resolve, wild, villager at 50 HP -> a real fight (any outcome
//      except 'vWithdraw').
//   P3 resolve, RAID, villager at 7 HP  -> NOT 'vWithdraw' (raid defense
//      must not be broken by the guard).
//   P4 fieldFight, flag on, villager at 7 HP  -> 'vWithdraw'.
//   P5 fieldFight, flag OFF, villager at 7 HP -> NOT 'vWithdraw'.
//   P6 expedition, villager at 7 HP -> 'withdrew hurt from' encounter
//      note, no wound (HP unchanged). BEST-EFFORT: expeditionMonster
//      needs full agency state; if the harness cannot stand it up,
//      P6 prints SKIP and the sweep's direct vWithdraw rows are the
//      expedition-site proof instead. P1–P5 are the binding probe:
//      probe failure (any P1–P5 FAIL) = mechanism unproven = NO-GO.
//   P7 fieldFightSummary for 'vWithdraw' -> names the withdrawal
//      honestly (no silent action).
//
// Exit 0 iff P1–P5 and P7 all PASS. Usage: node scripts/test-fieldguard-probe.js
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name} ${detail || ''}`);
  return cond;
}

async function main() {
  const { Game } = await loadGame({ seed: 73671, mode: 'fieldguard-probe', fullTelemetry: false });
  await setupGame(Game);
  const scholar = Game.villagerId;
  const roster = ((Game.state || {}).village || {}).roster || [];
  const vid = roster.find((id) => id !== scholar);
  if (!vid) { console.log('FAIL setup: no non-scholar villager on roster'); process.exit(1); }
  if (!Game.state.village.health) Game.state.village.health = {};
  const health = Game.state.village.health;
  const mdef = (Game.data.monsters || []).find((x) => x.id === 'hushwolf') || { id: 'hushwolf', wave: 1 };
  const mkMonster = () => ({ id: 'hushwolf', tx: 1, ty: 1, mx: 0, my: 0, hp: 50, maxHp: 50 });
  let ok = true;

  // P1: wild resolve at 7 HP -> withdraw.
  await quietLog(async () => { health[vid] = 7; });
  let rec1 = null;
  await quietLog(async () => { rec1 = Game.resolveWildMonsterEncounter(vid, mkMonster()); });
  ok = check('P1 resolve-wild-7hp', rec1 && rec1.outcome === 'vWithdraw' && rec1.rounds === 0 && (rec1.vTaken | 0) === 0 && (rec1.mDealt | 0) === 0,
    `outcome=${rec1 && rec1.outcome} rounds=${rec1 && rec1.rounds} vTaken=${rec1 && rec1.vTaken} mDealt=${rec1 && rec1.mDealt}`) && ok;
  ok = check('P1 hp-unchanged', health[vid] === 7, `hp=${health[vid]}`) && ok;

  // P2: wild resolve at 50 HP -> real fight.
  await quietLog(async () => { health[vid] = 50; });
  let rec2 = null;
  await quietLog(async () => { rec2 = Game.resolveWildMonsterEncounter(vid, mkMonster()); });
  ok = check('P2 resolve-wild-50hp', rec2 && rec2.outcome !== 'vWithdraw',
    `outcome=${rec2 && rec2.outcome} rounds=${rec2 && rec2.rounds}`) && ok;

  // P3: raid resolve at 7 HP -> NOT withdrawn.
  await quietLog(async () => { health[vid] = 7; });
  let rec3 = null;
  await quietLog(async () => { rec3 = Game.resolveWildMonsterEncounter(vid, mkMonster(), { raid: true }); });
  ok = check('P3 resolve-raid-7hp', rec3 && rec3.outcome !== 'vWithdraw',
    `outcome=${rec3 && rec3.outcome} rounds=${rec3 && rec3.rounds}`) && ok;

  // P4/P5: fieldFight flag on/off at 7 HP.
  await quietLog(async () => { health[vid] = 7; });
  let rec4 = null, rec5 = null;
  await quietLog(async () => { rec4 = Game.fieldFight(vid, mdef, null, { fieldguard: true }); });
  ok = check('P4 fieldFight-flag-7hp', rec4 && rec4.outcome === 'vWithdraw' && rec4.rounds === 0,
    `outcome=${rec4 && rec4.outcome}`) && ok;
  await quietLog(async () => { health[vid] = 7; });
  await quietLog(async () => { rec5 = Game.fieldFight(vid, mdef, null, {}); });
  ok = check('P5 fieldFight-noflag-7hp', rec5 && rec5.outcome !== 'vWithdraw',
    `outcome=${rec5 && rec5.outcome}`) && ok;

  // P6: expedition meeting at 7 HP (best-effort, see header).
  try {
    await quietLog(async () => { health[vid] = 7; });
    let before = null;
    try { const st = Game.agencyState(); before = (st.exped && st.exped[vid] && st.exped[vid].encounters || []).length; } catch (e) { before = null; }
    await quietLog(async () => { Game.expeditionMonster(vid, 1, true); });
    let enc = null;
    try { const st = Game.agencyState(); enc = (st.exped && st.exped[vid] && st.exped[vid].encounters) || []; } catch (e) { enc = null; }
    if (enc && before != null) {
      const note = enc.slice(before).join(' | ');
      const fired = /withdrew hurt from/.test(note);
      console.log(`${fired ? 'PASS' : 'FAIL'} P6 expedition-7hp note=${note.slice(0, 120)} hp=${health[vid]}`);
      if (!fired) console.log('NOTE P6 did not fire on this harness stand-up; sweep direct vWithdraw rows decide the expedition site.');
    } else {
      console.log('SKIP P6 expedition-7hp (no agency exped state on this harness stand-up)');
    }
  } catch (e) {
    console.log(`SKIP P6 expedition-7hp (threw: ${String((e && e.message) || e).slice(0, 120)})`);
  }

  // P7: summary narrates the withdrawal.
  let sum = null;
  try { sum = Game.fieldFightSummary({ outcome: 'vWithdraw', rounds: 0, vTaken: 0 }, 'Mara', 'hushwolf'); } catch (e) { sum = null; }
  ok = check('P7 summary-withdraw', typeof sum === 'string' && /too hurt|slipped away/.test(sum), `sum=${sum}`) && ok;

  console.log(ok ? 'FIELDGUARD-PROBE: ALL BINDING CASES PASS' : 'FIELDGUARD-PROBE: BINDING CASE FAILED');
  process.exit(ok ? 0 : 1);
}

if (require.main === module) main().catch((e) => { console.error('FIELDGUARD-PROBE FAILED:', (e && e.stack) || e); process.exit(1); });
