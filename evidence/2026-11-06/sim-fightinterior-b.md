# sim-fightinterior-b — fight-interior recorder: per-turn damage trace for wave-4 TB fights — DIAG-NO-GO on D1 (one taxonomy string)

- Run: `fleshout-loop-b-20261106T1430Z`, axis winnability chain
- Arm: `sim-fightinterior-b`, branch `sim-fightinterior-b`, worktree `~/workspace/worktrees/sim-fightinterior-b`
- Band: 51001–51008 (8 seeds, verified fresh — 0 hits in all preregs, all
  evidence .md, no per-seed filenames, no `"seed": 5100x` use in the full
  evidence tree; see prereg)
- Policy: competent verbatim (baseline) vs stageally-armed
  (`scripts/policies/competent-stageally-a.js`, unchanged), 150d
  death-aware horizon, anchor `f9fb3c993`
- Prereg: `evidence/2026-11-06/sim-fightinterior-b-prereg.md` (committed
  `11fdb5c17` before any judged sim)
- Corpus: `evidence/2026-11-06/perseed-fightinterior-b/` (16 files),
  analysis `/tmp/fightinterior-analysis.json` (working copy; this file
  is the record)
- Instruments: `scripts/fightinterior-instrument-20261106.js`,
  `scripts/fightinterior-driver-20261106.js`,
  `scripts/fightinterior-analyze-20261106.js`,
  `scripts/test-fightinterior-20261106.js` (**31/31 PASS** before the
  judged run; 33/33 after the wavesFaced fix — see below)
- Verdict: **DIAG-NO-GO on D1 by one fight (SUBSTRATE-MISSING class,
  per the prereg)** — the staged leg has 1 unclassified wave-4 TB fight
  out of 34, because the engine ends it with tbEnd result `'routed'`
  and the recorder did not normalize `'routed'` to `'rout'`. D2 passes
  (100% trace-present on both legs); the guard holds (staged median
  survival 105d vs baseline 85.5d). The fight itself is fully traced
  (120 verb records, 0 hits) — nothing was dropped; the taxonomy
  missed a string. The verdict is NOT re-scored: D1 as pre-registered
  requires zero unclassified, and the count is 1. The interior
  findings below stand as the arm's deliverable regardless — the
  recorder works, and the next lever is sized.

## The blank this arm fills

Stageally-confirm's next blank (1): what happens INSIDE the wave-4
turn-based fight once company is there — damage, staying, finishing.
Finishprobe sized SOLO levers and rejected them on arithmetic
(generous upper bound flips at most 1/38 lost fights, ceiling 7.5% <
10% GO bar); with company the arithmetic differs (party damage) and
was unmeasured. The live suspects were the rally's round-1 strike
cost, finishing (wounded monsters escaping vs being killed), and the
unexplained 1-round solo Congregation kill (53006 day 149). This arm
built the recorder and measured all three on a fresh band.

## Before / after (identical seeds, 8 + 8)

| Metric | Baseline | Staged | Change |
|---|---|---|---|
| Wave-4 TB fights / traced | 25 / 25 | 34 / 34 | +9 fights reached |
| Wave-4 kills (kill log) | 3 | 6 | ×2 |
| Wave-4 kills (fight endings) | 2 | 5 | pyrrhic kills hide 1 + 1 (see below) |
| TB outcomes (scholar-death / kill / flee / rout / unfinished) | 21 / 2 / 1 / 0 / 1 | 28 / 5 / 0 / 1* / 0 | *the 'routed' fight, D1 miss |
| Ally presence in w4 TB fights | 13/25 (52%) | 23/34 (68%) | +16 pts |
| Party presence in w4 TB fights | 2/25 (8%) | 19/34 (56%) | staged party is in the fight |
| TB survival, fight level (scholar lives) | 4/25 (16%) | 6/34 (18%) | flat |
| Median rounds survived | 5 | 6 | +1 round |
| Beast HP at end (median frac of max) | 0.692 | 0.478 | the party bites deeper |
| Median damage/round, player side | 18 | 28 | +10/round |
| Median damage/round, monster side | 22 | 17 | −5/round |
| Scholar damage/fight (median) | 53 | 79 | |
| Ally damage/fight (median) | 0 | 26 | |
| Monster damage/fight (median) | 114 | 112.5 | |
| Scholar strikes/fight (median) | 2 | 2.5 | |
| Fights with zero scholar strikes | 7/25 | 9/34 | |
| Field wave-4 fights / kills | 17 / 0 | 25 / 0 | control channel still 0 |
| Rally fires (ok) | 0 | 23 | |
| Median survival (guard) | 85.5d | 105d | +19.5d — guard holds |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | no win either leg |
| Wave 4 unlocks / faced | 5 / 5 | 5 / 5 | |
| Wave 5 unlocks / faced / kills | 0 / 0 / 0 | 0 / 0 / 0 | the door never opened |
| Readiness-5-ready days | 0 | 1 | one pair day, 51005 d66 (see below) |
| Instrument errors | 0 | 0 | |

