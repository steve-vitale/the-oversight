# Stall forensics — where the 101 actions/day go

_evidence/2026-10-13/sim-stall-forensics.md — 2026-10-13_

Forensics on the 7 stall stretches from sim-action-telemetry.md (≥7 days
above-median deliberate actions, zero progress on ledger/scale/codex/Standing).
Method: per-day verb counts with origin prefixes (`policy:` = deliberate player
decision, `driver:` = harness stand-in, `internal:` = game-code call) from
`perDay[].acts` in sim-action-telemetry.json, aggregated over each stretch's
7 days. Raw numbers: sim-stall-forensics.json. Analyzer:
scripts/stall-forensics-20261013.js.

Data provenance: sim-action-telemetry.json — 32-run courtship suite (seeds
11/22/33/44/55/66/77/88 × competent/winseek/belongseek/leadcourt), 180-day
horizon, origin-separated PLAYER-VERB TELEMETRY. (Per the telemetry worker's
report: suite base e79a08de incl. the villager-counter arm; harness commit
84a08dff. Row-level `commit` fields are empty in the JSON — cite the worker
report, not the rows.)

## Per-stretch verb breakdowns (top verbs, 7 days each)

competent/s11 d78–84 — 1,022 acts (146/day): deliberate 69.7%, internal 27.7%
- policy:corpseTakeItem 537 (52.5%) · internal:linkWith 180 (17.6%) ·
  policy:teachPlant 62 (6.1%) · internal:switchboard 56 (5.5%) ·
  policy:travelTo 28 · driver:doAction:wait 21 · policy:doAction:forage 21

winseek/s33 d35–41 — 866 acts (124/day): deliberate 73.4%, internal 23.6%
- policy:corpseTakeItem 160 (18.5%) · policy:eat 116 (13.4%) ·
  internal:linkWith 110 (12.7%) · policy:takeFromPantry 90 (10.4%) ·
  internal:switchboard 58 (6.7%) · policy:travelTo 58 (6.7%) ·
  policy:linkWith 42 (4.8%) · policy:teachPlant 36 (4.2%)

belongseek/s11 d57–63 — 830 acts (119/day): deliberate 59.9%, internal 37.5%
- policy:corpseTakeItem 206 (24.8%) · internal:linkWith 193 (23.3%) ·
  policy:teachPlant 112 (13.5%) · internal:switchboard 56 (6.7%) ·
  policy:assignTask 34 · policy:linkWith 28 · policy:travelTo 27

belongseek/s33 d60–66 — 936 acts (134/day): deliberate 73.9%, internal 23.2%
- policy:corpseTakeItem 403 (43.1%) · policy:teachPlant 119 (12.7%) ·
  internal:linkWith 91 (9.7%) · policy:travelTo 60 (6.4%) ·
  internal:switchboard 56 (6.0%) · internal:stockPantry 34 (3.6%)

belongseek/s77 d29–35 — 618 acts (88/day): deliberate 51.9%, internal 43.9%
- internal:linkWith 144 (23.3%) · policy:teachPlant 106 (17.2%) ·
  policy:corpseTakeItem 61 (9.9%) · internal:switchboard 56 (9.1%) ·
  internal:stockPantry 41 (6.6%) · policy:travelTo 26

leadcourt/s11 d86–92 — 813 acts (116/day): deliberate 67.8%, internal 29.2%
- policy:corpseTakeItem 456 (56.1%) · internal:linkWith 144 (17.7%) ·
  internal:switchboard 56 (6.9%) · policy:travelTo 28

leadcourt/s33 d72–78 — 739 acts (106/day): deliberate 70.5%, internal 26.4%
- policy:corpseTakeItem 304 (41.1%) · internal:linkWith 86 (11.6%) ·
  internal:switchboard 56 (7.6%) · policy:travelTo 52 (7.0%) ·
  policy:teachPlant 28 (3.8%)

## Cross-stretch aggregate (5,824 acts over 49 stretch-days)

| verb | acts | share | deliberate | driver | internal |
|---|---|---|---|---|---|
| corpseTakeItem | 2,127 | 36.5% | 2,127 (100%) | 0 | 0 |
| linkWith | 1,060 | 18.2% | 112 (10.6%) | 0 | 948 (89.4%) |
| teachPlant | 469 | 8.1% | 469 (100%) | 0 | 0 |
| switchboard | 394 | 6.8% | 0 | 0 | 394 (100%) |
| travelTo | 279 | 4.8% | 279 (100%) | 0 | 0 |
| prepStash | 177 | 3.0% | 49 (27.7%) | 0 | 128 (72.3%) |
| stockPantry | 142 | 2.4% | 0 | 0 | 142 (100%) |
| eat | 136 | 2.3% | 136 (100%) | 0 | 0 |
| assignTask | 133 | 2.3% | 133 (100%) | 0 | 0 |

**Origin totals: deliberate 3,930 (67.5%) · driver 176 (3.0%) · internal 1,718 (29.5%).**

Answer to the key question: of the "~101 actions/day" in a stall, roughly
**two-thirds is the player grinding and one-third is the game talking to
itself**. The deliberate grind is dominated by a single verb: corpseTakeItem
is 54.1% of all deliberate stall acts.

## Measurement caveat (taxonomy)

sim-action-telemetry.md calls the stalls "social-dominated" — that framing is
an artifact of the analyzer's category map, which files `corpseTakeItem` under
`'social'` (analyze-action-telemetry-20261013.js line 72). Verb-level truth:
the dominant stall activity is **corpse looting**, not social upkeep. The
taxonomy should gain a loot category (or re-file corpseTakeItem); the numbers
in the published md are unaffected, but the prose framing misleads. Flagged
for the follow-up arm, not changed here (would invalidate published tables).

