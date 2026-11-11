# Reconcile-divergence feeder probe — findings

**Date:** 2026-11-10 (evening, CST)
**Worktree:** `~/workspace/worktrees/reconcile-forward`, branch `reconcile-divergence` at `743e07d87`
(master measured against: `3daa1a9b6` at probe time; current master `fc0ffb37c` — the branch is
behind master, which is fine for this probe; record the SHA, do not rebase.)
**Pin:** `scripts/test-person-trust-20261108.js`, errand-mix, seed 84101, 30d, competent.
Baseline EAT 36, pin band [27, 45]. Merged tree reads EAT **59**, local-alone reads EAT **23**.

## Verdict

**The interaction is REAL, and the mechanism is found. It is NOT the believed-pantry
feeder.** The EAT gate, the pantry, the nightly meal, and the hunger-gain rate are all
exonerated. The cause is Cursor's dawn scorer (`src/js/villager-brain.js`, Phase 6 DUTY ads)
combined with a village cistern that is chronically nearly dry:

1. The cistern holds under 2 days of water essentially always (believed waterDays mean
   0.61, range 0–1.5, below 2 on 211/211 sampled dawn decisions). This is a property of the
   village simulation on **both** trees — the local tree's lottery also picks WATER 174
   times (58% of all picks).
2. On the merged tree only, the dawn scorer adds DUTY ads from believed village needs.
   The water duty ad weighs 3.0–5.5+. It **wins the commitment whenever its weight is
   >= the weight of whichever candidate the core lottery happened to draw** — so whenever
   the lottery draws a light indoor kind (HAVEN_CHORE ~1–3, VISIT ~1–2), the water duty
   beats it. That happened on **60 of 291 picks (21%)**.
3. Every one of those 60 overrides is rewritten into a WATER objective (all-day trip to
   fetch water). Merged WATER = 138 lottery picks + 60 duty overrides = **198**; merged
   dawn WATER picks = **152 vs 69 local**.
4. A dawn water trip occupies the villager all day. Hunger rises ~9 per day-part on both
   trees (identical rate). Villagers who finish and re-pick at the end of the day
   (part 3) are at peak hunger (~60) — and the EAT gate fires on hunger > 55.
   Merged part-3 EATs: **53 vs 19 local**; total EAT **59 vs 23**.

In plain words: on the merged tree, villagers spend their mornings fetching water
because the village is always almost out of it, so they come home at dusk hungry and
eat. On the local tree, mornings are a mix of chores and visits, so villagers re-pick
mid-day at moderate hunger and rarely need the EAT objective. Nobody eats differently —
the day just gets spent differently.

## What was ruled out (each measured, not assumed)

- **Believed-vs-live pantry (prime suspect) — REFUTED.** Forcing the EAT gate's pantry
  read to the live pantry changed nothing: EAT stayed 59, bit-identical panel. Expected
  in hindsight: at Haven the believed pantry *is* the live pantry
  (`objResourceBelief` → `objResourceSee` → `objResourceLiveSnap` → `pantryKcalLive`).
- **Pantry binding — RULED OUT.** Pantry > 500 on 291/291 merged picks and 300/300 local
  picks (median 16,900 vs 23,150 kcal; day-1 47,250 on both). The EAT gate
  (`hunger > 55 && pantry > 500`) reduces to hunger > 55 on both trees. Local's pantry
  is actually HIGHER than merged's, so scarcity cannot explain merged eating more.
- **Hunger gain rate — IDENTICAL.** Same-day consecutive-pick hunger gain per part
  elapsed: ~9.0 both trees (gap 1: 9.00 both; gap 2: 8.97 vs 9.12; gap 3: 9.62 vs 9.47).
  Part-0→part-3 same-day gain 28.6 vs 28.3. Consistent with `tickNeeds()` (+8/part).
- **Nightly meal — NOT the difference.** 0 villagers leave the meal with hunger > 55 on
  either tree (0/298 merged, 0/278 local); mean ate ~2,073 kcal both; 0 fasting calls.
  Meal-call counts differ per villager only because roster presence/lifespan differs.
- **Cursor touching hunger code — NO.** The `d229b58f5..a628aeaf3` diff contains no hunger /
  `villageEats` / `npcNeeds` changes. The difference is emergent behavior, not a tuned
  number.

## The numbers

### Pin re-run (merged, as-is — step 2)

EAT **59**, bit-identical to `persontrust-fresh-merged.log`. FAIL 1 / pass 18.
Kinds: LEAVE 2, WATER 198, EAT 59, VISIT 11, FORAGE 2, SEEK 19. Total picks 291.

### Primary probe (step 3) — force EAT gate to live pantry

Uncommitted worktree edit only, then reverted (`git checkout -- src/js/villager-objectives.js`).
EAT stayed **59**, bit-identical on every number. Believed-vs-live is refuted as the
EAT-gate mechanism.

### Eat-gate instrumentation (step 4)

Driver `eat-gate-probe-20261110.js` wraps `Game.objPick`, records day/part/vid/hunger/
energy/live-pantry/away/kind. Rows: `eat-probe-rows-merged.json`, `eat-probe-rows-local.json`
(local run on current master, read-only; main tree verified clean after).

