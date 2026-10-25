# sim-postflee-threshold-a — post-flee rest THRESHOLD arm (axis scale-onramp)

## RUN STATUS (2026-10-25, run fleshout-20261025T1332Z, arm sim-postflee-threshold-a): COMPLETE — GO (see VERDICT)

This is an OPEN QUESTION, not a correction to the sim-postflee-retest-a
GO verdict, which stands on its own <25% bar. A NO-GO here does NOT
touch the landed <25% arm.

## PRE-REGISTRATION (coordinator-set, binding — written BEFORE the armed sweep, judged ONLY against it; never changed after seeing armed data)

- THE LEVER (single threshold change): the landed post-flee rest arm
  flags flees ending BELOW 25% of max HP. Change the flag condition to
  AT-OR-BELOW 25% (<=25%) at BOTH flag sites — src/js/game.js wild
  router (~19674) and src/js/villager-agency.js expedition branch
  (~470) — both verified live paths (see FLAG SITES below). Change
  nothing else: no morale, no rest-duration, no flag-scope change
  (raid/aid/arena/scholar stay unflagged).
- SUBSTRATE (shared, identical both configs): the tableseat-nowait
  substrate from sim-postflee-retest-a (leanlinkrescue + seat legs, no
  wait leg; DEATHCENSUS=1 both configs as in that run).
- SEEDS: pilot 73679–73686 (8 seeds) first; confirm on 73687–73690
  only if the pilot passes its GO bar below. Control AND armed on
  identical seeds in each band. Control here is the LANDED <25% code
  (current HEAD), not the retest's no-arm control: the replication
  check below therefore compares the control band against BOTH the
  retest control (expect the landed-arm differences) and the retest
  armed band (expect close replication); any gap beyond those
  expectations is reported before judging.
- PRIMARY (pilot): same-day post-flee deaths of exactly-25% fleers
  (routed stream: FIELD vDie where an earlier same-seed, same-day,
  same-villager row has outcome vFlee with
  round(vHpLeft/vHpMax*100) == 25): control count -> armed 0, AND at
  least one exactly-25% fleer flagged-and-rested in the armed band
  (behaviorally: an exactly-25% flee row with no later same-day fight
  row for that villager in either stream; a directed probe counts if
  the band holds none). If the pilot band holds zero exactly-25%
  fleers AND the probe passes, the pilot is INCONCLUSIVE, not GO —
  report it as such and do not run confirm to hunt for one.
- COST (binding, from sim-scalemetric / retest): exposure-aware
  starvation+sickness per 100 village-days armed <= control rate
  x 1.25 (raw totals diagnostic only).
- GUARDS (all binding): wins-excluded median armed >= 0.8x control
  median; national-ever armed >= control - 2; wave-4-or-win armed >=
  control - 2; raid deaths armed <= control + 1; probe must pass.
- NEGATIVE CONTROL (binding): fleers at 26% and 27% must remain
  UNFLAGGED in the armed band — show at least the band's 26/27%
  cases behaving identically to control, or explain their absence.
- HORIZON: death-aware 180d as in the retest run (dead villages stop
  +10d tail max).
- SENSE CHECK: read a rest narration line under the armed code and
  judge whether a hurt person hiding reads sensibly. Quote it.
- If PRIMARY fails, the arm is KILLED: revert all game code before
  committing (measurement record only), per kill protocol. A NO-GO
  here does NOT touch the landed <25% arm.
- GO requires PRIMARY + COST + ALL guards + probe + negative control.
  GO -> land as game code (own commit, own proof test, include
  [needs-eyes] in the commit message — this changes visible fight
  outcomes and narration).

## FLAG SITES (verified before the change, both live)

- src/js/game.js wild router (~19674): vFlee branch, after
  hurtVillager, `if (!wViaAid && _endHp / Math.max(100, _pfEntryHp ||
  100) < 0.25)` — aid-crisis fights already exempt; raid path is
  guarded at the tick/router guard (~19588: `!opts.raid && !wViaAid`).
- src/js/villager-agency.js expedition branch (~470): after
  hurtVillager, `if (_endHp / Math.max(100, _pfEntryHp) < 0.25)` —
  expeditionMonster entry gate (~350) and villagerMonsterTick filter
  (game.js ~19533) do the skipping; raid/arena/scholar never call
  markPostFleeRest (scholar explicitly refused in markPostFleeRest).
