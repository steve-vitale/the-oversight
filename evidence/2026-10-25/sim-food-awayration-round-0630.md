# sim-food-awayration-round-0630 — coordinator evidence (loop B, axis food-economy)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261025T0630Z.
Axis: food-economy (converging). Loop A live on scale-onramp for the
whole run — first its 0535Z run (tollfloor + breakexcept + defendfinish,
NOT touched), then its new 0644Z run (raftdraft + deathcensus, NOT
touched). This run worked food-economy only.

## Arms

### Arm 1 — sim-c1scope-b: LANDED 6fc8d44ae (merged locally, pending ship)

Tooling only, zero src/js. The casecount analyzer's C1 freshness guard
checked the seeds a run *planned* to use (through unrun batches B3/B4),
so the legitimately-run cover-b seed 94701 looked like a collision on
a run that stopped at the B2 boundary. The fix scopes C1 to seeds the
corpus *actually ran*, read from its own per-seed filenames, reusing
that same list for the batch-boundary validation so the two can never
disagree. A planned-but-unrun seed can never fail C1 now; a real
collision still fails loudly.

Proof (coordinator-verified): RED on the old analyzer (exit 2 naming
94701, while a direct scan shows run ranges 94601–94664 vs 94701–94732
do not overlap); GREEN on the new analyzer (exit 0, verdict identical
to published CASECOUNT-GO: n = 8, shareA 8/8, all away-at-death);
negative control (doctored corpus with actually-run seed 94605) exits
2 naming 94605; planned-band case (only unrun B4 seeds) exits 0.
New proof test 16/16; existing casecount proof still 35/35; landed
corpus untouched. Rebased onto d02d91234 (journey scale r32) clean,
proof 16/16 post-rebase, merged --ff-only, ancestor verified,
tree released, branch deleted. Worker evidence:
evidence/2026-10-25/sim-c1scope-b.md.

### Arm 2 — sim-awayration-fix-b: KILLED at pilot (NO-GO), NOT merged

Game-code arm, now reverted. The fix passed `dayWant` into `packKcal`
so the dawn pack was drawn at exactly the day's shortfall, capped by
`pantryDraw` (never conjured food). Theft/intimidation/packSpend
callers kept the old formula including the hunger penalty. No
narration, no haven changes — voice is a separate blank, not bundled.

Pre-registered bars (written before sims; judged as written, §14):
pilot 8 seeds 94801–94808, competent only, 150d death-aware, identical
seeds baseline vs fix, fresh bands verified against all corpora and
dated .md files. PRIMARY: pack/need median on pack-draw days
>= 0.80. Guardrails: full-pantry away starvation deaths <= control+2;
median survival >= 0.8x control; no new death mode; wall metrics
reported, not judged. Confirm band 94809–94820 never ran — a pilot
miss ends the arm.

Pilot numbers (worker evidence evidence/2026-10-25/sim-awayration-fix-b.md
in the kill branch; coordinator verified tip has zero src/js diff):

| Metric | Baseline | Fix | Bar | Result |
|---|---|---|---|---|
| Pack/need median, pack-draw days (PRIMARY) | 0.430 (n=591) | 0.240 (n=615) | >= 0.80 | FAIL |
| Pack-draw-day capture | 1.000 | 1.000 | == 1.000 | pass |
| Full-pantry away starvation deaths | 0 | 0 | <= baseline+2 | pass |
| Median survival | 144d | 150d | >= 0.8x baseline | pass |
| Median draw pack | 893 kcal | 500 kcal | — | — |
| Away meal adequacy | 0.996 | 0.996 | — | — |
| Wall national / wins / wave-4 | 0 / 0 / 5 | 0 / 0 / 2 | reported only | — |