| | Merged | Local-alone |
|---|---|---|
| Total picks | 291 (all NPC, 0 away) | 300 |
| EAT | 59 | 23 |
| Picks with hunger > 55 | 59 | 23 |
| Picks with pantry > 500 | 291/291 | 300/300 |
| Median live pantry | 16,900 kcal | 23,150 kcal |
| Mean hunger at pick | 32.8 (median 32) | 33.0 (median 33) |
| Picks by part (0/1/2/3) | 170 / 47 / 13 / 61 | 100 / 65 / 60 / 75 |
| Mean hunger by part | 20.1 / 38.1 / 50.3 / 60.4 | 22.9 / 28.9 / 37.3 / 46.6 |
| Part-3 kinds | EAT 53, WATER 5, VISIT 3 | EAT 19, FORAGE 2, VISIT 9, HAVEN_CHORE 12, WATER 30, SEEK 3 |
| Part-0 kinds | WATER 152, SEEK 14, LEAVE 2, VISIT 2 | WATER 69, HAVEN_CHORE 7, VISIT 12, SEEK 10, LEAVE 2 |
| Hungry picks after day 10 | persist 1–5/day, all 30 days | 1 in days 11–30 |

Per-villager excess concentrated: `chantal_mukendi` merged 47 picks / 17 hungry (max 83)
vs local 33 picks / 1 hungry; `gen_0uodd0s` 12 vs 6; `gen_ousxu2z` 8 vs 2;
`pavel_dubinin` 3 vs 0. EAT satiates on both (next-pick hunger mean 39.9 vs 43.4).

Meal probe driver `meal-probe-20261110.js` wraps `villagerMealDay`.
Rows: `meal-rows-merged.json`, `meal-rows-local.json`. See "ruled out" above.

### Dawn-scorer log probe (step 5) — the mechanism

Driver `vbrain-log-probe-20261110.js` runs the panel, then dumps `Game.vbrainLogs()`
(merged tree only — `villager-brain.js` is Cursor's, merged-only).
Raw log: `vbrain-logs-merged.json` (291 entries).

- **60 of 291 picks overridden by `duty_top_score`** (43 at dawn/part 0, 12 part 1,
  3 part 2, 2 part 3). Every override changed the pick (`pick != corePick`, 60/60).
- **All 60 materialize as WATER** via `vbrainAlignObjective` (DUTY/water → WATER):
  138 lottery-WATER + 60 duty-WATER = 198, matching the kinds panel exactly.
- Override transitions (lottery pick → duty): HAVEN_CHORE→DUTY 30, VISIT→DUTY 24,
  FORAGE→DUTY 2, SEEK→DUTY 3, EXPLORE→DUTY 1. **WATER→DUTY 0** — when the lottery
  itself draws WATER (weight up to 8.5), the duty ad usually loses.
- Override rule (`vbrainScorePick`, `villager-brain.js`): best DUTY weight >= the drawn
  core lottery pick's weight wins the commitment (no RNG). Duty weights: water
  3.0 + (2 − waterDays) × 1.5 (≥5.5 when waterDays < 1); forage 2.2/3.2, cook 1.6/2.4
  when pantry low. The 80 log entries with no core pick are the gate picks
  (EAT 59, SEEK 19, LEAVE 2) — they bypass the lottery.
- **Believed waterDays: mean 0.61, range 0–1.5, < 2 on 211/211 sampled candidates.**
  The water duty ad therefore fires on essentially every dawn decision, and with
  weight ~5 it beats any light lottery draw.
- Override pickScore median 5.5 (range 3.75–6) vs non-override median 8.55 — the duty
  wins by beating the *drawn* pick's weight, not the lottery's best candidate.
- The WATER→EAT chain, merged: 38 of the 53 part-3 EATs had a dawn WATER pick the same
  day; of 152 dawn WATER picks, the next same-day pick is part-3 EAT 35×, part-2 EAT
  5×, none 112× (objective spans the rest of the day). Local shows the same chain at
  lower volume (69 dawn WATER → 8 part-3 EAT + 2 part-2 EAT).

## What this means for the landing decision

The pin failure is an **emergent behavior change from the one-brain dawn scorer**,
not a defect in the EAT gate or the pantry feeder. The duty system is doing what it
was designed to do (send people to fetch water when the cistern is low) — the cistern
is just *always* low, so it fires constantly and crowds out chores and visits.

Three options for the parent / Steve (not decided here):

1. **Accept the behavior, re-pin the band.** EAT 59 is not obviously wrong — villagers
   do eat when hungry, and the day's shape (fetch water, eat at dusk) is coherent.
   The pin band [27, 45] was set against the old lottery-only behavior.
2. **Tune the duty water weight / threshold** so the water ad does not beat light
   lottery draws on nearly every dawn (e.g. a lower cap, or requiring waterDays < 1
   before it can override a chore/visit).
3. **Look at the water economy itself.** Why does the cistern sit under 2 days' supply
   for a whole month while 198 water trips happen? If water trips replenished the
   cistern, waterDays would recover and the duty would quiet down. Whether the trips
   actually add water was not measured here — that is the open follow-up.

Note the water scarcity predates the merge and shapes the local tree too (local WATER
174 picks = 58% of all picks, and the local lottery's WATER weight uses the same
waterDays). Any fix to the cistern/water economy would move both trees.

## Artifacts (all untracked in `reconcile-forward`, `evidence/2026-11-10/`)

- `persontrust-fresh-merged.log`, `persontrust-local-alone.log` — pin re-runs
- `eat-gate-probe-20261110.js` + `eat-probe-rows-merged.json` / `eat-probe-rows-local.json`
- `meal-probe-20261110.js` + `meal-rows-merged.json` / `meal-rows-local.json`
- `vbrain-log-probe-20261110.js` + `vbrain-logs-merged.json`
- This file: `reconcile-feeder-probe.md`

## Landing path (unchanged)

After the probe decision: merge current master into the branch (NEVER rebase), regenerate
proof if manifest inputs moved, fresh gate, ff-only merge, release. Nothing was committed
to master; no merge/push/rebase/release was done; the worktree was heartbeated through
the probe.
