# sim-homext-abl-b — homeward-extension ablation (NO-GO for the extension, DIAG: the outward guard is the working part)

Run: oversight-flesh-out-loop-b, arm sim-homext-abl-b (Loop B,
food-economy tracker blank 1 from run
fleshout-loop-b-20261102T1030Z). Worktree sim-homext-abl-b,
branch sim-homext-abl-b.
Prereg: evidence/2026-11-02/sim-homext-abl-b-prereg.md (committed
b36fd96bf BEFORE any judged sim). Build: 9397d285a (outward-only
variant + 3-leg driver + analyzer + proof + panel registry line).
Proof: scripts/test-homext-abl-b.js PASS 21 checks, census
agreement 100% (see below).
Convergence state: the extension's contribution is now measured,
not open — the extension adds nothing on this band (see verdict).

## What was built (policy-side ONLY, the one change)

scripts/policies/competent-homewardstep-outwardonly-b.js: the full
guard's code (commit 300ab0b44) with THE ONE CHANGE — a homeward
hop is never vetoed. Homeward hops are still evaluated with the
same lateral-escape-aware E(D) and logged (with
outwardOnlyPass=true when E fails but the hop passes through);
they always pass through to the real travelTo. Outward hops are
evaluated and vetoed EXACTLY as the full guard vetoes them
(same E(D), same shared roadwork credit, same veto memory for
outward destinations; veto memory is never written for a
passed-through homeward hop). Zero src/js, zero competent.js
edits, zero edits to competent-homewardstep-b.js, zero
policy-default flips. The panel registry gains one additive
line for the new policy (same pattern as the predecessor's).
Driver scripts/homext-abl-b-driver.js is the rpt-b driver with
the POLICY set extended to the third leg (baseline 'competent'
still runs under the SHADOW guard, as in the rpt run).
Analyzer scripts/analyze-homext-abl-b.js judges three legs on
identical seeds.

## Census (proof, not judged evidence)

scripts/test-homext-abl-b.js: PASS 21 checks. Synthetic battery:
the outward-only variant NEVER vetoes a homeward hop, even into
a no-escape destination (scholar proceeds, orig travelTo
called, zero vetoes counted, zero lines spoken, hop logged
with outwardOnlyPass=true, pass-through counter 1, repeat
still passes); its OUTWARD veto decisions match the full
guard's exactly on every battery hop (pocket, clean, creek);
veto memory for outward destinations works (first says,
second silent, both vetoed); homeward hops to haven and to
escapable ground pass untouched under both variants; the
parity case that proves the ablation contrast exists: the
homeward pocket hop (0,2)->(1,2) is vetoed by the full guard
and passed by the outward-only variant. Live-engine census:
hop cases 3, walk cases 2, false opens 0, false closes 0 —
no-credit core agreement 100% with the real walkTo/travelTo.

## Judged legs (band 62801-62808, 30d, all three legs fresh, identical seeds, DEPOSITGATE=0)

Baseline leg reproduces the 1030Z pilot's baseline exactly
(away 26, per-seed haul 204.2 / 181.7 / 0 / 211.1 / 414.8 /
268.3 / 214.5 / 120.2). The fresh FULL leg reproduces the
1030Z armed file exactly, veto for veto (95 vetoes, 85
silent, 10 spoken, 0 homeward, credit uses 2, lateral passes
28, per-seed veto counts identical). Correction to the
predecessor's prose, file-verified: the 1030Z report says
"96 (85 silent, 11 spoken)"; the file itself — both the rpt
armed file and this run's fresh full leg — says 95 (85
silent + 10 spoken). Spoken veto lines in this run: 10, on
seeds 62801 (2), 62802 (1), 62804 (3), 62807 (2), 62808 (2),
identical on the full and outward-only legs. The 1-off is a
prose miscount in the predecessor report, not a trajectory
difference: every other number matches.

