# sim-callertag-resweep-b — caller-tag re-sweep (measurement only)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T1951Z, axis
food-economy. Arm sim-callertag-resweep-b, the named next step of
sim-callertag-b (evidence/2026-10-27/sim-callertag-b.md, DIAG-GO).

Pre-registration (committed BEFORE any sweep judgment):
evidence/2026-10-27/sim-callertag-resweep-b-prereg.md, commit 2c9f11cbe.
Judged ONLY against it. Measurement only: zero src/js changes, no
default flips. scripts/caller-tag-capture.js reused VERBATIM.

Canon read first: docs/CANON.md, then docs/GARDENS.md. Nothing invented.

## Verdict against the prereg: NO-GO — on the determinism leg only, as written

| leg | bar | result |
|-----|-----|--------|
| Mover single-caller share (≥95%) | 223+/234 to one caller | 234/234 = 100.0% ✓ |
| Join balance (gardenInflows ↔ callerTagRecords, both ways) | 0 mismatches | 0 mismatches ✓ |
| Exile share as a COUNTED number | counted, not bounded | 0 counted ✓ |
| Assisted/ordinary split from full objects | counted | 232 assisted / 2 ordinary, counted ✓ |
| Proof scripts green | test-callertag-b 30/30 + stacked proof | 30/30 + 15/15 ✓ |
| **Determinism leg (headline identity vs the 2026-10-26 corpus)** | **276 / 1,310,710 + per-seed identity** | **234 / 931,330 — FAILS as written** |
| Hygiene | zero src/js; original corpus untouched; only committed work | verified ✓ |

This is a NO-GO by the prereg's binding rule, and it is NOT re-scored
here: the prereg said a headline divergence fails the determinism leg
even if the caller split looks clean, and the headline diverged (234
vs 276 records). What the rest of this file proves — with a control
experiment the prereg did not foresee — is WHERE the divergence comes
from: it is master drift since 2026-10-26, not the instrument. The
mover measurement itself passed every bar on current master, and the
counted split below stands as current-master truth. The next arm in
this family should re-prereg its baseline on current master instead
of comparing against the 2026-10-26 corpus; the split numbers here
are the baseline it should use.

## The counted per-caller split (current master, band 9760–9767)

Every garden-attributed deposit record in the re-sweep carries exactly
one caller tag. Zero records unclassified, zero join mismatches.

| caller | records | kcal | destVillage |
|--------|---------|------|-------------|
| donateToPantry (deliberate donation) | 186 | 644,830 | Haven ×186 |
| returnToVillage (homecoming pool) | 48 | 286,500 | Haven ×48 |
| returnToOldVillage (exile amends) | 0 | 0 | — |
| other:<frame> | 0 | 0 | — |
| **total garden-attributed** | **234** | **931,330** | **Haven ×234** |

Per seed: 9760: donate 18 / homecoming 23 (41, 246,170 kcal);
9761: donate 3 / homecoming 13 (16, 122,160 kcal);
9762: donate 126 / homecoming 3 (129, 396,750 kcal);
9763: donate 9 / homecoming 4 (13, 50,600 kcal);
9764: donate 30 / homecoming 5 (35, 115,650 kcal);
9765/9766/9767: 0.

Exile share, COUNTED (not bounded): 0. Every seed's final village is
Haven, every seed's pastVillages list is empty, no record carries a
returnToOldVillage tag, and no record's destVillage differs from
Haven. The old 0..276 exile bound is closed on this band, on current
master, as a counted zero — the competent policy never forks or
abandons, so no past village exists to amend. (This closes the exile
half of the old caveat for this band and policy; it does not prove
exile is zero under a forking policy.)

## Assisted vs ordinary: counted from the full gardenShares objects

| class (full object) | records | kcal |
|---------------------|---------|------|
| assisted {assisted:1} | 232 | 923,170 |
| ordinary {ordinary:1} | 2 | 8,160 |
| legacy / legacyAssisted / other-shape | 0 | 0 |

The 2 ordinary records are real, and the instrument agrees with the
old bridge rule on them: both are day-62 Cattail donations on seed
9761 (4,320 + 3,840 kcal, donateToPantry, dest Haven), from plots
sown day 8 and last harvested day 31, harvested day 61 — and the
coax sayLines on 9761 END at day 27. No coax falls in [31, 61), so
the bridge rule also classifies that harvest ordinary. This is not
an instrument artifact and not a bridge failure: on drifted 9761 the
scholar stopped coaxing after day 27, a bed kept growing unassisted,
and its day-61 harvest was honestly ordinary. The old "all 276
assisted" closure stands for the OLD corpus trajectories; on current
master the band is 232/234 assisted with 2 honestly ordinary
records. Any future claim of "all assisted" must name its corpus.

