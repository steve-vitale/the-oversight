# Cooking — first numbers (arm sim-cookfirst-a)

Run fleshout-20261110T1915Z, Loop A. Coverage Program Tier 2 #1 (Steve order
2026-11-10 11:11 CST "Measure all"). Prereg:
evidence/2026-11-10/sim-cookfirst-a-prereg.md (committed BEFORE any judged
sim). Band 180201–180208, 8 seeds, competent policy verbatim, 150d
death-aware horizon. Zero src/js. Instrument + proof:
scripts/cookfirst-instrument-20261110.js, scripts/cookfirst-driver-20261110.js,
scripts/cookfirst-analyze-20261110.js, scripts/test-cookfirst-a.js (44/44).

## Verdict: GO on instrument validity + complete first-numbers capture

| GO check | Result |
|---|---|
| Every transform classified by method + caller path, none 'other' | PASS — 215/215 village-meal, 0 other |
| Every wrapped method's call path verified live or marked dead | PASS — 8 wraps live in the pilot; 8 wraps proven in fixtures, never called by the engine under competent (marked dead, see below) |
| Neutrality: OFF leg matches instrumented leg on days + end pantry kcal + deaths | PASS — 8/8 exact |
| Instrument errors 0 | PASS — 0 on all seeds, all legs |
| Complete first-numbers capture | PASS — per-seed tables for metrics 1–6, sense-test scenes quoted |

A GO verdict makes NO landing claim and spends NO confirm band: there is
no lever here to land.

## The headline: the scholar never cooks, and the village does all the cooking

