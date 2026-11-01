# sim-supplyleg-b — DIAG: which supply leg feeds the pantry on fresh seeds

Run: oversight-flesh-out-loop-b, arm sim-supplyleg-b. Worktree
sim-supplyleg-b, branch sim-supplyleg-b. Answers backlog item
SUPPLY-LEG LEVER UNMEASURED ON FRESH SEEDS: seed 17549's story
(sim-death17549-b) was expedition-lumpy, but that was ONE seed.
DIAG ONLY: zero src/js changes, zero policy-default flips, zero edits
to any existing policy file or existing script. New files only: prereg,
supplyleg trace driver, supplyleg analyzer, pure proof test, evidence,
censuses/corpora. The absencehunt trace driver, the
split-absencehunt-jsonl splitter, and sim-harness are REUSED VERBATIM.
This worker does NOT push, bump, verify live, or merge into master; the
coordinator merges. Status to coordinator: committed on branch, pending
coordinator merge.

## Verdict: GO — judged exactly against the prereg bars

Prereg: evidence/2026-11-01/sim-supplyleg-b-prereg.md, commit 059cb30ac,
written BEFORE any judged leg. Its three bars, all met:
(a) COMPLETE TABLE ON 8 SEEDS — every logged event in exactly one
    bucket, shares summing to 100% per seed (analyzer enforces it).
(b) VERDICT BY THE DOMINANCE RULE — meal-surplus is DOMINANT: highest
    mean supply-leg share (71.7%), top supply leg on 8/8 seeds, mean
    >= 35%. Rule applied as written, never adjusted to fit the numbers.
(c) SENSE PASS — one dying seed and one surviving seed read end to end
    (below); the numbers rhyme with what the villagers say and do.

GO here is still DIAG: it authorizes NO src/js fix and NO default
change. What it delivers is the fresh-seed answer to the backlog
question: the live lever is NOT expeditions. It is the daily
meal-sharing funnel.

## The answer in one paragraph

On fresh seeds under competent play, the pantry is fed by villagers
eating first and sharing what is left over. Meal-surplus — a villager's
own daily production, minus what they eat themselves, shared into the
pantry scaled by trust — is 71.7% of all gross pantry inflow on
average, and the top leg on all 8 seeds (lowest seed: 42.8%). NPC
forage deposits are second at 16.6%. Expeditions — the leg that
dominated seed 17549's story — average 6.4% and are ZERO on three of
eight seeds. Fish (1.6%), traps (0.6%), garden (0.6%), scholar donations
(0.1%), contest prizes (0.8%), and processing (0.0%) are all marginal.
Scholar unload is exactly 0.0% on every seed: under competent play the
scholar is out wild all month and never comes home to pool a pack, so
the scholar leg cannot be the lever in this window. The 17549
expedition lump does not generalize; it was a single-seed story about a
village whose daily funnel had already failed.

## Per-leg kcal shares (30d competent window, seeds 51101–51108)

Shares are shares of GROSS logged pantry inflow per seed. Totals are
gross inflow kcal over the seed's lived window (seed 51101 died day 25;
all others survived 30 days).

