# Journey Endgame r13 — Leg 4 (Endgame): overtime tiers measured, feared + assimilated answered, post-win remark blank filled

**Run:** 2026-10-15 · Worktree `journey-endgame` · leadfeast × seeds 37/48/5/71, 180 loop-days death-aware
**Harness:** `scripts/journey-endgame-r13-20261015.js` (r12 lineage + overtime instrument) + `scripts/table-answer-probe-r13-20261015.js` (r12 lineage + sit-from-Haven driver, TAG support, post-fix probe)

## Pre-registered question (MEASUREMENT.md §11)

On current master tip f0590b05: (A) does the OVERTIME tier system (TABLE.md 2026-10-14, `src/js/overtime.js`) actually tick while a priced seat sits UNANSWERED — r12's s37 sat 80d unanswered with zero overtime instrumentation, so tiers 0–6 had never been measured in a journey run; (B) does the seat-approach picture hold on 2 fresh + 2 known seeds (r12: 3/4 GO)?

- **Primary metric:** (A) `overtimeActive()==true && overtimeTier()>0` on a run whose scene sat unanswered ≥42d past the win-day floor, with the tier-N System line in the transcript and `overtime_tier` telemetry present. GO = tier ticks and is legible on ≥1 run. NO-GO = the clock never starts (wire-gap) — filed as a blank. (B) seatApproach GO = ≥2/4 seeds (same bar as r10/r11/r12).
- **Secondary:** RERUN ×N labels on wave-4/5 fights during overtime; raid-knob engagement; one full answer walk under the NEW sit-from-Haven flow (Steve 2026-10-14) with a sense-read transcript.
- **Seeds:** 37, 48 (r12 known), 5, 71 (fresh). **Policy:** leadfeast (FEASTSCALE_R13=1). The pilot does NOT sit (overtime needs the seat untaken). **Horizon:** 180 loop-days death-aware.
- **Interesting-finding bar:** tier-6 effects in the transcript; a RERUN fight that matters; a silent clock (no lines, no telemetry); a completed answer walk under the new flow.
- **Flow change vs r12 (important):** commits 116a8b9d ("Table seat is a Haven option, not a morning prompt") and bc5cb3f7 ("Table stays relative until the player sits") landed AFTER r12's tip. r12 measured the OLD auto-fire-at-dawn flow; r13 measures the NEW flow: announced once via `tableAnnounce()`, the player sits from Haven via `tableTakeSeat()`. The sim policy never sits — `tableScene` fires 0 times in the pilot BY DESIGN (not a wire-gap).

Anti-drift (§14): metrics bind. A miss is NO-GO, never re-scored.

## Results — GO on both primaries

| Seed | End (loop-d) | Seat | OT max tier (scholar-d) | RERUN fights | tele | Deaths | Notes |
|------|-----|------|--------|----------|------|-------|-------|
| 37 | lost 151 | full | 6 @138 | 45 | 6 | 41 (35 combat) | global, wave 5 |
| 48 | lost 142 | full | 6 @132 | 175 | 6 | 47 (all combat) | regional, wave 5, 1 ascension (Catalina Reyes) |
| 5 | lost 98 | lesser | 1 @97 | 0 | 1 | 25 | died the day after the clock started |
| 71 | survived 180 | full | 3 @111 | 18 | 3 | 23 | 4 alive (Lan, Onni, Greta, Saranya) |

Wall: national 3/4, table 4/4, won 0/4 (pilot never sits — by construction), seatApproach **4/4**, exiled 0/4.
STANDING: wave-4 4/4, wave-5 4/4, sceneFired 0/4 (new flow, expected), sceneCompleted 0/4, ascensions [0,1,0,0].
**PRIMARY (A) GO:** the clock ticked on 4/4 runs — every tier announcement on air with a distinct System line, a `say` line naming the cost AND the remedy ("Take your seat from Haven to stop the clock."), and `overtime_tier` telemetry. **PRIMARY (B) GO (4/4 ≥ 2/4).**

### Overtime transcript (s48, the heaviest)

- d97: "OVERTIME! The season was supposed to END. You didn't sit. So we kept the cameras rolling. RERUNS, folks — the hits, but HUNGRIER." + "◈ OVERTIME ×1 — wave 4–5 monsters return as RERUNS (+25% HP, +12% damage). Raids come sooner. The table docks your standing −7. Take your seat from Haven to stop the clock."
- Tiers 2–6 each get their own producer-unhinged line ("Ratings are UP! The audience loves a stall!", "Is this cruel? It's TELEVISION.").
- RERUN fights are labeled in-fiction: "📼 RERUN ×4 — you have seen this episode. It has seen you too."
- 175 RERUN-scaled wave-4/5 fights on s48; the village fought to the last — all 47 deaths combat.

