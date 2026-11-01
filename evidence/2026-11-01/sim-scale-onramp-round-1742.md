# Loop A round 1742Z — scale-onramp, 2 DIAG arms, merged locally pending ship

Run: fleshout-loop-a-20261101T1742Z (scheduled 11:15 CST, started 17:42Z).
Axis: scale-onramp (converging, NOT converged). Sibling Loop B live on
food-economy throughout (1725Z claim: dipslide3 + multisweep; its 1830Z
coordinator evidence 62aaa8f21 landed mid-run) — NOT touched. No
game-code change in this run: both arms DIAG only, zero src/js, no lever
flipped, no version bump, no push.
Rotation file left at 3: convergence-directed axis work overrides the
rotation this run (same precedent as 1415Z/1706Z).

## Pre-registration (coordinator, before any worker sims)

Claim written before any sims:
hidden_files/lever-claims/fleshout-loop-a-20261101T1742Z.json
(scale-onramp; arms sim-heraldarr2-a, sim-muster3-a). Arms chosen from
the 1706Z next blanks after re-reading the tracker and the live Loop B
claim:
- (1) Herald (4,4) arrival landing step, raid-pin suspect, long-run band
  (1706Z blank 1) — NEW arm sim-heraldarr2-a.
- (5) Muster yield generalization, third contacted seed (1706Z blank 5)
  — NEW arm sim-muster3-a.
Blank (3) #1538 steve-call skipped (needs a ruling first); field-death
narration is observation-only, folded as secondary observation into
heraldarr2, not a standalone arm.
Both arms pre-registered their own headers in-worktree BEFORE any judged
sims (heraldarr2: 698e0bf30; muster3: b1e3a95b3, predecessor commit,
adopted unchanged). Panel §15: inapplicable — DIAG-only censuses/proofs
with no before/after intervention. No compare fabricated.

## Infrastructure incident (reported, not smoothed)

Both original workers were killed at ~18:00Z by a runtime transport
error (sqlx pool timeout), NOT by their work. Both had already committed
usable progress (heraldarr2: prereg + instrument; muster3: prereg +
runner/proof). Replacement workers were spawned with adoption briefs,
verified the predecessor commits against the briefs, discarded partial
screen output and re-ran screens from scratch, and completed both arms.
No work was re-judged or re-scored in adoption; verdicts below are the
adopted workers' own. Safe-commit index clobber struck the muster3
evidence commit and heraldarr2 twice — repaired per the recorded lesson
(update-index --add --cacheinfo from HEAD blobs), commits verified
correct, main tree clean. Master moved three times during landing
(Loop B 1830Z evidence, journey-deepening r81, plus this run's own first
merge); both branches were rebased cleanly in their own worktrees with
proofs re-run on each rebased tip before --ff-only merges. Merges
verified alone before any chained release/remove step.

## Arm sim-heraldarr2-a (merged --ff-only; proof re-run on the rebased tip: 22/22; diff guard zero src/js): DIAG-GO

Question: does the Herald reach the Haven tile by raid pinning, the
rival left standing after heraldarr-a ruled out follow-enter?
Answer: YES, proven. On a longevity-screened band (34 scanned from
95401, 16 qualifiers with gameDays > 120 AND won == 0; survival/won
fields only), pilot qualifiers 1–8 + confirm qualifiers 9–16, DAYS=180
death-aware, substrate tableseat-nowait + fullseat-diag + wavegate-diag:

- Haven arrival windows: 5 total, ALL raidPin, all chain-continuous, no
  gap — pilot 95404 d109→110, d113→114, d134→135; 95408 d172→173;
  confirm 95429 d136→137.
- Draft census: pilot 1,400/1,400 raid calls classified (cooldown 784,
  roll-miss 449, draft 129, pantry 38; 0 unknown); confirm 1,346/1,346
  (688/513/107/38; 0 unknown). Herald status total: 7 drafted, 26
  rank-missed (draft fired but Herald beyond raidN — now
  distinguishable from a non-draft, which was this arm's instrument
  point), 414 gate-or-roll, absent otherwise. Audit verified absent
  iff Herald not in the pre-call sorted list on all 1,400 pilot records.
- Linger census: pilot 17 repin-moved + 1 repin-held, 0 missing days, 0
  drift-cleared; confirm 0 lingering entries (its drafted Herald was met
  promptly). Edge cases flagged by design: draft-moved-off (95404 d121:
  drafted rank 0, fled at 1 HP inside the same raid call) and
  draft-in-place (95404 d118: re-drafted while already on Haven).
