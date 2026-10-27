# sim-spandraw-design-b — pre-registration (committed BEFORE any judged probe)

Run: oversight-flesh-out-loop-b, arm sim-spandraw-design-b, axis
food-economy. DIAG/measurement ONLY: ZERO src/js changes, ZERO
default flips, ZERO changes to any existing analyzer or to
scripts/dedupspan-ledger-b.js / scripts/census-spandraw-b.js /
scripts/stockdoors-capture-raidcallers.js / scripts/mealdraw-capture.js.
This arm builds ON the 1951Z census (sim-spandraw-census-b), it does
not redo it: the census verdict (cultivate-only surface on
competent-policy node sims, 356 spans, 0 crossings, 0 exclusions)
stands, and this arm answers the census's own follow-up — what
instrument makes the non-cultivate span question measurable at all.

## Question

"SPAN-DRAW CLASS BEYOND CULTIVATE — only cultivate spans are proven
to swallow an endDay; other useAbility spans that cross a day boundary
could create the same direct+meal double-count." The census could not
see other ability types because competent-policy node sims never tap
them through useAbility. This arm builds a DESIGNED day-boundary
probe: invoke each ability action through the game's own useAbility
code path, at a day-boundary position, with the census span logger
on, and read whether endDay draws land inside the span — with the
same schema and the same census classifier, so probe spans and
census spans are judged by one rule.

## Anti-rushed-probe guard (binding, from the 1951Z constraint)

This is NOT a forced-timing claim about real play. A boundary
position is a MECHANISM test: it asks whether a span that reaches
the day boundary CAN swallow an endDay draw. It does NOT claim
real players (or policies) ever tap that action at that hour.
Therefore probe results carry their own label:

- PROBE-PROVEN (mechanism): a probe span meets the census PROVEN
  rules (item-matched exclusion > 0, enterDay != exitDay, >= 1
  span-internal pantryDraw). This proves the mechanism exists for
  that key. It is NOT a live double-count claim.
- Real-play promotion requires a SEPARATE unscripted sim band in
  which the same key recurs with an exclusion. That band is named
  as follow-up, never claimed here.

A probe PROVEN that is reported as a real-play double-count would
be a misreport of this arm. The evidence verdict keeps the labels
separate throughout.

## Fixed inventory (code-read 2026-10-27, before any judged probe)

Abilities: 142 ids in src/data/abilities.json. Data actions: 68.

- By context: combat 44, explore 11, camp 7, social 5, field 1.
  Non-combat data actions (probe-invoked): 24.
- Impl coverage: 53/68 wired — 51 keys in abilityActions.js
  ABILITY_ACTION_IMPLS plus green_thumb.cultivate and
  green_whisper.cultivate registered by gardenCultivation.js.
  15 data actions are UNWIRED (defined in data, no impl anywhere):
  aegis_link.link, raise_earth.raise, gravity_well.pull,
  landslide.quake, pack_hunt.sic, mending_hands.mend, blink.blink,
  switcheroo.swap, foresight.foresee, live_broadcast.go_live,
  the_crowd_moves.command, stoke.stoke, coin_guard.coins,
  bribe.pay_off, long_table.share_pot — ALL combat context except
  long_table.share_pot (camp). useAbility refuses these BEFORE
  payment ("isn't wired up yet"), so they pay no tick, run no impl,
  and cannot create a span effect. Their probe outcome is
  REFUSED-UNWIRED, an engine/data finding, not a fixture failure.
- Pseudo-abilities (not data actions, inventoried separately, NOT
  in the pilot GO denominator): keepsake.* (steady, hold,
  lucky_break — keepsakes.js, requires a worn keepsake fixture)
  and god.* verbs (godverbs.js, requires ascension fixture).
  Both are reported in the inventory section with their fixture
  gate; if a fixture is not attainable in a probe instance, the
  row reads FIXTURE-GATED, never a bare zero.
