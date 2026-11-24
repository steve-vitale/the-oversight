# sim-fightcap-confirm-a — evidence (DIAG CONFIRM of the wave-4 fight)

**Arm:** sim-fightcap-confirm-a · **Loop A run:** fleshout-20261124T1815Z
**Axis:** scale-onramp · **Type:** DIAG CONFIRM of findings #2538/#2544
**Prereg:** `evidence/2026-11-24/sim-fightcap-confirm-a-prereg.md` (frozen 2026-11-24 ~18:33 UTC, before any judged sim)
**Branch:** `sim-fightcap-confirm-a`, base master `c78100ff4`. Head at close: `0c38749c` (+ analysis/panel/evidence commits to follow).
**Canon:** `docs/CANON.md` + `docs/MONSTER-WAVES.md` read. Wave-4 bands (damage 35–95, HP 850–1500, pierce 0.2–0.5) — "a 4–6 round fight for a godhood build (~220 dmg/round)" — are the damage yardstick. No canon doc covers the sim recorder or the launch party; the launch mechanics are cited from code, not canon.

## Verdict (judged ONLY against the frozen prereg)

**DIAG-GO.** The arm leg's pair-inclusive n is **40, four times the frozen floor of 10**. Classification is complete (61/61 engaged pair-inclusive meetings classified, 0 unclassified), the decomposition is complete (kill share + damage ladder + gate crosstab computed), and instrument errors are 0 on all 32 per-seed files. Every rung of the frozen ladder is met.

**The picture, settled:** kill share **holds** (arm 0/40 = 0.000, tolerance [0, 0.16]); loss share **holds** (arm 35/40 = 0.875 — inside BOTH the adopted widened band [0.674, 0.974] and the original [0.72, 0.92]); vFlee damage/round **moved down** (arm mean-of-rates 33.1, below the frozen [36, 86] floor; pooled 39.0 inside). The recheck's loss-share "move" (9/9 = 1.000, outside tolerance) does **not** reproduce — it was a one-meeting artifact of an n=9 pool. The damage picture got worse, not better: launched parties now deal about a seventh of the ~220 dmg/round the canon fight asks for.

Note on labels: the analyzer's own verdict reads `NO-GO` (its `judge()` scores the original fightcap-a win-share bar, arm ≥ 0.50 — a different scheme from this prereg's DIAG ladder). Per the prereg, judge by the numbers, never by the label: the prereg's DIAG-GO bar is the pool floor + classification + decomposition + 0 errors, and all four are met. The analyzer also prints `DIAG-GO / THIN-POOL` when the pool is thin; neither label is the prereg's verdict.

## Primary metric (binding, §14)

Kill share on pair-inclusive engaged launched meetings, arm leg: **0/40 = 0.000** (Nov 18 arm: 2/34 = 0.059; recheck arm: 0/9 = 0.000). Win share (vKill + mFlee) / n: **5/40 = 0.125** (all five wins are mFlee — the monster fled; zero kills). Trio+ population (|planParty| ≥ 2): arm **26 meetings, 4 wins** (0 kills, 4 mFlee, 3 vDie, 19 vFlee); ctl 15 meetings, 2 wins (0 kills).

| Leg | Pair n | Wins | Kills | Losses (vDie / vFlee) | Kill share | Loss share |
|---|---|---|---|---|---|---|
| arm (SENSEEXPED=1) | 40 | 5 (mFlee) | 0 | 35 (5 / 30) | 0.000 | 0.875 |
| ctl (SENSEEXPED unset) | 21 | 3 (mFlee) | 0 | 18 (3 / 15) | 0.000 | 0.857 |
| Pooled pair | 61 | 8 | 0 | 53 | 0.000 | 0.869 |
| Recheck arm (8 seeds) | 9 | 0 | 0 | 9 (2 / 7) | 0.000 | 1.000 |
| Nov 18 arm (HELD sense fix) | 34 | 6 | 2 | 28 | 0.059 | 0.824 |

## Damage/round ladder (mDealt/rounds, same construction as fightcap-a and the recheck)

