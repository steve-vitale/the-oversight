# sim-w3rederive-a — re-derive the wave-3 bar on this run's own base (axis scale-onramp)

Run: flesh-out loop A, 2026-10-26, arm sim-w3rederive-a.
DIAG ONLY — zero src/js changes, zero default flips, no edits to
any existing policy, sweep, summary, or check file. New files only:
a new sweep (scripts/test-w3rederive-sweep.js, a renamed copy of
scripts/test-wave3bar-sweep.js — same composition, same recorder,
only arm names and the corpus directory changed), a new proof test
(scripts/test-w3rederive-a.js), this evidence file, and the new
per-seed corpus. The wave3bar and hunttable sweeps, recorders, and
corpora are read, never edited; their seed numbers are NOT copied
into any bar here. The wave-3 recorder
(scripts/policies/wave3bar-diag.js) is reused read-only as the
instrument — it is a pure observer around Game.recordDeedFight
plus pure-read daily snapshots of deeds.wavesFaced and the live
tableSeat() pricing.

## PRE-REGISTRATION (binding, fixed by the arm brief BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md (manifest), docs/TABLE.md
  (lesser seat = waves faced 4/4/3 distinct, 2+ contests, 2+
  crises, scale >= regional, stage >= 2, food-thesis deeds
  sentimentTaught + feastSurgeUsed), docs/MONSTER-WAVES.md
  (wave law; deed feed = real blow-by-blow fights).
- Context read first: evidence/2026-10-26/sim-wave3bar-a.md
  and evidence/2026-10-26/sim-hunttable-a.md, for the exact
  method only. Bar definition: w3 >= 3 distinct monster ids
  in deeds.wavesFaced with wave 3; facing counts, killing
  does not matter. Columns: anchor vs hunt/driveoff-clean.
  NO claim from those corpora is carried forward as a number
  here: per the 1146Z run's instruction to the next run,
  collapsed seeds and the control case are re-derived on
  THIS base before any seed number is fixed into a bar,
  and the "2-seed blocker" claim is NOT cited without the
  base qualifier.
- COMPOSITION (new sweep file only): scripts/test-w3rederive-sweep.js,
  two columns on the pilot band 73901-73908, 180d death-aware
  horizon (dead villages stop; +10d tail max; 180 is the cap,
  not a fixed horizon), one seed per exec call, current base
  (worktree HEAD, recorded below):
  - anchor: plain tableseat-nowait (substrate LEANLINKRESCUE=1,
    TABLESEATNOWAIT=1, scripts/policies/tableseat-nowait.js)
    + the wave-3 recorder.
  - hunt: driveoff-clean shape EXACTLY as hunttable
    (FEASTDRAWCLEAN=1, tableseat-nowait substrate,
    COMPETENT_SEEK_FIGHTS left at default ON, feastdraw +
    nonworldkill recorders installed as the freshtransient
    sweep does) + the same wave-3 recorder.
  Seed band justification: 73901-73908 is the band both prior
  arms measured, so re-derivation on the same band is the
  only comparison that can show base drift per seed; no
  band change is justified, so none is made.
- DIAG-GO BAR (binding): DIAG-GO iff (a) det-gates pass on
  both columns (recorders OFF delegates byte-identically,
  no diag surface); (b) corpus complete, 16 rows, zero
  recorder errors/overflow; (c) per-seed table published
  for both columns: surge-met? (feastSurgeUsed + day),
  w3-met? (distinct count + day), seat? (lesser/full/none
  + day), win?, national-ever/final, wave-4/5, median
  survival, deaths, starvation; (d) verdict names exactly
  which seeds are w3-blocked-ALONE, surge-blocked-ALONE,
  both, or neither — with the base qualifier attached to
  every claim. Any leg missing = DIAG-NO-GO; land the
  record either way.
- SENSE plan: read the transcript around one blocked seed's
  stall and judge in plain words whether the stall reads as
  an earned wall or an invisible one. Report, don't decide.
