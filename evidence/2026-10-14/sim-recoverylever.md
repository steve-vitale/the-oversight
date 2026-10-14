# ARM "recoverylever" — the post-trauma ranging throttle (scale-onramp) — r35 ARM 2 — KILLED AT CONFIRM

Worktree: `~/workspace/worktrees/sim-recoverylever`. Run: oversight-flesh-out-loop, run r35, axis scale-onramp. ARM 2 of 3.

## The blank / the accident

r34 ARM 3 (succbrake, KILLED at pilot — evidence/2026-10-14/sim-succbrake.md) accidentally discovered this: its post-combat-death fortify layer — new bearer Haven-bound, no wild sorties for 2 days after any combat death, guard posture narrated — bought **+27.5d median (94d→121.5d, 7/8 seeds longer)**, national **5/8→8/8**, wave-5 **1/8→2/8**, zero exiles. The feed primary missed (0.111→0.216/succession; the succession feed turned out to be a Haven-siege phenomenon, not a ranging phenomenon — ranging theory falsified), but the fortify improved survival via a DIFFERENT mechanism: a 2-day ranging throttle after trauma = less wild exposure. The r34 evidence calls this a recovery-lever candidate needing a SURVIVAL-primary arm. This is that arm.

## Canon read

- docs/CANON.md (manifest + standing rules). No canon doc covers post-trauma recovery posture specifically; the design below uses only existing engine verbs (travelTo, say, displayName) and the existing policy path (fourthlink/leadcourt/competent). The guard-posture fiction ("nobody ranges till the watch stands down") is new narration, flagged as a design call Steve can overrule — and was explicitly preferred over the succbrake pilot's policy-speak by the succbrake sense-test.
- Engine facts used (read, not invented): policies only drive the PLAYER (sim-harness: policy.daily/upkeep are the scholar's verbs); villager foraging runs engine-side (game.js forageZone/zone work during the day tick) with no policy hook. So the "villager expeditions curtailed" prong is narrated, not mechanized — see "Blanks" below. Death tele shape (corpses.js): `{type:'death', day, kind, who, cause, wave, player}` — kind covers person/villager/monster/animal; player:true rides ONLY on scholar deaths (ledger.js playerDeath, r17).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE the armed run (in scripts/sweep-recoverylever-20261014.js header)

- **Question**: does the r34 fortify effect hold as a RECOVERY lever — a trauma-triggered ranging throttle (any combat death of a person opens a 2-day Haven hold) — when measured against a survival primary on identical seeds?
- **Primary metric (survival)**: median survival, armed >= control + 5d. (r34's guardrail was 94d; control is re-run on current tip — never trust old numbers.)
- **Guardrails**: national >= control−2; wave-5 unlocks >= control−1; no new death mode — cause-family level (monster names collapse to combat), with the r29/r34 metric-review n-floor: a family key present in armed but absent from control counts as a new mode only with n>=3 across armed runs (singleton noise at 8 seeds is not a mode).
- **Horizon**: 180d death-aware (harnessstop tail). **Seeds**: pilot 11/22/33/44/55/66/77/88 × courtship (leadcourt + FOURTHLINK=1); confirm 111/222/333/444/555/666/777/888/999/1010/1111/1212 (fresh seeds) if pilot GO. **Policies**: control = leadcourt+FOURTHLINK=1; armed = +RECOVERYLEVER=1. Identical seeds, deterministic (det-gate byte-identical on this road).
- Metric binding (§14): a miss is NO-GO, never re-scored mid-run.

## The layer (scripts/policies/recoverylever.js, RECOVERYLEVER=1, default OFF) — DELETED per kill protocol

Rebuilt from the succbrake mechanism (same proven throttle), trigger broadened from scholar-only to any combat death OF A PERSON. The trauma, not the mantle, is the trigger.

- Gate off → the wrapper delegates verb-for-verb to fourthlink (proof R1/G9; sim det-gate 2/2 byte-identical rows).
- Gate on → wraps fourthlink:
  (a) each daily/upkeep scans telemetry for new death events (count-cursor, deterministic); a combat-category PERSON death (the scholar, player:true, OR a villager — kind villager/person; NEVER a monster — the village doesn't mourn the hushwolf), opens/extends the recovery window (deathDay + RECOVERY_DAYS=2, chained deaths extend);
  (b) inside the window: walk home if away (bounded honest hops, haven-ward, real travelTo), say the guard-posture line once per window-opening (scholar death → "…The mantle needs a living bearer."; villager death → "…Crews stay close to home."), then run the base daily+upkeep under a travel guard — any travelTo away from the haven tile is declined (`{moved:false}`, callers handle it); combatExit (flee-by-barrier) always passes; haven chores (sort, donate, teach, talk, eat, drink, gear, feasts) run normally.
- No new verbs; every call is an existing engine path. Design calls (Steve can overrule): N=2 (inherited from the succbrake diagnostic: max gap 1 day + margin; the mechanism under re-test is identical, only the trigger is broader); the guard-posture fiction; combat-only trigger (non-combat deaths recorded, don't open windows); chain-extends; narration fires on window OPEN, not on extension; PEOPLE-ONLY trigger (sense-tested — see below).
- The people-only trigger was a mid-pilot FIX, not in the original pre-registration: the first armed pilot fired recovery windows on MONSTER deaths (kind:'monster', cause 'combat'/'villager combat' — a villager killing a monster), narrating "After Someone's death…" for a dead paparazzo. Sense-testing caught it; G10 was added; the pilot was re-run on the fixed trigger. Documented here, not hidden.

## Proof: scripts/test-recoverylever-20261014.js — 12/12 GREEN pre-kill (REAL RED verified); INFO-SKIPs post-kill

- R1 (RED): gate-off daily+upkeep delegate verb-identically, no tracking state.
- R2 (REAL RED): gate-off + villager combat death → daily still ranges wild (the blank, unblocked).
- G1: villager combat death → recovery: guard say once ("nobody ranges till the watch stands down", names Cy Dune + Aldo Bren, "Crews stay close to home"), wild declined, haven passes, base daily ran.
- G2: scholar combat death → recovery with the mantle line ("The mantle needs a living bearer").
- G3: expiry after RECOVERY_DAYS; G4: chained death extends; G5: non-combat death doesn't trigger (still recorded); G6: combatExit passes; G7: walk-home bounded haven-ward; G8: upkeep guarded.
- G9 (det-gate): gate-off 3-day scripted run — identical verb sequences + ctx keys.
- G10 (sense-driven): monster combat death does NOT trigger (people-only trigger; the dead-paparazzo fix).
- SMOKE=1 instrument-honesty subset 3/3. Sim det-gate: gate-off wrapper vs raw fourthlink, seeds 11+44 — byte-identical rows (s11 86d/national, s44 102d/global in both) + identical suite; A/A determinism holds on this road.
- Post-kill: layer deleted per protocol; this proof INFO-SKIPs when the layer is absent (succbrake precedent); the 12/12 pre-kill result stands as documented here.

## Results

### Control — re-run on current tip (leadcourt+FOURTHLINK=1)

Pilot (8 seeds): `evidence/2026-10-14/sim-recoverylever-control.json` — median **94d**, national **5/8**, w5 1/8, exiled 0. Reproduces r34's control EXACTLY (94d, 5/8, 1/8) — the road is stable across the tip move.

Confirm (12 fresh seeds): `evidence/2026-10-14/sim-recoverylever-control-confirm.json` — median **125.5d**, national **12/12**, w5 4/12, exiled 0. A friendlier seed regime (seed noise is real — see metric review).

### Armed (leadcourt+FOURTHLINK=1 + RECOVERYLEVER=1) — identical seeds, people-only trigger

Pilot (8 seeds): `evidence/2026-10-14/sim-recoverylever-armed.json` — median **147d** vs 94d (**+53d**), national **6/8** vs 5/8, w5 **2/8** vs 1/8, exiled 0. Two full 180d survivals (s44, s77 — the first 180d survivals on this road). 6/8 seeds longer. Per-seed (ctrl→armed): s11 86→128, s22 151→144, s33 37→123, s44 102→180✚, s55 93→150, s66 58→172, s77 109→180✚, s88 95→47. 104 recovery windows, 196 fortify-days, 674 declined sorties.

Confirm (12 fresh seeds): `evidence/2026-10-14/sim-recoverylever-armed-confirm.json` — median **130d** vs 125.5d (**+4.5d**), national **10/12** vs 12/12, w5 **4/12** vs 4/12, exiled 0. Three 180d runs (s333 ✚ survived, s555 ✚ survived, s1010 lost at the horizon). 7/12 seeds longer. Per-seed: s111 99→46, s222 149→107, s333 142→180✚, s444 80→113, s555 117→180✚, s666 88→102, s777 134→29, s888 108→136, s999 115→130, s1010 152→180, s1111 179→158, s1212 143→130. 141 recovery windows, 242 fortify-days, 883 declined sorties.

### Verdict — NO-GO → KILL (§14 binds)

- **Pilot**: 147 ≥ 94+5=99 → GO (clear).
- **Confirm**: 130 ≥ 125.5+5=130.5? **NO — miss by 0.5d.**
- Guardrails (confirm): national 10/12 ≥ 12−2=10 ✓ (exactly at floor); wave-5 4/12 ≥ 4−1=3 ✓; exiled 0 ✓; no new death mode at the n≥3 floor ✓ (armed-only keys all n≤2: player:expedition×2, three villager:other singletons).
- Per §14 the confirm is the decision measurement and a miss is NO-GO, never re-scored — not against the pilot's +53d, not against the guardrails, not against the 0.5d margin. **GO MISSED → KILL.**
- Kill protocol: `scripts/policies/recoverylever.js` DELETED. Proof/sweeps/sense/evidence retained as documentation (the layer is rebuildable from this spec).

The 0.5d margin is painful and the heterogeneity is real (see metric review), but the bright-line rule exists for close calls — the r34 precedent killed a +27.5d layer on a primary miss, and "it's basically a GO" is exactly the drift §14 was written to prevent.

## Why the confirm missed — the heterogeneity finding (the real result)

The lever's effect is regime-dependent, not uniform:

- **Hard seeds** (pilot: control median 94d): the throttle buys +53d median. Villages dying at ~d90 to wild exposure get the most from 2-day holds after trauma — s33 37→123, s66 58→172, s44/s77 full 180d survivals.
- **Easy seeds** (confirm: control median 125.5d): the throttle buys +4.5d median — noise. Villages already reaching the late-game wall (sieges, wave-5 threats) can't be throttled past it; the two confirm disaster seeds (s111 46d, s777 29d) died before combat deaths could even trigger windows (recW=2 and 1 — the lever never got a chance; early collapse is the trauma).

Three independent measurements of the same mechanism now exist, ALL median-positive: r34 accident +27.5d (94→121.5), this pilot +53d (94→147), this confirm +4.5d (125.5→130). The direction is consistent; the magnitude scales with how much room the baseline leaves. The pre-registered +5d absolute bar assumes a regime-independent effect — it isn't one (metric review below).

Mechanism note: the people-only fix CHANGED trajectories (fewer windows: 104 vs 149 pre-fix), and the fixed version did BETTER (+53d vs the pre-fix run's +27d on the same seeds — though the pre-fix numbers were measured with the monster-trigger bug and are not reported as a result). Mourning monsters was pure throttle noise; mourning people is the mechanism.

## Village assessment (plain words)

Twenty villages on the courtship road, eight of them twice-lived. The pilot's villages are the clearest story: s33's village died at d37 in the control — a nobody-village that never got going — and lived to d123 armed, reaching wave 5 at d75 and global rank; s66 went 58d→172d. The throttle doesn't make villages strong; it makes them careful after loss, and careful villages live long enough to become strong. The confirm's villages tell the other half: s333 and s555 both ran the full 180 days armed (s333 with wave 5 at d73), while s777's village collapsed at d29 armed vs d134 control — when the end comes in the first month, no amount of regrouping after trauma helps, because the trauma IS the end. Who thrived: the bearers who survived their villages' worst weeks — s44's and s77's scholars held Haven through 18 and 22 recovery windows respectively and were alive at the horizon. Who died: bearers, disproportionately — player:combat deaths 54 armed vs 30 control (pilot), the siege phenomenon again: longer-lived villages meet more Haven sieges. The villages that die early never meet the siege; the villages that live meet it repeatedly (r34's finding, replicated).

## SENSE-TESTING (scripts/sense-recoverylever-20261014.js, seed 66, fixed trigger)

The recovery lines read as mourning and regrouping, not a throttle firing:

- d13: "🕯️ After June's death, Grace holds Haven — nobody ranges till the watch stands down. The mantle needs a living bearer." — follows the Codex turning its own page for June Aguilar and the System's mantle-transfer beat. Names the dead (June) and the living (Grace). A village stopping.
- d59: "🕯️ After Theo's death, Grace holds Haven — nobody ranges till the watch stands down. Crews stay close to home." — a villager's death, the village closing ranks.
- d90: "🕯️ After Grace's death, Cheryl holds Haven — nobody ranges till the watch stands down. The mantle needs a living bearer." — the mantle passes again; the village regroups again. The line that proves the fiction holds across successions.

No "Someone" lines post-fix (every window names a real dead person and a real living holder). The surrounding transcript reads as people (raid beats with named grudges, the Codex paging for the dead, counter-learning narration). The one honest critique from the sense pass: the pre-fix "After Someone's death" for a dead paparazzo was a throttle firing where no human would grieve — caught, fixed (G10), re-measured. The SENSE-TESTING LAW earned its keep this run.

## Blanks filled / documented

- **Measured** (not chased): the recovery lever's survival effect on the courtship road — pilot +53d median (147 vs 94), confirm +4.5d (130 vs 125.5); national/wave-5/exile guardrails all held; no new death mode at the n≥3 floor. The r34 "recovery-lever candidate" now has its survival-primary measurement.
- **Fixed** (this arm): the people-only trigger — monster deaths must not open recovery windows (sense-tested; G10; the dead-paparazzo "After Someone's death" line).
- **Documented** (sim-findings.md): (1) the heterogeneity finding — the throttle helps struggling villages, ~neutral on thriving ones; the +5d absolute bar is miscalibrated for regime-dependent effects; (2) "villager expeditions curtailed" is narration-only — verified 2026-10-14 that no policy hook reaches engine-side villager foraging (game.js forageZone during the day tick; the policy interface is setup/upkeep/daily/fight/contest, all player verbs). A future game-code arm could mechanize the villager side; (3) the confirm's friendly-seed regime as a seed-noise calibration point (control 125.5d on seeds 111–1212 vs 94d on 11–88).
- **Replicated**: r34's accident is now a measured effect — three independent median-positive measurements of the trauma-triggered throttle (+27.5d, +53d, +4.5d).

## Metric review (§14 — for the NEXT run)

GO missed on the confirm: armed 130d vs required ≥130.5d. Per §14 this is NO-GO, not re-scored — the layer is killed.

The metric was fair for the claim as written (median ≥ control+5d), but the claim assumed a regime-independent effect and the lever's effect is heterogeneous. Two revisions proposed for the NEXT run, not this one:
1. **Stratify by baseline difficulty or use a proportional bar.** The +5d absolute bar can't distinguish "no effect" from "large effect on hard seeds, ~zero on easy seeds." Options: pre-register separate bars per seed-regime (e.g., seeds where control median <100d vs ≥100d), or a proportional bar (armed ≥ control×1.10), or a hard-seed-only primary (villages that would otherwise die before d100). Any of these would have passed on this run's data; none may be applied retroactively.
2. **The no-new-death-mode n-floor worked.** The r29/r34 proposal (n≥3 at family level) fired on nothing this run while the raw key-presence form would have flagged five singletons. Keep the floor.
3. **Confirm-seed calibration**: fresh confirm seeds should be drawn from the same difficulty regime as the pilot seeds, or the pilot/confirm should share the seed set (confirm = more seeds ADDED to the pilot set, not a fresh set). The confirm's friendly regime (control 125.5d vs pilot 94d) is what made the absolute bar unreachable — a design choice, not bad luck, and it should be a pre-registered choice next time.

Honest counterpoint recorded: three independent measurements, all median-positive, same mechanism, guardrails clean, transcripts human. If the bar had been proportional (+5%), this would be a GO (130 ≥ 131.8? no — 125.5×1.05=131.8, still a miss; +3% would pass). The bar wasn't wrong by much, and the miss wasn't by much. §14 doesn't do "by much" — it does GO/NO-GO. NO-GO stands.

## Telemetry deviation check (scripts/telemetry-check.js)

- Armed confirm aggregate (`evidence/2026-10-14/sim-recoverylever-armed-confirm.json`) vs `hidden_files/telemetry-baselines/scale-wall.json`: fired LOUD ×1 ("national disappeared: baseline 8 → current 0"). INVESTIGATED — EXPLAINED, not a bug: the sweep JSONs nest metrics in `rows[]`/`suite` (no top-level `national` key), so the check counts missing paths as 0 — the same schema-mismatch invocation issue as r34, not a data deviation. Row/suite-level truth: national 10/12, table 0/12, wins 0, exiled 0 — all inside the known wall envelope.
- **Baseline NOT rolled forward** — the arm is killed; the scale-wall baseline tracks the wall across runs and must not absorb a killed arm's numbers (r34 precedent).

## Wall numbers (this arm's suites)

| | national | table | wins | wave-4 | wave-5 | medianSurv | exiled |
|---|---|---|---|---|---|---|---|
| control pilot (8) | 5/8 | 0/8 | 0/8 | 5/8 | 1/8 | 94d | 0/8 |
| armed pilot (8) | 6/8 | 0/8 | 0/8 | 6/8 | 2/8 | 147d | 0/8 |
| control confirm (12) | 12/12 | 0/12 | 0/12 | 12/12 | 4/12 | 125.5d | 0/12 |
| armed confirm (12) | 10/12 | 0/12 | 0/12 | 10/12 | 4/12 | 130d | 0/12 |

No run reached the table or a win. Two full 180d survivals (s44, s77 pilot; s333, s555 confirm) — the first 180d survivals on the courtship road — but survival without the table is not scale. The wall stands on the arrival side (national reached, table not), and the mortality side moved (the throttle's heterogeneity).

## Files (landed as documentation; layer deleted per kill protocol)

- `scripts/policies/recoverylever.js` — DELETED per kill protocol (NO-GO at confirm).
- `scripts/test-recoverylever-20261014.js` — 12/12 GREEN pre-kill (REAL RED verified); INFO-SKIPs post-kill.
- `scripts/sweep-recoverylever-20261014.js` — pilot + confirm driver (pre-registration in header); det-gate mode.
- `scripts/sense-recoverylever-20261014.js` — sense transcript reader.
- `evidence/2026-10-14/sim-recoverylever-control.json` — pilot control (8 seeds; reproduces r34 exactly).
- `evidence/2026-10-14/sim-recoverylever-armed.json` — pilot armed (8 seeds; people-only trigger).
- `evidence/2026-10-14/sim-recoverylever-control-confirm.json` — confirm control (12 fresh seeds).
- `evidence/2026-10-14/sim-recoverylever-armed-confirm.json` — confirm armed (12 fresh seeds).
- `evidence/2026-10-14/sim-recoverylever-detgate.json` + `sim-recoverylever-detgate-control.json` — det-gate (byte-identical).
- `evidence/2026-10-14/sim-recoverylever.md` — this file.
