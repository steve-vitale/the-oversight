# sim-partydamage-b — party damage per round — NO-GO (kill rate 8.3% < 10% bar)

- Run: `fleshout-loop-b-20261106T1630Z`, axis scale-onramp / winnability chain
- Arm: `sim-partydamage-b`, branch `sim-partydamage-b`, worktree `~/workspace/worktrees/sim-partydamage-b`
- Band: 87001–87008 (8 seeds, verified fresh — 0 hits in all evidence .md,
  no per-seed filenames, no `"seed": 8700x`, no tracker/claim mentions; see prereg)
- Policy: competent verbatim (baseline) vs competent-partydamage-b
  (`scripts/policies/competent-partydamage-b.js`: staging + rally +
  hold-ground P3 cascade + strike-together in wave-4+ TB fights),
  150d death-aware horizon, anchor `2ff871a64`
- Prereg: `evidence/2026-11-06/sim-partydamage-b-prereg.md` (committed
  `c1dce731a` before any judged sim)
- Corpus: `evidence/2026-11-06/perseed-partydamage-b/` (16 files),
  analysis `/tmp/pd-analysis.json` (working copy; this file is the record)
- Instruments: `scripts/partydamage-instrument-20261106.js` (copy of the
  fightinterior recorder, `'routed'` → `'rout'` normalization included),
  `scripts/partydamage-driver-20261106.js`,
  `scripts/partydamage-analyze-20261106.js`,
  `scripts/test-partydamage-20261106.js` (**49/49 PASS**)
- Verdict: **NO-GO — armed wave-4 TB kill rate 8.3% (2/24) vs the 10% GO
  bar, below the baseline's 10.0% (3/30) on identical seeds.** No gate,
  price, deed, or readyDemand change anywhere in this arm. No `src/js`
  change.

## The blank this arm fills

Fightinterior's next blank (1): the party-damage-per-round lever, sized
but not built — hold ground and strike together every round the party
survives, the finishprobe P3 build (hold-ground + cascade extension)
with party damage in the numerator. The SOLO P3 was NO-GO by arithmetic
(ceiling 7.5% < 10%); with company the staged ceiling was 35.3% (7
flips of 28 lost fights), so the lever was worth piloting. This arm
built it and piloted it.

## Before / after (identical seeds, 8 + 8)

| Metric | Baseline | Armed | Change |
|---|---|---|---|
| Wave-4 TB fights / traced | 30 / 30 | 24 / 24 | −6 fights reached |
| Wave-4 kills (kill log) | 3 | 2 | −1 |
| **Wave-4 TB kill rate (log / traced fights — PRIMARY)** | **3/30 = 10.0%** | **2/24 = 8.3%** | **−1.7 pts — NO-GO** |
| TB kill rate, same-day matched | 3/30 = 10.0% | 1/24 = 4.2% | the d118 kill is a midnight-spanner (see below) |
| TB outcomes (scholar-death / kill / rout / flee) | 26 / 3 / 1 / 0 | 22 / 1 / 1* / 0 | *the 'rout' IS a kill (midnight span) |
| Field wave-4 fights / kills | 13 / 0 | 13 / 0 | control channel still 0 |
| Median rounds survived (lost TB fights) | 6 | 6.5 | +0.5 round |
| Beast HP at end (median frac of max) | 0.815 | 0.502 | the party bites much deeper |
| Median damage/round, player side | 20.5 | 30 | +46% |
| Median damage/round, monster side | 16 | 18 | +2/round taken |
| Scholar strikes/fight (median) | 1.5 | 5 | the scholar actually strikes now |
| Scholar moves/fight (verbs) | 100 total | 7 total | flee-walks nearly gone |
| Cascade presses (armed only) | — | 9 total | patient_aim 4, rage 4, war_cry 1; freeze_tag 0, hogtie 0 |
| Rally verbs in w4 traces (armed only) | 0 | 21 | rally fired; bankkillerStats reads 0 (see metric review) |
| Median survival (guard) | 92.5d | 84.5d | −8d — guard holds (≥ 82.5d) |
| Starvation deaths (guard) | 0 | 0 | guard holds (≤ baseline + 2) |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | no win either leg |
| Wave 4 unlocks / faced | 6 / 6 | 6 / 5 | |
| Wave 5 unlocks / faced / kills | 1 / 1 / 0 | 0 / 0 / 0 | the door never opened (armed) |
| Readiness-5-ready days | 4 | 0 | |
| Living wave-4 killers at end | 0 / 8 | 0 / 8 | |
| Instrument errors | 0 | 0 | |

