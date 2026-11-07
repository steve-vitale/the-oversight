# sim-prodcollapse-diag-a — PRODUCTION-COLLAPSE DIAGNOSIS (arm sim-prodcollapse-a)

Run: oversight-flesh-out-loop, run fleshout-20261107T1820Z (Loop A), axis
food-economy (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-prodcollapse-a, branch sim-prodcollapse-a.
Substrate: branch rebased onto master tip f5650d4eb before any sims
(evidence-only addendum on a4b2210d6); prereg committed as 75256f04e
BEFORE any judged sweep; instruments committed as a6c987a78 (proof
9/9). DIAG ONLY — zero src/js, no lever, no default flip.

## Question (from the prereg)

Seed 96203 collapsed in the sibling diagnosis (produced ~70% of need
for a month, 3 starvation deaths, throttle never engaged). When
produced/need falls below ~0.8 for weeks, WHAT is the binding
constraint? This arm re-ran the same band itself (never reading the
sibling tree's uncommitted corpus) and decomposed every collapse
episode it found.

## Method

- Policy competent ONLY, unmodified. Env PLENTYDEPRI=1, DEPOSITGATE=1
  (shipped defaults, FATAL-asserted). Horizon 150d death-aware.
  Seeds 96201–96208 (the sibling band, reused deliberately).
- Instruments: scripts/sweep-prodcollapse-diag-a.js (recorder + bare
  mode), scripts/analyze-prodcollapse-diag-a.js (episode detector +
  counterfactual ranking + G2/G3 judges),
  scripts/test-prodcollapse-diag-a.js (proof 9/9: guards, structure,
  determinism, neutrality smoke, detector unit test, accounting
  residual 8.4% of outflows on the 5-day seed).
- Collapse episode (pre-registered): maximal run of days with the
  trailing-14d produced/need ratio < 0.80, length ≥ 7 days.
- Counterfactuals (pre-registered, single-factor kcal gains vs the
  pooled non-episode baseline — NOT additive, they overlap):
  KNOW / HEALTH / GRIT / LABOR / YIELD / DRAIN / SPOILAGE / NEED.
- Corpus: evidence/2026-11-07/prodcollapse-a-corpus/ (8 recorded
  per-seed JSONs + 8 bare fingerprints + sweep-competent.json).
  Analyzer output saved in the coordinator's run log; numbers below
  are quoted from it.

## Results — gates (judged ONLY against the prereg header)

- G1 det-gate: PASS (proof L5: same seed twice → identical per-seed
  JSON; the judged sweep's recorded pass is deterministic by the same
  recorder).
- G2 neutrality: PASS — recorded == bare fingerprints on all 8 seeds
  (daysAlive, endReason, rank, maxWave, national, table, win,
  deathCauses, deathKeys, finalPop identical).
- G3 corpus: MISS on the letter — see Metric review. 3 of 8 recorded
  files have daySeries length daysAlive−1 (96203 missing day 5 only;
  96205 missing death day 122; 96206 missing death day 146). Every
  other leg is valid: flowSeries covers every day on all 8 seeds,
  mealRows deduped everywhere, all 8 bare fingerprints present. The
  corpus is complete for the verdict; the check as written was
  mis-specified (a snapshot cannot exist for a day the village dies
  before policy.daily runs, and one mid-run snapshot day was lost to
  an instrument throw).
- G4 classification: PASS — 2 episodes found on 2/8 seeds, EVERY
  episode classified by primary cause with quoted ledger rows.
  Prevalence 2/8 seeds.

## Results — pooled (reproduction check vs the sibling diagnosis)

- produced/need = 1.054 pooled (15,539,857 / 14,741,476) — EXACTLY the
  sibling's 1.054, on an independent re-run. ate/need lower (ate
  13,186,373 — the village ate ~89% of need; the gap is hunger
  carried day to day).
- Villager starvation deaths = 3, all on 96203, all pantry 0
  freshDays 0: d51 Franz, d58 Oscar, d58 Emma — the SAME three
  deaths, same days, same names as the sibling's grounding. The
  collapse reproduced exactly.
- Death causes pooled (124 deaths): the wild 72, monster 17,
  sickness 10, ambush 4, dehydration 3, combat 3, starvation 3,
  arena 6, a stranger 1, gavel 1, a wound that wouldn't close 1,
  contest 1, alien 1, the night 1. The wild — not hunger — is the
  band's biggest killer.
- Throttle engaged 662/911 village-days (72.7%) pooled — but 0.0%
  during the 96203 episode (easing exonerated again, as the sibling
  found).
- WALL: national 0/8, table 0, wins 0, wave reach 5 on 2 seeds
  (96204, 96206), median survival 115.5d, max 150d. The scale wall
  stands.
- Non-episode baseline (pooled 855 village-days): kf 1.933,
  healthFrac 0.862, realized mult 0.916, food-duty-days 2.8/day,
  duty 193 kcal/food-duty-day, need 16,369/day.

## Episode 1 — seed 96203, d26–d66 (41 days): HEALTH

- Trailing-14d produced/need: min 0.516, mean 0.672. Production
  window d13–d66. Shortfall S = 9,616 kcal over 41d (need 593,144;
  produced 390,188; duty 134,540).
- Episode means vs baseline: kf 1.884 (base 1.933 — knowledge fine),
  healthFrac 0.553 (base 0.862 — health HALVED), realized mult 1.008
  (base 0.916 — the villagers worked HARDER than usual),
  food-duty-days 4.1/day (base 2.8 — MORE food labor, not less),
  duty 796 kcal/food-duty-day (base 193 — duties paid BETTER than
  usual), need/day 14,467 (base 16,369 — the village was shrinking).
- Counterfactuals: HEALTH 218,669 kcal >> DRAIN 28,103 > KNOW
  10,073 > GRIT / LABOR / YIELD / SPOILAGE / NEED all 0.
  PRIMARY CAUSE: HEALTH (wounds/sickness).
- Core window (38 days with daily produced/need < 0.8): S = 12,844,
  primary HEALTH again (203,051 kcal). The classification does not
  depend on the episode's trailing edge.
- Ledger: 12 deaths in the episode — 7 sickness, 3 starvation,
  1 monster, 1 stranger. The sickness deaths open the episode:
  d26 Tashi, d28 Jovan, d38 Soad, d44 Olivia, d45 Valeria, d53
  Shanice, d63 Takashi — all with the pantry under 13,118 kcal and
  freshDays under 2.4, most under 1.0. Health trajectory (meanHealth):
  100 (d1–6) → 97 → 85 → 75 → 58 (d22–26) → ~60s → 45 (d57–61).
  Pop 12 → 4. FreshDays 5.6 (d7–11) → 0.2–0.5 by d42. The say-lines
  name it a fever: "🤒 Franz is on the mend — the fever broke."
  (d28), "🤒 Olivia is on the mend — the fever broke." (d38). Some
  recovered; seven did not.
- Ledger, labor: ZERO forage and ZERO hunt resolutions in the whole
  66-day run. Episode duties: garden 39, fish 130, deadfall 9,
  water 53, cook 19. Episode stocked: Fish catch 116,081;
  'Foraged food' 18,459 — all of it from ambient paths (the player's
  own foraging, NPC ambient foraging, expedition returns), NOT from
  the forage duty.
- Ledger, drains: removedKcal 1,730 + takeBulk 26,373 = the
  prereg-defined DRAIN 28,103. But takeBulk is the PLAYER moving
  food from the pantry into their pack — food the player then eats
  while away (packMeal), not food lost. The TRUE drain (tribute /
  demands / sortie rations) is 1,730 kcal. Corrected ranking:
  HEALTH 218,669 >> KNOW 10,073 > true drain 1,730. (See Metric
  review: the DRAIN channel as defined conflates a pack transfer
  with a true loss.)
- Ledger, season/weather: fall 15d, winter 26d; clear 33, rain 5,
  cold 3. Winter is the season of the collapse, but the village
  stopped producing because it was sick, not because it was winter:
  forage duty was already zero before winter, and the fish/garden
  duties kept paying.
- Ledger, throttle: engaged 0.0% of episode days. The easing lever
  cannot touch this collapse — there was nothing to ease off from.

## Episode 2 — seed 96206, d129–d145 (17 days): HEALTH (corrected)

- Trailing-14d produced/need: min 0.712, mean 0.746. Shortfall
  S = 3,792 kcal over 17d (need 152,910; produced 115,728;
  duty 27,990).
- Episode means vs baseline: kf 1.703 (base 1.933), healthFrac
  0.752 (base 0.862), mult 0.985 (base 0.916), food-duty-days
  3.2/day (base 2.8), duty 509 kcal/food-duty-day (base 193),
  need/day 8,995 (base 16,369 — pop had fallen to ~5).
- Counterfactuals as pre-registered: DRAIN 19,577 > HEALTH 17,056 >
  KNOW 15,613 > rest 0. PRIMARY CAUSE (prereg definition): DRAIN.
  BUT the DRAIN is 100% takeBulk (19,577) with removedKcal 0 — the
  whole "drain" is the player stocking their pack, not a raid or
  tribute. On the corrected split the substantive ranking is
  HEALTH 17,056 > KNOW 15,613 > true drain 0, and the core window
  (9 days with daily produced/need < 0.8) already names HEALTH
  primary (13,746 kcal). Classified as HEALTH with the prereg
  DRAIN number reported honestly above — see Metric review.
- Ledger: 6 deaths in the episode — 5 "the wild", 1 alien (d136
  Pasquale, d138 Aroha, d143 James, d143 Farid, d144 Seo-jun,
  d145 Nduku). Pop 7 → 1 over the episode. This is an endgame
  village being eaten by the wild while it shrinks to one person;
  the production ratio falls because the living are few, hurt, and
  know less (kf 1.703 — the knowledgeable died first or the
  survivors are newcomers).
- Ledger, labor: garden 15, water 8, fish 40, cook 6; stocked Fish
  catch 20,201, 'Foraged food' 7,789 (ambient), Expedition haul
  1,005. No forage/hunt duty resolutions. Throttle engaged 11.8%
  (2 of 17 days) — a small-pop artifact: with pop 1–2, the pantry
  holds many "fresh days" for one person even while the village
  dies.
- Instrument caveat: awayCount reads 9–14 while pop is 5–7
  (pop 1 with away 12 on d145) — v.away accumulates stale entries
  for dead villagers and cannot be read as "villagers away today".

## Near-misses (why the ≥7-day bar is right)

- 96201: trailing ratio < 0.80 on 3 days only (d1–d3, min 0.775).
  96205: 1 day (d1, min 0.795). 96207: 5 days (d1–d5, min 0.649).
  96202/96204/96208: never below 0.80. EVERY sub-threshold dip
  outside the two episodes is a days-1–5 startup dip (stranger
  factor + low knowledge; 96207's window shows meanHealth 98.7,
  sick 0.0, no deaths). The detector separates startup from
  collapse cleanly.

## The labor picture (pooled, 911 village-days)

- Resolved duties: fish 1,907; water 1,530; cook 928; deadfall 607;
  garden 593; forage 114; wood 1; hunt 0.
- Duty-stocked kcal: 'Foraged food' 325,521; Expedition haul
  298,935; Fish catch 298,106; Snared meat 22,392; Expedition meat
  15,150; pit meats ~10,893; System-replicated stew 800; Trial
  feast 1,800. Total duty-stocked ≈ 0.97M kcal vs personal
  produced 15.54M — duties are ~6% of all food. Personal
  production IS the food economy; duties cannot cover a production
  collapse, and on this band they did not need to — they ran above
  baseline through both episodes.
- The forage and hunt duties are nearly unused under the competent
  policy: 114 forage resolutions and 0 hunt resolutions in 911
  village-days. Most 'Foraged food' comes from ambient paths (the
  player's own foraging, NPC ambient foraging, expedition and
  departure foraging — game.js lines 17133/19031/19079/21594/
  27954/28832/28850), not the duty. The garden duty resolved 593
  times and stocked ZERO 'Garden harvest' kcal on the whole band:
  the branch only pays when a live plot holds a ripe, safe plant,
  and that never happened — 593 days of tending with no harvest.
- The depletion/vigor mechanism the prereg asked about: NEVER
  engaged on this band in a measurable way. The recorder captured
  vigorSum/vigorN on every forage call — there were only 114 calls
  pooled and none during either episode (mean avgVigor at forage
  is undefined in both episodes because no forage happened). Tile
  vigor is not what capped production here. The ground was never
  the binding constraint because the village barely foraged it.
- Season/weather: winter covers most of the 96203 episode, but the
  collapse opens in fall (d26) with the fever, and the labor and
  health ledgers move before the season does. Season is a
  bystander, not a cause, on this band.

## Sense (SENSE-TESTING LAW — transcripts read, beats quoted)

The village narrates its own dying coherently; nobody sounds like a
counter. During the 96203 fever:

- "Soad had the day of their life — 1482 kcal. Two days of food
  from one person." (d28 — a good day is still a good day, mid-collapse)
- "Nino came back with 312 kcal of something edible. The pantry
  breathes." (d58)
- "💀 Oscar starved. Slowly. Nobody eats much tonight. The pot
  stays full and nobody touches it." (d58)
- "📖 The entry for Oscar is finished. No more pages." (d58)
- "Nobody's talking much. The fire feels smaller tonight." (d58)
- "Soad is hurt — a fall, a thorn, a bad step. (health 3/100)" (d38)
- Teaching and mentoring CONTINUE through the collapse: "📓 Codex:
  Shanice taught Olivia Field Dressing." / "Shanice taught Franz
  Field Dressing." / mentor bonuses growing (d26–d28). Villagers act
  like people while starving: they teach, mend, linger over the
  fire, and grieve by name. No robotic, static, or repeated-behavior
  flag raised by this corpus.

## Village assessment in plain words

The village did not starve because it forgot how to feed itself.
It starved because a fever swept through it starting around day 12:
health fell by half, and since a villager's daily food IS their
health times their knowledge times their hands, half-strength people
make half the food. The pantry drained, three people starved, and
the village died on day 66 with four people left. The food duties
kept working — the fishers fished more than usual, the gardeners
tended, the villagers pushed harder than their normal effort — but
duties are a thin slice of the food, and no duty replaces half the
village's own daily catch. The second collapse, on seed 96206 at the
end of a long run, tells the same story from the other side: the wild
killed five people in two weeks while the village shrank to one
person, and the food fell with the people. In both collapses the
binding constraint is the bodies of the villagers, not the ground,
not the pantry, not the throttle, and not the labor chart. The food
system held; the people broke first.

## Blanks filled or documented

- FILLED (diagnosis): the collapse regime's binding constraint is
  HEALTH — the linear health multiplier on personal production
  (villagerExpectedDaily × health/100) is the amplifier that turns
  a sickness wave into a starvation collapse. Both episodes classify
  HEALTH on the corrected accounting; no other channel comes close
  (96203: HEALTH 218,669 kcal vs next 10,073; 96206 core window:
  HEALTH primary).
- FILLED (reproduction): the sibling's 96203 collapse reproduces
  EXACTLY on an independent re-run — same pooled 1.054, same three
  starvation deaths, same days, same names. The diagnosis rests on
  a reproduced fact, not a one-off.
- FILLED (labor): the competent village's food runs on personal
  production (~94%) + fish/expeditions/ambient foraging; the
  forage/hunt/garden duties are marginal or zero-yield on this band.
  Any future food lever must reckon with that split: duty levers
  move ~6% of the food.
- DOCUMENTED, not fixed (diag only — zero src/js): the NAMED NEXT
  ARM is HEALTH — the fever/wound → production link. Two questions
  for it: (a) what spreads the fever and whether villagers can
  avoid or treat it (vectors, water, food, contact — a disease-
  pressure look, lever 7, grounded in docs/DISEASES.md); (b)
  whether a sick villager's production should fall as steeply as
  health/100 — the linear multiplier is the whole collapse
  amplifier, and a gentler slope (or sick-leave: the village
  carrying its sick) is the honest lever shape to test. Do not
  land it here.
- DOCUMENTED (instrument gaps for the next run — see Metric review):
  DRAIN must split takeBulk from removedKcal; assignment snapshots
  must be captured pre-resolution (forage never appears
  post-resolution); awayCount is stale; the day-5 snapshot gap.

## Metric review (post-run — §14: the metric proved wrong in three places, recorded here)

- G3 (daySeries length == daysAlive): MIS-SPECIFIED. A snapshot is
  taken in policy.daily, which does not run on a day the village
  dies before it (96205 d122, 96206 d146 missing), and one mid-run
  snapshot day was lost to an instrument throw (96203 d5 — the
  wrapper's try/catch skips the push on error; the episode days
  d26–d66 are all present, so the verdict is unaffected). Proposed
  revision for the NEXT run: daySeries length == daysAlive OR
  daysAlive−1 with the missing day named; flowSeries (which covers
  every day on all 8 seeds) is the completeness check. The G3 miss
  is recorded as a miss — the corpus is not re-scored as a pass.
- DRAIN (removedKcal + takeBulk): MIS-SPECIFIED. takeBulk is a
  transfer to the player's pack (eaten while away via packMeal),
  not a loss; only _removePantryKcal is a true drain. On this band
  the conflation nearly flipped episode 2's classification (DRAIN
  19,577, all takeBulk, vs HEALTH 17,056). Proposed revision:
  split the channel into DRAIN-TRUE (removedKcal) and PACK-TRANSFER
  (takeBulk) and rank on DRAIN-TRUE. The prereg-defined numbers
  are reported above as defined; the corrected ranking is shown
  alongside, not substituted silently.
