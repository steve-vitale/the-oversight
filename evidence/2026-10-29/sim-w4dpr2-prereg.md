# sim-w4dpr2 — PREREGISTRATION (binding, committed BEFORE any judged run)

Run: fleshout loop, run fleshout-20261029T0145Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-w4dpr2.
Assignment: WAVE-4 PER-ROUND DAMAGE/SURVIVAL DIAG — measurement
only, zero game change, zero behavior change, zero roster/list
feed into any decision (PERCEPTION LAW, Steve 2026-10-28). This
arm records what happened; it does not change what villagers do.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave-4
bands damage 35–95, HP 850–1500, pierce 0.2–0.5; a 4–6 round
fight for a godhood build at ~220 dmg/round; wave-4 gate
standing >= 100 plus the combat-readiness bars). No
CANON-registered doc covers per-round field-fight damage
decomposition — that gap is stated here instead of invented
canon. The mechanism below is derived from code, stated
exactly so it can be checked:

- FIELD FIGHT (src/js/fieldFights.js, fieldFight): blow-by-blow,
  round cap 15 (MAX_ROUNDS), leader strike lroll([4+wb, 8+wb])
  with wb = round((meleeBonus + rangedBonus)/2) from EQUIPPED
  gear, ally strike gear-blind lroll([3, 6]) mean 4.5, at most
  ONE ally ever joins (shift once; helpCalled guard). A bow +
  real ammo opens with a volley before round 1 (shots =
  min(ammo, clamp(1+floor(range/monster speed),1,4)), each
  0.85-0.06xrange hit chance). Every fight returns a record
  {outcome, rounds, vTaken, mDealt, vHpLeft, mHpLeft, log,
  fleeHopeless, fleeLearn, everHopeless, calledHelp, allyVid,
  allyDealt, allyTaken, ...} — the log is the engine's own
  round transcript, and this arm parses THAT log for
  per-round numbers (never a re-simulation, never a model).
- ROUND-END BREAKS (fieldFights.js, in order): leader HP <= 0
  -> vDie; lead HP <= 0 -> vKill; round >= 2 trajectory
  (hopeless = rounds-to-drop-villager < rounds-to-kill-lead
  x 0.85; winning = kill-lead-first or trade) -> learn
  withdrawal (intent learn, round >= 3, not winning ->
  vFlee, fleeLearn), hopeless shout (help near -> ally
  joins, fight continues), hopeless alone -> vFlee
  (fleeHopeless), wound floor (vHp/vHpMax < fleeAt ->
  vFlee, fleeHopeless false unless the hopeless branch
  set it); monster break line (lead HP fraction < mBreak
  -> mFlee); round cap reached with no outcome -> the
  worse-off side disengages (vFlee or mFlee by HP
  fraction, logged "Neither gives after 15 rounds").
- PRIOR-ARM NUMBERS THIS ARM DECOMPOSES (prior art, not
  canon — cited as such): fieldability-a (earnable best
  machete+bow dual 48.25 sustained DPR + 32 volley one-shot;
  850-HP beast needs 17.6 rounds vs the 15-round cap;
  hunting-spear full damage-ability stack ~39.5; tricks
  are not damage; only alien-tier weapons reach 57–80;
  spear occupies the ranged slot so a carried bow is
  never equipped); sortiedpr-a (mustered parties median
  16.0 DPR; kills 35 all of beasts starting <= 64 HP;
  healthy beasts >= 91 HP: 0 kills in 12 fights; wave-4
  sorties 0 kills / 0 drive-offs in 7 fights, 4 leader
  deaths); staying-a pilot (parties flee rounds 2–3; 5 of
  9 judged wild flees are wound-floor breaks); chainkill-a
  (chained-beast terminal HPs 501–1177, median 900).

## Fresh band (this arm's own sweep, base code)

- Seeds 75101–75116 (16, the chainkill/returns band verbatim,
  so wall numbers are comparable), scripts/policies/
  tableseat-nowait.js VERBATIM, LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, FIELDPARTY=1 (fieldparty-form-diag
  recorder, reused VERBATIM, never edited) PLUS the new
  w4dpr recorder (scripts/policies/w4dpr-diag.js, W4DPR=1;
  observational only, pure pre-reads, no game writes, no
  RNG draws, never throws into the engine). 180d death-aware
  (runDays stops on death/win, as in the predecessor
  sweeps), competent policy (tableseat-nowait wraps
  leanlinkrescue courtship, same as chainkill/returns).
