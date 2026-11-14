# Standing accumulation to 199 on gear-ready seeds — Loop B, run fleshout-loop-b-20261114T1430Z, arm sim-standing99107-b

Axis: winnability chain (re-point 2026-11-03). DIAG-ONLY arm: zero
src/js changes. This arm re-measures, on CURRENT master, the 99107
pattern from evidence/2026-11-03/sim-gearbar-a.md ("Next blanks" #2):
a village fully readiness-ready for five days (days 76–80) that
still did not release. It decomposes standing income per day by
source so the next arm knows WHAT is missing before any gate/price
discussion. Gates and prices stay UNTOUCHED unless Steve orders
otherwise; this arm measures only.

## The pattern, and the correction to its 11-03 reading

The gearbar arm read 99107 as "standing 150, not the 199 the door
needs". The ready5 arm (evidence/2026-11-03/sim-ready5-a.md,
current-anchor re-measurement) CORRECTED that reading, from
`src/js/standing.js` (`villageStandingTotal`,
`standingPlentyCappedTotal`, `standingDeferral`):

- Standing has exactly THREE sources, and only three:
  `villageStanding()` = war (25 per wave-3+ ledger kill point) +
  diplomacy (34 per seasoned REGIONAL+ link) + plenty (20 per
  major feast, quality >= 1).
- Release to wave 5 requires the CAPPED total >= 200 (t5) AND
  readiness-5 ready (all four bars). While capped >= 200 but
  readiness-5 is not ready, the gated total HOLDS at t5-1 = 199.
  The "199" is the HOLD value, not a threshold to reach — a
  village at raw 150 was never near the hold at all; it was
  standing-short.
- Plenty counts at most plentyCapT5 = 100 toward the t5 bar
  (capped total); raw >= 200 with capped < 200 also holds at 199.
- `unlockedWave() == 5` additionally requires the wave-3 rung
  (day >= 25 AND wave-2 ledger points >= bar) AND wave-4 faced.
- The five ladder tracks (fight/forage/craft/talk/explore) feed
  the LADDER (`src/js/ladder.js` `villageLadder()` — seat rungs),
  NOT standing: they contribute 0 standing points by design.
  Tribute likewise feeds no standing reader in src/js (only
  link-level `tributePaidWeek` in app.js and `tributeKcal` in
  table-defiant.js). This arm VERIFIES both zeros empirically
  (ladder track totals + tribute markers recorded per seed;
  any standing delta must reconcile to war/diplomacy/plenty
  only) rather than asserting them.
- War is ledger-capped: per-type cap 2 per monster id
  (`waveLedger.js` perTypeCap), counter-kill extras score into a
  separate per-type allowance (perTypeX). Breadth, not farming:
  killing the same beast type twice pays once per type.
- Diplomacy is doubly gated: a link must be SEASONED (30+ days,
  trust 40+) AND REGIONAL+ (`_linkRegionalPlus`: LEAD realm via
  `polityOf('haven')`, BELONG realm via `polityOf(primary)`, or a
  covenant/trade league polity). A lone seasoned bond with a
  splinter village scores 0.

## Calibration gate — the pattern may have MOVED

The ready5 arm already proved the anchor moved under the 11-03
numbers: at ITS anchor (42f0bd49f) the unmodified w4convert
driver rerun on seed 99107 gave 38 days / village-lost / 0
spawns / 0 kills / maxWave 3, vs 1819's 80 days / 2 kills /
maxWave 4. Cause (proven by `git diff`): competent.js gained
+237 lines (gap-audit11 leg 1) and game.js gained gap-batch
items 13/16/17/18, journey-scale r92 peer tending, and
equipment weapon-profile work.

RE-BASELINE (binding on this arm): the 11-03 numbers (99107
ready days 76–80, standing 150, gearbar median survival 90d)
are the PREVIOUS anchor and must NOT be pooled with this arm's
numbers and must NOT be cited as this arm's baseline. This
arm's baseline is its own judged leg on the current anchor
(HEAD 7f52e9fac at prereg time). Any comparison to 11-03 in
the evidence file is descriptive, anchor-move-aware, never a
before/after claim.

## Pre-registration (binding, §11/§14)

- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM
  (the CURRENT file at this anchor), default env. No env
  overrides.
- Seeds: 99101–99108 (the gearbar/ready5 band, re-baselined
  above).
