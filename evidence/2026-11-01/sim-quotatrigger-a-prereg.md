# sim-quotatrigger-a — PREREGISTRATION (committed BEFORE any judged sim)

Run: fleshout-loop-a-20261102T0045Z, arm sim-quotatrigger-a, axis scale-onramp.
Worktree branch: sim-quotatrigger-a. DIAG/instrument only — zero `src/js`
changes, no gates, stages, deed bars, or win prices touched, nothing from
the #1538 steve-call queue built. If GO, this run writes a delivery spec
for a future deploy arm; it does NOT build the game change.

## Question (from the 2315Z round, arm sim-musterroster-adopt-a, NO-GO pilot)

On seed 90111 the muster call now brings real named responders from
rosterless Stonebridge/Thornfield, but first Herald contact moved day 87
-> 72 (Herald-steer build) before trust reached the trusted tier, so
quotas are base-2 not trusted-6 and the call yields 6 + Haven commit 3
= 9/10, muster NOT READY. The 2315Z metric review says: judge the call
at a competent player's trigger moment, not at first refused attempt.
This arm judges exactly that moment.

## Trigger definition (found in code, not invented)

`src/js/titans.js` `soundTitanCall`, quota line, with
`src/data/titans.json` `_coalition`: trusted quota 6 iff
`trust >= trustedAt (70)` AND `opinion >= trustedOpinion (10)`;
otherwise base quota 2. The muster-diag snapshot replicates this rule
per active link (`quota`, `trust`, `opinion`).

TRIGGER = the first REFUSED Herald attempt (herald instrument cls
REFUSED, with a same-day muster-diag refusal snapshot) at which the
snapshot shows >= 1 active link AND EVERY active link satisfies
trust >= 70 AND opinion >= 10 (equivalently, every link's snapshot
quota == 6). A seed with zero active links at every refusal is NOT
vacuously triggered: it counts as trigger-undefined.
The instrument sounds the call ONLY at the trigger (never at first
contact), then applies two `titanCommitOwn('herald')` taps, exactly as
the musterroster replay did, so the ready-after-commit number is
comparable with the 2315Z 9/10.

FALLBACK (pre-registered): if trust never reaches trusted tier
post-contact on a seed, that seed counts as trigger-undefined — it is
reported with its pre-contact trust trajectory (trust/opinion per link
at every refusal from first contact onward, max trust per link, first
contact day, first refusal day, last refusal day), and the
first-contact result is NEVER substituted for it.

## Instrument (adapted, not rewritten)

`scripts/quotatrigger-replay-20261101.js` — adapts
`scripts/musterroster-adopt-replay-20261101.js` UNMODIFIED in policy
stack, recorders, env flags, transcript capture, responder verification,
and wall fields. The ONLY behavior change: the startCombat interceptor
sounds at the trigger defined above instead of at the first refusal,
and records the full refusal trajectory (one compact row per refusal:
day, per-link trust/opinion/quota/wouldYield, snapshot callYield,
allTrusted, activeCount) plus first-refusal snapshot, trigger
snapshot, fought-before-trigger flag, and trigger-undefined reason.
`scripts/quotatrigger-split-20261101.js` (idle, no game load) splits
the stdout runner output into per-seed corpus files.
Validator: `scripts/test-quotatrigger-a.js` — reproduces the verdict
from the corpus alone.

## Policy stack (exact names, confirmed from the musterroster prereg + instrument)

NOT the shorthand in the task brief (tableseat-nowait / wavegate-diag do
not appear in the musterroster instrument). The reused stack, verbatim:
`tribfloor` leadfeast + `windefer` withWinDefer + `seatdrive`
withSeatDrive + `fullseat-diag` withFullseatDiag, with herald-v1
(`herald-instrument-20261030`) + `muster-diag` recorders. Env:
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1 MUSTER=1. Switching stacks mid-run would break
comparability with the 90111 2315Z result, so the stack is frozen
here. The task brief's shorthand is recorded as a naming mismatch,
not silently "corrected" into a different stack.

## Screen (pre-registered selection rule, NOT post-hoc picking)

