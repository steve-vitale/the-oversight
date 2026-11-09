# sim-sitgap-winseek-b — the winseek reached-but-never-sat arm (DIAG, zero src/js)

**Arm:** sim-sitgap-winseek-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T0330Z (Loop B, arm 1 of 3) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-sitgap-winseek-b (base master `9d5fe8ab6`) · **Prereg:** `evidence/2026-11-08/sim-sitgap-winseek-b-prereg.md` (committed before any judged computation; no corrections after) · **Instrument:** DIAG recorder (`scripts/recorder-sitgap-20261108.js`, read-only) + the 53007 DIAG recorder on the sitstep instrument, winseek policy leg, 150d death-aware, frozen band 53001–53008. Corpora committed under `evidence/2026-11-08/perseed-sitgap-winseek-b/` (armed, 8 seeds) and `evidence/2026-11-08/perseed-sitgap-winseek-b-unrec/` (unrecorded controls, 53008 + 53004). Proof `scripts/test-sitgap-winseek-b.js` **49/49 green, 0 failed, 0 skipped**.

## Verdict: DIAG-GO

**The question as asked is answered, and the answer splits the band in two.** On current master, under winseek play, **0 of 8 villages sit** — and the blocker is two different things, not one:

- **3 seeds are offered-not-taken in the purest form the instrument can show.** 53001, 53002 and 53007 reach day 90 alive with a lesser seat priced, the table is announced ("THE TABLE IS SET. A ring of pale light waits — take your seat from Haven when you are ready"), and the preview sits ready for 27, 25 and 6 days with the scholar **at Haven on every single ready day** (27/27, 25/25, 6/6), zero entry blocks on ready days, zero away days — and the seat is never taken, because **no sit drive runs under winseek at all**. Zero `tableTakeSeat` calls, zero `chooseTableOption` calls, zero takeseat skip reasons (the diffs are empty by construction). The scholar stands at Haven with a ready seat for a month and does nothing. That is the winseek blocker, named with evidence.
- **5 seeds never get the chance.** 53003, 53004, 53005, 53006 and 53008 all price a lesser seat weeks before they die (seat lesser from d33–d55, Arc IV fired d34–d56) — and all five die before the day-90 floor, so the preview never exists and the table is never announced. The day-90 floor is the whole blocker for this half of the band.

**Status of the bars:** (1) classification coverage 8/8 with named mechanisms — MET. (2) The winseek blocker named with evidence per seed — MET (ready window / day-90 floor / encounter block / away block / no-sit-drive, with the numbers at the decision point below). (3) G1 det-gate — PASS (proof 49/49). (4) G2 neutrality — PASS on 53008 and 53004 (armed == unrecorded, headline + daily rows + fallen + takeseatStats identical). (5) G3 corpus integrity — PASS 8/8. (6) Band roots re-verified — 8/8 CHANGED vs `perseed-sitgap-b/` (policy+master delta, named below), plus the same-policy comparison vs the flipsocial healed winseek panel rows. **All six bars met: DIAG-GO.**

## Per-seed classification table

| Seed | Days | End | Standing | maxWave | Seat | w4 | Class | Mechanism (one line) |
|---|---|---|---|---|---|---|---|---|
| 53001 | 119 | village-lost | 170 | 4 | — | 1 | offered-not-taken | Announced d90, lesser from d44, preview ready 27 days (d90–d118), scholar at Haven 27/27 ready days, no entry block — never sits: no sit drive runs under winseek. |
| 53002 | 122 | village-lost | 140 | 4 | — | 1 | offered-not-taken | Announced d90, lesser from d46, preview ready 25 days (d90–d114), scholar at Haven 25/25 ready days, no entry block — never sits: no sit drive runs under winseek. |
| 53003 | 68 | village-lost | 155 | 4 | — | 0 | reached-never-sat | Waiting from d36, seat lesser from d35, dies d69 — before the day-90 floor, so the preview never exists and the table is never announced. |
| 53004 | 59 | village-lost | 145 | 4 | — | 1 | reached-never-sat | Same shape: waiting from d39, seat lesser from d38, dies d60 — before the floor. |
| 53005 | 60 | village-lost | 45 | 3 | — | 0 | reached-never-sat | Waiting from d56, seat lesser from d55, dies d59 — before the floor; the weakest village on the band (standing 45, wave 3 only). |
| 53006 | 70 | village-lost | 165 | 4 | — | 0 | reached-never-sat | Waiting from d48, seat lesser from d47, dies d70 — before the floor. |
| 53007 | 93 | village-lost | 140 | 4 | — | 0 | offered-not-taken | Announced d90, lesser from d37, preview ready 6 days (d90–d95), scholar at Haven 6/6 ready days — dies d96 unseated: no sit drive runs under winseek. |
| 53008 | 79 | village-lost | 195 | 4 | — | 0 | reached-never-sat | Waiting from d34, seat lesser from d33, dies d80 — before the floor. |

