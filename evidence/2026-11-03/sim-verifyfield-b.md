# sim-verifyfield-b — VERIFICATION-FIELD VERDICT: PILOT-NO-GO on the tie leg (re-judgment of the 2130Z corpus)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T2330Z,
axis food-economy, arm sim-verifyfield-b. Worktree
sim-verifyfield-b, branch sim-verifyfield-b. MEASUREMENT ONLY:
zero src/js changes, zero policy-default flips, zero gate or
price changes, zero edits to any existing script or policy
file. New files only, all named *-verifyfield-b.*: the prereg,
the proof test, and this evidence file. The tracer corpus
(evidence/2026-11-03/sim-streakfree-cost-b-tracer.jsonl), the
cost analyzer (scripts/analyze-streakfree-cost-b.js), the
gatediseng analyzer (scripts/analyze-gatediseng-b.js), and the
streakfree analyzer (scripts/analyze-streakfree-b.js) are REUSED
VERBATIM, read-only, never edited. This worker does NOT push,
bump versions, verify live, or merge — the coordinator lands
the branch. This run does NOT deploy (e*), (v*), or (v**): a
verdict here lands an instrument decision + evidence ONLY.
No deploy claim may cite this run alone.

## Verdict: PILOT-NO-GO — judged exactly against the prereg bars

Prereg: evidence/2026-11-03/sim-verifyfield-b-prereg.md
(committed 960e08d5f BEFORE any judging in this run; tools
commit 35b58e0ab after the prereg commit and before the
evidence commit; proof test 33/33, synthetic series + live
corpus counts; the reused proof tests were also re-run green
before judging: streakfree-cost 24/24, streakfree 22/22,
gatediseng 21/21, gatediseng-confirm 11/11).

The prereg settled the one open question first, from tracer
semantics: verification compares rows to daysAlive WITH a
village-lost loss-day exemption, and gameDays is NOT a
verification field (see "The settled field" below). Under
that settled field ALL 28 corpus legs verify, so the full
corpus is judged — including the two legs the 2130Z run
could not judge. The variant (v**) = (e**) OR (F), (e**) =
(e*) with E1 tightened 0.90 -> 0.85 peak, (F) and (c)
carried verbatim (definitions in the 2130Z prereg, carried
by reference).

| leg | result | bar | outcome |
|---|---|---|---|
| Count gate: traced still-collapsing | 12 | >= 4 | PASS |
| Count gate: traced survivors | 16 | >= 12 | PASS |
| Settled-field tracer verification | 28/28 (26 exact + 2 exempted loss legs, corroborated) | every leg | PASS |
| Fire leg: (v**) fires on collapsing | 12/12 | all | PASS |
| Tie leg: lead_v >= lead_c | 11/12 (sole miss 83248) | all | **FAIL -> PILOT-NO-GO** |
| Strict leg: lead_v > lead_c | 10/12 = 83.3% | >= 50% | PASS |
| Lead-one leg: lead_v >= 1 | 10/12 = 83.3% | >= 75% | PASS |
| Cost leg: (v**) fires on survivors | 1/16 = 6.25% | <= 25% | PASS |
| Cross-check: independent (c) vs reused (c) | 0 mismatches on 28/28 | any mismatch = INSUFFICIENT-DATA | PASS |
| Survivor drift / still-collapsing exclusions | none (12/12 candidates still collapsing, 16/16 survivors still survivors, on the corpus as recorded) | reported | — |

PILOT-NO-GO means, per the prereg: the count gates hold but
a judged leg fails, with the failing leg named — here, the
tie leg, on seed 83248 alone. The shape does not advance on
this evidence. Nothing in this run re-scores the tie leg
against a friendlier metric: the 2130Z descriptive section
already flagged exactly this miss, and re-judgment confirms
it with the full corpus. The two formerly unverified legs
both TIE or BEAT (c) (83373 ties in the lead-comparison
sense, 83377 strictly beats), so including them does not
rescue or worsen the tie leg — the verdict turns on 83248,
as it did descriptively.

