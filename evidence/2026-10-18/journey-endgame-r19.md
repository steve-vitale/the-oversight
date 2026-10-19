# Journey ENDGAME R19 (2026-10-18) — THE NETWORK KEY: first full-chain measurement

**Run id:** playtest-loop2-20261018-1956 (oversight-playtest-loop-2, lane B). Worktree: `journey2-endgame`.
**Base:** master fe13b5798 (pulled at run start). Rotation index was 4 (endgame); this run plays leg 4. Rotation advanced to 5 after this run.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question:** THE NETWORK KEY — the last un-measured endgame design (TABLE.md: "Rarity is a target, not a measurement yet: 'almost impossible', well under 1% of strong runs — the playing bot will measure it."). Gates:
- G1: the table announces; the bot holds unseated to overtime tier ≥ 3 (21+ unseated days) while surviving.
- G2: herald slain via the played chain (war council → call → commit → blow-by-blow coalition fight).
- G3: nielsen slain (or whichever the run casts as apocalypse).
- G4: the third titan slain (overtime tier ≥ 2 brings the uncast one) — the finale arrives as a three-node march.
- G5: networkKeyReady() → engine summons the Network → the 9-node march is fought (or the key is lost aloud).
- G6: the bot sits; THE HOSTS is offered on the path; table_won carries key:'network'.

**Interesting-finding bar:** the FIRST gate that completes, or the first that provably breaks (documented; no cheats — the driver only calls the verbs a player can call, marches honestly, and lets the fight engine decide).

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 reach GO: ≥3/4 seeds reach table announcement.
- M2 overtime GO: ≥1 seed reaches overtime tier ≥3 unseated.
- M3 coalition GO: ≥1 titan chain completes (council → call → commit → fight resolves blow-by-blow).
- M4 slain: per-titan slain flags recorded across seeds (measurement, no threshold).
- M5 people GO: ≥2 titan beats sense-read (war council / call / a node fight), 0 senseless flags.
- M6 census GO: post-run census real on all runs; no crash/softlock.

