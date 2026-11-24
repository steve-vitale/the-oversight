# Journey leg ESTABLISHMENT — r285 run note (2026-11-24, Lane A)

## Run
Run id `playtest-loop-a-20261124T1737Z` (scheduled Tue 2026-11-24 10:45 CST).
Leg 1 establishment, days 14–40 window, 42-day horizon. Rotation file read
**1 (establishment)**. **Base:** local master `66f41f420` at registration
(landing r284 closeout). Pre-flight: main tree CLEAN, disk 50%.
`git pull` — already up to date. Lock created 17:37:41Z before any work.
Heartbeat loop running (10-min cadence, detached setsid, pid 6915).
Registration took ~9 min (git worktree add slow under I/O load, no flap
error); REGISTER_EXIT:0, heartbeat landed.
Prereg: `hidden_files/evidence/2026-11-24/journey-establishment-r285-prereg.md`
(frozen before the pilot; seed-band freshness check recorded there).

## Panel
**FRESH band 109041–109048** (pilot 109041, then 109042–109048), same
competent policy, 42d horizon, death-aware tail +10d. Driver clone verbatim
r280 except run number / output names / header / seed band; analyzer clone
verbatim r280 except run number / file names / comparison strings (Q4 bar
now vs the r274+r277+r280 pooled means; stranded-close now SIXTH band;
r280 values added to every comparison line). Single panel on the current
base — the r280 menu-priority fix is already in master, so no BEFORE/AFTER
split; the fix is re-verified by the Q1 bar on the fresh band.
Pilot 109041 finished in <30s, no instrument errors; panel 7 seeds ran
~2 min total. Analyzer exit 0, 558 lines. Determinism: seed 109041
replayed after the panel — **byte-identical**.

Panel summary (per-seed): all 8 villages alive at d40 (aliveAt40 8–12);
waves 3–4; standing 70–160; deaths 35–65/seed (panel 374); pantryEnd
5,710–64,940 kcal; 0 jam-days; 0 broken-water dawns; 0 stranded runs.

## Verdicts (frozen bars)

- **Q1 STRANDED-CLOSE, SIXTH BAND: NO-OPPORTUNITY.** 0 stranded runs on
  the panel (0 stranded dawns). The r280 fix holds on its second fresh
  band with the fix in master. Stranding rate across six bands: r265 0,
  r271 0, r274 1, r277 1 (NO-GO pre-fix), r280 0, r285 0.
- **Q2 MOOT-CLOSE: NO-OPPORTUNITY.** 0 evictions of live favor runs, 0
  moot-close rows. Sixth straight band with 0; mechanism still carried
  by the r269 proof test (36/36).
- **Q3 SILENT-ARRIVAL: GO.** 2 arrivals, 1 NARRATED-BY-NAME + 1
  NARRATED-DESCRIPTIVE, 0 SILENT.
- **Q4 GUARDRAILS: GO — ROLL CONDITION MET.** Per-seed means vs the
  r274+r277+r280 pooled means: deaths 46.8 vs 48.8 (−4.1%), popAlive 9.4
  vs 9.3 (+1.1%), pantryKcal 33,150 vs 37,474 (−11.5%), starvationDeaths
  0 vs 0 — all within ±30%. Baseline rolled forward to the
  r274+r277+r280+r285 pooled 32-seed sums (deaths 1546, popAlive 298,
  pantryKcal 1,164,586, starvationDeaths 0); pre-r285 file preserved as
  `establishment.json.20261124-pre-r285.bak`.
- **Q5 SPOTTER: BAR MISS on the frozen end-holding bar.** Panel total 87
  (bar ≥20 ✓) but end-holding >0 on only 7/8 seeds — seed 109046 ends at
  0. The miss is a turnover artifact, not missing knowledge: Carlos held
  11 spotter XP and died d44; his successor Roberto held 0 at end.
  Cumulative (tenure-summed) spotter is 121 panel-wide and >0 on 8/8
  seeds (109046 cumulative 11). Per §14 the bar is NOT re-scored
  mid-run; the miss stands and the revision is proposed below (metric
  review). LADDER 7/8 — GO. FASTER-ID 8/8 (218 benefit plays in 304
  bump calls, 72%) — GO.
