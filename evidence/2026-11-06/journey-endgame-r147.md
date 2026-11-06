# Journey endgame r147 — Lane B, leg 4 (2026-11-06 12:00 CST run)

Pilot: 4 seeds (89701 waves, 89702 waves, 89704 forcedrift control,
89705 wavesnw), 180d death-aware. Substrate: master `1e8db620d` PLUS
this run's Fix B volume build (`e212e5adc` + `345d9643`). Prereg:
`journey-endgame-r147-prereg.md` (this dir). Analyzer output:
`journey-endgame-r147-analysis.txt`. Pilot log:
`journey-endgame-r147-pilot.log`. Per-seed corpora:
`perseed-endgame-r147/`. Dark re-verify:
`perseed-endgame-r147-dark/` + `journey-endgame-r147-dark.log`.
Smoke (pre-pilot, 89701 x 120d): `journey-endgame-r147-smoke.log`.

Run incidents: registration slow (~11 min, registry-lock contention
under sibling sim load) but clean on first attempt; heartbeat
verified by read-back (18:07:21Z) with a 10-min loop running.
safe-commit.sh index clobber hit on BOTH commits (committed files
showed as D/MM in the worktree index; worktree bytes == HEAD blobs
in every case) — repaired with the established
`update-index --add --cacheinfo` recipe, verified `git status`
empty + `git diff HEAD` empty after each. Master moved mid-run
(journey-deepening r109 + sim-winnability round-1630 landed):
branch rebased onto explicit master SHA at closeout, proof tests
re-run, then merged --ff-only.

## Headlines (per seed)

- **89701 waves: village-LOST — scattered d83, pantry 0, alive 2.**
  Standing peak 75, uw=3, w4 faced 0. The scatter persists a FOURTH
  time (r140 d53, r143 d80, r144 d78, r147 d83) — latest yet, but the
  weakest trajectory: standing 75 vs 135, wave-4 faced 0 vs 3. Zero
  census fights (see M2 investigation below). 14 deaths, named
  (Yaqi ambush d18, Ivan alien d25, Wanda Xi stranger d31, Ava
  sickness d36, Sofia + Nadia starvation d39). 15 hold lines, evenly
  spread [3,3,3,3,3], 0 adjacent repeats (r144: 547, all identical).
- **89702 waves: WON LESSER — announced d126, sat d127,
  beloved/light, final:quiet, alive 4.** Standing peak 199, uw=4.
  FLIPPED from r144 (village-LOST via withdrawal d90 → lesser win).
  The pellet blocked the food thesis until the feast surge landed
  d125; the table announced the next dawn. Cristóbal put down
  Don't-Look AND The Loud Stare on day 123 — two wave-4 kills, the
  first pilot kills in this series since r143. 18 census fights.
  Raid arrivals 64 → 0 (see raid investigation below). 1 ascension
  (Fengying Xiong, relay).
- **89704 forcedrift: village-LOST — scattered d48, alive 4.**
  Standing 0, uw=3. Control behaves as control — raid days
  byte-identical to r144 (10 events, same days).
- **89705 wavesnw: WON LESSER — announced d90, sat d91,
  beloved/light, final:quiet, alive 2.** Standing peak 199, uw=4.
  Same headline as r144 (lesser win) with a different path and
  final (r144: feared/light, final:mercy). 5 census fights.

Tally: lesser 2/4, full 0/4, wave-5 unlocked 0/4, faced 0/4,
wave-4 kills 2 (both 89702, both Cristóbal, d123).

## Fix B volume — BUILT, PROVEN, VERIFIED IN THE WILD

