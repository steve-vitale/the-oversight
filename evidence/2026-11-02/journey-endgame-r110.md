# Journey endgame r110 — WAVE 5 FACED AT LAST, AND A PAIR THAT LIVED TO THE SIT (lane B, 2026-11-02)

## Run provenance

Leg 4 (endgame). Rotation-b read 4 at run start; this run writes 5
(social life next) at closeout, verified by re-read after landing
(closeout write per r103/r104/r105/r109 precedent, so a failed run
cannot skip the leg). Run number basis: last numbered Lane B run is
r109 (endgame, landed 2026-11-02). This run is r110. Slug deviation:
none — journey2-endgame registered clean after the incident below;
heartbeat verified in the registry after registration (22:12:15Z)
and refreshed by hand whenever the loop's beats lagged behind the
registry flock (22:15:34Z, 22:31:46Z, and at sweep close); the loop
itself stayed alive throughout but its beats land minutes late
under sibling registry contention (a Lane A journey-deepening
heartbeat was queued at 22:30Z) — same class as r109's contention
note. Base: master 61e019a85 at registration (git pull already up
to date). Main tree clean at pre-flight (0 files), disk 20%.
No lock existed at run start (no stale-lock recovery this run);
fresh lock written (2026-11-02T21:55:46Z), deleted at closeout
after verifying it still carries this run's run_id.

Run-start incident (infrastructure, LOUD): worktree registration
failed 13 consecutive times (21:57–22:07Z) on the known intermittent
EPERM flap on `.git/refs/heads/` lock writes — file creation
succeeds, write() returns EPERM, scoped to the repo's .git at
first, then the same burst ate a draft file write in the goal
workspace and a background DET run's redirect files (DET exited 1
with empty logs at 22:25Z; the foreground rerun is DET GREEN, see
below). The flap's second signature this run: a 0-byte file left
by a failed write then refuses EVERY rewrite until deleted and
rewritten fresh (draft probe, pilot snapshot copies both). No ref
surgery was performed on the main tree at any point; registration
succeeded on the next attempt at 22:12Z and the run proceeded.
If the flap returns on a later run, the recovery is: delete the
0-byte file, rewrite fresh, retry — never force a ref write.

Substrate r109 EXACTLY (capable + deedhunt + vetcommit + greedy
deferral defaults MAXTIER 4 / LASTDAY 145, NOT tuned + armorydrive
+ fullseat-diag + vetguard on waves seeds; forcedrift control
clean). 180d, death-aware. NEW vs r109, all named in r109's metric
review: the 'producer-name' mention kind (probe), and the
SECOND-VETERAN kill-channel + pair-lifetime columns (analyzer).
Probe: `scripts/probe-endgame-r110-20261102.js`. Analyzer:
`scripts/analyze-endgame-r110-20261102.js`, full output in
`evidence/2026-11-02/journey-endgame-r110-analysis.txt`.
Analyzer exit 0, PRIMARY GO, ALL GO — the first all-green block
in this series (r109 was PRIMARY NO-GO, ALL NO-GO). No src/js
change this run.

Seeds: 89701-89703 waves (Arm A), 89704 forcedrift control,
89705-89707 wavesnw (Arm B, waves + NOWALKIN_W4). Seeds verified
fresh: no prior endgame note or endgame probe script contains
89701-89707 as a seed. Pilot (89701+89705+89704) met the prereg
gate (2 sats, 9+ census fights, 1 classified village loss), so
the run expanded to the full 7; pilot seeds reproduced
BYTE-IDENTICALLY in the full sweep (JSON + transcript snapshotted
to `evidence/2026-11-02/r110-pilot/` before the sweep overwrote
them). Determinism leg: DET GREEN byte-identical on 89701 (2x 120d,
foreground rerun — see incident note).

## Village assessment, in plain words

Three villages won the lesser seat, four died. No village won the
full seat — but for the first time in this series, a village
FACED wave 5, and a banked veteran pair lived all the way to the
sit day. The wall moved twice in one block.

