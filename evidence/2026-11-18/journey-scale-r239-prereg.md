# journey-scale r239 — PRE-REGISTER (lane A, leg 3 SCALE, balanced before/after panel on current master)

**Run id:** `playtest-a-20261118T0145Z` (lock run_id `2026-11-18T07:43:58Z`).
**Run:** scheduled Wed 2026-11-18 01:45 CST (07:45 UTC); lock created 07:43:58Z.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `90f77c406` at prereg time (sim-winnability-round-0430
coordinator evidence; journey-deepening r236 closeout 75b7a87c5 is an ancestor).
**Pre-flight:** main tree clean (`git status --short` empty, 0 files),
disk 51%, lock absent (no stale-lock recovery), `git pull` already up to
date. Reap SKIPPED twice (registry lock held by a sibling reaper —
consecutive skips: 2 — no cleanup this run; 17 trees listed, cap 16
registry-active 14). Worktree registration took ~9 min (07:44–07:53Z)
under registry-lock contention; heartbeat landed at registration and a
9-min hbloop (`~/workspace/worktrees/journey-scale-hbloop-r239.sh`, pid
10831) runs for the whole run.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run. The muster + march steps are POLICY (the competent
player drives existing game verbs — walking to a known tile), zero
`src/js` change at panel time beyond the pre-registered `tableSitting()`
query (read-only; see Fix scope). **TEST WITH ENCOUNTER GEAR (Steve
2026-11-13):** the policy fights with the party and gear the competent
player has by the leg — the muster/march steps are that policy, not a
fresh-solo fixture.
**DELIVER OVER MEASURE (2026-11-01):** this run LANDS the owed
tableActive-distinction fix (arm B) and measures the scale wall on
current master (arm A) — a build with its before/after panel, not a
re-proof.
**Time-box (stated up front):** hard stop ~09:45Z (2h from the 07:43Z run
start). The panel is 8 fresh seeds × 140d × 2 arms; each sim ~2.5 min,
2 concurrent. The `--quick` gate is launched in the background right after
the build commit; the analyzer proof tests are the binding suite for a
driver-only change, and the gate result is reported if it lands before
closeout — if it does not, the run note says so and the merge waits for it
(no landing over an unfinished gate).

## Standing context (read before scoring)

- **r236 scale (landed 2026-11-17, master 90f77c406's ancestor eb2d3714f
  line):** Q6 INCOMPLETE. The table's mercy window never had a chance to
  bite on that band: only 1/8 villages delivered a capstone, and during
  its mercy window the only titan on the books was the finale beast,
  which is never actually present in the world outside the finale — the
  muster held 19 days on paper, present-held **0 on every seed** (bar
  was ≥7). The fix was NOT landed (nothing to prove it against); the
  proof test was written and verified red (22/40 on the pre-fix tree)
  and preserved at
  `hidden_files/evidence/2026-11-17/journey-scale-r236-table-sitting-test-RED.js`.
  **Owed next (r236 run note): what this run needs is a band where a
  capstone lands while a herald-class titan is still present in the
  world.** The mask's precondition is narrower than r233 suggested — it
  needs a delivered capstone AND a present titan at the same time, and
  the finale titan does not count.
- **r233 scale:** Q6(b) TABLEACTIVE MASK REPRODUCED — 103405 held
  `'tableActive'` on **78 muster rows over 74 days with the titan
  PRESENT on all 78** — the village delivered the feast embassy on d62
  and then could never muster again, because the sanctity gate reads
  the mercy window as a live table sequence. That is the defect this
  run's fix addresses.
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
- **Scale wall, current (2026-11-17/18):** national reached 1/8 (r236,
  trade road) / 2/8 (Loop B launchparty control band); national rank 0/8
  everywhere; the full seat never offered even at national + delivered
  tribute + two living veterans (r236 103701); the standing-199 stall
  dominates (5/8 parked at exactly 199 on the launchparty band). No
  table, no wins anywhere. The deed gate opening after national is the
  next wall — measured here (Q2), not this run's fix.
