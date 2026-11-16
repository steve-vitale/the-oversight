# sim-vetreengage-a — Wave-4 re-engagement party lever (second attempt)

**Run:** fleshout-20261116T2115Z (Loop A, adopted 20261116T2215Z), axis scale-onramp / winnability chain.
**Arm:** sim-vetreengage-a. **Prereg:** `evidence/2026-11-16/sim-vetreengage-a-prereg.md` (frozen, commit `a1827c044` after rebase).
**Branch:** `sim-vetreengage-a` (worktree `~/workspace/worktrees/sim-vetreengage-a`).
**Base at arm start:** `7bb50f3dc`. **Base at adoption:** rebased onto current master `63fa44d6c` (clean, no conflicts; lever diff identical after rebase — see §10).
**Lever commit:** `6f5dfaa80` (rebased from `da4e408b4`). **Proof:** `scripts/test-vetreengage-a.js` — **45/45 green** on the rebased tip.
**Analyzer:** `scripts/analyze-vetreengage-a.js` (output saved as `evidence/2026-11-16/vetreengage-a-analysis.json`).
**Panel:** `scripts/build-vetreengage-panels-20261116.js` → `evidence/2026-11-16/vetreengage-a-panel.md` (+ `.json`, `.json.gz` pair).
**Corpora:** control `evidence/2026-11-16/perseed-vetreengage-a-control/` (8 seeds, committed `22a27cfd7`);
armed `evidence/2026-11-16/perseed-vetreengage-a-on/` (8 seeds, this adoption — 5 pre-cancellation + 3 completed here).
**Seeds:** 102601–102608, 150d, competent verbatim, death-aware. **Instrument errors: 0 on all 16 files.**

## Verdict: PILOT GO (frozen bars pass — but read §8: the trio never fired)

| Frozen bar (prereg) | Control | Armed | Pass |
|---|---|---|---|
| 1. Mean vet5@end among unlocked, armed ≥ 1.0 AND ≥ 1.5× control | 0.0 (0/4 unlocked) | **1.4** (7/5 unlocked) | **YES** — ratio vacuous (control 0, see §9) |
| 2. Survival guardrail: survived/8 armed ≥ survived/8 control − 1 | 5/8 | 5/8 | **YES** |
| 3. Starvation watch (reported, not judged): armed ≤ control + 2 | 4 | 5 | YES (no caveat) |

