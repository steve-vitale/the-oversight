# journey-landing r153 — RUN NOTE (Lane A, leg 0 LANDING)

**Run id:** playtest-loop-a-20261121T2150Z (scheduled Sat 2026-11-21 15:45 CST;
started 15:50 CST — scheduler fired late; the run's own clock is 21:50Z).
**Base:** local master `de0cb73c8` (r152's landing commit). A lever loop landed
mid-run (sim-killlootbundle-a + sim-tier4access-a); the branch was rebased
onto the new master `d1b71a8f6` at closeout before the gate and the commit.
**Rotation:** read 0 → next leg establishment (file already read 1 at 22:06,
mtime 22:06, verified at closeout).
**Lock:** `playtest-loop.lock`, run_id `playtest-loop-a-20261121T2150Z`,
created 2026-11-21T21:51:00Z. Deleted at closeout in the same call as its
read, run_id matched.

## Panel

Fresh band **1342–1351** (verified fresh: zero hits in `evidence/*.md` for
`1342-1351`; contaminated-band lists name bands up to 1332–1341). DAYS=28.
Pilot (1342–1345) exit 0 in 68s; full panel exit 0 in 135s. Corpus
`hidden_files/evidence/2026-11-21/landing-r153-after/` — 157 files, 0
zero-byte. All 10 seeds System contact day 8. Wants: curious 88, ask_favor
30, warn_you 1, seek_taken 2, repay 7, none 8, seek_comfort 1. Total
sittings 137. 15 analyzers, exit 0 all; log 161,357 bytes
(`hidden_files/journey-landing-r153-analyzers.log`).

The panel ran from the main tree READ-ONLY under Amendment B (see the
prereg): registration was blocked by the flap and by lane B's registry
activity, so the committed r152 driver ran byte-identical under env
overrides (SEEDS/DAYS/OUTDIR). Main tree verified clean before and after
the panel. All commits go through the worktree + safe-commit.sh.

## Infrastructure (stale-lock recovery, flap window 5, restarts)

- The lock at run start held r152 (`playtest-loop-a-20261121T1950Z`,
  created 19:50:16Z). r152 HAD landed its work (commit `de0cb73c8`, both
  fixes verified present) but the machine restarted ~20:22Z and killed
  r152 mid-closeout: no worktree release, no rotation write, no lock
  delete. Its tree had heartbeat 20:21:11Z (89 min stale), no live
  process, branch 0 ahead of master, clean tree — nothing to adopt.
  Lock replaced in the same call as its read (run_id matched).
- Write flap window 5, flickering, ongoing, never solved: fresh-file
  writes fail intermittently since ~21:52Z. Small writes land as 0-byte
  husks (exit 0, size 0 — exit code alone is NOT a probe); writes ≥~12KB
  raise EPERM. Content-verified probes flickered FAIL/CLEAR through
  22:01–22:02; a sustained-clear watcher reported 3-min clear
  22:14:11–22:17:03. The flap watchdog (pid 8234, started 20:39Z) is alive
  but its `.out` is 0 bytes.
- Machine restarted again ~22:24Z (uptime 1 min at 22:25:02). Registration
  took four attempts (registry-lock queue behind lane B, a flap-corrupted
  checkout, a service restart, then attach to the registered slug).
- Heartbeat gap 22:46→23:22 (~36 min): the hbloop lived and kept trying,
  but the registry lock was held >120s by another process twice
  (`journey-landing-hbloop-r153.out`: "registry lock held > 120s —
  heartbeat skipped, retry later"), so beats didn't land. Beats resumed
  23:22; manual beat 23:25:15Z fresh at closeout. Nothing was deleted;
  the run was never actually dead. Lesson: registry-lock contention, not
  just the flap, can stale a heartbeat — the 15-minute rule needs the
  lock-holder named before anyone treats a stale heartbeat as death.

## Q1 — regression watch on r152's fixes (fresh band)

**r152 FIX 1 (namebeast opens the just-told beast): VERIFIED on live data.**
65 tellbeast/namebeast pairs extracted across the panel; every same-day
pair sampled shows the told beast as the debated beast (1342 d9 red moon
rising, 1342 d10 water-displacement beast, 1343 d6 soft green glow, 1343
d10 dog-shaped silence, 1346 d13 absence of sound, 1347 d6 dinner-plate
moth, 1350 d4/d6, 1351 d9…). Zero told-a-day-late cases. The naming
debates read as real arguments ("The Loud Thing" vs "The Loud Beast" vs
"Ugly-Eyes"; "The Bailiff" vs "Judge Hoot").

**r152 FIX 2 (settled re-ask names the favor): UNTESTED on live data.**
No sitting on this panel pressed the handledPool re-ask pick, so the
naming variants never fired (grep for the new variants finds only a
different line, "It's done now. I keep turning it over anyway."). What
DID fire: the r247 dlg:help settled branch — 1346 d9 Quinn: "Never mind
the food I needed — we got it handled. Thanks anyway." — the favor named
in plain words. The follow-up [dlg:more] presses after a settled favor
speak honest deflections ("No, really, it's fine. Forget I even asked.",
"All sorted. Some things just work out.") — not the handledPool, and not
a defect: the favor was already named, and the person is waving off
further questions about a settled matter. FIX 2 stays untested; carry
the watch.

**Q1b warn_you deflect: still untested (seventh carry).** One warn_you
sitting fired (1345 d16 Ella — see below); it was a heed, not a deflect.

## Adjudication (bars carried verbatim from r152)

**PASSES:** M1 10/10 alive d28. M2 10/10 System contact by d9 (all d8).
M3 0 UNKNOWN triggers (byTrigger: mixed-stack 2, pending-face 2;
mixed-stack is in-family per r144 precedent). Practice movedCells
d1→d28 = 80 (bar ≥50), seedsWithMove 10/10, skill0→pos 64. Pocket 0
(BINDS), stuckTurns 3. D1 garbled 0. HEED 0, HEED-V 0 (BINDS).
WARNED-BUT-UNRESOLVED 0. M-PR1 3/28 = 10.7% ≤15% (neverOffered 3;
established 28 after excluding 2 unestablished: 1343 d12, 1346 d13).
Bridges 0 repeats everywhere (personal 23, small 7, goal 3, village 5,
plans 4, past 1, gossip 2). Nodloop LOOP=0 (137 sittings). "the the" 0.
Dry lines 0, SILENT TURN 0. R66 NOT-HUNGRY (starvationDeaths 0,
slideSeeds 0, bandSeeds 6). R68 PARTY-GO (offered 12, picks 12, spoken
12, dry 0, accepted 7). R69 ARMOR 10/10 seedOK (teleLineDisagree=1 —
same case as ARMOR-SILENT below, explained). R67 LABELING-GO 15/15.
R84 kcal ALL-ARRIVED 6/6, water UNTESTED. R85 kcal RESCUE-GO 6/6,
water UNTESTED. R88 EAT-GO 6/6, DOORSTEP-GO. Contests ledger GO (deaths
carry context; orphanEnds 0). Grief 0/12 miss. Flesh channel opens
(arrival 5/10, test 10/10). R70 OUTING-GO, R71 COMPLETION-GO, R72
CHAIN-CLASSIFIED. Hunt H0-ESTABLISHED (huntReps 16, huntMax 3,
huntVillagers>0=10; no villager reaches 8 reps). R106 ARMS-WHY:
maxWave ≤3, no wave-4 kills, no table plans.

**FAIL 1 — Zero-DMG refused-turns: 3 > 0 (BINDS). NO-GO on the bar, not
re-scored.** Seed 1343 d8 vs 4 Hummice: the scholar tried to move to
(1,6) 3×, failed, then moved on the 4th attempt; fight won, scholar HP
100. The first refusal was narrated ("You don't stroll through the
Hummice 2."); attempts 2–3 were silent because the refusal line was
deduped, and the 4th attempt moved after the cell cleared. movedLie=0.
This is NOT the Spool shape (the scholar did move; the first refusal
was narrated; dedup works as designed) — the bar is over-strict for an
occupied-cell retry shape. No game fix; nothing is broken. The
competent policy re-picking the same blocked cell 3× is a driver/policy
observation, noted for the policy, not a defect. All-fights
refused-turns = 8 (watch): 1347 d28 refusedTurns=1 vs The Callback
(lost); 1350 d21 refusedTurns=4 vs 14 ducks in a row (won). Zero-DMG
fights: 4 total (1343 d8, 1347 d20, 1348 d17, 1350 d11), all B-shape
except 1348 d17 A-shape, all won/routed.

**FAIL 2 — Scholar deaths: 6 > 2 per panel (BINDS). NO-GO on the bar,
not re-scored.** Deaths on 3 seeds, 2 each. 1347: Stella d27 (contest —
The Price) → mantle Ahmed d27 latency 0; Ahmed d28 (the wild),
unresolved at horizon (honestly unresolved, not a defect). 1348:
Nicole d17 (a stranger) → mantle Daniyar d17 latency 0; Daniyar d21
(sickness) → mantle Joaquín d22 latency 1. 1351: Pablo d25
(dehydration) → mantle Pamela d26 latency 1; Pamela d28 (the arena —
Gauntlet) → mantle Victor d28 latency 0. Succession latencies
[0,0,1,1,0], noSuccessorNoGo=0, unresolved=1. All six deaths are
individually fair shapes; no single cause dominates. No game fix.

## ARMOR-SILENT investigation — RESOLVED (instrument artifact, not a defect)

The analyzer reported R88 ARMOR-SILENT CONTRADICTED: teleOk=3,
lineMissing=1, silentWild=1, silentHaven=1 — a line-missing craft on a
scholar-haven day (1348: craft d19 wild + d25 haven, vid=gen_b1qtvqf,
bark_armor). The analyzer lists ALL ok crafts in a seed where any line
is missing, so it could not say WHICH craft lacked its line. A
deterministic FULLSTREAM re-harvest of seed 1348 (same seed + same code
+ same base = same conversations; census reproduced byte-identical on
the armor fields) pins it: the fullstream carries exactly one craft
line — "Ananya spent the afternoon at the workbench and sewed a Bark
armor that holds together. Ananya wears it now." — sitting just before
the DAY 26 DAWN marker, i.e. the **d25 haven-day** craft. The silent
craft is the **d19 wild-day** one. Player-away gating is CONFIRMED, not
contradicted. R69 teleLineDisagree=1 is the same case (telemetry 3 ok
crafts vs 2 narrated lines). No game defect; the analyzer's per-seed
attribution over-claims — see metric review. The re-harvest corpus is
`hidden_files/evidence/2026-11-21/landing-r153-after-1348-reharvest/`.

## Transcripts read in full (sense-testing)

- **1345 d16 Ella warn_you — EXCELLENT heed.** The danger is named
  ("the treeline at dusk. Don't."), the resolution is heeded, the talk
  deepens ("You hear me, right? Not the words — the part underneath.
  I'm scared…"), an invitation is offered and declined cleanly, closing
  "Do try to stay alive. The paperwork otherwise is murder."
  Warn-heed watch PASS (1/1).
- **1342 d9 Onni curious — react fix HOLDS.** React picked twice, both
  dry ("So." / "Well."); menu at turn 3 NO LONGER offers [dlg:react]
  (r246 wind-down fix). Same sitting: tellbeast "a red moon rising
  between the trees, breathing" → namebeast opens debate on THAT beast.
- **1346 d9 Quinn ask_favor (settled) — see FIX 2 above.** The favor is
  named in the help topic; the follow-ups are honest deflections.
- **1346 d28 June curious — strong sitting.** Opens with a callback
  ("You offered to show me while we work. I'd still like to learn, when
  there's time."), link raise accepted with pool[1] ("Good — the word
  on them is kind. Go and ask."), two react picks that move the talk
  forward, a real question ("Do you believe in anything? Now, I mean.
  After everything."), wind-down clean, namebeast matches the told
  beast. Resolution engaged.
- **1349 d7 Joseph ask_favor (settled) — short sitting.** The opener
  itself is the settled line ("Never mind the food I needed — we got it
  handled. Thanks anyway."), the player pages the menu and leaves.
  Nothing wrong; the favor is named and the sitting ends cleanly.

## Watches and counts

- Hungry-at-horizon **5/10** (r152: 6/10, r151: 4/10): hungry 1342
  (582/person), 1345 (1415), 1346 (1129), 1348 (1411), 1350 (757); fed
  1343 (2701), 1344 (5071), 1347 (5718), 1349 (10460), 1351 (2470).
  The horizon-pantry pattern recurs (collapse — lever work candidate).
- Win-plans: d14 **0/10**, d28 **2/10** (r152: 1/10, 4/10; r151: 2/10,
  5/10) — third consecutive drop. Holders d14=0, d28=7 (1347: Liam
  hunt@d25, Cheryl hunt@d28; 1349: Rafael hunt@d16, Sal hunt@d17, Diana
  hunt@d0, Bibigul hunt@d0, Leo hunt@d19). No wave-4+ holder plans, no
  trios/quads. planReseeds 0, planExpiries 0.
- Presshop: pressFailTotal **0** (r152: 6) — watch clears;
  togetherStopped 32; farUnreached 1, nearUnreached 1.
- statedAfterPick **7** (threshold ≥6): 1342 d8, 1345 d13, 1348 d6,
  1350 d15, 1350 d9, 1351 d15, 1351 d18 — ALL road refusals ("away from
  Haven…"), intended Q1 shape, no action.
- Contests: fired 23, ended 18, openAtHorizon 5. Open: fetch (1344,
  fired d29, participants=[]), impress (1347, fired d28, []), lies
  (1348, fired d29, []), price (1347, fired d25, Stella died d27 in it,
  end undefined), gauntlet (1351, fired d26, Pamela died d28 in it, end
  undefined). The 2 pre-horizon ones share a shape: a contest ends by
  participant death but the ledger never stamps endDay — investigation
  item for the next run (does the ledger stamp endDay on
  death-resolved contests?), not a defect, no fix this run.
- Link-accept: 26 accepts; pool[0] "Good. What I've heard of them, I
  believe. Go and ask." ×16, pool[1] "Good — the word on them is kind.
  Go and ask." ×10. Both variants live; no parrot, no repeat streak.
- Link openers: 27 total, 2 shapes — "I've heard good things about
  X…" ×16 (Emberhold 5, Thornfield 6, Stonebridge 4, Ashford 1), "Word
  is X holds together…" ×11 (Emberhold 5, Stonebridge 3, Thornfield 3);
  shape 3 ("They speak well of…") 0 this run. No streak issue.
- COUNTER LEARNED: 9 total, 9 distinct labels — "The Bailiff" (proper
  name), "toad like a war drum", "thing with headlights for eyes",
  "something", "red moon rising between the trees", "raccoon with too
  many fingers", "absence of sound", "a soft green glow under the
  water", "a heron that isn't quite there when you look at it". Guard
  HOLDS (noun-phrase descriptor heads, not instruction clauses).
- Link-raise accept pool (party invites, voiced lines): "…Fine." ×3,
  "Alright. But I'm not carrying your stuff." ×2, "Okay. Yeah. I trust
  you." ×2, "Someone should watch your back." ×1, "Yes. Absolutely." ×1.
- Outingchain: favors 39, kept 7, broken 8, open 24;
  CHAIN-COMPLETES-FAR established (farHaul 7, nearHaul 0).
- Confide "This stays between us": 0 occurrences (untested). Ammo "has
  no X": 0 (untested).

## Village assessment (plain words)

Ten villages, ten first months. All ten are alive at day 28 and all ten
met the System by day 8 — the landing itself works. People are learning
fast (80 practice moves across the panel, 64 villagers went from no
skill to some skill) and the social life is the strongest part: warnings
that land, favors that get settled and talked about afterward, naming
arguments that now track the conversation that started them. The drag
is the pantry again: half the villages end the month hungry, and the
hungriest village has 582 kcal per person — a week from empty. Two
villages in ten have anyone aiming at a win by day 28, and none aims
past the third wave of monsters. The scholar dies a lot — six deaths
across three villages — but each death hands the story to someone else
cleanly, and the village carries on. Nothing here is broken; the month
is a hard, talkative, hungry start, and the road to a win is still
un-walked.

## Verdicts

- **Reachable:** yes. Everything judged is reachable inside 28 days on
  a fresh band with no special setup — System contact, contests, naming
  debates, settled favors, link raises, hunts, the flesh channel.
- **Fun:** mostly. The social texture is the strongest part. The drag
  is the pantry: five hungry villages out of ten makes the month feel
  like treading water rather than building.
- **Winnable:** not yet from here. The landing leg does its job
  (villages live, people learn, parties form), but the road to a win is
  still un-walked inside 28 days — win-plans exist in 2/10 villages and
  none aims past wave 3. That is the known winnability wall, unchanged
  by this run; there are no game changes in this run, only evidence.

## Metric review (for the NEXT run)

1. **Zero-DMG refused-turns bar is over-strict.** The 1343 d8 case is an
   occupied-cell retry with a narrated first refusal and a successful
   move on the 4th attempt — not the Spool shape the bar was written
   for. Propose: count only refusals where the scholar never moves in
   the fight, or exclude deduped repeats of a narrated refusal. No
   change this run; the bar binds and the run is NO-GO on it.
2. **ARMOR-SILENT analyzer attribution over-claims.** It lists all ok
   crafts in a seed when any line is missing, so a wild-day silent craft
   plus a haven-day narrated craft reads as CONTRADICTED. Propose:
   attribute the missing line to a specific craft/day (the driver could
   record the line's day, or the analyzer could join the narration
   stream). The instrument, not the game, needs the fix.
3. **Scholar-deaths bar counts deaths, not fairness.** 6 deaths, all
   fair shapes with working succession. The bar binds and the run is
   NO-GO on it; the question for the next run is whether the bar should
   stay a raw count or weight fairness — a Steve/design call, not a
   mid-run re-score.
4. **M-PR1 direction:** 10.7%, under the 15% bar but climbing (r151
   4.5%, r152 10%). If it passes the bar, the question is whether
   "stated" resolutions are counted too loosely.
5. **Contest ledger endDay on death-resolved contests:** 2 pre-horizon
   open contests ended by participant death with no endDay stamp.
   Investigation item: does the ledger stamp endDay when a contest
   resolves by death?

## Decision: NO game fix this run

Both binding FAILs are bar/shape adjudications, not defects (zero-DMG =
occupied-cell retry + dedup; scholar deaths = fair deaths with working
succession). The ARMOR-SILENT contradiction was an instrument artifact.
FIX 1 is verified, FIX 2 is untested (not failed). Nothing in the panel
shows a broken thing to fix, so no fix is invented to fill the run. The
run's deliverable is evidence + prereg + driver clone + analyzers.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r153-gate`
in the worktree (rebased onto `d1b71a8f6`):

- First run: **337 passed, 7 failed in 1151s**. The 2 extra failures
  vs r152 (test-occupation-panels.js 120s timeout + 1 more cut off by
  the tail) did not reproduce on re-run — load-flaky under concurrent
  lane B jest gates.
- Re-run (output saved to
  `hidden_files/journey-landing-r153-gate.log`): **339 passed, 5 failed
  in 1066s** — exactly r152's 5 standing families, none caused by this
  run's changes (this run touches no src/, data, or index.html — only
  evidence + a driver clone):
  1. `test-phone-frame-proof.js` — stale receipt ("Phone receipt source
     is stale or missing: index.html"). Standing phone-frame
     stale-receipt family.
  2. `test-one-person-army-deed-attainment.js` — TIMEOUT after 120s.
     Standing 120s-timeout family.
  3. `test-living-garden-deed-attainment.js` — 120s timeout. Standing
     120s-timeout family.
  4. `test-measurement-proof-update.js` — "Proof source inputs are not
     current". Staleness pair, standing since r151.
  5. `test-measurement-workflow.js` — "retained neutrality proof covers
     the current Game/controller/harness inputs". Staleness pair,
     standing since r151.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../hidden_files/telemetry-baselines/landing-split.json --current
'.../landing-r153-after/journey-landing-r62-census-*.json' --metrics
systemDay,villagerDeaths,monsterKills,folTelemetry.fires,starvAutopsies`
→ **quiet** (10 files, 5 metrics, no large deviations). No baseline roll.

## Commit

- `evidence/2026-11-21/journey-landing-r153.md` (this note)
- `evidence/2026-11-21/journey-landing-r153-prereg.md` (copy,
  byte-identical to the goal hidden_files original)
- `evidence/2026-11-21/journey-landing-r153-analyzers.sh` (copy,
  byte-identical)
- `scripts/journey-landing-r153-20261121.js` (r152 driver verbatim
  except OUTDIR `landing-r153-after`, header, default seeds 1342–1351;
  diff shows only those lines; `node --check` clean)
- Panel corpus + analyzers log + gate log stay in goal hidden_files
  (not committed to the repo, per the r152 pattern):
  `hidden_files/evidence/2026-11-21/landing-r153-after/` (157 files),
  `hidden_files/journey-landing-r153-analyzers.log` (161,357 bytes),
  `hidden_files/journey-landing-r153-gate.log`,
  `hidden_files/evidence/2026-11-21/landing-r153-after-1348-reharvest/`
  (deterministic FULLSTREAM re-harvest of seed 1348 for the
  ARMOR-SILENT pin).

Merged ff-only to master; merged locally, pending ship (ship loop owns
bump/push/live verification). Worktree released, rotation verified at 1,
lock deleted, hbloop killed.

## Open items for the next run

- Q1b deflect: still untested (seventh carry).
- r152 FIX 2 (settled re-ask names the favor): still untested on live
  data — needs a sitting that presses the handledPool re-ask pick.
- Hungry-at-horizon 5/10, win-plans d28 2/10 (third consecutive drop),
  M-PR1 climbing (10.7%).
- Contest ledger endDay on death-resolved contests (investigation item).
- Metric review items 1–2 above (zero-DMG bar revision; ARMOR-SILENT
  analyzer attribution).
- Flap window 5 ongoing, never solved; machine restarted twice on
  2026-11-21 (~20:22Z, ~22:24Z). Registry-lock contention can stale a
  heartbeat even while the hbloop lives — name the lock-holder before
  treating a stale heartbeat as death.