| Leg / outcome | n | dmg/round (mean of per-meeting rates) | pooled | Recheck |
|---|---|---|---|---|
| arm vFlee | 30 | **33.1** | 39.0 | 45.3 / 49.3 |
| arm vDie | 5 | 20.0 | 19.8 | 15.6 / 18.7 |
| arm mFlee | 5 | 5.1 | 5.9 | — |
| arm vKill | 0 | — | — | — |
| ctl vFlee | 15 | 43.4 | 51.9 | 52.8 / 55.6 |
| ctl vDie | 3 | 18.6 | 28.4 | — |

Arm vFlee 33.1 sits **below** the frozen [36, 86] band on the mean-of-rates construction the recheck judged by (pooled 39.0 is inside the band). Against the canon godhood bar (~220 dmg/round for a 4–6 round fight), launched parties deal about a seventh of what the fight asks. The longest arm fight (11 rounds, Algorithm, 787 of 1003 HP) still ended in flight at 78% damage dealt. Rounds: arm pair mean 4.4 (vFlee 5.1); ctl pair mean 5.0.

## Gate × outcome crosstab (arm pair, n=40)

| Gate | vDie | vFlee | vKill/mFlee |
|---|---|---|---|
| null | 4 | 25 | 0 |
| seek | 1 | 5 | 5 (mFlee) |
| avoid | 0 | 0 | 0 |

Gate `avoid` is **0 among all 35 arm losses** — unchanged from Nov 18 (0 among 28) and the recheck (0 among 9). The gate still never says "avoid". New this band: `seek` appears usefully — all 5 arm wins carry a `seek` gate (the gate said seek, the party engaged, the monster fled). 29 of 35 losses carry a null gate.

## Funnel — presence is fixed; engagement and winning are not

Pair-inclusive funnel (encounters → engaged):

| Leg | Encounters | No launch plan | Party absent | Evade-excluded | Engaged pair |
|---|---|---|---|---|---|
| arm | 117 | 6 | 11 | 60 | 40 |
| ctl | 90 | 7 | 36 | 26 | 21 |

SENSEEXPED holds its presence gain on the fresh band: the launched party was absent at 11 of 111 launched arm encounters (vs 36 of 83 in ctl). But presence still does not become winning: of the 100 present arm encounters, the party evaded 60 and lost 35 of the 40 it engaged. Trio+ funnel for reference: arm 117 encounters → 45 below the trio size floor → 7 absent → 33 evade → 26 engaged; ctl 90 → 25 below floor → 24 absent → 19 evade → 15 engaged.

Monsters met (arm pair): Algorithm 7, Influencer 5, Eater 4, Audit 4, Reunion 4, Eulogy 7, Strike 3, Congregation 2, Suburb 2, Cancellation 2 (wave-5 Cancellation appears in the wave ≥ 4 pool). Wins came only from Eulogy (4 mFlee) and Reunion (1 mFlee) — the two monsters with a working non-damage counterplay. Every other monster type: 0 wins in 29 meetings.

## Zero-damage classification (the dmgshape lesson — full)

Every engaged pair-inclusive meeting classified with `scripts/analyze-zerodmg-recheck-a.js` (reused as-is):

| Leg | Total | strike-fight | contradict-counterplay | died-before-strike | other-zero-damage | unclassified |
|---|---|---|---|---|---|---|
| arm | 40 | 34 | 3 | 0 | 3 | 0 |
| ctl | 21 | 18 | 0 | 1 | 2 | 0 |

Zero-damage meetings, named individually:
- **Arm contradict-counterplay (3):** s110311 d118 Eulogy mFlee; s110311 d120 Eulogy mFlee; s110316 d72 Eulogy vFlee — all three are the Eulogy's authored contradict trick working as designed (two of them end in the monster fleeing).
- **Arm other-zero-damage (3):** s110304 d130 Cancellation vFlee (1 round); s110311 d105 Suburb vFlee (1 round); s110315 d99 Reunion mFlee (1 round) — all 1-round fights that ended with no damage dealt and no strike line; the fight ended before any strike landed.
- **Ctl died-before-strike (1):** s110310 d62 Algorithm vDie (1 round, no strike line).
- **Ctl other-zero-damage (2):** s110303 d50 Eulogy mFlee (1 round); s110307 d84 Reunion vFlee (1 round).