| Bar (full vs outward-only) | Outward-only | Full | Verdict |
|---|---|---|---|
| PRIMARY extension-only preventions (>= 1) | — | 0 | FAIL -> NO-GO |
| prevented (full / outward-only, vs baseline) | 3 | 3 | same |
| B1 away day-ends (full <= outward-only) | 3 | 3 | PASS (tie) |
| B2 new-or-worsened (= 0) | — | none | PASS |
| B4 failed-trip share (full <= outward-only) | 0.508 | 0.508 | PASS (tie) |
| B5 per-seed haul floor (every seed >= 1.00x outward-only) | — | worst ratio 1.00x (62803 0/0 null excluded) | PASS (tie) |
| B6 median survival (full >= outward-only; starv seeds <= outward+2) | 30d, 0 starv | 30d, 0 starv | PASS (tie) |
| Veto-created pockets (= 0) | — | 0 | PASS |
| Outward-only homeward vetoes (must be 0) | 0 | — | OK |
| Full homeward vetoes | — | 0 | — |
| Outward-only pass-throughs (E-failed homeward hops passed) | 0 | — | — |
| False opens (full) | — | 0 | — |

Per-seed (away/episodes, haul, homeward vetoes, vetoes):
62801 1/0 -> 1/0 -> 1/0, haul 204.2 identical, homeV 0/0,
vetoes 2/2; 62802 0/0 -> 0/0 -> 0/0, 181.7 identical, homeV
0/0, vetoes 2/2; 62803 0/0 -> 0/0 -> 0/0, haul 0 both, homeV
0/0, vetoes 0/0; 62804 6/1 -> 2/0 -> 2/0, haul 211.1 -> 230.8
-> 230.8, homeV 0/0, vetoes 3/3; 62805 0/0 -> 0/0 -> 0/0,
414.8 identical, homeV 0/0, vetoes 0/0; 62806 0/0 -> 0/0 ->
0/0, 268.3 identical, homeV 0/0, vetoes 0/0; 62807 3/1 -> 0/0
-> 0/0, haul 214.5 -> 409.2 -> 409.2, homeV 0/0, vetoes
20/20; 62808 16/2 -> 0/0 -> 0/0, haul 120.2 -> 362.0 ->
362.0, homeV 0/0, vetoes 68/68. (Order per seed: baseline
-> outward-only -> full.)
Band totals: baseline away 26, episodes 4 (3 homeward);
outward-only away 3, episodes 0; full away 3, episodes 0.
Prevented: full 3 (62804, 62807, 62808), outward-only 3
(same seeds) — so extension-only = 0 on every seed.

### Trajectory identity (the result, not just a check)

Full-vs-outward-only trajectories are IDENTICAL on all 8
seeds: per-day day-end position, kcal, hydration, and veto
counters match, daysAlive and endReason match, and the
sayLines transcripts are identical on every seed. This is
exactly what the prereg predicted if the extension never
fires: with full homeward vetoes = 0 and outward-only
pass-throughs = 0, the two legs' veto decisions coincide on
every hop, so no scholar ever walks a different step. The
ablation therefore does not merely fail to find an
extension effect — it shows there was no room for one on
this band: no armed scholar ever attempted a homeward step
into no-escape ground, under either leg, so the extension
had nothing to veto and nothing to pass through. The
outward guard diverted all three baseline episodes before
any homeward entry step, exactly as the 1030Z trace showed.

### Deaths and survival (driver substrate, with the succession caveat)

Median survival 30d on all three legs; villages survive to
day 30 on all 8 seeds on all three legs (driver endReason
survived). No strand-linked death differs between full and
outward-only (B2 pass). Player-death accounting differs by
substrate and succession as in the 1030Z report, so no
"lives saved" claim is made.

### False closes: v2 vindicated a third time

Attempt-based proxy v1 fires the same 4 times on both armed
legs (62801 day 29: (4,4)->(4,1) and (4,4)->(5,2); 62802 day
8: (4,0)->(2,0) twice) — the known 62001 artifact class.
Arrival-conditioned proxy v2 fires 0 times on both legs.
The traces already proved v2 right on these hops in the
1030Z report; this run adds that the artifact is
leg-independent (it appears identically with and without
the homeward extension, as expected for outward vetoes).

