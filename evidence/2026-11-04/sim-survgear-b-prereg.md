# Pre-registration — arm sim-survgear-b (Loop B run fleshout-loop-b-20261104T2330Z)

INSTRUMENT ONLY, zero src/js game changes. No default flip, no
VETSHAPE flip, no gate, price, deed, or readyDemand change. The
counterfactual is computed OFFLINE from the recorder + kill log +
fallen list, never by changing what the engine counts. This arm
takes the 2125Z run's named next blank #2 (the vetshape proposal):
survivorship + gear-stability as ONE arm, release days as primary.

## Question (from vetshape, evidence/2026-11-04/sim-vetshape-b.md)

Vetshape proved the conjunction: counting dead killers alone
releases NOBODY (99101's shape>=2 window never overlaps
all-legs-met days; 99104 misses by one day on the gear leg).
This arm measures the JOINT change that WOULD open the door:
how much longer killers must live, combined with how long the
gear legs must hold, for at least one release day to exist.

## Corpus

- Band/seeds/policies: EXACTLY vetprod/vetshape's — seeds
  99101–99108 (the gearbar band re-run on current master),
  competent policy VERBATIM, default env, no policy-side lever.
- Horizon: 150d death-aware (dead villages stop simulating,
  +10d tail max), same as vetprod/vetshape.
- Fresh runs: the survgear driver re-runs all 8 seeds with the
  vetprod instrument reused VERBATIM (same recorder, same daily
  snapshots) and writes
  evidence/2026-11-04/perseed-survgear-b/. The analyzer reads
  this fresh corpus only for judged numbers; the vetshape corpus
  is the reproduction reference (see "Reproduction check").
- Pilot gate: 8 seeds before any confirm spend. This is an
  8-seed probe; NO confirm spend.

## Recorder (daily, per seed)

Each daily snapshot records: raw standing, gated standing, the
readiness-5 legs as counts (armored / armed / tricks /
veterans) against demand plus the engine's short list, wave-4
kill/killer counts, and roster size. Finalize copies the full
waveKillLog and the full fallen list. Living killers and shape
per day are DERIVED offline from kill log + fallen list via
vetprod's killerFates (single source of truth, reused not
re-implemented divergently) — the snapshot's engine veterans
count is the cross-check, not a second derivation.

## Definitions (fixed before any judged sim)

- Killer = a vid with >= 1 wave-4+ kill in state.waveKillLog
  (base-wave rule as in vetprod/vetshape: log entry w >= 4).
- Killer fate: firstDay = first wave-4+ kill day; deathDay =
  earliest fallen entry with day >= firstDay, else null (alive
  at end of run); kill-to-death interval = deathDay - firstDay.
- Survival extension E: a dead killer's death day moves to
  deathDay + E (E days added to that killer's life); a killer
  alive at end of run is unchanged. Extended-living count
  V_E(d) = killers with firstDay <= d AND (deathDay null OR
  d < deathDay + E). E = 0 is the engine's actual living count.
  Same-day kill-and-die contributes to NO day at E = 0 (vetprod
  rule, kept); at E > 0 it contributes from its kill day
  through deathDay + E - 1.
- Gear legs (counts, not short-list names — short names vary
  between 'armor'/'weapons' and 'armored'/'armed' across days):
  armor met on day d iff snapshot armored >= demand.armored
  (4); weapons met iff armed >= demand.armed (6); tricks met
  iff tricks >= demand.tricks (3). A snapshot day with no
  readiness5 object contributes no leg reading and is never
  counted as a ready day.
- Gear-leg hold G: Held_L,G(d) is true iff leg L was actually
  met on some snapshot day m with m <= d <= m + G — i.e. a met
  leg stays met for G days after its last met day. G = 0 is
  the engine's actual day-by-day leg state. A leg never met
  on any snapshot day is never held-met. Tricks is NOT held:
  it uses its actual daily count (it is not a gear leg).
- Counterfactual-ready day at (E, G): a SNAPSHOT day d with
  raw standing >= 200 (NOT gated — vetshape's lesson: the
  engine caps gated standing at 199 while a village is held,
  so gated >= 200 can never fire on a held seed; gated is
  reported for the reproduction check only) AND armor
  Held_G(d) AND weapons Held_G(d) AND tricks actually met
  on d AND V_E(d) >= 2.
- Minimal joint change per seed: the exhaustive search over
  E in 0..120 and G in 0..90. Reported per seed: (a) minimal E
  with its minimal G (smallest E for which some G gives >= 1
  ready day, paired with the smallest such G); (b) minimal G
  with its minimal E; (c) minimal E + G pair (ties broken by
  smaller E). Survival-only = minimal E at G = 0 (none if no
  E <= 120 gives a ready day). Gear-only = minimal G at
  E = 0 (none if no G <= 90 gives a ready day). Joint =
  (a)/(b)/(c) above. The scan grid E in {0, 7, 14, 28, 60} x
  G in {0, 7, 14, 30} is reported in full per seed (ready-day
  counts), so the conjunction stays visible and never
  conflated: three columns per seed — survival-only (E, G=0),
  gear-only (E=0, G), joint (E, G).

## Pre-registered metrics (binding — a miss is NO-GO, never re-scored)

- PRIMARY: counterfactual ready days under joint (E, G).
- Verdict DIAG-GO for a joint lever iff some SINGLE pair
  (E <= 28, G <= 30) yields >= 1 ready day on >= 3/8 seeds,
  counting only error-free seeds toward the 3. Otherwise
  DIAG-NO-CANDIDATE, with the full per-seed minimal-(E, G)
  table reported. INSUFFICIENT-DATA only if > 2 seeds carry
  instrument errors.
- SECONDARY: per-seed binding-leg day counts (snapshot days
  by actual short-set derived from counts, overall and on
  raw >= 200 days); killer kill-to-death intervals (sorted
  list, median — re-confirming vetprod/vetshape's 3.5d);
  per-seed gear-leg histories (days met, last met day,
  never-met flags); full (E, G) scan-grid ready-day counts;
  re-check of 99104's one-day miss (daily table d147–d149:
  raw, gated, armored/armed/tricks/living-veterans, engine
  short list, shape, and the counterfactual legs on each day).
- REPRODUCTION CHECK (sanity, not judged): the fresh survgear
  corpus must reproduce vetshape's shared numbers EXACTLY on
  all 8 seeds — days, peak gated standing, wave-4 fight counts,
  wave-4 kill counts, killer identities, killer first-kill
  days, and killer death days. Any mismatch is reported as a
  finding, not silently averaged away. Balanced panel (§15):
  INAPPLICABLE for a pure diagnostic counterfactual — stated,
  not fabricated.
- INSTRUMENT ERRORS: 0 required on all judged seeds for a
  clean GO; the verdict degrades per the rule above otherwise.

## Sense-testing

At least one villager transcript/dialogue sample read from this
arm's own corpus and judged for meaning (not counts): the
veteran-word collision flagged by vetprod/vetshape is the
standing sense-test item to re-check.

## What this arm will NOT do

No mechanics change, no lever build, no gate/price/demand
change, no VETSHAPE flip. If the joint finding motivates a
lever (e.g. killer protection/rotation PLUS gear-leg holding),
it is NAMED in the evidence as a next-arm proposal only.
