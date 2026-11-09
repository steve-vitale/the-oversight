# sim-tendretest-a — retest the tenddrive lever on a national-loss-bearing band

**Arm:** sim-tendretest-a · **Run:** fleshout-20261108T2315Z (Loop A),
adopted/closed by fleshout-20261109T0126Z (stale-lock recovery — see
Infrastructure) · **Axis:** scale-onramp / winnability chain (converging,
NOT converged) · **Verdict: NO-GO** (primary fails 7→8, need +2; 76410
still loses) · **Prereg:** `evidence/2026-11-08/sim-tendretest-a-prereg.md`
· **Lever:** re-application of the tenddrive-a fix (win-plan tend leg runs
while national, cap 55) on fresh band 76409–76420 · **Substrate:**
tableseat-nowait (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) + tendtrust-b
recorder (TENDTRUST=1) · **Seeds:** 76409–76420, 12 seeds, confirm size ·
**Horizon:** 180 loop-days, death-aware · **Fix:** REVERTED after the
verdict — zero src/js diff vs base (commit 10723047e).

## The lever (exact construction — from the prereg)

Re-applied the tenddrive-a fix, commit 91092b28 on branch
sim-tenddrive-a (the fix diff only): in `src/js/win-plan.js`,
`winPlanBondsTick` only — (1) deleted the early return
`if (st.nationalLive || st.pendingNational) return null;` so the TENDING
leg no longer blocks while national or while a national beat is pending;
(2) raised the tend cap from 50 to 55 while nationalLive
(`(l.trust || 0) >= (st.nationalLive ? 55 : 50)`). `winPlanMusterTick`'s
early return and every other leg's nationalLive behavior untouched. The
fix was committed as 83ad197a9, the candidate leg run, then reverted as
10723047e after the NO-GO verdict.

## Verdict (binding bars, §14 — judge re-run by the adoption coordinator)

