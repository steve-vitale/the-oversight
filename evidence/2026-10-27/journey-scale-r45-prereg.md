# journey-scale r45 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261027T1445Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion. (Note: r44's note claims it wrote 3→0, yet this run
reads 3 again — either a later lane-A run re-set it or r44's write did not
persist. This run plays the file as read and writes 3→0 again; the file, not
r44's claim, is the authority.)
**Base:** master@60e260dc0 at run start (journey crisis r57).
**No src/js change planned at pre-register time:** measurement + instrument
first (r43/r44 discipline). A game-code fix is decided ONLY after evidence
confirms a mechanism, and only lands with its own proof test.

## Standing context (read before scoring)
- r43: removal-bystander-zero GO; lesser seat 3/4; full seat unreached (w5 0).
- r44: betrayal-label answered (LABEL-MISLEADING: accepts are "yes to a walk",
  sometimes a lure, not a betrayal; instrument undercounts 2→1 on 85003 via
  first-accept-only guard); divergence tool validated; pilot 85001 byte-identical
  to r43; seasoned-bar: trust-short only, Ashford binding (peak 37, never 40).
- Base drift since r44: ONE src/js change — sim-scalegate-a (234d3a825):
  deedGateReady() now enforces national scale in the full-seat gate per Steve's
  2026-10-27 ruling. Everything else in range is evidence/scripts + a ship bump.
  Scalegate touches ONLY the full seat; r43/r44 villages reached lesser at best,
  so pilot parity is expected — but it must be CHECKED, not assumed, because a
  src/js change is exactly what breaks parity claims.
- New standing context mid-run: MEMORY.md gained ruling (6) 2026-10-27 — the
  table should NOT be a forgone conclusion; a player should have to be skilled
  in some way to reach the end most of the time. Recorded here as context, not
  scored: this run measures reachability, it does not re-tune the table.

## Leg questions (binding)
1. **SCALEGATE-PARITY:** pilot seed 85001 on the current base, r44 driver with
   labels/EVIDIR only, policy scalecourt-nogate, DAYCAP 180, death-aware stop.
   Verdict rule: PARITY iff capture + trust JSON + transcripts + census are
   byte-identical to r44's 85001 (divergence tool used for the capture). If
   identical, the full 4-seed batch is SKIPPED (pilot-first: the leg is frozen
   apart from the instrument change in Q2). If diverged, expand to all 4 seeds
   and investigate the divergence before any other claim.
2. **BETRAY-INSTRUMENT (r44 item, driver-only):** new driver
   `scripts/journey-scale-r45-20261027.js` = r44 driver, labels only, PLUS:
   (a) record EVERY betrayal:accept (remove the first-accept-only guard for the
   accept event; daily snapshots stay keyed by first-registered subject);
   (b) record armed vs ordinary per accept: armed iff, BEFORE the accept pick
   is played, an active unsprung plot names this villager as inviter with the
   player as target (same predicate as acceptInvite's ambush branch); armed
   is null (unknown) only if the betrayal state is unreadable.
   Verdict rule: INSTRUMENT-GO iff on seed 85003 the new betray file shows
   exactly 2 accepts for Joshua, BOTH ordinary (matching r44's transcript
   count and its zero-sprung-plots finding), AND the new capture is identical
   to the r45 pilot capture except the betray file (the instrument must not
   move the game). 85001 is run with the new driver as the no-regression
   control: its accept count must equal r44's betray file for 85001.
3. **TRUST-HOLD (r44 seasoned-bar follow-up, analysis-only, zero src/js):**
   read hierarchy.js trust dynamics (gains, drains, leader-death effects,
   concession size) + r43/r44 85003 trust evidence. Verdict rule: ANSWERED
   iff the analysis names specific mechanisms + numbers that could lift a
   covenant to trust 40 AND hold it through a leader death (or shows, with
   numbers, that no existing mechanism can — in which case the answer is
   "no existing lever holds it" plus the smallest named gap). A vague
   "tend more" is NOT an answer.

## People check (binding)
Read one full pilot transcript in full (not byte-identity assumed): the
85001 day-90 or day-120 talk, whichever the pilot produces. Sense-test per
the conversation quality bar: NPC wants something, options engage/deflect,
endings resolve/plant/owe; no fabricated shared history, no filler loops.

## Policies / seeds
- Pilot: 85001 (r44 driver, then r45 driver as control).
- Instrument validation: 85003 (r45 driver).
- Policy: scripts/policies/scalecourt-nogate.js UNCHANGED. DAYCAP 180.
- EVIDIR: evidence/2026-10-27/journey-scale-r45 (never the live r43/r44 dirs).

## Metric review (placeholder — filled at closeout, never mid-run)
- (to be filled: did SCALEGATE-PARITY / BETRAY-INSTRUMENT / TRUST-HOLD hold
  as pre-registered, and is the telemetry-check step still shape-mismatched?)