- **Q6 SCHOLAR DEATHS: 4 — WATCH (bar ≤4).** Miles d25 (the wild),
  Carlos d44 (the wild), Vito d11 (sickness), Frank d27 (the arena).
  No unnamed-cause ("the night") deaths — all four causes named. The
  (4,4) last-dawn shape recurs: Miles, Carlos and Frank all last dawned
  at (4,4) with atHaven=true, insideHaven=false; Vito dawned at (0,5)
  away from Haven. Fourth band running with (4,4) as the modal
  last-dawn tile for wild deaths (r277 Esther+Leonid, r280 Irving, now
  three more) — the scholar keeps dawning at Haven's threshold rather
  than inside it, then dying in the wild. Named as a descriptive
  finding; no design call taken this run.
- **Q7 SLEEP-RETRY: 67 tried, 65 advanced.** The 2 non-advances are
  both on seed 109048, both with day=None in dayPhaseLog (end-of-run
  entries, unattributed to a day). Same count as r277/r274 (2).
  DAY-DESYNC: net drift +9 panel-wide, 13/13 events attributed — GO.
- **Q2 SITTING CLOSES: GO.** 0/16 CUT sittings; 2 engine-ended WITH
  closing beats.
- **Q1b WANT-RAISE: GO.** Panel 77/557 social sits raised ask_favor
  (13.8%); zero-raise seeds 0/8. **F5 FLOOR shape RECURS** (build-arm
  item, reported not judged): thinnest seed 5.2% (109045: 4/77),
  fattest 25.9% (109048: 18/81) — thin<7% while fat>15%, back after
  r280 closed it at 9.6% min.
- **Q1 FAVORLESS ASK: GO.** 3 favorless sits of 77 raised asks (3.9%;
  r280 4.7%). Repeats: Yesset, Jenny, Farid, 1 each; 0 contentless
  re-seeds after favorless sits.
- **Q5 EXILES: 11 — highest panel count yet, all moot HEARD.**
  (r280: 5, r274: 4, r265: 3, r246: 2.) All 11 path=moot, 0 UNHEARD, 0
  PRESENT-at-sentencing. Exiles arrive in same-case batches: 109041 d14
  Aroha+Brian (case_6), 109042 d43 Arlo+Nahla+Daniyar (case_10),
  109044 d15 Oliver+Dmitri (case_4). **TRIPLE EXILE watch FIRED:**
  109042 d43, three exiled from one case, with case-thread advance
  notice (d38 sittings with Arlo and Nahla while case_10 was open).
  Exile narration lines: 0 — the exile itself is only ever spoken in
  the moot/ledger ("Take what you can carry and go"), never narrated
  as a scene. The warning mechanism works (11/11 HEARD); the count
  climb is descriptive, not a bar miss — but if the next band reads
  ≥11 again, the exile rate itself becomes the question.
- **COUNTER LABELS: clean.** 198 COUNTER LEARNED lines, 0 comma-clause,
  0 em-dash.
- **BOWCRAFT: 25 bows equipped panel-wide** (r280: 13, r277: 27) — the
  recovery holds. 0 bow-key telemetry events (blind-scan confirmation).
- **WARN-HEED: GO.** 24 warn_you sittings, 13 delivered (1 via the
  deepen arc), 0 engaged-unnamed.
- **SETTLED-FAVOR / DRY2 / SELFWIT: all 0.**
- **WINPLAN: GO.** Plans seeded on 8/8 seeds (planSeeds 23);
  partyDepartures 87 on 8/8 seeds; DEPART beats 83 on 8/8 seeds
  (beats ≤ departures every seed). **TRIO GAP: 0 trios, 0 quads —
  10th straight run.** Parties form and depart, but never as three.
- **END BAR: GO.** 15/15 broken-live forage opportunities closed
  within 2 dawns. TRUST GUARD 0 drops. JAM 0 days.
- **CODEX:** 285 plants identified at end across 8 seeds.
- **VILLAGE BAR: GO.** 8/8 alive at d40.
- **Q3 RECAP PARAPHRASE: distinct=5 of 16 sittings (raw 10)** —
  report-only, under the 6-distinct over-representation line.

