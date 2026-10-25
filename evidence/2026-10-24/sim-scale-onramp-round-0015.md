# sim-scale-onramp-round-0015 — coordinator evidence (axis scale-onramp — 2 arms LANDED, merged locally pending ship)

Run: fleshout-20261025T0015Z (Sat 2026-10-24 19:15 CDT). Axis: scale-onramp
(converging). Loop B live on food-economy at run start? No live claim and
no lock existed at run start — both loops were free — so this run worked
the topmost non-converged axis, scale-onramp, and took the 2315Z run's
named next blanks (1) and (2) in order. No sibling claim was touched.

## PRE-REGISTRATION (coordinator level, binding)

- Substrate (both arms, shared): tableseat-nowait — leanlinkrescue
  courtship (LEANLINKRESCUE=1) + seat legs only (TABLESEATNOWAIT=1),
  no wait leg. Seeds 73671–73678, 180d death-aware — the SAME band as
  standing99 / vetkill / vetshape, reuse intentional: these are
  re-measurements of those seeds with new recorders, not fresh bands.
- Primary metric per arm: its own pre-registered DIAG-GO gates
  (G1 det-gate, G2 neutrality, G3 corpus integrity, G4 classification
  completeness), judged in each arm's evidence file. A DIAG-GO is a
  measurement verdict, not a game change: both arms are diag only,
  zero src/js, no defaults flipped, no readyDemand moves.
- Deciding cost bar (scalemetric, carried over): starvation ≤
  control+2 on totals AND arm-only deaths AND median ≥ 0.8× control
  median — reported diagnostically for pure-read recorders (both
  recorders are neutral by construction, so the bar is trivially met
  and is not the verdict).
- Balanced panel (§15): attempted by both arms; both threw the known
  error (`TypeError: Cannot read properties of undefined (reading
  'days')` in `scripts/lib/balance-scorecard.js` `comparePanels`) —
  the panel requires panel-driver output, not per-seed sweep rows.
  Sweep-compare tables are the comparison for this run, on identical
  seeds, judged against the pre-registered bars. Panel-contract lane
  not touched.

## Arm 1 — sim-encounter-a (ddd966a4c after rebase; originally 257cdbbe6)

Wave-3 encounter/kill-opportunity diag on the NEVER-KILLED group.
Recorder: scripts/policies/encounter-diag.js (ENCOUNTER=1),
sweep scripts/test-encounter-diag-sweep.js, proof
scripts/test-encounter-diag.js (14/14, re-run green post-rebase
and on merged master). Corpus:
evidence/2026-10-24/perseed-encounter-a/ (16/16 rows + summary.json).
Evidence: evidence/2026-10-24/sim-encounter-a.md.
DIAG-GO: G1 PASS, G2 PASS (8/8 identical days/gameDays/ts/starvation,
death breakdown identical 261 = 261), G3 PASS, G4 PASS.

- 73674 — NEVER-FACED. 0 wave-3+ spawns, 0 field fights, 0 tb fights,
  0 kills. The wave-3 gate never opened: daily wave-2 ledger max = 1
  point (a single heckler kill) vs bar 4, day floor 25 long past. It
  reached global rank without ever opening wave 3 — the blocker is
  the wave-2 kill ledger, not scale.
- 73675 — FACED-LOST. Gate opened day 84, first spawn day 85. 38
  fights, 0 kills (1 vDie, 17 vFlee, 19 mFlee). Sole tb fight day 140
  vs redactor ended `routed` (harness watchdog, never resolved).
- 73677 — FACED-LOST. 6 fights, 0 kills. Sole tb fight day 97 vs
  spool ended `lost`, player-only, the day before the run ended
  (lesser seat taken day 98).
- 73676 (extra) — FACED-KILLED, 1 kill, consistent with vetkill-a.
- Band totals: 58 wave-3+ spawns, 87 field fights, 37 tb fights, 11
  kills. Villagers never killed a wave-3+ monster in the field (0/87);
  all 11 kills are player tb kills. Player tb outcomes: won-kill 10,
  lost 23, fled 0, routed 4, won-no-kill 0. Tb participant split: 24
  player-only / 13 with a villager party member, scholar in every
  fight.
