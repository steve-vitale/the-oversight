# Journey endgame r152 — Lane B, leg 4 (2026-11-07 08:00 CST run)

Pilot: 5 seeds (89701 waves, 89702 waves, 89703 waves, 89704 forcedrift
control, 89705 wavesnw), 180d death-aware. Substrate: master `4b99c6d12`
EXACTLY, no build this run. Prereg:
`journey-endgame-r152-prereg.md` (this dir). Analyzer output:
`journey-endgame-r152-analysis.txt`. Pilot log:
`journey-endgame-r152-pilot.log`. Per-seed corpora:
`perseed-endgame-r152/`. Dark re-verify:
`perseed-endgame-r152-dark/` + `journey-endgame-r152-dark.log`.
Smoke (pre-pilot, 89701 x 120d): `journey-endgame-r152-smoke.log`.

Run incidents: registration slow (~12 min, registry-lock contention
under sibling sim load) but clean on first attempt; heartbeat
verified by read-back (14:11:08Z) with a 10-min loop running.
No safe-commit clobber notes yet — see closeout. Master did not move
mid-run (pull at start: already up to date on 4b99c6d12).

## Headlines (per seed)

- **89701 waves: WON LESSER — announced d90, sat d92,
  feared/light, final:pledge, alive 9, pantry 7200.** Standing peak
  199, uw=4, 1 wave-4 kill (Olivia Bennett put down "algorithm"
  d78). FLIPPED from r147 (village-LOST, scattered d83, standing
  75, 0 wave-4 fights). The 89701 scatter does NOT persist a fifth
  time (r140 d53, r143 d80, r144 d78, r147 d83) — it reverts to a
  lesser win. Surge landed d26 (r147: never); the table announced
  the next dawn after the seat went ready. 4 census fights.
  12 deaths, named (Wanda Xi the night d9, Ava alien d30, Yaqi +
  Sofia monster d41, Nadia wound d51, Chloe sickness d52, Ivy
  alien d53, Ivan alien d58, Greta wound d59, Gilberto dehydration
  d67, Gladys alien d72, Zoltan alien d81).
