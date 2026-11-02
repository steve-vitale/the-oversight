# sim-sumtrigger-a — PREREGISTRATION (committed BEFORE any judged sim)

Run: fleshout-loop-a-20261102T0250Z, arm sim-sumtrigger-a, axis scale-onramp.
Worktree branch: sim-sumtrigger-a. POLICY-SIDE ONLY — zero `src/js`
changes, no gates, stages, deed bars, or win prices touched, no
trustedAt (70) / trustedOpinion (10) / quota (6/2) / need (10) values
changed, nothing from the #1538 steve-call queue built. No
[needs-eyes] (policy measurement only, nothing player-facing ships).
If GO, the deliverable is the measured policy variant
(`scripts/policies/sumtrigger.js`) plus this evidence, for the
coordinator to merge — it does NOT ship a game change by itself.
If NO-GO, the variant file is deleted in the closing commit (see
KILL RULE below) and the verdict stands on the corpus.

## Canon read

docs/CANON.md first, then docs/SCALE.md (scale ladder) and
docs/SCALE-DISCOVERY.md. There is NO titan-specific canon doc in
docs/ — stated here instead of inventing one. The in-code design
source is the `src/js/titans.js` file header (coalition warfare,
faces-not-units, no-solo-titans hard gate, commit-own two-tap) plus
`src/data/titans.json` `_coalition` (trustedAt 70, trustedOpinion 10,
trustedBlades 6, baseBlades 2) and the herald def (minAllies 10).

## Question (from sim-quotatrigger-a, 20261102T0045Z, NO-GO pilot)

The every-link-trusted trigger fires on only 5/8 pilot seeds, but is
ready 5/5 when defined. Its delivery spec proposes: sound when the
muster is READY BY SUM, not when every link is trusted — projected
allied yield + Haven commit >= need (10), counting the call's own
roster generation, with no weakest-link veto, sounded at the first
ready moment. This arm judges exactly that rule.

## Pre-registered fork: faithful projection vs naive quota-sum

The delivery spec's shorthand ("quotas sum to 6+6+2 = 14" on 95423)
does NOT survive the call's own rules, and this fork is settled HERE,
before any judged sim, not discovered mid-run as a re-score:

- 95423's Emberhold link (trust 72, opinion 20) carries arrears 3000.
  `soundTitanCall` REFUSES any link with trust < 25, opinion < -10,
  or arrears > 0 — so Emberhold sends NOBODY and takes trust -8.
  The faithful projected yield on 95423's day-115 refusals is
  0 (Emberhold, refused) + 4 (Stonebridge, min(6, facesFree 4)) + 2
  (Hungry Road II, min(2, 4)) = 6 allies, + Haven <= 3 = 9 < 10:
  NOT READY. The blocker on 95423 is ARREARS, not the untrusted
  link (46) — the weakest-link counterexample dissolves under the
  call's actual rules, and the untrusted link's base quota (2)
  still counts toward readiness.
- TRIGGER RULE (faithful): projection replicates `soundTitanCall`
  per-link, exactly: a refusing link contributes 0; otherwise quota
  is 6 iff trust >= 70 AND opinion >= 10, else 2; contribution is
  min(quota, freeAdults), where freeAdults counts the link's roster
  AFTER the call's own roster generation (see below); already-
  committed faces excluded (same committed set as muster-diag).
  HavenProj = min(3, titanVolunteers().length) — the pool the two
  commit taps draw from, capped at the 3-blade Haven cap.
  ProjectedTotal = sum(contributions) + HavenProj. READY iff
  ProjectedTotal >= 10 (herald minAllies).
- NAIVE QUOTA-SUM (reported alongside, NEVER the trigger): sum over
  ALL active links of min(quota, freeAdultsGenerated) + HavenProj,
  ignoring refusals. It is recorded on every refusal so the
  coordinator can see exactly where the two formulas diverge
  (95423: naive 10 vs faithful 6, before Haven). If the faithful
  rule NO-GOs while the naive rule would have fired on a seed, that
  divergence is the finding — not a re-score.

## Roster-generation rule (the snapshot-undercount fix)

