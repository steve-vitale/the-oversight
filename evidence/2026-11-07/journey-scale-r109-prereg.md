# journey-scale r109 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-20261107T1545Z (scheduled 15:45 CST 2026-11-07).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** master@ece67e0b2 at first scored seed (2030Z round merged:
witnessdoor GO, feaststopspend NO-GO, frozen-band bisect GO — all
policy/evidence, zero net src/js).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands** — raise answers read only live
pending raises from named villagers, answered in a real conversation
with the raiser; the sit drive reads only the engine's own preview.
**DELIVER OVER MEASURE (2026-11-01):** this run builds and tests the
lever r108 named — it does not re-prove the ask question.

## Standing context (read before scoring)

- **r108 (today, band 97001–97004): ASK-HAPPENS, GO.** Answering link
  raises moves the scale line two rungs downstream: national 0/4 → 2/4,
  global 0/4 → 2/4 (original base; rebased onto the xp-gear base the GO
  reproduces: national 0/4 → 2/4, global 2/4, different seeds carrying
  it). A lesser seat was priced on 97001 (original base) and **never
  sat** — `tableDone=false` every day to d178 while the village died.
  The other three seeds never priced a seat. No full seat, no sitting,
  on either leg or either base.
- **Blank named by r108 (this run's lever): the scale driver never
  sits.** The scalecourt stack contains ZERO seat-taking verbs — the
  same class sim-seatdrive found on the tribfloor stack (Oct 15):
  the courtship-road chain runs to completion and has nowhere to go.
  The seat is a Haven-panel action (`Game.tableTakeSeat()`, Steve
  2026-10-14) and only a policy that calls it can sit. The scale
  driver's table instruments only READ the price. "Never sat" is
  therefore at least partly a driver gap, not a game wall — and this
  run measures how much of it is.
- **Proven pieces, reused via require — not rebuilt, not copied:**
  `scripts/policies/seatdrive.js` (the seat driver: preview-ready →
  `tableTakeSeat()`, guard-classified, default-ON with SEATDRIVE=0
  opt-out; tableDone 13/16 on its substrate) and
  `scripts/policies/modalplay.js` (the table-modal driver: plays the
  seven doors via the REAL `Game.chooseTableOption()`, door rule =
  highest-strength EARNED door per the engine's own
  `tableEarnedPaths()` pricing, tie-break
  beloved/feared/relay/assimilated/defiant/witness/indispensable,
  beats by the drain precedent, NEVER the trial — trial-by-combat is
  opt-in existential risk, a Steve call, never a policy default).
  Both are policy-side only, zero src/js.
- **Canon (read, not reinvented):** docs/CANON.md + docs/TABLE.md —
  "the table prices the run, never gates on godhood; reachable by
  competent non-god play" (TABLE.md:62); the seat is taken from Haven
  (`tableTakeSeat` → `tableScene` → `tableOfferPaths`, phase 'paths',
  `chooseTableOption('path:<id>')` → `tableStartPath`); every table
  terminal sets `Game.over = true; Game.won = true` (table.js x4), so
  a completed drain is a completed story, never a wiped run.
  SEAT-TAKER (Steve 2026-10-26, item 495): only the player chooses
  who takes the seat. This policy NEVER picks a villager sitter — the
  sit uses the engine default (the player character), exactly as an
  unchosen sitting does in the real game.
- **Second blank (r108, documented not fixed): the raise-answer talks
  are invisible to the run's instruments.** They travel through
  `sayLine`, not `say`, so neither the say capture nor the saved
  transcripts see them; r108 read exactly one by probe. This run
  records them (read-only transcript read in the linkraise policy,
  driver writes one file per talk) so the people check reads ALL of
  them, not one probe.

## Q1 — DOES THE SCALE DRIVER SIT A PRICED SEAT AND PLAY A DOOR? (binding)

New policy `scripts/policies/scalecourt-nogate-morntrace3-linkraise-sit.js`:
`withSeatDrive(withModalPlay(linkraisePolicy))` — the sit drive runs
first at dawn, then the modal drain, then the linkraise daily. Order
is deliberate: the sit opens the modal and the drain plays it the
SAME dawn (the seatdrive-stack placement precedent — seatdrive outside
windefer). The seat-taker is never chosen by the policy (engine
default: self). The door rule is modalplay's proven rule, unchanged.
Env gates, set explicitly by the driver per leg:
- BASELINE leg (`SIT=0`): SEATDRIVE=0, MODALPLAY unset → both layers
  pure delegation, byte-identical to r108's armed (linkraise) policy.
- ARMED leg (default): SEATDRIVE=1, MODALPLAY=1 → sit + drain live.
Zero src/js changes; zero changes to any existing policy file except
one read-only addition (see below).

Raise-talk capture (read-only, no behavior change): the linkraise
policy records each raise-answer conversation's transcript lines
(`Game.convoGet(vid).transcript`, read AFTER `endConvo`, the same
read `runConversation` already makes) into `STATS.raiseTalks`
(day, vid, village, outcome, lines). It calls no RNG, mutates no
game state, and runs identically on both legs — the before/after
purity is preserved because both legs share the file. The proof pins
that a recorded talk changes no counter and no RNG draw.

Driver `scripts/journey-scale-r109-20261107.js` (r108 driver clone,
labels/seeds/EVIDIR/policy switch only + sit/modal stats in the census
+ raise-talk files + `won` in the census). Analyzer
`scripts/analyze-journey-scale-r109-20261107.js` (r108 analyzer +
before/after section for the seat ledger). Proof
`scripts/test-journey-scale-r109-sit-20261107.js` (wiring: sit wrapper
composes linkraise daily unchanged; SEATDRIVE=0 + MODALPLAY unset
delegates byte-identically; fake-Game sit: preview-ready →
`tableTakeSeat` called once, seat taken, modal drained to a door
pick by the strength rule; fake-Game modal: doors picked by
strength/tie-break, never trial, no honest pick → no call;
raise-talk record changes no counter; live smoke leg on seed 97001
in /tmp asserting 0 policy errors and stats recorded). Proof green
BEFORE any scored seed runs.

Two legs on identical seeds 97001–97004, DAYCAP=180, death-aware:
- **BASELINE leg** (`SIT=0`, EVIDIR `journey-scale-r109-baseline`):
  linkraise policy, sit/modal off. Must reproduce r108's REBASED
  armed shape (days 106/72/106/75, links ever 13, national 2/4,
  global 2/4) within stream noise; a material divergence is itself
  a finding (base drift since r108's rebase) and is reported before
  any armed verdict is claimed.
- **ARMED leg** (default, EVIDIR `journey-scale-r109`): sit+modal on.

**Verdicts (checked in order, judged against the REPLAYED baseline):**
- **GO** — a seat sat ≥ 1/4 on the armed leg AND a door played to a
  terminal (`Game.won` true, or a finals resolution recorded) on at
  least one sat seat. The scale endgame is reachable by a competent
  player: priced → sat → played.
- **PARTIAL** — a seat taken ≥ 1/4 but no door reaches a terminal
  (modal stalls / no honest pick / fight pause / downgrade loop), OR
  a seat priced on ≥ 1/4 but never sittable (`pv.ready` false) with
  the named engine reason. The wall is named (sitting vs playing),
  not guessed.
- **NO-GO** — no seat taken on any seed despite a priced seat, with
  the named cause from the counters (preview never ready / guard
  refused / drive error / sit attempted and failed), OR no seat
  priced on any seed on either leg — in which case the wall is
  PRICING, not sitting, and that is the finding (reported as such,
  not scored as a driver failure).

**What counts as interesting:** a GO (first sat seat on the scale
driver — the leg's own reachability verdict flips); a PARTIAL with a
named door-terminal blocker (which beat/phase stalls, from the
modalplay beat records); a NO-GO with a named cause (preview reason,
guard, or pricing wall).

## Purity guard (binding)

The only policy difference between the legs is the sit+modal drive,
which acts only when a seat preview is ready (sit) or a table modal
is pending (drain). Divergence check: from the reggate daily rows,
the first day the armed leg differs from the replayed baseline
(gate / known / links / proposeCalls) must be ≥ the first
sit-drive day (first day `sdPreviewSeen > 0` or a seat was taken,
from the sit stats). If the legs diverge BEFORE any sit-drive
action, STOP — the instrument or the policy is not pure. The
baseline replay must reproduce r108's rebased armed shape (above)
within stream noise.

## Secondaries (report-only, not judged)

- **National/global staging** (natGate watch, as r103–r108): rank
  timeline, shape, dissolve / re-stage, viewership at global.
- **Table approach** (tableWatch + seat ledger): seat priced daily,
  arc, tableWaiting / tableAnnounced / tableDone; preview seen /
  attempts / taken / failed / guard-refused; door played (id,
  strength, offered set), door terminal and outcome, table phase at
  end, `won`.
- **Village assessment:** census in plain words — who lived, who
  died, what they knew, what was missing; end-cause per seed.
- **People check:** CONVO_DAYS [90, 120] transcripts read in full
  (SENSE-TESTING LAW) — do villagers act like people at the scale
  horizon? Plus ALL raise-answer talks (from the new capture): does
  each accept read as a real agreement, not a menu press?
- **D-THING / bonds / betrayals:** carried from the r106 analyzer as
  report-only counts.
- **Raise ledger:** per seed — staged / answered-linked / answered-
  counter / skipped-not-ready / skipped-no-raiser / talk-failed /
  not-offered / expired, from the policy stats + raiseHistory.
- **Realm dissolve / re-stage** (r108 documented blank): count
  dissolve/re-stage churn per seed from natGateWatch; a realm that
  stages and dissolves three times in 88 days reads unstable — this
  run names the count, it does not re-litigate the design question.

## Seed-band freshness (mandatory, per local_seed_band_freshness)

- Band 97001–97004, DELIBERATE §15 REUSE of r107/r108's band — the
  same matched seeds before/after, exactly as r108 reused r107's.
  The reuse IS the design: r108's rebased armed corpus is the
  reference, this run's replay is the guard, the armed leg is the
  after-panel. No new band is consumed.
- Search scope: ALL dated preregs (`evidence/*/sim-*-prereg.md` +
  `evidence/*/journey-scale-*-prereg.md`) grepped for `9700[1-4]`.
  Result: named in exactly two earlier preregs, both today, both
  journey-scale — `evidence/2026-11-07/journey-scale-r107-prereg.md`
  and `evidence/2026-11-07/journey-scale-r108-prereg.md` — plus no
  forbidden/contaminated list.
- Near-miss, checked not assumed: `evidence/2026-11-06/
  sim-killerwild-b-prereg.md:67` quotes the inline forbidden list
  "9700–9711" from `evidence/2026-10-27/sim-ledgerbound-b-prereg.md:
  153`. That range is the FOUR-DIGIT seeds 9700–9711, rejected as
  contaminated there; it is disjoint from the five-digit seeds
  97001–97004. No collision.

## Method

- PILOT GATE: baseline seed 97001 runs first. Crash, recorder errors
  > 0, or a reggate file with 0 rows → STOP, do not score the band.
  Then armed seed 97001; then the remaining seeds, baseline leg fully
  before the armed leg (so a crash mid-band leaves a complete baseline).
- Telemetry: `telemetry-check.js` against
  `telemetry-baselines/scale.json` after evidence is written (metrics:
  firstCourt, watchers, tableTele, fightsTotal, fightsByWave.4,
  maxGameDay). Any LOUD line is a same-run investigation item before
  the baseline rolls forward. (r107/r108 caveat stands: the per-seed
  files may not carry those metrics in resolvable form — report
  honestly, do not roll a zeroed baseline forward.)
- **Gate note (carried, not hidden):** the full `check.js --quick`
  gate will NOT run inside this run unless it completes quickly — the
  r114 gate (284/6, all adjudicated pre-existing) ran on the line
  this base descends from, the 2030Z round changed zero net src/js,
  and this run changes ZERO src/js (scripts + evidence only). The
  r109 proof tests + pilot evidence are the regression cover, as for
  r107/r108. `check.js --quick` is attempted at the end and its
  result (green or timed-out) is reported honestly.

## Pre-registered metrics (bind the run — §14)

- PRIMARY: per-seed seat priced (y/n/day/kind) + preview seen +
  seat attempts/taken/failed + guard refusals + door played
  (id/strength/offered) + door terminal (won y/n, final outcome) +
  tableDone day + links ever + national/global + days lived. A miss
  is NO-GO, never re-scored against a friendlier metric mid-run.
- SECONDARY (report-only): survived days, end cause, pop alive/end,
  D-THING named/testable, bond sittings answered, transcript
  senseless count (must be 0 to claim the people check clean),
  raise-answer talk senseless count (must be 0), dissolve/re-stage
  count per seed.
- Every run note carries a "metric review" section; if a metric proves
  wrong, the revision is proposed for the NEXT run.
