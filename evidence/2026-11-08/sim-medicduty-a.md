# sim-medicduty-a — HAVEN MEDIC DUTY (evidence)

Run: oversight-flesh-out-loop, run fleshout-20261108T1315Z (Loop A, ADOPTION
of fleshout-20261108T1017Z — the 1017Z run died by cron timeout with this arm
half-built; the duty was never built and no after sweep ran). Axis
food-economy (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-medicduty-a, branch sim-medicduty-a.
Substrate: worktree HEAD 76c16eeae at prereg time (before leg, unmodified
game); after leg = the same tree + the duty commit (hash recorded below).
Policy: competent ONLY (scripts/policies/competent.js, UNMODIFIED). Env:
PLENTYDEPRI=1, DEPOSITGATE=1. Horizon: 150d death-aware cap. Seeds:
96301–96308 (8 seeds — the feveranat / tendsick / medicdiag band,
deliberate reuse; see prereg Seed-band note).

Full pre-registration (binding): evidence/2026-11-08/sim-medicduty-a-prereg.md
(original GO bar + Amendment A1 + Amendment A2).

## Pre-registered header (Amendment A1, the judged bar)

- PRIMARY (G1): after-leg NPC sick-days healer-present share ≥ 30%
  (before 24.6%, ceiling 32.9%) AND absent-with-medic sick-days ≤ 19
  (before 38).
- GUARDRAILS (G2): median survival ≥ 58.4d (0.8× before 73d); starvation
  deaths ≤ 10 (before 8 + 2); no new death-cause mode ≥ 2; produced/need
  ≥ 0.965 (before 0.995 − 0.03).
- PANEL (G3): §15 balanced panels before/after, compare attached; any
  regression_signal investigated, unexplained regression blocks a GO claim.
- PROOF (G4): scripts/test-medicduty-a.js green (all legs).
- SECONDARY (reported, not gated): sickness deaths, wound-fever NPC deaths,
  treatment coverage — NULL PREDICTION: no material change (±10pp band);
  duty mechanism (duty-days, blocked departures, holder changes);
  cure metric (A2, secondary, reported); wall numbers.
- GO: G1 + G2 + G3 + G4 all pass. A miss is NO-GO, never re-scored.

## Results

### Before leg (base 76c16eeae, unmodified game) — MEASURED, all 8 seeds exit 0

Analyzer: `node scripts/analyze-medicduty-a.js --leg
evidence/2026-11-08/medicduty-a-corpus/before` (exit 0):

```
WALL: national=0/8 table=0 wins=0 waveReach={"1":8,"2":8,"3":8,"4":8,"5":1} medianSurvival=73d max=149d
PRIMARY: present=113 absent=346 share=24.6% absentWithMedic=38 absentNoMedic=308 (village-days=681 healerDays=315 medicDays=472 havenAvail=206)
DUTY: dutyDays=0/681 holders=0 holderChanges=0 blockedDepartures=0 joinMismatches=0
SECONDARY: episodes=156 treated=71 treatedShare=45.5% sicknessDeaths=19 woundFeverDeaths=16 starvationDeaths=8
GUARDRAILS: produced/need=0.995 deathCauses={"ambush":4,"a wound that wouldn't close":10,"monster":7,"starvation":8,"the wild":48,"alien":1,"the arena":2,"sickness":18,"dehydration":3,"a stranger":2,"the focus group":1,"spool":1,"lockjaw":1,"contest":1}
```

Corpus: evidence/2026-11-08/medicduty-a-corpus/before/ — 3 recorders × 8
seeds × (competent + bare) = 48 per-seed files + 3 summaries + 2 logs, all
exit 0. Join clean: duty/medicdiag day-by-day joinMismatches=0. Duty
columns are all zero/null on the before leg, as expected (no duty code
exists yet — the recorder reads `v.medicDuty`, which is undefined).

Balanced panel (before): evidence/2026-11-08/medicduty-a-panel-before/
(panel.json.gz, 8 rows, contract digest
37bbb0fad9471559345d72b35625c95a4aeb531872d29ee2c9fd887a0c7b55f4,
validity sourcesStable=true, neutrality match on competent/96301).
Cases/ cache deleted before commit per §15 (reproducible from seeds +
digests).

Baseline numbers that bind the gates (Amendment A1): present share 24.6%,
absent-with-medic 38, addressable pool 38, ceiling share 32.9%, median
survival 73d, starvation deaths 8, produced/need 0.995, treated share
45.5%, sickness deaths 19, wound-fever NPC deaths 16.

### After leg (base 76c16eeae + duty commit f6c0ffb14) — MEASURED, all 8 seeds exit 0

Analyzer: `node scripts/analyze-medicduty-a.js --before
evidence/2026-11-08/medicduty-a-corpus/before --after
evidence/2026-11-08/medicduty-a-corpus/after` (exit 1 = NO-GO):

```
=== sim-medicduty-a AFTER ===
WALL: national=0/8 table=0 wins=0 waveReach={"1":8,"2":8,"3":8,"4":8} medianSurvival=95d max=150d
PRIMARY: present=110 absent=358 share=23.5% absentWithMedic=18 absentNoMedic=340 (village-days=739 healerDays=375 medicDays=383 havenAvail=313)
DUTY: dutyDays=284/739 holders=8 holderChanges=8 blockedDepartures=165 joinMismatches=0 curesAbility=33 curesMedicine=0
SECONDARY: episodes=135 treated=34 treatedShare=25.2% sicknessDeaths=21 woundFeverDeaths=17 starvationDeaths=6
GUARDRAILS: produced/need=0.974 deathCauses={"choir toad":1,"the wild":46,"sickness":21,"monster":14,"starvation":6,"ambush":6,"the arena":3,"a wound that wouldn't close":8,"dehydration":2,"the expedition":1,"contest":1}
G1 PRIMARY: after share=23.5% (need >=30%, before 24.6%) -> FAIL; absentWithMedic=18 (need <=19, before 38) -> PASS; G1 FAIL
G2 GUARDRAILS: medianSurvival 95 vs 0.8x before 58 -> PASS; starvation 6 vs before+2 10 -> PASS; new death causes >=2: none -> PASS; produced/need 0.974 vs before-0.03 0.965 -> PASS; G2 PASS
VERDICT: NO-GO
```

Corpus: evidence/2026-11-08/medicduty-a-corpus/after/ — 3 recorders × 8
seeds × (competent + bare) = 48 per-seed files + 3 summaries + 3 logs, all
exit 0. Join clean (joinMismatches=0). Duty mechanism visibly working:
284 duty-days over 739 village-days, 8 holders (one per seed), 8 holder
changes, 165 blocked departures, 33 ability cures, 0 medicine cures
(the pharmacy channel never fired in live sims — no stash medicine was
found in 8 seeds; the channel is proven only by the unit leg L4b).

Per-seed after (duty cures / blocked / days alive): 96301: 10 / 34 /
106d · 96302: 0 / 2 / 66d · 96303: 7 / 16 / 95d · 96304: 8 / 37 / 150d
(survived) · 96305: 0 / 0 / 65d · 96306: 0 / 0 / 85d · 96307: 8 / 76 /
103d · 96308: 0 / 0 / 73d. Seeds with no roster medic at all (96302,
96305, 96306, 96308) show 0 cures and 0 blocks — the duty cannot create
medics where none exist; that is the medic-headcount shape, not this arm.

Balanced panel (§15, G3): evidence/2026-11-08/medicduty-a-panel-after/
(panel.json.gz, 8 rows) vs panel-before; compare
evidence/2026-11-08/medicduty-a-panel-compare.md — decision
**review_required** (no regression_signal). Three regression_watch rows,
all explained by longer survival, not new harm:
- Player deaths/run 7.25 → 7.75 (+0.5) but per 100 days FELL 8.97 → 7.97.
- Village deaths/run 60.5 → 65.375 (+4.875) but per 100 days FELL
  75.7 → 73.8.
- Mean living NPCs 8.06 → 7.54 (−0.53): longer runs sample more late-life
  attrition days. No metric moved against the duty on a per-day basis.
Also descriptive: accepted player ability events 51.875 → 86.75 (longer
life → more ability events, not gated). Table/national/wins all 0 both
legs, as expected on competent-only 150d.

Proof (G4): scripts/test-medicduty-a.js — **13 PASS, 0 FAIL** (L0–L6,
all legs, seeds 96301+96302 live leg). Duty assignment, stability,
re-pick, sev-2 exclusion, departure blocks, LEAVE exemption, directed
win-plan exemption, companion exclusion, sickest-first tending,
ability + medicine cures, diagnosis gate, trembles/alien no-cure,
no treatVillager call, recorder neutrality, analyzer join — all green.

Telemetry deviation check: `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-08/medicduty-a-corpus/after/medicduty-a-competent-s*.json'
--metrics national,table,wins,exiled` → 3 LOUD lines (national 12 → 0,
table 16 → 0, wins 16 → 0). VERDICT: regime artifact, explained, NOT a
bug — the baseline was seeded from a different policy/horizon regime;
competent-only 150d shows 0/0/0 on the BEFORE leg too (identical LOUD
lines on medicdiag/awayconfirm). Baseline NOT rolled forward.

## Verdict

**NO-GO** — G1 primary FAILS on condition (a) (share 23.5% vs ≥30%
needed), condition (b) PASSES (absent-with-medic 38 → 18, ≤19 needed).
G2 guardrails all PASS. G3 panel review_required with all three watches
explained (no regression_signal, no unexplained regression). G4 proof
13/13 green. A miss is NO-GO, never re-scored.

Kill classification (§14a): **METRIC-BROKEN, not CONCEPT-DEAD.** The
mechanism worked on its addressable pool — it reclaimed 20 of 38
addressable sick-days (53% capture, beating the 50% the bar asked),
cured 33 villagers, kept the holder home on 165 blocked departures,
and villages lived a median 22 days longer (73d → 95d, one seed
surviving the full 150d). The share bar (a) is confounded by the
duty's own survival effect: the extra 58 village-days were mostly
no-medic days (absent-no-medic 308 → 340), which diluted the share
even as the numerator the duty controls moved the right way
(present 113 → 110 on a much larger denominator). A bar that punishes
a lever for keeping villages alive longer cannot judge that lever.
The arm returns to the queue with a corrected pre-registration (see
metric review), not as a dead concept. Convergence: killed-at-pilot
on the A1 bar; the mechanism itself is converging (pool capture +
survival both moved the right way).

## Metric review

- **The share bar (a) is confounded by survival.** Present share =
  present / (present + absent); the duty extends village life, and
  the added days are disproportionately no-medic days (the headcount
  shape: 4 of 8 seeds never have a medic at all). Proposed revision
  for the NEXT run: primary = absent-with-medic pool capture alone
  (condition (b) as the primary: ≤19 held, or capture fraction
  ≥50%), with the share reported as a secondary. Alternatively, a
  share computed only over days when a roster medic exists.
- **The treated-share NULL PREDICTION breached — taxonomy artifact,
  not a mechanism failure.** Treated share fell 45.5% → 25.2%
  (outside the ±10pp band). The feveranat episode join counts an
  episode "treated" only when a villagerCare tend event (daysLeft − 1)
  lands inside it. A CURE deletes the record instead — it is not a
  tend event. The duty cured 33 patients, and the treated-episode drop
  (71 → 34, −37) is almost exactly the cure count. Cures are being
  scored as untreated episodes. Proposed revision: the episode join
  must count a cure as a treated outcome (or the cure count must be
  added to the treated numerator) before this secondary can judge
  anything on a duty build.
- **Per-episode wound-fever deaths ticked up (16/156 = 10.3% →
  17/135 = 12.6%)** while sickness deaths per village-day were flat
  (2.8% both legs). With 33 cures removing the easiest cases from the
  episode pool, the remaining episodes skew severe — a selection
  effect of curing, not evidence the duty harms the sick. Worth
  watching on the re-run with the corrected join, not a verdict now.
- **Medicine channel unexercised live.** 0 medicine cures in 8 seeds:
  the Haven pharmacy held no doses on any seed (medicine is
  ruin-found and rare; the competent policy rarely deposits it). The
  channel is proven only by the unit leg. A future run that wants to
  measure it needs a seed/policy where medicine is actually found, or
  a seeded stash — otherwise it stays a dead letter in sims.
- **Fever's End gap (found during sense-testing, not in the sweep).**
  Villagers CAN discover the fevers_end synergy (Lena did, day 13,
  seed 96301) via npcSynergyTick, but the duty's cure channel does
  not read v.npcSynergies — an 'ease' that Fever's End would upgrade
  to a 'cure' stays an ease for NPCs. A2's "Fever's End is
  scholar-only" is wrong as a fact about the engine; whether the
  synergy SHOULD upgrade NPC cures is a design question for the next
  run, not a change made mid-measurement.
- **noteDeed deviation from A2 (documented).** A2's cure-effect
  paragraph lists noteDeed('healing'); the build does NOT call it for
  NPC cures — noteDeed credits the scholar's deed track, and the cure
  was the holder's, not the scholar's. bondAdd(holder, patient, 3,
  'treated') is called instead (villager-to-villager bond, same as
  tending). The A2 text stands as the ruling; this is the faithful
  reading of it, recorded here rather than silently followed.

## Sense (SENSE-TESTING LAW)

Two transcript episodes, both on the AFTER base (duty built),
competent policy, via a say-line capture probe
(/tmp/medicduty-transcript-probe.js, not committed):

**Episode 1 — the duty holder tends and cures (seed 96301, 60 days).**
Duty holder Lena Ruiz (ER nurse, holds triage). Day 2: *"Lena is
staying at Haven as the camp healer now — tending the sick instead
of ranging out."* Then, across the run, the cure lines land as a
person doing a job, not a flag: *"Herbal remedy on Thabo: the right
plants, brewed dark — the feverish breaks and doesn't come back.
Thabo is going to make it. (Lena cured them — and the camp saw
it.)"* — repeated for Alice (d16), Yara (d23), Sanne (d27, d28),
Mateus (d34, d37), Jovan (d41), Thabo again (d50). 9 ability cures
in 60 days, 29 blocked departures. The duty reads as Lena having a
job the village can see: she stays, she brews, people get better,
the camp notices. Verdict: sensical. One wrinkle worth naming: the
same cure line repeats verbatim 9 times — the flavor is good, but a
second or third variant would keep the ninth cure from reading like
a stamp.

**Episode 2 — the village has no medic (seed 96305, 60 days).** No
roster medic exists at all. The throttled line fires exactly once
per 7 days, naming whoever is sick that day: d2 *"Nobody here knows
doctoring, and Leo is burning up. The village has no healer —
someone has to learn, or find one."*; d9 Carmen; d16 Nikolai; d23
Li. It reads as the village noticing its own lack, and the
surrounding lines corroborate the gap from other systems (*"Li is
still hurting (41 HP) — no healer at haven. They rest today instead
of ranging out."*, repeated daily as wounds slowly close). The line
never fires when nobody is sick and never spams. Verdict: sensical
— the missing-healer silence medicdiag found is now a voice, and it
says the right thing at the right cadence.

## Village assessment in plain words

Eight villages, same eight as before, with one change: a healer now
stays home. The villages lived longer — a median of 95 days instead
of 73, and one village (seed 96304) lasted the whole 150 days, which
none did before. People still die in the wild more than anywhere
else (46 of 109 deaths), and the village still never gets near
national, the table, or a win — the scale wall stands untouched by
this arm, as expected; a healer keeps people alive, it doesn't build
a nation.

What changed in plain terms: when a village HAS a healer, that
healer now stays by the fire instead of wandering off, and sick
people actually get better — 33 cures across the four villages that
have a healer. When a village has NO healer — half the villages —
nothing changes at all: nobody stays, nobody cures, and the village
now at least says so out loud once a week. The hard truth this run
puts numbers on: the duty is a good job for a healer the village
already has, but half the villages have no healer to give the job
to. The binding constraint is now plainly the headcount — villages
need a way to get, train, or find a medic in the first place. That
is medicdiag C4's second shape, and it is the honest next arm.

## Blanks filled or documented

- FILLED (built + proven): Haven Medic Duty — dawn assignment,
  departure blocks with the LEAVE and directed-win-plan exemptions,
  holder-tends-first + sickest-first, both A2 cure channels, duty
  and no-medic voice lines. Proof 13/13 green. Commit f6c0ffb14
  [needs-eyes].
- FILLED (measured): before/after on identical seeds 96301–96308,
  competent only, 150d death-aware; balanced panel compare
  (review_required, watches explained); telemetry check (regime
  artifact, baseline not rolled).
- DOCUMENTED (not built): the medic-headcount shape — 4 of 8 seeds
  have no roster medic at all, so the duty is vacuous there. Next
  arm, not this one.
- DOCUMENTED (metric review): share bar confounded by survival;
  treated-share join blind to cures; medicine channel unexercised
  live; Fever's End not read for NPC cures; noteDeed deviation.
- DOCUMENTED (sense): cure line repeats verbatim — needs variants.

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

(to be filled after the sweeps)
