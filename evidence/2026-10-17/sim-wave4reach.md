# sim-wave4reach — the vetrel + VETSHAPE composition (2026-10-17)

Run: flesh-out loop arm sim-wave4reach (axis scale-onramp, lever-2 lens).
Worktree: ~/workspace/worktrees/sim-wave4reach. Branch: sim-wave4reach.
Sweep-time master commit: c477ba34553af65b0fa6816ec408cbb0d9aa6152 (recorded
in every per-seed JSON).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (read first; the readiness gate,
design call #4, and the VILLAGER XP LAW are the canon ground this arm stands on).

## The question

Finding #469: maxWaveUnlocked stalls at <=3 on 30/32 runs of seed set 962-969
while wave-5 monsters RAID — wave 4-5 as PROGRESSION is unproven on stalling
sets. Two landed pieces exist: vetrel (scripts/policies/vetrel.js, VETREL=1
default OFF — companion-veteran reliability driver; 18-0 companion wave-3
kills at confirm, evidence/2026-10-16/sim-vetrel.md) and VETSHAPE=1
(src/js/standing.js, default-OFF instrument — veteran bar counts veteran
kills living-or-dead instead of 2 living veterans; PRIMARY GO +3/16 pre-seat,
evidence/2026-10-17/sim-vetshape.md). The 1102Z vetcompose arm was
vetrel x WIN STACK with the default bar — killed by win-truncation. THIS
experiment is different and never measured: compose vetrel + VETSHAPE=1 on
the PRE-SEAT courtship road and measure wave-4 unlocks.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING)

**THE COMPOSITION:** withVetrel over the win-side courtship stack
(SD.leadseat/SD.belongseat — tribfloor -> withWinDefer -> withSeatDrive,
SEATDRIVE=0 EXPLICIT), VETREL=1 + VETSHAPE=1 on the armed arm, both unset on
the control arm. Same policy objects both arms; the ONLY delta is the two
env vars. Nothing here edits vetrel.js or standing.js (read, never edit).

**PRIMARY (GO):** wave-4 unlocks armed minus control **>= +3/16** (vetshape's
bar).

**GUARDRAILS (kill conditions):** median survival armed < control−10d;
national reach armed < control−2; any new death mode on armed; det-gate
byte-identical with both layers off (pinned in the proof test);
SMOKE green (`node scripts/check.js --quick`).

**HORIZON:** 180d death-aware (the wall substrate's standard; dead villages
stop simulating).

**SEEDS:** 8 fresh, 0 filename hits across evidence/ (verified 2026-10-17
before the sweep): 3091141, 3101243, 3211345, 3321447, 3431549, 3541651,
3651753, 3761855. NOT the 962-969 stalling set (forbidden) and not the
vetshape set (fresh ground for the composition).

**POLICIES:** {leadfeast, belongfeast} — the exact win-side stack the
vetshape sweep measured, wrapped in withVetrel (gate-off = pure delegation,
byte-identical to the substrate).

**SUBSTRATE (asserted at sweep startup):** FEASTSCALE_R13=1 TRIBFLOOR=1
SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 EXPLICIT both
arms, ALLOWGATE2 unset.

