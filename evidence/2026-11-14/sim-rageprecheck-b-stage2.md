# sim-rageprecheck-b — Stage 2 confirm: GO (primary 756 → 0)

Run: fleshout-loop-b-20261114T0330Z (Loop B), arm sim-rageprecheck-b
Axis: winnability chain. This arm attacks the wave-4-kills link: the
scholar burns turns re-pressing an unspent Unleash Rage buff instead
of striking.
Branch: sim-rageprecheck-b — worktree ~/workspace/worktrees/sim-rageprecheck-b
Base: master 8ab7a81c8 (prereg anchor); fix on 82cfe281e
Date: 2026-11-14
Prereg: evidence/2026-11-14/sim-rageprecheck-b-prereg.md (pilot, binds
the lever) + evidence/2026-11-14/sim-rageprecheck-b-stage2-prereg.md
(confirm addendum, binds this verdict). Pilot verdict: GO 117 → 0 on
8 seeds (evidence/2026-11-14/sim-rageprecheck-b.md).
Closeout: the 0330Z run TIMED OUT at its 2h cron deadline with Stage 2
incomplete (before-leg 4/32 files, after-leg not started). This note
is the closeout coordinator's adoption: the before-leg was completed
(28 runs), the after-leg run whole (32 runs), and the verdict judged
on the confirm band ALONE.

## Verdict: GO — primary 0 pooled AND 0 fresh-only, guardrails held

The engine precheck closes the (A) residual on the full confirm band:
successful wholly-unspent refresh presses 756 → 0 summed over
competent + capable on identical seeds, with guardrails held. The
fresh-only subset (98801–98810, the 10 seeds never run by another
arm) also reads 424 → 0, so the 98811–98816 bankkiller overlap is
moot. Partly-spent refreshes 2 → 0 pooled. Per-presser: competent
226 → 0, capable-run competent-fallback path 530 → 0, capable's own
path 0 → 0 — the residual dies exactly where it lived (the fallback
path carried 530 of the 756). Every press after the fix is fresh
(175/175). Worst fight: 161 presses of nothing → 4 real ones
(seed 98809 capable: 307 presses, 277 unspent, max/fight 161 →
6 fresh presses, max/fight 2).

| policy | presses before → after | refresh-unspent before → after | partly-spent refresh | rage kcal | strikes landed | wave-4 kills | wave-5 kills | won |
|--------|------------------------|-------------------------------|----------------------|-----------|----------------|--------------|--------------|-----|
| competent | 360 → 87 | **226 → 0** | 2 → 0 | 21600 → 5220 | 1174 → 1240 | 34 → 26 | 5 → 5 | 0/16 → 0/16 |
| capable | 528 → 88 | **530 → 0** | 0 → 0 | 31680 → 5280 | 421 → 394 | 34 → 31 | 14 → 14 | 16/16 → 16/16 |
| TOTAL | 888 → 175 | **756 → 0** | 2 → 0 | 53280 → 10500 | 1595 → 1634 | 68 → 57 | 19 → 19 | 16/32 → 16/32 |

42,780 kcal saved across the band. Refused presses
(useAbility-level): 0 → 0 both policies (availability gate — the
choke point fires before useAbility is reached; the refusal itself
is proven by the staged R1/R2 legs, see the pilot note).

Guardrails (prereg, control = confirm before leg): starvation
competent 1 → 0, capable 1 → 1 (bar ≤ control+2 — HELD); median
survival competent 121 → 122.5d (bar ≥ 0.8× — HELD), capable
90 → 90d (HELD). Villager (non-scholar) deaths — the §14c
co-primary: 1769 → 1785 (+16 on 32 runs, ~0.5/run, no guardrail
on this count); scholar deaths 194 → 194.

Per-seed (before → after; presses fresh/unspent, max/fight):

