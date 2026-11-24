# sim-cellgate-holdout-b — EVIDENCE (64-seed CELLGATE-floor deaths holdout)

**Arm:** sim-cellgate-holdout-b · **Loop B run:** fleshout-loop-b-20261124T0230Z
(ADOPTION of the dead run fleshout-loop-b-20261123T2322Z)
**Axis:** winnability-chain · **Finding:** sim-findings.md line 2716
`[claimed]` — CELLGATE HOLDS EVERY KILL-LOOT VOLLEY BELOW WAVE 4
**Type:** HOLDOUT on a judged lever question (CELLGATE_FLOOR).
**Prereg:** `evidence/2026-11-24/sim-cellgate-holdout-b-prereg.md` (frozen
2026-11-24 ~01:07 UTC, commit `0a60338ed`, rebased onto master `7344d8a56`
as `39b17ae25`). The prereg is the frozen judge; nothing below re-scores it.
**Question:** does firing the kill-loot gun at wave 3 (floor 3) cost village
lives on balance vs floor 4? Frozen bars (§7 of the prereg, nine bars,
bar 5 PRIMARY: paired mean village-deaths difference ≤ +2/run AND 95% CI
upper ≤ +5/run).

## 0. Adoption + repair (this run)

- Coordinator-verified starting state: worktree index showed the 3 prereg
  files staged-deleted (D) AND untracked (??) — safe-commit index-clobber
  variant. Commit `0a60338ed` was correct and the branch tip. Repaired with
  `git ls-tree HEAD -r -- <paths> | git update-index --add --index-info`;
  after repair `git status --short` empty, `git show --stat 0a60338ed`
  lists the 3 files, and all three blob hashes match the worktree files
  (prereg `74e7cede…`, panel builder `275bef5a…`, holdout test `15c0d44c…`).
  No re-commit of the prereg files.
- Rebase: branch base was `f5d2c3caa`; master had moved to `7344d8a56`
  (local master; `origin/master` still pointed at `f5d2c3caa` — the ship
  loop had not yet pushed the local landings). `git rebase master` clean,
  no stop-at-pick quirk; new head `39b17ae25` on master `7344d8a56`.
- Band freshness re-verified 2026-11-24 ~02:45 UTC (re-run, not copied):
  greps over all `evidence/*/sim-*-prereg.md` for every token in
  107670–107733 returned exactly 1 file — this arm's own prereg. Zero hits
  in non-prereg `evidence/*/sim-*.md`, zero in the convergence tracker for
  107670/107733 (nearest named seeds 107601–107633, below the band), zero
  in live/dead lever-claims. **Band 107670–107733 confirmed FRESH.**
