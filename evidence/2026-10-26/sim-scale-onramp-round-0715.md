# sim-scale-onramp-round-0715 — coordinator evidence (axis scale-onramp)

Run: flesh-out loop A, 2026-10-26, run_id fleshout-20261026T0715Z.
Axis: scale-onramp (converging, NOT converged). Loop B live on
food-economy for the whole run (0630Z claim: fishfallback +
racksvoice-gate, trees registered mid-run) — NOT touched. No B file,
claim, tree, or lock was read for writing, only listed for the guard.

## PRE-REGISTRATION (binding, written before any sim, judged only against it)

- Shared band, trajectory for trajectory: seeds 73671–73678,
  tableseat-nowait substrate (LEANLINKRESCUE=1, TABLESEATNOWAIT=1),
  180d death-aware horizon (runDays stops on death/win; 180 is the
  cap, not a fixed horizon).
- Two arms, each with its own pre-registered GO threshold, one shared
  baseline (the 0126Z authoritative rebaseline table: deaths 260,
  national-ever 6/8, national-final 5/8, table 4/8, entered 4/8,
  wins 4/8 lesser seat only, wave-4 5/8, wave-5 0/8, Arc IV 4/8,
  median 143d, starvation 9).
- Arm 1 sim-natpair-a (instrument): DIAG-GO requires (a) every
  seed-arm's pairing classified, (b) ONE revised rule adopted
  explicitly, (c) the adopted rule reproduces rebaseline
  national-ever 6/8 on a fresh band. Any leg missed = DIAG-NO-GO.
- Arm 2 sim-drawwave-a (recorder): DIAG-GO requires (a) every feast
  draw carries unlockedWave at draw time, 0 unclassified, (b) a
  per-draw appropriateness table (not distribution-only), (c) the
  control side reproduces the rebaseline table or the deviation is
  reported plainly with a recorder-neutrality proof. Any leg
  missed = DIAG-NO-GO, except the pre-registered "or" branch of
  leg (c) (deviation reported plainly + neutrality proven =
  DIAG-GO on the question with a CONTROL DEVIATED flag, per the
  feastdraw-a precedent).
- No metric was re-scored mid-run. Metric doubts are under
  "metric review" below, for the NEXT run. Every evidence file
  carries a metric review section; both arm files do.
- Wall numbers reported every run: national / table / wins,
  wave 4–5 unlocks, median survival.

## RUN NARRATIVE (infrastructure first, because it shaped the run)

- Guard: no loop-A lock at run start; loop-B lock fresh (0630Z,
  06:57Z) on food-economy. A worked scale-onramp, B worked
  food-economy. No stale-lock recovery needed.
- Pre-flight: main tree clean (0 lines), disk 24%, reap done (5
  active sibling trees, all dirty/protected, none removed).
