# sim-evadeshape-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T0533Z (coordinator-assigned
worker sim-evadeshape-a). Axis: scale-onramp (blocking axis, converging,
NOT converged). DIAG arm, MEASUREMENT ONLY — zero src/js game changes,
no default flip, no gate change, no deed-bar move. Ranked-next arm from
run fleshout-20261030T0420Z + backlog finding #1466 (EVADE TAXONOMY GAP).

## The blank (from prior evidence, not re-judged here)

sim-w4meet-a (evidence/2026-10-29/sim-w4meet-a.md, band 75101–75116,
180d, tableseat-nowait) found exactly ONE meeting ending without a
fight: seed 75110 day 51, Ellis vs Eater, "saw The Eater in time and
gave it room" — a PRE-CONTACT-EVADE class its outcome taxonomy
lacked, which failed its taxonomy leg (OTHER = 1) and made its
verdict DIAG-NO-GO on that leg alone. Band-wide, evades were
182/2,248 all-wave meetings (8%) in that corpus, but the w4meet
analyzer never characterized them: no by-wave split, no
warned/unwarned split, no party split, no aftermath, and no sense
read of evade logs beyond the single wave-4 line. This arm fixes
the taxonomy first and then censuses evades as a meeting shape.

RE-DERIVATION CLAUSE (binding): this run's own corpus IS the
baseline. NEVER quote w4meet's band numbers (21 wave-4 meetings,
182 evades, 8%) as current. Any comparison to w4meet is a drift
diagnostic only, never a GO/NO-GO leg. If this corpus diverges
from w4meet's, the divergence is reported, not forced.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (Wave 4: The Mirror Draft;
gate village standing >= 100; readiness gate design call #4
2026-10-16) and docs/MEASUREMENT.md §§9–12, 14–15 (staged seeds,
death-aware horizons, pre-registration, metric binding, balanced
panels). NO CANON-registered doc covers an evade census or an
evade taxonomy — the taxonomy, warned definition, and aftermath
rules below are stated exactly so they can be checked, and are
NOT canon claims. Governing canon rules: CANON.md "Monster
encounters are fought, not rolled" (an evade is explicitly NOT a
fight — see the taxonomy definition), and the perception law
(Steve 2026-10-28): tile-mate presence, crew, and prior-meeting
signals below are REPORTED from recorded state only — never fed
into any decision, never a roster feed. The analyzer reads
recorded rows; it does not re-derive who was around from a list.

Engine ground truth for the definition (read from src/js, not
invented): fieldFights.js pre-fight awareness check — base 0.35
+ tracking bonus (capped +0.30) + behavior modifier + speed /
notice / size terms + potential bonus + ability bonuses
(game_sense +0.10, tracker +0.05, echo_location +0.10 at night)
+ godpath fieldEvade modifiers, clamped [0.05, 0.90]; on success
rec.outcome = 'evade', rec.log gets exactly one line,
"<Name> saw <beast> in time and gave it room.", and the fight
returns before round 1. Villager-agency then credits the evader:
monsters-known +1, tracking XP +2 (x2 if potential), and an
'evaded <id>' expedition encounter note. Progression: evade
records nothing on the wave ledger and does not count as facing
for the deed gate ("evade ... no fight" — progression.js).

## Band and substrate (binding)

- Seeds 75101–75132 (32 — wider than w4meet's 16, specifically
  because evades at wave 4 are rare: one in 16 seeds cannot
  characterize shape), 180d death-aware horizon (death-aware:
  dead villages stop simulating, +10d tail max per the harness;
  180d is the w4meet horizon verbatim, so the wider band stays
  comparable).
- Game substrate VERBATIM: scripts/policies/tableseat-nowait.js,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1.
- Recorder stack VERBATIM (w4meet's full stack, never edited, so
  joins are identical): fieldparty-form-diag, w4dpr-diag,
  breakline-diag, tilejoin-diag, shoutrec-diag,
  joinendlines-diag (BREAKLINE=1, TILEJOIN=1, SHOUTREC=1,
  JOINENDLINES=1). These recorders are record-only.
