# sim-pairoverlap-b — yield-the-blow pair-overlap lever

**Verdict: NO-GO.** The pilot passed every bar (pair days 97 vs a bar of 61),
and the mechanism is proven — but the 12-seed confirm on the fresh band
failed exactly one cost bar: starvation deaths 8 against a bar of 5
(baseline 3 + 2). Per the prereg, a miss is NO-GO, never re-scored. The
lever does what it was built to do; it does not ship on this evidence.

- Branch: `sim-pairoverlap-b`, base `8842af2e6` (main-tree master at rebase).
- Prereg: `evidence/2026-11-07/sim-pairoverlap-b-prereg.md` (+ amendment A1,
  GO bar 61 pair days, pool check passed on 22 scholar-kills).
- Proof: `scripts/test-pairoverlap-20261107.js` — **34/34 PASS**.
- Pilot corpora: `perseed-pairoverlap-b-baseline/` /
  `perseed-pairoverlap-b-armed/` (band 53001–53008, 8 seeds, 150 days).
- Confirm corpora: `perseed-pairoverlap-b-confirm-baseline/` /
  `perseed-pairoverlap-b-confirm-armed/` (fresh band 53301–53312, 12 seeds,
  150 days). Freshness re-verified in the prereg: 53301/53401 zero namings
  across all preregs and forbidden lists; 53201 named in doorwalk preregs
  and therefore not fresh.
- Analyses: `pairoverlap-analysis.json` (pilot), `pairoverlap-confirm-analysis.json`.
- Panels (§15): `pairoverlap-panel.md` (pilot, review_required),
  `pairoverlap-confirm-panel.md` (confirm, review_required).

## The lever, in plain words

A "pair" is two living villagers who have each killed a wave-4 (or harder)
beast, alive at the same time. Pairs are the bottleneck: the village needs
two proven killers alive together before it can face wave 5 and the seat.
Three earlier arms tried to make pairs by throttling feasts and all failed
the same way — feasts ARE the pair factory, because feast draws bring the
fights where kills happen.

