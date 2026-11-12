# Stall-cut bisect, arm sim-stallcut49-a — leg

Run fleshout-20261112T1624Z, Loop A, axis scale-onramp / winnability
chain. Pre-registration:
`evidence/2026-11-12/sim-stallcut49-a-prereg.md` (committed BEFORE any
judged sim, commit `149cfda91`). Base: `1ae6dd76c` — the 49th commit in
the window `d229b58f5..6dc7f8162` (midpoint of the rank-stall window's
second half, commits 33–65). Seeds 190391–190398, 150d death-aware,
competent verbatim, fix mode only (roster-check fix swapped in
uncommitted, per prereg).

## Verdict (judged ONLY against the prereg's rules — a miss is a verdict)

| Read | Count | Verdict |
|---|---|---|
| Survived | **1/8** | **STALLCUT49_COLLAPSED** (≤2/8) |
| Regional | **0/8** | **STALL_STILL_IN** (≤2/8) |

**The stall transition sits in commits 50–65** (`1ae6dd76c` →
`a18d7438c`), not in commits 33–49. The collapse is written in at
this cut too (1/8 survived, median 102d). This leg does NOT re-judge
any prior verdict.

## Wall numbers

- Survived **1/8** (only seed 190392 reached day 150; the other seven
  lost their village between day 62 and day 139)
- Regional **0/8**, national **0**, table **0**, wins **0**
- Wave 4 unlocked **8/8**, wave 5 unlocked **0/8**
- Median survival **102d** (vs vetphantom fix leg 150d, merge-base 102d,
  r5-cut1 110d, r5-cut2 144d, stall-cut 123d, stall-cut-32 102d)
- Standing **145–199** — seven of eight seeds end at exactly **199**,
  one point short of the 200 that regional needs. The villages do not
  stall for lack of standing effort; they sit one point under the line
  and then die.
- Deaths **661** total across the band; instrument errors **0** on every
  seed.

### Per-seed

| Seed | Days | End | Rank | Max wave | Standing | Deaths | End pantry kcal |
|---|---|---|---|---|---|---|---|
| 190391 | 95 | village-lost | village | 4 | 199 | 76 | 500 |
| 190392 | 150 | survived | village | 4 | 199 | 79 | 800 |
| 190393 | 129 | village-lost | village | 4 | 199 | 71 | 0 |
| 190394 | 139 | village-lost | village | 4 | 199 | 135 | 4,390 |
| 190395 | 86 | village-lost | village | 4 | 199 | 87 | 250 |
| 190396 | 102 | village-lost | village | 4 | 199 | 91 | 0 |
| 190397 | 83 | village-lost | village | 4 | 199 | 71 | 14,276 |
| 190398 | 62 | village-lost | village | 4 | 145 | 51 | 0 |

All eight seeds ran under the swapped-in fix (`standingFix: true`,
`standingSha: f8fda4295a99` recorded per seed).

### Comparison with the other legs (same seeds 190391–190398)

| Band | Base | Survived | Regional | Median |
|---|---|---|---|---|
| vetphantom fix leg | pre-reconcile master `5157782a4` | 6/8 | 8/8 | 150d |
| bisect-mergebase leg | merge-base `d229b58f5` | 1/8 | 0/8 | 102d |
| bisect-r5-cut1 leg | cut 1 `6dc7f8162` | 2/8 | 8/8 | 110d |
| bisect-r5-cut2 leg | cut 2 `2215e22d4` | 2/8 | 8/8 | 144d |
| stall-cut leg | stall cut `a18d7438c` (65th) | 0/8 | 8/8 | 123d |
| stall-cut-32 leg | stall cut 32 `715c2918d` | 1/8 | 0/8 | 102d |
| **this stall-cut-49 leg** | **stall cut 49 `1ae6dd76c`** | **1/8** | **0/8** | **102d** |

Seven of eight seeds are DAY-IDENTICAL to the stall-cut-32 leg
(95/150/139/86/102/83/62); only seed 190393 moved, 112d → 129d
with 8 fewer deaths (79 → 71). The only survival-relevant game
change in commits 33–49 is the double-night fix, and its visible
footprint on this band is exactly one seed living 17 days longer.
The regional read did not move at all. Commits 33–49 contain no
regional mechanism — consistent with the prereg's expectation, and
now measured, not assumed: the stall transition is in commits
50–65, where the LEG 3 tribute scholar-exclusion (`b1c8e730c`,
61st commit) sits.

## Death-cause shares (661 deaths)

| Cause | n | Share |
|---|---|---|
| villager combat | 252 | 38.1% |
| expedition | 174 | 26.3% |
| combat | 107 | 16.2% |
| the wild | 81 | 12.3% |
| monster | 16 | 2.4% |
| the arena | 10 | 1.5% |
| sickness | 8 | 1.2% |
| a wound that wouldn't close | 5 | 0.8% |
| ambush | 2 | 0.3% |
| starvation | 1 | 0.2% |
| a stranger / The Callback / The Loud Beast / Spool / contest | 1 each | — |