The judge is the frozen bar, and the bar passes. The mechanism that passed it is **not** the mechanism the prereg hypothesized: the trio launch and the gate-counting pieces never fired once (§8). The gain came through the seed call plus pair launches — more plans, more seek contacts, fewer wild scholar deaths, more conversions. A pilot GO spends a fresh confirm band (not run here — that is the next run's job, on a fresh band verified at that time). The confirm is load-bearing: it must re-test whether the vet5@end gain replicates, and whether trios ever fire there.

**Lever disposition: KEPT on the branch** (pilot GO per prereg). Env-gated, default OFF (`VETREENGAGE=1` required; `VETREENGAGE` appears 3× in `game.js`, 11× in `win-plan.js`, 6× in `villager-brain.js`, every touch point guarded; off-mode units in the 45/45 proof). Ready to merge; the ship loop owns deploy.

## §1 Per-seed table (both legs)

vet5 = living wave-4+ killers. Unlocked = wave 5 unlocked (vetattrition T-class derivation).
W4 kills split field (via ≠ player) / TB (via = player). WS = wild scholar deaths (all deaths sweep).
Starv = starvation/thirst/dehydration deaths (all deaths sweep).

| Seed | Leg | Days | End | Unlocked (day) | vet5@unlock | vet5@end | W4 kills F/TB | Conv. | Exits (class) | WS | Starv |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 102601 | control | 150 | survived | yes (127) | 2 | 0 | 5 (2/3) | — | 3 (WILD 3) | 7 | 0 |
| 102601 | **on** | 150 | survived | yes (62) | 2 | 0 | 6 (1/5) | — | 2 (WILD 2) | 2 | 0 |
| 102602 | control | 150 | survived | no | — | 0* | 1 (0/1) | — | 1 (WILD 1) | 2 | 0 |
| 102602 | **on** | 150 | survived | yes (122) | 2 | **4** | 7 (6/1) | — | 1 (dehydration 1) | 1 | 2 |
| 102603 | control | 149 | village-lost | yes (75) | 2 | 0 | 4 (3/1) | — | 3 (WILD 2, sickness 1) | 9 | 2 |
| 102603 | **on** | 108 | village-lost | no | — | 1* | 3 (0/3) | — | 1 (WILD 1) | 4 | 0 |
| 102604 | control | 107 | village-lost | no | — | 0* | 0 (0/0) | — | 0 | 1 | 1 |
| 102604 | **on** | 88 | village-lost | no | — | 0* | 1 (0/1) | — | 1 (ARENA 1) | 6 | 1 |
| 102605 | control | 124 | village-lost | yes (102) | 2 | 0 | 2 (1/1) | — | 2 (WILD 2) | 12 | 0 |
| 102605 | **on** | 128 | village-lost | yes (111) | 2 | 1 | 3 (2/1) | — | 2 (W5-FIGHT 1, WILD 1) | 9 | 0 |
| 102606 | control | 150 | survived | yes (115) | 2 | 0 | 5 (2/3) | — | 3 (WILD 1, starvation 1, MONSTER-UNKNOWN 1) | 6 | 1 |
| 102606 | **on** | 150 | survived | yes (114) | 2 | 0 | 2 (1/1) | — | 2 (W3-LOWER-FIGHT 1, ARENA 1) | 1 | 1 |
| 102607 | control | 150 | survived | no | — | 0* | 5 (2/3) | — | 3 (WILD 1, ARENA 1, W5-FIGHT 1) | 9 | 0 |
| 102607 | **on** | 150 | survived | yes (132) | 2 | **2** | 7 (4/3) | — | 2 (WILD 2) | 8 | 0 |
| 102608 | control | 150 | survived | no | — | 1* | 4 (1/3) | — | 2 (CONTEST 1, WILD 1) | 6 | 0 |
| 102608 | **on** | 150 | survived | no | — | 0* | 3 (1/2) | — | 2 (MONSTER-UNKNOWN 1, WILD 1) | 5 | 1 |

\* vet5@end on a non-unlocked seed is not in the judged mean (frozen definition: among unlocked only).

**Pooled judged numbers:** control mean vet5@end among unlocked **0.0** (4 unlocked, distribution 0/4);
armed **1.4** (5 unlocked, distribution 0:2, 1:1, 2:1, 4:1). Survival 5/8 both legs.
Median survival: control 150.5d, armed 151d. Wave-4 kills: control 26 (F11/TB15), armed 32 (F15/TB17).
Conversions wave-3 → wave-4 killer: control 8 of 51 wave-3 killers (15.7%), armed 15 of 62 (24.2%).
Veteran exits: control 17 (WILD 11, sickness 1, starvation 1, MONSTER-UNKNOWN-WAVE 1, ARENA 1, W5-FIGHT 1, CONTEST 1);
armed 13 (WILD 7, dehydration 1, ARENA 2, W5-FIGHT 1, W3-LOWER-FIGHT 1, MONSTER-UNKNOWN-WAVE 1).
Wild scholar deaths: control 52, armed 36. Starvation deaths: control 4, armed 5.

**Wall numbers:** control national 4/8, table 0, wins 0, wave-4 reached 8/8, wave-5 unlocked 4/8;
armed national 5/8, table 0, wins 0, wave-4 reached 8/8, wave-5 unlocked 5/8.
(The wall has not moved: no table, no wins on either leg; national is up one village on the armed leg.)

## §2 Mechanism decomposition (seeds → launches → gates → encounters → kills → re-meetings)

| Link | Control | Armed | Reading |
|---|---|---|---|
| v4seed rows (all waves) | 88 | 197 | New game.js seed call fired: wave-4 `fled` rows 2 → 32. Wave-4 `evaded` rows 12 → 26 are knock-on (pre-existing agency call sites, not env-gated — more parties out means more evades). Seed rows with target null: 61/88 → 107/197 (the seedattach gap persists: most seeds land on plans not aimed at the fled type). |
| v4departs rows (brain source, both legs) | 125 | 353 | All departs come through the dawn brain mirror; the `winPlanDepart` fallback never fires for wave-4 plans on either leg. |
| Launches (result=launch) | 120 | 199 | Launches by size: control 2:120, 3:0; armed 2:199, 3:**0**, 1:0 (size-1 rows are holds, not launches). |
| Wave-4-target launches | 1 (size 2) | 19 (all size 2) | The lever's launch link works at pair size: 1 → 19. **Zero trios.** |
| Launched parties incl. a living wave-3 killer | 47 | 112 | Pairs increasingly carry a killer. |
| Gate rows (wave-4) | 63 | 92 | SEEK 0 → 2; avoid:outmatched 49 → 48; trick-holds 12 → 38. **countedRows (co-tasked members counted) 0 → 0.** |
| Wave-4 encounters (fieldFight rows) | 166 | 148 | Kills 8 → 10; flees 110 → 89; deaths 22 → 13. Fewer encounters, more kills, fewer deaths. |
| Launched-party wave-4 kills (seedland-b bar; 10-day heuristic — fighter launched or an ally was a launched companion) | 2/8 kills | 3/10 kills | Barely moved: control 102606 days 113/114; armed 102602 day 140, 102605 day 127, 102606 day 114. |
| winPlanStats planSeeds | 25 | 53 | Seed call roughly doubles plan seeding. |
| winPlanStats seekContacts / standingContacts / stageAdvances | 3 / 1 / 45 | 22 / 8 / 70 | Plans turn into contacts and stage movement far more often armed. |
| winPlanStats partyTrios / partyDissolved | — / — (counters absent: lever off) | **0 / 14** (1–3 per seed) | Trio counter never moves; dissolution fires (a member died → party cleared, stage back to `party`). |

## §3 Party-composition table (launched parties)

No launched party of 3 exists on either leg, so there is no trio-composition table to fill — that is itself the finding.
Wave-4-target launches, armed (19, all pairs): every recorded candidate carries `companion2: None`.
The pair is usually holder + one armed companion; 112/199 armed launches overall include a living wave-3 killer
(vs 47/120 control). The second-companion pick (`winPlanSecondCompanion`) requires `plan.needWave ≥ 4` plus a
Haven-idle villager (alive, trust ≥ 15, not engaged/away/on-expedition, not sick, range ≥ 1). It returned null at
every recorded dawn. Two candidate causes: (a) the Haven-idle pool is empty at dawn (companionpool-b's prior:
eligible pool empty on 161/196 scored dawns — the pool, not the pick, is the binding constraint); (b) the
`needWave` gate misfires at candidate time. The recorder cannot distinguish them — it logs the candidate, not
the pick attempt. Next arm needs a pick-attempt row (accepted/rejected + reason). See §9.

## §4 The village, in plain words

**Seed 102602 is the whole story, armed.** Vasyl Shevchenko, the scholar, faced a reunion and fled — the seed call
made a plan of it. From day 133 he went out after the reunion again and again, always with a companion (Liam Davis,
then Zoe Adams), always as a pair. On day 131 Liam killed a herald with two allies beside him, calling for help;
on day 140 Vasyl killed a suburb with Zoe beside him, calling for help — a pair that set out after a reunion and
killed a suburb instead, a wave-4 beast met on the road rather than the beast they named. By unlock day 122 the
village held 2 living veterans; it ended with 4 — the only seed on either leg to end above 2. The village survived
all 150 days, national by standing, and lost only one veteran all run (Christian Mensah, dehydration day 123).

**Seed 102607, armed, is the quieter version:** 7 wave-4 kills (4 field), 2 living veterans at end, survived 150 days,
unlocked day 132. Two veterans died in the wild (Leah Black day 60, Ella Xie day 101) and the village still ended
with 2 — inflow finally outran the bleed on this seed.

**The holder-died pattern from 1515Z does not reproduce in the same form.** In seedland-b, all 3 launched parties
ended with the holder dying at home and 0 re-meetings. Here, launched holders mostly lived — Vasyl launched three
times after the reunion and lived to kill — and launched parties did re-meet wave-4 beasts (3 launched-party kills
armed). But the premise changed: the launches here are pairs, not trios, and the kills are of *a* wave-4 beast,
not the targeted one. The re-meeting gap is narrowed, not closed: 3/10 kills by launched parties vs 2/8 control.

**Who died and why.** The bleed is still the wild: armed WILD exits 7 (control 11), and wild scholar deaths 52 → 36.
Control's unlocked seeds all bled to exactly 0 living veterans by end (vet5@unlock was 2 on every unlocked seed,
vet5@end 0 on all four — the gate opens with zero slack and the bleed eats it). Armed, two unlocked seeds held on
(102602: 4, 102607: 2) and one held one (102605: 1). The counter-example is **102604 armed: lost day 88**
(control lost day 107) with 6 wild scholar deaths (control 1) — the lever is not uniformly good; on that seed the
extra launching put more scholars in the wild to die. Starvation is flat (4 → 5); no seed starved because of the lever.

