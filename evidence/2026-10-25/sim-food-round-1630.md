# sim-food-round-1630 — coordinator evidence (axis food-economy, MEASUREMENT ONLY except one counting tap)

Run: fleshout-loop-b-20261025T1630Z (Sun 2026-10-25, loop B, second axis).
Sibling loop A live at run start on scale-onramp (1615Z claim: spawnsrc +
gavelconfess) — NOT touched. A landed both arms mid-run (76c7170dd), then
the batch ship loop landed a version bump (772c52b4a), then a new A run
(1715Z, tileentry + w5births) started — NOT touched. All three B arms were
therefore rebased onto the moved master in turn (see below), re-proved,
then merged --ff-only. No force, no conflict (zero file overlap with the
A/ship landings; A touched fieldFights.js, ship touched build/sw/version
files, neither touched game.js).

Axis: food-economy (converging), taking the 1530Z next blanks (1), (2),
(3) in order. Blank (1) is NOT closed (blocked, see arm 1); blank (3) is
CLOSED (arm 2); blank (2) is advanced to ready (arm 3 builds the
instrument blank (2) asked for).

## Arm 1 — sim-causeext-b: BLOCKED, no pooled list (commit c93a6c063, rebased from fa0f341c3)

Pre-registered gates G1–G5 all NO-GO, blocked at the input, not at a
threshold. The tableseat-nowait primary corpus
(evidence/2026-10-24/perseed-tableseat-nowait-a/, 16 files + summary)
carries NO per-death rows and NO kind field anywhere (0 occurrences of
"kind", 0 of deathRows/deathcensus). Its `deaths` dict aggregates at
write time (player:/villager: prefix = scholar flag only, from
test-tableseat-nowait-sweep.js deathSummary(); rows discarded), and its
starvationDetail covers starvation deaths only. The kind filter (kind in
{villager, person} AND scholar false, per analyze-causebase-b.js) cannot
be applied to it by construction — and analyze-causebase-b.js refuses
such files outright (fatal exit 2). Per the brief's STOP condition the
worker built nothing: no list, no N, no guardrail artifact, no counts
derived from the aggregated dict, competent N=3 NOT reused.

Adjacent context (NOT a substitute, reported by the worker, recomputed
read-only): the deathcensus corpus on the same substrate (seeds
73671–73678, baseline side only) decomposes 261 = 192 monster + 42
scholar + 27 villager deaths, matching the published decomposition.
27 villager deaths from a single band cannot support a credible N
(competent pool: 570 deaths / 144 runs; audit scale bar >= 300 deaths
across >= 100 runs), and Nevermore / The Suburb at n=1 there show why a
borrowed N=3 swallows genuine labels as churn on this substrate.

Unblock path (next run, NOT taken here): run tableseat-nowait sweeps
with a death-row recorder (deathcensus pattern: kind + player + cause
per row) across MULTIPLE new seed bands on the armed (seat-legs-on)
substrate, 180d; only then build the list, calibrate N from that pool's
own distribution/tail, cite the scope line, run the G4 scholar-only
check, and demonstrate G5. Do NOT unblock by aggregating the `deaths`
dict, treating the `villager:` prefix as a kind filter, or importing
competent N=3. Evidence: evidence/2026-10-25/sim-causeext-b.md.

## Arm 2 — sim-causemeta-b: GO, C6 fixed (commit 931b61289, rebased from 29d47f358)

The 1530Z blank (3) is closed. The causebase baseline JSON now carries
a machine-readable `scope` object (scopeVersion 1; policy competent;
horizon 150d death-aware; flags PLENTYDEPRI 1, DEPOSITGATE 1; kind
filter kinds [villager, person], scholarExcluded true, with sweep/census
flag-field names; labels raw, 32-char truncation; 6 corpora with seed
bands; counts 1302/0/732/570/48). Policy/flags were read from all 144
per-seed files (verified uniform); horizon days from the 6 sweep
summaries' meta.days (all 150); the death-aware mode label is documented
sweep-driver semantics, emitted only when summary meta.days exists,
else null — nothing invented. The diff to the old JSON is exactly one
insertion; every counted number is byte-identical, and a pool re-run
reproduces the new file byte-identically, scope included.

The analyzer (scripts/analyze-causebase-b.js) now enforces scope in
compare mode before any flag is computed: mismatch on any declared leg
(policy, either flag, horizon days) -> exit 2, SCOPE-MISMATCH naming
both scopes, no stdout JSON (a refusal, not a flagged result); match ->
exit 0 with scopeCheck match; undeclared arm leg -> loud SCOPE-PARTIAL
warning, exit 0, partial; scope-less legacy baseline -> loud
SCOPE-WARNING, exit 0, unverifiable; mixed-substrate pool -> exit 2.
The audit test's pre-fix assertions (C6 FAIL, silent exit 0 on
different-substrate compare) were updated surgically to the fixed state;
C1–C4 and C7 numbers are unchanged, and the audit verdict now stands
as PARTIALLY on C7 truncation only.

