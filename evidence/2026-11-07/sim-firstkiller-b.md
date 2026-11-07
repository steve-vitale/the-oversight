# sim-firstkiller-b — what kills first killers, and where — DIAG-GO

**Arm:** sim-firstkiller-b (run fleshout-loop-b-20261107T0530Z, Loop B, axis
scale-onramp / winnability chain, tracker 0420Z blank 4: first-killer
survival).
**Diagnosis only, zero src/js, no gate/price/deed/readyDemand change, no
lever built.** Loop A ran sim-nextfight-a (0515Z) on the NEXT-FIGHT
SURVIVAL lever: the one-shot VETERAN'S EDGE pilot NO-GOed (median
kill→death 9d < 14d bar; TB-fight share of deaths 87.5% ≥ 50% bar) and
the build was reverted per the kill rule. This arm is classification
only and does not touch its files.
**Verdict: DIAG-GO** — coverage 1.0 (10/10 first-killer deaths classified
with quoted death records) and one channel holds 70% of classified
deaths: the turn-based fight.
**Band:** 53001–53008 DELIBERATELY REUSED (third measurement of this
band: confirm-b, confirm2-b, now this arm — reuse documented, not
hidden) · **Horizon:** 150d death-aware · **Legs:** competent-verbatim
baseline vs staged (`scripts/policies/competent-stageally-a.js`,
unmodified) on identical seeds · **Corpus:**
`evidence/2026-11-07/perseed-firstkiller-b/` (16 files, 0 instrument
errors) · **Prereg:** `evidence/2026-11-07/sim-firstkiller-b-prereg.md`
(committed 21191cc40 before any judged sim) · **Proof:**
`scripts/test-firstkiller-20261107.js` **117/117 green** before the
judged run · **Analyzer:** `scripts/firstkiller-analyze-20261107.js`
(reuses `killerdeath-analyze-20261105.killerFates` +
`killersurvive-analyze-20261106.deathChannel`, adding the arena-bout and
starvation splits).

**The one-line result, plainly:** a first killer dies in the next big
turn-based fight — seven of the ten dead first killers on this band died
that way, usually as the scholar, usually alone or nearly alone, after
biting about two-thirds of the way through a fresh beast. One starved at
home a week after her kill, one was taken by a stranger on the road, one
died in a field fight the same day she made her kill. The arena killed
nobody, no contest killed anybody, and nobody died of old wounds at home.
The staging policy does not change where first killers die — it changes
how fast the second killer arrives (median 25 days vs 31) — so the pair
forms through production speed while the first killer still dies young.

## Before / after (identical seeds, 8 + 8)

| Metric | Baseline | Armed | Change |
|---|---|---|---|
| First killers (seeds with a wave-4+ kill) | 5 | 6 | |
| First-killer deaths / censored (alive at end) | 4 / 1 | 6 / 0 | |
| Coverage (classified deaths) | 4/4 = 1.0 | 6/6 = 1.0 | |
| Dominant channel (share of classified) | TB-fight 4/4 = 1.00 | TB-fight 3/6 = 0.50 | pooled 7/10 = 0.70 |
| First-killer kill→death, median (exclusive days) | 22d | 10d | armed still shorter-lived |
| Kill→death spans | 1, 10, 34, 38 | 0, 1, 7, 13, 18, 18 | |
| Scholar at kill / scholar at death (dead) | 3 / 4 | 2 / 5 | 9/10 dead were the scholar at death |
| Second-killer gap, median (seeds with one) | 31d (n=3: 1, 31, 50) | 25d (n=3: 18, 25, 27) | production faster armed |
| Second-kill gap (any killer), median | 29d | 25d | |
| Wave-4+ kills (log, w ≥ 4) | 13 | 20 | +7 (reproduces confirm2) |
| Wave-5 kills | 0 | 5 (all 53006) | |
| Median survival | 96d | 114.5d | +18.5d |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | no win either leg |
| Wave 4 unlocks / faced | 7 / 7 | 7 / 7 | |
| Wave 5 unlocks / faced | 0 / 0 | 1 / 1 | 53006 |
| Instrument errors | 0 | 0 | |

Day counting is EXCLUSIVE (deathDay − killDay, the killerdeath family
convention). The confirm2 evidence quoted INCLUSIVE (+1) spans (armed
0, 1, 8, 13, 18, 19; baseline 2, 10, 34, 38); the medians agree either
way (armed 10 vs 10.5, baseline 22 vs 22). The difference is convention,
not data — see metric review.

