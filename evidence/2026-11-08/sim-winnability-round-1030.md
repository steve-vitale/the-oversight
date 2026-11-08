# sim-winnability-round-1030 — Loop B coordinator round evidence

**Run:** fleshout-loop-b-20261108T1030Z · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Claim:** `hidden_files/lever-claims/fleshout-loop-b-20261108T1030Z.json` · **Master at closeout:** `6943519e7` (all three arms merged locally, pending ship).

## STALE-LOCK RECOVERY at run start

The 0830Z Loop B lock (created 08:34:00Z, run_id `fleshout-loop-b-20261108T0830Z`) was deleted under the 15-min guard: its tree `sim-binddiag-b` heartbeat was 09:10:24Z, 81 min stale at recovery (~10:31Z); the lock itself was 117 min old (>90-min fallback). Its claim was retired to `.DEAD` with a note. The 0830Z run DIED before closeout — no coordinator evidence file exists for it — but its work survived as commits: healerbisect midpoints #5/#7/#8 + #9 full-8 were ALREADY LANDED on master as `2fa2833bd` (handoff correction `32d2ace79`); the binddiag branch (3 commits, DIAG-GO) was COMMITTED BUT UNMERGED and was adopted by this run. Loop A live on food-economy the whole run (1017Z lock + claim: doublenight re-judge + medicduty + comparecontract; trees `sim-medicduty-a`, `sim-comparecontract-a`, `sim-doublenight-rejudge-a`, heartbeats fresh) — NOT touched.

## Arm 1 — sim-binddiag-b (ADOPTION/LANDING, DIAG-GO, 246ce6dc2)

Coordinator landing in the existing tree, no new worker, no new sims. Branch verified (3 commits `bad052a83`/`c93288c86`/`8c10af6ca`, tree clean, zero writes <15 min old, zero `src/` changes — 23 new files only), rebased onto explicit master SHA `76c16eeae` (3/3 picks, no quirk), proof `scripts/test-binddiag-b.js` 19/19 green on the rebased tip and again post-merge, merged `--ff-only`, tree released as done-merged, branch deleted, main tree clean. Evidence: `evidence/2026-11-08/sim-binddiag-b.md` (+ prereg, sense ring, corpus `perseed-binddiag-b/`).

Verdict stands as the dead run wrote it: the Binding leg's funnel is decomposed — links 8/8 → subs 8/8 → seasoned 8/8 → LEAD qualifies 5/8 → beats staged 4/8 (all First Court, all day 77) → national held to end 2/8. Binding stages: LEAD qualification (trust, not age) and national persistence (trust dips un-season links). The Binding (BELONG) never fires once; the rung clock makes national day 77 structural. The veterans lock is confirmed as a PARALLEL leg, not the Binding's shadow. Full seat 0/8; lesser seats convert 2/2 into wins. The Binding wait is never voiced (finding, line 1906); the Herald refusal line repeats ~15× in two days (finding, line 1907); national day 77 is structural (finding, line 1908).

## Arm 2 — sim-healerbisect-mid14-b (worker, 2 screens, LANDED 2294ef81)

Worktree `sim-healerbisect-mid14-b` registered (flock queue fast this time, ~90s), worker spawned on the 0830Z handoff: screen midpoint #14 `2bc17d793` (alien expansion) into #10..#17, with a prereg-amendment-first instruction (the old 4-seed screen no longer discriminates — 3/4 heal at #9). The worker wrote Amendment B (`af93aa2df`, committed before any judged sweep): full-8 screens from #14 on. It screened #14 AND continued halving in the same worktree: #16 `685dc9ec4` (pellet pass).

- **#14 AMBIGUOUS** (median 103d, sits 4/8): the alien expansion heals nothing new — moves exactly one seed vs #9 (53002: 150d→139d); the other seven identical. 53005 still exactly collapsed (54d).
- **#16 HEALED** (median 145d, sits 4/8, **0/8 moved death days vs the healed control**): every seed identical on days, seat, standing, wave-4 kills. The #9/#14 overshoot (53006 hunting 8 wave-5 Producers) vanishes. 53005 heals at last (150d, lesser d99, exact healed match).
- Flip interval after the worker: **#15..#16**. Proof 17/17 green. Zero `src/js`. Evidence + 8-seed corpora each: `sim-healerbisect-midpoint14-b.md`, `sim-healerbisect-midpoint16-b.md`.

Coordinator landing: verified branch (3 commits on master `246ce6dc2`, tree clean apart from the two scratch extraction dirs, which the coordinator deleted as reproducible — the mid15 worker was briefed to delete its own), rebase a no-op (already on tip), proof 17/17 on the tip, merged `--ff-only` (the merge exec was interrupted by a service restart mid-call; verified afterwards by `git rev-parse HEAD` = `2294ef81` and merge-base — the merge HAD applied, no retry needed). Tree released, branch deleted. The ship loop then bumped the version on top (`d229b58f5`).

