# sim-courtship-b — courtship deeds for the covenant road: PILOT NO-GO (G2 GO at the bar, cost bar fails)

Run: fleshout-loop-b-20261115T1630Z (Loop B), arm sim-courtship-b
Axis: winnability chain. Courtship-deeds build arm — the lever the
last two runs proved is missing.
Branch: sim-courtship-b — worktree ~/workspace/worktrees/sim-courtship-b
Base: master at worktree creation (tip a9d85e32c); rebased onto the
current master tip before landing (see Commits)
Date: 2026-11-15
Prereg: evidence/2026-11-15/sim-courtship-b-prereg.md (binds G1/G2/G3
+ cost bar; pilot band 100601–100608, confirm 100621–100636)
Adoption: this evidence closes out the 1330Z run's pilot — its worker
was stopped by cron timeout after finishing and judging the pilot.
All numbers below were RECOMPUTED from the corpora (the 16 per-seed
JSONs + courtship-b-analysis.json) by the adoption worker, not copied
from the recovered report. The recompute agrees with the recovered
judgment on every bar, with two corrections: median survival is
146.5d (not 146d), and the analyzer's per-seed tendsPaidKcal reads 0
on the courtship leg (see metric review #7) — tend counts are used
instead, with the driver's kcal figure alongside.

## Verdict: PILOT NO-GO — G2 GO (3/8, exactly at the bar); cost bar FAILS (starvation 5 vs 0)

- **G1 INSTRUMENT VALIDITY — GO.** Full per-day link roll +
  shape-candidate roll + DAILY MAX-KNOWN-OPINION read on all 16
  configs (8 seeds × covenant-baseline / courtship-armed),
  **0 instrument errors**, **0 UNCLASSIFIED shapes** across all
  40 shape-seed cells per leg (bar ≤1 per 8 seeds). Every staged
  beat classified by shape with sat/unsat: 3 covenant beats
  (100602, 100605, 100608 — all answered 'pact', all sat). The
  analyzer's new `blockers` array names ALL failing gates per
  shape (see below), and the rung naming from onlylead2 metric
  review #4 fires for the first time (100607,
  covenant-rung-gate).