`node scripts/test-tendretest-a-judge.js` re-run on the stranded corpora
(exit 1, NO-GO — identical bars to the worker's run):

| Bar | Result | Numbers |
| --- | --- | --- |
| Judgeability gate | PASS | baseline national-loss events = 3, seeds [76410, 76414, 76417] — the band IS loss-bearing, unlike tenddrive-a's band (0 events) |
| PRIMARY | **FAIL** | national final 7 → 8, delta +1, need +2; loss seeds hold {76410: false, 76414: true, 76417: true} |
| Mechanism | PASS | engine tends while national = 8 (seeds [76411, 76414]); tend-attributed topped-55 = [76411, 76414] |
| Secondary (scalemetric cost bar) | PASS | starvation total 2 → 2, armed 1 → 1; median 92d → 95d (ratio 1.033) |

The adoption coordinator independently recomputed the primary from the
summary rows (armed arm, 12 rows/leg): before natFinal 7, after natFinal 8;
loss seeds before [76410, 76414, 76417], after [76410, 76417]; armed
medians 91d → 93.5d by raw days (the judge's 92 → 95 comes from the
summaries' aggregate medianDays — same PASS either way). The judge is
confirmed, not taken on trust.

## Per-seed table (armed arm, before → after)

| Seed | Before (days / ever / final / won) | After | What happened |
| --- | --- | --- | --- |
| 76409 | 99d / 1 / 1 / 1 global | 99d / 1 / 1 / 1 global | unchanged |
| 76410 | 130d / 1 / 0 / 0 regional | 130d / 1 / 0 / 0 regional | **still loses** — loss day 79, 0 engine tends while national, maxTrust 53, never tops 55 |
| 76411 | — / 1 / 1 / 1 | — / 1 / 1 / 1 | mechanism seed: 3 engine tends while national, 2 tend-attributed toppings (days 82, 92) |
| 76412 | — / 1 / 1 / 1 | — / 1 / 1 / 1 | unchanged |
| 76413 | 63d / 0 / 0 / 0 regional | 63d / 0 / 0 / 0 regional | never national, unchanged |
| 76414 | 123d / 1 / 0 / 0 regional | 98d / 1 / 1 / 1 global | **saved** — 5 engine tends while national, 3 tend-attributed toppings (days 80, 89, 91); the one clean save |
| 76415 | 76d / 0 / 0 / 0 regional | 76d / 0 / 0 / 0 regional | never national, unchanged |
| 76416 | 90d / 1 / 1 / 1 national | 90d / 1 / 1 / 1 national | unchanged |
| 76417 | 92d / 1 / 1 / 1 global | 92d / 1 / 1 / 1 global | held despite a dip — loss event day 90, still ends national |
| 76418 | 100d / 1 / 1 / 1 global | 100d / 1 / 1 / 1 global | unchanged |
| 76419 | 81d / 0 / 0 / 0 regional | 81d / 0 / 0 / 0 regional | never national, unchanged |
| 76420 | 95d / 1 / 1 / 1 global | 95d / 1 / 1 / 1 global | unchanged |

Wall (judged corpora, armed arm, 12 rows/leg): national ever 9/12 both
legs, national final 7 → 8, wins 7 → 8 (lesser seat only, enteredFull 0
both legs), wave-5 reach 1/12 both, max arc 4 both, median 92d → 95d.
Full seat 0 everywhere. The +1 is exactly one seed saved (76414); the
bar asked for +2.

## Why 76410 still loses (the failure, read closely)

76410 is the seed the lever was built to save, and the lever never gets
a chance on it. On the candidate leg: 0 engine tends while national, 0
policy tends while national, maxTrust while national 53 (never reaches
the 55 cap), gateBlocked 145 — the tend gate fires 145 blocked attempts
while national. The day-79 loss event is two links dipping at once
(trust 43 → 33 and 43 → 38) while the pantry collapses to 1 pantryDay
with all four links in mourning until day 70. The tend leg needs
pantryDays ≥ 3 to fire at all, so a village whose pantry has collapsed
cannot tend its way out of the loss — and the drive's firing rate is the
throttle even where the pantry holds (linkdecay-a, landed this same run,
measured 1 tend in 42 days with the actor home 3/42 days). The gate is
now open; the drive almost never walks through it on the seed that
needs it. The next lever for this thread is firing rate / actor
presence, not the gate — do not re-open the gate question on this
evidence.

## Mechanism detail (tend census, candidate leg)

Tends 107 (policy 20, engine 87), attempts 126, refused 106,
gateBlocked 217, mean lift +8. Engine tends while national on 2 seeds
(76411: 3, 76414: 5); tend-attributed topped-55 on the same 2 seeds
(76411: days 82, 92; 76414: days 80, 89, 91). Bare topped-55 (any
source, incl. court/aid gains) on 8 seeds — non-discriminating, as the
prereg predicted. The mechanism works where it fires; it fires on 2 of
12 seeds while national.

## Sense-testing (76410 replay, sense-only, non-measured)

`evidence/2026-11-08/sim-tendretest-a-sense.txt` — seed 76410,
tableseat-nowait + tendtrust-b, 130 days, ends village-lost. The story
is a combat-death cascade, not a bond-cooling story: the scholar Yulizar
Fauzi dies in a Big Loud arena fight on day 131, the mantle passes to
Katsumi Shimada (a chef), who dies in the next Big Loud the same day,
then Kwame Whelan, a barber, dies the same day again, and no one is left
to pick up the Codex. The village dies out quietly. The narration is
coherent throughout — mantle transfers are voiced, grief lands ("the
dead hold no treaties. Every link Haven has shakes"), the fire expects
the dead by name. What is ABSENT is any bond language: no line about
links cooling, grain sent, or trust slipping while national — the loss
the tend lever is meant to catch is never narrated as a bond event on
this seed. The tend voice is pre-existing (new occasion, not a new
line); nothing new was written for this arm. Judgment: the village
reads as people grieving and dying, not as a spreadsheet — but the
national-loss itself arrives as combat, not as the slow bond decay the
lever addresses. That is consistent with the measurement (76410's loss
is a trust-dip + pantry collapse during mourning, and the drive never
fires there).

## Balanced panel (§15)

The worker completed the AFTER panel
(`evidence/2026-11-08/tendretest-a-panel-after`, 48 cases, seeds
76409–76420 × capable/risk-aware/socialite/winse ek, 180d, sourceHead
83ad197a9 — the fixed tree) but died 17/48 cases into the BEFORE panel.
The main-session closeout re-ran the before panel to completion on the
reverted tree (sourceHead 10723047e, 48 rows, validity sourcesStable,
neutrality 4/4 on the proof seed) — but the first re-run carried the
substrate env (LEANLINKRESCUE=1 TABLESEATNOWAIT=1 TENDTRUST=1) and the
compare returned **invalid: Unmatched flags**: the after panel as-run
carries only 61 flags, the with-env before panel 64 — the three
substrate flags differ. Per the prereg's compare-contract note
(sim-comparecontract-a.md), the before panel was rebuilt with the
flags UNSET to match the after panel as-run (48 cases, 17 cached from
the worker's no-env partial run; sourceHead 10723047e; validity
sourcesStable, neutrality 4/4 on the proof seed). The compare is now
**valid: review_required**, errors [] (all four policies × 12 cases;
`evidence/2026-11-08/tendretest-a-panel-compare.md` + `.json`). The
capable column is nearly identical both legs (table win 0.9167,
national access 0.8333, village deaths/run 71.8 → 70.6, no
regression_signal anywhere); risk-aware is byte-identical on every
metric. The panel is the instrument, not the judge — the NO-GO verdict
stands on the prereg sweep bars, and the panel shows the reverted fix
leaves the balanced picture unchanged.

## Proof

- `scripts/test-tendretest-a-judge.js` — re-run by the adoption
  coordinator on the stranded corpora: exit 1, JUDGE NO-GO, bars
  identical to the worker's run (see Verdict). The judge carries a
  one-line fix, committed with this evidence (see Infrastructure): the
  mechanism object used the shorthand `tendAttributedTopped55Seeds`
  for a local named `tendAttrTopped55Seeds` — the committed version
  throws ReferenceError at the mechanism object (verified: the HEAD
  version crashes at line 95; the fixed version produces the verdict).
  Same bug class as the sweep aggregation fix already committed as
  30ec22e37.
- `scripts/test-tenddrive-a.js` — the lever spec (drive tends while
  nationalLive; cap 55 while national / 50 otherwise; muster stand-down
  still returns null while national). Re-run at closeout on the reverted
  tree (main session, 2026-11-09T02:16Z): **FAIL as expected** —
  national-tend FAIL, cap55 FAIL, cap50 PASS, muster-national PASS.
  The fix is out, so the drive does not tend while national and the cap
  is 50 — the revert is real and complete.
- `node scripts/check.js --quick` — run at closeout on the reverted
  tree (main session, 2026-11-09T02:38Z, log
  `tendretest-checkquick.log`): **293 passed, 7 failed in 945s**.
  The 7 are the standing profile, none attributable to this arm (zero
  src/js, zero green-list files): measurement-proof-update +
  measurement-workflow staleness, mobile-combat-cadence,
  occupation-panels, phone-frame-proof stale receipt,
  establishment-r20-fixes — the six known baseline failures — plus one
  capable-bot 120s timeout (load artifact; this gate overlapped a
  sibling Loop B gate for part of its run). No new failure.
- Sweeps: baseline leg first on the unfixed worktree, candidate leg on
  the fixed worktree; both legs 24 rows (12 plain + 12 armed), G2
  recorder neutrality PASS (12/12 identical), G3 corpus integrity PASS,
  cross-check (recorder tends + refused == substrate attempts) PASS
  12/12. The baseline sweep died in aggregation after all rows were
  written (commit 875e1b578 adopted the rows; the aggregation
  ReferenceError was fixed in 30ec22e37 with a fresh baseline
  summary.json). LEG-OK per leg (candidate log, 2026-11-09T00:56:40Z).

## Metric review

- The judgeability gate worked as designed: this band produced 3
  baseline loss events, so the retest was judgeable where tenddrive-a
  was not (0 events). The gate is a real filter, not a formality.
- The primary bar (+2 national final) was not met (+1). The bar was set
  from tendtrust-b's sizing (loss dips of 3/7/12 trust = 1/1/2 tends at
  lift +8) — one save (76414) is within the mechanism's reach; the
  second save never materialized because the drive never fired on
  76410. The bar stands for the next arm; do not lower it to +1
  retroactively.
- The tend-attributed topping correction (prereg) worked: bare topped-55
  (8 seeds) would have passed mechanism trivially; tend-attributed
  (2 seeds) is the discriminating read and still passes.
- The secondary cost bar is clean with margin (starvation flat,
  median up). The lever costs nothing measurable; it just does not
  save enough.
- No re-scoring was done or is available: the verdict is NO-GO on the
  pre-registered primary.

## Village assessment (plain words)

Twelve villages on the same road. Nine reach national standing; seven
hold it without the fix, eight with it. The one village the fix saves
(76414) is saved cleanly — five tends while national, three links
topped over the bar, ends global and wins. The village it was built to
save (76410) still falls: its pantry collapses, its links mourn, and
the tending drive — now allowed to run while national — simply never
shows up, 145 times blocked at the gate. The other villages are
unchanged: three never reach national at all, and the fix does not
touch them. Nothing gets worse (no extra starvation, villages live
slightly longer), but the chain from "allowed to tend" to "tends" to
"saved" breaks at the middle link. The village that dies does so in
combat, three scholars in one day, with the bonds quietly shaking
underneath and no one tending them.

## Blanks filled / documented

- FILLED (documented, not fixed): the tenddrive lever is NO-GO on a
  loss-bearing band — the gate is not the binding constraint; firing
  rate / actor presence is. The retest is complete and judgeable.
- DOCUMENTED: 76410-class loss shape (trust-dip + pantry collapse
  during mourning; tend needs pantryDays ≥ 3, so a starving village
  cannot tend out); the tendtrust recorder's header comment still says
  the engine drive "never [tends] while nationalLive" (stale under the
  fix; recorder not modified — see prereg note 3); the judge's
  shorthand bug (fixed in this commit).
- NOT TOUCHED: trial-by-combat staging (steve-call); the firing-rate
  lever (next arm); 76408-class pre-national link decay (landed
  separately as sim-linkdecay-a, 6e69df4ef, this same run).

## Infrastructure

- ADOPTION: the 2315Z coordinator died by cron timeout after landing
  sim-linkdecay-a (6e69df4ef) and reaching this verdict (revert
  committed 10723047e) but before writing round evidence or closing
  out. This run (fleshout-20261109T0126Z) adopted the stranded
  worktree: verified the judge by re-run (exit 1, identical bars),
  recomputed the primary from the summary rows, confirmed zero src/js
  diff vs master, and completed the panel compare (see above). No new
  sims were run for this arm; the corpora are the worker's.
- Commits in this branch (base 6e69df4ef): db13598bf (prereg),
  f9f866022 (instruments), bab81c8f2 (prereg + retest instruments),
  875e1b578 (baseline corpus), 30ec22e37 (aggregation fix + baseline
  summary), 83ad197a9 (re-apply fix), 10723047e (REVERT, NO-GO).
  Adoption commit (this evidence + judge fix + corpora/panels):
  `68e26a2ee` (main-session closeout), plus the follow-up commit
  filling this hash in the evidence file.
- The tendretest-a-panel-before build died at 17/48 cases with the
  worker; the adoption run re-runs it on the reverted tree (resume
  from the cases/ cache) before committing this evidence.
