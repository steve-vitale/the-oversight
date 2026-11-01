# sim-detourclear-b — DIAG: could the villager CLEAR the blocking tile instead of walking around?

Run: oversight-flesh-out-loop-b, arm sim-detourclear-b. Worktree
sim-detourclear-b, branch sim-detourclear-b. Worktree HEAD at
prereg writing time 7c8745741; prereg commit 044f6005e
(committed BEFORE any judged leg); instruments commit ce96ebe00
(driver + analyzer + proof test, 28/28 green). DIAG ONLY
(measurement): zero src/js changes, zero policy-default flips,
zero edits to any existing policy file or existing script. New
files only: prereg, detourclear driver + analyzer + proof test,
evidence, census/probe corpora + analyses. This worker does NOT
push, bump, verify live, merge into master, or touch the sibling
Loop A tree/branch, any journey-* tree/branch, or the main tree;
the coordinator merges. Status to coordinator: committed on
branch, pending coordinator merge.

## Verdict: GO — judged exactly against the prereg bars

The binding prereg (evidence/2026-11-01/
sim-detourclear-b-prereg.md, commit 044f6005e, written BEFORE
any judged leg) set four bars, ALL of which must hold:

(a) >= 8 census refused evenings with COMPLETE classification
    — PASSED: 47 refused, 47 complete (0 surprises).
(b) >= 8 probe attempts, at least one per observed block type
    — PASSED: 25 attempts (creek 21, fallen_tree 3, washed_out 1).
(c) A verdict-table row per observed block type (rubble only if
    observed, else a proven-zero statement) — PASSED: see table
    below; rubble 0 in this census AND 0/39 in offergeo pooled.
(d) Proof test green + every number re-readable from a
    committed corpus file — PASSED: scripts/test-detourclear-b.js
    28/28 green; all numbers below are analyzer output over the
    committed corpora listed in Files.

GO is still DIAG: it authorizes NO src/js fix and NO default
change. What the arm delivers is the answer to the question
offereo left open: clearing beats detour for hand-clearable
blocks, and detour is the only answer for creeks — with the
binding constraint measured, not assumed (wood carried = 0 on
all 47 refused evenings).

## The answer, in one paragraph

Clearing works exactly where the code says it should and fails
exactly where it says it must. Fallen trees cleared 3/3 and a
washed-out gap scrambled 1/1 — each for a one-night work cost
(60 kcal / 32 ticks, +2 wood; 80 kcal / 32 ticks), each followed
by a successful re-hop home, and each ending that seed's strand
for good: zero later travel-refused evenings on all four cleared
seeds, against 12, 5, 4, and 5 census nights stuck on the same
tile. Creeks cleared 0/21: a creek cannot be cleared by hand,
no refused evening carried the 4 wood a bridge needs (wood = 0
on 47/47), and no refused villager was a swimmer (swimmer =
false on 47/47 — as the engine implies, since travelBlockage
returns no block for a swimmer). And the creek detour is cheap
anyway: 2 steps, free, on all 21 creek evenings — so even a
wood-carrying villager would be paying 4 wood + 96 ticks to
beat a 2-step walk. The clearing-vs-detour choice is therefore
not a judgment call per evening; it is decided by block type:
fallen/rubble/washed = clear once, sleep home ever after;
creek = walk around (or, one day, arrive carrying wood).

## Code facts verified live (not just read)

From src/js/game.js clearBlockage / buildBridge /
travelBlockage, verified by the probe leg:

| Block type | Clearable by hand? | Probe result | Measured cost | Detour (median) |
|---|---|---|---|---|
| fallen_tree | YES | 3/3 cleared, block gone, re-hop reached haven | 60 kcal, 32 ticks, +2 wood (probe deltas exactly -60 / +32; wood 0 -> 2) | 4 steps (range 3-5) |
| rubble | YES (code) | 0 attempts — never observed | 40 kcal, 32 ticks, +1-3 stone (code only) | — (no data) |
| washed_out | YES (scramble if wood < 4; bridge if wood >= 4) | 1/1 scrambled, block gone, re-hop reached haven | 80 kcal, 32 ticks, wood 0 (scramble branch; bridge branch untested — see limits) | 3 steps |
| creek | NO — bridge (4 wood, 60 kcal, 96 ticks) or swim (20 kcal, swimmer only) | 0/21 cleared; action none-creek-no-wood on all 21; block stayed, no re-hop attempted | n/a (no wood on any evening; no bridge probe fired) | 2 steps |

No tool gate: clearBlockage checks no cutting tool, and all 4
successful clearances were performed by villagers carrying
whatever competent.daily had given them — the "needs an axe"
hypothesis is dead from code and from probe. No day-roll: 0/25
probe attempts rolled the day (ticks left at refusal: creek
min 94, fallen min 47, washed min 101 — every clearance cost
32 ticks, so the roll mode never fired; a 96-tick bridge on a
94-tick evening remains the one untested edge, see limits).
Kcal is not a hard gate in code (it floors at 0), but no
clearable-type probe ran at 0 kcal (all four clearances at
kcal >= 2000), so the floor behavior at 0 kcal is code-read,
not probe-proven, for clearable types.

