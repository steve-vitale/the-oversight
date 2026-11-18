# Journey landing r145 — 2026-11-18 (Lane A, leg 0)

- **Leg:** landing (days 1–14, horizon d28). **Run:** r145, Lane A.
- **Question (Q1):** regression watch on post-r144 master — does the landing
  still hold (all alive d28, System contact by d9, no pockets, no silent
  turns, no dry lines) after the r144 pocket repair, the r240 homeward-refusal
  fix, FLEEREPAIR3, the repay-want/broken-favor fix, TRAILTALK no-repeat, the
  mime/Wren pools, triodrought companion-carry restore, the partytrios
  brain-mirror bump, and aidleave DIAG-GO?
- **Seeds:** 1232–1241 (fresh band — verified: no prior landing corpus uses
  it; landing bands through r144 end at 1222–1231). **Policy:** competent
  player, as a real player trying to survive and thrive.
- **Base:** master `a48b2405c` (journey-scale r242 closeout).
- **Interesting if:** M1 drops below 10/10; pocketFights > 0; HEED-V > 0;
  M-PR1 revised > 15%; scholar deaths > 2; hungry-at-horizon moves;
  zero-DMG fights appear with a new shape.
- **Driver:** `scripts/journey-landing-r145-20261118.js` (r144 driver verbatim
  except header + seeds). **Corpus:**
  `hidden_files/evidence/2026-11-18/landing-r145-after` (113 transcripts,
  10 census JSONs). **Analyzers:** 15 sections, same order/invocation as r144
  (`journey-landing-r145-analyzers.log`).

## Q1 — panel verdict: GO (all binding bars pass)

| Bar | r144 AFTER | r145 | Pass? |
|---|---|---|---|
| M1 alive d28 | 10/10 | **10/10** (popEnd 8–12) | ✓ |
| M2 System contact by d9 | 10/10 | **10/10** (8× d8, 2× d9) | ✓ |
| Practice movedCells d1→d28 (≥50) | — | **90**, seedsWithMove 10/10, skill0→pos 63 | ✓ |
| pocketFights (binds 0) | 0 | **0** | ✓ |
| stuckTurns total | — | **1** (watch — the 1234 d9 fight, see below) | — |
| HEED-V (binds 0) | 0 | **0** (D2 0, D3 0, HEED 0) | ✓ |
| M-PR1 revised (≤15%) | 1/18 | **2/26 = 7.7%** | ✓ |
| Scholar deaths (≤2) | — | **2** (at bar) | ✓ |
| silentTurns (binds 0) | 0 | **0** (counter never fired) | ✓ |
| verbatimRepeats / exempted | — | **0 / 2** (both resume-take re-poses) | ✓ |
| dry lines | 0 | **0** | ✓ |
| R66 starvation deaths | 0 | **0** | ✓ |
| Grief griefMiss | 0 | **0/12** | ✓ |
| M3 fight-log unknown/mixed trigger | 0 | **0** (byTrigger: pending-face ×2 only) | ✓ |
| R68 PARTY offered/picks/spoken/dry/accepted | 11/… | **4/4/4/0/1** → PARTY-GO (fewer offers — watch) | ✓ |
| R67 CASE MATCH sittings | — | **8** (LABELING-GO shape) | ✓ |
| R69 ARMOR / R70 OUTING / R71 COMPLETION | GO/GO/GO | **GO / GO / GO** (R70 opps 484, attempts 110; R71 togetherOk 34) | ✓ |
| R73 NARROW keptInsideNarrow | 11/5 | **8/12** (NARROW-PATTERN) | ✓ |
| R84 kcal arrivals / R85 kcal rescue | 4/4 / 4/4 | **0/0 — no kcal arrivals on this panel** | — |
| R94 DAWN-DOOR opps / waitDiagMissing | 534 / 0 | **484 / 0** (sidestep 6/8) | ✓ |
| R88 EAT-ON-ARRIVAL | 4/4 GO | **4/4 GO** (doorFromOutside 4, doorRefused 0) | ✓ |
| R86 water | UNTESTED | **UNTESTED** (hyd never under 25; min 72) | — |
| Contests fired / ended / open / orphan | — | **17 / 17 / 0 / 0** | ✓ |
| Fights total / zero-DMG / B-shape | 21 / 0 / 0 | **21 / 2 / 0** | ✓ |
| Hungry-at-horizon | 5/10 | **1/10** (only 1241, finalPerPerson 1596) | watch |
| Monster kills | 217/213 | **243** | — |

