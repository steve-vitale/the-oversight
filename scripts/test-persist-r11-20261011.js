// PROBE r11: save/load of the FRESH surface (survivalist r7 a7f6b5ee, socialite
// rebuild d39d6473, contests r15 2937b425, camps burn 74d7ebc7, counters r16 dc2386ba).
// BEFORE=1: asserts the VULNERABLE behavior (demonstrates the kill on unfixed code).
// default:  asserts the FIXED behavior.
// Run: node scripts/test-persist-harness.js scripts/test-persist-r11-20261011.js
//      BEFORE=1 node scripts/test-persist-harness.js scripts/test-persist-r11-20261011.js
//      SEED=<n> for the x3-seed convention.
'use strict';
const BEFORE = (typeof process !== 'undefined' && process.env && process.env.BEFORE === '1');
let fails = 0, passes = 0;
function check(name, cond, extra) {
  if (!cond) { fails++; console.log('FAIL:', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 300)); }
  else { passes++; console.log('ok:', name); }
}
function newRun() {
  storage.clear();
  freshGame();
  G.state.systemArrived = true;
  G.tbfight = null; // sections interleave fight/non-fight; inCombat() reads this live
}
function saveLoad() {
  G.save();
  const k = G.state.runKey;
  const ok = G.load(k);
  check('save+load round-trips', ok !== false);
  return ok;
}

// ============ K1: counter fight-object gates dropped by the save boundary ============
// syncRun's tbSave (and load's restore) enumerate fight fields explicitly. The r6
// sweep (2026-10-09) covered beamCooldown/shouts/humStacks/... but the counter
// engine (2026-10-10) postdates it, and r16 added _counterLastMoveDir without
// touching the boundary. A mid-fight save+load silently reset:
//   _counterStrikes      -> firstStrike re-arms: union_rep's strike_first
//                           ("first blood on the rep") becomes discoverable
//                           WITHOUT actual first blood. Save-scum discovery.
//   _counterLastMoveRound/_counterLastMoveDir -> review_drone's move_x2 vary
//                           chain can never qualify post-load: the trick is
//                           performed but silently never counts (honesty).
newRun();
G.state.monsterCounters = {};
const repDef = (G.data.monsters || []).find(m => m.id === 'union_rep');
const undDef = (G.data.monsters || []).find(m => m.id === 'understudy');
check('union_rep def carries strike_first counter', !!(repDef && repDef.counter && repDef.counter.kind === 'strike_first'));
check('understudy def exists', !!undDef);
G.tbfight = {
  id: 'f-test-1', round: 2, turnIdx: 0, order: ['p', 'rep', 'und'],
  fighters: [
    { key: 'p', kind: 'player', name: 'You', hp: 100, maxHp: 100, mx: 4, my: 4, alive: true, acted: false, moveLeft: 1 },
    { key: 'rep', kind: 'monster', name: 'rep', hp: 160, maxHp: 160, mx: 5, my: 5, alive: true,
      monsterId: 'union_rep', mdef: repDef, _counterDischarged: true },
    { key: 'und', kind: 'monster', name: 'und', hp: 100, maxHp: 100, mx: 6, my: 6, alive: true,
      monsterId: 'understudy', mdef: undDef, usSeen: { 'rusty spear': true } },
  ],
  _counterStrikes: 1,          // the player already struck once this fight: NOT first blood
  _counterLastMoveRound: 1,    // player moved last round...
  _counterLastMoveDir: '1,0',  // ...east
};
saveLoad();
const tf = G.tbfight;
check('fight restored with all fighters', !!(tf && tf.fighters && tf.fighters.length === 3),
  tf && tf.fighters && tf.fighters.length);
const repF = tf && tf.fighters.find(f => f.key === 'rep');
check('monster def reattached by monsterId on load', !!(repF && repF.mdef && repF.mdef.id === 'union_rep'));

if (BEFORE) {
  check('K1 DEMO (before fix): _counterStrikes reset by load', ((tf || {})._counterStrikes | 0) === 0,
    (tf || {})._counterStrikes);
  const firstStrikeDemo = ((tf || {})._counterStrikes | 0) === 0;
  const discoveredDemo = G.checkMonsterCounter('union_rep',
    { type: 'strike', target: repF, firstStrike: firstStrikeDemo, via: 'trick' });
  check('K1 DEMO (before fix): strike_first discovered WITHOUT first blood after load', discoveredDemo === true);
  check('K1b DEMO (before fix): move chain dropped by load', (tf || {})._counterLastMoveRound === undefined);
} else {
  check('K1 FIX: _counterStrikes survives load', (tf._counterStrikes | 0) === 1, tf._counterStrikes);
  const firstStrike = ((tf || {})._counterStrikes | 0) === 0;
  check('K1 FIX: firstStrike honestly false after load (a strike already happened)', firstStrike === false);
  const discovered = G.checkMonsterCounter('union_rep',
    { type: 'strike', target: repF, firstStrike: firstStrike, via: 'trick' });
  check('K1 FIX: no save-scum discovery (strike_first not hit)', discovered === false);
  check('K1 FIX: counter not marked known by the scummed strike', !(G.state.monsterCounters || {}).union_rep);
  check('K1b FIX: _counterLastMoveRound survives load', tf._counterLastMoveRound === 1, tf._counterLastMoveRound);
  check('K1b FIX: _counterLastMoveDir survives load', tf._counterLastMoveDir === '1,0', tf._counterLastMoveDir);
  check('K1b FIX: move_x2 chain check coherent post-load (round-1 match)',
    tf._counterLastMoveRound === tf.round - 1);
}
// SIBLING SWEEP (same bug class, fighter-level): the understudy's seen-state
// and the strike_recovery discharge flag ride the fighter JSON snapshot.
const undF = tf && tf.fighters.find(f => f.key === 'und');
check('SIBLING: understudy usSeen survives load (fighter snapshot)',
  !!(undF && undF.usSeen && undF.usSeen['rusty spear'] === true),
  undF && undF.usSeen);
