# sim-fieldguard-a — nearly-dead-entry guard for FIELD fights (axis scale-onramp)

Run: fleshout-20261025T0730Z (Sun 2026-10-25). Axis: scale-onramp
(converging). Arm: sim-fieldguard-a, the survivability companion
measured SEPARATELY from any finish lever, never bundled with one.
This arm and sim-oneshotcap-a are ALTERNATIVES, not stackable — at
most one lands this run. The coordinator picks the landing arm; this
file reports GO or KILLED plainly.

## PRE-REGISTRATION (binding — judged only against this)

- Question: does keeping nearly-dead villagers out of FIELD fights
  cut field villager deaths without breaking raid defense, the break
  line, or the scale-wall band?
- Substrate (shared): scripts/policies/tableseat-nowait.js
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, no wait leg). Seeds
  73671–73678, 180d death-aware horizon (dead villages stop, +10d
  tail max). Control = the same sweep run on unguarded code (a
  second registered worktree at the identical base commit, see
  "Control" below) — never judged against a stale baseline.
- THE GUARD (exact rule, documented here and in code):
  a villager whose HP is below 15 on the 100-point villager scale
  fieldFight itself uses (vHpMax = max(100, vHp), so below 15 HP is
  below 15% here) does not enter a FIELD fight — they withdraw
  before round 1, dealing 0 and taking 0, and the monster stays
  where it was. Behavioral protection, NOT a stat buff, NOT a
  break-line change, NOT a finish lever.
  - The line is deliberately NOT the wave-dependent monster break
    line (0.15 wave>=2 / 0.25 wave 1): the mechanism deaths were all
    at 6–11% HP, and a wave-1 0.25 line would pull villagers at 20%
    HP who were never observed dying this way. Conservative scope.
  - Implementation is a flag, not a context guess: fieldFight fires
    the guard ONLY when the caller passes opts.fieldguard. The two
    field call sites that pass it are (1) resolveWildMonsterEncounter
    on the non-raid, non-aid wild path (game.js) and (2)
    expeditionMonster (villager-agency.js). Raid defenders
    (opts.raid), aid-crisis fights, arena (noFlee), contests (seeded
    rng), sorties, alien fights, and patrols never pass the flag —
    the raid flag does not survive into fieldFight, which is why
    the flag, not a context check, is the gate. The scholar
    (vid === villagerId) is never guarded. Allies do not override
    the guard: a nearly-dead villager does not stand in the fight
    even with company.
  - A withdrawal returns outcome 'vWithdraw' (rounds 0, vTaken 0,
    mDealt 0). The wild router handles no branch for it on purpose:
    no wounds, no trust, no kill, no deed; fieldFightSummary
    narrates it ("slipped away, too hurt to stand and fight") so
    the action is never silent. The expedition router has an
    explicit vWithdraw branch (encounter note only — no knowledge,
    no tracking XP, no scar, no wound, expedition not cut short);
    without it a withdrawal would have fallen through to expedHurt.
  - NOT covered, stated plainly: patrol meetings (game.js
    resolvePatrol) carry no flag — on the 0644Z band they produced
    zero direct fight rows with a world entity (all 238 direct rows
    were expedition meetings, m == null), so patrol coverage was
    not needed to judge this band, but a band where patrols fight
    would need its own site. Sorties against lingering raiders are
    raid-adjacent and are deliberately NOT guarded.
- Pilot GO requires ALL of:
  - PRIMARY: kind-filtered field villager deaths <= 9 (control 12,
    >=25% cut). Deaths MUST be kind-filtered (person/villager,
    non-scholar); mixed harness totals are forbidden for cost bars.
  - One-round field deaths at <15% entry HP <= 2. Counting:
    fight rows (resolve field + direct field) with outcome 'vDie',
    rounds == 1, vHpStartFrac < 0.15. Judged against the control
    recount printed by the analyzer, not the historic "6 of 9".
  - Cost: wins-excluded median >= 180d (all-runs median alongside),
    national-ever >= 6/8, wave-4-or-win >= 5/8 (a win that skips
    wave-4 passes the guard), kind-filtered raid villager deaths
    <= 2 (control 1).
  - No deferred-death shift: starvation + sickness villager deaths
    <= control recount + 2 (counted off the raw harness death
    list, kind-filtered, cause-matched — see analyzer).
  - Directed probe: a scripted field meeting with a below-break-line
    villager must show the guard firing (withdrawal before round 1).
    Probe failure = mechanism unproven = NO-GO even if band numbers move.
