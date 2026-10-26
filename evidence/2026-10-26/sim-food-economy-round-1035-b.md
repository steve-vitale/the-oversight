# sim-food-economy-round-1035-b — coordinator evidence (loop B, axis food-economy)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1035Z.
Axis: food-economy (second non-converged axis; scale-onramp untouched, no live
sibling claim at run start). Loop A was free at run start, so no race-guard
wait applied. Master at run start be8541647; sibling journey landings moved
master twice during the run (journey-deepening r51, Lane B social r55
adoption) — zero overlap with either arm, handled by a clean rebase (below).

Arms (2, pre-registered up front against the 0935Z run's named next blanks):
- sim-plainvoice-b — DIAG-GO, LANDED (commit 5baba2168 after rebase).
- sim-racksfreeze-b — PILOT NO-GO, KILLED at pilot, branch deleted per the
  killed-arms-leave-no-trace rule. Its numbers are preserved here; its proof
  was verified green (191/0) before the branch was deleted.

## Arm 1 — sim-plainvoice-b (DIAG-GO, landed)

Question (0935Z blank 2): plain cook lines could not be split from text alone
(221 plain of 370 on seed 9757 in one byte-identical frame). This arm splits
them AT THE SOURCE, tagging each plain frame at emit/capture time with its
engine context. Zero src/js, zero default flips.

Pre-registration (binding): pilot band seeds 9750-9757, policy leadfeast, pd0,
dg1, 100d death-aware horizon, SAYCAP>=1000. Neutrality (cap0-vs-cap1 numerics
identical) proven FIRST, before any classified number was judged. DIAG-GO iff
>=95% of plain lines classified, UNCLASSIFIED <=5%; extend to 16 seeds only if
UNCLASSIFIED >5%.

Results (fresh re-sweep on current master, coordinator-verified):
- Neutrality: cap0 vs cap1 numerics identical on 8/8 seeds.
- Coverage: 900 plain lines, 0 UNCLASSIFIED — 100.00% (bar >=95%). The
  16-seed extension did not trigger.
- Proof: scripts/test-plainvoice-b.js 102 PASS / 0 FAIL on branch, post-rebase,
  and on merged master.
- The split: P-SILENCED 483 (53.7%) — racks full + about-to-rot surplus
  present, but the day's first complaint already spoke, so gate B swallowed it
  into the plain frame; P-RES2PLUS 215 (23.9%) — 2nd/3rd(+) resolution, racks
  not full, nothing smoked; P-FIRST-NOSMOKE 202 (22.4%) — first resolution,
  racks not full, nothing smoked; P-RACKS-NOELIG 0 — racks full with no
  about-to-rot surplus never occurs at any cook resolution on this band
  (genuinely empty class, not a blind spot); UNCLASSIFIED 0.
- Per-seed plain totals: 9750: 100, 9751: 7, 9752: 31, 9753: 259, 9754: 80,
  9755: 62, 9756: 56, 9757: 305 (231 silenced vs only 68 spoken complaints).
  On 9757 Miguel speaks all 68 complaints across 68 racks-bound days while
  231 silenced lines pile up behind them — gate B's voice-diversity cost, now
  measured in the plain split. Sense coherence holds: every silenced line's
  day carries that day's first complaint in the same seed (0 incoherent).
- Correction to the old framing: the "nothing to smoke" classes are almost
  never "nothing there" — eligible surplus is present on 199/202
  P-FIRST-NOSMOKE and 214/215 P-RES2PLUS lines. The usual story is "dinner
  is already covered by the reserve, so nothing needed smoking," not absence.
  Only 4 plain lines in the band have no eligible surplus. Cook resolutions
  run to 4/day, not "~3x/day". ResolutionIndex stays a recorder sequence
  count, not an engine variable — recorded as a design question, no engine
  tag added (DIAG only).

Village assessment, in plain words: the village's cooks talk a lot about
cooking, but more than half of their quiet lines are actually swallowed
complaints — the racks were full, food was about to rot, and the village
already used up its one complaint for the day, so the cook just quietly
cooked instead. A player reading the stream cannot tell a swallowed complaint
from a genuinely quiet day of cooking. The racks problem is bigger in the
quiet lines than in the loud ones.

Wall (plainvoice corpus, SEATDRIVE=0 so table/wins are construction zeros):
national-or-better 7/8 (9756 global; 9751 village, lost day 31), table 0/8,
wins 0/8, wave-4 reach 3/8, wave-5 reach 0/8, median survival 100d capped.

## Arm 2 — sim-racksfreeze-b (PILOT NO-GO, killed)

Question (0935Z blank 1): gate B fixed same-day duplicates only; frozen
figures still repeat unchanged across days. Candidate rule D: on top of gate
B, a racks-full complaint speaks only when its rounded kcal figure differs
from THAT SAME cook's last spoken racks-full figure (per-cook memory, not the
village-wide memory that killed variant C). Silenced complaints become the
plain frame; say totals unchanged.

Pre-registration (binding): same pilot band/substrate as arm 1, baseline
RE-SWEPT on current master (old 185/404 not cited — fishfallback changed the
substrate). Pilot GO iff ALL: (i) total voice <= 0.80 x B baseline;
(ii) voice-days >= 0.90 x B baseline voice-days; (iii) numerics identical on
every cell; (iv) say totals unchanged; (v) no seed with >=5 racks-bound days
loses all voice. Confirm (12-16 fresh seeds) iff pilot GO.

