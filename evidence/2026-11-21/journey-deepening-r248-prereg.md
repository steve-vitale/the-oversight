# Journey leg DEEPENING — r248 pre-registration (2026-11-21, Lane A)

## Leg
Deepening, days 40–80 window, DAYCAP 100 (r213/r218/r222/r226/r227/r232/
r235/r236/r237/r238/r243/r244/r245/r246/r247 precedent). Death-aware: stop after 10
consecutive all-dead daily checks; never tick a dead village to fill the leg.

## Run
Run id `playtest-20261121T1345Z` (scheduled Sat 2026-11-21 07:45 CST).
**Rotation read `2` (deepening); write `2→3` at closeout with read-back.**
Run number r248 (r247 is the last deepening run, 2026-11-21 00:43Z).
**Base:** local master `b6aad8942` at registration.
Pre-flight: main tree CLEAN, disk 49%. `git pull` "Already up to date".
No lock existed; lock created 13:43:54Z (run_id above) before any work.
Heartbeat loop running (9-min cadence, detached setsid, pid 77620).
No push (ship loop owns pushes).

## Rotation race (recorded, not a defect of this run)
Deepening r247's closeout wrote rotation `2→3`, but the establishment r247
adoption (closed 13:47Z) overwrote it with a stale `1→2` write — its run had
read `1` before deepening r247 closed out. So this run re-plays deepening
(r248) on the file's current read of `2`. Closeout writes `2→3` again, with
read-back; a later run that read an older value must not overwrite it.

## Write flap (infrastructure, this run)
- NEW EPERM flap window opened 13:46:06Z (~47 min after the prior window
  ended 12:58:55Z) and ran ~43 min to ~14:28Z, then flickered (brief
  breather ~14:28–14:31, micro-breathers 14:38:18/14:38:38).
- Registration failed twice: (1) full `git worktree add` checkout EPERM
  ("unable to write file", "Could not reset index file to revision 'HEAD'");
  (2) retry failed on the pre-existing `journey-deepening` branch (leftover
  from r247 — tip == master, fully merged, closeout never deleted it).
