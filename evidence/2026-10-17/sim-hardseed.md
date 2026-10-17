# sim-hardseed — autopsy of the hardest observed seed (2026-10-17)

Run: flesh-out loop arm sim-hardseed, scale-onramp axis. Read-only diagnostic
(except the new instrument + proof, scripts/ only; ZERO src/js changes).
Canon: docs/CANON.md. Target: seed 1940809, the wincensus-c finding
("village-lost ~day 50 on BOTH sides — a hard seed, substrate-determined, not
an armed effect"; sim-wincensus-c.md).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE analysis)

**Question:** what kills a village at day ~50 on the full win-side stack,
identically across policies (leadfeast/belongfeast) and seatdrive settings
(armed/control)? Reconstruct the death sequence, the village's state at each
stage, what was missing, and whether the hardness is substrate-determined or
structural.

**Substrate (pinned — this matters, see Metric review):** the autopsy runs on
master@1d565b52 (2026-10-17 06:11 UTC), the tree state the sweep's s1940809
runs executed on — NOT current master. Det-gate (see Proof) verifies
byte-identical trajectories. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, ALLOWGATE2 unset, SEATDRIVE explicit
per side.

**PRIMARY (diagnostic GO):** a named, evidence-backed hardness mechanism —
every death in the day-50 collapse attributed to a causal chain, with the
substrate-vs-luck verdict argued from the 4/4 identical outcome. A miss
(unattributed deaths, no mechanism) is NO-GO, never re-scored.

**Secondary:** the named next — what would save this seed, or what it teaches
about the wall.

## The mechanism (named): the HOSTILE-REGION COMPOUND — a pre-seat wall

Seed 1940809 generates a region that goes hostile-splinter: Ashford,
Thornfield, and Emberhold all split (hardliner/cannibal factions), spawning
The Bloodied, The Bloodied II, and The Red Table I/II/III — up to five
hostile splinter fires circling one Haven. The compound has five interlocking
parts, all live game systems, none of them RNG noise:

1. **Forage-ground competition.** The splinters work the same northwest
   ground as Haven's crews ("The northwest ground is thinning faster than
   your crews alone could strip it"; "Fresh-cut stems on the northwest
   ground — someone else is working turf your crews use"). Gardens go
   untended (Burdock drowned in weeds, six untended days, four plots).
2. **Raid hemorrhage.** Stonebridge, Ashford, The Bloodied strip the pantry
   repeatedly: 1,300 (d6) + 1,000 (d28) + 1,000/1,500 (d37) + 1,800/1,500
   (d40) = 8,100 kcal on the leadfeast road alone; the belongfeast road adds
   a treeline demand ("Your pantry or your blood. Choose." — 2,000 demanded,
   1,220 taken, d42–43) plus 800/1,550/500 raids.
3. **Grief-leveraged tribute.** Every death shakes the young regional links
   ("the dead hold no treaties"); the neighbors press tribute UP as the
   village grieves — 3,000 kcal/week (leadfeast d49), 11,250 kcal/week
   (belongfeast d46). Ruth of The Red Table II's mercy plea is answered with
   silence ("They walk back to The Red Table II with nothing. They'll
   remember the silence.").
4. **The wave-3/contest meatgrinder.** Wave 3 releases d30 ("Wave 3 talent has
   been released into your sector"); the contest billing is explicit —
   "HIGH RISK — people die in this one. Regularly." The fighters die on
   camera: Arturo (d34), Penelope + Darnell (d38), Hassan (d41), Naran +
   Devon (d49) on the leadfeast road.
5. **The pantry death spiral.** Pantry holds ~40k kcal through d44, then
   collapses: 32,847 (d41) → 29,550 (d44) → 5,200 (d47) → 0 (d48–49). Fewer
   living foragers → less income → raids + tribute extract → the rest starve
   (Hassan, Sofia starve d41 on the belongfeast road: "The village is 3 now").

**The structural part — why the stack can't touch it:** the collapse resolves
by day ~50. The landed win-side stack's operating window starts at the
day-90 seat floor (invitations fired d90–139 on the winning seeds;
seatDay=null, sittings=0, tableAnswers=0 on all four s1940809 runs). The
sweep recorded armed==control **byte-identical hash trajectories** — the
stack has literally zero causal contact with the collapse. This is a WALL,
not a draw: no seat mechanic can reach into the 0–50 window. If the design
wants seeds like this winnable, the lever must be pre-seat (raid defense,
tribute negotiation, splinter diplomacy) — not more seat machinery.

## The 4-run death sequences (full attribution — instrument-verified)

Death log captured via a Game.registerDeath wrapper mirroring the sweep's,
on the sweep-time substrate (det-gate PASS 4/4 — see Proof). Aggregate bins
match the deathLog 1:1 (30/30 leadfeast, 25/25 belongfeast).

**leadfeast — village-lost d49, 30 deaths** (combat 16, villager combat 9,
monster 2, sickness 3):
- d3: Sweeps Week (monster, "stripes flowing where no wind blows") — killed
  by villagers ("The village drew first blood")
- d5: unnamed 60s woman, the FIRST GRAVE — killed by a monster
- d8: Flashbulb Moth, Murkcap (monsters) — killed by villagers
- d9: White Noise (monster) — combat
- d13: tick (monster) — villager combat
- d14: Nightlight (monster) — villager combat; **Ingrid — sickness**
- d19: Hushpuppy, mosquito (monsters) — villager combat
- d21: **Samrawit — sickness**
- d22: **Keabetswe — sickness**
- d30: The Static Kite, The Ugly Beast (monsters) — combat
- d31: Speedbump (monster) — combat
- d34: **Arturo Bae — combat** (contest era; "the dead hold no treaties")
- d38: **Penelope Winkler, Darnell Mensah — combat** (the Gavel names it:
  "Day 38: Penelope Winkler died. Darnell picked up the Codex" — GUILTY)
- d39: Hummice (monster) — villager combat
- d40: Big-Eyes (monster) — villager combat
- d41: **Hassan Ali — combat**
- d44: Ugly-Eyes (monster) — combat
- d46: **Hannah — monster**
- d47: Spool (monster) — combat
- d49: "ducks in a row" ×4 (a monster pack: 14, 2, 4, 5) — combat;
  **Naran Tumen, Devon Okafor — combat** → village-lost

**belongfeast — village-lost d51, 25 deaths** (villager combat 8, monster 1,
combat 6, sickness 5, "a wound that wouldn't close" 3, starvation 2):
- d3–d22: IDENTICAL to leadfeast (11 deaths: the village kills wave-1/2
  monsters; sickness takes Ingrid, Samrawit, Keabetswe)
- d28: **Devon — sickness**
- d31: The Ugly Beast (monster) — villager combat
- d32: Extended Warranty, The Heckler (monsters) — combat
- d37: **Arturo Bae — combat** ("Wave 3: The lead falls")
- d39: The Static Kite, Static (monsters) — combat;
  **Ivy Wang — a wound that wouldn't close**
- d40: **Naran — sickness**
- d41: **Hassan — starvation; Sofia — starvation** ("The village is 3 now")
- d46: **Penelope Winkler — a wound that wouldn't close**
  (tribute pressed to 11,250 kcal/week as she dies)
- d50: **Zoltan Nagy — a wound that wouldn't close** → village-lost d51

**Attribution completeness: 55/55 deaths named, dated, and causally binned.**
The two policies share the first 22 days of deaths exactly, then diverge:
leadfeast dies in the combat meatgrinder (wave-3 + contests + the duck pack),
belongfeast dies to attrition (sickness, unclosed wounds, starvation). Same
wall, two faces.

## Village assessment (plain words)

**What the village looked like.** Days 1–30: a functioning Haven of 11
villagers + the scholar, pantry ~40k kcal, killing wave-1/2 monsters cleanly
(9 villager-combat kills), teaching (thorny acacia, Burdock, Shea, Jerusalem
Artichoke, White Crossberry drawn in dirt), linking — Stonebridge by d20
("Darnell speaks at Stonebridge's table now"), regional by d46. Days 30–50:
the compound closes — fighters die on camera, raids strip the pantry, the
neighbors monetize the grief. The village kept RECRUITING while dying
(visjoin_38, visjoin_44 arrive mid-collapse — "a tired mechanic of The Red
Table wants to join Haven. 'I saw you on the broadcast. You looked like
people who eat.'"). The scholar lives through all of it — clutching the
Dead Phone through keepsake L1 (d9) and L2 Lucky Break (d22), winning
contests while the village starves. Village-lost with the scholar alive.

**Who thrived.** Nobody thrived to the end — that is the point. The fighters
stood down wave-1/2 monsters cleanly (Keabetswe 5 rounds vs the red moon,
Ingrid 6 vs the Anaconda Empress, Naran 3 vs the Hushpuppy) and won contests
on camera (Naran, Ivy, Antonio, Darnell all won) — then died in the wave-3
meatgrinder anyway. The teachers taught (Keabetswe, Ivy, Ingrid, Hannah,
Zoltan drawing plants in dirt). The village-as-protagonist died of
compound pressure, not of any one person's failure.(K
...[truncated 7750 chars]