## The settled field (the blank this run fills)

DECIDED IN THE PREREG, BEFORE JUDGING: a leg verifies iff
its rows are contiguous in loopDay 1..N AND (N == daysAlive
OR (endReason is 'village-lost' AND N == daysAlive - 1 AND
gameDays == N)). Rationale, from tracer semantics:

- A row is one policy.daily call, in loopDay order
  (scripts/trace-gatecover-b.js). Contiguity 1..N is the
  real completeness check. All 28 corpus legs are
  contiguous.
- daysAlive is runDays' day count (scripts/sim-harness.js).
  For a village lost on its final day, the harness counts
  that day even though the village dies before that day's
  evening daily call produces a row — so N == daysAlive - 1
  is the EXPECTED complete count for a village-lost leg,
  not a missing row. The 2130Z finding is exactly this
  shape, deterministic across all four lines for 83373 and
  83377 (screen, tracer, screen re-run, tracer re-run):
  rows == gameDays == daysAlive - 1.
- gameDays is REJECTED as the field: it is the scholar's
  game-clock day at run end (sim-harness.js: gameDays =
  Game.state.scholar.day || 0), not a row count. On this
  corpus it equals rows on all 12 collapsing legs but
  EXCEEDS rows on 14 of 16 complete survivor legs (rows
  30, gameDays 31 on thirteen survivors and 32 on 83208,
  whose last row itself carries gameDay 31). Verifying
  rows == gameDays would falsely fail 14 complete survivor
  series — a strictly worse verifier. gameDays serves only
  as corroboration on exempted loss legs, where it equals
  N, showing the series ends at the game clock rather
  than being truncated mid-series.
- The exemption is narrow by construction: village-lost
  only, exactly daysAlive - 1 only, with contiguity and
  gameDays corroboration. A survivor leg at
  N == daysAlive - 1 would still FAIL.

Corpus verification under the settled field, leg by leg:
26 legs at rows == daysAlive (10 collapsing exact, 16
survivors); 2 legs exempted (83373: rows 19, daysAlive 20,
gameDays 19; 83377: rows 25, daysAlive 26, gameDays 25),
both contiguous and corroborated. No leg needed a re-run
in this run: the legs are judged as recorded in the 2130Z
corpus, and the settlement changes which field is
compared, not the consequence of failing it.

## Before/after — (c) vs (v**) on identical trajectories (judged)

lead = first-starvation day - first-firing day. (v**)
clause: F = fallback, E1 = envelope, E2 = cliff. (e**) and
(F) days are the variant's components; (v**) takes the
earlier of the two in the first firing stretch.

| seed | ref (1st starv.) | (c) day/lead | (e**) day/clause | (F) day | (v**) day/clause/lead | tie | strict |
|---|---|---|---|---|---|---|---|
| 83230 | 16 | 15 / 1 | 13 E2 | 14 | 13 E2 / 3 | yes | yes |
| 83248 | 20 | 17 / 3 | 18 E1 | 18 | 18 E1 / 2 | **no** | no |
| 83263 | 20 | 20 / 0 | 19 E2 | 20 | 19 E2 / 1 | yes | yes |
| 83272 | 25 | 21 / 4 | 20 E1 | 21 | 20 E1 / 5 | yes | yes |
| 83281 | 28 | 28 / 0 | 28 E2 | 28 | 28 E2 / 0 | yes | no |
| 83284 | 22 | 23 / -1 | 21 E2 | 23 | 21 E2 / 1 | yes | yes |
| 83286 | 17 | 17 / 0 | 16 E2 | 17 | 16 E2 / 1 | yes | yes |
| 83336 | 27 | 25 / 2 | 21 E1 | 23 | 21 E1 / 6 | yes | yes |
| 83341 | 21 | 15 / 6 | 14 E2 | 15 | 14 E2 / 7 | yes | yes |
| 83373 | 16 | 17 / -1 | 16 E2 | 17 | 16 E2 / 0 | yes | yes |
| 83377 | 25 | 15 / 10 | 14 E1 | 15 | 14 E1 / 11 | yes | yes |
| 83379 | 28 | 24 / 4 | 23 E1 | 24 | 23 E1 / 5 | yes | yes |

