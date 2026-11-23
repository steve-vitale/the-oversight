# sim-musterask-a — EVIDENCE (frozen prereg + Amendment 1)

**Arm:** sim-musterask-a · **Loop A run:** fleshout-20261123T2015Z (adoption
finish of the dead 1815Z run's arm; worker cancelled ~20:18Z, inherited
state verified, not taken on trust)
**Axis:** scale-onramp · **Finding:** tracker blank #1 — NAME THE
DAWN-SCORING GAP (the 82 never-scored holder-days from sim-muster-a)
**Type:** DIAGNOSTIC — instrument only, zero `src/js` changes
**Base:** `dbe748d46df6345dea460d4d72876feee932daa6` · **Band:** 107617–107624
(8 seeds, 150d, competent verbatim, layers off)
**Verdict: DIAG-GO** — the gap is named in full: 82/82 holder-days carry a
concrete dawn-state sub-cause, 0 unclassified.

## 0. Adoption note (inherited state, verified)

- Frozen prereg `evidence/2026-11-23/sim-musterask-a-prereg.md`: present,
  unmodified at adoption; Amendment 1 appended during this run (see §7).
- Instrument present and intact: `scripts/musterask-driver-a.js`,
  `scripts/analyze-musterask-a.js`, `scripts/test-musterask-a.js`.
- ONE replay seed existed at adoption
  (`perseed-musterask-a-ctl/musterask-a-s107617-musterask-a-ctl.json`,
  written 20:09Z, anchor `dbe748d46…`, 0 instrument errors). Re-run fresh
  in this run: **byte-identical** to the inherited file (`cmp` clean).
- No evidence `.md` existed; nothing was committed. No inherited file was
  corrupt, missing, or divergent from the prereg.

## 1. The answer in one paragraph

The 82 "never scored, sub-cause unknown" holder-days were never a mystery
about the muster pool. They were a mystery about **what dawn looked like**,
and the old analyzer was reading the wrong day-part: it judged each
holder-day by the state at the END of the day (alive, at Haven, not on
expedition), while the scoring decision is made at DAWN. Read at dawn, all
82 resolve into ordinary life:

- **40 days — the holder WAS the player that day (scholar-at-dawn).**
  Mid-run successions made Otto Herrera the scholar for 33 straight days
  (seed 107624, d81–d113) and Daniyar Askarov for 7 (seed 107623,
  d132–d138). The old check used only the end-of-run scholar, so it missed
  both successions. A scholar has no NPC dawn: `objTick` skips
  `rid === villagerId` before any pick.
- **13 days — away at dawn.** Out on guard, forage, or water at part 0;
  back at Haven by end of day, which is why the end-of-day check said
  "at Haven".
- **9 days — on an agency expedition at dawn.** The agency owns them at
  dawn; `objTick` forces EXPLORE/expedition and continues.
- **14 days — the pick ran but the body answered first (pick-early-return).**
  Hunger (EAT, 12 of the 14) or a knowledge urge (SEEK, 2) fired before
  the line-660 feed, so the holder was never fed to the scorer. Two of
  these also show a mid-day refresh refused on the same-day commit — the
  silence lasted the whole day.
- **3 days — the plan did not exist at dawn (plan-created-after-dawn).**
  Created mid-day by a fight/flee (`world-tick`); first planCensus day is
  the silent day itself.
- **2 days — engaged at dawn.** (End-of-day engagement does NOT block:
  d110 was scored despite engaged:true at end of day — the dawn row is
  what matters.)
- **1 day — objective live all day.** Lena Ruiz, seed 107624 d58: an
  EXPEDITION objective live at dawn and at every part 1–3 entry, so the
  dawn staleness test never fired and no re-pick ever ran.

No day needed a new cause. `holder-not-at-haven-at-dawn` fired 0 times
and `holder-off-roster-at-dawn` fired 0 times — both stayed empty as the
prereg predicted (the node check runs after the dawn re-pick; nobody fell
off the roster).

## 2. Bars (frozen §6 — judged)

