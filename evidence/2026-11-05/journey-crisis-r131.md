# Journey crisis r131 — run note (2026-11-05, Lane B)

## Prereg
`goal hidden_files/evidence/2026-11-05/journey-crisis-r131-prereg.md`
(written before any scored seed; band 13201–13205 verified fresh — 13101–13105
skipped: sim-woodcarry3-b-prereg.md names 13100 as a conditional screening start,
fallback never triggered, but the skill treats a named band as used).
Leg 6 (crisis). Rotation-b read 6 at run start; this closeout writes 7
(succession next). Driver `scripts/journey-crisis-r131-delayed-20261105.js`
(r130 driver verbatim EXCEPT r131 filenames/paths/seeds and the ORIGINS map:
13201 Seattle, 13202 Chicago, 13203 Atlanta, 13204 Phoenix, 13205 Boston),
analyzer `scripts/analyze-crisis-r131-delayed-20261105.js` (r130 analyzer
verbatim EXCEPT filenames/paths). Policy oracleV2, 120d death-aware +10d tail,
pilot seeds 13201–13205, sequential. Panel evidence (JSONs, 39 transcripts,
panel.log, analysis.txt) in goal hidden_files `evidence/2026-11-05/r131-panel/`;
only the run note + driver + analyzer are committed to the repo (r129 convention).

## This run also rescued r130
The run that started at 2026-11-06T02:55:50Z (lock) / 03:07:10Z (registry)
died ~03:47Z before closeout, leaving its run note + driver + analyzer
untracked in the dead journey2-crisis worktree. This run: stale-lock recovery
(lock 2h old, heartbeat 69 min stale — dead by the rule), determinism proof
for r130 (seed 13001 re-run: panel JSON byte-identical, all 7 transcripts
identical, stderr identical), telemetry for r130 (quiet), filled r130's
PENDING sections, committed the three files (39727472, rebased to cc0e9bb38),
merged locally, released the old tree. r130's panel stands as judged; its
counts carry forward below. Pre-flight reap: my reap invocation ground to a
halt on per-tree `git status` slowness and was killed after ~5 min with a
sibling reap already queued behind the same lock — the sibling's reap ran the
same cleanup to completion instead. No tree qualified for removal this run
(journey2-crisis was dirty with the held r130 files; the rest live or locked).

## Leg question (from the prereg)
1. W1, count now 39/1/1/0: does this panel produce a second same-set re-muster
   (pattern) or none (fluke)? Is W1 answered (>=1 full clear after a refusal)?
2. BENCH: does availability-drain repeat as the majority refusal shape?
3. CLEAR REACHABILITY (new): is "clear" reachable, or is the sortie's job
   damage control? Descriptive: per ok sortie, nights/kcal saved vs the set's
   remaining gorge after.
4. Refusal pile-up, descriptive: does the ~50% refusal rate persist?
5. Naming-stance wobble watch: a fourth sighting graduates it to a fix item.
6. G-ID watch: seventh panel at zero id-matched gorge-after-clear.
7. Nonverbal-nod wrinkle: the signing-nod pair recurring in >=3 conversations
   graduates it to a content fix item.
8. Early-drift watch (descriptive only).

## Determinism proof (prereg-required, before judging the panel)
**PASS** — re-ran seed 13201 with the r131 driver (`EVID=.../r131-det
SEED=13201 DAYS=120`): panel JSON byte-identical (`cmp` clean), all 8
transcripts byte-identical. Re-run: days 120, horizon, 0 sorties, 8 convos —
matches the panel row exactly. The instrument is trajectory-neutral; the
panel below stands as judged. (Smoke first: SEED=13201 DAYS=5, rc=0,
instrumentErrors [].)