- Recorder parity: deathcensus-diag records vHpMax = max(100, entry
  HP) and vHpLeft after the fight — the same fraction the game code
  tests — so round(vHpLeft/vHpMax*100) == 25 identifies exactly-25%
  fleers in the corpus.
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md, and the
  fieldFights.js header (no separate field-fight canon doc; the
  header is the canon, and this arm preserves it — it gates
  re-encounters between fights, never replaces a fight).

## EXPECTED CONTROL SHAPE (from sim-postflee-retest-a, pilot seeds 73679–73686)

Retest control (no arm) pilot per-seed (days/won/national-ever/
national-final/table/entered/wave/arc): 73679 180/0/1/1/0/0/3/3;
73680 105/1/1/1/1/1/3/4; 73681 180/0/1/1/0/0/3/3; 73682 18/0/0/0/0/0/1/3;
73683 180/0/1/0/0/0/4/3; 73684 31/0/0/0/0/0/1/3; 73685 180/0/1/0/0/0/4/3;
73686 107/0/1/1/0/0/4/3. Pilot totals: won 1/8, national-ever 6/8,
wave-4 3/8, wave-4-or-win 4/8, village-days 981.
Retest armed (<25% landed) pilot per-seed: 73679 119/1/1/1/1/1/3/4;
73680 105/1/1/1/1/1/3/4; 73681 180/0/1/1/0/0/3/3; 73682 18/0/0/0/0/0/1/3;
73683 180/0/1/0/0/0/4/3; 73684 31/0/0/0/0/0/1/3; 73685 125/1/1/1/1/1/3/4;
73686 112/1/1/1/1/1/3/4. Pilot totals: won 4/8, national-ever 6/8,
wave-4 1/8, wave-4-or-win 5/8, village-days 870.
Exactly-25% case to watch: 73679 d109 carlos_diaz, fled 74→25 HP
(exactly 25%), unflagged by the <25% design, died same day in a
broad post-flee re-encounter (retest control). The 26% case (73680
d17, 100→69→29→26 HP) and 27% case (73683 d162, 100→44→27 HP) are
also in this pilot band — they are the negative control.

## CONTROL PILOT (landed <25% code, before the change — seeds 73679–73686)

Per-seed (days / won / national-ever / national-final / table /
entered / wave / arc): 73679 119/1/1/1/1/1/3/4; 73680 105/1/1/1/1/1/3/4;
73681 180/0/1/1/0/0/3/3; 73682 18/0/0/0/0/0/1/3; 73683 180/0/1/0/0/0/4/3;
73684 31/0/0/0/0/0/1/3; 73685 125/1/1/1/1/1/3/4; 73686 112/1/1/1/1/1/3/4.
Totals: won 4/8, national-ever 6/8, national-final 5/8, table 4,
entered 4, wave-4 1/8, wave-5 0/8, wave-4-or-win 5/8, max arc 4.
Village-days 870. Kind-filtered villager deaths 20 (field 7, other 13,
raid 0, arena 0, tb 0). Starvation+sickness 5. Control cost rate =
5 / 870 x 100 = 0.575 per 100 village-days. PRIMARY (exactly-25%
same-day post-flee field deaths) = 1: 73679 d109 carlos_diaz vs
buffering, fled 74→25 HP (exactly 25%), same entity, died 1 round
later the same day. Exactly-25% flees 2 (carlos d109 + 73681 d133
nora_wilson vs spool, who was not re-encountered either way).
Routed <25% post-flee deaths 0 (the landed arm holds). Negative
buckets: 26% flees 3, 26% deaths 1 (73680 d17 gen_c8oedup vs
hushwolf); 27% flees 2, 27% deaths 1 (73683 d162 yara_haddad vs
congregation). Recorder errors 0, orphan evidence 0.

REPLICATION VERDICT (before judging): the control band replicates
the retest ARMED pilot EXACTLY — identical per-seed days
[119,105,180,18,180,31,125,112] and identical headline totals (won
4, national-ever 6, wave-4-or-win 5, villager deaths 20). This is
expected, not a gap: this run's control IS the landed <25% code.
Against the retest CONTROL (no arm) the differences are exactly the
landed-arm effects (wins 1→4, wave-4-or-win 4→5, field deaths
down). No unexplained gap; proceeding to judge.

