# Survival-collapse bisect ROUND 10, cut at the 389th commit — arm sim-bisect-r10-cut-a

Run fleshout-20261112T1715Z (continued as adoption by run
fleshout-20261112T1815Z), Loop A, axis scale-onramp / winnability
chain. Pre-registration:
`evidence/2026-11-12/sim-bisect-r10-cut-a-prereg.md` (committed BEFORE
any judged sim, commit `79eaafd92`). Base: `c67a17564` — the 389th
commit in the window `d229b58f5..203a32775` (midpoint of the last 8
commits; revised decision table: CUT_HEALTHY impossible, top band is
CUT10_ABOVE_FAR_END). Seeds 190391–190398, 150d death-aware,
competent verbatim, fix mode only (roster-check fix swapped in
uncommitted, per prereg).

## ADOPTION NOTE (coordinator, run fleshout-20261112T1815Z)

The 1715Z coordinator died after the band ran: the prereg commit
(`79eaafd92`) was committed, the 8-seed band ran, and the analyzer
wrote `bisect-r10-cut-a-summary.json` — but no evidence `.md` was
written, the corpus was never committed, and the fix-swap was still
applied uncommitted (`M src/js/standing.js`) when this run recovered
the tree. The coordinator verified the stranded work independently
before landing it: the summary's verdict fields were re-derived by
re-running the analyzer (exit 0, same verdict); the per-seed JSONs
were spot-checked cell-for-cell against the summary (days, deaths,
standing, wave, tribute — all 8 match); the deep-identity read was
re-run by the coordinator directly against the r9 corpus on master
(0 4-field signature diffs, 0 full daily deep-diffs on all 8 seeds);
the proof test was re-run green (63/63) with the swap in place.
This file is the coordinator's write-up of the worker's judged run,
not a re-run: no seed was re-simulated, no verdict re-judged.

## Verdict (judged ONLY against the prereg's REVISED rules — a miss is a verdict)

| Read | Count | Verdict |
|---|---|---|
| Survived | **4/8** | **INCONCLUSIVE** (3–4/8, the expected band) |
| Regional | **7/8** | **REGIONAL_INTACT** (≥5/8) |

**The 190393/190397 remainder sits in commits 390–393.** The corpus
is deep-identical to round 9's on all 8 seeds (see §2), so commits
386–389 — 73 files, +813,565/−0 lines, ALL `evidence/` and
`scripts/`, zero `src/js` — moved nothing. The 2/8→4/8 exit stays in
commits 378–385 (the melee-first slot rule); the far end never was
healthy (4/8), so no cut in this window can return CUT_HEALTHY, and
the healthy pole needs re-derivation outside the window (prereg
option b — the next run's work, not this arm's). The ≥5/8 band
(CUT10_ABOVE_FAR_END) did not fire, correctly: a cut exceeding the
far end would have meant commits 390–393 hurt survival, not a
healthy pole found. This leg does NOT re-judge any prior verdict.

## §1 Wall numbers

- Survived **4/8** (190393, 190395, 190397, 190398 — the firstparent's
  four, same four as round 9)
- Regional **7/8**, national **0**, table **0**, wins **0**
- Wave 4 unlocked **8/8**, wave 5 unlocked **2/8** (190393, 190397)
- Median survival **150d** (vs vetphantom fix leg 150d, round-9 cut
  150d, firstparent 150d, r8-cut 144d, merge-base 102d)
- Standing **150–425** — five of eight seeds end at exactly **199**
- Deaths **639** total across the band; instrument errors **0** on
  every seed
- Blooded **4/8** (190391, 190393, 190397, 190398 — report field
  only; the BLOODED block has no callers on this base)
- Tribute-ready **1/8** (190393, military tribute, veterans 2/2)

### Per-seed

| Seed | Days | End | Rank | Max wave | Standing | Deaths | End pantry kcal |
|---|---|---|---|---|---|---|---|
| 190391 | 86 | village-lost | regional | 4 | 199 | 88 | 0 |
| 190392 | 144 | village-lost | regional | 4 | 199 | 77 | 0 |
| 190393 | 150 | survived | regional | 5 | 425 | 76 | 13,451 |
| 190394 | 43 | village-lost | village | 4 | 150 | 52 | 0 |
| 190395 | 150 | survived | regional | 4 | 199 | 96 | 0 |
| 190396 | 87 | village-lost | regional | 4 | 199 | 80 | 0 |
| 190397 | 150 | survived | regional | 5 | 225 | 74 | 1,200 |
| 190398 | 150 | survived | regional | 4 | 199 | 96 | 0 |

