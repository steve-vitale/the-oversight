# sim-tablenat-a — table-waiting without a national day (axis scale-onramp, backlog "TABLE-WAITING WITHOUT A NATIONAL DAY")

Run: fleshout-20261026T1715Z, arm sim-tablenat-a. DIAG / MEASUREMENT ONLY — zero game-code change lands from this arm. If the cause turns out to be a game bug, it is documented here with a code pointer and a proposed fix — no game-code fix lands from this arm (a fix arm needs its own pre-registration).

Canon read first: docs/CANON.md, then docs/TABLE.md (the seat: full / lesser / none) and docs/MONSTER-WAVES.md for wave law. No canon doc covers the instrument keys themselves; the instrument definitions are read from the sweep/policy code, not invented.

## PRE-REGISTRATION (binding — judged only against this; written BEFORE any investigation sweep)

- Base commit at arm start: 7231f9272 (worktree tip; see "Base" below for the full log line). Base has moved since the 806ef430e band table, so RE-BASELINE FIRST.
- Instrument VERBATIM: scripts/test-rebaseline-sweep.js, tableseat-nowait substrate (LEANLINKRESCUE=1 + TABLESEATNOWAIT=1, seat legs only, 180d death-aware horizon), seeds 73671–73678, corpus under evidence/2026-10-26/perseed-sim-tablenat-a/ — NEVER overwriting perseed-sim-flip73676-a/ or any other run's corpus.
- Trace instrument: scripts/test-tablenat-a.js (new in this arm) — a daily snapshot trace of seed 73672 (and, if needed, band context) recording, per day: scaleRank, nationalLive, networkLive, globalLive, state.nationalDay, arc, tableWaiting, tableDone, tableAnnounced, integration stage, and the tableSeat() detail on the first waiting day. It prints to stdout and writes one trace file under perseed-sim-tablenat-a/; it does not write game code.
- Primary metric (DIAG): the cause of seed 73672's 806ef430e-band row (table=1, maxRank regional, ts={}) — named with a code pointer AND a reproducing row on current HEAD.
- DIAG-GO iff you name the cause with a code pointer AND a reproducing row — either:
  (a) INSTRUMENT: the table flag / nationalEver / tsNationalDay / maxRank keys disagree by definition (show the exact keys and where each is set); or
  (b) GAME-GATE: a gate that genuinely lets a regional village wait at the table (show the gate code and the transcript beat where 73672 passes it).
  A mixed verdict (e.g. game gate legitimate AND instrument naming overstates it) counts as DIAG-GO only if both halves are shown with code pointers and rows — the verdict line must say which half explains which field.
- FAILURE MODE (pre-declared): if 73672 on current HEAD no longer shows table-without-national, the verdict is "unreproduced on current base" — report the re-baselined table, do not force the old anomaly. Do NOT cite 73672 as a national-reach seed unless the cause proves it is national.
- METRIC BINDING (§14): no mid-run re-scoring against a friendlier metric. Metric doubts go under "metric review" for the NEXT run.
- BALANCED PANEL (§15): attempted as in prior arms; if scripts/balance-panel.js has no corpus-ingest mode, say so explicitly and attach the paired identical-seed table as the comparison of record — never fake a panel file.
## VERDICT: DIAG-GO — GAME-GATE cause (b), with the instrument half settled as NOT a disagreement

Seed 73672's table-without-national is NOT an instrument artifact and NOT a mislabeled national village. It is a regional village holding a legitimate lesser seat, exactly as the game designs it. The surprise in the backlog phrasing came from an unstated assumption — "waiting at the table implies national" — that the lesser seat explicitly rejects.

