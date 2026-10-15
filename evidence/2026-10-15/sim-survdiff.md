# sim-survdiff — the post-wave-4-unlock survival differential (fleshout-a-2026-10-15T174600Z, loop A, ARM 2)

Worktree: `~/workspace/worktrees/sim-survdiff-a`. Diagnostic instrument, ZERO src/js changes — instrument only. This arm executes sim-findings **#268**'s named diagnostic: "Control milestone: s33 reached NATIONAL and survived 150 (second diplomacy village observed holding wave-4 contact) — survival variance on the diplomacy road is real and unexplained, worth a diagnostic arm on what distinguishes surviving unlock villages."

Canon: docs/CANON.md (read first), docs/MONSTER-WAVES.md. The gate context is evidence/2026-10-15/sim-wave4gate-20261015.md (w4 = w3-rung + gated standing ≥ t4(100); w5 = ≥ t5(200) + wave-4 faced; plenty cap 100 toward t5; 14/16 w4 unlocks, median unlock day 92; bread road can't buy wave 5), the feast-stack substrate convention is evidence/2026-10-15/sim-tribcollapse.md (FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 asserted up front).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sim ran)

Written 2026-10-15 ~13:00 CDT, before SMOKE/DETGATE/the sweep. No sweep trajectory has been observed.

**Question:** what distinguishes wave-4-unlock villages that survive 30d+ post-unlock from those that die 20–50d early (the hybridroad/hybridroad-r35 s22/s44 shape)?

**PRIMARY GO (binding):** ≥90% of wave-4-unlock villages classified survivor/non-survivor with the differential factors NAMED AND NUMBERED (e.g. "6/6 survivors had pantry ≥ X fresh-days at unlock; 0/5 non-survivors did"). A miss is NO-GO: instrument repaired, evidence only. If no factor separates cleanly, the honest negative is the result — no hand-picked factors after the fact; the factors are computed by the instrument's differentialFactors() over the pre-registered candidate set.

**Substrate:** 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast}, 180d death-aware, feast-stack substrate: FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 asserted up front in proof AND sweep. Single side, diagnostic — no lever. Policies imported from scripts/policies/tribfloor.js (same ids as feastscale, layer delegates byte-identically when off).

**Horizon + why:** 180d death-aware (dead villages stop; +10d tail max). wave4gate measured unlocks d43–122 on this substrate; the +30d post-unlock window needs a horizon to ~d150 for late unlocks.

**Instrument:** scripts/survdiff-lib-20261015.js (sampler + pure classifier over persisted run records). For EVERY run that unlocks wave 4, the sampler records: unlock day; standing composition at unlock (war/dip/plenty, gated vs raw); and at unlock+30d (or at death if earlier): villager count, median villager HP, wound load, armor coverage, counters known (villagerTricks), pantry kcal + fresh-days, wave-4+ fight count and deaths in the window, death cause if died. Classifier: survivor (alive ≥30d post-unlock) vs non-survivor.

**Candidate differential factors (pre-registered — the instrument computes over exactly this set):** pantry fresh-days at unlock; pantry kcal at unlock; villager count at unlock; median villager HP at unlock; wound load at unlock; armor coverage at unlock; counters known at unlock (monsterCounters + villagerTricks); dominant standing road at unlock (blood/bonds/bread); wave-4+ fight count in the post-unlock window; deaths in the window by family. A factor is REPORTED only if it separates at least 80% of the unlocking runs in one direction (a threshold that puts ≥80% of one class on one side and ≥80% of the other class on the other side). Perfect splits first.

