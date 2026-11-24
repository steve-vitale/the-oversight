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

**Superseded by §12 below:** run fleshout-loop-b-20261124T0530Z
completed all 15 runs on the same instrument/anchor/band and renders
the frozen verdict (DIAG, bar-6 calibration miss).

## 12. Completion — full 64-seed band (this run, fleshout-loop-b-20261124T0530Z)

**The band is complete: 64/64 control, 64/64 armed, 64 complete pairs.
This section renders the FROZEN verdict. §§0–11 above are the adopted
partial-band progress record; nothing in them is re-scored here.**

### 12.0 Resume (this run)

- **Write flap:** the host refused git writes from ~05:41Z (three
  consecutive `git update-ref` probes failed: "couldn't write
  .../refs/heads/probe.lock", Operation not permitted) while plain file
  writes in the worktree worked. Read-only prep only until the probe
  passed at 05:47:45Z. No writes were hammered; the flap cleared on its
  own. Machine uptime at 05:44Z was 14 min (a restart shortly before
  this run), matching the flap's after-restart pattern.
- **Anchor:** HEAD detached at `39b17ae25` for the runs, then returned
  to branch tip `6107b1fe6` before any analysis or commit. Probe seed
  ctl 107691 verified first: anchorCommit `39b17ae2593b`, gameSha
  `950901f3fdcc`, policySha `1884c8852d38`, floor 4, 0 errors — matching
  the 113 existing files. Only then did the remaining 14 seeds run.
- **The 15 missing runs:** ctl 107691 (probe) + 107700, 107708, 107715,
  107716, 107724, 107733; arm 107687, 107688, 107697, 107698, 107709,
  107717, 107724, 107725. Same instrument/anchor/band as the prereg
  (MODE=arm, KILLBUNDLE=1, STAGE_SEAR=1, CELLGATE=1, floor unset / =3,
  substrate VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1, competent policy,
  150d death-aware). Four driver processes at once (cap 4), sequential
  within each process; all four exits 0; every new file 0 errors. No
  valid per-seed file was overwritten (the driver refuses overwrites
  with exit 3). Total run time for the 15 seeds: ~6 min.
- **Detached-checkout note for the coordinator:** the 113 existing
  corpus files were tracked in `6107b1fe6`, so detaching HEAD to
  `39b17ae25` removed them from the worktree disk (they stayed safe in
  git). Returning to the branch tip restored all 113 byte-identical,
  and the 15 new files (untracked) were untouched by the checkout. If
  a future resume is ever killed while detached, `git checkout
  sim-cellgate-holdout-b` restores the corpus; the new per-seed files
  survive as untracked files.
- **Instrument re-verified on the branch tip:** `node
  scripts/test-cellgate-holdout-b.js` 56/56 green; analyzer `--dir`
  per leg, `--compare`, tier tally, holdout `--analyze`, panel build +
  compare all run on the full band (below).

### 12.1 Bar verdicts (frozen, prereg §7) — FULL BAND, n=64

Authoritative counts are the holdout test's (`--analyze`), which counts
a volley only when the firer is a recorded kill-loot/contest holder. A
looser count of every searcaster volleyEvent with shots > 0 gives ctl
18 / arm 58 (arm 47 w3, 11 w4+; ctl 16 w4, 2 w5, 0 w3). The bars use
the test's counts, as the prereg directs.

| # | Bar | Full-band result (64 pairs / 64+64 files) |
|---|---|---|
| 1 | Instrument validity | **PASS** — ctl files=64 arm files=64; errors 0/0; anchors 1/1; gameShas 1/1; policySha mismatches 0/0; floors ctl={"4":64} arm={"3":64} |
| 2 | Cells-at-arrival | **PASS** — ctl staged 64/64 bundled, natural 2/2, dry 0; arm staged 64/64 bundled, natural 5/5, dry 0 |
| 3 | Volley replication (armed >= 20) | **PASS** — 50 armed volleys (expectation 32) |
| 4 | Wave-3 specificity (armed >= 12) | **PASS** — 45 wave-3 volleys (expectation 28) |
| 5 | **PRIMARY — paired village deaths** | **PASS** — paired mean +0.766/run (bar <= +2); 95% CI [-3.321, +4.852] (bar upper <= +5); n=64, SD 16.360, SE 2.045, t(0.975,63)=1.9983, median 0, worse 22 / better 18 / tied 24, total +49 over 64 pairs |
| 6 | Control replication (<= 6) | **FAIL** — 9 control volleys (bar <= 6), ALL at wave 4+ (w3 = 0). The prereg's calibration-note case, one count above its contemplated 7–8 range — see metric review |
| 7 | Guardrails | **PASS** — starvation delta -6 (ctl 29, arm 23; bar <= +2); median-survival delta +10d (ctl 140, arm 150; bar >= -20) |
| 8 | Balanced panel (§15) | **PASS** — decision `review_required`; non-deaths watch/regression rows: none; the only watch row is villageDeaths `regression_watch` (delta +0.766, CI [-3.375, +4.609]), judged by bar 5 per prereg §7 bar 8, not by this bar |
| 9 | Sense-test + per-seed table | **DELIVERED** — §12.5 story (seed 107724 arm) + full paired table §12.9 + staged rows §12.10; re-arms 0 in all 128 files |

**Test-field reconciliation (read before quoting a verdict):** the
holdout test's mechanical `verdict` field prints `GO` on the full band.
That field is NOT the frozen judge: the test's verdict code never wires
bar 6 (it computes a `core` array including bar 6 and then does not
use it — the ternary only checks bars 1–4 and the deaths bar). Under
the prereg's frozen verdict rule, GO requires bars 1–4 AND 6–9 to
pass; bar 6 fails, so the mechanical GO does not stand. The frozen
verdict is rendered in §12.8. The test itself is left unchanged (the
prereg froze it; re-wiring its verdict logic mid-judgment would be
re-scoring the instrument) — this discrepancy is recorded here for the
coordinator, and the test stays green (56/56).

### 12.2 Full-band aggregates (analyzer `--dir` per leg + `--compare` + tier tally)

| | control floor 4 (64 files) | armed floor 3 (64 files) |
|---|---|---|
| kill-loot arrivals (staged + natural) | 66 (64 staged + 2 natural) | 69 (64 staged + 5 natural) |
| bundled arrivals / dry | 66 / 0 | 69 / 0 |
| kill-loot volleys, holder-gated (w3 / w4+) | 9 (0 / 9) | 50 (45 / 5) |
| searcaster volleys, loose count (w3 / w4+) | 18 (0 / 18) | 58 (47 / 11) |
| total village deaths | 6487 | 6536 |
| starvation deaths | 29 | 23 |
| median survival | 140d | 150d |
| max survival | 152d | 152d |
| villages survived / lost | 29 / 35 | 35 / 29 |
| wave 5 unlocked | 27/64 | 28/64 |
| wave 4 reached | 62/64 | 63/64 |
| wins / national | 0 / 0 | 0 / 0 |
| tier tally (all kill-loot drops) | 590 drops: t1 81, t2 286, t3 116, t4 107 (18.1%); sear 66 (11.2%) | 612 drops: t1 81, t2 286, t3 128, t4 117 (19.1%); sear 69 (11.3%) |
| holder-days with cells | 4960 | 3148 |
| re-arm events / re-arm volleys | 0 / 0 | 0 / 0 |

The analyzer's own `--compare` verdict field reads `NO-GO` — that is
its pilotGO bar, inapplicable on this arm by construction (it requires
ctl bundled == 0, as prereg §8 records); its guardrails pass (starv
delta -6, median delta +10). The frozen bars are the judge.

### 12.3 Bar 5 decomposition (full band, as floor-b §7 did)

Paired mean **+0.766 deaths/run**, total **+49 over 64 pairs**. The 14
new pairs contributed +34 (mean +2.43 on the new pairs, vs +0.30 on
the first 50) — the completion ran hotter than the partial band, yet
the full-band mean (+0.77) and CI upper (+4.85) still pass, both with
room on the mean and a thin margin on the CI upper (see metric review).

Largest deltas: 107696 +43, **107724 +39** (new), 107685 +36, 107703
+27, 107712 +26, 107716 +24 (new). Most negative: 107725 -52 (new),
107726 -52, 107699 -31, 107672 -28, 107715 -18 (new), 107722 -15.
24 of 64 pairs are exactly tied — the floor usually changes nothing
about the death count, and when it changes anything it is a
downstream-divergence story, not a systematic cost:

- **Big positives are saved villages living longer.** 107724: ctl lost
  at d119 with 157 deaths; arm survived to d151 with 196 deaths and
  standing 860 (the highest standing in the band). 107696: ctl lost
  d94/123, arm survived d151/166. 107685: both survived, arm 162 vs
  ctl 126 over nearly identical days. The armed village lived longer
  and recorded more deaths — the same pattern the prereg hypothesized
  for the 16-seed +82.
- **Big negatives are divergence the other way.** 107725: ctl lost
  d111/119, arm survived d151 with only 67 deaths — the firing SAVED
  lives outright. 107726: ctl lost d107/126, arm lost early d63/74
  and stopped accumulating deaths. 107699: ctl survived d150/158,
  arm lost d135/127.

### 12.4 Wall numbers (FULL band; wins/national/table NOT instrumented by this driver — recorded as not instrumented, never faked)

| | control floor 4 | armed floor 3 |
|---|---|---|
| wins | not instrumented | not instrumented |
| national reach | not instrumented | not instrumented |
| table | not instrumented | not instrumented |
| wave 5 unlocked | 27/64 | 28/64 |
| wave 4 reached | 62/64 | 63/64 |
| median survival | 140d | 150d |
| max survival | 152d | 152d |
| villages survived / lost | 29 / 35 | 35 / 29 |
| total village deaths | 6487 | 6536 |
| starvation deaths | 29 | 23 |

The scale wall stands: on this band, as on floor-b's 16-seed band, no
win is instrumented and wave 5 opens (roughly 43% of villages) while
the full seat stays out of reach. The armed leg's median survival runs
10 days longer than control, and 6 more villages survive to the end —
the direction the guardrails watch, and they pass.

### 12.5 Sense-test (bar 9) — a firing holder as a village story, new seed

**Seed 107724, arm leg (floor 3), village survived 151 days, wave 5,
standing 860, 196 deaths.** The story of its gun — and of the gun
that never fired:

- Day 7: villager `gen_65bodi4` kills something in the wild; the
  kill-loot roll lands a searcaster with exactly 2 fusion cells — the
  staged arrival, bundled as designed.
- Days 9–23: `gen_65bodi4` walks into wave-1 and wave-2 fights carrying
  the loaded gun and fires nothing — shots 0 every time. That is the
  floor-3 hold working: the gun stays silent below wave 3, even in the
  holder's hands, fight after fight.
- Day 26: the first wave-3 fight, a Callback wearing a dead villager's
  face. `gen_65bodi4` fires both cells — 2 shots, 1 hit, 66 damage,
  ammo left 0. The gun did exactly what the bundle promised on the
  first qualifying fight.
- Day 43: Ursula Weber wins her own searcaster as a contest prize
  (the old contest-prize channel, not kill-loot). She carries it
  loaded through wave-1 and wave-2 fights (shots 0 — held, correctly)
  and never faces a wave-3+ fight while holding it. Her gun ends the
  run still loaded: a holder who never got a qualifying fight, not a
  holder who hoarded one.
- Day 75: `gen_65bodi4` wins a SECOND searcaster as a contest prize —
  a fresh gun with its own 2 cells, earned at the show, not reloaded
  from a corpse (rearmTakeEvents is empty; REARM was unset by design).
- Day 87: `gen_65bodi4` fires the second gun at a wave-3 Ad Break —
  2 shots, 1 hit, 64 damage, ammo left 0.
- The village survived to day 151 at standing 860 — the highest
  standing in the whole 64-seed band — while its control twin lost the
  village on day 119 at standing 465. The two volleys (130 damage
  across two mid-build wave-3 fights) are not provably the cause of
  that survival, and this evidence does not claim they are; but the
  direction is the one the lever promises, and nothing in the record
  contradicts it.

What this means as a village story: the gun is used, not worshipped,
and never wasted — held silent through every fight below its floor,
fired at the first serious monster it is allowed to meet, then empty
until the village earns another. Nobody re-arms from a corpse; the
second gun came from winning at the show, which is the village's other
honest way of getting one. The missing piece is unchanged from the
partial band: nobody says anything about the gun — no comment, no
celebration, no fight over who carries it. The gun arrives and fires
silently, which is a blank worth naming, not a defect in the firing.

**Re-arms:** `rearmTakeEvents` is empty on every file on BOTH legs (0
re-arms in 64 ctl + 64 arm files). REARM was unset in this arm by
design, so no corpse-take reload channel existed; once a holder fires,
their gun stays empty until the village earns another gun. No holder
re-arms after firing — on either leg.

### 12.6 Metric review (full band)

- **Bar 6 is a calibration miss, not a mechanism failure (frozen note
  applied, one count over its range).** The bar (control volleys
  <= 6/64) was set from floor-b's 2/16 control, but the true wave-4+
  fire rate on a 64-seed band is higher: 9 control volleys on 64
  files, ALL at wave 4+ (w3 = 0). The mechanism reproduced exactly —
  the floor-4 hold never let a volley through below wave 4. The count
  landed at 9, one above the prereg's contemplated 7–8 range; it is
  consistent with the 2/16 rate within noise (scaled expectation 8/64;
  binomial SD ~2.65, so 9 is +0.4 SD), and the bar itself sits BELOW
  the scaled expectation — the expected count fails the bar. A
  re-calibrated bar for any future holdout would be <= 10/64, not
  <= 6/64. The frozen verdict follows the brief's rule for this case
  (§12.8); the flip decision weighs the mechanism reproduction.
- **The new pairs ran hotter, and the CI upper margin is thin.** The
  first 50 pairs averaged +0.30 deaths/run (CI upper +4.50); the 14
  completion pairs averaged +2.43, driven by 107724 +39, 107716 +24,
  107717 +22, 107687 +21, partly offset by 107725 -52 and 107715 -18.
  The full-band CI upper is +4.85 against a +5 bar — it passes, but
  by 0.15. No re-scoring: the number is what it is, and the bar is
  what it is. If a future holdout re-tests deaths, it should keep
  these exact thresholds rather than widen them to fit.
- **Test verdict-field discrepancy (instrument note, not a bar).** The
  holdout test prints mechanical `verdict: GO` because its verdict
  code does not wire bar 6 (see §12.1). The frozen verdict is DIAG
  per the prereg + brief. The test is left unchanged; the coordinator
  may want its verdict code to implement the prereg rule (bar 6 wired
  in, with the calibration note as a named outcome) before any future
  holdout reuses it.
- **Counting rule (unchanged):** the test/analyzer count a volley only
  for recorded holders; a looser count of every searcaster volleyEvent
  gives ctl 18 / arm 58. The gap is volleys by fighters holding a gun
  through unrecorded channels (corpse takes). The bars use the
  holder-gated count, as frozen.
- **No other metric revision proposed.** Bars 1–5, 7, 8 pass on the
  full band; bar 3/4 clear their thresholds by 2.5×/3.75×; bar 7 is
  comfortable. The deaths question the holdout was built to answer is
  answered: firing at wave 3 does not cost lives on balance.

### 12.7 Infra notes (this run)

- **Write flap (2026-11-24 ~05:41–05:47Z):** host refused git writes
  (update-ref probe failed 3×); plain file writes worked throughout.
  Read-only prep only while the probe failed; probe passed 05:47:45Z
  and all subsequent writes (checkout, corpus, panel, commit) went
  through. No work lost.
- **No runtime/machine restart kills in this run.** All 15 seeds ran
  in ~6 min inside one window; all 4 driver processes exited 0. The
  0230Z run's kill pattern (detached batches dying ~9–15 min after
  launch) did not recur — the batch was short enough to finish inside
  the window.
