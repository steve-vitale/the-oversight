# sim-rubbleroute-b — 12-STEP RUBBLE ROUTE-AROUND: DIAG-GO

Run: oversight-flesh-out-loop-b, arm sim-rubbleroute-b, axis
food-economy. Worktree sim-rubbleroute-b. POLICY-SIDE DIAG
ONLY: scripts/policies/nighttravel.js gate
(COMPETENT_EVENING_DETOUR=1, default OFF, UNCHANGED) +
trace/analyzer/proof instruments. Zero src/js changes, zero
default flips, no driver adopts the policy. This worker does
NOT merge to master — coordinator merges. Prereg (committed
BEFORE any judged leg):
evidence/2026-10-29/sim-rubbleroute-b-prereg.md, commit
a5b494c94.

## Verdict: DIAG-GO — the questions are answered with complete traces on both seeds

Backlog #1427 asked whether the eveningdetour lever
actually walks the full 12-step BFS route-around on seed
13224's rubble evenings, and whether that walk reads
sensibly. Answer: yes, it walks all 12 steps, on every
refused evening it encounters, to a completed inside
arrival before sleep — and it does so 18 times in 30
days on 13224, not twice, because the rescue does not
change the daytime loop that re-strands the villager.
The walk itself costs nothing (0 kcal, 0 ticks beyond
the entry leg) and is narrated as twelve plain
single-tile travel lines with no line naming the way
around. Proof: scripts/test-rubbleroute-b.js
PROOF-GREEN (T1 OFF reproduction, T2 completeness, T3
full-path walks, T4 policy path == census path, T5
divergence + unclassified, T6 determinism byte-identical,
T7 gate-OFF silence, T8 no detour narration).

## Answers to the four questions

### Q1. Does the villager walk the full 12-step BFS path home?

YES — on all 18 detour evenings on 13224, steps walked ==
BFS length == 12, every step moved, arrival haven (4,4)
inside before sleep, next morning inside at haven. The
policy's BFS path is exactly the census path minus the
departure node: [(3,2)–(3,1)–(3,0)–(4,0)–(5,0)–(6,0)–
(6,1)–(6,2)–(6,3)–(6,4)–(5,4)–(4,4)]. Cost per walk:
0 kcal (kcalAfterDetour − kcalBeforeDetour == 0 on all
18) and 0 ticks beyond the entry leg (evening ticks from
detour start through entry == 5 on all 18, exactly the
entry walk's 5 steps — consistent with free node travel
under engine law; the trace cannot separate a
hypothetical Go-inside tick charge from walk ticks, but
no evening exceeds the entry-step count, so the detour
walk adds no ticks beyond the entry leg). The entry leg
itself bills "Walking 5 squares (10 kcal)…" + 5 ticks —
that is the lodge walk, not the detour. No detour step
met combat (0 combat steps across all 19 detours on
both seeds).

### Q2. Is the detour offered on every refused evening, or only some?

ON EVERY hop refusal encountered: offer rate (i) ==
1.0 on both seeds (19 detours / 19 ON-leg hop
refusals, 0 residual refused evenings on either ON
leg). The re-encounter rate (ii) differs by seed and
is the interesting number:

- 13224: 2/2 OFF-refused evenings re-encountered
  (rate 1.0) — days 4 AND 5 both detour, because the
  day-4 rescue leaves the villager free to walk back
  out to the creek on day 5 and refuse again.
- 13029: 1/5 re-encountered (rate 0.2) — day 19
  detours, and days 20–23 never refuse again: after
  the rescue, the villager's days end already at haven
  (preStep 4,4), so the episode ends. The rescue
  breaks the episode on 13029 and repeats nightly on
  13224; both are divergence-explained, not offer
  misses.

The deeper count: 13224's ON leg has 18 detour
evenings (days 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19,
20, 22, 23, 25, 26, 28, 29) against 2 refused evenings
on the OFF leg. The OFF leg's villager, once refused,
stays out for days (5 out-of-reach evenings at (3,1)
after the episode), so refusals are rare; the ON
leg's villager is rescued nightly and walks back out
to the same creek every day, so the same refusal
recurs. The detour rescues the night, not the
daytime destination.

### Q3. Does the night walk complete, truncate, or get interrupted?

COMPLETES, every time: 19/19 detours (18 on 13224, 1
on 13029) end outcome `completed`, rescued true,
arrival inside at haven before sleep logic (evening
rows are post-daily, pre-sleep), next morning inside
at haven. Zero detour-stopped, zero detour-nopath,
zero detour-died, zero combat interruptions, zero
truncations. The walk never meets the sleep logic
mid-route: sleep runs after the policy's night step,
and every detour evening is already inside when
sleep runs.

