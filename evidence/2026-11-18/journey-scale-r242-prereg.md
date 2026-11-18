# journey-scale r242 — PRE-REGISTER (lane A, leg 3 SCALE, balanced before/after panel on current master)

**Run id:** `playtest-a-20261118T1045Z` (lock run_id `playtest-loop-20261118T165852Z`).
**Run:** scheduled Wed 2026-11-18 10:45 CST (16:45 UTC); lock created 16:58:52Z.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `430b849d2` at prereg time (journey-deepening r237
closeout; journey-scale r239 is an ancestor).
**Pre-flight:** main tree clean (`git status --short` empty, 0 files),
disk 48%, lock absent (no stale-lock recovery), `git pull` already up to
date. Reap SKIPPED (registry lock held by a sibling reaper — consecutive
skips: 1 — no cleanup this run; 15 trees listed, cap 16). Worktree
registration took ~6 min (16:59–17:05Z) under registry-lock contention;
heartbeat landed at registration and a 9-min hbloop
(`~/workspace/worktrees/journey-scale-hbloop-r240.sh`, pid 35932) runs for
the whole run.
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
tableActive-distinction fix (arm B) IF the staged panel proves it, and
measures the scale wall on current master (arm A) — a build with its
before/after panel, not a re-proof.
**Time-box (stated up front):** hard stop ~19:00Z (2h from the 16:58Z run
start). The panel is 8 fresh seeds × 140d × 2 arms; each sim ~2.5 min,
2 concurrent. The `--quick` gate is launched in the background right after
the build commit; the analyzer proof tests are the binding suite for a
driver-only change, and the gate result is reported if it lands before
closeout — if it does not, the run note says so and the merge waits for it
(no landing over an unfinished gate).

## Standing context (read before scoring)

- **r239 scale (landed 2026-11-18, master 6fb98f473):** Q1 INCOMPLETE.
  Two bands (103821–103828 + fallback 103831–103838), 72 mercy rows held,
  present-held **0 on all 16 seeds** (bar was ≥7). Every capstone deliverer
  had already slain its herald weeks earlier (103825: herald slain day 102,
  capstone day 123). The fix was built, proof-tested 40/40, then **held off
  the merge** — a change proven against nothing does not land — and rebased
  out of the branch. The proof test was preserved RED (22/40) at
  `hidden_files/evidence/2026-11-18/journey-scale-r239-table-sitting-test-RED.js`.
  **Owed next (r239 F1): stage the precondition** — a village handed a
  capstone while its herald still lives — **or score bands on "capstone
  delivered while herald alive" before playing them. Do not play more blind
  bands.** This run takes the first option: the STAGE.
- **r237 deepening (landed 2026-11-18, master 430b849d2):** Q1 growth line
  GO (11 calls, harvest exact); Q2 coalition-reach 4/8 FAIL (the coalition
  bar is set by trust/link depth, not the signal); F1 a ready muster
  strands when the titan leaves its lair; F2 `villageStanding().links`
  reads 0 always (instrument, re-pointed at musterLog.links). Carried
  here: the muster/march steps, the coalition-reach wall (the staged
  herald fight meets the same 10-blade bar).
- **r236 scale:** Q6 INCOMPLETE (same shape — 1 capstone, present-held 0).
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
  hold predicate changes. The sortie step is untouched.
- **Scale wall, current (2026-11-18):** national reached 2/8 (r239,
  trade road), full seat taken 1/8 (r239 103825, day 125). The deed gate
  opens after national — sometimes, and late. The veterans bar is the
  tribute bottleneck (r239 103827: 24 attempts, 23 refused for lack of
  veterans). Wave-5 beasts are fought and killed in the field now
  (r239 103827: 15 fights, 1 kill). The wave-5 door was never faced.
- **Loop B live alongside (NOT touched):** lane B crisis r241 timed out
  before closeout (panel done, two fixes in the worktree only, nothing
  committed). Neither touches the table/muster code or the 103841 band.
