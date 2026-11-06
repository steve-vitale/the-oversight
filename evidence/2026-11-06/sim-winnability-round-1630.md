# Winnability round 1630 — partydamage NO-GO pilot + pyrrhic GO (Loop B, 2026-11-06)

Run: fleshout-loop-b-20261106T1630Z, axis scale-onramp / winnability chain.
Loop A live at run start on its 1515Z claim (sim-baseline9-a +
sim-congtrace-a, diag-only on committed corpora) — NOT touched; Loop A
closed out mid-run (coordinator evidence c9df669e0: baseline9 DIAG-GO +
congtrace DIAG-GO) and its trees were released — NOT touched. The main
session had already closed out the 1430Z run (tracker entry written,
lock + claim deleted, gate check 283/7 passed, coordinator evidence
committed) — this run started on a clean main tree. No gate / price /
deed / readyDemand change in either arm. Arm 1 is policy-only
(scripts/policies/* + instruments, zero src/js); arm 2 is
instrument-only (scripts only, zero src/js) — non-overlapping, shared
one run.

## Outcome: 1 arm NO-GO (record merged) + 1 arm GO (merged locally pending ship)

- sim-partydamage-b — NO-GO pilot (merged f1c1e199c: prereg f34c62411,
  build 3a664d955, evidence f1c1e199c). Policy NOT adopted; it lands as
  a default-OFF record instrument only (see the landing note).
- sim-pyrrhic-b — GO (merged c8a95e102: prereg f802475c8, fix
  c8a95e102). Findings #1811/#1822 marked [fixed].
- Proofs on rebased tips: test-partydamage-20261106.js 49/49,
  test-pyrrhic-20261106.js 52/52, test-fightinterior-20261106.js 33/33
  (regression).

## Arm 1 — partydamage: NO-GO (the fight-policy half is spent)

Evidence: evidence/2026-11-06/sim-partydamage-b.md (+ prereg).
Fresh band 87001–87008 (verified fresh), competent baseline vs
party-damage policy, 150d death-aware. Pre-registered GO: wave-4 TB
kill rate ≥10%.

Armed 2/24 = 8.3% vs the 10% bar and 10.0% baseline (3/30) on
identical seeds — NO-GO, no re-scoring. Guards held (median survival
84.5d vs 92.5d baseline, ≥82.5d bar; starvation 0 both legs). The
lever worked mechanically and still lost: scholar strikes median 5×
per fight (baseline 1.5), moves 7 total band-wide (baseline 100 —
flee-walks nearly gone), damage/round 20.5 → 30 (+46%), beast HP left
81% → 50%. But the race needs ~28 rounds vs ~6.5 survived. The P3
cascade fired only 9× in 24 fights (patient_aim 4, rage 4, war_cry 1;
freeze_tag/hogtie never) — scholars rarely hold the abilities.
Best rounds ARE repeatable joint-fire (ally in 15/22 lost fights,
median best 55.5) but only ~7% of entry HP each; ceiling re-sized
33.3%, the same fantasy as the staged 35.3%. One kill was a companion
kill by Sanne on 87008 d102 (allies dealt 431/594); the other, Nadia's
Influencer kill, was fought d117 but logged d118 — the recorder
called it 'rout' (midnight span; same-day-matched rate reads 4.2% vs
the judged log-based 8.3%). Five scholars died in one day on 87008
grinding one Reunion 1,825 → 41 HP with no kill. Field fights: 13 per
leg, 0 kills both. Wave 5 opened once, baseline leg only; readiness-5
days 4 baseline / 0 armed; living wave-4 killers at end 0 both.

LANDING NOTE (coordinator decision): the whole branch merged,
including scripts/policies/competent-partydamage-b.js. The policy is
inert by default — verified on the branch that nothing outside its
own driver and proof test references it — and it lands as a
default-OFF record instrument, not as an adopted lever: the corpus
cannot be regenerated without it, and a future arm combining
party-damage with a survival lever needs it as a leg. This follows
the stageally precedent (a NO-GO policy landing as a reusable
instrument baseline), not the hold-b subset pattern: hold's policy
was dead code with no future leg; this one is the measurement's
other half. The evidence file states the NO-GO plainly; do not cite
the policy's existence as adoption.

## Arm 2 — pyrrhic: GO (fight-level kills now match the log)

Evidence: evidence/2026-11-06/sim-pyrrhic-b.md (+ prereg).
Route (b) per the prereg: closeTrace in the fightinterior recorder
reads waveKillLog at close time. Zero src/js. No new seed band
consumed — deliberate reuse of the committed fightinterior corpus
(51001–51008); no judged re-run.

GROUND-TRUTH CORRECTION (verified from the corpus before the prereg):
the brief said "2 of 9 kills are pyrrhic." The census says the two
undercounted kills are different shapes: only 1 is a true
pyrrhic-path kill (51005 staged d65 Reunion by greta_hansen —
log-only, recordPyrrhicKill bypassing recordWaveKill); the other
(51002 baseline d80 Strike by grace_obi) IS in killsLive — its miss
is the kill-logged-but-never-closed shape (trace never closed through
tbEnd, beast at 0 HP, killing-blow verb row lost). The fix covers
both with one mechanism; route (a) alone could not have fixed the
second. Results (preregged GO, all hold): baseline fight-level kills
2 → 3 (log 3), staged 5 → 6 (log 6), total 7 → 9 (log 9). Greta →
`pyrrhic-kill`, grace → `kill-unclosed` (both unambiguous, 1 match
candidate each); the other day-65 Reunion trace correctly stays
`scholar-death` (killer-in-fighters guard). `unfinished` split by
`unfinishedKind` (village-died / dissolved / horizon) — zero live
instances on this band, fixture-proven. `routed` → `rout` fixture
added. Unclassified 0, ambiguous 0.

OPEN DIAGNOSTIC (not this arm's GO): why the 51002 kill's fight never
closed through tbEnd is still unexplained at the engine level — the
corpus proves the shape, not the interleave site. Recorded in the
arm evidence's metric review.

## Wall (both arms, pooled)

Wins 0 everywhere; national 0; table sittings 0; wave-5 kills 0.
Partydamage band: wave-5 unlocks 1/8 baseline (87006, standing 305)
/ 0/8 armed; readiness-5-ready days 4 baseline / 0 armed; living
wave-4 killers at end 0/8 both legs; median survival 92.5d baseline /
84.5d armed. Pyrrhic verification restates the fightinterior wall
(wins/national/table 0/8 both legs, wave-4 unlocks 5/8, median
survival 85.5d/105d) — the kills already happened; only the recorder
sees them now. The wall is still wave-4 kills + killer survival, now
with the fight-policy half measured twice over (solo P3 NO-GO by
arithmetic, party P3 NO-GO by pilot): the party needs ~28 rounds and
survives ~6.5.

## Sibling context (not this run's work)

- Loop A 1515Z closed out mid-run (c9df669e0): sim-baseline9-a
  DIAG-GO (9-vs-3 is a fight-conversion gap, not channel crowd-out)
  + sim-congtrace-a DIAG-GO — the 53006-d149 1-round solo
  Congregation kill is EXPLAINED: a wanderer-cast spawn at 20 HP
  (src/js/game.js:24384 passes a bare {id, veteran} to
  spawnWorldMonster). The 1-round shape was a wounded entry, not a
  one-shot. Finding appended by Loop A (wanderer-cast monsters spawn
  at 20 HP); whether a spawn-shape fix is warranted is a design
  question, not a Loop B arm.
- Steve 2026-11-06 11:48 CST added to MEMORY.md: REWARD ALL PATHS,
  NOT JUST KILLING — the self-improvement drive must reward every
  path (forager, crafter, talker, explorer), roles differentiate by
  personality, measured by role formation across ALL five tracks, not
  kill counts alone. This corrects any combat-only framing of the
  drive. It governs Loop A's next run (already registering trees);
  this run's arms were already in flight and are unaffected.

## Telemetry deviation check

Both corpora REFUSED recorder-corpus input (all 16 rows carry
top-level anchorCommit, same as every prior killer-chain arm) — no
LOUD lines, baseline NOT rolled. Balanced panel (§15) inapplicable on
both arms (no Game-root change; policy A/B on identical seeds is the
comparison) — no compare .md fabricated.

## Infrastructure

- Master moved under the run: 99813ea70 → 371486eae (Loop A
  baseline9) → 1e8db620d (journey-succession r146 + batch-ship bump
  b62ac120c) → c8a95e102 (pyrrhic merge) → f1c1e199c (partydamage
  merge). Both branches rebased clean onto the explicit master SHA
  (pyrrhic 2/2, partydamage 3/3, no conflicts, no stop-at-pick
  quirk); proofs re-ran green on both rebased tips. Local master
  verified ahead of origin/master before merging (1e8db620d contains
  b62ac120c).
- Registry-lock contention at run start: a sibling reaper held the
  flock ~10 min on a `git status` in the 9.1 GB / 80,335-file
  journey-establishment tree (slow, not stuck); my duplicate reaper
  was killed as redundant (it held no lock — blocked on flock) and
  the sibling reaper finished normally. Registrations took ~5.5 min
  total. The journey-establishment tree has since been released by
  its owner.
- First pyrrhic proof re-run on the rebased tip was SIGTERMed with
  zero output (no OOM, no leftover process, cause undetermined);
  re-ran with output to files — 52/52 + 33/33 green. No recurrence.
- Safe-commit index clobber hit on all worker commits (both arms);
  repaired via HEAD-blob cacheinfo each time, commits verified
  correct, trees clean.
- check.js --quick NOT re-run by the coordinator: pyrrhic's worker
  ran it twice on its tree (283/7, identical, all pre-existing base
  failures); partydamage is policy + instruments with zero src/js
  and its 49/49 proof is green on the merged tip. The standing
  283/7 profile was just recorded by the main session's 1430Z gate.

## Convergence

scale-onramp / winnability chain: converging, NOT converged. The
party-damage lever is spent and the pyrrhic undercount is fixed —
but wins are still 0 everywhere, wave-5 kills still 0, no seed banks
two living wave-4 killers and sits. Next blanks, in order: (1)
survival time — the co-lever the partydamage prereg named: armor /
mitigation that lets a scholar stand 15+ rounds against wave-4
damage is a balance lever (game code), not a fight policy; the
fight-policy half is exhausted for now; (2) abilities reaching
villagers — the cascade fired 9× in 24 fights because the hands are
empty (main session's ability-use follow-up); (3) midnight-spanning
kill matching — match kills across the midnight boundary (fight day
± 1) in the next recorder (finding #1828); (4) rage re-presses — a
future variant should not cap rage at once per fight (competent
re-presses whenever winning, 36× baseline vs 4× armed); (5) the
41-HP grind — a lever that finishes a beast at <10% HP is worth
sizing from the field grind (finding #1829); (6) why the 51002
kill's fight never closed through tbEnd (engine-level, pyrrhic open
diagnostic); (7) Loop A's 20-HP wanderer-cast spawn — design
question, not a Loop B arm. food-economy stays converging (NOT
converged): untouched by this run. Claim deleted; lock deleted.