### competent
| seed | days | end | maxWave | standing | presses (fresh/unspent) | max/fight | strikes | w4/w5 kills | won |
| 98801 | 118 -> 147 | village-lost | 4 | 199 -> 199 | 6 (1/5) -> 2 (2/0) | 6 -> 2 | 73 -> 126 | 1/0 -> 2/0 | False -> False |
| 98802 | 86 -> 86 | village-lost | 4 | 199 -> 199 | 0 (0/0) -> 0 (0/0) | 0 -> 0 | 74 -> 74 | 2/0 -> 2/0 | False -> False |
| 98803 | 124 -> 90 | village-lost | 4 | 199 -> 125 | 31 (4/27) -> 3 (3/0) | 24 -> 1 | 168 -> 85 | 4/0 -> 0/0 | False -> False |
| 98804 | 86 -> 145 | village-lost | 4 | 199 -> 199 | 15 (3/12) -> 3 (3/0) | 6 -> 2 | 91 -> 118 | 3/0 -> 2/0 | False -> False |
| 98805 | 87 -> 87 | village-lost | 5 | 205 -> 205 | 0 (0/0) -> 0 (0/0) | 0 -> 0 | 32 -> 32 | 2/0 -> 2/0 | False -> False |
| 98806 | 150 -> 147 | survived -> village-lost | 5 | 295 -> 320 | 5 (1/4) -> 6 (6/0) | 5 -> 3 | 62 -> 68 | 3/0 -> 4/1 | False -> False |
| 98807 | 150 -> 150 | survived | 5 | 300 -> 300 | 16 (2/14) -> 5 (5/0) | 12 -> 4 | 53 -> 51 | 3/2 -> 3/2 | False -> False |
| 98808 | 131 -> 131 | village-lost | 4 | 199 -> 199 | 0 (0/0) -> 0 (0/0) | 0 -> 0 | 78 -> 78 | 1/0 -> 1/0 | False -> False |
| 98809 | 99 -> 120 | village-lost | 4 | 199 -> 199 | 10 (1/9) -> 17 (17/0) | 10 -> 4 | 67 -> 83 | 3/0 -> 3/0 | False -> False |
| 98810 | 52 -> 53 | village-lost | 4 | 199 -> 199 | 6 (2/4) -> 2 (2/0) | 4 -> 1 | 35 -> 42 | 1/0 -> 1/0 | False -> False |
| 98811 | 90 -> 138 | village-lost | 4 | 199 -> 395 | 22 (3/19) -> 4 (4/0) | 10 -> 1 | 56 -> 116 | 1/0 -> 3/1 | False -> False |
| 98812 | 132 -> 104 | village-lost | 4 | 199 -> 185 | 23 (3/20) -> 2 (2/0) | 10 -> 2 | 109 -> 57 | 4/0 -> 1/0 | False -> False |
| 98813 | 150 -> 118 | survived -> village-lost | 4 | 199 -> 199 | 40 (3/37) -> 4 (4/0) | 32 -> 2 | 88 -> 84 | 1/0 -> 2/0 | False -> False |
| 98814 | 80 -> 82 | village-lost | 4 | 145 -> 145 | 20 (3/17) -> 5 (5/0) | 11 -> 2 | 65 -> 67 | 0/0 -> 0/0 | False -> False |
| 98815 | 142 -> 125 | village-lost | 4 | 199 -> 245 | 50 (5/45) -> 5 (5/0) | 18 -> 2 | 91 -> 107 | 1/0 -> 1/0 | False -> False |
| 98816 | 150 -> 150 | survived | 5 | 375 -> 400 | 15 (2/13) -> 7 (7/0) | 11 -> 3 | 118 -> 72 | 6/0 -> 4/0 | False -> False |

