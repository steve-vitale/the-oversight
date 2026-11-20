# sim-dmgshape-rerun-b — the damage-per-launch re-measurement (finding #2605; tracker blank #2)

**Verdict: NO-GO, kind METRIC-BROKEN** — the pool floor fails on
both legs: 4 launches with a first fight against the target
(floor 6), 3 fled first-fights (floor 4). The designated band
delivers fewer launches under the current policy than it did
under the survey's (17) or partysurvive-rerun's (9): **8
launches on the full band**, and half of them never had a first
fight at all — all four launched against a target type whose
last fight predated the launch. The instrument is green
(classification 4/4, reconciliation 0.0%, 0 errors, 8/8 files),
the decomposition bars pass-or-nearly on the three fights that
exist (accounted 0.694 vs the 0.70 bar, top 61.9% vs 25%), but
three fights cannot carry the bar, and the verdict is NO-GO by
the frozen pool floor. That IS the finding: on this band, under
this policy, the launched-damage population is thinner than the
survey promised twice over — the launch rate fell again, and
the launches that do happen chase targets that are already gone.

- **Branch:** `sim-dmgshape-rerun-b`, tip `d4fd409d9` (instrument)
  at leg time; base master `5e38f3f7b` + ported ALLYSLOT3 slot
  `735fce64f` (cherry-pick of `f4d1100ee`) + instrument
  `d4fd409d9`
- **Prereg:** `evidence/2026-11-19/sim-dmgshape-rerun-b-prereg.md`
  (frozen 2026-11-19 ~22:05 UTC, before any judged sim; commit
  `dbadda2b5`)
- **Analysis:** `evidence/2026-11-19/dmgshape-rerun-b-analysis.json`
  (analyzer exit 0; log `dmgshape-rerun-b-analysis.log`)
- **Panel:** BLOCKED by the write flap (see §8) — the builder
  `scripts/build-dmgshape-rerun-b-panels.js` is committed and
  ready; the compare has not run. The reproducibility reference
  is the direct wall-number comparison in §4.
- **Corpus:** `evidence/2026-11-19/perseed-dmgshape-rerun-b/`
  (8 seeds, 150 days, 0 instrument errors)
- **Seeds:** 106081–106088 (the FULL designated band, never a
  subset)
- **Leg:** single diagnostic leg, substrate SENSEEXPED=1,
  PARTYSIZE4=1, VETREENGAGE=1, FLEEREPAIR2=1, FIGHTALLY2=1,
  ALLYSLOT3=1 (slot PORTED — coordinator's call), LAUNCHSURVIVE=1.
  Competent verbatim (policy sha256 first-12 `150229eda010` —
  moved since the survey/rerun, see §6), 150-day death-aware.
  Leg log `dmgshape-rerun-b-leg.log` (exit 0, ~6 min for 8 seeds).

## EVIDENCE-ONLY — the ported lever never merges

The ALLYSLOT3 slot on this branch is a port of held commit
`f4d1100ee` (partysurvive's own port of sim-allyslot3-b
`7efbf26a8` via sim-fightcap-b `5a5343363`), cherry-picked clean
as `735fce64f` (no conflicts; the comment-only conflict in
`party-wiring.js` the fightcap evidence warned about did not
recur against `5e38f3f7b` either). Verification:
`ALLYSLOT3` 12× in `fieldFights.js`, 3× in `game.js`, 3× in
`party-wiring.js`; `ally3Vid` 31× in `fieldFights.js` — identical
counts to the 1230Z and 1830Z ports. Proof test
`scripts/test-allyslot3-b.js`: **18/18**. It exists ONLY so this
diagnostic could run on the fightcap arm substrate. It must NEVER
be merged to master as a game change: the coordinator lands
evidence-only or releases the branch done-abandoned.

## 1. Judged numbers (frozen bars, §14 of the prereg)

| Bar | Measured | Bar | Result |
| --- | --- | --- | --- |
| Pool: launches with a first fight | **4** | ≥ 6 | **FAIL** |
| Pool: fled first-fights | **3** | ≥ 4 | **FAIL** |
| Instrument errors / files | 0 / 8 | 0 / 8 | PASS |
| Classification (gloss reading) | **4/4 = 1.000** | ≥ 0.90 | PASS |
| Classification (strict reading, beside) | 2/4 = 0.500 | — | reported |
| Reconciliation (exact identity) | **0.0%** | ≤ 15% | PASS |
| Accounted share | **0.694** | ≥ 0.70 | FAIL (on n=3) |
| Top contributor | **baseCeiling 60.8/round = 61.9% of gap** | ≥ 25% | PASS (on n=3) |

GO required the pool floor + classification + accounted + top +
reconciliation + instrument. The pool floor fails on both legs,
so the verdict is NO-GO, kind METRIC-BROKEN. The accounted/top
passes are reported, not banked: three fights cannot carry them
— and the accounted share misses the bar by 0.006 on n=3 in any
case.

### The judged decomposition (n=3 fled first-fights, 12 rounds, 138 damage)

| Component | /round | Share of gap (98.3) |
| --- | ---: | ---: |
| (a) Verb loss — fighter rounds spent on verbs, not strikes | 2.74 | 2.8% |
| (b) Miss loss — zero-damage strikes | 0.00 | 0.0% |
| (c) Ally-delay loss — empty striker slots | 4.67 | 4.7% |
| (d) Base-rate ceiling — 111 − P_mean × 4 | 60.82 | 61.9% |
| **Accounted** | **68.22** | **69.4%** |
| D_meas (mean of per-fight rates) | 12.73 | — |
| Gap G = 111 − D_meas | 98.27 | — |

Reconciliation (exact identity): (a′)+(b′)+(c′)−echo = 38.68 vs
`P_mean × 4 − D_strike` = 38.68 → error **0.0%**. The counts are
complete; the pricing is what's thin (see §7.2 — the reported
(c) understates the empty-slot loss because two of the three
fled fights had no ally strike to price from).

