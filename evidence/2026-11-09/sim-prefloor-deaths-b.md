# sim-prefloor-deaths-b — the pre-floor death decomposition (DIAG, zero src/js)

**Arm:** sim-prefloor-deaths-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T1230Z (Loop B, arm 3 of 3) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-prefloor-deaths-b, base master `5e79679e4` · **Prereg:** `evidence/2026-11-09/sim-prefloor-deaths-b-prereg.md` (committed before any judged computation; no corrections after) · **Instrument:** DIAG recorder (`scripts/recorder-sitgap-20261108.js`, read-only) + the 53007 DIAG recorder on the sitstep instrument, winseek policy leg + doorwalk baseline leg (both gates OFF), 150d death-aware, fresh band 55201–55212. Corpora committed under `evidence/2026-11-09/perseed-prefloor-deaths-b/` (winseek, 12 seeds), `evidence/2026-11-09/perseed-prefloor-deaths-b-doorwalk/` (doorwalk baseline, 12 seeds) and `evidence/2026-11-09/perseed-prefloor-deaths-b-unrec/` (G2 controls, 55202 + 55209). Proof `scripts/test-prefloor-deaths-b.js` **86/86 green, 0 failed, 0 skipped**.

## Verdict: DIAG-GO

**The question as asked is answered, and the answer is dominant, not split.** On current master, under winseek play, pre-day-90 deaths are **wild deaths — 118 of 154 (76.6%)** — and the wild deaths are not a diffuse attrition. They are, one for one, **the scholar dying in lost field fights the scholar walked into alone**: 107 lost fights, 90 of them solo (no ally, no party), and **every lost fight kills the scholar (107/107)**. The village does not bleed its people in the wild; it is decapitated, over and over — 112 scholar deaths across 12 seeds (5–13 per village) — until there is no village left to reach the floor. The subset check agrees (deaths in villages ending before day 90: wild 79/109, 72.5%), so the dominance is not an artifact of the villages that survive.

**Status of the bars:** (1) classification complete 12/12 with a dominant class ≥50% + a NAMED lever candidate — MET. (2) G1 det-gate — PASS (proof 86/86). (3) G2 neutrality — PASS on 55202 and 55209 (unrecorded == recorded). (4) G3 corpus integrity — PASS 24/24 (12 winseek + 12 doorwalk). (5) Gate/contradiction flags — PASS (zero sit-verb calls, zero sits, zero doors entered on either leg). (6) Smoke gate — PASS (1 seed per leg in /tmp before the sweep). **All six bars met: DIAG-GO.**

## The named lever: PARTY-UP BEFORE FIELD FIGHTS (winseek fights solo)

The lever candidate for the dominant cause class, named not built (a fix is the next arm):

**Winseek must bring a party to field fights — or not engage wave-3+ fights solo.** The evidence for the shape, all from this run's own corpora:
- The party system is unlocked (860/921 daily rows) but almost never actually present under winseek: a party is with the scholar on **97/921 rows (10%)**, against **933/1324 rows (70%)** on the doorwalk leg.
- Fights WITH support are won far more often on BOTH legs. Winseek: won 30 with support vs 16 solo; lost 17 with support vs 90 solo — a **15% solo win rate (16/106) against 64% with support (30/47)**. Doorwalk: won 153 with support vs 16 solo; lost 59 with support vs 17 solo — 72% vs 48%.
- The doorwalk leg, fighting with support, wins **169 fights against 76 lost**; winseek wins **46 against 107 lost**. Same game, same band, same horizon — the difference is who stands beside the scholar when the fight starts.
- Lost wave-4 fights (55 of the 107) are led by Reunion (14) and The Eulogy (13) — the signature fights winseek seeks for the wave-4 deed bar, walked into alone.

Prereg shape for the next arm (a proposal, not a binding bar): same recorder, same fresh band 55201–55212, winseek + a party-up drive (bring a party to field fights / decline solo wave-3+ engagements); GO = pre-90 wild deaths ≤ 0.6× this arm's control (118) AND floor-reach ≥ 6/12. If parties cannot be formed under winseek's play at all, the arm will find that instead — and the lever becomes party formation itself, a game-side gap rather than a policy gap. The 100%-scholar-death-on-loss rule and Reunion/Eulogy wave-4 lethality are design questions (Steve-call), not this lever: the engine already has a non-lethal loss path (`routed`, 25 fights on this leg), and the lever is about not losing solo, not about softening losses.