Fire coverage: (c) 12/12, (v**) 12/12 — no coverage gain,
the old rule already fired on all twelve. Mean lead:
(v**) 3.5 days vs (c) 2.33 days (+1.17 days, coverage
identical, so the comparison is clean). Death-knell
firings (lead_v == 0, named even on a GO — here on a
NO-GO, named all the same): 83281 and 83373. On 83281
(v**), (e**), and (c) all fire on the first-starvation
day itself; on 83373 (v**) fires on the first-starvation
day while (c) fires a day AFTER it (lead_c -1).

### The tie miss (83248) — the tightening's trade, now judged

On 83248, old (e*) would have fired day 16 (E1, pantry
15,650 at 0.898 of peak 17,430 — just under the old 0.90
envelope), while (e**) waits until day 18 (pantry 13,400
at 0.769 of peak), and (c) fires day 17. The E1@0.85
tightening itself costs two days on this seed and loses
the tie leg (lead_v 2 vs lead_c 3). This is the honest
trade the fresh band revealed and this run certifies: a
tighter envelope kills shallow survivor firings, but it
also delays warnings on collapses whose store hovers at
0.87-0.90 of peak for days. The proof test reproduces
the mechanism on a synthetic series (hover at
0.87-0.90, (c) day 10, (v**) day 11).

### Cost leg (judged, survivors)

(v**) fires on 1 of 16 traced survivors: 83201 (day 15,
E1 envelope — pantry 18,489 at 0.785 of its stretch peak
23,550, streak 6; (F) also fires day 15 on the same
evening). 1/16 = 6.25%, passing the <= 25% bar with wide
margin. (c) fires on the same single survivor (83201,
day 15); the (c)-vs-(v**) survivor overlap is exactly
that seed. The other 15 survivors are silent under both
rules. The contrast with the old corpus (cost 4/15,
failing) is now a JUDGED contrast on this corpus, not a
descriptive one — but it does not rescue the verdict,
because GO requires every leg.

### 2130Z descriptive-vs-judged delta

Only two things change status under the settled field:
(1) the verification status of 83373 and 83377 (fail ->
pass, via the loss-day exemption); (2) the verdict class
itself (INSUFFICIENT-DATA -> PILOT-NO-GO on the tie leg).
Every descriptive leg count from 2130Z survives intact
with two legs added: fire 10/10 -> 12/12, tie 9/10 ->
11/12, strict 8/10 -> 10/12, lead-one 9/10 -> 10/12, cost
1/16 unchanged, cross-check 0 mismatches on 26 -> 0 on
28, mean lead (v**) 3.1 -> 3.5 days, (c) 1.9 -> 2.33 days.
No descriptive number was overturned by the re-judgment.

## DESCRIPTIVE DRIFT CHECK ONLY (never judged legs)

Re-ran the verbatim gatecover tracer for seeds 83373 and
83377 on the current master base in this worktree (ship
tip 23f71b7f4), twice each. Result: BOTH SEEDS NOW
SURVIVE the 30d window, deterministically (two runs each,
byte-identical rows):

| seed | 2130Z corpus (base 9818ac98a lineage) | current master, run 1 | current master, run 2 |
|---|---|---|---|
| 83373 | village-lost, daysAlive 20, rows 19, first starvation day 16, wave 2 | survived, daysAlive 30, rows 30, gameDays 31, no starvation deaths, wave 2 | identical to run 1 |
| 83377 | village-lost, daysAlive 26, rows 25, first starvation day 25, wave 3 | survived, daysAlive 30, rows 30, gameDays 30, no starvation deaths, wave 3 | identical to run 1 |