Yield-the-blow throttles nothing. When the scholar (the player character)
is about to land the killing blow on a wave-4-or-harder beast, and a
companion stands ready in the same fight, the scholar holds back and lets
the companion finish it. The companion becomes a second proven killer
instead of the scholar collecting another kill alone. The rule only fires
when all seven conditions hold: the weakest beast is wave-4+, it is nearly
dead (50 HP or less), a living ally fighter is present, the scholar is in
strike range and healthy (half health or better), it is not the fight's
first turn, and that beast has not already been yielded twice in the same
fight. The scholar waits (the game's own wait action) and the fight goes on
without them for a turn. No new feasts, no new fights, no food spent.

The lever is a policy file only (`scripts/policies/competent-pairoverlap-b.js`,
a wrapper over the feast drive). Zero game code changed, zero default flips,
no existing policy file touched.

## Pilot (band 53001–53008, 8 seeds) — GO

| | Baseline (feast drive) | Armed (+ yield) | Bar | Pass? |
| --- | ---: | ---: | ---: | --- |
| Pair days | 51 | **97** | ≥ 61 | yes |
| Food deeds (villages that banked the feast deed) | 5/8 | **5/8** | ≥ 5 | yes |
| Donations to feasts | 53,470 kcal | **49,625** | ≤ 53,470 | yes |
| Starvation deaths | 2 | **3** | ≤ 4 | yes |
| Median survival | 129d | **147d** | ≥ 103.2d | yes |
| Villages surviving 150d | 2/8 | 4/8 | reported | — |
| Wave-4+ kills | 31 | 32 | reported | — |
| Wave-5 unlocks | 2/8 | 4/8 | reported | — |
| Wave-5 kills | 3 | 4 | reported | — |
| National / table / wins | 0 / 0 / 0 | 0 / 0 / 0 | reported | — |

Substrate sanity passed (food deeds 5/8 ≥ 3, surge spent on 5 seeds ≥ 2).
Neutrality guard passed on all 8 seeds: every armed trajectory is identical
to its baseline twin until the first yield fires (first yield days 51–114;
53003 and 53007 never yielded and match on every row).

Per-seed pair days, baseline → armed: 53001: 0→25. 53002: 0→44. 53003: 0→0.
53004: 28→23. 53005: 18→0. 53006: 0→0. 53007: 5→5. 53008: 0→0.

The mechanism, measured directly: wave-4 kills by who landed them moved
from scholar 22 / companion 8 / wild 1 to scholar 13 / companion 16 /
wild 3. Nine scholar-kills became companion-kills; total kills were flat
(31→32). 26 yields across 16 fights; 8 companion kills landed on yield
days; 7 yields hit the per-beast cap of 2.

## Confirm (fresh band 53301–53312, 12 seeds) — NO-GO

| | Baseline | Armed | Bar | Pass? |
| --- | ---: | ---: | ---: | ---: |
| Pair days | 46 | **61** | ≥ 61 | yes, exactly |
| Food deeds | 8/12 | **8/12** | ≥ 8 | yes |
| Donations | 96,265 kcal | **86,605** | ≤ 96,265 | yes |
| Starvation deaths | 3 | **8** | ≤ 5 | **no** |
| Median survival | 93.5d | **98.5d** | ≥ 74.8d | yes |
| Villages surviving 150d | 1/12 | 0/12 | reported | — |
| Wave-4+ kills | 36 | 33 | reported | — |
| Wave-5 unlocks | 4/12 | 7/12 | reported | — |
| Wave-5 kills | 4 | 3 | reported | — |
| National / table / wins | 0 / 0 / 0 | 0 / 0 / 0 | reported | — |

Substrate sanity passed (food deeds 8/12, surge spent on 8 seeds).
Neutrality guard passed on all 12 seeds. The mechanism held up on fresh
ground: scholar kills 24→14, companion kills 12→17, 12 companion kills on
yield days, 16 yields across 12 fights. Pair days rose 46→61 (+15) with
new pairs on 53304 (0→17, first pair day 75) and 53305 (0→3), and the
existing pair on 53306 held at 24.

The single failing bar is starvation, and it is concentrated, not spread:
per-seed starvation deaths, baseline → armed: 53302: 0→1, 53303: 0→4,
53305: 1→1, 53308: 1→1, 53311: 1→1, all others 0→0. Four of the five
extra deaths are on one seed, 53303 — and on 53303 the armed village
lived 141 days against 70 baseline. It lived twice as long and therefore
had twice the exposure to hunger; the yield touches no food rule at all
(donations actually fell 96,265→86,605). The starvation bar counts absolute
deaths with no adjustment for days lived, so a longer-lived village is
punished for surviving. That is a real weakness in the bar, and it is also
exactly the kind of thing the bar exists to catch: the lever's trajectory
divergence did make one village live longer and hungrier. The bar is
frozen and the verdict is NO-GO either way; the dissection is for the
next arm, not a re-score of this one. (For scale: across the whole
confirm band the armed leg lived 1,221 village-days against 1,239
baseline — total exposure was flat, so the miss is not a band-wide
exposure artifact; it is concentrated on 53303, not spread.)

Two more honest negatives on the confirm: the one baseline survivor
(53309, 150 days) died at 96 days armed — the yield's divergence cost it
its survival; and 53308's pair shrank 8→2. The lever is not uniformly
kind per seed. The pilot had the same shape: 53005 lost its whole pair
(18→0) and died 18 days earlier armed (76d vs 94d), with 2 starvation
deaths of its own.

## Sense-test: do the feasts and the pair-banking read like people?

Read on the two pair-making pilot seeds (53001, 53002 armed). Yes, at the
fire — with one piece of ledger noise.

On 53001 the scholar yielded four times and every yield produced a
companion kill: Mara Vasquez put down the wave-4 Strike on day 59, Petra
Novak the Reunion on day 116 and again on day 140, Krystian the Eulogy on
day 118. All six wave-4+ kills in that village were companion kills. The
fire stories name them: "Petra leans in, and the hall goes quiet in a
different way — this is not a new story. 'You all know The Loud Beast by
now. I put another one down today.'" A veteran with a reputation, telling
a story the room already knows. The village survived the full 150 days
even though the scholar's role changed hands 18 times — the companions,
not the scholar, did the killing, and the village lived on them.

On 53002 the first yield (day 68) let a companion finish the wave-4
Suburb at 25 HP; that companion stayed alive and healthy (health 88–92)
through the whole pair window. Fatima Hassan killed the Influencer on
day 86 and told it the same night. The feasts read like a village, too:
"James opens the pantry wide: 3× Foraged food, 1× Foraged food, 5×
Burdock. Kigen, Fatima eat until the fire burns low. Nobody says what
this cost — everybody knows, and winter is listening." And the draw that
follows a feast is a scene, not a table: "The cookfire's smell carried
further than the laughter did — smoke and grease on the night wind. The
Strike is circling the edge of the light. It followed the feast here."

The ledger noise: during a feast fight the line "FEASTED ×2.03: the feast
was the weapon." repeats verbatim dozens of times in a row (about fifty
on day 92 of 53002), once per blow. And the daily keepsake reminder
("You hold Contract Quill…") repeats word-for-word for a week at a time.
Neither breaks the fiction at the fire, but the fight log is a chant, not
a story. Documented, not fixed — it is outside this arm's lever.