**Secondaries (pre-registered):** wave-5 unlock share in the window; the counter/armor channels (sim-findings #281: the counter channel is dark for wave-5 readiness — record what counters/armor the survivors actually had); median unlock day; the standing composition split (blood/bonds/bread) of survivors vs non-survivors.

**Gates before spend:** proof scripts/test-survdiff-20261015.js REAL RED→GREEN on constructed fixtures (survivor/non-survivor classification; every recorded field; differentialFactors on planted separations; engine-read equivalence); det-gate det-gate-survdiff (D1 determinism, D2 instrument ON vs OFF byte-identical); SMOKE green BEFORE the sweep.

**Sense testing (SENSE-TESTING LAW):** sense-read at least one survivor and one non-survivor transcript across the post-unlock window — read the fights and the village's state for meaning, not just counts. Flag anything robotic or incoherent.

---

## Instrument design notes

- Proof: scripts/test-survdiff-20261015.js — REAL RED (exit 1, module absent) → GREEN 36/36. The GREEN phase caught two real issues before the sweep: (1) the lib read armor via `Scattering.S.equipment` but the canonical namespace is `Scattering.equipment` (the harness deletes `global.window`); (2) fresh villagers auto-equip clothing that counts as armor (wool_socks P=1 etc.), so the armor-construct test clears gear first for exact numbers.
- Gates (all green before the sweep): SMOKE (15d × 2 policies), DETGATE D1 gate determinism (11/leadfeast/60d ×2 identical), D2 instrument ON vs OFF byte-identical (33/belongfeast/60d), D3 deaths captured (45 on 33/belongfeast/60d), D4 sampler rows intact.
- **INSTRUMENT REPAIR (2026-10-15, mid-run):** the first sweep (16 runs) recorded `fightsW4plus=0` on ALL runs. Forensics: the sweep's `attachFights` called the module-level `gday()` with no `Game` argument, so every fight record was stamped `day: 0` and the window filter `f.day > ud` excluded everything. The counts (`fightCounts`) were correct — only the day stamps were wrong. Fixed (`gday(Game)` in both wraps) + a self-consistency guard that throws if any fight day falls outside [1, daysRan]. The first sweep's rows are superseded for the window-fight fields; trajectories are unaffected (the fix only changes recorded values — the s11 re-run reproduced the first sweep's trajHash byte-identically). The full sweep was re-run with the fixed instrument; results below are from the re-run.

---

## Results

**PRIMARY GO: NO-GO (binding).** 14/16 runs unlocked wave 4; 100% classified (8 survivor, 6 non-survivor) — but **no candidate factor separates the classes**. Per §14 the miss is NO-GO, never re-scored: the instrument was repaired twice mid-run (day-0 fight stamping; death double-counting) and the clean re-run confirms the negative. The honest answer to #268: none of the 15 pre-registered state factors distinguishes post-wave-4-unlock survivors from non-survivors on this substrate.

The 16-run census (8 seeds × {leadfeast, belongfeast}, 180d death-aware, feast-stack substrate, fixed instrument):

| run | verdict | u-day | road | pantryD | pantryK | n | medHp | wound% | armor | cnt/trk | fW4 | dW | fam | w5 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| leadfeast s11 | survivor | 76 | bread | 96 | 70,335 | 9 | 100 | 0.33 | 1.0 | 18/0 | 5 | 8 | combat | – |
| leadfeast s22 | survivor | 91 | bread | 7 | 12,693 | 5 | 94 | 0.60 | 1.0 | 21/0 | 9 | 9 | combat | 108 |
| leadfeast s33 | non-survivor | 55 | bread | 39 | 98,194 | 6 | 92 | 0.67 | 1.0 | 12/0 | 5 | 10 | combat | – |
| leadfeast s44 | no-unlock | – | – | – | – | – | – | – | – | – | – | – | – | – |
| leadfeast s55 | survivor | 76 | hybrid | 28 | 67,460 | 8 | 99 | 0.50 | 1.0 | 16/1 | 14 | 16 | combat | 93 |
| leadfeast s66 | survivor | 76 | bonds | 432 | 103,722 | 9 | 84 | 0.89 | 0.89 | 16/1 | 9 | 10 | combat | 87 |
| leadfeast s77 | non-survivor | 104 | bread | 29 | 18,598 | 6 | 98.5 | 0.67 | 1.0 | 18/0 | 8 | 8 | combat | 107 |
| leadfeast s88 | survivor | 81 | hybrid | 6 | 13,996 | 7 | 88 | 0.71 | 0.86 | 25/0 | 5 | 2 | combat | 105 |
| belongfeast s11 | survivor | 112 | bread | 31 | 64,687 | 7 | 96 | 0.71 | 1.0 | 19/0 | 12 | 13 | combat | – |
| belongfeast s22 | non-survivor | 75 | bread | 135 | 32,708 | 5 | 77 | 0.80 | 1.0 | 19/1 | 11 | 12 | combat | – |
| belongfeast s33 | non-survivor | 72 | bread | 11 | 27,754 | 8 | 93 | 1.0 | 1.0 | 18/0 | 12 | 7 | combat | – |
| belongfeast s44 | non-survivor | 72 | bread | 5 | 16,219 | 6 | 85.5 | 0.67 | 1.0 | 16/0 | 7 | 5 | monster | – |
| belongfeast s55 | no-unlock (died d59) | – | – | – | – | – | – | – | – | – | – | – | – | – |
| belongfeast s66 | survivor | 57 | bread | 9 | 21,625 | 5 | 100 | 0.40 | 1.0 | 15/0 | 6 | 5 | combat | – |
| belongfeast s77 | non-survivor | 58 | bread | 2 | 5,000 | 7 | 98 | 0.57 | 1.0 | 19/0 | 10 | 8 | combat | – |
| belongfeast s88 | non-survivor | 100 | bread | 3 | 7,190 | 3 | 43 | 1.0 | 1.0 | 22/1 | 5 | 4 | monster | – |

(pantryD = pantry fresh-days at unlock; pantryK = pantry kcal; n = villagers; medHp = median villager HP; wound% = wounded share; armor = armor coverage; cnt/trk = monsterCounters/villagerTricks; fW4 = wave-4+ fights in the post-unlock window; dW = window deaths, deduped; fam = window death family.)

Read it both ways and nothing separates: the deepest pantry at unlock (135 fresh-days, belongfeast-s22) died; the fattest pantry (98k kcal, leadfeast-s33) died in 18 days; the most wounded village at unlock (wound% 1.0, belongfeast-s33) died but so did wound% 0.57–0.8; the healthiest (medHp 100, belongfeast-s66) survived but medHp 96–99 also died; 5–14 wave-4 fights in the window on both sides; 2–16 window deaths on both sides; bread road 5 survivors / 6 non-survivors. Death families: combat 12/14, monster 2/14 — both classes die fighting.

Secondaries (pre-registered):
- **Wave-5 unlock share in the window: 5/14 (36%)**, all five within their +30d windows (s22 d108, s55 d93, s66 d87, s77 d107, s88 d105). 4/8 survivors and 1/6 non-survivors unlocked wave 5.
- **Counter/armor channels (#281):** the wave-1/2 counter channel is BRIGHT — survivors held 15–25 monsterCounters known at unlock (non-survivors 12–22, no separation). Armor coverage ~1.0 nearly everywhere (auto-equip clothing counts; mean P is clothing-grade). The dark channel is wave-3+ signature knowledge: villagerTricks 0–1 on 13/14 runs. #281's "counter channel dark for wave-5 readiness" refines to: wave-1/2 counters are known and don't save anyone; wave-3+ tricks are nearly absent on both sides.
- **Median unlock day: 76** (range 55–113).
- **Standing composition split:** survivors {bread 5, hybrid 2, bonds 1}; non-survivors {bread 6}. The bonds and hybrid unlocks all survived their windows; bread went 5/11.

Wall numbers (this run): national/table/wins not in this arm's pre-registered metrics (the census tracks them); wave-4 14/16, wave-5 5/16, median survival 117d (max 180d), exiled 0/16.

---

## Village assessment (plain words)

Fourteen villages unlocked wave 4 on the feast-stack substrate (7/8 leadfeast — s44's quiet 180d survival at maxW=3 never unlocked; 7/8 belongfeast — s55 died at d59 before the bar). What they look like at the unlock: pantries from 2 to 432 fresh-days (median ~20), 3–9 villagers standing, median HP 43–100, wound shares 0.33–1.0, armor on nearly everyone (the auto-equip clothing counts — coverage 0.86–1.0), 12–25 wave-1/2 counters known and almost no wave-3+ tricks (0–1). The unlock roads are overwhelmingly bread (11/14), with 2 hybrid and 1 bonds.

Then the Mirror Draft arrives — and it arrives as The Reunion, almost everywhere. The post-unlock window is 5–14 wave-4+ fights of villagers (and the scholar) standing at the treeline against a monster that wears dead villagers' faces and hits with your own moves. The villages that "survive" 30 days don't look saved: leadfeast-s55, the bloodiest survivor, buried ~16 villagers in the window and died 5 days after the +30 mark. The non-survivors aren't obviously weaker at the unlock — belongfeast-s22 unlocked with 135 pantry fresh-days (the deepest pantry in the whole census) and died 25 days later; leadfeast-s33 unlocked with the fattest pantry (98k kcal) and died in 18 days.

The missing capability is not in the measured set. It isn't food (the fattest pantries died), it isn't numbers (3–9 villagers both sides), it isn't health or armor or counters (all overlap), it isn't the road (bread dies and survives alike), and it isn't even wave-4 contact volume (5–14 fights both sides). What the transcripts show instead is a war of funerals: every death shakes the links ("the dead hold no treaties"), tributes get pressed down while the chair is empty, and the village bleeds people faster than it can bury them. The differential, if there is one, lives in the casualty *sequence* — who dies when, and whether the village can absorb the next funeral — not in any stock measured at the unlock.

---

## Sense verdict

Read the post-unlock window for a survivor (leadfeast-s55: unlock d76, hybrid road, 14 wave-4 fights, died d111 — 5 days past the +30 mark) and a non-survivor (leadfeast-s33: unlock d55, bread road, died d73 — 18 days post-unlock).

**Survivor s55: EARNED, and barely.** The Mirror Draft opened d76; d86 The Reunion came ("Rob the living and the dead in the same place"), d90 the System named the bar ("The fifth draft stays in the wings. Stand before the Mirror Draft's champions"), d93 wave 5 released, d96 a 4-raider night raid (Loud-Eyes, The Ugly Beast, The Reunion, The Eater) hit Haven, d97 OVERTIME ×1 (reruns, +25% HP). The blow-by-blow reads right: Megan vs the Reunion — "Your Move hits Megan for 57", she binds a wound mid-fight (+20), strikes for 14 against 1186 HP, "sees how this ends — and runs while running still works." ("Your Move" is the Reunion's actual attack — it hits you with your own moves; the log is correct, not a UI artifact.) Villagers flee wisely and die anyway (4 vDie in the window). Funerals shake the links every time. The village that "survived" is a village that bled out more slowly.

**Non-survivor s33: the same war, faster.** Unlock d55 ("RATINGS ARE UP... The Mirror Draft opens"), Reunion contact d61 (villager died), d67 (fled), d69 (villager died), d70 the scholar faced it twice — then the village died d73. The Codex pages turn on their own for each death ("You didn't ask. It knew."), the links shake, tributes get pressed. Nothing in the transcript distinguishes it from s55 except the casualty rate.

**Coherence: PASS on both.** Villagers act like people — they forage sensibly, flee fights they can't win, die, get buried, and the polity reacts. The System narrates every gate honestly. Nothing robotic, no silent mechanics. The fiction and the numbers agree at every step.

One wrinkle (blank, documented not fixed — game code): the harness's tele death capture and the registerDeath wrap can double-report a death under different `who` formats; the sweep dedupes on the vid now, but a future instrument should pick ONE death source.

---

## Metric review (§14)

1. **The NO-GO is a real negative, not an instrument failure.** The instrument classified 100% of unlocking runs and read real, varying numbers on all 15 candidates (pantryD 2–432, medHp 43–100, wound% 0.33–1.0, fW4 5–14, dW 2–16). Two genuine instrument bugs were found and repaired mid-run (day-0 fight stamping; death double-counting); the clean re-run reproduces trajectories byte-identically and confirms the negative. No factor was hand-picked after the fact — differentialFactors() ran over the pre-registered set only.
2. **The 80% strong-split bar was never close.** This wasn't a near-miss on one factor — every candidate overlaps substantially on both sides. The belongfeast-only subset showed a "perfect" median-HP split (3/3 vs 4/4) that vanished at n=14: a textbook small-n artifact, and exactly why the GO binds on the full census.
3. **"Survivor" is a thin technicality.** The +30d mark is pre-registered and honest, but the sense read shows s55-style survivors are villages bleeding out more slowly (s55 died 5 days past the mark). A future diagnostic should use a harder survival bar (e.g. +60d, or "alive with ≥4 villagers") — proposed for the NEXT run, not applied here.
4. **The casualty sequence is the unmeasured dimension.** Deaths arrive as a sequence (who dies when, and whether the next funeral breaks the village), but the instrument only counts them. A next instrument could record the inter-death intervals and the roster trajectory through the window — the "war of funerals" hypothesis from the village assessment, falsifiable on the rows.
5. **Sweep-wiring needs proof coverage.** The proof test proved the lib (36/36) but not the sweep's day-stamping — the gday() bug lived in the sweep script. Next instrument run: the proof test should import the sweep's attach functions (export them) and assert day-stamped records on a 3-day fixture run.
6. **Death-source duality.** The harness tele capture and the registerDeath wrap double-report; the vid-key dedupe works but the honest fix is one source. The wrap's kind/vid/name is richer; the tele's player flag is load-bearing. Next run: wrap registerDeath AND read the player flag from the tele event keyed by day|vid, single list.

---

## Blanks (filled / documented)

- **FILLED:** the survivdiff instrument — scripts/survdiff-lib-20261015.js (sampler + pure classifier + differentialFactors over the pre-registered candidate set), scripts/sweep-survdiff-20261015.js (16-run sweep, SMOKE/DETGATE/ANALYZE modes, the day-stamp self-consistency guard), scripts/test-survdiff-20261015.js (36/36 green, REAL RED first). Zero src/js changes — verified by the commit file list (scripts/ + evidence/ only).
- **FILLED (mid-run repairs):** (1) the day-0 fight-stamping bug — `gday()` without `Game` in attachFights zeroed every fight day and the whole window count; (2) the death double-count — tele `who` vs wrap `vid/name` defeated the dedupe, ~2x inflated window deaths; both fixed, full sweep re-run, trajectories byte-identical.
- **DOCUMENTED (the #268 answer):** survival variance on the diplomacy/bread road is NOT explained by any of: pantry depth, villager count, villager HP, wound load, armor coverage, counters known, standing-road composition, wave-4 fight volume, or window death counts. All 15 pre-registered candidates overlap. The transcripts point at the casualty *sequence* (the war of funerals) as the unmeasured dimension — next instrument's hypothesis.
- **DOCUMENTED (#281 refined):** the wave-1/2 counter channel is bright (12–25 known, both classes) and doesn't save anyone; armor is near-universal (clothing-grade). The dark channel is wave-3+ signature knowledge (villagerTricks 0–1 on 13/14 runs).
- **DOCUMENTED:** the sweep process died mid-run once (during leadfeast s77 of the second sweep, ~18:44 UTC) with no error in the log — likely runtime/VM, not the script (memory was fine, the re-run completed cleanly). The ANALYZE=1 mode (added so an interrupted sweep's per-seed files can be analyzed without re-running) is the recovery path; it also re-verified the verdict identically.
- **For the next diagnostic:** harder survival bar (+60d or roster-floor), casualty-sequence instrumentation (inter-death intervals, roster trajectory), sweep-wiring proof coverage, single death source.
