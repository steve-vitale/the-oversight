# sim-medcure-b — FIRST NUMBERS (disease / medic cure), NO-GO on G2

**Arm:** sim-medcure-b (FIRST NUMBERS measurement) · **Run:** fleshout-loop-b-20261110T1930Z
(Loop B adoption of the stranded 1730Z arm) · **Axis:** winnability chain /
scale-onramp (converging) · **Branch:** sim-medcure-b, base master `28a3952fd`
· **Band:** 160209–160216 (8 seeds, pilot) · **Policy:** competent (unmodified),
env `PLENTYDEPRI=1 DEPOSITGATE=1`, horizon 150d death-aware · **Prereg:**
`evidence/2026-11-10/sim-medcure-b-prereg.md` (binding; committed by the 1730Z
run before any judged computation) · **Zero `src/js`** — instrument only.

**Adoption note.** The 1730Z coordinator died mid-sweep. This run inherited
4/8 recorded cells (s160209–s160212) and the driver + analyzer + proof test,
all uncommitted. The 4 inherited files were verified before use (valid JSON,
day rows span 1→last day, 0 instrument errors) and their md5s were recorded
and re-verified after the run — **untouched, not re-run**. The missing 4 cells
(s160213–s160216) were run with the same driver via its exported `oneRun`
(the CLI sweep would have re-run the 4 valid cells, so it was not used).
Bare neutrality fingerprints were generated for all 8 seeds the same way.
No sweep summary (`sweep-competent.json`) was written — the adoption ran cells
via `oneRun`, not the CLI — so the analyzer's G3 used its shared-subset
fallback; the full-fingerprint recheck below covers the prereg's G3 text.

## Verdict: NO-GO — G2 FAIL

Judged strictly against the prereg G1–G4 bar. A miss on any gate is NO-GO;
nothing was re-scored against a friendlier metric.

| Gate | Result | Evidence |
|------|--------|----------|
| G1 capture complete, 8/8 | **PASS** | 8/8 seeds exit 0; all corpora parse; day rows span 1→last day; 0 instrument errors on all 8 seeds |
| G2 episode join clean | **FAIL** | unlinked wound-fever deaths 0, unclassified healer status 0, counter mismatch 0 — but **79/82 duty-cure events have no episode to join** (0 unrecorded required) |
| G3 neutrality | **PASS** | bare 8/8 match (analyzer shared subset); full-fingerprint recheck (see below) MATCH 8/8 including endReason + finalPop |
| G4 proof green | **PASS** | `scripts/test-medcure-b.js`: **14 passed, 0 failed** (determinism + recorder-validity fixtures + broken-fixture sensitivity) |

**The G2 failure, named.** The duty cures too fast for the instrument to see.
`villageSicknessTick()` runs inside `endDay()` ← `sleep()`, *after* the day's
`policy.daily` snapshot; inside the same tick, disease onsets/progresses first
and then `villagerCareTick` runs the medic-duty cure loop
(`medicDutyCureAttempt`, game.js ~33290), which tries to cure before tending.
A villager who contracts wound fever (or generic fever) in the tick and is
cured by the duty in the same tick **never appears in any daily snapshot** —
so the episode builder, which builds episodes only from the snapshot series,
has no episode for the cure to join. 79 of 82 cure events are "unrecorded"
in that sense; **0 of the 14 wound-fever cures joined an episode**. The 3
cures that did join are all generic fever (`disease`) in episodes that
survived to a snapshot (s160214 d72/d73 Ursula → Devon; s160215 d44 Loc →
Victor). The cure events themselves are real — they reconcile exactly with
the game's own `v.medicDutyCures` counters on all 8 seeds — the episodes are
the blind spot, not the cures.

**What the partial numbers are worth.** M2 and M3 are trustworthy (see
below): the cure totals are counter-reconciled and the pharmacy series is a
direct read. **M1 is NOT a valid re-measure of the 2026-11-08 census** — its
denominator (5 episodes) contains only cases the duty did *not* cure
immediately, a severe selection effect. The 0/2 vs 2/3 split is reported for
the record and must not be compared to 2.4%/24.0%.

## M1 — wound-fever death rate by healer presence (PRIMARY, biased — see above)

NPC wound_fever episodes, healer presence at onset (census shape, died/episodes):

- healer present: **0/2 = 0.0%** (fever-cause only 0/2)
- healer absent: **2/3 = 66.7%** (fever-cause only 2/3)
- unclassified healer status: 0
- duty-cured wound-fever episodes: present 0, absent 0 (all 14 wound-fever
  cures are same-tick, invisible to the builder)
- all-disease NPC mortality (same selection bias): present 3/39 (7.7%),
  absent 2/8 (25.0%)

