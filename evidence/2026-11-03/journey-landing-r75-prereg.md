# journey-landing r75 — PRE-REGISTER (lane A, leg 0 LANDING, days 1–14 + tail)

**Run id:** laneA-20261103T224404Z (lock created 2026-11-03T22:44:04Z; scheduled
16:45 CST 2026-11-03). Rotation read 0 → leg 0 LANDING; wrote 0→1 at run
start, verified by read-back.
**Base:** master@349a6ab15 at branch creation (includes r74's r75-driver
tooling, merged locally, pending ship — normal).
**Driver:** scripts/journey-landing-r75-20261103.js — r74's driver + dawn
LIVE-RUN PASS (logs every live run at dawn; ENDS a live run whose promise is
already broken when the player is at Haven; live runs with open promises
logged only) + OUTING_PROBE carried over. No src/js change in this run's
driver. FAVOR_TRACE always-on (carried over).
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** instruments read-only; the probe only
presses offered favor actions and walks honest travel hops — never engine
state, never teleports. The live-run pass only presses the conversation
cancel/end action the game itself offers.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if the fix
gate below is met; otherwise document and move on.
**Canon read:** docs/CANON.md (manifest). No new canon invented. The favor
lifecycle and the counter-stage deliver path are already-landed behavior
(r73 fix, r74 panel); this run verifies the live-run poison chain, not a
redesign.

## Standing context (read before scoring)
- Last landing run: r74 (2026-11-03, seeds 901–904). 901 GO with explained
  liturgy note; 902/903/904 GO. Stay-green gates all met (system contact
  8/8/9/8; theft 0; self-sufficiency 0.84–1.00; starvation deaths 0;
  plenty-voice 26/26/20/26).
- r74's blank: the STUCK LIVE OUTING. Engine auto-departs a promised outing
  at dawn; plain `forage` presses do not work it (only `forage_together`
  splits hauls); the driver never pressed favor actions on a live run, so
  a broken-promise run stayed live, blocked the next outing ("Finish your
  current outing before starting another"), and the player was blamed
  (-15 trust) for both breaks. The game DOES offer the exit (opening line
  + conversation cancel "End outing and unload what we have"); the driver
  never took it. r74 landed the r75 driver + a seed-902 proof replay:
  day-14 Maya broken → END ok=true (honest 0-kcal line, no kept credit);
  Nina then UNBLOCKED → start → together → deliver ok=true, 810 kcal
  (360 player + 450 Nina), kept=true. The poisoned panel converts to a
  kept outing in replay. This run tests whether that holds on FRESH seeds.
- r74 metric review, ADOPTED here: death-liturgy gate is presence-aware
  (see Q1) — count only villager deaths while the player is at Haven (or
  on a night the player spends at Haven) within the horizon; exclude
  final-day player deaths. The old presence-blind form is retired, not
  re-scored.
- `more` gate RETIRED in r74 (0 offered on seven running runs). Not gated
  here; thread depth still covered by depthFizzles / depthEmptyBeats /
  sitDepth2Plus.
- r74 telemetry: one LOUD line, EXPLAINED instrument mismatch (checker
  read top-level `villagerDeaths`, census carries deaths in the `deaths`
  array). No baseline rolled. This run uses only census keys that exist
  as scalars (systemDay, monsterKills, starvAutopsies) and reports any
  LOUD line with a verdict before any baseline roll.

## Leg questions (binding)
1. **STAY-GREEN (carry, report + gates):** fresh quad 905–908, policy
   competent PINNED, FAVOR_ACCEPT default ON, horizon 14d, death-aware
   stop (+10d tail). Gates per seed: System contact day ≤ 10; death
   liturgy exact on the PRESENCE-AWARE count (grief beats == villager
   deaths while player at Haven / Haven nights within horizon, final-day
   player deaths excluded), 0 headcount codas; theft 0; self-sufficiency
   ≥ 0.70 on the last series day and 0 starvation deaths; plenty-voice
   ≥ 1. PILOT GATE: seeds 905+906 run first; if either crashes or
   systemDay is null, STOP and report.
2. **LIVE-RUN PROBE (r74 blank, end-to-end on fresh seeds):** GO = at
   least one panel outing auto-departs, is logged live at dawn, and
   resolves without poisoning the next outing — either worked to
   deliver (kept) or ended at Haven after its promise broke (honest
   line, food unloaded, companion slot freed, next start unblocked).
   NO-OPPORTUNITY if no panel outing auto-departs live. A live run that
   stays live past its broken promise while the player is at Haven AND
   blocks a later start is a CONFIRMED game defect (the exit the game
   offers is not reachable through the driver's honest path) and meets
   the fix gate. A false "0 kcal from you" line on a counter-staged
   deliver is likewise a senseless defect (r73 fix regression check).
3. **PEOPLE CHECK (sense law — transcripts read in full):** all sittings
   from the pilot + main seeds judged on meaning, coherence, relevance,
   consequences — never just exchange counts. Gates: 0 depth fizzles,
   0 fabricated shared history, 0 sittings where a pursued continuer
   yields an empty beat.
4. **TELEMETRY (attempt, report outcome):** run
   `node scripts/telemetry-check.js --baseline
   ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/landing-split.json
   --current '<r75-census-glob>' --metrics systemDay,monsterKills,starvAutopsies`.
   Any LOUD line is a same-run investigation item — dig into the
   deviation (explained vs real bug) BEFORE any baseline roll. No
   baseline is rolled in this run without a LOUD-line verdict. If the
   checker refuses the corpus, report the refusal verbatim and do not
   claim a deviation check.

## Metric review
- (Filled at closeout. Pre-registered metrics bind this run; a miss is
  NO-GO, never re-scored against a friendlier metric mid-run.)

## Infra notes (at prereg time)
- Worktree `journey-landing` registered under oversight-playtest-loop;
  register took ~17 min (evidence-tree checkout under parallel load;
  git reset --hard mostly I/O-wait). Standing heartbeat loop (600s)
  started; beat verified in the registry (heartbeat_at
  2026-11-03T23:04:57Z) before the pilot runs. Note: beats queue behind
  the registry flock under sibling load but DO land — verify
  heartbeat_at, never trust the loop's printed line alone.
- Pre-flight reap completed: active 12/16, several LOUD dirty-tree
  notices for OTHER owners' trees (never touched). Main tree clean
  (0 lines) at pre-flight; git pull already up to date; disk 30%.
- No lock contention: no playtest-loop.lock existed at run start; lock
  created laneA-20261103T224404Z.
- Prior landing runs this cycle: r73/r74 (2026-11-03). Rotation cycled
  through the other lane-A legs since r74, so this run reads 0 again
  legitimately.
