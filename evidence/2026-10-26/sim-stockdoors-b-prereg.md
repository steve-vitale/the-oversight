# sim-stockdoors-b — PRE-REGISTRATION (written BEFORE any judged sweep, 2026-10-26)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T0049Z, axis
food-economy. Arm: the driedpath metric review's named next blank —
TWO more pantry recorders before judging any family ledger closed.
Measurement only: zero src/js changes, no default flips, no lever.
This arm does NOT re-judge the driedpath NO-GO — its verdict is ONLY
whether the family ledgers close once the stockSurplus door and the
direct-pantry-consumption doors are captured. Judged ONLY against
this prereg.

## Question (verbatim from the driedpath evidence + metric review)

Driedpath (evidence/2026-10-26/sim-driedpath-b.md, read before writing
this prereg) proved the (dried) transformation path is fully captured
(893 events, 0 unlinked) but family ledgers still fail because TWO
more pantry doors are unrecorded: (a) stockSurplus (game.js ~28794)
pushing villager shared surplus directly into the pantry as 'Foraged
food' 200-kcal units, and (b) direct pantry consumption bypassing
pantryDraw (NPC pantry eating, alien pantry raids alienPlayers.js
~2448, Light Fingers lifts abilityActions.js ~1654). This arm builds
both recorders and re-judges the ledgers with them in place.

## Calibration quoted from driedpath (the bar must beat this)

- 9826 Lamb's Quarters family: inflow 359,700, draws 53,010, sweep
  276,880, transform loss 360, closing 29,400, residual −50 (0.01%)
  — the calibration family closes WITHOUT the new doors, because
  its flows never touch them.
- Pooled focal family residual 90.42% of pooled focal inflow
  (generic family included); pooled NON-generic share 1.18% — still
  over the 1% bar even before the generic family is counted.
- Dried-channel pooled residual −67,999 on pooled transformed post
  774,536 (8.78%); excluding generic: −28,796 on 305,506 (9.43%).
  The sign is almost always NEGATIVE: dried stock VANISHES without
  a recorded draw or sweep.
- Generic "Foraged food" residuals +88,009 to +341,126 per seed
  (105–1,228% of its 3-door inflow) — the stockSurplus shape.
- Driedpath leg-3 lesson (applied here, NOT reused): the
  ALL-focal-families seed-pass rule is brittle by construction —
  one unclosable family fails every seed. This prereg judges
  per-family-seed pass RATES alongside the pooled bar, and judges
  the generic family SEPARATELY from named-food families.

## Prior knowledge: the two doors in code (read before writing this prereg, not new data)

- stockSurplus (game.js ~28794): villagerMealDay's shared surplus
  goes to the pantry as 'Foraged food' 200-kcal units (freshDay =
  v.day + 3, no granaryDays), with a sub-unit remainder carried
  forward (v._surplusRemainder, always < 200 kcal) and a pantry-cap
  refusal path (return 0 / partial). The sim-stockdoor-b recorder
  (scripts/stockdoor-capture.js, REUSED UNCHANGED here) wraps it
  and records {day, vDay, give, kcal stored, spoilDay = vDay + 3}.
  Gross vs surviving pile: the night's own later draws can eat
  the just-written surplus (stockdoor arm: night 82 wrote 2,800,
  2,000 survived; night 81 wrote 3,000, 0 survived) — but the
  mealdraw arm showed the mechanism is fresh-first ordering, so
  on some bases gross EQUALS surviving pile. Either way the
  stockdoor record is the inflow; the draws (pantryDraw +
  direct) are the outflows; the ledger must count both, never
  equate gross with surviving pile.
- NPC pantry eating: INLINE unit decrements, not a method call —
  npcTakeAction's hunger branch (game.js ~20561: first
  non-spoiled stack, pantryKcal > 200, one unit, "eats from the
  pantry") and npcChildAction's hunger branch (~20721: first
  stack of any kind, one unit, same announcement). Children
  dispatch ONLY through npcTakeAction (~20493, the only call
  site in src/js). The recorder therefore wraps npcTakeAction
  (snapshot-diff around the call) and npcChildAction with a
  depth guard (nested calls counted, not recorded — each eat
  recorded exactly once).
- Alien pantry raids (alienPlayers.js ~2448, apPlaygroundRaid):
  500–1,000 kcal per raid, max 1 per 6 days, taken unit-wise
  from the END of the pantry list backwards, voiced
  ("Your pantry is lighter..."). Inline loop — snapshot-diff
  around apPlaygroundRaid.