This is BASE DRIFT, not flakiness, and not an invocation
difference (verbatim tracer invocation, same env flags):
the 2130Z judging base was its worktree branch (parent
2d8f1f02c), which predates sibling landings now on
master — including gap-batch 14/15 (competent policy
staffs deadfall duty, Haven-doorstep step) and the
hurt-traveler narration landing, with game.js and
competent.js both changed since that base. Those landings
plausibly change early trajectories enough that two
marginal villages now make it through the month. Per the
prereg, these re-runs NEVER enter any judged denominator
and do not change the verdict above, which judges the
2130Z corpus as recorded. But they do mean the judged
verdict is a verdict on a stale-base corpus: a fresh-band
re-judgment on current master is a NEW run with a NEW
prereg, not a continuation, and on current master these
two seeds would not be collapsing candidates at all.
That staleness is documented here rather than hidden, and
it is the strongest item in metric review below.

## Sense test (firing-evening transcripts from the corpus)

Read 3 firing evenings: the two newly judged legs' firing
evenings (83373 day 16, 83377 day 14) and the tie-miss
leg's firing evening (83248 day 18). Verdict in plain
words: on all three evenings the warning would land
SILENTLY — nothing in the transcript notices the store
falling. That matches the 2130Z sense test (its three
evenings were also silent) and is expected for a
would-fire overlay with no deploy and no narration yet,
but it is reported as such because a future deploy must
frame (v**) as the village store's fall and must actually
SAY something on the firing evening, or the warning is
invisible.

Seed 83373, variant fires day 16 via E2 (pantry 3,446,
streak 3, 12 alive; first starvation day 16 — a
death-knell firing). Quoted from that evening:

> "You work the patch with practiced hands: 8x Hickory Nuts (in shell — shell them to eat). This patch is picked clean — it'll recover in a few days."
> "⚔️ Carol killed the Nostalgia with their party — 4 rounds, 48 taken. Word travels fast. The village cheers."
> "📖 Mia starts in on the lesson, then catches themself. "Hold on — I already showed you this one. Hickory Nuts. You remember.""

The evening reads as a busy, even celebratory day — kills
cheered, a lesson by the fire, counters learned — while
the store sits at 3,446 and the first starvation death
lands the same day. No line mentions the store.

Seed 83377, variant fires day 14 via E1 (pantry 11,500,
streak 5, 11 alive; first starvation day 25 — eleven
days of lead). Quoted from that evening:

> "★ Deeper knowledge: Blackberry. Parts: berries (eat), leaves (tea), roots (medicinal). Pick ripe (black, not red). (Yield +50%)."
> "You work the patch with practiced hands: 3x Blackberry (195 kcal). This patch is picked clean — it'll recover in a few days."
> "You keep a day's food (195 kcal) — nothing extra for the pantry this time."