## Panel verdict (BINDING metrics)
- C1 (bend, not break): **GO.** Every game-over has a named cause that is NOT
  a siege-mechanic failure: 59 dead across the panel — 27 in combat
  (monster/arena), 21 in the wild, 4 starved, 3 thirsted, 1 sick, 3 of wounds.
  The villages bled in fights, died out on the treeline and the road, and
  starved at pantry 0 — attrition, not a broken siege mechanic. (Caveat filed
  below: the deaths[] feed sees only the combat deaths; the starvation/thirst/
  sickness deaths are real and in the corpse record, invisible to C7.)
- C2 (episodes fire + gates hold): **GO.** Raids fire on all seeds
  (8/6/5/7/11); fought resolutions present on all seeds; D1 snapshots 15/15,
  missing 0; D1 delayed>=3 attempts 15/15; deltaBad empty; D3 drift unknown
  = 0 (labels: player-drawn-off 19, moved-on-valve 13, sortie-clear 6).
  MISSED-WINDOW descriptive (R88 skipped-window total = 10, up from 2 on
  r130: 13204 d57/d66/d66/d68, 13205 d84 x4/d103 x2).
- C2b (linger-conditional gorge/sortie): **GO.** Every boundary-firable case
  fires or is refused with a recorded reason; all 5 seeds judged on
  gorge+sorties. **W1: STILL OPEN, and the r130 re-muster reads as a fluke so
  far** — 0 same-set re-musters, 0 ok sorties after a refusal, 0 full clears
  after a refusal this panel. Count now: refusals 46, same-set re-musters 1,
  ok sorties after a refusal 1, full clears after a refusal 0.
- BENCH (descriptive): refused 7 (all on 13204); shape gateOneShort 2,
  supplyEmpty 4, **availabilityDrain 1**, other 0. No shape covers >=80%, so
  by the prereg rule: **mixed, no single lever** — majority shape supply-empty
  (4/7); gate-one-short ruled out as the majority this run (2/7) AND
  availability-drain ruled out as the majority this run (1/7, vs 5/9 on r130).
  The shape has now flipped three panels running (r128 gate, r130 drain, r131
  supply) — it tracks the village's collapse stage, not a lever: the four
  supply-empty refusals are d88–d90, when the living bench was 1/0/0/0. The
  drain is still in the data (nodeAway exclusions total 9 across the 7
  refusals), just not the majority label. No shape is a stable lever.
- C3 (people check): **GO.** All 39 driven transcripts read in full;
  fabricHits = 0; conversations meet the meaning bar (NPCs want something,
  options engage/deflect, endings resolve/plant/owe). Naming-stance wobble: NO
  fourth sighting — three naming debates (Spool vote, Congregation 'Big-Eyes'
  push, Understudy 'Big Big' push) are all reporter-asks-vote or pusher
  stances; no pusher disavows. The wobble stays a three-panel wrinkle.
  Nonverbal nod: NOT graduated — the signing-nod pair recurs in 0
  conversations (no "sign" anywhere in the panel); the generic "They nod.
  'Okay.'" recurs in 3 conversations, noted, not the signing pair.
  Columbus-cohort echo: GONE — 3 origin mentions, all the seed's own origin
  (Atlanta d30, Phoenix d20, Boston d9); the "I'm not from Denver" denial
  recurs verbatim in 2 seeds (fixed decoy city in the template) — variety
  note, not an echo.
- WRAP-CHECK: **GO.** Analyzer WRAP section: 39 transcripts, 39 marked,
  unmarked 0 (engine-ended 36, driver cap break 2, refused/ended 1).
- Q3 clear reachability: **ANSWERED — the sortie's job is damage control, not
  clearing.** 8 ok sorties, ALL 8 broke (7 vFlee, 1 vDie); cleared 6 lingerers
  total; remaining after ok sorties 1,1,1,1,4,1,2,2 — never 0. Set-level clear
  0/8, third straight panel (r129 0, r130 0/7, r131 0/8). The break binds: the
  party fights the set in order with wounds accumulating across fights, and
  falls back or loses its leader before the last lingerer(s) — usually the
  strongest (900-HP Congregation on 13204 d55; the untouched 4-set on 13205
  d82). Rations paid: 42,986 kcal for 8 sorties. The gorge price — 129,234
  kcal across 113 nights — is still paid almost entirely by enduring.
