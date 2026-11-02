# sim-laircontact-a — PREREG (written BEFORE any judged sim in this arm)

Arm: fed-scholar lair-contact cadence audit, axis scale-onramp,
blank (3) from sim-musterupkeep-a ("Why fed scholars never end a day
on the lair tile (contact cadence under pantry-touching policies) —
contact audit"). Coordinator claim: fleshout-loop-a-20261102T1515Z
(this arm; sibling Loop B live — NOT touched; sibling trees NOT
touched; no goal hidden_files claim/lock files touched).
DIAGNOSIS ONLY. Zero src/js changes. Policy/instrument only.

## Correction to the prior arm's wording (stated BEFORE the sims)

The musterupkeep evidence says fed scholars "never end a day on the
lair tile". The per-seed records behind that sentence say something
narrower, and this arm judges the narrower thing: fed scholars DID
arrive at the lair tile on march days (titanroute march records:
97330 fed 26 arrived days, 97338 fed 18 arrived days), but produced
ZERO herald startCombat attempts (baseline 12 on 97330 d110, 6 on
97338 d118), and ended NO day on the HERALD MONSTER's tile at
trace time (driver sameTile: 0 days in both fed runs; baseline
97330: 1 day, d109; baseline 97338: 0 days — yet baseline 97338
still attempted on d118, so day-end co-location is NOT the attempt
trigger). The question is therefore NOT "why don't fed scholars
reach the lair" — they do. It is: why do fed lair arrivals never
convert into a herald startCombat attempt, while baseline arrivals
do? Every metric below is built on that corrected question. The
prior arm's verdict (fed march NO-GO) is untouched by this
correction; only the contact-cadence mechanism question is reframed.

## Questions (only these three)

- Q1 (mechanism): is the 0-attempt fed pattern trajectory noise
  (RNG-stream shift from a pantry-touching policy), a
  pantry-verb artifact (the take itself: bars, confrontation rolls,
  ledger effects), or a real march/food mechanism (bulk food moved:
  pack weight, pantry drain starving the scholar's own eating, march
  guardrail blocks, herald co-location never occurring at engagement
  time)?
- Q2 (routing): at engagement-relevant moments, what is the
  scholar's tile vs the herald's tile, who calls startCombat (caller
  classification), and on which days does the scholar start the day
  on the lair/herald tile? A routing gap must show up as a named
  tile/timing blocker, not as "0 attempts" alone.
- Q3 (primary-metric sturdiness): does day-matched trust hold as
  the sturdier primary for upkeep work — i.e. is it computable in
  every arm (contact-day anchor is not: fed runs have no contact
  day) AND decomposable into hunger-saved vs strike-timing vs other
  components from the daily link series?

## Arms (built BEFORE judged sims, after this prereg)

All arms share the closecommit stack exactly (titanroute +
musterclose + mustergap commit-own, same env gates as the
musterupkeep driver). Only the outermost leg differs:

- closecommit: no outer leg (baseline reproduction).
- musterfed: the measured-killed musterfed leg unchanged
  (scripts/policies/musterfed.js) — bulk pack up to next dawn's need.
- lairsham: NEW trivial-touch leg (scripts/policies/lairsham.js):
  while a muster stands (same conditions as musterfed: call heard,
  allies present, titan not slain, game not over), pack exactly ONE
  unit of the first finished-food pantry item into the scholar's
  pack via Game.takeFromPantryBulk, once per daily. Deterministic
  (first finished item, pantry-index order; no RNG of its own).
  Moves negligible food/weight and cannot trip the single-take bar
  (1 unit << 4000 kcal and << half-pantry) or the 7-day rate bar
  (1 unit/day << 3000 kcal/day); it DOES call the verb, record a
  take, and mutate the pantry/pack by one unit. It isolates "any
  pantry touch" from "bulk food moved".
- lairnoise: NEW pure-noise leg (scripts/policies/lairnoise.js):
  while a muster stands (same conditions), consume exactly 8
  Math.random() draws per daily, after the march, and change NO
  game state. 8 is calibrated as an upper-ish bound on one
  theftConfrontation's consumption (one roll per witness in the
  confronter loop + the 0.35 let-it-slide roll + the line-pick
  roll; witnesses(6) at Haven is plausibly <= ~10). It is an
  approximation of RNG-stream shift, NOT an exact replay of the
  verb's rolls — the verdict treats it as "RNG shift of this order
  suffices / does not suffice", never as "the verb rolls exactly 8".

