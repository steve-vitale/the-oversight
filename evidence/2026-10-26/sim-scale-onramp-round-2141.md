# sim-scale-onramp-round-2141 — coordinator evidence (axis scale-onramp)

Run: flesh-out loop A, run fleshout-20261026T2141Z. Axis scale-onramp
(topmost non-converged axis, not named in any live claim at run start).
Sibling loop B live on food-economy the whole run (2130Z claim,
sim-smoke-eq-b + sim-spoilvol-b) — NOT touched. Both arms DIAG /
MEASUREMENT ONLY — zero src/js, no default flips, no demand-number
moves, no [needs-eyes]. Merged locally, pending ship (ship loop owns
pushes, bumps, live verification).

## Arms (both DIAG-GO, both LANDED)

### Arm 1 — sim-meetrule-a (commit 273b229e4, proof 1127 PASS / 0 FAIL
post-rebase AND on merged master)
Next blank #1 (findings: NO ROUTE TO A KNOWN MONSTER, from sim-w4opp-a):
what would a "go to the known monster" behavior need, in code-grounded
terms? Evidence: evidence/2026-10-26/sim-meetrule-a.md + prereg +
perseed-meetrule-a/ (16 rows + summary).
- Classification: 8/8 seeds, 24/24 never-fought spawns in exactly one
  w4opp class, zero unclassified, recorder errors zero. The w4opp
  partition reproduces exactly (33 spawns, 24 never-fought, 9 fought).
- Condition list G1..G6, each grounded in a named file + function,
  except G1 KNOWLEDGE, marked MISSING with the absence grounded by an
  enumerated search: objPick targets, map memory, expeditions,
  gossip/awayNews, and all worldMonsters() readers outside game.js
  were checked — none supplies a live monster's tile to villager
  routing. Player perception is the ONLY live-monster knowledge in
  the game, and it lives with the player character, not routing.
  Stated plainly: a villager-led "go to the known monster" behavior
  is NOT currently realizable on any existing knowledge path.
- Reachable fraction (pre-registered tier rule, spawn-day):
  7/24 (29.2%) conditional on the knowledge link; 5/22 newly
  reachable never-in-range spawns. Exploratory (NOT judged):
  11/24 (45.8%) on a presence-window rule. Failure split of the 17
  unreachable: 13 no eligible villager (shelter-dominated),
  3 range-short, 1 travel-bound artifact. Travel time is NOT a
  gate (1-4 parts vs 0-79 days present); range and eligibility
  (shelter + attrition) are the gates, with knowledge missing
  entirely.
- Party route (G2): field parties form only as lead-on-tile +
  _outdoorCrew snapshot; day-end crew is 0 on all 1206 census-days
  (mid-day crew not proven absent by that number — stated honestly;
  the bot policy makes no patrol/scout/hunt/forage assignments, so
  the channel is unexercised here). Companions DO walk out in pairs
  on 482/1206 census-days (40%) — but only on objectives the system
  picks, never toward a monster. Player-party route contributes
  ~nothing under the bot policy (travelingN max 1).
- Re-baseline EXACT vs the 1920 table, zero base delta. Cost bar
  PASS, det-gate PASS, detail repro PASS.

### Arm 2 — sim-volley-a (commit 06b1bcb21, proof 152 PASS / 0 FAIL
post-rebase AND on merged master)
Next blank #2 (findings: VOLLEY NEVER FIRES, FIGHTS OPEN LEARN ALONE,
from sim-w4dmg-a). Evidence: evidence/2026-10-26/sim-volley-a.md +
prereg + perseed-volley-a/ (16 rows + summary).
- Volley gate table, all 1179 field fights (waves 1: 744, 2: 285,
  3: 138, 4: 12): volley damage 0, shots > 0 in 0 fights. G2 no
  ranged equipped 518 (43.9%), G6 bow-no-ammo 389 (33.0% — bow/sling/
  crossbow equipped, ammo exactly 0), G5 spear-as-ranged 226
  (19.2%), G0 evade-preempt 46 (3.9%, waves 1-2 only), G7 fires 0,
  G8 exception-suspect 0. No fighter in 1179 fights carries a single
  ammo unit at fight time (carriedAmmoUnits > 0: 0/1179). The volley
  branch runs (G6 narration proves it); it simply never has
  anything to fire with. Whether ammo exists in village storage but
  never reaches fighter packs was NOT measured — the next blank,
  not a claim made here.