The dmgshape failure mode is priced, not hidden: 6 of 40 arm meetings dealt zero damage, and 3 of those are the counterplay working (a win condition that deals no damage by design). The decomposition can price all of them.

## Cost bars (binding guardrails) — ONE FAIL, investigated same-run

Recomputed by hand on 16-seed shares (the analyzer hardcodes /8 denominators — see Instrument gaps).

| Bar | Result |
|---|---|
| Community loss (arm ≤ ctl + 0.125) | **PASS — arm 8/16 = 0.50 vs ctl 10/16 = 0.625** |
| Starvation (arm ≤ ctl + 2, totals AND villager-only) | **FAIL — totals arm 11 vs ctl 3; villager arm 10 vs ctl 2** |
| Median survival (arm ≥ 0.8 × ctl median) | **PASS — arm 150d vs ctl 141.5d** |

**Community-loss investigation — the recheck's excess does NOT reproduce.** The confirm's arm leg lost FEWER villages than ctl (8 vs 10). Seeds that flip vs ctl: ctl-lost → arm-survived 110303, 110314, 110315; ctl-survived → arm-lost 110311 only. The recheck's pointed pattern (the four best-scaling ctl villages all village-lost in the arm leg) is gone: ctl's best scalers by standing — 110306 (485, lost both legs), 110303 (425, lost ctl / survived arm), 110313 (390, survived both), 110315 (310, lost ctl / survived arm) — split both ways. Pooled across recheck + confirm (24 seeds per leg): arm 14/24 vs ctl 12/24 — no excess. The recheck's 6/8 vs 2/8 was seed noise on an 8-seed band, as suspected. The balanced panel agrees: community loss 0.625 → 0.50, paired delta −0.125, 95% exploratory interval −0.375 to 0.125, no_material_signal.

**Starvation investigation.** The excess is spread across seeds, not concentrated: arm starvation deaths by seed — 110301: 3, 110316: 3, 110302/04/06/13/14: 1 each (7 of 16 seeds affected); ctl — 110301/04/07: 1 each (3 of 16). No single-seed pile-up (contrast bowopen-recheck-a's 110202: 4 of 5). Death-cause shares are near-identical otherwise: expedition 33.3% arm vs 35.4% ctl; villager combat 35.8% vs 35.6%; combat 14.1% vs 15.1%; monster 4.0% vs 3.5%. Deaths per village-day are LOWER in arm (0.737 vs 0.768). Launch volume is higher in arm (v4departs 545 vs 525; v4encounters 444 vs 296 — the sense fix means more wave-4+ meetings actually happen). Pantry-zero days are higher in arm (173 vs 126 over 2209 vs 2054 pantry rows; 7.8% vs 6.1% of village-days), and starvation deaths sometimes fall on pantry-zero days (110301 arm: deaths on days 85/87, both zero-pantry days; 110306 d108, 110304 d147, 110313 d128, 110314 d118 — all zero-pantry days) — but just as often they do not (110316 arm: all three deaths on days 94/107/108, while that seed's zero-pantry stretch runs days 111–119, AFTER the deaths; and four arm seeds hold 15–19 zero-pantry days with zero starvation deaths). Mean end pantry is HIGHER in arm (2855 vs 2129 kcal). No mechanism ties SENSEEXPED to starvation: the arm leg fights more, spends more days at zero pantry, and starves 8 more villagers over 2217 village-days — but deaths/day is lower, expedition deaths are lower, and the pantry link is loose in both directions. Pooled with the recheck, the arm excess persists (14 vs 4 over 24 seeds per leg), so this is a standing watch item for the next SENSEEXPED-adjacent run, not a diagnosis. The bar fails as written; nothing was re-scored.

## Balanced panel (§15)

`scripts/build-fightcap-panels-a.js` (`--prefix fightcap-confirm-a --run fightcap-confirm-a --policy fightcap-confirm-a --origin sim-fightcap-confirm-a --seeds 110301,…,110316`) + `node scripts/balance-panel.js compare`. Compare `.md` attached: `evidence/2026-11-24/fightcap-confirm-a-panel.md` (panels `fightcap-confirm-a-panel-before/after.json.gz`, `fightcap-confirm-a-panel.json`).

