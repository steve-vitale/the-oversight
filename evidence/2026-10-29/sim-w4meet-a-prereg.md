# sim-w4meet-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T0420Z (coordinator-assigned
worker sim-w4meet-a). Axis: scale-onramp (blocking axis, converging,
NOT converged). DIAG arm, MEASUREMENT ONLY — zero src/js game changes,
no default flip, no deed-bar move, no gate change. Ranked next +
Steve-call questions only.

## The blank (from prior evidence, not re-judged here)

sim-w4shape-a (evidence/2026-10-29/sim-w4shape-a.md, 8 seeds
75101–75108) re-baselined wave-4 meetings on current master: 13
meetings ALL on one seed (75102), wild 11 / raid 2 / other 0,
unlock 5/8 vs contact 1/8, kills 0. This arm tests whether that
clustering is seed luck or structural, on a WIDER band (16 seeds),
and answers the meeting-shape question ranked next by run
fleshout-20261030T0320Z alongside #1462: who meets wave-4
monsters, alone or warned, and whether readiness bars should gate
the MEETING rather than the wave.

RE-DERIVATION CLAUSE (finding #1457 substrate drift, binding):
this run's own corpus IS the baseline. NEVER quote w4shape's band
numbers (13 meetings, seed 75102, 5/8 vs 1/8) as current. Any
comparison to w4shape is a drift diagnostic only, never a GO/NO-GO
leg. If this corpus diverges from w4shape's, the divergence is
reported, not forced.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (Wave 4: The Mirror Draft,
gate village standing >= 100, earned by blood/bonds/bread, never
pure calendar; 9 monsters; bands damage 35–95, HP 850–1500, pierce
0.2–0.5; readiness gate design call #4 2026-10-16: standing opens
the wave door, combat readiness decides whether the village walks
through) and docs/MEASUREMENT.md §§9–12, 14–15 (staged seeds,
death-aware horizons, pre-registration, metric binding, balanced
panels). NO CANON-registered doc covers a wave-4 meeting census or
a meeting-gate specifically — the taxonomy, warned definition, and
gate counterfactual below are stated exactly so they can be
checked, and are NOT canon claims. Governing canon rules:
CANON.md "Monster encounters are fought, not rolled" and the
perception law (Steve 2026-10-28): tile-mate presence, crew, and
prior-meeting signals below are REPORTED from recorded state only
— never fed into any decision, never a roster feed.

Readiness demand, cited live from src/js/standing.js
standingCfg().readyDemand at analysis time (never hardcoded in
judgment — the analyzer reads it from the file and the evidence
quotes what it read):
- Wave 4 (expected, to be verified at analysis): armored 3 at
  armorP >= 10, armed 5, tricks 3, veterans 1 (living roster member
  with a wave-3+ kill in state.waveKillLog).
The at-meeting readiness read is Game.waveCombatReadiness(4)
itself, recorded by the fieldparty recorder at every meeting
(fieldparty `readiness` + `villageArmed` / `villageArmored10` /
`villageVeterans`) — the w5counts-a exact-count method
(evidence/2026-10-29/sim-w5counts-a.md: gate-authoritative counts,
living rule mirrored) applied at meeting time instead of daily.
Two veteran concepts stay SEPARATE: monster veterans (hardened
older-wave monsters, kill logs its BASE wave) vs the living-
villager veterans bar (the readiness count above).

## Band and substrate (binding)

- Seeds 75101–75116 (16 — wider than w4shape's 8, specifically to
  test whether meeting clustering on one seed is seed luck or
  structural), 180d death-aware horizon (death-aware: dead villages
  stop simulating, +10d tail max per the harness; 180d is the
  w4shape horizon verbatim, so the wider band stays comparable).
- Game substrate VERBATIM: scripts/policies/tableseat-nowait.js,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1.
- Recorder stack VERBATIM (w4shape's full stack, never edited, so
  joins are identical): fieldparty-form-diag, w4dpr-diag,
  breakline-diag, tilejoin-diag, shoutrec-diag,
  joinendlines-diag (BREAKLINE=1, TILEJOIN=1, SHOUTREC=1,
  JOINENDLINES=1). These recorders are record-only; the
  joinendlines before/after legs were byte-identical after
  stripping log arrays (sim-joinendlines-a.md: NEUTRALITY GATE
  PASS). NO NEW RECORDER: every field this census needs already
  exists in the stack (see "Fields" below). The only new code is
  scripts/test-w4meet-a-sweep.js (a copy of the w4shape sweep
  writing to perseed-w4meet-a, seeds 75101–75116) and
  scripts/test-w4meet-a.js (a pure analyzer: reads corpus JSON,
  never touches game state; fixtures + --analyze + --sense +
  --detgate support).
- Balanced panel (§15): NOT APPLICABLE — this is a DIAG census on
  a fixed band, not a before/after lever comparison. No panel
  compare is claimed. Pilot gate (§9): the band IS the pilot
  (16 seeds, one substrate, no confirm spend); no lever exists
  to confirm.

## Universe and taxonomy (binding, fixed here)

UNIVERSE: every joined row with fieldparty wave == 4, all channels,
all callers, scholar-led included (flagged as a sub-row, never
silently pooled or silently dropped).

SHAPE (meeting shape = fieldparty `channel`, verbatim):
- wild = channel 'field'; raid = channel 'raid'; other = channel
  'other' (expedition-caller meetings, per the recorder: channel
  'other' iff the monster is not live AND the caller is expedition).
  Any newly discovered shape gets NAMED, not forced into a bucket;
  OTHER (the taxonomy class below) = 0 is a completeness leg.

OUTCOME (one class per meeting, in this order — w4shape verbatim):
- PRE-CONTACT-SCATTER: rounds < 1 AND outcome mFlee.
- PRE-CONTACT-KILL: rounds < 1 AND outcome vKill.
- KILL: rounds >= 1 AND outcome vKill.
- DRIVE-OFF: rounds >= 1 AND outcome mFlee.
- FLEE: rounds >= 1 AND outcome vFlee, sub-split by breakline
  branch (HOPELESS-BRANCH / FLOOR-BRANCH / LEARN-BRANCH / CAP /
  TRICK-EXIT).
- DEATH: rounds >= 1 AND outcome vDie.
- OTHER: anything else. OTHER > 0 fails COMPLETENESS.

PARTY SIZE AT MEETING (recorded state only, no engine "party"
object exists — so the split is stated in recorder terms, never
as a fiction):
- SOLO-TILE: fieldparty `tile` filtered to deadKnown !== true has
  length 0.
- TILE-MATES PRESENT: that filtered length >= 1 (tile count
  reported as a number, 1–n).
- JOINED: joinedAllyVid non-null OR allyFromStart true (the engine
  ally that actually fought; allyDealt reported alongside).
- CREW SIZE: fieldparty `crew` length (outdoor crew excluding the
  leader) reported as a number alongside, never substituted for
  tile presence. "Full party" is NOT claimed as a category: no
  recorder field defines a party, so the evidence reports
  solo / tile-mates / joined / crew-size and says so.

FIGHTER IDENTITY/ROLE/GEAR AT MEETING: fieldparty `leader` (vid,
isScholar, armed, armorP, veteranW3) + w4dpr `loadoutPost`
(melee, ranged, carriedWeapons, gearUp-inclusive; pre as fallback,
disclosed) + `intent`/`intentWhy` + `leaderFirst` name from w4dpr
when present. Role = leader vid + scholar flag + intent; no role
is invented beyond those fields.

## WARNED vs UNWARNED (operational definition, fixed BEFORE judged analysis)

A wave-4 meeting is WARNED iff ANY of these recorder-captured
signals is present (signals evaluated in corpus order: same seed,
earlier meeting = strictly earlier in the joined corpus order for
that seed, i.e. lower day, or same day with lower part/sequence):

- W1 PRIOR-TYPE: an earlier meeting in the same seed with the same
  `mid` (any wave, any outcome, any channel). The village has met
  this beast TYPE before.
- W2 TRICK-KNOWN: fieldparty `trickKnown` === true at the meeting
  (Game.villageKnowsTrick(mid) — the village knows this type's
  counter via the codex/ask channel, with or without prior contact).
- W3 RE-MEET-SAME-BEAST (sub-signal of W1, reported separately):
  an earlier meeting with the same `mid` whose `mHpLeft` equals
  this meeting's `mHpStart` (wound continuity — the same wounded
  individual re-met, not just the same type).