- Legacy activatables (blood_magic, time_skip, dowsing,
  echo_location, field_medicine, herbal_remedy, purify,
  compost_king, cannibal_frenzy via _legacyActivatables): these
  go through activateAbility, NOT useAbility (only composite
  "ability.action" ids route to useAbility). The census span
  logger wraps useAbility only, so legacy taps are OUTSIDE the
  span surface by construction. Inventoried, not probed, not
  counted as failures.
- Game-code useAbility callers (non-UI): exactly one —
  cultivateGarden, player path (gardenCultivation.js), which
  calls useAbility(plan.source, 'cultivate'). NPC garden work
  (cultivateGarden(vid), game.js:7000 path) bypasses useAbility
  entirely. tbVillagerAbility (game.js) does NOT call useAbility:
  its villager effects are hand-written, and god/keepsake villager
  casts go through tbVillagerAbility wrappers, not player
  useAbility spans. So villager casts cannot create census spans.
- UI callers (app.js, excluded from node): scream_cheese.scream,
  shoulder_check.shove, hogtie.bind, come_get_some.goad — all
  combat context. Even UI-driven, combat actions cannot day-cross
  (see structural rule below), so the UI surface adds no
  day-crossing class. Inventoried, not probed in node.
- Structural rule (code-read, stated before probing): tickAction
  returns early when a fight is live (game.js tickAction:
  `if (this.tbfight ...) return`), and the day only advances via
  tickAction reaching TICKS_PER_DAY (512) or the dayPart>=4 path.
  Combat spans therefore CANNOT cross a day boundary through the
  tick mechanism. Combat actions are classified
  DAY-CROSSING-IMPOSSIBLE-BY-CONSTRUCTION and are NOT probe-invoked
  (probing them out of combat would only measure the context
  refusal, which the code already states). This is a mechanism
  classification, not a probe measurement, and the evidence says
  so.

## Probe design (fixed before any judged probe)

Instrument: scripts/probe-spandraw-design-b.js (new). Per probe
instance it loads the game via scripts/sim-harness.js (seeded
before eval, full src/js list in index.html order minus DOM-only
files, window stubbed then deleted — the census harness rules),
runs setupGame, installs captures IN CENSUS ORDER
(stockdoors-capture-raidcallers, then mealdraw-capture, then the
census nest logger OUTERMOST, so spanEnter precedes the
stockdoors pre-snapshot and spanExit follows its record push),
then invokes ONE action through Game.useAbility and records the
constructed payload {seed, nestEvents, directRecords,
mealDrawRecords} for the census classifier (scripts/census-
spandraw-b.js censusPayload, reused unchanged).

- Fresh instance per (seed, action): no cross-action
  contamination (cooldowns, once-per-day flags, kcal, garden
  state). Measured load cost ~4s/instance, so the pilot
  (8 seeds x 24 actions x 2 positions = 384 instances) is
  affordable and is the honest unit.
- Fixture (disclosed, not hidden): the probed ability is granted
  by pushing {id, level: 1} onto scholar.abilities (and, for
  skill-lane abilities whose hasAbility reads a codex skill
  instead, the matching skill fixture — recorded per action).
  Granting is SETUP, not measurement: the invocation itself is
  always Game.useAbility, the draws are always real endDay
  pantryDraw calls, and no draw record is ever fabricated.
  Scholar kcal is topped to 5000 and health to full before each
  tap so a cost refusal is never a fixture artifact (a kcal/hp
  refusal after top-up is recorded as COST-BLOCKED with the
  numbers). Pantry is the setupGame opening stock, recorded per
  instance (opening kcal); an instance whose opening pantry is
  too thin to draw a meal is flagged PANTRY-THIN and its
  no-draw verdict is attributed to pantry, not to the engine.
- Boundary position (position A): scholar.dayTicks is set to
  512 - ticks(cost), where ticks = max(1, round(time_min / 2))
  for time-cost actions; cultivate uses 512 - 16 = 496 (its
  impl ticks 16 after payment); actions with no time cost use
  511 (1-tick sensitivity: ANY impl-internal tick crosses).
  Day is the setup day (day 1); dayPart is whatever setup
  leaves (recorded, not forced — forcing dayPart would be a
  second fixture the mechanism does not need).
