// scripts/seatvoice-table-20261016.js — sim-seatvoice (2026-10-16): the
// table-topic overlay. INSTRUMENT ONLY — no game code, no policy.
//
// Applied AFTER the shared villagevoice-lib classifier: for every captured
// beat, tableTopic() decides whether the beat is about the table /
// invitation / sitting. The pre-registered classification rule (written
// before any trajectories were observed — evidence/2026-10-16/sim-seatvoice.md)
// is: the beat references the table, the invitation, or the sitting.
//
// What counts as a REFERENCE (case-insensitive, whole-phrase where noted):
//   the table | table is | table's | invitation | invited | take your seat |
//   ninety dawns | ring of pale | seven doors | overtime | herald |
//   stop the clock | galactic | walked out of the light | first court |
//   arc iv | case is not complete | sat the table | table done |
//   your seat (never "good seat by the fire" — the fireside furniture line)
//   the seat (the furniture line is "good seat by the fire", never "the seat" alone in captures)
//
// The rule is deliberately engine-honest: it keys on the fiction's own
// vocabulary (table.js's "THE TABLE IS SET", overtime.js's "Take your seat
// from Haven to stop the clock", the invitation beats), not on inference.
//
// Villager-voiced (speaker attribution) is NOT decided here — the shared
// lib's classify() decides it (cat in the sense categories + villagerBeat).
// OVERTIME beats are table-related but system-voice: the top-down pressure
// the #372 finding names. They count in the top-down tally, never the
// villager tally. This module reports topic only; the instrument joins it
// with the lib's speaker verdict.
'use strict';

const TOPIC_RES = [
  { re: /the table/i, why: 'the table' },
  { re: /table is |table's/i, why: 'table is/table\'s' },
  { re: /invitation/i, why: 'invitation' },
  { re: /\binvited\b/i, why: 'invited' },
  { re: /take your seat/i, why: 'take your seat' },
  { re: /your seat(?! by the fire)/i, why: 'your seat' },
  { re: /\bthe seat\b(?! by the fire)/i, why: 'the seat' },
  { re: /sat the table/i, why: 'sat the table' },
  { re: /table done/i, why: 'table done' },
  { re: /ninety dawns/i, why: 'ninety dawns' },
  { re: /ring of pale/i, why: 'ring of pale' },
  { re: /seven doors/i, why: 'seven doors' },
  { re: /\bovertime\b/i, why: 'overtime' },
  { re: /\bherald\b/i, why: 'herald' },
  { re: /stop the clock/i, why: 'stop the clock' },
  { re: /galactic/i, why: 'galactic' },
  { re: /walked out of the light/i, why: 'walked out of the light' },
  { re: /first court/i, why: 'first court' },
  { re: /arc iv/i, why: 'arc iv' },
  { re: /case is not complete/i, why: 'case is not complete' },
  { re: /the sky is waiting|sky is waiting/i, why: 'sky is waiting' },
  // sim-seatvoice fix-beats (2026-10-16): the tableWaitTalk lines "Did you
  // see their faces? Too many angles..." and "they're the one who has to
  // sit in it" carry no other topic keyword — these phrases are
  // distinctive table fiction ("things with too many angles to be faces";
  // the sitting), not generic speech.
  { re: /too many angles/i, why: 'too many angles' },
  { re: /has to sit|sit in it/i, why: 'sit in it' },
];

// tableTopic(text) -> { related: boolean, reasons: string[] }
// reasons: the distinct topic phrases that matched (for audit).
function tableTopic(text) {
  const t = String(text || '');
  const reasons = [];
  for (const { re, why } of TOPIC_RES) {
    if (re.test(t) && !reasons.includes(why)) reasons.push(why);
  }
  return { related: reasons.length > 0, reasons };
}