| seed | total kcal | exped. | npc-forage | meal-surplus | fish | traps | garden | other-supply | scholar-donate | contest | scholar-unload |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 51101 (died d25) | 39,683 | 17.3 | 35.9 | 42.8 | 0.0 | 1.4 | 0.0 | 2.5 | 0.0 | 0.0 | 0.0 |
| 51102 | 58,042 | 7.1 | 20.3 | 68.6 | 0.0 | 0.0 | 2.3 | 0.7 | 0.0 | 1.0 | 0.0 |
| 51103 | 74,616 | 15.3 | 12.0 | 71.6 | 0.7 | 0.0 | 0.0 | 0.4 | 0.0 | 0.0 | 0.0 |
| 51104 | 87,306 | 11.0 | 9.1 | 77.0 | 0.0 | 1.9 | 0.0 | 0.3 | 0.0 | 0.7 | 0.0 |
| 51105 | 90,564 | 0.0 | 12.0 | 85.5 | 0.0 | 0.9 | 0.0 | 0.3 | 0.7 | 0.7 | 0.0 |
| 51106 | 50,934 | 0.0 | 12.8 | 76.2 | 7.7 | 0.0 | 2.2 | 0.8 | 0.4 | 0.0 | 0.0 |
| 51107 | 51,202 | 0.8 | 19.6 | 66.0 | 4.2 | 0.0 | 0.0 | 7.0 | 0.0 | 2.3 | 0.0 |
| 51108 | 87,504 | 0.0 | 11.5 | 86.2 | 0.0 | 0.6 | 0.0 | 0.3 | 0.0 | 1.4 | 0.0 |
| MEAN | — | 6.4 | 16.6 | 71.7 | 1.6 | 0.6 | 0.6 | 1.6 | 0.1 | 0.8 | 0.0 |

Also zero on every seed: favor-delivery, tribute, direct-other (after
the transform correction below), processing. Scholar-side combined
(unload + donate) is 0.0–0.7% per seed. Zero-kcal unknown-flesh items
arrived on 6 seeds (1–12 units) — counted, never in kcal shares.
Full per-seed bucket kcal: evidence/2026-11-01/
sim-supplyleg-b-census.json; per-seed corpora (events + say lines):
evidence/2026-11-01/sim-supplyleg-b-corpus/.

## What meal-surplus actually is (read from the code, not inferred)

villagerMealDay (game.js): each villager produces for the day
(villagerDayProduction), eats their own need FIRST — "THEY FEED
THEMSELVES FIRST: what they catch never sees the pantry" — and the
surplus above need, scaled by a trust factor (20%/50%/80%/100% by trust
band, doubled when the pantry reads under 5,000 kcal), goes to the
pantry through stockSurplus. So the dominant leg is not a place or a
trip: it is the daily sharing funnel on top of ordinary villager
production. NPC-forage deposits (away-return hauls, big days, routine
hauls) are the same villagers' production arriving through a different
door — lump returns instead of daily shares. Together the two
villager-production doors are 88.3% of inflow on average. Expeditions,
fish, traps, and garden are garnish in this window, not the engine.

## Pilot gates (both passed, before judging)

(1) INSTRUMENT PARITY: on seeds 51101 and 51102, the supplyleg driver's
evening pantry kcal series matches the absencehunt driver's
competent-policy series EXACTLY (same seeds, same env gates, same end
reasons and days-alive). The wrappers + push trap are behavior-neutral.
(2) NONZERO CAPTURE: logged gross inflow > 0 on all 8 seeds (minimum
39,683 kcal). No confirm band was needed: this is a measurement arm,
and the pilot band IS the judged band per the prereg.

## Sense test (SENSE-TESTING LAW: read, don't just count)

Seed 51101 dies the same death as 17549 — three hungry nights, then
"Haven couldn't hold. On the third hungry day, people started walking
— in different directions. The scattering, again." (day 25). Its
transcript shows WHY the funnel failed before the pantry emptied: while
the shelves still read full, surplus is eaten at the fire instead of
banked — "🌿 Leo returns from foraging the wilds: +244 kcal to the
pantry — the shelves are full, so 243 kcal is eaten at the fire
instead" (day 14, and again days 16–17), and "🍽️ Akua carries the day's
surplus to the pantry door, thinks better of it, and turns back to the
fire. 'It'll only rot in there. We eat.'" (day 5, repeated). Fat days
are eaten at the fire, never banked — the same shape death17549 found
under a different policy. The dying seed is also the LEAST
meal-surplus-dominated (42.8%, with npc-forage at 35.9% and expedition
at 17.3%): survivors lean harder on the daily funnel, not on lumps.
That correlation is descriptive, not causal — one dying seed proves
nothing alone — but it rhymes with the mechanism.

