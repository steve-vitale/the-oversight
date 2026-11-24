# Loop A scale-onramp round — run fleshout-20261124T1715Z (ADOPTION of the timed-out 1515Z round)

**Run:** fleshout-20261124T1715Z · **Axis:** scale-onramp (converging) · **Loop:** oversight-flesh-out-loop
**Type:** ADOPTION — the 1515Z coordinator timed out before closeout; both arms finished here.
**Master at run start:** 8616c6b2f · **Master at closeout:** b4d6a4ac6 (+ this record)
**Claim:** `hidden_files/lever-claims/fleshout-20261124T1715Z.json` (+ adopted `fleshout-20261124T1515Z.json`)

## Stale-lock recovery (17:23Z)

Lock `fleshout-20261124T1515Z` was 125 min old; its trees' heartbeats were 38 min stale
(fightcap-recheck-a 16:44:39Z, bowopen-recheck-a 16:44:40Z). No live A-loop coordinator in
`subagent.list` (only the sibling B-loop 1630Z adoption worker, live — untouched) and no
coordinator process in `ps`. Fightcap worker cancelled, bowopen worker HALTED PARTIAL.
Lock deleted and replaced with the 1715Z lock in the same call after verifying the run_id
matched; claim annotated with adoption state. Loop B live on winnability-chain all run
(1430Z/1630Z adoption: ragecarry / tbrefuse) — NOT touched.

## Arm 1 — sim-fightcap-recheck-a: DIAG-NO-GO (thin pool)

Merged b4d6a4ac6 (rebased from 0492f7e4e). Proof 29/29 on the rebased tip.
Evidence: `evidence/2026-11-24/sim-fightcap-recheck-a.md` (+ prereg, analysis, panel,
16 per-seed corpora, 8 seeds × 2 legs, 150d, competent verbatim).

The question: do launched parties still lose ~82% of engaged wave-4 meetings and kill ~6%
on current master? The recheck answers it on a thin pool: **arm pair-inclusive n = 9, one
short of the frozen floor of 10** (combined pair n = 12). Classification complete (12/12),
decomposition complete, 0 instrument errors. Per the frozen prereg this is DIAG-NO-GO —
even though the analyzer's own label reads `DIAG-GO / THIN-POOL` (its internal scheme
returns DIAG-GO whenever the pool is thin; it does not satisfy the prereg's n ≥ 10 bar —
instrument gap, finding filed).

The picture, on the thin pool:
- Kill share **holds**: arm 0/9 = 0.000, tolerance [0, 0.16] (Nov 18: 0.059).
- vFlee damage/round **holds**: arm 45.3 mean-of-rates / 49.3 pooled, tolerance [36, 86].
- Loss share **moved outside tolerance**: arm 9/9 = 1.000, tolerance [0.72, 0.92] — a
  tolerance call, not a significance call (P(9/9 losses | Nov 18 rate 0.824) ≈ 0.18).
- Gate `avoid` still 0 among all arm losses, unchanged from Nov 18.
- **SENSEEXPED fixed presence, not winning**: arm parties present at every launched
  encounter (0 absent vs 33/42 in ctl) but evaded 16 of 25 present encounters and lost
  all 9 they engaged. The sense fix got the party to the fight; the fight still kills
  or routs them.
- Zero-damage classification complete, 12/12, all strike-fight — zero zero-damage
  meetings, so the dmgshape failure mode never bit.
- Sense-test (no vKill/mFlee in either leg; 2 arm + 2 ctl lost transcripts read in
  full): fights read as real fights — shouts bringing allies in, wound-binding, rage,
  honest misses, genuine Reunion novelty counterplay — lost on damage math (~45–55
  dmg/round vs ~1050–1350 HP). Recorder gaps still bite: the 20-line log cap truncates
  7/12 pair meetings including every flee decision; `dmgByVid` empty on the Reunion vDie.
- **Cost bar FAIL — community loss 6/8 arm vs 2/8 ctl**, investigated same-run: no
  mechanism found. Death-cause shares, deaths/day (0.73 vs 0.79), launch volume, and
  pantry-zero days (32 vs 31) all match; Fisher p ≈ 0.13. Sharpest unexplained pattern:
  the four best-scaling ctl villages (standing 610/420/580 + 110106) all village-lost
  in the arm leg. Balanced panel independently flags it: `review_required`,
  community-loss regression_signal (+0.5, CI 0.125–0.875). All other panel metrics:
  no material signal.
