# sim-waitlong-a — does waiting matter when the seat stays unready longer? (arm 2 of 3)

Run: fleshout-20261027T1215Z. Axis: scale-onramp. Worktree:
~/workspace/worktrees/sim-waitlong-a (branch sim-waitlong-a).
Preregistration (binding, committed BEFORE the sweep):
evidence/2026-10-27/sim-waitlong-a-prereg.md (commit 4f09c474a).
Instrument: scripts/test-waitlong-sweep.js (sweep + --probe + --sense).
Corpus: evidence/2026-10-27/perseed-waitlong-a/ (24 rows).
Aggregate: evidence/2026-10-27/sim-waitlong-a-sweep.json.
Sense replay: evidence/2026-10-27/sim-waitlong-a-sense.txt.

## Canon read

- docs/CANON.md and docs/TABLE.md read before building. Contract points
  used: full seat keeps the national bar; lesser seat priced without
  national; seat taken from Haven via tableTakeSeat; sanctity suspends
  ambient monster pressure while the table sits. No canon invented.
- Readiness mechanism (src/js/table.js, read not changed): a preview is
  ready iff tableEntryBlock() is empty. The block reasons are exactly:
  run over/won; an active contest; in combat / a monster present; or
  havenStoresAccess() == 'none' (scholar not at Haven, and not stage-3
  remote). The wait leg's ONLY mechanism is ending the day at Haven
  (4,4) so the next day's drive finds the scholar at Haven. It cannot
  clear a contest block, a combat block, the day-90 floor
  (winDayFloorOk: scholar day >= 90, below which tablePreview() is
  null by design), or the legs' own rank >= national gate.

## Why this arm

