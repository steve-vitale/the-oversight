# Loop A lever round fleshout-20261121T0315Z — round record

**Run:** fleshout-20261121T0315Z (Loop A, axis scale-onramp). Base master `b7c8eff2c`
(journey-crisis r261); closeout master `8574ced4c`. Both arms adjudicated, both
merged to master, lock + claim deleted. No push, no version bump — merged
locally, pending ship.

**Claim:** `hidden_files/lever-claims/fleshout-20261121T0315Z.json` (retired to
`.DEAD` at closeout). Axis scale-onramp, from the tracker latest review
(0015Z round, commit `f9ed3a851`): next blanks (1) #2590 the roll wall, then
evade-on-a-quivered-bow; (2) #2628/#2631 HOLDER SUPPLY. Sibling Loop B live
all run on winnability chain (claim `fleshout-loop-b-20261121T0230Z`,
pinquaddoor-reprereg-b + reseedbeat-b) — NOT touched; #2626/#2632 owned by B.
#2605 launch engine BLOCKED — held branches `sim-pinquaddoor-b` +
`sim-reseedexpiry-b` hold `src/js/villager-brain.js` + `win-plan.js`; not started.

**Coordinator correction, recorded:** the holdersupply brief's premise — that
GUNRATE=1 + CELLGATE=1 had never been measured together — was WRONG. The
worker verified from the evidence that the combination was already measured
three times (cellgate-a arm leg 107051–107058; lendfix-a both legs
107081–107088; lendpool-a diag 107111–107118) and ran the named alternative
instead, with reasons in the frozen prereg. The brief's fallback instruction
worked as designed.

## Arm 1 — sim-rollwall-a: DIAG-GO (merged `5927db0bf`)

**Commits:** prereg `d30992a54`, instrument+substrate `63dc9fb59`, evidence
`b3f8095f4`, substrate revert `5927db0bf` (rebased onto `36d694f13` by the
coordinator after master moved; game.js byte-identical to master at every
step). Instrument + evidence only, 0 src/js delta vs master.