- Wall: national 0/16, wins 0/16, table null (not instrumented), wave 5 ctl 4/8 /
  arm 1/8, median ctl 150d / arm 136d, scale rank regional all 16.

**Coordinator decision — confirm NOT run this round.** The worker recommended a 12–16
seed fresh-band confirm (trigger met: loss share outside tolerance + cost-bar fail +
pool one short). I did not run it: the execution window ends ~19:15Z, the box is loaded
(B-loop adoption still simming), and a 16–32 seed-run confirm would likely time out into
another adoption chain. The confirm is the named next blank for the next Loop A run,
carrying the same frozen bars. The loss-share "move" is a tolerance call (p ≈ 0.18),
not a significance call, so nothing about the current picture is overturned meanwhile.

## Arm 2 — sim-bowopen-recheck-a: NO-GO

Merged 83b4e2a82 (rebased from 8477ddb21). Proof 36/36 on the rebased tip.
Evidence: `evidence/2026-11-24/sim-bowopen-recheck-a.md` (+ prereg, analysis, panel,
16 per-seed corpora, 8 seeds × 2 legs, 150d, competent verbatim).

The question: with SPEARGATE fixed and BOWCRAFT always-on, does BOWOPEN=1 now stage bows,
fire volleys, and raise kill share? **No.** Judged on the frozen bowopen-a bars:

| Bar | Arm | Bar | Result |
|---|---|---|---|
| Pool floor | 11 | ≥ 10 | PASS |
| Kill share | 0.000 (0/11) | ≥ 0.25 | FAIL |
| Damage/round | 36.5 | ≥ 70 | FAIL |
| Volley fired | 7/11 = 0.64 | ≥ 0.50 | PASS |
| Community loss | 6/8 vs ctl 5/8 | ≤ ctl + 0.125 | PASS (exactly at edge) |
| Starvation | 5 total / 4 villager-only vs ctl 0 | ≤ ctl + 2 | FAIL |
| Median survival | 133.5d vs 127.5d | ≥ 0.8× ctl | PASS |
| Instrument errors | 0 | 0 | PASS |

Mechanism diagnosis (the finding): **the bow is in hand; the ammo is not.** BOWOPEN
staged exactly **1 bow** in 8 seeds (alreadyHad 150, fromStash 0, fromArmory 0, crafted 1,
craftedFail 4, noSource 170). Across all wave-4+ encounters only 29/88 ranged-at-entry
fighters on the arm leg had ammunition (volleys fired 26/138). Volleys that fire hit
well (46-damage opening in the Stephen transcript), but two-thirds of bow-carriers walk
in with an empty quiver. Finding #2544 stays open; the named next lever is **ammunition
supply** (arrows/stones crafted or pocketed at departure), not another departure-only
staging tweak (bowopen-a §10 forbids it). Starvation cost (5 vs 0) is concentrated on
one seed (110202: 4 of 5); judged as written per the frozen bar.
- Sense-test: volley-fired transcript is coherent (Stephen nocks, 4 shots, 3 hits,
  46 dmg, then lowers the bow as the monster closes — party still fled after 2 rounds).
  The #2593 ammo-naming fix is **verified live**: sling holder gets "no stones — the
  pouch hangs empty", bow holder "no arrows". No misnaming observed.
- Instrument gap: neither driver nor analyzer emits `spearSeen`/`spearPassed`, so the
  prereg's gate-replication check (spearPassed/spearSeen == 1.0) is unmeasurable;
  `speargateOn: true` on all 16 files — the gate was on, its per-departure pass rate
  was not measured. Filed in the evidence (§6, §9).
- Wall: national 0/8 both legs, table null (not instrumented), wins 0/8 both, wave-4
  8/8 both, wave-5 4/8 both, median ctl 127.5d / arm 133.5d, all regional.

**Coordinator decision — BOWOPEN/SPEARGATE turn-on NOT decided here.** The re-measure
says the mechanism as it stands cannot lift kill share (ammo, not staging, binds), so
turning it on would not change outcomes. The turn-on decision stays open with the
ammo-supply lever.

## Wall (this round's judged corpora, 32 configs)

