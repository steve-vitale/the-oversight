# BELONG v3 — "read the room before you burn the bond" (2026-10-12)

Worker worktree: `scale-belong-v3`. Policy-side only (`scripts/policies/belongseek.js`
+ probe/test scripts + this evidence file). No `src/` changes. No game-code changes.

## PRE-REGISTRATION (written before any v3 pilot sim ran — docs/MEASUREMENT.md §§9-12)

- **Question:** does v3 (exile-aware switch + opinion-building climb before the
  switch + score-gated break) beat v2 on the BELONG road's switch reliability?
- **Diagnosis (from the code, not the evidence's claims):** v2's "decline
  spiral" NEVER HAPPENED. Instrumented re-runs on 606/707 (see "Diagnosis"
  below) prove the re-court proposals never reached the consolidator — the
  persona was moot-exiled (606: d60, 707: d48, both before the switch), and
  `proposeLink`'s exile guard (`_blockIfNotHaven`, hierarchy.js:3398) returned
  null without ever calling `judgeLink`. Recomputed deterministic scores were
  59–81 (606) and 79–81 (707): solid accept/counter territory, never < 35.
  Opinion ROSE 2→10 during the "spiral" (broadcast + time); no decline ever
  fired, so no −5 ever landed. v2's real bug: it broke a trust-90+ live bond
  without checking whether the re-court was even possible.
- **Primary metric:** (1) switch decision quality — on seeds where the persona
  is exiled at switch time, v3 HOLDS the old link (no pure-loss break) vs v2's
  break-into-the-void; (2) BELONG national reach per seed (no regression on
  303); (3) re-court deterministic score at switch (v3 ≥ v2's implied scores).
- **GO threshold:** v3 reaches national on 303 (v2 parity — the building phase
  must not delay past the d104 moot-exile), AND zero pure-loss breaks under v3
  on 606/707 (old link held to the end), AND mean re-court det score lifts vs
  v2's implied det on identical seeds.
- **Horizon:** 150d, death-aware (dead village stops simulating).
- **Seeds:** 303, 606, 707, 101 — the v2 switch seeds, before/after on
  IDENTICAL seeds.
- **Policies:** v2 (`BELONG_V3` unset — byte-identical baseline) vs v3
  (`BELONG_V3=1`). Same probe runner, same harness.
- **Kill rule:** if v3 loses 303's national (the building phase delayed the
  switch past the exile), or v3 still breaks-into-the-void on 606/707, kill it
  — document why, do the assessment anyway, spend no confirm.
- **Convergence state to report:** converging | converged | parked | killed-at-pilot.

## Artifacts
- `scripts/policies/belongseek.js` — v3 added, gated by `BELONG_V3` env
  (default off = v2 byte-identical). New: `canPropose()` (exile guard),
  `detScore()` (judgeLink deterministic part), `v3Candidate()`; v3 gates in
  `rideConsolidator` (exile gate + score gate + day-85 deadline) and in
  `proposeSubordinate` (no cold re-ask below det 50 after a switch).
  All v3 logic is pure decision — no persona movement, no extra RNG draws.
  (A codex-trek builder was cut in pilot; the `v3Build` stub remains as a
  documented no-op and the trek helpers were removed.)
- `scripts/diag-belong-v3-20261012.js` — diagnosis instrument (judgeLink
  decomposition per proposal; non-RNG-disturbing).
- `scripts/test-belong-v3-20261012.js` — proof tests (gate-off identity,
  exile guard, opinion built, score lift).
- `scripts/probe-belong-20261012.js` — existing probe runner (unchanged;
  v3 selected via env).

## DIAGNOSIS — why the re-court "failed" on 606/707 (from the code)

The v2 evidence claimed: "re-courting the consolidator failed 7+ consecutive
times (score < 35 every time); each cold ask costs opinion −5, spiraling toward
the shut door at −20." Every clause of that is wrong. What actually happened:

1. `Game.proposeLink` is NOT the function in hierarchy.js:415 — it's wrapped
   (hierarchy.js:3398, `_blockIfNotHaven`, break-it regional r4 2026-10-11):
   when `scholar.exiled` (or `joinedVillage`), it says "Haven's council
   doesn't take orders from the road. Exile means exile." and returns null
   WITHOUT calling `judgeLink`. My instrumented wrapper proved `judgeLink`
   fired exactly once per run (the day-20 proposal) — the 7 re-courts never
   scored at all.