check('SIBLING: _counterDischarged survives load (fighter snapshot)',
  !!(repF && repF._counterDischarged === true));
// DEAD-CODE: the tbfight save payload carries exactly the known field list.
const tbKeys = Object.keys((G.state.run && G.state.run.tbfight) || {}).sort();
const knownTb = ['id', 'fighters', 'turnIdx', 'round', 'order', 'terraform', 'pendingPack',
  'betrayal', 'betrayer', 'aggressor', 'playerFled', 'beamCooldown', 'uprising', 'uprisingAttackers',
  'humStacks', 'humMice', 'humRiseRound', 'humDecayRound', 'shouts', 'chorusBrokenUntil',
  'terraformScorched', 'orderDirty', 'counterStrikes', 'counterLastMoveRound', 'counterLastMoveDir'].sort();
const unknownTb = tbKeys.filter(k => knownTb.indexOf(k) === -1);
check('DEAD-CODE: no unknown keys in tbfight save payload', unknownTb.length === 0, unknownTb.join(','));

// ============ HELD: contest bet + idempotency flags ride the blob ============
newRun();
G.state.scholar.kcal = 1000;
G.state.activeContest = {
  contestId: 'blood_trial', kind: 'contest', participant: 'player',
  phase: 'watch', phaseIdx: 1, bet: { amount: 200 },
  participants: ['player'], cheer: 0,
  _dieLanded: { player: true },   // a death already landed pre-save
};
saveLoad();
const ac = G.state.activeContest;
check('BET HELD: bet rides the save blob', !!(ac && ac.bet && ac.bet.amount === 200), ac && ac.bet);
// The placement gate (contests.js: `d.bet && d.bet.amount > 0 && !ac.bet`) reads
// the loaded bet live: a second wager cannot double-stake.
let placedAgain = false;
if (!(ac.bet && ac.bet.amount > 0)) { ac.bet = { amount: 200 }; placedAgain = true; }
check('BET HELD: re-bet refused while a bet is live (no double stake)', placedAgain === false);
check('DIE HELD: _dieLanded rides the save blob', !!(ac && ac._dieLanded && ac._dieLanded.player === true));
// A live re-entrant _contestDie on the loaded ac must early-return: no second
// +12 trauma, no re-fired crisis. (Re-entrancy itself proven by r15's suite;
// this is the load-boundary half.)
const traumaBefore = G.state.scholar.trauma || 0;
let dieThrew = null, dieRes = null;
try { dieRes = G._contestDie(ac, 'torn apart on camera'); } catch (e) { dieThrew = e.message; }
check('DIE HELD: re-entrant _contestDie does not throw', !dieThrew, dieThrew);
check('DIE HELD: re-entrant _contestDie early-returns', !!(dieRes && dieRes.done === true && dieRes.outcome === 'died'),
  dieRes && dieRes.outcome);
check('DIE HELD: no double trauma across the load boundary', (G.state.scholar.trauma || 0) === traumaBefore,
  (G.state.scholar.trauma || 0) + ' vs ' + traumaBefore);

// ============ HELD: _showEnd idempotency across the load boundary ============
newRun();
G.state.activeContest = {
  kind: 'show', showId: 'mouth_race', showName: 'Mouth Race',
  participant: 'player', phase: 'main', cheer: 0,
};
saveLoad();
const acShow = G.state.activeContest;
check('SHOW HELD: mid-show ac intact after load', !!(acShow && acShow.phase === 'main'));
let showThrew = null, showRes = null;
try { showRes = G._showEnd(acShow, 'won', null); } catch (e) { showThrew = e.message; }
check('SHOW HELD: _showEnd lands without throwing', !showThrew, showThrew);
check('SHOW HELD: _showEnded flag set by the landing', acShow._showEnded === true);
let showRes2 = null;
try { showRes2 = G._showEnd(acShow, 'won', null); } catch (e) {}
check('SHOW HELD: re-entrant _showEnd early-returns (no re-grant)', !!(showRes2 && showRes2.done === true));

