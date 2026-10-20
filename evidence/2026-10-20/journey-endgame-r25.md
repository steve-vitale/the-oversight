# Journey ENDGAME R25 (2026-10-20) — HEROIC OFFER RATE: the channel is viable

**Run id:** run-20261020T065549Z (oversight-playtest-loop-2, lane B). Worktree: `journey2-4b` (journey2-4 was held by a dead 05:59Z instance of this loop — registered, never heartbeated after registration, no lock held; left for the reaper).
**Base:** master 82ed12748 at registration (rev-parse verified match). Rotation file read 4 (endgame); this run plays leg 4 per the file (the authority — r19–r24 all claimed to advance it and the file never moved) and advances to 5 at the end, verified.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question:** HEROIC OFFER RATE — r24's named next #1. r23 wired arenaAct (heroic contest picks → protected +1..+3) and r24 fixed the party channel, but no heroic contest choice was OFFERED in r24's 238 run-days. This run measures the offer rate across 10 fresh seeds: for every contest choice presentation, record contest id, phase, the full choice set (labels + notability flags), whether a heroic option (sacrifice/gallant/principled) was offered, and what the driver picked. The capable scorer plays contests naturally — NO QUIET/HEROIC steering, because r24's refuse-early wrapper would hide later-phase heroics (and did: see below).

**Interesting-finding bar:** either (a) heroic options surface at a measurable rate with the gate identified (which contests, which phases, what fraction) — or (b) the offer rate is 0 across 10 seeds AND the code path is identified (scheduling never picks price/exchange/auction, or the phases are never reached).

**Pre-registered offer-rate bar (r24 asked for one):** the heroic channel is VIABLE if ≥1 heroic option is offered per run on average (a protection-first player would see it); DECORATIVE if 0 across all 10 seeds; RARE in between (then the gate analysis is the finding).

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 instrument GO: 100% of contest choice presentations recorded (contestId, phase, choices, heroic flag) on 100% of runs.
- M2 offer-rate GO: heroic-present presentations / total presentations across 10 seeds; contest-entry mix recorded.
- M3 people GO: ≥2 sense-reads of contest beats; 0 senseless flags.
- M4 census GO: all runs end cleanly (win / honest loss); no crash/softlock.
- M5 guardrail GO: table announce rate consistent with r19–r24 shape (no instrument perturbation).

**Seeds:** pilot 9035–9036 (fresh); expand 9037–9044. **Horizon:** 260 loop-days, death-aware. **Stack:** r24's seat-driver tip + titan driver with stand-down hook (TRIBFLOOR=1 WINDEFER=1 FEASTSCALE_R13=1 BELONG_V3=1, set BEFORE any require — r18's lesson). No PATHFORCE (natural DOORS order), no HEROIC, no party steering.

## DECISION LIST (my calls — Steve corrects)

1. **R25's question: the heroic offer rate** — r24's named next, measured not steered. The capable scorer plays every contest it isn't too hurt for, so the number is the honest competent-play offer rate.
2. **Fixed the death-path pricing gap in game code** (src/js/contests.js): a heroic choice whose damage kills the player died via `_contestDie`'s early return with the notability/arenaAct hook never firing — the village watched the sacrifice and the ledger never heard of it. The notability block now fires on the ACT (right after the choice's note, before damage resolves). Proof RED→GREEN (scripts/test-arenaact-on-death-20261020.js, 10/10; RED verified via patch-revert, no stash).
3. **No baseline roll-forward** (same call as r23/r24): the endgame baseline is an 8-seed measurement; this 10-seed probe is a different instrument, and nothing deviated.

## RESULTS

### The offer rate (10 seeds, 110 contests, 419 presentations)

| seed | days | won | door | contests | presentations | heroic offered | heroic picked | show | prot |
|------|------|-----|------|----------|---------------|----------------|---------------|------|------|
| 9035 | 90 | yes | feared/light | 12 | 43 | 1 | 0 | 17 | 0 |
| 9036 | 90 | yes | feared/light | 9 | 32 | 0 | 0 | 21 | 0 |
| 9037 | 91 | yes | feared/light | 9 | 39 | 1 | 0 | 18 | 0 |
| 9038 | 90 | yes | feared/light | 10 | 37 | 1 | 0 | 25 | 0 |
| 9039 | 90 | yes | feared/light | 10 | 38 | 2 | 2 | 19 | 3 |
| 9040 | 134 | no | — | 14 | 54 | 2 | 2 | 30 | 6 |
| 9041 | 90 | yes | feared/light | 14 | 51 | 1 | 0 | 26 | 0 |
| 9042 | 91 | yes | feared/light | 10 | 35 | 2 | 2 | 26 | 6 |
| 9043 | 71 | no | — | 9 | 36 | 0 | 0 | 11 | 0 |
| 9044 | 126 | yes | feared/light | 13 | 54 | 1 | 0 | 20 | 0 |

