# sim-postflee-retest-a — post-flee rest RE-TEST (axis scale-onramp)

## RUN STATUS (2026-10-25, run fleshout-20261025T1226Z, loop A): COMPLETE — GO (see VERDICT)

The 1146Z NO-GO stands as judged and is NOT re-scored — this is a new
band, new pre-registration, new verdict. Prior arm: sim-postflee-a.md
(KILLED at pilot on 73671–73678 by a raw-count starvation+sickness bar,
9 vs bar 8, even though it eliminated its target class 5→0). This run
re-tests it on FRESH seeds with a NEW pre-registered exposure-aware
cost metric. Death classification: sim-w123death-a.md.

## PRE-REGISTRATION (coordinator-set, binding — written verbatim BEFORE the armed sweep, judged ONLY against it; never changed after seeing armed data)

- PRIMARY (mechanism class, w123death definition): routed
  (resolveFights-stream) FIELD vDie rows where an earlier row in the
  same seed, same calendar day, same villager has outcome vFlee with
  vHpLeft/vHpMax < 0.25. Bar, set from YOUR control count BEFORE the
  armed run: armed ≤ 2 AND armed ≤ control count. If your control
  count is 0, the primary is vacuous — report that plainly, do not
  invent a replacement bar; judge on cost + guards.
- COST (exposure-aware, the point of this re-test): kind-filtered
  starvation+sickness deaths per 100 village-days, where village-days
  = sum over the 12 seeds of days simulated (death/win/cap). Bar:
  armed rate ≤ control rate × 1.25. Raw starvation+sickness totals
  are reported as diagnostic ONLY and do NOT bind.
- GUARD LEGS (all binding): wins-excluded median ≥ 0.8× control
  median if ≥4 non-winners on both sides, else the full-distribution
  mean rule from sim-postflee-a.md; national-ever ≥ control−2;
  wave-4-or-win ≥ control−2; raid deaths ≤ control+1.
- PROBE: reuse/adapt the prior postflee probe (8 legs) — it must pass.
- GO requires primary + cost rate + ALL guards + probe. GO → land as
  game code (own commit, own proof test, include [needs-eyes] in the
  commit message — this changes visible fight outcomes and
  narration). ANY leg fails → KILLED: revert game code fully (save
  the reverted patch in your corpus dir, as the prior run did),
  commit the measurement record only, zero src/js in the commit.
- CONTROL GATE: there are no published controls for 73679–73690, so
  no exact-match gate is possible. Instead report the full control
  band; if it is wildly divergent from the prior band's shape (e.g.
  national-ever ≤4/12), STOP and report rather than judging.
- Also report: national-final, invited/entered, wins, wave-5, full
  seat, and the field-death class table (w123death classes) for
  control and armed.

## THE ARM (exact, from sim-postflee-a.md)

After a villager flees a FIELD fight ending below 25% of max HP, they
are skipped by villagerMonsterTick and expedition-monster legs for
the rest of that calendar day (flag keyed by villager + scholar day,
expires next day; no relocation, no HP restored, narrated in the
awayNews/expedition line). Raid, aid-crisis, arena, scholar never
flagged. Re-applied from the saved patch
evidence/2026-10-25/perseed-sim-postflee-a/postflee-arm-reverted.patch
— `git apply --check` passed cleanly before any sims in this run.

## SUBSTRATE (shared, identical both configs)

scripts/policies/tableseat-nowait.js (leanlinkrescue courtship + seat
legs only, no wait leg), recorder DEATHCENSUS=1 on BOTH configs,
seeds 73679–73690 (12 fresh seeds — NEVER reuse 73671–73678), 180d
death-aware horizon (dead villages stop, +10d tail max).

## CONTROL BAND (fresh seeds 73679–73690, run BEFORE the arm was applied; derived bars below)

Per-seed (days / won / national-ever / national-final / table invited /
entered / wave / arc):
73679 180/0/1/1/0/0/3/3; 73680 105/1/1/1/1/1/3/4;
73681 180/0/1/1/0/0/3/3; 73682 18/0/0/0/0/0/1/3;
73683 180/0/1/0/0/0/4/3; 73684 31/0/0/0/0/0/1/3;
73685 180/0/1/0/0/0/4/3; 73686 107/0/1/1/0/0/4/3;
73687 95/1/1/1/1/1/4/4; 73688 80/0/0/0/1/0/4/4;
73689 180/0/1/1/0/0/4/3; 73690 180/0/1/0/0/0/4/3.

