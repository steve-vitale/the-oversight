# sim-stasharmor-a — preregistration (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop, run fleshout-20261104T1015Z, axis
food-economy, arm sim-stasharmor-a. Worktree sim-stasharmor-a.
Assignment: VESSEL STASH ARMOR FETCH — the follow-up blank from Loop B
arm sim-stashfetch-b (evidence/2026-10-30/sim-stashfetch-b.md: the
swat_vest sitting next to the hatchet in the spawn vessel's stash
still never moves; vesselStashFetch covers weapons only by design).

## Discovery made BEFORE any judged sim (read first — it changes the run)

The armor extension is ALREADY LANDED in this branch's ancestry:
commit 3e94b55cc "sim-armorfetch-b: vessel fetches own stashed armor
once a day at haven (GO 3/3 acceptance, cost bar holds)", method
`Game.vesselArmorFetch()` + call site in `villagerBuildDay()` in
src/js/villager-build.js, proof scripts/test-armorfetch-b.js, evidence
evidence/2026-10-30/sim-armorfetch-b.md (verdict GO 3/3 WORN, panel
review_required with NO regression_signal). Re-implementing it would
duplicate landed work and risk a conflicting second copy. This run is
therefore an INDEPENDENT CONFIRM of the landed implementation, not a
new implementation — no game-code change is planned, and none will be
made unless this confirm FAILS (in which case the failure, not a
silent redesign, is the report).

Canon: docs/CANON.md read first. No canon doc covers vessel
stash-fetch specifically (it is a gear-access fix, not a canon
system); the applicable standing rules are "no silent actions" (the
fetch narrates via Game.say + a vessel_armor_fetch tele record, as
landed) and the stashfetch precedent (own stash only, nothing
granted, wearing stays on the normal gearUp/UI path). Nothing in this
run invents canon.

## Primary metric (binding)

Independent re-run of the armorfetch-b acceptance set on the CURRENT
tree, same instrument (scripts/armorfetch-verdict-b.js, stdout, no
files), same substrate, same window:
- Acceptance seeds 16103 (swat_vest torso P35), 16101 (bark_armor
  torso P10), 16109 (farstrider_boots shoes P12).
- GO iff WORN (stash-loss + equipped) within the first 7 game days on
  >= 2/3 acceptance seeds. FETCHED (stash-loss + packed, not worn)
  on >= 2/3 with the cost bar holding is the fallback tier, as in
  armorfetch-b; anything below is NO-GO for the confirm.
- Cost bar (full band 16101–16116): village-lost <= baseline+1
  (baseline 1/16, so <= 2) AND median daysAlive >= 0.8x baseline
  median (baseline 60 capped, so >= 48). Counts bind, not
  trajectories: a game-code arm shifts RNG streams, so single-seed
  days may move while counts hold.

## Horizon, seeds, policies (binding)

- Horizon 60d, death-aware (dead villages stop simulating; the
  verdict driver records daysAlive per seed).
- Pilot: 16101–16108. Confirm: 16109–16116. Never below 8 seeds per
  leg. No confirm spend unless the pilot reproduces the acceptance
  pattern (16103 + 16101 WORN within 7d).
- Substrate identical to armorfetch-b: POLICY=nighttravel,
  WOODCARRY=1, WOODWARM=0, COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1.

## Instruments

- Judged: scripts/armorfetch-verdict-b.js (per-seed table on
  identical seeds). The balanced panel (§15) is NOT re-run as judge
  here, and that is stated, not hidden: armorfetch-b already ran a
  fresh before/after panel on this band (review_required, NO
  regression_signal); a confirm of an already-paneled change is
  judged by its prereg bar on identical seeds, and a second panel
  would re-measure distribution shift, not the acceptance claim.
  The panel tier-3+ watch (0.5 -> 0.3125, regression_watch, interval
  includes 0) is carried as a watch item, not re-litigated here.
- Supporting: scripts/test-armorfetch-b.js Parts A+B (static wiring
  + live-harness fixtures) must pass; Part C runs only if a corpus
  exists.
- Supplementary, non-judged: attempt scripts/armorfetch-trace-b.js
  to bank the corpus armorfetch-b could not (its corpus was
  flap-lost to 0-byte files). If the recorder writes valid JSON, the
  corpus is committed under evidence/2026-11-04/sim-stasharmor-a-
  corpus/ and Part C is run against it; if writes flap again, the
  judged verdict still stands on the verdict driver and the corpus
  gap stays documented, not papered over.

## Sense-test (law)

Read the day-1 fetch narration + day-2 wear on the acceptance seeds
and judge meaning: a person collecting their own armor from their own
space on the first night, then wearing it by the normal path — not a
special-case grant.

## Metric review (to be completed in the evidence file)

Any doubt about the metric goes here after the run, never applied
mid-run to re-score a miss.
