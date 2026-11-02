# sim-arrears-route-a — PREREGISTRATION (committed BEFORE any judged sim)

Run: fleshout-loop-a-20261102T0605Z, arm sim-arrears-route-a, axis scale-onramp.
Worktree branch: sim-arrears-route-a. Anchor at prereg: 624592b18
(HEAD, Loop A 0445Z round evidence commit). POLICY-SIDE ONLY — zero
`src/js` changes, no gates, stages, deed bars, trustedAt (70) /
trustedOpinion (10) / quota (6/2) / need (10) values, or win prices
touched. No [needs-eyes] (policy measurement only, nothing
player-facing ships) unless the evidence shows a feel/combat/UI
implication, in which case the evidence says why. If GO, the
deliverable is the measured policy variant
(`scripts/policies/arrears-route.js`) plus the replay, for the
coordinator to merge — it does NOT ship a game change by itself.
If NO-GO or under-powered, the variant file is DELETED in the
closing commit, and the replay/split/test scripts are deleted too,
so the killed arm lands nothing but its evidence note (plus this
prereg and the corpus, which are measurement record, not code).

## Canon read

docs/CANON.md first, then docs/SCALE.md (scale ladder). There is NO
titan-specific canon doc in docs/ — stated here instead of
inventing one (same finding as the 0445Z round). The in-code design
source is `src/js/titans.js` (coalition warfare, faces-not-units,
no-solo-titans hard gate, commit-own two-tap) plus
`src/data/titans.json` `_coalition` (trustedAt 70, trustedOpinion 10,
trustedBlades 6, baseBlades 2) and the herald def (minAllies 10),
and the deployed faithful rule `Game.titanCallReadiness` (2026-11-02,
sim-sumdeploy-a): a refusing link (trust < 25, opinion < -10, or
arrears > 0) contributes 0; otherwise quota 6 iff trust >= 70 AND
opinion >= 10, else 2; contribution min(quota - already,
freeAdults) counted through the call's own face-picker, so the
faces counted are the faces a sound would send; HavenProj =
havenValid + min(3 - havenValid, volunteers); READY iff
alliesProj + havenProj >= need.

## Question (from Loop A 0445Z round, evidence/2026-11-02/sim-scale-onramp-round-0445.md)

The 0445Z confirm found the scale-onramp binding constraint is
arrears: allied links with arrears > 0 contribute 0 blades to a
titan muster, and 4 of 12 confirm seeds never reached a defined
trigger for that reason. This arm judges exactly one question: can
a muster WAIT for arrears to clear instead of sounding into a
refusal — i.e., does deferring the sound until the faithful rule
says ready, within a bounded window, produce sounded musters that
the no-wait rule never produces, without harming survival?

## The arrears-route rule (policy-side only)

State machine per seed, driven by `scripts/policies/arrears-route.js`
(pure decision logic — it calls NO game mutator; the replay
performs the sound). Decision points are refused Herald attempts
(herald instrument cls REFUSED, same-day muster-diag snapshot,
same strictness as sumtrigger) plus weekly re-check ticks from the
replay's daily hook.

- FIRST CHECK: at each refused attempt while idle, compute readiness
  with the DEPLOYED `Game.titanCallReadiness('herald')` (not a
  re-implementation of the rule — the game function IS the faithful
  rule, and using it keeps this arm honest about the deployed code).
  Record one check row per refused attempt (day, per-link
  trust/opinion/arrears/quota/contribution, alliesProj, havenProj,
  total, ready, generatedNow, errors).
- ARREARS-ONLY BLOCK: readiness NOT ready AND every refusing link
  refuses SOLELY on arrears (trust >= 25 AND opinion >= -10 AND
  arrears > 0) AND at least one such link exists. A trust or opinion
  refusal anywhere means the block is NOT arrears-only and starts
  NO deferral. Non-refusing links are not blockers.
