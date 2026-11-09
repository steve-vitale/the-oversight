# journey-scale r112 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-20261109T0245Z (scheduled 20:45 CST 2026-11-08).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3). Verify the write by
re-reading the file — r108/r109/r110/r111 all claimed to write it and the
file still read 3 at this run's start; the dead 00:34Z deepening run wrote
3 at 00:49Z before dying, which is how it got here.
**Base:** master@db7fb1c6a at first scored seed ("journey social life
r159: 4-seed panel + NARR-line printing fix (adopted)").
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands** — raise answers read only live
pending raises from named villagers, answered in a real conversation
with the raiser; the sit drive reads only the engine's own preview.
**DELIVER OVER MEASURE (2026-11-01):** this run measures TWO questions
r111 left open (its metric review items 3 and 1) on a ladder that has
CHANGED since r111 — it is not a re-proof of a proven constraint. The
ladder leg-3 build (banked points + per-stage rewards + cash-out) and
the tribute scholar-readiness fix landed after r111's base, the medic
duty build (medics can cure now) and the doublenight fix changed
villager survival, and the pellet radiation rework changed the fusion
arm. The veteran wall and the seasoning wall are the full seat's two
named blockers; this run names which mechanism holds each one.

## Standing context (read before scoring)

- **r111 (2026-11-08, band 97801–97804, base 715c2918d): LADDER OPENS
  4/4 (National by d22–d43); lesser seat won 4/4 at d90–95; full seat
  priced 0/4.** No village ever faced wave 5 (w5 = 0 on all four
  seeds). Capstones: embassy delivered 1/4 (97803, d33); military_tribute
  NEVER ready (living wave-4+ veterans never exceeded 1 on any seed —
  0 on 97801/97803, 1 on 97802/97804 — even though 97804 fought 72
  wave-4 fights); trade_charter NEVER ready (0 chartered trade links;
  NO link seasoned on any seed within 90 days). Explore mints 26–43
  and caps on 4/4; fight mints 2–4. The ladder is a live sum, not a
  ratchet (peak is what the seat reads). Raise talks: accept echo
  16/16, brush-off close 16/16, unvoiced raise 3/16, unanswered
  invitation 8/16 — documented, not fixed.
- **What changed on master since r111's base (715c2918d..db7fb1c6a,
  src/js diff read for this prereg):**
  - **Ladder leg 3 (1aba12f05):** banked points store + read side +
    per-stage rewards + cash-out. A lost/cashed-out village's counted
    points bank (ladderBank, REPLACE); at most 6 count toward the NEXT
    village's Village stage only (detail.bankedHeadStart). A village
    holding Regional peak may cash out as a Respected Village
    (table_won frame, run ends won). The ladder r112 measures is not
    the ladder r111 measured.
  - **Tribute scholar-readiness fix (ladder.js, leg 3):**
    `_ladderLivingVeterans` NEVER counts the scholar now — readiness
    and delivery agree (delivery pays 2 NON-scholar veterans). r111's
    "max 1 veteran" read INCLUDED the scholar; on the new code the
    same read is non-scholar only, so the tribute bar is strictly
    harder and r111's count may have BEEN the scholar on some seeds.
    The attribution in Q1 settles that.
  - **Medic duty build (b74dc3007, [needs-eyes]):** Haven Medic Duty —
    medics tend first + sickest and CURE by ability or proper medicine
    (Steve's MEDIC CURE ruling). Wound-fever killed 24% of wounded
    villagers without a healer vs 2.4% with one (2026-11-08 census).
    This moves villager survival — and therefore WALL-MORTALITY.
  - **Doublenight fix (ff252c1ac):** endDay death branch falls through
    to the shared day-advance + dawn (no more double-night). Death
    timing changed; death-day attribution in Q1 is read off the new
    code.
  - **Pellet radiation rework (09ed9c109, d3f63d49e, 0d57a2378,
    [needs-eyes]):** the pellet bearer gains radiation poisoning on
    overuse (health cost, not pantry cost); cure hooks + endDay tick.
    The fusion instrument already records installed/online/ability;
    pellet lines are report-only here.
  - **Social life r159 (db7fb1c6a):** NARR-line printing fix — affects
    transcript rendering only; the people check re-reads transcripts
    on the new code.
  - **Linkdecay diag (6e69df4ef etc.):** DIAG only — decay census
    (succession −120 of −160 drag on 76408), recorder field only, NO
    behavior change. Q2 re-checks seasoning on the same behavior with
    new survival around it; expectation is STILL-WALLED.
  - **Tenddrive fix REVERTED (152ec1076):** the win-plan tend drive
    does NOT run while national. No tend change since r111.
- **The ladder, as landed (leg 1 + leg 2 + leg 3):**
  `Game.villageLadder()` → {stage 0–3, peakStage, counted, cap,
  tracks{ fight, forage, craft, talk, explore }, countedTracks,
  capped[], nextThreshold, shortfall, detail{ fightLedger, fieldXp,
  craftXp, links, contests, discovery, breadth, activeLinks,
  bundleBonus, bundleStages, bankedHeadStart }}. Five-track points
  with a ~60% per-track cap per stage; thresholds Village 12 /
  Regional 26 / National 40 (read live from `ladderCfg()` — the
  instrument records the live thresholds, never hardcodes them).
  `ladderStage()` never returns 4; stage 4 is the capstone delivery,
  recorded on progState. Capstones: military_tribute (2 living
  NON-SCHOLAR wave-4 veterans, the price — they leave the roster),
  trade_charter (a sealed chartered trade link + national+ scale),
  feast_embassy (feast bundle done while at National stage).
  `ladderCapstoneReady(kind)` is the read; `ladderDeliverCapstone(kind)`
  is the delivery (wired-exempt: leg-3 Haven entry point, app.js
  panelHaven calls it). Delivery starts the mercy window via
  `tableActive()`. The +4-per-stage bundle bonus is read inside
  `villageLadder()`.
- **Canon:** docs/SCALE.md (the four rungs, six national roads, beats
  played, anti-speedrun) + docs/CANON.md. The ladder is the victory
  gating (Steve's brief 2026-11-07); SCALE.md's scaleRank ladder
  (village→regional→national→global) is a SEPARATE ladder from the
  Standing ladder — the two must not be conflated. `scaleRank()` is
  the polity ladder; `villageLadder()` is the points ladder; the full
  seat needs BOTH (deed gate reads national/global scale AND ladder
  peak ≥ National).
- **r111 carried, NOT this run's question:** the accept echo, the
  unvoiced raise, post-accept brush-off close lines, the unanswered
  foraging invitation under a raise, the planted grievance thread
  (97804 Catalina / Andre). Re-counted in Q4, not re-litigated.
  Mutlaq's unanswerable raise is a design question for Steve, still
  open.

## Q1 — THE VETERAN WALL: why do wave-4 kills not become living veterans? (binding)

r111: 72 wave-4 fights on 97804, at most 1 living veteran on any seed.
The tribute needs 2 living NON-scholar wave-4 veterans. This run
attributes every wave-4+ kill: who killed it, and what happened to
the killer.

Instrument `scripts/ladder-instrument-20261109.js` (r111 instrument
clone + attribution fields): the daily snapshot adds `scholarVid`
(`Game.villagerId` that day), `sentimentTaught`
(`Game.sentimentTaught()`), and `killAttr` — wave-4+ kill counts
from `state.waveKillLog` with living checks via `vpOf` (the same
read `_ladderLivingVeterans` uses): {w4total, w4scholar, w4villager,
w4null, w4distinctVillagers, w4livingVillagers}. `finalize()` dumps
the full waveKillLog (wave ≥ 3 rows: {d, mid, w, by, via, trick}),
`waveKillByChannel`, and `scholarVidsByDay` (the daily scholarVid
map) to `journey-scale-r112-vetkill-<seed>.json`. The driver writes
that file; the analyzer joins kills to killer fate using the census
deathLog + end roster.

**Kill classification (pure function `classifyKill`, proof-tested):**
a waveKillLog entry on day d is a SCHOLAR kill iff `by` is the
literal `'player'` (the contest path logs the scholar that way) or
equals the scholarVid of day d or day d−1 (succession changes the
vid at day boundaries; the old scholar's body is dead, so a d−1
match can only be a scholar life); a VILLAGER kill iff `by` is a
non-null vid that is neither; UNKNOWN iff `by` is null. (TB fights
log the scholar as `by` = the scholar's current vid, `via` =
`'player'`; companion killing blows log `by` = the companion vid,
`via` = `'companion'` — read from game.js recordWaveKill /
tbKillRewards for this prereg.)
**Killer fate:** the telemetry deathLog is a 300-event ring, so
early deaths fall out of it before the run ends — and dead villagers
leave the roster, so a roster scan alone recorded 0 of 56 deaths on
the pilot (fixed before the band: the instrument now DRAINS the
telemetry ring every snapshot — one day's events can never exceed
the 300 cap, so a daily drain loses nothing — recording each unseen
death {vid, day, cause}, with the roster scan kept only as a backup
for death paths that never emit a telemetry death). A killer is
ALIVE iff on the end roster with dead=false; DEAD with the watch's
death day (+ cause from the deathLog when the ring still holds it);
GONE iff off the end roster without a death record (e.g. paid as
tribute) — never silently alive. "Died in the kill" = death day ==
kill day (the watch stamps the death's own day, not the snapshot
day).

**Mechanism bars (checked in order; the first that fires names the
wall):**
- **WALL-SCHOLAR** — scholar kills are ≥70% of wave-4+ kills
  band-wide: the tribute's 2-villager bar is starved because the
  player does the killing.
- **WALL-MORTALITY** — scholar share <70% AND ≥50% of distinct
  villager wave-4 killers are dead by run end: killers don't survive
  to be banked (report the median days from kill to death, and how
  many died on their kill day).
- **WALL-THIN** — scholar share <70%, mortality <50%, AND median
  wave-4+ kills per seed <8: the fights themselves are rare, not the
  attribution.
- **MIXED** — none fires: report the actual split (scholar %,
  mortality %, kills/seed) and name the largest contributor.
Secondary (report-only): kills per killer, via-channel split
(waveKillByChannel), wave-5 kills if any, max living veterans per
seed (the tribute readiness number, non-scholar read).

## Q2 — SEASONING RE-CHECK (binding)

r111: NO link seasoned on any seed within 90 days (seasoned = 30+
days old AND trust 40+). The linkdecay diag landed since (diag
only, no behavior change), but medic duty + doublenight changed
survival around it. Derived from the daily trustWatch (day, trust,
formedDay per link — already recorded): first seasoned day per link
+ links ever seasoned by d90.
- **SEASONS** — ≥2/4 seeds have ≥1 seasoned link by d90.
- **THIN** — exactly 1/4 seeds.
- **STILL-WALLED** — 0/4 seeds (r111's result, repeated).

## Q3 — LADDER OPENS, on the leg-3 ladder (confirm)

National (ladder stage 3) reached on ≥2/4 seeds = OPENS; exactly
1/4 = PARTIAL; 0/4 = STALLS. Same bar as r111 (4/4), re-run because
leg 3 changed the ladder (banked points, rewards, cash-out).

## Q4 — PEOPLE CHECK (sense law)

CONVO_DAYS [90, 120] transcripts read in full + ALL raise-answer
talks read in full. Re-count accept echo / brush-off close /
unvoiced raise / unanswered invitation (carried, not re-litigated).
Senseless count must be 0 to claim the people check clean.

## Secondaries (report-only, not judged)

- **Capstone delivery** (same verb as r111, same order:
  trade_charter → feast_embassy → military_tribute, free deeds
  first, costly tribute last; a competent player at National with a
  ready capstone delivers it; the delivery entry point is
  wired-exempt, app.js panelHaven only). First-ready day per kind +
  delivered kind/day. A capstone ready on ≥1 seed with 0 delivered
  is a DRIVER-VERB failure, named explicitly.
- **Full seat priced day per seed** (headline number, report-only).
- **sentimentTaught day per seed** (new instrument field — r111's
  metric review: the 97803 late-lesser story was inferred from a
  60-day gap; the exact day is now recorded).
- **Minting-balance bar:** explore capped on ≥3/4 seeds AND fight
  mints <5 on ≥3/4 = GAP-CONFIRMED (the cap does the balancing);
  else report the per-track minting split.
- **Cash-out watch:** if any seed ends via ladderCashOut
  (Respected Village), name the seed + day + banked points — it ends
  the run won and re-frames that seed's daycap.
- **Pellet-radiation watch:** fusion instrument rows + pellet lines
  in the capture; radiation deaths named if any.
- **National/global staging** (natGate watch, as r103–r111).
- **Table approach** (tableWatch + seat ledger).
- **Village assessment:** census in plain words.
- **D-THING / bonds / betrayals:** carried from the r106 analyzer
  as report-only counts.
- **Raise ledger:** per seed, from the policy stats + raiseHistory.
- **Realm dissolve / re-stage:** count per seed from natGateWatch /
  tableWatch rank transitions.
- **Feast bundle (carried, report-only):** bundleStages per seed —
  the embassy's precondition — from the ladder snapshot detail.

## Seed-band freshness (mandatory, per local_seed_band_freshness)

- Band 97901–97904, FRESH. Scope: ALL dated preregs
  (`evidence/*/sim-*-prereg.md` + `evidence/*/journey-*-prereg.md`,
  888 files) grepped for each seed as a whole token, plus ALL
  `*.md` files under `evidence/` (run notes, screens, extension
  bands) and ALL `*.txt` files under `evidence/`, plus the
  forbidden/contaminated lists named in those preregs (standacc-b,
  tendbelow/tendfloor-guard band-blocked, 2026-11-04/05).
  Result: 0 hits for 97901, 97902, 97903, 97904 in every scope.
  Near-misses, checked not assumed: 4-digit seeds 9790–9795 are
  DIFFERENT seed values from 5-digit 97901–97904 — disjoint, no
  collision. Rejected candidates, all used: 97801–97804 (r111),
  98000–98099 (awayconfirm-a 100-seed corpus + prodstore-a,
  2026-11-07), 97501–97516 (hurthome-fix-a, 2026-11-04),
  98601–98616 (hurthome-fix-c, 2026-11-04), 99001–99016
  (belongzombie-a / tendfloor-guard-b, 2026-11-04). 99201–99208 is
  the documented contaminated band — never used.
  Note: an unbounded full-tree grep (all files incl. .json/.gz/.log)
  was started and killed as too slow under load; the .md + .txt +
  prereg scopes above are where bands are named, and they are
  complete.

## Method

- PILOT GATE: baseline seed 97901 runs first. Crash, recorder errors
  > 0, or a reggate file with 0 rows → STOP, do not score the band.
  Pilot also gates the attribution: if w4null (unattributed wave-4+
  kills) is >50% of wave-4+ kills on the pilot, STOP — the
  attribution instrument is blind and the band would answer nothing
  (INCOMPLETE, not a verdict).
- DAYCAP=180, death-aware (a dead/scattered village stops; +10d tail
  max). Horizon reason (§10): reachability lever (national, table,
  wins) — 150–200d band; r107–r111 used the same cap on the same
  driver.
- Policy: r111's sit policy
  (`scalecourt-nogate-morntrace3-linkraise-sit.js`), unchanged — the
  sit/modal layers stay live (r110 proved them GO) and reusing the
  policy keeps the panel comparable to r109/r110/r111. Single leg:
  this is a MEASURE of the landed ladder + the veteran/seasoning
  walls, not a lever test — the instrument is read-only +
  delegating wrappers, so no baseline leg is needed.
- Telemetry: `telemetry-check.js` against
  `telemetry-baselines/scale.json` after evidence is written (metrics:
  fightsTotal,fightsByWave.4,maxGameDay). The driver emits those three
  keys at the trust-JSON top level. Any LOUD line is a same-run
  investigation item before the baseline rolls forward with
  --update-baseline. Do NOT roll a baseline forward over an
  unexplained LOUD line.
- **Gate note (carried, not hidden):** the full `check.js --quick`
  gate will NOT run inside this run unless it completes quickly — the
  r114 gate (284/6, all adjudicated pre-existing) ran on the line this
  base descends from, and this run changes ZERO src/js (scripts +
  evidence only). The r112 proof tests + pilot evidence are the
  regression cover, as for r107–r111. `check.js --quick` is attempted
  at the end and its result (green or timed-out) is reported honestly.

## Pilot addendum (written after the 97901 pilot, before the band)

Pilot seed 97901 ran full DAYCAP 180 (ended d90, won lesser, pop 1/1,
rank global, ladder peak National d32, 0 instrument errors, 87
reggate rows, 89 ladder rows, w4null 0% — all pilot gates PASS).
Two instrument defects found on the pilot's evidence, both fixed
before the band (instrument-only, zero policy/behavior change; the
band re-runs 97901 with the fixed instrument and the pilot's 97901
files are superseded):
1. **Death watch blind:** the roster-scan-only watch recorded 0 of
   56 deaths (dead villagers leave the roster). Fixed: daily drain
   of the telemetry ring (primary) + roster scan as backup; deaths
   now carry {vid, day, cause}.
2. **killAttr mislabeled past scholar lives:** the same-day rule
   counted kills by a PAST scholar life as villager kills (pilot:
   all 3 wave-4 kills were the scholar's across two lives, via
   'player'; the old rule reported w4scholar 0 / w4villager 3).
   Fixed: killAttr now uses the day-joined rule (classifyKill +
   scholarVidsByDay), matching the analyzer. Regression test added
   (succession case).
Pilot headline (unscored, single seed): WALL-SCHOLAR pattern — 3/3
wave-4 kills by the scholar, 0 villager wave-4 kills, 0 living
veterans; seasoning SEASONS (4/5 links seasoned by d54–d63, vs
r111's 0/4 seeds) — both to be judged on the band, not the pilot.

## Pre-registered metrics (bind the run — §14)

- PRIMARY: per-seed wave-4+ kills by class (scholar/villager/
  unknown) with the day-joined rule, distinct villager killers,
  killer fates (alive/dead, death day + cause, died-on-kill-day),
  max living (non-scholar) veterans, first seasoned-link day per
  seed, first-day-reached per ladder stage 1/2/3 (or never), peak
  stage, counted + shortfall + capped tracks at end, per-track
  totals, bundleStages, first-ready day per capstone kind + reason
  when not ready, delivered kind/day (or never), first priced day
  per seat kind (lesser/full), sentimentTaught day. A miss is
  INCOMPLETE, never re-scored against a friendlier metric mid-run.
- SECONDARY (report-only): survived days, end cause, pop alive/end,
  national/global, seat priced, transcript senseless count (must be
  0 to claim the people check clean), raise-talk senseless count
  (must be 0), dissolve/re-stage count per seed, capstone delivery
  attempts (kind, day, ok, reason), cash-out events, pellet
  radiation deaths.
- Every run note carries a "metric review" section; if a metric proves
  wrong, the revision is proposed for the NEXT run.
