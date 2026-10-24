# sim-leanlink-round-1822 — COORDINATOR RUN EVIDENCE (fleshout-20261024T1822Z, axis scale-onramp)

**Run:** fleshout-20261024T1822Z · **Axis:** scale-onramp (standing directive — still stands:
no run has yet shown a win, and wave 5 has exactly one sighting below) · **Type:** coordinator
run — 3 arms, all landed locally, pending ship (no push, no version bump).

## Run-start closeout story (guard check, read before judging this run)

At run start (18:17Z) the lock belonged to run fleshout-20261024T1615Z (created 16:15Z).
Its claim was live but it had NO registered worktree and NO heartbeat in the registry —
per the guard, dead. While I checked, the 1615Z run's closeout finished live in front of me:
its coordinator evidence draft left the main tree, a `leanlink-evidence` worktree appeared,
a main-chat agent committed it as 01487cafe ("fleshout 1615Z coordinator evidence"), and
its lock + claim were deleted by 18:22Z. I touched nothing during that window — no lock
deletion, no claim deletion, no reap — until the closeout was verifiably complete
(master at 01487cafe, main tree clean, no lock, no live fleshout claim). The stale
1347Z claim still on disk was then retired to .DEAD (all its arms had landed:
envoyaccord, linkdrive, rerunclock adopted as 34101b3cd). Only then did I write my own
lock + claim. Lesson for the next run: a lock deleted within the last 2 minutes plus a
worktree being created at the same minute means "finishing", not "finished" — wait for
the branch deletion, not just the lock deletion.

Master moved twice under this run from sibling lanes (journey-crisis r50 69e7cd49a, a
no-game-change instrument; B-loop pantrystarve-b 678828fdd). Rescue-confirm registered
on 01487cafe, the other two arms on 69e7cd49a — the delta is tooling-only, so paired
within-arm comparisons are unaffected. Each arm rebased onto current master at landing;
proofs re-ran green after every rebase.

## Why this round: the 1615Z verdicts

- sim-leanlink (cap-3, no tend): KILLED-AT-PILOT on the median guardrail (139d vs 144.4d
  required) despite primary 3/8 national passing — the kill that motivated the measurement arm.
- sim-leanlink-rescue (cap-3, rescue-tend-only): GO CANDIDATE on pilot only (final 2/8).
  This round confirms it.
- sim-leanlink-cap5 (cap-5, no tend): GO CANDIDATE on pilot + confirm (4/8 + 4/8).
  This round holdouts it on unseen seeds.
- Open measurement questions from 1615Z (backlog lines 914–915, claimed by this run):
  end-state national misses transient realms; median guardrail vs death counts diverge.
  The measurement arm settles both.

## Arm results (all judged on their pre-registered bars, no re-scoring)

### Arm 1 — sim-leanlink-rescue-confirm: GO CONFIRMED (default-OFF only)
Commit 4d189abff (rebased from fdbc6854f; proof TEST-OK post-rebase and on master).
Evidence evidence/2026-10-24/sim-leanlink-rescue-confirm.md, corpus
perseed-leanlinkrescue-confirm/ (16 judged + 8 sensitivity + 2 sense).
- Primary PASSES with margin: final national armed 6/8 (all global) vs control 0/8
  (required ≥2/8 and > control). Ever-reached national-or-better armed 8/8 vs 0/8 —
  the pilot's threshold-edge fragility (final 2/8) is retired on this band.
- Starvation PASSES: armed 1 ≤ control 1 + 2 = 3. Median PASSES: armed 177d ≥ 144.8d
  (ratio 0.98). Spike guardrail: no candidate.
- Table armed 5/8 vs 0/8; wins 0/16 — table waiting ≠ win, as in every arm.
- Wave 5: 1 armed sighting (73513, reached with a global peak, village died day 146) —
  the FIRST wave-5 sighting in any rescue band. Control w5 0.
- Tends (ATTEMPTS): 122, all at trusts 29–39, zero at/above 40 — the rescue gate held.
  Four armed seeds reached global with ZERO tends; the heaviest-tended seed (73510,
  51 attempts) still decayed global→regional. Reach comes from proposals + accords,
  not tend volume.
- Sensitivity 73517–73520 (disclosed, never verdict-changing): final national 1/4,
  ever 2/4, table 1/4, starvation 6 vs 7 — directionally consistent.
- Sense PASS: armed 92 lines, coherent courtship arc (links days 25–27, Regional Dawn
  day 46, succession tests with FALLING tribute, First Court day 85); control 10 lines,
  zero courtship, day-90 table line naming the missing regional standing.

