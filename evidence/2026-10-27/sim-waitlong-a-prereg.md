# sim-waitlong-a — PREREGISTRATION (binding, written BEFORE any sweep)

Run: fleshout-20261027T1215Z, arm 2 of 3 (axis scale-onramp).
Worktree: ~/workspace/worktrees/sim-waitlong-a (branch sim-waitlong-a).
Date written: 2026-10-27, before the waitlong sweep ran.
Task: DOES WAITING MATTER ON BANDS WHERE THE SEAT STAYS UNREADY LONGER?

## Canon read first

- docs/CANON.md (manifest) and docs/TABLE.md (the table contract) read
  before building. Contract points used: the full seat keeps the
  national bar; the lesser seat is priced without national; the seat
  is taken from Haven via tableTakeSeat; table sanctity suspends
  ambient monster pressure while the table sits. No canon invented.
- Readiness mechanism (src/js/table.js, tablePreview / tableEntryBlock,
  read not changed): a preview is ready iff tableEntryBlock() is
  empty. The block reasons are exactly: run over/won; an active
  contest; in combat / a monster present; or havenStoresAccess() ==
  'none' — i.e. the scholar is NOT at Haven (inside Haven, or
  integration stage >= 3 remote). In practice the dominant block on
  the 1955Z band was not-at-Haven: the seat drive runs once per
  policy.daily, before courtship, so a scholar away on a courtship
  circuit loses that whole day for seating, and the wait leg's only
  mechanism is ending the day at Haven (4,4) so the NEXT day's drive
  finds the scholar at Haven. Contest/combat blocks are the other
  two possible reasons; the instrument records which one fires
  (see "Why recording" below).

## Prior evidence recovered (the exact legs, baseline, band, bar)

- sim-tableseat-a (seat+wait) and sim-tableseat-nowait-a (seat-only),
  run fleshout-20261024T1955Z, evidence/2026-10-24/sim-tableseat-a.md,
  sim-tableseat-nowait-a.md, coordinator round sim-tableseat-round-1955.md.
- Shared baseline in both arms: leanlinkrescue-only (LEANLINKRESCUE=1,
  seat env unset), identical seeds, same instrument family.
- Seat-only leg: scripts/policies/tableseat-nowait.js (TABLESEATNOWAIT=1)
  — leanlinkrescue.daily wrapped with the seat legs ONLY (drive seat
  before courtship, first-option table answers), wait leg omitted.
- Seat+wait leg: scripts/policies/tableseat.js (TABLESEAT=1) — the
  same seat legs PLUS the wait leg after courtship (while
  tableWaiting + national+ + !tableDone, end the day at Haven (4,4)).
- Seed band 73601–73608, horizon 180 loop-days death-aware.
- Result (both arms, replicated across two independent workers):
  baseline entered 0/8, wins 0/8, median 173d, starvation 5;
  seat-only entered 3/8, wins 3/8, median 161d, starvation 5;
  seat+wait entered 3/8, wins 3/8, median 161d, starvation 5 —
  seat-only replicates seat+wait EXACTLY (same seeds 73601/73604/
  73605, same seat days 129/142/161, all lesser, all Feared).
- Latency on that band (the "unready" measurement): seat+wait
  previews seen 5, not-ready 2 (all on 73605: 3 previews, 2
  not-ready, wait 2d, 1 stranded day); seat-only previews seen 5,
  not-ready 2 (same seed, same seat day). So the 1955Z band's
  longest unready stretch is 2 not-ready days on ONE seed, and
  waiting did not shorten it. The wait question on longer
  stretches is therefore genuinely untested, not merely unreported.
- Deciding cost bar (from sim-scalemetric, carried over binding):
  starvation deaths armed total <= comparison total + 2 AND
  arm-only starvation (deaths on seeds where the paired comparison
  row had none) <= 2 AND median days armed >= 0.8 x comparison
  median days. All three must pass WITH the primary or NO-GO.

## The longer-unready band — identification BEFORE sweeping (no cherry-picking)

Searched prior evidence for a band where the seat stays unready
materially longer BEFORE choosing this arm's band. Findings:

- The ONLY band with measured seat latency is 73601–73608 (above):
  max 2 not-ready days, total 2. No prior tableseat/tablesit corpus
  measures a longer stretch (tablesit ran against competent, which
  never reached national, so its seat legs never fired at all).
- The long-wait case in the findings backlog (seed 73672: table
  waiting ~119 days, regional, lesser seat priced, never entered)
  does NOT qualify as a wait-discriminating band: both seat legs
  are gated on rank >= national, and 73672 never reached national,
  so seat-only and seat+wait would both idle there identically.
  Citing it as the band would be a category error (waiting-to-be-
  invited is not waiting-for-readiness). It is NOT used.
