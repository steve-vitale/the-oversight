# Fresh-kill inversion DIAG — PRE-REGISTRATION (arm sim-freshkill-a)

Run: fleshout-20261105T1515Z (Loop A). Axis: scale-onramp / winnability
chain (wild ally-join → wave-4 kills → veterans → readiness-5 release →
wave-5 facing → full seat). Committed BEFORE any judged sim. DIAG ONLY —
zero src/js changes, zero default flips, zero gate/price/deed-number
changes, no readyDemand or VETSHAPE touch. No [needs-eyes] flag:
measurement only.

## The question

Loop B arm sim-grindfinish-b (evidence/2026-11-05/sim-grindfinish-b.md,
band 99309–99316) found the fresh-kill inversion: both kills came through
non-lifted, pending-live wanderer fights at fresh entry (fracHi 0.84,
2 of 9 fresh-entry TB fights), while lifted TB fights killed 0/30 and
wounded-entry 0/3 (n=3, thin). Killersim2-b
(evidence/2026-11-05/sim-killersim2-b.md): 3 kills in 58 wild wave-4
fights (5.2%), post-first-blood 1/45. Question: are the
scholar-initiated wild fight and the forced treeline siege different
fights with different kill odds — and which should the village choose?

This arm answers it by instrumenting EVERY wave-4 TB fight by channel
on a FRESH band and measuring kill rate per channel. Loop B's adopted
vetrest/tbretreat arms are NOT this arm's; do not touch them.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5 and
  "Combat readiness gates the standing unlock": wave-4 bands (anchored):
  damage 35–95, HP 850–1500, pierce 0.2–0.5. Wave 5 demands 2 LIVING
  villagers with wave-4+ kills. No canon invented here.
- Steve 2026-10-08 (MONSTER-WAVES.md / CANON.md): "Monster encounters
  are fought, not rolled" — blow-by-blow with real stats. This DIAG
  measures fought channels, never an outcome table.
