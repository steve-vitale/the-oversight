# Journey leg 2 (deepening) — R6 run note (2026-10-12)

**Leg**: deepening (days 40–80) · **Run**: R6 · **Base**: `4c40b21d` (longsim knowledge r5)
**Harness**: `scripts/journey-deepening-r5-20261012.js` (unchanged, honest, DAYCAP=110) + new
`scripts/journey-deepening-r6-supplement-20261012.js` (contest instruments, favor sampler, knowledge snapshots)
**Canon**: MONSTER-WAVES.md read; KNOWLEDGE.md read (per draft). No canon changes.
**Seeds**: 10101, 20202, 30303, 40404, 50505, 60606 (same 6 as R5, honest, day 1→110, PROBE_W3 off)
**run_id**: playtest-20261012T120044Z · rotation advanced 2→3.

Longsim lever landings since R5: competent armor-up (wave-2 fight losses −52%), trader pool
growth, wave-drop villager reactions, trapline end-to-end, trial-deed abilities.

## The blank filled: identical favor directions (FIXED, then strengthened)

R4/R5 documented it: the pantry-run favor's commit line was verbatim
`"Good. East treeline, first light. Bring a pack."` across every NPC. Fixed in
`src/js/convo-wants.js`: new `Game.convoForageSpot(vid, hh)` grounds the meeting spot in
the ASKING villager's own known edible plants (`plantsKnownBy` ∩ `caloriesPerUnit>0`,
named by plant name), falling back to treeline-relative spots; commit/why lines are
per-instance compositions (instance-hashed), never re-rendered from a pool.

**Strengthened after a wild catch**: the first fix (128 combos: spot×when×gear) still
produced a byte-identical pair in the wild (Marcus d41 / Rosa d49, seed 10101:
"Good. The old burn east of camp, morning, early. Pack light — we move fast."). With
dozens of favor instances per run, the birthday paradox makes repeats expected at 128
combos. Now lead×spot×when×gear = 4×10×6×6 = 1440 combinations; residual collisions
are chance, not mechanism. The proof test asserts rarity, not impossibility.

**Fix**: `src/js/convo-wants.js` (convoForageSpot + forage_help.build recomposition)
**Proof**: `scripts/test-forage-favor-directions-20261012.js` — 12/12 GREEN post-fix;
7/12 RED on pristine (stash-verified: all variety checks unique=1, old verbatim present).
**Regressions**: favor-system 30/30, dialog-coherence 37/37, want-more-exhaustion 5/5,
ontology 84/84.
**Build note**: `src/data/build-notes.json` prepended (15 entries, tail byte-identical).

Example lines now: `"Then it’s set. The old burn east of camp, at sunup. Pack and knife.
We travel light."` / `"Good — where the wild onion grows thick, before the heat sets in.
Bring the big pack if you have it."`

## Before/after (R5 → R6, same seeds, current master)

| seed | end | wave 3 | w3 fights (honest) | distinct w3 faced | scale |
|------|-----|--------|------------------|-------------------|-------|
| 10101 | lost day 47 (R5: survived d112) | — (R5: d98) | 0 | 0 | regional |
| 20202 | survived day 105 | unlocked day 81 (R5: d66) | 1 (Spool, lost d102) | 2 | regional |
| 30303 | lost day 52 (R5: d51) | — | 0 | 0 | village |
| 40404 | lost day 80 (R5: lost d61) | unlocked day 32 (R5: —) | 3 (Callback lost d34, Focus Group fled d47, Buffering fled d70) | 5 | regional |
| 50505 | lost day 99 (R5: lost d17) | — | 0 | 0 | regional |
| 60606 | lost day 55 (R5: lost d75, w3 d54) | — (R5: d54) | 0 | 0 | regional |

**R6 totals**: wave-3 unlock 2/6 (R5: 3/6), 4 honest w3 fights (R5: 6), survived 1/6 (R5: 2/6),
regional 5/6 (R5: 3/6), distinct w3 faced up to 5 in one seed (the endgame deed gate needs 4).

Reading the delta honestly: the food+combat wall still binds — survival is worse on these
seeds (10101 died d47 after surviving to d112 in R5; 60606 lost wave-3 access it had in R5).
The armor-up lever (−52% wave-2 fight losses) shows in longer mid-games (40404 reached d80
with 3 real w3 fights; 50505 survived the d17 wave-1 wipe that killed it in R5 and ran to
d99), but villages still grind down in the 50–100 window. This is longsim's lever
territory, not a journey-loop fix — no game balance code was touched this run.

**Signature mechanics, all firing** (honest play, excerpts):
- **The Callback** (40404 d34, lost): wears Gabriel Estrada's face — "Gabriel Estrada's
  borrowed swing hits you for 32."
- **The Focus Group** (40404 d47, fled): "they LOVE your DODGE (move), they HATE your
  STRIKE. (Loved: the System buffs it — but the mouths ANSWER it. Hated: safe, but
  suppressed.)" + real boredom rounds.
- **The Buffering** (40404 d70, fled): "It stutters backward — three seconds ago it was
  THERE." + honest directional telegraphs ("IT WILL STEP UP.").
- **The Spool** (20202 d102, lost): "The reels spin up — WHIRRR. LOADED: 1. STRIKE (~23)
  2. STRIKE (~27) 3. STRIKE (~23)." → "▶ REPLAY 2/3: STRIKE — the tape plays your own
  swing back at you. (28)" — examine-the-reel counterplay is real.