### The four first-fights (the whole judged population)

| Launch | First fight | Rounds | Dealt / HP | /round | Outcome |
| --- | --- | ---: | ---: | ---: | --- |
| 106081 d112 app_mgpspho1903 → herald (quad) | d114 herald vs Kauã, aid | 6 | 107 / ~95 | 17.8 | **vKill** |
| 106083 d114 caleb_jones → editor (quad) | d115 editor vs Caleb, world-tick | 2 | 24 / 1438 | 12.0 | vFlee |
| 106084 d115 visjoin_109 → herald (pair) | d118 herald vs Ignacio, world-tick | 3 | 52 / 494 | 17.3 | vFlee |
| 106084 d124 visjoin_114 → herald (trio) | d124 herald vs Marcel, world-tick | 7 | 62 / 284 | 8.9 | vFlee |

Per-fight components: d115 editor — verb 0, ally-delay null (no
ally struck), baseCeiling 63.0, kill-gap 1414 HP (12.7 rounds at
111); d118 herald — verb 7.50, ally-delay 18.67, baseCeiling
41.7, kill-gap 442 HP (4.0 rounds); d124 herald — verb 1.48,
ally-delay null, baseCeiling 69.7, kill-gap 222 HP (2.0 rounds);
d114 kill (reported beside, never in the fled set) — verb 2.30,
ally-delay 68.00, baseCeiling 49.0. Per-member (fled set):
fighter 131 (94.9%), ally1 7 (5.1%), ally2 0, ally3 0. Strikes:
11 attempted, 11 landed, 0 zero — hit rate 1.000, 0.92 attempts
a round. Ability-touch damage 0, volley 0, tricks 0. Rage: 0
fights in the population (no late-Rage pin to make — the
secondary is observed-absent). Median fled fight: 3 rounds.
Mean kill-gap 692.7 HP — 6.2 more rounds at 111/round.

**No expedition first-fight exists in the population** (origins:
world-tick 3, aid 1). The re-run's premise — any origin — is
what found anything at all: under the old expedition-only join
this leg would have had a population of zero.

## 2. Why the pool is thin — the launch rate fell again, and the launches chase dead targets

Launches per seed (targetWave ≥ 4, survey counting): 106081 3,
106082 0, 106083 1, 106084 4, 106085 0, 106086 0, 106087 0,
106088 0. **Total 8** — against the survey's 17 on the same
seeds and partysurvive-rerun's 9. The designated band's launch
rate does not reproduce under the current policy (competent.js
moved at journey-landing r148, `cf17e4dd6`, +78 lines, since the
survey) plus the bowcraft turn-on (`d56fbe819`, live on this
base). Finding #2616 extends: the designation is not a property
of the seeds, and it is not stable across policy moves either —
each substrate/policy step re-rolls the launch rate. The launch
engines moved too: the survey's engines were 106083 (10) and
106084 (5); this leg's are 106084 (4) and 106081 (3), while
106083 launches once and 106087 — home of nina's launch in both
prior legs — launches zero times (31 v4departs rows, none a
wave-4+ launch).

