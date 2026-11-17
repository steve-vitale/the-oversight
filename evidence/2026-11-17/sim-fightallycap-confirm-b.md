# sim-fightallycap-confirm-b — fresh-band confirm of the second ally slot

**Arm:** sim-fightallycap-confirm-b (CONFIRM, measurement-only) · **Run:** fleshout-loop-b-20261117T2030Z
**Base:** master `db8a289bf` (sim-fightallycap-b: pilot GO) · **Branch tip:** see report
**Prereg:** `evidence/2026-11-17/sim-fightallycap-confirm-b-prereg.md` (frozen before any confirm sims)
**Band:** seeds 103801–103812 (12 seeds, verified fresh — 0 hits in all 968
`evidence/*/sim-*-prereg.md` plus all `sim-*.md`; no corpus-filename collision;
taken bands avoided incl. pilot 103601–103608 and planignconfirm 103501–103512)
· 150 days, death-aware · competent verbatim (`scripts/policies/competent.js`,
sha256 `df9b7dff…`, same hash as the pilot)
**Legs:** ctl `VETREENGAGE=1` · arm `VETREENGAGE=1 FIGHTALLY2=1`
**Instrument:** the pilot's driver/analyzer/panel builder, reused unchanged
except one repair (see "Instrument repair" below).

## Verdict: GO — the pilot effect generalizes

| Bar | Frozen rule | Result |
|---|---|---|
| **B1 PRIMARY** — second ally joins | mean joining allies ≥ 1.5 across armed-leg expedition fought meetings with alliesN ≥ 2 and calledHelp, judged iff n ≥ 3 | **PASS** — **1.9 (n=10; 9 meetings with 2 allies, 1 with 1)** vs control exactly 1.0 (n=14, every meeting exactly 1). Stronger than the pilot's 1.625 |
| **B2 SECONDARY** — damage share | launched fought meetings mean share ≥ 0.10, judged iff n ≥ 3 captured shares on the armed leg | **PASS (judged this time)** — **0.2547 (n=6)** vs control 0 (n=1). The pilot was unjudgeable on n=1; the fresh band supplies the missing population |
| **B3 GUARDRAIL** — deaths within 10% of control | expedition deaths armed ≤ ctl × 1.10 AND total deaths armed ≤ ctl × 1.10 | **PASS, wide margin** — total **812 vs 1044** (78% of control; limit 1148); expedition **99 vs 323** (31%; limit 355) |
| **B4 PROOF** — proof test green | `scripts/test-fightallycap-b.js` green on the final tip | **PASS** — **22/22** (checked before freezing and re-run at closeout) |
| **B5 PANEL** — balanced-panel compare | `balance-panel.js compare`, flag `FIGHTALLY2` declared, `.md` attached, no uninvestigated regression | **PASS with investigation** — decision `review_required`, **zero** regression rows; community loss flat 0.5 → 0.5; see below |
| **Instrument** | 12/12 files both legs, 0 errors, every fought non-kill row carries `mHpStart` | **CLEAN** — 12/12, 0 errors, missingHp 0/0, recMismatch 0/0 |

## Before / after (confirm numbers)

| | Control | Armed |
|---|---|---|
| Mean joining allies (B1 population) | 1.0 (n=14) | **1.9 (n=10)** |
| Second-ally joins, all origins | 0 | **65 across 11 of 12 seeds** |
| Second ally's total damage dealt | 0 | **2,902** |
| Launched fought meetings (B2 population) | 1 (share 0) | 6 (mean share 0.2547) |
| Wave-4+ launches | 11 | 18 |
| Total deaths | 1044 | 812 (−22%) |
| Expedition deaths | 323 | 99 (−69%) |
| Home-front deaths (total − expedition) | 721 | 713 (−1%) |
| Starvation deaths | 5 | 5 |

