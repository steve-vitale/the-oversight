# sim-tenddrive-a — Binding-leg tend/trust build (tend while national, cap 55)

**Verdict: NO-GO.** Judge exit 1. Fix reverted (`9da541de6`); zero `src/js` diff vs base `6680d7924`.
Prereg: `sim-tenddrive-a-prereg.md` (committed first, `3047f3258`). Tracker blank 3 (run 1530Z), findings backlog #1918, sized lever from sim-tendtrust-b.

## The lever played

In `src/js/win-plan.js`, `winPlanBondsTick` only (line 539):

1. Deleted the `if (st.nationalLive || st.pendingNational) return null` early return (line 542), so the TENDING leg runs while national.
2. Raised the tend cap from 50 to 55 while nationalLive: `if ((l.trust || 0) >= (st.nationalLive ? 55 : 50)) continue;` (line 555).

`winPlanMusterTick` (line 569) kept its own identical early return untouched. All other gates unchanged: ≥2 primary links, plan actor at Haven, pantryDays ≥ 3, once/week/link, mourning skip, `tendLink` +8 / 1,500 kcal (`src/js/hierarchy.js:1147`; tendLink itself has no trust cap).

Sizing (from tendtrust, computed): observed national-loss dips 3, 7, 12 trust points = 1, 1, 2 tends at lift +8. Cap 55 banks 15 headroom above the 40 bar (holds the 12 dip); cap 50 banks only 10 (50−12=38 < 40, fails).

Substrate: tableseat-nowait (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) wrapped with the tendtrust-b recorder (TENDTRUST=1, proven neutral). Seeds 76401–76408, reused deliberately (same band as binddiag/tendtrust). Horizon 180 loop-days, death-aware. Own baseline replication — tendtrust's corpus was NOT reused as control; its numbers used only as a reproduction check.

## GO bars (prereg §14 — a miss is NO-GO, never re-scored) and verdict

| Bar | Requirement | Result | Verdict |
| --- | --- | --- | --- |
| PRIMARY | candidate national final ≥ baseline + 2 (≥5/8) AND loss seeds 76407, 76408 hold national to end | national final 3 → 3 (delta 0); 76407 holds, 76408 never reaches national | **FAIL** |
| MECHANISM | engine tends while nationalLive on ≥1 seed AND ≥1 link topped to trust ≥55 while national | 2 engine tends while national (both seed 76402, day 89); topped-55 seeds [76402, 76405, 76407] | **PASS** |
| SECONDARY (cost) | starvation ≤ control + 2 (totals AND arm-only), median ≥ 0.8× control median | starvation total 2 → 2, arm-only 1 → 1; median 97 → 97 (ratio 1.0) | **PASS** |

Judge: `node scripts/test-tenddrive-a-judge.js` → exit 1, PRIMARY FAIL. **GO = all three; verdict NO-GO.**

## Before / after on identical seeds (76401–76408, 180d)

Both legs LEG-OK (G1 detgate PASS, G2 recorder neutrality 8/8, G3 corpus integrity PASS, tend cross-check 8/8 on each leg). Aggregates are IDENTICAL between legs:

| Metric | Before (baseline = armed) | After (baseline = armed) |
| --- | --- | --- |
| Won | 3 | 3 |
| Median survival | 97d | 97d |
| Max survival | 107d | 107d |
| National ever | 3/8 | 3/8 |
| National final | 3/8 | 3/8 |
| Global ever | 2 | 2 |
| Table seen / entered / enteredFull | 7 / 3 / 0 | 7 / 3 / 0 |
| Wave 4 reached | 8/8 | 8/8 |
| Wave 5 reached | 2/8 | 2/8 |
| Starvation total (arm-only) | 1 (1) | 1 (1) |
| Tends (policy / engine) | 70 (16 / 54) | 72 (16 / 56) |
| Engine tends while nationalLive | 0 | 2 |
| National losses | 0 | 0 |

Per-seed (armed rows; before/after identical on days, national, won, final rank — only in-trajectory difference is the +2 tends):

| Seed | Days | Outcome | National | Note |
| --- | --- | --- | --- | --- |
| 76401 | 69 | village-lost | never | — |
| 76402 | 89 | over-other, won 1 | d77, held | **+2 engine tends while national, d89** (see mechanism) |
| 76403 | 82 | village-lost | never | starvation 1 |
| 76404 | 66 | village-lost | never | excluded from any win claim (never forms a third sub — courtship failure on poor pantry) |
| 76405 | 97 | over-other, won 1 | d77, held | — |
| 76406 | 103 | village-lost | never | — |
| 76407 | 107 | over-other, won 1 | d106, held | qualifies d105, 1 day of national runway |
| 76408 | 100 | village-lost | never | pre-national qualification-persistence failure (see below) |

