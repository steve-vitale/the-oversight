# sim-pairoverlap-rate-b — yield-the-blow with a days-adjusted starvation rate

**Verdict: NO-GO — KILLED AT PILOT.** The pilot fails three frozen bars at
once, including the primary and the very rate bar this arm was built to
test: pair days 16 vs a bar of 45 (and below the re-baseline's 35),
starvation rate 0.48 vs a bar of 0.27 per 100 village-days, donations
45,025 kcal vs a bar of 36,310. Per the prereg, a pilot failure kills the
lever at pilot — no 12-seed confirm. The rate instrument did not rescue
the lever; it convicted it a second time, and this time the cost is real,
not the old exposure artifact. The mechanism still converts kills
(scholar 15→13, companion 3→7), but on this weaker substrate the yield
destroys pairs about as fast as it makes them.

- Branch: `sim-pairoverlap-rate-b`, base `ba9859e13` (master at rebase).
  Baseline anchor `b9f7af730718` (prereg commit), armed anchor
  `8c2dd63c1e29` (amendment A1 commit). Verified: **no `src/` or
  `scripts/policies/` diff between the two anchors** — the A1 commit
  changed only prereg text, panel builders, and the driver's write-retry,
  so the comparison is clean game code on both legs.
- Prereg: `evidence/2026-11-07/sim-pairoverlap-rate-b-prereg.md` (+
  amendment A1: GO bar 45 pair days, rate tolerance 0.15, starvation-rate
  bar 0.2717/100d).
- Proof: `scripts/test-pairoverlap-rate-20261107.js` — **20/20 PASS**
  (re-run after the judged pilot; live leg reproduces 53001 exactly:
  firstYieldDay 63, yields 2, pair days 0/0).
- Pilot corpora: `perseed-pairoverlap-b-rate-baseline/` /
  `perseed-pairoverlap-b-rate-armed/` (band 53001–53008, 8 seeds,
  150 days, death-aware).
- Analysis: `evidence/2026-11-07/pairoverlap-rate-analysis.json`.
- Panel (§15): `evidence/2026-11-07/pairoverlap-rate-panel.md`
  (review_required).

## The lever, in plain words

Same mechanism as sim-pairoverlap-b, unchanged: when the scholar is about
to land the killing blow on a wave-4-or-harder beast and a companion
stands ready in the same fight, the scholar holds back and lets the
companion finish it, so the village banks a second proven killer instead
of the scholar collecting another kill alone. The ONLY change in this arm
is the cost instrument: starvation deaths per 100 village-days instead of
the absolute count, because the old arm's confirm failed its absolute bar
on one seed whose village lived twice as long. If the rate bar still
failed, the lever was to be killed: the cost is real, not an artifact of
the instrument. It failed — and the primary failed with it.

## Pilot (band 53001–53008, 8 seeds) — NO-GO, killed at pilot

| | Re-baseline (feast drive) | Armed (+ yield) | Bar | Pass? |
| --- | ---: | ---: | ---: | --- |
| Pair days | 35 | **16** | ≥ 45 | **no** |
| Food deeds (villages that banked the feast deed) | 6/8 | **6/8** | ≥ 6 | yes |
| Donations to feasts | 36,310 kcal | **45,025** | ≤ 36,310 | **no** |
| Starvation deaths (absolute, reported) | 1 | **4** | — | — |
| Starvation rate (per 100 village-days) | 0.12 | **0.48** | ≤ 0.2717 | **no** |
| Village-days | 822 | 834 | reported | — |
| Median survival | 96.5d | **101d** | ≥ 77.2d | yes |
| Villages surviving 150d | 1/8 | 1/8 | reported | — |
| Wave-4+ kills | 19 | 20 | reported | — |
| Wave-4 kills by who landed them | scholar 15 / companion 3 / wild 1 | scholar 13 / companion 7 / wild 0 | reported | — |
| Wave-5 unlocks | 1/8 | 1/8 | reported | — |
| Wave-5 kills | 0 | **3** | reported | — |
| National / table / wins | 0 / 0 / 0 | 0 / 0 / 0 | reported | — |

Substrate sanity passed (food deeds 6/8 ≥ 3, surge spent on 6 seeds ≥ 2).
Neutrality guard passed on all 8 seeds: every armed trajectory is
identical to its baseline twin until the first yield fires (first yield
days 46–114; 53002, 53003, 53007 never yielded and match on every row;
53006's first divergence is on its first yield day itself, which the
guard allows).

Per-seed pair days, baseline → armed: 53001: 0→0. 53002: 0→0. 53003: 0→0.
53004: 0→**7**. 53005: 18→**0**. 53006: 17→**9**. 53007: 0→0. 53008: 0→0.

Per-seed starvation deaths, baseline → armed: 53005: 0→**2**, 53007: 1→1,
53008: 0→**1**, all others 0→0.

The mechanism, measured directly: 12 yields across 8 fights; 6 companion
kills landed on yield days (53001: 1, 53004: 1, 53006: 3, 53008: 1);
scholar kills 15→13, companion kills 3→7, total wave-4 kills flat
(19→20). The conversion still happens. It does not bank pairs: the
baseline's pair days were concentrated on two seeds (53005: 18, 53006:
17), and the armed leg destroyed one outright and shortened the other,
gaining only 7 new pair days on 53004. Net −19.