## §5 Reachability verdict

Wave 4 reached 8/8 both legs; wave 5 unlocked 4/8 control, 5/8 armed. National reached 4/8 → 5/8 (analyzer wall
count). Table 0/8 both legs, wins 0/8 both legs. The content past national is still decoration in sims: nothing
reaches the table on either leg, and the win flag never fires. The lever moves the veteran bar that gates wave 5;
it does not move the table.

## §6 Sense-testing (SENSE-TESTING LAW)

**Wave-4 fights read like fights.** Control, seed 102601 day 104, Nadia Khoury vs herald (kill, 3 rounds):
"Nadia sees it — The Herald is broken and close enough to finish. They hold the line to end it. (Committed finish,
met-below-break)"; "Nadia closes in and strikes with the hatchet for 19 (53 left)". Control, seed 102601 day 127,
Vasyl Shevchenko vs algorithm (kill, 8 rounds): "Vasyl had strung a wire at ankle height before it closed — the
first rush will eat dirt. (Tripwire)"; "Vasyl stands there and takes it soft — deliberately. (Tanking the
prediction.)" Armed, seed 102602 day 131, Liam Davis vs herald (kill, 11 rounds, calledHelp): "Liam sees The
Herald coming and nocks an arrow — the fight opens at range (2 shots)"; "loosed — it takes The Herald for 17
(508 left)." Armed, seed 102602 day 140, Vasyl Shevchenko vs suburb (kill, 5 rounds, calledHelp): "Vasyl drove
at The Ugly Beast with the sharpened stick — it staggers, holds its ground, and keeps coming. (Committed)".
Armed, seed 102605 day 109, Boris Kowalski vs herald (kill, 4 rounds): "Boris holds — The Herald is two blows
from falling, and they are still strong enough to finish it. (Committed finish, two-blow)". Flee example, armed,
seed 102601 day 37, Chen Wei vs reunion: "Wei walks straight into The Reunion. No avoiding it."; "Wei lowers the
bow — The Reunion is on them now. (2/2 hit)".

