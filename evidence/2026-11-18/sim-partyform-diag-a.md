# sim-partyform-diag-a — finding #2547: why a party-stage plan finds no companion in 35 days

- Arm: `sim-partyform-diag-a` (Loop A, run fleshout-20261118T2015Z, axis scale-onramp)
- Prereg: `evidence/2026-11-18/sim-partyform-diag-a-prereg.md`, committed `b35dd9966` (frozen)
- Verdict: **DIAG GO** — the mechanism is identified with counts, reproduced on ≥1 seed (in fact four distinct shapes across 9 seeds). No game-code change lands from this arm. No balanced panel (pure diag, per prereg).
- Driver: `scripts/partyform-diag-driver.js` (proof test `scripts/test-partyform-diag-a.js`, ALL PASS, no skips)
- Corpora: `evidence/2026-11-18/perseed-partyform-diag-a/partyform-a-s<seed>-partyform-a-arm.json` (seeds 104601–104608 + 104708)
- Substrate (all runs): competent policy verbatim, 150d, `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 WILDAVOID=1 WILDSEEDPLAN=1`. The seedplan fix was staged in the worktree as a DIAGNOSTIC-ONLY harness (branch `sim-wildavoid-seedplan-b`, tip `5a4700a4c`, two env-gated call sites) and **reverted before commit** — the committed tree carries no `src/js` change. The seedplan fix itself stays HELD on that branch, untouched.

## Correction to the 1515Z reading

`dawnbidCensus` is an end-of-day **plan-existence** census, not a bid record. "Bid at dawn for 35 straight days" is unproven — what the corpus proves is that Yuki Mori's plan **existed** 35 days and was **never scored once** (0 `vbrainScorePick` rows for her). The stall is worse than a failed bid: the plan never reaches the bidding machinery at all.

## Reproduction (pilot band 104601–104608, deliberate reuse per prereg)

| seed | outcome | holders |
|---|---|---|
| 104601 | village lost d100 | desmond_clarke 6d (shape B), naran_tumen 5d (shape C) |
| 104602 | survived | ursula_weber (shape C), farid_ahmed (shape C) |
| 104603 | village lost d111 | no holders |
| 104604 | village lost d64 | katarina_novak 9d (shape B) |
| 104605 | village lost d65 | no holders |
| 104606 | survived | **david_kim 97d (shape C, exact reproduction)** |
| 104607 | survived | **yuki_mori 35d (shape A, exact reproduction)** |
| 104608 | village lost d126 | — |
| 104708 (confirm band) | survived | oliver_moore 43d (shape D), dmitri_sokolov 50d (shape B), valeria_quispe 32d, gen_ojb9nsm 18d |

Yuki reproduces exactly: 35 holder-days d106–140, matching the committed seedplan-b corpus. david_kim reproduces exactly: 97 holder-days. (104601 and 104603 diverge from the seedplan-b corpus on survival — the tree is a later master than the seedplan-b base — but the holder shapes reproduce wherever holders exist.)

## The answer: four shapes, one family

Party formation fails at **four different gates**, and the plan system checks none of them when it seeds or stages a plan. A plan can sit for weeks against a gate that can never open. Trust is **not** a binding filter anywhere: `trustLow` is 0 on every pilot-band holder-day.

### Shape A — the leaver (Yuki Mori, seed 104607, the named case)

- 35/35 days: away `{purpose:'leave', sinceDay:1, duration:999}`; objective `LEAVE/out`, partsLeft 578→442; node (0,4) on 23/35 days, never Haven (4,4); profile forager, range 1.
- **0 `objPick`, 0 `vbrainScorePick`, 0 `winPlanDepart`, 0 `winPlanHavenTick` calls on all 35 days.** The only plan calls are `winPlanSeedFromFight` (4 calls, d106–107 — the seed fires twice per flee; see §Secondary).
- Mechanism: `objTick`'s dawn re-pick requires `!away`; `agencyTick` skips non-Haven villagers; `winPlanHavenTick` returns null off-Haven. The plan machinery never sees a villager who is away.
- Root: `winPlanSeedFromFight` seeds plans onto **any** villager who flees/avoids a wave-3+ beast — including one who left the village on day 1. The seed never checks whether the holder is actually in the village.
- The pool is **not** the binding constraint for Yuki: eligible ≥1 on 28/35 days. Secondary block: `hurt-no-medicine-no-healer` on 35/35 days (health 54→13) — even if she were scored, the launch would be held on her wounds.
- The task brief's "holder … at Haven" was wrong: `holderExped=false` ≠ at Haven. She was never at Haven.