- DEFER: on the first arrears-only block, DEFER sounding and say
  one deferral line naming the fire, the debt, and the wait (see
  Sense below). Re-check weekly: ticks at deferDay + 7, +14, +21,
  +28, executed by the replay's daily hook BEFORE the base policy's
  daily (so a sound lands before that day's actions). Each tick
  recomputes readiness and records a check row.
- SOUND: at the first tick where readiness is ready, sound THEN:
  `Game.soundTitanCall('herald')` + two `Game.titanCommitOwn`
  taps, exactly as the sumtrigger replay did, with the same
  responder verification, link-count guard, and fight-outcome
  recording. `titanMonsterPresent` is NOT exported on Game, so
  monster presence is read from the sound's own return: if the
  sound returns null (nothing located), that tick is recorded as
  `ready-but-absent` — no muster created, no refusal penalty (the
  call returns before creating a muster) — and the deferral stays
  open to the next tick. A null sound is NEVER counted as sounded.
- STAND DOWN: if the +28 tick still finds readiness not ready (or
  ready-but-absent), stand down WITHOUT sounding: one stand-down
  line, status terminal for this seed, no muster, no refusal
  penalty. `Game.titanStandDown` is deliberately NOT called — it
  dissolves an existing muster and there is none.
- ISOLATION CHOICE (pre-registered, so the lever is attributable):
  the armed arm sounds ONLY via the deferral path. A seed whose
  first check is already ready, or whose block is never
  arrears-only, NEVER sounds in the armed arm. Armed-minus-baseline
  is therefore exactly the effect of waiting-for-arrears, not of
  sounding-at-ready (already measured by sumtrigger). At most one
  sound per seed; after sounded or stood-down, later refused
  attempts are recorded as observations only and start no new
  deferral.
- POLICY PURITY: the policy module never writes trust, opinion, or
  arrears, never calls payTribute/tendLink/answerDemand, never
  sounds a call the faithful rule says is unready (every sound is
  preceded in the same tick by a ready===true readiness row).
  Arrears movement between deferral and sound, if any, is the BASE
  GAME's doing (weekly tribute settlement under the frozen stack),
  never the policy's — the check rows make that movement visible.

## Instrument (adapted, not rewritten)

`scripts/arrears-route-replay-20261102.js` — adapts
`scripts/sumtrigger-replay-20261101.js` UNMODIFIED in policy
stack, recorders, env flags, transcript capture (extended to the
deferral/sound/stand-down lines), responder verification, and wall
fields. Behavior changes, all pre-registered here: (1) the
startCombat interceptor computes readiness with
`Game.titanCallReadiness` at every refused attempt and applies the
state machine above; (2) the wrapped daily runs the weekly
re-check ticks before delegating to the base policy; (3) an
`ARREARS_ROUTE=baseline|armed` env switch: baseline records the
same check rows but never defers, never sounds, never says a
deferral line — the in-run control; (4) fight outcome + muster
casualties recorded for every sounded call, as in sumtrigger.
`scripts/arrears-route-split-20261102.js` (idle, no game load)
splits the stdout runner output into per-seed corpus files.
Validator/analyzer: `scripts/test-arrears-route-a.js` — reproduces
the verdict from the corpus alone (no game load), plus unit proof
`scripts/test-arrears-route-policy.js` — the state machine on stub
readiness objects (arrears-only classification, weekly ticks,
sound-only-when-ready, stand-down terminal, no mutator calls).
STDOUT-RUNNER PATTERN: the replay prints one JSON line per seed
and writes NOTHING itself; the splitter runs in a foreground exec,
never a backgrounded pipe.

## Policy stack (exact names, frozen from sumtrigger/confirm)

`tribfloor` leadfeast + `windefer` withWinDefer + `seatdrive`
withSeatDrive + `fullseat-diag` withFullseatDiag, with herald-v1
(`herald-instrument-20261030`) + `muster-diag` recorders. Env:
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1 MUSTER=1. Switching stacks mid-run would break
comparability, so the stack is frozen here.

## Seeds / baseline (fresh band, verified unspent)

Pilot seeds (8): 97101, 97102, 97103, 97104, 97105, 97106, 97107,
97108. Fresh-band verification, done BEFORE this prereg was
committed: no file named `*9710*` under evidence/ or scripts/;
no `97101`–`97108` token in any `*.md` evidence file, in any
script, or in any `SEEDS=` list; no live claim file names the
band; the 954xx confirm band is NOT reused. (Bare-number hits for
other bands inside single-line JSON corpora — e.g. a pantry value
of 96107 kcal — are counts, not seed assignments, and are not
what "unspent" means; the seed-assignment surfaces above are the
check.) DAYS=180 death-aware cap (same rationale as sumtrigger:
150–200d reachability band; herald contact ran ~day 72–115 in
prior bands, the deferral window adds 28 days, and a fight tail
follows; a cap, not a target — dead villages stop simulating).
BASELINE = the same replay with ARREARS_ROUTE=baseline, run
IN-RUN on these identical seeds (0445Z lesson: re-run policy
controls in-run on current code; never trust prior corpora across
sibling landings). Any base drift between baseline and armed
first-check rows is reported, not re-scored: the two arms share
seed, stack, and anchor, so first-check rows must match until the
armed arm's first sound; a mismatch is a finding, investigated
before any verdict is claimed.

## PRIMARY METRIC

Deferral-to-sound conversion: among pilot seeds whose first
readiness check (baseline arm) shows an arrears-only block, the
share that sound within 28 days of deferral with faithful total
>= need (10) at sound — plus the NO-HARM survival bar below.

## GO (pilot — all must hold)

(a) POWER: at least 3/8 pilot seeds show an arrears-only block at
    their first readiness check (baseline arm). Else the pilot is
    UNDER-POWERED — verdict "under-powered", not NO-GO-by-effect,
    and no silent band expansion: a second pilot band, if run, is
    documented as a second pilot and reported separately, never
    pooled with the first.
(b) CONVERSION: at least 2 of the blocked seeds sound within 28
    days of their deferral day, with faithful total >= need at the
    sounding tick (pre-sound readiness row ready===true on file).
(c) NO-HARM: pilot median survival (gameDays, armed) within 10
    days of the identical-seed baseline median (armed median >=
    baseline median - 10), AND no new death shape: every death
    cause appearing in the armed arm also appears in the baseline
    arm on these seeds (a new cause fails this bar and is named).
(d) GUARDRAILS on every sounded seed: link count unchanged by the
    call (before == after); every responder a named living adult
    verified present on its village's roster at call time;
    instrumentErrors 0 and muster-diag errs 0; every sound
    preceded by a ready readiness row (never a sound into a known
    refusal); policy module contains no trust/opinion/arrears
    write (unit proof + code inspection).
(e) SENSE: the deferral line and the sound line each name the
    fire, the debt, and the wait/decision in human words (quoted
    in the evidence; a robotic delay line fails this bar).

A miss on any bar is NO-GO (or under-powered for (a) only), never
re-scored against a friendlier metric mid-run (MEASUREMENT §14).
Doubts go under "metric review".

## PILOT GATE / CONFIRM

Pilot = 8 seeds (above). Confirm ONLY if the pilot passes ALL
bars (a)–(e): a 12-seed confirm on a FRESH band (chosen and
grepped then, documented in the evidence, never pooled with the
pilot), baseline vs armed in-run on identical seeds, reported
separately. A pilot miss ends the arm — no confirm spend on a
failed sniff test.

## KILL RULE

On NO-GO or under-powered: the policy variant file
(`scripts/policies/arrears-route.js`) AND the replay, split, and
test scripts are DELETED in the closing commit. Evidence, prereg,
corpus, and analyzer output stay committed. The report states
"killed, nothing to merge". On GO: the variant file stays, and
the report states "ready for coordinator merge".

## PANEL (§15)

Balanced panel (scripts/balance-panel.js) does NOT apply: this is
a trigger-moment census with an event-triggered intervention
(sound-at-refusal / sound-at-tick via interceptors), not a
sweep-compare policy run — the panel driver consumes
sweep-compare rows under its observer, which this replay harness
cannot produce, and no panel row exists for a refused-attempt or
daily-tick trigger. Same declaration class as quotatrigger /
muster3 / sumtrigger / sumconfirm. Before/after is done directly
on identical seeds against the in-run baseline, with wall metrics
reported per band, NEVER pooled. No panel fabricated.

## Wall metrics reported (per band, never pooled)

Win rate, national(end) / table reach, wave-4 / wave-5 reach,
median / max survival (gameDays), death-cause shares (from the
per-seed deaths arrays), endReason mix.

## OUT OF SCOPE (task bounds)

No game-code change. No tribute/arrears rule change, no new
tribute-payment verb, no payTribute call from the policy (waiting
is the lever; what clears arrears, if anything, is measured, not
built). No gate/stage/deed-bar/win-price retunes. No sibling
trees or branches touched. No hidden_files (tracker/claims/
findings — coordinator-owned).

## Metric review

(To be filled at end of run. Doubts about the bars above go here
and apply to the NEXT run, never to this run's verdict.)