- The gate: `tableSeat()` in src/js/table.js — `scaleOk = rank === 'regional' || rank === 'national' || rank === 'global'`, and the lesser seat is `w1 >= 4 && w2 >= 4 && w3 >= 3 && contestsN >= 2 && crisesN >= 2 && scaleOk && stage >= 2 && foodDeeds`. Regional clears the scale bar. docs/TABLE.md §"The seat" says the same in words: the lesser seat is the reachable bar for competent non-god play, "scale ≥ regional", and Steve 2026-10-11 ("the table prices the run, never gates on godhood") supersedes the national-only bar for the lesser seat only.
- The invitation: src/js/progression.js `checkArc()` — when the Arc IV want-gate fires and `tableSeat()` returns full or lesser, `pg.tableWaiting = true` (and `arcBeat(4)` sets it again). Waiting means INVITED, not seated. Seated is `tableDone`, set only when the seat is actually taken (src/js/table.js `tableTakeSeat()` → `tableScene()`). The sweep's `entered` flag is that seated flag — and 73672's is 0.
- Why 73672 never sits even though it waits: the tableseat-nowait policy drives the seat ONLY at rank >= 2 (scripts/policies/tableseat-nowait.js: `if (!pg0.tableDone && tsRankOrder(Game) >= 2)`), and the game itself requires the player to take the seat from Haven (src/js/table.js `tablePreview()` / `tableTakeSeat()`; ledger.js endDay only calls `tableAnnounce()`, never sits the village). A regional waiting village under this policy is never driven to sit — by the arm's design, not by a bug. It waits, correctly, for 119 days.
- The instrument half, settled NEGATIVE (keys agree, they do not disagree):
  - `table` (sweep, test-rebaseline-sweep.js) = `hist.everTable || end.tableWaiting` — any day's `progState().tableWaiting`. An invitation-ever flag, not a sitting flag and not a national flag.
  - `nationalEver` = `maxRank >= 2` where maxRank tracks `Game.scaleRank()` daily (hierarchy.js: globalLive > nationalLive > networkLive, else village). 73672's maxRank is regional (1), so nationalEver = 0 — correct.
  - `tsNationalDay` is NOT a game field at all. It is policy context in tableseat-nowait.js, set only on a day the policy daily sees `scaleRank >= 2` (national or global — the name is a misnomer; it should read "first national-or-better day seen by the policy"). A village that never reaches rank >= 2 has `ts = {}` BY CONSTRUCTION. It cannot disagree with the game because it never reads a game national field.
  - `state.nationalDay` (the real game stamp, hierarchy.js court-sitting beat: `this.state.nationalDay = day` when the court sat) is 0 on every traced day, and `nationalLive` is false on every traced day — consistent with regional, not a missing stamp.
  - So: table=1 (invited, lesser, regional) + nationalEver=0 + ts={} + state.nationalDay=0 are four mutually consistent readings. Nothing is mislabeled. Do NOT cite 73672 as a national-reach seed — it is a REGIONAL-REACH, lesser-seat seed, and that is the correct citation.
- Precedent (not the proof, but corroboration): journey-scale r40, seed 85004, "reaches lesser d152 at regional, never national" (evidence/2026-10-26/journey-scale-r40.md). 73672 is the same shape on a different band.

DIAG-GO is met under clause (b): the gate code is shown above and the transcript beat where 73672 passes it is day 61 (Arc IV, see "Trace" and "Sense-test"). No game-code fix is proposed because there is no game bug to fix. Two naming debts are documented, not fixed (DIAG scope): (1) `tsNationalDay` should be renamed (it means national-or-global, and it is policy ctx, not a game day); (2) evidence shorthand "table-waiting" should always say "invited (waiting), not seated" when entered=0, because the sweep's `table` flag alone invites exactly the misreading this arm was asked to resolve.

## BASE (re-baseline first, as tasked)

- Arm base: 7231f9272 — "journey crisis r52 (lane B): endure-then-sortie — waiting costs 2x the march, still clears; instrument only" (2026-10-26 17:12 UTC).
- Engine delta 806ef430e..7231f9272: ZERO src/js, src/data, and scripts/policies diff (8 commits, 128 files, all evidence/scripts). Prediction: the band reproduces the 806ef430e table exactly. Result: CONFIRMED — 8/8 seeds identical on all 16 compared fields (days, gameDays, endReason, won, waveReach, maxArc, finalRank, maxRank, nationalEver, nationalFinal, table, entered, deathTotal, starvationDeaths, ts, finalPop, finalPantry). Base delta vs the 806ef430e table: 0 on every headline number (see "Re-baseline band").
- Substrate digests unchanged from the flip arm's report (competent / leanlinkrescue / tableseat-nowait / sweep digests as recorded there); the sweep script was used VERBATIM, zero edits. Det-gate was not re-run (substrate unchanged, script unchanged, and the flip arm's det-gate passed on the same engine — the engine diff above is empty, so there is nothing new for a det-gate to catch).

## RE-BASELINE BAND (base 7231f9272, tableseat-nowait, 180d death-aware, n = 8)

Corpus: evidence/2026-10-26/perseed-sim-tablenat-a/ (8 rows + summary.json, CORPUS PASS). Identical to the 806ef430e band on every field compared.