## Why NO-GO: the loss story does not reproduce on this base

On base `6680d7924` the tendtrust loss story does NOT reproduce — **zero national losses on the baseline leg**, so the headroom had nothing to save. Tendtrust's reproduction check (national ever 4/8, final 3/8, losses 76407 d122 + 76408 d92, won 2/2, median 90d) differs from my own baseline (3/8, 3/8, won 3, median 97d, no losses) due to base drift (715c2918d → 6680d7924; the pellet-boost build landed between them). The `mode` string only labels the manifest and does not affect RNG (verified in sim-harness.js).

- **76407** now qualifies d105 and holds national to end — no loss to absorb.
- **76408** never reaches national at all: qualifies d58 with 4 subs and trust 49–65, but links decay d60→99 (village_0 53→18); seasoned subs 4→1; no national beat ever stages. 11 policy tend attempts, all 11 mourning-refused; 5 engine tends. This is a PRE-national qualification-persistence failure — the fix (tend while national) cannot touch it; its candidate-leg trajectory is identical to baseline (no nationalLive ever → fix never engages).

So the mechanism works and the outcome bars fail because the band contains no national-loss event. The drive never fires on a loss seed — a measured NO-GO mechanism in the prereg's terms (actor-presence/firing throttle), NOT a reason to widen scope mid-run. Scope was not widened.

## Mechanism detail — seed 76402 (the one place the fix engaged)

