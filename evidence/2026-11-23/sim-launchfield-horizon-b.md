# sim-launchfield-horizon-b — horizon-exclusion re-judge (Loop B 0030Z adoption)

**Verdict: DIAG-NO-GO on completeness.** Pilot band DIAG-GO on every bar;
confirm band fails completeness by exactly **one instance-day** (four parts,
one villager, the final day, with zero holder-state rows village-wide that
day). Reproduction and instrument pass on both bands. No re-score: the frozen
bar is 0 unknown instance-days AND 0 unexplained Leg S parts on BOTH bands.

**Run:** `fleshout-loop-b-20261123T0030Z`, arm `sim-launchfield-horizon-b`.
**Base (frozen):** `4e805681a050f22672d479cf5e02b0d5700eb2c7`. Instrument-only
arm: zero `src/js` changes (verified by the proof test §1: `src/js` identical
between the frozen base and HEAD). **Pilot:** 8 fresh seeds 107439–107446.
**Confirm:** 8 fresh seeds 107447–107454, run only because the pilot GOed on
every bar. Substrate (both bands): `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1
FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`, competent verbatim
(policy sha `1884c8852d38`), 150d death-aware, MODE=vre, recorder ON.

## What this arm re-judges

The launchfield-rejudge-b arm judged DIAG-NO-GO on completeness by exactly
one part (107420 thabo_maseko/reunion d150 p3 `no-rows`) out of 1424. This arm
carries the frozen judgment fix (choice (a)): a final-part (day == the run's
final day, part == 3) `no-rows` part reclassifies `horizon-truncated` —
excluded from unexplained, counted separately — IFF at least one holder-state
row for the vid exists that day. No row that day = stays `no-rows`
(UNEXPLAINED). The question is whether completeness closes under that clause.

## Frozen-bar table

| Bar | Pilot 107439–107446 | Confirm 107447–107454 | Verdict |
| --- | --- | --- | --- |
| (a) Completeness: 0 unknown instance-days AND 0 unexplained Leg S parts (horizon-truncated excluded/counted) | unknown **0**, unexplained parts **0** (horizonTruncated 0) | unknown **1**, unexplained parts **4** (horizonTruncated 0) | Pilot PASS, confirm **FAIL** |
| (b) Leg R reproduces the 10 launcheng unknown days exactly | exact, 10/10 | exact, 10/10 | PASS both |
| (c) Instrument: proof green, analyzer selftest green, 8/8 files parse, 0 instrument errors, substrate assertions | proof 53/53, selftest 71/71, 8/8, 0 errors, substrate clean | same instrument, 8/8, 0 errors, substrate clean | PASS both |
| (d) Field-encounter fire count — REPORTED, not gating | day-level 2, part-level 0 | day-level 1, part-level 0 | reported |

**Overall: DIAG-NO-GO.** The confirm band's single failing instance-day is
described in full below; it is the same horizon shape as the re-judge's one
part, one step further out.

## Pilot band (107439–107446) — DIAG-GO

- Files 8, errors 0, anchor `4e805681a050` on every file, policy
  `1884c8852d38`, all 7 flags `1`, `allyslot3InSrc: true`.
- Instances 23 (candidate-not-bid 7, churn 3), instance-days 57, assessed
  days 35 (dawn 24, midday-only 11), assessed rows 35, zero-row days 22.
- Unknown instance-days **0** (B-unknown 3, H-explained 3, H-skip 0).
  Assessed-day reasons: party-no-companion 33,
  hunt-standing-table-no-companion-silent 2. Zero-row reasons:
  field-encounter-day 2, seed-day 6, holder-off-haven 3, unknown-no-signal 3
  (all H-explained), holder-on-expedition 4, holder-dead 1,
  plan-not-in-census 2, retarget-boundary 1. hTally: hs-gate-pick 3.
  Mechanism DENIED.
- Leg S: parts 268, scored 41, explained-not-scored 227, **unexplained 0**,
  horizonTruncated **0** (the clause never fired — no final-part no-rows part
  needed it). whyNot: retargeted 20, chore-live 82, dead 5, seed-day 24,
  on-expedition 15, gate-pick 30, away 32, engaged 3, refresh-blocked 8,
  plan-deleted 8, scored 41.
- Launches counted 37, wave-4-target 27, uncounted 0, no-start-call 0,
  no-copy-link 0, first fights 6.
- Wall: wins 0, nationalRank 0, nationalStanding 3, table 0, wave4 8/8,
  wave5 3/8, medianDays 150, survived 4 by gameDays ≥ 150 (driver log: 5
  seeds ran the full 150d — 107443 stamps gameDays 149, see the footnote),
  deaths 812, starvation 1, standing199 3.