National 0/32, table null (not instrumented by either driver), wins 0/32, wave-4
unlock 16/16, wave-5 unlock 9/32, median survival 127.5–150d by leg, scale rank
regional everywhere. The scale wall stands: villages reach wave 5, survive, and never
reach national or win. The wave-4 fight is now re-measured on current master and the
picture holds on kill share and damage — parties get to the fight and still lose it —
and the bow line is closed as a staging question and reopened as an ammo question.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-24/perseed-<arm>-<leg>/*.json' --metrics national,table,wins,exiled
--allow-recorder-corpus` on all four corpora: **12 LOUD lines** (national 12→0, table
16→0, wins 16→0 on each corpus). All are **REGIME artifacts**: the baseline's own
`_regime` note forbids comparing pre-seat/courtship substrates against the WINSEAT
baseline ("wins are structurally ~0 there"); both arms' corpora are competent-only,
SEATDRIVE off. **Baseline NOT rolled.** No new investigation item. (The checker needs
`--allow-recorder-corpus` for these per-seed files and a `*` in the basename only;
a `*` in a directory component fails with ENOENT scandir.)

## Metric review

- Fightcap recheck: the frozen bars did their job — the n ≥ 10 floor caught a thin
  pool that the analyzer's own label would have passed (DIAG-GO / THIN-POOL). No
  metric change proposed for the next run; the analyzer label should be fixed to match
  the prereg (finding filed), not the prereg re-scored to match the label.
- Bowopen re-measure: bars reused verbatim from bowopen-a; all bars measurable except
  the gate-replication check (instrument gap, see above). The starvation bar fired on a
  single-seed concentration (110202: 4 of 5) — judged as written; a confirm should watch
  whether starvation tracks the arm leg or the seed. No metric change proposed.
- Both arms' panels built and compared; both `review_required` on community-loss
  grounds (bowopen at the edge, fightcap a regression signal). The panel is the
  instrument, the frozen bars the judge — neither verdict was re-scored against the
  panel.

## Infrastructure

- VM restart ~17:33Z killed the bowopen ctl re-run (110208) and the fightcap first
  ctl-seeds attempt; both re-ran clean (bowopen 110208: 150d survived, standing 635,
  wave 5; fightcap ctl via `setsid nohup`, CTL-EXIT:0). Exec-service restart ~17:34Z
  (recorded_execution_results show the killed execs; no data lost).
- Safe-commit index clobber struck on **all** worker commits (4 bowopen + 5 fightcap);
  repaired each time via `git ls-tree -r HEAD | git update-index --add --index-info`,
  commit contents verified, trees verified clean after each repair. No clobber on the
  coordinator record commit (checked below).
- Master moved twice under the run: playtest landing r284 (66f41f420) before the
  bowopen merge, then the bowopen merge itself before the fightcap merge. Both branches
  rebased clean (bowopen 10/10, fightcap 7/7, no stop-at-pick quirk), proofs re-ran
  green after every rebase and on the merged tips (bowopen 36/36, fightcap 29/29).
- Box load ~9.7 at run start (B-loop adoption simming concurrently); sims slow but
  complete. Write-flap probe passed before every material write; no flap window hit
  this adoption (last flap 15:38–15:52Z, cleared 16:31Z).
- No full `check.js` gate re-run this round: zero `src/js` changes across both arms
  (instrument + evidence only) and the 1215Z round recorded the standing profile
  (339 passed / 5 failed, pre-existing standing-set failures) hours earlier.

## Next blanks (scale-onramp, in order)

1. **Fightcap confirm** — fresh-band 12–16 seeds, both legs (SENSEEXPED ctl/arm),
   same frozen bars; settles the thin pool (n=9), the loss-share tolerance move, and
   the unexplained community-loss cost-bar fail (6/8 vs 2/8).
2. **Ammunition supply** — finding #2544 stays open: arrows/stones crafted or pocketed
   at departure, measured on kill share / damage/round on the same frozen bowopen bars.
   Not another departure-only staging tweak.
3. **Analyzer label fix** — fightcap analyzer's DIAG-GO / THIN-POOL label must match
   the prereg's n ≥ 10 DIAG-GO bar (finding filed).
4. **Gate-replication counters** — bowopen driver/analyzer must emit spearSeen /
   spearPassed before any future arm needs the gate check.
5. **Waiting on seat-unready bands** — tracker blank #5 (sim-waitseat-a) was answered
   CONCEPT-DEAD by the 1215Z round; do not retry without a new angle.

scale-onramp stays converging (NOT converged): the wave-4 fight is re-measured and the
picture holds, the bow line is diagnosed to ammo, but villages still reach wave 5,
survive, and never reach national or win — and both arms' wins come from nowhere, since
neither arm is a win instrument. winnability-chain stays converging (untouched;
sibling loop B).

Merged 83b4e2a82 (bowopen-recheck-a NO-GO) + b4d6a4ac6 (fightcap-recheck-a DIAG-NO-GO)
+ this record; merged locally, pending ship. Claim deleted; lock deleted.
