# Journey endgame r92 — THE WALL BROKE ON ONE SEED, AND THE VILLAGE BLED OUT ANYWAY (lane B, 2026-11-01)

## Run provenance

Leg 4 (endgame). Rotation-b read 4 at run start; this run writes 5
(social life next) at run end (verified by re-read after landing).
Run number basis: last numbered Lane B run is r91 (succession, landed
2026-11-01). This run is r92.

Substrate r77 EXACTLY (capable + deedhunt + vetcommit + greedy deferral
defaults MAXTIER 4 / LASTDAY 145, NOT tuned + armorydrive + fullseat-diag
+ vetguard on waves seeds; forcedrift control clean). 180d,
death-aware. NEW vs r77, both read-only instrumentation: the
VETCONV reconciliation (per-fight ctx.vetFights sampling +
per-increment log, added after a pilot-found gap — see below) and the
LOSS-KIND classifier (scattering / extinction / no-successor from
flags + loss SAY line + day). Probe:
`scripts/probe-endgame-r92-20261101.js`. Analyzer:
`scripts/analyze-endgame-r92-20261101.js`, full output in
`evidence/2026-11-01/journey-endgame-r92-analysis.txt`. The analyzer
exits 1 on the M4b/VETCONV NO-GOs by design — that exit code is the
verdict, not a run failure. No src/js change this run.

Seeds: 89101-89103 waves (Arm A), 89104 forcedrift control,
89105-89107 wavesnw (Arm B, waves + NOWALKIN_W4). Pilot
(89101+89105+89104) met the prereg gate (2 sats, census fights, 1
classified loss), so the run expanded to the full 7; pilot seeds
reproduced EXACTLY in the full sweep (all top-level keys identical
on 89101/89104/89105 — pilot files snapshotted to
`evidence/2026-11-01/r92-pilot/` before the sweep overwrote them).
Determinism leg run TWICE (before the pilot and after the pilot-found
instrument amendment): DET GREEN byte-identical both times on 89101.
Heartbeat loop verified landing (registry heartbeat fresh at every
check); no other loop acted on the tree. No lock file existed at run
start, so no stale-lock recovery was needed; fresh lock written, to
be deleted at closeout. Worktree slug journey2-endgame registered
clean (no deviation needed — no prior journey2-endgame branch).
Base: master fe5da45bd at registration (git pull already up to date).

## Village assessment, in plain words

Four villages won the lesser seat, one survived without a seat, and
two villages were lost. No village won the full seat — but for the
first time in the series, a village MET the full seat's hard bars
(wave 5 unlocked, 2 living veterans) and the reason it still didn't
sit is a different gate entirely (below).

- 89101 (waves): lost d149, no-successor. The scholar spent the run
  away from the haven's fire (49 feast-plan refusals, 39 of them
  "Exile means exile"), fought nothing but two Eulogy arrivals, both
  talked down, never announced, 0 alive at the end. A village that
  lost its bearer while its scholar was elsewhere.
- 89102 (waves): survived, 10 alive, table WITHDREW d90 (pellet hums
  — 10 feasts but 0 armed, surge never; the table priced hunger-less).
  The homebody run: away only 3 of 124 dusks, feasted at home 20
  times, never fought a wave-4, breadth without teeth (w1 14, w2 4,
  w3 2). A quiet village the table passed over.
- 89103 (waves): won lesser, feared/light, announced d90, sat d91
  (1 loss, tier-0 penalty 3). 4 alive. One wave-4 fought (Reunion,
  talked down). Full-seat gap w4:1/3 + w5:0/2. The finale pledges
  terror as a shield, never a sword (see People check).
