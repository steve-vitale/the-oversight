# sim-arming — the readiness-substrate diagnostic (finding #427)

**Run**: flesh-out loop, 2026-10-16, axis SCALE-ONRAMP (blocking).
**Question**: commit ebcdf397 gates wave-4 unlocks on waveCombatReadiness() —
4 fighters armored P>=15, 5 armed, 3 counters known, veterans with wave-3 kills.
On the pre-seat courtship substrate 0/48 runs across 12 seeds unlocked wave 4.
Is ANY policy able to satisfy readiness on this substrate, or is it structurally
unreachable?
**Layer**: scripts/policies/arming.js (ARMING=1, default OFF) — NEW file, zero
game-code, zero changes to existing policies. Wraps leadfeast/belongfeast.

## PRE-REGISTRATION (written before the pilot)

- **Primary metric**: wave-4 unlocks (maxWave >= 4 at any point in the run).
- **GO threshold**: (armed unlocks) − (control unlocks) >= 4 across the 16-run pilot.
- **KILL**: miss the GO bar. Verdict on miss: "structurally unreachable on
  pre-seat" — the w4/5 trick game belongs to the winning substrate only.
- **Guardrails**: no new death mode (n>=3); national >= control−2 (per 8-seed
  set); median survival >= control−10d (per policy pair).
- **Horizon**: 180d death-aware (dead villages stop; the scale wall needs the
  full clock — wave 3 fires ~d25–75, Standing crosses 100 ~d60–120).
- **Seeds**: 8 fresh seeds (1201–1208).
- **Policies**: {leadfeast, belongfeast} x {control (ARMING unset), armed (ARMING=1)}.
- **Substrate**: pre-seat courtship — SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1
  (per the 0215Z method note: unset != active).

## The lever

Four pushes, all policy-side, all engine-honest:

1. **ARMORY**: scholar crafts stone_knives (L3, bonus 12 — the best craftable
   weapon on this substrate; hunting_spear is L0) and donates them via the real
   `donateWeapon` verb. Villagers borrow on departure. Feeds the ARMED bar.
2. **ARMOR**: the scholar CANNOT craft P>=15 armor on this substrate
   (hide_armor L0; bark_armor L1 via the old-cuirass beat, P=10 < 15). So the
   armor push is PRESERVATION: companion selection never risks P>=15 wearers.
   Documented, not faked.
3. **COUNTERS**: daily beasttricks ask at Haven when counterTeachable() has a
   trick. (Bar already met organically at 16–27; this is the pursuit push.)
