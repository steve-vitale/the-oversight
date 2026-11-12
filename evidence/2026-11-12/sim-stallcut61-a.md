# Stall-cut bisect, arm sim-stallcut61-a — leg

Run fleshout-20261112T2006Z, Loop A, axis scale-onramp / winnability
chain. Pre-registration:
`evidence/2026-11-12/sim-stallcut61-a-prereg.md` (committed BEFORE any
judged sim, commit `fe26cb4dc`). Base: `b1c8e730c` — the 61st commit in
the window `d229b58f5..6dc7f8162` (the LEG 3 tribute scholar-exclusion
commit itself). Seeds 190391–190398, 150d death-aware, competent
verbatim, fix mode only (roster-check fix swapped in uncommitted,
per prereg).

## Verdict (judged ONLY against the prereg's rules — a miss is a verdict)

| Read | Count | Verdict |
|---|---|---|
| Survived | **1/8** | **STALLCUT61_COLLAPSED** (≤2/8) |
| Regional | **0/8** | **STALL_STILL_IN** (≤2/8) |

**The stall transition sits in commits 62–65** (`b1c8e730c` →
`a18d7438c`) — it is NOT the LEG 3 change. The collapse is written
in at this cut too (1/8 survived, median 102d). This leg does NOT
re-judge any prior verdict.

## Wall numbers

- Survived **1/8** (only seed 190392 reached day 150; the other seven
  lost their village between day 62 and day 139)
- Regional **0/8**, national **0**, table **0**, wins **0**
- Wave 4 unlocked **8/8**, wave 5 unlocked **0/8**
- Median survival **102d** (vs vetphantom fix leg 150d, merge-base 102d,
  r5-cut1 110d, r5-cut2 144d, stall-cut 123d, stall-cut-32 102d,
  stall-cut-49 102d, stall-cut-57 102d)
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
| stall-cut-49 leg | stall cut 49 `1ae6dd76c` | 1/8 | 0/8 | 102d |
| stall-cut-57 leg | stall cut 57 `d5865e4d3` | 1/8 | 0/8 | 102d |
| **this stall-cut-61 leg** | **stall cut 61 `b1c8e730c`** | **1/8** | **0/8** | **102d** |

All eight seeds are DAY-IDENTICAL to the stall-cut-57 leg
(95/150/129/139/86/102/83/62; deaths 76/79/71/135/87/91/71/51;
standing 199 on the same seven seeds; vetSays 11/18/16/37/18/80/53/29
on all eight seeds) — and the death-cause shares below are
byte-identical counts to cut 57's. Commits 58–61 contain no
survival mechanism and no regional mechanism that moves this band:
the LEG 3 scholar-exclusion and the overtime stretch change the
ladder/tribute veteran READS (see below) but not a single day, death,
or standing point. The stall transition is in commits 62–65.

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
survivalcontrol, stall-cut-32, stall-cut-49, and stall-cut-57.
Starvation is 1 death in 661. Food is not the killer on this cut;
monster pressure is. (Counts identical to the stall-cut-57 leg's,
seed for seed in aggregate.)

## Wave-5 choke read (peak living wave-4+ veterans per seed vs bar of 2)

Peak living veterans with a wave-4+ kill (`vetsW4.count` over the daily
snapshots; the wave-5 readiness bar needs 2):

| Seed | Peak living wave-4+ vets | Peak living wave-3+ vets | Wave-4 slain (max) | End ready5 veterans | End ladderVets4 |
|---|---|---|---|---|---|
| 190391 | 1 | 5 | 1 | 0 | 0 |
| 190392 | 1 | 6 | 3 | 0 | 0 |
| 190393 | 1 | 3 | 2 | 1 | 0 |
| 190394 | 1 | 5 | 3 | 1 | 0 |
| 190395 | 1 | 5 | 2 | 0 | 0 |
| 190396 | 1 | 4 | 1 | 0 | 0 |
| 190397 | 1 | 3 | 2 | 0 | 0 |
| 190398 | 0 | 2 | 0 | 0 | 0 |

No seed ever holds 2 living wave-4+ veterans at once. The wave-5 door
never opens on any seed — and it could not have: the second veteran
never survives long enough to stand beside the first. (Peak living
wave-3+ veterans reached 6 on seed 190392, so lower-wave kills happen;
the step up to wave-4 kills is where the veteran pipeline breaks.)
End-of-run `ready5` veterans: 1 on seeds 190393/190394 only, 0
elsewhere. Tribute-ready: 0/8 (all `veterans-short`, need 2, have 0).

The wave-5 bar is short on more than veterans: on seed 190393 the
end `ready5` read is armored 3/4, armed 5/6, veterans 1/2 (tricks 27,
far over the 3 demand); on seed 190394 it is armored 0/4, armed 0/6,
veterans 1/2 (tricks 35). Even where a veteran stands, the village
is not armored or armed to the wave-5 demand.

