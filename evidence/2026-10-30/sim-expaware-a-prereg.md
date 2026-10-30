# sim-expaware-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T0641Z (coordinator-assigned
worker sim-expaware-a). Axis: scale-onramp (blocking axis, converging,
NOT converged). DIAG arm, MEASUREMENT ONLY — zero src/js game changes,
no default flip, no gate move, no deed-bar move, no damage buff.
Next arm from run fleshout-20261030T0533Z: evidence/2026-10-30/
sim-evadeshape-a.md ranked-next #1-adjacent (expedition-awareness
instrument) + the 0533Z run's recurrence note. Read first:
sim-evadeshape-a.md, sim-w4meet-a.md (2026-10-29), sim-chainclose-a.md.

## The blank (from prior evidence, not re-judged here)

sim-evadeshape-a (band 75101–75132, 180d, tableseat-nowait) proved
evades are expedition-only by wiring: only the expedition path in
villager-agency.js passes `awareness: true` to fieldFight, so only it
runs the pre-fight awareness check that can produce 'evade'; field
meetings evade 0/2,599 and raid meetings 0/1,164, while beast
scatter (rounds < 1, outcome 'mFlee') is the field/raid pre-contact
outcome (58–65%). Two gaps remain open, and this arm closes them
as measurement:

1. CALLER CENSUS: evadeshape reported channel (wild/raid/other)
   but never a caller census — every fieldFight caller, whether it
   passes awareness, and the resulting pre-contact outcome
   distribution (evade vs scatter vs fought) by caller and wave.
2. WARNED MEANING: w4meet's "warned" meant only prior-type contact
   (W1) or counter knowledge (W2). Scout sightings, rumors, and
   heard shouts before contact were explicitly unmeasured, and
   w4meet's wave-4 warned-vs-unwarned outcomes were never split
   under an expanded definition. This arm measures each signal
   separately — and classifies a signal UNMEASURED, counted
   separately, where the recorders + code give no per-meeting
   record of it, rather than inventing it.

PRIOR-BAND NUMBERS ARE CONTEXT, NOT LEGS: evadeshape's band gave
4,334 meetings, 328 evades, 87 wave-4 meetings (FLEE 54, DEATH 27,
EVADE 4, SCATTER 1, DRIVE-OFF 1, KILL 0). This run's own corpus IS
the baseline. Any comparison to evadeshape is a drift diagnostic
only, never a GO/NO-GO leg. If this corpus diverges, the divergence
is reported, not forced.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (Wave 4: The Mirror Draft;
standing >= 100) and docs/MEASUREMENT.md §§9–12, 14–15 (staged seeds,
death-aware horizons, pre-registration, metric binding, balanced
panels). NO CANON-registered doc covers an expedition-awareness
instrument, a caller census, or a warned classification — the
definitions below are stated exactly so they can be checked, and
are NOT canon claims. Governing canon rules: CANON.md "Monster
encounters are fought, not rolled" (an evade is explicitly NOT a
fight — it decides contact, not outcome; fieldFights.js header),
and the perception law (Steve 2026-10-28): signals below are
REPORTED from recorded state only — never fed into any decision,
never a roster feed. In particular, an "any earlier shout anywhere
in the seed" proxy for a heard shout is REFUSED: it would attribute
global knowledge to a villager who may never have heard it. A
signal with no listener record is UNMEASURED, not proxied.

