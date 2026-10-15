# sim-monotonic — the link-break / monotonic-unlock diagnostic instrument (2026-10-15)

Worktree: `~/workspace/worktrees/sim-monotonic`. Run: oversight-flesh-out-loop, 2026-10-15.
Wave-pacing lens on the scale wall. INSTRUMENT-ONLY: zero src/js changes.

## Context
- Killed v2 gate (evidence/2026-10-15/sim-readinessgate2.md): monotonic peak ratchet `_standingPeakWave` — unlocks never re-lock. Design call "should unlocks stick?" answered YES (Steve can overrule). Code reverted byte-clean.
- Diagnostic (evidence/2026-10-15/sim-readinessbind.md): 2/5 w5 unlocks RE-LOCKED on link break — leadfeast/33: standing 202→170, w5→w4; leadfeast/44: 227→w4. "The re-lock is a mercy mechanic by accident — and a spec question for Steve."
- OPEN FINDING: MONOTONIC UNLOCKS UNTESTED IN THE WILD — the peak-ratchet fired only in proof fixtures; no pilot hit the link-break re-lock scenario. Steve's call needs measured evidence, not argument.
- Canon: docs/CANON.md + docs/MONSTER-WAVES.md read. **There is no readiness canon doc** — per the canon rule this is stated, not invented.

