# journey-scale r96 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-04T07:45CST (scheduled 07:45 CST 2026-11-04).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** master@62a67de7d at branch creation (worktree journey-scale).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run. Seasoned bar (30 days + trust 40) UNTOUCHED.
**Perception law (2026-10-28) stands** — all instruments read-only;
pickers press offered menu items only; the tend-arm presses the offered
Haven-panel tendLink verb only, as a player would.
**DELIVER OVER MEASURE (2026-11-01):** this run does NOT re-prove r95's
verdicts (crisis −10 naming 57/57; pilgrimages complete 9/21; national
staged-and-lost on 85403). It closes r95's two carried open questions
with new instruments (Q1, Q2) and keeps the people check + census
continuity (Q3, Q4).

## Standing context (read before scoring)
- r95 (2026-11-04 morning, base 2106108b8, seeds 85401–85404):
  regional 4/4; national STAGED 1/4 (85403 covenant, twice) and LOST
  twice; 0/4 held national at end; 0/4 global; 1/4 lesser waiting.
  Crisis −10 naming verified 57/57 in live play. Pilgrimage ledger:
  21 started / 9 completed / 10 dropped / 2 in progress; drops wear
  the 15-day stale-restart signature (85404 village_2 restarts days
  29→44→59→74→90; studies frozen at 1; opinion frozen at 0).
  Mechanism read (policy code, not inference): the study check reads
  the player's position BEFORE the walk each courtship day (dist ≤ 2
  → study; else walkTo up to 10 steps and return); a trip completes
  only if the player is already within 2 tiles at courtship time.
  Open micro-question carried: why the player's position doesn't
  persist at courtship time (bot's other daily movement the obvious
  candidate, not proven). Distances do NOT explain it (final
  villageWatch distances 2–6 tiles).
- Policy order (verified in code this run): scalecourt-nogate daily =
  competent.daily FIRST, then courtship. So the position the study
  check reads is wherever competent.daily's routine left the player —
  NOT where yesterday's courtship walk left them. That ordering is
  Q1's prime suspect, to be confirmed or refuted by trace, not assumed.
- r93/r94 metric (adopted): seasoned-peer count AND scatter-day gap
  per seed; national count reported alongside, not the judge.
- Canon (read): docs/CANON.md (no-silent-actions law), docs/SCALE.md
  (national = one primary with ≥3 seasoned subordinates, or
  BELONG/COVENANT/TRADE/CONQUEST/REFUSE roads; one rung per season;
  national before ~day 60 effectively impossible; a realm that
  dissolves before its beat's answer dies ALOUD), docs/TABLE.md.

## Tooling
r95 driver/analyzer clones, labels/seeds/EVIDIR only, verified by diff,
PLUS one new read-only instrument:
- **posTrace (Q1):** a policy-clone instrument, NOT game code:
  scripts/policies/scalecourt-nogate-postrace.js = scalecourt-nogate.js
  with logging-only pushes into ctx.posTrace inside the pilgrimage
  branch (eval / study / walk / drop rows: day, vid, player pos,
  target pos, Manhattan dist, drop reason). No behavior line changes;
  diff verified to contain only added logging lines + the export name.
  The r96 driver copies ctx.posTrace into journey-scale-r96-postrace
  rows daily and writes journey-scale-r96-postrace-<seed>.txt at end.
  The standing scalecourt-nogate.js policy is untouched; the clone is
  this run's instrument only.
- **National-transition read (Q2):** existing wantwatch daily
  scaleRank + capture national-beat lines + ctx.courtNational count;
  the r96 analyzer extracts rank transitions and beat stagings.
  No new instrument needed.
Scripts: scripts/journey-scale-r96-20261104.js,
scripts/policies/scalecourt-nogate-postrace.js,
scripts/analyze-journey-scale-r96-20261104.js.
Policy (instrument): scalecourt-nogate-postrace (behavior = nogate).
WANT_SUBJECT=1, GOSSIP_FIRST=0 (unforced), TEND_PEER=1, DAYCAP 180,
death-aware stop (+10d tail max). Seeds 85501–85504 (fresh band).
Pilot-first: seed 85501 runs first; if it CRASHES, STOP and report.

## Leg questions (binding)
1. **Q1 — PILGRIMAGE POSITION TRACE (closes r95's micro-question):**
   For every pilgrimage trip on every seed, report the courtship-day
   eval rows: player pos at the study check, target pos, dist, and
   outcome (study / walk / drop + reason). FINDING if the trace
   shows the mechanism: e.g. eval dist > 2 on ≥80% of courtship days
   for dropped trips while walk rows end within 2 tiles (walk works,
   but the next day's competent.daily moves the player away before
   courtship — position does not persist across the daily routine).
   ALTERNATIVE FINDING if eval rows show the player already within
   2 tiles yet no study fires (check reads something else — a
   same-run investigation item, not a guess). INCONCLUSIVE if fewer
   than 3 dropped trips occur on the band (nothing to explain).
   The deliverable is the classified cause per dropped trip; no
   game-code change follows from the trace alone (policy instrument
   + shipped study mechanic both already proven working).
2. **Q2 — NATIONAL AFTER DISSOLUTION (new diagnostic):** on every
   seed, extract the scaleRank timeline (wantwatch) and every
   national-beat staging + answer (capture + courtNational count).
   Report: stages, answers given, rank transitions national→regional
   (dissolutions), and whether a dissolved realm re-stages a beat
   within 30 days of dissolution, with the staging/answer lines
   quoted. Interesting if a realm re-stages and is answered again
   (the climb restarts in play) OR if no re-stage ever follows a
   dissolution (the beat dies and never returns — check against the
   canon "dies aloud" rule: was the dissolution itself voiced?).
   No threshold scored: the deliverable is the stage/answer/
   dissolve/re-stage timeline per seed.
3. **Q3 — PEOPLE CHECK (sense law):** transcripts days 90 and 120
   (2 per seed where the seed lives that long; a seed dead before a
   date contributes nothing for that date — no day substitution
   mid-run). Judge meaning, coherence, relevance, consequences —
   never just exchange counts. No fabricated shared history, no
   filler loops, no static menus.
4. **Q4 — CENSUS CONTINUITY (report-only):** per seed: end, day, pop,
   pantry, rank, seat, arc, tends landed, peer trusts at end,
   seasoned peer count, scatter-day gap (days between scatter/death
   and the nearest peer's seasoning date, or "no peer within 30d of
   seasoning"). Judge REACHABLE / FUN / WINNABLE for the leg in plain
   words.

## Blank to fill if a gate below is met
Fix-gate (same as r90/r94/r95): land a code change ONLY if ALL hold:
(a) the run finds a senseless defect (dead end, unfireable beat,
contradictory words/numbers, a silence the no-silent-actions law
forbids) — not a tuned bar or a fair loss; (b) a runnable
before/after proof test exists in scripts/test-*.js; (c) the relevant
existing suite stays green. Wording-only fixes count under the same
gate. Otherwise document and move on. Q1's trace and Q2's timeline
are diagnostics; neither alone meets (a).

## Metric review
- (Filled at closeout. Pre-registered metrics bind this run; a miss is
  NO-GO, never re-scored against a friendlier metric mid-run.)