## Primary metric (binding)

- D1 classification completeness: baseline 25/25 rows classified
  (unclassified 0); staged 33/34 (unclassified 1). **MISSED.**
- D2 per-turn trace present ≥ 90%: baseline 25/25 (100%), staged
  34/34 (100%). **PASSED.**
- G-survival: staged median 105d ≥ baseline 85.5d − 10d. **PASSED.**

The one unclassified fight: 51006 staged, day 105, Strike, 121
rounds, entry HP 1000, mHpLeft 1000, 0 hits. The engine ended it
with tbEnd result `'routed'` — a result string the recorder's
`closeTrace` did not normalize to `'rout'` (it mapped only `'won'`,
`'lost'`, `'fled'`, `'unfinished'`). The trace is complete: 120
consecutive failed `move` verbs to (7,1) after one successful move
to (8,0) — the competent policy looping a failed move for 120 rounds
against Strike's shutdown grid (see the backlog entry). The D1 miss
is a one-line normalization gap in the recorder, not a dropped fight
and not a lever failure. Fix named for the next run (see Metric
review); the verdict stands as NO-GO per the prereg.

## The interior, in plain words

**The rally costs nothing.** The live suspect is dead, measured: the
scholar's round-1 damage is 0 in 59/59 fights on BOTH legs, and 0
fights on either leg have a scholar round-1 strike. Round 1 is a
closing round — the scholar moves, never strikes — so the rally's
`p.acted` displaces a move, not a strike, and the scholar moves after
rallying anyway (the day-107 kill trace: rally round 1, move round 1,
move round 2, strikes rounds 3–11). Median round-1 player damage is
0 with a rally and 0 without one; rally fights show 0 scholar strikes
in the rally round in 23/23 fights, exactly as the engine promises.
Whatever is losing these fights, the rally's strike cost is not it.

**The fight is a damage race the party loses about fourfold.** With
company, the party deals a median 28 damage per round against a beast
that enters at a median 709 HP — about 25 rounds to kill it — and
survives a median 6 rounds. The monster deals a median 17 per round
against a scholar with 100 HP — dead in about 6 rounds. Without
company it is worse: 18 per round against 850 entry HP (~47 rounds
needed) over 5 survived rounds. The party bites deeper with company
(beast ends at 48% of max HP staged vs 69% baseline) and lives a
round longer, but the race is still lost by a factor of four. That is
the interior: not a finishing problem, not a rally problem — a
damage-per-round problem against a survival-time problem.

**Allies strike when they are there.** 189 of 245 ally turns land a
damaging strike (77%), 2,669 total ally damage on the staged leg.
The "ally dealt 0" fights are almost all fights with no ally in them
(11 of 12 staged zero-ally-damage fights had 0 allies at entry). The
one exception: 51002 day 90, Suburb, 1 ally, 3 turns, 0 damage. The
company is not idle; there just is not enough of it, and it does not
live long enough — the same race, from the ally side.

**The scholar barely strikes.** A median 2–2.5 strikes per fight
over 5–6 rounds, and 7/25 baseline and 9/34 staged fights have ZERO
scholar strikes. The verb mix is movement-heavy (staged: 214 moves
vs 111 strikes; abilities 34, of which rage 27). Excluding the
121-round Strike standoff, staged moves fail 22/95 (23%) vs baseline
31/82 (38%) — no staged-specific movement crisis; the failed-move
flood is one stuck fight, not a pattern.