- No other prior corpus records preview/not-ready counts, so no
  evidence-based long-latency seed list exists to pick from. Any
  seed list "found" by running seat-only first and keeping the
  slow seeds would be picking the band AFTER seeing results —
  exactly what this preregistration forbids.

Therefore the band is chosen by a FIXED RULE, not by outcome:

- BAND: fresh seeds 74001–74008. Freshness verified before this
  prereg was written: no `7400x` hits in scripts/*.js, no `7400x`
  filenames in evidence/2026-10-24 through evidence/2026-10-27.
  (73701–73708 was rejected: used by scripts/sweep-deathrow-b.js.)
  The band is uncherry-picked: no seed was run, screened, or
  excluded on latency or any outcome before this prereg.
- BAND-QUALIFICATION RULE (binding, judged before the wait verdict):
  the band counts as "longer-unready" iff the seat-only leg shows
  EITHER total not-ready previews >= 6 across seated seeds OR any
  seated seed with invitation-to-seat latency >= 4 days (latency =
  tsSeatDay minus firstWaitingDay, firstWaitingDay = first
  post-daily snapshot day with tableWaiting true). Thresholds are
  set at 3x the 1955Z band's observed values (total 2, max 2 days),
  so "longer" means materially longer, not one extra day.
- If the band does NOT qualify, the wait verdict is NOT fabricated:
  the verdict is "long-unready condition did not occur on this
  band; wait remains undifferentiated (second-band replication)",
  and the sweep's entered/wins/cost/latency numbers are still
  reported in full. If it DOES qualify, the wait verdict below is
  judged. Either way no seed is added, dropped, or swapped after
  the sweep starts.

## Arms (policy-side ONLY — zero src/js)

One shared baseline, two armed legs, identical seeds, one instrument:

- baseline: leanlinkrescue-only (LEANLINKRESCUE=1, TABLESEAT and
  TABLESEATNOWAIT unset).
- seat-only: scripts/policies/tableseat-nowait.js, LEANLINKRESCUE=1
  AND TABLESEATNOWAIT=1. NO new policy file (the prior arm's file
  is reused verbatim; this arm creates no policy file, so a NO-GO
  leaves nothing to delete — see "Landing").
- seat+wait: scripts/policies/tableseat.js, LEANLINKRESCUE=1 AND
  TABLESEAT=1. Reused verbatim likewise.
- Total configs: 8 seeds x 3 legs = 24. Pilot scale per the
  throughput rule (screening arms run 8 seeds each); this is a
  comparison of two armed legs against one shared baseline, not a
  confirm — no 12–16-seed confirm is spent on a pilot question.

## Horizon (death-aware, justified — never a fixed 200d without reason)

180 loop-days, death-aware (runDays breaks on Game.over; dead
villages stop simulating). Justification: the 1955Z baseline median
was 173d on the same horizon and the same substrate, so 180d
covers the invitation-to-seat window (seats at 129/142/161) while
dead villages cost nothing past death. A longer horizon would not
lengthen readiness — readiness is a per-day block (Haven/contest/
combat), not a horizon effect — and would only add survivor tail
days. Comparability with the 1955Z band also requires the same
horizon.

## Primary metric (ONE primary — entered; wins is secondary)

- PRIMARY (the wait question): table entered (tableDone ever),
  seat+wait MINUS seat-only, on identical seeds.
  GO (waiting matters) requires seat+wait entered >= seat-only
  entered + 2 (the same +2 bar the 1955Z arms used, applied to the
  wait delta instead of the seat delta).
- If the band does not qualify (above), the primary is reported but
  the verdict is the non-qualification verdict, not GO/NO-GO.
- SECONDARY (reported, not judged, except the cost bar): wins
  (seat+wait vs seat-only vs baseline), national ever/final, wave
  4/5 reach, max arc, median/max survival, death-cause shares,
  seat attempts/taken/kind/day, wait days/returns/stranded,
  preview seen/not-ready counts, invitation-to-seat latency per
  seated seed, and the why-block distribution (Haven vs contest
  vs combat) on not-ready days.
- DECIDING COST BAR (binding, seat+wait judged against seat-only):
  starvation total seat+wait <= seat-only total + 2 AND arm-only
  starvation (seat+wait starvation deaths on seeds where the paired
  seat-only row had none) <= 2 AND median days seat+wait >= 0.8 x
  seat-only median days. All three must pass WITH the primary or
  the wait arm is NO-GO (waiting does not earn its keep). The same
  three conditions are also reported seat+wait vs baseline.
  Starvation = a death whose cause matches /starv|hunger|famine/i;
  the full by-cause table is carried per row so the bar is auditable.
- Non-discrimination rule: "table invited ever" is NOT a judged
  metric (1955Z proved it non-discriminating: baseline already
  5/8). Path diversity is NOT judged here (first-option answering
  walks Feared by construction in both legs; both legs share it,
  so it cannot discriminate wait from no-wait).

## Why recording (no extra game calls that consume RNG)

tablePreview() itself is NOT called by the sweep wrapper: its
tableEarnedPaths path can consume Math.random (src/js/table-witness.js
picks a dead name at random), which would perturb trajectories
against the prior arms. Instead the wrapper records, BEFORE each
day's policy.daily, on days where progState shows tableWaiting and
!tableDone and rank >= national: Game.tableEntryBlock() (pure reads
— over/won, activeContest, inCombat/monster, havenStoresAccess; no
RNG, no writes) plus Game.map px/py. That is exactly the block the
seat drive will see that day, without touching the preview path.
Neutrality is PROVEN, not assumed, by the replication probes below.

## Proof gates (binding — failures are loud, not adjusted away)

- P1 replication probe (BEFORE the main sweep): baseline seed 73601
  must match the prior corpus row exactly (days 179, gameDays 179,
  end village-lost, entered 0, won 0, starvation 0 on that seed —
  per evidence/2026-10-24/perseed-tableseat-a/s73601-baseline.json:
  deathByCause has no starvation entry) AND seat-only seed 73601
  must match the prior nowait row exactly (days 129, gameDays 129,
  end over-other, entered 1, won 1, seat day 129 lesser feared).
  If either probe fails, the wrapper is NOT neutral: stop, remove
  the block-recording from the wrapper, re-probe, and disclose the
  failure in the evidence file. Do not proceed to judge a sweep
  whose instrument perturbs trajectories.
- P2 det-gate (same as prior arms, on the new band): the sweep's
  baseline leg and the armed legs with their env gates unset are
  the same delegation shape; the probes above cover delegation
  (seat env unset delegates to leanlinkrescue.daily).
- G2 pre-national read-only: for every seed where NO leg ever
  reached national, days and gameDays must be identical across all
  three legs (the wrappers are read-only before national).
- G3 corpus integrity: 24/24 rows, days > 0, ts + court objects
  present on every row, per-config incremental writes (never
  batch at the end — the tablesit first-attempt lesson).
- Idle/no-op disclosure (the 1121Z trap): any config whose seat
  legs never gated in (no national ever, or national but no
  tableWaiting) is reported as idle for the wait question — it
  counts toward denominators exactly as the prior arms counted
  theirs, but its rows must never be presented as evidence that
  waiting helped or hurt. If the WHOLE sweep is idle (no seat
  taken on either leg), the verdict is "no discrimination possible",
  not NO-GO, and no policy row is deleted or hidden: there is no
  new policy file to delete.

## Landing

- GO (band qualifies AND primary passes AND cost bar passes):
  no new policy file exists to land — both legs are prior arms'
  files, already committed on this branch. The evidence + instrument
  + corpus land; the coordinator decides whether seat+wait (vs
  seat-only) becomes the recommended seat instrument. No default
  flips by this arm, ever.
- NO-GO / non-qualification / no-discrimination: likewise nothing
  to delete (no new policy file was created). The sweep instrument
  (scripts/test-waitlong-sweep.js) lands with the evidence so the
  NO-GO stays reproducible, per the tablesit killed-arm precedent.
- Do NOT push, do NOT bump versions, do NOT verify live — report
  "merged locally, pending ship" readiness; the coordinator merges
  via --ff-only and the ship loop owns pushes.

## Balanced panel (§15)

Attempt `scripts/balance-panel.js compare` on the corpus; attach the
compare .md if the panel ingests it, else record the exact reason
(the 1955Z arms both hit `TypeError: Cannot read properties of
undefined (reading 'days')` at balance-scorecard.js:44 because the
panel expects panel-driver output, not per-seed sweep rows) and
use the sweep-compare tables as the before/after comparison.

## Sense-testing law

One NON-MEASURED narration-on replay of a seated seed from THIS
band (seat+wait leg preferred, seat-only if seat+wait seats nothing):
judge what waiting actually looks like in-fiction (does the village
wait sensibly, or idle/robotically?) plus a villager-behaviour
sample out of the band (goals, routines, dialogue from the ring and
the final roster). Words only, never numbers — narration shifts
trajectories, so the replay never enters the census. Flag anything
robotic, static, or repeated.

## Metric review (to be filled in the evidence file, not here)

Doubts about this prereg's metrics go under "metric review" in
evidence/2026-10-27/sim-waitlong-a.md and apply to the NEXT run,
never to re-score this one.