In 857 village-days across 8 seeds, the scholar's fire was never lit for
cooking: **cookFood 0, cookAll 0, preserveFood 0, renderFat 0,
makePemmican 0, askSpecialist 0** — and the scholar ate by the bulk
`eat()` path only (eatOne 0, eatStashOne 0). The only scholar-side cooking
verb that ever fired was **cleanCarcass: 65 calls** (2–39/seed; seed
180207's 39 is the outlier — a carcass-rich seed). Every scholar learned
cleaning by trial (clean:trial 8/8 seeds); only 2/8 scholars ever learned
cooking at all (cook:watched, both via watching a specialist); **no
scholar ever learned preserving or rendering, and no pemmican was ever
made.**

The reason is in the policy, not the engine (verified by code read after
the pilot): competent's `cookPack` only cooks pack items with
`foodState === 'raw'` — but **no ordinary food ever carries foodState
'raw'**. Grep of src/js + src/data: 'raw' as a foodState exists only on
fat (`foodKind === 'fat'`, kcalEach 0 — skipped by cookPack's own
`kcalEach > 0` check) and on human meat (`meat_human` — routed to the
cannibal act, never cooked). Cleaned meat is 'cleaned', must-cook plants
carry rawKcal with no foodState, identified plants are 'ready'. The
policy's cook step is a dead branch by construction. Finding appended to
sim-findings.md (fix candidate for a later build arm: cookPack should
cook cleaned meat and must-cook plants, the items cookFood actually
handles).

What cooking DOES happen is all village-side, and it is substantial:

- **The nightly village meal cooks.** `villageMeal()` draws with
  `cook:true`: 215 cookTransform valuations across the pilot, and
  121,129 kcal actually eaten cooked via the meal. The meal is the
  bigger draw: 1,763,326 kcal taken with cook:true vs 1,026,340 with
  cook:false.
- **The cook duty smokes the racks.** 460 batches preserved, 390,085 kcal
  saved from rot, on 636 staffed cook-duty days. The duty is the whole
  preservation system in practice.
- **The scholar eats preserved food.** Of 410,125 kcal attributed eaten:
  preserved 194,631 (47.5%), unknown-state 135,250 (33.0%), ready
  70,180 (17.1%), fire-cooked 7,106 (1.7%), carcass 1,710, cleaned
  1,248. The scholar's diet is the duty's output plus unidentified
  staples — almost never something cooked at a fire.

## Per-seed tables

Wall numbers (median survival 137d; 6/8 village-lost, 2/8 survived;
wins 0, national 0, table 0; wave 5 unlocked on 4/8; regional 5/8):

| seed | days | end | scale | wave | standing | deaths | end pantry |
|---|---|---|---|---|---|---|---|
| 180201 | 138 | village-lost | regional | 5 | 365 | 96 | 2,637 |
| 180202 | 137 | village-lost | regional | 5 | 415 | 73 | 12,823 |
| 180203 | 50 | village-lost | village | 3 | 50 | 39 | 0 |
| 180204 | 150 | survived | regional | 5 | 405 | 94 | 7,958 |
| 180205 | 75 | village-lost | regional | 4 | 199 | 63 | 0 |
| 180206 | 53 | village-lost | village | 4 | 125 | 49 | 0 |
| 180207 | 104 | village-lost | regional | 4 | 199 | 71 | 0 |
| 180208 | 150 | survived | regional | 5 | 450 | 98 | 24,400 |

Cooking events by method (all seeds): cleanCarcass 65; cookFood 0; cookAll 0;
preserveFood 0; renderFat 0; makePemmican 0; askSpecialist 0.
Transforms (cookTransform): village-meal 215, all perfect outcome, all
knows=true — the meal cooks at perfect outcome by abstraction. Scholar-fire
0, specialist 0, batch 0.

Calories:
- Village-meal transform valuations (whole-stack, see caveat below):
  raw 1,531,450 → cooked 2,929,150. The meal values whole staple stacks
  at the cooked rate; only the drawn units are eaten cooked (121,129 kcal).
- Scholar eating (attributed 410,125 kcal; engine tele total 419,963;
  gap 9,838 = 2.3% — absorption adjustments, see reconciliation):
  preserved 194,631 / unknown 135,250 / ready 70,180 / cooked 7,106 /
  carcass 1,710 / cleaned 1,248. Cooked (any rung beyond raw/cleaned):
  201,737 (49.2%) — but that is almost all 'preserved'; fire-cooked is
  1.7%.
- Village meal draws: cook:true 1,763,326 kcal taken; cook:false
  1,026,340. Drawn by state: none (no-state staples) 2,404,049 (83.4%),
  ready 175,980, preserved 157,845, cleaned 41,534, cooked 10,258.

Skill gains + teaching:
- Scholar techniques: clean:trial 8/8; cook:watched 2/8 (seeds 180203,
  180207); preserve/render: never. No pemmican (needs rendering knowledge).
- Villager foodXp (preserver, max reached): 28 villagers earned XP at
  the racks. Top: gen_ddw434u (mortician) 60, chen_wei (beekeeper) 56,
  diana_osei (paramedic) 49, jesse_cortez (line cook) 40, gen_aiadb0h
  (rancher) 37. Five villagers reached 30+ XP (self-taught skill 3).
  The duty goes to whoever is free — a mortician became the village's
  best preserver — and the work teaches: chen_wei went 0 → 39 XP in
  ~40 days on the racks, then plateaued when no about-to-rot surplus
  was left to smoke.
- Teaching moments: askSpecialist 0 (the scholar never asks); 'watched'
  learns 2 (the scholar learned cooking by watching, twice, on the only
  two seeds where a specialist cooked nearby). Villager→villager
  cooking teaching: NO code path exists (teachSkill covers skill-lane
  abilities only) — UNMEASURABLE-BY-DESIGN, recorded as a finding.
- Deeds: cooking/preserving deeds all villager-side (duty resolutions);
  0 player cooking deeds — the scholar never cooked, so the craft track
  never credited them.

Spoilage avoided:
- Duty: 460 batches / 390,085 kcal preserved (the rescue).
- Scholar-side: 0 about-to-rot kcal rescued (no scholar transforms);
  0 spoiled stacks refused at the fire; 0 pemmican.
- Snapshot spoiled-present: 0 kcal on every day — the dawn sweep purges
  pantry rot BEFORE the daily snapshot, so the snapshot cannot see it.
  The say corpus proves rot still happens (see sense-test): pantry
  stores are thrown out and carcasses go bad on the ground. The
  spoiled-lost inference stays INFERRED and unmeasured (metric review).

Who cooks:
- Scholar: nobody — 0 fires lit for cooking in 857 days.
- Village meal: the abstracted village cook (pantryDraw cook:true),
  every night, at perfect outcome.
- Duty holders (days): chen_wei, beekeeper, 96d (preserver 1);
  owen_smith, hunting guide, 62d (preserver 2); jesse_cortez, line cook,
  47d (preserver 2); gen_ddw434u, mortician, 65d (preserver 0 → earned
  3 by doing it); onni_korhonen, chimney sweep, 41d; plus 20+ others
  for a day or two each. Food occupations are NOT the cooks — whoever
  is free holds the duty, and the racks teach them.

## Reconciliation

- tele('eat') total 419,963 vs wrap-attributed 410,125 (gap 2.3%).
  EXPLAINED, not a miss: `eat()` adjusts absorbed kcal after the
  wrap's gross count — shellgut −25%, engorge +20%, disease absorption
  debuff — so the wrap measures gross kcalEach consumed by foodState
  and tele measures net absorbed. Per-seed gaps: 1.6% / 2.4% / 0.0% /
  7.5% / 0.0% / 0.0% / 3.0% / 0.9%. The 7.5% seed (180204) is the
  largest; the mechanism is identified in code (game.js eat(), lines
  ~28160–28200), not proven per-seed — a later run can attribute the
  gap to the scholar's statuses if it needs the split.
- Transform stack-valuation caveat: pantryDraw calls cookTransform on
  the WHOLE stack to price the draw, and only monster-gated cleaned
  meat is flipped to cooked for the uneaten remainder. The 2,929,150
  "cookedTotal" is therefore stack-valued and re-valued nightly — the
  honest cooked-and-eaten number is drawCookedKcal 121,129. The
  analyzer's transformKcalByPath must not be quoted as kcal cooked.
- Dead wraps (proven live in fixtures, 0 calls in the pilot):
  cookFood, cookAll, preserveFood, renderFat, makePemmican,
  askSpecialist, eatOne, eatStashOne. Their zeros ARE the finding
  (the policy never triggers these paths), not an instrument gap — the
  wraps are proven to record when called (proof C7/C9/C10).

## Sense-testing (SENSE-TESTING LAW)

The village's food life reads as people, not counters. The racks voice
is warm and specific — "🍲 Tommaso cooked for the haven — meals
stretched. Tommaso worked the smoke racks too — 1 batch preserved
(~594 kcal, keeps for weeks)." (seed 180207, day 10); "🍲 Amahle
cooked for the haven — meals stretched. Amahle worked the smoke racks
too — 4 batches preserved (~1788 kcal, keeps a couple of weeks)."
(seed 180208, day 7). The duty-holder's name rides the line every time;
no two seeds repeat the same cook.

The spoilage voice is self-aware in a way the numbers are not: "The
village threw out spoiled stores: Unknown flesh. Diana mutters:
\"Should've smoked that. Fresh stuff keeps a day or two on the shelf —
the smoke rack is right there.\" (pantry)" (seed 180201, day 9). The
game itself narrates the missed preservation — and on seed 180208 the
same line fires again on day 9 ("Expedition haul. Owen mutters:
\"Should've smoked that...\""). The mutter is the same shape twice
because the event is the same; the mutterer and the stores differ, so
it reads as a repeated lesson, not a repeated line.

The saddest honest line in the corpus is not about the pantry: "On the
carcass nearby, The Anaconda Empress (carcass), The Living Wire
(carcass), Drum-Belly (carcass), Hushpuppy (carcass) went bad — maggots,
smell, the whole sad story. Leaving it had a cost." (seed 180206,
day 11). Four kills rotted where they fell because nobody cleaned them
in time — the village's hunting outran its butchering.

