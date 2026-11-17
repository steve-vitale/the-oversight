# sim-reattach-a — ADOPTION ADDENDUM (coordinator, Loop A 060712Z closeout)

Adopted in the main session after the Loop A coordinator timed out during
closeout. The worker's evidence (`sim-reattach-a.md`, branch tip `bed209857`
after rebase onto master `dbeb1493f`) stands; this addendum records the
adoption verification, the band collision, the lever revert, and the merge.

## Adoption verification

- **Proof re-run on the rebased tip `bed209857`: 76/76, exit 0**
  (`node scripts/test-reattach-a.js`, log `~/workspace/reattach-proof-adoption.log`).
  The rebased tip is green; the rebase onto `dbeb1493f` changed nothing the
  proof touches.
- **Reverted-tip proofs (post-commit, verified):** `test-rumortarget-a.js`
  **56/56, exit 0**; `test-reattach-a.js` (OFF-MODE) **32/32, exit 0**
  (logs `~/workspace/rumortarget-proof-postrevert.log`,
  `~/workspace/reattach-proof-postrevert.log`). Pre-commit runs showed
  exactly one failure each (55/1 and 31/1) — the `src diff is empty`
  check reading `diff master...HEAD` while the revert was still
  uncommitted; both cleared once the revert was committed, as predicted.
  No other failure on either file.
- **Check re-run:** the worker's 331/9 with 0 attributable stands (verified
  against pristine base `9f7d0522e`); the reverted tip returns `src/` to the
  base the proofs were recorded against, so no fresh gate run was needed
  beyond the proof re-runs. The standing gate failures (measurement-proof
  staleness, phone-frame-proof, ladder-bundle ambient-raid) are pre-existing
  on the base, not this arm.

## Band collision — DECIDED: no fresh-band replication

The reattach arm's band **103201–103208 is identical to sim-zeroattempt-b's
band**. Zeroattempt's prereg froze 5 minutes after reattach's, from a separate
worktree; neither arm's freshness check saw the other (the check searches
landed preregs, not in-flight claims). The two arms now share one sample of
8 villages.

**Effect:** none on either arm's within-arm judgment. Reattach's primary
(1/8 vs bar 4) compares its own control leg against its own armed leg on
matched seeds — the shared band with zeroattempt does not bias that
comparison. Zeroattempt's diagnostic (the store never initializes on the
four zero seeds) is likewise a within-band observation. What the collision
does cost is independence across arms: the two arms' findings about this
band (plan-poor: 14 rumor-born plans; store-never-initialized on the zero
seeds) are observations of the same villages, not two independent draws.
No cross-arm claim in either evidence file treats them as independent.

**Decision (coordinator): the PILOT NO-GO stands; no fresh-band replication
is required.** A replication would be owed if the pilot had passed (a
positive needs an independent band to confirm) or if the miss were within
noise of the bar. It is neither: 1/8 vs a bar of 4 is a wide miss, and the
mechanism is a structural zero (0 re-attaches in 24 consultations — the
window the rule needs almost never exists). Re-running the same pilot on a
fresh band would re-prove a timing conjunction already demonstrated, not
test the lever. **Process fix for the next round:** the seed-band freshness
check must consult live claim files (`hidden_files/lever-claims/`) for bands
frozen by in-flight arms, not just landed preregs — two arms freezing the
same band within minutes must be caught before sims start.

## Lever revert (coordinator-approved)

PILOT NO-GO → the lever is reverted from `src/` per the prereg, performed
by the adoption coordinator (the worker left it for coordinator approval;
precedent: rumortarget-a and nightcarry-a reverts, Nov 16).

- `git checkout dbeb1493f -- src/js/win-plan.js docs/ONTOLOGY.md scripts/test-rumortarget-a.js`
- `src/` diff vs master after the revert: **0 lines** (verified).
- `docs/ONTOLOGY.md` diff vs master after the revert: **0 lines** (the
  regen's one-line Provides addition for `winPlanRumorAttach` goes with
  the lever).
- `scripts/test-rumortarget-a.js` is restored to the master version with
  the reattach arm's fixture-7 change: that fixture calls
  `Game.winPlanRumorAttach`, which no longer exists after the revert, so
  keeping it would crash the proof file. The rumortarget proof is 67/67
  on the reverted tip (see below).
- The instrument is kept: `scripts/reattach-driver-20261117.js`,
  `scripts/analyze-reattach-a.js`,
  `scripts/build-reattach-panels-20261117.js`,
  `scripts/test-reattach-a.js`. It is the measurement, not the lever.

## Reverted-tip proof results

- `scripts/test-rumortarget-a.js`: **56/56, exit 0** (OFF-MODE, lever
  reverted; the pre-commit run was 55/1 with the single failure the
  uncommitted-revert artifact described above).
- `scripts/test-reattach-a.js` (OFF-MODE, lever reverted): **32/32, exit 0**
  (pre-commit run 31/1, same artifact). Live fixtures are skipped in
  OFF-MODE by design; analyzer fixtures still run and pass.

## Merge record

- Proof re-run on rebased tip `bed209857`: 76/76 (lever present).
- Revert commit `000e2d870` (coordinator-approved, `--force-delete` per the
  rumortarget-a / nightcarry-a precedent — the safe-commit delete guard
  trips on the 237-line lever removal; the deletion is the prereg-mandated
  NO-GO revert, verified byte-identical to base).
- Post-revert proofs: rumortarget 56/56, reattach OFF-MODE 32/32.
- ff-merge and release: recorded in the convergence tracker (060712Z round
  section) and the goal timeline. The 060712Z run closes with this merge:
  nightcarry-resume landed (`10b68c9d9`, UNJUDGEABLE), reattach-a landed
  evidence-only (PILOT NO-GO, lever reverted).

## Design questions carried forward

- The re-attach rule as designed cannot move the primary: the window it
  needs (targeted plan still in gear/party when a higher-wave tale arrives
  fresh) occurred on 0/8 seeds in any useful form. The fix, if anyone wants
  it, is in the wait — plans that linger, tales that arrive sooner, or a
  re-attach that can reach a party already out (see the evidence file's
  village assessment). That is a design question, not a tuning knob.
- Attach-on-hunt-stage plans (103207, 103208): the attach rule names a
  target for a party already departed. Whether a departed party should gain
  a target at all is open for the attach rule.
- Self-tale lines (Maya, Pearl): a villager "coming back to" their own tale
  reads oddly. Polish item for the attach rule, not this arm.