| # | Bar | Threshold | Result |
|---|---|---|---|
| 1 | PRIMARY — classification completeness | ≥ 90% named (≤ 8 unclassified on the 82) | **PASS — 82/82 named, 0 unclassified (100%)** |
| 2 | PRIMARY — mechanism proof | Each sub-cause proven by ≥ 1 replay probe (seed/day/vid + code line) | **PASS — §3, one probe per sub-cause, all with dawn rows** |
| 3 | Instrument validity | Proof test green; analyzer selftest green; 0 instrument errors; 0 tick-gate mismatches; scored half reproduces 731/731 | **PASS — test 113/0, selftest 39/0, errors 0, mismatches 0, scored half identical** |
| 4 | Determinism | Replay of 107617 + 107624 reproduces classification summary + launch count (—diff 2/2) | **PASS IN SUBSTANCE, literal --diff 0/2 — see Amendment 1 (§7). Game fields identical on every compared field; the only diff is the new naming itself** |
| 5 | Instrument errors | 0 on all judged corpora | **PASS — 0 on all 8 seeds** |

**Verdict: DIAG-GO.** The dawn-scoring gap is named, proven, and closed
as a diagnostic question. Nothing in the game changes on this arm.

## 3. The 82, named (cause totals on the replay corpus)

813 eligible-0 events total; 731 scored-half (unchanged from muster-a:
`never-asked:holder-not-scored` 592, `pool-empty:away` 78,
`pool-empty:notRanger` 61) + 82 never-scored, now all named:

| Sub-cause | n | Mechanism (code) | Probe (seed/day/vid) |
|---|---|---|---|
| `holder-scholar-at-dawn` (2b) | 40 | `objTick` skips `rid === villagerId` before any pick (villager-objectives.js:1779) | s107624 d81–d113 `gen_o96e0k3` (Otto Herrera, 33d); s107623 d132–d138 `daniyar_askarov` (7d). Dawn row: `scholarId=daniyar_askarov`, `isScholar=true` |
| `holder-away-at-dawn` (2d) | 13 | `objTick` skips the dawn re-pick for away villagers (`dawn && !away`, then `continue`) | s107617 d106 `visjoin_84`: away, purpose guard sinceDay 106, node (5,4); back at Haven by part 2 |
| `holder-on-expedition-at-dawn` (2e) | 9 | Agency owns the villager; `objTick` forces EXPLORE/expedition and `continue`s | s107622 d119 `james_okonkwo` + `wanjiru_kamau`: `onExped=true`, objective EXPLORE/out |
| `pick-early-return` (2h) | 14 | `objPick` early returns (REST/EAT/SEEK/HAUL/LEAVE) fire before the line-660 feed (villager-objectives.js:388–660); the gate pick writes a same-day brain commit blocking mid-day refresh | s107617 d109 `visjoin_84`: picks EAT@p1, EAT@p3, `feedRan=false` both; s107617 d136 `visjoin_130`: SEEK@p0, mid-day refresh refused (same-day commit, part 2) |
| `plan-created-after-dawn` (2j) | 3 | No dawnState row; first planCensus day is the silent day; `v4creates` creator `world-tick` | s107617 d100 `visjoin_84`; s107622 d111 `james_okonkwo`; s107623 d120 `daniyar_askarov` |
| `holder-engaged-at-dawn` (2c) | 2 | `objTick` skips engaged villagers (villager-objectives.js:1783) before the dawn block | s107622 d141 `mara_vasquez`; s107623 d130 `daniyar_askarov`: `dawnState.engaged=true` |
| `objective-live-all-day` (2i) | 1 | Dawn block re-picks only idle/done/returning objectives (villager-objectives.js:1764); a live objective gets no re-pick all day | s107624 d58 `lena_ruiz`: objective EXPEDITION/indoor, partsLeft 2 at dawn and live at every part 1–3 entry |
| `holder-not-at-haven-at-dawn` (2f) | 0 | — (node check runs after the dawn re-pick; never the sole blocker) | — |
| `holder-off-roster-at-dawn` (2g) | 0 | — (no plan-holder fell off the roster) | — |
| `unclassified` (2k) | **0** | — | — |