Engine ground truth for the awareness flag (read from src/js, not
invented): fieldFights.js runs the pre-fight awareness check only
`if (opts.awareness)`. The ONLY call site passing `awareness: true`
is villager-agency.js expeditionMonster:
`fieldFight(vid, m, null, { awareness: true, allies, allyVids })`.
Every other fieldFight caller omits the flag (verified by grep over
all call sites for this prereg — see the caller table below). The
awareness formula (base 0.35 + tracking up to +0.30 + behavior /
speed / notice / size terms + ability bonuses, clamped [0.05,
0.90]) is cited as the mechanism, not tested here: tracking XP and
abilities are NOT recorder fields, so no evade predictor is claimed
from this corpus (evadeshape's standing caveat, carried).

## Band and substrate (binding)

- Seeds 75101–75132 (32 — the evadeshape band verbatim, which
  yielded 87 wave-4 meetings, enough to characterize if it
  reproduces), 180d death-aware horizon (dead villages stop
  simulating, +10d tail max per the harness; the w4meet/evadeshape
  horizon verbatim, so the band stays comparable).
- Game substrate VERBATIM: scripts/policies/tableseat-nowait.js,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1.
- Recorder stack VERBATIM (evadeshape's full stack, never edited,
  so joins are identical): fieldparty-form-diag, w4dpr-diag,
  breakline-diag, tilejoin-diag, shoutrec-diag,
  joinendlines-diag (BREAKLINE=1, TILEJOIN=1, SHOUTREC=1,
  JOINENDLINES=1), evadelog-diag (EVADELOG=1). All record-only.
- NO NEW RECORDER. Reason, stated before the sweep: the three
  candidate extra signals (scout / rumor / shout) have no
  per-meeting record in any recorder AND no per-meeting engine
  record to wrap — see UNMEASURED grounds below. A new recorder
  cannot conjure a listener list the engine never kept. This arm
  therefore reuses the verbatim stack and classifies honestly.
- New code only: scripts/test-expaware-a-sweep.js (a copy of the
  evadeshape sweep writing to perseed-expaware-a, seeds
  75101–75132) and scripts/test-expaware-a.js (a pure analyzer:
  reads corpus JSON, never touches game state; fixtures +
  --analyze + --sense (wave-4 first-meeting transcripts) +
  --detgate support). No src/js change, no policy change.
- Balanced panel (§15): NOT APPLICABLE — DIAG census on a fixed
  band, not a before/after lever comparison. No panel compare is
  claimed. Pilot gate (§9): the band IS the pilot (32 seeds, one
  substrate, no confirm spend); no lever exists to confirm. The
  1-seed taxonomy audit below is a pre-judged-band instrument
  check, not a confirm.

## Caller table (code-level, fixed here — corpus cross-checked later)

Every fieldFight call site in src/js at prereg time, with the
awareness flag as written (grep-verified; line numbers drift):

| # | Site (enclosing function) | awareness | Corpus caller / channel expectation |
|---|---------------------------|-----------|--------------------------------------|
| 1 | villager-agency.js expeditionMonster | TRUE (only one) | caller 'other', channel 'other' (expedition) |
| 2 | game.js resolvePatrol | omitted | caller 'patrol' if reached; 0 rows in evadeshape band |
| 3 | game.js resolveWildMonsterEncounter | omitted | caller 'resolve', channel 'field' (or 'raid' in raid depth) |
| 4 | havenGrowth.js lingererSortie | omitted | caller 'sortie' if reached; 0 rows in evadeshape band |
| 5 | comms.js aidFight (calls fieldFight) | omitted | caller 'aid', channel 'field'/'raid' |
| 6 | contestEngine.js _cxBlood (show fight) | omitted | caller 'other', channel 'field' |
| 7 | contestEngine.js _cxOther (hide/seek + beastmaster) | omitted | caller 'other', channel 'field' |
| 8 | alienPlayers.js alien-vs-villager fight | omitted | caller 'other', channel 'field' if reached |
| 9 | corruption.js psychoViolenceTick | omitted | caller 'other', channel 'field' |
| 10 | nomad-drive.js kin fight | omitted | caller 'other', channel 'field' if reached |
| 11 | nomad-wild.js leg-defender fight | omitted | caller 'other', channel 'field' if reached |

Corpus caller classification is the recorders' (fieldparty-form-
diag classifyCaller: lingererSortie → 'sortie', resolvePatrol →
'patrol', aidFight → 'aid', resolveWildMonsterEncounter →
'resolve', else 'other'; channel 'other' iff monster not live AND
expedition in stack, 'raid' iff in raid depth, else 'field').
The census reports BOTH the code table and the corpus
caller × channel table, and names any corpus caller/channel
combination the code table does not predict (never forced into
a bucket). AWARENESS-IMPLIED rule for the corpus: a row is
awareness-eligible iff channel == 'other' AND its stack names
expeditionMonster (the only awareness:true site); the analyzer
verifies evades occur ONLY in awareness-eligible rows and
scatters never in them (evadeshape's finding, re-checked, not
assumed). Rows with caller 'other' + channel 'field' are
awareness-INELIGIBLE (contest/psycho/nomad/alien sites above) —
they must never be pooled with expedition rows.

## Universe and taxonomy (binding, fixed here)

