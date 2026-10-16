# Journey Endgame r15 — Leg 4 (Endgame): does a moot/brokerage-playing policy reach witness/indispensable?

**Run:** 2026-10-16 · Worktree `journey-endgame4` · run_id 2026-10-16T22:51:00+00:00
**Harness:** `scripts/table-answer-probe-r15-20261016.js` (r14 lineage: sit-from-Haven at first tablePreview().ready, PATH_PREF, beat-driver with opts[0], opt-in trial-by-combat, refusal of the dark conscript)
**Policy:** `scripts/policies/mootlaw.js` (new) = leadfeast + the moot-exposure lane + teaching + weregild-brokerage: daily, for every open/dormant case known to the player the policy holds a conversation and plays `betrayal:investigate:` → `betrayal:expose:` → optionally `betrayal:moot:`; at a pending-player-vote trial it votes guilty when bribery was found/exposed (conviction pushes toward exile/weregild sentences); when accused it plays the dossier (investigate, expose, speak) instead of ignoring the case; it takes `teach` choices when offered. FEASTSCALE_R13=1 kept (leadfeast base).

## Pre-registration (§11 — written BEFORE any run)

**Leg question (r15):** r14 answered all 7 paths + a dark branch. Defiant was naturally reachable (3/4 seeds on the leadfeast policy). Witness and indispensable were earned on 0/4 natural runs — the leadfeast policy never plays the moot-exposure lane and never builds brokerage/food-sharing. r14 called this a policy-coverage gap with structurally sound prereqs. Does a moot/brokerage-playing policy NATURALLY reach witness/indispensable (no staging, no FORCE_PATH)? If yes, reachability is confirmed; if no, diagnose policy depth vs game defect.