- Canon read: `docs/CANON.md` + `docs/MONSTER-WAVES.md` (wave 3 "The Final
  Draft", day 25+ AND 4 wave-2 ledger points, HP 240–420; wave 4 "The
  Mirror Draft", standing ≥ 100, HP 850–1500). No canon doc covers the
  kill-loot roll table, the bundle, or the CELLGATE floor — numbers are
  code-derived (killbundle-b §2, fieldFights.js), as the prereg records.

## 1. Pre-flight (bar 1, re-run on rebased base 39b17ae25)

All green, 2026-11-24 ~02:45 UTC:

| check | result |
|---|---|
| `node scripts/test-killlootbundle-a.js` | 12/12 |
| `node scripts/analyze-killlootbundle-a.js --selftest` | 31/31 |
| `node scripts/test-killrate-a.js` | 36/36 |
| `node scripts/test-killrate-analysis-a.js` | 14/14 |
| `node scripts/test-killarrive-b.js` | 12/12 |
| `node scripts/test-killbundle-b.js` | 11/11 |
| `node scripts/test-killbundle-b.js --live` | 11/11 |
| `node scripts/test-gunrate-a.js` | 39/39 |
| `node scripts/test-cellgate-floor-b.js` | 17/17 |
| `node scripts/test-cellgate-floor-b.js --live` | 24/24 |
| `node scripts/test-cellgate-holdout-b.js` | 56/56 |

Known pre-existing drift, NOT part of bar 1 (prereg §8): `test-cellgate-a.js`
is 10/12 on this base — both failures are its stale `^  loosed` shot
counter after the Nov 22 searvoice narration change; the game spends
correctly. Not fixed (out of this arm's area).

## 2. Pilot (judged, 8+8, seeds 107670–107677)

Ran 02:43–02:52 UTC, 2 processes × 4 seeds per leg, all 4 exits 0.
Corpus validation (`--dir-ctl` / `--dir-arm`) prints FAIL on the 8-file
pilot corpora — expected: `corpusPass` requires 64 files (full band). The
pilot gate (prereg §8, instrument only) is judged on the summary fields:

- ctl: 8 files, single anchor `39b17ae25`, single policySha, single
  gameSha `950901f3fdcc`, 0 instrument errors, floors all 4, staged 8/8
  bundled, natural 1/1 bundled, 0 dry, 0 volleys, 692 deaths.
- arm: 8 files, single anchor `39b17ae25`, single policySha, single
  gameSha, 0 instrument errors, floors all 3, staged 8/8 bundled, natural
  2/2 bundled, 0 dry, **9 wave-3 volleys, 0 wave-4+**, 651 deaths.
- **Pilot gate PASSES:** single anchor/policy/gameSha on all 16 files,
  0 errors, floors correct, 16/16 bundled, armed pilot shows the effect
  on the fresh band (9 wave-3 volleys; floor-b's pilot showed 5/8).

## 3. Confirm (judged, 56+56, seeds 107678-107733) - BAND INCOMPLETE

**The band did not complete in this window. NO FROZEN VERDICT is rendered:
the prereg's nine bars judge 64 pairs, and the corpora closed at 57/64
control files and 56/64 armed files (50 complete pairs). Everything in §4-§7
below is a PARTIAL-BAND analysis, labelled as such - it is the progress
record the coordinator adopts, not a verdict. Nothing is faked or
extrapolated; the 15 missing runs are listed exactly.**

Confirm ran in four waves (all with the frozen instrument/anchor/band,
`39b17ae25`, competent policy, 150d death-aware):

| wave | seeds | outcome |
|---|---|---|
| confirm-1 (16 procs x 7) | 107678-107733 | killed ~03:05 UTC by a runtime/session restart; 7 new files/leg banked (ctl 15, arm 15) |
| re-run (16 procs, missing only) | 49/leg | killed ~03:16 UTC by a runtime restart; ctl 17, arm 18 |
| batch A (8 procs x 3) | 107679-107691 | killed ~03:27 UTC by a MACHINE restart (`uptime` reset to 1 min, `/tmp` wiped); ctl 21, arm 23 |
| mop-up (14 procs x 6) | all remaining | killed ~03:45 UTC by a runtime restart; ctl 34, arm 35 |
| mop-up 2 (12 procs, live session) | all remaining | killed ~04:06 UTC by a runtime restart after 15m37s; ctl 46, arm 47 |
| mop-up 3 (12 procs, live session) | all remaining | killed ~04:21 UTC by a runtime restart after 14m; ctl 57, arm 56 |

Kill pattern (recorded for the coordinator): a detached setsid/nohup batch
survives ~9-15 min after its launching exec session ends; a live
backgrounded exec session survived 15m37s and 14m respectively before the
runtime restart killed it too. Each kill left completed per-seed files
intact and valid (all re-parsed as JSON; no partials - the driver writes a
file only when a seed finishes). Missing seeds were re-run with the same
instrument/anchor/band, never overwriting a valid file.

**Missing at closeout (15 runs):** ctl 107691, 107700, 107708, 107715,
107716, 107724, 107733 (7); arm 107687, 107688, 107697, 107698, 107709,
107717, 107724, 107725 (8). Complete pairs: 50 of 64.

## 4. Bar verdicts (frozen, prereg §7) - PARTIAL BAND, NO FROZEN VERDICT

Authoritative counts are the holdout test's (`--analyze`), which counts a
volley only when the firer is a recorded kill-loot/contest holder
(`test-cellgate-holdout-b.js:232`, `!!holders[e.vid]`). A looser count of
every searcaster volleyEvent with shots > 0 gives ctl 17 / arm 51 (41 w3);
the difference is volleys by fighters holding a gun through channels the
driver does not record as a holder (e.g. corpse takes). The bars below use
the test's counts, as the prereg directs.

| # | Bar | Partial-band result (50 pairs / 57+56 files) |
|---|---|---|
| 1 | Instrument validity | **On track, unjudgeable on count** - 0 instrument errors, single anchor `39b17ae25`, single gameSha `950901f3fdcc`, 0 policySha mismatches, floors 4 on all 57 ctl / 3 on all 56 arm; fails only on files != 64 |
| 2 | Cells-at-arrival | **On track, unjudgeable on count** - ctl staged 57/57 bundled, natural 1/1, dry 0; arm staged 56/56 bundled, natural 5/5, dry 0; fails only on staged != 64 |
| 3 | Volley replication (armed >= 20) | **PASS on partial** - 44 armed volleys (expectation 32) |
| 4 | Wave-3 specificity (armed >= 12) | **PASS on partial** - 39 wave-3 volleys (expectation 28) |
| 5 | **PRIMARY - paired village deaths** | **PASS on partial** - mean +0.300/run (bar <= +2); 95% CI [-3.898, +4.498] (bar upper <= +5); n=50, median 0, worse 16 / better 14 / tied 20 |
| 6 | Control replication (<= 6) | **FAIL - already decided** - 8 control volleys on 57 files, all wave-4+ (w3 = 0); the 7 missing ctl seeds can only keep or raise the count, so the bar cannot pass on completion. See metric review: exactly the prereg's bar-6 calibration-note case (7-8, mechanism reproduced exactly) |
| 7 | Guardrails | **PASS on partial** - starvation delta -4 (ctl 26, arm 22; bar <= +2); median-survival delta +10.5d (ctl 139, arm 149.5; bar >= -20) |
| 8 | Balanced panel (§15) | **Not evaluated** - panels not built; the band is incomplete and the panel judges 64 matched seeds |
| 9 | Sense-test + per-seed table | **Delivered** - §8 story + tables in §5-§6 |

The test's mechanical `verdict` field prints `DIAG` on this partial band
(because bar 1 is false on file count alone). That is NOT the frozen
verdict: the prereg's DIAG rule fires on instrument/bundle/effect failure,
and none of those failed - bar 1 fails only on the 64-file count. **No
frozen verdict is rendered. The band is incomplete.**

## 5. Paired village deaths (bar 5, PRIMARY) - PARTIAL, n=50 of 64

Official `--analyze` numbers: paired mean **+0.300 deaths/run**, SD 14.771,
SE 2.089, t(0.975, 49) = 2.0096, **95% CI [-3.898, +4.498]**, median 0,
worse 16 / better 14 / tied 20, total +15 over 50 pairs. Both thresholds
met on the partial data (mean <= +2, CI upper <= +5). The 14 missing pairs
cannot be assumed to hold the pattern - this is a progress read, not the
verdict.

Decomposition (as floor-b §7 did): the deltas are concentrated in a few
downstream-divergence seeds, exactly as on the 16-seed band - the big
positives are villages the wave-3 firing did NOT save (107696 +43: ctl
lost at d94 with 123 deaths, arm survived to d151 with 166 - the armed
village lived longer and recorded more deaths; 107685 +36, 107703 +27,
107712 +26), and the big negatives are villages the firing DID save or
that diverged the other way (107726 -52: ctl lost at d107 with 126 deaths,
arm lost at d63 with 74 - the armed village died early and stopped
accumulating deaths; 107699 -31, 107672 -28). The pattern matches the
prereg's hypothesis: the 16-seed +82 was noise from saved villages living
longer, and on 50 pairs the sign has flipped to +15 total. 20 of 50 pairs
are exactly tied - the floor usually changes nothing about the death
count, and when it changes anything it is a downstream-divergence story,
not a systematic cost.

ctl files: 57 missing: [107691, 107700, 107708, 107715, 107716, 107724, 107733]
arm files: 56 missing: [107687, 107688, 107697, 107698, 107709, 107717, 107724, 107725]
complete pairs: 50

## PAIRED TABLE (seed | days ctl/arm | end ctl/arm | wave ctl/arm | standing ctl/arm | deaths ctl/arm/delta | volleys ctl/arm)
| 107670 | 120/151 | village-lost/survived | 4/5 | 199/460 | 113/117/+4 | 0/3 |
| 107671 | 151/151 | survived/survived | 4/4 | 199/199 | 69/69/+0 | 0/1 |
| 107672 | 151/40 | survived/village-lost | 4/3 | 199/25 | 66/38/-28 | 0/1 |
| 107673 | 94/84 | village-lost/village-lost | 3/4 | 99/199 | 116/109/-7 | 0/3 |
| 107674 | 65/106 | village-lost/village-lost | 4/4 | 199/199 | 97/95/-2 | 0/1 |
| 107675 | 87/68 | village-lost/village-lost | 4/4 | 199/199 | 50/52/+2 | 0/1 |
| 107676 | 143/149 | village-lost/survived | 5/5 | 380/355 | 113/103/-10 | 0/1 |
| 107677 | 150/150 | survived/survived | 5/5 | 405/405 | 68/68/+0 | 0/0 |
| 107678 | 151/151 | survived/survived | 4/4 | 199/199 | 97/97/+0 | 0/0 |
| 107679 | 151/100 | survived/village-lost | 4/4 | 199/175 | 90/83/-7 | 0/1 |
| 107680 | 95/95 | village-lost/village-lost | 4/4 | 199/199 | 107/107/+0 | 0/0 |
| 107681 | 131/131 | village-lost/village-lost | 4/4 | 199/199 | 105/105/+0 | 0/0 |
| 107682 | 125/150 | village-lost/survived | 5/5 | 370/525 | 118/119/+1 | 0/2 |
| 107683 | 109/109 | village-lost/village-lost | 5/5 | 325/325 | 120/120/+0 | 1/1 |
| 107684 | 100/96 | village-lost/village-lost | 5/5 | 420/345 | 100/98/-2 | 1/1 |
| 107685 | 150/151 | survived/survived | 5/5 | 440/520 | 126/162/+36 | 1/2 |
| 107686 | 119/151 | village-lost/survived | 4/5 | 199/405 | 107/93/-14 | 1/1 |
| 107689 | 100/100 | village-lost/village-lost | 4/4 | 199/199 | 118/118/+0 | 1/1 |
| 107690 | 151/114 | survived/village-lost | 4/4 | 199/199 | 139/129/-10 | 1/1 |
| 107692 | 151/151 | survived/survived | 4/4 | 199/199 | 154/154/+0 | 0/0 |
| 107693 | 141/151 | village-lost/survived | 5/5 | 445/375 | 110/116/+6 | 0/1 |
| 107694 | 147/150 | survived/survived | 5/5 | 630/550 | 176/179/+3 | 0/1 |
| 107695 | 60/63 | village-lost/village-lost | 3/4 | 70/165 | 73/72/-1 | 0/1 |
| 107696 | 94/151 | village-lost/survived | 4/4 | 199/199 | 123/166/+43 | 0/2 |
| 107699 | 150/135 | survived/village-lost | 5/5 | 815/315 | 158/127/-31 | 2/1 |
| 107701 | 124/124 | village-lost/village-lost | 5/5 | 445/445 | 82/82/+0 | 0/0 |
| 107702 | 151/151 | survived/survived | 4/5 | 199/455 | 87/94/+7 | 0/1 |
| 107703 | 151/150 | survived/survived | 4/4 | 199/199 | 80/107/+27 | 0/1 |
| 107704 | 151/151 | survived/survived | 5/5 | 275/275 | 91/91/+0 | 0/0 |
| 107705 | 143/143 | village-lost/village-lost | 4/4 | 199/199 | 64/64/+0 | 1/1 |
| 107706 | 151/151 | survived/survived | 4/4 | 199/199 | 61/61/+0 | 0/0 |
| 107707 | 150/150 | survived/survived | 4/4 | 199/199 | 86/86/+0 | 0/0 |
| 107710 | 151/150 | survived/survived | 5/5 | 620/550 | 130/138/+8 | 1/1 |
| 107711 | 151/151 | survived/survived | 5/5 | 355/435 | 74/87/+13 | 0/1 |
| 107712 | 125/151 | village-lost/survived | 4/4 | 199/199 | 89/115/+26 | 0/1 |
| 107713 | 98/98 | village-lost/village-lost | 5/5 | 315/315 | 132/132/+0 | 1/1 |
| 107714 | 149/151 | survived/survived | 5/5 | 935/520 | 149/143/-6 | 0/2 |
| 107718 | 151/150 | survived/survived | 5/4 | 375/199 | 108/114/+6 | 2/1 |
| 107719 | 150/145 | survived/village-lost | 4/4 | 199/199 | 75/79/+4 | 0/1 |
| 107720 | 118/118 | village-lost/village-lost | 5/5 | 415/415 | 100/100/+0 | 0/0 |
| 107721 | 79/79 | village-lost/village-lost | 4/4 | 175/175 | 54/54/+0 | 0/0 |
| 107722 | 115/151 | village-lost/survived | 4/5 | 199/400 | 114/99/-15 | 3/1 |
| 107723 | 126/151 | village-lost/survived | 5/5 | 485/555 | 110/128/+18 | 1/2 |
| 107726 | 107/63 | village-lost/village-lost | 5/4 | 420/199 | 126/74/-52 | 0/1 |
| 107727 | 85/122 | village-lost/village-lost | 4/4 | 125/199 | 80/88/+8 | 0/1 |
| 107728 | 127/152 | village-lost/survived | 4/4 | 195/199 | 61/49/-12 | 0/1 |
| 107729 | 107/107 | village-lost/village-lost | 4/4 | 199/199 | 81/81/+0 | 0/0 |
| 107730 | 107/107 | village-lost/village-lost | 4/4 | 199/199 | 133/133/+0 | 0/0 |
| 107731 | 139/139 | village-lost/village-lost | 4/4 | 199/199 | 109/109/+0 | 0/0 |
| 107732 | 151/151 | survived/survived | 5/5 | 350/350 | 91/91/+0 | 0/0 |

paired n=50 mean=0.300 sd=14.771 se=2.089 t=2.0000 CI=[-3.878, 4.478] median=0.0 worse=16 better=14 tied=20 total=+15
bar5: mean<=+2 ? True ; CI upper<=+5 ? True
largest deltas: [(43, 107696), (36, 107685), (27, 107703), (26, 107712), (18, 107723), (13, 107711)]
most negative: [(-52, 107726), (-31, 107699), (-28, 107672), (-15, 107722)]

CTL: files=57 volleys=17 w3=0 w4+=17 staged searcaster arrivals=58 rearmTakes=0 deaths=5746 starv~26 medianDays=139 maxDays=152 survived=25 lost=32 wave5=23 wave4=55 wins=0

ARM: files=56 volleys=51 w3=41 w4+=10 staged searcaster arrivals=61 rearmTakes=0 deaths=5676 starv~22 medianDays=149.5 maxDays=152 survived=29 lost=27 wave5=24 wave4=55 wins=0

## 6. Staged per-seed tables (both legs) - PARTIAL (57 ctl / 56 arm files)

Volley counts here are the looser per-event count (every searcaster
volleyEvent with shots > 0, including non-holder firers); the bar counts
in §4 are the test's holder-gated counts (ctl 8 / arm 44, 39 w3). Staged
arrival = first kill-loot roll of the seed forced to searcaster
(STAGE_SEAR); every staged arrival on both legs carried exactly 2 cells.

## STAGED TABLE per leg (seed | staged day/holder | cells | fights by wave | volleys shots/hits/dmg)
### CTL
| 107670 | d7 gen_v1dxwjc | none |
| 107671 | d4 nikolai_volkov | none |
| 107672 | d3 gen_pqz11i5 | none |
| 107673 | d3 meera_reddy; d35 gen_r2hxudf | none |
| 107674 | d5 owen_smith | none |
| 107675 | d4 chantal_mukendi | none |
| 107676 | d7 ruby_callaghan | none |
| 107677 | d5 gen_dh68l85 | none |
| 107678 | d5 gen_tozi0bv | none |
| 107679 | d4 gen_xxkowhe | none |
| 107680 | d7 ursula_weber | none |
| 107681 | d6 gen_45b2q63 | none |
| 107682 | d5 gen_l868yom | none |
| 107683 | d4 zoe_adams | d68 w4 suburb 2/0 0dmg |
| 107684 | d7 james_okonkwo | d59 w4 eulogy 2/0 0dmg |
| 107685 | d6 ruby_callaghan | d64 w4 eulogy 2/2 133dmg |
| 107686 | d8 gen_4goz7n1 | d54 w4 congregation 2/0 0dmg |
| 107687 | d7 gen_fa88ovo | none |
| 107688 | d5 owen_smith | none |
| 107689 | d4 ingrid_vik | d49 w4 eulogy 2/1 64dmg |
| 107690 | d2 gen_zlkdfcz | d71 w4 reunion 2/1 65dmg |
| 107692 | d5 mara_vasquez | none |
| 107693 | d3 gen_p3nhdj4 | none |
| 107694 | d5 owen_smith | none |
| 107695 | d4 gen_cs5abw8 | none |
| 107696 | d5 jorge_silva | none |
| 107697 | d3 mia_andersson | none |
| 107698 | d5 farid_ahmed | none |
| 107699 | d3 naran_tumen | d97 w4 eater 2/0 0dmg; d126 w4 suburb 3/2 129dmg |
| 107701 | d4 nino_kapanadze | none |
| 107702 | d6 aroha_ngata | none |
| 107703 | d3 diana_osei | none |
| 107704 | d3 gen_g0jca9w | none |
| 107705 | d6 yara_haddad | d107 w4 reunion 2/1 65dmg |
| 107706 | d4 gen_tsu0hlx | none |
| 107707 | d4 gen_dbbmkku | none |
| 107709 | d10 sam_wilson | none |
| 107710 | d6 zoe_adams | d139 w5 rerun 2/0 0dmg |
| 107711 | d3 gen_rruxu5r | none |
| 107712 | d3 hannah_kim | none |
| 107713 | d4 petra_novak | d78 w4 influencer 2/2 136dmg |
| 107714 | d5 gen_w747dea | none |
| 107717 | d5 gen_ffm9w2s | none |
| 107718 | d3 gen_mismkp0 | d47 w4 algorithm 2/0 0dmg; d92 w4 algorithm 2/2 133dmg |
| 107719 | d9 gen_zz5w66j | none |
| 107720 | d8 gen_243nuui | none |
| 107721 | d8 boris_kowalski | none |
| 107722 | d3 nadia_khoury | d61 w4 congregation 2/2 132dmg; d75 w4 congregation 3/2 131dmg; d88 w4 eulogy 2/1 67dmg |
| 107723 | d5 maya_singh | d88 w5 cancellation 2/1 65dmg |
| 107725 | d5 gen_qgsu2mk | none |
| 107726 | d6 petra_novak | none |
| 107727 | d3 mia_andersson | none |
| 107728 | d5 gen_2q5b2p9 | none |
| 107729 | d9 gen_mrd041p | none |
| 107730 | d5 gen_jarxsf8 | none |
| 107731 | d5 pavel_dubinin | none |
| 107732 | d10 gen_yia4wci | none |
### ARM
| 107670 | d7 gen_v1dxwjc; d73 valeria_quispe | d60 w3 buffering 2/2 135dmg; d77 w3 redactor 2/2 128dmg; d104 w4 influencer 2/2 135dmg |
| 107671 | d4 nikolai_volkov | d36 w3 redactor 2/0 0dmg |
| 107672 | d3 gen_pqz11i5 | d28 w3 callback 2/0 0dmg |
| 107673 | d3 meera_reddy; d35 gen_r2hxudf | d40 w3 callback 2/1 67dmg; d47 w3 gavel 2/0 0dmg; d84 w4 suburb 2/0 0dmg |
| 107674 | d5 owen_smith | d34 w3 buffering 2/0 0dmg |
| 107675 | d4 chantal_mukendi | d28 w3 redactor 2/1 65dmg |
| 107676 | d7 ruby_callaghan | d34 w3 callback 2/1 68dmg |
| 107677 | d5 gen_dh68l85 | none |
| 107678 | d5 gen_tozi0bv | none |
| 107679 | d4 gen_xxkowhe | d26 w3 redactor 2/1 66dmg |
| 107680 | d7 ursula_weber | none |
| 107681 | d6 gen_45b2q63 | none |
| 107682 | d5 gen_l868yom | d38 w3 callback 2/1 67dmg; d65 w3 terms_of_service 1/0 0dmg |
| 107683 | d4 zoe_adams | d68 w4 suburb 2/0 0dmg |
| 107684 | d7 james_okonkwo | d49 w3 redactor 2/1 66dmg |
| 107685 | d6 ruby_callaghan | d63 w3 redactor 2/1 68dmg; d93 w3 spool 2/1 64dmg |
| 107686 | d8 gen_4goz7n1 | d28 w3 gavel 2/1 66dmg |
| 107689 | d4 ingrid_vik | d49 w4 eulogy 2/1 64dmg |
| 107690 | d2 gen_zlkdfcz | d29 w3 chorus_line 2/0 0dmg |
| 107691 | d6 jovan_milic | d29 w3 callback 2/1 67dmg |
| 107692 | d5 mara_vasquez | none |
| 107693 | d3 gen_p3nhdj4 | d37 w3 redactor 2/1 65dmg |
| 107694 | d5 owen_smith | d100 w3 gavel 4/3 196dmg |
| 107695 | d4 gen_cs5abw8 | d41 w3 gavel 2/1 67dmg |
| 107696 | d5 jorge_silva; d58 nina_petrova | d27 w3 terms_of_service 2/1 67dmg; d68 w3 redactor 2/2 134dmg |
| 107699 | d3 naran_tumen | d30 w3 callback 2/0 0dmg |
| 107700 | d4 gen_3ihzlq5 | d70 w3 focus_group 2/0 0dmg |
| 107701 | d4 nino_kapanadze | none |
| 107702 | d6 aroha_ngata | d36 w3 spool 2/1 65dmg |
| 107703 | d3 diana_osei | d50 w3 spool 2/0 0dmg |
| 107704 | d3 gen_g0jca9w | none |
| 107705 | d6 yara_haddad | d107 w4 reunion 2/1 65dmg |
| 107706 | d4 gen_tsu0hlx | none |
| 107707 | d4 gen_dbbmkku | none |
| 107708 | d9 gen_csmioqj; d85 visjoin_83 | d85 w4 eulogy 2/2 132dmg |
| 107710 | d6 zoe_adams | d43 w3 terms_of_service 2/1 68dmg |
| 107711 | d3 gen_rruxu5r | d38 w3 redactor 2/0 0dmg |
| 107712 | d3 hannah_kim | d31 w3 terms_of_service 2/0 0dmg |
| 107713 | d4 petra_novak | d78 w4 influencer 2/2 136dmg |
| 107714 | d5 gen_w747dea | d28 w3 terms_of_service 2/0 0dmg; d65 w4 reunion 2/0 0dmg |
| 107715 | d6 gen_oeb4mvw | d32 w3 spool 2/1 67dmg |
| 107716 | d6 stan_kowalski; d101 naran_tumen | d46 w3 buffering 2/1 64dmg; d108 w4 suburb 2/1 66dmg |
| 107718 | d3 gen_mismkp0 | d39 w3 ad_break 2/1 66dmg |
| 107719 | d9 gen_zz5w66j | d37 w3 buffering 2/1 64dmg |
| 107720 | d8 gen_243nuui | none |
| 107721 | d8 boris_kowalski | none |
| 107722 | d3 nadia_khoury | d33 w3 redactor 2/1 65dmg |
| 107723 | d5 maya_singh | d77 w3 redactor 2/0 0dmg; d83 w4 suburb 2/1 66dmg |
| 107726 | d6 petra_novak | d39 w3 callback 2/1 66dmg |
| 107727 | d3 mia_andersson | d53 w3 callback 2/0 0dmg |
| 107728 | d5 gen_2q5b2p9 | d34 w3 redactor 2/1 68dmg |
| 107729 | d9 gen_mrd041p | none |
| 107730 | d5 gen_jarxsf8 | none |
| 107731 | d5 pavel_dubinin | none |
| 107732 | d10 gen_yia4wci | none |
| 107733 | d9 gen_wafp9wb | d35 w3 spool 2/1 65dmg |

## 7. Wall numbers (PARTIAL corpora; wins/national/table NOT instrumented by this driver - recorded as not instrumented, never faked)

| | control floor 4 (57 files) | armed floor 3 (56 files) |
|---|---|---|
| wins | not instrumented | not instrumented |
| national reach | not instrumented | not instrumented |
| table | not instrumented | not instrumented |
| wave 5 unlocked | 23/57 | 24/56 |
| wave 4 reached | 55/57 | 55/56 |
| median survival | 139d | 149.5d |
| max survival | 152d | 152d |
| villages survived / lost | 25 / 32 | 29 / 27 |
| total village deaths | 5746 | 5676 |
| starvation deaths | 26 | 22 |

The scale wall stands: on this band, as on floor-b's 16-seed band, no
win is instrumented and wave 5 opens (roughly 40% of villages) while the
full seat stays out of reach. The armed leg's median survival runs 10.5
days longer than control - the direction the guardrail watches, and it
passes.

## 8. Sense-test (bar 9) — a firing holder as a village story

Read from the arm-leg per-seed records (volleyEvents / killLootEvents /
grantEvents / corpseTakeEvents). The driver records no dialogue text, so
the sense-test judges from equip/carry/fight behavior, said plainly.

**Seed 107670, arm leg (floor 3), village survived 151 days, wave 5,
standing 460, 117 deaths.** The story of its gun:

- Day 7: villager `gen_v1dxwjc` kills something in the wild; the kill-loot
  roll lands a searcaster with exactly 2 fusion cells — the staged arrival,
  bundled as designed. The gun is now in the village, in someone's hands.
- Day 60: `gen_v1dxwjc` walks into a wave-3 Buffering fight carrying the
  searcaster and fires both cells — 2 shots, 2 hits, 135 damage, ammo
  left 0. The gun did exactly what the bundle promised: it turned a
  mid-build wave-3 fight (Buffering, HP 240–420) into a 135-damage
  opening. The holder spent the cells on the first wave-3 fight they
  faced, not hoarded them.
- Day 73: a second villager, Valeria Quispe, gets her own searcaster with
  2 cells from a kill-loot roll — a natural arrival, also bundled. The
  gun is not a one-off relic; the village keeps finding them.
- Day 77: Valeria fires both cells at a wave-3 Redactor — 2 shots, 2 hits,
  128 damage, ammo left 0. Same shape: first wave-3 fight, both cells
  spent.
- Day 93: Tom Baker wins a searcaster as a contest prize (the old
  contest-prize channel, not kill-loot). Day 104: Tom fires both cells
  at a wave-4 Influencer — 2 shots, 2 hits, 135 damage.
- No re-arms in this seed (`rearmTakeEvents` empty — REARM unset in this
  arm by design, so nobody picks cells off a corpse to reload). Once a
  holder fires, their gun sits empty; the village's next gun comes from
  the next kill-loot roll or contest prize, not from reloading.

What this means as a village story: the gun is used, not worshipped. A
holder who has one fires it at the first serious monster they meet — wave
3, the moment the hold lifts — and the 135-ish damage is a real bite out
of a 240–420 HP monster (about a third of its health in one volley),
then the gun is an empty weight until the village earns another. Nobody
stands around talking about the gun — there is no dialogue in the
records to read — but nobody hoards it either, and nobody dies holding
unfired cells: every loaded holder in this seed fired. The behavior is
sensible; the missing piece is any visible reaction (a comment, a
celebration, a fight over who carries it) — the gun arrives and fires
silently, which is a blank worth naming, not a defect in the firing.

**Re-arms:** `rearmTakeEvents` is empty on every file on BOTH legs (0
re-arms in 57 ctl + 56 arm files). REARM was unset in this arm by design,
so no corpse-take reload channel existed; once a holder fires, their gun
stays empty until the village earns another gun. No holder re-arms after
firing — on either leg.

## 9. Metric review

- **Bar 6 is a calibration miss, not a mechanism failure (frozen note
  applied).** The bar (control volleys <= 6/64) was set from floor-b's
  2/16 control, but the true wave-4+ fire rate on a 64-seed band is
  higher: 8 control volleys on 57 files, ALL at wave 4+ (w3 = 0). The
  mechanism reproduced exactly - the floor-4 hold never let a volley
  through below wave 4, and the gun fired once the village reached
  wave-4 fights. The count sits exactly in the prereg's contemplated
  7-8 range. The frozen verdict rule still applies (bar 6 fails), and
  the flip decision should weigh the mechanism reproduction: the bar
  was tight by design against a 2/16 point estimate, and the 64-seed
  rate (~9/64 expected) clears it. A re-calibrated bar for any future
  holdout would be <= 10/64, not <= 6/64.
- **Counting rule worth naming:** the test/analyzer count a volley only
  for recorded holders; a looser count of every searcaster volleyEvent
  gives ctl 17 / arm 51. The gap is volleys by fighters holding a gun
  through unrecorded channels (corpse takes). The bars use the
  holder-gated count, as frozen; the looser count is reported here so
  the next reader is not surprised.
- **Bar 5 held on 50 pairs with room to spare** (CI upper +4.50 vs the
  +5 bar), but the SD (14.77) is large and the 14 missing pairs include
  divergence-heavy seeds; the verdict needs the full 64. No re-scoring:
  the partial read is reported as partial.
- **No metric revision proposed.** The bars did their job: bar 5 is
  resolving toward GO, bar 6 caught a miscalibrated threshold, bars
  3/4/7 are comfortable. The next run should finish the 14 missing
  seeds (same instrument/anchor/band) and render the frozen verdict;
  nothing in this partial read justifies changing a threshold except
  the bar-6 recalibration noted above, which is a coordinator/Steve
  call, not a worker change.

## 10. Infra notes (this run)

- **Runtime-restart kills (3×) + machine restart (1×):** detached driver
  batches were killed twice by runtime/session restarts (~03:05 and
  ~03:16 UTC, both coinciding with an interrupted exec session) and once
  by a full machine restart (~03:27 UTC; `uptime` reset to 1 min, `/tmp`
  wiped). Each kill left completed per-seed files intact and valid
  (all present files re-parsed as JSON; no partials — the driver writes
  a file only when a seed finishes). Missing seeds were re-run with the
  same instrument/anchor/band, never overwriting a valid file. Kill
  pattern recorded: a setsid/nohup batch survives ~9–15 min after its
  launching exec session ends; the final mop-up was therefore launched
  as a live backgrounded exec session instead of a detached wrapper.
- **Heartbeat lock contention:** `worktree-heartbeat.sh` failed 3×
  ("registry lock held > 120s — heartbeat skipped") — siblings hold the
  registry lock under load. Registry heartbeat stayed at
  `2026-11-24T02:34:15+00:00` (from the dead run) through the run; the
  tree was nevertheless continuously written to (corpus files landing),
  and no reaper action touched it. Retried at each closeout step.
- **Write flap:** none observed in this run's writes (index repair,
  rebase, corpus writes all went through).
- **Telemetry deviation check:** NOT RUN - no time in the window; the
  checker refuses recorder-corpus input (floor-b found the same refusal),
  so the wall numbers above come from the analyzer, never faked. The
  coordinator can run it at adoption if wanted.
- `node scripts/check.js --quick` NOT re-run in this arm (prereg §9).

## 11. Verdict - NO FROZEN VERDICT (band incomplete)

**The 64-seed band did not complete: 57/64 control, 56/64 armed, 50
complete pairs. Per prereg §5, the corpus + this progress note are
committed and the exact done/missing seed lists are reported; the
coordinator adopts. No frozen verdict (GO / NO-GO / DIAG) is rendered.**

What the partial band says, plainly: firing the kill-loot gun at wave 3
does not look like it costs village lives - on 50 pairs the armed leg
averages +0.30 deaths per village (essentially nothing), with the whole
plausible range sitting below the bar's ceiling, and the armed villages
live about ten days longer on median. The gun fires a lot more at wave 3
(39 wave-3 volleys vs 0 on the control leg), which is the lever working
as designed. The one frozen bar that fails is the control-volley bar,
and it fails because the bar itself was set too tight: the control leg
fired 8 times, every single time at wave 4 or later, exactly what a
floor-4 hold is supposed to do. The flip decision (default floor 3) now
needs only the 14 missing seeds to be judged cleanly - nothing in this
partial read argues against it.

**Missing runs for adoption (15):** ctl 107691, 107700, 107708, 107715,
107716, 107724, 107733; arm 107687, 107688, 107697, 107698, 107709,
107717, 107724, 107725. Same instrument, same anchor `39b17ae25`, same
band - re-run only these, never overwrite a valid per-seed file.
