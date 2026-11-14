# sim-winnability-round-2130 — Loop B adoption run (axis winnability chain)

Run: fleshout-loop-b-20261114T2130Z (Loop B), coordinator adoption closeout.
Axis: winnability chain. Loop A finished during this run (transplant 15E
coordinator evidence ee657bdbd, p2 + p23 both NOT-CARRIER, family 15E
closed; A's lock deleted by 22:10Z) — never touched.

## Stale-lock recovery

The 1945Z B run died mid-confirm (last heartbeat 20:45Z). Its lock was
~2h old and both its trees' heartbeats 63–83 min stale at this run's
start, so per the guard the lock was deleted, the 1945Z claim retired
to .DEAD, and this run proceeded. The 1945Z run's donatebank arm needed
nothing: its evidence-only commit cb5d47031 was already on master.

## Arms (both evidence-only — the lever does NOT land)

### sim-answercourt-b (pilot, branch ed6df749e) — GO on G2, CONTESTED by confirm
- Pilot band 100101–100108, 150d: G1 GO, G2 GO (national ever 5/8 armed
  vs 0/8 baseline; first-national days 62/88/62/89/71, all in the canon
  day 61–90 window), G3 GO, cost bar passed (starvation 1 vs 1, median
  137d vs 126.5d). 6 answers, all the lead shape, all 'feast', all sat.
- Landed evidence-only as b2f92cdf7 (25 files: evidence + prereg +
  analysis + logs + panel + 16 per-seed files). Policy/scripts stay on
  the killed branch; branch deleted after hash-verified landing.

### sim-answercourt-confirm-b (confirm, branch 6d8470a4a) — NO-GO on the cost bar ONLY
- Adopted from the stranded worktree. The confirm sweep had run all 32
  cells, but 12 existed only as 0-byte .tmp files (write-flap signature;
  the driver's writeRobust retried 480x then fell back to printing full
  JSON to stdout as @@FALLBACK blocks in the sweep log). Seed 100216 had
  in fact run both policies (the 1945Z handoff snapshot was stale).
- Recovery, verified by the adoption worker: determinism check first
  (re-ran 100209 both policies into scratch — byte-identical to the
  existing finals), then filled only the 12 broken cells, each verified
  to parse, match its sweep-log summary, AND match the @@FALLBACK JSON
  byte for byte. Final state 32/32 per-seed files, zero .tmp. One service
  restart mid-fill SIGTERM'd the worker's background script and wiped
  /tmp; resumed in foreground chunks, no data lost, no cell re-run twice.
- Verdict (recomputed by the coordinator from the analysis JSON —
  numbers agree exactly): G1 GO (0 instrument errors, 0 unattributed
  diplomacy points/steps up and down, 0 unclassified links, 60/leg;
  answerNationalChoice calls armed 15, baseline 0). G2 GO by a wide
  margin (national ever armed 13/16 vs baseline 0/16; bar ≥8/16 and
  ≤3/16; first-national days 62–74, all in canon window; end-state
  national 8/16 vs 0/16; median held-days 46 vs 28.5). G3 GO (zero
  src/js changes vs current master; proof 85/85 static, 26/26 game).
  COST BAR FAILS by one death: starvation pooled armed 6 vs baseline 3
  (bar ≤ baseline+2 = 5). Median survival passes (121.5d vs 124.5d,
  0.98×). Guardrail passes (worst seed +34% deaths, under +50%).
- Panel compare: review_required; national access 0 → 0.5; village
  deaths per 100 days regression_watch (+2.97, interval −3.44 to
  +10.41) — consistent with the cost-bar miss. The panel is the
  instrument, the prereg is the judge; nothing re-scored.
- Landed evidence-only as 57dcae043 (40 files: evidence + prereg +
  analysis + sweep log + panel + 32 per-seed files). Policy/scripts
  stay on the killed branch; branch deleted after hash-verified landing.

## What this means, in plain words

Answering the First Court works — it takes villages from 0 national to
13 of 16 on a fresh band twice the pilot's size, with the court sitting
in the right season every time. But as staged, the feast that buys the
court starved one villager too many for the bar the run wrote before
it started (6 starvation deaths against 3, bar allows 5). So the lever
does not land. The decision now sits with Steve / the main session,
per the confirm evidence: accept the cost, widen the bar on a bigger
band (the metric review proposes judging starvation on pooled 24-seed
evidence), or shape the lever (a cheaper court when the pantry is thin)
before any landing. The pilot GO stands contested on cost, not efficacy.

## The hold is now the question, not the reach

13 of 16 armed villages reached national, but 5 of the 13 dissolved
before the horizon — 100203 (held 28d) and 100212 (held 77d) dissolved
while the village lived on to day 150 and never re-climbed. New this
band: dissolution now HAS played lines (100203 d89: "The realm came
apart — no polity answers to Haven now, and Haven is a free fire
again"), closing the pilot's silent-dissolution gap where lines are
captured — but the 600-line linkLines cap hid 100212's dissolution
entirely. Two findings appended to the backlog (realms dissolve +
only-lead-shape second band). Next axis question is holding, not
reaching: what keeps a realm together after the court.

## Wall (confirm corpus, 32 configs, 150d)

National ever 13/16 armed vs 0/16 baseline; national at end 8/16 vs
0/16; table 0/0; wins 0/0; wave 4 reached 16/16 both; wave 5 reached
8/16 both; median survival 121.5d vs 124.5d; survived horizon 4/16 vs
2/16. All 15 staged beats were the lead shape (feast, all sat);
conquest/belong/covenant/trade still never staged in live play
(pilot + confirm: 21/21 lead).

## Telemetry deviation check

scripts/telemetry-check.js REFUSED the confirm corpus: all 32 rows
carry top-level anchorCommit, so they are sweep recorder rows, not
runs — "Recorder corpora are compared with sweep-compare tables,
never against a run baseline here." No LOUD lines, no baseline roll.
The refusal is the script's designed behavior for this corpus shape,
not a run failure.

## Infrastructure notes

- Safe-commit index clobber struck the adoption worker's commit;
  repaired via ls-tree -r + update-index --index-info, verified
  status empty + diff HEAD empty. No clobber on either coordinator
  evidence-only commit (both verified clean + hash-matched).
- No EPERM flap observed during this run's own writes; the 12
  zero-byte tmp files were the dead run's flap debris, recovered
  from the sweep-log fallbacks.
- Master moved once under the run (Loop A transplant 15E landings,
  zero overlap — evidence only). No push, no version bump, no live
  verification — the ship loop owns deploys.

## Next blanks (winnability chain)

1. The answercourt cost call (Steve / main session): accept the cost,
   widen the bar on a bigger band, or shape a cheaper court for thin
   pantries — before any landing. NOT taken as a next arm by this run.
2. The hold: what keeps a realm together after the court (dissolution
   + never-re-climb), now the binding question after reach is proven.
3. Competent seat-taking BUILD (Steve-call, from 1808Z).
4. Proof refresh round 18 (owed after the next manifest change).
5. Veterans survivorship lever (villager-side; design question).
6. Phone-frame receipt refresh.

## Convergence state

Winnability chain — CONVERGING on the climb (national ever 13/16 on a
fresh confirm band), NOT converged on the hold or the win. The answer
is proven; the cost is contested by one death; the hold dissolves on
5/13. Scale-onramp stays converging (Loop A's transplant program
closed family 15E with both remaining routes NOT-CARRIER). No
win-price / deed-gate / readiness changes in this run.

## Commits (master)

- `b2f92cdf7` sim-answercourt-b: evidence only (pilot GO contested)
- `57dcae043` sim-answercourt-confirm-b: evidence only (confirm NO-GO on cost)
- (this commit — coordinator round evidence)
