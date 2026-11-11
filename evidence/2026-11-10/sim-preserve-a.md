# Preservation — first numbers (arm sim-preserve-a)

Run fleshout-20261110T2215Z, Loop A (adopted by run fleshout-20261111T0115Z —
the 2215Z run died in the EPERM flap with the pilot corpus complete but the
evidence unwritten; this adoption verified the corpus, fixed the split-stack
bugs it exposed, and wrote the evidence). Coverage Program Tier 2 #2 (Steve
order 2026-11-10 11:11 CST "Measure all"). Prereg:
evidence/2026-11-10/sim-preserve-a-prereg.md (committed BEFORE any judged
sim). Band 180209–180216, 8 seeds, competent policy verbatim, 150d
death-aware horizon. Zero src/js. Instrument + proof:
scripts/preserve-instrument-20261110.js, scripts/preserve-driver-20261110.js,
scripts/preserve-analyze-20261110.js, scripts/test-preserve-a.js (111/111).

## Verdict: GO on instrument validity + complete first-numbers capture

| GO check | Result |
|---|---|
| Every transform classified by method + caller path, none 'other' | PASS — 0 scholar-side method calls to classify (the finding, see below); 606/606 duty conversions classified smoked/dried by the engine's naming rule; 0 unclassified |
| Duty diff vs _haulcount tap agreement within rounding | PASS — batches 606 = 606 = 606 (diff/tap/snapshot); kcal 507,649 vs 507,810 (Δ161, 0.03%); per-resolution max \|Δ\| 21 kcal, all within the recorded per-stack rounding tolerance; 0 mismatches on 872 resolutions |
| Every wrapped method's call path verified live or marked dead | PASS — 7 wraps live in the pilot (tele, creditDeed, pantryDraw, eat, resolveOneAssignment, noteDeed, learnTechnique); 6 wraps proven live in the proof miniature and dead under competent (preserveFood, renderFat, makePemmican, askSpecialist, eatOne, eatStashOne — the policy never calls them; see Dead wraps) |
| Neutrality: OFF leg matches instrumented leg on days + end pantry kcal + deaths | PASS — 8/8 exact |
| Instrument errors 0 | PASS — 0 on all seeds, all legs |
| Complete first-numbers capture | PASS — per-seed tables for metrics 1–6, sense-test scenes quoted; the two unmeasurables named in the prereg (villager→villager teaching, trader-gift kcal) are marked, not hidden |

A GO verdict makes NO landing claim and spends NO confirm band: there is
no lever here to land.

## The headline: smoking is the whole ladder in practice — and it rescues only 12% of what is about to rot

In 1,055 village-days across 8 seeds, the smoke racks are the entire
preservation system: **606 batches, 531,765 kcal in → 507,649 kcal out
(95.5%), 21,516 shelf-days banked.** Everything above smoking is
untouched — **renderFat 0, makePemmican 0, askSpecialist 0** — and the
scholar's fire was never lit for preserving at all. But the racks are a
narrow funnel, not a safety net: **4,196,831 kcal** of food reached
about-to-rot status and only **520,445 kcal (12.4%)** was rescued onto
the racks; **3,665,066 kcal rotted** in the pantry. Half the rot
(1,817,278 kcal) happened on days the racks-full guard stood the racks
down — and on seed 180216 the racks sat full for 39 straight days
(170 resolutions) while 1,613,803 kcal rotted. The racks-full guard is
already known load-bearing (sim-rackscap-b killed the cap-doubling
variant: extra smoked stock just rots preserved instead of fresh), so
this is not a call to lift the guard — it is the measured shape of the
funnel: the village eats ~125 kcal/person/day from the pantry, and
preservation cannot clear what the village cannot eat.

The scholar's diet runs on the racks' output anyway: of 507,071 kcal
the scholar ate, **150,122 kcal (29.6%) was preserved**; the village
meal drew another **258,937 kcal** of preserved food. The preserved
stock peaks at 62,956 kcal (seed 180216, day 40) and is gone by the end
on 5 of 8 seeds — preserved food is eaten, not hoarded.

## Per-seed tables

Wall numbers (median survival 140d; 6/8 village-lost, 2/8 survived;
wins 0, national 0, table 0; wave 5 on 2/8; regional 8/8):

