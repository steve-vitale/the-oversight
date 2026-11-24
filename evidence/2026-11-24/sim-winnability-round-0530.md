# Loop B round 0530Z — winnability-chain (holdout completion + standing accumulation)

Run fleshout-loop-b-20261124T0530Z, Loop B, axis winnability-chain.
This run did two things: (1) closed out the dead 0230Z run (see
evidence/2026-11-24/sim-winnability-round-0230.md — rearm-witness
NO-GO merged 32168a66f, holdout left incomplete for this run's arm 1);
(2) ran its own two arms below. Master at closeout: fcc304f63.

## Arm 1 — sim-cellgate-holdout-b RESUME: DIAG (frozen verdict)

The 64-seed CELLGATE-floor deaths holdout is complete: 64/64 control,
64/64 armed, 64 pairs, single anchor 39b17ae25, gameSha 950901f3fdcc,
0 instrument errors. The 15 missing seeds ran with HEAD detached at
the prereg commit (the driver records HEAD as the anchor) after a
probe seed verified anchor/gameSha; 4 driver processes, all exit 0,
~6 min. Full-band bars (prereg §7): 1 PASS, 2 PASS, 3 PASS (50 armed
volleys), 4 PASS (45 wave-3), **5 PRIMARY PASS** (paired mean +0.77
deaths/run, 95% CI [-3.32, +4.85], n=64, median 0, worse 22 / better
18 / tied 24), **6 FAIL** (9 control volleys vs ≤6, ALL wave-4+,
w3 = 0), 7 PASS (starvation delta −6, median-survival delta +10d),
8 PASS (panel review_required, only the deaths watch, judged by bar
5), 9 delivered (seed 107724 arm story + full 64-row paired table).
Frozen verdict DIAG per the brief's rule for the bar-6 calibration
case. The deaths watch is RESOLVED — firing at wave 3 does not cost
lives on balance — and the evidence supports flipping the default
floor to 3; the flip is a coordinator/Steve call, NOT this run's.
Caveats recorded: the count landed at 9, one above the prereg's
contemplated 7–8 range (still consistent with the 2/16 rate; the bar
sits below the scaled expectation of 8/64), and the CI-upper margin
is thin (+4.85 vs the +5 bar). Instrument defect recorded: the
holdout test's mechanical `verdict` field prints GO because bar 6 is
computed but never wired into the verdict code; the frozen verdict
follows the prereg, not that field. Evidence
evidence/2026-11-24/sim-cellgate-holdout-b.md (§12 is the completion;
§§0–11 kept as the partial-band record) + prereg. Merged 97a1dcbdc
(rebased onto master, proofs green on the rebased tip).

## Arm 2 — sim-standing-gearready-b: DIAG-GO

Standing accumulation on gear-ready seeds (2130Z blank #4, 99107
pattern). 8-seed pilot, band 109301–109308 (freshness verified).
All six pre-registered DIAG-GO legs pass. The 199 stall RECURS on
current master: 6/8 seeds sit at gated 199, 311 village-days, ALL
the readiness deferral (defer5), ZERO the plenty cap. Standing is
war-only on this band: diplomacy 0 on all 8 seeds, plenty 0–120 (20
feasts; cap never bites); per-type cap ate 11 of 109306's 34 kills.
The rank step is now decomposed: national is blocked by no-polity
6/8 and never-regional 2/8, 0 UNCLASSIFIED — at most ONE link per
village, zero counting links, Haven polity size 0 on all 8 seeds,
`pendingNational` never staged, season gate open for weeks, while a
foreign polity (count 1) exists on all 6 regional seeds that Haven
never joins. That membership question (does Haven's link point at
the foreign primary?) is the named next blank. Doors open twice, the
same day readiness completes (109301 d80, 109306 d92; 50 ready days,
0 ever standing-gated). Wave 5 is FACED on both unlocked seeds (2/2;
109301 engaged 4, killed 0; 109306 engaged 3, killed 1 editor d101)
— the 99107 blank answered affirmatively, small-sample. 109301
loses both veterans 8 days after opening and collapses d126; 109306
holds (42 ready days) and survives with capped 615, still regional.
No confirm spend (triggers unmet); confirm band 109309–109324
unspent. Zero src/js. Evidence
evidence/2026-11-24/sim-standing-gearready-b.md + prereg. Merged
fcc304f63 (rebased onto master, proof 31/31 green on the rebased
tip).

## Wall numbers (this round's judged corpora)

Holdout full band: wave 5 27/64 ctl / 28/64 arm, median survival
140d / 150d, wins/national/table not instrumented by the holdout
driver (recorded as not instrumented, never faked). Standing pilot:
wins 0/8, national 0/8, table 0/8, wave-5 unlocks 2/8, wave-5 faced
2/8, median survival 122.5d, max 150 (censored). Standing-ok-but-
not-ready days 368; veterans short on nearly all.

## Telemetry deviation check

`node scripts/telemetry-check.js` refuses recorder-corpus input on
both arms' corpora (top-level anchorCommit) — no LOUD lines;
baseline NOT rolled. Wall numbers above come from the analyzers.

## Gate

`node scripts/check.js --quick` on the merged tip fcc304f63 (log
hidden_files/check-quick-0530.log): **338 passed, 6 failed in 914s,
0 attributable.** The six: measurement-proof-update + measurement-
workflow (the standing proof-staleness pair — failing since the
2026-10-29 rebuild header and on every gate since; the pair was
already failing on the 2015Z tip before any 0530Z merge, so the
rearm src/js additions did not cause it) + phone-frame-proof (receipt
stale, same standing staleness) + the known 120s-budget timeout trio
(living-garden, one-person-army, capable-bot — the same trio that
timed out in the 1730Z/2015Z gates and re-ran green standalone
there; no re-run spent here). No failure touches any 0530Z arm file.
This run merged zero src/js with live effect (holdout + standing:
zero src/js; rearm: env-gated default-OFF).

## Infrastructure

- Write flap ~05:41–05:47Z + intermittent .git refusals to ~05:46Z
  (arm-2 registration failed mid-checkout, orphan branch, recovered
  via a probe-gated retry loop, registered 05:57:15Z; the holdout
  worker did read-only prep until its probe passed 05:47:45Z).
- Machine restart ~05:29Z killed the 0230Z coordinator (recovered
  at this run's start); uptime 14 min at 05:44Z.
- Rebase stop-at-pick quirk struck once on the rearm rebase (pick in
  done+todo, tree clean, pick verified unapplied via grep + diff,
  --continue sailed through); the holdout and standing rebases were
  clean. Index clobber struck the rearm tree, the record commit, and
  both workers' commits (repaired via the ls-tree pipe, commits
  verified correct each time). Master moved four times during the
  run (88d63d9fc → d94ddaa22 → e5dd61e96 → bf7444a49 → 97a1dcbdc →
  2fa73850d → fcc304f63: journey-crisis/deepening r278 + ship bumps +
  this run's merges), zero file overlap with either arm's branch.

## State

winnability-chain stays converging (NOT converged): the CELLGATE
floor question is now JUDGED (DIAG — the deaths watch is resolved,
the flip awaits a coordinator/Steve call); the standing question is
now DECOMPOSED (the 199 stall is a readiness deferral, not a points
shortage; the rank step fails because no polity ever forms). Next
blanks in order: (1) CELLGATE floor flip decision (default floor 3 —
coordinator/Steve call on the DIAG evidence); (2) why gun-holders
who take guns never fight (downstream of the witness NO-GO); (3)
gate projection retune-vs-remove design call; (4) whether Haven's
link points at the foreign primary (the membership question from the
standing decomposition — the next standing blank); (5) standing
confirm band 109309–109324 (unspent; triggers unmet on the pilot).

Merged 32168a66f (rearm-witness NO-GO, 0230Z closeout) + bf7444a49
(0230Z record) + 97a1dcbdc (holdout DIAG) + fcc304f63 (standing
DIAG-GO); merged locally, pending ship. Claim deleted; lock deleted.
Evidence: evidence/2026-11-24/sim-winnability-round-0530.md.
