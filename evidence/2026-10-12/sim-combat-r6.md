# Long-run sim — lever 1 r6: the competent player armors up (2026-10-12)

## Lever played
**The competent policy now wears the best armor it owns and crafts bark armor
when the recipe is known.** One knob: player armor competence. No src/
changes — policy only (`scripts/policies/competent.js`, gearUp's ARMOR
section). No `[needs-eyes]`: nothing the player feels changed; only the
measurement instrument plays the game as designed.

Two blanks closed in the policy (r5 precedent: policy changes count as
playing this lever):
1. **Best-armor, not first-armor.** The old code equipped the first armor-def
   item in inventory order, only when every armor slot was empty. Probe
   (`scripts/probe-armor-20261012.js`, seeds 8/14/22, days 30/60/100) caught
   a P=2 flannel shirt worn over a P=10 bark armor sitting in the pack —
   never upgrading. Now: max-protection owned piece vs max-protection worn
   piece; equip when better (slot-aware via `S.equipment.slotForItem`).
2. **Craft bark armor when known.** Bark armor (P=10) is universally
   craftable — bark 3 + vine 2, no skill requirement; `craft()` enforces the
   L1+ recipe-knowledge gate itself (handling gear teaches L1; blind L1 is an
   honest 35% with materials at risk). The policy never crafted it: 2/3
   sampled seeds fought wave-3 — whose bands the design anchors at P=64 —
   with P~2. Now: when nothing owned and nothing decent worn, and the recipe
   is known and materials are on hand, craft it.

Env gate `COMPETENT_CRAFT_ARMOR=0` restores the legacy path verbatim for
before/after measurement.