### Q4. SENSE — does any line name the way around? (#1428, #1394)

NO line names the way around, on either seed. What
the player actually reads on a detour evening (13224
day 4, verbatim, in order):

- "Rubble chokes the path." (×2 — the direct-hop
  refusal; the double line is the engine's own
  behavior, present on the OFF leg too)
- then twelve plain single-tile lines, one per
  detour step, named only by destination tile type:
  "Travel 1 tile to forest floor." … "Travel 1
  tile to creek." … "Travel 1 tile to thicket." …
  ending "Travel 1 tile to Haven."
- "You walk back into Haven. 4 Codex entries. The
  village is glad to see you."
- "Walking 5 squares (10 kcal)…" (the lodge walk)
- "You step into the Haven hall."

The #1394 blank is confirmed in its detour form:
there is no "going around" line, and the routed
return does not even arrive as a single "Travel N
tiles to Haven." line — it arrives as twelve
"Travel 1 tile to <tile>." lines. A player reading
day 4 would see a long silent walk around the edge
of the world with no sentence explaining why the
route bends. The walk is honest (every step is a
real tile the villager steps on) but unnarrated as
a detour.

#1428, answered: the night away IS marked — but as
rough sleeping, not as a named stranding. Every
refused evening's following morning carries these
sleep lines (13224 mornings 5 and 6, verbatim):

- "Sleeping rough means the cold ground — heal ~16."
- "You settle into the cold ground. Sleep takes you."
- "You camp wild tonight — no pantry meal. Eat from
  your pack."
- At dawn: "Dawn. You wake stiff and cold. (+2
  health, energy restored. Your sleeping body burned
  less — 192 kcal conserved. Exposed. You'll wake
  stiff.)"

Nothing in those lines names the creek, the rubble,
or the refusal as the cause — the only place-marker
is the morning position itself (creek (4,2), outside,
182 kcal on 13224 day 6). Contrast the rescued
mornings: zero sleep-rough markers, inside at haven,
2062–2400 kcal. So the night away is marked in the
sleep system, and the stranding's cause and place
are not narrated anywhere.

One nuance, flagged not smoothed: on 13029, the
morning after the LAST refused evening (day 23) shows
the villager already inside at haven — the policy's
morning trip home (competent.js trip-home logic,
not traced step-by-step here) brings them in by the
next daily's start, even though the night itself was
rough at the meadow. Morning rows in this corpus are
start-of-next-daily positions (post-sleep + morning
policy activity), not pure post-sleep snapshots; the
sleep-rough lines, not the morning position, are the
reliable night-away marker.

## Before/after numbers (identical seeds, same driver/substrate)

Substrate (asserted FATAL in the tracer):
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1, POLICY=nighttravel, BLOCKTYPE_DIAG=1,
DAYS=30. OFF = COMPETENT_EVENING_DETOUR=0, ON = 1.

| Seed | Leg | Refused | Detours (rescued/stopped/nopath/died) | Out-of-reach | Completed+inside | Days | Max wave |
|---|---|---|---|---|---|---|---|
| 13224 | OFF | 2 (days 4–5) | 0 | 5 | 23 | 30 | 1 |
| 13224 | ON | 0 | 18 (18/0/0/0) | 0 | 30 | 30 | 2 |
| 13029 | OFF | 5 (days 19–23) | 0 | 7 | 17 (+1 combat-interrupted) | 30 | 2 |
| 13029 | ON | 0 | 1 (1/0/0/0) | 7 | 23 | 30 | 2 |

13224 ON wave 2 vs OFF wave 1 is a single-seed
observation (the rescued village progresses one wave
further in 30 days), not a movement claim — no panel,
no replication, and wave unlocks are not the prereg's
judge. 13029's ON out-of-reach count (7) equals its OFF
count (7): days 20–23 end at haven instead of the
meadow, while other days remain out of reach — the
rescue ends the refused episode, not all away nights.

## Step-by-step trace tables

### 13224 ON — all 18 detours (departure creek (4,2) every time; BFS 12, walked 12, kcal Δ 0, ticks detour-start→post-entry 5, entry steps 5, arrival haven (4,4) inside, morning haven inside)