This is the most usable evening of the three: the warning
lands eleven days early, on an evening that otherwise
reads as a good day (kills, new knowledge, garden magic).
The closest line to store awareness is "nothing extra
for the pantry this time" — it notices the day's haul,
not the store's fall from its recent high. A deploy
framing could hang its sentence on exactly that moment
("nothing extra for the pantry" -> "and the store has
fallen this far from its high"), but as recorded, the
warning itself is silent.

Seed 83248, variant fires day 18 via E1 (pantry 13,400,
streak 7, 11 alive; first starvation day 20). Quoted:

> "You catch fragments by the fire — Ella telling Mateo about you. Three retellings in, nobody remembers what actually happened — but everyone has opinions."
> "The body is stripped. What's left isn't worth taking."
> "You take denim jacket, crude bow, gilded pack from Wakjira. Your hands know what they did. (+11 trauma)"

A grim evening — gossip, a stripped body, trauma — but
again no store-fall line, even with a streak of 7. The
village's attention is on people and bodies, not on the
pantry number the sensor reads.

## Village assessment (plain words)

The villages, across the 28 traced legs: sixteen make it
through the month and twelve are lost, all twelve by
hunger, with first starvation deaths on days 16-28 after
the store has been draining for days. On the twelve
collapsing villages, the tightened variant would have
raised its flag about three and a half days before the
first starvation death on average, and it fires on every
single one of them — but on one of the twelve it fires a
day later than the old rule, because the tighter envelope
makes it wait for a deeper fall, and on two it fires only
on the death day itself. The flag goes up on only one
surviving village out of sixteen, which is a much cheaper
warning than the last run's — but the cheaper warning
costs the tie: the old rule is never beaten-or-tied on
every village, only on eleven of twelve. Nothing here
changes the game — no lever was flipped, no villager
behaves differently today than yesterday. And the drift
check adds a sober footnote: on today's game, two of the
twelve collapsing villages in this record would not
collapse at all — the villages got a little hardier
between the record and now, or the record's month got a
little easier, and either way this verdict belongs to
the record's game, not quite to today's.

Villagers acting like people (sampled from the same
transcripts): the fire-side teaching still reads as
people talking and teaching (Mia catching herself
repeating a lesson), gossip chains still mutate as they
travel ("Three retellings in, nobody remembers what
actually happened"), and counter-teaching by the fire
still reads as earned knowledge passed person to person.
The counterweight, carried from the prior run, is that
monster-at-the-treeline lines and forage lines repeat
their shape evening after evening — but that is the
game's narration doing its job, not a new robotic
artifact found here, so no new backlog item is appended.

## Reachability verdict

Waves 1-5: traced legs reach wave 2 (13 legs) and wave 3
(15 legs) in this 30d window; collapsing legs reach wave
2 (9) and wave 3 (3). Waves 4-5 are NOT reached in this
window — expected for a 30d early window, not a claim
about the game. Arc II/III/IV, regional -> national, the
table, and the win flag are NOT REACHED IN WINDOW (no
fields in this window, reported as such, not as a rate
claim). Vests: not measured by this instrument.

## Wall numbers (judged legs, 30d limit stated)

Judged legs (28): survival 16/28; median days alive 30,
max 30. Traced collapsing seeds: 12. Wave reach: wave 2
on 13 legs, wave 3 on 15 legs. National / table / wins:
NOT REACHED IN WINDOW (expected 0 — late-game states
with no fields in this window).

## Balanced panel (§15) — inapplicability declared in the prereg

No balanced-panel compare is fabricated, exactly as the
prereg declares: this arm changes NO game code, runs NO
lever, and its primary metrics are within-trajectory
instrument diagnostics (would-fire overlays on identical
evening series), not panel metrics. The tables above are
reported directly, on identical seeds and identical
trajectories.

## Metric review (doubts about this header go here; any revision applies to the NEXT run, never to this one)

1. Corpus staleness (new, strongest item): the judged
   corpus sits on a worktree-branch base (9818ac98a
   lineage, parent 2d8f1f02c) that predates sibling
   landings now on master, and the drift check proves the
   staleness matters — both formerly unverified legs now
   survive on current master. The next run's prereg
   should require the judged corpus to be generated on
   current master (screen + tracer on one base, as the
   2130Z prereg required, but with the base verified
   against master at screen time, not just held constant
   within the run). A re-judgment on a stale corpus is
   still a valid instrument verdict, but it must be
   labeled stale-base wherever cited, and it must not be
   pooled with fresh-band results.
2. Tie leg as a veto (carried, sharpened): the tie leg
   demands (v**) tie-or-beat (c) on EVERY collapsing
   seed, so one hovering-store seed (83248) vetoes the
   whole shape even as strict (83%), lead-one (83%),
   fire (100%), and cost (6.25%) all pass with margin.
   The 2130Z metric review already floated an
   intermediate envelope (0.87/0.88) or a tie repair; this
   run adds that the veto is doing real work — it caught
   a genuine trade, not noise — so any revision should
   change the VARIANT (new prereg, fresh band) rather
   than soften the leg. Softening tie to a percentage
   bar would certify a shape known to warn later than
   the old rule on hovering stores.
3. Loss-day exemption, scope note: the settled field
   exempts exactly village-lost legs at daysAlive - 1
   with gameDays corroboration. If a future tracer
   records a village-lost leg at daysAlive - 1 WITHOUT
   gameDays == N (e.g. a loss during a day whose game
   clock also advanced), the exemption would fail it and
   the run would go INSUFFICIENT-DATA again on a
   semantics question, not a variant question. A next
   prereg could pre-register a fallback corroboration
   (e.g. last-row gameDay == N, or classification
   stability across re-runs) — but only before judging,
   never after seeing which legs fail.
4. Sense-test scope (carried): the transcript lines
   available to this instrument are player-perspective
   evening lines; villagers' own noticing may live in
   lines this tracer does not capture. "Silent evening"
   here means silent in the captured transcript, not
   proven silent in the full game. A deploy-time sense
   check should read the live evening narration, not
   just this tracer.
5. Cost-bar granularity (carried): with 16 survivors one
   seed is 6.25 points, so the 25% bar (4 seeds) is still
   coarse; the judged 1/16 passes with margin, but a next
   run that needs cost precision should pre-register a
   larger survivor sample.

## Corpora and proofs

- Prereg: evidence/2026-11-03/sim-verifyfield-b-prereg.md
  (960e08d5f)
- Tools: scripts/test-verifyfield-b.js (35b58e0ab)
- Judged corpus (reused, verbatim):
  evidence/2026-11-03/sim-streakfree-cost-b-tracer.jsonl
  (28 lines; sha256 at prereg time
  e4f97a2219126f7ac580fe57d011183f993dfdfbf5ec9471b224608b013b8ea5;
  count and membership verified identical to the 2130Z
  summary's full-corpus seed list)
- 2130Z sources: evidence/2026-11-03/
  sim-streakfree-cost-b-prereg.md,
  sim-streakfree-cost-b.md,
  sim-streakfree-cost-b-summary.json
- Drift re-runs (descriptive only, NOT committed corpora;
  run in /tmp by this worker, reported above): seeds
  83373, 83377, twice each on current master — both
  survived, byte-identical rows per seed.
- Proofs: scripts/test-verifyfield-b.js 33/33,
  scripts/test-streakfree-cost-b.js 24/24,
  scripts/test-streakfree-b.js 22/22,
  scripts/test-gatediseng-b.js 21/21,
  scripts/test-gatediseng-confirm-b.js 11/11, all on the
  worktree base before judging (reused proofs) or before
  the evidence commit (new proof).
- No game code, policy, or existing-script change. No
  demand/gate/price change. Nothing pushed, bumped, or
  live-verified.

## Blanks filled or documented

- Filled: tracker blank 1 follow-up for food-economy —
  the verification field is now SETTLED before judging
  (daysAlive + village-lost loss-day exemption;
  gameDays rejected as a field with the survivor
  counterexample), and variant (v**) is now JUDGED on
  the full 28-leg corpus: PILOT-NO-GO on the tie leg
  (sole miss 83248). The 2130Z INSUFFICIENT-DATA is
  resolved into a pass/fail verdict, not left open.
- Documented (not fixed, for the next run's prereg):
  (a) current-master drift — 83373 and 83377 now survive
  deterministically, so the judged corpus is stale-base
  relative to master; (b) the E1@0.85 tie/cost trade is
  now a judged finding, not a descriptive one; (c) the
  sense-test silence repeats on the newly judged firing
  evenings, including a death-knell firing (83373).
- No new findings-backlog item: nothing outside this arm
  surfaced that is not already logged or documented above.
  The drift staleness is a measurement-base fact for the
  next prereg, not a game gap.
