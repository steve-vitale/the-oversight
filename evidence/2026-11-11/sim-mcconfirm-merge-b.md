# Survival-collapse confirm MERGE leg — evidence (arm sim-mcconfirm-merge-b)

Run fleshout-b-2026-11-12T03:29Z, Loop B, axis scale-onramp / winnability
chain. ADOPTION: the original run died by cron timeout during a host
write flap (~04:21–04:42Z, 2026-11-12); the flap was probed CLEAR at
06:32Z and this adoption finished the arm. Prereg:
`evidence/2026-11-11/sim-mcconfirm-merge-b-prereg.md` (committed
`6c8c88bc5`), read in full before any judged sim. Base:
`e4dbe581b` (reconcile-divergence merge). Policy: competent verbatim.
Horizon: 150d death-aware (+10d tail max). Seeds 190419–190434 (16,
fresh band). Mode `fix` only, with the r131 roster-check fix swapped
in uncommitted (see §8). Instrument: `vetfirst-instrument-20261111`
(uncommitted scratch, deleted at closeout) + driver live shadow
old-rule count per snapshot.

## 1. Headline numbers

| Leg | Base | Seeds | Survived | Median |
|---|---|---|---|---|
| vetphantom fix leg | pre-reconcile master `5157782a4` | 190391–190398 (8) | **6/8** | **150d** |
| bisect-merge-a | merge `e4dbe581b` | 190391–190398 (8) | **1/8** | **126d** |
| **this confirm leg (merge-b)** | merge `e4dbe581b` | **190419–190434 (16)** | **1/16** | **111d** |
| sibling control leg | `5157782a4` | 190419–190434 (16) | ? | ? |

This leg: **survived 1/16, median 111d** (upper-median convention,
same as merge-a). The single survivor is seed 190433 (150d, standing
460, regional, wave 5, 135 deaths — it lived the full horizon but
still ended short of national). Every other seed ended
`village-lost` between day 56 and day 148.

## 2. Scale wall (reported every run)

- Wins: **0/16**. National: **0/16**. Table: **0/16**.
- Regional: 15/16; village: 1/16 (seed 190420, 56d).
- Wave 5 unlocked: **3/16** (190425, 190432, 190433). Wave 4: 16/16.
- Median survival: **111d**. Standing range: **125–460**.
- Blooded (wave-4 kill recorded): 3/16 (190425, 190429, 190433).
- Tribute-ready days: **0/16 seeds ever ready** — every seed ends
  `veterans-short` (need 2; best is 1 veteran, seed 190425).
  Readiness-4 was reached on ≥1 day on 6 seeds (190423, 190425,
  190427, 190429, 190431, 190433 — 1 day each); readiness-5 on ≥1 day
  on 3 seeds (190425, 190429, 190433 — 1 day each). The
  readiness-5 release never held long enough to matter: no seed
  converted a ready-5 day into a wave-5 facing that survived.
- Phantom days: **0 over 1,716 daily rows** — the shadow old-rule
  veteran counts match the live roster-check counts on every
  snapshot day, as expected with the fix swapped in.

## 3. Death-cause shares (1,209 deaths)

| Cause | n | Share |
|---|---|---|
| villager combat | 566 | 46.8% |
| expedition | 218 | 18.0% |
| combat | 180 | 14.9% |
| the wild | 176 | 14.6% |
| monster | 24 | 2.0% |
| ambush / contest / arena / stranger / sickness / wound | 5 each | 0.4% each |
| thirst | 5 | 0.4% |
| starvation | 4 | 0.3% |
| dehydration | 1 | 0.1% |
| named beasts (Loud Beast, Old Stare, Loud-Eyes) + alien + night | 1 each | — |

Combat-shaped deaths (villager combat + combat + the wild +
expedition + monster + ambush) = 1,169/1,209 = **96.7%**. This
reproduces merge-a's combat-heavy profile (585/621 combat /
expedition / wild, starvation 0) on fresh seeds: villages are not
starving — they are being fought to death in the wild and on
expeditions. Food is not the binding killer here; the fight is.

## 4. This leg against the joint rule (NO joint verdict claimed)

The prereg's joint rule (coordinator reads both legs):

- **CONFIRMED** if merge ≤ control − 4 AND control ≥ 8/16.
- **REFUTED** if merge ≥ control − 1.
- **INCONCLUSIVE** otherwise.