The 5 wound-fever episodes: s160209 Lillian (onset d9, healer absent,
recovered d12); s160214 Bessie (d29–31, present, recovered) and Jesse
(d29–30, present, recovered); s160215 Ivy (d21–37, absent, **died d37**) and
Alex (d32–32, absent, **died d32**). Both deaths are in the one village that
spent a third of its days without a healer (s160215: healer 98/141 days,
medicCount 0). Healer presence across the band is 744/805 village-days
(92.4%) — the "absent" side of the census comparison is nearly unmeasurable
in 8 seeds on this band, because the duty holder is almost always at Haven.

## M2 — cure channel split (trustworthy: counter-reconciled 8/8)

- **Total duty cures: 82 — ability 82, medicine 0.** Counter-mismatch seeds: 0.
- By disease: wound_fever 14 (ability), generic fever (`disease`) 68 (ability).
- Per seed (ability/medicine): s160209 4/0, s160210 13/0, s160211 11/0,
  s160212 13/0, s160213 2/0, s160214 14/0, s160215 12/0, s160216 13/0.
- The medicine channel fired **0 times on 8/8 seeds** — the same zero the
  medicduty-a landing saw. M3 explains why: there was never any stock to spend.

## M3 — pharmacy stock over time (trustworthy: direct read)

- Village-days: 805. Mean doses/day: **0** (antibiotics 0, antiparasitic 0).
  Max doses on any day: **0**. Stocked days: **0**. Zero days: **805**.
  Seeds that ever held medicine: **0/8**. Stock-change events: **0**.
- In 805 village-days no village ever held a single dose of ruin medicine.
  The pharmacy is empty from day 1 to village death on every seed. The
  medicine cure channel is decoration on this band — it cannot fire, not
  because the duty fails to try it, but because the stock it would spend
  never exists.

## Per-seed table

| seed | days | end | rank | healer days | wf eps | wf died | cures ab/med | sayLines |
|------|------|-----|------|-------------|--------|---------|--------------|----------|
| 160209 | 150 | survived | regional | 138/150 | 1 | 0 | 4/0 | 57 |
| 160210 | 79 | village-lost | regional | 77/79 | 0 | 0 | 13/0 | 40 |
| 160211 | 117 | village-lost | regional | 116/117 | 0 | 0 | 11/0 | 28 |
| 160212 | 75 | village-lost | regional | 74/74 | 0 | 0 | 13/0 | 27 |
| 160213 | 63 | village-lost | regional | 62/62 | 0 | 0 | 2/0 | 18 |
| 160214 | 81 | village-lost | regional | 78/80 | 2 | 0 | 14/0 | 31 |
| 160215 | 142 | village-lost | regional | 98/141 | 2 | 2 | 12/0 | 101 |
| 160216 | 102 | village-lost | regional | 101/102 | 0 | 0 | 13/0 | 30 |

Four seeds (160212–160215) have day rows ending one day before daysAlive
(e.g. s160212: rows 1→74, daysAlive 75, 3 deaths on day 75 after the last
snapshot). That is the documented tick-after-snapshot ordering, not a
capture failure: the deaths happen in the final sleep, after the last
snapshot. One such death joined an episode via the +1 window (analyzer
"reconciled" count 1, s160214).

## Wall numbers (reported every run)

- **national 0/8, table 0, wins 0.** All 8 villages regional at end.
- **Wave reach:** W1 8/8, W2 8/8, W3 8/8, W4 8/8, **W5 1/8** (s160209 only).
- **Survival:** median **91.5d**, max **150d** (s160209, the only survivor).
- **Deaths: 109 total.** Causes: the wild 69 (63.3%), monster 16, the arena 4,
  a stranger 4, ambush 4, contest 2, sickness 2, the moderator 1, a wound
  that wouldn't close 1, gavel 1, choir toad 1, combat 1, the night 1,
  sunback 1, the reunion 1.
- The wall stands: nothing reached national, the table, or a win on this band.

## Sense-testing (SENSE-TESTING LAW — transcripts, not counts)