- 89701 (waves): SCATTERED d118. One person left, pantry 0 —
  the honest scattering line again: hunger broke it, after 89
  dusks and zero wave-4 fights. A village that never got to play
  the leg (unlocked wave 3 only).
- 89702 (waves): WON LESSER, feared/light, announced d90, sat
  d92. Nine alive. Eight census fights: 3 kills (Strike, Reunion,
  Congregation — the Congregation kill banks the seed's single
  veteran, d92, the sit day itself), 2 talked-down, 2 fled-from,
  1 other-end. Standing peaked 199. Full-seat gap w5 0/2 alone.
- 89703 (waves): NO-SUCCESSOR LOSS d152, zero alive, pantry
  2,629. Nine census fights, zero kills, 4 villager deaths in
  fights, and all four of this block's waves-seed mFlee labels
  (see the mFlee note below). The village fought wave 4 nine
  times and killed nothing — the grind shape at its purest.
- 89704 (forcedrift control): WON LESSER, relay/dark, announced
  d90, sat d90. Seven alive. The control crossed a band (lean
  -53, dark) AND voiced (1 notice) — M5 GO again. Its single
  mFlee (Eulogy, d80, 9 turns, 146 damage) is gotAway-only with
  monFled false, closed at a day boundary — the label shape,
  not a flee (see below).
- 89705 (wavesnw): WON LESSER, feared/light, announced d120,
  sat d120. Eight alive. THE BLOCK: unlocked wave 5, faced the
  Timeslot d112 (w5FaceEvents), banked the pair d100 (Diana
  killed the Influencer d99, Sanne killed the Reunion d100 —
  both census-channel kills, 1 day apart), and sat with
  standing 427 — far past 200. The pair lived 20 days to the
  sit day. Then Diana died d120, cause 'alien', no fight, and
  the sit's own bar read "1 of 2 veterans": only Sanne stood as
  a veteran at the sit. Full-seat gap w5 1/2 alone — the
  remaining wave-5 bar is one more distinct wave-5 type faced,
  and the veterans bar is one veteran who survives the sit day.
  Sanne's third kill (Influencer, d116) rode the villager-side
  channel — no census fight — so the third kill is not
  player-repeatable by fighting, but the pair itself was.
- 89706 (wavesnw): SCATTERED d34. Nine people left, pantry 0 —
  scattered in the first month, before any wave-4 fight
  (unlocked wave 2 only). Early hunger, not combat, ended it.
- 89707 (wavesnw): SCATTERED d57. Two people left, pantry 0,
  unlocked wave 3 only, zero census fights.

## Leg questions, answered

1. SECOND-VETERAN, WITH CHANNEL + PAIR LIFETIME — ANSWERED, NEW
   SHAPE. The r109 question (can a pair coexist long enough, at
   standing 200, through a sit?) now has a yes on two of three
   legs and a no on the third:
   - Coexistence: YES, 20 days (d100→d120), the longest pair
     life in the series (r109's pairs lived ~3 days and ~1 day).
   - Standing 200: YES, 427 at the sit — standing was not the
     blocker on this seed.
   - Through a sit with 2 living veterans: NO — Diana died on
     the sit day itself, so the sit counted 1 of 2 veterans.
   Channels: the pair's two banking kills were both census
   (player-fight) kills, 1 day apart — a player CAN deliberately
   repeat the bank by fighting. The seed's third kill (Sanne
   d116, villager-side) is the r109 Suburb shape again: kills
   the player census never sees. Channel tally on this block's
   veteran-counted kills: census 3 (89702's Congregation,
   89705's Influencer + Reunion), villager-side 1 (89705's
   second Influencer), fast 0. Coverage 6/6.
2. W5-FORK — ANSWERED AS FACED, FIRST IN THE SERIES. 89705
   (wavesnw) unlocked wave 5 and FACED the Timeslot d112
   (w5FaceEvents, window 20d from the d100 release snapshot),
   with cleaned-presence mentions for Rerun (d110, presence)
   and Timeslot (d111, presence) plus a crew-beat (Finale crew,
   d113). The other six seeds are no-uw5 by construction
   (complete=true 7/7). The W5 verdict is GO for the first time:
   >=1 uw=5 seed AND every uw=5 seed's records complete. The
   next wave-5 question is now concrete: a second distinct
   wave-5 type faced (w5 1/2), not the unlock itself.
