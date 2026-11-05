# sim-strandnarr-a — stranded-night narration census + upkeep-breakfast adjudication

Worker: sim-strandnarr-a (Loop A, food-economy / narration). Branch:
sim-strandnarr-a. Prereg (committed BEFORE any judged sim):
evidence/2026-11-04/sim-strandnarr-a-prereg.md (commit 6452ac84).
Instrument: scripts/policies/strandnarr-diag.js (full-transcript
recorder + window classifiers), driver scripts/strandnarr-trace-b.js,
analyzer scripts/analyze-strandnarr-b.js, proof
scripts/test-strandnarr-a.js (20/20, including the ON-vs-OFF det-gate).

## Verdict: DIAG — CAPTURE ARTIFACT (both claims, no fix)

Stranded nights ARE narrated, and the anchor upkeep breakfast WAS
spoken. The prior arm's silences were gaps in its capture, not gaps
in the game:

- The prior driver sliced narration ONLY from inside one policy.daily
  call. The harness order per loop-day is upkeep, wait, upkeep, wait,
  upkeep, wait, daily, sleep — so meal beats spoken in upkeep and
  bedding-down/wake lines spoken in sleep fell between daily slices
  and were never attached to any row. Game.log keeps only the last
  40 lines (game.js emit), so a post-hoc log read cannot recover a
  full day either.
- The new instrument wraps Game.say/Game.sysSay and keeps EVERY
  attempted line, tagged with phase (upkeep / daily / sleep /
  harness), loop-day, and upkeep part, with markers at upkeep,
  daily, and sleep entry/exit. It draws no RNG and edits no state;
  the det-gate proves it: seed 17021, 60 loop-days, instrument ON vs
  OFF produce identical bankfood evenings, mornings, and
  first-upkeep kcal series.

No src/js change, no policy change, no gate/price/deed change. There
is no blank to fill: the lines already exist and already fire. The
instrument itself is the deliverable (reusable by any later arm that
needs upkeep or sleep windows).

## Primary metric (pre-registered): stranded-night bedding-down coverage

- Stranded night = nighttravel outcome `travel-refused` or
  `out-of-reach` with the scholar not inside Haven at daily exit.
- Pilot: 8 seeds × 60 loop-days, bankfood(warmed(woodcarry(
  nighttravel))) variant leg, WOODWARM=0 (the leg that reproduces
  the anchor; WOODWARM=1 was not needed), env gates as the prereg.
- Stranded nights found: 11 (seed 17021: 3, thicket; seed 15003: 8,
  creek). The other 6 seeds stranded 0 times (15009, 15211, 15220
  survived 60 days getting home nightly; 15091 died day 28, 15215
  died day 24 — death-aware stop, not a fixed horizon).
- Slept-through denominator (pre-registered): 9 nights.
  Bedding-down lines in sleep window: 9/9 = 100%. GO threshold
  (denominator >= 5 AND coverage 100%) MET.
- Stronger, unregistered count: bedding-down lines are present on
  11/11 stranded nights, including the 2 non-slept-through nights
  (a mid-sleep wake and an overnight village death) — bedding-down
  is spoken at sleep START, so it survives any ending.
- Every stranded sleep window opens with the same two lines:
  "Sleeping rough means the cold ground — heal ~16." and
  "You settle into the cold ground. Sleep takes you."
- A third stranded-night line fires on 10/11 nights: "You camp wild
  tonight — no pantry meal. Eat from your pack." (missing only on
  15003 loop-day 27, a mid-sleep wake before endDay's wild-night
  beat — consistent, not a silence).