- **M1 GO:** 419/419 presentations recorded with contest id, phase, full choice sets, heroic flags, and picks, on 10/10 runs.
- **M2 GO:** 11 heroic offered / 419 presentations = 2.6%; **1.10 heroic per run ≥ 1.0 bar → VIABLE.** The heroic contests all fire in the wild: price (2 runs), exchange (2 runs), auction (3 runs).
- **The two heroic kinds:** price's heroics ('Volunteer' sacrifice, 'Take it, if chosen' sacrifice) are *free* heroics — attached to contest progress/WIN, so the reward-optimizing scorer picks them 6/6 when offered. Auction's 'Walk away' (principled) and exchange's 'Fall short' (gallant) are *costly* heroics — terminal LOSE choices; the competent baseline never picks them (0/5 offered). A protection-first player must deliberately lose. The channel is viable, but only the price half is free.
- **M3 GO:** 3 sense-reads (auction arc, exchange relay, price death); 0 senseless flags. Details below.
- **M4 GO:** 8 wins, 2 honest losses (9040: starvation scatter d134; 9043: starvation scatter d71). No crash/softlock.
- **M5 GO:** 8/10 tables announced ~d90, feared/light — r19–r24's shape reproduced.

### Where the heroic protected came from

- 9039: protected=3 — 'Volunteer' picked and priced (+3); 'Take it, if chosen' picked but its 60 damage KILLED Howard and the old code skipped the pricing (the bug). Post-fix both price.
- 9040: protected=6 — both price heroics picked and priced (Rachel survived both).
- 9042: protected=6 — both price heroics picked and priced.
- Auction/exchange heroics: offered 5×, picked 0× — the scorer won't lose on purpose.

## BLANK FILLED: heroic deaths skipped the broadcast pricing

**Found:** in `Game.contestChoose` (src/js/contests.js), the notability/arenaAct block sat AFTER the `d.dmg` block. A heroic choice whose damage killed the player returned early via `_contestDie` — the notability never fired. Measured in the wild on 9039: Howard picked 'Volunteer' (priced, +3) then 'Take it, if chosen' — the 60 damage killed him and the sacrifice never hit the ledger (protected ended at 3, not 6). The village watched him die for them on camera; the leadership vector recorded nothing. The most heroic outcome was the one that didn't count.

**Fixed (worktree, src/js/contests.js +28/-21):** the notability/arenaAct block moved to fire on the ACT — right after the choice's note, before damage resolves. The cameras witnessed the choice; damage/death is the consequence and must not skip the pricing.

**Proof:** scripts/test-arenaact-on-death-20261020.js — 10/10 GREEN on fixed code; RED verified via patch-revert (2 failures, exactly the bug: protected 0→0, no arena record on the lethal pick). Also asserts the surviving path prices exactly once (no double-fire) and non-wired notabilities (showmanship) are untouched.

**Why r24 saw zero:** r24's HEROIC wrapper refused optional contests at the choice screen whenever no heroic option was present — and auction/exchange heroics live in LATER phases (auction phase 2–3, exchange phase 2). The wrapper never gave those contests a chance to reach their heroic phases. The instrument hid what it was looking for. (Price's phase-0 heroic would have been picked, but price simply didn't fire in r24's 238 days — scheduling chance.)

## People check (M3 GO — 3 sense-reads, 0 senseless flags)

