# journey-scale r94 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-04T00:00CST (scheduled 23:45 CST 2026-11-03).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays).
**Base:** master@fa33fc89c at branch creation (worktree journey-scale).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run. Seasoned bar (30 days + trust 40) UNTOUCHED.
**Perception law (2026-10-28) stands** — all instruments read-only;
pickers press offered menu items only; the tend-arm presses the offered
Haven-panel tendLink verb only, as a player would. The trust-setter
instrument (r39, already in the r93 driver) logs trust assignments via
an accessor; it changes no value and no engine input.

## Standing context (read before scoring)
- r93 (2026-11-03 evening, base d86c1854a, seeds 85201–85204, tend-arm
  ON): national 0/4, lesser seat waiting on 3/4, villages scattered
  hungry (3/4) or died out (1/4). Sharpest finding: seed 85203's
  Stonebridge covenant fell 30 → 14 across five "Conceded better
  terms; the league holds (trust +8)" lines. r93 named the follow-up:
  a per-day trust-delta decomposition BEFORE any wording or number
  change, and proposed this run's metric: seasoned-peer count AND
  scatter-day gap per seed.
- r93's own trustset trace (read during this run's setup, before any
  scored seed ran) already hints the answer for Stonebridge: d67
  crisis charge −10 (covenantCrisis, leader-death trigger) the same
  day as the +8 concede, then repeated crisis cycles netting −2 each
  (d75, d77, d88, d94), plus titan −5 (d71, d86), plus weekly +1 ticks.
  Pool shortfall −4 does NOT appear for this link (poolLive=false in
  the daily series), so r93's pool-drain inference for Stonebridge is
  suspect. This run must confirm or correct that hint on a fresh quad
  and across all r93 seeds, not just assert it from one link.

## Leg question (binding)
**Q1 — COVENANT TRUST DECOMPOSITION (fresh quad + r93 re-analysis):**
for every covenant link on every seed, account for every point of
trust change by writer (crisis charge, concede gain, titan strike,
pool shortfall, weekly tick, aid, renegotiation, other). Two parts:
(a) a trustset analyzer (new script) run over r93's captured
trustset traces for all four seeds; (b) a fresh quad, seeds
85301–85304, r93 driver clone (labels/seeds/EVIDIR only), policy
scalecourt-nogate, WANT_SUBJECT=1, GOSSIP_FIRST=0 (unforced),
TEND_PEER=1, DAYCAP 180, death-aware stop (+10d tail max).
Pilot-first: seed 85301 runs first; if it CRASHES, STOP and report.
Report per seed: census (end, day, pop, pantry, rank, seat, arc,
maxWave, tends landed, peer trusts at end, seasoned peer count,
scatter-day gap = days between scatter/death and the nearest peer's
seasoning date, or "no peer within 30d of seasoning").
Interesting-finding threshold: the decomposition is a FINDING if, on
the fresh quad, conceded-crisis cycles net −2 (charge −10, concede
+8) on ≥2 covenant links AND the crisis charge is confirmed unsaid
in the quad's capture (crisis announcements carrying no amount)
— that combination justifies the wording fix below and retires the
"unexplained bleed" question. It is a NO-GO for the wording fix if
the fresh quad shows the charge IS said somewhere, or if crisis
cycles do not reproduce.
**Q2 — PEOPLE CHECK:** read full transcripts/behavior for the scale
band (unforced): do villagers act like people in courtship, tending,
and scale beats — wants engaged or deflected with reason, endings
that resolve/plant/owe, no fabricated shared history, no filler loops.
Judge REACHABLE / FUN / WINNABLE for the leg in plain words.

## Blank to fill if Q1 confirms (deliver, not just measure)
If the −10 crisis charge is confirmed unsaid while the +8 concede is
said, fix the WORDING ONLY in hierarchy.js covenantCrisis say lines:
name the −10 charge ("(Trust −10.)", matching the HOLD path's existing
"(Trust -10.)" copy). No number, threshold, or gate changes. Proof
test: a covenantCrisis → answerCovenantCrisis('concede') fixture
asserting the crisis announcement names −10 and the concede names +8,
and net trust −2 across the cycle. If Q1 does NOT confirm, document
and do not touch the copy.

## Metric review (carried, §14)
- r93's metric (seasoned-peer count AND scatter-day gap) is ADOPTED
  for this run, per r93's proposal. National count is reported
  alongside but is not the judge: r93 showed national-0/4 hides three
  different failures.
- The r93 analyzer console "tended=" field is the LEAD-tend counter,
  not the peer count — cite censusTendPeer / capture "Haven sends"
  lines for peer tends (r93 metric-review catch, carried).
- The r93 analyzer seed-list catch is carried: cloned analyzers must
  grep the seed list, not just the header.
- Telemetry check at closeout vs telemetry-baselines/scale.json on
  this run's trust JSONs; LOUD lines investigated before any baseline
  roll, and the baseline is NOT rolled forward on a shape-change
  finding (r93 precedent).
