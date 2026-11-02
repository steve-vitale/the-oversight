# sim-sumconfirm-a — PREREGISTRATION (committed BEFORE any judged sim)

Run: fleshout-loop-a-20261102T0445Z, arm sim-sumconfirm-a, axis scale-onramp.
Worktree branch: sim-sumconfirm-a. POLICY-SIDE ONLY — zero `src/js`
changes, no gates, stages, deed bars, or win prices touched, no
trustedAt (70) / trustedOpinion (10) / quota (6/2) / need (10) values
changed, nothing from the #1538 steve-call queue built, no
food-economy work, no Layer-2 titan work. No [needs-eyes] (policy
measurement only, nothing player-facing ships).
If GO, the deliverable is the measured confirmation of the
sumtrigger policy variant (`scripts/policies/sumtrigger.js`,
UNCHANGED from the pilot) plus this evidence, for the coordinator
to merge — it does NOT ship a game change by itself.
If NO-GO, the verdict stands on the corpus and the report states
"killed, nothing to merge" for the confirm claim (the pilot GO
stands as a pilot result; this arm does not retroactively kill it).

## Canon read

docs/CANON.md first, then docs/SCALE.md (scale ladder) and
docs/SCALE-DISCOVERY.md. There is NO titan-specific canon doc in
docs/ — stated here instead of inventing one. The in-code design
source is the `src/js/titans.js` file header (coalition warfare,
faces-not-units, no-solo-titans hard gate, commit-own two-tap) plus
`src/data/titans.json` `_coalition` (trustedAt 70, trustedOpinion 10,
trustedBlades 6, baseBlades 2) and the herald def (minAllies 10).

## Question (from sim-sumtrigger-a, 20261102T0250Z, pilot GO)

The sum-trigger muster rule (sound when the faithful projected
muster — allied yield counting the call's own roster generation +
Haven commit — reaches need 10, with no weakest-link veto, at the
first ready refusal) fired on 6/8 pilot seeds with projection exact
6/6 and a same-day won fight 6/6. The pilot prereg deferred the
confirm to a follow-up run: it needs the next 12 screen qualifiers,
and the quotatrigger screen stopped at 95446. This arm IS that
follow-up: it confirms the pilot GO on 12 fresh screen qualifiers.

## Ordering note (why the screen precedes this prereg)

The resumed screen is SELECTION ONLY, not a judged sim: it is the
UNMODIFIED no-call sweep, it sounds no call, and it judges nothing
about trigger or yield. It had to run before this prereg could be
written, because two pre-registered items derive from it: the
confirm seed list itself and bar (e)'s screen median for exactly
those seeds. The JUDGED sim — the sumtrigger replay on the 12
confirm seeds — runs ONLY after this prereg is committed. No
replay output existed when this file was committed.

## Resumed screen (selection only, already run, committed with this prereg)

Screen = the UNMODIFIED no-call `scripts/muster3-sweep-20261101.js`
(same stack/env as the quotatrigger screen, never sounds a call),
DAYS=180, resuming at seed 95447 ascending from where the
quotatrigger screen stopped at 95446. Qualifier rule (unchanged
from quotatrigger): >= 1 muster-refusal snapshot in the screen row
(a refused Herald attempt under the same horizon as the judged run).
Chunks: 95447–95472, 95473–95480, 95481–95488, 95489–95496,
95497–95504, 95505–95512. Scanned band: 95447–95512, 66 seeds,
stopped exactly at the 12th qualifier (95512 is the last scanned
seed; no overshoot). Qualifier rate in the resumed band: 12/66.
Corpus: evidence/2026-11-02/perseed-sumconfirm-a/screen{1..6}.stdout
/.stderr (stdout runner lines, one JSON row per seed).

## Confirm seeds (the NEXT 12 screen qualifiers, ascending, pilot seeds excluded)

95447, 95448, 95453, 95454, 95462, 95463, 95464, 95477, 95478,
95492, 95495, 95512. None is a pilot seed (pilot: 90111, 95411,
95423, 95425, 95434, 95437, 95438, 95446). Screen rows for these 12
(no-call, DAYS=180):

| Seed | Refusals | Days | End | Nat(end) | Table | Won | MaxWave |
|---|---|---|---|---|---|---|---|
| 95447 | 59 | 138 | over-other | 0 | 1 | 1 | 4 |
| 95448 | 40 | 110 | village-lost | 1 | 0 | 0 | 4 |
| 95453 | 42 | 102 | over-other | 1 | 1 | 1 | 4 |
| 95454 | 26 | 92 | village-lost | 1 | 0 | 0 | 4 |
| 95462 | 73 | 157 | village-lost | 0 | 0 | 0 | 4 |
| 95463 | 48 | 181 | survived | 1 | 0 | 0 | 4 |
| 95464 | 3 | 137 | over-other | 1 | 1 | 1 | 4 |
| 95477 | 4 | 96 | over-other | 1 | 1 | 1 | 4 |
| 95478 | 20 | 109 | over-other | 1 | 1 | 1 | 4 |
| 95492 | 44 | 90 | over-other | 1 | 1 | 1 | 4 |
| 95495 | 23 | 167 | over-other | 1 | 1 | 1 | 4 |
| 95512 | 26 | 90 | over-other | 0 | 1 | 1 | 4 |

Screen band wall (no-call, confirm band, kept separate from the
intervened band): national(end) 9/12, table 8/12, won 8/12,
wave-4 12/12, wave-5 0/12, median survival 109.5d, max 181d,
ends over-other 8, village-lost 3, survived 1. "National" = END
scale rank, same definition as quotatrigger/sumtrigger.