- Seeds: 107439 survived 150d; 107440 village-lost d125; 107441 village-lost
  d134; 107442/107443/107444/107445 survived 150d; 107446 village-lost d112.

## Confirm band (107447–107454) — completeness FAIL

- Files 8, errors 0, anchor `4e805681a050` on every file, policy
  `1884c8852d38`, all 7 flags `1`, `allyslot3InSrc: true`.
- Instances 18 (candidate-not-bid 9, churn 0), instance-days 101, assessed
  days 78 (dawn 53, midday-only 25), assessed rows 79, zeroRowDays 23.
- Unknown instance-days **1** (B-unknown 9, H-explained 8, H-skip 0).
  Assessed-day reasons: party-no-companion 78. Zero-row reasons: seed-day 7,
  unknown-no-signal 9 (8 H-explained, 1 remains), holder-scholar 2,
  holder-dead 1, plan-not-in-census 1, holder-off-haven 2,
  field-encounter-day 1. hTally: hs-gate-pick 8, hs-no-rows 1. Mechanism
  DENIED.
- Leg S: parts 404, scored 79, explained-not-scored 321, **unexplained 4**,
  horizonTruncated **0**. whyNot: seed-day 27, away 19, gate-pick 52,
  refresh-blocked 9, chore-live 189, scored 79, engaged 2, **no-rows 4**,
  scholar 12, dead 5, plan-deleted 4, retargeted 2.
- Launches counted 18, wave-4-target 18, uncounted 0, no-start-call 0,
  no-copy-link 0, first fights 9.
- Wall: wins 0, nationalRank 0, nationalStanding 2, table 0, wave4 8/8,
  wave5 2/8, medianDays 148, survived 4, deaths 853, starvation 2,
  standing199 6.

### The one failing instance-day

All 4 unexplained parts and the 1 unknown day are the same instance-day:

- **Seed 107447, visjoin_134 / editor, day 150, parts 0–3, all `no-rows`.**
- Seed 107447 ran the full 150d and survived (standing 585). visjoin_134 was
  alive through d150 (census rows d144–d150, alive; no death record) and
  carries 111 holder-state rows, the last on d149.
- The gap is village-wide, not villager-specific: **the last holder-state row
  for ANY villager on seed 107447 is d149.** Day 150 has zero holder-state
  rows for anyone. The sampler never samples the final day — the run ends at
  the 150d horizon before/without the sampler's d150 pass.
- The frozen horizon clause requires at least one holder-state row for the
  vid that day; with zero rows on d150 it cannot fire, so part 3 stays
  `no-rows` (UNEXPLAINED) by the frozen rule, and parts 0–2 were never
  covered by the clause at all (it applies to part 3 only).
- This is the re-judge's failure shape one step further out: the re-judge
  had one d150 p3 part WITH a row that day (which the clause would have
  closed); the confirm has a whole final day with NO rows at all (which the
  clause as frozen cannot close).

## Field-encounter fires (bar (d), reported not gating)

- Pilot, day-level: 2 — 107439 app_mgpspkk2515/spoiler (1 day, seedDay 147,
  closeDay 150) and 107445 vasyl_shevchenko/reunion (1 day, seedDay 124,
  closeDay 151). Part-level (Leg S whyNot `field-encounter`): **0**.
- Confirm, day-level: 1 — 107454 visjoin_105/algorithm (1 day, seedDay 110,
  closeDay 118). Part-level: **0**.
- The metric review's open question — whether the fallback ever fires
  mid-run — is answered NO on both bands: all three day-level fires are
  explained at the day level only; no Leg S part ever needed the fallback.
  (All four field-encounter fires ever observed before this arm were d150
  p3; this arm adds no mid-run part-level fire.)

## Sense-test read (real holder-days)

- The failing instance itself, from the analysis: visjoin_134/editor,
  seedDay 140, scored dawns on d142–d149 (party-no-companion, pool eligible
  0 — the pool that week was selfOrScholar 2 / notRanger 1 / away 0), then
  d150 with no holder-state row at any part. The holder was present, alive,
  and scored for eight straight days; the instrument simply stops seeing
  them on the final day.
- Pilot instance 107439 app_mgpspkk2515/spoiler (seedDay 147, closeDay 150,
  closeKind holder-died): scored d149 p0 and d150 p0 party-no-companion, and
  the d150 zero-row day classified field-encounter-day — the fallback doing
  its day-level job on a holder who died at the horizon.

## Instrument (proof test — adoption fix recorded)

- Proof test `scripts/test-launchfield-horizon-b.js`: **53/53 green** on the
  re-run (log `proof-test-launchfield-hz-0030-rerun.log` in the coordinator's
  workspace; the analyzer selftest inside it is 71/71).
