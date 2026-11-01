# sim-gatediseng-confirm-b — PASS: STAND-DOWN + TREND CONFIRMED ON THE COST LEG, WITH A QUIET-BAND CAVEAT

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T2230Z,
arm sim-gatediseng-confirm-b, axis food-economy. Worktree
sim-gatediseng-confirm-b, branch sim-gatediseng-confirm-b.
CONFIRM ONLY: zero src/js changes, zero policy-default flips,
zero edits to any existing script or policy file. New files
only, all named *-gatediseng-confirm-b.*. The gatecover tracer
and the gatediseng analyzer are REUSED VERBATIM, never edited.
This worker does NOT push, bump, verify live, or merge into
master; the coordinator merges.
Status to coordinator: committed on branch
sim-gatediseng-confirm-b, pending coordinator merge.

## Verdict: PASS — judged exactly against the prereg bars

Prereg: evidence/2026-11-01/sim-gatediseng-confirm-b-prereg.md,
commit 6d4aaa6d2d99e2eb6fdd91bf05b8c6316fab1855, written and
committed BEFORE any judged sim (proof test 11/11 ran after
the prereg commit but before any judged application; the
proof test is pure, uses no judged seeds, and changes no
prereg word).

Confirm bar: survivor firing-seed rate <= 25% on the confirm
band, PLUS the in-time check on any collapsing trajectory.
Result:

| leg | result | bar | outcome |
|---|---|---|---|
| Survivor firing-seed rate, band 52201-52212 | 0/12 = 0.0% | <= 25% | PASS |
| In-time check on collapsing trajectories | No collapsing seed on the band (12/12 survived) | Every collapsing seed fires >= 3 evenings before first starvation | VACUOUS — not re-tested on this band |
| Evenings-per-firing-seed | No firing seed, so mean / median / max are undefined (null), reported as such | Reported, not a bar (per prereg) | REPORTED (vacuous) |
| Cross-check: new evenings analyzer vs reused analyzer, first (c) firing | 0 mismatches on 12/12 seeds | Any mismatch = loud failure | PASS |

PASS means, per the prereg: rule (c) is CONFIRMED and the
deploy spec in the prereg is deploy-ready — a future arm may
then make the deploy claim. PASS does NOT itself deploy (c),
does not change any default, and does not re-prove
timeliness: this band contains no collapsing trajectory and
no (c) firing at all, so the in-time leg is NOT re-tested
here (51608's in-time firing, day 15 vs starvation day 21,
stands from gatediseng-b) and the evenings texture is NOT
measured here (there is nothing to count). The confirm that
this band actually delivers is on the COST leg — the leg
that was thin in gatediseng-b (pilot 2/8, exactly at the
bar). On fresh seeds the rule stayed completely quiet on
villages that survived the month. That is a real confirm of
the cost side, and it must not be oversold as a timeliness
re-confirm: a future deploy arm still leans on 51608 alone
for "fires in time on a collapsing village."

## Q — THE CONFIRM BAND, SEED BY SEED (armed, 30d competent)

All 12 seeds verified first try (rows == daysAlive each:
30 x 12). No EPERM-flap retry needed, no seed re-run, no
line duplicated. Cross-check mismatches: none.

| seed | end | wave | (c) first firing | (c) evenings | (c) warnings | disengaged evenings | why (c) stays silent |
|---|---|---|---|---|---|---|---|
| 52201 | survived 30d | 2 | — | 0 | 0 | 0/30 | gate never stands down |
| 52202 | survived 30d | 2 | — | 0 | 0 | 5/30 | stretches rise (23-25) or are a single evening (30) |
| 52203 | survived 30d | 2 | — | 0 | 0 | 2/30 | stretch 11-12, pantry RISING 52,678 -> 59,355 |
| 52204 | survived 30d | 3 | — | 0 | 0 | 0/30 | gate never stands down |
| 52205 | survived 30d | 1 | — | 0 | 0 | 0/30 | gate never stands down |
| 52206 | survived 30d | 2 | — | 0 | 0 | 10/30 | stretch 21-24: 2 falls, then a rise on day 24 — no 3-fall window after S |
| 52207 | survived 30d | 2 | — | 0 | 0 | 0/30 | gate never stands down |
| 52208 | survived 30d | 2 | — | 0 | 0 | 0/30 | gate never stands down |
| 52209 | survived 30d | 2 | — | 0 | 0 | 2/30 | stretch 3-4, pre-day-8 floor, then a rise |
| 52210 | survived 30d | 2 | — | 0 | 0 | 0/30 | gate never stands down |
| 52211 | survived 30d | 2 | — | 0 | 0 | 0/30 | gate never stands down |
| 52212 | survived 30d | 2 | — | 0 | 0 | 7/30 | stretch 14-15: day 15 rises (9,204 -> 9,583) — no falls after S |