- **Concurrency:** 4 driver processes max, observed fine on the 6 GB
  box (the 2026-11-24 ~04:22Z simultaneous death of 16 concurrent
  drivers was not repeated at 4).
- **Heartbeat:** `worktree-heartbeat.sh sim-cellgate-holdout-b` ran
  clean at 05:47Z and 06:00Z (no registry-lock contention this run).
- **Telemetry deviation check:** `node scripts/telemetry-check.js
  --baseline …/telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-21/perseed-cellgate-holdout-b-ctl/*.json'
  --metrics national,table,wins,exiled` — refuses recorder-corpus
  input, exactly as floor-b found ("all 64 --current rows carry
  top-level anchorCommit, so they are sweep recorder rows, not runs").
  No LOUD lines; the wall numbers in §12.4 come from the analyzer,
  never faked. A `*` in a directory component is not expanded by the
  checker (scandir ENOENT) — the single-dir pattern above is the
  working invocation.
- `node scripts/check.js --quick` NOT re-run in this arm (prereg §9).
- Panel artifacts committed with this evidence:
  `evidence/2026-11-24/cellgate-holdout-b-panel-before.json.gz`,
  `...-after.json.gz`, `cellgate-holdout-b-panel.json`,
  `cellgate-holdout-b-panel.md` (decision `review_required`).

### 12.8 FROZEN VERDICT — DIAG (bar-6 calibration miss)

**Bars 1–5, 7–9 pass; bar 6 is the sole failure, and it fails as the
prereg's calibration-note case (9 control volleys, all wave-4+, count
consistent with the 2/16 rate within noise, bar set below the scaled
expectation). Per the run brief's rule for exactly this case, the
frozen verdict is DIAG — the verdict is about the bar's calibration,
not about the deaths question or the mechanism.**