| Day | BFS | Walked | kcal Δ | Ticks before → post-entry | Morning kcal |
|---|---|---|---|---|---|
| 4 | 12 | 12 | 0 | 403 → 408 | 2320 |
| 5 | 12 | 12 | 0 | 385 → 390 | 2400 |
| 7 | 12 | 12 | 0 | 273 → 278 | 2287 |
| 8 | 12 | 12 | 0 | 385 → 390 | 2296 |
| 10 | 12 | 12 | 0 | 257 → 262 | 2400 |
| 11 | 12 | 12 | 0 | 385 → 390 | 2358 |
| 13 | 12 | 12 | 0 | 401 → 406 | 2062 |
| 14 | 12 | 12 | 0 | 385 → 390 | 2338 |
| 16 | 12 | 12 | 0 | 401 → 406 | 2313 |
| 17 | 12 | 12 | 0 | 387 → 392 | 2390 |
| 19 | 12 | 12 | 0 | 385 → 390 | 2400 |
| 20 | 12 | 12 | 0 | 387 → 392 | 2288 |
| 22 | 12 | 12 | 0 | 273 → 278 | 2390 |
| 23 | 12 | 12 | 0 | 387 → 392 | 2399 |
| 25 | 12 | 12 | 0 | 273 → 278 | 2334 |
| 26 | 12 | 12 | 0 | 385 → 390 | 2322 |
| 28 | 12 | 12 | 0 | 273 → 278 | 2110 |
| 29 | 12 | 12 | 0 | 385 → 390 | 2328 |

Full step list (day 4, representative — all 18 share
the path): (4,2)→(3,2)→(3,1)→(3,0)→(4,0)→(5,0)→
(6,0)→(6,1)→(6,2)→(6,3)→(6,4)→(5,4)→(4,4). All
steps orthogonal singles, all moved, 0 combat.

### 13029 ON — the single detour

| Day | BFS | Walked | kcal Δ | Ticks before → post-entry | Morning kcal |
|---|---|---|---|---|---|
| 19 | 4 | 4 | 0 | 401 → 406 | 2222 |

Path (departure meadow (4,2)): (4,2)→(5,2)→(5,3)→
(4,3)→(4,4) — identical to the census path. Note
(again, as in the census): the path steps onto the
blocked tile (4,3) from (5,3) — the rubble refuses
the direct (4,2)→(4,4) hop but the (5,3)→(4,3)
step is travelBlockage-clean. The blockage is
leg/direction-specific, not a sealed tile. Days
20–23 on the ON leg end at haven (preStep 4,4) and
never refuse: the episode ends with the rescue.

## Guards (all pass)

(a) OFF REPRODUCTION: 13224 OFF == census exactly
    (2 rubble evenings, loopDays 4–5); 13029 OFF ==
    census exactly (5 rubble evenings, loopDays
    19–23). No mismatch to explain.
(b) DETERMINISM: ON 13224 re-run to a scratch
    directory reproduces the judged ON file
    byte-identically (shell cmp, twice: once during
    analysis, once inside the proof run); the
    scratch directory was deleted before handoff,
    per prereg.
(c) DIVERGENCE AUDIT: first OFF/ON evening-row
    difference on 13224 is loopDay 4 (the first
    detour evening itself); on 13029 it is loopDay
    19 (likewise). No earlier difference on either
    seed.