DERIVED BARS (from this control pilot, before the armed run):
- PRIMARY: armed exactly-25% deaths 0 AND >=1 exactly-25% fleer
  flagged-and-rested in the armed band.
- COST RATE: armed <= 0.575 x 1.25 = 0.719 per 100 village-days.
- GUARDS: wins-excluded median >= 0.8 x 180 = 144d; national-ever
  >= 4/8; wave-4-or-win >= 3/8; raid villager deaths <= 1.
- NEGATIVE: 26%/27% death cases reproduce identically to control.
- PROBE: core legs pass (see DIRECTED PROBE below).

## ARMED PILOT (<=25% change — identical seeds 73679–73686)

Per-seed (days / won / national-ever / national-final / table /
entered / wave / arc): 73679 113/1/1/1/1/1/3/4; 73680 105/1/1/1/1/1/3/4;
73681 180/0/1/1/0/0/3/3; 73682 18/0/0/0/0/0/1/3; 73683 180/0/1/0/0/0/4/3;
73684 31/0/0/0/0/0/1/3; 73685 125/1/1/1/1/1/3/4; 73686 112/1/1/1/1/1/3/4.
Totals: won 4/8, national-ever 6/8, national-final 5/8, table 4,
entered 4, wave-4 1/8, wave-5 0/8, wave-4-or-win 5/8, max arc 4.
Village-days 864. Kind-filtered villager deaths 19 (field 6, other
13, raid 0). Starvation+sickness 5. Armed cost rate = 5 / 864 x 100
= 0.579 per 100 village-days. PRIMARY = 0. Exactly-25% flees 2,
BOTH rested (no later same-day fight row in either stream): carlos
d109 (control: 1 later same-day row, death; armed: 0 rows, survives)
and nora_wilson d133 (0 rows both configs). Routed <25% post-flee
deaths 0; <=25% class deaths 0. Negative buckets byte-identical to
control: 26% deaths 1 (73680 d17, same villager/monster/vTaken 29),
27% deaths 1 (73683 d162, same villager/monster/vTaken 34).
Recorder errors 0, orphan evidence 0. The ONLY headline difference
in the pilot is seed 73679: carlos survives day 109 and the village
wins 6 days earlier (119→113d); every other seed is identical.

## CONFIRM (seeds 73687–73690 — run because the pilot passed)

Control and armed confirm bands are IDENTICAL on every headline
outcome (no exactly-25% cases exist in these seeds, so the threshold
change is inert here — the expected null result): per-seed 73687
94/1/1/1/1/1/3/4; 73688 117/1/1/1/1/1/4/4; 73689 173/1/1/1/1/1/4/4;
73690 180/0/1/0/0/0/4/3, both configs. Confirm village-days 564
both configs. Full 12-seed totals — control: won 7/12,
national-ever 10/12, national-final 8/12, table 7, entered 7,
wave-4 4/12, wave-5 0/12, wave-4-or-win 9/12, village-days 1434,
villager deaths 29, field 10, raid 0, starvation+sickness 7, cost
rate 0.488/100vd, exactly-25% deaths 1; armed: won 7/12,
national-ever 10/12, national-final 8/12, table 7, entered 7,
wave-4 4/12, wave-5 0/12, wave-4-or-win 9/12, village-days 1428,
villager deaths 28, field 9, raid 0, starvation+sickness 7, cost
rate 0.490/100vd, exactly-25% deaths 0. The full control band also
replicates the retest armed 12-seed band exactly (won 7,
national-ever 10, wave-4-or-win 9, deaths 29, starv+sick 7).