- **89702 waves: village-LOST — scattered d174, pantry 0, alive 3.**
  Standing peak 199, uw=4, 1 wave-4 kill, 23 census fights. FLIPPED
  from r147 (WON LESSER, announced d126, sat d127, 2 wave-4 kills)
  — the mirror of 89701's flip. The pellet-bearer Carlos died in
  the wild d83 ("The reactor went with Carlos's body — it does not
  come out, and it does not pass on"), so the pellet-blocked food
  thesis ended with the pellet gone, not with a surge: surge never,
  feasts 0 held, 4 "Nobody is here to feast with" refusals. The
  "not yet" beat fired once (progression.js:780 — the Arc IV
  want-gate dawn check, NOT the withdrawal beat): "the ring of pale
  light flickers... and does not come. Not yet... The ledger still
  wants: the food-thesis deeds. The climb is not over." No PELLET
  HUMS line anywhere this run; no withdrawal beat fired on any
  seed. 22 deaths, named (Daniel Zhu betrayal d10, Saiful contest
  d18, Agnese Ugly-Eyes d23, ... Wanjiru alien d166).
- **89703 waves: SURVIVED — alive 5 at d180, pantry 50841, never
  announced, never sat.** Standing peak 386, uw=5, 3 wave-4 kills
  (all "reunion": d173, d176, d178), peak 3 living veterans (@d178),
  34 census fights. NEW end class for this series: a seed that
  reaches the 180d horizon alive, unannounced, with wave 5 unlocked
  and three living veterans banked. The table never came because
  the scholar was EXILED by moot vote (9-1) early and never
  returned — and the feast-surge deed is scholar-buff-bound (see
  investigation below). 11 deaths, named (Rosa ambush d14, Lucas
  alien d18, Quinn alien d34, Salvador "Spool" d36, Grace alien
  d39, Tânia contest d94, Lucia alien d101, Aroha alien d114,
  Muriungi alien d170, Sofia contest d170, Larry contest d179).
- **89704 forcedrift control: WON LESSER — announced d90, sat d90,
  relay/dark, final:voice, alive 7, pantry 72193.** Standing peak
  411, uw=5, 2 wave-4 kills (Rosa Mendez "eulogy" d56, Vasyl
  Shevchenko "congregation" d81), peak 2 living veterans. THE
  CONTROL WON — the first control win in this series (r147:
  scattered d48, standing 0). The relay road, forced by the plan,
  claimed d51 and built standing 0 -> 411 by d90 (see investigation
  below). 5 census fights. 11 deaths, named (Ji sickness d11,
  Jorge sickness d12, Henrik contest d16, Sanne alien d20, Hazel
  dehydration d23, Omar sickness d25, Roberto monster d29, Owen
  wound d39, Everett "a stranger" d50, Alon monster d86, Patricia
  monster d90).
- **89705 wavesnw: WON LESSER — announced d90, sat d118,
  beloved/light, final:audience, alive 8, pantry 8169.** Standing
  peak 199, uw=4, 0 wave-4 kills, 10 census fights. Same headline
  as r147 (lesser win) with a different path and final (r147:
  feared/light, final:mercy; r152: beloved/light, final:audience)
  and a 28-day deferral (guard=tier-cap; the table honestly voiced
  the cost: "The table notes the overtime: 4 weeks kept waiting.
  Every door's standing −16."). Surge d15 with 5 spends. 2
  ascensions (Diana Osei relay + Greta Hansen). 8 deaths, named
  (Wanda Ramirez wound d19, Paisley monster d21, Aurora monster
  d35, Sam combat d44 — recorded twice pre-fix, deduped post-fix,
  see fix section — Alex Schmitz the wild d44, Zoe Adams the wild
  d47, Ethan Hunt the wild d51, Shengli Ling wound d56).

Tally: lesser 3/5, full 0/5, wave-5 unlocked 2/5 (89703, 89704),
wave-5 faced 0/5, wave-4 kills 7 (89701: 1, 89702: 1, 89703: 3,
89704: 2, 89705: 0). First pilot seed ever to bank 3 living
veterans (89703, peak 3 @d178); first time M3b-peak and
M4-wave5-or-full both GO.

## 89703 investigation — exile locks the endgame (FINDING, not a build)

The mechanism, read from code + transcript + JSON:
- The lesser seat requires `foodDeeds = sentimentTaught &&
  feastSurgeUsed` (table.js tableSeat, progression.js
  deedGateReady). `feastSurgeUsed` is set only by
  `_spendFeastedPower` (feastBuff.js), which requires
  `feastedActive()` — the SCHOLAR's own feast buff — and a real
  combat use or landed bonus healing while feasted.
- 89703: feastedDays 0 in 180 days, surge banked (armedDays 168,
  endBanked=true) but never spent (endUsed=false, 0 spends across
  34 census fights, all with 'p' in the party). The scholar was
  exiled by moot vote 9-1 early ("Exiled. You leave with what you
  carry — nothing more... The pantry is closed to you. The book
  stays behind.") and returned to Haven 52+ times, always refused
  ("Exile means exile. The fire isn't yours to open."). An exiled
  scholar can never feast, so the scholar can never be feasted, so
  the surge can never spend — even though SEATBLOW-OPEN lets a
  villager's blow bank the deed, it still requires the scholar to
  be feasted.
- The village meanwhile did everything else: standing 386 (war
  250, diplomacy 136), 9 distinct wave-4 faced, 3 kills, 3 living
  veterans, wave 5 unlocked, rd5ready true d176-178, pantry
  50841. The table never came — firstLesserDay null — because one
  scholar-bound deed never fired. The "not yet" beat fired once,
  naming the food-thesis deeds.
- The return path exists in code ("What you carry is still yours
  to give, if you want to start earning your way back" — donations
  toward amends stay allowed on returns, game.js returnToVillage)
  but the bot never completed amends in 180 days. Whether a real
  player could earn their way back is untested by this run.
- VERDICT: honest by the rules as coded (exile is "the one way to
  lose membership"), but it is the pellet shape again — a single
  scholar-bound deed gating the whole endgame, now via exile
  instead of the pellet. Win prices and deed gates stay untouched
  unless Steve orders otherwise, so NO FIX IS BUILT here. Open
  question for Steve: should a villager's feast-surge spend count
  toward the food deed when the scholar can never feast (exile),
  or is the lock the intended price of exile? Recorded in
  docs/OPEN-QUESTIONS.md by this adoption (the note as first
  written claimed the main session had recorded it — a grep at
  closeout found no exile entry, so the adoption records it now).

## 89704 investigation — the control won (CONTROL REBASELINE OWED)

The mechanism, read from the r147/r152 pair:
- r147: 10 deaths, the last five starvation/wound d41-47,
  scattered d48, pantry 0, standing 0, 0 feasts, 0 wave-4 fights.
  The village STARVED before the relay claim window opened
  (firstAvailableDay 50).
- r152: 11 deaths (different people/days — trajectory diverged
  early), pantry 72193 at sit, 5 feasts held (5/5 hosted), surge
  d56, firstLesserDay 56. Standing trace: 0 until d31, war 25/50/75
  by d53, then the relay claim d51 ignites diplomacy (102 by d60)
  and plenty (feasts) — 411 by d90. The relay road itself built
  the standing (war 175 + diplomacy 136 + plenty 100).
- The control's premise was "scatters before the road opens". It
  survived 2 days longer this time and the forced relay road paid.
  The food trajectory is the crux: starved (pantry 0) vs fed
  (pantry 72k). Prime suspects among the named deltas: practice
  moves competence (foraging competence -> yields), armor curve
  K=20->6 (hunters survive), finishersize committed finish (more
  kills -> meat), stayrecover in-fight eat verb. NO BISECT was run:
  per the trajfrag-b lesson, one RNG draw flips seed verdicts, so
  a single-seed revert test would prove little either way.
- VERDICT: the control no longer controls on this seed. The flip
  is recorded as trajectory divergence with a named mechanism and
  open attribution — not claimed for any single delta. For future
  endgame runs, 89704 forcedrift must be treated as a second
  experimental seed, not a control, until the flip is bisected on
  a panel — or the control plan needs redesign (e.g. a control
  that cannot reach the relay claim). The relay road working as
  designed once claimed is itself a positive finding: the forced
  relay road is a real, playable path to a dark lesser seat.

## 89701 / 89702 flips — trajectory divergence (same class as r143->r144)

Both waves seeds flipped in opposite directions under the same
deltas (89701 scatter -> lesser; 89702 lesser -> scatter). The
named deltas are the perturbation source; no single delta is
implicated. The common thread is the feast surge: 89701 surged
d26 (r147: never) and announced the next dawn after the seat went
ready; 89702 never surged (pellet-bearer died d83, feasts 0 held)
and scattered d174. The surge remains the binding gate for the
announce on every pilot seed (surge -> announce on 89701/89704/
89705; no surge -> no announce on 89702/89703). The 89701
pantry/feast-starvation thread from r147 is now answered in the
affirmative for this seed: feasts held 1/1 hosted, BUFFER_SHORT 5
(r147: 6), surge landed — the village fed itself this time.

## Fix verification in the wild (closeout greps)

- **V-WAITVARIETY GO 5/5** (analyzer): 89701 0 holds; 89702 28
  [6,6,6,5,5] adjRepeat=0; 89703 63 [13,13,13,12,12] adjRepeat=0;
  89704 0; 89705 6 [1,1,2,1,1] adjRepeat=0. Fix B volume holds.
- **V-FixB HOLDS:** waits narrated with variety across the pilot
  (97 hold lines total, 0 adjacent repeats). The old single line
  "holds and watches" still appears (89702: 6, 89703: 13, 89705: 1)
  as one of the 5 rotation variants, never adjacently repeated —
  that is the rotation working, not a stuck record.
- **V-Gorge HOLDS:** 0 "gorges — 0 kcal gone" lines on any seed.
- **V-FixC UNMEASURED (not failed):** no sitting seed had a
  combat finale with a stuck helper — 89701 final:pledge, 89704
  final:voice, 89705 final:audience are all non-combat finals.
  Falls to the next endgame run, third run in a row.
- **V-POCKETSAND SUPPORTED:** 89703 pressed sand 65 times
  ("You fling a handful of grit into its eyes.
  (pocket_sand: blinded)"), 89702 7x, 89701 1x. The only
  walk-aways on 89703 are 2 voiced tactical disengagements
  ("Sofia breathes out. 'Good. Walking away is winning too.'"),
  not losing-window flees. No flee-with-sand-held case arose to
  falsify: same reading as r147 — supported by the positive case,
  not proven by a losing-window case.
- **V-RAIDDENSITY UNMEASURED (not failed):** raid arrivals are
  present (89702: 43, 89703: 40, 89705: 2 "came in the night"
  lines, mostly Thornfield) but the pilot artifacts carry no raid
  staging days per target and no young-national flag, so the >=7d
  gap rule cannot be checked from this corpus. Falls to the next
  endgame run. NOTE: r147's "64 -> 0" raid collapse on 89702 did
  NOT reproduce — 89702 has 43 arrivals this run, so the collapse
  was trajectory (hostile neighbors forming or not), not a code
  change.
- **V-STICKYOFFER UNMEASURED (not failed):** no seed announced
  then dipped — 0 holding lines, 0 return lines on all seeds.
  89705's 28-day deferral was a guard (tier-cap), not a dip.
  Falls to the next endgame run.
- **V-PREOFFER HOLDS (vacuous):** no withdrawal beat fired on
  any seed (0 PELLET HUMS lines, withdrawal null 5/5). The
  pre-offer "not yet" beat (progression.js:780) fired once each
  on the two never-announced seeds, naming the food-thesis deeds.
- **V-BONDINIT (descriptive):** villager-initiated bond proposals
  fired in the wild — 4 lines across 3 seeds, 1 accepted, 3
  refused, all reading as people:
  - 89703: "Larry nods at Muriungi. 'You and me. We look out for
    each other now.'" (accepted)
  - 89703: "Ruby asks, and Guizhen looks away. 'Not like that.
    Not yet.'" (refused)
  - 89702: "Wanjiru asks, and Nino looks away. 'Not like that.
    Not yet.'" (refused)
  - 89705: "Diana shakes their head at Sanne. 'Not yet. Ask me
    again when we've been through more together.'" (refused)
  No proposal to an unperceived villager is visible in the
  transcripts; the perception gate is enforced in code
  (bondProposalPerceived). The probe's telemetry capture carries
  no bond_proposed events (it records table_entered/table_won
  only) — transcript SAY lines are the evidence.

## Death-dedupe fix (r124 proposal, proven live, built this run)

The pilot proved the r124 SIT-DAY-DEATHS dedupe proposal: 89705's
Sam Wilson (sam_wilson) died d44 in combat and was recorded TWICE
in deathRecords — once via tbVillagerFalls, once via registerDeath
(same vid+day+cause) — so the pilot counted 9 deaths for 8 dead
villagers. The probe wraps both channels by design and pushed a
record per channel call. The fix, in
`scripts/probe-endgame-r152-20261107.js` recordDeath: skip a record
when the same vid already has a record on the same day (first
channel wins; null vids never deduped). Probe-only — no game code,
no RNG, no trajectory effect. Proof test
`scripts/test-endgame-r152-deathdedupe.js` verifies on the two
committed corpora (pre-fix `perseed-endgame-r152-prefix/`, post-fix
`perseed-endgame-r152/`): post-fix uniqueness by (vid, day),
post-fix == pre-fix minus exact duplicates, all other JSON fields
and transcripts byte-identical. RED-verified on the pre-fix corpus
(3 failures) before the re-run. Full detail:
`journey-endgame-r152-prereg-amendment-1.md` (this dir).

Post-fix re-run: COMPLETE (closeout, from
`journey-endgame-r152-pilot-postfix.log`, 14:54) — all 5 seeds
re-ran with identical trajectories: announce/sat days, seats,
paths and finals match the pre-fix pilot exactly (89701 lesser
d92, 89702 lost, 89703 survived, 89704 lesser d90, 89705 lesser
d118). Analyzer re-ran post-fix (14:55): verdicts unchanged
(PRIMARY-BINDINGS GO | PRIMARY GO | ALL NO-GO), 89705 deaths=8.
Proof test `scripts/test-endgame-r152-deathdedupe.js` re-verified
green at closeout (post-fix uniqueness, minus-dups, byte-identical
JSON/transcripts, Sam once post-fix / twice pre-fix).

## Dark re-verify (S1/S2 — GO)

Full dark probe re-run as r152 (7 variants, same policy, fresh dir
`perseed-endgame-r152-dark/`): **identical to r143/r144/r147** —
v1a 26/27 (D2-twist-fired curdled, the expected by-design non-ok),
v1b 23/23, v1c 24/24, v2 18/18, v3 25/25, v4 20/20, v5 17/17.

- **S1-sitter-coda GO:** the v3 walk-out line names the sitter,
  Amelia Moon — "S1-sitter-coda — walk-out names the sitter:
  Amelia Moon" (and the no-bearer coda names the bearer, Bill
  Palmer, correctly).
- **S2-dark-holds GO:** D1–D4/D6 green on the new substrate.

## People check

All three sitting seeds' finales read as people, and each varies
by path:
- 89701 (feared/light, final:pledge): "You pledge it aloud, on
  the record: humanity's fear is a standing shield, never a
  sword. The table signs. Your people sleep. Somewhere the System
  files you under 'deterrent, benevolent' and never quite
  understands the second word." Oathbound ability. The war path
  behind it names Olivia Bennett's d78 kill.
- 89704 (relay/dark, final:voice): "You stay inside. Forever. The
  merge completes — and it is *glorious*: every conversation, every
  wire, every thought the machine thinks, with your accent on it.
  Human things seem small from in here. The village grieves you
  while you're alive, and you feel their grief the way weather
  feels rain. Power immense. Self eroded. The System finally says
  your name right." And the OUTSHONE coda names Rosa Mendez: "Rosa
  Mendez did what you would not: acted, boldly, while there was
  still time. The village thrives. The god is someone else. The
  record notes, kindly and accurately, that you watched. It stings
  exactly as much as it should." The war path names both kills
  ("On day 81, Vasyl put down Big Ugly. On day 56, Rosa put down
  Big Ugly.").
- 89705 (beloved/light, final:audience): the full variety finale —
  the audit names real deeds ("waves 1–3 faced (20/13/7), with 7
  wave-4 fought, 12 contests survived"), "Feng tells the truth —
  the unproduced kind. The audience weeps in eleven dimensions.
  You can't fake this. You didn't.", "You spend it all — the love,
  the light, the finale slot — on people the cameras never found.
  You name the unfilmed villages. You name the dead.", "The show
  becomes the government... You made popularity into a
  constitution — and constitutions, unlike ratings, don't dip.",
  and the Architect/Pantheon codas name Diana Osei's relay
  ascension and Greta Hansen ("gods, it turns out, have politics.
  They argue about you the way the living argue about weather.").
  The 28-day deferral is honestly priced ("The table notes the
  overtime: 4 weeks kept waiting. Every door's standing −16.").
- 89702's scatter reads as a real defeat: 22 named deaths, the
  pellet dying with Carlos d83, the third hungry day d174.
  89703's exile arc reads as a real tragedy, not a bug: the moot
  vote, the closed pantry, 52 refused returns, the village
  thriving without its scholar — and the table never coming.
- Minor instrument note, FIXED THIS RUN: 89705's deathRecords
  listed "Sam" twice at d44 (combat) — one death recorded through
  two channels (tbVillagerFalls + registerDeath). The probe now
  dedupes deathRecords by vid+day (see "Death-dedupe fix" below);
  the post-fix pilot records Sam once. The sit-day case itself
  (89704, Patricia, monster, d90) was recorded once all along.

## Verdicts (from analysis)

GO: M1-guard 4/5, M2-census (armA 3/3 with fights), M2c, M2d
(31/31 classified), M2b (6/7 causal — the 7th is the day-window-only
case, classified), M8-exit-canon, MFLEE-routed 29/29, M3b-peak
(first pass: peak 3), M4-wave5-or-full (first pass: 89703 OPEN
uw=5), W5-question, M13, M14, M5 (1/1 relay), M5b, M6, M10, M11,
M12, M15, M16, M17, KILL-ANATOMY 71/71, M18, M19, M20, M21, M22,
REG-r35, REG-r37, VETCONV 4/4, SECOND-VETERAN 4/4 (second=d176 on
89703), FIRENARR, HURTRETURN, FALLEN-ambush 5/5, V-WAITVARIETY 5/5,
LOSSKIND 1/1.
NO-GO: M3-conversion (armB kills 0 vs armA kills 5 — the wavesnw
arm did not out-kill the waves arm; expected road-tally reading,
same as r147).
**PRIMARY-BINDINGS GO | PRIMARY GO | ALL NO-GO** — the primary
bindings pass; the only NO-GO is the M3 road-tally metric.

## Reachable / fun / winnable

- Reachable: better — the lesser seat is reachable 3/5 this run
  (including, for the first time, via the forced relay road and
  via a feared path); wave 5 is unlocked 2/5 but never faced; the
  full seat is still reached by no pilot seed.
- Fun: yes on all three sitting seeds (the pledge, voice, and
  audience finals each land differently, and each names real
  villagers' real deeds); the scatter and the exile arc read as
  real defeats/tragedies, not bugs.
- Winnable: closer, not yet — full seat 0/5, wave-5 kills 0, but
  for the first time a pilot seed banks 3 living veterans (89703)
  and unlocks wave 5, and a second seed banks 2 (89704). The
  binding link (two living wave-4 killers) is no longer the wall
  it was; the wall is now the announce itself on the exile seed
  (food deed) and the wave-5 face window (89703 unlocked d176,
  4 days before the horizon; 89704 unlocked d81 with a 9-day
  window and no face).

## Gate

COMPLETE — `node scripts/check.js --quick` finished 14:42 (840s)
on base `4b99c6d12`: **284 passed, 6 failed** — all 6 standing
(mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20 racks-full voice-gate, capable-bot and
trust-observer-neutrality 120s load timeouts). No new failures.
Log: `journey-endgame-r152-checkquick.log`. The branch adds no
src/js or manifest inputs (probe/analyzer/test scripts + evidence
only), so no post-rebase gate re-run is owed.

## Telemetry

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/endgame.json
--current 'evidence/2026-11-07/perseed-endgame-r152/endgame-r152-*.json'
--metrics veterans.unlockedWave,won,peakLivingVeterans`:
**quiet** (5 files, 3 metrics, no large deviations). Baseline NOT
rolled on a quiet check, per prereg.

## Metric review

- M1's "voiced non-table path" does not recognize the new
  "survived" end (89703: alive at the 180d horizon, never
  announced, no voiced path). The analyzer scored it not-ok and
  M1 still passed 4/5, but a surviving-unannounced seed is a
  distinct outcome from a silent failure. Propose for the next
  run: count `endReason == 'survived'` as a voiced non-table
  resolution (the village outlived the window honestly), or add a
  dedicated M1b-survived line. Not changed mid-run.
- The probe's withdrawal detector keys only on "PELLET HUMS|the
  mantle may pass to hungrier hands". The pre-offer "not yet"
  beat (progression.js:780) is a different line and is not a
  withdrawal — correctly uncounted this run — but a withdrawal
  whose bearer lost the pellet would also go uncounted. Propose:
  the detector should also match tableWithdrawLine's "The table
  is withdrawn — for now" text. Not changed mid-run.
- M2's bar now reads cleanly at 3 waves seeds (armA 3/3 with
  fights) — the r147 metric-review proposal worked. Keep 89703
  in the pilot.
- The 89704 control is no longer a control on this seed (see
  investigation). Next run: either re-baseline the control on a
  panel or redesign the control plan. Do not silently keep
  calling 89704 a control.
- SIT-DAY-DEATHS dedupe (r124 proposal) is PROVEN AND FIXED this
  run: a sit-day death recurred (89704, Patricia visjoin_88,
  monster, d90 — flagged by the analyzer's SIT-DAY-DEATHS section),
  and the pilot proved the two-channel duplication live (89705,
  Sam Wilson d44, recorded twice). The probe now dedupes
  deathRecords by vid+day (see "Death-dedupe fix" below); the
  sit-day table itself was clean (Patricia recorded once). The
  dedupe question is closed for the probe; the engine's two
  channels both firing for one death is by design (the probe rides
  both), not an engine bug.
- V-RAIDDENSITY, V-FixC, V-STICKYOFFER wild verification all
  fall to the next endgame run again (no case arose for any of
  them).
- The withdrawn-table question is CLOSED (Steve 2026-11-06 07:06
  ruling + landed sticky fix + proof). Remaining is wild
  verification (V-STICKYOFFER), which had no case in r147 or r152.

## Carry-forwards

- V-FixC + V-STICKYOFFER + V-RAIDDENSITY wild verification
  (no case arose in r147 or r152).
- 89703 exile finding: open question for Steve — should a
  villager's feast-surge spend count when the scholar can never
  feast? No build until he orders it (deed gates untouched).
- 89704 control re-baseline (panel bisect or control redesign).
- M1 "survived" recognition + withdrawal-detector widening
  (metric-review proposals above).
- SIT-DAY-DEATHS dedupe: CLOSED for the probe (proven live + fixed
  this run). No longer carried.
- M1 "survived" recognition + withdrawal-detector widening
  (metric-review proposals above).