Of the 8 launches, only 4 ever had a first fight — and the other
4 all share one shape: **the launch came after the target type
was already gone.**

| Launch | Target | Last fight of the target type on the seed |
| --- | --- | --- |
| 106081 d115 app_mgpspho1903 → herald | herald | d114 (the kill) — the day before |
| 106081 d117 app_mgpspho1903 → herald | herald | d114 — three days before |
| 106084 d136 visjoin_114 → herald | herald | d126 (the kill) — ten days before |
| 106084 d141 visjoin_114 → herald | herald | d126 — fifteen days before |

Both holders re-launched twice against a target type nobody
fought again for the rest of the run. The launch system does not
check whether the target still lives (or still appears): the plan
store holds a target past its death, and the village keeps
departing after it. The "no first fight" half of the pool is not
"never met" — it is "launched after the target type stopped
appearing." (The coordinator files this as a new finding; the
number is 4/8 launches, all re-launches, both after a kill.)

The two killed targets frame the story. On 106084, ONE herald
(HP 700–900) was ground down across eight meetings, d113→d126:
193, 13, 52, 136, 22, 62, 11, and the 221-damage kill — 710
dealt in total, which fits a single 700-HP herald killed with
10 overkill. The launched parties' first-fights are meetings 5
and 6 of that grind; the killer, d126, is Rafael — with the
d124 launcher visjoin_114 fighting beside him as an ally. The
launch did not create the fight: the village had been fighting
that herald for eleven days already, and the kill came on the
eighth meeting, not the first. On 106081 the same shape holds
with one loose end: the herald was fought d109 (324, 72, 24 —
one 700-HP herald, 700→376→304) and d110 (10; 280→270), but the
d114 kill's herald entered the fight at ~95 HP (log line) —
175 HP of wounding between d110 and d114 sits in no recorded
fight, so either a second herald was involved or the damage
came through a path the recorder does not see. Either way the
kill is a cleanup of a nearly-dead monster, not a full-HP kill:
107 damage over 6 rounds (17.8/round) against a monster with
~95 HP left.

## 3. Exploratory: the all-first-fights decomposition (NOT the verdict)

The frozen verdict stands on the n=3 fled set. The same
decomposition over ALL first-fights regardless of outcome
(n=4, fled + the one kill), labeled exploratory, never a
re-score:

| | All 4 first-fights |
| --- | --- |
| D_meas (mean of per-fight rates) | 14.01/round |
| Gap vs 111 | 96.99/round |
| (a) Verb loss | 2.59/round (2.7%) |
| (b) Miss loss | 0.00/round (0.0%) |
| (c) Ally-delay loss | 25.78/round (26.6%) |
| (d) Base-rate ceiling | 56.65/round (58.4%) |
| Accounted | 0.877 |
| Reconciliation error | 0.0% |

The kill fight flips the ally-delay term (25.78 vs 4.67): its
17 empty slot-rounds, priced at the killer's ally mean (24 —
Chantal's single killing strike), dominate the pooled term.
Read both tables together: the base-rate ceiling is the largest
term either way (58–62%), and the ally-delay term is the part
that swings with which fights are in the set — it is large
whenever allies fail to arrive, which is whenever the fight is
short or the fighter is alone. Misses contribute nothing in
either table: hit rate is 1.000 — zero 0-damage strikes in 17
attempts across the whole population. The party lands 0.92
strikes a round out of 4 possible, and even four strikes a
round at the measured quality (P_mean 12.5) caps output at
~50/round — still 61 short of 111.

## 4. Reachability (waves 1–5, national/table/wins, median survival)

| | This leg | Partysurvive-rerun-b (same band) | Survey wall (same band) |
| --- | ---: | ---: | ---: |
| Full wins | 0/8 | 0/8 | 0/8 |
| National scale | 0/8 | 0/8 | 0/8 |
| Table | 0/8 | 0/8 | 0/8 |
| Wave 5 reached | 4/8 | 4/8 | 4/8 |
| Wave 4 reached | 8/8 | 8/8 | 8/8 |
| Standing ≥ 200 | 4/8 | 4/8 | 4/8 |
| Survived 150d (gameDays) | 5/8 | 3/8 | 4/8 |
| Median survival (gameDays) | 150.5d | 141d | 143d |
| Community loss | 3/8 | 5/8 | 4/8 |
| Starvation (villager deaths) | 2 | 3 | 5 |

