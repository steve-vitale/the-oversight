# sim-doorwalk-confirm-b — the door arm, confirmed: 5/5 sits walked, 5/5 won — GO

**Arm:** sim-doorwalk-confirm-b (run fleshout-loop-b-20261107T1530Z,
axis scale-onramp / winnability chain) · **Policy-side only, zero
src/js, zero default flips, no changes to any existing policy file.**
New wrapper policy (`scripts/policies/competent-doorwalk-b.js`:
frozen linkfeast composite + sit drive + door-walk drive,
`DOORWALK_B=1`, default OFF — the HELD branch from the 1430Z run).
**Verdict: GO as judged by the frozen header** (prereg
`evidence/2026-11-07/sim-doorwalk-confirm-b-prereg.md`, committed
ba1831626 before any judged sim, on the rebased tip 85d3d18cd).
**The 5/5 pilot win was not a band fluke: on a fresh band, every
village that sat walked its assigned door and won.** **Band:**
53201–53212 FRESH · **Horizon:** 150d death-aware · **Legs:**
baseline (takeseat substrate, door OFF) + armed (same substrate,
`DOORWALK_B=1`), 12 files each · **Corpus:**
`evidence/2026-11-07/perseed-doorwalk-confirm-b-baseline/` and
`perseed-doorwalk-confirm-b-armed/` (base 4ce3c0c1f, 0 instrument
errors across all 24 files) · **Proof:**
`scripts/test-doorwalk-b-20261107.js` 29/30 on the rebased tip —
smoke leg only, see below · **Analyzer:**
`scripts/doorwalk-confirm-b-analyze-20261107.js` (analysis at
`/tmp/doorwalk-confirm-b-analysis.json` — working copy, this
evidence file is the record) · **Panel:**
`evidence/2026-11-07/doorwalk-confirm-panel.md` (+ `.json`,
`-before/-after.json.gz`), decision `review_required`, win rate
0 → 0.4167.

**The one-line result, plainly:** five villages sat, and on the
same morning each one walked the door it was assigned — the
Defiant twice, the Beloved, the Assimilated, the Relay — played
the challenge straight through, and won, all five. The pilot
proved winning was possible; this confirm proves it repeats on
fresh ground, with no village harmed by any per-seed measure.
The door is a real way to win the game now.

## Replacement-worker adoption (this run)

Your predecessor was shut down by a coordinator error (a mistaken
close call), NOT a task failure. Adopted state, verified before
touching anything: branch `sim-doorwalk-b` at 0840d1f06 (3 rebased
doorwalk picks) + 3 uncommitted files — prereg (10,984 bytes),
confirm analyzer, confirm panel builder — all present and
byte-identical to the /tmp backups taken at adoption. Rebased
onto master 4ce3c0c1f (read immediately before rebasing; the
finishing-instrument landing: `src/js/fieldFights.js` modified +
`src/js/finishLog.js` new — field per-round capture + TB wraps,
substrate-relevant, zero overlap with this arm's files: no
`src/js` in this arm at all). All 3 picks applied clean, NO
stop-at-pick quirk this time; new tip 85d3d18cd. The uncommitted
files survived the rebase untouched (no stash/move needed).
Prereg Base line updated to 4ce3c0c1f / tip 85d3d18cd; the prereg
was NOT committed when adopted, so per the brief it was fixed to
match the brief rather than governing as written (the only
divergence was the stale Base line). Proof re-run on the new tip:
29/30, smoke leg the only failure — same leg, same cause as the
predecessor recorded. Prereg + tooling committed ba1831626
BEFORE any judged sim. Safe-commit index clobber hit that
commit (files showed staged-deleted though byte-identical to
HEAD); repaired via HEAD-blob cacheinfo, verified `git status`
empty + `git diff HEAD` empty + hash-object matches. The commit
itself was correct; only the index lied.

## The walks, per seed

| Seed | Assigned door | Offered (names, now recorded) | Walked | Branch | Sit / entry day | Answers | Final | Win day |
|---|---|---|---|---|---|---|---|---|
| 53201 | defiant | feared, beloved, witness, assimilated, defiant, relay (6) | **defiant** | light | d90 / d90 | 6 | final:walk | d90 |
| 53203 | beloved | feared, beloved, witness, assimilated, defiant, relay (6) | **beloved** | light | d90 / d90 | 5 | final:audience | d90* |
| 53206 | assimilated | feared, beloved, witness, assimilated, defiant, relay (6) | **assimilated** | light | d93 / d93 | 5 | final:comfort | d93 |
| 53209 | defiant | feared, beloved, assimilated, defiant, relay (5 — no witness) | **defiant** | light | d102 / d102 | 6 | final:walk | d102 |
| 53212 | relay | feared, beloved, witness, assimilated, defiant, relay (6) | **relay** | grey | d90 / d90 | 6 | final:both-hands | d90 |
| 53202/04/05/07/08/10/11 | — | — (no seat taken) | — | — | — | 0 | — | — |