- Dawn night-out note ("You spent the night out here, away from
  Haven — and you're still out here at dawn."): present on 7/7
  uninterrupted dawns. The 4 non-clean nights are accounted for,
  not silent: 3 woke-with-a-start interruptions (17021 night 52,
  contest grab at dawn; 15003 nights 26–27, mid-sleep wakes) show
  "You wake with a start — something is wrong." instead of the dawn
  line, which is the engine's correct interrupted-sleep path; the
  4th (15003 night 30) is the village dying overnight.

## Anchor adjudication (seed 17021, loop-days 51–53)

Reproduced EXACTLY on WOODWARM=0: evenings 51, 52, 53 are thicket
out-of-reach strandings, bankfood mode `flip`, skip
`no-gather-target`, 0 actions — the anchor's shape to the unit.

- Stranded nights: NARRATED. Each of the three sleep windows
  contains both bedding-down lines (quoted above). Night 51 and 53
  end with the night-out dawn line; night 52's dawn line is
  replaced by the contest-grab wake-with-a-start (full window
  quoted in the corpus file for seed 17021, which keeps the whole
  transcript verbatim).
- Upkeep breakfast: CAPTURE ARTIFACT. The prior arm's numbers
  (first-upkeep kcal 128 -> daily-entry kcalBefore 2310, 270 kcal
  Muscadine Grapes) reproduce exactly, attached to the morning
  AFTER stranded evening 52 — loop-day 53 in this driver's
  counting (the prior arm labels the event by its evening, "52").
  That morning's upkeep window contains, as its FIRST meal beat
  (upkeep part 1): "You eat Muscadine Grapes (270 kcal)."
  Full upkeep window: 2,194 kcal of meal beats (270 grapes +
  1,924 blackberry) against a 2,182 kcal scholar-kcal rise
  (12 kcal of wait-burn); pantry fell 1,668 kcal in the window
  under `remote` access (see below); the rest was pack food.
  The line was never missing — it was spoken between daily slices.

## Secondary census: upkeep-breakfast coverage (pilot)

- Stranded mornings: 10. Mornings with an upkeep-window kcal gain
  >= 50: 9. Mornings with a matching meal beat in the same upkeep
  window: 9/9 = 100%.
- The one non-gain morning (15003 loop-day 29: 440 -> 410 kcal,
  0 meal beats) is honest burn with nothing edible — correctly
  excluded from the denominator, not a silence.

## Context questions (sense-tested, NOT new verdicts, NOT arms)

1. competentEat's takeFromPantry loop while stranded away from
   Haven: ANSWERED by data, and it is legal. All 8 stranded
   mornings with a pantry draw show havenStoresAccess = `remote`
   (13,771 kcal drawn in total) — the engine's Full Integration
   rule (game.js havenStoresAccess: stage >= 3 manifests the
   pantry anywhere). ZERO draws under access `none`; the DAWNREFUSE
   gate ("The pantry is in the hall. Your hands are not.") never
   needed to fire in this pilot because access was remote, not
   none. The one honest failure mode observed: 15003 morning 29
   drew 0 kcal (pantry spent or nothing ready) and the scholar
   burned instead. No illegitimate drain observed.
   - Tension worth a future read (not a finding): the endDay
     wild-night line says "no pantry meal" while a stage-3 scholar
     still requisitions in upkeep. Both are mechanically true (no
     communal meal served; System requisition is not a meal), but
     a player reading both lines back-to-back may hear a
     contradiction. Left as a question; no wording changed here.
2. Haven-gossip lines ("Word gets around the haven") inside a
   stranded scholar's day record: code fact confirmed — the
   engine's monsterNewsCheck carries NO position gate, and gossip
   lines DO appear in sleep windows on non-stranded nights (e.g.
   15003 loop-day 7, 15091 loop-day 10). Pilot incidence in
   stranded windows: 0/11 sleep windows, 0/10 upkeep windows.
   So the mechanism exists and the pilot simply did not catch it
   firing while stranded. Left as a question for a gossip-targeted
   census; nothing changed here.

## Sense-testing (transcripts read, not just counted)

- Anchor night 51's sleep window reads as a coherent stranded
  night: rough-sleep warning, settling, night static/contest
  briefing, "You camp wild tonight", spoilage honesty ("Overnight,
  Muscadine Grapes went bad"), a cache gift, freezing warning,
  hunger gnawing, then the stiff-and-cold dawn with the night-out
  note. The spoilage line and the morning-53 grape meal are NOT a
  contradiction: the spoiled stack was the evening-51 pack grapes
  (spoilDay 52); the scholar carried fresh grapes (spoilDay 56) by
  evening 52.
- Anchor night 52's window is coherent as an interrupted night:
  the contest grab arrives mid-sleep and the window ends on
  "You wake with a start" with no dawn accounting — the engine
  refuses to heal under the cameras, as designed.
- Upkeep mornings read as real breakfasts: pack-first then
  pantry, named foods, kcal that reconcile to the scholar bar
  within wait-burn (and cap/bank on the biggest morning, 17021
  loop-day 54, where 2,912 kcal of meal beats lift the bar only
  1,695 kcal because the bar caps and the bank takes the rest).

## Metric review

- The primary metric's slept-through denominator was the right
  conservatism, but it understates the result: bedding-down lines
  are spoken at sleep start, so they are present even on nights
  that never reach dawn. Proposed revision for the NEXT census
  run: report both — slept-through coverage (the binding metric)
  AND all-stranded-nights bedding presence (the descriptive
  count). No re-scoring was done mid-run; the verdict above uses
  the pre-registered denominator (9/9) and reports the 11/11 count
  separately.
- The upkeep "matched" rule (meal kcal >= delta - 200) is loose on
  the high side by design (wait-burn and cap/bank both push meal
  beats above the bar rise). It did not decide any close case in
  this pilot (smallest margin: 15003 morning 30, 349 vs 329).
  A future run could tighten it to a per-beat reconciliation; not
  needed for this verdict, since the anchor beat is exact.
- Seed dependence is the pilot's real limit: 6/8 seeds never
  stranded, so the census rests on 2 seeds. That satisfies the
  pre-registered denominator (>= 5 nights) but a future stranded-
  narration census should screen for stranding seeds first rather
  than spending 6 silent seeds.

## Runs, files, commits

- Pilot corpus: evidence/2026-11-04/sim-strandnarr-a-corpus/
  strandnarr-s{17021,15003,15009,15091,15211,15215,15220,15221}.json
  (seed 17021 keeps the full transcript; others keep judged
  windows + pattern lines + per-loop-day counts, with discard
  counts — analysis ran in-process on the full text before trim).
- Per-seed table (daysAlive / stranded / slept / bedding /
  refused / woke | stranded mornings / gain / matched):
  15003: 30 / 8 / 6 / 6 / 0 / 2 | 7 / 6 / 6 (village-lost day 30)
  15009: 60 / 0 / 0 / 0 / 0 / 0 | 0 / 0 / 0
  15091: 28 / 0 / 0 / 0 / 0 / 0 | 0 / 0 / 0 (died day 28)
  15211: 60 / 0 / 0 / 0 / 0 / 0 | 0 / 0 / 0
  15215: 24 / 0 / 0 / 0 / 0 / 0 | 0 / 0 / 0 (died day 24)
  15220: 60 / 0 / 0 / 0 / 0 / 0 | 0 / 0 / 0
  15221: 55 / 0 / 0 / 0 / 0 / 0 | 0 / 0 / 0
  17021: 60 / 3 / 3 / 3 / 0 / 1 | 3 / 3 / 3
  Pooled: stranded 11, slept 9, bedding 9 (1.000), refused 0,
  woke 3; stranded mornings 10, gain 9, matched 9 (1.000);
  remote pantry draws 8 mornings / 13,771 kcal; gossip in
  stranded windows 0.
- Proof: scripts/test-strandnarr-a.js — 20/20 (unit classifiers +
  det-gate + anchor reproduction), run 2026-11-04.
- check.js --quick: INCOMPLETE — killed after ~9.5 min with no
  output (output was piped through tail, so no partial log
  survived). Not a failure verdict: this run adds new scripts
  only and edits no src/js, no existing policy file, and no
  green-list test, so no green-list test can be affected by it.
  Verification for this run is the proof test (20/20), node
  --check on all four new scripts, and the ON-vs-OFF det-gate.
  The --quick stall is reported as-is for the coordinator; it
  was not retried, to avoid a second long run stacking on the
  same box.
- Infrastructure note: the prereg commit via scripts/safe-commit.sh
  triggered the known main-index clobber (committed file shown
  staged-as-deleted); repaired with git update-index --add
  --cacheinfo from the HEAD blob, tree verified clean — the
  commit itself was correct. Same check will run after every
  safe-commit in this run.
- Flap: no corpus write failed in this run (all 8 files wrote on
  first attempt); the driver's retry/staging path was not needed.

## Left unjudged

- WOODWARM=1 leg: not run — the anchor reproduced exactly on
  WOODWARM=0, and the prereg's leg rule (0 first, 1 only if the
  anchor does not reproduce) stopped at 0. A WOODWARM=1 census
  would be a different trajectory, not a missing verdict.
- Whether a gossip line firing inside a stranded night reads as
  wrong to a player: mechanism confirmed, incidence 0 in this
  pilot — needs a gossip-targeted census, not this run's verdict.
- The "no pantry meal" vs remote-requisition wording tension:
  noted above as a question, not changed.