## Primary metric (binding)

- Armed wave-4 TB kill rate (log / traced fights, prereg definition):
  **2/24 = 8.3% < 10% GO bar. NO-GO.**
- Baseline on the same definition: 3/30 = 10.0% — the baseline itself
  sits exactly on the bar this band, so the armed leg did not beat the
  bar and did not beat its own baseline. No re-scoring: the verdict is
  NO-GO under the preregistered rule, not under a friendlier metric.
- The same-day-matched rate (1/24 = 4.2%) is lower only because the
  87004 d118 kill crossed midnight (fight day 117, kill logged day
  118) — the instrument's closeTrace matches on same-day only, so it
  classified that fight 'rout' with mHpLeft 0. The kill is real (see
  "The two armed kills"); the prereg's log-based rate (8.3%) is the
  judged number, and the matched rate is reported as the artifact it
  is, not as the verdict.

## The lever, as built, worked — and still lost

The mechanism fired exactly as designed. The armed scholar strikes a
median 5 times per fight (baseline 1.5), moves 7 times band-wide
(baseline 100 — the flee-walks and closing-distance churn are nearly
gone), and the party deals a median 30 damage per round (baseline
20.5, +46%). The beast ends at 50% of max HP (baseline 81%). The
party bites deeper, longer, together. And the kill rate fell.

Why: the race is still lost about fourfold. At 30 damage/round against
a median 835 entry HP, the party needs ~28 rounds to kill what kills it
in ~6.5. The improvement moved the needed-rounds from ~42 to ~28 while
survival moved 6 → 6.5 rounds. The damage half of the race moved; the
survival half barely did — and survival is the co-lever the prereg
named. Holding ground means taking the hits: monster damage/round
median 16 → 18, and every armed loss still ends with the scholar dead
(22 of 24). The lever made the party hit harder while dying at the
same speed, and harder-hitting corpses do not kill beasts.