- Horizon: 150 days, death-aware (dead villages stop
  simulating; never a fixed 200d). 150d covers the 11-03
  ready window (days 76–80) with headroom for a slower
  current-anchor trajectory, and matches the reachability
  question (waves 4–5, national, table, wins).
- Balanced panel (§15): INAPPLICABLE — pure diagnostic, no
  before/after change; no comparison is fabricated.
- Primary metric: per-seed standing decomposition completeness
  and reconciliation (see DIAG-GO bar), NOT a reach count.
- Primary questions:
  (a) What standing income is missing on gear-ready seeds —
      decompose standing points per day by source: war per
      wave (3/4/5) and per monster type (cap-aware), diplomacy
      per link (seasoned? regional+? kind?), plenty per feast
      (day, quality), plus the capped-vs-raw gap and the
      plenty-cap bite.
  (b) Which tracks contribute and which sit at 0 — the five
      ladder tracks' lifetime totals per seed, and tribute
      events/markers per seed, against standing's three
      sources (expected: tracks 0, tribute 0 — verified, not
      assumed).
  (c) Does any seed reach capped 200, and do readiness-ready
      days occur on current master?
  (d) When readiness-ready days occur, does standing still
      gate release — i.e. on ready days, is capped < 200
      (standing gates), capped >= 200 with peak < 5 for another
      reason (classify it), or does the peak release?

## DIAG-GO bar (pre-registered; no threshold on reach counts)

GO requires ALL of:
1. All 8 seeds measured with a complete per-day standing
   decomposition from first day to village death or horizon:
   war points per wave + per-type ledger, diplomacy per-link
   (seasoned / regional+ / kind / tribute marker), plenty
   per-feast (day, quality, bundle flag), raw, capped,
   plenty-cap bite, peak, deferral5, readiness-5 and -4 bars,
   w4faced, w5faced, w3 rung, scale rank, ladder track totals.
2. Standing reconciliation: EVERY war-point delta reconciles
   to a kill event in `state.waveKillLog` / the ledger
   (per-type cap respected — a third kill of one type pays 0);
   EVERY diplomacy delta reconciles to a link seasoning or
   regional+ transition (named link, named day); EVERY plenty
   delta reconciles to a feast-log entry (named day, quality);
   0 unclassified standing deltas on any seed.
3. 0 unclassified release/door events: every peak transition
   to 5 and every release say-line is classified (natural
   release, end-call-release, or explained artifact); 0
   release lines without a matching peak state, 0 peak
   transitions without a line or a stated engine path.
4. Instrument health: 0 instrument errors, 0 orphan events
   (0 unlinked wave-3+ kill rows, 0 veteran-recount mismatches
   between the gate count and the instrument's independent
   waveKillLog recount, 0 feast rows the instrument cannot
   classify).
5. Track/tribute verification: ladder track totals and tribute
   markers recorded on all 8 seeds; the standing-attribution
   table names any track or tribute contribution found, or
   records 0 with the evidence (per-seed totals) for it.

A miss on any leg is DIAG-NO-GO and is reported as such; no
metric is re-scored mid-run (§14). No threshold is set on how
many villages reach capped 200 or ready days — this is a
diagnostic.

## Sense-testing law

Transcripts are read: standing/hold/release say-lines and a
sample of kill-beat / feast lines per seed are judged for
meaning, coherence, repetition, and robotic behavior — never
just counts. The sense sample lives in the per-seed JSONs
(`standingLines`, `saySample`) and is quoted in the evidence
file.

## Deliverables

- `scripts/standing99107-instrument-20261114.js` (daily
  standing decomposition snapshot + recordWaveKill wrap +
  hostFeast wrap + say/sysSay line capture + tele death wrap),
  `scripts/standing99107-driver-20261114.js`,
  `scripts/standing99107-analyze-20261114.js`,
  `scripts/test-standing99107-b-20261114.js` (proof:
  decomposition math, per-type cap, link seasoning /
  regional+ classification, feast classification, release
  classification, live-harness smoke) — green BEFORE the
  judged leg.
- Per-seed JSONs under
  `evidence/2026-11-14/perseed-standing99107-b/`.
- Evidence `evidence/2026-11-14/sim-standing99107-b.md`
  with a "metric review" section (§14; no in-run re-scoring)
  and the wall numbers (national / table / wins, wave 4–5
  unlocks, median survival).
- Zero src/js changes. No push, no bump, no live verification
  (coordinator merges --ff-only; ship loop owns deploys).