- Bars 1–9: all PASS. Neutrality on 95404: ON == fresh OFF == screen OFF
  on all 8 end fields. Determinism: 95404 re-run identical (anchors
  identical too). Proof: synthetic 22/22; corpus legs 1,538/1,538 pilot,
  1,466/1,466 confirm, 0 failed.
- Caveats, reported not smoothed: 7 unattributed non-haven windows (5
  spawn-day-boundary analyzer artifacts, 1 raid-net collapse, 1 genuinely
  unrecorded step on 95404 day 120); 12 follow "mismatches" are
  follow-line-spoken + nested post-leg moves (taxonomy limitation, not
  branch failure); draftedPost by-id lookup misattributes duplicate
  monster ids (95429's twin eulogy) — Herald id is unique, so no Herald
  record is affected. None touches a haven window.
- Sense: every Herald draft is named in the RAID line ("The Herald"
  among the raiders); lingering nights name it with the exact kcal price
  and endure-or-sortie choice. Wrinkle: 95404 days 138–140 gorge lines
  report "0 kcal gone" as stores empty into its day-140 loss. Secondary
  observation only: no silent Herald field deaths — all Herald contacts
  end refused/vFlee/mFlee, zero villager deaths.
- Wall numbers (orientation only — screened band, never pooled):
  pilot won 0/8, national 6/8, table 1/8, wave-4 6/8, wave-5 1/8 (95404),
  median survival 181d; confirm won 0/8, national 3/8, table 1/8, wave-4
  7/8, wave-5 0/8, median 181d. Combined: won 0/16 (the screen excludes
  wins by design, so 0 wins says nothing about win rate), wave-5 1/16,
  full seat 0/16. The arrival mechanism is no longer the blocker, but
  the climb past wave 4 still does not complete.

Arm evidence: evidence/2026-11-01/sim-heraldarr2-a.md + corpora
evidence/2026-11-01/sim-heraldarr2-a/ (pilot),
sim-heraldarr2-a-confirm/ (confirm), sim-heraldarr2-a-screen/ (screen).
Merged: 698e0bf30 + acae0ecd1 + bd91d0b5d + 21d02f03b (rebase note).

## Arm sim-muster3-a (merged --ff-only; proof re-run on the rebased tip: 26/26; diff guard zero src/js): DIAG-GO-SINGLE-CLUSTER, G-BOUNDED

Question: does mustercall-b's single-seed headline (85106: call yield
5→9, ceilings with commit ≥10 on five refusal days) generalize to a
third contacted seed? Answer: BOUNDED, not generalized. The hunt found
its contacted seed, and that seed bounds the headline instead of
confirming it.

- Screen (selection only, predecessor's partial 5-seed screen discarded
  and fully re-run): 40 seeds 90101–90140; tier A 7, B 7, C 6; 20 excluded
  (11 won exactly day 90). Pilot = 90111, 90113, 90114, 90121, 90124,
  90132, 90139, 90101; confirm = all 12 remaining selected. Full band
  20 judged seeds: completeness 22/22, game-outcome match 22/22,
  ready-agreement 22/22, instrumentErrors 0, screen-vs-sweep agreement
  20/20, corpus determinism leg passes (90111 re-run line byte-identical
  to judged line).
- Pilot gate GO on real contact: 90111 has 22 refused attempts + 1 field
  fight + 22 snapshots. Note: 6/8 pilot seeds ended omen 2 with zero
  contact, so the contact gate (not omen alone) is what singled out
  90111.
- Seed 90111 (days 87–89): 22 refusals, all omen stage 2 with the call
  button offered, all wild-contact, have 0 / need 10, muster never
  created. But a sounded call would bring only 3 blades, and even with
  all 3 Haven commits the ceiling tops out at 6 — never reaching the
  10-gate. The coalition looks strong (three allies, all trusted, all
  quota 6) but only Emberhold has free faces (3); Stonebridge and
  Thornfield have ZERO free faces on all 22 snapshots. The post-block
  replay (replay-only probe; the judged sweep never sounds a call)
  proves it: predicted 3 = actual 3 allies, 3 Haven blades committed,
  muster still NOT READY at 6/10, and 0 later Herald fights start.
  Mustercall-b's "offered and reachable" is now: offered on both seeds,
  reachable on one (85106) only. The new binding constraint is FREE
  ALLIED FACES, and the new open question for backlog #1538 is what a
  sounded-but-short muster means — not just re-sounding after a lost
  fight.
- Clusters: 3, all on 90111 (days 87/88/89, yield 3, ceilings 5–6/5/5–6,
  UNBLOCKED, offered, re-faces 6/8/8). Feast-draw Herald 0 → #1550 holds.
  Located-but-unfaced: 10/20, including 100-day (90102) and 73-day
  (90139) windows.
