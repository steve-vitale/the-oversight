# sim-winnability-round-0530 (Loop B, axis winnability chain)

**Run:** fleshout-loop-b-20261119T0530Z · **Axis:** winnability chain ·
**Base master:** cd2d685b8 · **Master at closeout:** bd6c35405 (after the
ship-loop version bump b76d65445 landed mid-run at ~05:45Z; both arm
branches rebased onto it before merging).
**Claim:** hidden_files/lever-claims/fleshout-loop-b-20261119T0530Z.json
(retired to .DEAD at closeout). **Lock:** fleshout-loop-b.lock (deleted
at closeout).

## Arm 1 — sim-ragepreempt-b: DIAG-GO, MERGED (bd6c35405)

Finding #2584 answered from the frozen rage-setup-a corpora (band
106001–106008, 150d, competent; no fresh sims, no game code).
A turn verb pre-empts the free-action Rage round in **4 of 10
observable carrier fires — rate 0.40 raw, 0.30 harmful**. Per-verb:
peacemaker_failed (Walk In — failed) 2, field_medicine 1, both
harmful; peacemaker_success 1, benign (fight ends peacefully).
Classification complete (0 unclassified, 0 anomalies); ctl control
20/20 consumed-signature, 0 pre-empted. The rage-setup-a paired
damage rate (2/2) does NOT generalise — one of its two legs (Ruby
d139) is unobservable (log cap) and the other (Sergio d95) is the only
clean pair; the free strike lands 6/10 and is lost 4/10. **Named next
step: order the free strike ahead of the verbs** (the Rage round
strikes before the verb chain is consulted). The ordering fix is the
next arm's work, not this arm's change.
Evidence: evidence/2026-11-19/sim-ragepreempt-b.md; prereg
evidence/2026-11-19/sim-ragepreempt-b-prereg.md; instrument
scripts/analyze-ragepreempt-b.js (selftest 20/20) +
scripts/test-ragepreempt-b.js (15/15), both re-run green on the
rebased tip. Finding #2584 updated in sim-findings.md (claimed +
answered). New finding filed by this arm (open): carrier Rage can
fire late, past the 20-line log cap (Ruby d139, seed 106005) — the
delay mechanism is unestablished; next arm pins it with an uncapped
recorder or a staged reproduction.

## Arm 2 — sim-senseexped-b: GO per worker evidence, UNCOMMITTED AT CLOSEOUT — ADOPTION REQUIRED

