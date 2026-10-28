# sim-retreatdiag-a — PREREGISTRATION (binding, committed BEFORE any judged census)

Run: fleshout loop, run fleshout-20261028T1942Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-retreatdiag-a.
Assignment: formed-but-retreated DIAGNOSIS ONLY — zero src/js, zero
default flips, zero game-code changes. This arm classifies and
quantifies; it does not build the fix. Sibling arm sim-perceptform-a
builds perception-based formation in parallel; this arm touches no
fight routing, no allyFromStart, no game file. Files this arm may
create: scripts/test-retreatdiag-a*.js, evidence/2026-10-28/
sim-retreatdiag-a-prereg.md (this file), sim-retreatdiag-a.md,
evidence/2026-10-28/perseed-retreatdiag-a/ (fresh-band corpus +
analysis outputs only). No other arm's corpus is ever overwritten.

## Canon read first

docs/CANON.md, then docs/PARTY.md (party dynamics) and
docs/MONSTER-WAVES.md (wave law) — the area docs for this question.
No canon doc covers the retreat trigger itself; the design record is
the fieldFights.js morale block (Steve 2026-10-09: morale is
situational — trajectory legible after round 2, hopeless + help
near → shout, hopeless + alone → believable flight) plus the
PARTY-UP comment (Steve 2026-10-09: "when the trajectory turns
hopeless and help is near, they shout instead of scattering").
The hopeless formula, read from code (not invented): from round 2,
vDpr = mDealt/round, mDpr = vTaken/round, rtk = lead.hp/vDpr,
rtd = vHp/mDpr, hopeless = rtd < rtk*0.85; winning = rtk <= rtd*1.1.
Round cap 15 (MAX_ROUNDS): past it the worse-off side disengages
(vFrac <= mFrac → vFlee). Beast break line mBreak = 0.15 for
wave >= 2 (lead HP fraction below it → mFlee). One ally answers
per fight. Perception law (Steve 2026-10-28 12:48 CDT) is respected
by construction: this arm measures only, and its formation inputs
are the predecessors' corpora, not a new feed.

## Input corpora (predecessors' work, cited — NOT re-judged)

- Shoutgate armed band: evidence/2026-10-28/perseed-shoutgate-a/
  (s<seed>-armed.json), judged by sim-shoutgate-a.md: 14 judged,
  12 FORMED (10 vFlee, 2 vDie), 10 FORMED-STRUCK, 0 non-retreating,
  0 field kills. Judged set (reused VERBATIM from
  scripts/test-shoutgate-a.js): wave 4, channel field, caller
  resolve/patrol/aid, leader a villager (not the scholar);
  FORMED = crewed (crewRaw minus leader non-empty) AND
  (calledHelp OR joinedAllyVid non-null).
- Fieldfeed pilot band: evidence/2026-10-28/perseed-fieldfeed-a/
  (s<seed>-armed.json), judged by sim-fieldfeed-a.md: 9 judged,
  4 FORMED, all vFlee (formed-but-retreated). Judged set (reused
  VERBATIM from scripts/test-fieldfeed-a-analyze.js): wave 4,
  channel field, caller resolve/patrol, leader a villager;
  FORMED = calledHelp AND joinedAllyVid non-null.
- Combined classified universe: 16 formed-but-retreated parties
  (12 + 4). A party is one recorder row = one fieldFight
  invocation (predecessor convention). Caveat, stated up front:
  wounds persist onto the world beast (m.hp = mHpLeft when it
  lives), so a later row can meet the SAME already-wounded beast;
  mHpStart is therefore the HP the party actually faced, NOT
  the beast's max HP. Stay-to-kill math uses mHpStart throughout.

## Fresh band (this arm's own census, base code)

- Seeds 75101–75108, scripts/policies/tableseat-nowait.js VERBATIM,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware (runDays
  stops on death/win, as in the predecessor sweeps), competent
  policy, fieldparty-form-diag recorder only (no outdoorcrew
  layer, no other policy layer — the shoutgate/earlycrew substrate
  policies were deleted at their closeouts and are NOT restored).
- CONTROL-SHAPE CHECK (must pass before any classification is
  trusted): on this base-code band, wave-4 field meetings are
  all solo (formed 0 on both the resolve/patrol/aid judged cut
  and the resolve/patrol cut) and wave-4 field kills are 0 —
  matching the 1528Z control shape (24 field meetings all solo,
  field kills 0). If the shape does NOT match, the census
  instrument is suspect: stop, report, do not classify.
- Wall numbers for the fresh band (reported, never claimed as
  movement): national ever/final, table invited/entered, wins
  (lesser/full), wave-4/5 reach, median survival, death-cause
  shares. NO wall movement is claimed from re-analysis alone —
  the fresh band is a control-shape check, not an intervention.

## Questions and classification scheme (fixed before judging)

Q1 — named retreat trigger, per formed party. Trigger classes,
in code order (fieldFights.js morale block):
  - HOPELESS-REFIRE: outcome vFlee AND fleeHopeless = true
    (the hopeless branch fired again after the ally had joined;
    rally/war-cry did not hold the line).
  - HP-FLOOR: outcome vFlee AND fleeHopeless = false AND
    fleeLearn = false (the bravery floor broke them, not the
    trajectory formula).
  - LEARN-WITHDRAWAL: fleeLearn = true (learn-intent withdrawal
    at round >= 3, not winnable).
  - DEATH: outcome vDie (HP reached 0; flee flags moot).
  - OTHER: anything else — must be 0. An OTHER row is an
    unclassified party.
  Per party also recorded: rounds, mHpStart, mDealt, vTaken,
  allyDealt, allyTaken, leader armed/armorP, ally vid,
  everHopeless, everWinning, intent, monster id (mid), caller,
  seed/day. Composition: party size is always 2 (one ally
  answers per fight — verified per row via joinedAllyVid +
  engineAllies, reported if ever otherwise).
Q2 — stay-to-kill gap, per party, at OBSERVED rates only:
  - partyDPR = mDealt / rounds (total party damage per round;
    mDealt already includes allyDealt).
  - killRounds = mHpStart / partyDPR (rounds to lead HP 0).
  - driveOffRounds = 0.85 * mHpStart / partyDPR — an UPPER bound
    on rounds to the 15% mFlee break line, because a pre-wounded
    beast's max HP exceeds mHpStart, so the true damage-to-break
    is smaller.
  - remainingAtFlee = mHpLeft / partyDPR (rounds still needed
    at the moment of retreat).
  - monsterDPR = (vTaken + allyTaken) / rounds.
  - Cap test: killRounds > 15 means even a never-fleeing party
    cannot kill inside the round cap (it hits the round-cap
    disengage as the worse-off side); driveOffRounds > 15 means
    it cannot even drive the beast off inside the cap.
  - A party is stay-to-kill QUANTIFIED if mDealt, rounds, and
    mHpStart are all present and rounds > 0 (all three are
    recorder fields, so 100% is expected; the bar is 80%).
Q3 — single ranked next lever. The arm names ONE lever first
(threshold change / damage change / stay-mechanic / other),
with the numbers behind it, then ranks the rest. No bundle of
three fixes presented as one recommendation.
Q4 — sense-testing law: transcripts of at least 2 retreated
parties read and judged (coherent people judging an unwinnable
fight vs incoherent missing system), beats quoted. Sources:
the predecessors' published sense notes (shoutgate 75106 d109
audit; fieldfeed 75106 d118 influencer) PLUS a fresh
fixture-level fieldFight replay on current base code in the
observed shape (2 fighters vs a wave-4-HP beast, seeded RNG),
whose log beats are quoted in the evidence. A fixture is a
shape replay, not a claim about the band's trajectories.