## Why the pair days fell: the three seeds that decided it

**53005 — the pair that was destroyed (18→0).** Baseline: the scholar
Desmond Clarke killed a wave-4 Influencer on day 64, the village killed
two more wave-4 beasts on days 72–73, and a pair formed on day 73.
Armed: on day 64 Desmond yielded twice on the same Influencer (at 20 HP,
then 12 HP, an ally ready both times) — and the companion never landed
the blow; Desmond took the kill himself. Both yields were wasted. Desmond
died days later (day 69, as he does in both legs — he dies day 65
baseline, to "a stranger"), and after him the village killed nothing
wave-4 at all. Jorge and Ella starved on day 73 — the exact day the
baseline pair formed. The village died day 76 against 94 baseline. The
yield bought nothing and the divergence cost the village its follow-on
kills. This is also where the starvation rate fails: 2 deaths in a
village that died 18 days EARLIER, not longer-lived. The old exposure
artifact does not explain this one.

**53006 — the pair that formed early and still shrank (17→9).** The
lever's best seed, and it still lost pair days. Yields on days 67, 82,
100: Olivia Bennett finished the Strike on day 67, Rosa Mendez the
Strike on day 82, Dale Hoffman the Influencer on day 100. The pair
formed on day 100 — 35 days earlier than baseline (day 135) — and Dale
told it at the fire that night (see sense-test). But Rosa died on day
109, cutting the pair to 9 days against 17 baseline. The consolation is
real: with the pair formed early, the village killed three wave-5 beasts
(Dale's Timeslot day 109, Tariq Mahmood's two Reruns days 144 and 146)
against zero baseline, and standing rose 530→645. The only seed in
either leg with wave-5 kills. A pair formed early is worth more than a
pair formed late — but the lever still netted fewer pair days here.

**53004 — the pair that was made (0→7).** Yields twice on day 46 on the
Influencer (39 HP, then 12 HP); Nora Wilson finished it. Baseline had
one wave-4 kill all run (the scholar's, day 46); armed had four (Nora
day 46, a companion Strike day 80, two scholar kills), a pair from day
83, and the village lived 108 days against 78. This is the lever working
as designed — and it is also the seed that sank the donations bar: the
longer-lived village hosted 7 feasts against 5 and donated 9,830 kcal
against 0 baseline, which is the whole +8,715 kcal rise by itself.

**53001 — the redundant yield.** The scholar yielded twice on the
Congregation on day 63 (44 HP, then 24 HP, three allies ready) — and
Hassan Ali finished it on day 63 in BOTH legs, same day, same killer.
The yield changed nothing; the companion would have killed anyway.
**53008 — the quiet extra death.** Three yields, one companion kill on
a yield day (the Strike, day 137), no pair ever formed, and Efren
starved on day 144, the village's last day, against zero starvation
baseline at the same 144 days.

## Sense-test: do the feasts and the pair-banking read like people?

Yes, at the fire — with the same ledger noise as the last arm.

On 53006 the day-100 yield reads as a handoff with a reputation attached:
"Dale leans in, and the hall goes quiet in a different way — this is not
a new story. 'You all know The Influencer by now. I put another one down
today.'" Dale killed the Influencer that day because the scholar held
back, and that night he tells it as a veteran telling a story the room
already knows. The kill tales at the fire name the killer and the beast,
and the pair that forms the same day is legible in the story, not just
the ledger. On 53004, Nora Wilson's day-46 finish is the village's first
companion wave-4 kill of the run, and the village that follows lives
thirty days longer.