UNWARNED = none of W1/W2 present. LIMIT, STATED IN ADVANCE: scout
sightings, rumors, and heard shouts BEFORE contact are NOT captured
by any recorder in the stack, so they are UNMEASURED here — an
"unwarned" meeting means "no prior-type contact and no counter
knowledge in the corpus", NOT "the village had zero warning in
fiction". The evidence must carry that sentence verbatim in spirit
wherever the unwarned share is quoted. Warned share is reported
per shape (wild / raid / other) and band-total, split by signal
(W1-only, W2-only, both, W3 subset).

## Meeting context (fields, verbatim)

- Channel + caller (fieldparty `channel`, `caller`), day + part,
  beast `mid`, `mHpStart` and `mHpLeft`, `mTile` coords when present.
- Raid channel is glossed ONLY as "raid-depth (havenRaidTick) meeting"
  per the recorder code; wild channel is "field meeting"; other
  channel is "expedition-caller meeting". No haven-approach vs wild-
  tile distinction is claimed beyond channel + caller + mTile,
  because no recorder field draws it.

## Readiness-gate counterfactual (binding method)

At EACH wave-4 meeting, record EXACTLY: readiness.armored,
readiness.armed, readiness.tricks, readiness.veterans,
readiness.ready (the gate's own waveCombatReadiness(4) read),
plus villageArmored10 / villageArmed / villageVeterans and the
demand read live from standing.js. A meeting-gate at FULL demand
("wave-4 meetings only when readiness ready") would have BLOCKED
the meeting iff readiness.ready === false; per-bar shortfalls are
listed (which bars, by how many). BLOCKED share is reported per
shape and band-total.

AVOIDABILITY (judged separately from blocking, never conflated):
- Raid meetings: NOT avoidable by staying home — the beast comes
  to the village (raid-depth channel). Blocking the meeting in the
  counterfactual means the raid meeting does not happen as a
  wave-4 meeting; whether the raid itself would still occur is
  OUT OF SCOPE for this counterfactual and is said so.
- Wild/other meetings: the fighter went out (caller + channel
  reported). Avoidable in principle by not going out, at a
  foraging cost this arm does NOT price — the evidence says that
  and does not price it.
- RE-MEETINGS (W3): blocking the FIRST meeting of a chain changes
  the chain; the evidence reports chain structure (beasts met
  repeatedly, wound continuity) alongside the blocked count so a
  blocked-first-meeting is never silently counted as a blocked
  re-meeting.

## Primary metrics (binding)

- COMPLETENESS (blocks DIAG-GO): 16/16 valid seeds (days > 0) AND
  every recorder (fieldparty, w4dpr, breakline, shoutrec,
  tilejoin, joinendlines) errs 0 with overflow empty AND joins
  100% (all six recorders index-aligned per seed; mid/vid/day
  match at every index; join errors 0) AND every universe row
  assigned a shape + outcome class AND OTHER = 0 (taxonomy class
  AND shape-other is reported, not failed — the OTHER=0 leg is
  the taxonomy class; a newly discovered shape gets NAMED per
  the taxonomy rule above and the leg is re-judged on whether
  every row is assigned, with the discovery named in the verdict
  note).
- DETERMINISM GATE (blocks DIAG-GO): one seed re-run into a
  scratch EVID dir; its row JSON byte-identical to the corpus
  row. Scratch dir removed after the diff.
- SENSE BAR (blocks DIAG-GO): ALL wave-4 meeting transcripts read
  end to end (w4dpr verbatim logs) when the fought wave-4 count
  is <= 40; otherwise a PRE-STATED stratified sample: all raid
  and other meetings + at least 3 wild meetings spanning each
  outcome class present + at least 1 meeting per distinct beast
  type — the sample rule is fixed here, before judged analysis,
  and the evidence names which rule fired. Judgment is
  meaning/coherence/consequences, not counts (SENSE-TESTING LAW).
  Pre-contact meetings have no fight log and never count toward
  the sense bar.
- FIXTURE BAR (blocks judging): scripts/test-w4meet-a.js must
  prove, before the corpus is judged, on synthetic rows: every
  outcome-class mapping, the tile-presence rule (deadKnown
  excluded), the shape mapping (field/raid/other), the warned
  signals (W1/W2/W3, including the unwarned case and the
  same-day ordering rule), the readiness shortfall computation
  against demand 3/5/3/1, and the join rule (mid/vid/day match,
  mismatch counted).
- UNLOCK-VS-CONTACT PAIR (blocks DIAG-GO as a reporting leg):
  per seed, wave-4 unlock count AND wave-4 meeting count are both
  reported; neither may be quoted alone in the evidence verdict
  section. (w4shape's 5/8 vs 1/8 must never be reported as reach
  alone — and neither may this run's pair.)

## Verdict rule

- DIAG-GO iff COMPLETENESS PASS + DETERMINISM PASS + SENSE PASS +
  FIXTURE PASS + UNLOCK-VS-CONTACT PAIR reported + one RANKED NEXT
  named with numbers.
- A completeness/determinism/sense/fixture/reporting failure is
  DIAG-NO-GO.
- LEVER LICENSE (reported, not a GO leg): a wave-4 lever judgment
  is licensed for a shape iff that shape has >= 5 meetings
  in-band (fought + unfought). Below 5, any lever on that shape
  is INSUFFICIENT-DATA, counts only, NO lever judgment. The
  license sentence names each shape's n and verdict.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run; metric doubts go under "metric review" for the NEXT
  run. Every evidence file carries a "metric review" section.
- WALL NUMBERS are REPORT-ONLY (won / national / table / wave
  reach / median survival / death-cause shares, upper-middle
  median convention: sorted days[floor(n/2)], as the 0320Z round
  reported). No wall number is a GO leg.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Instruments (sweep + analyzer + fixtures), committed before the
   judged sweep is analyzed (fixture bar green first).
3. Sweep (16 seeds), determinism gate (one seed, scratch dir,
   removed after diff), sense transcripts read end to end per the
   rule above.
4. Evidence evidence/2026-10-29/sim-w4meet-a.md with header-vs-
   result, meeting-shape tables, warned/unwarned split per shape,
   readiness-at-meeting table + gate counterfactual + avoidability,
   unlock-vs-contact per seed, wall numbers report-only, sense
   notes, RANKED NEXT, and findings found (reported to the
   coordinator; this worker does NOT append to sim-findings.md).
5. No src/js change, no push, no bump, no live verification.
   Report 'ready for coordinator merge, pending ship'.

## Node harness

Eval the FULL src/js/*.js list in index.html order (minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js). Seed
Math.random BEFORE eval (modules capture it at load). Never stub
Game.save. Never run concurrent jest; use
--cacheDirectory=/tmp/jest-cache-sim-w4meet-a (no jest is run by
this arm — the sweep/analyzer are plain node scripts).