Fire-side life is dense and human: "Sam and Roberto lingered over the
fire together." / "You catch fragments by the fire — Roberto telling
Delwar about A man, maybe 50s... The truth left this story two fires
ago. What's left is better theater." / "Village meal: +1200 kcal, +1L
water from the communal pantry. (Half ration — they don't trust you
yet.)" (seed 180201, day 1).

Flagged as robotic: nothing in the cooking voice itself. The robotic
thing is the ABSENCE: the scholar never cooks, so the "Cooked X: A →
B kcal" report line — the one cooking line the player would actually
read — fires 0 times in 857 days. The fire is where the village lives
and the scholar never uses it.

## Village assessment (plain words)

Eight villages, and in every one the pattern is the same: the village
cooks, the scholar doesn't. The nightly meal and the smoke racks carry
the whole food ladder — cleaning is the only rung the scholar ever
touches (65 carcasses cleaned, every scholar learning it by trial in
the first days), and even that is the scholar doing the one job nobody
else will do on the spot. Smoking, rendering, pemmican — the ladder
above cleaning — belong entirely to whichever villager happens to be
free that day: a mortician, a beekeeper, a paramedic, a chimney sweep.
They learn it by doing it, and by the end some of them are genuinely
good at it (skill 3). The scholar, meanwhile, eats what the racks
produce and what the garden hands over, and never once stands at a
fire with a pot — because the policy that plays them only looks for
food in a state no food ever arrives in.