DIAG finding (the arm's STOP condition, met): the pool cap is NOT
the binding constraint on the typical draw day. It binds on only
67/591 baseline draw days (11.3%); on 88.7% the villager draws less
than the pack (median drawn 326 kcal vs median pack 893 kcal) —
because a draw day fires whenever dayWant > 50, and own production
already covers ~84% of need on the typical draw day, so dayWant
itself is only ~330 kcal. Sizing to dayWant therefore *shrinks* the
typical pack (893 -> 500 kcal) by construction, and a pooled-median
bar cannot judge a tail intervention. No substitute lever was
implemented. The fix band's 6 starvation deaths were all
collapse-shape (pantry 0 at death; 5 in the s94807 village collapse),
none full-pantry-away; the "new starvation cause" guardrail flag
fired only because the 8-seed baseline band contained zero
starvation deaths at all — recorded as a guardrail-design note
(next run needs a pooled baseline cause list), not used to re-score
anything. Kill record commit bc1c6830 holds the fix, scripts,
corpora, and evidence; tip bb84e7dc6 is the revert (coordinator
verified: worktree clean, `git diff acc3d6030 HEAD -- src/js/`
empty). Per kill protocol the branch is NOT merged and is deleted
at closeout; the kill is documented here and in the findings
backlog, not by landing the branch.

SENSE (SENSE-TESTING LAW): Miguel (s94801, fix corpus) ate
adequately for three straight days (1,368–1,409 kcal, drawn
1,087–1,323) while health fell 10 -> 3 and died away at 3 HP on
d111, with the haven eating "Village meal: +2200 kcal" and no line
ever naming his pack. A pack fix cannot save a traveler whose
health is already collapsing from non-food damage — the low-health
+ short-meal death shape is only half a ration story. The
away-hunger voice blank stays open.

## Wall numbers (this run's judged corpora)

Fix pilot corpora (16 configs, competent-only, expected substrate
profile, not a win-seeking run): national 0/16, table 0/16, wins
0/16, wave-5 0/16, median survival 144d baseline / 150d fix.
C1scope ran on the landed casecount corpus (measurement corpus,
not a wall run); its telemetry was already reported in the 0335Z
run and is not re-run here.

## Telemetry deviation check

Fix pilot corpora (worker-run, cited here): 3 LOUD lines, all the
known winseat-regime mismatch (national/table/wins 12–16 -> 0 on
plain competent policy with no seat instruments) — baseline NOT
rolled, no investigation item.

## Balanced panel (§15)

`balance-panel.js compare` on the sweep corpora throws the same
TypeError as cover-b (`Cannot read properties of undefined
(reading 'days')`) — the panel ingests panel.json.gz outputs, not
per-seed sweep corpora, and does not measure pack/need at all. The
sweep-compare table attached in the worker evidence is the
before/after comparison (same seeds, same instrument); the panel
failure is a tool finding (third sighting incl. cover-b), not a
verdict input. No verdict was re-scored through it.

## Infrastructure

- No container write-denial flap blocked this run. Worktree
  registration was slow (~5.5 min for both trees), not failed.
- Safe-commit index clobber hit the c1scope worker commit and both
  fix-worker commits — repaired via cacheinfo each time, commits
  verified correct before proceeding.
- Master moved under the run from sibling lanes (journey scale r32,
  loop A 0535Z coordinator evidence f7cabf52 with zero game change,
  journey landing r48) — zero file overlap with either arm.
- check.js --quick NOT re-run to green: zero src/js landed, and
  the fix worker's check run produced no output in 8+ minutes and
  was stopped — reported as incomplete, not an arm result, and no
  green-list claim is made here. The standing 280/7 pre-existing
  profile from prior runs is not re-verified in this run.
- Loop A finished its 0535Z run mid-run (all three remedy arms
  KILLED at pilot, nothing landed) and started 0644Z
  (raftdraft + deathcensus) — neither touched.

## Verdicts

- sim-c1scope-b: GO, LANDED 6fc8d44ae, merged locally pending ship.
- sim-awayration-fix-b: NO-GO, KILLED at pilot, NOT merged,
  branch deleted. The dayWant-sizing fix must not be re-landed on
  this evidence.

food-economy stays converging (NOT converged): the C1 gate is fixed
and the away-ration sizing question is settled against the
median-judged dayWant shape, but no food-economy game-code fix has
landed and the away-hunger voice blank is still open.
scale-onramp stays converging (untouched; sibling loop A).
Claim deleted; lock deleted.