- 89104 (forcedrift control): won lesser, relay/dark, announced d90,
  sat d91. 11 alive, pantry rich (15,257). Three fights (2 villagers
  died, 1 kill — the control's only veteran, peak 1 d75). Standing
  gated at exactly 199 for 105 days (the 199 mechanism holds).
  Relay tally moves to dark 10, grey 1, light 1.
- 89105 (wavesnw): won lesser, beloved/light, announced d90, sat d92
  (2-day deferral). 8 alive. Zero fights, zero wave-4 faced, w3 5/4.
  A win built on breadth below the wall, not on touching it.
- 89106 (wavesnw): THE BLOCK'S STORY. Table withdrew d90 (pellet
  hums — feasts were held d82/d84 but both feastBuff grants were
  refused by the reactor ceiling, 0 armed, surge never), but the
  village kept living. Ruby
  Callaghan killed the Eater d97; Vasyl Shevchenko killed the
  Influencer d106; the village peaked at 2 living veterans d107 and
  the release snapshot fired d109 (wave 5 unlocked, rd5 ready, 6
  armored, 6 armed, 28 tricks). Then it bled out: Ruby dead of
  dehydration d109, Owen Smith dead in the arena d111, Vasyl dead
  in the wild d118, village lost d140 no-successor. 8 census fights
  (2 kills, 3 fight deaths), standing peaked 297 — the highest in
  the block, above the old 199 cap. The wall broke. There was no
  table left to sit at: the withdrawal at d90 had already closed
  the door, and the bars were met 19 days too late. The withdrawal
  pattern matches 89102 exactly (feasts held, grants refused by the
  reactor ceiling — 20 refusals there, 2 here — surge never): on
  this substrate the table's real gate is the feast-to-surge
  channel, and it failed on both withdrawal seeds before d90.
- 89107 (wavesnw): won lesser, feared/light, announced d90, sat d99
  after a 9-day deferral (tier-1 penalty 7). 7 alive. Zero fights.
  Patience won a lesser seat.

## Leg questions, answered