### Sense-testing (transcripts, not just counts)

- The veto lines are identical on both armed legs — all 10
  spoken lines, same seeds and days — because the extension
  never speaks: it never fires. There is no homeward-veto
  voice to judge on this band; the only voice is the
  outward guard's "You don't walk there — you couldn't get
  home from there," which reads true where it speaks.
- The 62808 silent-refusal pattern persists identically on
  both legs (68 vetoes, 66 silent, same step tried daily):
  it belongs to the outward guard and competent's daily
  re-pick, not to the extension — the ablation confirms
  the 1030Z attribution. The "reminder after long silence"
  design question from the 1030Z metric review is
  therefore about the outward guard's narration, not the
  extension's.
- The baseline stranded villages read as in the 1030Z
  report (six days on a north edge tile, three days on the
  far eastern rim, eight days on a northern tile to a
  dehydration death); under either armed leg none of those
  camps ever forms. Nothing new and nothing robotic appears
  from the extension, because the extension does nothing
  here — which is itself the finding.

## Balanced panel (§15, context never verdict)

Combined campaign: `node scripts/balance-panel.js --out
/tmp/homext-abl-b-panel --policies
competent,competent-homewardstep-outwardonly-b,competent-homewardstep-b
--seeds 62801,...,62808 --days 30 --par 4` — 24 cases, 0
reused, sourcesStable true, neutrality matched on all
three policies (proof seed 62801, 0 warnings). Per-policy
panel rows: survived 8/8 on all three legs; won / national
/ table / entered 0 on all three; wave reach 2 on 7/8 on all
three (62806 wave 1); maxArc 3 on all three except baseline
62808 arc 2 -> armed arc 3 (both armed legs); vests baseline
62804 1 -> armed 0 (both armed legs). Raw panel archived
as evidence/2026-11-02/sim-homext-abl-b-panel.json.gz.
Notably, the outward-only and full panel rows are
IDENTICAL on every quoted field, including per-seed
gameDays — the panel substrate independently corroborates
the driver trajectory identity. The compare of the two
single-policy panels (outward-only before, full after)
returns decision INVALID — "Unmatched policies / Unmatched
cases" — and is attached as-is
(evidence/2026-11-02/sim-homext-abl-b-panel-compare.md),
not overridden: the same structural refusal class as the
1030Z split-panel compare (the comparator matches
campaigns with the same policy set across two roots, while
a policy-side arm splits its policies across the two
panels). No panel verdict is claimed: per §15 the panel is
the instrument, the preregistered threshold is the judge,
and the judged verdict above comes from the driver/
analyzer, not the panel.

## Wall numbers (in-window only, never pooled across arms)

Judged window (30d, panel substrate): national / table /
wins 0 on all three legs (expected measurement profile in
a 30-day pre-seat window, not a regression); median
survival 30d on all three legs (driver) / survived 8/8
(panel); panel wave reach 2 on 7/8 all legs; full seat 0 /
wave 5 reached 0 unchanged. No wall movement is shown or
claimed: this ablation measures the extension's marginal
prevention, not the scale wall. The outward guard's wall
profile is unchanged from the 1030Z pilot (it is the same
guard, reproduced exactly).

## Village assessment (plain words)

On the three seeds where trouble actually showed up, the
baseline village kept a scholar camped for days on ground
it could walk to but not walk home from, and the outward
guard turned it back at the approach — at the last step
before the trap on one seed, at the first step out of
haven on another — so it came home fed instead. Take the
homeward half of the guard away entirely and nothing
changes: not one step, not one meal, not one spoken line,
not one death. The scholar that used to sit on a far patch
for two weeks now works the ground near home instead, and
it does so for exactly the same reason with or without the
homeward eyes — because it was never allowed to walk out
to the trap in the first place. The homeward half is not
shown to be wrong; it is shown to be idle on the only band
where pockets actually occur in 48 screened seeds. The
guard works as a fence around the far ground; whether its
homeward half would work as a fence around the way back,
on a trip that actually gets that far, is still unproven —
and this run says the next test must manufacture or find
such a trip, because natural bands keep answering the
outward question instead.