**1. Ivy dies of wound fever, s160215, d21–d37 — the game names the blank
twice and nobody ever acts on it.** Ivy is hurt early ("Ivy is still hurting
(11 HP) — no healer at haven" repeats for days). Day 21: "Nobody here knows
doctoring, and Ivy is burning up. The village has no healer — someone has to
learn, or find one." The same line repeats verbatim on day 35. In the 16
days between, nobody learns doctoring and nobody is found: medicCount stays
0, healerPresent stays false. Worse, day 25 says "Ivy is back on their feet
— the fever ran its course" — while the wound-fever record persists to her
death on day 37. The village is told she recovered; she then wastes away at
8–11 HP for 12 more days and dies. And the death itself is silent: **zero**
sayLines in the seed's 101 captured lines match died/succumbed/has died.
Ivy's own day-13 line — "Sitting with the fever cases instead — someone
should" — reads as the village's conscience, and then the village watches her
die of the fever she sat with. Coherent, consequential, and damning: the
narration knows exactly what is missing and the systems never answer it.

**2. Alex dies of wound fever, s160215, d31–d32 — one day from first symptom
to death.** Day 31: "Alex is feverish, a cut gone hot and angry. Rest and
clean water — or it gets worse." Day 32: "Alex is still hurting (1 HP) — no
healer at haven" — twice, identically — then the death row (cause sickness).
No death line, no farewell, no reaction from anyone. A villager goes from
first fever line to dead inside a day, and the only trace is a duplicated
hurt line. The speed is the point: with no healer and severity 2, wound
fever can kill faster than the village can even notice it is happening.

**3. The cures read like people; the instrument cannot see them.** Grace,
s160210 d7: "Herbal remedy on Grace: the right plants, brewed dark — the
feverish breaks and doesn't come back. Grace is going to make it. (Maya cured
them — and the camp saw it.)" Lillian, s160209 d14: "Field medicine on
Lillian: clean the wound, poultice it, bind it right — the sickness has
nowhere left to stand. Lillian is going to make it. (Tariq cured them — and
the camp saw it.)" Named healer, named method, named patient, witnesses.
But the episode builder calls Lillian's first episode (d9–12) "recovered"
and the d14 cure "unrecorded": Lillian caught wound fever a second time
after d12 and was cured the same tick, so the game knows she was cured and
the measurement does not. The narration is ahead of the instrument here.

## Village assessment (plain words)

Seven of the eight villages died; only s160209 lived the full 150 days, ending
regional with six people left, the only village to reach wave 5. The rest died
between day 63 and day 142, all regional, all stuck at wave 4. The killer was
not disease — it was the road. "The wild" took 69 of 109 deaths (63%): the
villages bled out on expeditions and in the wild, a few at a time, until
there was nobody left. Monsters took 16 more. Wound fever killed exactly two
people all run, both in s160215, the one village that spent a third of its
days with no healer and no medic at all. Everywhere else a healer was present
nearly every day and the duty worked fast — 82 cures, all by healing ability,
most of them the same day the fever appeared, which is why the fever almost
never got the chance to kill. The pharmacy is the emptiest room in the game:
805 village-days and not one dose of antibiotics or antiparasitic ever sat on
a shelf, so the medicine cure channel never had anything to spend. The
villages looked competent, regional, wave-4-stuck, and thin — dying on the
road while the healer at home cured fevers faster than the record-keeping
could see.

## Metric review

- **The primary metric is instrument validity, and the instrument failed
  exactly one leg.** G2 as implemented counts cure-events-without-episodes;
  the prereg's parenthetical — "duty-cure events reconcile exactly with
  `v.medicDutyCures` counters" — passed 8/8. The events are real; the
  snapshot-built episodes are blind to same-tick onset+cure. The prereg's
  metric-review note anticipated same-day *death* and the +1 window; it did
  not anticipate same-tick *onset+cure with no snapshot at all*. That is the
  correction to carry forward: the episode builder needs onset/cure *event*
  capture (sick-record create/delete events), not snapshot episodes — or
  sub-daily sampling — before M1 can be re-measured on any band. Do NOT
  re-run this band with the same instrument expecting a different G2.
- **M1 must not be cited as the census re-measure.** 0/2 vs 2/3 is a
  selection artifact of the same blindness (cured cases never enter the
  denominator). The honest first numbers from this arm are M2 (82 ability /
  0 medicine, counter-reconciled) and M3 (pharmacy always empty), plus the
  two real fever deaths and the healer-presence share (92.4%).
- **G3, strengthened.** The analyzer passed G3 on its shared-subset fallback
  (no sweep summary exists — adoption ran via `oneRun`). A full-fingerprint
  recheck (in-memory re-run of all 8 recorded cells, no corpus writes;
  determinism proven by L4a) matched recorded vs bare on **8/8, including
  endReason and finalPop**. A naive comparison of bare finalPop against the
  last snapshot's pop mismatched 5/8 — that is a read-point artifact
  (post-sleep roster vs pre-sleep snapshot; the final sleep's deaths and
  joins land after the last snapshot), documented here so the next reader
  does not re-open it.
- **Instrument note, unexamined.** The 3 day-75 deaths in s160212 all carry
  `isPlayer=true` with distinct vids (Ridwaan, Josue, Ananya — "the wild").
  Plausibly reincarnation mid-wipe; not investigated, not a verdict.
- **No lever built.** `git diff HEAD -- src/` is empty. First numbers only,
  as preregistered.
