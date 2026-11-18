# sim-fieldcarrier-a — Rage carrier ported to the field engine: pilot NO-GO, THIN-POOL

**Run:** fleshout-20261118T1515Z, Loop A arm sim-fieldcarrier-a
**Finding #2552 verdict: NO-GO, THIN-POOL** (per frozen prereg — no confirm, no re-score)
**Branch:** `sim-fieldcarrier-a`, worktree `~/workspace/worktrees/sim-fieldcarrier-a`
**Prereg:** `evidence/2026-11-18/sim-fieldcarrier-a-prereg.md` (frozen 2026-11-18 ~12:13 CST, before any sims)

## Verdict in plain words

The Rage damage multiplier now works in the off-screen field fights — the carrier fires, the fighter's eyes go red, and their strikes hit two-and-a-half times as hard. But it fires almost nowhere that counts: in 8 villages over 150 days, only **2** launched-party meetings happened where the party actually showed up whole, and neither ended in a kill. The question the arm was asked — does the carrier move the kill share? — is still unmeasurable on this band, because the launched party is almost never present at the fight. The binding constraint is now party presence (the sense problem), not the carrier. One fight came close: Aroha took a wave-4 Algorithm down to 26% of its health with the carrier firing, the nearest thing to a win the multiplier has produced — but that is one fight, not a verdict.

## 1. What was built (finding #2552)

The dmg arm (sim-fightcap-dmg-a) built the carrier in the turn-based board fight (`game.js` `tbVillagerAbility`, commit `b9a2a295`) and it never fired, because launched-party meetings resolve in the off-screen field-fight engine. This arm ported it:

- `src/js/godpath.js` `fieldBegin(game, vid, vAbs, wave)` — new 4th arg `wave` (missing/0 ⇒ carrier never applies, safe default). When `FIELDCAPDMG=1`, wave ≥ 4, `rage` NOT in `vAbs`, the holder has a `winPlan[vid]` with a non-empty party AND an `agencyState().exped[vid]` present: sets `held.rage = true` + `carrierRage: true` on the per-fight state `G`. No ability granted; no slot, no persistence. No adjacency check (a field fight IS the engagement — recorded difference from the TB carrier). Rage carries no `modifiers` in `src/data/abilities.json`, so strikeMult/power/dodge/armor are untouched.
- `src/js/godpath.js` `fieldAct` Rage branch: when it fires with `G.carrierRage`, sets `G.carrierRageFired = true`. The effect is exactly real Rage via the existing branch: `nextMult = 2`, `nextN = 3`, same voice line, honest 60 kcal paid via `fieldPay` (`unleash_rage`); `fieldStrike` consumes `nextN`.
- `src/js/fieldFights.js`: lead call site (~658) passes `wave`, records `rec.carrierRageHeld` / `rec.carrierRageFired` (set live after each `fieldAct` call so every return path carries it); ally call site (~1329, inside `allyGear`, numbers-only) passes `wave` for consistency — inert for allies since they never run `fieldAct`. The TB carrier in `game.js` is untouched.
- Commit `e3a77c411` `[needs-eyes]` (carrier + proof test). The held launchparty-sense substrate (`480168a58`) was NEVER landed and NEVER cherry-picked; the held TB carrier (`b9a2a295`) is a mechanism reference only. Both legs run current master + landed env flags `VETREENGAGE=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`; `LAUNCHPARTY` and `PARTYSIZE4` are NOT set.

