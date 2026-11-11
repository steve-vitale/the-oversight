# sim-medcure-ev-b — RE-MEASURE WITH EVENT CAPTURE, GO

**Arm:** sim-medcure-ev-b (measurement, instrument fix) · **Run:**
fleshout-loop-b-20261110T2246Z (Loop B adoption of the stranded 2046Z arm)
· **Axis:** winnability chain / scale-onramp (converging, NOT converged) ·
**Branch:** sim-medcure-ev-b, rebased onto master `3daa1a9b6` · **Band:**
160501–160508 (8 seeds, pilot) · **Policy:** competent (unmodified), env
`PLENTYDEPRI=1 DEPOSITGATE=1`, horizon 150d death-aware · **Prereg:**
`evidence/2026-11-10/sim-medcure-ev-b-prereg.md` (binding, committed by the
2046Z run before any judged computation; G1 tick-phase rule amended
pre-sweep) · **Zero `src/js`** — instrument only.

**Adoption note.** The 2046Z coordinator died mid-flight. This run inherited
the branch (3 commits: prereg + amendment + instrument/analyzer/proof) and
the complete corpus — 8 competent cells, 8 bare cells, and
`sweep-competent.json` — all untracked. The corpus was verified before use
(all 17 files parse; day rows span first→last day; tick-phase pairs balance;
0 instrument errors) and **no judged sim was re-run**. Master had moved
since the spawn brief named `b6cf13684`: `git rev-parse master` in the main
tree read `3daa1a9b6` at adoption, so the branch was rebased onto the
explicit SHA `3daa1a9b6` (clean, 3/3 picks, no quirk stop) and the proof
re-run green on the rebased tip before the analyzer ran.

## Verdict: GO — re-measure valid, instrument joins episodes

Judged strictly against the prereg G1–G4 bar. A miss on any gate is NO-GO;
nothing was re-scored against a friendlier metric.

| Gate | Result | Evidence |
|------|--------|----------|
| G1 capture complete, 8/8 | **PASS** | 8/8 seeds exit 0; all corpora parse; day rows span 1→last day; end snapshot present; death rows consistent with the fallen list (7 deaths reconciled via the +1 window); phase pairs balance on all seeds (preTick == postTick, preCare == postCare, preCare ≤ preTick — the amended rule); 0 instrument errors; 0 phase-mismatch seeds; 0 tick-day mismatches |
| G2 episode join clean | **PASS** | unclassified healer status 0; unlinked wound-fever deaths 0; unlinked sickness deaths 0; duty-cure events reconcile exactly with `v.medicDutyCures` counters (0 counter mismatch); **episode-join rate 100.0%** (0/76 unrecorded cures; bar was ≥ 80%) |
| G3 neutrality | **PASS** | bare 8/8 match on FULL fingerprints (daysAlive, endReason, death keys + causes, final pop) |
| G4 proof green | **PASS** | `scripts/test-medcure-ev-b.js`: **19 passed, 0 failed** on the rebased tip (determinism + recorder-validity fixtures + broken-fixture sensitivity, incl. the pre-care-snapshot-removal fixture) |

**The headline: the blind spot was total.** All 29 wound-fever episodes on
this band were first seen in the pre-care snapshot — **onset source
`preCare` 29/29, daily snapshot 0/29**. medcure-b's snapshot builder saw 5
episodes; the true count is 29. Every wound-fever case on this band is a
same-tick onset (caught in the evening sickness tick and, when a healer is
present, usually cured before the next morning). Finding #2095 is closed by
this arm: event capture works, join rate 100%.

## M1 — wound-fever death rate by healer presence (PRIMARY, now valid)

NPC wound_fever episodes, healer presence at onset (census shape,
died/episodes):

- healer present: **3/21 = 14.3%** (fever-cause only **0/21 = 0.0%**)
- healer absent: **4/8 = 50.0%** (fever-cause only **4/8 = 50.0%**)
- unclassified healer status: 0 · left-excluded episodes: 0 ·
  duty-cured wound-fever episodes: present 16, absent 0 ·
  treated (cured or tended): present 16, absent 0

