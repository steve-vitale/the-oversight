# sim-wildavoid-confirm-a — confirm the landed wildavoid fix on a fresh band

**Arm:** sim-wildavoid-confirm-a, Loop A run fleshout-20261118T1415Z, axis scale-onramp.
**Branch:** `sim-wildavoid-confirm-a`, base master at the coordinator's registration; the
branch contains the landed fix 95ba293f2 (sim-wildavoid-rejudge-a).
**Verdict: NO-GO** (prereg: GO iff B1&&B2&&B3&&B4&&B5&&C1&&C2&&C3&&panel clean;
B2, B4, and C3 fail. B1, B3, B5, C1, C2 pass; the panel returns review_required
with no `regression_signal`, so the panel bar passes.)
**Prereg:** `evidence/2026-11-18/sim-wildavoid-confirm-a-prereg.md` (frozen before the sweep).
**Band:** 104431–104446, 16 seeds, 150d death-aware, policy competent verbatim,
substrate VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1, SEEKGATE unset, FIGHTALLY2 unset.
Two legs on identical seeds: MODE=ctl (WILDAVOID unset) vs MODE=arm (WILDAVOID=1).
**Corpora:** `evidence/2026-11-18/perseed-wildavoid-confirm-a-ctl/` (16 files) and
`perseed-wildavoid-confirm-a-arm/` (16 files); analysis `wildavoid-confirm-a-analysis.json`;
panels `wildavoid-confirm-a-panel-before.json.gz` / `-after.json.gz`, compare
`wildavoid-confirm-a-panel.md` (decision: review_required, no `regression_signal`).
**Confirm-only arm: NO src/js changes.** The fix under test is 95ba293f2, unchanged.

## The lever, in plain words

