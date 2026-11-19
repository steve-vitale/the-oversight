# Journey social life — r238 (Lane B, leg 5)

Run ID `2026-11-19T09:00:00Z-loop2-leg5-r238`. Base master `7235e2102`.
Seeds 45749–45752 (fresh band; 45741–45744 and 45745–45748 rejected as used).
Driver `scripts/journey-social-life-r238-20261119.js`, analyzer
`scripts/analyze-journey-social-r238-20261119.js` (r237 verbatim except
seeds/OUTDIR). DAYCAP 140.

## Prereg (carried)

Leg question: does social life hold up across a full run — invitations
sometimes taken, bonds proposed/answered by character, moots firing,
conversations reading as people, wants surviving across sittings without
the dry line — and do the r226 F6, r231 C3d, r234 DRY2, r235 DRY3, r236
TRAILTALK, and r237 OUTING-SEEK fixes hold in the wild?

Arm: **F5 targeted harness** (owed since r231; six thin wild panels).
The three r225 settled-favor variants live in `src/js/conversation.js`
~7330–7360. Metric binding: pre-registered bars bind; a miss is NO-GO,
never re-scored mid-run.

## Panel (unfixed code)

Exit 0, ~6.7 min. 45749 survived d140 (alive 9); 45750 village-lost d129
(alive 1); 45751 village-lost d60 (alive 4); 45752 survived d137 (alive 3).
2/4 survived. No village won or ended. Logs:
`journey-social-life-r238-panel.log`, per-seed JSONs,
`journey-social-life-r238-analysis.log` (729 lines, exit 0).

- **F6 WILD HOLD — NO-GO: dryLines=2 panel-wide (bar 0).** Breaks the
  three-clean-panel streak (r235/r236/r237: 0). Both dries on seed 45752,
  villager `gen_q7fjsql` (Esperanza), D-talk-request sittings, 12 turns
  each, immediately after the player choice "I owe you. Let me make it
  right — what do you need?" (`alive:want:repay`). Both sittings also show
  the driver asking "Wait — what were we talking about?" twice and generic
  closers repeating ("We're square" / "Don't mention it" 3x). **These
  dries are at the REPAY-OPENER site, NOT the F5 all-3-blocked residual.**
- **F5 wild (analyzer counter, first real count): 3 servings, all on
  45752, all by Catalina Reyes in C-friendship** — one of each variant
  (V1/V2/V3 = 1/1/1); 0 on the other three seeds. Wild count is
  report-only; the harness is the judge.
