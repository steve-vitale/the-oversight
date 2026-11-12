# Stall-cut bisect, ROUND 7 second arm — leg sim-stallcut32-a

Run fleshout-20261112T1515Z (adoption of the stranded 1315Z arm), Loop A,
axis scale-onramp / winnability chain. Pre-registration:
`evidence/2026-11-12/sim-stallcut32-a-prereg.md` (committed BEFORE any
judged sim, commit `7f7e1144f`). Base: `715c2918d` — the 32nd commit in
the window `d229b58f5..6dc7f8162` (midpoint of the rank-stall window's
first half). Seeds 190391–190398, 150d death-aware, competent verbatim,
fix mode only (roster-check fix swapped in uncommitted, per prereg).

Adoption note: the 1315Z worker committed the prereg package and staged
the fix-swap + scratch instrument, then died before the sweep ran (no
corpus dir existed). This run verified both SHAs before any sim
(`standing.js` fix sha `f8fda4295a99…`, instrument byte-identical to
master `311f105bc15f…`), ran the sweep, judged, and restored the tree.

## Verdict (judged ONLY against the prereg's rules — a miss is a verdict)

| Read | Count | Verdict |
|---|---|---|
| Survived | **1/8** | **STALLCUT32_COLLAPSED** (≤2/8) |
| Regional | **0/8** | **STALL_STILL_IN** (≤2/8) |

**The stall transition sits in commits 33–65** (`715c2918d` → `a18d7438c`),
not in the first 32. The collapse is written in at this cut too (1/8
survived, median 102d). This leg does NOT re-judge any prior verdict.

## Wall numbers

- Survived **1/8** (only seed 190392 reached day 150; the other seven
  lost their village between day 62 and day 139)
- Regional **0/8**, national **0**, table **0**, wins **0**
- Wave 4 unlocked **8/8**, wave 5 unlocked **0/8**
- Median survival **102d** (vs vetphantom fix leg 150d, merge-base 102d,
  r5-cut1 110d, r5-cut2 144d, stall-cut 123d)
- Standing **145–199** — seven of eight seeds end at exactly **199**,
  one point short of the 200 that regional needs. The villages do not
  stall for lack of standing effort; they sit one point under the line
  and then die.
- Deaths **669** total across the band; instrument errors **0** on every
  seed.

### Per-seed

| Seed | Days | End | Rank | Max wave | Standing | Deaths | End pantry kcal |
|---|---|---|---|---|---|---|---|
| 190391 | 95 | village-lost | village | 4 | 199 | 76 | 500 |
| 190392 | 150 | survived | village | 4 | 199 | 79 | 800 |
| 190393 | 112 | village-lost | village | 4 | 199 | 79 | 2,489 |
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
| **this stall-cut-32 leg** | **stall cut 32 `715c2918d`** | **1/8** | **0/8** | **102d** |

The picture sharpens: at commit 32 the villages still cannot reach
regional at all (0/8, same as the merge-base), while by commit 65 they
reach regional 8/8 but still all die. So the regional-unlock transition
and the survival collapse are TWO different transitions inside the
window — regional unlocks somewhere in commits 33–65, and survival was
already collapsed at commit 32 (1/8, median 102d, identical median to
the merge-base leg). The collapse predates the regional fix; whatever
lands in 33–65 lifts rank without lifting survival.

## Death-cause shares (669 deaths)

| Cause | n | Share |
|---|---|---|
| villager combat | 254 | 38.0% |
| expedition | 183 | 27.3% |
| combat | 104 | 15.5% |
| the wild | 83 | 12.4% |
| monster | 15 | 2.2% |
| the arena | 9 | 1.3% |
| sickness | 8 | 1.2% |
| a wound that wouldn't close | 4 | 0.6% |
| ambush | 2 | 0.3% |
| a stranger / The Callback / Gavel / The Loud Beast / Spool / contest | 1 each | 0.1% each |
| starvation | 1 | 0.1% |

Combat + expedition + wild = 624/669 (93%). Villages die fighting, not
hungry — the same combat-heavy profile as survivalcontrol. Starvation is
1 death in 669. Food is not the killer on this cut; monster pressure is.

## Wave-5 choke read (peak living wave-4+ veterans per seed vs bar of 2)

Peak living veterans with a wave-4+ kill (`vetsW4` count over the daily
snapshots; the wave-5 readiness bar needs 2):

| Seed | Peak living wave-4+ vets | Wave-4 slain (max) | End ready5 veterans |
|---|---|---|---|
| 190391 | 1 | 1 | 0 |
| 190392 | 1 | 3 | 0 |
| 190393 | 0 | 0 | 0 |
| 190394 | 1 | 3 | 1 |
| 190395 | 1 | 2 | 0 |
| 190396 | 1 | 1 | 0 |
| 190397 | 1 | 2 | 0 |
| 190398 | 0 | 0 | 0 |

No seed ever holds 2 living wave-4+ veterans at once. The wave-5 door
never opens on any seed — and it could not have: the second veteran
never survives long enough to stand beside the first. (Peak living
wave-3+ veterans reached 7 on seed 190393, so lower-wave kills happen;
the step up to wave-4 kills is where the veteran pipeline breaks.)
End-of-run `ready5` veterans: 1 on seed 190394 only, 0 elsewhere.
Tribute-ready: 0/8 (all `veterans-short`, need 2, have 0–1).

## Phantom days

**0 phantom days on all 8 seeds** (W3 and W4), as the prereg expected —
the roster-check fix is swapped in, and the shadow old-rule count never
exceeds the live roster-checked count on any day. No dead or off-roster
killer is counted anywhere in this band.