- Q8 early-drift: 14/38 = 37% early (0–2 nights), attempts 15 (>=8 floor).
  r129's 70% collapse is confirmed as a one-panel seed shape (r128 37%,
  r130 28%, r131 37%).
- G-ID watch: seventh panel at zero id-matched gorge-after-clear (0
  name-matched, 0 id-matched, 0 returns across 6 cleared rows) — stays open,
  not closed.
- Refusal rate: 7/15 = 47% — persists (~50% r128, 56% r130).
- Interesting-finding triggers: NONE of the prereg triggers fired (no W1
  answer, no second re-muster, no refusal collapse, no gate >=80%, no drain
  majority, no full clear on any ok sortie). Two un-preregistered findings
  carry the panel instead: Q3 answered (8/8 break) and the deaths-feed gap
  (below).

## Per-seed panel
| seed | days | end | raids | gorge nights | gorge kcal | sorties (ok/refused) | convos | deaths | alive | pantry |
|---|---|---|---|---|---|---|---|---|---|---|
| 13201 | 120 | horizon | 8 | 0 | 0 | 0 (0/0) | 8 | 9 | 7 | 17,010 |
| 13202 | 79 | game-over | 6 | 13 | 15,146 | 2 (2/0) | 8 | 12 | 3 | 0 |
| 13203 | 95 | game-over | 5 | 11 | 13,467 | 1 (1/0) | 7 | 13 | 1 | 0 |
| 13204 | 89 | game-over | 7 | 19 | 16,851 | 8 (1/7) | 8 | 13 | 1 | 0 |
| 13205 | 120 | horizon | 11 | 70 | 83,770 | 4 (4/0) | 8 | 12 | 5 | 6,858 |
Panel totals: gorge nights 113, gorge kcal 129,234, sortie fights 14, aid
resolutions 36, drifts 38. Sortie attempts 15, ok 8, refused 7, full clears 0.

## Village assessment, in plain words
Five villages, three lost, two standing at the horizon. The sieges did not
break them with a mechanic — they bled them in fights, in the wild, and at
an empty pantry. 13201 is the clean one: 120 days, 7 alive, 17,010 kcal, eight
raids all fought, zero gorge nights, zero sorties needed — the village that
held, carrying its grief straight (Maya mourned Ava the day after Ava starved,
then dreamed her). 13202 is Finn's village: suspected in Liam's ambush,
confided about his taken sister Martina and asked the player to ask the System
about the pods, fell sick, then died leading the day-37 sortie against the
Redactor — the promise to ask about the pods died with him. Lost at day 79
with two more starved at the end. 13203 is Sam's village: he mourned Giulia,
carried the naming debates, watched his wound favor go moot, and lost at day
95 with one alive — the wild took five. 13204 is the refusal village again:
eight sortie attempts, seven refused, the bench draining to zero living
besides the player by day 88, so the lingerers were never answered — and the
village bled out in the wild while Devon and Miguel's favors died unanswered
(they stopped asking). 13205 is the expensive one that held: 70 gorge nights,
four sorties all led by Ruth, three lingerers killed, every sortie breaking —
and then the water ran out: Zoltan, Ruth, and Antonio died of thirst on days
112–114. Ruth killed the Herald and the Grief Counselor on day 111 and died
of thirst three days later. The siege ends; the thirst begins.

## The blank filled — and the one left open
FILLED: Q3 is answered — the set-level clear is not what sorties do. All 8
ok sorties broke (7 fell back, 1 lost its leader), so "remaining 0" never
happens; what sorties do is kill or drive off individual lingerers (6 this
panel) at 42,986 kcal in rations. And the deaths-feed gap is new: the
village's non-combat deaths (4 starved, 3 thirsted, 1 sick) are invisible to
the deaths[] feed — the C7 famine/disease zeros describe the feed, not the
village.
LEFT OPEN: W1 (46/1/1/0 — the re-muster still looks like a fluke); the
set-level clear (0/8, third panel); whether a bigger muster would clear
(parties were 2–3 fighters against sets of up to 4, the muster requests 3);
the BENCH shape, which flips every panel and follows the collapse, not a
lever.