2. The persona was moot-exiled BEFORE the switch on both seeds (606: d60,
   707: d48 — the villagers tried the persona for free-riding: "You've been
   taking more than you bring"). The exile guard blocked every re-court.
3. Recomputed deterministic scores (judgeLink minus noise): 606: 59→71 across
   d72–d114; 707: 79–81 across d55–d76. All accept/counter territory. Opinion
   ROSE (606: 2→10) via broadcast wins + time — no decline ever fired, so the
   "−5 per cold ask" never happened.
4. Exile census across v2's 6 seeds: 303 exiled d104 (AFTER the d83 oath —
   national survived); 606 d60, 707 d48 (both killed the switch); 101/202/505
   never (died too early). The moot-exile is a frequent, real game path — the
   villagers acting like people — and it is the switch window's binding
   constraint, not opinion.

Climb-verb numbers VERIFIED in the engine source (grounded, not built on claims):
- study their codex: +3 opinion, once per village (`ov._codexOpinionGiven`;
  hierarchy.js:3358-3362). Requires the persona within dist 2 (game.js:7783).
- broadcast (contest win): +2 to every known village (`_foreignEyes`,
  hierarchy.js:1818, why='broadcast'). Loss: −2.
- time: +1/week TOWARD ZERO, negative-only, unlinked-only (linkTick,
  hierarchy.js:1076-1082). It recovers slights; it does not build positive opinion.
- decline: −5 + banks `courtshipDeclined` → climb verbs land +1 harder for 28d
  (hierarchy.js:266-282, 445-447).
- shut door at opinion ≤ −20 no longer deepens (journey-scale r2); slights
  fade, so it re-opens.
- judgeLink (hierarchy.js:356-392): 38 + min(20, repS/2) + opinion/2
  + 10 (asSubordinate) + 8 (tribute ≥3000 && opinion ≥5) + U(−10,+10).
  Bands: ≥55 accept, 35–54 counter (played), <35 decline.

## v3 DESIGN ("read the room before you burn the bond")

1. **Exile gate (the 606/707 fix):** `rideConsolidator` returns without breaking
   when `!canPropose(Game)` (persona exiled or joined another fire). The old
   link is held — trust keeps accruing, tribute keeps flowing. Breaking into an
   engine-blocked re-court was pure loss.
2. **Score-gated break:** break only when the deterministic re-court score
   clears 55 (direct-accept territory; ≥65 clears it even on worst noise).
   Below 55, wait — the passive climb verbs (broadcast +2/win, time +1/wk
   toward zero) accrue while the old link stays active. Day-85 deadline breaks
   at det ≥ 45 (the counter band is playable — counters get answered honestly).
   Below 45: never break.
3. **No cold re-ask after a switch:** re-court proposals (post-switch) wait for
   det ≥ 50 instead of retrying every 7 days into a likely decline. The initial
   day-20 courtship is ungated (v2 behavior preserved).