### Arm 2 — sim-leanlink-cap5-holdout: NO-GO on the starvation guardrail (primary passes)
Commits 36f5541ac (full changeset) + 018579d04 (empty duplicate — see infrastructure
notes; diff between them is 0 lines). Proof TEST-OK post-rebase and on master.
Evidence evidence/2026-10-24/sim-leanlink-cap5-holdout.md, corpus
perseed-leanlinkcap5-holdout/ (24 judged configs, fresh band 73521–73532).
- Primary PASSES: end-state national armed 5/12 (required ≥3/12) vs control 0/12;
  ever-reached armed 7/12 vs 0/12. The cap5 gain GENERALIZES (5/12 here vs 4/8 pilot,
  4/8 confirm) — the national effect is real, not band luck.
- Starvation guardrail FAILS by 1: armed 11 vs control 8 + 2 = 10. The breach survives
  the fairer arm-only count (6 vs 3, diff +3) — not a matched-death artifact.
- Median PASSES (151.5d ≥ 138.8d, ratio 0.873). Spike guardrail passes. Tends 0 on
  every armed row, asserted by the proof test.
- Table armed 4/12 vs 0/12; wins 0/24; waves 5: 0/24 either arm.
- Sense PASS both arms (armed 67 lines, coherent no-tend courtship; control 11 lines,
  zero courtship).
- Plain-words verdict: cap5 buys national at a starvation price that finally shows up
  on a 12-seed band. The pilot+confirm bands (3 vs 3, 3 vs 1) sat exactly at or under
  the allowance; the holdout band breaches it. Cap5 is NOT a clean general instrument —
  its GO CANDIDATE status from 1615Z does not survive the holdout. Rescue-confirm is
  now the strongest scale instrument: same national effect, no starvation breach.

### Arm 3 — sim-scalemetric: MEASUREMENT DIAG, both questions settled
Commit c70a140cc (proof TEST-OK post-merge and on master). Evidence
evidence/2026-10-24/sim-scalemetric.md, analyzer scripts/analyze-scale-costbar.js
(re-derives every number from the corpus files) + proof scripts/test-sim-scalemetric.js.
Corpora reanalyzed, no new sweeps: leanlink pilot 16, rescue pilot 16, cap5 pilot +
confirm 32, all anchor 34101b3cde24.
- Q1 end-state vs ever-reached: YES, end-state understates reach in EVERY armed band
  (leanlink 3/8 → 5/8, rescue 2/8 → 6/8, cap5 pilot 4/8 → 5/8, cap5 confirm 4/8 → 5/8;
  8 decay events catalogued). Sampled-ever is itself a lower bound: leanlink/rescue
  73502 answered national AND global beats without ever sampling above regional.
  Deciding rule going forward: report end-state AND sampled-ever AND beats-answered.
  Correction: 73505's global first touch is day 84, not day 119 (day 119 is the last
  global sample) — sim-leanlink.md's date is corrected here, not silently edited there.
- Q2 median vs death counts: village-lost is the engine game-over event (scatter /
  extinction / no-successor), never a death total — lost seeds' mean deaths ≈ survived
  seeds' in every band. Armed "fewer deaths" is exposure censoring (leanlink armed
  lived 1,147 days vs control 1,325; deaths per lived day actually higher, 0.239 vs
  0.228). Only the median separates the KILLED leanlink arm (0.770) from the GO arms
  (rescue 0.961, cap5 pilot 0.900, cap5 confirm 0.983); lost-excess, scholar, and
  death-rate all fail cap5 confirm and cannot be the bar.
- THE DECIDING COST BAR (binding for future scale arms, one sentence): GO requires
  armed starvation deaths ≤ control + 2 on totals AND on arm-only deaths, AND armed
  median survival ≥ 0.8 × control median; total-death counts, scholar-death totals,
  and deaths-per-lived-day are diagnostic only and never kill or save an arm.
  Caveat recorded: the median passes cap5 confirm while lost-excess (+3), scholar
  (+12), and death-rate (1.272) all fail there — median is insensitive to late losses,
  so future runs still report lost-count/scholar/rate as a non-binding watchlist.
- Backlog lines 914–915 marked [fixed] with the worker's exact replacement lines.

## Wall numbers (this run's judged corpora only)

- New judged configs: 40 (rescue-confirm 16 + cap5-holdout 24). Armed final national
  11/20 vs control 0/20; armed ever-reached 15/20 vs 0/20; table armed 9/20 vs 0/20;
  wins 0/40; wave 5: 1/40 (rescue-confirm 73513 only); median survival armed 151.5–177d
  vs control 173.5–181d across bands.
- Reanalyzed corpus (scalemetric): 0/64 wins, wave 5 0 — predates the rescue-confirm
  wave-5 sighting; the wave-5 wall now has exactly one crack, not a breach.
- The standing directive STANDS: national is reached only by default-OFF policy
  instruments, never by base competent play, and no arm takes the table seat. The
  tracker still records scale-onramp as converging, not converged — the directive
  lifts only when the tracker records it converged on measured evidence, and that
  has not happened. The next blank is a take-the-table policy, not a stronger
  courtship drive; second blank is a routine trust repair that isn't the tend verb
  (cooled realms have no visible way back).