**Seeds:** fresh 8971–8974. **Pilot:** seed 8971 only first; expanded to 8972–8974 after the instrument fix. **Horizon:** 260 loop-days, death-aware. Stack: the r18 belongseat tip (TRIBFLOOR=1 + WINDEFER=1 + FEASTSCALE_R13=1 + BELONG_V3=1, set BEFORE any require — r18's lesson) + a key driver (titan verbs + seat deferral until networkFallen or day 245 fallback). Conversation driver = r18's pinned fresh-first driver, unchanged.

## INSTRUMENT BUG (caught by the pilot — read before the results)

The r19 pilot summoned both titans on day 6–9 — at wave 1, village scale — and had them "located" by day 9, ~50 days before any gate could fire. Root cause: my read path called `G._titanTest.titanOmen(tid)`, which CREATES the omen entry `{stage: 0, day: 0}` when missing; `titanAdvanceOmen` then stages it forward every dawn (stage 0→1 needs day−0 ≥ 4; stage 1→2 needs day−0 ≥ 9). The fixed driver uses a non-creating read (`titanState().omens[tid]`). Verified honest after the fix: the herald located at d100 via the real wave-4 gate, nielsen at d116 via the real overtime-tier-2 third-titan gate. The broken pilot's 4 committed villagers (1000 kcal/day each, out of the workforce ~110 days) also poisoned that run's food economy — its starvation tells nothing. Fixed pilot + expansion re-ran clean.

## RESULTS (4 seeds, fixed instrument)

| seed | announce | max tier | titans (stage) | muster | end |
|------|----------|----------|----------------|--------|-----|
| 8971 | d90 | 6 | herald L2, nielsen L2 (tier-2 omens), finale L0 | 5/10, 3/12 — never ready | scattered d189 (starvation) |
| 8972 | d99 | 6 | herald L2, nielsen L2, finale L0 | never ready | scattered d150 (starvation) |
| 8973 | d90 | 3 | herald L2, nielsen L1, finale L0 | never ready | scattered d116 (starvation) |
| 8974 | — | 0 | never omened (wave 3 max) | — | scattered d172 (starvation) |

- **M1 reach GO:** 3/4 announced (8971 d90, 8972 d99, 8973 d90). 8974 never left wave 3.
- **M2 overtime GO:** tiers 6, 6, 3 — the deferral works; the voiced tier lines fire ("the season was supposed to END. You didn't sit. So we kept the cameras rolling."). Tier 2 correctly brought the uncast titan's omens (nielsen located d116 on 8971).
- **M3 coalition — the fight part MISSES, break documented:** every located titan got the full played chain (war council → call → Haven commits 3). ZERO fights resolved: the muster never filled. Herald needs 10 blades (1 ally answered = 2 blades + 3 own = 5/10); nielsen needs 12 (0–2 allies + 3 own = 3/12). The bot builds ONE active hierarchy link; the gates want 4–10 answering villages.
- **M4 slain:** 0/3 on all seeds. Finale never omened (wave 5 unreached — the playtest loop's scale-onramp domain).
- **M5 people GO:** 2+ war-council/call beats sense-read (herald + nielsen on 8971), 0 senseless flags — see below.
- **M6 census GO:** all four runs ended cleanly (honest starvation scatterings); no crash/softlock.

**The leg question, answered:** G1 completes — overtime is a real, voiced, escalating system in full runs. G2/G3 break at the muster gate: the competent bot's diplomacy depth (1 active alliance) cannot field titan coalitions (10/12/20 blades). G4–G6 are unobservable behind that break. The Network key's measured rarity: 0/4 even on key-chasing runs — but the binding constraint is the muster, not the key design itself.

## Village assessment (census in plain words)

- **8971:** the overtime village. Held the table waiting from d90 to d189 while the world got hungrier (tier 6). Sounded the call against the herald d100 — Stonebridge answered, Haven committed Yara, Katarina, Petra — but the coalition never reached 10 blades. The unanswered herald struck Stonebridge in the night (trust bled 28 → 0); the muster ate 5,000 kcal/day it didn't have; the village starved and scattered d189 while former allies raided the empty pantry.
- **8972/8973:** the same story, faster (scattered d150 / d116). One active alliance each; the herald's 10 blades never came.
- **8974:** never reached the table (wave 3 max); scattered d172.

## People check (SENSE-TESTING LAW)

1. **Herald war council (8971, d100):** "— Dmitri Dubois of Stonebridge (trust 28, watchful). Scouts: they weigh it daily." The same named speaker returns at the nielsen council (d116) at "trust 0, hungry. Scouts: their eyes keep drifting to your stores" — the person changed across 16 days of unanswered escalation. The NPC wants something (their people's safety); the call is answered/refused aloud with reasons; consequences land (trust −8, "refusals are remembered"). 0 senseless flags.
2. **The escalation beats:** "THE HERALD struck Stonebridge in the night. They bled while the coalition talked. (trust −5 — they notice who wasn't there.)" / "The muster is hungry — 0 of 5,000 kcal fed. Bellies remember who feeds them." Cause, cost, and consequence are all on the page. 0 senseless flags.
3. **Overtime voicing:** tier lines are the System at its best ("RERUNS, folks — the hits, but HUNGRIER"). The standing dock is shown honestly (−4/−11/−18) with the exit named ("Take your seat from Haven to stop the clock"). 0 senseless flags.

## BLANKS (documented, no game-code changes — design questions for Steve)

1. **No stand-down verb for the muster (the sharpest blank this run).** Once the call is sounded and Haven commits, there is NO player verb to release the muster (`titanSelfActions` offers council/call/commit only; `titanReleaseCommitted` fires only on victory/defeat). An unfillable muster is a permanent 1000 kcal/blade/day bleed plus unanswered-titan escalation every 5 days, with no player agency — a death spiral you can watch but not stop. My driver was too eager (a real player would council-first and not call), but the edge case is real: call → allies' trust collapses under escalation → stuck. **Steve's call:** add a stand-down verb (said aloud, trust cost), or is the no-exit commitment the design?
2. **Muster gates vs diplomacy depth.** minAllies 10/12/20 wants 4–10 answering villages; the competent bot builds 1 active link. Is the intended play really "build a 4+ village coalition before wave 4"? If so, the coalition-building game may need more on-ramps (the bot's diplomacy tops out at one strong link). If not, the gates are high. Steve's tuning call.
3. **The finale never omened** (wave 5 unreached on all 4 seeds) — the playtest loop's scale-onramp domain, not this leg's.

## TELEMETRY DEVIATION CHECK

`telemetry-check.js` vs `hidden_files/telemetry-baselines/endgame.json` — **4 LOUD lines**: wins 7→0, table 7→0, tableSceneFired 7→0, tableSceneCompleted 7→0. **Verdict: EXPLAINED, not a bug.** This arm defers the seat by design (the measurement required unseated days); seatApproach 3/4 matches the baseline's 7/8. The baseline was NOT rolled forward — it measures the seat-driver tip's win-path axis; r19 is a different arm. New measurements (not baselined): overtimeMaxTier 6 (first full-run overtime), titansLocated 5, titansSlain 0, networkSummoned 0, networkFallen 0. Evidence: `evidence/2026-10-18/tele-r19-key.json`.

## METRIC REVIEW (§14)

- M1, M2, M5, M6 GO. M3's fight clause MISSES — the break is documented above, not re-scored.
- The pilot-first rule caught the creating-omen-read bug before the matrix ran (same class as r18's env-var catch).
- Note for future runs: NEVER read `G._titanTest.titanOmen(tid)` as a probe — it creates the omen. Use `titanState().omens[tid]`. Also: the key-deferral arm is lethal by design (all four runs scattered; r18's same stack without deferral went 7/8 wins) — overtime's cost is real and measurable.

## Reachable / Fun / Winnable

- **REACHABLE:** Overtime is reachable and fully voiced (G1). The titan coalition chain is reachable through council/call/commit, but the FIGHT is not reachable at the bot's diplomacy depth (5/10, 3/12). The Network key is unreached in sims — gated behind the muster.
- **FUN:** The overtime + escalation + muster-starvation beats are some of the best systems writing in the game — the season that wouldn't end, the hungry muster, the ally who watched you deliberate and stopped trusting you. The design is coherent; the numbers may be high.
- **WINNABLE:** The key path is currently unwinnable in sims (0/4, muster-blocked). The table itself remains winnable (r18: 7/8) — the deferral was the instrument's choice, not the game's.

## Evidence

- `evidence/2026-10-18/journey-endgame-r19.md` (this note)
- `evidence/2026-10-18/journey-endgame-r19-key-s{8971..8974}.json`
- `evidence/2026-10-18/journey-endgame-r19-transcript-key-s8971.txt` (others not written — 8971 has the full beats; convos only where the run lived past d130)
- `evidence/2026-10-18/journey-endgame-r19-frames-key-s{8971..8974}.json`
- `evidence/2026-10-18/journey-endgame-r19-convos-key-s8974.txt`
- `evidence/2026-10-18/tele-r19-key.json` (telemetry-check input)
- `scripts/journey-endgame-r19-20261018.js` (key-driver harness; fixed instrument)

**Game-code changes this run:** none. **Tooling:** the r19 key-driver harness (1 instrument bug fixed). Merged locally, pending ship.
