# sim-tier3watch-b — tier-3+ access watch re-read (backlog #1545)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1928Z,
arm sim-tier3watch-b, axis food-economy. Worktree sim-tier3watch-b.
MEASUREMENT ONLY — zero game/policy changes in this arm. Main tree
never touched. Sibling trees never touched. Nothing appended to
sim-findings.md (the coordinator owns the backlog; this finding is
reported here and in the run report for a future fix arm).

## Prereg (binding, committed BEFORE any judged leg)

evidence/2026-10-30/sim-tier3watch-b-prereg.md (commit df80d88c4).
Base tip at panel time: df80d88c4 (prereg commit; parent c1b310c96,
journey landing r75). This arm adds no src/js change, so the base is
current master plus two measurement files; the coordinator rebases at
landing. Spec reproduced exactly — no prereg amendment was needed:
same script (scripts/balance-panel.js), same seeds (16101-16116),
same policy (competent), same horizon (60d, death-aware), same
access definition (panel metric goodGear: >= 1 census grant with
who === 'player', gear === true, tier >= 3 where tier = lootTier ||
tier || 1; starting gear excluded by the observer). Panel validity:
sourcesStable true, neutrality match true on proof seed 16101,
16 cases, 0 cached jobs, 0 observer errors on every case.

## Verdict — PERSISTS (by the pre-registered level rule)

Current-master rate: **6/16 = 0.375, Wilson 95% interval 0.1848 to
0.6136**, against stashfetch-before 9/16 = 0.5625 and stashfetch-after
8/16 = 0.5. Pre-registered rule: RESOLVED iff >= 9/16, PERSISTS iff
<= 8/16, INCONCLUSIVE only on spec-reproduction failure. 6/16 is at
or below the after level, so the verdict is PERSISTS: the dip did
not bounce back on current master — on this read it sits lower
still (6 vs 8).

Read the verdict with its interval, not instead of it. At n=16 the
Wilson interval (0.18–0.61) covers both historical levels, so this
read is NOT proof of a further significant decline, and it is NOT a
paired comparison: current master carries many landings since
stashfetch, so per-seed trajectories diverge by construction and the
per-seed deltas below are descriptive. What the verdict does say,
plainly: on the identical spec, the rate is still below the
before-level and below the after-level, not recovered. A real
regression signal for a future fix arm — NOT fixed here, per the
measurement-only brief.

## Per-seed table (goodGear: 1 = earned tier-3+ weapon/armor access)

| seed | stashfetch-before | stashfetch-after | current master | change vs after |
|------|------------------:|-----------------:|---------------:|-----------------|
| 16101 | 1 | 1 | 0 | lost |
| 16102 | 0 | 0 | 1 | gained |
| 16103 | 0 | 0 | 0 | same |
| 16104 | 0 | 0 | 1 | gained |
| 16105 | 1 | 1 | 0 | lost |
| 16106 | 1 | 1 | 1 | same |
| 16107 | 0 | 1 | 0 | lost |
| 16108 | 1 | 0 | 0 | same |
| 16109 | 1 | 1 | 1 | same |
| 16110 | 1 | 1 | 1 | same |
| 16111 | 1 | 1 | 1 | same |
| 16112 | 1 | 0 | 0 | same |
| 16113 | 0 | 0 | 0 | same |
| 16114 | 0 | 0 | 0 | same |
| 16115 | 1 | 1 | 0 | lost |
| 16116 | 0 | 0 | 0 | same |
| **total** | **9/16 (0.5625)** | **8/16 (0.5)** | **6/16 (0.375)** | **-2 net** |

Retained 1s vs after: 16106, 16109, 16110, 16111 (4). Lost vs after:
16101, 16105, 16107, 16115 (4). Gained vs after: 16102, 16104 (2).
No single seed explains the move; the dip is spread, not one story.

## Sub-metrics (descriptive, never substitute judges)

Current: contest/show 3/16 (0.1875), corpse 3/16 (0.1875),
craft/trade 0/16. Stashfetch-before: contest/show 5/16, corpse 7/16,
craft/trade 0/16. Stashfetch-after: contest/show 5/16, corpse 5/16,
craft/trade 0/16. The further dip is spread across BOTH earning
channels (contest/show 5 -> 3, corpse 5 -> 3), not one channel
collapsing — and craft/trade stays at zero across all three reads,
as it did in stashfetch. The FIRST tier-3+ access on all 6 current
seeds is ARMOR: Commander's Coat (tier 4, corpse, 16102 d22), Shelter
Cloak (tier 3, contest, 16104 d59), Alien carapace (tier 4, corpse,
16106 d7), Alien boots (tier 4, corpse, 16109 d13), Scar Tissue Wraps
(tier 3, contest, 16110 d51), Shelter Cloak (tier 3, contest, 16111
d46). Tier-3+ weapons were earned only twice, both at the very end
of the window: Starfall bow (tier 3, contest, 16110 d61) and Harvest
Scythe (tier 3, fan-package, 16111 d59) — so in practice the village
fights almost the whole 60 days without an earned top-tier weapon.

