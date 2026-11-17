# journey-scale r233 — PRE-REGISTER (lane A, leg 3 SCALE, single-arm measurement on current master)

**Run id:** `playtest-a-20261117T1155Z` (lock run_id `loop-a-20261117-1043Z`).
**Run:** scheduled Tue 2026-11-17 03:45 CST (09:45 UTC); lock created
10:43:31Z. **Flap delay (recorded, not hidden):** first `git pull`
failed 10:44Z on the host write flap (`update_ref failed for ref
'ORIG_HEAD': couldn't write '.git/ORIG_HEAD.lock'`); retry passed
("Already up to date"). Worktree registration took ~20 min
(10:46–11:06Z) under registry-lock contention; heartbeat landed at
registration (11:06:06Z) and a 9-min hbloop
(`~/workspace/worktrees/journey-scale-hbloop-r233.sh`, pid 61779) runs
for the whole run.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `34bcb7b0b` at prereg time (r232 closeout).
**Pre-flight:** main tree clean (`git status --short` empty, 0 files),
disk 45%, lock absent (no stale-lock recovery), `git pull` already up
to date. Reap ran (11/16 trees active, none removed — dirty trees
protected, as designed; the LOUD lines are other owners' trees).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run. The muster + march steps are POLICY (the competent
player drives existing game verbs — walking to a known tile), zero
`src/js` change at panel time. **TEST WITH ENCOUNTER GEAR (Steve
2026-11-13):** the policy fights with the party and gear the
competent player has by the leg — the muster/march steps are that
policy, not a fresh-solo fixture.
**DELIVER OVER MEASURE (2026-11-01):** this run MEASURES the scale wall
on current master and FIXES whichever owed blank reproduces (Q6) — a
measurement with a build attached, not a re-proof.
**Time-box (stated up front):** hard stop ~12:43Z (2h cron from the
10:43Z run start). The panel is 8 fresh seeds × 140d; each sim ~2.5
min. The `--quick` gate is launched in the background right after the
build commit (if any); the analyzer proof tests are the binding suite
for a driver-only change, and the gate result is reported if it lands
before closeout — if it does not, the run note says so and the merge
waits for it (no landing over an unfinished gate).

## Standing context (read before scoring)

- **r228 scale (landed 2026-11-16, master 410fb8109):** Q1 MARCH GO
  (the march puts the scholar in the room; the Herald fell on 135614
  arm B — caveat: at 1/700 HP, mauled by villagers over months, so the
  win was nearly free); Q1 MUSTER GO on the thin band (1 seed);
  **Q1 NATIONAL NO-GO on the wall** (no national, no full seat either
  arm; the titan kill moved nothing on the ladder). The wall moved from
  "the muster sits ready" to "the fight engages" — **the next wall is
  the deed gate opening and a capstone actually delivering.**
- **r232 deepening (landed 2026-11-17, master 34bcb7b0b):** slain-field
  fix landed (judged by proof test 37/37, panel UNMEASURED — 0 field
  kills in 16 seeds). **Refusal spam (finding, owed):** 103307 logged
  41 `'refused'` outcomes (10 distinct days), 103308 logged 31, as the
  scholar kept meeting the Herald without a ready muster — the same
  refusal line 4–8× a day. Owed follow-up: say it once per titan per
  day, or stop offering a fight the gate will refuse. **This run's Q6
  watches whether it reproduces on the scale leg.**
- **r228 finding #1 (owed): tableActive masks the muster.** 96 of 125
  muster rows on 135613 held 'tableActive' — but `tableActive()` is
  true whenever a ladder capstone has been DELIVERED and the finale
  hasn't resolved (the mercy window, not a live table sequence). The
  muster step's sanctity gate conflates the two; a village that
  delivers and never sits stays under sanctity for ~96 days. It did
  not change r228's outcome (short on every present day regardless),
  but the gate needs the distinction. **This run's Q6 watches whether
  it reproduces on the scale leg.**
- **What changed in the game since r228's base (410fb8109):** 45
  commits; net `src/js` change 5 files, +176/−26 — conversation.js
  (+70), convo-dialogue.js (+17), convo-wants.js (+22): dialogue-only
  (r231 deferred-ask fix, social-life C3d recap fix); titans.js (+91):
  the r232 slain-field reconciliation; build.js: version only. **No
  ladder / table / deed-gate mechanics change.** The plan-ignition
  DIAGNOSIS landed (expignite-b DIAG GO) but the fix arm
  (sim-planignite-fix-a) is still in flight elsewhere, and the
  reattach lever was reverted (net `src/` diff 0 for win-plan.js).
  This run measures the scale wall as it stands on master.
  (Correction note: MEMORY.md's "NOV 17 SHIP (947613d28): PLAN
  IGNITION" mislabels the hash — 947613d28 is a succession r229
  run-note edit; the plan-ignition diagnosis landed via the Loop B
  arms in the 7199f371f adoption wave. The substance stands: diagnosis
  landed, fix arm in flight.)
- **r230 succession (lane B, landed 2026-11-16):** village 89704 took
  the full seat day 90 on the buyout road (first full seat on the
  matched band since r219; gate opened day 84, feast embassy
  delivered). The binding wall is the deed gate opening and a capstone
  actually delivering — the same wall this run measures.