PERCEPTION LAW: the new legs decide only from the call record, their
own muster record, their own slain flag, and (sham) the game's own
pack verb — no monster roster, no allied roster, no link-list reads
(trust/opinion/arrears are NEVER read by any policy; the driver
instrument reads them for measurement, as in prior drivers). The
proof test asserts the banned reads absent from both new policies.

KNOWN CONFOUNDS, stated up front: (a) the sham's one unit may be
eaten/spent before it matters — that is the point (negligible);
(b) the noise leg's draw count is approximate, so a noise-arm
"preserves attempts" result rules out only RNG shifts of this
order, not every possible stream shift; (c) herald roaming is
itself RNG-driven, so co-location days vary by trajectory even
without any leg — the controls exist to price that variation.

## Instrument (new driver, before judged sims)

scripts/laircontact-driver-20261102.js, adapting the musterupkeep
driver (same env gates, same closecommit stack, same gate
decomposition and link rows). Per run it records, from call day to
run end:

- Every herald startCombat attempt IN FULL (herald-instrument row:
  day, cls, reason, caller, stackTop, scholarPos, entityPos,
  pendingBefore) — prior drivers dropped positions/caller; this
  arm keeps them, because the attempt trigger is the question.
- Daily trace (day-end, after the full policy daily): scholar tile
  (px,py), heard lair tile, herald monster tile (driver-side
  worldMonsters read — instrument only), Manhattan distance
  scholar↔herald, onLair (scholar == lair), coLocated
  (scholar == herald), that day's titanroute march record
  (steps, arrived, error) and guard block (fed/watered/healthy
  flags when blocked), scholar kcal/hydration/health, pack kcal,
  pack kg, carry capacity, pantry kcal, gate decomposition, link
  rows, and the outer leg's record (musterfed packs / sham packs /
  noise draws).
- Day-start tile for each day is the previous day's day-end tile
  (trace is daily); engagement-time positions come from attempt
  rows, not from the day-end trace.

Per-seed records: evidence/2026-11-02/perseed-laircontact-a/
(lc-<arm>-s<seed>-r1.json).

## Primary metric (pre-registered, binds this arm)

Per seed, per arm: herald startCombat attempt count, with
attempt-time co-location (scholarPos == entityPos at call) and
caller for every attempt, plus the daily co-location-day count and
lair-arrival-day count in the call-to-end window.

## Mechanism verdict rules (pre-registered decision tree — judge strictly)

A mechanism may be claimed ONLY if its arm pattern holds on BOTH
seeds 97330 and 97338 AND the attempt-time/daily positions name
the blocker (a tile, timing, guard, or weight fact — not "0"
alone):

- FOOD/WEIGHT/DRAIN mechanism: musterfed = 0 attempts on both
  seeds, AND lairsham > 0 attempts on both seeds, AND lairnoise
  > 0 attempts on both seeds. Then the sub-mechanism is named
  from the series that separates fed from controls (guard-block
  days + scholar kcal, pack kg vs capacity, pantry-0 days, or
  co-location days).
- VERB-CALL artifact: lairsham = 0 attempts on both seeds (like
  fed), regardless of the noise arm. Then the cause is the touch
  itself (verb/ledger/confrontation path), not the bulk food.
- PURE RNG NOISE: lairnoise = 0 attempts on both seeds (like fed),
  AND lairsham > 0 on both seeds. Then an RNG-stream shift of
  this order suffices to kill contact, and no feeding-specific
  mechanism may be claimed from the two known seeds.
- ROUTING GAP (independent of the above): a routing gap may be
  claimed ONLY if some arm shows repeated lair arrivals AND
  repeated scholar↔herald co-location at engagement-relevant
  moments with STILL no startCombat call, with the caller/timing
  fact that explains the miss (e.g. engagement leg runs before
  the march in the daily order on co-located days). Co-location
  without a call on one seed only is not a gap claim.
- SPLIT BY SEED (any pattern above holds on one seed but not the
  other): NO mechanism claim. Proceed to the pilot band below.

A miss is never re-scored mid-run (no "attempts per arrival day",
no pooling across seeds, no dropping a seed). Metric doubts go
under "metric review" for the NEXT run.

