# sim-food-economy-round-0935-b — coordinator evidence (loop B adoption run)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T0935Z,
axis food-economy (converging). Loop A live on scale-onramp for the
whole run (0915Z claim, driftwide + transient2 arms) — NOT touched.

## Stale-lock recovery (guard outcome)

The previous B run (0630Z, arms fishfallback + racksvoice-gate) was
dead at this run's start: its lock dated 06:57Z, its racksvoice
worktree heartbeat 08:49Z (40+ min stale), no live node processes,
lock age > 90 min. Per the guard, the lock was deleted and the old
claim retired to .DEAD. The fishfallback arm had already landed on
master (8a7540534). The racksvoice-gate arm was stranded
UNCOMMITTED in its worktree (game.js variant-B change + complete
corpus + draft evidence + scripts, on old base 72cf7a672). This run
adopted that arm; it ran no new sweeps of its own.

## Arm adopted: sim-racksvoice-gate-b (landed)

Variant B wins and lands (default ON, RACKSVOICE_GATE=0 restores the
old per-cook-per-day rule): only the FIRST racks-full complaint
each day speaks; later cooks that day get the plain frame. Variants
C (change-only voice) and B+C were measured and killed, leaving no
code: C failed its 9756 bar (19 spoken vs 17 baseline — a
village-wide change-only state re-speaks figures the per-cook gate
had silenced), B+C failed its risk bar (6 same-day-moved
silencing events, must be 0).

Numbers (identical seeds, paired baseline-vs-variant, from the
landed corpus; re-verified by the adoption run, no re-sweeps):
- Pilot band 9750-9757 (8 seeds, 100d): base racks-full 265, B 185,
  C 113, BC 101. Say totals unchanged (1350 all variants); plain
  rises by exactly the silenced count (709 -> 789). Numerics
  identical on every seed; worked == resolutions on every cell.
  B GO: 9757 106 -> 55 (bar <= 60), band 185 (bar <= 212),
  voice-days == baseline distinct complaint days on 8/8 seeds.
- Confirm band 9760-9775 (16 fresh seeds, baseline + B): base 509,
  B 404. Say unchanged (1998 both); plain 803 -> 908 (+105 exact).
  Numerics identical 16/16; voice-days == distinct days 16/16;
  404 <= 80% of 509 (= 407.2) — a THIN pass (3 complaints of
  headroom; confirm gain 20.6% vs pilot 30.2%, because fresh
  seeds carry more single-cook racks-bound days where B changes
  nothing). B CONFIRMED and LANDS.
- Sense: kept voice still tracks the village (one true report per
  racks-bound day). Silenced day-44 case (Miguel + Grace both
  quoting 20,187 kcal) deserves silence; disclosed limit: day 45
  silences Kealan's genuinely moved 19,729 figure because it was
  not first that day — B trades moved-figure fidelity for
  one-voice-per-day. Cook dominance: on seed 9757 ALL 55 kept
  voices are Miguel's (baseline Miguel 55, Grace 36, Kealan 14,
  Hryts 1) — the first-complaint rule favors the earliest-duty
  cook; acceptable because the line reports the village pile,
  but other cooks' voices disappear from racks-full days.
  Plain-frame limit stands: confirm plain 908 still dwarfs
  racks-full 404, and frozen numbers across days remain
  (9757: 22 distinct figures over 55 kept voices) — B removes
  same-day duplicates only. That cross-day frozen repetition is
  the next open blank on this thread.
- Proof: scripts/test-racksvoice-gate-b.js 274 PASS / 0 FAIL on
  the old tree, on the rebased tree, and on merged master.
  Final code check (old base, in corpus): env unset 9757 = 55 /
  9753 = 51 (B active); env RACKSVOICE_GATE=0 9757 = 106 /
  9753 = 64 (baseline restored).
- Post-rebase functional check (new base, adoption run): default
  mode == explicit RACKSVOICE_GATE=B exactly on seeds 9757/9753
  (JSONs identical ignoring ms): 9757 racksFull 68 / say 425 /
  deaths 1, 9753 49 / 350 / 2. These differ from the old-base
  corpus because the sibling fishfallback arm changed the shared
  policy module (scripts/policies/competent.js assignAnother)
  between the tree base and current master — a substrate shift,
  not a gate change, and not a re-verdict of the arm.