## Seed-band freshness

- **Band: FRESH 103401–103408.**
- Searched before the run: all `evidence/*/sim-*-prereg.md`,
  `evidence/*/journey-*-prereg.md`, `evidence/*/sim-*-*.md` — **0 hits**
  for any of 103401–103408. Searched `evidence/2026-11-16/` +
  `evidence/2026-11-17/` (all files) — **0 hits**. Searched the goal
  `hidden_files/` tree — running at prereg time (slow tree; result
  awaited).
- **Full-tree caveat (recorded, not hidden):** a `grep -rl` over all
  of `evidence/` was killed (SIGTERM) after ~29 min with partial
  counts only — 103401: 1 file, 103402: 15 files, 103403: 3 files
  (103404–103408 uncounted). Those counts are NOT prereg namings
  (the prereg-scope search above is clean); the likeliest shape is
  the numbers appearing as data values inside corpora (e.g. pantry
  kcal). A `git grep -l` over `evidence/` is running to name the
  files; if it names a prereg, forbidden list, screen, or extension
  band for 103401–103408, the band is corrected with a correction
  commit BEFORE the panel is judged — a later collision is corrected,
  not hidden (per the seed-band skill).

## Pre-registered questions

- **Q1 — NATIONAL / DEED GATE (primary, measurement, NOT a gate):**
  on current master, how many of 8 fresh villages reach national (by
  standing / by scaleRank), open the deed gate (`deedGateReady`), are
  offered the table, take a seat by d140? Interesting iff ≥1 reaches
  national with its road named (LEAD/BELONG/COVENANT/TRADE/CONQUEST),
  OR 0/8 with a diagnosable per-seed blocker (natgate blocker lines).
  The census carries the deed-gate half: capstoneReady /
  capstoneDelivered / seatFullDay per seed. No GO/NO-GO rides on the
  game — the verdict is the census + named blockers.
- **Q2 — REGRESSION GUARDS (fail the run):** r134 spoken-raise (0
  not-offered-spoken, ≥1 properly answered), vetbar 0 disagreements,
  trap-line 0 defect sittings, betrayal-sibling 0 defects, lived-days
  per-seed mean within ±25% of the 3-band rolling mean 119 (476/4),
  lesser seat priced ≥4/8.
- **Q3 — BARAKA / DAILY-PLAY MIME (read-only, carried).**
- **Q4 — PEOPLE CHECK:** read 1–2 full transcripts (d90/d120) in
  full, PLUS the nonverbal sittings AND all raise talks.
- **Q5 — CENSUS + spotter d90 + W5-INSTANCE.** Carried: w4
  fights/kills, banked veterans (2+), w5 unlocked/faced/killed,
  tribute states (M23 shape), survival.
- **Q6 — OWED-BLANK WATCHES (decide this run's blank):**
  (a) r232 REFUSAL SPAM — per seed, `'refused'` outcomes in the titan
  outcomes log. REPRODUCED iff any seed logs ≥10 refused.
  (b) r228 TABLEACTIVE MASK — per seed, muster rows held
  `'tableActive'` with the titan PRESENT. REPRODUCED iff any seed
  holds ≥7 present-held rows. If either reproduces, it is this run's
  blank to fill (refusal spam first — player-facing voice, smaller;
  the tableActive distinction second if time allows). If neither
  reproduces, the blank is whatever else the panel surfaces, or
  documented as not-reproduced.

## Policy (frozen)

`scalecourt-traderoad-r113-linkraise-sit` + muster ON + march ON (r228
arm-B policy verbatim, now THE policy — the march is no longer a
lever). Sortie INERT (r219/r223 decision stands). SIT false (the
table offer is STANDING — Steve 2026-11-06 — so a competent player
chasing the FULL seat lets the lesser seat wait; Q2 re-scopes to
lesser-seat PRICED, not taken). DAYCAP=140, death-aware stop (+10d
tail max). Seeds FRESH 103401–103408.

## Pilot gates

Seed 103401 first. STOP and diagnose (INCOMPLETE, not a verdict) on:
crash, census errors > 0, 0 census rows, reconciliation residual != 0,
teleOnly > 0, 0 trustset rows by d60, 0 national-gate rows, or no
vetbar rows by d60. Muster pilot gates: ≥1 musterWatch row on a
titan-located day, titanEnd snapshot present, 0 verb-wrap errors.

## Metric review (pre-registered, for the run note)

- The lived-days control is the per-seed mean 119 (476/4, carried
  from r228 — r207 461 + r215 522 + r219 444). DAYCAP is 140, so a
  per-seed mean near 140 reads +18% vs the control — inside ±25%,
  as in r228 (140.5/141.0). The control is stale upward pressure,
  not a tight bar; a BREACH still fails the run and is diagnosed,
  not waived.
- The lesser-seat bar (≥4/8 priced) is the r228 fraction (≥1/2)
  applied to 8 seeds. The SIT-false policy means priced-not-taken
  is the measurable half; the offer stands.
- Q1 is deliberately gate-free: on a wall that has held for months,
  a 0/8 with named blockers is the finding, not a failure.