- Assignment snapshot (per-task mean competence, forager headcount):
  TIMING-BIASED. Assignments resolve during the day and are deleted
  (game.js:6657), so the post-work snapshot never sees a forage
  assignment (foragers > 0 on 0/911 snapshot days) and understates
  every task. Labor conclusions in this diagnosis rest on the
  RESOLVED counts (complete) instead. Proposed revision: capture
  assignments in a pre-resolution hook (or count assignments from
  the resolve wrapper's first sighting) next run.
- awayCount: STALE. v.away accumulates entries for dead villagers
  (96206 d145: pop 1, away 12). Do not use as "villagers away
  today" without cleaning against the live roster. Not a verdict
  input here; recorded so the next run does not lean on it.
- Detector check: the ≥7-day length bar correctly excluded all
  startup dips (every sub-threshold run outside the episodes is
  days 1–5). No revision proposed to the episode definition.
- The G2 neutrality pass (recorded == bare on all 8 seeds) and the
  exact 1.054 reproduction together mean the recorder is a clean
  witness: nothing it measured, it caused.

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

- Garden duty never pays on this band: 593 resolutions, 0 kcal of
  'Garden harvest' (plots never hold a ripe, safe plant). Sowing /
  ripening in sims needs a look.
- Hunt duty never staffs under the competent policy: 0 resolutions
  in 911 village-days; 'Game meat' never stocked. The hunt leg is
  decoration in competent sims.
- Forage duty is marginal (114 resolutions pooled); most 'Foraged
  food' arrives via ambient paths, not the duty.
- Fever as the collapse driver: the disease behind the 96203
  collapse is unnamed in the corpus ('sickness' deaths, 'the fever
  broke' in the say-lines). A disease-pressure look (lever 7) at
  what spreads it is the natural follow to the named HEALTH arm.
- The wild killed 72 villagers pooled — the band's biggest death
  cause by far (monster 17, sickness 10). Wild pressure, not
  hunger, is what kills villages on this band.

## Telemetry deviation check

Ran `node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-07/prodcollapse-a-corpus/prodcollapse-a-competent-s*.json'
--metrics national,table,wins,exiled`:

- LOUD: national disappeared: baseline 12 -> current 0 (n=8 files)
- LOUD: table disappeared: baseline 16 -> current 0 (n=8 files)
- LOUD: wins disappeared: baseline 16 -> current 0 (n=8 files)

Verdict: EXPLAINED, regime artifact, not a bug. Competent-only
150d sims reach national/table/wins 0 — the identical LOUD lines
the awayconfirm run hit for the same reason, and the identical
result the sibling prodstore diagnosis got on this same band. The
baseline was seeded from a corpus in a different regime (policy
mix / horizon where national/table/wins occur). The baseline was
NOT rolled forward.
