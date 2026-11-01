# journey-scale r67 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-01T14:51:24Z (scheduled 08:45 CST 2026-11-01).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a failed run does not advance the rotation). This run's 3 follows the
deepening leg's 2→3 write (deepening r80 closed ~14:46Z), so it is
queue-correct, not the r61–r64 "still reads 3" anomaly.
**Base:** master@230bc154e at branch creation (r95 endgame tip).
**No src/js change planned at pre-register time; a src/js fix may land
ONLY under the Q1 fix gate below, with its own proof test.** Otherwise
measurement only, zero src/js.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work; all
instruments are read-only (each villager's own gear/knowledge/materials
plus the camp pile, exactly as the duties themselves read them).

## Why fresh seeds, not a parity re-run
r66 ran the 85001–85004 quad on base 7c8745741 and landed on master with
zero game-code change since (r66's own landing verified the rebase range
held zero src/js + src/data). A same-seed re-run would be trivially
identical except for the r95 base change. This run therefore runs FRESH
seeds 85011–85014 (verified unused by any scale evidence) through the
same instrument, and asks the diagnostic r66 explicitly queued.

## Standing context (read before scoring)
- r66 (quad 85001–85004): weapon-craft = PRECONDITION, armed gate
  dominant in its strong form (1,019/1,020 knower-days armed with a REAL
  weapon; eligible-days 0; attempts 0; unexplained non-attempts 0).
  Stick hypothesis REFUTED (0 stick-only knower-days). Lesser seat 2/4,
  full seat 0/4, wave 5 reached 0/4. Weapon-craft lines 0/4 seeds,
  deadfall-duty lines 0/4 seeds — the SIXTH consecutive 0/4 for both
  (r61–r66).
- r66 people check: 5 of 6 transcripts fully real; 1 partial blemish —
  85003 d120 Henrique (grief → gossip): the reputation line served
  TWICE in one sitting, near-verbatim, re-framed:
  "The way I read it — Word is you're doing right by people. Keep it up."
  then "Word is you're doing right by people. Keep it up. That's my read."
  (gossip-tail class seen with Meera/Dale earlier; new instance).
  The driver's exact-duplicate flag did NOT fire (lines differ by
  framing). Documented as a next-run item, not fixed in r66.
- Code facts established by reading BEFORE this run (not by the quad):
  the reputation line is the gTop-null FALLBACK in game.js askAbout
  gossip ("Word is you're doing right by people. Keep it up."): it
  renders identically for ANY gossip entry whose dims have no positive
  value, while the r28/r31 walk-down dedupes by ENTRY sig
  (action|who|partKey) and content key (action|who) — never by rendered
  line. Two distinct null-top entries therefore render the same line.
  The "The way I read it — " / "That's my read." framings are voice
  open/close draws (characterGen.json adult/measured), applied per
  beat by voiceLine — so the repeat escapes exact-duplicate detection
  by construction. No canon doc covers gossip-fallback rendering; this
  run does not invent one, it reports the mechanism.
- Carried unre-tested (NOT re-scored here unless evidence arises):
  Olivia post-accept aphorism loop (r64/r65; r66 adjudication did not
  fire — no accept arose); r65 bank-trace finding; r63 mantle-pass
  proof; r58 Irving-displacement, subject-menu, Boris nod-loop;
  r56 chooseAbility-unguarded note; r55 barrier pin form.