### capable
| seed | days | end | maxWave | standing | presses (fresh/unspent) | max/fight | strikes | w4/w5 kills | won |
| 98801 | 90 -> 90 | over-other | 4 | 199 -> 199 | 0 (0/0) -> 0 (0/0) | 0 -> 0 | 9 -> 9 | 1/0 -> 1/0 | True -> True |
| 98802 | 90 -> 92 | over-other | 5 | 561 -> 586 | 8 (5/3) -> 7 (7/0) | 4 -> 1 | 36 -> 37 | 4/4 -> 5/4 | True -> True |
| 98803 | 89 -> 90 | over-other | 4 | 199 -> 199 | 8 (4/4) -> 4 (4/0) | 4 -> 1 | 5 -> 5 | 0/0 -> 0/0 | True -> True |
| 98804 | 91 -> 91 | over-other | 4 | 165 -> 165 | 0 (0/0) -> 0 (0/0) | 0 -> 0 | 3 -> 3 | 0/0 -> 0/0 | True -> True |
| 98805 | 104 -> 104 | over-other | 4 | 199 -> 199 | 1 (1/0) -> 1 (1/0) | 1 -> 1 | 91 -> 91 | 4/0 -> 4/0 | True -> True |
| 98806 | 89 -> 89 | over-other | 4 | 199 -> 199 | 15 (7/8) -> 6 (6/0) | 5 -> 1 | 31 -> 32 | 2/0 -> 2/0 | True -> True |
| 98807 | 90 -> 90 | over-other | 4 | 199 -> 199 | 0 (0/0) -> 0 (0/0) | 0 -> 0 | 5 -> 5 | 0/0 -> 0/0 | True -> True |
| 98808 | 91 -> 90 | over-other | 5 | 460 -> 490 | 43 (3/40) -> 12 (12/0) | 22 -> 4 | 45 -> 74 | 2/2 -> 2/4 | True -> True |
| 98809 | 99 -> 93 | over-other | 5 | 712 -> 532 | 307 (30/277) -> 6 (6/0) | 161 -> 2 | 25 -> 11 | 7/6 -> 4/2 | True -> True |
| 98810 | 90 -> 92 | over-other | 5 | 571 -> 621 | 29 (12/17) -> 16 (16/0) | 6 -> 1 | 10 -> 12 | 2/0 -> 2/0 | True -> True |
| 98811 | 91 -> 90 | over-other | 5 | 512 -> 592 | 79 (13/65) -> 27 (27/0) | 31 -> 1 | 9 -> 19 | 3/0 -> 3/2 | True -> True |
| 98812 | 89 -> 89 | over-other | 4 | 199 -> 199 | 33 (2/31) -> 9 (9/0) | 31 -> 1 | 24 -> 22 | 1/0 -> 0/0 | True -> True |
| 98813 | 90 -> 90 | over-other | 5 | 536 -> 199 | 97 (12/84) -> 1 (1/0) | 21 -> 1 | 8 -> 5 | 4/2 -> 0/0 | True -> True |
| 98814 | 90 -> 90 | over-other | 5 | 487 -> 487 | 0 (0/0) -> 0 (0/0) | 0 -> 0 | 20 -> 20 | 2/3 -> 2/3 | True -> True |
| 98815 | 89 -> 89 | over-other | 4 | 199 -> 199 | 6 (6/0) -> 6 (6/0) | 1 -> 1 | 3 -> 3 | 0/0 -> 0/0 | True -> True |
| 98816 | 90 -> 90 | over-other | 4 | 199 -> 199 | 3 (2/1) -> 15 (15/0) | 2 -> 3 | 11 -> 26 | 0/0 -> 1/0 | True -> True |

Per-seed swings cut both ways, same shape as the pilot: 98813
competent survived 150d on base code and died at 118d with the
fix (40 presses of nothing → 4 fresh ones, strikes 88 → 84);
98811 competent went the other way (90 → 138d, standing 199 →
395, strikes 56 → 116). Wave-4 kills pooled 68 → 57 while strikes
landed rose 1595 → 1634 and wave-5 kills held 19 → 19 — the drop
is spread across seeds (98803 competent 4 → 0, 98812 competent
4 → 1, 98816 competent 6 → 4), not a single-seed artifact, and
wins are unchanged (16/32 both legs). The lever removes wasted
turns; it does not buy wave-4 kills. Reported, not a GO leg.

## Balanced panels (§15) — corroboration

