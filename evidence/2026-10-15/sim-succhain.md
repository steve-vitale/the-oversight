# sim-succhain — bearer-death chain diagnostic on young nationals (2026-10-15)

Worktree: `~/workspace/worktrees/sim-succhain`. Run: oversight-flesh-out-loop
fleshout-a-20261015T0615Z, ARM 2 (sim-succhain) — DIAGNOSTIC INSTRUMENT, zero
game-code changes, zero policy changes (scripts + evidence only).

**Assignment lineage:** r4's holdloss census (evidence/2026-10-15/sim-holdloss.md)
named **succession-chain as the modal NAMED national-hold loss (2/3)**; r17 found
winseek dying in same-day succession chains (11/16, undiagnosed); the landed
succpolity arm (ee5d1803) fixed polity-persistence through succession but NOT
the bearer-death cascade itself. This arm builds the instrument that names it.

**Canon:** docs/CANON.md read first; docs/SCALE.md read for the scale
ladder/polity definition (national = live state, not a title; one primary
with ≥3 seasoned subordinates; BELONG bar trust ≥50 / arrears 0 / 14 days).
No canon doc covers succession chains per se — the chain taxonomy is this
arm's instrument, not canon. Disease names per docs/DISEASES.md; monster
names/descriptors from src/data/monsters.json — both inherited via the
holdloss lib (scripts/holdloss-lib-20261015.js, which this arm imports).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)

**Question:** on YOUNG nationals (first 60 calendar days of national hold),
every bearer <redacted> how does the chain unfold — chain length, cause per
death, inter-death gaps, polity state at each death (links, trust, tribute
arrears), tribute-snap / rival-raid co-occurrence, pantry trajectory through
the chain? Name the bearer-death cascade the succpolity fix leaves unclosed.

