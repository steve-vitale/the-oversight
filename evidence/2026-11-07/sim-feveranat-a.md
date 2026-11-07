# sim-feveranat-a — FEVER ANATOMY DIAGNOSIS (DIAG-GO)

Run: oversight-flesh-out-loop, run fleshout-20261107T1928Z (Loop A), axis
food-economy (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-feveranat-a, branch sim-feveranat-a.
Substrate: branch base 018295600 (coordinator round-1820 evidence commit:
prodstore NO-GO killed at pilot, prodcollapse DIAG-GO HEALTH). Policy:
competent ONLY (scripts/policies/competent.js, UNMODIFIED). Env:
PLENTYDEPRI=1, DEPOSITGATE=1 (shipped defaults). Horizon: 150d
death-aware. Seeds: 96301–96308 (8 seeds, pilot batch IS the diagnosis
batch). Prereg: evidence/2026-11-07/sim-feveranat-a-prereg.md (binding).

## Verdict: DIAG-GO

All prereg gates pass and every fever episode is classified by
vector + treatment + outcome. DIAG ONLY — zero src/js, no lever, no
default flip.

- G1 det-gate: PASS (proof test L5 determinism smoke: same seed twice →
  identical per-seed JSON; proof 11/11, re-verified standalone by the
  adopting session).
- G2 neutrality: PASS — recorded == bare on all 8 seeds.
- G3 corpus: PASS — all 16 legs valid (8 recorded + 8 bare).
- G4 classification: PASS — 167 episodes on 8/8 seeds, EVERY episode
  classified by vector + treatment + outcome (attributed 167/167,
  unattributed 0).

Adoption note: the worker finished the diagnosis and staged the full
numbers in /tmp/feveranat-analysis-final2.txt but was stopped by the
cron execution timeout before writing this file. The adopting session
(main session, INSPECT HELD WORK) verified the proof test 11/11
standalone, verified the corpus files exist (16 per-seed JSONs +
sweep-competent.json), and wrote this file from the staged analysis.
No numbers were re-run; the analyzer output is reproduced verbatim
below.

## Results

Pooled context: produced=13,900,346 need=14,017,221 produced/need=0.992.
Starvation deaths (villager)=1. Death causes: ambush 4, monster 18,
the wild 85, a wound that wouldn't close 12, sickness 14, the landlord 1,
dehydration 4, the arena 4, starvation 2, a stranger 1, combat 2,
contest 1, experiment 1, the night 1.
Wall: national=0/8 table=0 wins=0 waveReach={1:8, 2:8, 3:8, 4:8, 5:3}.
Median survival=128d max=150d.

### F1 INCIDENCE

Episodes=167 (NPC 160, scholar 7) on 8 seeds; per-seed={96301:23,
96302:18, 96303:24, 96304:16, 96305:19, 96306:16, 96307:19, 96308:32}.
By disease id/name={disease:108, food poisoning (raw):3, wound_fever:45,
bad belly:9, gutrot:2}. Villagers affected (distinct NPC vids)=74; sick
villager-days=521 / village-days=990 (52.6%).

Half of all villager-days are sick days. Fever is not a rare event —
it is the background condition of village life.

### F2 DURATION

Closed episodes=167, open at run end=0 (of which 8 reconciled via
deathRows: died of another cause while sick, end event never sensed).
Duration days: min=0 median=3 mean=3.1 max=10. By outcome={recovered:140,
died:14, died (other cause: monster):1, recovered (expired):4, died
(other cause: starvation):2, died (other cause: a wound that wouldn't
close):3, died (other cause: dehydration):1, died (other cause: the
wild):1, died (other cause: combat):1}. Duration histogram (days:
count)={0:1, 1:30, 2:48, 3:28, 4:26, 5:16, 6:12, 7:2, 9:3, 10:1}.
Sick-days as share of village-days=52.6%.
By disease: bad belly n=9 median=2 mean=1.8; disease n=108 median=3
mean=3.1; food poisoning (raw) n=3 median=2 mean=1.7; gutrot n=2
median=0.5 mean=0.5; wound_fever n=45 median=3 mean=3.6.

### F3 VECTOR ATTRIBUTION

By vector={tick:105, raw food:3, wound:45, unsafe food:9, dirty
water:2, food:3}. Attributed=167/167, unattributed=0. Corroboration
(NPC): wound onsets with hp<40 at onset=43/43; tick onsets with
forager/explorer profile=105/105; gut-rot onsets with drinksDirty at
onset=0/0; scholar onsets by vector (source-string evidence)={dirty
water:2, wound:2, food:3}.

Tick fever dominates (105/167) — the forager/explorer's disease. Wound
fever is second (45/167) and always arrives with hp<40. Dirty water
barely registers (2/167): the villages in this band mostly drink clean.

### F4 TREATMENT IN THE WILD

TreatEvents by kind={villagerCare:104, sickRest:1} (total 105).
Diagnoses=1, cures=0, statusEvents (alien/tick)=8. Episodes
treated=75/167 (treated kinds: {villagerCare:74, sickRest:1}).
Treated: median duration=2 mean=1.9 died=0/75. Untreated: median
duration=4 mean=4.1 died=23/92. Healer present at onset: 87 episodes,
median duration=2, died=3. Healer absent at onset: 80 episodes,
median duration=4, died=20.

Care works and it is the whole story: nobody who gets tended dies of
the fever (0/75), while a quarter of the untended die (23/92). But
care reaches fewer than half the episodes, and nothing is ever CURED
in the wild — villagerCare only tends (daysLeft −= 1). The scholar-side
cure table (herbal_remedy, field_medicine, triage) exists but the
competent policy never calls it for villagers; only one diagnosis was
ever spoken in 8 villages over 150 days.

### F5 PRODUCTION COST

Fever-wave days=382 (sickCount>=1 or scholar sick) vs non-wave
days=608. Wave days: produced/need=0.961 healthFrac=0.801
produced=6,024,386 need=6,271,650. Non-wave days: produced/need=1.017
healthFrac=0.871 produced=7,875,960 need=7,745,571. HEALTH
counterfactual (wave produced at non-wave health): 522,371 kcal.
Villager-day contrast (snapshot sickMap join): sick n=489 mean
produced=1,603 mean expected=1,708 healthFrac=0.636 mult=0.968;
healthy n=6268 mean produced=2,093 mean expected=2,263
healthFrac=0.856 mult=0.943.

The cost runs through health, not sickness directly: a sick
villager's produced/expected ratio (0.968) is no worse than a healthy
one's (0.943) — the "expected" already carries the health/100
multiplier. Fever costs ~522k kcal across the band because it drags
mean health from 0.871 to 0.801 on wave days, and health is what the
production formula reads. This is the prodcollapse finding with the
mechanism named: fever → health → production.

### F6 SPREAD

New NPC onsets per village-day distribution (onsets: days)={0:842,
1:138, 2:11} over 991 village-days. Multi-onset days (>=2): 11 — all
audited: every pair shares a vector or a day-condition (two wound
fevers after a fight, two tick fevers on a foraging day, two bad
bellies from one unsafe meal); drinksDirty at onset false throughout.
Lag: onsets in days +1..+3 after an onset: 84 over 480 windows
(0.175/window) vs base rate 0.161/day (ratio 1.084). Code fact:
no contagion path exists — villageSicknessTick rolls each villager
independently per day; no household/contact structure in code.
Clustering, if any, must come from shared daily conditions (dirty
water, low HP after attacks), not person-to-person spread.

No spread signal. Two fevers on one day are two villagers catching
the same bad day, not one infecting the other.

## Metric review (post-run)

- G3 was judged under the CORRECTED corpus check (prodcollapse metric
  review): daySeries length == daysAlive OR daysAlive−1 with the
  missing day named; flowSeries covers every day; mealRows deduped;
  deathRows present; every onset has a matching end or is open at run
  end; every onset appears in ≥1 later snapshot OR has a same/next-day
  end event.
- L8 reconciliation case (analyzer commit 8e822fe11): 8 episodes open
  at run end were reconciled via deathRows — bearers who die outside
  the sickness tick leave no end event (death-time v.sick deletion /
  scholar succession). They are now counted as "died of another cause
  while sick", not left open.
- L11 regression (recorder commit dcc3cc516): a second contraction of
  a disease already held logged a phantom onset (96308 d7: 2 onsets,
  1 entry, 1 expiry). Fixed with a pre-call hasStatus check in the
  recorder; proof 11/11 incl. the regression case.
- Same-tick turnover fix (recorder commit 9448c4281): recovery +
  re-infection in one tick now emits both end and onset (G3 caught 3
  orphan ends before the fix).
- No metric proved wrong. The F5 villager-day contrast (sick mult ≥
  healthy mult) is a reading note, not a metric failure: the
  counterfactual is computed on wave days, where the health gap is
  what matters.

## Sense (SENSE-TESTING LAW)

Say-lines around onsets (up to 5 per seed, from the analyzer):

- 96301 d1 Lena (tick fever → tick): "Lena is achy and wrung out,
  barely eating. Rest and clean water — or it gets worse. A woman,
  maybe 30s, with ink-stained fingers is already boiling water. It's
  handled."
- 96301 d14 Mai (tick fever → tick): "Mai is achy and wrung out,
  barely eating. Rest and clean water — or it gets worse."
- 96301 d17 Yara (tick fever → tick): "Yara is achy and wrung out,
  barely eating. Rest and clean water — or it gets worse. Lena is
  already boiling water. It's handled."
- 96301 d19 Sanne (tick fever → tick): "Yara is sitting up again.
  Whatever the fever was, it let go." / "Sanne is achy and wrung out,
  barely eating. Rest and clean water — or it gets worse. Lena is
  already boiling water. It's handled."
- 96301 d28 Alice (food poisoning (raw) → raw food): "Alice ate raw
  food — fever by nightfall."

The fever voice is coherent and grounded: the same "already boiling
water" beat follows the same caretaker (Lena) across days, recoveries
are voiced ("sitting up again"), and the raw-food poisoning names its
cause. No robotic repetition beyond the shared template — the template
is the same because the event is the same, and the names change.

## Village assessment in plain words

Eight villages, 150 days each, and fever is everywhere: half of all
villager-days are sick days, 74 different people catch something, and
14 die of it. The villages that keep a healer in camp lose almost
nobody to fever; the villages that don't, lose people in ones and
twos all run long. The food cost is real but indirect — about half a
million kcal across the band, paid through lowered health, not
through sickness itself. Nobody starves because of fever alone (1
starvation death in the band); people die of fever, or of the monsters
that find them while they are weak. The wall stands: national 0/8,
table 0, wins 0 — fever is a tax on the climb, not the wall itself.

## Blanks filled or documented

- FILLED: the fever now has an anatomy — incidence (167 episodes,
  52.6% of villager-days), duration (median 3d), vectors (tick 105,
  wound 45, the rest food/water), treatment (tending saves everyone
  it reaches; cures never happen in the wild), production cost
  (~522k kcal via health), spread (none — shared bad days, not
  contagion).
- DOCUMENTED (named next arms, not built here): (1) a cure channel
  for villagers — the scholar's cure table exists but never reaches
  a villager in the wild; (2) the tendsick pilot in this same round
  tests whether the scholar tending the sick moves the burden
  (verdict: NO-GO, see sim-tendsick-a.md); (3) the sickfloor lever
  in this same round tests softening the health→production
  multiplier (verdict: NO-GO at pilot, see
  sim-food-sickfloor-round-1928.md).

## Findings for the backlog (coordinator appends)

- Treatment in the wild never cures: 0 cures in 167 episodes;
  villagerCare only tends. A villager cure channel (or a reason the
  scholar's cures never reach villagers) is an open design gap.
- Healer presence is the strongest survival signal in the corpus
  (3 deaths in 87 healer-present episodes vs 20 in 80 absent).
  Whether the game should surface "no healer in camp" as a visible
  risk is a design question, not a measurement one.
- Dirty water barely registers as a vector (2/167) on this band —
  the villages mostly drink clean. The gut-rot threat the canon
  warns about is not what is killing people here; tick fever is.