1. VETCONV — ANSWERED, AND THE R77 "14 ENGAGEMENTS" READING IS VOID.
   vetFights counts fight-TURNS, not engagements: on 89106 the
   counter totals 24 across exactly 3 committed fights running
   8+4+12 = 24 turns (eater vKill d97, strike mFlee d106,
   influencer vKill d106). The r77 89010 "14" was the same unit
   error — its d78 fight alone ran 14 turns. Kill conversion on
   this substrate: 89106 is the ONLY killing seed (2 wave-4+ kills,
   both by the scholar's committed fights); the other 5 waves seeds
   killed 0. Engagements end, on committed fights this block:
   vKill 2, mFlee 1 — and on uncommitted/engine fights: talkDown 3
   (all never-observed), vDie 3, vFlee 1, otherEnd 1. The full
   reconciliation, including why the analyzer still says NO-GO, is
   under Blank below.
2. LOSS-KIND — ANSWERED, 2/2 classified. Both village losses are
   no-successor (player death, no candidates): 89101 d149 and 89106
   d140, both with 0 alive and pantry 0 at the end, both classified
   from the SAY line ("No one is left to pick up the Codex") — the
   scattered/extinct flags are false on this path by construction
   (it sets neither flag), so flag-only classification would have
   missed both. No scattering, no extinction this block. The 89014
   shape (lost with survivors) did not recur: both r92 losses end
   at 0 alive.
3. WALL CONTINUITY — BROKEN, ninth block, on ONE seed. 89106 peaked
   2 living veterans (M3b GO, first in the series), unlocked wave 5
   (M4 GO, first in the series), faced 2 distinct wave-5 types
   (fullseatMax w5:2), and took a release snapshot d109 with rd5
   ready. The other 5 waves seeds peaked 0. The wall is no longer
   "never" — it is "once, then lost": both veterans died within 9
   days of the snapshot and the village died 31 days later.
4. WAVES AWAY, fourth block — SPLIT. Waves AWAY fell again, steeply:
   34.0% (112/329 dusks; r77 59.5%, r75/r76 65%). Wavesnw AWAY ROSE:
   63.7% (172/270; r77 52.8%). The prereg's both-arms condition for
   an away-gate question is NOT met. The waves dip is composition,
   not a uniform gate shift: 89102 was away 3/124 dusks (a
   home-feasting village) and 89101's dusks are refusal-dominated
   (exile), while 89103 was away 77%. Median contribution shortfall
   is still exactly 1500 kcal on every seed — the contribution gate
   has not moved in four blocks.
5. M18 REGRESSION — PASS, fifth block clean. 386 back-with lines
   scanned across 7 seeds, 0 confirmed ghosts, 0 first-name-only
   hits.
6. CONTENTION WATCH — wavesnw DOUBLE-FLAGS, but the cause is
   fighting, not unblocking. Waves 95.3% (FLAG vs r74 only, +1.3 vs
   r77 — plateau). Wavesnw 78.4% (FLAG vs r74 AND r77: 93.1% ->
   100% -> 78.4%). The blocked count on wavesnw actually ROSE
   (29 vs r77's 24) while committed fights rose 0 -> 8: the share
   fell because the wall-breaker fought, not because arrivals
   stopped being blocked. Control 72.7% (+1.3 vs r77 — flat).
7. FULL SEAT LAST MILE — no new shape, and a narrower one: all three
   sat gaps are w4+w5 or w4-only-plus-w5 (89103 w4:1/3 + w5:0/2;
   89105 and 89107 w4:0/3 + w5:0/2). No sat seed touched wave 5.
   The NEW shape in the block is not a sat gap at all: 89106 met
   w4+w5 and still couldn't sit, because it was never announced.
8. NOWALKIN, twelfth block — ARM B WINS. Arm A kills 0, Arm B kills
   2 (both 89106). Series tally now Arm A 5, Arm B 4, three ties.
   Still a tally, not a lever verdict.
9. RELAY-BRANCH TALLY — dark 10, grey 1, light 1 (89104 dark). No
   second grey or light observation.
10. DECLINE vs SILENT NO-SHOW — no decline-and-return, no
    decline-and-never-return. Non-announced seeds: 89101 honest
    death, 89102 withdrawal, 89106 withdrawal-then-death. No silent
    no-show.
11. 199 MECHANISM — holds on the control only. 89104 gated 199 for
    105 days (raw 332, defer5/cap). No waves seed touched 199; 89106
    peaked 297 with no cap (wave-5 unlock lifts the old ceiling in
    the derived formula — the 199 attractor is a pre-wave-5
    phenomenon).

## Pre-registered verdict

Analyzer exit 1 by design. PRIMARY NO-GO on VETCONV-recon alone;
M4b-conjunction is tally-only (expected NO-GO). Every game-side
primary gate passes.
- GO: M1-guard 7/7, M2-census (Arm A with fights 2/3), M2c-engine
  coverage 6/6, M2d-gate-named 8/8, M2b-attribution 3/3 named,
  M8-exit-canon, M3b-peak (1/6, 89106), M4-wave5-or-full (1/6,
  89106), M13-release-snapshot (89106 d109), M14-invite 6/6,
  M5-voicing, M5b-relay-tabulation, M6-guard-named 3/3,
  M10-fullseat-gap 3/3, M11-standing-peak, M12-bar-record,
  M15-feast-census, M16-dusk-census, M17-surge-mode, M18-ghost-scan,
  M19-grant-log, M20-standing-trace, M21-audit-crosscheck 4/4,
  M22-feast-hold, REG-r35-audit, REG-r37-satpenalty,
  LOSSKIND-classified 2/2.
- NO-GO (tally): M4b-conjunction 0/6 — 89106 has uw=5 but was never
  announced, so the conjunction fails on the announce side.
- NO-GO (instrument): VETCONV-recon 4/6 — 89101 and 89103 read
  mismatch-unexplained under the pre-registered guarded rule. The
  rule stands as written; the cause is found and documented under
  Blank, and the fix is named for the next run's instrument, not
  applied retroactively to this run's verdict.

## People check (M7: GO — 2 beats sense-read in full, 1 conversation sample, 0 senseless flags)

Beat 1 — 89106's veteran arc, read in full from the transcript.
Vasyl arrives with a reason ("I saw you on the broadcast. You
looked like people who eat."), is debated (52% for) and vouched for
around the fire. Sophia dies in a contest d96 and the mantle passes
to Ruby, 24, a lifeguard, with a kit that reads like a person
(Beast-calm, Lucky Rock, Trophy Room, Berserker Rage, Bloodhound,
Scream Cheese). Ruby dies of dehydration d109 — "The village stops.
Somebody screams. Somebody else starts digging." — and the mantle
passes to Owen, then to Vasyl (infantry soldier, 34), who dies in
the wild d118 the same way. The deaths land as events with
consequences (the mantle moves, the village thins), not as ledger
rows. The arc's cruelty is legible: the two people who broke the
wall are both dead within days of breaking it.

Beat 2 — 89103's feared/light finale, read in full (announce-sliced
transcript, 114 lines). The audit reads the run back honestly
(lesser seat, waves 1-3 faced 14/5/5, 1 wave-4 fought, 7 contests,
4 crises; the war-path bar names the gaps: 0 of 1 veterans, 0 of 2
veterans). The feared path is argued through terror-as-shield
choices (Oathbound, Shieldbearer, "the shield, not the sword") and
lands on a pledge with a real sentence: "humanity's fear is a
standing shield, never a sword. The table signs." The Oversight
coda indicts the player by name for looking away from the napping
children in glass — sharp, specific, earned by the run's own
ascension beat (Petra Novak ascended through doors the village
built). No filler, no fabricated history.

Conversation sample — the same slice's small talk is human-scale:
Petra's "Stay close, yeah?" / Benoit's "...Yeah."; Jorge, who speaks
only Spanish, mimes walking (twice — the second time the game notes
"Spanish is starting to make sense," so the repeat is progression,
not a loop); Jorge's unanswered question — "My kid asked if the
watchers have favorites. I didn't know what to tell her." — an NPC
wanting an answer nobody gives him, left hanging. The Amina-death
whisper ("that stranger did it") plus the System broadcast is
coherent paranoia, and the Bearer "pleased" line reads as the alien
voice being alien, not as a sense break. One note, not a flag: the
body-looting line ("You take fire-hardened spear... from them. Your
hands know what they did. (+21 trauma)") is doing the game's
violence-is-traumatic work correctly.

Live-build conversation check: not run — this run changes no UI or
dialogue code (instrument-only, zero src/js diff), so there is no
player-facing flow to verify at 390x844; the r77 precedent (same
leg, same instrument-only pattern) likewise verified dialogue via
transcripts. If a future run touches dialogue UI, the live check
applies then.

## Blank: VETCONV reconciliation (documented, instrument fix named for next run)

The analyzer's VETCONV NO-GO is explained by TWO instrument
artifacts, both proven from this run's own data — not by a game
bug, and not by re-scoring:

1. FIRST-INCREMENT BASELINE GAP. The increment log skips the run's
   first vetFights increment (no prior post value to diff against),
   so every seed with any increments is short exactly 1 logged
   increment: 89106 logged 23 of 24, 89101 logged 1 of 2, 89103
   logged 0 of 1. The same gap nulls vetAtOpen on the run's first
   incrementing fight (89106's d97 eater fight: vetAtOpen null,
   vetClose 8 — its 8 increments are proven by the close value, but
   its delta reads null, so the analyzer's sumDelta is short by 8).
2. END-AND-CLEAR TURNS. A fight's resolving turn increments (live
   w4+ monster, commitLive true) and then clears tbfight before the
   census observes it. The census then records that fight as
   engine-only committed=false (89101's two Eulogy fights, 89103's
   Reunion fight — all talkDown, never observed live) or closes a
   committed fight via ref-change (all three of 89106's committed
   fights). The increment log marks these turns censusState
   'unseen' with empty monster lists (tbfight already null) and
   committed=true — 1 on 89101, 3 on 89106. They are NOT missing
   fights; they are turns whose fight object vanished before the
   sample.

Corrected reading (post-hoc analysis, NOT a re-score — the
pre-registered verdict above stands): vetFights counts
fight-turns, period. 89106 reconciles exactly: 24 = 8 (eater) + 4
(strike) + 12 (influencer) across 3 committed fights. 89101
reconciles as 2 = 1 resolving turn of the d111 Eulogy fight
(first-increment gap) + 1 resolving turn of the d136 Eulogy fight
(logged unseen). 89103 reconciles as 1 = the resolving turn of its
Reunion fight (first-increment gap). The r77 "14 engagements" label
is VOID and must not be cited: 14 was turns of one fight.

Next run's instrument fix (named here, applied to the NEXT run's
probe, never retro-fitted to this run): initialize the increment
baseline at run start (prevVet = 0, so the first increment logs),
and capture the tbfight's monster list PRE-call for censusState
(so end-and-clear turns attribute to their fight instead of
reading 'unseen'). No src/js change is proposed or needed.

## Metric review (for the NEXT run, not this one)

- VETCONV's guarded rule stays, with the two artifact fixes above:
  once the baseline gap and pre-call capture land, a
  mismatch-unexplained seed will mean a genuinely unattributed
  increment, not a sampling artifact. Do not retire the rule.
- M22 away reporting should keep the per-seed table beside the arm
  share: the waves 34% arm share hides a 2% homebody seed and a 77%
  road seed. Arm shares alone mislead on this series.
- M9b contention: report blocked and committed counts beside the
  share (r92's wavesnw "drop" is a fighting increase, 0 -> 8, with
  blocked also up 24 -> 29). A share-only reading inverts the story.
- M4b conjunction: 89106 splits the conjunction a new way (bars met,
  never announced). Keep it as the conjunction question — the next
  block's watch item is whether ANY seed meets bars AND announcement
  together, not just whether bars are met.
- M18 guard is now five blocks clean (r74, r75, r76, r77, r92 — r92
  scanned 386 lines). Keep the scan; do not retire it yet.
- NOWALKIN tally Arm A 5, Arm B 4, three ties (twelve blocks).
  Still no lever fate; keep it a tally.
- Telemetry baseline: still the r37-era 2-metric snapshot. This
  run's check LOUD lines (won 0->4, announceDay newly appeared) are
  the same stale-baseline artifact as r48–r77: EXPLAINED, baseline
  NOT rolled. The re-seed proposal stands.
- Next run's question, named: with the bars proven reachable on one
  seed, does ANY seed meet bars AND announcement AND survive to
  sit — i.e., does the full seat's binding constraint move from
  the wave wall to the feast/announcement track (89106 withdrew
  with feasts held but none armed — the surge channel never fired)
  or to post-peak survival (both veterans dead within 9 days)?

## Regression check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree: 284 passed, 6 failed in 466s (log:
evidence/2026-11-01/journey-endgame-r92-checkquick.log).
The 6 failures are exactly the standing pre-existing families —
measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes — matching r77's and r91's baselines.
No new failure. The run is instrument-only (zero modified tracked
files — verified via `git status`: only new probe/analyzer scripts +
new evidence files), so no failure is attributable to r92. The run's
own proofs (DET GREEN twice, pilot reproduction exact, analyzer,
telemetry check with explained LOUD lines) are all green.

## Reachable / fun / winnable, for leg 4

- REACHABLE: the lesser seat is reachable (4/7 sat, all four
  announced d90 and sat within 9 days). The full seat is still
  unreached (0/7 this block, 0 in the series on this substrate) —
  but its bars are now proven reachable, so "reachable" for the full
  seat moved from theoretical to demonstrated-in-part: one village
  did the hard part and still couldn't sit, because the table had
  withdrawn and the veterans died. A real player can now be told,
  truthfully, that the bars are meetable and the seat is not yet
  won — which is a different game than "the bars are impossible."
- FUN: the 89106 arc is the strongest endgame story in the series
  (withdrawal, wall-break, bleed-out), and the sat finales read
  with voice (89103's pledge). The dull shape is 89102: a village
  that feasts 10 times, never fights, and is passed over — coherent
  (the table prices the food thesis, not feasts alone) but quiet.
- WINNABLE: lesser yes, 4/7, across feared/beloved/relay and light/
  dark. Full not yet — the next question is whether a village can
  hold bars, announcement, and survival together in one run.
