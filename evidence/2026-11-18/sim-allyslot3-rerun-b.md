# sim-allyslot3-rerun-b — the 3rd-ally slot, re-run with the loose join (Loop B 2330Z run)

## Verdict: NO-GO — the slot fires, but only 3 of 7 chances (0.43 < 0.80); the sense returns the trio only half the time and the join misattributes overlapping launches

**Frozen prereg:** `evidence/2026-11-18/sim-allyslot3-rerun-b-prereg.md` (commit `3efe51d9c`).
**Lever commits (cherry-picked from held branch `sim-allyslot3-b`):** substrate sense fix `1eaff1e00`, lever `41edabbb2` ([needs-eyes], ex-`ddc7e78ed`), driver `69e12cc5a`, analyzer `554c1f366`, plus the rerun analyzer fix `6f3139b18` (finding #2564, loose join).
**Analysis:** `evidence/2026-11-18/allyslot3-rerun-b-analysis.json` (verdict NO-GO, kind unset — see classification below).
**Panel (§15):** `evidence/2026-11-18/allyslot3-rerun-b-panel.md` (compare status `review_required` — village-deaths regression_watch on a +0.125/run delta whose interval crosses zero; see below).
**Corpora:** `evidence/2026-11-18/perseed-allyslot3-rerun-b-ctl/` + `perseed-allyslot3-rerun-b-arm/` (8 files each, 0 instrument errors); survey corpus `evidence/2026-11-18/evidence/2026-11-18/perseed-allyslot3-rerun-b-survey-ctl/` (8 files, 0 errors).
**Proofs:** `scripts/test-allyslot3-b.js` 18/18, `scripts/test-partyquads-b.js` 29/29, `scripts/test-launchparty-sense-a.js` 12/12, `scripts/analyze-allyslot3-b.js --selftest` 11/11 — all green on this tip. `node scripts/check.js --quick`: 335 passed, 9 failed in 1326s (see `evidence/2026-11-18/check-quick-rerun-b.log`) — **all 9 are pre-existing or load artifacts, none caused by this arm**: 6 are 120s timeouts under a concurrently-running sibling check.js (test-capable-bot-20261014 re-run solo: 40/40 in 53s); test-measurement-proof-update + test-measurement-workflow fail because the retained Nov-17 neutrality proof is stale on master already (its recorded villager-brain.js digest `989a95…` vs master `9a9b93…`, moved by the Nov-18 partysize4 landing a9a4108fe — my branch adds 3 more changed files but is not the cause); test-phone-frame-proof fails on index.html + 5 data files this branch never touches. The proof/phone staleness is master debt for the coordinator, not this arm's to refresh on a HELD branch.
**Convergence state:** killed-at-pilot (second pilot of this lever; first was NO-GO METRIC-BROKEN on the join).

## The lever, in plain words

A four-person hunt can now bring its fourth member into the fight itself. Until now the fourth villager travelled with the party but could not join a fight — the fight only ever fielded two allies. The new slot lets the third ally join when the party is a launched four-person hunt against a big monster, with their own health, gear, strikes and a third call for help. Hunts that were not launched as a four stay capped at two allies everywhere. The slot only exists when the flag is on; it is off in live play.

## What happened

The band delivered a pool this time — the floor repair worked. Launches 22 ctl / 24 arm (floor ≥6), launched quad meetings 6 ctl / 10 arm, field-4 denominator 3 ctl / 7 arm (floor ≥2). The slot fielded the third ally in **3 of 7** chances on the arm leg.

| Bar | Result | Detail |
| --- | --- | --- |
| Pool floor (≥6 launches/leg; ≥2 denominator meetings) | **PASS** | launches ctl 22 / arm 24; arm denominator 7 |
| Primary field-4 rate (≥0.80 on ally2-joined denominator) | **FAIL** | arm 3/7 = 0.43; ctl 0/3; raw rate over all launched quad meetings arm 0.30 (3/10) |
| Sense rate (reported) | 0.50 | arm 5/10; ctl 0/6 (no slot by construction) |
| Cost — starvation (arm ≤ ctl+2) | **PASS** | total 9 vs 8; villager 9 vs 8 |
| Cost — median survival (arm ≥0.8× ctl) | **PASS** | 137d vs 136d |
| Cost — community loss (arm ≤ ctl+16) | **PASS** | village deaths 603 vs 602 |
| Instrument (0 errors; 8/8 files) | **PASS** | errors ctl 0 / arm 0 |

Per-seed arm field-4: 104721 2/4 (ally3Dealt 81), 104722 1/3 (ally3Dealt 0 — see below), 104726 0/0; all other seeds 0 meetings. Control per-seed denominator: 104721 2, 104722 1, 104726 0.

Per-seed trajectories (days / standing / deaths, ctl → arm): 104720 81/150/51 identical; 104721 150/199/102 → 150/199/77; 104722 122/425/77 → 124/450/103; 104723, 104724, 104725, 104726, 104727 identical. The only divergences are the two seeds where the slot fired — the lever moves trajectories exactly where it acts, and nowhere else.

## The three fielded fights — the slot works when staged

- **104721 day 80, the eater** (on-target): fighter gen_3ghdbz4, allies gen_5b212hy + gen_dnv7tkn + **nikolai_volkov (30 damage)**. 5 rounds, 265 of 1,093 HP dealt, fled. All three launch companions sensed and fought.
- **104721 day 98, the influencer** (off-target — launch target was the eater): fighter nikolai_volkov, **gen_dnv7tkn dealt 51**. 6 rounds, 382 of 969 HP dealt, fled. This is the #2564 case in live play: an off-target meeting fielding the fourth member, invisible to the old join.
- **104722 day 91, the spoiler** (wave 5): fighter nikos_papadopoulos, **app_mgpspkqo111 joined but dealt 0** in 4 rounds, 151 of 1,388 HP, fled. The fourth fighter landed nothing in a short flee — coherent (misses happen; 4 rounds is short), and the ally survived (no death row for them days 89–93).

**4th-member damage share (finding #2567, reported):** across the two damage-dealing fielded fights, the third ally dealt 81 of 647 total damage = **12.5%**. The size-4 damage share (mDealt / mHpStart on launched quad meetings) is arm 0.151 (n=10) vs ctl 0.094 (n=6) — arm fights deal a bigger share of monster HP, but every fielded fight still ended in a flee; no quad fight killed its monster. The slot firing does not imply quads win more.

## Why 0.43 — autopsy of the four misses

| Meeting | What happened | Classification |
| --- | --- | --- |
| 104721 d61, eater | Fighter gen_qc8t63a was on a **trio** expedition (day-59 launch, holder + 2); the analyzer joined the fight to an unrelated quad only because ally gen_dnv7tkn was shared. There was no third launch companion for this fighter — the slot never had a chance. | **Join artifact** — false denominator |
| 104721 d69, audit | Fighter is the day-65 quad holder; sense returned 1 launch companion (gen_3ghdbz4) + 1 bystander (vasyl_shevchenko). The other two companions were not on the same expedition tile at the meeting instant. | **Genuine sense miss** |
| 104722 d112, eater | Fighter nino_kapanadze sensed hannah_kim + nikos_papadopoulos — companions of a *different* overlapping quad (day-111), not his own (day-102: visjoin_100 + miguel_santos). His own companions were never sensed. | **Genuine sense miss / mixed party** |
| 104722 d117, editor | Fighter miguel_santos, **ally3 nikos_papadopoulos joined and dealt 17** (5 rounds, 408 of 1,749 HP). The analyzer joined the meeting to the day-102 launch (party lacks nikos) instead of the day-111/115 launch (party is petra + hannah + miguel + nikos — the sensed trio exactly). | **Join artifact** — actually fielded |

Two of the four misses are the analyzer's first-match join misattributing meetings when quad launches overlap in the 21-day window (a seed can hold 3–5 quads at once). Two are genuine: the launch-party sense returns the full trio in only 5 of 10 meetings — the third companion is often not co-located on the same expedition tile when the fight starts. The sense is the binding constraint: of the 5 meetings where the sense DID return the trio, 3 fielded the third ally and 2 ended in 1–2 rounds before any shout could be answered (d117 rerun, d138 — a fast flee means no help arrives, which is the design working as intended).

**Sensitivity (NOT a re-score):** under a fighter-anchored join (the fighter must belong to the joined quad; best-match launch when several overlap), the denominator is 6 and the rate is 4/6 = 0.67 — still below the 0.80 bar. If the d117 editor attribution went the other way it would be 5/6 = 0.83, but that is knife-edge on one meeting and the 0.67 reading is the honest one: the slot fires when the sense stages the trio, and the sense stages the trio only half the time.

## Kill classification (§14a)

**NO-GO, kind METRIC-BROKEN (join) + SUBSTRATE-MISSING (sense coverage).** Not CONCEPT-DEAD: the mechanism is staged, it fires when given the chance (3 fielded, a fourth under a correct join), and the fielded fights read coherently. The pilot could not pass because (a) its first-match join pollutes the denominator with a trio-expedition fight and misattributes an actually-fielded meeting to the wrong launch, and (b) the launch-party sense — itself a HELD NO-GO substrate (finding #2538) — returns the full trio in only half the meetings, so the slot is starved of chances. The next run needs a fighter-anchored / best-match join AND a sense that keeps the launch party co-traveling; until the sense improves, re-running the slot on a richer band only buys more of the same 0.5 sense rate. This lever returns to the queue; it is not dead, it is blocked on its substrate.

## Wall numbers (8 seeds per leg)

| | Control | Arm |
| --- | --- | --- |
| Wins (full seat) | 0 | 0 |
| National scale | 0 | 0 |
| Wave 5 reached | 5 | 5 |
| Wave 4 reached | 7 | 7 |
| Standing ≥200 | 5 | 5 |
| Median survival | 136d | 137d |
| Survived 150d | 4 | 4 |

No village took the full seat on either leg; no village reached national. The §15 panel compare status is `review_required` on a village-deaths regression_watch (+0.125/run, 95% exploratory interval −9.4 to +9.8 — the interval crosses zero and the analyzer's own community-loss bar passes 603 vs 602, a +1 total across 8 seeds). No material signal on wins, national, survival, or community loss. The panel is the instrument, not the judge — it does not override the NO-GO on the primary.

## Sense-test (villagers acting like people)

Read from the fight rows and the vetSays lines in the corpora. The fielded fights read as real hunts, not staged demos: a four-person party meets the wrong monster (influencer instead of the eater they hunted) and still fights as four; a party that flees after one round gets no help at all, which is the shout timing working as designed; the day-91 fourth fighter joins and lands nothing, which is an ordinary bad fight, not a staged success. Villager chatter in the corpora is the usual day-1 trust-gated refusals and water runs ("The well won't fill itself") — generic but coherent; nothing in this arm's corpora reads robotic in a way the arm caused. The one sense oddity worth naming: on day 112 (seed 104722) the fighter's sensed helpers belonged to a different quad's party than his own — overlapping expeditions blur "whose party is this" in a way a player watching the fight would find confusing. That is the same co-location gap behind the two genuine misses, filed as finding #2571 below.

## What this means for finding #2515

The meeting-party 2-ally cap question is now **answered in the negative for the mechanism, open for the sense**: the slot exists, fires, and deals real damage (12.5% share) when the trio is sensed — but the launch-party sense stages the trio only half the time, and overlapping quad launches make "the launch party" ambiguous at the meeting instant. The cap lifts; the bottleneck moved upstream to the sense. The fightcap arm owns the damage question; this arm owns the join + sense-coverage follow-up.

## Determinism note (instrument)

The judged control leg reproduces the pre-prereg survey control leg **byte-identically on all 8 seeds except the recorded `anchorCommit`** (the commit hash legitimately differs — the survey ran at `6f3139b18`, the panel at `3efe51d9c`). Days, end reasons, standing, launches, encounter counts, and death counts match on every seed, across a machine restart in between. The driver is deterministic across invocations.

## Infrastructure notes

- **Machine restart mid-survey:** the survey's first 5 seeds ran, then the machine restarted (uptime showed 1 min on recovery; `/tmp` was wiped, including the survey log). The 5 per-seed files survived in the worktree; the remaining 3 seeds were resumed into the same directory and the run exited 0. Per-seed files are independent — the resume is clean. Logs live in `evidence/2026-11-18/` now, not `/tmp`.
- **Sense-fix substrate is NOT on master:** the first cherry-pick of the lever conflicted on `src/js/party-wiring.js` because the LAUNCHPARTY sense fix (held substrate `f97f61922`) was never landed — the old pilot's "already upstream via arm-1" claim was wrong for this file. The substrate was cherry-picked first (`1eaff1e00`); all four picks then applied cleanly. The lever's party-wiring code references the `launch` list the sense fix builds; without it the sense would have returned no allies at all.
- **safe-commit index clobber ×3:** after each safe-commit in this worktree the index lied (staged-deleted + untracked copy of the just-committed file). Repaired each time with `git ls-tree -r HEAD -- <path> | git update-index --add --index-info`; verified `git status` clean of tracked diffs and hash-object == HEAD blob. All three commits are intact.
- **Telemetry check:** `node scripts/telemetry-check.js` refuses recorder-corpus input by design ("all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs"). The prescribed check does not apply to this instrument; the §15 panel compare + analyzer wall numbers are the scale-wall reporting instead. Not forced with `--allow-recorder-corpus` — the baseline is a run baseline, not recorder shape.

## Metric review

- **No metric was re-scored.** The verdict stands as NO-GO under the frozen prereg (field-4 3/7 = 0.43 < 0.80). The 4/6 = 0.67 fighter-anchored sensitivity is reported for the next run's design, not used to judge this one.
- **Join revision owed (finding #2570):** the first-match join must go. The next run's analyzer should join a meeting to the quad launch whose party contains the fighter AND the sensed allies (best-match; most recent on ties), and should require the fighter to belong to the joined launch — a trio-expedition fight joined via a shared ally must not enter the denominator. The d117 editor row is the test case: under the revised join it counts as fielded; under the frozen join it counts as a miss.
- **Sense-coverage gap (finding #2571):** the launch-party sense returns the full trio in 5/10 meetings. The two genuine misses (d69, d112) are companions not co-located on the same expedition tile at the meeting instant. The next arm should ask whether the sense's same-expedition guard (tile equality) is too strict for a party that set out together, or whether expeditions genuinely split — measured, not assumed. Until the sense rate rises, the slot's ceiling is ~0.5 regardless of band richness.
- **Pool floor validated (finding #2566 closed):** the floor set from the measured survey rate (22 launches, 3 denominator meetings per 8 seeds) passed with room (24 launches, 7 denominator). Floors-from-measured-rate works; the old pilot's failure mode is retired for this arm.
- **Panel `review_required` is noise:** village deaths +1 total (603 vs 602), interval crosses zero, cost bar passes. Not a lever effect.
- **Damage share (finding #2567):** measured at n=2 damage-dealing fielded fights, 12.5% share. Still thin; the fightcap arm owns whether that share matters.

## Landing

Evidence + analyzer + panel builder only. Lever commit `41edabbb2` and substrate `1eaff1e00` stay on branch `sim-allyslot3-rerun-b` (HELD, never merged). The branch is preserved, not deleted. The old pilot's lever commit `ddc7e78ed` remains HELD on `sim-allyslot3-b` alongside it.
