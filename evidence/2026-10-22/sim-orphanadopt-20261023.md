# Run evidence — fleshout-20261023T0120Z (axis scale-onramp) — ADOPTION RUN

Run: fleshout-20261023T0120Z (Thu 2026-10-22 20:15 CDT / 2026-10-23 01:15Z). Axis: scale-onramp (STANDING DIRECTIVE; topmost non-converged axis not in a live claim; loop B live on food-economy throughout — claim fleshout-loop-b-20261023T0104Z.json, arms sim-storageshed-b3/sim-scholardist-b, zero file overlap).

## What this run was

An adoption run. No lock at run start; no live loop-A claim (the 232307Z run completed and deleted its claim). The dead 2125Z run's 3 arms (sim-dmg-bands, sim-splitclose, sim-mantlechain — registered 21:29–21:33Z) had LIVE workers at 23:45Z (hands-off per the 2125Z.note), but at adoption showed zero file writes <60min and 3h-stale heartbeats with no live processes in their trees — workers DEAD per protocol. Trees adopted (registry run_ids rewritten to this run, heartbeats refreshed), 3 adoption workers spawned one per tree, all policy/instrument-side, zero src/js, disjoint namespaces.

Master moved 28 commits under the arms' original base (4945cf38c → f2daadf3d at spawn; more landings mid-run: mantlechain merge, dmg-bands merge, journey-endgame r41, loop-B scholardist-b). All arms rebased onto current master with proofs re-verified post-rebase per §14; no base-mixing in any corpus.

## Arms — all landed, all ff-merged

### sim-mantlechain — landed 30f93461b — DIAG NO-GO (binding bar missed; mechanism confirmed)
Mantle-promotion chain as a veteran-death accelerant (instrument-only, zero src/js). Corpus 16/16 on 4945cf38c (seeds 65471–65478 × {leadfeast,belongfeast}, 180d death-aware, armorydrive substrate). Primary 62.5% chain-accelerated vs ≥95% bar → NO-GO. But the intended contrast resolved: **8/8 in-scope veteran wave-4 deaths were AS THE MANTLE-HOLDER (0 as plain fighters)** — the CHAIR is the accelerant, the 30-day freshness window was the wrong operationalization (veterans-at-succession 3/3 dead ≤16d; fresh-scholar per-fight hazard 2.11×). Sense blank filed: succession beats are identical canned lines (4 same-day successions = the same joke 4×). Named next (NOT built): the new-scholar restraint window — filed to sim-findings.md. Proof 28/28 GREEN on merged master (re-verified by coordinator).

### sim-dmg-bands — landed 0dd0cf0ba — DIAG-NO-GO (measured-band form)
Companion damage vs wave-4 HP bands instrument (zero src/js). Proof 57/57 → 66/66 GREEN post-rebase (usage-env honored). Corpus 16/16 on f2daadf3d (seeds 65561–65568 × {leadfeast,belongfeast}, 180d death-aware, pre-seat). Verdict: **DIAG-NO-GO** — 19.8% of companion damage in canon-anchored bands {L,M,H} vs ≥95% bar (zero unattributed: GO). The miss is the finding: the canon bands describe monster DEFS (HP 850–1500), not what walks into wave-4 fights — **96/146 encounters (66%) were overtime reruns** with pools 2–3× the anchor. Base-band form (rerun scaling removed via rerunTier): 89.3%. The base-band targeting table is delivered for the fight-level arm. Sense PASS. Wall (this corpus): national 3/16, table 11/16 (invitation — none seated), won 0/16, wave4 12/16, wave5 0/16, medianSurv 134–137d, maxSurv 181d — **first measured national reach on the pre-seat substrate** (s65562 both policies d179–181).