## Per-seed table

| Seed | Baseline (days, end, w4+k) | Armed (days, end, w4+k) | Baseline first killer | Armed first killer |
|---|---|---|---|---|
| 53001 | 64, lost, 0 | 106, lost, 1 | — | owen_smith d68→d69 (+1d, TB Eulogy) |
| 53002 | 66, lost, 0 | 150, survived, 1 | — | nadia_khoury d149→d149 (+0d, field Reunion) |
| 53003 | 116, lost, 2 | 92, lost, 2 | gen_2juzy3u d57→d91 (+34d, TB Eulogy) | jorge_silva d67→d74 (+7d, starvation) |
| 53004 | 85, lost, 3 | 88, lost, 1 | gen_57r1qle d64→d65 (+1d, TB Reunion) | mara_vasquez d64→d82 (+18d, a stranger) |
| 53005 | 89, lost, 0 | 89, lost, 0 | — | — |
| 53006 | 125, lost, 3 | 150, survived, 11 | olivia_bennett d64→d102 (+38d, TB Reunion) | adaeze_nwosu d52→d70 (+18d, TB Algorithm) |
| 53007 | 103, lost, 1 | 150, survived, 4 | mara_vasquez d87, alive at end | visjoin_81 d103→d116 (+13d, TB Influencer) |
| 53008 | 147, lost, 4 | 123, lost, 0 | gen_cf88doz d63→d73 (+10d, TB Eulogy) | — |

## The death-channel split (the verdict table)

Pooled across legs (10 classified deaths, 0 unmatched):

| Channel | Baseline | Armed | Pooled | Share |
|---|---|---|---|---|
| **TB-fight** | 4 | 3 | **7** | **0.70** |
| field-fight | 0 | 1 | 1 | 0.10 |
| starvation | 0 | 1 | 1 | 0.10 |
| fallen (a stranger) | 0 | 1 | 1 | 0.10 |
| arena-bout | 0 | 0 | 0 | — |
| contest | 0 | 0 | 0 | — |
| at-home / on-road, not combat | 0 | 0 | 0 | — |
| unmatched | 0 | 0 | 0 | — |

By monster, the 7 TB deaths: Eulogy 3, Reunion 2, Algorithm 1,
Influencer 1. The Reunion — the monster that knows every tactic you
have used — killed two first killers on this band (and was the
commonest killer-of-killers on the 24-village census too, 8/24). The
arena split found nothing: no first killer died in an arena bout on
this band, so the arena stays a named channel with a zero count, not a
folded-in TB death.

## First-killer table (every first killer, with the quoted death record)

| Seed / leg | Killer | Kill (day, monster, wave, via) | Death (day, +days) | Channel | Scholar kill / death | Death record quoted |
|---|---|---|---|---|---|---|
| 53003 base | gen_2juzy3u | d57 Strike w4 player | d91, +34 | TB-fight:eulogy | yes / yes | scholarDeaths `{causeArg:"the wild", atHaven:true, inCombat:true}`; tb row 8 rounds, monster 22% left |
| 53004 base | gen_57r1qle | d64 Eulogy w4 player | d65, +1 | TB-fight:reunion | yes / yes | scholarDeaths `{causeArg:"the wild", atHaven:true, inCombat:true}`; tb row 6 rounds, monster 30% left |
| 53006 base | olivia_bennett | d64 Eater w4 companion | d102, +38 | TB-fight:reunion | no / yes | scholarDeaths `{causeArg:"the wild", inCombat:true}`; tb row 16 rounds, monster 25% left |
| 53007 base | mara_vasquez | d87 Eater w4 companion | — (alive) | alive-at-end | no / — | censored: alive at the horizon |
| 53008 base | gen_cf88doz | d63 Congregation w4 player | d73, +10 | TB-fight:eulogy | yes / yes | scholarDeaths `{causeArg:"the wild", inCombat:true}`; tb row 6 rounds, monster 57% left |
| 53001 staged | owen_smith | d68 Strike w4 player | d69, +1 | TB-fight:eulogy | yes / yes | scholarDeaths `{causeArg:"the wild", inCombat:true}`; tb row 6 rounds, 4 allies / party 2 at entry, monster 45% left |
| 53002 staged | nadia_khoury | d149 Strike w4 companion | d149, +0 | field-fight:reunion | no / no | fallen `{cause:"monster", monsterId:"reunion", monsterName:"The Big Beast"}`; field row outcome vDie; NO scholarDeaths row |
| 53003 staged | jorge_silva | d67 Strike w4 player | d74, +7 | starvation | yes / yes | scholarDeaths `{causeArg:"starvation", atHaven:true, inCombat:false}`; fallen `{cause:"starvation"}` |
| 53004 staged | mara_vasquez | d64 Algorithm w4 companion | d82, +18 | fallen:a stranger | no / yes | scholarDeaths `{causeArg:"a stranger", atHaven:false, inCombat:true}`; fallen `{cause:"a stranger"}`; no TB/field row that day |
| 53006 staged | adaeze_nwosu | d52 Influencer w4 companion | d70, +18 | TB-fight:algorithm | no / yes | scholarDeaths `{causeArg:"the wild", atHaven:true, inCombat:true}`; tb row 22 rounds, 2 allies / party 2 at entry, monster 43% left |
| 53007 staged | visjoin_81 | d103 Strike w4 companion | d116, +13 | TB-fight:influencer | no / yes | scholarDeaths `{causeArg:"the wild", inCombat:true}`; tb row 15 rounds, 1 ally / party 1 at entry, monster 32% left |