## Arm 3 — sim-healerbisect-mid15-b (worker, final screen, LANDED 6943519e7)

Worktree `sim-healerbisect-mid15-b` registered on the post-ship tip `d229b58f5` — registration took ~20.5 min in the registry flock queue (three `flock -x` waiters; the 0730Z precedent waited ~20 min; the queue drained on its own, no intervention). Worker spawned to screen midpoint #15 `e6ddaf32a` (specialist first rung 10 → 5 XP) full-8 and name the finger.

- **#15 AMBIGUOUS** (median **119d**, sits 4/8 — the median bar fails by exactly one day; sorted days 50, 65, 67, **88**, 150, 150, 150, 150). 53002 is the one seed #15 makes worse (139d → 88d: sickness cluster d45–55, then two starve d79) — it costs the median the single day.
- **Fingered landing: #16 `685dc9ec4` (pellet pass)**, per the pre-registered rule (AMBIGUOUS/COLLAPSED at #15 → finger is #16). The flip interval #15..#16 is now fully mapped on the full 8: collapsed 70.5d → #8 100d → #9 108.5d → #14 103d → #15 119d → #16 145d = healed control. Only 2/8 seeds move death days #15→#16 (53001 +38d, 53002 +52d).
- **The honest nuance:** the heal is two steps, not a switch. #15 heals the starvation village (53005 — its fallen list identical to the healed control's, all 22 deaths) and brings 53003 to healed-exact; #16 finishes 53001/53002. The one unrun counterfactual is the pellet pass alone on the #14 base — flagged in the evidence file, NOT claimed (finding appended this run).
- **53007 never heals anywhere** (best 63d collapsed/#8; 50d at #15/#16 = the healed control's own number) — finding appended this run.
- Balanced panel (§15): attempted, sweep-corpus screen only, NOT a panel verdict — `balance-panel.js compare` cannot read doorwalk corpus directories (EISDIR); an 8-pair sweep-corpus compare ran with decision `review_required` (entry/sitting 0.5 → 0.5 `no_material_signal`, everything else `not_observed`). Compare + rows committed under `evidence/2026-11-08/panel-healerbisect-flip-b/`. A real panel verdict needs real panels (panel-contract lane work). No compare was faked.
- Proof 17/17 green. Zero `src/js`. Evidence + 8-seed corpus: `sim-healerbisect-midpoint15-b.md`, `perseed-healerbisect-mid15-b/`.

Coordinator landing: verified branch (2 commits `769eaf93`/`6943519e` on master `d229b58f5`, tree clean, scratch dir already deleted by the worker, zero `src/` diff), rebase a no-op, proof 17/17 on the tip, merged `--ff-only`, tree released, branch deleted, main tree clean at closeout (`6943519e7`).

## The healer question CLOSES with this run

The fingered landing is **#16, the pellet pass** (`src/js/progression.js`, Steve's ruling 2026-11-07 — the pellet moves to hungrier hands at dawn), with full-8 per-seed trajectory evidence on both sides of the interval #15..#16, the 53005 caveat satisfied (it heals at #15, the specialist first rung — record that split, not just the finger), and the §15 panel screen attached. All 17 game-code points are now mapped on the full 8. Per-seed healer map (complete): 53004 heals #8; 53006 heals #8; 53008 heals #9; 53002 heals #9 only, regresses at #15, exact at #16; 53003/53005 heal at #15; 53001 only at #16; 53007 never heals.

Note what this means, plainly: the "healer" is not a fix to land — both landings are ALREADY on current master (the healed control IS current master). The bisect explains why the frozen band healed between `cf22937b8` and `c9fea16ee`: the specialist ladder's first rung lets the village feed itself after the first month of dying, and the pellet pass moves food to hungry hands. The frozen band is healthy on current master again — the 53201–53212 confirm may lean on it (finding #1885's "do not lean on it until the fix lands" is discharged: the fix was these two landings, already live).

## Wall numbers (this run's judged corpora)

- Binddiag (tableseat-nowait substrate, 76401–76408, 180d): national ever 4/8, final 2/8; table entered 2/8 (lesser, both won); entered FULL 0/8; wave-4 8/8, wave-5 2/8; median 100d; starvation 1.
- Healerbisect #15 (frozen band, 150d): national 0/8, sits 4/8 (lesser only), wins 0/8 (baseline leg never walks a door); wave-4 8/8, wave-5 1/8 (53006 only, 0 w5 kills); median 119d.
- Healerbisect #16 (frozen band, 150d): national 0/8, sits 4/8 (lesser only), wins 0/8; wave-4 8/8, wave-5 1/8 (53001 only — identical to healed control); median 145d.
- Full seat 0 everywhere this run; wins only through the lesser seat on the tableseat substrate.