What the full band says, plainly: firing the kill-loot gun at wave 3
does not cost village lives — on 64 pairs the armed leg averages
+0.77 deaths per village (essentially nothing), with the whole
plausible range sitting below the bar's ceiling, and the armed
villages live ten days longer on median with six more villages
surviving. The gun fires far more at wave 3 (45 wave-3 volleys vs 0
on the control leg), which is the lever working as designed, and the
floor-4 hold never let a single volley through below wave 4 on either
counting rule. The one frozen bar that fails is the control-volley
bar, and it fails because the bar itself was set too tight: the
control leg fired 9 times, every single time at wave 4 or later,
exactly what a floor-4 hold is supposed to do.

**Recommendation (recorded, NOT acted on — the flip decision is a
coordinator/Steve call, nothing is flipped here):** the deaths watch
that blocked the flip is resolved — bar 5 passes on the full 64-seed
band with the mechanism reproduced exactly on both legs. The evidence
supports flipping the default floor to 3, with the bar-6 calibration
note attached (a re-calibrated control bar would be <= 10/64). The
only caution is the thin CI-upper margin (+4.85 vs the +5 bar) — the
flip case is strong, not overwhelming.

### 12.9 Paired village deaths (bar 5, PRIMARY) — FULL BAND, n=64

Official `--analyze` numbers: paired mean **+0.766 deaths/run**, SD
16.360, SE 2.045, t(0.975, 63) = 1.9983, **95% CI [-3.321,
+4.852]**, median 0, worse 22 / better 18 / tied 24, total +49 over
64 pairs. Both thresholds met (mean <= +2, CI upper <= +5).