- WHY 16 SEEDS: the returns band's 42 judgedA wave-4 field
  meetings are the decomposition universe; reusing the band
  exactly lets this arm decompose the known fight set
  instead of drawing a new, incomparable one. Seeds are
  nearly free (Steve 2026-10-13).

## Universe and decomposition (fixed before judging)

- UNIVERSE U: every meeting with wave == 4, channel ==
  'field', caller in {resolve, patrol, aid}, leader NOT the
  scholar — judgedA verbatim from chainkill/returns. A
  wave-3 slice (same caller/channel/leader rule, wave == 3)
  is recorded as CONTRAST ONLY, never pooled into U.
- FOUGHT vs UNFOUGHT: fights with rounds >= 1 are the
  decomposition corpus; evade / alreadyDead / round-0
  volley-only outcomes are counted separately and never
  averaged into per-round DPR (a round-0 fight has no
  rounds to divide by — the sortiedpr-a rule, kept).
- PER-ROUND PARSER (engine log, not a model): for each U
  fight the recorder stores the fight record's log
  verbatim. The analyzer parses, per round r = 1..rounds:
  leaderDealt (leader strike lines "Rr: <name> strikes for
  N"), allyDealt (ally strike lines, incl. "strikes
  again"), leaderTaken (monster-hit-leader lines "Rr:
  <atk> hits <leader> for N"), allyTaken (monster-hit-ally
  lines), plus volleyDealt as round 0 (pre-round "loosed"
  lines). VALIDATION LEG: parsed dealt sum vs rec.mDealt
  and parsed taken sum vs rec.vTaken + rec.allyTaken must
  match EXACTLY on every corpus fight whose log carries
  strike/hit lines; any fight where they differ is
  reported as PARSE-MISMATCH with its delta, never
  silently adjusted, and the mismatch rate is reported
  alongside every DPR number (a DPR built on a mismatched
  parse is labeled, not trusted). Signature heals
  (e.g. redactor un-write) move HP without moving mDealt,
  so HP trajectory is reported as mHpStart - cumulative
  dealt + logged heals where the log names them, and net
  HP-delta DPR is reported beside gross dealt DPR.
- COMPOSITION / LOADOUT (per fight, from the fieldparty
  record joined by fight-order index, verified on
  mid/vid/day at every index — the returns join method):
  party size as FOUGHT (1 = leader alone, 2 = leader +
  joined ally; joined-from-start vs shout-joined kept
  distinct), leader armed / armorP, leader weapon ids
  (melee + ranged equipped entries read purely at fight
  time by the recorder — spear-in-ranged-slot competition
  is therefore visible, never assumed away), allyDealt
  share, trickKnown, intent, everHopeless, everWinning.
- BREAK REASONS (exactly one per fought fight, in this
  priority order — first match wins, never pooled):
  1. KILL (outcome vKill).
  2. DRIVE-OFF (outcome mFlee AND rounds < 15 AND no
     cap line — includes trick drive-offs, which are
     flagged trickExit when the log names a trick exit).
  3. CAP (rounds == 15 AND the log carries "Neither
     gives after 15 rounds" — reported with its vFlee /
     mFlee sub-outcome, never pooled into hopeless or
     wound-floor).
  4. PARTY-DEATH (outcome vDie).
  5. HOPELESS (outcome vFlee AND fleeHopeless true).
  6. LEARN-WITHDRAWAL (outcome vFlee AND fleeLearn true
     AND fleeHopeless false — the learn-first exit; kept
     distinct from hopeless, never pooled into it).
  7. WOUND-FLOOR (outcome vFlee AND fleeHopeless false
     AND fleeLearn false — the staying-a wound-floor
     class: the bravery-floor check fired without a
     hopeless trajectory).
  8. TRICK-EXIT (outcome vFlee set inside a trick branch
     before the round-end morale block — flagged only
     when the log names it; otherwise falls through to
     5–7 by flags).
  9. OTHER (none of the above — must be 0 for a GO; any
     OTHER fight is listed by seed/day/mid in the
     evidence, not hidden).
  Evade / alreadyDead are NOT break reasons: they are
  un-fought meetings, counted outside the break shares.
- KILL-REQUIREMENT ARITHMETIC (per fight and in
  aggregate): required rounds = mHpStart / observed
  sustained DPR, where sustained DPR = mDealt / rounds
  (fought fights only); cap-fit = required rounds <= 15.
  Reported (a) at each fight's own observed DPR, (b) at
  the corpus median / quartile sustained DPRs, (c) at
  the fieldability 57–80 band for contrast — (a) and (b)
  are the judgment numbers; (c) is the yardstick, not
  the claim. Also reported: rounds the party actually
  survived vs rounds the kill required (the survival
  gap), and damage taken per round vs the wave-4 band
  (35–95 incoming before armor).