## Policy stack (exact names, frozen from quotatrigger/sumtrigger)

`tribfloor` leadfeast + `windefer` withWinDefer + `seatdrive`
withSeatDrive + `fullseat-diag` withFullseatDiag, with herald-v1
(`herald-instrument-20261030`) + `muster-diag` recorders. Env:
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1 MUSTER=1. DAYS=180 death-aware cap (same
rationale as quotatrigger/sumtrigger: 150–200d reachability band,
parity with the heraldsteer band, room past day 100 for the trust
race; a cap, not a target). Switching stacks mid-run would break
comparability with the pilot, so the stack is frozen here.

## Instrument (adapted only as needed)

`scripts/sumtrigger-replay-20261101.js` — the pilot replay,
UNCHANGED in behavior: the startCombat interceptor projects with
the policy module `scripts/policies/sumtrigger.js` at every
refused Herald attempt and sounds ONLY at the first ready refusal
(faithful projection >= need 10), at most once per seed, then two
`titanCommitOwn` taps exactly as the quotatrigger replay did; one
projection row per refusal; fight outcome + muster casualties
recorded at run end for every sounded call; which villages'
rosters the projection generated, and when.
`scripts/policies/sumtrigger.js` — UNCHANGED (faithful rule:
refusing link contributes 0; otherwise quota 6 iff trust >= 70
AND opinion >= 10, else 2; contribution min(quota, freeAdults)
after the call's own roster generation; HavenProj capped at the
3-blade Haven cap; naive quota-sum reported alongside, NEVER the
trigger). The only new file in the instrument chain is the idle
splitter `scripts/sumconfirm-split-20261101.js` (a copy of the
pilot splitter writing into
evidence/2026-11-02/perseed-sumconfirm-a instead of
perseed-sumtrigger-a) — needed because the pilot splitter
hardcodes its output directory; no game-loaded behavior changes.
Validator: `scripts/test-sumconfirm-a.js` — reproduces the verdict
from the corpus alone (no game load), adapted from
`scripts/test-sumtrigger-a.js` with denominators 12 and the screen
median (109.5d, recomputed from the screen corpus by the validator
itself, not hardcoded as a bare number).
Unit proof: `scripts/test-sumtrigger-policy.js` — REUSED UNCHANGED
(the rule code is unchanged, so its 16/16 proof still covers it);
re-run, not re-written. If it fails on this checkout, that is a
loud failure, not a rewrite prompt.

## PRIMARY METRIC

Sounded-call readiness at the sum trigger, and muster
ready-after-commit (allies + Haven commit >= need 10), per seed —
same metric as the pilot, denominators 12.

## GO (confirm — all must hold)

(a) Trigger defined on >= 9/12 confirm seeds (pilot bar >= 6/8,
adapted to denominators 12).
(b) Among sounded confirm seeds, sounded yield (allies + Haven
commit) >= 10 on EVERY sounded seed, AND projectedAllies ==
soundedAllies on every sounded seed (projection fidelity — the
generation-exactness claim, tested not assumed). This bar is
vacuous only if zero seeds sound; zero sounded seeds fails bar
(a) first, so the conjunction cannot pass on an empty set.
(c) Fight outcome and muster casualties RECORDED for every
sounded call (foughtSameDay, heraldSlain, per-responder fate,
Haven fate). A sounded call with an unrecorded outcome fails
this bar. (Reporting bar, as in the pilot: the outcome is
measured, not gated on "won".)
(d) Guardrails on every sounded seed: link count unchanged by
the call (before == after); every responder a named living adult
verified present on its village's roster at call time;
instrumentErrors 0, muster-diag errs 0, interceptor errors 0,
projection errors 0.
(e) Median survival no worse than the no-call screen median for
these same 12 seeds: median gameDays(confirm replay) >= 109.5d
(screen median computed above from the screen corpus: sorted
days 90, 90, 92, 96, 102, 109, 110, 137, 138, 157, 167, 181;
median (109 + 110) / 2 = 109.5d).

A miss on any bar is NO-GO, never re-scored against a friendlier
metric mid-run (MEASUREMENT §14). Doubts go under "metric review"
in the evidence file.

## PANEL (§15)

Balanced panel (scripts/balance-panel.js) does NOT apply: this is
a trigger-moment census with an event-triggered intervention
(sound-at-refusal via a startCombat interceptor), not a
sweep-compare policy run — the panel driver consumes
sweep-compare rows under its observer, which this replay harness
cannot produce, and no panel row exists for a refused-attempt
trigger. Same declaration class as sumtrigger / quotatrigger /
muster3 / musterroster-adopt. Before/after is done directly on
identical seeds against the screen corpus (baseline named above),
with wall metrics reported per band, NEVER pooled. No panel
fabricated.

## Wall metrics reported (per band, never pooled)

Win rate, national(end) / table reach, wave-4 / wave-5 reach,
maxWave distribution, median / max survival (gameDays), death-cause
shares (from the per-seed deaths arrays), endReason mix — for the
intervened confirm band, kept separate from the no-call screen
band above and from the pilot band.

## OUT OF SCOPE (task bounds)

No #1538 steve-call queue work. No gate/stage/deed-bar/win-price
retunes. No trustedAt / trustedOpinion / quota / need value
changes. No game-code change in this arm. No sibling trees or
branches touched (Loop B live on sim-gatefloor-b, sim-tasktag-b,
sim-coord-0330-b — not touched). No hidden_files (tracker/claims/
findings — coordinator-owned).