Volley counts in this table are the looser per-event count (every
searcaster volleyEvent with shots > 0, including non-holder firers);
the bar counts in §12.1 are the test's holder-gated counts (ctl 9 /
arm 50, 45 w3).

## PAIRED TABLE, FULL BAND (seed | days ctl/arm | end ctl/arm | wave ctl/arm | standing ctl/arm | deaths ctl/arm/delta | volleys ctl/arm)
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
| 107687 | 129/146 | village-lost/village-lost | 5/5 | 260/440 | 109/130/+21 | 0/1 |
| 107688 | 151/151 | survived/survived | 4/5 | 199/275 | 67/74/+7 | 0/2 |
| 107689 | 100/100 | village-lost/village-lost | 4/4 | 199/199 | 118/118/+0 | 1/1 |
| 107690 | 151/114 | survived/village-lost | 4/4 | 199/199 | 139/129/-10 | 1/1 |
| 107691 | 112/124 | village-lost/village-lost | 4/4 | 199/199 | 77/79/+2 | 0/1 |
| 107692 | 151/151 | survived/survived | 4/4 | 199/199 | 154/154/+0 | 0/0 |
| 107693 | 141/151 | village-lost/survived | 5/5 | 445/375 | 110/116/+6 | 0/1 |
| 107694 | 147/150 | survived/survived | 5/5 | 630/550 | 176/179/+3 | 0/1 |
| 107695 | 60/63 | village-lost/village-lost | 3/4 | 70/165 | 73/72/-1 | 0/1 |
| 107696 | 94/151 | village-lost/survived | 4/4 | 199/199 | 123/166/+43 | 0/2 |
| 107697 | 152/152 | survived/survived | 5/5 | 400/400 | 103/103/+0 | 0/0 |
| 107698 | 127/127 | village-lost/village-lost | 4/4 | 199/199 | 71/71/+0 | 0/0 |
| 107699 | 150/135 | survived/village-lost | 5/5 | 815/315 | 158/127/-31 | 2/1 |
| 107700 | 151/151 | survived/survived | 5/5 | 340/365 | 104/94/-10 | 0/1 |
| 107701 | 124/124 | village-lost/village-lost | 5/5 | 445/445 | 82/82/+0 | 0/0 |
| 107702 | 151/151 | survived/survived | 4/5 | 199/455 | 87/94/+7 | 0/1 |
| 107703 | 151/150 | survived/survived | 4/4 | 199/199 | 80/107/+27 | 0/1 |
| 107704 | 151/151 | survived/survived | 5/5 | 275/275 | 91/91/+0 | 0/0 |
| 107705 | 143/143 | village-lost/village-lost | 4/4 | 199/199 | 64/64/+0 | 1/1 |
| 107706 | 151/151 | survived/survived | 4/4 | 199/199 | 61/61/+0 | 0/0 |
| 107707 | 150/150 | survived/survived | 4/4 | 199/199 | 86/86/+0 | 0/0 |
| 107708 | 96/96 | village-lost/village-lost | 4/4 | 199/199 | 100/100/+0 | 1/1 |
| 107709 | 150/150 | survived/survived | 4/4 | 199/199 | 74/74/+0 | 0/0 |
| 107710 | 151/150 | survived/survived | 5/5 | 620/550 | 130/138/+8 | 1/1 |
| 107711 | 151/151 | survived/survived | 5/5 | 355/435 | 74/87/+13 | 0/1 |
| 107712 | 125/151 | village-lost/survived | 4/4 | 199/199 | 89/115/+26 | 0/1 |
| 107713 | 98/98 | village-lost/village-lost | 5/5 | 315/315 | 132/132/+0 | 1/1 |
| 107714 | 149/151 | survived/survived | 5/5 | 935/520 | 149/143/-6 | 0/2 |
| 107715 | 151/132 | survived/village-lost | 5/4 | 600/199 | 126/108/-18 | 0/1 |
| 107716 | 151/150 | survived/survived | 4/4 | 199/199 | 98/122/+24 | 0/2 |
| 107717 | 150/151 | survived/survived | 4/4 | 199/199 | 123/145/+22 | 0/1 |
| 107718 | 151/150 | survived/survived | 5/4 | 375/199 | 108/114/+6 | 2/1 |
| 107719 | 150/145 | survived/village-lost | 4/4 | 199/199 | 75/79/+4 | 0/1 |
| 107720 | 118/118 | village-lost/village-lost | 5/5 | 415/415 | 100/100/+0 | 0/0 |
| 107721 | 79/79 | village-lost/village-lost | 4/4 | 175/175 | 54/54/+0 | 0/0 |
| 107722 | 115/151 | village-lost/survived | 4/5 | 199/400 | 114/99/-15 | 3/1 |
| 107723 | 126/151 | village-lost/survived | 5/5 | 485/555 | 110/128/+18 | 1/2 |
| 107724 | 119/151 | village-lost/survived | 5/5 | 465/860 | 157/196/+39 | 0/2 |
| 107725 | 111/151 | village-lost/survived | 5/4 | 395/199 | 119/67/-52 | 0/1 |
| 107726 | 107/63 | village-lost/village-lost | 5/4 | 420/199 | 126/74/-52 | 0/1 |
| 107727 | 85/122 | village-lost/village-lost | 4/4 | 125/199 | 80/88/+8 | 0/1 |
| 107728 | 127/152 | village-lost/survived | 4/4 | 195/199 | 61/49/-12 | 0/1 |
| 107729 | 107/107 | village-lost/village-lost | 5/5 | 199/199 | 81/81/+0 | 0/0 |
| 107730 | 107/107 | village-lost/village-lost | 5/5 | 199/199 | 133/133/+0 | 0/0 |
| 107731 | 139/139 | village-lost/village-lost | 4/4 | 199/199 | 109/109/+0 | 0/0 |
| 107732 | 151/151 | survived/survived | 5/5 | 350/350 | 91/91/+0 | 0/0 |
| 107733 | 151/151 | survived/survived | 5/5 | 220/345 | 79/78/-1 | 0/1 |