- Correction to w4dmg (stated, not hidden): "volley null on all 12"
  is now "null on 10, {shots:0} on 2" (the G6 fights). Damage
  totals unchanged.
- Party formation: WORLD fights 1029 (87.3%) get opts allies 0 —
  patrol/wild/sortie all feed opts from the _outdoorCrew snapshot,
  which is 0 at every one of the 1179 fight moments, while the
  diagnostic read villagerFightAllies() would supply allies on
  990/1179 fights (84.0%). The party machinery is not broken; it
  is never fed, on the route where wave-4 monsters are actually
  met. Expedition fights are the only party route (31 fights,
  5 called, all dealing real ally damage). The learn-block on the
  hopeless call is structurally vacuous (a learn fight has opts 0
  by construction).
- Opening moves: wave-4 final intent 10 learn / 2 engage, exactly
  as w4dmg; entry-learn 337 band-wide, 135 flips on good exchange,
  0 flips on wave 4. No game bug was found in the volley, party,
  or intent paths — the fights work as designed; the village
  fights them unarmed-at-range, alone, and learning.
- Re-baseline EXACT vs the 1920 table, zero base delta. Cost bar
  PASS, det-gate PASS, detail repro PASS.
- Missing artifact (recorded, not papered over): the standalone
  sense .txt could not be created during a mid-run EPERM flap on
  evidence writes (~22:46Z, three 0-byte stubs, all removed); the
  sense judgment lives in the .md instead. Re-creating it is a
  coordinator retry, not a re-run — the replay's recorder output
  is already captured in the evidence.

## Wall numbers (both arms agree exactly — re-baseline, tableseat-nowait substrate)