## Census leg (plain nighttravel, detour OFF, 8 seeds, 30d, all survived)

47 travel-refused evenings, 47 completely classified, 0
surprises (scan-first block always matched the hop's block
kind). Every refusal in a seed is the SAME blocked tile,
night after night:

| Seed | Block | Blocked tile | Nights | Detour | Approach walk |
|---|---|---|---|---|---|
| 17563 | creek | (4,3) | 12 | 2 | 0 |
| 17567 | fallen_tree | (4,3) | 12 | 5 | 1 |
| 17606 | creek | (4,3) | 9 | 2 | 0 |
| 17629 | fallen_tree | (4,3) | 5 | 3 | 1 |
| 17631 | washed_out | (2,4) | 4 | 3 | 0 |
| 17637 | fallen_tree | (4,3) | 5 | 4 | 1 |
| 17568, 17638 | — | — | 0 refusals | — | — |

(4,3) is the tile directly north of haven (4,4): the final
approach tile. The strand is one tile, not a region — which is
why one clearance ends it. Medians across the 47: wood carried
0 on 47/47 (max 0), swimmer false on 47/47, kcal median 480
(creek) / 331.5 (fallen) / 526 (washed), ticks left median
111 / 111 / 119. Census medians by type are in
sim-detourclear-b-census.json.

