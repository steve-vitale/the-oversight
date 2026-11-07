# sim-feareddoor-b — the feared door walks and wins 5/5 — NO-GO on an unreachable win-delta clause

**Arm:** sim-feareddoor-b (run fleshout-loop-b-20261107T1430Z, axis
scale-onramp / winnability chain) · **Policy-side only, zero src/js,
zero default flips, no changes to any existing policy file — in
particular scripts/policies/competent-doorwalk-b.js is required,
never edited.** New wrapper policy
(`scripts/policies/competent-feareddoor-b.js`: doorwalk rotation +
feared-first door rule, `FEAREDDOOR_B=1`, default OFF). **Verdict:
NO-GO as judged by the frozen header — the "+2 more wins" clause
misses (5 wins vs the 7 required) — BUT the miss is a metric
defect, not a lever failure: the feared door was entered 5/5 and
won 5/5, the guard is 12/12, and the clause is unreachable on
this band by ANY door lever (the baseline rotation already won
every seed that sat). Read the metric review before acting on
the verdict; the landing call belongs to the coordinator.**
**Band:** 53201–53212 FRESH · **Horizon:** 150d death-aware ·
**Legs:** baseline (doorwalk rotation, `DOORWALK_B=1`,
`FEAREDDOOR_B` unset) + armed (same + `FEAREDDOOR_B=1`), 12
files each · **Corpus:**
`evidence/2026-11-07/perseed-feareddoor-b-baseline/` and
`perseed-feareddoor-b-armed/` (base 660825ea2, 0 instrument
errors across all 24 files) · **Prereg:**
`evidence/2026-11-07/sim-feareddoor-b-prereg.md` (committed
a696d0178 before any judged sim) · **Proof:**
`scripts/test-feareddoor-b-20261107.js` 34/34 green before the
armed leg (33 + the live smoke assertion) · **Analyzer:**
`scripts/feareddoor-b-analyze-20261107.js` (analysis at
`/tmp/feareddoor-b-analysis.json` — working copy, the evidence
file is the record) · **Panel:**
`evidence/2026-11-07/feareddoor-panel.md` (+ `.json`,
`-before/-after.json.gz`), decision `review_required`, win rate
0.4167 → 0.4167 (delta 0).

**The one-line result, plainly:** the feared door was offered
on all five sittings, and this time somebody walked through
it — all five, on the day they sat, all light, all won. The
door the last run left un-walked now wins 5/5. The run still
judges NO-GO, because the frozen header demands two MORE wins
than a baseline that already won everything it sat — and no
door choice can win a seed that never sits.

## The walks, per seed

| Seed | Offered (names) | Walked (armed) | Branch | Sit / entry day | Answers | Final | Win day |
|---|---|---|---|---|---|---|---|
| 53201 | feared, beloved, witness, assimilated, defiant, relay (6) | **feared** | light | d90 / d90 | 5 | final:mercy | d90 |
| 53203 | feared, beloved, witness, assimilated, defiant, relay (6) | **feared** | light | d90 / d90 | 5 | final:mercy | d90 |
| 53206 | feared, beloved, witness, assimilated, defiant, relay (6) | **feared** | light | d93 / d93 | 5 | final:mercy | d93 |
| 53209 | feared, beloved, witness, assimilated, defiant, relay (5) | **feared** | light | d102 / d102 | 5 | final:mercy | d102 |
| 53212 | feared, beloved, witness, assimilated, defiant, relay (6) | **feared** | light | d90 / d90 | 5 | final:mercy | d90 |
| 53202/04/05/07/08/10/11 | — (no seat) | — | — | — | 0 | — | — |