**Deaths (12 villagers):** wild 1, sickness 3, wound 2, monster 3, ambush 3.
Per seed: 1232: 0, 1233: 0, 1234: 4, 1235: 2, 1236: 1, 1237: 2, 1238: 2,
1239: 0, 1240: 1, 1241: 0. **Scholar deaths (2):** Erich d14 "the wild"
(1234) → mantle Maame d15, latency 1; Jae d22 sickness (1240) → mantle
Ruby d23, latency 1. **Win plans:** 0 holders d14 all seeds; 4 holders d28
on 1241 only. **MET:** fledBad 1 (see open question below), fled 1,
fightsSeen 21, feastsHosted 0, armedFeasts 10.

### The finding — the door-eject fight (finding #2538)

Seed 1234 d9, Old Stare (gallowdeer, wave 1, 145/168 HP), 4 allies, scholar
first, scholar at (4,7) inside the Haven hall, monster at (4,5). Turn 1:
move (4,7)→(3,6) failed "No path there." Turn 2: move (4,7)→(4,6)
succeeded — but (4,6) is a Haven hall door tile, and stepping on a door
tile in combat escapes the fight (FLEE BY DOOR, Steve 2026-10-05 — a
designed exit, not a move). The fight ended 'fled' after 1 round, 0
strikes, the monster unharmed, 4 allies left behind. No parting hit
(FLEEREPAIR3 working). The game behaved exactly as designed; the POLICY
took the exit by accident.

Root cause, corrected during this run: the (4,6) step was fired by the
gallowdeer's counter trick — **move_windup** ("MOVE, don't stare") — via
`beastDodgeMove`, not by the approach step. The dodge tries the nearest
free tiles: (3,6) refused (wall), then (4,6) (door). The first fix
(closeStep only) did NOT change the panel outcome on re-run — the d9
fight still fled identically — which is how the dodge path was found.
The same defect class lives in `closeStep` (the approach step, same
geometry, same panel shape), so both were fixed.

The second zero-DMG fight (seed 1235 d15, Lockpick, solo, 0 moves, 0
strikes, end 'routed') is designed behavior, not a pocket: the
lockpick_raccoon has `fleeAt: 0.5, flee: true` — it fled at the face-off.
This is the r144 metric-review item 1 shape (0 strikes + 0 moves,
scholar first) with a routing-monster cause.

**Adjudication:** zero-DMG raw count 2 vs 0 on r144 AFTER, but B-shape 0
and both fights explained; NOT a NO-GO — the binding pocket bar passes.
Do NOT re-score mid-run (prereg binds). Metric-review proposal below:
bind B-shape / exclude routed-at-start fights for the next run.

### The fix (driver-only, no game change)

`scripts/policies/competent.js` (+34 lines): a shared `isDoorTile`
helper (via `Game.genDetail`, fail-open if unavailable) now guards two
fight-step sites:
- `beastDodgeMove` — skips door tiles before counting a candidate, so a
  doors-only board reads 'none' (no valid tile), not 'stuck'.
- `closeStep` — skips a door tile when closing, checking the tile
  actually stepped on (the findPath step, not just the candidate — a path
  can cross a door even when its destination is not one). If no non-door
  step remains, returns 'stuck' so the caller waits for the monster to
  come through.

Follow-up, NOT fixed this run: `beastStrikeTarget`'s candidate loop and
the `move_x2` trick pick have the same shape (a step onto a door tile is
possible) — they did not fire on this panel. The shared helper is now
available for them.

### Proof tests (both RED/GREEN)