UNIVERSE: every joined row, ALL waves (1–5+), all channels, all
callers, scholar-led included (flagged as a sub-row, never
silently pooled or dropped). The WAVE-4 SUB-UNIVERSE is every
joined row with wave == 4, reported separately and never pooled
into the all-wave census without being named.

SHAPE (meeting shape = fieldparty `channel`, verbatim):
wild = 'field'; raid = 'raid'; other = 'other' (expedition-caller
meetings). Any newly discovered shape gets NAMED, not forced.

OUTCOME (one class per meeting, evadeshape order verbatim,
decided from recorded (rounds, outcome) only — never from log
text, intent, or any roster feed):
- PRE-CONTACT-EVADE: rounds < 1 AND outcome 'evade'.
- PRE-CONTACT-SCATTER: rounds < 1 AND outcome 'mFlee'.
- PRE-CONTACT-KILL: rounds < 1 AND outcome 'vKill'.
- KILL: rounds >= 1 AND outcome 'vKill'.
- DRIVE-OFF: rounds >= 1 AND outcome 'mFlee'.
- FLEE: rounds >= 1 AND outcome 'vFlee' (breakline branch
  sub-split where recorded).
- DEATH: rounds >= 1 AND outcome 'vDie'.
- OTHER: anything else. OTHER > 0 fails COMPLETENESS.

PRE-CONTACT vs FOUGHT (for the census tables): pre-contact =
rounds < 1 (evade + scatter + pre-contact-kill); fought =
rounds >= 1 (kill + drive-off + flee + death). "Fought" is a
rounds fact, not a bravery claim.

## WARNED definitions (binding, fixed BEFORE judged analysis)

