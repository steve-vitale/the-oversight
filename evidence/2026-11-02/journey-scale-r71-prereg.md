# journey-scale r71 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-02T06:45CST (scheduled 06:45 CST 2026-11-02).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@95ca9266d at branch creation (journey-deepening r85 tip).
**No src/js or src/data change planned at pre-register time.** Tooling is the
r70 driver/analyzer with labels/seeds/EVIDIR only (diff verified: no
non-label line) + the r67 gossip analyzer reused unchanged. Evidence + run
note only, unless a fix gate below is met.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work; all instruments
read-only; the pickers only press offered menu items, never engine state.
**DELIVER OVER MEASURE (2026-11-01):** this run does not re-score the
already-proven scale shape (lesser waits, full unwon, wave 5 unfought —
r66–r70). Q1/Q2 are the new work; Q3 is continuity reporting only.

## Standing context (read before scoring)
- r67: convoPick quote-normalized dedupe fix landed (Deon goal repeat);
  gossip fallback gate did NOT open (0 gossip sittings — no exposure).
- r68: GOSSIP_FIRST forcing was a no-op — want-driven sittings never visit
  the topic menu (menu routing, proven); prescription queued: SUBJECT_FIRST
  arm (driver already supports WANT_SUBJECT=1: dlg:subject at turn 0).
- r70: GOSSIP_FIRST pressed gossip in only 2 of 8 sittings; offer, not
  picker, is the bottleneck. Accept-then-abort class CONFIRMED (r69 Brian +
  r70 Franz): invitation ACCEPTED, then a vague abort in the same sitting,
  player keeps nothing. Fix proposal deferred to this run.
- Canon (read): docs/CANON.md, docs/SCALE.md, docs/TABLE.md (see r70 prereg
  for the bars); docs/CONVERSATIONS.md covers dialogue/gossip.

## Leg questions (binding)
1. **SUBJECT_FIRST GOSSIP EXPOSURE (new work):** fresh quad 85051–85054,
   r71 driver (r70 clone), policy scalecourt-nogate, WANT_SUBJECT=1 +
   GOSSIP_FIRST=1, DAYCAP 180, death-aware stop (+10d tail max). Run the
   r67 gossip analyzer over all transcripts. Verdict rules, applied as
   written:
   - ≥1 FALLBACK pair → fix gate OPENS: land the sitting-level fallback
     dedupe fix + fixture proof test this run (proof RED→GREEN, targeted
     suite green), then a post-fix control is report-only, never a re-score.
   - ≥1 ask:gossip pick and 0 fallback pairs → non-reproduction WITH
     exposure; Henrique (r66) stands as a single instance; gate closed.
   - 0 ask:gossip picks → subject arm failed too; report the routing cause
     from the turn0-choices logs; gate closed, no clean bill claimed.
   PILOT GATE: seed 85051 runs first; if it crashes or pilgrimages == 0,
   STOP and report.
2. **ACCEPT-THEN-ABORT MECHANISM (new work, fix only if the gate is met):**
   scan the quad's transcripts/captures for invitation-accept followed by
   an abort/downbeat in the same sitting. If an instance fires, read the
   abort code path and name the cause it consults (tracked state? a fixed
   line? nothing?). FIX GATE — land a code change ONLY if ALL hold:
   (a) the abort is senseless as written (a generic line that eats a yes
   regardless of tracked tired/hurt/afraid state, or an accept that banks
   nothing by construction); (b) a runnable before/after proof test exists
   in scripts/test-*.js; (c) the relevant existing suite stays green.
   Otherwise document the mechanism and move on — the class stays a
   proposal, not a fix.
3. **SCALE CONTINUITY + PEOPLE CHECK (report-only):** census per seed
   (end, day, pop, pantry, rank, seat, arc, maxWave, pilgrimages),
   table-approach notes, duty counts, barrier-pin lines, pellet-beat
   firing per seed (report-only; the fusionReactorOnline trace stays a
   queued follow-up unless the mechanism reads trivially off the beats).
   Read ALL transcripts in full (sense law): meaning, coherence,
   relevance, consequences — never just exchange counts. Judge
   REACHABLE / FUN / WINNABLE for the leg in plain words. No threshold
   is scored here.

## Metric review
- (Filled at closeout. Pre-registered metrics bind this run; a miss is
  NO-GO, never re-scored against a friendlier metric mid-run.)
