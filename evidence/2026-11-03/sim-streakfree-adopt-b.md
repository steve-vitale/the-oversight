# sim-streakfree-adopt-b — ADOPTION VERDICT: INSUFFICIENT-DATA (survivor drift on seed 83013)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T1930Z,
axis food-economy, arm sim-streakfree-adopt-b. ADOPTION of dead arm
sim-streakfree-b (Loop B run 1630Z, died mid-screen-analysis;
heartbeats 74 min stale, no processes — verified dead by the
coordinator). Worktree sim-streakfree-adopt-b, branch
sim-streakfree-adopt-b. MEASUREMENT ONLY: zero src/js changes, zero
policy-default flips, zero edits to any existing script or policy
file. New files only, all named *-streakfree-b.* (cherry-picked from
the dead branch) plus *-streakfree-adopt-b.* (this adoption's
evidence, corpora, and proof test). The gatecover tracer
(scripts/trace-gatecover-b.js), the gatediseng analyzer
(scripts/analyze-gatediseng-b.js), and scripts/policies/competent.js
are REUSED VERBATIM, read-only, never edited (verified: empty diff
against master for all three). This worker does NOT push, bump
versions, verify live, or merge — the coordinator lands the branch.
This run does NOT deploy (e*) and does NOT deploy the variant (v*):
an adoption GO would have landed a policy/instrument file +
evidence ONLY. No deploy claim may cite this run.

## Verdict: INSUFFICIENT-DATA — judged exactly against the prereg bars

Prereg: evidence/2026-11-03/sim-streakfree-b-prereg.md (cherry-picked
commit b351e5bf8, written and committed by the dead worker BEFORE
any screen or judged leg; tools commit 7b22f9742 after the prereg
commit and before any judged application; proof test 22/22, pure
synthetic series, no judged seeds; the reused proof tests were also
re-run green on current base before judging: gatediseng 21/21,
gatediseng-confirm 11/11). The prereg binds this adoption in full —
no bar re-scored, no margin relaxed, no seed substituted, no clause
redefined mid-run. The variant (v*) = (e*) OR fallback (F),
first-firing wins, exactly as the prereg fixes it.

| leg | result | bar | outcome |
|---|---|---|---|
| Stage 1 screen GO: screened collapsing | 10 / 200 | >= 4 | PASS -> Stage 2 |
| Stage 2 count gate: still-collapsing | 8 | >= 4 | PASS |
| Stage 2 count gate: traced survivors | 15 | >= 12 | PASS |
| Fire: (v*) fires on still-collapsing seeds | 8/8 | ALL | PASS |
| Tie: lead_v >= lead_c | 8/8 | ALL | PASS |
| Strict: lead_v > lead_c | 6/8 = 75% | >= 50% | PASS |
| Lead-one: lead_v >= 1 | 7/8 = 87.5% | >= 75% | PASS |
| Cost: (v*) fires on traced survivors | 4/15 = 26.7% | <= 25% | FAIL (see below) |
| Cross-check: independent (c) vs reused (c) | 0 mismatches on 26/26 | Any mismatch = INSUFFICIENT-DATA | PASS |
| Tracer verification | rows == daysAlive on 26/26, first try | Failure = INSUFFICIENT-DATA | PASS |
| Survivor drift (newly collapsing cost seed) | 83013 | Any = INSUFFICIENT-DATA | **DRIVES THE VERDICT** |
| Excluded candidates (still-collapsing rule) | 83126, 83140 | reported, never a failure | — |
| Determinism spot-check | 3/3 byte-identical re-runs | Report match/mismatch | PASS |
| Tracer-vs-screen byte-equality | 10/26 identical | Report per seed (substrate finding) | SEE BELOW |

INSUFFICIENT-DATA means, per the prereg: a sampled survivor (83013)
whose tracer line NEWLY collapses is membership-changing drift.
83013 does not join the collapsing denominator mid-run, and no
replacement survivor is sampled. The cost leg also fails on its own
(4/15 = 26.7% exceeds the 25% bar), but the verdict class is set by
the drift rule: the shape does not advance on this evidence, and no
leg was re-scored to soften either finding.