- Balanced-panel note: scripts/balance-panel.js cannot
  ingest per-seed recorder corpora (known limitation,
  carried from hunttable/wave3bar) — do NOT fabricate panel
  inputs. The sweep-compare table is the comparison of
  record. Do NOT run telemetry-check on recorder rows and
  do NOT roll any baseline.
- METRIC REVIEW section below is mandatory
  (docs/MEASUREMENT.md §14): pre-registered metrics bind
  the run — a miss is NO-GO, never re-scored against a
  friendlier metric mid-run.

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO — all four legs met on this base (ac98043a)

- (a) DET-GATES PASS on both columns (pilot seed 73901, plain vs
  wrapped: days 29/29, gameDays 29/29, won 0/0, deaths 11/11,
  tsNationalDay null/null — the base row reports ts as
  undefined and the wrapped row as null; the sweep's match
  logic treats both as null, exactly as the wave3bar
  det-gates did).
- (b) CORPUS COMPLETE: 16 rows, zero recorder errors and zero
  overflow on every row (w3 errs 0, feastdraw errs 0 /
  overflow 0, nonworldkill errs 0 / overflow 0).
- (c) PER-SEED TABLE PUBLISHED for both columns below
  (surge day, w3 count + day, seat kind + day, win,
  national-ever/final, wave reach, days, deaths, starvation).
- (d) BLOCKER CLASSIFICATION (base ac98043a, hunt column,
  actuals — NOT counterfactuals): w3-blocked-ALONE: NONE;
  surge-blocked-ALONE: 73902, 73904, 73906, 73907, 73908;
  BOTH: 73903; NEITHER: 73901 (other bars unmet — died day
  29 before w2/rank), 73905 (seated, lesser day 133).
  The counterfactual form is stated separately below: with
  the surge held met, 73903 WOULD be w3-blocked-ALONE (every
  other lesser bar met, w3 at 2/3) — but on actuals it is
  both-blocked, because its surge is also unmet. No seed on
  this base is w3-blocked-ALONE on actuals. The
  "2-seed blocker" claim is therefore NOT carried forward
  without its qualifier: on hunttable's base
  (be8541647) the claim was 73903 + 73904; on this base
  (ac98043a) 73904 meets w3 (4/3, bar day 82) and is
  surge-blocked-ALONE, and 73903 is both-blocked.
- The proof test reports 87 passed / 0 failed
  (scripts/test-w3rederive-a.js, exit 0).

## DETGATES — BOTH RECORDERS MOVE NO PLAY (pilot seed 73901)

- Anchor: plain tableseat-nowait vs tableseat-nowait +
  wave-3 recorder: days 29/29, gameDays 29/29, won 0/0,
  deaths 11/11, tsNationalDay null/null — MATCH.
- Hunt: plain driveoff-clean (+recorders) vs driveoff-clean
  + wave-3 recorder: days 29/29, gameDays 29/29, won 0/0,
  deaths 11/11, tsNationalDay null/null — MATCH.
Artifacts: perseed-sim-w3rederive-a/detgate-anchor-73901.json
(+ detgate-anchor.json copy) and detgate-hunt-73901.json
(+ detgate-hunt.json copy). Both columns' bands were spent
only after their own det-gate passed, per the
pre-registration. Base for this run: worktree HEAD
ac98043a1e0edafb3ccaf802528844427424603c.

## (a) THE BAR, QUOTED FROM CODE (verified on this base before the sweep)

src/js/table.js `tableSeat()` (the lesser seat; the full
seat's `deedGateReady()` in src/js/progression.js uses the
same count with bars 5/5/4/3/2):

> "const lesser = w1 >= 4 && w2 >= 4 && w3 >= 3 &&
> contestsN >= 2 && crisesN >= 2 && scaleOk && stage >= 2
> && foodDeeds;"

where w3 = the count of DISTINCT monster ids in
`deeds.wavesFaced` whose stored wave is 3. Facing counts;
killing does NOT matter. Feed: src/js/progression.js
`recordDeedFight()` — keyed by monster id, value = wave.

