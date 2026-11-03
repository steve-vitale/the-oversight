# journey-deepening r90 — run note (lane A, leg 2 DEEPENING)

**Run id:** laneA-deepening-2026-11-03T1245CST. Base master@9d489bcd3 at
worktree creation; worktree `journey-deepening`. Rotation read 2 →
deepening; 2→3 written at closeout and verified by read-back.
Prereg: evidence/2026-11-03/journey-deepening-r90-prereg.md (committed with
this run; written BEFORE any seed ran). Seeds fresh 93301–93304, competent
policy (r89 driver lineage) + W4 wild-fight instruments, DAYCAP=100,
death-aware stop. Smoke seed 93300 × DAYCAP=45 proved the harness runs
(survived day 46, wave 3, meat chain fired, 0 mislabels) but recorded zero
tb fights, so the new instruments were proven on a second throwaway seed
93399 × DAYCAP=100 (19 tb fights, party/weapon/armor snapshots populated,
then deleted per the prereg — throwaway, not judged). Main panel ran
~4.5 minutes for 4 seeds.

**Infrastructure note (loud, not blocking):** worktree registration took
~8.6 minutes (same slow-checkout class as r89, under heavy concurrent git
contention — a Loop B adoption registration was running its own `git
worktree add` at the same time). Registry heartbeats also queued behind
the registry lock for several minutes mid-run; the background 10-minute
heartbeat loop plus manual heartbeats kept the tree fresh (verified
19:31Z, 19:44Z, and at analysis time). No work was lost.

**Regression-gate note (loud):** `node scripts/check.js --quick` produced
no output in ~11 minutes (process alive, ~1s CPU — apparently waiting on
a shared lock/subprocess under concurrent-agent load) and was terminated
rather than left hung. This run changes zero game code — only three new
scripts files and two evidence files — and its relevant verification is
green: the r90 proof test 35/35 (twice, before and after the analyzer
clamp edit), driver/analyzer syntax checks, and six live seeds run clean
through the new instruments. The full quick gate is owed a re-run on a
quieter tree, not a silent skip: it is recorded here, not claimed.

## Panel verdicts (pre-registered, no re-scoring)

- **W4-REACH (descriptive): 3/4 seeds** with >=1 wild wave-4 fight
  (93301, 93302, 93304). 93303 reached wave 4 with readiness met and met
  zero wave-4 beasts — gate met, no meeting.
- **W4-KILL (diagnostic): 1/26 wild wave-4 fights ended in a kill.**
  The one kill: seed 93304, day 47, a congregation, party of 3, leader
  with a sharpened stick and armor 4, damage fraction 1.056 (overkill) —
  the earliest W4 fight on that seed, won on weak gear. Every later W4
  fight on that seed (13 more) ended in death or flight.
- **W4-OUTCOME (diagnostic):** player-died 23, player-fled 1,
  monster-fled 1, kill 1. Median damage fraction dealt on fought
  (non-fled) W4 fights: 93301 0.584, 93302 0.347, 93304 0.359. Parties
  deal roughly a third to a half of a wave-4 beast's health, then die.
  Reunion triple packs are the worst shape: damage fractions 0.004,
  0.084, 0.113 across three fights — the party barely scratches three
  beasts at once before dying in rounds 2–3.
- **W3-BASE (comparison):** 18 wild wave-3 fights: 6 kills
  (93301 2, 93302 2, 93303 2, 93304 0), median
  fought damage fraction 1.0 on 93301/93302 (kills), 0.626 on 93303
  (mixed: 5 monster-fled, 3 player-fled, 1 player-died, 2 kills),
  0.141 on 93304 (single fight, died). Wave 3 is winnable and often
  fled-from by the monster; wave 4 is not — the cliff sits between
  waves 3 and 4, not inside wave 4's own scaling.
- **Readiness does not save the fight (the prereg's interesting case,
  observed):** seed 93301 ended with wave-4 readiness MET (armored 5,
  armed 5, tricks 22, veterans 2, short []) and still went 0/5 on W4
  fights, all on day 100, all in rounds 1–6, all player-died except one
  flight. Seed 93303 also ended readiness-met (8/8/23/2) with zero W4
  meetings. Seeds 93302/93304 show readiness unmet at seed end, but
  those snapshots are post-collapse (roster 0) and prove nothing about
  the gate — do not cite them as "unready villages died."