All eight seeds ran under the swapped-in fix (`standingFix: true`,
`standingSha: f8fda4295a99` recorded per seed).

### Comparison with the other legs (same seeds 190391–190398)

| Band | Base | Survived | Regional | Median |
|---|---|---|---|---|
| vetphantom fix leg | pre-reconcile master `5157782a4` | 6/8 | 8/8 | 150d |
| bisect-merge leg | merge `e4dbe581b` | 1/8 | — | 126d |
| bisect-firstparent leg | first parent `203a32775` | 4/8 | — | 150d |
| bisect-reconciled leg | reconciled `743e07d87` | 1/8 | — | 126d |
| survivalcontrol | current master `d33ca69f9` | 1/8 | — | 126d |
| bisect-origin leg | second parent `a628aeaf3` | 2/8 | 0/8 | 90d |
| bisect-mergebase leg | merge-base `d229b58f5` | 1/8 | 0/8 | 102d |
| bisect-r5-cut1 leg | cut 1 `6dc7f8162` | 2/8 | 8/8 | 110d |
| bisect-r5-cut2 leg | cut 2 `2215e22d4` | 2/8 | 8/8 | 144d |
| bisect-r6-cut leg | cut `c7786d567` | 2/8 | 8/8 | 144d |
| bisect-r7-cut leg | cut `21fc590d0` | 2/8 | 8/8 | 144d |
| bisect-r8-cut leg | cut `a6ed956f5` | 2/8 | 8/8 | 144d |
| bisect-r9-cut leg | cut `ee30f22a2` | 4/8 | 7/8 | 150d |
| **this round-10 leg** | **cut `c67a17564`** | **4/8** | **7/8** | **150d** |

## §2 Deep-identity read (pre-registered method)

The per-day 4-field signature (vetsW3, vetsW4, waveKillLog length,
roster length) against the r9-cut corpus on master, plus a full
daily-snapshot deep-diff. **Deep-identical on all 8 seeds: 0
signature diffs, 0 full daily deep-diffs, same day counts
(85/143/149/42/149/86/148/149).** The headline fields agree too
(days, standing, maxWave, deaths — cell-for-cell, including 190393
standing 425 and 190397 standing 225). This is the EXPECTED outcome
the prereg named: no game code moved in commits 386–389, and the
two files the driver runs (`scripts/policies/competent.js`,
`scripts/sim-harness.js`) are byte-identical between the two bases.
A divergence here would have meant instrument or harness drift; there
is none. The 190393/190397 remainder is localized to commits
390–393: the wave-5-kill lever commit, the journey-landing fix, and
the firstparent itself (prereg's list, not run here).

## §3 Death-cause shares (639 deaths)

| Cause | n | Share |
|---|---|---|
| villager combat | 272 | 42.6% |
| expedition | 126 | 19.7% |
| combat | 126 | 19.7% |
| the wild | 82 | 12.8% |
| monster | 14 | 2.2% |
| ambush | 3 | 0.5% |
| contest | 3 | 0.5% |
| a wound that wouldn't close | 3 | 0.5% |
| Spool | 2 | 0.3% |
| a stranger | 2 | 0.3% |
| the arena | 2 | 0.3% |
| the night | 1 | 0.2% |
| Big-Eyes | 1 | 0.2% |
| alien | 1 | 0.2% |
| starvation | 1 | 0.2% |

Combat + expedition + wild + combat = 606/639 (94.8%). Villages die
fighting, not hungry — the same combat-heavy profile as every prior
bisect leg. Starvation is 1 death in 639.

## §4 Wave-5 choke read (peak living wave-4+ veterans per seed vs bar of 2)

| Seed | Peak living wave-4+ vets | Peak living wave-3+ vets | Wave-4 slain (max) | End ready5 veterans |
|---|---|---|---|---|
| 190391 | 1 | 3 | 1 | 1 |
| 190392 | 1 | 3 | 1 | 0 |
| 190393 | 4 | 5 | 4 | 2 |
| 190394 | 0 | 2 | 0 | 0 |
| 190395 | 1 | 5 | 1 | 0 |
| 190396 | 1 | 5 | 1 | 0 |
| 190397 | 2 | 5 | 2 | 1 |
| 190398 | 2 | 6 | 2 | 1 |

190393 holds the pair and unlocks wave 5 (tribute-ready, see §5);
190397 holds the pair and unlocks wave 5; **190398 holds the pair
(peak 2) and never unlocks** — the pair-arming case the r9 run
named (armed 4–5 vs demand 6 over its 19-day hold), now the
pairarming arm's question (see the coordinator evidence for this
round). The other five seeds never hold 2 living wave-4+ veterans
at once. Ladder `ladderVets4` reads 2 on 190393 only and 0 on
190397/190398: on this base the ladder never counts the scholar
(LEG 3), so scholar-held wave-4 kills read in the readiness gate
and the instrument but not the ladder — exactly as the prereg's
ladder note predicted.