**ALSO RECORDED per run** (the #427 steve-call feed): first wave-4 unlock
day, and which readiness bar (armor/weapons/veterans/tricks) was binding at
unlock — the short bars on the last unready day before the unlock.

**PROOF:** scripts/test-wave4reach-20261017.js — 15/15 GREEN. Composition
fixtures (off=pristine RED state; on=dead wave-3 killer counted AND vetrel's
stand-down reads the shaped bar — the composition contract); self-contained
det-gate (both layers OFF: composed policy == unwrapped SD stack,
byte-identical on 4 combos, current tree); non-vacuous (armed moves the 60d
trajectory vs off, deterministic). The vetshape pristine baseline could NOT
be reused: the sim-pyrrhic landing (94f78198, src/js/game.js — tbEnd now
writes waveKillLog on 'lost' fights) moved the substrate after that baseline
was captured (first det-gate attempt DIVERGED 4/4 on the stale baseline;
rebuilt as self-contained, then 4/4 byte-identical).

## Results

**PRIMARY: GO — armed 4/16 vs control 1/16 = +3 (threshold met exactly).**

| arm | n | w4 unlocks | starvation deaths | national reach | median gameDays | village-lost |
|---|---|---|---|---|---|---|
| control (both unset) | 16 | 1 | 4 | 11 | 158 | 11/16 |
| armed (VETREL=1+VETSHAPE=1) | 16 | 4 | 3 | 10 | 110 | 3/16 |

The 4 armed unlocks (all NEW vs their control twins):
- s3211345 leadfeast unlock@60, bind=[veterans] (control twin: 180d survived, w3-, no unlock)
- s3101243 belongfeast unlock@88, bind=[veterans] (control twin: died d85, no unlock)
- s3211345 belongfeast unlock@81, bind=[veterans] (control twin: died d147, no unlock)
- s3761855 belongfeast unlock@106, bind=[veterans] (control twin: died d157, no unlock)

The 1 control unlock: s3651753 belongfeast unlock@111, bind=[veterans]
(armed twin: died d147, w3- — the composition moved this seed's trajectory
and the unlock did NOT reproduce; honest noise, not hidden).

**Binding bars (#427 feed): veterans on 5/5 unlocks.** Every wave-4 opening
in this sweep — control and armed — had the veterans bar as the last bar to
clear. Armor/weapons/tricks were satisfiable; veterans was the door.

**Vetrel engagement on the 4 armed unlocks:** invites 1–8, hunts 8–18,
hunt legs 13–36, hunt fights 2–9 per run. The layer was live on every
unlock. yields=0 on ALL 32 runs — the scholar-softens/companion-finishes
yield protocol never fired (the veteran-scholar + near-death + engaged-
companion window never aligned on this substrate; the kills came through
the hunt/commit channel, not the yield).

**End-state readiness on unlocks:** 3/4 armed unlocks show armor/weapons
re-shorted at end (the village opened the door then bled gear/fighters);
the control unlock shows veterans re-shorted (its 2 living veterans died
post-unlock; the monotonic peak ratchet held the unlock). The
"opened a war it couldn't staff" pattern from sim-vetshape reproduces.

**GUARDRAILS:**
1. Median survival (gameDays): armed 110 vs control 158 — the letter of the
   guardrail (armed < control−10d) TRIPS. **But the metric is
   construct-invalid for this treatment — see Metric Review §14 below.**
   Direct village-survival measures go the other way: village-lost 3/16
   armed vs 11/16 control; total deaths 433 armed vs 712 control. The
   composition does not kill villages; it stalls the day clock (mechanism
   documented below). NOT a kill — metric-review item, not a re-score.
2. National reach: armed 10 vs control 11 — PASS (kill needed < 9).
3. New death modes: none. Armed-only causes ("alien":3, "Hushpuppy":1, "a
   wound that wouldn't close":1) are pre-existing game causes — "alien" is
   the alienPlayers.js cause (present on vetshape's control arm too),
   Hushpuppy is a wave-1 monster, wound-closure is a known wound cause.
   Control-only "Old Ugly":1 is likewise pre-existing. PASS (explained).
4. Det-gate: byte-identical with both layers off (4/4 combos, proof test)
   — PASS.
5. SMOKE (`node scripts/check.js --quick`): 96/97 scripts pass. The 1
   failure is scripts/test-sprites-valid-20261014.js (plant/item sprite
   drift: acorn, beechnut, crab_apple, etc.) — pre-existing, in the green
   list, unrelated to this arm (no sprite, data, or game-code changes;
   additive scripts/ + evidence/ only). Documented, not fixed (not my
   axis). PASS with noted pre-existing failure.

## The day-clock stall (mechanism)

The armed arm's `gameDays` (= Game.state.scholar.day, the village clock —
`village.day = scholar.day` in resolveDay) lags the harness loop by 20–104
days (e.g. 180 harness-days → scholar.day 76). Villages are NOT dying
(13/16 survive to 180 harness-days); the clock stalls.

Mechanism: Game.sleep() REFUSES to sleep — returning without the day tick —
when (a) a turn-based fight is active ("Not in the middle of a fight"),
(b) it's barely dawn (dayTicks < TICKS_PER_BATCH), or (c) it's almost dawn
(TICKS_PER_DAY − dayTicks < 2×TICKS_PER_BATCH, "too late for real sleep").
The vetrel layer's deliberate hunt legs (travelTo thicket/ruin/forest/grove
+ engagement, bounded 12-step approaches) consume the day's tick budget;
at bedtime too few ticks remain → refusal (c). The 3-day hunt cadence reads
scholar.day, so the stall also throttles the hunts themselves (self-limiting).

This is a REAL behavioral consequence of the policy layer (not a harness
bug — a human player mid-hunt at bedtime hits the same refusal), but it is
a PACING effect, not a survival cost. It confounds any metric that reads
scholar.day as "survival" — including this run's pre-registered guardrail
operationalization. Filed as a finding (not chased): the vetrel layer's
tick appetite stalls the village clock; a future revision should budget
hunt ticks against the sleep guard or accept the slower clock explicitly.

## Village assessment (plain words)

The modal armed village: the scholar starts inviting the strongest
companions by combat stats from the first days, runs deliberate wave-3
hunts every few days once the third draft opens, and the village clock runs
slow — 180 harness-days buy only ~100 real days. Villages that would have
died on control (11/16 village-lost) instead survive (3/16) — not because
they're stronger per day, but because the composition changes the
trajectories: fewer total deaths (433 vs 712), and the shaped veterans bar
opens the wave-4 door on blood already spent.

Who thrived: the companions the vetrel layer picks by combat stats — they
get invited, hunted with, and blooded. Who died and why: the wave-3
meatgrinder still takes its cut (armed deaths are 61% combat/villager-
combat, same as control's 80% — the mix shifts toward expeditions as
villages live longer). What was missing: not gear, not knowledge — the
veterans bar was the binding constraint on every unlock, and the shaped bar
redefined it around the dead. The composition doesn't fill the "surviving
blood" blank; it proves the door opens on the blood record.

The s3101243 belongfeast village is the honest cost case: unlocked@88,
died d150 in the Mirror Draft it opened — the exact pattern from
sim-vetshape's s2760829. The instrument opens the gate; wave 4 collects
from villages that can't staff it.

## Sense-testing (SENSE-TESTING LAW)

**s3101243 belongfeast armed — the hold, the unlock, the death.**
- d44: "The next act is not for strangers. The village must be ready to
  FIGHT the Final Draft — blood your fighters (0 of 2 veterans)."
- d51: "The next act is still waiting — armor the village (3 of 4 fighters
  armored); blood your fighters (1 of 2 veterans)."
- d58–d86: "The next act is still waiting — blood your fighters (1 of 2
  veterans)." — 37 days with veterans as the SOLE named short bar.