- If pilot GO, confirm on 12 fresh seeds 73679–73690, same
  policy/horizon, pro-rata legs (field <= 13, one-round <15% <= 3,
  wins-excluded median >= 180d, national-ever >= 9/12,
  wave-4-or-win >= 8/12, raid villager deaths <= 3,
  starvation+sickness <= confirm-control recount + 3), with the
  confirm control run on 73679–73690 too — never judged against
  the pilot baseline.
- If KILLED at pilot, revert ALL game-code changes so the tree is
  clean, do NOT merge, report the kill with numbers.
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law).
  No haven/raid canon doc exists (noted by the 0644Z run) — the raid
  design lives in src/js/havenGrowth.js comments, which this arm
  preserves (raid path untouched, proven by probe P3 and the raid
  cost leg). No doc covers the fieldguard itself; the design above
  is this arm's, documented here, not canon invented from scratch.
- Balanced panel (§15): attempted as a compare; per-seed recorder
  corpora are not panel pairs (the known third-sighting ingestion
  failure class from 0644Z). The sweep-compare table in this file
  (identical seeds, control vs armed) is the comparison; the panel
  tool's outcome is reported, never used as a verdict input.

## CONTROL (replicated first, judged nothing until it matched)

Control = scripts/test-deathcensus-diag-sweep.js run in a second
registered worktree (sim-fieldguard-ctrl) at the IDENTICAL base
commit 6e7dbe528, unguarded code, recorder only. Its armed rows were
renamed s<seed>-control.json in the corpus dir; its baseline rows
s<seed>-controlbaseline.json; its summary summary-control.json.
Replication vs published 0644Z controls — ZERO mismatch:

| Headline | Published 0644Z | Control re-run |
|---|---|---|
| national-ever | 8/8 | 8/8 |
| national-final | 7/8 | 7/8 |
| table invited / entered | 5 / 4 | 5 / 4 |
| wins (lesser seat only) | 4/8 | 4/8 |
| wave-4 / wave-5 | 5/8 / 0/8 | 5/8 / 0/8 |
| kind-filtered villager deaths | 27 | 27 |
| field / raid / arena / tb / other | 12 / 1 / 1 / 1 / 12 | 12 / 1 / 1 / 1 / 12 |
| recorder gates G2 / G3 | PASS / PASS | PASS / PASS |

Control recounts (the judging baselines, from the analyzer, not the
historic prose): one-round <15% field deaths = TBD (see verdict);
starvation+sickness villager deaths = TBD. The historic mechanism
count ("6 of 9 one-round field deaths at 6–11%") counts resolve
rows only in prose; the analyzer counts resolve + direct rows, so a
recount of 6 or 7 is consistent, not a mismatch — the arm is judged
against the recount either way.

## DIRECTED PROBE (scripts/test-fieldguard-probe.js)

Binding cases, all PASS on seed 73671:
- P1 resolve, wild, villager at 7 HP -> 'vWithdraw', 0 rounds,
  0 taken, 0 dealt, HP unchanged at 7. Guard fires.
- P2 resolve, wild, villager at 50 HP -> real fight (vFlee, 1 round).
- P3 resolve, RAID, villager at 7 HP -> NOT withdrawn (vDie, 1 round
  — stark, and correct: raid defense is out of this guard's scope
  by design; a raid defender at 7 HP still fights).
- P4 fieldFight, flag on, 7 HP -> 'vWithdraw'.
- P5 fieldFight, flag off, 7 HP -> NOT withdrawn (vDie).
- P7 fieldFightSummary for 'vWithdraw' -> "Mara slipped away from
  the hushwolf, too hurt to stand and fight."
- P6 expedition meeting at 7 HP: SKIP on the probe harness (fresh
  setupGame has no agency exped state — expeditionMonster throws
  reading encounters). NOT a binding failure: the probe's field
  meeting is P1, and the expedition site is proven in the wild by
  direct (expedition) 'vWithdraw' rows in the armed corpus — see
  verdict. If the armed corpus shows zero direct withdrawals, the
  expedition site is unproven and that gap is reported, not hidden.

## VERDICT: KILLED at pilot — NO-GO on ONE leg (the median leg)

