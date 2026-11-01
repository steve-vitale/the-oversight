# sim-patrolsched-b — PATROL-SCHEDULE LEVER COMPARISON (verdict: PATROLSCHED GO)

Run: oversight-flesh-out-loop-b, arm sim-patrolsched-b,
run fleshout-loop-b-20261101T0435Z, axis food-economy.
Worktree sim-patrolsched-b, branch sim-patrolsched-b,
base e6a1351c7a407e99032f5a29dc0d35e13b828b64.
Prereg: evidence/2026-11-01/sim-patrolsched-b-prereg.md,
committed BEFORE any judged leg (commit b9fe2e624).
Compare: evidence/2026-11-01/sim-patrolsched-b-compare.md
(attached; matched-seed census, NOT a balance-panel
result — see §15 declaration in the prereg).
Status to coordinator: committed on branch
sim-patrolsched-b, pending coordinator merge. No push,
no bump, no live verification.

## Lever played

ONE schedule change, nothing else. Baseline P3
(deed-seeking): patrols on day % 7 in [1, 3, 5]
(3x/week). Variant deed-weekly (new file
scripts/policies/deed-weekly.js): patrols on day % 7
in [1] only (1x/week, same weekday alignment).
Same competent base, same farthest-first up-to-4
patrol, same 40% kcal gate, same once-per-day
guard, same keepsake surge, same NO evening return
step. Both legs run through the new driver
scripts/patrolsched-trace-b.js (absencehunt driver
copy; diff verified: only the POLICY set, base
construction, header, and log prefixes differ).
Zero src/js changes, zero edits to existing files.

## Verdict, judged against the prereg bars

- (a) INSTRUMENT GATE: PASS. All 48 judged legs
  errs 0, decisions == evenings (30/30 each),
  gateOk 24/24 per policy.
- (b) AWAY-SHARE MOVE: PASS. Pooled away share
  66.3% P3 (477/720) vs 42.1% weekly (303/720) —
  a drop of 24.2 points, above the 15-point bar.
  Per-band drops: pilot -26.7 points (65.4% ->
  38.8%), confirm -22.9 points (66.7% -> 43.8%).
  The pilot gate (drop >= 10 points) passed on the
  pilot alone, which is what earned the confirm.
- (c) COST GUARDRAILS: PASS with zero margin
  consumed. Mean daysAlive 30.0 on both policies;
  game-over legs 0 vs 0; every leg survived the
  window. Starvation deaths inside the legs fall
  (16 P3 -> 7 weekly) rather than rise — staying
  home more did not starve the village on this band.
- (d) CLASSIFICATION COMPLETENESS: PASS. 100% on
  both policies (0 UNCLASSIFIED evenings of 780
  away evenings total).
- (e) SENSE PASS: PASS. One patrol-departure episode
  read end to end below, with quotes.