- **Decision: `review_required`** (compare exit 2), driven by one signal: **Village deaths per run, regression_watch** — 99.125 → 102.1875, paired delta +3.06, 95% exploratory interval −8.5 to 15.19 (includes 0 — a watch, not a signal).
- Community loss: no_material_signal (0.625 → 0.50, interval includes 0). Village deaths per 100 days actually fell (82.28 → 74.84, delta −7.44) — arm villages lived longer (more village-days), so the per-run death count rose while the death rate fell. National 0 → 0, wins 0 → 0, table metrics not observed by this instrument (null, never faked).

## Wall numbers (every run)

| Leg | National | Table | Wins | Wave 4 | Wave 5 | Median survival | Community lost |
|---|---|---|---|---|---|---|---|
| ctl (16 seeds) | 0/16 | null (not instrumented) | 0/16 | 16/16 | 6/16 | 141.5d | 10/16 |
| arm (16 seeds) | 0/16 | null | 0/16 | 16/16 | 8/16 | 150d | 8/16 |
| Combined | 0/32 | null | 0/32 | 32/32 | 14/32 | — | 18/32 |

Per-seed: ctl survivors 110302/04/05/09/11/13 (standing 199/275/175/199/325/390; wave 5 in 110304/11/13), lost 110301 (d142), 110303 (d122), 110306 (d141), 110307 (d149), 110308 (d105), 110310 (d110), 110312 (d129), 110314 (d54), 110315 (d135), 110316 (d77). Arm survivors 110302/03/04/05/09/13/14/15 (standing 505/400/350/175/199/199/199/340; wave 5 in 110302/03/04/15), lost 110301 (d150), 110306 (d114), 110307 (d140), 110308 (d144), 110310 (d89), 110311 (d130), 110312 (d130), 110316 (d120). Scale rank regional in all 32. The scale wall stands: no national, no wins, on either leg.

## Sense-testing (transcripts read in full)

No vKill exists in either leg, so per the prereg fallback I read **2 arm won (mFlee) + 2 arm lost** fight transcripts in full:

1. **Arm, seed 110311 day 118, Wilmer vs The Eulogy (mFlee, 3 rounds, 0 dealt).** The counterplay win, working as designed: "Wilmer contradicts the narration — it says Wilmer runs — Wilmer advances", "it says Wilmer falters — Wilmer stands straighter", "it says Wilmer begs — Wilmer laughs." The Eulogy flees after 3 rounds. Coherent, characterful, and a real win-by-trick — the only kind of win in the band. The line "Wilmer holds the line — working the trick, not the damage race." repeats verbatim after R2 and R3 (same repeated-trick-line tic the recheck saw in the Reunion fight).
2. **Arm, seed 110316 day 74, Ahmet vs The Eulogy (mFlee, 3 rounds, 60 dealt).** A crossbow opener (4 shots, 3 hits, 60 damage — the ranged volley working), then the contradict trick; the monster flees. The volley damage is NOT attributed per-fighter: `parsedStrikeTotal` 0 and `dmgByVid` `{}` despite 60 dealt in the log — the attribution gap still bites for ranged-opening damage.
3. **Arm, seed 110311 day 34, Maya vs The Algorithm (vFlee, 11 rounds, 787/1003 dealt).** The best fight in the band. Rage opener ("Maya's eyes go red. Next 3 strikes hit twice as hard."), "Maya is losing — shouts for help! Desmond charges in!", then Luciana on the second shout, field medicine (+20 HP mid-fight), steady 25–59 damage a round against a 1003-HP monster. The party deals 78% of the monster's HP over 11 rounds and still flees. The log is capped at 20 lines, so rounds 6–11 — including the flee decision itself — are invisible; I cannot judge why a party at 78% damage dealt walks away. The 20-line cap bites hardest exactly here.
4. **Arm, seed 110309 day 73, Ruby vs The Reunion (vFlee, 8 rounds, 321/1375 dealt).** Same shape: honest misses, wound-binding, two allies joining on shouts, "R5: Ruby strikes for 12 (mirrored — worn thin)" — the Reunion mirroring its victims, a nice touch — and the log truncates at R5, again before the ending.

