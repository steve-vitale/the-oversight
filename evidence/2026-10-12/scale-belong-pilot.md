# BELONG-road reachability probe — scale on-ramp (2026-10-12)

Worker worktree: `scale-belong`. New files only (policy + probes + evidence); no game-code changes.
Sibling trees live: sim-food-r8 (food lever incl. competent.js), journey-scale (playtest loop),
scale-wall-fix (hierarchy.js linkTick tribute math). None of their files touched.

## PRE-REGISTRATION (written before any sim ran — docs/MEASUREMENT.md §§9-12)

- **Question:** is the BELONG road (docs/SCALE.md) reachable in sims — i.e. can Haven
  become a subordinate in good standing (link trust ≥ 50, arrears 0, link age ≥ 14d)
  to a foreign primary whose realm holds ≥ 4 fires — without any game-code change?
  The 2026-10-12 diagnosis flagged it "not simmed, may be the currently-most-viable
  road" because its trust math is positive when paying (+4/wk: payTribute +3,
  linkTick +1), unlike LEAD's negative drift.
- **Primary metric:** BELONG national reach per seed = national beat staged with
  shape 'belong' AND `scaleRank()=='national'` held at some point; OR ≥ 14 days of
  good-standing subordination while a foreign 4-realm (2 + subs ≥ 2) existed.
- **GO threshold:** ≥ 1/4 pilot seeds reaches it on the belongseek policy.
  Baseline expectation: 0 (0/6 scalecourt probe seeds ever held a subordinate link;
  scalecourt never proposes asSubordinate).
- **Horizon:** 150d, death-aware (dead village stops simulating; runDays breaks on
  Game.over / pop-zero). Why 150d: the ladder is one rung/season (REGIONAL 31–60,
  NATIONAL 61–90) and foreign realms need engagement-driven consolidation; the
  Belong standing bar is a 14-day hold, so the bar needs ~day 90–130 to be testable.
- **Seeds:** 101, 202, 303, 404 exactly.
- **Policies:** `scalecourt` (baseline, no BELONG pursuit — but full courtship
  answering) vs `belongseek` (new: scalecourt + subordinate courtship), identical
  seeds, 8 runs total.
- **Stage 0 smoke (2–3 seeds, short horizon):** does the belongseek code path fire
  (proposeLink asSubordinate attempted → accepted/countered; tribute paid weekly;
  stirRegion engaged)? Kill before pilot if the path never fires.
- **Kill rule:** if belongseek shows no visible effect vs baseline at pilot
  (no subordinate links formed, no trust-50 holds, no foreign-4-realm engagements
  beyond baseline), kill it — document why, move to assessment, spend no confirm.
- **Convergence state to report:** converging | converged | parked | killed-at-pilot.

## Artifacts
- `scripts/policies/belongseek.js` — the policy (new).
- `scripts/probe-belong-20261012.js` — smoke + pilot runner (new).
- `/tmp/belong-smoke.json`, `/tmp/belong-pilot.json` — raw outputs (ephemeral; re-run to reproduce).

## RESULTS — Stage 0 smoke
(run 2026-10-12 ~20:00 CDT; `MODE=smoke SEEDS="101,202" DAYS=60 OUT=/tmp/belong-smoke.json`)

Gate question: does the belongseek code path fire? **YES — cleanly, both seeds.**
- Both seeds: `proposeLink(village_2, {asSubordinate: true, tributeKcalPerWeek: 5000})`
  on day 20 → **direct accept** (score ≥ 55; trib 5000 = our offer, not the 6000
  counter band — the +10 subordinate bonus + opinion≥5 generosity +8 carried it).
- Weekly tribute paid 5 weeks each (real pantry kcal); `stirRegion` fired
  11/13 times (kinds: court 1, trade 5, contest 5/7 — contests watched abroad stir too).
- Trust 30 → 51 (seed 101) / 60 (seed 202): the coded +4/wk (payTribute +3,
  linkTick +1) verified live.
- Seed 202: good-standing days = 12 (trust ≥ 50, arrears 0, age ≥ 14d) and a
  foreign 4-realm formed by day 57 — but under a DIFFERENT primary than our
  village_2, so goodDaysWith4 = 0. The consolidation-candidate problem is real:
  at day 20 no foreign polity exists, so the policy bets on the strongest known
  fire, which may not become the consolidator.
- Both villages died ~day 51–57 (village-lost, combat-heavy: seed 101 16 combat
  deaths, seed 202 8 + 1 starvation). The pilot's 150d horizon is aspirational —
  death-aware stops apply; reaching the national window (~day 90–130) requires a
  surviving village first. This is a finding about the whole on-ramp, not the
  policy.