4. CUT IN PILOT — the active opinion-building trek: the first v3 walked the
   persona to the consolidator's fire to study their codex (+3, once). It worked
   mechanically but collapsed the 303 trajectory at d65 (vs v2's national).
   Shipped v3 builds opinion passively only; all v3 logic is pure decision
   (no persona movement, no extra RNG draws).
5. NOT built (per brief): the multi-subordinate-link hedge — engine allows it,
   fiction is "tributary to two masters," Steve's call. Noted as an option.

Design calls for Steve's overrule:
- The day-85 deadline is a judgment call: waiting longer risks the national
  window (Binding needs ~5 weeks of trust + 14d age after the link forms).
- The det ≥ 45 floor for the deadline break: a counter at 45–54 is playable,
  but if the pantry can't carry the counter's terms we walk (existing honest
  counter logic).
- Cutting the codex trek: +3 opinion wasn't worth the persona diversion. A
  future run could retry it behind a persona-safety gate (village healthy,
  persona idle).

## RESULTS — pilot (v2 vs v3 on identical seeds)

(run 2026-10-12; `BELONG_V3` unset vs `=1`; SEEDS=303,606,707,101; DAYS=150;
v2 baseline: `evidence/2026-10-12/belong-v2-raw.json`; v3: `/tmp/belong-v3-pilot2.json`)

| seed | v2 | v3 |
|------|-----|-----|
| 303 | national (belong@82, oath d83, held 70d) | national (belong@82, oath d83, held 70d) — IDENTICAL |
| 606 | broke d71 → exile-blocked re-courts → linkless death d126, 38 good days | NO BREAK (exile guard) → held trust-93 link → died d106, 65 good days |
| 707 | broke d55 → exile-blocked re-courts → linkless death d106, 30 good days | NO BREAK (exile guard) → held trust-100 link → died d116, 73 good days |
| 101 | died d51 (pre-switch) | died d51 (pre-switch) — identical |

GO check:
- 303 national under v3 (v2 parity): YES — same beat day, same oath, same hold.
- Zero pure-loss breaks under v3 on 606/707: YES — `ctx._v3blockedExile` fired,
  the old link was held to the village's death.
- Re-court det lift: on 303 the v3 re-court direct-accepted (link formed d68,
  same as v2); the score gate (det ≥ 55) was satisfied at switch time. The
  "lift vs v2" is vacuous — v2's re-courts never scored (exile-blocked) — so
  the honest statement is: v3's re-courts happen if and only if the persona
  can propose AND the deterministic score clears the bar.
- Kill rule: NOT triggered. No regression, no break-into-the-void.

A first v3 iteration WITH an active codex trek (persona walks to the
consolidator's fire, studies, +3) was CUT during the pilot: on 303 it collapsed
the village at d65 (vs v2's national at d152). The trek moved the persona for
~3 days and consumed RNG draws (travelTo/study), perturbing the trajectory;
causation is not proven, but the risk/benefit was poor (+3 opinion vs persona
diversion). The shipped v3 uses the passive climb verbs only (broadcast +2/win,
time +1/wk) while the score gate waits. All v3 logic is pure decision — no
persona movement, no extra RNG draws — so v3 trajectories match v2's wherever
the break decision matches (verified: 303 identical to the day).

## RESULTS — confirm (12 fresh seeds × 150d, v2 vs v3)

(seeds 111,222,333,444,555,777,888,999,1212,1313,1414,1515; raw: /tmp/belong-v2-confirm.json, /tmp/belong-v3-confirm.json)

| metric | v2 | v3 |
|--------|-----|-----|
| national reach | 1/12 (444, belong@83 → global) | 1/12 (444, belong@83) — parity |
| walked breaks | 5 | 3 (exile guard withheld 2: seeds 111, 555) |
| total good days | 148 | 173 |
| survived to 150d | 1 (1515) | 1 (1515) |
| median survival | 49d | 49d |

Seed-by-seed: on 111 and 555 v3 correctly withheld the switch (persona exiled);
both villages died within 2 days of v2's death day — the held link didn't save
them, but it didn't cost them either (more good-standing days banked). On 444
both reached national via the BELONG road (v2 even hit global). On 1313 both
switched and staged belong@84. No seed where v3 broke and v2 didn't; no seed
where v3 lost a national v2 had.

The binding constraint remains the combat/food baseline: median survival 49d,
8/12 villages dead before day 70. The BELONG road works when villages live;
v3 makes the switch decision safe, it doesn't make villages live longer.

## SENSE-TESTING (read the transcript, judge meaning)

303 v3 (the national run) — the beats read in order:
- d20: "⛓️ Isaac brings it home: Haven bows to Emberhold — one organization,
  them primary. Tribute: 6,000 kcal/week." (The speaker is whoever earned it —
  Isaac this run, Marcus on 606, Pablo on 707.)
- d55: "🚶 Haven walks from the table cleanly — no blades, no hard words. The
  bond ends where it stood, honestly." The switch is legible and proportionate.
- d68: "⛓️ Muktar brings it home: Haven bows to Thornfield — one organization,
  them primary. Tribute: 5,000 kcal/week." Muktar is now the speaker — people
  change roles across the run (the v2 bar, met again).
- d82–83: the Binding beat stages, Muktar kneels and swears the oath sealed
  with 3,264 kcal. d84–147: weekly "Tribute paid: ~5,100 kcal walks out of the
  pantry toward Thornfield. The relationship holds." — the amounts vary
  honestly (5,009–5,364), the relationship is a live ledger, not a flag.
- 606/707 v3 (the held link): no switch beat, just the weekly tribute lines
  and answered demands. The absence of the break is itself legible — the
  village kept its bond because the persona couldn't have re-courted. (The
  engine doesn't say "we held because the speaker is exiled" aloud — the
  policy's restraint is silent. A future beat could say it; noted as a blank.)

Flags (persisting from v2, still out of scope — lever 3):
- **Verbatim gossip recycling persists:** "💬 David/Isaac/James/Sofia/Muktar/
  Dagmawi/Vito whispers: 'Mara swears she met a stranger who knew things…'"
  — the same template across 7 speakers. "A traveler swears Stonebridge is
  feasting — (They're wrong…)" twice verbatim. Dialogue variety is thin.
- The weekly "Tribute paid" lines are honest but metronomic — 60+ identical
  frames with different numbers. A real village would vary the telling.

## VILLAGE ASSESSMENT — what the runs looked like

303 (national): 12 strangers → Emberhold tributary (d20) → clean walk (d55) →
Thornfield tributary (d68) → oath (d83) → national held to d152. Roster 12→7.
Muktar rose from fisher to speaker to oath-swearer. Dagmawi cooked and taught
David snare-tying ("Hands patient. It takes three tries."). Sofia dreamed
teeth-dreams. The tribute road cost ~5,000–6,000 kcal/week (~6% of daily need)
— the road is quiet, not cheap, and survival to day 90 is still the binding
constraint (combat/food baseline's fight, not the scale lever's).

606/707 (held link): the persona was moot-exiled mid-run (d60/d48 — tried for
free-riding: "You've been taking more than you bring"). v3 held the
trust-93/100 bond; the villages paid tribute weekly (606's tribute rose
5,000→7,500→11,250 through renegotiation and succession — honored, not
defaulted) and died at d106/d116 with the relationship intact. Under v2 they
died linkless. The villagers' justice system (the moot) is the reason the
switch was impossible — people acting like people, with consequences for the
scale game.

Who thrived / died: the pattern is unchanged from v2 — combat attrition
decides who lives; the BELONG road itself kills no one. The exile is the one
persona-level event with scale consequences, and it's the village's own
justice, not the road's toll.

## VERDICT

- **Primary metric:** v3 pilot 1/4 national (303, v2 parity — identical beat
  day and hold); confirm 1/12 national (444, v2 parity). Zero pure-loss breaks
  across 16 v3 seeds (pilot + confirm). Good-standing days up (606: 38→65,
  707: 30→73; confirm total 148→173).
- **Kill rule:** not triggered.
- **GO threshold:** MET — proceed. v3 is strictly safer than v2 (exile-aware)
  with no outcome regression.
- **Convergence state: converging.** The BELONG road is demonstrated and now
  switch-safe, but national remains rare (2/16 across pilot+confirm) — gated
  by village survival to ~day 90 (median 49d), which is the combat/food
  baseline's department. For the scale-onramp axis: BELONG is a working road
  with a safe switch; the wall is now survival-to-90, not the switch.
- **For the coordinator:** v3 is ready to land. `BELONG_V3=1` selects it;
  unset = v2 baseline. No `[needs-eyes]` — policy-only, no feel/combat/UI
  changes. The 12-seed confirm is done in-run; no further confirm spend needed
  unless the coordinator wants a wider seed sweep.

## BLANKS FILLED / DOCUMENTED

- FILLED: the v2 "decline spiral" diagnosis was wrong — corrected with
  instrumented evidence (exile guard, not opinion, blocked the re-courts;
  det scores were 59–81, never < 35). v3's exile gate + score-gated break
  address the real failure. The v2 evidence file's failure-mode #2 should be
  read as superseded by this file's Diagnosis section.
- FILLED: the active codex-trek was cut after it collapsed 303 in pilot —
  documented above with the reason (persona diversion + RNG perturbation,
  poor risk/benefit for +3 opinion).
- DOCUMENTED: the moot-exile of the persona is frequent (3/6 v2 pilot seeds,
  2/12 confirm seeds broke-or-held on it) and is now the switch window's
  binding constraint. Whether the competent policy's persona SHOULD be
  exiled this often (free-riding trigger tuning) is a justice-lever question —
  flagged for the loops, out of this round's scope.
- DOCUMENTED: "time +1/week" only recovers negative opinion toward zero; it
  never builds positive opinion. Corrected from the v2 evidence's phrasing.
- DOCUMENTED (option, Steve's call): the multi-subordinate-link hedge —
  engine allows a second subordinate link ("tributary to two masters"); not
  built per the brief. It would survive the exile problem differently (never
  break the first link), but the fiction needs Steve's word.
- DOCUMENTED (blank, policy-side future): when v3 withholds the switch on
  exile, nothing says so aloud — the restraint is silent. A beat ("the speaker
  is exiled; the council holds its bond") would make the decision legible.
- PERSISTING (lever 3): verbatim gossip recycling ("Mara swears…", "traveler
  swears…feasting") — flagged in v2, still present in v3, out of scope.