- Q2 asymmetry: scholar TB 22 refused / 0 fought; 1 field fight (Henry
  Zhang, day 92, vFlee, dealt 26, fled at 54 HP); 0 Herald kills either
  channel. Kill-outcome judgment: no change on either counterfactual.
- Sense: refusal line is character-identical across all 22 snapshots
  (late-repeat slice via snapshot sayText identity; the instrument
  captures the first-refusal transcript only — metric-review item).
- Wall numbers (judged band, 20 seeds; recount from corpus confirms
  counts): national 8/20, table 7/20, wins 7/20, wave-4 14/20, wave-5
  0/20, median survival 142.5d gameDays (143.0d days), max 200d. End
  reasons: won 7, village-lost 11, survived 2. Band-wide wave-4 content
  is not absent (118 TB attempts, 51 field fights, 13 kills); the
  Herald's share is 22 refusals, 1 field fight, 0 kills.
- Quotation correction to carry forward: the muster ceiling is a PAIR
  — 85106 (call 5→9, gate met five days with commit) and 90111 (call 3
  flat, gate met zero days even with full commit). Total Herald
  refusals across the chain: 57 (35 + 22).

Arm evidence: evidence/2026-11-01/sim-muster3-a.md + corpus
evidence/2026-11-01/perseed-muster3/ (screen, pilot/confirm, 20 judged
leadfeast JSONs, analysis, determinism leg, replay-90111-postblock).
Merged: b1e3a95b3 + 01aa149f8.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-01/perseed-muster3/leadfeast/*.json' --metrics
national,table,wins,exiled --sweep-rows` — REFUSED by design: "all 20
--current rows carry top-level anchorCommit, so they are sweep recorder
rows, not runs. Recorder corpora are compared with sweep-compare tables,
never against a run baseline here." VERDICT: the refusal is the tool's
guard, not a deviation — no LOUD line to investigate, and forcing it
with --allow-recorder-corpus would compare recorder rows against the
winseat 16/16-wins run baseline, exactly the cross-regime comparison the
baseline note forbids. Baseline NOT rolled forward. Corpus truth from
the 20 run rows: national 8/20, table 7/20, won 7/20 (recounted by the
coordinator). Heraldarr2 corpus not fed (position instrument, same
precedent as 1235Z/1415Z/1706Z).

## Metric review

- Muster3: instrument captures the first-refusal transcript only;
  late-repeat identity is established via snapshot sayText identity, not
  full transcripts. A future arm wanting late-repeat wording must extend
  the transcript capture, not assume identity.
- Heraldarr2: follow-mismatch taxonomy, draftedPost twin-id lookup, and
  the 7 unattributed non-haven windows are instrument follow-ups; none
  touches a haven window, so none re-opens the arrival verdict.
- No pre-registered bar was changed in either arm. No metric is
  proposed for revision this run.

## Wall numbers (this run)

Muster3 judged band (20 seeds): national 8/20, nationalFinal not
reported by this instrument, table 7/20, won 7/20; wave-5 reach 0/20.
Heraldarr2 screened band (16 seeds): wave-5 1/16, full seat 0/16, wins
0/16 by screen design. Full seat still unshown. scale-onramp stays
converging (NOT converged): the Herald arrival mechanism is now proven
(raid-pin) and the muster ceiling is now a bounded pair, but no wave-5
fight chain completes and no game change landed.

## Village assessment (plain words)

The village can now be met by its titan: when the Herald is drafted in
a raid it walks straight onto the Haven tile, named in the raid line,
and it lingers there night after night naming the food price of making
it leave. But meeting is not mustering. On the one seed where the
village actually faced the Herald twenty-two times, the call for blades
would have brought three — because the allied villages had no free
faces to send, however friendly and strong they looked on paper. The
gate is honest and reachable on one seed, unreachable on the next, and
the difference is not trust or quota but whether anyone is actually
free to come. That is the next thing to measure.

## Next blanks, in order

1. Free-face deployment instrument — why allied villages show zero free
   faces at refusal time (face deployment is the new binding
   constraint; instrument face deployment before proposing any
   muster-side change).
2. Sounded-but-short muster meaning for #1538 (alongside the existing
   re-sound-after-a-lost-fight question) — still steve-call, not a build.
3. Field-death narration blank (observation only).
4. #1619 late wave-4 + fast lesser win.
5. #1595 Herald HP drop remainder (350).
6. Heraldarr2 instrument follow-ups (unattributed step 95404 day 120,
   twin-id draftedPost lookup) — instrument-only, not game changes.

Merged locally, pending ship. No push, no version bump, no live
verification — the ship job owns deploys.