### Shape B — scored, pool empty (ranger-gated)

- desmond_clarke (104601): 6d, 4 score calls, eligible 0/6, `notRanger` 25 first-fails.
- katarina_novak (104604): 9d, 4 score calls, eligible 0/9, `notRanger` 19, `away` 25.
- dmitri_sokolov (104708): 50d, 41 score calls, 40 `party_wait` acts, eligible 0/50.
- Mechanism: `findCompanion` requires profile wanderer/explorer. The village's trusted, present, armed villagers are foragers and homebodies — the pool is ranger-gated, and the holder keeps being scored against an empty pool. The holder is willing and the plan is live; the companion **definition** excludes everyone who is actually there.

### Shape C — scored, companion found, holder range-0 (cannot depart)

- david_kim (104606): 97d, 91 score calls, 15 `party_launch` score actions, 32 `vbrainExecuteDepart` calls, **all 32 returning `hold`**, block `range-0` on 97/97 days. Profile homebody → `npcMaxDist` 0. (Committed seedplan-b corpus depart rows agree: `vidBlock:'range-0'` on every attempt.)
- naran_tumen (104601): 5d, 3 launches, 6 holds, `range-0` 5/5. ursula_weber (104602): 1 launch, 3 holds, `range-0`.
- Mechanism: the plan stages and even launches, but the holder physically cannot depart — homebody range is 0. The plan system never checks the **holder's** range when seeding or staging. (`winPlanDepart` calls are 0 for every holder on every seed because `vbrainOwnsDawn()` is true — agencyTick uses `vbrainExecuteDepart` instead; that path is the live one.)
- Note: david_kim's pool was eligible on 12/97 days — companions existed; the holder himself was the wall.

### Shape D — the scholar-holder (oliver_moore, seed 104708) — ROOT CAUSE CLOSED

- 43 holder-days; 9 score calls, all before d101; 0 from d102 onward. Forage away entry `{sinceDay:101, duration:3}` frozen 25 consecutive days (d101–125), node frozen (3,5), objective `FORAGE/out` partsLeft stuck at 1, party dissolved d102, alive at health 100, died d126 "the wild".
- Decisive probe (temp script, run then deleted): `npcNodeTravel` runs ~4×/day throughout, but `objAwayStep` for Oliver froze at 60 calls after d101 (ran twice that day, never again) and `npcSetNode` froze at 26 — while he was alive, on the roster (confirmed in the committed confirm corpus through d120), not engaged, not titan-committed.
- Root cause: **Oliver became the player character by succession around d100.** Other holders' pool rows read him as `selfOrScholar` from d100 onward (20 rows in the 100s, 14 in the 110s, 6 in the 120s); before that he read as `notRanger`/`away` (an NPC). Every NPC system skips `villagerId` — `npcNodeTravel` (`if (rid === this.villagerId) continue`), `objTick`, `agencyTick` — so his away entry never processes, never returns, and his node freezes. The sequence fits: he departed on forage as an NPC on d101 (partsLeft 3→1 across two away-steps), succession made him the scholar the same day, and from then on no system touched him as an NPC. His plan persisted (he was alive; cleanup fires only on death), so the census counted a **player character's** plan as a stalled NPC plan for 25 days until he died in the wild.
- This confirms finding #2542 (the plan machinery never runs for the scholar — james_okonkwo / nikos_papadopoulos, same arm) and adds the frozen-away-entry consequence: a scholar-holder's expedition never returns.

