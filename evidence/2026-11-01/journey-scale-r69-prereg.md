# journey-scale r69 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-01T18:45CST (scheduled 18:45 CST 2026-11-01).
Rotation read 3 → leg 3 SCALE; write 3→0 at run start (body rule; r68
already closed 3→0 at its closeout, and the file read 3 again at this
run's start, so this run re-plays scale and re-writes 0 — queue
position is scale either way, and the write is verified by read-back
below).
**Base:** master@9b310a82c at branch creation.
**No src/js or src/data change planned at pre-register time.** A change
to scripts/test-capable-bot-20261014.js may land ONLY under the Q2 fix
gate below, with its own proof (the single test file, green before and
after except the gated assertion). Otherwise measurement only.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work; all
instruments are read-only, and the gossip-forcing picker changes only
which offered menu item the driver presses, never engine state.

## Standing context (read before scoring)
- r68 (quad 85021–85024, gossip-forced): gossip-fallback fix gate
  CLOSED — 0 fallback pairs despite multi-beat gossip exposure; the
  r66 Henrique instance stands as a single-instance blemish. Betrayal
  accept path proven real on 3 fresh instances. Weapon-craft lines
  0/4 and deadfall-duty lines 0/4 — the EIGHTH consecutive 0/4 for
  both; armed-gate classification reproduces (every knower-day
  armed, eligible population structurally ~empty on the competent
  scalecourt path). Lesser seat 2/4, full seat 0/4, wave 5 0/4,
  national 2/4. Barrier pin guard confirmed working (r55 form).
- r67 fix in this run's base: convoPick quote-normalized dedupe
  (Deon goal-opener repeat fixed); r68 band shows no recurrence.
- Carried, still unre-tested (NOT re-scored here unless evidence
  arises): Olivia post-accept aphorism loop as an Olivia instance;
  r65 bank-trace finding; r63 mantle-pass proof; r58
  Irving-displacement, subject-menu, Boris nod-loop; r56
  chooseAbility-unguarded note.
- Queued test-maintenance item (r67, restated r68): capable-bot
  section 7 first-use assertion is trajectory-sensitive after the
  r67 dedupe fix (a villager's fight consumes the feast buff before
  the player's first combat use). This run takes it as Q2.

## Leg questions (binding)
1. **SCALE CONTINUITY (report-only + verdicts):** fresh quad on the
   r68 instrument (labels/seeds/EVIDIR only,
   scripts/journey-scale-r69-20261101.js, GOSSIP_FIRST=1 kept so
   transcripts carry gossip threads as in r68), policy
   scalecourt-nogate, DAYCAP 180, death-aware stop (+10d tail max).
   Report: census per seed (end, day, pop, pantry, rank, seat, arc,
   maxWave, pilgrimages), table-approach notes, duty counts
   (weapon-craft lines, deadfall-duty lines, wsplit classes),
   barrier-pin lines. Judge REACHABLE / FUN / WINNABLE for the leg
   in plain words. No threshold is scored here, so no gate can be
   gamed; the verdicts are the report.
   PILOT GATE: seed 85031 runs first; if it crashes or
   pilgrimages == 0, STOP and report.
2. **CAPABLE-BOT SECTION 7 FIX GATE (diagnostic + fix-if-gated):**
   Instrument: scripts/test-capable-bot-20261014.js section 7 only.
   Diagnose first: run the single file, capture the `uses` array
   the failing assertion prints, and establish exactly who consumes
   the feast buff first and what feastSurgeBy records.
   Fix gate — land a change ONLY if it meets ALL of these:
   (a) the full single file passes (all sections, not just 7);
   (b) the deed assertion stays STRICT: the food deed must be shown
   earned by the PLAYER's own combat use (source 'p', first use
   with before=false), not merely present at section end;
   (c) the fix is a re-seed of section 7's fixture trajectory OR an
   order-tolerant form that still proves (b) — never a loosened
   assertion (e.g. "deed earned by anyone" or "deed present") and
   never a revert of the r67 dedupe fix.
   If neither form preserves (b), the item stays HELD with the
   diagnosis documented, and no test change lands. The r67
   adjudication (deed mechanism intact, fixture sensitivity) is
   the null to beat, not an assumption.
3. **PEOPLE CHECK (sense law):** read every r69 transcript in full.
   Conversations must have meaning: the NPC wants something,
   options engage or deflect it, endings resolve/plant/owe. No
   fabricated shared history, no filler loops, no static menus.
   Report per-transcript verdicts; any repeat class found is
   named, not averaged away.

## Metrics (bound; §14)
Census scalars unchanged from r51's list (19 scalars + covenant
trusts), plus fusion/ability columns (reads, not scores), the r61
end-state class, weapon-craft-line and deadfall-duty-line counts,
and gossip-exposure counts (ask:gossip picks, gossip THEM lines,
sittings) from the r69 analyzer (r68 analyzer, labels/seeds only).
No metric is re-scored mid-run; doubts go under "metric review".

## Telemetry deviation check (step 14)
After writing evidence, run telemetry-check.js against the scale
baseline with this run's per-seed trust JSONs. Any LOUD line is a
same-run investigation item BEFORE any baseline roll. The baseline
is NOT rolled on this run's numbers by default (r68's decision
stands: the baseline sums a different band's fates).