**Design note for sim loops (not fixed — balance is loop B's domain):** both villages that reached tier 6 died under the RERUN pressure; the never-sit policy is a death sentence by ~tier 6. Open question: is there a viable "wait and build through overtime" strategy for a strong village, or does the design force sitting by ~tier 3? The cost is legible (every tier names the remedy), so this is tuning, not a bug.

## Answer walk 1 — the feared path (s48, day 90), sense-read — first walk under the new sit flow

Driver sat from Haven when `tablePreview().ready` fired (lesser seat priced live at sit-time: global standing, 13/5/4 waves, 10 contests, 5 crises — the ladder's earlier full-seat sample had decayed; the seat prices live, r11/r12's note stands). Earned: feared(100), beloved(100), assimilated(55), defiant(50), relay(50); unearned: indispensable, witness. Full transcript: `evidence/2026-10-15/journey-endgame-r13-answer-s48-feared.txt`.

The walk: audit → ascension pricing ("The table notes 1 ascension from one village — its terms improve accordingly") → sanctity ("EVERYONE. SIT. WATCH.") → four abilities (Dreadfield, War-table, Oathbound, Shieldbearer) → terror broadcast live ("WHAT EATING BUILT" — the food thesis as the show title) → branch read ("The protected outnumber the killed; the food truth was shared. The light road is open.") → three beats (kill → lean → spend, each with live villager reaction: "Behind you, your own people go still too — a different stillness") → final: mercy ("The most frightening thing you ever did.") → OUTSHONE epilogue (Catalina Reyes ascended un-facilitated: "the god is someone else, the record notes you watched") → win. 5 steps, won=true. Zero dead beats, zero undefined/NaN.

## Answer walk 2 — the assimilated path (s48, day 90), sense-read — FIRST IN-HARNESS

Full transcript: `evidence/2026-10-15/journey-endgame-r13-answer-s48-assimilated.txt`. The walk: the CONTRABAND framing honored ("the assimilation isn't televised... a camera that shouldn't exist is rolling, and the footage will leak") → four abilities (Soft Landing, Orientation, Dead Drop — "Set in the final beat" — Locket) → light branch → three beats: kitchens ("You'll never be hungry again. Sit with that sentence for a while."), citizen ("You'll never wonder what you're missing — you'll know, and it will be everything."), truth/Dead Drop ("The horse is in." — the Trojan horse) → final: comfort ("The dead drop sits inside you like a seed... the food truth will sprout in the galactic core") → outshone epilogue → win. The path's identity (gentle trap, Trojan horse, contraband show) reads end-to-end. 5 steps, won=true.

## People check (SENSE-TESTING LAW) — post-win conversations, post-fix

2/2 post-win conversations mention the table, now with the RESOLVED lines:
- Daniela (feared walk): "The light's gone. The sky's just sky again. Tell me it meant something."
- Nikos (assimilated walk): same resolved pool.
Pre-fix, both served the WAITING line ("it's just sitting there. Waiting on you.") after the win — blank filled below.

## Village assessment (plain words)

**s37 — the long wait.** Global, wave 5 by scholar-day 120, a full seat priced — and the table never sat at. The overtime clock ran to tier 6; 45 RERUN fights; 41 dead, 35 to combat. Mara and Tiziana were the last two. The village that priced everything and bought nothing.

**s48 — the grinder.** Regional, wave 5, 175 RERUN fights — the heaviest overtime load measured. All 47 villagers died in combat, none to hunger or sickness: they fought the reruns to the last body. Catalina Reyes ascended (the only ascension across the 4 seeds) — and her ascension was priced into both answer walks' audits.

**s5 — the collapse.** Global, lesser seat, the clock started at scholar-day 97 — and the village died the next day. 25 dead. Overtime didn't kill this one; it was already falling.

**s71 — the survivor.** Global, full seat, tiers 1–3 weathered (18 reruns), 4 alive at the end (Lan, Onni, Greta, Saranya). The only village that lived with the clock running — proof the early tiers are survivable.

## Blank FILLED: post-win villagers served the waiting table line

**Found** in the feared answer's post-win probe (pre-fix): both villagers opened with the WAITING pool ("The table's here... Waiting on you.") after the table resolved and the run was won. Two root causes:

1. `convoTableOpener`'s pool branched on `waiting` (`pg.tableWaiting`) instead of the kind-aware `wantKind` — r12's kind fix computed the right kind ('done') but the pool selection ignored it.
2. `pg.tableWaiting` is never cleared by any resolve path — a stale flag that also kept `convoTableSitting()` true post-win (suppressing generic open-thread resumes).

**Fix** (`src/js/conversation.js`): the pool follows `wantKind` — deferred → deferral line; done → resolved pool; else waiting pool. (`src/js/table.js`): the 4 terminal resolve sites (`T.phase = 'done'`) now clear `pg.tableWaiting` — the deferral early-return path is untouched, so `winDayFloorDefer` keeps waiting=true correctly.

**Proof:** `scripts/test-table-remark-resolved-pool-20261015.js` — RED on pristine (2 failures: post-win served waiting pool), GREEN 6/6 post-fix (patch round-trip, no stash). Covers: resolved pool post-win, once-per-kind guard, waiting pool while sitting, r12's waiting-then-resolved case, deferral line.

**Regressions:** test-table-opener-20261014 14/14; test-table-remark-kind-20261015 (r12's proof) 6/6; test-convo-beats-20261006 25/25; test-convo-deflect-cycle-20261012 11/11.

**Integration proof:** re-ran the feared walk post-fix — probe-state dump shows `tableWaiting=false, sitting()=false`, and both post-win conversations open with the resolved line.

## Reachable / fun / winnable (endgame leg)

- **Reachable:** YES — 4/4 seat approach; the new sit-from-Haven chain (announce → preview → takeSeat → scene → answer) works end-to-end in-harness twice. The seat prices live at sit-time (lesser at day 90 after a full-seat ladder sample — decay is honest).
- **Fun:** the overtime writing is the strongest new System voice in the endgame — each tier has its own producer-unhinged announcement, and every tier names the remedy. The assimilated walk's Trojan-horse arc (Dead Drop foreshadowed, "The horse is in") plays clean.
- **Winnable:** YES — two more wins (feared/light, assimilated/light) under the new flow. The win paths now answered in-harness: feared (r11, r13), relay/grey (r12), beloved (r12), assimilated (r13). Remaining never-answered: defiant, witness, indispensable; dark branches unexercised.

## Metric review (§14, anti-drift)

**Both primaries GO.** No revision proposed. Notes for the NEXT run's metric design:
- `sceneFired` in the telemetry baseline now means "the player sat" (new flow) — the pilot never sits, so 0/4 is by construction, not a regression. The baseline's sceneFired=1 came from the old auto-fire flow. Do not re-score; if the baseline is kept, annotate the semantic change.
- Pilot "days" are harness loop-days; scholar-days (the game's clock — overtime, waves, the day-90 floor) run ~0.6–0.9× loop-days in these trajectories (s71: 180 loop → ~115 scholar). Overtime findings above are in scholar-days (tele events), which is correct — but cross-harness day comparisons should use scholar-days.
- The `mode` string passed to `loadGame` participates in the RNG stream: r13's "same seeds" as r12 are different runs. Same-seed stability claims must pin the mode string too.

## Telemetry deviation check

`telemetry-check.js` vs `telemetry-baselines/endgame.json` (national,table,wins,exiled,seatApproach,wave5unlocked,tableSceneFired,tableSceneCompleted,ascensions): **quiet** (4 files, 9 metrics, no large deviations). Baseline NOT rolled (semantic change on sceneFired noted above, not a deviation).

## Files

- `scripts/journey-endgame-r13-20261015.js` — measurement pilot (r12 lineage + overtime instrument: tier/active sampling, say/sysSay capture, `overtime_tier` tele counting)
- `scripts/table-answer-probe-r13-20261015.js` — answer driver (sit-from-Haven under the new flow, PATH_PREF, TAG, post-win people probe with state dump)
- `scripts/test-table-remark-resolved-pool-20261015.js` — proof, RED→GREEN (patch round-trip)
- `scripts/probe-ot-s71-20261015.js` — debug probe (loop-day vs scholar-day investigation)
- `src/js/conversation.js` — resolved-pool fix in `convoTableOpener`
- `src/js/table.js` — `tableWaiting=false` at the 4 terminal resolve sites
- `evidence/2026-10-15/journey-endgame-r13-leadfeast-s{37,48,5,71}.json` — per-seed telemetry (+overtimeDetail)
- `evidence/2026-10-15/journey-endgame-r13-overtime-s{37,48,5,71}.txt` — overtime transcripts
- `evidence/2026-10-15/journey-endgame-r13-pilot-run.log`
- `evidence/2026-10-15/journey-endgame-r13-answer-s48-{feared,assimilated}.{json,txt}` — the two walks
- `evidence/2026-10-15/journey-endgame-r13-postwin-s48-{feared,assimilated}-day90-*.txt` — post-win people-check transcripts
- `evidence/2026-10-15/journey-endgame-r13-answer-{feared,assimilated}-run.log`