## Q3 verdict rule (pre-registered)

Day-matched trust "holds as the sturdier primary" IFF (a) it is
computable in all 4 arms x 2 seeds (day-matched day = the baseline
closecommit contact day for that seed: d110 on 97330, d118 on
97338 — the fed/sham/noise runs are read on that same day number
whether or not they attempt), AND (b) the fed-vs-baseline
day-matched difference decomposes from the daily series into
hunger-saved (fully-fed dawns x 2 per link, from hungry lines +
pack records), strike-timing (night-strike lines in the window),
and other/residual. If (a) and (b) hold but the strike-timing or
residual component EXCEEDS the hunger-saved component on either
seed, the verdict wording is fixed: "sturdier anchor, contaminated
estimate" — day-matched trust stays the primary ANCHOR (it is
always defined; contact day is not), but it is NOT a clean causal
estimate of feeding, and future upkeep work must use a
strike-controlled decomposition. If (a) fails anywhere, day-matched
trust does not hold even as an anchor, and the failure is named.

## Secondary metrics (reported, never used to rescue a miss)

Gate at day-matched contact (expected: trajectory noise, reported
not judged); fights (expected 0); end day / end reason; hungry-line
count and got-vs-need series; fully-fed dawns; packed kcal;
pantry kcal at day-matched contact; march guard-block days with
reasons; pack kg vs carry capacity on arrival days; scholar kcal
at trace on arrival days; herald-tile trajectory (does the herald
sit on its lair tile, or roam?).

## Seeds, horizon, pilot gate, determinism

- Seeds 97330 and 97338 first, 180d, death-aware (driver cap; run
  ends early on village-lost / win as the harness reports).
- Determinism check BEFORE judging: re-run closecommit 97330
  (r2). Attempt days/counts AND the gate series must match r1
  exactly; if not, the instrument is untrusted and no verdict is
  claimed until the non-determinism is explained.
- Baseline reproduction check: the new driver's closecommit runs
  must reproduce the musterupkeep closecommit records (call day,
  attempt days/counts, gate series, trust series) on both seeds
  before any fed/sham/noise number is judged.
- PILOT BAND (only on a split-by-seed result): screen closecommit
  seeds (same driver, closecommit arm only) until 8 muster-call
  seeds are found, screening at most 40 seeds; if fewer than 8
  call-seeds are found, the band is whatever was found and the
  verdict is downgraded to "unsettled, band thin". Band bar
  (pre-registered): systematic iff fed attempts are 0 on >= 7/8
  band seeds while baseline attempts are > 0 on >= 6/8 band
  seeds; otherwise noise/unsettled. The band is NOT run if Phase
  1 separates cleanly on both seeds — identical-seed controls
  plus a named tile/timing/guard blocker settle the question
  without re-proving base rates.

## What this verdict does and does not mean (stated BEFORE the sims)

A mechanism verdict here explains the CONTACT pattern only. It
does NOT reopen the musterupkeep NO-GO (the pack cannot fund the
need), does NOT propose a fix (diagnosis only), and does NOT
change the pending Steve-calls (succession eligibility,
stores-draw upkeep). The named next arm follows the verdict
(e.g. a food/drain mechanism names a scholar-feeding or
guardrail arm; a noise verdict names no follow-up arm beyond
re-running with RNG-controlled comparisons; a routing gap names
an engagement-timing arm).

## SENSE-TESTING LAW

Read the transcript lines around baseline attempt days (d110 /
d118) and around fed lair-arrival days with no attempt, and judge
whether the fiction reads sensibly: does the scholar arrive at a
lair the herald is not on, does anyone notice, does the muster
stand somewhere speakable? Counts without a read are not a verdict.

## Canon

docs/CANON.md read first. NO canon doc covers the titan muster, the
Herald, musters, upkeep, or lair-contact cadence (the manifest
lists no titan doc; MONSTER-WAVES.md covers wave law, not muster
accounting; MAP.md covers map/travel/way-home, not herald
engagement timing) — the gate, upkeep, march, and engagement
facts above are read from src/js/titans.js, src/js/game.js, and
the policy files, stated as code-read, not invented canon.

## Metric review (for the NEXT run, not this verdict)

To be filled at closeout.