1. **The Auction (9035, d17–19):** "Bid with memories, years, or body parts. Everyone pays their bid." The player bid "the summer afternoon — the whole thing... You remember remembering it. The shape is gone," won, and the beat lands the cost: "YOURS. The tech is extraordinary. You are... less. But the village eats this winter." The 'Walk away' (principled) heroic was offered at phase 2 and declined for the win — a real choice with a real price on both sides. Sensible.
2. **The Exchange (9038, d41–43):** a relay through the badlands, three legs, real damage each leg ("You take 20... 21... 26 damage"), "Your village is screaming your name," won "by a breath." The 'Fall short' (gallant) heroic was offered mid-race and declined. The race reads as a race. Sensible.
3. **The Price (9039, d77):** Howard volunteers ("You step forward. 'Me.' The silence is total."), the broadcast prices it ("Howard: sacrifice — Volunteer. (The village watches the broadcast. Nobody blinks.)"), the village votes, his name is called, "You take 60 damage... The damage was too much... The village will argue about that vote for a generation. It won't bring you back." The mantle passes to Dawei Jia; the village grieves a specific person. This is the heroic-death beat the fix protects. Sensible — and now priced.

## Village assessment (census in plain words)

- Eight villages won at the table (feared/light, all lesser seat), whole or nearly whole — the seat-driver's competent shape holds.
- **9039 — the village that paid the price:** Howard Hill volunteered at the Price and died on camera d77; Dawei Jia took the mantle the same day and carried the village to a feared/light win d90. The price had a face, and now (post-fix) the ledger knows it.
- **9040 — the village that starved:** Rachel's village fought the price twice and lived (protected=6), but the pantry ran dry and Haven scattered d134 on the fifth hungry day. The heroic channel doesn't fill stomachs.
- **9043 — the short run:** scattered d71, pantry empty on day 3 of hunger. The food engine decided this one early, as it does.

## Reachable / Fun / Winnable

- **REACHABLE:** heroic options are offered ~1.1×/run in natural competent play (auction 3/10 runs, exchange 2/10, price 2/10). The price heroics are picked by any reward-seeking player; the auction/exchange heroics require deliberately losing — reachable by a protection-first player who knows the trade, which is the intended play.
- **FUN:** the three heroic contests are three different games (the auction's memory-bidding, the exchange's relay, the price's vote-and-sacrifice), and the beats are voiced with real costs. The heroic-death beat on 9039 is among the strongest systems writing in the game.
- **WINNABLE:** 8/10 won, all feared/light on the lesser seat. The heroic channel feeds the beloved-light branch (protected accrual) without breaking the win path.

## Regression

- New proof test: 10/10 GREEN (RED verified via patch-revert).
- `node scripts/check.js --quick` (--cacheDirectory=/tmp/jest-cache-playtest2): PENDING — running at note time; result appended below.
- `node --check` on the edited contests.js: clean (proof test loads it).

## TELEMETRY DEVIATION CHECK

`telemetry-check.js` vs `hidden_files/telemetry-baselines/endgame.json` (8-seed seat-driver baseline): **quiet** — wins 8, table 8, tableSceneFired 8, tableSceneCompleted 8, seatApproach 8 (no large deviations vs baseline 7/8). Baseline NOT rolled forward (probe instrument, same call as r23/r24). Evidence: `evidence/2026-10-20/tele-r25-aggregate.json`.

## METRIC REVIEW (§14)

- M1–M5 all GO. No re-scoring.
- Pre-observation correction (not a re-score): the driver's EVIDIR was hardcoded to 2026-10-19 from the r24 copy — pilot files landed there and were moved to 2026-10-20 before the expansion; no data lost, no rerun needed.
- A service restart mid-run killed the expansion driver after seed 9044's files were written but before the summary line — all 10 seed files intact; summary regenerated from the seed files (no data invented).
- The RED→GREEN used patch-revert, never stash (hot-tree discipline).
- Kill taxonomy: no kills this run. The notability move is a reorder, not a deletion.

## Evidence

- `evidence/2026-10-20/journey-endgame-r25.md` (this note)
- `evidence/2026-10-20/journey-endgame-r25-r25-probe-s{9035..9044}.{json,txt}` + `-frames.json` (10 full runs)
- `evidence/2026-10-20/journey-endgame-r25-r25-probe-summary.json`
- `evidence/2026-10-20/journey-endgame-r25-r25-probe-convos-s{seed}.txt` (convo probes)
- `evidence/2026-10-20/tele-r25-aggregate.json`
- `scripts/journey-endgame-r25-20261020.js` (contest-probe driver), `scripts/test-arenaact-on-death-20261020.js` (proof)

**Game-code changes:** `src/js/contests.js` (notability/arenaAct fires on the act, before damage; +28/-21). Merged locally, pending ship — no bump/push (ship loop owns that).