The 3 deaths on the healer-present side were **not fever deaths**: two
villagers died to a monster and one to the wild while a wound-fever episode
was open. On fever-cause mortality — the census comparison — the re-measure
is **0/21 present vs 4/8 absent**, against the 2026-11-08 census of 2.4% vs
24.0%. Direction and rough size agree with the census; the absent side is
worse here (50% vs 24%) but it is a single village (s160507, 0 healer days
in 54 days, 8 episodes), not 8 independent draws — read it as one village's
collapse, not a rate. All-disease NPC mortality, same split: present 7/149
(4.7%), absent 6/22 (27.3%).

Episode accounting (29 total): present 21 = 16 duty-cured + 3 died of other
causes + 2 recovered (Quinn s160505 d68–72, Onni s160506 d136–137); absent 8
= 4 died of fever + 3 recovered + 1 still open at village death (Nino
s160507, onset d53, village lost d54). No episode was ever tended
(`daysLeft` −1 without a cure): when a healer is present the duty cures;
when absent nobody tends — tending is not a fallback that happens in these
villages. 16 pre-tick first sightings (`pretickSightings`) are non-wound-
fever episodes (generic fever etc.); all 29 wound-fever episodes opened at
preCare, as designed.

## M2 — cure channel split (trustworthy: counter-reconciled 8/8)

- **Total duty cures: 76 — ability 76, medicine 0.** Counter-mismatch seeds: 0.
- By disease: wound_fever 17 (ability), generic fever (`disease`) 59 (ability).
- Per seed (ability/medicine): s160501 12/0, s160502 1/0, s160503 12/0,
  s160504 5/0, s160505 11/0, s160506 24/0, s160507 0/0, s160508 11/0.
- The medicine channel fired **0 times on 8/8 seeds** — the same zero the
  medicduty-a landing and medcure-b saw. M3 explains why: there was never
  any stock to spend. The duty's ability channel is the whole cure system
  on this band.
- Cure holders: Gladys (s160503, 12 cures), Luigi (s160501, 12), David/Onni
  (s160506), Honora (s160504), Joseph/Benjamin/Oliver/Bithi (s160505),
  Ursula (s160502, 1). One holder per village does nearly all the curing —
  the duty is a single-person job, and when that person is gone or never
  existed (s160507), nothing cures at all.

## M3 — pharmacy stock over time (trustworthy: direct read)

- Village-days: 819. Mean doses/day: **0** (antibiotics 0, antiparasitic 0).
  Max doses on any day: **0**. Stocked days: **0**. Zero days: **819**.
  Seeds that ever held medicine: **0/8**. Stock-change events: **0**.
- In 819 village-days no village ever held a single dose of ruin medicine.
  The pharmacy is empty from day 1 to village death on every seed. The
  medicine cure channel is decoration on this band — it cannot fire, not
  because the duty fails to try it, but because the stock it would spend
  never exists. (Third consecutive zero across medicduty-a, medcure-b, and
  this arm.)

## Per-seed table

| seed | days | end | rank | maxWave | healer days | wf eps | wf died | wf fever-died | wf cured | cures ab/med | sayLines | tickEvents |
|------|------|-----|------|---------|-------------|--------|---------|---------------|----------|--------------|----------|------------|
| 160501 | 129 | village-lost | regional | 5 | 129/129 | 0 | 0 | 0 | 0 | 12/0 | 55 | 510 |
| 160502 | 73 | village-lost | regional | 4 | 72/73 | 1 | 0 | 0 | 1 | 1/0 | 30 | 292 |
| 160503 | 83 | village-lost | regional | 4 | 82/82 | 6 | 1 | 0 | 5 | 12/0 | 39 | 318 |
| 160504 | 140 | village-lost | regional | 4 | 139/139 | 5 | 1 | 0 | 4 | 5/0 | 52 | 554 |
| 160505 | 126 | village-lost | regional | 4 | 126/126 | 5 | 1 | 0 | 3 | 11/0 | 56 | 494 |
| 160506 | 148 | village-lost | regional | 4 | 146/147 | 4 | 0 | 0 | 3 | 24/0 | 51 | 586 |
| 160507 | 54 | village-lost | village | 3 | 0/54 | 8 | 4 | 4 | 0 | 0/0 | 121 | 216 |
| 160508 | 69 | village-lost | regional | 4 | 67/69 | 0 | 0 | 0 | 0 | 11/0 | 20 | 268 |

