// R120 SCHOLAR-TURN VERBS analyzer (landing r120, watch instrument).
// Usage: node analyze-landing-r120-scholar-turns.js <census-dir>
// Reads journey-landing-r62-census-*.json, and for every zero-player-damage
// fight (the r117 v2 definition: damage entries sourced 'you', applied sum
// == 0) prints the scholar's TURN VERBS — the r119 watch's open question.
//
// The question (r119): two zero-DMG fights were both shape B
// (scholar-stood-through: 0 strikes in 2 and 4 rounds while allies killed).
// The r119 log records only strikes, monster turns, and damage, so "did the
// competent policy pass its turns, or could the scholar not strike?" could
// not be read off it. The r120 driver wraps tbPlayerWait, tbPlayerMove,
// tbBarrierExit, and useAbility, appending one entry per call to the live
// fight's fightLog (turns 'player-wait', 'player-move',
// 'player-barrier-exit', 'player-ability'). This analyzer prints, per
// zero-DMG fight, the verb counts alongside the v2 shape — so the run note
// can say whether the scholar waited / walked / fled / used an ability, or
// passed turns with no logged verb at all (an endTurn-only pass, or a turn
// the scholar never got — reported as absence, never inferred).
//
// What it does NOT do: it never infers a verb from silence. A fight with
// strikes=0, waits=0, moves=0, barrier=0, ability=0 and rounds>=2 is printed
// as "no logged scholar verb" — the run note adjudicates with the fight
// log, not this analyzer. tbAfterPlayerAction is deliberately NOT wrapped
// (shared turn-advancer; cannot attribute a turn to a verb).
//
// PRE-R120 CORPUS: a corpus whose fightLogs carry no new-verb entries at
// all prints "no turn data (pre-r120 corpus)" and exits 0 — the instrument
// is absent, not the data.
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
if (!dir) { console.error('usage: node analyze-landing-r120-scholar-turns.js <census-dir>'); process.exit(2); }
const files = fs.readdirSync(dir).filter(f => /census-.*\.json$/.test(f)).sort();

// Shape classifier copied from scripts/analyze-landing-r117-zerodmg-v2.js
// (r115 shapeOf; attribution kept).
function shapeOf(x, strikes, dealt, othersDmg, mturns) {
  if (dealt !== 0) return null;
  if (othersDmg > 0) {
    if (strikes.length > 0) return 'S-struck-0-dmg';
    if (mturns === 0 && (x.rounds == null || x.rounds <= 1)) {
      return x.rounds == null ? 'U-unknown-no-rounds' : 'A-allies-before-scholar-turn';
    }
    if (mturns >= 1 || (x.rounds != null && x.rounds >= 2)) return 'B-scholar-stood-through';
    return 'U-unknown-no-rounds';
  }
  if (!strikes.length) return (x.playerHpEnd != null && x.playerHpEnd <= 0) ? 'died-before-or-without-striking' : 'no-strikes';
  if (x.playerFled) return 'fled';
  if (strikes.every(e => (e.dmg || 0) === 0)) return 'all-missed-or-blocked';
  return 'other-stated';
}

const VERB_TURNS = ['player-wait', 'player-move', 'player-barrier-exit', 'player-ability'];
let panelFights = 0, panelZero = 0, panelBShape = 0;
let verbTotals = { 'player-wait': 0, 'player-move': 0, 'player-barrier-exit': 0, 'player-ability': 0 };
let fightsWithVerbData = 0, anyVerbEntry = false;
const byShape = {};
for (const f of files) {
  const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const fights = c.fights81 || null;
  console.log('\n=== seed ' + c.seed + ' (file ' + f + ') ===');
  if (!fights) { console.log('fights81: MISSING (instrument did not run)'); continue; }
  panelFights += fights.length;
  console.log('fights: ' + fights.length);
  for (const x of fights) {
    const log = x.fightLog || [];
    const verbs = {};
    for (const t of VERB_TURNS) verbs[t] = log.filter(e => e.turn === t);
    const hasVerb = VERB_TURNS.some(t => verbs[t].length > 0);
    if (hasVerb) { fightsWithVerbData++; anyVerbEntry = true; }
    for (const t of VERB_TURNS) verbTotals[t] += verbs[t].length;
    const strikes = log.filter(e => e.turn === 'player-strike');
    const mturns = log.filter(e => e.turn === 'monster-turn');
    const dmgE = log.filter(e => e.turn === 'damage');
    const dealt = dmgE.filter(e => e.sourceLabel === 'you').reduce((a, e) => a + (e.applied || 0), 0);
    const othersDmg = dmgE.filter(e => e.targetKey !== 'p').reduce((a, e) => a + (e.applied || 0), 0);
    if (dealt !== 0) continue;
    panelZero++;
    const shape = shapeOf(x, strikes, dealt, othersDmg, mturns.length);
    byShape[shape] = (byShape[shape] || 0) + 1;
    if (shape === 'B-scholar-stood-through') panelBShape++;
    const abilityList = verbs['player-ability'].map(e => (e.abilityId || '?') + '(' + (e.action || '?') + ',ok=' + !!e.ok + ')').join(', ') || 'none';
    const moveList = verbs['player-move'].map(e => (e.to || []).join(',') + (e.moved ? '' : '(!moved)')).join('; ') || 'none';
    console.log('  ZERO-DMG d' + x.day + ' shape=' + shape +
      ' strikes=' + strikes.length + ' monsterTurns=' + mturns.length + ' rounds=' + (x.rounds != null ? x.rounds : 'n/a') +
      ' end=' + x.endResult + ' fled=' + x.playerFled);
    console.log('    scholar verbs: wait=' + verbs['player-wait'].length + ' move=' + verbs['player-move'].length +
      ' barrier=' + verbs['player-barrier-exit'].length + ' ability=' + verbs['player-ability'].length +
      ' | abilities: ' + abilityList + ' | moves: ' + moveList);
    if (!hasVerb && strikes.length === 0) {
      console.log('    NOTE: no logged scholar verb in this fight (endTurn-only passes, or turns the scholar never got — read the fight log, do not infer).');
    }
  }
}
console.log('\nPANEL: fights=' + panelFights + ' zeroDmg=' + panelZero + ' B-shape=' + panelBShape);
console.log('byShape: ' + JSON.stringify(byShape));
console.log('verbTotals (all fights, r120 wraps): ' + JSON.stringify(verbTotals));
console.log('fightsWithVerbData: ' + fightsWithVerbData);
if (!anyVerbEntry) console.log('no turn data (pre-r120 corpus) — the r120 wraps did not run on this corpus; the watch is UNTESTED here.');