- ONE NEW RECORDER, measurement/tooling only, record-only:
  scripts/policies/evadelog-diag.js (EVADELOG=1). Reason, stated
  before the sweep: w4dpr stores the full rec.log ONLY for wave
  3/4 fights, so waves 1/2/5 evade log lines are NOT in the
  verbatim stack's corpus (verified on the w4meet corpus: a
  wave-2 evade row carries log = null while a wave-3 evade row
  carries its line). The sense leg of this arm requires every
  evade line, all waves, so the new recorder stores, per evade
  only, {day, vid, mid, wave, log verbatim}. It wraps fieldFight
  after delegating, draws no RNG, never throws into the engine,
  touches only its own store — the same record-only pattern as
  the verbatim stack. It is NOT index-joined (its count is
  cross-checked against the joined evade count instead). It
  changes no game outcome: the judged band has no before/after
  comparison, and determinism is still gated by a byte-identical
  re-run of one seed under the same stack.
- Sweep stores deathsDetail (day, who, cause, player, kind from
  the harness's live death capture) alongside the aggregated
  death summary, so after-evade villager survival can be checked
  against recorded deaths. If the death `who` format does not
  match the meeting `vid` format, the deaths-match leg is
  reported as UNMATCHABLE and survival is reported by
  last-appearance only — never by guessing a name mapping.
- New code only: scripts/test-evadeshape-a-sweep.js (a copy of
  the w4meet sweep writing to perseed-evadeshape-a, seeds
  75101–75132, plus deathsDetail + evadelog store),
  scripts/policies/evadelog-diag.js, and
  scripts/test-evadeshape-a.js (a pure analyzer: reads corpus
  JSON, never touches game state; fixtures + --analyze + --sense
  (evade lines) + --detgate support).
- Balanced panel (§15): NOT APPLICABLE — this is a DIAG census
  on a fixed band, not a before/after lever comparison. No panel
  compare is claimed. Pilot gate (§9): the band IS the pilot
  (32 seeds, one substrate, no confirm spend); no lever exists
  to confirm. The 1-seed taxonomy audit below is a pre-judged-
  band instrument check, not a confirm.

## Universe and taxonomy (binding, fixed here)

UNIVERSE: every joined row, ALL waves (1–5+), all channels, all
callers, scholar-led included (flagged as a sub-row, never
silently pooled or silently dropped). The EVADE SUB-UNIVERSE is
every joined row classified PRE-CONTACT-EVADE. The wave-4 evade
sub-subset is reported separately and never pooled into the
all-wave shape verdict without being named.

SHAPE (meeting shape = fieldparty `channel`, verbatim):
- wild = channel 'field'; raid = channel 'raid'; other = channel
  'other' (expedition-caller meetings, per the recorder: channel
  'other' iff the monster is not live AND the caller is expedition).
  Any newly discovered shape gets NAMED, not forced into a bucket.

OUTCOME (one class per meeting, in this order — w4meet's order
with PRE-CONTACT-EVADE inserted FIRST, before scatter, because
it is the class this arm adds; the order matters only where two
rules could match, which they cannot: outcome values are
distinct):
- PRE-CONTACT-EVADE: rounds < 1 AND outcome 'evade'.
  DEFINITION (exact): the pre-fight awareness check succeeded —
  the villager saw the beast in time and gave it room. NO fight
  took place: rounds = 0, no damage either way is EXPECTED
  (mDealt = 0 AND vTaken = 0; any evade row violating this is
  flagged EVADE-DAMAGE-ANOMALY and counted separately, never
  silently reclassified). The beast is unharmed by the meeting
  (mHpLeft = its meeting HP; mHpStart is null on the expedition
  channel, which records no live start HP — stated, not filled
  in). The villager's senses, not gear, decide it in fiction:
  the log credits sight ("saw ... in time"), and the engine
  formula is awareness/tracking/ability-based. Gear at meeting
  is REPORTED alongside every evade (armed, armorP) so a gear
  story can be checked and, if absent, refused — never assumed.
- PRE-CONTACT-SCATTER: rounds < 1 AND outcome 'mFlee'.
  The beast left before contact; the villager did not evade it,
  it scattered. Distinct from evade by the outcome field alone
  (evade = villager avoidance; mFlee = beast departure).
- PRE-CONTACT-KILL: rounds < 1 AND outcome 'vKill'.
- KILL: rounds >= 1 AND outcome 'vKill'.
- DRIVE-OFF: rounds >= 1 AND outcome 'mFlee'. The beast fled
  AFTER a fight — distinct from scatter (no fight) and from
  evade (no fight, villager avoidance).
- FLEE: rounds >= 1 AND outcome 'vFlee', sub-split by breakline
  branch (HOPELESS-BRANCH / FLOOR-BRANCH / LEARN-BRANCH / CAP /
  TRICK-EXIT). The villager fought, then fled — distinct from
  evade (no fight at all).
- DEATH: rounds >= 1 AND outcome 'vDie'.
- OTHER: anything else. OTHER > 0 fails COMPLETENESS.

The four-way distinction the taxonomy must never blur:
evade (no fight, villager saw first) vs flee (fight, then
villager left) vs drive-off (fight, then beast left) vs
scatter (no fight, beast left). All four are decided from
recorded (rounds, outcome) only — never from a roster feed,
never from intent, never from the log text (the log is sense
evidence, not the classifier).

PARTY AT MEETING (recorded state only, no engine "party"
object exists — stated in recorder terms, never as fiction):
- SOLO-TILE: fieldparty `tile` filtered to deadKnown !== true
  has length 0.
- TILE-MATES PRESENT: that filtered length >= 1 (tile count
  reported as a number, 1–n).
- JOINED: joinedAllyVid non-null OR allyFromStart true (the
  engine ally that actually fought; allyDealt reported
  alongside). An evade with a joined ally is reported as
  recorded, not explained away: the awareness check runs for
  the leader before rounds, so a joined evade (if any) is a
  finding, not a contradiction to smooth over.
- CREW SIZE: fieldparty `crew` length reported alongside, never
  substituted for tile presence. "Full party" is NOT claimed:
  no recorder field defines a party.

FIGHTER AT EVADE: fieldparty `leader` (vid, isScholar, armed,
armorP, veteranW3) + w4dpr `loadoutPost` (pre as fallback,
disclosed) + `intent`/`intentWhy` + `leaderFirst` name from
w4dpr when present. No role is invented beyond those fields.
Tracking XP and abilities (game_sense / tracker / echo_location)
are NOT in any recorder's row, so they are NOT claimed as
evade predictors from this corpus — the engine formula above
is cited as the mechanism to test in a future instrumented
arm, not as a finding here.

## WARNED vs UNWARNED for evades (operational definition, fixed BEFORE judged analysis)

Same definition as w4meet, applied to evade rows only (the
evade sub-universe inherits the corpus-order prior signals):
an evade is WARNED iff ANY of:
- W1 PRIOR-TYPE: an earlier meeting in the same seed with the
  same `mid` (any wave, any outcome, any channel, corpus order:
  strictly earlier in the joined corpus order for that seed).
- W2 TRICK-KNOWN: fieldparty `trickKnown` === true at the
  meeting.
W3 RE-MEET-SAME-BEAST is a sub-signal of W1, reported
separately, and ONLY where both HP reads exist: an earlier
meeting with the same `mid` whose `mHpLeft` equals this
meeting's `mHpStart`. For evades, mHpStart is null on the
expedition channel, so W3 is N/A there — reported as N/A, never
as false-by-default in the W3 column (the W1/W2 warned verdict
is unaffected).
UNWARNED = none of W1/W2 present. LIMIT, STATED IN ADVANCE:
scout sightings, rumors, and heard shouts BEFORE contact are
NOT captured by any recorder in the stack, so they are
UNMEASURED here — an "unwarned" evade means "no prior-type
contact and no counter knowledge in the corpus", NOT "the
village had zero warning in fiction". This caveat strains
hardest exactly here: the evader WAS warned by their own eyes
at contact ("saw in time") — the corpus still classifies the
evade by its PRIOR signals only, and the evidence must say so
wherever the unwarned share is quoted. The evade log line
itself is the awareness signal, reported as sense evidence,
not retrofitted into the warned definition.

## After an evade (binding method)

For EACH evade row, in corpus order per seed, record:
- NEXT-SAME-TYPE: the next joined meeting in the same seed
  with the same `mid` (any vid, any channel): days-later
  (day difference), its outcome class, its leader vid (same
  villager as the evader or a different one), its shape.
  If none, record NONE (censored by village end, not by
  absence of interest).
- NEXT-SAME-VILLAGER-SAME-TYPE: the next joined meeting with
  the same `mid` AND the same leader vid: days-later and
  outcome class, or NONE.
- SAME-INDIVIDUAL CANDIDATE (narrow, never the headline):
  a next-same-type meeting whose `mHpStart` is non-null AND
  equals the evade row's `mHpLeft`. Only this subset may be
  described as "possibly the same beast"; all other
  next-same-type meetings are "same type, individual unknown".
  The evade beast is unharmed, so HP continuity alone cannot
  prove identity (a fresh spawn can share the HP) — the
  evidence must carry that sentence wherever the candidate
  count is quoted.
- VILLAGER AFTERMATH: the evader's later meetings in the seed
  (count, last day alive-in-corpus), and deathsDetail exact-
  vid match after the evade day (day, cause) if the formats
  match; if they do not match, deaths-match is UNMATCHABLE
  and aftermath is last-appearance only. "Survived to village
  end" is claimed ONLY if the evader has a meeting on/after
  the village's final recorded day OR no death record matches
  AND the village end reason is not a loss that kills the
  roster — otherwise the wording is "last seen day X, village
  ended day Y", never "survived".
- EVADE CHAINS: per seed, per vid, runs of evades (same
  villager evading repeatedly) and per type re-evades are
  counted, not narrativized: a villager who evades 3+ times
  is named with counts.

## Primary metrics (binding)

- COMPLETENESS (blocks DIAG-GO): 32/32 valid seeds (days > 0)
  AND every recorder (fieldparty, w4dpr, breakline, shoutrec,
  tilejoin, joinendlines, evadelog) errs 0 with overflow empty
  AND joins 100% (the six-recorder join: mid/vid/day match at
  every index; join errors 0) AND evadelog count == joined
  evade count AND every universe row assigned a shape +
  outcome class AND taxonomy OTHER = 0.
- TAXONOMY-AUDIT (blocks judged sweep): BEFORE the judged band
  runs, a 1-seed pilot (seed 75101, same substrate/stack) is
  run and every distinct (rounds-bucket, outcome) pair in its
  corpus is listed; the taxonomy above must cover every pair.
  If an uncovered pair appears, this prereg is AMENDED by a
  new commit naming the pair and its class BEFORE the judged
  sweep starts, and the amendment is disclosed in the
  evidence. A taxonomy that can only fail on the judged band
  is the w4meet failure, repeated — this leg exists to prevent
  exactly that.
- DETERMINISM GATE (blocks DIAG-GO): one seed re-run into a
  scratch EVID dir; its row JSON byte-identical to the corpus
  row. Scratch dir removed after the diff.
- SENSE BAR (blocks DIAG-GO): ALL evade log lines in the band
  read in full (evadelog verbatim lines; every evade has
  exactly one line by engine construction — if any evade
  log has != 1 line, that is a sense anomaly, named, not
  smoothed). Judgment is meaning/coherence/consequences, not
  counts (SENSE-TESTING LAW). Wave-3/4 evade lines are also
  cross-checked against w4dpr's stored logs where present.
  If evades number in the hundreds, the bar still stands: one
  line each, read in full, with the distinct-line inventory
  (the line template admits beast-name variation only) quoted.
- FIXTURE BAR (blocks judging): scripts/test-evadeshape-a.js
  must prove, before the corpus is judged, on synthetic rows:
  every outcome-class mapping (evade vs flee vs drive-off vs
  scatter vs kill vs death vs other, including rounds<1
  vDie/vFlee as OTHER), the tile-presence rule (deadKnown
  excluded), the shape mapping (field/raid/other), the warned
  signals (W1/W2/W3 incl. W3-N/A on null mHpStart, unwarned
  case, same-day ordering rule), the readiness shortfall
  computation (carried, not judged), the join rule (mid/vid/
  day match, mismatch counted), the evade-damage-anomaly flag,
  and the after-evade next-meeting logic (same-type, same-
  villager-same-type, same-individual candidate, NONE case,
  censored-by-end case).
- SHAPE VERDICT (separate from DIAG-GO, binding bar): a shape
  characterization is reportable iff total evades >= 5. Below
  5, the shape verdict is INSUFFICIENT-DATA (held) — the
  taxonomy leg + census completeness is the verdict, and no
  shape claim is softened into a GO. Wave-4 shape separately
  needs >= 5 wave-4 evades, else wave-4 shape is
  INSUFFICIENT-DATA even when the all-wave shape is reportable.
  The evidence verdict section quotes both verdicts by name.
- UNLOCK-VS-CONTACT PAIR (reporting leg, carried): per seed,
  wave-4 unlock AND wave-4 meeting counts both reported;
  neither quoted alone in the verdict section.
- WALL NUMBERS are REPORT-ONLY (won / national / table / wave
  reach / median survival / death-cause shares, upper-middle
  median convention: sorted days[floor(n/2)]). No wall number
  is a GO leg.

## Verdict rule

- DIAG-GO iff COMPLETENESS PASS + TAXONOMY-AUDIT PASS +
  DETERMINISM PASS + SENSE PASS + FIXTURE PASS +
  UNLOCK-VS-CONTACT PAIR reported + one RANKED NEXT named with
  numbers.
- A completeness / audit / determinism / sense / fixture /
  reporting failure is DIAG-NO-GO.
- SHAPE-GO iff evades >= 5 (all-wave); WAVE-4-SHAPE-GO iff
  wave-4 evades >= 5; otherwise the corresponding shape verdict
  is INSUFFICIENT-DATA (held), stated in the verdict section
  even when DIAG-GO holds. A miss is NO-GO, never re-scored
  against a friendlier metric mid-run; metric doubts go under
  "metric review" for the NEXT run. Every evidence file carries
  a "metric review" section.
- LEVER LICENSE (reported, not a GO leg): no lever judgment
  is licensed from this census alone — it is a shape census,
  not a lever comparison. Any lever named in RANKED NEXT is a
  proposal with the numbers that would license it, not a
  judgment.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Instruments (evadelog recorder + sweep + analyzer +
   fixtures), committed before the judged sweep is analyzed
   (fixture bar green first).
3. Taxonomy-audit pilot: 1 seed (75101), distinct outcome
   pairs listed, taxonomy coverage confirmed (or prereg
   amended by commit, disclosed).
4. Sweep (32 seeds), determinism gate (one seed, scratch dir,
   removed after diff), sense: all evade lines read end to end.
5. Evidence evidence/2026-10-30/sim-evadeshape-a.md with
   header-vs-result, taxonomy definition + audit result,
   evade census tables (overall, by wave, warned/unwarned,
   solo/tile/joined, by shape, by beast, by caller), after-
   evade tables (re-meeting interval, later outcome, villager
   aftermath), wave-4 evade subset, unlock-vs-contact per
   seed, wall numbers report-only, sense notes, RANKED NEXT,
   and findings found (reported to the coordinator; this
   worker does NOT append to sim-findings.md).
6. No src/js change, no push, no bump, no live verification.
   Report 'branch ready for coordinator merge, pending ship'.

## Node harness

Eval the FULL src/js/*.js list in index.html order (minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js). Seed
Math.random BEFORE eval (modules capture it at load). Never stub
Game.save. Never run concurrent jest; use
--cacheDirectory=/tmp/jest-cache-sim-evadeshape-a (no jest is run
by this arm — the sweep/analyzer are plain node scripts).