## Village assessment (plain words)

Control villages stay single-fire villages: they survive or die, never link, never
hear a court. Armed villages become realms in most seeds — courts held, camera feasts
eaten, global peaks touched — and then most still die of combat attrition, not
starvation, WITH their realms. The scale wall moved in 1615Z from "never reach
national" to "reach national in half the villages"; this round sharpens it to
"reach national reliably with rescue courtship (8/8 ever on the confirm band),
hold it in the rich ones, watch it cool in the poor ones, pay a starvation price
for cap5 headroom on wide bands — and never yet convert any of it into a win."
Who thrived: rich formers that held trusts ≥ 40 through the seasons. Who died:
pantry-thin realms and combat attrition everywhere; armed villages survive the
horizon less often than controls (rescue-confirm 4/8 vs 7/8) because rank brings
exposure. Villagers act like people throughout: teaching spreads person to person,
allies send food when they hear the bins echoing, dead leaders' allies test the
new speaker by cutting tribute and saying so.

## Telemetry deviation check (§15-adjacent, run after writing evidence)

- Rescue-confirm corpus (24 files): LOUD table -62% (baseline 16 → current 6),
  LOUD wins 16 → 0.
- Cap5-holdout corpus (24 files): LOUD table -75% (baseline 16 → current 4),
  LOUD wins 16 → 0.
- Verdict: REGIME artifacts, same class as the 1630Z/1735Z runs. The baseline is a
  WINSEAT-era corpus (table/wins at ceiling by construction); these corpora are
  courtship-policy arms where the win chain is structurally absent (no take-the-table
  policy exists in any arm) and table counts are waiting-only. No bug indicated.
  Baseline NOT rolled.

## Infrastructure notes (loud, for the coordinator)

- EPERM write flap (known container class): blocked the rescue-confirm worker's
  commit for ~35 min (safe-commit /tmp idx lock write EPERM; `git hash-object -w`
  EPERM; plain shell writes fine). The worker correctly refused all bypasses. The
  coordinator committed once writes cleared (probe `echo test | git hash-object -w`
  succeeded 19:47Z), then rebased + re-proved + merged. Three sensitivity-armed
  corpus files were rebuilt from PRINT_JSON stdout during the flap (not
  byte-compared against a writer original — a post-flap deterministic re-run should
  byte-compare them; recorded in the arm's evidence).
- Safe-commit index clobber (known class, second sighting this run family): after
  the rescue-confirm commit, the worktree index showed all 34 committed files as
  staged-deleted. Repaired with `git update-index --add --cacheinfo` from HEAD blobs;
  status empty, diff HEAD empty, hashes match. The commit was always correct.
- Duplicate empty commit on the holdout branch: the worker's killed retry loop
  survived and committed first (b3c50c96); its manual commit (ee5ee89f3) landed on
  an identical tree. After rebase the pair is 36f5541ac (full) + 018579d04 (empty,
  diff 0 lines). Merged as-is rather than rewriting history; the empty commit is
  documented here, not hidden.
- Balanced panel (§15): attempted by all three arms, mechanically inapplicable in all
  three (env-gated policy arms absent from sweep-compare's POLICY_REGISTRY; the panel
  driver cannot run them). Fallback in all arms: identical-seed paired comparison
  judged by the pre-registered bar. The panel's absence changes no verdict.

## Metric review (§14 — required; revisions apply to the NEXT run, never this one)

- Metrics held: all three arms judged exactly as pre-registered; no re-scoring. The
  rescue-confirm sensitivity band was reported separately and never overturned the
  verdict. The cap5-holdout NO-GO was judged on its pre-registered guardrail even
  though its primary passed with margin — a kill with teeth, not a re-score.
- Revisions adopted for the NEXT run (from sim-scalemetric, binding): (1) GO requires
  starvation ≤ control+2 on totals AND arm-only deaths AND median ≥ 0.8× control
  median; death counts diagnostic only. (2) Report three ranks: end-state,
  sampled-ever, beats-answered. (3) Report village-lost consistency flags (last
  pantry + final roster + last-death gap) since corpora don't record which game-over
  branch fired. (4) Table splits tableWaiting vs tableDone in future runs (waiting ≠
  win — this round's 9/20 table with 0/40 wins repeats the warning).
- The median guardrail question is now SETTLED (kept binding), not open: future arms
  do not re-litigate it without new evidence.

## Convergence state

- scale-onramp: converging (not converged). Evidence this run: national reached
  reliably by a confirmed instrument (rescue 6/8 final, 8/8 ever) and generalized by
  cap5 (5/12 final, 7/12 ever) — but both are default-OFF policy instruments, cap5
  fails its holdout on starvation, and wins remain 0 everywhere. Convergence needs a
  take-the-table result or base-play national, neither of which exists yet.
- food-economy: converging (untouched by this run; sibling B loop owns it).
- Claim deleted; lock deleted. Merged locally, pending ship.
