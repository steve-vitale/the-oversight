# Lane B r157 succession — closeout adoption (06:00 occurrence, 2026-11-08)

## What this run did
Adopted the timed-out r157 succession closeout (fix d402d0fd7, teach-narration
dry in `src/js/conversation.js`). The 05:00 adoption run had rebased onto
246ce6dc2, proved the fix 3/3 green, and started the gate (PID 3195); the gate
finished 281 passed / 11 failed in 1653s. This run did NOT re-run the gate
blindly: it read the finished gate log, triaged all 11 failures serially,
ran a master-conversation.js control, re-based onto the then-current master
(d229b58f5, then d113cf14 after master moved again), re-proved the fix green
on each base, and merged.

## The fix (one line + comment, `src/js/conversation.js`)
Plant-teach (`choiceId === 'teach'`) joins `skill_learn:` / `skill_teach:` as
a diegetic-act outcome exempt from the repeat-ledger block, so a landed
lesson is not misreported as a dry deflection when an identical teach line is
still in the run window. Transcript-caught on the r155 panel (seed 33803 day
84: Brian's Black Walnut lesson recorded "taught" while the spoken line was
the dry deflection). Proof: `scripts/test-journey-succession-r157-teach-dry.js`
— ALL GREEN on the final base (8ceb3ef52).

## Gate triage (281 passed / 11 failed, `check.js --quick`, 292 scripts)
Serial retest + control verdicts. The branch changes ONLY `conversation.js`
(+ its proof/harness/evidence); every failure below was reproduced with
master's `conversation.js` restored (control log) or is load-caused.

| Failure | Verdict |
|---|---|
| test-capable-bot-20261014 (120s timeout) | Load phantom — passes serially |
| test-synergy-stall (120s timeout) | Load phantom — passes serially |
| godpath/test-solo-campaign-endings (120s timeout) | Load phantom — passes serially |
| godpath/test-measurement-cache-flags | Load-flaky — fails serially once under load, passes on re-run WITH the fix |
| godpath/test-trust-observer-neutrality | Load-flaky — child 60s timeout under load, passes on re-run WITH the fix (6/6) |
| godpath/test-measurement-proof-update | Pre-existing on master — proof manifest stale vs 7 inputs (see below); fails with master conversation.js too |
| godpath/test-measurement-workflow | Same root cause as above (retained neutrality proof vs current inputs) |
| godpath/test-mobile-combat-cadence (2 assertions) | Pre-existing on master — enemy-announcement ordering; fails with master conversation.js too |
| godpath/test-occupation-panels | Pre-existing harness bug — test copies balance-panel.js to /tmp without its `./lib/luck-instrument` dependency (MODULE_NOT_FOUND) |
| godpath/test-phone-frame-proof | Pre-existing on master — phone receipt stale (index.html changed since receipt) |
| test-establishment-r20-fixes (1 assertion) | Stale test vs landed rule R — asserts gate-B "voice once per cook-day" but code implements RACKSVOICE-REMINDER (2026-10-26): re-voices only when the figure changed or after 7 silent days; the fixture's pantry is unchanged on day 21, so silence is correct |

## Proof-staleness detail (measurement-proof-update / workflow)
Manifest diff vs the retained proof names 7 differing inputs:
`index.html`, `scripts/policies/binddiag-b.js` (new), `scripts/policies/cheaptend-a.js`
(new), `scripts/sweep-compare.js`, `src/js/build.js`, `src/js/conversation.js`
(this fix), `src/js/game.js`. Six are master-side changes since the proof was
generated; the fix adds the seventh. The proof refresh (real neutral panel +
`scripts/balance-proof-update.js`) is standing measurement debt, NOT part of
this one-line narration landing — same precedent as r114 (landed with 6
documented pre-existing gate failures).

## Control experiment (master-conversation.js)
Restored master's `conversation.js` in the worktree, ran the 7 deterministic
failures, restored the fix. Result: proof-update, workflow, cadence,
occupation-panels, phone-frame-proof still failed; cache-flags and
trust-observer-neutrality PASSED — then both also passed on re-run WITH the
fix (flipcheck), confirming load flakiness, not fix causation. Full logs:
`journey-succession-r157-masterconv-control.log`,
`journey-succession-r157-flipcheck.log`, `journey-succession-r157-retest-serial.log`.