## The instrument
`scripts/monotonic-sweep.js` — link-break scenario harness + paired arms:
- Substrate: link-heavy courtship road — `leadcourt` + `belongseek` policies, 8 seeds (11/22/33/44/55/66/77/88), 180d death-aware.
- Scenario (both arms, identical): at first observed RAW wave-4 Standing unlock, +3d: break the oldest diplomacy-contributing (seasoned + regional+) link via the engine's OWN `Game.breakLink(id, 'gambit')` — the exact path the UI's link-break button calls. +10d: break a second if links remain and wave-4 still held (raw).
- Arm `break` (a): pristine engine — Standing collapses, waves re-lock by engine law.
- Arm `sticky` (b): pristine engine + instrument-side monotonic overlay re-derived from the v2 spec (sim-readinessgate2.md): `Game.unlockedWave` wrapped, `peak = max(peak, raw)`; effective = max(raw, peak). The v2 spec's "effective total never drops below that wave's threshold" is behaviorally identical here — `unlockedWave()` is the only reader of the standing total. Pure reads, no RNG, trajectory-neutral until a re-lock would fire.
- Attribution machinery reused: `scripts/readinessbind-lib.js` (readinessSnapshot, classifyOutcome, attribution, separation, trajectoryHash).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)
- **Axis**: scale-onramp (the wall), lever-2 (wave pacing) lens. Same tree, identical seeds, both arms in one sweep. Zero src/js changes.
- **Seeds**: 11/22/33/44/55/66/77/88 × leadcourt/belongseek × {break, sticky} = up to 32 runs. **Horizon**: 180d death-aware (harness stops dead villages; +10d tail).
- **PRIMARY (DIAGNOSTIC GO)**: (a) ≥ 80% of link-break scenarios FULLY ATTRIBUTED — pre/post RAW Standing captured around each break, re-lock-or-hold determined (waveRaw vs waveEff), 30d post-break outcome determined uncensored (held/died/hollow per the readinessbind operationalization, window from first break day; died/hollow before +30 IS determined); censored in the denominator, out of the numerator; AND (b) NAMED separating factors between sticky-helped vs sticky-hurt villages — paired per (policy, seed): helped = sticky 30d outcome strictly better than break-arm, hurt = strictly worse (held=3 > hollow=2 > died=1; any held-censored pair → 'unknown', excluded); holders=helped, corpses=hurt into the readinessbind three-rung rule: SEPARATES needs disjoint ranges n≥3 per group, SUGGESTIVE needs |median diff| ≥ pooled MAD, else UNCONCENTRATED; <6 total pairs → UNDERPOWERED (the honest name). GO needs (a) AND the (b) verdict stated at its measured rung — UNDERPOWERED/UNCONCENTRATED honestly named also satisfies (b).
- **SECONDARIES** (reported, non-binding): (S1) does the re-lock mercy save villages or delay the bleed? — 30d outcome distribution on break-arm re-locked scenarios vs sticky-arm held scenarios; (S2) post-break Standing/wave trajectories (+1/+3/+7/+14/+30); (S3) sense: what the village experiences when the draft closes and (maybe) re-opens (say-ring around break/re-lock/re-open days).
- **GUARDRAILS**: no src/js diff at end (`git status` shows scripts/ + evidence/ only); overlay neutral pre-trigger (A/A byte-identical); no new death mode at cause-family level on the sticky arm vs break arm (n≥3 armed-only family = new mode).
- **Gates before spend**: proof `scripts/test-monotonic-20261015.js` REAL RED→GREEN (fixture: harness detects the engine's own link break; re-lock observed in (a); hold observed in (b); no-hallucination on short smoke); SMOKE=1; AA=1 (2 seeds × 2 policies, instrument vs pristine byte-identical before the scenario triggers). A miss is NO-GO, never re-scored (§14).

## Design calls documented for Steve's overrule
1. The sticky hold re-derives ONLY the monotonic ratchet from the killed v2 — not the faced-experience bar or the plenty cap (both killed with v2). The question is "should unlocks stick?", nothing else.
2. 'gambit' is the break flavor (Haven breaks faith — the player-initiated path). 'walked'/'revolt' are engine-natural but would confound with their different opinion hits.
3. The second break is conditional (links remain AND wave-4 still held raw) — it covers the 2-link case without manufacturing scenarios after a re-lock already answered.

## Results (32 runs: 2 arms x 2 policies x 8 seeds, 180d death-aware)

Gates before spend (all green): proof `scripts/test-monotonic-20261015.js` REAL RED→GREEN — REDMODE=1 (overlay off) the hold FAILS as designed, default all 16 checks PASS (fixture: 3 real seasoned links → standing 102 → wave 4; engine `breakLink(id,'gambit')` → 102→0, wave 4→1 RE-LOCK; overlay → effective wave HOLDS at 4 while raw re-locks; 15d smoke no hallucination; A/A byte-identical). SMOKE=1 green (4 policy/arm combos, no unlocks/breaks). AA=1 green (2 seeds x 2 policies x 60d, instrument vs pristine byte-identical).

**18 link-break scenarios** (9 break-arm + 9 sticky-arm; 14/32 runs produced no scenario — 12 no-w4-unlock, 2 no-qualifying-links... actually all 14 were no-w4-unlock: belongseek unlocks w4 on only 3/8 seeds/arm, leadcourt 6/8).

| # | scenario | break | standing | waveRaw | waveEff | 30d outcome |
|---|---|---|---|---|---|---|
| 1 | leadcourt/22/break d102 | Stonebridge (vassal) | 102→0 | 4→3 | 3 | held |
| 2 | leadcourt/33/break d60 | Emberhold | 102→0 | 4→2 | 2 | held |
| 3 | leadcourt/44/break d61 | Emberhold | 127→25 | 4→3 | 3 | held |
| 4 | leadcourt/66/break d68 | Stonebridge | 102→0 | 4→2 | 2 | died |
| 5 | leadcourt/77/break d60 | Emberhold | 102→0 | 4→2 | 2 | held |
| 6 | leadcourt/88/break d60 | Emberhold | 102→0 | 4→2 | 2 | held |
| 7 | belongseek/22/break d118 | Thornfield | 109→75 | 4→3 | 3 | died |
| 8 | belongseek/44/break d139 | The Hungry Road | 109→75 | 4→3 | 3 | held |
| 9 | belongseek/77/break d159 | Stonebridge | 109→75 | 4→3 | 3 | held-censored |
| 10-18 | (same 9, sticky arm) | same links/days | same drops | same re-locks | **4 (HELD)** | held,held,held,died,held,died,held,held,held-censored |

- **(a) Attribution: 16/18 = 88.9% ≥ 80% — MET.** Every break event carries pre/post RAW Standing, waveRaw pre/post, waveEff post, re-lock/hold verdict, and a determined 30d outcome. The 2 unattributed are the belongseek/77 pair (held-censored: unlock d156/159, horizon ends before the 30d window closes) — in the denominator, out of the numerator, per the pre-registered rule.
- **Every deliberate break re-locked: 9/9 in the break arm.** The diagnostic's 2/5 was the probabilistic shadow of this deterministic mechanism: on leadcourt the break dissolves the LEAD polity (3→2 seasoned subs < 3 → the realm dies → diplomacy 102→0, a total collapse); on belongseek it costs exactly one link (−34, 109→75, the primary's realm survives).
- **The sticky hold worked 9/9**: effective wave held at 4 while raw re-locked underneath (waveEffPost=4, waveRawPost∈{2,3}).
- **Second breaks: 0 fired.** The pre-registered second-break condition (links remain AND wave-4 still held raw) never engaged because every first break re-locked. The 2-link case is untested — documented, not fudged.
- **(b) Paired helped/hurt (per policy/seed, break vs sticky 30d outcomes):** 6 neutral, **1 helped** (belongseek/22: break died → sticky held), **1 hurt** (leadcourt/88: break held → sticky died), 1 unknown (held-censored pair excluded). Separation on the readinessbind three-rung rule → **UNDERPOWERED** (n=2 decisive pairs < 6): holders=1 (belongseek/22: armorP 40, roster 8, ledger 3, national), corpses=1 (leadcourt/88: armorP 30, roster 9, ledger 0, regional). The honest name is stated; no factors are claimed.
- **GO verdict: GO.** (a) 88.9% ≥ 80% met; (b) UNDERPOWERED honestly named, which the pre-registered rule accepts as satisfying (b). This is a diagnostic — its job was measured evidence for Steve's "should unlocks stick?" call, and it delivered.

