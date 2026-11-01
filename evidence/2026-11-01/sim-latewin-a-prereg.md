# sim-latewin-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-11-01)

Run: Loop A worker, axis scale-onramp, run fleshout-loop-a-20261101T1935Z.
Arm type: DIAG ONLY — zero src/js, zero policy-default flips, zero
edits to existing policy files, no gate threshold moved, no win-path
change built. Backlog #1619 (late wave-4 + fast lesser win) is a
measurement/design question, not a build order.

## Question (#1619, from sim-heraldcontact-a)

Seed 87120 reached wave 4 on day 144 and won on day 146. The brief
states a 13+ day omen staging clock (stage 0 -> 1 after >= 4 days ->
2 after >= 9 more days). Can a 2-day wave-4-to-win window fit the
titan road at all — is the lesser win supposed to be reachable
before the titan road even opens, or should the titan road open
earlier relative to the win? In other words: how often does a run
close (lesser win) before the titan road could possibly be ready,
and is 87120 an outlier or the shape of the road?

## REPLICATION band — stated plainly

The judged band is the heraldcontact pool 87101–87140,
longevity-screened with the SAME selection rule as
heraldcontact-a, and seed 87120 IS in-pool by design (it is a
pilot seed). This is a REPLICATION band for #1619's own seed, not
a fresh hunt. A replication that finds 87120's shape again
strengthens it; a band that does not reproduce it bounds it.
If the pilot fails, that is INSUFFICIENT-DATA — no band-shopping
mid-run; a further band is a new arm with its own prereg.

## Ground facts (verified on THIS base before judging)

- Omen staging (src/js/titans.js, titanAdvanceOmen, read on this
  base): stage 0 -> 1 when day - omenDay >= 4 (per-dawn roll 0.35);
  stage 1 -> 2 when day - omenDay >= 9 (per-dawn roll 0.4), and
  stage 2 RESETS omenDay to the placement day (titanPlace).
  CORRECTION TO THE BRIEF, RECORDED BEFORE SIMS: the stage-2
  gate compares against the ORIGINAL omen day (unchanged at
  stage 1), so the earliest stage 2 is omen-start + 9 days, NOT
  start + 13 days. The brief's "4 + 9 = 13" double-counts: the 9
  already includes the 4. With roll luck, stage 2 typically
  takes longer than 9 days, but 9 is the code minimum.
- CONSEQUENCE FOR THE QUESTION: the binding test of "could the
  road have been ready before the win" is whether omen stage 2
  was reached before the win day at all. The brief's literal
  13-day test (winDay - placeDay >= 13) is ALSO reported, as
  written, so the brief's bar is judged as stated and not
  silently replaced — but it is a stricter-than-code test, and
  the evidence says so.
- Titan placement follows wave-4 unlock + regional+ scale
  (titanDawnTick: wave >= 4 AND rank regional/national/global,
  10% per dawn to start an omen) — placement is NOT automatic on
  wave-4 unlock. Heraldcontact-a's companion finding (omen
  never started on villages reaching national at wave 2–3
  without wave 4) is NOT re-litigated; wave-4 day, national day,
  and omen stage are recorded jointly so the two findings are
  not conflated.
- The win in question is the LESSER win (lesser seat), not the
  full seat: full seat is still 0 everywhere. Lesser/full/none
  are counted separately in every table (seat from the engine's
  own tableSeat() at win/end).
- Prior record (NOT judged data, the replication target):
  heraldcontact-a's pilot JSON for 87120 (base 7c3295767) reads
  w4Day 144, won day 146, endOmenStage null, endOmenDay null —
  the omen had not even STARTED by the win. This arm re-measures
  87120 on the CURRENT base; the old JSON is never quoted as
  this arm's result.

## Base pin

- Worktree HEAD at prereg time: be352e2cb3 (Loop A round 1742Z
  coordinator evidence). Base moved since heraldcontact-a
  (7c3295767); every per-seed JSON carries its own
  anchorCommit, and the verdict judges THIS base only.
  Comparability legs (same-base, stated now): (a) screen-vs-
  sweep agreement on judged seeds (heraldcontact-a's screen
  corpus evidence/2026-10-31/perseed-heraldcontact/
  screen-87101-87140.json, reused as screening, NOT judged
  sims, vs this arm's sweep gameDays/won/national/table/
  maxWave); (b) one corpus determinism re-run to a scratch dir
  byte-identical to the judged JSON.
- Panel (§15): NOT APPLICABLE — single-base DIAG measurement,
  no before/after comparison exists in this arm; none
  fabricated.

## Census policy stack (heraldcontact-a / muster3 stack exactly)

withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=1 FULLSEAT=1, plus HERALD=1 MUSTER=1 recorders
(read-only, verbatim reuse: scripts/herald-instrument-20261030.js
+ scripts/policies/muster-diag.js), 200d death-aware cap
(harness Game.over stop; dead/won villages stop simulating).

## Selection rule (mechanical, fixed now — same as heraldcontact-a)

