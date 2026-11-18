# sim-closekind-a — EVIDENCE (RECORDER FIX GO, finding #2508)

**Arm:** sim-closekind-a · **Loop A run:** fleshout-20261118T0241Z · **Axis:** scale-onramp
**Type:** RECORDER FIX (scripts-only; no src/js change, no game change, no balanced panel, no seed band spent, no new sims).
**Branch:** `sim-closekind-a` · **Worktree:** `~/workspace/worktrees/sim-closekind-a`
**Base at arm start:** `c043ece91` · **Prereg:** `evidence/2026-11-17/sim-closekind-a-prereg.md` (frozen `914db14`, Correction 1).
**Proof test:** `scripts/test-closekind-a.js` — **49/49 green**.
**Verdict: RECORDER FIX GO (with Correction 2 — see metric review).** The fix does exactly what the prereg specified (deaths-first) and the proof test verifies the complete effect exactly; the prereg's clause-2 prediction was short by one null-close instance and three funnelSub window ends, for documented mechanical reasons. The literal prereg clause did not hold as written — that miss is in the prediction, not the fix — and is recorded as Correction 2 below rather than re-scored silently.

## The mislabel, in plain words

When a villager who holds a wave-4 plan dies, the game deletes their plan — and the plan's paper trail stops the same day. The analyzer that reads that trail looked for the death in two places that can never show it: the plan census (which stops when the plan is deleted) and the daily roster (which drops dead villagers entirely). So nearly every plan that ended because its holder died was filed as "plan deleted" instead of "holder died". The deaths list — the one place that does record every death, with the day and the cause — was never consulted. Of the 37 plan-closes across the three frozen corpora that ended in `plan-deleted` or never closed at all, 29 were actually holder deaths. The two cases sim-notick-a named (David Kim, day 86; gen_4hoo6rr, day 147) were just the two its tracer happened to trip over.

## The fix

In each copy of the shared churn block, consult `j.deaths` FIRST: the earliest entry with `kind === 'villager'`, `who === <holder>`, `day >= <plan seed day>` is the holder-death day and closes the instance `holder-died` on that day. Only if the deaths array yields nothing do the census `holderAlive=false` scan and the daily-roster `dead:true` backup run, exactly as before. Retargeted closes (set by the seed state machine) are untouched, the `plan-deleted` branch (census ends before the horizon, holder alive) is untouched, and the `diedDay >= seedDay` guard stays.

Patched (one logical change, six copies — no per-arm fork, no new classifySeed):
- `scripts/analyze-dawnbid-a.js`, `scripts/analyze-gateconfirm-a.js`, `scripts/analyze-launchdef-a.js` (the definition the frozen profilegate-b / handoff / launchfunnel / notick arms share), `scripts/analyze-haventick-b.js` (`ep`/`openDay`, reads `planCensus`), `scripts/analyze-nightcarry-a.js`, `scripts/analyze-profilegate-a.js`.
- Checked, out of scope: `scripts/analyze-seedattach-a.js` derives closeKind by a different mechanism (census row at runEndDay+1, `holderAlive` read directly) — not the shared churn block. `scripts/analyze-notick-a.js` (tracer) already read deaths first and is unchanged.
- `src/` diff: empty. No game change, no lever, no panel, no seed band.

## Before / after — frozen corpora (identical seeds, fixed classifier vs the committed before-oracles)

The frozen analysis JSONs were NOT regenerated — they stay as the before-oracle the proof test diffs against. Counts are per-seed instances (ON 25, OFF 12, notick-a ON 11).

### closeKind tallies

| Leg | plan-deleted before → after | holder-died before → after | null (never closed) before → after | retargeted |
| --- | --- | --- | --- | --- |
| profilegate-b ON | 21 → 5 | 0 → 17 | 3 → 2 | 1 → 1 |
| profilegate-b OFF | 8 → 1 | 0 → 7 | 2 → 2 | 2 → 2 |
| notick-a ON | 7 → 2 | 0 → 5 | 2 → 2 | 2 → 2 |

29 closes flip to `holder-died` (28 `plan-deleted` → `holder-died` + 1 never-closed → `holder-died`). The two named cases are in the set: david_kim → congregation, `plan-deleted@86` → `holder-died@86` (bucket selected-blocked kept); gen_4hoo6rr → reunion, `plan-deleted@148` → `holder-died@147` (bucket launched kept). The 7 non-flipping `plan-deleted` closes have no villager death for the holder at/after the plan's seed day — including luis_fernandez (fresh band), the horizon artifact: alive at the run's end, census ends at the run's end. Full 29-flip enumeration is in the prereg (Correction 1's 28) plus Correction 2's 29th below; the proof test asserts the exact per-field diff (32 field moves ON, 13 OFF).