Coordinator verification on the rebased branch AND on merged master:
test-causemeta-b.js ALL LEGS PASS (G1–G4 GO, plus legacy/partial/
conflict edges); test-causebase-audit-b.js ALL LEGS PASS (C6 PASS,
C5a compare refuses with SCOPE-MISMATCH, C5b/C7b in-scope compares
exit 0). Evidence: evidence/2026-10-25/sim-causemeta-b.md.

## Arm 3 — sim-haulcount-b: GO, instrument built (commits 4683c9d3a + bb9d9c475 + e21b8e686, rebased)

The 1530Z blank (2) instrument half is built. Per-seed output gains 11
count fields (top level, beside rot/depri/days): haulActions, haulKcal,
pantryDepositActions, pantryDepositKcal, preserveAttempts,
preserveSuccessItems, preservePemmicanSets, preservePemmicanBars,
preserveVillagerBatches, preserveVillagerKcal,
preserveVillagerResolutions. Recorder: scripts/sweep-haulcount-b.js
(new, derived from sweep-leg2drift-b.js with declared deltas; all
wrappers delegate to originals, counting blocks try/catch-isolated).
Haul predicate (caller census, widened after a trace-caught
undercount): generic duty names + trap lines (Snared meat, Pit meat)
+ haul-return default (Hauled meat) + emergency hunt; home-pantry
pieces deposits count as both haul and deposit; tribute pooling into
another village is excluded as a transfer, not a haul. Scholar
preserve verbs return null on every path, so successes are item-state
deltas in the acted container, never return values. Villager
smoke-rack preserving is inline game code, so it is counted by ONE
8-line counting-only tap in src/js/game.js (cook-duty loop, HAULCOUNT
markers, try/catch, writes ONLY to Game._haulcount, reuses the game's
own kept-kcal formula; no behavior line moved, added, or removed —
verified by diff review in the arm evidence and by the proof's
structural assertion). The leg2drift registerDeath non-delegation is
pre-existing instrument behavior, kept for comparability, not defended
or changed here.

Pilot (instrument proof only, NO verdict judged): 8 fresh seeds
9400–9407 x pd0/pd1, 100d death-aware, FEASTSCALE_R13=1, SEATDRIVE=0.
All 16 per-seed files carry all 11 fields as non-negative integers;
haulActions 81–326, haulKcal 40,209–299,118 (never zero-everywhere;
minimum is the 40-day village-lost seed 9405 pd0, still 81 hauls).
Scholar preserve attempts are 0 on all 16 files — a real coverage
fact, not a gap: the leadfeast policy chain never calls the scholar
preserve verbs (they are UI verbs), so all preservation in these sims
is villager smoke-rack work (villager batches pd0 med 76, pd1 med 99).
Trace mode (HAULCOUNT_TRACE=1, off by default, 500-event cap) caught
the first predicate undercounting real trap hauls (seed 9400 pd0: 32
real trap hauls excluded) and the pilot was re-run from scratch on the
fixed instrument; all reported numbers are from the fixed instrument.
G3 spot-checks: 4 traces (seeds 9400/9404 x both sides) recomputed
from events to the action and matched per-seed totals exactly;
excluded deposits named as aid/System gifts; villager batches held
under both invariants (batches >= resolutions, kcal <= 4000 x
resolutions) on all 16 files. Trace re-runs are byte-identical to the
pilot's (md5-verified).

Coordinator verification on the rebased branch AND on merged master:
test-haulcount-b.js 49 PASS, 0 FAIL; corpus check 342 PASS, 0 FAIL
(all 16 files' fields, haul > 0, deposits >= hauls, villager
invariants, trace totals == per-seed totals on all 4 traces).
Evidence: evidence/2026-10-25/sim-haulcount-b.md +
evidence/2026-10-25/haulcount-b-corpus/ (16 per-seed files, 2 sweep
summaries, 4 trace files).

## Wall numbers (this run measured none — standing numbers cited, not re-measured)

These arms are measurement/instrument work; no wall corpus was run.
Standing wall from loop A's 1615Z run (same shared band, cited here so
the run still reports the wall): national-ever 7/8, table 4/8, wins 4/8
(lesser-seat only — full seat still unreached), wave-4 6/8, wave-5 0/8,
median 135d all-runs / 180d wins-excluded, deaths 234. The scale wall
is unmoved by this run's arms, as expected: they fix measurement, not
reach. The haulcount pilot itself is SEATDRIVE=0 / 100d, so its
table/wins are structurally 0 and are not wall evidence.

