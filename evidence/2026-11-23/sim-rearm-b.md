# sim-rearm-b — EVIDENCE (frozen prereg judged)

**Arm:** sim-rearm-b · **Loop B run:** fleshout-loop-b-20261123T2130Z
(ADOPTION of the timed-out 1830Z run)
**Axis:** winnability-chain · **Finding:** sim-findings.md line 2717
`[claimed]` — NO RE-ARM PATH EXISTS FOR SEARCASTERS
**Type:** BUILD + JUDGE a lever (REARM_CELLS=1, env-gated, no default
flip) — the corpse-transfer re-arm path.
**Verdict: GO** — every frozen bar passes (judge: analyzer
`--rearm-compare`, tier tally, balanced panel, arm test).
**Prereg:** `evidence/2026-11-23/sim-rearm-b-prereg.md` (frozen
2026-11-23 ~19:00 UTC). All bars below are the frozen bars; nothing
was re-scored.

## 0. Adoption record (what the 1830Z run left, what this run did)

The 1830Z run timed out mid-pilot. State verified from disk at
21:33Z adoption (no files written in the tree in the 15 min before
21:33Z — no live worker):

- Prereg commit `ca5f8f987` intact; pilot control leg complete (8/8
  seeds, s107533–107540, `rearm-b-pilot-ctl-analysis.json` on disk).
- Pilot arm leg: only s107533 valid (village-lost d47, rearmTakes 0);
  arm leg-2 log empty. Missing arm seeds: 107534–107540 (7 seeds).
- This run re-ran ONLY the 7 missing arm seeds (same instrument,
  same anchor `ca5f8f9875ae`, same frozen band, 2 processes × 4/3
  seeds) — no valid per-seed file overwritten.
- **Machine restart ~21:38Z killed the first re-run attempt
  (SIGTERM, both processes, 0 seeds completed, no files written).**
  Re-ran both processes from scratch; both EXIT=0. Nothing was
  faked or extrapolated.
- Pilot continue rule (prereg §7) met on the completed pilot
  (instrument valid, arm supplyDeaths 6 ≥ 1, arm rearmEvents 1 ≥ 1),
  so the run continued to confirm: remaining 8 seeds per leg,
  107541–107548, 4 processes × 4 seeds, all EXIT=0.
- Corpora complete: 16/16 control + 16/16 armed, single anchor
  `ca5f8f9875ae63664b0f3c13173da35a8ddbf66d`, single policySha
  `1884c8852d38`, gameSha `950901f3fdcc` on all 32 files.
- **Rebase:** after the sims, local master had moved to
  `04717109b` (journey-endgame r275, incl. the registerDeath
  dead-mark fix in corpses.js — the same file this arm touches).
  Rebased the branch onto `04717109b`: the pick hit the known
  rebase stop-at-pick quirk (pick in both done and todo lists,
  worktree clean, pick unapplied — verified with `grep` count 0
  for `villagerRearmFromCorpse` + empty `git diff HEAD`), recovered
  with `git rebase --continue` per the standing lesson, landed
  clean with no conflicts. New head `60f453a9b`. Proof tests re-run
  green on the rebased tip (below). The judged corpora were run on
  `ca5f8f987`; the lever code is byte-identical after the rebase
  (only the r275 dead-mark sits alongside it), so the corpus remains
  a valid judgment of the lever — stated here, not hidden.

## 1. Prereg header (frozen — metric binding §14)

- **Primary metric:** armed-leg `rearmEvents` (bar 3, ≥ 1) and
  `rearmVolleys` (bar 4, ≥ 1) on the full 16-seed staged band.
- **GO thresholds:** bars 1, 2, 5, 7, 8 pass AND bar 3 passes AND
  bar 4 passes. NO-GO = supply ≥ 1 AND (bar 3 or 4 fails) OR any
  of bars 1, 2, 5, 7, 8 fails. INCONCLUSIVE = supply 0 with bars
  1, 2, 5, 7, 8 passing.
- **Horizon:** 150d death-aware. **Seeds:** staged 107533–107548
  (16/leg), reused by design from killbundle-b (§4 of prereg).