## Wall numbers (this run's judged corpora)

Pilot base: national-ever 6/8, table 0/8, wins 0/8 (SEATDRIVE=0
makes the table unreachable by construction — a construction fact,
not a scale-wall finding), median survival 100d (capped),
max 100d, waves 2-4, wave 5 0/8. Confirm base: national-ever
16/16, table/wins 0/16, median 100d, waves 2-4, wave 5 0/16.
Arc reach, four-realm formation, death-cause shares, trap
acquisition, counter discovery, succession survival, and tier-2
reach were not measured by this narration arm's census and are
not claimed here. Wave 3 was reached (both bands include
wave-3 seeds); wave 5 has zero births in every corpus here.

## Telemetry deviation check

Run on the B-confirm corpus against the WINSEAT scale-wall
baseline: 2 LOUD lines (table 16 -> 0, wins 16 -> 0). Both are
regime/construction artifacts (SEATDRIVE=0 corpus vs a WINSEAT
baseline; the table is unreachable by construction here).
Baseline NOT rolled; no new investigation. This matches the
standing pattern of ingestion/regime-artifact LOUD lines on
recorder corpora.

## Infrastructure (loud, for the record)

- Container EPERM write-denial flap blocked the adoption commit
  3 times over ~35 min (safe-commit private-index writes and
  git object writes both EPERM; plain /tmp writes succeeded
  intermittently). No ref surgery, no bypass: waited it out;
  commit landed once writes cleared (11a96b674, later rebased
  to 758a9d8bc).
- Safe-commit index clobber hit BOTH adoption commits: after
  each commit the tree index showed all committed files as
  staged deletions (plus untracked duplicates) while worktree
  bytes matched HEAD exactly. Repaired via HEAD-blob cacheinfo
  both times (second time: the repair loop's `tail -n +2`
  skipped the alphabetically-first file, leaving exactly one
  bogus entry — caught by the verify step, then repaired).
  Commits were always correct; only the index lied. Verified
  after each repair: `git status` empty + `git diff HEAD`
  empty + hash-object matches.
- A sibling /tmp cleanup wiped /tmp mid-run (all /tmp logs and
  scratch files gone, session tracking reset). No repo data
  was lost (sweep outputs live in the repo corpus, never /tmp
  as sole copy). A tree check rerun saving its log to /tmp was
  lost to the wipe and NOT repeated — see the check section.
- check.js --quick attribution (corrected in the arm evidence):
  rebased tree WITH arm 279 passed / 8 failed; current master
  WITHOUT arm 279 passed / 8 failed — identical counts. The
  8 master failures (no arm) are test-hide-discovery,
  test-measurement-comparison, test-measurement-proof-update,
  test-measurement-workflow, test-mobile-combat-cadence,
  test-occupation-panels, test-phone-frame-proof,
  test-parity-20261014 — none touches racks voice, cooking,
  or preservation. The arm adds no new failure. The worker's
  pre-rebase dot-count of 7 F is superseded and is not used
  as evidence (that log carries no failing-script names).

## Landing

Merged locally, pending ship: master 750b3d9f3 (arm 758a9d8bc +
verification note 750b3d9f3, rebased onto cc3c5cd9c clean; no
src/js changes between tree base and master except the arm's own
hunk). No push, no version bump — the batch ship job owns
deploys. Worktree released, branch deleted, main tree clean at
closeout.

## Next blanks (food-economy, in order)

1. Cross-day frozen racks-full repetition (same kcal figure
   repeated across days under B) — B fixed same-day duplicates
   only; a change-aware rule needs a design that survives the
   C failure (per-cook memory, not village-wide state).
2. Plain-frame volume (confirm plain 908 vs racks-full 404) —
   quieting complaints while plain frames stay high is half a
   fix; plain subtypes cannot be split from text alone.
3. The 0630Z run's other named items were already handled
   elsewhere: fishfallback landed (8a7540534); trust-0
   checkObedience and sheltered-holder counting remain open
   design questions (not taken by this run).

food-economy stays converging (NOT converged): a narration
improvement landed, but the scale wall (national/table/wins in
real play, wave 5 births) is untouched by this arm.
scale-onramp stays converging (untouched; sibling loop A).
Claim deleted; lock deleted.