- **Villager-side field fights (w4ship, same window):** 17 wave-4
  fieldFight calls, outcomes vFlee/vDie only — zero villager wave-4
  wins in this panel (93301: 1 vDie + 2 vFlee; 93302: 4 vDie + 6 vFlee;
  93304: 1 vDie + 3 vFlee). The wall is not a player-only shape.
- **M4 people: 12/12 transcripts read; 11 clean, 1 weak.**
  The weak one is 93302-day45 (Isabella): the capture driver pressed
  "Tell me more" 9 times and the musician cycled varied joy one-liners
  without her ask_favor want ever surfacing — a filler-loop shape, but
  capture-amplified (a real player would pick react/invite instead of
  "more" nine times; the lines are varied, analyzer maxRepeat=1, no
  verbatim loop). Strictly, the pre-registered "0 senseless" bar is NOT
  met — reported as 11 clean + 1 weak, not rounded up. The other 11 are
  coherent: Ricardo's favor arc across three sittings (food → pantry
  run with place and time), Isabella's grief for Owen (day 60, strong),
  Nitin/Jimena water hauls with the honest road caveat ("I'm out on the
  road... find me when I'm back"), Anil's gossip chain (Madina out,
  Bongani trekking, Meera and the creek water).
- **M5 winnable (descriptive, by endReason): 2/4 survived**
  (93301, 93303); 93302 lost day 96, 93304 lost day 95. All four reached
  regional scale and wave 4.
- **STAY-GREEN: 0 mislabels** on all seeds.

## Village assessment, in plain words

Two villages made it through the window and two did not, but all four
climbed to regional standing and unlocked the fourth wave — the climb
works, the fourth wave kills.

- **93301 (survived, day 100, wave 4, regional):** 5 alive at the end —
  Pablo the mortician, Oliver the veterinarian, Yuki the librarian,
  Ella the ESL teacher, Boris the blacksmith. Readiness fully met. And
  yet the fourth wave, when it finally arrived on the last day, killed
  them in five straight fights: eulogies, rounds 1–6, damage dealt just
  over half before the leader fell. A village that did everything right
  and still could not land a fourth-wave kill.
- **93302 (lost, day 96, wave 4, regional):** nobody left. Seven
  fourth-wave fights, seven leader deaths — influencer, eulogy, audit,
  eater, herald — with gear ranging from a phase blade at armor 70 to
  bare hands at armor 0 as the village collapsed around them. Villager
  field fights tell the same story: 10 wave-4 meetings (3 villager
  deaths, 7 flights), no wins.
- **93303 (survived, day 100, wave 4, regional):** 8 alive — Koray,
  Nathan, Meera, Bongani, Stan, Madina, Anil, Ashanti — the biggest
  household, readiness fully met (8 armored, 8 armed, 23 tricks,
  2 veterans), and not one fourth-wave fight. The wave unlocked; the
  beasts never came. This is the other half of the funnel: some villages
  never even get the chance to lose.
- **93304 (lost, day 95, wave 4, regional):** the one kill in the
  whole panel lives here — a congregation beaten on day 47 by a party
  of three with a sharpened stick. Then the wall closed: reunion
  triples the party could not scratch, suburbs, eaters, and a run of
  eulogies across days 91–95 that finished the village. Fourteen
  fourth-wave fights, one kill, twelve leader deaths.

What they knew: every village reached regional scale with an active
hierarchy link, and readiness bars (armor, weapons, tricks, veterans)
were met on both surviving seeds. What was missing: not gear, not
standing, not readiness — the ability to survive a fourth-wave fight
long enough to finish it. Damage is close-ish (a third to a half);
staying is the gap.

## The blank this run documents, not fixes

The wave-4 kill gap, now pinned to the fight itself rather than the
gate: readiness met (93301, 93303) changes nothing about fight
outcomes; parties deal 35–58% median damage and die; triple packs deal
~0–11% and die in 2–3 rounds; villager field fights go 0/17. No fix is
landed here because a fix at this point is a balance/design call about
damage and staying (the levers Steve has bounded: board-changing, not
number inflation; gates untouched without an explicit order), not a
tooling patch — it travels as a proposal, not a silent change. Two
smaller blanks ride along: (1) transcript capture hammers "Tell me
more" — the next run's driver should rotate conversation choices so a
more-spam reel stops masquerading as a conversation finding; (2) raw
damage fraction exceeds 1 on overkill (monster HP goes negative) — the
r90 analyzer clamps medians to [0, 1] while stored per-fight values
stay raw so overkill remains visible.

Note on party size: player-led turn-based fights field the leader plus
up to four allies (partySize 5 seen) — a different shape from the
field-fight "leader plus one ally" picture in the alignment notes. No
contradiction is claimed (different fight engines); the distinction
matters for where ally-join help can land.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
hidden_files/telemetry-baselines/deepening.json, metrics w3fights,
engaged.w3, fightsTotal, fightsByWave.3:

- **LOUD: w3fights 6 → 18, engaged.w3 7 → 23, fightsByWave.3 6 → 18
  (n=4 files). Verdict: EXPLAINED, not a bug — and the baseline was NOT
  rolled forward.** Same shape error as r89: the baseline file carries
  no seed count, so a 4-seed sum cannot be judged against it as a swing
  (per-seed means: w3fights 4.5 vs baseline 6, engaged.w3 5.75 vs
  baseline 7 — no rise at all). Total fighting is healthy (fightsTotal
  sum 60, mean 15.0/seed). The baseline needs an n-annotated reseed
  before it can judge anything; rolling a 4-seed sum over it would bake
  in the same shape error.

## Metric review

- **M4 strict bar vs capture artifact:** "0 senseless" fails on a
  strict count (11 clean + 1 weak) where the weak transcript is
  driver-amplified more-spam. Next run: rotate transcript choices in
  the driver AND keep the strict bar — a reel the driver creates is
  still a reel the player could create by pressing "more" nine times,
  so the bar should not be softened, only the capture made fairer.
- **Readiness snapshots at seed end on lost villages are
  post-collapse zeros** (armored 0, armed 0, veterans 0) — next run:
  judge readiness from the last pre-collapse snapshot, not the final
  one, or the gate looks like the cause of deaths it merely followed.
- **Telemetry baseline shape:** unchanged from r89 — deepening.json
  has no seed count or regime label; sums across panels cannot be
  judged against it. Reseed with explicit n before the next telemetry
  check.
- No pre-registered metric was re-scored mid-run. W4-REACH, W4-KILL,
  W4-OUTCOME, W3-BASE, M4, M5, STAY-GREEN are reported exactly as
  pre-registered.

## Harness

scripts/journey-deepening-r90-20261103.js (r89 lineage + W4 instruments:
fight-start party/weapon/armor snapshot, veteran flag, classifyFightOutcome
+ dmgFrac on every fightsLog record, wildFightTable + w4ship outputs;
zero game-code change). Analyzer:
scripts/analyze-journey-deepening-r90-20261103.js. Proof:
scripts/test-journey-deepening-r90-instruments-20261103.js — 35/35
(classifier six classes + multi-monster partials, analyzer medians,
driver markers). Per-seed JSONs and 12 transcripts: goal hidden_files
evidence 2026-11-03 (journey-deepening-r90-seed9330*.json,
journey-deepening-r90-transcript-*.txt).

## Verdicts

- **Reachable: yes.** Wave 4, readiness met, regional scale, and wild
  wave-4 fights all occur under ordinary competent play without
  steering (3/4 seeds met a wave-4 beast; the fourth unlocked the wave
  but met none).
- **Fun: mixed, with a sharp edge.** Villages feel alive — favors,
  grief, gossip, honest road caveats — but fourth-wave fights are
  short, lethal, and mostly one-sided (23 leader deaths in 26 fights).
  The single kill came early on weak gear, which reads as luck, not
  mastery. The climb is enjoyable; the wall at its top is a cliff.
- **Winnable: not through this window's wave-4 path.** 1/26 wild
  wave-4 kills, 0/17 villager field-fight wins, readiness-met seeds at
  0/5 and 0 meetings. Progress toward a win is real (regional +
  readiness on 2/4 seeds), but the wave-4 kill step is the choke point
  — confirming, with per-fight evidence, the funnel picture that made
  winnability the top priority.