## Determinism: what diverged, and the control that isolates the cause

Re-sweep vs original corpus, per seed (garden = gardenInflows
deposit-door count):

| seed | old garden | new garden | old deaths | new deaths | old waveReach | new waveReach | diverged fields |
|------|-----------|-----------|-----------|-----------|---------------|---------------|-----------------|
| 9760 | 41 | 41 | 0 | 0 | [1,2,3] | [1,2,3] | none — identical |
| 9761 | 60 | 16 | 2 | 4 | [1,2] | [1] | deaths, causes, wave, garden, throttle, stock, inflows |
| 9762 | 129 | 129 | 2 | 2 | [1,2] | [1,2] | none — identical |
| 9763 | 13 | 13 | 3 | 3 | [1,2] | [1,2] | none — identical |
| 9764 | 33 | 35 | 1 | 3 | [1,2] | [1,2] | deaths, causes, garden, throttle, stock, inflows |
| 9765 | 0 | 0 | 1 | 2 | [1,2,3] | [1,2] | deaths, causes, wave, garden, throttle, stock, inflows |
| 9766 | 0 | 0 | 5 | 5 | [1,2,3] | [1,2,3] | throttle, stock, inflows only |
| 9767 | 0 | 0 | 4 | 2 | [1,2,3] | [1,2] | deaths, causes, wave, garden, throttle, stock, inflows |

CONTROL EXPERIMENT (run after the sweep, same current master, same
flags, unwrapped scripts/sweep-stock9762-b.js via stdout JSON,
compared field-by-field): unwrapped-current vs wrapped-current has
ZERO differing fields on ALL 8 seeds (9760, 9761, 9762, 9763, 9764,
9765, 9766, 9767 — including the two garden-divergent seeds 9761
and 9764, where unwrapped-current reproduces the re-sweep's 16 and
35 records exactly). Unwrapped-current vs ORIGINAL diverges on
exactly the 5 seeds above. Conclusion, stated as proven rather than
inferred: the caller-tag wrapper perturbs NOTHING — the same
trajectories come out with and without it. The divergence is
game-code drift on master between the 2026-10-26 corpus and today
(multiple landings since, including 2026-10-27 work); no single
commit is bisected or blamed here, because the control already
answers the question this arm had to answer (is the instrument
clean?), and a bisect would be a different arm's job. The prereg's
determinism leg as written still fails — it compared against a
stale baseline — and this file does not re-score it.

## Balanced panel (MEASUREMENT.md §15) — explicitly N/A

There is no before/after game leg in this arm: nothing in the game
changed, and the re-sweep differs from the original band ONLY by an
added instrument. No panel compare was run and none is claimed. The
attributable verification is the corpus re-derivation + determinism
diff + unwrapped control above. (The known balance-scorecard.js
TypeError seen by prior runs was not encountered because no panel
compare was attempted.)

## Wall numbers (re-sweep corpus, current master)

national 0/8, table 0/8, wins 0/8; wave-4 unlocks 0/8, wave-5 unlocks
0/8; wave reach per seed — 9760: 3, 9761: 1, 9762: 2, 9763: 2,
9764: 2, 9765: 2, 9766: 3, 9767: 2; median survival 100d, max 100d
(all 8 seeds survived to the 100d horizon; survival is censored,
not a 100d lifespan claim); deaths 21 total. Death-cause shares:
the arena 7, monster 4, ambush 3, sickness 3, choir toad 1,
dehydration 1, starvation 1, a wound that wouldn't close 1.
Per-seed deaths: 9760: 0; 9761: 4 (ambush 1, arena 1, sickness 2);
9762: 2 (monster 1, arena 1); 9763: 3 (ambush 1, wound 1,
dehydration 1); 9764: 3 (ambush 1, starvation 1, sickness 1);
9765: 2 (arena 1, choir toad 1); 9766: 5 (arena 3, monster 2);
9767: 2 (monster 1, arena 1). The scale wall stands on this band.
NOT recorded in this corpus and NOT estimated here: Arc II/III/IV,
four-realm formation, trap acquisition by source, counter
discovery/kill rate, young-link succession survival, and per-villager
who-died/when (the sweep stores death counts by cause only, not a
death list) — stated plainly rather than estimated.

## Village assessment (plain words)

