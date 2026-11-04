# sim-freshband-b — FRESH-BAND RE-JUDGMENT: PILOT-GO on all legs

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261104T0046Z,
axis food-economy, arm sim-freshband-b. Worktree sim-freshband-b,
branch sim-freshband-b. MEASUREMENT ONLY: zero src/js changes,
zero policy-default flips, zero gate or price changes, zero edits
to any existing script or policy file. New files only, all named
*-freshband-b.*: the prereg, the analyzer, the proof test, this
evidence file, the screen corpus, the tracer corpus, and the
summary. The gatecover tracer, gatediseng analyzer,
streakfree-cost analyzer, envelope analyzer, and competent
policy are REUSED VERBATIM, read-only, never edited. This
worker does NOT push, bump versions, verify live, or merge to
master — the coordinator lands the branch. This run does NOT
deploy (e*), (v*), or (v**): a GO here lands an instrument
file + evidence ONLY, and no deploy claim may cite this pilot
alone.

## Verdict: PILOT-GO — judged exactly against the prereg bars

Prereg: evidence/2026-11-03/sim-freshband-b-prereg.md
(committed d040c427 BEFORE any screen or judged leg; tools
commit c889e3d5 after the prereg commit and before any judged
application; proof test 70/70, synthetic series only; reused
proofs re-run green on the judging base before judging:
streakfree-cost 24/24, gatediseng 21/21, gatediseng-confirm
11/11). Judging base: worktree HEAD c889e3d5 at screen start
(game code identical to its parent 6e47e1a22 — only the prereg
and tool files were added on top). Screen AND tracer BOTH ran
on that base; NO rebase happened between screen and judgment,
and no sibling landing moved the base mid-run. The variant
(v**) = (e**) OR (F), (e**) = (e*) with E1 tightened 0.90 ->
0.85 peak, (F) and (c) carried verbatim (definitions in the
prereg).

| leg | result | bar | outcome |
|---|---|---|---|
| Stage-1 GO: screened collapsing | 9 | >= 4 | PASS |
| Count gate: traced still-collapsing | 9 | >= 4 | PASS |
| Count gate: traced survivors | 16 | >= 12 | PASS |
| Settled-field tracer verification | 25/25 (24 exact + 1 loss-day-exempt 83582) | every leg | PASS |
| Screen-vs-tracer membership agreement | 25/25 | reported | — |
| Still-collapsing exclusions | none (9/9 candidates still collapsing) | reported | — |
| Survivor drift | none (16/16 survivors still survivors) | reported | — |
| Fire leg: (v**) fires on collapsing | 9/9 | all | PASS |
| Tie leg: lead_v >= lead_c | 9/9 | all | PASS |
| Strict leg: lead_v > lead_c | 7/9 = 77.8% | >= 50% | PASS |
| Lead-one leg: lead_v >= 1 | 8/9 = 88.9% | >= 75% | PASS |
| Cost leg: (v**) fires on survivors | 3/16 = 18.75% | <= 25% | PASS |
| Cross-check: independent (c) vs reused (c) | 0 mismatches on 25/25 | any mismatch = INSUFFICIENT-DATA | PASS |

PILOT-GO means, per the prereg: Stage 1 GO AND count gates
hold AND all legs hold — the (v**) shape survives a fresh
supply on the current base. It does NOT deploy (e*), (v*),
or (v**). The contrast with the prior judged run is real
and is stated plainly: on the stale-base 2130Z corpus the
same shape was PILOT-NO-GO on the tie leg (sole miss
83248); on this fresh band on current master it ties-or-
beats (c) on all nine collapsing legs. The two verdicts
are verdicts on different bands on different bases; neither
is pooled into the other, and this GO does not erase the
83248 finding — it shows the tie failure does not recur
on this fresh supply.

## Stage 1 — screen (fresh band 83401-83600, 30d competent)

200 seeds screened via the verbatim gatecover tracer, in
seed order, on the judging base. Every screen line verified
under the settled field (0 failures). Screen rate:
9/200 = 4.5% collapsing.

Screened collapsing (9), with first-starvation day (ref)
and days alive:

| seed | ref (1st starv.) | days alive | loss day |
|---|---|---|---|
| 83410 | 21 | 23 | before horizon |
| 83412 | 28 | 30 | ON horizon day |
| 83413 | 15 | 17 | before horizon |
| 83445 | 16 | 17 | before horizon |
| 83460 | 28 | 30 | ON horizon day |
| 83503 | 29 (game-clock day; see metric review 1) | 28 | before horizon |
| 83515 | 20 | 21 | before horizon |
| 83533 | 20 | 29 | before horizon |
| 83582 | 20 | 24 | before horizon |

