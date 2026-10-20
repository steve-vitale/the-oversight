# sim-w5door-measure — wave-5 unlock-PATH end-to-end diagnostic (flesh-out loop, 2026-10-20)

Run: fleshout-20261020T0415Z, arm sim-w5door-measure. Axis: scale-onramp (the blocking axis).
INSTRUMENT-ONLY DIAGNOSTIC — zero src/js changes, zero scripts/policies changes (substrate
layers are the landed w5path/w5census stack, composed upon, never edited).
Worktree: ~/workspace/worktrees/sim-w5door-measure. Commit: instruments + evidence only.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, deed bars, readiness design call #4),
hidden_files/wave4-standing-spec.md. The wave-5 door is: wave-3 rung (day 25+ AND 4 wave-2
ledger points) AND gated standing >= t5=200 (plenty capped at 100 toward t5; readiness
deferral holds at t5-1 while any combat-readiness bar is short; monotonic peak ratchet)
AND wave-4 faced (deed feed wavesFaced). Waves 2-3: day floors 8/25 + ledger bars 5/4
(kills only; counter-kill = 2, per-type cap 2; villager kills score like player's).

## Where this sits (priors read before designing)

- sim-helpcall2 (2026-10-17) metric review 4 + backlog #469 [open]: maxWaveUnlocked stalls
  <=3 on 30/32 runs while wave-5 monsters RAID (15 aid calls on wave-5 crises) — unlocks and
  raid-driven exposure are decoupled. This arm's decoupling check may claim #469.
- sim-unlockdrift (2026-10-18) + backlog #522: the 180-commit window 00a004cb..master is
  EXONERATED for the unlock collapse; prime suspect: the 2026-10-16 23:25 history rebuild
  (6f134de2). Named nexts this arm answers: (1) audit rebuilt game code vs round-1
  per-seed JSONs (evidence/2026-10-16/perseed-fightopen/ = the spec); (2) hunt a surviving
  pre-rebuild artifact for a lower-bound anchor.
- sim-indispensable-road (2026-10-20, DIAG-GO/accept-as-gated): full seat 0/16 on
  SEATDRIVE=1; w4/w5 deed bars the binding blocker; wave-5 never unlocked in the world.
- sim-w5census (2026-10-19): 32 runs, pre-seat+windefer — 21/32 engage the w5 door
  (deferral(5) >=1d), 18/21 die in the window (median 40d hold), wave-4 kills 13/13
  via=player, veterans short 32/32 terminally. This arm REPRODUCES that decomposition on
  the identical substrate with fresh seeds before extending.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any sims)

**Question:** on the identical substrate as sim-w5census, what is the wave-5 UNLOCK PATH
(end-to-end: wave-1→2→3→4→5 gates) doing per-day, and for every run that unlocks wave 4
but never unlocks wave 5, what is the ATTRIBUTED blocker?

**PRIMARY (diagnostic GO): attribution completeness.** Every run with peak >= 4 and
peak < 5 (wave-4 unlocked, wave-5 never unlocked) carries >= 1 named blocker from the
checklist below, and the analyzer FAILS LOUD (exit != 0) on any run with 0 named
blockers. GO = 100% of such runs attributed; MISS = any unattributed run (never
re-scored, §14). Expected count of such runs: unknown (w5census measured 26/32 wave-4
on 16 different seeds; the bar is a fraction, not a count).

**Blocker classes (mutually exclusive checklist, evaluated terminally + across
deferral(5) windows; multiple may hold):**
- B0 (informational, not a blocker): won-before-door — the run ended in a win with
  peak<5 (no blocker; attributed, not stuck).
- B1 standing-short: capped standing < 200 at terminal, deferral(5) never true.
  Sub-record: war/dip/plenty at terminal, plenty-capped flag, raw vs capped.
- B2 readiness-veterans: deferral(5) true >= 1d, veterans < 2 at terminal (and
  max over the window).
- B3 readiness-armor: deferral(5) true >= 1d, armored < 4 at terminal.
- B4 readiness-weapons: deferral(5) true >= 1d, armed < 6 at terminal.
- B5 readiness-tricks: deferral(5) true >= 1d, tricks < 3 at terminal.
- B6 w4-never-faced: peak >= 4, waveEngaged(4) == 0 at terminal (the w5 gate's
  w4-faced leg never met even though the wave unlocked).