## People check — PASS (6 full transcripts read)
Seeds 109041, 109046, 109048, two sittings each, read in full.

- **Frieda (109041, mushroom grower)** — water-haul favor, commits,
  honest deferral ("out on the road, away from Haven — no dawn meet"),
  then shares a stockpile (+4 wood, +4 fiber) and asks the guilt
  question. The player deflects ("There's something I regret. I'm not
  ready to talk about it") and Frieda answers with grace: "We're all
  doing math that doesn't add up. You're still here. That counts."
  Real want, real deflection handled kindly, resolves. Best line of
  the run.
- **Tanisha (109041, midwife)** — unfinished favor + plant teaching
  ("Peanut. Leaf, stem, smell."), Water Hemlock identification, a spring
  location. Deflects the tension question honestly ("Everything I know
  about that fits in a thimble"). Ends "Good talk." One nit: the recap
  line reads "Still on that question. — ask anyone!" — the "ask anyone"
  tail is a stitched fragment.
- **Riley (109046, hunting guide)** — snare-mending favor. **BLANK
  (documented, not landed):** the requirements answer is an honest
  dead end — "There is no playable shared snare-repair job yet. An
  unrelated village task cannot complete this request." The NPC's want
  is real and the reason is real ("No snares, no rabbits — and the
  protein's what keeps us going"), but the favor cannot be completed.
  snare_mend was 2 of the panel's 77 raised asks. The fix is a build:
  a playable shared snare-repair job. Owed to the build arm.
- **Kwabena (109046, comic shop owner)** — the run's best transcript.
  Opening voices the succession handoff: "Carlos and I never finished
  talking about that personal stuff — we wandered off it. You're wearing
  Carlos's shoes now — want to pick it up?" The dead scholar is named,
  the successor is named as his successor, and the unfinished
  conversation is offered for continuation. Invite accepted ("Okay.
  Yeah. I trust you."), personal story told ("I was a comic shop owner.
  Now I'm... whatever today needs."), comfortable silence, ending:
  "Talking helps. Then it hurts. Then it helps again. It's a cycle."
  The succession continuity the game promises is actually spoken here.
- **Jenny (109048, hunting guide)** — dreams of "before", bad at
  talking to strangers, her mother's terrible advice ("Strangers are
  just people you haven't disappointed yet"), then a haul request.
  Coherent deepening; resolves with a knowledge trade.
- **Henry (109048, emergency dispatcher)** — something unsaid to
  someone, then the water favor (6 liters, first light at the creek),
  commits, honest deferral, then the laughter memory: "Stealing joy.
  I like that. We should steal more of it."

Verdict: villagers act like people. Wants are real, deflections are
honored, endings resolve or plant honestly. The driver-pressed "goon"
continuer repeats (4× in Jenny's sitting) but that is the driver, not
the NPC looping.

## Village assessment (plain words)
Eight villages, all alive at day 40, all with 7–12 people left of the
starting 12. They know things: 285 plants identified between them,
spotter knowledge on every seed (one village lost its holder to death,
not to ignorance), 198 counter-lessons learned and named cleanly. They
work together: 87 party departures, 23 plans seeded, favors raised on
13.8% of social sits and mostly completed (15/15 broken-live forage
opportunities closed). They also exile each other — 11 people sent
walking, the most yet, always after a case the village had heard about
in advance, never silently. Four scholars died: two in the wild after
dawning at Haven's edge, one sick, one in the arena. No village
starved (0 starvation deaths, pantries 5,710–64,940 kcal at end). What
is missing: a third person in any party — ten runs now, still no trio
departure, so the wave-4 fights are still fought by pairs; and a way
to actually mend a snare when a villager asks for help with one.

## Metric review (§14)
1. **SPOTTER bar — propose the cumulative as the binding number.**
   The frozen bar counts end-holding spotter XP per seed. On a turnover
   seed the knowledge exists (Carlos 11 XP) but the successor ends at 0,
   so the seed reads as contributing nothing. The analyzer already
   computes the tenure-summed cumulative (r246 metric review §1) for
   exactly this reason. Proposal for r286: GO iff panel cumulative ≥20
   AND every seed's cumulative >0; keep end-holding as the reported
   second number. No re-score of r285 — the miss stands on the frozen
   bar.
2. **Telemetry-check sums artifact (standing):** the checker compares
   SUMS, so any pooled-baseline roll makes the next 8-seed check print
   LOUD lines that are pure seed count. Judge on per-seed means (this
   run: all four within ±30%). The checker itself needs a --per-seed
   mode, or the baseline needs a per-seed-means shape; owed as a
   tooling note, not a run finding.

## New-code watches (Q8)
- TBREFUSE: no guard-refusal rows on the panel (no heralds in the
  d14–40 window, as expected).
- BLOODCLUSTER: fight/death bookkeeping moved with the panel, not
  against it — deaths 46.8/seed vs pooled 48.8, within band.
- WORNGUN-RESEAT: gun totals in the end census — BOWCRAFT 25 bows;
  no destroyed-gun recurrence surfaced (no direct destroyed-gun
  counter on this leg; the bow total is the proxy).
- REARM-WITNESS: no rearm lines fired in the establishment window.
- CALLEDNAME: descriptor-form drift lines — none surfaced in the
  transcripts read (Kwabena names Carlos by name; no "stranger"
  descriptors in the held convos).
- HOLDREPEAT: no repeated hold lines observed.
- SUCCESSION r280: mourning/drift-note shapes — the Kwabena sitting
  is the succession shape working as designed (see People check).
- DEPARTNAME: departure beats use true names on the panel (83 DEPART
  beats, all name-form in the analyzer's line samples).
- SCALE r283 guns census: gun counts per seed reported via BOWCRAFT.
- LANDING r284 death terminal: one contest death on the panel — Frank
  d27 (the arena); the ledger closed with outcome 'died' per the
  analyzer's roster reconcile (no UNACCOUNTED removals panel-wide).

## Reachable / Fun / Winnable
- **REACHABLE: yes.** A competent player reaches the establishment
  content on every seed: favors, contests, wave 3–4, standing 70–160,
  regional links forming. Nothing in the leg is gated behind content
  the player cannot find.
- **FUN: yes, with one honest dead end.** The conversations are the
  leg's strength (Frieda, Kwabena). The snare-mend ask is the one
  place the game asks for help it cannot accept — it says so honestly,
  but it still ends the thread.
- **WINNABLE (progress): yes, stalled at the same wall.** Parties form
  and depart (87), standing climbs (to 160), waves unlock — but no trio
  in ten runs, so wave-4+ fights are still pair fights. The leg moves
  the player toward a win; the trio gap is the standing wall above
  this leg, not inside it.

## Telemetry
`node scripts/telemetry-check.js` vs the r274+r277+r280 pooled baseline
(24 seeds): 3 LOUD lines — deaths −68%, popAlive −66%, pantryKcal −71%
on sums. Adjudicated BEFORE the roll: the seed-count artifact (8 files
vs 24-file baseline sums), documented since r280; per-seed means all
within the Q4 ±30% band. Baseline ROLLED to the 32-seed pooled sums
(deaths 1546, popAlive 298, pantryKcal 1,164,586, starvationDeaths 0).
Post-roll check prints the same artifact lines against the larger sums
(expected — the checker compares sums; judge on means).

## Gate
`node scripts/check.js --quick` on the worktree tip: **336 passed, 8
failed in 1196s**. The 8 = the standing 5 (2 deed-attainment timeouts —
living-garden + one-person-army; 2 stale measurement-proof;
1 phone-frame proof) + 3 load flakes (occupation-panels,
trust-observer-neutrality, capable-bot — all three re-run green
standalone: 25/25, 6/6, 40/40). 0 attributable to this run: no src/js
change, instruments only. The r280 menu-priority proof test
(test-menu-priority-r280.js) passed inside the gate on this base.

## Closeout
Merged ff-only into master (see below), worktree released + removed,
branch deleted, rotation 1→2 (deepening next), lock deleted, heartbeat
loop killed. Merged locally, pending ship — no version bump, no push
(ship loop owns those).
