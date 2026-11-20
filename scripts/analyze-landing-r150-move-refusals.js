// R150 MOVE-REFUSAL analyzer (landing r150, deduped-vs-silent split).
// Copy of scripts/analyze-landing-r128-move-refusals.js with ONE change:
// the `silent-noline` bucket is split (r149 metric-review item 2) into
//   deduped-refusal — no lines AND the last spoken line in the fight (any
//     turn type, in log order) is itself a refusal-pattern line. The engine
//     dedupes consecutive identical lines (Steve 2026-10-05: "never say the
//     exact same thing twice in a row"), so a second identical refusal in
//     the same turn leaves no line — the refusal happened, the player saw
//     it once. This is NOT a narration gap.
//   silent-noline — no lines and no preceding refusal line: truly silent.
//     A count here is a Q1 investigation item.
// The split tracks the last SPOKEN line (most recent non-empty lines in log
// order), not the previous entry's lines: a silent entry carries no lines,
// so chaining off the previous entry would break the dedup chain after the
// first silent attempt (r149: 29 silent dodge attempts in one turn, all
// after one spoken "Too far — 3 squares left.").
// BACK-COMPAT (run before any panel uses r150):
//   r149 BEFORE corpus (landing-r149-after): byReason was
//     {"nopath":5,"toofar":2,"silent-noline":41} — the 41 split into
//     deduped-refusal 41, silent-noline 0 (29 dodge + 12 Spool-approach,
//     each after a spoken refusal in the same turn); nopath/toofar unchanged.
//   r149 AFTER corpus (landing-r149-after-fix): 0 failed moves, no change.
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
//   no lines at all + ret false   -> R150 split: 'deduped-refusal' when the
//                                  last spoken line in the fight is itself a
//                                  refusal-pattern line (the engine's
//                                  consecutive-duplicate dedup said it once
//                                  and refused to repeat it — the refusal
//                                  happened, the player saw it once); else
//                                  'silent-noline' (truly silent — a Q1
//                                  investigation item, never assigned a cause:
//                                  a not-player-turn refusal also speaks no line)
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

function isRefusalLine(l) {
  const s = String(l || '');
  return /^No path there/.test(s) || /^Too far/.test(s) || /stroll through/.test(s) || /^No movement left/.test(s);
}

function reasonOf(lines, ret, lastSpokenLine) {
  if (!lines || !lines.length) {
    if (ret) return 'silent-mute';
    // R150 split: a refused move with no line right after a spoken refusal
    // line is the engine's consecutive-duplicate dedup, not silence.
    if (lastSpokenLine && isRefusalLine(lastSpokenLine)) return 'deduped-refusal';
    return 'silent-noline';
  }
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
    // R150: iterate the full log in order so lastSpokenLine tracks the most
    // recent spoken line across ALL turn types (the engine dedup compares
    // against the immediately preceding say-line, whatever spoke it).
    let lastSpokenLine = null;
    for (const e of log) {
      if (e.turn !== 'player-move') {
        if (e.lines && e.lines.length) lastSpokenLine = String(e.lines[0] || '');
        continue;
      }
      totalMoves++;
      const site = (e.to && (e.to[0] === 0 || e.to[0] === 8)) ? 'flee-walk' : 'dodge/approach';
      bySite[site] = (bySite[site] || 0) + 1;
      if (e.moved && e.posMoved === false) movedLie++;
      if (e.posMoved === false) {
        failed++;
        failedMoves++;
        const r = reasonOf(e.lines, e.moved, lastSpokenLine);
        byReason[r] = (byReason[r] || 0) + 1;
        const k = site + '/' + r;
        byReasonSite[k] = (byReasonSite[k] || 0) + 1;
      }
      if (e.lines && e.lines.length) lastSpokenLine = String(e.lines[0] || '');
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
