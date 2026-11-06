// mootsummon-diag — moot-turns-to-you summons classifiers
// (sim-mootsummon-a, 2026-11-06, flesh-out loop, axis food-economy).
//
// EXTENSION (sim-mootgate-a, 2026-11-06): the dead-case line
// classifier (isDeadCaseLine / deadCaseName — the ghost-trial
// closure, betrayal.js ~1181) and the LIVE-line accused-set
// extractor (accusedSetFromLive), plus 'dead-case' in BEAT_KINDS
// so the trim keeps the line. Existing classifiers untouched;
// the mootsummon proof (33/33) must stay green on this file.
//
// The transcript recorder + window machinery is REUSED VERBATIM from
// scripts/policies/strandnarr-diag.js (sim-strandnarr-a, 2026-11-04);
// the fire-time position reader is REUSED from
// scripts/policies/gossipcensus-diag.js. This module adds ONLY the
// moot classification on top of that judged instrument — no new
// wrapping, no new RNG, no state edits.
//
// THE SUMMONS (one line, two moots — same text, different machinery):
//   'The moot turns to you. Your vote matters here — and everyone
//   will remember it.'
//   1. TRIAL moot — betrayal.js conductTrial (~1932): said when
//      tallyVotes names the scholar a voter (playerVoter, ~1854:
//      !exiled && !accused && (playerConvened || R() < 0.9) —
//      position-blind except exile). Convened autonomously by
//      npcMootTick / playerCaseTick via callMoot inside
//      betrayalDailyFull at the day boundary, so it CAN fire inside
//      a stranded scholar's sleep window. Context lines in the same
//      window: '🔴 LIVE! THE MOOT! ...' (sysSay, ~1583) and
//      '<X> calls the moot. The fire gets built up ...' (~1592) or
//      'You call a moot. The fire gets built up. ...' (~1586,
//      player-convened trial).
//   2. PETITION moot — villageAgency.js conductPetitionMoot (~802):
//      playerVoter = !exiled; same summons line, awaitingPlayerVote.
//      Called ONLY from app.js:16918 (the player pressing "Call a
//      moot" in the Haven petition panel) — player-initiated,
//      synchronous. A petition summons CANNOT fire inside a stranded
//      sleep window by construction; the census verifies this
//      empirically. Context line: 'You call a moot on it. ...' (~778).
//
// RESOLUTION lines (the follow-up: what happens to the moot):
//   backstop: 'The moot doesn't wait forever. Two days of silence
//     from the fire's edge — the count is taken without you.'
//     (betrayal.js trialVoteTick, ~5538 — 2 days after the summons,
//     awaitingPlayerVote cleared, playerVoter set false, finishTrial
//     resolves without them).
//   exiled: 'The moot doesn't wait for the exiled. The count is
//     taken without you.' (betrayal.js castPlayerVote, ~1945).
//   verdict-count: '"<n> for guilty. <m> against."' (finishTrial,
//     ~2012) — the count, said aloud.
//   verdict: '"Guilty." Nobody looks at anybody.' / '"Not guilty —
//     this time."' (finishTrial).
//   vote-cast: 'Counted.' (betrayal.js convoChoices finish, ~4645 —
//     the conversation reply when the player votes; the census
//     policy never picks a conversation choice, so this is expected
//     absent in sims — its absence is itself the observation).
//   vote-lands: 'Your "guilty" lands in the count, ...' / 'Your
//     "not guilty" lands in the count, ...' (finishTrial).
//
// RETURN line (the mid-window-return rule, adopted from the
// enddaybeats-fix metric review item 1): a summons preceded in the
// same window by 'You walk back into Haven. ...' fired AFTER the
// scholar returned — post-return, not stranded-at-firing. The
// strict window-label count is stated alongside the firing-time
// count so nothing is hidden.
//
// Position at fire time: the nearest marker at or before the
// line's idx (same positionAt as gossipcensus-diag). Inside a
// sleep window the scholar does not move, so the sleep-start
// marker IS the fire-time position.
'use strict';

const gc = require('./gossipcensus-diag');