Per-seed split of the 82: 107617: 4, 107620: 4, 107622: 11, 107623: 12,
107624: 51 (107618/107619/107621: 0) — identical to the frozen split.
Per-seed unclassified on the replay: 0 on all 8 seeds.

## 4. Determinism (bar 4 — see Amendment 1 in the prereg)

- Fresh replays of 107617 + 107624 reproduce the frozen game EXACTLY:
  launches 0 / 29, days 150 / 150, musterDays 12 / 97, totalEvents
  35 / 532, askKindCounts identical, scored-half causes identical,
  neverScored day/vid/stage/target sets identical (23 / 475 rows).
  Fresh 107617 replay is byte-identical to the inherited file.
- Full 8-seed `--diff`: totalEvents, launches, and days identical on
  all 8 seeds; 3 seeds match literally (107618/107619/107621 — zero
  unclassified in the frozen corpus too); the other 5 differ ONLY in
  causeCounts, in the naming direction (frozen unclassified 3/4/10/4/18
  → replay 0/0/0/0/0).
- The literal `--diff` mismatch is the instrument working as designed:
  the frozen corpus carries no dawn streams, so causes 2c–2i cannot
  fire on it. Amendment 1 (prereg, written before any band judgment)
  records this and judges the replay's set — which coincides with the
  frozen 82 (same holder-days, same counts).

## 5. Instrument validity (bar 3 detail)

- `scripts/test-musterask-a.js`: **113 passed, 0 failed** — includes
  live-harness determinism legs D1 (repeatability: identical days,
  muster, dawnState, objTickTrace, objPickLog, refreshLog, funnelStage
  rows and classification summary across replays) and D2 (recorder-off
  neutrality: identical days, launch count, maxWave, standing, deaths,
  killCalls; no muster/dawn rows), the old-analyzer-fails control (the
  -a2 analyzer leaves a synthetic scholar-day corpus unclassified while
  the new analyzer names it — the name comes from the new stream, not
  an EOD re-read), and a synthetic band classifying 100% with 0
  unclassified.
- `scripts/analyze-musterask-a.js --selftest`: **39 passed, 0 failed**
  (one synthetic corpus per taxonomy row incl. the new dawn rows).
- 0 instrument errors and 0 tick-gate mismatches on all 8 replay
  corpora (600 tick-gate checks per surviving seed).
- Scored half reproduces: 731/731 named with identical causes
  (592 / 78 / 61) and identical per-seed totals.
- Zero `src/js` changes on the branch (verified by the proof test's
  git-status check; `git status` shows only this arm's scripts +
  evidence as untracked).

## 6. Wall numbers (replay corpus, 8 seeds — identical to frozen)

Wins 0, national 0, table 0, wave-5 reached 3, wave-4 reached 8,
median survival 150, max survival 150, villages lost 2 (107618 d47,
107621 d144), total deaths 778. Launches 40 total on 2 seeds
(107624: 29, first launch d48; 107622: 11, first launch d115).
The wall did not move — this arm is diagnostic; it was never expected to.

## 7. Sense test (§8, frozen) — seed 107617, visjoin_84 (Kayden Nolan)

Plan created d100 (stage party, target congregation). Scored d101–d105,
d108, d110; silent d100, d106, d109. (d107 is also unscored at dawn but
was already named by the old taxonomy — away at end of day too.)

- **d100 — the plan did not exist at dawn.** No dawnState row; first
  planCensus day is d100; `v4creates` creator `world-tick`. A fight or
  a flee during the day seeded the plan; there was nothing to score at
  the dawn fire. Sensible.
- **d101–d105 — scored every dawn.** Lottery picks (HAVEN_CHORE,
  `feedRan=true` at part 0), `party_wait` asks, pool eligible 0 — he IS
  being asked; there is simply nobody to muster yet. Dawn rows show a
  healthy man at Haven (energy 100, hunger 35–41, health 38–77
  recovering). d102/d108 were scored by a mid-day refresh instead
  (EAT objective live at dawn, finished at part 1, refresh picked
  HAVEN_CHORE with the feed).