- Light Fingers lifts (abilityActions.js ~1654,
  'thief.steal_pantry'): up to 2 units of the LARGEST pantry
  stack, into the scholar's pack, 50% caught (−20 trust).
  Inline decrement — snapshot-diff around Game.useAbility,
  tagged by ability key ('thief.steal_pantry' claimed only
  when that key's records appear; any other ability key's
  pantry decrease is reported under its own key, never folded
  into the lift count).
- Bonus direct paths wrapped honestly (reported per-path, never
  claimed if absent): Game._evTakePantryKcal (event/tribute
  takes, game.js ~25133 — the mealdraw evidence's
  unexplained-removal candidate; record carries retTaken and
  a retMismatch flag vs the diff sum) and Game.takeFromPantry
  / takeFromPantryBulk (player takes, game.js ~15730/~15886).
  A path with zero calls on the band is reported as zero,
  not as a claim.

## Band (substrate identical to driedpath, reused seeds as substrate)

- Policy: competent-nofeast. Env asserted FATAL in the runner:
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  FEASTSCALE_R13 unset or 0.
- Pilot seeds: 9820–9827 REUSED as substrate (the driedpath pilot
  band — this arm re-runs the identical band with the two new
  recorders added, so new-door events pair with the known
  ledgers; determinism means inflow/mealdraw/spoilvol/driedpath
  records must reproduce the driedpath corpus counts, checked
  by the proof AND by the re-derived control ledger below).
  Reuse is stated, not hidden: these seeds are NOT fresh, and
  no freshness claim is made for them.
- Confirm seeds (ONLY if the pilot verdict is GO, see below):
  9768–9779 (12 seeds, the driedpath confirm band — the natural
  second substrate; it is a REUSED lqpersist-substrate band,
  not fresh — stated, not chosen after the pilot).
- Horizon: 100d, death-aware (run ends early if the village is
  lost; daysAlive reported per seed). Matches driedpath; never
  a fixed 200d.
- Base commit pinned: this worktree's HEAD at prereg time is
  e698421537c4123d5babc535fd04f7d4df81a71e. The judged sweep
  runs on the prereg commit (tooling-only: prereg + instrument
  scripts, zero src/js); the proof records the sweep HEAD, and
  any base move between prereg and sweep is reported, never
  hidden. The driedpath numbers are NOT this run's control:
  the base has moved since 2309Z (ship bump + journey r54),
  so the control ledger below is re-derived on THIS head.

## Instrument (DIAG only, new files only)

- Reuses UNCHANGED: scripts/inflow-capture.js,
  scripts/mealdraw-capture.js, scripts/spoilvol-capture.js,
  scripts/driedpath-capture.js, AND scripts/stockdoor-capture.js
  (the stockSurplus recorder — reused, not rewritten). No
  sibling capture file is modified.
- NEW scripts/stockdoors-capture.js, installed AFTER loadGame,
  BEFORE setupGame. It (1) installs the reused stockdoor
  recorder, and (2) wraps Game.npcTakeAction, Game.npcChildAction
  (depth-guarded, see above), Game.apPlaygroundRaid,
  Game.useAbility, Game._evTakePantryKcal, Game.takeFromPantry,
  and Game.takeFromPantryBulk once each. Each direct wrapper
  snapshots the village pantry BEFORE the call, delegates with
  identical arguments, `this`, and return value, snapshots
  AFTER, and records ONLY unit decreases (unitsLost x pre-call
  kcalEach, per stack, with name, spoilDay, granaryDays,
  foodState). It reads state, writes ONLY to the caller's
  arrays. No Game.state write, no RNG consumption, no say/log
  write. Calls with no pantry decrease push NO record, but
  counters count every call per path — so a zero-record path
  is distinguishable from an unwrapped path. The installer
  reports wrappedPaths / missingPaths; a missing method is
  reported as UNWRAPPED and its path is never claimed.
- Duty-wrapping portion rule (driedpath instrument-fix
  precedent, stated here for every wrapper in this arm): a
  wrapper that snapshots around a whole duty call records the
  CONVERTED / CONSUMED portion only. For the direct recorders
  the portion IS the observed unit decrease (unitsLost x
  pre.kcalEach) — whole units, never a whole-stack value when
  only part of the stack left. For the reused driedpath
  events the rule is unchanged: in-place preKcal =
  post.units x pre.kcalEach.
