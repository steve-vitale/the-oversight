# sim-dipslide-confirm-b — FRESH-SEED CONFIRM: DIP-VS-SLIDE SENSOR

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1430Z, arm
sim-dipslide-confirm-b, axis food-economy. Worktree
sim-dipslide-confirm-b, branch sim-dipslide-confirm-b.
Fresh-seed confirm of the dip-vs-slide sensor whose pilot GO was judged
in run 1346Z (evidence/2026-11-01/sim-dipslide-b.md). DIAG ONLY: zero
src/js changes, zero policy-default flips, zero edits to any existing
script or policy file. New files only, all named
*-dipslide-confirm-b.*: prereg, confirm analyzer, proof test, evidence,
corpus. The depositgate driver and the dipslide analyzer are REUSED
VERBATIM, never edited. This worker does NOT push, bump, verify live,
or merge into master; the coordinator merges.
Status to coordinator: committed on branch sim-dipslide-confirm-b,
pending coordinator merge.

## Verdict: NO-GO — judged exactly against the prereg bars

Prereg: evidence/2026-11-01/sim-dipslide-confirm-b-prereg.md, commit
05699b993, written BEFORE any judged sweep (the confirm analyzer and
proof test were written after the prereg; the sweep ran only after the
prereg commit). The sensor rule was tested EXACTLY as specified in
sim-dipslide-b.md — trend condition unchanged (>= 20% fall over 5
evenings AND 3 evenings running AND level rule engaged), PLUS
early-window exclusion (loopDay < 8 ignored), PLUS 5-evening recovery
confirmation (candidate D confirms only if P(D+5) < P(D) inside the
same final engaged run; actionable day = D+5). Final-engaged-run
counting only. No re-tuning was done before or during judging.

(c) FALSE-FIRE RATE: FAIL. 4 of 12 surviving confirm seeds have a
    confirmed fire in their final engaged run (51204, 51207, 51210,
    51211) — 33.3% against a cap of 25% (at most 3 of 12). The cap is
    missed by exactly one seed.
(d) COLLAPSE EARLINESS: UNJUDGED. Zero confirm seeds collapse (12/12
    survived, all 30 days), so there is no collapsed seed on which
    earliness could be judged. Reported as UNJUDGED, not passed.
GO requires (c) PASS and (d) PASS-or-UNJUDGED. (c) fails, so the
verdict is NO-GO regardless of (d). This is a miss against the
pre-registered header, not a re-score: no friendlier metric was
substituted mid-run. The pilot GO does not survive contact with
fresh seeds — the pilot's 1-of-7 false rate was optimistic, exactly
as the pilot's metric review warned it would be.

## Per-seed fire table (confirm sweep, armed only, 30d competent window)

cand = candidate day (first confirming candidate), conf = confirmedDay
(actionable day), levelSD = level stand-down evening (null = seed ends
engaged), false = survived seed with a confirmed fire in its final run.
eligInRun = eligible candidate days (loopDay >= 8) inside the final run.
confAny = confirmed day anywhere in the window (descriptive only —
the bars use the final run).

| seed | end | days | cand | conf | levelSD | earliness | false | eligInRun | confAny | final run | wave |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 51201 | survived | 30 | — | — | — | — | no | — | — | 1–30 | 2 |
| 51202 | survived | 30 | — | — | — | — | no | — | 13 | 25–30 | 1 |
| 51203 | survived | 30 | — | — | — | — | no | — | 16 | 25–29 | 2 |
| 51204 | survived | 30 | 25 | 30 | — | — | YES | 25,26,27,28,29 | 30 | 1–30 | 2 |
| 51205 | survived | 30 | — | — | — | — | no | — | — | 16–30 | 1 |
| 51206 | survived | 30 | — | — | — | — | no | — | — | 1–30 | 2 |
| 51207 | survived | 30 | 18 | 23 | — | — | YES | 18 | 23 | 1–30 | 3 |
| 51208 | survived | 30 | — | — | — | — | no | — | 13 | 19–30 | 2 |
| 51209 | survived | 30 | — | — | — | — | no | — | — | 1–30 | 2 |
| 51210 | survived | 30 | 8 | 13 | — | — | YES | 8,9,10,14,26 | 13 | 8–30 | 1 |
| 51211 | survived | 30 | 21 | 26 | — | — | YES | 21,22 | 26 | 1–30 | 1 |
| 51212 | survived | 30 | — | — | — | — | no | — | — | 1–30 | 2 |

