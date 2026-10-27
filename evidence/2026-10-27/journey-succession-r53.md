# Journey succession r53 — DEED-CALLER + TEACH-NEW (lane B, 2026-10-27)

Leg 7 (succession). Rotation-b 7 → 4 (endgame next). Seeds 26081–26085
(fresh band), competent policy, mixed regime: 26081–26082 scripted day-5
kills, 26083–26085 mature (EARLY_KILL_DAY=40, staging aspiration),
45-day successor window. Instrument only, zero src/js changes. Base
master@648a42d01 at run start. Merged locally, pending ship (no
bump/push/live check — ship loop owns those).

Pre-registration: evidence/2026-10-27/journey-succession-r53-prereg.md
(written BEFORE any run). Instrument: scripts/journey-succession-r53-20261027.js
+ analyzer + proof test, all new files in this commit.

## HEADLINE

The deed trigger is the haul, not a gate and not a lesson — and teaching
in the wild is re-teaching only, on a second fresh band.

1. DEED-CALLER GO. Every deed this band maps to a policy path (46/46,
   zero unmapped): 28 haul-teaches + 18 haul-donations. No gated
   donation, no teachRound lesson, no conversation teach appears at
   all. Deeds happen on days the successor comes home from a forage
   trip: the haul's teaching moment (learnFromShowing via
   haulTeachingMoment on returnToVillage) and the haul's pantry
   donation (donateSurplus via donateHaul). The daily gated donation
   (donateSurplus direct, 1-transfer cap) never fires in this band —
   which is consistent with r52's multi-transfer days: the gated call
   is not where donations come from. No-deed days are days without a
   haul return that teaches or donates, not days with a closed gate.
2. TEACH-NEW: ZERO. All 28 teachPlant deeds taught an already-known
   plant (targetKnowsBefore 28/28 true, 0 false, 0 null), all via
   haulTeachingMoment, all trust delta 0. No path in the competent
   policy's wild play teaches a new plant — teachRound never runs its
   teach (its own comment says it could never teach anything new as
   written), and the conversation "teach" choice does not call
   teachPlant at all (it shows, it does not ledger). Teaching in the
   wild is re-teaching, twice confirmed (r52: 40/40, r53: 28/28).
   This is now a policy finding to carry to Steve, not an instrument
   gap: if new-plant teaching is supposed to happen, no exercised
   path does it.