| seed | days | end | scale | wave | standing | deaths | end pantry |
|---|---|---|---|---|---|---|---|
| 180209 | 150 | survived | regional | 5 | 300 | 66 | 35,793 |
| 180210 | 103 | village-lost | regional | 4 | 199 | 60 | 9,950 |
| 180211 | 138 | village-lost | regional | 5 | 310 | 84 | 69,248 |
| 180212 | 142 | village-lost | regional | 4 | 199 | 85 | 0 |
| 180213 | 140 | village-lost | regional | 4 | 199 | 61 | 0 |
| 180214 | 107 | village-lost | regional | 4 | 199 | 79 | 0 |
| 180215 | 125 | village-lost | regional | 4 | 199 | 94 | 0 |
| 180216 | 150 | survived | regional | 4 | 199 | 104 | 8,149 |

Metric 1 — preservation events (all duty-rack; scholar-side 0 everywhere).
Solid = holder preserver skill > 0 (0.95+0.02·skill, 30+5·skill days);
rough = skill 0 (0.80x, 15d). Smoked/dried split by the engine's naming
rule (fish → "(smoked)", else "(dried)"; see The 4th split-stack bug).

| seed | batches | kcal in → out | shelf-days | smoked | dried | solid / rough |
|---|---|---|---|---|---|---|
| 180209 | 107 | 82,728 → 78,588 | 3,650 | 37 (22,592) | 70 (55,996) | 91 / 16 |
| 180210 | 59 | 63,247 → 59,238 | 1,884 | 0 | 59 (59,238) | 48 / 11 |
| 180211 | 101 | 99,916 → 95,681 | 3,256 | 12 (9,553) | 89 (86,128) | 77 / 24 |
| 180212 | 29 | 38,293 → 31,703 | 527 | 0 | 29 (31,703) | 7 / 22 |
| 180213 | 81 | 62,160 → 61,708 | 3,423 | 0 | 81 (61,708) | 81 / 0 |
| 180214 | 43 | 33,916 → 30,140 | 970 | 0 | 43 (30,140) | 20 / 23 |
| 180215 | 69 | 52,543 → 51,663 | 2,756 | 0 | 69 (51,663) | 63 / 6 |
| 180216 | 117 | 98,962 → 98,928 | 5,050 | 0 | 117 (98,928) | 117 / 0 |
| pooled | 606 | 531,765 → 507,649 | 21,516 | 49 (32,145) | 557 (475,504) | 504 / 102 |

Split-stack conversions (budget-split copies): 61, all matched by kcal
consistency, 0 name-fallbacks — 3 smoked, 58 dried. Scholar-side
methods: preserveFood 0, renderFat 0, makePemmican 0, askSpecialist 0,
cleanCarcass not wrapped by this arm (cookfirst-a: 65). Pemmican sets 0,
bars 0. Rendered stock peak 0, pemmican stock peak 0.

Metric 2 — shelf-life + spoilage. About-to-rot present / rescued /
left to rot; racks-full resolutions and the about-to-rot kcal present
when the guard blocked; spoiled-lost preserved kcal (object-tracked,
draw-reconciled).

| seed | about-to-rot | rescued | left to rot | racks-full res. | blocked kcal | spoiled-lost |
|---|---|---|---|---|---|---|
| 180209 | 209,099 | 82,728 | 126,371 | 2 | 3,750 | 4,423 (8 items) |
| 180210 | 526,787 | 55,327 | 463,540 | 0 | 0 | 0 |
| 180211 | 502,251 | 99,916 | 402,335 | 8 | 187,145 | 5,630 (8) |
| 180212 | 146,324 | 34,893 | 108,031 | 0 | 0 | 0 |
| 180213 | 460,283 | 62,160 | 398,123 | 6 | 12,580 | 0 |
| 180214 | 255,601 | 33,916 | 221,685 | 0 | 0 | 0 |
| 180215 | 176,113 | 52,543 | 123,570 | 0 | 0 | 0 |
| 180216 | 1,920,373 | 98,962 | 1,821,411 | 170 | 1,613,803 | 8,321 (13) |
| pooled | 4,196,831 | 520,445 | 3,665,066 | 186 | 1,817,278 | 18,374 (29) |

Spoiled stacks refused at the fire: 0 (no scholar transforms to refuse).
Rescued is 2.1% under the duty kcal-in (531,765) — see The 4th
split-stack bug: 11,320 kcal of genuinely rescued split-stack food was
recorded with rescuedKcal 0 by the old matcher; reported as recorded,
not adjusted. Trader-gift preserved kcal: UNMEASURED (no wrap on the
river-trader gift; the gift is 2 smoked fish per visit — small, but
uncounted; see Metric review). Unexplained pantry vanishes (preserved
stock gone with shelf left, never drawn): 61,664 kcal / 172 items —
kept separate from rot, never folded into it; likeliest cause is pantry
→ pack transfers (the scholar eats 150,122 kcal preserved from the
pack), unproven per-item (see Metric review).

