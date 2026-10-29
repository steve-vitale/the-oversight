# sim-eveningdetour-b — the evening detour: GO (pilot + confirm)

Run: oversight-flesh-out-loop-b, arm sim-eveningdetour-b, axis
food-economy. Worktree sim-eveningdetour-b. POLICY-SIDE ARM
ONLY: scripts/policies/nighttravel.js gate (default OFF) +
trace/analyzer/proof instruments. Zero src/js changes, zero
default flips, competent.js untouched, no driver adopts the
policy. This worker does NOT merge to master — coordinator
merges. Landing per the prereg is the default-OFF policy
instrument only.

Design source (not invented here): evidence/2026-10-29/
sim-blockedpath-diag-b.md §5, which decomposed 115
haven-offered but hop-refused evenings (all route-around-able
via BFS lengths 2–5) and drafted this lever's prereg.
Prereg (committed BEFORE any judged after-leg):
evidence/2026-10-29/sim-eveningdetour-b-prereg.md, commit
2bd965bf76. Confirm declaration (committed BEFORE any
confirm after-leg): evidence/2026-10-29/
sim-eveningdetour-b-confirm.md, commit 36afb4d4d1.

## Verdict: GO (pilot GO and confirm GO, judged per band)

The lever is the policy the game already offers humans via
"Go around", applied at evening by the bot: on a
travel-refused evening (haven offered, hop refused, not in
combat, not in a tent), walk the BFS route-around path home
(orthogonal travelTo steps, each travelBlockage-clean,
exactly Arm B's routeAround mechanics), then run the
insideevening entry leg unchanged. No clearing, no force,
no bridge-building, no detour narration.

Primary metric (both bands, quoted with its scope): rescue
rate among refused evenings on refused-prone seeds.

| Band | Seeds | Refused (after leg) | Rescued | Rate | Bar | G1 | G2 | G3 |
|---|---|---|---|---|---|---|---|---|
| Pilot | 8 | 15 | 15 | 1.000 | 0.50 | 30 vs 30 | 4 vs 2 | 0 viol |
| Confirm | 14 | 17 | 17 | 1.000 | 0.50 | 30 vs 30 | 3 vs 6 | 0 viol |
| Pooled (context only, NOT a verdict) | 22 | 32 | 32 | 1.000 | — | — | — | 0 viol |

Both bands pass every guard; minimum-n met on both
(n = 15, n = 17, both >= 8). Proofs:
scripts/test-eveningdetour-b.js T1–T8 PROOF-GREEN on both
bands (gate-OFF leg zero detour attempts, every rescued
evening walked its full BFS path onto haven, every detour
step exactly one orthogonal tile, still-refused
arrival == departure, competent.js + src/js untouched,
gate default-OFF, no detour narration).

## Before/after numbers (identical seeds, both legs, same driver/substrate)

Substrate (asserted FATAL in the driver):
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1.
Horizon 30 loop-days, tap days = last 5. Before leg =
nighttravel gate OFF; after leg = gate ON
(COMPETENT_EVENING_DETOUR=1).

### Pilot (8 seeds: 11149, 11031, 11360, 11384, 11390, 11439, 11077, 11299)

Before-leg refused counts reproduce the verdict corpus
EXACTLY (84 total: 11149:18, 11031:17, 11360:8, 11384:8,
11390:10, 11439:10, 11077:7, 11299:6) — the driver and
substrate match the verdict leg, so the before leg is a
true control, not an approximation.

| Seed | Before refused | After detours (rescued/stopped/nopath/died) | After steps | After streak mean/max | Starv before/after | Days before/after |
|---|---|---|---|---|---|---|
| 11031 | 17 | 5 (5/0/0/0) | 14 | — /0 | 1/0 | 30/30 |
| 11077 | 7 | 1 (1/0/0/0) | 2 | — /0 | 0/0 | 30/30 |
| 11149 | 18 | 2 (2/0/0/0) | 4 | — /0 | 0/0 | 30/30 |
| 11299 | 6 | 1 (1/0/0/0) | 3 | — /0 | 0/0 | 30/30 |
| 11360 | 8 | 2 (2/0/0/0) | 8 | — /0 | 1/0 | 30/30 |
| 11384 | 8 | 1 (1/0/0/0) | 3 | — /0 | 0/0 | 30/30 |
| 11390 | 10 | 2 (2/0/0/0) | 8 | — /0 | 0/4 | 30/30 |
| 11439 | 10 | 1 (1/0/0/0) | 3 | — /0 | 0/0 | 30/30 |

Pilot totals: before refused 84, after detour attempts 15,
all rescued, 45 detour steps, 0 detour-step combat
encounters. Before refused-streak mean 6.0, max 9; after:
ZERO unrescued-refused streaks (no streak exists to
average). Detour path lengths walked: 2–4. Morning
persistence: 14/15 rescued mornings inside at haven; the
one exception (11360 day 9) wakes on the haven tile but
outside the hall — still home, not a stranding, cause
not established from the trace (no night transcript is
recorded); see sense-testing.

### Confirm (14 seeds: 11112, 11133, 11208, 11246, 11251, 11273, 11349, 11365, 11408, 11435, 11500, 11509, 11510, 11516)

The 10 remaining diag refused seeds plus 4 fresh
refused-prone seeds from a new scan (gate-OFF legs, seeds
11500–11519; qualifiers with >= 1 refused evening:
11500:5 washed_out, 11509:2 creek, 11510:1 washed_out,
11516:4 creek). Before legs re-run fresh for all 14
confirm seeds (scan legs served only as selection).
Before refused total 43, exactly the diag + scan
expectation (31 + 12); the 10 diag seeds reproduce the
verdict corpus exactly.

| Seed | Before refused | After detours (rescued/stopped/nopath/died) | After steps | Starv before/after | Days before/after |
|---|---|---|---|---|---|
| 11112 | 5 | 1 (1/0/0/0) | 2 | 0/0 | 30/30 |
| 11133 | 1 | 1 (1/0/0/0) | 2 | 0/0 | 30/30 |
| 11208 | 2 | 1 (1/0/0/0) | 2 | 0/0 | 30/30 |
| 11246 | 3 | 1 (1/0/0/0) | 3 | 0/0 | 30/30 |
| 11251 | 2 | 1 (1/0/0/0) | 2 | 0/0 | 30/30 |
| 11273 | 2 | 1 (1/0/0/0) | 3 | 3/3 | 30/30 |
| 11349 | 1 | 1 (1/0/0/0) | 4 | 0/0 | 30/30 |
| 11365 | 3 | 1 (1/0/0/0) | 2 | 1/0 | 30/30 |
| 11408 | 7 | 1 (1/0/0/0) | 5 | 0/0 | 30/30 |
| 11435 | 5 | 2 (2/0/0/0) | 4 | 1/0 | 30/30 |
| 11500 | 5 | 3 (3/0/0/0) | 15 | 1/0 | 30/30 |
| 11509 | 2 | 1 (1/0/0/0) | 2 | 0/0 | 30/30 |
| 11510 | 1 | 1 (1/0/0/0) | 4 | 0/0 | 30/30 |
| 11516 | 4 | 1 (1/0/0/0) | 4 | 0/0 | 30/30 |

Confirm totals: before refused 43, after detour attempts
17, all rescued, 54 detour steps, 0 detour-step combat
encounters. Before refused-streak mean 3.07, max 7;
after: ZERO unrescued-refused streaks. Detour path
lengths walked: 2 (8), 3 (2), 4 (3), 5 (4). Morning
persistence: 16/16 rescued mornings inside at haven
(the 17th rescue was loop-day 30, with no following
morning in the trace). Total deaths fell on both bands
(pilot 79 -> 68; confirm 138 -> 123) — the lever does
not buy evenings with lives.

### Why the after-leg denominator is smaller than the before leg's

This is trajectory divergence, not a denominator trick,
and it is the lever's main effect: a rescued evening
puts the villager home, so the NEXT evenings of what
would have been a 5–9 evening refused episode never
occur. Pilot: 84 refused evenings collapse to 15
first-refusals, all rescued, and no episode ever
re-forms. Confirm: 43 collapse to 17. The prereg's rate
is judged on the after leg's refused evenings exactly
as written (15/15, 17/17), and the burden collapse
(84 -> 15 attempts, 43 -> 17 attempts, streaks
eliminated) is reported alongside it so the rate is
never read without its scope. See "Metric review".

## Guards, and the pilot G2 watch item

- G1 (survival): median daysAlive 30 vs 30 on both
  bands (all 22 villages survived 30 days on both legs).
- G2 (starvation): pilot 4 vs 2 — passes, but EXACTLY
  at the +2 bound, all 4 on seed 11390 (days 18–20,
  three on day 18) after that seed's day-14 rescue
  diverged its trajectory; that seed's TOTAL deaths
  still fell (14 -> 10), and the village survived. The
  confirm band was watched for replication per the
  confirm declaration: it did NOT replicate — confirm
  G2 is 3 vs 6 (an improvement), with no seed showing
  a starvation cluster. The pilot blip reads as
  trajectory-divergence noise, not a lever cost; it
  is recorded here rather than hidden, and no guard
  was re-scored because of it.
- G3 (honesty, zero-tolerance): 0 violations on both
  bands — 0 teleport steps (all 99 detour steps across
  both bands move exactly one orthogonal tile), 0
  rescued-off-haven, 0 combat-then-inside, 0
  still-refused-moved. 0 detour steps in 99 met combat.

## Reachability verdict (waves 1–5, regional → national, table, win flag)

NOT OBSERVABLE in 30-day position traces — reported,
not claimed. The traces carry no regional/national/
table/win fields. What IS in the files: maxWaveUnlocked
per seed — wave 4–5 unlocks 0/8 pilot both legs, 0/14
confirm both legs. No national/table/win movement is
claimed from this run; the lever is a nightly-position
policy, and a 30-day position trace cannot move a
scale-wall number.

## Wall numbers (every run)

- National: not observable in 30d traces (no field).
- Table: not observable in 30d traces (no field).
- Wins: not observable in 30d traces (no field); 0 win
  flags present.
- Wave 4–5 unlocks: 0/22 pooled both legs.
- Median survival: 30 days both legs, both bands
  (22/22 villages survived on the after legs; 22/22 on
  the before legs).

## Village assessment (plain words)

Thirty days in, these villages look like the verdict
run's villages, except the week-long trap is gone. On
the before legs the refused villager still spends most
of a week camped one tile from home — foraging the
same groves, meeting the same neighbors, ending each
day on a refusal line ("Rubble chokes the path.",
"The creek runs fast here — no crossing without a
bridge or a swim."). On the after legs that same
villager walks home the first night the road refuses
them: two to five plain steps, sometimes with a
monster trailing them to the treeline and stopping
there, then the lodge walk and the hall. The village
itself is unchanged — same foraging, same gossip by
the fire, same teaching, same thin-but-alive month
(and fewer deaths overall, not more). What was
missing was not food or fight but the evening walk
itself: the bot never used the way around that a
human taps. The blank this run fills is that walk,
measured: 32 refused evenings, 32 walks home, 0
fights on the way, 0 episodes re-formed. The blank
it documents but does not fill is the narration of
the walk (see sense-testing) — and the stopped-detour
branches, which no judged evening exercised.

## Sense-testing (read transcripts, judged for meaning)

- RESCUED, creek (pilot seed 11077 day 4, creek (3,3)
  -> detour via (3,4) -> haven): the tail ends with
  the refusal line twice, then "Travel 1 tile to
  forest floor.", "Travel 1 tile to Haven.", "You walk
  back into Haven. 6 Codex entries. The village is
  glad to see you.", "Walking 5 squares (10 kcal)…",
  "You step into the Haven hall." This reads as a
  played evening — tried the crossing, was refused,
  walked around, came home, paid the lodge walk. NOT
  a teleport: two discrete travel lines plus the
  billed walk. The known honesty gap persists in a
  narrower form: the refusal line still names only
  the unusable remedies (bridge/swim) and no line
  ever says "going around" — the detour steps arrive
  as plain "Travel 1 tile to…" lines. A player
  following the log sees a sensible walk home, but
  not WHY those steps were chosen. That narration
  line is the separate named blank; it was NOT built
  here, per the brief.
- RESCUED, rubble (pilot seed 11149 day 4, meadow
  (5,3) -> via (4,3) -> haven): "Rubble chokes the
  path." then travel steps, gossip by the fire, a
  counter learned, then the walk + entry. Coherent;
  the day's life continues into the evening walk
  rather than stopping at the refusal.
- RESCUED, fallen tree, follower (pilot seed 11360
  day 8, 4-step path): "A fallen tree blocks the
  path." then trail edge, grove, Haven; a Hushpuppy
  follows step by step ("It followed you.") and stops
  at the treeline ("The walls end the argument.").
  The detour preserves follower behavior honestly —
  the monster does not chase into the hall and does
  not vanish. The next morning (day 9) wakes on the
  haven tile but outside the hall (inside=false);
  the player is home, not stranded, and the trace
  records no night transcript to explain the exit —
  a small unexplained wrinkle, not a guard issue
  (G3 has no morning criterion) and not replicated
  at confirm (16/16 mornings inside).
- RESCUED, 5-step (confirm seed 11408 day 19, from
  (7,4) via ruin tiles -> haven): the long walk
  passes a pre-Burn ruin ("Someone's kitchen. The
  Burn took the wires from the walls; the walls kept
  standing out of spite."), an Ugly-Eyes trails and
  stops at the treeline, and a villager remarks on
  arrival ("Tamika: 'Huh. Never been this way
  before.'"). The five steps read as a real walk
  through real places, not a jump — but the
  missing "going around" line is felt most here:
  five unexplained travel lines in a row.
- RESCUED, 5-step (confirm seed 11500 day 5, from
  (7,4)): same shape — fairy ring, forest canopy,
  a humming follower trailing every step and stopping
  at the treeline, smoke from Thornfield on the
  horizon mid-walk. Nothing robotic in the judged
  tails; the robotic-feeling beat, where it exists,
  is the absence of the detour narration, not a
  repeated line.
- UNRESCUED detour evenings: NONE occurred at pilot
  or confirm (0 stopped, 0 nopath, 0 died across 32
  detours). The stopped/nopath branches are therefore
  UNEXERCISED by judged data — code-reviewed and
  proof-checked for scope, but their played behavior
  (stopping honestly where you stand, sleeping away)
  is not demonstrated by this run. A future run on
  harder geometry, or a synthetic unit test, should
  exercise them before the gate is ever relied on
  beyond refused-prone seeds.
- Costs: rescued evenings end at 2101–2350 kcal; the
  detour steps bill nothing (node travel free by
  engine law) and the lodge walk bills 8–10 kcal,
  exactly as converted evenings already bill. No free
  lunch is hidden in the detour.

## Blanks filled or documented

- FILLED (lever + measurement): the evening detour —
  32/32 refused evenings rescued across pilot +
  confirm, all guards holding, proofs green, streaks
  eliminated. Lands as a default-OFF policy
  instrument only (nighttravel.js gate +
  trace/analyzer/proof instruments).
- DOCUMENTED (not filled): (1) detour narration —
  no "going around" line; the walk reads sensibly
  but its reason is never spoken. Separate named
  blank, needs its own design (not a line this arm
  may quietly add). (2) Stopped/nopath branches
  unexercised (0/32 detours stopped) — behavior on
  refusal mid-detour is designed and coded, not
  played. (3) Blind-band rate unknown — all rates
  here are on refused-prone seeds by design; a
  blind-band number would dilute the estimand with
  seeds that never refuse, so the honest blind-band
  statement is refused-evening burden per seed, not
  a pooled rate. (4) The 11360 day-9 morning
  outside-the-hall wrinkle (pilot only, not
  replicated at confirm).

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as
pre-registered before judging: this leg is a 30-day
position/reachability measurement of a POLICY-SIDE arm
— zero src/js changes, so there is no game-root delta
for a panel to compare, and the panel's registry
policies do not include the trace policies this arm
measures. The before/after instrument is the custom
driver on identical seeds, and the pre-registered
thresholds above are the judge. If this lever ever
becomes a game change, a panel compare is run at that
point; a policy-side trace cannot fake one now.

## Metric review (mandatory — doubts for the NEXT run, never a re-score)

- The denominator collapse is the finding and the
  quoting hazard at once: the prereg's rate (after-leg
  refused evenings) is 1.000 on both bands, but the
  after-leg refused counts (15, 17) are far below the
  before-leg counts (84, 43) because rescues break
  episodes. Any future report must quote BOTH the rate
  AND the before/after refused counts, or the rate
  alone will overstate the lever's tested breadth
  (32 detours judged, not 127). The pooled 32/32 is
  context, never a verdict — verdicts are per band
  per the prereg.
- The BFS (orthogonal) as judge held on all 32
  detours, including 5-step paths: no diagonal-only
  passage case arose. The diag §5 warning stands for
  future seeds: a hop that succeeds diagonally with
  no orthogonal detour would count as no-detour
  honestly, but no such seed was judged here.
- The pilot G2 blip (4 vs 2, exactly at bound) did
  not replicate at confirm (3 vs 6). No guard was
  re-scored and no metric changed because of it; the
  next run should keep G2 as written rather than
  widening it on one seed's noise — but if a future
  band replicates a starvation cluster, the metric
  review of that run should ask whether trajectory
  divergence (player home vs away changing pantry
  flows) belongs in G2's definition, rather than
  quietly absorbing it.
- Morning persistence is a secondary observation, not
  a guard: 30/31 rescued evenings with a following
  morning persisted inside (14/15 pilot, 16/16
  confirm); the single pilot exception woke on the
  haven tile outside the hall. If a future run makes
  morning persistence a guard, it must first establish
  what sleep does to insideHaven at dawn — the trace
  cannot say, and this run does not claim it.
- The scan enrichment (11500–11519, 4/20 refused-prone)
  vs the bank enrichment (18/36 refused-prone among
  away-prone seeds) describes different populations;
  neither rate is a game-wide refusal rate. Future
  refused-prone screens should state their base
  population the same way.

## Evidence files

- Prereg: evidence/2026-10-29/sim-eveningdetour-b-prereg.md
  (commit 2bd965bf76, before any judged after-leg)
- Confirm declaration: evidence/2026-10-29/
  sim-eveningdetour-b-confirm.md (commit 36afb4d4d1,
  before any confirm after-leg)
- This file: evidence/2026-10-29/sim-eveningdetour-b.md
- Pilot corpora: evidence/2026-10-29/
  sim-eveningdetour-b-corpus-before/ (8 files),
  sim-eveningdetour-b-corpus-after/ (8 files)
- Pilot analysis: evidence/2026-10-29/
  sim-eveningdetour-b-analysis.json
- Confirm scan: evidence/2026-10-29/
  sim-eveningdetour-b-confirm-scan/ (20 files)
- Confirm corpora: evidence/2026-10-29/
  sim-eveningdetour-b-confirm-before/ (14 files),
  sim-eveningdetour-b-confirm-after/ (14 files)
- Confirm analysis: evidence/2026-10-29/
  sim-eveningdetour-b-confirm-analysis.json
- Instruments: scripts/policies/nighttravel.js (gate),
  scripts/eveningdetour-trace-b.js,
  scripts/analyze-eveningdetour-b.js
- Proof: scripts/test-eveningdetour-b.js (T1–T8
  PROOF-GREEN on both bands)

## Landing note for the coordinator

GO lands the default-OFF policy instrument ONLY
(scripts/policies/nighttravel.js gate plus trace/
analyzer/proof instruments, as a policy file no driver
adopts by default). NO driver adopts it, NO default
flip, NO src/js change, NO competent.js /
insideevening.js change. This worker does NOT merge to
master — coordinator merges. Worktree contains only
committed work at handoff (verified before reporting).
Report: 'merged locally, pending ship' applies after
the coordinator merges; this worker's handoff state is
committed, unmerged, pending coordinator merge.