Smoke verdict: path fires, trust math live, engagement works. **Proceed to pilot.**

## RESULTS — Stage 1 pilot
(run 2026-10-12 ~20:15 CDT; `MODE=pilot SEEDS="101,202,303,404" DAYS=150 POLICIES=both`;
raw: `evidence/2026-10-12/belong-pilot-raw.json`.
NOTE: this batch ran with the v1 policy — subordinate courtship from day 20 to
the strongest known fire, NO consolidator switch. The v2 follow-up below used
the same script after the switch was added.)

| seed | policy | end | rank | dawn | sub links | good days | max trust | max foreign realm | beats | tribute wks |
|---|---|---|---|---|---|---|---|---|---|---|
| 101 | scalecourt | lost d116 | regional | 46 | 0 sub (1 as-primary) | 0 | — | 6 (village_2) | none | 0 |
| 101 | belongseek | lost d51 | regional | 41 | 1 (village_2, 5000) | 3 | 51 | 3 | none | 5 |
| 202 | scalecourt | survived d152 | regional | 46 | 0 sub (2 as-primary) | 0 | — | 7 (village_1) | none | 0 |
| 202 | belongseek | lost d57 | regional | 41 | 1 (village_2, 5000) | 12 | 60 | 4 (village_spl_34) | none | 5 |
| 303 | scalecourt | lost d130 | regional | 64 | 0 sub (2 as-primary) | 0 | — | 5 (village_spl_30) | none | 0 |
| 303 | belongseek | survived d152 | regional | 41 | 1 (village_0, 6000) | 79 | 84 | 5 (village_2) | none | 20 |
| 404 | scalecourt | lost d105 | regional | 46 | 0 sub (1 as-primary) | 0 | — | 3 (village_1) | none | 0 |
| 404 | belongseek | lost d48 | regional | 41 | 1 (village_2, 5000) | 15 | 73 | 3 | none | 4 |

Visible effect vs baseline (kill-rule check): **large.** belongseek formed a
subordinate link on 4/4 seeds (baseline: 0/4 — scalecourt never proposes
asSubordinate); held trust 51–84; paid 4–20 weekly tributes in real pantry
kcal; stirred the region 11–30 times per run. NOT killed.
Primary metric (GO ≥ 1/4 BELONG national): **0/4 on v1.** The v1 strategy —
blind-bet the strongest known fire at day 20 — never put Haven under the head
of a 4-realm.

### Forensic: seed 303 v1 — the near-miss that diagnosed the fix
(raw: `evidence/2026-10-12/belong-forensic303-raw.json`, FORENSIC=1 daily trace)
- Day 20: link formed with village_0 (counter band → 6,000/wk, pantry allowed,
  accepted). Trust 43 → 84 by day 53. Arrears 0.
- Day 41: Regional Dawn (first link 21 days old). Day 43: foreign polity forms —
  **village_2's** realm, size 3 → 4 (day 50) → 5 (day 57), under engagement
  (our tribute + demands + contests stired 30 times).
- village_0 never bound abroad (subFpSize null all 152 days). Our trust/arrears/
  age bars were all green for 79 days (63 with a foreign 4+ realm existing) —
  but `polityOf('village_0')` was null every day: **the realm-side bar failed
  because the policy bet on the wrong consolidator.**
- Foreign consolidation picks its head by momentum (uniform pair seed +
  engagement growth around the largest) — the day-20 strength bet cannot know
  the winner. The fix is strategic, not mechanical: **ride the consolidator**
  once the region shows its hand.

## FOLLOW-UP — v2: ride the consolidator
Policy change (same lever, no game code): `rideConsolidator()` in
`scripts/policies/belongseek.js` — once per run, from day 55, if our link is
≥21 days old and some other fire's realm is ≥4 while ours is <4: `breakLink`
('walked': opinion −10, honest parting) and court the rising power the same day.
6 seeds × 150d (`evidence/2026-10-12/belong-v2-raw.json`):

| seed | end | rank | sub links | good days | max trust | foreign realm | beats | tribute |
|---|---|---|---|---|---|---|---|---|
| 303 | survived d152 | **national** | v0(6000)→walked d55→v2(5000) d68 | 92 | 100 | 5 (village_2) | **belong@82** | 19 |
| 101 | lost d51 | regional | 1 (village_2) | 3 | 51 | 3 | none | 5 |
| 202 | lost d57 | regional | 1 → walked d57 (died) | 12 | 60 | 4 | none | 5 |
| 505 | lost d24 | village | 0 | 0 | — | — | none | 0 |
| 606 | lost d126 | regional | v1→walked d71, re-court failed | 38 | 93 | 5 (village_2) | none | 9 |
| 707 | lost d106 | regional | v0→walked d55, re-court failed | 30 | 91 | 5 (village_3) | none | 6 |

