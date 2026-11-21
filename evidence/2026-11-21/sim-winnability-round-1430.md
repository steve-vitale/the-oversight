# Loop B round 1430Z — ADOPTION of the timed-out 1030Z round (winnability chain)

**Run:** fleshout-loop-b-20261121T1430Z · **Axis:** winnability chain · **Master at closeout:** `84e57fcc3`
**Type:** ADOPTION — both arms finished from the timed-out 1030Z round's on-disk state; nothing re-rolled.
**Loop A live on scale-onramp throughout** (1415Z claim: draftmiss / m1range / vanishcause — NOT touched; Loop A landed sim-draftmiss-a DIAG-GO mid-run as `451d3ac31`, zero src/ changes, no interference either way).

## Stale-lock recovery (run start)

- Lock `fleshout-loop-b-20261121T1030Z` (created 10:31:32Z) was ~4h old at run start (14:29Z) with NO registry entry for the run; the main-chat adoption coordinator for the 1030Z round had completed ~14:18Z but left lock + claim + uncommitted trees in place. No tree writes <15 min old (newest ~13:51Z). Deleted per the 90-min fallback; 1030Z claim retired to `.DEAD` with a note. New lock + claim `fleshout-loop-b-20261121T1430Z` written; axis winnability-chain per the re-point.
- Pre-flight: main tree clean, disk 48%, `worktree-reap.sh` clean (11/16 active; all three 1030Z trees correctly refused as uncommitted-changes).
- Write flap ACTIVE again at run start (~14:37Z, registry atomic writes EPERM) and intermittent throughout; plain file writes succeeded, verified by readback. Heartbeat loops inherited from the 1030Z round (profilegate every 600s, poolfirstfail every 1800s) kept running; poolfirstfail's heartbeats had not landed since 13:31Z (flap-blocked registry writes).

## Arm 1 — sim-profilegate-b: GO (LANDED `84e57fcc3`, [needs-eyes])