## Sense-test (law — a grant record, not a transcript line)

Seed 16106, day 7: the bearer acquires Alien carapace, tier-4 armor,
source corpse-person. In words: a week into the run, the village's
bearer is wearing scavenged alien shell taken off a dead person —
grim, legible, people-like scavenging, not a shop purchase and not a
grant from nowhere. The same pattern holds on 16102 (Commander's Coat
off a corpse, day 22) and 16109 (Alien boots off a corpse, day 13):
when this village gets its best gear, it strips it from the dead.
Caveat stated honestly: the panel records acquisitions, not
wielding — "access" here means the gear reached the player, not that
a transcript line shows it worn in a fight. Nothing robotic or
repeated surfaced in this sample beyond that limit; the contest
prizes (Shelter Cloak twice, Scar Tissue Wraps once) arrive late
(days 46-59), which reads as end-of-window prizes rather than gear
the village fights in for most of the run.

## Village assessment (plain words)

The village looks the same from the outside — no wins, no national
reach, no table, no village lost on any of the 16 seeds — but its
people are worse dressed than the stashfetch reads showed: only 6 of
16 runs ever get their hands on a top-tier piece of gear, first
always armor, with a top-tier weapon earned only twice and both
times in the last days of the window, and the good armor mostly comes from
stripping corpses early or winning a contest prize late. A village
that earns a better weapon only on day 59 or 61 is a village whose
fighters go into wave-3 fights with the same tools they started
with. The blank documented here is exactly the watch item: top-tier
gear access is thinner on current master than it was before the
stashfetch change, and nothing in this arm chased a fix for it.

## Wall numbers (same 16-seed panel)

Wins 0/16, national 0/16, table entry 0/16, village-lost 0/16,
max wave 3 (never 4+), first-bearer survival day 30: 11/16, day 60:
6/15 (one seed with null coverage). Same wall as stashfetch: this
watch item measures gear access, it does not move the scale on-ramp.

## Blanks filled / documented

- DOCUMENTED (finding for a future fix arm, NOT fixed here):
  earned tier-3+ access persists below the stashfetch-after level
  (6/16 vs 8/16 vs 9/16 before). The sub-metrics point the next arm
  at both earning channels and at weapons specifically (only 2
  top-tier weapons earned on 16 seeds, both in the last days of the
  window; craft/trade still zero across all three reads).
  No cause is claimed: with a moved base and n=16, this read cannot
  separate "the stashfetch change hurt access" from "later landings
  moved trajectories" from noise — the interval covers both old
  levels. The next arm needs a same-base before/after comparison,
  not another re-read against old numbers.
- FILLED (measurement): the re-read itself — per-seed table,
  interval, and verdict on the stated spec, completing the
  pre-registered measurement-GO.

## Proof

- scripts/sweep-tier3watch-b.js: reproducible wrapper (runs the exact
  panel command, extracts per-seed goodGear + sub-metrics + first
  tier-3+ grant from panel.json.gz, computes the Wilson interval,
  writes evidence/2026-10-30/sim-tier3watch-b-panel-summary.json).
  `node --check` clean. Panel run: 16 cases, 0 cached, ~4.5 min.
- evidence/2026-10-30/sim-tier3watch-b-panel/panel.json.gz (cases/
  cache deleted before commit, per stashfetch convention).
- evidence/2026-10-30/sim-tier3watch-b-panel-summary.json (machine
  summary: rate, interval, per-seed rows, validity, source heads).
- No game or policy file changed in this arm (git status shows only
  the files committed below); check.js not re-run because no src/js,
  policy, or test file changed — the only new script is a
  measurement wrapper, syntax-checked, and the panel itself is the
  instrument that ran green on all 16 cases.

## Metric review

- The primary metric bound the run and was judged by its
  pre-registered rule with no re-scoring: 6/16 meets the PERSISTS
  rule outright. The interval was reported alongside because a
  one-word verdict at n=16 would overstate what 16 seeds prove.
- One metric doubt for the NEXT run, not applied to this one: the
  goodGear metric counts access (acquisition), not use — a corpse
  stripped on day 7 and a contest prize on day 59 count the same,
  and nothing in the metric says the gear was ever worn in a fight.
  A future arm that wants to claim a gear-access fix should pair
  goodGear with a worn-in-fight read, or it will celebrate
  acquisitions that never change a fight.
- Second doubt: re-reading against old panels on a moved base is a
  level check, not a comparison. The next watch read should either
  freeze the base or run a same-base before/after pair; quoting old
  numbers as current without re-deriving would repeat the drift this
  arm was asked to check.
