# sim-abandonspeak-b — abandonment narration: GO (pilot)

Run: oversight-flesh-out-loop-b, arm sim-abandonspeak-b (Loop B,
food-economy axis, run fleshout-loop-b-20261102T153648Z).
Worktree sim-abandonspeak-b, branch sim-abandonspeak-b.
Prereg: evidence/2026-11-02/sim-abandonspeak-b-prereg.md
(committed ee223add6 BEFORE any judged sim). Instruments:
scripts/test-abandonspeak-b.js (new), scripts/analyze-abandonspeak-b.js
(new), driver scripts/vetobudget-confirm-b-driver.js (unchanged).
Proof: test-abandonspeak-b 15/15 (new), test-vetobudget-b 27/27
(re-run), test-vetobudget-qual-b 11/11 (re-run),
test-vetobudget-confirm-b 14/14 (re-run).
Convergence state: GO on the pilot band — see the deviation note
below; the verdict rests on the fresh-baseline comparison, with
thresholds unchanged from the prereg.

## The change (minimal, as preregistered)

scripts/policies/competent-vetobudget-b.js ONLY (+22/-2 lines):
at the single site where a step is added to vetobudgetAbandoned,
the budget wrapper now calls Game.say once with the fixed line:
"You stop trying that way — it has turned you back again and
again, and you will not spend another day on a road that will
not open."
N stays 3, no guard default flips, no new guard behavior, no
suppression change, no budget reset change. Suppressed attempts
stay silent. The say call is try/catch-wrapped so narration can
never break travel. Zero src/js changes (the budget is a
policy-side instrument; Game.say is the game's own narration
hook — the exact hook the guard uses for its veto line — so this
is the speakable form, not a harness-only print).

## Prereg deviation, stated plainly (thresholds unchanged, baseline leg replaced)