GO required ALL legs. Seven pass, one fails, and a miss is NO-GO,
never re-scored mid-run. The lever does NOT land. Game code is
reverted in this tree (see "Kill procedure"); this commit, if the
coordinator keeps it at all, is a kill record only — zero game-code
changes. The coordinator picks sim-oneshotcap-a on its own merits;
nothing from this arm stacks with it.

| Pre-registered leg | Control | Armed | Verdict |
|---|---|---|---|
| PRIMARY field villager deaths <= 9 | 12 | 6 | PASS (50% cut) |
| One-round <15% field deaths <= 2 | 6 (recount) | 0 | PASS |
| Wins-excluded median >= 180d | 180d | 158d | **FAIL** |
| National-ever >= 6/8 | 8/8 | 8/8 | PASS |
| Wave-4-or-win >= 5/8 | 6/8 | 8/8 | PASS |
| Raid villager deaths <= 2 | 1 | 2 | PASS (at cap) |
| Starvation+sickness <= control+2 | 6 | 7 | PASS |
| Directed probe (binding cases) | — | P1–P5, P7 PASS | PASS |
| Guard fired in sweep | 0 | 12 rows | PASS |

The analyzer's counting (scripts/test-fieldguard-analyze.js, one set
of definitions for both corpora): control n=8, armed n=8.
One-round <15% recount = 6, exactly the historic "6 of 9" (9
one-round field deaths, 6 below 15%) — no recount discrepancy to
explain. Starvation+sickness: control starv 3 + sick 3 = 6; armed
starv 2 + sick 5 = 7 (sickness up 2, inside the +2 allowance, no
deferred-death shift beyond it). Armed recorder gates: recorder
errs 0; armed G2 (guard baseline vs guard armed, recorder
neutrality inside guarded code) 8/8 identical on days/gameDays/ts/
starvation/death-list. Mixed death totals (forbidden for cost bars,
shown only to prove they were NOT used): control 261, armed 272 —
the rise is monster + scholar deaths on diverged trajectories, not
villager blood (villager deaths fell 27 → 20).

Why the median leg failed, stated without re-scoring it: the
wins-excluded pool shrank from 4 villages to 3, because seed 73675
flipped from dying at 180d (control, never entered) to winning at
94d (armed, entered, won) — a win REMOVES a 180d village from the
pool. The remaining three non-winners are 73671: 93d, 73676: 158d
(control 174d), 73674: 180d; their middle value is 158d. The leg as
written cannot distinguish "villages dying earlier" from "a village
leaving the pool by winning" at n=3 — that is a metric-review note
for the NEXT run's pre-registration (see below), not a reason to
pass this run. The fail is robust to the median definition: lower
median, mean, and upper median all put armed below control.
Per-seed armed: 73671 93d lost, 73672 100d won, 73673 97d won,
73674 180d lost, 73675 94d won, 73676 158d lost, 73677 98d won,
73678 150d won. Wins 5/8 (control 4/8), national-final 8/8
(control 7/8), entered 5/8 (control 4/8), wave-5 0/8 both, max arc 4
both. The guard did not hurt reach — it failed a survival-cost leg
whose denominator it shrank by winning.

Armed-sweep completeness note (stated, not hidden): the armed sweep
process ended after writing 73677-armed, before 73678-armed and its
summary.json; the cause was not established from the available
output (the piped tail output was lost when the background session
closed). The missing seed was re-run singly (runOne armed 73678)
and verified (G2-consistent with its guard baseline), so the judged
corpus is complete 8/8 on both sides. There is no armed summary.json;
the analyzer output in this file and the G2 check are the complete
judged record. No number above depends on the missing summary.

Kill procedure (done in this tree): the guard diff was saved as
evidence/2026-10-25/perseed-fieldguard-a/fieldguard-reverted.patch
(a record for any future revisit, NOT live code), then
`git checkout HEAD --` src/js/fieldFights.js src/js/game.js
src/js/villager-agency.js (verified: `git diff` empty for src/,
zero FIELDGUARD matches in all three files afterwards), then
committed evidence + corpus + proof scripts only, with no
game-code change.
Control tree sim-fieldguard-ctrl released unmerged (it carried no
work of its own; its rows live in this corpus).

## SWEEP-COMPARE TABLE (identical seeds, control vs armed)