The cascade half barely fired at all: 9 presses in 24 fights
(patient_aim 4, rage 4, war_cry 1; freeze_tag and hogtie never). The
scholars rarely HOLD the cascade abilities — finishprobe's holdings
census already said bird_strike / freeze_tag / turncoat are held by
nobody, and on this band patient_aim was held in only a handful of
fights. The cascade is not a lever that can fire when the hands are
empty; abilities reaching villagers is the upstream bind (the main
session's ability-use follow-up), not a fight-policy gap. Note the
confound: competent's own cascade pressed rage 36 times on the
baseline leg (it re-presses rage whenever winning), while this
policy's once-per-fight cap pressed it 4 times — the armed leg fought
with LESS rage, not more. That difference is named, not excused: the
rage gap alone cannot explain a kill-rate fall when the strike volume
tripled, but a future variant should not cap rage re-presses.

## Best-round composition (prereg secondary) — repeatable, and still not enough

For each lost fight's best round (highest player-side damage), the
analyzer records scholar vs ally damage, strikes, and ability verbs:

| | Baseline (lost, n=26) | Armed (lost, n=22) |
|---|---|---|
| Median best round | 20.5 | 55.5 |
| Median scholar share | 96% | 68% |
| Ally contributed | 7/26 | 15/22 |
| Ability verb in best round | 0/26 | 0/22 |
| Single-actor spike | 22/26 | 8/22 |
| Median share of entry HP | 2.1% | 7.1% |

Verdict on the fightinterior question: best rounds 143–159 ARE mostly
repeatable joint-fire rounds on the armed leg, not one-off spikes. The
biggest, 87008 d83 Reunion round 6 (243 damage: scholar 89 + Thabo 26
+ Karen 128), is a real focus-fire round — Karen hits 59–132 per round
for six straight rounds, not a crit cluster — and the party dealt 1,279
of 1,366 HP over 8 rounds before the scholar died with the beast at 87
HP (6%). But a best round is only ~7% of entry HP: repeating it for all
6.5 survived rounds is ~46% of a beast. The ceiling re-sized on the
armed leg is 33.3% (7 flips of 22 lost fights) — the same fantasy the
staged leg sized (35.3%): it requires the best round every round PLUS
one aimed strike at 2.5x, and the fights end with the scholar dead.
The one genuine single-strike spike on the armed leg is 87006 d77
Algorithm round 4 (158, scholar-only, one strike). The baseline's best
rounds were nearly all single-actor spikes (22/26) — the armed leg
fixed that shape, and it still was not enough.

## The two armed kills (damage anatomy from the traces)

| Seed | Day | Monster | Rounds | Entry HP | Scholar dmg | Ally dmg |
|---|---|---|---|---|---|---|
| 87008 armed | 102 | Influencer | 11 | 594 | 163 | 431 |
| 87004 armed | 117/118 | Influencer | 9 | 637 | ~6 strikes | — (log kill, midnight span) |

- **87008 d102 (companion kill):** the party-damage design working as
  designed — rally round 1, scholar strikes every round 2–11, allies
  deal 431 of 594 (73%). Sanne Bakker lands the killing blow; the
  System names it on camera ("Sanne just put down The Influencer...
  That's a veteran kill, folks. REMEMBER the name."). The kill's
  killer lived: Sanne is a living wave-4 killer at the horizon — but
  alone, with no second killer anywhere, so no pair forms.
- **87004 d117/118 (player kill, midnight span):** Nadia Khoury vs
  Influencer, 9 rounds, entry 637, mHpLeft 0, scholar struck rounds
  3–8 after rallying round 1. The fight started day 117; the kill
  logged day 118. The instrument called it 'rout' (same-day match
  failed) — the midnight-spanning case the finishprobe metric review
  warned about. Nadia died later; no living killer remains.

Baseline kills for contrast: 87006 d100 Strike (16 rounds, solo, the
non-attacking monster), 87006 d108 Congregation (11 rounds, 2
fighters, companion kill by nino_kapanadze), 87007 d81 Eater (8
rounds, solo, rage pressed 4× — including a single 260-damage strike
in round 7, 47% of entry HP in one blow: the spike shape).

## The grind, seen again (87008 d131)

Five fights in ONE day against the same Reunion, grinding it
1,825 → 484 → 404 → 273 → 127 HP, each scholar dying — the last
fight ended with the beast at 41 HP and the scholar dead. Five lives
in a day, the beast still standing at 41 HP, nobody finished it. The
grind works as plumbing; its price is five lives for a beast that
still stands. The same Reunion's d83 fight (above) ended at 87 HP.
This village came within 41–87 HP of a kill twice and banked nothing.

## Wall numbers

| Seed | Baseline (days, end, w4tb, w4k) | Armed (days, end, w4tb, w4k) |
|---|---|---|
| 87001 | 44, lost, 0, 0 | 44, lost, 0, 0 |
| 87002 | 61, lost, 8, 0 | 67, lost, 4, 0 |
| 87003 | 83, lost, 2, 0 | 139, lost, 3, 0 |
| 87004 | 150, survived, 2, 0 | 137, lost, 4, 1 |
| 87005 | 79, lost, 0, 0 | 79, lost, 0, 0 |
| 87006 | 126, lost, 6, 2 | 90, lost, 2, 0 |
| 87007 | 102, lost, 4, 1 | 77, lost, 0, 0 |
| 87008 | 124, lost, 8, 0 | 132, lost, 11, 1 |
| **Band** | **median 92.5d** | **median 84.5d** |

Wins 0/8 both legs, national 0/8 both, table 0/8 both, wave-4 unlocks
6/8 both, wave-4 faced 6/8 baseline / 5/8 armed, wave-5 unlocks 1/8
baseline (87006, standing 305) / 0/8 armed, wave-5 faced 1/8 / 0/8,
readiness-5-ready days 4 baseline / 0 armed, living wave-4 killers at
end 0/8 both. Field wave-4 fights 13 both legs, 0 kills both.

Trajectory divergence note: identical seeds, different policies, so
the villages diverge — 87006 baseline reached wave 5 (a 42-round
Timeslot fight, entry 1,503 HP) while armed 87006 died day 90 and
never opened the door; 87007 baseline fought 4 wave-4 TB fights while
armed 87007 fought none. The per-seed fight counts differ because the
policy changes who lives to fight, not because the instrument missed
fights (0 unclassified, 0 instrument errors, 24/24 and 30/30 traces
present on both legs).

## Village assessment (plain words)

Eight villages, six reached the fourth wave on each leg, none won,
none opened the fifth wave's door on the armed leg. The villages are
not losing because their fighters run away anymore — on the armed leg
nobody walks away, nobody flees, the line holds and strikes together
every round, and the beast still stands at half health when the
scholar dies. A village sends its best person out with friends against
a beast with ten times their health, they land good hits together for
six rounds — the friends hit harder than the scholar some rounds — and
then the scholar dies and the beast walks off at half health. Twice a
village did kill one, both times an Influencer, once by a friend
landing the last blow while the scholar struck every round beside her.
And on one seed, five people died in a single day grinding the same
beast down to 41 HP, and nobody finished it. The road to the full seat
is blocked in the fight itself, and hitting harder did not unblock it:
the party needs about four times the rounds it survives, and no
amount of holding ground buys those rounds.

## Sense-test read

**One party kill — 87008 d102, the Influencer.** The fiction and the
numbers agree for once: the System names Sanne on camera, a veteran
kill, remembered. The trace shows the design working — rally, strike
every round, ally lands the last blow. The kill sounds like something.

**One kill that passed silently — 87004 d117/118, Nadia's Influencer.**
The fight's kill has no triumph beat in the captured lines; the day
117 transcript is Raj Patel's death and burial ("That night, they
bring Raj home... By morning the grave is dug by the fire"), and the
day 118 System line celebrates a DIFFERENT kill — Ivy's wave-3
Buffering, announced as a "veteran kill" ("That's a veteran kill,
folks") for a wave-3 monster. Third sighting of the mismatch the
backlog already holds (fightinterior flagged it): the System calls
wave-3 kills veteran kills while a real wave-4 kill passes without a
beat. Not re-filed.

**One near-miss — 87008 d83, the Reunion at 87 HP.** The party dealt
1,279 of 1,366 HP and the scholar died with the beast at 6%. Karen
hit 59–132 a round for six rounds — a villager fighting like a
protagonist, not a bystander. The loss reads as a tragedy, not a
misfire: they almost had it.

**One grind day — 87008 d131.** Five scholars, one beast, 1,825 → 41
HP in a day. The transcripts for the day are not in the deathSays
filter beyond the burial beats; the numbers alone carry the horror.
A village that loses five people to one beast in a day and still has
no kill is a village the game is asking to do the impossible.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js --help`: refuses with the pilot's error
  (`Error: --out <panel-directory> required`). The tool runs its own
  full panel and takes no corpus input, so it cannot compare competent
  vs partydamage on identical seeds. No Game-root change exists in
  this arm (policy A/B on identical seeds is the comparison), so no
  compare `.md` is fabricated — same outcome as the pilot, the
  confirm, and fightinterior. The matched-seed paired comparison is
  the analyzer output above (identical seeds, both legs, same
  instrument).
- `scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-06/perseed-partydamage-b/*.json' --metrics
  national,table,wins,exiled`: REFUSED — "refusing recorder-corpus
  input: all 16 --current rows carry top-level anchorCommit, so they
  are sweep recorder rows, not runs." Recorded as the result, same as
  every prior killer-chain arm. No telemetry deviation check was
  possible on this corpus; the wall numbers above are the
  instrument's own. The WINSEAT baseline regime note was checked
  first: no pre-seat comparison is claimed anywhere here.

## Metric review

- **The primary metric is judged as pre-registered** (log kills /
  traced TB fights): armed 2/24 = 8.3% < 10% → NO-GO. The
  same-day-matched rate (1/24 = 4.2%) is NOT the judged number — it
  is a same-day-matching artifact on a midnight-spanning kill (fight
  day 117, kill logged day 118). The analyzer's pyrrhic matcher was
  ALSO wrong on first run: it read `k.day` while waveKillLog's day
  key is `d` (killsLive uses `day`) — fixed before judging (the fix
  changes nothing here: pyrrhic 0 on both legs after the fix; the
  d118 kill is a 'rout'-classified TB kill, not an 'unfinished' one,
  so no pyrrhic path fires for it). The instrument's closeTrace has
  the same same-day limitation; a future recorder should match kills
  across the midnight boundary (fight day ± 1) instead of same-day
  only. The verdict does not depend on it: 8.3% < 10% either way, and
  the baseline is 10.0% on both readings.
- **Baseline sits exactly on the bar (10.0%)** on this band — the
  armed leg did not just miss the bar, it missed its own baseline.
  With 24–30 fights, one kill swings the rate ~3–4 points; the
  NO-GO is a pilot verdict on 8 seeds, not a proof that party damage
  can never work. A confirm would be spent only on a changed lever,
  never on this one as-is.
- **Rally accounting:** the trace verbs record 21 rally fires on the
  armed leg, but `bankkillerStats.rallyFires` reads 0 — the policy
  calls `Game.tbPlayerRally()` directly instead of routing through
  the rally policy's fight hook, so the rally module's counter never
  increments. The trace verbs are the record; the module counter is
  the artifact. A future variant should route the rally through the
  rally hook or count from verbs.
- **Rage cap confound:** the policy's once-per-fight cap pressed rage
  4 times on the armed leg while competent's own cascade pressed it
  36 times on the baseline leg. The armed leg fought with less rage,
  not more. The strike-volume tripling dominates the comparison, but
  the cap is a real difference from competent's behavior and should
  not be carried into a future variant unexamined.
- **Cascade holdings:** the P3 cascade's non-firing is a holdings
  fact, not a policy bug — scholars held patient_aim in only a few
  fights and freeze_tag / hogtie / bird_strike / turncoat in none
  that mattered (finishprobe holdings census reproduced in shape).
  The cascade cannot be judged as a lever until abilities reach
  villagers' hands.
- **Trajectory divergence:** per-seed fight counts differ (30 vs 24)
  because the policy changes who lives to fight. The paired
  comparison is per-seed by trajectory, not per-fight; the kill
  rate is computed over each leg's own fought fights, as preregistered.
- **Field channel:** 13 field wave-4 fights each leg, 0 kills both.
  Field fights are the untouched control; every kill came from a
  turn-based fight.
- **No metric was swapped, re-cut, or re-thresholded after the run.**
  The analyzer's `k.day` → `k.d` fix changes only the pyrrhic
  matcher (0 on both legs either way); the primary numbers are
  unaffected by it.

## Blanks: filled vs documented

- **Filled:** the party-damage lever — built, piloted on a fresh band,
  judged NO-GO on its own bar. The mechanism fired (strikes ×3,
  moves ÷14, damage/round +46%, beast HP left 81% → 50%) and the
  kill rate still fell (10.0% → 8.3%). Best-round composition is now
  measured: armed best rounds are mostly repeatable joint-fire rounds
  (ally in 15/22), not one-off spikes — and still only ~7% of entry
  HP each. The ceiling re-sized on the armed leg is 33.3%, the same
  fantasy as the staged 35.3%.
- **Documented (not filled, owned elsewhere):** the survival-time
  binding itself — the party needs ~28 rounds to kill what kills it
  in ~6.5, and holding ground does not buy rounds. The next lever
  must open survival time (armor/mitigation curve — a balance lever,
  not a fight policy) or entry-HP wounding before the lift, or
  abilities must reach villagers' hands so the cascade can fire at
  all. No gate, price, or deed change is proposed. No `src/js`
  change was made in this arm.

## What this arm does NOT claim

- Not a kill of the stageally rally/staging: the rally fired 21 times
  and the party staged and struck together; the NO-GO is the
  party-damage lever's, not the rally's.
- Not a proof that party damage can never work: 8 seeds, 24 fights,
  one kill swings ~4 points. It is a pilot NO-GO on this lever as
  built, on this band.
- Not a field-fight fix: field fights killed 0 wave-4 monsters on
  both legs; every kill came from a turn-based fight.
- Not a pair: the one living killer (Sanne, 87008) is alone; no
  second killer exists anywhere on the band, readiness-5 never
  released.
- Not a win story: 0 wins, 0 national, 0 table on both legs; the
  wave-5 door opened once, on the baseline leg only.
- The Stage-0 smoke and the proof legs are not evidence; only the
  judged 8+8 legs above are.

## Next blanks (for the loop, not this arm)

1. **Survival time** — the co-lever the prereg named: the party needs
   ~28 rounds and survives ~6.5. Armor/mitigation that lets a scholar
   stand 15+ rounds against wave-4 damage is a balance lever (game
   code), not a fight policy. The fight-policy half is exhausted for
   now: hold-ground + cascade + strike-together moved damage/round
   +46% and kills did not move.
2. **Abilities reaching villagers** — the cascade fired 9 times in 24
   fights because the hands are empty. The main session's ability-use
   follow-up is the arm that can move this number.
3. **Midnight-spanning kill matching** — the recorder's same-day match
   calls a real kill 'rout' (87004 d117/118). Match kills across the
   midnight boundary (fight day ± 1) in the next recorder.
4. **Rage re-presses** — a future variant should not cap rage at once
   per fight; competent re-presses it whenever winning (36× baseline
   vs 4× armed).
5. **The 41-HP grind** — five scholars died in one day grinding one
   Reunion to 41 HP. The grind's price binds; a lever that finishes
   a beast at <10% HP (a wounded-entry finisher, or a lift that
   carries the wounded beast to the scholar) is worth sizing — but
   finishprobe P1 already showed no round-cap remainder exists, so
   size it from the field grind, not from TB.

## Proof and commits

- Proof `scripts/test-partydamage-20261106.js`: **49/49 green** on this
  worktree before the judged run (fixtures + policy unit fakes +
  live legs to /tmp: wave-4 traces with hits/turns, all classified,
  zero instrument errors, determinism byte-identical, neutrality
  off-vs-on, armed strikes in w4 fights, armed never flees w4).
  One fixture fix after the first run (wavesFaced id `the_strike` →
  `strike`); re-run green. The analyzer's `k.day` → `k.d` fix (see
  metric review) was applied after the judged run to the matcher
  only; the proof was re-run green on the final tree before this
  evidence was committed.
- Prereg committed `c1dce731a` before any judged sim. Build committed
  `2ff871a64` (policy + recorder/driver/analyzer + proof 49/49).
  The safe-commit index clobber hit on both commits (files shown
  staged-as-deleted after correct commits); repaired with HEAD-blob
  cacheinfo each time, verified `git status` empty + `git diff HEAD`
  empty + hash-object matches.
- Judged corpus: `evidence/2026-11-06/perseed-partydamage-b/` (16
  files, 8 baseline + 8 armed), all with 0 instrument errors.
  Analyzer output saved at `/tmp/pd-analysis.json` (working copy;
  the evidence file above is the record).
- Stage-0 smoke: 55002 baseline + armed, 90d, to /tmp (traces
  present, armed strikes in w4, armed never flees w4, 0 errors) —
  unjudged, not evidence.

## Convergence

**scale-onramp / winnability chain: converging, NOT converged.** The
party-damage lever is spent: it moved everything it could move inside
the fight — strikes tripled, movement nearly vanished, damage per
round up 46%, the beast ending at half health instead of four-fifths —
and the kill rate went down, not up (10.0% → 8.3%). The binding
constraint is still survival time × damage per strike vs entry HP,
and the fight-policy half of it is now measured twice over (solo P3
NO-GO by arithmetic, party P3 NO-GO by pilot). The next lever has to
buy rounds lived, not damage dealt — or put abilities in villagers'
hands so the cascade has something to press.
