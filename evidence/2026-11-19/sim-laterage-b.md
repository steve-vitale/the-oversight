# sim-laterage-b — late Rage firing and the rounds lost after it fires

**Verdict: NO-GO, kind METRIC-BROKEN** — the pool floor fails on
the only leg that matters: **1 observable Rage fight** (floor 8)
in 127 wave-4+ encounters across 8 seeds. The taxonomy
instrument works (0 unclassified, 0 anomalies on the fight that
exists; the analyzer's `--selftest` is 16/16 and the proof test
11/11), but a 1-fight taxonomy cannot carry a fire-round
distribution or a dominant-cause call, and the verdict is NO-GO
by the frozen pool floor. That IS the finding: on this band the
binding constraint is two steps upstream of the delay — Rage
holders almost never reach a wave-4 fight at all (3 holder-fights
in 127 encounters, 2 of them evades before contact).

- **Branch:** `sim-laterage-b`, base master `1927a245e`
  (winnability-round-1230 adoption closeout)
- **Prereg:** `evidence/2026-11-19/sim-laterage-b-prereg.md`
  (frozen 2026-11-19 17:11 UTC, BEFORE any judged sim; survey
  disclosed inside — pool size only, 1 Rage fight)
- **Analysis:** `evidence/2026-11-19/laterage-b-analysis.json`
  (analyzer exit 1 on the NO-GO verdict, by design)
- **Corpus:** `evidence/2026-11-19/perseed-laterage-b/` (8 seeds,
  150 days, 0 instrument errors; judged leg log
  `laterage-b-judged.log`, survey log `laterage-b-survey.log`)
- **Seeds:** 106111–106118 (fresh band; see prereg)
- **Leg:** single diagnostic leg, substrate SENSEEXPED=1,
  PARTYSIZE4=1, VETREENGAGE=1, FLEEREPAIR2=1, FIGHTALLY2=1
  (all landed code on this master). Competent verbatim, 150-day
  death-aware. No RAGEFREE/FIELDCAPDMG carrier, no FREESTRIKE
  port, no ALLYSLOT3 port, no game-code change of any kind.

## EVIDENCE-ONLY — no game code, nothing to merge as a change

This arm adds instrument + evidence only. The coordinator lands
evidence-only (tooling/prereg/evidence cherry-pick, as
ragepreempt-b and dmgshape-b were handled) or releases the branch
done-abandoned. There is no lever here to land or to hold.

## 1. Judged numbers (frozen bars, §14 of the prereg)

| Bar | Measured | Bar | Result |
| --- | --- | --- | --- |
| Pool: observable Rage fights | **1** | ≥ 8 | **FAIL** |
| Taxonomy complete | 0 unclassified, 0 anomalies | 0 / 0 | PASS (on n=1) |
| Dominant delay cause named | field_medicine (1 of 1 delay rounds) | named + counts | PASS (on n=1) |
| Instrument errors | 0 | 0 | PASS |

GO required the pool floor + taxonomy complete + dominant cause
named. The taxonomy and dominant-cause bars pass; the pool floor
fails by 7, so the verdict is NO-GO, kind METRIC-BROKEN. The
passing bars are reported, not banked: one fight cannot carry
them — the "dominant cause" on a single delay round is a
description of that round, not a finding about delay.

### The primary metric, as measured (n=1 — descriptive only)

| Quantity | Value |
| --- | --- |
| Rage fights in corpus | 1 of 127 wave-4+ encounters |
| Fire-round distribution | { R1: 1 } |
| Late-fire share (≥ 2) | 0/1 |
| Late-fire share, dmgshape cut (≥ 4) | 0/1 |
| Mean delay to first doubled strike | null (no doubled strike ever lands) |
| Never-landed share | 1/1 (delay-to-end: 1 round) |
| Doubled strikes landed | 0 of 3 |
| 0-damage Rage-fight share | 1/1 |
| Damage/round, late-fire vs R1-fire | null vs 0.0 (n=1, both cuts empty or single) |
| Foregone damage estimate | 0 — NO BASIS (see §2) |

## 2. The one Rage fight, read in full

Seed 106113, day 76, **Diana Osei vs the Eater**, 2 rounds,
vFlee, 0 damage dealt. The full log (uncapped):

> Diana walks straight into Ugly-Eyes. No avoiding it.
> R1: Diana's eyes go red. Next 3 strikes hit twice as hard.
> (Rage) [Diana — Gardener of the Living Garden]
> Diana's gear absorbs 32.
> R1: Gorge hits Diana for 21 (14 left)
> R2: Diana stops mid-fight and binds the wound — field medicine,
> +20 HP.
> Diana's gear absorbs 48.
> R2: Smack-Rush hits Diana for 32 (2 left)
> Diana is losing — shouts for help! Damian charges in!
> Damian answered Diana's shout, but Diana is past holding —
> they run while running still works.

Engine cross-check (`roundsDetail`): Diana enters at 35 HP
against a 989-HP Eater; R1 ends at 14 HP, R2 at 2 HP; the monster
ends at 989/989 — untouched. `actionKinds`: `["ability",
"heal"]`. No morale-hold lines.