**Finishing is not the bind.** mFlee is 0 again (reproduces
finishprobe's 0/57 on this band's 59 fights). No fight ends with the
beast nearly dead and escaping; lost fights end with the beast at a
median 48–69% of max HP. The near-miss the taxonomy was built to
catch does not exist here either.

## The seven kills (damage anatomy from the traces)

| Seed/leg | Day | Monster | Rounds | Entry HP | Scholar dmg | Ally dmg | Monster dmg |
|---|---|---|---|---|---|---|---|
| 51001 staged | 123 | Eater | 19 | 706 | 683 | 29 | 82 |
| 51002 staged | 88 | Strike | 11 | 750 | 536 | 234 | 0 |
| 51005 baseline | 70 | Influencer | 12 | 850 | 850 | 53 | 99 |
| 51005 staged | 66 | Reunion | 5 | 123 | 138 | 16 | 53 |
| 51005 staged | 107 | Strike | 12 | 655 | 404 | 260 | 0 |
| 51007 baseline | 86 | Strike | 8 | 750 | 834 | 0 | 0 |
| 51007 staged | 77 | Influencer | 9 | 615 | 337 | 298 | 49 |

Kills are scholar-led: the scholar dealt 337–850 of entry HP in
every kill; allies contributed 0–298. Two of seven are vs Strike,
the monster that never attacks (consistent with finishprobe: both
its kills were vs Strike). One kill is a companion kill: 51005 day
107, Strike, killed by visjoin_83 (260 of 655) while the scholar
struck every round rounds 3–11 — the staged fight working as
designed: rally, close, grind together, ally lands the last blow.

**The 53006-day-149 shape did not reproduce.** No 1-round kill on
this band; the anomaly flag fired once, for the 51005 day-66
Reunion kill — a beast that entered at **123 HP** (wounded entry,
almost certainly lifted from the field grind: the same Reunion was
fought day 64 at 3380 entry, day 65 at 1778 and 2805) and died in 5
rounds to 154 total damage. Wounded-entry kills happen; fresh-entry
one-round kills do not appear. The 53006 shape is most likely a
deeply-wounded entry, not a one-shot — the trace answers the
question's shape, even though the exact seed-53006 fight is not
reproduced. The backlog entry carries the update.

**One pair day, and it lasted one day.** 51005 staged: greta_hansen
killed a Reunion day 65 (pyrrhic — see below), gen_g5z4p7p killed a
Reunion day 66, and the day-66 readiness snapshot reads veterans 2 —
a living pair, the stageally-confirm primary, for exactly one day.
gen_g5z4p7p died day 67 (the day after their kill); greta died day
74. The pair forms and is gone within a week, the same first-killer
survival bind the confirm measured (median 9.5d). The third kill on
the seed (day 107, Strike, by visjoin_83) came 41 days after the
pair died — no overlap, no pair.

## Stage-2-style sizing of the next lever (finishprobe shape)

For each LOST wave-4 TB fight, the generous upper bound is "the party
dealt its best observed damage-per-round on EVERY round it survived,
plus one aimed strike at 2.5x that round's damage" — zero movement,
zero misses, full survived rounds granted:

- Baseline: 1 flip of 22 lost fights; ceiling kill rate 12%
  (2 kills + 1 flip / 25). The solo bound, reproduced: below the 10%
  GO bar only by the thinnest margin, and the flip (51002 day 93
  Reunion, bound 2562 vs entry 2417, a 6% margin on a multi-monster
  2417 entry) is not a lever.
- Staged: **7 flips of 28 lost fights; ceiling kill rate 35.3%**
  (5 kills + 7 flips / 34). The flip rows: 51001 d141 Influencer
  (558 → 769, 12 rounds, best 53); 51002 d89 Suburb (975 → 2475, 25
  rounds, best 90); 51002 d90 Suburb (372 → 446, 11 rounds, best
  33); 51005 d61 Eulogy (675 → 1193, 5 rounds, best 159); 51005
  d106 Eulogy (550 → 1163, 5 rounds, best 155); 51007 d79
  Influencer (841 → 1645, 9 rounds, best 143); 51007 d102 Eater
  (658 → 978, 6 rounds, best 115).

