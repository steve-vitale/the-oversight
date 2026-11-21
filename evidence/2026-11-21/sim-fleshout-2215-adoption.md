# Loop A run fleshout-20261121T2215Z — ADOPTION closeout of the timed-out 2015Z round

- Run: fleshout-20261121T2215Z (scheduled 16:15 CST), axis scale-onramp.
- Type: ADOPTION-ONLY. No fresh arms this run — the timed-out 2015Z
  round's two arms were finished but unlanded; landing them is this
  run's work. The next occurrence starts fresh.
- Base master at run start: `a853b4157`. Master at closeout: `d1b71a8f6`.
- Loop B live on winnability-chain throughout (2030Z claim:
  sim-d3refreeze2-b DONE/merged, sim-doorflee-b + sim-departbeat-b in
  flight) — NOT touched.

## Stale-lock recovery

Lock `fleshout-20261121T2015Z` (created 20:21:51Z, ~119 min old — past
the 90-min fallback). Its trees: sim-tier4access-a heartbeat 94 min
stale, sim-killlootbundle-a heartbeat 48 min stale. No live
coordinator process for 2015Z in ps; subagent state showed both 2015Z
workers done (tier4access completed NO-GO; killlootbundle cancelled
before judgement). Lock deleted, 2015Z claim retired to .DEAD with a
note, own lock `fleshout-20261121T2215Z` created 22:21:12Z. (Lesson
applied: ps + registry + subagent state all checked before recovery —
the 2030Z Loop B run's own note records a missed live coordinator on
exactly this guard earlier today.)

## Arm 1 — sim-tier4access-a: NO-GO, LANDED (evidence-only)

- Branch tip before adoption: `da5c3fac8` (base `5accf69db`); rebased
  onto `a853b4157` clean (4/4, exit 0) → tip `17fdf1369`; analyzer
  selftest re-run 25/25 green; merged ff-only, exit 0.
- Verdict NO-GO on frozen bars (prereg `929afcf10`, evidence
  `evidence/2026-11-21/sim-tier4access-a.md`): second-chance tier-4
  lifts effective tier-4 rolls 21 → 29 (+38%, 12.4% → 16.8% of prize
  rolls, bar 1.5×/25%) but contest grants fall 5 → 2 (4.5% → 1.9% per
  contest) — arm tier-4 rolls pay the gun 2/29 (6.9%) vs the 22.2%
  design rate. The pool, not the gate, is the wall once the gate opens
  (arm seed 107252: 7 effective tier-4 rolls, 0 grants). Lever
  reverted at the tip; instrument + evidence kept; 0 src delta.
- Wall: wins 0/8, national 0/8 both legs; wave 5 2/8 both; median
  survival 150 → 148d. Panel review_required, no material signal.
- Findings: #2647 (tier-4 pool is the wall after the gate), #2648
  (second-chance static prior overstated the eligible base).

## Arm 2 — sim-killlootbundle-a: INCONCLUSIVE, LANDED (lever kept, env-gated OFF)

- Branch tip before adoption: `7df786d82` (base `3329f4441`).
  Worktree found with the safe-commit index clobber (committed files
  staged-as-deleted, `game.js` staged-reverted) — repaired with the
  `git ls-tree -r HEAD | git update-index --add --index-info` pipe,
  verified empty status + empty diff HEAD + hash-object match per
  file. Proof test re-run 12/12 green, analyzer selftest 17/17 green.
- The worker was cancelled before judgement/evidence. Adoption
  judged from the frozen prereg §6 zero-arrival rule + the analyzer's
  own compare output (verdict INCONCLUSIVE): 0 kill-loot searcaster
  arrivals on either leg of the 8-seed pilot (107261–107268), so bar 3
  is INCONCLUSIVE, not GO, not NO-GO; guardrails pass (starvation
  deaths 5 = 5, median survival 150.5 = 150.5); both legs
  trajectory-identical (the lever never fired). Mechanism proven by
  bar 2 (exactly 2 cells on a forced searcaster drop, 0 when off, 0
  for non-searcaster drops).