wins 2/8, national-ever 6/8, national-final 5/8, table 4/8, entered
2/8, wave-3 8/8, wave-4 6/8, wave-5 0/8, wave-4 kills 0/8, median
152d, deaths 307, starvation 1. Full seat unreached. The wall did
not move; this run priced it two layers deeper: beneath the damage
desert (w4dmg) sits an equipment-and-escort desert (no arrows ever
reach a fighter, no party ever reaches a world monster), and
beneath the meeting desert (w4opp) sits a knowledge gap (no path
carries a live monster's tile to villager routing) plus a
shelter/range gate that leaves only 7/24 spawns reachable even
with knowledge.

## Reachability verdict

Waves 1-3 reachable; wave 4 reachable as encounters (6/8 seeds)
but never as kills (0/8); wave 5 unreachable (veterans bar peaks
at 0). Regional → national reachable on this substrate (6/8 ever);
the table reachable as waiting/invited, entered 2/8; the full seat
and the win flag (2/8 wins here are lesser/won variants on this
substrate — never quote the win count without the per-seed table)
are not the binding gap. The binding gaps are now specified, not
just observed: (1) knowledge link G1, (2) ammo-to-fighter supply,
(3) _outdoorCrew feeding for world fights.

## Village assessment (plain words)

The village knows how to stand tall and sit at the table, but it
fights its hardest monsters the way a person would fight a rumor:
alone, with an empty bow, trying to learn from something that hits
for 35-95 damage a swing — and it never walks toward the monsters
it knows about, because nobody ever told its feet where they are.
Nobody is being lazy; every system works as designed. The village
simply has no road to the fight, no arrows in the quiver, and no
company on the way. That is the wall, priced gate by gate.

## Blanks filled or documented

- FILLED: go-to-known-monster condition spec G1..G6 + 7/24
  conditional reachable fraction (meetrule).
- FILLED: complete volley gate table 0/1179 + party-formation
  decomposition + opening-move reproduction (volley).
- CORRECTED: w4dmg "volley null on all 12" → null on 10,
  {shots:0} on 2 (damage totals unchanged).
- DOCUMENTED, NOT FIXED (next blanks, in order): (1) storage-level
  ammo census — does ammo sit in village storage while fighters
  carry zero? (2) 213-HP SEQ51 GAP (73672 influencer seq51 field
  end 799 vs tb-start 586, carried); (3) TB CHANNEL RESET —
  steve-call if a lever is proposed, never smuggled; (4) wave-4
  defeats mourned, never instructed (sense/dialogue arm);
  (5) situation-blind table talk (spec ready, ruling not).
- Sense test: both arms read transcripts/replays (SENSE-TESTING
  LAW). Meetrule: the village has sortie language for treeline
  lingerers but never applies it to unmet Draft monsters —
  pursuit exists as a phrase, not a path. Volley: the narration
  ring holds only the last 240 lines (endgame days), so sense
  replay cannot show the wave-4 fight days themselves; the
  judgment rests on recorder agreement plus the absence of any
  bow/arrow/party language in the ring.

## Metric review

- Pre-registered DIAG-GO bars were judged exactly as written for
  both arms; neither bar was re-scored mid-run. Meetrule's prereg
  explicitly allowed a MISSING link to still pass bar (b) if
  marked and its consequences stated — that clause was used for
  G1 and is disclosed here, not hidden.
- Balanced panel: no panel compare .md exists for these no-lever
  DIAG arms — leg-exact determinism (re-baseline exact + recorder
  neutrality + det-gate) is the before/after comparison, the same
  limitation prior arms recorded. scripts/balance-panel.js has no
  corpus-ingest mode; no panel file was produced or faked.
- Telemetry deviation check (this run, both corpora): LOUD lines
  national 12→0 and wins 16→0 on both. Adjudicated as the known
  regime + recorder-row artifact class (WINSEAT baseline vs
  pre-seat tableseat-nowait substrate; the checker reads top-level
  keys recorder rows do not carry) — the same lines prior runs
  adjudicated the same way. Baseline NOT rolled, no new
  investigation. (Meetrule's prereg notes telemetry-check is not
  run on recorder rows for this reason; the check was run here
  for the coordinator record and its LOUD lines are explained,
  not acted on.)

## Infrastructure (loud)

- Container EPERM flap on .git ref writes blocked worktree
  registration from ~21:44Z to ~22:07Z (packed-refs.new /
  refs/heads lock writes denied). No ref surgery was forced: the
  run waited, the flap cleared on its own, the orphan branch from
  the failed first attempt was verified at master and deleted,
  and both trees then registered cleanly. Same flap class as
  2026-10-23/24.
- Mid-run EPERM flap on evidence writes (~22:46Z, volley arm):
  new-file creation failed with 0-byte stubs; the sweep corpus
  (written before the flap) is intact and the sense judgment was
  kept in the .md. One standalone sense .txt is the run's only
  missing artifact.
- Master moved under both workers mid-run (sibling loop B landed
  spoilvol-b + smoke-eq-b; journey r45 landed). Both branches
  rebased cleanly onto the new master, re-proved green
  (1127/0, 152/0), then merged ff-only. No conflicts, no overlap:
  all A files are measurement-only scripts/evidence under
  distinct names.
- Safe-commit index clobber: hit the volley worker commit (repaired
  via HEAD-blob cacheinfo, verified correct); the coordinator
  commit below was checked with git status before and after.
- Worktree registration was slow (git contention with sibling
  loops) — delay, not failure. check.js --quick was STARTED at
  closeout but produced no output in ~8 minutes (likely jest /
  sibling contention) and was killed; it is NOT claimed green.
  Attributable evidence is the arm proofs on merged master
  (1127/0 + 152/0, re-run here). Zero src/js changed in this run,
  so no green-list surface was touched by it.

## Convergence state

scale-onramp stays converging (NOT converged): wave 5 still 0/8,
wave-4 kills still 0/8, full seat unreached — but the wall now has
a priced, two-sided, two-layer mechanism: unmet (knowledge gap +
shelter/range gates) AND unbeatable (damage desert over an
equipment-and-escort desert). food-economy stays converging
(untouched; sibling loop B). Rotation left at 3 (convergence work
does not cycle it). Claim deleted; lock deleted.
Evidence: evidence/2026-10-26/sim-scale-onramp-round-2141.md
(coordinator) + sim-meetrule-a.md + prereg + perseed-meetrule-a/ +
sim-volley-a.md + prereg + perseed-volley-a/. Merged locally,
pending ship.