## Adoption provenance (verified, not assumed)

- Dead branch sim-streakfree-b commits cherry-picked cleanly onto
  current master (77ff4a807, identical to the main tree's master tip
  at adoption time — no rebase needed): b351e5bf8 (prereg),
  7b22f9742 (analyzer + proof test). Arm-file diffs after the
  cherry-pick are exactly the dead branch's two commits.
- Salvaged screen corpus copied read-only from the dead tree
  (~/workspace/worktrees/sim-streakfree-b/evidence/2026-11-03/
  screen-tmp-streakfree-b/) into this tree's
  evidence/2026-11-03/screen-tmp-streakfree-b/: 180 lines, seeds
  83001–83180 in order, screen.log confirming 180 done. No salvaged
  line was overwritten or re-run.
- Screen completed by this adoption: seeds 83181–83200, same
  verbatim gatecover invocation, one node process per seed,
  appended in seed order. Final corpus: 200 lines, seeds
  83001–83200 in order, rows.length == daysAlive on all 200.
  The 20 completion seeds added no collapsers (all survived).

## STAGE 1 — screen (full fresh band 83001–83200, 30d competent)

Screened collapsing 10 (screen classification; loss day / first
starvation day): 83014 (25/24), 83019 (27/25), 83020 (30/28), 83055
(21/19), 83111 (28/26), 83126 (30/20), 83140 (26/24), 83149 (26/24),
83163 (19/18), 83189 (28/23). Screen rate 10/200 = 5% — a band
property, not a rate claim. Survivors 189. Other outcomes 1: 83042
(village-lost day 29, NO starvation death — counts toward neither
judged denominator). Screen cross-check: independent (c) vs reused
(c) matched on all 200 screen lines. Stage-1 GO bar (>= 4) met, so
the run proceeded to Stage 2.

## STAGE 2 — tracer legs (verbatim tracer re-runs, judged corpus only)

Legs: all 10 screened collapsing candidates PLUS the first 16
screened survivors in seed order (83001–83013, 83015–83017 —
83014 is a candidate, so the 16th survivor is 83017). 26 legs,
rows == daysAlive on 26/26, first try, no re-runs needed.

### Still-collapsing rule (prereg, applied verbatim)

- 83126: screen collapsing (lost day 30, first starvation day 20)
  -> tracer SURVIVED 30d (a starvation death on day 20, but the
  village survived — collapsing requires village-lost AND a
  starvation death). EXCLUDED, never counted as a rule failure.
- 83140: screen collapsing (lost day 26, first starvation day 24)
  -> tracer SURVIVED 30d (a starvation death on day 30, village
  survived). EXCLUDED on the same rule.
- Judged collapsing denominator: 8 still-collapsing seeds.

### Survivor-drift rule (prereg, drives the verdict)

- 83013: screen survivor (survived 30d, no starvation death) ->
  tracer village-lost day 28, first starvation day 26. This is
  membership-changing drift: verdict INSUFFICIENT-DATA, seed named,
  no replacement survivor sampled, 83013 does not join the
  collapsing denominator. On the tracer trajectory (v*) fires day 9
  via (F) and (c) fires day 9 — both very early — while (e*) fires
  day 24; that early firing is descriptive only and is NOT judged,
  because the seed is drift-excluded from every leg.

### Judged table — (c) vs (v*) on identical tracer trajectories

lead = first-starvation day − first-firing day. (v*) clause: F =
fallback, E1 = envelope, E2 = cliff. (e*) day shown where (F) fires
earlier than (e*).