paired n=64 mean=0.766 sd=16.360 se=2.045 t=1.9983 CI=[-3.321, 4.852] median=0.0 worse=22 better=18 tied=24 total=+49
bar5: mean<=+2 ? True ; CI upper<=+5 ? True
largest deltas: [(43, 107696), (39, 107724), (36, 107685), (27, 107703), (26, 107712), (24, 107716)]
most negative: [(-52, 107725), (-52, 107726), (-31, 107699), (-28, 107672), (-18, 107715), (-15, 107722)]

CTL: files=64 volleys=9 w3=0 w4+=9 staged searcaster arrivals=66 rearmTakes=0 deaths=6487 starv~29 medianDays=140 maxDays=152 survived=29 lost=35 wave5=27 wave4=62 wins=0

ARM: files=64 volleys=50 w3=45 w4+=5 staged searcaster arrivals=69 rearmTakes=0 deaths=6536 starv~23 medianDays=150 maxDays=152 survived=35 lost=29 wave5=28 wave4=63 wins=0

### 12.10 Staged per-seed rows — the 15 completion seeds (completes §6)

Volley counts here are the looser per-event count (every searcaster
volleyEvent with shots > 0, including non-holder firers); the bar counts
in §12.1 are the test's holder-gated counts (ctl 9 / arm 50, 45 w3).
Staged arrival = first kill-loot roll of the seed forced to searcaster
(STAGE_SEAR); every staged arrival on both legs carried exactly 2 cells.

