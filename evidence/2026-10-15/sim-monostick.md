# sim-monostick — MONOTONIC IN THE WILD: stickiness vs mercy on a weakened village (2026-10-15)

Worktree: `~/workspace/worktrees/sim-monostick`. Run: oversight-flesh-out-loop, 2026-10-15.
Axis: scale-onramp (the wall), lever-2 (wave pacing) + lever-8 (travel & regional) lens.
INSTRUMENT-ONLY: zero src/js changes. Arm of claim `fleshout-a-20261015T0830Z.json` (sim-monostick).

## Context
- sim-findings #288 (MONOTONIC UNLOCKS UNTESTED IN THE WILD, OPEN): readiness-gate v3 landed the monotonic peak ratchet (7a72b456) — wave-4/5 unlocks never re-lock when a link breaks. The old behavior was a "re-lock mercy": breaking a link re-locked the unlock, releasing the wave-4/5 pressure. The ratchet fired only in proof fixtures — no run has tested whether stickiness helps or hurts a weakened village. Named next: deliberately include a link-break.
- Prior instrument (sim-monotonic, 113e7439): 18 scenarios, 88.9% attribution, re-lock 9/9 deterministic on the pre-ratchet engine, sticky-overlay hold 9/9, 30d-outcome-neutral, separation UNDERPOWERED. That run compared pristine-vs-overlay; this run compares the LANDED engine (sticky) against a harness-emulated mercy.
- Canon read: docs/CANON.md (manifest; "no silent actions", "if you don't know, it doesn't show"), docs/SCALE.md (link seasoning 30d+trust 40+, polity forms, break verbs — RELEASE/WALK), docs/MONSTER-WAVES.md, hidden_files/wave4-standing-spec.md (Standing bar: +34/seasoned-regional+ link, T4=100, faced-experience bar). **No canon doc covers the link-break test scenario itself** — stated per the canon rule, not invented. 'gambit' (Haven breaks faith) is the player-initiated break flavor.