| seed | ref (1st starv.) | (c) day/lead | (e*) day/lead | (F) day | (v*) day/clause/lead | tie | strict |
|---|---|---|---|---|---|---|---|
| 83014 | 23 | 19 / 4 | 19 E2 / 4 | 18 | 18 F / 5 | yes | yes |
| 83019 | 25 | 21 / 4 | 20 E1 / 5 | 21 | 20 E1 / 5 | yes | yes |
| 83020 | 28 | 27 / 1 | 27 E2 / 1 | 26 | 26 F / 2 | yes | yes |
| 83055 | 25 | 25 / 0 | 25 E2 / 0 | 25 | 25 E2 / 0 | yes | no |
| 83111 | 26 | 21 / 5 | 20 E1 / 6 | 21 | 20 E1 / 6 | yes | yes |
| 83149 | 24 | 21 / 3 | 21 E2 / 3 | 21 | 21 E2 / 3 | yes | no |
| 83163 | 18 | 15 / 3 | 14 E2 / 4 | 15 | 14 E2 / 4 | yes | yes |
| 83189 | 23 | 20 / 3 | 18 E1 / 5 | 19 | 18 E1 / 5 | yes | yes |

Mean lead (v*) 3.75 days vs mean lead (c) 2.875 days on the 8
still-collapsing seeds (reported with the prereg's warning that
means mislead when coverage differs — here coverage is identical,
8/8 fired under both rules, so the comparison is clean). The
fallback (F) is the first-firing clause on 2 of 8 seeds (83014,
83020); on both it buys exactly one extra day over (e*).
Death-knell firings (lead_v == 0, named even on a GO — here on a
non-GO): 83055 alone, where (v*), (e*), and (c) all fire on the
first-starvation day itself. (c) fires on 3/15 traced survivors
(83001, 83002, 83005); (v*)-vs-(c) survivor overlap is exactly
those 3 — the one extra (v*) survivor firing is 83011, day 30,
the horizon's last evening.

### Cost leg detail (fails independently of the drift verdict)

(v*) fires on 4 of 15 traced survivors: 83001 (day 8, E1), 83002
(day 8, F), 83005 (day 24, E2), 83011 (day 30, E1). 4/15 = 26.7% >
25% bar. With 15 survivors one seed is 6.7 percentage points, so
the bar is coarse at this sample size — but the prereg fixes the
bar, and a miss is NO-GO/INSUFFICIENT-DATA, never re-scored
against a friendlier denominator (§14).

## Substrate finding — screen/tracer divergence is base drift, not flakiness

Tracer-vs-screen byte-equality holds on only 10/26 legs. Membership
(screen classification vs tracer classification) agrees on 23/26;
the 3 disagreements are exactly the two still-collapsing exclusions
(83126, 83140) and the drift seed (83013) — all three handled by
the prereg's rules, never by re-sampling or redefinition. The
cause is identified, not mysterious: the salvaged screen lines
were generated on the dead tree's base (991609dfe), while the
tracer legs ran on current master (77ff4a807), and the two bases
differ in src/js (win-plan.js +715 lines, villager-agency.js
changes). The tracer legs themselves are stable: the determinism
spot-check (first 83014, middle 83111, last 83189 of the
still-collapsing seeds in order) re-ran 3/3 byte-identical, and
rows == daysAlive held on every leg. Judged legs run on the tracer
lines only, per the prereg. A future adoption should either
re-screen on the judging base or pre-register base-drift handling
explicitly — see metric review. This finding does not change the
verdict: the drift rule fires on the tracer corpus as run.

## Sense test (transcripts around variant firing evenings)

Read the firing-evening transcripts on traced collapsing seeds.
At least 2 firing evenings required; 2 examined (83014 day 18,
83163 day 14). Verdict in plain words: on both evenings the
warning would land SILENTLY — nothing in the transcript notices
the store falling. That is expected for a would-fire overlay (no
deploy, no narration exists yet), but it is reported as such
because a future deploy must frame (v*) as the village store's
fall, never as personal hunger, and must actually SAY something
on the firing evening, or the warning is invisible.

Seed 83014, variant fires day 18 via (F) (pantry 11,650 -> 8,854,
streak 0, still 12 alive). Quoted from that evening:

