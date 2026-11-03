# Journey endgame r118 — ARM 2 RESHUFFLES THE BLOCK, WAVE 5 VANISHES (lane B, 2026-11-03)

## Run provenance

Leg 4 (endgame). Rotation-b read 4 at run start; this run writes 5
(social life next) at closeout, verified by re-read after landing
(closeout write per r103/r104/r105/r109/r110 precedent, so a failed
run cannot skip the leg). Run number basis: the Lane B counter is
shared across legs — latest is r117 (succession, 2026-11-03); this
run is r118. Slug: journey2-endgame (branch pre-existed, pointing
EXACTLY at master ff1725835, zero ahead/behind — attaching it is
not a stale base; verified by rev-parse before registration).
Base: master ff1725835 at registration (git pull already up to
date). Main tree clean at pre-flight (0 files), disk 31%.

Run-start incidents (infrastructure, LOUD):
- STALE-LOCK RECOVERY: lock loop2-20261103T145757Z (08:57 CST) had
  NO registered tree and NO heartbeat in REGISTRY.json — dead per
  the overlap guard no matter how fresh the lock looked. Deleted;
  fresh lock loop2-20261103T155953Z written, held throughout,
  deleted at closeout after verifying it still carries this run's
  run_id.
- REGISTRY-LOCK CONTENTION: a sibling reap held REGISTRY.lock from
  15:53Z; this run's foreground reap queued behind it and was
  stopped (the sibling reap covers the same cleanup — no work
  lost); worktree registration then queued ~18 min and succeeded.
  Heartbeat loop started after registration; registry heartbeat
  verified landed 2026-11-03T16:25:05Z (active) and fresh at every
  later check (loop alive, beats every 600s; last verified
  16:39:49Z during the sweep).

Substrate r110 EXACTLY (capable + deedhunt + vetcommit + greedy
deferral defaults MAXTIER 4 / LASTDAY 145, NOT tuned + armorydrive
+ fullseat-diag + vetguard on waves seeds; forcedrift control
clean). 180d, death-aware. DELIBERATE seed reuse, not fresh seeds:
89701-89707 are r110's seeds, re-run on current HEAD — a MATCHED
before/after (same seeds, same probe policy, only the game code
changed). HEAD delta since r110, verified by git show --stat: the
gameplay change is winnability push ARM 2 (d8f334da8:
src/js/fieldFights.js + sigW4.js — sigW4 double damage, ally gear
parity, party morale, known-trick hold). Arm 4 natwindow touched
only evidence/scripts/policies — no src/js, so it cannot move game
outcomes. Comparison is descriptive (n=7); no significance claim.
Probe: `scripts/probe-endgame-r118-20261103.js`. Analyzer:
`scripts/analyze-endgame-r118-20261103.js`, full output in
`evidence/2026-11-03/journey-endgame-r118-analysis.txt`.
Comparison: `scripts/compare-endgame-r118-vs-r110.js`.
Analyzer exit 1 = verdict-driven (PRIMARY NO-GO | ALL NO-GO, see
below); .err empty, no crash. No src/js change this run.

Seeds: 89701-89703 waves (Arm A), 89704 forcedrift control,
89705-89707 wavesnw (Arm B, waves + NOWALKIN_W4). Pilot
(89701+89705+89704) met the prereg gate (1 sat, 7 census fights,
2 classified losses), so the run expanded to the full 7; pilot
seeds reproduced BYTE-IDENTICALLY in the full sweep (JSON
snapshotted to `evidence/2026-11-03/r118-pilot/` before the sweep
overwrote them). Determinism leg: DET GREEN byte-identical on
89701 (2x 120d).

## Village assessment, in plain words

Three villages won the lesser seat, four died — the same 3/7 win
count as r110, but a different three, and NO village reached wave
5 (r110 had one). The block reshuffled hard without moving the
endgame forward.

- 89701 (waves): SCATTERED d90. Two people left, pantry 0 — the
  honest scattering line again: hunger broke it (r110: scattered
  d118, same shape, earlier). Never reached the leg's content
  (unlocked wave 3 only, zero fights).
