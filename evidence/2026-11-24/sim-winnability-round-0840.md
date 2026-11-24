# Loop B round — run fleshout-loop-b-20261124T0840Z (axis winnability-chain — 3 arms DIAG-GO; 0630Z adoption closeout inside)

## Run shape

STALE-LOCK RECOVERY at start: B lock 116 min old (run fleshout-loop-b-20261124T0630Z, created 06:44:08Z), no registry entry or heartbeat for that run, no live coordinator — dead by the guard. Lock deleted and replaced 08:40Z. The 0630Z run's three arms were ALL already on master (gunholder-census bffb130f6, standingconfirm 41322de7f, havenlink e85c97a28); this run adopted its closeout: havenlink worktree released as done-merged, branch deleted, claim retired to .DEAD. No 0630Z round record existed; this record covers its arms' landing too. Loop A live on scale-onramp all run (0715Z claim: retarget NO-GO merged, holdspeak + departteach in flight, then a 0915Z adoption after both workers were cancelled — NOT touched).

Pre-flight: main tree clean, disk 50%. Registration stalled twice: the register script's reap-first step hung on the registry lock (held by Loop A's departteach registration, then by a sibling reaper scan), and `git worktree add` checkouts ran ~10 min each under load ~11. Workaround per AGENTS.md: killed the stuck register loop, ran the register python block directly under `flock -w 300` (same checks, same entry format, reap skipped — cap had room, 13/16). All three trees registered. VM restart ~09:26Z (uptime 1 min on recovery); all three workers survived, trees re-heartbeated 09:27:48Z, no work lost. Write flap ~10:04Z: accordanswer release failed with EPERM on the registry write; probe OK minutes later, release retried clean. Index-clobber transient D-entries observed mid-commit in two worktrees; verified clean after (files on disk, `git diff HEAD` empty) — no repair needed.

## Arm 1 — sim-vetpair-b (DIAG-GO, merged 8b391b0ed)