Screened survivors: 189. First 16 in seed order (the
fixed survivor sample): 83401, 83402, 83403, 83404, 83405,
83406, 83407, 83408, 83409, 83411, 83414, 83415, 83416,
83417, 83418, 83419. Other outcomes (2, neither
collapsing nor survivors, counted in neither
denominator): 83502 (village-lost day 27, no starvation
death), 83512 (village-lost day 20, no starvation death).
Screen waves: wave 2 on 44 seeds, wave 3 on 156 seeds.

## Stage 2 — judged legs (tracer corpus, same base)

lead = first-starvation day - first-firing day. (v**)
clause: F = fallback, E1 = envelope, E2 = cliff. (e**)
and (F) days are the variant's components; (v**) takes
the earlier of the two in the first firing stretch.

| seed | ref | (c) day/lead | (e**) day/clause | (F) day | (v**) day/clause/lead | tie | strict |
|---|---|---|---|---|---|---|---|
| 83410 | 21 | 17 / 4 | 17 E1 | 17 | 17 E1 / 4 | yes | no (equal) |
| 83412 | 28 | 8 / 20 | 16 E2 | 8 | 8 F / 20 | yes | no (equal) |
| 83413 | 15 | 16 / -1 | 15 E2 | 16 | 15 E2 / 0 | yes | yes |
| 83445 | 16 | 15 / 1 | 14 E2 | 15 | 14 E2 / 2 | yes | yes |
| 83460 | 28 | 28 / 0 | 24 E2 | 26 | 24 E2 / 4 | yes | yes |
| 83503 | 29 | 26 / 3 | 25 E2 | 26 | 25 E2 / 4 | yes | yes |
| 83515 | 20 | 21 / -1 | 19 E2 | 8 | 8 F / 12 | yes | yes |
| 83533 | 20 | 15 / 5 | 13 E2 | 15 | 13 E2 / 7 | yes | yes |
| 83582 | 20 | 20 / 0 | 17 E2 | 18 | 17 E2 / 3 | yes | yes |

Fire coverage: (c) 9/9, (v**) 9/9 — no coverage gain, the
old rule already fired on all nine. Mean lead: (v**) 6.2
days (56/9) vs (c) 3.4 days (31/9) (+2.8 days, coverage
identical, so the comparison is clean). Death-knell
firings (lead_v == 0, named even on a GO): 83413 alone
— (v**) fires on the first-starvation day itself, while
(c) fires a day AFTER it (lead_c -1). The two exact ties
(83410, 83412) are the non-strict legs; on both, (v**)
matches (c) to the day rather than beating it.

### Cost leg (judged, survivors)

(v**) fires on 3 of 16 traced survivors: 83401 (day 13,
E2-cliff), 83405 (day 14, E1-envelope), 83408 (day 8,
F-fallback). 3/16 = 18.75%, passing the <= 25% bar (4
seeds) with one seed of margin. (c) fires on 2 of the 16
(83401 day 14, 83408 day 8); the (c)-vs-(v**) survivor
overlap is exactly those two seeds — 83405 fires under
(v**) only. Descriptive nuance, not a re-score: the
tracer deaths list for survivor 83401 contains a
starvation death (a villager starved while the village
survived the month), so that firing is not a purely
false alarm in the human sense — the village did lose
someone to hunger even though it lived. The other two
firing survivors show no starvation death.

## DESCRIPTIVE envelope sensitivity (never judged, never pooled)

E1 at 0.87, 0.88, 0.90 holding (F) and (c) verbatim, same
method as scripts/analyze-envelope-b.js, computed on the
fresh traced legs. Per-seed variant days are IDENTICAL
across all four fractions on ALL 25 traced legs — every
collapsing day and every survivor firing day is the
same at 0.85, 0.87, 0.88, and 0.90. Aggregates on the
envelope tool's own verified subset (8 collapsing legs
— it counts rows == daysAlive only, so loss-exempt
83582 is excluded from ITS aggregates, not from the
judged verdict): fire 8/8, tie 8/8, strict 6/8, lead-one
7/8, mean lead (v**) 6.6 vs (c) 3.9, survivors 3/16, at
every fraction. The judged 9-leg numbers differ only
because 83582 joins under the settled field (strict and
lead-one both pass there).