Screen corpus reused (40 seeds, longevity fields only, no
Herald content — selecting on longevity only keeps the
timeline question un-peeked). Tiers, in order, ascending seed
within a tier: A = un-won AND gameDays >= 120; B = won AND win
day (gameDays) > 120; C = un-won, longest gameDays first (only
if A+B cannot fill pilot+confirm).
Pilot = first 8 selected: 87104, 87115, 87119, 87127, 87137,
87140 (A) + 87109, 87120 (B). Confirm = remaining selected
seeds: 87121, 87124, 87126, 87134 (B) + 87107, 87135, 87132,
87123, 87103, 87138, 87128 (C).
PRE-REGISTERED DEVIATION (same one heraldcontact-a noted):
the pool yielded only 19 selectable seeds, so confirm is 11,
not 12–16. Fixed here, before sims, as "confirm = all remaining
selected seeds". The pilot/confirm split is never revised after
seeing timeline content.

## Per-seed timeline (all judged seeds)

Daily pure-read snapshot AFTER the policy daily delegates
inward (same posture as fullseat-diag): day, unlockedWave,
scaleRank, herald omen stage + omen day (raw state read, never
created), Game.won, progState tableWaiting/tableDone,
tableSeat() seat. Derived, per seed, with censored fields NULL
(never 0):
- wave4Day: first day unlockedWave >= 4 (or null = never).
- omenStartDay: first day herald omen non-null (or null).
- placeDay: first day omen stage == 2 (or null = never placed).
- nationalDay: first day rank national/global (or null).
- tableDay: first day tableWaiting or tableDone (or null).
- winDay: first day Game.won true (or null = never won);
  seatAtWin: tableSeat() seat on winDay (lesser/full/none);
  endDay: final scholar day; endReason; endOmenStage.
- Gaps: winDay - wave4Day; winDay - placeDay (null when
  either endpoint is null, including win-before-placement).
- roadPossibleBeforeWin: placeDay != null AND placeDay <=
  winDay (stage 2 reached on or before the win day).
- brief13Fit: winDay != null AND placeDay != null AND
  winDay - placeDay >= 13 (the brief's literal test, reported
  alongside roadPossibleBeforeWin, never merged into it).
- For un-won seeds, the analogous end-gaps use endDay in
  place of winDay and are labeled end-gaps, never win-gaps.

## Pilot gate (8 seeds before any confirm spend, §9)

Pilot GO requires: instrument fires on all 8 pilot seeds,
instrumentErrors 0 on all 8, per-seed JSONs valid (days > 0,
timeline rows cover the run), AND >= 1 pilot seed with a
COMPLETE timeline (wave-4 day observed AND win/end day
observed, not censored by a missing field; null for a
never-event on a run that ended is observed, not missing).
If pilot fails, verdict is INSUFFICIENT-DATA — no confirm
spend, no band-shopping.

## Confirm

ONLY if pilot GO: all 11 remaining selected seeds, same stack,
same instrument, same cap.

## Pre-registered GO thresholds (judge against these, §14 binding)

- DIAG-GO: complete timelines on >= 8 judged seeds AND the
  wins-before-titan-road-possible fraction stated with counts
  (W wins, of which K closed before omen stage 2 could be
  reached, i.e. NOT roadPossibleBeforeWin), AND 87120's pattern
  either reproduced (a win within 13 days of titan placement /
  before stage 2 — the reproduced shape is a win with
  roadPossibleBeforeWin false, and the winDay-wave4Day gap is
  stated) or bounded (the band's minimum winDay-placeDay gap
  stated, showing whether 2 days is an outlier).
- DIAG-GO-SINGLE-SEED: timelines complete but only one seed
  shows the late-wave-4/fast-win shape (bounded, not
  generalized).
- INSUFFICIENT-DATA: pilot gate fails (no complete timelines)
  or no judged seed reaches wave 4 at all.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run; metric doubts go under "metric review" for the NEXT
  run. Every evidence file carries a "metric review" section.

## Sense-testing (law, §11)

Read the final-days transcript (say ring, last 150 lines) of
the closest late-win seed (87120 if reproduced, else the
closest analog: latest wave-4 day among wins, or latest
wave-4 day among judged seeds). Judge meaning, not the gap
number: does the win read as earned before the titan road,
does the titan road feel late, or does the win feel like it
skipped content?

## Deliverables

- scripts/test-latewin-20261101.js proving the timeline
  derivation (synthetic rows only, no band seeds): staged
  wave-4 day, placement day, omen stage, win day -> gaps
  computed exactly; censored fields stay null, never 0.
- scripts/latewin-sweep-20261101.js (heraldcontact sweep with
  output dir + timeline snapshot added; no other behavioral
  change) + scripts/latewin-analyze-20261101.js (derives every
  judged number from per-seed JSONs only, no re-simulation).
- Per-seed JSONs under evidence/2026-11-01/perseed-latewin/
  leadfeast/; evidence/2026-11-01/sim-latewin-a.md (this
  prereg's verdict section judges against the bars above).
- Commit with scripts/safe-commit.sh — NEVER bare git commit,
  NEVER git add. No push, no version bump, no live verification
  (coordinator merges; report 'merged locally, pending ship'
  readiness).