Scoped profile-gate relaxation for wave-4+ plan holders (#2638 + #2605): `findCompanion` twins in `villager-brain.js` + `win-plan.js` skip the wanderer/explorer profile check only when `PROFILEGATE4=1` AND the holder's plan has `needWave >= 4`. Default OFF; no default flipped (the flip is a coordinator/Steve call).
Adoption state on disk: lever built uncommitted, prereg frozen, off/on corpora 8/8, rec 1/8 + three 0-byte flap-killed `.tmp-59348` partials, rec0 missing. Adoption worker deleted the debris, ran proof **75/75 green**, completed rec (7 seeds) + rec0 (8 seeds), drift + analyzer + balanced panel, sense-tested, committed lever + instrument + evidence in one commit (48 files).

Frozen bars, band 106741–106748, 150d, competent verbatim:
- **B1 PASS** — wave-4+ pool empty 0.9315 OFF → **0.075** ON; mean eligible 0.075 → **2.9**. Picks: forager 45, homebody 23, wanderer 6.
- **B2 PASS** — launched instances **8 vs 6** (bar ≥5 and > OFF); wave-4+ launch events 40 vs 32.
- **B3 PASS (exactly at the bar — fragile)** — starvation 7 vs 5 (bar 7), arm-only 3 vs 1 (bar 3), median survival **144.5 vs 150.5d** (bar 120.4). Concentrated on seed 106745 (already starving OFF leg). Metric review flags it: a confirm band is owed before any default flip; not re-scored.
- **B4 TRACKED** — pooled damage share **0.0336** over 18 meetings (best 20.8%, 5 meetings dealt 0, 1 launched kill). Lower than parent ON (0.0577) and launchfunnel (0.085): **the damage wall now binds, not the pool.**
- **B5 PASS** — proof 75/75, D2 rec≡on / rec0≡off with 0 divergences, drift CLEAN 8/8 (2 seeds identical), anchors all `2b97163b0`, classified 1.0, unknown 0.
- Panel (§15): `review_required`, no material signal; community loss 0.375→0.5 flagged `regression_watch` (one extra lost village, interval covers zero).
- `check.js --quick` INCOMPLETE, never green — killed by the 280s timeout at 74/344 scripts, 0 failures in the completed portion; recorded honestly in the evidence per the prereg.
- Sense-testing: elif_demir + forager chantal_mukendi vs the reunion, day 105 (fought, 120/1111 HP) reads as a person choosing to go; s106744 homebody holder holding days 87–89 (inviter-range-0). Evidence correction: the hold lines exist in code (villager-brain.js:736/:768) but the `vetSays` capture is SAY_RE-filtered — the genuine gap is narrower: ordinary wave-4+ departures have no fiction line (no `say` on the launch path) — filed as a new finding.
- Findings backlog: #2484 (damage wall re-measured) and #2498 (selected-blocked confirmed on a second band) updated; one new open finding (ordinary-launch silence) appended.

## Arm 3 — sim-poolfirstfail-reanchor-b: DIAG-NO-GO (LANDED `d099dc659`)

Re-anchor + re-judge of the 0430Z poolfirstfail arm. Adoption state on disk: prereg frozen, driver a 0-byte husk, no analyzer/test/corpora. Adoption worker rebuilt all three instrument files from the landed originals per the prereg and executed the run procedure verbatim — and the new §0/§I anchor checks caught a defect nobody had seen, before any judged sim ran.

**The finding — a correction to the original arm's verdict:** `EXPECTED.anchor12` is `'df40fced1'` (**9 characters**), but the inherited analyzer comparison slices 12: `(anchorCommit).slice(0, 12) !== EXPECTED.anchor12`. A corpus stamped with the correct full frozen base slices to `'df40fced12a0'`, which never equals `'df40fced1'`. Verified by the coordinator against the ORIGINAL analyzer on master (`scripts/analyze-poolfirstfail-b.js:51` + `:647`) — same 9-vs-12 comparison. The original arm's NO-GO was blamed on the wrong stamp (`38692c34c24b`) alone; even the right stamp fails this comparison. The original bar (c) could never have passed with any stamp. Nothing amended (post-hoc amendment forbidden); the miss is reported as measured.
- Proof test **46 passed, 2 failed** (exit 1), both failures the same comparison. Per the frozen procedure (proof green before any judged leg), **no judged leg ran**: no re-recorded corpora, no analysis JSON, no balanced panel. Bars (a)/(b) unmeasured on new corpora; bar (c) fails.
- The re-anchor itself is proven working: §0 live-positive passes (live 150d run's `anchorCommit` is the full frozen base while HEAD has moved); CLI guard + per-`oneRun()` sentinel guard verified live; §4 live run reproduces the original arm's numbers **exactly** (378 holder-state rows, 23 pool rows, 148 census rows on seed 106731); D1/D2 pass; Leg R 10/10; selftest 77/78.
- Sense-testing re-read the original corpora: day 109, seed 106731 — holder visjoin_106 picks `party_wait` all day doing one indoor chore while Luis/Nathan/Nikolai are away and the two home villagers are foragers one range point short of wanderer. Wall (original band, quoted): wins 0, national by rank 0, by standing 3, table 0, wave-4 8/8, wave-5 3/8, median 146d, deaths 670, starvation 3, standing-199 ×4.
- Landing proof re-run on the rebased tip reproduced **46/2 exactly** (frozen `src/` checkout, restored + verified after). Zero `src/js` changes in either commit; `src/` restored to HEAD and verified (known 4-file delta vs `df40fced1`).
- **Next step (coordinator decision, not this run's):** re-freeze exactly one line, then re-run this arm's procedure with the instrument already built — Option A (preferred, matches the field name) `EXPECTED.anchor12` → `'df40fced12a0'`, or Option B the comparison slice → `(0, 9)`. Expected outcome after re-freeze: DIAG-GO on the reproduction criterion.

## Arm 2 — sim-dmgpin-scout-b: STOPPED (unchanged, not re-attempted)

STOP file stands (~13:40Z): the pinquaddoor port (`git diff b20328ad9 94e0b5b85 -- src/`, 6 files) fails `git apply --check` on one hunk — the patch's old pick line in `fieldFights.js:1756` would REVERT the landed #2634 downedtwice fix. The frozen STOP condition fired (no hand-resolution). Tree holds only the prereg + STOP note, no src/ changes. Next step is a NEW re-port brief that preserves the #2634 pick line — not a rerun of this arm. #2605 launch engine still BLOCKED on the held sim-pinquaddoor-b branch.

## Landing (coordinator)

- Arm 3 merged first (`d099dc659`, ff-only, exit 0, ancestor verified), then arm 1 (`84e57fcc3`, ff-only, exit 0, ancestor verified). Order chosen deliberately: merging the profilegate lever first would have broken the poolfirstfail proof's §1 pool-path identity check (HEAD's `villager-brain.js`/`win-plan.js` would carry the lever); arm 3's proof re-run (46/2 reproduced on the rebased tip) was verified before arm 1 landed.
- Loop A landed `451d3ac31` (sim-draftmiss-a DIAG-GO) mid-run: the first profilegate merge attempt correctly refused ff-only (diverging), and a transient `.git/index.lock` (sibling git process) failed one merge attempt and cleared on its own — never deleted by hand. Both branches rebased onto the moved master with zero arm-file overlap; arm files verified byte-identical across every rebase.
- Rebase stop-at-pick quirk struck once on the profilegate rebase (pick in both done and todo lists, tree clean, pick unapplied) — recovered with `git rebase --continue` per the documented lesson; final log shows the commit exactly once.
- Safe-commit index clobber struck both worker commits + was repaired via cacheinfo each time (commits verified correct). No EPERM flap block on any commit this run (writes verified by readback).
- Worktrees released (`merged`) and removed; branches deleted. Main tree clean at closeout.
- **Telemetry deviation check: NOT RUN this round** — the run's time budget was consumed by the two landings (two Loop-A-interleaved rebases + the poolfirstfail landing proof re-run). The judged corpora are on master (`perseed-profilegate4-b-on/` + panel); the next run should run `telemetry-check.js` against the profilegate ON corpus before judging any further scale-wall claim. No baseline rolled.
- No push, no bump, no live verification — merged locally, pending ship (batch ship loop owns deploys).

## Wall (this run's judged corpora — profilegate band 106741–106748)

National 0/8, table 0, wins 0, wave-4 8/8, wave-5 4/8 ON (5/8 OFF), survived 4/8 ON, median survival 144.5d ON vs 150.5d OFF. Standing-199 stall visible again (3 ON villages at exactly 199). The pool is no longer the binding constraint on this band — damage is (B4 0.0336) — and the veteran/standing wall stands behind it.

## Metric review

- Profilegate: B3 passes exactly at both starvation bars on 8 seeds — the GO is real but fragile; the frozen bars were honored, not re-scored. A 12–16-seed confirm band is owed before any default flip.
- Poolfirstfail: the anchor comparison defect (9-vs-12) invalidates the anchor clause of the ORIGINAL arm's NO-GO as written — not the decomposition, which reproduces exactly. The re-freeze + re-run is a correction, not a re-roll: the bars stay frozen, only the broken comparison is fixed.
- Dmgpin: the port-gate STOP is the correct outcome for a brief that forbade hand-resolution; the re-port is a new brief's job.

## Next blanks (in order)

1. Re-freeze `EXPECTED.anchor12` (Option A: `'df40fced12a0'`) + re-run the poolfirstfail re-anchor judged leg on band 106731–106738 with the instrument already built and landed.
2. Dmgpin re-port brief: port pinquaddoor onto current master preserving the #2634 pick line, then re-judge #2619 via the control-only scout pre-screen.
3. Damage wall: launched parties deal 3.4% pooled — the next lever must raise damage per launched party, not pool fill.
4. Profilegate confirm band (12–16 fresh seeds) before any PROFILEGATE4 default flip; B3 fragility is the thing to watch.
5. Ordinary-launch silence (new finding): wave-4+ departures have no fiction line — a voice/narration blank.

## Evidence

- `evidence/2026-11-21/sim-profilegate-b.md` (commit `84e57fcc3`), prereg, `profilegate4-b-analysis.json`, panel `.json`/`.md` + before/after `.json.gz`, corpora `perseed-profilegate4-b-{off,on,rec,rec0}/` (8 each)
- `evidence/2026-11-21/sim-poolfirstfail-reanchor-b.md` (commit `d099dc659`), prereg, `poolfirstfail-reanchor-b-prooftest.log`, instrument `scripts/poolfirstfail-{driver,analyze,test}-reanchor-b.js`
- `evidence/2026-11-21/sim-dmgpin-scout-b-prereg.md` + `dmgpin-scout-b-STOP.md` (in the unmerged `sim-dmgpin-scout-b` worktree — STOPPED, held, not landed)
- This file: `evidence/2026-11-21/sim-winnability-round-1430.md`