Snapshot facesFree is 0 for rosterless links, but the call generates
those rosters (via `Game.genVillageRoster`, same generator
`titanAlliedFaces` uses) and the sounded yield counts them
(quotatrigger: sounded exceeds snapshot by 5–11 on every triggered
seed). The projection therefore generates, for each rosterless
linked village, through `Game.genVillageRoster` at projection time
— the call's own generator, not a new one — and counts free living
adults (alive, age >= 18 or null, health > 0 or undefined, not
already committed), exactly as `titanAlliedFaces` filters.
PRE-REGISTERED SIDE EFFECT (not a mid-run surprise): generation
consumes seeded RNG and the roster persists, so post-first-refusal
timelines may diverge from the no-call screen and from the
quotatrigger corpus. The comparison remains identical-seed /
same-stack, and divergence is MEASURED (refusal-day sequences
compared against the quotatrigger corpus; projectedAllies ==
soundedAllies asserted on every sounded seed). A deployed version
of this rule faces the same question — a projection UI that
generates rosters — and this arm's divergence measurement bounds it.

## Trigger definition

TRIGGER = the first REFUSED Herald attempt (herald instrument cls
REFUSED, with a same-day muster-diag refusal snapshot, same
strictness as quotatrigger) at which the faithful projection is
READY (ProjectedTotal >= 10). The instrument sounds the call ONLY
at the trigger (never at first contact, never repeatedly into a
burst — at most one sound per seed), then applies two
`titanCommitOwn` taps, exactly as the quotatrigger replay did, so
ready-after-commit is comparable with 2315Z / quotatrigger.
"First ready moment" means first ready REFUSAL: the instrument
observes at refusals (startCombat interceptor), and the spec's own
example is "the first ready refusal AFTER a quiet gap" (90111).
A seed with no ready refusal counts as trigger-undefined and is
reported with its full refusal trajectory (one projection row per
refusal: day, per-link trust/opinion/arrears/quota/freeAdults/
contribution, naive sum, faithful sum, HavenProj, ready flag).
The first-contact result is NEVER substituted for a trigger.

## Instrument (adapted, not rewritten)

`scripts/sumtrigger-replay-20261101.js` — adapts
`scripts/quotatrigger-replay-20261101.js` UNMODIFIED in policy
stack, recorders, env flags, transcript capture, responder
verification, and wall fields. Behavior changes, all pre-registered
here: (1) the startCombat interceptor projects with the policy
module `scripts/policies/sumtrigger.js` (faithful + naive sums)
at every refused attempt and sounds ONLY at the trigger above;
(2) it records one projection row per refusal (not just the
trigger snapshot); (3) it records fight outcome and muster
casualties for every sounded call (see below); (4) it records
which villages' rosters the projection generated, and when.
`scripts/sumtrigger-split-20261101.js` (idle, no game load) splits
the stdout runner output into per-seed corpus files.
Validator: `scripts/test-sumtrigger-a.js` — reproduces the verdict
from the corpus alone (no game load).
Unit proof: `scripts/test-sumtrigger-policy.js` — the rule itself
on stub Game objects (quota 6/2, refusal exclusion, free-adult
cap, Haven cap 3, no weakest-link veto, arrears refusal), no sim.

## Fight outcome + muster casualties (new measurement vs quotatrigger)

For every sounded call, the replay records at run end: FOUGHT
Herald attempt on the trigger day (day list); herald slain flag
(`state.titans.slain.herald`) and the `state.titans.outcomes`
herald records; tbOutcome for the trigger-day fight if joined;
per-responder fate (home-roster person alive / dead / missing at
run end, by village); Haven committed fate (on Haven roster and
alive at run end); post-fight muster allies count. These are
REPORTING bars (GO bar 3 below is "recorded", not "won") — the
fight outcome is measured, not gated.

## Policy stack (exact names, frozen from quotatrigger)

`tribfloor` leadfeast + `windefer` withWinDefer + `seatdrive`
withSeatDrive + `fullseat-diag` withFullseatDiag, with herald-v1
(`herald-instrument-20261030`) + `muster-diag` recorders. Env:
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1 MUSTER=1. Switching stacks mid-run would break
comparability with the quotatrigger baseline, so the stack is
frozen here.

## Seeds / baseline (no new screen)

