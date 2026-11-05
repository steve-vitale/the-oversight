# TB retreat-and-refind — CONFIRM (arm sim-tbretreat-refind-confirm-b)

Run: fleshout-loop-b-20261105T2130Z. Axis: scale-onramp / winnability
chain (wild ally-join → wave-4 kills → veterans → readiness-5 release
→ wave-5 facing → full seat). Prereg:
`evidence/2026-11-05/sim-tbretreat-refind-confirm-b-prereg.md`
(committed BEFORE any judged sim, 912c1a20).

POLICY-SIDE ONLY. Zero src/js changes, zero default flips, no existing
policy file touched. Reuses `scripts/policies/tbretreat-refind.js` +
its driver and analyzer from master, landed as 4a065f050 (pilot GO).

## Verdict: GO (confirm)

All four pre-registered gates hold on the full 24-seed confirm band
(16-seed main band 93011–93026 + 8-seed extension 92011–92018), and
the denominator guard is cleared (27 trigger fires, well above the
15-fire threshold). The pilot's 40.0% G1 (6/15) re-tests at 51.9%
(14/27) on fresh seeds — the exit rate holds up at confirm scale,
and the kill-rate guard that was thin in the pilot (0.60×, 0.10
margin) holds more comfortably here (0.68×, 0.18 margin).

| Gate | Bar | Result | Holds |
|---|---|---|---|
| G1 (primary) retreat survival | exits / trigger fires ≥ 25% | **14 / 27 = 51.9%** | YES |
| G2 (primary) TB-fight survival | armed > baseline | **22.4% vs 7.4%** | YES |
| G3 (guard) kill rate not halved | armed ≥ ½ baseline | **3.1% vs 4.6%, ratio 0.68×** | YES (margin 0.18×) |
| G4 (guard) survival not harmed | armed median ≥ 0.8× baseline | **89d vs 90d, 0.99×** | YES |
| Denominator guard | fires ≥ 15 or THIN | **27 fires** | cleared |