Corpus order per seed is the joined row order. "Earlier" means
strictly earlier in that order (same day, earlier part counts as
earlier; the analyzer's ordering rule is fixture-proven).

NARROW (w4meet verbatim — the comparable definition):
a meeting is WARNED-NARROW iff ANY of:
- W1 PRIOR-TYPE: an earlier meeting in the same seed with the
  same `mid` (any wave, any outcome, any channel, any villager).
- W2 TRICK-KNOWN: fieldparty `trickKnown` === true at the
  meeting.
W1 DETAIL (reported, not a separate verdict): W1-personal =
earlier same-mid meeting by the SAME leader vid; W1-village-only
= earlier same-mid meeting(s) but none by the same vid.

EXPANDED (this arm's definition — the comparable extension):
a meeting is WARNED-EXPANDED iff WARNED-NARROW OR ANY of:
- W3 SAME-INDIVIDUAL RE-MEET: an earlier meeting with the same
  `mid` whose `mHpLeft` equals this meeting's `mHpStart`, both
  non-null. (For expedition/other-channel meetings mHpStart is
  null, so W3 is N/A there — reported as N/A, never as false
  by default. For field/raid meetings live HP makes W3
  measurable. The narrow-vs-expanded difference is therefore
  exactly the W3-only cases, and is reported as such.)
- SCOUT: UNMEASURED (see grounds; contributes 0 confirmed).
- RUMOR: UNMEASURED (see grounds; contributes 0 confirmed).
- SHOUT: UNMEASURED (see grounds; contributes 0 confirmed).

UNMEASURED GROUNDS (code-verified for this prereg, not assumed):
- SCOUT: no type-specific scout report exists in code. The
  'scout' assignment maps tiles (t.revealed / markSeen 'shared')
  — it reports ground, not a beast type. expeditionSign grants a
  generic monsters++ count, not a type-linked sighting. No
  recorder captures either at meeting time, and neither names
  the type the meeting is about. A generic "has scouted" flag
  would not be a warning about THIS beast and is refused.
- RUMOR: gossip kinds carry reputation dims (brave/honest/etc.),
  never a monster-type warning. The one monster-carrying gossip,
  'feast-draw' { monster: mid }, is a feast event, not a warning
  channel, and its audience list is empty. No recorder captures
  gossip state at meeting time, and no gossip kind is a
  pre-meeting monster warning. Rumor-as-warning is therefore
  UNMEASURED, not zero-by-assertion: the count of unmeasured
  rumor checks is reported alongside the warned tables.
- SHOUT: shoutrec-diag captures WITHIN-fight shouts (shoutRound,
  shoutMhp, calledHelp) for every fight, but no listener or
  audience is ever recorded — who heard a shout, from where,
  is not engine state. A shout heard BEFORE a meeting would
  require the listener's tile at shout time, which no recorder
  keeps. Attributing any earlier shout in the seed to the
  meeting villager would be a roster feed and is refused under
  the perception law. SHOUT is UNMEASURED, counted separately.

UNWARNED = not warned under the definition in use. UNMEASURED
signals are NEVER counted as warned and NEVER counted as
unwarned-evidence: each wave-4 meeting carries an unmeasured
count (0–3 signals unmeasured; in practice 3 for every meeting
on this stack), reported as its own column. A meeting can be
UNWARNED-NARROW and UNWARNED-EXPANDED while still carrying 3
unmeasured signals — the evidence must say so wherever the
unwarned share is quoted, exactly as evadeshape carried its
caveat for evades.

## Warned-vs-unwarned outcomes (binding tables)

For wave-4 meetings only, under BOTH definitions separately:
counts + shares for FOUGHT (rounds >= 1) vs PRE-CONTACT, and
within fought: KILL / DRIVE-OFF / FLEE / DEATH; within
pre-contact: EVADE / SCATTER / PRE-CONTACT-KILL; plus damage
dealt (mDealt: mean, median, total, and share of meetings with
mDealt > 0) for warned vs unwarned, and the same split by
channel (wild/raid/other) where n allows (cells with n < 5 are
named, not characterized). "Fought/flee/death/evade" in the
assignment maps to: fought = rounds >= 1 classes; flee = FLEE;
death = DEATH; evade = PRE-CONTACT-EVADE. No other mapping is
used. Damage dealt is mDealt as recorded; evade/scatter rows
are expected mDealt 0 and any violation is flagged, never
reclassified.

## Sense leg (binding)

FIRST-MEETING TRANSCRIPTS: a wave-4 first meeting = the first
joined meeting per (seed, mid) among wave-4 meetings (the
village's first wave-4 contact with that type). Transcript
source: w4dpr's stored rec.log (verbatim for wave 3/4 fights;
evades carry their single evadelog line). Read ALL first-meeting
transcripts if <= 40; if > 40, read a STRATIFIED sample of 40
(strata: outcome class × warned-narrow status, listed
explicitly in the evidence, with every sampled transcript
quoted or cited by seed/day/beast). Judgment is meaning /
coherence / consequences (SENSE-TESTING LAW): does the
narration match the recorded signals — does a warned meeting
read warned (named beast, known counter, recognition) and does
an unwarned meeting read blind (generic phrase, surprise,
first-contact language)? A mismatch is named as a sense
finding, not smoothed. Evade lines are single-line by engine
construction; a wave-4 evade line naming a generic phrase for
an unwarned beast is a match, not a failure.

## Primary metrics (binding)

- COMPLETENESS (blocks DIAG-GO): 32/32 valid seeds (days > 0)
  AND every recorder (fieldparty, w4dpr, breakline, shoutrec,
  tilejoin, joinendlines, evadelog) errs 0 with overflow empty
  AND joins 100% (index-aligned joins: mid/vid/day match at
  every index; join errors 0) AND evadelog count == joined
  evade count AND every universe row assigned a shape +
  outcome class AND taxonomy OTHER = 0.
- TAXONOMY-AUDIT (blocks judged sweep): BEFORE the judged band
  is analyzed, a 1-seed pilot (seed 75101, same substrate/stack)
  is run through the analyzer's pair audit and every distinct
  (rounds-bucket, outcome) pair listed; the taxonomy above must
  cover every pair. If an uncovered pair appears, this prereg is
  AMENDED by a new commit naming the pair and its class BEFORE
  judged analysis, and the amendment is disclosed in the
  evidence. Absent pairs (e.g. vDie in a small pilot) are noted
  explicitly, as evadeshape did.
- CLASSIFICATION (blocks DIAG-GO): every wave-4 meeting
  assigned warned/unwarned under BOTH definitions, 0
  UNCLASSIFIED; every wave-4 meeting carries its W1/W2/W3
  signal bits and its UNMEASURED count (scout/rumor/shout);
  every caller × channel cell assigned an awareness-eligible
  flag (eligible iff channel 'other' + expeditionMonster stack).
- DETERMINISM GATE (blocks DIAG-GO): one seed re-run into a
  scratch EVID dir; its row JSON byte-identical to the corpus
  row. Scratch dir removed after the diff.
- SENSE BAR (blocks DIAG-GO): wave-4 first-meeting transcripts
  read per the sense leg above (all if <= 40, else stratified
  40), with the warned/unwarned narration judgment stated.
- FIXTURE BAR (blocks judging): scripts/test-expaware-a.js must
  prove, before the corpus is judged, on synthetic rows: every
  outcome-class mapping (incl. rounds<1 vDie/vFlee as OTHER),
  the shape mapping, the caller × channel × awareness-eligible
  mapping (incl. other/field as ineligible), warned-narrow
  (W1 incl. personal/village split + same-day ordering, W2),
  warned-expanded (W3 incl. N/A on null mHpStart, W3-only
  difference case, UNMEASURED signals contributing 0),
  the join rule (mid/vid/day match, mismatch counted), and
  damage aggregation (mean/median/>0 share incl. empty case).
- WAVE-4-N BAR (binding bar, not a GO leg for the census):
  wave-4 characterization is reportable iff wave-4 meetings
  >= 20. Below 20 the wave-4 warned tables are
  INSUFFICIENT-DATA (held) — described, not characterized —
  and no warned-vs-unwarned wave-4 claim is softened into a GO.
  The all-wave caller census has no n bar (it is a census, not
  a rate claim); cells with n < 5 are named, not characterized.
- UNLOCK-VS-CONTACT PAIR (reporting leg, carried): per seed,
  wave-4 unlock AND wave-4 meeting counts both reported;
  neither quoted alone in the verdict section.
- WALL NUMBERS are REPORT-ONLY (won / national / table / wave
  reach / median survival / death-cause shares, upper-middle
  median convention: sorted days[floor(n/2)]). No wall number
  is a GO leg.

## Verdict rule

- DIAG-GO iff COMPLETENESS PASS + TAXONOMY-AUDIT PASS +
  CLASSIFICATION PASS + DETERMINISM PASS + SENSE PASS +
  FIXTURE PASS + UNLOCK-VS-CONTACT PAIR reported + one RANKED
  NEXT named with numbers.
- A completeness / audit / classification / determinism /
  sense / fixture / reporting failure is DIAG-NO-GO.
- WAVE-4-CHARACTERIZED iff wave-4 meetings >= 20; otherwise
  INSUFFICIENT-DATA (held), stated in the verdict section even
  when DIAG-GO holds. A miss is NO-GO, never re-scored against
  a friendlier metric mid-run; metric doubts go under "metric
  review" for the NEXT run. Every evidence file carries a
  "metric review" section.
- LEVER LICENSE (reported, not a GO leg): no lever judgment is
  licensed from this census alone — it is a census, not a lever
  comparison. Any lever named in RANKED NEXT is a proposal with
  the numbers that would license it, not a judgment.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Instruments (sweep copy + analyzer + fixtures), committed
   before the judged sweep is analyzed (fixture bar green first).
3. Taxonomy-audit pilot: 1 seed (75101), distinct outcome
   pairs listed, taxonomy coverage confirmed (or prereg
   amended by commit, disclosed).
4. Sweep (32 seeds), determinism gate (one seed, scratch dir,
   removed after diff), sense: wave-4 first-meeting transcripts
   read per the sense leg.
5. Evidence evidence/2026-10-30/sim-expaware-a.md with
   header-vs-result, caller census tables (code table +
   corpus caller × channel × awareness + pre-contact outcome
   distribution by caller and wave), warned tables (narrow vs
   expanded, by signal, by channel, outcomes + damage),
   wave-4 subset, unlock-vs-contact per seed, wall numbers
   report-only, sense notes, RANKED NEXT, and findings found
   (reported to the coordinator; this worker does NOT append
   to sim-findings.md).
6. No src/js change, no push, no bump, no live verification.
   Report 'ready to merge, pending ship' with branch, commit
   hashes, verdict, and wall numbers.

## Node harness

Eval the FULL src/js/*.js list in index.html order (minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js). Seed
Math.random BEFORE eval (modules capture it at load). Never stub
Game.save. Never run concurrent jest; use
--cacheDirectory=/tmp/jest-cache-sim-expaware-a (no jest is run
by this arm — the sweep/analyzer are plain node scripts).
Sweep outputs go under evidence/2026-10-30/perseed-expaware-a/
in this worktree (never /tmp); scratch determinism dirs are
removed after the diff, never reused as live filenames.
