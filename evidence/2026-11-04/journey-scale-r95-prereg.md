# journey-scale r95 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-04T03:45CST (scheduled 03:45 CST 2026-11-04).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3 — the rotation file
was briefly advanced at run start and restored to 3 before any scored
seed ran, so a stopped run retries scale next time).
**Base:** master@2106108b8 at branch creation (worktree journey-scale).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run. Seasoned bar (30 days + trust 40) UNTOUCHED.
**Perception law (2026-10-28) stands** — all instruments read-only;
pickers press offered menu items only; the tend-arm presses the offered
Haven-panel tendLink verb only, as a player would.
**DELIVER OVER MEASURE (2026-11-01):** this run does NOT re-prove the
hunger-scatter shape (r93/r94: 4/4 and 3/4+1 hunger/died ends) or the
crisis-cycle mechanism (r94, solved). It verifies r94's landed wording
fix in live play (Q1) and diagnoses the r90-named pilgrimage thin spot
(Q2) — both new information, neither a re-score.

## Standing context (read before scoring)
- r94 (2026-11-04 early hours, base fa33fc89c, seeds 85301–85304):
  national 0/4, lesser waiting 2/4, 4/4 hunger scatter. Covenant-trust
  decomposition SOLVED r93's "unexplained bleed": conceded-crisis cycles
  net −2 each (charge −10, concede +8), 9 cycles × 2 links on 85301,
  leader deaths the trigger there; pool-drain inference REFUTED.
  Blank filled: hierarchy.js covenantCrisis announcements + council-book
  note now name the −10 (wording only, proof 17/17). That fix is IN
  this run's base (hierarchy.js lines 3616–3620 carry "(Trust -10.)").
  Carried design question (Steve's call, freeze stands): whether a
  conceded crisis should cost −2 / strain crises should pause while a
  link is tended — NOT retuned here.
- r91 landed the r90 mantle-pass reactor voicing ("The warm hum behind
  your ribs is gone...") — the r90 proposal is DONE, not this run's
  blank. Verified present in this base (ledger.js playerDeath).
- r90 (pilot 85081): 4 peer proposals made, ZERO pilgrimages completed
  under a 63-day poor court. The proposals fired, the completions
  didn't — named thin spot, never diagnosed per-trip.
- r93/r94 metric (adopted): seasoned-peer count AND scatter-day gap
  per seed; national count reported alongside, not the judge.
- Canon (read): docs/CANON.md (manifest; no-silent-actions law),
  docs/SCALE.md (national = one primary with ≥3 seasoned subordinates,
  or BELONG/COVENANT/TRADE/CONQUEST/REFUSE roads; one rung per season;
  national before ~day 60 effectively impossible), docs/TABLE.md (full
  seat requires national standing — deedGateReady enforces scale in ok).

## Tooling
r94 driver/analyzer clones, labels/seeds/EVIDIR only, verified by diff:
no other driver line changes (60 diff lines, all seed/label
substitutions; analyzer seed list verified at line 197:
[85401, 85402, 85403, 85404]). New: no new instrument — Q2 reads the
existing daily hungerwatch rows (pilgrim vid, returning, pilg count,
studies, propPeer, courtPoorDays, pantry, hungryDays) plus capture
lines. Scripts: scripts/journey-scale-r95-20261104.js,
scripts/analyze-journey-scale-r95-20261104.js.
Policy scalecourt-nogate, WANT_SUBJECT=1, GOSSIP_FIRST=0 (unforced),
TEND_PEER=1 (pantry guard > 12,000 kcal), DAYCAP 180, death-aware stop
(+10d tail max). Seeds 85401–85404.
Pilot-first: seed 85401 runs first; if it CRASHES, STOP and report.
(No pilgrimage pilot gate this run: pilgrimage completion IS Q2's
question, so gating on it would beg it.)

## Leg questions (binding)
1. **Q1 — R94 COPY FIX IN LIVE PLAY (verification):** scan the quad's
   captures for covenant-crisis announcements (leader-death, speaker-
   death, strain variants) and count how many name the −10 charge.
   FINDING if ≥1 crisis announcement fires AND 100% of crisis
   announcements name −10 (the code appends it to all three variants;
   HOLD already named it). INCONCLUSIVE, not a failure, if zero crises
   fire (r93/r94 fired 22/20, so zero would itself be notable and
   reported). A crisis announcement WITHOUT the −10 on this base is a
   NO-GO for the fix claim and a same-run investigation item.
2. **Q2 — PILGRIMAGE TRIP LEDGER (new diagnostic):** for every seed,
   reconstruct every pilgrimage trip from the daily hungerwatch rows:
   trip start (a pilgrim vid appears), trip end (pilgrim clears), and
   whether studies/pilg incremented across it (completed) or not
   (dropped). For each dropped trip, record the state at drop: pantry,
   hungryDays, courtPoorDays, whether the village scattered/died
   within 10 days after. Report per seed: trips started, completed,
   dropped, and the blocker class per dropped trip (scatter-first,
   hunger-interrupt, other — named from the rows, not guessed).
   No threshold scored: the deliverable is the blocker distribution.
   Interesting if dropped trips cluster on one class; a finding either
   way retires the r90 thin spot from "unexplained" to "named".
3. **Q3 — PEOPLE CHECK (sense law):** transcripts days 90 and 120
   (2 per seed where the seed lives that long; a seed dead before a
   date contributes nothing for that date — no day substitution
   mid-run). Judge meaning, coherence, relevance, consequences —
   never just exchange counts. No fabricated shared history, no
   filler loops, no static menus.
4. **Q4 — CENSUS CONTINUITY (report-only):** per seed: end, day, pop,
   pantry, rank, seat, arc, maxWave, tends landed, peer trusts at end,
   seasoned peer count, scatter-day gap (days between scatter/death
   and the nearest peer's seasoning date, or "no peer within 30d of
   seasoning"). Judge REACHABLE / FUN / WINNABLE for the leg in plain
   words.

## Blank to fill if a gate below is met
Fix-gate (same as r90/r94): land a code change ONLY if ALL hold:
(a) the run finds a senseless defect (dead end, unfireable beat,
contradictory words/numbers, a silence the no-silent-actions law
forbids) — not a tuned bar or a fair loss; (b) a runnable
before/after proof test exists in scripts/test-*.js; (c) the relevant
existing suite stays green. Wording-only fixes count under the same
gate. Otherwise document and move on. The r94 design question (crisis
cycle net −2) does NOT meet (a) — it is a tuned loop under freeze.

## Metric review
- (Filled at closeout. Pre-registered metrics bind this run; a miss is
  NO-GO, never re-scored against a friendlier metric mid-run.)