## Instrument notes
- DEATHS-FEED GAP (new, this panel): `deaths[]` lists 34 deaths, all combat
  causes (villager combat / combat / monster / expedition); corpses list 59,
  including 4 starvation, 3 thirst, 1 sickness — none of the 8 non-combat
  deaths appears in `deaths[]` on its day. The analyzer's C7 famineDeaths /
  diseaseDeaths / woundDeaths zeros are therefore feed artifacts. The corpse
  record is the fuller account. Same family as the sortie-death capture gap,
  broader: it is not just sortie deaths, it is ALL non-combat deaths. Filed
  as an instrument fix for a future run (C7 should read corpses alongside
  deaths[]); not fixed here — measurement scope.
- R57 D3 death mismatches (2): Finn (13202 d37, sortie vDie, missing from
  deathsDuring — same known class as r130) and Ruth (13205 d111 kill line
  flagged as death-ish; Ruth died of thirst d114, also missing from
  deathsDuring — which is None on ALL r131 seeds, so the capture is empty,
  not just missing sortie deaths). Both are instrument capture gaps, not game
  defects. The Ruth line itself announces a kill, not a death — the analyzer's
  pattern matched "Ruth killed..." as death-ish.
- R57 D1 episode resets: 13205 (herald ep 2→3, landlord, buffering — re-linger
  after drift, tracked not fixed, same class as r130).
- R57 D1 drift old-vs-new nightsWaited diffs: 4 (instrument diagnostic).
- R59 TRUE early count 0 (legacy method 1: 13203 d39 — corpse-counting artifact).
- R58 refused-sortie book check: all 13204 refusals show bookSorties 0 —
  refused sorties don't consume a slot (r58 change, working).
- R88 C7 census: pantry-low (0 kcal) hit on all 5 seeds at some point; final
  0 on 13202/13203/13204, 17,010 on 13201, 6,858 on 13205. No woundDeaths in
  the feed (see deaths-feed gap — 3 wound corpses exist).
- R70 phoenix burns 0 everywhere. R82 V1/F1 clean (no no-longer entries).
- The .err files carry only the benign feastBuff retirement notice.
- Transcript quirks (driver rendering, filed for the r132 driver, not the
  game): the YOU line drops on repeated identical picks (13202 d10 4th
  investigate; 13204 d12/d13/d20/d53/d85 cap lines; 13205 d48/d60) and one
  YOU/NPC order flip (13203 d9). The game text is fine; the transcript writer
  loses the player line on repeats.
- Content notes (filed, not fixed here): (1) the trap-line invitation decline
  "Maybe not today. The fire's got me." fires 3x verbatim (Maya 13201 d19/d75,
  Hank 13205 d48) — verified in code as the r46 sick-veto working as designed
  (acceptInvite returns 'sick' when the inviter is ill; Maya was feverish
  d15–d20 per the JSON say lines, Hank feverish at d48). The behavior is
  honest; the single shared line is a variety note. (2) "About unasked-for
  food (meal) — here's what you didn't see." (Hank 13205 d37) leaks a memory
  label: convoTopics.js:707 t2fol_you renders the raw memory note, and the
  gift memory note is `unasked-for food (${amount})` (carexplore.js:222) —
  the amount in parens reads as a topic tag. Proposed fix: render the gift
  memory humanly in the About-line (or drop the parenthetical amount from the
  note). Needs a convo-driving proof test; filed for a builder run.
  (3) Ellis's taken brother is named Hank while Hank Brooks walks the village
  (13205 d19) — RESOLVED, not a defect: the name comes from Taking-marked
  lifeseed kin (convo-wants.js seek_taken via takenKinOf), not the living
  roster; same first name is a name-pool coincidence. The pod tail is one of
  3 deterministic variants per vid hash (convo-wants.js takenPodTailFor) —
  Finn and Ellis hashed to the same variant, by design (r25).