**Pre-pilot substrate check (§14b):**
1. Contact: NPC-NPC cases surface via `caseDiscoveryTick` (gossip, 1–2 days after opening, role 'juror') — verified in betrayal.js:4099–4114.
2. Verb existence: bystander verbs exist — `betrayal:investigate:<id>` → `betrayal:expose:<id>` → `betrayal:moot:<id>` (betrayal.js:3855–3865); accused dossier verbs exist (investigate/expose/speak); trial votes via `betrayal:vote_guilty:/vote_acquit:`. Teaching = `teach` convo choice → `ledgerAdd('foodShared')`.
3. Pool sizing: each successful exposure = +2 exposed (ledger.js:1389); witness needs exposed ≥ 3 → 2 exposures minimum. Case frequency in 180-day runs is unknown — Stage 0 measures the actual case/exposure pool before any threshold is set on indispensable (whose pool is unbounded but rung-gated).
4. Horizon fit: cases arise across the run; the table sits ~day 90+ (r14: 89–96 on 3/4 seeds). 180d horizon (§10 reachability band 150–200d; r14's 120d left 1/4 seeds un-announced — not cross-comparable, same metric though). Death-aware stop applies (§10 +10d tail max).

**Primary metric (one):** count of pilot seeds (of 4) where WITNESS is earned naturally — `L.exposed ≥ 3` read from the real ledger at sit time, witness in tableEarnedPaths().earned = true, no staging, no FORCE_PATH.
**GO threshold:** ≥ 1 of 4 seeds earns witness naturally. **NO-GO:** 0 of 4.
**Secondary metrics:** (a) the three indispensable rungs reported separately — seat rung (full seat? — needs wave4 ≥ 3 / wave5 ≥ 2 distinct fought, currently substrate-flagged as aspirational in sims), foodShared > 0 rung, score ≥ 10 rung; (b) mean exposed/foodShared/brokerage at sit day vs r14's leadfeast zeros; (c) moot lane fired counts (cases seen, investigations, exposures, trials attended, votes cast); (d) trial-by-combat offered/legible where offered; (e) post-win people check on ≥1 walk (PROBE=1).

**Seeds:** 48, 37, 5, 71 — the SAME r13/r14 seeds (MEASUREMENT §1 identical seeds).
**Horizon:** 180 days. Why: §10 reachability lever (150–200d); exposure needs multiple case windows (NPC cases open ~day 10+ and the table sits day 90+); r14's 120d truncated one seed pre-announcement. Death-aware stop: dead/scattered village stops, ≤10d tail, never ticked to fill the horizon.

**Interesting-finding bar:** a case/exposure mechanic that never fires despite the policy playing the lane (game defect, not policy); a rung of indispensable blocked by something other than the known wave-4/5 substrate; a moot-exposure transcript that reads as theater (no real evidence, no belief movement); an exposure that fires but exposed never increments (ledger-wire gap).

Anti-drift (§14): the metric binds. A miss is NO-GO, never re-scored against "well, the lanes fired". Metric doubts → metric review below, for r16.

## Results

### Stage 0 smoke (2 seeds → expanded to full pilot on lane-fire)

s48 (fixed policy): the moot lane FIRES end-to-end — 4 talks, 4 investigations, 1 exposure (+2 exposed), vote deferred to the second pending day, guilty vote cast. The vote-timing fix was REQUIRED: naive play (vote when the moot turns to you) closes the trial-pause window before simBriberyTick plants any bribe — exposure is unreachable by construction without the deferral. Transcript-verified (see below).

### Stage 1 pilot (4 seeds: 48, 37, 5, 71 — mootlaw policy, 180d, PATH_PREF=witness,indispensable, no staging, no FORCE_PATH)

| Seed | Days | Outcome | Cases known | Exposures | exposed | foodShared | brokerage | might | Seat | Path walked |
|------|------|---------|-------------|-----------|---------|------------|-----------|-------|------|-------------|
| 48 | 79 | village-lost | 1 | 1 | 2 | 2 | 4 | 68 | — (died) | — |
| 37 | 90 | won | 0 | 0 | 0 | 1 | 4 | 84 | lesser | feared (fallback) |
| 5 | 180 | survived | 0 | 0 | 0 | 0 | 4 | 145 | none (never announced) | — |
| 71 | 107 | won | 0 | 0 | 0 | 1 | 5 | 143 | lesser | feared (fallback) |

Mootlaw lane counts: s48 {talks 4, investigated 4, exposed 1, voteDeferred 1, votedGuilty 1, taught 1, casesSeen 4}; s37/s5/s71 all zeros — no cases surfaced, so the lane had nothing to play.

**PRIMARY: 0/4 seeds earned witness naturally (GO needed ≥1/4). NO-GO — metric binds, no re-scoring.**

Indispensable rung breakdown (secondary):
| Seed | Full seat? | foodShared > 0? | score ≥ 10? |
|------|-----------|-----------------|-------------|
| 48 | NO (died d79) | YES (2) | YES (4+68+2=74) |
| 37 | NO (lesser) | YES (1) | YES (4+84+1=89) |
| 5 | NO (never announced) | NO (0) | YES (4+145+0=149) |
| 71 | NO (lesser) | YES (1) | YES (5+143+1=149) |
The policy builds the ledger rungs (teaching/gifts → foodShared; weregild/formal parties → brokerage; might accumulates) — the FULL-seat rung fails on 4/4: audits show waves 1–3 only (s37: 19/5/4; s71: 15/5/3), wave-4/5 fights don't occur in sims (readiness gate, design call #4 — intentional substrate).

### Diagnosis: policy depth vs game defect

**Not policy depth.** The policy plays the lane whenever the substrate offers it — s48 proves the full chain: investigate → expose (+2) → deferred vote → guilty vote, all through real engine verbs, all transcript-sensible. The teach lane works (foodShared>0 on 3/4). The weregild/formal-party lane works (brokerage 4–5 on 4/4).

**Game substrate (both paths):**
1. *Witness — the case pool is starved.* 1 case in 346 run-days across 4 seeds. Cases come from betrayal plots (`considerBetrayalPlot`: motive ≥ 45, R()<0.4/day, and the "beloved village: basically never" gate at avg trust > 55) or player crimes. Competent play keeps trust high — the witness lane's substrate is crime, and a competent player can't ethically farm it. Even with a case, exposure needs the trial-pause window (bribery exists ONLY while `cs.trial` pends — simBriberyTick line 4067) + a planted bribe (R()<0.35/day × ~2 days) + a successful dig. Two exposures needed for exposed ≥ 3; observed rate ≈ 0.25 exposures/run.
2. *Indispensable — the full-seat rung needs wave-4/5 fights that don't happen in sims* (readiness gate holds by design). The ledger rungs are reachable; the seat isn't.

Kill taxonomy (§14a): **SUBSTRATE-MISSING** for the natural-reachability claim on both paths — the mechanisms work (not concept-dead), the metric measured the right thing (not metric-broken). The witness path's deeper tension (flag for Steve): its substrate is crime-adjacent play — the accused's defense window is the richest exposure pool (bribery planted R()<0.3/day pre-trial), which a "competent player" brief won't touch. Reachability either needs more NPC-NPC cases or a lower exposed bar — a design call, not a policy fix.

## Blank FILLED: the exposure window was unreachable by naive play

**Found:** for NPC-NPC cases, bribery exists ONLY while the trial pends (`simBriberyTick`: `if (cs.status !== 'open' || !cs.trial) continue`) — i.e., only AFTER the moot convenes. A policy (or player) that votes the moment the moot turns to them resolves the trial before any bribe can be planted — exposure is unreachable by construction. The fiction honestly offers two days ("The moot doesn't wait forever — the count is taken without you", `trialVoteTick` at trial.day+2).
**Fix (policy-side, committed):** mootlaw investigates daily while the vote pends and votes on the second pending day, after the last dig — voting during D+2's daily beats `trialVoteTick`. Proof: s48 — 1 exposure, +2 exposed, transcript reads genuinely (see People check). This was a policy-depth gap, now closed; it only matters when cases exist, which is the deeper substrate gap above (documented, not fixed — case frequency is a design call).

## People check (SENSE-TESTING LAW)

**The exposure (s48, Arlo case)** — read in full. Investigation: "There it is: Arlo bought Wanjiru. Follow the food — it always works." Exposure: "At the moot, you lay it out: who paid whom, what changed hands. The fire goes very quiet. Nobody likes being bought — least of all the ones who weren't." Consequence: "The village will remember this the way it remembers winters: Arlo tried to buy a voice — 800 kcal changed hands. It didn't stay secret." The verdict: 3 guilty / 6 acquit — "Not guilty — this time." The player's guilty vote "lands in the count, out loud, in front of everyone. The accused hear exactly who said it." The village decided against the evidence — honest, not theater. No fabricated history, no filler, no static menu.

**Post-win (s37, feared win, PROBE=1, NV=3)** — 3/3 conversations mentioned the table (r13's resolved-pool fix holds). Luis: "You walked out of the light and came back breathing. Did it work? Is it done?" — the want (curious) engages honestly ("I don't know." → "Honest. I'll take honest over certain every time."). Teaching fires five times with five distinct, personality-flavored reactions ("And I've been walking past it for weeks."). Ends resolve ("Good talk."). The bearer fix reads live: `bearer=Bogdan` (was null in r14).

## Village assessment (plain words)

**s48 — the exposed village.** One case in 79 days: Arlo accused over Raj. The bearer dug up the bribe, named it at the moot, voted guilty — and the village acquitted anyway. Then the Anaconda Empress mauled Raj and the roster bled out; the village died at day 79 with exposed=2, one short of witness. The village that did everything right and still died.

**s37 — the feared village.** No cases, no crime, no exposure. Reached the table at day 90 with a lesser seat (national, waves 19/5/4), walked feared, won. Bearer Bogdan. The village that priced strength, not justice.

**s5 — the quiet village.** 180 days, no cases, and the table never announced — the food-deed rung (sentimentTaught + feastSurgeUsed) never filled despite waves 14/9/7, 21 contests, 4 crises, national standing. Bearer Helga. A strong village that never got its invitation: the seat is a bar, not an appointment.

**s71 — the global village.** No cases. Lesser seat at day 107 (global standing, waves 15/5/3), walked feared, won. Bearer Aroha.

Across the leg: the moot lane works when the world gives it a case; the world almost never does. Villagers testify, vote, remember, and decide against the evidence when they feel like it. The endgame still reads the run back honestly.

## Reachable / fun / winnable (endgame leg)

- **Reachable:** witness NO (0/4 natural; substrate-starved, not policy) — indispensable NO (ledger rungs yes, full seat no — wave-4/5 substrate gated). Defiant remains the naturally reachable path (r14: 3/4); feared won 2/2 as the fallback here.
- **Fun:** the moot-exposure lane, when it fires, is the best social gameplay in the endgame — real evidence, a real vote with a real price, a village that can still acquit. The s48 exposure is the single best social beat this loop has produced.
- **Winnable:** YES — 2/2 answered walks won (feared). The table still prices and pays.

## Metric review (§14, anti-drift)

**PRIMARY NO-GO (0/4 < 1/4).** No re-scoring: the metric said "witness earned naturally" and it wasn't. The kill verdict is SUBSTRATE-MISSING, not concept-dead — the exposure mechanism works, the case pool doesn't.
Notes for r16:
- A future witness-reachability run has two honest options: (a) an accused-path policy (the defense window is the richest exposure pool — bribery planted R()<0.3/day pre-trial), but that means the "competent player" brief commits crimes — perverse, flag for Steve before running; (b) a design change to NPC-NPC case frequency, which is Steve's call. Do not re-run the same policy expecting a different pool.
- Horizon note: 180d vs r14's 120d — not cross-comparable (r14 metric review already flagged horizon-sensitivity; s5's 180-day no-announcement vs r14's s71 120-day no-announcement confirms the seat bar is honest, not the horizon).
- s48's village death at day 79 with exposed=2 is the closest natural approach to witness yet — the death-aware stop worked as designed.

## Telemetry deviation check

`telemetry-check.js` vs `telemetry-baselines/endgame.json` (metrics: national,table,wins,exiled,seatApproach,wave5unlocked,tableSceneFired,tableSceneCompleted,ascensions): **2 LOUD lines — wave5unlocked 4→0, ascensions 3→0.**
- The r15 schema fix is verified (fields ARE emitted: wave5=0, asc=0 in the JSONs) — these are now REAL measurements, not schema gaps.
- **wave5unlocked: EXPLAINED, not a bug.** The baseline's 4 came from pre-readiness-gate runs (r10–r12); the readiness gate (design call #4, landed 2026-10-16) intentionally defers wave-4 with named bars. The substrate changed by design. This is exactly what blocks the indispensable full seat.
- **ascensions: EXPLAINED.** No facilitation play in the policy + early answers (day 90) or early death (day 79) — nobody cleared the ascension bar on these streams. r14's s37 stream did (Hannah, un-facilitated); it's stream-dependent, not broken.
- **Baseline NOT rolled.** The wave5unlocked deviation reflects an intentional design-call substrate change — rolling it is a loop-level decision, not this run's.

## Regressions

- `node scripts/check.js --quick`: 96 passed, 1 failed (216s) — the 1 failure is PRE-EXISTING and unrelated: `scripts/probe-feed-where-20261014.js` requires `./policies/succbrake`, deleted by the sibling's kill commit a60273ad ("sim-succbrake ... KILLED AT PILOT ... Layer deleted per kill protocol") which left the require dangling. Not my lane (flesh-out loop's probe) — documented, not fixed. The 2 stranger-conversation assertion fails in test-where-are-we are the known pre-existing ones (r13/r14). My change is tooling-only (scripts/, policies/) — the green list can't be affected.
- `scripts/test-r15-probe-fixes-20261016.js`: 23/23 green on seeds 48, 37, 5 (bearer RED→GREEN: old expr null, new expr returns the name; schema keys emitted; staging refusals present).

## Files

- `scripts/policies/mootlaw.js` — the moot/brokerage-playing policy (leadfeast + investigate/expose/deferred-vote + dossier defense + teaching)
- `scripts/table-answer-probe-r15-20261016.js` — r15 driver (mootlaw, bearer fix, schema extension, natural-only refusals)
- `scripts/test-r15-probe-fixes-20261016.js` — proof, 23/23 green
- `evidence/2026-10-16/journey-endgame-r15.md` — this note
- `evidence/2026-10-16/journey-endgame-r15-answer-{s48,s37,s5,s71,s37-probe}.json` — per-seed results
- `evidence/2026-10-16/journey-endgame-r15-answer-{s48,s37,s5,s71,s37-probe}.txt` — full transcripts
- `evidence/2026-10-16/journey-endgame-r15-postwin-s37-probe-day90-*.txt` — post-win people-check transcripts