One yield does not guarantee the companion lands the blow: on 53002 day
81 the scholar held back twice on the Congregation and still took the
kill on a later turn. The pair formed anyway, because the day-68
companion veteran was still alive when the scholar killed. Yielding is a
chance, not a handoff.

## The village, in plain words

Eight villages on the pilot band, twelve on the fresh band. Almost all of
them die before day 150 — 6 of 8 pilot villages lost, 11 of 12 confirm
villages lost — and none of them reached the national scale, the table, or
a win in either leg. That wall did not move: the lever banks pairs, and
pairs are upstream of the seat, but no village in either band got far
enough for a pair to matter at the table. Wave-5 unlocks did rise (pilot
2→4, confirm 4→7), which is the pair doing its job one step down the
chain.

Who thrived: companions who got the killing blow. On the pilot, 16 of 32
wave-4 kills were companions (up from 8 of 31); on the confirm, 17 of 33
(up from 12 of 36). The scholar's share of the glory fell by roughly a
third in both bands, and the village's standing rose on the seeds where
pairs formed (53001: 199→400, 53002: 199→410, 53004: 455→675).

Who died: scholars, constantly — 18 scholar deaths on 53001 alone, 13 on
53002 — and the villages that lost their pairs lost them to ordinary
attrition (a veteran dying in a field fight the policy cannot touch, a
village starving after living longer). The first killer is still
unprotected: this arm deliberately did not build that protection (no
policy-side way to pull a villager out of a fight exists, and avoiding
fights would remove the companion-kill chances the yield creates).

What is missing: the pair is a means, not an end. Villages bank two
proven killers and then still die at the same wall — no seat is ever
priced, in any of the 20 villages across both bands and both legs. The
feast gate is the known lock (see the feast-as-gate note in the standing
record); this lever was never meant to open it.

## Blanks filled or documented

- Filled: the pair-overlap lever itself — the first mechanism in the feast
  chain that increases overlap without throttling feasts, proven to
  convert scholar-kills into companion-kills on two bands (pilot 22→13
  scholar / 8→16 companion; confirm 24→14 / 12→17).
- Documented, not filled: first-killer protection (no honest policy-side
  mechanism exists — see prereg); the FEASTED fight-log chant (verbatim
  repetition ~50× per feast fight); the starvation bar's exposure
  confound (absolute deaths, unadjusted for days lived — 53303's 4
  deaths came in a run that lived twice as long); the seat wall (0/20
  villages priced a seat in any leg).
- Gap in the record, carried forward: `sim-feastcost-b.md` and
  `sim-feastcap-b.md` do not exist anywhere in the workspace (recorded in
  the prereg); the chain was read through findings #1869 instead.

## Metric review

- Pair days is the right primary and it behaved: it moved on the lever's
  own mechanism (companion kills on yield days), passed the frozen bar on
  both bands, and the neutrality guard proves the movement starts exactly
  at the first yield. No metric gaming: the lever never reads the kill
  log or the roster, and the proof test pins that (a poisoned kill log
  cannot trigger a yield).
- The starvation bar is the weak instrument: absolute count, baseline + 2,
  no days-lived adjustment. On the confirm it fired on one seed's longer
  life, not on a food mechanism. A per-100-days starvation rate would
  still have failed on this band (8 deaths / 1,221 days ≈ 0.66 per 100
  days vs 3 / 1,239 ≈ 0.24) — the rate form is a better instrument for
  the next arm, not a rescue for this one. The bar stays as written for
  this verdict; a future arm should pre-register the rate form instead
  of re-scoring this one.
- The 61-pair-day bar was set as max(35, 51+10) from the re-baseline.
  The confirm armed leg landed exactly on 61. An exact landing on a
  bar set from a different band is coincidence, not calibration — the
  confirm's own baseline was 46, so the +15 delta is the honest number
  to carry forward.