Sense verdict: the fights read as real fights between people and monsters — shouts, wound care, rage, misses, genuine counterplay — and they are lost (or won only by trick) on damage math (~33 dmg/round vs ~1000–1400 HP). Nothing robotic except the verbatim repeated trick lines in the Eulogy fights. The damage gap, not the narration, is the blank.

**Recorder gaps (fightcap-a §11) — still bite:** (a) the 20-line encounter-log cap truncates 20 of the 40 arm pair meetings (half the population), including every fight longer than ~5 rounds and every flee decision; (b) per-fighter attribution is empty on both Eulogy mFlee fights despite parsed strikes/bolts in the log — melee strikes parse, ranged-opening damage does not; (c) mHpStart-null-on-vKill is untestable — zero vKills in this band (mHpStart is present on all 61 pair meetings).

## What this confirm does NOT judge

No game-code lever is landed. The 4th seat (ALLYSLOT3 off both legs) is out of scope. The rounds=0 "vKill" rows are excluded by the engaged filter, as in fightcap-a. No `check.js` gate was run (no src/ change; driver + analyzer + proof test only). The rage/carrier path was not touched (Loop B arm sim-ragecarry-b owns it); Rage appears only as an observed line in transcripts. ReadyDemand numbers were not moved; no default was flipped.

## Tooling note

- `scripts/build-fightcap-panels-a.js` needs `--seeds` (or `SEEDS` env) — its default seed list is the fightcap-a band (104501–104508) and it throws on the first missing file. The prereg's "already has them" referred to the --prefix/--run/--policy/--origin args; the seed list was the missing piece. Built with `--seeds 110301,…,110316`.
- The analyzer's `judge()` hardcodes /8 denominators on the community-loss bar ("arm 8/8 vs ctl 10/8", "at most 11 villages") and scores the original fightcap-a win-share bar (arm ≥ 0.50) under the verdict names GO/NO-GO/DIAG-GO-THIN-POOL. On a 16-seed band its bar text is wrong and its verdict name does not match this prereg's DIAG ladder. Cost bars were recomputed by hand on 16-seed shares; the prereg verdict is judged by the numbers per the frozen ladder. Filed as an instrument gap (analyzer-label fix, already open from the recheck).

## Run notes

- Prereg committed `3b6824572` (frozen ~18:33Z, before any judged sim); instrument committed `1b5ed9f10` (proof 33/33 + analyzer selftest 20/20 + zero-dmg selftest 7/7).
- Ctl leg (16 seeds) ran detached, exit 0. **Write flap window ~18:50–19:08Z (~18 min):** seeds 110314/110315 per-seed writes refused (0-byte tmp files, driver @@FALLBACK dumps to stdout after 480 retries each); seed 110316's write got through at 18:57 mid-window. Both lost files recovered byte-verified from the log dumps (parse + seed + 0 errors + readback equality) after the probe passed at ~19:08Z. Committed `47f9df93`.
- Arm leg (SENSEEXPED=1, 16 seeds) ran detached, exit 0. **Second flap window from ~19:15Z:** seeds 110306/110307 writes refused (same signature); both recovered byte-verified from the log dumps. An exec-service restart during the flap wait coincided with a VM restart (uptime 1 min at 19:30Z); the flap cleared on the machine replacement, per the known pattern. Committed `0c38749c`.
- **Safe-commit index clobber struck on all five commits** (prereg, instrument, ctl, arm — committed files showed staged-as-deleted, worktree files byte-identical to HEAD). Each commit was verified correct via `git show --stat` and the index repaired with `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`; tree verified clean after each repair. This is the known clobber class (AGENTS.md).
- Write-flap probe (`git update-ref refs/heads/probe HEAD`) passed before every material write that mattered; the two flap windows above were the only ones hit.

## Metric review (binding, §14)