## Per-seed classification table (winseek leg — the judged leg)

| Seed | Days | End | Floor? | Fallen | pre-90 | wild | arena | starv | sick | other |
|---|---|---|---|---|---|---|---|---|---|---|
| 55201 | 85 | village-lost | no | 15 | 15 | 7 | 0 | 4 | 4 | 0 |
| 55202 | 103 | village-lost | YES | 14 | 12 | 10 | 0 | 1 | 1 | 0 |
| 55203 | 47 | village-lost | no | 13 | 13 | 10 | 0 | 0 | 3 | 0 |
| 55204 | 40 | village-lost | no | 9 | 9 | 7 | 0 | 0 | 2 | 0 |
| 55205 | 134 | village-lost | YES | 17 | 12 | 11 | 0 | 0 | 1 | 0 |
| 55206 | 70 | village-lost | no | 15 | 15 | 8 | 0 | 0 | 6 | 1 |
| 55207 | 75 | village-lost | no | 12 | 12 | 10 | 2 | 0 | 0 | 0 |
| 55208 | 61 | village-lost | no | 16 | 16 | 13 | 1 | 0 | 2 | 0 |
| 55209 | 90 | village-lost | YES | 13 | 13 | 12 | 0 | 0 | 1 | 0 |
| 55210 | 93 | village-lost | YES | 15 | 8 | 6 | 0 | 0 | 2 | 0 |
| 55211 | 76 | village-lost | no | 16 | 16 | 14 | 1 | 1 | 0 | 0 |
| 55212 | 70 | village-lost | no | 13 | 13 | 10 | 1 | 0 | 1 | 1 |

**Band split — primary set (all pre-90 deaths, n=154): wild 118 (76.6%), arena 5 (3.2%), starvation 6 (3.9%), sickness-disease 23 (14.9%), other 2 (1.3%). Dominant: wild, MEETS the 50% bar.**
**Band split — subset (deaths in villages ending before day 90, n=109): wild 79 (72.5%), arena 5 (4.6%), starvation 5 (4.6%), sickness-disease 18 (16.5%), other 2 (1.8%). Dominant: wild, MEETS the 50% bar.**

**Raw cause census (pre-90 deaths, all causes, nothing hidden):** `the wild` 95, `monster` 15, `a wound that wouldn't close` 14, `sickness` 9, `starvation` 6, `the arena` 5, `a stranger` 3, `ambush` 3, `combat` 1, `Gavel` 1 (wild — signature-monster kill, `monsterName` set), `thirst` 1 (other, named), `contest` 1 (other, named). Fallen entries with a missing day: 0. No `Ad Break`, `The Eulogy`, or `dehydration` deaths fired on this band — the registry covered them, the band did not produce them.

## The mechanism, in the engine's own words

What `the wild` IS: `tbFightDeathCause` (`src/js/game.js`, verified before the prereg) returns `the wild` for a lost field fight against monsters — at least one monster fighter, no hostile fighter, no contest/betrayal/table-trial flag. `monster` (15) is the same family via the hurtVillager path (monster damage context). `a stranger` (3) is the alien-hostile field fight. So the wild class = **deaths in field fights the village loses**, and the cross-check proves it on the numbers: **all 95 pre-90 `the wild` fallen entries fall on a day the scholar died of `the wild`** — the wild deaths ARE the scholar deaths. (The scholar is the player character; a lost fight kills them and succession picks the next scholar.)

The full chain, band-wide (winseek leg):
- 178 field fights: won 46, routed 25, lost 107. Lost by wave: wave 4: 55, wave 3: 22, wave 1: 17, wave 2: 13.
- 90 of the 107 lost fights were solo; 17 had an ally or party. Scholar died in the fight on 107/107 losses.
- 112 scholar deaths total (cause: `the wild` 100, `the arena` 7, `a stranger` 3, `starvation` 1, `sickness` 1); 110 in combat, 101 at Haven. Per seed: 5–13 scholar deaths — every village on the band buried its leader between five and thirteen times.
- The roster does not collapse by attrition: living at day 30 is 9–12 (median 10) on all 12 seeds; by day 60 it is 0–9 (median 8) — the villages are still populated when the scholar carousel breaks them. Mass-wipe days (≥3 deaths in one day) account for only 8 of the 154 pre-90 deaths: this is a steady decapitation, not a wipe mechanic.
- Starvation is 6/154 (3.9%) — food is NOT the binding pre-floor killer on this band, consistent with the re-point. Sickness-disease is the runner-up at 23/154 (14.9%), led by `a wound that wouldn't close` (14) — the second measurement to run, not this verdict.

