# sim-seatpath — the invitation→sitting funnel, attributed (flesh-out loop DIAGNOSTIC, 2026-10-15)

**Run:** flesh-out loop, run_id fleshout-20261016T001400Z (coordinator claim), arm sim-seatpath, axis scale-onramp (blocking).
**Type:** DIAGNOSTIC — read-only instrument, no lever, zero src/js changes. The deliverable is the attribution, not a change.

## Pre-registration (MEASUREMENT §§9–12, 14 — BINDING)

- **Primary metric:** per-run attribution of non-sittings to a mechanism on the pre-seat substrate.
- **GO threshold:** 100% of non-sittings attributed on 16 runs — offered-but-deprioritized vs never-offered vs gate-blocked, per run. A miss is NO-GO, never re-scored.
- **Substrate:** FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1, SEATDRIVE unset (asserted at load — the same composition sim-presubstrate censused). Policies: TF.leadfeast / TF.belongfeast (the tribfloor base ids, plain).
- **Seeds:** 8 FRESH [163,274,385,496,607,718,829,940] (coordinator-assigned; verified 0 evidence hits before the run) x {leadfeast, belongfeast} = 16 runs.
- **Horizon:** 180d death-aware (dead villages stop; harness dead-village tail).
- **Instrument:** scripts/seatpath-20261015.js — read-only funnel wrap: at each daily() entry (the seatdriver's decision point, before the base policy runs) it samples pg.tableWaiting/tableDone, Game.tablePreview() (the engine's own offer predicate — what the Haven panel button reads), Game.tableSeat().seat, scholar alive/atHaven/exiled, and snapshots→diffs numeric ctx keys across the base policy's daily() (the policy's own honest action counters). Game.say passthrough captures table/herald/invitation/death beats (TABLEBEAT filter, cap 2000, 0 dropped on the 3 re-runs). Proof: scripts/test-seatpath-20261015.js (37/37 GREEN: 9 synthetic classifier tests covering every attribution branch, snap/diff honesty, SMOKE both policies, det-gate 4/4 trajectory-identical instrument-on vs instrument-off on [163,274,385,496], both-repeat design). Analyzer: scripts/analyze-seatpath-20261015.js.
- **Context:** sim-wincensus measured 15/16 invites / 0 sittings on this stack and named the gap (no courtship-road policy plays tableTakeSeat); the seat driver (seatdrive.js, SEATDRIVE=1) fills it on the full stack (12/16 sittings, 12/16 wins). This arm measures the mechanism of the gap itself.

## The funnel (16 runs)

Per-seed JSONs: evidence/2026-10-15/perseed-seatpath/ · beats: evidence/2026-10-15/seatpath-beats/

| run | invDay | seat | openDawns | offered | sit | end | attribution |
|---|---|---|---|---|---|---|---|
| belong s163 | 81 | lesser | 9 | 0 | 0 | village-lost d89 | never-offered:winDayFloor (9) |
| belong s274 | 72 | lesser | 63 | 45 | 0 | village-lost d134 | mixed: winDayFloor 18 + offered-never-invoked 45 |
| belong s385 | 55 | lesser | 54 | 19 | 0 | village-lost d108 | mixed: winDayFloor 35 + offered-never-invoked 19 |
| belong s496 | 83 | lesser | 65 | 58 | 0 | village-lost d147 | mixed: winDayFloor 7 + offered-never-invoked 58 |
| belong s607 | 88 | lesser | 43 | 41 | 0 | village-lost d130 | mixed: winDayFloor 2 + offered-never-invoked 41 |
| belong s718 | 102 | lesser | 22 | 22 | 0 | village-lost d123 | offered-but-never-invoked (22) |
| belong s829 | 63 | lesser | 48 | 21 | 0 | village-lost d110 | mixed: winDayFloor 27 + offered-never-invoked 21 |
| belong s940 | 62 | lesser | 40 | 12 | 0 | village-lost d101 | mixed: winDayFloor 28 + offered-never-invoked 12 |
| lead s163 | 62 | lesser | 29 | 1 | 0 | village-lost d90 | mixed: winDayFloor 28 + offered-never-invoked 1 |
| lead s274 | 84 | lesser | 30 | 24 | 0 | village-lost d114 | mixed: winDayFloor 6 + offered-never-invoked 24 |
| lead s385 | 69 | lesser | 43 | 22 | 0 | village-lost d111 | mixed: winDayFloor 21 + offered-never-invoked 22 |
| lead s496 | 108 | lesser | 67 | 67 | 0 | village-lost d174 | offered-but-never-invoked (67) |
| lead s607 | 87 | lesser | 35 | 32 | 0 | village-lost d122 | mixed: winDayFloor 3 + offered-never-invoked 32 |
| lead s718 | 131 | lesser | 42 | 42 | 0 | village-lost d131 | offered-but-never-invoked (42) |
| lead s829 | 77 | lesser | 81 | 68 | 0 | village-lost d158 | mixed: winDayFloor 13 + offered-never-invoked 68 |
| lead s940 | 63 | lesser | 46 | 19 | 0 | village-lost d108 | mixed: winDayFloor 27 + offered-never-invoked 19 |