With this leg's merge = **1/16**, the mapping is: control ≥ 8 →
CONFIRMED; control ≤ 2 → REFUTED; control 3–7 → INCONCLUSIVE.
The sibling control leg on the same fresh band has not been read
here — `jointVerdict` in the summary JSON is
`PENDING_CONTROL_LEG`, and this file claims no joint verdict.
What this leg alone establishes: the merge base survives 1/16 on
fresh seeds, worse in rate (1/16 = 6.25% vs merge-a's 1/8 = 12.5%)
and shorter in median (111d vs 126d) than on the matched band, and
far below the vetphantom fix leg's 6/8 on its matched band. The
collapse is not a one-band artifact — it shows up again, on
different seeds, at the same order of magnitude.

## 5. Village assessment (plain words)

Sixteen villages, fifteen funerals. The shape is the same in nearly
every seed: the village reaches regional standing — people forage,
fetch water, talk, form a little society — and then the wild eats
it. Wave 4 arrives everywhere (16/16), wave 5 only sometimes
(3/16), and nobody climbs past regional. Standing piles up to 199
again and again — that 199 is a ceiling these villages keep
bumping, not a ladder they climb — while the veteran count sits at
zero. The tribute that would buy the next step needs two living
veterans and almost no village ever has even one.

The one survivor, seed 190433, is the exception that proves the
pattern: it lived all 150 days, reached standing 460 and wave 5,
blooded — and still died out in spirit terms, ending regional with
zero veterans at the end (its wave-4 killers did not stay alive to
count). Surviving the horizon is not the same as winning; nothing
in this leg got near the table.

In plain terms: on the merge base, villages can live for three or
four months and look healthy, and then the fighting kills them
faster than they can replace fighters. The pantry is fine — only 4
starvation deaths in 1,209. The missing blank is not food, it is
people who can kill a wave-4 monster and live to do it again.

## 6. Sense-testing (villagers acting like people)

Sampled `vetSays` lines across the corpus. Villagers narrate
their days in character — leaving the foraging basket at the door
when the pantry is full ("sitting with the elders instead"),
heading out for water with a spoken reason, meeting attackers at
the door in named groups and coming back hurt. No robotic or
repeated-to-identical lines were spotted in the sample; the
dialogue varies by person and situation. Nothing in this leg
changes the sense-testing picture: the villagers behave like
people; the world kills them like a meat grinder.

## 7. Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair
to compare on this base. The before/after comparison IS the
sibling control leg vs this merge leg on identical fresh seeds,
judged by the coordinator under the joint rule (§4). Same standing
as survivalcontrol-b §7 and merge-a §7. Telemetry deviation check:
attempted; the tool refuses recorder-corpus input (same refusal
class as vetphantom-b, tributedeliv-b, survivalcontrol-b,
anchor-a, and merge-a). Recorded, not waived.

## 8. Fix-swap audit trail

- At run start the on-disk `src/js/standing.js` was the swapped-in
  fix: sha256
  `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`
  (verified before the adoption seed ran; the driver guard also
  enforces marker + exact fix sha at RUN entry).
- Every per-seed JSON records `standingFix: true`,
  `standingSha: "f8fda4295a99"`.
- After the run, the merge base's original `standing.js` was
  restored byte-identical: sha256
  `75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`
  and `git status` shows NO `src/js` modification. The swapped
  file was NEVER committed. Zero `src/js` changes committed by
  this arm.
- Scratch instrument `scripts/vetfirst-instrument-20261111.js`
  (untracked copy from master) deleted before the evidence commit.

## 9. Flap-window closeout

- Original run fleshout-b-2026-11-12T03:29Z died by cron timeout
  during a host write flap (~04:21–04:42Z, 2026-11-12).
- Adoption verified the flap CLEAR at 06:32Z (coordinator probe).
- At adoption, 15/16 per-seed JSONs were FINISHED (seeds
  190419–190433); only seed 190434 was missing. The adoption ran
  seed 190434 ONLY (driver exit 0; 146d, village-lost, standing
  199, regional, maxWave 4, 0 instrument errors) — no seed was
  re-run, no finished file was overwritten (the driver refuses to
  overwrite an existing per-seed file).
- No write flap recurred during the adoption: the seed-190434
  write, the analyzer write, and the proof run all completed
  cleanly on first attempt.
- Analyzer: exit 0, complete corpus, 0 instrument errors.
  Summary: `evidence/2026-11-11/mcconfirm-merge-b-summary.json`.
- Proof: `scripts/test-mcconfirm-merge-b.js`, **65 passed, 0
  failed**, unpiped exit code 0 (checked directly, never through
  a pipe).

## 10. Metric review (§14 — the metric held; one note for the next run)

- The pre-registered primary metric (survived count on the fresh
  band, judged under the joint rule) held: it is the same count
  the coordinator needs, it was computable from the corpus
  without re-scoring, and no friendlier metric was substituted
  mid-run.
- Median survival (secondary) also held and told the same story
  in the same direction (111d vs merge-a 126d vs vetphantom
  150d), so the survived-count verdict is not a threshold
  artifact of a single lucky seed.
- Note for the NEXT run, not a revision here: the death-cause
  taxonomy splits what is really one phenomenon across five
  labels ("villager combat", "combat", "the wild", "expedition",
  "monster"). A future run that wants to judge "killed by
  fighting vs killed by scarcity" should pre-register a grouped
  combat share rather than reading five separate rows. This leg
  reports the grouped share (96.7%) as a secondary read only;
  the primary metric is untouched.

## 11. Guards (all satisfied)

- No per-seed file missing; all 16 parse. No re-runs beyond the
  single missing seed.
- Instrument errors: 0 on every seed.
- This arm does NOT re-judge the merge-a verdict
  (COLLAPSE_INSIDE_MERGE stands on its 8 matched seeds), the
  survivalcontrol verdict, or the anchor verdict. It tests
  whether the merge collapse reproduces on fresh seeds only —
  and on this leg alone, the collapse shows up again at 1/16.
- No game-code change; no `[needs-eyes]`.

## Corpus

- Summary: `evidence/2026-11-11/mcconfirm-merge-b-summary.json`
- Per-seed: `evidence/2026-11-11/perseed-mcconfirm-merge-b/` (16
  JSONs, seeds 190419–190434)
- Prereg: `evidence/2026-11-11/sim-mcconfirm-merge-b-prereg.md`
- Proof: `scripts/test-mcconfirm-merge-b.js` (65/0, committed
  `6c8c88bc5`)
