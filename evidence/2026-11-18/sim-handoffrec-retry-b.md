# sim-handoffrec-retry-b — EVIDENCE (DIAG GO)

**Arm:** sim-handoffrec-retry-b · **Loop B run:** fleshout-loop-b-20261118T1330Z · **Axis:** winnability chain
**Type:** RECORDER RE-RUN (finding #2510 / #2536 follow-up to sim-handoffrec-a).
No game change lands from this arm. No `src/` change at any point.
**Branch:** `sim-handoffrec-retry-b` · **Worktree:** `~/workspace/worktrees/sim-handoffrec-retry-b`
**Base at arm start:** `8709e9f87` · **Prereg:** `evidence/2026-11-18/sim-handoffrec-retry-b-prereg.md` (frozen before the sweep; precondition probes only before it).
**Policy:** competent verbatim (`scripts/policies/competent.js`), sha256
`df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
**Band:** seeds 103411–103418 (8 seeds, the selblock/profilegate STAGING band, deliberately reused) · **Horizon:** 150d death-aware.
**Flags:** `VETREENGAGE=1 PROFILEGATE=1` — the frozen ON leg's flags, verbatim.
**Verdict: DIAG GO** — the unknowns are closed on a band that stages the contact: 5/5 selections classified, unknown 0, 3 backed by mid-day pool rows; frozen reproduction exact; recorder fires 100%; D1/D2 green; proof test 33/33.

## The question (finding #2510 / #2536)

sim-handoff-diag-a classified 79 range-0-holder blocked selections on
the frozen profilegate-b ON corpus: 28 handoff-available (35%), 47
walker-exists-but-unavailable, 0 no-walker-in-village, and **4
unknown** — giulia_bianchi day 68, yuki_mori days 71–72, visjoin_59
day 77. The unknowns were a recorder gap: no `companionPool` row on
or before the day, because the holder never scored at dawn as a wave-4
holder on/before that day (all four were mid-day commits, and pool
rows were dawn-only). sim-handoffrec-a built the fix (pool rows on
every scored call, any part + the (day, part) join) and proved the
recorder, but its fresh band staged zero selections, so bar 1 failed
and the arm went NO-GO. This arm re-runs the classification on the
staging band to close the unknowns.

## Before / after (identical seeds, quoted from the frozen profilegate-b analysis)

| Metric | OFF (control) | ON (PROFILEGATE=1) |
| --- | --- | --- |
| Scored dawns / empty | 87 / 81 (0.931) | 99 / 3 (0.0303) |
| Mean eligible / dawn | 0.08 | 2.98 |
| Launched instances (any-commit) | 3 | 7 |
| **Selected-blocked instances** | **0** | **12** |
| Wave-4+ launch events (secondary) | 8 | 38 |
| Median survival (gameDays) | 147.5 | 116.5 |
| National standing / rank / table / wins | 1 / 0 / 0 / 0 | 1 / 0 / 0 / 0 |

Not re-measured here: this is a DIAG over a re-run corpus, and the
frozen numbers stand as quoted. The re-run band's own numbers are in
"Wall numbers" below.

## Precondition probe (before the prereg)

The selblock band does NOT stage the frozen 79 on current master —
two of its three frozen stagers stage zero (103414: funnel runs,
36 v4seeds, 0 range-0 selections; 103413: the wave-4 funnel never
starts, 0 v4seeds). But the band still stages the contact through
seed 103418 (5 selections, 3 mid-day-backed), so the precondition
HOLDS and the full-band sweep was justified. Cause of the shrinkage:
the profilegate-b widened companion gate was REVERTED (`0da095c78`,
2026-11-17) — `PROFILEGATE=1` is inert in the two `findCompanion`
twins on current master, so the game runs OFF-leg companion behavior
(ranger-only pick) plus the profilegate-a agencyTick bypass. The
handoffrec-a prereg's "PROFILEGATE bypass is landed" claim was wrong
about the widened gate (the revert is an ancestor of its base too),
which explains its fresh band staging zero. The 5 selections here
stage through the OFF-leg path: a ranger companion is picked
(visjoin_124, wanderer) while the homebody holder cannot walk.

## Results — frozen bars

| Bar | Result | Detail |
| --- | --- | --- |
| 1. Unknowns closed: unknown = 0 AND ≥1 mid-day-backed selection | **PASS** | unknown = 0 across 5 selections; **3 backed by mid-day pool rows (part 1)** — the previously-unknown shape, now classified |
| 2. Classification agreement + frozen reproduction exact | **PASS** | Updated analyzer on the frozen ON corpus reproduces `handoff-a-analysis.json` exactly: 79 selections, per-instance 1+8+28+24+5+10+3, tally 28/0/47/4, same 4 unknowns, same named walkers |
| 3. Recorder fires 100% | **PASS** | Pool row for 100% of wave-4 scored calls (231/231, same vid/day/part); pool row on/before 100% of wave-4-target holder depart days (45/45); zero pool-path instrument errors |
| D1 repeatability | GREEN | Seed 103414 run twice, files identical except the run label |
| D2 wrap neutrality | GREEN | ON vs REC fingerprints identical on all 8 seeds |
| Proof test | **33 passed, 0 failed** | `scripts/test-handoffrec-retry-b.js` (static + fixtures + frozen + staging corpus) |

### Per-selection classification table (staging band — all 5)

All five are one instance: seed 103418, holder **visjoin_120
[homebody]**, target **herald**, picked companion visjoin_124
[wanderer]. Named walker on every selection: **ines_duarte
[forager]** (vetW3 0 / vetW4 0, never the picked companion). A second
available walker stands on every row: visjoin_124 itself (wanderer,
vet 0/0) — the picked companion is available too, but the ranked
order names ines_duarte first. Pool-row gap 0 on all five (same-day
rows); stale-face-value share 1 (5/5); verdicts resting on
possibly-holding walkers 0.

| Seed | Day | Holder [profile] | Target | Commit | Pool row (day/part) | Named walker [profile] | Bucket |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 103418 | d130 | visjoin_120 [homebody] | herald | mid-day part-1 | d130 / part 1 | ines_duarte [forager] | handoff-available |
| 103418 | d131 | visjoin_120 [homebody] | herald | mid-day part-1 | d131 / part 1 | ines_duarte [forager] | handoff-available |
| 103418 | d132 | visjoin_120 [homebody] | herald | mid-day part-1 | d132 / part 1 | ines_duarte [forager] | handoff-available |
| 103418 | d133 | visjoin_120 [homebody] | herald | dawn | d133 / part 0 | ines_duarte [forager] | handoff-available |
| 103418 | d134 | visjoin_120 [homebody] | herald | dawn | d134 / part 0 | ines_duarte [forager] | handoff-available |

The three mid-day-backed selections (d130–132) are exactly the shape
the four frozen unknowns had — a mid-day `party_launch` commit with
no dawn pool row — and the fixed recorder catches them: the pool row
comes from the holder's own mid-day scoring call, part 1, with both
walkers at Haven, free, and eligible. The frozen unknowns are closed
as a class, demonstrated on live selections, not just fixtures.

### Per-bucket totals (staging band vs frozen)

| Bucket | Staging (103411–103418, current master) | Frozen (103411–103418, profilegate-b ON) |
| --- | --- | --- |
| handoff-available | 5 (100%) | 28 (35%) |
| no-walker-in-village | 0 | 0 |
| walker-exists-but-unavailable | 0 | 47 |
| unknown | 0 | 4 |
| **Total** | **5** | **79** |

Veteran split: 0 named walkers with vetW4 > 0 (staging) vs 0
(frozen). Picked-companion-is-named split: 0 (staging) vs 18
(frozen). The 100% share is a 5/5 on ONE instance, not a band
estimate — it says the recorder closed the unknowns on the selections
that exist, not that hand-off is now always available. The frozen
35% share stands as the band estimate under the widened gate; under
the reverted gate the band stages too little to re-estimate it.

### Recorder firing-rate table (bar 3)

| Check | Result |
| --- | --- |
| Pool row for every wave-4 scored call (same vid/day/part) | 231/231 (100%) |
| Pool row on/before every wave-4-target holder depart day | 45/45 (100%) |
| Pool-path instrument errors (`profilegate-replica-null` / `profilegate-log`) | 0 |

### What the rest of the band did (instance census, for context)

18 wave-4 plan instances opened across the 8 seeds; 25 selections
total. Resolutions: **launched 12**, inviter-range-0 5 (all 103418),
inviter-sick 3 (sofia_chen on 103412, d88–90 — a holder too sick to
depart three mornings running), companion-not-started:sick 1
(103412 d91), danger-gate 2 (103418 d135; 103412 d96), night 2
(103416 sofia_chen, d51/d73). Three villages lost (103411 d107,
103412 d112, 103415 d144); five survived to 150d. Seed 103413 opened
no instance at all — no wave-4 plan ever seeded there on current
master, where the frozen corpus had 9 blocked selections.

## Proof test

`scripts/test-handoffrec-retry-b.js` (ON + REC dirs + D1 files):
**33 passed, 0 failed, 0 skipped**. Static (src/ untouched, driver
pool emission not gated on part 0, staging-band names), join fixtures
J1–J6 + J6-control, frozen reproduction R0–R6 (exact), staging-corpus
checks F0–F9 (bar 1, bar 2, bar 3a–c, D1, D2). One service restart
mid-run killed the first REC invocation after 5/8 seeds (files
intact); the remaining 3 seeds were re-run into the same dir and the
proof test ran clean on the completed 8 — no write-flap EPERM struck
this run.

## Wall numbers (staging band, current master)

national 0/8, nationalRank 0/8, table 0, wins 0, wave4 8/8, wave5
0/8, median survival 150.5d, per-seed game days [106, 112, 151, 151,
145, 151, 151, 150]. Standing per seed: 199 on six seeds, 195 on
103418, 150 on 103414 — six villages sit one point short of national
(200) at the end of the horizon. The wall did not move: national
reached 0/8 here against 1/8 on the frozen band, rank never follows,
table 0, wins 0. The binding stage this arm touches — the blocked
selection — is now measured on current master, and it is rarer than
under the widened gate (5 vs 79) but still real: one village in eight
held a plan its holder could not walk, with two walkers standing by.

## Village assessment (plain words)

Seed 103418 is the village that stages the question. visjoin_120, a
homebody, holds a plan to kill the Herald. For five mornings — d130
to d134 — they bid for a companion at dawn or mid-day, visjoin_124
the wanderer is picked, and the morning ends the same way: the holder
cannot leave Haven, so nobody leaves. Standing at Haven every one of
those mornings, free and able to walk, are ines_duarte the forager
and visjoin_124 themselves. Nobody hands the plan on. Meanwhile the
holder is falling apart: health 58, 71, 48, 94, then 16 on d134 — and
on d135, the morning the danger gate fires instead, visjoin_120 dies
of a wound that would not close. The plan dies with them; there is no
census row for visjoin_120 after d135. visjoin_124, the picked
companion who also held their own plan against the Eater, dies of a
wound two weeks later (d149). The village does not lack walkers or
plans. It lacks anyone — person or System — noticing that the holder
cannot walk and doing something about it, even as the holder dies
holding the plan. The other villages show the honest gates working:
sofia_chen on 103412 is too sick to depart three mornings (d88–90)
and the game rightly holds her; sofia_chen on 103416 launches six
times. The range-0 block is the only one that repeats unchanged
while the holder dies.

## Sense-testing (SENSE-TESTING LAW)

Read the transcripts. On seed 103418, days 125–140, the `vetSays`
stream talks about identifying European Elder and teaching it
("Arturo taught everyone about European Elder") — and **not one line
says visjoin_120's picked party stayed home, or why, or that anyone
took the plan over**. Zero lines mention visjoin_120, ines_duarte,
visjoin_124, or the Herald across the whole corpus. The blocked
mornings are silent in the fiction, exactly as selblock-a found
across 113 broken selections — and now measured on the hand-off
occasion itself: the moment a walker could have taken the plan is
also the moment nobody says anything. Finding #2499 (the picked
homebody gets no fiction line) extends to the hand-off: when a plan
could change hands, the fiction needs a line that says it did — or
that it did not, and why.

## Metric review

- **The frozen bars held as written; no re-scoring.** Bar 1's ≥1
  clause did the job it was written for in handoffrec-a — this time
  it is satisfied by live selections (3 mid-day-backed), not
  vacuously. Without it, a 0/0 band would have passed; with it, the
  arm had to stage the contact, and did.
- **Small-n honesty.** Five selections on one instance is enough to
  close the recorder gap (every selection carried a backing row, and
  the mid-day shape is demonstrated three times over), but it is not
  enough to re-estimate the hand-off share. The 100% available share
  must not be quoted as "hand-off is always available now" — it is
  5/5 on one holder, one target, one village. The frozen 35% remains
  the share estimate under the widened gate; under the reverted gate
  the contact is too rare to estimate.
- **The band drifted under the arm.** The staging band is the same
  eight seeds, but current master is not the frozen game: the gate
  revert removed the mechanism that staged 79 selections, and two
  frozen stagers now stage zero. The prereg recorded this before the
  sweep, and the verdict judges the recorder on what the band stages
  — which is the honest reading. A future arm that wants a fresh
  share estimate needs a substrate that stages volume again (the
  widened gate re-applied as an instrument, or a band searched for
  the OFF-leg path), and that is a coordinator call, not this arm's.
- **D1/D2 at 150d exercise the recorder this time** (unlike the 60d
  D-checks in selblock-a): the D1 seed 103414 carries live wave-4
  scoring (61 score rows, 6 pool rows), and the ON/REC fingerprints
  match on all 8 seeds including the three village-lost seeds.
- **No re-run, no lever, no panel — by design.** Same as the diag
  arm: the corpus carries the state, D2 is the neutrality proof, and
  the before/after numbers are quoted frozen.

## Convergence state

scale-onramp: **converging** (not converged). The #2510 recorder gap
is now closed as an instrument AND demonstrated on a staging band
(unknown 0, mid-day-backed 3/5) — the classification-closure
demonstration handoffrec-a owed is done. What remains is the DESIGN
call the diag arm filed: stop range-0 holders from bidding (or from
holding wave-4 plans), or hand a range-0 holder's plan to a walker —
plus a fiction line when a picked party stays home (extends #2499 to
the hand-off occasion). That call belongs to Steve / the coordinator,
not to a recorder arm.

## Finding #2510 / #2536 — claim for the coordinator

**#2510 CLOSED (DIAG GO).** The 4 unknown hand-off classifications
are closed: the fixed recorder (pool rows on every scored call, any
part + (day, part) join) classifies every range-0-holder blocked
selection on the staging band, including 3 mid-day-backed selections
in exactly the frozen-unknown shape. All 5 staging-band selections
are handoff-available (named walker ines_duarte, forager; picked
companion visjoin_124, wanderer, also available). Next lever (a
design call, not this arm): hand-off rule + fiction line, per the
diag arm's filing. **Coordinator note:** this branch carries the
same recorder + join as the HELD sim-handoffrec-a branch
(`c450bae63`) under retry-b names, now proven on a staging band —
landing this branch supersedes handoffrec-a; the HELD branch can be
closed as superseded rather than merged separately.

## Disposition: DIAG GO — nothing to revert

No src/ change was made at any point (verified: `git diff` vs base
empty for src/; proof test static checks). No lever was re-applied.
Commits are instrument + evidence only: prereg + recorder re-run
instrument (`52c21de71`), plus this evidence, the analysis, and the
ON corpus (to be committed by this run's closeout). Net src/ diff vs
base: zero.

## Files

- Prereg: `evidence/2026-11-18/sim-handoffrec-retry-b-prereg.md`
- Evidence: `evidence/2026-11-18/sim-handoffrec-retry-b.md` (this file)
- Analysis: `evidence/2026-11-18/handoffrec-retry-b-analysis.json`
- Proof test: `scripts/test-handoffrec-retry-b.js` (33/33 green)
- Driver: `scripts/handoffrec-driver-20261118.js`
- Analyzer: `scripts/analyze-handoff-a.js` ((day, part) join)
- Corpus: `evidence/2026-11-18/perseed-handoffrec-retry-b-on/` (8 files)
- D-check scratch legs (`perseed-handoffrec-retry-b-rec`, `d1-handoffrec-retry-b`): compared and deleted, not committed.