- Recovery (establishment r247's documented sparse workaround):
  breather waiter probed every 20s; on the 14:38:18 breather deleted the
  stale branch, `git worktree add --no-checkout`, cone sparse checkout of
  every top-level dir EXCEPT `evidence/` — first attempt died mid-flight
  (empty index: the --no-checkout read-tree never populated it; repaired
  with `git read-tree -mu HEAD`, 12,475 files, status clean) — then a
  manual registry entry in the register script's exact shape via atomic
  write + heartbeat (registry lock was held by the LIVE Lane B
  `journey2-social` registration 14:39–14:47Z; waited, never
  force-released). **Consequence: this worktree has NO `evidence/` dir —
  the prereg and run note live in `evidence/2026-11-21/` inside the
  worktree as new files, and closeout must run
  `git sparse-checkout add evidence/2026-11-21` before safe-commit**
  (adding the whole `evidence/` dir would check out 94k files — do NOT
  do that). Panel JSONs live in the goal hidden_files evidence dir, as
  always.
- Reaper: SKIPPED (registry lock held, 9th consecutive skip — ALERT
  threshold crossed earlier today; holder is live sibling registrations,
  not a stuck reaper).

## Base delta vs r247's panel base `faa5d65a9` (src/js, +567/−13, 8 files)
`git diff --stat faa5d65a9..b6aad8942 -- src/js/`:
- `bond-initiation.js` +69/−4 — **journey-scale r248 (`36d694f13`):
  link-raise opener voice pools** (raise-opener variety by lore-how)
  [needs-eyes]. **LIVE** dialogue change; Q4 watches for varied raise
  openers. pool[0] is the pre-r248 line verbatim, so no existing wording
  changes — only new variants.
- `fieldFights.js` +24 — **sim-downedtwice-b (`f11b30882`): finding
  #2634 GO** (downed ally never re-targeted, 'goes down' fires once).
  **LIVE** combat change; marches/field fights may show it. The other
  +13 is the env-gated reseed-b lever (below).
- `conversation.js` +5, `convo-dialogue.js` +29 — **journey succession
  r262 (`a3fe07b25`): M12 escalator cap fix, staged witness sitting,
  M4 strip. LIVE**; Q4 watches for staged-witness sittings.
- `win-plan.js` +424, `villager-brain.js` +18 — **sim-reseed-b
  (`ef2cf64c2`, finding #2626) + sim-reseedbeat-b (`9145db1ef`,
  finding #2632)**: dead-target re-seed + its launch beat
  ("is hunting X now — the fire found a new trail"). **NO live behavior
  change: the whole arm is env-gated `PLANRESEED=1` (node sims only;
  in the browser `process` is undefined, so the lever is off)** —
  verified in code (`planreseedOn`, win-plan.js:317-325; header
  "Env-gated default-OFF (PLANRESEED=1)"). The driver sets no env flags.
- `game.js` +9 — revert residue of the net-zero lever arms below; no
  live change claimed (revert commits hash-verified identical to their
  bases).
- Net-zero lever arms (added then reverted; instrument + evidence only):
  SHAPE2, M2STEP2, LEADSIDE, DEPMAT/ROLL35/AMMO substrate, FIBERFETCH.
- `build.js` +2 — version bump only.

## Policy
Competent + MUSTER POLICY (r227 verbatim + r236 growth amendment +
r237 F1/F2 + r238 stand-down) + MARCH STEP (r228 verbatim, driver-only).
**The driver is deliberately NOT gated on the fresh projection** (r245
decision stands): a competent player who hears the dawn line sounds the
call, and the cooled path is the instrument — gating the driver would
hide the very behavior the game fix exists to narrate.

## Seeds
Panel 105061–105068 (8 seeds); probe seed 105069 (dedicated, NOT scored
in panel metrics — Q1-probe only). Seed-band freshness check
(local_seed_band_freshness): `git grep 10506[1-9] -- evidence/*-prereg.md`
— 0 hits; evidence filenames 2026-11-19/20/21 — 0 hits for 10506x;
`git log --grep 10506` — 0 hits. Nearest named bands 105051–105059
(r247), 105101. Band 105061–105069 is fresh.

## Canon read
docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 gate: standing >= 100 +
readiness bars; wave-5 gate: standing >= 200 AND wave-4 faced; wave-5
readiness bars 4 armored P>=15 / 6 armed / 3 tricks / 2 veterans with
wave-4+ kills; waves 3–5 deliberately counter-less — signature
counterplay is engine-real, learnable via `noteVillagerTrickObservation`)
+ docs/KNOWLEDGE.md + docs/CONVERSATIONS.md. NO canon doc covers
titans/muster — mechanism grounded in src/js/titans.js +
src/data/titans.json (Herald: wave 4, minAllies 10; quota 6 iff trust
>= 70 and opinion >= 10 else 2; refusal bars trust < 25 / opinion
< -10 / arrears > 0; Haven commit cap 3).

## Questions

### Q1 (PRIMARY, regression bar — unchanged from r244/r245/r246/r247): growth-line honesty
**Bar: GROWTH-LINE-GO = 0 bad lines; every growth call harvests exactly
or cools honestly** (analyzer `summarizeGrowth` verdict). A silent empty
call after a growth line is still NO-GO (analyzer case 95). Descriptive:
does the "enough, if the morning holds" clause fire in the wild again
(r246: fired 2×, both honest; r247: 0)? Does the cooled path fire
(r245/r246/r247: 0 cooled days/calls — needs a contest death between
dawn and the call)? r247 was NO-GO on the designed projection undercount
(105058 d85: dawn line understated the harvest by 2 allied blades when
a fresh split-village link's roster generated between dawn and the call)
— the build arm has not fixed it; this run re-measures the bar as
pre-registered, it does not re-score it.

### Q2 (descriptive, fourth measurement — NO bar): the wave-5 kill wall
r245: wave-5 unlocked 3/8, faced 2/3, **0 kills**. r246: unlocked 2/8,
faced 0/2, **0 kills** — the wall moved shape (unlock without encounter).
r247: unlocked **0/8** — veteran bar shut the door on the whole band
(`villageSlainW4=0` everywhere; all 5 wave-4 kills the scholar's alone).
Report `summarizeWave5` classes + party sizes on this fresh band:
unlocked / never-faced / faced-not-killed / killed, kills, deaths,
party sizes per fight. Descriptive sub-watch: **march-flee recurrence**
— r246 seed 105048 marched 7 days running and fled all 7 coalition
fights at full HP; r247: 3 march fights, 2 slain, 1 single flee (no
loop). Does a multi-day flee loop recur on this band (count consecutive
fled march fights per seed)? The wall is the deed gate opening + a wave-5
kill; this run re-measures it on the new base, it does not judge it.

### Q3 (descriptive — NO bar): the bow watch, FIXED instrument
BOWCRAFT is TURNED ON in live play; BOWKNOW/BOWOPEN are flag-gated OFF.
The driver counts a knower when `weaponCraft.bow >= 1` OR
`weaponCraft.crude_bow >= 1`, and reports the split
(`bowKnowersByKey: {bow, crude_bow}`). Report per-seed + panel totals.
Expected: `weapon_teach` = 0 (flag off — a non-zero count would be a
defect); equipped bows + the corrected knower count are the live-play
read on whether the turn-on reaches villages. The `weapon_craft`
telemetry key still counts ALL weapon crafts (not bow crafts) —
reported with that caveat, as in r246/r247.

### Q4: people check
Read 1–2 full transcripts from convo days 45/60/80; judge sense, not
counts (SENSE-TESTING LAW). Watch for, in the wild:
(a) a warn_you heed speaking the warning (landing r150 — seen r247
Stella, in her voice); (b) settled-help naming the favor (scale r247 —
NOT observed r247; still unmeasured in the wild); (c) a third sighting
of the closing-line duplication (Modhi r245, Noah r246 — r247 none);
(d) NEW: link-raise opener variety (scale r248 — do raises open with
varied lines now, or the same sentence every time?); (e) staged-witness
sitting (succession r262); (f) the r247 soft note: a want flipping from
need to dismissal in two turns with no reason given (Tashi) — does it
recur?

### Q5: census + reachable / fun / winnable
Survival, scholar deaths, ladder stage at d80, wave-4 kills, trick
pipeline, trust-paid-to-stranger watch, coalition-reach watch
(reached10 / stuck-at-9 — descriptive since r245), F8 wild watch
(UNMEASURED unless the confide line fires), stand-down probe (Q1-PROBE,
dedicated seed 105069). WINPLAN watch: NOT instrumented on the
deepening driver (the establishment leg owns it; 0/5 ignited on
r247-establishment, and the reseed arm is env-gated off — nothing new
to measure on this leg).

## Driver / analyzer forks
- Driver `scripts/journey-deepening-r248-20261121.js` (r247 fork: seed
  band, tag r248, EVIDIR 2026-11-21). Policy, instruments, probe staging
  unchanged.
- Analyzer `scripts/analyze-journey-deepening-r248-20261121.js` (r247
  fork: EVIDIR 2026-11-21, probe-file regex r248). Everything else
  unchanged.
- Proof tests forked from r247: analyzer, muster, march. All must be
  GREEN before the panel is judged; a fork failure is a tooling failure,
  not a game verdict.

## Metric review (standing)
- Q1 bar stands as written (r244/r245/r246/r247 precedent). A miss is NO-GO,
  never re-scored mid-run. r247's NO-GO was the designed undercount, not a
  cooled-call regression — recorded in r247's metric review; the bar is NOT
  revised this run; the build arm decides whether the bar or the line changes.
- Q2/Q3 descriptive as pre-registered; no verdicts taken on them.
- Q2 coalition-reach has NO bar since r245 (design call already with
  the build arm on five panels: r243 1/8, r244 4/8, r245 4 reached /
  6 stuck-at-9 at some point; r246 3 reached / 5 stuck; r247 3 reached /
  7 stuck, 9-blade shape persists).
- Q3 bow-watch metric caveat (instrument, not game): `weapon_craft`
  counts all weapon crafts, not bow crafts. The r246 `bowKnowers`
  key-coverage gap is FIXED since r247 (bow OR crude_bow + split).
- Probe determinism: r247 pilot and panel probe agreed (both day 64,
  5 blades, released, 0 stranded) — r246's pilot/panel drift did not recur.
