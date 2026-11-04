# Food-economy round 1647 — coordinator evidence (run fleshout-20261104T1647Z)

Axis: food-economy (second non-converged axis). Scale-onramp was live-claimed
by sibling Loop B at run start (claim fleshout-loop-b-20261104T1434Z, arms
sim-tendfloor-guard-b + sim-tendseason-b) and was NOT touched. Loop B's claim
closed mid-run (its tendfloor-guard adoption landed on master as e20ba529c
while this run's arms were landing); nothing of Loop B's was touched at any
point. Rotation file reads 3 (villager agency) and was NOT advanced: the
convergence-directed plan overrides the rotation, and this run worked the
topmost non-converged unclaimed axis.

Pre-registration: each arm's binding prereg was committed before any judged
sim (exphurt-confirm c520c97a4, bankretain aa8ebd29, both rebased with all
commits replayed exactly once). No gate, price, deed bar, or win price changed
in either arm. No push, no version bump, no live verification (ship loop owns
deploys). Merged locally, pending ship.

## Stale-lock recovery first (previous Loop A run 1445Z)

The run started on a dead predecessor: lock fleshout-loop.lock from 1445Z
(~2h old, past the 90-minute fallback), its claim still present, its arms
already on master, its coordinator evidence file written 16:42Z but never
committed, its tracker entry never written, its claim/lock never deleted —
the coordinator died after writing the evidence. Recovery, per the loop
closeout playbook: orphan evidence committed on its own branch and merged
ff-only (317022b9c; safe-commit index clobber repaired from the HEAD blob,
tree verified clean), the 1445Z claim retired to .DEAD with a note, the stale
lock deleted. The 1445Z tracker entry is appended below with this run's
entry, since the 1445Z coordinator never wrote it. Sibling Loop B's claim
was NOT touched during recovery.

## Arm 1 — sim-exphurt-confirm-a: INSUFFICIENT-DATA (hook neither confirmed nor killed)

Question: findings backlog EXPHURT DISCONNECT (1445Z arm sim-exphurt-a left
the drafted hurt-clause spec at SPEC-READY-minus-N: 6 expedition cases vs
gate 8, M1 0/5, D 1/6). Verdict: INSUFFICIENT-DATA (§14a sample failure).
No game-code change, nothing player-facing, no [needs-eyes] commit.

- Confirm band 99917–99932 (fresh, 16 seeds), competent policy, 100d
  death-aware cap, PLENTYDEPRI=1, DEPOSITGATE=1, event-based instrument
  (hurt events, not dawn samples, per finding #1697).
- Staged gate: HALF 1 (99917–99924) needed 8 seeds complete + 0 errors +
  0 unclassified + expedition cases ≥ 4. Judged: 8 complete, 0 errors,
  0 unclassified, expedition cases 2 → gate missed → HALF 2 NOT run per
  binding prereg. Pooled-16 bars unreachable and not claimed.
- Descriptive only (denominator bars not reached): D-open 1/2, D-last 1/2,
  M1 0/2, M1-all 0/2, M2 2/2, M3 2/2. Latency 1 part on both hurt expedition
  returns (hurthome fix holds, third confirmation running).
- Sense test (both pairs quoted in arm evidence): Sung s99920 (hp 5) and
  Ruby s99920 (hp 6) each get a hurt line followed instantly by a haul /
  stories / scar celebration that never carries the hurt — directional
  support for the spec, not a confirmation (N=2).
- No §15 panel file, deliberately: prereg declared the panel driver
  inapplicable (it cannot ingest event-case corpora).
- Proof re-run green by the coordinator after rebase onto master:
  test-exphurt-confirm-a.js 19/19, test-exphurt-a.js 21/21.
- Wall (diag corpus, stated plainly): median daysAlive 94; survived 2/8;
  wave 4 on 5/8, wave 3 on 2/8, wave 2 on 1/8, wave 5 on 0/8; national /
  table / wins 0/8, rank village on all 8.
- Commits (rebased): 537187bbb prereg, 2ea3876ea instruments,
  522ac1f8b evidence + HALF1 corpus.

## Arm 2 — sim-bankretain-a: INSUFFICIENT-DATA (substrate missing)

Question: the 1445Z bankfood arm's single censored case — one known-edible
bank (15003, loop-day 30, 195 kcal Blackberry) with no following morning.
Verdict: INSUFFICIENT-DATA (§14a SUBSTRATE-MISSING). No game-code change.
In-stack edible-bank retention remains OPEN.

- Prereg: primary metric = share of judged known-edible bank events
  (bank adds edible-now food AND a following morning in-stack) retained at
  the true post-sleep morning (first-upkeep snapshot); judge bar ≥ 3 judged
  events; 60d death-aware horizon (chosen because the prior 30d horizon
  censored the only edible bank); pilot 8 seeds + pre-registered 16-seed
  expansion. Reused bankfood's diag policy + trace driver unchanged.
- Pilot yielded 0 judged, so the pre-registered expansion fired (added
  15337, 15439, 16501–16506) before any judging. Combined 16-seed result,
  both legs: 0 judged, 1 censored. The single bank-added edible event in
  32 variant legs is the SAME censored event from the prior arm — 15003
  day-30 Blackberry, reproduced verbatim, still censored because the
  village dies at day 30 on all four legs (no day-31 in-stack on any leg).
  No retention claim, no vanish claim, no fix. Morning pack-eat firings on
  judged mornings: 0 (there were no judged mornings).
- Key observation (NOT a judged event, NOT re-scored — §14): seed 16505,
  loop-day 59, both legs identical: the scholar carried 540 kcal Muscadine
  Grapes into a stranded out-of-reach evening; all 540 intact at the
  first-upkeep snapshot; then morning upkeep competentEat ate them
  (scholar kcal 344 → 884) before the daily-entry morning pack-eat phase,
  which saw pack edible 0 and skipped. Morning pack-eat is shadowed twice:
  banks are lumps it cannot eat (prior arm) and upkeep eats real food
  first (this arm). The 540-kcal breakfast also leaves no narration line —
  a genuine sense gap in the upkeep-eat path.
- Guardrail deviation, investigated: seed 15376 variant legs survive 60d,
  off legs die day 49, both legs; trajectories identical through loop-day 7,
  divergence begins exactly at the first acted variant evening (loop-day 8,
  scholar 2238 vs 2310 kcal — the flip's actions cost kcal and draw RNG).
  Not instrument corruption; the prereg's whole-run survival-equality
  guardrail is unachievable for an acting variant (see metric review).
- Proof re-run green by the coordinator after rebase onto master:
  test-bankretain-b.js pure 13/13; corpus files replayed exactly with zero
  rebase conflicts, so the worker's corpus-mode result (76/77 per leg, the
  single failure being the investigated 15376 deviation) carries over
  unchanged. Corpus mode was also executed post-rebase with no failure in
  the captured tail; the definitive corpus count cited here is the
  worker's pre-rebase 76/77, not a re-claimed post-rebase count.
- Wall (60d strand census, stated plainly): median survival 60 days
  (census boundary; 11/16 seeds at 60 on guard variant); max wave unlocked
  2 on 2 seeds, 3 on 11 seeds, 4 on 3 seeds (15439, 16501, 16502); wins /
  national / table NOT read by this corpus.
- Commits (rebased): c813bc996 prereg, 26d8da013 instruments,
  49e897f21 evidence + corpora (64 files).

## Base-staleness flag (applies to both arms' census numbers)

Both arms measured on bases that predate sibling landings (exphurt-confirm
base 317022b9c; bankretain base 2d51eb51d; ability-use gamecode with NPC
skill twins and journey-endgame r128 landed after). Both branches rebased
onto master cleanly with zero file overlap, and all proof tests re-ran
green after rebase. Mechanism claims (overnight pack handling, upkeep-eat
ordering, hurt-line behavior) run through sleep/upkeep/narration code, not
field-fight code, and are unaffected. Census numbers — including the
expedition-case rate and the 0-judged count — are trajectory outcomes, and
trajectories pass through combat, so they are base-bound: they must be
re-measured on current master before anyone cites them as current. Neither
verdict is re-judged here; both INSUFFICIENT-DATA verdicts stand as claims
about their pools on their bases.

## Telemetry deviation check

Ran `node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-04/perseed-exphurt-confirm-a/*.json' --metrics
national,table,wins,exiled`. LOUD lines: national 12 → 0, table 16 → 0,
wins 16 → 0 (n=9 files). Verdict: EXPLAINED, not a regression, baseline NOT
rolled. The exphurt corpus is a 100d hurt-narration diag corpus that reads
0/8 on all three by design (rank village on all 8 seeds; it cannot reach
national/table/wins), and the bankretain corpus reads none of the three at
all. The LOUD lines are a scope mismatch between a scale-wall baseline and
diag corpora, not a game change. Same class of tooling limitation as prior
runs' recorder-corpus refusals, but here the tool ran and the mismatch is
visible rather than refused.

## Metric review (for the NEXT run)

- Expedition-case rate is unstable across bands: 0.75/seed (prior arm, 6/8)
  vs 0.25/seed (here, 2/8), pooled 0.50/seed. Next exphurt run must budget
  from the pooled rate: ~24 seeds for a D-last denominator ≥ 8, not
  16-and-hope. Gate design: staging saved HALF 2 spend, but a rate-based
  gate on a thin, variable unit will keep stopping runs — next prereg
  should use a single un-staged 24+ seed band with the gate on instrument
  health only, or keep staging with a pooled-rate bar (e.g. ≥ 3 in 8).
- D-open vs D-last agreed exactly here (1/2, same case); keep D-last judged,
  D-open for comparability. Keep the M1/M1-all/M2/M3 quartet; M1-all added
  nothing here but is the only metric that can catch the silence branch.
  Latency no longer discriminates — stop measuring it as a primary.
- Bankretain's judged-event definition was too narrow: in-stack edible food
  reaching a stranded morning is CARRIED (foraged during the competent
  day), not bank-added. Next run should define the event as "edible pack at
  a stranded evening → true morning" regardless of which phase put it
  there. Morning pack-eat needs a mechanism decision first: upkeep
  competentEat consumes edible pack food before the morning phase runs —
  next run must either record the upkeep eat as the morning meal or gate
  the phase before upkeep. Neutrality guardrail revision: equality through
  the last pre-action day + a named divergence point, plus the OFF-leg
  det-gate — not whole-run survival equality. Horizon lesson: extending the
  horizon cannot un-censor an event censored by village death on the bank
  day; future arms need a survivorship screen or mid-horizon strands.
- The ≥ 3 bar held correctly — it prevented claiming retention from the
  single carried case.

## Village assessment (plain words)

The villages in these runs mostly struggled and died on schedule: stranded
scholars spent nights away from home carrying food that survived the night
just fine, hurt fighters came home and were celebrated for their haul while
the hurt itself went unmentioned, and the morning meal got eaten silently by
the village's own upkeep before the morning pack-eat moment ever arrived.
Nobody reached beyond village standing in either corpus, and no village
faced the fifth wave. The blanks this run chased — a hurt line that names
the hurt, and proof that banked edible food survives to morning — are both
still open, but both now have sharper instruments and honest sample-size
budgets instead of another hopeful band.

## Blanks filled or documented

Filled with a game change: none. Documented: (1) exphurt spec stays DRAFT,
hook neither confirmed nor killed; (2) in-stack edible-bank retention
stays OPEN; (3) four new backlog items (upkeep-eat shadow, silent upkeep
breakfast, late strand 16505, acting-variant guardrail invalid); (4) the
1445Z recovery itself (orphan evidence + claim + lock + missing tracker
entry, all repaired this run).

## Next blanks, in order

1. EXPHURT 24-seed single band on the same instrument (scripts exist; only
   the seed band changes), gate on instrument health, judged on M1 ≤ 0.20 /
   D-last denominator ≥ 8.
2. Bank-retention re-run on current master with the redefined event
   (edible pack at a stranded evening → true morning, carried or banked)
   plus the upkeep-eat mechanism decision, to confirm the 0-judged count
   holds post-twins before any retention claim.
3. Upkeep-eat narration: a line for the silent morning meal (16505 shape).
4. Stranded-scholar narration/mechanics (backlog, out-of-reach strands):
   still open, not this run's arm.

## Convergence

food-economy stays converging (NOT converged): two arms returned
INSUFFICIENT-DATA on thin substrates, no food-economy default flipped, no
balance change landed in this run, and the (v**) deploy fraction stays
undecided (fracchoice holder still live, never duplicated).
scale-onramp untouched by this run (sibling Loop B's axis; its claim closed
mid-run on its own adoption landing).
Claim deleted; lock deleted at closeout.

## Infrastructure

- Safe-commit index clobber struck in both worktrees (and in the 1445Z
  recovery): repaired each time from HEAD blobs via `update-index --add
  --cacheinfo`; every commit verified correct via `git show`, every tree
  verified clean before removal.
- Master moved three times mid-run (journey-establishment r99,
  ability-use gamecode, journey-endgame r128, then Loop B's
  tendfloor-guard adoption e20ba529c): both arms rebased cleanly with zero
  file overlap before merging; no sibling tree, branch, claim, or landing
  was touched.
- Workers' `check.js --quick` runs reported pre-existing failures with
  truncated failure lists (exphurt: 282 passed / 8 failed, names
  unrecoverable from the piped tail; bankretain: 283 passed / 7 failed, one
  visible racks-full voice-gate test, rest truncated). Neither arm touches
  any `src/` file, so neither can have caused them — reported, never
  waived, no re-run spent for a cleaner result.
- Main tree clean at closeout (verified after both merges + branch
  deletion + reap). No push, no bump, no live verification (ship loop owns
  deploys).