Second caveat: the stall detector's "zero progress" covers ledger magnitude,
scale rank, codex counts, and Standing. Sub-threshold progress is invisible —
per-link trust accumulation toward future seasoned links, knowledge *depth*
(per-item levels vs codex breadth counts), and pantry/food yields from looting
all move without tripping any of the four axes. Some "stall" days may be
slow-burn progress, not true stalls. The drivers below are real regardless
(the verb counts are what they are), but a progress-hook lever should measure
against the four axes AND the sub-threshold channels.

## Top-3 drivers

### 1. corpseTakeItem — 2,127 acts, 36.5% of stall acts, 100% deliberate

**What it is:** per-item corpse looting. `corpseTakeItem(cid, idx)` takes one
item stack per call (src/js/corpses.js:422 — "take the whole stack of one
item"); the loot UI renders one button per item (app.js `data-loottake`). A
corpse with N distinct stacks costs N deliberate decisions — 537 calls in 7
days on competent/s11 (~77/day). Human players tap once per item too, so this
is not a sim-policy artifact.

**Diagnosis: (a) player-decidable grind with no progress lever.** The loot is
productive (meat, gear) but the granularity is wrong: one decision per stack
with no "take all." The four progress axes don't move because looting feeds
pantry/inventory, not ledger/scale/codex/standing.

### 2. linkWith — 1,060 acts, 18.2% of stall acts, 89.4% internal / 10.6% deliberate

**What it is:** link maintenance traffic. The 948 internal calls are the game
firing linkWith "as the player" — the re-entrancy rule in the telemetry work
caught `foreignCrisisTick` calling linkWith/switchboard during waits. These are
not player decisions at all; they inflate the verb stream and may consume tick
budget. The 112 deliberate calls are the policy choosing to tend links.

**Diagnosis: (b) game-fired verb noise.** Nearly nine-tenths of this driver's
volume is the game talking to itself through a player-verb interface.

### 3. teachPlant — 469 acts, 8.1% of stall acts, 100% deliberate

**What it is:** teaching plants to villagers, one verb per teaching act —
up to 16/day in belongseek/s11 with zero codex movement. Either the policy is
re-teaching already-known plants (a human wouldn't teach the same plant 16×/day
— the game gives no "they already know this" feedback), or teaching deepens
per-item knowledge levels that the codex-breadth count can't see.

**Diagnosis: (a) grind with no progress lever, with a (c) undertow.** The
repeat-teaching has no visible effect and no stop signal; underneath, the
post-day-20 game has a productive-verb vacuum (food solved, links seasoning),
so teaching fills dead time. Fix the redundant-teaching incentive first; the
vacuum is a content question for later.

## Proposed compression levers (one per driver — for direct tasking)

### Lever A — batch loot ("take all")
**Change (game-code arm):** new `corpseLootAll(cid)` verb: one deliberate
decision takes all remaining item stacks, honoring the existing per-item
carry-weight gate (overweight items stay, reported). UI: one "Take all" button
alongside the per-item buttons. Policy: use it when the intent is clearing the
corpse.
**Pre-registered GO:** primary metric = deliberate corpseTakeItem+corpseLootAll
decisions per run; GO = ≥50% reduction vs baseline on identical seeds.
Guardrail: loot yield — total item-units taken from corpses per run within ±15%
of baseline (no loot loss). Seeds: 8 (11/22/33/44/55/66/77/88) × competent +
belongseek (the two heaviest stall looters) = 16 runs. Horizon: 180d
(courtship-suite standard). Files: corpses.js, app.js loot UI, policy update.

### Lever B — quiet the internal link traffic
**Change (game-code arm):** audit what internal linkWith/switchboard calls do
(tick consumption? resource movement? pure accounting?), then re-route the
game-fired link maintenance off the player-verb stream — either a dedicated
internal link-tick path or one batched daily pass. If the calls are pure
accounting with no game effect, they move off verbs entirely (telemetry-only
change, no behavior delta).
**Pre-registered GO:** primary metric = internal linkWith+switchboard count per
run; GO = ≥70% reduction vs baseline on identical seeds. Guardrail: link
outcomes — linksSeasonedEver and linksGoodEver per run within ±10% of baseline
(same link results, less noise). Seeds: 8 × all 4 courtship policies = 32 runs
(matches the telemetry suite). Horizon: 180d. Files: comms.js / link tick paths
(TBD by the audit), possibly telemetry only.

### Lever C — redundant-teaching stop signal
**Change (game-code arm):** teaching a plant the village already knows at the
same knowledge level becomes an explicit no-op with in-fiction feedback
("they already know this one") instead of a counted teaching act — removes the
incentive to repeat; first-time and level-deepening teaching untouched.
**Pre-registered GO:** primary metric = deliberate teachPlant count per run;
GO = ≥40% reduction vs baseline on identical seeds. Guardrail: codexP
(breadth) at run end ≥ baseline (no knowledge loss). Seeds: 8 × belongseek +
leadcourt + competent (the teaching-heavy policies) = 24 runs. Horizon: 180d.
Files: teaching gate (game.js knowledge/teach path), policy untouched.

## What was NOT changed

No game-code edits, no policy edits. scripts/stall-forensics-20261013.js is new
(forensics only); sim-stall-forensics.json is new (raw numbers). The category
taxonomy mislabeling (corpseTakeItem → 'social') is flagged, not fixed, to
avoid invalidating the published sim-action-telemetry.md tables.