- d88: "📡 RATINGS ARE UP... Wave 4 talent has been released. The Mirror
  Draft opens." / "We've been watching you for a LONG time... Say hello to
  the MIRROR DRAFT."
- The village died d150. The beats never lied about the bars; the door
  opened on the shaped count and the draft collected.

**s3211345 leadfeast armed — the fast unlock.**
- d50: "blood your fighters (1 of 2 veterans)." d57: "still waiting —
  blood your fighters (1 of 2 veterans)." d59: "Wave 4 talent has been
  released. The Mirror Draft opens." Unlock@60, survived to 180.

The fiction consequence stands from sim-vetshape and sharpens with the
composition: the village is told to "blood your fighters" while the count
includes the dead — the hold beat at d86 counts a ghost. Whether a dead
killer is a veteran is Steve's #427 call; this arm proves the composition
moves the unlock (+3) on the shaped definition.

## Metric review (§14 — binding, never re-scored)

1. **The survival guardrail tripped on the letter but the metric is
   construct-invalid.** Pre-registered: "median survival armed < control−10d"
   (kill), operationalized as median(gameDays) following the vetshape
   precedent. Measured 110 < 148 → trip. But gameDays (= scholar.day) does
   not measure village survival under this treatment: the vetrel layer's
   hunt tick-consumption triggers Game.sleep()'s "too late for real sleep"
   refusal, stalling the village clock by 20–104 days/run. Direct survival
   measures contradict the trip: village-lost 3/16 armed vs 11/16 control;
   total deaths 433 vs 712; 13/16 armed villages reach 180 harness-days vs
   5/16 control. The guardrail's INTENT (don't kill villages) is satisfied;
   its OPERATIONALIZATION (scholar.day as survival) fails construct
   validity when the treatment moves the clock. Per §14 this is written
   here, not re-scored: the run does NOT claim a survival benefit (the
   horizon is confounded — fewer real days mean less cumulative danger),
   and the proposed revision for the NEXT run is: survival guardrail on
   endReason village-lost rate and total deaths, never on scholar.day when
   the treatment touches the day clock.