VERDICT: PATROLSCHED GO. The patrol schedule is a
live lever on the away calendar: cutting patrol
cadence from 3x/week to 1x/week moves the away
share down by ~24 points on identical seeds, at no
measured survival cost in a 30-day window. A GO
here authorizes no src/js change and no default
change by itself — landing (including the honest
parameterized-deedPatrol shape named in the variant
file's header) is the coordinator's / Steve's call.

## Before/after numbers (identical seeds, 30d death-aware horizons)

Pooled (B1+B2, 24 legs each): P3 477 away / 720
evenings (66.3%), 120 episodes, mean episode 3.98
days; weekly 303 away / 720 (42.1%), 84 episodes,
mean episode 3.61 days. Episodes fall by 36 and
away evenings by 174 — the weekly leg removes whole
away episodes, and the episodes that remain are
slightly shorter. Per-seed: 23 of 24 seeds drop,
none rises; the exception is 17579, 0 away evenings
on both policies (the no-away seed). The largest
single-seed drops are 17571 (14 -> 3) and 17567 /
17575 / 17576 (each -10).

Mechanism check: on the weekly leg, patrol-delta
away evenings number exactly 84 — one per episode.
The weekly patrol fires once per away episode and
never twice, which is the designed behavior: one
departure day per week creates at most one new
away episode per week, and the multi-day stay that
follows is the competent day's own foraging/work,
not further patrols.

## Reachability verdict

Waves 1-3 are reached in this 30-day window on both
policies (maxWaveUnlocked: P3 wave 2 on 19/24 legs,
wave 3 on 1; weekly wave 2 on 19/24, wave 3 on 2;
wave kills wave 1: 156 P3 / 168 weekly, wave 2: 25
each). Waves 4-5, Arc II/III/IV, regional ->
national, the table, and the win flag are NOT
reached in a 30-day pre-seat window on either
policy — expected, and not a finding against the
lever: this window cannot reach them, and the arm
does not claim otherwise. Vests: not exercised
here. The lever's reachability claim is narrower
and is met: the away-evening calendar itself is
reachable and movable by a policy-side schedule
change, with the full away-evening taxonomy (tile,
start, end-cause, return story, episode) intact
on the variant leg.

## Village assessment, in plain words

On the 3x/week schedule, the village lives out of
doors two nights in three: the scholar goes out on
patrol, then stays out foraging and working for
three or four days, and either walks home in
daytime (51 of 120 episodes) or dies out there and
is replaced (53 of 120). On the 1x/week schedule,
the village sleeps at home more than half the
nights (58% haven evenings vs 34% before), goes
out on fewer, slightly shorter stays, and still
walks home or dies out there in the same proportions
— the shape of an away stay does not change, only
how often one starts. Nobody starves for staying
home: the village's food deaths actually fall, and
every village survives the month on both schedules.
What the weekly village gives up is away ground:
grove away evenings vanish entirely (24 -> 0) and
creek away evenings fall by a third (122 -> 81) —
fewer patrols mean fewer different places slept in,
not just fewer nights out. The one seed that never
leaves home on either schedule (17579) is a
reminder that the schedule only matters when the
villager is in a position to go: a homebound month
stays homebound at any cadence.

## Villager behavior sample (SENSE-TESTING LAW)

Also sampled generally: villagers forage, gossip by
the fire ("You catch fragments by the fire — Marcus
telling Sigrun about Henok. It's barely the same
story now. That's what fires do."), make snares,
gain abilities mid-stay, and react to monsters with
named warnings ("Do NOT grab this one. The beak is
real."). Nothing robotic or repeated beyond the
game's own repeated travel/forage narration, which
is the day's work, not a blank. One wrinkle, filed
below: patrol departures carry no narration of
their own.

## Sense read: a patrol departure, end to end

Weekly leg, seed 17567, vessel gen_sot07m4. The
patrol fires on game day 8 (day % 7 == 1; day 1's
patrol was kcal-gated). Day 8's lines show the
departure as travel, not as a named patrol — the
villager walks grove to grove, notes "Bark stripped
at deer height on a young hickory — teeth, winter,
hunger," gains Green Thumb ("The plants lean toward
you. They're gossiping."), eats, and ends the day
at a creek tile ("Travel 2 tiles to creek." /
"✅ You saw the creek. Benoit nods. 'Good. Now we
know.'"). Days 9-16 she stays at the creek and
grove, foraging ("You work the patch: 5× White Oak
Acorns"), making a snare ("You make a Snare. a loop
of vine on a bent stick."), catching fireside
gossip, meeting a Lockpick at the treeline ("The
Lockpick stops at the treeline — pacing, unwilling.
The walls end the argument."). Day 17 the vessel
changes: gen_sot07m4 dies in the wild (weekly
deaths list: "gen_sot07m4, cause the wild, day 17,
player true") and the successor gen_qcneun4 wakes
at haven — the census correctly ends the 9-day
episode by SUCCESSION, not by a walk home, even
though day 17's own lines include a walk-home
narration ("Haven. 10 days. ... 'Knew you'd walk
back in. You always do.'") spoken on the
successor's day. Judgment: the record reads as a
person on a long foraging stay that ends in death,
not as bookkeeping — with one honest gap: no line
ever says "you set out on patrol." The departure
is visible only through travel lines plus the
ctx patrol counter. A player watching this stay
would see a villager go out and not come back, and
would not be told it was a patrol. That gap is
filed as a finding (below), not hidden: it does
not change the census numbers, but it means the
lever's in-game legibility is weaker than its
measured effect.

## Blanks filled or documented

- FILLED (measured, GO): the awayeve carried doubt —
  does varying the patrol schedule move the away
  calendar? YES, by ~24 points for 3x -> 1x/week,
  at no measured survival cost in 30 days. The
  sim-findings backlog item "PATROL-SCHEDULE LEVER
  COMPARISON CANDIDATE" is marked fixed on this
  evidence.
- DOCUMENTED (finding, not a fix): patrol
  departures are unnarrated — deedPatrol travels
  and forages with no "setting out on patrol"
  line, so the away calendar's main driver is
  invisible in the transcript. Appended to
  sim-findings.md as an open item (patrol
  narration). No code change made for it here:
  narration wording is a design surface, and this
  arm's scope is the schedule measurement.
- DOCUMENTED (no change): 17579 ends 0 evenings
  away on both policies — a homebound seed at any
  cadence. Not a bug claim; the schedule lever
  cannot create away evenings where the villager
  never goes out.
- DOCUMENTED (method note): matched seeds are not
  matched trajectories — the variant changes RNG
  consumption from the first divergent patrol day,
  so the 24.2-point difference is a policy
  contrast on identical seeds, not a pure "patrols
  created N evenings" count (awayeve causal read
  §1 applies). The per-seed unanimity (23 drops,
  0 rises) is what makes the direction trustworthy
  despite the divergence.

## Wall numbers (as LAST MEASURED — not measured here)

National reach, table reach, and wins were NOT
measured in this arm: a 30-day pre-seat census
cannot reach them, and fabricating them would be
inventing data. Reported as not measured. What
this arm did measure as wall context: wave 2
reached on 19/24 legs per policy, wave 3 on 1-2
legs, waves 4-5 on none — consistent with a
pre-seat window, not a wall verdict.

## Metric review

- The 15-point bar (one quarter of awayeve's
  60.2-point P3-vs-BARE gap) proved well-sized:
  the pooled drop (24.2) clears it on both bands
  separately (pilot 26.7, confirm 22.9), so the
  verdict does not rest on pooling.
- The cost guardrails passed with zero margin
  consumed (0 game-over legs either side), which
  means they did not discriminate on this band.
  A future schedule arm on a harsher band (a
  band with village deaths, like awayeve's 17549)
  would test the guardrails properly; on this
  all-survived band they are a pass, not proof
  that schedule changes are cost-free in general.
- The episode-end mix shifted (WALK-HOME 51/120
  P3 -> 20/84 weekly; HORIZON 16 -> 23) without
  any bar judging it. If a future arm wants to
  claim "weekly villagers come home more," it
  must pre-register an episode-end bar — on this
  evidence the walk-home RATE falls while the
  horizon rate rises, because fewer, later
  episodes are still open at day 30.
- No metric was re-scored mid-run. The pilot
  gate, the 15-point bar, and the guardrails are
  as written in the prereg.

## Proof section

- Pure proof test scripts/test-patrolsched-b.js:
  PASS (day set exactly [1] vs deed-seeking's
  [1,3,5]; stub-Game patrol fires only on
  day%7==1, farthest-first, forage each,
  once-per-day guard, kcal gate; reused
  classifiers give no-return-step + walked-home-
  next-day). Run before the prereg commit.
- Instrument gate: 48/48 judged legs gateOk.
- Analyzer: scripts/analyze-awayeve-b.js reused
  verbatim on all six corpora (pilot, confirm,
  pooled per policy); completeness 1.0, 0
  UNCLASSIFIED.
- Driver equivalence: diff of
  scripts/patrolsched-trace-b.js against
  scripts/absencehunt-trace-b.js shows ONLY the
  POLICY set, base construction, header, and log
  prefixes changed.
- Index-clobber note (infrastructure, not a
  result): the prereg commit via safe-commit.sh
  left the worktree index showing the four new
  files as staged deletions (the known
  safe-commit index-clobber class). The commit
  itself was verified correct (git show --stat,
  worktree blobs byte-identical to HEAD blobs)
  and the index was repaired with
  git update-index --cacheinfo per committed blob;
  post-repair git status is empty. No work was
  lost and no sibling file was touched.
- No jest run was required by this arm's scope
  (no src/js change, no game-behavior change
  outside a new policy file exercised by the
  judged legs themselves); the harness legs are
  the measurement.

## File list

- evidence/2026-11-01/sim-patrolsched-b-prereg.md
  (committed before judged legs, b9fe2e624)
- evidence/2026-11-01/sim-patrolsched-b.md (this file)
- evidence/2026-11-01/sim-patrolsched-b-compare.md
- scripts/policies/deed-weekly.js (variant policy)
- scripts/patrolsched-trace-b.js (driver variant)
- scripts/test-patrolsched-b.js (pure proof, PASS)
- evidence/2026-11-01/sim-patrolsched-b-census-pilot-p3-30d.json
- evidence/2026-11-01/sim-patrolsched-b-census-pilot-weekly-30d.json
- evidence/2026-11-01/sim-patrolsched-b-census-confirm-p3-30d.json
- evidence/2026-11-01/sim-patrolsched-b-census-confirm-weekly-30d.json
- evidence/2026-11-01/sim-patrolsched-b-census-pooled-p3-30d.json
- evidence/2026-11-01/sim-patrolsched-b-census-pooled-weekly-30d.json
- evidence/2026-11-01/sim-patrolsched-b-corpus-pilot-p3-30d/ (8 files)
- evidence/2026-11-01/sim-patrolsched-b-corpus-pilot-weekly-30d/ (8 files)
- evidence/2026-11-01/sim-patrolsched-b-corpus-confirm-p3-30d/ (16 files)
- evidence/2026-11-01/sim-patrolsched-b-corpus-confirm-weekly-30d/ (16 files)
- evidence/2026-11-01/sim-patrolsched-b-corpus-pooled-p3-30d/ (24 files)
- evidence/2026-11-01/sim-patrolsched-b-corpus-pooled-weekly-30d/ (24 files)
- evidence/2026-11-01/sim-patrolsched-b-pilot-p3.stderr.log
- evidence/2026-11-01/sim-patrolsched-b-pilot-weekly.stderr.log
- evidence/2026-11-01/sim-patrolsched-b-confirm-p3.stderr.log
- evidence/2026-11-01/sim-patrolsched-b-confirm-weekly.stderr.log
- (no .jsonl leftovers: split inputs deleted after split)