**Question (#2590, roll half):** fiberfetch-a found all 6 served departures
that left with 0 ammo failed their 60% departure arrow-craft with fiber
plentiful (6/6 at 60% is p≈0.004). **Answer, measured on fresh band
107121–107128 (150d, competent, SPEARGATE+BOWOPEN+SENSEEXPED+DEPMAT+ROLL35+AMMO
substrate): the roll is calibrated; the 6/6 was selection, not a defect.**
Classification 9/9 served 0-ammo departures (roll-fail 6, no-mats 3, timing 0,
no-ammo-id 0, no-ranged 0, no-attempt 0, no-recipe 0). Calibration over 56
attempts: 0.35 → 3/16, 0.60 → 6/12, 0.85 → 22/28 — every CI contains its stated
rate; pooled with fiberfetch + ammo bands (176 attempts): 0.351 / 0.619 /
0.814. The 6 failures were the failure subset of 20 served-rate attempts on
the fiberfetch band; here 12 served-rate attempts split 6 ok / 6 fail, and the
6 failures *are* the 6 served 0-ammo departures by construction. No served
departure left empty because the bow never seated, pocketAmmo never ran, or
there was no ranged weapon. Per frozen prereg §5, **no lever built** — the
dominant class is roll-fail at a calibrated rate, a close-DIAG outcome, not a
fix. Raising the served rate would be a balance call, not a defect fix.
Proof at substrate anchor: test-rollwall-a 46/46, depmat 43/43, roll35 41/41,
ammo 52/52, analyzer selftest 18/18; seed 107121 re-run byte-identical
(determinism proven). Sense-test: home craft narrated honestly both ways (125
"made 5 Arrow" vs 107 "came apart in their hands"). Instrument gaps in
evidence §7: dawn census misses days 1 and 3 on all 8 seeds
(harness-cadence artifact); no-mats detail string names only fiber (Devon's
day-3 shortfall was stick+stone, visible only in `recipeMats`).

**Finding #2590:** roll half CLOSED. Serve half stays open on the evade half.
Next lever, in the fiberfetch §8 order: **evade-on-a-quivered-bow**.
Evidence: `evidence/2026-11-21/sim-rollwall-a.md`.

## Arm 2 — sim-holdersupply-a: NO-GO PARTICIPATION (merged `8574ced4c`)

**Commits:** prereg `41bbd7787`, lever+instrument `7cad95b1f`, driver fix
`b4ad776d7`, evidence `e9acd2329`, hash-update `8574ced4c` (rebased onto
`36d694f13` by the worker, then onto `5927db0bf` by the coordinator after the
rollwall merge; proofs re-run on the rebased tip: test-holdersupply-a 24/26 —
the 2 failures are the 6-cell count assertions, failing by design on the
reverted tree — analyzer selftest 88/88). Instrument + evidence only, 0 src/js
delta vs master; BIGBUNDLE reverted, `src/js/contests.js` hash-identical to
base (`302d0d61…`), 0 BIGBUNDLE refs in `src/`.

**Question (#2628/#2631):** HOLDER SUPPLY — put a searcaster + cells into a
living villager's hands before wave 4. The combination was already measured
(see coordinator correction above), so the arm ran the named alternative:
**BIGBUNDLE — 6 fusion cells per searcaster grant (3 volleys) instead of 2**,
same redirected recipient, substrate GUNRATE+CELLGATE on both legs, LEND off.
Fresh band 107131–107138 (verified fresh), 150d, competent, 16/16 seeds.

**Verdict (frozen bars, `analyze-holdersupply-a.js`):** holder-days 164 (bar
≥ 40 PASS); armed entries 4 (bar ≥ 3 PASS); armed volleys **0** (bar ≥ 2
FAIL); pool presence **12.3%** (16/130; bar ≥ 25% FAIL; ctl 13.2%, lendpool
baseline 7.8%); guardrail PASS (deaths/engaged 3.91 vs 4.03, medians 150d/150d);
starvation 4 vs 4 PASS. The bundle landed in inventories (max cells held 7 vs
4; cell-days 164/164, zeroDays 0) but changed nothing measurable: the four
armed entries are the SAME four fights on both legs (party cells 2→6, same
leads, same flees), and the volley is lead-only while **no holder ever led a
wave-4+ fight on either leg** (armedLeads 0). The prereg's falsifier fired:
presence is confirmed binding, and within presence the binding constraint is
**leadership, not ammo depth**. Lendable moments 0 on both legs; `v4lends` 0.
Panel compare `review_required` is the retired raw-deaths metric (+2); the
frozen guardrail passes — recorded as a watch item, not a re-score. Sense-test:
Fatima charges in with a loaded 6-cell searcaster (107133 day 82) and never
fires it — the gun is invisible in the fiction when its holder isn't the lead.
`check.js --quick` post-revert: 339 passed, 5 failed in 849s — the same 5
stale-proof/timeout failures as gunrate's base record, none attributable here.

**Finding #2628 stays OPEN** (bundle killed; pool presence 12.3%). **Finding
#2599:** the supply line is now complete three times over — the gun arrives
(gunrate), the cells survive (cellgate), the ammo lasts (bigbundle) — and the
binding constraint has moved to leadership. **Next lever named: LEAD-SIDE** —
(1) lead-weighted redirect: a `wave4Lead` term in `_gunRateFighter` so the gun
goes to villagers who already lead wave-4+ fights (bars: armed leads ≥ 2,
volleys ≥ 1); (2) draft the armed holder as lead at wave-4+ launches (bigger
design call, after shape 1). NOT next: bigger bundle, higher gun rate, wider
gate — all killed by measurement. Evidence:
`evidence/2026-11-21/sim-holdersupply-a.md` (+ panel compare
`holdersupply-a-panel.md`).

**Gun-vanish sink, recurring (new backlog item):** arm leg 2 vanishes vs ctl 0
(seed 107138: gun granted day 72, holder died day 94; ctl re-grants to a new
holder day 105, arm `vanish`es day 94, reappears with the scholar day 109,
vanishes again day 116). Same death produces holder-died + re-grant on one leg
and vanish on the other. The sink is still unrecorded (gift / trade / theft /
drop / corpse-take); the next arm that counts guns should instrument transfers.
Appended to `sim-findings.md` as a new open item by this round.

## Wall numbers (this round's judged corpora, 24 configs)

Wins 0/24, national 0/24, table 0/24. Wave 4 reached 24/24. Wave 5: rollwall
5/8, holdersupply 5/16 (ctl 2/8, arm 3/8) — 10/24 pooled. Median survival 150d
on every leg. Most villages sit pinned at standing 199 — the wave-4 floor —
for the whole back half: they survive, they fight, they do not climb.

## Telemetry deviation check

`node scripts/telemetry-check.js` on the holdersupply arm + ctl corpora and
the rollwall diag corpus: designed recorder-corpus refusal on all three
("all rows carry top-level anchorCommit... compared with sweep-compare tables,
never against a run baseline"). No LOUD lines; baseline NOT rolled.

## Infrastructure

- VM restart ~03:21Z during setup killed the first registration attempt
  silently (no worktree/branch/registry entry survived); re-registered clean
  after writes probed OK. Master moved twice under the run (r261 `b7c8eff2c`
  → r248 `36d694f13`, evidence+scripts + `src/js/bond-initiation.js`, zero
  overlap with either arm); both branches rebased clean, proofs re-run on the
  rebased tips.
- `safe-commit.sh --force-delete` flag-order trap: the usage comment shows the
  flag after the message, but the script parses it as `$1` (before the
  message). The worker's first revert attempt silently took the flag as a path
  and refused again; the coordinator's corrected invocation
  (`safe-commit.sh --force-delete "msg" -- <path>`) committed the revert
  `49f292905`. The revert itself was verified exact-inverse by hash before
  approval (worktree file hash `97956402…` == base blob; the worker's "staged"
  claim was wrong — the file was unstaged after a clobber repair, index held
  the substrate blob; verified and committed from the worktree file).
- Safe-commit index clobber struck the revert commit (status `MM` after a
  correct commit); repaired via the `ls-tree -r` + `update-index --add
  --index-info` pipe, hashes verified, status clean.
- Loop B live throughout (0230Z claim; commits on both B branches during this
  run), untouched. No EPERM flap this run after the restart; writes probed OK
  at setup and at closeout.
- `check.js --quick` NOT re-run by the coordinator: zero src/js delta on the
  merged tip; arm proofs re-run green on each rebased tip is the bar met (per
  the 1830Z/2015Z precedent). Holdersupply's post-revert `--quick` (339/5)
  stands as the merged-tip record.

## Next blanks, in order

1. **#2628/#2599 — LEAD-SIDE** (holdersupply's named next lever): lead-weighted
   redirect first (`wave4Lead` term in `_gunRateFighter`), then draft-armed-
   holder-as-lead. The supply question is closed; the leadership question is
   the wall now.
2. **#2590 — evade-on-a-quivered-bow** (rollwall's named next lever; the roll
   half is closed).
3. **Gun-vanish sink** — instrument gun transfers (gift / trade / theft / drop
   / corpse-take) on the next arm that counts guns; the sink recurred on this
   round's arm leg (2 vanishes vs 0 ctl).
4. **#2605 — launch engine** still BLOCKED while the held branches hold
   `villager-brain.js` + `win-plan.js`; do not start it. **#2626/#2632** owned
   by Loop B this round — not touched.

scale-onramp stays converging (NOT converged): the roll is proven calibrated
and the supply line is proven complete three times over, but no village
reaches national, no seat is taken, and no armed holder ever leads a wave-4+
fight. The directive stands until the tracker records this axis converged on
measured evidence.
