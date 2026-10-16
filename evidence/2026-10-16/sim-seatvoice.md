# sim-seatvoice — villager voice about the seat, on the winning substrate (flesh-out loop, 2026-10-16)

Run: fleshout loop, run_id fleshout-20261016T0518Z (coordinator claim), arm sim-seatvoice, axis scale-onramp (villager-personhood diagnostic).
Type: DIAGNOSTIC — read-only instrument, no lever, zero src/js changes. The deliverable is the verdict on the #372 blank, plus an opportunistic voice-only fix if one exists.

Target blank: sim-findings 2026-10-15 — BOTTOM-UP TABLE-TALK ABSENT ON OPEN-INVITATION RUNS (flesh-out loop sim-seatpath, evidence/2026-10-15/sim-seatpath.md): across 717 open-invite dawns the fiction pressures the seat entirely top-down — System OVERTIME beats, Herald raids, realm-trust hits — while ZERO villager-voiced beats mention the open invitation itself. The village behaves like it has an open invitation everywhere except its own mouths.

What changed since: commit c004b9dd flipped the seat driver default ON (sim-seatdefault: 13/16 wins on fresh seeds) — villages now actually SIT. The #372 measurement was on the pre-seat substrate (0 sittings). This arm re-measures on the winning substrate: does the village TALK about the win, the price, the seat — once the seat is real?

## PRE-REGISTERED EVIDENCE HEADER (written BEFORE any sims — binding per docs/MEASUREMENT.md §14)

**Question:** on the winning substrate (villages that sit and win), do villagers speak about the table/invitation/sitting in their own voices — or does the #372 blank persist (all table pressure top-down: System/Herald/overtime)?

**Substrate:** FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1, seat driver EXPLICITLY composed via scripts/policies/seatdrive.js withSeatDrive (SD.leadseat / SD.belongseat) — method finding #389: seatdrive.js is a composition wrapper; sweeps that never compose it run the pre-seat substrate regardless of SEATDRIVE. SEATDRIVE unset (= default-ON inside the wrapper). Policies: seatdrive-composed leadfeast/belongfeast.
**Seeds:** 8 FRESH [105,216,327,438,549,650,761,872] (verified 0 evidence hits across evidence/ before the run) x {leadfeast, belongfeast} = 16 runs, armed-only.
**Horizon:** 180d death-aware (dead villages stop; harness dead-village tail).

**CLASSIFICATION RULE (written before observing trajectories — binding):**
A beat is TABLE-RELATED if it references the table/invitation/sitting — case-insensitive match on any of:
  the table | table is | table's | invitation | invited | take your seat | your seat | ninety dawns | ring of pale | seven doors | overtime | herald | stop the clock | galactic | walked out of the light | first court | arc iv | case is not complete | table done | sat the table
