# sim-detourgeo-b — the evening detour's unplayed branches: nopath PLAYED, combat + step-refused DIAG-NO-GO

Run: oversight-flesh-out-loop-b, arm sim-detourgeo-b, axis
food-economy. Worktree sim-detourgeo-b. POLICY-SIDE ARM
ONLY: zero src/js changes, zero default flips, no driver
adopts the policy by default. This worker does NOT merge
to master — coordinator merges.

Design source (not invented here): evidence/2026-10-29/
sim-eveningdetour-b.md, whose sense-testing section
names the stopped/nopath branches as designed and coded
but unplayed (0/32 detours stopped, 0 no-path, 0
mid-detour combat across pilot + confirm), and the
engine itself (Game.travelTo / travelBlockage /
travelTargets, scripts/policies/nighttravel.js).
Prereg (committed BEFORE any judged leg):
evidence/2026-10-29/sim-detourgeo-b-prereg.md, commit
0705e2037, plus Amendment A (commit 474d36ad3,
committed BEFORE any nopath verdict — see below).

## Verdict: GO with two DIAG-NO-GO branches (per-branch verdicts, not a blanket claim)

| Branch | Verdict | Evidence |
|---|---|---|
| detour-nopath | PLAYED (bar met) | 8/8 constructed evenings, all guards hold |
| detour-stopped / combat | DIAG-NO-GO (gap named) | 0 firings across 24 constructed detours (96 steps) + natural sweep; wanderer contact fired 16/16 and still set no combat |
| detour-stopped / step-refused | DIAG-NO-GO (gap named) | 0 refused steps across 96 constructed steps + 99 prior-run steps; mechanism proof sketch below |

