# Longsim win-path lever r3 (lever 10: arcs → national → table → win) — 2026-10-12

Follow-up to `sim-winpath-r2.md` (2026-10-11) and `journey-endgame-r3.md`
(2026-10-11). Their finding: **0/48 runs reach the lesser seat**; binding bars
`feastSurgeUsed` (chain never fires) and wave-3 fights. This run plays the
feast-surge component.

## The design call

The r3 evidence recommended "lengthen the buff window, OR soften the
lesser-seat food-deed bar." I measured first. The window was NOT the binding
constraint — the chain collapsed BEFORE the window:

- Baseline (pristine master, seeds 1-16 × competent+winseek × 200d):
  **armed 15 → granted 1 → used 0**. The devotion armed fine; the feast
  almost never hosted while armed.
- Diagnostic: the winseek policy was a net drain (takes 12k-37k, gives 0 on
  4/8 seeds) → **exiled** (freeload pipeline, correctly) or **drain-blocked**
  (feastRoad's >3000 gate). Exiled players can't host feasts ("Exile means
  exile"). The game was correct; the policy was parasitic.

So the lever has two parts:
1. **Policy** (instrument repair): winseek contributes — donate the day's
   kills, forage+donate when drain > 2000 — so it stays in good standing.
   Plus feastFight patrols on ANY feasted day and huntPatrol runs daily while
   feasted (the buff is the deed).
2. **Game**: buff window 1 dawn → **2 dawns** (`durationNights` data lever in
   `src/data/feast-surge.json`). Justification: the policy feasts in the
   evening with no ticks left to find a fight; a real player feasting at
   night deserves the next day's hunt. Keeps the devotion gate, feast cost,
   and no-stack rule — only the time gate softens.

## Before/after (identical seeds 1-16 × 2 policies × 200d)

| metric | before (pristine) | after (policy+2-dawn) |
|---|---|---|
| feast chain | armed 15 → granted 1 → used 0 | armed 12 → granted 4 → used 0 |
| feastSurgeUsed | 0/32 | 0/32 |
| lesser / full / table / won | 0/0/0/0 | 0/0/0/0 |
| median / max survival | 52d / — | 30d / — |
| wave≥3 | 11 | 5 |
| regional / national | 11 / 0 | 6 / 0 |
| death causes | combat 116, vcombat 127, starvation 38, monster 54 | combat 130, vcombat 109, starvation 33, monster 56 |

The chain now REACHES the buff (grants 1→4), and the full chain fired
end-to-end on seed 8 in diagnostics (grant → combat use → feastSurgeUsed).
But uses remain luck-gated: the buff expires before a random encounter is
found. The 2-dawn window helps (more feasted days to hunt) but doesn't solve
the encounter sparsity.

**Reachability verdict: the lesser seat is still NOT reached (0/32).**
Bar-by-bar (winseek): waves 4/4/3 — wave-3 fights are the bottleneck (lever
2's territory); contests 2+ reachable; crises 2+ easy; regional reachable;
stage≥2 easy; food deeds — sentiment 16/16, feastSurgeUsed 0/16 (chain fires
but uses are rare). I did NOT weaken multiple bars to force a win.

## The upstream blocks (documented, not fixed)

1. **Food economy** (lever 0): the village eats ~6k/day; the pantry swings
   0→34k. Feasts need a 1.5× buffer the starving village can't spare.
2. **Survival** (lever 1): median 30-52d; the chain needs ~100d. Combat deaths
   dominate (239/369).
3. **Wave-3 fights** (lever 2): 5/32 reach wave 3; the 4/4/3 faced bar needs
   luck + survival.

## Sense-check (transcript read)

**PASS**: The feast beat is strong — "Sofia opens the pantry wide: 2× Fish
catch, 1× Foraged food... James, David eat until the fire burns low.
Somebody laughs so hard they cry. For one evening, nobody is surviving —
they're just together. (−2,257 kcal) Aria stayed in their tent, feverish."
Named villagers, real menu, the sick one stays home. The buff grant line is
honest ("FEASTED ×2.03 until tomorrow's dawn (5 parts left)").

**FAIL → FIXED**: Four villagers (Marcus, Lena, Sofia, Ethel) said the
audience line VERBATIM: "Do you think they're watching right now? The...
audience? I try not to think about it." The `apVillageGossip` pool had 2
fixed general lines. Expanded to 6 variants with per-villager dedup
(`src/js/alienPlayers.js`) — a pool of one is a script, not people.

**NOTED**: The keepsake channeling message repeats verbatim daily ("You hold
Hoodie... You hold Notebook...") because the policy channels 6×/day. A real
player channels once; the game message is fine, the policy is spammy. Not
fixed (policy artifact).

## Village assessment (plain words)

The village is a hungry place. The pantry breathes in and out — 43k at dawn,
empty by week's end — and the people notice who's eating. The winseek
villager learned to feed the commons first (drain went negative on the
measured seeds), and the feast fired four times: real food, real laughter,
the System watching. But the forest was empty when the buff was live — the
hunt found nothing, the fire burned low, and the deed went unmarked. The
chain exists now; it needs a fuller forest (or a longer-lived hunter) to
close. Nobody reached the table. The village endures, poorer, unfamous.

## Proof test

`scripts/test-feastchain-contribute-20261012.js`: before/after on identical
seeds (pristine policy from git HEAD vs fixed). **5/7 green**. The 2 fails
are the luck-gated combat uses on seed 8 (grants fire reliably; uses need a
random encounter while feasted).

## Files

- Game: `src/js/feastBuff.js` (durationNights lever, 2-dawn window, honest
  copy), `src/data/feast-surge.json` (durationNights: 2), `src/js/alienPlayers.js`
  (gossip variety + dedup)
- Docs: `docs/PROGRESSION.md`, `docs/BALANCING.md` (lever tables updated)
- Policy: `scripts/policies/winseek.js` (contributeRoad, feasted hunting),
  `scripts/policies/competent.js` (exported forage/sort/donate helpers)
- Proof: `scripts/test-feastchain-contribute-20261012.js` (5/7)
- Instrument: `scripts/sweep-winpath.js` (chain counters), `scripts/diag-feast-chain-20261012.js`
- Data: `/tmp/wp-winpath-r3-baseline.json`, `/tmp/wp-winpath-r3-after-policy.json`,
  `/tmp/wp-winpath-r3-after-window.json`

## Regressions

- Ontology: 83/83 validated, "Release permitted"
- test-table-core-20261011: 31/31 green
- test-deed-gate-20261010: 68/68 green