- **d106 — out on guard duty.** Dawn row: `away=true`, purpose guard
  sinceDay 106, node (5,4), objective GUARD/out, health 92. He came
  back mid-day (trace part 2: idle/done, node back at 4,4) and ate
  (EAT@p2, no feed — correctly not a muster row). A man on guard duty
  is not at the dawn fire. Sensible.
- **d109 — a hungry man eating.** Dawn row: HAVEN_CHORE live at dawn
  (partsLeft 1, hunger 50), so no dawn re-pick. Part-1 refresh picked
  EAT, part-3 refresh picked EAT again — both early returns,
  `feedRan=false`. He spent the day finishing his chore and eating,
  twice. The dawn body gate (hunger) ate the day, not the pool.
  Sensible — and it is the pick-early-return mechanism in miniature.
- **d110 — scored again at dawn** (HAVEN_CHORE, feed ran) despite
  engaged:true at end of day — the end-of-day engagement the old
  analysis stared at does not block scoring; the dawn row does.

**Sense verdict: the silence is sensible in every case.** No free ranger
at Haven with a plan in hand was ever skipped. The three silences are a
plan born mid-day, a man on guard duty, and a hungry man eating. The
village behaves like people with bodies and duties, not like a broken
scorer.

## 8. Village assessment (plain words)

Six of eight villages survived the full 150 days; two were lost (day 47
and day 144). Nobody won, nobody reached national, nobody sat at the
table — the wall stands where the frozen band left it. Three villages
reached wave 5; all eight reached wave 4. The muster story this band
tells is not "the pool is empty" but "the ask often never happens": on
the 82 silent holder-days the holder was the player, or away, or on an
expedition, or eating, or holding a plan that did not exist yet that
morning. The companion pool itself was frequently fine — the dawn ask
is gated by dawn life, and dawn life is busy. The two launching seeds
(107624 with 29 launches, 107622 with 11) show that when the ask does
happen, parties do form and do depart.

## 9. Metric review (§10, frozen questions)

- **§1a expectations — CONFIRMED exactly.** Scholar-days 40/82
  (Otto Herrera `gen_o96e0k3` d81–d113 = 33; Daniyar Askarov d132–d138
  = 7), confirmed by the dawn sampler's `dawnState.isScholar` /
  `scholarId`, not just the daily cross-check. Plan-created days 3/82
  (visjoin_84 d100, james_okonkwo d111, daniyar_askarov d120), all
  `world-tick`, confirmed by absent dawnState rows + first planCensus
  day. No amendment to §1a was needed; the sampler agreed with the
  frozen-corpus reads on all 43.
- **EOD state as a dawn proxy — PROVEN BAD, on all 82 days.** The
  end-of-day state (alive / at Haven / not on expedition / not-scholar
  at end of run) failed to predict scoring on every one of the 82
  days — that is why they were unclassified. Direct contradictions
  (dawn fact vs end-of-day reading): 65 — scholar 40 (end-of-run
  scholar id said "not the scholar"), away 13 (end-of-day node said
  "at Haven"), expedition 9 (end-of-day said "not on expedition"),
  plan-created 3 (end-of-day planCensus said "plan held"). The other
  17 are days the end-of-day state was silent about the mechanism
  (engaged 2, early-return 14, live-objective 1) — picks and objective
  lifecycles leave no end-of-day trace. Any future never-scored
  analysis must sample at dawn; end-of-day state is not a substitute.
- **d58/d59 cluster (seed 107624) — a SHARED HOLDER FACT, not a day
  fact.** `objTick` ran both days (8 dawnState rows each day). d58:
  five of eight holders were away at dawn (four on expedition, one
  foraging) and three sat at Haven with a live EXPEDITION objective
  (two scored at another part, one — Lena Ruiz — live all day). d59:
  all eight holders away at dawn (five on expedition, one guard, one
  water, one foraging-turned-expedition). The village had simply sent
  everyone out. No day-wide outage, no missing tick.