**Why this lever, and not a monster buff (5-question evaluation):**
1. Real-world anchor: a competent survivor wears the armor they can make.
2. What breaks if wrong: too much armor → wave 1-2 trivial. Guardrails hold:
   bark is P=10 (r=0.33, ~1/3 absorbed), the recipe must be LEARNED first
   (knowledge-gated, usually via handling a villager's armor), materials are
   real, craft can fail. The player still enters wave-3 at ~P=10-15, far from
   the P=64 anchor — the wall stands, it's just no longer a naked wall.
3. What the sim says: below — wave-2 losses 21→10, wave-3 wins 1→3,
   survival within noise, no starvation worsening.
4. What it feels like: the fights read the same, the player just doesn't
   bleed out as fast (transcript-verified: "Armor absorbs 6/9" where the
   base run showed 2-4).
5. Fiction: villagers already wear bark armor (their deaths −31% when it
   landed). The player joining them is the village learning together.

**Why NOT buffing wave-1 monsters:** the wave-1 loss collapse (43%→~16%,
see below) is driven by designed player-strength gains (trial-deed combat
abilities, counter-play, 6-slot economy working) — re-buffing monsters
would fight Steve's designed arc and the 2026-10-09 hardening. Documented
as a stale-target finding, not a malfunction.

## Before / after (identical seeds 1–24, 200 days, competent policy)

Policy before = legacy armor path; policy after = armor-up. Game code
identical (master @ fe09b7f3).

| metric | before | after | delta |
|---|---|---|---|
| median survival | 64d | 64d | flat |
| max survival | 200d | 200d | flat |
| player deaths | 67 | 62 | −5 |
| villager deaths | 123 | 120 | −3 |
| player combat share | 68.7% | 67.7% | −1pp |
| player starvation share | 22.4% | 25.8% | +3.4pp (composition: combat fell; absolute 15→16) |
| villager combat share | 68.3% | 64.2% | −4.1pp (84→77) |
| wave-1 fights (won/lost/routed) | 146 (84/22/39) | 112 (71/22/41)* | loss 15.1%→16.4%, flat |
| wave-2 fights (won/lost/routed) | 69 (28/21/20) | 58 (27/10/21) | **loss 30.4%→17.2%** |
| wave-3 fights (won/lost/routed) | 22 (1/18/3) | 26 (3/18/5) | loss 81.8%→69.2% |
| wave-2 lost-fight entry HP (median) | 95 | 56 | armor converts high-HP deaths to survivals |
| counters discovered | 229 | 223 | noise |
| counter-kill proxy | 103 | 99 | noise |
| wave reach (runs w1/w2/w3) | 24/19/8 | 24/18/9 | flat |
| national reach | 0/24 | 0/24 | upstream still binds |
| trauma total | 26 | 24 | noise |

\* Fewer wave-1 fights after (146→112): the armor change perturbs RNG
trajectories only where armor is in play (most seeds bit-identical
day-for-day — the change is surgical); fight COUNT differences are
downstream of divergent run paths, not the lever directly.

Per-seed wave-2 losses improved or held on 8/9 seeds with losses (only
seed 19 worsened, 0→1). The drop is consistent, not outlier-driven.

## Reachability verdict (combat content)
- **Wave 1:** 24/24 runs fight it. Loss rate ~16% — see the stale-target
  finding below.
- **Wave 2:** 18–19/24 runs. Loss 30%→17% — the "genuine step up" is now
  winnable for an armored competent player, still deadly (10 losses).
- **Wave 3:** 8–9/24 runs reach it; wins 1→3 (Ad Break, Buffering,
  +1). The wall stands (bands Steve-anchored) but it's no longer a naked
  wall — wins come from played counterplay (see transcript notes).
- **Waves 4–5:** 0/24 — still lever 2's bars (scale-bound by design).

## The wave-1 loss collapse — cross-lever finding (documented, not fixed)
Standing design target: wave-1 fight loss 43–44% ("designed brutality",
sim-combat-deathshare 2026-10-11). Measured now: **15–17%** on identical
seeds 1–20. The collapse is real and its cause is identified: between the
r5 measurement (32% on seeds 1–16, counter-play only) and now, the
**trial-deed grants** landed (22ce65e8, abilities lever: win_a_fight→
adrenaline_control, take_50_damage→trade_of_blows, blood_trial→
adrenaline_surge — mean abilities 3.58→5.58). The abilities worker measured
"survival/waves within noise" but never looked at fight loss rates — the
side effect went unmeasured until this run. A trapline ablation
(COMPETENT_TRAPLINE_SET=0 / COMPETENT_CLEAN_CATCH=0, seeds 1–16) moved
wave-1 loss only 17.6%→18.9%: food is NOT the driver.

Judgment: the 43% target is stale, not the game broken. It was measured
when the competent player held ~3.6 abilities and played no counters; the
player is now stronger BY DESIGN (6-slot economy filling, trial deeds
firing, counters played). BALANCING.md's canonical duel anchor — "solo
hushwolf [12,17] vs 100-HP player: win 10/10 but lose ~37 HP" — never
supported a 43% loss rate for a skilled, counter-playing, ability-rich
player; the 43% was a team measurement from a weaker-player era, not a
design parameter. Buffing wave-1 monsters to hold a loss RATE constant
would fight the designed arc ("late game the player is an engine").
**Recommendation for Steve:** either retire the 43% target (my call: it's
stale) or say the word and a future combat run retunes wave-1 pressure —
but that means reopening the 2026-10-09 hardening, not a quiet tweak.

## Village assessment (plain words)
The village of the after-run is a place learning to armor itself. On seed
22 the player finally stopped wearing a flannel shirt into a Buffering
fight: day-30 protection 2→10, day-60 15 (bark + looted pieces stacking
as the design's additive model intends). Wave-2 stopped being a
coin-flip — 21 deaths became 10, and the deaths that remain happen at
56 HP entry instead of 95: the armor converts full-health deaths into
survivals, and what still kills is fighting hurt.

Who died and why: combat is still the reaper (68% of player deaths, 64%
of villager deaths — the designed game, per the deathshare run). The
Buffering still kills — but now it kills honestly: the day-86 transcript
shows the player playing the stand-still counter perfectly ("It flails at
the air beside you — no heading, no motion, nothing to catch"), telegraphs
firing truthfully ("It steps right — exactly where it said it would"),
and losing because they brought a sharpened stick (29/strike) to a
240–420 HP fight. Wrong weapon, not a broken mechanic. The Ad Break win
shows the other side: the player killed the 40-HP Sponsor-creature (the
designed counterplay) and took the fight at 63 HP remaining.

What was missing: the player fought naked by default — the game offers
bark armor from day one and the policy never reached for it. That's the
blank this run filled.

Villagers act like people (transcript-verified, SENSE-TESTING LAW): Zuri
dies beside the player in the Buffering fight — "You carry the weight of
it. They died beside you." / "Nobody's talking much. The fire feels
smaller tonight." / "The entry for Zuri is finished. 5 deeds recorded. No
more pages." Emma stands up at the fire: "Nobody's saying it, so I will:
we need a plan, tonight." After a bloody return: "You came back bloody.
Nobody asks. Someone saves you the good seat by the fire." Specific,
consequential, mournful — not robotic. No repeated-template dialogue
flagged in the sampled fights.

## Blanks filled / documented
- FILLED: policy armor competence (best-armor equip + bark-armor craft).
  Proof `scripts/test-armor-up-20261012.js` 5/5 (RED 1/5 on legacy path).
- DOCUMENTED: wave-1 loss target (43–44%) is stale given designed
  player-strength gains; trial-deed side effect on fight loss rates was
  unmeasured by the abilities lever. Recommendation above; Steve's call.
- DOCUMENTED (no action): waves 4–5 unreachable at 0/24 — lever 2's
  scale bars, by design. National reach 0/24 — upstream (scale/travel)
  still binds; not combat's to fix.

## Tooling
- `scripts/dump-fight-20261012.js` (new): replays a seed with full
  telemetry, dumps the say-stream around each wave-3+ combat with its
  result — the SENSE-TESTING reader. `SEED=24 DAYS=90 node
  scripts/dump-fight-20261012.js`.
- `scripts/probe-armor-20261012.js` (new): samples equipped/inventory
  armor, protection, and armor-recipe knowledge at days 30/60/100 across
  seeds — the measurement behind the armor-gap finding.
- `scripts/sweep-combat-lever.js` (existing, reused): before/after on
  identical seeds via `COMPETENT_CRAFT_ARMOR=0` gate.

## Proof & regressions
- `scripts/test-armor-up-20261012.js`: RED 1/5 on legacy path (A1/A2/B1/B2
  fail — the blanks reproduced), GREEN 5/5 on new path.
- Regressions: `test-counterplay-20261012` 36/36, `test-aid-pipes-20261012`
  11/11, `test-trapline-set-20261012` 15/15 — all green.
- No src/ changes; ontology untouched. No jest run (no jest suites added;
  policy scripts are node-run, per the no-concurrent-jest rule).

## Commit
Policy-only change; merged locally, pending ship. No version bump, no push
(ship loop owns deploys).