The 16-seed interim read was THIN, not GO: 14 fires (8 exits,
57.1%) at 16 seeds, one fire short of the guard. Per the prereg the
confirm was extended with the 8 pre-registered fresh seeds
92011–92018 (freshness re-verified at extension time — the only
hits were this arm's own prereg naming the band), adding 13 fires
and 6 exits. The judged corpus is the full 24-seed band; the
16-seed numbers are reported below as the interim only. The
extension moved the picture in the honest direction: G1 57.1% →
51.9%, and the 16-seed G3 ratio (1.19×, armed killing MORE than
baseline on 3 vs 3 kills) reverted to the expected trade (0.68×)
— small-denominator noise, exactly what the guard exists to catch.

## Before / after (24 seeds, bands 93011–93026 + 92011–92018, 150d)

| Measure | Baseline (competent verbatim) | Armed (tbretreat-refind) |
|---|---|---|
| Wave-4+ fights | 130 | 128 |
| Wave-4+ TB fights | 68 | 76 |
| TB deaths | 63 | 59 |
| TB kills (matched) | 5 | 3 |
| TB flees | 0 | 14 |
| TB survival (G2) | 5/68 = 7.4% | 17/76 = 22.4% |
| Field fights | 62 | 52 |
| Field kills (matched) | 1 | 1 |
| Field deaths | 22 | 25 |
| Field flees | 38 | 25 |
| Total matched kills | 6 | 4 |
| Wave-4+ kill rate (G3) | 6/130 = 4.6% | 4/128 = 3.1% |
| Median damage dealt (TB, frac of monster HP) | 0.178 | 0.085 |
| Median survival | 90d | 89d |
| Survived the 150d horizon | 1/24 | 2/24 |

Unmatched kills 0/0; instrument errors 0 in all 48 rows. Seeds with
0 trigger fires are identical between legs (the policy never fired,
so the RNG stream never diverged) — 12 of 24 seeds identical
(93012, 93015, 93017, 93018, 93019, 93022, 93023, 93024, 93026,
92012, 92013, 92016), verified by the proof test.

The armed leg fought MORE wave-4+ TB fights (76 vs 68) because
retreated fighters lived to fight again — the same shape as the
pilot (66 vs 60) — while field fights fell (52 vs 62). The field
drop is downstream of RNG divergence after the first exit, not a
lever effect: the lever never touches field fights, and after an
exit the two legs' random streams part, so later encounters differ.
Per-seed fight counts swing hard for the same reason (93020: armed
8 wave-4 fights vs baseline 22, yet the armed leg survived the
horizon and the baseline leg also survived it) — leg totals are the
instrument, per-seed fight counts are noise.

## The 27 trigger fires — full accounting

The trigger fires at scholar HP < 75% AND live wave-4+ monsters'
remaining HP > 75% (frozen prereg F1). Every fire is listed; the
numbers are policy-observed, not joined. All 27 fires are wave-4
(the wave-4-only slice equals the full count, as in the pilot).

| Seed | Day | Monster | Turn | Scholar HP | Monster HP | Result |
|---|---|---|---|---|---|---|
| 92011 | 61 | reunion | 3 | 0.62 | 0.96 | exited-haven |
| 92011 | 64 | reunion | 4 | 0.27 | 0.95 | exited-haven |
| 92011 | 70 | algorithm | 3 | 0.70 | 0.98 | exited-gaveup (1 crossing) |
| 92014 | 64 | reunion | 3 | 0.04 | 0.99 | exited-haven |
| 92014 | 68 | reunion | 3 | 0.16 | 0.83 | haven-hold → died |
| 92014 | 68 | reunion | 3 | 0.55 | 0.88 | haven-hold → died |
| 92014 | 68 | reunion | 3 | 0.69 | 0.82 | haven-hold → died |
| 92015 | 60 | reunion | 3 | 0.49 | 1.00 | exited-haven |
| 92015 | 75 | reunion | 3 | 0.58 | 0.98 | open → died mid-retreat |
| 92017 | 134 | algorithm | 5 | 0.48 | 0.94 | exited-gaveup (1 crossing) |
| 92018 | 42 | reunion | 6 | 0.49 | 0.84 | open → died mid-retreat |
| 92018 | 56 | eater | 3 | 0.45 | 1.00 | open → died mid-retreat |
| 92018 | 72 | reunion | 3 | 0.66 | 0.83 | haven-hold → died |
| 93011 | 63 | eulogy | 3 | 0.53 | 1.00 | haven-hold → died |
| 93013 | 93 | reunion | 4 | 0.53 | 1.00 | open → died mid-retreat (1 crossing) |
| 93013 | 110 | suburb | 1 | 0.19 | 1.00 | exited-haven |
| 93013 | 114 | reunion | 1 | 0.38 | 1.00 | exited-haven |
| 93013 | 123 | algorithm | 6 | 0.65 | 1.00 | exited-haven |
| 93014 | 93 | reunion | 4 | 0.70 | 0.93 | open → died mid-retreat |
| 93016 | 54 | reunion | 4 | 0.27 | 0.95 | exited-haven |
| 93016 | 68 | eater | 1 | 0.16 | 1.00 | haven-hold → died |
| 93020 | 94 | influencer | 1 | 0.71 | 1.00 | exited-gaveup |
| 93020 | 97 | eater | 1 | 0.17 | 1.00 | haven-hold → died |
| 93020 | 126 | eater | 3 | 0.58 | 0.97 | exited-haven |
| 93021 | 109 | reunion | 3 | 0.49 | 0.96 | exited-haven |
| 93021 | 116 | reunion | 3 | 0.50 | 0.96 | exited-haven |
| 93025 | 68 | reunion | 4 | 0.72 | 0.86 | open → died mid-retreat |

- **14 exited** (11 exited-haven, 3 exited-gaveup — the first
  gaveup exits in either run; the pilot had 0).
- **7 haven-holds**: the trigger fired while the fighter stood ON
  the haven node, so there was nowhere to run to — they held and
  fought it out. All 7 died. These are counted in G1's denominator
  (they are trigger-fired fights, per the prereg). Excluding them,
  the exit rate on genuine retreat attempts is 14/20 = 70.0% —
  diagnostic, not the judged number. The haven-hold share
  reproduced the pilot's (7/27 = 26% vs 5/15 = 33%).
- **6 open (died mid-retreat)**: the fighter died during the walk
  to the edge or on the new node after a crossing, before any exit.
  93013 d93 crossed once and died on the new node — the persistent
  chase ran and the fighter still died; the chase is not a
  guarantee.
- **13 of 27 fires ended in the fighter's death** (7 haven-hold +
  6 open). The analyzer's day+mid join reports 13 fired-deaths and
  14 fired-flees, which matches the policy-observed split exactly —
  but with one swap inside it (see the join note below), so the
  policy-observed count (13) is authoritative and the join's
  aggregate is corroboration, not the source.

