# sim-food-round-1849 — coordinator evidence (loop B, axis food-economy)

Run: fleshout-loop-b-20261025T1849Z (Sun 2026-10-25, loop B, second axis).
Sibling loop A live the whole run on scale-onramp (claim
fleshout-20261025T1815Z, arms sim-oldcore-a + sim-palisade-a) — NOT
touched. A landed mid-run (coordinator evidence a386d8ad2: oldcore
DIAG-GO + palisade beat GO); both B branches rebased clean onto it in
their own worktrees (zero file overlap with A's landings), re-proved,
then merged --ff-only in order. This run worked food-economy
(converging), taking the 1752Z next blanks (1) extend the deathrow
pooled list to the >=300-death scale bar and (2) adopt the inverted
haul predicate as the primary haul measure with first-trace
confirmation — in that order, as two instrument-only arms on
non-overlapping files. No game-code lever landed in this run; both arms
are measurement/instrument work, and that is stated, not hidden.

## Arm 1 — sim-deathext-b (GO, merged 14a69bba1)

Pre-registered plan (binding, judged only against it): tableseat-nowait
ARMED substrate only (LEANLINKRESCUE=1 + TABLESEATNOWAIT=1, wait leg
omitted), 180d death-aware, fresh bands 73751+; pilot band first, then
multi-band; conditional 7th band 73811-73818 ONLY if the six-band
combined total fell short of 300 villager deaths.

- Pilot 73751-73758: 8/8 files with deathRows, kind/flag/cause-missing
  0/0/0, neutrality PASS, 223 rows, 21 villager deaths. Gate passed
  before multi-band spend.
- Six-band combined (40 old + 48 fresh = 88 seeds): 299 villager deaths
  — ONE short of the bar. The conditional 7th band fired exactly as
  written (8/8 files, 202 rows, 0 missing, 24 villager deaths) and no
  further band was run.
- Final combined (96 seeds): 2,806 rows = 1,963 kind-excluded + 520
  scholar + 323 villager deaths, 31 labels. Before/after: existing 144
  -> combined 323 (+179 fresh). Threshold (a) >=300: GO.
- Scope: GO — pool builds with scope {policy "tableseat-nowait",
  horizon 180 death-aware} derived from the corpora.
- Guardrail: GO — matched compare exits 0 with scopeCheck "match";
  mismatched (competent awayration-size-b) exits 2 with SCOPE-MISMATCH
  naming both scopes.
- N: GO, and N MOVES 3 -> 2 — churn band max is 1 (all 20 churn labels
  are single-seed singletons), so N = churnMax + 1 = 2 by the rule, not
  by choice. Histogram stated in the arm evidence. Two caveats carried
  forward: (i) a future arm's genuinely new label at count 2 now flags
  as "new", including a new monster name appearing twice — the
  false-positive class N=3 avoided; (ii) The Big Beast sits at N (2x,
  2 seeds) and matches no entry in monsters.json (72 entries), so by
  the implemented rule it is not roster churn — if a future arm
  classifies it as a monster name by prose, N would stay 3.
- Old baseline untouched: sim-deathrow-b-baseline.json still reads 144
  villager deaths. The extended pool is a new file, not an overwrite.
- Proof: node scripts/test-deathext-b.js — ALL 14 LEGS PASS, including
  determinism re-run and neutrality legs, pre-rebase, post-rebase, and
  on merged master. Zero src/js changes; no jest run (plain node).
- Evidence: evidence/2026-10-25/sim-deathext-b.md +
  sim-deathext-b-baseline.json + perseed-deathext-b/ (56 per-seed
  files; the summary.json covers only the last sweep leg, the 7th
  band — same overwrite pattern as deathrow-b; all 56 files present
  and pooled).

## Arm 2 — sim-haultrace-b (GO, merged bbf29e9c9 + correction 7c26baa20)

Pre-registered plan (binding): Step 1 search ALL committed per-seed
corpora for a first trace of each of the 4 code-proven haul classes;
Step 2 bounded pilot (max 8 seeds, existing haulcount recorder +
inverted predicate, no new tap) only for classes with zero traces, or a
reasoned no-pilot where no policy exercises the class. GO = a verdict
for all 4 classes + an adoption verdict for the inverted predicate.

- Expedition meat: FOUND — 7 files / 9 deposit events in Step 1, plus
  aggregate-label corroboration (contestgrant, rotdiff, draworder
  totals); a sometimes-event (older probes: days 30-151, 70-1,250 kcal),
  gated on a revealed kill, not a staple.
- Buried cache: NOT-FOUND as a trace — many transcript mentions are
  narration only. Reasoned no-pilot: the deposit path is a player
  conversation verb (acceptInvite), which NO sweep policy calls.
- Genesis fruit: NOT-FOUND — appears nowhere except two design .md
  files. Reasoned no-pilot: requires a player verb (plantGenesis)
  that no policy calls, and the player being elsewhere at yield.
- Custom haulLabels: NOT-FOUND — pilot 9410-9417 (leadfeast/pd1,
  100d, TRACE=1) tried for it and found none; the mechanism is
  NPC-autonomous (mapmem carcass haul), so the pilot was a real test,
  not a junk run.
- Adoption verdict: YES — the inverted predicate can be adopted as the
  primary haul measure in the next deciding rot corpus, with 3 items
  still unproven (the two player-verb classes + custom labels at
  first-trace level). Tribute grain stayed in its own bucket in all
  traces (up to 67,000 kcal on one pilot file) and was never folded
  into aid.
- Late correction (commit 7c26baa20, evidence only): the full-tree grep
  delivery fixed narration counts (6 -> 8 files) and added aggregate
  totals; all verdicts unchanged. Proof re-run after repair: 172 PASS,
  0 FAIL.
- Proof: node scripts/test-haultrace-b.js — 172 PASS, 0 FAIL,
  pre-rebase, post-rebase, and on merged master. Zero src/js changes.
- Evidence: evidence/2026-10-25/sim-haultrace-b.md +
  perseed-haultrace-b/ (pilot corpus, seeds 9410-9417).

## Village assessment (plain words)

The villages in these corpora look like villages under pressure, not
spreadsheets. Deaths tell coherent stories at 96 seeds: ambushes kill
early and only early (50 deaths, 47 seeds, all in the first month —
betrayal before trust forms, then it stops); sickness arrives as named
outbreaks that villages remember (one seed loses six villagers across
days 21-62 and never recovers; another is ground down by five sickness
plus four slow wounds across days 11-126); wounds kill late and slowly
(median day 64), the ledger still distinguishing the fight from its
aftermath. The alien presence is a recurring pressure, not one incident
(three "alien" deaths on one seed across days 31, 101, 178). The wave-2
conceptual horrors recur across seeds now — The Callback kills on three
different seeds. On the haul side, day-1 forages land, trappers bring
species-named meat (a new species and a new named village appear on
fresh ground — the same trap lines working on new ground), and tribute
grain arrives as whole stacks of obligation, kept honestly separate
from hauls and aid. Six of eight pilot villages reached national; none
won; one died at day 44. What was missing: a pooled death list big
enough to trust (now 323 villager deaths, N recalibrated to 2) and
proof that the new way of counting hauls catches the rare haul kinds
(now: one caught, three honestly uncaught because no bot ever walks
those player paths). Blanks filled: the >=300-death scale bar and the
haul first-trace verdicts. Blanks documented, not filled: the
away-ration fix itself, still waiting on its own pre-registration.

## Wall numbers (this run's judged corpora, pooled)

- Deathext combined (96 seeds, tableseat-nowait armed, 180d): won
  37/96, national-ever 79/96, national-final 65/96, table 45/96,
  entered 37/96, wave3+ 88/96, wave4+ 53/96, wave5+ 0/96, median
  survival 147.5d, max 180d. Fresh 56: won 21/56, national-ever 43/56,
  table 26/56, wave4+ 30/56, wave5+ 0/56.
- Haultrace pilot (8 seeds, leadfeast/pd1, 100d): national 6/8, wins
  0/8, one death at day 44. Hauls 81,000-181,000 kcal per 100 days.
- Wall shape unchanged: national routine, the table reachable, wins
  real but lesser-seat only on the tableseat substrate, wave 5 still
  unreached at 96 seeds. No food-economy game lever in this run moves
  the wall — both arms are the measurement the next lever needs.

## Telemetry deviation check

Ran on the deathext corpus
(evidence/2026-10-25/perseed-deathext-b/*.json) against
telemetry-baselines/scale-wall.json, metrics national,table,wins,exiled:
3 LOUD lines (national 12 -> 0, table 16 -> 26, wins 16 -> 0, n=57
files). These are the KNOWN recorder-row counting mismatch class, not
a real regression: the checker reads top-level panel paths the
recorder rows do not carry (the worker's own wall numbers above —
national-ever 79/96, wins 37/96 — prove the fields exist under
different names), the baseline is the WINSEAT regime vs this pre-seat
substrate, and n=57 counts the summary.json alongside 56 per-seed
files. Baseline NOT rolled, per the standing 1027Z instruction and the
1752Z precedent. Balanced panel: no compare .md — neither arm is a
before/after lever pair (both instrument-only); each arm's
pre-registered analyzer / proof is its comparison of record, same
standing precedent as deathrow-b and causemeta-b.

## Metric review (required, §14 — no re-scoring in this run)

No metric was re-scored. Deathext's conditional 7th band fired exactly
as pre-registered (six-band 299 < 300); the delivered combined corpus
is 96 seeds, not 88, because the conditional rule — not a revision —
says so, and no further band was run. Haultrace's GO was met as
written (verdicts for all 4 classes + adoption verdict); the late
corroboration correction changed prose counts only. One metric note
for the NEXT run: the telemetry checker cannot ingest recorder rows
(seventh-plus sighting of the class) — a future deciding rot corpus
should state its wall numbers from the analyzer, not from the checker,
or the checker needs a recorder-row reader. That is a tooling note,
not a re-score of this run.

## Infrastructure

- Haultrace registration hit the container EPERM flap on checkout
  (first attempt: files unwritten, no tree, no registry entry — clean
  failure; second attempt refused on the orphaned branch, which was
  verified to point exactly at master HEAD with zero unique commits
  and deleted as this run's own artifact, then re-registration
  succeeded). No other agent's branch was touched.
- Safe-commit index clobber hit BOTH worker commits (deathext: all 60
  files shown as staged deletions, worktree byte-identical to HEAD;
  haultrace: same variant on both its commits) — repaired via
  cacheinfo from HEAD blobs in each worktree, commits verified
  correct before and after repair. No clobber on the coordinator
  merges or on the coordinator evidence commit (checked below).
- Registrations slow under sibling load (~1-2 min); no other EPERM
  flap blocked this run. No coordinator sweep-script accident
  (read-only analyzer/proof runs only on merged master).
- Proofs on merged master: haultrace 172/0, deathext ALL LEGS PASS.

## Status

food-economy stays converging (NOT converged): the pooled death list
now clears the 300-death scale bar with a recalibrated N=2, and the
inverted haul predicate is adopted as the primary haul measure with
its first-trace verdicts recorded — but no food-economy game lever has
landed, the away-ration fix still awaits its own pre-registration,
and the wave-5/national wall is untouched by this axis.
scale-onramp stays converging (untouched; sibling loop A).
Next blanks, in order: (1) the next deciding rot corpus adopts the
inverted haul predicate as its primary haul measure, with
haul/preserve action counts beside the rotcompanion template; (2) the
away-ration fix itself (size packs to dayWant, floor/drop the hunger
penalty on pack draws, voice away hunger for low-health travelers) —
still waiting on its own pre-registration, not rushed here; (3) N=2
flagging consequence + The Big Beast roster question for any future
arm that wants monster-name tolerance at n=2 (must re-tune explicitly,
cannot cite this run for N=3); (4) deathrow next bands start at
73821+ (73701-73818 now all TAKEN). Claim deleted; lock deleted.
Evidence: this file (coordinator) + sim-deathext-b.md +
sim-deathext-b-baseline.json + perseed-deathext-b/ (commit 14a69bba1)
+ sim-haultrace-b.md + perseed-haultrace-b/ (commits bbf29e9c9,
7c26baa20). Merged locally, pending ship.