- NEW scripts/sweep-stockdoors-b.js (same band/env assertions,
  death/wall capture as sweep-driedpath-b.js, plus inflow +
  mealdraw + spoilvol + driedpath + stockdoors recorders,
  day-end snapshots, opening-stock snapshot, smoke-rack say
  lines). STOCKDOORS=0 disables ONLY the stockdoors install
  (det-gate control; driedpath + spoilvol stay on in both
  det-gate runs). Corpus:
  evidence/2026-10-26/sim-stockdoors-b-corpus/ (per-seed JSONs;
  pilot 8, plus confirm 12 iff the pilot is GO). NEVER
  overwrites the driedpath, spoilvol, or lqpersist corpora.
- NEW scripts/analyze-stockdoors-b.js and
  scripts/test-stockdoors-b.js (proof). The analyzer prints:
  per-seed per-family ledgers under BOTH the old definition
  (control — see below) and the new definition, the
  per-path direct-consumption census, stockSurplus totals,
  GO legs, wall numbers, and the sense block.
- Median rule (named explicitly): conventional median — average
  of the two middle values for even n.

## Definitions (fixed here, before judging)

- Family of a channel name: strip a trailing ' (dried)' or
  ' (smoked)' once; the base name is the family. ' (dried)'
  and ' (smoked)' variants of one base belong to ONE family.
- Focal families: Lamb's Quarters, Burdock, Muscadine Grapes,
  Purslane (NAMED set), and Foraged food (GENERIC set, judged
  separately). A focal family counts on a seed iff its family
  inflow (NEW definition) >= 10,000 kcal on that seed (same
  10k reporting floor as driedpath).
- OLD definition (control ledger, re-derived on THIS head):
  exactly driedpath's definitions — inflow = the three doors
  (stock, deposit, pantryAdd with their honesty rules); draws
  = pantryDraw records ONLY (meal + other summed, by
  (units x kcalEach) over items); sweep = spoilvol pantry
  removed byChannel; transform loss = driedpath loss
  (portion rule); opening/closing = spoilvol snapshot
  freshKcal (base + dried names summed per family).
- NEW definition (judged ledger): inflow = OLD inflow PLUS
  stockSurplus records (kcal > 0 only, family 'Foraged
  food'); draws = pantryDraw records PLUS drawSpoiled
  records (items: units x kcalEach) PLUS direct-consumption
  records (items: units x kcalEach, all paths, each item's
  family by its name) — draws are defined HERE, explicitly,
  as pantryDraw records PLUS the direct-consumption recorder,
  not retrofitted later; sweep, transform loss, opening,
  and closing as in the OLD definition.
- Family residual of F on S (either definition): (closing −
  opening) − (inflow − draws − sweep − transformLoss).
  Zero means the counted flows fully explain the stock change.
- Dried-channel residual of F on S (either definition):
  (closingDried − openingDried) − (transformedPost +
  driedInflow − driedDraws − driedSweep), where driedDraws
  under the NEW definition includes direct records on dried
  names and drawSpoiled items on dried names.
- Family residual share: |residual| / family inflow (NEW
  definition for judged legs; OLD definition for the control
  ledger). Inflow 0 with stock movement is reported as a
  finding, never a share.
- Per-family-seed pass: a counted focal family-seed passes
  iff its |residual| is within 1% of its family inflow.
- Control ledger (must be reported before any judged leg):
  the OLD-definition ledgers computed on the NEW corpus,
  side by side with the driedpath corpus's ledgers, plus the
  trajectory comparison (deaths, death causes, wave reach,
  wall fields per seed). Any move vs driedpath is a base
  effect to report, never a verdict input and never hidden.
  The det-gate (leg 1) is the instrument-neutrality control:
  it compares STOCKDOORS off vs on on THIS head, not against
  any old corpus.

## PRIMARY metric (judged ONLY against this)

GO (the stockSurplus door and the direct-consumption doors are
captured and the family ledgers close) iff ALL of:
  1. Neutrality / det-gate: a paired run of one pilot seed with
     STOCKDOORS=0 vs STOCKDOORS=1 produces identical inflow
     records, mealdraw records, spoilvol records, driedpath
     records, death lists, and wall fields (stockdoors fields
     and `ms` excluded from the comparison). Any mismatch is
     DIAG-NO-GO (instrument, not game).
  2. Coverage: (a) stockSurplus records with kcal > 0 appear on
     >= 7/8 pilot seeds; (b) the direct recorder's per-path
     call counts and record counts are reported for EVERY
     wrapped path (npc-adult, npc-child, alien-raid,
     thief.steal_pantry, event-take, player-take,
     player-take-bulk, plus any other useAbility key that
     moves the pantry) — a path with zero records is reported
     as zero, and NO path is claimed that is not in
     wrappedPaths; (c) the reused driedpath instrument still
     sees its path on this head: transformation events on
     >= 7/8 pilot seeds and linked transformed post-kcal
     >= 95% of total transformed post-kcal pooled. Any failure
     of (a) or (c), or any claimed-but-unwrapped path, is
     DIAG-NO-GO.
  3. Named-family closure: (a) per-family-seed pass RATE over
     NAMED focal family-seeds >= 80% (each counted family-seed
     within 1% of its family inflow), AND (b) pooled
     |named family residual| within 1% of pooled named focal
     family inflow (NEW definition). A miss is NO-GO.
  4. Generic-family closure (judged SEPARATELY, never folded
     into leg 3 and never dropped from the verdict): (a)
     per-family-seed pass RATE over GENERIC focal family-seeds
     >= 80% within 1%, AND (b) pooled |generic family residual|
     within 1% of pooled generic focal family inflow (NEW
     definition). A miss is NO-GO.
  5. Dried-channel closure: pooled |dried-channel residual|
     across all focal family-seeds (named + generic) within
     2% of pooled transformed post-kcal (NEW definition).
     A miss is NO-GO alongside legs 3–4, reported separately.
A miss on leg 1 or 2 is DIAG-NO-GO (instrument failure, not a
game verdict). A miss on leg 3, 4, or 5 is NO-GO (measured,
and the ledgers do not close as barred) — never re-scored
against a friendlier metric mid-run (no dropping the generic
family, no switching to base-only residuals, no single-seed
rescue, no ignoring unlinked events, no reverting to the OLD
draw definition). Metric doubts go under "metric review" and
propose the revision for the NEXT run.

## Confirm band (ONLY if the pilot verdict is GO)

If the pilot is NO-GO or DIAG-NO-GO, no confirm band is spent
— the run ends with that verdict. If the pilot is GO, run seeds
9768–9779 (12 seeds) with the identical instrument and band,
after recording that band's reuse status (it is a REUSED
lqpersist-substrate band, not fresh — stated, not hidden);
then report the same legs on the confirm band as CONFIRM-GO /
CONFIRM-NO-GO / CONFIRM-DIAG. The confirm NEVER overrides the
pilot verdict: the verdict is the pilot's GO/NO-GO/DIAG; the
confirm is reported alongside.