The ledger noise is unchanged from sim-pairoverlap-b: the daily keepsake
reminder ("You hold Notebook. Route optimizations, glitch lists,
apocalypse patch notes. 'DO NOT TRUST THE CACHE BY THE RIVER.' …") repeats
word-for-word for a week at a time (days 96–102 on 53006), and the fire
settles into the same "X has been quiet all evening" frame night after
night. Neither breaks the fiction at the fire, but the keepsake line is a
chant, not a memory. Documented, not fixed — outside this arm's lever.

One yield does not guarantee the companion lands the blow: on 53005 the
scholar held back twice and still took the kill. Yielding is a chance,
not a handoff — and on this band the chance failed exactly where the pair
was concentrated.

## The village, in plain words

Eight villages, eight deaths before day 150 except one survivor (53006,
both legs). None reached the national scale, the table, or a win in
either leg — the wall did not move. The lever banks pairs, and pairs are
upstream of the seat, but no village in either leg got far enough for a
pair to matter at the table. The one real downstream movement is on
53006: an early pair and three wave-5 kills, the first wave-5 kills in
either leg of this arm.

Who thrived: companions who got the killing blow — 7 of 20 wave-4 kills
were companions, up from 3 of 19, and on 53006 the companions' kills
opened the wave-5 door. Who died: scholars, constantly, and the
villagers the yield was supposed to protect — Desmond on 53005, Rosa on
53006 cutting the pair short, Jorge and Ella starving on the day the
pair should have formed. The first killer is still unprotected, and this
arm confirms the old arm's finding: the yield's divergence can cost a
village its follow-on kills, and a pair made is not a pair kept.

What is missing: the pair is a means, not an end, and this arm shows the
means itself is fragile on the current substrate. The re-baseline's pair
days (35) all sat on two seeds; a lever that moves trajectories moves
those two seeds' luck, and here it moved them down. Villages bank two
proven killers and then still die at the same wall — no seat is ever
priced, in any of the 16 villages across both legs.

## Metric review

- Pair days is the right primary and it behaved: it moved on the lever's
  own mechanism and the neutrality guard proves the movement starts
  exactly at the first yield. It failed honestly — the lever subtracted
  overlap on this band. No re-score, no rescue: 16 vs a bar of 45, below
  the baseline's 35. A future arm needs a different lever, not a
  different bar.
- The rate instrument is validated by this failure. It caught a real
  cost (0.48 vs 0.12, delta +0.36 against a tolerance of 0.15), and this
  time the cost is NOT the old exposure artifact: total village-days were
  nearly flat (822→834), 53005 died 18 days earlier and starved more,
  53008 lived the same 144 days with one extra death. The rate form
  distinguishes a longer life from a hungrier one — exactly what it was
  built to do. Keep the rate form for future cost bars; the absolute
  count should stay retired.
- The donations bar carries the same exposure confound the old
  starvation bar did, in reverse: armed villages that live longer donate
  more. 53004 lived 30 days longer, hosted 2 more feasts, and donated
  9,830 kcal against 0 baseline — the entire +8,715 rise. A future arm
  should rate-adjust donations (kcal per 100 village-days) or drop it as
  a bar. It does not change this verdict: the primary and the rate bar
  both fail independently.
- The bar-setting rule worked as designed: the 45 came from the
  re-baseline's own 35 (+10), and the pool check passed (15 scholar
  kills). The bar was achievable in principle — the lever simply did not
  achieve it. The concentration warning in A1 was prescient: the pair
  days sat on two seeds, and the yield's divergence destroyed one.
- Balanced panel (§15): review_required, no material signal on wins,
  national, survival, or community loss; village deaths per run
  regression_watch (+2.63, 95% exploratory interval −3.5 to 9) and
  village deaths per 100 days regression_watch (+0.75, interval −2.37
  to 4.54) — both intervals cross zero. The panel is a screen, not the
  judge; it corroborates the rate finding's direction without adding a
  verdict.
- Telemetry deviation check: `telemetry-check.js` refused the per-seed
  corpora as input by its own guard (recorder rows carry
  `anchorCommit`; recorder corpora are compared with sweep-compare
  tables, never against a run baseline). The §15 panel above is the
  sanctioned comparison for this shape of corpus; the wall numbers
  (national/table/wins 0 in both legs) show no deviation from the
  scale-wall baseline's zeros.

## Convergence state

