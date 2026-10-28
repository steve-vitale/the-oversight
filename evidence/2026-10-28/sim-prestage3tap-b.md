# sim-prestage3tap-b — the pre-stage-3 tap window isolates the inside lever's marginal value

Run: oversight-flesh-out-loop-b, arm sim-prestage3tap-b
(run fleshout-loop-b-20261028T2126Z, axis food-economy, ARM 2).
POLICY-SIDE MEASUREMENT ONLY: the insideevening policy file
already exists on the base and was NOT modified, its defaults
were NOT changed, and zero src/js changes were made. The only
new files are measurement instruments (a tap-window driver, an
analyzer, a proof test). This arm measures an existing policy
in a new window; no new lever lands from it.

## Verdict against the pre-registered bars (judged ONLY against evidence/2026-10-28/sim-prestage3tap-b-prereg.md, committed as c3ad1f13 BEFORE any judged run, and its confirm addendum evidence/2026-10-28/sim-prestage3tap-b-confirm-prereg.md, committed as 43ef11bf BEFORE any confirm run)

**GO — pilot and confirm both pass, on the same instrument,
same substrate, same bars, with the window never moved.**
In the pre-stage-3 window (loop-days 8-12) the remote fallback
essentially does not exist, and inside is the only successful
tap route. The 1930Z late window's confound is gone: there
are no remote taps to measure together with the lever.

Pilot (8 seeds 10900-10907, 30 loop-days, tap days 8-12):
P1 39/40 = 0.975 (bar 0.80), P2 40/40 taps stage < 3 = 1.00
(bar > 0.50), P3 8/8 seeds with an inside tap (bar 6),
G1 holds (median days 30 vs 30), G2 holds (starvation
policy 0 vs control 1, within control+2).
Confirm (16 fresh seeds 10910-10925, same window):
P1 71/71 = 1.00 (bar 0.80), P2 76/80 taps stage < 3 = 0.95
(bar > 0.50), P3 15/16 seeds with an inside tap (bar 12),
G1 holds (median days 30 vs 30), G2 holds (starvation
policy 2 vs control 1, within control+2).
**CONFIRM-GO — the window isolates the lever's marginal
value, as the prereg's verdict rule states.**

## The instrument (the one change from the 1930Z arm)