## Telemetry deviation check (on the haulcount pilot corpus)

node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-25/haulcount-b-corpus/*.json' --metrics
national,table,wins,exiled -> 2 LOUD lines: table 16 -> 0, wins
16 -> 0 (n=22 files). Both are the known WINSEAT-baseline vs
pre-seat-substrate regime artifact class (the pilot is SEATDRIVE=0
by design, so table/wins are structurally absent, not disappeared);
baseline NOT rolled. No new investigation. The national line's
absence is the known recorder-row ingestion gap (per-seed rows do
not carry the checker's top-level national path), not a measurement.

## Balanced panel (§15) and check.js --quick

Balanced-panel compare NOT run: this run contains no before/after
lever pair to compare (audit + blocked arm + instrument proof only);
the panel cannot ingest recorder corpora in any case (standing
finding). No verdict in this run depends on a panel comparison.
check.js --quick attempted once by the coordinator in the coordinator
worktree (timeout 280s): no output before the timeout killed it, so
the run is INCONCLUSIVE, not a pass or a fail — the same inconclusive
pattern prior runs recorded (1430Z coordinator attempt killed at 600s
mid-suite; 1530Z worker attempt killed by its 300s wrapper). No
failure attribution is claimed from it. The designated proofs remain
the verification of record here: causemeta ALL LEGS PASS and haulcount
49/49 + 342/342, each green on the rebased branches and again on
merged master; causemeta is zero game code, causeext is evidence
only, and haulcount's single game.js change is counting-only. The
ship loop's full check run covers the combined tree.

## Village assessment (plain words)

No village's story is told by this run's numbers, and that is partly
the finding. The tableseat villages' road to the table is measured
for wins (3 seats, 3 wins on 73601–73608) but their deaths were never
written down in separable form — the sweep kept tallies and threw the
individual death records away — so who died of what on the way to the
table is unwritten, not small. The haulcount traces, by contrast, read
like people working: day-1 forages landing 100-kcal pieces, trappers
coming back with species-named meat, named villages sending aid,
homecomings unloading Purslane and Burdock, cooks working the racks
only once surplus is about to spoil. The next deciding rot run can now
tell a haul story from a preserve story by counting, instead of
arguing from a ratio that falls when the denominator explodes.

## Infrastructure

- Worktree registrations slow (~2–4 min each) under sibling load, never
  failed. No EPERM flap on .git writes this run.
- Safe-commit index clobber: hit the haulcount worker's first two
  commits (repaired by the worker via cacheinfo, commits verified);
  NOT hit on any coordinator merge or the coordinator evidence commit
  (verify: git status clean at closeout, below).
- Coordinator nudge to the haulcount worker (safe-commit does not take
  directory paths — pass the expanded file list) unblocked its pilot
  commit; no re-run was needed and no new commit was required of the
  coordinator beyond this evidence file.
- Merge sequence: causeext rebased + merged, causemeta rebased +
  re-proved + merged, haulcount rebased (3 commits) + re-proved
  (49 + 342) + merged — all --ff-only, no force. Post-merge proofs on
  merged master: causemeta ALL LEGS PASS, haulcount 49/49 and
  342/342 (corpus check re-run on master).

food-economy stays converging (NOT converged): the pooled-cause
guardrail is now checkable for the competent scope (C6 closed) and the
next rot question now has haul/preserve counts beside the companion
metric — but the tableseat-nowait pooled list is blocked on a missing
recorder, no food-economy lever moves the scale wall, and the scope
extension for non-competent / longer-horizon arms is still open.
scale-onramp stays converging (untouched; sibling loop A). Next
blanks, in order: (1) death-row recorder sweeps for tableseat-nowait
across multiple seed bands (the causeext unblock path — recorder
shape pre-registered before the sweep, not discovered after it);
(2) the haulcount predicate inversion proposal (count every deposit
as a haul EXCEPT known non-haul names) as the next instrument
revision, re-derived and compared on the pilot; (3) scholar preserve
columns are policy-dependent — a future analyzer must always read
the villager columns alongside, never read preserveAttempts 0 as
"nothing was preserved"; (4) rotcompanion template + haulcount fields
adopted verbatim by the next deciding rot corpus. Claim deleted;
lock deleted. Evidence: this file + sim-causeext-b.md +
sim-causemeta-b.md + sim-haulcount-b.md + haulcount-b-corpus/
(coordinator commit below) + arm commits c93a6c063, 931b61289,
4683c9d3a, bb9d9c475, e21b8e686. Merged locally, pending ship.