- B7 died-in-window: a deferral(5) window ended with the village lost (endReason)
  or scholar dead inside the window.
- B8 regressed: a deferral(5) window ended alive with capped standing < 200.
- B9 horizon: deferral(5) true at run end (village alive, unwon).

**Extension over sim-w5census (what this arm adds, pre-registered):**
- E1 full-path per-day vectors: wave-1/2 ledger fill vs bars (5/4), days to fill,
  day floors 8/25 — the w2/w3 leg pacing of the path.
- E2 villager-experience counting lines: per-day ledger points and kills by killer
  class (player/scholar vs villager vs companion) per wave, from waveKillLog — who
  scores the bars.
- E3 window-mortality attribution of deed earners: for each wave-4+ kill, killer
  class and whether the killer died within 30d of the kill (samples.deaths) —
  the veteran-channel death shape, per-killer.
- E4 raid-exposure vs unlock-decoupling check (#469): per-day records of kills and
  faced-types with wave > unlockedWave() that day (exposure beyond progression).
  Corroborates or refutes #469 on this substrate; a clean decision claims it.

**Corpus:** 8 FRESH seeds (65111–65118 — verified zero filename/content hits in
evidence/ and scripts/) x {leadfeast, belongfeast} = 16 runs. "Control" = the
baseline competent substrate (no treatment anywhere; the instrument is the only
addition, DET-pinned inert).

**Substrate (EXACT sim-w5census stack — honest same-substrate comparison):**
policy withSeatDrive(withWinDefer(withVetrel(withReposition(TF base)))) on
{leadfeast, belongfeast} tribfloor bases. Env: FEASTSCALE_R13=1 TRIBFLOOR=1
SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1
(VETREL/REPOSITION unset -> inert; SEATDRIVE=0 -> seatdrive pure delegation).
The sweep FAILS LOUD unless the env matches exactly.

**Horizon:** 180d death-aware (dead villages stop simulating). Set from the
baseline survival distribution (w5census on this substrate: median 137d) — 180d
covers the upper tail while the death-aware rule keeps dead-village burn at zero.
Never a fixed 200d.

**Policies:** competent-policy tribfloor leadfeast/belongfeast (the loop's competent
policy standard).

**Instrument:** scripts/probe-w5doormeasure-20261020.js (daily pure-engine reads;
wraps base.daily AFTER the base runs — the path reflects post-daily state,
deterministic per seed), scripts/analyze-w5doormeasure-20261020.js (stall
classification + blocker attribution + E1–E4 + wall numbers),
scripts/w5doormeasure-transcripts-20261020.js (sense-testing),
scripts/test-w5doormeasure-20261020.js (proof: bar-shape fixtures + classification
fixtures F1–F9 + SMOKE + DET + attribution-completeness fixtures).

**Guardrails (all binding):** zero src/js changes; zero scripts/policies edits
(compose the landed stack); no crashes/softlocks; 0 engine errors on all 16;
DET: instrument-on vs instrument-off byte-identical (2 seeds x 60d) — the
recorder draws no RNG and writes no game state; SMOKE green before sweep.
§15 balanced panel: NOT run — pure diagnostic, no lever (same reason as w5census).

**Secondary (fidelity check, NOT binding):** stall-class distribution vs w5census's
32 (21 engaged-but-failed / 9 progressed-but-stalled / 2 never-progressed / 0
unlocked). If it diverges materially, explain (seed-set/substrate property), do
not re-score the primary.

**Wall numbers (standing directive — reported every run):** national / table / wins,
wave reach 1–5, median/max survival, death-cause shares.

**Sense-testing (SENSE-TESTING LAW):** one door-engaged run, Game.say + Game.sysSay
restored (the w5census probe-artifact lesson), capture the deferral(5) window's SAY
lines, read whole, judge: do villagers act like people facing the endgame?

**No [needs-eyes]:** instrument-only, no player-facing change.

**Convergence state for this axis:** converging (the w5 door remains the binding
wall on every substrate measured to date).

## PRE-REGISTRATION ADDENDUM — the old-history anchor (written BEFORE any old-code runs)

Named nexts from sim-unlockdrift: (1) audit rebuilt game code vs the round-1
per-seed JSONs; (2) find a pre-rebuild artifact for a lower-bound anchor.

**Artifact found (this arm, code archaeology):** branch `sim-raidshield-base` is a
surviving OLD-HISTORY line — its parent `0152a2ce` (2026-10-16 07:46 CDT, "Close
pantry granularity leak") is pre-rebuild game code with the FACED-EXPERIENCE
readiness bar (`waveUnlockReady(4)` = waveEngaged(3) >= 3, fleeing counts) and
NO `waveCombatReadiness`. A dedicated worktree
(~/workspace/worktrees/sim-w5door-oldanchor, detached at 0152a2ce, registered)
runs the anchor.

**What the archaeology already shows (no sims needed):**
- Old `unlockedWave()` is identical to current (standing rungs on top of the
  wave-3 rung). The behavioral delta is entirely in `waveUnlockReady()`.
- In the rebuilt history, `waveCombatReadiness` first appears in the rebuild
  root 6f134de2 (a squash — the original design-call-#4 commit is undated
  inside it). So design call #4 landed in OLD history between 07:46 and
  18:25 CDT on 2026-10-16.
- The 2026-10-18 recalibration commit message: "13/16 wave-4 on named seeds
  (was 0/16)" after loosening {4@P15,5,3,2}→{3@P10,5,3,1} — i.e. the gate
  strictness was the whole story.

**ANCHOR PRIMARY (binding):** run the round-1 substrate on the old code —
seeds 975–982 × {leadfeast, belongfeast} tribfloor (the round-1 named set),
180d death-aware, env FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 (FIGHTOPEN unset — it does
not exist in old code; the unlockdrift arm established wave-4 reach is
FIGHTOPEN-independent). Metric: wave-4 reach count. GO bar: ≥12/16
(round-1 measured 14/16; the bar allows seed noise).
- GO (≥12/16): the faced-experience bar reproduces round-1 → design call #4
  is the unlock-collapse cause; the history rebuild is EXONERATED as a
  behavior-changer (it faithfully carried the new gate; the collapse was
  already in old master's tip).
- MISS (<12/16): the old code also fails → the collapse predates 07:46 CDT
  or the anchor substrate is wrong → report honestly, do not re-score.

**Instrument:** scripts/sweep-oldanchor-20261020.js (requires the old tree's
own sim-harness + tribfloor — self-consistent old code; writes
evidence/2026-10-20/perseed-w5door-oldanchor/). SMOKE before the sweep.
Zero changes to either tree's game code.

---

*(results below — filled after the sweep; the pre-registration above is unchanged)*

## Results

Sweep complete 2026-10-20: 16/16 runs complete, 0 engine errors, 0 instrument
errors (SMOKE 16/16 GREEN before the sweep; DET 2 seeds x 60d x both policies
byte-identical instrument-on vs off; see test report in
scripts/test-w5doormeasure-20261020.js — 50/50 GREEN).

### Wall numbers (standing directive, every run)

- national / table / wins: 15/16 / 13/16 / 0/16
- wave reach: w1 16, w2 15→16 (one run unlocked w2 after its w3; all 16 hit w2),
  w3 15, w4 15, w5 0
- median survival: 181.5d; max: 182d (horizon)
- death causes (16 runs): combat 444, villager combat 121, starvation 5,
  monster 2, disease 2, drowning 2, other 1
- stall classes: engaged-but-failed 8, progressed-but-stalled 7,
  never-progressed 1, w5 unlocked 0

### PRIMARY: attribution completeness — GO (15/15 eligible, 0 unattributed)

The analyzer FAILS LOUD on any peak>=4/<5 run with zero named blockers; the
sweep ran clean. Per-run attribution table:
evidence/2026-10-20/w5doormeasure-stall-attribution.md.

Blocker tallies (eligible = 15 runs, peak>=4 peak<5):
- B2 readiness-veterans: 8/8 engaged-but-failed (0/8 ever held 2 living
  veterans in the window; B5 tricks: 0/8 — tricks bar {3} met everywhere)
- B3 readiness-armor: 8/8 engaged (armored <4 at window end)
- B4 readiness-weapons: 6/8 engaged
- B7 died-in-window: 4 engaged (2 more died post-window: B8 regressed x1,
  B9 horizon x3)
- B1 standing-short: 7/7 progressed-but-stalled (capped never reached 200;
  plenty-capped flag true — the plenty engine is the bind on belongfeast)
- B6 w4-never-faced: 0 (facing is reliable; killing is the bind)
- B0 won-before-door: 0

### E1 — full-path leg pacing (w2/w3)

- w2 unlock day: median 34 (range 22–67); w3 unlock: median 76; w4 unlock:
  median 100. First deferral(5): median 72 — EARLIER than w4 unlock on
  5/8 engaged runs (gaps 5–48d: the village stood at the w5 STANDING bar
  before the w4 door opened; the w4 readiness gate is the binding
  constraint even for reaching the w5 queue).
- Bars: w2 ledger fill median ~12d of the day-8 floor; w3 fill median ~10d
  of day 25. The legs are pacing, not walls.

### E2 — who scores the bars (villager-experience counting lines)

- wave-4 kills: 10 total, ALL via=player (scholar); 0 villager, 0 companion.
- wave-3: 30 player / 2 villager / 2 companion. wave-2: 62/21/7.
- Villager kills score the ledger (VILLAGER XP LAW) but the village almost
  never lands the killing blow on wave-3+ — the counting line is honest,
  the capacity isn't.

### E3 — veteran-channel mortality

- 10 wave-4+ kills by the scholar; the killer incarnation DIED WITHIN 30d
  in 9/10. The veteran channel (2 LIVING wave-4+ killers) can never fill:
  the only villager who kills wave-4 is the scholar, and the scholar
  almost always dies within a month of the kill.

### E4 — decoupling (#469): CONFIRMED on this substrate

- 3 runs faced `nielsen` (wave-5) on days 127/165/170 while unlockedWave()=4
  and peak=4 — real raid-exposure/progression decoupling. No decoupled
  kills (the villages never killed it; facing != unlock since 2026-10-10,
  so the gate itself held).
- MECHANISM (caught via spawn-hook + deed-hook on byte-identical replays):
  `overtimeThirdTitan()` (overtime.js) returns the un-cast apocalypse
  (nielsen) at overtimeTier>=2, and `titanDawnTick` (titans.js) omens it at
  0.25/day with NO wave/rank gate (unlike herald: wave>=4 + regional+,
  apocalypse: wave>=5 + national+). The omen advances stage 0→1→2 over
  ~13+ days, `titanPlace` spawns the Nielsen as a world monster while uw=4,
  and the village faces it via `havenRaidTick` (raid using existing world
  monsters) or `checkEncounter` (villagerMonsterTick). Full stack captured
  in evidence (see analysis below).
- This is a SECOND, distinct mechanism from the helpcall2 #469 substrate
  (aid-crisis wave-5 casts under NODEWITNESS unset) — the decoupled shape
  is real and multi-mechanism. Impact on the unlock path: none on the gate
  itself, but Producer-tier teeth arrive in worlds the progression tracker
  says aren't ready. Filed as a steve-call below (the 2026-10-14 overtime
  design is deliberate; changing its gating touches feel).

### Old-history anchor (unlockdrift named nexts #1/#2) — GO

Anchor sweep on `0152a2ce` (old-history, faced-experience readiness bar),
round-1 named set seeds 975–982 × {leadfeast, belongfeast}, round-1 env,
180d death-aware: **wave-4 15/16, wave-5 7/16** — reproduces round-1
(14/16 wave-4, 8/16 wave-5) within seed noise. PRIMARY GO (>=12/16).

Attribution chain (no sims needed for the code half):
- Old `unlockedWave()` is behavior-identical to current; the entire delta
  is in `waveUnlockReady()` (faced-experience: waveEngaged(3)>=3, fleeing
  counts) vs `waveCombatReadiness()` (3@P10, 5 armed, 3 tricks, 1 veteran).
- Design call #4 landed in OLD history between 2026-10-16 07:46 and
  18:25 CDT (first appears in the rebuild root squash 6f134de2).
- The 2026-10-18 recalibration ({4@P15,5,3,2}→{3@P10,5,3,1}, "13/16 wave-4
  on named seeds, was 0/16") is the same story: gate strictness.

CONCLUSION: the unlock collapse is design call #4 working as designed,
not a rebuild artifact — the history rebuild is EXONERATED as a
behavior-changer (it faithfully carried the new gate; the collapse was
already in old master's tip). The w5census/w5door-measure finding
"veterans short everywhere" is the gate doing its job.

## Metric review (§14 — binding, never re-scored)

- PRIMARY attribution completeness: GO — 15/15 eligible runs attributed,
  0 unattributed, analyzer exit 0. The bar was a fraction (100%), not a
  count; the eligible count (15) is what the corpus produced.
- Anchor PRIMARY: GO — 15/16 >= 12/16 bar.
- Secondary fidelity check (NOT binding): stall-class distribution vs
  w5census (21/32 engaged-but-failed = 66%; here 8/16 = 50%) — same shape
  within seed noise (n=16 vs n=32); no divergence requiring explanation.
- Anti-drift: no metric was re-scored mid-run. The B0 informational class
  and the E1–E4 extensions were all in the pre-registration.
- One instrument note: the day-stamped `recordDeedFight` hook's logs were
  initially swallowed by the harness `quietLog` (the w5census probe-artifact
  lesson, second instance) — collected into an array and printed after;
  mechanism finding unaffected.

## Named nexts

1. [steve-call] Should the overtime third titan (nielsen/finale) respect
   the wave gate (wave>=5 + rank) before its omen can start? The 2026-10-14
   design ("a run that keeps the Table waiting gets the OTHER climax too")
   is deliberate pressure, but on runs where wave 5 never unlocked it
   places Producer-tier teeth in an unready world — the #469 decoupling
   mechanism confirmed this arm. [needs-eyes] if touched (feel/combat).
2. [backlog → claim] #469 may now be marked CONFIRMED (two mechanisms:
   aid-crisis wave-5 casts on the helpcall2 substrate; overtime third-titan
   placement on this substrate). Not "fixed" — the gating question is #1.
3. [backlog → resolve] #522 resolved by the anchor: design call #4 is the
   unlock-collapse cause; the rebuild is exonerated. The remaining question
   (whether the current readiness bars are the RIGHT strictness) is a live
   design conversation, not a regression hunt.
4. [blank] Villager ambient chatter repeats verbatim across days in the
   window ("Found a parcel by the hollow…", "Dreamed again…") — the
   journey-social "no verbatim repeats" class, observed in the door window
   but not caused by it. Not this arm's axis.
5. [blank] No villager reaction lines to the weekly readiness hold beats —
   the System names the short bars, the village never comments. Fiction gap
   noted in the village assessment; a reactions pass is a future arm.
6. The 5/8 "w5 standing bar before w4 opens" shape (def5 median 72 < w4
   median 100) suggests the w5 door's STANDING leg is easier than the w4
   door's readiness leg on competent substrates — relevant to any future
   gate-retuning conversation.

## Village assessment

Sense-testing: leadfeast-s65112 (engaged-but-failed, d83–163 window, died),
7,746 SAY lines d80–166 read whole.
evidence/2026-10-20/w5doormeasure-transcripts/leadfeast-s65112.txt.

- The window READS as the endgame: lingering monsters gorging at the
  treeline, villagers mauled (Ashanti at 28 HP, patched up, sent out again),
  raids carrying off pantry stores, the System naming the short bars
  weekly ("blood your fighters (0 of 2 veterans)" → armor 1/4, weapons 2/6
  as fighters die), a contest (The Guest) won on camera mid-window, the
  Herald arriving as the village falls. The fiction holds together.
- Villagers forage, fish, get mauled, get patched, die — they act like
  people in a siege, not people strategizing about the fifth draft. The
  System's hold beats are the village's only awareness channel; no
  villager ever comments on the bars or the dying. SENSE-OK with that one
  noted gap (named next #5).
- The final day (d163) is still fully storied — a beggar at the fire, a
  played-and-survived Witness contest, the Nielsen feeding in the night.
  The village fell mechanically (window attrition), not fictionally; the
  story did not run out. That is the design working.