When villagers meet a wave-4-or-worse beast out in the world with too small
or too poorly geared a party (fewer than 3, or anyone unarmed or unarmored),
they step aside instead of fighting — one spoken line ("sees the beast and
gives it room — not ready alone, going back for help"), the beast stays in
the world, and nobody's plan is touched. Full geared parties of three or four
fight exactly as before. Raids at the haven door are exempt (defending home
is not optional), and a villager resting after a flee is left alone. This arm
only re-measures the landed lever on a fresh 16-seed band; it changes nothing.

## Before / after on identical seeds

| Measure | Control | Arm | Bar | Result |
| --- | --- | --- | --- | --- |
| Wild wave-4+ meetings | 320 (world-tick 215, aid 105, patrol 0) | 274 (world-tick 189, aid 85, patrol 0) | — | — |
| Meetings the gate would have avoided (ctl) / avoided (arm) | 45, all by the outmatched rule | 67 (world-tick 50, aid 17; wave-4: 58, wave-5: 9) | arm ≥ 50% of ctl (B1) | **PASS** (ratio 1.49) |
| Wave-4 launch events / instances | 42 / 42 | 32 / 32 | ≥ 90% of ctl (B2) | **FAIL** (76%) |
| Wild wave-4+ deaths | 29 | 24 | arm ≤ ctl (B3) | **PASS** |
| Wild flee damage (villager damage taken on flees) | 9,410 | 8,693 | arm ≤ ctl (B3) | **PASS** |
| Outmatched Suburb deaths (arm) | — | 0 | arm == 0 (B4a) | **PASS** |
| Outmatched Suburb meetings fought (arm) | — | 1 (seed 104441, day 149) | 0 (B4b) | **FAIL** |
| Wild Suburb deaths, all parties | 2 | 1 | context (orig. B4) | — |
| Trick-known seeds | 7 | 6 | context | — |
| Instrument (B5) | 16/16 files, 0 errors, D3 120/120 = 1.0 | 16/16 files, 0 errors, D3 114/114 = 1.0 | see B5 | **PASS** |
| Median survival (C1) | 151 | 149.5 (ratio 0.99) | arm ≥ 0.90 × ctl | **PASS** |
| Starvation deaths (C2) | 4 | 4 | arm ≤ ctl | **PASS** |
| Community loss (C3) | 6 | 8 | arm ≤ ctl + 1 | **FAIL** |
| Panel (§15) | review_required, two `regression_watch` lines, investigated below | — | no `regression_signal` | **PASS** |

Per-seed wild deaths (ctl → arm): 104431: 1→1, 104432: 3→3, 104433: 2→0,
104434: 0→0, 104435: 1→3, 104436: 0→0, 104437: 1→1, 104438: 3→2, 104439: 0→0,
104440: 4→3, 104441: 3→3, 104442: 1→1, 104443: 5→2, 104444: 1→1, 104445: 4→4,
104446: 0→0. Per-seed wild flee damage (ctl → arm): 449→449, 414→351,
1089→828, 204→204, 501→636, 0→0, 190→190, 1469→1450, 53→53, 753→676,
824→746, 865→865, 1476→1122, 389→389, 734→734, 0→0. Total deaths all causes:
1381 → 1340. Wild wave-4+ kills: 24 → 23. Avoids with foreign help at the
door: 0. Avoid snapshot mismatches: 0. `winPlanStats.wildAvoids` == recorded
avoids (67 == 67); 'gives it room' say lines == avoids (67 on arm, 0 on ctl).

## Why B2 fails — the avoid eats the flee-seed (a real second-order cost)

Launch loss is concentrated on the two launch-richest control seeds:
104433 (6 → 3 wave-4 launches) and 104443 (13 → 6). The other fourteen seeds
stage 0–2 launches each and are unchanged or equal. The mechanism is the
flee-seed channel the pilot prereg's scope decision 2 named but did not price:
VETREENGAGE seeds a re-engagement plan only on a `vFlee` outcome
(`winPlanSeedFromFight(vid, mdef, 'fled')` in `resolveWildMonsterEncounter`).
An avoided meeting is never a flee, so it never seeds a plan — and the plan
is what later launches. Band-wide, the seed pool shrank: world-tick `fled`
plan-seeds 141 → 124 (−12%), total `v4seeds` 435 → 403 (−7%), wild `vFlee`
meetings 261 → 229 (−12%), while avoids ran 67. The two losing seeds show it
concretely:

- **104433:** the control's three wave-4 launches are audit launches
  (days 117, 121, 121), downstream of an audit plan seeded by a wild audit
  flee on day 86 (`winPlanSeedFromFight`, world-tick, stageAfter `party`).
  On the arm leg that day-86 audit meeting never happens — the trajectory
  diverged on day 71 (first avoid day 68) — and no audit plan ever forms.
  The arm's 34 avoids on this seed are 27 Suburb + 7 eulogy repeats, not
  audit meetings; the village spent its wild-meeting budget dodging the
  same two beasts.
- **104443:** the control's 13 wave-4 launches come from eater/influencer/
  cancellation plans seeded by wild flees on days 81, 95, 101, 110. The arm
  keeps the day-81 eater and day-95 influencer seeds (identical through day
  98) and launches once on the influencer plan (day 97), then the follow-on
  launches stop: the day-110 audit flee-seed never happens (first divergence
  day 99), and the cancellation chain launches once (day 122) instead of
  four times.

This is not symmetric noise: no seed gained a launch, the seed pool fell
band-wide, and the loss sits exactly on the seeds where launches existed to
lose. The lever banks the wild-death price (B3 passes) but taxes the launch
funnel that the scale wall depends on. The fix direction is a design
decision, not a tuning tweak: let a wild avoid seed a re-engagement plan
the way a flee does (the pilot prereg explicitly deferred this as "a design
question for a later arm"), or accept the launch tax as the price of the
avoid. Either way the next arm owns it — this confirm does not re-tune.

## Why B4 fails — one raid-exempt meeting, not a lever miss

The single flagged meeting: seed 104441, day 149, Nadia alone vs the Suburb,
outcome `vKill`, 0 rounds, 0 damage taken. The analyzer counts it as an
outmatched Suburb meeting fought. It is not a case of the rule failing to
fire — it is a case the rule is scoped not to cover, and the analyzer cannot
see that:

- **It was a raid.** A deterministic replay probe of seed 104441 (arm leg,
  `/tmp/wildavoid-confirm-probe-104441.js`; replay verified against the
  corpus: 5 avoids, survived to horizon) logs the meeting as
  `resolveWildMonsterEncounter` with `opts: {"raid": true}` — defence at the
  haven door, where the avoid is exempt by design. The probe's
  `winPlanOutmatched` calls on the non-raid Suburb meetings all correctly
  returned null (matched trios). The corpus encounter rows carry no raid
  flag, so the analyzer's B4 cannot distinguish this meeting from a miss.
- **It was harmless.** The beast had 1 HP left (mHpStartRec 1) — the same
  Suburb the trio had chipped from 534 to 515 HP across days 140–141 — and
  Nadia's opening ranged volley killed it before any round ran
  ("it takes The Loud Beast for 18 (0 left)"). No villager was ever in danger.
- **The other Suburb death is matched and identical.** Seed 104445, day 103,
  aid origin: same day, same outcome `vDie`, same damage taken 30, same
  party of three armed+armored villagers, trick known, on both legs; the
  seed staged 0 avoids on either leg, so the death is pre-avoid by
  construction and the trajectories are identical. Per the re-judge's
  verification rule it does not fail B4 re-scoped.

Substance: 0 outmatched-Suburb deaths, and the one outmatched Suburb meeting
fought was a raid-exempt 1-HP kill. Letter: B4 as frozen counts it, so B4
fails and the verdict is NO-GO. The next arm should record `opts.raid` on
encounter rows and re-scope B4 to non-raid meetings — an instrument fix,
not a lever change.

## Why C3 fails — three famine scatterings

Community loss 6 → 8: the arm lost villages 104435, 104440, and 104443, and
saved 104438 (lost on control day 143, survived on arm to day 151). All
three arm-only losses are famine scatterings, not extinctions: each ended
with `endPantryKcal` 0 and a living roster on the last daily row (3, 4, and 7
alive), which is the scattering signature — the pantry sat empty for the
famine limit and people walked away (`game.js`, "Haven couldn't hold").
Total end-of-run pantry across the band fell 48,470 → 33,607 kcal (−31%).

- **104440 (survived → lost day 87):** a 2-person village at day 82. The
  control leg's day-82 eater meeting killed a villager; the arm avoided it,
  then two villagers died in combat on day 83, and the village scattered
  five days after its first avoid. A knife-edge seed on either leg — but the
  arm's avoided eater left no carcass/meat where the control's fought eater
  did, and the pantry never recovered.
- **104443 (survived day 147 → lost day 124):** the launch collapse above
  (13 → 6 launches) removed the expedition food pipeline while Zoltan spent
  days 98–122 dodging the same congregation ten times. Deaths pile up from
  day 110 (villager combat, arena, expedition) and the village scatters
  with 7 people still alive and standing 495 (control: 595).
- **104435 (survived → lost day 149):** wild deaths actually rose here
  (1 → 3): a herald kill on day 134, an eater death on day 135 (52 taken),
  then a stranger death (day 145) and a wild death (day 146) as the village
  thinned; three eater avoids on days 147–148 came too late.

The launch tax (B2) and the meat-foregone channel plausibly feed the pantry
shortfall — fewer launched hunts, fewer killed beasts, less food in — but
the food accounting itself is not instrumented in this corpus, so that link
is the named hypothesis, not a measurement. What is measured: the arm ends
poorer and scatters more. C2 (starvation deaths 4 → 4) passes only because
scattering kills no one on the death log — people walk away instead of
starving, so the starvation-death bar cannot see a famine loss. A future
cost bar should count scatterings, not just starvation deaths.

## Panel compare (the instrument; the prereg is the judge)

`balance-panel.js compare` on the 16 paired seeds: **review_required**, with
two `regression_watch` lines, investigated here, not waived. No
`regression_signal`, so the panel bar passes.

- **Village deaths per 100 calendar days: 63.53 → 65.10** (paired delta
  +1.58, 95% interval −1.26 to +5.88, includes 0). Absolute deaths per run
  *fell* (86.31 → 83.75). The rate rises only because the arm's runs total
  fewer days (three famine scatterings cut runs short). A denominator
  effect, not more dying — the same shape as the pilot's 104416 line.
- **Community loss: 0.375 → 0.5** (paired delta +0.125, interval −0.125 to
  +0.375, includes 0). This is the C3 story in panel form: three arm-only
  famine losses against one save. The interval touches 0, but the mechanism
  (scattering, pantry 0) is read from the corpora, not inferred from the
  interval.

All other panel metrics: no material signal (wins 0/0, national scale access
0/0 on the panel's read, survival through day 30 and day 60: 1.0 both).

## Reachability verdict

The content in this arm's area is reachable: wave-4 meetings happened on
15 of 16 seeds on both legs (320 wild meetings on control), wave-5 on 8–9
seeds, launches fired 42 times on control and 32 on arm. The avoid itself
fired 67 times on the arm leg across 9 of 16 seeds (seeds 104431, 104434,
104436, 104437, 104439, 104442, 104446 had no avoid: their wild meetings
were all matched parties). No seed was avoid-free because the lever was
broken — the proof test fires it live on every staged shape, and the arm
corpus shows it firing on world-tick and aid meetings, wave 4 and wave 5,
solos, duos, and 27 Suburb meetings on one seed.

## Wall numbers (both legs)

National standing (≥200): 8/16 → 9/16. National rank: 0/16 → 0/16. Table: 0.
Wins: 0. Wave-4 unlocked: 16/16 both. Wave-5 unlocked: 8/16 → 9/16. Median
survival: 151 → 149.5 days. The lever moves wild-meeting survival, not the
wall — and on this band it costs launches and pantry while doing so. The
wall is still the standing-to-rank transition: villages reach 200+ standing
on half the band and none convert to national rank.

## Village assessment, in plain words

The avoid does what it promises on the wild slice: villagers stopped walking
alone into fights they could not win, wild deaths fell by a sixth (29 to 24),
flee damage fell by about a twelfth (9,410 to 8,693), and nobody starved to
death more than before. But the confirm band is where the pilot's blind spots
bite. First, the avoid quietly eats the village's future hunts: a fight you
walk away from is a fight you never flee from, and only flees teach the
village where to go back — so the two villages that hunted most lost a
quarter of their launches. Second, the villages end up poorer: three of them
ran out of food entirely and scattered with people still alive, which the
death log never sees as starvation. Third, the same villager keeps meeting
the same beast and saying the same line — Zoltan dodged the same congregation
ten times in 25 days, Siya stepped aside from the Suburb 27 times on one
seed — and nobody ever actually goes for help. The lever is a real
improvement to a single meeting and a real tax on everything downstream of
meetings. It does not stand confirmed as landed.

## Sense-testing notes (read the transcripts, not just the counts)

Avoided meetings (read 2+):

1. **The repeat, worse than the pilot.** Zoltan meets the same congregation
   ("Big-Eyes") ten times in 25 days (seed 104443, days 98–122, three times
   on day 121 alone) and says the identical line every time: "Zoltan sees
   Big-Eyes and gives it room — not ready alone, going back for help."
   Siya does it 27 times to the Suburb on seed 104433 (days 93–97 alone
   hold five). The avoid leaves the beast in the world and the same
   outmatched villager keeps walking into it — by design, but the transcript
   reads like a loop, not a person learning. The pilot's six-in-eight-days
   repeat is now ten-in-twenty-five and twenty-seven on one seed.
2. **The unkept promise, unchanged.** The line says "going back for help" —
   and nothing ever happens. No plan is seeded, no party ever forms around
   the avoided beast. On 104443 Zoltan "goes back for help" ten times and
   the congregation is still there on day 122, still alone with him.

Fought meetings (read 2+):

3. **A grinding death that reads like people (seed 104435, days 133–135).**
   Lehlohonolo meets the same eater three days running: flees at 16 HP left
   after binding a wound mid-fight, flees at 8 HP the next day, dies on day
   135 to a 31-damage Gorge with 2 HP left — while Sigrun kills a herald
   beside him and Rebecca answers his shouts for help. Field medicine,
   called help, a villager past holding who runs "while running still
   works" — coherent, consequential, and tragic. The fight system reads
   like people under pressure.
4. **The trick-known leave still costs a hit (seed 104441, days 140–141).**
   The trio meets the Suburb four times in two days, knows the leave-trick
   throughout (`trickBefore` true, `fleeWise` true), reads the streets and
   walks out every time — and still takes 12, 14, 5, then 15 damage, Nino
   down to 4 HP. The re-judge's correction to the pilot's "pre-learning
   mauling" story holds on the fresh band: knowing how to leave the Suburb
   does not make leaving free.
5. **Small fiction bug (finding):** "Lehlohonolo has Sling but no arrows —
   the string stays drawn, useless." A sling does not use arrows. The
   no-ammo line fires for ranged weapons that take no ammunition. Worth a
   one-line fix in a later arm, not this one.

## Proof and instrument checks

- **Proof test** `scripts/test-wildavoid-a.js`: 90/91 assertions pass. The
  one failure is §5 ("src changes are exactly game.js + win-plan.js (got
  [])") — an instrument artifact, not a code failure: the test diffs
  `git merge-base HEAD master` → HEAD, and master now contains the landed
  fix (95ba293f2), so the base already holds the src changes and the diff is
  empty. Verified directly instead: the build commit 5402d4cc3 changed
  exactly `src/js/game.js` + `src/js/win-plan.js`, nothing else. All 90
  live/analyzer assertions pass (both routers, helper-vs-gate agreement,
  raid exemption, post-flee-rest precedence, analyzer selftest).
- **Confirm analyzer selftest** `scripts/analyze-wildavoid-confirm-a.js
  --selftest`: SELFTEST ALL PASS (includes the re-scoped-B4 cases — a
  matched-party Suburb death passes, an outmatched fought Suburb meeting
  fails — and the C1–C3 cost-bar cases).
- **D1 repeatability:** seed 104431, 60d, arm, run twice — outputs identical
  except the `file` path. **PASS.**
- **D2 wrap neutrality:** same seed/days, recorder ON vs OFF — all 58 daily
  fingerprints identical (recorder-off run records 0 encounters, as
  expected — the recorder is off — but the game state is untouched). **PASS.**
- **D3 (in-analyzer):** replica-vs-live-gate agreement 1.0 on both legs
  (ctl 120/120, arm 114/114, n ≥ 5). **PASS.**
- **B5 cross-checks:** 0 unclassified rows both legs; every arm avoid row's
  snapshot classifies outmatched (0 mismatches); `winPlanStats.wildAvoids`
  == recorded avoids (67 == 67); 'gives it room' say lines == avoids (67
  on arm, 0 on ctl); trajectory control passes on all 16 seeds (first
  divergence day ≥ first avoid day, or identical with no avoid).
- **Smoke:** 1-seed 30d arm run clean (0 errors) but wave 4 had not unlocked
  by day 31 (maxWave 3), so no avoids — same as the pilot. Per the prereg
  the smoke was extended by the judged sweep itself: the first 8 seeds of
  both legs were run and inspected before the remaining 8 (ctl 209
  encounters / 0 errors; arm 191 encounters / 50 avoids / 0 errors — no
  gross instrument failure), then the band was completed.
- **B4 probe:** deterministic replay of seed 104441 (arm leg) with a probe
  wrapping `resolveWildMonsterEncounter` / `winPlanOutmatched` /
  `fieldFight` reproduces the corpus exactly (5 avoids, survived to
  horizon) and logs the day-149 meeting as `opts: {"raid": true}` with the
  beast at 1 HP — the raid exemption, not a lever miss. Probe script at
  `/tmp/wildavoid-confirm-probe-104441.js` (diagnostic only, not committed).
- No `check.js` run in this arm (no src/ change; the coordinator runs the
  gate at merge).

## Blanks

- No patrol wild meetings on either leg (0/320 ctl, 0/274 arm) — the patrol
  half of the lever is built and proof-tested live, but unmeasured in the
  wild on this band, exactly as the census and pilot bands showed.
- The veteran-guard half of the gate fired nowhere — unmeasured, as scoped;
  it needs a table-stage veteran first.
- Foreign aid allies are not counted in the avoid's party (no gear read
  exists for them); the watch (`helpAtDoor`) recorded 0 avoids with
  foreign faces at the door, so the question stayed moot on this band.
- The B1 ratio is 1.49 (67 arm avoids vs 45 ctl would-avoids): after the
  first avoid bends a trajectory, the arm meets meetings the control never
  had — the avoids are not a subset of the control's would-avoids. B1 as
  written (≥50%) passes; the ratio is reported, not hidden. The repeat
  structure drives it: 53 of the 67 avoids are repeats on three seeds
  (104433: 34, 104443: 10, 104438: 9).

## Metric review

- B2's 90% bar caught a real cost the pilot band could not see (30/30 on
  8 seeds, no launches to lose on most seeds). On a launch-rich band the
  avoid taxes the launch funnel through the flee-seed channel. The bar
  worked as designed; the lever, not the bar, is what needs the next arm.
- B4 re-scoped as frozen still cannot see raids: the corpus records no
  `opts.raid` on encounter rows, so a raid-exempt meeting counts as a
  fought outmatched meeting. The next arm should record raid-ness and
  re-scope B4 to non-raid meetings before judging the lever on it again.
  The substance (0 outmatched-Suburb deaths; the one fought meeting a
  raid-exempt 1-HP kill) would have passed a raid-aware B4.
- C2 (starvation deaths) cannot see famine: villages that scatter lose no
  one to starvation on the death log. C3 caught the loss, but only through
  the panel's community-loss read and the end-pantry check. A future cost
  bar should count scatterings directly (endReason village-lost with a
  living roster, or endPantryKcal 0).
- C3's +1 allowance was too tight for a 16-seed band with a real
  second-order cost (6 → 8), but the bar did its job: it flagged a real
  effect rather than passing on noise. No widening is proposed — the lever
  should get cheaper, not the bar looser.
- The proof test's §5 branch-confinement check goes stale once the fix
  lands on master (merge-base contains the change). A confirm re-run should
  either pin the base to the build commit or drop §5 to the direct
  `git show` check used here.

## Next arm (named, for the coordinator)

**sim-wildavoid-seedplan-a** — let a wild avoid seed a re-engagement plan
the way a flee does (or count the avoid as a flee-seed for VETREENGAGE),
preregistered against B2 on a fresh band: the launch tax is the binding
failure, and the pilot prereg already named this as the deferred design
question. Second, in the same arm or a sibling: record `opts.raid` on
encounter rows and re-scope B4 to non-raid meetings (instrument fix), and
put a memory/cooldown on the repeat avoid so one villager does not say the
same line to the same beast 27 times (the 104433 Siya case) — or make the
"going back for help" line true by actually seeking help. Do NOT re-tune
the outmatched thresholds to chase a pass; the failures are structural
(flee-seed channel, raid-blind instrument, repeat loop), not threshold noise.

## Files

- Prereg: `evidence/2026-11-18/sim-wildavoid-confirm-a-prereg.md` (frozen before the sweep).
- This evidence file: `evidence/2026-11-18/sim-wildavoid-confirm-a.md`.
- Confirm analyzer: `scripts/analyze-wildavoid-confirm-a.js` (pilot analyzer
  copy: frozen seeds 104431–104446, expected files 16, B4 re-scoped, cost
  bars C1–C3, selftest extended; --selftest ALL PASS).
- Corpora: `evidence/2026-11-18/perseed-wildavoid-confirm-a-ctl/` and
  `perseed-wildavoid-confirm-a-arm/` (16 files each).
- Analysis: `evidence/2026-11-18/wildavoid-confirm-a-analysis.json`.
- Panels: `evidence/2026-11-18/wildavoid-confirm-a-panel-before.json.gz` /
  `-after.json.gz`, compare `wildavoid-confirm-a-panel.md`.
- No src/ changes. Proof test `scripts/test-wildavoid-a.js` re-run 90/91
  (§5 artifact documented above, confinement verified directly from the
  build commit).
