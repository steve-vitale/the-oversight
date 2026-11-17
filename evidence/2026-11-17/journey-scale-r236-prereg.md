# journey-scale r236 — PRE-REGISTER (lane A, leg 3 SCALE, balanced before/after panel on current master)

**Run id:** `playtest-a-20261117T1838Z` (lock run_id `oversight-playtest-loop-20261117-1238`).
**Run:** scheduled Tue 2026-11-17 11:45 CST (17:45 UTC); lock created 18:38:31Z.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `eb2d3714f` at prereg time (sim-part2target-a evidence;
r235 deepening closeout 27e011474 is an ancestor).
**Pre-flight:** main tree clean (`git status --short` empty, 0 files),
disk 44%, lock absent (no stale-lock recovery), `git pull` already up to
date. Reap SKIPPED (registry lock held by a sibling release — consecutive
skips: 1 — no cleanup this run; 13 trees listed, cap 16). Worktree
registration took ~6 min (18:39–18:45Z) under registry-lock contention +
slow `git reset --hard` checkout; heartbeat landed at registration and a
9-min hbloop (`~/workspace/worktrees/journey-scale-hbloop-r236.sh`, pid
29745) runs for the whole run.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run. The muster + march steps are POLICY (the competent
player drives existing game verbs — walking to a known tile), zero
`src/js` change at panel time for arm A. **TEST WITH ENCOUNTER GEAR (Steve
2026-11-13):** the policy fights with the party and gear the competent
player has by the leg — the muster/march steps are that policy, not a
fresh-solo fixture.
**DELIVER OVER MEASURE (2026-11-01):** this run MEASURES the scale wall
on current master (arm A) and FIXES the owed tableActive blank (arm B) —
a measurement with a build attached, not a re-proof.
**Time-box (stated up front):** hard stop ~20:40Z (2h from the 18:38Z run
start). The panel is 8 fresh seeds × 140d × 2 arms; each sim ~2.5 min,
2 concurrent. The `--quick` gate is launched in the background right after
the build commit; the analyzer proof tests are the binding suite for a
driver-only change, and the gate result is reported if it lands before
closeout — if it does not, the run note says so and the merge waits for it
(no landing over an unfinished gate).

## Standing context (read before scoring)

- **r233 scale (landed 2026-11-17, master b5ebd2a9d):** Q1 NATIONAL NO-GO
  on the wall — 0/8, every survivor 2–3 seasoned links short (LEAD 0–1/3
  seasoned); capstones delivered 3/8 but the deed gate never opened.
  Guards all hold (spoken-raise GO, vetbar 0 disagreements, trap-line,
  betrayal, lived-days mean 123 vs 119, lesser priced 8/8). Muster MOVED:
  2 titans slain via marched coalitions. **Q6 BOTH OWED BLANKS
  REPRODUCED:** (a) refusal spam — 103402 logged 10 refused on ONE day
  (fixed this run: refusal line said once per titan per day,
  `src/js/titans.js`, proof 25/25, red verified 17/8); (b) TABLEACTIVE
  MASK — 103405 held `'tableActive'` on **78 muster rows over 74 days
  with the titan PRESENT on all 78** — the village delivered the feast
  embassy on d62 and then could never muster again, because the sanctity
  gate reads the mercy window as a live table sequence. **Owed next
  (r233 run note): the tableActive distinction — this run's blank.**
- **What changed in the game since r233's base (34bcb7b0b):** r235
  deepening (tooling + run note; prereg says net `src/` change is the
  r233 refusal fix already in base — verify at closeout), sim-part2target-a
  (evidence only), sim-nondeathplan-live-b (win-plan.js: non-death winPlan
  cleanup + #2482 classifier fix — a `src/js` change that touches plan
  launches; the scale leg reads winPlan, so arm A re-baselines Q1/Q2 on
  the current master rather than inheriting r233's numbers). No ladder /
  table / deed-gate mechanics change.
- **The tableActive mechanism (read in code before scoring):**
  `tableActive()` (table.js) is true in THREE states: (1) `winDeferred`
  (win-day-floor deferral — the table is promised and re-fires at dawn);
  (2) the LADDER MERCY window — `pg.ladderCapstone` delivered and the
  finale unresolved (phase != 'done'); (3) a live sitting (`tableDone`
  && phase != 'done'). The mercy window is protection from AMBIENT
  pressure (raids, roaming monsters, field fights — the routers in
  game.js, overtime, havenGrowth, npc-triggers, favor-* gate on it).
  A titan fight is NOT ambient pressure: it is a deliberate,
  player-initiated coalition hunt, and the engine's titan gate
  (`titanWrapCombat`, titans.js) never checks `tableActive()` — the
  fight is allowed during mercy. The sim driver's muster + march steps
  hold on `tableActive()` (their sanctity comment), so during the
  ~74-day mercy window the competent player never musters even though
  the engine would let the fight happen. **The fix:** a new engine
  query `tableSitting()` — true only while a table sequence is actually
  live (winDeferred, or tableDone && phase != 'done') — and the muster
  + march steps hold only on that. `tableActive()` itself is UNTOUCHED,
  so every ambient router behaves identically; only the muster/march
  hold predicate changes. The sortie step is inert (SORTIE false) and
  keeps its `tableActive` watch row unchanged.
- **Seed-band correction (recorded, not hidden):** the memory line for
  today named 103601–103608 as "fresh" for the next scale run — those
  are r235's deepening seeds (journey-deepening-r235-prereg.md:33 names
  them; r235.md plays them). This run uses **103701–103708** instead.

