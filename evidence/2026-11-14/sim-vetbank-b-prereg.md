# sim-vetbank-b — PREREG (BUILD arm: scholar veteran-banking policy)

Run: fleshout-loop-b-20261114T1808Z (Loop B), arm sim-vetbank-b
Axis: winnability chain — wild ally-join → wave-4 kills → veterans →
readiness-5 release → wave-5 facing → full seat.
Branch: sim-vetbank-b — worktree ~/workspace/worktrees/sim-vetbank-b
Base: master 81f51c80d (sim-holdpantry-b evidence; current master tip at
registration, 2026-11-14 18:33Z)
Date: 2026-11-14

## The finding (measured, not guessed)

- sim-standing99107-b (anchor c0bbaa071, seeds 99101–99108, 150d):
  standing is war-only and NO LONGER the wall — capped >= 200 on 6/8
  seeds, readiness-5-ready days on exactly one seed (99102, 7 days),
  and the day they occur the door opens the same day. The wall past
  standing is veterans — one living veteran short, on 317
  village-days. 99101 sat at capped >= 200 for 88 days with 1 living
  veteran at best; 99106 for 73 days, also 1 at best. The door opens
  onto an empty village: 99102's two killers are both dead within a
  fortnight of the release.
- sim-vetkill-a (2026-10-24, seeds 73671–73678, tableseat-nowait
  substrate — PREVIOUS anchor, do NOT pool its numbers with this
  arm's): killers die in the arena 0–27 days after first blood (7/8
  dead killers carry fallen cause `the arena`); a veteran is a
  fleeting state. Wave-4+ kills: 0 on all 8 seeds there — the rd5 bar
  had nothing to count.
- Steve ruled 2026-11-10: the scholar's wave kills count toward the
  village's living-veteran bar like any villager's
  (`livingVeteranIds(5)` counts the scholar as living by definition;
  a wave-4+ kill by the scholar's vid is a living veteran while the
  scholar lives).

## The lever (frozen — do not tune mid-run)

New policy `scripts/policies/competent-vetbank-b.js`: plain competent
+ a banking layer, env-gated VETBANK=1 (default OFF — off delegates
byte-identically to competent). Policy-side only: one new policy
file, zero src/js changes, no default flips.

THE BANKING BEHAVIOR (exactly, from what a policy can control):
- `banked(Game)` is true once `state.waveKillLog` contains an entry
  with wave >= 4 and `by === Game.villagerId` (the current scholar).
  This is the readiness bar's own definition of the scholar as a
  living veteran: `livingVeteranIds(5)` counts distinct killer vids
  with wave-4+ kills, living, and the scholar counts as living by
  definition. No other trigger, no HP gate, no timer.
- Once banked, on every player turn of a TB fight containing a LIVE
  wave-4+ monster fighter, the scholar FLEES instead of fighting —
  the w4abstain-a machinery verbatim (walk toward the nearest grid
  edge one tile per turn, push THROUGH the barrier with
  `tbBarrierExit` once on the edge; if the push is refused — sealed
  fight, blocked far side — WAIT the turn out). Never strikes, never
  uses an ability in a wave-4+ fight while banked. Every such turn
  is counted (vb* counters + module stats).
- Pending: a pending wave-4+ FEAST DRAW is declined with the
  engine's own honest verb `driveOffFeastDraw` while banked. Any
  other wave-4+ pending encounter is COUNTED and left alone — the UI
  offers no decline verb for it (only "Face it"), so the harness
  fallback faces it and the fight hook flees it. (w4abstain-a's
  asymmetry, stated here.)
- Before banking, and in every non-wave-4+ fight, the fight hook
  delegates to competent.fight unchanged. Daily, upkeep, contest
  and every other hook are competent's object unchanged. The
  scholar still plays the rest of the game normally — foraging,
  feasting, teaching, talking, fighting waves 1–3 — and villagers
  fight wave-4+ freely; their kills are the untouched control
  channel.

WHAT IT DOES NOT DO (stated so the census cannot be misread):
- No villager-side change: field fights, raid defense, patrols,
  aid fights are engine-driven; the policy cannot touch them.
- No spawn/arrival suppression: a wave-4+ monster can still arrive,
  be drafted, or step onto the scholar's tile. The policy only
  refuses to fight it once a TB fight starts.