The villages that lived longest (180204, 180208, 150 days) are the ones
whose racks ran longest (61 and 87 batches) and whose duty holders
stayed alive to keep smoking. The villages that died early (180203 at
day 50, 180206 at day 53) lost their people before the racks could
matter. Nothing here reached national or the table — the scale wall
stands (0/8 national, 0/8 table, 0 wins), same as every recent run.

## Blanks filled / documented

- FILLED (measurement): cooking's first numbers — the whole ladder
  counted per rung, per caller, per seed. The instrument is proven and
  reusable (cookTransform backstop + pantryDraw + duty tap).
- DOCUMENTED (finding): the competent policy's cook step is a dead
  branch (cookPack 'raw' gate) — appended to sim-findings.md.
- DOCUMENTED (finding): villager→villager cooking teaching has no code
  path — appended to sim-findings.md.
- DOCUMENTED (limitation): spoiled-lost kcal stays inferred, not
  measured — the dawn sweep purges rot before the daily snapshot.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The "share of eaten kcal cooked" headline (49.2%) conflates the duty's
  preserved food with fire cooking. The honest split is: preserved
  47.5%, fire-cooked 1.7%. A next run should headline fire-cooked
  separately from preserved.
- transformKcalByPath must be relabeled stack-valued for the
  village-meal path (whole stacks, re-valued nightly) — or the
  instrument should record drawn units alongside the transform so the
  cooked-and-eaten number comes from the same record.
- The spoiled-lost inference needs a same-tick capture (a wrap on the
  dawn sweep's purge, or a tele event) — daily snapshots cannot see
  rot that is purged before they run.
- The eat reconciliation gap (tele net vs wrap gross) is explained in
  mechanism; if a later run needs the split, attribute the gap to the
  scholar's statuses (shellgut/engorge/disease) per seed.
- The talkturn-a cost bar is already known-wrong; this arm carries NO
  cost bar and does not re-judge it.

## Base + landing

Base at spawn: master 70e3af870. No src/js change. Commits on branch
sim-cookfirst-a: prereg 186fe089, instrument + proof 44/44 a6dfdeb3.
Corpus + evidence + analyzer fix to follow in the next commit. Do NOT
push, do NOT bump versions, do NOT verify live. Do NOT merge — the
coordinator merges with --ff-only.
