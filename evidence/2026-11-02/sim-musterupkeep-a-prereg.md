# sim-musterupkeep-a — PREREG (written BEFORE any judged sim in this arm)

Arm: muster-upkeep feeding, axis scale-onramp, blank (3) from
sim-closedecay-a ("Muster-hunger feeding from the village pantry vs
the scholar's pack"). Coordinator claim: fleshout-loop-a-20261102T1340Z
(this arm; sibling Loop B live on food-economy — NOT touched; sibling
trees NOT touched; no goal hidden_files claim/lock files touched).

## Question (only this question)

Where does muster upkeep draw from, and does feeding the march preserve
the coalition? The closedecay trace (97330, closecommit) shows muster
hunger bleeding allied trust daily while the scholar marches with an
empty pack — but the muster list is fixed at call, so that bleed cannot
remove blades. This arm measures whether a fed march holds allied trust
through to contact, and states plainly what that does and does not fix.

## Upkeep code path + numbers (read from code, BEFORE any sim)

- src/js/titans.js `titanMusterUpkeep(day)`, called from
  `titanDawnTick` (game.js dawn): need = (allied blades + valid Haven
  blades) × 1000 kcal/day. On 97330 that is 11 × 1000 = 11,000 kcal/day;
  on 97338 it is 9 × 1000 = 9,000 kcal/day.
- The draw is `Game.playerPackSpend(need)` ONLY — the scholar's pack
  (finished food in `state.scholar.inventory`, whole-unit spends). It
  never touches the village pantry. The commit line's "eat from your
  stores" (titans.js, commit-own text) is, in code, the pack, not the
  pantry. That is the blank: the village's stores sit full while the
  march starves.
- The trust drain is BINARY: if `got < need` — even 130 of 9,000 kcal
  (97338 d114) — the hungry line fires and EVERY mustered link loses
  2 trust that day (one history entry per link per hunger day). A
  partial feed buys zero trust. A full feed buys the whole day.
- The drain is per-link trust only. It does not touch the muster list,
  the gate, or any blade. Night strikes (−5, `titanEscalate`, every
  5 days while the titan stands unanswered) are a SEPARATE bleed and
  continue whether the muster is fed or not.
- Carry capacity (`carryCapacity`, game.js) is 20 kg base (+ abilities /
  gear / strength). Packing a full day's need is a weight question the
  pilot measures, not an assumed pass.
- The only player verb that moves pantry food into the pack is
  `takeFromPantryBulk` (game.js). It has NO tile gate in the code read
  (only an exile `havenStoresAccess` check) — so a marching scholar
  can pack from it mechanically. That remote-packing fiction is a
  DISCLOSED instrument limit of this policy arm: the arm measures
  "if the march were fed, does trust hold?", not "could a marching
  scholar physically haul it". A real fix would draw upkeep from
  village stores directly — a game-code change, NOT proposed here.

## Baseline (prior arm's records, NOT re-judged here)

From evidence/2026-11-02/perseed-closedecay-a (closecommit):

- 97330: call d97 (gate 11), first MUSTER-GATE attempts d110 (×12, all
  refused, gate 8), village-lost d122. Hungry lines d98–d122 (25 days),
  0 kcal fed every day. Allied trust at contact d110: Emberhold 65
  (call day 96), Stonebridge 51 (call day 92) → mean 58.0 over the two
  called allies with an active link row that day. Thornfield's link row
  is absent from d107 (its 2 blades still march; its link is inactive
  — arrears 2250 appear d106). Pantry at contact d110: 3,200 kcal,
  against an 11,000 kcal/day need.
- 97338: call d113 (gate 9, already short), attempts d118 (×6, gate 6),
  village-lost d122. Hungry lines d114–d122 (9 days). Allied trust at
  contact d118: Thornfield 85 (call day 96) → mean 85.0. Pantry at
  contact d118: 0 kcal, against a 9,000 kcal/day need.
- Expected under feeding: gate at contact UNCHANGED (list fixed at
  call; 97330 gate 8, 97338 gate 6), fights 0. Any gate movement would
  be a surprise to investigate, not a fed-march effect to claim.

## Policy arm (built BEFORE judged sims, after this prereg)

scripts/policies/musterfed.js — `withMusterFed`, wrapping the
closecommit stack (titanroute + musterclose + mustergap commit-own)
unchanged. Each daily, after the base stack, while a muster stands
(call record heard, allies present, titan not slain, game not over):
pack finished food from the village pantry into the scholar's pack up
to the NEXT dawn's need — need = (muster.allies.length + distinct
muster.haven vids excluding the bearer) × 1000, minus finished food
already in the pack (`playerPackKcal`). Selection is deterministic
(largest kcalEach first, pantry-index tiebreak — no RNG of its own).
It records every pack in ctx.musterfed: day, blades, need, pack
before/after, packed kcal, shortfall.

