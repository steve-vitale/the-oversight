# journey-landing r105 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261105T1245Z (scheduled 05:45 CST 2026-11-05).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@1b6fa6c33 at run start (`git pull` already up to date; main tree clean, disk 31%).
**Numbering note:** the Lane A counter is global across legs; r104 (landing) was last, so this run is r105.
Driver: scripts/journey-landing-r105-20261105.js (r104 driver verbatim except seeds 877–886, OUTDIR landing-r105, header — diff-verified at run start: only header, seeds, OUTDIR differ; R104 WINPLAN instrument + R104-GOAROUND rescue rungs + R104-PROBE gate carried, zero policy change).
Analyzer: scripts/analyze-landing-r104-20261105.js (unchanged, DIR passed as argv → landing-r105).
Fights: scripts/analyze-fights89-20261102.js (unchanged, dir-as-argv).
Shape test: scripts/test-landing-r94-shape.js (unchanged) + scripts/test-landing-r104-rescue-goaround.js (unchanged, re-run against the r105 corpus as a regression check).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate change in this run. **Perception law (2026-10-28) stands** — all instruments read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect is proven in game code (not driver policy) with a before/after proof test; otherwise document and move on. This run carries NO planned code change.

## Q1 (PRIMARY) — THE SILENT WIN-PLAN ARMS
**Why this run, why now:** r104 proved the win-plan system bites in the first fortnight — but ONLY through its party/hunt arms (planSeeds 13 at d14, partyFights 21, invites 8, departures 8, waits 22). The gear/bond arms were DEAD SILENT across all 10 seeds at d28: gearHolds 0, bondTends 0, avoidances 0, seekContacts 0, standingContacts 0, veteranGuardHolds 0, musterStanddowns 0, trickHolds 0. If the win-plan system is party/hunt-only in the landing window, the winnability chain's gear-check and bond-tending levers cannot move the early funnel — that is a real finding, not background. r104's metric review explicitly called for this run to pre-register a bar for the silent arms.
**Pre-registered metrics (binding):**
- M-S1 silent-arm events by d28: any gearHold, bondTend, avoidance, seekContact, standingContact, veteranGuardHold, musterStanddown, or trickHold on ≥1 seed = ARMS-LIVE (partial — name the seed/day/arm); 0 across the panel = ARMS-SILENT (the win-plan system is party/hunt-only in the landing window — reported as such, not re-scored).
- M-S2 uptake unevenness: seeds with 0 planSeeds at d28 — named; if ≥2 seeds stay at 0 again, record whether they differ in any readable way (pop, deaths, first-contact day).
- A miss on M-S1 is NO-GO, never re-scored against a friendlier metric mid-run (metric review below if the metric proves wrong).

## Q2 (PRIMARY) — R104-GOAROUND AT PANEL SCALE (M7 REVISED)
**Why this run:** r104's creek-pocket fix (bridge + BFS detour rungs) proved on ONE seed's replay (2 arrivals, 0 non-arrived vs 7 arrivals / 6 non-arrived before). The r104 metric review also revised M7: judge arrived/skips, not ladder-complete/skips.
**Pre-registered metrics (binding):**
- M7-r105 kcal: arrived / kcal-skips ≥ 80% = GOAROUND-HOLDS; < 80% = GOAROUND-WEAK (name the failing seeds/days and the rung that stopped: bridge-skipped, detour:no-onboard-path, or other).
- M7-r105 water: still UNTESTED unless a wild water skip fires (see Q4).
- Rung fires (bridge / detour / no-onboard-path) reported as counts with seed/day.

## Q3 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION
r104 proved the branch a third time at panel scale. Carried as a regression check: M6 clauses hold (complete eatRecs on triggered steps; 0 class-E scholar starvation deaths; 0 triggered steps ending enterResult===false).

## Q4 (CARRIED) — WATER CLAUSE, STILL UNTESTED
0 wild water skips since r87 (now sixteen runs deep). Record wild outing iterations + min hydration; if 0 wild water skips again, stays UNTESTED. Not a re-proof — a standing blind spot, reported, not chased by changing the panel.

## Carried bindings (r104 verdicts, re-judged fresh)
- **M1 ALIVE-D14: 10/10** (no village lost by day 14).
- **M2 SYSTEM CONTACT: 10/10** (first contact ~day 8).
- **M3 FIGHT-LOG:** all hunt fights complete, 0 unknown/mixed trigger.
- **M5 PEOPLE:** wind-down picks, WD probe gates, betrayal held-offers 0, party invites spoken/dry; two full transcripts read for sense (SENSE-TESTING LAW).

## Seeds, pilot, shape
- Panel: fresh seeds 877–886, DAYS=28, OUTDIR landing-r105 (goal hidden_files evidence/2026-11-05/landing-r105).
- PILOT FIRST: 3 seeds (877–879) before expanding. If Q1 shows nothing interesting in the pilot (0 silent-arm events AND 0 planSeeds at d14 on all three), document and still run the panel only if the carried bindings need the panel — the pilot decides; do not burn a full run on a dead question.
- Shape: pilot validates the WINPLAN instrument is still read-only (planSeeds before/after instrument reads on a replay seed — same check as r104).

## Metric review (filled at closeout, never mid-run)
- (to be filled)