Finding #2583. Worker evidence (evidence/2026-11-19/sim-senseexped-b.md,
in the worktree, NOT yet on master): **GO — the expedition-sourced
sense returns the trio when the party set out together (arm 0.892 vs
ctl 0.191), all frozen bars pass.** Design call: option A
(expedition-sourced sense) — the launch branch in
`Game.villagerFightAllies` (src/js/party-wiring.js) reads the
fighter's current expedition companions (`agencyState().exped`
entries sharing the fighter's target) instead of mutable
`winPlan[vid].party`; companions answer in expedition-start order,
cap stays 2, same-target guard unchanged. Env-gated `SENSEEXPED=1`,
default OFF = old sense, byte-identical. Option B (hold a launched
quad's expeditions together) NOT built — lifecycle change, out of
scope. Band 104758–104765 (fresh per prereg search), 8 seeds, 150d,
competent. Balanced panel (§15): review_required, one
regression_watch (community loss 0.5 → 0.625, +0.125).
Wall (worker numbers, TO BE VERIFIED by the adoption): national 0/8
both; wave 4 8/8 both; wave 5 4/8 ctl vs 2/8 arm; standing ≥200 4/8
vs 2/8; median survival 140d arm vs 130d ctl (C2 bar ≥0.8×ctl PASS).
Worker reads the wave-5/standing dip as trajectory churn on 8 seeds;
a 12–16 seed confirm is the place to re-check it.

**Why uncommitted:** the worker was still running at closeout
(07:18Z) and did not commit despite two coordinator wrap-up notes
(~06:43Z and ~07:05Z) telling it to commit within 25 min / immediately.
**Adoption state (verified by the coordinator at 07:18Z):** branch
`sim-senseexped-b` at base cd2d685b8, no commits; worktree
~/workspace/worktrees/sim-senseexped-b registered (heartbeat fresh
~06:18Z, re-heartbeat at adoption); tree holds `M
src/js/party-wiring.js` + 15 untracked files (prereg, evidence,
panel .md/.json/.gz ×2, 4 perseed corpora arm/ctl/det-a/det-b,
analyzer, analysis.json, logs). The `M docs/ONTOLOGY.md` seen at
06:39Z is gone — the worker reverted it; confirm it stays absent.
**Adoption job:** verify the evidence + panel + prereg from the
files (do NOT take the worker's GO on trust — re-run the analyzer
selftest + proof test and spot-check the panel numbers), commit with
safe-commit.sh, rebase onto the then-current master, re-run proofs,
run the gate, merge ff-only. If the GO does not verify, land
evidence-only and mark #2583 accordingly. Do NOT lose this arm: it is
a GO build on a finding two DIAG-GO arms converged on. The claim
file for this run is retired; the adoption creates its own.

## Gate (round, on the rebased ragepreempt tip)

Full log: evidence/2026-11-19/check-quick-round-0530.log.
**335 passed, 9 failed in 1251s, 0 attributable.** The 9:
measurement-proof staleness pair + measurement-workflow neutrality
staleness (pre-existing master debt, documented in the tracker
header) + phone-frame stale receipt (pre-existing master debt) +
cache-flags 4-assertion load artifact (prior rounds solo-verified
4/4 green under no load) + five 120s timeouts (living-garden,
occupation-panels, one-person-army, trust-observer, capable-bot —
load artifacts, same signatures as prior rounds, solo-verified green
before). **Ladder-bundle control CLEARED** (no "ladder" mentions in
the gate log). The merged arm touches no game code (evidence +
analyzer + proof test only), so no gate failure can be attributed
to it; its own proofs re-ran green on the rebased tip (20/20, 15/15).

## Telemetry

Baseline NOT rolled: telemetry-check baseline file
evidence/2026-11-18/telemetry-baselines/scale-wall.json does not
exist (ENOENT, same as prior rounds). No LOUD line to investigate
from this run's corpora (the recorder-corpus refusal family is
documented; telemetry-check refuses recorder corpora by design).

## Wall numbers (this run)

| | ragepreempt corpora (rage-setup-a legs, restated) | senseexped (worker, unverified) |
|---|---|---|
| National | 0/8 both | 0/8 both |
| Table / wins | 0 | 0 |
| Wave 5 | 6/8 ctl / 5/8 arm | 4/8 ctl / 2/8 arm |
| Wave 4 | 8/8 both | 8/8 both |
| Median survival | 150d ctl / 148.5d arm | 140d arm / 130d ctl |

No village took the full seat on any leg; no village reached
national. Winnability chain stays converging (NOT converged).
Scale-onramp stays converging (NOT converged).

## Next blanks, in order

1. **Senseexped adoption** — commit, verify, gate, merge the GO
   build above (finding #2583).
2. **Order the free strike ahead of the verbs** — the ragepreempt
   next step (finding #2584); the Rage round strikes before the
   verb chain is consulted.
3. #2561 ranger-gated companion pool / #2562 range-0 holder — the
   partyform funnel after seeding.
4. Fight-ally cap (#2559) via the fightcap arm.
5. Pin the late-Rage-fire mechanism (new finding, Ruby d139) with
   an uncapped recorder or staged reproduction.

## Metric review

- No metric was re-scored. Ragepreempt judged its frozen corpora
  against its frozen prereg (DIAG-GO criteria met: pool floor,
  classification complete, Heinrich d53 test case reproduced).
  Senseexped judged its frozen prereg (GO per the worker evidence;
  the adoption re-verifies before landing).
- The gate ran long (1251s vs 557s for the 0115Z adoption gate)
  under load 21.8; the five 120s timeouts are load artifacts, not
  regressions. The coordinator merged ragepreempt after its own
  proofs re-ran green on the rebased tip and after the gate
  finished; the merge follows the body's order (merge → verify
  commits → run tests).
- Closeout note: the senseexped worker's failure to commit after
  two explicit notes is a process miss, not a verdict miss — the
  work is on disk in a registered worktree and the adoption path
  is documented above.