**Carrier-fire detection (finding #2553):** the snapshot proxy is RETIRED (it false-fired on real Rage in the dmg pilot). Detection is engine-side only: `fieldAct` Rage branch firing with the carrier marker sets `G.carrierRageFired`; `fieldFights.js` carries it onto the fight record; the driver copies it to the encounter row (`row.carrierRage`); the analyzer counts rows with `carrierRage === true` inside the judged population.

**Proof test** `scripts/test-fieldcarrier-a.js`: **38/38**. Determinism (same rng seed twice, flag ON and OFF — full-rec JSON identical); carrier fires on a launched holder vs a wave-4 Eulogy (held + fired true, Rage line, doubled strikes at x2.5 = Rage 2.0 × fed 1.25, hunger 0→2 = 60 kcal paid); failing control (flag OFF: held/fired false, no Rage line, no strike ≥ x2.0); guards (no plan / no expedition / empty party / wave-3 spool / holder WITH real Rage → marker stays off); `fieldBegin` unit checks (incl. no-wave-arg safe default); consumption (fieldAct sets nextMult 2/nextN 3/used.rage 1; fieldStrike gives exactly 20, 20, 20 then 10 from base 10 with power 1). Fixture lesson: the Eulogy trick is learned village-wide after 2 survived encounters, and a known trick displaces `fieldAct` (the villager "works the trick", never rages) — the test orders the carrier-fire case first (fights #1–2, trick-unknown).

**Regression checks (all green):** `analyze-fieldcarrier-a.js --selftest` 12/12 (incl. engine flag counted even when the snapshot lists rage; Rage token + snapshot rage without engine flag NOT counted; kill-share move with 0 fires is NOT a GO); `analyze-fightcap-dmg-a.js --selftest` 10/10; `analyze-fightcap-a.js --selftest` 20/20; `test-abilityfirst-a.js` 43/43; `test-ability-gaps.js` 16/16; `test-godpath-villagers-20261014.js` 58/58; `test-aidleave-b.js` ALL PASS.

**Tooling** (commit `bceb0e433`): `scripts/fieldcarrier-driver-a.js` (copy of the dmg driver; MODE ⟺ FIELDCAPDMG; sense-substrate + PARTYSIZE4/LAUNCHPARTY assertions REMOVED; records `godpathSha`/`fieldSha`/`carrierPresent`/`fieldcapdmgOn`; rows carry `carrierRage`/`carrierRageHeld`), `scripts/analyze-fieldcarrier-a.js` (reuses `legStats` from `analyze-fightcap-a.js`; new judge + engine-side `carrierRageMeetings(dir, pairDetail)` joining on seed|day|vid|mid), `scripts/build-fieldcarrier-panels-a.js`.

## 2. Frozen bars (prereg)

- **Primary:** pair-inclusive kill share — engaged wave-4+ expedition meetings, launched party present, `|planParty| ≥ 1`, kill = `vKill` only.
- **GO requires:** arm kill share ≥ 0.25 AND ≥ 2× ctl on identical seeds (ctl 0 kills ⇒ ratio passes iff arm kills > 0) AND pool floor arm pair n ≥ 10 AND cost bars pass.
- **Cost bars:** community loss arm share ≤ ctl + 0.125; starvation arm ≤ ctl + 2 totals AND villager-only; median survival arm ≥ 0.8× ctl median; instrument errors 0.
- **Mechanism check (gates GO):** arm carrier fires > 0 AND ctl carrier fires == 0, inside the judged population.
- **Verdict ladder:** pool met + bars met + costs pass → GO; pool met + bars missed / cost fails → NO-GO; pool missed (arm pair n < 10) → **NO-GO THIN-POOL, inconclusive**.
- Pilot band 104601–104608 is a DELIBERATE matched-band reuse (same band as the dmg pilot — identical-seeds before/after design, §15; not a fresh band). No confirm band was spent (pilot NO-GO).

## 3. Pilot numbers (8 seeds 104601–104608, 150d, competent; both legs exit 0, 8 corpus files each, 0 instrument errors)

Corpora: `evidence/2026-11-18/perseed-fieldcarrier-a-{ctl,arm}/`; logs `fieldcarrier-a-{ctl,arm}.log/.err`; analysis `evidence/2026-11-18/fieldcarrier-a-analysis.json`. Corpus flags verified: ctl `fieldcapdmgOn` false, arm true; `carrierPresent` true both; `sensePresent` false, `launchpartyOn` false both (substrate absent as designed). Anchor `bceb0e433011`, godpathSha `3832dcab2400`, fieldSha `dda9c1c49fb9`.

| Bar | Ctl | Arm | Pass? |
| --- | --- | --- | --- |
| Pool floor (arm pair n ≥ 10) | 2 | **2** | **NO** |
| Kill share (pair-inclusive) | 0.000 (0/2) | **0.000 (0/2)** | NO |
| Kill-share ratio ≥ 2× (ctl 0 ⇒ arm kills > 0) | — | 0 kills | NO |
| Trio+ pool | 0 | 0 | — |
| Carrier fires in judged population | 0 | **0** | NO (mechanism) |
| Community loss | 3/8 | 2/8 | yes |
| Starvation (total / villager-only) | 2 / 2 | 2 / 2 | yes |
| Median survival | 150d | 150d | yes |
| Instrument errors | 0 | 0 | yes |

**Verdict: NO-GO, THIN-POOL.** The pool floor fails (2 < 10), so the kill-share question is inconclusive by the frozen ladder. Cost bars all pass.

### Funnel (pair-inclusive)

| Step | Ctl | Arm |
| --- | --- | --- |
| Wave-4+ expedition encounters | 19 | 20 |
| No launch plan | 0 | 0 |
| Party absent at the meeting | 12 | 12 |
| Evades (rounds 0) | 5 | 6 |
| **Engaged (judged population)** | **2** | **2** |

The pre-registered pool-floor risk materialized worse than the 0.48-arrival estimate: without the sense fix the launched party is absent from 12/19–20 meetings (vs 0/32 in the dmg pilot with the fix).

### The 2 judged meetings (bit-identical on both legs)

- **104604 d65 Ruby Callaghan vs Audit** — vFlee, 5 rounds, 200/1226 HP (16%). Carrier held but never fired (§5).
- **104605 d53 Maricela vs Influencer** — vFlee, 6 rounds, 265/871 HP (30%). The lead rages in R1 on both legs — her **real** Rage, gained after the 30-day snapshot (which still lists `the_touch`); the carrier marker stays off and the detector does not count it. This is the #2553 detector working as designed: real Rage present, carrier fire not claimed.

Population damage shape (both legs identical): damage share mean 0.234, rounds mean 5.5, villager damage taken mean 74.5, party size 3, min armor 14, mean armor 22.3, monster HP at start mean 1048.5, abilities per member 0.83, fighter damage share 0.70, parsed strike total mean 120. Same shape as the dmg band (~50/round, flee at ~4 rounds).

### Per-seed table

| Seed | Ctl (days / end / standing / wave) | Arm (days / end / standing / wave) |
| --- | --- | --- |
| 104601 | 150d survived 199 w4 | identical |
| 104602 | 134d village-lost 170 w4 | identical |
| 104603 | 150d survived 199 w4 | identical |
| 104604 | 68d village-lost 150 w4 | identical |
| 104605 | 150d survived 350 w5 | identical |
| 104606 | 150d survived 365 w5 | **150d survived 199 w4** |
| 104607 | 150d survived 600 w5 | identical |
| 104608 | 150d village-lost 485 w5 | **150d survived 385 w5** |

6/8 seeds bit-identical. **104606 diverged** (standing 365→199, wave 5→4); **104608 diverged** (village-lost→survived, deaths 104→89, standing 485→385). The carrier changed trajectories on 2/8 seeds, in opposite directions. Deaths: ctl total 671, arm total 656 (per-seed: 82/79/113/58/80/82/92/104 ctl vs 82/79/113/58/80/82/92/89 arm).

### Wall numbers

National 0/8 both; table not instrumented (null, never faked); wins 0/8 both; wave-4 unlock 8/8 both; wave-5 ctl 4/8, arm 3/8; median survival 150d both.

## 4. The carrier DID fire in the wild (outside the judged population)

Arm leg: **16 held, 6 fired**; ctl: 0 held / 0 fired. All 6 fires ended `vFlee`, 0 kills. 4 expedition-origin, 2 world-tick.

| Meeting | Rounds | Damage dealt | Notes |
| --- | --- | --- | --- |
| 104606 d143 Aroha vs Algorithm | 12 | **794/1080 (74%)** | closest to a win; no ctl counterpart (trajectory diverged) |
| 104608 d95 Katarina vs Reunion | 4 | 327/1233 (27%) | ctl counterpart 209 — carrier added +118 (+56%) |
| 104608 d129 Mia vs Reunion | 3 | 48/1292 (4%) | no ctl counterpart |
| 104608 d134 visjoin_125 vs Algorithm | 9 | 336/1015 (33%) | no ctl counterpart |
| 104606 d125 Desmond vs Strike (world-tick) | 5 | 59/1000 (6%) | |
| 104608 d96 Hassan vs Reunion (world-tick) | 1 | 0/1174 (0%) | Rage line fired, no strike landed before fleeing |

**Why the 4 expedition fires are not in the judged population** — the launched party was absent at each meeting (presence rule: |planParty| ≤ 2 ⇒ every plan member must be in allyVids):

- 104606 d143: planParty [desmond_clarke, gen_wwrl9ia] vs allyVids [gen_nxz5n74, gen_wwrl9ia] — only 1 of 2 plan members present.
- 104608 d95: planParty [mia_andersson] vs allyVids [gen_1g3pz98, gen_1i6jgy5] — 0 present.
- 104608 d129: planParty [visjoin_125, gen_1g3pz98] vs allyVids [gen_1i6jgy5, dmitri_sokolov] — neither present.
- 104608 d134: planParty [mia_andersson, gen_1g3pz98] vs allyVids [mia_andersson, gen_1i6jgy5] — 1 of 2 present.

The carrier fires on the holder regardless of party presence (by design — holder + plan + expedition + wave), but the population filter (presence) excludes them. This is the sense problem biting the measurement a second time: the carrier's population is the party-present meetings, and the party is almost never present without the fix.

## 5. Sense-testing — reading the carrier firing

**104608 d95 Katarina vs Reunion — the cleanest paired comparison.** Arm: "R1: Katarina's eyes go red. Next 3 strikes hit twice as hard. (Rage)" then strikes of 73, 80, 80 at x2.5. Ctl (same meeting, same 4 rounds, same allies): R1 she tries a Walk In that fails, then strikes of 38, 36, 39 at x1.2–1.3. Total 327 vs 209 — the carrier added +118 damage (+56%) on the identical meeting. It reads exactly like a fighter burning bright: she rages on round one, hits three times as hard as her other self, calls in Mawuko and Wanda when she starts losing, and still flees at 16 HP — "Katarina sees how this ends — and runs while running still works." The party stays through the fight (both allies arrive and strike); it is the lead who flees, when her health is nearly gone. The carrier worked and still was not enough: 327/1233 is 27% of the monster's health, ~900 short of a kill. This is finding #2554 in the flesh, now with the carrier actually firing: a doubled strong base (~30 → ~75) adds ~118 damage against ~1,200 HP.

**104606 d143 Aroha vs Algorithm — the near-kill.** 12 rounds, 794/1080 (74%). The transcript opens with a bow volley (16+15), then "Tanking the prediction" (the Algorithm's trick) and strikes of 70–71 at x1.2–1.3, "holds the line — working the trick". The Rage fire's round and doubled strikes sit in rounds 6–12, past the driver's 20-line log cap — the capped log is a recorder limitation, recorded here so the next arm knows the transcript tail is unread. No ctl counterpart exists (the trajectories had already diverged). The near-kill suggests the multiplier CAN carry a fight when the party actually fights — but n=1, not a verdict.

**104608 d129 Mia vs Reunion.** R1 eyes go red, but R2 she is at 22 HP and stops to bind the wound (field medicine) instead of striking; R3 one doubled strike, 32 (x2.0), then she flees. The carrier fired on a dying fighter and bought one strike. Rage does not save a fight that is already lost.

**104606 d117 Desmond vs Eulogy and 104604 d65 Ruby vs Audit — held but never fired.** Of the 16 held rows, 6 are evades (rounds 0 — the fight never started), 1 is an aid-origin fight (2 rounds, 0 dealt), 1 is the rounds-0 vKill artifact (excluded by the engaged filter), and 8 are engaged fights — 6 fired, 2 did not (Ruby d65, Desmond d117). Both unread-fire transcripts show plain strikes every round and no verb at all (Desmond strikes 15, 13, 12, 13…; Ruby 40, 39, then field medicine, then 21 "audited — half strength"). A probe (`/tmp/probe-fieldcarrier-gates.js`, scratch, not committed) verified both candidate gates as live code paths: a food tier of `tight` (while the fighter is above 40% HP with fewer than 2 live monsters) or `starving` makes `fieldAct` return before any verb, and hunger 79 blocks the 60-kcal pay (`hunger + 2.4 ≥ 80`); `tight` + HP at 30% fires normally. The corpus records neither tier nor hunger, so the two cases are undetermined between the gates. The finding stands either way: **the carrier is food-gated twice over** — on a hungry village it may never fire. The next arm should instrument tier and hunger on the encounter row.

**Trick interaction (secondary observation):** a learned trick displaces `fieldAct` — the villager works the trick instead of raging. In the proof test this forced ordering the carrier-fire case before the trick was learned; in Aroha's fight the trick consumed rounds 1 and 4 while the carrier still fired in a later round. Trick knowledge and the carrier compete for the same turn.

## 6. §15 balanced panel

`node scripts/build-fieldcarrier-panels-a.js` then `node scripts/balance-panel.js compare` → `evidence/2026-11-18/fieldcarrier-a-panel.md`, decision **review_required**, 8 paired cases, no material signal on any metric: village deaths −1.875/run, community loss −0.125 (3/8 → 2/8), national 0 → 0, table win rate 0 → 0. The panel is the instrument; the frozen bars are the judge (NO-GO THIN-POOL).

## 7. Metric review

The bars were frozen before any sims and are not re-scored. The pool floor (arm pair n ≥ 10) fails at 2, so the verdict is NO-GO THIN-POOL by the ladder — the kill-share question is inconclusive, not answered. Nothing in the wild-fire data changes that: the 6 fires all ended in flight, 0 kills, and none of them are in the judged population. The one paired comparison (Katarina d95, +118 damage, still fled at 27%) and the one near-kill (Aroha d143, 74%) are the only effect evidence, and both point the same way: the multiplier moves damage a lot and kills nobody on this band, because the fights end in flight at ~4–6 rounds with the monster at 70–85% health. Per the task's finding #2554 context, the next question is the base strike or the winning shape, not a bigger multiplier — and per §4, the question before that is party presence: no population, no verdict.

## 8. Telemetry deviation check

Not run — the baseline file `evidence/2026-11-18/telemetry-baselines/scale-wall.json` does not exist in this worktree (`find` returns nothing), so the check could not run as specified. The dmg arm's identical check refused recorder-corpus input (all rows carry top-level anchorCommit); recorder corpora are compared with sweep-compare tables, never against a run baseline here. Baseline NOT rolled.

## 9. What this means / next question

1. **The carrier works.** Engine-side detection proves it fires in real field fights (6 fires, 0 on ctl), doubles strikes, pays the honest 60 kcal, and the detector cleanly separates carrier fires from real Rage (Maricela d53). The TB carrier's never-fired problem is solved.
2. **The kill-share question is still open.** It cannot be answered until the judged population exists — that needs the launched party to actually arrive, which is the sense substrate's job (held commit `480168a58`, never landed here). Re-running this band without it would re-measure the same empty pool.
3. **When it fires, it is not enough on its own.** Paired: +56% damage, still fled at 27%. Near-kill: 74% with a strong fighter and 12 rounds. The flee is the wall — fights end at ~5 rounds with the monster mostly unhurt. That is a base-strike / winning-shape question (finding #2554), not a multiplier question.
4. **Two food gates sit on top of the carrier.** A tight or starving village, or a hungry holder, never fires at all (§5). Any future carrier measurement should instrument tier and hunger per encounter.

## 10. Files and commits

- Prereg: `evidence/2026-11-18/sim-fieldcarrier-a-prereg.md` (commit `9846098e7`)
- Carrier + proof test: `src/js/godpath.js`, `src/js/fieldFights.js`, `scripts/test-fieldcarrier-a.js` (commit `e3a77c411` `[needs-eyes]`)
- Driver + analyzer + panel builder: `scripts/fieldcarrier-driver-a.js`, `scripts/analyze-fieldcarrier-a.js`, `scripts/build-fieldcarrier-panels-a.js` (commit `bceb0e433`)
- Evidence (this file) + analysis + panel: committed with this evidence (see commit below)
- Corpora + logs: `evidence/2026-11-18/perseed-fieldcarrier-a-{ctl,arm}/`, `evidence/2026-11-18/fieldcarrier-a-{ctl,arm}.log/.err`
- Scratch probes (not committed, `/tmp`): `/tmp/probe-fieldcarrier*.js`, `/tmp/fc-count.js`, `/tmp/fc-detail.js`, `/tmp/fc-logs.js`, `/tmp/fc-held.js`, `/tmp/fc-desmond.js`, `/tmp/probe-fieldcarrier-gates.js`

**HELD:** launchparty-sense substrate `480168a58` (never landed, never cherry-picked); TB carrier `b9a2a295` (mechanism reference only). Finding #2552 verdict for the coordinator: **NO-GO, THIN-POOL** — carrier proven to fire in the field engine; kill-share question still open pending a population where the party is present.
