# sim-stageally-confirm2-b — stageally NO-GO re-run on band 53001–53008, current master: GO

**Arm:** sim-stageally-confirm2-b (run fleshout-loop-b-20261107T0420Z, axis
scale-onramp / winnability chain) · **Re-run duty: re-measure the
confirm-b NO-GO on the SAME band on current master, after the 0230Z run
found a living pair on 53006 staged where the confirm found 0/8.**
Policy-only measurement, zero edits to the policy, zero src/js, no
gate/price/deed change.
**Verdict: GO** — by the preregged bar (same bar as the confirm-b prereg,
frozen): living-pair seeds armed 2/8 (bar ≥ 1) AND post-first-blood
wave-4 kills armed 14 (bar ≥ 3); baseline post-blood kills 8. Guard holds
(armed median survival 114.5d vs baseline 96d, +18.5d). THIN checks clear
first (T1 rally fires 60 ≥ 8; T2 ally presence 85.7% ≥ 40% with 70
fights) — the lever engaged and the primary held on BOTH routes. The
confirm-b NO-GO does not survive current master.
**Band:** 53001–53008 DELIBERATELY REUSED (see reuse record in the
prereg — this is a re-run on current master, not a fresh band) ·
**Horizon:** 150d death-aware · **Legs:** competent-verbatim baseline vs
staged on identical seeds · **Corpus:**
`evidence/2026-11-07/perseed-stageally-confirm2-b/` (16 files) ·
**Prereg:** `evidence/2026-11-07/sim-stageally-confirm2-b-prereg.md`
(committed before any judged sim, 74059c4d) · **Proof:**
`scripts/test-stageally-20261106.js` 45/45 green on this worktree before
the judged run; `scripts/test-stageally-trajdist-20261107.js` 5/5 green
(new trajectory-distance measurement).

**The one-line result, plainly:** the pair is real on current master —
not one seed but two (53006 with 42 pair days and a wave-5 unlock, 53007
with 11 pair days), and the armed leg killed more, survived longer, and
won more turn-based fights than the baseline for the first time in this
lever's history. But the flip rides on the same fragility the trajfrag
run named: the staged legs moved far more between masters than their
baselines did, so this GO is a verdict on current master, not a verdict
that the lever is stable. Read it as "the lever works on this master on
this band" — and the next master may say otherwise again.

## Before / after (identical seeds, 8 + 8)

| Metric | Baseline | Armed | Change |
|---|---|---|---|
| Wave-4+ kills (analyzer, w ≥ 4) | 13 | 20 | +7 |
| Wave-4-only kills (w = 4) | 13 | 15 | +2; wave-5 kills 0 → 5, all on 53006 |
| Wave-4+ fights (all) / TB fights | 93 / 61 | 173 / 70 | far more fights reached armed |
| Ally presence in w4 TB fights | 36.1% (22/61) | 85.7% (60/70) | +49.6 pts — the mechanism, moved hard |
| Party presence in w4 TB fights | 14.8% (9/61) | 75.7% (53/70) | the staged party is in the fight |
| TB survival, fight level (scholar lives) | 23.0% (14/61) | 37.1% (26/70) | BETTER armed — first reversal of the confirm-b shape |
| TB outcomes (won / lost / routed) | 13 / 47 / 1 | 19 / 44 / 7 | |
| Rally fires (ok) | 0 | 60 (60) | rally half fully measured — T1 clear |
| Post-first-blood w4 kills (rate) | 8 / 58 (13.8%) | 14 / 80 (17.5%) | second-killer production, UP |
| Living pair (≥1 day, 2 living w4 killers) | 0 seeds | 2 seeds (53006, 53007) | GO route 1 held |
| Living-pair days | 0 | 53 (42 on 53006, 11 on 53007) | |
| First-killer survival, median (observed exits) | 22d (n=4) | 10.5d (n=6) | still below the 19d bar — see below |
| Party days (≥1 / ≥2 members) | 244 / 30 | 586 / 328 | |
| Invites attempted / accepted / declined / not-offered | — | 52 / 26 / 19 / 7 | 50% accept; 22 questions answered in sittings |
| Pending wave-4 encounters (staged share) | 0 | 8 (8 staged, 100%) | first time the pending hook measured anything |
| Median survival (guard) | 96d | 114.5d | +18.5d — guard holds |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | no win either leg |
| Wave 4 unlocks / faced | 7 / 7 | 7 / 7 | |
| Wave 5 unlocks / faced / kills (seeds) | 0 / 0 / 0 | 1 / 1 / 1 (5 kills on 53006) | the door opened on 53006 |
| Readiness-5-ready days | 0 | 42 | all on 53006 |
| Instrument errors | 0 | 0 | |