**The lever the interior points at: party damage per round — hold
ground and strike together every round the party survives** (the
finishprobe P3 build — hold-ground + cascade extension — but with
party damage in the numerator, which is what makes the ceiling move:
7.5% solo → 35.3% with company). The ceiling clears the 10% GO bar
by a wide margin, so the lever is worth piloting — with the honest
caveat that the bound is generous to the point of unattainable: the
best rounds (143–159) are likely rage/outlier rounds that cannot
repeat every round, and the bound grants full survived rounds while
the party's actual strike rate is ~2.5 strikes per scholar-fight.
Size the pilot's GO against the ceiling, not against the bound: a
pilot that moves the kill rate from 5/34 toward even half the
ceiling would be a real move. Survival time is the co-lever: the
same bound with +2 survived rounds flips more fights than +damage
alone on the long fights (the 25-round Suburb flip is a survival
story, not a damage story). No gate, price, or deed change is
proposed. No policy was built here; the next run builds it.

## Wall numbers

| Seed | Baseline (days, end, w4k) | Staged (days, end, w4k) |
|---|---|---|
| 51001 | 138, lost, 0 | 143, lost, 1 |
| 51002 | 88, lost, 1 | 107, lost, 1 |
| 51003 | 50, lost, 0 | 50, lost, 0 |
| 51004 | 30, lost, 0 | 30, lost, 0 |
| 51005 | 83, lost, 1 | 150, survived, 3 |
| 51006 | 150, survived, 0 | 115, lost, 0 |
| 51007 | 101, lost, 1 | 103, lost, 1 |
| 51008 | 70, lost, 0 | 70, lost, 0 |
| **Band** | **median 85.5d** | **median 105d** |

Wins 0/8 both legs, national 0/8 both, table 0/8 both, wave-4
unlocks 5/8 both, wave-4 faced 5/8 both, wave-5 unlocks 0/8,
wave-5 faced 0/8, readiness-5-ready days 0 baseline / 1 staged,
living wave-4 killers at end 0/8 baseline / 1/8 staged (51005,
visjoin_83, alive at the horizon).

## Village assessment (plain words)

Eight villages, five reached the fourth wave on each leg, none won,
none opened the fifth wave's door. The villages are not losing
because their fighters run away or because the monsters slip off —
the monsters stand and fight, and the fighters stand and die, now
with friends beside them. A village sends its best person out with a
friend or two against a beast with ten times their health, the line
is rallied, and they land a couple of good hits each and then die in
about six rounds — the beast still standing at half health. Twice,
against the one beast that never fights back, a fighter and a friend
had the time to wear it down together and came home. Once, a village
banked two living killers for a single day before both were dead
within the week. The road to the full seat is blocked in the fight
itself: the party deals about a quarter of a beast's health before
it dies, and no amount of rallying changes the arithmetic — the next
lever has to make the party hit harder, together, for longer, or the
funnel stays where it is.

## Sense-test read

**One rallied fight — 51005 day 107, the Strike kill (staged).**
The rally line reads like a person taking charge, and this time the
fight that follows reads like the design working: *"You plant your
feet and ROAR the line back together — 'ON ME! ON ME!' Fear drains
out of their faces. 'THE STRIKE — TOGETHER!' They turn as one."*
Then the trace shows the scholar striking every round rounds 3–11
and the ally visjoin_83 striking every round rounds 2–12 for 22–26
damage each — a grind, not a slaughter, ending in a companion kill.
The fiction and the numbers agree for once.

**One rally that died — 51005 day 61–66, the Eulogy/Reunion
sequence.** The same Reunion was rallied against on days 62 and 64
(*"THE REUNION — TOGETHER!"* twice in three days) and killed on day
66 — by then a different scholar, after succession, against a beast
ground down to 123 HP. The rally lines repeat verbatim across days
and monsters (only the name changes) — the same canned-line pool the
confirm flagged for party accepts. The line works once; the fourth
time it is wallpaper.

