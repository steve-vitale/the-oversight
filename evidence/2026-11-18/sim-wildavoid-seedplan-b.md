# sim-wildavoid-seedplan-b — re-registered confirm of the wild-avoid seedplan (finding #2556)

**Arm:** sim-wildavoid-seedplan-b, Loop A run fleshout-20261118T1515Z follow-up, axis scale-onramp.
**Branch:** `sim-wildavoid-seedplan-b`, base master at the coordinator's
registration (tip c4a9ba498 at registration; build commits: ba5568812
cherry-pick of 4f5feae78 fix, 65e0ebc07 cherry-pick of 646f661b1 driver
validation, 594e27716 frozen prereg, 877c5387f corrected instruments +
proof test).
**Verdict: NO-GO (confirm)** — B2 (launches 92 → 76, 82.6% vs bar ≥90%),
B3 (wild deaths 25 vs 22), and C2 (starvation deaths 5 vs 2) fail with
population present, per the frozen prereg. The fix is judged, not the
metric: B1 and B5 — the two bars #2556 broke — both PASS on the confirm
under the corrected bars, and the B2 launch floor cleared (92 ≥ 8), so
this NO-GO is a lever verdict, not a metric-construction miss. The fix
stays HELD on the branch, unmerged; the coordinator's revert fallback
for the wildavoid fix remains held in reserve, not triggered by this
NO-GO (the seedplan is an addition to the landed avoid, not the avoid
itself — the avoid's own numbers are unchanged).
**Prereg:** `evidence/2026-11-18/sim-wildavoid-seedplan-b-prereg.md` (frozen
before the sweep; corrected bars: B1 avoids-vs-avoids, B5 sayOk per-leg,
B2 confirm-only launch floor, `wild-avoid` seed-path label).
**Bands:** pilot 104601–104608 (8 seeds, DELIBERATE matched reuse of the
1515Z pilot band) + confirm 104701–104712 (12 seeds, FRESH — verified
0 hits in every prereg). 150d death-aware, policy competent verbatim,
substrate VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1, SEEKGATE unset,
FIGHTALLY2 unset. Two legs on identical seeds: MODE=ctl (WILDAVOID=1,
WILDSEEDPLAN unset) vs MODE=arm (WILDAVOID=1 + WILDSEEDPLAN=1).
**Fix under test:** `src/js/game.js` only — both wild-router avoid
branches (`resolveWildMonsterEncounter`, `resolvePatrol`) call
`winPlanSeedFromFight(vid, mdef, 'avoided')` when WILDSEEDPLAN=1 AND
VETREENGAGE=1, excluding raids and aid-crisis fights at the door. The
seed function itself is unchanged.

## The lever, in plain words

When villagers meet a wave-4-or-worse beast out in the world with too small
or too poorly geared a party, they step aside instead of fighting — one
spoken line ("going back for help"), the beast stays in the world. The
seedplan makes the line true: the avoid now seeds a re-engagement plan
through the SAME function a flee uses. Full geared parties fight exactly
as before. Raids at the haven door are exempt from avoiding, exactly as
before.

## Pilot (8 seeds, 104601–104608) — reproduction + corrected-bar sniff test

The pilot reproduces the 1515Z corpus EXACTLY (268/268 v4seeds rows
identical except the `caller` frame — the -b driver now skips its own
wrap frame, so the row names the real game caller — and the 4 avoid-seed
`path` labels, now `wild-avoid` instead of
`unknown-avoided-no-gate-frame`; all other top-level fields identical
except `anchorCommit`). Pilot numbers match the 1515Z table cell for cell.

| Measure | Control | Arm | Bar (pilot: ratio only, floors confirm-only) | Result |
| --- | --- | --- | --- | --- |
| Wild wave-4+ meetings | 89 (world-tick 37, aid 52) | 89 (identical) | — | reproduction exact |
| Wild avoids | 4 (all world-tick, seed 104607) | 4 (identical) | B1 ratio | **PASS (ratio 1.0)** |
| Ctl would-avoid wild meetings (context) | 1 (a raid — the Kartono case) | — | context only | — |
| B1 contact (ctl avoids ≥ 8) | 4 | — | confirm-only floor | reported, not judged on pilot |
| Wave-4 launch events / instances | 5 / 5 | 5 / 5 | ≥ 90% of ctl (B2 ratio) | **PASS** |
| Wild wave-4+ deaths | 18 | 18 | arm ≤ ctl (B3) | **PASS** |
| Wild flee damage | 2,528 | 2,528 | arm ≤ ctl (B3) | **PASS** |
| Outmatched non-raid Suburb deaths (arm) | — | 0 | arm == 0 (B4a) | **PASS** |
| Outmatched non-raid Suburb meetings fought (arm) | — | 0 | 0 (B4b) | **PASS** |
| Instrument (B5) | 8/8 files, 0 errors, D3 28/28 = 1.0, say lines 4/4 ctl, 4/4 arm | same | per-leg sayOk | **PASS** |
| Median survival (C1) | 136 | 136 (ratio 1.0) | arm ≥ 0.90 × ctl | **PASS** |
| Starvation deaths (C2) | 0 | 0 | arm ≤ ctl | **PASS** |
| Community loss (C3) | 5 | 5 | arm ≤ ctl + 1 | **PASS** |
| Panel (§15) | review_required, no `regression_signal`, all paired deltas 0 | — | no `regression_signal` | **PASS** |

**Pilot sniff test: PASS** per the frozen prereg (reproduction exact; B1
ratio 1.0; B2 ratio 5/5; B3/B4/B5/C1–C3 pass; panel clean). NOTE: the
analyzer's `verdict` field on the pilot invocation reads METRIC-BROKEN,
driven solely by B1 contact (ctl avoids 4 < 8) — the analyzer's verdict
logic is the CONFIRM logic (floors live). The prereg froze the pilot
sniff test separately: the population floors are confirm-band gates and
are reported, not judged, on the 8-seed pilot. The B1-contact shortfall
on the pilot was EXPECTED (the band stages 4 avoids, proven twice now),
not a pilot failure. The confirm was therefore run, per the prereg.

## Confirm (12 seeds, 104701–104712) — before / after on identical seeds

| Measure | Control | Arm | Bar | Result |
| --- | --- | --- | --- | --- |
| Wild wave-4+ meetings | 244 (world-tick 135, aid 109) | 225 (world-tick 130, aid 95) | — | — |
| Wild avoids | 32 (world-tick 29, aid 3) | 29 (world-tick 22, aid 7) | B1 ratio ≥ 0.5, contact ≥ 8 | **PASS (ratio 0.9063, contact 32)** |
| Ctl would-avoid wild meetings (context) | 4 (all outmatched) | — | context only | — |
| Avoid-seed rows (`wild-avoid` path, raw corpora) | 0 | 22 (17 unblocked, 5 blocked Suburb) | reported | seed fires |
| Wave-4 launch events / instances | 92 / 92 | 76 / 76 | ≥ 90% of ctl (B2), floor 8 | **FAIL (82.6%)** |
| Wild wave-4+ deaths | 22 | 25 | arm ≤ ctl (B3) | **FAIL** |
| Wild flee damage | 9,040 | 8,018 | arm ≤ ctl (B3) | PASS (half) |
| Wild wave-4+ kills | 14 | 12 | reported | — |
| Outmatched non-raid Suburb deaths (arm) | — | 0 | arm == 0 (B4a) | **PASS** |
| Outmatched non-raid Suburb meetings fought (arm) | — | 0 | 0 (B4b) | **PASS** |
| Wild Suburb deaths, all parties | 0 | 1 (verified below) | context (orig. B4) | — |
| Trick-known seeds | 4 | 4 | context | — |
| Instrument (B5) | 12/12 files, 0 errors, D3 91/91 = 1.0, say lines 32/32 | 12/12 files, 0 errors, D3 77/77 = 1.0, say lines 29/29 | per-leg sayOk | **PASS** |
| Total deaths, all causes | 1,160 | 1,143 | reported | — |
| Median survival (C1) | 147.5 | 146 (ratio 0.9898) | arm ≥ 0.90 × ctl | **PASS** |
| Starvation deaths (C2) | 2 | 5 | arm ≤ ctl | **FAIL** |
| Community loss (C3) | 7 | 8 | arm ≤ ctl + 1 | **PASS** |
| Panel (§15) | review_required, no `regression_signal`, 1 `regression_watch` (community loss +0.0833) | — | no `regression_signal` | **PASS with watch investigated below** |

Per-seed confirm (launches events/instances, wild deaths, starvation, avoids, gameDays):

| Seed | Launches ctl → arm | Wild deaths | Starvation | Avoids | Survival |
| --- | --- | --- | --- | --- | --- |
| 104701 | 0 → 0 | 4 → 4 | 0 → 0 | 0 → 0 | 142 → 142 |
| 104702 | 0 → 0 | 1 → 1 | 0 → 0 | 0 → 0 | 147 → 147 |
| 104703 | 5 → 5 | 0 → 0 | 0 → 0 | 0 → 0 | 151 → 151 |
| 104704 | 24 → 24 | 0 → 0 | 0 → 0 | 0 → 0 | 151 → 151 |
| 104705 | 2 → 4 | 0 → 2 | 0 → 1 | 2 → 5 | 150 → 134 |
| 104706 | 9 → 9 | 4 → 4 | 0 → 0 | 5 → 5 | 102 → 102 |
| 104707 | 0 → 0 | 3 → 3 | 1 → 1 | 2 → 2 | 113 → 113 |
| 104708 | 31 → 13 | 4 → 5 | 0 → 2 | 19 → 13 | 138 → 138 |
| 104709 | 6 → 6 | 0 → 0 | 0 → 0 | 4 → 4 | 148 → 148 |
| 104710 | 4 → 4 | 4 → 4 | 0 → 0 | 0 → 0 | 151 → 151 |
| 104711 | 11 → 11 | 2 → 2 | 1 → 1 | 0 → 0 | 145 → 145 |
| 104712 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 | 150 → 150 |

Ten of twelve seeds are byte-identical on the judged bars. The entire
NO-GO lives on two seeds, 104705 and 104708, both diverging the first
time after their first avoid (trajectory control PASS on all 12 seeds:
104705 div d92 ≥ first avoid d86; 104708 div d81 ≥ first avoid d80).

## Why B2 fails — the launch loss is one village, 104708

Launches 92 → 76 (-16). Seed 104708 alone accounts for -18 (31 → 13);
seed 104705 GAINS +2 (2 → 4); the other ten seeds are identical. On
104708 the arm village's whole launch pipeline shrank, not just the
avoided species: reunion launches 20 → 12, herald launches 8 → 0,
influencer 3 → 1; dawnbidDeparts 45 → 24, dawnbidCensus rows 341 → 190,
dawnbidStarts 42 → 17. The mechanism is visible in the seed pool: fled
seeds fell 78 → 60 (world-tick 33 → 25, agency-evade 22 → 12,
agency-flee 23 → 10) while avoid-seeds added only 12 — net -18 seeds,
the same -18 as the launch loss. One villager met the reunion 7 times
in a week (d80–87) and avoided every time; each avoid retargeted the
same stalled party-stage plan instead of producing a flee-seed, and the
village fought fewer expedition fights overall (encounters 75 → 57).
The seed does not just add plans — on a village where one villager
loops on the same beast, it converts would-be flee-seeds into retargets
of a plan whose party never forms (#2547), and the launch pipeline
starves. The herald launches going 8 → 0 shows the loss is not
target-specific: the village launches less at everything.

The counter-case is 104705, where the seed works exactly as designed:
the d86 influencer avoid seeded a party-stage plan, and the arm leg
launched FOUR influencer hunts (d92, d96, d97, d101; dawnbidCensus
influencer rows 0 → 51) where the control launched none at the
influencer. But the launches did not convert: the parties went out at
sizes 3/2/3/2 with 1/0/1/1 killers and 2/1/2/1 armed, and every
subsequent influencer meeting ended in a flee taking 12–104 damage —
0 kills on the arm leg vs 3 on the control. The seed restores launches;
the launches fail at the party (#2547 again — the plan bids and
launches, but with whoever is around, not a formed party).

## Why B3 and C2 fail — the same two divergences

- B3 (wild deaths 22 → 25): 104705 contributes +2 (0 → 2, the village
  died d134 on the arm leg after the d86 seed; expedition deaths
  13 → 18, wild kills 3 → 0) and 104708 contributes +1 (4 → 5). The
  flee-damage half PASSES (9,040 → 8,018) — the avoid still banks the
  flee price; the deaths half fails on the two diverged villages.
- C2 (starvation deaths 2 → 5): 104705 contributes +1 and 104708 +2,
  both on the diverged legs. The starvation follows the same cascades
  (104705's village died early; 104708's village fought less and ate
  worse), not a food-economy effect of the seed itself.
- C1 passes (146 vs 147.5) and C3 passes (8 vs 7, within +1) — the
  cost is concentrated, not band-wide.

## B4 verification (from the corpora, not on trust)

The single arm-leg wild Suburb death is seed 104708, day 88, Sari
Wulandari: a matched trio (party 3, all armed, all armored), 1 round,
wise round-1 leave, parting hit 13 damage — and it has NO counterpart
on the control leg (the control's Sari fled the Suburb safely on day
89). It is a post-divergence meeting (first avoid on that seed was day
80), not an outmatched meeting the lever failed to avoid: the frozen
classifier (wild snapshot: party 3, armed, armored) does not call it
outmatched, and no outmatched non-raid Suburb meeting was fought on
either leg. B4 re-scoped passes. The other bad-outcome Suburb row,
seed 104712 day 136 (a 7-round vKill, 330 dealt, 50 taken), is
byte-identical on both legs. The 3 Suburb avoid-seeds on 104708 day 129
(Dmitri) are recorded with `blocked: true` and the plan keeping its
existing target ('influencer') — the flee-repair exclusion held in the
wild exactly as the proof test stages it: a Suburb avoid seeds nothing.

## Panel compare (the instrument; the prereg is the judge)

`balance-panel.js compare` on the 12 paired confirm seeds:
**review_required**, no `regression_signal`, one `regression_watch` line:
Community loss 0.5833 → 0.6667 (+0.0833). Investigated, not waived: the
+0.0833 is exactly one village — 104705, village-lost day 134 on the
arm leg vs survived to 150 on the control — the same single-seed
divergence already counted in B3/C2/C3. It is not a separate hidden
regression. Every other metric is `no_material_signal` with paired
delta 0 (village deaths per run 96.67 → 95.25, -1.42).

## Reachability verdict

The content in this arm's area is reachable: wave-4 meetings on all 12
confirm seeds on both legs (244/225 wild meetings), wave-5 on 5/3 seeds,
launches fired 92/76 times. The avoid fired 32/29 times on the confirm
band (vs 4/4 on the pilot) — the confirm band stages the avoid, and the
seed fires with it (17 unblocked avoid-seeds band-wide).

## Wall numbers (confirm, both legs)

National standing (≥200): 5/12 ctl → 3/12 arm. National rank: 0/12 both.
Table: 0. Wins: 0. Wave-4 unlocked: 12/12 both. Wave-5 unlocked: 5/12 →
3/12. Median survival: 147.5 → 146 days. The wall is unchanged in kind:
villages reach 200+ standing on a quarter to a third of the band and
none convert to national rank. Seven of twelve control villages sit at
exactly standing 199 — the STANDING-199 stall, visible again.

## Village assessment, in plain words

The seed does what it was built to do, where it gets a clean shot: on
one village, a woman stepped aside from a beast, a plan was left behind,
and her village sent four hunting parties after that beast over the next
two weeks — where before, nobody ever went back at all. But the parties
went out too small and too green, and every one of them ran from the
beast instead of killing it, and that village died a month early anyway.
On the other village that mattered, the seed did something worse than
nothing: one villager kept meeting the same beast and stepping aside
seven times in a week, and each step-aside filed the same plan away
instead of starting a new one, and the whole village slowly stopped
going out after beasts at all — eighteen fewer hunts than its twin, and
the hunts it lost weren't even for that beast. Everywhere else the two
legs are the same village living the same life. The promise is now kept
at the seeding step and broken at the party step: plans are made, but
nobody comes to fill them, and the hunts that do go out go out weak.
Finding #2547 (avoid-seeded plan stalls at party formation) is not just
still open — on this band it is the thing that decides whether the seed
helps or hurts.

## Sense-testing notes (read the transcripts, not just the counts)

Avoided meetings (confirm band):

1. **The reunion loop (seed 104708, days 80–87).** One villager meets
   the same Reunion seven times in eight days and says the same line
   seven times. Each avoid retargets the same party-stage plan. The
   transcript reads as a person sensibly refusing a fight they cannot
   win — and then nothing changes: no party, no hunt, same beast, same
   corner, seven times. The repeat-avoid loop (#2545) with a plan
   attached is still a loop.
2. **The influencer hunts (seed 104705, days 92–101).** Four launches
   at the Influencer, parties of two and three, one killer at most.
   The follow-up meetings all end in flight — 12, 88, 39, 104, 81
   damage taken — and the beast is never killed. The launches read as
   a village trying, with the wrong people.
3. **Yuki and the Influencer (pilot seed 104607, days 106–107).**
   Reproduced exactly: four meetings, four lines, a plan that bids at
   dawn for 35 mornings with an empty party, her health sliding 54 →
   13. The promise half-kept, again.

Fought meetings (confirm band):

4. **Sari and the Suburb (seed 104708, day 88).** Matched trio, wise
   round-1 leave, gear absorbs the hits — and the parting HOA Fine
   still kills her at 13 damage. The leave-trick does not make the
   leave free; the re-judge's correction, live again. Her twin on the
   control leg walked out of the same streets the next day.
5. **Raids stay defence (confirm band).** 43 raid meetings on the arm
   leg, 0 raid avoids — the exemption holds in the wild. And the
   control's entire would-avoid population (4 meetings) is raids: an
   algorithm and an influencer at the haven door on day 135, a reunion
   on day 87, a timeslot on day 148. Under the old B1 bar, the whole
   population would again have been the case the lever is scoped not
   to touch — the corrected bar was necessary, not cosmetic.

## Proof and instrument checks

- **Proof test** `scripts/test-wildavoid-seedplan-b.js`: **ALL PASS**
  (74 assertions: live avoid-seeds on both wild routers iff
  WILDSEEDPLAN=1 AND VETREENGAGE=1; flag-off avoid seeds nothing; raid
  never avoids or seeds; Suburb avoid under FLEEREPAIR2 seeds nothing;
  aid-crisis avoids on both routers seed nothing; VETREENGAGE unset
  seeds nothing; §2b corrected-bar cases — `wild-avoid` label, B1
  avoids-vs-avoids, B2 confirm floor, B5 per-leg sayOk; §3 content-only
  confinement — NO git-diff assertion, per the task warning).
- **Analyzer selftest** `scripts/analyze-wildavoid-seedplan-b.js
  --selftest`: SELFTEST ALL PASS (49 checks, incl. the corrected B1/B2/
  B5 cases and the 1515Z pilot numbers as fixtures).
- **Pre-existing proof test** `scripts/test-wildavoid-a.js`: 90/91
  assertions pass. The one failure is §5 ("src changes are exactly
  game.js + win-plan.js (got [\"src/js/game.js\"])") — expected on this
  arm by design and frozen in the prereg: this arm changes only
  game.js, and §5's merge-base diff spans the whole branch, not one
  arm. The live/analyzer sections (§1–§4, 90 assertions) all pass.
- **D1 repeatability:** seed 104701, 60d, arm, run twice — outputs
  identical except the `file` path. **PASS.**
- **D2 wrap neutrality:** same seed/days, recorder ON vs OFF — all 59
  daily fingerprints identical (recorder-off run records 0 encounters,
  as expected — the recorder is off — but the game state is untouched).
  **PASS.**
- **D3 (in-analyzer):** replica-vs-live-gate agreement 1.0 on both legs
  (pilot ctl 28/28, arm 28/28; confirm ctl 91/91, arm 77/77, n ≥ 5).
  **PASS.**
- **B5 cross-checks (confirm):** 0 unclassified rows both legs; every
  arm avoid row's snapshot classifies outmatched (0 mismatches);
  `winPlanStats.wildAvoids` == recorded avoids (29 == 29);
  'gives it room' say lines == avoids on EACH leg (ctl 32 == 32, arm
  29 == 29); missingRaid 0/0; trajectory PASS on all 12 seeds (first
  divergence day ≥ first avoid day, or identical with no avoid).
- **Smoke:** 1-seed 30d arm run clean (0 errors) but wave 4 had not
  unlocked by day 31 (maxWave 2), so no avoids — extended to 150d on
  the same seed per the prereg: 29 encounters, 0 avoids (seed 104701
  stages no avoid on either leg), 0 errors, `raid` present on all 29
  encounter rows.
- **Reproduction:** the -b pilot corpora reproduce the 1515Z pilot
  corpora exactly (see Pilot section).
- No `check.js` run in this arm (no src/ change gate beyond the proof
  tests; the coordinator runs the gate at merge).

## Blanks

- No patrol wild meetings on either leg on either band (0/89 pilot,
  0/244 ctl confirm) — the patrol half of the seed is built and
  proof-tested live, but unmeasured in the wild on every band so far.
- The veteran-guard half of the gate fired nowhere — unmeasured, as scoped.
- Foreign aid allies are not counted in the avoid's party (no gear read
  exists for them); the watch (`helpAtDoor`) recorded 0 avoids with
  foreign faces at the door on both bands, so the question stayed moot.
- The seed-path classifier now labels wild-router 'avoided' seeds
  `wild-avoid` (22 rows on the confirm arm leg, 0 on ctl; 5 of the 22
  are blocked Suburb calls that seed nothing). The analysis JSON's
  perSeed objects do not carry the v4seeds rows (seedAnalysis strips
  them after counting) — the `wild-avoid` counts above were read from
  the raw corpora, not the analysis JSON.
- The pilot analyzer `verdict` field reads METRIC-BROKEN on the pilot
  invocation (B1 contact) while the prereg's pilot sniff test passes —
  see the Pilot section note. The analyzer's verdict logic is the
  confirm logic; a future instrument pass could thread the pilot
  distinction into the verdict field instead of leaving it to the
  evidence file.

## Metric review

- **Finding #2556 is CLOSED by this re-registration.** Both halves of
  the construction miss are fixed and both fixed bars PASS on the
  confirm with population present: B1 (arm avoids 29 vs ctl avoids 32,
  ratio 0.9063, contact 32 ≥ 8) and B5 sayOk per-leg (ctl 32 == 32,
  arm 29 == 29). The corrected bars judged the fix instead of the
  instrument. The `wild-avoid` label is taught (22 rows on the arm leg,
  0 on ctl). The B2 floor worked as designed (ctl launches 92 ≥ 8, so
  B2 was judged, not broken).
- **The NO-GO is a lever verdict, not a metric verdict.** B2 fails at
  82.6% with a judged population — the seedplan costs launches on this
  band, driven by one village (104708, -18) against a +2 gain on
  another (104705). The bar did its job: it caught a real cost the
  pilot could not see (5 launches cannot distinguish help from harm).
- **B1's ratio (0.9063) is a fidelity read, not a success read.** The
  arm leg avoids FEWER times than ctl (29 vs 32) because its
  trajectories diverge after the first seeds — the avoid is the same
  rule on both legs, but the seeded plans change what meetings happen
  next. A ratio near 1.0 with divergent trajectories is expected, not
  suspicious; the trajectory control (divergence ≥ first avoid) is what
  guards it, and it passes on all 12 seeds.
- **The B2 floor (8) was easily cleared (92).** On a launch-poorer
  band it would have mattered; here it did not bind. The floor stays
  for the next run — it costs nothing when the band is rich.
- **Instrument deviation (recorded, not hidden):** the confirm corpora
  live in `perseed-wildavoid-seedplan-b-confirm-ctl/` and
  `-confirm-arm/`, not the prereg-named
  `perseed-wildavoid-seedplan-b-ctl/` / `-arm/`. The prereg named one
  directory per leg for both phases, but the analyzer loads a whole
  directory and the pilot files already occupied those names — mixing
  the bands would have broken the frozen 12/12 file check. The first
  confirm launch (same OUTDIRs) was killed before any file was written
  (0 confirm files, verified) and relaunched into the `-confirm-`
  directories. The pilot analysis ran from the pilot directories
  before the confirm existed, so no analysis was re-run or re-scored.
- **safe-commit index clobber (recorded):** after the instruments
  commit (877c5387f, correct: 3 files, 2723 insertions), the worktree's
  main index showed all 4 new files staged-as-deleted with the worktree
  copies untracked (the known safe-commit clobber). Repaired with
  `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`; verified `git status --short` empty, `git diff HEAD`
  empty, and hash-object == HEAD blob for all 4 files. The commit was
  never at risk; only the index lied.

## Next steps (named, for the coordinator)

- The seedplan as built does NOT restore launches on a launch-rich
  band (92 → 76) — it costs them where one villager loops on the same
  beast. The next lever is the party, not the seed: finding #2547
  (avoid-seeded plan stalls at party formation) now has a second,
  sharper instance (104705's launched-but-fleeing parties, 104708's
  stalled reunion plan starving the pipeline). Any follow-up arm should
  target party formation for seeded plans (or the repeat-avoid loop,
  #2545) — re-tuning the seed or the launch bar will not fix what the
  confirm measured.
- The fix stays HELD on this branch. Whether to land it despite the
  NO-GO (the avoid itself is unchanged; the seed helps one village
  and hurts another) or to revert it is the coordinator's call — this
  arm makes no landing recommendation beyond the frozen verdict.

## Files

- Prereg: `evidence/2026-11-18/sim-wildavoid-seedplan-b-prereg.md` (frozen before the sweep).
- This evidence file: `evidence/2026-11-18/sim-wildavoid-seedplan-b.md`.
- Fix (cherry-picked, unchanged): `src/js/game.js` (commits ba5568812
  ← 4f5feae78, 65e0ebc07 ← 646f661b1); src scope verified via
  `git diff --name-only <base> <branch> -- src/js/` (exactly
  `src/js/game.js` — see report).
- Instruments + proof test: `scripts/wildavoid-driver-seedplan-b.js`,
  `scripts/analyze-wildavoid-seedplan-b.js`,
  `scripts/test-wildavoid-seedplan-b.js` (commit 877c5387f).
- Pilot corpora: `evidence/2026-11-18/perseed-wildavoid-seedplan-b-ctl/`
  and `-arm/` (8 files each); analysis
  `wildavoid-seedplan-b-pilot-analysis.json`; panels
  `wildavoid-seedplan-b-pilot-panel-before.json.gz` / `-after.json.gz`,
  compare `wildavoid-seedplan-b-pilot-panel.md`.
- Confirm corpora: `evidence/2026-11-18/perseed-wildavoid-seedplan-b-confirm-ctl/`
  and `-confirm-arm/` (12 files each); analysis
  `wildavoid-seedplan-b-analysis.json`; panels
  `wildavoid-seedplan-b-panel-before.json.gz` / `-after.json.gz`,
  compare `wildavoid-seedplan-b-panel.md`.
- Finding #2556: CLOSED by this re-registration (report to coordinator
  for the sim-findings.md update — this arm does not edit goal
  hidden_files).
- Finding #2547 (avoid-seeded plan stalls at party formation): still
  open, now with confirm-band instances (104705 launched-but-fleeing
  parties; 104708 stalled reunion plan starving the pipeline).