> "You keep a day's food (1080 kcal) — nothing extra for the pantry this time."
> "Ivy leans in, voice low. "Here's what we figured out about Murkcap. Stay out of the sporefall. ..."
> "You work the patch with practiced hands: 12× Muscadine Grapes (1080 kcal). This patch is picked clean — it'll recover in a few days."

The evening reads as an ordinary productive day — garden work, a
monster-counter lesson by the fire. Nobody mentions the store,
which has fallen 24% from its stretch peak. The next evening the
village is down to 10 alive, still with no store-fall line.

Seed 83163, variant fires day 14 via (E2) (pantry 7,243 -> 4,650,
streak 4 — real under-eating by the streak's own definition, 11
alive). Quoted from that evening and the next:

> "The creek runs fast here — no crossing without a bridge or a swim."
> "The creek runs fast here — no crossing without a bridge or a swim."
> "The creek runs fast here — no crossing without a bridge or a swim."
> "You keep a day's food (390 kcal) — nothing extra for the pantry this time." (day 15)
> "You eat Blackberry (390 kcal)." (day 15)

Even on a streak-4 evening, the transcript carries no hunger or
store language at all — it is filled with one obstacle line
repeated verbatim three times in the same evening. That repetition
is flagged separately below as a robotic artifact; for the sense
test it means the firing evening would read as a stuck-at-a-creek
day, not as a village noticing its store collapsing. First
starvation follows 4 days later (day 18).

## Village assessment (plain words)

The village, across 200 fresh villages: almost all of them make
it through the month (189 survive the full 30 days; only 11 are
lost at all). The ones that collapse do so late and by hunger:
their first starvation deaths land on days 18–28, after the store
has been draining for days. On the eight villages that collapse on
both the old screen and the new tracer, the streak-free variant
would have raised its flag about four days before the first
starvation death on average — earlier than the old rule on six of
the eight — and it fires on every single one of them. But that
good news does not survive the verdict rules: one village the
screen called a survivor collapses when re-run on the current
base, which by the pre-written rules makes the whole run
"not enough evidence to judge" rather than a pass; and the flag
also goes up on slightly too many surviving villages (4 of 15,
where the bar allows 3). In short: the shape looks promising on
the collapsing villages, but the evidence base itself shifted
underneath the run (the game changed between the screen and the
re-run), so this run cannot certify it. Nothing here changes the
game — no lever was flipped, no villager behaves differently
today than yesterday.

Villagers acting like people (sampled from the same transcripts):
the fire-side teaching on 83014 (Ivy passing on the Murkcap
counter, gossip chains mutating as they travel) reads as people
talking and teaching. The counterweight is the creek repetition
on 83163 — the identical obstacle line three times in one evening
reads robotic, not like a person encountering a creek. That
observation is appended to the findings backlog (below) rather
than chased mid-run, since it sits outside this arm.

## Reachability verdict

Waves 1–5: screen wave reach is waves 2 (52 seeds) and 3 (148
seeds) only in this 30d window; traced legs reach wave 2 (13) and
wave 3 (13). Waves 4–5 are NOT reached in this window — expected
for a 30d early window, not a claim about the game. Arc II/III/IV,
regional → national, the table, and the win flag are NOT REACHED
IN WINDOW (no fields in this window, reported as such, not as a
rate claim). Vests: not measured by this instrument.

## Wall numbers (traced legs only, 30d limit stated)

Survival: 17/26 legs survived; median days alive 30, max 30.
Wave reach: wave 2 on 13 legs, wave 3 on 13 legs. Traced
collapsing seeds: 8 still-collapsing (2 excluded, 1 drift seed
not counted). National / table / wins: NOT REACHED IN WINDOW
(expected 0 — late-game states with no fields in this window).

## Before/after (identical seeds, identical trajectories)

Before = old rule (c) on tracer trajectories; after = variant
(v*) on the same trajectories. Fire coverage: (c) 8/8, (v*) 8/8
(no coverage gain — the old rule already fired on all eight).
Tie: (v*) ties or beats (c) on 8/8. Strictly earlier: 6/8. Mean
lead: (c) 2.875 days, (v*) 3.75 days (+0.875 days). Survivor
firing: (c) 3/15, (v*) 4/15 — the variant's extra survivor firing
is the day-30 horizon-edge seed 83011. The fallback clause (F)
is what buys the extra day on 83014 and 83020; everywhere else
the variant fires via (e*) itself.

