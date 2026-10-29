# sim-woodcarry-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-woodcarry-b, axis
food-economy (daytime wood-carrying precondition lever).
Worktree sim-woodcarry-b. POLICY-SIDE LEVER ONLY: zero
src/js changes, zero default flips. This worker does NOT
merge to master — coordinator merges.

## Background (read before judging — verdicts NOT re-litigated)

- evidence/2026-10-29/sim-creekremedy-b.md +
  sim-creekremedy-b-prereg.md (DIAG-GO, on master): a
  bridge EXISTS (Game.buildBridge: 4 player-carried wood,
  60 kcal, 96 ticks, no gate) and no ford mechanic
  exists. On 11 creek-refused evenings bridge-feasible
  was 0/11, wood-short 11/11 (0 logs on hand every
  evening; haven pile 21–69 logs, median 25); kcal
  never solely binding (wood-alone fix 6/11, kcal-alone
  0/11); time never binds (107–255 ticks vs 96-tick
  build). The named next lever is the daytime
  wood-carrying precondition. This arm builds and
  measures exactly that lever, under this prereg.
- Backlog item 1422 (goal hidden_files/sim-findings.md)
  is marked claimed for this arm.
- Prior arms NOT re-measured here: detour (route-around
  walk home) stays OFF in both legs (all separation
  gates unset/0, same as creekremedy); clearhabit
  policy is deleted from this tree. Route-around
  existence is recorded per creek evening for CONTEXT
  ONLY, never pooled into rescue.

## Canon + code FIRST (the lever comes from here, never from wishes)

Read first: docs/CANON.md (manifest), docs/MAP.md §1/§6
(creeks, the way home). No canon doc covers a
wood-carry habit as a system; the authority is the
engine itself (src/js/game.js), verified by grep
before this prereg was written:

- TAKE (pile -> pack): Game.takeWood() — takes
  min(4, pile) logs, 2 ticks, no kcal, weight-checked
  via canCarry (2 kg per log). It takes a FIXED
  amount (up to 4), not a requested deficit, so the
  lever's carry performs the SAME honest transaction
  for exactly the deficit (pile -= deficit,
  addWood(deficit), say line, tickAction(2)) when
  the villager already carries some wood. The
  transaction is identical in kind to takeWood; only
  the amount is deficit-sized so the pack never
  exceeds the bridge cost through this lever.
- BRIDGE: Game.buildBridge(x, y) — 4 wood from the
  PLAYER's inventory, 60 kcal (clamped at 0, not
  refused), 96 ticks, no knowledge/skill/occupation
  gate. Refuses when dead, mid-fight, already
  bridged, or no gap to span. Permanent until a
  storm smashes it.
- CREEK BLOCKAGE: Game.travelBlockage refuses a
  needsBridge, unbridged creek tile to anyone
  without the swimmer skill. Game.clearBlockage
  refuses it by hand.
- FORD: MECHANIC ABSENT (creekremedy finding, kept).
  No ford share is reported anywhere in this run.
- PILE FLOOR ANCHOR: scripts/policies/competent.js
  assigns a wood-duty villager when the pile falls
  below 8. The lever's pile floor is therefore 8:
  the carry never takes the pile below 8, so the
  hearth's reserve logic is never tripped by the
  lever itself.

## The lever (policy-side, default-OFF, WOODCARRY=1)

A wrapper around nighttravel (scripts/policies/
woodcarry.js), two steps, both policy-side:

1. MORNING CARRY (pre-competent.daily, each loop-day,
   only when the player starts the day at haven —
   inside true, or tile 'haven' outside — not dead,
   not in combat): if player wood < 4 AND pile minus
   deficit >= 8 (PILE_FLOOR) AND morning kcal >= 60
   (KCAL_FLOOR — the bridge's own cost: below it the
   morning is a food emergency and competent.daily's
   food-seeking takes priority) AND canCarry(deficit
   * 2), take exactly deficit = 4 - wood logs from
   the pile into the pack (pile -= deficit,
   addWood(deficit), one honest say line, tickAction
   (2)). Recorded per carry (loop-day, wood before/
   after, pile before/after, kcal, skipped reason
   when any gate fails).
   CUT-SITE CARRY IS OUT OF SCOPE for this arm:
   pile-carry only. If the pile floor blocks carries
   on some seed, that is a finding, not a mid-run
   scope change.