| seed | days | end | won | wave | arc | fin | mx | ne | nf | tab | ent | dth | stv |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 180 | survived | 0 | 4 | 3 | national | national | 1 | 1 | 0 | 0 | 48 | 0 |
| 73672 | 180 | survived | 0 | 4 | 4 | regional | regional | 0 | 0 | 1 | 0 | 51 | 0 |
| 73673 | 117 | village-lost | 0 | 4 | 3 | regional | national | 1 | 0 | 0 | 0 | 40 | 0 |
| 73674 | 166 | village-lost | 0 | 4 | 3 | global | global | 1 | 1 | 0 | 0 | 39 | 0 |
| 73675 | 180 | survived | 0 | 4 | 3 | global | global | 1 | 1 | 0 | 0 | 42 | 0 |
| 73676 | 144 | over-other | 1 | 4 | 4 | national | national | 1 | 1 | 1 | 1 | 43 | 0 |
| 73677 | 140 | over-other | 1 | 3 | 4 | national | national | 1 | 1 | 1 | 1 | 37 | 0 |
| 73678 | 104 | village-lost | 0 | 3 | 3 | regional | regional | 0 | 0 | 0 | 0 | 38 | 1 |

Band: wins 2/8, national-ever 6/8, national-final 5/8, table waiting 3/8, entered 2/8, wave-3 8/8, wave-4 6/8, wave-5 0/8, median 166d, max 180d, deaths 338, starvation 1, raids 110, raiders 469, pool 1,719, poolW3 263. Nonworldkill: 207 initiations, 0 unclassified.

- The table-without-national pattern occurs on EXACTLY ONE band seed: 73672. The other two table seeds (73676, 73677) are national and entered. No other seed shows the pattern.
- The reverse pattern also occurs and is consistent: 73673 reached national (tsNationalDay 94, nationalEver 1) then fell back to regional at death (nationalFinal 0, table 0). Ever-flags and final flags are different facts; 73672's ever-flags simply never rose.
- Four-realm formation (a polity of 4+ fires) is NOT measured by this instrument — it records scaleRank only, not polity membership. Not claimed here.

## REPRODUCING ROW — seed 73672 (current HEAD 7231f9272)

Sweep row (perseed-sim-tablenat-a/s73672-rebaseline.json): 180d, gameDays 180, survived, won 0, wave 4, arc 4, finalRank regional, maxRank regional, nationalEver 0, nationalFinal 0, table 1, entered 0, deaths 51, starvation 0, ts {}, finalPop 4, finalPantry 0. Death map: villager combat 23, villager combat (player-side label) 12, arena 8, ambush 2, expedition 2, wound 2, monster 1, Moderator 1.

Trace row (scripts/test-tablenat-a.js, perseed-sim-tablenat-a/s73672-tablenat-trace.json, TRACE PASS): ranks seen {village, regional} only; one rank change (day 47: village → regional); nationalLive ever false; state.nationalDay ever 0; tableDone ever false; ts {}; waiting days 119 (day 62 snapshot through day 180, continuous — never withdrawn, never seated); end seat lesser.

## TRACE — 73672's table approach, day by day

- Day 46 (spoken): "Three weeks of knowing Emberhold — and now it's real. Haven is regional." Day 47 (snapshot): scaleRank village → regional. The village becomes a region by bonding, not by conquest — the networkLive flag, not a court.
- Day 61 (spoken, Arc IV beat): "◈ ARC IV — THE INEFFICIENCY. SYSTEM: 'ROUNDING ERROR RECLASSIFIED: ANOMALY. Organic consumption yields impossible output. Recalculating. Recalculating.' — They finally see it. The thing they laughed at — needing to EAT — is the engine..." The lesser-seat line in the beat (progression.js arcBeat(4)) names the seat as priced for what was built, not a full seat.
- Day 62 (snapshot, first waiting day): rank regional, arc 4, stage 3, tableWaiting true, tableDone false, tableAnnounced false. `tableSeat()` on that day: LESSER, detail { w1: 16, w2: 7, w3: 3, w4: 0, w5: 0, contestsN: 5, crisesN: 3, rank: regional, stage: 3, foodDeeds: true }. Every lesser bar is cleared with room (4/4/3 needed on waves; 2 contests, 2 crises needed; stage >= 2; food deeds done). This is the beat where 73672 passes the gate — a regional village, on deeds, not on territory.
- Day 75 onward: villagers talk about the table by the fire (see Sense-test). The fireside talk starts BEFORE the formal announcement — the conversation system sees tableWaiting directly (convoTopics.js tableEv phase 'waiting'), while the System's formal announce waits for the day-90 floor.
- Day 90 (spoken, formal announce): "◈ THE TABLE IS SET. A ring of pale light waits — take your seat from Haven when you are ready. Nothing is final until you sit." (table.js tableAnnounce, via ledger.js endDay: waiting + !done + systemArrived + day >= 90.) The announce names no seat kind and no nation — it invites sitting, it does not claim national standing.
- Day 91: the fusion-reactor pellet goes in ("You will never be hungry again. ... It does not come out.") — the village that just got its table invitation stops needing food, on the very next dawn. Noted as story irony, not a bug claim (the pellet-vs-table tension is already a Steve call from r39/r40, not re-litigated here).
- Day 98 (spoken, wave-4 beat): "SYSTEM: 'Four waves. FOUR. The producers are — okay, I'm saying it: FINALES need a NATION. You've got a region; now make it a REALM. Bind fires under one head, or bend the knee to someone who has.'" Read carefully: this is the System pushing the village TOWARD national for the finale — it does not retract the lesser invitation, and the village never answers it (no rank change after day 47). The two voices coexist: an open lesser door, and a prod to earn a bigger one. Calling this a contradiction would misread it — but the line is exactly why a reader could feel the table "should" need a nation. It does not, for the lesser seat.
- Days 62–180: waiting, continuous, 119 snapshot days. Final state: 4 people alive, pantry 0, regional, lesser seat still open, never seated, never national. The village survives the horizon still waiting — the invitation outlived the village's strength, which is the honest shape of "the table waits" for a village that never grows past regional.