## Balanced panel (§15) — inapplicability declared in the prereg

No balanced-panel compare is fabricated, exactly as the prereg
declares: this arm changes NO game code, runs NO lever, and its
primary metrics are within-trajectory instrument diagnostics
(would-fire overlays on identical evening series), not panel
metrics. The tables above are reported directly, on identical
seeds and identical trajectories.

## Metric review (doubts about this header go here; any revision applies to the NEXT run, never to this one)

1. Base drift between screen and tracer: the prereg assumes the
   screen and tracer run on one base, but an adoption inherits a
   screen from a dead tree's older base. The prereg's
   still-collapsing + drift rules handled the fallout without
   re-scoring, but the run then judges a variant on trajectories
   that no longer match the screen that selected them. A future
   adoption run should either re-screen on the judging base
   (declaring the salvaged screen reference-only) or pre-register
   an explicit base-drift clause. This run does NOT re-screen:
   the prereg forbids adding, dropping, or substituting seeds.
2. Cost-bar granularity: with 15 traced survivors, one seed is
   6.7 points, so the 25% bar (3.75 seeds) turns on a single
   horizon-edge firing (83011, day 30). A future run could
   pre-register a larger survivor sample or a horizon-edge
   convention — but this run judges the bar as written.
3. The drift rule is doing heavy lifting: a single seed's
   trajectory change (83013, caused by the base move, not by the
   variant) voids an otherwise passing set of legs. That is the
   prereg's stated intent (membership change = insufficient
   data), and it is honored here — but it means adoption runs
   are fragile whenever the base moves between screen and tracer.
   The determinism spot-check (3/3 byte-identical on the current
   base) shows the tracer side is stable; the fragility is the
   screen side, which is the adoption's inherited part.
4. Sense-test scope: the transcript lines available to this
   instrument are player-perspective evening lines; villagers'
   own noticing may live in lines this tracer does not capture.
   "Silent evening" here means silent in the captured transcript,
   not proven silent in the full game. A deploy-time sense check
   should read the live evening narration, not just this tracer.

## Corpora and proofs

- Prereg: evidence/2026-11-03/sim-streakfree-b-prereg.md
- Screen corpus (200 lines): evidence/2026-11-03/
  screen-tmp-streakfree-b/screen.jsonl (+ screen.log)
- Tracer corpus (26 lines): evidence/2026-11-03/
  sim-streakfree-adopt-b-tracer.jsonl (+ sim-streakfree-adopt-b-sweep.log)
- Summary: evidence/2026-11-03/sim-streakfree-adopt-b-summary.json
- Determinism re-runs: evidence/2026-11-03/
  sim-streakfree-adopt-b-detcheck.log (3/3 byte-identical)
- Proofs: scripts/test-streakfree-b.js 22/22, scripts/test-gatediseng-b.js
  21/21, scripts/test-gatediseng-confirm-b.js 11/11, adoption proof
  scripts/test-streakfree-adopt-b.js 23/23 (re-derives the verdict
  from the committed tracer corpus + summary).
- No game code, policy, or existing-script change. No demand/gate/
  price change. Nothing pushed, bumped, or live-verified.

## Blanks filled or documented

- Filled: the dead arm's screen is completed (seeds 83181–83200)
  and its Stage 1 + Stage 2 are judged in full — the orphaned arm
  is no longer stranded mid-analysis.
- Documented (not fixed, outside this arm): (a) base drift between
  salvaged screen and current-base tracer (substrate finding
  above); (b) repeated verbatim obstacle line in evening
  transcripts (creek line ×3 on seed 83163) — appended to
  hidden_files/sim-findings.md as an open item; (c) the
  day-30 horizon-edge survivor firing (83011) and its effect on
  the coarse cost bar — noted in metric review for the next run.