Survivor firing-seed rate: 0/12 = 0.0%. Evenings-per-
firing-seed: no firing seeds, so raw mean / median / max
are null (not zero — zero would claim a measured value
over an empty set); warnings-per-firing-seed likewise null.
The new analyzer's first firing agrees with the reused
analyzer on all 12 seeds (both null everywhere).

That the analyzer is alive on this band, not blind, is
shown by the other candidates on the same trajectories
(reused analyzer, reported for texture, NOT judged):
(a) TOTAL-SLIDE fires on 2/12 survivors (52206 day 21,
52212 day 14), (b) HYSTERESIS on 3/12 (52203 day 11, 52206
day 21, 52212 day 14), (d) FLOOR on 2/12 (52206 day 21,
52212 day 14). So the band does contain slide shapes and
low stores — (c) is quieter than its siblings by
construction, not by instrument failure.

WHY (c) IS QUIETER — THE STRUCTURAL DIFFERENCE, MEASURED
ON 52206 AND 52212: (a) and (d) fire on the FIRST
disengaged evening of a slide whose falls happened while
the gate was still engaged; (c) counts only falls AFTER
the stand-down. On 52206 the steep slide happens while
engaged (days 15-21: pantry 15,698 -> 6,250, gate on), and
the stand-down evening itself is day 21 at 6,250; after S
there are only two falls (6,250 -> 4,950 -> 2,500) before
day 24 rises to 4,662, so no 3-fall window after S ever
forms. On 52212 the slide is likewise engaged (days 8-14:
20,436 -> 9,204) and the disengaged stretch is a single
rise. This is (c) working as specified — a disengaged-
state rule, not a slide-shape rule — and it is NOT a
coverage hole for the system as a whole on these seeds:
while the gate was engaged during those slides, the
engaged sensor was live and could candidate them. (c)'s
silence here means "no post-stand-down trend," not "no
slide happened."

## Pooled texture (NOT judged — prereg bars are per-leg, as in gatediseng-b)

Survivor (c) firing rates across every measured band:
corpus 2/27, fresh pilot 2/8, confirm band 0/12 — pooled
4/47 = 8.5%. Pooling is reported so a future reader can
see the arithmetic, not as a second verdict: the prereg
judges the confirm band alone, and the confirm band passes
on its own (0/12).

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table /
wins — those are late-game states, and this sweep carries
no such fields. NO wall movement is claimed. In-window,
confirm band: 12/12 survived 30 days (median 30, max 30);
collapses 0/12; wave reach max 3 (52204 reaches wave 3;
10/12 reach wave 2; 52205 reaches wave 1 only); waves 4-5
not reached in 30 days (expected — early window). Arc
II/III/IV, regional -> national, table, win flag: NOT
REACHED IN WINDOW (0, as expected — not a rate claim).
Deaths across the band: 115 total — villager combat 61,
combat 25, the wild 10, expedition 7, ambush 3, sickness 2,
a wound that wouldn't close 2, starvation 1, Hummice 1,
Choir Toad 1, a stranger 1, the expedition 1. Zero
starvation deaths on 11/12 seeds; the single starvation
death (52203, day 12) sits on a RISING store (see below)
and is not a pantry-collapse death.

## Sense test (SENSE-TESTING LAW: no firing evening exists on this band)

There is no confirm-band firing evening to judge, so the
sense test is necessarily two-part: (i) the nearest
near-miss evenings, judged for whether a (c) line there
would have fit or clashed; (ii) the published 51608
stretch, re-read as the timeliness anchor.

(i) NEAR-MISS 52206, days 20-24 (pantry 8,860 -> 6,250 ->
4,950 -> 2,500 -> 4,662; gate stands down day 21): the
village voice is ALREADY saying the thin-pack lines on
days 20, 21, 22, 24 — "You keep a day's food (360 kcal) —
nothing extra for the pantry this time." (day 20),
"You keep a day's food (570 kcal) — nothing extra for the
pantry this time." (day 21), "You keep a day's food
(180 kcal) — nothing extra for the pantry this time."
(day 22), "You keep a day's food (965 kcal) — nothing
extra for the pantry this time." (day 24). A (c) line on
any of these evenings — the prereg's deploy line, "the
shelves stopped reading full days ago, and the store has
kept falling since. Nothing extra is reaching it." —
would have echoed words the village was already saying,
not contradicted them. (c) does not fire here only
because day 24 rises and breaks the third fall; the voice
fit is not the blocker, the trend shape is.