Combat + expedition + wild + combat = 614/661 (92.9%). Villages die
fighting, not hungry — the same combat-heavy profile as
survivalcontrol and stall-cut-32. Starvation is 1 death in 661.
Food is not the killer on this cut; monster pressure is.

## Wave-5 choke read (peak living wave-4+ veterans per seed vs bar of 2)

Peak living veterans with a wave-4+ kill (`vetsW4` count over the daily
snapshots; the wave-5 readiness bar needs 2):

| Seed | Peak living wave-4+ vets | Wave-4 slain (max) | End ready5 veterans |
|---|---|---|---|
| 190391 | 1 | 1 | 0 |
| 190392 | 1 | 3 | 0 |
| 190393 | 1 | 2 | 1 |
| 190394 | 1 | 3 | 1 |
| 190395 | 1 | 2 | 0 |
| 190396 | 1 | 1 | 0 |
| 190397 | 1 | 2 | 0 |
| 190398 | 0 | 0 | 0 |

No seed ever holds 2 living wave-4+ veterans at once. The wave-5 door
never opens on any seed — and it could not have: the second veteran
never survives long enough to stand beside the first. (Peak living
wave-3+ veterans reached 6 on seed 190392, so lower-wave kills happen;
the step up to wave-4 kills is where the veteran pipeline breaks.)
End-of-run `ready5` veterans: 1 on seeds 190393/190394 only, 0
elsewhere. Tribute-ready: 0/8 (all `veterans-short`, need 2, have 0–1).
The scholar appears in the wave-kill log on 7/8 seeds (all but
190393, where the living wave-4+ veteran is a non-scholar) — the
ladder and the readiness gate agree on a scholar kill on this base
(both read 1), as the prereg verified by reading the code and the
proof test confirmed live.

## Phantom days

**0 phantom days on all 8 seeds** (W3 and W4), as the prereg expected —
the roster-check fix is swapped in, and the shadow old-rule count never
exceeds the live roster-checked count on any day. No dead or off-roster
killer is counted anywhere in this band.

## Blooded

**2/8 blooded** (seeds 190393 and 190394; stall-cut-32 had 1/8).
Per the prereg, the BLOODED block in the swapped-in `standing.js`
has no callers on this base — the read is a report field only (the
village *would* be blooded under the local rule), not evidence any
fight was blooded.

## ARC IV firing — REPORTED field only (not judged)

**The instrument does not capture ARC IV.** Neither the driver
(`scripts/bisect-stallcut49-driver-20261112.js`), the vetfirst
instrument (`scripts/vetfirst-instrument-20261111.js`), nor the
analyzer records any Arc field — a grep over all three finds no arc
capture, and no per-seed JSON carries an arc key. ARC IV firing per
seed is therefore **not recorded** in this corpus; the prereg's judged
rules are unchanged by this. (ARC IV tracks rank, and rank here is
village on all 8 seeds, so ARC IV firing 0/8 is consistent with the
rank read — but that is an inference from the rank field, not a
measured ARC IV field, and is stated as such.)

## Village assessment (plain words)

The villages on this cut are the stall-cut-32 villages, one seed
aside: they meet monsters at the door with named defenders — Kurt,
Colin, Leo, Raj, Meera; Kofi, Javier, Danylo; Bessie, Tikhon, Pilar,
Aroha — put monsters down, get hurt doing it, and bury the ones who
do not come back. The System calls out veteran kills on camera
("Ingrid just put down The Focus Group... REMEMBER the name"), so the
kills that do happen are seen and named. But the arithmetic never
works: a village loses 51–135 people over 62–150 days, the pantry
swings wildly (0 to 14,276 kcal at the end — seed 190397 dies rich),
and standing parks at 199, one point short of regional, on seven of
eight seeds. The one survivor (190392, 150 days) is not a village on
the rise; it is a village that has not died yet, still at village
rank, still at 199. Nobody reaches regional, nobody is tribute-ready,
nobody opens wave 5. The double-night fix bought exactly one seed
seventeen more days; it did not move the wall. The stall is not a
standing shortfall — it is a survival shortfall wearing a standing
number.

## Sense-testing (SENSE-TESTING LAW)