Screen = the UNMODIFIED no-call `scripts/muster3-sweep-20261101.js`
(same stack/env, never sounds a call), DAYS=180, seeds 95401–95472
(72 seeds, the heraldsteer screen start and width). Qualifier = >= 1
muster-refusal snapshot in the screen row (a refused Herald attempt
under the same horizon as the judged run). The screen judges NOTHING
about trigger or yield — it only establishes that a refused Herald
attempt exists on current master, so stale controls (85106, zero
attempts on current master) are never carried forward.
Pilot seeds = 90111 (the known cluster seed, named here) + the FIRST 7
screen qualifiers in ascending seed order, excluding 90111 if it
appears in the screen band (it does not — different band).
Confirm seeds (ONLY on pilot GO) = the NEXT 12 screen qualifiers in
ascending order, excluding pilot seeds. If the screen yields fewer
than 7 qualifiers, the pilot runs with 90111 + all qualifiers and the
shortfall is reported (denominators change, bars do not).

## PRIMARY METRIC

Sounded-call allied yield at the trusted-tier trigger, and muster
ready-after-commit (allies + Haven commit >= need 10), per seed.

## GO (pilot — all must hold)

1. Trigger defined on >= 6/8 pilot seeds.
2. Among trigger-defined pilot seeds, >= 2/3 reach ready-after-commit
   TRUE (allies + two Haven-commit taps >= 10).
3. Guardrails on every sounded seed: link count unchanged by the call
   (before == after); every responder a named living adult verified
   present on its village's roster at call time; instrumentErrors 0
   and muster-diag errs 0.
4. First-contact result reported alongside the trusted-tier result
   for every sounded seed (first-refusal snapshot: day, trusts,
   quotas, snapshot callYield), never substituted for it. For 90111
   the prior run's sounded first-contact result (day 72, yield 6,
   9/10, NOT READY — 2315Z) is cited as a prior-run result, not
   re-measured, since this instrument deliberately does not sound at
   first contact.

Confirm GO (same bars, denominators 12): trigger defined on >= 9/12
confirm seeds; >= 2/3 of trigger-defined confirm seeds ready-after-
commit; guardrails hold on every sounded confirm seed.

## PILOT GATE

Pilot = 8 seeds (above). NO confirm spend unless pilot GO. A miss is
NO-GO, never re-scored against a friendlier metric mid-run
(MEASUREMENT §14). If the trusted-tier trigger never occurs
post-contact on a seed, that is a reportable finding with the
trust-race numbers (time-to-trusted vs Herald-arrival time), not a
failure to report.

## HORIZON (death-aware, never fixed 200d)

DAYS=180 cap, dead villages stop simulating (runDays endReason).
Why 180: reachability lever (MEASUREMENT §10: 150–200d band);
parity with the heraldsteer band (180d); the 90111 refusal window
runs past day 102 with trust still bleeding, so the trust race needs
room past day 100, while a fixed 200d would tick dead villages for
nothing. 180 is a cap, not a target.

## SEEDS / POLICIES

Screen: 95401–95472 (no-call sweep, DAYS=180). Pilot: 90111 + first 7
screen qualifiers ascending. Confirm (pilot GO only): next 12 screen
qualifiers ascending. Policies: the frozen stack above. Wall numbers
reported per band, NEVER pooled: pilot intervened band (national /
table / wins, maxWave, wave-4/5 reach, median/max survival) kept
separate from the unintervened screen band's numbers.

## PANEL (§15)

Balanced panel (scripts/balance-panel.js) does NOT apply: this is a
single-arm DIAG census with a snapshot-vs-actual comparison at the
same trigger moment on identical seeds, not a panel policy
comparison — same declaration class as muster3 / musterroster-adopt.

## OUT OF SCOPE (task bounds)

No #1538 steve-call queue work. No gate/stage/deed-bar/win-price
retunes. No game-code change in this arm; on GO the deliverable is a
delivery spec in the evidence file (e.g. hold-the-call until trusted
tier, or whatever the data supports), not a built change.
