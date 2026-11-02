# sim-homeward-substrate-b — shadow-vs-armed E validation + approach-clean screen (DIAG-VALIDATED instrument, DIAG-NO-CANDIDATE screen)

Run: oversight-flesh-out-loop-b, arm sim-homeward-substrate-b
(coordinator brief 2026-11-02, run
fleshout-loop-b-20261102T1345Z). Worktree
sim-homeward-substrate-b, branch sim-homeward-substrate-b.
Prereg: evidence/2026-11-02/sim-homeward-substrate-b-prereg.md
(committed f6bbe86ec BEFORE any validation or screening sim).
Instrument: evidence/2026-11-02/sim-homeward-substrate-b-prereg.md's
validator + screener committed 1f5fd068b (proof 11/11, below).
Convergence state: the instrument question is now answered —
shadow E is validated — but the approach-clean substrate is
not found: 0 candidates in 64 fresh seeds. The extension's
own judged status is unchanged (still unproven on a natural
band, not disproven); what changed is WHERE its firing
actually shows up (see the three veto shapes below).

## What was built (policy-side ONLY, zero game-code change)

Nothing in any policy file changed. Reused, byte-identical
(verified by the proof test's git check, re-run post-commit):
scripts/policies/competent-homewardstep-b.js (full guard),
scripts/policies/competent-homewardstep-outwardonly-b.js
(outward-only variant, not needed for screening but re-run
in proof), scripts/homext-abl-b-driver.js,
scripts/analyze-homext-abl-b.js,
scripts/analyze-homeveto-screen-b.js. New in this run:
scripts/analyze-homeward-substrate-b.js (validator mode +
approach-clean screen mode, prereg definitions implemented
literally from exact driver fields) and
scripts/test-homeward-substrate-b.js (its proof). Zero
src/js, zero competent.js edits, zero policy-default flips.

## Canon note

docs/CANON.md read first; docs/MAP.md states the way home
as travel through the same travelTo pipeline. No canon doc
covers the pocket guard itself: it is a policy-side sim
instrument (a competent variant), not a game system, so
there is no canon to invent from — the guard's E(D) model
is inherited verbatim from the predecessors.

## VALIDATION (before any screening — prereg bar: matched-prefix agreement 100% on both seeds)

Fresh runs, reused driver unchanged, same substrate as
screening (competent, 30d, DEPOSITGATE=0,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, packcomp *=1
flags not 1): seed 61807 and seed 64601, shadow baseline +
armed full legs. Validation files:
sim-homeward-substrate-b-val61807-{baseline,armed}.jsonl and
sim-homeward-substrate-b-val64601-{baseline,armed}.jsonl.

### 61807, day 4 (terminator: homeward entry hop (2,0)->(3,0))

| Hop | Shadow simOk | Armed simOk | Agree |
|---|---|---|---|
| (4,4)->(2,4) | true | true | yes |
| (2,4)->(1,4) | true | true | yes |
| (1,4)->(1,2) | true | true | yes |
| (1,2)->(1,1) | true | true | yes |
| (1,1)->(2,0) | true (lateral) | true (lateral) | yes |
| (2,0)->(3,0) | false | false (vetoed) | yes |

Agreement 6/6, shapeOk, no armed veto before the
terminator. BAR100 PASS.

### 64601, day 17 (terminator: first armed-vetoed hop (1,4)->(1,2))

| Hop | Shadow simOk | Armed simOk | Agree |
|---|---|---|---|
| (4,4)->(2,4) | true | true | yes |
| (2,4)->(1,4) | true | true | yes |
| (1,4)->(1,2) | false | false (vetoed) | yes |

Agreement 3/3, shapeOk, no armed veto before the
terminator. BAR100 PASS.

### Validation verdict: VALIDATED (both seeds, prereg bar met)

Shadow E is a valid screen for approach-clean trips under
the prereg's matched-prefix rule. Determinism check
(reported, not barred): the fresh day logs reproduce the
stored predecessor day logs hop-for-hop on all four
legs (61807 baseline/armed day 4, 64601 baseline/armed
day 17) — same hops, same simOk, same veto flags.

### The predecessor's contrary claim does NOT reproduce

The homeveto metric review claimed the 61807 day-4
approach hops (1,4)->(1,2), (1,2)->(1,1), (1,1)->(2,0)
E-FAIL in the baseline shadow log but E-PASS under the
armed guard. That claim contradicts its own run's stored
files: the homeveto diag baseline day-4 log has all three
passing (the last via lateral), matching the full leg —
and the fresh validation reproduces those files exactly.
Within the fresh 61807 shadow log, those hops occur ONLY
on day 4 and pass, so hop-occurrence pooling inside this
driver run cannot explain the claim either. The claim's
provenance is therefore open (plausibly an older guard
version's E, or a manual re-evaluation at a different
state — neither is in the current data), but it does not
affect this run: the prereg bar required agreement, and
agreement is what the data shows, twice over (stored files
+ fresh runs). No mechanistic explanation was needed
because there is no disagreement to explain. Shadow-log
screening proceeds on the validated rule: first-occurrence
matched-prefix comparison, never pooled occurrences.

## SCREENING (all 8 budgeted bands, disclosed, none qualifies)

Per band, BOTH legs fresh with the ablation driver (30d,
substrate above): baseline 'competent' under the SHADOW
guard and armed 'competent-homewardstep-b' (full guard).
Judged by the new screener (approach-clean definition in
the prereg); baseline episodes and armed veto counts from
the predecessor analyzers, for disclosure. Screening files
are screening evidence only, NEVER judged legs.

| Band | Base away | Armed away | Armed vetoes (silent) | Armed homeV | Base episodes (homeward) | Candidates | Result |
|---|---|---|---|---|---|---|---|
| 1. 67001-67008 | 0 | 0 | 0 (0) | 0 | 0 (0) | 0 | FAIL: dead band |
| 2. 67101-67108 | 13 | 12 | 10 (5) | 4 | 1 (1) | 0 | FAIL: episode + homeV, but not approach-clean (shape A) |
| 3. 67201-67208 | 8 | 5 | 7 (2) | 0 | 1 (1) | 0 | FAIL: approach E-fails (shape B) |
| 4. 68001-68008 | 8 | 9 | 11 (6) | 4 | 1 (0) | 0 | FAIL: mid-trip fence, not an entry (shape C) |
| 5. 68201-68208 | 14 | 8 | 79 (76) | 0 | 1 (0) | 0 | FAIL: approach E-fails (shape B) |
| 6. 68701-68708 | 2 | 2 | 2 (0) | 0 | 1 (0) | 0 | FAIL: non-homeward episode only |
| 7. 69101-69108 | 1 | 1 | 0 (0) | 0 | 0 (0) | 0 | FAIL: dead band |
| 8. 69201-69208 | 1 | 1 | 36 (34) | 0 | 0 (0) | 0 | FAIL: dead band, outward veto repetition |
| TOTAL 64 seeds | 47 | 38 | 145 (123) | 8 | 6 (2) | 0 | 0 qualifiers |

Band 6 note: the first band-6 armed leg was aborted by the
runtime after 2 seeds (partial file, 2 lines); it was
re-run whole (8 lines, log confirms "wrote 8") and only
the complete re-run is used above. No band was screened
twice for a qualifier; the re-run is the same band, not
extra budget.

Episode detail (baseline legs; all others non-homeward
unless noted):
- Band 2, 67105: days 5-9 at (7,1), E fails all 5 days,
  HOMEWARD entry by the episode rule — but see shape A.
- Band 3, 67204: days 21-27 at (3,2), E fails all 7 days,
  HOMEWARD entry by the episode rule — but see shape B.
- Band 4, 68005: days 28-30 at (7,4)/(8,4)/(6,7), E fails
  days 29-30, non-homeward, window-truncated.
- Band 5, 68207: days 4-9 at (2,0), E fails all 6 days,
  non-homeward, death-linked day 9 (player dehydration).
  Armed: away 0, 79 outward vetoes (76 silent) — the
  approach is refused all month.
- Band 6, 68706: days 29-30 at (2,3), E fails both days,
  non-homeward, window-truncated.

## The three veto shapes (why 0 candidates coexists with 8 armed homeward vetoes)

The prereg's approach-clean shape — walk out through
E-passing ground, then a homeward step into no-escape
ground — never occurs in 64 fresh seeds. But armed
homeward vetoes DO occur, in two shapes the definition
excludes by design (documented here, NOT re-scored as
qualifiers — metric binding):

- SHAPE A (band 2, 67105 — outward entry + homeward
  escape-attempt vetoes, 4 homeV): shadow walks out
  (4,4)->(6,4)->(7,4)->(7,2)->(7,1), all E-passing at
  walk-out time, then camps (7,1) days 5-9 with failing
  day-end sims. The entry step (7,2)->(7,1) is OUTWARD,
  and E((7,1)) passes when evaluated at walk-out but the
  day-end return sim fails after the day's foraging
  depletes the lateral stock — E is time-sensitive (see
  metric review). Under guard, the scholar is vetoed at
  the homeward escape attempts (7,1)->(6,1) day 5 and
  (7,2)->(6,2) days 6-8 (veto-origin 3 pass / 1 fail),
  ends days 5-8 at escapable (7,2) with passing day-end
  sims, and comes home day 9. The extension fires — as a
  fence on the way OUT of a pocket it did not enter
  through — but the trip is not approach-clean: its
  homeward E-failing hop does not follow a haven walk-out
  and does not land on the shadow day-end tile, so the
  screener (correctly, per prereg) rejects it.
- SHAPE B (bands 3, 5 — approach E-fails, the 64601
  shape): 67204 day 21 shadow approach hops
  (1,2)->(1,1) and (1,1)->(2,0) E-fail; armed vetoes
  (1,2)->(1,1) at the approach and the scholar reroutes
  home via (3,2), never attempting the homeward step.
  68207 is the same shape with extreme repetition (79
  vetoes). Approach not clean, homeward step never
  attempted under guard.
- SHAPE C (band 4, 68001 — mid-trip homeward fence from
  escapable ground, 4 homeV, veto-origin 4/0): the scholar
  starts day 8 already out at (2,8) with a PASSING day-end
  sim, tries homeward (2,8)->(4,8) which E-fails (the
  destination is no-escape ground), is vetoed 3x spoken/
  silent on that step plus once from (0,8), and ends the
  day at (2,8) passing. The extension fires as a fence
  against walking INTO a pocket from escapable ground —
  but the trip did not start at haven that day, so it is
  not an approach-clean trip by the prereg definition.

Net: armed homeward vetoes run at 8/64 seeds here (vs
0/80 across all prior runs) — the extension is no longer
silent on natural bands. But none of the 8 vetoes is an
approach-clean entry veto, so the future judged pilot
still has no approach-clean substrate. The substrate
question has moved: the firing shapes exist, they are
just not the 61807 entry shape.

## Balanced panel (§15, context never verdict)

Combined campaign on the nearest-to-qualifying band 2
(`node scripts/balance-panel.js --out
/tmp/homeward-substrate-b-panel --policies
competent,competent-homewardstep-b --seeds
67101,...,67108 --days 30 --par 4` — 16 cases, 0 reused,
sourcesStable true, neutrality matched on both policies,
proof seed 67101, 0 warnings). Per-policy panel rows are
IDENTICAL: survived 8/8, won / national / table / entered
0, vests 2, wave reach 2 on 8/8, maxArc 3 on 8/8, both legs.
Raw panel archived as
evidence/2026-11-02/sim-homeward-substrate-b-panel.json.gz.
The panel substrate independently corroborates the driver
on band 2: the guard's work (diverting 67105, fencing
68001-style steps) sits below the panel's 30-day
resolution. No split-panel compare is claimed: the
predecessors' split compares return INVALID by design
(policy-split panels can never match), and no compare
verdict is needed for a diagnostic run. No panel verdict
is claimed in any case.

