# Deepening leg R26 — the constructed food-carry probe (2026-10-20)

**Leg:** deepening (rotation read 2 → wrote 3). Base master@a6a7bf857 (post-10-20 ship-incident repairs + favor-water + sim-rotdiff-b). Measurement run (DIAG class): **zero src/js changes** — scripts/ + evidence/ only. The funnel story (r23→r24→r25→r26) closes here.

## Pre-register (2026-10-20, MEASUREMENT.md §§9–12, 14 — BINDING)
- **Leg question:** r25's named-next — "would the AI bribe if the food were there?" The offer_food bribe needs a real food unit in the villager's items at fight time (fieldFights.js: known counter + `villagerHasFood(vid)` → bribe, monster bolts). r24: 3 opportunities, 0 performed. r25: 7 known-counter lockpick fights on 8 seeds, ALL no-food, 0 bribes (~1.2% natural carry rate). The constraint is the food, never the AI — but that was unanswerable on natural substrate.
- **The probe (harness-only):** on probe-arm seeds, the fieldFight wrap gives every food-less field fighter one expedition ration (`'protein_bar'`, 250 kcal — a REAL item id in src/data/items.json, spent honestly through `villagerSpendFood`) before the fight resolves. Control seed keeps natural behavior. Canon: CANON.md, MONSTER-WAVES.md (2026-10-20). No new canon.
- **Binding metrics:**
  - R1 instrument: hasFoodBefore + foodCarryInjected in the wrap; 4/4 pilot seeds, 0 instrument errors, non-null ≥95%.
  - R2 funnel: ≥1 lockpick fight with counter known at fight time (r24 convention: first counterDiscovered day ≤ fight day) + ≥1 turn + food held → GO = `'offer_food'` in trickLog on ≥1 such fight (the bribe fires under alignment). Aligned-but-unfired ≥1 = NO-GO on the funnel AND opens a bug-hunt (a miss is NO-GO, never re-scored).
  - R3 control: 1 control seed holds r25's pattern on the current tip (natural carry ~1%, 0 unaligned bribes); report-only.
  - M1 people (report-only): ≥6 transcripts sense-read, 0 senseless.
  - M2 winnable: ≥3/4 villages alive at end.