The village on this band is Haven, and it survives: all eight runs
reach day 100 with the pantry fed substantially by the scholar's own
garden. The food story the caller split tells is a two-door story,
not a one-door story. Most garden food arrives as deliberate
donations (186 of 234 records) — the scholar works the beds, carries
the harvest, and hands it over. But a real fifth of it (48 records,
286,500 kcal) arrives as homecoming pooling: food the scholar was
already carrying when they walked back into Haven, swept into the
pantry by the return itself. On seed 9762 the split is extreme the
other way (126 donations, 3 homecoming); on 9760 it leans homecoming
(23 of 41). Neither door is decoration — both fire on the same band,
sometimes on the same day (see the trace below).

Who thrived and died, and why: the corpus records causes, not names,
so this stays at cause level. The arena is the biggest killer (7 of
21) — the village's people keep dying in staged fights, not from
hunger: only one starvation death in 21, on drifted 9764, alongside
one dehydration. Sickness takes 3. Monsters take 4 outright plus 3
ambushes. The garden keeps the village fed while the contest circuit
keeps killing it — food is not the binding constraint on this band,
the arena and the monsters are. What knowledge or capability is
missing: nothing in this corpus speaks to knowledge gaps (no codex
or teaching stream is captured here), and no claim is made about
them. The blank this arm filled is provenance: every garden deposit
now has a named carrier, a named destination, and a counted class.

## Sense-check: one deposit trace, end to end (seed 9762, day 20)

Sow: day 11, Lamb's Quarters, two beds. Coax: days 17, 18, 19, 20
("You coax 4 growing beds forward by 12 days. The next harvest
carries the growth magic."). Harvest: day 19 (plots' lastHarvest
moves to 19; one more bed harvested day 20). Carry and deposit, day
20, three records in order: 2,700 kcal Lamb's Quarters via
returnToVillage (homecoming pool, dest Haven, assisted), then 300
kcal via donateToPantry, then 3,000 kcal via donateToPantry (both
dest Haven, assisted). The keeper lines the same days name the
duty villagers (Wilhelm, Tyler, Eduardo watering and weeding while
the scholar coaxes). Judgment: this reads as REAL village behavior,
not an instrument artifact. A single day's harvest reaches the
pantry through both doors in sequence — the scholar walks home
carrying food (pooled by the return) and then donates more from the
pack. That same-day two-door pattern is exactly why the old corpus
could not separate the callers: the records were never different,
the hands were. The instrument does not invent the split; it reads
the call stack at the moment each hand acts, and the frame locations
(game.js:8617 for homecoming, game.js:15371 for donate) match the
grep-anchored call sites from sim-callertag-b.

## Metric review (MEASUREMENT.md §14)

- The prereg's determinism leg did its job and then some: it caught
  a real comparability break (stale baseline) instead of letting
  this arm report "234 vs 276" as a mystery or, worse, quietly
  re-baseline. But the leg as written conflated two different
  claims — "the wrapper does not perturb trajectories" and "current
  master reproduces the 2026-10-26 corpus" — and only the first is
  the instrument's responsibility. Proposed for the NEXT run, not
  applied retroactively here: split the leg. Leg D1 (instrument
  purity): unwrapped-current vs wrapped-current must be identical
  on the band — this arm proves it on all 8 seeds. Leg D2
  (baseline currency): the comparison corpus must be from current
  master, or the run must state up front that it is measuring drift
  as well as the instrument. A prereg that compares a fresh sweep
  against a day-old corpus on a hot tree will keep failing D2 for
  reasons that have nothing to do with the arm.
- The 95% single-caller bar worked cleanly: 100% with zero
  unclassified and a balanced join is not a marginal pass, and the
  join-balance requirement (both directions) is what makes it
  trustworthy — a one-directional count could have hidden a
  dropped or duplicated record.