Both confirm panels built cleanly (32 cases each, 0 cached before /
15 cached after — the after build resumed from a SIGTERM kill, see
below): panel-rageprecheck-b-confirm-before and
panel-rageprecheck-b-confirm-after. Compare decision
**review_required** (exit 2 is the compare script's convention for
any decision other than no_material_signal), no material signal on
any judged metric: table win/entry/sitting 0 → 0 competent,
1 → 1 capable; national 0 → 0 competent, 0.8125 → 0.8125
capable. The review_required comes from small regression_watch
flags on death-rate metrics (competent player deaths 10.44 →
10.69/run, village deaths +0.69/run, community loss 0.75 → 0.875
— the 98803/98813 swings), all with intervals spanning 0. Per
the Stage 2 prereg this does not block the driver GO (pilot
precedent). Compare:
evidence/2026-11-14/panel-rageprecheck-b-confirm-compare.md/.json.

## Telemetry check — NOT APPLICABLE (tool refusal, by design)

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-14/perseed-rageprecheck-b-confirm-after/*.json'
--metrics national,table,wins,exiled --sweep-rows` exits 2:
"refusing recorder-corpus input: all 32 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs.
Recorder corpora are compared with sweep-compare tables, never
against a run baseline here." The panel compare above is the
corroboration for this arm; the telemetry baseline is a run
baseline and these corpora are recorder rows by construction. No
baseline was rolled.

## Wall numbers (scale wall, every run)

- National/table/wins: capable reaches national/global on 13/16
  seeds both legs (0.8125) and wins (won=true, endReason
  over-other, ~day 90) on 16/16 both legs; competent reaches
  national on 0/16 and wins on 0/16 both legs. No village reaches
  the table as a distinct step in either leg — the wins are the
  capable fast path.
- Wave 4–5 reach: competent maxWave 5 on 98805/98806/98807/98816
  both legs; capable wave 5 on 98802/98808/98809/98810/98811/
  98813/98814 both legs. Wave-4 kills: competent 34 → 26,
  capable 34 → 31. Wave-5 kills: competent 5 → 5, capable
  14 → 14.
- Median survival: competent 121 → 122.5d; capable 90 → 90d.
- Death causes (band totals, both policies): villager combat
  dominates; starvation 2 → 1; scholar deaths "the wild" are the
  modal player cause.

## Village assessment

The same sixteen villages, twice. The competent villages still
grind — three 150-day survivors before, two after (98806 and
98813 tipped over the edge on the after leg; 98811's village
lived 48 days longer) — but the scholar now strikes instead of
re-pressing (1595 → 1634 landed strikes, 42,780 kcal banked),
and the worst fight went from 161 presses of nothing to 2 real
ones. The capable villages still all end the same way, around
day 90, won. Nobody starves either way; nobody reaches the table
either way except through capable's fast win. The lever changes
the texture of the fights, not the shape of the runs — which is
what a waste-removal lever should do.

## Sense-testing (SENSE-TESTING LAW)

Rage lines: 130 lines against 888 presses before → 146 lines
against 175 presses after. Before, the line fires once per FRESH
press (130 lines for 130 fresh presses) and the dedup suppresses
the refresh storm — 758 refreshes produce no lines at all. After,
it fires once per fight (146 lines for 175 fresh presses — a
fight with two fresh presses yields one line, the steeple dedup).
No repeat storm in any fight after the fix. The narration reads
like a person calling on a power once, then fighting.

## Closeout adoption record (how Stage 2 finished)

- The 0330Z coordinator timed out with the before-leg at 4/32
  files (seeds 98801–98802 complete, 98803–98805 partial .tmp).
  The before-leg process was dead; the tree heartbeat was stale
  (03:49Z). The closeout coordinator heartbeated first (after a
  write-flap blocked the first 6 attempts), verified the
  worktree's abilityActions.js bytes were exactly the prereg
  base (sha256 fabd5737…), and resumed the before-leg for seeds
  98803–98816.
- A write flap ran ~05:30–06:12Z through the resumed before-leg:
  11 per-seed files failed to land (seeds 98803–98808). Two were
  recovered from the driver's @@FALLBACK stdout dumps (98807
  capable, 98808 competent — both reproduce the pilot before-leg
  numbers exactly); the other 9 were re-run after the flap
  cleared (deterministic: every re-run reproduces the pilot
  before-leg numbers exactly). Before-leg corpus: 32/32 files,
  all parse.
- The after-leg ran whole (32/32) with the fix bytes verified
  (sha256 29515be9…). The after panel build was killed by SIGTERM
  mid-run (no VM replacement — boot stayed 5fbd163b; cause
  unknown) at 15 cached cases and resumed cleanly to 32 cases.
- Analyzer: scripts/analyze-rageprecheck-b.js (new, committed
  with this evidence) — validated by reproducing the pilot
  verdict exactly (117 → 0, per-presser 62/0/55 → 0, kcal
  8880 → 2940, strikes 856 → 888) before it was run on the
  confirm corpora.

## Metric review (§14)

1. The confirm reproduces the pilot's shape at 2× the seeds,
   including the per-seed swings and the wave-4-kill dip with
   strikes rising — the dip is not a lever defect (wins and
   wave-5 kills flat), but future waste-removal arms should
   pre-register wave-kill totals as a reported secondary with an
   explicit no-effect band, so a dip like 68 → 57 is judged
   rather than narrated.
2. The fresh-only subset (98801–98810) reading 0 alongside the
   pooled 0 settles the bankkiller-overlap question the Stage 2
   prereg raised: the overlap is moot.
3. The telemetry-check refusal is structural (recorder corpora
   vs run baselines), not a gap in this arm: panel compare is
   the corroboration instrument for driver arms, and it ran.

## Evidence files

- Prereg: evidence/2026-11-14/sim-rageprecheck-b-prereg.md
- Stage 2 prereg: evidence/2026-11-14/sim-rageprecheck-b-stage2-prereg.md
- Driver: scripts/rageprecheck-driver-20261114.js
- Analyzer: scripts/analyze-rageprecheck-b.js (new)
- Proof: scripts/test-rageprecheck-b.js (12/12 static, 25/25 game)
- Per-seed JSON: evidence/2026-11-14/perseed-rageprecheck-b-confirm-before/
  (32 files) and evidence/2026-11-14/perseed-rageprecheck-b-confirm-after/
  (32 files); pilot corpora perseed-rageprecheck-b-before/after (16 each)
- Panels: evidence/2026-11-14/panel-rageprecheck-b-confirm-before/ and
  panel-rageprecheck-b-confirm-after/ (panel.json.gz, 32 cases each)
- Compare: evidence/2026-11-14/panel-rageprecheck-b-confirm-compare.md/.json
  (decision: review_required — no material signal on judged metrics)

## Commits (branch sim-rageprecheck-b)

- 7b03f1aaa prereg (+ driver copy, adapted)
- 3cbf0ea3e proof test RED (4 precheck legs failed on prereg commit)
- 82cfe281e [needs-eyes] engine precheck (B) — proof 12/12 + 25/25
- 80685ff28 pilot GO evidence (117 → 0) + corpora + panels + compare
- 64e1500e5 Stage 2 confirm prereg
- (this commit — confirm evidence + corpora + panels + compare + analyzer)

## Findings for the backlog (coordinator owns sim-findings.md)

1. (B) closes the (A) residual on 16 seeds: the engine precheck
   is the single choke point that two independent policy maps
   could not be. The (A) guard remains unlanded and is now moot
   for this waste — do not resurrect it for rage.
2. Capable wins 16/16 by ~day 90 (endReason over-other) while
   competent wins 0/16 on identical seeds — the fast capable win
   path vs the competent grind. Out of this arm's scope; worth a
   look on its own (carried from sim-rageloop-b and the pilot).
3. Seed 98809 capable carried 277 of the 756 pooled refreshes
   (max/fight 161) — a single seed can dominate a summed
   primary. Future summed-primary preregs should report the
   top-seed share alongside the total.