3. M4-WAVE5-OR-FULL — GO (1/6 waves seeds unlocked wave 5).
   The full seat itself is still 0/7, but its gap narrowed to
   exactly two named items on 89705: w5 1/2 + veterans-at-sit
   1/2. On 89702 the gap is w5 0/2 alone (its single veteran
   banked on the sit day, standing 199 — one short of 200 on
   that seed, though 89705 proves 200 is reachable).
4. M8-EXIT-CANON + THE MFLEE LABEL — GO AS MEASURED, WITH A
   SHARPENED CAVEAT. All 5 mFlee fights this block (89703 ×4,
   89704 control ×1) carry monFled=false and gotAway=true:
   NOT ONE is a monster flagged as fled. The label rides
   entirely on the "It got away" SAY line (the tb 'routed'
   settlement). Three ended on a real fight-end turn
   (ref-change, with damage dealt: 399, 136, 38); two closed at
   a day boundary (89703's 1-turn 0-damage Eulogy; 89704's
   9-turn Eulogy) — the day-boundary shape can sweep an
   unrelated settlement line into the slice, so those two
   labels are the weakest in the block. Under monster
   commitment (in HEAD: tbMonsterTurn flee gated on
   mdef.flee, which neither Eulogy nor Algorithm carries), a
   'routed' end is a designed dismissal or another routed
   path, not a flee — but the census does not record which
   routed path fired (fight result reads null on engine
   fights: the snapshot is taken before settlement). The
   next run's instrument must record the routed path per
   mFlee; until then, mFlee counts in this series are
   SAY-line counts, not flee counts, and must not be cited
   as monsters fleeing.
5. PRODUCER-NAME KIND — ADDED, UNEXERCISED, RESIDUAL EMPTY
   ANYWAY. No seed's wave-5 firstLine classified
   'producer-name' this block (89705's Nielsen mention at
   d120 classified 'ability-text' under the marker-first
   rules, as in r109's pattern), so the kind is in place but
   unproven on fresh data. The 'other' residual is EMPTY (0)
   regardless — the r109 Nielsen-naming residual did not
   recur as 'other' because the Nielsen first mention here
   rode an ability-text line. The kind stays for the next
   block; a block where a Producer is NAMED (not just
   ability-quoted) is what exercises it.
6. STRIKE RE-TEST (prereg item 3) — NO RECURRANCE. No Strike
   standoff occurred this block (89702 killed the Strike
   d92 in a census fight). The r109 121-round dead-turn shape
   did not recur on current HEAD, and no new dead-turn trap
   appeared. The Strike question is dormant until a Strike
   fight stalls again.
7. M5-VOICING — GO again (89704 crossed + voiced). M3b-peak
   GO (89705 peak 2; 89702 peak 1). M2-census GO this block
   (Arm A with fights 2/3 — 89701 scattered before wave 4,
   but 89702 + 89703 both fought). M22-feast-hold: the
   contribution shortfall is still exactly 1500 kcal median
   on every seed — tenth block. M18 ghost scan: eleventh
   block clean. M17: all 7 seeds classify (3 named-spend
   surges, 4 surge-unspent, 0 capture gaps).

## People check (M7: GO — 2 beats sense-read in full, 0 senseless flags)

Beat 1 — 89705's feared/light finale, read in full (the whole
54-line announce-sliced transcript). The audit is honest
(17/10/5 + 5 wave-4 and 1 wave-5 fought, 10 contests, 3
crises; "the table does not rise. It prices."). The war path
names the sit-era kills and reads the wave-5 bar plainly
("1 of 2 veterans"). The feared beat resolves: "Pledge the
terror" — terror pledged as a shield, never a sword, the
table signing, the village sleeping. The Oversight coda lands
its indictment from the feared side — the napping little
ones, the looking away done on purpose because the village
was busy. Watch item, not a defect: the war path says "They
faced The Strike and lived" and "They faced The Big Beast"
for fights the deeds record as faced (wavesFacedKeys carries
strike ×4) — "faced" is true, "killed" is not claimed, so
the record stays honest (same watch item as r105/r109).