### Secondary S1: does the re-lock mercy save villages, or delay the bleed?
30d outcome distributions are IDENTICAL: break-arm re-locked → held 6 / died 2 / held-censored 1; sticky-arm held → held 6 / died 2 / held-censored 1. The paired view agrees (6/9 identical). **On this substrate the sticky hold is 30d-outcome-neutral**: keeping wave-4 monsters in the spawn pool neither saved villages nor doomed them. The mercy doesn't save; the hold doesn't kill — at 30 days, on 9 pairs, the wave's presence is not the decider. (The decider, if the /77-vs-/88 pattern from the diagnostic holds, is post-break dynamics — unmeasured here.)

### Secondary S2: post-break trajectories
- leadcourt/33 break: standing 0 for ~3 weeks (wave 2), then the village RE-COURTED — standing back to 102, **wave 4 re-opened d90**, silently. The climb is re-earn-able; the re-lock is a setback, not a sentence.
- belongseek breaks: standing 75 (one link down, realm intact) — villages sit at wave 3 with a wounded-but-living diplomacy base.
- Sticky arm: wave 4 held in the pool throughout; standing trajectories identical to break arm (the overlay touches only the unlock gate, never the economy).

### Wall numbers (this run, courtship substrate)
national 16/32 · table 0/32 · wins 0/32 · wave-5 unlocks 0 · median survival 107d (max 182) · endReasons: village-lost 29, survived 3.
Telemetry-check (correct dotted paths): `telemetry.national newly appeared: baseline 0 → current 16` — EXPLAINED: courtship substrate is the scale road; the scale-wall baseline was seeded on non-courtship sims. `telemetry.exiled newly appeared: baseline 0 → current 4` — EXPLAINED: all 4 are seed 55 (both policies, both arms, village-lost) — a genuine justice-system exile on one seed's storyline, arm-independent, not an instrument artifact. Baseline NOT rolled forward (coordinator's call; this is a diagnostic substrate).

### Guardrails
- `git status` at commit: scripts/ + evidence/ only — zero src/js changes (instrument-only honored).
- A/A byte-identical pre-scenario (proof R5 + AA=1 gate).
- No new death mode: the 4 died scenarios' window deaths are ordinary families — starvation, combat, monster, expedition, sickness, contest, villager combat — all present on both arms, none sticky-only at n≥3.

## Metric review (§14 — for the NEXT run, not this one)
1. **The second-break condition was dead on arrival.** Requiring wave-4 still held raw after the first break meant it could only fire when the first break *didn't* re-lock — but every deliberate polity break re-locked. On a partial-break substrate (belongseek-style −34) it might fire; here it never did. A future run wanting the 2-link case should break both links on the same day.
2. **Separation power needs a higher-yield substrate.** belongseek unlocks w4 on 3/8 seeds; 9 pairs gave 2 decisive. For a powered helped/hurt separation, either run more seeds (16+) or pick a substrate where w4 unlocks reliably (the leadfeast road hit 8/8 in the diagnostic).
3. **Late unlocks + 180d horizon = censored windows.** belongseek/77 unlocked d156; the 30d window can't close. Either cap the break trigger earlier or extend the horizon for late unlockers.
4. **held-censored as 'unknown' in pairing is conservative and correct** — but it cost 1 of 9 pairs. Same fix as (3).
5. **The 30d window from break day (not unlock day) was the right anchor** — the question is about the break's aftermath, and break-day anchoring kept all 9 pairs comparable.

