# Loop A round 1415Z — scale-onramp, 2 DIAG arms, merged locally pending ship

Run: fleshout-loop-a-20261101T1415Z (scheduled 07:15 CST, started 14:15Z).
Axis: scale-onramp (converging, NOT converged). Sibling Loop B live on
food-economy throughout (1346Z claim; its coordinator commit 32279c069 landed
mid-pre-flight and its dipslide-confirm merge moved master twice during this
run) — NOT touched. No game-code change in this run: both arms DIAG only,
zero src/js, no balance lever flipped, no version bump, no push.

## Pre-registration (coordinator, before any worker sims)

- Arms (chosen from the 1235Z next blanks, after re-reading the tracker and
  the live Loop B claim): (1) muster formation, pivoted on the day (see
  below) to herald placement vs wandering; (5) wave-4 fight lethality.
  Both arms pre-registered their own headers in-worktree BEFORE any judged
  replay (commits f1389c9e7 wave4leth, d7e7c0d14 muster, f937c3f08
  heraldplace — all before their judged sweeps).
- Shared baseline rule: each arm judges against its own pre-registered
  DIAG-GO bars (instrument completeness, not a landing bar), pilot 8 seeds
  before any confirm spend, death-aware horizons, no confirm band unless the
  pilot shows a live signal. No confirm band was run in either arm.
- Panel §15: inapplicable — DIAG-only censuses with no before/after
  intervention. No compare fabricated. The wave4leth band reuses the
  sortiedpr PLAYED band verbatim as its comparator population, not as a
  panel before/after.

## Pivot, recorded honestly

The muster-formation brief as first written duplicated answered work. Before
any judged sims were run on it, the backlog check caught it: #1546 (answered
2026-10-30 sim-muster-a: a muster only exists when somebody presses 'Sound
the call' / 'Commit Haven's blades' — no policy or game system ever does)
and #1591 (Loop B sim-mustercall-b: single-seed 85106, call yields 5 then 9,
ceiling >= 10, sounded call at day-112 refusal yields 9, +1 commit = ready,
Herald fought and lost). The worker was redirected to the genuinely open
follow-up, backlog #1617 (Herald placement vs wandering), with a
contact-gated pilot. The pre-pivot muster work still landed on the branch
because it is a same-band replication, not waste: on 95301–95308 it
reproduces muster-structurally-zero (0 calls, 0 blades; classes 6x
B-OFFERED-NOT-SOUNDED + 2x A-NO-OPPORTUNITY; proof 32/32 with corpus legs).
The pivot is the reason the branch carries both sim-muster-a and
sim-heraldplace-a files.

## Arm sim-wave4leth-a (worker tip rebased, merged --ff-only; proof 8/8 on
## merged master; diff guard zero src/js): DIAG-GO

Band: sortiedpr PLAYED band verbatim, seeds 75101–75108, 180d death-aware.
67 wave-4 fights offered, 65 fought, 2 evades; 6/8 seeds reached wave 4 —
pilot gate cleared by a wide margin, no INSUFFICIENT-DATA stop.

- End-states (65 fought): FLED 43 (66%), DIED 16 (25%), DRIVE-OFF 5 (8%),
  KILL 1 (1.5%). By caller: resolve 50, sortie 10 (7 fled, 1 died,
  2 drive-offs, 0 kills), aid 5. No caller class kills healthy beasts.
- Per-role death: leader 16/65 (24.6%), beast 1/65 (1.5%), joined ally 0/5 —
  but that 0% is "never targeted," not "safe": 0 fights have allyTaken > 0;
  all 5 joined allies were never struck.
- Killer survival: the single kill is a round-0 contact finish vs a 1-HP
  herald (solo, leader alive). Serious-wound fights (prereg: start >= 100 HP
  and >= 200 damage or <= 50% HP left): ZERO — deepest wound is 105 vs
  739 HP. Healthy-beast slice (63 fights >= 91 HP): 0 kills, 16 leader deaths.
- Stay vs flee: rounds 0:2, 1:35, 2:24, 3:4 — nothing reaches round 4, let
  alone the 15-round cap (0 cap ends). Rounds-to-flee median 1,
  rounds-to-death median 2. Fleeing doesn't save killers (none exist) and
  staying doesn't kill them (no one stays); deaths and flees take identical
  median damage (62).
