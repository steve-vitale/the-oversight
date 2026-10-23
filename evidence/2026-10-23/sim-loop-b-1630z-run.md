# Loop B run note — fleshout-loop-b-20261023T1630Z (COMPLETE, axis food-economy — ADOPTION RUN)

ADOPTION RUN: the dead run fleshout-loop-b-20261023T1430Z (itself an adopter of the dead
1130Z run) completed BOTH of its DIAG arms and committed them on the arm branches, then its
coordinator died before landing. Stale-lock recovery at start: deleted the 1430Z lock
(created 14:33:21Z, 118min > 90min fallback). Both arm trees showed workers dead per protocol
(heartbeats 57/63min stale, zero file writes <15min, no live processes; the transient pgrep
hit 23533 was gone). Registry run_ids rewritten + heartbeats refreshed. Claim written before
any work; axis = next non-converged axis down from sibling loop A's live claim
(fleshout-20261023T1515Z.json: scale-onramp; arms sim-vetretention-restage / sim-links-diag /
sim-vetstack) = food-economy. Loop A landed mid-run (sim-links-diag a7c584de4, sim-vetstack
c38c5c0b3) — zero file overlap by design (both B arms instrument/evidence-only, zero src/js).

Master moved 3x mid-run: A's vetstack+links landings (c38c5c0b3), the main agent's
succession-meal-trust fix (c8d7c787d, food-economy game code), journey-endgame r43
(25ba0f54a, table.js voicing-only). Both arms rebased in-worktree (never in the main tree)
onto each base as it moved; full proofs re-verified ALL GREEN on c8d7c787d (the substantive
food-economy base change — depinteraction 514s, easingchannels 499s); on the final
25ba0f54a delta (voicing-only) the hook fixtures re-verified green (test-plentydepri-b.js
28/28, test-depositgate-b.js ALL GREEN, ~3s each) and the easingchannels instrument proof
re-ran green. ff-only merges on the final base. depinteraction: 85f37fbf2 (ff-only). easingchannels: d5b0d4092 + d3a0bb82d (ff-only).

## Arm sim-depinteraction-b: DIAG-NO-GO (report-only)
Landed 85f37fbf2 (ff-only).

The question: sim-plentydepri-confirm-b's belongfeast reversal (rot/100d 1.594x with
DEPOSITGATE=ON) vs the pilot's GO — the PLENTYDEPRI x DEPOSITGATE interaction, decomposed
kcal-by-kcal on a PDxDG 2x2 factorial x {leadfeast,belongfeast} x 16 FRESH seeds 9250-9265
= 128 configs, 100d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0. DIAG verdict: NO-GO, 4 FAIL /
0 UNEXPLAINED (analyzer exit 1, report-only — both levers already on master, never a
self-revert). DIAG-GO bars: (i) DG=0 legs reproduce the pilot GO — PASS both feast-sides
(leadfeast 0.647x, belongfeast 0.523x <= 0.80). (ii) Interaction term NAMED, SIGNED,
mechanism-attributed: leadfeast -0.147, belongfeast -0.433 in log-ratio space — DEPOSITGATE
AMPLIFIES PLENTYDEPRI, opposite the pre-registered hypothesis. The stand-down is real at the
engagement-ledger level (PD steals DG's plentiful days, DG steals PD's) but acts on
engagement, not rot — rot is dominated by a single channel, the funnel.share glut
(PD-delta channel deltas -965k...-2361k funnelShare, others +-20-127k; glutChannels partition
conserved on all 128 runs). THE CONFIRM'S REVERSAL DID NOT REPRODUCE: on fresh seeds the dg1
leg is 0.558x lead / 0.339x belong — GO with margin; the reversal was seed noise on a
chaos-dominated substrate. (iii) Guardrails: (a) paired survival PASS all (0/0/0/-4.5d);
(b) FAIL 3/4 cells (exposure-normalized starvation +5/+2/+9 over ~13k village-days);
(c) no new death modes PASS; (d) FAIL belongfeast dg1 national (6 vs 11, bar >=9);
(e) pantry freshDays PASS all; ENGAGEMENT 64/64 PASS. Kill discipline: the guardrail misses are the
mechanism's real cost (the throttles cut the glut, and the glut was also the BUFFER) —
not a broken lever; both levers stay on master. Sense PASS. Proof ALL GREEN post-rebase
(fixtures/det-gate/hook byte-identical). Balanced panel s15: invalid by construction (#797
Unmatched flags, env-gated) — compare .md attached, manual paired analysis, NOT re-scored.
Metric review (s14): exposure-normalized starvation bar is tight against chaos-dominated
counts; proposed next-run revision: chaos-aware tolerance or promote paired survival-diff
to binding harm bar. Interaction hypothesis was directionally wrong — recorded, not
re-scored. Findings: the combined buffer cost is filed to sim-findings.md (open, not
steve-call).
Evidence: evidence/2026-10-23/sim-depinteraction-b.md + depinteraction-b-corpus/ (128
per-seed JSONs) + depinteraction-b-panel-compare.md + depinteraction-b-analyzer-report.txt.