1. **The widened loss-share tolerance worked.** The adopted ±0.15 band ([0.674, 0.974]) is no longer one meeting wide at this scale, and the confirm's 0.875 sits inside it — and inside the original [0.72, 0.92] too. The recheck's outside-tolerance reading is retired as a small-n artifact. Keep ±0.15 for future fightcap runs.
2. **The vFlee damage/round bar needs a construction call.** The mean-of-rates (33.1) is below the [36, 86] floor while the pooled rate (39.0) is inside it. The prereg froze the band on the recheck's judged construction (mean-of-rates), so the verdict here is MOVED — but the two constructions now disagree, and the band edge (36) sits between them. Next run: freeze which construction judges the bar (recommend pooled, which is stable as n grows; mean-of-rates is dragged down by 1–2 round fights that deal ~0–20 damage before fleeing).
3. **The starvation cost bar fired on a real but mechanism-less excess** (arm 11 vs ctl 3, spread across 7 seeds, pooled with the recheck 14 vs 4). The bar is absolute-count, so 8 extra deaths over 2217 village-days trips it while every rate (deaths/day, expedition share, pantry means) says the arm leg is no hungrier. If the bar is meant to catch food-system harm from a lever, it should be rate-based (per village-day) or paired per-seed; as written it fires on small-number fluctuation. Propose for the next run: starvation bar as arm rate ≤ ctl rate + 0.002 deaths/village-day, judged alongside the absolute count. Not re-scored here — the FAIL stands as written.
4. **The analyzer's verdict names and /8 denominators are now a documented instrument gap**, not a prereg problem. The prereg's explicit label-resolution clause is what kept this run's verdict clean. The fix (rename the thin-pool label, parameterize the seed count in the bars) belongs to the analyzer, not to any future prereg.
5. **No metric was re-scored mid-run.** Kill share, loss share (both bands reported), vFlee dmg/round (both constructions reported), and the cost bars are judged exactly as frozen.

## Next blank

**The damage gap is the blank, and it is now measured on a 40-meeting pool: launched parties deal ~33 dmg/round against ~1000–1400 HP monsters and win only by trick (5 mFlee, 0 kills).** The next arm is a damage lever, not another sense/presence lever: SENSEEXPED has done its job (presence fixed, engagement up 2×), and the fight is lost on arithmetic. Candidate levers, in the order the evidence points: (a) ammunition supply at departure (finding #2544 — the bowopen line's open item; the crossbow volley in the s110316 transcript shows what ranged damage looks like when it fires); (b) party damage scaling with party size / coordinated strikes; (c) wave-4 HP band re-examination against the measured ~33–45 dmg/round reality (canon says 4–6 rounds at ~220 dmg/round; measured parties need 25–40 rounds). Whichever arm is chosen, it should be judged on the same frozen bars (kill share, loss share, vFlee dmg/round with the construction frozen per metric-review item 2, cost bars with the starvation rate proposal) on a fresh band.

## Commits (branch sim-fightcap-confirm-a)

- `3b6824572` prereg (frozen, pre-existing)
- `1b5ed9f10` instrument: ported driver + proof test 33/33 (pre-existing)
- `47f9df93` ctl leg complete: seeds 110301–110316, 16/16, 0 instrument errors (2 files recovered from @@FALLBACK dumps)
- `0c38749c` arm leg complete: SENSEEXPED=1 seeds 110301–110316, 16/16, 0 instrument errors (2 files recovered from @@FALLBACK dumps)
- (analysis + zero-dmg classification + balanced panel — commit to follow)
- (this evidence file — commit to follow)

## Files

- Prereg: `evidence/2026-11-24/sim-fightcap-confirm-a-prereg.md`
- Analysis: `evidence/2026-11-24/fightcap-confirm-a-analysis.json`
- Zero-dmg classification: `evidence/2026-11-24/fightcap-confirm-a-zerodmg.json`
- Panel: `evidence/2026-11-24/fightcap-confirm-a-panel.md` (+ `.json`, `-before/-after.json.gz`)
- Corpora: `evidence/2026-11-24/perseed-fightcap-confirm-a-ctl/` (16 files), `evidence/2026-11-24/perseed-fightcap-confirm-a-arm/` (16 files)
- Driver logs: `evidence/2026-11-24/fightcap-confirm-a-ctl.log/.err`, `fightcap-confirm-a-arm.log/.err`
