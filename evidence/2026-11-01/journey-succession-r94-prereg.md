# Journey succession r94 — CHAIN-DETECTOR FIX + WANT/LANGUAGE MIX (lane B, pre-registration 2026-11-01, written before any play)

Leg 7 (succession). Rotation-b read 7 at run start → write 4 at closeout
(endgame next), and VERIFY the file reads 4 afterwards (rotation writes
have repeatedly failed to stick in recent Lane B runs; the file is the
authority, not this note's claim).

Run number basis: last numbered Lane B runs are r91 (succession),
r92 (endgame), r93 (crisis, closeout commit 3365764e2 on master).
This run is r94.

Run-start state (to verify at registration): no lock file held at start
(previous Lane B lock absent); main tree clean; disk 20%. Worktree
registration initially blocked by the documented intermittent container
EPERM flap on .git ref writes (2026-10-23 class: probe writes to
.git/refs/heads fail with EPERM, worktree-reap's registry write fails
the same way). Registration retried, not forced — no manual ref
surgery on the main tree during the flap, per the standing lesson.
Reap's failure is non-blocking here: only 4 worktrees listed, well
under the 16 cap.

Slug deviation, documented: the body slug journey2-succession is
unusable (done-merged registry entry + orphan directory on disk,
same class as r83/r87/r89/r91). This run uses journey2-succession-r94.

Base: local master at registration (eec64a07a at run start — verify
in worktree). No push, no bump, no live check — ship loop owns those.
Gating freeze (2026-10-27) stands; no gate, deed-bar, standing, wave,
or table-price change is in scope. Perception law untouched: invites
here are player-chosen; no partner-selection change is in scope. No
canon doc covers succession/mantle (CANON.md grep empty; r54/r91
preregs, unchanged) — none invented here. Instrument only, zero
src/js changes (same no-compete decision as r54–r91: tackle-succession
owns the succession inheritance build; this run measures master for
it, fixes only its own instrument, and documents blanks, never fixes
game code here).

## The question

r91's metric review proposed two measurement refinements for the NEXT
run. This run implements both and tests them:

1. CHAIN-DETECTOR FIX: the r91 driver's per-iteration chain detector
   collapses a same-iteration double handoff into one entry (28152
   day 71: Ava died organically → Petra, then the forced fifth kill
   fired on Petra → Catalina, recorded as one Ava→Catalina entry;
   chainDeaths 7 instead of 9 true bearer changes, deaths.bearer
   undercounted by one, Petra absent from the naming scorer's
   recentDead list). Does the fixed detector record mid-iteration
   handoffs, so chainDeaths count == true bearer changes on every
   fresh panel seed?
2. WANT/LANGUAGE MIX: naming panels must report the week-1 mix
   beside named/total, so an unasked panel stops reading as a
   silent village: counts of non-verbal (non-shared-language)
   transcripts, and of lately+mourning draws by topic class
   (grief vs monster-naming debate vs other). Does the mix explain
   every silent-under-both seed on the fresh panel, or does a
   genuine silence survive decomposition?
3. CHAIN5-CARRY (regression): on the current master, does the fifth
   handoff still record fully, with fifth-successor bonds survived
   == pre and affinity diff 0?
4. VOICE (people check): full sense-read of ALL pilot week-1
   transcripts — conversation bar (NPC wants something, options
   engage/deflect, endings resolve/plant/owe), no fabricated shared
   history, no filler loops, no static menus.

## Instrument (r91 files + renames + two stated changes)

- Driver: scripts/journey-succession-r91-20261101.js cloned with
  ONLY r91→r94 renames, date 20261101 (same day, kept), EVID dir
  2026-11-01 (same day, kept), mode succession-r91→succession-r94.
  CONVO_DAYS unchanged [3, 7, 14, 30, 45, 53, 64].
  POST_DAYS=70, EARLY_KILL_DAY=40 (r91 values).
- Detector change (the ONLY driver logic change): chain handoffs
  are recorded inside the existing playerDeath wrapper at the
  moment of death (organic deaths route through playerDeath
  exactly like scripted kills — game.js health<=0, expedition,
  pit-trap, fight, and contest paths all call it). The wrapper
  reads the scripted-flag lets at call time, so each entry
  carries its own handoff's cause and flags; the old
  end-of-iteration comparison survives only as a bypass sweep
  (all-false flags, fires only for a bearer change that
  bypassed playerDeath — none known). A same-iteration double
  handoff (organic during runDays + scripted kill after) now
  records two entries, as does a double-organic day. All other
  driver logic unchanged; the recorder writes only rec fields
  (chainDeaths, armorMaps, notes, deaths) and never touches
  game state, so trajectories are unchanged by the fix.
- Scorer/analyzer change (the ONLY scorer change): the week-1
  naming report gains the mix block per seed: week1 transcripts
  total, non-verbal count, lately+mourning draws total, draws
  split grief/debate/other by topic class, named (first-bearer)
  and namedAny counts unchanged. Existing first-bearer and
  any-recent scorers UNCHANGED, so r91 fixture expectations
  still bind.
- Main analyzer: r91 analyzer cloned with ONLY renames, SEEDS
  28151–28154 → 29151–29154, forced list [28151,28152] →
  [29151,29152] (both occurrences).
- Proof: r91 proof test cloned with ONLY renames, plus (e)
  CHAIN-DETECTOR REPLAY: the r94 driver re-run on r91's seed
  28152 with r91's exact env (EARLY_KILL_DAY=40, POST_DAYS=70,
  kills 20/20/10/10) must split the known day-71 collapse —
  RED control: the committed r91 JSON records one
  Ava->Catalina entry with scriptedFifth=true while
  fifthDeath.oldFirst is Petra; GREEN: the replay records
  Ava->Petra (organic) AND Petra->Catalina (scriptedFifth),
  both via playerDeath, chain length old+1, first six entries
  identical, tele deaths.bearer old+1 (8->9). Plus (f): mix
  block on r91's own week-1 fixtures must report 28152
  non-verbal 2/4 and draws 0, 28154 debate >= 1 and grief
  >= 1, 28151 grief 2 and unclassified 0, and every seed's
  topic counts summing to draws. (c) strengthened: the smoke
  seed's scripted chain entries must appear in kill order
  2-3-4-5, one flag each, all via playerDeath. (a)–(d)
  carried unchanged (r83 fixtures, wrong-name control,
  driver smoke on proof seed, any-recent (d) on r89
  fixtures). Proof scratch deleted by the test, r56 pattern.
