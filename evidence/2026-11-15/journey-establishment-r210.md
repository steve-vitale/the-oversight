# journey-establishment r210 — establishment leg (days 14–40), Lane A — RUN NOTE

- **Run:** `playtest-loop-a-20261115T0045CST`, scheduled Sun 2026-11-15 00:45 CST (06:45 UTC; run started ~07:22Z). Lock `2026-11-15T07:22:15Z`.
- **Leg:** 1 — establishment (42-day horizon, death-aware stop). Rotation read `1`; write `1→2` at closeout. The file reading 1 looked stale at first (r139's adoption note said rotation stays 2, deepening next) — the sequence checks out as legitimate, not a clobber: r193 deepening 2→3, r206 scale 3→0, r135 landing 0→1. Establishment is the correct next leg.
- **Base:** local master `8b77f0f40` (sim-winnability-round-0621 coordinator evidence; successorcaution-b PILOT-NO-GO + proof refresh round 20 GO). Registration base was `287f740ac`; master moved during registration, branch rebased onto `8b77f0f40` before any work. Master delta vs `3904f2b8f` (r135 tip) is evidence + scripts only — no src/js change, so the game under test is the r139 game plus the proof-refresh re-point.
- **Branch:** `journey-establishment`, worktree `~/workspace/worktrees/journey-establishment` (registered 07:25Z; heartbeat 07:35:27Z immediately after registration; 10-min heartbeat loop PID 48903, exact-PID kill at closeout).
- **Lock:** no lock present at run start — no stale-lock recovery. **Delete at end, re-reading it first.**
- **Policy:** competent. Pilot **5501**, panel **5502–5505**, 42d horizon. Band 5501–5505 FRESH (see prereg; rejected 5101–5105 leanwinter-b, 5201–5205 seatblow, 5301–5305 deepening r78, 5401–5405 social r58/retagrot).
- **Commits:** `c8ce90e39` — prereg + r210 driver/analyzer clones (committed BEFORE any judged sim). Safe-commit index clobber struck (repaired via the documented ls-tree pipe; verified: status clean, diff empty, all 3 hashes match HEAD). (Run-note commit owed at closeout.)
- **Corpus:** `hidden_files/evidence/2026-11-15/journey-establishment-r210-*` (goal store) — 5 seed JSONs + 5 convo transcripts.

## Q1 (PRIMARY) — SPOTTER IN THE WILD: GO (with a pace read)

**Verdict: GO on the primary bar; the fix holds in the wild on the new master.** The r139 spotter wiring fires on every seed with no src/js change in between.

- **SPOTTER BAR (primary): GO.** Panel (5502–5505) total foodXp['spotter'] = **38** (bar ≥ 10); every panel seed contributes > 0 (15 / 16 / 3 / 4). Pilot 5501 also fires (5). (Analyzer prints 43 — that includes the pilot's 5; the panel-only total is 38.)
- **LADDER BAR (secondary): MISS — pace read, not a kill.** 2/4 panel seeds have ≥1 villager at 5+ spotter XP / skill 1 (bar ≥ 3/4). Per the pre-registered rule (r139 prereg: "Report-only if the SPOTTER BAR is GO but this misses"), this is a pace read: spotter XP tracks how much villagers forage, not time. The two thin seeds fought all leg — 5504 lost 5 villagers on day 8 alone (26 deaths, mostly monster combat) and 5505 took 5 expedition + 7 combat deaths; their villages foraged less, so only Wanjiru (5504, 3 XP) and one villager (5505, 4 XP) earned any. The grant fires everywhere; the ladder climbs only where foraging happens.
- **FASTER-ID BAR (secondary): GO.** The threshold benefit fired on 5/5 seeds — **107 benefit plays in 167 bump calls** (bar ≥ 2/4 seeds). The "faster ID" the food.js table promised is live in the wild.
- **END BAR (carried): GO.** 14/14 broken-live forage opportunities closed within 2 dawns (12 same-dawn, 2 next-dawn: Priya 5504 d30→d31, Charlotte 5505 d28→d29).
- **STRANDED BAR (carried watch): MECHANISM HOLDS — first live stranding since r138.** Seed 5504: Arlo's forage_help run stranded 7 dawns (d18–d23) after its bearer Niamh <redacted> in a contest on d17. Worked-on-stranded = 0, guard fires = 0, social sits on all 5 stranded days (misses 0), 1 new favor committed after stranding (the r138 fall-through working). The run still sits live in the successor's ledger at end — that is Steve's open question (release a dead bearer's outing on succession, or let it linger forever?), not a new defect. The wedge itself never wedges.
- **TRUST GUARD (hard, DROP-ONLY): HOLDS.** 0 trust drops on end presses across the panel.
- **VILLAGE BAR: GO.** 5/5 seeds alive at d40 (bar ≥ 3/4).
- **JAM BAR (report-only): 0** jam-days across the panel.
- **STRANDED / TRAVEL / THREAD branches:** STRANDED fired (above); TRAVEL 0/0 and THREAD 0/0 — NO-OPPORTUNITY, mechanisms carried by the proof tests.
- **WATER INSTRUMENT (report-only): 0** broken-live water runs.
- **Proof test re-run:** `scripts/test-journey-establishment-r139-spotter.js` on the new base: **35/35** — the mechanism still holds.

## Q2 (report-only — canned-line variety watch): paraphrase warming, recap still varies

Analyzer counts across the panel's AFTER transcripts: pod-dream closing **0**, recap stitch verbatim **0**, recap paraphrase (/still (on|where we are)/) **2**, slope-reading **0**, "Walked in like they'd never left." **0**, "Take it for what it's worth." **0**, stew-bowl **0**, pod-dream-open **0**. The two paraphrase hits are the same sentence shape in two sittings: 5502 "that hard time — that's still where we are" and 5503 "that personal stuff — that's still where we are" — both the [recap] reply. Count by run: r138 1 (missed by the verbatim needle), r139 1, r210 2. The watch is warming, but by the r193 A2 floor proposal (total < 6 → THIN-PROBE) this is still thin — report, don't build. And the full picture cuts the other way: the recap replies as a whole VARY. Honore (5504) answers "Still on what they confided." and Miguel (5504) answers "This matters — We started on that question, then got onto the gossip." — four formulations across the panel, two of them thread-specific. The needle fires on one formulation; the system is not a single canned line. Next run's question: whether the [recap] reply deserves a second paraphrase formulation, or whether the variety already in the wild is enough.

## Q3 — census (plain words)

Five villages played (pilot + 4-seed panel), all alive at day 43. Every village started with 12 people; the panel ended with 9–12 alive. Pantries held (22k–80k kcal at end) — no village went hungry, **0 starvation deaths** across the panel. All five reached wave 3; three reached wave 4 (5501, 5503, 5505). The Codex grew by 17–32 identified plants per village (121 total across the panel). The spotter skill is now ordinary: 43 XP spread across the panel, three villagers at skill 1 or better, and the faster-recognition benefit firing 107 times. Broken outings closed within 2 dawns every time (14/14) — nobody was left stranded with a live promise except Arlo's run, which stranded only because its bearer <redacted> and the wedge correctly refused to work it.

- **5501 (pilot) — alive day 43, 11 alive, pantry 30171, wave 4.** Spotter 5, ladder YES, benefit 4/16 calls, 32 plants. 31 deaths, all but 2 monster combat. Miguel + Ethan broken runs closed same dawn.
- **5502 — alive day 43, 12 alive, pantry 80143, wave 3.** Spotter 15, ladder YES, benefit 30/36, 17 plants. 28 deaths. Pavel's two broken runs closed same dawn.
- **5503 — alive day 43, 11 alive, pantry 69836, wave 4.** Spotter 16, ladder YES, benefit 28/36, 20 plants. 40 deaths (heaviest panel toll, all but 3 monster combat). Three broken runs closed same dawn.
- **5504 — alive day 43, 9 alive, pantry 48220, wave 3.** Spotter 3 (Wanjiru only), ladder no, benefit 16/38, 29 plants. 26 deaths incl. 5 on day 8 and Niamh lost in a contest d17 — her death stranded Arlo's run (see Q1). Three broken runs closed (two same-dawn, Priya next-dawn).
- **5505 — alive day 43, 10 alive, pantry 22883, wave 4.** Spotter 4, ladder no, benefit 29/41, 23 plants. 35 deaths incl. 5 expedition + 7 combat. Four broken runs closed (three same-dawn, Charlotte next-dawn).

The death toll is the standing picture, not a new finding: 160 deaths across 5 villages in 43 days, ~90% villager-vs-monster combat. Villages survive it with food in the pantry and plants in the Codex — the difficulty is the game's hard edge, and the survivors are getting stronger (spotter skill, faster recognition) rather than just fewer.

## Q4 — people check (full transcripts read): PASS, with one abrupt ending

Two sittings from seed 5504, read in full. People with wants, consequences, and specific memories; no fabricated shared history, no filler loops.

- **Honore, 5504 (mushroom grower).** Opens on an unfinished confidence — "We never finished talking about what they confided" — and an owed grief. The player asks about mourning; Honore: "You asked me that before. It's a different question now." Then the specific memory: "Minh always took the burnt piece. Said someone had to. I take it now." — taking over a dead person's habit, a consequence that lands. Teaching Wild Ramps lands ("And I've been walking past it for weeks."). Ends gracefully. The one flat beat: "The moment passes without landing. Not yet." after "Please, go on" — honest deflection, not a defect.
- **Miguel, 5504 (dockworker).** Opens on an unfinished question, then real gossip with consequence: "Stan just walked away from Haven. Didn't look back." The recap reply names the detour itself — "This matters — We started on that question, then got onto the gossip." Wrinkle: the sitting ends "(ended by engine)" after the player's agreement, with no closing line — abrupt, not senseless. Carried as a content observation: sittings should close, not cut.

## Telemetry + baseline (adjudicated)

- Check vs the live baseline (r132 BEFORE panel, competent + withDelegate + HUNTSTAFF=2, seeds 2401–2416): **3 LOUD lines, all "disappeared"** — guardrails.deaths 604→0, guardrails.popAlive 178→0, guardrails.pantryKcal 1210411→0 (n=5 files). c3.starvationDeaths: no line (field absent on both sides).
- **Adjudication: EXPLAINED — known schema mismatch, not a real move.** Direct inspection of the seed JSONs: the r210 driver never emits `guardrails.*` or `c3.*` fields at all (verified: `'guardrails' in d` False, `'c3' in d` False), so the checker reads the missing paths as 0 — exactly the mismatch the prereg predicted. The real values read directly are healthy: villages alive at d40 on 5/5, pantry 22k–80k, 0 starvation deaths, spotter firing on every seed. **Baseline NOT rolled forward** (same call as r138/r139; the baseline stays the r132 regime until a driver that emits the fields is in play).

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest` (340 scripts, 4 parallel, 651s): **335 passed, 5 failed — GO after adjudication (0 attributable to this run).** Log `hidden_files/journey-establishment-r210-gate.log`, standalone logs `hidden_files/journey-establishment-r210-standalone-*.log`.
- **2× 120s load timeouts** (living-garden, one-person-army deed-attainment) — same shape as r139/r193. Standalone re-runs, both GREEN: living-garden **8 passed, 0 failed**; one-person-army **7 passed, 0 failed**. Load artifacts, 0 attributable. (One standalone launch was interrupted by a service restart mid-run; re-launched clean, no state touched.)
- **test-measurement-proof-update + test-measurement-workflow** — "Proof source inputs are not current" / "retained neutrality proof covers the current Game/controller/harness inputs". PRE-EXISTING, not this run's: `B.manifest()` hashes all of `src/` + `scripts/policies/` + index.html + sim-harness.js + sweep-compare.js, and this run added no file under any of those paths (r210 driver/analyzer + evidence only). The staleness comes from the base itself — master `8b77f0f40` landed `scripts/policies/competent-successorcaution-b.js` (a manifest input) after the round-20 refresh was taken on tip `3904f2b8f`. The round-21 refresh stays the already-owed job (r192/r193 carried list) — NOT run here: a sibling proofrefresh arm owns that lane, and this run has no src change to justify re-pointing the proof.
- **test-phone-frame-proof** — stale receipt (index.html + data files), the same pre-existing failure as r189/r191/r192/r193/r197. NOT attributable to this run (this run touches none of the listed inputs); the receipt refresh is a separate owed job, not this run's.
- Notably absent vs r193: no cache-flags failure in the gate this time (0/4 under load there); occupation-panels, capable-bot, synergy-stall, throttlefeast, trust-observer-neutrality all passed inside the gate. /tmp stayed 40% full throughout (no ENOSPC repeat of r139).

## Metric review (§14)

- The SPOTTER BAR worked as written: panel total 38 with every seed > 0 is an unambiguous GO, and the bar's NO-GO shape (any seed at 0) would have caught a grant that only fired on foraging-heavy villages. The LADDER BAR as written (≥3/4 at skill 1) missed on a panel where the grant fired everywhere — the miss is a pace read (foraging volume), not a mechanism failure, and the prereg already classed it report-only under a SPOTTER GO. A future run that wants the ladder as a real bar should tie it to foraging volume (e.g. skill 1 among villagers who foraged ≥10 days), not to the raw seed count.
- The Q2 widened needle worked: it caught both paraphrase hits that the verbatim needle missed. The pod-dream-open needle worked too (0 on this panel — no sitting opened on the pods; the closing needle also 0). The r193 A2 floor proposal (total < 6 → THIN-PROBE) applies cleanly here: paraphrase total 2 is THIN-PROBE, report-only.
- The telemetry checker keeps crying "disappeared" on fields this driver never emits. The metric is honest about absence but the baseline comparison is meaningless while the driver regime differs — the next establishment run should either emit the guardrail fields or drop them from the checked set, not keep adjudicating the same artifact. (Same note as r139; still true.)
- The 4-seed panel was enough for Q1 (38 firings, clean variety) and the carried bars; the pilot + panel together make the biggest establishment corpus on the spotter question.

## Verdicts

- **Reachable:** yes — the spotter skill is earned by ordinary foraging within the leg, the faster-recognition benefit fires 107 times in the wild, and every village reached wave 3 with a living, fed population.
- **Fun:** yes — the transcripts read like people (Honore taking the burnt piece, Miguel's Stan-walked-away gossip, the teaching beats landing), and the villages that survived did so with food in the pantry and plants in the Codex.
- **Winnable:** partial — 5/5 panel villages alive at day 43 with standing to build on, but this leg ends before regional/national; the link-less-standing question stays with the scale leg, and the full seat is still ahead.

## Notes for the next run

- **Rotation:** write `1→2` at closeout with read-back verification. Next leg is deepening (days 40–80).
- **Next blank (r211, deepening):** carried from r193 — A2 share-bar floor proposal (total < 6 → THIN-PROBE; adopt it or the watch keeps flagging noise); knowledge-goal thin engagement + Nora top-null (one-brain); moot-frequency spread (observation); water-haul favor template repeats near-verbatim; teach-loop same-pick repetition; `betrayal:accept` label on a benign walk; 100087's 0 meat dinners. NEW from this run: the [recap] reply's paraphrase formulation ("that's still where we are") is now 2 in a row — next run decides whether it deserves a second formulation; Miguel's "(ended by engine)" sitting close — sittings should close, not cut.
- **Carried (unchanged):** medicine holder-less levers brief (goal hidden_files/medicine-holderless-levers-brief-2026-11-13.md — build arm build-medicduty-h owns it); Steve's open calls (gating recalibration, answercourt cost; r129 bar ANSWERED by the r135 landing); richer medicine design owed; reaper restructure nod owed; Steve's open question on releasing a dead bearer's outing at succession (the 5504 Arlo case is fresh evidence for it — the run lingers in the ledger, the wedge refuses it, the village carries on).
- **Held tree (INSPECT HELD WORK, Steve 2026-10-27):** `journey-scale-attr` (heartbeat 2026-11-10 06:08Z, 5+ days stale) still holds the unlanded revert of the live sim-wideduty-a medic-duty code in `src/js/game.js`. Real work-in-progress, not scratch — not released, not touched. Flagged again.
- **No src/js change this run** (verification panel: prereg + driver/analyzer clones + run note only).