No first kill is pyrrhic on this band (liveMissing 0 on all 11 — every
log kill has a live row), but the recorder reads the log, so a pyrrhic
first kill would have been caught: the proof's F13 fixture proves the
path (kill in the log with no live row still yields a classified first
killer).

## The death fight, sized (7 TB deaths)

- **Rounds:** median 8 (range 6–22; the Adaeze Algorithm fight ran 22
  rounds before she died).
- **Monster HP left when the killer dies:** median 32% (range 22–57%).
  The killer bites about two-thirds through the beast and still loses —
  the same shape as the 24-village census (9.5 rounds, 33% left).
- **Company at entry:** allies 0 in 4 of 7 death fights; the three with
  company still died (Owen: 4 allies, party 2, dead in 6 rounds;
  Adaeze: 2 allies, party 2, dead in 22; visjoin_81: 1 ally, party 1,
  dead in 15). Company does not save the killer; the fight is lost on
  damage, not on numbers — same as the census.
- **Scholar at death:** 9 of 10 dead first killers were the scholar
  when they died. The one exception (Nadia) died as a companion in a
  field fight the same day she killed.
- **Same-chain deaths:** 0 — no first killer died to the beast that
  made them (consistent with the census: 0/31). Nadia died the same day
  as her kill, but to a different beast in a different fight.

## Second-killer production (the shape confirmed)

- Baseline gaps (first kill → first kill by a different killer):
  1d (53004), 31d (53008), 50d (53006); median 31d. Two seeds never
  produced a second killer at all (53003, 53007 — the latter's first
  killer is still alive).
- Staged gaps: 18d (53006), 25d (53003), 27d (53007); median 25d.
  Every staged seed with a first killer produced a second killer, and
  the gaps are tighter (18–27d vs 1–50d).
- The pair forms armed because the second killer arrives inside the
  first killer's short life (53006: kills on days 52, 70, 70, 89, 99),
  not because the first killer lives longer — armed median survival
  after first blood (10d) is still SHORTER than baseline (22d).

## The lever the dominant channel implies

**NEXT-FIGHT SURVIVAL** — already named and sized by killersurvive-b
(the first turn-based fight a wave-4 killer enters after their kill
must be survivable: ~50% more damage per round, or ~5 more rounds of
survival at the same damage rate). This arm confirms the channel on the
staged-vs-baseline pair and refines the sizing: on this band the median
death fight lasts 8 rounds and ends with the beast at 32% HP, so the
+50% / +5-round target still covers the median death fight, and the
staged leg's death fights show company is not the missing ingredient
(Owen died in 6 rounds with 4 allies beside him). The one-shot shape
of the lever has already been tried and killed: Loop A's sim-nextfight-a
(0515Z) built the VETERAN'S EDGE (×1.5 on the killer's own blows for
their next wave-4+ TB fight) and NO-GOed — median kill→death moved
5.5d → 9d, short of the 14d bar, TB share 87.5%, and the edge wins the
next fight and is then gone; the killer who survives it dies in the
fight after, unprotected. The build was reverted per the kill rule.
What this census adds to that verdict: the edge's failure is consistent
with the channel split — the killer's SECOND next fight is the same
channel (TB) as the first, so a one-shot edge cannot move the share;
and a companion killer's own blows are a small share of the side's
damage (backlog: companion damage share), so a per-killer edge barely
moves companion death fights. The next shape is a persistent or
per-kill-refreshing veteran bonus (backlog), which needs its own prereg
— not this arm's build, and not a re-run of the killed shape. No
Steve-call is needed: the implication (make the killer's next fights
survivable, durably) follows from the named lever and its failed shape,
and the first kill itself is not to be made easier.

