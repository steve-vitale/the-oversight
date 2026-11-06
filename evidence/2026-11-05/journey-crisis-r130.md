# Journey crisis r130 — run note (2026-11-05, Lane B)

## Prereg
`goal hidden_files/evidence/2026-11-05/journey-crisis-r130-prereg.md`
(written before any scored seed; band 13001–13005 verified fresh).
Leg 6 (crisis). Rotation-b read 6 at run start; this closeout writes 7
(succession next). Driver
`scripts/journey-crisis-r130-delayed-20261105.js` (r129 driver verbatim
EXCEPT r130 filenames/paths/seeds and the W1 carried count, PLUS one
instrument change: the sim scholar's origin varies per seed — 13001
Columbus, Ohio; 13002 Austin, Texas; 13003 Portland, Oregon; 13004
Raleigh, North Carolina; 13005 Denver, Colorado — passed as `place` to
setupGame, to kill the Columbus-cohort echo), analyzer
`scripts/analyze-crisis-r130-delayed-20261105.js` (r129 analyzer
verbatim EXCEPT filenames/paths and the W1 carried count). Policy
oracleV2, 120d death-aware +10d tail, pilot seeds 13001–13005,
sequential. Panel evidence (JSONs, 32 transcripts, panel.log,
analysis.txt) in goal hidden_files
`evidence/2026-11-05/r130-panel/`; only the run note + driver +
analyzer are committed to the repo (r129 convention).

## Leg question (from the prereg)
1. W1, inherited from r129 with a count: does a re-muster after a
   refusal ever FULLY clear? Carried count: r126 16 + r127 5 + r128 9 +
   r129 0 = 30 refusals, 0 same-set re-musters, 0 ok sorties after a
   refusal, 0 full clears after a refusal.
2. GATE: does gate-one-short stay the majority refusal shape? Does
   availability-drain stay at zero?
3. WRAP-CHECK: with the driver's silent break paths carrying explicit
   markers, does every driven transcript carry a marked ending?
4. Refusal pile-up, descriptive: does the ~50% refusal rate persist?
5. Naming-stance wobble watch: a fourth sighting graduates it to a
   fix item.
6. G-ID watch: sixth panel at zero id-matched gorge-after-clear keeps
   the watch open, not closed.
7. Nonverbal-nod wrinkle: the same verbatim signing-nod pair recurring
   in >=3 conversations graduates it to a content fix item.
8. EARLY-DRIFT CONFIRMATION: does the fresh panel repeat r129's 70%
   early-drift shape with an attempt collapse (<8 attempts), or return
   to r128's shape?

## Determinism proof (prereg-required, before judging the panel)
**PASS** — filled by the r131 rescue run (2026-11-06 ~05:12 UTC), not the main-session
closeout (which never landed). Re-ran seed 13001 with the r130 driver in the same
worktree (`EVID=.../r130-det SEED=13001 DAYS=120`): panel JSON byte-identical
(`cmp` clean), all 7 transcripts byte-identical, stderr identical. Re-run: days 65,
game-over, 2 sorties, 7 convos — matches the panel row exactly. The origin-varying
instrument is trajectory-neutral; the panel below stands as judged.

## Panel verdict (BINDING metrics)
- C1 (bend, not break): **GO.** Every game-over has a named cause
  that is NOT a siege-mechanic failure: deaths are villager combat
  (22 of 24 total) + 1 bad belly + 1 expedition, and the villages end
  on empty pantries (final 0 on 13001/13003/13005, 1,204 on 13002 with
  0 alive). Horizon reachable on 1 seed (13004) — descriptive.
- C2 (episodes fire + gates hold): **GO.** Raids fire on all seeds
  (5/8/5/8/5); fought resolutions present on all seeds; D1 snapshots
  16/16, missing 0; D1 delayed>=3 attempts 16/16; D5 deltaBad empty;
  D3 drift unknown = 0 (labels: player-drawn-off 16, sortie-clear 4,
  moved-on-valve 16). D2 clear rate 0/7 — no sortie fully cleared
  anything this panel (cleared remaining-0 = 0), but that is not a C2
  bar. MISSED-WINDOW descriptive (R88 skipped-window total = 2:
  13001 d43 gallowdeer, 13005 d62 buffering).
- C2b (linger-conditional gorge/sortie): **GO.** Every
  boundary-firable case fires or is refused with a recorded reason:
  16 attempts, 7 ok, 9 refused. **W1: STILL OPEN, but the streak
  broke** — the FIRST same-set re-muster after a refusal ever:
  13004 d103, ok sortie on the same set refused d101/d101, remaining
  1 (not a full clear). Count now: refusals 39, same-set re-musters
  1, ok sorties after a refusal 1, full clears after a refusal 0.