Note on the kill count: the analyzer's "wave-4 kills" counts wave ≥ 4, the
same shape as the pilot and the confirm (which had 0 wave-5 kills, so the
distinction was invisible there). The wave-4-only split is given in the
table so the wave-5 kills on 53006 do not inflate the wave-4 read: the
armed leg still leads on wave-4-only kills (15 vs 13) and on
post-first-blood kills (14 vs 8).

## Per-seed table

| Seed | Baseline (days, end, w4+k) | Armed (days, end, w4+k) | Armed rally | Armed invites acc. | Armed party-days ≥2 | Pair days |
|---|---|---|---|---|---|---|
| 53001 | 64, lost, 0 | 106, lost, 1 | 2 | 3 / 4 | 22 | 0 |
| 53002 | 66, lost, 0 | 150, survived, 1 | 10 | 6 / 8 | 95 | 0 |
| 53003 | 116, lost, 2 | 92, lost, 2 | 5 | 1 / 1 | 17 | 0 |
| 53004 | 85, lost, 3 | 88, lost, 1 | 5 | 2 / 5 | 28 | 0 |
| 53005 | 89, lost, 0 | 89, lost, 0 | 0 | 0 / 0 | 0 | 0 |
| 53006 | 125, lost, 3 | 150, survived, 11 (6 w4 + 5 w5) | 16 | 7 / 15 | 83 | 42 |
| 53007 | 103, lost, 1 | 150, survived, 4 | 10 | 3 / 10 | 46 | 11 |
| 53008 | 147, lost, 4 | 123, lost, 0 | 12 | 4 / 9 | 37 | 0 |

Notes on the table: 53005 never reached wave 4 on either leg (maxWave 3
both, standing 70) — one seed never tests the lever at all. 53004 and
53008 went BACKWARDS on kills armed vs baseline (3→1, 4→0) despite
rallies firing and parties formed — the lever's seed-volatility is still
there, it just ran the other way on this master. 53002 survived 150d
armed with 37 wave-4+ fights and only 1 kill (a companion Strike kill on
day 149) — survival without production. The flip is carried by 53006
and, secondarily, 53007; the other six seeds look like the confirm band.

## The mechanism, as measured

