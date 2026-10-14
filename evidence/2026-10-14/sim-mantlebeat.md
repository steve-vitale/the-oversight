# sim-mantlebeat — ARM 2 "mantlebeat" (scale-onramp, mortality-wall lens)

## Pre-registration (written before the measurement sweep)

- **Question** (sim-findings #38/#45, open design question for Steve): when the
  scholar dies in a lost fight, the successor wakes at Haven — but the policy
  marches them back out the same day, and the same lost fight can kill a
  second scholar before nightfall (winseek s11: days 9/22/33 each killed two;
  11/16 wall-suite runs had same-day multiples). This arm MEASURES a
  policy-side repositioning beat; it does NOT decide the engine design.
- **Lever**: `scripts/policies/mantlebeat.js` (DELETED per kill protocol —
  kept out of the tree; proof/sweep/evidence retained) — opt-in
  `MANTLEBEAT=1` layer on leadcourt/belongseek. On succession day: rest day
  at home (honest eat, bury predecessor if corpse on node, no
  travel/hunting/proposals); if a turn-based fight is active that day,
  disengage via barrier exit (nearest viable edge, one honest step/turn).
  Honest verbs only — no teleport, no free healing, no free knowledge. Gate
  off = pure delegation (proven byte-identical,
  scripts/test-mantlebeat-20261014.js ALL GREEN: RED 30d x 2 seeds
  telemetry-identical; GREEN real-succession rest-day fires, no travel, no
  free heal, successor at haven; gate-off control delegates).
- **Primary metric**: fraction of runs with >=1 same-day multi-scholar-death
  day (player:true death records sharing a game day).
- **GO**: arm <= 0.6 x baseline (">=40% reduction"), pooled 16 runs/side
  (8 seeds x leadcourt/belongseek), identical seeds before/after.
- **Guardrails**: median survival no worse than -10d vs baseline (per policy
  and pooled); wall metrics (national/table/wins) no regression.
- **Horizon**: 180d death-aware (dead villages stop simulating).
- **Seeds**: 11/22/33/44/55/66/77/88 x leadcourt/belongseek.
- **Secondary**: multi-death days per 100 run-days (exposure-adjusted);
  scholarDeaths; rest days / flees / burials fired.
- **Metric binding** (MEASUREMENT.md section 14): the above binds. A miss is
  NO-GO, never re-scored mid-run. Metric doubts go under "metric review".

## Canon note

No canon doc covers succession jeopardy (canon manifest checked
2026-10-14). Nothing here invents canon. The engine design question —
whether the mantle should grant a repositioning beat — remains Steve's call.

## Lever played

Built the layer, proved it (RED byte-identical gate-off, GREEN real
succession -> rest day with honest verbs), then ran the 16v16 sweep itself:
baseline = raw leadcourt/belongseek (MANTLEBEAT unset), arm = wrapped with
MANTLEBEAT=1, seeds 11/22/33/44/55/66/77/88, 180d death-aware. 32 runs,
~4 min compute. Raw output: evidence/2026-10-14/sweep-mantlebeat-full.json
(+ .log). Sweep script: scripts/sweep-mantlebeat.js (requires the deleted
policy file — the JSON is the durable record). Proof:
scripts/test-mantlebeat-20261014.js.

Two implementation fixes landed during probing (both re-proven GREEN):
1. The succession-day flee first tried a full-path tbPlayerMove from
   mid-grid — silently refused (move budget), scholar stood still taking
   hits. Fixed to one honest step/turn toward the nearest edge (competent's
   own flee pattern).
2. checkSuccession initially counted successions with the gate off — gate
   off is now zero footprint (pure delegation).

## Before/after numbers

| | base (16) | arm (16) |
|---|---|---|
| runs w/ same-day multi-death (PRIMARY) | 5/16 | 9/16 |
| multi-death days per 100 run-days | 0.40 | 1.06 |
| scholar deaths (total) | 33 | 59 |
| scholar deaths per 100 run-days | 2.64 | 5.22 |
| median survival | 72d | 67d |
| max survival | 180d | 140d |
| national reach | 6/16 | 6/16 |
| table / wins | 0 / 0 | 0 / 0 |
| max wave | 4 | 4 |
| rest days fired (arm only) | — | 60 |

Per policy: leadcourt 2/8 -> 5/8 same-day-multi runs (medD 83 -> 93);
belongseek 3/8 -> 4/8 (medD 72 -> 67). GO needed arm <= 3/16 pooled.
**GO MISSED — NO-GO. Arm KILLED at pilot.** Guardrails technically pass
(median -5d, national/table/wins no regression), but the primary metric
failed outright and the arm doubles the scholar death rate.

## Why it failed (mechanism, probed)

The one-day beat cannot work because the threat model is wrong:

1. **Same-day doubles happen before the policy ever acts.** Successions fire
   during the driver's day-parts (inDaily=0 in every probe), not inside
   policy.daily. The successor wakes at Haven and is attacked there during
   the wait parts — the only defense is the fight-hook flee.
2. **The killer comes to Haven.** Seed 22 d102: the same monster (m_0) that
   killed the old scholar at the haven node re-engaged the successor INSIDE
   Haven (insideHaven=true) the same day. The "repositioning" keeps the
   successor at exactly the threat's location.
3. **Forced flight is ineffective and plausibly worse than fighting.** The
   flee fired 37 times on seed 11 yet three scholars died on day 18 anyway —
   walking one step/turn to the edge while taking ~30/round from a strong
   monster is death by a thousand cuts. The base policy at full HP would
   have fought back; the layer forced flight.
4. **One day doesn't break chains.** Seed 22: deaths d91 -> d92 -> d93, each
   with a rest day between — the next day's base daily walks the new scholar
   back into the same threat. Seed 44 leadcourt: doubles on d75 AND d76.

The policy-side beat fails because the successor wakes INTO the threat with
nowhere safer to go. Real repositioning needs engine support (sanctuary
semantics, or the successor not waking at ground zero) — which is precisely
the open design question (#38/#45), still Steve's call.

## Village assessment

Thirty-two villages, all courtship-road (leadcourt/belongseek), all ended
village-lost except one baseline belongseek run that survived the full 180d
(seed 44). Median life ~70 days; the wall numbers didn't move (national
6/16 both sides, table 0, wins 0, max wave 4).

Who died and why: scholars died overwhelmingly to combat (26 base / 46 arm),
then contests, starvation, expeditions, one lockjaw. The arm's villages are
graveyards of chained successions: seed 11 lost three scholars on day 18
alone to the same threat; seed 22 lost scholars on four consecutive combat
days (91-93) plus a same-day double on 102. The villages that lived longest
(belongseek 44, 180d base / 140d arm) reached national and wave 4 — the
courtship road works when the early combat lottery doesn't chain.

Villagers acted like people throughout (grief lines, vouching at graves,
"you're not her" beats — see sense-test). No robotic behavior flagged on
this road; the pathology is entirely the succession combat chain.

## Sense-test: succession transcript (seed 22, leadcourt+mb, day 8)

Read for meaning — it holds up:

- "Toad's Lunge hits you for 9. / You go down." — Casey Castillo dies to a
  belltoad chorus (telegraphs fire: "Another throat swells — the CHORUS
  takes it!").
- "The Codex turns a page on its own. Casey Castillo is dead. You didn't
  ask. It knew." — the Codex's death-sense precedes the village
  announcement. Coherent.
- "🕯️ Casey Castillo is dead — combat. The village stops. Somebody screams.
  Somebody else starts digging."
- "The Codex doesn't pause for grief. Caitriona blinks — and it's already
  there, overlaying everything, syncing. No pen. No paper. The mantle
  just... transfers." — integration-stage-appropriate metaphor (digital
  sync, not the pre-System journal). Canon-honest.
- "🌟 'MANTLE TRANSFER DETECTED. ...Oh! New face! Same job!'" — the System's
  unhinged voice, in character.
- "📖 The Codex turns a page: Casey Castillo, 8 days. The mantle passes to
  Caitriona O'Keeffe."
- "Caitriona stays by the fire today. The village grieves; the Codex waits."
  — the rest-day beat, in fiction.
- Then the rest-day eat: "Took Dried beans. The Dried beans was off. Your
  stomach knots. (-5 health)." ×3 — the successor eats SPOILED pantry beans
  three times. This mirrors the base policy's pantry loop exactly
  (competentEat doesn't check spoilage either) — logged as a finding, not
  this arm's bug, and deliberately NOT "fixed" in the rest-day eat (that
  would give the arm an unmeasured advantage over baseline).

## Blanks filled / documented

- FILLED: the measurement itself — a policy-side repositioning beat was
  built, proven honest (RED byte-identical, GREEN real succession), and
  measured 16v16. Verdict: it does not reduce same-day multi-deaths; it
  increases scholar mortality. The design question stays open for Steve,
  now with evidence that a policy-side beat is the wrong layer.
- DOCUMENTED (appended to sim-findings.md): (a) killer re-engages the
  successor inside Haven — sanctuary semantics are a design question;
  (b) forced flee vs fight-back tradeoff unmeasured; (c) policy pantry loop
  eats spoiled food without checking (base behavior, all competent-family
  policies); (d) consecutive-day succession chains need their own metric.

## Metric review

The primary metric (same-day multi-death RUNS) behaved as pre-registered
and the miss is unambiguous — no re-scoring. Two observations for the NEXT
run's metric design (not this one): (1) the run-count metric confounds with
survival — the exposure-adjusted rate (multi-death days per 100 run-days:
0.40 -> 1.06) told the same story here, but on a closer run it would be
the fairer primary; (2) the metric misses consecutive-day chains (d91-93,
d75-76), which are the same pathology wearing a different clock — a future
arm should count "succession within 48h of a combat succession" as the
chain metric.

## Convergence

scale-onramp stays the blocking axis. This arm attacked the mortality wall
under it and was killed at pilot: the repositioning-beat hypothesis is
closed at the policy layer. The engine-side question (#38/#45) remains open
for Steve's design call.