## Village assessment (plain words)

Eight villages, twice each. Alone, a village makes a killer and buries
them: the first person to bring down a fourth-wave beast lives about
three weeks, then walks into the next big fight as the scholar and dies
there, usually with the beast still a third alive. With friends staged
beside the scholar, the village makes killers faster — a second killer
while the first still breathes, a third, and on one seed five beasts of
the fifth wave dead too — but the first killer still dies young, ten
days on the middle measure, and the new deaths are the same shape:
turn-based fights, fresh beasts, the killer as the scholar. The
exceptions tell the same story from the sides. One killer starved at
home a week after his kill while raiders stripped the pantry the same
night. One was taken by a stranger on the road. One killed a beast as a
companion in the morning and died in a field fight against another
beast that same afternoon. Nobody died in the arena, nobody died in a
contest, nobody died of old wounds at home. The village does not lose
its killers between fights. It loses them in the next fight — and until
a killer can survive the next fight, the village will keep making
killers one at a time and burying them one at a time, friends or no
friends.

## Sense-test read

**Adaeze (53006 staged, died day 70).** The transcript coheres and then
contradicts itself in a telling way. The rally fires three times that
day — *"You plant your feet and ROAR the line back together — 'ON ME!
ON ME!' ... 'THE ALGORITHM — TOGETHER!' They turn as one."* — and the
death beats run in full: *"Adaeze Nwosu is dead — the wild. The village
stops. Somebody screams. Somebody else starts digging."* But the kill
itself is credited three different ways on the same day: the System
camera says *"Shaker just put down The Algorithm... on CAMERA. That's a
veteran kill, folks"*; the fireside gossip says *"Ella brought down The
Algorithm. Together."*; the log says Adaeze killed it as scholar and
gen_cowc2ja as companion. There were several Algorithm fights that day,
so the lines may belong to different fights — but nothing in the fiction
ties any of them to Adaeze, who died in the same fight she won. The
kill gets the camera; the killer's death gets boilerplate. Same
killer-death invisibility the census found (backlog, not this arm).

**Jorge (53003 staged, starved day 74).** The starvation channel reads
as a real story, not a label artifact. He killed the Strike on day 67
as the scholar at 60% health, while the Strike's shutdown line repeats
~20 times that day (*"🐀 SHUTDOWN — the picket line holds..."* —
verbatim repetition, see backlog). Two more villagers die on days 71–72,
and on the night Jorge starves, five separate raids strip the pantry
(~1398 + ~1000 + ~800 + ~400 + ~400 kcal carried off). The death line
is honest: *"Jorge Silva is dead — starvation."* A wounded killer, a
bled pantry, a death at home that the fiction names plainly. Coherent.

**Nadia (53002 staged, died day 149).** No burial beats could be read:
the deathSays capture is capped at 400 lines and was full long before
day 149, so her death has no transcript in this corpus — an instrument
limit, stated, not a fiction claim. The records tell it instead, and
they tell a brutal day: she fought in a lost 17-round Eater fight as an
ally (the scholar died in it), then killed a Strike as a companion in a
won 14-round fight, then died the same afternoon in a field fight
against a Reunion. Three fights, two deaths, one day — the next-fight
shape compressed to zero days.

