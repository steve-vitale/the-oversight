# Journey leg ESTABLISHMENT — r210 pre-registration (2026-11-15, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139 precedent). Death-aware: stop after 10 consecutive all-dead
daily checks; never tick a dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261115T0045CST` (scheduled Sun 2026-11-15 00:45
CST; lock `2026-11-15T07:22:15Z`). Rotation read `1` (establishment);
write `1→2` at closeout. **Rotation note:** the file reading 1 looked
stale at first (r139's adoption note said rotation stays 2, deepening
next) — checked the sequence and it is legitimate, not a clobber:
r193 deepening advanced 2→3, r206 scale advanced 3→0, r135 landing
advanced 0→1. Establishment is the correct next leg.
**Base:** local master `8b77f0f40` (sim-winnability-round-0621
coordinator evidence; successorcaution-b PILOT-NO-GO + proof refresh
round 20 GO). Registration base was `287f740ac` (proofrefresh-b20
closeout); master moved during the ~3 min registration, so the branch
was rebased onto `8b77f0f40` before any work. Master delta vs
`3904f2b8f` (r135 tip) is evidence + scripts only — no src/js change,
so the game under test is the r139 game plus the proof-refresh
re-point. `git pull` already up to date at run start. No push (ship
loop owns pushes).
Pre-flight deviations (LOUD):
- **No lock present at run start** — no stale-lock recovery needed.
  (The r135 landing closeout was still finishing when this run
  started — heartbeat fresh 06:55:56Z — but its lock was already
  deleted and its branch merged; no conflict: different slug,
  different leg.)
- **Reaper ran clean** (~25s): nothing removed; 13/16 active, all
  LOUD lines the standing dirty-tree holds.
- **Worktree registration queued ~2.7 min** on the registry lock
  (sibling registrations) — normal contention, not a wedge.
- Heartbeat landed immediately after registration (07:35:27Z);
  10-min heartbeat loop running (PID 48903, exact-PID kill at
  closeout).

## Leg question (r139's fix, now in the wild — verification panel)

**Q1 — SPOTTER IN THE WILD.** r139 landed the spotter wiring
(forage + bumpPlantFamiliarity grant 1 spotter XP/day; spotter ≥ 1
drops the recognition threshold by 1, floor 1). This run is the
first establishment panel on the post-r139 master: does the grant
still fire everywhere, does the ladder still climb, does the
faster-ID benefit still fire — with no src/js change in between?
This is a VERIFICATION panel, not a build: no fix is planned. If a
bar fails, the run reports the miss honestly and the fix (if any) is
a separate, pre-registered job.

## Bars (binding, §14 — no mid-run re-scoring)
Driver: `scripts/journey-establishment-r210-20261115.js` (r139 driver
clone — identical instruments; only run tag, EVID default
2026-11-15, and default seed changed). Analyzer:
`scripts/analyze-journey-establishment-r210-20261115.js` (r139
analyzer clone + pod-dream-open needle, see Q2). Bars identical to
r139:
- **SPOTTER BAR (primary):** GO = panel total foodXp['spotter']
  ≥ 10 AND every panel seed contributes > 0. NO-GO = any panel seed
  with 0 spotter XP total, or panel total < 10. (r139 panel: 52
  total, every seed > 0.)
- **LADDER BAR (secondary):** GO = ≥1 villager reaches 5 XP
  (skill 1, first ladder rung) on ≥3/4 panel seeds. (r139: 4/4.)
- **FASTER-ID BAR (secondary):** GO = the threshold benefit fires
  on ≥2/4 panel seeds. NO-OPPORTUNITY = the scholar handles no
  plants on a seed (proof test carries the mechanism, staged).
  (r139: 130 benefit plays / 184 bump calls, 4/4 seeds.)
- **END BAR (carried, r85/r136/r137/r138/r139 shape + bearer-change
  excuse):** GO = every broken-live forage run that (a) broke ≥ 2
  days before the run's end, (b) bearer <redacted> the player, (c) the
  ending status was ready on at least one dawn after breaking, is
  closed by the wedge within 2 dawns of breaking. NO-GO = any such
  run left live past that window, with each failure attributed.
  Bearer-change excuse stands. NO-OPPORTUNITY = zero broken-live
  forage runs across the panel.
- **STRANDED BAR (carried watch):** previous-bearer <redacted> runs
  are recorded in strandedLog with 0 work performed on them (r138
  mechanism). NO-OPPORTUNITY = zero such runs.
- **TRAVEL BRANCH (carried watch):** homeward sits hitting a
  clearable blockage reach home the same dawn. NO-OPPORTUNITY =
  zero such sits.
- **THREAD BRANCH (carried watch):** paged (Yara-shape) end
  opportunities closed within 2 dawns.
- **TRUST GUARD (hard, DROP-ONLY, carried):** trust[vid] must not
  drop across any end press. Any drop = defect finding, wedge stops
  ending for the rest of that seed, END BAR NO-GO for that seed.
- **JAM BAR (report-only):** jam-days = dawns on which a promised
  (not yet live) run existed while a broken-live run was live.
  (r139 panel: 0.)
- **VILLAGE BAR (r85 carried):** alive at d40 on ≥3/4 panel seeds.
  (r139: 4/4.)
- **PEOPLE CHECK:** PASS/FAIL on 2 held convos from one panel seed,
  read in full (meaning, coherence, consequence — not counts).
- **WATER INSTRUMENT (report-only):** count of broken-live water
  runs seen across the panel (r139: 0).

## Q2 (report-only — canned-line variety watch, widened needle + pod-dream opening)
Count verbatim repeats of the standing-watch lines across the
panel's AFTER transcripts: taken-kin pod-dream closing (r135: 4×,
r136: 0, r137: 0, r138: 0, r139: 0), recap stitch "X — Still on Y"
(r135: 5×, r136: 1, r137: 0, r138: 0, r139: 0 verbatim), recap
paraphrase /still (on|where we are)/ (r139: 1 — Mateo's "that's
still where we are", 5005), slope-reading lesson (r135: 4×, r136: 0,
r137: 1, r138: 0, r139: 0), "Walked in like they'd never left."
(r135: 5×, r136: 0, r137: 0, r138: 0, r139: 1), "Take it for what
it's worth." (r135: 3×, r136: 0, r137: 0, r138: 0, r139: 0),
stew-bowl line (r135/r136/r137/r138/r139: 0/1/0/0/0).
**NEW this run (r139 metric review):** the pod-dream needle counts
a closing formulation only, so Darnell's 5005 sitting — which OPENS
on the pods ("rows of pods. Humming.") — scored 0. The analyzer
now also counts `pod-dream-open`: sittings whose OPENING line
contains 'rows of pods'. Report-only; no fix in this run — counts
feed the next run's question.

## Q3 — census (plain words)
Five villages played (pilot + 4-seed panel): who lived, who died,
what they knew, what was missing — in plain words.

## Q4 — people check (full transcripts read): PASS/FAIL
Two panel-seed sittings read in full. People with wants,
consequences, and specific memories; no fabricated shared history,
no filler loops.

## Seeds, policy, horizon
Pilot: **5501** (band check complete — FRESH, see below). Panel:
**5502–5505**, 42d horizon. Policy: competent (r85/r136/r137/r138/
r139 driver shape — no withDelegate/HUNTSTAFF flags). Death-aware
tail +10d. Proof test: the r139 spotter proof test
(`scripts/test-journey-establishment-r139-spotter.js`, 35/35) is
re-run in this worktree to confirm the mechanism still holds on the
new base; no new proof test unless a defect is found.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 5501–5505 is FRESH.** Pilot 5501, panel 5502–5505.
  Evidence-wide prereg grep for standalone 5501–5505: zero hits.
  Evidence .md grep for 550x: one hit only — the decimal "5.9102"
  in `evidence/2026-10-17/panel-grieftrib-compare.md` (a rate, not
  a seed). Scripts seed-context grep: only 85501–85504 / 135501–
  135504 (different bands). No forbidden-list hit. Checked
  2026-11-15 ~07:40Z.
- Rejected bands (this run): 5101–5105 — seeds 5101–5108 used in
  sim-leanwinter-b (2026-10-17, `sim-leanwinter-b.md`: "8 FRESH
  seeds 5101–5108"). 5201–5205 — seeds 5201–5208 used in
  sim-seatblow (2026-10-17, `sim-seatblow.md`). 5301–5305 — seeds
  5301–5304 used in journey-deepening r78 (2026-10-31,
  `journey-deepening-r78.md`). 5401–5405 — seeds 5401–5404 used
  in journey-social r58 + 5403–5410 in detgate-retagrot
  (scripts/detgate-retagrot-b.js).
- Contaminated bands NOT reused for new questions (r139 list
  carried): 1502, 1504, 1603, 1604, 17101–17112, 1142–1151,
  1801–1804, 1901–1916, 2001–2010, 2101–2116, 2201–2216,
  2301–2316, 2401–2416, 100001–100008, 1200–1209, 2501–2516,
  2601–2616, 2701–2705, 2801–2805, 2901–2905, 3001–3005,
  3101–3105, 3201–3205, 5001–5005 (r139), plus 5101–5105,
  5201–5205, 5301–5305, 5401–5405 (this run's rejections).

## Canon
docs/CANON.md read at run start. KNOWLEDGE.md laws binding the
spotter question: "Human skills ≠ alien abilities" (spotter is
earthly knowledge — practice earns it, never a System slot);
"identification happens BACK AT CAMP" (the r139 fix touches only
the recognition threshold, never names a plant in the field).
**No canon doc covers the spotter specialty itself** (the food.js
"(future: faster ID)" comment is the only statement) — same as r139,
said here instead of inventing canon. ENCOUNTER-GEAR RULE (Steve
2026-11-13): the journey driver plays the live village state (real
gear/progression, competent policy), not a staged solo-scholar
fixture — same as r137/r138/r139; the proof test stages for the
mechanism only, not a combat fixture.

## Context arriving mid-run (not this run's scope)
Steve RULED 2026-11-13 18:00 CST on the medicine holder-less lever:
ALL FOUR levers — (a) scholar fetches medicine, (b) traveling
healer visits, (c) any villager can search for medicine once
taught, (d) level-ups offer healing abilities with more incentive.
Build brief: goal
hidden_files/medicine-holderless-levers-brief-2026-11-13.md. This
run does NOT take that build — it belongs to a dedicated arm
(build-medicduty-h, live in the tree list) — but the panel's
wound-fever/healer numbers are relevant context and are reported.
Standing design question for Steve also stands, unchanged: should
the game release a dead bearer's outing on succession, or should it
linger in the successor's ledger forever? (r138 diagnosis.)
The r129 terrain-pocket bar is ANSWERED (r135 landing: fix merged,
bar re-baselined) — no longer carried as open. Still open: gating
recalibration proposal, answercourt cost, richer medicine design,
reaper restructure nod.

## Pilot gate
Pilot seed runs first on the final driver; completes without crash
AND spotter instruments fire (≥1 bumpPlantFamiliarity wrap record
AND ≥1 villager forage resolution observed) AND the wedge closes
any broken-live run it meets. If the pilot forces a driver or fix
change, the panel restarts on fresh seeds and the pilot seed is NOT
scored.

## Telemetry
Live baseline is the r132 BEFORE panel (competent + withDelegate +
HUNTSTAFF=2, seeds 2401–2416); r133–r139 did NOT roll forward. This
run's panel is the r85/r136/r137/r138/r139 driver regime on a fresh
band — guardrails should stay quiet; any LOUD line is adjudicated
as band noise vs real bug BEFORE rolling the baseline forward.
Metrics: guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths (r135's set). The r139
checker runs hit the known schema mismatch (the driver never emits
`guardrails.*` fields, so the checker reads missing paths as 0) —
expected again, not a finding. NOTE: this run changes NO src/js,
so a guardrail move cannot be caused by this run's code — any LOUD
line gets adjudicated as band noise vs a pre-existing drift, and
the baseline is NOT rolled on a mismatch.
