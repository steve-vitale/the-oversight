# journey-scale r68 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-01T19:43Z (scheduled 13:45 CST 2026-11-01).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a failed run does not advance the rotation). This run's 3 follows
the deepening leg's 2→3 write (rotation file mtime 19:25Z, minutes
before this run's lock), so it is queue-correct, not the r61–r64
"still reads 3" anomaly.
**Base:** master@be352e2cb at branch creation (Loop A 1742Z
coordinator evidence tip).
**No src/js change planned at pre-register time; a src/js fix may land
ONLY under the Q1 fix gate below, with its own proof test.** Otherwise
measurement only, zero src/js.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work; all
instruments are read-only, and the gossip-forcing picker changes only
which offered menu item the driver presses, never engine state.

## Standing context (read before scoring)
- r67 (quad 85011–85014, pre-fix scored): gossip-fallback repeat NOT
  reproduced — 0 fallback pairs, 0 exact pairs across 5 transcripts —
  BUT with an exposure caveat that weakens the verdict: ZERO of the 5
  sittings included a gossip thread at all (the picker never chose
  ask:gossip). Per r67's verdict rule the fix gate stayed closed.
  **This run is the queued follow-up: a gossip-forcing talk mode.**
- r67 people check: 4 of 5 fully real; 1 exact-content repeat (Deon
  d120 goal opener re-served via quoted twin) — FIXED in r67
  (convoPick quote-normalized dedupe, in this run's base). The r67
  fix is not re-scored here; its footprint is whatever the fresh
  band shows.
- r67 duty counts: weapon-craft lines 0/4, deadfall-duty lines 0/4 —
  the SEVENTH consecutive 0/4 for both (r61–r67). Armed-gate
  classification reproduced on fresh seeds (676/676 knower-days
  armed; weaponless-knower days 0; eligible days 0).
- Carried unre-tested (NOT re-scored here unless evidence arises):
  Olivia post-accept aphorism loop (r64/r65; no accept arose on
  r66/r67 either); r65 bank-trace finding; r63 mantle-pass proof;
  r58 Irving-displacement, subject-menu, Boris nod-loop; r56
  chooseAbility-unguarded note; r55 barrier pin form (r67 confirmed
  the guard working: sleep-during-fight refusals, not breaks).
- Queued test-maintenance item (r67, NOT this run's job unless the
  suite forces it): capable-bot section 7 first-use assertion is
  trajectory-sensitive after the r67 dedupe fix (a villager's fight
  consumed the feast buff before the player's first combat use);
  re-seed section 7 or make it order-tolerant. Do not loosen it to
  fit a trajectory.

## Leg questions (binding)
1. **GOSSIP EXPOSURE + FIX GATE (r67 queued item):** diagnostic +
   fix-if-gated, on a fresh quad.
   Instrument: the r67 driver unchanged except labels/seeds/EVIDIR
   PLUS a gossip-forcing picker branch
   (scripts/journey-scale-r68-20261101.js, GOSSIP_FIRST=1):
   pickChoice takes ask:gossip before ENGAGE on every turn until
   one gossip pick per sitting. The branch fires only when the menu
   actually offers ask:gossip; it changes no engine input. Exposure
   metric: ask:gossip picks per sitting (driver logs
   "(gossip picks this sitting: N)" per transcript) + gossip THEM
   lines, counted by the r68 analyzer.
   Analysis: the r67 gossip analyzer, reused as-is with the r68
   EVIDIR argument (it matches /transcript-.*\.txt$/ and its
   normalization rules are fixed from r67 — no re-tuning).
   Verdict rule, decided BEFORE reading results:
   - If ≥1 FALLBACK near-repeat reproduces in the forced band, the
     mechanism is CONFIRMED systemic and the FIX GATE opens: a
     contained sitting-level fallback dedupe (fallback line must
     not render twice in one sitting, falling through to the honest
     idle admission), shipping ONLY with a fixture proof test
     (scripts/test-gossip-fallback-r68.js) that reproduces the
     repeat on pre-fix code (two distinct null-top gossip entries
     driven through two beats) and passes post-fix, plus check.js
     --quick green apart from the standing pre-existing failures.
     If no contained implementation exists, the fix is a documented
     next-run item with the proof test as the repro — never a
     speculative edit.
   - If 0 fallback repeats DESPITE gossip exposure (sittings with
     gossip beats served), the r66 instance STANDS as a
     single-instance blemish, not systemic, and no fix lands.
   - If 0 gossip picks at all (ask:gossip never offered on this
     path), that is an EXPOSURE FAILURE, not a clean bill: report
     it as a new finding (gossip unreachable from the driver's
     sittings) and do not claim non-reproduction.
2. **PEOPLE CHECK (sense law):** read the Q1 quad transcripts in
   full. Judge meaning, coherence, relevance, consequences — never
   just exchange counts. Known blemish classes to check for
   recurrence (not re-scored as new): Irving one-sitting
   displacement, Thabo withdrawal-only talk, Meera/Dale gossip
   tail, Boris nod-loop, Olivia post-accept aphorism loop, Deon
   goal-opener repeat (fixed in r67 — a recurrence here is a
   REGRESSION, not a new blemish).
   Adjudication rule (carried from r66/r67): the Olivia blemish is
   a FIX only on a true defect (verbatim repeated line,
   contradiction, or a want left in an impossible state); a
   resolved outing outcome with distinct temperament-grounded
   follow-ups is THIN-BUT-WORKING generic talk — documented, not
   fixed. The betray file plus the capture's accept line are the
   evidence either way.
3. **DUTY REACHABILITY + WSPLIT CONTINUITY (counts, report-only):**
   per Q1 seed, weapon-craft lines and deadfall-duty lines via the
   r68 analyzer (r67 analyzer, labels/seeds only, no purity diff —
   fresh seeds + forced picker change the RNG stream, so a capture
   diff would be meaningless); plus the wsplit decomposition.
   r61–r67 all 0/4 on both duties; a nonzero count here is a
   finding, an eighth 0/4 is continuity. A large eligible-day
   count with zero attempts would reopen r66's classification as
   a new finding, not a re-score.
4. **TABLE-APPROACH + CENSUS (report-only):** end-state class
   (ALIVE / SCATTERED / DEAD), seat, arc, wave 5 reached, lesser
   vs full seat per seed, from the trust JSONs + wantwatch.

## Pilot gate
Seed 85021 runs first with GOSSIP_FIRST=1; if it crashes or its
capture is empty, STOP. Then the full quad (85022–85024). Fresh
seeds 85021–85024 verified unused by any scale evidence (only
substring false positive: a kcal total 4585023 in an r19 file).

## Census scalars (unchanged from r51)
day, over, popAlive/popTotal, pantryKcal, scaleRank, nationalDay,
globalDay, firstCourtDay, tableSeat, arcNow, deaths, covenant trusts,
maxWave, pilgrimages, fusionInstalled, abilitiesHeld — plus the
r61 end-state class, the weapon-craft-line count, the
deadfall-duty line count, and the gossip-exposure counts
(ask:gossip picks, gossip THEM lines, sittings).

## Telemetry
After writing evidence, run telemetry-check against
hidden_files/telemetry-baselines/scale-census.json with the r68
current-quad trust JSONs. Baseline NOT rolled on this run's numbers
(prereg decision; r59 seeded it and no run since has rolled it).
Any LOUD line is a same-run investigation item before closeout.