Beat 2 — 89704's relay/dark finale, read in full (the whole
54-line announce-sliced transcript). The audit is honest
(15/8/6 + 4 wave-4 fought, 6 contests, 5 crises). The relay
beat resolves AND owes: the pods, children in uniforms,
Poran and Moldir watching the signer sign ("will remember
the exact shape of your hand"), "the village has never been
this quiet", the System delighted and not understanding why
nobody else is. The merge resolves: "Power immense. Self
eroded." plus the Oliver Moore coda (village endures,
conversation does not end). The scout handover line is not
on this path (it was on r109's 89604 relay beat) — a path
difference, not a regression: this seed's relay final offers
the merge, not the handover.

Live-build conversation check: not run — this run changes no
UI or dialogue code (instrument-only, zero src/js diff), so
there is no player-facing flow to verify at 390×844; the
r105/r109 precedent (same leg, same instrument-only pattern)
likewise verified dialogue via transcripts. If a future run
touches dialogue UI, the live check applies then.

## Blank: instruments filled (r109's two) + gaps for the next run (documented)

FILLED — both r109-named instrument blanks, verified on this
block's data:
1. MENTION-KIND 'producer-name': kind in place in kindOf110;
   unexercised this block (see §5 above), residual empty.
2. SECOND-VETERAN channel + pair lifetime: 4/4 veteran-counted
   kills carry a channel (census 3, villager-side 1, fast 0);
   pair lifetime measured (89705: 20d, ending in pair-death
   on the sit day).

DOCUMENTED, NOT FIXED — two items for the next run / build lane:
1. MFLEE ROUTED-PATH (instrument): record, per mFlee fight,
   the tb result and the routed path (designed dismissal vs
   fled flag vs gotAway-only day-boundary close). The census
   currently reads result null on engine fights. Until then,
   mFlee must be reported as a SAY-line count, never as
   "monsters fled" — 0/5 this block carried monFled.
2. PRODUCER-NAME EXERCISE: the kind needs a block where a
   Producer is named in a non-ability line. If it stays
   unexercised for another block, the next run's metric
   review should ask whether the naming beat still exists
   on the current build or only in r109's seed shape.

## Metric review (for the NEXT run, not this one)

- SECOND-VETERAN: keep, with channel + pair-lifetime as
  reported columns. The next question the table now supports:
  what kills a pair member on the sit day — Diana's d120
  'alien' death (no fight) is the first sit-day pair death
  in the series; the next run should name sit-day deaths
  as their own class (pre-sit daily vs finale).
- KILL-ANATOMY: keep, with feastedAtOpen as the feasted
  column (fallback column retired if it stays 0 — it is 0
  again, 26/26 at open, feasted-true 0/26 this block, vs
  3/18 in r109: feasts did not touch these fights at all).
  The threshold-vs-control question stays open; this
  block's kills rode damage share ~0.81 median, still no
  named control condition.
- W5-question: keep, with the 'producer-name' kind in place.
  The question's next form: second distinct wave-5 type
  faced (w5 1/2 → 2/2), and veterans-at-sit 2/2. The
  feast-rate sub-question stays dormant.
- M8-exit-canon: keep the codex-match verdict, but ADD the
  routed-path column above as a reported (not gating)
  field; a future block where an mFlee carries monFled=true
  on a non-flee-component kind would be a real
  monster-commitment violation, and the current instrument
  cannot distinguish it from a dismissal.
- M2-census: keep the bar; report the early-death shape
  beside it (this block: 89701 scattered d118, 89706 d34,
  89707 d57 before wave-4 fighting — 3/7 seeds never reached
  the leg's content, all on hunger, not combat).
- M17: keep the split; the gap case (used-unreceipted)
  still has not recurred on fresh data.
- M18 ghost scan is now eleven blocks clean. Keep the scan;
  do not retire it yet.
- ARM COMPARISON (descriptive, no lever fate): wins Arm A
  1/3 vs Arm B 1/3 (plus control 1/1); veteran-counted kills
  Arm A 1 vs Arm B 3; seeds peaking >=2 living veterans Arm
  A 0/3 vs Arm B 1/3. The NOWALKIN_W4 arm again banks more —
  and this time it produced the block's only uw=5 seed.
- Telemetry baseline: still the r37-era 2-metric snapshot.
  This run's check LOUD lines (maxTier disappeared 16->0,
  satPenalty.penalty -97%: 91->3) are the same stale-baseline
  artifact as r48–r110: EXPLAINED, baseline NOT rolled. The
  current values run LOWER than r109's (6/33) because this
  block's deferrals were shorter (89702 deferred 2 days,
  89704/89705 sat same-day) — the direction tracks the
  deferral, not a telemetry break. The re-seed proposal
  stands.