- Damage concentration: corpus-wide leader 99.0%, ally 1.0% (13 of 1,298
  total damage), volley 0.0% (0 damage in 65 fights; 24/65 fights open with
  "has bow/sling but no arrows"). Median damage/fight 11, median DPR 11.0,
  median beast HP removed 2.1%. The prereg slice concentration (n=1) is
  reported as not-a-distribution; the corpus-wide shares are the finding.
- Engine cap measured: 2 fighters fielded in only 5/65 fights (7.7%
  shout-joined); mustered 3 never fields 3. Context: leaders armed 67/67,
  armorP median 16, pantry at fight median 9,350 kcal — fed villages; food
  is not the fight-day constraint.
- Wall numbers (this band): won 1/8, nationalEver 5/8, nationalFinal 3/8,
  table 3/8, entered 1/8, wave-4 reach 6/8, wave-5 reach 0/8, median
  survival 180d, deaths 318.
- Sense reading (MIXED): flees read desperate ("Daniyar is past holding —
  they run while running still works," after one 77-damage hit to 22 HP).
  Deaths read as silent arithmetic: Brian Otieno dies round 2 to two
  51-damage hits with no death line or reaction, while his mustered ally's
  line is "Boris stood the rear through it, watching the treeline behind
  them." The joined-ally fight (Antonella shouts, Ngāwai charges in,
  strikes once for 4, leader flees) reads as people with a payoff the
  engine cap won't deliver.
- Instrumentation honesty: the first pilot run had a wrong column — the
  wrapper read the live monster's HP after the fight for mHpStart (returns
  end HP). Caught by cross-checking against diag meetings, fixed (pre-fight
  snapshot), corpus fully re-run; the re-run reproduced trajectories
  exactly, and wrapper↔diag now agree 67/67 on mHpStart/mHpLeft (one
  apparent mismatch was a join key colliding on two same-day Zenon-vs-herald
  fights, a chained wounded beast). All evidence numbers are from the
  corrected corpus.

Worker commits (rebased onto master): 10103bcad prereg, 46e446eea sweep +
analyzer + proof, 7a7823fac wrapper fix, 280b6a89c pilot corpus + evidence.
Evidence: evidence/2026-11-01/sim-wave4leth-a.md, prereg
evidence/2026-11-01/sim-wave4leth-a-prereg.md, corpus
evidence/2026-11-01/sim-wave4leth-a/.

## Arm sim-heraldplace-a (worker tip rebased, merged --ff-only; proof 228/228
## on merged master; diff guard zero src/js): DIAG-GO

Band: 95301–95308 (fixed in prereg), contact-gated pilot. Contact gate
PASSED, so this is a finding, not INSUFFICIENT-DATA. No confirm band run
(none pre-authorized).

- Lair (6/6 located seeds): every lair is 3–4 tiles east of Haven — (7,4)
  on 95301/95304, (7,3) on 95303, (8,4) on 95305/95306/95307 — with the
  scholar standing at Haven (4,4) at every placement. That is the `+3 east`
  placement rule plus nearest-free-tile (the two creek lairs are (7,4) being
  unavailable that morning). Tile types: forest_floor x4, creek x2. No seed
  places a second lair.
- Movement is a symmetric random walk, not seeking: on located-but-unfaced
  seeds, 320/390 wander steps sit still and approach (35) exactly equals
  retreat (35). Pooled: 440 sit / 45 approach / 48 retreat over 533 steps.
  No steering toward scholar, Haven, or villagers on any seed — and the code
  agrees (uniform random adjacent step, no target read).
- It does NOT sit on its lair: max displacement from lair is 7 (95301) and
  9 (95307) — 95301 spends 19 dawns at (6,8) on the south edge — yet minimum
  distance to Haven stays 3–4 on every unfaced seed. Roaming widely and
  never coming near Haven are both true.
