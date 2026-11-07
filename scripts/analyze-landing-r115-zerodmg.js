// R115 ZERO-DMG FIGHT MECHANISM analyzer (landing r115 Q1, driver-data only).
// Usage: node analyze-landing-r115-zerodmg.js <census-dir>
// Reads journey-landing-r62-census-*.json, classifies every zero-player-damage
// fight by the r113 watch's open question — bystander witness vs stands-through —
// using the fightLog, the r115 driver's new rounds + turnOrder fields, and the
// r89 trigger classifier (copied verbatim below, attribution kept).
//
// Shapes for an others-killed fight (scholar's strikes dealt 0, others dealt >0):
//   A allies-before-scholar-turn: strikes==0, monsterTurns==0, rounds<=1 — the
//     fight ended before any monster turn and before the scholar ever acted.
//   B scholar-stood-through: strikes==0 AND (monsterTurns>=1 OR rounds>=2) —
//     at least one full round passed with the scholar not striking; the scholar
//     had turns (flee-walk, ability, wait, deliberation) while others killed.
//   S struck-but-0-dmg: strikes>0, dealt==0 — the scholar fought and could
//     not hurt it (r113's Paul shape: 8 strikes, 0 damage, lost); others
//     dealt damage but the scholar was no bystander.
//   U unknown-no-rounds: strikes==0, monsterTurns==0, rounds==null — the old
//     corpus (pre-r115 driver) carries no rounds field, so A-vs-B cannot be
//     told apart; reported, never guessed.
//
// BACK-COMPAT FINDINGS (r113 corpus, run before the panel — the instrument
// bugs this run fixes, NOT game defects):
//   (1) R82 drops killing blows: the strike wrapper resolved _cur82() AFTER
//       the strike, but a killing blow ends the fight inside tbPlayerStrike
//       (tbEnd sets endResult), so _cur82() returns null and the strike is
//       lost. 3 of r113's 8 "zero-DMG" fights show damage entries sourced
//       'you' (the strike's own tbDamage call, game.js:37329) with 0
//       recorded strikes — the scholar struck the killing blow. The r115
//       driver captures the entry BEFORE the call (strike, monster-turn,
//       damage). The r113 corpus cannot be repaired retroactively; its
//       U-shapes are reported as unknown, and the r115 panel re-judges.
//   (2) allies undercount: the driver counted kind 'ally' only, but party
//       companions join as kind 'villager' fighters (party.js
//       tbHumanFighter(pid,'villager'); the game counts ally+villager at
//       game.js:41614). All 8 r113 zero-DMG fights read allies=0 while
//       villagers (v_wanjiru_kamau 206, v_hassan_ali 38, ...) dealt the
//       damage. The r115 driver counts ally+villager and records names.
// Killer sources: damage entries (targetKey != 'p') aggregated by
// sourceKey/sourceLabel, so the report names WHO dealt the killing damage.
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
if (!dir) { console.error('usage: node analyze-landing-r115-zerodmg.js <census-dir>'); process.exit(2); }
const files = fs.readdirSync(dir).filter(f => /census-.*\.json$/.test(f)).sort();

// Trigger classifier copied verbatim from scripts/analyze-fights89-20261102.js
// (R81 v2 call-site inspection + pendingFace at fight-start time).
function classify(x) {
  if (x.pendingFace) return 'pending-face';
  const stack = x.stack;
  const s = (stack || []).join('\n');
  if (/contestArena/i.test(s)) return 'contest-arena';
  if (/driveContestsImpl[^|]*:816/i.test(s)) return 'pending-face';
  if (/trap/i.test(s)) return 'trap';
  if (/reengage/i.test(s)) return 'player-reengage';
  const hasMove = /(microMove|move|walk|step|travel|forage)/i.test(s);
  const hasAI = /(monsterTurn|monster|tick|hunt|contact|wander|approach|stance)/i.test(s);
  if (hasMove && !hasAI) return 'player-step';
  if (hasAI && !hasMove) return 'monster-approach';
  if (hasMove && hasAI) return 'mixed-stack';
  return 'UNKNOWN';
}

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