### The 29th flip — oliver_moore (Correction 2)

103414, oliver_moore → eater: his plan seeded day 60 (world-tick, fled a monster) and he died day 60 to a monster — the same day. He has zero census rows and zero score rows: the plan never got a single day of paper trail. The old code had no census rows to scan and no roster row to find, so the instance never closed at all (`closeKind` null, bucket candidate-not-bid / not-scored). The fix closes it `holder-died@60`, bucket plan-churned-before-dawn. The prereg probe filtered on `closeKind==='plan-deleted'` and so missed null-close instances; this is the only one across the three corpora.

### Buckets and subs

- Buckets: exactly ONE moves — oliver_moore, candidate-not-bid → plan-churned-before-dawn (ON: plan-churned-before-dawn 3→4, candidate-not-bid 3→2). OFF buckets identical. Every other bucket on every leg is identical, including selected-blocked 12 ON and the launched counts.
- Subs: 2 churn-sub moves (`plan-churned-before-dawn:plan-deleted` → `:holder-died`: ON app_mgpspk2n36, OFF visjoin_115) + oliver_moore's sub (not-scored → holder-died) + 3 launched funnelSub window ends, which track closeDay: gen_4hoo6rr `window:134-148` → `window:134-147`, sofia_chen eulogy `window:45-48` → `window:45-47`, tariq_mahmood `window:96-146` → `window:96-145`. No other sub moves on any leg.
- Wall numbers (national / table / wins, wave 4–5, median survival, pool shape): identical on both legs. The fix changes no wall number.

### Notick tracer fates — 0 changes

Re-running the tracer over both corpora reproduces the frozen fate tallies exactly (frozen: depart-next-day 4, depart-later 1, re-bid-next-day 2, re-bid-later 3, holder-died-after 2, plan-deleted-after 0; fresh: 2/0/0/1/1/1 in the same order). The tracer already read deaths first, so its fates were right; only the trace rows' `closeKind`/`closeDay` fields move (9 frozen rows, 2 fresh rows — all `plan-deleted` → `holder-died`, six of them with a one-day-earlier closeDay). Luis Fernandez keeps `plan-deleted-after`: the horizon artifact, correctly.

## Verdict review (which past verdicts move)

- **sim-notick-a (DIAG GO) — DOES NOT MOVE.** Its 17 fates were already deaths-first; the tally is reproduced exactly. The fix confirms the instrument finding that motivated this arm and changes nothing the verdict rested on. The fix candidate it left open (defer part-≥2 `party_launch` commits) is unaffected — still a candidate, still needing its own arm.
- **sim-selblock-a (12 selected-blocked, sub split range-0 6 / no-tick 3 / sick 1 / hurt 1 / companion-sick 1) — DOES NOT MOVE.** Buckets and blocked subs are decided by the depart/resolved rows, never by closeKind; the counts re-verify exactly. One evidence sentence needs a wording correction (not a verdict change): instance visjoin_59 d80 was described as a "plan-deleted-same-day artifact" — visjoin_59 died day 80 to a monster, so the plan vanished that day because its holder died, which is a stronger version of the same point (the commit happened and the plan vanished before any tick could execute it; still not a missing instrument row). The frozen selblock evidence file is left as-is; this correction is recorded here.
- **sim-handoff-diag-a (DIAG NO-GO on completeness, 28/79 handoff-available) — DOES NOT MOVE.** Its analyzer never reads closeKind/closeDay (zero references in `scripts/analyze-handoff-a.js`; zero `plan-deleted`/`holder-died` mentions in `handoff-a-analysis.json`). Its verdict rests on selection counts and companion-pool rows, both untouched by the fix.
- **sim-profilegate-b evidence itself — SUB TALLY CORRECTED, verdict stands.** Its funnel buckets stand (except the single oliver_moore bucket move, which is not part of the gate verdict — the gate comparison is OFF vs ON on selected-blocked counts, both unchanged). Its `byFunnelSub` churn split changes as listed above (ON `plan-churned-before-dawn:plan-deleted` 2→1, `:holder-died` 0→2; OFF 1→0 / 0→1). Recorded here as the dated correction; the frozen analysis JSON is left as the before-oracle and the three tests that compare against it now expect the corrected values (see below).

## Existing tests updated (they encoded the mislabel)

