# ARM "renegans" — the unanswered-renegotiation gap on the LEAD road (scale-onramp)

Worktree: `~/workspace/worktrees/sim-renegans-20261014`. Run: oversight-flesh-out-loop, axis scale-onramp.
Finding: evidence/2026-10-14/sim-fifthlink.md — the tend-vs-decay race's #2 loser was UNANSWERED young-link renegotiation beats (−6 each on 7-day expiry): leadcourt never clicks `answerRenegotiation`; winseek already answers them (gift when the pantry holds 8000+, visit otherwise). The fifthlink layer's s55 win (5th link seasoned d78, Standing 136→170) proved the mechanism matters; the layer was killed on a miscalibrated GO denominator (metric review). This arm isolates the single working mechanism: the beat answers.
Commit under test: worktree tip 57df5478 (fifthlink killed). No game-code changes — policy layer + instruments + evidence only. No base files modified.

## Canon read

- docs/CANON.md (manifest + standing rules), docs/SCALE-DISCOVERY.md (BUILT 2026-10-13 — the ladder's discovery beats; this arm needs no new fiction).
- Engine design (src/js/hierarchy.js, read — not invented): young links (<21d) get a staged renegotiation beat on succession (`pendingRenegotiation`, answered via `answerRenegotiation`: gift = 1,500 kcal → trust +8, visit = speaker out 2 days → +5, wait/silence = −6 on 7-day expiry said aloud; if Haven is the subordinate the deferred tribute leverage lands ×1.5). The beats are the designed recovery path — winseek's own comment: "ignoring them is how links die."

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sim

- **Question**: does making leadcourt answer young-link renegotiation beats honestly (winseek's bar, no new verbs) move the scale on-ramp — beat answer rate, 5th-link conversion, Standing?
- **Primary metric**: fraction of presented young-link renegotiation beats answered, 8 seeds × leadcourt(FOURTHLINK=1), identical-seed before/after.
- **GO**: armed answers ≥75% of presented beats (baseline 0 — leadcourt never answers) AND (armed max Standing ≥ baseline max + 15 on the seeds where a 5th link forms on either side, OR 5th-link seasoning conversion ≥ baseline+1).
- **Guardrails**: national ≥ baseline−2, median survival ≥ baseline−10d, scholar exiled unchanged.
- **Horizon**: 180d death-aware (Steve's WIN-PATH HORIZON 180; same as the fifthlink pilot; dead villages stop simulating).
- **Seeds**: 11/22/33/44/55/66/77/88 × leadcourt (FOURTHLINK=1 both sides; armed adds RENEGANS=1).
- **Proof**: `scripts/test-renegans-20261014.js` — REAL RED phase (R1 gate-off = fourthlink; R2 the gap in-engine: a real `successionCrisis`-staged beat expires unanswered under the baseline policy, 24→16→10, "the silence answered").
- **Refinement before the pilot** (never after): the assignment said "× leadcourt", but plain leadcourt's subs>=3 cap structurally prevents 5th links, which would make the GO's 5th-link clause vacuous — a trivially-passing GO is dishonest measurement. The fifthlink pilot established this exact road ("8 seeds × leadcourt (FOURTHLINK=1 both sides...)"), so baseline = leadcourt+FOURTHLINK=1 (the uncapped courtship, still leadcourt's courtship), armed = +RENEGANS=1. The gate-off module is byte-identical to fourthlink either way.

Metric binding (§14): a miss is NO-GO, never re-scored against a friendlier metric mid-run. Doubts go under "metric review" for the NEXT run.

## The layer (scripts/policies/renegans.js, RENEGANS=1, default OFF)

Gate off → exports fourthlink unchanged (inert; proof R1). Gate on → fourthlink.daily + `renegotiationAnswers`, winseek's bar verbatim: gift iff `pantryKcalLive() > 8000`, visit otherwise. Honest beats only, no fabrication, no new verbs — only clicking the existing answer beat the policy ignores. Proof 16/16 green.

## Results — GO MISSED → KILL

Baseline (FOURTHLINK=1, 8 seeds, `evidence/2026-10-14/sim-renegans-base.json`; per-seed `sim-renegans-base-s*.json`):
- PRIMARY: beats answered **0/29** (0%) — 29 young-link renegotiation beats presented across 6/8 seeds, every one expired unanswered. The gap is real and measured.
- 5th-link seasoned **1/8** (s44, formed d34, S63, trustAt30=70); 5th formed on 3/8 (s33 d30, s44 d34, s55 d57)
- median survival 81d; national 4/8; table 0/8; won 0/8; exiled 0/8; wave4 5/8; wave5 0/8; maxStanding 170; medianEndStanding 102
- Cross-check vs the fifthlink pilot's baseline (same road, older tree): s44 matches (d82, S63, 170); s55/s33 diverged by landed commits since — the baseline was re-measured on the current tree, which is what the armed run compares against.

Armed (FOURTHLINK=1 RENEGANS=1, 8 seeds, `evidence/2026-10-14/sim-renegans-armed.json`; per-seed `sim-renegans-armed-s*.json`):
- PRIMARY: beats answered **26/29 (90%)** — 12 gifts, 14 visits. The layer fires exactly as designed.
- 5th-link seasoned **1/8** (s44, S63 — byte-identical outcome to baseline: d82, Standing 170, national, wave-4 d57, 33 tends); 5th formed on 2/8 (s33 d30, s44 d34)
- median survival 60d; national 3/8; table 0/8; won 0/8; exiled 1/8 (s55, exileDay 38); wave4 3/8; wave5 0/8; maxStanding 170; medianEndStanding 0
- No engine hangs (s44 armed completed d82 — the fifthlink Focus Group stalemate did not recur on this trajectory).

GO verdict (§14 binds):
- (a) 90% ≥ 75% — MET.
- (b) Standing on seeds where a 5th link forms on either side {s33, s44, s55}: baseline max 170, armed max 170 — 170 ≥ 185? NO. Conversion: armed 1 vs baseline 1 — ≥ baseline+1 (2)? NO.
- **GO MISSED → KILL.** The mechanism fires (90% answer rate) but moves no outcome: the one seed where a 5th link seasons is identical with and without the answers.

Guardrails (also binding — a GO met with a guardrail breached is NO-GO):
- national 3 ≥ baseline−2 (2) ✓
- median survival 60d vs 81d — **BREACHED** (−21d, limit −10d)
- exiled 1 (s55) vs 0 — **BREACHED** (unchanged required)

The breaches are lever-downstream, not instrument noise: baseline vs armed dailyCurve pop/pantry are byte-identical through day 27 on s55 (the layer and instruments consume no RNG); divergence starts at the layer's first answers (day 31). The visit path's `_musterAway` consumes RNG, so every subsequent roll diverges honestly. What the cascade produced:
- s55 armed: 2 beats answered d31 (1 gift, 1 visit) → scholar exiled d38 (23 days, rest of run) → village lost d60 (baseline: d81). The exile is downstream of the lever; the exact charge isn't in the saved telemetry (Game.log is empty in the harness — noted as instrumentation gap, not chased).
- s77 armed: 6/6 beats answered (3 gifts, 3 visits — grain + speaker-days spent during a fragile stretch) → general collapse d46 (sickness/wounds/contest/starvation) vs baseline d81/national/136.
- s33 armed: 13 beats presented (vs 7 baseline — successions themselves multiply downstream) → d45 vs d72.

Honest reading: +8/+5 trust on young links is strictly better diplomacy per-beat, but the costs are real (1,500+ kcal whole-unit takes; the speaker gone 2 days per visit) and the RNG cascade dominates at n=8. The fifthlink diagnosis already ranked succession haircuts (#1) above unanswered beats (#2) — this arm confirms fixing #2 alone doesn't move the wall.

Kill protocol: `scripts/policies/renegans.js` DELETED. Proof/sweep/sense scripts + evidence retained as documentation (fifthlink precedent).

## Wall numbers (every run)

| | national | table | wins | wave-4 | wave-5 | maxStanding | medianSurv | exiled |
|---|---|---|---|---|---|---|---|---|
| baseline (8) | 4/8 | 0/8 | 0/8 | 5/8 | 0/8 | 170 | 81d | 0/8 |
| armed (8) | 3/8 | 0/8 | 0/8 | 3/8 | 0/8 | 170 | 60d | 1/8 |

No run in this pilot reached national via the 5th link, the table, or a win. The scale wall stands: waves 4–5 unlock on 3–5/8 seeds, national on 3–4/8, table 0/8, wins 0/8.

## Village assessment

The uncapped LEAD road courts 4–6 villages and the succession grind is heavier than the tend race suggested: 29 beats presented in 8 baseline seeds (up to 14 on one seed) — every Haven leader death stages a young-link beat, and leaders die often. The policy that answers them (90% answer rate, honest costs) doesn't buy survival: the villages that live long enough to court a 5th link season it or don't on the strength of the underlying economy (s44's 5th link sat at trust 70 on day 30 — never at risk; the answers were irrelevant there), and the villages that die early die of combat/sickness/starvation regardless of diplomacy. The diplomacy game is downstream of the mortality game on this horizon — a blank the food-economy and combat levers own, not this one.

## SENSE-TESTING (scripts/sense-renegans-20261014.js, seed 44, narration on)

The answers read as coherent village decisions, not robotic clicks:
- The staging says why: "[d72][succession] Young link: grief delays the verdict — a renegotiation is staged."
- The gift: "[d73][renegotiation] Met grief with grain (3,000 kcal, trust +8); the tribute leverage never landed." — the cost is real and said aloud (3,000 = whole-unit take, the engine's honest doctrine, not the advertised 1,500 — same wrinkle the fifthlink sense test noted).
- The visit with an empty bench degrades gracefully: "[d77][renegotiation] No speaker to send — word and promises; the tribute leverage never landed." — the engine's own fiction ("There's no one to send — Haven's bench is empty. Word and promises ride out instead. They note the difference, and the trying."), honest +2 instead of +5.
- No fabricated history, no filler — each answer responds to a staged beat with a real cost. The fiction holds. The lever was killed on outcomes, not on sense.

## Blanks filled / documented

- **Measured** (not chased): the unanswered-beat gap is now quantified end to end — 29 beats presented on 8 baseline seeds, 0 answered; the layer answers 90% (12 gifts, 14 visits) with a 16/16 REAL-RED proof. Fixing the #2 race loser alone moves no wall metric.
- **Documented**: (1) Game.log is empty in the harness — post-hoc narrative forensics (e.g. what charge exiled the scholar on s55 d38) isn't recoverable from saved telemetry; future pilots that need causal stories should capture Game.say or the justice ledger. (2) The visit path's `_musterAway` consumes RNG — any beat-answering policy diverges the RNG stream from the first visit, so identical-seed comparisons on this road always carry cascade noise; the s44-style identical-outcome pair is the lucky case, not the norm.
- **Candidate for a future arm** (not this run — §14: revisions apply to the NEXT run): the #1 race loser (succession haircuts −8/−14) still unaddressed; a mourning/grief-management lever, or the fifthlink metric review's conditional-on-formation GO.

## Metric review (§14)

GO missed: (a) met at 90%, (b) missed on both clauses (Standing 170 vs 185 required; conversion 1 vs 2 required). Per §14 this is NO-GO, not re-scored — the layer is killed. Guardrails independently breached (median −21d, exiled 0→1).

The metric design held up: the two-conjunct GO correctly distinguished "the mechanism fires" (90% answers) from "the wall moves" (nothing moved). The fifthlink false-kill worry does not apply here — this GO's outcome conjunct was measurable and honestly missed, and the guardrails caught real downstream harm. One calibration note for the next run: the beat-answer primary is a mechanism metric; on this road the outcome conjunct should stay primary, since mechanism metrics can pass while the village dies faster.

## Telemetry deviation check (scripts/telemetry-check.js)

- Armed flat aggregate vs `hidden_files/telemetry-baselines/scale-wall.json`: **LOUD: national swung −62%: baseline 8 → current 3.**
- Investigation: the scale-wall baseline (national=8, seeded 2026-10-13) predates this pilot's seed set and road. My own identical-seed baseline measures national=4 on the current tree; armed=3 is −1, inside the pre-registered guardrail (≥ baseline−2) and already reported above as a guardrail pass. The LOUD line is a stale-baseline artifact, not a same-run anomaly — the s77 national loss is the lever's honest RNG cascade, documented under Results.
- Verdict: explained, not a bug. **Baseline NOT rolled forward** — the arm is killed and the scale-wall baseline tracks the wall across runs; overwriting it with a killed arm's numbers would corrupt it.
- (Path note: the baseline uses flat keys; per-seed files needed flat aggregates `sim-renegans-flat-{base,armed}.json` for the paths to resolve — the first attempt with `summary.*` paths compared against a missing baseline key and was discarded.)