- Container write-denial flap (EPERM on .git/refs/heads/*.lock)
  blocked worktree registration for 30 attempts (07:16–07:40Z).
  No ref surgery was forced; retries only. The flap cleared and
  both trees registered with fresh heartbeats (natpair 07:43Z,
  drawwave 07:47Z). A stray `.git/refs/heads/__flaptest__.lock`
  (not mine, not B's) was left alone throughout.
- A runtime restart mid-run killed the second retry loop's
  session; its effect was verified afterward (registration
  succeeded directly at 07:41Z), nothing re-run blindly.
- Master moved once under the run for arm landing reasons only:
  natpair merged first (72cf7a672 → 3701dfa4a), drawwave rebased
  onto it clean (zero file overlap — both arms added only new
  files), proofs re-run post-rebase, then merged. No sibling
  master move interfered either way. Loop B's trees
  (fishfallback, racksvoice-gate) and a journey-scale tree
  appeared mid-run; untouched.
- Safe-commit index clobber hit BOTH worker commits (staged-as-
  deleted on byte-identical files) — repaired via HEAD-blob
  cacheinfo each time, commits verified correct, indexes clean
  before merge. The coordinator evidence commit below was
  checked the same way (see landing note).

## ARM 1 — sim-natpair-a: DIAG-NO-GO (legs a+b met, leg c missed on a stale anchor)

Commit 3701dfa4a (merged). Proof in-worktree 36/37 post-merge
base; the single failure IS leg (c) itself, deliberately not
weakened to green. Zero src/js diff. Evidence:
evidence/2026-10-26/sim-natpair-a.md +
perseed-sim-natpair-a/ (8 rows + summary).

- Leg (a) MET: 8/8 fresh seed-arms classified, unclassified 0 —
  all class `agree`.
- Leg (b) MET: one revised rule adopted, stated explicitly —
  THE CHECK'S CONDITION is revised, the brief's pairing
  definition is not. Revised check = NEWPAIRED (both sides
  coerced to 0/1 before comparing); national-ever stays
  snap-based, tsNationalDay stays an independent witness,
  pairing = witnesses agree. The old check's `paired` is
  preserved verbatim as OLDPAIRED so the bug stays readable.
- Leg (c) MISSED: fresh-band national-ever is 8/8, not the
  pre-registered 6/8. Binding rule applied (all legs, no
  partial credit, no mid-run re-scoring): DIAG-NO-GO. The miss
  is base drift, not a pairing failure: the fresh band
  reproduces the devotiongate control band EXACTLY on all 8
  seeds and every compared field, so the 8-vs-6 gap arose
  between the 0126Z base and the current base, not in this
  sweep. No re-anchoring was done mid-run to rescue a GO.

The pairing answer (solved, on fresh rows): the old check
compared a NUMBER (nationalEver 1/0) with a BOOLEAN
(tsDay-present true/false) under strict equality — in JS
`1 === true` and `0 === false` are both false, so OLDPAIRED
is false on every seed by construction. Fresh band: OLDPAIRED
false 8/8, NEWPAIRED true 8/8, maxRank agrees 8/8. The
devotiongate 16/16 pattern matches (substantively agree, stored
`paired` false on all 16).

Transient mechanism, located: on all 8 fresh seeds,
postNationalDay == tsNationalDay and preNationalDay ==
tsNationalDay + 1 — national always rises INSIDE base.daily
courtship; the seat leg and post-daily snap catch it that day,
the pre-daily snap only the next day. The transient window is
exactly one night. Overnight falls were observed on 3 fresh
seeds (73671 day 119→120, 73677 day 122→123, 73678 day
136→137) without becoming transients, because national had
already been pre-snapped earlier. No fresh transient seed
occurred, so the `post-explained-transient` class is
mechanism-supported but not fresh-exercised. The one genuine
transient on record stays driveoff-clean 73673 (tsNationalDay
86, table-invited, snap maxRank regional).

Fresh-band wall (natpair): national-ever 8/8, national-final
5/8, table 4/8, entered 4/8, wins 4/8 (lesser only), wave-4 5/8,
wave-5 0/8, Arc IV 4/8, median 143d, max 180d, deaths 301,
starvation 2. Vs 0126Z: only national-ever (8 vs 6) and deaths
(301 vs 260) deviate, plus starvation (2 vs 9, same flipped
seeds 73675/73676, now winners instead of stalled/dying).

Sense moment (plain words): seed 73678, day 88 it becomes a
realm — the seat leg records day 88, the post-daily snap sees
national that day, the dawn snap the next. Day 136 the game
says plainly the realm came apart. It ends regional, lost,
day 173. Under the old check this seed read MISMATCH; under
the revised rule it reads paired — the witnesses never
disagreed, the check compared a number to a boolean.

## ARM 2 — sim-drawwave-a: DIAG-GO (appropriateness legs) with CONTROL DEVIATED flag

Commit ae6951a16 (rebased onto 3701dfa4a; original 9c877af57).
Proof post-rebase 35/35. Zero src/js diff. Evidence:
evidence/2026-10-26/sim-drawwave-a.md +
perseed-sim-drawwave-a/ (8 armed rows + 3 plain rows + summary).
New recorder scripts/policies/drawwave-diag.js (wraps
drawFeastScavenger, pre/post unlockedWave + cast-pool capture).

- Leg (a) MET: all 28 feast draws on the band carry
  unlockedWave at draw time, 0 unclassified, 0 pool-unknown,
  0 gate-moved (post-call unlockedWave equals pre-call 28/28).
- Leg (b) MET: per-draw appropriateness table, not
  distribution-only — 28 appropriate, 0 early, 0 impossible.
  Every drawn monster was inside its pre-call cast pool; no
  draw wave ever exceeded the unlocked wave. Pool sizes:
  uw1 → 25, uw2 → 40 (25+15), uw3 → 49 (+9), uw4 → 58 (+9).
- Leg (c) via the pre-registered "or" branch: the control side
  did NOT reproduce the 0126Z table — deviation reported
  plainly with neutrality proof (below). Per the feastdraw-a
  precedent this is DIAG-GO on the question with a CONTROL
  DEVIATED flag, not a silent re-baseline.

Wrapper discipline (proven before any number was judged):
detgate PASS on 73671 (recorders OFF = baseline, 160/160
days, no diag surface, no wraps installed), and armed ==
plain on every trajectory field for 73672, 73678, plus 73677
(checked because its death count differed from rebaseline).
The recorder moves nothing.

Control deviation (base drift, not recorder): band vs 0126Z —
wins 4=4, national-final 5=5, table 4=4, entered 4=4, wave-4
5=5, wave-5 0=0, median 143d=143d, BUT deaths 301 (260, +41),
national-ever 8/8 (6/8), starvation 2 (9), raids 91 (85),
raiders 404 (352), pool 1,346 (1,527). Every seed moved on at
least one field. Candidate cause, stated as UNPROVEN: the
only src/js delta between the rebaseline base (8ea64d848) and
this base is journey-landing r54 (conversation.js winddown
grace beat) plus the version stamp — a bisect arm must confirm
or kill it before anyone tunes against this band. The 0126Z
table is stale for the second time in two days.

Wall (drawwave band): national-ever 8/8, national-final 5/8,
table 4/8, entered 4/8, wins 4/8, wave-4 5/8, wave-5 0/8,
Arc IV 4/8, median 143d, max 180d, deaths 301, starvation 2 —
IDENTICAL to the natpair band on every wall field. Two
independent instruments, same band, same 301 deaths: the drift
claim is cross-validated, not a single-instrument artifact.

Plain-words answer: the feast draw never cheats upward. The
0017Z distribution (mostly low waves) was villages drawing
what their wave allowed, not a targeting failure. When a
village had earned wave 4, the smoke drew wave-4 beasts — 3
draws, 2 kills, all on 73671 — and that village still died on
day 160. Fair draws are a mirror of where the village stands,
not a ladder.

Sense moment (plain words): 73671, day 90 — standing 147,
Mirror Draft open, the feast's smoke draws a Congregation;
the scholar walks out alone at full health against 1,099
health of faith-as-weapon and kills it. Day 97 draws a Strike
and kills it; day 104 draws a Suburb at 66 health and loses.
Earned beasts, fairly drawn, including the fight it could not
win.

Caveat (worker's own): two backgrounded sweep sessions
returned empty stdout with automatic-delivery completion; both
rows were verified on disk (file present, fields read) before
being cited, recorded in the arm's metric review.

## WALL (this run's judged corpora, 16 configs, same band twice)

National-ever 16/16, national-final 10/16, table 8/16, entered
8/16, wins 8/16 (lesser seat only), wave-4 10/16, wave-5 0/16,
full seat 0/16, Arc IV 8/16, median 143d, deaths 301 per band.
New shape worth naming: villages now reach national (8/8)
yet still die more — scale-and-die, not fail-to-scale.

## REACHABILITY VERDICT

- Waves 1–4: reachable (wave-4 5/8, draws + kills observed).
  Wave 5: zero births, zero pool presence — still decoration
  on this band; the wall still binds at veteran formation and
  wave-5 eligibility.
- Regional → national: reachable 8/8 (up from 6/8 on the stale
  anchor — the rise itself is the drift to bisect, not a lever
  claim).
- The table: reachable 4/8, entered 4/8. The win flag:
  lesser seat only, 4/8. Full seat: unreached.
- Arc IV: reachable 4/8. Arc II/III: reached on the band
  (Arc IV implies the chain); the deed question behind Arc IV
  is settled (deedtest: the deciding deed is feast-spend,
  feastSurgeUsed, not a faced-only counter).
- Vests: not re-measured this run (no vest arm; prior
  reachability stands, no claim changed).

## VILLAGE ASSESSMENT (plain words)

The village this run looks like a place that learned how to
become a realm and then came apart anyway. Eight out of eight
villages reach national — the granary opens, speakers ride in
and call it a realm — and half still lose, half win through
the lesser seat, nobody through the full seat. The feasts are
honest: the smoke draws only beasts the village has earned
the right to meet, wave for wave, and the village still loses
the fight it cannot win. The old argument about whether the
scoreboard was lying is over — the scoreboard had a
type-mismatch bug (a number compared to a yes/no), now fixed
and readable, and the witnesses agree. What is NOT settled is
why the same villages now die 41 more deaths than the same
band died two days ago. Something between the old base and
this one moved the ground. That is the next job, not another
lever.

Villagers act like people on the reads: Min-kyung repeats
"realm" to hear how it sounds; the realm's dissolution is
announced in plain language ("no polity answers to Haven
now"); the scholar walks out alone against impossible odds
and the loss reads as a fight, not a number. No robotic,
static, or repeated villager behavior was flagged this run
beyond the already-open narration blanks (defender-fight
boilerplate, wait-line repetition — carried, not re-judged).

## BLANKS FILLED OR DOCUMENTED

Filled (measured, not mysterious):
- National-pairing check condition (number-vs-boolean strict
  equality) — solved, revised rule adopted (NEWPAIRED).
- UnlockedWave at draw time — solved, 28/28 appropriate.
- Transient mechanism (one-night window, courtship-internal
  rise) — located; fresh transient still unexercised.

Documented (evidence, next arm owns them):
- 0126Z table stale a second time (deaths 260→301,
  national-ever 6→8) — bisect candidate: journey-landing r54
  conversation winddown grace beat. Do NOT tune against the
  old band, do NOT re-judge these corpora against it.
- Telemetry-checker field-shape gap (below) — the checker
  reads panel keys recorder rows don't carry.
- Carried, untouched: wound-closure pricing paper, then Steve
  ruling on met-below-line finishing (defender-finish stays
  KILLED); field-fight position trace (echodraft next); melt
  ruling for Steve; defender-fight narration boilerplate;
  wait-line repetition; sheltered-holder counting (loop B's
  axis, not touched).

## TELEMETRY DEVIATION CHECK (run per the body, judged honestly)

Ran node scripts/telemetry-check.js against the WINSEAT
baseline (national 12/16, table 16/16, wins 16/16) on both
corpora. Result: exactly 3 LOUD lines on EACH corpus —
national 12→0, table 16→4, wins 16→0. All three are
INGESTION-SHAPE artifacts, not deviations: the checker reads
top-level `national`/`wins` keys that recorder rows do not
carry (rows carry `nationalEver`, `won`, `table`), so it
counts 0 by default; `table` matches (4) only because that
key happens to exist. Actual values on both corpora:
national-ever 8/8, wins 4/8, table 4/8. Baseline NOT rolled.
This confirms the standing 1027Z exception (recorder rows
are not panels) for the ninth time — future runs should not
re-litigate it without a regime-matched baseline.

## BALANCED PANEL + CHECKS

- Balanced panel NOT run as a compare: the panel cannot
  ingest recorder corpora (ninth sighting class);
  sweep-compare tables in the arm files are the comparison
  of record. No panel inputs fabricated.
- check.js --quick NOT re-run: zero src/js in both arms;
  standing 279/8 pre-existing profile; both arm proofs green
  on merged master (natpair 36/37 with the single failure
  being leg (c) itself, drawwave 35/35).

## METRIC REVIEW

- No metric was re-scored mid-run. Natpair leg (c) was judged
  NO-GO against its pre-registered 6/8 anchor even though the
  pairing question itself was solved — the binding rule held.
- Revision proposed for the NEXT run (not applied here):
  anchor any rebaseline leg to a freshly re-baselined
  authoritative table on the run's own base (or pre-register
  it as "reproduces the current-base control band" with 0126Z
  as comparison only). The 0126Z anchor must not be reused as
  judge after two drift events.
- Future summaries should print NEWPAIRED as the label of
  record; OLDPAIRED stays only as the preserved bug witness.
- A future arm needing a fresh transient should use the
  driveoff-clean arm shape plus the post-daily snap.

## LANDING

- natpair: commit 3701dfa4a, ff-only merged, proof 36/37
  re-run in-worktree, tree released done-merged, branch
  deleted, main tree clean.
- drawwave: commit 9c877af57 rebased onto 3701dfa4a as
  ae6951a16 (clean, zero overlap), proof 35/35 post-rebase,
  coordinator evidence committed on the same branch below,
  ff-only merged, tree released done-merged, branch deleted.
- Merged locally, pending ship. No push, no version bump, no
  live verification — the batch ship job owns those.

## NEXT BLANKS, IN ORDER

1. Journey-landing r54 bisect for the 0126Z→current drift
   (deaths 260→301, national-ever 6→8) — confirm or kill the
   winddown-grace candidate before any tuning.
2. Fresh-transient arm (driveoff-clean shape + post-daily
   snap) to exercise the post-explained-transient class.
3. Wound-closure pricing paper, then Steve ruling on
   met-below-line finishing (defender-finish stays KILLED).
4. Field-fight position trace (echodraft next arm).
5. Melt ruling for Steve.
6. Defender-fight narration boilerplate + wait-line
   repetition (sense arms, not numbers arms).

scale-onramp stays converging (NOT converged): two
measurement blanks are now settled truth and the wall's new
shape is scale-and-die, but the drift behind it is
unbisected, the full seat is still unreached, and wave 5
still has zero births. food-economy stays converging
(untouched; sibling loop B). Claim deleted; lock deleted.
Evidence: evidence/2026-10-26/sim-scale-onramp-round-0715.md
(coordinator) + sim-natpair-a.md + perseed-sim-natpair-a/
(3701dfa4a) + sim-drawwave-a.md + perseed-sim-drawwave-a/
(ae6951a16). Merged locally, pending ship.