**Wave-3 unlock note**: 40404 unlocked day 32 on the village's own kills (hushwolf×3,
nightlight_catfish×3, mirrormoth×2, glasswing, hummice, memory_projector,
giant_mosquito, belltoad, paparazzo, nightcourt, alien_tick) — the villager-experiences
directive working; the player was along for it.

## Village assessment (plain words)

**20202 (survived d105)**: five left — Lena the ER nurse (trust 35, 29 plants), Marcus
(42/28), James (72/29), David (62/31), Jakob (2/28); all lonely; 38 dead. Deep
knowledge, wave-3-tested (Spool at d102), grief on the ledger. Survival, not triumph.

**40404 (lost d80)**: four left at the end, all grieving, 41–42 plants each (Lena trust 90,
Sofia trust 90) — fought Callback/Focus Group/Buffering for real; the designed shape of
a wave-3 loss. 5 distinct wave-3s faced clears the endgame deed gate of 4.

**The lost four**: 10101 (d47, 22 dead — the R5 survivor that didn't make it this time),
30303 (d52, 19 dead), 50505 (d99, 27 dead, starvation in the mix — but it survived the
d17 wipe that killed it in R5), 60606 (d55, six grieving survivors with only 16–18
plants each — knowledge never took root, and the village paid for it).

## People check (SENSE-TESTING LAW)

10 full transcripts read by the worker, 2 read in full by the coordinator. They act
like people. Coordinator-read standout — Quan the bartender (60606, day 55), stoic,
grieving, trust 90: opens with unfinished business ("We never finished talking about
that favor — we got cut off, 3 days back" — cross-conversation memory), asks for food
concretely, then on mourning: "Since Emma died... I keep expecting to see Emma at the
fire. Stupid." / "I oil boots on rest days. It doesn't bring anyone back. It just keeps
my hands from shaking." / "We bury, we grieve, we keep going. There's no step four." /
"My part? I remember them. Someone has to do it properly." Ends: "Sorry. I need a
minute. This was... thank you. I need a minute." The NPC wants something, the options
engage it, the ending resolves and plants (the promised food favor). No fabricated
shared history — Emma's death is real game state.

Minor flags (documented, not fixed): shared-pool repeats across NPCs ("I think we're
being tested"; wound thank-yous; "You're kind…" twice in one conversation); Lucas's
photo-confidence ending "— ask anyone!" undercuts "I haven't told anyone." Fodder for
the social-life leg.

## Knowledge economy

- **Player codex**: 15–26 plants at L1 by day 40, deepening to L2–L4 on a handful by end.
  Slow, honest deepening.
- **Survivors**: 16–42 plants known each (background + in-run taught); beasttricks:
  6–8 asked by day 40, **0 taught** — counter reveals stay thin in-leg (known, unchanged).
- **Traders** (new longsim r5 lever, visible here): trader pools now grow from village
  exposure — the deepening-leg economy has a second knowledge sink beyond the pantry.

## Contests — 87 events across 6 runs

Announce→grab→resolve pipeline healthy; played (player taken) majority, watched
(villager taken) present, shows + ratings summons firing; `contestStuck=0` everywhere.
One structural blank, documented not fixed: `contestInterruption` unconditionally
overwrites `state.activeContest` — with the supplement's naive contest driver a siege
stalled 2 days and was silently replaced (no verdict, no on-record cancellation).
Re-tested with the r5 smart driver: no stall, no overwrite. Not player-reachable through
normal play (contestStuck=0 on the competent policy); filed for the contests leg.

## Reachable / Fun / Winnable

- **Reachable**: YES — wave 3 unlocks 2/6, 4 honest wave-3 fights, 4 signature mechanics
  firing in live play, 5 distinct w3 faced in one seed, regional scale 5/6. The leg's
  signature content is reachable.
- **Fun**: YES — conversations are genuinely good (mantle-awareness, concrete favors,
  gossip with teeth, grief that names the dead), and the wave-3 fights are hard,
  costly, and distinct.
- **Winnable**: PARTIAL — 1/6 survived; the mid-game wall (days 47–99) still binds.
  Longsim's lever territory, not this loop's.

## Files

- Fix: `src/js/convo-wants.js` (convoForageSpot + forage_help recomposition)
- Proof: `scripts/test-forage-favor-directions-20261012.js` (12/12; 7 red on pre-fix)
- Tooling: `scripts/journey-deepening-r6-supplement-20261012.js` (worker-built: contest
  instruments, favor sampler, knowledge snapshots)
- Evidence: `evidence/2026-10-12/journey-deepening-r6-<seed>.json` (6 main),
  `journey-deepening-r6supp-<seed>.json` (6 supplement)
- Transcripts: `/tmp/journey-deep-r6-transcript-<seed>-<day>.txt`, favor dumps
  `/tmp/journey-deep-r6-favor-<seed>-<n>.txt` (ephemeral)
- Build note: `src/data/build-notes.json` (prepended, pruned to 15)

## Still open (documented, not fixed)

- `contestInterruption` silently overwrites `state.activeContest` (stall → no verdict,
  no cancellation record). Not reachable on the competent policy; filed for contests leg.
- Shared-pool repeats across NPCs ("I think we're being tested", wound thank-yous).
- Day-17 wave-1 wipes persist as a seed outcome (50505 escaped its R5 wipe this time;
  the lever is longsim's).
- Beasttrick reveals stay thin in-leg (6–8 asked by d40, 0 taught).
