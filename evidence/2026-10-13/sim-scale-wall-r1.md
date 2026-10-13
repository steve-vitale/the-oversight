# longsim scale-wall run — 2026-10-13 (flesh-out)

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12)
- **Axis:** scale-onramp (blocking; standing directive overrides rotation; `longsims-rotation.txt` stays 3)
- **Question:** does better fight selection (DPS-race assessment) lift survival-to-90 and unlock national reach, or is the wall in wave-1/2 damage numbers?
- **Primary metric:** national reach per seed (0/1), secondary: median survival days
- **GO threshold:** after-side national ≥ 1/4 in pilot AND median survival ≥ 1.2× baseline — else kill at pilot
- **Horizon:** 150d death-aware (baseline: median 51.5d, 0/8 national; +10d tail after death)
- **Seeds:** 4 pilot seeds before/after on identical seeds; confirm 12 only on GO
- **Policies:** competent + variants per sweeps (competent.js now arms stone_knife via armUp — retired bare-hands baseline)
- **Baseline (2026-10-13, af173f1a):** 8 runs (seeds 11/22/33/44 × competent/winseek): national 0/8, table 0/8, median 51.5d; player deaths 83% combat (20 wave-1 wild ambushes); villager deaths 60% monster (26 wave-1 field)
- **Blanks from last run:** DPS-race fight assessment; wave-1/2 damage numbers vs "slow and risky" intent; villager field survivability

## Canon check
READ docs/CANON.md FIRST, then MONSTER-WAVES.md + docs/BEAR.md + docs/DESIGN.md combat intent ("slow and risky to start"). The Highbeam Deer (160 HP) is the benchmark — never question its stats. Fights are REAL fights, never RNG outcome tables.

## Levers in scope (lenses on the wall — one at a time)
1. Policy-side: DPS-race fight assessment in the sim policy — flee/disengage BEFORE an unwinnable fight starts (raccoon replay: 11 unwinnable rounds at ~1 dmg/round dealt vs 13–16 taken, flee fired at <30% HP = death mid-retreat). Measures the competent-play ceiling without changing the game.
2. Game-side (ONLY if pilot of (1) fails GO, or as its own pilot): wave-1/2 monster damage numbers toward "slow and risky" intent. Small, documented, canon-faithful.

## Results

### Baseline re-run on current master tip (bc1980f6) — holds
Gate off (= legacy, pure). 8 runs, seeds 11/22/33/44 × competent/winseek, 150d
death-aware horizon: **national 0/8, table 0/8, won 0/8, median survival 69d**
(baseline on af173f1a was 51.5d — the tip moved favorably on survival, but the
wall is unchanged: still zero national, zero table, zero wave-4/5 unlocks).
Player combat deaths still dominate (competent 24, winseek 10); villager combat
deaths 18/13. Winseek reaches regional on 3/4 seeds, never national.