## Arm sim-easingchannels-b: DIAG-NO-GO (report-only)
Landed d5b0d4092 + d3a0bb82d (ff-only).

The question: sim-plentydepri-confirm-b's headline mechanism claim — "the funnel.share/easing
raw channel is throttled but away_wild compensates" — decomposed kcal-by-kcal on the same
2x2 factorial x 2 policies x 16 fresh seeds 9250-9265 = 128 configs, own independent sweep.
DIAG verdict: NO-GO (report-only — levers already on master). Throttle CONFIRMED on all 4
cells (-669 to -1659 kcal/glut-day); the away_wild COMPENSATION CLAIM IS REFUTED (away_wild
down on 3/4 cells, +11 noise on the 4th). Mechanism attribution 100% on all 128 configs
(marginal-glut inflow sampled PRE-deposit at the three pantry choke points; funnelShareEased
vs awayWild vs depriKcal separated). Guardrails (a), (c), (e) PASS; (b) MISSES on all 4
cells (starvation rate +0.02-0.06/100vd, real but tiny — bar over-tight per metric review);
(d) MISSES on leadfeast/dg0 (8 vs 13) and belongfeast/dg1 (3 vs 6). Design-positive:
rot/100d collapses 4-6x under PD=1 (302k->68k lead/dg0). The lever trades a small
survival/national cost for a large rot reduction — a lever-run question for the axis, not a
self-revert. Proof 52/52 ALL GREEN post-rebase. Balanced panel s15: invalid by construction
(#797), compare .md attached.
Together with depinteraction: the two DIAGs agree — PD x DG interaction is amplification via
the shared funnel.share glut channel, not the hypothesized stand-down, and the confirm's
belongfeast reversal was seed noise.
Evidence: evidence/2026-10-23/sim-easingchannels-b.md + easingchannels-b-corpus/ (128
per-seed JSONs).

## Wall numbers
Both corpora are SEATDRIVE=0 pre-seat food-economy substrates (wins structurally 0).
TELEMETRY DEVIATION CHECK (vs scale-wall.json, metrics national,table,wins,exiled):
- depinteraction-b-corpus (n=144 files): 3 LOUD — national 12->74, table 16->0, wins 16->0.
- easingchannels-b-corpus (n=128 files): 3 LOUD — national 12->63, table 16->52, wins 16->0.
All classified REGIME artifacts (winseat full-stack baseline vs deliberate SEATDRIVE=0
pre-seat DIAG corpora, wins structurally 0) + n-mismatch (144/128 pooled 8-cell corpora
vs n=16 baseline); both arms measurement-only, zero src/js — no broad-balance footprint
possible. Baseline NOT rolled.

## Convergence state
food-economy stays converging (NOT converged): the PD x DG interaction is now fully
decomposed and named (amplification, not attenuation; funnel.share glut is the single
dominant rot channel; the confirm reversal = seed noise), the away_wild compensation claim
is REFUTED with measurements, and the mechanism's buffer cost is named (starvation +5/+2/+9
over ~13k village-days, national collapse on the worst cell) — but both levers stay on
master by kill discipline (mechanism works as designed; guardrail bars need chaos-aware
revision next run). Live open lines: #643 portion-law steve-call, #822 expedition-recall
steve-call, the real choice UI (Steve's design task), storageshed parked (next unpark uses
per-plenty-day rack rate primary), combined-buffer-cost design call (open, filed).
The wave-5 door remains the binding wall (0 on every food-economy substrate). Directive lift
remains a Steve call.

## Infra
- Stale-lock recovery (1430Z lock 118min > 90min fallback); dead claim .json retained as a
  record; this run's claim .json deleted at closeout.
- Two service restarts mid-run killed the first proof launches (process list cleared);
  proofs re-launched from scratch, green.
- /tmp draft wiped by a sibling's cleanup — draft kept in hidden_files (durable).
- safe-commit.sh index clobber: NOT observed on these arm commits (verified via git
  status --short in both worktrees post-commit — clean).
- Rebase: both arms rebased clean in-worktree onto each master move (no duplication
  stalls this run).
- Master moved 3x mid-run; full proofs re-verified on the substantive food-economy base
  (c8d7c787d); voicing-only final delta (25ba0f54a) re-verified via fixtures + instrument
  proof; ff-only merges.
- Registry clean at closeout (both trees released/removed, branches deleted); main tree
  clean.