3. THE LEO CASE (new bearer, frozen trust). 26081: Elias takes over
   d6 at 22, dies in the arena d9; Leo takes over at 27 and drops to
   7 inside the same day's d+3 driven-convo window — a direct
   -20 trust assignment with NO bumpTrust entry (the residual writer
   class, now concretely instanced). The window holds a betrayal-case
   interrogation of Ramadan about "the murder of Omar," ending with
   Ramadan hurt and angry ("I share my food with you and this is what
   I get?"). The exact writer function is NOT pinned: the two -20
   theft sites print lines absent from the NPC-only convoLines, and
   the betrayal -8 does not match -20. Leo then sits at 7 for 41 days
   while the village warms 19.6→70.9 — because bearer trust climbs
   only on donation moves, and Leo-as-player never donates once
   (0 donate deeds on 26081). A successor who never donates never
   climbs, however warm the village gets. Open root-cause item, with
   the transcript and the convoWindowMove as evidence.
4. M3v2b PASSES this band (5/5 seeds ≥ 2: 2, 4, 7, 3, 4) after r52's
   narrow miss (3/5). The bar question (scaling with village size/age,
   or counting from the funeral) stays carried, not ruled — but the
   miss does not repeat on this band.
5. W1d-tightened POOLED GO: 4/4 (1.0). Only 26083 (1/1) and 26085
   (3/3) contribute; the other three seeds are subset-empty and are
   named, not scored. The r51-subset vs tightened split recurs
   instructively on 26085: r51-subset 4 with 3 donations (0.75) vs
   tightened 3/3 (1.0) — the bump-classified entry on a deed day is
   again the artifact the tightening excludes.
6. ALL THREE CHAIN MANTLES ARE ARENA DEATHS (26081 Elias, 26082
   Kayden, 26085 Maren) — same class as both r52 chains. In these
   sims the arena is the chain-mantle engine; no other chain cause
   appears across r52–r53 (5 chains, all arena).

## Verdicts (binding, §14 — a miss is NO-GO, never re-scored)

- SCRIPT (young staging): GO — 2/2 day-5 seeds staged the scripted kill
  (26081 d6 Scott→Elias, 26082 d6 Hayden→Kayden; same day-6 landing as
  the proof seed).
- MATURE staging rate: 2/3 scripted (26083 d40 Consuelo→Ursula,
  26085 d41 Peyton→Maren); 26084 pre-empted organically at d21
  (Scott→Dwayne). Scripted-or-organic honored on all seeds. Organic
  pre-emption is now 6 of the last 9 mature seeds across r50–r53 —
  the day-40 regime stages a mature kill about a third of the time,
  and the rate is now reported rather than assumed.
- V1 (vouch snapshot): GO — both snapshot seeds PASS-fired (26083: 7
  eligible, all alive post-death, 1 vouch line; 26085: 6 eligible, all
  alive, 1 vouch line). Young seeds n/a-none-eligible (expected).
  Organic seed n/a per the standing organic rule. No FAIL-alive-silent
  anywhere. Died-between still empty.
- C1v3 (transition rule, binds): GO 5/5 — 24 transitions, 0 missing
  (3 + 3 + 3 + 3 + 12, all byCall except one byConvoPrev on 26081).
- W1a (mutation-trap completeness, binds): GO — all transitions carry
  a scheme classification; the r50-class unexplained entries (26083: 1,
  26085: 2) are donation-named on their covering calls, the r52
  boundary class, not a writer gap.
- W1d-tightened (donation join, binds as a finding bar): GO — pooled
  4/4 (1.0 ≥ 0.5); per-seed with a subset: 1/1, 3/3. Subset-empty
  seeds (26081, 26082, 26084) named, not scored.
- S1 (bearer-own delta, carried): GO — 0 missing bearerDeltaExact,
  0 bad solo (|delta| ≤ 2 everywhere; solo deltas all +1/+2).
- MG2v2 (meal-line only, binds): GO 5/5, 0 violations (audit days
  45 × 5). Old MG2 also 0 — reported, not judged.
- M3v2b (social echo, carried): GO 5/5 — (2, 4, 7, 3, 4), all ≥ 2.
- M1 (funeral arc): GO 5/5. M4 (machinery): GO 5/5 mantles clean
  (linOk + moOk, including all three chain mantles).
- OVER-CAUSE: unexercised this band — all 5 villages survive (over
  false everywhere, alive 9–10, pantryEnd 9,885–52,815). Watch only.
- SOLO (continuity only): 8 solo moves (26083: 2, cum +2; 26085: 6,
  cum +8), all +1/+2, bounded — same class as r50–r52.
- Chain deaths: 3, all cause-known (all "the arena").
- M5 (people check): GO with warts — 4 transcripts sense-read in full
  (below), 0 identity failures (identityTrips=0 all seeds).

## Village assessment in plain words

- 26081: Scott dies to a hushwolf on day 6; Elias takes over at 22
  and dies in the arena on day 9; Leo takes over at 27, drops to 7
  the same day in a confrontation, and never climbs again — while the
  village warms around him from 19 to 71 and the pantry slides from
  29,850 to 9,885. 9 alive. A village that gets warmer and thinner
  around a bearer it does not trust, because its bearer never gives.
- 26082: Hayden dies day 6; Kayden takes over at 21, climbs to 30,
  then dies in the arena day 40; Austin takes over at 60 and ends at
  64. Pantry 52,815, 9 alive. The richest village in the band.
- 26083: Consuelo dies day 40; Ursula takes over at 81 and ticks up
  to 84 on single donations, steady the whole window. Pantry 30,634,
  10 alive. The quiet competent line — nothing breaks, nothing sings.
- 26084: Scott dies on his own day 21 (organic, before any scripted
  kill); Dwayne takes over at 50 and ends at 44. Pantry 20,343,
  9 alive. The organic mature seed, unremarkable and intact.
- 26085: Peyton dies day 41; Maren takes over at 58, ticks to 59,
  then dies in the arena day 45; June takes over at 76 and climbs to
  91 on steady donations. Pantry 15,863, 9 alive. The busiest deed
  band (19 deeds) and the clearest donation-climb arc.

## People check (sense-read, full transcripts)

- 26081 Illari d+3: warm and human. Three deaths in one week, extra
  portions still set out, turning over Elias's last words, "Nobody
  says Elias's name right yet. We will." A Maypop teaching moment
  ("I never knew that") — note: the ledger says every wild teach is
  a re-teach, so this line's novelty claim sits oddly against the
  ledger; the conversation teach is a show, not a ledger deed.
- 26081 Ramadan d+3: the thin betrayal-case menu play again (r52's
  wart, recurring). Pressing Ramadan about "the murder of Omar"
  through site/witnesses/investigate/moot ends in a hurt, angry
  deflection and stall lines ("Sure. I'll be around.",
  "...Sorry, lost my train of thought."). The NPC wants to end the
  interrogation; the menu gives no graceful exit.
- 26085 Hazel d+3: coherent and lived-in. A distrust conversation
  with eyes flicking toward the fire, a grief ritual (Peyton's burnt
  piece, dawn push-ups "to keep my hands from shaking"), a Sassafras
  show. The NPC wants something, the options engage it, the ending
  resolves warmly.
- 26084 Charlotte d+3: mostly coherent — anger as fuel, Rut King
  lore, a Tucumã lesson, a Sydney-not-Denver identity swerve
  ("I wasn't protecting myself. I was protecting someone else").
  Wart: "lost my train of thought" / "I shouldn't load that on you"
  soft-stall lines recur across reads (3 of 4 transcripts) — a
  filler-loop smell to watch, not a failure.
- Stall endings and the "lost my train of thought" beat persist as
  the run's main dialogue drags; no identity failures anywhere.

## Telemetry deviation check

`node scripts/telemetry-check.js` vs telemetry-baselines/succession.json
(metrics: deaths.bearer, census.fallen, census.alive,
week2.deadBearerMentions, succession.echoV2b,
succession.callMovesSoloOffice): THREE LOUD lines, all EXPLAINED,
baseline NOT rolled (same call as r46–r52):
- "deaths.bearer dropped 60%: baseline 5 -> current 8 (n=5)": current
  8 = 5 leg deaths + 3 chain mantles (all arena, all cause-known in
  the analyzer). The baseline band had no chains; the delta is the
  chain count, not a death-rate change.
- "succession.echoV2b newly appeared: baseline 0 -> current 20 (n=5)":
  baseline predates the echoV2b key (added r46); current total 20 =
  2+4+7+3+4, exactly the analyzer's M3v2b sum.
- "succession.callMovesSoloOffice newly appeared: baseline 0 ->
  current 8 (n=5)": the solo class opened r49; current total 8 =
  0+0+2+0+6, exactly the analyzer's solo counts.
- No LOUD lines for census.fallen, census.alive, or week2 mentions.

## Regression

`node scripts/check.js --only succession --cacheDirectory=/tmp/jest-cache-playtest2`:
11 passed, 0 failed in 34s (same as r47–r52).

## Metric review (for the NEXT run, never re-scored here)

- DEED-CALLER: bar stands; the haul path is now the answer, and the
  next instrument question is finer: within haul returns, what makes
  a return teach or donate (haul contents? known-plant overlap? pack
  state at return?) — and why the daily gated donation never fires
  in the wild at all (is its gate unreachable, or just dominated by
  the haul path?).
- TEACH-NEW: two bands, zero new teaches. The NEXT run should carry
  this to Steve as a policy finding (not an instrument question):
  either new-plant teaching is meant to happen somewhere and no
  exercised path does it, or teaching in the wild is intentionally
  re-teaching and the "I never knew that" show lines are flavor, not
  ledger. Do not re-test the same band shape a third time without a
  new angle (e.g., a policy variant that actually calls teachRound).
- LEO CASE: the -20 direct-assignment writer is unpinned. The next
  instrument should capture the full say log for the convo window
  (not just NPC lines) so a theft/moot/confrontation writer's own
  line can be matched to the move — and should test whether a
  never-donating bearer is a real trap (bearer trust with no
  recovery path) or just a quiet band.
- M3v2b: bar stands; this band passes 5/5, so the r52 bar question
  (scale with village size/age, count from the funeral) stays
  carried but unpressured. If it misses again on a young band, the
  question sharpens.
- MATURE REGIME: staging rate now reported (2/3 this band; 6/9
  organic pre-emptions across r50–r53). The NEXT prereg should keep
  reporting the rate, not assuming the regime.
- C1v2: stays DROPPED. MG2v2: binds, unchanged. Solo: continuity only.
- Over-cause: unexercised this band; keep as a watch, not a gap.
- Died-between: still empty; keep as a rare-branch watch.
- Next for succession (r54): haul-return anatomy (what makes a
  return teach/donate), gated-donation reachability, Leo-case
  writer pin with full say-log capture; TEACH-NEW carried to Steve.

## Infrastructure

- No lock at run start (no prior lane-B lock); lock created
  2026-10-27T16:55:31Z, deleted at closeout; rotation-b read 7,
  written back 4.
- Worktree registration slow but clean (~4 minutes checkout, same
  class as r51–r52; resolved on its own, no action taken). Heartbeat
  loop verified landed after loop start (registry heartbeat_at
  2026-10-27T17:01:03Z, 7s after the manual beat) and re-heartbeated
  every 10 minutes through the run.
- Sibling trees left untouched (14 active at run start, all LOUD dirty
  trees never touched).
- Proof test ALL GREEN first try on the fixed driver — with one
  instrument catch during proofing: the first r53 driver reported
  the sim-harness method wrapper as every deed's site. Fixed by
  skipping sim-harness frames (same skip class as the driver wrapper);
  the corrected sites are real callers (haulTeachingMoment,
  donateSurplus→donateHaul). Proof-seed 24999 tele + transcripts
  deleted after GREEN, including the RED run's r52 proof files.
- Analyzer census bug caught in review: deedContext can repeat a
  calendar day and skip others (runDays advancing 0/2 day-parts), so
  a per-entry census double-counted deeds on repeated days (26082:
  19 entry-count vs 15 distinct deed days). Fixed to distinct-day
  census before the run note; deeds on death days and skipped days
  are reported as outside-census (12 across the band), not lost.
- No sibling landed mid-run (master stayed 648a42d01 from registration
  through the seed batch); no rebase needed at landing.
- Safe-commit index clobber: checked after commit (see landing notes
  in the run record); worktree verified clean before release.

## Reachable / fun / winnable (leg verdict)

- REACHABLE: yes — the succession machinery holds across scripted
  mantles, an organic pre-emption, three arena chain mantles, and a
  frozen-trust bearer, with the deed trigger now identified as a
  policy path (the haul) rather than a gate.
- FUN: yes, with warts — the social texture is the run's strength
  (dawn push-ups, the burnt piece, names not said right yet), and
  the main drags are the thin betrayal-case menu play, the stall
  endings, and the recurring "lost my train of thought" filler beat.
- WINNABLE: yes — all five villages end fed (9,885 to 52,815 pantry
  kcal) with the bearer holding or climbing (office 7–91 at end);
  winnability still rides on the food economy, and competent play
  keeps the village fed through up to two mantles — even, on 26081,
  with a bearer the village barely trusts.