**Attribution totals (717 open-invite dawns):**
- offered-but-never-invoked:policy-has-no-seat-verb — **493 dawns (68.8%)**
- never-offered:winDayFloor — **224 dawns (31.2%)**
- gate-blocked — **0 dawns** (no scholar-dead, no council-gate, no preview-not-ready on any run)

**GO: 16/16 non-sitting runs attributed — GO MET.**

### What the two phases are

1. **never-offered:winDayFloor (224 dawns):** the invitation pends (tableWaiting true) but the seat doesn't exist yet — day < 90, the NO-SPOILERS rule (table.js:498). Invitations fire early (invDay 55–88 on 11/16 runs) and wait unsat for the floor. This is engine-honest by design, not a bug — but it is a real phase of the funnel: belong s163 was invited d81 and died d89 with the seat never having existed.
2. **offered-but-never-invoked (493 dawns):** from day 90 the preview is ready — the Haven panel button would show — and the policy never calls tableTakeSeat. On the 493 offered dawns the scholar was alive 493/493, at Haven 471/493 (95.5%), exiled 0/493. Nothing in the engine blocks the verb: tableTakeSeat carries no location gate and no council gate in table.js (verified by code read; the seatdrive pre-checks are policy-side classification, never engine refusals).

## What was chosen instead (top actions on open-invite dawns)

Aggregated ctx-counter deltas across the 717 open-invite dawns — the policy's own honest records (source sites in scripts/policies/competent.js unless noted):

| action (counter) | total | /dawn | honest reason the policy records |
|---|---|---|---|
| answer the fire network's aid begs (aidGivenKcal, :80) | 14,076 kcal | ~20 kcal | a beg came in; pantry held >3x the ask (1.5x for creditors) → gave |
| strip the dead (looted, :119/:127) | 1,822 items | 2.5 | lootCorpses: "strip the dead after fights" |
| the honest food run (forageTrips, :1064) | 1,555 trips | 2.2 | forageTripSeedFirst: forage, sort, sow first, donate |
| staff the fishing (fishStaffed, :1243) | 1,111 | 1.5 | counterPlay: work the water when the land thins |
| talk rounds (talked, :516) | 702 | ~1.0 | talkRound: conversations; tripled until 5 plants known |
| channel a keepsake (devotionChannels, :286) | 577 | 0.8 | channelDevotion: calm-day practice toward the devotion lane |
| staff the cook (cookStaffed, :1279) / tend the garden (tended, leadcourt.js:63) | 409 / 388 | ~0.6 | division of knowledge: the duty cook, the tended plots |

