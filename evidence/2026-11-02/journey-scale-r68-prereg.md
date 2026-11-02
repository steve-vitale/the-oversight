# journey-scale r68 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-02T08:44:24Z (scheduled 02:45 CST 2026-11-02).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a failed run does not advance the rotation).
**Base:** master@a8c3ee57b at branch creation.
**No src/js change planned at pre-register time; a src/js fix may land
ONLY under the Q1 fix gate below, with its own proof test.** Otherwise
measurement only, zero src/js.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work; all
instruments are read-only. The gossip-forcing picker changes only
WHICH offered choice the driver presses in a talk (ask:gossip when
offered); it feeds no roster, list, or hidden state into any
decision, and the engine's own talk options are unchanged.

## Why this run, and why fresh seeds
r67 (quad 85011–85014) scored 0 gossip-fallback pairs but with an
exposure caveat that weakens the verdict: ZERO of its 5 fresh
sittings included a gossip thread at all — the picker never chose
ask:gossip — so the fallback line never had a chance to render
twice. r67's queued next-run item was exactly this: a
gossip-forcing talk mode so a scale band actually exercises the
fallback, plus the sitting-level fallback dedupe fix with its
fixture proof test. This run is that item, on FRESH seeds
85015–85018 (verified unused by any scale evidence), through the
same instrument as r67 plus the forcing mode.

## Standing context (read before scoring)
- r67 scored quad (pre-fix): lesser seat 0/4, full seat 0/4, wave 5
  reached 0/4, national 0/4; all four stop at regional/arc3. Weapon-
  craft lines 0/4 seeds, deadfall-duty lines 0/4 seeds — the
  SEVENTH consecutive 0/4 for both duties (r61–r67). Armed-gate
  classification reproduced: every knower-day armed, zero
  stick-only days, eligible population structurally ~empty.
- r67 people check: 4 of 5 transcripts fully real; 1 exact-content
  repeat (Deon goal opener served again on "Tell me more") FIXED in
  r67 by quote-normalized convoPick dedupe, with proof test and a
  post-fix control quad. The r66 Henrique gossip repeat STANDS as a
  single instance with a proven mechanism (gTop-null fallback
  renders identically for any null-top entry; walk-down dedupes by
  entry sig, never by rendered line; voice open/close draws mask
  the repeat from exact-duplicate checks).
- Carried unre-tested (NOT re-scored here unless evidence arises):
  Olivia post-accept aphorism loop (r64/r65/r66/r67 — no accept
  arose on four consecutive scale bands); r65 bank-trace finding;
  r63 mantle-pass proof; r58 Irving-displacement, subject-menu,
  Boris nod-loop; r56 chooseAbility-unguarded note; r55 barrier pin
  form (r67: guard confirmed working — sleep-during-fight refusals
  are the guard firing, not breaking). Capable-bot section 7
  test-maintenance item from r67 (solo-only fixture sensitivity:
  a villager's fight consumed the feast buff before the player's
  first combat use; trajectory shift from the r67 pick-pool
  shrink, deed mechanism intact — re-seed section 7 or make its
  first-use assertion order-tolerant on a later run, NOT here).

## Leg questions (binding)
1. **GOSSIP-FALLBACK REPEAT, WITH EXPOSURE (r67 queued item):**
   GOSSIP_FIRST=1 forces ask:gossip whenever the engine offers it,
   at every turn of every d90/d120 sitting. Exposure is counted
   from the transcripts (YOU: [ask:gossip] picks per sitting).
   - FIX GATE OPENS iff the r67 gossip analyzer reports ≥1
     FALLBACK pair in the band → land the sitting-level fallback
     dedupe fix (dedupe by normalized rendered line within a
     sitting, quote/voice-framing stripped, same normalization as
     the analyzer) with a fixture proof test RED→GREEN, plus a
     post-fix control check on the analyzer (0 fallback pairs on
     the same transcripts is NOT expected — the fix changes engine
     picks, so the control is the proof test + check.js --quick,
     not a re-run).
   - If 0 fallback pairs WITH exposure (ask:gossip picked in ≥4
     sittings across the band) → the r66 Henrique instance STANDS
     as a single-instance blemish, no gossip fix; the mechanism
     stays documented, the verdict is now exposure-backed.
   - If exposure is still ~0 (ask:gossip offered in <4 sittings
     or never picked) → the gate stays closed AND the exposure
     failure itself is the finding: report why gossip never
     surfaces (option absent vs picker blocked), do not claim a
     clean bill.
2. **PEOPLE CHECK (sense law):** read every fresh transcript in
   full. NPC wants something, options engage/deflect it, endings
   resolve/plant/owe. No fabricated shared history, no filler
   loops, no static menus. Any new repeat class is a finding, not
   a re-score of Q1.
3. **TABLE-APPROACH + CENSUS (report-only):** same scalars as
   r51's list + covenant trusts + end-state class + weapon-craft
   and deadfall-duty line counts. Seat/wave/national counts are
   reported, never chased: the gossip-forcing picker perturbs talk
   RNG, so this band's seat counts are not comparable seed-for-
   seed with r67's natural-picker band.
4. **DUTY COUNTS (report-only, continuity):** weapon-craft lines
   and deadfall-duty lines per seed; wsplit/duty instruments
   unchanged from r67.

## Method
- PILOT GATE: seed 85015 runs first; if it crashes or produces no
  transcripts, STOP and report.
- DAYCAP 180, death-aware stop (same as r67). Policy:
  scalecourt-nogate, unchanged.
- Driver: scripts/journey-scale-r68-20261102.js (r67 driver,
  labels/EVIDIR/seeds only, PLUS the GOSSIP_FIRST picker mode).
  Analyzer: scripts/analyze-journey-scale-r67-gossip-20261101.js
  unchanged (globs transcript-*.txt; takes EVIDIR as argv).
- Telemetry step 14: node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/scale-census.json --current
  'evidence/2026-11-02/journey-scale-r68/journey-scale-r68-trust-*.json'
  --metrics census.day,census.popAlive,census.pantryKcal,
  census.maxWave,census.pilgrimages. LOUD lines investigated
  before any baseline roll; baseline NOT rolled on this run's
  numbers (same standing decision as r62–r67).

## Metric review (carried)
- Census scalars unchanged from r51's list, plus fusion/ability
  columns (reads, not scores), plus the r61 end-state class and
  the weapon-craft-line and deadfall-duty-line counts. The gossip
  analyzer reports; it does not re-score any prior metric.
- No metric re-scored mid-run. A new finding outside Q1 (like
  r67's Deon fix) is held to the stricter bar: fixture proof
  RED→GREEN + check.js --quick before landing; otherwise revert
  and document.
