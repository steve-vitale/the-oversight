# sim-handoffrec-retry-b — PREREG (frozen before any sweep)

**Arm:** sim-handoffrec-retry-b · **Loop B run:** fleshout-loop-b-20261118T1330Z · **Axis:** winnability chain
**Type:** RECORDER RE-RUN (finding #2510 / #2536 follow-up to sim-handoffrec-a).
No game change lands from this arm. No `src/` change at any point.
**Branch:** `sim-handoffrec-retry-b` · **Worktree:** `~/workspace/worktrees/sim-handoffrec-retry-b`
**Base at arm start:** `8709e9f87` (worktree HEAD).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
— verified against the file in this tree before writing this prereg.
**Band:** seeds 103411–103418 (8 seeds) — the selblock/profilegate STAGING band, deliberately reused (see "Band" below). **Horizon:** 150d death-aware.
**Flags:** `VETREENGAGE=1 PROFILEGATE=1` — the frozen ON leg's flags, verbatim.
**Prereg frozen:** before any sweep in this arm (precondition probes only before this line; their numbers are recorded below, not judged).

## The question (finding #2510, backlog #2536)

sim-handoff-diag-a classified 79 range-0-holder blocked selections on
the frozen profilegate-b ON corpus (band 103411–103418): 28
handoff-available (35%), 47 walker-exists-but-unavailable, 0
no-walker-in-village, and **4 unknown** — giulia_bianchi day 68,
yuki_mori days 71–72, visjoin_59 day 77. The unknowns are a recorder
gap, not a village fact: there was no `companionPool` row on or before
the day, because the holder never scored at dawn as a wave-4 holder
on/before that day. All four unknowns are mid-day commits (part 1/2),
and the pool-row emission was gated on dawn only (`dayPart === 0`).
sim-handoffrec-a built the fix (pool rows on EVERY scored call for a
wave-4 holder, any part + the (day, part) join) and proved the recorder
(bars 2–3 PASS, frozen reproduction exact, firing 100%), but its fresh
band 103541–103548 staged **zero** range-0-holder blocked selections,
so bar 1's ≥1 clause failed and the arm went NO-GO with the recorder
proven and HELD. This arm re-runs the classification on a band that
stages the contact — the selblock band — to close the unknowns.
The recorder and the join are reused UNCHANGED from sim-handoffrec-a
(branch `sim-handoffrec-a`, commit `c450bae63`); only names
(`handoffrec-retry-b` / `perseed-handoffrec-retry-b-<leg>`) change.

## Band (deliberately reused, not fresh)

**Chosen band: 103411–103418** — the profilegate-b ON band, where the
frozen corpus holds 79 selections. Freshness is NOT the criterion here:
the task is to stage the contact, and this is the known stager. The
band's prior use (profilegate-b, selblock-a, handoff-diag-a) is the
point, not a contamination risk — the arm re-runs the classification
on current master, and any drift from the frozen numbers is itself a
result (see "Gate-revert note"). No forbidden/contaminated list names
this band as forbidden for a re-run; the seed-band freshness rule
governs NEW verdicts on new levers, not a recorder re-run on its own
staging band.

## Precondition probe (run BEFORE this prereg; the precondition is verified, not assumed)

Probed with the retry-b driver (`VETREENGAGE=1 PROFILEGATE=1 MODE=on`,
150d, `RUN=handoffrec-retry-b`, scratch OUTDIR, deleted after):

| Seed | Frozen selections | Probe result on current master |
| --- | --- | --- |
| 103414 | 57 (28 giulia + 24 visjoin_73 + 5 visjoin_85) | **0** range-0 selections (v4seeds 36, dawnbidScores 61 — funnel runs, no range-0 block) |
| 103413 | 9 (1 naran + 8 omar) | **0** (v4seeds 0, dawnbidScores 0 — the wave-4 funnel never starts) |
| 103418 | 13 (10 yuki + 3 visjoin_59) | **5** range-0 selections, all `handoff-available`, unknown 0; **3 of 5 backed by mid-day pool rows (part 1, commitKind mid-day part-1)**; named walker ines_duarte (forager), never the picked companion (visjoin_124) |

**Precondition HOLDS:** the band stages ≥1 range-0-holder blocked
selection on current master (5 on seed 103418), including the
previously-unknown shape (mid-day-backed). The full-band sweep is
therefore justified. The probe also shows the band is NOT the frozen
band any more: two of its three frozen stagers stage zero now (see
"Gate-revert note") — the full-band total will be small (order 5, not
79), and the verdict judges the recorder on whatever the band stages.

## Gate-revert note (measured on this base, corrects the handoffrec-a prereg)

The handoffrec-a prereg claimed "the PROFILEGATE bypass is landed in
this base". That is WRONG about the widened companion gate: commit
`0da095c78` (2026-11-17) reverted the profilegate-b widening — the
`profilegateOn()` twins in `src/js/villager-brain.js` and
`src/js/win-plan.js` are gone, and `PROFILEGATE=1` is inert in the
companion pick on current master (verified: `grep PROFILEGATE src/js/`
returns only `src/js/villager-agency.js:383`, the profilegate-a
agencyTick bypass, which IS still landed). The revert is an ancestor
of BOTH the handoffrec-a base (`90f77c406`) and this base, so
handoffrec-a's ON leg also ran OFF-leg companion behavior (ranger-only
pick) — which explains its fresh band staging zero selections, on top
of band variance. The frozen OFF leg staged 0 selected-blocked on
this band, so the 5 selections probed on 103418 are above the OFF
baseline: a range-0 holder CAN still bid when a ranger companion is
available, and the depart gate still refuses the holder. The driver
side keeps reading `PROFILEGATE=1` in `poolReplica` (skips the
notRanger first-fail), so pool-row `counts.eligible` overstates
eligibility relative to the game — a known replica/game mismatch,
recorded here; it does NOT corrupt the classification, which judges
walkers on profile/node/away/engaged/onExped from the row members,
not on the replica's eligible flag, and reads the picked companion
off the depart row.