Per-seed B1 (mean joining allies / eligible meetings), armed: 103802 2.0 (n=1),
103803 1.0 (n=1), 103804 2.0 (n=1), 103805 2.0 (n=1), 103806 2.0 (n=3),
103808 2.0 (n=2), 103810 2.0 (n=1); 103801, 103807, 103809, 103811, 103812 had
no B1-eligible meeting. The pass is pooled, as in the pilot — and as in the
pilot, the lever fires far more broadly than B1's narrow population (65 joins
vs 9 in the B1 population).

## Reachability — waves, standing, table, wins

| | Control | Armed |
|---|---|---|
| Wave 4 unlocked | 12/12 | 12/12 |
| Wave 5 unlocked | 8/12 | **6/12** |
| National standing (scaleRank ≥ national) | 8/12 | **6/12** |
| National rank | 0/12 | 0/12 |
| Table offered / taken | 0/12 | 0/12 |
| Wins | 0/12 | 0/12 |
| Median survival | 147.5 days | 143 days |
| Villages surviving 150 days | 6/12 | 6/12 |

**The pilot's wall gains did NOT replicate.** On the pilot band the armed
villages reached wave 5 on 5/8 vs 2/8 and national standing on 5/8 vs 2/8.
On this fresh band the direction reverses: wave 5 on 6/12 armed vs 8/12
control, national standing 6/12 vs 8/12, median survival 143 vs 147.5 days.
Survival itself is even (6/12 both legs) and flips both ways per seed —
armed 103803, 103806, 103807 survive where their control twins collapse;
armed 103808, 103811, 103812 collapse where their control twins survive
(103812's control twin reached standing 550 over the full 150 days; its
armed twin was lost day 136). No village reaches the table or wins on either
leg. The frozen bars do not judge the wall, so the verdict stands — but the
pilot's wall claim must not be carried forward. What this confirm certifies
is the fight-level effect: the second ally joins, deals real damage, and
keeps expedition fighters alive. It does not by itself move the scale wall.

The death split explains why survival doesn't improve even as expedition
deaths collapse: home-front deaths are essentially unchanged (721 → 713).
The second ally saves people out on hunts; the village still loses the same
number of people at home. The binding wall past wave 5 is not expedition
survival.

## B5 investigation — review_required with no regression