- `scripts/test-journey-landing-r145-door-approach-20261118.js` — 19
  checks, 6 cases (door-skip, door-only, control, no-genDetail,
  dodge-door-skip, dodge-door-only), stub Game with the hall layout.
  GREEN 19/19. RED verified by stashing the fix: door-skip, door-only,
  dodge-door-skip, dodge-door-only all fail with the scholar ending on
  (4,6) — the door tile. (One test-expectation correction during writing:
  the control case's tie-break is loop order, so the nearest tile is
  (3,3), not (4,3) — the code was right, the expectation was wrong.)
- `scripts/test-journey-landing-r145-mourning-menu-20261118.js` — 19
  checks, GREEN (closes r144 metric-review item 3; see below).

### BEFORE → AFTER (seed 1234, fixed driver)

Same seed, same horizon, fixed driver only: the d9 fight went from
**fled, 1 round, 0 strikes, monster 145/168 alive** to **won, 6 rounds,
monster −14 HP (killed)**, scholar 95→45 HP, 24 fight-log turns. The
dodge went (4,7)→(5,7) instead of through the door (4,6). The fix
changed the trajectory (villager deaths 4→2 on this seed), as a fought
fight should. Corpus:
`hidden_files/evidence/2026-11-18/landing-r145-after-fix-1234`.

### Mourning watch — CLOSED by proof test

