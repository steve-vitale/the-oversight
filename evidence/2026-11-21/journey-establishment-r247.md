# Journey establishment r247 — run note

- Run: `playtest-20261121T0943Z` (Lane A, scheduled Sat 2026-11-21 03:45 CST)
- Leg: establishment (days 14–40, 42-day horizon, death-aware tail +10d)
- Seeds: **101966–101970** (fresh band; full-scope freshness search 2026-11-21 ~10:30Z: zero hits in preregs, evidence filenames, `git log --grep=10196`, repo evidence `*.md`, goal hidden_files `*.md` — the only `10196[6-9,70]` hits anywhere are digit substrings inside floating-point values in old corpora (e.g. `"kcal":101966` in a seed-14515 crisis file), not seed-band namings; backup candidate 108101–108105 held in reserve; see prereg)
- Base: local master `2b97163b0` at registration (master moved during the run — a Loop A adoption landed 16 commits; branch `journey-establishment` was fast-forwarded from the old tip `06852bcd4` to `2b97163b0` in the worktree; status clean)
- Base delta vs r246 panel base `1581a7887` (src/js, +933/−19, 9 files): WIN-PLAN LIVE + expanded (`win-plan.js` +337 reseed, +116/−29 reseedbeat finding #2632; deathcleanup; vetreengage OFF by default; win-intel), DOWNTWICE fix (`fieldFights.js` +11, finding #2634 GO), WILDAVOID (`5402d4cc3`, finding #2506), `bond-initiation.js` +65, `contests.js` +53 (lendfix rebuild OFF by default + dead-borrower gun return, finding #2629), `convo-dialogue.js` +25 / `conversation.js` +4/−1 (succession r262), `villager-brain.js` +6/+12; build.js stamp only. SHAPE2, M2STEP2, LEADSIDE, DEPMAT/ROLL35/AMMO substrate, holdersupply BIGBUNDLE reverted, net 0.
- Prereg: `evidence/2026-11-21/journey-establishment-r247-prereg.md` (this note adjudicates against it; metric binding applies — a miss is NO-GO, never re-scored mid-run)
- Rotation file read **1 (establishment)** — no queue jump; this run plays leg 1.
- Write flap: registration failed 3× — first after a full ~106k-file checkout (`fatal: Could not reset index file to revision 'HEAD'`), then instantly on `could not write to '.git/worktrees/journey-establishment/locked': Operation not permitted`. A strace traced the flap switching ON mid-checkout (~9 min in; first refused write on an old evidence JSON, then all 80,926 further writes EPERM). Workaround (documented in the prereg): `git worktree add --no-checkout` + cone sparse checkout of every top-level dir EXCEPT `evidence/` (12,516 files in ~49s, status clean) + manual registry entry in the register script's exact shape via atomic write. **Consequence: this worktree has NO `evidence/` dir — the prereg and this note live in `evidence/2026-11-21/` inside the worktree as new files, and closeout must run `git sparse-checkout add evidence/2026-11-21` before safe-commit (adding the whole `evidence/` dir would check out 94k files — do NOT do that).** Panel JSONs live in the goal hidden_files evidence dir, as always.
- Lock created 09:43Z (run_id playtest-20261121T0943Z). Heartbeat loop running (9-min cadence, detached setsid loop, PID 115539).
- Pilot: seed 101966 completed clean (exit 0, ~22s); all pilot-gate criteria passed (standingEnd 150, scholarDawns 42, teleTypeCounts 53 keys, mootLines/caseLog present, warnLog/settledFavorLines/dryLines/dayDesync present, rosterArrivals [] present, spotterTenure 3 tenures, arrivalLines [], winplanLines [], winPlanEnd `{ignited: false, stats: null, plans: []}`, sittingCloses 2, bumpLog 12, wedgeSits 72 with Q1 trace fields). Panel ran 101967–101970 (all exit 0, ~92s total).

## Panel results

| seed | endDay | alive d40 | alive end | wave | standing | pantry kcal | spotter (cum) | ladder | bumpCalls/benefit | scholar deaths |
|------|--------|-----------|-----------|------|----------|-------------|---------------|--------|-------------------|----------------|
| 101966 | 43 | 10 | 9 | 4 | 150 | 15,711 | 1 (9) | no | 12/6 | Stanley d35 (wild, haven-edge), Nadia d40 (wild) |
| 101967 | 42* | 11 | 11 | 4 | 100 | 11,821 | 9 (9) | YES | 28/28 | — |
| 101968 | 42* | 11 | 11 | 4 | 100 | 9,500 | 1 (1) | no | 3/0 | — |
| 101969 | 43 | 12 | 12 | 3 | 20 | 95,986 | 17 (17) | YES | 60/60 | — |
| 101970 | 43 | 11 | 11 | 3 | 65 | 49,210 | 5 (14) | YES | 33/15 | Jamie d25 (night, haven-edge) |

\* one game-day short (net drift −1; see day-desync below). All 5 seeds: roster reconcile UNACCOUNTED=0; removals all "killed".

## Bar verdicts

- **SPOTTER — GO.** Panel foodXp['spotter'] total **33** (bar ≥10 ✓), seeds with >0 = **5/5** ✓. Cumulative second number: **50** (end-holding 33); max skill reached 3 (seeds 101967, 101969). Per-seed cumulative: 101966: 9 (Stanley:7, Nadia:1, Kieran:1), 101967: 9 (Hilda:9), 101968: 1 (Dakota:1), 101969: 17 (Morris:17), 101970: 14 (Jamie:9, Nathan:5).
- **LADDER — 3/5** (bar ≥4/5 under SPOTTER GO — pace read only). r246: 3/5.
- **FASTER-ID — GO.** Benefit fired on 4/5 seeds (109 benefit plays in 136 bump calls; bar ≥2/5). 101968 had 0 benefit in 3 calls.
- **CODEX — 132 plants** panel-wide (report-only).
- **END — GO.** 9/9 broken-live forage opportunities closed within 2 dawns. THREAD 3/3 paged (3/9 end sits paged). TRAVEL 0/0 NO-OPPORTUNITY. TRUST GUARD 0 drops. JAM 0. VILLAGE 5/5 alive at d40.
- **Q2 — GO.** 0/10 CUT sittings; 2 engine-ended WITH closing beats.
- **Q1b WANT-RAISE — GO on rate, F5 FLOOR shape RECURS.** Panel 41/340 social sits raised ask_favor (**12.1%** ≥10% ✓), 0 zero-raise seeds. Kinds: forage_help 29, heal_help 6, sick_help 3, water_haul 2, food_share 1. Thinnest seed **6.6%** (101969: 5/76, all forage_help), fattest **20.0%** (101968: 12/60) — thin<7% while fat>15%. The r242 finding stays with the build arm.
- **Q1 FAVORLESS ASK — GO, 0/41 (0.0%).** Zero favorless sits, zero LOST asks — **the first clean panel in the series** (r246: 3/69, LOST 3; r245: 4/70, LOST 2). E1-case 0, E1-plain 0; stage-0-deflected 0.
- **Q5 — NO-OPPORTUNITY.** 0 exiles on the panel. One exile-narration line: 101968 d35 "Dakota isn't pulling weight" (stage-1 gossip, no exile followed).
- **Q6 — no F4 shape.** bumpCalls 12/28/3/60/33, wedgeSits 72/74/63/77/76, joint forage commits 5/2/5/2/6 (101968 bumpCalls=3 but wedgeSits 63 — not ≤2).
- **COUNTER — PASS.** 89 COUNTER LEARNED lines, 0 comma-clause, 0 em-dash.
- **BOWCRAFT — 16 bows** equipped panel-wide (r246 corpus 10, r245 7); per-seed 3/2/5/3/3. Telemetry /bow/i scan 0 (blind-scan confirmation).
- **WARN-HEED — GO, second voice CLOSED.** 25 warn_you sittings, 11 with a warning delivered, **0 engaged sittings with NO warning delivered**. The 14 sittings that ended before engagement delivered nothing (no finding). Deliveries came from **six distinct villagers** — Sofia (101967, 3), Devon (101968, 2), Ella + Paloma (101969, 1+2), Juan + Vasyl (101970, 2+6) — against r246's watch where all 8 sittings were one voice (Tom). The second-voice question is answered.
- **SETTLED-FAVOR — 0/0**, no opportunity. **DRY2 — 0.** **SELFWIT — 0 observable** (0 deaths carried a witness list).
- **DAY-DESYNC — net drift −2.** Seeds 101967 and 101968 each **ONE GAME-DAY SHORT** (endDay 42, net drift −1; the r245 101955 shape, twice in one panel). 101966/101969/101970 net drift 0. Jitter repeats/skips: 3/3, 5/4, 1/0, 6/6, 4/4. Adjudication: **no bar affected** — both short seeds still reached wave 4 and standing 100, and no bar depends on day 43. Named per seed as the prereg requires.
- **STRANDED — 18 dawns on 1 run (101970), mechanism held.** worked-on-stranded 0, guard fires 0, social-sit dawns 16/16, 0 misses, 0 new commits. See defect findings — the run is a permanent orphan left by a dead bearer.
- **SILENT-ARRIVAL — 0 arrivals, 0 silent** (no opportunity; the watch is proven working by the fork proof flagging the r246 pair).
- **WINPLAN LAUNCH WATCH — 0/5 ignited.** planSeeds 0; partyDepartures 0 (trios 0, quads 0); partyFights 0; reseeds 0; expiries 0; launch beats 0; expiry beats 0; reseed beats 0. **The headline finding — see below.**
- **F2 SCHOLAR DEATHS — 3 on the panel** (bar: ≤2 WATCH, ≥3 INVESTIGATE). Investigated below.

## Defect findings — WINPLAN non-ignition (headline)

The win-plan system — the villagers' own gameplan toward the win (gear → party → hunt → standing → table), new in this base — **never ignited on any of the 5 fresh villages over 42 days**. Seventh silent panel (r241–r247; the SENSEEXPED silence renamed, same zero). planSeeds 0, partyDepartures 0, partyFights 0, reseeds 0, expiries 0, all three beats 0 — despite 3/5 seeds reaching wave 4, standing to 150, 14–23 killer tales per seed, combat starts on 4/5 seeds, companion kills 1–7 per seed.

**Root cause, established by code reading (not speculation).** The plan store (`village.winPlan`) is created only by:

1. `winPlanSeedFromFight` — called when a villager evades or flees a wave-3+ beast through the agency expedition paths (`villager-agency.js:681` evaded, `:764` fled — ungated) — or by `winPlanNoteKill` when a villager kills a monster through that path (`villager-agency.js:694` — creates the store, though not a plan). Wave-gated inside the seed (wave ≥ 3).
2. The env-gated flags `PLANFIX=1` (store initialized on the first Haven tick) and `VETREENGAGE=1` (flee-seed from `game.js:21517`) — **node sims only; in the browser `process` is undefined, so neither ever fires in the live game.**

On this panel the store was **never created on any seed** (`winPlanEnd: ignited=false, stats=null` — the driver reads raw state, so a created-but-empty store would show `ignited=true`). That proves **zero wave-3+ agency evades, flees, or kills across 210 village-days**. The scholar's own fights never touch those hooks: the scholar's flee path in `game.js` is VETREENGAGE-gated (off in the browser), and companion kills in the scholar's field fights are not the agency vKill path. **The competent player's fights — the thing this leg plays — cannot wake the system.** Compounding gates even if the store existed: the Haven tick seeds only for wanderer/explorer-profile villagers at Haven with personally-fought or village-slain knowledge.

The November 17 "wake the store on the first Haven day" fix exists only as the env-gated PLANFIX flag, not as live behavior. The sim arms that set the flags proved the machinery works (planignite-a DIAG, vetreengage, reseed) — **only the live ignition path is missing**.

**Verdict: the win-plan system is effectively dead on the establishment leg — it cannot be the thing that carries villages toward the win.** This is a build-arm finding (goals arm / win-plan arm), not a measurement failure: the panel is the instrument, the system reads zero because its ignition path is unreachable in normal play. No fix landed here — a fix changes game code and needs the goals arm's design call, because the ignition condition itself is the design question: should the scholar's fights, the fire's deed talk, or the first Haven day wake the store? Proposed, not landed.

## F2 scholar deaths — investigated (3)

- **Stanley, 101966 d35, "the wild"** — last dawn d35 at (4,4), atHaven=true, insideHaven=false. **Haven-edge.**
- **Nadia, 101966 d40, "the wild"** — last dawn d40 at (3,4), atHaven=false. Out in the wild, one tile from the haven edge.
- **Jamie, 101970 d25, "the night"** — last dawn d25 at (4,4), atHaven=true, insideHaven=false. **Haven-edge.**

Haven-edge 2/3 this panel (5 across the last two panels + r244/r245). WILDAVOID is new in this base (outmatched-avoid on wild routers) — it did not move the shape: these deaths are at or one tile from the haven edge, not deep-wild router deaths, and no mechanism ties the count to the base delta. The count (3) is within panel range (r242 6, r243 3, r244 4/2, r245 4, r246 6) — band noise for the count; the haven-edge LOCATION pattern is the standing goals-arm question (graduated r246). No fix landed. No scholar deaths on 101967/101968/101969.

## STRANDED 18 dawns — an orphan left by a dead bearer (101970)

Seed 101970: Jamie was the scholar and bearer of a joint forage_help run for Jack. Jamie died d25 ("the night", haven-edge). The run stranded d26–d43 — 18 dawns: *"previous bearer: run bearer Jamie is not the current villager; the run can neither be worked nor ended."* The successor scholar (Nathan) sat socially on 16 of the 18 stranded dawns (16/16, 0 misses), worked the run 0 times, made 0 new commits. The mechanism held — but the run is a **permanent orphan**: a joint favor whose bearer died can never be closed by anyone, and the ledger carries it forever. Documented for the build arm: a dead bearer's joint run should either pass to the successor or be closable. No fix landed.

## 101969 — the standing-20 cousin

12/12 alive, zero deaths, richest pantry (95,986 kcal), spotter 17, bump 60/60 — and standing 20, wave 3. The village that wants for nothing gains no standing. Same family as the standing-0 shape (r246's 101963: standing 0). Standing is not tracking village health on this leg — the ladder's standing arm is the goals-arm question (WAVE-4/STANDING watch). Report-only.

## Census (Q4, plain words)

- **101966** (12→9 alive, wave 4, standing 150, pantry 15,711): the hard village. Three scholar-chain deaths — Quinn d26 to a monster, Stanley d35 and Nadia d40 to the wild — and the knowledge died with them (spotter end-holding 1, cumulative 9). Still the second-highest standing on the panel.
- **101967** (12→11, wave 4, standing 100, pantry 11,821): one monster death (Elena d33). Spotter 9, no scholar death. The steady village.
- **101968** (12→11, wave 4, standing 100, pantry 9,500 — thinnest): one monster death (a young villager d28). Spotter 1, only 3 bump calls — the quiet village; the one exile-gossip line on the panel (Dakota, d35, stage-1 only).
- **101969** (12→12, wave 3, standing 20, pantry 95,986 — richest): **no deaths at all**, spotter 17, bump 60/60 — and standing 20. The village that has everything and goes nowhere (see above).
- **101970** (12→11, wave 3, standing 65, pantry 49,210): scholar Jamie died d25 at the haven edge, leaving an orphaned joint run for Jack that stranded 18 dawns. Spotter 5 end / 14 cumulative.

## People check (SENSE-TESTING LAW — 4 held convos read in full, seeds 101966/101967)

- **Ethan (dry cleaner, 101966):** opens on grief — "We never finished talking about grief — we wandered off it." Gossip names a real thing (Chloe won The Pit). "You walked out of The Pit. Alive. That's the whole story and it's enough." Ends in shared silence: "This was good." Meaningful, coherent.
- **Aaron (appliance repair tech, 101966):** the invite is accepted with a condition — "Alright. But I'm not carrying your stuff." The change question ("Has this changed you? Like, fundamentally?") is answered both ways, his own answer grounded in his old job: "I used to be an appliance repair tech who worried about being on time. Now I worry about being alive. Same worry, bigger font." Ends resolved. Good.
- **Brooklyn (journalist, 101967):** warns about Vasyl by name ("Watch yourself around Vasyl. I can't tell you why. Just... watch.") and ends with an honest boundary ("That's enough sharing for one day. Maybe one week."). But the r241 dry beat — "The moment passes without landing. Not yet." — fires in her OPENING resume line.
- **Brunhilde (rancher, 101967):** the dry beat fires again mid-sitting after a goon. Her Columbus line is grounded and personal ("You know what I miss? Columbus, Ohio rain. Specific rain. I'm allowed to be specific."). Ends with "Alright — I should get back to it."
- **Dry beat count:** 3 servings across the panel (2 on 101967, 1 on 101968) vs 1 on r246. The DRY2 watch counts a different line (0) — the r241 dry beat is a separate line and it is serving more often. Polish note for the conversation build arm.
- **Stage-direction-as-dialogue:** 2 servings ("They hear you out, but something in them stays guarded." — Ethan; "They take it in and give nothing back. Not yet." — Brooklyn). Same polish note as r246.
- **GOAL-BRIDGE:** 0 of the six pool lines appear in any held convo — no repeats, but also no occurrences to judge.
- **MOURNING WITNESS:** Ethan's sitting is a grief sitting; the speaker's witness status is unobservable from the JSON (no death carried a witness list — SELFWIT 0 observable). Reported, not adjudicated, same as r246.
- **F2 ECHO:** no acceptance echoes in the held sample (Aaron's invite is a conditional accept, not an echo).
- **Verdict:** villagers act like people. No filler loops, no static menus, no fabricated shared history.

## Reachable / fun / winnable

- **Reachable:** yes — everything on this leg fires: contests, bonds, teaching, foraging, the ladder, warnings, gossip. The one exception is the win-plan system, which never fires at all — not unreachable-by-difficulty but unreachable-by-construction.
- **Fun:** the villages read as alive — gossip names real people and real events, warnings come from six voices, the pantry swings from 9,500 to 95,986 kcal. The dry-beat repetition and stage-direction lines are polish, not fun-breakers.
- **Winnable:** the chain is still stuck at the same place — villages reach wave 4 and standing 100–150, but the system meant to turn that into a plan (win-plan) never wakes, and no seed opened wave 5. The winnability push's binding wall is now visible in the open: the game has a system for pursuing the win, and it cannot start.

## Metric review (for the NEXT run)

1. **SPOTTER cumulative second number — READ.** Panel cumulative 50 vs end-holding 33; the second number did its job (101966: 9 vs 1; 101970: 14 vs 5 — the knowledge that died with the scholars is now visible). Keep as the standing second number; no revision.
2. **E1 majority rule — READ.** With zero favorless sits this panel the rule had nothing to classify; the fork proof showed it re-classifies r246's August as E1-case (7/7 picks) and Lauren/DeShawn as E1-plain. Keep the majority rule; no revision.
3. **SILENT-ARRIVAL watch — READ.** 0 arrivals, 0 silent on the panel; the watch is proven working (fork proof flags the r246 pair). Keep; no revision.
4. **WINPLAN watch — READ.** 0/5 ignited, all counters zero. The watch works (fork proof: ABSENT on the pre-r247 corpus, present on this panel). Keep for r248; if the goals arm lands an ignition fix, the watch becomes the before/after instrument. No revision.
5. **REACT retired — CONFIRMED.** No react computation in the analyzer (0 `react*` references); the r246 retirement stands. Kept on scale only.
6. **Day-desync net-drift metric — the −1 shape recurred twice** (r245 once, r247 twice, r246 zero). The metric names it per seed as required. No revision proposed; if it recurs again, the clock-jitter cause deserves a diagnostic (the game-day counter skipping a day under load).
7. **F5 floor — the thin<7%/fat>15% shape recurs** (6.6%/20.0%). The finding stays with the build arm; the metric stays report-only. No revision.
8. **WARN-HEED second voice — CLOSED.** Six distinct delivering voices this panel (Sofia, Devon, Ella, Paloma, Juan, Vasyl). The r246 watch question is answered; the watch returns to its standing GO form (every engaged warn_you sitting names a danger) without the second-voice rider.
9. **Q1 — first clean panel in the series (0/41).** The tenth fresh-band re-read closes the r231 settled-ledger fix's verification arc: the fix holds across ten fresh bands. Propose retiring the full Q1 trace for r248 (keep the rate as a standing guard, drop the per-sit classification) — a metric-review proposal for the goals arm, not a mid-run re-score.

## Proof tests (all re-run on the new base, worktree)

14/14 GREEN (log `hidden_files/r247-proof/proof-batch.log`): r240 walkHome 27/27, r231 settled-help 19/19, r230 stage0-help 13/13, r225 stage0-cant 18/18, r214 mood-goodbye 10/10, r139 spotter 35/35, r221 want-raise 7/7, r137 clearhome 37/37, r146 want-bridge ALL GREEN, r243 link-accept 61/61, r148 link-accept rotation ALL CHECKS PASS, r147 maps-pools ALL GREEN, r244 counter-label 19/19, r254 mourning witness ALL GREEN. No new proof test — no defect found in a mechanism a proof test would cover (the WINPLAN finding is a game-code design question, not a mechanism regression).

## Analyzer fork proof

r246 corpus copied to `hidden_files/r247-analyzer-proof/` (renamed r246→r247; logs `r246-baseline.log` + `r247-fork.log`). Diff (79 lines) shows ONLY intended changes: old-bar numbers reproduce exactly (Q1 3/69 = 4.3%, LOST 3, Q1b 69/374, SPOTTER 33 4/5, LADDER 3/5, FASTER-ID 5/5, END 3/3, VILLAGE 5/5, Q2 0/10 CUT, scholar deaths 6); E1 re-classifies under the majority rule (E1-case 1 — August 7/7; E1-plain 2 — Lauren 0 picks, DeShawn 1/12); ARRIVAL flags Lena Ruiz + Nathan Lee with day UNKNOWN (rosterArrivals absent on old corpus); SPOTTER cumulative ABSENT; WINPLAN ABSENT; REACT lines gone. A late fix made the cumulative panel line print "ABSENT — pre-r247 corpus" instead of "panel cumulative 0" when no seed carries the instrument; the fork log was re-run after the fix.

## Gate + telemetry

- **Gate: 327 passed, 17 failed in 690s** (`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest` in the worktree; log `hidden_files/journey-establishment-r247-gate.log`). r246: 336 passed, 8 failed. **0 failures attributable to this run** — this run changed zero src/js files (the branch adds only the driver, analyzer, prereg, and run note, none of which the gate runs). All 17 classified with direct evidence:
  - **8× sparse-checkout ENOENT** — tests reading `evidence/` files that exist in the main tree but were never checked out in this worktree (the flap workaround): controller-census (`2026-10-17/livelihood-port-r3-neutral.json.gz`), conversation-answer-context + legacy-map-nightfall (`2026-10-18/installed-update-old-save-r1.json`), measurement-comparison + measurement-proof-update + measurement-workflow (`2026-11-19/neutral-new.json.gz` — the r246 staleness pair fails ENOENT here, not staleness), phone-frame-proof (`2026-10-18/phone-frame-replay-r1.js` source hash), regional-sprites (`2026-10-17/regional-visual-legacy.json`). Each path verified present in the main tree. These would pass in a full checkout; they are artifacts of this run's workaround, not game regressions.
  - **7× write-flap EPERM** — measurement-flags, measurement-source-text, measurement-cache-flags, prepared-runner-custody, proof-text-identity, deathcleanup-instrument, occupation-panels. Every one is an `EPERM: operation not permitted, write/copyfile` in the log; the last two were re-run directly and hit the flap live (occupation-panels: EPERM copyfile into a /tmp cohort dir; cache-flags: EPERM write in balance-panel.js:328). The flap was active during the gate and is still flickering — my re-runs hit it twice within minutes, and a stdout redirect to a fresh /tmp file came back 0 bytes with exit 1 (the fresh-file write refused).
  - **2× standing 120s timeouts** — living-garden-deed-attainment, one-person-army-deed-attainment (r246's family of 5; the other three passed this time — trust-observer-neutrality 76s, synergy-stall, capable-bot).
  - A first gate attempt was killed by a machine restart (~10:48Z, uptime 1 min on recovery); its partial log is preserved as `hidden_files/journey-establishment-r247-gate-killed-by-restart.log`. Heartbeat re-established first on recovery (registry `heartbeat_at` 2026-11-21T10:50:52Z), writes re-probed (pass), gate re-run from scratch. The flap watchdog died with the machine (nothing to restart it from — it is a standing process, not this run's).
  - No gate re-run in a full checkout: the 8 ENOENTs are structural to this worktree and would fail identically, and a full checkout (~10 min) would likely hit a flap window again. The branch contains no game code, so the gate's purpose here — confirming no regression — is met by the classification.
- **Telemetry: known schema mismatch only, baseline NOT rolled.** `guardrails.deaths 604→0, guardrails.popAlive 178→0, guardrails.pantryKcal 1,210,411→0` (same as r246 — the driver never emits `guardrails.*`, the checker reads 0). `c3.starvationDeaths` silent (0→0). No LOUD line is a finding.
- **Proof tests: 14/14 GREEN** (see above).
- **Analyzer fork proof: clean** (see above).

## Closeout (adoption, 2026-11-21)

- **Flap:** the adoption waited out the third write-flap window of the day, 11:06:07Z–~12:58Z (~112 min, longest on record; boot 18c49d22). No writes were forced during it; the O_EXCL probe passed before any commit was attempted. The original run's heartbeat loop was dead on adoption start (killed by the ~10:48Z VM replacement); a new adoption hbloop was started detached and heartbeated until session end.
- **Lock:** `playtest-loop.lock` was already absent when the adoption began — removed before the adoption started (not by this adoption). No live Lane A run holds it; nothing to delete.
- **Branch:** fast-forwarded in the worktree 2b97163b0 → 9c4ed7a87 (the batch-ship version bump landed during the flap wait) before committing; `git sparse-checkout add evidence/2026-11-21` per the run's closeout instruction (tracked files under that dir only — the full `evidence/` tree was NOT checked out). Commit `1d039688f` (4 files, 3016 insertions: prereg, run note, driver, analyzer). Index clobber struck after the safe-commit (all 4 files staged-deleted, worktree files byte-identical to HEAD); repaired via `ls-tree -r` + `update-index --add --index-info`, all 4 blobs hash-verified. 8 stray `flap-probe-*` files remain untracked in the worktree (probe debris from the run; not committed).
- **Adoption gate** (`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest-r247adopt`, worktree, 1085s): **332 passed, 12 failed, 0 attributable.** 8× ENOENT sparse-checkout artifacts — the same 8 as the run's gate (controller-census, conversation-answer-context, legacy-map-nightfall, measurement-comparison, measurement-proof-update, measurement-workflow, phone-frame-proof, regional-sprites); two confirmed directly (installed-update-old-save-r1.json, neutral-new.json.gz). 4× 120s timeouts under load — living-garden + one-person-army deed-attainment (standing family), trust-observer-neutrality (6/6 solo PASS), capable-bot (42/42 solo PASS). The run's 7 flap-EPERM failures all PASS in this gate, confirming they were flap artifacts.
- **Merge:** branch merged ff-only to master (see git log for tip); main tree verified clean; worktree released and removed; rotation-a advanced 1→2 (read back).