The 1955Z tableseat round (evidence/2026-10-24/sim-tableseat-round-1955.md)
proved seat-only replicates seat+wait exactly on band 73601–73608 —
but that band's longest unready stretch was 2 not-ready days on one
seed (73605), and waiting did not shorten even that. The open question
(backlog #919) was whether waiting matters where the seat stays unready
LONGER. This arm tests the wait delta on a fresh, uncherry-picked band
with a pre-registered band-qualification rule, so a null result here
cannot be dismissed as "the band was too easy."

## Pre-registration summary (binding — judged below, never re-scored)

- Band: fresh seeds 74001–74008 (freshness verified before the prereg:
  no 7400x hits in scripts/*.js, no 7400x evidence filenames;
  73701–73708 rejected as used by sweep-deathrow-b.js). No seed was
  run, screened, or excluded on latency or any outcome before the
  prereg. The 73672 long-wait case was explicitly NOT used: both seat
  legs are gated on rank >= national and 73672 never reached national,
  so both legs would idle there identically — waiting-to-be-invited
  is not waiting-for-readiness.
- Band-qualification rule: the band counts as "longer-unready" iff the
  seat-only leg shows total not-ready previews >= 6 OR any seated
  seat-only seed with latency >= 4 days (latency = tsSeatDay minus
  firstWaitingDay). Thresholds are 3x the 1955Z band's observed values
  (total 2, max 2 days).
- Arms (policy-side ONLY, zero src/js, no new policy files — both legs
  reuse the prior arms' files verbatim): baseline leanlinkrescue-only
  (LEANLINKRESCUE=1); seat-only = tableseat-nowait.js
  (TABLESEATNOWAIT=1); seat+wait = tableseat.js (TABLESEAT=1).
  8 seeds x 3 legs = 24 configs, one shared baseline.
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- PRIMARY (ONE primary): table entered, seat+wait MINUS seat-only.
  GO (waiting matters) requires delta >= 2.
- DECIDING COST BAR (from sim-scalemetric, seat+wait vs seat-only):
  starvation total <= comparison + 2 AND arm-only starvation <= 2
  AND median days >= 0.8 x comparison median. All three must pass
  WITH the primary or NO-GO.
- Secondary: wins, national ever/final, wave 4/5, max arc, median/max
  survival, death-cause shares, seat attempts/taken/kind/day, wait
  days/returns/stranded, preview seen/not-ready, latency per seated
  seed, why-block distribution (Haven vs contest vs combat).
- "Table invited ever" is NOT judged (1955Z proved it
  non-discriminating). Path diversity is NOT judged (both legs share
  first-option answering, which walks Feared by construction).

## PROBE AMENDMENT (loud — read before the verdict)

The prereg's probe P1 required baseline seed 73601 to match the 1955Z
corpus row exactly (179d, village-lost) and seat-only 73601 to match
the 1955Z nowait row exactly (129d, win). P1 AS WRITTEN FAILED — but
the failure is BASE DRIFT, not instrument error, proven by running
the PRIOR instruments on this base:

- Prior tableseat det-gate on this base, seed 73601: baseline 180d /
  180 gameDays (not 179d) — the prior instrument itself diverges
  from its own 1955Z row. Its det-gate still PASSES (delegation
  identical: tableseat-with-TABLESEAT-unset == leanlinkrescue-only).
- Prior nowait sweep on this base, seed 73601 only: baseline 180d
  survived, national ever/final 1, table 0, entered 0, maxArc 3;
  armed 180d survived, entered 0, won 0, table 0. On the 1955Z base
  the same seed gave baseline 179d village-lost, maxArc 4, table
  invited, and armed seat day 129 + win. On this base 73601 never
  reaches Arc IV at all (maxArc 3 vs 4), so no invitation exists
  for either leg to convert.
- Same-base comparison PASSES exactly: my instrument's baseline
  73601 (180/180 survived, entered 0, won 0) == prior instrument's
  baseline 73601 (180/180); my instrument's seat-only 73601 (180/180
  survived, entered 0, won 0, tsNationalDay 77) == prior instrument's
  armed 73601 on days/gameDays/entered/won. The wrapper (pre-daily
  tableEntryBlock reads + post-daily snapshots) is therefore proven
  neutral; stripping it, as the prereg's failure branch prescribed,
  would not restore the 1955Z numbers and would destroy the
  why-recording for nothing.

Deviation recorded, not hidden: P1's 1955Z expectations are superseded
by the same-base pass above. The prereg file itself is left unedited
as the historical record; this section is the amendment. Consequence
for the loop (see Findings): the 1955Z control band is STALE on the
current base — the same staleness finding #1058 recorded for the
73671–73678 band now extends to 73601 (Arc IV regression on that
seed). Future seat arms must re-baseline before judging against
1955Z numbers; this arm's verdict does not depend on 1955Z numbers
at all (it judges seat+wait against seat-only on the same new band,
same base, same instrument).

## Instrument

- scripts/test-waitlong-sweep.js: 3-leg sweep (baseline, seatonly,
  seatwait), per-config INCREMENTAL corpus writes to
  evidence/2026-10-27/perseed-waitlong-a/ (direct write, writer
  fallback unused — all 24 rows landed direct), plus --probe and
  --sense modes. No src/js touched; no policy file created.
- Why recording (new in this instrument): before each day's
  policy.daily, on days where progState shows tableWaiting and
  !tableDone and rank >= national, the wrapper records
  Game.tableEntryBlock() (pure reads, no RNG, no writes — NOT
  tablePreview(), whose tableEarnedPaths path can consume Math.random
  via table-witness.js) plus the scholar's map position. That is
  exactly the block the seat drive sees that day. Neutrality proven
  by the same-base probe comparison above.
- Known instrument gap (disclosed, does not weaken the verdict):
  firstWaitingDay is a POST-daily observation, so a seat taken on
  the very first waiting day leaves firstWaitingDay null and latency
  null (74006, 74007 below — latency effectively 0 days, recorded as
  null, never as a number). Likewise tableInvited UNDERCOUNTS seated
  seeds on the armed legs (see Results note). The prior instrument
  used a pre-daily snapshot and counted all invitations; a future
  arm should record everTable pre-daily.

## Results

Sweep: 24/24 configs, seeds 74001–74008, horizon 180 loop-days,
death-aware. All per-config writes landed direct. G3 corpus integrity
PASS (24/24 rows, days > 0, ts + court objects present). G2
pre-national read-only: N/A, not failed — every seed reached national
on every leg (natEver 8/8 on all three legs), so no seed stayed
pre-national on all legs to compare. Substitute read-only evidence:
the 5 idle seeds (no tableWaiting on any leg) are EXACTLY identical
across all three legs on days/gameDays (74001: 180/181; 74002: 174/174;
74003: 180/181; 74005: 180/181; 74008: 180/181) — the wrappers are
read-only where the legs never gate in.

### Sweep-compare table (the panel substitute — see panel note)

| Metric | Baseline (leanlinkrescue-only) | Seat-only | Seat+wait |
|---|---|---|---|
| n | 8 | 8 | 8 |
| Won (table win flag) | 0 | 3 | 3 |
| Median days / max days | 180 / 180 | 180 / 180 | 180 / 180 |
| National ever / final | 8 / 5 | 8 / 7 | 8 / 7 |
| Table invited ever (instrument count; see note) | 3 | 1 | 1 |
| Table invited ever (true: seeds with a seat leg firing) | 3 | 3 | 3 |
| Table entered (tableDone ever) | 0 | 3 | 3 |
| Wave 4 / wave 5 reach | 6 / 0 | 5 / 0 | 5 / 0 |
| Max arc | 4 | 4 | 4 |
| Starvation deaths | 5 | 3 | 3 |
| Total deaths | 301 | 225 | 225 |
| Seat attempts / taken | 0 / 0 | 3 / 3 | 3 / 3 |
| Seat days / kinds | — | 94, 157, 95 / lesser x 3 | 94, 157, 95 / lesser x 3 |
| Table answers / paths | 0 / — | 15 / feared x 3 | 15 / feared x 3 |
| Wait days / at-Haven / returns / stranded | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 2 / 2 / 0 / 0 |
| Previews seen / not-ready | 0 / 0 | 4 / 1 | 4 / 1 |
| Why-block days (armed legs) | — | combat 1, ready 3, haven 0 | combat 1, ready 3, haven 0 |
| Why-block days (baseline counterfactual) | combat 37, ready 69, haven 0 | — | — |

### Per-seed paired table

| Seed | Baseline | Seat-only | Seat+wait |
|---|---|---|---|
| 74001 | 180d, survived, global/global, tab 0, starv 0 | identical (no table → legs idle) | identical |
| 74002 | 174d, village-lost, global/regional, tab 0, starv 2 | identical | identical |
| 74003 | 180d, survived, global/global, tab 0, starv 0 | identical | identical |
| 74004 | 173d, village-lost, global/regional, tab 1 (firstWait 85), starv 2 | 94d, over-other, ent 1, won 1, seat d94 lesser feared, previews 2, not-ready 1, latency 9d, starv 0 | IDENTICAL to seat-only on every field except tsWaitDays 2, tsWaitAtHaven 2 |
| 74005 | 180d, survived, national/national, tab 0, starv 1 | identical | identical |
| 74006 | 176d, village-lost, global/global, tab 1 (firstWait 157), starv 0 | 157d, over-other, ent 1, won 1, seat d157 lesser feared, previews 1, not-ready 0, latency null (first-day seat) | identical (wait leg never ran: seat taken before it could) |
| 74007 | 167d, village-lost, global/global, tab 1 (firstWait 95), starv 0 | 95d, over-other, ent 1, won 1, seat d95 lesser feared, previews 1, not-ready 0, latency null (first-day seat) | identical (wait leg never ran) |
| 74008 | 180d, survived, national/national, tab 0, starv 0 | identical | identical |

Per-seed identity check (seat-only vs seat+wait): deaths lists
identical on all 8 seeds; court counters identical on all 8 seeds;
ts counters identical on all 8 seeds EXCEPT the two wait counters on
74004 (tsWaitDays 2, tsWaitAtHaven 2, present only on seat+wait).
The wait leg's ONLY observable trace in 24 configs is its own
counters. Its death-cause table is identical to seat-only's cause
for cause (villager:villager combat 90, villager:combat 68, player
arena 30, villager monster 14, expedition 11, sickness 2,
player starvation 2, ambush 2, Choir Toad 1, villager starvation 1,
player contest 1, player sickness 1).

### Verdict against the pre-registered bar: NO-GO (waiting does not matter)

- BAND QUALIFICATION: TRUE via the latency branch. Seat-only
  latency on 74004 is 9 days (firstWaiting 85 → seat 94), which is
  >= 4 days and 4.5x the 1955Z band's max (2 days). The not-ready
  branch fails (total 1 < 6) — the band qualifies on latency alone,
  and the verdict below is therefore a real NO-GO, not a
  NOT-QUALIFIED cop-out.
- PRIMARY: seat+wait entered 3 − seat-only entered 3 = delta 0,
  need >= 2 → FAIL.
- COST BAR (reported; passes but cannot rescue a failed primary):
  starvation seat+wait 3 <= seat-only 3 + 2 → PASS; arm-only
  starvation 0 <= 2 → PASS; median 180 >= 0.8 x 180 (ratio 1.00) →
  PASS. Note the median condition is uninformative here: medians
  are saturated at the 180d horizon on all three legs (see Metric
  review).
- The 1955Z verdict was also NO-GO-for-wait (delta 0 on that band);
  this arm extends it to a qualified longer-latency band. Two bands,
  same answer.

### Why waiting cannot matter here (the mechanism, not just the null)

- ZERO Haven blocks in 24 configs. Across all legs and all
  waiting days, the why-block distribution is: baseline
  counterfactual 106 block-days (ready 69, combat 37, haven 0);
  armed legs 4 block-days (ready 3, combat 1, haven 0). The wait
  leg addresses exactly one block reason (not-at-Haven), and that
  reason never fired once.
- The scholar was AT Haven (4,4) on both of 74004's recorded block
  days (day 93 combat-blocked, day 94 ready). The wait leg's 2
  Haven-days on 74004 coincide with days the scholar was at Haven
  anyway under seat-only (same px/py on the same days) — redundant,
  not causal. Returns 0, stranded 0: the wait leg never once moved
  the scholar to Haven, because the scholar was already there.
- The 9-day latency on 74004 decomposes into delays the wait leg
  cannot touch: (a) the day-90 floor — firstWaiting 85, preview null
  until day 90 by design (tablePreview returns null below the floor);
  (b) days 86–92 with no recorded block and no preview — the legs
  are gated on rank >= national and the block snapshot shares that
  gate, so rank-dip days leave no trace in either counter (the
  instrument gap; the wait leg shares the same gate, so it is
  equally idle on those days); (c) ONE combat-blocked day (93,
  "Finish the current encounter before taking your seat," scholar
  at Haven — an encounter at home, not a journey problem);
  (d) ready day 94, seat taken. Waiting at Haven does not clear a
  floor, a rank gate, or an encounter.
- Baseline waiting stretches show what no-seat costs: 74007 waited
  from day 95 to death at 167 with 62 recorded block-days (38 ready,
  24 combat) and never sat; 74004 waited from 85 to 173 (27 recorded
  block-days before rank decay stopped recording: 21 ready, 6
  combat); 74006 waited 157–176 (17 block-days: 10 ready, 7 combat).
  On most recorded waiting days the seat was READY — the villages
  died with the door open, exactly as in 1955Z, and the seat legs
  (either variant) convert those days into wins. The wait leg
  converts nothing extra.
- The single away-from-Haven wait event ever observed across both
  bands (1955Z 73605: one wait-stranded day, scholar did not reach
  Haven in time) also produced no seat-day difference (seat day 161
  on both legs). Two bands, zero seat-day differences attributable
  to waiting, under both short and long latency.

### Results notes (measurement artifacts, not findings)

- tableInvited undercount on armed legs (1 vs true 3): the post-daily
  snapshot misses invitations that seat on their first waiting day
  (74006, 74007: tableWaiting clears to tableDone before any
  post-daily waiting snapshot). Baseline tableInvited (3) is correct
  because baseline never seats. True armed invitations = 3 (the same
  seeds as baseline: 74004, 74006, 74007). Entered/won are unaffected
  (tableDone persists). Future seat arms: record everTable pre-daily.
- Wave 4 armed 5 vs baseline 6 is a win artifact, as in 1955Z:
  74007 won on day 95 before wave 4 unlocked (baseline 74007 reached
  wave 4 by dragging to day 167 and losing). Not a regression.
- Starvation armed 3 vs baseline 5 is win-censoring, not a safety
  effect: baseline 74004's 2 starvation deaths happened after day 94
  (the armed run ended at the win); on non-seated seeds starvation
  is identical seed-for-seed (74002: 2, 74005: 1, elsewhere 0).
- Median days 180 on all legs: 5 of 8 baseline seeds survive to the
  horizon, and armed winners are outnumbered by horizon-survivors,
  so the median sits at the cap. The cost bar's median condition
  passes trivially here (see Metric review).

## Village assessment (plain words)

These villages are strong courtship villages: every one of the eight
reaches national, five hold it to the end, three get invited to the
table. Left alone, an invited village waits — and waits, and waits.
On 74007 the village waits seventy-two days with the seat ready on
most of them, fights off encounters at the door, and dies without
ever sitting down. Give the same village a policy that sits when the
seat is ready, and it sits the first day it can (74006, 74007) or
the first day the encounter clears (74004), and wins — three lesser
seats, three wins, all on the Feared path's light road, because
first-option answering walks the same door every time. Adding the
wait discipline on top changes nothing at all: the village was
already home. The wait leg spends two days confirming the scholar is
at Haven, on days the scholar was at Haven anyway, and the seat is
taken on the same day, by the same path, to the same win. Waiting,
here, is a ritual the village performs for itself while the real
obstacles — the ninety-dawn floor, a dipping standing, an encounter
at the door — sit outside its reach. The door was never locked
against distance. It was locked against time, standing, and trouble,
and waiting opens none of those.

## Reachability verdict

- Table seat: REACHABLE and EXERCISED on this band — 3/8 per armed
  leg (same seeds as baseline invitations), all lesser seats, all
  Feared path, first-option answers. The 1955Z seat result replicates
  on a fresh band and a moved base (entered 3/8, wins 3/8 per leg).
- Table win flag: REACHED — 3/8 per armed leg, 0/8 baseline.
- National: reached 8/8 ever on all legs (final 5/8 baseline, 7/8
  armed — the armed final gain is the wins ending at global).
- Wave 5: still 0/24 — the wall past national stands. The table win
  does not need wave 5 (wins at waves 3–4), so wave 5 remains its
  own blank.
- Arc IV: reached (max arc 4 on all legs; baseline invitations on
  3/8 seeds). Note the contrast with 73601 on this base, which no
  longer reaches Arc IV at all (see Probe Amendment) — reachability
  is seed- and base-dependent, and 74001–74008 happens to invite
  where 73601 now does not.
- Full seat: still untested (all seats lesser). The wait question
  does not touch the full-seat bar.

## Metric review

Pre-registered metrics bind this run and the verdict above stands on
them; no re-scoring was done. Revisions proposed for the NEXT run,
not applied here:

- MEDIAN-DAYS COST BAR IS UNINFORMATIVE ON HORIZON-SATURATED BANDS.
  Here all three medians sit at the 180d cap, so the 0.8x condition
  passes trivially and cannot detect a harmful arm. Combined with
  the 1955Z note (wins ending runs early depress the median), the
  median bar fails in both directions: too sensitive when wins are
  common, insensitive when survival saturates. Proposed revision:
  judge the cost bar on median days among NON-WON seeds (here:
  baseline non-won median 180 vs armed non-won median 180 — same
  PASS, cleaner logic), or on a survival-distribution comparison
  rather than a single median.
- LATENCY NEEDS A PRE-DAILY FIRST-WAITING RECORD. Post-daily
  firstWaitingDay leaves first-day seats with null latency and
  undercounts invitations (see Results notes). Proposed revision:
  record firstWaitingDay from the pre-daily snapshot (as the prior
  instrument did for everTable), so latency is 0 — not null — for
  first-day seats and invitations count all seated seeds.
- NOT-READY COUNTS UNDERSTATE LATENCY. 74004's 9-day latency produced
  only 1 not-ready preview, because floor days yield null previews
  (uncounted) and rank-dip days yield no drive at all (unrecorded).
  A future wait arm should pre-register latency (seatDay minus
  firstWaitingDay) as the primary latency measure and not-ready
  counts as a secondary, not the other way round — this run's
  qualification rule already did that via its OR-branch, and the
  OR-branch is what qualified the band.
- The band-qualification rule worked as designed: it prevented a
  cherry-picked band AND prevented a false NOT-QUALIFIED verdict on
  a band whose latency was real but preview-count-quiet. Keep the
  OR structure for future wait arms.

## Balanced panel

ATTEMPTED, NOT INGESTED — same failure as both 1955Z arms, verbatim:
`node scripts/balance-panel.js compare --before
evidence/2026-10-27/sim-waitlong-a-sweep.json --after (same) --out
/tmp/waitlong-panel` throws `TypeError: Cannot read properties of
undefined (reading 'days')` at scripts/lib/balance-scorecard.js:44
(comparePanels). Cause (unchanged): the panel compare ingests
panel-driver output (panel.json.gz with the scorecard's row shape),
not per-seed sweep corpora — there is no before/after panel pair for
this arm, so no compare .md exists to attach. The sweep-compare
tables above (identical seeds, paired rows, shared court counters,
same-base probe pass, G3 pass) are the §15 substitute for this run.

## Sense read

NON-MEASURED narration replay, seed 74004, seat+wait leg (ring 240
lines; the replay reached the seat and the win on day 94, matching
the measured run exactly — judged here for WORDS only).

- What waiting looks like in-fiction: the ring is a TAIL ring (240
  lines covering days 92–94 only), so the actual waiting stretch
  (days 85–92) is NOT visible in it — the wait's fiction during the
  waiting days cannot be judged from this replay, and this read does
  not pretend otherwise. What IS visible: on the combat-blocked day
  (d93) and the seat day (d94), the village's wait lines are the
  generic single sentence "You wait. The light changes. Nothing asks
  anything of you." (4x in the ring) — the known wait-narration
  repetition (backlog #1030), not a table vigil. Nothing in the
  visible fiction says "we are holding at Haven for the table"; the
  wait reads as ordinary idle days, and the seat arrives as an event
  (d94: the ring of pale light, the audit reading the real run —
  lesser seat, global standing, waves 1–3 faced 15/5/4, 10 contests,
  2 crises — "The table does not rise. It prices."), not as the
  end of a vigil. The d93 combat is present in-fiction ("You came
  back bloody. Nobody asks. Someone saves you the good seat by the
  fire."; the Herald/Big-Eyes at the treeline) — the encounter that
  blocked the seat is a real trouble at the door, not an abstraction.
- The table sequence itself reads sensibly, as in 1955Z: sanctity
  ("EVERYONE. SIT. WATCH."), the Feared beats as a tightrope (terror
  pledged as shield, "your own people go still too — a different
  stillness"), the light road earned (protected outnumber killed,
  food truth shared), "Show mercy" resolving into the shield-over-
  every-village epilogue, bearer Jerome Albrecht walking out alone.
  No robotic repetition, no filler loops, no contradiction in the
  table sequence.
- Villager behaviour sample (ring + final roster): routines read as
  people doing jobs — Petra leaving the foraging basket ("The pantry
  can't take more — sitting with the elders instead."), Deborah
  watering and weeding beds, Hadija stirring the pot and checking
  the meat, Werner heading out for water ("Water first. Everything
  else waits."). Repetitions flagged, not hidden: the bloody-return
  line repeats verbatim on d93 and d94; Deborah's watering line
  repeats; the passerby template ("A lean scout waits a while, then
  moves on down the road. Word travels about that, too.") is the
  known single-template beat (backlog #727 class). One visitor beat
  reads cold: "Tariq waits two days at your fire, getting thinner.
  Nobody answers." — that is courtship-policy behaviour (the policy
  did not answer), honestly narrated, not a narration defect. The
  final roster shows villagers with real occupations (postal worker,
  interpreter), forager profiles, agency observed, and one villager
  carrying four abilities (night_eyes, scream_cheese, echo_location,
  green_whisper) — people with histories, not placeholders.
- Overall sense verdict: the seat and the win read as earned and
  coherent; the WAIT reads as nothing in particular — generic idle
  lines, no vigil, no table-specific waiting voice. That matches the
  numbers: the wait leg has no fiction because it has no effect.

## Findings outside this arm

Reported, not chased; goal hidden_files not touched by this worker.

- 1955Z CONTROL STALE ON CURRENT BASE (extends #1058): seed 73601
  no longer reaches Arc IV (maxArc 3 vs 4, table 0 vs invited, seat
  0 vs won) under either prior instrument on this base. Any future
  arm judging against 1955Z numbers without re-baselining will
  misjudge. Next: a re-baseline arm for the seat bands on current
  master before further seat verdicts.
- TABLEINVITED POST-DAILY UNDERCOUNT (instrument note): future seat
  arms must record everTable pre-daily, or first-day seats vanish
  from invitation counts (here: armed 1 vs true 3).
- BASELINE WAITING IS LONG AND MOSTLY READY: baseline villages wait
  19–72 days with the seat ready on most recorded days (74007: 38
  ready of 62 recorded block-days). The cost of having no seat
  policy is measured in months of open-door waiting — the perishable
  window (#921) with the door open, not closed. A seat policy is
  load-bearing; a wait policy is not.
- WAIT-NARRATION REPETITION (already #1030, confirmed on this band):
  "You wait. The light changes. Nothing asks anything of you." 4x
  in the sense ring. A wait-variety pass would help the fiction of
  waiting generally, but it would not change this arm's verdict —
  the wait leg's null effect is mechanical (no Haven block ever
  fires), not narrational.
- CONTEXT (Steve ruling 2026-10-27, from MEMORY.md update during this
  run — not this arm's work, noted because it touches waiting):
  NO protection at the endgame table or in the waiting period;
  exposure is the price. This arm's combat-block finding (an
  encounter at Haven blocks seating) sits inside that ruled exposure,
  not against it — no action, and no wait-leg fix is proposed
  against the ruling.

## Loud-failure disclosure

- PROBE P1 FAILED on its written 1955Z expectations (see Probe
  Amendment). Root cause proven: base drift, not instrument error
  (prior instruments diverge identically on this base). The prereg's
  prescribed failure branch (strip the wrapper, re-probe) was NOT
  followed, for stated cause: the deeper check falsified its premise
  (wrapper perturbation), and stripping a proven-neutral recorder
  would destroy the why-recording while restoring nothing. The
  deviation is disclosed here and the prereg file is left unedited.
- NO IDLE/NO-OP ROWS HIDDEN: 5 of 8 seeds are idle for the wait
  question (no tableWaiting on any leg: 74001, 74002, 74003, 74005,
  74008). They are counted in all denominators exactly as the prior
  arms counted theirs, reported as idle in the per-seed table, and
  never presented as evidence for or against waiting. The verdict
  rests on the 3 invited seeds, where both legs fired.
- NO POLICY FILE CREATED OR DELETED BY THIS ARM: both legs reuse
  prior arms' files (tableseat.js, tableseat-nowait.js), already
  committed on this branch. A NO-GO here therefore leaves no policy
  trace to clean — the killed-arm deletion rule has nothing to act
  on, and nothing was silently kept either.
- PROBE SCRATCH: the prior-instrument probe run wrote to
  evidence/2026-10-27/perseed-waitlong-probe/ (summary + rows for
  seed 73601 only). Those numbers are preserved in the Probe
  Amendment above; the scratch directory itself was DELETED
  uncommitted before the final commit, so the worktree contains only
  committed work (no stray probe corpus).
- SAFE-COMMIT INDEX CLOBBER on the prereg commit (4f09c474a): after
  the commit the main index showed the prereg file staged-as-deleted
  plus untracked (the known clobber class). Repaired with
  `git update-index --add --cacheinfo` from the HEAD blob; the commit
  itself was verified correct (`git show --stat HEAD`) and
  `git status --short` is empty after repair. Same repair to be
  applied and verified after the final commit below.
- NO OTHER LOUD FAILURES: no safe-commit refusal, no EPERM flap
  during this run, no jest run (none required: no src/js changed;
  the sweep + probe + sense are the proof), no push, no bump, no
  live verification attempted.

## Convergence state

Axis scale-onramp: CONVERGING (unchanged). The wait leg is now NO-GO
on two independent bands: 1955Z (short latency, delta 0) and this arm
(qualified longer latency, delta 0, mechanism explained: zero Haven
blocks in 24 configs, wait leg redundant on its only firing seed).
Waiting is not a load-bearing ingredient for seat conversion; the
seat legs alone convert invitations to wins (3/8 per leg here, 3/8
per leg in 1955Z). The remaining wait question would need a band
where not-at-Haven actually blocks seating — no such band has been
observed (0 Haven blocks in 1955Z + this arm combined, outside one
stranded wait day that also changed nothing). Recommend the loop
stop spending arms on the wait leg and spend the next seat arm on
either path diversity (first-option Feared artifact, #917) or the
full seat (#920), with a re-baseline of the seat bands first (see
Findings). National reach itself is unchanged by the seat (8/8 ever
on all legs here) — the seat moves table conversion, not scale.
Wave 5 remains 0/24; the wall past national stands.