- Lever disposition (coordinator decision, documented in
  `evidence/2026-11-21/sim-killlootbundle-a.md`): KEPT, env-gated
  `KILLBUNDLE=1`, default OFF — the prereg's revert rule applies to
  NO-GO only; zero draws, zero measured cost, identical panel. The
  next run needs a wider band (16 seeds, P(≥1 arrival) ≈ 88%) or a
  forced-arrival fixture (recommended first). Evidence file +
  panels committed as adoption closeout `c847772f3` (safe-commit
  index clobber struck again on that commit; repaired the same way,
  verified). Rebased onto `17fdf1369` clean (2/2) → tip `d1b71a8f6`;
  proofs re-run post-rebase 12/12 + 17/17; src delta exactly the +13
  KILLBUNDLE lines in `villagerKillLoot`; merged ff-only, exit 0.
- Smoke corpus file is a 0-byte `.tmp-55787` leftover (flap debris,
  committed as-is; the smoke gate itself passed — driver completed
  both legs — and the pilot corpora 8+8 are complete; compare/panel
  use ctl/arm corpora only).
- Wall: wins 0/8, national 0/8 both legs; wave 5 2/8 both; median
  survival 150.5d both. Panel review_required, no material signal.
- Finding: #2649 (kill-loot bundle pilot inconclusive; wider band or
  forced-arrival fixture owed).