Metric 3 — who preserves. Scholar techniques: clean:trial 7/8 seeds
(seed 180211's scholar learned nothing at all — not even cleaning);
cook:watched 2/8 (seeds 180213, 180214); preserve/render: never, on any
seed. Specialist preserver jobs: 0. Preserving deeds: 232, all
villager-side (duty resolutions); 0 player deeds. Duty holders by days
(pooled, top 5): gen_gz92d41, Rancher, 132d (every cook-duty day on
seed 180216); owen_smith, hunting guide, 60d; zoltan_nagy, Mushroom
grower, 54d; yara_haddad, interpreter, 51d; gen_i1tzt2u, Midwife, 45d.
Food occupations are NOT the preservers — whoever holds the cook duty
smokes, and the racks teach them (see Metric 4). Cook-duty days total:
723 across 872 duty resolutions.

Metric 4 — skill + teaching. 29 villagers earned preserver foodXp;
rungs reached: 5+ XP (skill 1) 20 villagers, 15+ XP (skill 2) 7,
30+ XP (skill 3) 4. Top movers (max XP reached): gen_gz92d41
(Rancher) 60, greta_hansen 39, gen_i1tzt2u (Midwife) 38, owen_smith
(hunting guide) 34, nikolai_volkov 25, gen_tx1vt44 23, visjoin_107
(Butcher) 18. The Rancher on 180216 went from unskilled to skill 3
purely by holding the duty 132 days — 63 of that seed's resolutions
ran at skill 3. askSpecialist preserver jobs 0; 'watched' learns for
preserve 0 (the 2 watched learns were cooking). Villager→villager
preservation teaching: NO code path exists — UNMEASURABLE-BY-DESIGN,
already in the backlog (sim-cookfirst-a finding).

Metric 5 — stock over time. Daily preserved pantry kcal, peak + end
per seed; rendered and pemmican 0 throughout on every seed.

| seed | peak preserved pantry (day) | end preserved pantry | end preserved pack | end preserved share |
|---|---|---|---|---|
| 180209 | 33,939 (d56) | 25,300 | 0 | 70.7% |
| 180210 | 39,144 (d25) | 0 | 0 | 0.0% |
| 180211 | 39,133 (d36) | 30,756 | 0 | 44.4% |
| 180212 | 12,584 (d41) | 0 | 0 | — (pantry 0) |
| 180213 | 41,534 (d50) | 0 | 0 | — (pantry 0) |
| 180214 | 6,298 (d22) | 0 | 0 | — (pantry 0) |
| 180215 | 16,779 (d44) | 0 | 0 | — (pantry 0) |
| 180216 | 62,956 (d40) | 1,600 | 0 | 19.6% |

Pooled peak preserved pantry 62,956 kcal. The pack never holds
preserved food at any dawn snapshot on any seed (peak pack preserved 0)
— the scholar eats preserved food the same day they take it: 150,122
kcal preserved eaten from the pack over the runs (see below), so the
zero is a snapshot-timing fact, not an instrument gap.

Scholar eating (wrap-attributed, 507,071 kcal): preserved 150,122
(29.6%), unknown-state 220,553 (43.5%), ready 129,150 (25.5%),
fire-cooked 7,106 (1.4%), carcass 140. Village meal draws: preserved
258,937 kcal; drawn by state: none (no-state staples) 2,824,759
(80.5%), ready 374,035, preserved 258,937, cleaned 41,086, cooked
6,285; cook:true draws 2,191,965 vs cook:false 1,313,137; drawn cooked
kcal 107,896. Eat-purge (spoiled food purged via eat): 12,682 kcal.

Metric 6 — wall numbers: wins 0/8, national 0/8, table 0/8, wave-4
unlock 6/8, wave-5 unlock 2/8, regional 8/8, standing median 199,
median survival 140d, deaths 633 over 1,055 village-days. The scale
wall stands (same as every recent run).

## Dead wraps (proven live in the proof miniature, 0 calls in the pilot)

preserveFood, renderFat, makePemmican, askSpecialist, eatOne,
eatStashOne. Each fires in the C1–C7 live fixtures (blind/solid smoke
0.80x/0.95x, blind/solid render 0.65x/0.90x, pemmican sets + 120d
shelf, specialist preserver job + two-watch learn, untaught-pemmican
refusal). Their pilot zeros ARE the finding — the competent policy
never calls these verbs — not an instrument gap. The scholar ate only
via the bulk `eat()` path (eatOne 0, eatStashOne 0). This is the same
class as the cookfirst-a dead branch (competent's cookPack gates on a
foodState no food carries); the render/pemmican half of it was already
measured three times over (sim-fatpipe-b: 0 fat slabs over 2,121
run-days — the ladder is input-starved at the kill, not just
uncalled).

## Reconciliation

- Duty diff vs tap: batches 606 = 606 = 606 (diff / _haulcount tap /
  daily-snapshot tap); kcal diff 507,649 vs tap 507,810 (Δ161, 0.03%).
  Per-resolution |Δ| max by seed: 4 / 13 / 13 / 1 / 21 / 0 / 0 / 0 kcal
  — every resolution inside its recorded per-stack rounding tolerance
  (the tap rounds the whole stack, the engine rounds per unit). 0
  mismatches. The snapshot tap (507,810) equals the _haulcount tap
  exactly, an independent third read.
- Eat: tele('eat') total 532,406 vs wrap-attributed 507,071, gap 25,335
  (4.8%). Per-seed gaps: 2.6% / 19.8% / 7.6% / 11.2% / 2.3% / 0.0% /
  0.4% / 0.0%. EXPLAINED in mechanism, not a miss: `eat()` adjusts
  absorbed kcal after the wrap's gross count (shellgut −25%, engorge
  +20%, disease absorption debuff — game.js eat()). Seed 180210's
  19.8% is the outlier; the mechanism is identified in code, not
  attributed to that scholar's statuses per-seed (see Metric review).