- **Policies/substrate:** competent verbatim;
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 KILLBUNDLE=1 STAGE_SEAR=1`;
  armed leg adds `REARM_CELLS=1`. Both legs MODE=arm.
- **Pilot continue rule:** instrument valid on 8+8 AND armed-pilot
  supplyDeaths ≥ 1 AND armed-pilot rearmEvents ≥ 1 → confirm.
  (Pilot does NOT require a volley.)

## 2. Before/after numbers (16 staged seeds per leg)

| Metric | Control (REARM off) | Armed (REARM_CELLS=1) |
|---|---|---|
| Wins | 0/16 | 0/16 |
| National | 0/16 | 0/16 |
| Wave 4 reached | 16/16 | 16/16 |
| Wave 5 reached | 11/16 | 11/16 |
| Median survival (d) | 149 | 149 |
| Village lost | 8/16 | 8/16 |
| Starvation deaths | 9 | 9 |
| Total deaths | 1581 | 1574 |
| Kill-loot arrivals | 16 | 16 |
| Bundled (2 cells) | 16 | 16 |
| Dry arrivals | 0 | 0 |
| Searcaster volleys (all) | 2 | 3 |
| Kill-loot volleys | 2 | 2 |
| **Supply deaths** (holder died holding cells) | 13 | 13 |
| **Re-arm events** | 0 | **4** |
| — of which second-life (gun + cells to a new holder) | 0 | 4 |
| — of which re-arm kind (dry holder takes cells only) | 0 | 0 |
| **Second-life volleys** | 0 | **1** |
| Scholar takes of gun/cells | 3 | 3 |
| Instrument errors | 0 | 0 |

Pilot (8 seeds/leg, 107533–107540) for the record: ctl wave5 5/8,
median 145, supply 6, rearm 0; arm wave5 5/8, median 144.5,
supply 6, rearmEvents 1, rearmVolleys 0. The pilot volley bar was
not required; the confirm supplied it.

## 3. The four re-arm takes (all second-life, all Haven channel)

| Seed | Take day | Taker | Corpse (holder) | Moved |
|---|---|---|---|---|
| 107535 | d114 | olivia_bennett | adaeze_nwosu (died d114, contest) | gun + **2 cells** |
| 107542 | d116 | sigrun_eiriksdottir | emma_larsen | gun + **2 cells** |
| 107543 | d136 | gen_b4uk4mq | oliver_moore | gun + **2 cells** |
| 107548 | d100 | amina_diallo | olivia_bennett | gun + **2 cells** |

- **Prereg §3 correction:** the prereg said a corpse take moves at
  most 1 fusion cell (the `generatePossessions` 1-cell collapse).
  All four observed takes moved **2 cells**. The collapse applies
  to the scholar corpse-take path; the villager Haven sweep reads
  the death-pack directly and carries the full stack. A re-armed
  holder therefore gets a full 2-shot volley, not a 1-shot one.
  The correction strengthens the arm; it does not change any bar.
- **No witness-channel takes fired** (0 of 4). All four takes came
  through the daily Haven sweep. The witness channel is live in
  code (proven by the `--live` test) but never triggered in 16
  seeds — holders mostly die in the wild or in contests, not in
  front of a villager who can take on the spot. Named next
  question in §8, not a re-score.
- **Conversion rate:** 4 takes / 13 supply deaths = 31% of
  re-arm opportunities converted. 9 supply deaths produced no
  take (holder died in the wild with no Haven corpse, or the
  village was already gone).
- **Volley rate:** 1 of 4 takers fired. The CELLGATE wall still
  binds: a take only matters if the new holder then faces a
  wave-4+ monster while still holding cells.

## 4. The second-life volley (seed 107542)

Sigrun Eiriksdottir took Emma Larsen's gun + 2 cells on d116
(Haven sweep). She had fought with a bow before (wave-4 Suburb,
Audit, Eater, Algorithm on d78–96, 0 shots — she was out of
arrows or out-ranged; the driver records the attempts). On d121
she carried the gun into a wave-2 fight and CELLGATE held the
shot (0 shots, ammoLeft 2 — the gun stays silent below wave 4,
exactly as designed). On **d122 she fired 2 shots, 1 hit,
66 damage at a wave-5 Cancellation** and spent both cells
(ammoLeft 0). She kept carrying the dry gun through d125–134
(0-shot volley records against Cancellation, Suburb, Spoiler —
the gun is still seated, still aimed, just empty). The village
was lost d137. The gun's second life was real, brief, and aimed
at the hardest thing in the game — a Producer, not a deer.

The other three takers never fired it: Olivia (s107535) took the
gun d114 and the village was lost d129 with no monster fight in
between; Amina (s107548) took it d100, survived to d150, and
recorded no fight at all after d98; gen_b4uk4mq (s107543) took it
d136 and recorded no volley of any kind, ever. The take is the
mechanism; the fight is the luck of the village's last weeks.

## 5. Per-seed staged table

Columns: seed, days/end, wave, standing, deaths/starved,
staged arrival (day:holder), KL volleys, supply death (holder
died holding cells), re-arm take (taker, day), second-life
volleys (shots/hits/dmg), scholar takes.

### Control leg (REARM off)

| Seed | Days/End | Wave | Stand | Deaths | Arrival | KL vol | Supply | Take | SL vol | Scholar |
|---|---|---|---|---|---|---|---|---|---|---|
| 107533 | 47 lost | 4 | 100 | 71/0 | d5 grace_obi | 0 | 0 | — | — | 0 |
| 107534 | 151 surv | 4 | 199 | 111/0 | d10 gen_t2k0pd5 | 0 | 1 | — | — | 0 |
| 107535 | 145 lost | 4 | 199 | 88/0 | d6 adaeze_nwosu | 0 | 1 | — | — | 0 |
| 107536 | 144 lost | 5 | 375 | 105/0 | d7 gen_v30h8sm | 0 | 1 | — | — | 0 |
| 107537 | 124 lost | 5 | 465 | 113/2 | d7 gen_vhjvr2c | 0 | 1 | — | — | 0 |
| 107538 | 145 lost | 5 | 345 | 93/1 | d3 gen_blg32yz | 0 | 1 | — | — | 0 |
| 107539 | 150 surv | 5 | 550 | 138/0 | d3 emma_larsen | 1 | 0 | — | — | 0 |
| 107540 | 150 surv | 5 | 485 | 116/1 | d7 gen_3z8xcjr | 0 | 1 | — | — | 0 |
| 107541 | 151 surv | 5 | 350 | 71/1 | d6 chen_wei | 0 | 1 | — | — | 0 |
| 107542 | 125 lost | 5 | 350 | 102/0 | d4 caleb_jones | 1 | 0 | — | — | 0 |
| 107543 | 150 surv | 4 | 199 | 136/0 | d6 gen_h2gxe33 | 0 | 1 | — | — | 0 |
| 107544 | 150 surv | 4 | 199 | 91/2 | d7 gen_m286un3 | 0 | 1 | — | — | 0 |
| 107545 | 151 surv | 5 | 400 | 66/0 | d4 elena_petrova | 0 | 1 | — | — | 2 |
| 107546 | 148 lost | 5 | 375 | 93/1 | d5 dmitri_sokolov | 0 | 1 | — | — | 0 |
| 107547 | 130 lost | 5 | 475 | 104/0 | d8 yuki_mori | 0 | 1 | — | — | 1 |
| 107548 | 151 surv | 5 | 365 | 83/1 | d6 olivia_bennett | 0 | 1 | — | — | 0 |

### Armed leg (REARM_CELLS=1)

Identical except where noted (the lever consumes RNG, so a few
seeds diverge in outcome — s107535 lost d129 not d145, s107542
lost d137 not d125, s107543 133 deaths not 136; all else
seed-identical):

| Seed | Days/End | Wave | Stand | Deaths | Arrival | KL vol | Supply | Take | SL vol | Scholar |
|---|---|---|---|---|---|---|---|---|---|---|
| 107533 | 47 lost | 4 | 100 | 71/0 | d5 grace_obi | 0 | 0 | — | — | 0 |
| 107534 | 151 surv | 4 | 199 | 111/0 | d10 gen_t2k0pd5 | 0 | 1 | — | — | 0 |
| 107535 | **129 lost** | 4 | 199 | **84**/0 | d6 adaeze_nwosu | 0 | 1 | **olivia_bennett d114** | 0 | 0 |
| 107536 | 144 lost | 5 | 375 | 105/0 | d7 gen_v30h8sm | 0 | 1 | — | — | 0 |
| 107537 | 124 lost | 5 | 465 | 113/2 | d7 gen_vhjvr2c | 0 | 1 | — | — | 0 |
| 107538 | 145 lost | 5 | 345 | 93/1 | d3 gen_blg32yz | 0 | 1 | — | — | 0 |
| 107539 | 150 surv | 5 | 550 | 138/0 | d3 emma_larsen | 1 | 0 | — | — | 0 |
| 107540 | 150 surv | 5 | 485 | 116/1 | d7 gen_3z8xcjr | 0 | 1 | — | — | 0 |
| 107541 | 151 surv | 5 | 350 | 71/1 | d6 chen_wei | 0 | 1 | — | — | 0 |
| 107542 | **137 lost** | 5 | 375 | 102/0 | d4 caleb_jones | 1 | 0 | **sigrun_eiriksdottir d116** | **1 (2 shots/1 hit/66 dmg, d122 vs Cancellation)** | 0 |
| 107543 | 151 surv | 4 | 199 | **133**/0 | d6 gen_h2gxe33 | 0 | 1 | **gen_b4uk4mq d136** | 0 | 0 |
| 107544 | 150 surv | 4 | 199 | 91/2 | d7 gen_m286un3 | 0 | 1 | — | — | 0 |
| 107545 | 151 surv | 5 | 400 | 66/0 | d4 elena_petrova | 0 | 1 | — | — | 2 |
| 107546 | 148 lost | 5 | 375 | 93/1 | d5 dmitri_sokolov | 0 | 1 | — | — | 0 |
| 107547 | 130 lost | 5 | 475 | 104/0 | d8 yuki_mori | 0 | 1 | — | — | 1 |
| 107548 | 151 surv | 5 | 365 | 83/1 | d6 olivia_bennett | 0 | 1 | **amina_diallo d100** | 0 | 0 |

## 6. Bar-by-bar judgment (frozen bars)

| # | Bar | Threshold | Result |
|---|---|---|---|
| 1 | Instrument validity — selftest 31/31, test-rearm-b pre-run + --live green, 0 errors on 32 files, single anchor + policySha, rearmPresent true everywhere, ctl rearmOn false / arm rearmOn true | all must hold | **PASS** — selftest 31/31; test-rearm-b 18/18; --live 45/45; --dir-ctl PASS; --dir-arm PASS (rearmEvents=4, supplyDeaths=13, rearmVolleys=1, scholarTakes=3); lineage re-runs test-killbundle-b 11/11, test-killrate-a 36/36, test-killrate-analysis-a 14/14; all on the rebased tip 60f453a9b as well as the judged anchor |
| 2 | Bundle intact — every kill-loot arrival carries exactly 2 cells (klBundled == klArrivals, klDry == 0, per leg) | must hold for GO | **PASS** — 16/16 both legs, klDry 0 |
| 3 | Primary, re-arm events — armed-leg rearmEvents ≥ 1 | ≥ 1 for GO | **PASS** — 4 (all second-life) |
| 4 | Primary, second-life volley — armed-leg rearmVolleys ≥ 1 | ≥ 1 for GO | **PASS** — 1 (s107542, d122, 2 shots/1 hit/66 dmg vs a wave-5 Cancellation) |
| 5 | Control clean — ctl-leg rearmEvents == 0 | must hold for GO | **PASS** — 0 |
| 6 | Supply — armed-leg supplyDeaths ≥ 1 | ≥ 1, else INCONCLUSIVE | **PASS** — 13 |
| 7 | Guardrails — starvation-death delta ≤ +2, median-survival delta ≥ −20 | must hold for GO | **PASS** — starv 9 vs 9 (delta 0); median 149 vs 149 (delta 0) |
| 8 | Balanced panel (§15) — panels built ctl vs armed, compare completes, decision review_required, every metric status ∈ {descriptive, no_material_signal, not_observed, insufficient} | must hold for GO | **PASS** — decision `review_required` (compare exit 2, the tool's own convention); all 31 metrics descriptive / no_material_signal / not_observed; no regression signal. Panel: `evidence/2026-11-23/rearm-b-panel.md` |
| 9 | Scholar-path context + tier-4 rates + sense-test | must be delivered | **DELIVERED** — scholar takes 3 per leg (see §7); tier-4 17/142 = 11.97% both legs, byte-identical (see §7); sense-test §4 + §10 |

**Verdict rule applied:** bars 1, 2, 5, 7, 8 pass AND bar 3
passes AND bar 4 passes → **GO**. The lever lands: the
corpse-transfer re-arm path is real, the gun gets a second life,
and a second-life holder fired it at a wave-5 Producer for 66
damage. The lever stays env-gated (`REARM_CELLS=1`); no default
flip is part of this arm.

## 7. Scholar-path context + tier-4 rates (bar 9)

- **Scholar takes:** 3 on each leg, identical seeds/days (the
  lever does not touch the scholar path): s107545 d78 — the
  scholar took Elena Petrova's gun + 1 cell from her corpse (the
  exact killbundle-b §7 story reproducing on the shared
  substrate); s107547 d116 — 1 cell from Yuki Mori's corpse.
  Compare killbundle-b: 2 of 17 arrivals. Here 3 takes across
  29 (ctl) / 28 (arm) total arrivals — the scholar path is the
  same thin trickle it was; the villager path (4 takes) now
  exceeds it.
- **Tier-4 rates** (`rearm-b-tally-ctl.json`,
  `rearm-b-tally-arm.json`; tiers from `reward-economy.json`
  killItems + `items.json` lootTier fallback): 142 kill-loot
  events per leg, tier-4 = 17 (11.97%) on both legs,
  byte-identical — 16 staged searcasters + 1 fusion_cell. The
  lever touched no loot roll. (The 11.97% matches killbundle-b's
  matched-leg figure; both legs here are staged, so the forced
  searcasters inflate both equally, as the prereg said.)
- **Per-leg by-tier:** T1 18, T2 69, T3 38, T4 17 — identical
  both legs.

## 8. Scale-wall numbers (every run)

- National: **0/16** both legs. Table: **not instrumented** by
  this driver — recorded as not instrumented, never faked. Wins:
  **0/16** both legs.
- Wave 4 unlock: **16/16** both legs. Wave 5 unlock: **11/16**
  both legs. Median survival: **149d** both legs (max 151d).
- The wall is unchanged by this arm: villages reach wave 5 and
  survive to the horizon, but none reaches national and none
  wins. The re-arm is a winnability-chain link (a second volley
  at the top of the fight), not a scale-wall lever — it was never
  expected to move national, and it did not.

## 9. Reachability verdict

- Waves 1–5: reached in sims (wave 5 on 11/16 seeds per leg).
  Arc II/III/IV, regional → national, the table, the win flag:
  **not reached** — national 0/16, wins 0/16, table not
  instrumented. The content exists and is reachable in
  principle (wave 5 faced, Producers fought blow-by-blow); the
  villages in this band do not get there. That is the scale wall,
  not this arm's question.
- Vests: not instrumented by this driver.

## 10. Village assessment (plain words) + sense-test

The villages in this band look like killbundle-b's villages:
strong enough to reach the fifth wave, too thin to climb past
it. Half of them are gone by day 150 (8/16 lost on both legs)
and the survivors sit at standing 199–550 — regional, a long
way from national, with the table nowhere in sight.

What this arm changed, in plain words: **when a villager dies
holding the big gun, another villager can now pick it up.** That
sounds small and it is small — but before this change the gun
died with its holder, every time, and the village watched a
loaded weapon rot on a corpse. Four times in sixteen villages
someone did pick it up, always at Haven, always naming the dead
(the take is voiced and logged). Once, it mattered in a fight:
Sigrun picked up Emma's gun and put two shots into the
Cancellation, the monster that un-teaches abilities — 66 damage
from a gun that should have been dead and buried with Emma.

The sense-test, honestly: the take reads as a village moment,
not a mechanic. Adaeze carried the gun for 108 days without
firing it once — four fights, four silent volleys, the gun
waiting for a wave-4 monster that never came to her — and died
in a contest. Olivia picked it up the same day, carried it eight
days, and the village fell before she ever raised it. Sigrun's
take is the one that lands: she had already fought the Suburb,
the Audit, the Eater and the Algorithm with a bow and no arrows
to show for it, and when Emma's gun came to her she used it on
the first Producer she met. The gun changing hands is visible
in the census (equipped:olivia_bennett d115–122, then the
scholar's pack) and in the volley records. What the corpus
cannot show is whether the village *says* anything when the gun
changes hands in live play — the `say` line exists in code and
in the live test, but the sim driver records no dialogue text.
That is the honest limit of this sense-test.

Two open threads, documented not hidden:

1. **The witness channel never fired** (0/4 takes; all Haven
   sweep). The code is proven live, but in 16 seeds no holder
   ever died in front of a villager who could take on the spot.
   If the next arm wants more takes, the lever is a
   wild-corpse expedition (go to the death site) — the prereg
   named it as the next question, and this result confirms the
   need: 9 of 13 supply deaths produced no take at all.
2. **A census wrinkle on s107535:** the gun shows as
   scholar-pack d110–113 (before Adaeze's death) and again
   d123–129 (after Olivia held it d115–122), with no recorded
   corpse-take moving it either time. The re-arm record itself
   is unambiguous, but the gun's travel into and out of the
   scholar's pack on that seed is not explained by any recorded
   event. Worth one look by the next worker on that seed; not a
   bar, not a verdict-changer.

## 11. Metric review (§14)

- **The frozen metric was the right one.** `rearmEvents` and
  `rearmVolleys` are the observable effect, and both fired. The
  instrument was not inert (the coordinator's fear from the
  partial pilot — rearmTakes 0 on the first seed — did not hold
  across the band: 4 takes, 1 volley).
- **The prereg's 1-cell expectation was wrong** (§3 correction
  above): takes move 2 cells, so a second-life holder gets a full
  volley. The bar did not depend on the cell count, so no
  re-score was needed — but the next arm's sizing should assume
  2 cells per take.
- **The base-rate note held:** with 4 takes and a 12.5%
  per-arrival fire rate, P(≥1 volley) ≈ 1 − 0.875^4 ≈ 41%; one
  volley landed. The strict bar (takes AND a volley) was met
  with no slack to spare — on a thinner band it would have
  missed, and that would have been a NO-GO by the frozen rule,
  correctly.
- **No metric was re-scored.** The pilot's rearmTakes-0 first
  seed, the machine restart that killed a re-run, and the
  census wrinkle were all recorded as events, none as reasons to
  move a bar.
- **Suggested revision for the NEXT run (not this one):** judge
  takes and volleys separately — a takes>0/volleys=0 confirm
  currently reads NO-GO under the frozen rule even though the
  take mechanism itself is proven. The prereg's own base-rate
  note anticipated this; a future prereg could make bar 4 a
  graded bar (volley OR take-rate ≥ 25% of supply) rather than
  a hard gate. Proposing it here; not applying it here.

## 12. Files

- Prereg: `evidence/2026-11-23/sim-rearm-b-prereg.md`
  (commit `ca5f8f987`, rebased to `60f453a9b`)
- Evidence (this file): `evidence/2026-11-23/sim-rearm-b.md`
- Corpora: `evidence/2026-11-21/perseed-rearm-b-ctl/` (16 files),
  `evidence/2026-11-21/perseed-rearm-b-arm/` (16 files)
- Analyses: `evidence/2026-11-23/rearm-b-analysis-ctl.json`,
  `rearm-b-analysis-arm.json`, `rearm-b-pilot-ctl-analysis.json`,
  `rearm-b-pilot-arm-analysis.json`,
  `rearm-b-rearm-compare.json`
- Tallies: `evidence/2026-11-23/rearm-b-tally-ctl.json`,
  `rearm-b-tally-arm.json`
- Panel: `evidence/2026-11-23/rearm-b-panel-before.json.gz`,
  `rearm-b-panel-after.json.gz`, `rearm-b-panel.json`,
  `rearm-b-panel.md`
- Logs: `evidence/2026-11-23/rearm-b-legs-pilot-{arm,ctl}-{1,2}.log`,
  `rearm-b-legs-pilot-arm-2a.log`, `rearm-b-legs-pilot-arm-2b.log`,
  `rearm-b-legs-confirm-{ctl,arm}-{1,2}.log`
- Lever code (in `60f453a9b`): `src/js/corpses.js`
  (`villagerRearmFromCorpse`, witness take, Haven sweep),
  `src/js/game.js` (endDay sweep hook); instrument:
  `scripts/killlootbundle-driver-a.js`,
  `scripts/analyze-killlootbundle-a.js`,
  `scripts/test-rearm-b.js`, `scripts/build-rearm-panels-b.js`

## 13. Blanks filled / documented

- **Filled:** sim-findings line 2717 — a re-arm path for
  searcasters now exists (villager corpse-take, witness +
  Haven-sweep channels, env-gated `REARM_CELLS=1`). The
  findings line should be marked `fixed` on landing (merge);
  this worker does not flip it pre-merge.
- **Documented:** witness channel never fired in 16 seeds (next
  question: wild-corpse expedition); 9/13 supply deaths
  unconverted; s107535 census wrinkle (§10); CELLGATE still
  gates every second-life volley below wave 4.
- **Not built here:** no default flip (env-gated by design); no
  corpse-collapse fix (the 1-cell scholar-path collapse is a
  separate arm); no wild-corpse expedition.
