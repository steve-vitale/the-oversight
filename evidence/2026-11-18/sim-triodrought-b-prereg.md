# sim-triodrought-b — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-triodrought-b · **Loop B run:** fleshout-loop-b-20261118T0130Z
**Type:** BUILD + DIAG — restore the dawn-commit carry of the second companion
(finding #2518), then pilot it. **Frozen:** 2026-11-18 ~09:35 UTC (before the
pilot sweep; the proof test already ran — it proves the mechanism, it is not
a judged sim).
**Branch tip:** `sim-triodrought-b` (fix + proof test + analyzer committed
below this prereg).
**Base:** master `b30a6367b`.
**Builds on:** `evidence/2026-11-18/sim-launchparty-b.md` (finding #2518) and
its frozen corpora (`perseed-launchparty-b-{ctl,arm}/` on branch
`sim-launchparty-b`, tip `f5274f4d6` — read-only) plus the frozen allycap
corpora (band 103601–103608, `~/workspace/worktrees/sim-partysize-b/
evidence/2026-11-17/perseed-partysize-allycap-b-arm/`).

## Diagnosis (from the code + the frozen corpora — decided BEFORE the fix)

**The pick works. The pool is not empty. The commit drops the pick.**

1. **The pick** — `winPlanSecondCompanion` (`src/js/win-plan.js:699`) reads
   the Haven-idle pool: alive, not away, trust ≥ 15, at Haven, not engaged,
   not on expedition, not sick, range ≥ 1; no ranger-profile requirement
   (wider than the first companion's `findCompanion`, which demands a
   wanderer/explorer). Tiered: living wave-3+ killers, then armed, then rest.
2. **The pool on the LP band was NOT empty.** Reconstructing the second-pick
   pool from the frozen `companionPool` snapshots (first-pick eligibles +
   `notRanger` members, minus the ranked first pick — an UPPER bound, since
   sick/range are unrecorded): on the 6 wave-4 launches with a same-day dawn
   pool row, the upper bound was 1–4 on all 6; across all 45 pool rows it
   was ≥ 1 on 41. The "empty Haven-idle pool" hypothesis for #2518 is
   REFUTED on the frozen data.
3. **The pick FIRED on launch days — and the launch still went out as a
   pair.** Joining each of the 17 LP wave-4+ launches to its authorizing
   score row (same day, holder, and the commit part from the depart row):
   **16 of 17** launches had a `party_launch` candidate carrying
   `companion2` (ctl 10/10, arm 6/7) — and **all 16 departed with
   `companion2: null`, partySize 2**. 1 launch (arm 103905 d135) had a
   candidate with `companion2: null` — a genuine pick miss that dawn (pool
   upper bound 1: nora_wilson only; sick/range unrecorded, unresolvable
   from frozen data). 11 of the 17 launches executed from mid-day
   re-scores (commitPart 1–2: ctl 8, arm 3); the re-score re-picks the
   candidate and the same drop applies. (An earlier part-0-only join
   counted 5 candidate-c2-set launches; the analyzer's commit-part join
   below supersedes it — same conclusion, full coverage.)
4. **Root cause — `writeCommit` drops `companion2`.** The dawn candidate
   carries it; the lottery picks that candidate (win-plan override);
   `writeCommit` (`src/js/villager-brain.js:638`) copies `companion` into
   the stored commit but never copies `companion2` (or `companion3`).
   `vbrainExecuteDepart` reads `c.companion2` from the stored commit, gets
   `undefined`, and launches a pair. The score rows record the proof in one
   place: candidate `c2` set, stored `commit.c2` null, same row.
5. **It is a revert casualty, not an original gap.** Commit `656f4fc3b`
   (sim-producergate-b, 2026-11-15) added the carry
   (`companion2: chosen.companion2 || null` in `writeCommit`, plus the
   candidate-side pick and the execute launch). Commit `72a6efc99`, 41
   seconds later, reverted that arm wholesale ("killed arm leaves no
   trace") — including the carry. `sim-vetreengage-a` later re-added the
   candidate-side pick and the execute launch but never restored the
   serializer carry. The allycap band ran on `ff431b7cf` (descends from
   `656f4fc3b`, never took the revert): its stored commits carried
   `companion2`/`companion3`, and 10/12 wave-4 launches went out as trios
   or quads. The LP band ran on master lineage (`4e9fdda99`, post-revert):
   0/17. Same pick, same pool shape — the serializer is the difference.
6. **The existing proof test could not see it.** `scripts/
   test-vetreengage-a.js` §5d hand-builds the commit literal
   (`{companion2: 'v3'}`) and calls `vbrainExecuteDepart` directly — it
   never runs the scoring → `writeCommit` → commit → execute chain.
7. **Counter note:** `winPlanStats.partyTrios` is 0 on BOTH bands because
   only the win-plan depart path bumps it — and that path fired 0 times on
   the LP band (all 17 launches came via the brain path). Trio counts in
   this arm come from `v4departs` partySize / companion2, never from
   `partyTrios`. The win-plan depart path firing 0 times is recorded, not
   judged here.

## Fix shape (decided FROM the code, step 1)

**Restore the serializer carry in `writeCommit`** (`src/js/
villager-brain.js`, next to `companion:`):

```js
companion2: chosen.companion2 || null,
companion3: chosen.companion3 || null,
```

Exactly the lines `72a6efc99` removed (plus `companion3`, which the allycap
lineage also carried). NOT restored: producergate's `needsFull` /
`party_wait` gate (the vetreengage design deliberately launches the pair
when no second companion exists — "if nobody is free or launchable, the
pair still goes"); the old second-ranger pick (vetreengage's wider
`winPlanSecondCompanion` stands); any env flag. The carry is inert unless
a candidate sets the field: `companion2` is set only by the
VETREENGAGE-gated win-plan candidate, `companion3` is set by no candidate
in `src/js` on this tip (dead field until a quad candidate returns — the
partysize arm owns that, HELD, not touched here). No default changes; no
gate/behavior change for any other candidate kind.

## Primary metric (BINDING, §14)

**Trio-launch rate** = among wave-4+ launches (`v4departs`,
`result === 'launch'`, `targetWave >= 4`), the fraction with
`partySize >= 3` (holder + 2 companions; quads count).

**GO threshold:** arm trio rate ≥ 50% **AND** arm − ctl ≥ +30pp.
**Pool floor:** ≥ 6 wave-4+ launches per leg. Below the floor the pilot
is under-powered and the verdict is NO-GO (METRIC-BROKEN), never a pass
on a tiny pool.

Sizing: on the allycap band the same pick, with the carry present, went
out as trio-or-better on 10/12 launches (83%); on the LP band's 17
launches the candidate carried a second companion on 16 (94%). The
50% bar is below both; the +30pp gap is sized to the LP control's 0%.

## Secondary metrics (supporting, not binding)

- **Carry rate:** among launches whose authorizing score-row candidate
  carried `companion2`, the fraction whose depart row carries it. Expect
  arm 100%, ctl 0% — the mechanism check, not a second verdict.
- **Companion-slot fill at launch:** launched wave-4 companions per launch
  (partySize − 1, over launches). Reported, not judged.
- **Cost bar (GUARDRAIL, binding — sim-scalemetric):** starvation ≤ ctl+2
  on totals AND arm-only deaths; median survival ≥ 0.8× ctl median. A GO
  met with this breached is NO-GO (§14).
- **Instrument:** 0 instrument errors on all per-seed files.

## What this pilot does NOT judge

- The LP subset metric (launched-meeting arrival rate) — NOT re-judged
  here, per finding #2518. The launchparty sense fix is NOT on master and
  NOT in this arm; a confirm of that fix needs this fix + the sense fix
  together (coordinator call).
- `partyTrios` — broken counter for brain-path launches (§Diagnosis 7);
  reported only to confirm it stays 0 / is not the metric.
- The d135 genuine pick miss (sick/range) — one case, unresolvable from
  frozen data; if the pilot's carry rate is < 100% the analyzer names the
  residual, it does not overturn the primary.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (§10: reachability lever, waves 4–5 /
  national / table). Dead villages stop simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 104011, 104012, 104013, 104014,
  104015, 104016, 104017, 104018.** Freshness check (skill
  local_seed_band_freshness): `git grep -l -E "10401[1-8]"` over
  `evidence/**/*.md` — 0 hits for all eight. Rejected: 104031–104038
  (1 hit: `evidence/2026-11-01/journey-scale-r69.md`); 104001 (3 hits,
  single-seed probe). Note: `104012` appears as a PANTRY VALUE
  ("pantry=104012") in `hidden_files/evidence/2026-11-01/
  journey-succession-r94-analyzer.txt` — a kcal figure, not a seed
  naming; no prereg, forbidden list, or screen names any 104011–104018
  seed. Scope: all of `evidence/` (.md), not today only.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1`, `FIGHTALLY2` unset
  both legs (single-lever contrast, same as the launchparty pilot).
  **Ctl = base master (no fix); arm = base + the `writeCommit` carry.**
  No env difference between legs — the fix is code, the substrate is
  identical.
- **Instrument:** `scripts/triodrought-driver-b.js` (the launchparty
  recorder, adapted: same launch-funnel census — `v4departs` /
  `v4gates` / `v4encounters` with origin, `dawnbidScores` with candidate
  + stored commit, `companionPool` snapshots; the LAUNCHPARTY sense fix
  is absent so no sense leg runs); analyzer
  `scripts/analyze-triodrought-b.js` (with `--selftest`); per-seed
  JSONs under `evidence/2026-11-18/perseed-triodrought-b-{ctl,arm}/`.
  No panel builder in this run (panel = instrument, this prereg = judge;
  the launchparty panel already covers the sense leg).
- **PILOT ONLY.** No 12–16 seed confirm in this run; the coordinator
  decides the confirm from the pilot verdict.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate — the LP
   band (103901–103908, same substrate) yields 10 ctl / 7 arm wave-4+
   launches per 8 seeds by the same join. The pool (~7–10 launches/leg)
   is within an order of the GO bar's needs.
2. **Pool sizing:** see (1). The 6-launch floor guards the thin-pool case;
   a pool below it kills the pilot as METRIC-BROKEN.
3. **Mechanism pre-check (frozen, not a sim):** the analyzer's join
   (launch → depart row at commit part → candidate c2 vs depart c2) is
   verified against the frozen LP corpora BEFORE the pilot runs
   (analyzer `--selftest` + a frozen-corpus dry run): it must reproduce
   the §Diagnosis numbers — 17 launches, 16 candidate-c2-set, 16
   dropped, 1 genuine pick miss, 0 unjoined, pool-floor and cost numbers
   identical to the LP evidence (starvation 11/9, medians 124.5d/150d).
   (Pre-pilot correction, 2026-11-18 ~09:45 UTC: the §Diagnosis counts
   above were refined from a part-0-only join — 5 candidate-c2-set — to
   the analyzer's commit-part join — 16. Same conclusion, full coverage;
   no judged sim had run.)
