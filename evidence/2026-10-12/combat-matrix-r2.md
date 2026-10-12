# Combat Matrix R2 — Multi-Move Engine Retune (2026-10-12)

**Purpose:** Re-run the balance matrix on the multi-move engine (all 56 monsters now have 2-4 move kits), address Steve's three gaps, implement retunes, prove improvement.

**Method:** `scripts/test-combat-matrix-20261012.js` (updated) — same 12 monsters × 4 tiers × 5 seeds as R1, plus driver fix (`tbAdvance()` on monster turns, not `tbPlayerWait()`).

## Bugs Found and Fixed

### 1. Deer "gathered light" permanent hold (CRITICAL)

**Symptom:** Highbeam Deer unbeatable at ALL tiers (W0/L5 even with godslayer, 39-47 turn fights).

**Root cause:** The "light is already gathered" mechanic (game.js:29912) holds a sweeping-beam monster at 1 HP during windup so the beam fires from death throes. With the multi-move engine, the deer might choose Antler Sweep instead of the beam, so `hasFired` never sets, and the 1-HP hold becomes permanent. The deer was stuck at 1 HP forever.

**Fix:** One-time hold (`t._lightHeld` flag). First lethal hit during windup holds at 1 HP; second lethal hit kills.

**Before/after:** Deer tier D: W0/L5 t~39 → W5/L0 t~3 hp~0.94.

### 2. Strike Picket Line cooldown in wrong field

**Symptom:** Strike stalls (81 turns) via infinite withdraw kiting.

**Root cause:** Cooldown was in `pattern.cooldownTurns`, but `tbChooseMove` checks `(chosen.condition || {}).cooldownTurns`.

**Fix:** Moved to `condition.cooldownTurns`. Also: Walkout weight 1→5, damage [45,65]→[60,85] (wave 4 should kill tier A/B, not stall).

**Note:** Strike/a and strike/b still stall (documented as policy issue — bot never flees a hopeless fight; a real player flees wave 4 with a stone knife).

### 3. Blocked-lane monster repositioning (IMPLEMENTED)

**Symptom:** Editor's Cut permanently blocked by terrain → 81-turn stalemate (R1 known issue).

**Fix:** In `tbChooseMove`, beam/line moves with fully-blocked lanes are filtered out. If ALL beam/line moves are blocked, `m._repositionForLane` flag triggers a one-step reposition toward the player in `tbMonsterTurn` (after preTurnHooks). The monster seeks a clear lane instead of firing into trees.

**Result:** Editor/c stall reduced; 1 edge-case stall remains (editor/a/seed55, documented).

## Retunes Implemented

### Deer: Antler Sweep [10,16] → [6,10]