## Push-outcome classification

Every push classified at push time, as in the pilot:

| Outcome | Count |
|---|---|
| exited-haven | 11 |
| exited-gaveup | 3 |
| crossed (chase continues) | 3 |
| consumed — sealed | 0 |
| consumed — world-edge | 0 |
| consumed — blocked | 0 |
| stuck fallbacks | 0 |
| crossing caps (6) | 0 |
| suppressions (arena / noFlee / table-trial) | 3 |

**Zero consumed pushes in 27 fires, across both runs now 0 in 42.**
The barrier was never sealed, never at the world edge, never
blocked. The havenward direction plus the persistent chase
eliminated the sibling's entire "sealed" bucket a second time, on
fresh seeds. What kills a retreat is the WALK (6 died mid-retreat)
or being already home with nowhere to run (7 haven-holds).

The three crossings: 92011 d70 (algorithm — crossed once, then the
chase gave up; see sense-testing), 92017 d134 (algorithm — crossed
once, then gave up), 93013 d93 (reunion — crossed once, died on the
new node). All three gaveup exits came after a crossing except
93020 d94 (influencer, exited-gaveup with 0 crossings — the chaser
gave up on the first node).

**Join note.** The analyzer's day+mid join double-matches once in
this corpus, as the pilot warned it could: 92018 d72 joins TWO
fight rows (nino_kapanadze, the true fired fighter, and
diana_osei, a same-day same-mid fight that also gets the
refindFired flag), while the 93020 d97 haven-hold (gen_7txma58)
has NO joined fight row. The join still totals 27 rows with the
right 13-death / 14-flee split, but the per-fight attribution is
approximate at that one spot. Policy-observed counts are
authoritative; the join is an approximation, disclosed here as in
the pilot. (Filed as a measurement note in sim-findings.md: the
denominator counts fires per fighter, so a shared party fight can
contribute several fires in one day — see 92014 d68 below.)

## Re-engagement (the refind half)

With the sibling's restore reverted, a fled beast melts — there is
no same-beast re-find. The refind half is re-engagement: the same
scholar faces a wave-4+ beast again within 7 days of an exit.

- **6 of 14 exits re-engaged within 7 days; 2 same-monster-kind.**
- 92011 d61 reunion → re-engaged day 64 (same kind) and day 68.
- 92011 d64 reunion → re-engaged day 68.
- 92011 d70 algorithm → no re-engagement within 7 days.
- 92014 d64 reunion → no re-engagement within 7 days.
- 92015 d60 reunion → no re-engagement within 7 days.
- 92017 d134 algorithm → no re-engagement within 7 days.
- 93013 d110 suburb → re-engaged day 114 and 116.
- 93013 d114 reunion → re-engaged day 116.
- 93013 d123 algorithm → no re-engagement within 7 days.
- 93016 d54 reunion → no re-engagement within 7 days.
- 93020 d94 influencer → re-engaged day 96.
- 93020 d126 eater → no re-engagement within 7 days.
- 93021 d109 reunion → re-engaged day 116, same kind.
- 93021 d116 reunion → no re-engagement within 7 days.