**DIAGNOSTIC GO (binding):**
- ≥90% of bearer-death chains on young nationals ATTRIBUTED — attribution =
  (chain length) + (cause sequence, every death named with its family via
  holdloss-lib's classifyDeathFamily; unnameable causes named raw, trail kept)
  + (polity impact named: polity state at each death AND start→end polity
  delta AND rank/snap/raid co-occurrence). A chain where the instrument cannot
  read polity state, or cannot name a cause sequence, counts AGAINST the 90%.
- ≥2 sense-read chain narratives in plain words (SENSE-TESTING LAW).
- ONE NAMED NEXT lever filed in sim-findings.md for a follow-up arm.

**Substrate:** 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast}
unlayered + leadfeast WINPURSUIT=1 (winpursuit is loop A's own landed layer at
scripts/policies/winpursuit.js — zero src/js; it enriches the win/hold
substrate; the control side is never layered). 180d death-aware horizons,
FEASTSCALE_R13=1 asserted up front in proof AND sweep (the #312 lesson).
WINPURSUIT=1 on the third policy only.

**Horizon + why:** 180d death-aware (dead villages stop simulating, ≤10d tail).
National reaches ~day 61–90 (SCALE.md pacing: one rung per season, median
proof 81); the young-national window (first 60 hold-days) plus a
post-window tail needs the full 180d. Death-aware, never a fixed truncation.

**Instrument:** `scripts/succhain-lib-20261015.js` (pure classifier on
persisted run records; zero policy edits, zero src/js changes), built on
scripts/holdloss-lib-20261015.js (classifyDeathFamily, the day-accounting
off-by-one repair, the 90% attribution-bar convention).

Chain definition (documented, arbitrary, pinned by proof): a bearer-death
chain is a MAXIMAL run of bearer deaths (registerDeath opts.player === true,
the r17 deathattr instrument — fallback kind /player|scholar/) where each
consecutive death is ≤ CHAIN_GAP_DAYS = 7 days after the previous. Bearer
deaths in the young-national window [nationalFirstDay, +60d] are the
attribution denominator; deaths before national or after the window are
context, not chains. Per death: day, name, cause, family, gap from previous,
nearest-scaleRow polity state (rank, links with trust/arrears/perWeek),
pantry days, co-occurring beats ±3d (tribute-snap, rival-raid, tribute-short,
succession). Chain impact: start→end polity delta, rank fall within 7d of the
last death, pantry trajectory through the chain, snap fired mid-chain?

**Proof:** `scripts/test-succhain-20261015.js` — REAL-RED (a naive
gap-agnostic/window-agnostic grouping must demonstrably misfire: chains two
deaths 45d apart, and counts a pre-national death into a young-national
chain) → GREEN (full chain builder on fixtures: length, gaps, boundary gap
exactly 7 chains / 8 splits, cause sequences, polity states, snap/raid
co-occurrence, pantry trajectory, rank-fall impact); trajectory-neutrality
(instrument ON vs OFF byte-identical 30d on a real sim — the sampler is
read-only).

**Metric review (see end of file):** required per §14.

## Results — the 24-run instrumented suite

Substrate: 8 seeds × {leadfeast, belongfeast} unlayered + leadfeast
WINPURSUIT=1, 180d death-aware, FEASTSCALE_R13=1 asserted up front.
Per-seed chain packets: `evidence/2026-10-15/perseed-succhain/` (chain +
full records); summary: `evidence/2026-10-15/sim-succhain-runs.json`; sweep
log: `evidence/2026-10-15/succhain-sweep.log`; coordinator telemetry:
`evidence/2026-10-15/telemetry-succhain/` (24 records, booleans as 0/1).

**DIAGNOSTIC: GO — 23/23 young-national bearer-death chains attributed
(100% ≥ 90%).** Every chain carries chain length + cause sequence (every
death named with its holdloss-lib family; unnameable causes named raw with
the trail kept) + polity impact named (polity state at each death,
start→end delta, rank 7d after, snap/raid co-occurrence, pantry trajectory).
Proof: `scripts/test-succhain-20261015.js` 28/28 GREEN (REAL-RED on the
naive grouping + trajectory-neutrality ON/OFF byte-identical 30d).
SMOKE green (player-flag present all 3 policies); DETGATE green
(D1 determinism, D2 ON/OFF byte-identical 60d).

### The census

| dimension | measurement |
|---|---|
| national-reaching runs | 10/24 (leadfeast 5/8, leadfeast-winpursuit 5/8, belongfeast 0/8) |
| chains in young windows (first 60 hold-days) | 23 |
| attributed | 23/23 (100%) |
| chain lengths | 1×19, 2×3, 3×1 (mean 1.22) |
| bearer death families | combat 27/28, sickness 1/28 |
| contest/arena entanglement (§#106) | 7/27 combat deaths have a contest/arena/"the wild" beat within ±1d |
| co-occurrence through chains | 9 rival-raid beats, 1 tribute-snap beat, 2 tribute-short beats |
| rank 7d after last death | fell 1/23, kept 22/23 |

**Wall numbers this run:** national 10/24 · table 12/24 · wins 4/24 (all
leadfeast-winpursuit, all lesser/full seats via the win beat — see the
win-detection correction below) · wave-4 12/24 · wave-5 7/24 · median
survival 90d · max 180d · exiled 3/24.

**What the census says.** The bearer-death cascade the succpolity fix left
open is, on the current tip, a MORTALITY cascade, not a polity-dissolution
cascade. Chains are shallow (19 of 23 are single bearer deaths); bearers
die in combat (27/28 — a quarter of those entangled with contest/arena
beats, the #106 warning confirmed on this substrate); and the polity now
absorbs them: **22/23 chains keep rank 7 days after the last death.** The
succession-collapse mode the r4 census named is closed as a loss mode — the
"dead hold no treaties" drumbeat fires per funeral and the realm holds.

The ONE rank-fall is the exception that names the remaining face:
leadfeast s44 d115 — Devon's combat death dissolved the realm aloud
("◈ The realm came apart — no polity answers to Haven now") — on a link
already dying, not one the succpolity window failed to save: village_2 sat
at **trust 36 (< the 40 seasoned bar)** with **58,287 kcal total arrears**
before the funeral. The 14d proving window reads inherited standing for
polity-membership bars; a link below the bar at the funeral dissolves with
no recourse. The s44 run then bleeds a 3-chain (d127→d132, gaps 2d,3d) at
regional with arrears stuck at 59,237 kcal and village_2's trust cratering
29→19 — the post-fall village, not a cause of it.

**Win-detection correction (instrument honesty):** the sweep's `won` field
used `/win|won/i.test(endReason)`, and table wins end `over-other` — so the
runs summary initially read wins 0/24. A post-hoc scan of the saved
full-beat records for the engine's win beat ("You won. Say it plainly: you
won.") finds **4 true wins / 8 on leadfeast-winpursuit** (s22, s33, s44,
s66; 0/8 on both unlayered policies). The runs.json and all 24
telemetry-succhain records were regenerated with the win-beat truth. Lesson
for instrument builders: endReason regexes lie about the table; the win
beat is the authority. The winpursuit layer's win rate (4/8 = 50%) is
consistent with r4's 7/16 = 44% on the same substrate.

**belongfeast note:** 0/8 national but 4/8 table seats (lesser ×3, full ×1)
at regional rank — the table opens via the Arc IV/food-deed path, not the
national ladder (consistent with the w5death audit). National is not a
table gate on the feast road.

### Chain narratives (SENSE-TESTING LAW — read, not counted)

**1. leadfeast s44 — the rank-fall (5 chains, d77→d132).** This is the one
chain that took the polity down, and it reads honestly. d77: Kai dies at
national with 40,145 kcal arrears — the realm holds. d97–98: Leandro then
Zoe die on consecutive days, a rival raid beat two days earlier ("Your
pantry or your blood. Choose."), the pantry crashing 999d→33d between the
two deaths — the raid→succession→pantry entanglement of the r4 s77 story,
but the polity survives (global 7d after — succpolity working). d107: Ivy
dies, realm holds. d115: Devon dies and the realm dissolves aloud — the
link that broke was at trust 36 with 58k arrears; the funeral was the last
straw on a frayed rope, not a healthy bond snapping. The d127→132
3-chain at regional reads as the aftermath: three more combat deaths
against a pantry that recovers and collapses (10d→15d→6d) while village_2's
trust dies 29→19. The deaths read as people — named, fought, mourned —
and the polity's dissolution reads as a consequence of the arrears the
village actually owed. Judge: coherent, consequential, honest.

**2. leadfeast s22 d86→d90 — the healthy polity (2-chain).** Wolfgang then
Victor die in combat 4 days apart; the polity at both deaths: trust 78–96,
arrears 4,000 kcal, pantry 18d→15d; rank global 7d after. The "dead hold no
treaties" drumbeat fires and nothing political happens. This is the
succpolity fix's intended behavior and it reads as people: two fighters
died in a hard week, the village kept its treaties. Judge: the chain
mechanism is mortality, not dissolution — the instrument proves the fix
holds under repeated fire.

**3. leadfeast s66 d137 — the same-day double (gap 0).** Elif then Aroha
die the same day, both combat, at global rank with trust 87 everywhere and
zero arrears. The classic succession-feed shape (#38/#45) — the successor
inherits the battlefield and dies in it — but at global rank with a rich
polity the realm doesn't even flinch. Judge: reads as combat, not as RNG —
two people died in the same fight. The feed is still the mortality engine;
the polity is no longer its victim.

### What this names

- The bearer-death cascade on young nationals is REAL (28 bearer deaths in
  23 chains across 10 national runs) but it is a combat-mortality
  phenomenon (27/28 combat), not a polity-dissolution phenomenon (1/23
  rank-falls). The succpolity fix closed the mode r4's census named; the
  chains the instrument now names are the mortality engine underneath.
- 7/27 combat deaths are contest/arena-entangled (the #106 warning) — the
  exact fight-type split is unmeasured; the instrument names 'combat' as
  the engine reports it, honestly.
- The remaining rank-fall face is **sub-bar links at succession**: the
  proving window cannot save a link already below the seasoned bar. The
  NAMED NEXT lever for a follow-up arm is filed below.

## Blanks filled / documented

- FILLED: the bearer-death cascade on young nationals is now NAMED
  (instrument + 23 attributed chains + 3 sense-read narratives).
- DOCUMENTED (not chased, out of instrument scope): (a) the exact
  contest/arena vs field-combat split of bearer 'combat' deaths (#106
  territory — needs fight-scoped telemetry); (b) the s66 d137 same-day
  double's fight shape (zero beats captured in the ±4d window of the
  sliced -full.json record — a beat-ring slice artifact, the chain packet
  holds the succession beats).

## Metric review (§14)

- The 90% attribution bar measured 100% — 23/23 chains fully attributed.
  No re-scoring: the bar was the pre-registered one and the instrument
  met it on the letter.
- Metric correction recorded: the sweep's `won` field undercounted wins
  (endReason regex vs the engine's win beat — 0/24 → true 4/24, all on
  leadfeast-winpursuit). Runs.json and telemetry-succhain/ were
  regenerated with the win-beat truth; the analysis above uses the
  corrected numbers. Future sweeps should read the win beat, not the
  endReason.
- The pre-registered denominator ("bearer-death chains on young nationals")
  proved honest: 23 chains across 10 national runs, no instrument gap in
  the polity-state reads (every chain death had a scaleRow ≤ death day).
- One judgment call for the NEXT run: the chain-gap window (7d) is
  arbitrary; the longest observed intra-chain gap was 4d and the only
  boundary case (gap exactly 7) never occurred in the wild. A 3d window
  would have split nothing in this suite (splits observed at gaps 8+ in
  proof). The window choice did not move any attribution.

## NAMED NEXT lever (filed in sim-findings.md)

SUCCESSION-DAY GRACE FOR SUB-BAR LINKS: the one observed young-national
rank-fall (leadfeast s44 d115) dissolved the realm aloud on a leader death
where village_2 sat pre-death at trust 36 (< the 40 seasoned bar) with
58,287 kcal total arrears — a dying link, not a healthy one the succpolity
window failed to save. The 14d proving window reads inherited standing for
polity-membership bars; a link already below the bar at the funeral
dissolves with no recourse. Candidate lever: extend the young_links_get_grace
staged-renegotiation idiom to succession day for links below the seasoned
bar (answered aloud: gift/visit/wait with real costs, expires 7d), giving
the new bearer a played chance to hold the fraying fire instead of an aloud
dissolution. 22/23 chains kept rank (succession-collapse closed as a mode);
the remaining rank-falls are sub-bar links. This is a game-code lever for a
follow-up arm — out of this arm's instrument-only scope.