- Vanish: spoiled-lost preserved 18,374 kcal (29 items, all
  foodState 'preserved'; 0 rendered/pemmican — none existed) vs
  unexplained 61,664 kcal (172 items). The classifier counts an item
  spoiled-lost only when it vanishes with spoilDay <= day and was never
  drawn; drawn items are excluded via the persistent drawn-object set.
  The unexplained residual is preserved stock that left the pantry with
  shelf left through a non-draw path (traded/gifted/pack transfer) —
  counted separately so it is never silently folded into rot.

## The 4th split-stack bug (found by this adoption, fixed, proven)

The tracker tail for this arm said "instrument proven 105/105,
evidence unwritten, 4th split-stack bug unfixed". Verifying the
analyzer output exposed it — in two parts, both in the split-stack
path, neither touching the duty batches/kcal that the G1 reconciliation
judges:

(a) **The post-conversion name was never recorded.** The engine renames
every converted item (`name + ' (smoked)'` if /fish/i, else
`' (dried)'` — game.js duty convert), but the instrument recorded only
the PRE-conversion name for both in-place and split-stack conversions.
The analyzer's smoked/dried split therefore read `other-name` on all
606 conversions — metric 1's fish-vs-meat split was unmeasured, not
zero. Fix (this adoption): the instrument now records `postName` on
every converted item, and the analyzer classifies by the recorded
suffix, falling back to the engine's own /fish/i rule on the pre name
for the frozen corpus. The derived split — smoked 49 batches / 32,145
kcal, dried 557 / 475,504 kcal — was verified against an independent
hand-count of the corpus (identical). The split-matcher had already
verified the suffix live on all 61 split conversions (name + kcal
match, 0 fallbacks), so the derivation is grounded, not guessed.

(b) **The split-match tie-break picked the wrong stack.** When several
same-name stacks share per-unit kcal (e.g. two "Foraged food" lumps),
the matcher picked the first with the smallest kcal error — which can
be a stack with the wrong spoilDay. In the pilot, 3 of 61 split
conversions matched a stack OUTSIDE the duty-eligible window
(spoilDayBefore − day = 0, 0, and 4; the engine only converts
spoilDay − day ∈ {1, 2}): "Cattail" 180210 d61, "Burdock" 180210 d78,
"Foraged food" 180212 d92. Effect: shelfGained off by a few days on
those 3 items and rescuedKcal recorded 0 instead of full — 11,320 kcal
(2.1% of duty kcal-in) undercounted as rescued. Batches and kcal are
unaffected (tied stacks share per-unit kcal). Fix (this adoption):
among equal kcal errors the matcher now prefers a duty-eligible
spoilDay (1..2 days out), then the soonest-spoiling. The corpus
numbers are reported AS RECORDED — not adjusted.