Healer presence across the band is 761/819 village-days (92.9%) — but that
average hides the shape: seven villages have a healer essentially every day
and one (s160507) has none on any day. There is no middle ground on this
band. NPC sick-days: 246. Tick events captured: 3238.

## Wall numbers (reported every run)

- national **0/8**, table **0**, wins **0**. Wave reach: 1: 8/8, 2: 8/8,
  3: 8/8, 4: 7/8, 5: **1/8** (s160501 only). Median survival **104.5d**,
  max **148d**. All 8 villages lost.
- Death causes (130 deaths): the wild 78, monster 27, starvation 5, ambush
  4, gavel 4, sickness 4, the arena 2, contest 2, the night 1, alien 1,
  grief counselor 1, a wound that wouldn't close 1.
- The scale wall stands: the competent policy reaches wave 5 once in 8
  seeds and never reaches national, the table, or a win. Deaths are
  dominated by the wild (60%) — the village bleeds out on expeditions
  long before standing or the table come into view.

## Village assessment (plain words)

Eight villages, all gone. Seven of them had a healer at Haven nearly every
day, and in those villages wound fever was a nuisance the duty swatted the
same evening it appeared — sixteen people caught it and were cured before
breakfast, and nobody died of it. The eighth village, s160507, had no
healer at all: it knew from day 3 ("someone has to learn, or find one") and
nobody ever did, and wound fever ran through it like a fire through dry
grass — eight cases in twenty days, four dead, the village gone by day 54
with six people left. The difference between a village that survives wound
fever and one that doesn't is exactly one person who knows doctoring. The
pharmacy never held a single dose anywhere, so the "proper medicine" cure
channel is a door with nothing behind it on this band. And the villages
still die mostly out in the wild, not in their beds — the fever story is
real but it isn't what ends runs.

## Sense-testing (SENSE-TESTING LAW)

Three episodes read in the transcripts:

1. **A wound-fever death with no healer (s160507, Sayri/gen_76jtlwn,
   onset d41, died d43).** The village's own lines tell the story
   honestly and then stop short: d43 "Ursula is feverish, a cut gone hot
   and angry. Rest and clean water — or it gets worse" (Ursula herself
   dies d47), and the hurt line "Alejandra is still hurting (58 HP) — no
   healer at haven. They rest today instead of ranging out" repeats
   verbatim for four hurt villagers on the same day. Sayri's death has **no
   say line at all** — she dies of the fever the village was warned about
   and nobody says her name. Finding #2094 (fever deaths are silent; the
   "someone has to learn" line has no path) is re-confirmed on a second
   band: the line repeats d3 and d10, medicCount stays 0 for 54 days,
   nobody learns, nobody is found. The wound-care line repeating
   identically per hurt villager per day is robotic — the same sentence
   with a different name and HP number, four times a day, for days.
2. **A same-tick onset+cure (s160503, Katarina, onset d25, cured d25 by
   Gladys).** The case medcure-b could not see. Katarina catches wound
   fever in the evening tick and Gladys cures her in the same tick — she
   never appears sick in any daily snapshot, and indeed the analyzer's
   onset-source split proves this is the norm, not the exception (29/29
   preCare-only). Katarina catches it again d30 and is cured again the
   same tick. The cure itself leaves no narration on the day in the
   captured lines — but cures elsewhere ARE narrated (see below), so this
   is a sampling gap in the captured lines, not a silent cure.
3. **A recovery (s160505, Quinn, onset d68, recovered d72).** Quinn's
   fever runs four days with a healer present and clears on its own —
   no cure event, no tend, just recovery. Coherent: not every fever needs
   the duty. On the same seed, the d98 line shows what a narrated cure
   looks like: "Field medicine on Enrique: clean the wound, poultice it,
   bind it right — the sickness has nowhere left to stand. Enrique is
   going to make it. (Fadi cured them — and the camp saw it.)" That line
   is good — specific, consequential, witnessed. (Enrique's wound-fever
   episode then ends the next day, d99, killed in the wild — cured of the
   fever, dead to the world anyway. The game doesn't protect you for
   being cured.)