## Recorder + analyzer (reused, unchanged)

- **Driver:** `scripts/handoffrec-driver-20261118.js` — the
  handoffrec-a driver verbatim except names (`handoffrec-retry-b` /
  `perseed-handoffrec-retry-b-<leg>` / `RUN` default) and the header
  NOTE above. Pool rows on every scored call for a wave-4 holder,
  any part, recording the actual part. Depart wrap untouched.
- **Analyzer:** `scripts/analyze-handoff-a.js` — the handoffrec-a
  version (frozen (day, part) join + `ARM_LABEL`
  `sim-handoffrec-retry-b` for expectMode `none`). Classification rule
  UNCHANGED from the diag arm's Correction 1 + Correction 2.
- **Proof test:** `scripts/test-handoffrec-retry-b.js` — the
  handoffrec-a proof test with band 103411–103418, D1 seed 103414,
  prereg path and driver names updated. Static + join fixtures + frozen
  reproduction identical in shape.

## Canon read

- `docs/CANON.md` (manifest), `docs/MONSTER-WAVES.md` (wave law),
  `docs/PARTY.md` (party unlock day 7, cap 3→4→5; travelling parties
  stay together), `docs/VILLAGER-BRAIN.md` (one brain, one scorer;
  departure honors the dawn commitment; range is a consideration
  input, hard shelter rules zero departure candidates).
- **Canon gap, recorded not invented (same as the diag arm):** no canon
  doc covers expedition companion eligibility, the depart-gate block
  reasons, plan hand-off, or what a range-0 holder may do with a
  plan. The block reasons are grounded in the recorder code
  (`deriveLaunchBlock`: `sick` / `range-0` (`npcMaxDist < 1`) /
  `hurt-no-medicine-no-healer`) and in
  `src/js/villager-agency.js:349-352` (`npcMaxDist`: explorer 6,
  wanderer 3, forager 1, homebody 0). This arm measures whether the
  recorder closes the unknowns; it does not invent hand-off fiction
  or a hand-off rule.

## Fixture note (Steve 2026-11-13 encounter-gear rule)

This is a recorder + classification arm: no combat fixture is staged
and no verdict turns on whether a fight is beatable, so no gear/party
fixture is invented. The sims run the competent policy verbatim on
the staging band — the same policy, flags, horizon, and driver
lineage as the frozen ON corpus — so the classification measures
whatever selections current master produces on that band.

## Instrument

- **Legs:** ON (`VETREENGAGE=1 PROFILEGATE=1 MODE=on`, 8 seeds, 150d,
  OUTDIR `perseed-handoffrec-retry-b-on`) is the judged leg. REC
  (`VETREENGAGE=1 PROFILEGATE=1 HANDOFFREC_RECORDER=off MODE=rec`,
  OUTDIR `perseed-handoffrec-retry-b-rec`) is the D2 determinism leg.
  D-check legs are compared and deleted, not committed (selblock-a /
  profilegate-b / handoffrec-a precedent).
- **Analyzer:** `scripts/analyze-handoff-a.js` — run on the new ON
  corpus with expectMode `none`, writes
  `evidence/2026-11-18/handoffrec-retry-b-analysis.json` with
  `arm: 'sim-handoffrec-retry-b'`.
- **Proof test:** `scripts/test-handoffrec-retry-b.js` — frozen-corpus
  reproduction (updated analyzer on `perseed-profilegate-b-on`
  reproduces `handoff-a-analysis.json` exactly), synthetic (day,
  part) join fixtures, recorder firing-rate checks on the staging
  corpus, D1/D2 checks.

## Primary metric (frozen)

**Unknown hand-off classifications on the staging band** (selections
whose bucket is `unknown` under the frozen diag rule, counted over
all range-0-holder blocked selections enumerated from the staging ON
corpus). The metric judges the RECORDER, not the game: 0 unknowns
means every selection now carries a backing row.

## GO bars (frozen — a miss is NO-GO, never re-scored)