- 89702 (waves): WON LESSER, announced d90, sat d99 (deferred 9
  days, 4 greedy waits). Six alive. Ten census fights: 1 kill,
  2 villager deaths, 4 talked-down, 3 other-end. The kill count
  FELL (r110: 3 kills, sat d92) while talk-downs doubled — this
  seed fought more and killed less. Full-seat gap: w5 0/2 +
  veterans 1/2 (M12: vet=1, short=[veterans]).
- 89703 (waves): SCATTERED d52. Two people left, pantry 0. The
  grind is GONE — not because the village got stronger, but
  because it starved at d52 before fighting (1 talk-down only).
  r110's version lasted to d152 and fought wave 4 nine times
  without a kill. Same seed, opposite failure: long grind vs
  early hunger. Neither reached the leg's content with a kill.
- 89704 (forcedrift control): SCATTERED d90. One person left,
  pantry 0, zero fights, uw3. r110's control WON LESSER d90 with
  3 fights. The control flipped win→loss on the matched seed —
  the run's most surprising delta, mechanism unattributed (see
  below). M5-voicing therefore judged on fallback (89702 grey
  final with notice), not on the control.
- 89705 (wavesnw): WON LESSER, announced d113, sat d113. Six
  alive. Seven census fights: 4 kills, 2 villager deaths, 1
  mFlee. killsW4 5 (r110: 3) — MORE killing — but uw4, never
  wave 5 (r110: uw5, faced the Timeslot d112, standing 427).
  Standing peaked 199, one short of 200; no release snapshot ever
  fired (r110: release d100 with 2 living veterans ready). The
  pair banked d92+d98 (sam_wilson + stan_kowalski, 6d gap) and
  stan died d101 — pairLife 3d — leaving 1 veteran at the sit.
  The village fought more wave-4 (7 faced vs 5), won more kills,
  and still sat a lesser seat a week earlier with less standing.
- 89706 (wavesnw): WON LESSER, announced d90, sat d102 (deferred
  12 days, penalty 13, 3 lost meanwhile). Eight alive. Three
  census fights: 2 villager deaths, 1 mFlee (a Strike, clean
  4-turn end — no standoff recurrence). r110's version scattered
  d34 with zero fights. Loss→win flip, the block's one favorable
  move — but on zero kills and a 12-day deferral that cost 3
  lives, not on a stronger climb (uw4, peakVet 0).
- 89707 (wavesnw): SCATTERED, 5 alive, zero fights, uw3 (r110:
  scattered d57, same shape).

## Leg questions, answered

1. ARM2-DELTA (descriptive, NOT gating) — MIXED, NET ZERO ON
   REACH. Block tallies r110 → r118: sat 3/7 → 3/7, won 3/7 →
   3/7, census fights 29 → 21, vKills 6 → 5, killsW4 4 → 6,
   w5faces 1 → 0, uw5 seeds 1 → 0, standing-200 reached 1 → 0.
   Per-seed: 89702 kills down (3→1) and sat later (d92→d99);
   89703 grind→early hunger; 89704 win→loss (control); 89705
   kills up (3→5) but uw5→uw4, sat earlier (d120→d113),
   standing 427→199; 89706 loss→win (0 kills, 12-day deferral);
   89701/89707 same loss shape. Five of seven seeds changed
   outcome class or sat day. Arm 2 did NOT preserve the block's
   only wave-5 unlock and did NOT open the full seat on any
   seed. What it did is reshuffle trajectories: earlier sits,
   different deaths, kills up on one seed and down on another.
   The matched design proves the HEAD changed outcomes; it does
   NOT isolate which arm-2 sub-change (damage vs morale vs gear
   parity vs trick-hold) caused each flip, and early hunger
   deaths are downstream of many small divergences — attribution
   needs a sub-lever toggle run, not improvisation here.
2. MFLEE-ROUTED — ANSWERED FOR THIS BLOCK. Both mFlee fights
   (89705 eulogy d103, 6 turns; 89706 strike d71, 4 turns) are
   class gotAway-only with the SAME line: "It got away. No meat,
   no trophy — but you're breathing, and now you know its
   moves." No monFled flag, no settlement result (closeSnapResult
   null throughout — confirming r110's diagnosis that result
   reads null on engine fights), same-day ref-change closes, not
   day-boundary sweeps. Verdict: these are designed dismissals,
   NOT monster flight, and the r110 day-boundary caveat does not
   apply to them. Coverage bar GO (2/2 carry gotAwayLines).
   Residual limit: gotAway-only still cannot distinguish a
   dismissal from another routed path except by the line text —
   but the line text here is unambiguous, and neither kind
   (Eulogy, Strike) carries a flee component, so no
   monster-commitment violation. M8-exit-canon GO (both matched
   to a codex slain stage).