## STAGED TABLE, completion seeds (seed | staged day/holder | volleys shots/hits/dmg)
### CTL
| 107691 | d6 jovan_milic | none |
| 107700 | d4 gen_3ihzlq5 | none |
| 107708 | d9 gen_csmioqj; d85 visjoin_83 | d85 w4 eulogy 2/2 132dmg |
| 107715 | d6 gen_oeb4mvw | none |
| 107716 | d6 stan_kowalski | none |
| 107724 | d7 gen_65bodi4 | none |
| 107733 | d9 gen_wafp9wb | none |
### ARM
| 107687 | d7 gen_fa88ovo | d31 w3 chorus_line 2/1 65dmg |
| 107688 | d5 owen_smith | d39 w3 terms_of_service 2/1 64dmg; d92 w4 eulogy 2/0 0dmg |
| 107697 | d3 mia_andersson | none |
| 107698 | d5 farid_ahmed | none |
| 107709 | d10 sam_wilson | none |
| 107717 | d5 gen_ffm9w2s | d51 w3 gavel 2/0 0dmg |
| 107724 | d7 gen_65bodi4 | d26 w3 callback 2/1 66dmg; d87 w3 ad_break 2/1 64dmg |
| 107725 | d5 gen_qgsu2mk | d25 w3 callback 2/1 65dmg |

Note on ctl 107708: the d85 volley was fired by `visjoin_83`, a
natural (second) arrival — a wild-join villager who arrived already
holding a searcaster with 2 cells and fired it at a wave-4 Eulogy.
It is the 9th holder-gated control volley and, like the other 8, at
wave 4+.