- BENCH (descriptive): refused 9; shape gateOneShort 3, supplyEmpty
  1, **availabilityDrain 5**, other 0. No shape covers >=80%, so by
  the prereg rule: **mixed, no single lever** — majority shape
  availability-drain (5/9), gate-one-short ruled out as the majority
  this run (3/9, vs 6/9 on r128). Availability-drain REAPPEARS
  (prereg interesting-finding trigger): exclusion totals nodeAway 14,
  withYou 4, away 2 — the drain is villagers away at other nodes,
  not an empty bench. Refusals concentrate on 13003 (7 of 9, living
  bench 0–3 by the end) and 13004 d101 (2, bench 4 but nodeAway 3/2).
- C3 (people check): **GO.** All 32 driven transcripts read in full;
  fabricHits = 0; conversations meet the meaning bar (NPCs want
  something, options engage/deflect, endings resolve/plant/owe).
  Naming-stance wobble: NO fourth sighting — three naming debates
  (Wilhelm 13001 d19 The Understudy, 'Big Ugly' shouted down;
  Ruth 13002 d30 Sweeps Week, Temirlan pushing 'Big Big'; Stella
  13005 d39 Flashbulb Moth, 'Big Loud' shouted down) are all
  reporter-asks-vote or neutral stances; no pusher disavows. The
  wobble stays a three-panel wrinkle. Nonverbal nod: NOT graduated —
  the three signing-nod variants recur in exactly 2 conversations
  (Valter 13001 d53, Reham 13004 d38), below the >=3 bar. Columbus-
  cohort echo: GONE as a systematic read — 1 origin mention in 32
  transcripts (Stella d33, "Denver, Colorado never taught me that",
  the seed's own scholar origin); the origin-varying instrument
  change worked.
- WRAP-CHECK: **GO.** Analyzer R128 WRAP section: 32 transcripts,
  32 marked, unmarked 0 (engine-ended 28, refused/ended 3, driver
  cap break 1).
- Q8 early-drift: **NOT confirmed.** Early drifts (0–2 nights) 10/36
  = 28% (r128 37%, r129 70%), attempts 16 (>=8 floor). The r129
  collapse was a one-panel seed shape, not a recurring pattern. No
  drift-rate lever is named by this run; the question returns to
  descriptive watch.
- G-ID watch: sixth panel at zero id-matched gorge-after-clear (0
  name-matched, 0 id-matched, 0 returns across 3 cleared rows) —
  stays open, not closed.
- Refusal rate: 9/16 = 56% — persists (~50% r128, 45% r129
  drift-check).

## Per-seed panel
| seed | days | end | raids | gorge nights | gorge kcal | sorties (ok/refused) | convos | deaths | alive | pantry |
|---|---|---|---|---|---|---|---|---|---|---|
| 13001 | 65 | game-over | 5 | 27 | 28,436 | 2 (2/0) | 7 | 4 | 1 | 0 |
| 13002 | 78 | game-over | 8 | 5 | 5,000 | 0 (0/0) | 8 | 6 | 0 | 1,204 |
| 13003 | 93 | game-over | 5 | 12 | 11,377 | 7 (0/7) | 4 | 4 | 1 | 0 |
| 13004 | 120 | horizon | 8 | 37 | 41,109 | 5 (3/2) | 8 | 5 | 3 | 900 |
| 13005 | 94 | game-over | 5 | 38 | 45,035 | 2 (2/0) | 5 | 5 | 1 | 0 |
Panel totals: gorge nights 119, gorge kcal 130,957, sortie fights
11, aid resolutions 29, drifts 36. Sortie attempts 16, ok 7,
refused 9, full clears 0.

## Village assessment, in plain words
Five villages, four lost, one standing at the horizon. The sieges
did not break them with a mechanic — they bled them in fights and
starved them at the treeline. 13001 is the gorge village: three
lingerers moved in on day 38 and ate 28,436 kcal across 27 nights
while the village fought 15 defended fights and still lost at day 65
with one person left. 13002 is the quiet one: only 5 gorge nights,
no sortie ever fired, six combat deaths, everyone dead by day 78
with 1,204 kcal still in the pantry — the food outlived the people.
13003 is the refusal village: seven sortie attempts, all seven
refused, the bench draining to zero living villagers besides the
player by day 93 — the muster could not form, so the lingerers were
never answered. 13004 is the one that held: 120 days, 3 alive, 900
kcal, five sorties, and the panel's one first — a re-muster after a
refusal on day 103 that went out and fought, even though it did not
clear the set. 13005 is the expensive one: 38 gorge nights and
45,035 kcal eaten at the treeline, two sorties that both went, and
still a loss at day 94 with one alive. Nobody starved to death by
the famine counter and nobody died of disease; the killer is combat
attrition while the pantry drains at the treeline.

## The blank filled — and the one left open
FILLED: W1 moved for the first time in six panels — a re-muster after
a refusal happened (13004 d103). It did not clear, so W1 stays open,
but "re-musters never happen" is no longer true. The early-drift
collapse is answered too: r129's 70% was a one-panel shape; r130 is
28% with 16 attempts.
LEFT OPEN: no sortie fully cleared a lingerer set on any seed (0/7
ok sorties cleared). The gorge price — 130,957 kcal across the panel
— is paid almost entirely by enduring, not by clearing. And the
refusal shape flipped: availability-drain (villagers away at other
nodes) is the majority refusal this run, not gate-one-short. Whether
that flip is a seed shape or a real shift is the next panel's
question.

## Instrument notes
- R57 D3 death mismatches (2): Quinn (13004 d103) and Stella (13005
  d61) are announced dead in say lines ("Quinn faced The Herald at
  the treeline... and didn't come back", "Stella faced Buffering...")
  but absent from deathsDuring. Both died in sorties; the mismatch
  class is the deathsDuring capture missing sortie deaths, not a
  game defect. Same class as prior panels; the analyzer flags it,
  the run does not re-score it.
- R59 TRUE early count 0 (legacy method 2, corpse-excluded 0).
- R57 D1 episode resets: 13003 (herald/eulogy re-linger after drift
  d93) and 13004 (herald/reunion/callback d87, d101) — re-linger
  after drift, tracked not fixed.
- R88 C7 census: pantry collapse on 13001/13003/13005 (final 0),
  13002 final 1,204 with 0 alive, 13004 horizon final 900 with 3
  alive. No famine/disease/wound deaths recorded on any seed.
- The .err files carry only the benign feastBuff retirement notice.
- Heartbeat drift: the run's heartbeat loop drifted under REGISTRY.lock
  contention (noted in the handoff); the run timed out at 7200s before
  closeout, and the main session closed it out.

## Metric review (for the NEXT run, not this one)
- W1 stays open with the count now 39 refusals / 1 re-muster / 1 ok
  sortie after refusal / 0 full clears. The next panel judges whether
  the re-muster was a fluke or the start of a pattern.
- BENCH shape flipped to availability-drain majority (5/9). If the
  next panel repeats a drain majority, the lever question becomes
  nodeAway — why are so many villagers away at other nodes when a
  muster is called — rather than the gate.
- The 0/7 clear rate is now the standing crisis fact across r129
  (0 clears) and r130: sorties fight but do not clear. A future run
  should ask whether "clear" is even reachable, or whether the
  sortie's job is damage control (nights bought, kcal saved).
- Still standing, unchanged: scholar-day labels skip/repeat (all
  ordering uses telemetry sequence index); the cap-line repeat
  ("I've told you three times now") is a cap, not a loop; the
  burnt-piece mourning motif recurs across villagers (Fatima/Siriporn
  "Rahul/Victoria always took the burnt piece") — shared grief
  language, coherent, not a defect.

## Telemetry deviation check (step 14)
**QUIET** — filled by the r131 rescue run (2026-11-06): `node scripts/telemetry-check.js
--baseline .../telemetry-baselines/crisis.json --current
'.../r130-panel/journey-crisis-r130-delayed-seed*.json' --metrics
defendedFights,playerFights,latelyDefenseCount` → "telemetry-check: quiet (5 files,
3 metrics, no large deviations)". Baseline NOT rolled (single 5-seed panel's variance).

## Reachable / fun / winnable (crisis)
- Reachable: YES — raids fire on every seed, sorties are answered
  (16 attempts), the gorge offer reaches the player, defenders talk
  after resolutions. The sortie itself is reachable; the CLEAR is
  not (0/7).
- Fun: MIXED — the re-muster on 13004 is the game working (a refused
  muster that reforms and goes out), and the defender conversations
  after resolutions are the leg's best content (Aisha asking the
  player to ask the System about her brother Felix; Stella's "we're
  an experiment someone forgot to label"). But four villages lose to
  the same shape — fights plus treeline gorge — and a player who
  answers every gorge offer and still watches 130,957 kcal vanish
  will feel the sortie is a gesture, not a tool.
- Winnable: NOT YET on this leg — 1/5 horizons, 0/5 with a pantry
  above 1,204 at the end, and the crisis cost is paid in food the
  village cannot spare.

## Closeout
CLOSED by the r131 rescue run (2026-11-06): determinism proof PASS, telemetry quiet,
run note + driver + analyzer committed from the dead r130 worktree, merged locally,
pending ship. Correction to the instrument note above: the main-session closeout
never landed (files were still untracked in the dead worktree when r131 started);
this rescue run is the closeout. Rotation-b was NOT advanced by r130 (it died before
writing 7); r131 advances it to 7 at its own closeout.