Still UNMEASURED on live panel data (MOURN_PROBE env-gated, off by
default; no "mourning" string in any of the 113 transcripts; grief
bridge servings 0). The panel runs default for like-for-like
comparability with r144; the watch is closed by the proof test instead
(the r144 precedent for the r231 item). The test drives the REAL menu
path — the gap no prior test covered (`test-mourning-name-r8.js` covers
the generic line via menu but predates REL-MOURN;
`test-journey-succession-r232-relationship-mourning-20261117.js` covers
REL-MOURN via direct `topic2Ask`/`topic2Beat`, never the menu).
Results: mourning choice offered 2/7 sittings (bond case) and 5/7
(silent case); bond openers served named Bao ("Bao was my person at this
fire", "I knew Bao. Really knew them, not the fire's version"); silent
case 0 bond variants, generic openers naming Tanisha correctly; no
`{mname}` leak; no bare-"A" collapse. One silent-case entry carried a
repeat-preface ("You asked me that before. It's a different question
now.") plus opener — coherent, not a defect. The silent case IS the RED
control for the fires assertion (0 bond openers observed live); r232
already RED-verified the gate itself.

## Q2 — People check (5/5 read in full)

Bar: the NPC wants something, options engage or deflect it, endings
resolve/plant/owe; no fabricated shared history, filler loops, or static
menus. **Verdict: PASS — villagers act like people.** (No mourning
sitting exists in the panel; the flee-fight check is the 1234 d9 fight
log, read in full above.)

1. **1232 d9 — Dmitri, warn_you, heeded.** Dmitri warns; the scholar
   heeds three times; his lines escalate ("Promise me that. Please." →
   "Thank you. I needed to hear you say it." → "I'm not trying to fence
   you in. I'm trying to still have you here tomorrow."). Want real,
   options engage, ending resolves. Watch: the scholar picked
   [dlg:heed] three times in a row — repetitive on the scholar's side
   (driver choice), though the NPC's lines varied and the want resolved.
2. **1233 d8 — Tangaroa, warn_you, unestablished.** Watch: the sitting
   opened with a SECRET menu (secret:promise/comfort/offer/silence) and
   a confession line ("Before the scattering, I froze when it
   mattered") — not a warning. Want label vs spoken content mismatch;
   the scholar left immediately (turns=0) and the want never
   established. Counts in M-PR1's neverOffered. Small incoherence, not
   a fix this run.
3. **1237 d6 — Dwayne, seek_comfort, engaged.** Distressed ("I don't
   know what to do with my hands today"), scholar asks "Hey — you
   alright?", NPC exhales: "I'll get there. Just needed a minute where
   I didn't have to be fine." Clean, human, resolves.
4. **1237 d7 — Mara, seek_comfort, engaged, 14 turns.** The longest
   sitting: Mara needs company ("I don't want to be alone with my head
   right now." / "Having someone here... it slows the spiral." /
   "Some days I'm an army medic who survived. Some days I'm just...
   surviving. Both count."). The scholar meanders through topics
   (plans, village hunger — answered with real state: "8 people are
   injured; everyone's quiet since the loss"), the want sits at stage 0
   for 11 turns while the scholar chats, then engages (stage 1→2→3)
   and resolves: "Talking helps. A little. Thank you." The "We never
   finished — their plans" resume line fired — the conversation
   remembered an unfinished thread. No fabricated history, no filler
   loop (each turn explores a different topic). The 11-turn delay is the
   driver's topic-probe behavior, not a dialogue defect.
5. **1234 d14 — Benoit, ask_favor, promised.** Clean favor arc: the
   NPC wants pantry-run hands, the scholar asks what he needs, he
   states it, the scholar commits, he gives concrete details ("The
   south slope below the meadow, at sunup. Pack and knife. We travel
   light."), the favor is recorded as promised ("forage with Benoit
   tomorrow to rebuild the pantry"). Ending plants a concrete
   commitment (owed). One abrupt pivot after committing ("Look, forget
   it. You wanted something?") — coherent, not a defect.

## Q3 — telemetry

`telemetry-check.js` vs baseline `landing-split.json` (81/9/217/15/0,
re-pinned r136): **quiet** (10 files, 5 metrics, no large deviations).
Current: systemDay 82, villagerDeaths 12, monsterKills 243,
folTelemetry.fires 13, starvAutopsies 0. Baseline NOT rolled — the panel
carries no new information that moves it. No LOUD lines.

## Q4 — gate: GO (0 attributable failures)

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`
in the worktree: **338 passed, 6 failed in 597s** (exit 1).
All 6 adjudicated against pristine HEAD — 0 attributable to this run:

| Failure | Adjudication |
|---|---|
| `test-measurement-proof-update.js` — "Proof source inputs are not current" | Standing staleness (same on r144). Re-ran on pristine (fix stashed): fails identically. Does not import the policy. |
| `test-measurement-workflow.js` — "retained neutrality proof covers the current Game/controller/harness inputs" | Standing staleness (same on r144). Re-ran on pristine: same 1 failure. Does not import the policy. |
| `test-phone-frame-proof.js` — retained browser input / boot-input / phone receipt stale | Standing staleness (same on r144). Re-ran on pristine: same 3 failures. Does not import the policy. |
| `test-ladder-bundle-20261108.js` — control: 200 monster turns WITHOUT delivery fire the ambient raid (fires 0) | Standing control failure (same on r144). Re-ran on pristine: same 1 failure (78 passed, 1 failed). Does not import the policy. |
| `test-living-garden-deed-attainment.js` — 120s TIMEOUT (exit null, seed progress) | Load artifact, same as r144's standing timeout. Adjudicated by failure-mode identity + no policy import (not re-run on pristine — a 120s budget timeout, not an assertion). |
| `test-one-person-army-deed-attainment.js` — 120s TIMEOUT (exit null, seed progress) | Same as above. |

None of the 6 failing tests import `scripts/policies/competent.js`
(verified by grep). The run's change is driver-only (policy + 2 proof
tests); the proof tests pass 19/19 + 19/19 after the stash/pop cycle.
**Gate: GO.**

**Lock-file note (19:41Z):** the run lock
(`hidden_files/playtest-loop.lock`, created 18:17:23Z by this run) was
found MISSING mid-run. The registry heartbeat for journey-landing is
fresh (19:36:23Z, <15 min) and the heartbeat loop (PID 13525) is alive,
so the run continued on the registry heartbeat — a new run would see the
fresh heartbeat and stop. Something external removed the lock file (the
ship loop has done this before); the run itself never deletes its lock
until closeout. Recorded here, not re-created mid-run.

## Metric review (for the NEXT run)

1. **Pocket watch — ADOPTED (r144 item 1, carried):** watch for
   0-strike/0-move first-in-turn-order fights. This run it fired twice
   (1234 d9 door-eject, 1235 d15 routing monster) — both explained, and
   the door-eject one produced a fix. Keep the watch.
2. **Zero-DMG metric revision — PROPOSE:** bind B-shape (a fight where
   the scholar never got a turn or never struck AND the monster never
   acted is not a pocket by itself) and exclude routed-at-start fights
   (a monster that flees at the face-off ends the fight before any turn
   exists). Raw zero-DMG 2 vs 0 on r144 AFTER is noise under the
   revised metric (B-shape 0 both runs).
3. **M-PR1 away-guard — CARRIED as watch:** statedAfterPick = 4, all
   four the honest away-guard road line (1233 d6, 1235 d12, 1241 d5,
   1241 d9). The guard is working as designed; keep watching that the
   line stays honest.
4. **Mourning — CLOSED by proof test** (see above). No further panel
   watch needed unless the menu path changes.
5. **Hungry-at-horizon 5→1:** a pre-registered "interesting if" move.
   Only seed 1241 is hungry at d28 (finalPerPerson 1596). R60 TRACE
   shows the biggest pantry gains are foraging/production-driven, not
   monster meat. Report as a watch move; do NOT over-claim a cause.
6. **R68 PARTY offers 11→4:** fewer party offers than r144, accepted
   1. Not a bar — watch, not a verdict.
7. **fledBad=1 — OPEN QUESTION:** the single increment site is the
   legacy outmatched block (turn-1, gate COMPETENT_FIGHT_ASSESS off
   this run), but no fight in the census visibly starts outmatched
   (starting HP ≥ 76, single wave-1 monsters at 168 max HP). The two
   fights where the scholar's HP crossed 50% mid-fight are 1234 d14
   (scholar died, hp 89→−43) and 1238 d26 (hp 100→27, routed); neither
   fight log shows an edge-flee move. The exact firing fight is NOT
   pinned from the census — do not assert. Owed: a targeted probe or a
   fledBad sample (which fight, which conditions) in the next run.
   Not a bar, does not affect the verdict.
8. **beastStrikeTarget / move_x2 door shape — FOLLOW-UP:** same
   defect class as the fixed dodge/approach, did not fire on this
   panel. The shared `isDoorTile` helper is available for them.

## Village assessment (plain words)

Ten villages landed and lived to day 28 — nobody's village scattered or
starved. Everyone met the System by day 9. People died the way people
die in this game: ambushed on the road, sick in camp, wounded in
fights, three killed by monsters. Two scholars died and the mantle
passed the next day, both times — the village kept going. The villages
practiced (90 cells of movement, 63 villagers learning a skill from
nothing), hunted (243 monster kills), kept their promises mostly (8 of
37 favors kept, 3 broken, 26 still open — the open ones are the long
tail of a village that keeps asking). Only one village is hungry at the
horizon, down from five — the pantries are holding. Nobody has a plan
for the win yet at day 14 (0 holders), and only one village has four
holders by day 28. The landing is solid; the road ahead is the work.

## Reachable / fun / winnable

- **Reachable:** yes — all 10 villages reached System contact, contests
  (17 fired, all ended), favors, naming debates, and the full
  conversation menu set within the landing window.
- **Fun:** yes — the conversations read like people (Mara's 14-turn sit
  is the best evidence), fights are real (the fixed d9 fight is now a
  6-round kill, not a walk out the door), and the village keeps asking
  for things worth doing.
- **Winnable:** not yet measured at this leg — no win plans at d14, one
  village with holders at d28. The landing's job is survival and
  emergence, and it does that. The winnability chain is a later leg's
  question.

## Closeout

- Fix commit: door fix (`scripts/policies/competent.js`) + both proof
  tests. Evidence commit: prereg, run note, driver, logs. No game
  change, no win-price or deed-gate change — no `[needs-eyes]`.
- Rotation: 0→1 (next leg: establishment). Lock deleted after
  verifying run_id. Heartbeat loop killed at closeout.
- **Merged locally, pending ship** — no version tag; the ship job
  reports the tag when it goes live.