Results (coordinator-verified via the arm's proof run before branch deletion):
- (i) PASS — D 178 vs re-swept B baseline 230, ratio 0.774.
- (ii) FAIL — voice-days 178 vs 230, ratio 0.774. PILOT NO-GO. No confirm
  spend; no confirm files exist.
- (iii) PASS — numerics identical 8/8 seeds. (iv) PASS — say 1477 both,
  plain 900 -> 952 (+52 = silenced, exact). (v) PASS — worst case 9752 keeps
  12 voices.
- Proof: scripts/test-racksfreeze-b.js 191 PASS / 0 FAIL. src/js/game.js
  verified byte-identical to pre-run state (zero D identifiers) — the killed
  arm leaves no game-code trace.
- C-survival leg: LEG-PASS, independent of the NO-GO. Zero silenced events
  with a figure different from the cook's own last spoken figure; per-cook
  consecutive-equal figures 0; cross-cook same-figure speeches 24 events
  (another cook's figure never silences under D). The C-failure mode is
  absent by construction and in data.
- Sense: kept voice still tracks the village on change days, but 25
  racks-bound days on 9752 go entirely voiceless under D — a player could
  reasonably conclude the racks problem resolved when it hasn't. D is
  locally correct and globally quiet. D spreads voice back across cooks
  (9757 under B is all-Miguel 68; under D it is Miguel 42 + Grace 19).
  Substrate note: the old 9755 frozen case no longer reproduces on current
  master (all figures distinct); 9752 is now the frozen exemplar.

### Metric review (binding for the NEXT run, not a re-score here)

Bars (i) and (ii) are jointly unsatisfiable by ANY one-voice-per-day
successor: under both B and D, total voices equal voice-days (230 = 230,
178 = 178), so the same ratio must be both <= 0.80 and >= 0.90. Stronger:
D attains the change-only MAXIMUM voice-days (a day speaks iff some cook's
figure changed that day; the 52 lost days have zero changed figures, so no
change-only rule, with or without the day slot, can voice on them). Bar (ii)
at 0.90 is unsatisfiable by the entire change-only family on this corpus.
The NO-GO stands; the bars were wrong, not the measurement. The next
change-only arm must pre-register a SINGLE ratio bar (for example voice-days
against a frozen-stretch floor), never two opposing ratios — and must not
re-judge this corpus. A frozen-stretch reminder voice (a voice that returns
after N silent racks-bound days) is an untested NEW design, not a D variant.

Wall (racksfreeze pilot, identical both arms): national 7/8, table/wins 0/8
(SEATDRIVE=0 construction zeros), wave-4 reach 3/8, wave-5 0/8, median
survival 100d capped.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline <scale-wall.json> --current
'evidence/2026-10-26/sim-plainvoice-b-corpus/*.json' --metrics
national,table,wins,exiled`: 2 LOUD lines (table 16 -> 0, wins 16 -> 0).
Both are the known regime/ingestion artifact class: the corpus is a
SEATDRIVE=0 competent-only substrate (table/wins unreachable by
construction), and recorder rows do not carry the checker's top-level
table/wins keys the way the WINSEAT baseline does. Actuals: national-or-
better 7/8, table 0/8, wins 0/8. Baseline NOT rolled. No investigation item.
(The racksfreeze corpus is not on master — killed arm, branch deleted — so
no second telemetry run was possible or needed; its wall numbers above are
identical in shape.)

## Balanced panel (§15)

Attempted by both arms, honestly not attached: scripts/balance-panel.js runs
its own sims and cannot ingest recorder corpora (same failure class as all
prior recorder runs). No panel inputs fabricated. The paired identical-seed
tables (cap0-vs-cap1, B-vs-D) are the comparison of record.

## Infrastructure

- Master moved twice under the run (journey-deepening r51, Lane B social r55
  adoption); plainvoice rebased clean in its own worktree, proof green after
  rebase and on merged master (102/0). No EPERM flap blocked this run;
  registration/release flock waits ran minutes (sibling-loop contention),
  not failures.
- Safe-commit index clobber hit both worker commits — repaired via HEAD-blob
  cacheinfo each time, commits verified correct before merge/deletion.
- check.js --quick NOT re-run by the coordinator: zero src/js landed, and
  the racksfreeze worker recorded the standing 279/8 pre-existing profile on
  its (reverted) tree. Nothing in this run changes that profile.
- Plainvoice merged --ff-only as 5baba2168 (rebased from 1aece4603); verified
  ancestor of HEAD; main tree clean after merge. Racksfreeze branch deleted
  (was 626996155); plainvoice branch deleted after merge (was 5baba2168).
  Merged locally, pending ship — no push, no version bump, no live check.

## Blanks filled or documented

Filled: plain cook frames are now split at source (900/900 classified);
the cross-day frozen-figure question is now measured (D: 178 vs B 230,
change-only maximum, NO-GO on the voice-day bar with the metric failure
diagnosed, not hidden).
Documented (next blanks, in order): (1) frozen-stretch reminder voice design
— untested, needs its own pre-registration; (2) cook-diversity as a primary
metric for a future voice arm (9757 all-Miguel -> Miguel + Grace under D);
(3) plain-silenced indistinguishability — a player cannot tell a swallowed
complaint from quiet cooking; (4) P-RACKS-NOELIG measured empty on leadfeast
only, unmeasured on leaner policies; (5) trust-0 checkObedience + sheltered-
holder counting remain open design questions (steve-call / design, not
taken); (6) away-ration fix remains KILLED at pilot — do not re-try the same
pack-sizing lever; (7) preserver-widening stays refused on its deciding
corpus — do not re-judge.

## Convergence state

food-economy stays converging (NOT converged): two voice mechanisms are now
measured truth (plain split complete, cross-day gate killed with a diagnosed
metric failure), but no new food-economy game-code fix landed from this run
(plainvoice is DIAG-only; racksfreeze is killed), and the scale wall is
untouched by this axis. scale-onramp stays converging (untouched; sibling
loop A). Claim deleted; lock deleted.
