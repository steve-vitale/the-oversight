// spikecontact-parse-20261031.js — shared fight-log parser for
// sim-spikecontact-a (used by the analyzer AND the recorder policy,
// so the two can never drift apart).
//
// Proven blow: lead-strike damage after multipliers, >0 only. A lead
// strike is a log line `R<n>: <name> strikes for <vd>` that is the
// FIRST "strikes for" line of its round (the lead strikes before any
// ally in a round; ally "strikes again" lines never match, and a
// later same-round ally "strikes for" line is excluded by the
// first-per-round rule). Volley ("loosed"), ambush ("Opening
// strike"), collision, and monster lines never match a lead strike.
// A 0-damage strike line is dropped (not proven).
'use strict';

const BREAK_MARKER = 'breaks — wounded past its line';
const COMMIT_MARKER = '(Committed finish, two-blow)';
const OUTCOME_RE = /(breaks — wounded past its line|turns and runs|The lead falls|flees|runs while running still works|stands down|backs off, disengaging|already dead|gave it room|drove .* off with the bow)/;

function logTruncated(lines) {
  const hasOutcome = lines.some(l => OUTCOME_RE.test(l));
  const lastIsRound = lines.length > 0 && /^R\d+:/.test(lines[lines.length - 1]);
  return lastIsRound && !hasOutcome;
}

// Returns { strikes: [{round, dmg}], truncated, damageSum, lines }.
// damageSum = sum of ALL parsed damage-to-lead components (lead
// strikes + ally strikes + volley hits + ambush opener), for the
// reconciliation validation used where engine twoblow fields are
// absent (baseline legs, pre-rule code). truncated is computed on
// the log AS PASSED.
function parseLeadStrikes(log) {
  const lines = Array.isArray(log) ? log.map(String) : [];
  const byRound = new Map();
  const order = [];
  let damageSum = 0;
  for (const line of lines) {
    let m = /^R(\d+): (.+?) strikes for (\d+)/.exec(line);
    if (m) {
      const round = parseInt(m[1], 10);
      const dmg = parseInt(m[3], 10);
      damageSum += dmg;
      if (dmg <= 0) continue;
      if (byRound.has(round)) continue;
      byRound.set(round, dmg);
      order.push({ round, dmg });
      continue;
    }
    m = /^R\d+: .+? strikes again(?:, louder)? — (\d+)/.exec(line) || /^R\d+: .+? strikes again for (\d+)/.exec(line);
    if (m) { damageSum += parseInt(m[1], 10); continue; }
    m = /loosed — it takes .* for (\d+)/.exec(line) || /Opening strike for (\d+)/.exec(line);
    if (m) { damageSum += parseInt(m[1], 10); continue; }
  }
  return { strikes: order, truncated: logTruncated(lines), damageSum, lines: lines.length };
}

// Strikes strictly before the LAST commit line (or null if no commit
// line). The engine overwrites twoblowCommitMhp/twoblowCommitSum at
// every re-fire, so recorded engine truth describes the last firing.
// Truncation is judged on the FULL log, never on the slice.
function parseStrikesBeforeCommit(log) {
  const lines = Array.isArray(log) ? log.map(String) : [];
  let idx = -1;
  for (let i = 0; i < lines.length; i++) if (lines[i].indexOf(COMMIT_MARKER) >= 0) idx = i;
  if (idx < 0) return null;
  const sliced = parseLeadStrikes(lines.slice(0, idx));
  sliced.truncated = logTruncated(lines);
  return sliced;
}

module.exports = { parseLeadStrikes, parseStrikesBeforeCommit, logTruncated, BREAK_MARKER, COMMIT_MARKER, OUTCOME_RE };