## (b) THE TABLE — per-seed, both columns, base ac98043a

Face day = the deed-call day (exact); bar day = the first
daily snapshot showing w3 >= 3 (the following dawn; it can
lag the face day by the daily boundary). FF = fieldFight
(villager blow-by-blow fight), SC = player startCombat
(world/patrol encounter), DRAW = player startCombat against
the current feast draw. X = never. nat = national-ever /
national-final (final rank in brackets). Wave = max wave
reached; wave-5 = 0 on all 16 rows, so no wave-5 column is
needed. Seat kind is lesser on every seated row; no full
seat occurs in this band.

### Anchor column (plain tableseat-nowait)

| seed | days | won | seat | surge | w3 (count/day) | w3 faces (day:route) | nat ever/final | wave | deaths | starv |
|---|---|---|---|---|---|---|---|---|---|---|
| 73901 | 29 | 0 | none | X | 0/X | — | 0/village | 1 | 11 | 4 |
| 73902 | 101 | 1 | 99:lesser | 44 | 3/99 | chorus_line 83:FF, buffering 89:FF, callback 98:FF | 1/global | 3 | 22 | 0 |
| 73903 | 90 | 1 | 85:lesser | 28 | 4/85 | callback 73:FF, buffering 83:FF, ad_break 85:FF, redactor 87:FF | 1/national | 3 | 23 | 0 |
| 73904 | 94 | 1 | 93:lesser | 93 | 4/82 | ad_break 55:FF, spool 56:SC, gavel 82:SC, redactor 91:FF | 1/national | 4 | 28 | 0 |
| 73905 | 172 | 1 | 171:lesser | 27 | 3/171 | terms_of_service 139:DRAW, ad_break 150:DRAW, focus_group 171:DRAW | 1/global | 4 | 38 | 0 |
| 73906 | 138 | 0 | none | X | 6/50 | callback 30:FF, buffering 42:FF, redactor 49:FF, spool 65:FF, terms_of_service 98:FF, chorus_line 111:SC | 1/regional | 4 | 47 | 1 |
| 73907 | 165 | 1 | 164:lesser | 109 | 3/164 | focus_group 149:DRAW, redactor 163:FF, spool 164:SC | 1/global | 3 | 24 | 0 |
| 73908 | 176 | 1 | 171:lesser | 107 | 3/171 | buffering 131:DRAW, ad_break 140:SC, focus_group 171:FF | 1/global | 4 | 30 | 0 |

### Hunt column (driveoff-clean)

| seed | days | won | seat | surge | w3 (count/day) | w3 faces (day:route) | nat ever/final | wave | deaths | starv |
|---|---|---|---|---|---|---|---|---|---|---|
| 73901 | 29 | 0 | none | X | 0/X | — | 0/village | 1 | 11 | 4 |
| 73902 | 180 | 0 | none | X | 7/85 | redactor 61:FF, buffering 67:FF, callback 85:FF, chorus_line 100:FF, focus_group 120:SC, spool 121:SC, ad_break 136:FF | 1/global | 4 | 30 | 0 |
| 73903 | 180 | 0 | none | X | 2/X | spool 134:FF, buffering 150:FF | 1/regional | 4 | 31 | 0 |
| 73904 | 180 | 0 | none | X | 4/82 | ad_break 55:FF, spool 56:SC, gavel 82:SC, redactor 91:FF | 1/global | 4 | 60 | 0 |
| 73905 | 133 | 1 | 133:lesser | 97 | 3/133 | chorus_line 74:FF, terms_of_service 84:SC, spool 133:FF | 1/global | 4 | 21 | 0 |
| 73906 | 138 | 0 | none | X | 6/50 | callback 30:FF, buffering 42:FF, redactor 49:FF, spool 65:FF, terms_of_service 98:FF, chorus_line 111:SC | 1/regional | 4 | 47 | 1 |
| 73907 | 180 | 0 | none | X | 4/135 | redactor 124:FF, callback 134:FF, chorus_line 134:FF, spool 176:FF | 1/global | 3 | 21 | 0 |
| 73908 | 180 | 0 | none | X | 3/175 | redactor 173:FF, ad_break 173:FF, spool 175:SC | 1/national | 3 | 19 | 0 |