- The assisted/ordinary leg as written ("counted, not matched to
  expectation") also worked: had it required "all assisted," the 2
  honest ordinary records on drifted 9761 would have forced either
  a false failure or a fudged count. Counting first and explaining
  second is the right shape for a provenance arm.
- Residual: the mover question is CLOSED on this band and policy
  (234/234 classified, exile counted 0), but the closure is
  current-master truth, not 2026-10-26-corpus truth — the two
  corpora differ, and any citation of the split must name the
  corpus (re-sweep, 2026-10-27) it comes from. The old 276-record
  joint class is superseded for this band, not retroactively
  re-split: the old records still carry no caller tag, and nothing
  in this arm changes that.

## Reproduction check (this run)

- Proof scripts green in this worktree, exit 0:
  scripts/test-callertag-b.js 30 PASS / 0 FAIL (re-run, verbatim
  wrapper + old corpus legs intact); scripts/test-callertag-
  resweep-b.js 15 PASS / 0 FAIL (stacked inflow+garden+caller-tag
  install on the real Game: tags exact through the stack,
  delegation identical, zero RNG draws, join balances in order,
  double-install refused). One stacked-proof failure was caught and
  fixed mid-run (my test's own baseline accounting: the garden
  capture had already seen the baseline call made while caller-tag
  was uninstalled — the test now slices from the reinstall point;
  the wrapper was never at fault).
- Sweep: scripts/sweep-callertag-resweep-b.js, seeds 9760–9767,
  competent-nofeast, 100d, env flags asserted FATAL (COMPETENT_FEAST
  =0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE unset);
  8 per-seed JSONs under evidence/2026-10-27/
  sim-callertag-resweep-b-corpus/ (new dir; the 2026-10-26 corpus
  files were read, never modified — verified by the analyzer's
  field diff, which treats them as the reference).
- Control: unwrapped scripts/sweep-stock9762-b.js on current master
  (stdout JSON, no files written) for all 8 seeds; unwrapped vs
  wrapped diffFields=[] on every seed.
- No game-code change: zero src/js files touched; scripts/
  caller-tag-capture.js byte-unchanged (verbatim reuse). No jest
  run (nothing to test in jest — the proofs are node, not jest).
  No [needs-eyes]: measurement + tooling, not a player-visible
  change. No panel compare (N/A, stated above).
- Index note: the prereg commit via scripts/safe-commit.sh again
  left the worktree index showing a staged deletion + untracked
  copy of the same file (the known safe-commit index-clobber
  class). The commit itself was correct (171 insertions, verified
  via git show); the index was repaired with `git update-index
  --add --cacheinfo` against the HEAD blob, and `git status` /
  `git diff HEAD` verified empty afterwards.
- Files in this arm: evidence/2026-10-27/
  sim-callertag-resweep-b-prereg.md (commit 2c9f11cbe),
  evidence/2026-10-27/sim-callertag-resweep-b.md (this file),
  evidence/2026-10-27/sim-callertag-resweep-b-corpus/
  (8 per-seed JSONs), scripts/sweep-callertag-resweep-b.js,
  scripts/analyze-callertag-resweep-b.js,
  scripts/test-callertag-resweep-b.js.
  scripts/caller-tag-capture.js UNCHANGED.

## Findings for the coordinator backlog (do NOT edit goal hidden_files here)

- [fixed 2026-10-27 by loop-B arm sim-callertag-resweep-b]
  2026-10-27 — food-economy/provenance — PER-RECORD MOVER
  IDENTITY (re-sweep, current master): 234/234 garden-attributed
  deposit records classified to a single caller (donate 186 /
  644,830 kcal, homecoming 48 / 286,500 kcal, exile COUNTED 0,
  other 0; all destVillage Haven); join balanced both ways; the
  old 276-record joint class is superseded for this band by the
  re-sweep corpus. Instrument proven non-perturbing
  (unwrapped-current == wrapped-current on all 8 seeds).
- [open] 2026-10-27 — food-economy/provenance — STALE-BASELINE
  RULE FOR PROVENANCE ARMS (same arm, NO-GO leg): the prereg's
  determinism leg failed only because it compared a fresh sweep
  against the 2026-10-26 corpus on a hot tree (5 of 8 seeds drifted:
  9761, 9764, 9765, 9766, 9767). Next provenance prereg should split
  instrument purity (unwrapped vs wrapped on current master) from
  baseline currency, and cite the re-sweep corpus — not the 276
  corpus — for the split.
- [open] 2026-10-27 — food-economy/provenance — TWO HONESTLY
  ORDINARY DEPOSITS ON DRIFTED 9761 (same arm): day-62 Cattail
  donations (4,320 + 3,840 kcal) from a day-61 harvest with no coax
  since day 27; instrument and bridge agree. The "all assisted"
  closure is corpus-specific; future assisted claims must name
  their corpus.
- [open] 2026-10-27 — scale-wall — ARENA AS TOP KILLER ON THIS
  BAND (same arm, wall numbers): 7 of 21 deaths are "the arena"
  vs 1 starvation; food is not the binding constraint here. Worth
  a look from the wall work, not this arm's scope.

## Verdict (judged against the pre-registered bar, not re-scored): NO-GO

The determinism leg as written fails (234 vs 276 against the stale
2026-10-26 baseline). The mover measurement itself is complete and
clean on current master: 234/234 records to a single caller, exile
counted at zero, join balanced, instrument proven non-perturbing by
an unwrapped control on all 8 seeds — all with zero src/js changes.