## Regression check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree: 284 passed, 6 failed in 704s — EXACTLY r109's
standing pre-existing families (measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof, establishment-r20-fixes). No NEW failure. This
run carries zero src/js diff, so no regression was possible from
it; the check confirms the tree it ran on.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/endgame.json
--current 'evidence/2026-11-02/perseed-endgame-r110/endgame-r110-*.json'
--metrics maxTier,satPenalty.penalty --sweep-rows`:
- LOUD: maxTier disappeared: baseline 16 -> current 0 (n=7).
- LOUD: satPenalty.penalty swung -97%: baseline 91 -> current 3 (n=7).
Verdict: EXPLAINED, baseline NOT rolled — the same stale-
baseline artifact as r48–r109 (the baseline file itself says
its regime is unrecorded and forbids pre-seat comparisons, and
the check's "current" values aggregate 7 seed rows, not a
single-seed snapshot). The re-seed proposal stands.

## Reachable / fun / winnable, for this leg

- REACHABLE: the lesser seat, yes — 3 of 7 villages sat or
  won, including a win on the day of announcement after a
  120-day climb. Wave 5, YES, for the first time — a village
  unlocked it and faced the Timeslot. The full seat, not yet
  — 0 for 15 blocks — but its gap is now two named items,
  not a wall: one more distinct wave-5 type, and a second
  veteran alive at the sit.
- FUN: the beats read well — the pair banking a day apart,
  the 20-day hold to the sit, both sense-read finales
  resolving and owing. The unfun shapes are the vDie grind
  (89703: nine wave-4 fights, zero kills, four villager
  deaths) and the early-hunger scatter (3 seeds never
  reaching wave-4 fighting at all).
- WINNABLE: lesser, yes; full, no (this block). A real player
  can win the game and can now reach wave 5; they cannot yet
  reach the full seat through this road, and the measurement
  now says why in numbers: pairs surviving to a sit 1,
  pairs with both members alive at the sit 0, standing-200
  reached 1 (89705, 427), second wave-5 type faced 0.

## Closeout

- Commit 1: [COMMIT — filled at closeout]: instrument scripts
  (probe + analyzer, r109 renames + the three r110
  instruments) + evidence files (prereg, pilot log/err,
  det log, sweep log/err, analysis txt/err, checkquick log,
  run note, 14 perseed JSON/transcript files, 6 r110-pilot
  snapshot files, heartbeat log). Zero src/js diff.
- Rebase/merge/release: [filled at closeout].
- Rotation-b written 4->5, verified by re-read (social life
  next). Lock deleted only after verifying it still carries
  this run's run_id (2026-11-02T21:55:46Z).
- Heartbeat loop killed after release.
- No push, no bump, no live check — merged locally, pending
  ship (ship loop owns version bumps, pushes, live
  verification).
- No game change this run: instrument + evidence only. No
  [needs-eyes] flag — nothing player-facing changed.