The r143 Fix B narrated every wait with one fixed line; r144
counted it 547x on 89701, clustering in threes. This run rotates
the hold line through 5 variants via a transient run-level counter
(`Game._waitLineCount` — the first draft's fight-level counter
showed a restart artifact in the smoke run: a fight ending on
line 0 followed by a new fight opening on line 0, 2 adjacent
repeats in 15 holds; the counter moved to the run level before
the pilot). Proof test `scripts/test-tbwait-variety-20261106.js`:
12 forced waits, no two consecutive identical, all 5 lines
reached, first wait still "holds and watches" (r143
compatibility), no line monopolizes — GREEN, RED-verified on
pristine (fails: `tbVillagerWaitLine is not a function`).
Wild: 89701's 15 holds split [3,3,3,3,3] with 0 adjacent repeats
(vs r144's 547 [547,0,0,0,0], 546 repeats). V-WAITVARIETY GO 4/4.
In the Choir Toad fight the rotation reads mid-battle: "Chloe
waits, eyes on the beast." / "Liam holds position, watching for
an opening." / "Nadia stands ready, watching." — six consecutive
waits, all different lines, all narrated.

## M2 NO-GO investigation (89701: zero census fights)

M2 requires ≥2/3 Arm A waves seeds with ≥1 committed wave-4
fight; 89701 recorded 0 (89702: 18). This is a genuine trajectory,
not an instrument miss: the game's own audit agrees (fullseatMax
w4=0, uw=3, standing peak 75) — the village never faced a wave-4
monster in 83 days. Its fights were wave-1 hushpuppy combats,
which the census correctly does not count as committed wave-4
fights. The village lived LONGER than r144 (scattered d83 vs
d78) but accomplished LESS across every deed (w1 12 vs 14, w2 10
vs 11, contests 9 vs 8, foodShared 74 vs 115, score 178 vs 214).
The "stops at the boundary" lines (7) are the follower-chase
travel rule, not a wave gate — they do not explain the zero.
Attribution: single-seed trajectory divergence under the named
deltas (same class as r143→r144's flips; fight-outcome changes
re-roll whole trajectories). No single delta is implicated.
METRIC REVIEW item: the pilot runs 2 waves seeds (89701, 89702)
but the bar is written ≥2/3 — with 89703 never in the pilot,
arm A is effectively 2 seeds and the bar is 2/2. Next run: add
89703 to the pilot or restate the bar as ≥2 waves seeds.

## 89702 flip investigation (withdrawal → lesser win)

Same seed, same probe policy, only game-code deltas (a)–(g) +
Fix B volume between the substrates. r144: withdrawal d90,
alive 1, no surge ever. r147: surge d125, announced d126, sat
d127, alive 4, 2 wave-4 kills d123. The withdrawal itself fired
correctly in both runs (pre-offer, pellet-blocked food thesis,
table never announced); the difference is the trajectory: this
time the feast armed and the surge landed. The re-fire worked:
withdrawal d90 → surge d125 → announce d126 → sit d127. The
re-fire VOICING is not observable in the pilot transcript (the
probe slices the transcript at the announce — instrument limit,
carried). No announced-then-dip case arose, so V-STICKYOFFER is
UNMEASURED (not failed) and V-PREOFFER HOLDS (withdrawals fired
only on never-announced tables: 89701, 89702-d90, 89704).

## Raid investigation (89702: 64 → 0 arrivals)

The "🌙 Raid — <Village> came in the night" arrivals collapsed
on 89702 (64 in r144 → 0 in r147) while 89701 held steady
(16 → 15, same-day clusters intact) and 89704 was byte-identical
(10 events, same days). This is NOT the raid-density cooldown
working: the cooldown spaces raids within a 7-day window for a
young national — it never zeroes them — and 89701 proves village
raid arrivals are untouched outside the young-national window.
The cause is trajectory: the hostile neighbors never formed on
this run (Emberhold 115 → 2 mentions, Thornfield 121 → 2,
Stonebridge 70 → 1, Ashford 25 → 0, Hungry Road 75 → 0; the
two mentions that exist are benign gate/sighting lines). No
blocked-raid fiction appears either (no "quiet night", no scout
fiction, no beg lines) — no raids were staged at all, so there
was nothing to block. V-RAIDDENSITY is UNMEASURED (no
young-national raid staging on any pilot seed — 89701 never went
national, standing peak 75; 89702/89705 staged zero raids) and
falls to the next endgame run, same as r144.

## 89701 flip investigation (fourth scatter)