- Still standing, unchanged: scholar-day labels skip/repeat (all ordering uses
  telemetry sequence index); the cap-line repeat ("I've told you three times
  now") is a cap, not a loop; the burnt-piece mourning motif recurs across
  villagers (Maya/Ava, Sam/Giulia — shared grief language, coherent, not a
  defect); the "not from Denver" decoy recurs verbatim (fixed template decoy).

## Metric review (for the NEXT run, not this one)
- W1 stays open with the count now 46 refusals / 1 re-muster / 1 ok sortie
  after refusal / 0 full clears. Two panels since the re-muster, zero repeats
  — the next panel judges whether it stays a fluke.
- BENCH shape flipped three panels running (gate → drain → supply). Stop
  asking "which shape is majority" as the lever question: the shape tracks the
  collapse stage (supply-empty is what terminal villages produce). Proposed
  sharper question: among refusals while the bench is still alive
  (livingBesidesPlayer >= 2), does nodeAway predict the refusal — the drain
  question, restricted to non-terminal villages?
- Q3 answered: the break binds, not the gate or the bench alone. The next
  run's sharper question is muster size vs break: would a 4+ fighter muster
  clear, or is wound-accumulation across sequential fights the break driver
  (would the leader surviving the first fight unhurt change the outcome)?
  The muster requests 3 (`_musterAway(3, 'defense')`); parties were 2–3.
- Deaths-feed gap: C7 should read corpses alongside deaths[] (or the driver
  should capture corpse causes into the deaths feed). Until then, no run
  should cite C7 famine/disease/wound zeros as village facts.
- Missed-window jumped to 10 (r130: 2). If it stays high next panel, the
  drift-label instrument needs a look — the skipped-window cases are drifts
  where a waited>=3 sample existed in the window.
- Still open, unchanged: G-ID watch (7 panels at zero); naming-stance wobble
  (3 panels); nonverbal-nod wrinkle (0 signing conversations this panel).

## Telemetry deviation check (step 14)
**QUIET** — `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/crisis.json --current
'.../r131-panel/journey-crisis-r131-delayed-seed*.json' --metrics
defendedFights,playerFights,latelyDefenseCount` → "telemetry-check: quiet (5
files, 3 metrics, no large deviations)". Baseline NOT rolled (single 5-seed
panel's variance).

## Reachable / fun / winnable (crisis)
- Reachable: YES — raids fire on every seed, sorties are answered (15
  attempts), the gorge offer reaches the player, defenders talk after
  resolutions. The sortie itself is reachable; the SET-LEVEL CLEAR is not
  (0/8, third panel).
- Fun: MIXED — Ruth's arc, Finn's arc, Maya's grief, Hank's home sequence are
  the leg's best content, and the favor lifecycle now completes (Hank's wound:
  asked → promised → thanked). But 8 sorties all breaking the same way will
  read to a player as a gesture that costs 42,986 kcal and a leader's life
  without ever finishing the job, and 7 straight refusals on a drained bench
  will feel like the game saying no.
- Winnable: NOT YET on this leg — 2/5 horizons, 3/5 game-overs, and the
  crisis cost (129,234 kcal gorged + 42,986 kcal rations) is paid in food the
  village cannot spare; the thirst deaths on the horizon seed show the next
  crisis (water) waiting behind the siege.

## Closeout
Determinism PASS, telemetry quiet, note + driver + analyzer committed from
the r131 worktree, merged locally, pending ship. Rotation-b advanced 6 → 7
(succession next). No src changes this run (measurement panel; findings filed
above). No `[needs-eyes]` — nothing player-facing changed.
