# sim-readiness-audit — wave-5 readiness-gate diagnostic audit (flesh-out loop, 2026-10-20)

Run: fleshout-20261020T1915Z, arm sim-readiness-audit. Axis: scale-onramp (the blocking axis — the wave-5 door is the binding wall).
INSTRUMENT-ONLY DIAGNOSTIC — zero src/js changes, zero scripts/policies changes (substrate layers are the landed w5path/w5census stack, composed upon, never edited).
Worktree: ~/workspace/worktrees/sim-readiness-audit. Commit: instruments + proof + evidence only.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, deed bars, readiness design call #4 — the combat-readiness section).

## Where this sits

- sim-w5door-measure (2026-10-20, DIAG-GO, landed bcd1d6b25 + 65024286f): the wave-5 unlock-PATH end-to-end diagnostic. PRIMARY attribution completeness GO (15/15 eligible, 0 unattributed). Its stall table (evidence/2026-10-20/w5doormeasure-stall-attribution.md) is this arm's starting point: engaged runs stalled on readiness-veterans 0-1/2, readiness-armor 0-3/4, readiness-weapons 0-5/6 (all terminally); E3: 10 wave-4+ kills all via=player, the killer incarnation died within 30d in 9/10.
- sim-vgearjudge2 (2026-10-20, GO): villagergear fills the 2-living-veterans bar engine-honestly (VGEAR=1, pilot GO, confirm NO-GO, combined 4/16 vs 0/16).
- Steve's #427 readiness-gate call → the VETSHAPE instrument on master (sim-vetshape, 2026-10-17): VETSHAPE=1 = living-or-dead killer counting; default OFF = pristine living-veterans. This arm does NOT change it — it computes the shadow and notes its presence.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims)