PERCEPTION LAW: the leg decides only from the call record
(ctx.titan.called), its OWN muster record
(Game.titanMusterState('herald')), its own slain flag, and the pack
verb — no monster roster, no allied roster, no link-list reads
(trust/opinion/arrears are NEVER read by the policy; the driver
instrument reads them for measurement, as in the closedecay driver).
The policy reads the pantry only as the packing source (the village's
own stores, via the game's own verb) — that read is the experiment,
not a decision feed. The proof test asserts the banned reads absent.

KNOWN CONFOUNDS, stated up front: (a) the pantry rarely holds a full
day's need at contact (3,200 / 0 kcal above) and also feeds the
village, so full feeds may be rare — the pilot measures the fed-day
fraction, and a low fraction predicts a miss; (b) `takeFromPantryBulk`
can trip the fair-share / theft-confrontation bars (Haven-internal
trust, not allied trust) and consumes RNG when witnesses are present
and bars trip, so fed trajectories may diverge from baseline in
contact day and deaths — that divergence is reported, not hidden;
(c) the scholar's own eating happens in the base daily BEFORE this
leg packs, so packed food survives to the next dawn unless sleep
metabolism spends it — the hungry lines (got vs need) will show
whether it does.

## Primary metric (pre-registered, binds this arm)

Mean allied trust at contact day, across the called allies (villages
with muster blades), reported per ally. Contact day = the run's own
first MUSTER-GATE attempt day. The mean is taken over called allies
with an active link row that day (driver instrument); allies whose
link row is absent are listed, not silently dropped from the report.

## GO threshold (pre-registered)

GO ONLY IF, on BOTH seeds 97330 and 97338, the fed-march policy keeps
mean allied trust at contact day at least 20 points above the
closecommit baseline mean on the same seed (97330: ≥ 78.0 vs 58.0;
97338: ≥ 105.0 vs 85.0), AND the fed run's village-lost day is no
earlier than baseline (d122 on both seeds).

ARITHMETIC BOUND, stated before the sims (not a re-score): the bar
is reachable by hunger removal alone on 97330 (13 hunger days × −2
= −26 of the −31 call-to-contact fall; a fully fed march could in
principle recover ≈ +26) but NOT on 97338 (5 hunger days × −2 = −10
of the −11 fall; call-day trust is 96, so even a perfectly fed march
with zero strikes lands ≈ 95–96, i.e. ≈ +10–11 over baseline — the
+20 bar needs 105, above the call-day level, which no feeding
mechanism can produce). The bar stands as assigned and the verdict
is judged against it; if the fed run lands at the arithmetic ceiling
on 97338, that is reported as a ceiling-limited NO-GO with the
numbers, not as a policy failure — and any fed trust ABOVE the
call-day level would be a surprise gain mechanism to investigate, not
a number to bank silently.

A miss on either seed is NO-GO. A miss is never re-scored against a
friendlier metric mid-run (no "trust at call + 5 days", no
"per-link best case", no pooling across seeds). Metric doubts go
under "metric review" in the evidence file, for the NEXT run.

## Secondary metrics (reported, never used to rescue a miss)

Arrears presence at contact; gate at contact (expected unchanged —
the list is fixed at call; say so plainly if so); fights (expected
0); end day / end reason; hungry-line count and got-vs-need series;
fed-day fraction (days the pack covered full need at dawn); packed
kcal vs need per day; pantry kcal at contact; day-matched trust
series (fed trust on the BASELINE contact day, in case contact days
diverge).

## Seeds, horizon, pilot gate

- Seeds 97330 and 97338 first, 180d, death-aware (driver cap; run ends
  early on village-lost / win as the harness reports).
- The two known seeds ARE the pilot. First reproduce the closecommit
  baseline trust series on both seeds with the new driver (gate series
  + contact-day trust must match the closedecay records above);
  then run the fed policy on the same seeds.
- If the fed policy shows NO trust movement on either known seed,
  KILL it (NO-GO) — do not spend confirm seeds on an invisible
  effect. If it moves trust on both, up to 8 pilot-screen seeds for
  additional muster-call cases may be run using the prior arm's
  driver pattern — ONLY if muster-call seeds can be found cheaply;
  do not burn the run hunting rare seeds.
- Zero src/js changes. Policy/instrument only.

## What a GO does and does not mean (stated BEFORE the sims)

A GO here preserves coalition trust for the NEXT call — it does NOT
by itself close the muster gap (the gate is fixed at call; feeding
cannot add blades, cannot restore the succession-eaten Haven blades,
and cannot lift 97338's ceiling of 9 above the 10-blade gate). It must
not be reported as closing the gap. The gap's closers remain the
succession question (Steve-call candidate in closedecay evidence)
and the call-day ceiling, neither of which this arm touches.

## SENSE-TESTING LAW

Read at least one transcript passage around muster hunger / trust
loss on the baseline, and the corresponding passage on the fed run,
and judge whether the fiction reads sensibly: does the village
experience the hunger, or is it a silent number? Does a fed march
read as provisioned, or does the packing line sit oddly against the
march fiction?

## Canon

docs/CANON.md read first. NO canon doc covers the titan muster, the
Herald, musters, or upkeep (the manifest lists no titan doc;
MONSTER-WAVES.md covers wave law, not muster accounting) — the gate
and upkeep math above is read from src/js/titans.js and
src/js/game.js, stated as code-read, not invented canon.

## Metric review (for the NEXT run, not this verdict)

To be filled at closeout.
