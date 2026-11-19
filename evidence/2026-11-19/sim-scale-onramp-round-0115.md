# sim-scale-onramp-round-0115 — round evidence (Loop A)

**Run:** fleshout-20261119T0115Z (scheduled 19:15 CST Nov 18, 2026; axis
scale-onramp) · **Adoption:** this file was completed by the adoption
worker after the scheduled run timed out before closeout. Every claim
below was re-verified from files/git by the adoption worker; the
timed-out run's report was partly wrong (it claimed the 2330Z adoption's
evidence landing was unmerged — commit `48c81dac6` was verified an
ancestor of HEAD at adoption spawn; see the lock note at the end).
**Master at adoption spawn:** `986cc5584` (Loop B 2330Z adoption's
allyslot3 corpus).

## Arms

| Arm | Finding | Verdict | Evidence |
|---|---|---|---|
| sim-rage-setup-a | #2568 — Rage setup-turn survival | **NO-GO** (pilot, frozen bars) | `evidence/2026-11-18/sim-rage-setup-a.md` |
| sim-sense-guard-diag-a | #2571 — launch-party sense guard | **DIAG-GO** (repro leg 4/4; fresh band confirms mechanism) | `evidence/2026-11-19/sim-sense-guard-diag-a.md` |

**Both levers HELD — nothing in this round changes game code.** The
round landing is evidence-only (corpora, analyses, panels, preregs,
evidence files). The sense fix and the 3rd-ally slot stay held on
branch `sim-sense-guard-diag-a` as measurement history; the working
tree no longer contains them (substrate dropped, seedplan-b pattern).
The `RAGEFREE` change stays held on branch `sim-rage-setup-a`.

## Arm 1 — sim-rage-setup-a: NO-GO

Rage as a free action that strikes the same round (`RAGEFREE=1`;
proof 57/57). Pilot band 106001–106008, 150d, competent, substrate
both legs. Pool met (arm pair n 13 ≥ 10); **kill share 0/13 arm vs
0/22 ctl (bar ≥ 0.25) — FAILS**; cost bars pass (community loss 4/8
vs 3/8 — exactly at the bar; starvation 8 vs 8; median survival
148.5d vs 150d); mechanism passes (carrier fires 8 arm / 12 ctl;
paired damage rate 2/2 arm ≥ ctl). Funnel: ctl 46 → 22 engaged, arm
26 → 13 (evades the largest loss, finding #2569). Paired fired
meetings: Sergio d95 172→210 dmg, Ruby d139 216→238 (both vFlee);
Devon d127 identical 23/23. Damage race vFlee 35.9 vs 38.5 dmg/round
— far below the ~111/round winning shape. §15 panel:
review_required (community loss regression_watch +0.125, exactly at
the frozen bar). All three transcript re-reads verified by the
adoption worker: Moshe d38 ctl (real-Rage holder, R1 consumed, dies
R4) has NO arm counterpart (trajectory diverged); third ctl vDie
Ruby d88 read in full; gen_arcfvpg d47 631-damage arm fire read in
full (free action works, party still flees at 74% monster HP).
New finding #2572: a higher-priority turn verb (failed Walk In) can
pre-empt the free-action Rage round (Heinrich d53). Confirm band
106011–106026 stays fresh and unspent. Evidence commit `489bf0e88`
on branch `sim-rage-setup-a`.

## Arm 2 — sim-sense-guard-diag-a: DIAG-GO

Meeting-instant sense recorder answering whether the launch-party
sense's same-expedition guard is too strict. **Repro leg (the judged
sweep): DIAG-GO on all five frozen bars** — pool floor (13 launches,
denom 8), trace coverage 8/8 = 1.00, classification complete (5
misses, 0 unclassified), test cases **4/4** (d133, d69, d112, d117),
instrument 0/0/0; sense rate 0.75 (6/8). **Fresh leg (pool data):**
passes 4 of 5 bars; test cases 0/4 only because the fresh band holds
none of the repro seeds by construction (the prereg says so) — the
analyzer's TESTCASE-MISS there is the expected reading of pool data.
Fresh sense rate 0.39 (7/18); misses fighter-relaunched 10,
mirror-overwrite 5, target-mismatch 4. **Determinism:** judged fresh
leg reproduces the survey — 7/8 seeds byte-identical except
`anchorCommit`; seed 104752 differs only in the `seq` bookkeeping
counter inside two trace lists (same lengths, same contents;
sense traces 700/700, encounters 41/41, wall identical). **Answer:
the dominant mechanism is `plan.party` churn, not the guard** — 20
of 24 misses across both judged legs trace to the plan party being
rewritten after the launch; the guard never wrongly excluded a
listed companion. Mirror-overwrite pinned on seed 104753 (holder
emma_larsen, plan.party shrunk to a single other holder on d71/d93).
**Named next arm:** read the fighter's current expedition companions
instead of the mutable plan party, or hold a launched quad's
expeditions together; the tile/target guard needs no loosening. (The
parallel Loop B arm sim-sensecotravel-b independently converged on
the same recommendation.) Substrate dropped before delivery; post-drop
proof 8 passed, 0 failed, 1 skipped (§F agreement skips cleanly);
analyzer selftest 10/10. Evidence commit: 3734d4c44 on branch `sim-sense-guard-diag-a`.