Totals: won 2/12, national-ever 9/12, national-final 6/12, table
invited 3, entered 2, wave-4 7/12, wave-5 0/12, wave-4-or-win 8/12,
max arc 4, full seat 0/12 (full seat requires the wave-5 deed bar per
src/js/table.js tableSeat/deedGateReady; wave-5 is 0, so no full seat
is possible on this band). Village-days = 1516 (sum of days above).
Kind-filtered villager deaths 41 (field 20, other 20, raid 1, arena 0,
tb 0). Starvation+sickness (kind-filtered) 8. Control cost rate =
8 / 1516 × 100 = 0.528 per 100 village-days. Control PRIMARY class =
5, all routed same-day post-flee field deaths, all 1-round re-meets
at 3–13% HP, all same-entity (detail in the CONTROL PRIMARY section
below). Direct-stream post-flee deaths 1 (73687 d27, not same-entity).
Recorder errors 0, orphan evidence 0.

CONTROL-GATE VERDICT (per the task's divergence rule): NOT divergent.
National-ever 9/12 is well above the stop example (≤4/12); the band's
shape (most villages reach national, ~half the prior win rate on
fresh seeds, wave-5 0, max arc 4) is the same scale-wall shape as the
prior band, with fresh-seed variation (two very early collapses at
18d and 31d). Proceeding to judge.

DERIVED BARS (from this control band, before the armed run):
- PRIMARY: armed ≤ 2 (and ≤ control 5, so 2 binds).
- COST RATE: armed ≤ 0.528 × 1.25 = 0.660 per 100 village-days.
- GUARDS: wins-excluded median ≥ 0.8 × 180 = 144d (control has 10
  non-winners, so the median rule applies if armed also has ≥4);
  national-ever ≥ 7/12; wave-4-or-win ≥ 6/12; raid villager deaths
  ≤ 2.
- PROBE: 8 legs must pass.

## CONTROL PRIMARY (routed same-day post-flee field deaths, 5)

- 73679 d82 gen_9zo49xv vs moderator w2, prior end 13%, SAME ENTITY, taken 30, 1 round
- 73679 d107 adaeze_nwosu vs callback w3, prior end 8%, SAME ENTITY, taken 17, 1 round
- 73685 d94 gen_7tkf12l vs heckler w2, prior end 10%, SAME ENTITY, taken 18, 1 round
- 73688 d20 james_okonkwo vs understudy w2, prior end 8%, SAME ENTITY, taken 11, 1 round
- 73689 d151 leo_martin vs callback w3, prior end 3%, SAME ENTITY, taken 14, 1 round
Wounded (routed, <25%) flees in control: 28; direct: 11.

## ARMED RESULTS (identical seeds 73679–73690, arm applied after the control run; probe run on the armed code)

Per-seed armed (days / won / national-ever / national-final / table
invited / entered / wave / arc):
73679 119/1/1/1/1/1/3/4; 73680 105/1/1/1/1/1/3/4;
73681 180/0/1/1/0/0/3/3; 73682 18/0/0/0/0/0/1/3;
73683 180/0/1/0/0/0/4/3; 73684 31/0/0/0/0/0/1/3;
73685 125/1/1/1/1/1/3/4; 73686 112/1/1/1/1/1/3/4;
73687 94/1/1/1/1/1/3/4; 73688 117/1/1/1/1/1/4/4;
73689 173/1/1/1/1/1/4/4; 73690 180/0/1/0/0/0/4/3.

Totals armed: won 7/12, national-ever 10/12, national-final 8/12,
table invited 7, entered 7, wave-4 4/12, wave-5 0/12, wave-4-or-win
9/12, max arc 4, full seat 0/12 (same wave-5 deed-bar reason as
control). Village-days = 1434. Kind-filtered villager deaths 29
(field 10, other 19, raid 0, arena 0, tb 0). Starvation+sickness
(kind-filtered) 7 (raw diagnostic only). Armed cost rate =
7 / 1434 × 100 = 0.488 per 100 village-days. PRIMARY (routed
<25% same-day post-flee field deaths) = 0. Direct-stream post-flee
deaths = 0. Wounded flees: routed 32, direct 11. Field fights
1215 (vKill 79, vDie 10, vFlee 144), raid fights 448 (vDie 0).
Recorder errors 0, orphan evidence 0.

| Leg (pre-registered) | Bar | Control | Armed | Verdict |
|---|---|---|---|---|
| PRIMARY (routed same-day post-flee, <25%) | ≤ 2 (and ≤ control 5) | 5 | 0 | PASS |
| COST rate (starv+sick per 100 village-days) | ≤ 0.660 | 0.528 (8 / 1516d) | 0.488 (7 / 1434d) | PASS |
| Guard: wins-excluded median | ≥ 144d (0.8 × 180; ≥4 non-winners both sides: control 10, armed 5) | 180d | 180d | PASS |
| Guard: national-ever | ≥ 7/12 | 9/12 | 10/12 | PASS |
| Guard: wave-4-or-win | ≥ 6/12 | 8/12 | 9/12 | PASS |
| Guard: raid villager deaths | ≤ 2 | 1 | 0 | PASS |
| Directed probe | PASS (8/8) | — | PASS (8/8) | PASS |

Notes on the numbers that move in opposite directions: wave-4 reach
alone falls 7→4, but the guard is the union wave-4-or-win, which
rises 8→9 because wins rise 2→7 — five armed villages that reached
only wave 3 in control now win (73679, 73685, 73686, 73688, 73689)
before wave 4 is reached. The all-runs median falls 180→119d for
the same win-shortening reason (wins end at 94–173d); the binding
wins-excluded median is unchanged at 180d. The two earliest
collapses (73682 at 18d, 73684 at 31d) are byte-identical in both
configs — villages that fall before the post-flee class can bite.

## FIELD-DEATH CLASS TABLE (w123death priority: post-flee > nearly-dead > one-round ≥50% > multi-round grind > other)

Broad post-flee here means ANY field vFlee the same villager+day
(w123death definition); the PRIMARY above is narrower (routed
stream only, flee ending <25%). The gap between the two is the
threshold working as designed — see below.

| Class | Control all (w123) | Armed all (w123) |
|---|---|---|
| Post-flee (broad) | 9 (8) | 3 (2) |
| Nearly-dead entry <15% | 3 (3) | 4 (4) |
| One-round ≥50% | 0 (0) | 0 (0) |
| Multi-round grind | 5 (3) | 1 (1) |
| Other | 3 (2) | 2 (2) |
| Total field deaths | 20 (16) | 10 (9) |

The 3 remaining broad post-flee deaths armed are NOT primary
failures: each fled at or above the 25% threshold, so no flag was
ever set, by design — 73679 d109 carlos_diaz vs buffering, fled
74→25 HP (exactly 25%, and the arm's test is strictly <25%), then
died at 25 HP; 73680 d17 gen_c8oedup vs hushwolf, three flees
100→69→29→26 HP, died at 26 HP; 73683 d162 yara_haddad vs
congregation, flees 100→44→27 HP, died at 27 HP. All three cases
are byte-identical in control and armed (same seeds, days,
villagers, monsters) — the arm changes nothing for fleers at
≥25%, and that is the threshold doing its job, not a leak. The
boundary case to watch in future work is carlos_diaz at exactly
25%: one HP lower and the flag would have fired. No threshold
change is proposed in this run — the pre-registered bar is
<25% and the verdict rests on it.

## VERDICT: GO — all pre-registered legs pass

PRIMARY 5→0, cost rate 0.528→0.488 per 100 village-days (raw
starvation+sickness 8→7, diagnostic only), every guard passes,
probe 8/8. This run lands the game code (own commit, own proof
test, [needs-eyes] in the commit message — it changes visible
fight outcomes and narration). The 1146Z NO-GO is untouched: it
was judged on its own raw-count bar and stands; this verdict rests
solely on this run's fresh seeds and new pre-registration.

## DIRECTED PROBE (armed code, seed 73671, 8/8 PASS)

Same deterministic probe transcript as the pilot, re-proved on the
re-applied arm: brian_otieno fled a suburb at entry 30 HP, ended
2 HP (2%) — flag set, tick skipped, raid proceeded, arena never
flagged, scholar refused, expedition fought nothing, flag expired
next day (router fought again, outcome mFlee). Full probe JSON is
in the run log summary held by the worker report; the narration
line is quoted in SENSE-TESTING below.

## VILLAGE ASSESSMENT (plain words)

Twelve villages, same seeds, two versions of each. In control,
only two win and most stall at national without ever sitting
down; armed, seven win and all seven sit at the table. The arm
does not make villages invincible — the two villages that
collapse in the first month fall identically either way, and
nobody anywhere reaches wave 5 or the full seat, so the scale
wall above national/table is untouched by this work. What it
does is remove the cheapest way villages bleed out: a hurt
villager no longer walks straight back into the monster that
just mauled them. Field deaths halve (20→10), total villager
deaths fall (41→29), and the villages that were already close
— 73679, 73685, 73686, 73688, 73689 — turn from long stalls
into wins instead of dying in the field on the way there.
Who thrived: villagers who flee hurt — they survive to fight
another day (wounded flees rise 28→32 routed, because fleers
live to flee again) and their villages keep enough people to
court, lead, and sit at the table (entered 2→7). Who died and
why: the same old mix minus the re-meet class — nearly-dead
entries, multi-round grinds, sickness and starvation — plus the
three ≥25% fleers above, who are the threshold's honest edge.
What knowledge/capabilities were missing: nothing in this arm
touches wave 5 (standing ≥ 200 + wave-4 faced, full-seat deed
bars), and 0/24 runs reach it. The wall numbers move below
national (wins, table) but not above it.

Wall numbers, this run: control national-ever 9/12, national-final
6/12, entered 2/12, wins 2/12, wave-4 7/12, wave-5 0/12, full seat
0/12, median survival (all) 180d / wins-excluded 180d; armed
national-ever 10/12, national-final 8/12, entered 7/12, wins 7/12,
wave-4 4/12, wave-5 0/12, full seat 0/12, median survival (all)
119d (win-shortened) / wins-excluded 180d.

## SENSE-TESTING (armed narration, quoted from the probe)

> "🩸 The street that wasn't there yesterday mauled Brian (-28
> health) over 1 round. They're lucky to be breathing. — staying
> out of sight for the rest of the day — too hurt to meet it
> again."

Read as a story, this is a hurt person hiding, not a mechanic:
Brian is mauled, the line says he is lucky to be breathing, and
the decision — staying out of sight — follows from the wound in
the same breath. The armed corpus reads the same way at scale:
no armed villager dies in the routed <25% re-meet class, and the
only same-day re-meet deaths left are villagers who fled at
25–27% HP — hurt, but not mauled to the point the line would
claim. The one line that strains belief is not in this arm: the
three ≥25% cases above re-meet and die the same day at 25–27 HP,
which is exactly the boundary the threshold draws. It reads as a
deliberate line ("hurt, but not critically hurt"), not as an
accident — and it is the obvious next question if a future arm
wants to move the threshold, not a reason to re-judge this one.

## METRIC REVIEW (required, §14 — no re-scoring in this run)

- The exposure-aware cost metric worked as designed: control
  0.528, armed 0.488 per 100 village-days, PASS with headroom
  (bar 0.660). Unlike the pilot's raw count, it did not punish
  the armed side for villages living different lengths — armed
  village-days actually fell (1516→1434) because more villages
  won and ended early, and the rate still fell. The metric is
  recommended for future post-flee work, not just this re-test.
- No metric proved wrong in this run: PRIMARY (routed <25%)
  discriminated cleanly (5→0), the broad w123death class table
  separated the threshold edge (3 remaining, all ≥25%) from a
  leak, and every guard bound. The wave-4-alone dip (7→4) is
  reported, not hidden, but the pre-registered guard is the
  union wave-4-or-win (8→9) — a future run that wants a
  wave-4-alone guard should pre-register it, not re-score this
  one against it.
- The probe seed (73671) is a directed probe seed only, not a
  sweep seed; sweep seeds are 73679–73690 throughout.

## INSTRUMENT NOTES

- New: scripts/test-postflee-retest-sweep.js (adapted from
  scripts/test-postflee-sweep.js — sweep + probe + read-only
  summarize modes; corpus dir and default seeds changed to the
  retest band; probe seed 73671 unchanged as a directed probe).
  Corpus: evidence/2026-10-25/perseed-sim-postflee-retest-a/
  (24 rows: 12 control + 12 armed; never /tmp).
- Game change (LANDED — GO): src/js/game.js (postFleeRest
  helpers + villagerMonsterTick filter + wild-router flag +
  narration), src/js/villager-agency.js (expeditionMonster entry
  gate + vFlee flag + encounters note). Re-applied verbatim from
  evidence/2026-10-25/perseed-sim-postflee-a/postflee-arm-reverted.patch
  (`git apply --check` passed before any sims; applied diff
  62 insertions, 2 deletions, matching the saved patch).
- Checks: probe 8/8 PASS on the armed code; `node scripts/check.js
  --only fieldfight` — 2 passed, 0 failed.
- Balanced panel (§15): not attached, for the established reason
  in sim-postflee-a.md — per-seed recorder corpora are not panel
  pairs; the sweep-compare table on identical seeds above IS the
  comparison.
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md, and the
  fieldFights.js header (no separate field-fight canon doc; the
  header is the canon, and this arm preserves it — it gates
  re-encounters between fights, never replaces a fight).

## NEXT BLANKS, IN ORDER (for the coordinator, not this run)

1. The wave-5 wall (scale-onramp axis, still blocking): 0/24 runs
   in this re-test reach wave 5, and 0/24 reach the full seat.
   Wins and table entry move, but the full seat's deed bars
   (including wave 5) do not — that is the next blank, not this
   one.
2. The 25% threshold edge: carlos_diaz fled at exactly 25% and
   died the same day. A future arm could test a ≤25% threshold
   or a different critical threshold, pre-registered, on fresh
   seeds — not a re-score of this run.
3. Nearly-dead entries armed (4, all wave-1/2/3): the largest
   remaining field-death class armed is now nearly-dead entry,
   not post-flee — the "don't go out hurt" blank from
   sim-w123death-a.md, still open.
