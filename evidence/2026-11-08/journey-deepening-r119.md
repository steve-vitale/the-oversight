# Journey deepening — run 119 (Lane A, leg 2: days 40–80)

- **Run:** `laneA-20261108T1045Z`, Sun 2026-11-08, base master `246ce6dc2`
- **Branch:** `journey-deepening` — commits `bf4c961f0` (prereg + driver + analyzer + proof test), `7d9ef1fe2` (Amendment 1 + instrument fixes)
- **Panel:** single, 4 fresh seeds 96701–96704, policy `competent`, LISTEN, DAYCAP=100, CONVO_DAYS [45, 60, 80]
- **This run changed:** tooling only (driver/analyzer/proof test, prereg). Zero game code. No ladder, trust-wrap, seat-gate, or balance change.

## Prereg recap (binding)

- **Q1 — the Standing ladder, read live (PRIMARY).** Ladder leg 1 merged to local master the morning of 2026-11-08 (`69fc5207c`; thresholds cumulative 12/26/40, per-track cap 60% of the NEXT rung's threshold, stage = highest rung whose capped total meets its threshold, rungs nest; `villageLadder()` is a pure read). Its proofs were rigged-state unit proofs only — no real village had been read through it. This run is the first live read on real deepening villages. Verdicts: LADDER-OPENS (≥1 seed reaches Village stage ≥1 by day 80); LADDER-MINTS (all five tracks mint >0 counted points on ≥1 seed each); LADDER-SILENT (0 seeds reach stage ≥1 by day 100 despite villages alive); LADDER-BROKEN (`villageLadder()` throws, or counted ≥ nextThreshold while stage 0, or a countedTrack above the cap); LADDER-LATE (first Village stage only after day 80 on every reaching seed).
- **Q2 — trust, instrumented (Elif question, carried from r116/r118).** The `playerDeath` wrap in `src/js/villager-agency.js:1484-1499` pays EVERY roster member `min(12, floor(agencyScore(id)/4))` trust on EVERY scholar death; `agencyScore` = achievements + expeditions×2 + monsterKills×8 + nodes + tier×4, earned without ever talking to the scholar. The design call (fix or not) stays with the main session — this run measures and reports only. Verdicts: TRUST-PAID-TO-STRANGERS (≥1 death pays a villager with zero prior scholar contact); TRUST-EARNED-ONLY (all death-day gains go to villagers with prior contact, or gains are 0); TRUST-MOVES-ELSEWHERE (descriptive: trust changes on non-death days); MANTLE-LATENCY (descriptive; latency ≥2 or any day a health≤0 bearer stays bearer is LOUD).
- **Carried/regression watches:** SURV-CONTROL-4 (9th control point); langGate 0 'none'; replay scan 0; menuFlip 0; safety goalLine capture >0; V-INIT bondSittings count.

## Q1 — LADDER: **LADDER-OPENS + LADDER-MINTS**

| seed | end | first stage ≥1 | peak | last | trajectory (day:stage/counted) | minted fight/forage/craft/talk/explore |
|------|-----|---------------|------|------|-------------------------------|----------------------------------------|
| 96701 | survived d102 | d40* | 3 National | 3 | 40:s3/54, 50:s3/56, 60:s3/59, 70:s3/64, 80:s3/69, 90:s3/70, 100:s3/62, 102:s3/62 | 5/21/12/16/24 |
| 96702 | lost d82 | d40* | 3 National | 2 | 40:s2/38, 50:s3/43, 60:s3/45, 70:s2/37, 80:s2/38, 82:s2/34 | 1/16/7/9/23 |
| 96703 | lost d51 | d40* | 3 National | 1 | 40:s3/46, 50:s1/25, 51:s1/22 | 2/12/13/4/15 |
| 96704 | survived d101 | d40* | 3 National | 3 | 40:s2/34, 50:s3/48, 60:s3/54, 70:s3/60, 80:s3/70, 90:s3/72, 100:s3/74, 101:s3/74 | 5/24/15/6/24 |

\* First snap is day 40 — every seed was already stage ≥2 by then, so the true first-stage day is earlier and uncaptured (see metric review #1).

- **Panel: opens 4/4, late 0, silent 0, broken 0. All five tracks mint on all four seeds (5/5 tracks, 4/4 seeds).** No `villageLadder()` errors, no rung contradictions, no cap breaches.
- **The ladder is a live sum, not a ratchet — stages fall when villagers die.** 96702 hit National then fell to Regional at day 70 as deaths pulled XP out of the live sums (counted 45→37). 96703 hit National (46) on day 40 and fell to Village stage (25) by day 50 as its people died. 96701's counted total fell 70→62 by day 100 (stage held at 3). This is design-faithful — the pure read sums what is alive — but it means a village can earn National and lose it while still standing. Calibration question for leg 4, not a defect.
- **Explore mints easiest, fight hardest.** Explore hit 23–24 on three seeds — the cap (24 = 60% of the 40 threshold) barely binds it. Fight minted 1–5. Talk varies widely (4–16). If the ladder is meant to reward all playstyles, explore breadth is currently the cheap points and fight the dear ones (metric review #5).
- Smoke seed 96700 (deleted per prereg) agreed: stage 3 by day 46, explore capped at day 46.

## Q2 — TRUST: **TRUST-EARNED-ONLY**

- **15 scholar deaths panel-wide. 18 positive death-payments, all 18 to villagers with prior scholar contact. 0 stranger payments, 0 late (contact only on/after the death day).** No TRUST-PAID-TO-STRANGERS.
- Per seed: 96701 — 4 deaths, 10 gainers, all known, latency max 1. 96702 — 1 death, 2 gainers, both known, latency 1. 96703 — 10 deaths, 12 gainers recorded, all known. 96704 — 0 deaths, no gains.
- **The `expected`/net separation proved essential.** Successors show a payment of +12 but a net delta of −28/−9/−10 — the base `playerDeath` mantle inheritance overwrites the successor's trust (`ledger.js`: replaced by `max(10, round(office*0.4 + own*0.4 + vouchBonus))`). Non-successors' net equals their payment. Without the split, the r116 Elif reading would conflate the two.
- **96703's death cascade (days 49–51): the mantle passed 6 times in 3 days, then there was nobody left.** On those days the payment was 0 for everyone — nobody in a dying village had agencyScore ≥ 4 — and the negative numbers the analyzer printed (−8…−23) are inheritance-overwrite net losses, NOT payments. The game code guards with `if (bonus > 0)` (`villager-agency.js:1497`), so the wrap never subtracts trust on death. The panel's `knownGains=24` counts 6 such fallback entries; the true positive-payment count is 18.
- **Mantle latency max 1** (the expected daily-sampling artifact). **1 dead-bearer day: 96703 day 51, the extinction day.** The last villager died, no successor existed, the bearer stayed the dead villager (self-inheritance, old=new). Explained, not a live defect — there is nowhere for the mantle to go when the village is empty.
- **Trust moves constantly elsewhere: 301 non-death days with trust changes across the panel (95+75+42+89).** The death payment is one writer among many small deed writers using `trustGainProgressive`. Trust drifts roster-wide (+1..+9/day/villager) to ~88–96 by mid-run; new arrivals sit at ~20–25.
- **What this says about the Elif question:** the mechanism is real — a high-agency villager gains +12 trust on every scholar death, and agency is earned by deeds without ever talking to the scholar. But on these four villages every gainer happened to have talked to the scholar at some point. The design question (should deeds alone earn trust from the scholar's death?) stays open for the main session; the data say the payment lands on people the scholar already knows, in the wild, on this panel.

## Regression watches — all hold

- **SURV-CONTROL-4: 2/4 survive (96701, 96704) → funnel unchanged.** Lineage: r107 2/4, r108 3/4, r109 2/4, r110 2/4, r113-before 4/4, r113-after 2/4, r114-before 4/4, r114-after 3/4, r116-before 4/4, r116-after 3/4, r118-before 2/4, r118-after 2/4, **r119 2/4**. 9th control point.
- **langGate: 0 'none' offers/decisions** (24 offers, 17 decisions, all non-none) — NOT-REPRODUCED.
- **Replay scan: 0.** **Menu-flip: 0 flips / 41 listen turns** — the r118 fix holds.
- **LangArc: ARC-FIRES.** 96702: Ukrainian, 2 grants, Vasyl flips d24 and d80, 3 post-flip decisions. The r118 arc fires again, on a second seed.
- **GoalJoin: all HEALTHY.** Safety capture 107 (r118 indoor fix holds); party_up capture 150; food_security 688; build_standing 26.
- **Q1-REQUESTS: REACHED** (23 staged, 17 decided, 6 expired, 0 expired-talkable-untalked).
- **V-INIT: bondSittings 0 this panel** (45 transcripts) — r118's single sitting stays a sighting, not a pattern.
- **FIZZLE: 0 dry sittings — fix holds.** **AWAY-LINE: old line gone** (0 old, 6 new). **DEBRIEF: 2 village-lost, both attributed.**
- **B-SIT: 14 betrayal sittings (9 accept / 5 decline / 0 unanswered), 45 transcripts. B-FOLLOW: 8 followups, 1 with new betrayal.**
- **Bond telemetry: 60 tele, 31 proposals, 14 decisions, 7 accepts (50%), 8 link raises, 9 initiated bonds, 0 instrument errors** — the merged villager-initiated-bonds code reaches the wild.
- **P-KEEP: 15 threads** — 2 SILENT, 8 NO-LATER-SITTING, 3 DEAD, 2 NAMED.

## Village assessment (plain words)

- **96701 — the strong village.** Survived to day 102 with 9 alive (James, Lucia, Ingrid, Omar, Valeria, Boris, Mateo, Luis, Ursula), 3 seasoned links, standing 199 at global scale, pantry 7,758 kcal. 8 fell. First blood day 3; 107 beasts slain; first wave-2 kill day 8. Ethan taught Snare and Pit Trap. A connected village that learned to fight wave-3 tricks and kept its people.
- **96702 — scattered by hunger.** Lost day 82 with 1 survivor (Lena), pantry 0, 13 fell (wounds that wouldn't close ×3, thirst ×3). Reached Regional and linked village_2, but the food ran out and the village scattered. Vasyl learned Ukrainian well enough to flip twice; the language arc fired.
- **96703 — the death cascade.** Lost day 51 with nobody alive. 12 fell, 10 to the wild; the scholar's mantle passed 6 times in 3 days and then there was no one left to carry it. The pantry still held 56,890 kcal — food was not the problem; the wild killed everyone. The village had reached National on day 40 and fell to Village stage by day 50 as its people died.
- **96704 — the strongest village of the panel.** Survived to day 101, reached wave 5, 10 alive (Jamie, George, Saul, Logan, Nada, Elijah, Farid, Hassan, Tariq, Pavel), only 2 fell, pantry 17,046 kcal, standing 270 regional, 3 links. First wave-2 kill day 21. Wave-3 fights were won and fled sensibly (fled d74 and d79, won d51, d78, d89). Logan's party carried the late fights.

## People check (SENSE-TESTING LAW — 4 full transcripts read)

All four are sensical — wants are real, options engage or deflect, endings resolve or plant.

- **Ethan, 96701 day 54 (seek_comfort → comforted):** a grieving trail crew lead. He opens with a link proposal, the player declines the betrayal invite and accepts the link, teaches a plant, then Ethan almost says something and the player stays — and stays, and stays — until he finally says the quiet parts are the worst. A real arc, earned by staying.
- **Tariq, 96704 day 99 (ask_favor → promised):** a bond proposal accepted, then a wound that is still open, the player commits to come back, then a quiet walk of his trap line together. Bond → favor → shared activity — a coherent chain.
- **Vasyl, 96702 day 80 (ask_favor → stated):** he speaks only Ukrainian and wants something he cannot say. The player listens four times, catches nothing, and the talk ends where language couldn't reach. Honest: the barrier is the content, and the listen lines vary instead of looping.
- **Exaucee, 96703 day 45 (ask_favor → unestablished):** a locksmith confesses "I can't read, and I'm scared it matters now" — and then the sitting fills with five plant teachings, each with its own reaction line, and the confession never gets answered. The literacy confession is a real, human beat; the teach loop crowds it out. One observation, no fix this run (tooling-only; the design call belongs to the main session).

Wave-3 fights are real multi-round fights with signature tricks firing and being learned — Redactor, Spool replay, Buffering frames, Chorus Line, Ad Break, Terms of Service, Callback. Villagers fight beside the player (Logan, George, Valeria, Ingrid, Catalina all landing hits).

## Reachable / fun / winnable (deepening leg)

- **Reachable:** yes. All four villages reached the deepening content — wave-3 fights, regional links, the language arc, bond proposals, and the Standing ladder opened on every seed by day 40.
- **Fun:** yes, with the usual deepening texture — real fights with tricks to learn, conversations that land (Ethan's grief, Tariq's trap line), and villages that feel different from each other (a strong one, a hungry one, a dying one, a wave-5 one).
- **Winnable:** the leg moves toward a win. Two villages survived past day 100 with standing at global/regional scale, one reached wave 5, and the ladder now opens everywhere in-leg — the first live read of it. The funnel is unchanged (2/4 survive), so the leg is still hard, but the path is visible: the ladder opens, the stages are earned by living villagers doing things, and the strongest village held National to day 101.

## Metric review (binding — proposals for the NEXT run, not re-scores)

1. **Ladder firstStageDay is censored at the first snap (day 40).** All four seeds were already stage ≥2 at day 40, so "first Village stage by day 80" cannot distinguish an early opening from a late one. Next ladder read should snap from day 14 (or log the day the stage first changes).
2. **The prereg's verdicts do not cover "stage reached, then lost."** Two seeds hit National and fell back. Propose a LADDER-HOLDS / LADDER-FALLS descriptor for leg 4, and a read of how often a stage survives to the seed's end.
3. **Trust "gainers" over-counts.** The analyzer's fallback counts negative net deltas on payment-0 days as gains (6 of the panel's 24). Propose: count only `expected > 0` entries as gains; report fallback net-deltas separately as inheritance/drift.
4. **Dead-bearer detector fires on the extinction day.** When the last villager dies there is no successor by definition. Propose excluding the terminal snap, or labeling it "extinction" instead of a live defect.
5. **Explore mints at the cap while fight mints 1–5.** The cap binds one track and barely touches another. Calibration question for leg 4 (leg 4 owns calibration): is explore breadth too cheap, or fight too dear, for a ladder meant to reward all playstyles?

## Infrastructure notes

- **Pilot interruption:** the pilot exec was killed by a poll interruption mid-96702 — no JSON, no process left. Re-ran 96702 alone; deterministic overwrite of its partial transcripts verified by mtime (all 17 files 11:28–11:29Z). 96701 was not re-run.
- **Index clobber struck on BOTH safe-commits** (first D-form + `??`, second MM form, all 4 files each time). Repaired the documented way both times (`git hash-object` == HEAD blob per file, then `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`); verified `git status --short` empty + `git diff HEAD` empty after each repair. Commits were always correct.
- **Run lock deleted mid-run by an unknown agent, restored.** At 11:54Z the lock file (`playtest-loop.lock`, run_id `2026-11-08T10:43:49Z`) was found missing — no duplicate run had started (no `journey-scale` worktree, rotation still `3`, no other playtest process, registry still `active`). Restored byte-identical from the known run_id/timestamp. Deleter unknown; the most likely candidates are a ship-loop or reaper stale-lock cleanup acting while the heartbeat was queueing (see next item). Recorded here so the next run knows to verify the lock file at closeout, not just at creation.
- **Registry lock contention stalled heartbeats twice.** `REGISTRY.lock` is held for the whole of a sibling's `worktree-register.sh` (its slow `git worktree add` runs 10–20 min under load), so heartbeats queue behind registrations. First stall: 11:42–11:58Z (16 min, sibling `sim-healerbisect-mid15-b` registration); second: a `journey2-baseline` registration queued the 12:09Z attempt (killed by a 60s timeout I set — heartbeats must not be timeout-killed, they queue). Heartbeat went ~17 min stale at worst (11:40:49 → 11:58:57Z) but landed as soon as each lock freed; the run stayed `active` in the registry throughout. Lesson for the next run: queue heartbeats early, never timeout-kill them, and expect registration-driven stalls on busy mornings.
- Heartbeat maintained <15 min throughout except the two contention windows above; lock `2026-11-08T10:43:49Z` held for the whole run (with the mid-run deletion + restore noted above).
- **Master moved under the branch during the run** (base `246ce6dc2` → master `d229b58f5` by 11:54Z). Rebase onto the explicit current master SHA before merging, per the stale-base hazard lesson.

## Gate (final)

- Proof test: **44/44 passed** (twice: standalone + queued behind the first registry stall).
- `check.js --quick` run 1: 282 passed, 10 failed in 1290s. Run 2 (output captured to `/tmp/r119-check-full.log`): **286 passed, 6 failed in 534s — exactly the r118 pre-existing set** (measurement-proof-update, measurement-workflow, phone-frame-proof, mobile-combat-cadence, occupation-panels, establishment-r20-fixes incl. the racks-full voice case). The 3 slowest tests from run 1 (synergy-stall, godpath/test-time-save-crashes, godpath/test-solo-campaign-endings — all at the ~120s timeout) all pass standalone and in run 2: load-timeout flakes. Run 1's 10th failure did not reproduce in run 2 — a fourth load flake. **No failure is attributable to this run** (zero `src/js` changes; new scripts unimported; the only scripts-enumerating tests are not quick jobs; the proof test is not a check.js job).
- Telemetry check: quiet (4 files, 4 metrics, no large deviations) — no baseline roll-forward.

## Next

- Leg 3 (scale) next run; rotation already reads `3`.
- Ladder leg 4 owns calibration: cap binds explore, fight mints low, stage-drop behavior under death pressure.
- Trust design call (should deeds alone earn trust from the scholar's death?) stays with the main session — the measurement is done: 18/18 positive payments to known villagers, 0 to strangers, on this panel.
- Exaucee's literacy confession (teach loop crowds out the response path) is a people-check observation for the main session.