Median survival (death-aware; 180 is the cap, not a fixed
horizon): anchor 138d, hunt 180d.

## (c) BLOCKER CLASSIFICATION, WITH BASE QUALIFIER — base ac98043a, hunt column, actuals

"Other bars" = w1>=4, w2>=4, contests>=2, crises>=2,
rank>=regional, stage>=2, sentimentTaught met. Final detail
is the hunt column's final tableSeat() pricing.

| seed (hunt) | surge | w3 | other bars | seat | verdict (actuals) |
|---|---|---|---|---|---|
| 73901 | unmet | 0/3 | NOT ALL (w2 unmet, rank village — died day 29) | none | NEITHER (other bars unmet) |
| 73902 | unmet | 7/3, day 85 | ALL MET | none | SURGE-BLOCKED-ALONE |
| 73903 | unmet | 2/3 | ALL MET (w1 18, w2 10, contests 20, crises 3, rank regional, stage 3, sentiment day 13) | none | BOTH |
| 73904 | unmet | 4/3, day 82 | ALL MET | none | SURGE-BLOCKED-ALONE |
| 73905 | day 97 | 3/3, day 133 | ALL MET | 133:lesser | NEITHER (seated) |
| 73906 | unmet | 6/3, day 50 | ALL MET | none | SURGE-BLOCKED-ALONE |
| 73907 | unmet | 4/3, day 135 | ALL MET | none | SURGE-BLOCKED-ALONE |
| 73908 | unmet | 3/3, day 175 | ALL MET | none | SURGE-BLOCKED-ALONE |