`test-notick-a.js` C6/C7, `test-selblock-a.js` C5/C6, `test-handoff-diag-a.js` C9 compared re-run `byFunnelSub` (and, for ON, `byFunnel`) against the frozen profilegate-b analysis — they failed on the corrected subs after the fix, as expected. Each now compares against the frozen values plus the exact closekind moves (stated in the test, citing finding #2508), with order-insensitive map comparison (the re-run inserts new window keys in instance order). All other assertions in those tests pass unchanged. The three tests each still carry one pre-existing failure unrelated to this arm: a "src/ diff vs frozen base is EMPTY" static check that fails because sibling landings since their frozen bases changed `src/js/villager-brain.js` (and, for selblock, `conversation.js`, `convo-dialogue.js`, `villager-agency.js`). This arm touches no `src/` file (`git diff --quiet -- src` green in the proof test); those static failures predate it.

## Regression sweep (analyzers touched by the fix)

Every test for a patched analyzer (or a consumer of one) was re-run on this tip. Classifier fixtures and corpus legs all pass; the only failures anywhere are stale static checks that predate this arm (a seed-call-absent post-revert shape, a worktree-diff scope that lists this arm's own files, a policy-sha drift, and src/ diffs vs frozen bases from sibling landings since — this arm touches no `src/` file).

- `test-closekind-a.js` — **49/49 green** (this arm's proof).
- `test-notick-a.js` — 28/29: the 1 failure is the pre-existing "src/ diff vs base is EMPTY" static (sibling `villager-brain.js` landing since its frozen base). All corpus checks pass (C1–C8, incl. C6/C7 with the corrected subs).
- `test-selblock-a.js` — 25/26: the 1 failure is the same pre-existing src static (sibling `conversation.js` / `convo-dialogue.js` / `villager-agency.js` / `villager-brain.js` landings). All corpus checks pass (C1–C6, incl. C5/C6 with the corrected subs).
- `test-handoff-diag-a.js` — 31/32: the 1 failure is the same pre-existing src static (`villager-brain.js`). All corpus checks pass (C8/C9, incl. C9 with the corrected subs).
- `test-dawnbid-a.js` — 3 failures, all stale statics (seed call absent post-revert; worktree-diff scope; policy sha drift). No classifier-fixture failure.
- `test-gateconfirm-a.js` — **89/90**: the 1 failure is the stale worktree-diff-scope static.
- `test-launchdef-a.js` — 2 failures, both stale statics (seed call absent post-revert; worktree-diff scope). No classifier-fixture failure.
- `test-haventick-b.js` — **73/75**: the 2 failures are stale statics (worktree-diff scope; policy sha drift).
- `test-nightcarry-a.js` — **67/68**: the 1 failure is the stale worktree-diff-scope static.
- `test-profilegate-a.js` — **57/59**: the 2 failures are stale statics (seed call absent post-revert; worktree-diff scope).
- `test-launchfunnel-a.js` — 2 failures, both stale statics (src/ diff vs frozen base from sibling landings; scripts-diff scope listing sibling files plus this arm's files). No classifier-fixture failure.
- `test-companionpool-b.js` — 3 failures, all stale statics (seed call absent post-revert; worktree-diff scope; policy sha drift). No classifier-fixture failure.
- `test-profilegate-b.js` — 3 failures, all stale statics (src/ diff vs frozen base from sibling landings, incl. the depart bypass in `villager-agency.js` landed by another arm; scripts-diff scope). No classifier/fixture failure.

## Metric review

- **Correction 1 (prereg, pre-fix): the defect is systemic, not two instances.** The brief's "EXACTLY the 2 expected flips" counted only the two instances the notick tracer named. A pre-fix probe of the frozen corpora showed 28. The prereg froze the corrected 28-flip expectation before the fix was written.
- **Correction 2 (this evidence, post-fix): the 28 was still short by one, and the sub count was short by three.** The probe filtered on `closeKind==='plan-deleted'` and missed instances that never closed at all (oliver_moore, the only one) — the deaths-first read closes those too, and closing one moves its bucket. It also missed that launched `funnelSub` window ends track closeDay, so three window ends move a day earlier with the death day. Both misses are mechanical consequences of the specified fix, not side effects: every moved field is either the close itself, a bucket/sub derived from the close, or a window end derived from the close. No field moves that is not downstream of a corrected close.
- **Verdict on the bar.** Prereg clause 2 as written ("exactly the 28 flips, 0 bucket changes, exactly the 2 sub changes") did not hold: 29 flips, 1 bucket change, 6 sub-affecting moves. By the letter of §14 that is a METRIC-BROKEN bar (mis-scoped enumeration — no correct implementation of deaths-first could have produced exactly 28 flips, because oliver_moore exists in the frozen data). The fix is judged GO on the corrected expectation, which the proof test verifies exactly (49/49, including the full per-field diff against the before-oracles). A re-run against the corrected prereg would be pure ceremony — same fix, same proof — so the correction is recorded here instead of spinning a new run, and the coordinator can overrule.
- **No panel — by design.** A recorder fix changes no game behavior and no sim output; the balanced panel measures game change, so there is nothing to panel. The "before/after" here is the re-analysis itself, diffed field by field.
- **The frozen analysis JSONs still carry the old labels.** `profilegate-b-analysis.json`, `notick-a-analysis.json`, and `notick-a-fresh-analysis.json` are left as committed (they are the before-oracles this proof diffs against). Any arm that re-runs the analyzers gets the corrected values; any arm that reads the committed JSONs reads the mislabeled closes. If the coordinator wants the JSONs regenerated, that is a one-command follow-up (`analyze-profilegate-b.js`, `analyze-notick-a.js` over the frozen corpora) — not done here, to keep the before-oracle intact for this proof.

## Village assessment (plain words)

Nothing about the villages changed — only the filing cabinet did. Twenty-nine times across three bands of villages, a plan's story ended with its holder's death and the record said "plan deleted" instead. The deaths themselves were always in the record: David Kim killed by a monster the morning after he bid; gen_4hoo6rr dead in the wild on an expedition he launched ten days earlier; Oliver Moore, who never even got a day — his plan was born and he died in the same day, and the old filing left his plan open forever, as if he were still out there waiting to be bid on. He wasn't. He died on day 60 and the plan died with him. Now the record says so. The villages, the fights, the launches, the wall — all exactly as measured before. What changes is that the next arm judging a plan by how it ended will read a death as a death.

## Wall numbers (scale-onramp axis)

Unchanged by this arm (quoted from the frozen profilegate-b analysis, re-verified identical on re-analysis): national standing 1/8, national rank 0/8, table 0, wins 0, wave 4 unlocked 8/8, wave 5 unlocked 1/8, median survival 147.5d OFF vs 116.5d ON. The wall did not move — this arm repaired the instrument that watches it, not the wall itself.

## Finding claim for the coordinator

**#2508 FIXED (RECORDER FIX GO).** `classifySeed` now consults the deaths array first in all six copies of the shared churn block; 29 closes across the frozen corpora correct from `plan-deleted` (28) / never-closed (1) to `holder-died`, with exactly one bucket move (oliver_moore) and no fate changes. No past verdict moves (notick-a, selblock-a, handoff-diag-a all stand; profilegate-b's churn sub split is corrected as listed). Follow-up for the coordinator: the committed analysis JSONs still carry the old labels — regenerate or leave as before-oracles (this arm leaves them); `analyze-seedattach-a.js` uses a different close mechanism and was checked but not patched — if its census-at-runEndDay+1 read has the same blind spot, it needs its own look.

## Disposition: FIX — nothing to revert

Scripts-only. No src/ change, no game change, no lever, no panel, no sims, no seed band. Commits: prereg (`914db14`), fix + proof test + three test updates + this evidence (to be committed by this run's closeout). Net src/ diff vs base: zero.

## Files

- Prereg: `evidence/2026-11-17/sim-closekind-a-prereg.md`
- Evidence: `evidence/2026-11-17/sim-closekind-a.md` (this file)
- Proof test: `scripts/test-closekind-a.js` (49/49 green)
- Fix: `scripts/analyze-dawnbid-a.js`, `scripts/analyze-gateconfirm-a.js`, `scripts/analyze-launchdef-a.js`, `scripts/analyze-haventick-b.js`, `scripts/analyze-nightcarry-a.js`, `scripts/analyze-profilegate-a.js`
- Updated (encode the corrected recorder values): `scripts/test-notick-a.js` (C6/C7), `scripts/test-selblock-a.js` (C5/C6), `scripts/test-handoff-diag-a.js` (C9)
- Corpora read (frozen, unchanged): `evidence/2026-11-17/perseed-profilegate-b-on/`, `perseed-profilegate-b-off/`, `perseed-notick-a-on/`
- Before-oracles (frozen, unchanged): `evidence/2026-11-17/profilegate-b-analysis.json`, `notick-a-analysis.json`, `notick-a-fresh-analysis.json`