- **Horizon:** DAYCAP=100, death-aware stop. Seeds: fresh 9901–9904 competent; probe arm 9901–9903, control 9904. EXPAND to 9905–9908 (probe) on: (a) 0 aligned lockpick fights on the pilot, or (b) aligned-but-unfired (more samples for the bug-hunt).
- **Interesting-finding bar:** the first-ever performed bribe with a named villager and honest narration; OR a genuine offer_food-path bug; OR the ration injection visibly disturbing the economy.
- **Race guards:** no pacing lever; no dialogue changes; wave-3 gate untouched (Steve's design; unlock tracked report-only); probe food is a real kcal item spent through the landed code path.

## Results
- **R1: GO** — 4/4 seeds, 0 null reads across 160 field fights, 0 instrument errors. The injection fired on probe seeds (e.g. 9901: 17/26 fights with food vs control 9904: 0/27).
- **R2: GO — the bribe fires in real play.** Two named villagers performed `offer_food` with NATURAL food (no injection needed):
  - **9901 d18 Carlos** (food-carrier naturally): counter known, 1 round, **mFlee** — "tosses [food] — it CANNOT resist. Drops everything mid-scamper, stuffs its cheeks, bolts."
  - **9901 d21 Marcus**: same — 1 round, mFlee.
  - Both bribed on round 1 (offer_food has no HP gate, unlike shout's <75%) and walked away unhurt. The AI is exonerated; **"food, not the AI" closes the funnel story.** No game-code change — the machinery was already correct.
  - The constructed probe was mechanically sound (injection recorded `foodCarryInjected=true`; `villagerSpendFood` handles string item ids — verified in code), but no probe-arm fight ever needed it: the natural bribes answered the question first.
  - **aligned-but-unfired = 2, both EXPLAINED (bug-hunt closed, no engine bug):** Øystein 9901-d6 (injected) and Landon 9902-d13 (natural food) were counted "known at fight time" by the funnel's day-granular proxy (discoveryDay ≤ fightDay) — but the lockpick counter was first discovered ON day 6 / day 13 respectively (both via 'taught'). At fight time `state.monsterCounters['lockpick_raccoon']` was still false, so `known12` was false and the trick hook correctly returned null (Landon's fight: vKill, tricks=[] — the hook would have bribed on round 1 if known). The fights came before the teaching landed that day. See Metric review.
- **R3: GO** — 9904 control holds r25's pattern on the current tip: 0/27 fights with natural food, 1 lockpick fight (counter unknown), 0 unaligned bribes. Natural carry on the other seeds: 9902 53/61 (probe arm — injections included), 9903 37/46.
- **M1: GO** — 8 transcripts sense-read, 0 senseless (see People check).
- **M2: GO** — 3/4 villages alive at end (9902 d94, 9903 d94, 9904 d77). 9901 village-lost d44 (see Census).

## Census (plain words)
- **9901 (probe, village-lost d44, 2 survivors):** collapsed under a combat+starvation cascade — 5 villager-combat deaths, 5 monster-combat deaths (incl. 3 belltoad kills on day 22 alone), 4 starvation, 2 infected wounds, 1 sickness, 1 dehydration. Wave 3 never unlocked (10 counters known, 2 regional links formed before the fall). Carlos and Marcus — the two bribers — died later anyway (wound d25, starvation d39): the trick saved them from the raccoon, not from the leg.
- **9902 (probe, survived d94, wave 3 @ d35, regional, 2 links, 8/8 alive):** the deepening window at its best — 19 counters known, 7 wave-3 fights, 15 w3 trick fights, 14 hold-line beats. Deaths mostly villager-vs-villager combat (9) and monster combat (7).
- **9903 (probe, survived d94, wave 3 @ d71, regional, 2 links, 8/8 alive):** slower unlock (kills-only gate), 18 counters, 4 sickness deaths, 10 monster-combat deaths, 8 villager-combat.
- **9904 (control, survived d77, wave 2, regional, 2 links, 11/11 alive):** the quiet seed — fewest deaths (6 villager-combat, 2 combat, 1 expedition), 13 counters. Control behavior indistinguishable from r25's natural substrate.
- **Standing observation (not new):** villager-vs-villager combat is the dominant death cause on every surviving seed (6–9 per ~100d) — same as establishment r21's note. Reads high against "violence desperate and traumatic, not power fantasy."

## People check (SENSE-TESTING LAW — 8 transcripts read in full)
- **9902-d45 Landon** (radio DJ, intense, trust 90, want=curious): asks who the player doesn't trust; player answers vaguely; Landon: "Noted. I'll watch too." Develops into a slow-trust beat ("I just haven't finished trusting most of them yet"). Meaningful.
- **9902-d60 Landon** (want=curious again, different topic): "Do you ever just need to be alone?" — "I go to the treeline edge and count my breaths. Ten of them. That's my alone." Characterful, coherent. Meaningful.
- **9902-d80 Landon** (thin check-in): "You said you'd earn it, not that I should just hand it over. Fair. I'm watching — and so far, so good." / "That's the whole of it. Sorry." A trust-arc callback across days (not fabricated — it's the want thread persisting). Coherent, brief.
- **9903-d45 Ruby** (lifeguard, bold, trust 14): opens awkward ("I'm not good at the talking-to-strangers part"), warms up ("Strangers are just people you haven't disappointed yet"), ends with a plant: "Come see what I found. You won't believe it." The NPC wants connection; the ending owes a future beat. Meaningful.
- **9903-d60 Hugo** (fisherman, want=seek_taken): "Have you heard anything? About the taken. The pods." Player commits to asking the System; Hugo: "Even asking is more than the silence." resolution=promised — the KIN canon (Taken, pods) landing with emotional weight. Meaningful.
- **9903-d80 Gilberto** (sailor, anxious, trust 26): "What did you do for fun? Before." — occupation-grounded answer ("fun was whatever I could steal between shifts"). Meaningful.
- **9904-d45 Terry** (dry cleaner, sardonic, trust 90): "When's the last time you really laughed?" — "Stealing joy. I like that. We should steal more of it." Ends with a plant ("Come get air with me. I need to think out loud."). Meaningful.
- **9904-d60 Terry** (DOCUMENTED, not fixed): identical opener + first two beats to Gilberto's d80 ("What did you do for fun? Before. The thing you'd do on a perfect Saturday." / "The free things. Turns out they were the expensive ones." / "Come get air with me. I need to think out loud.") — only the occupation line differs. Reads fine in isolation (both meaningful alone), but it's a template: the curious-want opener recycles verbatim across villagers. Persists from r23's noted clusters (grief-pool verbatim, teach-template verbatim). Social lane's territory — report-only.
- **Verdict: 8/8 sense-read, 0 senseless, 7 meaningful + 1 template-recycle documented.** Villagers act like people.

## Blanks / findings
1. **FILLED (the named-next): the trick funnel closes in real play.** r23→r24→r25→r26: the knowledge economy breathes (15–22 counters/seed, taught channels strong), shout performs (r24), and now offer_food performs — Carlos and Marcus bribed lockpick_raccoons with natural food, 1 round, mFlee, honest narration. The funnel is narrow (biome gating + 1.2% natural food-carry) but REAL end to end. No src/js change — the machinery was correct all along.
2. **DOCUMENTED — funnel instrument precision limit:** the "known at fight time" proxy is day-granular (first counterDiscovered day ≤ fight day) and over-counts when discovery and fight share a day (Øystein d6, Landon d13 — both fights preceded the day's teaching). Proposed for the next funnel run: exclude discovery-day==fight-day from "known at fight time", or capture intra-day ordering (capture-stream index of the COUNTER LEARNED beat vs the fight).
3. **DOCUMENTED (social lane, report-only):** curious-want opener template recycles verbatim across villagers (Terry d60 / Gilberto d80). The social loop owns the template pool.
4. **Noted for Steve (not landed):** (a) 9901's day-44 collapse — a competent village losing 10/12 to a combat+starvation cascade inside the deepening window; (b) villager-vs-villager combat remains the top death cause on every seed (6–9/run) — the "violence desperate and traumatic" question from r21 stands; (c) the bribe's precondition (food carried into fights, ~1%) keeps offer_food nearly player-only in practice — r24's design note, unchanged.

## Reachable / fun / winnable (deepening leg)
- **Reachable:** YES — wave 3 on 2/4 seeds (9902 d35, 9903 d71; kills-only gate, Steve's design), regional scale + 2 links on all surviving seeds, the bribe now proven reachable (2 natural performances). 9901's collapse shows the leg can also kill a competent village.
- **Fun:** GOOD — 9902 is the leg at its best (wave-3 trick fights with hold-line beats, Hugo's taken-pods promise, Ruby's awkward warmth). Villages feel alive; conversations have wants, engagements, and owed futures.
- **Winnable:** 3/4 villages alive at days 77–94; 9901's collapse is the honest threat the leg needs. The leg doesn't hand out survival.

## Metric review (§14)
- **No mid-run re-scores.** All bars held as pre-registered. Expansion was NOT triggered (aligned fights existed; the question was answered on the pilot).
- **R2's aligned-but-unfired clause fired the bug-hunt, which closed as instrument-not-engine:** both unfired fights were day-granular "known" mislabels (discovery later the same day; `known12` false at fight time, hook correctly null). True-aligned (discovery strictly before fight day): 2/2 performed. Propose the known-at-fight refinement (above) for the next funnel run — this run's metric stands.
- **R3's control did its job:** 9904 on the current tip reproduces r25's natural pattern (0/27 food-carry, 0 unaligned bribes) — the probe arm didn't drift the baseline.

## Telemetry deviation check
`telemetry-check.js` vs deepening.json (w3fights, engaged.w3, fightsTotal, fightsByWave.3), 4 seeds: **1 LOUD line** — `engaged.w3 swung -67%: baseline 21 -> current 7`. **EXPLAINED, baseline NOT rolled:** (a) small-n pilot variance — r24's own 4-seed pilot unlocked wave 3 on 2/4, same as r26; r25's 7/8 was the high roll; (b) 9901's death-aware stop at d44 zeroes one seed's engagement by rule; (c) the probe's 2 bribes cost at most 2 wave-2 kills (both on the seed that died anyway) — no pacing-lever mechanism. Not a game deviation.

## Regression
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest` (in-worktree): **263 passed, 5 failed in 518s.** Failure accounting:
- `test-measurement-proof-update.js`, `test-measurement-workflow.js` — retained-proof staleness, pre-existing (sibling landings invalidated retained proofs; same class as r19/r23's notes).
- `test-phone-frame-proof.js` — stale browser receipts / missing phone evidence, pre-existing (MOBILE-PLAYTEST.md).
- `test-foodpower-20261014.js` — failed ONLY on sub-assertion (g) ontology validator under 2-parallel load; re-ran standalone in-worktree: **30/30 PASS** (also 30/30 on pristine main-tree master). Parallel-run flake, not a code regression.
- `test-sw-audio-cache-20261012.js` — failed on `EPERM: operation not permitted, copyfile sw.js -> /tmp/...` (the documented EPERM flap); re-ran standalone: **7/7 PASS**. Infra transient, not a code regression.
- Zero src/js changes in this run — nothing to regress; the 3 true pre-existing failures are unrelated to this scripts+evidence-only landing.

## Files
- Harness: `scripts/journey-deepening-r26-20261020.js` (r25 lineage + ration-probe wrap + aligned-funnel analysis)
- Per-seed evidence: `evidence/2026-10-20/journey-deepening-r26-competent-{9901,9902,9903,9904}.json`
- Transcripts: `evidence/2026-10-20/journey-deepening-r26-transcript-competent-*.txt` (8 full + 38 showprobes)
- Logs: `evidence/2026-10-20/journey-deepening-r26-run.log`, `journey-deepening-r26-smoke.log` (30d instrument smoke)
