# Journey leg ESTABLISHMENT — r131 pre-registration (2026-11-11, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r118/r128 precedent).
Death-aware: stop after 10 consecutive all-dead daily checks; never tick a
dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261111T0045Z` (scheduled Wed 2026-11-11 00:45 CST).
Rotation read `1` (establishment); write `1→2` at closeout.
**Base:** local master `ec7335bd7` (Loop B conjurefix evidence landing; the
run started on `6769471ca` but master moved during the killed first
registration — the worktree is based on `ec7335bd7`, verified at registration).
Pre-flight deviations (LOUD, standing state): `git pull --ff-only` FAILED —
local master diverged from origin/master (ahead ~528, behind 156; same
standing state as r120–r128/r130; ship loop owns reconciliation). Proceed on
local master. Main tree clean; disk 38%.
**First registration killed by a runtime restart** (~07:36Z, SIGTERM after
~24 min; `git worktree add`'s `reset --hard` was grinding under box load
~10). No work lost — nothing had been done in the tree. Leftover branch
`journey-establishment` (at master, zero unique commits) deleted and the
partial checkout removed before re-registering.
**Lock:** created 07:04:38Z, run_id `2026-11-11T07:04:38Z`. Heartbeat loop
every 10 min once registered.
**Adoption first:** none — no dead Lane A run to close out (no stale
journey-establishment registry entry; r128 landed 2026-11-10, r129 deepening
and r130 scale landed since). This run starts clean.

## Leg question (named by r128's metric review + open items)
r128 judged dial (a) GO (moves 11/16, pace03 3) and left the standing gap:
**every move is still through preserving and butchering — cook, spotter and
builder move nobody** (foodXp totals preserver 399 / butcher 71 / rest 0).
This run IS that gap: WHY do the other three ladder tasks never move, and
can the villagers' own work teach them?

## Diagnosis (code, verified pre-run — not invented)
- Grant sites for routine work exist ONLY for `butcher` (hunt kill,
  game.js:6845) and `preserver` (rack batch, game.js:7404), both through
  `grantFoodXpCredit` (r128 dial (a): first 5 XP 1:1, then 1 XP per 2 units,
  odd unit carried). `askSpecialist` (food.js:1488, +1 per use) is the only
  other foodXp writer — player-initiated, and it requires the villager to
  ALREADY be a specialist of the task (specialistsHere filters skill > 0),
  so it is circular for self-taught cooks/builders/spotters.
- **Cook:** the `cook` assignment (game.js:7220) resolves constantly — 1410
  practice reps on the r128 BEFORE panel (16 seeds × 42d, ~2.1/seed-day) —
  doing haven cooking plus the smoke racks. ALL of its XP lands in
  `preserver` (per batch preserved); `cook` XP stays 0. The village's own
  overnight cooking never consults cook skill (`villageHasSpecialty` has no
  callers); the cook skill is consumed only via askSpecialist (player asks a
  cook to cook an item).
- **Builder:** no villager-side build work is ever assigned by the competent
  policy — `mend` resolved 0 times on the r128 BEFORE panel. `expandStorage`
  (food.js:2089) is player-only (app.js button); the builder skill's only
  effect is halving the player's storage-expansion material cost. `mend`
  (game.js:7481, "mended gear and clothing") IS assignable
  (delegateTasks lists it, haven role) and is the only build-adjacent work a
  villager can do — but the competent policy never assigns it.
- **Spotter:** SPECIALTIES comment says "future: faster ID" — the skill has
  NO effect anywhere and no work site. Plant identification runs through
  `identifyPlant` (scholar-centric). Granting spotter XP would mint skill in
  a task that does nothing: fake progress. NOT fixed here; documented as the
  remaining blank (the spotter effect itself is the next build).

## Fix (in the worktree, game.js resolveOneAssignment only)
- **Cook:** 1 `cook` XP per cook-assignment resolution via
  `grantFoodXpCredit` — the haven cooking happened whether or not any rack
  batch preserved, so the grant fires per resolution (the analog of
  butcher's 1/kill), and the r128 dial's above-rung 2:1 brake applies.
- **Mend → builder:** 1 `builder` XP per mend-assignment resolution via
  `grantFoodXpCredit`. Mending gear is the villager-side build-adjacent
  work; the skill it buys already has a real effect (storage-expansion
  discount when a builder is present).
- **Spotter:** NO grant site. Guarded by Q1e (foodXp['spotter'] must stay 0).
- **Driver:** layers `withDelegate` (scripts/policies/delegate.js) under
  `withHuntStaff`, so mend is actually assigned (crafters → mend; fit-first
  occupation matching; skips villagers who already have an assignment, so
  hunt staffing is not clobbered). SAME driver on BOTH panels, so the
  before/after comparison stays valid.
- askSpecialist (+1) and the rung (5/15/30) UNCHANGED. No threshold, bar,
  price, or gate change (gating freeze 2026-10-27 stands).

## Pilot finding + dial revision (written BEFORE the full panel)
The 4-seed pilot (2301–2304) proved the mechanism and broke the pace:
cook resolutions grant cook XP on 4/4 seeds (580 grants) and cook moves
land on 4/4 — but FIVE villagers reach cook skill 3 from 0 in 42 days
(Nikolai 36 XP, Vyacheslav 48, Molly 41, Greta 68, Elif 69), pace03
cook+builder = 5 on 4 seeds against a ≤4/16 bar. Root cause: a cook
resolves ~3x/day and the per-resolution grant pays every time, so the
most dedicated cook banks 30 XP in ~28 days — faster than the ladder's
"mastery takes a full season" (r116). The preserver/butcher grants are
naturally throttled (batches only when surplus spoils; kills are rare);
cook/mend resolutions are not.
**Revision (the per-day cap — the dial r128's metric review named for
pace03 → 0–1):** the cook/builder grant fires only on the FIRST
resolution of that task per villager per day (tracked on the person
record, `foodXpDay[task]`). A daily cook still reaches skill 1 in 5 days
and skill 2 in ~25; skill 3 needs ~55 days, so it cannot race inside the
42-day leg (max ~23 XP) — pace03 for the new tasks is 0 by construction
and the panel judges the moves, not the race. The 2nd/3rd resolutions
still count for practice/competence (villagerPractice records every rep);
only the SPECIALIST XP is capped — the fiction is that the first meal of
the day teaches you and the rest is routine. The bars are UNCHANGED (this
is a mechanism revision at pilot stage, not a mid-run re-score); the
BEFORE panel (fix off) is unaffected and is not re-run. The pilot is
re-run with the revised dial before the full panel.

## Bars (binding, §14 — no mid-run re-scoring)
- Q1a COOK MOVES (16 seeds, AFTER panel): GO iff seeds with a cook
  spec-task cell 0 at d1 → positive at dEnd ≥4/16.
- Q1b BUILDER MOVES (AFTER): ≥2/16 (mend is rarer — only crafter
  occupations get it).
- Q1c NO NEW RACING: pace03 for cook+builder combined (spec 0 at d1 → 3
  at dEnd) ≤4/16. pace03 ≥5 is a NO-GO: the per-resolution grant races;
  the next dial is named in metric review (per-day cap or per-batch-only
  cook credit), never re-scored here.
- Q1d NO REGRESSION: preserver/butcher moves ≥8/16 on AFTER (r128: 11/16).
- Q1e SPOTTER GUARD: foodXp['spotter'] total = 0 on the AFTER panel.
- BEFORE-VALIDITY (binding): the BEFORE panel must show cook moves = 0
  AND cook practice reps > 0 on ≥12/16 seeds — the work happens and the XP
  doesn't. If BEFORE already shows cook moves, the diagnosis is wrong and
  the run is UNTESTED on the fix (fix stays unproven; panel reported, not
  GO).
- Q2 INVITATIONS: (a) GAME OFFER — every invitation-owned menu on the
  panel offers betrayal:accept + betrayal:decline (any menu missing either
  is a game defect, fix in run). (b) DRIVER ANSWER — ≥80% of offered
  invitations answered (accept or decline; silence is the miss). Accept
  rate reported, not barred. If 0 invitations are offered, Q2 is no-data —
  report, do not pass or fail.
- Q3 NULL LINES: 0 literal THEM: (null) lines across the panel convo files.
- M3 survival-42 ≥12/16; M4 0 starvation deaths ≥12/16 (r116 bars carried
  at full scale).

## Seeds, policy, horizon
Seeds: **fresh band 2301–2316** (see freshness below). Policy:
competent + withDelegate + HUNTSTAFF=2. Horizon 42d. BEFORE/AFTER pair on
the SAME band (§15 balanced panel): BEFORE driver on current master (fix
off), AFTER driver on the fixed tree (fix on).
Driver: `scripts/journey-establishment-r131-20261111.js` (r128 driver clone
— tag rename + seed band + withDelegate layer; the dEnd foodXp fallback
stays).
Analyzer: `scripts/analyze-journey-establishment-r131-20261111.py`
(r128 analyzer clone + cook/builder moves, pace03 for the new tasks,
spotter guard, mend-resolution count).
Proof test: `scripts/test-journey-establishment-r131-cook-builder.js`
(proves the grants end to end on the live game: cook resolution → +1 cook
XP through the dial; mend resolution → +1 builder XP; preserver grant
unchanged; tend/teach grant nothing; spotter grants nothing on forage;
det-gate: same driver fix-off vs fix-on, 5d seed 2301 — funnel keys and
practice snapshots identical except foodXp cook/builder deltas).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 2301–2316**, verified fresh across ALL dated preregs:
  seed-context grep (`seed…23(0[1-9]|1[0-6])`, `band…23xx`) over
  `evidence/*/sim-*-prereg.md`, `evidence/*/journey-*-prereg.md` and
  `evidence/2026-11-1*/*.md` returns **0 seed namings**. The only `2301` /
  `2302` / `2316` hits repo-wide are substring collisions (`42301–42304`
  in journey-social-life-r167-prereg.md; line numbers `game.js:2311`,
  `contests.js:2306`; kcal values `2310`) and data values inside old JSON
  corpora — no `"seed": 2301` / `seed: 2301` / `seed 2301` value exists
  anywhere under evidence/.
- No corpus files for these seeds exist.
- Contaminated bands NOT reused: 1502, 1504, 1603, 1604, 17101–17112
  (r112–r116 matched reuse); 1142–1151 (r121 landing); 1801–1804 (r117
  pilot); 1901–1916 (r118 panel); 2001–2010 (landing r107–r115 bands);
  2101–2116 (r127 panel); 2201–2216 (r128 panel); 100001–100008 (r129
  deepening).

## Canon
docs/CANON.md + docs/PRESERVATION.md read at run start (this run).
PRESERVATION.md covers the smoking ladder (16 ticks, 0.95x known / 0.80x
blind, 30d shelf) and the no-creation rules — the fix touches only the
PRACTICE CREDIT a cook/mend resolution awards, not yields, shelf, or time,
so no canon rule is moved. No canon doc covers the specialist ladder's
grant rate — Q1 rests on code (`src/js/food.js` SPECIALTIES + rung 5/15/30;
`src/js/game.js` resolveOneAssignment grant sites) + panel, not invented
canon. docs/DIRECTIVES.md re-read (hard rule). No gate/price/threshold
change.

## People check
Read the held convos from the panel in full (same method as
r114–r118/r127/r128). Standing watch: the r128 people-check items —
taken-kin pod-dream closing sentence (12× in three wordings);
"eighty-one... boring" beat (3×); aunt-Rachel screen-door (2×, same kin
name); "Something in them almost softens — then doesn't. Not yet." (5×);
"They hear the warmth in it. They're not ready to let it in." (9×);
deflect pivot "Sorry — I shouldn't load that on you. What's up?" (4×);
favour-requirements line "Move next to them, on the same side of the Haven
door, to help." (9×); trust answer (1×); System party-name pool (MEAT AND
FRIENDS suggested 2×, APEX SNACKS 1×); quiet-place walk outcome (6×);
stockpile outcome (4×); night-thread cluster (4×); gossip verbatim repeat
(Devon, 2211). Note whether they recur; a fix is out of this run's prereg
scope unless the mechanism turns out to be the grant path (it is not — the
fix touches XP credit only).

## Gating freeze (2026-10-27 16:53) stands
No threshold, bar, price, or gate change in this run. Perception law
(2026-10-28) stands — all instruments read-only; pickers press offered
menu items only. The invite-answer rule reads the live trust map only.

## Pilot gate
4 seeds first (2301–2304), BOTH drivers, 42d. The pilot validates (a)
seeds run on both drivers; (b) practice snapshots present in census JSON
(d1/d14/d28/dEnd, non-null competence maps, specialist fields present, dEnd
foodXp fallback reading live values); (c) the BEFORE pilot shows the gap
(cook practice > 0, cook moves 0); (d) the AFTER pilot shows cook XP > 0 on
≥2/4 seeds AND mend resolutions > 0 on ≥1/4 (delegate composing); (e)
convo files written (4 held convos per driver); (f) the invite rule fires
at least once OR 0 invitations offered (either is a valid pilot outcome —
the rule is exercised by the proof test regardless). If the pilot shows 0
cook work or 0 mend resolutions, document and stop — do not burn a full
panel on a dead question. On pilot GO, run seeds 2305–2316 the same way on
both drivers.

## Telemetry
The live baseline is the r128 BEFORE panel (competent + HUNTSTAFF=2, NO
delegate layer). This run's driver ADDS withDelegate, so the regime changes
and LOUD lines on guardrails are EXPECTED. Adjudicate every LOUD line as
driver-change vs real bug BEFORE rolling the baseline forward; re-seed the
baseline to the r131 BEFORE panel only after adjudication. Run the
telemetry check at closeout.

## Measurement-proof refresh (owed)
r129 noted the measurement proof is stale after its src/js landing, and the
refresh is owed before any further src/js landing. This run lands src/js
(game.js grant sites) — attempt the refresh
(`scripts/balance-proof-update.js`) at closeout; if it cannot complete in
this run, report it as still owed with the reason, do not silently deepen
the debt.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