Seed 51105 explains the scholar-side zero: its scholar camps wild the
whole month — "You camp wild tonight — no pantry meal. Eat from your
pack" recurs from day 12 on — so no homecoming unload ever fires. Its
only scholar contribution is two tiny donations (Purslane 150 kcal,
Blackberry 455 kcal). A leg that requires the scholar to be home cannot
be live while competent play keeps the scholar away. Two robotic
notes, stated not smoothed: the scholar's "Hunger gnaws. The pack is
thin — work the green, haul it back, get it named at camp. That's the
whole game." repeats verbatim almost daily (a status beat worn thin by
repetition), and the day-18 System stew line ("It replicates your stew
for the whole haven. It added a garnish of pocket lint. It's still 400
kcal. You eat around the lint.") is the kind of alien joke that lands
once and then reads as filler on repeat.

## Attribution limits (honest, per prereg)

- GROSS inflow only: shares describe what ENTERED, not what the
  village ate. A leg can dominate inflow while the village still
  starves on meal timing and spoilage — seed 51101 is exactly that.
- Every kcal-bearing pantry write on this base goes through a wrapped
  method or a pantry push; after the transform correction, direct-other
  is 0.0% on all seeds, so no inflow sits in an unattributed bucket.
- Sleep-phase wrapper events are logged under the last started loopDay;
  day attribution may be off by half a day at most, shares unaffected.
- Single policy (competent) by prereg design: the question was the
  supply shape under competent play. Other policies may shape
  differently — death17549's P1/creekseek band is the standing
  counter-example that policy matters.
- 30-day early window only: garden ripening, regional tribute, and
  late-game legs may matter later; this arm says nothing about them.

## Metric review

CORRECTION (instrument calibration, not a metric change): the first
analyzer run showed direct-other at 13.9% mean (up to 27.3% on a seed).
Stack inspection showed every kcal-bearing direct push came from
resolveOneAssignment (game.js:7229/7264 on this base) — the smoke-racks
duty: a split push plus a same-stack reduction (net zero) and a
convert push plus a same-stack reduction (net kcal-reducing). Grep
confirms those are the ONLY pantry.push sites in that function, so
they are transforms, not inflow. The prereg defines transform-skip by
mechanism ("smoking splits/converts in place; net-zero, NOT inflow");
the keyword-only regex (/smoke|preserve|rack/) missed them because the
stacks carry the duty name, not a smoke keyword. The analyzer now also
skips /resolveOneAssignment/ stacks (35 proof checks green, including
two new cases for the 7229/7264 pushes). Before/after: direct-other
13.9% mean → 0.0%; meal-surplus 60.6% → 71.7%; verdict unchanged in
direction (dominant under either rule) but the numbers above are the
corrected ones. The dominance rule, GO bars, seeds, and leg definitions
were NOT changed. Proposed for the NEXT run: any future supply arm
should pre-register the smoke-racks call sites by function name, not
by keyword, and should add a second policy band (P1 or creekseek) to
test whether the meal-surplus dominance is policy-specific.

## Findings for backlog (for the coordinator to append)

- SCHOLAR-AWAY STRUCTURAL ZERO: under competent play the scholar camps
  wild all month, so scholar-unload is 0% by construction, not by
  failure. Any future "scholar supply" lever must first address scholar
  presence, not deposit rates. (This arm, seed 51105 transcript.)
- DEPOSITGATE FIRE-EATING PRECEDES SCATTERING (corroboration): seed
  51101 repeats the death17549 shape under competent policy — surplus
  eaten at the fire while shelves read full, then a 3-night scattering.
  The gate's "full" heuristic vs. the coming collapse deserves its own
  arm, not a footnote.
- REPEATED HUNGER BEAT: the scholar's "Hunger gnaws. The pack is thin…"
  line repeats verbatim near-daily on away stretches (seed 51105).
  Robotic, not broken — a sense note for a future prose pass.
- GARDEN/FISH/TRAPS MARGINAL IN 30D COMPETENT WINDOW: combined 2.8%
  mean. If garden is meant to matter early, its ripening/assignment
  path — not its yield number — is where to look first.
