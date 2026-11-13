# Journey leg ESTABLISHMENT — r135 pre-registration (2026-11-13, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r118/r128/r131/r132/
r133/r134 precedent). Death-aware: stop after 10 consecutive all-dead daily checks;
never tick a dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261113T1045Z` (scheduled Fri 2026-11-13 04:45 CST).
Rotation read `1` (establishment); write `1→2` at closeout.
**Base:** local master `5e779a1b5` (sim-auditfix-b tip).
Pre-flight deviations (LOUD):
- **Stale-lock recovery.** Lock held by run `2026-11-13T07:44:52Z` (landing
  r129), 2h59m old. Registry entry exists (`journey-landing`,
  run `2026-11-13T07:45:27+00:00`) but its heartbeat is
  `2026-11-13T10:27:03+00:00` — 17 min stale at check — and its last
  file write (`journey-landing-r129.md`) is 19 min old, with no running
  node/jest process. Per the overlap guard the previous run is DEAD no
  matter how fresh the lock looked. Lock deleted, proceeded. The r129
  run itself COMPLETED its work and COMMITTED it (`6b99d6a90`, gate
  NO-GO — person-trust FORAGE 1 vs 2, merge blocked by design); its
  branch and worktree are preserved unmerged for the trust-panel-bar
  decision, exactly as the r129 run note leaves them. Nothing held to
  adopt: the work is safely committed on its own branch. This run does
  NOT touch `journey-landing`, its branch, or its worktree.
- Main tree clean; disk 39%. Registration took ~148s (slow host;
  registry-lock queue behind a sibling reaper). Heartbeat loop runs
  from the goal hidden_files dir (not /tmp, r128 lesson), 10-min
  cadence, PID 63797 at run start.
- **Index note (not a repair):** a `git status --short` taken in the
  fresh worktree DURING registration showed 3 files staged-as-deleted
  (`.nojekyll`, `.proofrefresh-b2-panel.log`, `.vercelignore`). Targeted
  check after registration: index entries exist (stage 0, correct
  blobs), worktree hashes match HEAD blobs byte-for-byte, single-path
  status clean. The `D` lines were a transient read mid-checkout, not
  the index-clobber class. No repair made; full status re-verified at
  commit time.
- Registry purpose label reads "establishment r130" (a typo at
  registration — the run is r135, next after r134). Cosmetic only;
  recorded here, not repaired mid-run.

## Leg questions (named by r134's metric review — both of them)

**Q1 (primary — RUNG-2 VISIBILITY).** r134 diagnosed the ladder stall
as RUNG-MATH: work continues at ~83% rate while first crossings
collapse (NEW 4/34) because the regular workers all crossed rung 1 by
d28. The open question: **does anyone reach rung 2 inside 42 days,
and how close is the nearest cohort?** This run DIAGNOSES it from the
committed r134-after panel data (no new sims for Q1). No game-code
fix from Q1 in this run (pre-registered): whether rung 2 belongs
inside 42 days is a Steve design question; this run attaches the
numbers to it.

Rung math, pinned from code (`src/js/food.js` `specialistSkill` +
`src/js/game.js` `grantFoodXpCredit`): self-taught rung 1 at foodXp
≥5, rung 2 at ≥15, rung 3 at ≥30 (occupation holders get +1 at 5 XP,
cap 3). Above 5 XP, XP accrues 2:1 — so rung 2 needs 25 granting
units from 0, rung 3 needs 55. A 42-day leg at ~1 granting
resolution/worker/day can barely reach rung 2 and cannot reach rung 3.

**Q2 (people-check dial — THE FIELD ASK FIRES DRY).** r134: the field
ask ("Teach me something from the wild.") ends in the closer
"There's more, but that's for another fire." **12×** on the r134-after
panel (8 seeds; 3× to one beekeeper). Panel recount, verified from the
r134-after transcripts before this prereg: 19 field asks → 12 closers
(all that one line — the first closer tried wins every fresh sitting)
and 7 lessons (2 plant, 5 place). The expedition ask is healthy: 8
asks → 0 closers, left untouched.
Mechanism (read from code, `src/js/villager-agency.js`): `agencyChoices`
offers the field ask whenever `npcFieldLessons` is non-empty — it
counts stale entries (teachable-plant entries whose plants the player
already knows; fought species already observed/slain in the codex).
The teach block (monster > plant > place > generic `monsters>=2`
fallback) then finds nothing to teach and the closer pool fires, first
tried "There's more". Side effect: `agencyTeachPlant` burns a
teachable entry (`t.shift()`) even when no untaught plant exists, so
a dry ask also spends a lesson that never lands.
Fix shape (this run): gate the field ask on actually-teachable-now —
a new `agencyFieldTeachable(vid)` mirroring the teach block's own
conditions (teachable monsters > 0, OR teachable plants > 0 AND an
untaught plant exists in the data pool, OR places > 0, OR monsters
≥ 2). When none holds, the field ask is not offered; the villager's
other choices stand. The expedition ask is untouched. The closer pool
is untouched (residual safety net). Menu-offer change in conversation
→ `[needs-eyes]` in the commit message.

## Q1 diagnosis (binding, §14 — no mid-run re-scoring)
Instrument: the r134 AFTER panel JSONs (16 seeds, 2501–2516, committed
in `evidence/2026-11-12/journey-establishment-r134-after-seed*.json`),
practice snapshots (foodXp + specialist per villager at d1/d14/d28/dEnd).
Per specialty s in {butcher, cook, preserver, builder} and window w in
{d1–14, d14–28, d28–dEnd}:
- R2X[s][w] = villagers crossing spec 1→2 in the window (spec from the
  snapshot; foodXp 15-crossing reported alongside).
- R3X[s][w] = villagers crossing spec 2→3 in the window (foodXp 30).
- XP/worker: foodXp gained per worker in the window (median, max, n).
- NEAR-MISS-2 pool: villagers at 5–14 foodXp[s] at d28 who end <15.
Verdict rules:
- **R2-REACHABLE** iff ≥1 spec-2 crossing panel-wide (rung 2 IS reached
  inside the leg; report how often and on which specialty).
- **R2-BEYOND-LEG** iff 0 spec-2 crossings: report the nearest foodXp
  to 15 at dEnd per specialty and the granting-days math (25 units
  for rung 2 from 0 at 2:1 dilution).
- **R3** reported descriptively (expected 0 crossings; the 55-unit math
  already rules it out — a crossing would overturn the math and must
  be investigated, not celebrated).
Before/after note: Q1 is a pure diagnostic on committed data; no
before/after panel. The r134 BEFORE panel is not re-read (the stall
shape was already established there).

## Q2 bars (binding, §14 — no mid-run re-scoring)
BEFORE corpus: fresh panel `r135-before` (fix OFF, current master,
band 2601–2616, 16 seeds, same driver/policy as r134).
AFTER: `r135-after` (fix ON, same band/seeds/policy).
Driver: `scripts/journey-establishment-r135-20261113.js` (r134 driver
clone — tag rename + Q2 closer/lesson counters in the analyzer only;
the driver itself is unchanged apart from tag/band).
Analyzer: `scripts/analyze-journey-establishment-r135-20261113.py`
(r134 analyzer clone + Q1 rung diagnostic + Q2 closer/lesson counters).
- Q2a CLOSER COUNT: "There's more, but that's for another fire."
  occurrences on AFTER = **0** (BEFORE is expected ~12 on the same
  band shape; the gate removes the only path that produced it on this
  driver — expedition asks produced 0 closers on BEFORE and are
  untouched).
- Q2b NO LESSON HIDDEN: field-ask lessons (monster + plant + place
  lines) taught on AFTER ≥ BEFORE − 1 (the gate must not hide a real
  lesson; the dry asks taught nothing, so lessons are conserved).
- Q2c ASK→LESSON RATE: every field ask picked on AFTER ends in a
  lesson (ask→closer rate 0%).
- Q2d GUARDS CARRIED (r134 Q2d + M3/M4): invitations answered ≥80%;
  null lines = 0; M3 survival-42 ≥12/16; M4 0 starvation deaths
  ≥12/16.
- Q2e SPOTTER GUARD: foodXp['spotter'] total = 0 on the AFTER panel
  (r134 Q2e carried).

## Seeds, policy, horizon
Q1: no new seeds — r134 AFTER panel (2501–2516).
Q2: **band 2601–2616, FRESH** (see freshness below). Policy:
competent + withDelegate + HUNTSTAFF=2. Horizon 42d.
Proof test: `scripts/test-journey-establishment-r135-fieldgate.js`
(dry villager → no field ask offered, teachable entries unburned;
teachable-monster villager → ask offered and teaches; places villager
→ ask offered and teaches; monsters≥2 all-learned villager → ask
offered, generic line; expedition-news villager → expedition ask
still offered, field ask gated independently; det-gate: r135 driver
twice, 5d seed 2601, byte-identical outputs).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 2601–2616 is FRESH.** Full search before this prereg:
  substring grep for `2601`/`2616` over `evidence/**/*.md` (many hits,
  all 5-digit bands: succession 26011–26015/26021–26025/26031–26035/
  26051–26055, sim 62601/62701, deepening 92601–92604); word-boundary
  grep `260[1-9]([^0-9]|$)|261[0-6]([^0-9]|$)` over
  `evidence/**/*prereg.md` (only 5-digit tails: 62601, 92601 — no
  4-digit 2601–2616 seed named anywhere); `2616` in preregs: 0 hits.
  The r134 prereg names "next unused: 2601+" as a suggestion, not a
  use. No prereg, forbidden list, contaminated list, screen, or
  extension band names 2601–2616 as seeds.
- Contaminated bands NOT reused for new questions (r134 list carried):
  1502, 1504, 1603, 1604, 17101–17112, 1142–1151, 1801–1804, 1901–1916,
  2001–2010, 2101–2116, 2201–2216, 2301–2316, 2401–2416, 100001–100008,
  1200–1209, 2501–2516 (matched reuse only, r133/r134 — NOT reused here).

## Canon
docs/CANON.md + docs/CONVERSATIONS.md + docs/DIRECTIVES.md read at run
start. CONVERSATIONS.md: "A genuine queued beat can offer 'Go on'; an
exhausted topic offers a pivot or exit, rather than filler choices" —
the field ask with nothing to teach is an exhausted topic, so the
menu must not offer it. The gate changes no numbers, no prices, no
thresholds. Gating freeze (2026-10-27) stands. Perception law
(2026-10-28) stands — all instruments read-only; pickers press offered
menu items only. The rung math is read from code (food.js/game.js),
not invented — no canon doc covers specialist rungs; the diagnostic
reports the code's numbers.

## People check
Read the AFTER convos from the Q2 panel in full (same method as
r114–r118/r127/r128/r131/r132/r133/r134). Standing watch (r134 items):
deflect pivot "Sorry — I shouldn't load that on you. What's up?" (6×,
rising); field-teaching closer "Remember the leaf, the stem, the
smell" variants (1×); "Take it for what it's worth." gossip closer
(2×); taken-kin pod-dream closing (2×); accept-then-back-out (0× —
confirm it stays gone); stitched fragments (0×); recap stutter (0×).
New: the "control group" theory recited verbatim by two villagers
(r134); Priya's "A beat. Then, as if shaking something off:" colon
with no continuation (r134). Note whether they recur. The spotter
blank stands from r131/r133/r134 (a villager can stare at the wild
all day and learn nothing).

## Pilot gate
Q2 BEFORE pilot, 4 seeds first (2601–2604), fix OFF, 42d. The pilot
validates (a) the driver runs and convo files are written; (b) the
closer fires ≥1 per seed on average on the pilot (the question is
live — if 0, the question is UNTESTED on this band: report, do not
burn a full panel); (c) no trajectory breakage vs r134's panel shape
(deaths/pantry within a few). On pilot GO, run the BEFORE full panel
(2605–2616) on the unfixed tree, THEN implement the fix + proof test,
THEN the AFTER pilot (2601–2604, fixed tree) and AFTER full panel
(2605–2616). No stash is used for the fix-off runs (shared-repo stash
collision lesson): the BEFORE panel runs before the fix exists, so no
file juggling is needed at all.
Q1 has no pilot — it reads committed data; if a field the diagnostic
needs is missing from the JSONs, the diagnostic reports that field as
unavailable and leans on the snap-derived measures.

## Telemetry
The live baseline is the r132 BEFORE panel (competent + withDelegate +
HUNTSTAFF=2, seeds 2401–2416), rolled forward at r132 closeout; r133
and r134 did NOT roll forward. This run's Q2 panel is the SAME regime
on the fresh band 2601–2616 — guardrails should stay quiet; any LOUD
line is adjudicated as band noise vs real bug BEFORE rolling the
baseline forward. Run the telemetry check at closeout.

## Measurement-proof refresh (owed)
Still owed since r129. `scripts/balance-proof-update.js` takes a
retained real observer-neutral panel as its argument — it validates and
installs one, it does not generate one — and no fresh retained panel
exists yet. This run lands src/js (villager-agency.js lines only) —
attempt the refresh at closeout if a retained panel exists; if none
exists, report it as still owed with the reason, do not silently
deepen the debt, and do not run a competing panel in this lane.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