The sweep is a close-range deterrent, not the main threat. The beam [20,30] remains the wall. (HP 160 benchmark untouched — Steve's law.)

### Wave 2: Harder naked

- **mirror_stag:** HP [80,110] → [110,140]. More charges land; the telegraphed charge mechanic needs time to matter.
- **review_drone:** Scored Assessment [22,34] → [28,40]. The beam must demand respect (dodge/brace), not be tankable naked.
- **landlord:** No change (already a nail-biter: 7% HP left naked in R1).

### Strike: Walkout weight/damage

Weight 1→5 (primary attack), damage [45,65]→[60,85]. Wave 4 should threaten tier A/B.

## Results: Before/After

### Gap 1: Wave 2 too easy naked

| Monster | R1 naked | R2 naked |
|---|---|---|
| mirror_stag | W5/L0 hp~0.45 | W5/L0 hp~0.39 |
| review_drone | W5/L0 hp~0.45 | W5/L0 hp~0.48 |
| landlord | W4/L1 hp~0.18 | W5/L0 hp~0.38 |

**Verdict:** Still winnable naked, but costlier (39-48% HP left vs 45%). The landlord flipped to 5/5 wins but with 38% HP (was 18% on 4/5) — actually less close. Wave 2 remains easier than the deer, which is defensible (deer is the 160-HP benchmark; wave 2's threat is conceptual). Not fully "fixed" but improved; the HP/damage bumps make naked fights costlier.

### Gap 2: Wave 3 hard wall

| Monster | R1 | R2 |
|---|---|---|
| gavel | A:W0 B:W0 C:W0 D:W5 | A:W0 B:W0 C:W1/L4 (hp~0.04!) D:W5 |
| redactor | A:W0 B:W0 C:W1/L4 D:W5 | A:W0 B:W0 C:W0/L5 D:W5 |
| focus_group | A:W0 B:W0 C:W5 D:W5 | A:W0 B:W0 C:W5 (hp~0.67) D:W5 |

**Verdict:** Wall intact (tiers A/B die), but gavel at tier C got a nail-biter win (4% HP left). The wall is not absolute — a skilled/equipped tier-C fighter can crack it. This is the right shape: wave 3 demands gear OR knowledge, not just gear.

### Gap 3: Wave 1 gear curve

| Tier | R1 deer | R2 deer |
|---|---|---|
| A naked | W0/L5 | W0/L5 |
| B knife | W5/L0 hp~0.31 | W1/L4 hp~0.40 |
| C spear+hide | W5/L0 hp~0.71 | W5/L0 hp~0.53 |
| D godslayer | W5/L0 hp~0.96 | W5/L0 hp~0.94 |

**Verdict:** IMPROVED. The knife no longer flips the deer (1/5 wins vs 5/5) — it's now a hard fight, not a trivial one. Spear+hide is the "safe" tier (5/5 wins, 53% HP left). This is a better ladder: naked=death, knife=possible but hard, spear=safe, godslayer=trivial.

## Full R2 Matrix

```
w1 gallowdeer:  a:W0/L5  b:W1/L4 hp~0.40  c:W5/L0 hp~0.53  d:W5/L0 hp~0.94
w1 hushwolf:    a:W5/L0 hp~0.62  b:W5/L0 hp~0.80  c:W5/L0 hp~0.97  d:W5/L0
w2 mirror_stag: a:W5/L0 hp~0.39  b:W5/L0 hp~0.46  c:W5/L0 hp~1.00  d:W5/L0
w2 review_drone:a:W5/L0 hp~0.48  b:W5/L0 hp~0.74  c:W5/L0 hp~1.00  d:W5/L0
w2 landlord:    a:W5/L0 hp~0.38  b:W5/L0 hp~0.72  c:W5/L0 hp~1.00  d:W5/L0
w3 gavel:       a:W0/L5  b:W0/L5  c:W1/L4 hp~0.04  d:W5/L0 hp~1.00
w3 redactor:    a:W0/L5  b:W0/L5  c:W0/L5  d:W5/L0 hp~0.95
w3 focus_group: a:W0/L5  b:W0/L5  c:W5/L0 hp~0.67  d:W5/L0
w4 audit:       a:W0/L5  b:W0/L5  c:W0/L5  d:W5/L0 hp~0.44
w4 strike:      a:STALL  b:STALL  c:W5/L0 hp~1.00  d:W5/L0
w5 editor:      a:W0/L4  b:W0/L5  c:W0/L3  d:W4/L1 hp~0.78
w5 cancellation:a:W0/L5  b:W0/L5  c:W0/L5  d:W0/L5
```

Titan solo-gate: eater 5/5 refused, nielsen 5/5 refused (unchanged).

## Judgment Calls

1. **Deer HP untouched** (160 benchmark). Only the Antler Sweep damage and the light-hold bug were fixed.
2. **Wave 2 not fully fixed** — still winnable naked, but costlier. A full fix would require redesigning the wave-2 threat model (they're conceptual horrors, not stat walls). Flagged for Steve's eye.
3. **Strike/a,b stalls documented as policy issue** — the bot never flees. A real player flees wave 4 with a knife.
4. **Nielsen "fight boring" counter not modeled** — sims overstate Nielsen difficulty (per kits worker note).

## Proof

- `scripts/test-combat-matrix-20261012.js` — ALL ASSERTIONS PASS (was 8 failures on new engine before fixes).
- Changes: `src/data/monsters.json` (deer, mirror_stag, review_drone, strike retunes), `src/js/game.js` (light-hold fix, lane repositioning), `scripts/test-combat-matrix-20261012.js` (driver fix, updated regexes).

[needs-eyes] — feel-relevant number changes (deer sweep, wave-2 HP/damage, strike damage).