Before leg: national d77–d90 (14 days), links sat 63/41/50 (village_1 one point above the bar the whole window), **zero engine tends while national**. After leg: identical until day 89, when the drive fires once and tends both dipping links the same night — village_1 41→49 and village_2 50→58 (both +8; pantryDays 2 at the morning-after read — gate read ≥3 at tend time, consistent with tendtrust's undershoot note). Village_2 crossed 55 via the tend (50→58). The village ends d89 anyway (won lesser seat) — the tends change no outcome, but prove the gate works in the wild: the drive runs while national and tends above the old 50 cap. The double-tend night quirk (two tends on a week-boundary night) was not observed as a bar; not seen in the pilot.

## Sense read (seed 76402, fixed tree, non-measured narration replay)

File: `sim-tenddrive-a-sense.txt` (242 lines; days=89, gameDays=90, over-other, maxWave=4, ring=240, finalRank=global, tableDone=true).

The tend-while-national IS voiced: day 89 carries two grain lines — "Haven sends 1,750 kcal of grain to Stonebridge's fire — not tribute, the other way around. (Trust +8.)" and "1,500 kcal... to Thornfield's fire... (Trust +8.)" — matching the corpus's 2 engine tends that night in count, day, and lift. The build changes WHEN the village hears the grain lines (they now sound while national, on the final night); tendLink always spoke its line, so this is not a new voice, it is a new occasion. The 1,750 vs 1,500 is explained, not a mismatch: `_removePantryKcal` (hierarchy.js:991) takes whole units (`Math.ceil(need/per)`), so a 1,500 request against 875-kcal units removes 2 units = 1,750 ("over-removal is honest, callers report actuals"); gain is `Math.round(8 * min(1, paid/1500))` = +8 either way.

Same ring: d89 Emberhold raid (Trust −10); d90 AUDIT names "National Standing reached" with five-track points and the full-seat ledger ("only 1 of 3 wave-4... 0 of 2 wave-5... no capstone deed"); the idle line "You wait. The light changes. Nothing asks anything of you." repeats (pre-existing texture, already in findings). The tend/trust story is otherwise silent in narration — nothing names the realm/bond cooling; the Binding-wait silence (finding #1906) stands.

## Village assessment (plain words)

In plain words: this change lets a village that has already reached the whole-country level keep looking after its closest friendships instead of letting them go cold while it waits for the final invitation. On the villages we tested, that mostly did not matter — only one village ever needed it, and only on its last night, when the invitation had already come and the village was finishing anyway. The villages that lose the country level do not lose it here: one never gets there because its friendships fade before the country level is even offered, and the other now reaches it late and holds it. The change is harmless — it costs no extra food deaths and villages live just as long — but on this set of villages it buys nothing. The next step, if anyone wants it, is not a bigger version of this change: it is finding a set of villages where the country level actually slips away, or fixing the earlier problem of friendships fading before the country level is offered.

## Balanced panel (§15)

Before (unfixed tree) and after (fixed tree): `tenddrive-a-panel-before/panel.json.gz` and `tenddrive-a-panel-after/panel.json.gz` — 32 rows each (4 policies × 8 seeds × 180d), sourcesStable=true, neutrality 4/4 match on seed 76401. `cases/` caches deleted (never committed). Compare: `tenddrive-a-panel-compare.md` (+`.json`), decision **review_required** (exit 2), valid — no `invalid`, so the COMPARE-CONTRACT rebuild route was not needed (the sources check only flags `scripts/` files; a `src/js` change does not invalidate the compare).

Panel read: risk-aware, socialite, winseek — EVERY metric delta exactly 0 (those policies never reach national on this band: national scale access 0). Capable — national scale access 0.875 both legs, table win rate 1 both; the only non-zero deltas are small death-count watches, all with intervals crossing zero: player deaths/run 1.625→2 (+0.375, 0 to 1.125), village deaths/run 70.875→71.625 (+0.75, −0.25 to 2), plus tiny hydration/HP/hungry-sample ticks. No regression signal. The panel corroborates the pilot: the fix is nearly inert on this band under these policies.

Build notes: the first before-panel attempt failed at ~21:13Z with `Error: EPERM: operation not permitted, write` (balance-panel.js:328, worker writeFileSync) — the write-denial flap struck during the final cases (32 case files + 3 `.tmp`, no `panel.json.gz`, PANEL-EXIT=1). Retried after the flap cleared (~21:17Z probe OK); cache reuse made the retry fast ("32 cases, 33 cached jobs", PANEL-EXIT=0). The tree was temp-reverted for the before-panel build and restored via `git checkout HEAD -- src/js/win-plan.js` immediately after each build, verified by grep + proof test.

## Proof test and check.js --quick

`scripts/test-tenddrive-a.js` (seed 7; cases national-tend / cap55 / cap50 / muster-national; one fixture, one process): on unfixed code national-tend FAIL (returns null, no tend), cap55 FAIL, cap50 PASS (control), muster-national PASS — exit 1. On fixed code all 4 PASS — national-tend tended both links 42→50, 45→53 (bondTends +2); cap55: 54→62, 55 untouched, 49→57; cap50 still passes; muster still returns null while national — exit 0. **The test is retained as the lever's specification; it FAILS on the reverted tree (2/4) by design and passes when the fix is re-applied. Do not add it to the green list while the fix is reverted.** Modeled on the `tend`/`standdown` fixtures in `scripts/test-win-intel-20261003.js` (mshipState links, stocked pantry, plan-holder at Haven, `winPlanOf` stage `standing`).

`node scripts/check.js --quick` on the fixed tree: **289 passed, 11 failed in 1389s** (CHECK-EXIT=1). Attribution is INCOMPLETE: the output was piped through `tail -30`, so only the last failure block survived — `scripts/test-establishment-r20-fixes-20261020.js` (exit 1, 2.5s), the racks-voice gate ("next day voices once more (gate resets daily): expected 2, got 1") — the SAME pre-existing failure the comparecontract-a run attributed on 2026-11-08 on the pre-fix tree; nothing in it references win-plan/tenddrive. The slowest list names the same 120s-timeout suspects as comparecontract-a's run (test-capable-bot-20261014.js 120s, test-trust-observer-neutrality.js 120s, test-synergy-stall.js 113s). The other 10 failing lines were NOT retained and are NOT attributed here — a full-capture re-run was not done (time; the fix is reverted, so no fixed-tree state lands). The 289/11 count vs comparecontract-a's 278/14 on the older tree shows no regression attributable to this arm, but that is a count comparison, not a line-by-line attribution — recorded honestly as such.

## Wall numbers (pilot, tableseat-nowait, 180d, 8 seeds)

National/table/wins: national ever 3/8, final 3/8, global ever 2, table seen 7, entered 3, enteredFull 0, won 3 (all lesser seat). Wave 4–5 unlocks: wave 4 reached 8/8, wave 5 reached 2/8. Median survival 97d, max 107d. Starvation 1 (seed 76403). The Binding (BELONG) never fires on either leg.

## Metric review (bars worked as written?)

- PRIMARY as written is a fair bar but the band carried no loss event on this base — the bar measured the base, not the lever. A retest needs a band (or base) where national losses actually occur; the confirm band 76409–76420 was NOT run (confirm only if pilot GO — it was NO-GO) and remains fresh (verified in the prereg: grepped every `evidence/*/sim-*-prereg.md` plus forbidden/contaminated lists; only 76401–76408 named anywhere).
- MECHANISM bar part (b) ("link topped to trust ≥55 while national") is NON-discriminating as measured — the baseline already has 3 seeds ≥55 while national via court/aid gains, not tends. The discriminating evidence is part (a) plus tend-attributed topping (village_2 50→58 via an engine tend while national on the candidate leg; none on the baseline leg). A future bar should require the topping to be tend-attributed.
- SECONDARY bar worked as written; no cost observed.
- 76404 exclusion held: it never forms a third sub on either leg; no tend count fixes it.

## Instrument gaps / run notes

- Flap: EPERM write-denial flap active ~16:50Z (cleared ~17:00Z), returned ~18:32Z–~18:50Z, and struck again ~21:13Z during the before-panel build (see above). Every git write was probe-gated (`git update-ref refs/heads/probe HEAD` + delete); no write was forced.
- First baseline sweep run was killed by the flap on `s76402-baseline.json` (writer EPERM, 8 short retries); its row JSON was lost (process log retained only the tail; the `.tmp` file was gone). Second run with hardened writer (12 retries, backoff to 60s) + resume completed all 16 configs.
- Sweep fix commit (`5ddcc0de`): aggregate var names (`natLostSeeds`/`natLostDays`) + flap-hardened writes + resume (skip valid on-disk rows).
- Empty commit `f72edc66`: accident — safe-commit was passed a directory path (the corpus dir), which it rejects with "fatal: Unable to add <dir> to database" and can still create an EMPTY commit. Harmless; sits below the corpus commit. safe-commit.sh does NOT accept directory paths — always pass explicit file lists.
- The tendtrust-b recorder's header comment still says the engine drive "never [tends] while nationalLive" — stale under the fix; the recorder file was deliberately NOT modified (landed instrument from another arm).
- `check.js --quick` dirtied hundreds of `evidence/` files across other dates (test scripts writing into evidence/; one file observed truncated to empty, hash e69de29). Repaired with `git checkout HEAD -- src/js scripts evidence` (worktree + index both clean after); the revert then proceeded. No evidence was lost — all restored files match HEAD blobs.
- Index clobber (safe-commit class) also appeared: committed files showed as staged in `git diff --cached`; the same `git checkout HEAD --` repair cleared it.
- Telemetry deviation check (`scripts/telemetry-check.js` vs scale-wall baseline) was NOT run — outstanding; named here, not silently dropped.
- No claim file created: the run's claim file lives in the goal hidden_files lever-claims (coordinator-owned); not this arm's scope.

## Convergence state

Axis scale-onramp / winnability (converging, NOT converged). This arm does not move the convergence picture: the Binding funnel's national-hold step is unchanged on the pilot band (3/8 final both legs); the mechanism is proven to work but has no outcome to save on this base. The binding constraint exposed here is upstream: 76408's pre-national link decay (qualification persistence), and the absence of national-loss events on the current base. The drive-firing throttle (~1-in-3-week drive rate, mourning choke) remains the measured binding constraint on tend cadence, unchanged by this arm (this arm changed the gate, not the firing rate).

## Files / commits (branch `sim-tenddrive-a`, base `6680d7924`)

- `3047f3258` prereg. `d30fc5827` proof test. `59b63c36` sweep + judge instruments. `5ddcc0de` sweep fix. `f72edc66` EMPTY commit (accident, see above). `26bd05f8c` baseline corpus (`perseed-tenddrive-a-before/`, 16 rows + summary.json). `91092b28` the FIX (`src/js/win-plan.js` only, 13 insertions / 2 deletions). `2450185b4` candidate corpus (`perseed-tenddrive-a-after/`). `9d2b185f` sense replay (`sim-tenddrive-a-sense.txt`). `c00dbad20` panels + compare. `9da541de6` REVERT of the fix (2 insertions / 13 deletions; zero `src/js` diff vs base).
- Evidence: `evidence/2026-11-08/sim-tenddrive-a.md` (this file), `sim-tenddrive-a-prereg.md`, `sim-tenddrive-a-sense.txt`, `perseed-tenddrive-a-before/`, `perseed-tenddrive-a-after/`, `tenddrive-a-panel-before/panel.json.gz`, `tenddrive-a-panel-after/panel.json.gz`, `tenddrive-a-panel-compare.md` (+`.json`).
- Instruments: `scripts/test-tenddrive-a.js`, `scripts/test-tenddrive-a-sweep.js`, `scripts/test-tenddrive-a-judge.js`.
- Worktree contains only committed work. Fix reverted; branch tip `9da541de6`. Ready to merge via --ff-only (no game-code change lands).