(The once-per-dawn day-markers _trapDay=717/_cpDay=712/_devChanDay=709 are bookkeeping, not actions — and their exact match to the 717 open-dawn count is the instrument's per-dawn accounting sanity check.)

The mechanism in one sentence: the courtship policy chain (leadfeast/belongfeast → tribfloor → feastscale → scalecourt/belongseek → competent) contains **zero seat-taking verbs** — the seat was never deprioritized in a choice, it was never in the action set. The dawns filled with the village's real life: looting its dead, foraging, fishing, talking, answering its subordinate fires' begs.

## Sense-read: three open-invite dawn transcripts (SENSE-TESTING LAW)

**leadfeast s829** (invited d77, 81 open dawns, died d158): the fiction screams and the policy is deaf. d90: "◈ THE TABLE IS SET. A ring of pale light waits — take your seat from Haven when you are ready. Nothing is final until you sit." Then six OVERTIME beats (d97→d143), every one ending "Take your seat from Haven to stop the clock." The Herald eats the stores "while you deliberate" (d92, d102, d107, d112...). The village bleeds under reruns it was told how to stop. The scholar never sits — not because the fiction is quiet, but because the policy has no hands for the verb.

**leadfeast s496** (invited d108, 67 open dawns, died d174): same shape, longer. OVERTIME ×1→×5, standing docked −7→−40, the Herald feeding nightly. d126: "They bled while the coalition talked. (trust −5 — they notice who wasn't there.)" The coalition talks; the seat waits; the village pays.

**belongfeast s496** (invited d83, 65 open dawns, died d147): the fiction punishes the silence socially. d117: "Seven days of silence, and the silence answered for Haven. Emberhold's new speaker reads it plainly. (Trust −6.) Emberhold installs their own speaker at the table after a..." The realm reads an unsat invitation as an answer. The village behaves like it has an open invitation — the pressure is all top-down (System/Herald/Table/overtime) plus realm-trust consequences; no villager gossips about the seat itself (bottom-up table-talk: 0 beats observed — filed as a narration gap).

Sense verdict: the fiction problem the task names is real and measured — the scholar doesn't "stand down," it keeps living its dawn routine (loot, forage, fish, talk) for 20–92 days while the table waits and the village fights reruns it was told the seat would stop. The engine does everything short of sitting for the player.

## The named next lever

**Seat driver default-ON** — flip the landed seatdrive layer (scripts/policies/seatdrive.js, landed 9cdbe8d1) from opt-in to the default composition.

Why this one, against the options:
- **(c) an engine reason the verb is unplayable — FALSIFIED.** 493 offered dawns, scholar alive 493/493, at Haven 95.5%, exiled 0; gate-blocked 0. The verb is callable and honest on every offered dawn.
- **(a) vs (b) an organic competent-policy seat-taking branch:** the driver already exists, is guard-classified (#294), proven on three seed sets (40/48 wins vs 0/48 control), zero src/js. On the armed stack every offered dawn becomes a sitting the first dawn the preview exists (pathcensus: invDays=1 on all 11), and every measured sitting converted to a win — sitting the first offered dawn is never punished in-sim. An organic branch in competent.js would duplicate the mechanism with more code; it buys conditionality (e.g. don't sit mid-crisis) that no measurement has shown to matter. If Steve wants the sit to ever be conditional, that's a design call on top of (a), not instead of it.
- Note: all 16 seats on this seed set were lesser (presubstrate's set had 6/16 full) — the funnel is path-agnostic, but the seat type it feeds the path funnel is the lesser road.

**What the pathcensus finding implies for this funnel:** the witness-unoffered / choice-verb-doesn't-exist finding is DOWNSTREAM of this funnel — pathcensus starts at the sitting, where this diagnostic ends. Fixing the sit does not fix path variety: the seat driver + winpursuit drain produce sittings that always walk feared-light (the drain plays options[0]; it doesn't choose). The missing choice verb is a separate gap on a separate funnel; path variety stays steve-call #316/#317. Witness being structurally unoffered doesn't touch the invitation→sitting funnel (it's path-agnostic), but it bounds what the funnel's output can become: on this substrate the funnel feeds only the lesser-seat door set.

## Metric review

GO met: 16/16 non-sitting runs attributed to a mechanism, 717/717 open-invite dawns classified, 0 unattributed. One instrument lesson for the next run: unfiltered Game.say capture fills any cap by day 5 (16k beats/run dropped on the first sweep) — the TABLEBEAT filter + cap 2000 held 0 dropped on the 3 re-runs, and the re-runs reproduced the sweep funnel byte-for-byte on inviteDay/openDawns/clsCounts (funnel fields verified identical before the beat files were kept). No metric revision needed; the two-phase funnel (winDayFloor wait → offered) should be the standard taxonomy for future seat instruments.

## Findings filed

- Narration: duplicate-fire "THE HERALD does not notice you..." ×5 identical on belongfeast s496 d106 (same class as the sim-w3drive duplicate-mauled-beat finding) — filed to sim-findings.md.
- Narration: bottom-up table-talk absent — villagers never gossip about the open invitation; all seat pressure is top-down (System/Herald/overtime/realm-trust). Filed to sim-findings.md.