// ============ HELD: trauma is a plain persisted number ============
newRun();
G.state.scholar.trauma = 10;
saveLoad();
check('TRAUMA HELD: scholar.trauma round-trips', (G.state.scholar.trauma || 0) === 10,
  G.state.scholar.trauma);

// ============ HELD: camps burn — purged fire stays purged, no phantom ============
newRun();
const fmx = G.map.px, fmy = G.map.py;
G.state.fires = [{ inside: false, tx: fmx, ty: fmy, cx: 3, cy: 3, till: 1e15 }];
saveLoad();
check('FIRE HELD: fire entry rides the blob', (G.state.fires || []).length === 1);
check('FIRE HELD: playerFireAt true after load (Feed the fire honest)', G.playerFireAt(3, 3) === true);
// The apPlaygroundBurn purge (alienPlayers.js): splice the tracked entry, same predicate.
const ffs = G.state.fires;
for (let i = ffs.length - 1; i >= 0; i--) {
  const ff = ffs[i];
  if (!ff.inside && ff.tx === fmx && ff.ty === fmy && ff.cx === 3 && ff.cy === 3) ffs.splice(i, 1);
}
saveLoad();
check('FIRE HELD: purged entry stays purged after load', (G.state.fires || []).length === 0);
check('FIRE HELD: no phantom Feed the fire on ash', G.playerFireAt(3, 3) === false);

// ============ HELD: survivalist r7 — carried water round-trips; cell drink ============
// ============ drinks the CELL, never the bottles (the r7 fiction/engine fix) ============
newRun();
G.state.scholar.hydration = 10;
G.state.scholar.water = [{ quality: 'clean', source: 'creek' }, { quality: 'risky', source: 'creek' }];
saveLoad();
const wb = G.state.scholar.water || [];
check('WATER HELD: bottles ride the blob', wb.length === 2 && wb[0].quality === 'clean',
  wb.length + '/' + (wb[0] && wb[0].quality));
// Pack Drink button -> doAction('drink') -> drinkWater: honest after load.
const hydBefore = G.state.scholar.hydration;
G.drinkWater();
check('WATER HELD: post-load drink consumes one bottle (clean first)',
  (G.state.scholar.water || []).length === 1 && (G.state.scholar.water[0] || {}).quality === 'risky');
check('WATER HELD: post-load drink hydrates', (G.state.scholar.hydration || 0) > hydBefore);
// Creek Drink (cellInteract -> drinkFromCell): the cell, not the bottles.
newRun();
G.state.scholar.hydration = 10;
G.state.scholar.water = [{ quality: 'clean', source: 'creek' }];
G.drinkFromCell('still, clear, creek', true);
check('R7 HELD: cell drink does not touch bottles', (G.state.scholar.water || []).length === 1);
check('R7 HELD: cell drink hydrates (+50)', (G.state.scholar.hydration || 0) === 60,
  G.state.scholar.hydration);

// ============ HELD: socialite rebuild — seeds ride the blob, consume-once; ============
// ============ mid-conversation loads settle (r9), winddown state can't strand ====
newRun();
const v = G.state.village;
const vid = (v.roster || [])[0];
check('convo test setup: roster non-empty', !!vid);
G.state.village.convoSeeds = G.state.village.convoSeeds || {};
G.state.village.convoSeeds[vid] = {
  wantId: 'repay', note: 'the kindness they feel they owe you for', day: G.state.scholar.day || 0,
};
saveLoad();
const seed = G.convoCheckSeeds(vid);
check('SEED HELD: planted seed rides the blob', !!(seed && seed.wantId === 'repay'), seed && seed.wantId);
// Consume-before-plant: the delete is synchronous with resolve — no load window.
delete G.state.village.convoSeeds[vid];
saveLoad();
check('SEED HELD: consumed seed stays consumed (no resurrection)', !G.convoCheckSeeds(vid));
// Mid-conversation save, winddown queued: load must settle, never strand.
newRun();
const v2 = G.state.village;
const vid2 = (v2.roster || [])[0];
const cc = G.convoGet(vid2);
cc.active = true; cc.exchanges = 2; cc.transcript = [{ who: 'n', text: 'hi' }];
cc.winddownQueued = true; cc.winddownSpurns = 1;
cc.heldBeats = [{ text: '"Anyway — I should get back to it."', winddown: true }];
G.save();
let convoThrew = null;
try { G.load(G.state.runKey); } catch (e) { convoThrew = e.message; }
check('CONVO HELD: mid-conversation load does not throw', !convoThrew, convoThrew);
const cc2 = ((G.state.village || {}).conv || {})[vid2];
check('CONVO HELD: stale conversation settled on load (never stranded active)',
  !cc2 || cc2.active !== true, cc2 && cc2.active);

console.log(`\n${passes} passed, ${fails} failed (BEFORE=${BEFORE ? 1 : 0}, SEED=${SEED})`);
if (fails > 0 && typeof process !== 'undefined' && process.exit) process.exit(1);