A whole-run GO here means: the nopath branch is now
played and honest, and the other two branches are
closed as unreachable-by-honest-construction with
their gaps named — NOT that they were played. Any
future adoption claim for the detour gate must
exclude the combat and step-refused branches until
the engine changes underneath them (see "What
would have to change").

## What "played" means here (and what it does not)

A branch counts as PLAYED only when a real evening
step (nighttravel.nightStep, the exact function the
policy's daily invokes) produces it from a real Game
state: an honest hop refusal first, then the
instrument's own BFS and loop. No branch in this
run was produced by calling bfsDetourPath directly,
by setting pendingEncounter/tbfight by hand, by
clock-setting, or by position writes — all four
were forbidden in the prereg and none was used.
What IS scenario construction, stated plainly: the
player reaches the staging tile by honest
Game.travelTo steps only, and the blocking geometry
is staged by tile mutation (blockFrom flags) — the
same class as the repo's own debug scenarios
(src/js/debug-scenarios.js stages blockFrom
directly). The hop refusal, the BFS, and the branch
outcome are all produced by the real instrument
code on the real engine, never by the test.

## Pilot-stage corrections (Amendment A — before any nopath verdict)

Two staging bugs were found on the first pilot
battery (seed 20101, creek construction) and fixed
before any branch verdict:

1. Creek enclosure does not enclose a swimmer.
   The seed-20101 bearer has the swimmer skill
   lane, so travelBlockage passes unbridged creek
   tiles (verified directly: blockage null on a
   staged creek tile), and the N leg rescued via
   (3,5)->(4,5) instead of going no-path. The
   creek construction is retired; the replacement
   cage construction (haven entry blocked from the
   player's side, plus each of the player's other
   three neighbours given a blockFrom guarding
   entry from the player tile itself) uses
   blockFrom only and encloses any bearer. Bar
   unchanged; only staging geometry changed.
   The superseded seed-20101 creek battery is
   described here and in Amendment A; its file was
   overwritten by the amended re-run, so the
   superseded numbers survive in this narrative,
   not in the corpus file.
2. Wanderer staging wrote to Game.state.wanderer,
   but the engine reads Game-level this.wanderer
   — so wanderer contact was never staged on the
   first seed-20101 C2/C3 legs, and those legs are
   NOT counted as wanderer-contact attempts. The
   battery now stages Game.wanderer. C1
   (monster-on-path) staging was correct and its
   first-leg result stands as an attempt.

## Constructed battery (judged legs, 8 seeds: 20101–20108)

Instrument: scripts/test-detourgeo-b.js (battery
mode) — one fresh game per track per seed, say-log
captured, guards asserted in-script (exit non-zero
on any guard violation on a fired branch). All 8
batteries exited batteryOk=true, 0 guard problems.
Corpora: evidence/2026-10-29/
sim-detourgeo-b-corpus/s20101.json … s20108.json.
Analysis: evidence/2026-10-29/
sim-detourgeo-b-analysis.json (scripts/
analyze-detourgeo-b.js).

### Track N — no-path: PLAYED 8/8

Construction (cage): player on a haven-adjacent
tile (W in 7 seeds, N in seed 20104 — first
stageable direction), haven entry blocked from
the player's side, player's other three neighbours
caged from the player tile. Every leg: hop offered
(d=1) and refused ("Rubble chokes the path."),
BFS null, outcome 'detour-nopath',
stoppedReason 'no-path', 0 detour steps.

| Seed | Player tile | Evening position after | kcal delta | Guards |
|---|---|---|---|---|
| 20101 | (3,4) | (3,4) — unchanged | 0 | H1/H2/H4 hold |
| 20102 | (3,4) | (3,4) — unchanged | 0 | H1/H2/H4 hold |
| 20103 | (3,4) | (3,4) — unchanged | 0 | H1/H2/H4 hold |
| 20104 | (4,3) | (4,3) — unchanged | 0 | H1/H2/H4 hold |
| 20105 | (3,4) | (3,4) — unchanged | 0 | H1/H2/H4 hold |
| 20106 | (3,4) | (3,4) — unchanged | 0 | H1/H2/H4 hold |
| 20107 | (3,4) | (3,4) — unchanged | 0 | H1/H2/H4 hold |
| 20108 | (3,4) | (3,4) — unchanged | 0 | H1/H2/H4 hold |

Gate-OFF controls (identical cage, gate off):
8/8 'travel-refused' with detourAttempted false
(H5 holds) — the no-path outcome is instrument
behavior, not construction artifact. No firing
ended with Game.over true; no detour step exists
to teleport (H1 vacuous-and-clean: 0 steps).

### Tracks C1/C2/C3 — mid-detour combat: 0 firings, DIAG-NO-GO

Construction: player two tiles from haven, direct
hop refused on the middle tile's blockFrom,
BFS path length 4 around it (e.g. (2,4) via
(2,5)->(3,5)->(4,5)->(4,4) on seed 20101).
C1 stages a world monster (spawnWorldMonster, the
engine's own spawn) on every predicted-path tile;
C2 stages the wanderer (Game.wanderer) on the
first path tile; C3 stages both. 24 detours, 96
steps, 0 combatLive steps, 0 stopped evenings —
all 24 rescued onto haven with full BFS paths
walked (H1 orthogonal + chain hold on all 24,
H3 path lengths recorded: 4-step paths).

The decisive detail: wanderer contact FIRED on
16/16 C2/C3 evenings — 8 times as "Something big
is HERE. In the grid with you. You can see it.
It can see you." and 8 times as the claimed-ground
variant ("Something big pads at the edge of the
clearing — then thinks better of it. This ground
is already claimed.", when the spawn roll had
already put a monster on the tile). In all 16,
the detour continued to the next step and rescued.
Contact with a monster mid-detour demonstrably
does NOT set the combat state the detour loop
checks (inCombat / pendingEncounter / live
tbfight): checkEncounter's spawn roll and
wanderer-contact branch spawn a world monster
but set no pendingEncounter, and travelTimeStep's
world step runs villagerTurn only. The loop's
combat check therefore has nothing to catch
during node travel.

Named construction gap (for the next run, not a
re-score): the only code route to mid-detour
combat found is a detour step whose tickAction
crosses a day-part boundary, so advancePart's
moveWanderer walks into the player and
triggerEncounter fires — but staging that
requires setting the clock to a part boundary,
which the prereg forbids as clock-setting, and
in a real evening (dayPart 3) the next boundary
is endDay itself, so the combat would arrive
tangled with sleep. Until the engine gains a
node-travel combat trigger (or the detour loop
is redefined to treat monster contact as a stop),
the combat branch is defensive dead code.

### Track S — step-refused: 0 firings, DIAG-NO-GO

0 refused steps across the 96 constructed steps
above, plus 0 across the 99 steps of
sim-eveningdetour-b's judged detours (prior run)
— 195 detour steps, 0 step-refusals, under
worlds containing staged monsters, a staged
wanderer, and busy-world detours.

Mechanism proof sketch (stated in the prereg
before judging, confirmed by the data): for a
d=1 detour step, BFS-clean and travelTo-clean are
the same check — travelBlockage from the same
origin over the same tile state — and no runtime
system creates a blockage mid-detour (blockages
are set only at world-gen; clear/bridge only
remove them; verified by grep over blockFrom /
needsBridge writes). A step-refusal would need a
mid-detour world mutation that the engine does
not offer. The branch is defensive dead code
under the current engine. It must not be "fixed"
by inventing a mutation, and must not be claimed
played.

## Natural sweep (pilot)

Scan: gate-OFF nighttravel legs, same driver and
substrate as sim-eveningdetour-b (COMPETENT_FEAST=0
SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1, 30 loop-days,
tap days last 5), seeds 11520–11579 (60 fresh seeds,
corpora sim-detourgeo-b-scan-off/ + -scan-off2/).
Qualifiers (>= 1 refused evening): only 3 of 60 —
11524 (4 refused), 11540 (2), 11553 (3). That 5%
rate is far thinner than the prior run's confirm
scan (4/20), and it is reported as a finding, not
hidden: refused-prone seeds are rarer in this
range than the prereg's "until 8 qualify" assumed.

Deviation, stated plainly (not a bar change): the
pilot natural band is 3 seeds, not 8. Chasing 8
would cost roughly 100 more 30-day legs for
corroboration only — the branch verdicts rest on
the constructed legs (which met their bars) plus
the prior run's 32 real-day detours, and the
prereg itself forbids spending confirm seeds to
chase a branch the pilot mechanism analysis
already rules out. So the natural sweep below is
corroboration, and the shortfall goes under
"metric review" for the next run's scan design
(refused-prone screening needs a richer base
population than blind fresh seeds, e.g. the diag
episode table's refused seeds, before any future
"until 8" rule is written).

Before legs for the 3 seeds are the scan legs
themselves (identical driver, substrate, and
seeds — a deterministic re-run would reproduce
them exactly, so no fresh before-leg spend was
needed). After legs: fresh gate-ON legs on the
same 3 seeds (corpus sim-detourgeo-b-sweep-
after/). Analysis: evidence/2026-10-29/
sim-detourgeo-b-sweep-analysis.json.

| Seed | Before refused | After detours (rescued/stopped/nopath) | After steps (combat) | Days before/after | Deaths before/after | Starv before/after |
|---|---|---|---|---|---|---|
| 11524 | 4 | 1 (1/0/0) | 3 (0) | 30/30 | 9/8 | 0/0 |
| 11540 | 2 | 1 (1/0/0) | 2 (0) | 30/30 | 10/9 | 0/0 |
| 11553 | 3 | 1 (1/0/0) | 5 (0) | 30/30 | 11/5 | 0/0 |
| Total | 9 | 3 (3/0/0) | 10 (0) | — | 30/22 | 0/0 |

Guards: G1 median daysAlive 30 vs 30 (hold); G2
starvation 0 vs 0 (hold); G3 honesty 0 teleport
steps, 0 rescued-off-haven, 0 combat-then-inside,
0 of 9 before-leg still-refused evenings moved
(all hold). Detour paths walked: 11524
(2,4)->(3,4)->(4,4) 3 steps; 11540 (4,3)->(4,4)
2 steps; 11553 (7,5)->(6,5)->(5,5)->(4,5)->(4,4)
5 steps. The before→after refused collapse (9
→ 3 first-refusals, all rescued) is the same
trajectory-divergence shape as the prior run:
a rescue puts the villager home, so the rest of
the would-be refused episode never occurs. No
sweep evening stopped, went no-path, or met
combat — consistent with the constructed verdicts
(these geometries were all open detours), and
adding 3 rescued / 0 branch evenings to the
prior run's 32 real-day detours.

One wrinkle, recorded not hidden: seed 11553's
maxWaveUnlocked falls 2 → 1 on the after leg.
That is trajectory divergence (a different lived
month: fewer deaths overall, 11 → 5, and a
different kill path), not a detour effect on
waves — the detour moves one villager home a
few evenings; it does not grant or remove wave
unlocks. No guard covers maxWave, and none is
invented here.

Sweep sense (seed 11553, loop-day 10, 5-step
detour): "A fallen tree blocks the path." then
five travel lines home, with a Drum-Belly
following step by step ("It followed you. The
Drum-Belly is here." ×3, then a Rut King takes
up the trail), both stopping at the treeline /
boundary ("The Rut King stops at the treeline —
pacing, unwilling. The walls end the argument."),
then "You walk back into Haven. 17 Codex
entries. The village is glad to see you.",
lodge walk, hall. A real walk home with real
followers that honestly stop at the walls — the
same follower honesty the prior run recorded,
now on a natural (unstaged) detour. Nothing
robotic in the tail; the detour's missing
"going around" line (prior run's named blank)
is still missing here too, felt across five
unexplained travel lines in a row.

## Sense-testing (read transcripts, judged for meaning)

- NOPATH (seed 20101, cage, player (3,4)): the
  whole evening's say-log is one line — "Rubble
  chokes the path." — and the player stays
  standing on (3,4). That reads honestly as far
  as it goes: tried the crossing, was refused,
  went nowhere, claimed nothing. What is missing
  is any line saying the night is spent out here:
  the instrument returns without narration, and
  sleep-away is the harness's business, not a
  spoken beat. A player following the log would
  see a refusal and then the next morning, with
  no sentence bridging them. That narration gap
  is documented here, not built (same class as
  the prior run's missing "going around" line —
  a separate named blank, not a guard failure:
  the prereg sets no narration guard for nopath).
- RESCUED WITH MONSTER CONTACT (seed 20102 C2,
  wanderer on (2,5)): "Rubble chokes the path."
  then travel lines, then "Something big is
  HERE. In the grid with you. You can see it.
  It can see you." — and then the walk simply
  continues: next travel line, arrival, lodge
  walk, hall. The contact beat lands as a real
  moment (the monster IS there, on the tile you
  just entered), but the detour walks straight
  past it with no reaction, no fight, no
  acknowledgement after the line. That reads
  slightly off as a played evening — not robotic
  repetition, but a monster sighting with no
  consequence. It is the sense-side twin of the
  combat DIAG-NO-GO: the engine says "it is
  here" and the instrument has no verb for it.
  If the detour gate ever becomes game behavior,
  this beat needs a design (stop? fight? flee?)
  rather than a silent walk-past.
- RESCUED, monster on path (C1 legs): no contact
  line at all — the staged monsters are walked
  past without a word (they wander, they hold,
  they never trigger). The walk reads as a plain
  walk home; the monsters' silence is the
  engine's normal node-travel behavior (monsters
  live in grids, node travel does not meet them),
  not a detour-specific lie. Still, a player who
  knew a beast was staged on the path would find
  the silence odd — same design question as
  above, at lower volume.

## Village assessment (plain words)

These are not villages lived in for a month —
they are single evenings, staged and played. What
they show is the shape of the instrument's
honesty at its edges. When the way home is truly
closed (the cage), the bot does the honest thing
it should: it stays where it stands, charges
nothing, claims nothing, and leaves the refusal
as the last word. When the way home is open but
a monster is standing on it, the bot walks home
anyway — past the beast, past the "it is HERE"
beat, without a fight and without a flinch. The
blank this run fills is the no-path branch:
played, 8 times, clean. The blanks it documents
but does not fill are the combat branch (no
honest trigger exists in node travel), the
step-refused branch (no honest trigger exists
at all under the current blockage law), and the
narration for both unrescued endings (no line
says "you spend the night out here") and for
monster contact mid-detour (no verb answers
"it is HERE").

## Reachability verdict (waves 1–5, regional → national, table, win flag)

NOT OBSERVABLE in constructed single evenings —
reported, not claimed. The natural-sweep legs
carry maxWaveUnlocked per seed; see the sweep
section for those numbers. No national / table /
win movement is claimed from this run; the
instrument is a nightly-position policy, and a
single evening cannot move a scale-wall number.

## Wall numbers (every run)

- National: not observable in 30d traces (no
  field) — reported, not claimed.
- Table: not observable in 30d traces (no
  field) — reported, not claimed.
- Wins: not observable in 30d traces (no
  field); 0 win flags present.
- Wave 4–5 unlocks: 0/60 across the fresh scan
  (maxWave hist: 1:11, 2:46, 3:3); 0/3 on the
  sweep after-legs (2, 2, 1). No wave-4 or
  wave-5 unlock in any corpus of this run.
- Median survival: 30 days on all 60 scan legs
  (60/60 survived 30 days) and 30 days on all 3
  sweep after-legs; constructed evenings carry
  no survival statistic.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as
pre-registered before judging: this leg is a
policy-side instrument measurement with zero
src/js changes, so there is no game-root delta
for a panel to compare, and the panel's registry
policies do not include the trace policies this
arm measures. The before/after instrument is the
constructed-evening battery plus the custom
driver on identical seeds, and the pre-registered
bars above are the judge.

## What would have to change (for the DIAG-NO-GO branches)

- Combat branch: the engine would need a
  node-travel combat trigger — e.g. stepping
  onto a monster-occupied tile setting
  pendingEncounter, or the detour loop treating
  a monster-contact line ("it is HERE") as a
  stop. Either is a game-design decision (it
  changes what node travel means for every
  walk, not just detours) and belongs to a
  design run with Steve's eyes, not a
  policy-side patch here.
- Step-refused branch: nothing short of a
  runtime blockage-creating system (a world
  event that closes a path mid-walk) could fire
  it — no such system exists, and inventing one
  to exercise a defensive branch would be
  building a system to test a test. Leave the
  branch as defensive code, documented.

## Metric review (mandatory — doubts for the NEXT run, never a re-score)

- The natural sweep's "until 8 qualify" rule
  assumed a refused-prone rate the fresh range
  did not have (3/60, not ~4/20). A future
  sweep prereg should either screen from a
  refused-enriched base (the diag episode
  table's refused seeds, which are already
  known) or pre-register a scan cap with a
  shortfall rule (e.g. "if <8 qualify after
  60 seeds, judge on qualifiers found and
  report the rate") instead of an open-ended
  "until 8". The scan legs doubling as before
  legs (identical driver/substrate/seeds,
  deterministic re-run) held up here and is
  worth pre-registering explicitly next time
  rather than re-running before legs fresh
  out of habit.
- The single-firing bar for a code path proved
  right for nopath (8 firings, all clean, and the
  bar would have been met at 1) — but for the
  two DIAG-NO-GO branches, "1 firing" as a bar
  combined with "unreachable" as an outcome
  needed the mechanism analysis to be written
  BEFORE judging, which this prereg did. Future
  branch-robustness runs should keep that order:
  mechanism first, bar second, attempts third.
- The cage construction generalizes the retired
  creek construction: any future enclosed-geometry
  staging must check the bearer's skill lanes
  (swimmer passes creeks; other lanes may pass
  other staged obstacles) or use blockFrom only.
  Staging that assumes a tile type blocks is
  bearer-dependent and must say so.
- The wanderer-staging level (Game vs state) is
  a trap for future tests: the engine reads
  this.wanderer, while wandererNextDay lives on
  state. A test that stages one on the wrong
  object fails silently (no error, just no
  contact) — the s20101 C2/C3 legs are the
  standing example. Future battery scripts
  should assert the staged object is visible to
  the engine (e.g. read back Game.wanderer)
  before playing the evening.
- Morning persistence after an unrescued evening
  is still unmeasured by design: constructed
  evenings stop at the evening step, so what
  sleep does to a caged player overnight is not
  in this corpus. If a future run makes it a
  guard, it must drive the sleep leg, not infer
  it from the evening record.
- The "it is HERE, walk past it" beat (C2/C3
  contact evenings) suggests a metric the next
  run could pre-register if the detour gate ever
  becomes game behavior: monster-contact evenings
  should have a defined outcome (stop / fight /
  acknowledged pass), not just a rescue rate.
  That metric belongs to a design run, not to
  this measurement run, and no guard was changed
  because of it here.

## Evidence files

- Prereg: evidence/2026-10-29/
  sim-detourgeo-b-prereg.md (commit 0705e2037,
  before any judged leg; Amendment A commit
  474d36ad3, before any nopath verdict)
- This file: evidence/2026-10-29/
  sim-detourgeo-b.md
- Constructed corpora: evidence/2026-10-29/
  sim-detourgeo-b-corpus/ (8 battery files)
- Constructed analysis: evidence/2026-10-29/
  sim-detourgeo-b-analysis.json
- Natural sweep corpora: evidence/2026-10-29/
  sim-detourgeo-b-scan-off/ (20 gate-OFF legs),
  sim-detourgeo-b-scan-off2/ (40 gate-OFF legs),
  sim-detourgeo-b-sweep-after/ (3 gate-ON legs)
- Natural sweep analysis: evidence/2026-10-29/
  sim-detourgeo-b-sweep-analysis.json
  (targeted aggregation; the eveningdetour
  analyzer was not used for the verdict table
  because it expects matching seed sets and the
  scan/after sets differ by design)
- Instruments: scripts/test-detourgeo-b.js
  (battery + guards, 8/8 batteryOk), scripts/
  analyze-detourgeo-b.js
- Proof: battery script exit 0 on all 8 seeds
  with 0 guard problems; analyzer aggregation
  above. No nighttravel.js change, no
  competent.js change, no src/js change.
  Repo-wide scripts/check.js --quick was started
  but stopped after ~12 min without completing
  (sibling check runs were active concurrently
  and this change touches no game code) — the
  run's proof is the battery + analyzer above,
  not a check.js gate claim.

## Landing note for the coordinator

GO-with-DIAG-NO-GO lands evidence + scripts +
prereg ONLY. NO nighttravel.js change (the
instrument behaved honestly on every played
branch; the unplayed branches need engine-level
design, not a policy-side patch), NO default
flip, NO src/js change. This worker does NOT
merge to master — coordinator merges. Worktree
contains only committed work at handoff
(verified before reporting). Report: 'committed
in worktree, pending coordinator merge' (this
worker was not told of a merge).