(ii) 51608, re-read (gatediseng-b sense test stands, not
re-litigated): day 15, the (c) firing evening — "You keep
a day's food (1935 kcal) — nothing extra for the pantry
this time." and "Hunger gnaws. The pack is thin — work
the green, haul it back, get it named at camp. That's the
whole game." Day 21 (first starvation): "Leo starved.
Slowly. Somebody keeps looking at the door, like they're
still going to walk in." The sense judgment is unchanged:
a (c) warning on day 15 reads as the village noticing in
time, in words matching the evenings around it. The
confirm band adds one qualification: on 52206 the same
thin-pack voice speaks during an engaged slide and a
disengaged bounce alike, so the voice alone cannot
distinguish a (c) trend from a bounce — the rule's
3-fall + 10% shape, not the voice, is what must do the
distinguishing, and on this band it distinguished by
staying silent.

## Balanced panel (§15)

No panel compare is fabricated, per the prereg's
inapplicability declaration (same reasoning as
gatediseng-b): this arm changes no game code, runs no
lever, and its primary metrics are within-trajectory
instrument diagnostics (would-fire overlays on identical
evening series), not panel metrics. The tables above are
reported directly, on identical seeds and identical
trajectories.

## Metric review

(1) A 0/12 CONFIRM IS A COST CONFIRM, NOT A TIMELINESS
    RE-CONFIRM — AND THE PREREG KNEW HALF OF THAT. The
    prereg anticipated a vacuous in-time leg (no collapsing
    seed) but did not anticipate zero firings at all: with
    no firing seed, evenings-per-firing-seed is undefined,
    so gatediseng metric review (3) is still open as a
    measurement — a future band that actually fires (c)
    is needed before anyone can quote evenings-per-firing-
    seed for (c). The deploy counting rule (one warning
    per stretch) already caps issued warnings, so the
    missing number is raw condition-evenings texture, not
    a spam risk — but it is missing, and this PASS must
    not be cited as having measured it.
(2) 0/12 DOES NOT PROVE A TRUE RATE OF ZERO. Twelve
    survivors with no firing is consistent with a low but
    nonzero true firing rate; what it rules out, on this
    band, is the pilot-leg worry (a rate at or above the
    bar on fresh seeds). The pooled 4/47 = 8.5% across
    corpus + pilot + confirm is the better cost picture
    to quote, with the per-leg bars kept separate for
    judging.
(3) THE BAND IS GATE-QUIET IN A WAY THAT LIMITS (c)
    EXERCISE: 7/12 seeds never stand down at all, and the
    5 that do stand down do so for 1-5 evenings on rising
    or bouncing stores. A disengaged-state rule can only
    be exercised by disengaged stretches, and this band
    barely supplies them. A future arm that wants a
    stronger confirm should pick its band for
    disengagement exposure (e.g. seeds with long
    disengaged stretches) rather than re-running a blind
    fresh band — but that selection rule belongs to that
    arm's prereg, not to a re-score of this one.
(4) No metric, threshold, seed, leg, or rule definition
    was changed mid-run. Prereg committed (6d4aaa6d)
    before any judged sim; the proof test (11/11) ran
    after the prereg commit and before the judged
    applications, uses no judged seeds, and changes no
    prereg word (two proof-test fixes before any judged
    application touched only the test file: a field-name
    slip and a raw-seed-vs-analysis slip, plus a check
    label corrected to match what it tests); the confirm
    sweep verified rows == daysAlive on all 12 seeds
    first try; the new analyzer's first firing matches
    the reused analyzer on all 12 seeds. The verdict is
    judged only against the prereg header.

## Village assessment (plain words)

Twelve new villages, and the patient rule stayed silent in
all of them — not because the villages were comfortable,
but because the rule only speaks after the gate stands
down AND the store keeps falling, and on this band the
gate mostly never stood down, and when it did the store
bounced or rose instead of falling. One village (52206)
fell hard, from nearly sixteen thousand to twenty-five
hundred, but it fell while the warning switch was still
on, and by the time the switch went quiet the fall had
already broken — the rule's patience, which is its virtue
on the dying village, is also why it says nothing here.
Another village (52203) lost someone to starvation while
its store held nearly sixty thousand — a person starving
amid plenty, which no pantry-trend rule, patient or not,
would catch, because the failure there is not the store
falling. The villages otherwise lived the usual month:
fights and the wild and wounds took people, nobody's
village scattered, one reached wave 3. What this band
proves is narrow and honest: on fresh villages that
survive, the patient rule does not cry out — zero times
in twelve. What it does not prove, again, is that the rule
would speak in time on the next village that dies: that
still rests on the one dying village measured before,
day 15 against day 21. The deploy spec is ready; the
deploy decision still carries that single-village
timeliness evidence, and the next arm that wants stronger
timeliness evidence should go looking for villages that
actually stand down and fall, not just fresh villages.