- No seat-taking, no diplomacy verbs, no feast/devotion changes.
- No `villageStandingTotal()` / `unlockedWave()` calls in the
  policy. No `Math.random` in the policy file (flee direction is
  deterministic from position; the only new RNG draws are the
  engine's own inside the verbs it already calls).
- Fleeing is not free: monster turns while walking out can kill,
  and a sealed fight must be waited out — possible death. Those
  deaths are the honest cost and count in the wall numbers.

SUCCESSION NOTE: after succession `Game.villagerId` changes and the
NEW scholar's vid is checked. A successor who already holds a
wave-4+ kill as a villager banks immediately — correct per the bar,
they already ARE a living veteran. The instrument records the
scholar vid per day so kills are attributed to the scholar of
record on their kill day.

ATTRIBUTION CAVEAT (vetkill-a ethan_hunt anomaly class): the
`by` field on a waveKillLog entry may name a vid whose death day
precedes the kill day (vid reuse / player-channel attribution).
The trigger reads the log as the bar reads it, so a misattributed
entry could bank early. The instrument cross-checks the banking
day against the scholar's own TB kill events and reports any
mismatch; it never silently re-attributes.

## What is already known (code, not guess)

- `livingVeteranIds(5)` (src/js/standing.js): distinct `by` vids in
  `state.waveKillLog` with `w >= 4`, living (roster + not dead;
  scholar counts as living). `waveCombatReadiness(5)` demands 2.
- `recordWaveKill` (src/js/game.js:34718): the per-kill choke
  point; log entries `{d, mid, w, by, via, trick}`, deduped on
  (day, monster, killer, via, trick). Every real kill — player TB,
  villager field fight, contest — flows through it.
- `waveCombatReadiness(5)` demands: armored 4 @ P>=15, armed 6,
  tricks 3, veterans 2 (killed wave-4+). While any bar is short,
  the gated total holds at 199 and wave 5 stays out of the pool.
- Baseline anchor (standing99107 band, NOT pooled): scholar wave-4+
  kills exist on competent — 99102's scholar killed the Algorithm
  day 58 and died in the wild day 59; a second scholar-side kill
  (eater, player fight) landed day 117, the release day. The
  scholar DOES blood wave-4+ on competent; the question is purely
  whether they live afterwards.
- w4abstain-a (2026-10-27) proved the flee verbs work and the
  activation gate shape (zero player strikes in wave-4 TB fights
  + zero scholar wave-4 kills while abstaining).

## §14b pre-pilot substrate checklist (before the pilot)

1. Contact: scholar wave-4+ kills occur on competent (99102: two
   scholar-side wave-4 kills, days 58 and 117). The STAGE-0 gate
   re-proves contact on THIS band before any verdict.
2. Pool sizing: baseline living veterans at end on the 99107 band
   are 0–1 per seed (99101 best 1, 99106 best 1, 99102 0 at end);
   the G2 bar (+2 living veterans across the band) is within an
   order of magnitude of the scholar-kill pool (99102 alone had 2
   scholar wave-4+ kills).
3. Verb existence: `tbBarrierExit`, `tbPlayerMove`,
   `tbPlayerWait`, `driveOffFeastDraw` all exist and are exercised
   by w4abstain-a / competent's own flee.
4. Horizon fit: 150d — wave 4 unlocks ~day 58 on the anchor;
   99102's release landed day 117. The window contains the
   phenomenon with room for veterans to die or live after the kill.

## Seeds, horizon, policies

- Seeds (BOTH legs, identical): 91701, 91702, 91703, 91704, 91705,
  91706, 91707, 91708. FRESHNESS CHECK: `git grep` over every dated
  prereg under evidence/ (`evidence/*/sim-*-prereg.md`) for each
  seed literal — zero hits naming any 91701–91708 seed. The only
  bare-number hits are the substring "91702" inside the 6-digit
  seed 191702 named in the 2026-11-11 first-a preregs as a
  non-overlap (wallbase-a false-positive precedent: a substring
  inside a longer seed is not a burn). A whole-word `git grep -w`
  over all of evidence/ finds no .md file naming any 91701–91708
  seed; the 12 whole-word hits are numeric values inside old JSON
  corpora (e.g. kcal counts), never seed assignments. Collisions
  recorded and abandoned on the way here: 99301–99308 (diplo-b,
  2026-11-04), 99501–99508 (askplus-a, 2026-11-04), 99601–99608
  (fleerepair confirm, 2026-11-04), 98901–98908 (98903 named in
  vetbar-a, 2026-11-03), 98601–98608 (hurthome-fix-c, 2026-11-04),
  98101–98108 (heraldband, 2026-11-02), 97501–97508
  (hurthome-fix-a, 2026-11-04), 97801–97808 (journey-scale-r111 +
  creekwood, 2026-11-09), 96101–96108 (awayration2/hurttraveler,
  2026-11-03), 97101–97108 (arrears-route, 2026-11-02),
  91401–91408 (trajband-a, 2026-11-01).
- Horizon: 150 days, death-aware (runDays ends on village death /
  win; +10d tail max). Links need 30d to season; veterans need
  time to die or live after the kill; the anchor's release landed
  day 117.
- Policies: `competent` VERBATIM (baseline leg) vs
  `competent-vetbank-b` with VETBANK=1 (armed leg), identical
  seeds, default env otherwise.
- Anchor: master 81f51c80d at pilot time. The pilot's BEFORE leg
  replays competent on this base; it is NOT assumed identical to
  the standing99107 corpus (the base moved) — the before leg is
  this run's own replay.

## Primary metric + GO bars (binding, §14)

- STAGE-0 GATE — on the BASELINE leg, the competent scholar must
  score >= 1 wave-4+ kill somewhere on the band. If the scholar
  never kills wave-4+ on the baseline, the lever is inert — report
  NO-GO (lever inert) with the decomposition as the DIAG
  deliverable; do NOT invent a different lever mid-run.
- G1 INSTRUMENT VALIDITY — GO iff the driver captures a full
  waveKillLog-style decomposition on all 16 configs (8 seeds x
  competent / competent-vetbank-b): every wave-3+ kill attributed
  to a killer (scholar/villager, named) with that killer's survival
  outcome (lived/died, cause, days after the kill); 0 instrument
  errors, 0 UNCLASSIFIED kills, every seed classified
  NEVER-KILLED / KILLED-DEAD-KILLER / KILLED-LIVING (scholar
  wave-4+ kills). Any instrument error, unattributed kill, or
  unclassified seed fails G1.
- G2 THE LEVER — GO iff BOTH halves pass:
  (a) living wave-4+ killers at end (livingVeteranIds(5) at the
      end snapshot; scholar counts): armed band total >= baseline
      band total + 2 AND >= 1 armed seed ends with a living
      veteran;
  (b) readiness-5-ready days: armed band total > baseline band
      total.
  A miss on any half is NO-GO, never re-scored.
- G3 LEVER-ONLY — GO iff zero src/js changes and the proof test
  is green.
- COST BAR (scalemetric) — starvation total armed <= baseline + 2
  AND arm-only starvation <= baseline total AND median survival
  armed >= 0.8x baseline median. A breached cost bar is NO-GO
  even if G2 passes (§14: guardrails are metrics too).
  Guardrail (§14c): report villager combat deaths per seed; name
  any seed where armed exceeds baseline by > 50%.
- ACTIVATION GATE (the policy did what the prereg says): on the
  armed leg, ZERO scholar strikes in wave-4+ TB fights AFTER the
  banking day, and ZERO scholar wave-4+ kills after the banking
  day (the banking-day kill itself is the trigger, not a breach).
  A breach fails G1 (the instrument, not the lever — the lever was
  not actually staged).

## Staging

- Smoke (2–3 seeds, short horizon): the banking trigger fires,
  the flee path runs, the decomposition records. Fix wiring, not
  tuning, if it does not fire.
- Pilot: 8 seeds x 2 legs, 150d. The GO/NO-GO gate.
- Confirm (12–16 seeds): ONLY on a clear pilot GO. A borderline
  pilot is reported as-is; no confirm spend on it.

## Evidence + panel (§15)

- Evidence file `evidence/2026-11-14/sim-vetbank-b.md`: verdict,
  per-seed decomposition table (kills by wave, killer, lived/died),
  before/after numbers, wall numbers (national/table/wins, wave
  4–5 unlocks/facings, median survival), village assessment in
  plain words, sense-testing notes, metric review (§14), balanced
  panel (§15 — the panel is the instrument, the prereg threshold
  is the judge), telemetry deviation check (attempted; a refusal
  is recorded, the baseline is NOT rolled).
- Per-seed JSON in `evidence/2026-11-14/perseed-vetbank-b/`
  (16 files, anchor 81f51c80d).
- Balanced panel: `scripts/build-vetbank-panels-20261114.js`
  (scaleclimb pattern — paired seeds, pseudo-policy, contract
  metrics mappable from the per-seed JSONs: won, national,
  survival30/60, communityLost, villageDeaths; the panel cannot
  judge a policy contrast on veterans, so the G2 verdict is read
  from the decomposition, never from the panel).
- Telemetry deviation check: `node scripts/telemetry-check.js
  --baseline .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-14/perseed-vetbank-b/*.json' --metrics
  national,table,wins,exiled`. The standing99107 arm's refusal
  (recorder-corpus input) is expected to recur; record it, do not
  roll the baseline.

## Convergence state

Axis winnability chain: this arm is a BUILD on the binding bar the
standing99107 DIAG pinned (living veterans, 317 days). Verdict
reported as GO (ready to merge) or NO-GO (evidence-only, kill
classified per §14a: CONCEPT-DEAD / METRIC-BROKEN /
SUBSTRATE-MISSING) after the pilot.