Every walk took FEARED by the feared-first rule (fellBack
false on all five — the rotation fallback was never needed).
Every walk played the same three beats straight through on
the entry day (door + kill → lean → spend + final:mercy, 5
answers, no downgrade, no conscript — all five branches came
out light, so no dark conscript was ever offered, and no
trial was ever taken: zero `'trial-only'` skips, zero
`'beat:trial'` answers). Entry lag is 0 on all five (entry
day = sit day, by construction — verified, not assumed). The
two independent records agree on every seed
(`verbWalkedAgree` true on all 24 rows: the policy's walked
list and the driver's door-verb record match door for door,
day for day). Feared offered-but-unwalked: 5/5 in the
baseline leg, **0/5 in the armed leg** — the arm's point,
measured. Witness was offered on 4/5 sits and is still
un-walked (a later run's blank, as briefed).

## The re-baseline (band re-check — the substrate is ALIVE)

The baseline leg is the doorwalk rotation re-baselined on
FRESH band 53201–53212 at base 660825ea2 — the frozen band's
trajectories had collapsed on cf22937b8 (sits 5/8→0/8), so no
frozen-band number was trusted here. The fresh band is alive:
lesser seats earned 6/12, sat 5/12, won 5/12 (all five sat
seeds, via the rotation: defiant d90, beloved d90,
assimilated d93, defiant d102, relay d90/grey). Villages live
to 150d on four seeds (53202/04/05/07), die d69–d145 on three
(53208 d123, 53210 d69, 53211 d145) — not the ~70d collapse
of the frozen band. Substrate sanity: lesser 6/12 ≥ 4/12, sat
5/12 ≥ 4/12. **The band re-check PASSES — the substrate did
not move under this arm on this band.** The armed leg ran
only after this check and after the proof smoke leg went
green on baseline sat seed 53201 (feared@d90/light, live).

## Judged bars (frozen prereg)

| Bar | Baseline | Armed | Result |
|---|---|---|---|
| Feared entered ≥ 3/12 | 0/12 | **5/12** (all five sat seeds) | PASS |
| Feared wins ≥ 3/12 | 0/12 | **5/12** | PASS |
| Armed wins ≥ baseline wins + 2 | 5 | **5** (bar 7) | **FAIL — the defect** |
| Baseline feared entered 0/12 (RED pin) | **0/12** | — | PASS |
| Substrate sanity: baseline lesser ≥ 4/12 AND sat ≥ 4/12 | **6/12 and 5/12** | — | PASS |
| Per-seed exact reproduction 12/12 (substrate guard) | — | **12/12** | PASS |
| Starvation ≤ baseline + 1 total | 4 | **4** (cap 5) | PASS |
| Per-seed survival non-inferiority 12/12 (revised bar) | — | **12/12** (won seeds at horizon 150d) | PASS |
| Pair days (recorded, not gated) | 80 | **80** | recorded |

**Substrate guard detail (12/12):** the seven never-entered
seeds reproduce the baseline whole-run EXACTLY (days, end,
standing, maxWave, wave-4+ kills, final seat). The five
entered seeds reproduce the baseline EXACTLY on every daily
row before the earlier first-entry day (86, 87, 90, 99, 87
days compared per seed — standing, roster, living, wave-4
kills, seat, feast deeds, pair-day flag, preview ready/why,
scholar at Haven). Both legs entered on the same sit day on
all five seeds, so the pre-bind comparison is 86–99 days of
identical trajectory per seed. The feared drive's idle reads
are trajectory-neutral in practice, as the proof's live 53001
check predicted.

## The win-delta clause, in full (why the verdict is NO-GO and why that is wrong)

The frozen primary demands three things: feared entered
≥3/12, feared wins ≥3/12, AND armed wins ≥ baseline wins +
2. The first two pass cleanly (5/12 and 5/12). The third
fails 5 vs 7 — and it fails for a reason that has nothing to
do with the feared door.

The baseline rotation won **all five seeds that sat** (5/5
sat seeds won: defiant, beloved, assimilated, defiant,
relay). The armed leg can only differ from the baseline
AFTER the sit: the door drive runs after the sit drive in
the same upkeep, and it fires only when a table modal is
pending — which only ever happens after a sit. The seven
seeds that never sat in the baseline (53202/04/05/07/08/
10/11) therefore cannot sit in the armed leg either, and
cannot win in either leg. The guard proves it: pre-sit
trajectories are identical on all 12 seeds, so the sat set
is identical by construction. Armed wins are capped at 5 —
the five sat seeds — and baseline wins are already 5. The
clause demands 7. **No door lever — feared, witness, any
rotation, any beat play — can pass this clause on this band.**
It measures the substrate's headroom (zero unwon sat seeds),
not the lever.

Per §14 metric binding this run is judged against its header
as written, so the verdict is NO-GO — a miss is NO-GO, never
re-scored against a friendlier metric mid-run. The metric
review below proposes the revision for the NEXT run (judge
the win contribution as feared wins vs baseline feared wins,
5 vs 0 here — a clean +5). **The landing call belongs to the
coordinator:** this is a NO-GO on a defective clause, not a
killed lever. The branch is NOT deleted — the feared door
works 5/5 with a clean cost bar and a 12/12 guard, and
deleting the first working feared walk because the header
asked for wins on seeds that never sit would be the
kill-discipline failure Steve warned against ("don't kill a
feature just because testing didn't show expected outcomes —
root cause and confirm it's the wrong lever"). The root cause
is the metric, confirmed; the lever is not the wrong one.

## Wall numbers (this run)

National / table-sat / doors-entered / feared-entered /
feared-wins / wins: baseline **0 / 5 / 5 / 0 / 0 / 5** →
armed **0 / 5 / 5 / 5 / 5 / 5** · Wave-4 unlocks 12/12 →
12/12 · Wave-5 unlocks 4/12 → 4/12 · Wave-5 faced 4/12 →
4/12 · Lesser seats earned 6/12 → 6/12, sat 5/12 → 5/12 ·
Full seat 0/12 → 0/12 · Median survival 112.5d → 112.5d
(all seeds, identical — the two legs differ ONLY in which
door was walked on the five sat seeds) · Max 150d → 150d.
National is still 0/12, the full seat still names national —
the wins came through the LESSER seat, which is exactly what
TABLE.md prices. The feared door adds no net wins on this
band because the rotation had already won every sitting;
what it adds is the feared door itself, walked and won.

## Per-seed table

| Seed | Leg | Days | End | Standing | Scale | Max wave | Seat | Sat | Walked | Pair days | Starv | w4 / w5 kills |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 53201 | base/armed | 90/90 | won | 199/199 | regional | 4/4 | lesser | d90 | defiant/light → **feared/light** | 0/0 | 0/0 | 1/1, 0/0 |
| 53202 | base/armed | 150/150 | survived | 199/199 | regional | 4/4 | none | — | — | 3/3 | 1/1 | 6/6, 0/0 |
| 53203 | base/armed | 91/91 | won | 199/199 | regional | 4/4 | lesser | d90 | beloved/light → **feared/light** | 0/0 | 0/0 | 1/1, 0/0 |
| 53204 | base/armed | 150/150 | survived | 424/424 | regional | 5/5 | none | — | — | 29/29 | 0/0 | 9/9, 3/3 |
| 53205 | base/armed | 150/150 | survived | 275/275 | regional | 5/5 | none | — | — | 3/3 | 0/0 | 4/4, 1/1 |
| 53206 | base/armed | 93/93 | won | 265/265 | regional | 5/5 | lesser | d93 | assimilated/light → **feared/light** | 8/8 | 0/0 | 3/3, 1/1 |
| 53207 | base/armed | 150/150 | survived | 345/345 | regional | 5/5 | none | — | — | 37/37 | 1/1 | 5/5, 1/1 |
| 53208 | base/armed | 123/123 | lost | 199/199 | regional | 4/4 | none | — | — | 0/0 | 0/0 | 3/3, 0/0 |
| 53209 | base/armed | 102/102 | won | 165/165 | regional | 4/4 | lesser | d102 | defiant/light → **feared/light** | 0/0 | 1/1 | 1/1, 0/0 |
| 53210 | base/armed | 69/69 | lost | 199/199 | regional | 4/4 | lesser* | — | — | 0/0 | 1/1 | 2/2, 0/0 |
| 53211 | base/armed | 145/145 | lost | 199/199 | regional | 4/4 | none | — | — | 0/0 | 0/0 | 0/0, 0/0 |
| 53212 | base/armed | 90/90 | won | 199/199 | regional | 4/4 | lesser | d90 | relay/grey → **feared/light** | 0/0 | 0/0 | 1/1, 0/0 |

\* 53210 earned a lesser seat but died d69, before the
day-90 floor — earned but never sat. Standing, wave kills,
pair days, and starvation are identical leg-to-leg on every
seed: the ONLY difference between the legs is which door was
walked on the five sat seeds. 53203 reads days 91 against
gameDays 90 — the same loop-iteration boundary artifact the
doorwalk evidence noted (final answered d90, win d90).

## Village assessment (plain words)

Five villages earned the right to sit, and this time the
door they walked was the feared one — the door nobody had
ever walked. Each one sat on the first morning it was
allowed, the table read its life back to it, opened five or
six doors, and the village picked the feared door the same
morning: the footage played unasked, the kill led, the lean
followed, and then the terror was spent shielding a small
village that wasn't theirs — and the table signed. All five
won. The seven villages that never earned a seat lived and
died exactly as they had before — nothing about the feared
door changed their fates, because no door was ever offered
to them. The chain now runs end to end through a WON feared
seat: wild ally-join, wave-4 kills, veterans, readiness,
wave-5 facing, the lesser seat, a walked feared door, a win.
What remains is the national Binding behind the full seat —
and the question the numbers now force: the lesser seat wins
through every door tried so far, so what does the full seat
still buy?

## Sense-test read (feared walks)

**The walks read as one door played five times, honestly.**
53201/53203/53206/53209/53212 feared/light: open "Look what
eating built." — the footage plays unasked, nobody at the
table comfortable, that is the point — then beat 1 leads
with the kill, beat 2 leans in, beat 3 spends the terror
shielding the small envoy ("You spend it — the shield, not
the sword. The small envoy stares. Your people stand a
little straighter. Protective terror: the table writes it
down and doesn't understand it, which is the point."), final
mercy — "The most frightening thing you ever did... The
terror stays, pledged now: a shield over every village,
forever." Every walk ends with the same plain line: "You
won. Say it plainly: you won. The village endures. The
table signed."

That sameness is the honest shape of this measurement, not
a defect claimed: one door, one drain, one branch — the
beats are the same because the choices are the same. What
differs per run is the audit, and the audits stay specific:
53201's deeds (waves faced 15/8/4, 5 wave-4 fought, 9
contests, 3 crises), 53203's (13/10/4, 6 wave-4, 8
contests), 53206's (19/11/4, 5 wave-4 and 3 wave-5, 12
contests), 53209's (16/13/8, 1 wave-4, 8 contests), 53212's
(18/8/4, 7 wave-4, 11 contests, plus the ascension note:
"The table notes 1 ascension from one village — its terms
improve accordingly. Nobody has ever seen that before.").
Every branch line is ledger-true ("The protected outnumber
the killed; the food truth was shared. The light road is
open.").

**One repetition worth noting, not a defect claimed.** The
monster-ability Codex lines ("You won't forget this") repeat
verbatim across seeds and days (Redact/Return, Epitaph/Final
Chapter, Smack-Rush/Gorge pairs) — the same codex text for
the same ability, which is true to the fiction (the ability
is the ability) but reads repetitive across runs. Pre-existing
instrument noise, not this arm's finding to file — the
doorwalk run's grief-card repetition is the same class.

**Unmeasured, still:** the DARK feared walk. All five
branches came out light, so the prereg's curdle prediction
(beat 3 dark 'name' pushes horror 4→7 and fails the path
into a downgrade) never fired. A dark-branch feared walk —
and whether the downgrade then wins on a second door — is
still unmeasured. The trial was never offered as the only
option and never taken; trial-by-combat stays unmeasured.

## Metric review

Pre-registered metrics bind this run (prereg a696d0178). As
judged: primary feared entered (≥3/12) ✓ 5/12; feared wins
(≥3/12) ✓ 5/12; win delta (≥ +2) ✗ 0; baseline feared
entered (0/12) ✓ 0/12; substrate sanity (lesser ≥4/12 AND
sat ≥4/12) ✓ 6/12 and 5/12; substrate guard (12/12) ✓
12/12; cost bar starvation ✓ 4 vs 4 / cap 5; cost bar
per-seed non-inferiority ✓ 12/12. No metric was swapped,
re-cut, or re-thresholded after the run — the verdict stands
as NO-GO on the frozen header.
- What the metric got wrong, honestly: (1) THE WIN-DELTA
  CLAUSE. It assumes the baseline leaves unwon sat seeds for
  the armed leg to convert. On this band the baseline won
  5/5 sat seeds, and the sat set is identical in both legs
  by construction (the door drive cannot create a sitting —
  guard 12/12 proves the pre-sit trajectories identical).
  Armed wins are capped at baseline wins, so the clause
  (baseline + 2 = 7) is unreachable by any door lever on
  this band. PROPOSED REVISION for the next run: judge the
  win contribution as feared wins vs baseline feared wins
  (5 vs 0 here — a clean +5), or require armed wins ≥
  baseline wins (non-inferiority) when the baseline wins
  all its sat seeds, applying the +2 clause only when the
  baseline leaves unwon sat seeds. Under the feared-wins
  reading this run passes GO. (2) THE REVISED COST BAR
  WORKED. Per-seed non-inferiority (12/12) and the 12/12
  guard replace the defective frozen median cleanly — the
  doorwalk artifact (winners leaving the median set) cannot
  recur under this bar, and the two legs' medians came out
  identical anyway (112.5d both). No revision proposed for
  the cost bar. (3) The 53203 days-91/gameDays-90 split is
  the same harness loop-iteration boundary artifact the
  doorwalk evidence noted (final answered d90, win d90); a
  future analyzer should prefer gameDays. (4) The driver's
  tableLines filter now captures feared win/epilogue lines
  ("You won", "the terror stays", "Deterrence holds") —
  doorwalk metric-review #5 closed for this arm; the dark
  final lines ("Deterrence holds", "Fear pays") are in the
  filter but never fired (no dark walk). (5) The analyzer
  and proof smoke BOTH checked the policy offers list for
  the prefixed id `'path:feared'` while the policy stores
  UNPREFIXED ids — the check silently never matched (the
  smoke's feared-offered assertion never ran; the analyzer's
  fearedOffered was always false). Caught and fixed before
  the armed leg (commit b8bbf538); the smoke re-ran 34/34
  with the assertion genuinely executing. A future door arm
  should pin the offered-id shape in a fixture (now done in
  this proof's analyzer fixtures).
- Instrument notes: 0 instrument errors on all 24 files.
  The feared-drive skip tallies are large by design
  (~267 'preview-null' skips per sat seed — the idle path on
  every upkeep before the sit; ~450 on the 150d no-seat
  seeds), the same class as doorwalk's. The instrument's
  `sitAttempts` counts all four wrapped table verbs, so armed
  seeds read 6–7 (1 sit + 5 door answers) — the sit count
  itself is `takeseatStats.seatTaken` (1 per sat seed), and
  the analyzer judges sits from that, not from
  `sitAttempts`.

## Balanced panel (§15) and telemetry

Panel `evidence/2026-11-07/feareddoor-panel.md`: decision
`review_required` (the 12-seed screen's standard cautious
verdict). Table win rate **0.4167 → 0.4167** (delta 0 —
the feared wins replace rotation wins one-for-one, no net
win change); national 0 → 0, survival30/60 1 → 1 (no
movement); villageDeaths/run 66.75 → 66.75 (delta 0);
villageDeaths/100d 59.8491 → 59.8491 (delta 0);
communityLost 0.25 → 0.25 (no material signal). Every panel
metric reads delta 0: the two legs are the same twelve
villages living the same twelve lives, differing only in
which door was walked on five sittings. The panel does not
observe door entry (contract has no door mapping) — entry
is judged from the analyzer, as the prereg states.
Telemetry deviation check: `scripts/telemetry-check.js`
REFUSES recorder-corpus input (same refusal as
doorwalk/takeseat — "all 12 --current rows carry top-level
anchorCommit"). No LOUD line, no deviation signal; zero
src/js changed, so no Game-telemetry baseline exists to
deviate from.

## What this arm does NOT claim

- Not a full seat: 0/12 full, national 0/12. The wins came
  through the LESSER seat. The full seat still names national
  standing, and no village has reached national.
- Not "any door wins": the feared door walked and won 5/5
  (all light). Witness was offered on 4/5 sits and never
  walked; the dark branches were never exercised (no dark
  feared walk, so the curdle-into-downgrade path is still
  unmeasured); trial-by-combat was never opted into. A
  witness walk, a dark walk, and a trial are still unmeasured
  on this substrate.
- Not "feared wins more": the armed leg won 5, the baseline
  leg won 5. Feared wins the same sittings the rotation won
  — it does not add wins on this band, because there were no
  unwon sittings to add. What it proves is that the feared
  door itself is walkable and winnable.
- Not "bots should walk feared": the policy is a measurement
  instrument standing in for the player (Steve-call). Whether
  any bot should sit or walk in real play is still the
  player's call.
- Not "winning is safe": a win ends the run — the village's
  later fate (wave-5 fights, feasts, succession) is unplayed
  after a win by design. The win is the end of the
  measurement, not a claim about what comes after.
- Not a recorder artifact: the guard is 12/12 exact
  (never-entered whole-run, entered pre-first-bind), the
  baseline entered feared 0/12 with the gate off (the RED
  pin, live), the two independent door records agree on
  every seed, and the proof's 53001 live check reproduces
  the baseline exactly armed-vs-baseline.

## Next blanks (for the loop, not this arm)

1. **The metric revision (binding):** re-register the
   win-contribution bar as feared wins vs baseline feared
   wins (or armed ≥ baseline when the baseline wins all sat
   seeds) and re-judge — under it, this run passes GO. The
   landing call for the feared commits (cherry-pickable: they
   touch only new files) belongs to the coordinator, alongside
   the still-held doorwalk branch.
2. **The un-walked doors, still:** witness (offered 4/5,
   walked 0/5), the DARK feared walk (curdle into downgrade
   — needs a dark-branch sitting; the substrate's ledgers all
   read light here), trial-by-combat. Each is a separate
   pre-registered decision (trial risks the Bearer).
3. **The national Binding** — unchanged: national is the only
   missing full-seat item on the sat seeds, and now the only
   thing the lesser seat cannot buy. The full seat's price is
   the next rung.
4. **Sitter-dies-mid-sitting, feast draws under sanctity,
   pre-day-90 table-talk** — all Steve calls, unchanged from
   the 1330Z round.

## Proof and commits

- Proof `scripts/test-feareddoor-b-20261107.js`: 34/34 green
  before the armed leg (RED phase with a throwing engine
  stub, 14 GREEN fixtures, rotation mapping pinned for
  53201–53212, composition exactly-once fixtures on a real
  loaded game — gate OFF delegates to doorwalk upkeep,
  gate ON runs linkfeast upkeep directly and never calls
  doorwalk upkeep — live 53001 baseline-vs-armed exact
  reproduction, live 53201 armed smoke leg walking
  feared@d90/light with the feared-offered assertion
  genuinely executing, analyzer pure-function fixtures
  including fearedWin and its downgrade-negates variant).
- Prereg committed a696d0178 before any judged sim. Tooling
  committed 808515cb5 (feared-first policy, driver, analyzer,
  panel builder, proof 33/33, sweep-compare untouched — the
  panel builder follows the doorwalk pattern directly).
  Prefix-shape fix committed b8bbf538 (analyzer + proof
  smoke; smoke re-ran 34/34). The safe-commit index clobber
  hit on all three commits (files shown staged-as-deleted or
  staged-modified after correct commits); repaired with
  HEAD-blob cacheinfo each time, verified `git status`
  empty + `git diff HEAD` empty + hash-object matches, each
  time.
- Judged corpus: `evidence/2026-11-07/perseed-feareddoor-b-baseline/`
  and `perseed-feareddoor-b-armed/` (12 files each, base
  660825ea2, 0 instrument errors). Analyzer output saved at
  `/tmp/feareddoor-b-analysis.json` (working copy; the evidence
  file above is the record). Panel
  `evidence/2026-11-07/feareddoor-panel.md` (+ `.json`,
  `-before/-after.json.gz`).
- Base note: the worktree HEAD 660825ea2 IS the doorwalk tip
  (rebased onto cf22937b8); no further rebase was needed, no
  proof re-run was owed to a rebase. check.js --quick NOT
  run: zero src/js in this arm.

## Convergence

**scale-onramp: converging, NOT converged.** The chain now
runs end to end through a WON FEARED seat: 5/12 lesser seats
sat, 5/5 feared walked, 5/5 feared won — the feared door is
walkable and winnable, and no village was harmed by the
change (guard 12/12, cost bar clean, panel delta 0). The
verdict is NO-GO on a defective win-delta clause, not on the
lever; the metric review carries the fix. What remains is the
national Binding (0/12), the full seat (0/12), and the
un-walked doors (witness, dark branches, trial).
