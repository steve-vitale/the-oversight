# sim-zeroattempt-b — decompose the dawn scorer's decision chain (DIAG)

**Verdict: DIAG GO** — all four pre-registered bars pass (see §Bars). No game
change was made or is proposed here; this arm decomposes WHY the
never-commit village never commits, one level deeper than expignite-b.

**Pre-registration:** `evidence/2026-11-16/sim-zeroattempt-b-prereg.md`
(frozen before the sweep). Band **103201–103208** (fresh — 0 hits across all
`evidence/*/sim-*-prereg.md` and the goal hidden-files forbidden-band lists),
8 seeds, 150d death-aware horizon, competent verbatim policy
(sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`),
two legs (OFF = master as-is, recorder off; ON = master as-is + recorder
wraps only), zero `src/js` change. Base master `410fb8109`; instrument
commits `ddbd69ce9`, `63c850e46`, `f8b23c9ce`, `7a7580071` on branch
`sim-zeroattempt-b`. Canon gap (established, not invented): no canon doc
covers expedition candidate picking — the chain below is grounded only in
`src/js/villager-brain.js`, `src/js/villager-agency.js`,
`src/js/villager-objectives.js`, `src/js/npc-triggers.js`,
`src/js/win-plan.js`.

**Primary metric (prereg):** classification completeness — every zero-attempt /
zero-launch seed on the band classified with dominant class + full per-day
counts AND the WHY decomposition ((a) which sub-gate fires in what order,
(b) what ASSIGN picks instead and why it always wins, (c) why 0-plan-holder
villages never get a plan, (d) whether the soft path ever reaches its chance
roll and what it returns). GO threshold: all four seeds classified, 0
unknowns, 0 mismatches.

## The answer in plain words

A village never commits to an expedition because **the win-plan store is
never switched on, and nothing else can switch it on for them**. The store
(`v.winPlan`) is the village's shared "we have a gameplan" notebook. It is
created only when a villager personally kills a beast, flees or evades a
wave-3+ fight — never by the village as a whole killing beasts, never by the
scholar killing beasts, never by a villager merely standing at Haven wanting
to go. On the four zero seeds, the village had already killed beasts by day
4–12 (the shared kill knowledge was there from the first week), and engaged
wanderers stood at Haven calling for a plan **228, 21, 269 and 29 times**
— every one of those calls hit the store's first line,
`if (!v || !v.winPlan) return null`, and died there, before the code ever
asked whether the villager was engaged. The engagement condition was
satisfied from the first week; the store's absence is the sole blocker. Wake
the store on the first Haven day (the Nov 17 ship's fix arm) and 103202,
103205 and 103206 would have seeded plans within days; 103203 would have
seeded on day 112, the first day its lone wanderer ever stood at Haven in
daylight with the danger low enough.

The soft wanderer/explorer path — the one that needs no plan at all — is
real but starved: of 1,088 wanderer/explorer days, the chance roll was
reached only **62 times (5.7%)** and passed **11 times**. The other 1,026
times it was preempted before the roll: the villager's core pick was an
outdoor chore (467), a duty overrode it (335), an assignment overrode it
(178), or the win plan held/launched instead (46). When the roll did pass,
it produced real launches (3 confirmed landed on plan seeds) — and on the
two zero-launch seeds, every hash-driven attempt (12 of them) was blocked
because the only person free to lead was the village's sole medic, who
cannot leave while anyone is sick. The soft path is not broken; it is
almost never reached, and when reached on a fragile village it runs into
the medic.

Assignments are the quiet second lock. The competent policy itself assigns
villagers to fish or fetch water, the assignment carries weight 99 against
core weights of ~7 and soft weights under 1, and **it never expires** —
observed assignments lasted 89–107 days, effectively the rest of the run.
An assigned villager never even gets to the expedition question.

## Bars

| Bar | Result |
|---|---|
| (1) 8/8 valid corpora each leg, 0 instrument errors, unknown 0, mismatches 0 | **PASS** — 8 ON + 8 OFF files, 0 errors, unknowns 0, mismatches 0 (analyzer + D3 re-derivation) |
| (2) Proof green (determinism + neutrality + re-derivation) | **PASS** — `scripts/test-zeroattempt-b.js`: **111 passed, 0 failed** (D1 recorder-ON-twice identical, D2 ON-vs-OFF identical trajectories, D3 synthetic + live re-derivation, 0 mismatches). Full-band D2 after the final sweep: **0 divergences** |
| (3) Classification completeness — every zero-attempt / zero-launch seed classified with dominant class + counts + WHY | **PASS** — 3 zero-attempt seeds (103202, 103203, 103205) + 1 zero-launch seed (103206), each classified below with dominant class/sub, per-day counts, and the WHY decomposition |
| (4) Wall numbers on both legs | **PASS** — identical on both legs (D2 0 divergences): national by standing 3/8, by scaleRank 0/8, table 0/8, wins 0/8, wave 4 8/8, wave 5 3/8, median survival 150.5 game-days (150 calendar days) |

Balanced panel (§15): DECLINED with reason, as pre-registered — this is a
recorder-corpus DIAG with no game change; OFF vs ON is a recorder-neutrality
check, not a lever; the D2 neutrality proof is the substitute, as prior
DIAGs did.

## (a) When no EXPEDITION candidate is offered — which sub-gate, in what order

Denominator: **4,385 villager-days** (alive, at Haven, not away; 4,010
away-days excluded). Code order, from the source:

**Gate rows — `objPick`, before the scorer ever runs (1,698 days, 38.7%):**

| Sub-gate | Days | What it is |
|---|---|---|
| B/gate-hunger | 1,643 | Hunger > 55 with pantry > 500 kcal: the villager eats first. A hunger day carries a gate row, never a score row — the expedition question is never asked |
| B/gate-want_knowledge | 35 | A knowledge want outranks the day |
| B/gate-fresh_kill | 20 | A fresh kill to deal with outranks the day |

**Score rows — `expeditionCand`, first failing gate in code order
(profile → night → trigger → range → sick) (2,053 days):**

| Sub-gate | Days | What it is |
|---|---|---|
| B/profile | 2,034 | Not a wanderer/explorer. The dominant single gate: most villagers simply never qualify |
| B/trigger | 9 | The village-danger trigger (`expedition_launch`, danger ≥ 4) blocks the day |
| B/night | 7 | Night — no departures |
| B/sick | 3 | Sick — no departures |

**Candidate offered, but an override wins (339 days, 7.7% — class C):**

| Sub | Days | What it is |
|---|---|---|
| C/core-outdoor | 135 | The core pick was an outdoor chore (forage/wood/water); the soft candidate loses to the day's work |
| C/duty | 103 | A duty (medic, guard, teaching) outranks the expedition |
| C/assign | 45 | An ASSIGN override (see §(b)) |
| C/hash | 30 | The soft candidate was offered and the hash roll failed |
| C/winplan-hold | 26 | The win plan held the villager (gear/party/veteran guard) |

Remainder: A/mid-errand 245 (already committed to an errand — the dawn
pass never offers), F/vbrain-party_launch 39 (win-plan launches),
D 6 (late commits), E 5 (medic-duty score rows). Class totals:
B 3,751 (85.5%), C 339, A 245, F 39, D 6, E 5. Unknowns 0, mismatches 0.

Reading: the expedition question is almost never reached. Hunger eats
37% of days before scoring; profile disqualifies 46% of the rest; and of
the 1,088 wanderer/explorer days that do reach the soft candidate, the
chance roll is consulted only 62 times (see §(d)).

## (b) When ASSIGN overrides — what it picks, and why it always wins

- **What it picks:** fish (28 score rows) and water (17). All 45 overrides
  came `via: in-person` — the competent policy itself assigning the
  villager to a survival chore. Cook assignments also exist (observed up to
  106 days) but never overrode an expedition candidate on a score row.
- **Why it always wins:** `assignFeedCandFor` builds one ASSIGN candidate
  with **weight 99**. Core weights top out around 7; soft weights top out
  at 0.88. There is no contest — 99 beats everything, every day.
- **Why it never lets go:** `assignTask` writes
  `v.assignments[vid] = {task, assignedDay, assignedPart, via, buddy}` with
  **no expiry**; only a `rest` assignment deletes the entry. Observed
  assignment persistence on this band: fish up to **107 days**
  (103207), water up to **89 days** (103202), cook up to **106 days**
  (103207) — effectively the rest of the run. A villager assigned to fish
  on day 3 is still a fisher on day 110, and the expedition question is
  never asked of them again.
- **Scale:** ASSIGN preempted the soft hash **178 times** (16.4% of soft
  rows); on 103202 alone it preempted 129 of 340 soft rows (38%).

## (c) Why 0-plan-holder villages never get a plan

The store (`v.winPlan`) is created only by four paths, all villager-side
(`src/js/win-plan.js`, `villager-agency.js`, `game.js`):

1. `winPlanNoteKill` — a **villager** personally kills a beast (any wave).
2. `winPlanSeedFromFight` — a villager flees/evades a **wave-3+** fight
   (callers: `game.js` flee path, `villager-agency.js` evade/flee paths).
3. `winPlanOf` — post-plan only (never creates the first plan).
4. `winPlanHavenTick` — creates a plan for an engaged ranger at Haven,
   **but only if the store already exists**
   (`if (!v || !v.winPlan) return null;` — the catch-22, still present on
   this base; the Nov 17 ship `947613d28` shipped the diagnosis, the fix
   has not landed).

The engagement check inside `winPlanHavenTick` is satisfied by either
personal fight knowledge (`know.fought`) **or** village slain knowledge
(any entry in top-level `state.villageSlain` — the deed talk tells
everyone). The village's shared kill knowledge is **not** the blocker:

| Seed | First village slain | Store ever init | Engaged ranger calls with store missing | First plan |
|---|---|---|---|---|
| 103201 | day 4 | yes, d33 (noteKill) | 88 (before d33) | d33 havenTick |
| 103202 | day 6 | **never** | **228 of 241 haven calls** | — |
| 103203 | day 5 | **never** | **21 of 21 haven calls** | — |
| 103204 | day 4 | yes, d35 (agency-evade) | 64 (before d35) | d35 agency-evade |
| 103205 | day 5 | **never** | **269 of 278 haven calls** | — |
| 103206 | day 12 | **never** | **29 of 30 haven calls** | — |
| 103207 | day 5 | yes, d24 (noteKill) | 39 (before d24) | d25 havenTick |
| 103208 | day 11 | yes, d34 (noteKill) | 75 (before d34) | d34 havenTick |

Every engaged-store-missing call above was by a wanderer/explorer — the
profile gate passed too. On the zero seeds the store was the **only**
missing piece, and it was missing for the whole run (up to 38 distinct
monster types slain by the village, 19 wave-4 kills band-wide, and still
no store). The kills that feed `villageSlain` are mostly the scholar's:
the scholar's kills enter the village kill log (60 wave-3, 19 wave-4,
2 wave-5 kills band-wide) and the shared slain count, but
`winPlanNoteKill` is called only from villager fight
resolution (`villager-agency.js:689`), so a scholar kill never touches
the store. A village can kill wave-4 beasts and reach wave 5 (103203:
4 wave-4 kills, wave 5, standing 295) without any villager ever having a
`know.fought` entry — and on the zero seeds **no villager ever did**
(firstFoughtDay null on all four; band-wide `know.fought` max 9 on plan
seeds, 0 on zero seeds).

Two wrinkles inside the zero seeds:

- **103203** is doubly locked. It has one wanderer (Maya Singh, 32
  wanderer-days in 150) and `winPlanHavenTick` was called only 21 times,
  all Maya, all days 112–141. Before day 112 her heard-filtered
  village-danger belief stayed ≥ 4, so `agencyTick`'s danger gate
  (`npcTrigger` `expedition_launch`) never even reached the Haven tick.
  Waking the store alone would seed her plan on day 112 at the earliest.
- **103205** died on day 59 with 278 Haven-tick calls — the most
  opportunities on the band, all wasted on the missing store. Its
  dominant class is A/mid-errand (125 of 294 days, 42.5%): the village
  spent its short life mid-errand.

On the plan seeds, ignition waited for a villager's own violent encounter
even though the village had been killing beasts since day 4–11: noteKill
on days 24/33/34, one agency-evade on day 35 (103204 — the villager fled
a wave-3+ fight; 5 engaged store-missing calls preceded it). Once the
store exists, plans seed immediately: `engagementFail` is 0 on all 8
seeds — every Haven-tick call by a plan-less villager with the store
present found them engaged (via village slain knowledge) and created a
plan. Plan holders: 6/4/6/5 villagers, 175/38/143/75 holder-days on the
plan seeds; 0 holders, 0 holder-days on the zero seeds. Ledger check:
every census plan holder traces to a creation on/before its first
observed day; 0 unknowns.

## (d) The soft path — does it ever reach its chance roll, and what does it return

Yes — rarely, and when it passes it works.

| | Count |
|---|---|
| Soft (wanderer/explorer) rows | 1,088 |
| Chance roll consulted | 62 (5.7%) |
| Roll passed | 11 (17.7% of consulted; 1.0% of soft rows) |
| Roll failed | 51 |
| Preempted before the roll: core pick outdoor | 467 (42.9%) |
| Preempted: duty override | 335 (30.8%) |
| Preempted: ASSIGN override | 178 (16.4%) |
| Preempted: win-plan hold/launch | 46 (4.2%) |

The 11 passes, by seed: 103201 Asher d32; 103204 Gina d24, d32, Ingrid
d34; 103206 Simone d31; 103207 Somchai d24; 103208 Theo d3/d5/d12/d23,
Ivan d34. Each pass sets the dawn override to `expedition_hash` and
produces a same-day EXPEDITION commit. Confirmed landed from hash
passes: Gina d24 (103204), Somchai d24 (103207), Ivan d34 (103208) —
depart rows show `ret: launch`, `expedAfter: true`. The soft path is
alive; it is starved of consultations, not broken at the roll.

On the two zero-launch seeds the hash passes all died at the medic:
- **103206:** Simone's d31 pass produced 2 launch attempts the same day
  (launch + same-day repick), both blocked `medic-duty` — Simone was the
  village's only healer. 2 attempts, 0 landed.
- **103208:** Theo's 4 passes (d3/5/12/23) produced 10 blocked attempts,
  all `medic-duty`; Ivan's d34 pass landed. 17 attempts, 7 landed,
  10 blocked — all 10 by Theo, the sole medic.
- Band-wide: 73 attempts, 60 landed, 13 blocked (12 medic-duty, 1
  hurt-no-care). The medic-duty block is transient: once a second healer
  exists the holder is freed — Simone ranged out on d55/d60 (returns
  voiced), Theo on d39 (+4,916 kcal).

## Per-seed classification (bar 3)

| Seed | Days / end | Class | Dominant WHY |
|---|---|---|---|
| 103201 | 150, survived, w4, st 199, regional | not zero (27 att, 26 landed) | B/profile 339; hunger 198. Store d33 noteKill; 6 holders, 175 holder-days |
| 103202 | 150, survived, w4, st 199, regional | **ZERO-ATTEMPT, ZERO-LAUNCH** | Store never init; first slain d6; 228 engaged ranger calls wasted; B/gate-hunger 287, B/profile 209; ASSIGN preempts 129/340 soft rows; hash 6 consulted, 0 passed. 505 wanderer/explorer days, 0 launches |
| 103203 | 150, survived, w5, st 295, regional | **ZERO-ATTEMPT, ZERO-LAUNCH** | Store never init; first slain d5; only 21 Haven-tick calls (all Maya, d112–141 — danger belief ≥ 4 until d112); 1 wanderer, 32 days; hash never consulted (0/21). Wave 5 + 4 w4 kills with no villager ever fighting |
| 103204 | 73, village-lost, w4, st 120, village | not zero (6/6 landed) | B/profile 105; hunger 89. Store d35 agency-evade; first fought d25; 4 holders, 38 holder-days |
| 103205 | 59, village-lost, w4, st 100, village | **ZERO-ATTEMPT, ZERO-LAUNCH** | Store never init; first slain d5; 269 engaged ranger calls wasted in 59 days; A/mid-errand 125 (42.5%); hash 7 consulted, 0 passed |
| 103206 | 150, survived, w4, st 199, regional | **ZERO-LAUNCH** (2 att, 0 landed) | Store never init; first slain d12; only 30 Haven-tick calls; hash 6 consulted, 1 passed (Simone d31) → 2 attempts, both medic-duty blocked |
| 103207 | 150, survived, w5, st 335, regional | not zero (21/21 landed) | B/profile 456; hunger 173. Store d24 noteKill; 6 holders, 143 holder-days |
| 103208 | 128, village-lost, w5, st 300, regional | not zero (17 att, 7 landed) | B/gate-hunger 203, B/profile 199. Store d34 noteKill; hash 16 consulted, 5 passed; Theo's 10 medic-duty blocks |

## Wall numbers (both legs, identical — D2 0 divergences)

- National by standing (≥ 200): **3/8** (103203, 103207, 103208).
  Three more sit at exactly **199** (103201, 103202, 103206) — one point
  below the line.
- National by scaleRank: **0/8**. Table: **0/8**. Wins: **0/8**.
- Wave 4 unlocked: **8/8**. Wave 5 unlocked: **3/8** (103203, 103207, 103208).
- Median survival: **150.5 game-days** (150 calendar days); 5/8 survived
  to 150d; villages lost d59 (103205), d73 (103204), d128 (103208).
- Deaths 498 band-wide; wave-3 kills 60, wave-4 kills 19, wave-5 kills 2;
  60 landed trips, 13 blocked attempts.

## Sense-testing (transcripts read, not just counts)

- **Returns are voiced richly and specifically** — direction, kcal,
  stories, scars, strange meat, hurt returns: *"Asher is back from past
  the north (+1846 kcal for the pantry, 3 stories)"*, *"Howard returns
  from the wilds hurt (health 3/100) — the trip cut short."* Coherent.
- **Departures are silent.** No line anywhere on the band announces a
  villager setting out. A launch is invisible at departure and visible
  only at return. (Backlog: see findings.)
- **The medic-duty hold IS voiced as a role, never as a blocked launch:**
  *"Simone is staying at Haven as the camp healer now — tending the sick
  instead of ranging out."* (103206 d2), *"Theo is staying at Haven as
  the camp healer now"* (103208 d2). The player sees the holder staying,
  never the launch attempt being refused.
- **Zero-launch villages talk about healing, teaching and hurting — never
  about hunting.** 103205's lines are a wound diary: *"Kate is still
  hurting (50 HP) — no healer at haven"* day after day (d10–20, HP
  50→68), *"Nobody here knows doctoring, and Abraam is burning up. The
  village has no healer — someone has to learn, or find one."* 103202/103203
  are teaching and synergy lines (Field Pharmacy / Fever's End discovered
  repeatedly). No line on any zero seed mentions a plan, a hunt, or a
  villager expedition launch. The silence is consistent with the numbers.
- **Repetition, still present:** *"X came back from the treeline
  white-faced. Saw it too. Whatever it is, it's still out there."* —
  **71× band-wide** (expignite-b flagged 64× on its band), word-identical
  on all 8 seeds including the zero-launch ones. *"Took Expedition haul."*
  40× + *"You eat Expedition haul (500 kcal)."* 23× — the scholar's haul
  loop, rote. (Backlog.)
- **Coherent oddities that check out:** *"Oliver is leaving — not
  foraging. Really leaving. 'I'll bring back something worth the walk.'"*
  (103208 d35, a villager emigrating); *"You wake up somebody else.
  Jordan Cao, 38 — a paramedic."* (103208 d33, scholar death/respawn).
  One caveat: 103203 d37 *"Rim stops mid-fight and binds the wound —
  field medicine, +20 HP"* shows a villager in fight narration while
  `know.fought` stays empty all run — fight narration and the plan
  store's knowledge channel are not the same thing. (Backlog: verify
  which fight paths write `know.fought`.)

## Instrument corrections (pre-sweep; trajectories unchanged)

Three instrument bugs were caught and fixed between the frozen prereg and
the final sweep; each fix was proven (proof re-run green) and the legs
re-run, with trajectories verified identical before and after (D2 0
divergences; seed-by-seed days/standing/deaths/kills/launches match).
The prereg file itself was left untouched as the frozen record.

1. **MODE/recorder mislabel trap** (`63c850e46`): the driver switched the
   recorder on an env var, not on MODE — the first OFF leg ran with the
   recorder on (1,060 score rows on seed 103201) and was discarded. The
   driver now refuses a MODE=off run with the recorder on (and vice
   versa), and the usage header says so.
2. **Post-run store read** (`f8b23c9ce`): the driver's end-of-run
   `Game.winPlanStats()` call creates the store via `stateOf()`, which
   would have made `storeExistsFinal` always true. Now a raw read; the
   analyzer derives store-ever-init only from during-run census/init
   rows (proven by a synthetic never-initialized seed with a contaminated
   `storeExistsFinal: true`).
3. **Slain path** (`7a7580071`): `villageSlainN` read
   `state.village.villageSlain`, which never exists — it returned 0 on
   all 8 seeds of the first full sweep even on seeds with 5 wave-4 kills.
   The game writes top-level `state.villageSlain` (`game.js`
   `recordWaveKill`; `win-plan.js` havenTick reads the same path). The
   first sweep's slain/engagement numbers were wrong and are superseded;
   only the corrected analysis is committed. The corrected numbers are
   what §(c) rests on (first slain day 4–12 on every seed; engaged
   store-missing calls 228/21/269/29).

The OFF leg was run once (valid throughout); the ON leg was run twice
(first run discarded after fix 3; second run trajectory-identical).
`safe-commit.sh`'s index clobber struck after every commit on this arm
(staged-deleted + untracked for the just-committed files); each time
repaired with `git ls-tree -r HEAD -- <paths> | git update-index --add
--index-info` and verified (`git status` empty, `git diff HEAD` empty,
`hash-object` == HEAD blob per file). Commits are correct; only the main
index lied.

## Metric review

- `engagementFail` is structurally 0 once a village has any slain type:
  it measures "store present + plan-less + unengaged", and after the
  first week every villager is engaged via village slain knowledge. It
  does not discriminate; the discriminating field is
  `engagedStoreMissing`.
- `medianOn` 150.5 is game-days (scholar day counter); the calendar-day
  median is 150. Report both.
- The standing-199 cluster (three seeds at exactly 199, one point below
  the ≥ 200 national-by-standing line) is a wall observation, not a
  metric defect — but it is the third band in a row to park villages just
  under a line, and it is worth a look at what gates standing 199→200.
- `firstFoughtDay` is "first dawn census showing a `know.fought` entry",
  so a kill and its first fought observation can land a day apart (e.g.
  103201: store init by noteKill d33, first fought census d34). The
  one-day lag is a census artifact, not a game fact.

## Files

- Prereg: `evidence/2026-11-16/sim-zeroattempt-b-prereg.md`
- Evidence (this file): `evidence/2026-11-16/sim-zeroattempt-b.md`
- Analysis: `evidence/2026-11-16/zeroattempt-b-analysis.json`
- Corpora: `evidence/2026-11-16/perseed-zeroattempt-b-on/` (8 files),
  `evidence/2026-11-16/perseed-zeroattempt-b-off/` (8 files)
- Instrument: `scripts/zeroattempt-driver-20261116.js`,
  `scripts/analyze-zeroattempt-b.js`, `scripts/test-zeroattempt-b.js`
  (111 passed, 0 failed)

## Out of scope (backlog, not chased)

- Treeline white-faced repetition (71×, word-identical) — appended to
  `sim-findings.md`.
- Launches unvoiced at departure; fight narration (`know.fought`
  channel) gap — appended to `sim-findings.md`.