- **G2 THE LEVER — GO, exactly at the bar.** COVENANT BEATS
  STAGED on **3/8** pilot seeds (bar ≥3/8) — 100602 (day 62),
  100605 (day 65), 100608 (day 119) — and every staged beat was
  answered 'pact' and sat (sat 3/3). Baseline expectation was
  ~1/8 (onlylead2's number); the baseline leg here staged **0/8**.
  The third staging is thin — 100608's council came on day 119,
  36 days before the village died — but the bar is the bar, and
  3/8 meets it. Lead beats staged on the courtship leg: **0**
  (isolation held — the leg proposes no lead links).
- **G3 LEVER-ONLY — GO on the pilot tip, QUALIFIED on the
  rebased tip (see metric review #10).** Zero `src/js` changes
  in the branch diff (33 files: scripts/ + evidence/ only). On
  the pilot tip (base a9d85e32c, where the pilot ran) all proof
  tests were green: test-courtship-b 57/57, test-covenant-b
  33/33, test-onlylead-b 29/29, test-onlylead2-b 25/25. On the
  rebased tip (base 7a4353f68) two live-smoke checks fail on
  master game-code drift, instrument unchanged (the rebased
  instrument changeset is byte-identical to the original):
  test-courtship-b 56/57 (the study deed never fires on seed
  100601's smoke) and test-onlylead2-b 24/25 (peer links now
  form on the substrate-negative seed); test-covenant-b 33/33
  and test-onlylead-b 29/29 stay green. The failures are live
  200d-trajectory assertions moved by two master src/js changes
  (convo-mood plain parting + CASCADE lingering change), not by
  anything this arm changed — and the pilot's judged numbers
  come from the corpora, generated pre-drift, so the PILOT
  NO-GO verdict is unaffected. G3 as preregged ("proof tests
  green") does not literally hold on the rebased tip; it is
  recorded here as qualified, not re-scored, and the
  coordinator decides the merge.
- **COST BAR — FAILS.** Starvation deaths pooled courtship **5**
  vs baseline **0** (bar ≤ baseline + 2 = 2). Median survival
  courtship 146.5d ≥ 0.8× baseline median 114d = 91.2d (passes).
  The starvation does NOT track the lever's spend — the three
  seeds that paid the full 6,000 kcal of aid starved 0; the 5
  deaths sit on seeds that paid 2,000–4,000 kcal (see metric
  review #3) — but the bar is judged as written: FAIL.
  Guardrail (§14c): villager combat deaths exceed the before leg
  by >50% on ONE seed — 100601 (63 vs 132, +110%); the leg lived
  65 days longer (104 → 168), so longer life bought more fights
  and more combat deaths. Pooled villager combat deaths 558 vs
  604 (−7.6%).

**Overall: PILOT NO-GO on the binding cost bar.** G2 passes its
bar and the cost bar fails its bar, and the prereg keeps the cost
bar binding — so the pilot is a NO-GO and **no confirm is spent**
(a confirm does not rescue a NO-GO); the reserved confirm band
100621–100636 stays fresh and unused. The lever is NOT a game
change; the instrument + measurement land as evidence only
(onlylead2 precedent: its PILOT NO-GO landed as b0b171cc8 with
evidence + corpora + panel). The tension — the prereg names G2
as the judge but keeps the cost bar binding — is recorded
plainly in metric review #2 with a revision proposed for the
NEXT run. Nothing here is re-scored.

## The answer in one paragraph

The courtship deeds work — the road opens three times in eight,
not once. On three seeds the scholar walks to a neighbor's fire,
studies their codex, and sends a runner with real grain, and
within days the villages that spent the last two runs saying
"they barely know Haven's name" are swearing a covenant: three
links in three days on 100602, a counter answered and a third
link sworn on 100605, a late council on 100608 that holds
national for 36 days. Opinion 10, which took a median 57 days
to arrive on the baseline, arrives on a median day 6 with the
deeds — the gate the last two runs proved was shut is now open
by the second week. But the pilot still fails, and it fails on
the same bar as onlylead2: five villagers starve on the armed
leg against none on the baseline, and the starvation does not
track the aid spend — the villages that gave the most grain
starved nobody, and the villages that starved gave less. The
lever opens the road and the road is real, but the pilot cannot
say the road is cheap, and the prereg's cost bar is binding.
So the deeds stay an instrument, not a game change — and the
fourth village, 100604, shows why the rework matters more than
the verdict: its scholar spent 156 of 200 days walking to the
same two fires, restarting the same trip every fifteen days,
never once arriving, while the village waited at home.

## Per-seed per-shape table (courtship leg — the judged leg)

`q` = days the shape qualified (its engine predicate non-null);
`nat` = first national day; `held` = national held days. The
`blockers` column names ALL failing gates. Baseline leg
(covenant road, no deeds): covenant staged 0/8 (seasoned-short
1-of-2 ×1, 0-of-1 ×3, no-peer-links ×1, 2-of-3 ×1, 0-of-2 ×1,
0-of-3 ×1); lead staged 0/8 on both legs (subs-short:0 ×4,
subs-short:1 ×4 per leg); conquest no-raids 8/8, belong
no-sub-link 8/8, trade no-peer-links 8/8 on both legs.

| seed | lead | conquest | belong | covenant | trade | nat / held | days | end |
|------|------|----------|--------|----------|-------|------------|------|-----|
| 100601 | lead-subs-short:0 (q0) | conquest-no-raids (q0) | belong-no-sub-link (q0) | covenant-seasoned-short:2-of-3 (q0) | trade-no-peer-links (q0) | — / 0 | 168 | lost |
| 100602 | lead-subs-short:1 (q0) | conquest-no-raids (q0) | belong-no-sub-link (q0) | **STAGED sat (q113, first q42)** | trade-no-peer-links (q0) | 62 / 93 | 155 | lost |
| 100603 | lead-subs-short:1 (q0) | conquest-no-raids (q0) | belong-no-sub-link (q0) | covenant-seasoned-short:1-of-3 (q0) | trade-no-peer-links (q0) | — / 0 | 124 | lost |
| 100604 | lead-subs-short:1 (q0) | conquest-no-raids (q0) | belong-no-sub-link (q0) | covenant-seasoned-short:0-of-3 (q0) | trade-no-peer-links (q0) | — / 0 | 200 | survived |
| 100605 | lead-subs-short:0 (q0) | conquest-no-raids (q0) | belong-no-sub-link (q0) | **STAGED sat (q91, first q48)** | trade-no-peer-links (q0) | 65 / 74 | 138 | lost |
| 100606 | lead-subs-short:0 (q0) | conquest-no-raids (q0) | belong-no-sub-link (q0) | covenant-seasoned-short:0-of-3 (q0) | trade-no-peer-links (q0) | — / 0 | 85 | lost |
| 100607 | lead-subs-short:1 (q0) | conquest-no-raids (q0) | belong-no-sub-link (q0) | covenant-rung-gate (q14, first q72) | trade-no-peer-links (q0) | — / 0 | 86 | lost |
| 100608 | lead-subs-short:0 (q0) | conquest-no-raids (q0) | belong-no-sub-link (q0) | **STAGED sat (q37, first q118)** | trade-no-peer-links (q0) | 119 / 36 | 155 | lost |

Blocker rollup (courtship leg, 8 seeds): lead subs-short:0 ×4,
subs-short:1 ×4; conquest no-raids 8; belong no-sub-link 8;
covenant staged 3, seasoned-short:2-of-3 ×1, 1-of-3 ×1,
0-of-3 ×2, rung-gate ×1; trade no-peer-links 8.
UNCLASSIFIED 0. Lead beats on the courtship leg: 0 (isolation
held — the leg proposes no lead links; the single engine-formed
lead link on 100601 is engine courtship, see below).

## The deeds, band-wide

The lever fired on every seed. **18 aid gifts, 36,000 kcal**
(3, 3, 2, 1, 3, 2, 2, 2 per seed — the 2,000-kcal first gift,
once per village, pantry-gated at 12,000); **22 codex studies**
(2, 1, 3, 1, 2, 3, 2, 8); **44 pilgrimages, 354 pilgrim-days**
(7/76, 1/2, 7/62, 12/156, 2/4, 3/6, 4/31, 8/17 per seed).
Opinion 10 first arrived on the armed leg on days 4, 8, 12, 4,
4, 4, 34, 12 (median 6) against baseline days 39, 88, 64, 48,
69, 50, 74, 49 (median 57) — the gate opens ~51 days earlier.
Max known opinion armed 23–59 vs baseline 13–42.

The propose contrast is the cleanest number in the pilot.
Baseline: **524 proposeCovenant calls, 511 prerequisite
refusals** (opinion <10 — the engine refuses before judging,
no −5, no cooldown), **13 accepted, 0 counters, 0 declines,
0 shut doors**. Armed: **26 proposeCovenant calls, 24 accepted,
1 counter (100605, answered — the third link was formed by
`answerCounter`), 1 prerequisite refusal (100603, day 12,
before the first aid landed), 0 declined, 0 shut doors.** The
deeds do not make the villages say yes more often — they make
the policy stop having to ask a village that does not know
Haven yet. Tends: armed 29 calls / 43,500 kcal (driver
capSummary; the analyzer's per-seed tendsPaidKcal reads 0 on
the courtship leg — see metric review #7) vs baseline 11 calls
/ 16,500 kcal.

## The covenant road, seed by seed (courtship leg)

- **100601 — two seasoned, one too young (the engine courts
  too).** Aids day 4 (village_0), day 8 (village_2), day 40
  (village_1); studies day 6 (village_2) and day 106
  (village_spl_29_42769 — after four restarts, see below).
  Opinion 10 on day 4. Links formed day 40 (village_0) and day
  41 (village_1), both seasoned (trust 100 at end). The third
  link came day 147 (village_2) — 21 days before the village
  died at 168, nine days short of the 30-day seasoning bar —
  so seasoned-short:2-of-3. Village_2 is the onlylead2 finding
  #2 again: the ENGINE formed a lead link with it on day 29
  (Haven primary), taking it out of the covenant pool until
  that link broke (succession); only then could the policy
  propose. The pilgrimage to village_spl_29_42769 restarted
  four times (days 55, 70, 85, 102) before the study finally
  completed day 106 — the same stall as 100604, smaller.
- **100602 — THE STAGING (the road works, fast).** One study
  (village_0, day 5) and three aids by day 9 (village_0,
  village_2, village_3) — the whole lever spent in the first
  week. Opinion 10 on day 8. Three links proposed and accepted
  on days 10, 11, 12 — three villages in three days, the same
  shape as onlylead2's 100422 but 85 days earlier. All three
  seasoned by day 42, counted day 42 (+102 standing). First
  regional day 32, so the rung (day 62) was the binding gate
  after the links seasoned — and the beat staged exactly on
  the rung day: the council offered day 61, the pact sworn day
  62, national held 93 days to the village's death at 155.
  5 tends paid (7,500 kcal). The only seed in the band where
  the rung, not the links, set the staging day.
- **100603 — three links, one seasoned (the tend gate).**
  Studies days 5, 9, 46; aids days 12, 13. Opinion 10 day 12.
  Covenant links formed day 13 (village_1, seasoned day 43),
  day 104 (village_spl_25_88357) and day 115 (village_2) — the
  last two never seasoned. (A fourth link, village_3 day 25,
  was engine-formed lead, not covenant.) Only 1 tend paid all
  run (1,500 kcal; 23 tend-blocked-pantry days) — the tend gate
  (pantry > 20,000 kcal) never opened on a village whose
  pantry sat low, so only one link seasoned and the shape
  reads seasoned-short:1-of-3. Onlylead2 finding #3, alive:
  the road forms and then stalls on the pantry. Died day 124.
  The one prerequisite refusal in the whole armed leg is here
  (day 12, Stonebridge, before the first aid landed) — and the
  refusal copy then vanishes for the rest of the run (see
  sense-testing).
- **100604 — THE STALL (see below).** One aid (day 4,
  village_2, Thornfield) and one study (day 7, village_1,
  Stonebridge) — then 12 pilgrimages and 156 pilgrim-days and
  no further study. Opinion 10 day 4 (from the aid). The three
  covenant links were finally proposed on days 189, 190, 191
  (village_0, village_2, village_spl_24_39244) — the very
  villages the pilgrimages were walking to — but 0 seasoned at
  the 200-day horizon, so seasoned-short:0-of-3. First regional
  day 138 (latest in the band by 70+ days); the rung (day 168)
  had passed, but the links formed after it. The village
  SURVIVED the horizon — the only survivor in the band — with
  standing 75, the lowest in the band, max wave 3, 31 deaths
  against the baseline's 93. It survived by barely playing.
- **100605 — THE STAGING (a counter, answered).** Aids day 4
  (village_0), day 13 (village_1), day 14 (village_2); studies
  days 7, 11. Opinion 10 day 4. Links formed days 13, 14, and
  16 — the third via `answerCounter`: the village countered
  the propose and the policy answered it, and the link formed.
  The only counter in the band, and it worked. All three
  seasoned by day 48, counted day 48 (+102). Council offered
  day 64, pact sworn day 65, national held 74 days to death
  at 138. Zero tends paid (90 tend-blocked-pantry days) — the
  links seasoned on tick trust alone, which is why this seed
  does not read as tend-gated. A raid the night the council
  sat (Emberhold carried off ~1,500 kcal) and a death in the
  family two days later tested the pact the week it was sworn.
- **100606 — short life, no seasoning.** Aids days 4, 51;
  studies days 6, 16, 29. Opinion 10 day 4. Four links formed
  but none seasoned — the village died day 85, before the
  30-day bar could pass on any of them. Seasoned-short:0-of-3.
  The road needs a village that lives past day 80; this one
  did not.
- **100607 — THE RUNG GATE.** Aids days 41, 41; studies days
  5, 8. Opinion 10 day 34 (the slowest armed seed — the aids
  came late because the pantry gate held them to day 41).
  Links formed days 41, 41, 42 — all three seasoned days 71,
  71, 72, all three counted day 72 (+102 standing). The shape
  qualified day 72 (14 qualified days) and the beat never
  staged: the rung day was 93 (first regional day 63 + 30)
  and the village died day 86, seven days before the rung.
  The analyzer names it `covenant-rung-gate` — the first time
  the onlylead2 metric-review-#4 naming has fired. The
  village did everything right and ran out of calendar.
- **100608 — THE STAGING (late, and the lines are lost).**
  Eight studies (the most in the band), two aids (days 12,
  87). Opinion 10 day 12. First link day 13 (village_2);
  the other two day 87 and 88 (village_0, village_1). All
  three seasoned by day 118, counted day 118 (+102). Council
  staged day 119, pact sworn, national held 36 days — and the
  national lapsed on the death day itself (day 155): the final
  series reads national through day 154, regional from day
  155, so the end-state rank is regional even though the
  village held national to the day it died. The council and
  pact lines are NOT in the corpus — this record hit the
  900-line cap at day 102, seventeen days before the beat
  (see metric review #5). The staging is established by the
  analyzer (stagedDays [119], sat 1) and the answercourt event
  (day 119, covenant, 'pact', sat), not by a quoted line.

## The pilgrimage stall (100604 — the rework item)

Twelve pilgrimages, 156 pilgrim-days, one study completed.
The pattern, from the deed events: study village_1 day 7
(start day 5 — two days, done). Then village_0: starts day
14, 29, 44, 61, 76 — five starts, exactly fifteen days apart,
zero studies. Then village_spl_24_39244: starts day 91, 106,
121, 136, 151, 166 — six starts, exactly fifteen days apart,
zero studies. The scholar walked back into Haven once between
day 14 and day 180 (day 59) — the pilgrim was on the road,
not at home, for ~150 days — and came home for good only
around day 181, when the last attempt went stale and the
proposals finally fired (days 189–191).

The stall mechanism IS established, from the policy source
and the event cadence together: the pilgrimage state machine
drops an in-progress trip as stale when `day − startDay > 14`
(`PILGRIM_STALE_DAYS`), and the start logic in the same call
immediately re-picks the nearest below-bar unstudied candidate
— the same village, because the study never completed and the
village is still the nearest — and starts the identical trip
again. Fifteen days between starts is fourteen days of stale
plus the same-day restart. The scholar never walks home on a
stale drop (`_returning` is set only after a successful study),
so the trip restarts from wherever the road left them, and the
village stays the nearest candidate, and the loop repeats.

What is NOT established is WHY the scholar never arrives
within fourteen days — whether the target village is too far
for ten hops a day over fourteen days, or whether `travelTo`
refuses on the road, or whether fights interrupt the walk.
The per-seed series records no scholar position, so the corpus
cannot distinguish "too far" from "stuck". The 100601 echo
(four restarts on village_spl_29_42769 before the study
completed day 106) shows the same loop can eventually break —
the trip is not impossible, just longer than the stale window
on far villages. Filed to the backlog as the rework item:
instrument the pilgrimage with distance-to-target, or give far
villages a longer stale window, or walk the scholar home on a
stale drop instead of restarting in place. The cost of the
stall is visible in the wall numbers: 100604's scholar spent
156 of 200 days on the road, and the village reached regional
on day 138, fought only to wave 3, and stood at 75 standing
with 31 deaths — it survived the horizon by barely playing.

## The blockers, shape by shape

- **COVENANT — the judged shape: 3/8.** Four failure
  families, not three: (a) seasoned-short, 4/8 — 2-of-3 ×1
  (100601, third link nine days too young), 1-of-3 ×1 (100603,
  the tend gate), 0-of-3 ×2 (100604, the stall; 100606, short
  life); (b) rung-gate, 1/8 (100607 — qualified 14 days, died
  seven days before the rung); (c) the stall, which is really
  family (a) with a mechanism (100604 — the links formed, but
  on days 189–191, too late to season). The staging bar needed
  three villages to clear opinion, pantry, and calendar
  together; three did. The opinion gate — the binding substrate
  of the last two runs — cleared on 8/8 (opinion 10 by day 34
  at the latest, median day 6). The binding gates are now the
  tend gate and the calendar, not opinion.
- **LEAD — isolation held, 0 staged on either leg.** Max 1
  seasoned Haven-primary sub per seed on both legs. The
  covenant leg never shadows lead and lead never shadows it.
- **CONQUEST — never attempted, 8/8.** 0 conquered subs, 0
  raidVillage calls by either caller. Unchanged from the DIAG
  and onlylead2.
- **BELONG — never a subordinate on either leg, 8/8
  no-sub-link.** The multi-gate improvement from onlylead2
  still finds nothing to name beyond the single gate — no
  seed's best link fails two gates here, because no seed
  forms a subordinate link at all.
- **TRADE — never attempted, 8/8.** Identical to covenant's
  absence, one road further down. Trade is the next road after
  covenant, not this arm.
- **SHADOWING — none observed.** No non-covenant shape ever
  qualified on the courtship leg (q0 everywhere except the
  three covenant stagings and 100607's rung-gated q14), so no
  shape was ever shadowed. The priority order never had to
  choose.

## Wall numbers (scale wall, every run)

| | baseline (covenant-b) | courtship (courtship-b) |
|---|----------|-------|
| National ever | 0/8 | **3/8 (100602, 100605, 100608)** |
| National at end | 0/8 | 2/8 (100608's lapsed on its death day) |
| Table / wins | 0 / 0 | 0 / 0 |
| Wave 4 reached | 8/8 | 7/8 (100604 stopped at wave 3) |
| Wave 5 reached | 1/8 (100603) | 0/8 |
| Median survival | 114d | 146.5d |
| Survived horizon (200d) | 0/8 | 1/8 (100604) |
| Wave kills (w1/w2/w3/w4/w5) | 256/178/63/39/13 | 277/183/57/18/0 |
| Total deaths | 697 | 649 |
| Villager combat deaths | 604 | 558 |
| Starvation deaths | 0 | **5** |

No seed won, no seed reached the table on either leg. National
moved: 0/8 → 3/8 ever, 0/8 → 2/8 at end — and all three are
COVENANT nationals, leagues of equals, not realms of
subordinates. But the wall has not fallen: standing past
national, the table, and the win still never fire in 200 days,
and the armed leg's wave-4 kills fell by more than half
(18 vs 39) with zero wave-5 kills — the scholar's 354
pilgrim-days band-wide are days not spent fighting, and the
wave-4/5 chain is the price the road pays. Median survival
rose 32.5 days, but every village still dies of the same
fights before day 200 except the one that barely played.

Per-seed before/after (days, end, scale, natEver, firstNat,
natHeld, starv, deaths, vCombat, maxW, standing — B = baseline,
A = courtship):

| seed | days B/A | end B/A | scale B/A | natEver B/A | firstNat A | natHeld A | starv B/A | deaths B/A | vCombat B/A | maxW B/A | stand B/A |
|------|----------|---------|-----------|-------------|-----------|-----------|----------|-----------|------------|-------------|-----------|--------------|
| 100601 | 104/168 | lost/lost | regional/regional | no/no | — | 0 | 0/0 | 81/147 | 63/132 | 4/4 | 199/199 |
| 100602 | 120/155 | lost/lost | regional/national | no/yes | 62 | 93 | 0/0 | 104/111 | 95/93 | 4/4 | 199/199 |
| 100603 | 170/124 | lost/lost | regional/regional | no/no | — | 0 | 0/0 | 161/103 | 148/93 | 5/4 | 1125/175 |
| 100604 | 176/200 | lost/survived | regional/regional | no/no | — | 0 | 0/1 | 93/31 | 82/28 | 4/3 | 199/75 |
| 100605 | 108/138 | lost/lost | regional/national | no/yes | 65 | 74 | 0/0 | 67/86 | 52/73 | 4/4 | 199/199 |
| 100606 | 82/85 | lost/lost | regional/regional | no/no | — | 0 | 0/2 | 46/37 | 41/32 | 4/4 | 150/100 |
| 100607 | 85/86 | lost/lost | regional/regional | no/no | — | 0 | 0/1 | 74/45 | 64/41 | 4/4 | 175/152 |
| 100608 | 149/155 | lost/lost | regional/regional | no/yes | 119 | 36 | 0/1 | 71/89 | 59/66 | 4/4 | 199/199 |

Four courtship legs lived notably longer than their baselines
(100601 +64d, 100602 +35d, 100605 +30d, 100604 +24d — the
last to the horizon itself); one lived notably shorter
(100603 −46d). Pending-national days: courtship 3 (the three
beats, each answered the next day); baseline 0 (no beats
staged on either road — the baseline never even heard the
court call).

## Village assessment (plain words)

Eight villages, twice each — once walking the covenant road
the way they always have, once with a scholar who goes out
and courts their neighbors first — and the difference is
visible in the first week. The villages that walk the old way
knock 524 times and are refused 511 of them: the same sentence
every day, "they barely know Haven's name," for weeks on end,
until the village dies still knocking. The villages that court
first barely knock at all — 26 knocks, 24 of them answered yes,
because the scholar has already been to their fire and sent
them grain. Three of those villages become nations of equals:
one in nine days of courtship and a council on the rung day,
one on a counter answered in the middle of a raid, one late,
on day 119, holding national for five weeks. The other five
show what still gates the road now that opinion is solved: one
village gets two friends sworn and the third nine days too
late; one gets all three friends and cannot afford to feed
the friendship; one does everything right and dies seven days
before the season would have let them sit together; one dies
too young to season anything; and one — the only village in
the band to see day 200 — spends its whole life waiting for a
scholar who is out walking to the same two fires, over and
over, for 156 days, and never arrives. Nobody wins, nobody
sits at the table. The road is real now — three villages
walked it — but it is a road with a price: the scholar who
walks it is not home fighting, and the villages that court
kill half as many wave-4 monsters as the villages that stay
home. And five villagers starve on the road against none at
home, on villages that gave less grain, not more — the cost
the pilot could not explain away is the cost that stops it.

Who thrived: 100602, the village that spent the whole lever in
its first week and sat in council on the rung day, holding
national 93 days; and 100605, which answered a counter, swore
the pact the day after its council, and held national 74 days.
Who died: the villages that did everything right and ran out
of calendar (100607, dead seven days before the rung), the
village that formed its friends and could not feed them
(100603), and the village that never got its scholar home
(100604 — alive at the horizon, but with the lowest standing
in the band and a story that is mostly an empty house). The
binding constraint is no longer "can the villages be known" —
it is "can opinion, pantry, and calendar all hold long enough,
on the same village, at the same time, while the scholar is
away courting instead of home fighting."

## Sense-testing (SENSE-TESTING LAW)

The Founding Council reads like a played ceremony — and this
time it was played three times. On 100602 the council is
offered day 61 and the pact sworn day 62:

> 🤝 The founding council: speakers from Emberhold, Thornfield,
> Ashford sit in a circle — no throne, no kneeling. This league
> needs its first act. Swear the war-PACT (mutual defense — any
> member's call is answered, or refused aloud), found the shared
> POOL (2,000 kcal a week from every fire into one granary,
> drawn in famine), or WALK from this table for now. Or REFUSE
> the scale itself — stay a free f…

> 🤝 The war-pact is sworn — no throne, no kneeling, just hands
> on the table. When any member's treeline burns, the league
> answers: Haven sends hands (two villagers, three days) or
> refuses aloud and the whole league hears it. Emberhold,
> Thornfield, Ashford — equals, now, in war as in council. The
> shared granary opens beside it: 2,000 kcal a week from every
> fire. (Trust +8 each.)

The day after the pact, the league is already working — the
pool pays out, a member's treeline burns and the pact is called,
and the pantry stands empty and the granary opens "as the
covenant promised. Famine relief, not a feast." Two days later
Grace says it in her own words: "Four fires, no head. The
pool's open and the pact's sworn. Ask me in a season if leagues
work." On 100605 the same ceremony plays with different names
(Emberhold, Stonebridge, Thornfield; 2,500 kcal a week) and the
same day a raid carries off ~1,500 kcal from the pantry — the
league is tested the night it is sworn. On 100608 the council
and pact lines are NOT in the corpus (the 900-line cap cut the
record at day 102; the beat staged day 119) — the staging is
established by the analyzer and the answercourt event, not by a
quoted line, and the evidence says so rather than quoting a
line it does not have.

The courtship deeds read like a relationship being built, not
like ledger entries. The aid line names the village and the
grain, every time:

> A runner leaves Haven with 2,000 kcal for Emberhold. Every
> kcal of it real. (Opinion +10.)

The codex line names the keeper and the debt:

> The keeper of Stonebridge's codex watches you copy the final
> page. "You're the first outsider to read it all," they say
> quietly. "Our dead wrote some of that. Carry it well."

And the refusal copy DOES change once the deeds land — the
prereg's sense-testing question, answered. On the baseline the
refusal repeats daily, the same sentence for weeks ("Stonebridge
barely know Haven's name — and a covenant is a relationship,
not a handshake. Sit with them first: walk to their fire and
study their codex, win where the region hears it, give it
weeks."). On the armed leg the refusal fires once per seed at
most — 100603's single day-12 refusal, before the first aid
landed — and then the corpus moves on to covenant-formation
lines ("Nikolai brings it home: a COVENANT with Stonebridge —
no primary, no kneeling. Mutual defense and a shared pool,
decided by council vote. Equals.") and the seasoning line
("Three weeks. That's how long before a handshake is a
relationship — the System will say so when it's true. Tend
this fire."). The engine stops telling the scholar they are a
stranger once the scholar stops being one.

Two blemishes. First, the pilgrimage itself has NO played lines
at all: 44 pilgrimages and 354 pilgrim-days leave zero lines
naming the road, the fire walked to, or the wait — the only
trace of a pilgrimage in the corpus is the study at the end of
it and the "You walk back into Haven" line when the scholar
returns. A player living 100604's 156 pilgrim-days would see
their scholar vanish for months with no story attached. The
stall is silent as well as long. Second, repetition: the
"walk back into Haven" line fires daily for the last twenty
days of 100604 (days 181–200), and the Knife-roll / harmonica
gift lines repeat every day on the staging seeds — the same
sentences a player would hear every morning. The village life
around the council is otherwise dense and human: runners beg
for food, speakers send invitations "properly, at their fire,"
traders report that "Thornfield sent Stonebridge grain when
their stores ran thin — no tribute, no ceremony, just food on
the road. That's a thing villages DO now."

## Metric review (§14)

1. **G2 was the right bar, and the pilot earned its GO — thinly.**
   3/8 staged with three real sat answers is exactly the bar,
   not above it, and the third staging (100608, day 119) came
   36 days before death. The bar distinguished a working lever
   from onlylead2's 1/8. No re-score is owed or attempted — but
   the next arm should note the bar is a cliff edge: 3/8 and 2/8
   are one village apart, and this pilot sits on the edge.
2. **THE TWO-JUDGE TENSION (recorded plainly, not resolved).**
   The prereg names G2 as the judge ("the preregged G2 bar is
   the judge, the panel is the record") but keeps the cost bar
   binding — and this pilot passes its judge and fails its cost
   bar. This evidence applies the prereg as written (cost bar
   binding → PILOT NO-GO) and does NOT re-score the pilot. But
   the prereg never says in one line what happens when G2 and
   the cost bar disagree, so the verdict had to be assembled
   from two sentences in different sections. Proposed revision
   for the NEXT run: the prereg states the combination rule in
   one line — e.g. "G2 GO + cost FAIL = NO-GO (cost is a veto)"
   or "cost FAIL is reported and the pilot proceeds to confirm
   on G2 GO" — and the next pilot is judged by that line alone.
3. **The cost bar failed on starvation the lever did not spend
   (onlylead2 #3, again).** Courtship starved 5 vs baseline 0,
   but the three seeds that paid the full 6,000 kcal of aid
   (100601, 100602, 100605) starved 0, and the 5 deaths sit on
   seeds that paid 2,000–4,000 kcal (100604: 1 on 2,000;
   100606: 2 on 4,000; 100607: 1 on 4,000; 100608: 1 on 4,000).
   There is no dose-response between aid spend and starvation.
   The bar is judged as written (FAIL), but the mechanism is
   policy-trajectory divergence, not lever spend — the aid gate
   (pantry > 12,000 kcal) means the gift only fires when the
   pantry is healthy. Note the prereg's own split cannot
   separate spend from weather on this leg: EVERY armed seed
   paid aid, so there are no zero-spend armed seeds to compare
   against — the dose-response read above is the substitute,
   and the next cost bar should pre-register it (starvation vs
   aid kcal per seed, not just a pooled bar).
4. **The rung naming worked (onlylead2 #4, resolved).** On
   100607 the analyzer names `covenant-rung-gate` — the shape
   qualified 14 days, the rung day (93) sat past the village's
   death (86), and the classification says so instead of
   misnaming a road-state blocker. The instrument change from
   this prereg fired on its first pilot.
5. **The 900-line linkLines cap binds WORSE than onlylead2
   (11/16 records, not 3/16).** Every baseline record except
   100606/100607 and every armed record except 100604/100606/
   100607 hit exactly 900 lines; the tails are cut — 100603
   baseline ends day 75 of 170, 100602 armed ends day 100 of
   155 — and 100608's staged-beat lines are lost entirely (cap
   cut day 102, beat day 119). The cap raise (600 → 900) bought
   the onlylead2 beat; it does not buy a 200-day record. The
   next arm should either scale the cap with the horizon or
   filter harder (the daily gift lines and "walk back into
   Haven" repeats are a large share of every record).
6. **The opinion read worked (onlylead2 #2, resolved).** The
   daily max-known-opinion read on the judged leg replaces the
   separate substrate probe: first-opinion-10 per leg is in the
   analysis (armed median day 6, baseline median day 57), and
   no probe was needed or run. The probe-vs-pilot gap from
   onlylead2 (probe day 48, first accept day 95) does not
   recur — on the armed leg the first accept follows the
   opinion-10 day by 1–4 days on the staging seeds.
7. **Analyzer tendsPaidKcal reads 0 on the courtship leg
   (instrument note).** The analysis per-seed `tendsPaidKcal`
   is 0 on all 8 armed seeds while the driver's capSummary
   records 43,500 kcal across 29 tends (and 16,500 kcal / 11
   tends on the baseline, where the two agree). Tend CALL
   counts agree on both legs (29 armed, 11 baseline); only the
   analyzer's kcal field disagrees. This evidence reports tend
   calls plus the driver's kcal figure, and the judged numbers
   do not depend on the kcal field — but the next arm should
   fix the analyzer's tend-kcal read for the courtship driver
   shape before citing tend kcal from the analysis alone.
8. **The counter machinery works on the covenant road.**
   100605's third link formed via `answerCounter` — the only
   counter in the band, answered, link formed, staged. The
   prereg expected 0 counters; one arrived and it worked. No
   bar depends on it; it is recorded because the counter path
   had never been exercised on this road.
9. **Telemetry check:** `scripts/telemetry-check.js` refuses
   recorder-corpus input by design (per-seed JSONs carry
   anchorCommit — they are sweep recorder rows, not runs). No
   LOUD line; the check does not apply to this corpus shape.
   The §15 panel is the deviation read instead (below).
10. **LIVE-SMOKE PROOF TESTS REDDEN ON REBASE DRIFT
    (bisected, not assumed).** After the rebase onto master
    tip 7a4353f68, test-courtship-b reads 56/57 and
    test-onlylead2-b 24/25, where both read green on the pilot
    tip. The two failures are live 200d-trajectory assertions:
    (a) courtship's study deed never fires on seed 100601's
    smoke (0 policy studyVillageCodex calls in 200 days,
    where the pilot corpus has 2 — days 6 and 106); (b)
    onlylead2's substrate-negative seed now forms 2 peer links
    (accepted days 134, 135), where the test asserts none form.
    All static checks pass on both tips. Bisect: both tests
    were re-run in a scratch worktree at the pre-rebase
    instrument commit ce82eea90 — 57/57 and 25/25, green. The
    only delta between the tips in game code is 2 src/js files
    across 22 master commits: src/js/convo-mood.js (+16, plain
    parting for friendly/neutral sittings — new RNG draws) and
    src/js/game.js (+16, CASCADE lingering change — lingering
    raiders no longer step onto the scholar or start contact
    fights). The rebased instrument changeset is byte-identical
    to the original, and no master commit touched this branch's
    files — so the reddening is master drift moving live
    trajectories under frozen proof tests, not an instrument
    defect. The pilot's judged numbers are unaffected (the
    corpora were generated pre-drift, on the tip where all
    proofs were green). Lesson for the next arm: live-smoke
    proof tests are pinned to a game-code tip — a rebase across
    game changes can redden them without touching the
    instrument, and the re-verification step must report
    pre/post numbers instead of assuming green carries. No
    test was edited to go green; the two failures stand as
    recorded above and the merge decision is the
    coordinator's.

## Balanced panel (§15)

Pseudo-panel compare (answercourt precedent — the real
balance-panel.js compare cannot judge a policy contrast; the
preregged G2 bar is the judge). Builder:
scripts/build-courtship-panels-20261115.js. Files:
evidence/2026-11-15/courtship-b-panel.{json,md} (+ `-before` /
`-after` `.json.gz`). Decision: **review_required** (8 paired
cases, screen only). National scale access 0 → 0.25
(no_material_signal — end-state national 2/8; the panel reads
scaleRank at end, not national-ever 3/8). Village deaths per
run 87.125 → 81.125 (no_material_signal, 95% exploratory
interval −34 to 23.375 — includes 0). Village deaths per 100
calendar days 70.75 → 59.16 (no_material_signal — the
courtship leg lives longer, so deaths per day fall even as the
death count barely moves). Community loss 1 → 0.875
(no_material_signal — the one survivor, 100604). Table win rate
0 → 0. The panel agrees with the preregged verdict: three
nationals, no win movement, no material signal either way. The
panel is the instrument; G2 is the judge.

## Evidence files

- Prereg (binding): evidence/2026-11-15/sim-courtship-b-prereg.md
- Instrument substrate (on master, unchanged):
  scripts/policies/competent-scaleclimb-b.js and
  scripts/policies/competent-covenant-b.js (the covenant road)
- Lever: scripts/policies/competent-courtship-b.js (new)
- Driver: scripts/onlylead-driver-20261115.js (extended:
  courtship policy + dirFor + aid/codex wrappers + LINK_LINE_RE
  fix + daily opinion read)
- Analyzer: scripts/analyze-onlylead-b.js (extended: rung naming
  + opinion/deeds rollups)
- Proof: scripts/test-courtship-b.js (new; 57/57 on the pilot
  tip, 56/57 on the rebased tip — the one failure is master
  game-code drift in the live smoke, see metric review #10);
  scripts/test-covenant-b.js (33/33, re-verified on the rebased
  tip); scripts/test-onlylead-b.js (29/29);
  scripts/test-onlylead2-b.js (25/25 on the pilot tip, 24/25
  on the rebased tip — same drift, see #10)
- Panel builder: scripts/build-courtship-panels-20261115.js (new)
- Per-seed JSON: evidence/2026-11-15/perseed-courtship-b-control/
  (8 files) and evidence/2026-11-15/perseed-courtship-b-on/
  (8 files)
- Analysis: evidence/2026-11-15/courtship-b-analysis.json
  (+ .log, + extract logs)
- Panel: evidence/2026-11-15/courtship-b-panel.{json,md} +
  courtship-b-panel-before.json.gz /
  courtship-b-panel-after.json.gz
- Pilot log: evidence/2026-11-15/courtship-b-pilot.log (+ .err,
  empty)
- Evidence: this file

## Commits (branch sim-courtship-b)

- d04ec6e47 sim-courtship-b prereg (binding; courtship-deeds
  lever; pilot band 100601–100608, confirm 100621–100636 fresh)
- 879bb47bb sim-courtship-b prereg amendment (pre-build, no sims
  run): aid pantry gate 20,000 → 12,000
- 81902b85e sim-courtship-b prereg amendment 2 (pre-pilot, no
  judged numbers): LINK_LINE_RE gains 'runner'
- ce82eea90 sim-courtship-b instrument: courtship-deeds lever
  (codex pilgrimage + one 2,000-kcal aid gift per village) +
  driver courtship policy/opinion read/LINK_LINE_RE fix +
  analyzer rung naming/opinion rollups + panel builder + proof
  test 57/57
- (this commit — pilot corpora + analysis + panel + evidence;
  rebased onto current master before landing — see below)

Rebase (adoption, 2026-11-15 ~17:05Z): branch rebased onto local
master tip 7a4353f68 (H1 transplant 7redef matched-band; 22
commits ahead of the creation base a9d85e32c; origin/master
874d97c00 is an ancestor of it). The rebase stopped once at the
instrument pick (the documented stop-at-pick quirk: pick in
both done and todo lists, worktree clean, pick unapplied —
verified, then `git rebase --continue`; sailed through). No
master commit touched this branch's files, so the rebase was
conflict-free. Rebased hashes: prereg 74c3dc8b2, amendment
d864fe7bb, amendment 2 f92831766, instrument 303508ce3,
evidence b54968205, corpora f55bfefbb (tip). Proof tests
re-run on the rebased tip after this commit: test-courtship-b
56/57, test-covenant-b 33/33, test-onlylead-b 29/29,
test-onlylead2-b 24/25 — the two failures are master game-code
drift in live smokes, bisected to the pre-rebase tip (both
green there: 57/57 and 25/25; see metric review #10). Zero
`src/js` in the branch diff vs 7a4353f68 (33 files: scripts/ +
evidence/ only). The rebased instrument changeset is
byte-identical to the original ce82eea90.

## Findings for the backlog (coordinator owns sim-findings.md)

1. **THE PILGRIMAGE STALLS ON FAR VILLAGES (100604).** 12
   pilgrimages, 156 pilgrim-days, 1 study completed; the same
   trip restarts every 15 days (14-day staleness + same-day
   restart on the same nearest candidate) and never arrives.
   The scholar is absent 78% of the run; the village survives
   the horizon by barely playing (regional day 138, wave 3,
   standing 75). Rework before any re-pilot: instrument the
   pilgrimage with distance-to-target (the corpus cannot say
   whether the village is too far or the travel is blocked),
   or give far villages a longer stale window, or walk the
   scholar home on a stale drop instead of restarting in
   place. The stall is silent too — 44 pilgrimages leave zero
   played lines.
2. **THE TEND GATE STILL STARVES THE ROAD (100603).** 1 tend
   in 124 days (23 tend-blocked-pantry days); 1-of-3 seasoned.
   The tend gate (20,000) is stricter than the propose gate
   (12,000) and the aid gate (12,000) — on a poor village the
   road forms and then stalls. Next arm: tend on a lower pantry
   gate, or season links by time alone when trust is tended by
   deeds. (100607 seasoned all 3 with 0 tends, so the gate
   binds on poor villages, not everywhere.)
3. **THE ENGINE COURTS TOO — AND COMPETES WITH THE COVENANT
   POOL (100601).** Engine lead link with village_2 day 29
   took it out of the pool until it broke; the policy's
   covenant with village_2 came day 147, nine days too late to
   season. Same finding as onlylead2 #2, second sighting.
4. **THE RUNG GATE (100607).** The village did everything
   right — 3 links formed days 41–42, all seasoned and counted
   day 72 — and died day 86, seven days before the rung (93).
   The analyzer now names it (covenant-rung-gate). A calendar
   gate the road cannot outplay.
5. **THE 900-LINE CAP (11/16 records).** 100608's staged-beat
   lines are lost (cap cut day 102, beat day 119). Scale the
   cap with the horizon or filter harder on the next arm.
6. **ANALYZER tendsPaidKcal 0-ON-COURTSHIP-LEG.** The
   analysis per-seed tend-kcal field reads 0 on the armed leg
   while the driver records 43,500 kcal / 29 tends. Fix the
   analyzer's tend-kcal read for the courtship driver shape.
7. **THE COURTSHIP DAY-COST (wave-4/5 chain).** Armed wave-4
   kills 18 vs baseline 39, wave-5 kills 0 vs 13 (100603
   baseline reached wave 5; its armed leg stopped at wave 4).
   The scholar's 354 pilgrim-days are days not spent fighting.
   The road's price is measured in kills, not just grain — the
   next rework should weigh it when pricing the deeds.
8. **THE COUNTER PATH WORKS (100605).** One counter proposed,
   answered, link formed, staged. The counter machinery had
   never been exercised on the covenant road before.

## Convergence state

Courtship-deeds build arm on a 200d horizon — PILOT NO-GO:
covenant beats staged 3/8 (bar ≥3/8 — G2 GO, exactly at the
bar); cost bar fails (starvation 5 vs 0, bar ≤2); G1 GO; G3
qualified on the rebased tip (proofs green on the pilot tip,
two live-smoke checks reddened by master game-code drift —
see metric review #10; instrument changeset byte-identical).
The opinion gate is PROVEN OPEN in live play — opinion 10 by
day 34 at the latest, median day 6, on all 8 seeds, against a
baseline median of day 57 — and the covenant road staged 3/8
with the lever against 0/8 without it (1/8 on onlylead2's
band). But the pilot does not confirm: no confirm spent;
confirm band 100621–100636 stays fresh. No game change; the
courtship policy remains a proven instrument (policy-side, no
default flip, no src/js). The axis line updates from this run's
numbers only: covenant is the second road proven staged in live
play (lead staged across the bands; covenant now 4 — 1 on
onlylead2's band, 3 here); conquest, belong, and trade remain
unit-proven only. The next step for the road is a REWORK, not
another propose variant: fix the pilgrimage stall (far-village
stale window / walk-home on stale drop / distance instrument),
tune the aid price against the cost bar's no-dose-response
read, then re-pilot on a FRESH band. The findings-backlog item
("THE COVENANT ROAD IS GATED BY OPINION") is NOT marked
[fixed] — the lever opens the gate but the pilot is NO-GO, so
the item stays open with the pilot verdict and the rework step
appended.