Note on the creek share (21/47 here vs 4/39 in offergeo):
the legs differ in two stated ways — plain nighttravel here
vs the woodcarry stack there (whose bridge retry rescues creek
refusals, cf. offergeo's 17606 day 4 rescue) plus creekseek
visits that move villagers before the step, and refusal-rich
seed selection here (a classification census, not a prevalence
estimate). The creek share is therefore NOT a field rate; the
per-type verdicts are the deliverable, and they do not depend
on the share.

## Probe leg (same seeds, driver intervenes only on refusals)

25 attempts. The divergence between legs IS the permanence
result:

| Seed | Census refusals | Probe attempts | Later travel-refused evenings in probe leg |
|---|---|---|---|
| 17563 (creek) | 12 | 12 | 11 (still stuck) |
| 17567 (fallen) | 12 | 1 (cleared day 5) | 0 — later evenings all completed |
| 17606 (creek) | 9 | 9 | 8 (still stuck) |
| 17629 (fallen) | 5 | 1 (cleared day 20) | 0 |
| 17631 (washed) | 4 | 1 (cleared day 13) | 0 |
| 17637 (fallen) | 5 | 1 (cleared day 4) | 0 |

Verdict counts (prereg rule, analyzer-computed): creek
detour-only 21/21; fallen_tree clear-beats-detour 3/3
(detour >= 4 on two, repeat >= 2 nights on all three);
washed_out clear-beats-detour 1/1 (repeat 4 nights). No
clear-fails-detour-wins, no both-fail, no neither occurred —
every refused evening had either a working clearance or a
working detour. Full per-attempt rows (walk, action, kcal/tick
deltas, day-roll, re-hop) are in
sim-detourclear-b-verdict.json.

## Clearing vs detour, per block type (the verdict table)

- fallen_tree — CLEAR-BEATS-DETOUR. One night of work (60
  kcal, 32 ticks) buys every later night: the block is deleted,
  the villager walks home, and +2 wood lands in the pack — wood
  that could later fund a bridge elsewhere. Detour (3-5 steps,
  free) must be re-walked nightly and leaves the tree standing
  for the next strand. The only night detour wins is a night
  where the villager cannot spare 32 ticks — never observed
  (min ticks left 47).
- washed_out — CLEAR-BEATS-DETOUR (scramble branch). Same
  shape: 80 kcal, 32 ticks, block deleted, strand ended. The
  bridge branch (wood >= 4: 60 kcal, 96 ticks, 4 wood) was never
  exercised because no refused evening carried wood; on a
  wood-carrying night the tick budget still fits (min ticks
  left 101 >= 96), so the bridge verdict is code-supported but
  probe-unproven.
- creek — DETOUR-ONLY, and the detour is cheap. Clearing by
  hand is refused by the engine; a bridge needs 4 wood the
  villager does not carry (0/47 evenings at >= 4 wood — the
  wood sits in the haven pile, which is exactly where the
  villager cannot get); swimming needs a skill no refused
  villager had. The 2-step detour costs nothing and is already
  proven 32/32 by sim-eveningdetour-b. A future lever that
  wants creek clearance must first solve wood-carrying, not
  clearing — clearing is not the binding constraint.
- rubble — NO DATA, proven-zero twice: 0 in this census, 0/39
  in offergeo pooled. Code says 40 kcal / 32 ticks / +1-3
  stone. The absence itself is a finding for the backlog (see
  below): competent.daily already clears rubble deliberately
  on stone trips (knife half), so rubble rarely survives to
  evening — but that mechanism is not measured in this arm.

## Sense-testing (SENSE-TESTING LAW — transcripts, not counts)

Clearing reads as a person doing roadwork at night, not as a
silent fix. Probe say-windows:

- 17567 day 5 (fallen_tree): "Travel 1 tile to grove." (the
  honest approach walk) / "You cut through the fallen tree.
  +2 wood. The path is clear." / "Travel 2 tiles to Haven." /
  "You walk back into Haven. 5 Codex entries. The village is
  glad to see you." The walk, the work, the arrival, and the
  welcome all narrate in order.
- 17631 day 13 (washed_out): "You scramble through the
  washed-out gap, mud to your knees. The path is passable,
  barely." / "Travel 3 tiles to Haven." / "You walk back into
  Haven." — honest, with one soft mismatch: "passable, barely"
  understates permanence, since the code deletes the block and
  later nights walk it free. A player could reasonably expect
  to scramble again tomorrow. Small narration finding, filed
  below.
- Refusals stay honest in the census leg: "A fallen tree
  blocks the path." / "The creek runs fast here — no crossing
  without a bridge or a swim." / "The path is washed out."
  No silent refusal on any of the 47 evenings.

## Metric review (prereg doubts, answered)

- Plain-nighttravel refusals vs offergeo's mix: DRIFTED as
  predicted (creek 21/47 vs 4/39) for the two stated reasons
  (no woodcarry bridge retry; refusal-rich seeds). The drift
  does not touch any verdict bar — classification completeness
  and per-type verdicts are share-independent.
- Approach-walk step count vs verdicts: approach walks were
  0-1 free steps, all walkOk 25/25, no combat met on any walk
  or re-hop. The walk never changed a verdict.
- Day-roll failure mode: did NOT fire (0/25). Ticks left were
  ample for 32-tick clearances; the 96-tick bridge edge (one
  creek evening at 94 ticks left) is untested because wood was
  absent.
- Kcal floor: code floors at 0, but no clearable probe ran at
  0 kcal, so "affordable at 0 kcal" is NOT claimed — only that
  the engine would not refuse on kcal grounds.
- Balanced panel (§15): N/A to this arm by design. There is no
  lever landing here and no game-code before/after to panel;
  the comparison the task asks for is census-vs-probe legs on
  identical seeds, which is what was run and reported. A future
  clearing lever's landing arm must run the panel then.
- Metric for the NEXT run: if a clearing lever is ever built,
  its prereg must include a wood-carrying precondition (creek
  evenings at wood >= 4) and a 0-kcal clearance probe — the two
  cases this arm could not exercise.

## Findings for backlog (for the coordinator to append)

- [open] 2026-11-01 — clearing-vs-detour — creek clearance
  is wood-bound, not work-bound: 0/47 refused evenings carried
  >= 4 wood, so the bridge path never fired; a creek-clearing
  lever must solve evening wood-carrying first (sim-detourclear-b).
- [open] 2026-11-01 — clearing-vs-detour — rubble never
  reaches the evening step (0 here, 0/39 offergeo) despite
  code support (40 kcal / 32 ticks / +1-3 stone); daytime
  rubble-clearing habit is the suspected cause, unmeasured
  (sim-detourclear-b).
- [open] 2026-11-01 — narration — washed_out scramble line
  ("passable, barely") understates permanence: the code deletes
  the block, so later nights walk it free; a player could expect
  a nightly re-scramble (sim-detourclear-b probe 17631 day 13).
- [open] 2026-11-01 — clearing-vs-detour — bridge branch
  (96 ticks) untested live: nearest case was a creek evening
  with 94 ticks left, below the bridge cost; whether a
  96-tick evening action rolls the day mid-step is still
  unobserved (sim-detourclear-b).

## Limits (stated, not hidden)

- Classification census, not prevalence: seeds were chosen
  because offergeo showed refusals there. Do not quote 21/47
  creek share as a field rate.
- Bridge branch (washed_out with wood, creek with wood) and
  swim branch: code-read only, zero live probes, because wood
  was 0 and swimmer false on every refused evening.
- Rubble: zero observations; its row is code + proven-zero,
  not measured.
- The probe leg is a driver intervention, not a policy: it
  proves what clearing WOULD do on those evenings, not what
  any shipped lever does. A lever still needs its own arm.
- All 8 seeds survived 30d in both legs; death-aware horizon
  held (no deaths to truncate), but no death-cause data was
  generated by this arm.

## Files

- Prereg: evidence/2026-11-01/sim-detourclear-b-prereg.md
- This file: evidence/2026-11-01/sim-detourclear-b.md
- Driver: scripts/detourclear-trace-b.js
- Analyzer: scripts/analyze-detourclear-b.js
- Proof: scripts/test-detourclear-b.js (28/28)
- Census corpus: evidence/2026-11-01/sim-detourclear-b-corpus-census/ (8 files)
- Probe corpus: evidence/2026-11-01/sim-detourclear-b-corpus-probe/ (8 files)
- Analyses: evidence/2026-11-01/sim-detourclear-b-census.json,
  evidence/2026-11-01/sim-detourclear-b-probe.json,
  evidence/2026-11-01/sim-detourclear-b-verdict.json
- Prior arms reused as grounding (not edited):
  evidence/2026-11-01/sim-offergeo-b.md,
  evidence/2026-10-29/sim-eveningdetour-b.md
