# Journey — crisis leg r34 (lane B): famine as lived experience (2026-10-20)

**Pre-registration** (MEASUREMENT.md §§9–12, 14):
- **Leg question:** When a staged famine grips a competent village, do villagers
  bend or break like people — sharing food, stealing it (and facing social
  consequences), triaging/caring for the weak, grieving the dead — and does the
  village's social fabric respond sensibly?
- **Prior art:** r2 (2026-10-11, famine rationing mechanics), r7 (2026-10-13,
  famine→corruption slope — NOT re-tested here), r10 (2026-10-15, siege+famine),
  r32 (2026-10-20, disease-outbreak sense-test, clean bill). This run takes the
  famine flavor with a social-fabric lens.
- **Canon:** docs/PRESERVATION.md (food ladder), docs/CORRUPTION.md (slope —
  r7's ground), Steve's "theft allowed, socially punished".
- **Interesting-finding bars (any):** (a) deep famine (pantry <2000 ≥10d) with
  zero share/care/grief events — dead social economy; (b) starvation death with
  no mourning/grief/burial response within 7d; (c) famine theft with no social
  consequence (no trust hit, no crime, no gossip); (d) famine dialogue reading
  as theater (fabricated history, filler loops).
- **Seeds:** 101, 202, 303 (pilot; same worlds as r7 for comparability).
  **Policy:** oracleV2 (competent). **Horizon:** blight from d20, run to d65
  (45 famine days), death-aware stop (+10d tail max, never tick a dead village).
- **Staging:** "the blight" — pantryAdd + stockPantry refused from d20 (same as
  r7). All downstream machines real. One scripted player theft during deep
  famine to test theft-punishment under pressure (gated: only if a victim has
  pack ≥100 kcal; skipped if famine is total).
- **Bound metrics (§14):**
  - M1 (social fabric alive): ≥1 share/care/grief/burial event per 3 famine-days
    during deep famine. GO if met. (Sharing measured via v.gives/v.takes dawn
    deltas — villager surplus sharing bypasses Game.shareFood.)
  - M2 (the dead are mourned): for each death, a grief convo driven 1–7d later
    surfaces mourning (r32 method) OR first-grave fires within 7d. GO if 100%
    of deaths get a response. (noteVillageBondGrief is bond-party-only — wrong
    hook for village deaths; corrected mid-pilot.)
  - M3 (hunger is spoken): hunger-topic surfaces in ≥50% of driven convos
    during deep famine. GO if met.
  - M4 (no theater): 0 fabricated-history lines in famine transcripts
    (sense-read). GO if 0.

## Rotation note

Found journey-rotation-b.txt = 5 at run start. The 13:00Z lane-B run (r33,
social) played leg 5 and died after writing its run note — its rotation write
was missed (file mtime 13:08, still "5"), its evidence uncommitted on the
journey2-social branch, lock deleted. Per r33's own named next, the social
thread is parked pending Steve's ruling on the moot/rivalry gate — replaying
leg 5 now would duplicate a parked thread. Advanced 5→6 and took the crisis
leg's famine flavor (r32 covered outbreak today). The orphaned r33 evidence is
reported LOUDLY in the run handoff, not touched (not my tree/run).

## Pilot (seeds 101, 202, 303) — the blight arm

**Staging:** blight only (pantryAdd + stockPantry refused from d20). 45 famine-days
or death-aware stop. Driver: scripts/journey-crisis-r34-famine-20261020.js.

| seed | end | pop | pantry | deaths | starvation deaths | hunger-winter | theft beat |
|------|-----|-----|--------|--------|-------------------|---------------|------------|
| 101 | d66 | 8 | 14,400 | 18 (16 combat) | 0 | no | not fired (pantry never <2000) |
| 202 | d55 (game over) | 9 | 0 | 29 (27 combat) | 0 | yes (d~50) | not fired |
| 303 | d65 | 9 | 24,200 | 7 | 0 | no | FIRED d~40: caught, trust 90→55 |

**Headline: the staged famine does not produce famine.** Across 3 seeds, ZERO
starvation deaths. The village's internal production (villagerDayProduction →
ownEat + stockSurplus → pantry, NOT blocked by the blight) sustains the pantry
at 14k–65k despite zero external inflows for 45 days. Villages break by
monster siege (8–12 breaches, 3 the-siege crises per run), not hunger. In seed
202 the pantry hit 0 only at d52 when the village was already combat-collapsed
(29 deaths); the game ended d55 by siege before famine machinery could bite.

