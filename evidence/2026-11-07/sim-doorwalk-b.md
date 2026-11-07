# sim-doorwalk-b — the door arm: five doors walked, five wins — NO-GO on a metric artifact

**Arm:** sim-doorwalk-b (run fleshout-loop-b-20261107T1430Z, axis
scale-onramp / winnability chain) · **Policy-side only, zero src/js,
zero default flips, no changes to any existing policy file.** New
wrapper policy (`scripts/policies/competent-doorwalk-b.js`:
frozen linkfeast composite + sit drive + door-walk drive,
`DOORWALK_B=1`, default OFF). **Verdict: NO-GO as judged by the
frozen header — the median-survival cost bar misses (86 vs the
120 floor) — BUT the miss is a metric artifact, not a lever
failure: the lever entered 5/5 doors and won 5/5, the guard is
8/8, and no seed was harmed by any per-seed measure. Read the
metric review before acting on the verdict; the landing call
belongs to the coordinator.** **Band:** 53001–53008 DELIBERATELY
REUSED · **Horizon:** 150d death-aware · **Legs:** re-baseline
(takeseat substrate, door OFF) + armed (same substrate,
`DOORWALK_B=1`), 8 files each · **Corpus:**
`evidence/2026-11-07/perseed-doorwalk-b-baseline/` and
`perseed-doorwalk-b-armed/` (base 62ca38845, 0 instrument errors
across all 16 files) · **Prereg:**
`evidence/2026-11-07/sim-doorwalk-b-prereg.md` (committed
6a313ab5a before any judged sim) · **Proof:**
`scripts/test-doorwalk-b-20261107.js` 30/30 green before the
judged run · **Analyzer:**
`scripts/doorwalk-b-analyze-20261107.js` (analysis at
`/tmp/doorwalk-b-analysis.json` — working copy, the evidence file
is the record) · **Panel:** `evidence/2026-11-07/doorwalk-panel.md`
(+ `.json`, `-before/-after.json.gz`), decision
`review_required`, win rate 0 → 0.625.

**The one-line result, plainly:** the first wins in the game's
history. Five villages sat, and on the same morning each one
walked the door it was assigned — the Beloved, the Relay twice,
the Defiant, the Assimilated — played the challenge straight
through, and won, all five, on the day they sat. Nobody had ever
won before, on any substrate. The cost bar's survival check
calls it a failure anyway, because a win ends the run: the five
winners leave the survival count, and the three villages that
never sat are the only ones left to average — and they are the
three that die early in both legs. No village was harmed. The
bar measured the wrong thing once winning became possible.

## The walks, per seed

| Seed | Assigned door | Offered (names, now recorded) | Walked | Branch | Sit / entry day | Answers | Final | Win day |
|---|---|---|---|---|---|---|---|---|
| 53003 | beloved | feared, beloved, witness, assimilated, defiant, relay (6) | **beloved** | light | d90 / d90 | 5 | final:audience | d90 |
| 53004 | relay | feared, beloved, assimilated, defiant, relay (5) | **relay** | grey | d94 / d94 | 6 | final:both-hands | d94 |
| 53005 | defiant | feared, beloved, witness, assimilated, defiant, relay (6) | **defiant** | light | d90 / d90 | 6 | final:walk | d90* |
| 53006 | assimilated | feared, beloved, witness, assimilated, defiant, relay (6) | **assimilated** | light | d93 / d93 | 5 | final:comfort | d93 |
| 53008 | relay | feared, beloved, witness, assimilated, defiant, relay (6) | **relay** | grey | d90 / d90 | 6 | final:both-hands | d90 |
| 53001/02/07 | defiant/assimilated/beloved | — (no seat) | — | — | — | 0 | — | — |

\* 53005 reads days 91 against gameDays 90 — a loop-iteration
boundary artifact; the final was answered d90 and the win is d90.