- The FIRST post-freeze run was 50/53 with three §1 failures, all instrument
  defects caught by the proof test, fixed by the adoption coordinator with NO
  prereg change:
  1. **Analyzer `EXPECTED.seeds` was stale** — `[107439, 107400, …, 107406]`,
     copied from an older arm whose band was 107400–107406; only the first
     seed had been re-pointed. Fixed to 107439–107446. (The analyzer selftest
     passed 71/71 with the wrong list — the selftest never asserts
     EXPECTED.seeds — so only the proof test's §1 export check caught it.
     Had it shipped, the analyzer's substrate assertions don't check seeds,
     so the pilot judgment would have been unaffected; the test's §1 check
     is the only guard on that list.)
  2. **Test §1 screen checks were stale copies** from the re-judge test:
     they asserted a backwards range `107439–107430` and a 32-seed screen
     budget the frozen prereg never contains — this arm's frozen design has
     NO screen (pilot + confirm, pre-chosen bands). Replaced with checks
     asserting the frozen design verbatim (pilot 107439–107446, confirm
     107447–107454 only if the pilot GOes).
- Analyzer selftest: 71 checks green incl. §H4 + new §H5 horizon fixtures.
  §3b old-band regression: the 2 launchstate parts close exactly as
  field-encounter (107305 devon_okafor/reunion + benoit_lambert/eulogy,
  d150 p3, suburb/vFlee). §6 anchor: live run's anchorCommit IS the frozen
  literal. §6b tripwire: driver refuses (exit 2) on a non-frozen base.
- Leg R: exact on both bands (10/10 launcheng days).

## Runs log

- Pilot: 8 seeds, 0 instrument errors. Seed 107439 finished before a VM
  replacement at ~03:23Z killed the detached driver; seeds 107440–107446
  resumed after the restart (writes probed clear, heartbeats re-established
  first) and finished. Per-seed files persist across the kill; no seed was
  re-run.
- Confirm: 8 seeds, 0 instrument errors, single detached run.
- Machine note: the 03:23Z VM replacement is the only infrastructure event
  in this arm; nothing was lost.

## Metric review

- **The frozen clause never fired on either band** (horizonTruncated 0/0).
  Its shape — a d150 p3 no-rows part WITH a row that day — did not recur.
  What recurred instead is the systematic shape: the sampler writes no rows
  at all on the final day, so a d150 instance-day is row-less at every part.
- **Next run's question (not a re-score here):** extend the clause to the
  zero-row final day (e.g., reclassify d150 no-rows when the vid has rows on
  d149 and the village survived to d150), or fix the sampler to sample the
  final day. Either is a design decision for the next prereg. The frozen bar
  fails as written, and the verdict stands.
- The day-level taxonomy is otherwise closed on both bands (0 unknown on
  the pilot; the confirm's single unknown day IS the d150 instance-day).
- **Seed-band note (post-freeze):** the Loop A homebody re-judge landed on
  master as `3fd09decc` during this adoption using seeds 107431–107446,
  overlapping this arm's pilot band 107439–107446. The overlap postdates
  this arm's freeze (the band verified zero hits in prereg+sim-md scope at
  freeze time) and is a different lever/substrate/question, so it does not
  contaminate this judgment; recorded for the band-freshness record.

## Footnote — wall survived vs driver days

Pilot wall survived is 4 by the analyzer's `gameDays >= 150` rule, while the
driver log shows 5 seeds ran the full 150d. The gap is seed 107443:
`days` 150 but `gameDays` 149 — the game's own day counter lags the driver's
loop by one on that seed. Same one-day lag class as the launchfield
diagnostics; not a judgment input.

## Files

- Prereg: `evidence/2026-11-23/sim-launchfield-horizon-b-prereg.md`
- Instrument: `scripts/launchfield-horizon-driver-b.js`,
  `scripts/analyze-launchfield-horizon-b.js`,
  `scripts/test-launchfield-horizon-b.js` (adoption fixes: analyzer
  EXPECTED.seeds; test §1 pilot/confirm checks — see "Instrument" above)
- Corpora: `evidence/2026-11-23/perseed-launchfield-horizon-b-107439-107446/`
  (8 files) + `…-107447-107454/` (8 files)
- Analysis: `evidence/2026-11-23/launchfield-horizon-b-analysis.json` +
  `launchfield-horizon-b-analysis-107447-107454.json`
- Legs logs: `evidence/2026-11-23/launchfield-horizon-b-pilot.log` +
  `launchfield-horizon-b-confirm.log`
- Evidence: this file.
