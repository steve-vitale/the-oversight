// R81 FIGHT-DEATH adjudicator (scratch tool, driver-data only).
// Usage: node analyze-fights83.js <census-dir>
// Reads journey-landing-r62-census-*.json, reports fight-record completeness (census field fights81),
// fatal-fight joins to playerDeaths, HP odds, and trigger class from the
// recorded stack frames. UNKNOWN is reported, never guessed.
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
if (!dir) { console.error('usage: node analyze-fights83.js <census-dir>'); process.exit(2); }
const files = fs.readdirSync(dir).filter(f => /census-.*\.json$/.test(f)).sort();

function classify(x) {
  if (x.pendingFace) return 'pending-face';
  const stack = x.stack;
  const s = (stack || []).join('\n');
  // R81 v2 (call-site inspection, verified against sim-harness.js):
  // - _contestArena/contestChoose frames = a contest arena fight.
  // - startCombat called from driveContestsImpl:816 = the harness's
  //   pending-encounter fallback ("Face it"): the monster approached
  //   earlier (pendingMonsterId) and the driver faced it. FRAGILE: the
  //   :816 marker is harness-version-specific; r83 must record
  //   pendingFace at fight-start time instead of inferring it here.
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

let panelFights = 0, panelComplete = 0, panelFatal = 0, panelUnknownFatal = 0;
for (const f of files) {
  const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const fights = c.fights81 || null;
  const deaths = ((c.deaths13 || {}).playerDeaths) || [];
  console.log('\n=== seed ' + c.seed + ' (file ' + f + ') ===');
  if (!fights) { console.log('fights81: MISSING (instrument did not run)'); continue; }
  const complete = fights.filter(x => x.monsters && x.monsters.length && x.playerHpStart != null && x.endResult != null);
  // R81 CORRECTED FATAL (panel re-analysis, no re-run needed — the raw
  // records carry playerHpEnd): the driver tagged fatal only on
  // hpEnd===0, but lethal fights end NEGATIVE (748 d9: -8, 750 d29: -27).
  // Corrected rule: unended at death, or hpEnd<=0. Recorded fatal flags
  // are shown alongside so the correction is auditable.
  const fatalCorr = fights.filter(x => x.endResult == null || (x.playerHpEnd != null && x.playerHpEnd <= 0));
  const fatal = fights.filter(x => x.fatal);
  panelFights += fights.length; panelComplete += complete.length; panelFatal += fatalCorr.length;
  console.log('fights: ' + fights.length + ' complete: ' + complete.length + ' fatal(recorded): ' + fatal.length + ' fatal(corrected hpEnd<=0): ' + fatalCorr.length);
  console.log('playerDeaths: ' + JSON.stringify(deaths));
  for (const x of fights) {
    const incomplete = [];
    if (!x.monsters || !x.monsters.length) incomplete.push('monsters');
    if (x.playerHpStart == null) incomplete.push('playerHpStart');
    if (x.endResult == null) incomplete.push('endResult');
    if (incomplete.length) console.log('  INCOMPLETE fight d' + x.day + ' missing: ' + incomplete.join(','));
  }
  for (const x of fatalCorr) {
    const cls = classify(x);
    if (cls === 'UNKNOWN' || cls === 'mixed-stack') panelUnknownFatal++;
    const mons = (x.monsters || []).map(m => (m.name || m.monsterId) + ' w' + m.wave + ' ' + m.hp + '/' + m.maxHp).join(' + ');
    const monsEnd = (x.monstersEnd || []).map(m => m.key + ':' + m.hp).join(',');
    console.log('  FATAL d' + x.day + ' (end d' + x.endDay + ', result ' + x.endResult + ', fled ' + x.playerFled + ')');
    console.log('    monsters: ' + mons + ' | end HPs: ' + monsEnd + ' | allies: ' + x.allies);
    console.log('    player HP: ' + x.playerHpStart + '/' + x.playerMaxHp + ' -> ' + x.playerHpEnd +
      ' | scholar kcal ' + x.scholarKcal + ' hydration ' + x.scholarHydration + ' pos (' + x.scholarMx + ',' + x.scholarMy + ')');
    console.log('    trigger: ' + cls);
    console.log('    stack: ' + (x.stack || []).join(' || ').slice(0, 600));
    const log = x.fightLog || [];
    const strikes = log.filter(e => e.turn === 'player-strike');
    const mturns = log.filter(e => e.turn === 'monster-turn');
    const dealt = strikes.reduce((a, e) => a + (e.dmg || 0), 0);
    const taken = mturns.reduce((a, e) => a + (e.dmgTaken || 0), 0);
    const dmgE = log.filter(e => e.turn === 'damage');
    const othersD = dmgE.filter(e => e.targetKey !== 'p').reduce((a, e) => a + (e.applied || 0), 0);
    console.log('    fightLog: entries ' + log.length + ' strikes ' + strikes.length + ' (dmg ' + dealt + ') monsterTurns ' + mturns.length + ' (dmgTaken ' + taken + ') damageEntries ' + dmgE.length + ' (othersDmg ' + othersD + ')');
    for (const e of strikes) console.log('      strike ' + e.targetKey + ' ' + e.targetHpBefore + '->' + e.targetHpAfter + ' dmg ' + e.dmg + ' | ' + (e.lines || []).join(' / ').slice(0, 220));
    for (const e of mturns) console.log('      mturn ' + (e.monsterName || e.monsterKey) + ' playerHp ' + e.playerHpBefore + '->' + e.playerHpAfter + ' dmgTaken ' + e.dmgTaken + ' | ' + (e.lines || []).join(' / ').slice(0, 220));
    if ((x.endResult === 'won' || x.endResult === 'routed') && (x.playerHpEnd || 0) > 0) {
      console.log('    TAGGING ANOMALY: fatal flag on a survived fight (should be 0 after the R81 pilot fix)');
    }
  }
  // R83 zero-player-damage classification (all fights, not only fatal):
  // player damage dealt = playerHpStart-side monster HP loss is already in
  // monstersEnd; here use the fight log: strikes attempted, damage dealt.
  for (const x of fights) {
    const log = x.fightLog || [];
    const strikes = log.filter(e => e.turn === 'player-strike');
    const dealt = strikes.reduce((a, e) => a + (e.dmg || 0), 0);
    const monsStart = (x.monsters || []).reduce((a, m) => a + (m.hp || 0), 0);
    const monsEnd = (x.monstersEnd || []).reduce((a, m) => a + (m.hp || 0), 0);
    const dealtByHp = (monsStart - monsEnd);
    const dmgEntries = log.filter(e => e.turn === 'damage');
    const othersDmg = dmgEntries.filter(e => e.targetKey !== 'p').reduce((a, e) => a + (e.applied || 0), 0);
    if (dealt === 0) {
      let cls82 = 'other-stated';
      if (othersDmg > 0) cls82 = 'others-killed';
      else if (!strikes.length) cls82 = (x.playerHpEnd != null && x.playerHpEnd <= 0) ? 'died-before-or-without-striking' : 'no-strikes';
      else if (x.playerFled) cls82 = 'fled';
      else if (strikes.every(e => (e.dmg || 0) === 0)) cls82 = 'all-missed-or-blocked';
      console.log('  ZERO-DMG d' + x.day + ' class=' + cls82 + ' strikes=' + strikes.length + ' logEntries=' + log.length + ' othersDmg=' + othersDmg + ' hpDeltaDealt=' + dealtByHp + ' end=' + x.endResult);
    }
  }
  // Death-join check: a death joins to a fatal player fight only when the
  // fatal flag is set AND the day matches. A death with no fatal player
  // fight came from a non-startCombat path (field fight, etc.): that is
  // EXPLAINED for non-wild causes, but a JOIN ISSUE for cause 'the wild',
  // which by definition (tbFightDeathCause) is a lost player fight.
  for (const d of deaths) {
    const joined = fights.filter(x => (x.fatal || x.endResult == null || (x.playerHpEnd != null && x.playerHpEnd <= 0)) && (x.endDay === d.day || x.day === d.day));
    if (joined.length === 1) {
      console.log('  death d' + d.day + ' cause=' + d.cause + ' joined fatal fights: 1');
    } else if (joined.length === 0 && d.cause !== 'the wild') {
      console.log('  death d' + d.day + ' cause=' + d.cause + ' joined fatal fights: 0 (non-player-fight death, explained — no startCombat record expected)');
    } else {
      console.log('  death d' + d.day + ' cause=' + d.cause + ' joined fatal fights: ' + joined.length + '  <-- JOIN ISSUE');
    }
  }
  // Deaths-after-survived-fight: only for fights NOT in the corrected
  // fatal set (a corrected fatal already prints its own FATAL block).
  for (const x of fights) {
    const _isFatalCorr = (x.endResult == null || (x.playerHpEnd != null && x.playerHpEnd <= 0));
    if (x.deathAfter && !_isFatalCorr) console.log('  deathAfter note: fight d' + x.day + ' survived (' + x.endResult + '), scholar died d' + x.deathAfter.day + ' cause=' + x.deathAfter.cause + ' elsewhere');
  }
}
console.log('\nPANEL: fights=' + panelFights + ' complete=' + panelComplete + ' fatal=' + panelFatal + ' fatalWithUnknownOrMixedTrigger=' + panelUnknownFatal);