## The doorwalk baseline leg (gates OFF — no sitting, no door-walking)

Same band, same horizon, the linkfeast substrate with neither table drive armed. The split agrees — **wild 62/92 (67.4%), arena 1 (1.1%), starvation 7 (7.6%), sickness-disease 16 (17.4%), other 6 (6.5%)** — wild dominant on both legs, so the dominant cause is game-side (field-fight lethality), while the death RATE is policy-side (who fights, and with whom). Doorwalk raw census: `the wild` 39, `monster` 13, `sickness` 13, `starvation` 7, `ambush` 4, `a stranger` 3, `a wound that wouldn't close` 3, `thirst` 3, `combat` 2, `contest` 1, `the night` 1, `betrayal` 1, `the arena` 1, `Gavel` 1 (wild). The `other` class is bigger here (6 vs 2) because `thirst` fired 3 times — still named, never hidden.

Doorwalk wall numbers: floor-reach **8/12** (vs winseek 4/12), true median survival **134d** (vs 75.5d), wave-4 unlocks 12/12, wave-5 unlocks 5/12 (vs 0/12), national 0/12, wins 0/12. Doorwalk fights: won 169, routed 30, lost 76, fled 4; lost-by-wave: wave 4: 43, wave 5: 26, wave 1: 2, wave 3: 5 — it loses at the top end, where winseek loses everywhere. Scholar deaths 87 total (vs 112). The substrate gap is the whole story of the floor: villages that fight with a party live ~60 days longer and reach wave 5; villages that fight alone die at a 75d median, 15 days short of the floor.

## Wall numbers (winseek leg — the judged leg)

- Floor-reach **4/12** (55202 d103, 55205 d134, 55209 d90, 55210 d93). Note: 55209 reached the floor day and died ON it — floor-reach by the `gameDays ≥ 90` rule, a death on the floor itself.
- National **0/12**, table sits **0/12** (no seat-walking by design), wins **0/12** (winseek never walks a door by design).
- Wave-4 unlocks **10/12**, wave-5 unlocks **0/12**.
- True median survival **75.5d** (sorted 40, 47, 61, 70, 70, 75, 76, 85, 90, 93, 103, 134).
- Sit-verb calls across both legs: **0**. `takeseatStats.seatTaken` 0 on all 24 corpora; `doorwalkStats.doorsEntered` 0 on all 12 doorwalk corpora.

## Village assessment — what the band's villages looked like (plain words)

Twelve villages, all lost, none surviving past 134 days. They are deed-seekers that die seeking: wave-4 unlocks on 10/12, wave-4 kills on 4 seeds, standing 54–199, regional on all 12, national on none. The pattern is the same on every seed, and it reads like a tragedy of leadership rather than a famine or a plague: the scholar walks out to hunt — the policy sends them, three times a week, into fights they mean to win — and comes home dead, or doesn't come home. Then someone else takes up the scholar's staff, and the same thing happens to them. Five to thirteen times per village. The village itself holds together for a while — nine to twelve people alive at day 30 — but a village that buries its leader every week cannot keep its footing, and by day 60 the roster is thinning and the end is a matter of time. The shortest life, 55204, lasted 40 days with standing 54 and never got past wave 3. The cruelest, 55209, buried eleven scholars and died on day 90 itself, the very day the floor opened. The longest, 55205, lasted 134 days and still never saw the table — it died unseated, like all the rest, because winseek never sits.

On the doorwalk leg the same villages live a different life: the scholar still dies in the wild, but less often, and with people beside them — 169 fights won, wave 5 reached on 5 seeds, four villages still standing at the 150-day horizon. The wild is still the killer there too, but it kills a village that is fighting back as a group, not a leader walking out alone.

## Sense test — three pre-floor deaths, read aloud