- Contact requires a shared tile, and only one seed got one: all 29 scholar
  contacts on 95304 happen with scholar tile == herald tile (25 at (4,4),
  4 at (3,3)), all refusals. The Herald arrived at the Haven tile (4,4) for
  dawns 160–168 with ZERO wander steps into (4,4) in the whole corpus —
  wander cannot step onto a safe tile, so the arrival was a non-wander move;
  follow re-entry (game.js:12651) is the only code path that moves a monster
  onto the scholar's new tile without a safe-tile check. Flagged honestly
  as the named candidate, not a wrapped proof (this instrument didn't wrap
  the follow path). The villager channel is doubly closed: 0 NPC-on-Herald-
  tile ticks out of 390 villagerMonsterTicks on unfaced seeds, and 0 NPCs on
  the Herald's tile at any located dawn (NPC nodes cluster 1–6 tiles around
  Haven). On 95304, 5 such ticks yield exactly 1 villager contact (day 180,
  chen_wei, vFlee).
- Trap documented: the "pads into the clearing" needle fires for EVERY world
  monster and names zero Heralds in this corpus — pads counts must never be
  quoted as herald arrivals.
- Contact screen counts (per #1611/#1612): pool 8: won 1/8 (95308, day 99 —
  not day 90), won exactly day 90: 0/8, survived un-won past day 120: 3/8,
  located 6/8, located-but-unfaced 5/8 (windows 50/16/5/9/28 days),
  contacted 1/8 (95304, 30 = 29 scholar + 1 villager), never-located 2/8.
- Mustercall-b generalization: NO second observation. On contacted seed
  95304: muster verbs 0 (no call sounded), refusal snapshots 29,
  hypothetical yield at contacts 0/2/4 — never reaching 5, 9, or ceiling 10.
  This is a second-seed non-generalization, not a contradiction of 85106
  (different stack: leadfeast vs tableseat-nowait, different coalition
  yields). No routing built; #1538 still pending.
- Neutrality leg on 95304: OFF vs ON end fields identical (181d survived,
  global nat1 table0 won0 wave4). Determinism leg: 95304 ON re-run
  reproduces the judged JSON byte-identically.

Worker commits (rebased onto master): ed220f271 prereg, e30c106c7 sweep +
lib + analyzer + proof, 2c152ba50 evidence + analysis + corpus (plus the
pre-pivot muster commits 62388d84c and earlier on the same branch, listed
in the pivot section above). Evidence:
evidence/2026-11-01/sim-heraldplace-a.md, prereg
evidence/2026-11-01/sim-heraldplace-a-prereg.md, corpus
evidence/2026-11-01/sim-heraldplace-a/.

## Village assessment, in plain words

Two pictures that fit together. First, the village's fighters cannot hurt a
healthy wave-4 beast at all: in 65 fights they never seriously wound one,
the leader dies a quarter of the time, everyone else flees by round 2, and
the one ally who ever joins is never even hit — the fight engine fields
two people at most and then gives the second person nothing to do. The
village is fed (median pantry 9,350 kcal on fight days), armed, and armored;
hunger is not why it loses. Second, the titan the village would need to
face to climb is placed a short walk east of home and then wanders at
random, never steering toward anyone — so the whole climb waits on one
seed's accident (a shared tile on 95304) while five located Heralds sit
unfaced for weeks. The wall is not one missing number. It is a fight the
village cannot win plus a meeting that almost never happens.

## Wall numbers this run

- Wave4leth band: wave-4 reach 6/8, wave-5 reach 0/8, won 1/8, nationalEver
  5/8, table 3/8, median survival 180d.
- Heraldplace band: contacted 1/8, located 6/8, won 1/8 (day 99).
- Wall UNCHANGED: full seat 0 / wave 5 reached 0 stand as last measured
  (Loop A lane). Neither band shows a full seat or a wave-5 fight.