- **Loop B live alongside (NOT touched):** fleshout-loop-b-20261118T0130Z
  claim; Loop A fleshout sim-taxonomy2516-a (finding #2516 re-read),
  claim fleshout-20261118T0647Z. Neither touches the table/muster
  code or the 103821 band.
- **Write flap (host, ongoing, never solved):** EPERM windows hit
  2026-11-17 23:26–23:31Z (~5 min) and 2026-11-18 05:01–05:19Z. The
  flap-watch probe + watchdog report them; this run does not re-report
  flap windows the watchdog already caught, but records any it hits
  first-hand.

## Seed-band freshness

- **Band: FRESH 103821–103828.**
- Searched before the run: all `evidence/*/journey-*-prereg.md` +
  `evidence/*/sim-*-prereg.md` — **0 hits** for any of 103821–103828.
  Searched all `evidence/**/*.md` for `10382[1-8]` — **0 hits**.
  Searched goal `hidden_files/evidence/` — **2 hits, both JSON data
  values, not seed namings** (a number substring inside case JSON:
  `hidden_files/evidence/2026-10-16/crumbdefault-sweep/census-armed/crumbdefault-armed-leadcourt-s3107-census.json`
  and `hidden_files/evidence/2026-10-17/feastvoice-b-beats/leadfeast-s6107.json`),
  same class as r236's recorded 103704 caveat. The prereg-scope search
  is clean.
- **Fallback band (if arm A does not reproduce on 103821–103828):
  103831–103838** — prereg-scope search **0 hits** for all eight.
  A later collision naming a prereg, forbidden list, screen, or
  extension band for either band is corrected with a correction commit
  BEFORE the panel is judged — a later collision is corrected, not
  hidden (per the seed-band skill).
- **Collision record (so the next worker does not repeat it):**
  103801 has 4 prereg hits (journey-deepening-r236,
  sim-fightallycap-confirm-b, sim-fleerepair2-b, sim-notick-a — all
  2026-11-17); 103812 has the same 4 hits. The 10380x decade is
  reserved; do not use 103801–103808 or 103811–103818.

## Pre-registered questions

- **Q1 — THE BLANK: TABLEACTIVE DISTINCTION (decides the fix's verdict).**
  The driver records, on every muster + march row, the two predicate
  values at decision time (`ta` = `tableActive()`, `ts` = live-sitting:
  engine `tableSitting()` when present, else the same reads inline).
  A row is a MERCY row iff `ta && !ts`.
  - **Arm A (pre-fix behavior, MUSTER_HOLD=active): REPRODUCED iff any
    seed holds ≥7 mercy rows with the titan present.** Expected:
    REPRODUCED on a band where a capstone lands while a herald-class
    titan is present (r233's 103405 posted 78). If arm A does NOT
    reproduce on 103821–103828, run the fallback band 103831–103838
    arm A (same gates); if neither band reproduces, the run stops and
    diagnoses (INCOMPLETE, not a verdict) — the fix would have nothing
    to prove against, and the search (two bands, capstones delivered,
    present-titan days during mercy) is the finding.
  - **Arm B (fix, MUSTER_HOLD=sitting): GO iff (a) mercy rows held = 0
    on every seed (the muster/march no longer holds on mercy), AND (b)
    ≥1 mercy-window muster proceeds to a ready/called row on a seed
    where a titan is present during mercy (measured, not gated — a band
    with no titan present during any mercy window reads 0 honestly and
    the verdict falls back to (a) + the proof test), AND (c) live-sitting
    holds still fire when a sitting is actually live (0 required if no
    sitting coincides with a titan; if one does, it must hold — the
    sanctity that matters is preserved).**
  - **Q1(a) refusal-spam watch carried, MEASUREMENT ONLY:** the r233 fix
    dedupes the SPOKEN refusal line (once per titan per day); the
    `'refused'` OUTCOME is still recorded on every refusal by design, so
    an outcome-count bar would false-positive on a healthy panel. The
    outcome worst-day is reported per arm with no bar. The refusal fix's
    regression check is the r233 proof test re-run on the rebased tip
    (`scripts/test-titan-refusal-once-a-day-20261117.js`, 25/25 required)
    plus the titan suites — the unit test is the proof, the panel count
    is the census.
- **Q2 — NATIONAL / DEED GATE (primary, measurement, NOT a gate):**
  on current master, how many of 8 fresh villages reach national (by
  standing / by scaleRank), open the deed gate (`deedGateReady`), are
  offered the table, take a seat by d140? Interesting iff ≥1 reaches
  national with its road named (LEAD/BELONG/COVENANT/TRADE/CONQUEST),
  OR 0/8 with a diagnosable per-seed blocker (natgate blocker lines).
  The census carries the deed-gate half: capstoneReady /
  capstoneDelivered / seatFullDay per seed. No GO/NO-GO rides on the
  game — the verdict is the census + named blockers. Same question both
  arms; the fix touches no ladder/table/deed-gate mechanic, so Q2 is a
  GUARDRAIL for arm B (no movement expected; any movement is
  investigated, never claimed as the fix's effect without a causal read).
- **Q3 — REGRESSION GUARDS (fail the run):** r134 spoken-raise (0
  not-offered-spoken, ≥1 properly answered), vetbar 0 disagreements,
  trap-line 0 defect sittings, betrayal-sibling 0 defects, lived-days
  per-seed mean within ±25% of the control **123** (r233's 8-seed mean —
  r236 metric review rolled it forward from the stale 4-seed 119;
  applied here, stated up front, not mid-run), lesser seat priced ≥4/8.
  Same bars both arms.
- **Q4 — PEOPLE CHECK:** read 1–2 full transcripts (d90/d120) in full,
  PLUS the nonverbal sittings AND all raise talks (arm B corpus — the
  arm that ships).
- **Q5 — CENSUS + spotter d90 + W5-INSTANCE.** Carried: w4
  fights/kills, banked veterans (2+), w5 unlocked/faced/killed,
  tribute states (M23 shape), survival. The analyzer's "wave-4 kills"
  line stays relabeled "wave-4 fights" with a band kill total from
  kAttr (`w4total`).
- **Q6 — THE BLANK FROM r236 Q4 (dialogue, documented not fixed):**
  in Paolo's sitting (103702 day 90), "Tell me more" after his water
  ask repeats the ask verbatim instead of deepening it. This run
  watches for the same shape in the r239 transcripts (a "tell me more"
  that echoes rather than deepens) and records it; a dialogue-content
  fix belongs to a dialogue pass, not this panel — unless a one-line
  content fix presents itself inside the panel's scope, in which case
  it is judged on its own proof test.

## Policy (frozen)

`scalecourt-traderoad-r113-linkraise-sit` + muster ON + march ON (r236
policy verbatim). Sortie INERT (r219/r223 decision stands). SIT false
(the table offer is STANDING — Steve 2026-11-06 — so a competent player
chasing the FULL seat lets the lesser seat wait; Q3 re-scopes to
lesser-seat PRICED, not taken). DAYCAP=140, death-aware stop (+10d tail
max). Seeds FRESH 103821–103828 (fallback 103831–103838, arm A only if
needed). Arm A env: `ARM=A MUSTER_HOLD=active`. Arm B env:
`ARM=B MUSTER_HOLD=sitting` (engine `tableSitting()` present).

## Fix scope (pre-registered — the build is not scope creep)

- `src/js/table.js`: new read-only query `tableSitting()` — true only
  while a table sequence is actually live (`T.winDeferred`, or
  `pg.tableDone && T.phase && T.phase !== 'done'`). `tableActive()` is
  byte-identical; its comment documents the mercy semantics. The proof
  test asserts the equivalence property `tableActive() ===
  tableSitting() || mercy` across the full state table, so the two
  predicates cannot drift apart silently.
- Driver (`scripts/journey-scale-r239-20261118.js`, cloned from r236):
  the muster + march sanctity holds switch from `tableActive()` to the
  live-sitting predicate under `MUSTER_HOLD=sitting`; under
  `MUSTER_HOLD=active` they behave exactly as r236. The sortie step is
  untouched. Seeds, EVIDIR (2026-11-18), and corpus tags updated to r239.
- Proof test `scripts/test-table-sitting-20261117.js`: state table over
  (winDeferred, tableDone, phase, ladderCapstone) × both predicates +
  the equivalence property. Red verified on the pre-fix tree (22/40 —
  every failure is the missing method; every tableActive control
  passes) before the fix landed; green 40/40 after.
- Analyzer (`scripts/analyze-journey-scale-r239-20261118.js`, cloned
  from r236) + analyzer proof
  (`scripts/test-journey-scale-r239-analyzer-20261118.js`, require path
  + corpus tags updated; fixtures frozen).

## Pilot gates

Seed 103821 arm A first. STOP and diagnose (INCOMPLETE, not a verdict) on:
crash, census errors > 0, 0 census rows, reconciliation residual != 0,
teleOnly > 0, 0 trustset rows by d60, 0 national-gate rows, or no
vetbar rows by d60. Muster pilot gates: ≥1 musterWatch row on a
titan-located day, titanEnd snapshot present, 0 verb-wrap errors.

## Metric review (pre-registered, for the run note)

- The lived-days control stays **123** (r233's 8-seed mean, rolled
  forward per r233's metric review). DAYCAP is 140, so a healthy band
  reads ~123 — a BREACH still fails the run and is diagnosed, not waived.
- The lesser-seat bar (≥4/8 priced) is the r228 fraction (≥1/2)
  applied to 8 seeds. The SIT-false policy means priced-not-taken
  is the measurable half; the offer stands.
- Q2 is deliberately gate-free: on a wall that has held for months,
  a 0/8 with named blockers is the finding, not a failure.
- Q1's bar (≥7 present-held mercy rows) is the r228/r233 shape (a day
  is what the player feels); the arm-B bar (0 mercy rows held) is the
  exact complement — the fix either removes the hold or it does not;
  there is no partial-credit reading.
- The two-band search rule (fallback 103831–103838) is new this run:
  r236 proved a single band can miss the precondition entirely. The
  fallback is a SEARCH, not a re-score — the bars do not move between
  bands, and the run reports both bands' capstone/present-titan counts.
