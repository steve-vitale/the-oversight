# sim-medicdiag-a — VILLAGE-SIDE CARE CENSUS (DIAG-GO)

Run: oversight-flesh-out-loop, run fleshout-20261108T0315Z (Loop A), axis
food-economy (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-medicdiag-a, branch sim-medicdiag-a.
Adoption: this run adopts the fleshout-20261108T0015Z arm of the same
name, which died by cron timeout ~02:15Z. The dead worker's final report
("work substantially complete but NOT finished — stopped during the final
sweep re-run, no commit made") verified TRUE in substance: the prereg and
all three instruments were complete, but the corpus held only 2/8 seeds
(s96301, s96302, recorded on ba9859e13; s96301 showed daysAlive=104) and
nothing was committed. This session re-ran the full sweep on the rebased
base (see substrate note below) and finished the arm.
Substrate: branch tip a04a6c0fc (rebase of ba9859e13 onto current master
before the sweep; the rebase was clean, no conflicts, no quirk stop).
Policy: competent ONLY (scripts/policies/competent.js, UNMODIFIED). Env:
PLENTYDEPRI=1, DEPOSITGATE=1 (shipped defaults, explicit). Horizon: 150d
death-aware cap. Seeds: 96301–96308 (deliberate reuse of the
feveranat/tendsick band for episode-by-episode comparability; no
freshness claimed). Prereg:
evidence/2026-11-07/sim-medicdiag-a-prereg.md (binding, incl. Amendment
A1 and the G3 final-day rule).
Instruments: scripts/sweep-medicdiag-a.js (feveranat recorder + ONE
declared delta: per-day medicDetail snapshot; pure reads, no RNG, no
Game-state writes), scripts/analyze-medicdiag-a.js (census over both
corpora), scripts/test-medicdiag-a.js (proof, 8/8 — see below).
DIAG ONLY — zero src/js, no lever, no default flip.

## Verdict: DIAG-GO

All four prereg gates pass. G1 PASS (167/167 episodes classified),
G2 PASS (cure-channel verdict ABSENT rendered with code citations;
corpus corroborates: 0 cures, 0 treatVillager calls), G3 PASS
(modeled deaths-avoided 16.24 under the stated assumptions), G4 PASS
(fix shape named below; the cure-channel question flagged steve-call).
Proof test: 8 PASS, 0 FAIL (L1 healer definition, L1b away exclusion,
L2 care-never-cures, L2b treatVillager refusal, L2c code-read, L3
accounting units, L4 recorder-vs-recorder neutrality on 96301+96302,
L5 analyzer gates). Convergence state: converging.

## Substrate note (second move — A1 logic applied)

The prereg's substrate was ba9859e13, but master moved twice since:
ba9859e13 → a04a6c0fc (this session's rebase; includes Loop B's
fightloop-fix-b + xphalf-rejudge-b landings and journey r118). Per
Amendment A1, gates G1–G3 are judged on the feveranat corpus
(base 018295600, 167 episodes) as preregistered; the medicDetail live
leg characterizes healer capacity on the current base and is reported
as such. Same seed, three bases, three trajectories — the difference
is substrate, never a census revision:

| seed | feveranat corpus (018295600) | medicdiag live leg (a04a6c0fc) | dead run's partial (ba9859e13) |
|------|------------------------------|-------------------------------|-------------------------------|
| 96301 | 127d | 132d | 104d |
| 96302 | 150d | 61d | (unread — overwritten by re-run) |
| 96303 | 124d | 149d | — |
| 96304 | 61d | 61d | — |
| 96305 | 129d | 119d | — |
| 96306 | 134d | 109d | — |
| 96307 | 121d | 117d | — |
| 96308 | 145d | 73d | — |
| median | 128d | 113d | — |

Recorder neutrality on the shared current base (L4): medicdiag oneRun
== feveranat oneRun fingerprints AND healerPresent / medicCount /
sickCountNPC series identical on 96301+96302. Bare == recorded on all
8 seeds (daysAlive and death counts identical). The extended recorder
does not move trajectories.

## Results (analyzer output, reproduced verbatim)

```
=== sim-medicdiag-a CARE CENSUS (seeds 96301,96302,96303,96304,96305,96306,96307,96308, competent, 150d) ===

WALL: national=0/8 table=0 wins=0 waveReach={"1":8,"2":8,"3":8,"4":8,"5":3} medianSurvival=128d max=150d

C1 HEALER CAPACITY:
  s96301: days=127 healerDays=121 medicDays=85 sickDaysPresent=68 sickDaysAbsent=2 tends=24 havenMedicAvailDays=107 scholarHealerDays=111 villageHealerDays=15 tendCapacity=353
  s96302: days=150 healerDays=98 medicDays=2 sickDaysPresent=12 sickDaysAbsent=76 tends=0 havenMedicAvailDays=0 scholarHealerDays=0 villageHealerDays=0 tendCapacity=0
  s96303: days=124 healerDays=88 medicDays=100 sickDaysPresent=31 sickDaysAbsent=20 tends=31 havenMedicAvailDays=53 scholarHealerDays=100 villageHealerDays=12 tendCapacity=285
  s96304: days=61 healerDays=59 medicDays=55 sickDaysPresent=30 sickDaysAbsent=1 tends=14 havenMedicAvailDays=35 scholarHealerDays=55 villageHealerDays=4 tendCapacity=109
  s96305: days=129 healerDays=44 medicDays=59 sickDaysPresent=10 sickDaysAbsent=63 tends=12 havenMedicAvailDays=19 scholarHealerDays=20 villageHealerDays=17 tendCapacity=122
  s96306: days=134 healerDays=53 medicDays=144 sickDaysPresent=3 sickDaysAbsent=45 tends=5 havenMedicAvailDays=0 scholarHealerDays=67 villageHealerDays=0 tendCapacity=0
  s96307: days=121 healerDays=96 medicDays=155 sickDaysPresent=23 sickDaysAbsent=9 tends=16 havenMedicAvailDays=54 scholarHealerDays=81 villageHealerDays=23 tendCapacity=240
  s96308: days=144 healerDays=77 medicDays=15 sickDaysPresent=29 sickDaysAbsent=76 tends=2 havenMedicAvailDays=0 scholarHealerDays=0 villageHealerDays=0 tendCapacity=0
  POOLED: village-days=990 healerDays=636 (64.2%) medicDays=615 NPC sick-days healer-present=206 healer-absent=292 (unknown 0) tends=104
  tends per medic-day=0.169 tends per healer-day=0.164
  MEDICDETAIL (8/8 seeds): havenMedicAvailDays=268 scholarHealerDays=434 villageHealerDays=71 tendCapacity(triage-doubled)=1109
  distinct medic vids=12 occupations(day-counts)={"ER nurse":167,"nurse":197,"army medic":30,"Pharmacist":47,"Veterinarian":55,"paramedic":45,"Dentist":5,"Midwife":13}
  holdings (medic-days / distinct medics): triage 554/12 herbal_remedy 482/10 field_medicine 554/12
  tends vs capacity: 104 tends delivered against 1109 tend-slots (9.4% of capacity used)
  healer-present at onset: 85 episodes, treated 59 (69.4%), median duration 2
  healer-absent at onset: 75 episodes, treated 15 (20.0%), median duration 4
  mortality by disease (NPC): bad belly n=9 died=0 present 0/4 absent 0/5; disease n=105 died=0 present 0/67 absent 0/38; food poisoning (raw) n=3 died=0 present 0/2 absent 0/1; wound_fever n=43 died=20 present 2/12 absent 18/31

C2 CURE-CHANNEL CORROBORATION (corpus facts): cureEvents=0 diagnoses=1 treatVillager calls=0 (cured 0) tendVillager calls=0
  episodes ending cured: 0 (none)
  CURE-CHANNEL VERDICT: ABSENT (village-side) — no villager-side code path deletes a v.sick record except recovery/death; villagerCareTick only tends (daysLeft -= 1). Code: Game.villagerCareTick, Game.treatVillager (scholar-only, L2+, 150 kcal), Game.cureStatus (scholar status list only). Sole non-scholar cure in code is the foreign-aid medicine delivery (safetynets.js resolveAidInbound), which never fired on this band (cureEvents=0). Full citations in the evidence file.

C3 MODELED VALUE (assumptions: association not causation; effect transfers fully; no capacity limit in the model — capacity is measured separately in C1; NPC episodes only for the primary model):
  PRIMARY (NPC episodes only): present 2/85 mortality=0.024 | absent 18/75 mortality=0.24 | expected deaths if absent had present rate=1.76 | MODELED DEATHS AVOIDED=16.24
  ALL episodes (incl. scholar, for the record): present 3/87 mortality=0.034 | absent 20/80 mortality=0.25 | expected deaths if absent had present rate=2.76 | MODELED DEATHS AVOIDED=17.24
  sick-days covered per healer-day: 0.324 NPC sick-days on healer-present days per healer-day; 0.783 total NPC sick-days per healer-day (present+absent).
  context: treated deaths 0/74 vs untreated deaths 20/86 — the healer effect runs through treatment coverage (present 69.4% treated vs absent 20.0%).

G1 COVERAGE: 167 episodes, healer-present/absent at onset recorded on 167/167 — PASS (zero UNCLASSIFIED)

G3 CORPUS (revised final-day rule): PASS — all legs valid under the pre-registered rule

G2 CURE-CHANNEL VERDICT: PASS — verdict ABSENT rendered with code citations in the evidence file; corpus corroborates (0 cures, 0 treatVillager calls in the wild)
G3 MODELED VALUE: PASS — modeled deaths-avoided=16.24 computed under the stated assumptions
G4 FIX SHAPE: named in the evidence file (this analyzer prints the measured inputs; the shape + steve-call flag live there).

SENSE (one healer-present episode, one healer-absent episode):
  PRESENT s96301 d1 Lena (tick fever, treated=false, duration=6d): ["d1 📓 Journal: the person in their 30s, with a scarred cheek taught the man in his 40s Old World Caches.","d1 📓 Journal: the person in their 50s, with weathered hands taught the woman in her 40s Steady Hands.","d1 🤒 Lena is achy and wrung out, barely eating. Rest and clean water — or it gets worse. A woman, maybe 30s, with ink-stained fingers is already boiling water. It's handled"]
  ABSENT s96302 d28 Olivia (wound fever, treated=false, duration=7d, died): ["d28 \"Triage tents and broth for the sick, or half rations till it passes, or the healthy hunt hard to keep everyone fed. Pick — everything costs.\"","d28 \"Or we rally,\" Xavier adds. \"Second shift, everybody. We work, we eat, we live — and we pay for it.\"","d28 (Relief is open — triage, rations, hunt, or rally, from the beats row. Each option works once; the moment passes in ~3 days.)"]
  ABSENT death-day lines: ["d35 Jian and Asher lingered over the fire together.","d35 Alejandra and Jian lingered over the fire together.","d35 📓 Codex: Olivia taught Sigrun Diplomatic Incident."]
  say-lines anywhere in onset windows mentioning a missing healer: 0 episodes

CENSUS GATES (analyzer): G1 PASS | G2 PASS | G3 PASS | G4 in evidence.
```

NOTE on the verbatim block: the per-seed C1 lines mix two bases by
design (A1) — days/healerDays/medicDays/sickDays/tends are the
feveranat corpus (018295600); havenMedicAvailDays /
scholarHealerDays / villageHealerDays / tendCapacity are the medicdiag
live leg (a04a6c0fc). Read the pooled lines the same way: the first
pooled line is old-base, the MEDICDETAIL line is new-base. The
"tends vs capacity: 104 vs 1109 (9.4%)" line is therefore a
cross-substrate ratio, indicative only — see Metric review. The
same-base statements are clean on each side and are what the census
answers below rest on.

## The four census answers

### C1 HEALER CAPACITY — the village has almost no healers of its own; the scholar IS the healer

- What counts as a healer (verified live, L1): the scholar holding
  triage / field_medicine / herbal_remedy, else a living roster
  villager whose formerOccupation matches nurse|medic|doctor|
  paramedic|midwife|veterinarian|pharmacist|herbalist|dentist, and
  only if physically present in the camp (`Game.campHealerId`,
  game.js:14285; `Game.campPeopleIds`, away residents excluded — L1b
  proves flagging the healer away removes them). No skill level
  enters the definition.
- Headcount is the constraint. On the live leg (a04a6c0fc, 821
  village-days): 359 days (43.7%) have ZERO living roster medics;
  375 days have exactly one. Three of eight villages (96302, 96306,
  96308) have no medic at all on the whole run; the best-staffed
  (96307) has four. Twelve distinct medics across the band.
- The healer is usually the scholar, not a villager. Live leg:
  healer present 505/821 days (61.5%); of those, scholar-healer 434
  days vs village-medic-healer 71 days (86% scholar). On seeds 96302
  and 96308 there are ZERO healer-days at all — no medic and a
  scholar holding no healing ability. On 96306 all 67 healer-days
  are the scholar alone.
- Holdings are NOT the constraint. Every one of the 12 medics holds
  triage and field_medicine; 10/12 also hold herbal_remedy (554 /
  482 / 554 medic-days). The craft-track skill lane demonstrably
  grants healing skills to medical-occupation villagers — the lever
  has skills to push on; what it lacks is bodies in camp. (Lena the
  ER nurse on 96301 holds all three, 107 days; she is also the
  "already boiling water" caretaker in the feveranat sense lines —
  the same villager, both bases.)
- Presence, not tend-slot capacity, is the binding limit. Old base:
  292 NPC sick-days with no healer present vs 206 with one; only
  20.0% of healer-absent episodes get treated vs 69.4% of
  healer-present ones. Live leg: 260 NPC sick-days healer-absent vs
  141 present, against 1109 nominal tend-slots — the slots exist,
  the healer is elsewhere or does not exist. Tends delivered: 104
  on the old base (0.169 per medic-day, 0.164 per healer-day).

### C2 CURE-CHANNEL EXISTENCE — ABSENT (village-side), with citations

- `Game.villagerCareTick` (game.js:32857): each available medic
  tends ONE sick villager per day (TWO if that medic holds triage);
  the tended record's `daysLeft -= 1`. It never deletes a `v.sick`
  record, never calls the cure path. Proven behaviorally (L2): a
  patient tended 5 → 1 over repeated care ticks parks at daysLeft 1
  and the record survives; only the sickness tick itself ends the
  spell.
- `Game.treatVillager` (game.js, ~14370–14385): the scholar's cure —
  requires the ability AND level 2, 150 kcal, 32 ticks; on a 'cure'
  result `delete v.sick[vid]`. Its only callers anywhere are the
  competent policy's `keepPromiseHeal`
  (scripts/policies/competent.js:884–905) and the app.js UI buttons
  (`vtend:` / `vtreat:`, app.js:16021–16022). NO villager/NPC caller
  exists in src/js (grep-verified, L2c).
- `cureStatus` (statusEffects.js:462) operates on the scholar's
  status-engine list only; it never touches `v.sick`.
- `delete v.sick` sites in the whole tree: treatVillager (scholar
  cure); villageSicknessTick (recovery / death / stale cleanup);
  betrayal (villager leaves); `resolveAidInbound` medicine delivery
  (safetynets.js:1089) — a FOREIGN village's aid curing the single
  sickest villager, gated on links + trust + a request. That is the
  ONLY non-scholar cure of a villager's sickness in code, and it is
  external, not village-side.
- Corpus corroboration: cureEvents=0, diagnoses=1, treatVillager
  calls=0 (cured 0), tendVillager calls=0, episodes ending cured=0.
  The scholar's cure ladder exists in src/data/statusEffects.json
  (Fever: herbal_remedy=cure; wound_fever: all four cure; lockjaw /
  trichinosis need diagnosis; trembles: NO cure at any tier) but no
  villager ever receives it in the wild.
- Canon bound (DISEASES.md): cure tiers run folk remedies → occupation
  medicine → specific ruin medicine → earned healer deepenings → the
  Fever's End synergy. No canon doc (PARTY.md checked) covers how many
  medics a village should have or what village-side care looks like —
  that gap is a finding, not an invention.

### C3 MODELED VALUE — 16.24 deaths avoided if the absent had the present rate

- PRIMARY (NPC episodes only): healer-present mortality 2/85 (2.4%)
  vs healer-absent 18/75 (24.0%). Expected deaths if the 75 absent
  episodes had the present rate: 1.76. MODELED DEATHS AVOIDED = 16.24
  over 8 villages × 150 days — about 2 lives per village per run.
- All episodes incl. scholar, for the record: 17.24.
- Assumptions, stated plainly with the number: (1) association, not
  causation — healer presence correlates with other survival factors
  (wound patching, village wealth); (2) the effect is assumed to
  transfer fully to absent episodes; (3) no capacity limit in the
  model — capacity is measured separately in C1 and is NOT binding
  (see above); (4) NPC episodes only (the scholar runs the full
  status engine, a different mechanism).
- The mechanism is treatment coverage, and it is stark: treated
  deaths 0/74 vs untreated 20/86 (NPC); healer-present episodes are
  treated 69.4% of the time, healer-absent 20.0%. Duration follows:
  median 2 days present vs 4 days absent.
- The deaths are a wound-fever story, not a tick-fever story:
  wound_fever kills 20/43 NPC episodes (46.5%; present 2/12, absent
  18/31) while tick fever ('disease') kills 0/105. Every NPC sickness
  death in the corpus is a wound fever. Sick-days covered per
  healer-day: 0.324 NPC sick-days on healer-present days.

### C4 FIX SHAPE — named next arm (build belongs to a later run)

The named shape is **HAVEN MEDIC DUTY** — a duty/assignment that
keeps one roster medic at Haven as the camp healer and prioritizes
tending the sick, so the village's own medic is the Haven healer
instead of the scholar (or nobody). It attacks exactly what C1
measured: presence (292 NPC sick-days healer-absent on the old base;
260 on the live leg; two seeds with zero healer-days) and coverage
(absent episodes treated 20% vs present 69.4%), using the capacity
that already exists (1109 tend-slots, every medic already holding
triage). No new cure mechanic is needed for this shape — tending
already saves everyone it reaches (0/74 treated deaths). A second,
smaller shape rides with it or follows it: **MEDIC HEADCOUNT** — grow
the roster of medical-occupation villagers (recruit/retain/teach via
the craft track, whose skill lane already grants triage to 12/12
medics), since 43.7% of days have zero roster medics at all.
Prereg pointer: this arm's C4 — the build is a later run's arm with
its own prereg; nothing is landed here.

**STEVE-CALL (flagged): the village-side cure question.** Should a
villager ever CURE a sickness, not just tend it? That would be a NEW
mechanic — no villager-side cure exists in code, and the canon cure
ladder (DISEASES.md tiers, ending in the Fever's End synergy) plus
the CANON.md law "human skills ≠ alien abilities" require a lane
ruling first: is a villager cure an occupation skill (earthly
medicine, teachable) or a System ability (magic, granted)? The census
says the cure is NOT the binding constraint — presence is — so the
duty shape should be built and measured before any cure mechanic is
considered. Do not build a villager cure before Steve rules on the
lane.

## Gates (judged ONLY against the prereg header)

- G1 coverage: PASS — 167/167 episodes carry a healer-present/absent
  classification at onset; zero UNCLASSIFIED.
- G2 cure-channel verdict: PASS — ABSENT rendered with code citations
  (file + function, above); corpus corroborates (0 cures, 0
  treatVillager calls).
- G3 modeled value: PASS — 16.24 modeled deaths-avoided computed
  under the stated assumptions, rates shown.
- G4 fix shape: PASS — Haven Medic Duty named, with the cure-channel
  question flagged steve-call.

## Reachability / wall numbers (reported, not gated)

- Feveranat corpus (018295600): national 0/8, table 0, wins 0,
  waveReach 1:8 2:8 3:8 4:8 5:3, median survival 128d, max 150d.
- Medicdiag live leg (a04a6c0fc): national 0/8, table 0, wins 0,
  waveReach 1:8 2:8 3:8 4:8 5:2, median survival 113d, max 149d;
  all 8 villages end village-lost, rank village. Death causes on
  the live leg: the wild 56, monster 15, sickness 14, starvation 9,
  a wound that wouldn't close 8, dehydration 5, contest 5, ambush 4,
  a stranger 4, the arena 3, combat 1, gavel 1, the focus group 1,
  spool 1, lockjaw 1 (127 deaths total). The wall stands on both
  bases, exactly as the sibling runs found. (Telemetry deviation
  check below.)

## Telemetry deviation check (loop-body step 10)

Ran `node scripts/telemetry-check.js --baseline
.../hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-07/medicdiag-a-corpus/medicdiag-a-competent-s*.json'
--metrics national,table,wins,exiled`:

```
LOUD: national disappeared: baseline 12 -> current 0 (n=8 files)
LOUD: table disappeared: baseline 16 -> current 0 (n=8 files)
LOUD: wins disappeared: baseline 16 -> current 0 (n=8 files)
```

Verdict: EXPLAINED REGIME ARTIFACT, not a bug. This is exactly the
outcome the prereg predicted — competent-only 150d on this band shows
national/table/wins 0 on both bases (the feveranat corpus and the
live leg agree), and the awayconfirm/prodcollapse runs hit the
identical LOUD lines for the same reason: the baseline was seeded
from a different regime. No investigation item. The baseline was NOT
rolled forward (`--update-baseline` not run).

## Metric review (post-run)

- No metric proved wrong. G1–G3 were judged on the feveranat corpus
  as preregistered (A1); the live leg is recorder-vs-recorder on the
  shared current base and is reported as such.
- **Cross-substrate ratio (instrument note, propose for the NEXT
  run):** the analyzer's per-seed C1 lines and the "104 tends vs 1109
  tend-slots (9.4% of capacity used)" line join a tends count from
  the feveranat corpus (base 018295600) with a capacity count from
  the medicdiag live leg (base a04a6c0fc). The 9.4% is indicative
  only, not a same-village measurement — on the new base the
  recorder does not log tends, and on the old base the recorder did
  not log capacity. The census answers do not rest on it: presence
  and coverage are measured cleanly on EACH base separately (old:
  292 sick-days absent, 20.0% of absent episodes treated; new: 260
  sick-days absent, 1109 tend-slots), and both point the same way.
  Proposed revision: the analyzer should print same-base capacity
  against same-base sick-days, and print a tends-vs-capacity ratio
  only when recorder and corpus share a base.
- The G3 final-day rule (preregistered from the tendsick metric
  review) was applied; the analyzer's G3 corpus check PASSED on both
  corpora (feveranat + medicdiag legs all valid).
- The L3 unit test bakes the judged-band numbers (16.24 NPC /
  17.24 all-episode); the analyzer reproduced them exactly, so the
  accounting and the live corpus agree.
- One reading note, not a metric failure: the analyzer's "sick-days
  covered per healer-day 0.324" counts only NPC sick-days on
  healer-present days per healer-day — a coverage density, not a
  claim that a healer-day covers a third of a sick-day. The useful
  comparison is present vs absent sick-days (206 vs 292 old base).

## Sense (SENSE-TESTING LAW)

Two fever episodes read end to end (transcripts above in the verbatim
analyzer block, plus the death-day rows pulled from the corpus):

- HEALER-PRESENT — s96301 d1, Lena, tick fever, untreated, recovered
  in 6 days. The village voice is calm and specific: "Lena is achy
  and wrung out, barely eating. Rest and clean water — or it gets
  worse. A woman, maybe 30s, with ink-stained fingers is already
  boiling water. It's handled." The same beat repeats across days
  with the same caretaker ("Lena is already boiling water. It's
  handled" on Yara's d17 onset) — a real person doing a real job,
  and on the live leg Lena IS the village's ER-nurse healer. When a
  healer is present the fiction knows who is handling it.
- HEALER-ABSENT — s96302 d28, Olivia, wound fever, untreated, died
  d35. On onset day the village DEBATES care out loud — "Triage
  tents and broth for the sick, or half rations till it passes, or
  the healthy hunt hard to keep everyone fed. Pick — everything
  costs" / "Or we rally," Xavier adds. "Second shift, everybody. We
  work, we eat, we live — and we pay for it." — and then nobody does
  any of it. The Relief beat notes the moment passes in ~3 days.
  Olivia dies on d35 while teaching ("Olivia taught Sigrun
  Diplomatic Incident" is logged the same day) and the village
  carries on around her: foraging, lingering over the fire, a
  warning about reserves. The same pattern repeats for Aroha (d36→45:
  discovers two synergies on the day she dies) and Jian (d43→46: the
  only grief line in the band — "Someone is crying, quietly, in one
  of the bunks. Amy goes to sit with them."). No say-line anywhere
  in any onset window mentions a missing healer (0 episodes): the
  gap the numbers measure — nobody in camp who can tend — is
  invisible in the fiction. The village argues about what care
  should look like and then watches people die of wounds nobody
  tends. That is coherent, and it is damning: the fiction already
  knows care is the question; the systems just never answer it.

## Village assessment in plain words

Eight villages, and fever is still the background condition — but
this census is about who is standing next to the sick bed, and the
answer is: usually the scholar, and often nobody. Three villages in
eight never have a village medic at all; on two of them the scholar
doesn't hold a healing ability either, so for 61 and 73 days
respectively there is no healer in camp, ever. Where a medic exists
they are good — every one of them has learned the healing skills,
which is the game working as designed — but there are twelve of them
across eight villages and they are rarely the one the game counts:
the scholar does the healing on 86 days out of 100. When someone
falls sick with no healer around, they die a quarter of the time;
with one around, almost never. The difference is not a cure nobody
has — it is a pair of hands nobody assigned. Wound fever does all
the killing (20 of 20 sickness deaths); tick fever, the one everyone
talks about, kills nobody. And nobody in the village ever says "we
have no healer" — they debate triage tents and broth, and then they
go back to the fire. The wall still stands: no village reaches
national, no table, no win — but fever is a tax on the climb, and
the tax is collected from the villages with nobody at the sick bed.

## Blanks filled or documented

- FILLED: the village-side care census — healer capacity (headcount
  is the constraint; 43.7% of days have zero roster medics; the
  scholar is the healer on 86% of healer-days), cure-channel verdict
  (ABSENT, cited), modeled value (16.24 deaths avoided), fix shape
  (Haven Medic Duty, named next arm).
- FILLED: the skill-lane check — medical-occupation villagers DO
  hold triage / herbal_remedy / field_medicine (12/12 triage,
  10/12 herbal), so a more-medics lever has skills to push on; the
  gap is bodies and presence, not holdings.
- FILLED: the death story is wound fever, not tick fever — 20/43
  wound-fever episodes die, 0/105 tick-fever episodes die.
- DOCUMENTED (not built here): Haven Medic Duty as the named next
  arm (own prereg); the villager-cure lane question as steve-call;
  the canon gap — no doc covers how many medics a village should
  have or what village-side care looks like (PARTY.md checked).

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

- The village never voices "no healer in camp" (0 say-lines in 167
  onset windows) — the risk the numbers measure is invisible in the
  fiction. Design question, not measurement.
- The Relief beat offers triage tents / broth / rations / rally on
  fever onsets and the moment passes in ~3 days with nobody acting
  (Olivia s96302 d28): the game knows care is the question and the
  systems never answer it. Candidate next arm alongside Haven Medic
  Duty.
- Wound fever is the only killer (20/20 NPC sickness deaths) while
  tick fever kills 0/105 — the disease the canon warns about least
  (dirty wounds) is the one doing the dying.
- s96302 on the live leg has zero treatEvents of any kind and three
  healer-absent wound-fever deaths — a whole village with no care
  at all, on a base where it also has no healer-days.