Census validity: all 12 seeds valid (rows == daysAlive, gateEngaged
boolean on every row, zero null pantry rows). No seed was excluded.
No seed lacked a final engaged run, so the no-run counting branch was
not exercised on this corpus either (it is covered by unit checks in
both proof tests). Every seed ran first try — no EPERM-flap retries
were needed in this sweep (contrast the depositgate confirm's
per-seed retry loop; the loop was in place and unused).

## What the four false fires look like (the NO-GO, seed by seed)

- 51210 — THE PILOT'S RESIDUAL RISK, REPRODUCED ON A FRESH SEED.
  Candidate day 8, confirmed day 13 — the same day-8 shape as pilot
  51103. Pantry: 38,290 (day 1) → 26,950 (day 3) → 17,700 (day 8) →
  11,650 (day 13) → 10,000 (day 14), then a slow grind at 8–11k that
  still survives all 30 days. The early-window exclusion cannot
  filter this: day 8 IS the first eligible evening, and on this seed
  the settling slide crosses day 8 and keeps going. The exclusion
  kills signals strictly inside days 1–7; it does nothing about a
  settling slide that is still falling on day 8. This is the pilot's
  51103 shape with a fresh seed number, and it is the single most
  important confirm finding: the residual risk was not a one-off.
- 51211 — A LEVEL SHIFT, NOT A SLIDE. Candidate day 21, confirmed
  day 26 — and the confirmation passes by only 339 kcal (P(26) =
  24,250 vs P(21) = 24,589). Pantry: 32,610 (day 17) → 24,589 (day 21)
  → flat ~24k through day 30. The village steps down to a lower
  stable level and stays there; it never recovers to the candidate
  level within five evenings, so the recovery test confirms. The
  sensor cannot tell a step-down to a new stable level from a slide:
  P(D+5) < P(D) is satisfied by a flatline a hair below the signal.
  A stand-down here would act on a village holding steady at 24k
  with ~11 days of fresh — cautious, but on a village in no trouble.
- 51207 — A SLOW DRIFT ON A HEALTHY PANTRY. Candidate day 18
  (17,452), confirmed day 23 (15,689); the pantry drifts 25,269 (day
  12) → 15,689 (day 23) → ~12.3k (day 25) and the village survives
  and reaches wave 3 — the only wave-3 seed in the band. The
  decline is real but slow and survivable; nothing about the
  trajectory says collapse. The sensor fires on any sustained
  20%-over-5-evenings decline that fails to bounce, and competent
  villages decline like this routinely.
- 51204 — A WINDOW-EDGE FIRE. Candidate day 25, confirmed day 30 —
  the last evening of the window. Pantry: 33,288 (day 21) → 24,850
  (day 25) → 18,800 (day 30), a genuine late slide. Under the strict
  rule it counts false (survived + confirmed in the final run), but
  the window ends the day it confirms: no action window remains
  in-window, and a longer window might have shown recovery or
  collapse. This one is the weakest of the four as evidence against
  the sensor — it is counted, per the prereg, and disclosed here as
  a window-edge case, not hidden. Stated plainly: the miss is by
  exactly one seed, and this window-edge seed is the one that would
  flip it — striking 51204 would give 3/12 = 25%, exactly at the
  "at most 25%" cap, which passes. That arithmetic is disclosed, not
  acted on: striking a seed after seeing the numbers would be a
  post-hoc re-score, which §14 forbids. The verdict as judged counts
  all four. A FUTURE prereg could pre-register a window-edge rule
  (e.g. confirmations landing on the final evening do not count, or
  a longer window) and judge a fresh band under it — that is a next
  design's decision, not this run's revision.

Counted anywhere, the false count is 7 (51202, 51203, 51204, 51207,
51208, 51210, 51211) against 4 in the final run. The final-run
counting rule is still doing heavy lifting: without it the rate
would be 58%, not 33%. But unlike the pilot, the final-run rule does
not save the bar this time — the sensor fires in final runs on
fresh seeds at more than the allowed rate.

## Sense test (SENSE-TESTING LAW: read, don't just count)

On every false fire, the villagers' voice at the confirmation evening
still says the shelves are full — the same level-vs-stock gap the
depositgate arm diagnosed, now working against the sensor instead of
for it:

- 51210, day 13 (confirmed): "Sumarno checks the pantry before
  heading out — the shelves are full, ~5 days of fresh on hand…"
  while the total store has fallen from 38,290 to 11,650. A stand-down
  here would read to a player as the village finally noticing the
  slide — sensible, and the same reading the pilot gave 51101. The
  problem is not the voice; it is that the village then survives
  anyway on 8–11k. The sensor's action would look wise on day 13
  and unnecessary by day 30.
- 51211, day 26 (confirmed): "Haruna checks the pantry before
  heading out — the shelves are full, ~11 days of fresh on hand…"
  while the store sits at 24,250 — flat for five evenings, not
  falling. A stand-down here would read oddly: nothing in the voice
  or the trajectory says trouble, because there is none. This is
  the clearest crying-wolf case in the band.
- 51207, day 23 (confirmed): "Daniyar checks the pantry before
  heading out — the shelves are full, ~7 days of fresh on hand…"
  The fresh slice genuinely looks healthy while the whole store
  drifts down — sensible voice, survivable drift, wrong alarm.
- 51204, day 30 (confirmed): "Nabil checks the pantry before
  heading out — the shelves are full, ~11 days of fresh on hand…"
  on the window's last evening. The voice is calm because the fresh
  slice is fine; the sensor acts on a slide the player cannot see
  in the voice at all.

The honest sense summary: the sensor's fires are legible as
caution, not panic — a player would understand why the village
stood down on 51210 and 51207 — but on 51211 the action would look
unmotivated, and on all four the village survives regardless. The
voice gives the player no way to tell a real slide from these, which
is the same gap that made the level rule fire through 51101's slide
in the first place. A sensor the player cannot hear is a sensor the
player cannot trust, even when it is right.

The known "pot stays full" prose line did NOT reproduce in this band
(no potLine on any of the 12 seeds) — expected, since no seed
starved: all 12 survived with no starvation nights. Recorded only,
not re-litigated.

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table / wins — those
are late-game states, and this sweep carries no such fields. NO wall
movement is claimed. In-window: wave reach max 3 (51207 only; the
rest wave 1–2: wave 2 on 7/12 seeds, wave 1 on 4/12); waves 4–5 not
reached in 30 days (expected — early window). Median survival 30
days (max 30); collapses 0/12. Arc II/III/IV, regional → national,
table, win flag: not reachable in this window, not measured, not
claimed. Note the contrast with the pilot band (1 collapse in 8):
this band's zero collapses is itself a finding about the window —
a 30d competent window collapses rarely (combined pilot + confirm:
1 collapse in 20 seeds), so earliness remains measured on n=1
(51101) across the whole program and (d) will keep coming back
UNJUDGED on bands like this one.

## Balanced panel (§15)

No panel compare is fabricated, per the prereg's inapplicability
declaration (same reasoning as the pilot): this arm changes no game
code, runs no lever, and its primary metric is a within-trajectory
instrument comparison (dip/slide sensor vs level rule on identical
evening pantry series), not a panel metric. The level-vs-sensor
table above is reported directly, on identical seeds and identical
trajectories.

## Metric review

(1) THE CAP WAS MISSED BY ONE SEED — AND THE MISS IS REAL, NOT A
    ROUNDING ARTIFACT. 4/12 = 33.3% vs a 25% cap. The window-edge
    seed (51204) is disclosed above: striking it post hoc would give
    3/12 = 25%, exactly at the cap, which would pass — and that is
    precisely why it is NOT struck. A cap or a counting rule that is
    re-drawn after seeing 4/12 is exactly the drift §14 forbids. If
    a NEXT design wants a different cap or a window-edge exclusion,
    it must pre-register it before seeing its own numbers.
(2) THE RECOVERY TEST'S BLIND SPOT IS NOW NAMED: P(D+5) < P(D)
    confirms both slides and step-downs to a stable level (51211:
    confirms by 339 kcal on a flatline). A NEXT design — not this
    run's numbers — could test a stricter confirmation, e.g.
    requiring the pantry to still be falling at D+5, or requiring
    P(D+5) below a floor as well as below P(D). That revision belongs
    in a next prereg, judged on fresh seeds, not retrofitted here.
    Note the pilot's own warning that no longer window fixes 51103
    applies here too: 51211's flatline would confirm at any window
    length, since it never recovers to the candidate level at all.
