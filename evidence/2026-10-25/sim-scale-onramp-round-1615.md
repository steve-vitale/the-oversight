# sim-scale-onramp-round-1615 — coordinator evidence (axis scale-onramp)

Run: fleshout-20261025T1615Z (Sun 2026-10-25 ~11:15 CDT onwards).
Axis: scale-onramp (converging). Standing directive applies: every run
attacks the scale wall directly. Sibling loop-B trees appeared mid-run
(sim-causeext-b, sim-causemeta-b, sim-haulcount-b — food-economy) and
were NOT touched. No live lock or claim at run start (both loops free);
this run worked scale-onramp, the topmost unconverged axis, taking the
1531Z run's named next blanks (1) spawn-source audit and (4) gavel
confess fired-flag gate, in that order. Rotation left at 3
(convergence work does not cycle it).

## PRE-REGISTRATION (run level; each arm's binding bars are in its own evidence file, written before its sweeps)

- Arm 1 sim-spawnsrc-a: spawn-source audit DIAG (zero src/js).
  Substrate tableseat-nowait, seeds 73671–73678, 180d death-aware.
  DIAG-GO requires >=95% of raid-time pool entities classified by
  spawn source, above-cap attribution, wave mix per source, and a
  wave-5 pool-presence report. Below 95% (or unknown >5%) = DIAG-NO-GO.
- Arm 2 sim-gavelconfess-a: gate villager gavel confess on the fired
  flag. Step 0 first (verify still open). GO requires: proof green on
  3+ trial scenarios; no trial-completion regression on a
  pre-registered before/after band; check.js --quick with no new
  failures. Any leg failing = NO-GO, game code reverted.

## RESULTS

### Arm 1 — spawn-source audit: DIAG-GO (commit 75a28b33c)

Where the pool actually comes from (85 raids, 1,494 raid-time
entities, recorder scripts/policies/spawnsrc-diag.js tagging every
spawnWorldMonster birth by caller flag):

| Source | Pool share | Births |
|---|---|---|
| tile-entry (checkEncounter, uncapped) | 933, 62.4% | 236 |
| maintain (capped top-up) | 393, 26.3% | 57 |
| scripted-hushwolf | 158, 10.6% | 24 |
| wanderer-contact | 8, 0.5% | — |
| scripted-titan | 2, 0.1% | — |
| trap / fled-recovery / unknown | 0 | 0 |

Classification 1,494/1,494 = 100% (unknown 0%), bar was >=95%.
Above-cap portion (median pool 17 vs cap 8): tile-entry is 87.0%
under the raid-time-cap view and 88.2% under the fixed-cap-8 view;
maintain only ~1–2% of the excess. The cap stock itself is wave-3+
FREE (0/645 and 0/665) — all 107 wave-3+ entities stand in the excess.
Wave mix per source: tile-entry is the ONLY escalating source
(11.3% wave-3+ at raid time; 45/323 births). Maintain is 0%
wave-3+ because NO maintain birth occurs after day 16 (all 57 births
days 3–16; wave 3 cannot unlock before day 25) — the birth-level
mechanism behind lever-b's byte-identical corpus. Maintain's 26.3%
pool share is longevity (57 early births re-appearing ~6.9x each),
not flow. Tile-entry decelerates while it escalates: births by day
bucket 82 (<30) down to 26 (120+), while its wave-3+ birth share
rises 0% to 65.4%. Hushwolf: all 24 births on day 16, permanent
wave-1 dilution (~10% of pools). Fled-recovery: 0 births on the band.
Wave-5: 0 births and 0 pool entities across all sources — a births
problem, not a pool problem.

Recorder neutrality: EXACT. The armed band reproduces the poolpres
control band on every headline (raids 85, raiders 361, deaths 234,
national-ever 7/8, wins 4/8, median 135d, pool 1,494, wave-3+ 107),
seed-for-seed; detgate passes. No fix designed or landed (DIAG only).

