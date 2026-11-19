# Loop B 1530Z winnability round — adoption closeout

**Run:** fleshout-loop-b-20261119T1530Z · **Axis:** winnability chain · **Round:** 2 arms, both finished by the run; the run timed out at closeout, this adoption lands the remainder.
**Master:** arm 1 merged `4c608577a`; arm 2 merged `66cd463e6` (adoption, ff-only). Round evidence: this file.
**Claim:** `fleshout-loop-b-20261119T1530Z.json` — retired (.DEAD). **Lock:** `fleshout-loop-b.lock` — deleted at closeout.

## Arm 1 — sim-launchfunnel-b: GO (survey)

**Designated band: seeds 106081–106088** — 17 wave-4+ launches, 9 quad launches, 4 joined quad meetings per 8 seeds. Survey of 4 fresh bands, 32 seeds, 0 `unknown`, proof test 29/29.
**Evidence:** `evidence/2026-11-19/sim-launchfunnel-b.md` (+ prereg, survey JSON, 32 per-seed corpora). Commit `4c608577a` (+ instrument `9f0937a12`, prereg `2b1ba41ac`).

Reconciled numbers (the worker's timeout report said "42 launches / 27 quads" while the commit message said "17 launches, 9 quads" — both are correct, different scopes):
- **Survey total (32 seeds): 42 launches / 27 quads / 2 launched kills.**
- **Designated band (106081–106088, 8 seeds): 17 launches / 9 quads / 0 launched kills.**
- The 2 launched kills are on other bands: seed 106055 (yuki_mori → eater, quad, companion's finishing blow d126) and seed 106065 (valeria_quispe → herald, quad, same-day 220-damage kill). Both gate-silent.
- Launch richness is lumpy: on the designated band, 15 of 17 launches come from two seeds (106083: 10, 106084: 5); four seeds never launch. Band 3 (106071–106078) is the negative control: 1 launch on 8 seeds.
- Binding stage reproduces, tied: candidate-not-bid 7/21 and plan-churned-before-dawn 7/21 on the best band. Pool still thin: 81% of scored dawns with 0 eligible companions.
- Every launch in the survey was a trio or a quad — no pairs anywhere (PARTYSIZE4 substrate).

## Arm 2 — sim-laterage-b: NO-GO, kind METRIC-BROKEN

**1 observable Rage fight** (floor 8) in 127 wave-4+ encounters across 8 seeds (106111–106118), 150d, competent verbatim. Taxonomy complete on n=1 (0 unclassified, 0 anomalies; analyzer selftest 16/16; proof test 11/11, re-run green by the adoption on the merged tip's parent).
**Evidence:** `evidence/2026-11-19/sim-laterage-b.md` (+ prereg, analysis JSON, 8 per-seed corpora, driver/analyzer/test scripts). Commit `66cd463e6`. Evidence + instrument only; no game-code change.

The one fight, seed 106113 d76: Diana Osei vs the Eater, fires Rage R1 on a 35-HP holder, spends her one remaining round on field medicine, flees at 2 HP, monster untouched at 989/989 — 0 of 3 doubled strikes landed. The bottleneck is holder scarcity, not the firing gate: 3 holder-fights in 127 encounters, all on one seed, 2 evade before contact. The late-fire question (#2606) is still unanswered and pool-blocked; the next run needs a holder-rich population (survey by `holdsRage` rate or staged holder fights under the encounter-gear rule), not another fresh band. Foregone-damage estimate has no basis here — reported as missing, not zero.

## Scale-wall numbers (both arms)

| Leg | Wins | National | Table | Wave 5 | Wave 4 | Standing ≥200 | Median survival | Survived 150d |
|---|---|---|---|---|---|---|---|---|
| Launchfunnel survey (32 seeds) | 0/32 | 0/32 | 0/32 | 9/32 | 31/32 | 9/32 | — | 19/32 |
| — designated band 106081–106088 | 0/8 | 0/8 | 0/8 | 4/8 | 8/8 | 4/8 | 143d | 4/8 |
| Laterage (8 seeds) | 0/8 | 0/8 | — | 2/8 | 7/8 | 0/8 | 137d | 3/8 |

Deaths are heavy everywhere (launchfunnel survey: 2,718 across 32 seeds; starvation 11 — villages die fighting, not hungry). Standing-199 stall recurs on the laterage band (5/8 seeds at exactly 199). The wall stands where the 1230Z round left it: launches can now be found (a designated band exists for the re-runs), but launched parties still usually cannot hurt a wave-4 monster, and nothing reaches national or the table.

## Village assessment, in plain words

The survey found the launches the earlier diagnostics were starving for — and found them concentrated in a couple of villages that keep launching while the rest of the band stays quiet. The launches are real: parties of three and four walk out, meet the monster they named, and fight for real — eleven rounds, three hundred damage, a companion stepping in to finish the kill. Two of them actually killed their target, the first launched kills this instrument has ever recorded. But the kills are the exception. On the best band the launched parties fought and fled, never met, or dealt no damage at all across four meetings and lost their leader. Launching is solved enough to measure; hurting wave-4 monsters is not.

The Rage arm found the opposite shape of scarcity: the villages fight wave-4 monsters constantly — 127 encounters in eight villages — and almost never with a Rage holder in the fight. The one holder who reaches a fight walks into it nearly dead, fires Rage on the first round, spends her one remaining round bandaging herself instead of hitting, and runs while the monster stands untouched. The question the arm asked — how often does Rage fire late, and what does the wait cost — can't be answered from live play on this ground, because the thing it measures barely ever happens. That's a fact about the game as it plays today, not a failure of the instrument.

## Gate

Gate (on the merged tip `66cd463e6`, full log `evidence/2026-11-19/check-quick-round-1530.log`): **339 passed, 5 failed in 1039s, 0 attributable** — measurement-proof staleness pair + phone-frame stale receipt (pre-existing) + two 120s timeouts (living-garden + one-person-army deed-attainment, solo-verified green this run, exit 0 each). This run changed zero `src/js`. First gate attempt killed at ~502s by a VM replacement (~17:42Z); re-run from scratch on the merged tip.

## Telemetry

Laterage leg: `telemetry-check.js` refused recorder corpora verbatim ("all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs"). Same refusal as fightcap-b / dmgshape-b / ragepreempt-b. Launchfunnel survey: recorder corpora of the same class; no deviation recorded. No LOUD lines; baseline NOT rolled (anchorCommit mismatch still uninvestigated).

## Findings filed

- #2604 ANSWERED (launchfunnel-b): quad-launch rate 0.84/seed across 32 seeds; designated band 106081–106088.
- #2606 updated (laterage-b): no late-fire sighting; pool-blocked, still open.
- #2613 (late-Rage taxonomy instrument-ready, pool-blocked).
- #2614 (Rage holders almost never reach wave-4 fights — holder scarcity, not the firing gate).
- #2615 (standing-199 stall recurs on the laterage band, 5/8 at exactly 199).

## Next blanks, in order

1. Re-run dmgshape-b / partysurvive-b on the designated band 106081–106088 (full band, per-seed launches reported) — the survey exists precisely for this.
2. The damage question underneath (#2605): what lifts a launched party toward ~111/round — base-rate ceiling as the named mechanism. The re-runs should carry a damage-per-launched-meeting number, not just a kill count.
3. Late-Rage-fire cost (#2606): needs a holder-rich population first — survey by `holdsRage` rate or staged holder fights under the encounter-gear rule.
4. Bowcraft confirm leg on fresh band 107011–107018 (Loop A 1415Z, owed before any BOWCRAFT turn-on decision) — sibling loop's item, not this round's.

## Infrastructure notes

- Host write-denial flap ~15:36–16:29Z during the run (registry write failures, safe-commit index clobbers on the arm worktrees; both repaired, no data loss; cleared by ~16:29Z). Launchfunnel's own evidence documents a flap ~15:51–16:10Z during instrument build (a failed python patch truncated the draft proof test to 0 bytes; rewritten whole and verified).
- The run timed out at closeout with arm 2's evidence complete but unmerged; adoption verified the branch tip, re-ran the proof test (11/11), merged ff-only, ran the gate solo, and closed out. No work was redone; nothing was lost.
- VM replacement ~17:42Z killed the adoption's first gate run at ~502s (SIGTERM, log lost — it lived in /tmp); gate re-run from scratch on the merged tip. `uptime` is the tell.
- Sibling Loop A 1415Z adoption was landing concurrently (master moved 1404e2e9a → 4c608577a → 66cd463e6 across the round); no conflicts, no interference.
- Master moved again during the adoption (endgame r249 landed `af7fddfc4`); the round-evidence commit lands on that tip. The gate above was run on `66cd463e6`, the tip containing both arms; this round changed zero `src/js`, so the gate stands for the arms' content.

## Files

- Arm 1: `evidence/2026-11-19/sim-launchfunnel-b.md`, `sim-launchfunnel-b-prereg.md`, `launchfunnel-b-survey.json`, `perseed-launchfunnel-b-*/` (master `4c608577a`).
- Arm 2: `evidence/2026-11-19/sim-laterage-b.md`, `sim-laterage-b-prereg.md`, `laterage-b-analysis.json`, `perseed-laterage-b/` (master `66cd463e6`).
- Round evidence: this file.