**The party does not read like a party.** The lines name only the fighter; allies are present (alliesN = 2 on the
armed kills) but never named, and nothing in the narration says the pair set out together, went back after the
same beast, or named the beast they were hunting. The day-140 kill is the clearest case: the pair launched that
day after a reunion and killed a suburb — the recorder proves they travelled together; the narration does not say so.

**The village says nothing when a veteran dies — reproduced.** 30 veteran exits checked across both legs
(17 control, 13 armed); 28 vetSays lines fall within ±2 days of a veteran death (225 control lines total, 210
armed); **0 of them mention the death.** The two keyword hits are false positives (a producers-naming broadcast
line, "The producers name it: the Nielsen…", containing no death content). The DIAG's silence (0 death lines in
1223 T vetSays lines) stands on both legs, lever on or off.

## §7 Drift check + balanced panel (§15)

**Drift check:** `scripts/vetparty-drift-check.js` over both corpora — **NO PRE-LEVER DRIFT on all 8 seeds**
(first divergence day ≥ first lever-action day on every seed, including 102606–102608 which ran on the rebased
tip). The rebase did not move any trajectory before the lever could act.

**Balanced panel:** `scripts/balance-panel.js` compare, `evidence/2026-11-16/vetreengage-a-panel.md` —
decision **review_required**, driven by a `regression_watch` on village deaths: paired delta +0.125 deaths/run
(95% exploratory interval −15.4 to +17.3) and +3.66 deaths/100 days (−7.2 to +14.7). Both intervals span zero
widely; the delta is ~0 on 8 paired cases. Table win rate 0 → 0, national scale access 0 → 0, community loss
0.375 → 0.375. The panel is the instrument, the frozen bars are the judge: the screen flag is noted, the verdict
stands on the prereg bars.

## §8 What the lever did and did not do (mechanism verdict)

What fired: the seed call (wave-4 `fled` seeds 2 → 32), pair launches on wave-4 targets (1 → 19), plan seeding
(25 → 53), seek/standing contacts (3/1 → 22/8), dissolution on member death (14 fires). What never fired:
**trio launches (0/19 wave-4-target launches; partyTrios 0 on all 8 armed seeds; companion2 None on every recorded
candidate)** and **gate counting of co-tasked members (countedRows 0/92 gate rows)**. The two SEEKs armed (vs 0
control) came from sensed parties, not counted ones — the gate still judges the earshot snapshot.

So the frozen-bar GO is carried by the seed call + pair-launch path, not by the trio/gate-count shape the prereg
hypothesized. The gain decomposes as durability plus inflow: wild scholar deaths 52 → 36 and WILD exits 11 → 7
(durability — villagers travel in pairs instead of solo, and the scholar dies less in the wild), field wave-4 kills
11 → 15 and conversions 8 → 15 (inflow — more wave-3 killers convert). Neither alone explains the mean: the
vet5@end=4 seed (102602) has both (6 field kills, 1 wild scholar death).