## Verdict: NO-GO for the homeward extension (DIAG: the outward guard is the working part)

- PRIMARY FAILS: extension-only preventions 0 < 1. The
  full guard prevents 3 and the outward-only guard
  prevents the same 3; the extension prevents 0 that the
  outward guard does not.
- All no-harm bars PASS, but as exact ties (ratios 1.00x,
  shares equal, medians equal) — the extension costs
  nothing here precisely because it does nothing here.
  A tie is not a harm pass with content; it is the same
  identity result restated.
- This NO-GO is for the EXTENSION on this band, not for
  the full guard: the 1030Z GO for the full guard stands
  (reproduced veto-for-veto in this run). Landing the full
  guard remains supported; claiming the homeward extension
  adds prevention is not supported by any judged evidence.
  The extension's only firing evidence remains the
  unjudged 61807 diagnostic (2 homeward vetoes, episode
  1 -> 0), which this run deliberately did not re-judge.
- No confirm spend in this run (prereg): a pilot NO-GO
  goes to the coordinator with the isolation question
  below, not to a confirm.

## Metric review (for the NEXT run, never a re-score)

- The ablation answers the 1030Z open question on the
  natural substrate, and the answer is structural: on
  natural bands the outward guard diverts trips before
  the homeward step is ever attempted under guard, so
  further natural-band ablations will keep returning 0.
  The next prereg for the extension needs a substrate
  where a homeward step into no-escape ground is
  actually attempted under the armed policy — e.g. a
  band screened for armed-policy homeward attempts (not
  baseline episodes), or a constructed trip that walks
  out through escapable ground and only then faces a
  homeward trap (the 61807 shape, but as a judged band
  rule, not a single-seed diagnostic). Without that, the
  extension is unmeasurable on natural bands, and the
  honest statement is "unproven," not "disproven" — this
  run proves zero marginal prevention HERE, not zero
  prevention everywhere.
- The B5 1.00x-vs-outward-only floor behaved as designed
  (it would have caught any homeward-veto haul cost), but
  on an identity result it cannot distinguish "no cost"
  from "no exposure." Future ablations on a firing band
  should keep it: that is where it binds.
- The 1030Z prose veto total (96) is corrected to 95 by
  file count (85 silent + 10 spoken); future reports
  should quote veto totals from the analyzer's counted
  output, not from hand-summed prose.
- The false-close v1 artifact fires identically on both
  armed legs, confirming it is an outward-veto artifact
  class, not extension-related. v2 remains the quoted
  cost signal.
- Screening yield note (carried): homeward-hop pockets
  are rare on the natural substrate (~1 episode per 12
  seeds across the 1030Z screening); the extension's
  firing rate under guard appears rarer still (0 in 8
  armed seeds here, 0 in 8 in the 1030Z pilot, 0 in the
  predecessor's band). A firing-band search budget should
  assume a substantially lower hit rate than the
  baseline-episode rate.

## Corpora

- evidence/2026-11-02/sim-homext-abl-b-prereg.md
- evidence/2026-11-02/sim-homext-abl-b.md (this file)
- evidence/2026-11-02/sim-homext-abl-b-{baseline,outwardonly,full}.jsonl (+ .log)
- evidence/2026-11-02/sim-homext-abl-b-analyze.txt (analyzer output, VERDICT: NO-GO)
- evidence/2026-11-02/sim-homext-abl-b-panel.json.gz
- evidence/2026-11-02/sim-homext-abl-b-panel-compare.md (+ .json)
  (comparator INVALID on policy-split panels, attached as-is —
  see panel section)
