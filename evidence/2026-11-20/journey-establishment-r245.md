# Journey establishment r245 — run note

- Run: `playtest-20261120T1145Z` (Lane A, scheduled Fri 2026-11-20 05:45 CST)
- Leg: establishment (days 14–40, 42-day horizon, death-aware tail +10d)
- Seeds: **101951–101955** (fresh band; full-scope freshness grep 2026-11-20 ~12:00Z: zero hits across all preregs, evidence filenames, git log; backup 108101–108105 held unused)
- Base: local master `683c9a6e5` ("Version bump 407168f1d-20261120-114057 (batch ship)")
- Base delta vs r244 panel base `68b1f6370` (src/js, +204/−24, 7 files): scale r246 react wind-down fix (`db6f4d7ce`), succession r254 mourning witness variant (`aea63f6b5`), BOWCRAFT turn-on (`d56fbe819`) + BOWKNOW mentoring (`eaf530d6a`), r244 counter-label comma-clause fix (`9fb55be89`), endgame r249 doubled-'The' fix, crisis r253 march-refusal + 'The The' fix, sim-bowknow/searsupply instruments.
- Prereg: `evidence/2026-11-20/journey-establishment-r245-prereg.md` (this note adjudicates against it; metric binding applies — a miss is NO-GO, never re-scored mid-run)
- Queue jump: rotation file read **0 (landing)**, but this run played leg 1 — the landing worktree `journey-landing` is held by the timed-out r149 run (adoption agent `eebcc3cc` finished ~11:55Z BLOCKED by the write flap, merged/released nothing; the tree still holds r149's uncommitted work). Recent commits also touched conversation/villager systems this leg exercises. Rotation handling at closeout: read the file then — if it reads `1` (r149 adoption resumed and advanced 0→1), write `1→2` with read-back; if it still reads `0`, leave it (the adoption writes 0→1 when it resumes; the next Lane A run then replays establishment — a benign duplicate).
- Write flap: new window ~11:46Z (watchdog A/B/E/G/H/I EPERM; git-ref probe EPERM 11:58Z), cleared ~12:01Z. All r245 writes (prereg, driver, panel outputs) landed after the clear; nothing was forced during the window.
- Lock note: the lock file vanished mid-run (found absent 13:03Z; created 11:49:13Z, registration didn't complete until 12:38Z after the reaper stall — the 49-min pre-registration window left it with no registered tree, the exact shape a stale-lock sweep deletes). Registry heartbeat stayed fresh throughout (13:04:37Z); no duplicate run started. Lock recreated 13:05:34Z with the same run_id + fresh timestamp to restore the overlap guard for the rest of the run; closeout deletes it in the same call as its read, only if the run_id matches.
- Pilot: seed 101951 completed clean (exit 0, ~70s); all pilot-gate criteria passed (standingEnd 70, scholarDawns 42, teleTypeCounts 50 keys, mootLines 15, caseLog 42, rosterDepartures 2, sittingCloses 2, 58 social sits / 52 verbal with wantIds, Q1 trace sits 58/58, bumpLog 45, counterLines 23, 0 scholar deaths, "pull weight" regex present in driver). Panel ran 101952–101955 (exit 0, ~5.8 min).

## Panel results

| seed | endDay | alive d40 | wave | standing | pantry kcal | spotter | ladder | bumpCalls/benefit | scholar deaths |
|------|--------|-----------|------|----------|-------------|---------|--------|-------------------|----------------|
| 101951 | 43 | 10 | 3 | 70 | 20,518 | 6 | YES | 45/25 | Paisley d24 (wild) |
| 101952 | 43 | 11 | 3 | 65 | 39,725 | 6 | YES | 21/10 | Werner d26 (wild) |
| 101953 | 43 | 10 | 4 | 100 | 51,348 | 21 | YES | 52/39 | — |
| 101954 | 43 | 12 | 4 | 135 | 119,170 | 17 | YES | 66/58 | — |
| 101955 | 42* | 8 | 4 | 100 | 112,352 | 2 | no | 20/13 | Eli d13 (stranger), Emon d39 (wild) |

\* Seed 101955 endDay 42: driver day-counter desync (d40 dawn missing, d42 dawn doubled; `daily` has two day-42 entries). The village was alive (8), gameOver false, all bars computed. One game-day short on one seed; bars unaffected. Driver quirk, not a game defect — see Metric review.

## Bar verdicts

- **SPOTTER — GO.** Panel foodXp['spotter'] total 52 (bar ≥10); every seed >0 (6, 6, 21, 17, 2).
- **LADDER — GO.** 4/5 seeds with ≥1 villager at 5+ spotter XP (bar ≥4/5). Only 101955 misses (Jada 2).
- **FASTER-ID — GO.** Benefit fired on 5/5 seeds (145 benefit plays in 204 bump calls; bar ≥2/5).
- **END — GO.** 12/12 broken-live forage opportunities closed within 2 dawns (qualifying only).
- **THREAD — GO (watch).** 4/4 paged (Yara-shape) opportunities closed within 2 dawns; 4/13 end sits paged.
- **TRAVEL — NO-OPPORTUNITY.** 0/0 clearable-blockage; 0/28 homeward sits hit one. Mechanism carried by the proof test.
- **TRUST GUARD — PASS (hard, DROP-ONLY).** 0 trust drops on end presses.
- **JAM — 0** jam-days (report-only).
- **VILLAGE — GO.** 5/5 seeds alive at d40 (bar ≥3/5).
- **Q2 sitting closes — GO.** 0/10 CUT sittings; 4 engine-ended WITH closing beats; 0 other no-close.
- **Q1b want-raise — GO.** 70/322 social sits raised ask_favor (21.7%; bar ≥10%); zero-raise seeds 0/5. Thinnest seed 14.9%, fattest 34.0% — no F5 floor shape. Kinds: forage_help 47, heal_help 11, food_share 6, (no-kind) 4, stay_close 1, sick_help 1.
- **Q1 favorless asks — GO on the rate, with 2 LOST-ask defect findings.** 4 favorless sits of 70 raised asks (**5.7%**; bar <20%); 0 stage-0-deflected; every sit classified (C 1, E1 3); stage-0-surfaced 2/4. History: r231 15.9% → r244 4.9% pre-fix / 0% re-panel → r245 5.7%. **LOST asks 2** (see Defect findings below).
- **Q5 exile warning — GO.** 2 exiles, both moot path, HEARD 2, PRESENT 0, UNHEARD 0. No silent exile.
- **Q6 policy foraging — report-only, no F4 shape.** bumpCalls 20–66, wedgeSits 61–83, joint forage commits 2–8 per seed.
- **COUNTER label watch — PASS.** 110 COUNTER LEARNED lines, **0 comma-clause, 0 em-dash** (finding if >0 comma). The r244 comma-only revision is validated on a fresh panel: long noun phrases ("a boulder with opinions about where you're walking", "a crow that watches too long and blinks too little") correctly count as ok, not findings.
- **REACT watch — CLEAN.** Panel max consecutive dlg:react **1** on all 5 seeds; 0 sittings ≥3. The r246 wind-down fix's first live panel shows no react-loop shape at all on this leg (same as the r244 corpus baseline, max 1). Nothing to adjudicate.
- **BOWCRAFT watch — SUBSTRATE NOTE (not a defect).** 0 bow-key telemetry events panel-wide, same as the r244 corpus — but bows ARE present as equipped gear (`crude_bow` ×3, `bow` ×2, `crossbow` ×1 across seeds 101952–101955), and r244's JSONs contain the same bow gear, so the turn-on added nothing observable through this watch. The /bow/i telemetry-key scan is blind to bow crafting: crafting emits generic `weapon_craft`/`ammo_craft`/`craft` keys. See Metric review for the r246 watch revision.
- **Q3 recap paraphrase — report-only.** distinct 2 of 10 sittings (raw 4); <6, no second formulation owed. take-it 1/4, parting-plain-care 1/1.
- **F2 scholar deaths — 4 on the panel (bar: ≤2 WATCH, ≥3 INVESTIGATE). Investigated below; no fix owed.**
- **SENSEEXPED launch watch:** zero launches again (fifth panel silent: r241–r245).
- **Wave-4/standing watch:** **3/5 seeds reached wave 4** (r242: 3/5, r243: 0/5, r244: 0/5 pre-fix + 2/5 re-panel), standing to 135. Best wave-4 showing on the leg in the recent run — but the delta's only plausibly-relevant change (BOWCRAFT turn-on) produced no observable bow activity, so no mechanism ties the turn-on to the uptick. Band noise + standing is the likelier read (wave-4 seeds stand at 100–135, wave-3 seeds at 65–70). A matched-band A/B is still owed before any claim about the wave-4 door.

## Defect findings — Q1 LOST asks (2)

Both are class E1: the favor opener NEVER RAN because the sitting opened on a betrayal/case thread and the case picks ate the whole sitting. The villager had a real, probed need and never got a hearing. Documented with full transcripts; **proposed, not landed** (per prereg — same handling as r244's LOST asks).

**1. Victoria (gen_xhh71tw), seed 101953, d17 — LOST.** Need heal_help urgency 4 (probed 3× by findNeed). Sitting (mode accept, openThread recall, resumedOnce false): picks `betrayal:accept → betrayal:press:case_4 → betrayal:witnesses:case_4 → betrayal:investigate:case_4 → betrayal:moot:case_4 → joke`, result no-offer. She was the accused in case_4; the village exiled her two days later (d19, moot path, HEARD via the d15 moot line "Word reaches you, days late: Victoria stands accused…"). Her u4 healing need died with her — the sitting spent itself on the case that condemned her and never let her ask for help. No kinded ask_favor raised in any later sitting.

**2. Heinrich (gen_mw4hbh6), seed 101954, d10 — LOST.** Need forage_help urgency 2 (probed 3×). Sitting (mode accept, openThread request, resumedOnce false): picks `betrayal:press:case_2 → betrayal:site:case_2 → betrayal:witnesses:case_2 → betrayal:investigate:case_2 → betrayal:moot:case_2 → betrayal:letlie:case_2 → silence`, result no-offer, 4 menu pages turned. Seven picks, all case thread. Heinrich lived to the end of the run (101954: 12/12 alive, zero deaths) and still never re-raised the ask in any later sitting — the day's delay became a loss, not a deferral.

The two that surfaced later (Owen 101953 d13, class C; Katarina 101955 d14, class E1, dlg:help pressed YES) show E1 is not always fatal — it depends on whether the villager gets another sitting before the need expires or the villager leaves. The pattern to fix: **when a villager is party to an open case, the case thread consumes the sitting and the favor opener never gets a turn.** Proposed: the opener still gets one turn in a case-thread sitting (or the case thread yields one pick to a probed need at urgency ≥3, e.g. Victoria's u4 heal). A goals-arm / next-run fix, not landed here — no src/js change this run.

## F2 scholar deaths — investigated (4 on the panel)

- **Paisley, 101951, d24, "the wild".** Last dawn d24 at (4,4), atHaven=true, insideHaven=false — the haven-edge shape (scholar sleeps on the haven's edge tile, steps into the wild, dies the same day). Same shape as r244's Domingo counterexample.
- **Werner, 101952, d26, "the wild".** Last dawn d26 at (4,4), same haven-edge shape.
- **Eli, 101955, d13, "a stranger".** Last dawn d13 at (5,5), atHaven=false — the first scholar of the run, killed by a stranger on day 13, out in the wild at dawn. Early-game stranger danger; matches the game's "tricky, lots of people dying is correct" stance — no defect claim.
- **Emon, 101955, d39, "the wild".** Last dawn d39 at (3,3), atHaven=false — already out in the wild at dawn, died there the same day.

No contest deaths this panel (r244's day-23 contest variant is absent). No new mechanism: 2× known haven-edge shape, 1× out-in-the-wild, 1× early stranger kill. The base delta (react fix, mourning variant, BOWCRAFT turn-on, counter-label fix) has no plausible path to scholar deaths — BOWCRAFT, if anything, arms villagers. Panels have ranged 2–4 scholar deaths (r242–r244); r245's 4 sits at the top of that range with no new mechanism. **Verdict: band noise, no fix owed.** Open item for the goals arm (standing, same as r244); the Eli d13 stranger death is the one worth a look on the goals side — a first scholar dying to a stranger on day 13.

## Census (Q4, plain words)

60 villagers started across 5 villages; **51 alive at d40**. 9 villagers died (including 4 scholars), 2 exiled, 0 arrived.

- **101951 (wave 3, standing 70, pantry 20,518 — thinnest on the panel):** 12 → 10 alive. Scholar Paisley died in the wild d24; Dakota succeeded her. One more villager died of sickness d38 (the woman in her 50s with the long braid). Food knowledge sits with the scholar (Dakota 6 spotter XP — the whole village's 6). A thin-pantry village that survived to wave 3.
- **101952 (wave 3, standing 65, pantry 39,725):** 12 → 11 alive. Scholar Werner died in the wild d26; Roman succeeded him (6 spotter XP, again the village total). One villager death total. Steady, unremarkable, alive.
- **101953 (wave 4, standing 100, pantry 51,348):** 12 → 10 alive, no scholar death, no villager deaths at all — the losses were the two exiles, Victoria and Gus, both thrown out d19 over case_4 after a moot the player heard about in advance. Jack the paramedic holds 21 spotter XP — the strongest food knowledge on the panel. Reached wave 4.
- **101954 (wave 4, standing 135, pantry 119,170 — richest on the panel):** 12 → 12 alive. Nobody died, nobody left, nobody exiled. Duc the pottery instructor holds 17 spotter XP. Highest standing on the panel. A village that had a good forty days.
- **101955 (wave 4, standing 100, pantry 112,352):** 12 → 8 alive. Lost two scholars (Eli d13 to a stranger, Emon d39 in the wild); Jada, the third scholar, is alive at the end with only 2 spotter XP — the weakest food knowledge on the panel, and the village that lost the most people. Two more villagers died to aliens (d18, d27). Still reached wave 4 with a fat pantry — the village is rich and battered at once.

What the villages knew: spotter (food-spotting) knowledge is concentrated in **one person per village — the scholar** (Dakota 6, Roman 6, Jack 21, Duc 17, Jada 2). When the scholar dies, the successor carries the knowledge (Dakota and Roman both hold their village's whole total), but a village that turns scholars over twice (101955) ends up with almost none — scholar turnover bleeds food knowledge. Codex plants identified: 138 across the panel (22–35 per seed). Bonds proposed 15–28 per seed; killer tales 16–28 per seed; combat 1–10 starts per seed, all ended. What was missing: no arrivals on any seed (r244 had 3 pre-fix); no SENSEEXPED launches; no bow-crafting signal despite the turn-on; the two LOST asks above.

## People check (SENSE-TESTING LAW — 2 held convos read in full, seed 101953)

**Ashanti (truck driver).** Opens mid-thread ("We never finished talking about wanting to understand what happened — we wandered off it, 4 days back"). She has a voice: "I'm not curious. I'm thorough. There's a difference and it matters." / "Every answer just sharpens the question. I kind of love that." She turns the question back ("What got you through the first week?"), hears the answer, and answers with something grounded and personal ("Work. I just worked — fixed things, carried things, dug. If my hands were busy my head couldn't do the math on what we'd lost."). Closes warmly ("Good talk. I feel like I know you a little better now." + a smile). The want is real, the options engage it, the ending resolves. Polish notes, not defects: the opening line trails off mid-quote ("'fishing. Sounds small. But small useful things stack — and one day you look up and you're the person everyone…'" — a stitched fragment that never lands), and a stage-direction beat ("A beat. Then, as if shaking something off:") is served as a dialogue line and eats a turn, so the player presses "And?" twice in a row.

**Aaron (fisherman).** Opens on a debt thread, deflects honestly ("I wish there was more to tell. That's it."), then pivots to gossip with **live village facts** ("Ruth headed out to check the snares", "Sofia headed out for water") — real people's real doings, not filler. The player invites him along; he accepts ("Okay. Yeah. I trust you."). Ends "This was good. They mean it." Meaningful, coherent, consequential — an invitation taken is a joint outing owed. Minor: "They nod — and keep their distance, for now" reads slightly off in one breath.

Verdict: villagers act like people. No filler loops, no static menus, no fabricated shared history in the held sample.

**Mourning-witness watch (r254):** the mourning topic IS picked in sittings (`alive:event:mourning` pick ids present — 15 on 101955 alone), but no held convo captured a mourning sitting, so the r254 witness-variant lines got no transcript-level exercise this panel. The proof test (4 cases GREEN) carries it. **Dry beat watch (r241):** "The moment passes without landing" — 0 hits in held convos.

## Reachable / fun / winnable

- **Reachable:** yes. All five villages lived to d40, all the leg's systems fired (contests, moots, exiles, wave unlocks, bonds, killer tales, counter-learning). Nothing in the leg was unreachable.
- **Fun:** yes, with the usual caveats. The moot/case system produces lively, consequential text ("LIVE! THE MOOT! The fire's built HIGH and the whole GALAXY is watching!"), invitations are taken, gossip names real doings. The two LOST asks are the fun-dent: a villager with an urgent need sat with the player and never got to ask — that reads as the game ignoring a person, not as a person choosing silence.
- **Winnable:** the leg points the right way — 3/5 villages reached wave 4 with standing 100–135, and the standing ladder is visibly the thing that separates the wave-4 villages from the wave-3 ones. No wave-5 door question belongs to this leg. The binding wall remains downstream (deed gate opening, capstone delivery), per the endgame r230 picture.

## Metric review (for the NEXT run)

1. **BOWCRAFT watch revision.** The /bow/i telemetry-key scan cannot see bow crafting: bows exist as equipped gear (`crude_bow`, `bow`, `crossbow`) but crafting emits generic `weapon_craft`/`ammo_craft`/`craft` keys. Next run's watch should count bow items in the end-gear dump per seed (and compare against the r244 corpus, which also had them) — or the driver should log a bow-craft event when the duty fires. The turn-on's effect remains unmeasured.
2. **COUNTER comma-only rule validated.** 110 lines, 0 findings, long noun phrases correctly ok. The r244 revision stands; no further change.
3. **Q1 LOST mechanism sharpened.** Both LOST asks this panel are E1-via-case-thread: the case thread eats the sitting and the opener never runs. The class name (E1) hides the mechanism; the next run's analyzer could split E1 into E1-case (opener crowded out by a case thread) vs E1-plain. The fix proposal (opener gets one turn in a case sitting, or the case thread yields one pick to a u≥3 need) is owed to the goals arm.
4. **F2 scholar-death bar.** 4 deaths investigated as band noise with no new mechanism. The bar (≤2 WATCH / ≥3 investigate) worked as designed; no revision — but the haven-edge (4,4) last-dawn shape now appears on 3 panels running (r244 Domingo + r245 Paisley/Werner). If it recurs, it graduates from watch to a goals-arm question about whether the scholar should sleep inside the haven.
5. **Seed 101955 endDay-42 driver quirk.** The driver's day counter desynced (d40 dawn missing, d42 dawn doubled). Worth one look at the driver's day-advance loop before the next run; no bar impact this run.
6. **REACT watch:** max consecutive react 1 on this leg and on the r244 corpus — the watch may never fire on establishment. Keep it one more run (the r246 defect was a scale-leg shape); if it stays at 1, retire it for this leg and keep it on scale only.

## Proof tests (all re-run on the new base, worktree)

15/15 GREEN, 0 failures — log `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/r245-proof/proof-batch.log`:
walkHome 27/27, settled-help 19/19, stage0-help 13/13, stage0-cant 18/18, mood-goodbye 10/10, spotter 35/35, want-raise 7/7, clearhome 37/37, want-bridge r146 ALL GREEN, link-accept-voice 61/61, link-accept-rotation r148 ALL CHECKS PASS (3/3), maps-pools r147 ALL GREEN, counter-label 19/19, react-exhaustion r246 10/10, mourning multiwit r254 4 cases ALL GREEN.

## Analyzer fork proof

r245 analyzer vs r244 analyzer on the r244 corpus (10 seeds): diff shows ONLY intended changes (Q1/Q1c/Q5/Q3 comparison text; counter comma-only — 5 real labels, 0 em-dash, 196 ok vs old rule's 5 comma + 2 long-noun false positives + 1 heron length-only; REACT watch lines — panel max consecutive dlg:react 1 per seed, 0 sittings ≥3; BOWCRAFT watch lines — 0 bow-key events). All old-bar numbers reproduce exactly.

## Gate + telemetry

- Gate: **339 passed, 5 failed in 747s** (fresh re-run 13:22–13:35Z, `check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`). The 5 are exactly the standing set, 0 attributable: `test-measurement-proof-update.js` (stale balance-proof manifest), `test-measurement-workflow.js` (retained neutrality proof stale), `test-living-garden-deed-attainment.js` (120s timeout), `test-phone-frame-proof.js` (receipt stale), `test-one-person-army-deed-attainment.js` (120s timeout). NOTE: the first gate attempt (13:01–13:20Z) was killed by a VM restart at ~13:20Z (uptime 1 min at 13:21:46Z) with 8 F's in its partial log — load flakes from heavy concurrent work, discarded; the clean re-run on the quiet post-restart machine gives exactly 339/5. The restart also killed the heartbeat loop (PID 48818); it was re-established first (new PID 1812, setsid nohup, registry heartbeat landed 13:22:10Z) and write probes passed before the re-run; the worktree was verified intact (4 files, run note 21,117 bytes).
- Telemetry deviation check: ran 2026-11-20 ~13:00Z — 3 LOUD lines, all the KNOWN schema mismatch (baseline r132 BEFORE panel): `guardrails.deaths` 604 → 0, `guardrails.popAlive` 178 → 0, `guardrails.pantryKcal` 1,210,411 → 0 (n=5 files). The driver never emits `guardrails.*` fields, so the checker reads missing paths as 0 — expected per prereg, NOT a finding. `c3.starvationDeaths` produced no LOUD line. **Baseline NOT rolled** (prereg: never roll on a mismatch). No src/js change this run, so no guardrail move could be caused by this run's code anyway.

## Closeout

- No src/js change this run (2 defect findings proposed, not landed).
- Files to commit (worktree, via safe-commit.sh): prereg, this run note, `scripts/journey-establishment-r245-20261120.js`, `scripts/analyze-journey-establishment-r245-20261120.js`.
- Rotation: see header (read at closeout; write 1→2 only if the file reads 1).