`scripts/prestage3tap-trace-b.js` — a copy of
`scripts/insideevening-trace-b.js` with exactly one
behavioral change: TAP DAYS ARE LOOP-DAYS 8-12
(TAPSTART=8, TAPEND=12), not the last 5 loop-days. The
run still lasts 30 loop-days, so post-tap survival to day
30 is observed on the 1930Z horizon and the guards stay
comparable. Analyzer: `scripts/analyze-prestage3tap-b.js`
(P1 pooled tap-day at-haven inside rate, P2 stage < 3
share of policy tap rows, P3 per-seed inside tap, G1/G2,
plus access x stage and outcome-class breakdowns).
Proof: `scripts/test-prestage3tap-b.js` (T1-T10, adding a
tap-window leg and a stage-recorded leg to the 1930Z
proof's legs).

## The numbers (before/after on identical seeds)

Substrate on both legs, both bands: COMPETENT_FEAST=0
SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1. Tap rows = 5 per
seed per leg (40 pilot, 80 confirm, per leg).

### Pilot (10900-10907)

Policy leg, per seed (tap-day at-haven evenings / inside /
rate / inside taps of 5): 10900-10904, 10906, 10907:
5/5 1.00, 5 inside taps; 10905: 5/5 at-haven, 4 inside
(1 walk-interrupted-combat evening on loop-day 8 — a
fight started mid-walk to the lodge; its tap was honestly
refused as mid-fight, "This needs calm and time — not in
the middle of a fight"), 4 inside taps. P1 39/40, P3 8/8.
Policy tap outcomes: 37 attempted successes from inside
(20 success-caught + 17 success-clean), 2 ownership
refusals from inside (10903 loop-days 11-12: the grant
fixture's bearer died on day 11 and the successor did not
hold the ability — "You don't have that ability"), 1
mid-fight refusal (10905 day 8). Remote taps: 0. Stages:
all 40 tap rows stage 1-2.
Control leg: 40/40 taps access 'none', all
impl-refused-hall ("The pantry is in the hall. Your hands
are not."), 0 inside taps on every seed, all stages 1-2.
All 16 pilot instances survived 30 loop-days. Starvation
deaths: policy 0, control 1 (10904 day-21 villager, not
the player-bearer).

### Confirm (10910-10925)

Policy leg, per seed (tap-day at-haven / inside / rate /
inside taps of 5): 13 seeds at 5/5 1.00 with 5 inside
taps; 10910: 2/2 1.00, 2 inside taps (its other 3 tap days
were away at forest_floor, kcal-refused — see below);
10916: 4/4 1.00, 4 inside taps (1 away tap day at
forest_floor, hall-refused); 10923: 0 at-haven tap
evenings (all 5 tap days away at grove), 0 inside taps —
the single P3 failure, same away-failure class as the
1930Z arm's failures (10701, 10714, 10720). P1 71/71
(every tap-day evening at haven ended inside), P3 15/16.
Policy tap outcomes over 80 rows: 71 inside / 9 none /
0 remote. Of the 71 inside taps: 67 attempted successes
(37 success-caught + 30 success-clean) and 4 ownership
refusals (10910 loop-days 11-12 and 10916 loop-days 11-12,
all "You don't have that ability" with ownsThiefBefore
false). Of the 9 none taps, ALL are away taps: 6
kcal-button-refused ("Running on empty — eat first.
Abilities need 500+ kcal." — 10910 days 8-10 at
forest_floor, 10923 days 10-12 at grove, kcal 0-365 at
tap time) and 3 hall-refused (10916 day 10 at
forest_floor, 10923 days 8-9 at grove). No policy tap
row reads 'remote' anywhere in the window.
Stages: 76/80 policy tap rows stage < 3; the 4 stage-3
rows are 10911 (2) and 10925 (2) — and all 4 still read
'inside', because the gate checks inside before remote,
so a stage-3 crossing on an inside evening changes
nothing about the tap. The control legs of those two
seeds stayed below stage 3 on all 5 tap days: the two
legs' trajectories diverge (taps, lifts, and inside
evenings change what the days do), so stage is read at
tap time per leg, never assumed from the loop-day —
exactly why P2 is a pooled share, not a per-seed gate.
Control leg: 80/80 taps access 'none', 0 remote, 0 inside
taps on every seed; outcomes 65 hall-refused, 13
ownership refusals (10910 days 10-12, 10911 days 11-12,
10915 day 12, 10916 days 8-12, 10922 day 12 — all
"You don't have that ability" after a bearer death),
2 kcal-button-refused (10910 days 8-9, away at
forest_floor, kcal 279 then 0). All 80 control tap rows
stage < 3.
All 32 confirm instances survived 30 loop-days (median
30 vs 30, G1 holds). Starvation deaths: policy 2
(10919 days 20 and 26) vs control 1 (10910 day 9,
player-flagged) — 2 <= 1+2, G2 holds. The guard counts
bearer/villager starvation pressure, not run-ending
famine: every instance survived to 30.

### Comparison against the 1930Z late window (published numbers, not a re-run)

1930Z confirm: policy inside taps 5/5 on 13 seeds, 4/5
on 1, 0/5 on 2 away seeds; control inside taps 0 on
every seed; and the confound — 10714's 5 away taps
succeeded remotely (4 clean + 1 caught) at stage 3.
Early window confirm: policy inside taps 5/5 on 13
seeds, 4/5 on 1 (10916), 2/5 on 1 (10910), 0/5 on 1 away
seed (10923); control inside taps 0 on every seed; and
the confound is gone — remote taps 0/80 policy, 0/80
control, while successful lifts are 67, all from inside.
The lever's marginal value in the early window is the
whole value: without the inside evening, the early tap
reads 'none' and is refused in the hall's own words;
with it, the tap lifts (or is caught lifting) 67 times.
Overall at-haven inside rate (the 1930Z arm's M1,
reported for comparability, not judged here): pilot
8/8 seeds >= 0.5, confirm 16/16 seeds >= 0.5.

### Evening outcomes, both bands (policy leg)

Pilot + confirm combined (720 policy evenings):
already-inside 67, walk+go-inside 622, not-attempted-
away 26, blocked-combat 4, walk-interrupted-combat 1.
0 walk-no-path, 0 no-go-inside-button, 0 entry-refused
anywhere. Control combined (720 evenings):
already-inside 48 (spawn days, 2 per seed, plus a few
mornings that had not yet exited), outside-at-haven
658, not-attempted-away 14. Mornings (loop-days 2-30)
reading inside: pilot policy 225/232 vs control 18/232;
confirm policy 445/464 vs control 45/464 — the policy's
mornings start inside because its evenings ended inside;
the control's inside mornings are spawn residue.

## Sense-testing (read end-to-end, judged on meaning)

Confirm, seed 10912, loop-day 8 (a walk+go-inside
evening, stage 1): the day's tail reads a return to
Haven ("You walk back into Haven" is the pilot-10900
shape; here the tail runs through orders, a Green Thumb
gain, the System's gambler line), then "Walking 4
squares (8 kcal)…", "You step into the Haven hall.",
then the tap from inside: "The food disappears. Magic.
(It's not magic. Nobody saw. Light Fingers.)" plus
"(−120 kcal — food becomes thief.)" — and the next
morning still inside. Position, narration, and tap
agree at every step: grounds → hall → pantry lift,
clean this time, from the hall whose stores were
lifted.
Confirm, seed 10923, loop-day 8 (the away failure):
the day forages a grove patch clean ("6× Hickory Nuts,
4× White Oak Acorns, 3× American Persimmon (390
kcal)"), travels to grove, gains Green Thumb, eats a
persimmon — and the tap from grove answers "The pantry
is in the hall. Your hands are not." The refusal is the
honest physical fact, not a harness artifact: the player
spent the evening in the grove, and the hall is not
there. The lever never pretends otherwise — away means
away, in this window exactly as in the late window.
Judgment: the early-window inside evening reads as a
**sensible played evening, not a harness artifact**,
and the early-window away refusal reads as the game's
own physical rule stated plainly. The one silence worth
naming (carried from the 1930Z arm): nothing in the
game's own lines tells a player this is the thing to do
at evening time — the step is the policy's habit, not a
hint the game gave.

## Village assessment (plain words, within what 30-day instances can say)

These are month-long villages, not lived ones — but the
shape repeats 24 times, and this time the first fortnight
is the story. In the second week the village is still
finding its feet: the System has barely arrived (stage
1-2 on every control tap), the pantry is a physical room
in a hall, and a player who beds down on the grounds
cannot lift from it — every control tap in the window
says so, in the hall's own words. The villages whose
players walk the few squares to the lodge and sleep
inside wake up in the hall, and their pantry taps lift:
67 lifts across the confirm band, about half caught
(37) and half clean (30), each costing trust or
stealth and 120 kcal of food-becomes-thief. The villages
whose players spend the tap week away — 10923 in the
grove all five days, 10910 out at forest_floor while
running on empty (kcal 52, 6, 365) — simply never get
that evening at home, and their taps are refused for
honest reasons: hands not in the hall, or no calories
to pay for an ability at all. Nobody starved out of a
run: every instance on both bands survived 30 loop-days,
and the starvation counts are bearer/villager deaths
mid-run with succession continuing, not run-ending
famine. Blanks filled: (1) the inside lever's marginal
value before stage 3, measured clean — inside is the
only successful tap route in the window, remote is
zero, and the late window's confound is closed;
(2) the early window's own failure classes, named not
smoothed: away (10923), away-plus-empty (10910),
ownership loss mid-window (10910, 10916 days 11-12),
mid-fight walk interruption (pilot 10905). Documented,
not fixed (carried, not chased): the thief precheck
(Steve-call gated), the DOM-tap browser follow-up,
nightly travel home as a separate lever.

## Wall numbers (reported for every judged corpus, even if zero)

30-day instances cannot reach national/table/wins, and
the instrument emits no national/table/win flag — those
are 0 observed / not emitted, never a panel result.
What the instrument does emit: wave reach and survival.
Pilot: maxWave policy 1-2 (five seeds wave 2, three wave
1), control 1-2; all survived 30 loop-days. Confirm:
maxWave policy wave 3 on 1 seed (10925), wave 2 on 12,
wave 1 on 3; control wave 2 on 11, wave 1 on 5; wave kills
(policy leg dicts summed) 118 vs control 90 — a side
observation on diverged trajectories, not a judged
metric and not claimed as a lever effect. Median
survival 30 vs 30 on both bands. National: 0 observed.
Table: 0 observed. Wins: 0 observed. Wave 4-5 reach: 0
on both bands, both legs. NO balance-panel compare .md
is produced (same fake-panel note as the 1930Z arm):
a 30-day position/reachability measurement cannot move
or observe panel metrics, and a compare over
zero-variance panel metrics would be a fake comparison.

## Metric review (MEASUREMENT.md §14)

- Judged ONLY against the prereg + confirm addendum as
  written. No mid-run re-scoring: the P3 failure (10923
  confirm) is an away failure counted as a failure, not
  re-classified; the stage-3 crossings (10911, 10925
  policy legs) are counted in P2 as >= 3 rows, not
  excluded; the ownership refusals are counted as
  issued taps with access 'inside' (P3 passes on access,
  outcome classes carry the ownership story separately).
- The window held: P2 1.00 pilot, 0.95 confirm. The
  window was genuinely pre-stage-3 on the control legs
  (80/80 rows < 3) and nearly so on the policy legs
  (76/80). The 4 stage-3 policy rows do not rescue or
  sink anything: they read 'inside', and P2's bar is a
  pooled majority, not a purity gate.
- Ownership confound, early-window edition: bearer
  deaths still strike inside the window (10903 pilot
  days 11-12; 10910, 10916 confirm days 11-12; control
  10910, 10911, 10915, 10916, 10922), so tap OUTCOME
  tallies undercount what an owned ability would have
  done — but the early window REDUCES it vs the late
  window (fewer bearer deaths by day 12 than by day
  30), and P3 counts access on an issued tap, not lift
  success, so ownership loss neither passes nor fails
  a seed on its own. Tap-day outcome tallies are
  tap-window observations, not lift rates.
- Kcal-gate confound, named for the first time in this
  arm's window: 8 tap rows across both confirm legs are
  button-refused on empty calories (policy 6, control
  2), all on away tiles at kcal 0-365. The kcal gate
  ("Abilities need 500+ kcal") is a button refusal, not
  a gate observation: it answers before the pantry gate
  is ever consulted. It does not touch any verdict (P3
  counts issued taps; a kcal-refused tap is not issued,
  and 10910 still passes P3 on its 2 inside taps while
  10923 fails on away days, not on kcal days alone).
- Exile: no tap row in either band reads exiledAtTap
  true; the exile override is unexercised here, not
  measured false.
- Control inside evenings are spawn days, not a
  competing behavior (1930Z finding, carried): the
  control's inside mornings are spawn residue, and its
  tap-day access is 'none' on 120/120 rows across both
  bands.
- Morning-persistence wording: this arm's analyzer
  counts mornings (loop-days 2-30) reading inside
  (confirm policy 445/464, control 45/464), not the
  1930Z arm's stricter "morning after an inside
  evening" count — the two numbers are not directly
  comparable, and the confirm number is reported with
  its definition attached so it cannot be misread.
- Index-clobber repairs (infrastructure, not
  measurement): every safe-commit.sh commit in this
  worktree showed the known clobber variant (commit
  correct, main index showing bogus staged deletions +
  untracked files for the same paths). Each was
  repaired the same way (git update-index --add
  --cacheinfo with the HEAD blob) and verified with
  an empty `git status --short` before proceeding.
  One safe-commit.sh call also refused directory paths
  ("fatal: Unable to add <dir> to database"); the
  files were expanded to a file list and the commit
  landed with the intended message + file list (verified
  via `git show --stat HEAD`). No commit content was
  ever in doubt.

## Proof

- `node scripts/test-prestage3tap-b.js --before
  <control-corpus> --after <policy-corpus> --seeds
  <band>` — PROOF-GREEN on both bands: pilot legs
  T1-T10 (240 + 240 evenings, 80 tap rows, window and
  stage legs included); confirm legs T1-T10
  (480 + 480 evenings, 160 tap rows).
- Pilot trace: COMPETENT_FEAST=0 SEATDRIVE=0
  PLENTYDEPRI=0 DEPOSITGATE=1, POLICY=competent /
  insideevening, SEEDS=10900-10907, DAYS=30,
  TAPSTART=8 TAPEND=12 — 8 + 8 files, exit 0, corpora
  evidence/2026-10-28/sim-prestage3tap-b-corpus-competent/
  and sim-prestage3tap-b-corpus-insideevening/,
  analysis evidence/2026-10-28/sim-prestage3tap-b-analysis.json.
- Confirm trace: same command with
  SEEDS=10910-10925, OUTDIR confirm corpora — 16 + 16
  files, exit 0, corpora evidence/2026-10-28/
  sim-prestage3tap-b-confirm-corpus-competent/ and
  sim-prestage3tap-b-confirm-corpus-insideevening/,
  analysis evidence/2026-10-28/
  sim-prestage3tap-b-confirm-analysis.json.
- `node --check` clean on all three new scripts.
  No [needs-eyes]: measurement-only arm, nothing
  player-visible by default (the policy ships only if
  a driver adopts it; no default flips here).
  Zero src/js files in this arm's commits; zero
  changes to scripts/policies/insideevening.js.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [follow-up] thief precheck (Steve-call gated): unchanged
  by this arm, not chased here.
- [follow-up] DOM-tap entry for the lodge (browser
  follow-up): unchanged by this arm, not chased here.
- [follow-up] nightly travel home as a separate lever:
  the only confirm P3 failure is tap days spent away
  (10923, grove all five days); a policy that travels
  home at evening time when within reach would convert
  those — but it is a travel lever with its own survival
  costs, not part of this arm, and needs its own prereg.
- [closed by this arm] pre-stage-3 tap window: the
  1930Z arm's open item is now measured — the early
  window isolates the inside lever's marginal value
  (CONFIRM-GO, both bands).

## Convergence line

prestage3tap-window — pre-stage-3 tap-window measurement
(MEASUREMENT ONLY, zero src/js, zero policy changes):
tap days loop-days 8-12, preregistered and never moved —
pilot P1 39/40 = 0.975, P2 40/40 stage < 3, P3 8/8,
guards hold; confirm P1 71/71 = 1.00, P2 76/80 = 0.95,
P3 15/16 (sole failure 10923, all 5 tap days away at
grove), guards hold (median 30 vs 30; starvation pilot
0 vs 1, confirm 2 vs 1); remote taps 0/120 policy and
0/120 control across both bands, successful lifts 67
confirm (37 caught + 30 clean) all from inside vs 0
control successes; proof PROOF-GREEN both bands (pilot
240+240 evenings, confirm 480+480). CONFIRM-GO — the
early window isolates the inside lever's marginal value:
before stage 3, inside is the only successful tap route.

## Verdict (judged against the pre-registered bars, not re-scored): GO (pilot GO + confirm GO)