- Diff verification: strip r91/r94, old/new seeds, and the two
  stated change blocks; the remaining files must be identical.
  Any other diff is a stop-and-explain item.
- Expansion trigger (pre-declared): pilot 29151–29154 expands
  to 6 (adding 29155 chain-forced, 29156 control) if ANY pilot
  seed shows a same-iteration double handoff OR scores silent
  under BOTH naming metrics OR has a second death inside its
  week-1 window (the condition that makes any-recent
  informative). Otherwise the pilot stands as the panel.

## Pre-registered bars (binding, §14)

- DETECTOR: chainDeaths count == true bearer changes on 4/4
  pilot seeds (true count from game records: fifthDeath chain
  + organic deaths; a collapse on any seed is a NO-GO for the
  fix, not re-scored).
- MIX-EXPLAINS: every seed silent under BOTH naming metrics
  must decompose fully into non-verbal transcripts and/or
  zero grief-topic draws (want/language mix); an unexplained
  silence is a NO-GO finding carried as an open blank, not
  re-scored as "unasked".
- CHAIN5-READABLE: ≥2/3 forced seeds with a full fifth handoff
  (expanded-panel allowance, r91).
- CHAIN5-BONDS: fifth-successor bonds survived == pre on every
  recorded fifth handoff; affinityDiff5 = 0 on every one.
- M3v2b ≥4/6 on an expanded panel (≥3/4 on a pilot-only panel),
  same allowance shape as r91.
- C1v3 ok=true missing=[]; S1 missingExact=0; MG2v2 true;
  M1/M4 true; INVITE SEAM: every invite outcome spoken.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run. Metric doubts go under "metric review" for the NEXT
  run.

## Telemetry

node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/succession.json
--current 'evidence/2026-11-01/journey-succession-r94-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
Prereg rule (r89/r91 precedent): a forced-chain panel must NOT
roll the unforced baseline forward — LOUD lines from forced
deaths are regime, not drift, unless investigation shows a real
bug. Baseline NOT rolled on LOUD lines without a same-run
investigation verdict.

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree after the panel. Standing pre-existing failure
families (r91: measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes) are the baseline; any NEW failure is a
stop-and-explain item. The run is instrument-only (zero src/js
diff), so no failure is attributable to r94 unless the proof
test itself fails.