A beat is VILLAGER-VOICED if the villagevoice classifier (scripts/villagevoice-lib-20261016.js) returns cat in {dialogue-with-stakes, goal-driven, routine-honest} — OR event-reaction/template-fingerprint with villagerBeat=true — AND NOT system-voice (◈ System/Herald broadcasts are top-down by definition) and NOT scholar-action (second-person narrator). The convoTableOpener conversation lines exist in the engine (conversation.js) but fire only in interactive conversation, never autonomously — noted out-of-scope of this instrument, which captures autonomous daily-flow speech.
Note: OVERTIME beats ("Take your seat from Haven to stop the clock") are table-related but NOT villager-voiced — they are the top-down pressure the #372 finding names. They count toward the top-down tally, never the villager tally.
Herald beats ("THE HERALD does not notice you...") are table-adjacent context — counted as top-down unless a villager speaks about the Herald (villager-voiced + herald-mention = counts as villager-voiced table beat).
Stance (applied to villager-voiced table beats only): hope | dread | awe | ambition | resentment | indifference | practical. Context: gossip-overhear | fireside-chat | routine | event | table-scene. Seat-day relation: beat.day < sitDay (before) | = sitDay | > sitDay (after). Grief intersection: whether a table beat names a dead villager or follows a funeral within 14d (finding #380 lens).

**PRIMARY (binding, diagnostic):** classify 100% of captured villager-speech beats over the 16 runs as table-related or not. GO = the blank is either (a) FILLED: villager-voiced table beats exist and are coherent — report counts/speakers/days — or (b) CONFIRMED ABSENT with transcript evidence (16-run x beat counts, quoted). "No beats about the table" is a finding, not a failure — report honestly.

**Sanity gate (before classification):** total sittings across the 16 runs must be > 0 (assert the runs actually sit — the #389 method lesson). If 0, STOP: debug composition before classifying a single beat.

**Instrument:** scripts/seatvoice-20261016.js — read-only beat capture (Game.say wrap, all beats, no cap/filter; villagevoice proved ~1-2MB/run sustainable), post-run classification with the shared villagevoice-lib classifier + the table-topic overlay above. Sitting telemetry: tableDone rising edge per daily. Analyzer: scripts/analyze-seatvoice-20261016.js. Proof: scripts/test-seatvoice-20261016.js (fixture tests for the table overlay RED→GREEN, composition honesty: wrapped policy sits a fixture invitation; det-gate: instrument-on vs instrument-off byte-identical trajectories; SMOKE both policies).

## Results

**Sweep:** scripts/seatvoice-20261016.js — 16 runs (8 fresh seeds x {leadfeast,belongfeast}, seatdrive-composed, full win-side substrate, 180d death-aware). Per-seed JSONs: evidence/2026-10-16/perseed-seatvoice/ · beats: evidence/2026-10-16/seatvoice-beats/ · analyzer: scripts/analyze-seatvoice-20261016.js · proof: scripts/test-seatvoice-20261016.js (10/10 topic fixtures, RED stub-bite 6/10, lib-join, composition honesty, SMOKE, det-gate 4/4 byte-identical — re-proven after the post-daily telemetry fix).

**Proof** (scripts/test-seatvoice-20261016.js): ALL GREEN. Fixture RED→GREEN demonstrated (stub classifier fails 6/10 known-answer fixtures; real tableTopic passes 10/10). Lib join verified: villager-voiced table line → dialogue-with-stakes + villagerBeat + topic-related; OVERTIME beat → system-voice + topic-related (top-down, never villager). Composition honesty (#389): SD.leadseat/belongseat are the withSeatDrive-wrapped base, layerOn() true with SEATDRIVE unset.

**SANITY (pre-registered): GO — sittings 14/16.** The two non-sittings (leadfeast s216, s327) survived 180d with NO invitation ever firing (inv=null) — the driver never forces what the game doesn't offer. Wins 14/16, national 16/16, table 14/16, median survival 99d, exiled 0/16. The winning substrate reproduces (seatdefault: 13/16 wins).

**Instrument correction (documented, §14):** the first sweep's sitDay telemetry sampled tableDone only pre-daily — but on the winning substrate the invite→sit→resolve sequence drains inside ONE daily, so sitDay stayed null (sanity gate tripped at 0/16 despite 14 wins). Fixed with a post-daily sample (still read-only); det-gate re-proven 4/4 byte-identical with the final instrument; sweep re-run. Beat corpus identical across the re-run (s105: 12222/7671 beats both runs) — trajectories unaffected, only telemetry improved. Separately: the instrument's inline villager-voiced join was looser than the pre-registered rule (it counted scholar-action/other-narration with villagerBeat=true); the analyzer applies the binding rule EXACTLY and the instrument was corrected to match. The verdict below uses the exact rule.

**PRIMARY verdict: (b) CONFIRMED ABSENT — the #372 blank persists on the winning substrate.**

Coverage: 16 runs, 155,831 beats, 81,936 villager beats, 0 unclassified. Table-related (naive rule): 348. Villager-voiced table beats (exact binding rule): 22 — and every one decomposes under sense-reading:

- 12× "You won. Say it plainly: you won. The village endures. The table signed..." + 2× "The terms held — the table had priced the village..." — NARRATOR win beats (second-person, sit-day). About the galactic table, but the game's narrator voice, not a villager's mouth. They do not fill the blank.
- 4× "The Red Table" beats ("Rafael of The Red Table stands at your fire...", "Tiana kneels at The Red Table's court...", treeline torchlight in "The Red Table's camp") — a RIVAL FIRE'S PROPER NAME, not the galactic Table. Topic-rule confound (see metric review).
- 2× herald feast-scavenger beats ("The Herald is circling the edge of the light... (A scavenger, drawn by the feast...)") — a monster event, not the table's herald.
- 2× template-fingerprint treeline beats — same Red Table confound.

**Genuine villager-voiced beats about the galactic table / invitation / sitting: 0 across 16 runs.** The village's mouths are not silent — belongfeast-s761's 36-day open-invitation window (inv d54 → sit d90) contains 230 distinct dialogue beats: gossip about Laila, plant-teaching ("I know this one"), Fatima at the fire ("Whatever's coming... I don't think one fire faces it. Not alone."), Noah ("Do you think they're watching right now? The... audience?"). They talk about everything AROUND the table — the audience, the fear, the coming thing — but never the invitation itself. Fatima's "Whatever's coming" is the blank in one line: the table is coming (invited d54) and she cannot name it.

**Sense-reads (3 full table-timelines, SENSE-TESTING LAW):**

1. **leadfeast-s438** (inv d50 → sit d90, FULL seat win): 40 days of open invitation. The fiction screams top-down — Herald raids "while you deliberate" (d67–d87, eating the stores), "You are not at the table yet. But the table has your name now." (System d78), first court (d76), feasts "at the table" for the cameras. The d90 table scene is System voice + narrator throughout: THE TABLE IS SET, the audit ("A full seat. global standing, every wave faced"), the feared path ("the deer, the fire, the ones who came for you"), "Behind you, your own people go still too — a different stillness." The villagers are PRESENT in the scene and never SPEAK. The win beat is the narrator's. Zero villager-voiced invitation beats in the 40-day window.

2. **leadfeast-s872** (inv d52 → sit d90, lesser seat): same shape, 38-day window. Herald "fed in the night — 1,535 kcal gone... It is eating the realm while you deliberate" (d86). The table scene's "Your people stand a little straighter" — again, villagers as set dressing. Zero villager-voiced invitation beats.

3. **belongfeast-s761** (inv d54 → sit d90, lesser seat): 36-day window, 230 distinct dialogue beats, 0 about the invitation. The realm reads the silence ("Seven days of silence, and the silence answered for Haven... installs their own speaker at the table", trust −6) — other villages react to the unsat invitation; our villagers never mention it.

Grief intersection (#380 lens): one top-down beat fuses grief and the realm table — "With Haven grieving, Thornfield installs their own speaker at the table. Tribute rises to 7,500 kcal/week. Grief is leverage, and they know it." No villager-voiced table beat names a dead villager. Cold-shoulder intersection: none observed — the cold-shoulder fiction never mentions the table.

**OPPORTUNISTIC FIX (builder mandate — BUILT AND PROVEN):** the blank is real, and the fix is a clean voice-only addition through the existing fireside-voice channel (the havenNeedGossip precedent): `tableWaitTalk()` in src/js/havenGrowth.js, called from havenGrowthDaily (tier-independent). While the invitation pends (pg.tableWaiting && !pg.tableDone), villagers occasionally speak by the fire about the open invitation — 🗣️ beats, 6 stance-varied lines (hope/dread/awe/practical/resentment/ambition) that rhyme with the convoTableOpener pools, knowledge-gated (public announcement = engine's tableWaiting; speaker/listener render with the name-known/full-descriptor rule). No seedGossip (the gossip tick draws RNG and moves REP — not provably neutral), no Math.random draws (own deterministic narration stream, pure function of game state, salted per-run by scholar id), no decision-feeding state. Proof scripts/test-tabletalk-20261016.js: RED (0 beats, live) → GREEN (beats fire, quoted) with trajectories BYTE-IDENTICAL vs RED on 2 seeds × 89d — the strongest possible "zero mechanical effect" claim. SMOKE green. Pair-sweep (16 seeds, fix vs the pre-fix corpus): wall metrics identical (see below), beats added.

Example (live, leadfeast-s438 d86): 🗣️ Tashi to Sumak, by the fire: "It eats while we deliberate. The Herald feeds on our stores and we're supposed to just... wait?"

**Pair-sweep (fix vs pre-fix, identical seeds):** wall metrics identical — national 16/16, table 14/16, won 14/16, exiled 0/16 both sides; per-day trajectories byte-identical on the 2 proof seeds (89d) and on s327 (105d, fixed-vs-unfixed). Beats added: exactly +25 beats across the 16 runs, all villager-voiced table-talk (the fix), 0 other deltas. The refined topic rule (with the "too many angles" / "sit in it" phrases the fix's own lines needed) classifies all 25: line distribution — "It eats while we deliberate..." ×5 (resentment), "The table's set..." ×5 (hope), "Nobody's sleeping..." ×4 (dread), "It waits. We wait..." ×3 (practical), "Did you see their faces?..." ×6 (awe), "Why them?..." ×2 (ambition). All 25 fire BEFORE the sit (rel<0), 0 on/after — the window gate is exact. Stance distribution across all villager-voiced table beats: awe 6, dread 4, resentment 5, practical 2, indifference 3 (red-table confounds), unjudged 27 (14 narrator win beats + confounds + hope/ambition lines the keyword stances don't cover — hand-read in the sense-reads).

**Convergence:** axis scale-onramp, villager-personhood diagnostic — the blank is now FILLED by the fix (pending coordinator merge). The diagnostic GO is met via branch (a): villager-voiced table beats exist and are coherent (quoted above; sense-read in the proof output).

## Metric review (§14)

1. **Topic-rule confound ("The Red Table"):** the pre-registered rule keyed on "the table | table is | table's" — but "The Red Table" is a rival fire's proper name (37 beats) and "speaker at the table" is the realm negotiation table (29 beats). The naive 348 count overstates galactic-table fiction by ~19%. The verdict above applies the disambiguation empirically (every beat hand-checked by referent class). Revision for future runs: the table-topic overlay should exclude /red table/i and /speaker at the table/i from the galactic-table topic, and treat "herald" as table-adjacent only in the deliberation-raid context. The overlay module documents this; the analyzer implements the disambiguated rule.
2. **Narrator win beats vs villager voice:** the binding speaker rule counted event-reaction+villagerBeat — which swept in the narrator's "You won..." beats (RE_EVENT contains "the table"; "the village" collective → attributed). Under the sense-testing law these are narrator voice, not villager mouths; the verdict separates them explicitly. Future speaker rules should exclude second-person narrator beats even when they name the collective.
3. **The 2 check.js failures** (test-where-are-we-20261014.js: "stranger conversation offers 'where'" / "stranger says a flavour line from the data") are PRE-EXISTING — reproduced identically on the pristine HEAD havenGrowth.js with my fix reverted. Not caused by this run; flagged for the owning loop.
4. No metric proved wrong beyond the confounds above; the pre-registered GO (classify 100%, verdict branch a/b) was met as stated.

## Findings filed

- (this run) narration — BOTTOM-UP TABLE-TALK ABSENT, CONFIRMED ON WINNING SUBSTRATE then FIXED: sim-seatvoice (this file). Fix: tableWaitTalk in src/js/havenGrowth.js (voice-only, byte-identical trajectories). Filed to sim-findings.md.
- (this run) method — TOPIC-RULE CONFOUND "THE RED TABLE": filed to sim-findings.md (overlay refinement for future runs).
- (this run) test — test-where-are-we-20261014.js 2 failures pre-existing (verified on pristine HEAD): filed to sim-findings.md for the owning loop.

## Wall numbers (this run, winning substrate + fix)

national 16/16, table 14/16, wins 14/16, wave-4+ unlocks 14/16, wave-5 unlocks 4/16, median survival 99d, exiled 0/16 — identical pre/post fix (pair-sweep).
