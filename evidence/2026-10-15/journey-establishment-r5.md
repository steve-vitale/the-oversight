# Journey leg: ESTABLISHMENT (days 14–40) R5 — the FAT SUPPLY probe — 2026-10-15

**Status: EXECUTED, never analyzed.** This note completes the run post-hoc from
its raw outputs (`hidden_files/evidence/2026-10-15/journey-establishment-r5-*`:
run log, 4 census JSONs, 4 system-contact files, 23 transcripts). The run was
launched by a prior playtest-loop pass; the analysis below is this run's.

Rotation idx 1 → played leg 1 (fifth establishment pass). Canon read: CANON.md,
PRESERVATION.md (ladder), BEAR.md (fat sources), CONTESTS.md, MONSTER-WAVES.md.

## Pre-registered (MEASUREMENT.md §§9–12, 14) — as written in the r5 header

- **Question:** R3/R4 proved the render→pemmican ladder machinery end to end
  (51/51 proof) but measured 0 raw-fat slabs on 8/8 seeds — the knob never got
  its precondition. Can a deliberately fat-seeking player put raw fat in hand
  in the establishment window, via (a) ruin scavenging for the Trapper Handbook
  (pit_trap recipe's only fiction channel: readBook grants L3) then pit-trap
  craft/set, and (b) opportunistic wild_boar/javelina hunts?
- **Interesting:** raw-fat slabs >0 on ≥1 seed + ladder firing = the R3/R4 open
  item CLOSED; silence with the knob ON localizes the bind (book luck? hunt
  risk? boar absence? pit catch odds?).
- **Seeds:** 61, 82, 103, 124 (same as R1–R4, comparability). 40d, death-aware.
- **Policy:** competent, PINNED. Knobs: FATSEEK=1, RENDER_LADDER=1,
  INVITE_PARTY=1, FAVOR_ACCEPT=1, STALL_BREAK=1.
- **Binding metrics:** M1' fat supply: raw-fat slabs in player hands >0 on ≥1
  seed (d14–40); M2' ladder: render batches >0 on ≥1 seed GIVEN fat, pemmican
  ≥1 if render knowledge + sets; M3 traps set (any path) >0 on ≥2 seeds;
  M4 codex tale-share ≥25% on ≥1 seed; M5 ≥2/4 villages alive at day 40,
  pantry>0; M6 ≥20 full transcripts sense-read, 0 senseless flags; M7 probe:
  handbook found/read on ≥1 seed via FATSEEK.

## What was played

`scripts/journey-establishment-r5-20261015.js`. SEEDS=61,82,103,124 DAYS=40.
4 census JSONs, 23 transcripts, 4 system-contact files (System contact day 8
on all seeds), run log. Raw outputs in the goal hidden_files (see paths above).

## Village assessment (plain words)

**Seed 61 — the fat village.** 12 → 10 alive (2 combat deaths, days 29–30).
Pantry 47k → 74k (raw 50k + preserved 24k; 1 preserver staffed). NPC trapline
hums (7 npc_trap events). 2 contests (pilot aired day 23). One party join
(Jorge). Killer tales: Catalina (hummice), Raj (mirrormoth) — told and played.
Nobody starves.

**Seed 82 — the fighting village.** 12 → 9 alive (12 combat deaths — the
bloodiest seed; Maya/Aroha/Sanne among the monster-killers: mirrormoth,
ducks-in-a-row, glasswing, giant mosquito). 4 contests. Pantry 33k (raw 24k +
preserved 9k). Codex NPC share 0.87. Nobody starves. Villagers fight their own
fights, blow by blow.

**Seed 103 — the collapse.** 12 → 5 alive, village OVER day 35. Eight deaths:
combat/ambush/villager-combat days 17–34, then TWO STARVATIONS (Jorge Silva
day 33, Ivy Wang day 34 — autopsies: pantry 2100→0, scholar 2117→895 kcal).
The pantry drained all month (47k → 0) while monster pressure killed 6
foragers; the death spiral is textbook (fewer hands → less food → starvation).
The FATSEEK probe worsened the scholar's week: 19 ruin detours dragged them
wild days 15–17 (kcal 255→56→14, hp 60). See "probe artifact" below — the
collapse is primarily seed-driven (monster pressure), probe-aggravated.

**Seed 124 — the lean survivor.** 12 → 8 alive (4 combat deaths). 9 contests —
the widest show spread (pilot + 8). Pantry only 4.5k at day 40 (raw 1.6k +
preserved 3k) — the village eats its buffer but holds. Codex NPC share 1.0.

## The fat-supply verdict (the pre-registered question)

**M1' MISS — 0 raw-fat slabs on 4/4 seeds**, despite the knob firing hard:
handbook found+read on 2/4 seeds (103, 124; 19+27 ruin searches), pit traps
crafted (3+3), hunts attempted 0/4 (no wild_boar/javelina ever became the
encounter animal). The bind localizes precisely:

- **Book channel: WORKS.** Ruin foraging rolls the handbook; readBook grants
  pit_trap L3 (r4's fix holds).
- **Pit craft: WORKS.** 2 sticks → pit, held in tools; the competent policy's
  TRAPLINE_IDS includes pit_trap so crafted pits get set.
- **Pit catch: WORKS** (proven this run, `scripts/test-est-fatchain-20261015.js`
  11/11 GREEN): a pit on boar-bearing ground caught 3 wild boar + 1 deer in
  14 days — the advertised 40%/day is honest.
- **Boar → fat: WORKS.** Cleaning a boar carcass yields 3 raw fat slabs
  (butcher.fat=3).
- **Render: WORKS.** knowsTechnique('render') + fire → tallow.
- **The bind is REACHABILITY, not machinery:** (a) no boar/javelina hunt
  encounters in 4×26 establishment days; (b) tile wildlife is 1–3 random
  species — a set pit lands on boar ground only by luck, and the probe never
  confirmed its pits were on boar tiles; (c) the compound chain (ruin luck →
  boar-ground luck → 40%/day × species weighting → retrieval → butcher →
  render knowledge) never completed once in 104 fat-seeking days.

**M2' MISS (vacuous — no fat, no render, no pemmican).** M3 PASS (traps set on
4/4 seeds). M4 PASS (codex NPC share 0.87–1.0). M5 PASS on the letter (3/4
villages alive at day 40, pantries >0) — with the 103 collapse documented.
M6 PASS (23 transcripts, 0 senseless flags — 4 read in full below). M7 PASS
(handbook read on 2/4 seeds).

Per §14, M1'/M2' are NO-GO — recorded as misses, not re-scored.

## Metric review (§14)

The metric was arguably miscalibrated for the establishment window, not just
missed: the preservation ladder's payoff (rendered fat 90d shelf, pemmican
120d) is a long-haul build, and canon never promises it by day 40. But the
probe was HEAVY (near-daily ruin detours — see probe artifact) and *still*
got 0 fat in 104 days, which says the fat supply is luck-gated past what a
deliberate player can steer, even mid-game. Two candidate revisions for the
next run: (a) re-ask M1' on a 180d horizon (does fat EVER flow?); (b) the
design question underneath — should a tracker-knowledge read tell the player
which ground holds boar before they dig a 96-tick pit? That's a Steve-call
(skill-vs-luck on the fat channel), filed as a finding, not built.