**Sense verdict:** the medicine story reads true where it is voiced —
cures are specific and witnessed, the no-healer warning is honest — but
fever deaths pass in silence and the hurt line is a copy-paste chorus.
Both are already filed as #2094; this arm re-confirms them and adds the
verbatim-repetition note. No new narration defect found.

## Reachability verdict

- Waves 1–3: 8/8. Wave 4: 7/8. Wave 5: 1/8 (s160501, reached, village
  still lost at d129 with final pop 0). Regional: 7/8. National, table,
  win: 0/8. The content past wave 4 is reachable in the sims but not
  survivable on this band — the wall is survival, not access.

## Blanks filled or documented

- **Filled (#2095 → fixed):** the same-tick onset+cure invisibility is
  fixed at the instrument level — tick-phase snapshots (preTick/preCare/
  postCare/postTick) + episode builder v2 join 100% of duty cures. Any
  future disease arm that needs episode outcomes can use this driver/
  analyzer instead of snapshot-built episodes.
- **Documented (filed in `sim-findings.md`):** the balance-proof staleness
  the prereg recorded (recorded neutral proof no longer matches
  `B.manifest(root)` on 2 of 521 inputs — `src/js/convo-beats.js` and
  `scripts/policies/competent.js` changed since the proof was recorded;
  needs a fresh real observer-neutral maintenance proof via
  `scripts/balance-proof-update.js`, owned by whoever changed the inputs).
- **Documented (filed in `sim-findings.md`):** no-healer villages never
  acquire a healer — s160507 voices "someone has to learn, or find one"
  from day 3 and nobody does in 54 days; the wound-care line repeats
  verbatim per hurt villager per day (robotic chorus). Extends #2094.
- **Documented:** the medicine cure channel is a zero for the third
  consecutive arm (medicduty-a, medcure-b, this arm) — 0 doses held in
  819 village-days. If the medicine channel is meant to matter, the
  stock has to exist first; that is a spawn/economy question, not a duty
  question.

## Metric review

- The primary metric (instrument validity + complete capture, G1–G4) was
  judged exactly as registered. All four gates pass; the 100% join rate
  exceeds the 80% floor, and the design expectation (~100%) is met —
  the pre-care snapshot sees every record alive at cure time, as the
  prereg's code reading predicted.
- M1 as re-measured is citable: G2 passed, so the selection-artifact
  warning from medcure-b is lifted. The honest caveat is sample shape,
  not selection: the absent side is one village (s160507), so 4/8 is a
  single-village outcome. The fever-cause split (0/21 vs 4/8) is the
  comparison to carry forward; the all-cause split (3/21 vs 4/8) mixes in
  monster/wild deaths that happened to coincide with open episodes and
  should not be quoted as the fever rate.
- The onset-source split (29/29 preCare) retroactively explains medcure-b:
  its 5-episode denominator was not a small sample of the truth, it was
  the 5 episodes whose records happened to survive to a snapshot — and
  even those were the ones the duty had not cured immediately.
- No metric revision is proposed. A future confirm (if anyone wants tighter
  absent-side numbers) needs a band or policy that produces more healer-
  absent villages — on this band the duty holder is at Haven 92.9% of
  days, so the absent side will stay thin. That is a design fact about the
  census, not a flaw in this measurement.
- The 150d death-aware horizon was right: the longest village ran 148d,
  the median 104.5d; a fixed 200d horizon would have padded the
  denominator with post-death days on 7/8 seeds.

## Proof

- `node scripts/test-medcure-ev-b.js` — **19 passed, 0 failed** (rebased tip,
  master `3daa1a9b6`).
- `node scripts/medcure-ev-analyze-20261110.js
  evidence/2026-11-10/medcure-ev-b-corpus` — exit 0, **VERDICT: GO**
  (full output: `evidence/2026-11-10/medcure-ev-b-analysis.txt`).
- `git diff HEAD -- src/` empty at end — zero game code, instrument only.
- Corpus: `evidence/2026-11-10/medcure-ev-b-corpus/` (8 competent + 8 bare
  + `sweep-competent.json`), inherited complete from the 2046Z run,
  verified before use, not re-run.