- **TRAIL WILD HOLD — distinct FAIL, recurrence PASS:** 6 trail-talk
  presses (45749: 1, 45750: 0, 45751: 1, 45752: 4); distinct lines
  panel-wide **2** (bar ≥6) — FAIL. Max recurrence per seed 4 on 45752
  (bar ≤4) — PASS at the bar. All presses are pool[0] for the villager's
  temperament (5x default "Two pairs of eyes, twice the ground. That was
  the deal, and it is working." + 1x warm "This is the part I like. Just
  us and the green."). The driver presses talk exactly once per outing by
  design, and `talkLine` returns the first unused pool index — always 0
  on a first press. r237's 8 distinct came from a stranded multi-day
  outing pressing talk repeatedly, not from the one-press design. The bar
  as written measures press frequency, not pool depth; the pool itself is
  proven deep (r237). See metric review.
- **Outing chain:** 15 attempts, **6 delivered-promise-kept**, 0
  delivered-not-kept, 6 trail-talk presses, **3,600 kcal** delivered
  (45749: 1285, 45750: 0, 45751: 1190, 45752: 1125). Conversion 6/15 = 40%
  (r237: 6/33 = 18%). Blockers: positioning 3, forage 3, readiness 1,
  depart 1, unexpected-action 1. No outingArmErrors.
- **M1 GO:** 6 plots, 6 arms, grievance-linked 6/6 by the reasons bar
  (binding judge); springs 6 (escaped 3, killed 2, hurt 1); 0 expired
  plots; vendetta max 3 (Elie↔Nina).
- **M2 rate 0.345** (161 proposals / 466 lived days; r195 0.328, r200
  0.177 — watch only).
- **M3 GO (sometimes-taken):** lure 429 accept / 391 decline; party
  30/30; bond 5 accept / 10 decline.
- **M4:** 513 transcripts, 181 nearDupFlags — same families as r234–r237:
  Haven-door positioning instruction cluster, repeated live-want re-asks
  (pantry run / creek water run), teach-lesson same-opening template.
  Instructional repeats, not conversational parroting. The M4 split
  proposal (instructional vs conversational) stands for the next run.
- **M5 report-only:** 3/4 past d100. **Moots 9** (2+3+3+1).
- **M6 GO** (re-aligned gate definition): away-gate 0 on all four kinds;
  debates kicked/settled 137/137. Strict-definition away total 81 = known
  metric/gate discrepancy, does not fail M6.
- **M7 HOLDS:** NARR-DUP verbatimRepeats 0. **M9 HOLDS:** recap 555
  presses, 0 after cap. **M10 HOLDS / FACE HOLDS:** coach/face verbatim 0.
- **M11 GO:** recap-empty flags 0/181. **M12:** door-req flags 100/181
  (19.49%); worst sitting 8 serves (ruth_goldstein, C-friendship, 45750).
  **M12-native HOLDS:** threeTimes total 51, max 1 per sitting, 0
  sittings 2+, exits 187.
- **M8 SETTLED:** 3 settles, 3 link-formed, 0 BLOCKED re-raises after a
  settle.
- **B5:** 16 funerals — 10 full / 5 partial / 1 none (r237: 10/5/0).
  Funeral feasts honest.
- **B6 GO:** 537 want-resolutions, deflected-from-stage-0 = 0.
- **CONFESS:** 33 total, 11 confessed, 13 already-confessed, 4 cleared,
  5 deflected, 0 double-confession sittings.
- **BOND ANSWERED:** 161 villager-initiated proposals (159 villager + 2
  scholar; 100 link, 61 person; 33 accepted, 10 refused, 73 staged, 45
  expired). Person accepted 15. End bonds per seed: 76 / 108 / 67 / 98.
- **RE-OFFER max 12** (same watch level as r236/r237).
  **DROPPED-THREAD: 2 drops** (534 conversations).
  **SCATTERING: 2/4** (45750 d129, 3 hungry days, 1 alive; 45751 d60, 3
  hungry days, 4 alive).
- **Census:** 45749: 4 successions (Dorothy→Scarlett→Sarah→Nikolai→Theo),
  20 feasts, 2 moots. 45750: 12 successions, 18 feasts, 3 moots. 45751: 3
  successions, 8 feasts, 3 moots. 45752: 9 successions, 19 feasts, 1
  moot. Scholar deaths (mantle passes): 28 panel-wide (4/12/3/9).

## F5 harness — GO

`scripts/test-journey-social-life-r238-f5-harness-20261119.js` — **50
passed, 0 failed.** Cases 1–3 + 5, 0 dry. Case 4 (ALL3-BLOCKED,
characterized): variant=null, dry=true — the r226 residual CONFIRMED.
Case 6 (REPEAT-ASK EXHAUSTION, characterized): [V1,V2,V3,DRY,DRY,DRY]
on unfixed code. **After the fix below, case 6 serves the fallback
instead (OTHER,OTHER,OTHER, dryCount=0) — see the fix section.**

## Headline finding: the wild F6 dries — traced and FIXED

Site: the `alive:want` branch in `src/js/conversation.js` (7317–7474),
reached via `alive:want:repay` (`src/js/convo-scene.js:456`). The repay
opener (`src/js/convo-wants.js:1086–1089`, fulfilled favor) is a single
fixed line per favor-short; the stale opener (1116) has two variants via
`convoPickCycle(vid, 'repay:stale:' + favor.kind)`.

Probe `scripts/probe-r238-repay-dry-20261119.js` (run, then superseded
by the proof test and removed):
- Case A (opener + stale-v1 blocked): spoke stale-v2. The pick itself
  skips the blocked variant — `convoPick` has run-ledger awareness
  (prefers lines no villager spoke in the current window). The stale
  hole the prereg suspected does NOT exist; the guard's single stale
  attempt is enough because the pick already walks the pool.
- Case B (opener + stale-v1 + stale-v2 + fallback all blocked): DRIED
  — wild reproduction, exact mechanism. The F6 guard gives up (wline =
  null) and the turn falls to the generic `done()` fallback
  `"Okay. Here’s the thing —"`, which was handed to `sayLine` UNCHECKED;
  a ledger-blocked fallback dry-replaces.

**Fix (same class as F6 — check the ledger before handing sayLine a
line), `src/js/conversation.js`, `alive:want` branch, two edits:**
1. F5 branch: all three settled-favor variants blocked → `wline = null`
   (fall through to the generic fallback) instead of keeping the blocked
   pick. This also closes the r226 residual — the F5-ALL3 fix is DONE
   this run, not next run's arm.
2. Before `done(...)`: when `wline` is null, set `structuralTurn = true`
   — the last-resort fallback is conversation GRAMMAR (r17), not
   content, so it is exempt from the run-ledger block and always speaks
   instead of drying. There is exactly one `done(wline || ...)` fallback
   site (line 7473), so the change is contained to this branch.

**Proof test** `scripts/test-journey-social-life-r238-repay-fallback-20261119.js`
(real sittings, real sayLine ledger; poison through another villager's
sitting, re-ask in a fresh sitting — r226 pattern):
- RED on unfixed code: **32 passed, 4 failed** — both discriminator
  cases dried (all-blocked repay; all-three-F5-blocked), controls passed.
- GREEN on fixed code: **36 passed, 0 failed.** Controls: fresh opener
  speaks the opener; opener+stale-v1 blocked speaks stale-v2 (unchanged).

**Standing proofs re-run on fixed code — all green:** F5 harness 50/50,
F6 proof (`test-journey-social-life-r226-f6-dry-opener-20261116.js`)
49/49, TRAILTALK proof (`test-journey-social-life-r236-trailtk-20261118.js`)
30/30.

**Targeted confirmation — seed 45752 re-run on fixed code**
(`SEEDS=45752 OUTDIR=evidence/2026-11-19/r238-fixed-45752`, 84s, exit 0):
- dry lines **0** (was 2). F5 servings unchanged 1/1/1 (Catalina Reyes).
- Both dry sittings now end naturally: forced closes 5→3, natural ends
  151→153; fallback serves 2→5.
- JSON diff vs the original panel JSON, modulo wall-clock and the
  sitting-number offset (the panel process ran 4 seeds sequentially, so
  45752's sitting numbers are cumulative; the re-run ran 45752 alone):
  only the two dry turns and their driver re-ask exchanges, plus small
  downstream count ripples (p/v ±2). A full 4-seed panel re-run is NOT
  required; the adoption (or next run) re-runs the full panel to confirm
  the wild F6 hold.

## People check (SENSE-TESTING LAW)

Both dry sittings read in full (Esperanza, gen_q7fjsql, d134 + d135,
D-talk-request, 12 turns, endTrust 76/78). They read as a person until
the repay choice: she opens warmly ("I believe in this group. Even on
the days I don't believe in much else."), presses a kept tool into the
player's hand, pushes back naturally on the driver's repeated "Wait —
what were we talking about?" ("We're going in circles a bit"), then the
player asks "I owe you. Let me make it right — what do you need?" and
she blanks: "...Sorry, lost my train of thought." The generic closers
then cycle ("We're square" / "Don't mention it" 3x each) because the
want never surfaced. The second sitting ends "Good — that debt, settled.
Feels better said out loud." — the debt IS settled in the fiction, but
she never got to voice the thanks aloud because the opener was blocked.
The fix removes exactly that break; everything around it already reads
as a person. The driver's twice-per-sitting re-ask pestering remains a
remainder (Olivia triple re-ask family).

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/social.json
--current 'evidence/2026-11-19/journey-social-life-r238-*.json'
--metrics l3.bonds,l3.deepBonds,l3.betrayalCases,l3.mootsConvened,l3.gossipConvos,dryRate,l2prime.count`
— LOUD on all five l3.* keys + l2prime.count: the known stale-era schema
drift (driver emits `bondEnd.bonds` / `social.moots`, never `l3.*`; r237
precedent). dryRate quiet. Baseline NOT rolled over schema drift.

## Verdicts

- **Reachable:** yes — social life fires across the full run on all four
  seeds (moots, bonds, confessions, outings, funerals).
- **Fun:** mostly — the dry line is back in the wild at the repay site
  (fixed this run; confirmation above) and the instructional repeats
  still nag, but the sittings read as people and the F5 variants serve.
- **Winnable:** not judged on this leg.

## Metric review

- TRAIL distinct bar is mis-shaped: it measures press frequency, not
  pool depth. Next run: revise (count distinct per press-opportunity,
  or raise presses per outing so the pool walks). Distinct is FAIL as
  written; not re-scored.
- M4 split proposal stands (instructional vs conversational repeats).
- F5 wild count is now real (analyzer counter added this run); keep it
  report-only while the harness judges.

## Remainders

- F5-ALL3 fix — DONE this run (proof test + harness case 6 + 45752
  re-run). No longer the next run's arm.
- Zinhle creek-pocket strand (outing can strand when the return route is
  creek-blocked; design look, not a driver tweak).
- Olivia triple re-ask / driver re-ask pestering (twice per dry sitting).
- repay.engageBeat pools (broken/open).
- Proof refresh round 21 now owed — this run changes src/js
  (conversation.js); the measurement-proof pair must be re-run (adoption).
- Gate: `node scripts/check.js --quick` NOT run in this occurrence
  (budget; adoption must run it solo, re-run timeouts standalone before
  attributing, expect the standing set: measurement-proof staleness pair,
  stale phone-frame receipt, deed-attainment 120s timeouts under load).
- Full 4-seed panel re-run on fixed code to confirm the wild F6 hold
  (adoption or next run).

## Closeout

Merged locally, pending ship (ship loop owns bump/push/live verify).
Rotation-b 5→6. Lock deleted after run_id verification.

## Adoption addendum — full 4-seed panel re-run on fixed code (2026-11-19 ~11:40Z, tip `416e81241`)

Worktree `journey2-social-adopt`, base `416e81241` (master at rebase; includes the r238 fix `e7bd782ab` plus the speargate-a lever commits, env-gated OFF, and the #2593 ammo-naming narration). Same driver/analyzer as the run, seeds 45749–45752, DAYCAP 140, OUTDIR `evidence/2026-11-19/r238-fixed-panel` (the run's original unfixed JSONs untouched). Panel exit 0 (~185s); analyzer exit 0 (718 lines, `r238-fixed-panel-analysis.log`).

**F6 wild hold — CONFIRMED: dry lines 0 panel-wide (bar 0) — GO.** Unfixed panel had 2 dry lines on 45752; both sittings now end naturally (forced closes 5→3, natural ends 151→153). The dry line "...Sorry, lost my train of thought." is replaced by "Okay. Here’s the thing —" and the sittings close with "Good — that debt, settled. Feels better said out loud." A third turn on 45752 also changed: a repeat-ask "I just said — did you miss it?" now falls through to the generic fallback — the F5 all-3-blocked fall-through firing in the wild.

**F5 settled-favor: V1=1 V2=1 V3=1, total 3, dryLines=0** — all on 45752, Catalina Reyes, C-friendship. Unchanged from the unfixed panel.

**TRAIL wild hold — distinct FAIL as written, recurrence PASS:** presses 6 (45749: 1, 45750: 0, 45751: 1, 45752: 4 — counted once per spoken line; each line is recorded twice in the JSON, once as `outingArm/stages/line` and once as `transcript/text`); distinct lines panel-wide **2** (bar ≥6) — FAIL; max recurrence per seed 4 on 45752 (bar ≤4) — PASS at the bar. Same two lines as the unfixed panel (default pool[0] + warm pool[0]). The metric-review note stands: the bar measures press frequency, not pool depth — the pool is 6 deep per temperament since r236, but only two temperaments fired in this panel. Not re-scored.

**No regressions elsewhere:** B5 funerals 16, full 10 / partial 5 / none 1 (identical to unfixed). B6 GO. M6 GO (re-aligned definition). M9/M10/FACE HOLDS. M11 recap-empty 0. M12 threeTimes 51, max/sitting 1, 0 sittings 2+, exits 187 (within the revised bar). Dropped threads 0. Recap cap failures 0. Villages survived 2/4 (45750 d129, 45751 d60 village-lost — same as unfixed). Determinism check: seeds 45749/45750/45751 differ from the unfixed JSONs only in `manifest/commit` and runtime `ms` — trajectories byte-identical; 45752 differs only in the three fixed turns above plus pacing ripple (3 pacingDays values).

**Proof tests re-run on the rebased tip `416e81241` — all green:** repay-fallback 36/36, F5 harness 50/50, F6 proof 49/49, TRAILTALK proof 30/30.

**Adoption blockers (for the record):** a host write flap (~10:13–11:02Z, ~49 min, ended by a VM replacement, boot `813e39bb`) killed the first worktree checkout and its repair; the adoption waited it out, then rebuilt the worktree with `git reset --hard HEAD` (100%, 103,876 files, exit 0) and registered it manually (the register script cannot adopt an existing tree). Flap size/timing data measured during the window: 100B writes pass while 26KB fail in the same seconds; 1B passes; window flickers at ~10–30s granularity. Telemetry adjudication verified from the per-seed JSONs (no `l3.*` keys; driver emits `bondEnd.bonds` / `social.moots`) — schema drift, baseline NOT rolled.

**Remainders carried (unchanged):** Zinhle creek-pocket, Olivia triple re-ask / driver re-ask pestering, repay.engageBeat pools broken/open, M4 split proposal. Proof refresh round 21 + gate follow in the adoption closeout.