## Wall numbers (both arms)

| | Rage-setup ctl | Rage-setup arm | Sense-guard repro | Sense-guard fresh |
|---|---|---|---|---|
| Seeds | 8 (106001–106008) | 8 | 3 (104721/104722/104437) | 8 (104750–104757) |
| National | 0/8 | 0/8 | 0/3 | 0/8 |
| Table | null (not instrumented) | null | null | null |
| Wins | 0/8 | 0/8 | 0/3 | 0/8 |
| Wave-4 unlock | 8/8 | 8/8 | 3/3 | 8/8 |
| Wave-5 unlock | 6/8 | 5/8 | 1/3 | 3/8 |
| Median survival | 150d | 148.5d | 151d | 151d |

No full seat, no national, no wins on any leg of either arm. The
winnability wall stands: the launch decision and the flee are the
binding constraints, not the Rage setup turn and not the sense guard.

## Telemetry deviation check

Both arms' corpora are anchorCommit-stamped sweep recorder rows, so
`scripts/telemetry-check.js` REFUSES the compare by design (exit 2,
not a LOUD line — verified by the adoption worker against the
scale-wall baseline: "refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit"). No LOUD lines exist to
investigate; **no baseline roll**. (The timed-out run's "baseline
file absent" note was wrong about the file — the scale-wall baseline
exists in the goal workspace — but the outcome is the same: no
telemetry compare applies to recorder corpora.)

## Gate tally — `check.js --quick` on the rebased round tip

[GATE RESULTS TO FILL AFTER THE RUN — adjudicate every failure
individually; standing set: measurement-proof staleness pair,
phone-frame stale receipt, ladder-bundle control (ladderbase-cause-a
fix is on master — verify whether it still fires), 120s timeouts
under load, cache-flags load artifact (verify standalone/A-B before
calling it one).]

## Convergence tracker

Updated only this run's axis line plus the review note (re-read
immediately before writing; sibling loop may have written).

## Landing

Evidence-only landing: round branch built from current master
containing ONLY evidence files (checkout `evidence/` paths from the
arm tips + this file; no `src/js` changes — verified with `git log` /
`git show`). Rebased onto current local master; proof tests re-run on
the rebased tip before the ff-only merge. Merge commit: [TO FILL].

## Lock / claim note (adoption anomaly)

At adoption spawn the lock `fleshout-loop.lock` read
`fleshout-20261119T0115Z` (created 01:15:39Z), but by the time the
adoption's first heartbeat exec completed (~03:46Z) the lock read
`fleshout-20261119T0325Z` (created 03:25:38Z) — a new Loop A
occurrence had replaced it via stale-lock recovery while the 0115Z
adoption was running (arm heartbeats were ~50 min stale at the time).
No claim file, coordinator, or registry tree for 0325Z was ever
found; it most likely aborted on the 16/16 worktree cap and left a
stale lock. The 0115Z claim is retired to `.DEAD` by this adoption.
[LOCK DECISION TO FILL AT CLOSEOUT — re-check for any 0325Z
coordinator/claim/tree before touching the lock; delete only if
still no sign of life, as stale-lock recovery, and say so.]