## §5 Tribute-ready, voiceless (190393)

Seed 190393 ends tribute-ready (military tribute, veterans 2/2,
standing 425, wave 5 unlocked, survived 150d) — the second
tribute-ready end in the bisect (r9's 190393 was the first). The
capture still says nothing about tribute, table, or seat: 0 mentions
of any of the three words across `vetSays`, `casts`, and
`killCalls` on that seed (1 mention of "standing"). The village is
ready and nobody says so. The voiceless-tribute finding (carried
since tributedeliv-b) stands, now witnessed twice.

## §6 Phantom days

**0 phantom days on all 8 seeds.** The roster-check fix is swapped
in, and the live roster-checked count never includes a dead or
off-roster killer. **5 shadow-prevented days on dying 190394**
(the old-rule shadow w3 count exceeds the live count on 5 days —
the same 5 days as round 9, as the trajectories are
deep-identical): the fix does visible work there, and nowhere else
was it needed. Max shadow W4 count is 1 on seven seeds, 0 on
190398.

## §7 ARC IV firing — REPORTED field only (not judged)

**The instrument does not capture ARC IV.** Neither the driver
(`scripts/bisect-r10-cut-driver-20261112.js`), the vetfirst
instrument (`scripts/vetfirst-instrument-20261111.js`), nor the
analyzer records any Arc field — no per-seed JSON carries an arc
key. ARC IV firing per seed is therefore **not recorded** in this
corpus; the prereg's judged rules are unchanged by this. (ARC IV
tracks rank, and rank here is regional on 7/8 seeds, so ARC IV
firing 7/8 is consistent with the rank read — but that is an
inference from the rank field, not a measured ARC IV field, and is
stated as such.) Same standing as r9 and stallcut57.

## §8 Village assessment (plain words)

These are the round-9 villages, unchanged — the corpus is
deep-identical, so the people are the same people living the same
days. Lulwa, Leo, Raj, Meera and Ingrid meet the monsters at the
door on 190391 and come back hurt; Kofi, Javier, Danylo and Meruert
do the same work on 190392. The System calls out veteran kills on
camera, so the kills that happen are seen and named. But the
arithmetic still does not work on the four lost seeds: 190394 is
gone by day 43, 190391 by day 86, 190396 by day 87, 190392 by day
144 — all of them parked at 199 standing, one point short of
regional, when they die. The four survivors are not villages on the
rise either, except 190393: it ends at 425 standing, wave 5 open,
tribute-ready — and nobody in the village says a word about any of
it. 190397 opens wave 5 too, at 225. 190398 survives the full 150
days holding a wave-5 pair it can never arm, standing 199. The wall
is unchanged: national 0, table 0, wins 0. Commits 386–389 bought
nothing — they were never going to; they contain no game code. The
remainder now sits in four commits, 390–393, and the healthy pole
sits outside this window entirely.

## §9 Sense-testing (SENSE-TESTING LAW)