The fighter who leaves lives to fight again about two-fifths of
the time within a week (6/14, vs the pilot's 2/6). The other
exits bought life-days and later fights on other days, not a quick
rematch. Olivia Bennett (92011) is the sharpest case: she exited
twice, went back twice, and died on the third fight — the retreat
bought her a week, not a win.

## Per-seed table

Days / end / wave-4 fights / matched wave-4 kills / standing.

| Seed | Baseline | Armed |
|---|---|---|
| 92011 | 71 lost / 2 / 0 / 115 | 71 lost / 10 / 0 / 140 |
| 92012 | 143 lost / 7 / 1 / 199 | 143 lost / 7 / 1 / 199 (identical) |
| 92013 | 82 lost / 1 / 0 / 120 | 82 lost / 1 / 0 / 120 (identical) |
| 92014 | 78 lost / 10 / 1 / 170 | 70 lost / 11 / 0 / 145 |
| 92015 | 84 lost / 8 / 0 / 165 | 86 lost / 8 / 0 / 125 |
| 92016 | 57 lost / 0 / 0 / 0 | 57 lost / 0 / 0 / 0 (identical) |
| 92017 | 142 lost / 10 / 0 / 125 | **150 survived** / 10 / 0 / 125 |
| 92018 | 83 lost / 11 / 1 / 199 | 78 lost / 13 / 0 / 175 |
| 93011 | 86 lost / 7 / 0 / 190 | 86 lost / 7 / 0 / 190 |
| 93012 | 49 lost / 0 / 0 / 70 | 49 lost / 0 / 0 / 70 (identical) |
| 93013 | 110 lost / 3 / 0 / 125 | 127 lost / 6 / 0 / 175 |
| 93014 | 103 lost / 13 / 0 / 185 | 103 lost / 13 / 0 / 185 |
| 93015 | 105 lost / 7 / 0 / 120 | 105 lost / 7 / 0 / 120 (identical) |
| 93016 | 141 lost / 14 / 0 / 199 | 92 lost / 11 / 0 / 165 |
| 93017 | 127 lost / 0 / 0 / 99 | 127 lost / 0 / 0 / 99 (identical) |
| 93018 | 62 lost / 0 / 0 / 75 | 62 lost / 0 / 0 / 75 (identical) |
| 93019 | 48 lost / 0 / 0 / 50 | 48 lost / 0 / 0 / 50 (identical) |
| 93020 | **150 survived** / 22 / 0 / 199 | **150 survived** / 8 / 0 / 175 |
| 93021 | 114 lost / 4 / 2 / 150 | 120 lost / 5 / 2 / 150 |
| 93022 | 77 lost / 0 / 0 / 70 | 77 lost / 0 / 0 / 70 (identical) |
| 93023 | 48 lost / 0 / 0 / 99 | 48 lost / 0 / 0 / 99 (identical) |
| 93024 | 94 lost / 0 / 0 / 99 | 94 lost / 0 / 0 / 99 (identical) |
| 93025 | 97 lost / 11 / 1 / 199 | 97 lost / 11 / 1 / 199 |
| 93026 | 115 lost / 0 / 0 / 99 | 115 lost / 0 / 0 / 99 (identical) |

92017 is the armed-only survivor (baseline lost at 142d, armed
survived the horizon after a gaveup exit on day 134). 93020
survived on both legs. 93016 is the swing seed in the other
direction: the armed leg died 49 days earlier (92d vs 141d) after
an exit on day 54 and a haven-hold death on day 68 — the retreat
bought the fighter 14 days and the village still fell sooner. The
lever buys lives per fight, not longer villages on every seed.

## Wall numbers

Per leg (24 rows each):

| Measure | Baseline | Armed |
|---|---|---|
| Wins | 0 | 0 |
| National / global | 0 | 0 |
| Table | 0 | 0 |
| Wave-4 unlocks | 15/24 | 15/24 |
| Wave-4 faced | 15/24 | 15/24 |
| Wave-5 unlocks | 0 | 0 |
| Wave-5 faced | 0 | 0 |
| Readiness-5-ready days | 0 | 0 |
| Median survival | 90d | 89d |
| Survived 150d | 1/24 | 2/24 |

Combined (48 rows): wave-4 unlocks 30, wave-4 faced 30, wave-5
unlocks 0, wave-5 faced 0, ready days 0, median 89d. The lever
moves survival per TB fight; it does not move the wall. No seed
banked a veteran pair, no seed released a ready force, no seed
opened the wave-5 door — the winnability chain past wave-4 kills
is untouched by this lever, as the prereg expected. One seed
(92012, both legs) ends with a single LIVING wave-4 killer — the
veterans bar's first half exists, the pair never forms. Standing
199 (the t5-1 readiness hold: standing earned, veterans 0) shows
on 5 baseline seeds and 2 armed seeds — the drop is downstream of
RNG divergence after exits, not a lever mechanism (the lever
never touches standing inputs), but it is the same 99107 pattern
the standing-accumulation arm is queued to attack.

## Village assessment (plain words)

A fighter who is losing a fight against a wave-4 beast — hurt, and
barely scratching the thing — now turns and runs for home, and
about half the time they make it out alive. Before this lever, that
fighter simply died: the old policy fled too late, and the sibling
game-code arm showed the exit almost never happened at all. On
fresh seeds the exit happens more often than in the pilot (about
half of all trigger fires, seven in ten genuine attempts), and the
fighters who run survive their fights three times as often as the
ones who stay (about one in five fights survived, against about
one in fourteen without the lever).

What the retreat does NOT do: it does not win fights. The fighters
who run away come back and face fresh beasts, and they still mostly
lose — the village killed fewer wave-4 beasts with the lever on (4
instead of 6), though not few enough to fail the guard. One more
village lived to the end of the season with the lever on, and one
fighter went back to the same beast three days later and died
trying again. The lever buys lives and more chances, not victories.
The wall past wave 4 — veterans, the ready force, wave 5, the full
seat — did not move.

The remaining failure mode is the same as the pilot's, and it
reproduced exactly: a hurt fighter needs several turns to reach the
edge of the fighting ground while the beast hits them (6 died on
the walk), and a fighter already standing at home has nowhere to
run to (7 died where they stood). Fixing either of those is engine
work (a faster breakaway, or a home-ground advantage), not policy
work. This arm confirms the policy half of the blank is closed:
the retreat happens, and it saves lives per fight.

## Sense-testing

Read from the transcripts (fightLines / deathSays in the per-seed
JSON), not just the counts.

**92011 day 70 — the chase, twice over.** Ivy Wang's gaveup exit
is the full mechanism in the transcript, in order: "Not mid-fight
— the barrier is the way out." then "BARRIER CROSSED — you crash
through to a new area, but they're right behind you — through the
barrier!" then "The Algorithm is flagging — it won't follow much
further" then "BARRIER CROSSED — you crash through to a new area.
The pursuit falters behind you — they give up the chase." The
monster followed across the barrier, its persistence ran out
between crossings, and the second push ended the fight. The
persistent chase (F3) is not a theory — it is in the transcript,
working exactly as the mechanism map said it would. And then the
lever's limit, in the same day's death notices: "Ivy Wang is dead
— starvation." She walked out of the fight alive and starved the
same day. The retreat saves you from the beast, not from hunger.

**92011 days 61–68 — Olivia Bennett, twice out and back.** Day 61:
Olivia retreated from the Reunion into Haven at 62% HP. Day 64:
she went back to the same kind of beast, fired the trigger again
at 27% HP, and retreated again. Day 68: she faced a Reunion a
third time and died — "Olivia Bennett is dead — the wild. The
village stops. Somebody screams. Somebody else starts digging."
... "What Olivia kept close goes into the ground with them —
keepsakes are buried, never taken from the body." The retreat
bought seven days and two more fights; the fighter chose to go
back and died. Coherent, human, sad — the lever's value is the
extra life-days, not a guaranteed second win.

**92014 day 68 — the triple haven-hold.** Three trigger fires on
the same day against the same Reunion, three different fighters
(Stan Kowalski, Meera Reddy, Sanne Bakker), all standing on the
haven node, all holding, all dying — and Chloe Dubois, who had
exited the same kind of beast four days earlier, died in the same
day's fighting too. The death notices read like a village burying
a party at once: four graves, four "somebody screams, somebody
else starts digging," and the same day a note from The Red Table
that "Cole is dead, and Priya and Sanne both claim the fire" — a
succession fight opening over the fresh graves. Whether the three
fires were one shared party fight or three separate fights is not
recoverable from the corpus (see the join note), but the fiction
reads as one catastrophic stand at home, and it reads true.

**93016 day 68 — the long stand.** The eater fight lasted 19
rounds with the fighter dealing 3.4% of the beast's health — the
longest fired fight in the corpus — and ended in a haven-hold
death. Nineteen rounds of standing at home, nowhere to run, dying
where they stood. The instrument record stands; the walk (or the
lack of one) is the story.

**Say-line cross-check (all 24 armed files):** 13 barrier lines
survive the 200-line cap — 9 haven exits, 2 chase-continues, 2
gaveups — and zero lines say the barrier held, was sealed,
refused, or that the known world ended. The push-outcome
classification (0 sealed / 0 world-edge / 0 blocked) rests on
push-time observation, not on say lines, so the cap does not
weaken it; the surviving lines corroborate it and never contradict
it. Two exits' barrier lines fall past the cap and are not in the
corpus: the 92017 day-134 gaveup exit and the 93020 day-97
haven-hold are policy-observed only — disclosed, not papered over.

## Metric review (the four prereg questions)

1. **Does the 25% G1 bar fit a retreat lever (it was set for a
   restore lever)?** The pilot cleared it at 40% on the prereg
   denominator and the confirm at 51.9% (14/27); on genuine retreat
   attempts (excluding haven-holds) the confirm reads 70.0%
   (14/20). As a floor for "the exit happens", 25% is fair and the
   lever clears it by 2× on the judged denominator. The haven-hold
   share reproduced (26% vs the pilot's 33%), so the denominator
   question is settled the same way both times: judge the prereg
   denominator, report the attempts-only slice diagnostically.
2. **Does the push-outcome classification match the say-line
   record?** Yes where say lines survive (13 barrier lines, all
   consistent; 0 sealed lines). The classification is push-time
   observation (node changed or not), so it does not depend on the
   say lines at all. The first gaveup exits (3) are now in the say
   record as well as the policy record.
3. **Does 75/75 abandon winnable fights?** The trigger fires only
   when the monster is above 75% HP — the scholar has dealt little.
   Joined trigger fights dealt 0–19.6% of monster HP (median ~3%).
   The cost is real and visible: TB kills 5 → 3, kill-rate ratio
   0.68× (the guard holds with 0.18 margin, better than the
   pilot's 0.10). The abandoned fights were losing fights by the
   trigger's own terms, and all 13 non-exit fires ended in death —
   but some of the baseline's 5 TB wins came from fights this
   trigger would have abandoned, and the per-seed divergence means
   we cannot name which. The lever trades kills for lives; the
   trade is inside the guard, more comfortably than the pilot.
   One caution on G2's margin: the baseline TB survival on this
   band is only 7.4% (vs the pilot's 15.0%) — the band's baseline
   is harsher, which flatters the gap. The number to cite is the
   absolute armed survival, 22.4%, which also exceeds the pilot's
   18.2%.
4. **Is re-engagement-within-7d the right refind measure now the
   restore is gone, or does G2 alone close the refind half?**
   Re-engagement happened (6/14, 2 same-kind) and is worth
   reporting as description — the fighter did go back — but with
   no restore the beast is fresh, so "refind" is just "fought
   again", the same as any later fight. G2 (survival per TB fight)
   is the cleaner close of the refind half: the fighter lived to
   fight again. Keep re-engagement as a reported number, not a
   gate.

**Denominator note.** The 16-seed interim was THIN (14 fires, one
short) and its G3 ratio (1.19×) was noise from 3 vs 3 kills — the
extension corrected it to 0.68×. The same small-denominator lesson
as the pilot, in the other direction again. 27 fires is a
comfortable denominator, not a bare one; the confirm's numbers are
the ones to cite.

**Instrument note.** The day+mid join double-matched once (92018
d72) and missed once (93020 d97) while still totalling exactly 27
rows with the right death/flee split. A future analyzer should
join on fighter vid + day + mid. The denominator counts fires per
fighter: 92014 d68 contributes three fires in one day, and the
corpus cannot say whether that was one shared party fight or three
separate fights — a fire-per-fight denominator would read lower.
Filed in sim-findings.md.

## §15 / telemetry notes

- `scripts/balance-panel.js` takes no corpus input and offers no
  two-corpus comparison: it installs its own observer into fresh
  live sims under registered policies (default capable, risk-aware,
  socialite, winseek), and `tbretreat-refind` is not in its policy
  set (`--help` errors requiring `--out <panel-directory>`). Running
  it would re-run different policies on different seeds. It was not
  run; no compare `.md` is fabricated. The analyzer's two-leg
  compare on identical seeds
  (`scripts/tbretreat-refind-analyze-20261105.js`, run saved to
  `/tmp/refind-confirm-analyze-24seed.json`) is the before/after
  instrument.
- Telemetry deviation check was attempted and refused, as the
  prereg anticipated:
  `node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-05/perseed-tbretreat-refind-confirm-b/*.json'
  --metrics national,table,wins,exiled` →
  "telemetry-check: refusing recorder-corpus input: all 48
  --current rows carry top-level anchorCommit, so they are sweep
  recorder rows, not runs. Recorder corpora are compared with
  sweep-compare tables, never against a run baseline here."
  No workaround was attempted; the refusal is the result.

## Proof

`node scripts/test-tbretreat-refind-confirm-20261105.js` —
**26/26 PASS** (corpus shape, identical seeds both legs, single
anchor = the prereg commit, zero instrument errors, gates
recomputed from the corpus, zero consumed/sealed pushes, 12/12
zero-fire seeds identical between legs, prereg committed before
the earliest corpus file, confirm seeds in no other prereg, zero
src/js or policy changes, confirm band disjoint from the pilot
band). `node scripts/test-tbretreat-refind-20261105.js` (pilot
proof) re-run green — **42/42 PASS**.

## Base / branch note

Branch: sim-tbretreat-refind-confirm-b. Base: worktree HEAD
2d72f104a, which contains the pilot landing 4a065f050.
`git fetch origin master` succeeded at prereg time;
origin/master is 1a898136c (batch-ship version bump
05d82de89-20261105-172446) and is an ancestor of local HEAD —
the worktree is strictly ahead of origin/master (unshipped
journey + pilot work). The coordinator owns landing and must
rebase/verify against a fresh origin/master at merge time; no
rebase was attempted here.

Corpus: `evidence/2026-11-05/perseed-tbretreat-refind-confirm-b/`
(48 files: 24 seeds × 2 legs). Prereg:
`evidence/2026-11-05/sim-tbretreat-refind-confirm-b-prereg.md`
(committed before any judged sim). Policy:
`scripts/policies/tbretreat-refind.js`. Driver:
`scripts/tbretreat-refind-driver-20261105.js`. Analyzer:
`scripts/tbretreat-refind-analyze-20261105.js`. Proof:
`scripts/test-tbretreat-refind-confirm-20261105.js`.