| Leg (pre-registered, pilot) | Bar | Control | Armed | Verdict |
|---|---|---|---|---|
| PRIMARY (exactly-25% same-day post-flee deaths) | 0 | 1 (carlos d109) | 0 | PASS |
| PRIMARY (exactly-25% fleer flagged-and-rested) | >= 1 | — (n/a) | 2/2 rested, incl. carlos | PASS |
| COST rate (starv+sick per 100 village-days) | <= 0.719 | 0.575 (5 / 870d) | 0.579 (5 / 864d) | PASS |
| Guard: wins-excluded median | >= 144d | 180d | 180d | PASS |
| Guard: national-ever | >= 4/8 | 6/8 | 6/8 | PASS |
| Guard: wave-4-or-win | >= 3/8 | 5/8 | 5/8 | PASS |
| Guard: raid villager deaths | <= 1 | 0 | 0 | PASS |
| Negative: 26%/27% deaths identical to control | identical | 1 + 1 | 1 + 1, byte-identical cases | PASS |
| Directed probe | PASS | — | PASS (core legs; negatives absent in probe grid, covered by band) | PASS |
| Confirm (73687–73690) | no regression | identical headlines | identical headlines | PASS |

## VERDICT: GO — all pre-registered legs pass (pilot + confirm)

PRIMARY 1→0 with both exactly-25% fleers rested in the armed band,
cost rate essentially unchanged (0.575→0.579/100vd, bar 0.719),
every guard passes, the 26%/27% cases reproduce byte-identically
(the threshold moves by one point, not into a general rest), the
probe passes, and the confirm band is identical between configs.
This run lands the game code (own commit, own proof test,
[needs-eyes] in the commit message — it changes visible fight
outcomes and narration). The sim-postflee-retest-a GO verdict is
untouched: it was judged on its own <25% bar and stands; this
verdict rests solely on this run's pilot + confirm bands and new
pre-registration. The threshold question is now answered on
measured evidence: at-or-below 25% is the flag line.

## DIRECTED PROBE (armed code, seed 73671 — PASS, core legs)

Ursula_weber fled a suburb at entry 100 HP, ended 25 HP (exactly
25%) — flag set, tick skipped, raid proceeded (outcome vDie —
the raid path is never skipped), arena never flagged (grace_obi
fieldFight noFlee → mFlee, resting false), scholar refused,
expedition fought nothing (0 fieldFight calls), flag expired next
day (router fought again, outcome mFlee). Probe grid (entries
100→30 step 5 x 10 monsters x roster) found NO 26% or 27% flee —
both negative legs are therefore absent in the probe, NOT failed;
the band covers them authoritatively (see NEGATIVE above).
Two probe-harness notes (artifacts, not code findings): the first
probe run failed on narration/tick-control/arena legs because the
wide grid filled the 8-entry awayNews cap (dropping the found
fight's own tell) and spent the whole roster — fixed by draining
awayNews between search attempts and reserving one villager for
the control legs; the re-run passed cleanly. The cap itself is
pre-existing narration-buffer behavior, not this arm.

## VILLAGE ASSESSMENT (plain words)

Twelve villages, same seeds, two versions of each — and eleven of
them do not notice the change at all. The threshold moves by one
hit point, and that is the whole story: in eleven villages nobody
flees at exactly 25%, so nothing changes; in the twelfth (73679),
Carlos Diaz flees a buffering at exactly 25 health, hides for the
rest of day 109 instead of walking back into it, and lives — his
village wins six days earlier than it did when he died. Nobody
else's fate moves: the same four villages win in the pilot, the
same three win in confirm, the same two collapse in the first
month (18d, 31d, byte-identical), and nobody anywhere reaches wave
5 or the full seat — the scale wall above national/table is
untouched by a one-point threshold, as it should be. Who thrived:
exactly-25% fleers, a class of one per pilot band — Carlos. Who
died and why: the same old mix, minus Carlos — nearly-dead
entries, grinds, sickness and starvation — plus the 26% and 27%
fleers, who still die exactly as before, which is the threshold
drawing its line honestly. What knowledge/capabilities were
missing: nothing this arm touches — wave 5 (0/24 runs) and the
full seat (0/24) remain the wall. Villagers act like people
throughout: the flagged fleer hides (narrated, day-scoped), the
unflagged 26/27% fleers walk back out and pay for it, and no
village's routines, courting, or table path changes shape — the
only behavioral delta in 24 runs is one man hiding for an
afternoon.

Wall numbers, this run (12 seeds): control national-ever 10/12,
national-final 8/12, entered 7/12, wins 7/12, wave-4 4/12, wave-5
0/12, full seat 0/12, median survival (all) 119d / wins-excluded
180d; armed national-ever 10/12, national-final 8/12, entered
7/12, wins 7/12, wave-4 4/12, wave-5 0/12, full seat 0/12, median
survival (all) 117d (one earlier win) / wins-excluded 180d.

## SENSE-TESTING (armed narration, quoted from the probe)

> "🩸 The street that wasn't there yesterday mauled Ursula (-75
> health) over 1 round. They're lucky to be breathing. — staying
> out of sight for the rest of the day — too hurt to meet it
> again."