**Killed at pilot.** The feast chain now reads: feast drive buys the deed
with pairs (re-baselined here at 35 pair days on current master, down
from 51 on the old base — the substrate itself weakened with the master
delta); three throttles failed the same bar; yield-the-blow is the first
lever that moves pair days up without throttling feasts on the old base
(pilot +46, confirm +15) — and on the current base it moves pair days
DOWN (35→16) while costing real starvation. The re-instrumentation was
spent and the cost proved real. The mechanism (converting scholar-kills
to companion-kills) is proven on three bands now, but conversion is not
pair-banking: pairs need two LIVING killers, and the yield's trajectory
divergence kills pairs through second-order deaths. The next work on the
pair problem needs a different lever — first-killer protection, or the
yield paired with a food-safety guard for the longer-lived villages it
creates — not another re-instrumentation of this one. Per kill
discipline, a missed primary plus a real cost is a kill.

## Scale-wall numbers (both legs, 8 seeds each)

| | Re-baseline | Armed |
| --- | ---: | ---: |
| National scale | 0/8 | 0/8 |
| Table / seat priced | 0/8 | 0/8 |
| Wins | 0/8 | 0/8 |
| Wave-4 unlocks | 8/8 | 8/8 |
| Wave-5 unlocks | 1/8 | 1/8 |
| Wave-5 kills | 0 | 3 |
| Median survival | 96.5d | 101d |
| Survived 150d | 1/8 | 1/8 |

## Files

- Prereg + amendment A1: `evidence/2026-11-07/sim-pairoverlap-rate-b-prereg.md`
- This evidence: `evidence/2026-11-07/sim-pairoverlap-b-rate.md`
- Policy (unchanged): `scripts/policies/competent-pairoverlap-b.js`
- Driver / rate analyzer / panel builder / proof:
  `scripts/pairoverlap-driver-20261107.js`,
  `scripts/pairoverlap-rate-analyze-20261107.js`,
  `scripts/build-pairoverlap-rate-panels-20261107.js`,
  `scripts/test-pairoverlap-rate-20261107.js`
- Pilot corpora: `evidence/2026-11-07/perseed-pairoverlap-b-rate-baseline/`,
  `evidence/2026-11-07/perseed-pairoverlap-b-rate-armed/`
- Analysis: `evidence/2026-11-07/pairoverlap-rate-analysis.json`
- Panel: `evidence/2026-11-07/pairoverlap-rate-panel.md` (+.json,
  -before/-after.json.gz)

## Run notes

- ADOPTION: the previous run (fleshout-loop-b-20261108T0013Z) died by cron
  timeout ~02:02Z; its re-dispatch worker for this arm was cancelled
  before reporting. This run finished it: the re-baseline corpus (8/8)
  was already complete and valid; the armed corpus had 2 valid seeds, a
  0-byte 53003 (flap casualty at 02:05Z — deleted, re-run with the
  committed driver), and 5 missing seeds (53004–53008, run fresh with
  the committed driver, same band, same base). No new seeds were run, so
  no freshness check was needed. All 16 files parse, instrumentErrors 0,
  daily/fallen present.
- The EPERM write-denial flap ran ~01:39–02:02Z; probes passed ~02:10Z
  and before every sweep batch and commit in this run. The driver's
  write-retry (A1) held: no seed output was lost in this run.
- Index clobber struck three times after `safe-commit.sh` commits (armed
  corpus, baseline corpus, analysis+panel): committed files showed as
  staged-as-deleted while byte-identical to HEAD. Repaired each time
  with hash verification + `git ls-tree HEAD -r -- <paths> | git
  update-index --add --index-info`; every commit is correct.
- `safe-commit.sh` does not accept directory paths: the first commit
  attempt passed the corpus directory, which failed to add but still
  created an EMPTY commit (e7747467a). Repaired by `git reset --soft
  HEAD~1` in this private worktree branch (the empty commit was mine
  alone, seconds old, nothing lost) and recommitted with an explicit
  file list (012e71b5e, 8 files).
- No canon doc covers the feast/surge system as a dedicated doc; the
  design record is the code (`src/js/feastBuff.js`,
  `src/js/progression.js:650`) plus `docs/BALANCING.md` §78–79, as
  recorded in the prereg.
- Tracker update (convergence-tracker.md, scale-onramp axis →
  killed-at-pilot) is left to the run coordinator's closeout; this
  adoption run's brief covered the arm, not the tracker.