- **Pick-early-return share — 14/82 (17%), and it is a HUNGER story.**
  EAT in 12 of the 14 (SEEK in 2; REST/HAUL/LEAVE in 0). On those days
  the dawn body gates, not the pool, are the first wall: the holder
  was picked, but hunger answered before the feed. Two of the 14 also
  show a mid-day refresh refused on the same-day commit — the
  gate-pick commit silences the rest of the day. This is the largest
  single *fixable* silence class that is not a succession artifact:
  if the dawn feed ran before the body gates (or survived them), those
  14 days would have been asks. That is a design question for the next
  arm, not a change made here.
- **Unclassified remainder — none.** 0/82. No pattern left for the
  extended taxonomy to miss. The two never-fired causes (not-at-Haven
  at dawn, off-roster at dawn) stayed empty as predicted.
- **Replay drift — none in the game; the instrument diff is recorded
  in Amendment 1.** Game fields identical on all 8 seeds (launches,
  days, totalEvents per seed; wall numbers identical). The literal
  `--diff` causeCounts mismatch is the new dawn streams naming days
  the frozen corpus could not name — the arm's purpose, not drift.
- **Band — unchanged.** 107617–107624 replayed, not re-selected; the
  band changed nothing vs the muster-a reading (same 813 events, same
  82 holder-days, same per-seed split, same wall).

## 10. What this means for the scale-onramp axis

The muster gap is closed as a measurement question, and its closure
points the axis at a sharper fact: the win-plan muster fails silently
for *dawn-life* reasons, and the biggest structural one is succession.
For 33 straight days on seed 107624, the plan-holder WAS the player —
Otto Herrera inherited the scholar's seat and his wave-4 plan kept
him "eligible" in every end-of-day count while no NPC dawn could ever
score him. Any future muster metric that counts holder-days without
excluding scholar-days will over-count the gap by the succession
length. Second: the dawn body gates (hunger first) silently eat asks
on 17% of silent days — a holder who is picked to eat is never fed to
the scorer, and the same-day commit then blocks the rest of the day.
If the axis wants more asks, the feed's position relative to the body
gates is the lever, not the pool.

## 11. Findings update (for the coordinator to append to hidden_files/sim-findings.md line 2719)

> [UPDATE 2026-11-23 — sim-musterask-a DIAG-GO] The 82 never-scored
> holder-days are fully named (82/82, 0 unclassified) by the dawn-state
> sampler on the replay band 107617–107624: scholar-at-dawn 40 (Otto
> Herrera 33d on s107624 d81–d113 + Daniyar Askarov 7d on s107623
> d132–d138 — mid-run successions the end-of-run scholar check missed),
> away-at-dawn 13, on-expedition-at-dawn 9, pick-early-return 14 (EAT
> 12, SEEK 2 — hunger answers before the line-660 feed; 2 also show a
> mid-day refresh refused on the same-day commit), plan-created-after-
> dawn 3, engaged-at-dawn 2, objective-live-all-day 1. End-of-day state
> is proven a bad proxy for dawn state (direct contradiction on 65/82
> days). The d58/d59 s107624 cluster is a shared holder fact (the
> village sent everyone out), not a day outage. No game change on this
> arm (instrument only, zero src/js). Evidence:
> evidence/2026-11-23/sim-musterask-a.md.

## 12. Files

- Prereg (frozen + Amendment 1):
  `evidence/2026-11-23/sim-musterask-a-prereg.md`
- This evidence: `evidence/2026-11-23/sim-musterask-a.md`
- Analysis: `evidence/2026-11-23/musterask-a-analysis.json`
  (813/813 classified, 0 unclassified, 0 instrument errors)
- Replay corpora (8 seeds):
  `evidence/2026-11-23/perseed-musterask-a-ctl/musterask-a-s10761[7-9]-musterask-a-ctl.json`,
  `musterask-a-s10762[0-4]-musterask-a-ctl.json`
- Instrument: `scripts/musterask-driver-a.js`,
  `scripts/analyze-musterask-a.js`, `scripts/test-musterask-a.js`
- Substrate: policy `scripts/policies/tableseat-nowait.js` layers off
  (competent verbatim); env `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1
  FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`;
  anchor `dbe748d46` recorded on every corpus.