The prereg named the 1505Z guard+budget leg as the reused
baseline. That reuse FAILED on first contact and was replaced,
not re-scored: the narration leg diverged from the 1505Z leg on
loopDay 1 on most seeds (e.g. 67501 day-1 pantry 38,630 -> 39,540
with identical scholar position/kcal), before any veto or
abandonment could occur — and seed 67501 carries ZERO
abandonments on either leg, yet still diverges, which proves the
difference is substrate, not narration (the narration code path
never executes on 67501). The 1505Z sims ran pre-rebase; the
branch was rebased before merging, and the substrate moved
underneath (same class as the homeward shapes prototype loss to
journey landing r72, which sits between the 1505Z sims and this
branch's tip). The honest repair, with thresholds untouched: a
FRESH baseline leg on the current tree (policy file stashed to
its pristine committed state, same driver, same env, same seeds
67501-67508), judged against the narration leg. Every number
below is fresh-baseline vs narration on identical seeds and one
shared substrate. The 1505Z leg is retained in the worktree as
corroborating history only and contributes no judged number.

## Pilot (judged band 67501-67508, 60d, guard+budget vs guard+budget+narration)

| Seed | Abandon | Spoken | sayLines base->narr | Diff confined | Deaths | Haul | Away | Attempts | Identity div |
|---|---|---|---|---|---|---|---|---|---|
| 67501 | 0 | — | 5634->5634 | YES | 44->44 | 240.4->240.4 | 3->3 | 145->145 | 0 |
| 67502 | 0 | — | 5248->5248 | YES | 36->36 | 438.1->438.1 | 0->0 | 100->100 | 0 |
| 67503 | 0 | — | 5422->5422 | YES | 44->44 | 315.2->315.2 | 0->0 | 130->130 | 0 |
| 67504 | 0 | — | 4920->4920 | YES | 32->32 | 138.1->138.1 | 11->11 | 133->133 | 0 |
| 67505 | 1 | 1 | 5532->5533 | YES (+1) | 32->32 | 245.0->245.0 | 8->8 | 113->113 | 0 |
| 67506 | 0 | — | 4640->4640 | YES | 24->24 | 135.0->135.0 | 0->0 | 114->114 | 0 |
| 67507 | 0 | — | 5184->5184 | YES | 32->32 | 276.0->276.0 | 0->0 | 125->125 | 0 |
| 67508 | 0 | — | 3099->3099 | YES | 25->25 | 91.9->91.9 | 4->4 | 83->83 | 0 |

PRIMARY: 1/1 abandonment events spoken = 100% (GO bar met).
NOHARM (band): median survival 60->60d (1.000x), deaths 269->269
(1.000x), mean daily haul sum 1879.7->1879.7 (1.000x), away
26->26 (1.000x, and <= baseline+2), forageTrips 943->943
(1.000x). All within the preregistered 0.95x-1.05x band — in fact
exactly 1.000x everywhere, as expected for a say-only change.
SAYLINES DIFF: confined on all 8 seeds — the narration sequence
equals the baseline sequence with ONLY the abandonment line
inserted (one insertion, on 67505; zero elsewhere). IDENTITY:
0 divergent per-seed per-loopDay snapshots (pos, scholar kcal,
pantry kcal, roster count + id set) on all seeds. The pilot GO
conditions (a)-(d) all hold. Per the prereg, no 12-16 seed
confirm is pre-committed: the pilot band already carries the
judged abandonment and the effect is exactly one inserted line
with zero trajectory change, so a confirm would re-prove
identity, not the narration. The extra screening band
(67601-67608) was NOT spent — the pilot band carried an
abandonment, so the DIAG-NO-BAND branch never triggered.

## The one abandonment, in its story (seed 67505, step 1,3->1,2)

Day 9: first veto of the destination speaks ("You don't walk
there — you couldn't get home from there."). Days 13, 14, 15:
three silent vetoes on the same step. Day 15, the 3rd silent
veto abandons the step, and the line speaks (say seq 1347,
scholar day 15), in stream context:
"You wait. The light changes. Nothing asks anything of you."
"You stop trying that way — it has turned you back again and
again, and you will not spend another day on a road that will
not open."
"Travel 1 tile to creek."
Day 16 brings one suppression (the step is tried once more and
silently refused — no second line, as designed). The scholar
ends day 15 away at (1,3) on 143 kcal, day 16 still away on 13
kcal, and walks home day 17 (ends (4,4), 1,965 kcal) while the
village pantry climbs 38,211 -> 61,469 kcal across days 9-16.
Sense judgment: the line reads as a decision, not a rescue —
it does not pretend the scholar is safe, it names the repeated
refusal and the choice to stop spending days on it, in the same
second-person voice as the guard's veto line, with no mechanism
words, counts, or coordinates. It lands mid-journey, not as a
dawn announcement, which fits a decision made on the road. The
one wording risk — "that way" without naming the road — is the
right trade: the game never names tiles to the player, and the
line follows the refused attempt closely enough to be
unambiguous in context.

## Village assessment (plain words)

Eight villages, and the narration changes nothing about any of
them — that is the point. 67505 is the village that learns to
quit: rich pantry, a scholar who spends a week hammering one
shut road, then says so out loud and walks home. 67504 dies
day 56 and 67508 dies day 32 on both legs, identically — combat
and wound attrition, not the narration (both legs agree to the
death). 67501 reaches wave 4 on both legs. Nothing robotic,
static, or repeated was flagged beyond the already-known
silence this arm fills: on the fresh substrate, the only
remaining unspoken abandonment-shaped event is none — the one
abandonment that happened was spoken.

## Wall numbers (60d driver, in-window only, never pooled)

national / table / wins 0 both legs (expected 60-day pre-seat
profile); median survival 60d both; wave 4 unlocked on 1 seed
(67501, both legs, unchanged), wave 5 unlocked 0, wave 5 fought
0, full seat 0. No wall movement is shown or claimed: this pilot
measures narration, not the scale wall.

## Balanced panel (section 15, context never verdict)

Combined campaign: `node scripts/balance-panel.js --out
/tmp/abandonspeak-b-panel --policies
competent-homewardstep-b,competent-vetobudget-b --seeds
67501,...,67508 --days 60 --par 4` — 16 cases, 0 reused,
sourcesStable true, neutrality matched (0 warnings). Per-seed
panel rows are IDENTICAL between guard and guard+budget+narration
legs (won/national/table 0, waveReach and deaths identical per
seed). Panel rows are context, never verdict, and must not be
pooled with driver bars — same substrate caveat class as the
1505Z run (panel deaths differ from driver deaths, e.g. 67501:
panel 36 vs driver 44). Raw panel archived as
evidence/2026-11-02/sim-abandonspeak-b-panel.json.gz (+ .log).
No panel compare is claimed: the combined campaign is the valid
panel artifact for a policy-split arm.

## Verdict: GO (pilot)

- PRIMARY 100%: the single abandonment on the pilot band is
  spoken exactly once, on its own day, with no repeats.
- NO-HARM at 1.000x on every bar, 0 identity divergences, and a
  sayLines diff confined to the one new line: narration is
  behavior-neutral, as designed.
- RECOMMENDATION TO COORDINATOR: the abandonment narration is
  done at pilot strength. No confirm spend is owed (the effect
  is one inserted line with zero trajectory change; a confirm
  would re-prove identity). If the veto budget ever moves from
  policy instrument into src/js game code, the ABANDON_LINE call
  site ports verbatim — the hook (Game.say at the abandonment
  mark) is already the game's own narration hook.

## Metric review (for the NEXT run, never a re-score)

- Reused-baseline legs are FRAGILE across rebases: the 1505Z
  leg's numbers did not survive to this branch's tip, and the
  failure announced itself only as day-1 pantry divergence.
  Future preregs on this loop should default to fresh both legs
  on the current tip when the baseline leg predates any rebase
  of the worker branch — or state the rebase boundary explicitly
  and verify day-1 identity before spending a full band.
- The day-1 identity check is cheap and decisive: a zero-
  abandonment seed (67501) diverging on day 1 isolates substrate
  from treatment with no extra run. Keep it as the first check
  whenever a reused leg looks off.
- The pilot's single abandonment is thin by count but complete
  by design: exactly-one-line, day-matched, diff-confined, and
  identity-clean is the whole claim for a narration arm. A
  confirm band would add abandonment count, not claim strength,
  unless the line text itself were being varied.
- Out-of-arm gap surfaced, NOT chased (findings backlog format,
  for the coordinator to append):
  `- [open] 2026-11-02 — reused-baseline substrate — 1505Z
  guard+budget leg numbers do not reproduce on the rebased tip
  (day-1 pantry divergence, 67501: 38,630 -> 39,540; 67502
  abandonment present at 1505Z, absent on the fresh substrate)
  (sim-abandonspeak-b evidence).`

## Corpora

- evidence/2026-11-02/sim-abandonspeak-b-prereg.md
- evidence/2026-11-02/sim-abandonspeak-b.md (this file)
- evidence/2026-11-02/sim-abandonspeak-b-pilot-baseline.jsonl (+ .log)
- evidence/2026-11-02/sim-abandonspeak-b-pilot-narration.jsonl (+ .log)
- evidence/2026-11-02/sim-abandonspeak-b-pilot-analysis.txt
- evidence/2026-11-02/sim-abandonspeak-b-panel.json.gz (+ .log)
- scripts/test-abandonspeak-b.js, scripts/analyze-abandonspeak-b.js
- scripts/policies/competent-vetobudget-b.js (the change)