## Leg questions (binding)
1. **GOSSIP-FALLBACK REPEAT (r66 blemish → mechanism + fix gate):**
   diagnostic + fix-if-gated, on the fresh quad.
   Instrument: the r66 driver unchanged (labels/seeds only) — its
   d90/d120 transcripts — PLUS a new near-duplicate analyzer
   (scripts/analyze-journey-scale-r67-gossip-20261101.js): for each
   transcript, strip voice framing (leading open draws, trailing
   close draws, quotes, case, punctuation) from every THEM line and
   flag pairs whose normalized cores match, reporting the pair,
   the turn distance, and whether the shared core is the
   reputation-fallback line. Normalization rules are fixed in the
   analyzer's header BEFORE reading results; the analyzer is pure
   (no engine input).
   Verdict rule, decided BEFORE reading results: report repeats per
   transcript (count, pairs, fallback-vs-other). If ≥1 fallback
   near-repeat reproduces on the fresh band, the mechanism is
   CONFIRMED systemic (not a one-instance quirk) and the FIX GATE
   opens (below). If 0 repeats on all transcripts produced, the
   r66 instance STANDS as a single-instance blemish, not systemic,
   and no fix lands this run.
   FIX GATE (only if confirmed): a contained fix in the gossip
   fallback branch — the fallback line must not render twice in
   one sitting (sitting-level dedupe riding the existing skipSigs
   machinery, e.g. a constant fallback marker checked by
   servedAlready against null-top candidates, falling through to
   the honest idle admission). The fix ships ONLY with a proof
   test (scripts/test-gossip-fallback-r67.js) that reproduces the
   repeat on the pre-fix code (fixture: two distinct null-top
   gossip entries driven through two beats) and passes post-fix,
   plus check.js --quick green apart from the standing pre-existing
   failures. If no contained implementation exists, the fix is a
   documented next-run item with the proof test as the repro —
   never a speculative edit.
2. **PEOPLE CHECK (sense law):** read the Q1 quad transcripts in
   full. Judge meaning, coherence, relevance, consequences — never
   just exchange counts. Known blemish classes to check for
   recurrence (not re-scored as new): Irving one-sitting
   displacement, Thabo withdrawal-only talk, Meera/Dale gossip
   tail, Boris nod-loop, Olivia post-accept aphorism loop.
   Adjudication rule (carried from r66): the Olivia blemish is a
   FIX only on a true defect (verbatim repeated line, contradiction,
   or a want left in an impossible state); a resolved outing outcome
   with distinct temperament-grounded follow-ups is THIN-BUT-WORKING
   generic talk — documented, not fixed. The betray file plus the
   capture's accept line are the evidence either way.
3. **DUTY REACHABILITY + WSPLIT CONTINUITY (counts, report-only):**
   per Q1 seed, weapon-craft lines (capture /spent the afternoon at
   the workbench and made/) and deadfall-duty lines (/deadfall/i
   with the duty line split out) via the r67 analyzer (r66 analyzer,
   labels/seeds only); plus the wsplit decomposition. r61–r66 all
   0/4 on both duties; a nonzero count here is a finding, a
   seventh 0/4 is continuity. The armed-gate classification is
   expected to reproduce (eligible-days ~0); a large eligible-day
   count with zero attempts would reopen r66's classification as
   a new finding, not a re-score.
4. **TABLE-APPROACH + CENSUS (report-only):** end-state class
   (ALIVE / SCATTERED / DEAD), seat, arc, wave 5 reached, lesser
   vs full seat per seed, from the trust JSONs + wantwatch.

## Pilot gate
Seed 85011 runs first; if it crashes or its capture is empty, STOP.
Then the full quad (85012–85014).

## Census scalars (unchanged from r51)
day, over, popAlive/popTotal, pantryKcal, scaleRank, nationalDay,
globalDay, firstCourtDay, tableSeat, arcNow, deaths, covenant trusts,
maxWave, pilgrimages, fusionInstalled, abilitiesHeld — plus the
r61 end-state class, the weapon-craft-line count, and the
deadfall-duty line count.

## Telemetry
After writing evidence, run telemetry-check against
hidden_files/telemetry-baselines/scale-census.json with the r67
current-quad trust JSONs. Baseline NOT rolled on this run's numbers
(prereg decision; r59 seeded it and no run since has rolled it).
Any LOUD line is a same-run investigation item before closeout.
