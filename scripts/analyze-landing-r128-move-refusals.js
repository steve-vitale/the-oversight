// R128 MOVE-REFUSAL analyzer (landing r128, Q1 instrument).
// Usage: node analyze-landing-r128-move-refusals.js <census-dir>
// Reads journey-landing-r62-census-*.json and tallies every fightLog
// 'player-move' entry the r128 driver wrap records: from / to / ret
// (the raw tbPlayerMove return) / posMoved (did the scholar's position
// actually change — the r127 position check) / lines (the say-lines
// spoken during the call: the engine's own refusal text).
//
// The question (r127 carried): the panel's failed moves are NOT approach
// moves — tbPlayerMove results are ignored at the legacy flee walk and
// the three trick-dodge sites — but the refusal REASON was unknown from
// the r127 corpus (Game.say silenced; no say-line reached the logs).
// Candidates: far destination exceeds moveLeft (legacy flee), destination
// occupied (dodge), moderator mute. This analyzer classifies each failed
// move by its first spoken line, and flags the 1146-redactor shape:
// a living scholar, >=3 failed flee/dodge moves, 0 strikes.
//
// Classification (first line, verbatim from game.js tbPlayerMove):
//   'No path there.'            -> nopath
//   'Too far — N squares left.' -> toofar
//   "You don't stroll through …"-> occupied
//   'No movement left this turn.'-> nomove
//   no lines at all + ret true    -> silent-mute (moderator-mute
//                                  candidate: modVerbBlocked returns true
//                                  without moving and says nothing — the
//                                  only refusal path that speaks no line
//                                  AND returns true)
//   no lines at all + ret false   -> silent-noline (reported as absence,
//                                  never assigned a cause: usually a
//                                  DEDUPED repeat — the driver's cap()
//                                  drops a line identical to the one
//                                  immediately before it, so a second
//                                  identical refusal in the same turn
//                                  leaves no line — or a not-player-turn
//                                  refusal, which also speaks no line)
//   anything else               -> other:<first 60 chars>
// A move whose ret is true but posMoved is false is the moderator-mute
// lie counted separately (movedLie) — the return value says "moved"
// while the scholar stands still.
//
// Site shape (from `to`): an edge tile (x 0/8) is a flee walk — the
// legacy flee passes the far edge tile in one call; anything else is a
// dodge/approach move (trick dodges and the strike approach both target
// interior tiles). The split is heuristic and printed as such.
//
// PRE-R128 CORPUS: fightLog entries without `posMoved`/`lines` print
// "no r128 move data (pre-r128 corpus)" and exit 0 — the instrument is
// absent, not the data. Never infers a reason from silence: a failed
// move with no lines is reported as silent, never assigned a cause.
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
if (!dir) { console.error('usage: node analyze-landing-r128-move-refusals.js <census-dir>'); process.exit(2); }
const files = fs.readdirSync(dir).filter(f => /census-.*\.json$/.test(f)).sort();

function reasonOf(lines, ret) {
  if (!lines || !lines.length) return ret ? 'silent-mute' : 'silent-noline';
  const l = String(lines[0] || '');
  if (/^No path there/.test(l)) return 'nopath';
  if (/^Too far/.test(l)) return 'toofar';
  if (/stroll through/.test(l)) return 'occupied';
  if (/^No movement left/.test(l)) return 'nomove';
  return 'other:' + l.slice(0, 60);
}

let panelFights = 0, totalMoves = 0, failedMoves = 0, movedLie = 0, withData = 0;
const byReason = {}, bySite = {}, byReasonSite = {};
const stuckFights = [];
for (const f of files) {
  const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const fights = c.fights81 || null;
  if (!fights) { console.log('\n=== seed ' + c.seed + ' ===\nfights81: MISSING (instrument did not run)'); continue; }
  panelFights += fights.length;
  for (const x of fights) {
    const log = x.fightLog || [];
    const moves = log.filter(e => e.turn === 'player-move');
    if (!moves.length) continue;
    const hasData = moves.some(e => e.posMoved !== undefined && e.lines !== undefined);
    if (!hasData) continue;
    withData++;
    let failed = 0;
    const strikes = log.filter(e => e.turn === 'player-strike').length;
    const mons = [...new Set(log.filter(e => e.turn === 'monster-turn' && e.monsterName).map(e => e.monsterName))];
    for (const e of moves) {
      totalMoves++;
      const site = (e.to && (e.to[0] === 0 || e.to[0] === 8)) ? 'flee-walk' : 'dodge/approach';
      bySite[site] = (bySite[site] || 0) + 1;
      if (e.moved && e.posMoved === false) movedLie++;
      if (e.posMoved === false) {
        failed++;
        failedMoves++;
        const r = reasonOf(e.lines, e.moved);
        byReason[r] = (byReason[r] || 0) + 1;
        const k = site + '/' + r;
        byReasonSite[k] = (byReasonSite[k] || 0) + 1;
      }
    }
    if (failed >= 3 && strikes === 0 && (x.playerHpEnd == null || x.playerHpEnd > 0)) {
      stuckFights.push({ seed: c.seed, day: x.day, failed: failed, strikes: strikes,
        rounds: (x.rounds != null ? x.rounds : null), end: x.endResult,
        hpEnd: x.playerHpEnd, monsters: mons.join(', ') || '?' });
    }
  }
}
console.log('PANEL: fights=' + panelFights + ' fightsWithMoveData=' + withData);
console.log('moves: total=' + totalMoves + ' failed(posMoved=false)=' + failedMoves + ' movedLie(ret=true,posMoved=false)=' + movedLie);
console.log('byReason: ' + JSON.stringify(byReason));
console.log('bySite: ' + JSON.stringify(bySite));
console.log('byReasonSite: ' + JSON.stringify(byReasonSite));
console.log('stuckFights(living scholar, >=3 failed moves, 0 strikes): ' + stuckFights.length);
for (const s of stuckFights) console.log('  STUCK seed ' + s.seed + ' d' + s.day + ' failed=' + s.failed + ' strikes=' + s.strikes + ' rounds=' + s.rounds + ' end=' + s.end + ' hpEnd=' + s.hpEnd + ' vs ' + s.monsters);
if (!withData) console.log('no r128 move data (pre-r128 corpus) — the r128 wraps did not run on this corpus; the refusal question is UNTESTED here.');