## The instrument
`scripts/monostick-sweep.js` — link-break scenario harness + paired arms:
- Substrate: courtship road (`fourthlink` = leadcourt with the 4th+ link uncapped, FOURTHLINK=1) + plenty road (`leadfeast`), 8 seeds (11/22/33/44/55/66/77/88), 180d death-aware.
- Scenario (both arms, identical): at first observed wave-4 unlock (waveEff ≥ 4), +3d: break the oldest qualifying link (active + seasoned + regional+, the +34/link set) via the engine's OWN `Game.breakLink(id, 'gambit')`. +10d: break a second if qualifying links remain (the 2-link case the prior run never tested — its wr≥4 condition was dead on arrival).
- Arm `sticky` (a): pristine current engine — the ratchet holds the unlock.
- Arm `mercy` (b): pristine engine + instrument-side mercy emulation — at each deliberate break the instrument zeroes the engine's OWN ratchet-memory field (`Game.state._standingPeakWave = 0`; there is no separate setter method in the engine — verified by grep). With peak=0 the floor is max(gated,0)=gated: behaviorally identical to the pre-ratchet engine, computed by the engine itself. A later re-earn re-records the peak and re-fires the release beat, as the old engine did.
- "Weakened" is operationalized, not hand-picked: a pair counts as weakened iff the mercy arm's first break actually re-locks — villages that WOULD have triggered the mercy under the old engine.
- Attribution per PAIR: break cause (link id/kind/other, 'gambit', same link both arms), wave-4/5 rung state at break (stEff/stRaw pre/post, waveEff pre/post, peak pre/post, reLocked on mercy, heldByRatchet on sticky — engine-real: raw below the t4 bar but the wave didn't drop), 30d post-first-break outcome on BOTH arms (held/died/hollow, uncensored; anchored at the first break day).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)
- **Axis**: scale-onramp (the wall), lever-2 + lever-8 lens. Same tree, identical seeds, both arms in one sweep. Zero src/js changes.
- **Seeds**: 11/22/33/44/55/66/77/88 × fourthlink/leadfeast × {sticky, mercy} = up to 32 runs. **Horizon**: 180d death-aware (harness stops dead villages; +10d tail). The question is the break's 30d aftermath; 180d gives late unlockers room (the prior run's belongseek/77 censored at d156 — the leadfeast road unlocks earlier per the diagnostic's 8/8).
- **PRIMARY (DIAGNOSTIC GO)**: (a) ≥ 80% of deliberate link-break PAIRS fully attributed — both events brokeOk with the SAME linkId, every numeric field present on both, both 30d outcomes determined (held/died/hollow uncensored); censored in the denominator, out of the numerator; AND (b) a NAMED verdict over the weakened pairs: helps / hurts / neutral — net = helped−hurt; helps iff net ≥ +2, hurts iff net ≤ −2, else neutral — with the numbers, plus the separation rung (SEPARATES/SUGGESTIVE/UNCONCENTRATED/UNDERPOWERED, UNDERPOWERED honestly named also satisfies (b)).
- **SECONDARIES** (reported, non-binding): (S1) 30d outcome distributions: sticky-held vs mercy-re-locked on weakened pairs; (S2) post-break trajectories (+1/+3/+7/+14/+30 stEff/stRaw/waveEff); (S3) sense: the say-ring around break days — do the moots/breaks read as village decisions?
- **GUARDRAILS**: median survival (mercy) ≥ median survival (sticky) − 10d on the identical-seed control; no new death mode (cause-family at n≥3 on one arm only); `git status` at commit shows scripts/ + evidence/ only.
- **Gates before spend**: proof `scripts/test-monostick-20261015.js` REAL RED→GREEN (STICK_RED=1 inverts the re-lock check); SMOKE=1 (policy unwrap — fail loudly if the suite ever runs policy-less); AA=1 (sticky ~ mercy ~ pristine byte-identical pre-scenario); det-gate (scenario records bit-identical across reruns). A miss is NO-GO, never re-scored (§14).

## Design calls documented for Steve's overrule
1. The mercy emulation touches ONLY the engine's own ratchet-memory field at deliberate break events — the cleanest possible old-engine restoration with zero src/js changes. Natural (non-deliberate) breaks are out of scope; the comparison is about the deliberate break's aftermath.
2. 'gambit' is the break flavor (Haven breaks faith — the player-initiated path), matching the prior run for comparability.
3. The sticky arm is the own control (CONTROL BASELINE DRIFT #247: never inherit baselines) — the current engine IS the status quo; the mercy is the variant under test.

## Results (32 runs: 2 arms x 2 policies x 8 seeds, 180d death-aware)

Gates before spend (all green): proof `scripts/test-monostick-20261015.js` REAL RED→GREEN — STICK_RED=1 the re-lock FAILS as designed (mercyApplied=false), default all 18 checks PASS (fixture: 3 real links + 3 real faced wave-3 types → standing 102, wave 4, peak=4 LANDED; sticky break → stRaw 102→0, waveEff 4→4, heldByRatchet=true, peak 4→4; mercy break → peak 4→0, waveEff 4→1 RE-LOCK; 15d smoke no hallucination; A/A byte-identical). SMOKE=1 green (named-export unwrap: fourthlink id=fourthlink with FOURTHLINK=1, leadfeast id=leadfeast; 4 policy/arm combos clean). AA=1 green (sticky ~ mercy ~ pristine byte-identical pre-scenario, 60d). det-gate green (8 pairs bit-identical hashes + scenario records at 150d).

**8 link-break pairs** (8/16 policy-seed combos produced scenarios; the other 8 had no w4 unlock on EITHER arm — paired 1:1, linkMatch 8/8, zero pre-break divergence).

| pair | break #1 (both arms) | sticky waveEff | mercy waveEff | 30d sticky | 30d mercy | verdict |
|---|---|---|---|---|---|---|
| fourthlink/22 | d120 Stonebridge (gambit), 102→0 | 4→4 HELD-BY-RATCHET | 4→3 RE-LOCK | held | held | neutral |
| fourthlink/44 | d61 Emberhold (gambit), 127→25 | 4→4 HELD | 4→3 RE-LOCK | held | held | neutral |
| fourthlink/66 | d90 (gambit), RAW both (4-link court) | 4→4 RAW | 4→4 RAW | died | died | neutral (non-weakened) |
| fourthlink/77 | d92 (gambit), RAW both (wave 5 held) | 4→4 RAW | 4→4 RAW | hollow | hollow | neutral (non-weakened) |
| leadfeast/22 | d120 (gambit), 102→0 | 4→4 HELD | 4→3 RE-LOCK | held | held | neutral |
| leadfeast/33 | d92 Emberhold (gambit), 102→0 | 4→4 HELD | 4→3 RE-LOCK | held | held | neutral |
| leadfeast/44 | d61 (gambit), 127→25 | 4→4 HELD | 4→3 RE-LOCK | held | held | neutral |
| leadfeast/77 | d111 Emberhold (gambit), 152→50 | 4→4 HELD | 4→3 RE-LOCK | held | died | **helped** |

Second breaks fired 3 times (the fixed condition works — the prior run's never did): fourthlink/66 d97 (sticky HELD / mercy RE-LOCK, both died), fourthlink/77 d99 (RAW both, hollow both). fourthlink/66's pair is "weakened at break #2" — see metric review.

- **(a) Attribution: 8/8 = 100% ≥ 80% — MET.** Every pair carries break cause (link id/kind/other, 'gambit', same link both arms), wave-4/5 rung state at break (stEff/stRaw pre/post, waveEff pre/post, peak pre/post, reLocked on mercy, heldByRatchet on sticky), and determined 30d outcomes on both arms. Zero censored pairs.
- **(b) Named verdict over the 6 weakened pairs: NEUTRAL** (helped 1, hurt 0, neutral 5; net +1 < +2). Separation on the readinessbind three-rung rule → **UNDERPOWERED** (1 decisive pair): the one helped village (leadfeast/77) had armorP 11, roster 7, pantry 9.7d, trust 43.5, rank national, 2 wave-3 ledger kills — no factors are claimed.
- **GO verdict: GO.** (a) 100% ≥ 80% met; (b) neutral honestly named with numbers, which the pre-registered rule accepts. This is a diagnostic — its job was in-the-wild evidence for "should unlocks stick?", and it delivered: **the hold never hurt a weakened village (0/6), helped 1/6, and was 30d-neutral 5/6. The mercy never produced a better 30d outcome than the hold on any weakened pair.**

### The ratchet's floor, visible in the trajectories
Sticky post-break: stEff pins at exactly 100 (the t4 floor) while stRaw reads 0/25/50 — the floor does the work, engine-real. Mercy post-break: stEff = stRaw (0/25/50), wave 4→3.

### The mercy arm re-earns (the old engine's forgiveness path still works)
3 of 6 weakened mercy villages re-courted and re-opened wave 4 by d+30 (fourthlink/22: st0/w3 → st127/w4; leadfeast/22: st0/w3 → st127/w4; leadfeast/33: st0/w3 → st102/w4). The climb is re-earn-able under the mercy too — the difference is only the 30d window's wave pool.

## Secondary S1: outcome distributions (weakened pairs)
Sticky-held (ratchet fired): held 6/6 at 30d. Mercy-re-locked: held 5/6, died 1/6. The one divergence (leadfeast/77): sticky held with roster bleeding 7→2 by d+30; mercy died before d+30 (roster 7→6, then the village went). The mercy never saved a village the hold doomed — across 6 weakened pairs the hold's 30d outcome was always ≥ the mercy's.

## Secondary S2: post-break trajectories
See the pair table above. Notable: fourthlink/44 and leadfeast/44 (partial breaks, 127→25): sticky sat at st100/w4 with living 9→8→7; mercy sat at st25/w3 with living 9→4 — both "held" at 30d, but the mercy village bled harder (living 4 vs 7). The wave pool's absence didn't save it; the standing collapse did the damage either way.

## Secondary S3 / SENSE-TESTING: do the breaks read as village decisions?
Three break-day transcripts read (mercy-leadfeast-s77 d111, sticky-fourthlink-s22 d120, mercy-leadfeast-s33 d92):
- **The break beat reads consequentially, not robotically**: "The link with Emberhold is broken (gambit). What was built over weeks comes apart in a sentence." followed by "◈ The realm came apart — no polity answers to Haven now, and Haven is a free fire again. National no longer describe this village. The climb starts over." The System reacts to the rank loss ("FINALES need a NATION..."). Around it: gossip with distortion ("Three retellings in, nobody remembers what actually happened"), teaching ("Rafael is walking Xavier through the Blackberry"), grief ("They're burying their speaker — grain can wait a week; grief can't"), newcomer debates, barter, fire-lingering. The village reads as people absorbing a blow. PASS.
- **The re-lock still has no beat** (confirms the prior run's finding): mercy s33 waveEff 4→3 with MERCY-RESET RE-LOCK — nothing announces the draft closing. The sticky hold is equally unbeaten — wave 4 stays with no fiction for why the System's attention didn't waver. If the hold stands as engine law, the fiction needs the beat ("the draft stays open"). Documented, not a code bug.
- **NEW — filed to sim-findings**: on all 3 transcripts, the "⛓️ X brings it home: [village] bows to Haven — one organization, us primary. Tribute: 4,000 kcal/week. The relationship starts at trust 30." beat fires on the break day AFTER the break + realm-death beats. The village is told the link is both broken and newly bowed. Possible stale-link beat or same-day re-court — needs an engine-side look.

## Wall numbers (this run)
national 19/32 · table 0/32 · wins 0/32 · wave-4 unlocks 16/32 · wave-5 unlocks 4/32 · median survival 108d (max 182d) · endReasons: village-lost 31, survived 1 · exiled 4. By arm: sticky national 10 / mercy national 9, median 108/108, w4 8/8, w5 2/2 — the mercy emulation doesn't move the wall numbers. (Courtship+feast substrate is the scale road; the scale-wall baseline was seeded on non-courtship sims — same explanation as the prior run.)

## Metric review (§14 — for the NEXT run, not this one)
1. **"Weakened at break #2" escapes the binary rule.** fourthlink/66: break #1 RAW (4-link court held), break #2 re-locked on mercy (sticky HELD, both died). The pre-registered weakened rule (first break only) bins it non-weakened, but the mercy bit on the second break. Next run: weakened = ANY deliberate break re-locked. (Wouldn't change this run's verdict — s66 was neutral either way.)
2. **RING_CAP=200 trims early-break sense slices.** Sense re-runs needed RING_CAP=20000 + break-day-centered slices (slice from the first break-day line, not the window tail). Future scenario sweeps should default the sense slice to break-day-centered.
3. **Mercy scope held.** The emulation fires only at deliberate breaks; no natural breaks interfered in any 30d window. On longer horizons a natural break on the mercy arm would get sticky treatment — documented scope, not a flaw in this comparison.
4. **fourthlink's uncapped courtship shrinks the weakened set.** 4+ link courts absorb one break (RAW holds on both arms). The two-break design recovered some of this (s66 break #2). A future run wanting more weakened pairs should break TWO links on the same day.

## Village assessment (plain words)
The courtship villages climb honestly — three, four seasoned bonds, a realm, wave 4 opening on friendship around day 61–120, two of them touching wave 5. Then the instrument breaks faith, one 'gambit', and the edifice falls in a day: on the three-link courts the realm itself dies (102→0, the System's attention snaps shut); on the four-link courts it's a flesh wound (the realm doesn't care about one tantrum). Every time, the draft's fate is decided by arithmetic the village never sees — but the village FEELS the realm come apart, and the System says the rank loss aloud.

In the sticky villages the same sentence is said, the same Standing collapses — but the draft stays open, silently. Wave-4 monsters keep coming to the treeline. And 30 days later, 5 of 6 weakened pairs are indistinguishable: the mercy didn't save anyone the hold doomed. The one it saved (leadfeast/77, armor thin at 11, already national, already bloodied by wave-3 kills) is the honest remainder — a village that was already fighting at wave-4 weight, for whom closing the draft meant facing the same enemies with less of the System's attention. Too few to name a pattern; enough to say the hold is not a rescue and not a curse. It's a door left open — and on the measured evidence, an open door never hurt the weakened village standing in it.

The most human moment is the mercy villages' re-courting: broken at day 92, wave gone, and by day 122 the village has built new bonds and wave 4 re-opens — without a word from the System. The game already knows how to forgive; the ratchet just means it doesn't have to.

## Blanks filled / documented

- **FILLED (so far)**: `scripts/monostick-sweep.js` (link-break scenario harness, paired sticky/mercy arms, SMOKE=1 + AA=1 gates, per-seed JSONs with national/table/wins/exiled telemetry), `scripts/test-monostick-20261015.js` (proof, REAL RED→GREEN), `scripts/det-gate-monostick-20261015.js` (scenario determinism gate), this evidence file with the pre-registered header. Zero src/js changes.

## Convergence

scale-onramp: CONVERGING (unchanged). The diagnostic delivered its in-the-wild evidence: the landed ratchet's hold is 30d-neutral-to-mildly-helpful on weakened villages (1 helped, 0 hurt, 5 neutral of 6 weakened pairs); the old re-lock mercy never produced a better 30d outcome than the hold. Steve's "should unlocks stick?" now has measured in-the-wild evidence instead of proof-fixture argument: stickiness doesn't hurt weakened villages. The axis moves when a run lands a version of the readiness gate with an achievable primary.

## Files
- `scripts/monostick-sweep.js` — the diagnostic sweep.
- `scripts/test-monostick-20261015.js` — proof, REAL RED→GREEN.
- `scripts/det-gate-monostick-20261015.js` — scenario determinism gate.
- `evidence/2026-10-15/sim-monostick.md` — this file.
- `evidence/2026-10-15/monostick-runs.json` — aggregate + pair records (planned).
- `evidence/2026-10-15/perseed-monostick/` — per-seed JSONs (planned).