Pilot seeds (8, identical to the quotatrigger pilot — the task's
pilot band): 90111 + 95411, 95423, 95425, 95434, 95437, 95438,
95446. DAYS=180 death-aware cap (same rationale as quotatrigger:
150–200d reachability band, parity with the heraldsteer band,
room past day 100 for the trust race; a cap, not a target).
BASELINE = the quotatrigger pilot corpus on these identical seeds
(evidence/2026-11-01/perseed-quotatrigger-a/pilot-s<seed>.json):
trigger defined 5/8, ready 5/5, median survival 108d, max 180d,
national(end) 6/8, table 4/8, won 2/8, wave-4 8/8, wave-5 2/8.
"National" = END scale rank (same definition as quotatrigger).
No screen is run in this arm: the pilot set is fixed by the task,
and a confirm would need a resumed screen (see CONFIRM below).

## PRIMARY METRIC

Sounded-call readiness at the sum trigger, and muster
ready-after-commit (allies + Haven commit >= need 10), per seed.

## GO (pilot — all must hold)

1. Trigger defined on >= 6/8 pilot seeds (baseline every-link: 5/8).
   Predicted shape (NOT a bar — the bars above are the bars): the 5
   baseline seeds fire (their projections equal their sounded
   yields, all ready), 95425 fires at its first refusal (faithful
   6 + 2 + generated-Stonebridge + Haven >= 10 on any plausible
   Haven count >= 2), 95423 does NOT fire (faithful 9 max: arrears
   refusal), 95411 does NOT fire (faithful <= 7: Emberhold refused,
   base quotas only). A miss on any seed is reported with its
   projection rows, never explained away.
2. Among sounded pilot seeds, sounded yield (allies + Haven commit)
   >= 10 on EVERY sounded seed, AND projectedAllies ==
   soundedAllies on every sounded seed (projection fidelity — the
   generation-exactness claim, tested not assumed).
3. Fight outcome and muster casualties RECORDED for every sounded
   call (foughtSameDay, heraldSlain, per-responder fate, Haven
   fate). A sounded call with an unrecorded outcome fails this bar.
4. Guardrails on every sounded seed: link count unchanged by the
   call (before == after); every responder a named living adult
   verified present on its village's roster at call time;
   instrumentErrors 0 and muster-diag errs 0.
5. Median survival no worse than baseline on identical seeds:
   median gameDays(sum pilot) >= 108d (baseline median from the
   quotatrigger corpus, recomputed by the validator).

## PILOT GATE / CONFIRM

Pilot = 8 seeds (above). NO confirm spend in this run: a confirm
needs the next 12 screen qualifiers, and the quotatrigger screen
stopped at 95446 (46/72 scanned) — resuming it at 95447 is a
follow-up run's job, pre-registered there, not improvised here.
A pilot miss is NO-GO, never re-scored against a friendlier metric
mid-run (MEASUREMENT §14). Doubts go under "metric review".

## KILL RULE

On NO-GO: the policy variant file (`scripts/policies/sumtrigger.js`)
is DELETED in the closing commit, and the replay script is left
with a frozen inline copy of the identical rule (header-marked)
so the corpus remains reproducible from the branch. Evidence,
prereg, corpus, validator, and unit proof stay committed. The
report states "killed, nothing to merge". On GO: the variant file
stays, and the report states "ready for coordinator merge".

## PANEL (§15)

Balanced panel (scripts/balance-panel.js) does NOT apply: this is
a trigger-moment census with an event-triggered intervention
(sound-at-refusal via a startCombat interceptor), not a
sweep-compare policy run — the panel driver consumes
sweep-compare rows under its observer, which this replay harness
cannot produce, and no panel row exists for a refused-attempt
trigger. Same declaration class as quotatrigger / muster3 /
musterroster-adopt. Before/after is done directly on identical
seeds against the quotatrigger corpus (baseline named above),
with wall metrics reported per band, NEVER pooled. No panel
fabricated.

## Wall metrics reported (per band, never pooled)

Win rate, national(end) / table reach, wave-4 / wave-5 reach,
maxWave distribution, median / max survival (gameDays), death-cause
shares (from the per-seed deaths arrays), endReason mix.

## OUT OF SCOPE (task bounds)

No #1538 steve-call queue work. No gate/stage/deed-bar/win-price
retunes. No trustedAt / trustedOpinion / quota / need value
changes. No game-code change in this arm. No sibling trees or
branches touched. No hidden_files (tracker/claims/findings —
coordinator-owned).