const SUMMONS_RE = /The moot turns to you\. Your vote matters here/;
const MOOT_LIVE_RE = /🔴 LIVE! THE MOOT!/;
const MOOT_CALL_TRIAL_RE = /calls the moot\. The fire gets built up|You call a moot\. The fire gets built up/;
const MOOT_CALL_PETITION_RE = /You call a moot on it\./;
const BACKSTOP_RE = /The moot doesn't wait forever/;
const EXILED_RE = /The moot doesn't wait for the exiled/;
const DEAD_CASE_RE = /the moot doesn't try the dead/;
const DEAD_CASE_NAME_RE = /^(.+?) is gone — the moot doesn't try the dead/;
const LIVE_ACCUSED_RE = /TONIGHT: (.+?) stands? accused/;
const VERDICT_COUNT_RE = /for guilty\. \d+ against\./;
const VERDICT_GUILTY_RE = /"Guilty\." Nobody looks at anybody/;
const VERDICT_ACQUIT_RE = /"Not guilty — this time\."/;
const VOTE_CAST_RE = /^Counted\./;
const VOTE_LANDS_RE = /Your "(guilty|not guilty)" lands in the count/;
const RETURN_RE = /You walk back into Haven/;

function isSummonsLine(text) { return SUMMONS_RE.test(text || ''); }
function isMootLiveLine(text) { return MOOT_LIVE_RE.test(text || ''); }
function isMootCallTrialLine(text) { return MOOT_CALL_TRIAL_RE.test(text || ''); }
function isMootCallPetitionLine(text) { return MOOT_CALL_PETITION_RE.test(text || ''); }
function isMootCallLine(text) { return isMootCallTrialLine(text) || isMootCallPetitionLine(text); }
function isBackstopLine(text) { return BACKSTOP_RE.test(text || ''); }
function isExiledLine(text) { return EXILED_RE.test(text || ''); }
function isDeadCaseLine(text) { return DEAD_CASE_RE.test(text || ''); }
// deadCaseName(text): the villager named in the ghost-trial closure
// line ("<Name> is gone — the moot doesn't try the dead. ..."),
// or null. The name is the display name (betrayal.js ~1181 uses
// displayName); a LIVE line names the same villager by whoTag,
// which is the npc name post-System — so the two match
// case-insensitively once the System has arrived. Pre-System the
// LIVE line may carry a descriptor instead of a name; then the
// match is unknown, not a miss (see accusedSetFromLive).
function deadCaseName(text) {
  const m = DEAD_CASE_NAME_RE.exec(text || '');
  return m ? m[1] : null;
}
// accusedSetFromLive(text): the accused set named by the trial
// broadcast line ("TONIGHT: NIKOLAI, DANTE AND PAUL stand
// accused — ..."), as an array of upper-cased name tokens, or
// null when the line carries no accused set (not a LIVE line, or
// the System has not arrived so no broadcast was said). 'YOU'
// is kept as a token: the player can stand accused in a
// player-case trial. A single accused returns a 1-element array.
function accusedSetFromLive(text) {
  const m = LIVE_ACCUSED_RE.exec(text || '');
  if (!m) return null;
  return m[1].split(/, | AND /).map((s) => s.trim().toUpperCase()).filter(Boolean);
}
function isVerdictCountLine(text) { return VERDICT_COUNT_RE.test(text || ''); }
function isVerdictLine(text) { return VERDICT_GUILTY_RE.test(text || '') || VERDICT_ACQUIT_RE.test(text || ''); }
function isVoteCastLine(text) { return VOTE_CAST_RE.test(text || ''); }
function isVoteLandsLine(text) { return VOTE_LANDS_RE.test(text || ''); }
function isReturnLine(text) { return RETURN_RE.test(text || ''); }

// kindOf(text): 'summons' | 'moot-live' | 'moot-call-trial' |
// 'moot-call-petition' | 'backstop' | 'exiled' | 'dead-case' |
// 'verdict-count' | 'verdict' | 'vote-cast' | 'vote-lands' |
// 'return' | null.
function kindOf(text) {
  if (!text) return null;
  if (isSummonsLine(text)) return 'summons';
  if (isMootLiveLine(text)) return 'moot-live';
  if (isMootCallTrialLine(text)) return 'moot-call-trial';
  if (isMootCallPetitionLine(text)) return 'moot-call-petition';
  if (isBackstopLine(text)) return 'backstop';
  if (isExiledLine(text)) return 'exiled';
  if (isDeadCaseLine(text)) return 'dead-case';
  if (isVerdictCountLine(text)) return 'verdict-count';
  if (isVerdictLine(text)) return 'verdict';
  if (isVoteCastLine(text)) return 'vote-cast';
  if (isVoteLandsLine(text)) return 'vote-lands';
  if (isReturnLine(text)) return 'return';
  return null;
}