// STANCE_RES: stance keywords for villager-voiced table beats. A beat may
// match several — the instrument reports all; the analyzer picks the first
// listed as primary for counts. Anything unmatched is stance 'unjudged'
// and must be hand-read (sense-read), never force-fit.
const STANCE_RES = [
  { re: /nobody'?s sleeping|afraid|fear|terrified|don'?t know what to do|bleed|dying/i, stance: 'dread' },
  { re: /too many angles|unreal|can'?t believe|look at it|beautiful|holy/i, stance: 'awe' },
  { re: /what are you going to tell it|maybe|hope|better|freedom|end of|worth it|save/i, stance: 'hope' },
  { re: /\bi (want|will|should|need) (to |)(walk|sit|take|go)|my (turn|seat|chance)|why not me|pick me/i, stance: 'ambition' },
  { re: /while we|instead of|for them|feeds? (it|them)|tax|theirs|unfair|we pay/i, stance: 'resentment' },
  { re: /another|again|whatever|anyway|as if|so what|news/i, stance: 'indifference' },
  { re: /\bwhen\b|\bhow\b|\bwho\b|what do we|plan|ready|supplies/i, stance: 'practical' },
];

// stanceOf(text) -> { stances: string[] } — all matching stances, in order.
function stanceOf(text) {
  const t = String(text || '');
  const stances = [];
  for (const { re, stance } of STANCE_RES) {
    if (re.test(t) && !stances.includes(stance)) stances.push(stance);
  }
  return { stances };
}

// CONTEXT_RES: where the beat was heard. Heuristic only; the sense-reads
// judge the real context.
const CONTEXT_RES = [
  { re: /catch fragments|by the fire|overhear|overheard/i, ctx: 'gossip-overhear' },
  { re: /🗣️/u, ctx: 'fireside-chat' },
  { re: /◈/u, ctx: 'system-scene' },
  { re: /funeral|burial|grave|mourns?|eulog/i, ctx: 'funeral' },
  { re: /contest|challenge/i, ctx: 'contest' },
  { re: /audit|door|walked out/i, ctx: 'table-scene' },
];

function contextOf(text) {
  const t = String(text || '');
  for (const { re, ctx } of CONTEXT_RES) {
    if (re.test(t)) return ctx;
  }
  return 'unmarked';
}

// KNOWN-ANSWER fixtures for the proof (RED→GREEN). Each: { t, rel, why }.
const TOPIC_FIXTURES = [
  { t: '◈ THE TABLE IS SET. A ring of pale light waits — take your seat from Haven when you are ready. Nothing is final until you sit.', rel: true, why: 'the invitation beat (table.js) — table-related, system voice' },
  { t: '◈ OVERTIME ×3 — wave 4–5 monsters return as RERUNS (+75% HP, +36% damage). Raids come sooner. The table docks your standing −18. Take your seat from Haven to stop the clock.', rel: true, why: 'overtime beat — top-down table pressure' },
  { t: '⛔ THE HERALD does not notice you the way prey notices a hunter.', rel: true, why: 'herald beat — table-adjacent context' },
  { t: '"The table\'s here. The ring — the light — it\'s just sitting there. Waiting on you."', rel: true, why: 'villager-voiced table line (convoTableOpener pool)' },
  { t: '"Nobody\'s sleeping. The sky is waiting and nobody knows what to do with their hands. What are you going to tell it?"', rel: true, why: 'table-pool line — "the sky is waiting" is distinctive table fiction, rule catches it' },
  { t: 'Someone saves you the good seat by the fire.', rel: false, why: 'fireside furniture — explicitly excluded' },
  { t: '"I need to check the snares before dusk," Mira says.', rel: false, why: 'villager speech, no table topic' },
  { t: 'You stalk for hours and come home empty-handed — but you LEARN.', rel: false, why: 'scholar action, no table topic' },
  { t: 'Mira asks when the invitation will come — "ninety dawns, they said. We just... live, until then?"', rel: true, why: 'villager-voiced invitation talk (hypothetical target line)' },
  { t: 'Joren keeps glancing at the empty chair where Amara sat.', rel: false, why: 'grief beat, no table topic — the #380 lens must not false-positive' },
  { t: '🗣️ Sofia to Irving, by the fire: "Did you see their faces? Too many angles. I keep wondering what they want from us."', rel: true, why: 'fix line (awe) — "too many angles" is distinctive table-alien fiction' },
  { t: '🗣️ Dale to Batyr, by the fire: "Why them? ...Sorry. It\'s just sitting there, and they\'re the one who has to sit in it."', rel: true, why: 'fix line (ambition) — "has to sit" is the sitting' },
];

module.exports = { tableTopic, stanceOf, contextOf, TOPIC_FIXTURES, TOPIC_RES, STANCE_RES };