## The LEG 3 split, live in this band (the cut's own change, measured)

The LEG 3 scholar-exclusion IS live in these sims — it just does not
move the wall. At end of run, `ladderVets4` reads **0 on all 8 seeds**,
while the swapped-in readiness gate reads 1 on seeds 190393/190394.
On cut 57 the same two seeds read `ladderVets4 = 1` and
`ready5.veterans = 1` (the ladder and the gate agreed). The difference
is the scholar: on both seeds the SOLE living wave-4 veteran at end
is the current scholar — Anik Biswas on 190393, Febby Saragih on
190394 — and the LEG 3 ladder never counts the scholar, while the
readiness gate counts them as always living. The proof test confirmed
the same split live before the band (scholar kill: readiness 1,
instrument 1, ladder 0). The tribute veterans read moved with it:
`military_tribute` reads 0 veterans on all 8 seeds here, vs 0–1 on
cut 57 (1 on 190393/190394). So LEG 3 tightened the tribute
readiness read exactly as designed — and regional still reads 0/8,
because the villages never get near tribute-ready on any other bar
either. The overtime stretch played no role in this band: no seed
reached a seat offer (0/8 regional), so `overtimeActive()` — which
requires a non-none seat — could not be true on any seed (a
code-read inference from the rank field, stated as such).

## Phantom days

**0 phantom days on all 8 seeds** (W3 and W4), as the prereg expected —
the roster-check fix is swapped in, and the shadow old-rule count never
exceeds the live roster-checked count on any day. Max shadow W4 count
is 1 on seven seeds, 0 on 190398. No dead or off-roster killer is
counted anywhere in this band.

## Blooded

**2/8 blooded** (seeds 190393 and 190394; same two as stall-cut-57).
Per the prereg, the BLOODED block in the swapped-in `standing.js`
has no callers on this base — the read is a report field only (the
village *would* be blooded under the local rule), not evidence any
fight was blooded.

## ARC IV firing — REPORTED field only (not judged)

**The instrument does not capture ARC IV.** Neither the driver
(`scripts/bisect-stallcut61-driver-20261112.js`), the vetfirst
instrument (`scripts/vetfirst-instrument-20261111.js`), nor the
analyzer records any Arc field — a grep over all three finds no arc
capture, and no per-seed JSON carries an arc key. ARC IV firing per
seed is therefore **not recorded** in this corpus; the prereg's judged
rules are unchanged by this. (ARC IV tracks rank, and rank here is
village on all 8 seeds, so ARC IV firing 0/8 is consistent with the
rank read — but that is an inference from the rank field, not a
measured ARC IV field, and is stated as such.)

## Village assessment (plain words)