The away-ration hypothesis is WEAKENED by this datapoint: away
share fell (48% → 41%) yet the village still scattered — and it
starved at home instead of away (0 feasts held vs 4 in r144,
BUFFER_SHORT 1 → 6, PLAN_REFUSED "Nobody is here to feast with"
×2). New leading thread: pantry/feast starvation — the village
could not afford feasts, so no surge, standing stalled at 75,
wave 4 never faced. The scatter itself is voiced as pantry
hunger (day 3 of hunger, lingering monsters circling empty
stores, a trader arriving too late), not as away-rations. Still
needs a discriminating test, not another observation.

## Dark re-verify (S1/S2 — GO)

Full dark probe re-run as r147 (7 variants, same policy, fresh dir
`perseed-endgame-r147-dark/`): **identical to r143/r144** — v1a
26/27 (D2-twist-fired curdled, the expected by-design non-ok),
v1b 23/23, v1c 24/24, v2 18/18, v3 25/25, v4 20/20, v5 17/17.

- **S1-sitter-coda GO:** the v3 walk-out line names the sitter,
  Amelia Moon — "Amelia Moon walks out of the light alone, which
  is how they walked in."
- **S2-dark-holds GO:** D1–D4/D6 green on the new substrate.

## Fix verification in the wild (closeout greps)

- **V-WAITVARIETY GO 4/4** (above): 89701 15 holds [3,3,3,3,3]
  adjRepeat=0; other seeds 0 holds.
- **V-FixB HOLDS:** 194 villager turns across the pilot
  transcripts (89701: 134, 89704: 60), zero silent. (The naive
  scan flags 72/3/16 "silent" turns — all monster turns:
  Hushpuppy, Big Loud, Redactor, Extended Warranty — whose action
  lines do not start with their name. Villager-only: 0.)