Read veteran-kill / defense lines (`vetSays`) on seeds 190391–190393
(29, 23, 19 lines). The lines are coherent and specific: defense
reports name the actual defenders and the actual outcome ("Lulwa,
Leo, Raj, Meera and Ingrid met them at the door — 4 put down, 1
driven off. Lulwa, Leo, Raj, Meera, Ingrid are hurt"), veteran-kill
callouts name the killer and the monster. One scripted line repeats
verbatim across seeds — the System's "AUDIENCE NOTES / FINAL DRAFT"
broadcast — but that is a broadcast, not villager speech, so the
repetition is in character. One grammar slip recurs on the pre-fix
base: "A Elder veteran" (190391 day 24) — already fixed on master by
sim-eldergrammar-a (`a5b75cab8`); this base predates the fix, so the
line is a base artifact, not a new finding. No robotic, static, or
repeated villager behavior flagged on this cut; the blank here is
survival, not dialogue.

## §10 Metric review (§14)

- The revised decision table held. The 4/8 band classified as
  INCONCLUSIVE exactly as pre-registered, and the ≥5/8 band
  (CUT10_ABOVE_FAR_END) correctly did not fire — it must never be
  read as CUT_HEALTHY, by construction.
- The deep-identity read confirmed the prereg's expectation
  (identical corpus, no drift) — worth keeping as a standing check
  on future bisect legs: a divergence where no game code moved is
  an instrument finding, not a lever read.
- The standing-199 plateau is a fourth sighting in a row (same five
  seeds at exactly 199): the binary regional read hides a near-miss
  structure. A future run could report standing distribution
  alongside the binary, but the binary stays the judge — a proposal
  for the NEXT run, not a re-score of this one.
- ARC IV as a reported field needs an instrument that captures it;
  the current driver/instrument do not. If ARC IV reporting is
  wanted on future bisect legs, the driver needs an explicit arc
  capture — a tooling gap, recorded here, not a metric failure.

## §11 Guards / notes

- Swap discipline held: fix `standing.js` (sha `f8fda4295a99…`) was in
  place for the run and is restored byte-identical afterwards (sha
  `98c8bfad70d7…`, `cmp` clean, `git status` shows no `src/js`
  modification). The scratch instrument
  (`scripts/vetfirst-instrument-20261111.js`) is deleted before
  finishing. The swapped file is never committed.
- Proof: `scripts/test-bisect-r10-cut-a.js` **63 passed, 0 failed**
  before any judged sim (worker) and on the coordinator's post-band
  re-run (with the fix swapped in). The rebased-tree proof is the
  coordinator's landing step (see the round coordinator evidence).
- Analyzer exit 0; summary at
  `evidence/2026-11-12/bisect-r10-cut-a-summary.json`; corpus at
  `evidence/2026-11-12/perseed-bisect-r10-cut-a/` (8 per-seed JSONs).
- Balanced panel (§15): N/A per prereg — instrument-only single leg,
  no code change; the before/after comparison IS the vetphantom fix
  leg vs this round-10 leg on identical seeds, judged by the
  analyzer's revised decision rule.
- Telemetry deviation check (Loop A body step 10): attempted — see
  appendix below.
- Infrastructure: the worker's prereg commit hit the known
  detached-HEAD pattern (safe-commit.sh created commit `79eaafd92`
  with the right 4 files, but its ref update failed); the
  coordinator advanced the branch ref by hand after verifying the
  commit, as with r7/r8/r9/stallcut49-a. No EPERM flap this run.
  The 1715Z coordinator died between the band and this evidence
  file; no work was lost — the corpus, summary, and prereg were
  all on disk in the worktree.
- Convergence: scale-onramp still blocked — national 0, table 0,
  wins 0 on this cut. The bisect is now fully localized (collapse
  exit 378–385, remainder 390–393) and the healthy pole is known
  NOT to be in this window. The next step is the option-b
  re-derivation (what `5157782a4` carries that the window's far
  end does not), not another cut inside 378–393.

## Appendix — telemetry deviation check

Attempted after writing this evidence, exactly as the Loop A body
prescribes:

```
node scripts/telemetry-check.js --baseline ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-12/perseed-bisect-r10-cut-a/*.json' --metrics national,table,wins,exiled
```

**REFUSED by the tool** (same as prior bisect arms): "refusing
recorder-corpus input: all 8 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs. Recorder
corpora are compared with sweep-compare tables, never against a run
baseline here." Exit 2. Recorded, not waived; the baseline was NOT
rolled forward. No LOUD lines were produced, so there is no same-run
deviation to investigate — the refusal itself is the standing tooling
gap for bisect legs.