3. SIT-DAY-DEATHS — ANSWERED, NONE THIS BLOCK. Zero sit-day
   deaths on any sat seed (r110's Diana d120 shape did NOT
   recur). Pre-sit-week: only 89706 (yuki_mori contest d95 +
   ruth_goldstein combat d101, dual-recorded — 2 people, not 3
   records). The transcript's "3 of Haven lost meanwhile" matches
   the sat penalty (losses=3): the third loss fell in the
   deferral window before the 7-day window (d90-d94), so there
   is no count mismatch — only a window-definition difference.
4. SECOND-VETERAN — PAIR FORMED, DIED BEFORE THE SIT. 89705's
   pair (sam_wilson d92 census + stan_kowalski d98
   villager-side, 6d gap) lived 3 days; stan died d101, 12 days
   before the sit. At the sit, veterans 1/2 (M12: vet=1,
   short=[veterans]). r110's pair lived 20 days to the sit day
   and lost a member ON it; r118's pair never reached the sit
   at all. The veterans-at-sit bar still fails — by a wider
   margin, and earlier. Coverage GO (6/6). Watch item: 89705's
   d92 kill reads channel 'census?' (vKill fight, same day,
   same monster, but turnsObserved false — a day-end close,
   turns=1). Coverage counts it; the '?' marks a channel rule
   worth tightening (see metric review), not a data gap.
5. W5-FORK — NO-GO (binding). NO uw=5 seed in the block
   (complete=true 7/7, but the question needs >=1 uw=5 seed).
   M4-wave5-or-full NO-GO (0/6 waves seeds). PRIMARY NO-GO |
   ALL NO-GO — reported as a miss, never re-scored. The full
   seat stays 0/7 on this block, and its gap on the sat seeds is
   now w5 0/2 + veterans 1/2 (M12), with standing-200 also
   unreached (M11: at-199:3, at-200+:0).
6. PRODUCER-NAME EXERCISE — STILL UNEXERCISED. The kind stays
   in place; 'other' residual EMPTY (0) again. No seed names a
   Producer in a non-ability line this block either. Per r110's
   metric review, the next run should ask whether the naming
   beat still exists on the current build or only in r109's seed
   shape — two blocks unexercised now.
7. M5-VOICING — GO ON FALLBACK (named honestly). The control
   died d90 before the relay window, so the canonical
   control-crossed-and-voiced path was unavailable; judged on
   89702's grey final with notice lines. A fallback GO, not a
   control GO — the control flip is what forced it.
8. KILL-ANATOMY — kills ride high damage share (vKill n=5,
   partyMed 5, turnsMed 7, dmgMed 518, poolMed 675, shareMed
   0.77, feasted 1/5); vDie shareMed 0.57 (villages deal over
   half the pool before dying); otherEnd shareMed 0.02
   (dismissals after token damage); talkDown 1 turn, 0 damage.
   Feasted-at-open 2/21 (r110: 0/26) — feasts touched fights
   slightly more, still rare. M22-feast-hold: contribution
   shortfall still exactly 1500 kcal median — eleventh block.

## People check (M7: GO — 2 beats sense-read in full, 0 senseless flags)