**Fiction findings (backlog, not this arm's business):**
- Same-day kill attribution fog (above): camera, gossip, and log credit
  different names for the same day's Algorithm kills.
- The Strike's SHUTDOWN line repeats verbatim ~20 times in a single
  day (53003 d67) — the line fires every round of the shutdown fight
  and the transcript shows no variation.
- The rally line repeats verbatim three times in one day (53006 d70) —
  same as the invite-line repetition the confirm2 run already holds.

## Metric review

Pre-registered metrics bind this run (prereg 21191cc40). Primary:
coverage ≥80% AND one channel ≥50% of classified first-killer deaths
(pooled). BOTH hold: coverage 10/10 = 1.0; TB-fight 7/10 = 0.70 pooled
(baseline 4/4 = 1.00, staged 3/6 = 0.50 — the staged per-leg share sits
exactly on the bar, the pooled verdict is what the prereg judges).
Verdict DIAG-GO per the preregged rule.
- No metric was swapped, re-cut, or re-thresholded after the run. The
  Stage-0 smoke (53001–53002, 60d, staged, /tmp) is the same two seeds
  in the judged band — the smoke was unjudged Stage-0 verification
  (proof live legs L1–L10), and the judged legs re-ran them from scratch
  with the frozen driver. The proof's corpus pins (P1–P41) were computed
  over the frozen confirm2 corpus before the judged run and reproduce
  exactly on the replay corpus (pooled JSON identical).
- **Day-counting convention (recorded, not a metric change):** this arm
  uses the killerdeath family's EXCLUSIVE count (deathDay − killDay).
  The confirm2 evidence quoted INCLUSIVE (+1) spans. Medians agree
  either way; the individual spans differ by one day. Any future
  comparison must state its convention.
- **Coverage bar weakness (proposed revision for the NEXT run):** the
  coverage metric is weak by construction in this instrument family.
  killerFates derives deathDay FROM the fallen record, so every dead
  killer has a fallen row and the fallen rule fires before the unmatched
  fallback — 'unmatched' is unreachable through analyzeRow (proven by
  the proof's F11/F11b pair: the branch exists and is tested by direct
  call, but the row-level path always lands on at least
  'fallen:<cause>'). Coverage 1.0 therefore guards against a NEW
  recorder failure mode, not against misclassification on this corpus.
  Next run's revision: judge coverage on channels with a matched fight
  or causeArg (TB/field/arena/contest/starvation/at-home/on-road), with
  'fallen:<cause>' alone counting as classified-but-thin, reported
  separately — so a corpus that only ever says "the wild" cannot pass
  the bar on the back of the fallen fallback.
- **Arena split found zero:** the arena-bout channel exists in the
  taxonomy and found 0 deaths on this band. That is a count, not a
  proof the arena never kills first killers — the 24-village census
  found 2 arena deaths among ALL killers (not first killers). The split
  stays in the taxonomy for the next census.
- **Second-killer gap definition:** gap is first-kill-day to first-kill-day
  across DISTINCT killers (not second kill overall). Both medians are
  reported (second-killer 31/25, second-kill 29/25); the prereg judges
  neither, they confirm the production-speed shape.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js`: DIAG arms take no panel — no Game-root
  change exists (zero src/js) and no policy changes; the staged-vs-
  baseline paired comparison on identical seeds IS the comparison
  (the analyzer output above). No compare `.md` is fabricated.
- `scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-07/perseed-firstkiller-b/*.json' --metrics
  national,table,wins,exiled`: REFUSED — "refusing recorder-corpus
  input: all 16 --current rows carry top-level anchorCommit, so they are
  sweep recorder rows, not runs." Recorded as the result, same as every
  prior killer-chain arm. The WINSEAT baseline regime note was checked
  first: no pre-seat comparison is claimed anywhere here.
- **Determinism cross-check (prereg):** the replay reproduces the
  confirm2 corpus EXACTLY — 16/16 seeds identical on days, endReason,
  won, maxWave, standing, wave-4 kills, wave-5 kills, and total kill-log
  length; the analyzer's pooled JSON over my corpus is byte-identical
  to its pooled JSON over the frozen confirm2 corpus. No master movement
  on this band between the confirm2 anchor (74059c4daf8a) and this
  worktree's HEAD (41007b9d4) — as expected, since `src/` is identical
  between them. The verdict is a re-measurement on current master, not
  a new trajectory.

## What this arm does NOT claim

- Not a fix: no game code changed, no lever built. NEXT-FIGHT SURVIVAL
  is named (again) and re-sized, not tested.
- Not a first-kill lever: the sizing is for the killer's NEXT fight.
  Nothing here says the first kill should get easier.
- Not a party fix: death fights are already mostly solo, and the three
  staged deaths with company died anyway (Owen with 4 allies in 6
  rounds). Company is not the missing ingredient; damage / staying
  power is.
- Not an arena verdict: 0 arena deaths on 10 first-killer deaths does
  not prove the arena is safe for killers — the census found arena
  deaths among all killers.
- Not a fresh band: 53001–53008 is reused deliberately (third pass);
  band-level verdicts do not generalize beyond it without a fresh-band
  confirm. The DIAG-GO rests on 10 deaths; the census's 31-death TB
  share (77%) is the corroboration, not this band alone.
- Not a re-judgment of stageally-confirm2 GO or killersurvive-b
  DIAG-GO: those verdicts stand as measured.

## Next blanks (for the loop, not this arm)

1. **NEXT-FIGHT SURVIVAL, next shape** — the one-shot Veteran's Edge
   is killed (Loop A sim-nextfight-a NO-GO, build reverted). The next
   arm tests a persistent or per-kill-refreshing veteran bonus (backlog),
   judged on median kill→death ≥ 14d with the TB-fight share below 50%
   — the verdict bars killersurvive-b set. The companion-damage-share
   blank (a per-killer edge barely moves companion death fights) means
   the shape must reach the side's damage, not just the killer's own.
2. **The seat never taken** — 53006 held two living veterans for 42
   days, readiness-5-ready the whole time, and never sat. The
   readiness-5 release → wave-5 facing → full seat links after the
   pair are the next measurement, not this arm's.
3. **Coverage metric revision** — see metric review: the next census
   should count 'fallen:<cause>'-only classifications as thin, so the
   bar discriminates.
4. **Same-day kill-then-death** (Nadia, +0d) — the most compressed form
   of the next-fight shape. Whether a companion's field fight on the
   kill day should be part of the NEXT-FIGHT sizing (it is not a TB
   fight) is a question for the nextfight arm's sizing, not this census.

## Proof and commits

- Proof `scripts/test-firstkiller-20261107.js`: **117/117 green** on
  this worktree before the judged run (fixtures F1–F15 for every
  channel branch + pyrrhic log-read + gap math + scholar flags;
  corpus pins P1–P41 over the frozen confirm2 corpus; live legs
  L1–L10 to /tmp: Stage-0 smoke 53001–53002 60d staged, determinism
  byte-identical, neutrality off-vs-on identical on days/end/kill-log
  length). The proof caught one real fixture error before the judged
  run (F11: the fallen rule fires before the unmatched fallback — the
  fixture, not the analyzer, was wrong; fixed and re-run green).
- `node scripts/check.js --quick`: **283 passed, 7 failed** in 902s —
  the standing profile, identical to the pyrrhic/killersurvive runs:
  godpath test-measurement-proof-update, test-measurement-workflow,
  test-mobile-combat-cadence, test-occupation-panels,
  test-phone-frame-proof, test-capable-bot-20261014 (food-deed
  assertion — already filed as a pre-existing failure in
  sim-findings.md), test-establishment-r20-fixes-20261020
  (racks-full voice gate). All 7 are pre-existing on the master line;
  none touches this arm's files, and this arm changed zero src/js and
  zero green-list files. This arm's own proof test is not on the green
  list, so it did not run inside check.js; it ran directly, 117/117
  green (twice — once before the judged run, once after the F11 fix).
- Prereg committed 21191cc40 before any judged sim. Instruments +
  proof committed b4f87128 before the judged run. The safe-commit
  index clobber hit on both commits (files shown staged-as-deleted
  after correct commits); repaired with HEAD-blob cacheinfo, verified
  `git status` empty + `git diff HEAD` empty + hash-object matches.
- Judged corpus: `evidence/2026-11-07/perseed-firstkiller-b/` (16
  files, 8 baseline + 8 staged), all with 0 instrument errors.
  Analyzer output saved at `/tmp/firstkiller-analysis.json` (working
  copy; the tables above are the record).
- Stage-0 smoke: 53001–53002 staged 60d to /tmp (proof live legs,
  unjudged, not evidence).

## Convergence

**scale-onramp: converging, NOT converged.** The first-killer death
channel is now measured on the staged-vs-baseline pair, not
hypothesized: the turn-based fight takes 70% of first killers, and the
staging policy changes how fast the second killer arrives, not where
the first killer dies. The pair can form and wave 5 can be faced, but
the first killer still dies young (median 10d armed) and a village
holding two living veterans for 42 days still never sits at the table.
The binding link is the killer's next fight — whose one-shot shape has
already been tried and killed (Loop A sim-nextfight-a NO-GO), leaving
the persistent/refreshing shape as the next arm, not this one.
