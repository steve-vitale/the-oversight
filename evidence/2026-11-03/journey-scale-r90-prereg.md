# journey-scale r90 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-03T02:45CST (scheduled 02:45 CST 2026-11-03).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@8d4b6c17b at branch creation.
**No src/js or src/data change planned at pre-register time.** Tooling is the
r73 driver/analyzer clone (labels/seeds/EVIDIR only) PLUS one read-only daily
instrument (fusionWatch, see Q2) — verified by diff: no other driver line
changes. Evidence + run note only, unless a fix gate below is met.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work; all instruments
read-only; the pickers only press offered menu items, never engine state.
**DELIVER OVER MEASURE (2026-11-01):** Q1 continuity is report-only; Q2
executes the queued r70 follow-up (fusionReactorOnline days 60–120 trace)
instead of re-scoring the already-proven scale shape (lesser waits, full
unwon, wave 5 unfought — r66–r73).

## Standing context (read before scoring)
- r70–r73 bands: lesser seat common (priced/waiting/announced, never sat),
  full seat 0/4 every band, wave 5 reached 0/4 every band, national 0–1/4.
  The climb machinery still fires (courts, covenants, pilgrimages, lesser
  seats waiting).
- r71 CLOSED the accept-then-abort class: the abort line is the SICK veto
  (betrayal.js, inviter feverish, `hist.accepted` banked before the check).
  Explained behavior, not a defect — not re-litigated here.
- Pellet rule reproduced r70–r72: the pellet blocks NEW bearer feasts, it
  does not erase banked deeds; beat states matched deed states in r71/r72.
  The r70 anomaly still unnamed: 85042 installed day 18, feasts refused
  days 21–65, yet a day-118 feast granted FEASTED ×2.03 with no refusal.
  Online-ness is NOT simply "installed forever" — but no run has named
  what changes it. The fusionReactorOnline days 60–120 trace has stayed
  queued through r71/r72/r73. This run executes it.
- Canon (read): docs/CANON.md, docs/SCALE.md (national = one primary with
  ≥3 seasoned subordinates, or BELONG/COVENANT/TRADE/CONQUEST/REFUSE roads;
  one rung per season; national before ~day 60 effectively impossible),
  docs/TABLE.md (full seat requires national standing — deedGateReady
  enforces scale in ok). Mechanism under trace (src/js/game.js):
  `fusionReactorOnline()` = installed AND online !== false AND
  `hasAbility(sch, 'fusion_reactor')` — so a flip can come from the
  online flag, the ability, or the scholar, not just the install.

## Leg questions (binding)
1. **SCALE CONTINUITY (report-only):** fresh quad 85081–85084, r73
   instrument clone + fusionWatch, policy scalecourt-nogate,
   WANT_SUBJECT=1, GOSSIP_FIRST=1, DAYCAP 180, death-aware stop (+10d
   tail max). Report: census per seed (end, day, pop, pantry, rank,
   seat, arc, maxWave, pilgrimages), table-approach notes, duty counts.
   Judge REACHABLE / FUN / WINNABLE for the leg in plain words. No
   threshold is scored here, so no gate can be gamed; the verdicts are
   the report.
   PILOT GATE: seed 85081 runs first; if it crashes or pilgrimages == 0,
   STOP and report.
2. **FUSION TRACE (new work — the queued r70 follow-up):**
   (a) QUAD TRACK: the r90 driver carries a read-only daily fusionWatch
   row (day, scholarVid, fusionReactor {installed, online flag,
   sinceDay}, fusionReactorOnline() value, hasAbility fusion_reactor,
   fusionReactorHolder, abilities held) plus day-attributed feast lines
   from capture (FEASTED grants, reactor-refusal lines). For every quad
   seed that installs a pellet, report: install day, every online()
   flip with its cause read from the snapshot fields, and every feast
   grant/refusal with that day's online() value.
   (b) TARGETED TRACK: re-run r70 seed 85042 with the r90 driver
   (instrument-only delta vs r70; read-only instruments cannot change
   trajectory — verify landmarks: pellet install day 18, feast
   refusals days 21–65, day-118 FEASTED grant; if landmarks move,
   report the move, do not force-fit). Trace fusionReactorOnline()
   daily days 1–180, emphasis days 60–120, and NAME THE TRANSITION
   that flips it. Candidate mechanisms are hypotheses to confirm from
   the fields, not assumptions: scholar change/succession losing the
   ability, ability removal, online-flag flip, holder change.
   DELIVERABLE: a named transition, OR a proven "no flip — the grant
   came from a different path" with the evidence. A feast granted
   while online() reads true would overturn the ceiling reading and
   must be reported as such, not smoothed over.
   FIX GATE — land a code change ONLY if ALL hold: (a) the trace finds
   a senseless defect (dead end, unfireable beat, contradictory
   numbers), not a tuned bar or a fair loss; (b) a runnable
   before/after proof test exists in scripts/test-*.js; (c) the
   relevant existing suite stays green. Otherwise document the
   transition and move on.
3. **PEOPLE CHECK (sense law — all transcripts read in full):**
   Transcripts days 90 and 120 (2 per seed where the seed lives that
   long; narrowness named, per the r73 lesson — no day-60 substitution
   mid-run; that proposal stays a proposal for the NEXT run's prereg).
   Judge meaning, coherence, relevance, consequences — never just
   exchange counts. No fabricated shared history, no filler loops,
   no static menus.
4. **DUTY COUNTS (report-only continuity):** weapon-craft lines +
   deadfall-duty lines per capture; wsplit eligible/attempt counts
   from the analyzer. r73 was the twelfth consecutive 0/4 band for
   both duty lines; this band continues the count, it does not
   re-argue the armed-gate classification.

## Metric review
- (Filled at closeout. Pre-registered metrics bind this run; a miss is
  NO-GO, never re-scored against a friendlier metric mid-run.)