### Arm 2 — gavel confess gate: GO (commit e7804debb after rebase)

Step 0: bug still open, but only on one path. The player path was
already gated ("You already confessed. (It's on the record.)") and
was NOT touched. The open bug was the villager field-fight path:
villagerTrickAction's gavel branch in src/js/fieldFights.js checked
only that a trial was active and never read the fired flag
rec.trickConfess — unlike its neighbours (callback gates on
!rec.trickMourned, ad_break on !rec.trickUnwatched). A trial
stretched by a stunned/skipped verdict round therefore confessed
again each round: another log line, another state.gavelConfessions
increment, for one crime.

Fix (one condition, nothing else):
`if (mid === 'gavel' && msig.sigG && msig.sigG.trial && !rec.trickConfess)`
— per-trial, not per-fight: the verdict consumes the flag, so a new
trial may confess again. No change to the confess branch, verdict
halving, player path, buttons, or any spawn/pool/maintain code.

GO legs, all pass: (a) proof scripts/test-gavelconfess-once-20261025.js
green 15/15 on every seed (S1 fired-flag refusal, S2 first confess,
S3 new trial after consumed verdict, P player gate in real fights;
pre-fix 14/15 with the single failure always S1); (b) targeted band:
existing test-sig-gavel 24/24 pre and post, verdict math identical
(plain 40, confessed 20, flag consumed, trial cleared) — CAVEAT stated
plainly: this is a targeted trial-scenario band, not a full sweep or
full death census (the band contains no deaths by construction), so
no new death class is possible from this gate by construction, but
that is a targeted-band guard, not a census; (c) check.js --quick
279 passed / 8 failed pre AND post, identical 8-script failure set
(pre-existing, unrelated to this gate). Commit carries [needs-eyes]
(contest feel).

## VILLAGE ASSESSMENT (plain words)

The villages on this band live the same legible life as the poolpres
band: national in 7 of 8 runs, lesser seats at the table in 4 of 8,
the full seat still unreached, wave 5 never appearing. What this run
settled is where the wall's monsters come from: not the game's
maintenance tap (that tap is closed after day 16, before big monsters
can even exist), but the open door of tile-entry encounters — the
only source that grows bigger monsters over time, and the only one
with no cap. The pool is full because encounters keep walking in,
not because the game keeps topping it up. And a small courtroom
honesty fix landed alongside: a villager can no longer confess the
same crime twice in one trial just because the verdict round stalled.

## WALL NUMBERS (shared band, spawnsrc control = poolpres band)

- National-ever 7/8, table 4/8, wins 4/8 (lesser-seat only)
- Wave-4 6/8, wave-5 0/8 (0 births, 0 pool entities)
- Median survival 135d all-runs / 180d wins-excluded
- Death total 234 (poolpres/spawnsrc band)

## REACHABILITY VERDICT

Waves 1–4 reachable; wave 5 NOT (births 0, not a pool-presence
problem). Regional → national reachable (7/8). The table reachable
for lesser seats (4/8); the full seat NOT reached. The win flag fires
for lesser seats only. Vests: not measured by these arms.

## SENSE

- Spawnsrc: day-60 raid line carries no escalation beat; villagers
  read as people (hauling/cooking, standing down the Moderator);
  wait-line repetition carried as a minor observation.
- Gavel: player refusal reads as a court ruling, not a system error.
  Field refusal is quiet by design (gate returns null, so no second
  "confesses first" line and no second count, and the round proceeds
  to the ordinary narrated strike). Follow-up, not part of this gate:
  if Steve wants the villager to SAY the refusal off-screen, that
  spoken line still needs adding.

## METRIC REVIEW

- No metric was re-scored mid-run. Spawnsrc DIAG-GO is judged exactly
  as pre-registered (all four bars met, 100% classification).
  Gavel GO is judged exactly as pre-registered (all three legs pass;
  the targeted-band caveat on leg (b) is disclosed, not hidden).