Veterans alive TOGETHER, the binding bar (standingconfirm next blank #1, 703 days). Replay of the standingconfirm band 109310–109325, 16 seeds, 150d, competent verbatim. All 4 frozen bars pass: 30/30 killers classified, 0 unclassified; overlap measured on 16/16, 0 instrument errors; determinism replay byte-identical on 109314; 0 orphans/mismatches.

Headline REFUTES the prereg's working description ("pairs never overlap") and replaces it: **92 overlap days, 6 windows, on 4 seeds; max 4 living veterans at once (109312). The pair is the door's fingerprint — every readiness-5-ready day (85, on the same 4 seeds) is an event-overlap day.** Blooding→death median 15 days (21 dead killers; half die within 12 days); death causes: "the wild" 12, combat 7, starvation 1, disease 1. **Wave-5 kill CORRECTION: 3, not 4** — standingconfirm's prose counted a duplicate choke-point call as a second kill; future arms must count deduped LOG rows, never kill-event calls. Proof 7/7 on the rebased tip. Evidence: evidence/2026-11-24/sim-vetpair-b.md.

## Arm 2 — sim-guntransfer-b (DIAG-GO, merged 806643212)

The unrecorded living-holder gun transfer (sim-findings line 2732). Replay of the gunholder pilot band 107750–107757 + witness s107741. All frozen bars pass as amended (Amendment A1: custody exits are not transfers; Wanjiru replays as succession on d125, not d124 — the census's d124 was the double-row day).

**There is no secret gift / hand-over / scholar-take path.** 9 transfers, 0 unclassified: **succession 7/9** — the gun never moves; when the scholar dies, `playerDeath` + `mantleBecome` (ledger.js:658, villager-build.js:551) move the successor's OWN kit onto the scholar, so a villager holding a gun wakes up as the scholar holding a gun; **gear-day spares-gift 2/9** — `villagerGearDay` step 2 (villager-build.js:895) gifts a carried-but-not-worn duplicate weapon, and the power cells do NOT move with it, so the gift always arrives dry. Ruled out by code read + wrap (0 firings): lend/return (LEND unset), villagerGearUp (own stash only), corpse-take paths (add, never move between the living); no giveItem/giftItem/shareItem helper exists between villagers. Holder-days reproduce the census exactly (989); holders still never fire on the pilot band (0 volleys), though the witness seed fires once (131 dmg vs a wave-4 algorithm, d53). Finding line 2732 marked fixed; the worker's fix note carried a stale "ff-merge BLOCKED / NOT merged" line — corrected by this coordinator (merged as 806643212). Proof 18/18 on the rebased tip. Evidence: evidence/2026-11-24/sim-guntransfer-b.md.

New finding from this arm (appended to sim-findings): a worn-only gun is DESTROYED by the next autoEquip re-seat (`mantleBecome` splices the worn gun out of the pool; `autoEquip` rebuilds `equipped` from inventory ids only and drops anything worn-only). Fix direction: carry the worn gun back into the pack on re-seat.

## Arm 3 — sim-accordanswer-b (DIAG-GO, merged 345bbe835)

The first gesture is never made (havenlink next blank #2). Havenlink band 109301–109308 replay, control competent verbatim vs arm competent + `ANSWERMAIL_DRIVE=1` (existing env gate only, zero src/js). All prereg legs pass; proof 15/15 before and after the judged legs; control reproduces the havenlink corpus 8/8.

**The accord is load-bearing as the opener, not as the wall.** Answered 0/7 control, 7/7 arm, always same-day (lag 0), always the `gift`, always 2,000 kcal, always trust +10 (30 → 40, crossing the trust-40 season bar at once), always a different villager answering, never the player. Seasoned links 7/7 arm vs 2/7 control. But nothing structural moves: the Dawn fires on the same day, no new link forms, no offer or counter is ever staged, no village reaches national, no one wins; survival and standing swing both ways per seed. The drive's ride-along is measured as a confound (it answers more than the accord: tends, renegotiations, demands). The fiction fix — a voiced gesture — is now a build/design question, not a measurement question. Evidence: evidence/2026-11-24/sim-accordanswer-b.md.

## CELLGATE floor flip — DECISION: HOLD

The 0530Z blank #1 (floor flip to default 3) was a coordinator/Steve call. **HOLD — do not flip.** The holdout's bar 6 FAILED as frozen (9 control volleys vs ≤6, a calibration miss, one above the contemplated 7–8); metric binding (§14) forbids flipping on a failed bar, and the instrument's mechanical verdict field printing GO while bar 6 is unwired is a defect to fix, not a flip justification. The flip stays held until a re-registered holdout with a corrected bar 6 (and a wired verdict field) passes. No game change made by this run.

## Wall (this run's judged corpora)

- vetpair (16 seeds): wins 0/16, national 0/16, table 0/16, wave-5 unlocks 4/16, faced 3/16, kills 3 (corrected), wave-4 faced 15/16, readiness-5-ready days 85 on 4 seeds, median survival 150d (censored, 11/16 survived).
- guntransfer (8+1 seeds): wins 0, national 0, wave-5 unlocked 1/8, faced 1/8, median survival 148.5d.
- accordanswer (8+8 seeds): control wins 0/8, national 0/8, table 0/8, wave-5 unlocks 2/8, faced 2/8, wave-4 kills 23, wave-5 kills 1, median 122.5d; arm wins/national/table 0/8, seasoned 7/7 vs 2/7.

The wall did not move — all three arms diagnostic, as pre-registered. The winnability chain now has two sharper pictures: the door opens exactly when a living veteran PAIR exists (never otherwise on this band), and the gun chain's custody is tracked but the holders still never fire.

## Telemetry deviation check

On the accordanswer panel compare: 3 LOUD lines (national 12→0, table 16→0, wins 16→0) — all REGIME artifacts (single 8-seed competent probe file vs the WINSEAT baseline; the arm records 0/8 on both legs by design). Vetpair + guntransfer corpora: checker refuses recorder-corpus input (same as prior runs), no LOUD lines. Baseline NOT rolled.

## Gate

`check.js --quick` NOT re-run this run: three instrument-only arms (zero src/js across all three), proofs green on the rebased tips (7/7, 15/15, 18/18), main tree clean at closeout. Full repo gate OWED before this tip ships (standing from the 0230Z record).

## Next blanks, in order

1. What makes bloodings CLUSTER on door seeds? (vetpair #1) — pair forms when the second killer bloods before the first dies; candidate mechanisms: wave-4 spawn density / kill rate, party formation, field-fight damage/staying (win-fielddmg lane), wild ally-join (win-allyjoin lane). Coordinate, do not duplicate.
2. Worn-only gun destroyed by autoEquip re-seat (new finding from guntransfer) — carry the worn gun back into the pack on re-seat, with a proof test staging a worn-only gun + a better ranged arrival.
3. Accord fiction fix — a voiced gesture (accordanswer #1): player-facing choice at link formation (gift / visit / cold, costs already in code) vs a villager-side answer like the drive's. Design/build question.
4. CELLGATE floor flip stays HELD pending a re-registered holdout with corrected bar 6 + wired verdict field.
5. Diplomacy structurally zero / link formation (standingconfirm #2, still open).
6. Wave-5 facing after a late unlock (standingconfirm #4).

## Merges

Merged 8b391b0ed (vetpair DIAG-GO) + 345bbe835 (accordanswer DIAG-GO) + 806643212 (guntransfer DIAG-GO) + this record; merged locally, pending ship. Claim deleted; lock deleted.