### Lever played: DPS-RACE FIGHT ASSESSMENT + BARRIER-PUSH FLEE (policy-side)
One functional lever under one gate (`COMPETENT_DPS_RACE=1`, default OFF after
this run's kill): (1) `dpsRaceAssess` in scripts/policies/competent.js —
measured damage-race assessment over 2-turn windows (turns 3/5/7/9),
strike-normalized dealt/strike vs taken/turn, projecting rounds-to-kill vs
rounds-to-die; two consecutive lost-race windows = conviction = disengage while
HP is high. (2) The disengage half: `flee()` now pushes THROUGH the grid edge
via the engine-honest `Game.tbBarrierExit(dx,dy)` instead of walking to the
edge and stopping. Wired into competent.fight and winseek's winseekFight
(feasted-deed respected in winseek).

**Mechanism proof: scripts/test-dps-race-r1.js — 11/11 PASS.** Lost race
(bare-handed vs 200-HP hushwolf): dpsFled fires, first flee at 76 HP (well
above the legacy 35% threshold), sane projection (rtk 15.1 vs rtd 10.9),
scholar survives. Won race (20-HP hushwolf): no flee, monster dies, scholar
lives. Gate off: fully inert (0 windows). Barrier push (belltoad, scholar
starting ON the edge): pushes through, fight ends, scholar lives.

### Pilot verdict: KILLED AT PILOT — the lever inverted the metric
Identical 8 seeds, after-side: **national 0/8, table 0/8, won 0/8, median
survival 28d** (GO required national ≥ 2/8 AND median ≥ 82.8d = 1.2× 69d).
The lever did not merely fail — median survival collapsed 69→28d.

**Why (honest diagnosis, transcript-verified):**
1. **The DPS assessment is inert: 0 fires in 50 assessment windows.**
   Fights are short (median 3–4 player turns); the 2-window conviction needs
   5+ turns to build; the fight-start HP-pool assessment already skims the
   worst mismatches. The raccoon-type 11-round grind that motivated the lever
   is rare in practice — most lost races are over (one way or the other)
   before conviction builds.
2. **The real find: the policy's flee() NEVER worked for chasers — and fixing
   it made things worse.** Walking to/along the grid edge does NOT exit a
   fight (canon, game.js: "only a deliberate exit attempt" via tbBarrierExit).
   Evidence: a 21,000-turn belltoad fight (seed 22, legacy) where the scholar
   fled at turn 6 and stood at the edge pressing "flee" as a no-op 20,995
   times; a seed-44 belltoad where dpsFled fired at turn 7 and the scholar
   STILL died at turn 20, ten no-op flees from the same edge tile.
3. **The barrier push is the honest exit, but fleeing is not free.**
   Player tb-combat deaths halved (34→14 across policies) — the push DOES
   extract scholars — but monster deaths rose 16→25 and starvation 9→13, net
   far worse. Traced mechanism (competent seed 44): day-25 scholar at 43 HP
   fights 4 hummice at node (4,4), pushes (4,4)→(3,4)→(2,4) AWAY from haven,
   starves to death the same day at (2,4); the successor pushes (3,6)→(2,6)
   at 52 HP and dies in combat there 3 days later. **Each push is a node
   transition into the unknown; chain-pushing strands hurt, hungry scholars
   in the wilderness.** Standing ground near haven and the pantry beats
   pushing outward. The blank is now precise: fleeing must be DIRECTIONAL
   (toward haven/safety, judging the destination), not "nearest edge" —
   a new lever, not this one.

### Convergence state: killed-at-pilot
Scale-onramp stays the blocking axis; wall numbers unchanged (0 national).
`longsims-rotation.txt` stays 3 (standing directive overrides rotation).

### Village assessment (before-side, gate off — the honest baseline)
- **Seed 22 (competent)** thrived: survived the full 150d, wave 3, arc 3 —
  the only seed to see the horizon. **Seed 33** died day 14 (thirst +
  starvation + villager combat — an early collapse). **Seed 11** died day 69,
  **seed 44** day 90 (both village-lost, combat-led).
- **Who died and why:** scholars die in tb fights they were WINNING —
  telemetry shows a day-55 scholar killing three belltoads (hp 69→39) then
  dying at 0 HP to the fourth; a day-64 scholar killing two belltoads then
  dying. These are exactly the DPS-race deaths the lever targeted — but the
  fights are 4–6 turns, too short for the assessment's conviction to build.
  Villagers die in field fights (60% monster per the af173f1a baseline).
- **Missing capabilities:** no policy judges WHERE a flee leads (the
  directional-fleeing blank); scholars pushed onto new nodes have no
  recover-and-return behavior (the day-25 starvation); the 35%-HP legacy
  flee still fires into the same outward-push trap when the gate is on.
- **Blanks filled:** (1) DPS-race assessment instrument — built, proven
  11/11, kept behind the opt-in gate for future directional-flee work.
  (2) The flee mechanic — diagnosed (walk-to-edge never exited vs chasers),
  fixed behind the same gate, proven to exit.
- **Blanks documented (open, not this run's scope):** directional fleeing
  (toward haven — the follow-up lever); a 105-turn fight with ZERO monsters
  that never ends (engine pathology, pre-existing); `James: "undefined"` —
  a villager dialogue line rendering the literal string "undefined"
  (dialogue bug, pre-existing); the 21,000-turn stuck fight (policy flee
  pathology, fixed only when the gate is on).

### Sense-testing (transcripts read)
- **Villagers act like people.** 40-day sample (seed 22): 7 villagers, 7
  distinct goals (escape / prove / protect / survive / alone / understand /
  record); trust differentiated (0–88, not uniform); gossip spreads
  person-to-person with distortion (0–4) and growing heard-lists; villagers
  react to events in-character (David mutters "Should've smoked that" when
  spoiled stores are thrown out); a night raid has social consequences
  ("Trust -"); villagers earn System abilities for real work (David offered
  Game Sense after 3 days on the land — the "level alongside the player"
  design working).
- **Conversation is coherent:** Wolfgang McDonald (journalist): "You look
  handy. What did you do with your hands, before? No time to waste." —
  purposeful, in-voice. (The sim policy talkTo→endConvo's immediately, so
  sims never hold real conversations — a policy-fidelity note, not a game
  bug.)
- **Flagged:** `James: "undefined"` (above) — robotic, filed as a blank.

### What I changed (files)
- scripts/policies/competent.js — dpsRaceAssess/dpsRaceInit/dpsRaceOn +
  barrier-push flee() (gate COMPETENT_DPS_RACE=1, default OFF)
- scripts/policies/winseek.js — same lever wired into winseekFight
  (feasted-deed respected)
- scripts/test-dps-race-r1.js — 11/11 mechanism proof (NEW)
- scripts/sweep-dps-race-r1.js — before/after sweep driver, identical seeds
  (NEW)
- scripts/diag-dps-fights-r1.js, scripts/diag-dps-fights-r2.js — fight
  diagnostics: turn distributions, stuck-fight detection, scholar-death
  attribution via mantle-passing (NEW)
- evidence/2026-10-13/sim-scale-wall-r1.md — this file

### Numbers table (before → after, identical seeds 11/22/33/44)
| | national | table | won | median days | player combat deaths |
|---|---|---|---|---|---|
| before (gate off) | 0/8 | 0/8 | 0/8 | 69 | 34 |
| after (gate on) | 0/8 | 0/8 | 0/8 | 28 | 14 |
| GO threshold | ≥2/8 | — | — | ≥82.8 | — |

Per-run days before: 69/150/14/90 (competent), 32/124/15/34 (winseek).
Per-run days after: 69/134/22/33 (competent), 28/23/17/19 (winseek).
Barrier pushes after: 15 (competent), 35 (winseek) — winseek's flee-eager
strategy node-hops constantly once the exit works (16 pushes in 19 days on
seed 44), which is why it collapsed hardest (34→23d).

### For the next run
The wall is still fight selection + monster math, but this pilot sharpened
it: the binding question is no longer "can the policy assess the race"
(it can, 11/11) but "where does the scholar GO when the race is lost."
Next lever candidate: directional fleeing — push toward haven (or the
safest known adjacent node), and only when the destination beats the fight.
The DPS assessment instrument is ready behind its gate for that work.