Read as a story, this is exactly a hurt person hiding: mauled to
a quarter of her health, lucky to be breathing, and the decision
— staying out of sight — follows from the wound in the same
breath. At exactly 25% the line reads no differently than below
it, which is the point: a person at a quarter of their health
hiding is sensible; a person at 26–27% walking back out and dying
is the line's honest edge, and the band shows both sides of it
(Carlos hides and lives; the 26% and 27% fleers walk out and die
the same day, identically in both configs).

## METRIC REVIEW (required, §14 — no re-scoring in this run)

- The exactly-25% primary discriminated cleanly (1→0) because the
  pilot band contained the carlos_diaz case by construction (pilot
  seeds overlap the retest band) — this was the task's design, not
  an accident, and the confirm band's null result (no exactly-25%
  cases in 73687–73690) is reported, not hidden: the threshold's
  measured effect size on fresh seeds is small (one life per 8
  villages in this band), and that smallness is itself the finding
  — a one-point move, not a general rest.
- The exposure-aware cost metric again behaved (0.575→0.579, bar
  0.719): with village-days nearly identical (870→864 pilot),
  the rate comparison is uncontaminated by win-shortening here.
- The "rested" aggregate (no later same-day fight row) is a
  behavioral proxy for the flag, not a direct flag read — the
  probe supplies the direct read (flag set, tick skipped). Future
  threshold work that wants a direct corpus flag should add a
  recorder field rather than redefining rested.
- No metric proved wrong: every pre-registered leg bound, and the
  negative-control legs (26%/27% byte-identical) did the work the
  probe grid could not (no 26/27 flee exists in the probe's
  deterministic search sequence).

## SIDE FINDINGS (not chased mid-run; coordinator owns the backlog file)

- None surfaced outside this arm. The probe-grid absence of 26/27%
  flees is a search-sequence observation, not a game finding (the
  band contains both cases).
- The 8-entry awayNews cap drops narration when many fights land
  in one buffer window (found via the probe harness, pre-existing
  behavior, not this arm) — noted here for the coordinator, not
  chased.

## INSTRUMENT NOTES

- New: scripts/test-postflee-threshold-sweep.js (adapted from
  scripts/test-postflee-retest-sweep.js — sweep + probe + read-only
  summarize modes; corpus dir + default seeds changed to the
  threshold band; aggregate() adds the exactly-25% class, the
  <=25% class, and the 26%/27% negative-control buckets; probe
  search targets exactly 25% with a drained awayNews buffer and a
  reserved control villager). Corpus:
  evidence/2026-10-25/perseed-sim-postflee-threshold-a/ (24 rows:
  12 control + 12 armed; never /tmp) plus threshold-arm.patch
  (the exact landed diff, saved during the control/armed confirm
  swap).
- Game change (LANDED — GO): src/js/game.js (wild-router flag
  condition `< 0.25` → `<= 0.25` + comment), src/js/villager-agency.js
  (expedition-branch flag condition `< 0.25` → `<= 0.25` + comment).
  Nothing else: no morale, no rest-duration, no flag-scope change.
- Checks: probe PASS on the armed code (core legs; negatives
  absent in probe grid, covered by band); `node scripts/check.js
  --only fieldfight` — 2 passed, 0 failed.
- Balanced panel (§15): not attached, for the established reason
  in sim-postflee-retest-a.md — per-seed recorder corpora are not
  panel pairs; the sweep-compare table on identical seeds above IS
  the comparison.
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md, and the
  fieldFights.js header (no separate field-fight canon doc; the
  header is the canon, and this arm preserves it — it gates
  re-encounters between fights, never replaces a fight).