## Blooded

**1/8 blooded** (seed 190394 only). Per the prereg, the BLOODED block in
the swapped-in `standing.js` has no callers on this base — the read is a
report field only (the village *would* be blooded under the local rule),
not evidence any fight was blooded.

## ARC IV firing — REPORTED field only (not judged)

**The instrument does not capture ARC IV.** Neither the driver
(`scripts/bisect-stallcut32-driver-20261112.js`), the vetfirst
instrument (`scripts/vetfirst-instrument-20261111.js`), nor the
analyzer records any Arc field — a grep over all three finds no arc
capture, and no per-seed JSON carries an arc key. ARC IV firing per
seed is therefore **not recorded** in this corpus; the prereg's judged
rules are unchanged by this. (ARC IV tracks rank, and rank here is
village on all 8 seeds, so ARC IV firing 0/8 is consistent with the
rank read — but that is an inference from the rank field, not a
measured ARC IV field, and is stated as such.)

## Village assessment (plain words)

The villages on this cut look like villages that know how to fight and
still lose. They meet monsters at the door with named defenders — Kurt,
Colin, Leo, Raj, Meera; Kofi, Javier, Danylo; Bessie, Tikhon, Pilar,
Aroha — put monsters down, get hurt doing it, and bury the ones who do
not come back. The System calls out veteran kills on camera ("Ingrid
just put down The Focus Group... REMEMBER the name"), so the kills that
do happen are seen and named. But the arithmetic never works: a village
loses 51–135 people over 62–150 days, the pantry swings wildly (0 to
14,276 kcal at the end — seed 190397 dies rich), and standing parks at
199, one point short of regional, on seven of eight seeds. The one
survivor (190392, 150 days) is not a village on the rise; it is a
village that has not died yet, still at village rank, still at 199.
Nobody reaches regional, nobody is tribute-ready, nobody opens wave 5.
The stall is not a standing shortfall — it is a survival shortfall
wearing a standing number.

## Sense-testing (SENSE-TESTING LAW)

Read veteran-kill / defense lines (`vetSays`) on seeds 190391–190393
(11, 18, 15 lines). The lines are coherent and specific: defense
reports name the actual defenders and the actual outcome ("3 put down,
2 driven off. Kurt, Colin, Leo, Raj, Meera are hurt"), veteran-kill
callouts name the killer and the monster ("Olivia just put down Spool",
"Danylo just put down Spool", "Aroha just put down Ad Break"). Death
records show named villagers dying in named ways across days, not a
single repeated template. One scripted line repeats verbatim across
seeds — the System's "AUDIENCE NOTES / FINAL DRAFT" broadcast — but
that is a broadcast, not villager speech, so the repetition is in
character. No robotic, static, or repeated villager behavior flagged on
this cut; the blank here is survival, not dialogue.

## What this leg changes

Nothing in game code. Instrument-only arm: the corpus, the analyzer
summary, this evidence file, and the proof test. One fix found while
running the proof: the proof test's wrong-sha refusal regex said
`BISECTSTALLCUT STOP` while the driver prints `BISECTSTALLCUT32 STOP`
everywhere — the driver was refusing correctly (exit 2, exact STOP
line, verified by a manual reproduction) and the test's regex was
missing the "32". Fixed the regex in
`scripts/test-bisect-stallcut32-a.js`; the proof is now 63 passed,
0 failed. No driver or game-code change. The next bisect step
belongs to the coordinator: the stall transition is now narrowed to
commits 33–65 (`715c2918d..a18d7438c`); the midpoint of that half is
the natural next cut. Note for that cut: the LEG 3 tribute
scholar-exclusion (`b1c8e730c`, 61st commit in the window) sits inside
commits 33–65, so a cut past it will split the ladder/scholar reads —
the proof test's scholar-rule detection (which this leg exercised
against the old always-counts-scholar rule) will matter there.

## Metric review (§14)

- The metric set held. Regional and survival both classified cleanly
  (0/8 and 1/8 — no borderline 3–4/8 band, no re-scoring needed).
- The standing-199 plateau is a finding the metrics did not anticipate:
  seven seeds ending one point under regional suggests the rank read
  (binary regional yes/no) hides a near-miss structure. A future run
  could report standing distribution alongside the binary, but the
  binary stays the judge — this is a proposal for the NEXT run, not a
  re-score of this one.
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
- Analyzer exit 0; summary at
  `evidence/2026-11-12/bisect-stallcut32-a-summary.json`; corpus at
  `evidence/2026-11-12/perseed-bisect-stallcut32-a/` (8 per-seed JSONs).
- Balanced panel (§15): N/A per prereg — instrument-only single leg, no
  code change; the before/after comparison IS the merge-base / stall-cut
  legs vs this leg on identical seeds.
- Telemetry deviation check (Loop A body step 10): attempted — see
  appendix below.
- Convergence: scale-onramp still blocked — national 0, table 0, wins 0
  on this cut. The stall transition is now localized to commits 33–65.

## Appendix — telemetry deviation check

Attempted after writing this evidence, exactly as the Loop A body
prescribes:

```
node scripts/telemetry-check.js --baseline ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-12/perseed-bisect-stallcut32-a/*.json' --metrics national,table,wins,exiled
```

**REFUSED by the tool** (same as prior bisect arms): "refusing
recorder-corpus input: all 8 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs. Recorder
corpora are compared with sweep-compare tables, never against a run
baseline here." Recorded, not waived; the baseline was NOT rolled
forward. No LOUD lines were produced, so there is no same-run deviation
to investigate — the refusal itself is the standing tooling gap for
bisect legs.