let panelFights = 0, panelZero = 0;
const byClass = {}, byShape = {}, byTrigger = {}, killerTally = {};
for (const f of files) {
  const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const fights = c.fights81 || null;
  console.log('\n=== seed ' + c.seed + ' (file ' + f + ') ===');
  if (!fights) { console.log('fights81: MISSING (instrument did not run)'); continue; }
  panelFights += fights.length;
  console.log('fights: ' + fights.length);
  for (const x of fights) {
    const log = x.fightLog || [];
    const strikes = log.filter(e => e.turn === 'player-strike');
    const dealt = strikes.reduce((a, e) => a + (e.dmg || 0), 0);
    const mturns = log.filter(e => e.turn === 'monster-turn');
    const dmgE = log.filter(e => e.turn === 'damage');
    const othersDmg = dmgE.filter(e => e.targetKey !== 'p').reduce((a, e) => a + (e.applied || 0), 0);
    if (dealt !== 0) continue;
    panelZero++;
    const cls = othersDmg > 0 ? 'others-killed'
      : (!strikes.length ? ((x.playerHpEnd != null && x.playerHpEnd <= 0) ? 'died-before-or-without-striking' : 'no-strikes')
      : (x.playerFled ? 'fled' : (strikes.every(e => (e.dmg || 0) === 0) ? 'all-missed-or-blocked' : 'other-stated')));
    byClass[cls] = (byClass[cls] || 0) + 1;
    const shape = shapeOf(x, strikes, dealt, othersDmg, mturns.length);
    byShape[shape] = (byShape[shape] || 0) + 1;
    const trig = classify(x);
    byTrigger[trig] = (byTrigger[trig] || 0) + 1;
    // Killer sources: who dealt the damage to monsters.
    const bySrc = {};
    for (const e of dmgE) {
      if (e.targetKey === 'p') continue;
      const k = (e.sourceKey || e.sourceLabel || 'unknown') + '';
      bySrc[k] = (bySrc[k] || 0) + (e.applied || 0);
    }
    const srcList = Object.entries(bySrc).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ':' + v).join(', ') || 'none';
    for (const [k, v] of Object.entries(bySrc)) killerTally[k] = (killerTally[k] || 0) + v;
    const mons = (x.monsters || []).map(m => (m.name || m.monsterId) + ' w' + m.wave + ' ' + m.hp + '/' + m.maxHp).join(' + ');
    const to = x.turnOrder || null;
    const pIdx = to ? to.indexOf('p') : null;
    const alliesBeforeP = (to && pIdx != null && pIdx >= 0) ? to.slice(0, pIdx).filter(k => k !== 'p').length : null;
    const scholarTook = dmgE.filter(e => e.targetKey === 'p').reduce((a, e) => a + (e.applied || 0), 0);
    console.log('  ZERO-DMG d' + x.day + ' class=' + cls + ' shape=' + shape + ' trigger=' + trig +
      ' pendingFace=' + !!x.pendingFace + ' allies=' + x.allies + ' villagers=' + JSON.stringify(x.villagers || []) + ' strikes=' + strikes.length +
      ' monsterTurns=' + mturns.length + ' rounds=' + (x.rounds != null ? x.rounds : 'n/a') +
      ' scholarTurnPos=' + (pIdx != null && pIdx >= 0 ? pIdx : 'n/a') + ' alliesBeforeScholar=' + (alliesBeforeP != null ? alliesBeforeP : 'n/a') +
      ' othersDmg=' + othersDmg + ' scholarTook=' + scholarTook + ' end=' + x.endResult + ' fled=' + x.playerFled);
    console.log('    monsters: ' + mons + ' | killerSources: ' + srcList);
    if (to) console.log('    turnOrder: ' + to.join(','));
  }
}
console.log('\nPANEL: fights=' + panelFights + ' zeroDmg=' + panelZero);
console.log('byClass: ' + JSON.stringify(byClass));
console.log('byShape: ' + JSON.stringify(byShape));
console.log('byTrigger: ' + JSON.stringify(byTrigger));
console.log('killerTally (damage to monsters by sourceKey/sourceLabel): ' + JSON.stringify(killerTally));