- Control position (position B): the same action, same fixture,
  dayTicks = 100 (mid-day). A control span must close the same
  day with no internal draws; a crossing control invalidates
  the position logic (see LEG 4).
- Targets: each action is tried first with target null. Social
  actions are additionally tried with the first living roster
  villager as target (second attempt, same instance class, fresh
  instance). A refusal is recorded with the Game.say reason
  (say lines are captured read-only during the tap); refusal
  classes: REFUSED-UNWIRED, REFUSED-CONTEXT, REFUSED-PRECHECK,
  REFUSED-IMPL, TARGET-BLOCKED, GATE-BLOCKED (cultivate garden
  gate), COST-BLOCKED. A refused tap is NEVER counted as a span
  effect, even though the outer logger logs its enter/exit pair.
- Cultivate control: cultivate is attempted as a probe row, but
  its judged control is the 9954 replay (census F7/F8): the
  analyzer must still classify 9954 green_whisper.cultivate as
  PROVEN with 3,820 kcal exclusions. If the fresh-setup garden
  gate blocks cultivate probes (no growing bed), the probe row
  reads GATE-BLOCKED and the replay remains the cultivate proof
  — no fixture heroics (no hand-built garden) are used to force
  a cultivate crossing, because cultivate is already proven and
  forcing it would add nothing this arm needs.
- Sense: every probe records its say lines and its span trace;
  the evidence reads at least one boundary span trace
  end-to-end (enter, any internal draws with frames, exit,
  exclusions) and judges real vs artifact.

## Corpus, seeds, horizon (pre-registered)

- Pilot seeds: 9981-9988 (8 seeds, distinct from every prior
  span band). No policy is run: probe instances are fixtures,
  not villages, so there is no policy, no survival horizon, and
  no wall-number claim from this arm. Horizon per instance: a
  single boundary tap on the setup day — the question is a
  mechanism (can this span hold a night), not a reachability
  horizon, and a longer horizon would add nothing but compute.
  This is stated, not hidden: wall numbers (national/table/
  wins/wave/survival) are NOT RECORDED for probe fixtures, and
  the census band's wall numbers are not re-reported as this
  arm's.
- Confirm band IF a non-cultivate key reaches PROBE-PROVEN in
  the pilot: 12 fresh seeds 9991-10002, same key(s) only,
  judged ONLY on mechanism recurrence (same key, same PROVEN
  rules, still labeled PROBE-PROVEN). If no key reaches
  PROBE-PROVEN, no confirm band is run.
- Output: evidence/2026-10-27/sim-spandraw-design-b-corpus/
  (one JSON per probe instance: spandraw-design-b-s<seed>-
  <ability>.<action>-<A|B>.json), written with the census
  sweep's pending-flush transport (keep in memory, flush at
  end; EPERM flap is waited out, never forced).

## Classification rules (fixed before seeing probe data)

For EACH probed non-combat data action, from its boundary
payload through censusPayload (same classifier as the census):

- PROBE-PROVEN (mechanism): >=1 boundary span with
  exclusionsKcal > 0 attributed by applySpanDedup (item-matched
  on name/kcalEach/spoilDay, consuming units), enterDay !=
  exitDay, and >=1 span-internal pantryDraw. Label carries
  "(mechanism, not real play)" everywhere it appears.
- SPAN-CROSSES-DAY-NO-DRAW: >=1 boundary span with enterDay !=
  exitDay, zero span-internal draws, zero exclusions. (A
  crossing span whose internal draw matches no record item
  stays MIXED-NEEDS-READ per the census classifier — never
  silently promoted.)
- NO-DAY-CROSSING: boundary span fired (cost paid and/or impl
  ran), zero day-crossing spans, zero exclusions.
- REFUSED-*: no span effect (see refusal classes above); the
  reason string is published. A refused action is not a
  NO-DAY-CROSSING: it never entered the mechanism.