## Wall numbers (in-window only, never pooled across arms)

Driver substrate, all 16 screening legs: median survival
30d on every leg; survived 8/8 seed-legs on every leg
(driver endReason; player deaths under succession do not
end the village — e.g. 67101 records a player starvation
death day 20 while the village survives); maxWaveUnlocked
never above 3 (bands 4 and 6 carry one wave-3 seed each on
the baseline leg; band 4's armed leg tops out at wave 2);
wave 4-5 unlocks 0 on all 64 seeds on both legs. Panel
substrate, band 2: national / table / wins 0 on both legs
(expected 30-day pre-seat profile, not a regression).
No wall movement is shown or claimed: this run validates
an instrument and screens a substrate, it does not move
the scale wall.

## Sense-testing (transcripts, not just counts)

- The veto line reads true wherever it speaks: "You
  don't walk there — you couldn't get home from there."
  On 67105-armed it speaks 4 times (days 5-6, across the
  escape-attempt vetoes) and the scholar's reroute reads
  sensibly: turned back from a step into worse ground, it
  beds down one tile over on ground it can leave, and
  walks home fed the next day. On 68001-armed it speaks
  once on day 8 and the scholar carries on its day from
  escapable ground — a fence, not a stranding.
- The silent-repetition pattern recurs, twice, in its
  extreme form: 68207-armed refuses one approach step 79
  times (76 silent, 3 spoken on days 4-6) while the
  scholar ends every day home; 69208's band carries 36
  vetoes (34 silent) on a single away day-end. Same
  design question carried from the predecessors: memory
  suppressing every repeat may under-narrate a
  permanently refused route (a once-per-route reminder
  after long silence would read more human). This is a
  narration question about the guard, not a bar failure
  and not candidate evidence.
- The stranded villages read as honest hardship, not
  robots: 67105-shadow camps five days at (7,1) with
  kcal falling to 0, its day-5 transcript full of ordinary
  village talk (a journal note about muscadine grapes, a
  reluctant "Not today. Sorry." from Naomi, creek
  errands) — the pocket is a place the scholar walked to
  for a reason, not a scripted trap. Under guard that
  same scholar never camps there at all. Nothing robotic
  appears in any reroute: diverted scholars forage
  elsewhere, bed down where they can leave from, or come
  straight home fed.
- What the transcripts never contain in this run: a
  homeward veto line on an approach-clean entry trip —
  because no such trip exists in 64 fresh seeds. The
  homeward lines that DO exist (67105, 68001) belong to
  shapes A and C above.

## Village assessment (plain words)

Across 64 fresh villages, most scholars simply sleep home
every night: three bands end almost no day away from
haven, and the rest camp out only a handful of nights.
Where trouble does show up, it is the same story the
earlier runs told, with one new chapter. A scholar walks
a plausible route out to good ground, the ground turns
out to be a trap it cannot walk home from, and it sits
there while its food runs down — seven days on a tile at
67204, six days at 68207 to a dehydration death, five
days at 67105. Given the guard, none of those camps forms
as a pocket: the scholar is turned back at the approach
or rerouted one tile over onto ground it can leave, and
comes home fed instead. The new chapter is that the
guard's homeward eyes DO open on natural ground now —
eight times on two seeds — just not on the trip shape
this run was built to find: once when a scholar that
walked out through good ground tries to step homeward
into worse ground from a camp it can still leave, and
once when a scholar already sitting in a trap tries the
homeward steps that would only deepen it. The village is
not suffering for the extension's absence — it is
protected by the outward guard before the extension
could matter on the entry shape, and fenced by the
homeward guard on the shapes where it does fire. What
is still missing is a trip that walks out clean and then
faces its trap on the way home — the 61807 shape, on
fresh seeds. Sixty-four more seeds did not produce one.

## Verdict: DIAG-NO-CANDIDATE (validation VALIDATED, screen empty)

- VALIDATION PASSES: matched-prefix agreement 6/6 on
  61807 and 3/3 on 64601, BAR100 PASS on both, fresh logs
  identical to stored predecessor logs. Shadow-log E is
  validated for approach-clean screening under the
  prereg's first-occurrence matched-prefix rule.
- SCREENING FAILS to qualify: 0 approach-clean candidate
  trips in 8 bands / 64 seeds; the budget is spent, no
  band qualifies, screening stops. Per the prereg, NO
  pilot was run and NO extension verdict (GO or NO-GO)
  is claimed. The 61807 diagnostic is not re-judged.
- The 8 armed homeward vetoes on bands 2 and 4 are
  reported in full above as non-candidate firing evidence.
  They do NOT change the verdict (metric binding): the
  prereg defined a candidate as a homeward-entry trip,
  and none of the 8 is one. They DO change the next
  run's design (see metric review).

## Metric review (for the NEXT run, never a re-score)

- The approach-clean definition is too narrow for where
  the extension actually fires. It required a homeward
  ENTRY step (walk out from haven, homeward step into
  the pocket). The observed firing shapes are (A)
  outward entry + homeward escape-attempt vetoes and
  (C) mid-trip homeward fence from escapable ground.
  The next prereg should screen for EITHER shape, with
  the shape named per candidate: (A) a trip whose shadow
  day-end sim fails while the armed leg's homeward vetoes
  keep its day-end sim passing, or (C) a trip where an
  armed homeward veto's origin sim passes and the vetoed
  destination's E fails. Band 2 (67105) and band 4
  (68001) are the concrete prototypes — but as screening
  prototypes for the next run's definition, not as
  retroactive qualifiers here.
- E IS TIME-SENSITIVE, and the definition must say so:
  on 67105, E((7,1)) passes at walk-out time but the
  day-end return sim from (7,1) fails, because the day's
  foraging depletes the lateral stock the escape sim
  needs. Hop-time E and day-end E are different
  measurements of the same tile at different stock
  states. A future screen that equates "E passed at
  entry" with "the tile is escapable" will misread
  pockets that form during the day. The next prereg
  should record both evaluations (hop-time simOk and
  day-end sim) per candidate trip.
- The predecessor's 61807 shadow-divergence prose claim
  is now a closed provenance question with an open
  footnote: it does not reproduce in the claiming run's
  own files or in fresh runs. If it ever resurfaces, the
  first check is guard version: the claim matches what
  an older, jump-only E (no lateral legs) would say
  about (1,1)->(2,0) — but that is a hypothesis, not a
  finding, and it needs a version-pinned reproduction
  before it is cited again.
- The silent-repetition narration question (68207: 79
  vetoes, 3 spoken; 69208 band: 36 vetoes, 34 silent)
  is carried, unchanged, as a Steve-call design question
  about the guard's narration — not about the extension.
- Screening yield note (carried, updated): approach-clean
  homeward-entry trips run at 0/64 fresh seeds here (and
  0 in every prior band search); armed homeward vetoes
  of ANY shape run at 8/64 seeds here, all on 2 seeds.
  A future natural-band search for the entry shape
  should assume a near-zero hit rate; a search for
  shapes A/C should assume a low but nonzero rate, and
  a constructed-trip substrate remains the surest route
  to a judged entry-shape pilot.
- Blanks filled or documented: filled — the shadow-vs-
  armed instrument question (validated, with per-hop
  tables and a determinism check). Documented — (a) the
  8-band screening ledger above; (b) the three veto
  shapes with hop-level detail; (c) the E time-
  sensitivity finding; (d) the non-reproduction of the
  predecessor's divergence claim. No game or policy
  change was made — correctly, since there is no judged
  effect to land. No findings outside this arm were
  found, so nothing is appended to the findings backlog.

## Census (proof, not judged evidence)

scripts/test-homeward-substrate-b.js: ALL PASS (11 checks
— validator agreement/disagreement/64601-shape cases,
screener qualify/reject cases, band-vs-banned check,
reused-files-unmodified check). Predecessor proof tests
re-run post-commit as regression checks:
scripts/test-homext-abl-b.js PASS 21 checks,
scripts/test-homeveto-screen-b.js ALL PASS (10 checks).
Post-final-commit re-runs are quoted in the coordinator
report; any failure would have blocked the commit, and
none occurred.

## Corpora

- evidence/2026-11-02/sim-homeward-substrate-b-prereg.md
- evidence/2026-11-02/sim-homeward-substrate-b.md (this file)
- evidence/2026-11-02/sim-homeward-substrate-b-val61807-{baseline,armed}.jsonl (+ .log)
- evidence/2026-11-02/sim-homeward-substrate-b-val64601-{baseline,armed}.jsonl (+ .log)
- evidence/2026-11-02/sim-homeward-substrate-b-screen{1,2,3,4,5,6,7,8}-{baseline,armed}.jsonl (+ .log)
- evidence/2026-11-02/sim-homeward-substrate-b-panel.json.gz
  (band-2 panel context, 16 cases)
- scripts/analyze-homeward-substrate-b.js + scripts/test-homeward-substrate-b.js