**No seed in the band sits. No seed is offered-declined. No seed is never-offered.** The away-from-Haven block never fires anywhere in the band (0 away days across all 58 ready days) — the scholar is at Haven whenever the seat is ready. The encounter block fires only at the tail: 53001 d117 + d119 and 53002 d115 + d116 ("Finish the current encounter before taking your seat") — 2 days each, against 27 and 25 ready days. It is a footnote, not the blocker. No caveat flag fired on any seed (every seed's last daily row is its final game day — no unsnapshotted final day). No contradiction flag fired on any seed (0 seat-verb calls band-wide).

## The three that were offered and never sat — in plain words

**53001** is the purest offered-not-taken the instrument has ever shown. The lesser seat prices on d44 and Arc IV fires on d45. On d90 the village hears it aloud: "◈ THE TABLE IS SET. A ring of pale light waits — take your seat from Haven when you are ready. Nothing is final until you sit." The preview is ready on 27 of the next 29 days. The scholar (Luis Fernandez, alive throughout) is at Haven on all 27. The village is told twice more — overtime ×1 on d107: "Take your seat from Haven to stop the clock." The villagers talk about it by the fire (d59, Olivia to Mara: "It waits. We wait. Somebody should check the snares — the table doesn't fill the pantry."). And nobody sits, because nobody in the policy ever walks to the seat: winseek has no takeSeatDrive, and its tableRoad can only answer tableChoices prompts that never exist before a sit. The village ends d119 with one living person and an empty pantry (pantry 0 from d90, 3 hungry, wounded) — the seat was ready and the village starved beside it. 18 fallen, 11 of them "the wild".

**53002** is the same shape, 25 ready days. Announced d90, ready d90–d114, scholar at Haven 25/25. The fire talk repeats (d55 Ella to Grace, d112 Miriam to Ingrid: "The table's set. The ring of pale light — it's just sitting there. Waiting on them. What do you think they'll tell it?"). Overtime ×1 on d109 docks standing −7 and says "Take your seat from Haven to stop the clock." The village dies d117 with 19 fallen. The two encounter-blocked days (d115–d116) come at the very end, after 25 clean ready days — the block did not cost the seat; the missing drive did.

**53007** is the compressed version: announced d90, ready d90–d95 (6 days, scholar at Haven 6/6), and the village dies d96 with 2 living and pantry 0. Six days of a ready seat, then the end. 17 fallen. The Audit stirs repeatedly d72–d78 ("Something moves out there — The Audit") before the announcement — the village knew something was coming, and still never sat.

## The five that died before the floor

53003 (d69), 53004 (d60), 53005 (d59), 53006 (d70) and 53008 (d80) all reach Arc IV early — the seat prices lesser weeks before death — and all die before day 90, so `tablePreview()` is null on every waiting day. The day-90 floor (`winDayFloorOk`) is the whole blocker for this half: the villages know the table is there (53008's people talk about it by the fire from d78 in the panel's read; the same "waiting on them" line fires on 53002 d55, before its announcement), but the floor never opens. None of the five is one mechanic away from sitting: they are 10–31 days short of the floor, and the deaths that take them are the ordinary violence of the wild (fallen lists dominated by "the wild" — 53008: 0 wave-4 kills, standing 195, dies with the seat priced since d33). The ready-day caveat (a same-day ready-then-die seed misclassifying) does not apply to any of them: every seed's last daily row is its final game day, and no seed shows a ready day.

## What the winseek blocker is — and is not

- **It IS the missing sit drive.** Verified from code before the prereg and confirmed by zero seat-verb calls across 8 seeds × ~650 scholar-days: winseek extends base competent (never linkfeast), competent never calls `tableTakeSeat`, and winseek's `tableRoad` only answers `tableChoices` prompts that can never exist pre-sit. The mechanism for offered-not-taken is written from the snapshot fields (ready window, scholar location, entry block) plus that verified fact — not from skip reasons, because no skip ever fires. The classifier's own `classifyGate` names the shape per day: `offer-not-taken` = "preview ready; policy never called tableTakeSeat".
- **It is NOT the encounter block.** It fires on 4 days total across the band, all at the tail of the two long-window seeds.
- **It is NOT the away block.** 0/58 ready days away from Haven.
- **It is NOT a dipped seat.** No seed dips to none after announcement (no offered-declined anywhere); the sticky offer holds.
- **It is NOT the seat bar.** Every seed prices a lesser seat (53005 with standing 45, wave 3 only — the bar is met even by the weakest village).
- **The other half is NOT a seat defect at all.** Five villages die before day 90 with the seat priced — the floor, not the sitting, is their blocker. Under winseek the band's median death (75d) sits 15 days short of the floor.

## Village assessment — what the band's villages looked like

Eight villages, all lost, none surviving past 122 days. They are deed-seekers that die seeking: wave-4 unlocks on 7/8, wave-4 kills on 3 seeds (53001, 53002, 53004 — one each), standing 45–195, regional on all 8, national on none. The winseek policy does what it says — it hunts (patrols, engages, flees only near death), courts villages (links form; Emberhold's tribute rises to 7,500 then 11,250 kcal/week on 53001 as Haven grieves), answers beats — and it dies in the wild doing it: the fallen lists are dominated by "the wild" on every seed (53001: 11/18, 53002: 10/19, 53007: 9/17). The pantry is empty at the end on the three offered-not-taken seeds (53001: 0 from d90; 53007: 0 at the end; 53002: 0 except one 3,000 kcal day at d100). The pellet never appears as a holder in the sampled diag rows (pellet null on all checked days) — nothing to report there either way; the diag was not the question.

Nothing in the sampled dialogue reads robotic: the death lists cohere, the mourning beats land, the fire talk about the waiting table is in the villagers' own words and — pointedly — is *right*: the table IS sitting there waiting, and the policy's silence is the gap, not the villagers'. The fiction and the policy disagree, and the fiction is the honest one.

Two noise notes from the sense read (backlog, not verdict): the "Daughter's Drawing" keepsake line repeats verbatim on consecutive days (53001 d34–d37, the same long paragraph four days running), and The Algorithm's contest trailer floods a single day with ~40 repeated "Thumbnails" lines (53001 d63). Both read as repetition, not incoherence.

## Wall numbers (current master `9d5fe8ab6`, full 8, winseek leg)

- National 0/8, table sits 0/8 (lesser or full), wins 0/8 (winseek never walks a door by design).
- Wave-4 unlocks 7/8 (all but 53005), wave-5 unlocks 0/8.
- Median survival 75.0d gameDays (sorted 59, 60, 69, 70, 80, 96, 117, 119). The analyzer prints the upper-middle value 80d; the evidence reports the true median (70+80)/2.
- Wave-4 kills band-wide: 3 (53001, 53002, 53004 — one each).
- Seat-verb calls band-wide: 0 (`tableTakeSeat` 0, `chooseTableOption` 0, `sitAttempts` 0).
- Roots delta vs `perseed-sitgap-b/` (doorwalk on master `6e69df4ef`): 8/8 CHANGED — every seed. Doorwalk survived and sat on 6/8; winseek dies early and sits on 0/8. This delta confounds policy + master and is named as such, never attributed to one cause.
- Same-policy comparison vs the flipsocial healed winseek panel rows (master `c9fea16ee`, same policy): gameDays 53001 78→119 (+41), 53002 47→117 (+70), 53003 76→69 (−7), 53004 80→60 (−20), 53005 47→59 (+12), 53006 58→70 (+12), 53007 77→96 (+19), 53008 65→80 (+15); median 70.5d → 75.0d. Wave reach: 53002 3→4, 53005 4→3, 53006 3→4, the rest unchanged. Panel `row.table` was 5/8, `entered` 0/8; this run's sitstep `tableWaiting` is 8/8, `tableAnnounced` 3/8, `entered` 0/8 — the reach flags differ between instruments, so the reach comparison is reported side-by-side, not as a delta; the entered comparison is clean: 0/8 on both.
- Telemetry deviation check: not run — DIAG classification, no lever before/after; the neutrality proof + roots delta are the validity checks.
- Balanced panel (§15): not run — DIAG recorder corpus, same standing as the bisect arms; `balance-panel.js` refuses recorder corpora by design (recorded, not forced).

## Method note

- CANON.md read first; TABLE.md (the seat, the sticky offer, overtime) for the area; MEASUREMENT.md §§9–12, 14–15. The code verification (winseek has no sit drive) was done from src/js + policies BEFORE the prereg commit and is recorded there, not inferred from the sweep.
- Instrument shape notes (for the next arm): the harness runs upkeep 3× per loop-day and daily() ONCE at the END of the loop-day — so a daily snapshot follows that day's upkeep calls, and the skip diff between consecutive rows belongs to the LATER row's day (verified against 53007's sitVerbMsgs in sitgap-b). `readyDays` counts only days where the end-of-day snapshot saw preview ready. Daily rows start at d2 (day 1 never snapshot; d2→d4 gap everywhere); the closing snapshot duplicates the final scholar day. Snapshot gaps mid-run: 53001 d115→d117 and 53007 d62→d64 — a scholar-day with no snapshot (on 53007 the scholar changed across the gap: succession happened during the unsnapshotted day). G3 notes "fallen X has no living drop" on 53001/53003/53006 — a join on the same day can mask the drop; noted, not a failure.
- Smoke vs sweep determinism: the 53008 smoke corpus (`/tmp/sitgap-winseek-smoke`, run before the sweep) is byte-identical to the sweep corpus (md5 `e2145f64c305e031232ef3dd85ff9e2f` on both) — the sweep reproduces the smoke exactly.
- Flap: EPERM write flap active across this run (~04:28–05:05 UTC, three refused corpus writes at 04:28/04:30/04:34 leaving 0-byte files, one refused git probe at 04:56, one refused 12-attempt sweep write that killed the first sweep at seed 53002). Response, all per the flap protocol: no forced writes, no manual ref edits. The driver gained `writeFileRetry` (unique temp name + rename + read-back verify, 40 attempts × 15s — raised from 12 after the first sweep died inside a 3-minute refusal window); the proof's round-trip check uses a short retry (3 × 5s) and FAILS rather than crashing on a flap. The second sweep (53002–53008) rode the retries out and completed. Two safe-commit index clobbers struck (prereg + instrument commits) — repaired via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, status clean + `git diff HEAD` empty + hash-object matches after each.
- `deathSays` capture is polluted: the say-wrap regex matches "dead" inside "deadfall", so the 400-capped deathSays list is mostly forage lines. The fallen list is the reliable death record; the deathSays sample in this evidence is quoted only where the line is unambiguously a death/announcement line. (Backlog: tighten the regex.)
- No game-code change. `git diff HEAD -- src/` is empty.

## Proof

`node scripts/test-sitgap-winseek-b.js` — **49/49 green, 0 failed, 0 skipped** (run after the corpora were committed-present: G1 classifier fixtures for all five classes + the winseek no-skip mechanism rewrite + broken-classifier/broken-mechanism sensitivity + caveat-flag fixtures + the committed `perseed-53007-a/` roots; G2 real neutrality on 53008 + 53004 armed vs unrecorded; G3 real integrity on all 8 band corpora + the driver write-retry round-trip + the zero-stats stub). Analyzer: `node scripts/analyze-sitgap-winseek-20261109.js evidence/2026-11-08/perseed-sitgap-winseek-b evidence/2026-11-08/perseed-sitgap-b evidence/2026-11-08/perseed-sitgap-winseek-b-unrec` — G2 53008 PASS, 53004 PASS; G3 8/8 PASS.

## Metric review

- The primary metric (classification coverage with a named mechanism) held without re-scoring: 8/8 classified, and the distribution (3 offered-not-taken, 5 reached-never-sat) is the current-master answer, not the shape the brief assumed. The prereg anticipated a 0-sat band ("the expected verdict shape is 0 sat / N offered-not-taken") and the verdict does not depend on any seed sitting.
- The ready-day caveat was checked and does not apply: no seed has an unsnapshotted final day (caveatFlag false on all 8), so no reached-never-sat is a masked offered-not-taken.
- One instrument note for the next arm: the analyzer's wall-numbers median prints the upper-middle value (80d); the evidence reports the true median (75.0d). Not a metric change — a reporting convention, stated here so the next reader doesn't trip on it.
- No metric change proposed. The classification rule is unchanged from sitgap-b and the winseek mechanism rewrite is fixture-tested against skip-citing text.

## Convergence state

scale-onramp stays **converging** (NOT converged): the winseek reached-but-never-sat gap is now classified seed by seed — the sit gap is a property of the policy, not of the seat: under winseek the seat sits ready for up to 27 days with the scholar at Haven and nobody takes it, because no sit drive runs; the other half of the band dies before the day-90 floor. National is still 0/8, wins still 0/8, wave-5 still 0/8 under winseek, and the frozen band's roots decay with every src change (8/8 moved on this master alone, policy+master confounded). The next blanks, in order: (1) a sit-drive build for winseek (port `takeSeatDrive` from linkfeast-b into winseek, or lift it into base competent so every competent-derived policy sits) — prereg shape: same recorder, same band, GO = sits ≥5/8 with the offered-not-taken class empty; (2) the day-90 floor half needs survival first — winseek villages die at a 75d median, 15 days short of the floor, so any seat fix that doesn't also buy survival leaves 5/8 of the band unseated.

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

- (a) Winseek has no sit drive — the fix shape for the next arm: port `takeSeatDrive` (competent-linkfeast-b.js) into winseek, or lift it into base competent so every competent-derived policy sits. Prereg shape: same recorder + classifier, same frozen band, GO = sits ≥5/8 with the offered-not-taken class empty. (DIAG finding, not built here.)
- (b) The sitgap/53007 driver say-wrap regex matches "dead" inside "deadfall" — the 400-capped `deathSays` list is mostly forage lines. Tighten the regex to word-boundary death terms before the next driver reuses it.
- (c) "Daughter's Drawing" keepsake narration repeats verbatim on consecutive days (53001 d34–d37, the same long paragraph four days running) — repetition, not incoherence.
- (d) The Algorithm's contest trailer floods a single day with ~40 repeated "Thumbnails" lines (53001 d63) — log noise, same class as (c).
- (e) Snapshot gaps mid-run (53001 d115→d117, 53007 d62→d64 — a scholar-day with no snapshot; succession across the gap on 53007) — instrument note, not a defect; the G3 checker already reports gaps without failing.

## Adoption handoff

1. **Verdict: DIAG-GO** (8/8 classified with named mechanisms; 3 offered-not-taken with 27/25/6 ready days at Haven and zero sit calls; 5 reached-never-sat, all dead before the day-90 floor; proof 49/49).
2. **The sit gap is a property of the policy, not of the seat.** Any arm premised on "villages reach the table and never sit" must name its policy: it is a winseek shape (no sit drive), not a doorwalk shape (6/8 sit) and not a seat defect (the bar is met even by the weakest village). Do not brief a seat fix against the doorwalk leg — there is nothing to fix there. The fix belongs to the policy: give winseek a sit drive.
3. **Next arm: winseek sit-drive build** — port `takeSeatDrive` into winseek (or lift it into base competent), same recorder, same frozen band 53001–53008, GO = sits ≥5/8 with offered-not-taken empty. The day-90 floor half (5/8 dying at a 75d median) will still need survival work — a sit drive alone leaves it unseated.
4. Worktree `~/workspace/worktrees/sim-sitgap-winseek-b`, branch `sim-sitgap-winseek-b`. No game-code trace: prereg + instrument (driver + analyzer + proof) + 8 armed corpora + 2 unrecorded controls. Scratch dir `/tmp/sitgap-winseek-smoke` holds the 53008 smoke corpus (byte-identical to the sweep corpus; safe to delete).