| Metric | Control (unguarded) | Armed (guard) |
|---|---|---|
| won / national-ever / national-final | 4/8 / 8/8 / 7/8 | 5/8 / 8/8 / 8/8 |
| table invited / entered | 5 / 4 | 5 / 5 |
| wave-4 / wave-5 / max arc | 5/8 / 0/8 / 4 | 5/8 / 0/8 / 4 |
| median survival, all runs | 150d | 100d (win-shortened: 5 wins) |
| median survival, wins excluded | 180d | 158d |
| kind-filtered villager deaths | 27 | 20 |
| field / raid / arena / tb / other | 12 / 1 / 1 / 1 / 12 | 6 / 2 / 0 / 0 / 12 |
| one-round field deaths (<15% of them) | 9 (6) | 3 (0) |
| guard withdrawals (resolve / direct) | 0 | 12 (10 / 2) |
| raid fights / raid kills / raid deaths | 342 / 20 / 1 | 307 / 21 / 2 |
| defender mFlee below-line survivors | 297 | 248 |
| field wave-3+ fights (from census) | 87 fights, 0 kills, 6 deaths | see corpus |
| starvation / sickness villager deaths | 3 / 3 | 2 / 5 |

Balance-panel compare: attempted. `balance-panel.js compare`
requires `--before/--after panel.json.gz` pairs; per-seed recorder
corpora are not panel pairs — the known third-sighting ingestion
failure class from 0644Z, reproduced here as an interface mismatch
(not a data verdict). The table above is the comparison; no panel
file is attached and no verdict input came from the panel tool.

## VILLAGE ASSESSMENT (plain words)

The guard did exactly the job it was built for, and the villages
still did not clear the bar the run set for them. On the guarded
band, no villager died in a field fight while nearly dead — the
six nearly-dead deaths from the census are gone, replaced by twelve
withdrawals: hurt villagers slipping away instead of standing
there to be finished. One more village won, one more held its
national seat to the end, and the table took one more villager
through its door. But the villages that still died died a little
earlier on average, and the run's own rule says that is enough to
stop — even though part of that average is a village that stopped
being counted as "died" because it won instead. The raid fights
stayed honest: two villagers died defending the palisade, both
healthy, both in real fights, and the defense still killed 21
raiders. The wave-4 monsters still flatten healthy villagers in a
single blow, the belltoads still kill villagers who never land a
hit, and nobody reached wave 5 or the full seat. The guard is a
real protection for exactly one kind of death, and this run's bar
says one kind of death is not enough to land it on its own.

## SENSE-TESTING (transcript, on the armed trajectory)

Read from the armed fight rows (the recorder's awayNews tap was not
armed in the sweep, so no awayNews line is quoted from the sweep;
the withdrawal sentence is quoted from the directed probe, same
code path, same summary function):

> "Mara slipped away from the hushwolf, too hurt to stand and fight."
> (probe P7 — the exact sentence the wild router narrates for a
> guard withdrawal.)

Judged as stories, not counts:

- Ethan vs the ad_break (73672, days 56–57): in the control he died
  at 9% HP on day 56. On the guarded band he withdrew from the same
  monster at 9% on day 56 (twice) and at 12% on day 57 (three times)
  and lived. Five withdrawals read as one coherent episode — a hurt
  villager and a lingering monster meeting again and again, the
  villager refusing the fight every time. The repetition is the
  honest price of "the monster stays": the guard does not make the
  monster leave, so a hurt villager near a lingering monster will
  withdraw repeatedly until they heal or it wanders. Sensible, not
  broken — but a future design note (see blanks).
- The saved, then lost in defense (73675 day 30 → day 34; 73674 day
  17 → day 134): two villagers withdrew hurt in the field and later
  died in raid fights at 76% and 91% HP, in 3- and 5-round fights.
  This is the guard's moral shape, stated plainly: it does not grant
  immortality, it moves the death to a fight the village chose.
  A villager who lives through the field because they were too hurt
  to fight can still die at the palisade healthy, fighting. That is
  not a guard failure — raid defense is out of scope by design —
  but it is why the villager-death total fell only 27 → 20 while
  field deaths halved.
- The remaining field deaths (6, all at >=23% HP): Ursula flattened
  by a wave-4 eater at 87% (103 in one round — the one-shot class,
  untouched by design); Priya's even 4-round fight (51 dealt / 50
  taken — a fight she could plausibly have survived, the companion
  the oneshot arm is aimed at); the belltoad pair (0 dealt over
  2–3 rounds — still unexplained, still the open mechanism
  question). Nothing in the remaining deaths reads as a guard
  misfire: the line held, and what is left is the other kind of
  death this arm never claimed to cover.