## Telemetry deviation check (succession baseline)
`telemetry-check.js` vs `telemetry-baselines/succession.json` on the 12
per-seed tele files printed 2 LOUD lines (deaths.bearer 7.6 -> 70, +821%;
census.fallen 14.3 -> 124, +767%). EXPLAINED, no action: the tool SUMS across
files while the baseline is a per-run MEAN. Per-file means: deaths.bearer 5.83
(baseline 7.6, -23%), census.fallen 10.33 (14.3, -28%), census.alive 6.58
(3.8), integrationStage 3.00 (3.0, exact), deadBearerMentions 4.25 (4.2).
No real deviation; baseline NOT rolled forward.

## Infrastructure notes
- Stale-lock recovery: lock 2026-11-08T10:57:08Z belonged to the timed-out
  05:00 adoption run (gate PID 3195 dead, gate log complete); no registry
  entry under that run_id. Deleted, new lock 2026-11-08T12:00:49Z.
- Main-tree `git status` took ~22 min (84,689 tracked files, load avg 12+);
  a second status took ~5 min at load 4. Both clean. Disk 31%.
- Master moved twice during this run (d229b58f5 -> d113cf14, healerbisect
  evidence); rebased onto each current tip before merging (stale-base rule).
  Second rebase hit the recorded sequencer quirk (pick in both done/todo);
  verified unapplied via `git diff <pick>` and `git rebase --continue`.
- Sibling sim-doublenight-a ff-only merge never landed (branch not an
  ancestor of master as of this closeout); its command sat behind the slow
  `git status` for 30+ min. Not this run's scope.
- Baseline worktree attempt failed: `worktree-register.sh journey2-baseline`
  produced no output in 300s (REGISTRY.lock contention) and created nothing;
  the master-conversation.js control in the existing worktree answered the
  same question instead. No registry cleanup needed (no entry created).
- /tmp/r158-prereg-draft.md (mentioned in the 05:00 note) does not exist;
  the next fresh play run (r158, leg 4 endgame) needs a fresh prereg.

## Landing
Branch `journey2-succession` tip ebe2329ba (fix + closeout evidence), plus
the proof-refresh commit below, ff-only merged to master (715c2918 base).
Rotation-b 7 -> 4. Merged locally, pending ship.

## Addendum — second and third master moves + proof refresh (06:00 run, cont.)
Master moved twice more during this closeout: d113cf14 -> 2d604ef5b (ladder
leg2 build, 26 commits, incl. its own neutral-proof refresh) -> 715c2918
(journey-deepening r119, 3 commits, evidence/scripts only). Rebased onto
each current tip before merging (final tip ebe2329ba on 715c2918).

On the 2d604ef5b base the manifest diff vs the retained (ladder-refreshed)
proof named exactly ONE stale input: `src/js/conversation.js` — this fix.
The other six staleness inputs from the d229b58f5 base were resolved by the
ladder's refresh. Per the house rule (changed Game inputs require a fresh
real observer-neutral proof), ran the sanctioned recipe on this branch:
`balance-panel.js --seeds 7 --policies capable,risk-aware,socialite,winseek
--days 150` (4 cases, 0 cached, PANEL-EXIT=0) ->
`evidence/2026-11-08/neutral-succession-r157-20261108.json.gz` ->
`balance-proof-update.js` (UPDATE-EXIT=0; the panel passed full validation:
neutrality 4/4, no warnings) -> `scripts/balance-proof.json` updated.
Proofcheck after refresh, all green: teach-dry proof, measurement-proof-update,
measurement-workflow, measurement-cache-flags, trust-observer-neutrality
(`journey-succession-r157-proofcheck.log`).

Final gate picture on the merged base (715c2918): fix proof green, proof
tests green after refresh, 3 load-phantom timeouts green serially, 2 flaky
green on re-run — leaving only the 4 pre-existing failures, re-verified on
the final base (`journey-succession-r157-final4.log`): mobile-combat-cadence
(2 assertions), occupation-panels (harness bug), phone-frame-proof (receipt
stale), establishment-r20 (stale test vs rule R). None caused by this fix.

Infrastructure note: a brief write flap (~12:52 UTC) killed one background
evidence script mid-start (empty log, dead PID, no bash errors) and made an
earlier foreground loop's /tmp redirect fail silently (bash redirect failure
= exit 1 with no output); writes probed OK minutes later and the checks were
re-run in the foreground. Main-tree `git status` latency: ~22 min at load 12,
~5 min at load 4 (84,689 tracked files).