Read veteran-kill / defense lines (`vetSays`) on seeds 190391–190393
(11, 18, 16 lines). The lines are coherent and specific: defense
reports name the actual defenders and the actual outcome ("3 put down,
2 driven off. Kurt, Colin, Leo, Raj, Meera are hurt"), veteran-kill
callouts name the killer and the monster ("Olivia just put down Spool",
"Danylo just put down Spool", "Aroha just put down Ad Break"). Death
records show named villagers dying in named ways across days, not a
single repeated template. One scripted line repeats verbatim across
seeds — the System's "AUDIENCE NOTES / FINAL DRAFT" broadcast and the
"MIRROR DRAFT" announcement — but those are broadcasts, not villager
speech, so the repetition is in character. One new line of evidence
for this window's only dialogue change: seed 190392 d94–95 shows the
European Elder identification followed by two landed teaching lines
("Javier showed Sari the European Elder — 'remember it.'", "Sigrun
showed Kofi the European Elder — 'remember it.'") — lessons landing
as spoken, consistent with the r157 teach-narration fix in commits
33–49. Seed 190396 carries 80 vetSays (vs 11–53 elsewhere) — volume,
not incoherence; its defense reports follow the same named template.
No robotic, static, or repeated villager behavior flagged on this cut;
the blank here is survival, not dialogue.

## What this leg changes

Nothing in game code. Instrument-only arm: the corpus, the analyzer
summary, this evidence file, and the proof test. No driver or test
fix was needed this run — the proof ran 63/63 on first run before any
judged sim and again after the band (see below). The next bisect step
belongs to the coordinator: the stall transition is now narrowed to
commits 50–65 (`1ae6dd76c..a18d7438c`); the midpoint of that half is
the natural next cut (commit 57 or 58). Note for that cut: the LEG 3
tribute scholar-exclusion (`b1c8e730c`, 61st commit) sits inside
commits 50–65, so a cut past it will split the ladder/scholar reads —
the proof test's scholar-rule detection (which this leg exercised
against the old always-counts-scholar rule, ladder reads 1 on a
scholar kill) will matter there.

## Metric review (§14)

- The metric set held. Regional and survival both classified cleanly
  (0/8 and 1/8 — no borderline 3–4/8 band, no re-scoring needed).
- The standing-199 plateau is a finding the metrics did not anticipate:
  seven seeds ending one point under regional suggests the rank read
  (binary regional yes/no) hides a near-miss structure. A future run
  could report standing distribution alongside the binary, but the
  binary stays the judge — this is a proposal for the NEXT run, not a
  re-score of this one. (Second sighting in a row, same seven seeds.)
- Per-seed day identity across legs (7/8 seeds day-identical to
  stall-cut-32) turned out to be a useful cross-leg fingerprint for
  how big a window's change really is — worth reporting on future
  bisect legs as a matter of course, not a metric change.
- ARC IV as a reported field needs an instrument that captures it; the
  current driver/instrument do not. If ARC IV reporting is wanted on
  future bisect legs, the driver needs an explicit arc capture — a
  tooling gap, recorded here, not a metric failure.

## Guards / notes

- Swap discipline held: fix `standing.js` (sha `f8fda4295a99…`) was in
  place for the run and is restored byte-identical afterwards (sha
  `98c8bfad70d7…`, `cmp` clean, `git status` shows no `src/js`
  modification). The scratch instrument
  (`scripts/vetfirst-instrument-20261111.js`) is deleted before
  finishing. The swapped file is never committed.
- Proof: `scripts/test-bisect-stallcut49-a.js` **63 passed, 0 failed**
  before any judged sim AND after the band. The rebased-tree proof is
  the coordinator's landing step (as with r8/stallcut32-a).
- Analyzer exit 0; summary at
  `evidence/2026-11-12/bisect-stallcut49-a-summary.json`; corpus at
  `evidence/2026-11-12/perseed-bisect-stallcut49-a/` (8 per-seed JSONs).
- Balanced panel (§15): N/A per prereg — instrument-only single leg, no
  code change; the before/after comparison IS the merge-base /
  stall-cut / stall-cut-32 legs vs this leg on identical seeds.
- Telemetry deviation check (Loop A body step 10): attempted — see
  appendix below.
- Infrastructure: the prereg commit hit the known detached-HEAD
  pattern (safe-commit.sh created commit `149cfda91`, parent
  `1ae6dd76c`, right 4 files, but its ref update failed with
  `fatal: update_ref failed for ref 'refs/heads/'`); HEAD was advanced
  by hand (`git update-ref --no-deref HEAD`) after verifying the
  commit, and the safe-commit index clobber (4 files shown D + ??)
  was repaired via the `ls-tree -r` pipe, hashes verified against
  HEAD blobs, status clean. Same handling as r7/r8. The worktree
  arrived with a complete checkout (no stale lock, no restore needed).
- Convergence: scale-onramp still blocked — national 0, table 0, wins 0
  on this cut. The stall transition is now localized to commits 50–65.

## Appendix — telemetry deviation check

Attempted after writing this evidence, exactly as the Loop A body
prescribes:

```
node scripts/telemetry-check.js --baseline ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-12/perseed-bisect-stallcut49-a/*.json' --metrics national,table,wins,exiled
```

**REFUSED by the tool** (same as prior bisect arms): "refusing
recorder-corpus input: all 8 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs. Recorder
corpora are compared with sweep-compare tables, never against a run
baseline here." Exit 2. Recorded, not waived; the baseline was NOT
rolled forward. No LOUD lines were produced, so there is no same-run
deviation to investigate — the refusal itself is the standing tooling
gap for bisect legs.