- One analyzer bug was fixed mid-run by the spawnsrc worker (pool-min
  reported 0 via a concat([0]); corrected to true min 4, re-ran,
  committed summary is the corrected one) — disclosed in the arm
  evidence metric-review section.
- Balanced-panel note: balance-panel.js cannot ingest per-seed
  recorder corpora (sixth sighting counting this run's spawnsrc arm);
  the arm's sweep-compare table + analyzer output is its comparison
  of record. TELEMETRY DEVIATION CHECK NOT RUN, per the standing 1027Z
  instruction (recorder rows are not panels; telemetry-check reads 0
  wins/national on rows whose analyzer-proven counts are wins 4/8 and
  national-ever 7/8, and the scale-wall baseline warns against
  comparing courtship substrates to its WINSEAT regime). Baseline NOT
  rolled. Do not re-run telemetry-check on recorder rows without a
  counting fix or a regime-segregated baseline.

## NO SECOND ROUND

Both arms resolved inside the run (DIAG-GO + GO). No back-to-back
second round: the promoted next step (a tile-entry lever) is a
sketch in the spawnsrc evidence, not a pre-registered design, and
the gavel lane's remaining item (a spoken refusal line) is a
narration question, not a numbers arm. Spawning undesigned arms would
violate the pre-registration rule. Both go to the next run with their
own pre-registrations.

## INFRASTRUCTURE NOTES (coordinator, read before the next run)

- Master did NOT move under this run until the coordinator's own
  merges (dfb6ec007 -> 75a28b33c -> e7804debb). Spawnsrc merged
  --ff-only clean. Gavel rebased clean in its own worktree onto the
  post-spawnsrc master (zero file overlap), proof re-ran green
  post-rebase (15/15) and on merged master, then merged --ff-only.
  No force anywhere.
- Worktree registration was slow (~85s, ~70s, ~206s) but never
  failed; one registration call hit a service restart with no effect
  applied and was safely retried. Sibling loop-B trees appeared
  mid-run (causeext/causemeta/haulcount) — untouched.
- Safe-commit index clobber hit BOTH worker commits (bogus staged
  deletions; commits themselves correct); both repaired via
  per-file cacheinfo and verified before handoff. No clobber on
  either coordinator merge.
- Proofs on merged master: test-gavelconfess-once-20261025.js 15/15,
  test-spawnsrc-classify.js 13/13, main tree clean at closeout.
  check.js --quick NOT re-run by the coordinator: zero src/js in
  spawnsrc, and gavel's own pre/post quick runs are identical
  (279/8, pre-existing set).
- Sibling trees, claims, tracker, and lock untouched except this
  run's own claim/lock (deleted at close) and the tracker + findings
  appends below.

scale-onramp stays converging (NOT converged): the pool's source is
now measured (tile-entry, uncapped, the only escalating source) but
no tile-entry lever has been designed or tested, wins still come
only through default-OFF courtship + seat instruments and only
through the lesser seat, the full seat is still unreached, and wave 5
still has zero births. The directive stands until the tracker records
this axis converged on measured evidence. Next blanks, in order:
(1) a tile-entry lever with its own pre-registration (spawnsrc
evidence sketch: exact checkEncounter change, GO bar pool wave-3+
>=23% + w3+/raid >=0.9, guards wins >=3/8, national-ever >=6/8,
deaths within ±20% of 234); (2) wave-5 births zero as its own
standing/readiness question; (3) palisade-escalation narration beat
for wave-3+ raids; (4) the spoken villager confess-refusal line
(gavel follow-up); (5) why tile-entry births decelerate late (travel
census diag); (6) defender-fight wound manufacture (carried).
food-economy stays converging (untouched; sibling B loop).
Claim deleted; lock deleted. Merged locally, pending ship.
Evidence: this file (coordinator) + sim-spawnsrc-a.md +
perseed-sim-spawnsrc-a/ (commit 75a28b33c) + sim-gavelconfess-a.md
(commit e7804debb, rebased from ca8b013e4).