## Seed-band freshness

- **Band: FRESH 103701–103708.**
- Searched before the run: all `evidence/*/journey-*-prereg.md`,
  `evidence/*/sim-*-prereg.md` — **0 hits** for any of 103701–103708.
  Searched `evidence/2026-11-16/` + `evidence/2026-11-17/` (*.md) —
  **0 hits**. Searched the goal `hidden_files/evidence/2026-11-17/`
  filenames — **0 hits**.
- **Full-tree caveat (recorded, not hidden):** 103704 has 4 hits in
  `evidence/2026-11-17/` — all inside JSON panel case files
  (deathcleanup-panel-after/before, nondeathplan-panel-after/before),
  data values (a number substring inside case JSON), never a seed
  naming. The prereg-scope search above is clean. A later collision
  naming a prereg, forbidden list, screen, or extension band for
  103701–103708 is corrected with a correction commit BEFORE the panel
  is judged — a later collision is corrected, not hidden (per the
  seed-band skill).

## Pre-registered questions

- **Q1 — NATIONAL / DEED GATE (primary, measurement, NOT a gate):**
  on current master, how many of 8 fresh villages reach national (by
  standing / by scaleRank), open the deed gate (`deedGateReady`), are
  offered the table, take a seat by d140? Interesting iff ≥1 reaches
  national with its road named (LEAD/BELONG/COVENANT/TRADE/CONQUEST),
  OR 0/8 with a diagnosable per-seed blocker (natgate blocker lines).
  The census carries the deed-gate half: capstoneReady /
  capstoneDelivered / seatFullDay per seed. No GO/NO-GO rides on the
  game — the verdict is the census + named blockers. Same question both
  arms; the fix touches no ladder/table/deed-gate mechanic, so Q1 is a
  GUARDRAIL for arm B (no movement expected; any movement is
  investigated, never claimed as the fix's effect without a causal read).
- **Q2 — REGRESSION GUARDS (fail the run):** r134 spoken-raise (0
  not-offered-spoken, ≥1 properly answered), vetbar 0 disagreements,
  trap-line 0 defect sittings, betrayal-sibling 0 defects, lived-days
  per-seed mean within ±25% of the control **123** (r233's 8-seed mean —
  r233 metric review proposed rolling the control forward from the stale
  4-seed 119; applied here, stated up front, not mid-run), lesser seat
  priced ≥4/8. Same bars both arms.
- **Q3 — BARAKA / DAILY-PLAY MIME (read-only, carried).**
- **Q4 — PEOPLE CHECK:** read 1–2 full transcripts (d90/d120) in full,
  PLUS the nonverbal sittings AND all raise talks (arm B corpus — the
  arm that ships).
- **Q5 — CENSUS + spotter d90 + W5-INSTANCE.** Carried: w4
  fights/kills, banked veterans (2+), w5 unlocked/faced/killed,
  tribute states (M23 shape), survival. **Relabel applied (r233 metric
  review):** the analyzer's "wave-4 kills" line is relabeled "wave-4
  fights" and a band kill total is added from kAttr (`w4total`).
- **Q6 — THE BLANK: TABLEACTIVE DISTINCTION (decides the fix's verdict).**
  The driver records, on every muster + march row, the two predicate
  values at decision time (`ta` = `tableActive()`, `ts` = live-sitting:
  engine `tableSitting()` when present, else the same reads inline).
  A row is a MERCY row iff `ta && !ts`.
  - **Arm A (pre-fix, MUSTER_HOLD=active): REPRODUCED iff any seed holds
    ≥7 mercy rows with the titan present.** Expected: REPRODUCED (r233's
    103405 posted 78). If arm A does NOT reproduce, the run stops and
    diagnoses (INCOMPLETE, not a verdict) — the fix would have nothing
    to prove against.
  - **Arm B (fix, MUSTER_HOLD=sitting): GO iff (a) mercy rows held = 0
    on every seed (the muster/march no longer holds on mercy), AND (b)
    ≥1 mercy-window muster proceeds to a ready/called row on a seed
    where a titan is present during mercy (measured, not gated — a band
    with no titan present during any mercy window reads 0 honestly and
    the verdict falls back to (a) + the proof test), AND (c) live-sitting
    holds still fire when a sitting is actually live (0 required if no
    sitting coincides with a titan; if one does, it must hold — the
    sanctity that matters is preserved).**
  - **Q6(a) refusal-spam watch carried, MEASUREMENT ONLY (prereg
    correction, written before the panel runs):** the r233 fix dedupes
    the SPOKEN refusal line (once per titan per day); the `'refused'`
    OUTCOME is still recorded on every refusal by design, so an
    outcome-count bar (worst day ≥10) would false-positive on a healthy
    panel and cannot be the regression test. The outcome worst-day is
    reported per arm with no bar. The refusal fix's regression check is
    the r233 proof test re-run on the rebased tip
    (`scripts/test-titan-refusal-once-a-day-20261117.js`, 25/25 required)
    plus the titan suites — the unit test is the proof, the panel count
    is the census.

## Policy (frozen)

`scalecourt-traderoad-r113-linkraise-sit` + muster ON + march ON (r233
policy verbatim). Sortie INERT (r219/r223 decision stands). SIT false
(the table offer is STANDING — Steve 2026-11-06 — so a competent player
chasing the FULL seat lets the lesser seat wait; Q2 re-scopes to
lesser-seat PRICED, not taken). DAYCAP=140, death-aware stop (+10d tail
max). Seeds FRESH 103701–103708. Arm A env: `ARM=A MUSTER_HOLD=active`.
Arm B env: `ARM=B MUSTER_HOLD=sitting` (engine `tableSitting()` present).

## Fix scope (pre-registered — the build is not scope creep)

- `src/js/table.js`: new read-only query `tableSitting()` — true only
  while a table sequence is actually live (`T.winDeferred`, or
  `pg.tableDone && T.phase && T.phase !== 'done'`). `tableActive()` is
  byte-identical; its comment documents the mercy semantics. The proof
  test asserts the equivalence property `tableActive() ===
  tableSitting() || mercy` across the full state table, so the two
  predicates cannot drift apart silently.
- Driver (`scripts/journey-scale-r236-20261117.js`): the muster + march
  sanctity holds switch from `tableActive()` to the live-sitting
  predicate under `MUSTER_HOLD=sitting`; under `MUSTER_HOLD=active`
  they behave exactly as r233. The sortie step is untouched.
- Proof test `scripts/test-table-sitting-20261117.js`: state table over
  (winDeferred, tableDone, phase, ladderCapstone) × both predicates +
  the equivalence property. Red verified on the pre-fix tree (method
  absent) before the fix lands.

## Pilot gates

Seed 103701 arm A first. STOP and diagnose (INCOMPLETE, not a verdict) on:
crash, census errors > 0, 0 census rows, reconciliation residual != 0,
teleOnly > 0, 0 trustset rows by d60, 0 national-gate rows, or no
vetbar rows by d60. Muster pilot gates: ≥1 musterWatch row on a
titan-located day, titanEnd snapshot present, 0 verb-wrap errors.

## Metric review (pre-registered, for the run note)

- The lived-days control is rolled forward to **123** (r233's 8-seed
  mean) from the stale 4-seed 119, per r233's metric review. DAYCAP is
  140, so a healthy band reads ~123 — the control now sits where the
  bands sit; a BREACH still fails the run and is diagnosed, not waived.
- The lesser-seat bar (≥4/8 priced) is the r228 fraction (≥1/2)
  applied to 8 seeds. The SIT-false policy means priced-not-taken
  is the measurable half; the offer stands.
- Q1 is deliberately gate-free: on a wall that has held for months,
  a 0/8 with named blockers is the finding, not a failure.
- Q6(b)'s bar (≥7 present-held mercy rows) is the r228/r233 shape
  (a day is what the player feels); the arm-B bar (0 mercy rows held)
  is the exact complement — the fix either removes the hold or it
  does not; there is no partial-credit reading.