## Village assessment (plain words)
The courtship villages climb the diplomacy road honestly: three seasoned bonds, a realm, wave 4 opens on friendship around day 57–136. Then the instrument breaks faith — one 'gambit' — and the whole edifice falls in a day: on the LEAD road the realm itself dies (102→0, the System's attention snaps shut); on the BELONG road it's a flesh wound (109→75, the primary's realm doesn't care about Haven's tantrum). Every time, the draft closes. And every time, the village hears nothing about the closing — only the sentence about the broken link. The mercy is silent.

In the sticky villages the same sentence is said, the same Standing collapses — but the draft stays open, equally silently. Wave-4 monsters keep coming to the treeline. And 30 days later, you cannot tell the two villages apart: 6 of 9 pairs end identically. The one the hold saved (belongseek/22) and the one the hold killed (leadcourt/88) are the honest remainder — too few to name a pattern, enough to say the hold is not a rescue and not a curse. It's a door left open. Whether an open door is a kindness or a trap is Steve's call — now with numbers: 9/9 holds worked, 0/9 changed the 30-day fate in a consistent direction.

The most human moment is leadcourt/33's: broken at day 60, wave gone, and the village *re-courted* — new bonds, new seasons — and wave 4 re-opened on day 90 without a word from the System. The climb is re-earn-able. The game already knows how to forgive; the question is only whether it should have to.

## SENSE-TESTING
- The break beats read honestly and consequentially: "The link with Emberhold is broken (gambit). What was built over weeks comes apart in a sentence." / "🗡️ The vassal's gambit: Haven breaks with Thornfield. No more tribute, no more calls — and no more protection. Word will travel: Haven broke faith. (Opinion 4 — Thornfield remembers: Haven broke faith (today)…". The engine's own path says the break aloud, with the relationship's consequences attached. PASS.
- **The re-lock has no beat.** Searched game.js/standing.js/progression.js: nothing announces a wave closure. The village's unlock-day rings are ordinary life (fire gossip, snares); the draft closes between one day and the next with no fiction. In the sticky arm the hold is equally unbeaten — wave-4 monsters keep arriving with no explanation of why the System's attention didn't waver. If Steve rules that unlocks stick, the fiction needs a beat ("the draft stays open" — the System noticed you once; attention doesn't un-notice). Documented as blank, not a code bug.
- No robotic repetition beyond the game's own templates in the captured tails.

## Blanks filled / documented
- **FILLED**: the instrument itself — `scripts/monotonic-sweep.js` (link-break scenario harness, paired break/sticky arms, SMOKE=1 + AA=1 gates, per-seed JSONs with national/table/wins/exiled telemetry), `scripts/test-monotonic-20261015.js` (proof, REAL RED→GREEN), this evidence file. Zero src/js changes.
- **DOCUMENTED (sim-findings backlog candidates)**:
  1. Re-lock is DETERMINISTIC on polity-dissolving breaks (9/9 here) — the diagnostic's 2/5 was the probabilistic shadow. A deliberate 'gambit' on a 3-sub LEAD realm always collapses diplomacy to 0 (realm death, not link loss).
  2. No engine beat announces a wave closure — the "mercy by accident" is mercy by silence. A sticky-unlock ruling needs a fiction beat for the hold.
  3. The climb is re-earn-able post-re-lock (leadcourt/33: wave 4 re-opened d90, silently).
  4. The 2-link break case is untested (second-break condition never fired).
  5. belongseek w4 unlock rate 3/8 — the BELONG diplomacy road is slow; the LEAD road (leadcourt 6/8) carries the scale wall's diplomacy numbers.

## Convergence
scale-onramp: CONVERGING (unchanged). The diagnostic delivered its evidence: the re-lock is engine-deterministic, the sticky hold is implementable (9/9) and 30d-outcome-neutral, the separation is underpowered. Steve's "should unlocks stick?" now has measured evidence instead of argument. The axis moves when a run lands a version of the readiness gate with an achievable primary — the mechanism (faced-experience + monotonic) is proven; the metric needed the fix (see sim-readinessgate2.md metric review).

## Files
- `scripts/monotonic-sweep.js` — the diagnostic sweep (SMOKE=1, AA=1 gates; OUT=/PERSEED_DIR= writers).
- `scripts/test-monotonic-20261015.js` — proof, REAL RED→GREEN.
- `evidence/2026-10-15/sim-monotonic.md` — this file.
- `evidence/2026-10-15/monotonic-runs.json` — aggregate + scenario records (planned).
- `evidence/2026-10-15/perseed-mono/` — per-seed JSONs with scenario records + run telemetry (national/table/wins/exiled) (planned).