These are the stall-cut-57 villages, unchanged: they meet monsters
at the door with named defenders — Kurt, Colin, Leo, Raj, Meera;
Kofi, Javier, Danylo; Bessie, Tikhon, Pilar, Aroha — put monsters
down, get hurt doing it, and bury the ones who do not come back.
The System calls out veteran kills on camera ("Ingrid just put down
The Focus Group... REMEMBER the name"), so the kills that do happen
are seen and named. But the arithmetic never works: a village loses
51–135 people over 62–150 days, the pantry swings wildly (0 to
14,276 kcal at the end — seed 190397 dies rich), and standing parks
at 199, one point short of regional, on seven of eight seeds. The
one survivor (190392, 150 days) is not a village on the rise; it is
a village that has not died yet, still at village rank, still at
199. Nobody reaches regional, nobody is tribute-ready, nobody opens
wave 5. Commits 58–61 bought nothing for the wall — the LEG 3 change
did exactly what it was designed to do (the scholar no longer counts
toward a tribute the table cannot pay) and the wall did not move,
because the stall was never the scholar count. The transition now
sits in the four commits 62–65, and the next cut is the midpoint of
that half — commit 63 or 64.

## Sense-testing (SENSE-TESTING LAW)

Read veteran-kill / defense lines (`vetSays`) on seeds 190391–190393
(11, 18, 16 lines — identical counts and lines to stall-cut-57, as
the trajectories are). The lines are coherent and specific: defense
reports name the actual defenders and the actual outcome ("3 put down,
2 driven off. Kurt, Colin, Leo, Raj, Meera are hurt"), veteran-kill
callouts name the killer and the monster ("Olivia just put down Spool",
"Danylo just put down Spool", "Aroha just put down Ad Break"). Death
records show named villagers dying in named ways across days, not a
single repeated template. One scripted line repeats verbatim across
seeds — the System's "AUDIENCE NOTES / FINAL DRAFT" broadcast — but
that is a broadcast, not villager speech, so the repetition is in
character. No robotic, static, or repeated villager behavior flagged
on this cut; the blank here is survival, not dialogue.

## What this leg changes

Nothing in game code. Instrument-only arm: the corpus, the analyzer
summary, this evidence file, and the proof test. No driver or test
fix was needed this run — the proof ran 63/63 on first run before any
judged sim and again after the band (see below). The next bisect step
belongs to the coordinator: the stall transition is now narrowed to
commits 62–65 (`b1c8e730c..a18d7438c`); the midpoint of that half is
the natural next cut (commit 63 or 64). Note for that cut: the
ladder/scholar split this leg proved live (ladder 0 vs readiness 1
on a scholar veteran) stays in force at 62–65 — the proof test's
scholar-rule detection carries over unchanged.

## Metric review (§14)

- The metric set held. Regional and survival both classified cleanly
  (0/8 and 1/8 — no borderline 3–4/8 band, no re-scoring needed).
- The standing-199 plateau is now a fourth sighting in a row (same
  seven seeds, same 199): the binary regional read hides a near-miss
  structure. A future run could report standing distribution
  alongside the binary, but the binary stays the judge — a proposal
  for the NEXT run, not a re-score of this one.
- Per-seed day identity across legs (8/8 seeds day-identical to
  stall-cut-57, including identical death-cause counts and identical
  vetSays counts on all eight seeds) is a strong cross-leg fingerprint
  for how big a window's change really is — worth reporting on future
  bisect legs as a matter of course, not a metric change. This leg is
  the cleanest demonstration yet of a REAL change with ZERO band
  effect: the LEG 3 exclusion measurably moved two end reads
  (ladderVets4 1→0, tribute veterans 1→0 on two seeds) while every
  judged number stayed bit-identical.
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
- Proof: `scripts/test-stallcut61-a.js` **63 passed, 0 failed**
  before any judged sim AND on the post-band re-run (with the fix
  swapped back in for the re-run, then restored again — the proof's
  §1 assertions require the swapped-in fix, so a post-restore run
  would correctly fail its 4 fix-dependent assertions; that failure
  is the proof working as designed, not a regression). The
  rebased-tree proof is the coordinator's landing step (as with
  r8/r9/stallcut49-a/stallcut57-a).
- Analyzer exit 0; summary at
  `evidence/2026-11-12/bisect-stallcut61-a-summary.json`; corpus at
  `evidence/2026-11-12/perseed-bisect-stallcut61-a/` (8 per-seed JSONs).
- Balanced panel (§15): N/A per prereg — instrument-only single leg, no
  code change; the before/after comparison IS the merge-base /
  stall-cut / stall-cut-32 / stall-cut-49 / stall-cut-57 legs vs this
  leg on identical seeds.
- Telemetry deviation check (Loop A body step 10): attempted — see
  appendix below.
- Infrastructure: a host write flap (EPERM on git ref writes and file
  writes) was ACTIVE at run start (probe failed 20:44Z, 21:09Z,
  21:32Z; heartbeat write refused; `cp` to scratch refused). It
  cleared 21:57:30Z (probe OK), heartbeat re-landed 21:57:56Z, and
  the cut checkout succeeded after clearance. A runtime restart
  interrupted both flap-wait loops mid-wait (their logs were empty on
  recovery; the live probe after restart proved clearance). The
  prereg commit hit the known detached-HEAD pattern (safe-commit.sh
  created commit `fe26cb4dc`, parent `b1c8e730c`, right 4 files, but
  its ref update failed with `fatal: update_ref failed for ref
  'refs/heads/'`); HEAD was advanced by hand (`git update-ref
  --no-deref HEAD`) after verifying the commit, and the safe-commit
  index clobber (4 files shown D + ??) was repaired via the `ls-tree
  -r` pipe (explicit file pathspecs), hashes verified against HEAD
  blobs, status clean. Same handling as r7/r8/r9/stallcut49-a/
  stallcut57-a.
- Convergence: scale-onramp still blocked — national 0, table 0, wins 0
  on this cut. The stall transition is now localized to commits 62–65.

## Appendix — telemetry deviation check

Attempted after writing this evidence, exactly as the Loop A body
prescribes:

```
node scripts/telemetry-check.js --baseline ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-12/perseed-bisect-stallcut61-a/*.json' --metrics national,table,wins,exiled
```

**REFUSED by the tool** (same as prior bisect arms): "refusing
recorder-corpus input: all 8 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs. Recorder
corpora are compared with sweep-compare tables, never against a run
baseline here." Exit 2. Recorded, not waived; the baseline was NOT
rolled forward. No LOUD lines were produced, so there is no same-run
deviation to investigate — the refusal itself is the standing tooling
gap for bisect legs.