## Telemetry deviation check (coordinator)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-01/sim-wave4leth-a/s7510*.json' --metrics
national,table,wins,exiled --sweep-rows`:
wall: nationalEver=5/8 nationalFinal=3/8 table=3/8 entered=1/8 won=1/8
(8 seeds, 0 non-row files skipped).
LOUD lines (2): table swung -81% (baseline 16 -> current 3); wins swung
-94% (baseline 16 -> current 1).
Verdict: REGIME ARTIFACT, investigated, baseline NOT rolled. The baseline
is the winseat full-win-stack regime (national 12/16, table 16/16, wins
16/16) and its own note forbids comparing other substrates against it; the
current corpus is the sortiedpr PLAYED band, a different policy/substrate
where wins are structurally low. National did not fire LOUD. The
heraldplace corpus was not fed to telemetry-check: it is a position
instrument, not per-seed telemetry rows (same precedent as the 1235Z
titangate refusal).

## Metric review

Pre-registered DIAG bars were met on both arms (wave4leth: >= 8 fought
wave-4 fights, 100% end-state classification — actual 65; heraldplace:
contact-gated pilot, lair + daily positions on 100% of located seeds,
movement classified on every tracked day — actual 533 steps). No metric
was re-scored mid-run. One metric note for the NEXT run: the wave4leth
prereg's slice-concentration metric is unusable at n=1 — future lethality
arms should pre-register corpus-wide shares as the primary concentration
metric, with slice concentration only if the slice reaches n >= 5.
No panel compare was produced and none is claimed: both arms are DIAG-only
censuses, and §15's before/after instrument applies to interventions, of
which this run has none.

## Blanks filled or documented

Filled (measured, DIAG-GO): (a) wave-4 lethality decomposition — end-state
shares, per-role death, stay/flee rounds, damage concentration, engine cap;
(b) Herald placement vs wandering — lair rule, symmetric random walk, no
steering, shared-tile contact requirement, follow re-entry as the named
arrival candidate; (c) muster-structurally-zero replication on a fresh band
(95301–95308, 0 calls, 0 blades).
Documented (open, not chased): (1) staying/morale arm, sharpened — must
produce round-4+ fights where the party survives (current max round 3,
death median round 2: fewer flees alone converts flees to deaths), beat
median DPR 11.0 by ~3.6–5x toward 40–58 sustained, and convert at least one
>= 91-HP fight; the never-hit ally and never-firing volley are free
damage/tanking left on the table; (2) ammo sub-blank — bows carried with no
arrows on 24/65 fights; (3) field-death narration blank — no death line;
(4) Herald arrival path — wrapped proof of the follow re-entry candidate
(game.js:12651), not a routing build; (5) #1538 steve-call still pending
(route on refused face? re-sound after a lost muster-fight?); (6) muster
yield generalization — 95304's 0/2/4 vs 85106's 5/9/ceiling needs a third
contacted seed, and the stack difference (leadfeast vs tableseat-nowait)
is unexplained; (7) #1619 late wave-4 + fast lesser win and #1595 Herald HP
drop remainder (350) remain open, untouched by this run.
Findings-backlog appends: the ammo and death-narration blanks above are
recorded here in the evidence; the backlog file itself is appended
separately by the coordinator (see run note).

## Incident notes

- Pre-flight false dirty: at run start the main tree showed a staged
  deletion + untracked copy of Loop B's just-committed evidence file
  (commit 32279c069 landing at 14:13:54Z). A re-check seconds later showed
  the tree clean — the status was read mid-commit. No repair was needed
  and no sibling file was touched.
- Registration lock contention: the second worktree registration queued
  ~15 min behind a sibling journey-deepening registration (registry lock +
  slow git reset under load from a sibling endgame probe). Both trees
  eventually registered and heartbeated; no tree was shared.
- Master moved twice during landing: Loop B's dipslide-confirm merge, then
  its coordinator evidence. Both worker branches were rebased in their own
  worktrees (clean, no conflicts) and proofs re-run on the rebased tips
  (wave4leth 8/8, heraldplace 228/228, muster 32/32 with corpus legs)
  before --ff-only merges. Merges verified alone before any chained
  release/remove step, per the 1235Z lesson.
- Safe-commit index clobber struck both workers' commits and was repaired
  each time via --add --cacheinfo from HEAD blobs; all commits verified
  correct, both worktrees clean at release, main tree clean after merges.
- No `check.js --quick` claim is made: arm proofs are the run's
  verification and are green on merged master.

scale-onramp stays converging (NOT converged): the fight mechanism and the
titan-meeting mechanism are now both decomposed, but no game change landed
and no wave-5 or full-seat reachability is shown. food-economy untouched
(sibling Loop B lane).

Coordinator evidence: evidence/2026-11-01/sim-scale-onramp-round-1415.md
(this file). Claim deleted; lock deleted. Merged locally, pending ship.