- Balanced panels (§15, both bands): review_required, no material signal
  on the pilot; on the confirm, village deaths per run +1.17 and
  community loss +0.08 flagged regression_watch, but both exploratory
  intervals cross zero. The panel is a screen, not the judge; it
  corroborates the confirm's direction without adding a verdict.
- Proof: 34/34 PASS, including live legs (neutrality on 53001, armed
  yields on 53004/53006), an old-code-strikes / new-code-waits control,
  and guard fixtures. The proof's live legs reproduced the pilot's
  armed numbers for 53001/53004/53006 exactly (deterministic seeds).

## Convergence state

The feast chain now reads: feast drive buys the deed with pairs
(62→14 in its own pilot, re-baselined here at 51); three throttles
failed the same bar; yield-the-blow is the first lever that moves pair
days up without throttling feasts (pilot +46, confirm +15) — and it still
does not ship, because the confirm's starvation cost bar failed. The
mechanism is proven and the cost is concentrated and diagnosable, so the
lever is HELD, not killed: the next arm should either (a) pre-register a
days-adjusted starvation rate and re-run, or (b) pair the yield with a
food-safety guard for the longer-lived villages it creates. Per kill
discipline, a missed cost bar is not a kill — the lever itself is the
right shape; the cost accounting is what needs one more pass.

## Scale-wall numbers (both bands, both legs)

| | Pilot baseline | Pilot armed | Confirm baseline | Confirm armed |
| --- | --- | --- | --- | --- |
| National scale | 0/8 | 0/8 | 0/12 | 0/12 |
| Table / seat priced | 0/8 | 0/8 | 0/12 | 0/12 |
| Wins | 0/8 | 0/8 | 0/12 | 0/12 |
| Wave-4 unlocks | 8/8 | 8/8 | 12/12 | 12/12 |
| Wave-5 unlocks | 2/8 | 4/8 | 4/12 | 7/12 |
| Wave-5 kills | 3 | 4 | 4 | 3 |
| Median survival | 129d | 147d | 93.5d | 98.5d |
| Survived 150d | 2/8 | 4/8 | 1/12 | 0/12 |

## Files

- Prereg + amendment A1: `evidence/2026-11-07/sim-pairoverlap-b-prereg.md`
- This evidence: `evidence/2026-11-07/sim-pairoverlap-b.md`
- Policy: `scripts/policies/competent-pairoverlap-b.js`
- Driver / analyzer / panel builders / proof:
  `scripts/pairoverlap-driver-20261107.js`,
  `scripts/pairoverlap-analyze-20261107.js`,
  `scripts/build-pairoverlap-panels-20261107.js`,
  `scripts/build-pairoverlap-confirm-panels-20261107.js`,
  `scripts/test-pairoverlap-20261107.js`
- Pilot corpora: `evidence/2026-11-07/perseed-pairoverlap-b-baseline/`,
  `evidence/2026-11-07/perseed-pairoverlap-b-armed/`
- Confirm corpora: `evidence/2026-11-07/perseed-pairoverlap-b-confirm-baseline/`,
  `evidence/2026-11-07/perseed-pairoverlap-b-confirm-armed/`
- Analyses: `evidence/2026-11-07/pairoverlap-analysis.json`,
  `evidence/2026-11-07/pairoverlap-confirm-analysis.json`
- Panels: `evidence/2026-11-07/pairoverlap-panel.md` (+.json, -before/-after.json.gz),
  `evidence/2026-11-07/pairoverlap-confirm-panel.md` (+.json, -before/-after.json.gz)
- Registry: `scripts/sweep-compare.js` (pairoverlap entry appended)

## Run notes

- The confirm armed leg's runtime session was lost after 9 of 12 seeds
  (no driver process remained); seeds 53310–53312 were re-run with the
  same driver, seeds, and base, and the 12-file corpus was verified
  complete before analysis. Deterministic seeds make the split run
  identical to a single run.
- Index clobber struck twice in this run (after the instruments commit and
  once after the prereg commit): committed files showed as
  staged-as-deleted while byte-identical to HEAD. Repaired both times
  with `git ls-tree HEAD -- <paths> | git update-index --add
  --index-info` after hash verification; commits themselves were correct.
- No canon doc covers the feast/surge system as a dedicated doc; the
  design record is the code (`src/js/feastBuff.js`,
  `src/js/progression.js:650`) plus `docs/BALANCING.md` §78–79, as
  recorded in the prereg.
