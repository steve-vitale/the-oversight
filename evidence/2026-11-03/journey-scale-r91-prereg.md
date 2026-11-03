# journey-scale r91 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-03T07:45CST (scheduled 07:45 CST 2026-11-03).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success (the run
completes its play + verdicts; a pilot-gate stop is not success, so the
rotation stays — as r90 showed).
**Base:** master@6fb93c5c4bdf8be613f7373d26d080df068e83a9 at branch creation.
**Gating freeze (2026-10-27 16:53) stands** — no threshold changes.
**Perception law (2026-10-28) stands** — all instruments read-only; the
pickers only press offered menu items, never engine state.
**DELIVER OVER MEASURE (2026-11-01):** Q2 lands the carried r90 proposal
(mantle-pass reactor voicing) if its fix gate holds; Q1 is a fresh
continuity quad, not a re-score of r90's pilot-gate outcome.

## Standing context (read before scoring)
- r90 (same day, earlier): pilot 85081 ONLY — its pilot gate STOPPED the
  quad on pilgrimages == 0. Five links, national one covenant tending
  short (third covenant peer trust 34 vs seasoned 40), lesser blocked on
  food deeds, pellet installed d103, bearer died d115, reactor darkened
  SILENTLY at succession. Mechanism proven: mantleBecome replaces
  abilities with the successor's own; the world's installed flag stays
  set, so no second reactor rises — but nothing tells the new bearer
  the hum died with the old one, while the install line promised "It
  does not come out" / "You will never be hungry again."
- r66–r73 bands: lesser seat common (priced/waiting/announced, never
  sat), full seat 0, wave 5 reached 0, national 0–1/4.
- Standing direction 2026-11-03 (intelligence plays to win + world
  participation, folded into the winnability push): villagers themselves
  executing a gameplan (party up, gear-check, bank veterans, build
  standing), drive-first, reached only through perception. This run's
  census reads as evidence on the standing drive — do links get tended
  and roads walked without the bot pressing? — reported, not scored.

## Leg questions (binding)
1. **SCALE CONTINUITY (fresh quad):** seeds 85091–85094, r90 instrument
   clone + fusionWatch, policy scalecourt-nogate, WANT_SUBJECT=1,
   GOSSIP_FIRST=1, DAYCAP 180, death-aware stop (+10d tail max).
   Pilot-first: seed 85091 runs first; if it CRASHES, STOP and report.
   Pilgrimages == 0 does NOT stop this quad — r90 already answered
   that gate outcome for its band; this run's question is the
   proposal→completion funnel and the voiced fix, so a zero-pilgrimage
   pilot expands, not stops. (Stated here, before any seed runs, so
   it is not a mid-run re-score.)
   Report per seed: census (end, day, pop, pantry, rank, seat, arc,
   maxWave, pilgrimages proposed/completed, courtPoorDays),
   table-approach notes, duty counts. Judge REACHABLE / FUN /
   WINNABLE for the leg in plain words.
   Interesting-finding threshold: any seed reaching national; any
   completed pilgrimage with its funnel (proposed→completed under
   what court state); any pellet install + succession with the
   voicing line present/absent.
2. **MANTLE-PASS REACTOR VOICING (delivery, carried from r90):** when
   the mantle passes from a fusion_reactor bearer to a successor who
   does not hold it while the pellet stays installed, say aloud that
   the hum died with the bearer and hunger is back. Narration ONLY —
   no state, number, gate, or threshold change; the mechanism
   (ability per-bearer, flag per-world, no second reactor) is
   untouched. Hook: ledger.js playerDeath, immediately after the
   mantleBecome try/catch, guarded by had-reactor-before AND
   installed AND NOT-has-reactor-after.
   FIX GATE — land ONLY if ALL hold: (a) proof test
   scripts/test-mantle-reactor-voice-r91-20261103.js is RED on base
   and GREEN with the fix (main scenario: bearer holds reactor +
   installed, successor lacks it → line fires, online() false after,
   installed flag still true; second-death control: the next bearer
   lacks it → no second line, exactly one firing); (b) the line
   fires ONLY in the silent-loss case (the successor-holds-it case
   is silent by the !hasNow condition, verified by code inspection
   — a successor holding the world's reactor keeps it as bearer);
   (c) node --check clean + check.js --quick shows no NEW failure
   vs the r90-known 6 pre-existing failures. Otherwise document
   and do not land.
   Panel role: the quad runs on the fixed code; if a panel seed
   installs + successions, its fusionWatch + capture confirm the
   line in a real run — opportunistic confirmation, not the proof
   (the proof test is the proof). If no panel seed installs, say
   so; do not claim panel confirmation.
3. **PEOPLE CHECK (sense law — all transcripts read in full):**
   Transcripts days 90 and 120 (2 per seed where the seed lives that
   long; narrowness named if a seed dies early — no day substitution
   mid-run). Judge meaning, coherence, relevance, consequences —
   never just exchange counts. No fabricated shared history, no
   filler loops, no static menus.
4. **DUTY COUNTS (report-only continuity):** weapon-craft lines +
   deadfall-duty lines per capture; wsplit eligible/attempt counts
   from the analyzer. Continues the r73/r90 zero count; does not
   re-argue the armed-gate classification.

## Metric review
- (Filled at closeout. Pre-registered metrics bind this run; a miss is
  NO-GO, never re-scored against a friendlier metric mid-run.)