\* 53203 reads days 91 against gameDays 90 — the same
loop-iteration boundary artifact the pilot saw on 53005; the
final was answered d90 and the win is d90.

Every walk took its ASSIGNED door (fellBack false on all five —
no fallback was ever needed, even on 53209 where only 5 doors
were offered). Every walk played its challenge straight through
on the entry day (door + 3–4 beats + final, 5–6 answers, entry
lag 0 — sit day = entry day on all five), no downgrade, no
conscript, no trial taken, no modal stall (daysAfterEntry 0 —
the run ends at the win). **Smoke re-pin: PASS** — the first
sat seed, 53201, walked its assigned Defiant door and won, the
live smoke leg the collapsed frozen band took away.

## Judged bars (frozen header)

- **Primary PASS: wins 5/12 armed vs 0/12 baseline** (bar ≥4/12
  armed AND ≥3 more wins than baseline on identical seeds).
  Margin 5. Doors entered 5/12 vs 0/12.
- **Substrate sanity PASS: lesser seats 6/12, sits 5/12**
  (bar ≥4/12 each). The band re-check gate passed before any
  judging: the substrate is ALIVE on 53201–53212 — 9/12 villages
  survive to 150d, median survival 150d baseline. This is NOT
  the collapsed frozen band (0/8 sit, villages dying ~70d).
  Baseline wins 0/12, as expected (the gate is off).
- **Substrate guard PASS: 12/12 per-seed exact** (7
  never-entered seeds whole-run; 5 entered seeds pre-entry over
  86–99 days each, firstDiff null everywhere). The drive is
  trajectory-neutral until the moment a door is walked.
- **Cost bar PASS: per-seed survival non-inferiority 12/12**
  (no seed dies earlier in the armed leg than its own baseline
  day; the five winners count at the horizon, 150d). Starvation
  **4 → 4** (cap baseline+1 = 5), arm-only 0 — the same four
  seeds starve in both legs (53202, 53207, 53209, 53210); the
  drive starved nobody. Pair days 81 → 80 (recorded, not gated).
- **Panel:** decision `review_required`, win rate 0 → 0.4167
  (change_signal). Village deaths/run fell 70.25 → 66.75; the
  deaths/100d regression signal is the same denominator artifact
  the pilot panel showed — wins end runs early, so the armed leg
  has fewer days in the denominator while deaths actually fell.
  The panel is the instrument; the pre-registered threshold is
  the judge.
- **Telemetry deviation check:** `scripts/telemetry-check.js`
  REFUSED recorder-corpus input by design (same refusal as
  sitstep2/feastdrive/takeseat/doorwalk pilot) — no LOUD line,
  no deviation signal; zero src/js changed, so no Game-telemetry
  baseline exists to deviate from.

## The wall (this run's judged corpora)

| | Baseline | Armed |
|---|---|---|
| National | 0/12 | 0/12 |
| Table-sat | 5/12 | 5/12 |
| Wins | 0/12 | **5/12 (all lesser)** |
| Full seat | 0/12 | 0/12 |
| Wave-4 unlocks | 12/12 | 12/12 |
| Wave-5 unlocks | 5/12 | 4/12 |
| Wave-5 faced | 4/12 | 4/12 |
| Wave-5 kills (total) | 6 | 6 |
| Median survival (all seeds) | 150d | 112.5d |
| Median survival (non-won) | 150d | 150d |

The armed wave-5 unlocks dip (5→4) and the all-seed median dip
(150→112.5d) are both win truncation, not lever harm: 53201
unlocked wave 5 after d90 in the baseline, and wins end runs at
d90–102. The non-won median is 150d in both legs — nobody who
didn't win died any earlier. National is still 0/12, the full
seat still 0/12, feared/witness/dark/trial doors still un-walked:
the wall beyond the lesser seat stands exactly where it was.

## The village, per seed (plain words)

**The five winners.** Each sat on the morning the table allowed
it (d90 floor, or d93/d102 when the seat came later) and walked
straight in. 53201 (Defiant, d90) and 53209 (Defiant, d102) paid
the price list and walked away free. 53203 (Beloved, d90) turned
popularity into a constitution. 53206 (Assimilated, d93) — the
only winner that had already faced wave 5 (3 wave-5 fought
before sitting) — took comfort and won. 53212 (Relay, grey,
d90) stayed both-hands and the terms held. All five audits name
real deeds with per-seed numbers that differ (waves faced
13–19 / 8–13 / 4–8, contests 8–12, crises 3) — the table is
pricing each run, not stamping one.