**One death on kill day — 51005 day 66.** Carlos Fernandez died the
day the village killed its second wave-4 beast. The transcript gives
him a proper burial beat — *"Carlos Fernandez is dead — the wild.
The village stops. Somebody screams. Somebody else starts
digging."* — and the grave is filled by morning. The kill and the
death share a day and the game says so honestly. The System's
"veteran kill" announcement, meanwhile, keeps firing for wave-3
kills (Redactor d40, Ad Break d47, Chorus Line d51 on this seed) —
third sighting of the mismatch the backlog already holds; not
re-filed.

## Metric review

- **D1 missed by a taxonomy string, not by a dropped fight.** The
  preregged set {kill, rout, scholar-death, scholar-flee, unfinished}
  does not contain the engine's own tbEnd result `'routed'`. The
  fix is one normalization line in `closeTrace` (`'routed'` →
  `'rout'`) for the next run. The verdict is not re-scored: D1
  requires zero unclassified and the count is 1.
- **'Unfinished' conflates two shapes.** The baseline's one
  'unfinished' fight (51002 day 80, Strike, 21 rounds, beast at 0
  HP) is a pyrrhic kill: the scholar killed the beast and died in
  the same fight, and the fight never closed through tbEnd. The
  kill is in waveKillLog; the fight-level ending hides it. The next
  recorder should split 'unfinished' (village died mid-fight vs
  kill-logged-but-never-closed) and wrap the pyrrhic attribution
  path (`src/js/game.js` ~34015, called from ~45849), which writes
  waveKillLog directly and bypasses `recordWaveKill` — the
  instrument's only kill hook. On this band 2 of 9 wave-4 kills are
  pyrrhic and invisible to the killsLive wrapper (greta d65 Reunion
  + the 51002 Strike). Fight-level kill counts undercount the log
  by that many (baseline 2 vs 3, staged 5 vs 6).
- **The wavesFaced read was wrong and is fixed.** The first analyzer
  read `wavesFaced[4]`/`[5]` and reported wave-4 faced 0/8 on both
  legs while 59 wave-4 TB fights stood in the corpus. wavesFaced is
  a per-TYPE map (monster id → count); the analyzer now counts
  distinct faced types per wave from `src/data/monsters.json`
  (corrected: faced 5/8 both legs). The underlying data is unchanged;
  only the read is fixed. Proof gained 2 fixture checks (33/33).
- **Rally cost as defined may be the wrong question.** The prereg
  framed rally cost as round-1 damage foregone; the measurement
  shows round-1 player damage is 0 with and without a rally. The
  right cost question for the next run is whether the rally's
  action displaces a round-1 move that matters (positioning), not
  a strike — the trace shows the scholar moves after rallying, so
  even that looks free, but the sample is one band.
- **The sizing bound's best round needs its own instrument.** The
  flip rows' best rounds (143–159) are single-round spikes; the
  bound repeats them every round. Whether a best round is
  repeatable (rage + full-party focus fire) or a one-off (a crit
  cluster, a wounded-entry round) decides whether the 35% ceiling
  is reachable or fantasy. The next lever's pilot should record
  best-round composition, not just the bound.
- **No metric was swapped, re-cut, or re-thresholded after the run.**
  The wavesFaced fix changes secondary wall numbers only (faced
  0 → 5); the primary (D1/D2) and the guard are untouched by it.
  The Stage-0 smoke (55002 baseline + staged, 90d, /tmp) is the
  proof's live leg, unjudged, not evidence.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js`: `--help` refuses with the pilot's error
  (`Error: --out <panel-directory> required`). The tool runs its own
  full panel and takes no corpus input, so it cannot compare
  competent vs stageally on identical seeds. No Game-root change
  exists in this arm (policy A/B on identical seeds is the
  comparison), so no compare `.md` is fabricated — same outcome as
  the pilot and the confirm. The matched-seed paired comparison is
  the analyzer output above (identical seeds, both legs, same
  instrument).
- `scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-06/perseed-fightinterior-b/*.json' --metrics
  national,table,wins,exiled`: REFUSED — "refusing recorder-corpus
  input: all 16 --current rows carry top-level anchorCommit, so they
  are sweep recorder rows, not runs." Recorded as the result, same as
  every prior killer-chain arm. No telemetry deviation check was
  possible on this corpus; the wall numbers above are the
  instrument's own. The WINSEAT baseline regime note was checked
  first: no pre-seat comparison is claimed anywhere here.