Counterfactual, stated separately and NOT folded into the
actuals verdict: hold the surge hypothetically met on hunt
73903 — every other lesser bar is already met and w3 sits
at 2/3, so the seat would STILL fail, on w3 alone. In that
counterfactual sense 73903 is w3-blocked-ALONE; on actuals
it is both-blocked, because its surge is also unmet. This
is the precise form in which the wave3bar second-blocker
finding survives on this base: as a counterfactual on
73903 only, not as an actuals classification, and not on
73904 (which meets w3 on this base, as it did on
wave3bar's base).

Re-derived collapsed set on this base (anchor-seated AND
hunt-unseated): 73902, 73903, 73904, 73907, 73908. Note
73906 is NOT in it: it is unseated in BOTH columns
(surge-blocked in both — anchor surge X too), and 73902
IS in it (anchor seats day 99, hunt never does). The
collapsed set is a property of the base's trajectories,
not a fixed seed list — this is exactly why the 1146Z
instruction said to re-derive before fixing seed numbers
into a bar.

## (d) CONTROL COMPARISON vs wave3bar corpus (reported, not smoothed)

NO DISAGREEMENT — stronger than a headline match: all 16
rows reproduce the wave3bar corpus EXACTLY on days,
gameDays, won, wave, arc, final rank, national-ever/final,
table, entered, deaths, starvation, every first-day bar
(w1/w2/w3/contests/crises/stage/sentiment/surge/seat/
invitation/entered), finalSeatDetail, and w3FirstDay.
Band headlines are therefore identical: anchor won 6/8,
median 138d, natEver 7/8, table 6/8, wave-4 4/8, wave-5
0/8, deaths 223, starvation 5; hunt won 1/8, median 180d,
natEver 7/8, table 1/8, wave-4 5/8, wave-5 0/8, deaths 240,
starvation 5. The base drift that separated hunttable's
base (be8541647) from wave3bar's base (2ae24d41) does NOT
recur between wave3bar's base and this base (ac98043a):
the coordinator merges in between left these 16
trajectories byte-identical on every compared field. The
re-derivation therefore CONFIRMS the wave3bar corpus on
its own base rather than overturning it — and the base
qualifier for every claim in this file is ac98043a, with
wave3bar's 2ae24d41 corpus standing as an identical twin,
not as a superseded number. No wave3bar or hunttable
number was re-judged: their corpora stand as measured on
their bases; this corpus stands as measured on this one,
and the two happen to agree exactly.

## SENSE-TESTING READ (hunt 73903, from this run's own corpus)

The stall reads the same half-voiced way wave3bar found it,
now confirmed on this base's own lines. Day 90 the table
speaks: "the ring of pale light flickers at the edge of
the sky... and does not come. Not yet. The table is being
set for those whose deeds are done, and yours are not
done. The ledger still wants: wave-2 monsters faced;
wave-3 monsters faced; the food-thesis deeds. The climb
is not over." Day 96, after the fusion pellet installs
("You never need to eat again"), the beat turns on the
feast record: "WE PRICED THE RUN. NO HUNGER ON THE
RECORD — THE PELLET HUMS WHERE THE FIRE SHOULD BE. NO
FEAST, NO SURGE, NOTHING HERE WE CAN PRICE." The village
HAS feasted (8 grants, 8 draws all driven off) — a player
reading "NO FEAST" hears a contradiction, not a
direction. And neither beat ever says the act: face ONE
more distinct wave-3 monster; spend ONE feast in a real
fight. Judgment in plain words: a half-earned wall — the
fiction names the missing bars but not the play, and the
pellet line argues with the feast record instead of
clarifying it. No new sense finding beyond wave3bar's;
the read is a confirmation, not a discovery.

## VILLAGER-BEHAVIOR SPOT CHECK (sense, not counts)

Nothing new is introduced by this arm (zero src/js, zero
policy behavior change — the recorder only reads), so no
new behavior is claimed. What the fresh rows' say-lines
show is coherent, people-shaped texture throughout: the
System staging national beats, the realm dissolving with
spoken reasons, named villagers taking up brands at the
driveoffs. The failure mode is not robotic villagers — it
is the repeated driveoff template and the table beats that
name bars without naming acts, both already documented by
wave3bar and confirmed here.

## WALL NUMBERS (anchor = comparison base; hunt alongside)

Anchor: national-ever 7/8, national-final 6/8, table
invited 6/8, entered 6/8, wins 6/8 (lesser seat only),
wave-4 4/8, wave-5 0/8, Arc IV 6/8, median survival 138d,
max 176d, deaths 223, starvation 5.
Hunt: national-ever 7/8, national-final 5/8, table
invited 1/8, entered 1/8, wins 1/8, wave-4 5/8, wave-5
0/8, Arc IV 1/8, median survival 180d, max 180d, deaths
240, starvation 5. Guardrails (diagnostic only, never
verdict-flipping): starvation 5 vs 5, median 138d vs
180d, national-ever 7/8 vs 7/8, wins 6/8 vs 1/8 — the
win gap IS the table gap (every win on both arms goes
through the table; no win bypasses it). Median survival
is death-aware (dead villages stop; 180 is the cap,
not a fixed horizon).

## BLANKS FILLED OR DOCUMENTED

- FILLED (re-derivation, the task's core): the wave-3 bar
  and the blocker classification are now derived on THIS
  run's own base (ac98043a) with a complete 16-row corpus
  and a proof test (87/0) — no seed number in this file
  is copied from the hunttable/wave3bar corpora, and every
  claim carries the base qualifier.
- FILLED (actuals classification): on this base, NO hunt
  seed is w3-blocked-ALONE on actuals; five are
  surge-blocked-ALONE (73902, 73904, 73906, 73907, 73908),
  one is both-blocked (73903), two are neither (73901
  other-bars-unmet, 73905 seated). The "2-seed blocker"
  claim does NOT survive in its hunttable form: 73904
  meets w3 on this base, and 73903 is both-blocked, not
  w3-alone, on actuals.
- FILLED (counterfactual, precisely bounded): with the
  surge held met, hunt 73903 WOULD still be seatless on
  w3 alone (all other lesser bars met, w3 2/3) — the
  second-blocker phenomenon survives in exactly this one
  counterfactual, on this one seed, on this base.
- FILLED (base-stability finding): the 16/16 exact
  reproduction of the wave3bar corpus shows the drift
  between 2ae24d41 and ac98043a is nil on this band —
  the next run's re-derivation starts from a confirmed
  twin corpus, not from a drifted one.
- DOCUMENTED, NOT FIXED (carried, not chased — DIAG
  only): (1) the choice-price gap — driving off the draw
  silently forfeits the surge deed, and the table beats
  name bars without naming acts; (2) the day-96 pellet
  beat contradicting the feast record ("NO FEAST" after
  8 grants); (3) the verbatim driveoff template; (4)
  wave-5 remains 0/8 on both arms — the wall's next step
  after the table; (5) late feasts drawing no scavenger
  on hunt 73903 (grants after day 79 record no draw).
  Any game-code change for these is a finding for the
  coordinator/Steve, NOT implemented here.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No pre-registered leg, step, or definition was re-scored
mid-run. The run was judged exactly against its header:
DIAG-GO required (a) det-gates pass on both columns, (b)
corpus complete, 16 rows, zero recorder errors/overflow,
(c) per-seed table published for both columns with
surge-met, w3-met, seat, win, national-ever/final,
wave-4/5, median survival, deaths, starvation, (d) verdict
naming exactly which seeds are w3-blocked-ALONE,
surge-blocked-ALONE, both, or neither, with the base
qualifier attached to every claim. MET: (a) both det-gates
MATCH exactly (29/29 days, 11/11 deaths); (b) 16/16 rows,
zero errors/overflow; (c) the full per-seed table above
for both columns; (d) the classification table above
(w3-alone: none; surge-alone: 73902/73904/73906/73907/
73908; both: 73903; neither: 73901/73905), every claim
qualified with base ac98043a. The verdict is therefore
DIAG-GO, not a softened partial — the proof test honestly
reports 87 passed / 0 failed (node exit 0). One method
note, not a revision: the anchor and hunt bands are
different trajectories by design (different base
policies), so the per-seed tables compare REACHABILITY
of the bar per seed, never day-gaps as a score. PROPOSED
NOTE FOR THE NEXT RUN (not a revision of this run's
bar): pre-register the classification against actuals
AND state the counterfactual separately, as done here —
collapsing the two into one label ("w3-blocked") is what
let the hunttable "2-seed" phrasing drift.

## Infrastructure notes

- Sweep: scripts/test-w3rederive-sweep.js (new file only:
  a renamed copy of scripts/test-wave3bar-sweep.js — same
  composition, same recorder, only arm names and the
  corpus directory changed; verified by diff that the copy
  differs only in those renames plus mode/label strings).
  Recorder reused read-only: scripts/policies/wave3bar-diag.js
  (pure observer; no edits). Corpus:
  evidence/2026-10-26/perseed-sim-w3rederive-a/ (16 rows +
  summary.json + 4 detgate artifacts). Proof:
  scripts/test-w3rederive-a.js (87 passed / 0 failed —
  detgates, corpus, recorder cleanliness, bar-definition
  recomputation on 16/16 rows, table-field presence,
  classification computation, collapsed-set re-derivation).
- Det-gates: PASS on both columns (73901: 29/29 days,
  11/11 deaths, ts null/null).
- Base: worktree HEAD ac98043a1e0edafb3ccaf802528844427424603c
  (coordinator merge including sim-wave3bar-a). Wave3bar's
  base was 2ae24d41; the 16/16 exact corpus reproduction
  shows no behavioral drift between those bases on this
  band.
- Commit: sim-w3rederive-a, DIAG-GO (all four legs met;
  zero src/js diff). Ready for coordinator merge; NOT
  pushed, NOT bumped, live NOT verified (coordinator/
  ship-loop line, not this arm's). No [needs-eyes] flag
  applies (DIAG only, no narration, feel, combat, or UI
  change).