**The seven who never sat.** 53202, 53204, 53205, 53207 survived
all 150 days with no seat at all (standing 199–424, regional) —
villages that lived well and never earned the table's attention.
53204 is the sharpest of these: 9 wave-4 kills, 3 wave-5 kills,
29 pair days, standing 424 — the strongest fighter on the band
— and still no seat, because the seat prices deeds and scale,
not kills alone. 53208 died d123, 53211 died d145 (0 wave-4
kills all run — the village that never learned to fight), and
53210 is the saddest line on the band: it earned a lesser seat
on d40 and died on d69, three weeks short of the day-90 floor —
a seat that was never sat. All three losses reproduce baseline
day-for-day in the armed leg; the drive touched nothing there.

**What the winners gave up by winning.** A win ends the run, so
the armed totals for anything that accumulates after the sit
fall: donations 132,435 → 96,975 kcal, feasts 21 → 11, wave-4
kills 46 → 36, links 49 → 48. That is the price of ending the
story, not a cost of the lever — the winners stop playing, so
they stop accumulating. Standing on won seeds falls the same
way (53201: 545 → 199).

## Sense-test (read the walks, not just the counts)

The five walks read as five distinct games, and the branch
voicing is correct per door: the four light walks hear "The
light road is open"; the grey Relay walk hears "The middle road
is open" and its own final ("The terms held — the table had
priced the village, ascension and all, and the village paid in
full"). The Defiant's price list, the Beloved's "You made
popularity into a constitution", the Relay's four probe beats —
each challenge plays its own beats (harvest/name/overlay/pay,
hunter/song/quiet, kitchens/citizen/truth, probe×4). The
audits read the run back aloud with real numbers, and the
ascension line ("The table notes 1 ascension from one village")
fires on the two seeds that earned one (53201, 53212).
Two sense notes, neither a verdict item: (1) the Relay's four
challenge beats are all "probe" — the bot takes the first
option every time, so the cockpit reads repetitive even though
the verbs exist; a human would vary it, the bot never does.
(2) 53209 won the Defiant with only 1 wave-4 fight faced all
run — the lesser seat prices facing, and one faced fight plus
the deeds was enough; the door does not check that you are a
killer, only that you sat. Both are already filed or
pilot-known behavior, not new findings.

## Proof status (on the rebased tip 85d3d18cd, base 4ce3c0c1f)

`scripts/test-doorwalk-b-20261107.js`: **29/30**. The single
failure is the LIVE SMOKE leg (`seatTaken` 0 vs 1 on seed
53003) — recorded honestly, NOT forced green: the frozen band
53001–53008 collapsed on the newer masters (0/8 sit), so the
leg that pins an absolute trajectory value on that band cannot
re-pin there. All other 29 legs pass, including the
trajectory-neutrality leg (53001 armed reproduces baseline
EXACTLY on the new master). The smoke leg is re-pinned by this
confirm itself: 53201 sat, walked its assigned door, and won.
check.js --quick NOT required: zero src/js in this arm.
Dry run before the judged sim: the confirm analyzer run against
the pilot corpora reproduces the pilot's per-seed rows and
reports the pilot verdict under the REVISED bars as GO (wins
5/8, margin 5, guard 8/8, non-inferiority holds, starvation
1→1).

## Metric review

The revised metric worked as designed. The pilot's defective
median bar would have failed this run too (all-seed median
112.5d armed vs 150d baseline — the same artifact: winners
leave the count); the per-seed non-inferiority bar correctly
passes it (12/12, no seed harmed). The wins-at-horizon primary
(≥4/12, margin ≥3) discriminated cleanly: 5/12 vs 0/12. One
observation for the NEXT run's prereg, not a revision here: the
starvation cap (baseline+1) is nearly vacuous when baseline
starvation is already 4 — it passed 4→4, but a lever that
starved one extra village on a low-starvation band would pass
too. If starvation ever becomes the contested cost, the cap
should be absolute (e.g. arm-only ≤ 1), not relative. The pair
days secondary (81→80) stayed flat — the door does not disturb
pair formation, since pairs form before the sit. No metric
change is proposed for this arm; the bars stand as frozen.

## Findings

No new sim-findings entry: the two sense notes above are
pilot-known behavior (relay probe repetition is bot
first-optioning; the Defiant's one-fight win is the lesser
seat pricing facing, by design). The frozen-band collapse
remains filed from the 1430Z round; the fresh band held.

## Convergence state

scale-onramp stays converging (NOT converged): the chain now
runs end to end through a TAKEN seat AND a WALKED door on a
fresh band, 5/5 wins repeating the pilot — the win path is
real and repeatable — but no village has walked
feared/witness/dark/trial doors, national is still 0/12, the
full seat is still 0/12. The next blanks, in order: (1) land
this branch (coordinator merge); (2) un-walked doors (feared,
witness, dark branches, trial-by-combat) and the national
Binding (LEAD realm formation) behind the full seat; (3)
bisect which 62ca38845→cf22937b8 landing collapsed the frozen
band's survival (still open from 1430Z).

**Merged locally, pending ship:** NOTHING merged by this worker
— the branch is ready for the coordinator to merge --ff-only.
The ship loop owns all pushes.