// summonsKind(lines, summonsIdx): 'trial' | 'petition' | 'unknown'
// from the context lines in the same window BEFORE the summons.
// Trial: a LIVE line or a trial call line precedes it. Petition:
// the petition call line precedes it. Both call shapes are said in
// the same synchronous conduct* call as the summons, so the context
// is adjacent; a summons with no context line in its window is
// 'unknown' (reported, not guessed).
function summonsKind(lines, summonsIdx) {
  let sawLive = false, sawTrialCall = false, sawPetitionCall = false;
  for (const l of lines || []) {
    if (l.idx >= summonsIdx) break;
    if (isMootLiveLine(l.text)) sawLive = true;
    if (isMootCallTrialLine(l.text)) sawTrialCall = true;
    if (isMootCallPetitionLine(l.text)) sawPetitionCall = true;
  }
  if (sawPetitionCall && !sawLive && !sawTrialCall) return 'petition';
  if (sawLive || sawTrialCall) return 'trial';
  return 'unknown';
}

const BEAT_KINDS = ['summons', 'moot-live', 'moot-call-trial',
  'moot-call-petition', 'backstop', 'exiled', 'dead-case',
  'verdict-count', 'verdict', 'vote-cast', 'vote-lands', 'return'];

// classifyMootWindow(lines, markers): every moot line in one window,
// with kind, verbatim text, fire-time position, and — for each
// summons — its kind (trial/petition/unknown) and whether a return
// line precedes it in the window (postReturn: fired after the
// scholar walked back into Haven mid-window).
// perKind[k] = { lines, windows } — windows is 1 when the window
// holds >= 1 line of that kind (the primary metric counts WINDOWS,
// not lines). summonsWindows counts windows holding >= 1 summons
// line; summonsAtFiring counts windows holding >= 1 summons line
// that is NOT post-return.
function classifyMootWindow(lines, markers) {
  const hits = [];
  for (const l of lines || []) {
    const kind = kindOf(l.text);
    if (!kind) continue;
    hits.push({ idx: l.idx, loopDay: l.loopDay, phase: l.phase,
      part: l.part, kind, text: l.text,
      position: gc.positionAt(markers, l.idx) });
  }
  const perKind = {};
  for (const k of BEAT_KINDS) perKind[k] = { lines: 0, windows: 0 };
  for (const h of hits) {
    perKind[h.kind].lines++;
    perKind[h.kind].windows = 1;
  }
  const summonsHits = [];
  for (const h of hits) {
    if (h.kind !== 'summons') continue;
    const postReturn = hits.some((x) => x.kind === 'return' && x.idx < h.idx);
    const mootKind = summonsKind(lines, h.idx);
    const sh = { idx: h.idx, loopDay: h.loopDay, phase: h.phase,
      part: h.part, text: h.text, position: h.position,
      mootKind, postReturn };
    h.mootKind = mootKind;
    h.postReturn = postReturn;
    summonsHits.push(sh);
  }
  const summonsWindows = summonsHits.length ? 1 : 0;
  const summonsAtFiring = summonsHits.some((s) => !s.postReturn) ? 1 : 0;
  return { n: (lines || []).length, hits, summonsHits, perKind,
    summonsWindows, summonsAtFiring };
}

module.exports = { isSummonsLine, isMootLiveLine, isMootCallTrialLine,
  isMootCallPetitionLine, isMootCallLine, isBackstopLine, isExiledLine,
  isDeadCaseLine, deadCaseName, accusedSetFromLive,
  isVerdictCountLine, isVerdictLine, isVoteCastLine, isVoteLandsLine,
  isReturnLine, kindOf, summonsKind, classifyMootWindow,
  BEAT_KINDS,
  SUMMONS_RE, MOOT_LIVE_RE, MOOT_CALL_TRIAL_RE,
  MOOT_CALL_PETITION_RE, BACKSTOP_RE, EXILED_RE, VERDICT_COUNT_RE,
  VERDICT_GUILTY_RE, VERDICT_ACQUIT_RE, VOTE_CAST_RE, VOTE_LANDS_RE,
  RETURN_RE };