4. **VETERANS** (the load-bearing bar): companion protocol (inviteToParty,
   trust>=20, 1–2 companions, never the armored) + deliberate wave-3 hunt leg
   (thicket/ruin, every 3rd day, HP>=60%, fed, committed via ctx._huntCommit)
   + veteran preservation (a scholar who banks a wave-3 kill stops committing
   to 12% — the standard 35% eject protects veteran 1 while the hunt
   continues for the companions' kill chances). Companion killing blows count
   as villager veterans via the tricktag channel (finding #405).

## Baseline diagnostic (the structural picture)

Probe (2 seeds x 2 policies, control): armor/weapons/tricks are all satisfiable
on control mid-game (armored 4–6, armed 7–12, tricks 16–27 on s11-like seeds).
The SOLE structural blocker is **veterans**: 0–1 living wave-3 killers, never 2.
Wave-3 kills happen 2–5x per surviving run, ALL via the scholar ("player"
channel), and the killers die. ZERO villager wave-3 kills in 6 probe runs.
Standing OPENS fine (s11 leadfeast: raw 487, gated 99 = T4 hold by readiness).

## Results

**16-run pilot (seeds 1201–1208, 180d death-aware, SEATDRIVE=0, FEASTSCALE_R13=1):**

| | control (leadfeast/belongfeast) | armed (arming-lead/arming-belong) |
|---|---|---|
| wave-4 unlocks | **0/16** | **2/16** |
| national | 0/16 | 0/16 |
| median survival | 147d | 180d |
| survived / village-lost | 4 / 12 | 11 / 5 |

Per-policy: arming-lead 2/8 unlocks (s1201, s1202); arming-belong 0/8;
leadfeast 0/8; belongfeast 0/8.

**PRIMARY: NO-GO (2 < 4). KILLED AT PILOT per §14.**

**Guardrails: ALL PASS.** No new death mode (both sides die village-lost, the
standard wall cause; armed actually survives better: 11/16 vs 4/16). National
0/16 both (>= control−2). Median survival 180d vs 147d (>= control−10d).

**But the mechanism is PROVEN — twice.** Both unlocks came through the exact
channel the driver was built for:

- **s1201** (arming-lead): d99, companion **boris_kowalski** lands the killing
  blow on a wave-3 Redactor (tricktag `via='companion'`). d100: veterans=2
  (scholar nora_wilson + boris), armor=4, weapons=7, tricks=17 — all bars met,
  **wave 4 unlocks**. d105: boris dies, vet drops to 1, but the peak ratchet
  holds the unlock.
- **s1202** (arming-lead): d~120, companion wave-3 kill → vet=2 (armor=5,
  weapons=8) → **wave 4 unlocks**.

The layer's snap telemetry on the unlock runs: 20 and 8 vet hunts, 7 and 4
hunt engagements, 24 and 4 committed vet-hunt fights, 3 companion invites OK
each, armory donations flowing.

## Village assessment

The two unlocking villages show what an armed village looks like on this
substrate. s1201 (d180 survived): the scholar hunted wave-3s deliberately
(6 w3 kills: 5 scholar, 1 companion), the armory fed villagers stone knives,
and the readiness gate released exactly when the second veteran was blooded.
The village then lived to d180 with wave 4 in the world — the first pre-seat
courtship villages to do so.

The non-unlocking armed runs show the gap: s1203 (7 w3 kills, vet=1 at end —
one veteran short), s1208 (vet=0 despite 19 hunts — the kills didn't land).
The companion killing blow is stochastic; 2/8 on the lead road is the measured
rate.

Who died: the standard wall causes. The armed side's survival IMPROVED
(median 147→180d, village-lost 12→5) — the hunt leg + companions + armory
did not buy unlocks at the cost of lives.

## Sense-reads (SENSE-TESTING LAW)

Read the arming-lead s1201 transcript (d1–110). The arming beats are
in-character, not robotic:

- d12: "You make a Stone knife." / "Equipped Stone knife (melee)." — the
  scholar arms themselves first.
- d26: "Left your Stone knife in the armory. Anyone who needs it can take it."
  — the donateWeapon verb's honest voice.
- d83: "Taken: ... Hunting spear x1 ..." — villagers borrowing from the armory.
- d84: `[SYS] 📡 The next act is still waiting — armor the village (3 of 4
  fighters armored); blood your fighters (0 of 2 veterans).` — the readiness
  hold beat naming exactly what's missing.
- d89: `🤝 Boris joins your party. "...Fine. This had better be worth it."`
  — the companion invite, in Boris's gruff voice. Boris is a person first:
  foraging (d80–81), arguing about watch rotation, teaching Chanterelle,
  getting mauled by a Grief Counselor (d83), being patched up.

Nothing robotic. The scholar is not a quartermaster-bot — the crafting and
donating read as a person preparing their village for war.

## Metric review (§14)

- **PRIMARY judged NO-GO (binding).** The +4 bar (25% unlock rate) was set
  before the mechanism was known; the measured rate is 2/16 (12.5%) on the
  lead road, 0/8 on belong. This is not a re-score: the metric stood.
- **The kill is on POWER, not mechanism.** The companion-veteran channel is
  proven and replicated (2/2 unlocks via the designed path, trace-verified
  to the exact day). The layer is deleted per kill protocol, but the
  MECHANISM is the finding.
- **The task's prescribed verdict ("structurally unreachable") is
  contradicted by the evidence.** 2/16 runs satisfied readiness. The honest
  verdict: readiness is REACHABLE on the pre-seat substrate via the
  companion-veteran channel, but RARE (2/16). The w4/5 trick game is
  MEASURABLE here (2 unlocks prove it), not locked to the winning substrate.
- **Armor-crafting push: knowledge-blocked, documented.** The scholar cannot
  craft P>=15 armor on this substrate (hide_armor L0; bark_armor L1, P=10).
  The armor bar (4x P>=15) is satisfiable only via spawn armor + preservation.
  Any future arming work must either teach the scholar hide_armor or accept
  the preservation-only armor game.
- **belong vs lead:** the unlocks came only on the lead road (2/8 vs 0/8).
  The belong road's hunts fired (13–24 vet hunts) but produced 0 companion
  kills. Road-dependence is noted, not explained — a future arm could
  investigate.

## What this means for the scale-onramp axis

Finding #427's question is ANSWERED: **readiness is not structurally
unreachable on pre-seat.** A policy CAN satisfy it — the companion-veteran
channel (scholar hunts wave-3 with companions; a companion's killing blow
counts via tricktag) produced 2/16 wave-4 unlocks against a 0/64 control
baseline (0/48 historical + 0/16 here).

The ceiling moved: the blocker is no longer "can any policy arm?" but "how
to make the companion-veteran channel reliable." The 2/16 rate says the
channel exists; the work is now reliability (more companion kill
opportunities, better companion survival, road-dependence).