- **V-Gorge HOLDS:** 0 "gorges — 0 kcal gone" lines.
- **V-POCKETSAND SUPPORTED:** on 89701 the scholar pressed sand
  3× in the Choir Toad fight (lines "You fling a handful of grit
  into its eyes. (pocket_sand: blinded)" + 2× "half-blind for 2
  rounds") and never fled that fight. No losing-window
  flee-with-sand-held case arose to falsify: the 5 barrier exits
  after sand was gained were tactical disengagements mid-fight
  (Big Loud: party landing 31/29, no hurt shown, "Walking away
  is winning too"), not losing-window flees. Strictly: the
  losing-window press-before-flee rule is supported by the
  positive case, not proven by a losing-window case.
- **V-FixC UNMEASURED (not failed):** both sittings walked
  beloved with no combat finale, so no finale fight with a stuck
  helper arose; the help-branch fallback had no case to fire on.
  Falls to the next endgame run.
- **V-RAIDDENSITY UNMEASURED** (above).
- **V-STICKYOFFER UNMEASURED** (above).
- **V-PREOFFER HOLDS** (above).

## People check

Both sitting seeds' finales read as people. 89702 (beloved/light,
final:quiet): the audit names Cristóbal's double kill ("On day
123, Cristóbal put down Don't-Look. On day 123, Cristóbal put
down The Loud Stare."), Wanjiru tells the unproduced truth, the
Living Garden demonstration spends the finale slot on "people
the cameras never found", the Architect coda credits Fengying
Xiong's relay ascension ("the god's name... who built the door"),
and the Oversight ending lands the pod-children sting ("They are
still there. Still small. Still waiting for someone to decide
they matter more than the moment."). 89705 (beloved/light,
final:quiet): same structure, different people — Leo tells the
truth, the Stalker line replaces the Garden line ("You play it
the way a Stalker plays everything: all the way, in public.").
The endings vary by build as designed. 89701's scatter reads as
a real defeat, not a bug: pantry empty, third hungry day,
lingering monsters circling empty stores, a trader arriving too
late. Deaths carry names and causes (Yaqi ambush d18, Ivan alien
d25, Wanda Xi stranger d31, Ava sickness d36, Sofia + Nadia
starvation d39). No fabricated shared history, no filler loops
in the sampled passages.

## Verdicts (from analysis)

GO: M1-guard 4/4, M2c, M2d (11/11 classified), M2b (3/3 causal),
M8-exit-canon, MFLEE-routed 5/5, M13, M14, M5 (vacuous), M5b
(vacuous), M10, M11, M12, M15, M16, M17, KILL-ANATOMY 23/23,
M18, M19, M20, M21, M22, REG-r35, REG-r37, VETCONV 3/3,
SECOND-VETERAN 3/3, FIRENARR 4/4, HURTRETURN 4/4,
FALLEN-ambush 4/4, LOSSKIND 2/2, V-WAITVARIETY 4/4.
NO-GO: M2-census (89701 zero committed wave-4 fights — genuine
trajectory, see investigation), M3-conversion (armB 0 vs armA 2
kills — the wavesnw arm did not out-kill the waves arm),
M3b-peak (peak living veterans 1, never 2), M4-wave5-or-full,
W5-question (no uw=5 seed). **PRIMARY-BINDINGS NO-GO |
PRIMARY NO-GO | ALL NO-GO** — the road is closed; the pilot
bindings hold except M2, which is a real trajectory miss, not
an instrument failure.

## Reachable / fun / winnable

- Reachable: partly — the lesser seat is reachable (2/4 this
  run, both beloved/light); the full seat and wave 5 are not
  reached by any pilot seed.
- Fun: yes on both sitting seeds (the mercy/quiet finals land,
  and the double-kill audit names a real villager's real day);
  the scattering losses read as real defeats, not bugs.
- Winnable: not yet — full seat 0/4, wave-5 kills 0, no seed
  banks 2 living wave-4 killers (peak 1, on 89702 d123).

## Gate

`node scripts/check.js --quick` on the rebased tree (rebased onto
master `408ba9648` at main-session closeout, 2026-11-06): **283
passed, 7 failed in 548s** — exactly the standing profile, zero new
failures. The 7: measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
capable-bot, establishment-r20-fixes (all standing). Fix B proof
(`scripts/test-tbwait-variety-20261106.js`) PASS on the rebased
tip. (A pre-rebase gate on the branch tip ran 277/13 under heavy
load; every failure beyond the standing set was a 120s timeout and
each timed-out script passed in isolation — trust-observer-
neutrality 6/6, solo-campaign-endings 15/15, time-save-crashes 5/5,
synergy-stall, table-endings 61/61, capable-bot failing only its
known standing case.)

## Telemetry

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/endgame.json
--current 'evidence/2026-11-06/perseed-endgame-r147/endgame-r147-*.json'
--metrics veterans.unlockedWave,won,peakLivingVeterans`:
**quiet** (4 files, 3 metrics, no large deviations). Baseline NOT
rolled on a quiet check, per prereg.

## Metric review

- M2's ≥2/3 arm-A bar on a 4-seed pilot that runs only 2 waves
  seeds is brittle (arm A is effectively 2 seeds; the bar is
  2/2). Propose for the next run: add 89703 to the pilot or
  restate the bar as ≥2 waves seeds. Not changed mid-run.
- The 89701 flip investigation stays open: fourth scatter, and
  the away-ration hypothesis is weakened (away 48% → 41%,
  feasts 4 → 0 held). New leading thread is pantry/feast
  starvation. Needs a discriminating test.
- The withdrawn-table question is CLOSED (Steve 2026-11-06 07:06
  ruling + landed sticky fix + proof). Remaining is wild
  verification (V-STICKYOFFER), which had no case this run.
- SIT-DAY-DEATHS dedupe (r124 proposal) stays open: no sit-day
  death this run (89702 sat d127, 89705 sat d91, both none;
  pre-sit weeks also none).
- V-RAIDDENSITY, V-FixC, V-STICKYOFFER wild verification all
  fall to the next endgame run (no case arose for any of them).

## Carry-forwards

- V-FixC + V-STICKYOFFER + V-RAIDDENSITY wild verification
  (no case arose in r147).
- M2 metric review (89703 in the pilot, or restated bar).
- 89701 flip investigation (fourth scatter; pantry/feast
  starvation now the leading thread).
- Fix B volume follow-up: none — verified in the wild, GO.