- NOT-PROBED: combat actions (structural rule), UI-only actions
  (combat + app.js), legacy activatables (activateAbility
  surface), god/keepsake rows whose fixture gate failed — each
  with its stated reason, never a bare zero.

Zero attribution (per action, before any engine-gap claim):
harness (logger/capture install order, fixture grant) vs policy
(no policy runs — policy cannot be the cause of any probe zero)
vs engine (unwired, context, tick suppression, impl behaviour)
vs fixture/world state (target, garden gate, pantry thinness).
Every zero carries one of these attributions in the table.

## Legs and GO / DIAG-GO thresholds (judge ONLY against these)

- LEG 1 — pilot gate (instrument completeness, before any
  confirm spend): DIAG-GO iff all 384 pilot probe instances
  complete without probe crash, every boundary payload carries
  spanEnter+spanExit for its action, all 68 data actions are
  classified under the rules above (no unclassified action),
  and the per-action zero-attribution column is filled for
  every zero. If any clause fails: KILL or NARROW (report the
  failing clause, do not run the confirm band).
- LEG 2 — probe completeness: DIAG-GO iff the per-action table
  publishes, for every non-combat data action, boundary spans,
  day-crossing spans, span-internal draws, exclusions (kcal),
  outcome class, refusal reason where refused, and zero
  attribution; plus the inventory sections for combat,
  unwired, UI-only, legacy, god, and keepsake rows. A probe
  that meets LEG 2 is a DIAG-GO even if its answer is "no new
  mechanism" — a negative probe is a completed probe, not a
  failed run, and must NOT be re-scored as a failure for
  finding nothing new.
- LEG 3 — new-mechanism proof (only if a non-cultivate key
  meets PROBE-PROVEN in the pilot): DIAG-GO iff (a) at least
  one full span trace for that key is read end-to-end in the
  evidence and judged real vs instrument artifact, (b) the
  exclusion is item-matched (not amount-matched) and the span
  crosses a day boundary, and (c) the same key recurs with an
  exclusion on the 12-seed confirm band (9991-10002). If (c)
  fails, the verdict is SINGLE-SEED PROBE CANDIDATE, not
  PROBE-PROVEN — reported as such, never rounded up. If no
  key meets PROBE-PROVEN in the pilot, LEG 3 is NOT TRIGGERED
  and no confirm band is run.
- LEG 4 — controls: DIAG-GO iff (a) zero control-position
  (dayTicks=100) spans cross a day across all actions/seeds,
  and (b) the 9954 replay control still classifies cultivate
  as PROVEN with 3,820 kcal exclusions through the same
  analyzer. A crossing control or a broken replay control is
  PROOF-RED: the position logic or the analyzer is wrong,
  and no LEG 3 claim may be judged until it is fixed.

## Before/after and balanced panel (MEASUREMENT.md §15)

This probe has NO before/after game leg: zero game changes,
zero lever variants, nothing to panel. The judged comparison
is WITHIN the instrument (boundary position A vs control
position B, same action, same seed, same fixture), analyzed by
the census classifier (the detector), not by panel metrics —
panel metrics (national/table/wins) do not exist for fixture
instances, and running a panel compare on fixture corpora
would be fabrication. So NO balance-panel compare .md is
produced for this arm, as pre-registered here. This paragraph
is the explicit statement required in place of a panel
attachment.

## Sense-testing

At least one span trace is read end-to-end in the evidence:
if LEG 3 fires, that key's boundary trace; otherwise the
longest day-crossing probe span (or, if none crosses, the
longest boundary span), judged on whether the draws inside it
are real endDay meals/raids (caller frames: villageMeal /
commonsRaid) vs an instrument artifact. No villager transcript
claim is made for a ledger phenomenon unless a transcript line
actually names the span — the cultnest arms already
established this surface is silent in speech, and silence is
reported, not filled in.

## Metric review (MEASUREMENT.md §14 — filled in the evidence)

Pre-registered metrics bind this run; a miss is NO-GO /
not-DIAG-GO, never re-scored mid-run. Metric doubts go in the
evidence's "metric review" section for the NEXT run.