## Findings for the coordinator (to append to the backlog)

- (c) STAND-DOWN + TREND CONFIRMED on the cost leg
  (confirm band 52201-52212: 0/12 survivor firings, PASS
  per prereg), deploy spec landed in the prereg
  (sensor-path branch, one warning per stretch, warning
  stands regardless of later re-engagement with NO
  engaged-D+5 requirement, pantry-only 10-evening
  recovery scoring, voice line as preregged). A future
  arm may now make the deploy claim; this arm deploys
  nothing.
- Evenings-per-firing-seed STILL UNMEASURED for (c)
  (gatediseng metric review 3, carried forward): the
  confirm band fired zero times, so raw evenings and
  warnings-per-seed are null, not measured. A future
  band that actually fires (c) — ideally selected for
  disengagement exposure — is needed before quoting
  evenings texture.
- Timeliness re-confirm STILL OWED: the confirm band had
  zero collapsing seeds, so the in-time leg was vacuous
  and 51608 remains the sole in-time evidence (day 15 vs
  starvation day 21).
- Observation (not a (c) miss): seed 52203 loses one
  person to starvation on day 12 while the pantry RISES
  52,678 -> 59,355 and the gate stands down on freshDays
  2.19 (burn-rate denominator, not store level) — a
  starvation-amid-plenty shape that no pantry-trend rule
  would catch. Filed for the coordinator, not chased
  mid-run.

## Infrastructure notes (for the coordinator)

- PREREG-COMMIT INDEX CLOBBER (same known class): after
  commit 6d4aaa6d the main index showed the committed
  prereg as a staged deletion alongside the worktree copy.
  Repaired via git update-index --add --cacheinfo from
  the HEAD blob, then verified tracked status clean and
  worktree hash matches HEAD. The commit itself was
  correct throughout.
- FULL `git status` (with untracked scan) STALLS on this
  worktree (as in gatediseng-b); the tracked-only
  `git status --porcelain --untracked-files=no` returns
  in ~1s and was used for all verification.
- CONFIRM SWEEP CLEAN, FIRST TRY EVERY SEED: all 12
  confirm seeds verified on first try (rows == daysAlive
  each: 30 x 12); no EPERM-flap retry was needed, no seed
  was re-run, no line was duplicated.
- FRESHNESS VERIFICATION: seed-field scan (exact
  "seed":52201-52212 fields, both spellings) over all of
  evidence/*.jsonl and *.json, plus whole-word .md grep
  over all of evidence/ — both clean before the prereg
  was written. Confirm seeds 52201-52212 are now consumed
  by this run.
- check.js --quick NOT re-run: zero src/js, zero green-list
  files on this arm; nothing here touches the runtime.

## Files

- Prereg: evidence/2026-11-01/sim-gatediseng-confirm-b-prereg.md
  (commit 6d4aaa6d2d99e2eb6fdd91bf05b8c6316fab1855, before
  any judged sim)
- Evenings analyzer: scripts/analyze-gatediseng-confirm-b.js
  (new: all (c) evenings + one-per-stretch warnings +
  cross-check against the reused analyzer + prereg verdict)
- Proof test: scripts/test-gatediseng-confirm-b.js (11 pure
  checks, no judged seeds)
- Evidence: evidence/2026-11-01/sim-gatediseng-confirm-b.md (this file)
- Corpora: evidence/2026-11-01/sim-gatediseng-confirm-b-armed.jsonl
  (12 lines, seeds 52201-52212, armed only, gatecover tracer
  verbatim),
  evidence/2026-11-01/sim-gatediseng-confirm-b-summary.json
  (confirm analysis + verdict),
  evidence/2026-11-01/sim-gatediseng-confirm-b-gatediseng-summary.json
  (reused-analyzer summary, all four candidates),
  evidence/2026-11-01/sim-gatediseng-confirm-b-sweep.log
  (per-seed tracer stderr)
- Reused verbatim, never edited: scripts/trace-gatecover-b.js,
  scripts/analyze-gatediseng-b.js, scripts/policies/competent.js
- Consumed by this run (no longer fresh): confirm 52201-52212