## Bars (judge against this header; a miss is DIAG-NO-GO)

- CLASSIFICATION BAR: 100% of the 16 input parties classified
  into Q1 classes with OTHER = 0. An unclassified party fails
  this leg outright — it is not a footnote.
- STAY-TO-KILL BAR: >= 80% of classified parties quantified
  under Q2 (killRounds, driveOffRounds, remainingAtFlee,
  monsterDPR).
- CENSUS-VALIDITY LEGS: both input corpora 8/8 rows, recorder
  errs 0, no overflow (re-verified by the analyzer, not taken
  on trust); fresh band 8/8 rows, errs 0, control shape matches
  1528Z (formed 0, field kills 0 on both judged cuts).
- DIAG-GO BAR: classification complete (100%, OTHER = 0) AND
  stay-to-kill quantified (>= 80%) AND one ranked next lever
  named with numbers AND >= 2 sense transcripts read + quoted.
  Any leg missed → DIAG-NO-GO. No re-scoring against a
  friendlier metric mid-run; metric doubts go under
  "metric review" in the evidence file.

## What this arm does NOT do

No src/js change, no policy change, no default flip, no fight
routing, no allyFromStart, no feed, no roster read, no push, no
bump, no live verification. No re-judgment of the shoutgate or
fieldfeed verdicts (NO-GO / pilot-GO-only stand as published).
No wall-movement claim from re-analysis. Instruments are the
analyzer (scripts/test-retreatdiag-a.js), the fresh-band sweep
(scripts/test-retreatdiag-a-sweep.js), and the sense fixture
(scripts/test-retreatdiag-a-sense.js); each must pass
`node --check` and the analyzer/sense proofs must print green
after every rebase. Never run concurrent jest; cache dir
/tmp/jest-cache-sim-retreatdiag-a (no jest is expected — node
scripts only; the rule is recorded, not waived).

## Metric review (filled at judging time)

- (to be filled when the analyzer runs)