Proof for both fixes (scripts/test-preserve-a.js, 111/111, was 105):
C10q asserts a live duty conversion records the post-conversion name;
C10r–C10v assert a split-match tie (eligible day+1 "Cattail" vs an
ineligible day+5 decoy pushed first) resolves to the eligible stack
with full rescued kcal. RED check run during the adoption: on the
pre-fix instrument, C10q, C10s and C10u FAIL with exactly the pilot
signature (no postName; spoilDayBefore day+5; rescuedKcal 0). Green on
the fixed instrument: 111/111.

Effect on the verdict: neither part moves it. The G1 reconciliation
(duty diff vs tap) was never affected — batches agree exactly and kcal
within rounding on every resolution. The smoked/dried sub-split is now
captured, and the rescued-kcal undercount (2.1%) is documented as
recorded. GO stands.

## Sense-testing (SENSE-TESTING LAW)

The village's preservation voice sounds like people saving food for
winter — the racks line names the cook every time, the mutter is
self-aware, and the racks-full line explains the choice honestly. The
robotic thing is the ABSENCE: rendering and pemmican are talked about
but never done, so the ladder above smoking is voice-only under
competent.

First racks/smoke scene per seed (all 8 exist; three shown):

- "🍲 Ryan cooked for the haven — meals stretched. Ryan worked the smoke racks too — 5 batches preserved (~2672 kcal, keeps a couple of weeks)." (seed 180209, day 27)
- "🍲 Weerachai cooked for the haven — meals stretched. Weerachai worked the smoke racks too — 3 batches preserved (~1635 kcal, keeps for weeks)." (seed 180210, day 9)
- "🍲 Ema cooked for the haven — meals stretched. Ema worked the smoke racks too — 5 batches preserved (~3365 kcal, keeps for weeks)." (seed 180216, day 17)

Render scene: NONE real. The render filter catches only talk:
"🍽️ Ursula taps the pantry's fullest jar. "More than we can eat before
it turns. Rendering fat instead — the lamps won't fill themselves.""
(seed 180209, day 18; the same lamps line fires on 7/8 seeds).
Villagers talk about rendering fat; nobody ever renders any.

Pemmican scene: NONE on any seed — no line, no bar, no mention.

Racks-full line (5 captured, all seed 180216 — the say sample is
capped at 200 lines/seed and exhausts by day ~35 there, while the
racks stayed full to day 69):
"🍲 Aisling cooked for the haven — meals stretched. The racks are
already full (34,265 kcal kept — more than the haven can eat before it
turns), so Aisling left the fresh pile for tonight's dinner instead of
smoking it onto the rot pile." (seed 180216, day 31)

"Should've smoked that" mutter (7 lines, one per seed except 180214;
two shown — same shape, different mutterer and stores, so it reads as
a repeated lesson, not a repeated line):
- "The village threw out spoiled stores: 2 Foraged food. Ryan mutters: "Should've smoked that. Fresh stuff keeps a day or two on the shelf — the smoke rack is right there." (pantry)" (seed 180209, day 52)
- "The village threw out spoiled stores: Unknown flesh. Sigrun mutters: "Should've smoked that. Fresh stuff keeps a day or two on the shelf — the smoke rack is right there." (pantry)" (seed 180210, day 17)

Spoiled-refusal line at the fire: NONE — 0 scholar transforms, so
nothing was ever refused at a fire. The spoil voice is the dawn purge
plus the mutter above.

The System itself narrates the ladder (seed 180212, day 18):
"◈ SYSTEM: "The long game, little hoarders. A GRANARY. Stockpile 20,000
kcal, 500 wood and 2,000 kcal of PRESERVED food — food that WAITS.
Smoke it, dry it, render it. The audience finds delayed gratification
EXOTIC. So do stomachs, we are told.""

