# sim-inffight — finding #102: the infinite Focus Group fight (ARM 1, game-code)

**Date:** 2026-10-14
**Finding:** sim-findings.md #102 [claimed → fixed]
**Lever played:** fight-engine stalemate resolution — focus_group burst want-range calibration + eye-head non-blocking.

## The bug (plain words)

On the fifthlink-armed seed-44 trajectory, the game froze mid-fight. The scholar stood in a turn-based battle against **The Focus Group** — a wave-3 monster, 289 HP, fought on day 61 — and the fight ground through **500,000+ rounds without ending**. The game clock stopped. A real player could stall the same way: this is a genuine engine pathology, not a sim artifact.

Two halves, both required for the stall:

1. **The scholar could never hurt the lead.** The competent policy strikes the *weakest* live monster. The Focus Group's eye-heads have 1 HP, so every scholar strike targeted an eye — and the eye-heads' fiction (they only watch; they blink aside) consumed the turn with zero damage. The mouths — the parts that matter — never took a hit.
2. **The monster could never hurt the scholar.** The lead's signature attack, **Deliberation**, is a self-centered burst (radius 1 — it goes off around the lead's own body). But the fight engine thought bursts want range 4, so the heads held at spear range forever, declaring Deliberation every cycle against empty ground. A 12,000-round probe measured **10,786 Deliberation declares and exactly 1 that landed** (the Cold Open, which fires on approach).

The engine's no-progress guard never fired because the eye-heads swarm — HP and positions keep shifting, so the "nothing changed" signature never repeats. And the engine itself has no stalemate guard of its own; this is a pre-existing stalemate class (cf. the gallowdeer beam-fatigue fix, commit 59b769ed).

## The fix (design call — Steve can overrule)

Two changes, both fiction-honest:

**1. The heads close in** (`src/js/game.js`, `encWantRange`): for `focus_group` burst patterns, the want-range is calibrated to the pattern's radius (1), following the hummice/toad precedent already in that function. The fiction: the Focus Group is a murmuration that brings its Deliberation to bear — it *closes* on the subject. This is Steve's law honored directly: monsters were sent to fight. The group never leaves, never disengages; it comes closer. The eye-heads still only watch (their interception is untouched) — but the mouths now press the attack.

**2. The eye-heads float** (`src/js/sigW3a.js`, `FG_EYE_MDEF.blocks = false`): the eyes are floating watchers. Mechanically this was required — the swarm was body-blocking the lead's own 2x2 approach (pathfinding returned "no step" 5/5 when the eyes crowded the subject), which would have re-created the never-close half of the stall. The eyes don't impede movement; they only watch. The scholar and the lead can now step through them.

A `FOCUSGROUP_CLOSE=0` environment gate disables the want-range calibration (same pattern as the gallowdeer `BEAMFATIGUE=0` gate), so the bug is reproducible on demand and the fix is independently testable. It is ON by default.

## Before / after (identical seeds)

**RED — pristine code** (`FOCUSGROUP_CLOSE=0`, node fixture, seed 44, strike-weakest driver):
- 50,000 rounds, `over=false`, lead HP 245 → 223 (opening exchange only, then frozen), Deliberation landed **0**
- The stall reproduces exactly: no net damage window, fight never ends.

**GREEN — fix on** (same fixture, seed 44):
- Strike-weakest duel: resolves in **12 rounds** (`lost` — the heads close, Deliberation lands 74, the scholar falls). The stalemate is gone; the monster now fights.
- Honest duel (scholar strikes the lead — the coached counter, "Kill the MOUTHS"): resolves in **10 rounds** (`routed` — mouths 0/0/25, lead dies at −12 HP, surviving eyes flee). Deliberation landed 10 — the counter now costs something, as it should.
- Note: the honest kill ends `routed`, not `won` — the eyes fled but are alive, so `monstersAlive` stays true. Kills and ledger record on both. This is pre-existing end-of-fight semantics, deliberately left alone (out of scope).

**Regression — 8-seed courtship suite** (leadcourt/belongseek, 150d death-aware, identical seeds, before/after):

| metric | BEFORE (fix off) | AFTER (fix on) | verdict |
|---|---|---|---|
| national | 0/16 | 0/16 | identical |
| table | 0/16 (out of reach: needs national+wave5) | 0/16 | identical |
| wave reach (max) | 4 | 4 | identical |
| median survival | 75d | 75d | identical |
| exiled | 0/16 | 0/16 | identical |
| death-cause shares | 14 causes, see below | byte-identical | unchanged |

Death causes (both sides, identical): villager combat 52, villager sickness 22, villager starvation 22, villager villager-combat 23, player combat 22, villager wound-that-wouldn't-close 16, player expedition 3, villager expedition 3, player contest 4, villager monster 5, player starvation 3, villager contest 2, villager mosquito 2, player lockjaw 1.

The before/after JSONs differ ONLY in the `fixOn` flag and wall-clock timings — every game metric is bit-identical across all 16 runs. The fix is surgical: it activates only inside focus_group fights, and this suite's 16 trajectories never hit one, so honest fights are provably untouched. Raw data: `evidence/2026-10-14/inffight-reg-before.json`, `inffight-reg-after.json`.

## Metric review

Per docs/MEASUREMENT.md §14, the pre-registered GO binds this run:
- RED proves the stall on pristine (≥50k rounds, over=false, no net damage window) — **met**.
- After fix, the fixture resolves within a sane round budget, deterministically — **met** (12 / 10 rounds, seed-fixed).
- 8-run before/after: wall metrics within noise; death-cause shares unchanged — **met** (bit-identical across 16 runs; the fix's gate never fires outside focus_group fights).

Metric doubts for the record: (1) The fixture's strike-weakest driver is the *policy's* honest targeting, not a caricature — the competent policy really does strike weakest, which is why the armed s44 trajectory walked into the stall. (2) The 50k-round RED cap is a stand-in for the observed 500k+; the signature (frozen HPs, zero Deliberation lands) is identical. (3) The regression suite cannot easily *hit* the focus group (wave-3, day-61+ content on a 150d courtship suite) — its purpose is proving the fix doesn't touch honest fights, not re-proving the stall. Any wall-metric movement would be a kill regardless of mechanism.

## Village assessment

A fight that never ends is worse than a lost fight — the village's story stops. The Focus Group now does what its fiction always promised: it closes in, it deliberates, and the deliberation *lands*. A scholar who fights it dumb dies in twelve rounds; a scholar who learned the counter ("kill the mouths") wins in ten but bleeds for it. The monster went from a broken infinite loop to a real threat. Nothing else in the engine's honest fights moved.