## Questions and metrics (fixed before judging)

- PRIMARY Q: what does a wave-4 field fight look like,
  round by round — damage dealt per round by
  composition/loadout, damage taken per round, how many
  rounds the party survives, and why it ends?
- SECONDARY: at the DPR parties actually sustain, how
  many rounds does a kill require, and does it fit the
  15-round cap? (Cap-fit at OBSERVED DPR, not just at
  the 57–80 band.)
- GUARDS (reported, not judged): death-cause shares; any
  survival guard must be RELATIVE (armed vs control) or
  recalibrated — never the absolute 120d bar, because
  the 1736Z finding showed the control band median is
  118d, making 120d unpassable even with no change.
  This arm makes NO game change, so no guard can move;
  guards are reported for the band's own sake.

## Sense-testing law (transcripts read + quoted)

- S1 (corpus-derived): at least ONE full wave-4
  field-fight trace from the corpus log quoted VERBATIM
  (every round line, volley to break), judged as a
  played fight: does it read as people fighting (meaning
  and coherence — strikes, wounds, shout, retreat line),
  or as numbers without a fight? If the longest corpus
  fight is a 1-round flee, that IS the reading, stated
  as such — a longer fight is quoted instead only if
  one exists, and the choice is disclosed.
- S2 (fixture, base code): a parser-leg fixture — a
  driven field fight (machete+bow vs audit, fieldability
  shape) whose rec.log is parsed by the analyzer's
  parser and whose parsed sums are checked against
  rec.mDealt / rec.vTaken + rec.allyTaken. The fixture's
  job is the parser + the reading, not a kill claim.

## Bars (judge against this header; a miss is DIAG-NO-GO)

- COVERAGE: at least 16/16 valid seeds AND at least 20
  wave-4 field fights each carrying a break reason AND
  at least 90% of the corpus's wave-4 field fights
  carrying a break reason (break reason assigned =
  classes 1–8 above; OTHER counts against the 90%).
- DETERMINISM GATE: re-run seed 75106 into a scratch
  dir; its row JSON must be byte-identical to the
  corpus row. A diff is an instrument failure to report,
  not a footnote.
- WALL REPRODUCTION (recorder neutrality, exact bar
  from returns-a): wins 4/16 all lesser, nationalEver
  13/16, deaths 600, per-seed judgedA counts 75106: 15,
  75108: 9, 75109: 8, 75115: 5, 75116: 4, 75110: 1, all
  other seeds 0. Any deviation is an instrument failure
  to report, not a re-score.
- SENSE BAR: >= 1 corpus fight trace quoted verbatim
  (S1) AND the parser fixture read + quoted (S2).
- DIAG-GO BAR: coverage AND determinism AND wall
  reproduction exact AND sense legs AND one ranked next
  step named with numbers. Any leg missed ->
  DIAG-NO-GO. No re-scoring against a friendlier metric
  mid-run; metric doubts go under "metric review" in
  the evidence file.

## What this arm does NOT do

No src/js change, no policy change, no default flip, no
fight routing, no feed, no roster read, no narration fix,
no push, no bump, no live verification. No re-judgment
of predecessor verdicts (chainkill DIAG-GO, returns
DIAG-GO, fieldability DIAG-GO, sortiedpr DIAG-GO,
staying PILOT NO-GO all stand). No wall movement claimed
from re-analysis. No panel artifact (standing exception:
the panel has no census-ingest mode; identical-seed
corpora are the §15 substitute, as in prior rounds).
Instruments: scripts/policies/w4dpr-diag.js (new
recorder, diag only), scripts/test-w4dpr2-sweep.js
(fresh band), scripts/test-w4dpr2.js (analyzer +
judge), scripts/test-w4dpr2-fixtures.js (parser
correctness on fixtures + driven fight), scripts/
test-w4dpr2-sense.js (corpus trace + fixture reading).
Each must pass `node --check`; analyzer + fixtures +
sense must print green. Never run concurrent jest;
cache dir /tmp/jest-cache-sim-w4dpr2 (no jest expected
— node scripts only; the rule is recorded, not waived).
Never touch docs/ONTOLOGY.md. Never touch the sibling
worker's tree (~/workspace/worktrees/sim-funnel-a) or
its files. Never touch branch sim-w4dpr-a. Never touch
the main tree or any other worktree.

## Metric review (filled at judging time)

- (to be filled when the analyzer runs)