**GO** iff ALL of:
1. **Unknowns closed:** unknown = 0 across all enumerated
   range-0-holder blocked selections on the staging band, **AND ≥1
   enumerated selection is backed by a mid-day pool row (part 1
   or 2)** — the previously-unknown shape, now classified with a
   backing row. The ≥1 clause stops a vacuous 0/0 from passing as a
   closure (the handoffrec-a failure mode). The probe already shows
   3 mid-day-backed selections on seed 103418; the bar is judged on
   the full-band sweep, not the probe.
2. **Classification agreement maintained:** every selection with a
   backing row is classified into a named bucket (no analyzer-side
   unknown beyond the frozen rule), **AND** the updated analyzer
   run on the frozen ON corpus reproduces
   `evidence/2026-11-17/handoff-a-analysis.json` exactly (79
   selections, per-instance 1+8+28+24+5+10+3, tally 28/0/47/4,
   same 4 unknowns, same named walkers) — the join change must be
   a no-op on dawn-only rows.
3. **Recorder fires on 100% of scored calls / departs:** for every
   `dawnbidScores` row with a wave-4 plan in the staging ON corpus,
   a `companionPool` row exists with the same (seed, vid, day,
   part); **AND** every `dawnbidDeparts` row for a wave-4 holder
   has a pool row on or before its day; **AND** zero pool-path
   instrument errors (`profilegate-replica-null` /
   `profilegate-log` absent from `instrumentErrors` on the ON leg).

**D-checks (frozen, part of bar 3's proof):**
- **D1 repeatability:** seed 103414, 150d, recorder ON,
  `VETREENGAGE=1 PROFILEGATE=1`, run twice; output files identical
  except the `run` label.
- **D2 wrap neutrality (full-band):** recorder ON vs recorder OFF,
  both `PROFILEGATE=1`, all 8 seeds, 150d; 0 divergences on the
  daily fingerprints (days/gameDays/standing/maxWave/death-count/
  endReason/pantry + waveKillLog length + vetsW4 killers + roster).
  The recorder is pure reads by construction; D2 proves it.
- **Proof test green:** `scripts/test-handoffrec-retry-b.js` passes all
  checks.

A miss on any bar is NO-GO. The verdict judges the RECORDER +
CLASSIFICATION, not the game.

## Panel (§15 — where it applies)

No balance panel: this is a recorder re-run, not a lever — there is
no game change and therefore no before/after game state to compare
through `scripts/balance-panel.js` (the panel compares game outcomes
across two game roots; both roots here are the same `src/`). The
applicable neutrality proof is D2 (ON vs recorder-OFF corpora, same
band/seeds/flags). The before/after numbers in the evidence are the
profilegate-b OFF vs ON numbers quoted from its frozen analysis, not
re-measured here (same as the diag arm).

## Horizon (why 150d death-aware, same as profilegate-b / diag / handoffrec-a)

The instances being classified ARE wave-4 plan selections, which
only exist on a reachability horizon (§10: 150–200d). Any other
horizon would re-define the instance set and break comparability
with the frozen analysis. Death-aware: dead villages stop
simulating (+10d tail max), per MEASUREMENT.md §§9–12 — the same
rule profilegate-b used.

## What the evidence must contain

- Before/after numbers on identical seeds (quoted from the frozen
  profilegate-b analysis: OFF vs ON funnel buckets, pool fill, launches).
- Per-selection classification table on the staging band: seed / day /
  holder [profile] / target / picked companion [profile] / named
  walker [profile, vetW3/vetW4] / bucket / why (per-walker
  first-failing checks where unavailable) / backing row (day + part).
  All selections, no exceptions.
- The mid-day-backed selection(s) named explicitly (bar 1's ≥1 clause).
- Recorder firing-rate table (bar 3): score rows with wave-4 plans vs
  pool rows matched, depart rows vs pool rows on/before, pool-path
  instrument errors.
- D1/D2 tables.
- Per-bucket totals with the mechanism each names, in plain words,
  plus the veteran split and the picked-companion vs other-walker
  split, and the staging-band share vs the frozen 35%.
- Village assessment in plain words (what the village looked like on
  a blocked morning).
- Sense-testing note (transcripts: does anything say a plan was
  handed on, or a walker took over? Extends finding #2499).
- Metric review section.
- Wall numbers on the staging band (national/table/wins, wave 4–5
  unlocks, median survival).
- Convergence state line (`converging | converged | parked |
  killed-at-pilot`) for the scale-onramp axis.
- The #2510/#2536 follow-up claim for the coordinator to file; this
  arm does NOT edit `hidden_files/sim-findings.md` (outside the repo).

## Disposition

RECORDER arm: nothing to revert in `src/` at the end (net `src/` diff
vs base: zero — no `src/` change is made at any point). Commits are
instrument + evidence only: this prereg,
`scripts/handoffrec-driver-20261118.js`,
`scripts/analyze-handoff-a.js` (join update),
`scripts/test-handoffrec-retry-b.js`,
`evidence/2026-11-18/sim-handoffrec-retry-b.md`,
`evidence/2026-11-18/handoffrec-retry-b-analysis.json`, and the new ON
corpus `evidence/2026-11-18/perseed-handoffrec-retry-b-on/` (8 files).
D-check scratch legs are compared and deleted, not committed. Do NOT
push, do NOT bump, do NOT merge — the coordinator lands the work.
