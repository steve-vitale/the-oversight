# sim-shelling-b — REAL shelling habit: pilot GO + confirm GO

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1430Z,
axis food-economy, arm sim-shelling-b. Worktree sim-shelling-b,
branch sim-shelling-b. Turns the packcomp arithmetic counterfactual
into a REAL run: packcomp proved shelling alone flips 51107 (32
acorns, best shelled pack 3,616 kcal, 10 returns over 2,000) and
fails 51103/51104/51108 on haul SIZE (best combined packs 1,200 /
1,200 / 565). This arm tests ONLY the shelling habit, on FRESH
seeds, with tick costs actually charged. Zero src/js changes, zero
edits to any existing policy or script. New files only, all named
*-shelling-b.*. This worker does NOT push, bump, verify live, or
merge into master; the coordinator merges. Status to coordinator:
committed on branch, pending coordinator merge.

## Verdict: GO (pilot) and GO (confirm) — judged exactly against the prereg bars

Prereg: evidence/2026-11-01/sim-shelling-b-prereg.md, commit
2e669747c, written and committed BEFORE any judged sim (the
51107 positive control and both judged bands ran after it).

PILOT (51401-51408, 8 seeds, baseline + armed, identical seeds):
(i) firing 24/24 armed eligible returns = 100% (>= 80% required);
(ii) band unload armed 140,955 kcal > baseline 48,045 kcal;
(iii) 4 shelling-attributed flip seeds (51401, 51402, 51404,
51408: baseline unload 0, armed unload > 0, with an armed
unloading return whose entry finished pack was <= 2,000 and
whose shelled net was > 0). All three prongs pass: PILOT GO.

CONFIRM (51411-51422, 12 fresh seeds, baseline + armed):
(a) shelling-shaped unload rate armed 35/35 = 100% (>= 80% and
>= 30pp above baseline's 0% — baseline is 0% by construction
on eligible returns, as the prereg states);
(b) cost guardrail: median survival armed 30 days = baseline
30 days (>= 0.8x), scholar starvation deaths armed 0 <=
baseline 0 + 2;
(c) tick accounting: 100 lots shelled, 400 ticks charged,
4 x lots exactly, verified per event (see Tick accounting).
All three prongs pass: CONFIRM GO.

## The habit (policy-side, prereg-fixed before any sim)

On every returnToVillage call in the armed leg, BEFORE the
original runs (before the haul block splits keep/give and
before unprocessed lots are staged to the counter), the scholar
shells EACH in-shell nut lot in the pack individually via
Game.shellNuts(idx) — one engine call per lot, so the engine
charges 4 ticks PER LOT, never one flat call for the batch.
Guards, all recorded: scholar alive, no combat, no active
contest, day-budget guard (dayTicks + 4 x lots < 512, else
skip 'late-day' — tickAction at the day edge would trigger
endDay BEFORE the haul block). Baseline leg: identical driver,
wrapper OFF.

WHY PACK, NOT COUNTER (prereg decision, stated before sims):
the haul block inside returnToVillage is the ONLY path by
which a return unloads. Lots staged to the counter cannot
unload that return, and counter-shell + putAwayFinished is a
pantry deposit, not an unload — already tried as shellcounter
(killed). A habit judged on unload MUST shell the pack before
the haul block. The brief's "at camp / on return" is
operationalized as the return arrival at camp, immediately
before the haul split; "camp evenings" are the live returns
themselves. Counter-shelling is out of scope for this arm.

## Pilot census (30d competent, DEPOSITGATE=0, keep 2,000)

live = returnToVillage calls with Game.over false at entry
(depositkeep rule). elig = shelling-shaped returns (finished
<= 2,000 AND finished + shelledNet > 2,000, at entry).
fired/unloaded = armed eligible returns where the habit fired /
where unload > 0. haulSize = seed whose max combined over all
live returns is < 2,000 (descriptive only, never a denominator).

| seed | baseUnload | armedUnload | baseElig | armedElig | firedElig | unloadedElig | lots | ticks | haulSize |
|---|---|---|---|---|---|---|---|---|---|
| 51401 | 0 | 13902 | 7 | 6 | 6 | 6 | 16 | 64 | no |
| 51402 | 0 | 47580 | 5 | 8 | 8 | 8 | 19 | 76 | no |
| 51403 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 4 | YES |
| 51404 | 0 | 11720 | 5 | 4 | 4 | 4 | 9 | 36 | no |
| 51405 | 31140 | 43875 | 4 | 1 | 1 | 1 | 8 | 32 | no |
| 51406 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | YES |
| 51407 | 16905 | 16905 | 0 | 0 | 0 | 0 | 0 | 0 | no |
| 51408 | 0 | 6973 | 7 | 5 | 5 | 5 | 16 | 64 | no |
| BAND | 48045 | 140955 | 28 | 24 | 24 | 24 | 69 | 276 | 2 seeds |