## Telemetry deviation check (step 10)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-21/perseed-<arm>-leg/*.json' --metrics
national,table,wins,exiled --sweep-rows --allow-recorder-corpus`
(all four leg dirs): 3 LOUD lines on every leg — national 12 → 0,
table 16 → 0, wins 16 → 0 (n=8 seed rows each). VERDICT: EXPLAINED,
regime artifact, not a bug. The baseline is a winseat-regime suite
(national 12/16, table 16/16, wins 16/16 under WINPURSUIT/WINDEFER/
SEATDRIVE); this run's arms ran the competent-policy pre-seat
substrate where wins/national/table are structurally 0 — the scale
wall itself, measured identically on ctl and arm legs. The baseline's
own `_regime` note predicts exactly this spurious LOUD. Baseline NOT
rolled forward. (Note: the tool refuses recorder corpora by default —
exit 2 — because the per-seed files carry anchorCommit; the
--allow-recorder-corpus flag was used deliberately for this
regime-labelled check.)

## check.js --quick on the merged tip (d1b71a8f6)

- First attempt killed by the coordinator's own 240s timeout (2
  failures visible in the partial output — the timeout masked the
  real exit code through the tail pipe; not re-quoted as a result).
- Full re-run (no timeout, log at
  `hidden_files/check-quick-2215Z.log`): **337 passed, 7 failed in
  1042s, exit 1.** The 7:
  - 4 × `[check.js] TIMEOUT after 120s` (test-living-garden-deed-
    attainment, test-one-person-army-deed-attainment,
    test-trust-observer-neutrality, test-capable-bot-20261014) — the
    per-script 120s cap firing while TWO check.js --quick runs (this
    run's + the playtest loop's journey-landing gate) and a 107k-file
    git reset competed for 1.5 shared CPUs. Partial "ok" lines, no
    failed assertion in any of the four. Contention artifacts, not
    regressions; the ship loop re-runs the full check before landing.
  - test-measurement-proof-update.js (exit 1, 1.5s): "Proof source
    inputs are not current" — the KNOWN pre-existing failure
    documented in the convergence-tracker rebuild header (proof
    01ab3e346 stale since 7 Game files moved; next proof refresh
    must regenerate a fresh neutral panel). Pre-dates this merge.
  - test-measurement-workflow.js (exit 1, 1.5s): "retained neutrality
    proof covers the current Game/controller/harness inputs" FAIL —
    same stale-proof family, pre-existing.
  - test-phone-frame-proof.js (exit 1, 3.1s): retained browser inputs
    stale — index.html + 5 data files (alienPlayers, build-notes,
    foreignSpeech, regions, statusEffects) — none touched by this
    merge (src delta is game.js +13 only). Pre-existing staleness
    from other loops' landings.
- No failure is attributable to the KILLBUNDLE lever (+13 lines,
  env-gated, off unless KILLBUNDLE=1; proof test 12/12 + selftest
  17/17 green on the rebased tip). No failure was waived; the stale
  proofs are owned by their existing follow-ups (proof refresh,
  phone-frame receipt refresh), not this run.

## Infrastructure notes

- VM restarted ~22:24Z (uptime 1 min) mid-run: killed the pre-flight
  reap session (no output, no effect — re-run after restart, exit 0).
  Write probe OK before and after.
- The round-record worktree registration took ~17 min (107k-file
  checkout under contention with two check.js runs). The 1630Z
  adoption hit the same checkout failure and re-added with
  --no-checkout; this run waited it out instead. Registry lock was
  legitimately held by the playtest loop's concurrent
  journey2-endgame registration (heartbeat skipped once, retried
  at release).
- safe-commit index clobber struck twice this run (killloot repair +
  closeout commit) — same repair, verified each time. The commit was
  always correct; only the main index lied.
- No write flap observed this run (probe OK; all writes verified by
  size/hash after writing).

## Village assessment (plain words)

Both arms were about getting the village a gun it can actually fire.
The tier-4 gate opened a little wider and the village still came home
empty-handed most of the time — the lottery after the gate is the
wall now, not the gate. The kill-loot fix is built and proven in the
workshop, but in eight villages no monster ever dropped a gun for a
villager to pick up, so nobody knows yet whether the fix changes a
real fight. Nobody reached national, nobody won, nobody sat at the
table — the scale wall stands exactly where the morning's runs left
it. What changed is the map of the wall: supply is now measured end
to end (grants → gate → pool → kill-loot), and the next blanks are
named below instead of guessed.

## Convergence state

- scale-onramp: CONVERGING, NOT converged. Gun supply is now
  measured end to end; the binding constraint has moved from the
  tier-4 gate to the tier-4 pool draw (grants 5 → 2 while rolls rose),
  and the kill-loot door is proven but unjudged (0 arrivals).
  National/table/wins remain 0 on every leg of every band this run.
- Next blanks, in order: (1) corpse-cap gun sink (finding #2635
  follow-up — still open; the vanish question is closed, the sink
  census is not); (2) tier-4 pool lever — widen eligibility or weight
  the pool toward guns for holderless villages (#2647, #2648, a
  design question: more extreme contests / earlier apex); (3)
  kill-loot bundle re-judge — 16-seed band or forced-arrival
  fixture (#2649); (4) shelterdraft re-judgment priced from control
  (deferred — low value).
- food-economy stays converging (untouched; sibling B loop).
  winnability-chain stays converging (untouched; sibling loop B).

## Merges (all ff-only, exit 0, verified in git log)

- `17fdf1369` sim-tier4access-a (NO-GO, evidence-only, 0 src delta)
- `d1b71a8f6` sim-killlootbundle-a (INCONCLUSIVE, lever kept
  env-gated OFF, +13 game.js)
- This record: branch `sim-2215record-a` (see below).

## Run identity

- Lock: fleshout-20261121T2215Z (created 2026-11-21T22:21:12Z).
  Claim: hidden_files/lever-claims/fleshout-20261121T2215Z.json.
  2015Z claim retired to .DEAD with note.
- Evidence: evidence/2026-11-21/sim-tier4access-a.md (+ prereg),
  evidence/2026-11-21/sim-killlootbundle-a.md (+ prereg).
- Findings appended to hidden_files/sim-findings.md: #2647, #2648,
  #2649 (all [open]).
- Telemetry: 3 LOUD lines per leg, explained regime artifact,
  baseline NOT rolled.
- Merged locally, pending ship. No version bump, no push, no live
  verification — the ship loop owns those.