## Secondary figures (reported, not judged)

- Per-seed per-family tables under BOTH definitions: opening,
  inflow (3-door / stockdoor split), draws (pantryDraw /
  drawSpoiled / direct-by-path split), sweep, transformed
  pre/post/loss, closing, residual, residual share — for focal
  families and every other family with inflow >= 10,000 kcal.
- Direct-consumption census: per-path call counts, record
  counts, total kcal, by family; event-take retMismatch count
  (must be 0 — any mismatch is a finding, reported not judged);
  useAbility keys that moved the pantry, each separately.
- StockSurplus totals per seed: calls, give, stored, cap
  refusals (kcal 0 records), remainder carry (final remainder
  < 200 kcal, reported as a bound, never as a flow).
- Dried-channel ledgers under both definitions (the control
  comparison: how much of the driedpath −8.78% the new draws
  explain).
- Opening stock per seed (total + staple split, as driedpath).
- Wall numbers for the band (national / table / wins, wave 4/5
  reach, median survival, death-cause shares). Four-realm
  formation, Arc reach, trap acquisition, counter discovery/kill,
  young-link succession: reported ONLY if the corpus carries
  them; otherwise "not recorded in this corpus, not estimated".
- Balanced panel (MEASUREMENT.md §15): NO comparison exists —
  this arm changes no lever and no game code, so there is no
  before/after to panel. Stated in the evidence file; the
  det-gate (leg 1) is the before/after comparison: identical
  records with the instrument off vs on. The before/after
  that DOES exist is instrument before/after: driedpath's
  ledgers without the new doors vs this run's with them —
  reported via the control ledger.

## Pilot gate

This 8-seed band IS the pilot. No confirm band is spent unless
the pilot verdict is GO (see above). Never below 8 seeds for
any band.

## Sense (SENSE-TESTING LAW)

At least one direct-consumption event quoted narratively from
the corpus: one pantry eat / raid / lift (or, if the band
records none of the three named paths, one stockSurplus night
traced gross-to-surviving-pile) — what the village did, what
the record shows, judged in plain words: does the flow read
as people behavior (a named eater, a named reason, a named
consequence)? Plus one stockSurplus night quoted with its
give/stored split.

## Metric review

Every evidence file carries a "metric review" section
(MEASUREMENT.md section 14). If this metric proves wrong, the
revision is proposed there for the NEXT run — never re-scored
mid-run.