Pilot notes: 51407 is the untouched twin — 0 lots, 0 eligible,
unload identical both legs (16,905), so its trajectory never
diverged: the habit changes nothing where there are no nuts to
shell, exactly as it should. 51403/51406 are haul-size-shaped
(max combined < 2,000): the habit cannot flip them, and they
are NOT counted against it (the separate-bars rule from
packcomp's metric review, applied as pre-registered).

## Confirm census (30d competent, DEPOSITGATE=0, keep 2,000)

| seed | baseUnload | armedUnload | baseElig | armedElig | firedElig | unloadedElig | lots | ticks | haulSize |
|---|---|---|---|---|---|---|---|---|---|
| 51411 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | YES |
| 51412 | 0 | 16710 | 2 | 7 | 7 | 7 | 8 | 32 | no |
| 51413 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | YES |
| 51414 | 18230 | 18230 | 0 | 0 | 0 | 0 | 0 | 0 | no |
| 51415 | 24180 | 1375 | 0 | 0 | 0 | 0 | 2 | 8 | no |
| 51416 | 0 | 11833 | 9 | 8 | 8 | 8 | 19 | 76 | no |
| 51417 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | YES |
| 51418 | 0 | 565 | 6 | 1 | 1 | 1 | 12 | 48 | no |
| 51419 | 0 | 2184 | 2 | 3 | 3 | 3 | 15 | 60 | no |
| 51420 | 14950 | 2090 | 2 | 1 | 1 | 1 | 6 | 24 | no |
| 51421 | 0 | 27118 | 7 | 10 | 10 | 10 | 22 | 88 | no |
| 51422 | 0 | 6481 | 7 | 5 | 5 | 5 | 16 | 64 | no |
| BAND | 57360 | 86586 | 35 | 35 | 35 | 35 | 100 | 400 | 3 seeds |

Confirm flip seeds (baseline 0 -> armed > 0, shelling-
attributed): 51412, 51416, 51418, 51419, 51421, 51422 — six.
51414 is a second untouched twin (18,230 both legs, 0 lots).

## The honest limit: armed unloads LESS on two confirm seeds

51415 (baseline 24,180 -> armed 1,375) and 51420 (14,950 ->
2,090) run AGAINST the band direction. Both had ZERO (51415)
or ONE (51420) armed eligible return: their baseline unload
came from finished-food returns, not shelling-shaped ones,
and once the armed trajectory diverges (shelled nuts eaten
earlier, different forage days), those finished-food returns
do not recur identically. The habit is decisive exactly
where packcomp predicted — on shelling-shaped returns, 59/59
across both bands fired and unloaded — and neutral-to-noisy
elsewhere. It is NOT a universal unload increase, and the
band totals (pilot 2.9x, confirm 1.5x) must not be quoted
without this seed-level split. A landing case for this habit
should be written as "shelling-shaped returns unload", not
as "villages unload more food in general."

## Tick accounting (verified, not assumed)

- Pilot: 69 lots, 276 ticks. Confirm: 100 lots, 400 ticks.
  4 x lots exactly in both bands.
- Per-event verification on ALL judged fired events (pilot
  54, confirm 69): every event's dayTicks delta equals
  4 x its lots AND every per-lot tick delta equals exactly
  4. Zero bad-tick events. The engine charges what the
  prereg says it charges, lot by lot.
- Skip reasons (armed legs only): the ONLY skip reason in
  either band is 'no-in-shell-lots' (pilot 165, confirm
  270 returns). The late-day guard NEVER fired (0 skips),
  combat/contest skips 0, game-over skips 0. Returns happen
  with day budget to spare for shelling — the guard is a
  safety net that the data never needed, not a leak.
- Pantry-cap-blocked eligible returns: 0 in both bands.
  Gate-engaged reads: false on every judged return (0
  exceptions) — the substrate is what the prereg says.
- Donations: 0 kcal on both legs, both bands (depositkeep's
  gate-off pre-emption reproduces: unload takes the surplus
  first, donateHaul finds nothing over its keep).

## Guardrails and wall numbers (in-window only)

- Survival: 20/20 seeds survived 30 days in both bands,
  both legs (median 30 vs 30). No collapses anywhere.
- Scholar starvation deaths: pilot baseline 2, armed 0;
  confirm baseline 0, armed 0. The guardrail passes with
  margin in both bands; the pilot's 2 -> 0 is descriptive
  (n=2, not a starvation claim).
- Wave reach in-window: pilot baseline wave 2 on 8/8,
  armed wave 2 on 6/8 (51401/51402 armed wave 1 — both
  survived 30 days; wave unlock in a 30d window is noisy
  and NOT a judged metric); confirm baseline wave 2 on
  7/12, armed wave 2 on 9/12. Waves 3-5 not reached in
  30 days (expected — early window).
- National 0, table 0, wins 0 IN THIS WINDOW ONLY — not a
  wall movement claim. A 30d pre-seat window cannot measure
  national / table / wins, and none is claimed.

## Sense test (SENSE-TESTING LAW: read, don't just count)

Confirm seed 51421, day 19 — the band's best shelling-
attributed return (full extract:
evidence/2026-11-01/sim-shelling-b-corpus/51421-day19-return.txt):

- Forage: "You work the patch with practiced hands: 12x
  Muscadine Grapes, 15x Hickory Nuts, 12x White Oak Acorns
  (1080 kcal). This patch is picked clean."
- Travel home, then TWO shell lines, one per lot, each
  naming its own 4 ticks: "You crack and pick 1 lot of
  nuts. Shells everywhere — the net is less than the gross
  looked. (4 ticks)" — twice, for the hickory and the
  acorns separately.
- Then the census-exact split: "You keep a day's food
  (1980 kcal) and unload 3456 kcal into Haven's pantry."
  (Entry pack: finished 1,830 + shelled 3,606 = 5,436;
  kept 1,980, unloaded 3,456 — stack-split granularity
  around the 2,000 keep, as depositkeep documented.)
- Then the welcome: "You walk back into Haven. 17 Codex
  entries. The village is glad to see you." Pantry
  26,893 -> 30,349 (+3,456, exact).

This reads as a person shelling on the way home — forage,
walk, crack, pool, welcome, in that order, with numbers
that match the ledger exactly. The per-lot narration is
the honest cost made visible: two lots, two shell lines,
8 ticks, not a silent conversion. Pilot corpus
(51402, day 18, unload 2,250) reads the same way.

## Proof tests

scripts/test-shelling-b.js: 16 pure checks green (pack
census, shelled-net formula, eligibility boundaries
including finished exactly 2,000, haul-size shape 8
hickory = 1,200, per-lot tick charging, late-day guard
boundary 507+4 fires / 508+4 skips, no-lots / game-over /
combat guards). Live legs, each in its own process:
--live-control on NON-JUDGED 51107 (armed): 29 live
returns, 17 firings, unload 4,152 (baseline 51107 gate-off
unload was 0), 8 shelling-attributed unloads, every fired
event charging exactly 4 ticks/lot — the packcomp 51107
shape reproduces as a real habit. --live-det: armed 51107
twice, return counts + unload totals + firings byte-
identical. Total: 18/18 with control, 17/17 with determinism.

## Balanced panel (§15)

No panel compare is fabricated, per the prereg's
applicability declaration: the panel's standardized
observer/scorecard/cohort rows and registry policies cannot
express this driver-wrapped return-level census (same
standing as depositkeep/packcomp/dipslide). The paired
before/after tables above, on identical seeds, ARE the
comparison.

## Caveats and attribution limits (honest, per prereg)

- GATE-OFF ≠ KEEP-ONLY, inherited from depositkeep: the
  unload result is attributable to the keep arithmetic plus
  shelling (the haul block is the only pooling path), but
  survival/wave/pack sizes are whole-gate effects.
- PAIRED SEEDS, DIVERGING TRAJECTORIES: "identical seeds"
  means identical seed numbers and identical starting
  state, not identical day-by-day trajectories — the first
  shelling changes what the scholar eats and forages next.
  Return-level eligibility is therefore computed WITHIN
  each leg (armed eligible returns vs baseline eligible
  returns), and the flip test is seed-level with an
  attribution condition, not a return-matched pair. The
  51415/51420 drops are the visible price of that honesty.
- SINGLE policy (competent), 30-day early window only.
  Later windows, other policies, and gate-ON play may
  shape differently — in particular, gate-on keeps (6,000)
  would need far bigger shelled packs to flip, and this
  arm says nothing about them.
- Acorn tannin risk travels with shelled acorns (engine:
  diseaseRisk acornRaw preserved on shelling). The
  guardrail counts starvation deaths only; a disease
  effect of eating shelled acorns raw would appear in
  sickness deaths (pilot armed 3 vs baseline 2, confirm
  armed 0 vs baseline 1 — no signal at this n, reported
  for the record, not claimed).

## Metric review (for the NEXT run; this run judged against its header)

- SEPARATE BARS WORKED: judging firing/unload ONLY on
  eligible (shelling-shaped) returns, with haul-size-shaped
  seeds reported descriptively, is what lets this verdict
  be GO where packcomp's blended bar was NO-GO on the
  same underlying fact. The next lever on this axis
  (forage volume for the haul-size shape) should keep the
  same discipline: its bar must be judged on haul-size-
  shaped seeds, not blended with shelling-shaped ones.
- BAND TOTALS ARE THE WRONG HEADLINE: armed unload totals
  exceed baseline in both bands, but two confirm seeds run
  the other way for trajectory-divergence reasons. Future
  reports of this habit should lead with the eligible-
  return rate (59/59 fired-and-unloaded across bands)
  and the flip-seed count (10 across bands), with band
  totals as context.
- THE LATE-DAY GUARD NEVER FIRED: either returns reliably
  leave budget, or the guard's threshold is loose. A
  future variant that shells MORE (e.g. also cooks) should
  re-check guard firing before assuming budget headroom.
- No metric, threshold, seed, or habit definition was
  changed mid-run. The pilot GO and confirm GO stand as
  written; the 51415/51420 drops and the wave-1 armed
  pilot seeds are interpretation of a GO result, not a
  re-score.

## Findings for backlog (for the coordinator to append)

This worker does NOT edit the tracker (coordinator owns
it) and does not append to sim-findings.md directly. The
lines below are in backlog format for the coordinator to
append verbatim if it wants them:

- [open] 2026-11-01 — food-economy / scholar supply — haul-size seeds persist: 51403/51406 (pilot) and 51411/51413/51417 (confirm) never carry a combined pack over 2,000 kcal on any return, so no shelling habit reaches the keep there; the blocker is forage volume/targets, not processing (sim-shelling-b evidence).
- [open] 2026-11-01 — food-economy / scholar supply — shelling habit verified real: shelling pack nuts on return (4 ticks/lot, engine-charged) flips shelling-shaped returns 59/59 across pilot + confirm bands and flips 10 seeds from zero unload; a landing case should be written as "shelling-shaped returns unload", not as a general unload increase, since 2 confirm seeds unload less armed via trajectory divergence (sim-shelling-b evidence).

## Infrastructure (loud, per task)

- SAFE-COMMIT INDEX CLOBBER hit the prereg commit (the
  known class): after commit 2e669747c the worktree index
  showed the prereg file as a staged deletion alongside
  its untracked copy. Repaired via git update-index --add
  --cacheinfo from the HEAD blob; verified git status
  --short clean and git diff HEAD empty. The commit itself
  was correct (221 insertions, message + file verified).
- Zero flap losses on judged sims: all 20 seeds x 2 legs
  landed first try, every line JSON-verified by the
  analyzer (complete capture: 0 null packs, 0 gate-true
  returns). The driver's callback-based stdout retry was
  not exercised.
- Sibling trees untouched: sim-muster-a, sim-wave4leth-a,
  sim-dipslide-confirm-b, journey trees never read,
  written, or merged. Main tree at ~/workspace/the-scattering
  never touched.

## Files

- Prereg: evidence/2026-11-01/sim-shelling-b-prereg.md
  (commit 2e669747c, before any judged sim)
- Policy layer: scripts/policies/shelling-b.js
- Driver: scripts/shelling-b-driver.js
- Analyzer: scripts/analyze-shelling-b.js
- Proof test: scripts/test-shelling-b.js (16 pure;
  --live-control 51107, --live-det 51107 x2)
- Pilot census: evidence/2026-11-01/sim-shelling-b-baseline.jsonl
  (8 lines), sim-shelling-b-armed.jsonl (8 lines)
- Confirm census: evidence/2026-11-01/sim-shelling-b-confirm-baseline.jsonl
  (12 lines), sim-shelling-b-confirm-armed.jsonl (12 lines)
- Corpus: evidence/2026-11-01/sim-shelling-b-corpus/
  51421-day19-return.txt, 51402-pilot-return.txt
- Evidence: evidence/2026-11-01/sim-shelling-b.md (this file)