Sense-test: everything here reads true. Rage fires on round 1 —
not late — on a nearly-dead holder (the #2568 shape ragepreempt
noted: the firing gate is the monster's HP, never the holder's).
She spends the only round she has left healing instead of
striking, and flees at 2 HP while Damian arrives into the flee.
The post-fire delay cost the WHOLE window: 0 of 3 doubled strikes
landed, and the fight lasted exactly one delay round. The
foregone estimate is 0 with **no basis** — not "nothing was
lost", but "nothing in this corpus prices it": no doubled strike
landed anywhere in the corpus to price from, and this fight has
no pre-fire strikes either. The loss is real and unpriceable
here, and the evidence says so rather than inventing a number.

Fiction wrinkle, same as dmgshape's d118: the opening line calls
the Eater "Ugly-Eyes" (the village's knowledge-gated nickname)
while the mechanics lines name it — the double-naming is still
there, still minor.

## 3. Why the pool is empty — holders, not firing

Holder-fights in the corpus (fighter holds rage, `rec.holdsRage`):

| Seed | Day | Fighter | Monster | Outcome | Fired? |
| --- | --- | --- | --- | --- | --- |
| 106113 | 56 | Diana Osei | Reunion | evade (rounds 0) | no — no contact |
| 106113 | 73 | gen_wzsppgb | Reunion | evade (rounds 0) | no — no contact |
| 106113 | 76 | Diana Osei | Eater | vFlee (2 rounds) | **yes — R1** |

Three holder-fights in 127 encounters, all on one seed, two of
them evades before a round is fought. The firing gate itself is
not what starves the pool: the one holder who reaches contact
fires immediately (R1). The starvation is upstream — Rage holders
are scarce in the field-fight population, and when they do meet a
wave-4 monster they usually evade before contact. (For scale:
dmgshape-b's band, on a different substrate with the ported slot,
saw 8 Rage fights in 134 encounters — the rate itself is lumpy
band to band, and holder-fights cluster on single seeds. This
band's 1-in-127 is the low end of that lumpiness, not an
instrument miss: flag and log agree 1/1, 0 mismatches.)

Per-seed encounter counts: 106111: 16, 106112: 16, 106113: 4,
106114: 21, 106115: 26, 106116: 0, 106117: 11, 106118: 33. The
villages FIGHT wave-4/5 monsters constantly (127 encounters) —
the fights are there; the Rage holders are not.

## 4. Reachability (waves 1–5, national/table/wins, median survival)

| | This leg | Dmgshape-b (reference) |
| --- | --- | --- |
| Full wins | 0/8 | 0/8 |
| National scale | 0/8 | 0/8 |
| Table | not instrumented (0 wins) | not instrumented |
| Wave 5 reached | 2/8 (106111, 106112) | 3/8 |
| Wave 4 reached | 7/8 | 8/8 |
| Survived 150d (driver days) | 3/8 | 2/8 |
| Median survival | 137d | 133.5d |
| Community loss | 5/8 | 5/8 |

Five of eight seeds sit at exactly standing 199 (106113,
106114, 106115, 106117, 106118) — the standing-199 stall again,
same as freestrike's leg. Seed 106116 loses the village by day
50 at wave 3, standing 25 — the only seed that never reaches
wave 4. Nothing moves. The wall stands exactly where dmgshape
left it.

### Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-19/perseed-laterage-b/*.json' --metrics
national,table,wins,exiled` — refused, verbatim:
"telemetry-check: refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs. Recorder corpora are compared with
sweep-compare tables, never against a run baseline here." Same
refusal as fightcap-b / dmgshape-b / ragepreempt-b. No deviation
recorded; wall numbers above are reported directly.

## 5. Village assessment, in plain words

On this band the villages meet wave-4 monsters all the time —
127 fights in eight villages — and almost never with a Rage
holder in the fight. One village in eight has any Rage holder
reach a fight at all, and she walks into it at 35 hit points,
fires Rage on the first round, spends her one remaining round
bandaging herself instead of hitting, and runs at 2 hit points
while the monster stands untouched. The villages still die
fighting (five of eight lose the village, nobody reaches
national, nobody wins), and five of them sit stuck at exactly
199 standing — strong enough to survive, not strong enough to
move. The question this arm asked — how often does Rage fire
late, and what does the wait cost — can't be answered from live
play on this ground, because the thing it measures barely ever
happens. That's not a failure of the instrument: the instrument
read the one fight perfectly. It's a fact about the game as it
plays today — Rage is a rare sight in a wave-4 fight, and when
it does show up, it shows up on someone about to die.

## 6. Metric review (for the NEXT run — this run is judged as frozen)

1. **The pool floor priced a gamble the survey had already
   lost — and the prereg said so.** The survey (pool size only,
   before freezing) showed 1 Rage fight; the judged leg
   reproduced it exactly (127 encounters, 1 fire — determinism
   confirmed seed by seed: same days, same encounter counts).
   The verdict follows the frozen bars, not the survey. No
   re-score, no band re-pick.
2. **The taxonomy is validated on n=1, not proven at scale.**
   The analyzer classified the single fight cleanly (fire R1,
   one delay round, field_medicine, 0 doubled, 0 unclassified,
   0 anomalies) and its selftest covers the Fatima shape,
   never-lands, and the anomaly set. But a taxonomy that has
   only ever seen field_medicine as a delay cause has not met a
   trick delay, a gp-verb delay, or a silent round in the wild.
   The next run on this question re-proves the taxonomy on a
   pool-rich corpus; it does not assume it.
3. **The foregone estimate's no-basis case worked as designed.**
   The prereg defined the fallback chain (own doubled → 2× own
   pre-fire mean → corpus mean → no basis) and the single fight
   fell through all three rungs to "no basis". The analyzer
   returns 0 for that fight with an empty `foregoneRows` entry
   rather than a fabricated price. A future run should treat
   "estimate with no basis" as a missing value, not a zero.
4. **"Silent" is still untested in the wild.** No delay round
   in this corpus was silent — the one delay round was a verb.
   The prereg's note stands: if silent ever dominates a
   rollup, split it with a stun recorder instead of re-scoring.
5. **The next run needs a holder-rich population, not a fresh
   band.** Picking another fresh 8-seed band and hoping for
   holders repeats this gamble. The honest next step is to
   survey bands by `holdsRage` rate (the driver already records
   it per encounter) and run the taxonomy where holders
   actually fight — or stage holder fights under the
   encounter-gear rule (a geared Rage holder with a party, the
   population the rule demands). Either way, the band choice is
   a measured rate, not freshness alone — the dmgshape lesson,
   applied one step upstream.

## 7. Blanks

- No 12–16-seed confirm: pilot NO-GO (METRIC-BROKEN), prereg
  gates the confirm on GO.
- No panel compare: single diagnostic leg, no before/after —
  none promised (a cross-band compare is structurally invalid;
  dmgshape §4).
- Telemetry check refused recorder corpora (verbatim, §4).
- `node scripts/check.js --quick` was NOT run on this tip: the
  branch carries diagnostic tooling + evidence only, no `src/`
  change — same as ragepreempt-b and dmgshape-b. The proofs
  that bind this arm all ran green on the tip:
  `test-laterage-b.js` 11/11 (analyzer selftest 16/16, 5-day
  driver smoke, mislabel guards), analyzer exit 1 on the
  NO-GO verdict by design, driver exit 0, 0 instrument errors.
- Survey corpus deleted after the judged leg reproduced its pool
  count exactly (127 encounters, 1 Rage fire); the survey and
  judged driver logs are kept (`laterage-b-survey.log`,
  `laterage-b-judged.log`).

## 8. Findings notes for the coordinator (file these; do not edit sim-findings.md)

- **Late-Rage taxonomy — INSTRUMENT READY, pool-blocked:**
  the fire-round + post-fire-delay decomposition works
  (taxonomy complete on the 1 fight that exists; selftest
  16/16; the Fatima shape replays correctly in the synthetic
  test). The judged population is n=1 on this band — verdict
  NO-GO METRIC-BROKEN. The next run needs a holder-rich
  population (survey by `holdsRage` rate, or staged holder
  fights under the encounter-gear rule) before the judged bars
  can be carried.
- **Rage holders almost never reach wave-4 fights:** 3
  holder-fights in 127 encounters, all on one seed; 2 evade
  before contact; the 1 that fights fires R1 on a 35-HP holder
  and lands 0 of 3 doubled strikes. The bottleneck is holder
  scarcity in the field population, not the firing gate — the
  one holder who reaches contact fires immediately.
- **The post-fire verb delay, as far as n=1 shows:** the whole
  window can be lost to a single field-medicine round (0/3
  doubled strikes, 0 damage, vFlee at 2 HP). Descriptive only
  — one fight, no price basis for the foregone estimate.
- **Standing-199 stall recurs:** 5/8 seeds at exactly 199,
  same as freestrike's leg. Still the wall.
- **Out-of-scope gap (note only):** the "Ugly-Eyes"
  double-naming — the opening line uses the village's nickname
  while the mechanics lines use the true name (same wrinkle as
  dmgshape's d118 "Big Beast"). Minor fiction wrinkle; no
  action owed.
- **EVIDENCE-ONLY:** this branch holds instrument + evidence
  only; nothing in it is a game change. The coordinator lands
  evidence-only or releases the branch done-abandoned.

## Files

- Prereg: `evidence/2026-11-19/sim-laterage-b-prereg.md`
- Evidence (this file): `evidence/2026-11-19/sim-laterage-b.md`
- Analysis: `evidence/2026-11-19/laterage-b-analysis.json`
- Corpus: `evidence/2026-11-19/perseed-laterage-b/` (8 files)
- Logs: `evidence/2026-11-19/laterage-b-survey.log`,
  `evidence/2026-11-19/laterage-b-judged.log`
- Instrument: `scripts/laterage-driver-b.js`,
  `scripts/analyze-laterage-b.js`, `scripts/test-laterage-b.js`