## §9 Metric review (§14)

1. **The ratio bar was vacuous on this band.** Control mean vet5@end among unlocked came in at 0.0 (the DIAG's
   cross-corpus baseline was 0.59; this band's control bled to 0 on all four unlocked seeds). 1.5× of 0 is 0, so
   bar 1 was decided by the absolute floor alone (armed 1.4 ≥ 1.0). The bar as written still passes, and the
   verdict is not re-scored — but the confirm should be judged with the same bars on a fresh band, and if its
   control also reads 0, the ratio half of bar 1 is again doing no work. A future prereg may want a floor-only bar
   or a control-mean floor before the ratio applies; that revision is for the NEXT run, not this one.
2. **The metric moved through a different link than the one pre-registered as the mechanism.** The prereg's
   metric-review section anticipated exactly this fork ("if the lever's seed fires but vet5@end does not move,
   say which link failed") — the seed fired, vet5@end moved, and the failed link is launches at size 3 (0) and
   gate counting (0 rows). The judge (vet5@end + survival) does not distinguish *which* link moved it, so the GO
   stands; but the trio hypothesis itself is untested, not confirmed. The confirm must not be read as confirming
   trios.
3. **Base-mix sensitivity (rebase confound, checked).** Control ran on base `7bb50f3dc`; armed seeds 102601–102605
   ran on the same base + lever, seeds 102606–102608 ran on rebased master `63fa44d6c` + lever (the rebase touched
   only conversation/convo-dialogue/convo-scene code). Drift check is clean on all 8 seeds, and the headline is
   not a new-base artifact: armed unlocked seeds on the OLD base alone (102601: 0, 102602: 4, 102605: 1) mean 1.67,
   still ≥ 1.0. The new-base seeds contribute 102607's 2 and 102606's 0.
4. **Recorder gap to fix before the confirm:** no row records a second-companion pick attempt (accepted/rejected +
   reason), so the trio failure cannot be attributed to pool-empty vs needWave-gate. The confirm driver should add
   it, plus a dawn pool-availability count (Haven-idle, trust ≥ 15, not engaged/away/sick).
5. **Panel screen flag:** village-deaths `regression_watch` is a ~0 delta with a wide interval spanning zero (§7);
   not a verdict, noted for the confirm to watch.

## §10 Adoption notes (this run)

- **Rebase:** branch base `7bb50f3dc` → master `63fa44d6c` (8 commits; only src changes are
  conversation.js / convo-dialogue.js / convo-scene.js — dialogue/narration). Rebase clean, no conflicts.
  Proof re-run green after rebase (45/45). Drift check clean (§7).
- **Lever-deletion re-verification (against the rebased lever commit `6f5dfaa80`):** 52 src deletions, every one
  accounted for — 34 reappear verbatim as the hoisted `companionLaunchable` fn; 12 are reworded comment lines
  (the launchability comment block, condensed into the hoisted fn's own comments); 6 are code lines restructured
  into the trio shape (`out.push({` / `});` → `var cand = {...}; out.push(cand);` in winPlanCands, plus the
  four `plan.party` assignments in the brain mirror and `winPlanDepart` now carrying the launched set).
  Note: the original commit message's split ("14 reworded comment lines + 4 intended party-of-3 behavior changes")
  miscounts by two — the true split is 12 comments + 6 code lines (the `out.push` restructure pair + 4 trio sites).
  Substance verified: the lever diff is identical after the rebase, no logic was silently dropped, no stale-tree
  revert. Files touched by the lever: `src/js/game.js` (+17), `src/js/villager-brain.js` (49 lines changed),
  `src/js/win-plan.js` (+268/−52).
- **Stale-lock recovery:** none needed (adoption run; the 2015Z worker was cancelled, no lock held).
- **Write flap:** no EPERM encountered in this adoption (writes worked throughout).

## §11 Convergence state (scale-onramp)

**Converging, not converged.** Pilot GO on the veteran bar (mean vet5@end among unlocked 0.0 → 1.4, survival held),
but via the seed+pair path with the trio untested, and the wall numbers barely moved (national 4 → 5, table 0,
wins 0). Next: confirm on a fresh band under the same frozen bars, with the pick-attempt recorder from §9.4.
If the confirm reproduces the gain, the lever's seed-call core is real even though its trio shape is not; if it
does not, the pilot GO reads as a small-n (5 unlocked) fluctuation on a vacuous ratio bar.