## PROBE ARTIFACT (instrumentation bug — fixed this run as R6)

The FATSEEK "at most every 3 days" guard compared **game-days**
(`gd - ctx._fatseekDetourDay >= 3`), but a detour's own fights/contests
advance the game clock ≥3 days — re-arming the guard on the very next beat.
Measured: 9/18/19/27 detours per seed instead of ~7. The probe dragged the
scholar on near-daily ruin walks (seed 103: kcal 14, hp 60, wild, days 15–17),
burning foraging days and aggravating the 103 collapse. The 0-fat result
stands (it came DESPITE heavy seeking), but the probe was heavier than
designed. **Fix:** `scripts/journey-establishment-r6-20261015.js` gates the
detour on the harness loop-iteration (one per driven day) instead of the
game-day float; r6 output paths; 2-seed × 20d verification pilot run this
run (see below).

## People check (SENSE-TESTING — 4 full transcripts read)

- **61-day25, Benjamin (Portuguese-only, want=none):** language barrier played
  honestly — mime, one proud English word, a gestured walk invitation (the
  betrayal lure, declined cleanly: "Another time, then."). The beast-tell
  lands ("A dog-shaped silence at the treeline"). No fabricated history.
- **103-day19, Leo (ask_favor):** "We're down to 7 liters of clean water. Haul
  the creek with me at dawn?" — specific, checkable ("I checked the cistern
  three times hoping I misread it"). Committed, promised, and the run log's
  keptLines confirm the promise was KEPT ("You kept your word. That meant
  everything."). The favor loop closes end to end.
- **103-day31, Carlos (ask_favor, collapse week):** sick ("achy and wrung
  out, barely keeping food down... burning up"), asks for someone who knows
  sickness — the want is grounded in the week's actual disease events. Then
  the beast-naming debate with attributed votes ("The Big Stare" (Carlos,
  Onni, Ivy, Nathan); "The Big Beast" (Adedamola); "Big Ugly" (Jorge)).
  The village names its monsters through talk, exactly per canon.
- **82-day25, Said (ask_favor):** "The pantry's nearly bare... Another day
  like today and we're choosing who eats." Grounded in the real pantry.
  Committed. Tellbeast → gossip spreads ("Word gets around the haven") →
  naming debate with four attributed names.

**0 senseless flags.** Wants are concrete (water, sickness help, forage
help), options engage/deflect honestly, endings promise/plant/owe — and the
kept-promise beat fires. Villagers act like people.

## Reachable / fun / winnable (the leg)

- **REACHABLE:** yes — routines, specialists (thin: 1 preserver on one seed),
  pantry growth on 3/4 seeds, 2–9 contests/seed with the pilot aired on all 4,
  wave-1 fights the villagers fight themselves, System contact day 8. The
  render→pemmican ladder is reachable in machinery but luck-gated on fat —
  no seed reached it.
- **FUN:** the villages read as villages — favors owed and kept, shy
  strangers, monster-killers with reputations, shows that interrupt, naming
  debates. The 103 collapse is dramatic, not broken: teeth kill foragers,
  the pantry drains, people starve — the village bends and breaks honestly.
- **WINNABLE:** the leg doesn't end the game; 3/4 villages reach day 40 alive
  with food in the pantry. The establishment window does its job — the danger
  is teeth and the table road stays open downstream.

## Open items for the next establishment run

1. M1' re-ask on a 180d horizon (does fat EVER flow?) — metric revision (a).
2. Steve-call: tracker-knowledge read of boar ground before digging (skill
   vs luck on the fat channel) — filed, not built.
3. Seed-103-class death spirals: the food-economy loop owns the balance
   question (monster pressure → forager loss → pantry drain → starvation);
   this run documents the dynamics, doesn't tune them.