**55201, day 83 — Olivia Bennett, the scholar, dies in the wild (her village's fifth scholar death; the village ends day 85).** The death lines land as a sequence, and they cohere: "🕯️ Olivia Bennett is dead — the wild. The village stops. Somebody screams. Somebody else starts digging." Then the consequences arrive in the same breath: "🕯️ Olivia is dead — and the dead hold no treaties. Every link Haven has shakes." Stonebridge "presses the tribute down to 3,000 kcal/week while the chair is empty. They'll test the link. Count on it." "The village's quarrel was with Olivia — and Olivia is dead. The sentence doesn't cross the grave. You're someone else now; the docket is empty, but the village remembers." And the burial: "That night, they bring Olivia home. Nobody asks you to help carry; nobody has to. By morning the grave is dug by the fire, and the body is laid out beside it." This is the succession churn as the villagers experience it: a death, a shaken treaty, a lowered tribute, a wiped quarrel, a grave by the fire — and a new scholar who inherits all of it. The fiction is honest about what the numbers say: the leader dies, the village pays, someone new steps up.

**55209 — eleven scholar deaths, days 33–86, all `the wild`, all in combat, all at Haven.** The village never loses a rank-and-file villager to the wild before day 90 in any number — it loses its scholar eleven times, and on day 90 itself the village is lost. The transcript's shape matches: the death lines are almost all Codex monster-kill notices ("Cliffhanger is dead", "The Living Wire is dead") — the scholar's own fights — punctuated by raids ("Thornfield came in the night… Nobody's dead, but the message is clear") and the fire talk. Nothing reads robotic; what reads wrong is the *policy*: a leader who walks into eleven fatal fights alone while the village watches.

**55204 — the shortest life (40 days, standing 54, wave 3 only).** Nine fallen, seven wild. The village never gets strong enough for the floor to matter: it dies before the deed bars are even in sight. The wild takes it before anything else can.

One instrument note from the sense read (backlog, not verdict): the `deathSays` sample is still polluted — not by "deadfall" anymore (the word-boundary regex fixed that class) but by the Codex kill feed ("📖 The Codex turns a page on its own. Cliffhanger is dead. You didn't ask. It knew." — repeated for every monster kill, dozens per run). The fallen list remains the reliable death record; the deathSays sample in this evidence is quoted only where the line is unambiguously a villager death. (Backlog: restrict the say-wrap death capture to the ledger death line / villager-death verbs.)

## Metric review

- **Metrics held.** The primary metric (cause-class shares of pre-day-90 deaths on the winseek leg) was judged exactly as pre-registered: primary set n=154, wild 76.6% ≥ 50%, lever candidate named; the subset (n=109, wild 72.5%) agrees on dominance, so no judgment call was needed between the two sets. No friendly re-scoring anywhere in this verdict. The doorwalk split is a secondary comparison, not a second primary — its agreement (wild 67.4%) is reported as a finding, and it did not re-pick the dominant class.
- **Analyzer correction (instrument fix, before any evidence was written):** the analyzer's raw-census display called the classifier on a bare-cause synthetic (`{cause: 'Gavel'}`), which printed `Gavel → other` while the real entry (with `monsterName` set) classified wild — the printed census summed to wild 117 / other 3 against the split's wild 118 / other 2. The split itself was never wrong; the display was. Fixed by recording each real entry's class (`rawClasses`) and printing that; the proof gained 3 checks for it (Gavel-with-monsterName wild in split AND census; Gavel-without-monsterName other-NAMED). The corrected census sums exactly to the split on both legs. This is a dated instrument note, not a taxonomy change: no cause was reclassified.
- **Flap incident (2026-11-09 ~13:0xZ):** the doorwalk sweep died on seed 55210's corpus write — `writeFileRetry` exhausted 40 attempts × 15s (~10 min refusal window) and threw loudly (EPERM). No partial corpus was left (the driver refuses to overwrite and the retry verifies by read-back). A git probe (`git update-ref refs/heads/probe HEAD`) was also refused once in the same window, with no stale `probe.lock` present. Response per the flap protocol: no forced writes, no manual ref edits; read work (the full analysis) continued while writes were refused, and seeds 55210–55212 were re-run after evidence-dir writes verified clear — the re-run wrote only the 3 missing corpora (the driver refuses to overwrite the 9 present ones). No data lost, no sim re-run except the 3 missing seeds.
- **The 50% bar did its job.** Wild at 76.6% is not a marginal call — it is three-quarters of all pre-floor deaths. The runner-up (sickness-disease, 14.9%) is far below the bar and is named as the second measurement, not smuggled into the verdict.
- **No metric change proposed.** The registry held: every cause on both bands was registered (`the night`, `betrayal` on the doorwalk leg landed in other-NAMED as the prereg provides for unlisted causes). One follow-up for the next prereg: `the night` and `betrayal` are now observed cause values and should be registered by name (other-NAMED, as observed) rather than left to the unlisted rule.

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

- (a) **PARTY-UP BEFORE FIELD FIGHTS — the named lever for pre-floor deaths (this arm).** Pre-90 deaths under winseek are wild 76.6% (118/154), and the wild deaths are scholar deaths in lost field fights: 107 lost fights, 90 solo, every loss kills the scholar; the party is unlocked but present only 10% of days, against 70% on the doorwalk leg, where fights are won 169–76. Next arm prereg shape: same recorder, same fresh band 55201–55212, winseek + party-up drive; GO = pre-90 wild deaths ≤ 0.6× control (118) AND floor-reach ≥ 6/12. If parties cannot form under winseek's play, the lever becomes party formation itself. (DIAG finding, not built here.)
- (b) **Sickness-disease is the runner-up (23/154, 14.9%), led by `a wound that wouldn't close` (14).** The second measurement: wound/sickness deaths before the floor — a medic/wound-care lever candidate once the party-up arm lands or stalls.
- (c) **`the night` and `betrayal` are now observed fallen causes** (doorwalk leg, 1 each) — register them by name in the next classifier prereg (other-NAMED, as observed).
- (d) **The `deathSays` sample is still polluted by the Codex kill feed** ("📖 The Codex turns a page… X is dead" for every monster kill, dozens per run) — the word-boundary regex fixed the "deadfall" class but not this one. Restrict the say-wrap death capture to the ledger death line / villager-death verbs before the next driver reuses it.
- (e) **Every lost field fight kills the scholar (107/107 on this leg; 76/76 on the doorwalk leg).** Whether that should stand is a design question (Steve-call), not this arm's lever — the engine already has a non-lethal loss path (`routed`).

## Convergence state

**converging** — the day-90-floor survival half is now decomposed with a named lever (party-up before field fights), and the sit half is already fixed by the sit drive. The axis (scale-onramp / winnability chain) is NOT converged: national stays 0/12 on both legs, wave-5 stays 0/12 under winseek (5/12 on the doorwalk leg), wins stay 0/12, and the floor-reach under winseek is 4/12 at a 75.5d median. Next work on this axis is the party-up build (see Findings (a)), not more death measurement.

## Proof

`node scripts/test-prefloor-deaths-b.js` — **86/86 green, 0 failed, 0 skipped** (run after the corpora were committed-present: G1 classifier fixtures for all five classes + the monsterName rule + the Ad Break / The Eulogy / dehydration registrations + unknown-cause → other-named + the raw-census real-entry-class checks; broken-classifier sensitivity ×3; G2 real neutrality on 55202 + 55209; G3 real integrity on all 24 band corpora + the driver write-retry round-trip + real-sim legs on seed 55201 for both legs, gate-config proven live: zero sit-verb calls, zero sits, zero doors entered). Analyzer: `node scripts/analyze-prefloor-deaths-20261109.js evidence/2026-11-09/perseed-prefloor-deaths-b evidence/2026-11-09/perseed-prefloor-deaths-b-doorwalk evidence/2026-11-09/perseed-prefloor-deaths-b-unrec` — full output saved at `/tmp/prefloor-analyze-full.txt` (read work, not committed).

## Files committed with this evidence

- `evidence/2026-11-09/sim-prefloor-deaths-b-prereg.md` (already committed: `e919b2753`)
- `scripts/prefloor-deaths-driver-20261109.js`, `scripts/analyze-prefloor-deaths-20261109.js`, `scripts/test-prefloor-deaths-b.js` (new: driver, analyzer, proof — instrument commit `7d57e546a`, plus the analyzer census-display fix + 3 proof checks, this commit)
- `evidence/2026-11-09/perseed-prefloor-deaths-b/` (12 winseek corpora), `perseed-prefloor-deaths-b-doorwalk/` (12 doorwalk-baseline corpora), `perseed-prefloor-deaths-b-unrec/` (2 G2 controls)