- Spawns are a floor, not the total: 73671 fought 3 wave-3 tb fights
  with zero wave-3 world spawns, and 73678's first wave-3 fight
  (day 57) predates its first wave-3 spawn (day 67) — feast draws
  and contest arenas bypass world spawning.
- Recorder note (citable numbers only from the re-run): the first
  sweep reported tbW3 = 0 everywhere while its own kill log held 11
  tb-via kills — a wrap bug (tbEnd read `Game.tbfight` after
  delegating, but tbEnd ends with `this.tbfight = null`). Fixed to
  check the captured fight object; full sweep + det-gate re-run on
  fixed code. 73677's label changed as a result (FACED-FLED →
  FACED-LOST).
- Sense read (73675, non-measured replay, days 178–181): the game
  DOES say a wave-3 monster exists and where it is ("Something
  moves out there — Buffering" / "It followed you. The Buffering is
  here" / "The Buffering stops at the treeline — pacing, unwilling.
  The walls end the argument"), but never how to meet it, and the
  fiction's own verdict is that the walls end the argument. The
  System's veteran line lands flat in the same window ("blood your
  fighters (0 of 1 veterans)") — nobody answers, nobody plans.

Named next levers from this arm, in order: (1) wave-2
encounter/kill opportunity on 73674-class seeds (same recorder with
a wave-2 lens; 1 wave-2 kill in 180 days — do not propose wave-3
levers for a seed whose wave-3 gate never opened); (2) wave-3 combat
capability on 73675-class seeds (why villagers never kill wave-3 in
the field, 0/87, and why the player loses 23/37).

## Arm 2 — sim-arenadeath-a (e13f62c2d after rebase; originally 38900de32)

Killer-survivorship / arena-death diag on the KILLED-DEAD-KILLER
group. Recorder: scripts/policies/arenadeath-diag.js (ARENADEATH=1),
sweep scripts/test-arenadeath-diag-sweep.js, proof
scripts/test-arenadeath-diag.js (21/21, re-run green post-rebase
twice and on merged master). Corpus:
evidence/2026-10-24/perseed-arenadeath-a/ (16/16 rows + summary.json).
Evidence: evidence/2026-10-24/sim-arenadeath-a.md.
DIAG-GO: G1 PASS, G2 PASS (8/8 identical, death breakdown identical
261 = 261), G3 PASS, G4 PASS (all 7 killers on KILLED-DEAD seeds
classified, none UNCLASSIFIED).

- Every dead killer died as the scholar in an arena fight — and the
  mandatory/voluntary split is UNRECORDED, not guessed. All 8 dead
  killers carry fallen `the arena` AND a matching lineage entry
  (scholar arena death, the sole producer of that cause). The engine
  records neither the givesChoice flag nor the choice taken for any
  resolved contest (`activeContest` is transient), so no scholar
  arena death can be split mandatory/voluntary from post-run state.
  ARENA-VOLUNTARY and ARENA-MANDATORY are both empty among measured
  killers for that reason — the missing distinction IS the finding.
  (The sense replay's own killer, mara_vasquez, is a live
  ARENA-MANDATORY example — a villager contest death — but it is
  replay-only, NOT census data.)
- The arena does not hunt veterans; the mantle does. 7 of the 8 dead
  killers earned their kills as the scholar (`player` channel); the
  8th (jorge_silva, companion kill day 65) later held the mantle and
  died as scholar day 92. The killer population IS the scholar
  population in this band — so "killers die in the arena" restates
  "scholars die in arena fights", with the veterans bar demanding a
  LIVING killer.
- Killer lifespans after first blood (lineage proof): 27, 7, 19, 1,
  7, 5, 0, 1 days. A veteran is a fleeting state in this band.
- Arena-death rate on three stated denominators (do not conflate):
  dead wave-3+ killers 8/8 (100%); fallen persons 41/63 (65%)
  arena-or-contest; harness deaths 38/261 (14.6%) scholar arena
  deaths. Fallen is NOT a death census (64 fallen entries vs 261
  harness deaths) — most death paths leave no fallen entry at all
  (contest path-(b) deaths remove the villager with no fallen push).
- No per-villager arena-participation history exists in the engine
  (no events entered, opponents, outcomes, or HP at death survive
  to post-run). Scholar-era takes record as `player`, not as the
  vid, so per-vid timelines show co-taken takes only.
- Code structure (not counts): villager contest participation is
  MANDATORY by construction (no choice screen ever exists for
  non-scholars); scholar participation is MIXED (choice on
  givesChoice or a 30% roll, else grabbed with no choice; refusal is
  a sequence, co-taken others still fight). In sims the bot always
  picks Participate (choice 0) when offered one, but the
  grab-vs-choice split per contest is still unrecorded.
- ethan_hunt anomaly RESOLVED for timing: full fallen list holds
  day 56 `monster` AND day 104 `the arena`; daily scholar-vid
  trajectory shows ethan held the mantle days 82–103, killed the
  wave-3 Ad Break day 103 as scholar, died in the arena day 104
  (+1 day). Vetkill-a's first-wins map hid the day-104 entry, so its
  day-56 date was the wrong death for survivorship timing. NOT
  resolved: the day-56 `monster` entry itself (day 56's scholar was
  gen_yg1x0kp, not ethan; ethan held no mantle until day 82) —
  either a fallen push on a non-fatal path or vid reuse for a later
  joiner. Needs a death-path trace arm on 73672; no verdict here
  depends on it.
- Sense read (73676, non-measured replay, days 153–156; outcome
  class DIFFERS from the measured run — narration shifts
  trajectories, so nothing here enters the census): the bar is
  named but the dead are not mourned and the arena is never warned
  about. The System says "blood your fighters (0 of 2 veterans)"
  as a headcount, not a history. The one grief line ("They're
  burying their speaker — grain can wait a week; grief can't") is
  about a speaker, not a fighter, tied to no veteran, kill, or
  arena death. The replay's own ARENA-MANDATORY killer never
  appears in the 240-line ring at all.

Named next levers from this arm, in order: (1) a choice-capturing
instrument (event hook on `contestInterruption`/`contestChoose`,
own neutrality proof) recording per resolved contest givesChoice +
choice taken + participant vids resolved against the scholar vid
at take time — the ONLY way to split scholar arena deaths
mandatory/voluntary and build a true per-villager arena history;
run it on 73671–73678 and re-classify the 8 UNRECORDED-DISTINCTION
killers; (2) the ALREADY-EXISTING default-OFF VETSHAPE probe
(VETSHAPE=1, living-OR-DEAD killers count) on the KILLED-DEAD-KILLER
seeds — changes no defaults, answers whether the living-only
demand shape is the binding constraint; (3) death-path trace for
ethan_hunt on 73672 (day-56 entry) and a fallen-vs-deaths census-gap
note — backlog items, neither blocking the VETSHAPE probe.

## Wall numbers (this run's judged corpora, 32 configs; both arms replicate vetkill-a exactly)

National ever 8/8, national-or-higher final 7/8, table invited 5/8,
table entered 4/8, wins 4/8 (all lesser seat), entered FULL 0/16,
wave 4 reach 5/8, wave 5 reach 0/32, max arc 4, median survival 150
days, max 180 days, starvation deaths 3, death total 261 (combat
82%: villager combat 106 + villager-vs-villager combat 71 + player
arena 38). Baselines replicate exactly across both workers and
against vetkill-a / standing99 (won 4, wave 4 reach 5, wave 5 reach
0, starvation 3, median 150, deaths 261) — the same baseline
reproduced independently three times over.

## Village assessment (plain words)

The village's climb now has three different stuck shapes, and they
need three different fixes — that is the run's result. One village
(73674) never even meets a wave-3 monster, because it only ever
killed one wave-2 monster in 180 days and the next wave never
opens: nothing to count, nothing to fix with a demand number.
Two villages (73675, 73677) meet wave-3 monsters again and again
and never kill one: their fighters flee or lose, and the one
monster that does die is killed by the player, not the village.
And the villages that DO blood a fighter lose that fighter almost
immediately — not to a monster, but in the arena, because the
fighter who kills is the village's scholar, and scholars die in
arena fights within days of their first kill. The game tells the
village none of this as people: it names the missing headcount
("0 of 1 veterans") and never names the dead, never warns that the
arena eats scholars, and never says how to meet a monster or what
counts as blooded. The village looks fine on every measure except
the gate — full pantries, gifts, teaching — while the gate quietly
asks for a living killer it keeps losing.

## Telemetry deviation check

Ran on both perseed corpora (encounter + arenadeath), same command
as prior runs. 2 LOUD lines each, identical: national 12 → 0,
wins 16 → 0 (n=17 files = 16 rows + summary.json). Both are the
known regime + field-shape artifacts (WINSEAT baseline vs pre-seat
substrate; per-seed rows carry nationalEver/entered/won, not
top-level national/wins paths) — same as 1955Z/2115Z/2215Z/2315Z.
Baseline NOT rolled, no new investigation item.

## Metric review

- Both arms' pre-registered bars worked as written; no mid-run
  re-scoring. G2 (all seeds identical on days/gameDays/ts/starvation)
  is the right strength for pure-read recorders, and the identical
  death-cause breakdowns (261 = 261) plus identical classifications
  corroborate it independently of the ts counters.
- "Median days" as a cost bar is uninformative for a pure-read arm
  (150 vs 150 by construction); the informative neutrality proof is
  per-seed identity (G2) plus identical classifications.
- Encounter arm's first-sweep wrap bug is the run's measurement
  lesson: a recorder that reads engine state after delegating to a
  method that clears that state reads nothing. Its proof-test mock
  now nulls tbfight like the real engine, and only re-run tb numbers
  are citable.
- Arenadeath arm's metric gap for the NEXT instrument: daily
  lastContest snapshots catch co-taken takes but NOT scholar-era
  takes (they record as `player`), and catch no choice, opponent,
  or per-event outcome. A per-villager arena history cannot be built
  from daily pure reads — it needs the event hook named above.
- "Fallen" is NOT a death census: 64 fallen entries vs 261 harness
  deaths. Future arms must state their death denominator (fallen
  persons vs harness deaths) or their rates will not compare.

## Infrastructure

- Master moved once under the run before merging (journey
  succession r44 + journey crisis r49, instrument-only, zero file
  overlap with either arm). Both branches rebased clean in their
  own worktrees (arenadeath twice — second after the encounter
  merge, when ff-only correctly refused the diverged branch);
  proofs green after every rebase and on merged master (encounter
  14/14, arenadeath 21/21).
- Worktree registration was slow (~165s for both trees) but
  succeeded; no EPERM flap this run.
- Safe-commit index clobber hit the encounter worker's commit
  (all 22 files shown as staged deletions, worktree files
  byte-identical to HEAD) — repaired via cacheinfo, commit verified
  correct. No clobber on the arenadeath worker commit or either
  coordinator merge; main tree clean at closeout.
- check.js --quick NOT re-run: zero src/js, zero green-list files
  in either arm, and the standing profile (280 passed / 7 failed,
  pre-existing parity gear assertion) was just recorded by the
  2315Z run on the same substrate. The encounter worker's started
  check.js run was killed after ~11 min with no output and is not
  claimed as evidence.
- No push, no version bump, no live verification — merged locally,
  pending ship (ship loop owns deploys).

## Convergence state

scale-onramp stays converging (NOT converged): the veterans lock is
now decomposed three ways with three named levers (wave-2
encounter opportunity for 73674-class seeds; wave-3 combat
capability for 73675-class seeds; scholar arena survivorship /
living-only demand shape for the KILLED-DEAD group), but wins still
come only through default-OFF courtship + seat instruments, only
through the lesser seat, wave 5 still 0, and no wave-4 kill exists
on this band for any wave-5 lever to count. The directive stands
until the tracker records this axis converged on measured
evidence. Next blanks, in order: (1) wave-2 encounter/kill
opportunity on 73674-class seeds; (2) wave-3 combat capability on
73675-class seeds (villagers 0/87 in the field, player 23/37 lost);
(3) the choice/event instrument + VETSHAPE probe for the
KILLED-DEAD group; (4) whether waiting matters on bands where the
seat stays unready longer. food-economy stays converging
(untouched; sibling B loop). Rotation left at 3 (convergence work
does not cycle it). Claim deleted; lock deleted.
Evidence: evidence/2026-10-24/sim-scale-onramp-round-0015.md (this file).