## Metric review (prereg bars)

- GO threshold: "a mechanism identified with counts reproduced on ≥1 seed" — **met four times over** (shapes A–D, with Yuki 35d and david_kim 97d exact).
- `dawnbidCensus` is not a bid record (see correction above) — the prereg's "bid-time pool" framing is replaced by per-day call counters + pool replica, which is what the driver actually measures.
- Cross-checks: the committed seedplan-b corpora agree on the named cases (Yuki 35d; david_kim depart rows `range-0`); the confirm band (104708) adds shape D and a second shape-B population.

## Sense test

The fiction contradicts the mechanics for Yuki: she is vividly present in village talk through d133 — teaching at the fire, telling stories, bringing food home, arguing the watch rotation, cured by Jesse on d112 (343 Yuki say-lines in the diag output) — while the plan system treats her as gone since day 1. Ambient/fire lines do not check away/node. "Going back for help" fires 4× (d106–107) while help never comes. A player watching the fire would swear she is in the village; the plan census says she left on day 1. Both are true in the code, and that is the defect's shape: the seed path and the talk path disagree about who is here.

## Secondary observations

- **Double seed per flee:** `winPlanSeedFromFight` fires twice per flee (Yuki: 4 calls across the d106–107 meetings; duplicate rows in both corpora). Two routers call it for one flee. Harmless (idempotent retarget) but worth one line in a fix pass.
- **Confirm-band cross-check:** brian_otieno (104709) was scored 27× with no win-plan candidate at all (standing/table stage + no companion, or gear stage with gear, yields no candidate) — the plan system can score a villager for weeks and never offer a plan. Separate from the four shapes; noted, not chased.
- **1715Z "one villager loops on the Reunion 7× in a week":** consistent with holders churning through short away trips plus shape-D stalls (104708: valeria_quispe Reunion 32d, 5 launches, party nonempty 29; gen_ojb9nsm Reunion 18d; oliver_moore Reunion 43d, 9 score calls), not with a single leaver.
- **Scratch loss:** `/tmp/pfdiag` (intermediate analysis scratch) vanished between turns; all committed evidence lives in `evidence/2026-11-18/perseed-partyform-diag-a/` and is intact.

## Proof test

`scripts/test-partyform-diag-a.js` — ALL PASS, no skips (re-run on the reverted tree, pure master + this arm's scripts):
- §1 `poolReplica` matches an independent first-fail re-implementation (counts sum to rosterN; away/trustLow/notAtHaven/notRanger cases).
- §2 `deriveLaunchBlock` (`range-0` for homebody; `hurt-no-medicine-no-healer` when hurt with no medicine/healer; null for a healthy ranger).
- §3 `planIsWave4` truth table.
- §4 live dawn gate: an away holder gets 0 `vbrainScorePick` calls and a null `winPlanHavenTick`; the same holder at Haven gets ≥1 score call and the plan returned.

## Findings appended (coordinator's `sim-findings.md`)

- #2560 — shape A, the leaver (answers #2547's named case).
- #2561 — shape B, the ranger-gated pool.
- #2562 — shape C, the range-0 holder.
- #2563 — shape D, the scholar-holder frozen away entry (confirms #2542, adds the consequence).

## HELD / not done

- The seedplan fix stays HELD on branch `sim-wildavoid-seedplan-b` (never merged, never touched by this arm). The diagnostic-only staging in this worktree was reverted before commit; the committed tree has zero `src/js` change.
- No gameplay fix lands from this arm (diagnosis only). The natural next arms are design calls, not measurements: (a) seed only onto villagers actually in the village (or re-check holder presence at dawn); (b) widen `findCompanion` beyond ranger profiles or score the holder's range at staging; (c) decide what a scholar-holder's plan should do (#2542's open Steve-call covers the scholar question; the frozen away entry is its concrete cost).
- No balanced panel: pure-diag arm, no game-code change; the reproduction analysis above attaches instead, per prereg.