(d) UNCLASSIFIED EVENINGS == 0 on both legs, both
    seeds (every evening outcome known; every
    refused evening's blocktype record classified).

## Reachability verdict (waves 1–5, regional → national, table, win flag)

NOT OBSERVABLE in 30-day position traces — reported,
not claimed. What IS in the files: wave 4–5 unlocks
0/2 seeds on both legs; max wave 1–2 only. No
national/table/win movement is claimed from this
run; the trace is a nightly-walk instrument, and a
30-day trace cannot move a scale-wall number.

## Wall numbers (every run)

- National: NOT OBSERVABLE in 30d traces (no field).
- Table: NOT OBSERVABLE in 30d traces (no field).
- Wins: NOT OBSERVABLE in 30d traces (no field); 0 win
  flags present.
- Wave 4–5 unlocks: 0/2 seeds, both legs.
- Median survival: 30 days, both legs, both seeds
  (all four legs survived 30 days).

## Village assessment (plain words)

Two villages, thirty days in, and the detour changes
what their nights feel like without changing what
their days want. On 13224, the villager's days keep
pointing at the same creek — a survey for an elder,
forage, water — and every evening the rubble says
no. With the detour off, that means two refused
nights and then five nights too far out to even be
offered the trip home, waking thin (182 kcal on day
6) and stiff. With the detour on, it means eighteen
identical twelve-step walks around the top edge of
the world, each ending in a hall meal and a full
belly (2062–2400 kcal at dawn) — the villager is
fed and housed every night and still walks back out
to the same blocked creek every morning. The rescue
works; the routine that needs rescuing doesn't
change. On 13029 the story is kinder: one rescued
night breaks the episode, and the villager's days
stop ending at the blocked meadow at all. The blank
this run fills is the measured 12-step walk itself —
full path, zero resource cost, arrival before sleep,
eighteen repetitions and one clean break. The blank
it documents but does not fill is the narration: no
line ever says "going around," and no line ever
says why the walk bends.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as
pre-registered before judging: this leg is a 30-day
position trace of a POLICY-SIDE gate — zero src/js
changes, so there is no game-root delta for a panel
to compare, and the panel's registry policies do not
include the trace policies this arm measures. The
pre-registered completeness bar above is the judge.
No telemetry deviation check is meaningful on these
corpora either (no national / table / wins / exiled
fields exist in 30-day position traces), so none is
faked.

## Metric review (mandatory — doubts for the NEXT run, never a re-score)

- The "offer rate" needed two definitions, and the
  run proved why: the ON-leg rate (attempts / hop
  refusals encountered) is 1.0 by construction and
  says almost nothing, while the re-encounter rate
  (OFF-refused evenings re-met as refusals on the
  ON leg) carries the real behavioral story (1.0 on
  13224, 0.2 on 13029). Future detour preregs should
  pre-register the re-encounter rate as the primary
  offer metric and the ON-leg rate as a guard only.
- The completeness bar worked as written (0 untraced
  on 19 detours), but it does not capture repetition:
  18 identical rescued nights on one seed is a
  different finding from 18 distinct rescues, and the
  bar counts them the same. A future prereg for a
  recurring-refusal seed should pre-register a
  repetition count (detours per seed) beside the
  completeness bar.
- Morning rows are start-of-next-daily positions
  (post-sleep + morning policy activity), not pure
  post-sleep snapshots — the 13029 day-24 morning
  (inside at haven after a refused night at the
  meadow) proves the distinction matters. Future
  preregs using morning-after as a persistence check
  should say so explicitly and pair it with the
  sleep-line check, which is the reliable night-away
  marker.
- The detour walk's tick accounting rests on one
  inference (evening ticks == entry steps ⇒ walk
  ticks 0). It held exactly on all 19 detours, but a
  future instrument that wants walk ticks separated
  from Go-inside ticks needs a policy-side
  ticksAfterDetour snapshot — a named instrument
  gap, not a verdict gap.

## Next lever note (design question, NOT judged here)

Whether a 12-step night walk SHOULD be offered is
Steve's call, with this measured cost attached: 0
kcal, 0 ticks beyond the entry leg, arrival inside
before sleep, zero combat across 19 walks — the
walk is free in resources and reliable in outcome.
What it is not free in is repetition and sense: on
13224 it recurs 18 nights in 30 days with no line
explaining the bend, because the daytime loop keeps
sending the villager to the same blocked creek. The
lever question for the next arm is therefore not
"can the villager walk 12 steps" (answered: yes)
but "should the night walk, the daytime destination,
or the narration change when the same refusal recurs
night after night" — a design ruling, with the
repetition count (18) and the narration gap (no
"going around" line) as its evidence.

## Evidence files

- Prereg: evidence/2026-10-29/sim-rubbleroute-b-prereg.md
  (commit a5b494c94, before any judged leg)
- This file: evidence/2026-10-29/sim-rubbleroute-b.md
- Analysis: evidence/2026-10-29/sim-rubbleroute-b-analysis.json
- Corpora (OFF + ON, 2 files each):
  evidence/2026-10-29/sim-rubbleroute-b-corpus-off/
  evidence/2026-10-29/sim-rubbleroute-b-corpus-on/
- Instruments: scripts/rubbleroute-trace-b.js,
  scripts/analyze-rubbleroute-b.js
- Proofs: scripts/test-rubbleroute-b.js (PROOF-GREEN,
  including T6 determinism byte-compare; the rerun
  scratch directory was deleted before handoff, per
  prereg)

## Landing note for the coordinator

DIAG-GO, measurement only: the 12-step walk is
walked in full, 19/19 rescues, 0 untraced detour
evenings, all guards pass. What the branch holds:
the tracer + analyzer + proof instruments, the
OFF/ON corpora for 13224 + 13029, and this evidence.
No src/js change, no default flip, no driver adopts
the policy. Backlog disposition for the coordinator
to record (this worker does NOT touch goal
hidden_files): #1427 ANSWERED (12-step walk walked
in full, 0 kcal / 0 walk ticks, arrival before
sleep); #1428 ANSWERED (night away IS marked, as
rough-sleeping lines + stiff dawn, but never named
as a stranding at a place or from a cause);
#1394 CONFIRMED in detour form (no "going around"
line; the routed return reads as twelve "Travel 1
tile to <tile>." lines, not one "Travel N tiles to
Haven." line). Next-lever note above carries the
SHOULD question (12-step night walk offered 18
nights running) for Steve's ruling. This worker does
NOT merge to master — coordinator merges. Worktree
contains only committed work at handoff (verified
before reporting).
