# Journey succession r97 — FRESH SPLIT CASE + GENUINE SILENCE + WEEK-1 SECOND DEATH HUNT (lane B, pre-registration 2026-11-01, written before any play)

Leg 7 (succession). Rotation-b read 7 at this run's effective start
→ write 4 at closeout (succession → endgame wrap 7→4), and VERIFY
the file reads 4 afterwards (rotation writes have repeatedly failed
to stick in recent Lane B runs; the file is the authority, not this
note's claim).

Run number basis: last numbered Lane B succession run is r94
(landed, chain recorder proven, MIX fully classified, no fresh
split case). This run is r97.

## Run-start collision record (read before judging the leg choice)

This run first read rotation-b as 6 (crisis) and found a Lane B lock
(2026-11-01T18:57:00Z) whose worktree heartbeat (journey2-crisis-r96,
19:41:08Z) was 20+ minutes stale with no live process and a stable
note file — the body's guard rule calls that DEAD, so the lock was
deleted and a fresh lock written. That judgment was WRONG in outcome:
the r96 run was alive in closeout, not dead. It landed on master at
20:08:12Z (rebased hashes 5f205a98a + 791a1e503), advanced rotation-b
6→7, and deleted the lock file at closeout — including this run's
fresh 20:04Z lock, since closeout deletes the lane lock without
checking run_id. No work was lost and no r96 tree or branch was
touched by this run; the misjudgment cost only the lock confusion.
Adaptation, documented: this run plays leg 7 (succession, the
rotation file's current value) instead of duplicating r96's crisis
panel from one hour earlier, and its first worktree
(journey2-crisis-r97, empty, clean) was released and removed before
any play. Lesson carried: heartbeat staleness DURING closeout is
not death — re-check liveness immediately before closeout actions,
per the 2026-10-30 lesson, not just at run start. A fresh lock was
re-written at 20:14:36Z for this run.

Slug deviation, documented: the body slug journey2-succession is
unusable (done-merged registry entry + orphan directory on disk,
same class as r83/r87/r89/r91/r94). This run uses
journey2-succession-r97.

Base: local master at registration (f752cb662 — later than r96's
merge; sibling landings continued during startup). No push, no
bump, no live check — ship loop owns those. Gating freeze
(2026-10-27) stands; no gate, deed-bar, standing, wave, or
table-price change is in scope. Perception law untouched: invites
here are player-chosen; no partner-selection change is in scope.
No canon doc covers succession/mantle (CANON.md grep empty;
r54/r91/r94 preregs, unchanged) — none invented here. Instrument
only, zero src/js changes (same no-compete decision as r54–r94:
tackle-succession owns the succession inheritance build; this run
measures master for it, fixes only its own instrument, and
documents blanks, never fixes game code here).

## The question

r94 proved the chain recorder and the MIX classification, but its
fresh panel contributed NO new split case, NO silence to decompose,
and NO second death inside a week-1 window — so three of its
expansion triggers never fired and two of its interpretations
(any-recent == first-bearer; MIX explains silence) stand on r91
fixtures plus construction, not on fresh observations. This run
hunts all three on fresh seeds:

1. FRESH SPLIT CASE: does any fresh panel seed show a
   same-iteration double handoff (organic death + scripted kill
   in one iteration, or double-organic day) that the r94 recorder
   must split into two entries?
2. GENUINE SILENCE: does any fresh seed score silent under BOTH
   naming metrics, and does the MIX block decompose it fully into
   non-verbal transcripts and/or zero grief-topic draws?
3. WEEK-1 SECOND DEATH: does any fresh seed suffer a second death
   inside its week-1 window, making any-recent informative rather
   than equal to first-bearer by construction?
4. MIX RE-DERIVATION (r94 metric-review proposal, implemented
   here as a descriptive step, not a bar change): re-derive the
   MIX topic-phrase family from r97's OWN week-1 transcripts and
   report unclassified counts under BOTH the original 5-phrasing
   family and the re-derived family. A phrase family that only
   fits old transcripts is a measurement finding, not a pass.
5. CHAIN5-CARRY (regression): on the current master, does the
   fifth handoff still record fully, with fifth-successor bonds
   survived == pre and affinity diff 0?
6. VOICE (people check): full sense-read of ALL pilot week-1
   transcripts — conversation bar (NPC wants something, options
   engage/deflect, endings resolve/plant/owe), no fabricated
   shared history, no filler loops, no static menus.

Watch items carried from r94 (observed, not bar failures — check
whether they persist on fresh seeds): sentimental items vanishing
at some handoffs but not others (oath_ring; contract_quill,
reading_glasses, buskers_harmonica, spare_socks); scout
duplication (menu warns "(held by X)" yet driver assigns scout
anyway); double invite lines ("Want to come with us?" /
"Want to come with me?"); verbatim self-quote thread continuity
(Quinn d+7 quoting d+3).

## Instrument (r94 files + renames ONLY, no logic change)

- Driver: scripts/journey-succession-r94-20261101.js cloned with
  ONLY r94→r97 renames, date 20261101 (same day, kept), EVID dir
  2026-11-01 (same day, kept), mode succession-r94→succession-r97.
  CONVO_DAYS unchanged [3, 7, 14, 30, 45, 53, 64].
  POST_DAYS=70, EARLY_KILL_DAY=40 (r94 values).
- Forced seeds: SECOND_KILL_DPLUS=20, THIRD_KILL_DPLUS=20,
  FOURTH_KILL_DPLUS=10, FIFTH_KILL_DPLUS=10 (r94's 20/20/10/10).
  Controls: all four 0.
- Main analyzer: r94 analyzer cloned with ONLY renames, SEEDS
  29151–29154 → 29161–29164, forced list [29151,29152] →
  [29161,29162] (both occurrences), expanded-panel mentions
  29155/29156 → 29165/29166.
- Naming analyzer + proof test: r94 files cloned with ONLY
  renames (proof (e) replay still targets r91's seed 28152 with
  r91's exact env; proof (f) MIX fixtures still r91's; proof (a)
  fixtures still r83's — the proof proves the instrument, not the
  fresh panel).
- MIX re-derivation is a MANUAL post-panel step (read the fresh
  week-1 transcripts, list lately+mourning draw topics, compare
  against the scorer's phrase family) — NOT a code change, so
  the rename-only diff verification below still binds.
- Diff verification: strip r94/r97, old/new seeds, and the
  stated rename blocks; the remaining files must be identical.
  Any other diff is a stop-and-explain item.
- Expansion trigger (pre-declared): pilot 29161–29164 expands
  to 6 (adding 29165 chain-forced, 29166 control) if ANY pilot
  seed shows a same-iteration double handoff OR scores silent
  under BOTH naming metrics OR has a second death inside its
  week-1 window. Otherwise the pilot stands as the panel.
  (Note: trigger 1 or 2 firing is a FINDING for this run's
  questions, not a failure — expansion confirms it.)

## Pre-registered bars (binding, §14)

- DETECTOR: chainDeaths count == true bearer changes on 4/4
  pilot seeds (true count from game records: fifthDeath chain
  + organic deaths; a collapse on any seed is a NO-GO for the
  recorder, not re-scored).
- MIX-EXPLAINS: every seed silent under BOTH naming metrics
  must decompose fully into non-verbal transcripts and/or
  zero grief-topic draws; an unexplained silence is a NO-GO
  finding carried as an open blank, not re-scored as "unasked".
- CHAIN5-READABLE: full fifth handoff recorded on every forced
  seed that reaches its fifth-kill window; a recorder miss on
  such a seed is NO-GO (a seed that ends before the window is
  not a recorder miss — it is reported as such).
- CHAIN5-BONDS: fifth-successor bonds survived == pre on every
  recorded fifth handoff; affinityDiff5 = 0 on every one.
- M3v2b ≥3/4 on a pilot-only panel (≥4/6 expanded), same
  allowance shape as r94.
- C1v3 ok=true missing=[]; S1 missingExact=0; MG2v2 true;
  M1/M4 true; INVITE SEAM: every invite outcome spoken.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run. Metric doubts go under "metric review" for the NEXT
  run.

## Telemetry

node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/succession.json
--current 'evidence/2026-11-01/journey-succession-r97-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
Prereg rule (r89/r91/r94 precedent): a forced-chain panel must NOT
roll the unforced baseline forward — LOUD lines from forced
deaths are regime, not drift, unless investigation shows a real
bug. Baseline NOT rolled on LOUD lines without a same-run
investigation verdict.

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree after the panel. Standing pre-existing failure
families (r91/r94: measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes) are the baseline; any NEW failure is a
stop-and-explain item. Watch item (not mine to fix): r96's crisis
run reported scripts/test-capable-bot-20261014.js newly failing
("real capable player combat earns the food deed at first use",
suspected landings journey-establishment r72 / journey-scale r67)
— re-observe its status in this run's checkquick and report it;
a fix belongs to the owning lane. The run is instrument-only
(zero src/js diff), so no failure is attributable to r97 unless
the proof test itself fails.