Say-sample caveat: the 200-line-per-seed cap exhausts early — the
captured say days end at day 73 / 27 / 19 / 32 / 36 / 18 / 22 / 35
against runs lasting 103–150 days. The sense sample covers only the
first ~fifth of each run; late-game preservation voice (including most
of seed 180216's 39-day racks-full stretch) is uncaptured. The wrap
counts are complete; the voice sample is early-game only.

## Village assessment (plain words)

Eight villages, and in every one the pattern is the same: the village
smokes, the scholar doesn't. The smoke racks are the only rung of the
ladder anyone climbs — a mortician, a beekeeper, a rancher, whoever
holds the cook duty that day — and they learn it by doing it, some of
them getting genuinely good at it (a Rancher on seed 180216 held the
duty all 132 days and reached skill 3). The scholar never stands at a
fire with meat, never renders fat, never makes pemmican — because the
policy that plays them never calls those verbs, and the ladder above
smoking is starved of its input anyway (no fat ever reaches the
village). The racks save about an eighth of what is about to rot; the
rest — 3.7 million kcal — rots in the pantry while the village talks
about rendering fat for lamps it never fills. The two villages that
lived the full 150 days are the ones whose racks ran longest and whose
preserved stock peaked highest. Nothing here reached national or the
table — the scale wall stands (0/8 national, 0/8 table, 0 wins), same
as every recent run.

## Blanks filled / documented

- FILLED (measurement): preservation's first numbers — every rung
  counted per method, per caller, per seed; the duty racks measured
  exactly (diff + tap + snapshot agree); spoiled-lost preserved kcal
  object-tracked for the first time (18,374 kcal).
- FILLED (instrument): the 4th split-stack bug — postName recording +
  analyzer derivation (smoked/dried split recovered) and the
  eligible-spoilDay tie-break — proven 111/111 with RED checks.
- DOCUMENTED (finding): the racks rescue 12.4% of about-to-rot food;
  the racks-full guard blocks half the rot it could save on the
  worst seed — already in the backlog as load-bearing
  (sim-rackscap-b, killed variant), so no new backlog entry.
- DOCUMENTED (finding): render/pemmican never happen under competent
  — voice-only ladder above smoking; the fat-supply half is already
  in the backlog (sim-fatpipe-b, 0 fat slabs over 2,121 run-days) and
  the policy half is the cookfirst-a dead-branch finding.
- DOCUMENTED (limitation): the say-sample cap exhausts in the first
  ~fifth of a run (see Metric review); trader-gift preserved kcal
  unmeasured; the vanish-unexplained residual (61,664 kcal) is likely
  pack transfers, unproven per-item.

No new sim-findings.md entries: the findings this arm surfaced
(racks-full guard, render starvation, cook dead branch, no
villager→villager teaching) are all already open in the backlog.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The duty-vs-tap "batches" question from the prereg is answered: the
  tap counts one batch per stack touched and the diff counts per
  converted item, and they agree here (606 = 606) because every
  converted item is one stack touch, budget-split copies included. No
  revision needed.
- The eat reconciliation gap needs per-seed attribution if a later run
  leans on it: pooled 4.8%, but seed 180210 is 19.8% while two seeds
  are 0.0%. The mechanism (absorption adjustments in eat()) is known
  in general; attribute the gap to the scholar's statuses
  (shellgut/engorge/disease) per seed next time.
- The say-sample cap (200 lines/seed) exhausts in the first ~fifth of
  a run. A later run that needs late-game voice should raise the cap
  or sample by day strata instead of first-N.
- The vanish-unexplained residual (61,664 kcal) needs a cause: track
  pantry→pack movement explicitly so pack transfers stop looking like
  unexplained vanishes.
- Trader-gift preserved kcal has no wrap. Add one if the exogenous
  inflow matters to a later arm.
- The "share of eaten kcal preserved" headline (29.6% scholar pack)
  and the meal-drawn preserved kcal (258,937) are different numbers
  from different instruments; the next run should decide which headline
  binds (carried from cookfirst-a).
- The talkturn-a cost bar is already known-wrong; this arm carries NO
  cost bar and does not re-judge it.

## Base + landing

Base at spawn: master 3daa1a9b6. No src/js change. Commits on branch
sim-preserve-a: prereg 428fb0ff7, instrument + proof 94/94 3c53e9942,
duty-diff attribution fixes + proof 105/105 af52b0d6a, adoption fixes
(postName + split tie-break, proof 111/111) + corpus + this evidence
to follow in the next commit. Corpus:
evidence/2026-11-10/perseed-preserve-a/ (16 files, seeds 180209–180216
x control+neutral) + evidence/2026-11-10/preserve-summary-preserve-pilot.json
(analyzer re-run reproduces it byte-identically; the smoked/dried
split in it matches an independent hand-count). Do NOT push, do NOT
bump versions, do NOT verify live. Do NOT merge — the coordinator
merges with --ff-only.