### sim-splitclose — landed f5a51a496 — NO-GO at pilot (binding primary missed; drift check changes the read)
Scholar-softens/companion-closes discipline on the wave-4 TB staged channel (policy-side, SPLITCLOSE=1, zero src/js; the wave4engage-r2 + compdamage named next). Proof 35/35 GREEN on master per exact Usage env. Corpus: full 32-config pilot RE-RUN on current master (seeds 65611–65618 × {leadfeast,belongfeast} × {control,splitclose}, 180d death-aware, armorydrive substrate); stale-base JSONs preserved at perseed-splitclose/base-4945cf38c/ as drift reference.
- PRIMARY (binding): armed 8 vs control 10 kill-time villager wave-4 kills (bar = control+2 = 12) — **missed**; reach leg 4/8 ≥ 2/8 met. → NO-GO, never re-scored.
- GUARDRAILS: ALL PASS (scholar-mortality +0.75/100d ≤+2; median survival diff 0 ≥ −10d; starvation 9 vs 12; no new death modes; laundered kills 0/0; wave-4 unlocks 14/16 both arms).
- §15 panel: review_required (no GO signal; pre-reg header was the judge).
- **DRIFT CHECK**: analyzer re-run unmodified against the old-base corpus → old base would have been GO (armed 4 vs control 2). **Control's own baseline moved 2→10 kills on identical seeds across the 28 commits to master** — the discipline's effect is not substrate-robust on the control-relative leg. Metric-review proposal: damage-majority as binding primary next run (secondary preserved direction 2v0 old → 5v2 new; mechanism fired more on the new base: softens 213→387, holds 32→59).
- **OVERTIME QUANTIFIED** (new instrument measure-overtime-splitclose-20261022.js): 119/199 wave-4 fights (59.8%) at tier≥1; 63 fights (31.7%) at tiers 5–6 (HP ×3.05–3.81). The veterans bar is chased against inflating targets — filed to sim-findings.md.
- Sense PASS (fight-end transcript extractor): holds voiced ("You hold still, watching."), companions trade named blows, react to wounds/telegraphs ("Move! MOVE!"). Small blank: no distinct finishing-beat beyond "X falls."
- Wall (per arm, n=16 each, 180d death-aware): control — national 5, table 11, wins 0, wave4 14/16, **wave5 4/16**, medSurv 143, maxSurv 181; splitclose — national 5, table 11, wins 0, wave4 14/16, wave5 2/16, medSurv 138, maxSurv 181. Zero wins both arms — the scale wall stands, but the wave-5 door opened on the armorydrive substrate (control 4/16).

## Metric review (§14)

- mantlechain: the ≥95% bar shape was right; the 30d window was the wrong operationalization. Next run: primary = share of in-scope veteran wave-4 deaths as mantle-holder at ANY succession age (this run: 8/8 = 100%); secondary = freshness gradient per-fight hazard.
- dmg-bands: the canon-anchored measured-band form is the wrong instrument on overtime substrates — base-band form (rerunTier-adjusted) is the honest metric (89.3% this corpus). The instrument's pre-reg already reported both.
- splitclose: control-relative bars are substrate-fragile when the substrate itself is moving (2→10 on identical seeds in 28 commits). Next run: damage-majority as binding primary; re-baseline the control on the run's own master before judging.

## Telemetry deviation check

1 LOUD line (wins 16→0, n=32, splitclose corpus) = REGIME artifact (winseat full-stack baseline vs deliberate SEATDRIVE=0 corpus — wins structurally 0 per finding #714; killed/NO-GO arms = zero game-code change). Baseline NOT rolled.

## Convergence

scale-onramp stays **converging** (NOT converged). This run moved the axis on three fronts without a lever landing: (1) the mantle-succession chain is now an attributed mechanism (chair-as-accelerant, 8/8) with a named build (restraint window); (2) the wave-4 band instrument exposed overtime reruns as the dominant substrate distortion (66% of encounters, 59.8% of fights tier≥1) — the veterans bar is chased against inflating HP pools; (3) the splitclose drift check proves policy effects must be re-baselined per master — the door opened on control (wave5 4/16) while the discipline's credit-shift couldn't beat a moving control. Directive lift remains a Steve call.

## Infra

- safe-commit.sh index-clobber struck again (splitclose worker — 80 files staged-as-deleted post-commit; repaired via update-index --add --cacheinfo, verified empty status + empty diff HEAD + blob hashes). 3rd sighting this run.
- First splitclose merge attempt failed with an untracked-file refusal ("remove the file manually to continue") while racing an in-flight write; retry succeeded clean (ff-only, no conflicts).
- Registry clean at closeout; main tree clean. No push, no bump, no live verification — pending the ship loop.