- **Lock incident (2026-11-18, correction in today's memory log):** the
  r241 (09:00) occurrence deleted a LIVE r240 adoption's lock on a
  stale-heartbeat read — third instance of this failure. This run's
  overlap guard found NO lock file at start, so no recovery was needed;
  the hbloop + manual heartbeat discipline stands.
- **Write flap (host, ongoing, never solved):** the flap-watch probe +
  watchdog report windows; this run does not re-report flap windows the
  watchdog already caught, but records any it hits first-hand.

## Seed-band freshness

- **Band: FRESH 103841–103848.**
- Searched before the run: all `evidence/*/journey-*-prereg.md` +
  `evidence/*/sim-*-prereg.md` — **0 hits** for any of 103841–103848.
  Searched goal `hidden_files/evidence/` (.md) — **0 hits**. Searched
  all of repo `evidence/` (84 files match the digit pattern) — **0 seed
  namings**: every hit is a data value (same class as r239's recorded
  caveat): `pantry=103845` (windowsurvive-taxonomy.md), `"Fish catch":
  103845` (sim-standing-tune.json), `"takesEnd": 103846` ×2
  (sweep-ledgerpenalty-armed-inv2.json), `freshDays: 10.103842…` /
  `9.103844…` (screen .jsonl files). No prereg, forbidden list,
  contaminated list, screen, or extension band names any of 103841–103848.
  A later collision naming a prereg, forbidden list, screen, or
  extension band for this band is corrected with a correction commit
  BEFORE the panel is judged — a later collision is corrected, not
  hidden (per the seed-band skill).
- **Collision record (so the next worker does not repeat it):** 103801
  has 4 prereg hits (journey-deepening-r236, sim-fightallycap-confirm-b,
  sim-fleerepair2-b, sim-notick-a — all 2026-11-17); 103812 has the same
  4 hits. The 10380x decade is reserved; do not use 103801–103808 or
  103811–103818. The 10382x decade is spent (r239 primary + fallback);
  do not reuse 103821–103828 or 103831–103838.

## Pre-registered questions

- **Q1 — THE BLANK: STAGED TABLEACTIVE DISTINCTION (decides the fix's
  verdict).** The STAGE arms the first day a herald-class titan is
  located (omen stage ≥2) AND present in the world, holds the herald's
  muster call until the military tribute is payable (2 living wave-4
  veterans — the real delivery verb, real price), then delivers it and
  disarms. A capstone delivered by the natural R113 verb while the
  herald lives satisfies the stage without intervention ('natural').
  Abandon: herald slain before delivery, or tribute not payable by day
  120 (the muster is released so the village keeps its herald fight).
  The driver records, on every muster + march row, the two predicate
  values at decision time (`ta` = `tableActive()`, `ts` = live-sitting:
  engine `tableSitting()` when present, else the same reads inline).
  A row is a MERCY row iff `ta && !ts`.
  - **Arm A (pre-fix behavior, MUSTER_HOLD=active): REPRODUCED iff any
    seed holds ≥7 mercy rows with the titan present.** Same bar as r239.
    If arm A does NOT reproduce, the run stops and diagnoses
    (INCOMPLETE, not a verdict) — the fix would have nothing to prove
    against, and the search (staged, capstones delivered, present-titan
    days during mercy) is the finding.
  - **Arm B (fix, MUSTER_HOLD=sitting): GO iff (a) mercy rows held = 0
    on every seed (the muster/march no longer holds on mercy), AND (b)
    ≥1 mercy-window muster proceeds to a ready/called row on a seed
    where a titan is present during mercy (measured, not gated — a band
    with no titan present during any mercy window reads 0 honestly and
    the verdict falls back to (a) + the proof test), AND (c) live-sitting
    holds still fire when a sitting is actually live (0 required if no
    sitting coincides with a titan; if one does, it must hold — the
    sanctity that matters is preserved).**
  - **Stage consistency (guard, fails the run):** armed/delivered days
    identical across arms on every seed with a stage corpus — the stage
    is arm-independent (arming + delivery happen before the arms
    diverge). A mismatch is a defect, not a measurement.
  - **Q1(a) refusal-spam watch carried, MEASUREMENT ONLY:** the r233 fix
    dedupes the SPOKEN refusal line (once per titan per day); the
    `'refused'` OUTCOME is still recorded on every refusal by design, so
    an outcome-count bar would false-positive on a healthy panel. The
    outcome worst-day is reported per arm with no bar. The refusal fix's
    regression check is the r233 proof test re-run on the rebased tip
    (`scripts/test-titan-refusal-once-a-day-20261117.js`, 25/25 required)
    plus the titan suites — the unit test is the proof, the panel count
    is the census.
  - **What the staging does NOT prove:** the staged delivery is a
    disclosed policy choice (deliver now instead of waiting for national).
    It proves the fix's MECHANISM in real play (muster proceeds during
    mercy with a present titan; still holds during a live sitting). It
    does not prove the precondition occurs naturally — r239's two blind
    bands say it almost never does, and this run's note says so plainly.
    The deed gate's timing stays Q2's question.
