# Journey Endgame r11 — Leg 4 (Endgame): table answered in-harness, first win

**Run:** 2026-10-14 · Worktree `journey-endgame-r2` · leadfeast × seeds 51/62/73/84, 180d death-aware
**Harness:** `scripts/journey-endgame-r11-20261014.js` (r10 harness, r11 naming) + `scripts/table-answer-r11-20261014.js` (new: answers the natural scene like a competent player — strongest earned path, trial-by-combat taken when offered, dark conscript refused) + `scripts/convo-probe-table-r11-20261014.js`

## Pre-registered question (MEASUREMENT.md §11)

On current master tip e873b4b9, does a competent FEAST-ROAD player reach the table / Arc IV within 180 days, and can a table scene be driven to completion in-harness with the writing sensical end-to-end? (Second half is r10's metric-review carryover — r10's scenes sat unanswered.)

- **Primary metric:** runs with tableSeat() approach (seat != 'none') OR tableScene fired. **GO = ≥2/4 seeds.** (kept from r10, §14 binding)
- **Secondary:** (a) survival-conditioned — seat approach among villages alive at d100+ (r10's proposed secondary); (b) one scene driven to completion in-harness (phase 'done', won/over recorded, transcript sense-read); wave-5 unlocks; NPC ascensions.
- **Seeds:** 51/62/73/84 (fresh — avoids overfitting r10's 11/22/33/44). **Policy:** leadfeast (feastscale.js, FEASTSCALE_R13=1). **Horizon:** 180d death-aware (+10d tail).
- **Interesting-finding bar:** an answered table scene with a real win/failure resolution; a concrete dead beat in the chain; senseless finale lines; or a survival-bound primary.

## Results — GO on the primary (3/4); first in-harness win

| Seed | End | Wave4/Wave5 | Standing max (day) | Seat | Scene | Notes |
|------|-----|-------------|-------------------|------|-------|-------|
| 51 | lost 97 | 60/70 | 252@90 | none→lesser* | fired d97 | village scattered the day the table came |
| 62 | lost 159 | 60/90 | 320@150 | lesser | fired d64 | table sat unanswered 95d; lost to combat d139–159 |
| 73 | lost 63 | 60/— | 182@60 | none | — | collapsed d47–63: combat + sickness + thirst |
| 84 | **survived 180** | 60/90 | 572@180 | full→lesser* | fired d65 | answered d65 → **WON** (feared/light) |

Wall: national 2/4, table 3/4, **won 1/4**, seatApproach **3/4**, median 159d, exiled 0/4.
Standing: wave-4 4/4, wave-5 3/4, sceneFired 3/4, sceneCompleted 1/4 (first ever), ascensions [0,0,0,0].

\* Seat notes: s51's pilot run read seat=none at fire; the answer-run (with the new table-opener hook in game code shifting the RNG stream) reached lesser (11/9/3 waves) — same policy, slightly different dice. s84's pilot ladder caught a full-seat sample; at fire time d65 the audit priced a lesser seat (13/5/3). Seat is evaluated live at fire, not at ladder-max.

**Secondary (a) survival-conditioned:** villages alive at d100+: s62 (d159), s84 (d180) — 2/2 approached (lesser, lesser-at-fire). The primary's miss is survival-gated, same as r10.

## Village assessment (plain words)

**s51 — the table came too late.** Global standing, wave 5, feasts flowing — then the last week: combat, sickness, a wound that wouldn't close. On day 97, with three living (Yuki the mechanic, Amara the beekeeper, June the programmer), the table finally came — a lesser seat, priced for what they built — and that same day Haven couldn't hold: third hungry day, people walked in different directions. The table priced a village that was already scattering. Nobody answered.

**s62 — the waiting village.** Lesser seat at d64, Arc IV the same day — then 95 days of the table sitting unanswered under sanctity while the village bled out in drips: a contest death at d131, then d139 took five (three combat, two contest), and the polity dissolved at d159 with seven living (Tariq, Ingrid, Priya, Darius, Omar, Oscar, Lena). The table waited; nobody came to it. The seat went unanswered.

**s73 — the thirsty collapse.** Never got near the table. Days 47–63: five combat deaths in one day, sickness, then thirst and dehydration (d56–59) — the feast-road policy fed the pantry but the water ran out. Six survivors at the end (Mia, Olivia, Ellis, Liam, Sam, Nikos) but the village as a polity was gone at d63. Water, not food, killed the endgame run — a data point for the survival bind, not a game bug (no table involvement; my changes can't have caused it — none touch water).

**s84 — the winning village.** The one that made it all the way: wave 4 @60, wave 5 @70, full-seat sample on the ladder, Arc IV and the table at d65 (lesser at fire: 13/5/3 waves, 4 contests, 3 crises). Answered the same day — walked the feared path at strength 100, light branch (the food truth was shared), mercy final. The win was deferred by the day-90 floor ("Ninety days. We do not price a life half-lived"), the table returned at d90 as promised, re-priced live (beloved 80→94, defiant newly earned), and the feared path resolved: **won=true, over=true, run ended d89/90.** Seven living at the end (Mara, Ruth, Ava, Ben, Peter, Grace, Wren). First win in these sims.

## Table answer — the feared/light walk, sense-read

Full transcript: `evidence/2026-10-14/journey-endgame-r11-answer-s84.txt`. The walk: audit ("A lesser seat — regional standing, waves 1–3 faced (13/5/3)... The table does not rise. It prices."), path abilities granted aloud (Dreadfield, War-table, Oathbound, Shieldbearer), terror broadcast live ("Look what eating built"), three calibration beats (kill → lean → spend-the-terror-shielding-them — the tightrope reads), mercy final ("The most frightening thing you ever did... the terror stays, pledged now: a shield over every village, forever"), epilogue naming Amina Diallo with correct pronouns, the pods/oversight sting. Zero dead beats, zero strands, no undefined/NaN. The trial-by-combat was not offered on this walk (opt-in beat didn't surface for this branch/strength); r10's chain exercise verified its wiring.

**Win-day-floor deferral works as designed** — with one narrative bug, fixed below (blank #1).

The s51 withdrawal beat (seat none) was exercised directly in a rig: withdraws aloud ("the ring of pale light flickers... WE WILL... RESCHEDULE"), tableWaiting=false, no strand, run continues.

## People check (SENSE-TESTING LAW)

Two probes at s84/d72, table sitting unanswered since d65:

1. **Amina** (post-fix): opens with the table — "Nobody's sleeping. The sky is waiting and nobody knows what to do with their hands. What are you going to tell it?" The question routes through convoMatchReactive and becomes answerable; the conversation then proceeds with her want (ask_favor). Coherent: news first, then business.
2. **Vasyl** (post-fix): had a planted favor-seed ("About the pantry run — the need hasn't gone anywhere. I'm still asking.") — the seed kept priority over the table, by design (a favor follow-up is a commitment, not chatter). Documented as the intended precedence.

Pre-fix RED was 0/2 mentioning the table (Amina opened with a personal secret while the galaxy's table sat in the sky — the secret hook pre-empted world news).

## Blank FILLED #1: finale claims the win before the day-90 floor grants it

**Found** in the s84 answer transcript. The d65 feared walk resolved, the epilogue printed "You won. Say it plainly: you won. The village endures. The table signed." — and THEN the win-day-floor deferral said "Ninety days... come back when the village has seen ninety dawns." The epilogue claims a win the table has not granted.

**Fix** (`src/js/pods.js` `podOversightEpilogue(opts)`, `src/js/table.js` `tableEpilogue`): the epilogue is now deferral-aware — when `!winDayFloorOk()`, the sting frames the ending as written, not yet won ("Not won yet — the table only waits on time. But the ending is already written..."), and the real win at 90+ still says it plainly. The pods sting (still napping / looking away) lands in both.

**Proof:** `scripts/test-table-deferral-epilogue-20261014.js` — RED 7/8 (contradiction present pre-fix), GREEN 8/8 ×3 seeds post-fix (deferred framing voiced, no premature claim, real win unchanged, sting intact).

**Regressions:** test-kids-devotion 47/47 (the sting's contract tests); test-table-core/feared/relay fail identically on pristine HEAD (pre-existing: "resolves won" expectations — verified via patch round-trip, not my change); test-table-ascension 17/17.

## Blank FILLED #2: the village doesn't acknowledge the table

**Found** (r10 documented, not fixed): a week after the table came, nobody mentions it.

**Fix** (`src/js/conversation.js`, `src/js/table.js`):
- `tableScene` bumps `pg.tableSittingId` when a seat is granted (the win-day-floor re-offer is the same sitting — no bump).
- New `convoTableOpener(vid)` in `convoOpening` at priority #2 (after talk requests, before unfinished business): while the table actively sits (unanswered or win-deferred) — and once after it resolves — villagers open with it. Once per villager per sitting; never a loop. Question openers become answerable via convoMatchReactive (the NPC wants to know what you'll tell it).
- `convoResumeOpener` yields to the table for generic open-thread resumes (planted want-seeds keep priority — commitments over chatter).
- `convoTopicLabel` gains `table: 'the table'` — the new thread id leaked raw into resume lines ("never finished talking about event") before the label was added; same bug class as the 2026-10-07 taughtref fix.

**Proof:** `scripts/test-table-opener-20261014.js` — 14/14 ×3 seeds (silent when the table never sat; fires once while waiting; deferral-aware line with no premature win claim; one remark after resolution then silence; label correct). Live probe: `scripts/convo-probe-table-r11-20261014.js` — post-fix, verbal villagers open with the table unless they carry a planted seed.

**Regressions:** test-convo-deflect-cycle-20261012 11/11, -r6 13/13, test-convo-beats-20261006 25/25.

**Documented, not fixed:** (a) gossip "Solid person. ." double-period artifact (r10) — investigated: the template at truth.js:990 is clean; the artifact enters downstream in the gossip-beat/voice composition (voiceLine's punctuation fold handles `!?…` closers but the observed `. .` pattern suggests a bare `.` closer slipping through the space-join; no bare `.` found in characterGen voice data — may come from a voice-state/drift closer or the ack-composer path). Cosmetic, pre-existing. (b) Resume-composition doubling ("We never finished talking about that favor — we got cut off. "Amina and I never did finish... Still on """) — multi-thread nod with a truncated second fragment; pre-existing, adjacent to the resume path. (c) Lifetime said-memory never decays (r10) — design question, not a one-line fix. (d) The `curious` want still meanders (r9/r10 finding stands, not re-probed).

## Reachable / fun / winnable (endgame leg)

- **Reachable:** YES — 3/4 approached (one full-seat sample, two lesser), wave-4 4/4, wave-5 3/4 on the feast road. The table scene fires; the withdrawal beat speaks aloud.
- **Fun:** the feared/light finale is strong end-to-end (audit → calibration → mercy → named epilogue → pods sting); the deferral re-offer keeps its promise ("the table will still be here" — and it is). Design note: an unanswered table still suspends the world indefinitely (s62: 95 days) — the table probably shouldn't wait forever (r10's note stands).
- **Winnable:** YES, now demonstrated — s84 won the feared/light path at the day-90 re-offer. 1/4 wins; the wall remains surviving the endgame window with the polity intact (3/4 villages died d63–159). Win-path stays converging, no longer blocked on "can anyone win at all."

## Metric review (§14, anti-drift)

**Primary GO (3/4 ≥ 2/4).** The metric stands. Note for the NEXT run: the RNG stream shifted mid-run when the table-opener hook landed in game code (s51: seat none→lesser between pilot and answer runs — same policy, different dice). Future runs should freeze game code before the measurement pilot, or re-run the pilot after landing hooks. No revision to the metric itself.

**Secondary (a)** survival-conditioned 2/2 among d100+ survivors — the bind is survival, not the table. **Secondary (b)** met: one scene completed in-harness with a real win.

## Telemetry deviation check

`telemetry-check.js` vs `telemetry-baselines/endgame.json` (national,table,wins,exiled,seatApproach,wave5unlocked,tableSceneFired,tableSceneCompleted,ascensions): **1 LOUD line, explained, baseline NOT rolled.**
- `ascensions` 3→0: seed variance, not a bug. The machinery was verified working on all 4 r11 seeds (`villagerAscensionScore` computes, `tableAscended()` returns clean arrays; top scores 21–37 vs the 45 bar — nobody cleared it). r10's 3 came from a single seed's dying village. My changes don't touch ascension scoring. Observation for the sim loops: the 45 bar rarely fires (3 ascensions across 12 seeds) — the facilitation/ascension endgame content is nearly unreachable at current tuning; that's a balance question, not a bug.
- Everything else quiet (wins 0→1 is within the win metric's own noise; the baseline's wins=0 stands as the conservative reference).

## Files

- `scripts/journey-endgame-r11-20261014.js` — measurement harness (r10 lineage, r11 naming)
- `scripts/table-answer-r11-20261014.js` — natural-scene answer driver (strongest earned path, trial taken, conscript refused, re-offers answered)
- `scripts/convo-probe-table-r11-20261014.js` — table-acknowledgment probe
- `scripts/test-table-deferral-epilogue-20261014.js` — proof 8/8 ×3 (RED-verified)
- `scripts/test-table-opener-20261014.js` — proof 14/14 ×3
- `src/js/table.js` — tableSittingId bump; epilogue deferral plumbing
- `src/js/pods.js` — deferral-aware oversight sting
- `src/js/conversation.js` — convoTableSitting/convoTableOpener, resume pre-emption, 'table' topic label
- `evidence/2026-10-14/journey-endgame-r11-leadfeast-s{51,62,73,84}.json` — per-seed telemetry
- `evidence/2026-10-14/journey-endgame-r11-answer-s84.{json,txt}` — the winning walk, full transcript
- `evidence/2026-10-14/journey-endgame-r11-answer-s51.{json,txt}` — the table-came-as-the-village-scattered run
- `evidence/2026-10-14/journey-endgame-r11-tableprobe-s84-day72-*.txt` — people-check transcripts
- `evidence/2026-10-14/journey-endgame-r11-pilot-run.log`