What this means: on this fresh band the old corpus's
fraction discrimination does NOT replicate — there is
no 0.87/0.88 dead zone and no 0.90 gain, because there
is no hovering-store leg here at all. The verdict is
fraction-robust on this band, but the band gives no
evidence about 0.85 vs 0.90: that question is
unidentifiable here (see metric review 3).

## Knife-edge visibility (descriptive, never judged)

For EVERY E1 firing on traced legs, the pantry/peak
fraction at firing. There are exactly two E1 firings
in the whole traced set, and neither is near any
boundary:

| seed | role | E1 day | pantry / peak | fraction |
|---|---|---|---|---|
| 83410 | collapsing | 17 | 15,100 / 19,500 | 0.7744 |
| 83405 | survivor | 14 | 7,568 / 11,460 | 0.6604 |

No sub-0.001-margin firing exists on this band. The
0.85 bar is not being held up by a knife-edge leg here,
and no leg sits between 0.85 and 0.90 waiting to flip
the verdict — consistent with the identical-days
envelope result above.

## Sense test (firing-evening transcripts, plain words)

Read three collapsing firing evenings: 83515 day 8 (F,
lead 12 — the earliest warning in the set), 83413 day 15
(E2, lead 0 — the death-knell), 83410 day 17 (E1, lead 4
— the tie leg). Verdict in plain words: on all three
evenings the warning would land SILENTLY — nothing in
the transcript notices the store falling. That matches
the prior runs' sense tests and is expected for a
would-fire overlay with no deploy and no narration yet,
but it is reported as such because a future deploy must
frame (v**) as the village store's fall and must
actually SAY something on the firing evening, or the
warning is invisible.

Seed 83515, variant fires day 8 via F (pantry 15,386,
streak 0, 12 alive; first starvation day 20 — twelve
days of lead). Quoted from that evening:

> "You keep a day's food (270 kcal) — nothing extra for the pantry this time."
> "✨ Ability gained: Green Thumb, Literally (L1). Gather 50% more food from plants."
> "You sow Muscadine Grapes: 365 days to first harvest."

A hopeful evening — a new ability, garden sown, lessons
by the fire — and the closest line to store awareness
notices only the day's haul ("nothing extra for the
pantry this time"), not the store's three falls from
its high. Twelve days of lead on an evening that reads
as a good day is the best case for a warning, and it is
still silent.

Seed 83413, variant fires day 15 via E2 (pantry 1,400,
streak 1, 12 alive; first starvation day 15 — a
death-knell firing). Quoted from that evening:

> "You work the patch with practiced hands: 10× White Oak Acorns (in shell — shell them to eat). This patch is picked clean — it'll recover in a few days."
> "🩸 The Static mauled Sam (-33 health) over 2 rounds. They're lucky to be breathing."
> "📖 Mia starts in on the lesson, then catches themself. "Hold on — I already showed you this one. White Oak Acorns. You remember.""

A busy, productive evening — acorns hauled, a lesson
taught, a mauling reported — while the store sits at
1,400 and the first starvation death lands the same
day. No line mentions the store or the death.

Seed 83410, variant fires day 17 via E1 (pantry 15,100,
streak 6, 8 alive; first starvation day 21). Quoted:

> "★ Deeper knowledge: Muscadine Grapes. Parts: fruit (eat), leaves (wrap food), vines (cordage). (Yield +50%)."
> "You keep a day's food (1110 kcal) — nothing extra for the pantry this time."
> "✨ Ability gained: Loud Chewer (L1). Eating is 2x louder (monsters hear you)."

Again the evening reads as progress — knowledge, food,
an ability — with a streak of 6 and the store down to
0.7744 of its peak, and again the only store-adjacent
line is about the day's haul, not the fall from the
high.

## Village assessment (plain words)

The villages, across the 25 traced legs: sixteen make
it through the month and nine are lost, all nine by
hunger, with first starvation deaths on days 15-29
after the store has been draining for days. On the nine
collapsing villages, the variant would have raised its
flag about six days before the first starvation death
on average, and it fires on every single one of them —
but on one it fires only on the death day itself, and
on two it merely matches the old rule to the day
rather than beating it. The flag goes up on three
surviving villages out of sixteen — cheaper than the
old corpus's failing cost leg, inside the bar, but with
only one seed of margin. Nothing here changes the
game — no lever was flipped, no villager behaves
differently today than yesterday. The screen behind
these legs is a hardier band than the last one: 189 of
200 villages survive the month, and only nine collapse
— so this GO rests on nine collapsing villages, not
twelve, and on a band where almost everyone lives.

