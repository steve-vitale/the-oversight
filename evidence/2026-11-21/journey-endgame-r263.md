# Journey endgame r263 — run note (Lane B, leg 4 ENDGAME)

Run: `playtest-loop-2-20261121T0856Z`, Lane B leg 4 endgame, substrate `5a018c5da`.
Adoption coordinator (timed-out run recovered, not re-run). Prereg:
`evidence/2026-11-21/journey-endgame-r263-prereg.md`. Analyzer:
`scripts/analyze-endgame-r263-20261121.js` (logs `journey-endgame-r263-analyzer-{a,c,cwide,d}.log`).
Telemetry baseline: `hidden_files/telemetry-baselines/endgame.json` (uw 22 / won 4 / peakVet 12 provisional).

## Recovery (what the timeout left, and how it was finished)

The timed-out run died at 3600s inside the first write flap. Pass A was 4/5
(89705 JSON 0 bytes, EPERM 09:51:16Z); passes C, C-wide, D never ran
(0-byte logs). The adoption recovery chain (`scripts/run-endgame-r263-recovery.sh`,
re-runs only missing work, 3 attempts per pass) was relaunched detached
09:57Z and ran to completion 10:33:35Z:

- **Flap window 1: 09:51:11Z–~10:00Z** (~9 min; last real EPERM hit 09:57:27Z).
  A-89705 recovered 09:59:16Z (EXIT 0, 5/5 files). Flap watcher ALL-OK
  10:03:45Z, 10:06:53Z, 10:07:57Z, 10:09:01Z.
- **Flap window 2: ~10:10Z–~10:17Z** (~7 min; watcher EPERM hits 10:10:07Z,
  10:11:11Z, 10:12:13Z). It caught Pass C-wide attempt 1 mid-run: 89852 JSON
  left 0 bytes, attempt 1 EXIT 1 at 10:10:29Z (3/8 files). Attempt 2
  completed 10:17:14Z (8/8). Watcher ALL-OK again 10:18:44Z.
- Pass C attempt 1 SHORT (3/5, flap), attempt 2 EXIT 0 10:06:37Z (5/5).
- Pass D attempt 1 EXIT 0 10:33:35Z (6/6, no retry needed).
- One analyzer-log write was itself a flap casualty (D analyzer log 0 bytes
  on first run); re-run after the flap cleared, 500 lines, ALL GO.

All 24 seeds present (A 5 + C 5 + C-wide 8 + D 6), all per-seed JSONs
non-empty, all four analyzer verdicts ALL GO. No seed was re-run fresh;
the recovery resumed the timed-out run's own passes.

## Headline

The buyout road converted. Four full seats across the panel — the first
full seat on the buyout road on the matched band (C 89702), the first
wide-band full seat (C-wide 89851), and two on Pass D (89702, 89705).
Every deed-gate opening this run delivered a capstone (4/4, all feast
embassy). The M25d bar — new this run, binding — passes at exactly its
limit (1 bought-seed loss of 13). Pass D, the eighth FIGHTALLY2 sighting,
repeats r239's numbers (2/6 full, kills 13) — but the mechanism does not
attribute the flip to the ally slot (see Pass D). PeakVet adjudication:
the r255 roll to 12 is REVERTED to 3 (Pass A sum 4, in the 3–4 band;
telemetry-check fired LOUD, then quiet after the revert). The wide band
lost 3/8 villages to hunger-scattering — worse survival than r259's 1/8,
including buyout-starvation reproduction #6.

Panel: sat 21/24, full 4/24, lost 3/24, won 21/24. Deaths 184 person-records
(A 36, C 40, C-wide 58, D 50). Wave-4+ kills: A 9, C 13, C-wide 17, D 13
waves (+1 relay seed = 14).

## Pass A (live, CAPSTONE unset, BUYOUT unset) — PRIMARY GO

- Lesser 5/5, full 0/5, won 5/5. Announced d90 all seeds; sat d90–d101
  (89703 deferred 11d). Kills 9 [1,5,0,3]; peakVet sum 4 [0,2,0,0,2];
  uw sum 22; won 5/5.
- M23b: 1/5 reached deedGateReady().ok — 89702@d74 (no capstone on A, so
  no delivery; missed sit d90, ready kinds none).
- Standing peaks 199 / 461 / 199 / 199 / 527. At-199: 2 seeds, at-200+: 2.
- 89704 forcedrift/relay/dark: sat d90 lesser, final:voice, noticed 1,
  cross 1, deaths 2. 89705 wavesnw: sat d90 lesser, w5 1/2, standing 527.