**Question:** for the wave-5 combat-readiness gate (design call #4, `Game.waveCombatReadiness(w)` in src/js/standing.js), what does each leg COUNT vs what does the village ACTUALLY HOLD — and for every run that unlocks wave-4 but never wave-5, what is the binding leg WITH ITS MECHANISM?

**PRIMARY (diagnostic GO): attribution completeness.** Every run with peak >= 4 and peak < 5 (wave-4 unlocked, wave-5 never unlocked) carries >= 1 named leg attribution with a mechanism string (e.g. "armor leg: 3 fighters at P≥15, 4th fighter's P12 hide armor in pack not worn"). The analyzer FAILS LOUD (exit != 0) on any eligible run with 0 named attributions. GO = 100% of such runs attributed; MISS = any unattributed run (never re-scored, §14). Expected eligible count: 15 (the w5doormeasure count on these seeds); the bar is a fraction, not a count.

**Corpus:** 8 seeds (65111–65118 — the w5doormeasure named set, so this audit extends its attribution mechanism-by-mechanism on identical trajectories) x {leadfeast, belongfeast} = 16 runs. "Control" = the baseline competent substrate (no treatment anywhere; the census instrument is the only addition, DET-pinned inert).

**Substrate (EXACT w5doormeasure stack + KILLDISC=1 per the brief):** policy withSeatDrive(withWinDefer(withVetrel(withReposition(TF base)))) on {leadfeast, belongfeast} tribfloor bases. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 (VETREL/REPOSITION unset -> inert; SEATDRIVE=0 -> seatdrive pure delegation; VETSHAPE unset -> veterans bar is the pristine living-only default; KILLDISC=1 installs the landed read-only tbDamage attribution instrument — det-pinned by its own proof, kept on both DET arms).

**Horizon:** 180d death-aware (dead villages stop simulating). Set from the w5doormeasure baseline survival distribution (median 181.5d) — 180d covers the upper tail; never a fixed 200d.

**Policies:** competent-policy tribfloor leadfeast/belongfeast (the loop's competent policy standard).

**Instrument:** scripts/probe-readiness-audit-20261020.js — the gate's exact numbers (from the engine's own `Game.waveUnlockReady(5)`, the object the deferral reads) PLUS the true-held census per leg, recorded daily on deferral(5)-true days (post-daily state, deterministic per seed) and once at terminal. Pure reads: no state writes, no RNG draws. The scholar-armor read replicates `armorBonus()` on a deep copy (migrateEquipment is a write — the census must not trigger it). The VETSHAPE=1 shadow is computed manually; the env is NEVER set, so the engine's gate stays pristine.
- scripts/analyze-readiness-audit-20261020.js — stall classification + per-run mechanism attribution; fails loud on any unattributed eligible run; writes evidence/2026-10-20/readiness-audit-stall-attribution.md.
- scripts/test-readiness-audit-20261020.js — proof: fixtures F1–F6 RED→GREEN (gate-parrot fails the mechanism assertions RED; real census GREEN), SMOKE (1 seed x 10d, 0 engine errors), DET (1 seed x 2 policies x 30d byte-identical; probe DET=1 covers 2 seeds x 60d).

**Guardrails (all binding):** zero src/js changes; zero scripts/policies edits (compose the landed stack); no crashes/softlocks; 0 engine errors on all 16; DET: instrument-on vs instrument-off byte-identical (dayHash trajectories); SMOKE green before sweep. §15 balanced panel: NOT run — pure diagnostic, no lever (same reason as w5census/w5doormeasure).

**Secondary (fidelity check, NOT binding):** eligible-count and stall-class distribution vs w5doormeasure's 16 (8 engaged-but-failed / 7 progressed-but-stalled / 1 never-progressed). Same seeds + same substrate (KILLDISC=1 added) should reproduce within instrument noise; if it diverges, explain, do not re-score the primary.

**Sense-testing:** the census is a numbers instrument; the w5doormeasure arm already sense-tested the door window (7,746 SAY lines, SENSE-OK). No new sense pass.

**No [needs-eyes]:** instrument-only, no player-facing change.

**Convergence state for this axis:** converging (the w5 door remains the binding wall on every substrate measured to date).

## Q1 — what each leg reads, and when it is evaluated (from code reading)

`Game.waveCombatReadiness(w)` (src/js/standing.js:209), waves 4–5 only (waves 1–3 return ready). Demand for wave 5 (`standingCfg().readyDemand[5]`, recalibrated 2026-10-18): armored 4 @ P≥15, armed 6, tricks 3, veterans 2 (killed wave-4+). Fail-closed: any read error → not-ready.

**Evaluation timing:** the gate is a LAZY read of persistent state. The only engine reader is `unlockedWave()` (game.js) via `villageStandingTotal()` → `waveUnlockReady()` — called at spawn/cast/kill (`checkWaveUnlockBeat` on every `recordWaveKill`) / loot-tier moments. The only scheduled consumer is `_standingHoldBeat()` (initial + 7-day reminders naming the short bars). Gear state persists, so there is no race with village activity: `villagerGearUp(vid, acquire=true)` fetches best armor from OWN stash + weapons from own stash → communal armory → whittle at departure (patrols/expeditions, game.js:7390); `villagerGearDay()` (villager-build.js) runs the daily greedy allocation (own stash → gifts → armory, one per villager per day); `villagerGearUp(vid, acquire=false)` re-equips deterministically at fight entry (fieldFights.js:507) and after loot pickup. The gate sees whatever is current whenever it is asked.

**ARMORED leg** — iterates `state.village.roster` (ALL living members — no fighter filter; kids/babies are in the roster but the demands are absolute counts, not proportions, so they only don't-count). Per member: scholar → `this.armorBonus()` (state.scholar.equipped worn slots + `armor.flat` mods); others → `S.equipment.armorOf(vp, itemDefs)` = WORN slots only (`vp.equipped`: pieces additive + coordination +2/slot beyond first, or fullSet). Packs (`vp.items`), own stashes (`person.stashed`), and any communal pile do NOT count — and there IS no communal armor pile: depositable stash sections are weapons/medicine only (storage.js), so armor acquisition is own-stash-only.

**ARMED leg** — same roster loop. Scholar → `equippedWeapon()` not-unarmed, else `carriesWeapon(state.scholar.inventory)` (carried weapons COUNT). Others → `meleeWeaponOf(vp) || rangedWeaponOf(vp)` (equipped slots), else `carriesWeapon(vp.items)` (carried COUNT). The village armory (`stashState().weapons`) is on NO villager — invisible to the leg until a villager borrows via villagerGearUp/villagerGearDay.

**TRICKS leg** — `Object.keys(state.monsterCounters)` filtered by `monsterCounterKnown(mid)` = `state.monsterCounters[mid]===true` AND the monster def carries a `counter` field. The single write choke point is `Game.discoverMonsterCounter(mid, via)` (perform the trick / taught at Haven via 'beasttricks' / observed channels) — it fails closed when the def has no `counter` field. Waves 3–5 are deliberately counter-less (signature mechanics live in the fight engine, unwired to the convention) — so the bar can only ever count wave 1–2 tricks. No known-but-unlogged gap exists in the write path: every discovery channel funnels through the same choke point.

**VETERANS leg** — distinct killer vids in `state.waveKillLog` with `(e.w|0) >= w-1` (wave-4+ for the w5 door). Written by `recordWaveKill` (all kill paths: player TB, villager field fights, pyrrhic kills — same `_attrKills` gate, 1000-entry cap) as `{d, mid, w, by: killerVid||null, via, trick}`. With VETSHAPE unset (this substrate): `isLiving(e.by)` filter — the scholar's CURRENT vid always counts as living ("the scholar is the current adventurer"); a dead villager's vid never counts; a dead SCHOLAR INCARNATION's vid doesn't count either (vid ≠ current villagerId, vp dead). Kills with `by=null` count for nobody. VETSHAPE=1 (Steve's #427, on master, default OFF) would count living-or-dead — this arm computes the shadow and notes its presence; it does NOT change the instrument.

## Q2 — gap analysis: what the village holds vs what the gate counts

1. **Armor in packs / own stashes, not worn → invisible.** `armorOf` reads only `vp.equipped`. A P20 hide armor carried in a pack is 0 toward the leg. There is no communal armor pile by design (weapons/medicine only).
2. **Armory weapon stock → invisible until borrowed.** `stashState().weapons` units sit on no villager. Borrowed via the daily greedy `villagerGearDay` (one per villager per day, biggest-gain-first) or departure `villagerGearUp(acquire=true)`.
3. **Carried weapons → VISIBLE.** The armed leg counts `carriesWeapon(vp.items)` — pack weapons count. (The census records the channel to prove the instrument reads honestly in both directions.)
4. **Counters → no gap.** All discovery channels funnel through `discoverMonsterCounter`; waves 3–5 can't be discovered by design (fail-closed on missing `counter` field).
5. **Dead-killer kills → invisible (VETSHAPE unset).** The w5doormeasure E3 shape: the only wave-4 killer is the scholar, who dies within 30d in 9/10 — the 2-living-veterans bar can never fill. VETSHAPE=1 exists on master (Steve's #427) as the named lever; default OFF.

---

*(results below — filled after the sweep; the pre-registration above is unchanged)*

## Results

Sweep complete 2026-10-20: 16/16 runs complete, 0 engine errors, 0 instrument
errors (SMOKE 1 seed x 10d GREEN before the sweep; DET 4/4 byte-identical
2 seeds x 60d x both policies instrument-on vs off, KILLDISC=1 both arms;
proof scripts/test-readiness-audit-20261020.js 11/11 GREEN incl. RED→GREEN
on fixtures F1–F6 — a gate-parroting instrument fails the mechanism
assertions RED, the real census GREEN).

### PRIMARY: attribution completeness — GO (13/13 eligible, 0 unattributed)

The analyzer FAILS LOUD on any peak>=4/<5 run with zero named mechanism
attributions; the sweep ran clean. Per-run attribution table:
evidence/2026-10-20/readiness-audit-stall-attribution.md (every leg carries
a mechanism string — gate count vs village-held state, window max, and the
named gap).

Eligible-count note: 13, not w5doormeasure's 15. The two missing runs
(leadfeast-s65112, belongfeast-s65112) reached wave-4 in the w5doormeasure
sweep but peaked at 3 and 2 here. Root cause isolated by control experiment
(same stack, same seeds, no KILLDISC, no census): the control reproduces
THIS sweep exactly (leadfeast maxWave=3 peak=0 d143; belongfeast maxWave=2
peak=0 d47) — so the divergence is MASTER MOVEMENT between the 0915Z and
1915Z sweeps (many landings today: sim-vgearbeats, sim-killbeat,
sim-vgearjudge2, sim-scholarcare, loop-B mealbank kill, glutprobe-b,
journey-social r34), NOT KILLDISC and NOT the census instrument. KILLDISC
is exonerated as a trajectory-changer on this substrate. The bar was a
fraction (100%), not a count.

### Wall numbers (standing directive, every run)

- national / table / wins: not instrumented on this arm (the census tracks
  the door, not the win-side stack; w5doormeasure on these seeds: 15/16 / 13/16 / 0/16)
- wave reach: w4 13/16, w5 0/16
- median survival: 151d; max: 182d
- death causes (16 runs): combat 414, villager combat 148, monster 62,
  sickness 20, expedition 25, "a wound that wouldn't close" 11, contest 9,
  starvation 8, experiment 4, others <3
- stall classes: engaged-but-failed 6, progressed-but-stalled 7,
  never-progressed 2, w5 unlocked 0

## Per-leg mechanism notes (what the census found)

**VETERANS — the binding leg (short on 11/13 eligible; the only short leg
on leadfeast-s65116, which filled armor+weapons+tricks and sat 99d at the
door).** Window max: 0/2 or 1/2 — never 2. VETSHAPE=1 shadow
(living-or-dead, Steve's #427 — computed, never enabled): 1 on 5/13 runs,
0 elsewhere. Every wave-4+ kill in the corpus is via=player (the scholar);
ZERO villager wave-4 kills. The dead killers are named with their lag:
Mara Vasquez d73→d96 (+23d), Benoit Lambert d62→d76 (+14d), Aonghus
Masterson d78→d91 (+13d), Erlan Dauletbayev d92→d116 (+24d), Olivia Bennett
d92→d106 (+14d). This is the w5doormeasure E3 shape at mechanism depth:
the only villager who kills wave-4 is the scholar, and the scholar dies
within ~2-3 weeks of the kill — the 2-living-veterans bar can never fill.
Unattributed wave-4+ kills (by=null): 0 everywhere. Crucial nuance:
VETSHAPE=1 alone would NOT open the door on this corpus — shadow maxes at
1 vs demand 2; it needs 2 distinct killers, living or dead.

**ARMOR — short on 10/13; the gap is PRODUCTION, not wearing.** Terminal
gate 0-3/4 @P≥15; window maxes hit 4-6/4 (the village CAN briefly field
it, then the armored die — the mortality-selection the 2026-10-18
recalibration named: 34/47 armored died in the draft they unlocked).
Pack-not-worn is REAL but rare: exactly 1/13 runs
(belongfeast-s65116: scholar P0 worn, P25 wardens_cloak in pack not worn).
Everywhere else the near-miss list is empty and fighters hold NOTHING at
P≥15 worn or held — the village doesn't have 4 fighters' worth of P≥15
armor, not that it forgets to wear it. No communal armor pile exists by
design (depositable stash sections are weapons/medicine only).

**WEAPONS — short on 9/13; the village CAN arm 6+, then the armed die.**
Window maxes 8-11/6 vs terminal 1-4/6. Armory stock: 0 units unborrowed on
ALL 13 runs at terminal — the "armory stock invisible to the armed leg"
mechanism is fixture-proven real, but it did NOT bind in this corpus
(the armory borrows out fully, then the borrowers die). Carried-not-
equipped: 0 everywhere — fighters who hold weapons equip them (autoEquip),
so the carriesWeapon fallback rarely matters.

**TRICKS — never binding.** 3/3 met everywhere (one run 21/3). Waves 3–5
are deliberately counter-less — discoverMonsterCounter fails closed
without a def `counter` field — so the bar counts wave 1–2 tricks only.
No known-but-unlogged gap: every discovery channel funnels through the
same choke point (fixture F4: wave-3 discovery returns false).

**STANDING-SHORT (progressed-but-stalled 7/13):** capped 125-175 < 200,
plenty-capped flag on 6/7 — the bread road stalls at the plenty cap before
any readiness question arises. Their would-bind-next legs are named in the
attribution (armor/veterans everywhere; weapons on 5/7).

**Evaluation-timing answer (Q1):** confirmed lazy/persistent — the daily
census's gate numbers track village state with no phase artifacts; gear
acquired at departure persists into the next unlock check; the weekly hold
beat is the only scheduled consumer.

## Named nexts (mechanism-grounded lever candidates per leg)

1. **Veterans — the movable channel is kill CAPACITY, not counting.**
   VETSHAPE=1 (Steve's #427, on master, default OFF) is necessary but not
   sufficient: shadow maxes at 1 vs demand 2 on this corpus. The proven
   policy-side channel is VGEAR (sim-vgearjudge2 GO: 4/16 armed vs 0/16
   control fill the bar engine-honestly). The game-side remainder is
   wave-4 kill-fight lethality / encounter pressure on recovering killers
   (the sim-scholarcare kill's named next — policy-side self-care closed
   with teeth). A steve-call pairs naturally: is 2-living-veterans the
   right strictness, or is VETSHAPE=1 + demand 2 the intended shape?
2. **Armor — the movable channel is armor PRODUCTION at P≥15, not
   wearing discipline.** The village doesn't hold it; no wearing nudge
   fixes a missing stock. Lever 0 (food economy) lens: hide/bark armor
   yields, crafting throughput, specialist processing. Window maxes show
   the village can briefly field 4 — the bind is HOLDING it through the
   window (mortality-selection again).
3. **Weapons — same mortality shape as armor.** The village arms 6+ then
   the armed die in the window. Movable: window-survival support (the
   sim-windowsurvive finding: raids the #1 window killer, scholars die
   more than villagers, they die rich not starving) — not more arming.
4. **Tricks — no lever.** Not binding; waves 3–5 counter-less by design.
5. **[steve-call] The s65112 divergence** is a same-day master-movement
   artifact, but it flags a standing question: two seeds that reached
   wave-4 at 0915Z peak at 3/2 at 1915Z. Today's landings moved the wall
   materially. Worth a line in the convergence review, not a lever.

## Metric review (§14 — binding, never re-scored)

- PRIMARY attribution completeness: GO — 13/13 eligible runs attributed
  with mechanism strings, 0 unattributed, analyzer exit 0. The bar was a
  fraction (100%), not a count; the eligible count (13) is what the
  corpus produced on current master.
- Secondary fidelity check (NOT binding): eligible 13 vs w5doormeasure's
  15; stall classes 6/7/2 vs 8/7/1. Explained, not re-scored: the control
  experiment (same stack/seeds, no KILLDISC, no census) reproduces this
  sweep exactly — the delta is master movement between the 0915Z and
  1915Z sweeps, and KILLDISC is exonerated as a trajectory-changer.
- Anti-drift: no metric was re-scored mid-run. The would-bind-next
  attributions on progressed-but-stalled runs and the E1–E5-style
  mechanism fields were all in the pre-registration's instrument design.
- One instrument note: the sweep's first launch died after 15/16 (session
  drop, no error) — the missing belongfeast/s65118 was re-run solo with
  SEEDS+ONLY filters and landed clean; its numbers are in the corpus.

## Convergence note

scale-onramp stays **converging**: the wave-5 door remains the binding
wall on every substrate (0/16 wave-5 here, 0/16 on every 2026-10-20
corpus). This arm closes the readiness-gate audit loop — the gate's four
legs are now mechanism-named (veterans: scholar-killer mortality, 13-24d
lags; armor: production gap at P≥15, not wearing; weapons: window
mortality of the armed; tricks: non-binding by design) — and the
VETSHAPE=1 shadow is quantified (max 1 vs demand 2: necessary, not
sufficient). The named nexts above are the lever candidates; the veteran
channel's policy side is proven (VGEAR) and its game side is named
(kill-fight lethality); armor/weapons point at window survival, not gear
discipline. Directive lift remains a Steve call.