**Reachability: DEMONSTRATED.** Seed 303: Binding beat staged day 82, oath sworn
day 83, `scaleRank()=='national'` held 70 days to end of run. The BELONG road
works end to end with zero game-code changes.

### Failure modes (all documented, none hidden)
1. **Early death (101, 202, 404, 505):** villages died d24–d57 of combat/monster
   pressure before the switch window (day 55+) or the national window (~day 90).
   The road's precondition — survive to ~day 90 — is the combat/food baseline's
   department, not the scale lever's. Death causes: combat 60–80% of deaths.
2. **The decline spiral strands the switch (606, 707):** after a clean break,
   re-courting the consolidator failed 7+ consecutive times (score < 35 every
   time). Each cold ask costs opinion −5 ("asking again cold costs you"), so
   repeated declines spiral the village toward the shut door (−20). Debug on 606:
   proposals at pantry 16k–41k all declined; the village survived to d126 with
   NO link — the switch traded a trust-93 good-standing bond for nothing. The
   re-court's success hinges on representative standing + opinion + noise; on
   303 it direct-accepted (trib 5000 = our offer), on 606/707 it never cleared
   35. **Recommendation (v3, policy-side): build opinion BEFORE the switch via
   the climb verbs** — study their codex (+3 once), broadcast wins (+2 each),
   time (+1/week) — instead of breaking cold. Or hedge with a second subordinate
   link (engine allows it; fiction is "tributary to two masters" — Steve's call).
3. **Tribute granularity overshoot (engine-honest, not a bug):** "Tribute paid:
   6,050 / 6,435 / 9,323 kcal" against a 6,000 bill — `_removePantryKcal` removes
   discrete pantry items, so the true removed amount overshoots the bill and
   the say line reports the true number. Overpayment doesn't credit next week.
   Real cost, honestly said. Noted for the food lever: ~5–8% effective tribute
   surcharge from item lumpiness.

## SENSE-TESTING (Steve 2026-10-11 — read the transcript, judge meaning)
Seed 303 v2, the Binding arc — every beat reads, in order, with consequences:
- d20: "⛓️ Isaac brings it home: Haven bows to Emberhold — one organization, them
  primary. Tribute: 6,000 kcal/week. The relationship starts at trust 30."
- d42: "📯 Emberhold calls on the obligation: Send your best for three days.
  'Emberhold needs hands it can trust.' Honor it, or refuse — both are remembered."
  → answered (aid), region stirred.
- d42: "🧳 Word of Haven's new bindings, trade, the televised games is doing work
  out there — Word comes late, through traders: Thornfield and Emberhold have
  bound together" — the region visibly consolidating, attributed to OUR deeds.
- d55: "🚶 Haven walks from the table cleanly — no blades, no hard words. The
  bond ends where it stood, honestly." — the switch, no melodrama, no punishment
  beyond the relationship's logic.
- d63: "🧳 …The Bloodied has bound itself to Thornfield. The region's map is
  being redrawn — not by Haven."
- d68: "⛓️ Muktar brings it home: Haven bows to Thornfield — one organization,
  them primary. Tribute: 5,000 kcal/week." (Muktar is now the speaker — people
  change roles across the run.)
- d82: "◈ SYSTEM: 'You are not the head of this. That is the point. A realm of
  5 fires — and Thornfield wants Haven's oath. The audience LOVES a binding.'"
- d82: "📯 Thornfield's court summons Haven's speaker. SWEAR the oath of the
  realm (a gift seals it), SERVE at their court (seven days of your speaker's
  life), or WALK —"
- d83: "🤝 Muktar kneels at Thornfield's court and swears the oath — sealed with
  3,264 kcal of Haven's harvest. The realm has its fires now, and one of them
  is yours. (Trust +12.)"
- d84–d147: weekly "Tribute paid: ~5,100 kcal walks out of the pantry toward
  Thornfield. The relationship holds." + a counsel demand answered d112.
  National held without a single realm wobble.
- Villagers act like people: Dagmawi cooks and teaches David snare-tying
  ("Hands patient. It takes three tries."), Muktar fishes and becomes speaker,
  Sofia dreams prophetic teeth-dreams, pairs "linger over the fire together,"
  barter stirs. The Binding beat is about the VILLAGE's oath, sworn by a named
  villager, not a UI flip.