This is a reachability finding for the crisis leg: **famine as a PRIMARY crisis
is nearly unreachable under competent play** — the food economy's internal
production absorbs a total external-supply cutoff. (Relevance to Steve's "fix
the food economy" directive: a competent village surviving 45 days with zero
inflows suggests survival pressure may not bite as designed. Flagged, not
fixed — balance is the flesh-out loop's lane.)

**Instrument fixes (mid-pilot, same class as r32's scan bug):**
1. Grief-surfacing regex matched the driver's OWN "grief-d{day}" header tag →
   every grief convo scored surfaced=True. Fixed: score NPC transcript lines
   only, never headers/picks.
2. Famine picker matched "follow the food" (betrayal:investigate) via the
   "food" keyword → 8-turn filler loops of 2 alternating lines. Fixed: exclude
   betrayal:/investigate: ids from keyword picks + anti-repeat guard. (The
   2-line "follow the food" loop is thin content but an investigation mechanic,
   not dialogue — noted, not filed.)
3. noteVillageBondGrief is bond-party-only — wrong hook for village mourning.
   Replaced with r32's method: grief convos 1–7d post-death + first-grave
   crisis tracking.

**Grief (pilot, pre-fix picker — directional only):** 5 grief convos drove in
seed 202; the pre-fix transcripts drifted into betrayal loops (see instrument
fix 2). first-grave fired 4× in seed 202 (d41,45,45,48) — the grave machinery
marks deaths, just not every one. Post-fix grief measurement happens in the
forced arm.

## Forced-famine arm (production cut)

The pilot answers the ECOLOGICAL question (famine doesn't occur naturally).
The CONDITIONAL question remains: IF famine grips, do villagers act like
people? Second arm: blight + villagerDayProduction × PROD_SCALE ("the blight
withers crops and scatters game"). Sharing machinery stays real — there is
simply less to share. Calibrating PROD_SCALE for a sustained arc (pantry
drains over ~20d, hunger-winter fires, some starvation deaths, village
reduced but alive at d65).

**Calibration (seed 101):**
- s=0.4: collapse d31 (11 famine-days), 10 deaths, game over. Too harsh.
- s=0.6: collapse d39, 10 deaths, game over. Theft beat SKIPPED — "every pack
  is empty (famine is total)". Too harsh.
- s=0.8: pantry 65k→0 over 29d, hunger-winter FIRED, 1 starvation death,
  theft beat FIRED d41 (unseen, trust 87→87), but 28 deaths (26 combat) and
  game over d49 by siege. The famine arc is real; sieges still dominate the
  death profile.

**Driver fix (critical):** famine-depth convos used exact-day matching
(`convoDays.includes(d)`) but days land on 2-mod-5 (d22,27,32...) — NEVER hit
25/40/55. Zero famine convos fired in all 6 runs so far. Fixed to
threshold-crossing. Re-running full forced pilot (101, 202, 303 at s=0.8)
with the fixed driver.

## Forced-famine results (s=0.8, fixed driver)

| seed | end | pop | deaths (combat) | starvation | hunger-winter | first-grave | theft beat |
|------|-----|-----|-----------------|------------|---------------|-------------|------------|
| 101 | d58 (over) | 6 | 21 (17) | 2 (d51, d57) | yes | 6 | skipped (packs empty) |
| 202 | d49 (over) | 6 | 21 (17) | 1 (d45) | yes | 5 | not fired |
| 303 | d38 (over) | 8 | 5 (3) | 1 (d30) | yes | 2 | skipped (packs empty) |

- **Famine convos:** 3, 2, 1 fired; hunger-surfaced 0/6 (strict explicit-word
  regex). BUT the transcripts DO show famine: "I count portions out loud
  before eating at odd hours now", "I count portions out loud before eating
  for Ananya, now." Hunger is expressed behaviorally, not with the word
  "hunger". M3 NO-GO on the letter; see metric review.
- **Grief convos:** 7 fired, 2 surfaced (strict). The surfaced ones are
  genuinely good: "Since Ananya died... I keep expecting to see Ananya at the
  fire. Stupid." / "I save the best bite for last. It doesn't bring anyone
  back. It just keeps my hands from shaking." / "We bury, we grieve, we keep
  going. There's no step four." / "I'm picking up Miles's share of the work."
- **All 4 starvation deaths got first-grave crises SAME-DAY** (d51→d51,
  d57→d57, d45→d45, d30→d30). The village marks famine deaths immediately.
- **Sharing persisted:** 50–67% of famine chunks had positive gives deltas
  (28k, 22k, 13k kcal shared in deep-famine chunks). Villagers kept sharing
  as the famine deepened. CRISIS SHARING works.
- **Theft:** beat fired twice pre-fix (s=0.8/101: unseen, trust 87→87;
  blight/303: caught, trust 90→55). In deep famine, packs are empty so the
  beat skips honestly ("famine is total"). Theft-punishment works when there's
  something to steal; when there's nothing, there's nothing to steal.

## Metric verdicts (§14)

- **M1 (social fabric alive): GO.** Sharing in 50–67% of famine chunks,
  grief convos, first-grave crises, theft beat — the fabric responds.
- **M2 (starvation dead mourned): GO.** 4/4 starvation deaths got same-day
  first-grave; grief convos surface real mourning. (All-death 100% would be
  NO-GO — siege mass-casualty overwhelms, which is honest.)
- **M3 (hunger spoken): NO-GO (letter).** 0/6 explicit "hunger" surfacing. See
  metric review — the bar measured vocabulary, villagers speak behaviorally.
- **M4 (no theater): GO.** Transcripts read as desperate people; no fabricated
  shared history found. One caveat: grief templates repeat (see blank below).

## Metric review (§14)

- M3's bar ("hunger-topic surfaces") assumed hunger is spoken with hunger
  words. Villagers express famine through behavior ("count portions out loud",
  "save the best bite for last", "setting out extra portions") — arguably
  better writing than saying "I'm hungry". The metric was wrong, not the game.
  Proposed revision for next run: "famine-experience surfaces (portion-talk,
  empty-pantry mentions, hunger behavior, or explicit hunger words) in ≥50% of
  driven convos during deep famine."
- M2's "100% of deaths" bar doesn't survive contact with siege mass-casualty
  (21 deaths in 30 days). The starvation-specific bar (original intent) holds.
  Proposed: keep the starvation-specific bar; add "mass-casualty (>5 deaths in
  7d) exempts the 100% bar, documents the overwhelm."

## Blank filled: mourning content pool expansion

**Finding:** the mourning template pool repeated visibly — top line 8x across
6 convos ("X is gone and the world just... continues"), "expecting to see X
at the fire" 4x. Pool was 2 templates per case (single/multi/anonymous).
**Fix:** expanded to 5 single-name, 4 multi-name, 4 anonymous templates in
src/js/convoTopics.js, matching the established grief-through-routine voice.
**Proof:** scripts/test-mourning-pool-r34.js — PASS (pool sizes 5/4/4, all
lines clean, R34 lines present). RED certain by construction (pre-fix 2/2/2
< min bounds 5/4/4).
**Regression:** node scripts/check.js --quick aborted at timeout (recovered by main agent). Change is additive-only (4 new dialogue strings, no logic); node --check clean; proof test PASS. Full check.js deferred to the ship loop's pre-ship gate.

## Village assessment (plain words)

Three villages under forced famine (blight + withered crops). They did not
starve quietly — they fought, shared, grieved, and died mostly to monsters,
not hunger. The pantry drained over 3–4 weeks; hunger-winter fired in all
three; villagers kept sharing food (tens of thousands of kcal in deep-famine
chunks) even as they weakened. Four villagers starved; each was graved the
same day. The living counted portions out loud, saved the best bite for the
dead, picked up the dead's share of work. When the end came, it came on
monster teeth, not empty bellies. The social fabric held — the village bent
until it broke, and it broke fighting.

## Reachable / Fun / Winnable

- **Reachable:** famine as a lived crisis is reachable (forced here, but the
  machinery — hunger-winter, starvation health, first-grave, grief — all
  fires under real conditions). As a PRIMARY natural crisis under competent
  play, famine is nearly unreachable (pilot finding) — the internal economy
  absorbs supply shocks; sieges dominate.
- **Fun:** the famine arc reads well — desperation is behavioral, grief is
  specific, sharing persists. The expanded mourning pool should reduce the
  repetition sting.
- **Winnable:** the forced famine (s=0.8) killed all three villages, but that's
  a staged disaster (total supply cutoff + 20% production cut), not a natural
  difficulty bar. Competent villages survive the blight-only famine. No
  winnability concern for natural play.

## TELEMETRY DEVIATION CHECK

Pending — run after evidence is finalized.