- M9-supply: 125 blocked arrivals (w4 44, w5 0, other 81). M9b waves
  75.8% (WATCH-FLAG-r77), wavesnw 81.8% (WATCH-FLAG-r74 + r77).
- M2b-attribution 5/6 — 89703:d50 audit, Grace Obi, day-window-only
  (same death, same seed as r259's C leg).
- Analyzer: ALL GO (M1–M22, VETCONV, SECOND-VETERAN, FIRENARR, HURTRETURN,
  FALLEN, V-WAITVARIETY, L-PEAK, M23–M25c).

## Pass C (CAPSTONE=1, BUYOUT=1, BUYOUT_EARLY=1) — PRIMARY GO

- Lesser 4/5, **full 1/5 (89702, full d88, feast_embassy d87)**, lost 0/5,
  won 5/5. First full seat on the buyout road on the matched band.
  r259 C read 0/5 full, 1 lost (89702 scattered d54); this run 89702 did
  not scatter and converted instead.
- Kills 13 [5,5,0,3]; peakVet sum 7 [2,3,0,0,2]; M23b 1/5 DELIVERED;
  M25c 5/5 bought early (d34/d18/d53/d41/d17). Deaths 40.
- 89702: sat d90 full, walked feared/light, deed bars 5/5/4/3/2, standing
  552, vetLiving 3. 89705: uw 5, faced 0 wave-5, gap [w5:0/2, capstone:none].
- M2b-attribution 1/2 — again 89703:d50 Grace Obi day-window-only.
- M9-supply: 110 blocked arrivals. M9b waves 75.0% (WATCH-FLAG-r77).
- Analyzer: ALL GO. ROAD-TALLY full-seats earned 1 sat 1.

## Pass C-wide (fresh 89850–89857, same flags as C) — WIDE GO

- Lesser 5/8, **full 1/8 (89851, full d103, feast_embassy d102)**,
  lost 3/8, won 5/8. r259 C-wide read 7/8 lesser, 0/8 full, 1/8 lost.
- The three losses are all hunger-scattering: 89854 d~60 (never bought),
  89855 d48 (never bought, standing max 75), 89857 d83 (bought d35,
  scattered on the 5th hungry day — buyout-starvation reproduction #6).
- M25c: 6 bought of 8 (89854/89855 never reached a buyout window).
  **M25d: 1 bought-seed loss of 13 — PASSES at the bar (≤1).**
- Kills 17; peakVet sum 11 [4,3,1,1,0,0,1,1]. M23b 1/8 (89851@d102).
- 89851: sat d103 (13 days late), standing 557, peakVet 3, bundles 2.
- Analyzer (--wide): M25c GO + CORPUS-PURITY GO. WIDE-VERDICT GO.

## Pass D (FIGHTALLY2=1 + CAPSTONE + BUYOUT, eighth sighting) — PRIMARY GO

- Lesser 4/6, **full 2/6 (89702 full d75, 89705 full d84)**, lost 0/6,
  won 6/6. Kills 13 waves [5,5,1,2,0] (+1 relay seed = 14); peakVet sum
  9 [2,3,1,1,2,0]; M23b 2/6, both DELIVERED (89702@d74, 89705@d83,
  both feast_embassy); M25c 6/6 bought early. Deaths 50.
- **Eighth sighting (Q24): the numbers repeat r239's effect exactly —
  2/6 full, kills 13** (level result is 1/6 full, kills 6–14; r259 D read
  1/6 full, kills 14). The DOWNEDTWICE fix (b) moved D kills nowhere:
  13 vs r259 D's 14.
- **Mechanism — the numbers do not attribute the flip to the ally slot.**
  The seat that flipped vs Pass C is 89705 (lesser on C, full on D), and
  it flipped with FEWER kills than its C leg (2 vs 3). What changed is
  wave-5 FACING: on D, 89705 faced editor d76 + spoiler d83, the deed
  gate went ok, and the capstone delivered d83; on C it faced 0 wave-5
  and the gate never opened. The flip tracks arrival + engagement luck,
  not second-ally damage. FIGHTALLY2 stays OFF — evidence-only, no fix
  landed; the turn-on decision is owed, not taken here.
- **Fail-loudly items fired (investigated, not road-claimed):**
  - Full seat on D where C had none: 89705 (see above — facing, not kills).
  - Wave-4 kill on D where C had 0: 89703. The kill is real and voiced —
    Ines put down The Herald on day 108, on camera, with the village
    cheering — but it happened on the SITTING day itself: D 89703 deferred
    sitting 18 days (d90→d108) behind an unfinished encounter, and the
    Herald was the encounter. The C leg sat d90 and never had that fight.
    Not evidence the slot won a fight the C leg lost.
  - No meeting party of four fielded on D — the #2515 cap was not broken
    in the wild; the sense still caps at 2 allies as far as this panel
    can see. Ally-slot usage is not separately instrumented: the
    anatomy's partyKeys list everyone at the scene (5–7 villagers on all
    passes, identical distributions A/C/D), so it cannot show whether a
    second ally acted. No "second ally joined but never acted" signal
    either way — the instrument gap stands.
- 89703 D: sat d108 lesser, walked relay/light, 12 fights (5 vFlee, 1 vDie,
  1 mFlee, 5 talkDown), deaths 14. 89706 D: sat d105 lesser, walked
  witness/light, surge unspent, 0 grant calls, feastedDays 0 — a village
  that never feasted once and still sat lesser (see People check).
- M2b-attribution 2/2 clean (no day-window-only on D). M9-supply: 132
  blocked arrivals. M9b waves 73.7% (WATCH-FLAG-r77).
- Analyzer: ALL GO. ROAD-TALLY full-seats earned 2 sat 2.

## WARPATH diagnostic — FAITHFUL, no fix

Checked in full against `warpathDeeds` on five seeds (A 89702, A 89705,
C 89702, D 89702, D 89705): every named kill (name, day, killer) and every
named engagement matches the dump, including counts ("3 more teeth",
"2 more of the later drafts"). FAITHFUL re-confirmed.

The narrow-namespace design observation recurs, sharper this run: on
C 89702, FOUR different kills are all village-named "Loud-Eyes" (herald
d76, editor d78, algorithm d82, algorithm d86) — the war path narrates
four different monsters under one name. D 89702 has "Ugly-Bane" naming
two different strike-monsters (d54, d66). "Loud-Bane" / "Loud-Eyes" /
"Big-Bane" / "Big Ugly" collide across seeds (r259 noted "Loud-Bane"
naming two monsters; this run it is four). The war path is faithful to
the dump; the dump's own names are the thin part. Carried as a design
observation, not a defect — no fix proposed here.

## People check (read in full)

Transcripts read in full: A 89702 + 89705, C 89702, C-wide 89851,
D 89702 + 89705 + 89703 + 89706. Defect greps across all 24 transcripts:
"dodged the the" 0, "The The" 0, DRY lines 0, "three times now" 0,
SYSTEM-empty 0. No MISSING in any analyzer log.

- **The Paparazzo fight (C-wide 89851):** a full 6-round party fight —
  Scream Cheese stunning three villagers in chorus, Take Aim ×2.5,
  the prediction mechanic reading honestly ("Prediction 4/4 — it learns
  your dodge", "UNAVOIDABLE flash — break line of sight or eat it").
  The party of six fights together and the counters land.
- **The Callback / Big-Eyes fight (C-wide 89851):** the funeral mechanic
  is the fight — "Speak the funeral — or name it as NOT them" — and the
  village speaks Rosa Mendez's own words back at the thing wearing her
  face until it thanks them and lets go. The best-written fight on the
  panel.
- **Ines kills The Herald (D 89703, d108):** "Oh — OH. Everybody saw
  that, right? Ines just put down The Herald... on CAMERA. That's a
  veteran kill, folks. REMEMBER the name." The village cheers. A
  sitting-day kill that reads as an earned ending, not a bookkeeping
  accident.
- **The village that never feasted (D 89706):** 1,460 SAY lines, ONE
  "FEAST" mention, feastedDays 0, surge unspent, 0 grant calls — and it
  still sat lesser d105, walked witness/light. The feast is not the
  only road to the table; the panel proves it by accident.
- **Small human moments:** "Hold on — I already showed you this one"
  (the lesson-catch line, three seeds); a gift taken back costs trust
  twice (-3, then -5, "They noticed"); Petra speaks only Polish, "No
  shared words at all — just eyes, hands, and patience"; Sam cures
  Nikos's fever and "the camp saw it"; the Scout role passes hand to
  hand (Ecrin → Angelo → Nikolai → Lesiba); a frightened family waits
  a while, then moves on down the road.
- **Carried flat spot:** the keepsake refrain "The feast was the weapon."
  repeats verbatim ×4 on every sitting (all 21 sat seeds). It was ×4 on
  r259's 89705 too. Same family as the r246 closing-line duplication.
  Still an observation, not a defect.

## Watch items (prereg Q1–Q41, answered)

- **M23b tally (this run):** A 1/5 (89702@d74, no capstone), C 1/5
  (89702@d87 DELIVERED), C-wide 1/8 (89851@d102 DELIVERED), D 2/6
  (89702@d74 + 89705@d83, both DELIVERED). r259 read A 1/5, C 0/5,
  C-wide 0/8, D 1/6. The gate opened on 4 seeds this run and delivered
  every time.
- **M25d (binding, new):** PASSES 1/13. Reproduction #6 is 89857
  (bought d35, scattered d83). The other two wide losses never bought.
- **DRY2:** 0 dry lines panel-wide (r256 fix holds).
- **"dodged the the":** 0 panel-wide (crisis r261 fix holds).
- **NOTICK/CARRY:** 0 deferrals, 0 trioCarry on all full passes —
  fifth straight zero observation.
- **GUARD-STALL:** max same-reason deferral 18 days (89703 D), under the
  30-day LOUD line. TOTAL-DEFERRAL max 18 days, also under 30.
- **159-turn Algorithm fight (r194):** did not recur. Longest single
  fight on the panel: 89 turns (C 89702 vDie).
- **fastW4 scholar-death fight:** none.
- **Funeral-mend:** FIRED 6×, all voiced — 4 full mends ("the -8 bought
  back with grain"), 1 partial (+2, Benoit, 290 kcal), 1 unmended
  (Morgan, pantry empty, "-8 stands"). Same as r259.
- **Goal-bridge:** no repeat-before-7-bridges line observed.
  **Settled-favor:** no settled-favor openers served on this panel
  (vacuous).
- **M9b contention:** WATCH-FLAG-r77 on every pass (waves 73.7–75.8%,
  wavesnw 67.6–81.8%, vs r77 94%). A watch, not a failure.
- **Standing-199 stall (#2615):** worst yet — D 89703 161 days at 199,
  C 89701 129 days, A 89703 111 days. The stall is real and growing;
  it still does not block the table (all three stalled seeds sat).
- **M2b-attribution:** the Grace Obi day-window-only death recurs on
  89703 A and C (deterministic — same seed, same death). D is clean 2/2.
- **Medic duty / companion guard:** medicDutyBlocked A 234, C 124,
  C-wide 319, D 240 (r259: 190 / 104 / 467 / 210). Companion-guard
  skips 11 / 16 / 0 / 16. deathCleanups 5 / 7 / 2 / 11; removalCleanups
  0 everywhere. Medic duty is still the dominant companion-call
  blocker, by an order of magnitude over the guard.
- **M12 escalator cap:** r262's fix is on this substrate; M12-bar-record
  GO on all passes. 89702 C arm=8 armed=10 tricks=33 vet=3 short=[]
  (nothing short — the bar was met in full on the converting seed).
- **Deltas (a)–(e):** DODGE-ARTICLE holds (0 doubled articles);
  DOWNEDTWICE moved D kills nowhere (13 vs r259 D 14); M12-CAP live
  (see above); WARN-HEED and LINK-RAISE opener pools — no fail-loudly
  signal on this panel.

## F-item (filed this run)

None. No new finding is filed from r263: every fail-loudly item that
fired is investigated above (Pass D flip, 89703 D kill) and none is a
defect in the game. The buyout-starvation reproduction #6 (89857) is
the sixth sighting of a known pattern, recorded under M25d, not a new
finding number. The narrow war-path namespace is a carried design
observation (see WARPATH).

## Village assessment (plain words)

The villages are alive and the table works. Twenty-one of twenty-four
villages sat down at the table, and four of them walked away with the
full seat — the first time the buyout road has ever converted on the
matched seeds, and the first time a fresh wide-band village has done
it. When the deed gate opened, the village always delivered the
capstone; the feast embassy is a door that actually opens. People
fight together, learn each other's tricks, cure each other, bury
their dead with feasts, and argue about what to call the monsters.
The fights read like fights, and the table reads like a trial.

But the road is still narrow. Two villages spent a hundred days or
more stuck at the same standing number while ready to sit. Three
fresh villages starved and scattered before day 90, and one of them
had already bought the feast bundle — the food ran out anyway. Every
full seat this run came through the same single door, the feast
embassy; the military tribute and the trade charter never delivered
anywhere. And the wave-5 bar still turns on whether two fighters
happen to be alive on the right day — the villages that sat lesser
mostly did so for want of one more wave-5 monster faced, not for want
of trying.

## Reachable / fun / winnable

- **Reachable: YES.** 21/24 villages sat (A 5/5, C 5/5, C-wide 5/8,
  D 6/6). The table is not a rumor; ordinary competent villages reach
  it.
- **Fun: YES, with the carried caveats.** The fights, the funerals,
  the naming arguments, and the table itself all read as a world with
  people in it. The keepsake refrain repeating verbatim four times
  per sitting is the one flat note that keeps recurring.
- **Winnable: YES.** Four full seats on one panel, including the first
  buyout-road conversion on the matched band. The win is no longer a
  single lucky seed: it happened on three different passes and two
  different roads (matched + fresh wide).

## Metric review (§14)

- **peakVet adjudication — REVERTED to 3.** r263 Pass A sum is 4
  (per-seed peak [0,2,0,0,2]), squarely in the r239–r249 3–4 band.
  The r255 roll to 12 on ONE observation is adjudicated premature
  (r259 read 6, r263 reads 4). Baseline file updated 12 → 3 with a
  r263 note; telemetry-check re-run quiet. uw/won NOT rolled (uw 22
  vs 22, won 5 vs 4 — quiet, per prereg).
- **M23b tally:** A 1/5, C 1/5, C-wide 1/8, D 2/6 — all four openings
  delivered. The deed gate is opening more often than on r259
  (1/5, 0/5, 0/8, 1/6) and converting every time it opens.
- **FIGHTALLY2 eighth sighting:** numbers repeat r239 (2/6 full,
  kills 13); mechanism does not attribute the flip to the slot.
  Stays OFF. Decision owed, not taken here.
- **M25d:** first binding observation PASSES 1/13, at the limit.
  The bar binds; the next run decides whether 1/13 was the edge or
  the middle.
- **Standing-199 stall:** 161 days worst (D 89703), up from r259's
  band. The stall is growing, not shrinking — the stalled-while-ready
  metric from r247's review still awaits its first run.
- **M9b contention:** WATCH-FLAG-r77 persists on all passes; shares
  67–82% vs r77's 94%. No revision proposed.
- **NOTICK/CARRY:** fifth straight zero. The instrument keeps
  measuring nothing — the deferral it was built to catch has never
  fired on five endgame panels.
- **F5 + C3d:** stay vacuous on the endgame leg; the sittings do not
  reach them.

## Telemetry

`telemetry-check.js` on Pass A (5 files, 3 metrics
veterans.unlockedWave/won/peakLivingVeterans): **LOUD on first read** —
peakLivingVeterans swung -67%: baseline 12 → current 4 (n=5, exit 1).
Per the prereg adjudication the baseline REVERTED to 3 (see Metric
review); re-run after the revert: **quiet**. Same on C-wide (8 files,
3 metrics): **quiet**. Task-template read (4 metrics
national/table/wins/exiled): **quiet**. uw 22 vs 22, won 5 vs 4 —
within tolerance, not rolled.

## Gate

- Adoption gate, `node scripts/check.js --quick` in the journey2-endgame
  worktree on branch tip 08e6334ee (the separate r263-gate worktree the
  first adoption planned was never built — the gate ran against the
  identical tree in the existing worktree, saving a 10–20 min checkout
  under load): **338 passed, 6 failed in 1080s.** Log: goal
  `hidden_files/evidence/2026-11-21/journey-endgame-r263-gate.log`.
- All 6 failures are standing-set members, identical to the r262 adoption
  gate: the staleness pair (test-measurement-proof-update.js,
  test-measurement-workflow.js), test-measurement-cache-flags.js,
  test-phone-frame-proof.js (stale receipt), and two 120s
  deed-attainment timeouts (living-garden, one-person-army).
  **0 attributable to this branch** — evidence-only, no src/js change.
  The five r262 timeout failures (trust-observer-neutrality,
  synergy-stall, capable-bot, table-endings, succession-grief) all passed
  this run.
- No second (rebased-tip) gate: the branch is evidence-only; the rebase
  onto master 9c4ed7a87 changes only the base (the ship loop's
  version-bump commit), not the branch content, and no green-list test
  reads this branch's evidence files. Rebase verified clean (see the
  closeout record in ~/memory/2026-11-21.md).