Every walk took its ASSIGNED door (fellBack false on all five —
no fallback was ever needed). Every walk played its challenge
straight through on the entry day (door + 3–4 beats + final, 5–6
answers, no downgrade, no conscript — all five branches came out
light or grey, so no dark conscript was ever offered, and no
trial was ever taken: zero `'trial-only'` skips, zero
`'beat:trial'` answers). Entry lag is 0 on all five (entry day =
sit day, by construction — verified, not assumed). The two
independent records agree on every seed (`verbWalkedAgree` true:
the policy's walked list and the driver's door-verb record match
door for door, day for day). Offered-door NAMES now survive for
all five sits (fixes takeseat metric-review #4): four seeds were
offered all six lesser doors, 53004 five (no witness) —
indispensable correctly absent everywhere (full-seat-only).

## The re-baseline (substrate, current master 62ca38845)

The re-baseline reproduces the 1330Z takeseat-armed corpus
EXACTLY on every headline number — days, standing, seat, sit
day, doors offered (53001 150d/175, 53002 79d/125, 53003 150d/344
sat d90/6 doors, 53004 150d/260 sat d94/5, 53005 97d/230 sat d90/6,
53006 150d/834 sat d93/6, 53007 86d/99, 53008 150d/199 sat d90/6).
The substrate did NOT move under the arm between a78938a0b and
62ca38845. Substrate sanity: lesser 5/8, sat 5/8. The RED pin
holds live: baseline doors entered 0/8 with the gate off.

## Judged bars (frozen prereg)

| Bar | Baseline | Armed | Result |
|---|---|---|---|
| Doors entered ≥ 3/8 vs 0/8 | 0/8 | **5/8** (all five sat seeds) | PASS |
| Baseline earns lesser ≥ 3/8 AND sits ≥ 3/8 (substrate sanity) | **5/8 and 5/8** | — | PASS |
| Per-seed exact reproduction ≥ 6/8 (substrate guard) | — | **8/8** | PASS |
| Starvation ≤ control + 2 total AND arm-only ≤ 2 | 1 | **1**, arm-only 0 | PASS |
| Median survival (non-won) ≥ 0.8× control | 150d | **86d** (floor 120) | **FAIL — the artifact** |
| Pair days (recorded, not gated) | 65 | **9** (wins truncate it) | recorded |

**Substrate guard detail (8/8):** the three never-entered seeds
reproduce the baseline whole-run EXACTLY (53001 150d/175, 53002
79d/125, 53007 86d/99 — days, end, standing, maxWave, wave-4+
kills, final seat all identical). The five entered seeds
reproduce the baseline EXACTLY on every daily row before the
entry day (87, 91, 87, 90, 87 days compared per seed — standing,
roster, living, wave-4 kills, seat, feast deeds, pair-day flag,
preview ready/why, scholar at Haven). The door drive's idle
reads are trajectory-neutral in practice, as the proof's live
53001 check predicted.

## The median artifact, in full (why the verdict is NO-GO and why that is wrong)

The frozen cost bar computes median survival "over NON-WON
seeds in each leg". The baseline has no wins, so its non-won
median is the all-seed median: days [79, 86, 97, 150, 150, 150,
150, 150] → **150**. The armed leg's five winners are excluded,
so its non-won median is computed over the three seeds that
never sat: days [79, 86, 150] → **86**. Floor 0.8 × 150 = 120.
86 < 120 → the bar fails.

That comparison is apples-to-oranges, and the prereg's own
parenthetical foresaw half of it ("a won seed's truncated days
are a victory, not a survival failure") without foreseeing the
population change. The three seeds left in the armed set are
exactly the no-seat seeds — they die early in BOTH legs
(53002 d79, 53007 d86, 53001 lives to 150) and reproduce their
baseline days EXACTLY (guard 8/8). The five seeds the exclusion
removes are the five that WON on days 90–94. Per-seed, no
village died earlier in the armed leg than in the baseline leg:
every non-won seed matches its baseline pair day-for-day, and
every sat seed won instead of living on. Starvation is 1 → 1,
arm-only 0 (the same seed, 53007, in both legs).

The same truncation drives the panel's one regression signal
(deaths/100d 48.6 → 58.1): deaths per RUN fell (59.875 →
55.375), but the denominator collapses when five runs end in
wins on d90–94, so the rate rises mechanically. It is a
denominator artifact of winning early, not more dying.

Per §14 metric binding this run is judged against its header as
written, so the verdict is NO-GO — a miss is NO-GO, never
re-scored against a friendlier metric mid-run. The metric
review below proposes the revision for the NEXT run (per-seed
survival non-inferiority, or wins counted at horizon). **The
landing call belongs to the coordinator:** this is a NO-GO on a
defective bar, not a killed lever. The branch is NOT deleted —
deleting the first working win path because the survival bar
cannot count wins would be the kill-discipline failure Steve
warned against ("don't kill a feature just because testing
didn't show expected outcomes — root cause and confirm it's the
wrong lever"). The root cause is the metric, confirmed; the
lever is not the wrong one.

**Confirm:** NOT run. The prereg stages the 12-seed confirm
(fresh band 53201–53212) on a pilot GO only; the pilot as
judged is NO-GO, so no confirm spend — killed-at-pilot in the
staged sense. The confirm band stays fresh for the next run
under the revised metric.

## Wall numbers (this run)

National / table-sat / doors-entered / wins: baseline
**0 / 5 / 0 / 0** → armed **0 / 5 / 5 / 5** · Wave-4 unlocks
7/8 → 7/8 · Wave-5 unlocks 4/8 → 2/8 (the two wave-5
unlocks sit on seeds that won on d90–94, before the wave-5
fights the baseline plays on d113/d121 — truncation, not
loss) · Wave-5 kills 2 seeds → 0 (same cause) · Lesser seats
earned 5/8 → 5/8, sat 5/8 → 5/8 · Full seat 0/8 → 0/8 ·
Median survival 150d → 90.5d (all seeds; the five wins end
their runs) · Max 150d → 150d (53001, never sat). National is
still 0/8, the full seat still names national — the win came
through the LESSER seat, which is exactly what TABLE.md
prices: the lesser seat is reachable by competent non-god play,
and five lesser seats just won.

## Per-seed table

| Seed | Leg | Days | End | Standing | Scale | Max wave | Seat | Sat | Entered | Pair days | Starv | w4 / w5 kills |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 53001 | base/armed | 150/150 | survived | 175/175 | regional | 4/4 | none | — | — | 0/0 | 0/0 | 0/0 |
| 53002 | base/armed | 79/79 | village-lost | 125/125 | regional | 4/4 | none | — | — | 0/0 | 0/0 | 0/0 |
| 53003 | base/armed | 150/90 | survived/won | 344/245 | regional | 5/5 | lesser | d90 | beloved/light | 2/2 | 0/0 | 3/2, 1/0 |
| 53004 | base/armed | 150/94 | survived/won | 260/199 | regional | 5/5 | lesser | d94 | relay/grey | 17/0 | 0/0 | 2/1, 0/0 |
| 53005 | base/armed | 97/91 | lost/won | 230/230 | regional | 5/5 | lesser | d90 | defiant/light | 14/7 | 0/0 | 3/3, 0/0 |
| 53006 | base/armed | 150/93 | survived/won | 834/199 | regional | 4/4 | lesser | d93 | assimilated/light | 32/0 | 0/0 | 7/4, 1/0 |
| 53007 | base/armed | 86/86 | village-lost | 99/99 | regional | 3/3 | none | — | — | 0/0 | 1/1 | 0/0 |
| 53008 | base/armed | 150/90 | survived/won | 199/190 | regional | 4/4 | lesser | d90 | relay/grey | 0/0 | 0/0 | 0/0 |

Standing and wave-4 kills read lower on the won seeds because
the run ENDS at the win (d90–94): standing stops accruing and
the later wave-4 kills the baseline plays never happen. 53005
is the sharpest case: it won d90 after dying d97 in the
baseline — the win arrived a week before its death. Pair days
fall 65 → 9 for the same reason (the baseline's 65 come from
post-sit sanctity days to 150; a win ends the accumulation).

## Village assessment (plain words)

Five villages earned the right to sit, and this time somebody
walked through the door. Each one sat on the first morning it
was allowed — or within four days — and the table read its
life back to it, opened five or six doors, and the village
picked one and walked it the same morning: the Beloved sang
for a crowd that already loved them, the Relay stayed
both-hands and taught the machine to be both, the Defiant
walked away poorer and free, the Assimilated took the comfort
and kept the grief. All five won. The three villages that never
earned a seat lived and died exactly as they had before —
nothing about the door changed their fates, because no door was
ever offered to them. The chain now runs end to end through a
WON seat: wild ally-join, wave-4 kills, veterans, readiness,
wave-5 facing, the lesser seat, a walked door, a win. What
remains is the national Binding behind the full seat — and the
question the numbers now force: the lesser seat wins, so what
does the full seat still buy?

## Sense-test read (walked doors)

**The walks read as people playing distinct games, not one
template with the door name swapped.** 53003 Beloved/light:
beats hunter → song → quiet, final audience — "The show
becomes the government. Strange. It works. Trillions of viewers
hold the table to account in real time, and humanity's seat is
wherever the cameras are. You made popularity into a
constitution — and constitutions, unlike ratings, don't dip."
53005 Defiant/light: beats harvest → name → overlay → pay,
final walk — the price list is paid item by item ("You came to
the table to tell it no... Humanity walks. But walking has a
price list — and the table just slid it across the light."),
then "Humanity walks — poorer, whole, free." 53006
Assimilated/light: beats kitchens → citizen → truth, final
comfort — "The terms held — the table had priced the village,
ascension and all, and the village paid in full." 53004/53008
Relay/grey: four probe beats, final both-hands — "The middle
road is open," then the both-hands ending as written in
`table-relay.js`: "You come back out of the wires. Mostly...
'Neither,' you say. 'Both. Whichever the village needs.'... 'BOTH
HANDS,' it says, testing the words. 'THE TENDER ONE TEACHES. THE
TOTAL ONE WINS.'" Every walk ends with the same plain line:
"You won. Say it plainly: you won. The village endures. The
table signed."

**The audits stay specific.** 53004's deed-voice names its own
kills ("They faced Loud-Eyes and lived to sit here. They faced
The Audit and lived to sit here. Even now the wave-5 bar reads:
blood your fighters (1 of 2 veterans).") 53006's audit carries
the ascension note ("The table notes 1 ascension from one
village — its terms improve accordingly. Nobody has ever seen
that before.") and the honest overtime note ("0 weeks kept
waiting, 1 of Haven lost meanwhile. Every door's standing −3").
The branch lines are ledger-true on all five ("The protected
outnumber the killed; the food truth was shared. The light
road is open." / "The middle road is open." for the grey
relay walks).

**Two repetitions worth noting, not defects claimed.** 53005
d88: the same grief-card sentence fires three times with the
village name swapped (Stonebridge / Thornfield / Ashford) —
true to the fiction (three links grieving at once) but
verbatim-repetitive as dialogue; same class as the takeseat
finding. 53005 d89: the pre-day-90 table-talk finding
reproduces (Dina to Cecilia: "The table's set. The ring of
pale light — it's just sitting there.") — the floor gates the
announcement and the preview, not the talk; already filed, not
re-filed.

## Metric review

Pre-registered metrics bind this run (prereg 6a313ab5a). As
judged: primary (≥3/8 entered vs 0/8) ✓ 5/8; substrate sanity
(baseline lesser ≥3/8 AND sat ≥3/8) ✓ 5/8 and 5/8; substrate
guard (≥6/8 per-seed exact) ✓ 8/8; cost bar starvation ✓ 1 vs 1
/ arm-only 0; cost bar median ✗ 86 vs floor 120. No metric was
swapped, re-cut, or re-thresholded after the run — the verdict
stands as NO-GO on the frozen header.
- What the metric got wrong, honestly: (1) THE MEDIAN. The
  non-won median compares different populations once wins
  exist: the armed set (n=3, only no-seat seeds) against the
  baseline set (n=8, including five sanctity-extended 150d
  lives). The prereg's parenthetical ("a won seed's truncated
  days are a victory") states the intent the implementation
  defeats. PROPOSED REVISION for the next run: per-seed
  survival non-inferiority — no non-won seed dies earlier than
  its baseline pair (won seeds count as success) — OR the
  median computed over all seeds with won seeds counted at the
  horizon (150d). Under either revision this run passes the cost
  bar (no seed died earlier; horizon-counted median 150 vs
  floor 120). (2) The same truncation drives the panel's
  deaths/100d regression_signal (deaths/run fell 59.875 →
  55.375; the rate rises only because five runs end at the
  win). Any per-day rate needs the same treatment: wins are
  censoring events, not short lives. (3) Pair days as a recorded
  secondary did its job (65 → 9, explained by win truncation),
  but a future arm that wants to claim "winning preserves the
  village" needs a post-win measure, not pair days — the run
  ends at the win, so there is no post-win village to measure.
  (4) The 53005 days-91/gameDays-90 split is a harness
  loop-iteration boundary artifact (final answered d90, win
  d90); the analyzer's median uses `days`, which overstates a
  won seed's length by one iteration — immaterial here (won
  seeds are excluded), but a future analyzer should prefer
  gameDays. (5) The driver's tableLines filter missed the relay
  win/epilogue lines (the both-hands outcome text contains no
  "table" match term); the win is proven by the door log
  (final:both-hands → done) and `won:true`, and the outcome
  text is quoted above from `table-relay.js` — but a future
  door arm should add "You won" / "both-hands" to the capture
  filter.
- Instrument notes: 0 instrument errors on all 16 files. The
  door-drive skip tallies are large by design (~267
  'preview-null' skips per sat seed — the idle path on every
  upkeep before the sit; ~450 on the 150d no-seat seeds), the
  same class as takeseat's not-announced skips. The
  instrument's `sitAttempts` counts all four wrapped table
  verbs, so armed seeds read 6–7 (1 sit + 5–6 door answers) —
  the sit count itself is `takeseatStats.seatTaken` (1 per sat
  seed), and the analyzer judges sits from that, not from
  `sitAttempts`.

## Balanced panel (§15) and telemetry

Panel `evidence/2026-11-07/doorwalk-panel.md`: decision
`review_required` (the 8-seed screen's standard cautious
verdict). Table win rate **0 → 0.625** (change_signal — the
first wins the panel has ever seen); national 0 → 0,
survival30/60 1 → 1 (no movement); villageDeaths/run 59.875 →
55.375 (−4.5, no material signal); villageDeaths/100d 48.6 →
58.1 (regression_signal — the denominator artifact, see metric
review); communityLost 0.375 → 0.25 (no material signal). The
panel does not observe door entry (contract has no door
mapping) — entry is judged from the analyzer, as the prereg
states. Telemetry deviation check: `scripts/telemetry-check.js`
REFUSES recorder-corpus input (same refusal as
sitstep2/feastdrive/takeseat — "all 8 --current rows carry
top-level anchorCommit"). No LOUD line, no deviation signal;
zero src/js changed, so no Game-telemetry baseline exists to
deviate from.

## What this arm does NOT claim

- Not a full seat: 0/8 full, national 0/8. The wins came
  through the LESSER seat. The full seat still names national
  standing, and no village has reached national.
- Not "any door wins": four doors walked (beloved, relay ×2,
  defiant, assimilated), all assigned, all light or grey. Feared
  was offered on all five sits and never walked (never assigned,
  never the fallback — the fallback was never needed); witness
  was offered on four sits and never walked; the dark branches
  were never exercised; trial-by-combat was never opted into.
  A feared walk, a witness walk, a dark walk, and a trial are
  still unmeasured on this substrate.
- Not "bots should walk doors": the policy is a measurement
  instrument standing in for the player (Steve-call). Whether
  any bot should sit or walk in real play is still the player's
  call.
- Not "winning is safe": a win ends the run — the village's
  later fate (wave-5 fights, feasts, succession) is unplayed
  after a win by design. The win is the end of the measurement,
  not a claim about what comes after.
- Not a recorder artifact: the guard is 8/8 exact
  (never-entered whole-run, entered pre-entry), the baseline
  entered 0/8 with the gate off (the RED pin, live), the two
  independent door records agree on every seed, and the proof's
  53001 live check reproduces the baseline exactly armed-vs-
  baseline.

## Next blanks (for the loop, not this arm)

1. **The metric revision + confirm (binding):** re-register the
   cost bar with per-seed survival non-inferiority (or
   horizon-counted wins) and run the 12-seed confirm on fresh
   band 53201–53212 (freshness-checked this run; 53101–53112
   collided with winseat 2026-10-18 — do not reuse). The pilot
   already shows 5/5 wins; the confirm's job is to show it is
   not a band fluke.
2. **The un-walked doors:** feared (offered 5/5, walked 0/5),
   witness (offered 4/5, walked 0/5), dark branches, trial-by-
   combat. A rotation that assigns feared/witness and a
   trial-armed variant would close the coverage — each is a
   separate pre-registered decision (trial risks the Bearer).
3. **The national Binding** — unchanged: national is the only
   missing full-seat item on the sat seeds, and now the only
   thing the lesser seat cannot buy. The full seat's price is
   the next rung.
4. **Sitter-dies-mid-sitting, feast draws under sanctity,
   pre-day-90 table-talk** — all Steve calls, unchanged from
   the 1330Z round (the d89 table-talk reproduced here on
   53005).

## Proof and commits

- Proof `scripts/test-doorwalk-b-20261107.js`: 30/30 green on
  this worktree before the judged run (RED phase with a
  throwing engine stub, 12 GREEN fixtures, rotation mapping
  pinned, composition exactly-once fixtures on a real loaded
  game, live 53001 baseline-vs-armed exact reproduction, live
  53003 armed smoke leg walking beloved@d90/light, analyzer
  pure-function fixtures).
- Prereg committed 6a313ab5a before any judged sim. Tooling
  committed 3c10f561b (door-walk policy, driver, analyzer,
  panel builder, proof 30/30, sweep-compare registration; zero
  src/js, zero policy edits). The safe-commit index clobber hit
  on both commits (files shown staged-as-deleted after correct
  commits); repaired with HEAD-blob cacheinfo, verified `git
  status` empty + `git diff HEAD` empty + hash-object matches,
  each time.
- Judged corpus: `evidence/2026-11-07/perseed-doorwalk-b-baseline/`
  and `perseed-doorwalk-b-armed/` (8 files each, base 62ca38845,
  0 instrument errors). Analyzer output saved at
  `/tmp/doorwalk-b-analysis.json` (working copy; the evidence
  file above is the record). Panel
  `evidence/2026-11-07/doorwalk-panel.md` (+ `.json`,
  `-before/-after.json.gz`).
- Base note: the worktree HEAD 62ca38845 IS local master
  (origin/master 2016a7ed0 is an ancestor — the unshipped 1330Z
  round sits ahead of origin); no rebase was needed, no proof
  re-run was owed to a rebase.

## Convergence

**scale-onramp: converging, NOT converged.** The chain now runs
end to end through a WON seat: 5/8 lesser seats sat, 5/5 walked,
5/5 won — the first wins on any substrate. The verdict is NO-GO
on a defective median bar, not on the lever; the metric review
carries the fix. What remains is the national Binding (0/8),
the full seat (0/8), and the un-walked doors (feared, witness,
dark, trial).