Flags (blanks documented, not fixed — out of new-files scope or other levers):
- **Verbatim gossip recycling:** "💬 David/Isaac/James/Lena/Muktar/Dagmawi/Sofia/
  Vito whispers: 'Mara swears she met a stranger who knew things…'" — the same
  whisper template ~10 times across speakers and 90 days; "A traveler swears
  Stonebridge is feasting — (They're wrong…)" twice verbatim. Dialogue variety
  is thin (lever 3 territory).
- **Day-151 exile lines:** "The pantry is not yours anymore. Exile means exile —
  membership had no check-ins, but it had exactly one way to lose it." The
  player-persona hit exile mechanics on day 151 while the village held national
  (roster 7, starving). Possibly a real membership interaction, possibly a sim
  artifact — flagged for the loops, out of this probe's scope.
- **Arrears episodes are survivable:** d64–71 and d127–141 arrears spiked to
  13.5k–56k when the pantry couldn't cover the policy's 2×-tribute gate; trust
  dipped 84→58; full payments cleared arrears to 0 each time. The standing bar
  bends, doesn't break — but a thinner village would snap.

## VILLAGE ASSESSMENT — seed 303, the national run
What the village looked like: 12 strangers → a tributary fire of Thornfield's
5-fire realm by day 82, holding national to day 152. Roster 12 → 7; only 3
deaths in 152 days (2 combat, 1 contest) — the BELONG road is the QUIET road:
no war parties, no league pool to feed, just 5,000–6,000 kcal/week walking out
of the pantry (~700–850 kcal/day ≈ 6% of the village's daily need). The road's
food cost is not the binding constraint — survival to day 90 is, and that's the
combat/food baseline's fight.
Who thrived: Muktar (rose to speaker, swore the oath), Dagmawi (cook/teacher),
the tribute relationship itself (trust 30 → 100). Who died: 2 to wave-1
monsters, 1 in a contest — ordinary attrition, not the road's toll.
What knowledge was missing: which fire would consolidate — unknowable at day 20
(the pair seed is uniform random); the trader-rumor signal arrives ~day 43+,
which the v2 switch reads. What blank got filled: the BELONG road now has a
pursuing policy and a demonstrated national; the consolidator-switch is the
strategy, with the decline-spiral as its known risk.

## VERDICT
- **Primary metric:** v1 pilot 0/4 (GO not met — blind-bet strategy); v2
  follow-up 1/6 seeds reached BELONG national (beat staged d82, oath sworn,
  national held 70d). **The BELONG road is reachable in sims with no game-code
  change.** Every mechanic in the chain verified live: subordinate proposals
  (direct accepts AND counter band), +4/wk trust math, weekly tribute in real
  kcal, arrears accrual + clearing, demands answered, engagement-driven foreign
  consolidation (3→4→5 fires), the Binding beat, the oath, national as a live
  state.
- **Kill rule:** not triggered — visible effect vs baseline was large (4/4
  subordinate links vs 0/4; 1 national vs 0).
- **Convergence state: converging.** The road is demonstrated, not yet
  reliable: ~1/6 national, gated by (a) surviving to ~day 90 (combat/food
  baseline), (b) the consolidator lottery, (c) re-court luck after a switch.
  Recommended next: v3 policy with opinion-building before the switch (climb
  verbs), then a 12-seed confirm — coordinator's call.
- **For the scale-onramp axis:** BELONG joins covenant as a WORKING road
  (covenant: 5/24 in sim-food-r2; BELONG: 1/6 here with a first-generation
  policy). LEAD remains P≈0 (structural — needs the tending-verb fix from the
  diagnosis). The wall is now two broken roads and two working ones, not zero.

## Artifacts
- `scripts/policies/belongseek.js` — BELONG-road policy (new; extends
  scalecourt by require, overrides daily with a proposal shield + subordinate
  courtship + consolidator switch).
- `scripts/probe-belong-20261012.js` — smoke/pilot/forensic runner (new;
  `MODE=smoke|pilot`, `FORENSIC=1`, transcript capture with rolling buffer +
  keyword matches).
- `evidence/2026-10-12/belong-pilot-raw.json` — v1 pilot (4 seeds × 2 policies).
- `evidence/2026-10-12/belong-v2-raw.json` — v2 follow-up (6 seeds).
- `evidence/2026-10-12/belong-forensic303-raw.json` — FORENSIC daily trace, seed 303.
- No game-code changes. No src/js touched. Sibling files untouched
  (sim-food-r8 owns competent.js; scale-wall-fix owns hierarchy.js).