- **Q2 — NATIONAL / DEED GATE (primary, measurement, NOT a gate):** on
  the staged band, how many of 8 fresh villages reach national (by
  standing / by scaleRank), open the deed gate (`deedGateReady`), are
  offered the table, take a seat by d140? Interesting iff ≥1 reaches
  national with its road named (LEAD/BELONG/COVENANT/TRADE/CONQUEST),
  OR 0/8 with a diagnosable per-seed blocker (natgate blocker lines).
  The census carries the deed-gate half: capstoneReady /
  capstoneDelivered / seatFullDay per seed. No GO/NO-GO rides on the
  game — the verdict is the census + named blockers. **The staged
  delivery moves this census** (a tribute delivered early, two veterans
  gone — the village is weaker for the herald fight, and the mercy
  window opens weeks earlier than the natural history). Q2 is reported
  WITH the staging disclosed; r239's natural band (2/8 national, 1/8
  full seat) is the natural-history control. Same question both arms;
  the fix touches no ladder/table/deed-gate mechanic, so Q2 is a
  GUARDRAIL for arm B (no movement expected beyond the staging's own
  effect; any other movement is investigated, never claimed as the
  fix's effect without a causal read).
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
- **Q6 — THE BLANK FROM r239 Q4 (dialogue, documented not fixed):** in
  Paolo's sitting (103702 day 90), "Tell me more" after his water
  ask repeats the ask verbatim instead of deepening it. This run
  watches for the same shape in the r242 transcripts (a "tell me more"
  that echoes rather than deepens) and records it; a dialogue-content
  fix belongs to a dialogue pass, not this panel — unless a one-line
  content fix presents itself inside the panel's scope, in which case
  it is judged on its own proof test.

## Policy (frozen)

`scalecourt-traderoad-r113-linkraise-sit` + muster ON + march ON (r239
policy verbatim) + **STAGE herald** (this run's addition — see Q1).
Sortie INERT (r219/r223 decision stands). SIT false (the table offer is
STANDING — Steve 2026-11-06 — so a competent player chasing the FULL seat
lets the lesser seat wait; Q3 re-scopes to lesser-seat PRICED, not taken).
DAYCAP=140, death-aware stop (+10d tail max). Seeds FRESH 103841–103848
(no fallback band — the stage replaces the blind-band hunt). Arm A env:
`ARM=A MUSTER_HOLD=active`. Arm B env: `ARM=B MUSTER_HOLD=sitting`
(engine `tableSitting()` present). Both arms `STAGE_CAPSTONE=herald`
(default).

## Fix scope (pre-registered — the build is not scope creep)

- `src/js/table.js`: new read-only query `tableSitting()` — true only
  while a table sequence is actually live (`T.winDeferred`, or
  `pg.tableDone && T.phase && T.phase !== 'done'`). `tableActive()` is
  byte-identical; its comment documents the mercy semantics. The proof
  test asserts the equivalence property `tableActive() ===
  tableSitting() || mercy` across the full state table, so the two
  predicates cannot drift apart silently. **Re-applied byte-identical
  from r239's dropped commit `c6a62c604`** (verified by diff); the proof
  test is the preserved RED copy, verified RED 22/40 on the pre-fix tree
  and GREEN 40/40 with the fix, before the panel.
- Driver (`scripts/journey-scale-r242-20261118.js`, cloned from r239):
  the muster + march sanctity holds switch from `tableActive()` to the
  live-sitting predicate under `MUSTER_HOLD=sitting`; under
  `MUSTER_HOLD=active` they behave exactly as r239. The STAGE step
  (stageStep + stage-wait holds + stage corpus) is driver policy, zero
  `src/js` change. Seeds, EVIDIR (2026-11-18), and corpus tags updated
  to r242. The analyzer's SEEDS const renamed (r239 F5 clone hazard —
  the analyzer proof test's fixtures renamed with it).
- Analyzer (`scripts/analyze-journey-scale-r242-20261118.js`): Q6(b)
  mercy accounting unchanged; new Q1 STAGE section (per-seed stage
  outcome + arm-consistency guard). Proof test
  `scripts/test-journey-scale-r242-analyzer-20261118.js`: 139/139
  (r239's 129 + 10 new stage cases (46)–(48)).
- Proof test `scripts/test-table-sitting-20261117.js`: state table over
  (winDeferred, tableDone, phase, ladderCapstone) × both predicates +
  the equivalence property (the r239 file, byte-identical).
- **Landing rule (pre-registered):** the fix lands ONLY on a Q1 GO.
  On INCOMPLETE or NO-GO it is rebased out of the branch (r239
  precedent) and the proof test preserved RED in the goal evidence dir.

## Metric review (carried)

- Q1's bar (≥7 present-held mercy rows) proved its worth twice over: it
  refused to let r236/r239 claim a reproduction on 72 held rows that
  cost the player nothing. The bar stays as written; the two-band search
  rule is replaced by the STAGE this run — the next run inherits the
  stage, not another blind band.
- The lived-days control stays **123** (r233's 8-seed mean). r239's band
  mean was 127.1 (inside the guardrail); the fallback band's mean (~128)
  agrees.
- Q2 is deliberately gate-free, and r239's band justifies it: 2/8
  national with named blockers is the finding, and the full seat on
  103825 is the news.
- The Q1(a) refusal watch stays measurement-only.