- Data note (observed, not invented): `src/data/monsters.json` carries
  TEN wave-4 defs, not the nine MONSTER-WAVES.md names — the tenth is
  `herald` [700, 900], the wave-6 herald per the Wave 6+ scaffold
  section. It is in the wave-4 pool by its `wave` field; the analyzer
  counts it as wave 4 like the engine does.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-05/sim-grindfinish-b.md` (band 99309–99316, 150d,
  8 seeds, competent verbatim): 45 wild wave-4 fights, 2 kills, both
  non-lifted pending-live fresh-entry TB (fracHi 0.84); lifted TB 0/30;
  wounded-entry TB 0/3; TB endings death 32, won 2, fled 0. Lift
  fidelity 29/30; TB→TB continuation 13/14, reset 0/14. Mechanism map
  in its prereg (grindfinish-instrument capture fields reused here
  verbatim): TB lift via `tbWorldHpFor` only when the tile-monster
  alias id === mid; pending/contest/trial fights roll fresh from the
  def range; lingerers restore at min(pre-HP, fighter end HP).
- `evidence/2026-11-05/sim-killersim2-b.md` (band 99311–99342, 32
  seeds): 3 kills in 58 wild wave-4 fights (5.2%), post-first-blood
  1/45. Two living wave-4 killers never coexist on any banking seed.
- `evidence/2026-11-05/sim-dmground-a.md` (band 99201–99208): kills
  are TB finishes of ground-down beasts — all 9 armed kills entered
  at median 14% of def-max HP. The fresh-kill inversion on the
  grindfinish band does NOT reproduce dmground's wounded-only story;
  this DIAG tests whether the channel, not the entry frac, is the
  difference.

## Band freshness (MANDATORY — whole-token grep, all dated preregs + forbidden lists)

- Band 99351–99358 (suggested band, verified — NOT assumed).
- All dated preregs: `grep --include='*.md'` over ALL of `evidence/`
  for `\b9935[1-8]\b` — ZERO hits. Every `evidence/*/sim-*-prereg.md`
  is covered by that scan, including all 18 preregs that carry a
  "forbidden" mention (checked individually as well — zero hits for
  the band tokens in each).
- Forbidden-band lists: the 18 "forbidden"-mentioning preregs listed
  above were each grepped for the band tokens — zero hits. No
  forbidden/contaminated list names 99351–99358.
- Whole-token grep over ALL of `evidence/` (rg, filenames only):
  37 files carry a 99351–99358 token; every one is a coincidental
  in-run quantity, NOT a seed use — sampled contexts are all pantry
  quantities (`"pantry": 99354`, `"pantryKcal": 99356`,
  `"pantryFreshAfter": 99354`, `"nourishment": 99358.0`), and the
  files' own seeds are named in their filenames (85002, 85104,
  94724, s63804, s3103, 9711, 30504). Seed-field check
  (`"seed": 9935[1-8]`, `seed=9935[1-8]`, `SEEDS=...9935[1-8]`)
  over `evidence/` + `scripts/`: ZERO hits. No filename under
  `evidence/` names any 99351–99358 seed.
- Contamination nearby: 99309–99342 used (grindfinish-b,
  killersim2-b); 991xx heavily used. 99351–99358 sits clear of both.
- Band verdict: FRESH.

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- Fresh band 99351–99358: 8 seeds, competent policy verbatim
  (`scripts/policies/competent.js`, `competent` export), 150d
  death-aware horizon (dead villages stop simulating, +10d tail max
  via runDays). 150d because wave-4 unlocks need standing +
  readiness; the grindfinish band's median survival was 81d and
  still produced 34 TB fights.
- 8 seeds pilot, DIAG leg only (`RUN=freshkill-diag`), one leg, no
  armed leg — the DIAG measures the channels as they stand.
- Instrument: `scripts/grindfinish-instrument-20261105.js` reused
  VERBATIM (same record shape: TB lift capture, pendingLive,
  entryFracHiPrimary, primaryVeteran, worldOrigin, doorFled stash,
  field fights, kill log, daily snapshots, readiness5). No new
  capture is needed — the channel split is an analyzer-side
  classification of fields the instrument already records.
  Driver: `scripts/freshkill-driver-20261105.js` (grindfinish driver
  copy, names/outdir/arm changed). Analyzer:
  `scripts/freshkill-analyze-20261105.js` (channel classifier +
  ±1-day kill matcher + verdict inputs). Proof:
  `scripts/test-freshkill-a.js`.
- Corpus to `evidence/2026-11-05/perseed-freshkill-a/` (one file per
  seed, `instrumentErrors` 0 required; any instrument error is a
  loud failure to fix, not to paper over).
- Stage 0 smoke (seed 99351, 5d live + 10d off/on neutrality, to
  /tmp, NOT judged): instrument fires — per-fight records present,
  0 instrument errors, off/on identical days/endReason/kill-log
  length. Proof: `scripts/test-freshkill-a.js` (see Proof section).
- No Stage 2 in this run: a DIAG names the next blank; any lever
  the DIAG names is a later arm's work. No game-code change at any
  point.

## Channel definitions (mutually exclusive, precedence A > C > B > D)

Applied to every wave-4 player-TB fight (`channel === 'player-tb'`,
`wave >= 4`). Field fights are recorded but carry no channel (the
question is about TB fights). `frac` below is
`entryFracHiPrimary` (primary fighter entry HP / def hp[1]).

- **(A) pending-live wanderer fresh-entry** — the scholar-initiated
  wild fight: `!lifted && pendingLive && frac >= 0.75`. Wanderer
  contact, fresh def-range roll (grindfinish mechanism map rule 4).
  Def-range fact (checked against `src/data/monsters.json` before
  this prereg): every wave-4 def has hp[0]/hp[1] >= 0.778, so a
  fresh def-range roll ALWAYS lands at frac >= 0.778 — the `>= 0.75`
  leg is vacuous for genuine fresh rolls and only guards against a
  misclassified lifted/wounded fight. Any pending-live fight with
  frac < 0.75 is counted in D (or C if frac < 0.25) and reported as
  a D-pendingLive-nonfresh count; expected 0.
- **(C) wounded-entry** — the grind tail, wherever it comes from:
  `frac < 0.25` (and not A — A requires frac >= 0.75, so disjoint
  by construction). A lifted fight entering wounded is C, not B:
  the grind tail is the thing being measured, not the lift.
- **(B) lifted-siege** — the forced treeline siege: `lifted`
  (tile-monster alias id === mid, `tbWorldHpFor` enters at world
  HP) and not A and not C. Includes lifted fights entering at
  middle or fresh frac (a fresh world entity lifted at near-full
  HP is still a siege fight, not a wild fight).
- **(D) other** — everything else: non-lifted non-pending TB
  (contest/trial/bystander fights, door-flee re-engages, veteran
  rolls at +50% HP), and any pending-live fight that fails the
  fresh leg. Sub-counted in the analyzer: D-pendingLive-nonfresh,
  D-veteran, D-doorFled, D-contestOrTrial (residual).

Per-channel reporting: fights, kills, kill rate, median entryFracHi,
median damageFrac, median rounds, median partySize, endings
(death / kill-or-rout / fled / unfinished), solo vs party split.

## Kill matching — the ±1-day join (staypolicy metric review)

A wave-4 kill-log row matches at most one fight, and a fight matches
at most one kill-log row. Greedy in kill-log order: for each kill row
(same mid, killer in the fight's fighters), prefer a fight starting
the SAME day; else a fight starting the PREVIOUS day (kill logged
day N+1 for a fight starting day N — midnight-spanning kills).
A fight starting day N can therefore match a kill logged day N or
day N+1, never later. TB "kill-or-rout" endings are NEVER counted as
kills without a matched kill-log row. Unmatched kills are reported,
never silently assigned.

Comparison to grindfinish's same-day rule: the analyzer ALSO computes
same-day-only matches and reports both tables, so this band's
A-vs-B gap can be compared to grindfinish's 2/9 fresh vs 0/30 lifted
under the identical rule. The verdict is judged on the ±1-day join;
the same-day table is a comparability secondary, never a re-score.

## Primary metric (binding — judge only against this)

**DIAG-GO** (the wild fight and the siege fight ARE different fights
with different kill odds) iff, for some pair of channels X, Y among
{A, B, C, D}:

- |killRate(X) − killRate(Y)| >= 0.15 (15 percentage points), AND
- fights(X) >= 8 AND fights(Y) >= 8.

**DIAG-NO** otherwise, except the power rule below.

**Power note (binding):** if total wave-4 TB fights < 20, the verdict
is UNDERPOWERED, not NO-GO — unless the DIAG-GO bar above is met on
>= 8 + >= 8 fights, in which case the verdict is DIAG-GO (the
comparison itself is powered). Rule order: GO bar first, then
UNDERPOWERED (< 20 total TB fights), then DIAG-NO.

A DIAG-GO names the higher-kill-rate channel as the fight the village
should be choosing and states the gap in plain words; it does NOT
authorize a lever (a lever is a later arm). A DIAG-NO means the
inversion does not reproduce as a channel difference at this power —
the two kills on the grindfinish band stay a 2-kill anecdote, and the
evidence names the next blank from the channel table.

## Secondary (reported, never re-scored)

- Per-seed table: days, end reason, wave-4 fights (field/TB),
  wave-4 kills, TB fights by channel (A/B/C/D), killers ever,
  living killers at end.
- Field-channel kill rate (context only — field fights are not
  channels here); overall TB kill rate; TB endings band-wide.
- Same-day-only channel table (grindfinish-rule comparison).
- Wall numbers: wins, national, table, wave 4–5 unlocks, wave 4–5
  faced, readiness-5-ready days, median survival.
- Per-mid fight chains printed as sequences (entry→exit per fight)
  for the evidence file — the eulogy-chain read, per seed.
- 1-HP arrivals (field entries at 1 HP, TB entries at 1 HP, field
  exits at 1 HP) — the fieldfinish open item.
- Lift fidelity (lifted entryHpPrimary == worldHpAtLift.hp) and
  pending-live share — the grindfinish mechanism-map checks, carried
  forward as secondaries.
- Village assessment in plain words and the named next blank.
- Sense-testing law: read at least one kill chain's transcript/log
  end to end (death-day say lines + one fight's log), judged for
  meaning, not just counts.
- Telemetry deviation check per loop-body step 10 (attempted; if the
  tool refuses recorder corpora, say so and report wall numbers
  directly, never fabricate a compare).
- Balanced panel (§15): NO before/after pair for a DIAG corpus —
  stated, not fabricated (same limit as dmground / grindfinish
  recorded: a DIAG corpus has no before/after pair to panel).

## Metric review (per §14; filled at verdict time, not now)

- Whether the DIAG-GO bar was judgeable on 8 seeds / 150d (two
  channels at >= 8 fights each), or the band was UNDERPOWERED.
- Whether the ±1-day join changed any verdict input vs the
  same-day rule (how many kills matched only on the +1 day, and
  whether any of them sits in channel A or B).
- Whether the A > C > B > D precedence hid a real overlap (e.g.
  lifted wounded-entry fights counted as C — how many, and would
  counting them as B change any channel rate by >= 5pp?).
- Whether the D residual is small enough to ignore or large enough
  to need its own split (D-veteran / D-doorFled / D-contestOrTrial
  sub-counts).

## Proof (committed with this prereg, before judged sims)

`scripts/test-freshkill-a.js` — classifier unit tests on fixtures
(A / B / C / D attribution incl. precedence: lifted+wounded → C;
pending-live non-fresh middle → D; veteran non-lifted non-pending
→ D; null frac → D; field fight → no channel), ±1-day matcher
fixtures (same-day match; N+1 match; a kill claimed by its
same-day fight is not stolen by a next-day fight; each kill matches
at most one fight; unmatched kill reported), verdict fixtures
(GO at exactly 15pp with 8+8 fights; NO at 14pp; NO when a channel
has 7 fights; UNDERPOWERED at 19 total TB fights with no GO;
GO wins over UNDERPOWERED at 19 total with 8+8 and a 15pp gap),
live harness smoke (5d, seed 99351) + off/on neutrality leg (10d,
seed 99351: identical days, endReason, kill-log length, 0
instrument errors) + live determinism (same seed twice identical
at 10d). Instrument reused verbatim from grindfinish-b
(`scripts/grindfinish-instrument-20261105.js`); driver
`scripts/freshkill-driver-20261105.js`; analyzer
`scripts/freshkill-analyze-20261105.js`.