Beat 1 — 89705's beloved/light finale, read in full (the whole
56-line announce-sliced transcript). The audit is honest
(17/12/5 + 7 wave-4 fought, 12 contests, 4 crises; "the table
does not rise. It prices."). The war path names the d111 + d112
Influencer kills correctly and reads the wave-5 bar plainly
("1 of 2 veterans"). The beloved beat resolves: spending the
finale slot on unfilmed villages and the dead, "Let the
audience speak," popularity into a constitution. The Oversight
coda lands its indictment from the beloved side — the napping
little ones, the looking away done on purpose because the
village was busy. The OUTSHONE/PANTHEON turn (Ethan Hunt and
Diana Osei ascended while the player watched) is bittersweet
and coherent, not contradictory: Diana acts in the finale,
then ascends. Watch item, not a defect: the d90 withdrawal line
sits above a d113 announce-and-sit — a decline-then-return
shape (r68's question 7, answered as occurring).

Beat 2 — 89706's feared finale, read in full (lines 1524-1551).
The audit is honest (15/9/8 + 4 wave-4 fought, 5 contests, 4
crises). The war path is honest ("0 of 2 veterans", "3 of 4
fighters armored"). The overtime note matches the penalty
exactly (3 lost). The feared beat resolves: "Pledge the
terror" — terror pledged as a shield, never a sword, the table
signing, the village sleeping, the fence-walking coda. Watch
item, not a defect: the transcript says "1 week kept waiting"
for a 12-day deferral (deferDays 12) — weeks-rounded narration.

Live-build conversation check: not run — this run changes no
UI or dialogue code (instrument-only, zero src/js diff), so
there is no player-facing flow to verify at 390×844; the
r105/r109/r110 precedent (same leg, same instrument-only
pattern) likewise verified dialogue via transcripts. If a
future run touches dialogue UI, the live check applies then.

## Blank: instruments filled (r110's two) + gaps for the next run (documented)

FILLED — both r110-named instrument blanks, verified on this
block's data:
1. MFLEE ROUTED-PATH: gotAwayLines + closeSnapResult on every
   fight; both mFlee fights classified gotAway-only with the
   dismissal line text. The instrument answers the question it
   was built for on this block.
2. SIT-DAY-DEATHS as a class: sat-day vs pre-sit-week columns
   in place; this block's answer is none / 2 people.

DOCUMENTED, NOT FIXED — three items for the next run / build lane:
1. CONTROL-FLIP ATTRIBUTION: 89704 (forcedrift) went win→loss
   on the matched seed with zero census fights. The HEAD delta
   is proven; the mechanism is not. A sub-lever toggle run
   (arm-2 components individually) or an early-trajectory diff
   on 89704 is the next step — not a claim this run can make.
2. PRODUCER-NAME EXISTENCE: two blocks unexercised. Does the
   naming beat still exist on the current build, or only in
   r109's seed shape? If a third block stays unexercised, the
   kind should be retired or the beat re-found, not carried
   silently.
3. CHANNEL 'census?' + DEFERRAL ROUNDING (watch items): the
   day-end-closed vKill reads 'census?' — tighten channelOf or
   document the day-end rule; the overtime line rounds 12 days
   to "1 week" — confirm whether weeks-floor is the intended
   narration.

## Metric review (for the NEXT run, not this one)

- M4-wave5-or-full + W5-question: keep, binding. This block's
  NO-GO is the finding: on matched seeds, arm 2 lost the only
  uw5 seed. The next run's question is whether the loss is
  arm-2-specific (re-test after any arm-2 revision) or a
  sit-timing structural fact (villages sit before release when
  deeds/standing arrive first). Do NOT soften M4 to count
  near-misses.
- ARM2-DELTA: keep as descriptive only. Do not promote it to a
  gating bar on n=7 — its value is direction + per-seed
  mechanism sketches, and this block's direction is mixed.
- MFLEE-routed-coverage: keep, gating. The gotAway-only class
  should gain a line-text sub-class (dismissal-line vs other)
  now that the line text is recorded — the class alone cannot
  distinguish routed paths.
- SIT-DAY-DEATHS: keep as INFO. Add the deferral-window column
  (announce→sat deaths, not just satDay-7) so the "3 lost"
  count reconciles without a window footnote.
- SECOND-VETERAN: keep, with channel + pair-lifetime. The next
  question is pair survival TO the sit (r110: lost on the sit
  day; r118: lost 12 days before) — what kills pair members in
  the sit approach, by cause (combat vs contest vs other)?
- M5-voicing: keep, but report fallback-vs-control explicitly
  every block (this block is the first fallback GO in the
  series — a control death must never read as a control pass).
- M11-standing-peak: keep; add the at-200+ count as a reported
  column (this block: 0 — the standing collapse is part of the
  arm-2 story, not a footnote).
- M22-feast-hold: eleventh block at exactly 1500 kcal median.
  Keep the scan; the number is now a standing fact of the
  substrate, not a per-run surprise.

## Regression check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree: 284 passed, 6 failed in 655s — EXACTLY r110's
standing pre-existing families (measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof, establishment-r20-fixes). No NEW failure. This
run carries zero src/js diff, so no regression was possible from
it; the check confirms the tree it ran on.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/endgame.json
--current 'evidence/2026-11-03/perseed-endgame-r118/endgame-r118-*.json'
--metrics maxTier,satPenalty.penalty --sweep-rows`:
- LOUD: maxTier swung -87%: baseline 16 -> current 2 (n=7).
- LOUD: satPenalty.penalty swung -78%: baseline 91 -> current 20 (n=7).
Verdict: EXPLAINED, baseline NOT rolled — the same stale-
baseline artifact as r48–r110 (the baseline file itself says
its regime is unrecorded and forbids pre-seat comparisons, and
the check's "current" values aggregate 7 seed rows, not a
single-seed snapshot). The values moved from r110's (0, 3)
because this block's deferrals were longer (89702 9d, 89706
12d) — the direction tracks the deferral, not a telemetry
break. The re-seed proposal stands.

## Reachable / fun / winnable, for this leg

- REACHABLE: the lesser seat, yes — 3 of 7 villages sat or
  won, including a loss→win flip (89706). Wave 5, NO on this
  block — zero seeds unlocked it, down from one in r110. The
  full seat, not yet — 0 for 16 blocks — and its gap is now
  w5 0/2 + veterans-at-sit 1/2 + standing under 200, on a block
  where the previous wave-5 seed fought MORE and killed MORE
  yet released nothing. The wall is not kill-count-shaped on
  this evidence; it is pair-survival + release-timing-shaped.
- FUN: the beats read well — both sense-read finales resolve
  and owe, the dismissal line ("you're breathing, and now you
  know its moves") is characterful, and the decline-then-return
  (89705 withdrew d90, sat d113) is a real arc. The unfun
  shapes are the early-hunger scatters (4 seeds, three by d90)
  and the vanishing grind (89703: nine fights → one talk-down
  and starvation).
- WINNABLE: lesser, yes; full, no (this block). A real player
  can win the game and, as of r110, could reach wave 5; on this
  matched block they cannot — arm 2, as shipped, did not
  preserve the wave-5 road, let alone extend it. That is a
  build-lane finding, not a measurement artifact: same seeds,
  same probe, only the game code changed.

## Closeout

- Commit 1: d3312f95 (instrument scripts (probe + analyzer +
  compare, r110 renames + the r118 instruments) + evidence files
  (prereg, pilot log/err, det log/err, sweep log/err, analysis
  txt/err, checkquick log, run note, 14 perseed JSON/transcript
  files, 6 r118-pilot snapshot files). Zero src/js diff.
- Index-clobber incident (house lesson, third class sighted):
  after the safe-commit, the worktree index showed all 34
  committed files as staged deletions, and a mid-repair
  `git diff HEAD` read 189,990 deletions — a torn-index
  phantom, NOT file loss. Repair: per-file `git update-index
  --add --cacheinfo` from HEAD blobs (34 files); verified after:
  `git status` empty, `git diff HEAD` empty, `git diff
  --cached` empty, hash-object == HEAD blob on spot-checked
  files, all 7 perseed JSONs parse with correct fight counts.
  The commit itself was always correct (34 files, 189,990
  insertions).
- Commit 2: b4d029f0 (rebased as 763d42842) — run-note closeout
  section (commit-1 hash + index-clobber incident).
- Rebase: clean onto new master 0e6cbeb8 (12 sibling commits
  landed during the run: win-intel, win-drives track 3,
  gap-seatshort, journey-scale r91, winfunnel) as f230fe8fd +
  763d42842; analyzer re-run on the rebased tree byte-identical
  to the committed analysis (PRIMARY NO-GO | ALL NO-GO, exit 1
  verdict-driven). Merge to local master follows; the merge
  result is reported in the run's closeout message (this note
  was committed before the merge, so it cannot cite the merge
  itself).
- Rotation-b written 4->5, verified by re-read (social life
  next). Lock deleted only after verifying it still carries
  this run's run_id (loop2-20261103T155953Z).
- Heartbeat loop killed after release.
- No push, no bump, no live check — merged locally, pending
  ship (ship loop owns version bumps, pushes, live
  verification).
- No game change this run: instrument + evidence only. No
  [needs-eyes] flag — nothing player-facing changed.