## INSTRUMENT NOTES

- New: scripts/test-fieldguard-probe.js (directed probe, P1–P7),
  scripts/test-fieldguard-analyze.js (GO-leg analyzer, one set of
  definitions for both corpora).
- Reused unchanged: scripts/policies/deathcensus-diag.js (recorder),
  scripts/test-deathcensus-diag-sweep.js (sweep driver, EVID env).
- Game-code change (3 files, flag-gated): src/js/fieldFights.js
  (guard + summary line), src/js/game.js (resolve flag),
  src/js/villager-agency.js (expedition flag + vWithdraw branch).
- Corpus: evidence/2026-10-25/perseed-fieldguard-a/ (control rows,
  armed rows, both summaries — in the worktree evidence dir, never
  /tmp). Control tree sim-fieldguard-ctrl is released unmerged
  after the run (it carries no work of its own; its rows live here).
- Targeted checks: probe P1–P5, P7 PASS (P6 SKIP, see probe section);
  check.js --only fieldfight timed out at its 120s harness cap on
  the 2000-fight test-break-monsters3 suite (a timeout, not an
  assertion failure — that suite calls fieldFight without the flag,
  so the guard cannot fire in it); the suite run directly with
  node passed (exit 0). No other check.js scope was run: the arm
  is killed and its game code reverted, so a full green list would
  test unguarded code, not the arm.

## METRIC REVIEW (required, §14 — no re-scoring in this run)

- WINS-EXCLUDED MEDIAN AT SMALL n (the leg that killed this arm,
  proposed revision for the NEXT run only): with 3–4 non-winners,
  the median is one village's fate, and a win flips a 180d village
  OUT of the pool — the leg then punishes winning. Next run's
  pre-registration should judge survival on a composition-proof
  basis (e.g., the full 8-seed survival distribution, or a median
  leg that only binds when the non-winner count is >= 4, or a
  per-seed survival comparison). This run's verdict is NOT re-scored
  under any of those revisions: the leg as written failed, 158 < 180.
- One-round <15% counting: historic prose counted the mechanism as
  "6 of 9 one-round field deaths" from the census table; the
  analyzer counts resolve + direct rows with rounds == 1 and
  vHpStartFrac < 0.15. The recount came out exactly 6 — no
  discrepancy, and the leg was judged against the recount anyway.
- Starvation+sickness counting: off the raw harness death list with
  kind + player filters and cause regexes (starv|hunger /
  sick|disease|plague|fever), cross-checked against the census's
  threeWay starvation count. Cause strings are engine vocabulary;
  if a sickness death carries a cause outside the regex, the count
  understates — the analyzer prints starv and sick separately so
  the gap is visible.
- Wins-excluded median stays the primary cost median (0644Z order);
  the all-runs median is reported alongside and punishes early wins.
- No metric was re-scored mid-run. The GO bar above is the bar.

## NEXT BLANKS, IN ORDER (for the coordinator, not this run)

1. This arm is KILLED — sim-oneshotcap-a proceeds alone (the arms
   were alternatives, not stackable). If the fieldguard mechanism
   is ever revisited, it needs a revised survival-cost leg first
   (see metric review): the mechanism itself is proven, the bar
   that blocked it measures pool composition at n=3.
2. Withdrawal streaks: a hurt villager near a lingering monster
   withdrew 5 times across 2 days (Ethan, 73672) because the guard
   leaves the monster in place. Sensible, but a future design note:
   should a withdrawal also move the villager, or the monster
   wander off, so one hurt episode is not five withdrawals?
2. If this arm lands: patrol-site coverage for bands where patrols
   fight (uncovered here by design, zero patrol rows on this band).
3. The wave-4 one-shot deaths (healthy villagers flattened in one
   round) — untouched by design; this arm covers only the
   nearly-dead entry mechanism.
4. Belltoad 0-damage deaths (carried from 0644Z, mechanism unknown).

scale-onramp stays converging (NOT converged): this arm was KILLED
at pilot on the median leg, no lever landed in this run, the full
seat is still unreached, and wave 5 is still 0. The guard's
mechanism is proven (12 withdrawals, 0 remaining <15% one-round
field deaths) but its landing is blocked by a cost leg, not by a
mechanism failure — the distinction matters for the next
pre-registration (see metric review). Convergence state: converging.
