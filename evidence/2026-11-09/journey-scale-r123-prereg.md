# journey-scale r123 — PRE-REGISTER (lane A, leg 3 SCALE, full-band ladder verdict)

**Run id:** laneA-20261109T1445CST (scheduled 14:45 CST 2026-11-09).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `17777346b` (r122-deepening adoption landed).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands.**
**DELIVER OVER MEASURE (2026-11-01):** this run is the owed follow-through
on a landed fix, not a re-proof of a proven constraint: r122 fixed the
pilgrimage walk (Q1 GO on d60 pilot/confirm) and left the ladder outcome
— does the earlier climb move trade proposals / the charter — explicitly
owed to a later run. This run runs that band.

## Standing context (read before scoring)

- **r113 (2026-11-09, band 97901–97904, base 60eb9a5bb): Q1
  WALL-PROPOSE** (charter sealed 0/4; trade proposals 3/2/0/0);
  **Q2 FACES 4/4** (62 villager w4+ field fights); **Q3 OPENS + HOLDS
  4/4** (national d37/d32/d28/d45; lesser priced d46/d103/d36/d43).
  Full seat priced 0/4. Tribute delivered 2/4 — and spends its veterans
  (design question for Steve, NOT this run's to build).
- **r122 (2026-11-09, same band, base 8419eefa4): Q1 PILGRIMAGE WALK
  GO** — 97904 pilot 3 studies (d29/d45/d57), zero stalls ≥5 no-move
  days; 97901 confirm 3 studies (d27/d30/d33), zero stalls. The fix:
  `walkTo` rewrite in `scripts/policies/scalecourt-traderoad-r113.js`
  (on master, commit 4b7c7ad47). The d60 horizon could not judge the
  ladder outcome — trade still 0 proposals by d60 on 97904, national
  unreached at d60 on 97901. **The full 180-day 4-seed band is this
  run's question.**
- Carried, NOT this run's to build: the brittle `walkTo` duplicated in
  ~12 policy files (family-wide shared helper owed); tribute spends
  veterans (Steve design question); trade trust flicker (TEND_PEER
  lever owed); gossip voice-break + raise defects (conversation-engine
  fix owed); sayOncePerFight barrier noise (instrument noise).

## Disclosed delta since r122's base (8419eefa4) — NOT zero src/js

The r123 band runs on `17777346b`; r122's pilot/confirm ran on
`8419eefa4`. Five landed src/js changes sit between them (verified
`git log 8419eefa4..HEAD -- src/js`):

1. `4859f77c7` r122-deepening post-secret follow-up
   (`conversation.js` +47, `convo-dialogue.js` +15) — one
   secret-specific follow-up line per sitting, +1 trust. Conversation
   only; no ladder/walk/combat change.
2. `5e190b6ef` journey-social-life r163 coach prior-deflect no-repeat
   fix — bond-proposal coaching; no ladder/walk change.
3. `48c93b22b` sim-wideduty-a medic duty widened to trained villagers
   — duty-held 61%→88%. **CONFOUND (named):** fewer wound-fever
   deaths could leave more villagers alive on a 180-day horizon and
   move ladder pace. Survival/pop differences vs r113 must be read
   with this in mind; the walkTo fix remains the only change on the
   pilgrimage/ladder path itself.
4. `ae7daf40c` journey-landing r121 curious first-reveal guard —
   first-reveal gating; no ladder/walk change.
5. `1cc46630c` journey-endgame r162 feast tooltip once per keepsake
   (`progression.js` +23) — narration only; no ladder/walk change.
Policy delta is ONLY the r122 walkTo fix
(`scripts/policies/scalecourt-traderoad-r113.js` +78/−17, commit
`4b7c7ad47`). The Q1 before/after is therefore a matched panel with
one lever under test (walkTo) plus the five disclosed landed fixes;
no Q1 verdict may claim a clean single-lever comparison.

## Q1 — THE CHARTER: does the fixed walk move the ladder outcome? (binding)

Same driver stack as r122 (trade-road policy + instruments + delivery
verb, SEATDRIVE=0), DAYCAP=180, matched seeds 97901–97904. Before =
r113's published band; after = this run's band on current master with
the r122 walkTo fix (see disclosed delta above).

- **GO** — charter sealed ≥1/4 seeds.
- **PARTIAL** — charter 0/4 BUT trade proposals meet or beat r113's
  per-seed counts (3/2/0/0) on ≥3 seeds: the climb moved, the charter
  did not seal. Report as moved-not-sealed; the next lever is named,
  not built here.
- **NO-GO** — charter 0/4 AND proposals below r113 on ≥2 seeds: the
  walk fix did not move the ladder outcome at all.
- Guardrail (NO-GO if breached): studies 0 on any seed to d60 (the
  r122 mechanism regressed); any walk teleports; scholar return-home
  walk breaks (`_returning` stuck).
Secondary (report-only): studies per seed + first-study day (r122
metric-review ask: r113 never, r122 d29 on 97904, d27 on 97901),
trips started/completed/stalled, national stage day, lesser priced
day, full-seat priced count, tribute deliveries + veteran spend.

## Q2 — WILD WAVE-4: do villagers still face wave-4 in the wild? (carried)

Bar: ≥1 villager w4+ field fight per seed, total ≥30 across the band
(r113: 62 fights, 4/4). A collapse to 0 on any seed is a regression
item, not a re-score — the fix touches no combat code.

## Q3 — LADDER OPENS + HOLDS (carried)

Bar: national stage reached 4/4, lesser seat priced 4/4 (r113:
national d37/d32/d28/d45; lesser priced d46/d103/d36/d43). Report
per-seed days; a seed missing national is named, not averaged away.

## Q4 — PEOPLE CHECK (sense law)

Transcripts the band produces, read in full (CONVO_DAYS [90, 120]).
Senseless count must be 0 to claim the people check clean. The r113
defects (gossip voice-break, raise echo/brush-off/unvoiced/unanswered)
are CARRIED, not re-litigated — re-counted only if a fix touches
conversation code (none does this run).

## Q5 — CENSUS (plain words)

Village assessment per seed (who lived, what the scholar learned on
the road, what changed vs r113).

## Seed band — MATCHED PANEL, not a fresh band

- **Seeds 97901–97904 (the r112/r113/r122 band), reused as a matched
  before/after panel** (§15): before = r113's published band on the
  r112/r113 policy + r113 base; after = this run's band on the current
  base with the r122 walkTo fix. This is NOT a freshness claim:
  97901–97904 are used, named in the r112/r113/r122 preregs, and must
  never be presented as fresh.
- Freshness re-check (per local_seed_band_freshness): grep ALL dated
  preregs (`evidence/*/sim-*-prereg.md` +
  `evidence/*/journey-*-prereg.md`) for each seed as a whole token —
  the ONLY hits must be the r112/r113/r122 preregs. No forbidden-band
  collision (99201–99208 contaminated band untouched; 97801–97804
  r111, 98000–98099, 97501–97516, 98601–98616, 99001–99016 all
  disjoint).

## Method

- PILOT GATE: 97904 first, DAYCAP=180. Crash, recorder errors > 0, or
  a postrace file with 0 walk rows → STOP, do not score. Pilot gates
  the instruments AND the r122 mechanism on the long horizon: 0
  studies by d60 → STOP (mechanism regressed; NO-GO, no band spend).
- BAND: 97901/97902/97903, DAYCAP=180, one seed per process, same
  EVIDIR. Death-aware stop (+10d tail max).
- Policy: the r113 trade-road stack with the r122 walkTo fix,
  unchanged — frozen in this prereg, do not tune mid-band.
- Driver clone: `scripts/journey-scale-r123-20261109.js` (r122 driver,
  labels/EVIDIR only; policy require unchanged).
- Telemetry: the band regime (4 seeds, DAYCAP=180) matches the
  `scale.json` baseline regime (4 seeds, d129–180, sums 446/289/646).
  Run `node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/scale.json --current
  '<per-seed-evidence-glob>' --metrics
  fightsTotal,fightsByWave.4,maxGameDay` after the band. Any LOUD
  line is a same-run investigation item BEFORE any baseline roll.
- Gate: `check.js --quick` attempted at the end; result reported
  honestly. This run changes ZERO `src/js` and ZERO
  harness/collector inputs (driver clone + prereg + note only), so
  the proof tests + band are the regression cover.

## Pre-registered metrics (bind the run — §14)

- PRIMARY: per-seed charter sealed (y/n + day), trade proposals
  (count + days), studies completed (count + days), first-study day,
  trips started/completed/stalled (stall = ≥5 consecutive no-move
  walk days on one trip), walk rows per trip, creek-refusal say lines
  per day. A miss is NO-GO, never re-scored against a friendlier
  metric mid-run.
- SECONDARY (report-only): survived days, end cause, pop alive/end,
  national stage day, lesser priced day, full-seat priced count,
  tribute deliveries + veteran spend, transcript senseless count
  (must be 0 to claim the people check clean), wild w4+ fights.
- Every run note carries a "metric review" section; if a metric proves
  wrong, the revision is proposed for the NEXT run.