2. EVENING BRIDGE (post-nighttravel.daily, only when
   the night step recorded travel-refused with
   hopReturnKind block:creek): classify the refusal
   from the refusal-time state (reusing
   creekremedy-diag's pure classifyRefusedEvening /
   bucketOf — pure reads, no RNG, no game writes).
   If classified creek AND wood >= 4 AND evening
   kcal >= 60 (pay in full, same reading as
   creekremedy feasibility) AND ticks-to-day-end
   >= 96 (the build fits inside the day; a rolling
   build mid-night-step is refused by the lever,
   not the engine) AND the probe tile carries
   needsBridge true and bridged false AND not dead
   AND not in combat, call Game.buildBridge(tile).
   If bridged, retry Game.travelTo(haven) once; if
   arrived at the haven node, delegate to
   insideevening's eveningStep for the lodge leg,
   exactly as nighttravel delegates after a hop.
   Recorded per evening (classification, attempt
   made/skipped + reason, build result, retry hop
   result, entry outcome, final position).
   If the evening is STILL refused after any
   attempt (or no attempt was made), the wrapper
   says ONE honest line naming what is lacking
   (wood deficit, kcal shortfall, ticks, or the
   build's own refusal) — the narration gap
   creekremedy documented. The line fires only on
   the ON leg; the OFF leg keeps the engine's
   silent line, so OFF-vs-ON tails differ only by
   lever lines, which is intended.

The wrapper NEVER touches src/js, NEVER writes
game state except through the engine verbs above
(take/addWood, buildBridge, travelTo, eveningStep),
and draws NO RNG itself (carry, classification,
bridge, and retry draw none; a retry hop's arrival
may run the engine's own encounter checks, exactly
as nighttravel's hop does — that is downstream of
the lever, not an instrument draw).

## Corpus (pilot band, no re-scan)

Pilot 8 seeds: 11636, 11707, 12027 (creekremedy
band) + 11626, 11639, 11654, 11697, 11714 (remaining
clearhabit pilot seeds, ascending). These are
already-run seeds; no fresh band is scanned for the
pilot.

FALLBACK (bounded, pre-authorized): if the pilot
ON leg yields creek n < 8, extend in ascending seed
order with the remaining clearhabit pilot seed
(11728) and then ascending fresh seeds (11729,
11730, ...) until creek n >= 8 or 4 extension seeds
are exhausted, then INSUFFICIENT-DATA. No other
extension is authorized by this prereg.

CONFIRM (only on pilot GO): 16 seeds = pilot 8 +
11728, 11729, 11730, 11731, 11732, 11733, 11734,
11735. Confirm judges the pooled confirm-leg share
(see below); a confirm share below the bar means
the pilot GO does not land (NO-GO on confirm, not
a re-score of the pilot).

## Legs

Fresh legs, detour OFF, clearhabit deleted, all
separation gates unset/0 (COMPETENT_EVENING_DETOUR,
COMPETENT_STANDING_HOME, COMPETENT_ROUTE_AROUND,
COMPETENT_TRIPHOME_ROUTE_AROUND), substrate
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1, DAYS=30, TAPDAYS=5, same driver
shape as creekremedy-trace-b (thief tap retained
for substrate identity, never judged):

- OFF leg: WOODCARRY=0 -> wrapper delegates (no
  carry, no bridge, no narration line) but STILL
  classifies refused evenings (pure reads, the
  creekremedy recorder's proven non-perturbation),
  corpus sim-woodcarry-b-corpus-off/.
- ON leg: WOODCARRY=1 -> full lever, corpus
  sim-woodcarry-b-corpus-on/.
- The driver records per loop-day the morning
  position, the evening position, the evening say
  tail, and ctx._wcLast (the wrapper's record).

## Classification (per travel-refused evening, both legs)

Identical to creekremedy: CREEK evening = outcome
travel-refused AND hopReturnKind block:creek AND
recorder probe finds blockType creek on the SAME
tile type AND no probe/route error. OTHER-REFUSED
= travel-refused with a non-creek hop type
(context count only, never in the creek
denominator). UNCLASSIFIED = hop says creek but
the probe disagrees or errors. Unclassified
evenings break GO (see below) — never papered
over.

RESCUED (ON leg only): a creek evening whose
post-daily driver position is at the haven node
(mapPx/Py == haven hx/hy), whether inside (lodge
leg completed) or outside at haven (entry failed
but the night is spent at haven). Inside vs
outside-at-haven is reported as a split. A creek
evening that ends away is NOT rescued, whatever
the bridge did (e.g. bridged but retry refused).

## Primary metric, GO bar, guards (judge ONLY against these)

PRIMARY (ON-leg creek-evening rescue share):
(rescued creek evenings on the ON leg) / (all creek
evenings on the ON leg). Reported with exact counts
and a Wilson 95% interval.

- GO requires ALL of:
  (a) ON-leg creek n >= 8;
  (b) rescue share >= 0.50;
  (c) unclassified == 0 on BOTH legs;
  (d) recorder/classifier errs == 0 on both legs;
  (e) determinism re-run byte-identical for one
      ON seed;
  (f) DIVERGENCE AUDIT: for each seed, the first
      loop-day on which the OFF and ON evening-row
      sequences differ (excluding wc-record fields)
      is on or after that seed's first lever-action
      loop-day (carry, bridge, or narration line) —
      no spooky divergence before the lever acts;
  (g) STARVATION GUARD: pooled ON-leg player deaths
      <= pooled OFF-leg player deaths + 1 (one-death
      noise tolerance), with causes listed; any ON
      death causally traced to the carry (kcal
      diverted — the carry costs 0 kcal — pile
      starved below the hearth floor, or overload)
      fails the guard regardless of the count;
  (h) every still-refused ON-leg creek evening's
      say tail carries the lever's lacking-line
      (honesty guard — the narration gap is closed
      on the lever leg, not just measured).
- GO (pilot) -> confirm 16 seeds; GO (confirm,
  pooled confirm share >= 0.50 + guards (c)-(h)
  re-checked on the confirm legs) -> LAND the
  policy lever (default-OFF, no driver adopts it
  by default) + evidence + corpora. NO src/js
  change, NO default flip.
- killed-at-pilot: pilot share < 0.50 OR pilot
  creek n < 8 after the fallback OR any guard
  (c)-(h) failing on instrument grounds where the
  failure is the instrument's, not the game's.
  Killed arms leave no trace: the policy file is
  reverted (not committed), corpora + evidence
  still land as the kill record.
- NO-GO: pilot GO but confirm pooled share < 0.50
  or a confirm guard fails on game grounds (the
  lever does not hold at confirm scale).
- INSUFFICIENT-DATA: creek n < 8 after the
  fallback, or a GO condition failing on
  instrument grounds where the failure is the
  instrument's, not the game's. The verdict names
  which condition failed.
- A miss is never re-scored: the denominator stays
  ALL ON-leg creek evenings (never feasible-only,
  never first-evening-only, never rescued-episode-
  only). The episode-level rescue rate (episodes
  rescued / episodes) is SECONDARY — reported
  because bridging collapses episodes, but never
  substituted for the primary share.

## Secondary (reported, never judged)

- Per-seed creek counts (OFF and ON), carry counts
  + skipped reasons (pile floor, kcal floor,
  canCarry, not-at-haven), bridge attempts +
  outcomes + skipped reasons, floor-feasible share
  (kcal-60 >= 200) on ON creek evenings, route-
  around lengths (context only), dayTicks /
  rollsDay flags, other-refused counts.
- Episode view: per seed, creek episodes (maximal
  runs of consecutive refused loop-days) on each
  leg, and whether each ON episode's first refused
  evening was rescued.
- Cross-check vs creekremedy: OFF-leg creek counts
  per seed vs creekremedy ON-leg counts (11636: 6,
  11707: 5, 12027: 0). Divergence is reported and
  explained (same-base control vs prior run's base
  drift, per creekremedy's metric review), never
  hidden.
- Wall numbers: NOT OBSERVABLE on 30-day evening
  legs (pre-seat). National / table / wins are
  reported as NOT OBSERVABLE, never claimed.
- Balanced panel (MEASUREMENT.md §15 — explicit,
  not a fake): NO balance-panel compare .md is
  produced, as pre-registered here before judging:
  this leg is a 30-day position measurement of a
  POLICY-SIDE lever — zero src/js changes, so
  there is no game-root delta for a panel to
  compare, and the panel's registry policies do
  not include the nighttravel trace policy. The
  divergence audit + determinism re-run are the
  instrument-perturbation proofs, and the
  pre-registered GO bar above is the judge. If a
  future bridge lever becomes a game change, a
  panel compare is run at that point.

## Horizon + why (death-aware, never a fixed 200d)

30 loop-days, same as the creekremedy / detour /
clearhabit legs: the refused pattern is visible
inside 30 days (prior episodes run 1–10 evenings
within 30 days). Dead villages stop simulating
(runDays endReason); the +10d tail is a cap, not
a target.

## Sense-testing (mandatory, in the evidence file)

Read at least one played transcript end to end
from the ON corpus say tails: a carried-log
evening must read as a person preparing (morning
take line, evening bridge line, arrival home),
not a teleporting inventory trick; a
still-refused evening must name the lacking
logs (or kcal/ticks) in its own tail. Judge
meaning, not counts.

## Village assessment (mandatory, in the evidence file)

Plain words: what the village looked like, who
thrived and who died and why, what
knowledge/capabilities were missing, which blank
was filled (this lever, if GO) or documented.
Plus wall numbers (NOT OBSERVABLE — stated, not
claimed).

## Metric review (prereg — doubts carried into the run)

- Collapse: bridging is permanent, so a rescued
  episode contributes only its first evening to the
  ON-leg denominator while an unrescued episode
  contributes every evening. The primary share
  therefore REWARDS fast rescue (small denominator)
  and PUNISHES slow rescue (large denominator) —
  that incentive is intended, but it means the
  share is not comparable to creekremedy's 0/11
  feasibility share as a like-for-like rate. The
  episode-level secondary rate is the bridge
  between the two views; if the primary share
  proves misleading at pilot scale, propose the
  revision for the NEXT run, never re-score
  mid-run.
- Kcal floor on a free action: the carry costs 0
  kcal, so the 60-kcal morning floor is a judgment
  gate (food emergency first), not a cost gate. If
  the floor blocks carries often at pilot, the
  NEXT run's prereg should reconsider it (a
  morning floor near 0 costs nothing and can only
  gain rescues) — but this run judges with the
  floor as written.
- Ticks gate: the 96-tick evening gate is a lever
  safety rule (no rolling build mid-night-step),
  not an engine rule. If it skips bridges often,
  that is a finding for the next lever iteration,
  not a re-score here.
- If the metric proves wrong (e.g. the probe's
  first-blockage order diverges from the hop
  refusal on a judged seed), write it under
  "metric review" in the evidence file and propose
  the revision for the NEXT run — never re-score
  mid-run.

## Landing rule

- GO (confirm): land scripts/policies/woodcarry.js
  (default-OFF, WOODCARRY=1 to enable) + trace /
  analyzer / proof instruments + evidence +
  corpora. NO src/js change, NO policy lever
  adopted by any driver by default, NO default
  flip.
- killed-at-pilot / NO-GO / INSUFFICIENT-DATA:
  land the kill/NO-GO record (evidence + corpora +
  proof of the kill) but REVERT the policy file —
  killed arms leave no trace in scripts/policies/.
- This worker does NOT merge to master —
  coordinator merges. Report 'committed, pending
  coordinator merge' with the verdict, the rescue
  share + guards, and the evidence paths.