## Telemetry deviation check (coordinator)

- Binddiag corpus: 2 LOUD lines (national 12→0, wins 16→0, n=17 files) — the known field-shape/regime artifact class (per-seed rows carry nationalEver/won, not top-level national/wins paths; the corpus itself reads national ever 4/8, won 2/8). Baseline NOT rolled, no investigation item.
- Mid15 corpus: telemetry-check REFUSED the input by design ("refusing recorder-corpus input: all 8 rows carry top-level anchorCommit … Recorder corpora are compared with sweep-compare tables, never against a run baseline here") — same as the 0730Z run. No LOUD lines, no compare; the §15 sweep-compare tables are the sanctioned comparison. Baseline NOT rolled.

## Metric review

- Binddiag: pre-registered bar held; G2 identity (8/8 seeds identical) is the neutrality proof; the same-day-beat inference fix is measurement-only, proven by run-2 exact reproduction of run 1.
- Healerbisect: full-8 bars applied without re-scoring at every point. The median bar did real work four times (#9, #14, #15 each fail it while passing sits; without it each would have been declared the healer). Amendment B earned its keep a third time: the retired 3/4 screen would have called #15 HEALED (53004/53005/53006/53008 all reach 150d); the full 8 shows one day short because 53002 regresses.
- One correction to the prereg's expectation, not the metric: the bisect narrative assumed a single landing flips the whole band. The completed staircase shows a two-step heal (#15 + #16), and the interval rule — not a single-switch story — names the finger. The GO bar ("fingered landing named with full-8 evidence on both sides") is met for the interval #15..#16 with #16 as finger; the two-step mechanism is documented in the #15 evidence rather than smoothed over.

## Infrastructure

- Safe-commit index clobber hit the mid14 worker's 3 commits, the mid15 worker's 2 commits, and (per the 0915Z pattern) is the standing class — repaired via HEAD-blob/ls-tree cacheinfo each time, hashes verified, status clean. It did NOT hit this coordinator's evidence commit (see below).
- Worktree heartbeat script hung twice this run (mid14 once, mid15 once — exit 124 on a 60s timeout); branch commits are the durable record, as the workers noted.
- Service restart interrupted the mid14 merge exec mid-call; the merge had applied (verified by rev-parse + merge-base, no retry). No work was lost or duplicated.
- Registry flock queue: mid15 registration waited ~20.5 min behind sibling registrations (build-ladder-leg2-basecheck, journey-deepening appeared mid-run); the queue drained on its own.
- `git status` on the main tree took 5+ min twice under sibling load (killed both slow scans; verified state instead via `git log` + `git worktree list` + registry read, which do not scan the worktree).
- check.js --quick NOT re-run: zero `src/js`, zero green-list files across all three landed arms (binddiag recorder is a new default-OFF policy + tests; healerbisect is evidence/corpus only). Standing profile unchanged.
- Main tree clean at closeout. No push, no version bump by this run (the ship loop bumped `d229b58f5` on top of the mid14 merge mid-run).

## Findings appended this run (sim-findings.md)

- 53007 NEVER HEALS ANYWHERE IN #1..#17 (best 63d; 50d = healed control's own number).
- PELLET-PASS-ALONE COUNTERFACTUAL UNRUN (#16 without #15; minimal flipping set not claimed).

## Convergence state

scale-onramp stays **converging** (NOT converged): the healer question closes — the finger is #16 (pellet pass) with #15 (specialist first rung) as the load-bearing first step, 53005's caveat satisfied — but the full seat is still unreached (0 everywhere this run), wins still come only through the lesser seat, wave 5 is 1/8 on the frozen band, and a real §15 panel verdict on the flip is still owed by the panel-contract lane. Next blanks, in order: (1) the fight-loop fix candidate (b) — HELD until the healer was known, now known: re-scope it as a mechanism change judged on the fight-level property against the #15/#16 flip, or re-point it at the flip landings; the frozen band is healthy again, so it can be judged there; (2) the real §15 panel build for the flip-point before/after; (3) the 53007 question and the pellet-pass-alone counterfactual (findings, this run); (4) the trial-by-combat staging question (steve-call, unchanged); (5) the Binding-leg next step from the binddiag funnel — LEAD qualification on trust (too poor to tend / tends not lifting enough) and national persistence — a tend/trust lever is the named next build on that leg, NOT a stronger courtship drive. food-economy stays converging (untouched; sibling Loop A live at closeout). Claim deleted; lock deleted. Evidence: this file (coordinator commit, see log).