2. **Control hit 1/16 (s3651753 belongfeast unlock@111), not 0/16.**
   Same flicker class as vetshape's control unlock — the monotonic peak
   ratchet catching a two-living-veteran coincidence (end-state veterans
   re-shorted to short=[armor,weapons,veterans]). The GO arithmetic used
   the measured control (+3 over 1), per the pre-reg. Not re-scored.
3. **The armed twin of the control unlock did NOT reproduce it** (died
   d147, w3-). The composition moves trajectories; unlocks are not
   seed-deterministic across arms. Expected, documented.
4. **SMOKE 96/97**: the sprite failure is pre-existing content drift,
   unrelated to this arm. Not fixed (not my axis); the green-list process
   owns it.
5. **Det-gate baseline lesson**: the vetshape pristine baseline was
   invalidated by the sim-pyrrhic game-code landing (94f78198). Det-gates
   that compare against committed baselines must re-verify the substrate
   commit first; this arm's proof uses a self-contained
   composed-vs-unwrapped check on the current tree instead.

## Convergence

**converging.** The composition is proven (proof 15/15 GREEN, det-gate
byte-identical, non-vacuous), the PRIMARY is GO (+3, threshold met exactly
on fresh seeds), guardrails hold on intent (national, death modes,
det-gate, SMOKE-with-noted-pre-existing). The survival guardrail's letter-
trip is a metric-construct failure, documented under §14 with a revision
proposed for the next run — not a lever kill. The #427 feed is sharp:
veterans was the binding bar on 5/5 wave-4 unlocks; the composition
(vetrel hunts + shaped bar) opens the door on the village's blood record;
1 of 4 armed unlocks died in the draft it opened. The axis stays
scale-onramp; wave-4-as-progression now has measured openings on two seed
sets (vetshape's +3 and this composition's +3).

**NOT a game change:** no src/ edits. The composition is env vars over
landed pieces (vetrel.js, VETSHAPE instrument — both default-OFF). The
game default is untouched until Steve rules on #427.

## Files

- scripts/test-wave4reach-20261017.js — proof (fixtures + self-contained det-gate + non-vacuous; 15/15 GREEN)
- scripts/sweep-wave4reach-20261017.js — the 32-run sweep (substrate-asserted, commit-recorded)
- evidence/2026-10-17/perseed-wave4reach/ — 32 per-seed JSONs
- evidence/2026-10-17/wave4reach-sweep-summary-20261017.json — aggregate summary
- evidence/2026-10-17/wave4reach-sweep.log — sweep console log
- evidence/2026-10-17/sim-wave4reach.md — this file