The panel decision is `review_required` (compare exits 2 on any non-clean
decision — that is the CLI contract, not a crash). The report contains
**zero** `regression_watch` / `regression_signal` rows. Every observed
metric is `no_material_signal` or `descriptive`; the rest are `not_observed`
(the instrument does not observe them). Community loss — the pilot's watch
item — is flat: 0.5 → 0.5, delta 0, interval −0.417 to +0.417. Village
deaths per run fall 87 → 67.67 (interval −33.58 to −5.75, still
`no_material_signal` by the panel's thresholding) and deaths per 100 days
62.12 → 53.56. Nothing in the panel points at a lever-caused harm; the
`review_required` here is driven only by unobserved metrics, the same shape
the panel's own contract tests describe. B5 is judged PASS with this
investigation attached.

## Instrument repair (same-run, fully disclosed)

The first analyzer run printed `VERDICT: NO-GO` with `instrument=DIRTY`
while B1, B2, and B3 all passed and every substantive check was clean
(12/12 files, 0 errors, missingHp 0/0, recMismatch 0/0). Root cause: the
pilot's analyzer hardcodes the file-count gate at 8 (`ctlS.files === 8 &&
armS.files === 8`) — the pilot's band size. The confirm prereg froze
12/12, so the gate could never pass on a 12-seed band. Repair:
`scripts/analyze-fightallycap-b.js` now reads `EXPECTED_FILES` (default 8,
so the pilot behavior is unchanged) and the confirm re-ran with
`EXPECTED_FILES=12`. **No measurement changed** — B1/B2/B3 numbers are
byte-identical between the two analyzer runs; only the file-count gate
moved, to match the frozen prereg. The analyzer also writes its output to
the hardcoded pilot filename `fightallycap-b-analysis.json`; the confirm
output was renamed to `fightallycap-confirm-b-analysis.json` immediately
after each run, and the pilot's file was restored from git after the first
run's move (verified: pilot analysis still reads verdict GO).

## Run incidents

- **Runtime restart mid-arm-leg:** the armed driver was killed after 5
  seeds (103801–103805, all files intact, errors 0, no driver process
  left). Resumed with seeds 103806–103812 only, log appended (`>>`),
  exit 0, 12/12 files. No seed was re-run; per-seed files are
  deterministic given seed + flags, so the resume is exact, not a re-roll.
- **Telemetry deviation check:** `scripts/telemetry-check.js` refuses
  recorder corpora by design ("recorder-corpus input ... compared with
  sweep-compare tables, never against a run baseline here"). Not
  applicable to this instrument; the balanced panel is the §15 instrument
  used instead. No LOUD line was produced.

## Sense-testing — does the second ally read like a person?

Yes. Three armed-leg fights from seed 103803, the village that survived
to 150 days at standing 615:

- Day 127, timeslot (wave 5): Dmitri is losing; the app-mgpspkeo719 ally
  joins, still losing, Sanne joins second and deals 40 — the party kills
  a wave-5 monster together. A wave-5 kill with both allies in.
- Day 142, timeslot (wave 5): Dmitri again, Sanne's successor visjoin_136
  deals 110 of the 639 damage dealt (share 0.61) before the monster is
  driven off. The second ally is not decoration; they carry a real share
  of the fight.
- Day 91, eulogy: Ivy Wang answers the second shout, deals 0 — she
  arrives and the fight ends before she acts. No phantom settlement: no
  wounds recorded for her. Correct, and the same honest shape the pilot
  saw.

And from seed 103801, day 43, algorithm: Sari shouts, Petra charges in,
still losing, shouts again, gen_4xpir3m charges in and deals 62 across 8
rounds. The escalation reads as a fight getting desperate, then turning
into a three-person stand — the same shape the pilot's transcripts showed,
now on fresh seeds.

## Village assessment, in plain words

A party that travels together can now actually fight together, and on
fresh villages the effect is if anything stronger than the pilot showed:
the second ally joined 65 times (the pilot saw 37), dealt nearly three
thousand damage, and expedition deaths fell by two-thirds. When a fight
goes badly, a second companion answers the second shout and the party
stands three-strong — and it shows in the numbers, not just the story.

But the villages are not safer villages. Six of twelve collapse on each
leg, the same count, and the ones that collapse on the armed leg collapse
at home, not on hunts — the home-front death toll doesn't move at all
(721 → 713). Two armed villages that reached wave 5 and high standing
still fell apart late (103811 at standing 460, day 135; 103812 at
standing 199 after its twin reached 550). The lever fixes the fight
engine's cap, which is what it was built to do. The wall past wave 5 —
and the home-front dying — is still standing, and it is not an expedition
problem.

## Metric review

- **Analyzer file-count gate (repaired this run):** the reused instrument
  gated on the pilot's 8 seeds while the prereg froze 12/12. Repaired by
  parameterizing `EXPECTED_FILES` (default 8). Next run: pass
  `EXPECTED_FILES=<n>` or have the analyzer read the seed count from the
  corpus dirs; never hand-edit the gate per run.
- **B1's population stays narrow and concentrated:** n=10 pooled across 6
  of 12 armed seeds, with 103806 contributing 3. The unconditional
  second-ally join count (65 joins, 0 on control) is the stabler signal.
  Proposal for the next run: promote the all-origins join count to a
  secondary bar alongside B1, so a band with few expedition shout-fights
  can still certify the slot fires.
- **B2 judged this time:** the pilot's unjudgeable risk (n=1) did not
  repeat (n=6, mean 0.2547). No revision needed.
- **Wall metrics are not verdict bars, and this run shows why:** the
  pilot's wave-5/national gains reversed on fresh seeds while every
  frozen bar passed. Do not cite the pilot's wall numbers as the lever's
  effect; the confirmed effect is fight-level only.

## Check status

`scripts/test-fightallycap-b.js`: 22/22 on the final tip (pre-freeze and
at closeout). No game code changed in this arm; the only script change is
the analyzer's `EXPECTED_FILES` parameterization. Evidence-only commit,
ready to land.