## What this arm does NOT claim

- Not a lever: no policy was built, no pilot was spent, no
  gate/price/deed change is proposed. The sizing names the next
  lever; the next run builds it.
- Not a kill of the stageally NO-GO: the confirm verdict stands as
  measured on its band. This arm measures the interior the NO-GO
  pointed at; on this fresh band the armed leg killed more (6 vs 3)
  while still losing 28 of 34 TB fights.
- Not a pair: the one pair day (51005 d66) lasted one day; the pair
  is not banked, and readiness-5 still never released.
- Not a field-fight fix: field fights killed 0 wave-4 monsters on
  both legs; every kill came from a turn-based fight.
- Not a rally failure: rally fired 23/23 times when its condition
  held, the rally round cost zero scholar strikes (there were none
  to lose), and the one staged fight that worked perfectly was a
  rallied grind. The rally works; the damage race after it does not.
- Not an explanation of the 53006-day-149 kill: no 1-round kill
  occurred on this band. The nearest shape (wounded-entry kill at
  123 HP) suggests the 53006 beast entered deeply wounded, but that
  is an inference about shape, not a reproduction.
- The Stage-0 smoke and the proof legs are not evidence; only the
  judged 8+8 legs above are.

## Next blanks (for the loop, not this arm)

1. **Party damage per round (the sized lever)** — hold-ground +
   strike-together every round, with the finishprobe P3 cascade
   extended to the party; pilot GO against the 35% ceiling, with
   best-round composition recorded. Survival time is the co-lever
   (the 25-round Suburb flip is a survival story).
2. **First-killer survival** — the pair day lasted one day; the
   killer died the day after the kill. Unchanged from the confirm.
3. **Pyrrhic-kill instrumentation** — wrap the pyrrhic attribution
   path or read waveKillLog at tbEnd, so fight-level kill counts
   stop undercounting the log (2 of 9 here).
4. **The 'routed' normalization** — one line in closeTrace; the
   recorder's taxonomy must contain every tbEnd result string the
   engine emits.
5. **The 121-round Strike standoff** — the competent policy loops a
   failed move for 120 rounds against a shutdown grid (backlog).

## Proof and commits

- Proof `scripts/test-fightinterior-20261106.js`: 31/31 green on this
  worktree before the judged run (fixtures + live legs to /tmp:
  wave-4 traces with hits/turns, all classified, zero instrument
  errors, determinism byte-identical, neutrality off-vs-on, staged
  rally fires and is traced). After the wavesFaced analyzer fix the
  proof is 33/33 (2 new fixture checks); re-run green on the final
  tree before this evidence was committed.
- Prereg committed `11fdb5c17` before any judged sim. The safe-commit
  index clobber hit on the prereg commit and the instrument commit
  (files shown staged-as-deleted after correct commits); repaired
  with HEAD-blob cacheinfo each time, verified `git status` empty +
  `git diff HEAD` empty + hash-object matches.
- Judged corpus: `evidence/2026-11-06/perseed-fightinterior-b/` (16
  files, 8 baseline + 8 staged), all with 0 instrument errors.
  Analyzer output saved at `/tmp/fightinterior-analysis.json`
  (working copy; the evidence file above is the record).
- Stage-0 smoke: 55002 baseline + staged, 90d, to /tmp (traces
  present, rally fires, 0 errors) — unjudged, not evidence.

## Convergence

**scale-onramp / winnability chain: converging, NOT converged.** The
fight-interior recorder works — 59/59 wave-4 TB fights traced,
100% trace-present, 0 instrument errors — and the interior it
records is now measured: company lifts damage per round (18 → 28)
and bites the beast deeper (69% → 48% of max HP left), but the
party still needs ~25 rounds to kill what kills it in ~6, and the
rally costs nothing because round 1 was never a strike round. The
next lever is sized, not guessed: party damage per round, ceiling
35% against the 10% bar. The recorder itself misses DIAG-GO by one
taxonomy string — a one-line fix for the next run, not a reason to
re-run this band.