Villagers acting like people (sampled from the same
transcripts): the fire-side teaching still reads as
people talking and teaching (Mia catching herself
repeating a lesson, Peyton doing the same), gossip
chains still mutate as they travel ("The details have
shifted. Nobody seems to mind."), and the trust
frictions still read as social reality ("Why should I
listen to you?" / "You haven't earned that yet.").
The counterweight, carried from the prior runs, is
that the store's fall itself is never noticed in words
by anyone — but that is the missing deploy narration,
not a new robotic artifact found here, so no new
backlog item is appended (the coordinator owns the
backlog; this is reported here instead).

## Reachability verdict

Waves 1-5: traced legs reach wave 2 (8 legs) and wave 3
(17 legs) in this 30d window; collapsing legs reach
wave 2 (5) and wave 3 (4). Waves 4-5 are NOT reached in
this window — expected for a 30d early window, not a
claim about the game. Arc II/III/IV, regional ->
national, the table, and the win flag are NOT REACHED
IN WINDOW (no fields in this window, reported as such,
not as a rate claim). Vests: not measured by this
instrument.

## Wall numbers (traced legs, 30d limit stated — NOT wall movement)

Traced legs (25): survival 16/25; median days alive 30,
max 30. Traced collapsing seeds: 9. Wave reach: wave 2
on 8 legs, wave 3 on 17 legs. National / table / wins:
NOT REACHED IN WINDOW (expected 0 — late-game states
with no fields in this window). A 30d pre-seat window
CANNOT measure national / table / wins, and NO wall
movement is claimed.

## Balanced panel (§15) — inapplicability declared in the prereg

No balanced-panel compare is fabricated, exactly as the
prereg declares: this arm changes NO game code, runs NO
lever, and its primary metrics are within-trajectory
instrument diagnostics (would-fire overlays on identical
evening series), not panel metrics. The tables above are
reported directly, on identical seeds and identical
trajectories.

## Metric review (doubts about this header go here; any revision applies to the NEXT run, never to this one)

1. Game-clock skew in the reference day (new): on 83503
   the last tracer row is loopDay 28 carrying gameDay
   29, and the starvation death is recorded on gameDay
   29 — so the carried reference day (first starvation
   death day from the deaths list) exceeds daysAlive
   (28) by one. The same skew explains survivors'
   gameDays 31 vs rows 30 in the verifyfield corpus.
   The carried definition applies uniformly (firing
   days are loopDays, reference days are death-list
   days), and 83503's leads are computed exactly that
   way, but a next prereg should state the day-basis
   mismatch explicitly — or define the reference day on
   loopDay terms — before judging, never after.
2. Survivor-with-starvation-death (new): survivor 83401
   carries a starvation death in its tracer deaths list
   while the village survives. The carried collapsing
   definition (village-lost AND starvation death) keeps
   it a survivor, correctly — but the cost leg's
   "false alarm" reading is softer than the count
   suggests on that seed. A next run could report
   survivor firings split by "any starvation death in
   the leg" as descriptive context; the judged cost
   bar itself is unchanged.
3. Envelope fraction unidentifiable on this band (new,
   strongest descriptive item): with only two E1
   firings in 25 legs, both far from every candidate
   boundary (0.7744, 0.6604), and identical variant
   days at 0.85/0.87/0.88/0.90, this band cannot
   discriminate between envelope fractions. The GO is
   fraction-robust here, but it is NOT evidence that
   0.85 is the right fraction — the 83248 hover that
   motivated the tightening does not occur on this
   band at all. A future fraction decision needs a band
   (or a targeted synthetic set, never judged seeds)
   that actually contains hovering stores.
4. Tie leg fragility, both directions (carried,
   sharpened): the tie leg passes 9/9 here, but two of
   the nine are exact ties — the shape ties-or-beats
   (c) with no margin on those legs, and the prior
   corpus showed a single hover flipping tie to a
   veto. The tie leg is doing real work in both runs:
   it caught a genuine trade on 83248 and it passes
   cleanly here. Any revision should change the
   VARIANT (new prereg, fresh band), never soften the
   leg.
5. Cost-bar margin (carried): with 16 survivors one
   seed is 6.25 points, so the 25% bar (4 seeds) is
   still coarse; the judged 3/16 passes with one seed
   of margin. A next run that needs cost precision
   should pre-register a larger survivor sample — P3
   was NOT adopted here, and the sample stays 16 for
   this verdict.
6. Loss-day exemption, scope note (carried): the
   settled field's exemption was exercised exactly once
   (83582: rows 23, daysAlive 24, gameDays 23,
   village-lost) and the leg verified without a re-run.
   If a future tracer records a village-lost leg at
   daysAlive - 1 WITHOUT gameDays == N, the exemption
   would fail it and the run would go
   INSUFFICIENT-DATA on a semantics question — a next
   prereg could pre-register a fallback corroboration,
   but only before judging.

## Substrate findings (descriptive, not judged)

- Determinism spot-check: first/middle/last
  still-collapsing in seed order (83410, 83503, 83582)
  re-run verbatim — all 3 byte-identical to their
  tracer lines.
- Tracer-vs-screen byte-equality: 25/25 tracer lines
  byte-identical to their screen lines (same base,
  same tracer, same seeds — the re-run reproduces the
  screen exactly).
- Background-loop provenance incident (reported
  loudly, not hidden): the first Stage-2 background
  attempt produced a tracer file whose seed order could
  not be accounted for (it began at 83533 with the
  first seven candidates missing) while its shell
  showed no child process. That file was DISCARDED in
  full — nothing from it enters any judged
  denominator — and Stage 2 was re-run in auditable
  foreground chunks (5 + 4 + 8 + 8 legs), each chunk
  verified for seed order and outcome before the next
  ran. The judged corpus is the chunked redo only.
  The cause of the background anomaly was not
  determined; a next run should prefer chunked
  foreground tracer runs over background loops for
  corpora whose provenance must be auditable.
- EPERM flap: one evidence-dir write failed with EPERM
  mid-run (a classification scratch file); the write
  was retried via a temp copy + copy-in, the 0-byte
  file left by the failed write was deleted, and no
  0-byte file remains. The screen and tracer corpora
  themselves were written by the tracer's own
  appends and are complete (200 and 25 lines).

## Corpora and proofs

- Prereg: evidence/2026-11-03/sim-freshband-b-prereg.md
  (d040c427)
- Tools: scripts/analyze-freshband-b.js,
  scripts/test-freshband-b.js (c889e3d5)
- Judging base: c889e3d5 (worktree HEAD at screen
  start; game code identical to parent 6e47e1a22)
- Screen corpus: evidence/2026-11-03/
  screen-tmp-freshband-b/screen.jsonl (200 lines) +
  screen.log
- Tracer corpus: evidence/2026-11-03/
  sim-freshband-b-tracer.jsonl (25 lines, verified
  seed order) + sim-freshband-b-tracer-sweep.log
- Summary: evidence/2026-11-03/
  sim-freshband-b-summary.json (analyzer output:
  verdict PILOT-GO, all legs true)
- Proofs: scripts/test-freshband-b.js 70/70,
  scripts/test-streakfree-cost-b.js 24/24,
  scripts/test-gatediseng-b.js 21/21,
  scripts/test-gatediseng-confirm-b.js 11/11, all on
  the judging base before judging (reused proofs) or
  before any judged application (new proof).
- No game code, policy, or existing-script change. No
  demand/gate/price change. Nothing pushed, bumped, or
  live-verified.

## Blanks filled or documented

- Filled: tracker food-economy blank (1) follow-up —
  the fresh-band re-judgment named in the convergence
  tracker is now JUDGED on current master under the
  settled verification field: PILOT-GO on all legs
  (9 collapsing, 16 survivors, 25 traced legs). The
  2130Z INSUFFICIENT-DATA and the verifyfield
  PILOT-NO-GO are not re-litigated or pooled; this is
  a new verdict on a new band on a new base.
- Documented (not fixed, for the next run's prereg):
  (a) the envelope fraction is unidentifiable on this
  band — no hovering-store leg occurs here, so 0.85
  vs 0.90 remains undecided by evidence; (b) the
  game-clock skew in the reference day (83503);
  (c) the survivor-with-starvation-death softening of
  the cost leg's false-alarm reading (83401);
  (d) the background-loop provenance incident and the
  chunked-foreground remedy.
- No new findings-backlog item: nothing outside this
  arm surfaced that is not already logged or
  documented above (the coordinator owns
  sim-findings.md; this is reported here instead).
- Convergence state: converging (the (v**) shape
  survives its first fresh-band judgment; the open
  question is now the fraction choice and a deploy
  narration, not the shape's survival).