**Rally (bankkiller verbatim):** fired 60/60 times when its condition held
(live wave-4+ monster + living ally on the scholar's first turn), 0
failures. THIN T1 (fires < 8) is clear; THIN T2 (ally presence < 40%
with ≥10 fights) is clear at 85.7%. The bankkiller bottleneck — allies
beside the scholar in wave-4 TB fights — moved again, further than ever:
36.1% → 85.7% (this band's baseline was lower than the confirm's 44.1%,
so the staging lift is the largest yet).

**Staging:** 52 invite attempts across the leg, 26 accepted (50%), 19
declined, 7 not-offered. The scholar answered 22 of the villagers'
questions inside the sittings to reach the ask (the answer-then-ask
conduct). Party-days ≥2 rose 30 → 328. The pending hook recorded wave-4
pendings for the first time (8 on the armed leg, all 8 staged — the
scholar waited with a companion at the door every time one appeared; 0
on the baseline, so no comparison exists).

**Kill channel mix (wave-4+ kills):** baseline 13: 11 by the scholar
(`via: player`), 2 by companions, 0 wild. Armed 20: 10 by the scholar, 9
by companions, 1 wild (53007 day 141, an Eater killed with no scholar in
the fight). Companion kills are back — the confirm's zero is gone, and
on 53006 six of eleven kills came from companions. Field fights killed 0
wave-4 monsters on EITHER leg (the untouched control channel, still 0).

## Killer ledger (armed leg, all 20 wave-4+ kills)

| Day | Monster (wave) | Killed by | Via |
|---|---|---|---|
| 68 | Strike (4) | owen_smith (scholar) | player — 53001, first blood |
| 149 | Strike (4) | nadia_khoury | companion — 53002, first blood, last-day kill |
| 67 | Strike (4) | jorge_silva (scholar) | player — 53003, first blood |
| 92 | Congregation (4) | nikos_papadopoulos (scholar) | player — 53003 |
| 64 | Algorithm (4) | mara_vasquez | companion — 53004, first blood |
| 52 | Influencer (4) | adaeze_nwosu | companion — 53006, first blood |
| 70 | Algorithm (4) | adaeze_nwosu (scholar) | player — 53006 |
| 70 | Algorithm (4) | gen_cowc2ja | companion — 53006 |
| 89 | Algorithm (4) | greta_hansen | companion — 53006 |
| 99 | Influencer (4) | gen_k1j6fdz (scholar) | player — 53006 |
| 108 | Editor (5) | gen_k1j6fdz (scholar) | player — 53006, FIRST WAVE-5 KILL |
| 126 | Timeslot (5) | sari_wulandari (scholar) | player — 53006 |
| 141 | Editor (5) | gen_cowc2ja | companion — 53006 |
| 147 | Strike (4) | gen_6httusd (scholar) | player — 53006 |
| 149 | Editor (5) | gen_y8hmuwz | companion — 53006 |
| 149 | Editor (5) | gen_cowc2ja | companion — 53006 |
| 103 | Strike (4) | visjoin_81 | companion — 53007, first blood |
| 130 | Suburb (4) | mara_vasquez (scholar) | player — 53007 |
| 141 | Eater (4) | app_mgpspiv0701 | wild — 53007 |
| 143 | Eater (4) | mara_vasquez (scholar) | player — 53007 |

**The 53006 trajectory (the closest seed — maxSimultaneous 3 @ day 99,
pair snapshot day 89, 42 pair days):** Adaeze killed the Influencer on
day 52 as a companion (scholar HP 2% at the end of a 10-round fight —
the line nearly broke even winning), then became scholar and killed the
Algorithm on day 70, and died the same day (+18d after first blood).
gen_cowc2ja killed the Algorithm day 70 as a companion and went on to 3
kills total (day 70, day 141 Editor, day 149 Editor), alive at the end.
Greta killed the Algorithm day 89 (pair snapshot day) and lived 37 days
after the kill — the longest first-kill survival on the leg after
Adaeze's successor. gen_k1j6fdz killed the Influencer day 99 as scholar
(maxSimultaneous 3 that day: gen_cowc2ja, greta_hansen, gen_k1j6fdz
alive together) and the Editor day 108 — the first wave-5 kill on this
band — then died day 111 (+12d). Sari killed the Timeslot day 126 and
died the next day (+1d). gen_6httusd killed the Strike day 148, died day
149 (+1d). gen_y8hmuwz killed the Editor day 149 as a companion, alive
at the end. Two living veterans at the horizon (gen_cowc2ja,
gen_y8hmuwz); readiness5.veterans peaked at 3. Standing 440 at the end;
wave 5 unlocked by day 98 (raw standing 290, 2 veterans). The village
survived to the horizon and sat on a readiness-5 release it never took —
no seat, no table, no win.

**The 53007 trajectory (the second pair seed — maxSimultaneous 2 @ day
141, pair snapshot day 141, 11 pair days):** visjoin_81 killed the Strike
on day 103 as a companion (first blood), became scholar day 114, died
day 116 (+13d). mara_vasquez killed the Suburb day 130 as scholar and
the Eater day 143, alive at the end. app_mgpspiv0701 killed the Eater
day 141 with no scholar in the fight (wild channel), alive at the end.
Two living veterans at the horizon; the pair formed late (day 141) and
held 11 days to the horizon. No wave-5 unlock (standing 199, one short
of the 200 gate — the door stayed shut by a single point).

**First-killer survival (observed exits only):** armed median 10.5d
(spans 0, 1, 8, 13, 18, 19 across six seeds with killers; 53005 and
53008 had none), baseline median 22d (spans 2, 10, 34, 38; 53007's first
killer censored alive). The 19d bar is still missed on the armed leg,
and the armed median is LOWER than the baseline's — the pair forms here
not because killers live longer but because the second killer arrives
while the first is still alive (53006: kills on days 52, 70, 70, 89, 99
— five kills in 47 days). First-killer survival remains an open blank;
the pair route this run is production speed, not longevity.

**53006 staged reproduces the trajfrag unperturbed leg exactly:** 150d
survived, standing 440, 11 wave-4+ kills, maxWave 5, 2 living veterans
at horizon — identical headline numbers to
`evidence/2026-11-07/sim-trajfrag-b.md`. The re-run is deterministic on
this master; the trajfrag leg was not a fluke of that run's process.

## Trajectory distance (new secondary — attribution for the flip)

`scripts/stageally-trajdist-20261107.js`: per-seed D = |Δ wave-4 kills| +
|Δ standing|/100 + |Δ maxWave| + |Δ survival days|/150 + (pair formed
on exactly one leg ? 1 : 0). Full tables saved at
`/tmp/stageally-confirm2-trajdist-within.json` (baseline↔staged, this
run) and `/tmp/stageally-confirm2-trajdist-across.json` (same seed+policy,
confirm-b corpus ↔ this re-run).

**Within this run (baseline↔staged):** 53006 D=12.577 (kills 8, standing
2.41, wave 1, pair flip 1, 0→42 pair days); 53007 D=4.313 (kills 3, pair
flip 1, 0→11 pair days); 53008 D=4.65 (kills 4, standing 0.49 — armed
went backwards); 53002 D=2.06; 53004 D=2.02; 53001 D=1.77; 53003 D=0.16;
53005 D=0. The armed leg's effect is concentrated on two seeds.

**Across corpora (confirm-b → this re-run, same seed+policy):**
- 53006 staged D=13.65 — the largest distance in the whole comparison
  (kills 9, standing 2.65, wave 1, pair flip 1, 0→42 pair days).
- 53006 baseline D=0.133 — the SMALLEST distance in the whole comparison
  (kills 3→3, standing 199→199, days 105→125). The baseline on the
  flipping seed essentially did not move.
- 53007 staged D=8.737 (kills 4, standing 1.99, wave 1, days 0.747, pair
  flip 1) vs 53007 baseline D=4.423 — staged moved twice its baseline.
- Every other seed moved on at least one leg (median across-corpus D
  ≈ 2.2; 53003 both legs ≈ 4.8, 53005 baseline 3.51, 53002 baseline
  2.26): master movement is real and band-wide, not confined to the
  flipping seeds.

**Attribution (prereg rule applied honestly):** neither clean reading
holds. The prereg's "master movement" reading wanted a large
same-policy distance with a SMALL within-run distance — but the
within-run distance on 53006 is also large (12.577). The "trajectory
fragility" reading wanted a small same-policy distance — but the
same-policy staged distance is the largest measured (13.65). What the
numbers do say: (a) master moved — every seed's trajectory shifted
somewhere between the confirm and this re-run; (b) the staged legs moved
far more than their baselines on the flipping seeds (53006: 13.65 vs
0.133; 53007: 8.74 vs 4.42) — the staged policy's extra RNG draws amplify
small upstream changes, which is exactly the fragility shape trajfrag-b
proved (one extra draw flips 3 of 4 seeds). The flip is master movement
amplified through a fragile staged trajectory. The GO is real on current
master (deterministic — it reproduces trajfrag's numbers exactly), but
the lever's verdict is master-sensitive: the same band, the same bar,
gave NO-GO one master ago and GO now, with no change to the lever
itself. A third band would not settle this; only a less fragile lever
(or a master-stable staging path) would.

## Pooled n=24 (pilot 55001–55008 + confirm 53001–53008 + this re-run 53001–53008)

Same analyzer run over the combined 48-file corpus (`/tmp/stageally-pooled24/`,
pilot and confirm corpora untouched in place; analysis saved at
`/tmp/stageally-pooled24-analysis.json`):

| Metric (pooled) | Baseline | Armed | Change |
|---|---|---|---|
| Wave-4+ kills (w ≥ 4) | 24 | 31 | +7 |
| Ally presence in w4 TB fights | 35.6% | 77.4% | +41.8 pts |
| Post-first-blood w4 kills | 12 | 20 | |
| Living pair (≥1 day, 2 living w4 killers) | 0 seeds | 3 seeds (55007, 53006, 53007) | |
| TB survival, fight level | 20.7% | 25.2% | better armed |
| Median survival | 104d | 110d | +6d — guard holds |
| Wave 5 unlocks / faced / kills (seeds) | 0 / 0 / 0 | 2 / 2 / 2 | 55007 + 53006 |
| Readiness-5-ready days | 0 | 60 | 55007: 18, 53006: 42 |
| Rally fires | 0 | 123 | |

The pooled GO now rests on three seeds, not one — but two of the three
are the same band measured twice on two masters, and the confirm band's
first measurement was a NO-GO. Per the prereg, the pooled numbers are
reported alongside the band verdict, never in place of it: **the band
verdict is GO, and the pooled GO is stronger than the pilot's one-seed
headline but still master-sensitive.**

## Village assessment (plain words)

A village that walks into the fourth wave with friends beside it finally
killed more than it did alone — on this master, on this band. The friends
showed up (86 of every 100 wave-4 fights had an ally in them, three
quarters had a party member), the rally fired sixty times without a miss,
and the kills came from everywhere: the scholar, the companions, even a
villager fighting wild with no scholar in the fight at all. On 53006 the
village did what the whole chain asks for: a first killer, a second
killer while the first still lived, a third, then the door to the fifth
wave opened and five of those monsters died too — and the village was
still standing at day 150 with two living veterans and a seat it never
took. That is the first time this lever's chain has run end to end. But
the same band said the opposite one master ago, with the same lever, and
the flip lives in the two seeds that moved most — so the honest read is
that the lever works when the trajectory catches, and the trajectory is
still a coin the master flips. The next blank is not company any more.
It is why killers still die young (the first killer lived a median of
ten days after first blood, worse than the baseline's twenty-two) and
why a village can hold two living veterans for forty-two days and still
never sit down at the table.

## Sense-test read (armed leg, seeds 53006 / 53007)

**One wave-4 fight — day 52, the Influencer, first blood (53006).** The
rally line reads like a person taking charge, not a button: *"You plant
your feet and ROAR the line back together — 'ON ME! ON ME!' Fear drains
out of their faces. 'THE INFLUENCER — TOGETHER!' They turn as one."* It
fired twice that day (a Reunion rally and the Influencer rally), and the
Influencer fight was won in 10 rounds with Adaeze in the party — but the
scholar ended at 2% HP. The fiction coheres: a called-together line, a
kill with a friend standing in it, a win that nearly cost the scholar
everything. The same day's death lines show the cost of the win
elsewhere: Olivia screams, the Reunion freezes, the dead gather — the
fight reads as desperate, not clean. It reads as the game working as
designed — and then Adaeze, the killer, died eighteen days later, which
is also the game working as designed.

**One party invite — day 39, Adaeze (53006).** *"🤝 Adaeze joins your
party. '...Fine. This had better be worth it.'"* Day 52, Lena: *"'I'd
love to. Lead the way.' (They're already checking your pack.)"* Day 79,
Leo: *"'Alright. But I'm not carrying your stuff.'"* Day 143, Larissa:
*"'Someone should watch your back. Might as well be me.'"* Day 150,
Brian: *"'Okay. Yeah. I trust you.'"* Each reads as a person with
character saying yes — reluctant, eager, practical, wary. The problem is
still the pool, not any one line: the SAME sentences recur verbatim
across different people and different seeds — "...Fine. This had better
be worth it." three times on 53006 alone (Adaeze, Ella, Miguel),
"Alright. But I'm not carrying your stuff." twice on 53007 (Elena,
Vadim). Five accept lines, shared by everyone. A player meeting two
villagers who say the identical sentence will hear the menu, not the
person. Third sighting of the backlog item (confirm-b; this re-run).

**Fiction findings (backlog, not this arm's business):**
- The System announces "a veteran kill" for kills that are not wave-4
  kills — reproducing the pilot's and the confirm's finding, third
  sighting. 53006: day 28 "Brian just put down The Redactor", day 39
  "Sari just put down The Terms of Service", day 41 "Shaker just put
  down Big Ugly", day 86 "Liam just put down The Big Beast", day 88
  "Liam just put down Big Ugly", day 89 "Greta just put down The Ugly
  Beast", day 97 "Leo just put down The Big Beast" — all announced as
  veteran kills on camera; the day-52 Influencer and day-70 Algorithm
  kills (real wave-4 kills) got the line too, so the announcement fires
  for both and cannot be read as a wave-4 signal.
- The trust-too-low refusal floods the transcript: days 1–2 on every
  seed, the line *"Ask someone who trusts you. (Trust too low.)"* repeats
  10+ times in a day, identical, from unnamed villagers. Log noise, not
  a fiction break, same as the confirm's note.
- The fightLines capture regex matches "together" in "lingered over the
  fire together", so the instrument's fightLines are mostly fireside
  noise; the rally lines above were pulled by filtering for "ON ME"
  directly. Instrument note for the next run, not a game finding.

## Metric review

Pre-registered metrics bind this run (prereg 74059c4d). Primary: GO iff
armed leg banks a living pair (≥1 day with 2 living wave-4 killers) on
≥1 seed, OR post-first-blood wave-4 kills ≥3 on the armed leg. BOTH
held: pair seeds 2/8 (53006, 53007); post-blood kills 14. Guards:
median survival armed 114.5d vs baseline 96d — not worse by more than
10d; it is better by 18.5d. THIN checks run BEFORE GO/NO-GO: T1 rally
fires 60 ≥ 8 (clear); T2 ally presence 85.7% ≥ 40% with 70 fights
(clear). Verdict GO per the preregged rule.
- No metric was swapped, re-cut, or re-thresholded after the run. The
  Stage-0 smoke (53001–53002, 60d, /tmp) is the same two seeds in the
  judged band — the smoke was unjudged Stage-0 verification, and the
  judged legs re-ran them from scratch with the frozen policy. The smoke
  engaged without re-baselining (53001: invites 3/3 accepted, rally 0 in
  60d, partyDays2 16; 53002: invites 2/2, partyDays2 19, gate still
  closed at 60d — standing 75, wave 3 — which is the gate working as
  designed, not a failure).
- The pooled n=24 analysis is reported above alongside the band verdict,
  per the prereg; it does not change the verdict. The pooled GO now
  rests on three seeds, two of which are the same band on two masters.
- Instrument notes: `pendingW4` = 8 on the armed leg, all 8 staged
  (share 1.0) — the first measurement of the pending channel; 0 on the
  baseline, so no comparison exists. The `tbFights` rows carry the
  fight-level TB survival (37.1% armed); the old day-join secondary is
  retained under `tbSurvivalDayJoin` and is NOT cited.
- The trajectory-distance composite did its job as an attribution
  instrument: it showed the flip is master movement amplified through a
  fragile staged trajectory (see the attribution section). Its weakness:
  the composite mixes scales (kills dominate; standing/100 and days/150
  are small next to a 9-kill swing), so a seed can look "far" on kills
  alone. The components are reported alongside the composite for that
  reason, and the next run should read the kill component first.
- What the reversal shows, honestly: the same band, the same bar, the
  same lever — NO-GO on the November 6 master, GO on the November 7
  master, with no change to the lever itself. The lever's verdict is
  master-sensitive. That does not make this GO wrong (it is deterministic
  on this master and reproduces the trajfrag leg exactly), but it does
  mean a GO on one master is not a confirmation in the usual sense — the
  confirmation question has moved from "does it work on a fresh band" to
  "does it survive the next master".

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js`: `--help` refuses with the pilot's error
  (`Error: --out <panel-directory> required`). The `--out` form was not
  run: it runs its own full panel (default 16 seeds × 4 policies × 150d,
  policies capable/risk-aware/socialite/winseek) and takes no corpus
  input, so it cannot compare competent vs stageally on identical seeds.
  No Game-root change exists in this arm (policy A/B on identical seeds
  is the comparison), so no compare `.md` is fabricated — same outcome as
  the pilot and the confirm. The matched-seed paired comparison is the
  analyzer output above (identical seeds, both legs, same instrument).
- `scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-07/perseed-stageally-confirm2-b/*.json' --metrics
  national,table,wins,exiled`: REFUSED — "refusing recorder-corpus
  input: all 16 --current rows carry top-level anchorCommit, so they are
  sweep recorder rows, not runs." Recorded as the result, same as every
  prior killer-chain arm. No telemetry deviation check was possible on
  this corpus; the wall numbers above are the instrument's own. The
  WINSEAT baseline regime note was checked first: no pre-seat comparison
  is claimed anywhere here.

## What this arm does NOT claim

- Not a "pair solved" headline: the primary is a living-pair day OR
  post-first-blood production; a re-run GO earns trust in the pilot GO on
  this master, not a stability claim — the same band NO-GOed one master
  ago.
- Not a win: 0 wins either leg; no table, no national, no seat taken —
  53006 held two living veterans for 42 days and never sat.
- Not first-killer survival fixed: median 10.5d armed vs the 19d bar,
  and worse than this run's baseline (22d); the pair formed through
  production speed, not longevity.
- Not a field-fight fix: field fights killed 0 wave-4 monsters on both
  legs; every armed kill came from a turn-based fight or the wild
  channel.
- Not a rally failure: rally fired 60/60 when its condition held. The
  rally works; on this master the fight after it works too, on two
  seeds.
- Not a staging failure: invites 52, accepted 26 (50%), party-days ≥2
  30 → 328. The party forms; on this master the party kills.
- The Stage-0 smoke and the proof legs are not evidence; only the judged
  8+8 legs above are.

## Next blanks (for the loop, not this arm)

1. **First-killer survival, now the binding blank** — armed median 10.5d
   vs the 19d bar, worse than baseline. The pair forms when the second
   killer arrives fast, not when the first lives long. The rest-killer
   lever was killed at pilot; retreat-and-refind is policy-only and
   unconfirmed; killersurvive-b (Loop A, 0221Z) is the live arm on this
   question.
2. **Why 53004 and 53008 went backwards armed** (3→1, 4→0) while 53006
   went 3→11 — the lever's seed-volatility is unchanged; the flip is a
   two-seed story on an eight-seed band.
3. **The seat never taken** — 53006 held two living veterans for 42
   days, readiness-5-ready the whole time, and never sat. The
   readiness-5 release → wave-5 facing → full seat links after the pair
   are the next measurement, not this arm's.
4. **Verdict stability across masters** — the confirm question has moved:
   the lever now needs a master-stability read (same band, next master)
   or a less fragile staging path, not a third fresh band.
5. **Pending encounters** — 8 wave-4 pendings on the armed leg, all
   staged; the "wait for a companion at the door" question is measurable
   now (the NO WAIT finding is overtaken on this band — the hook saw
   pendings and the policy staged all of them).

## Proof and commits

- Proof `scripts/test-stageally-20261106.js`: 45/45 green on this
  worktree before the judged run (fixtures + live legs; the live-invite
  leg asserts engagement, not acceptance). No proof change was needed —
  the 55002/60d smoke baseline still engages.
- Proof `scripts/test-stageally-trajdist-20261107.js`: 5/5 green on this
  worktree before the judged run (fixture rows, known distances).
- Prereg committed 74059c4d before any judged sim. The safe-commit index
  clobber hit on that commit (files shown staged-as-deleted after a
  correct commit); repaired with HEAD-blob cacheinfo, verified `git
  status` empty + `git diff HEAD` empty + hash-object matches.
- Judged corpus: `evidence/2026-11-07/perseed-stageally-confirm2-b/` (16
  files, 8 baseline + 8 staged), all with 0 instrument errors. Analyzer
  output (band + pooled) saved at `/tmp/stageally-confirm2-analysis.json`
  and `/tmp/stageally-pooled24-analysis.json`; trajectory-distance
  tables at `/tmp/stageally-confirm2-trajdist-within.json` and
  `/tmp/stageally-confirm2-trajdist-across.json` (working copies; the
  evidence file above is the record).
- Stage-0 smoke: 53001–53002 staged 60d to /tmp (invites 3/3 and 2/2
  accepted, partyDays2 16 and 19, 0 errors) — unjudged, not evidence.

## Convergence

**scale-onramp: converging, NOT converged.** The stageally GO is
CONFIRMED on this band on current master — by both routes, on two seeds,
with the mechanism at its strongest yet (ally presence 36% → 86%, TB
survival 23% → 37%, post-blood kills 8 → 14, wave-5 unlocked and faced
and killed) — but the confirmation is master-sensitive: the same band
NO-GOed one master ago with no change to the lever, and the flip rides
on trajectory fragility the trajfrag run proved. The binding constraint
has moved one link down the chain: the pair can form and wave 5 can be
faced, but the first killer still dies young (median 10.5d) and a village
holding two living veterans for 42 days still never sits at the table.
Next run: first-killer survival, or the release-to-seat link — a loop
call.