(3) THE EARLY-WINDOW EXCLUSION'S LIMIT IS NOW MEASURED: it filters
    signals on days 1–7 only. A settling slide that is still falling
    on day 8 (51210) fires anyway. A NEXT design could consider a
    longer exclusion or a level-aware eligibility (e.g. no
    eligibility until the pantry has stabilized for N evenings),
    but that is a new design with its own pilot, not a patch to
    this verdict.
(4) EARLINESS IS STILL n=1, AND (d) WILL KEEP RETURNING UNJUDGED:
    0 collapses in 12 fresh seeds (combined 1 in 20 with the pilot).
    A future confirm that wants (d) judged needs either a longer
    window, a harder policy, or a band seeded to collapse — each a
    design choice for a next prereg, with its own selection-bias
    caveat if seeds are chosen because they collapse.
(5) FINAL-RUN COUNTING IS STILL LOAD-BEARING, AND STILL NOT
    ENOUGH: anywhere 7 vs final-run 4. The counting rule held the
    pilot's bar and softened this band's miss, but it cannot fix a
    sensor that fires in final runs on surviving villages at 33%.
(6) No metric, threshold, seed, or leg definition was changed
    mid-run. Prereg committed (05699b993) before the analyzer ran on
    any judged trajectory; the sweep ran only after the prereg
    commit; the verdict is judged only against its header.

## Village assessment (plain words)

Twelve fresh villages, and every single one survives the month —
which is itself the story. The sensor was built to catch the one
village in eight that slides into collapse, and on fresh villages it
mostly catches villages that are doing fine: one that steps down to
a lower but stable pantry and stays there, one that drifts slowly
downward while reaching wave 3, one whose slide is still the
first-week settling wearing a day-8 date, and one that slides on the
very last evening of the window. The villages that thrive do not
look alarmed — their people keep saying the shelves are full, and on
51211 they are right to sound calm, because nothing is wrong. The
sensor hears a falling total store and calls it danger; the villages
hear full fresh shelves and carry on, and they are the ones who turn
out right. What is missing is not a cleverer slope but a sensor that
knows the difference between a village getting poorer and a village
in trouble — between a step down to a new normal and a slide into
the dark. Until a design can tell those apart, standing the gate
down on its say-so would trade one kind of over-eating (the level
rule firing through a slide) for another (standing down on villages
that would have been fine).

## Findings for backlog (for the coordinator to append)

None from this arm beyond this verdict itself. The 51211 step-down
shape and the day-8 settling crossover are this arm's metric review
(above), not new backlog items; the "pot stays full" line was already
filed by the depositgate arm and did NOT reproduce here.

## Infrastructure notes (for the coordinator)

- The safe-commit index-clobber class hit the prereg commit again:
  after commit 05699b993 the main index showed the prereg file as a
  staged deletion alongside its untracked copy. Repaired the same
  way as the pilot arm (git update-index --add --cacheinfo from the
  HEAD blob 7cd89cbeb4e41f7b054b62a77705d12837536c4e), then verified
  git status --short clean and the worktree hash matches HEAD. The
  commit itself was correct throughout.
- No EPERM-flap impact on the judged sweep: all 12 seeds completed
  first try with 1-valid-JSON-line verification each. The per-seed
  retry loop (up to 6 tries) was in place and unused.

## Files

- Prereg: evidence/2026-11-01/sim-dipslide-confirm-b-prereg.md
  (commit 05699b993, before any judged sweep)
- Confirm analyzer: scripts/analyze-dipslide-confirm-b.js (imports
  the committed scripts/analyze-dipslide-b.js analyzeSeed verbatim;
  adds only the confirm bars)
- Proof test: scripts/test-dipslide-confirm-b.js (17 pure checks;
  --live: 7 replay checks including determinism, seed-band identity,
  and independent confirmedDay recomputation on all 12 seeds —
  24/24 total)
- Evidence: evidence/2026-11-01/sim-dipslide-confirm-b.md (this file)
- Corpus: evidence/2026-11-01/sim-dipslide-confirm-b-armed.jsonl
  (12 lines, seeds 51201–51212, armed only),
  evidence/2026-11-01/sim-dipslide-confirm-b-corpus/
  sim-dipslide-confirm-b-summary.json (full per-seed dip/slide
  analysis, pantry series, and sense lines for the 12-seed confirm)
- Reused verbatim, never edited: scripts/depositgate-b-driver.js,
  scripts/analyze-dipslide-b.js, scripts/policies/competent.js
