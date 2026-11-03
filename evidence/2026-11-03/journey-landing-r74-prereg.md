# journey-landing r74 — PRE-REGISTER (lane A, leg 0 LANDING, days 1–14 + tail)

**Run id:** laneA-20261103T164342Z (scheduled 10:45 CST 2026-11-03).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@c5118da82 at branch creation (includes r73's deliver-counter
fix, merged locally, pending ship — normal).
**Driver:** scripts/journey-landing-r74-20261103.js — clone of the r73 driver
(labels/seeds/OUTDIR only) + census counter-kcal fields on both forageRun
capture sites (deliveredPlayerKcal / deliveredPlayerCounterKcal /
deliveredPartnerKcal). Diff verified by inspection: no src/js, no other
driver logic. FAVOR_TRACE carries over always-on (r73's tracer).
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** instruments read-only; the probe only presses
offered favor actions and walks honest travel hops — never engine state, never
teleports. The tracer READS favorLedger/promises only; it never writes them.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if the fix gate
below is met; otherwise document and move on.
**Canon read:** docs/CANON.md (manifest). No new canon invented. The favor
lifecycle and the counter-stage deliver path are already-landed behavior
(r73 fix); this run verifies, not redesigns.

## Standing context (read before scoring)
- Last landing run: r73 (2026-11-03, seeds 801–804). 801/802/804 GO; 803
  metric-miss EXPLAINED (deliver matched pack only, missed counter-staged
  food) and FIXED in src/js/favor-forage.js (deliver counts the prep-stash
  counter too, via prepStash(), without removing counter food; proof
  scripts/test-forage-deliver-counter-r73.js 18/18, [needs-eyes]).
- r73's Jorge repro (r72's blank): NOT reproduced — no FAVOR-VANISH on the
  seed-701 replay. The vanished promise stands as an unreproduced
  single-seed anomaly, not a confirmed defect. No fix pursued.
- r72's Wanjiru case: EXPLAINED, no fix — a partner who leaves AFTER
  promising breaks the promise when the window passes (away trap's second
  face). Design call (wider window / slid meet), not a silent defect: the
  promise does resolve (breaks), it does not vanish.
- `more` offered 0 times on all four r73 seeds — the SIXTH running run of
  dead UI in landing. r73's prereg proposed retiring the more-thread gate
  if 0 again; r73's metric review did not execute that retirement. This run
  is the seventh watch: if 0 again, the gate is RETIRED in this run's metric
  review (reported once, as a retirement, not as news).
- Telemetry check left undone in r73 (worker tool access ended; checker had
  refused recorder/log corpora on recent runs). This run attempts it against
  the r74 census glob and reports the outcome plainly (LOUD lines, or the
  tool's refusal, or no-baseline-eligible corpus).

## Leg questions (binding)
1. **STAY-GREEN (carry, report + gates):** fresh quad 901–904, policy
   competent PINNED, FAVOR_ACCEPT default ON, horizon 14d, death-aware
   stop (+10d tail). Gates per seed: System contact day ≤ 10; death
   liturgy exact (grief beats == villager+person deaths, 0 headcount
   codas); theft 0; self-sufficiency ≥ 0.70 on the last series day and
   0 starvation deaths; plenty-voice ≥ 1.
   PILOT GATE: seeds 901+902 run first; if either crashes or systemDay is
   null, STOP and report.
2. **COUNTER-STAGE VERIFY (r73 fix, end-to-end):** the census now records
   deliveredPlayerKcal / deliveredPlayerCounterKcal / deliveredPartnerKcal
   per outing. GO = at least one panel outing stages player food on the
   counter (deliveredPlayerCounterKcal > 0) AND credits it (no false
   "0 kcal from you" line when player+counter kcal > 0). If no panel
   outing produces a counter case, that is NO-OPPORTUNITY, not a defect —
   the unit proof (r73, 18/18) stands as the evidence and the panel
   result is reported as such. A false-zero line on a counter case is a
   senseless defect and meets the fix gate.
3. **PEOPLE CHECK (sense law — transcripts read in full):** all sittings
   from the pilot + main seeds judged on meaning, coherence, relevance,
   consequences — never just exchange counts. Gates: 0 depth fizzles,
   0 fabricated shared history, 0 sittings where a pursued continuer
   yields an empty beat. Also report `more` offered count (seventh watch;
   retire the gate in metric review if 0 again).
4. **TELEMETRY (attempt, report outcome):** run
   `node scripts/telemetry-check.js --baseline
   ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/landing-split.json
   --current '<r74-census-glob>' --metrics <this-leg's-key-metrics>`.
   Any LOUD line is a same-run investigation item — dig into the deviation
   (explained vs real bug) BEFORE any baseline roll. No baseline is rolled
   in this run without a LOUD-line verdict. If the checker refuses the
   corpus, report the refusal verbatim and do not claim a deviation check.

## Metric review
- (Filled at closeout. Pre-registered metrics bind this run; a miss is
  NO-GO, never re-scored against a friendlier metric mid-run.)

## Infra notes (at prereg time)
- Worktree `journey-landing` registered under oversight-playtest-loop;
  register took ~4.5 min (evidence-tree checkout under parallel load).
  Standing heartbeat loop (600s) started; first beat verified in the
  registry (heartbeat_at 2026-11-03T16:53:33Z) before the pilot runs.
- Pre-flight reap completed: active 13/16, several LOUD dirty-tree notices
  for OTHER owners' trees (never touched). Main tree clean (0 lines) at
  pre-flight; git pull already up to date; disk 30%.
- No lock contention: no playtest-loop.lock existed at run start; lock
  created laneA-20261103T164342Z.
- Prior landing runs this cycle: r71/r72 (2026-11-02), r73 (2026-11-03
  03:45 CST). Rotation cycled 0→1→2→3→0 through the other lane-A legs
  since r73, so this run reads 0 again legitimately.