## SENSE-TEST (plain words)

Read as a story, 73672 is a regional village that earned a lesser seat the honest way — it fought widely (16 wave-1, 7 wave-2, 3 wave-3 distinct monsters faced), survived 5 contests and 3 crises, learned to feast, and bound itself into a region. The System notices on day 61, announces the table on day 90, and then... nothing happens, because nobody ever sits. That reads right for this policy: the invitation is real, the sitting is a choice the policy never makes at regional, and the village is too small and too tired (4 people, empty pantry at the end) to grow into a nation. It is NOT a national village mislabeled — nothing in its story ever claims a court, a crown, or a nation. It is a regional village with an open door it never walks through, and the 119 waiting days are the story, not an error.

What reads robotic, and is documented here (not fixed — outside this DIAG arm's scope): the fireside table talk is ONE canned line, repeated verbatim by four different speakers over 80 days — Gustavo to Dale (days 75, 80), Ingrid to Gustavo (84), Aria to Ingrid (91), Ingrid to Petra (114), Khalil to Ingrid (154): "The table's set. The ring of pale light — it's just sitting there. Waiting on them. What do you think they'll tell it?" Villagers who know about the table is good; every villager saying the identical sentence about it for three months is not people talking, it is a loop. The village's real situation (pantry empty, reactor pellet, the System's day-98 prod) never enters their table talk. Carried as a findings-line observation, not a fix.

Villager behavior beyond the table, sampled from the same trace: the village courts (regional day 46–47), feasts (feasted ×2.53 lines, Arc IV burns hotter), and keeps talking by the fire while its pantry empties — goals and routines are visible in the transcript, not just the counts. No villager is recorded doing something incoherent with the table (no dead teacher, no seated-while-regional claim, no national claim).

## VILLAGE ASSESSMENT (plain words)

Eight villages on current HEAD, same shape as the 806ef430e band (it IS that band, re-run): three survive 180 days without winning (73671, 73672, 73675), three are lost (73673, 73674, 73678), two win through the table (73676 day 144, 73677 day 140, both lesser seat, feared path, national). Deaths are heavy everywhere (37–51 per village) and combat-dominated band-wide (villager combat 132, villager-vs-villager combat 94, arena 47 of 338 deaths; starvation 1) — villages die to the world, not to hunger, on this band. Wave 4 reaches six seeds, wave 5 none: the late game is reached, not finished. The wall stands: national-ever 6/8 but table-entered only 2/8, wins only through the default-OFF tableseat-nowait lesser seat, full seat unreached, wave 5 unborn. 73672 does not move the wall — it re-labels one of its waiting seats correctly as regional, which if anything makes the wall look steeper (one of the three "table" villages never even reached national).

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

- No pre-registered leg was re-scored mid-run. The pre-registered failure mode (unreproduced on current base) did NOT fire: 73672 reproduces exactly. The verdict is judged against the pre-registered DIAG-GO bar (cause + code pointer + reproducing row, clause (b)) and meets it; the instrument half is reported as settled-negative rather than forced into clause (a), which would have been a misclaim.
- One instrument-filter error of my own, caught and fixed before judging: the first trace run's transcript filter searched for "the ring of pale light" and missed the day-90 announce line, which says "A ring of pale light waits". The filter was corrected (TABLE IS SET / ring of pale light, no article) and the trace re-run; the re-run reproduces the same trace PASS and adds the day-90 announce. Recorded so the next run does not re-learn the article trap. No verdict turned on the first run's filter — the seat/rank/waiting facts were identical in both runs.
- BALANCED PANEL (§15): ATTEMPTED AND NOT APPLICABLE — stated explicitly. scripts/balance-panel.js compare mode requires panel.json.gz pairs generated by its own observer (`compare --before <panel.json.gz> --after <panel.json.gz>`); it has no recorder-corpus ingest mode. No panel file is produced or faked; the paired identical-seed tables in this file (same 8 seeds, same substrate, same horizon, two bases with an empty engine diff — here, identical) are the comparison of record. Same recorder-corpus limitation prior arms reported.
- Telemetry-check was NOT run on recorder rows (its counts are wrong on recorder rows — standing instruction from the 0158Z evidence, same as the flip arm).
- check.js --quick NOT run: zero src/js diff in this tree (DIAG arm, one new script only) and sibling loops are live (its result would be unattributable); the arm's own proof is the verbatim sweep (CORPUS PASS) + the trace PASS (twice, with the corrected filter). node --check clean on scripts/test-tablenat-a.js.
- The backlog line "TABLE-WAITING WITHOUT A NATIONAL DAY" should be flipped to fixed on merge of this arm (the resolution is in this file); the coordinator owns that flip. A separate findings line is appended for the canned fireside table line (see "Blanks").

## PROOF SCRIPTS (all in this tree, all run)

- scripts/test-rebaseline-sweep.js — used VERBATIM, zero edits. Band CORPUS PASS (summary.json in perseed-sim-tablenat-a/).
- scripts/test-tablenat-a.js — NEW in this arm. Daily rank/national/table/stage snapshot + first-waiting-day tableSeat() capture + say/emit transcript capture (journey-arm method, read-only, no RNG). Run twice on seed 73672 (filter correction between runs): both TRACE PASS — regional-only, waiting-ever (119d), never entered, never national, ts empty, first-waiting seat lesser with the detail quoted above. node --check clean.
- Per-seed identity proof (ad-hoc, not a committed script): 8/8 seeds identical to the flip corpus on 16 trajectory fields (see "Base").

## INFRASTRUCTURE (loud, as required)

- No EPERM flap hit this run: all node/shell disk writes succeeded (band rows, summary, trace files twice, evidence file). No stdout-only fallback was needed.
- No safe-commit refusal, no merge conflict (worker does not merge — coordinator owns --ff-only merge).
- Files for commit (worktree ~/workspace/worktrees/sim-tablenat-a): evidence/2026-10-26/sim-tablenat-a.md (this file), evidence/2026-10-26/perseed-sim-tablenat-a/ (8 rows + summary.json + s73672-tablenat-trace.json), scripts/test-tablenat-a.js. Zero src/js diff. No other untracked files in the worktree (verified by git status at close — see "Tree state" in the final report).

## BLANKS FILLED OR DOCUMENTED

- FILLED (backlog "TABLE-WAITING WITHOUT A NATIONAL DAY"): the cause is the lesser seat's regional bar (table.js tableSeat, scaleOk includes regional) + the waiting/seated distinction (tableWaiting = invited, tableDone = seated) + the policy's national+ seat-drive gate. 73672 is a regional lesser-seat village, not a national village and not an artifact. Correct citation from now on: "73672: regional, lesser seat, waiting, never entered."
- DOCUMENTED, NOT FIXED (naming debts, no game change): (1) rename `tsNationalDay` (policy ctx, national-or-global, not a game day); (2) evidence shorthand must say "invited (waiting), not seated" when entered=0.
- DOCUMENTED, NOT FIXED (sense-test observation): the fireside table line is one canned sentence repeated verbatim by multiple speakers over ~80 days — dialogue-variety blank for a future arm, not chased here.
- DOCUMENTED, NOT FIXED (story tension, already a Steve call elsewhere): day-98 "FINALES need a NATION" prod coexists with the open lesser invitation; day-91 reactor pellet lands the day after the formal table announce. Neither is re-litigated here.
- NOT A FINDING: no game bug was found in the table/national/rank keys. A fix arm for this backlog item would be fixing something that is not broken — do not spawn one.

Convergence state: scale-onramp stays converging (NOT converged): wave 5 is unborn on this band, wins come only through the default-OFF tableseat-nowait lesser seat, and one of the three waiting villages never reached national at all. The wall stands; this arm re-labels one of its bricks correctly.