Per-seed (days / end / maxWave / standing / rank): 106081 150
survived / 5 / 410 / regional; 106082 150 survived / 4 / 199 /
regional; 106083 142 village-lost / 5 / 445 / regional; 106084
150 survived / 4 / 199 / regional; 106085 150 survived / 4 /
199 / regional; 106086 145 village-lost / 5 / 325 / regional;
106087 150 survived / 5 / 390 / regional; 106088 140
village-lost / 4 / 199 / regional.

The wall is stable on wave-5 (4/8) and standing ≥200 (4/8) and
the 199 stall is the visible ceiling again — four seeds at 199,
one point short of the 200 release bar. What moved is survival:
5/8 survive (was 3/8) and the median rose 141d → 150.5d under
the current policy + bowcraft. Survival improved while launches
fell — the substrate moved the villages' staying alive, not
their hunting. No village wins, reaches national, or takes a
seat.

Band-wide villager death causes (110 villager deaths, all causes
— context, not the judged denominator): `the wild` 39 (35%),
`monster` 28 (25%), contest 9, `a wound that wouldn't close` 9,
`the arena` 6, thirst 6, starvation 2, `a stranger` 2, named
monsters 1 each (The Ugly Beast, The Reunion, Big Big, The
Callback, The Loud Beast, Gavel), `the night` 1, `the
expedition` 1, dehydration 1. The unstoried classes still
dominate: `the wild` + `monster` = 60% of villager deaths.

### Balanced panel (instrument, not judge) — BLOCKED

The builder (`scripts/build-dmgshape-rerun-b-panels.js`,
re-pointed at this corpus vs the partysurvive-rerun-b corpus
as a same-band reproducibility reference) could not write its
output: the host write flap EPERM'd every attempt, including a
480-retry robust write (see §8). The compare has not run. The
reproducibility reference is therefore the direct wall-number
comparison in the table above, not a panel delta. The builder is
committed and ready to run when the flap clears.

### Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-19/perseed-dmgshape-rerun-b/*.json' --metrics
national,table,wins,exiled` — refused, verbatim:
"telemetry-check: refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs. Recorder corpora are compared with
sweep-compare tables, never against a run baseline here." Exit 2
(the refusal code, not a failure). No deviation recorded; wall
numbers above are reported directly.

## 5. Sense-test: reading the fights

All four first-fights read in full (uncapped logs).

- **d114 herald kill (106081, aid, Kauã):** the richest log and
  the most misleading number. Kauã opens with a hatchet strike
  for 14 (81 left) — the herald is already nearly dead — binds
  a wound, strikes 15/12/16/13/13, and Chantal charges in on
  the fifth shout and lands the killing blow for 24. The fiction
  holds: "The Herald is wounded past its line — and holds its
  ground. It is not leaving. (Committed)" repeats every round,
  and "Kauã holds the line — they know how this one is fought,
  and have not had their turn to prove it" repeats three times.
  The repetition is the thin spot, same as dmgshape-b noted —
  the lines are good once and flat by the fifth telling. The
  kill reads as a real finish to a long grind, not a launched
  party overpowering a fresh monster: 107 damage in 6 rounds is
  17.8/round, and the monster entered at ~95 HP.
- **d115 editor (106083, world-tick, Caleb):** two rounds, two
  12-damage strikes — with BLOODED active ("Strikes hit 1.5× as
  hard") — against a 1438-HP Editor, and Caleb flees at 7 HP.
  Aria "charges in" only after Caleb is already running: "Aria
  answered Caleb's shout, but Caleb is past holding — they run
  while running still works." The ally arrives into the flee,
  again — the same beat as dmgshape-b's d113 Eater. No
  double-naming here: the log calls it "the editor" throughout
  (the mechanics lines use the same name as the fiction lines).
- **d118 herald (106084, world-tick, Ignacio):** the cleanest
  small fight. Ignacio strikes 23, 22; Raj joins on the first
  shout and strikes for 7; Rafael "charges in" after Ignacio is
  already fleeing. The Brawler's Instinct line ("reads the fight
  as it moves — the body tells them what the mouth won't") lands
  once and is not repeated. Nothing reads robotic; the numbers
  don't: 52 damage in 3 rounds against a 494-HP herald.
- **d124 herald (106084, world-tick, Marcel):** seven rounds,
  the longest fled first-fight — and the flattest. Marcel strikes
  12/8/8/12/10/12, binds one wound in R1, and "holds the line —
  they know how this one is fought, and have not had their turn
  to prove it" repeats five times in five rounds (R2–R6).
  Rafael arrives into the flee at R7. The fight is vivid in its
  first telling and flat by the fifth: the same sentence five
  times while the monster's HP ticks 284 → 222. A 7-round fight
  that dealt 62 damage was never winnable — the strikes are
  8–12 against a 284-HP monster, and the ally who could have
  helped arrived after the decision was made.

**Double-naming:** none observed in these four fights (the
d118 "Big Beast" wrinkle from dmgshape-b does not recur here —
the herald/editor logs name the monster consistently). The
fiction wrinkle that DOES recur is the repeated "holds the
line" sentence and the "answered the shout, but past holding"
beat: both are content-depth notes, not diagnostic failures.

## 6. Village assessment, in plain words

Eight villages, same seeds the survey watched launch seventeen
times — and under the current rules they launch eight, only
four of them ever meeting their target, and the one kill in the
whole set is a cleanup: a party finishing off a herald that was
already at 95 HP after four days of other people fighting it.
The villages that do launch fight for real — seven rounds,
sixty-two damage, a companion stepping in to land the killing
blow — but the damage is small because the strikes are small
(8–12 a hit against monsters with hundreds of HP left) and the
companions arrive after the fight is decided or into the flee.
The launched party almost never fights as a party: across the
three fled fights, the fighter dealt 95% of the damage and the
allies 5% — one 7-damage strike between them. And half the
launches never meet anything at all, because the village keeps
departing after a target type that was already killed days ago.
The binding picture is unchanged from the 1230Z leg, one level
up: the pool is thin because the launch itself is
trajectory-fragile — the rate fell from 17 to 9 to 8 across
three substrate steps on identical seeds — and the launches
that survive the trajectory then chase dead targets. The wall
numbers moved the other way: more villages survive now (5/8),
but none of them wins, reaches national, or takes a seat, and
four of them sit one standing point short of release.

## 7. Metric review (for the NEXT run — this run is judged as frozen)

1. **The pool floor priced a gamble the band lost twice over.**
   The floor (≥6 first-fights) was priced from the survey's 17
   and partysurvive-rerun's 9; the leg delivered 8 launches
   and 4 first-fights. The designation does not transfer
   across substrates (finding #2616) and does not survive a
   policy move either. A future survey that designates a band
   should survey under the re-run's full substrate AND the
   re-run's policy, or the prereg should price its floor from
   a same-substrate pilot, not from a prior leg's count.
2. **Classification: the prereg holds two readings, and the
   analyzer implements the gloss.** The prereg defines
   classified as "a complete decomposition (verbLoss, missLoss,
   allyDelayLoss, baseCeiling all non-null — i.e. the fight has
   at least one landed strike to price from...)". The strict
   reading (all four non-null) fails two of the four
   first-fights — the d115 editor and d124 herald fights, where
   no ally ever landed a strike, so allyDelayLoss is null.
   The gloss reading (≥1 landed strike) classifies 4/4. The
   analyzer judges on the gloss and reports the strict share
   (0.500) beside it. The strict reading punishes fights for
   being solo — which is the phenomenon under measurement, not
   an instrument gap — so the gloss is the right judge; but the
   prereg should have carried one reading only, and the next
   prereg should freeze the classification rule as "≥1 landed
   strike" in its own words.
3. **The accounted residual is unpriced ally-delay, not
   unexplained damage.** The reported (c) prices empty slots
   per-fight at that fight's ally mean — and two of three fled
   fights had no ally strike, so they contribute 0. The exact
   identity prices the same empty rounds at the pooled mean
   (c′ = 36.59/round vs reported (c) = 4.67/round) and
   reconciles at 0.0%. The 30.6% unaccounted is therefore
   mostly ally-delay the reported component could not price,
   not damage the model cannot explain. A future analyzer
   could price (c) at the pooled mean (like the identity
   does) and report the per-fight pricing beside it; on this
   population the accounted share would read ~0.99 instead of
   0.694. Not re-scored here (metric binding).
4. **Target matching is by TYPE, not instance — and the
   grind stories show the cost.** The 106084 herald arithmetic
   fits one 700-HP herald across eight meetings, but the
   instrument cannot prove it (no instance id), and the 106081
   kill's ~95-HP entry does not reconcile with the same seed's
   recorded herald (270 HP after d110). The "first fight
   against the target" is the first fight against the target
   TYPE; whether it is the individual the village has been
   grinding is unknowable from the corpus. The evidence names
   the type beside every first fight so this stays auditable.
5. **Day granularity:** one first-fight is same-day (d124 —
   launch and fight on the same day). The family's convention
   (day ≥ launch.day) is kept; the same-day row is flagged in
   the per-launch table (§1). One of four rows rests on it.
6. **Panel / telemetry:** panel blocked by the write flap
   (builder committed, compare not run); telemetry refused
   recorder corpora (verbatim, §4). No LOUD lines from either.
7. **No `check.js` gate was run** — the port is evidence-only
   substrate, never to be merged; the proof tests
   (`test-dmgshape-rerun-b.js` 8/8, analyzer selftest 28/28,
   `test-allyslot3-b.js` 18/18) are the gate for this arm.

## 8. Blanks and findings notes for the coordinator

- **JUDGED VERDICT: NO-GO, kind METRIC-BROKEN** — 4 launches
  with a first fight (floor 6), 3 fled first-fights (floor 4)
  on the designated band; instrument green. The question "what
  lifts a launched party toward ~111 damage/round" has no
  judged answer on this band because the population is too thin
  to decompose — the exploratory tables (§3) carry the shape
  instead: base-rate ceiling 58–62% of the gap, ally-delay
  5–27% depending on the set, verb ~3%, miss 0%.
- **Finding #2605 — ANSWERED IN PART, pool-blocked (again):**
  the re-measurement ran clean and the first-fight population
  is now defined and instrumented (analyzer + proof test
  committed), but the judged bars cannot be carried on this
  band under this policy. The next run on this question needs a
  band surveyed under the full substrate AND current policy —
  or a floor priced from a same-substrate pilot.
- **Finding #2616 EXTENDS — designation does not survive a
  policy move:** 17 → 9 → 8 launches on identical seeds across
  the survey, the re-run, and this leg. The only change between
  the last two steps is the policy file (r148, +78 lines) and
  the bowcraft turn-on. A designated band is a property of a
  (substrate, policy) pair, not of the seeds.
- **NEW — launches against a dead target type (coordinator to
  file):** 4/8 launches on this leg re-launched a target type
  whose last fight predated the launch (both holders twice,
  after a kill). The launch system does not check target
  liveness. The number is small but the shape is clean: the
  plan store holds a target past its death.
- **Standing-199 stall, 4/8 seeds.** Four villages sat at 199,
  one point short of the 200 release bar. Same stall the
  program has seen before; still the visible ceiling on this
  band.
- **Wave 5 opened on 4/8** (same as the survey's and the
  re-run's wall for this band). Survival improved (5/8 vs 3/8)
  while launches fell — the substrate moved staying alive, not
  hunting.
- **Out-of-scope gap (note only):** `the wild` (35%) + generic
  `monster` (25%) = 60% of villager deaths are unstoried
  classes. Same note as finding #2607; no new mechanism
  claimed here.
- **Instrument note:** the panel builder now carries a robust
  write (tmp + rename + 480 retries, copied from the driver)
  after the plain write EPERM'd — it still could not write
  during this window. The builder fix is a tooling change, not
  a game change.
- **Write flap:** ACTIVE from ~22:04Z through the end of this
  run: every panel-builder write EPERM'd (6 single retries, a
  24-try loop, two 480-retry robust writes — 0 successes), while
  small probe writes intermittently passed (7-byte and 2KB
  probes at 22:08, 22:13, 22:14). The judged leg (21:55–22:01)
  and the analyzer output (~22:02) wrote cleanly before the
  window opened; nothing was lost. The panel compare is the only
  casualty.
- **Safe-commit index clobber struck twice** on this branch
  (after the prereg commit `dbadda2b5` and the instrument
  commit `d4fd409d9` — committed files showed staged-deleted).
  Repaired both times with the documented `git ls-tree -r HEAD
  -- <paths> | git update-index --add --index-info` pipe;
  verified by `git status` empty + `git diff HEAD` empty +
  hash-object == HEAD blob per file.
- **Panel / telemetry:** panel blocked (flap, §4); telemetry
  refused recorder corpora (verbatim, §4). No LOUD lines.
- **No `check.js` gate was run** (see §7.7). The ported lever
  must NEVER be merged to master as a game change.
