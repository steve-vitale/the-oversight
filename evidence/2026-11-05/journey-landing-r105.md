# journey-landing r105 — run note (lane A, leg 0 LANDING)

**Run id:** laneA-20261105T1245Z (scheduled 05:45 CST 2026-11-05). Base
master@1b6fa6c33 at branch creation; worktree `journey-landing`. Rotation read 0
→ leg 0 LANDING; 0→1 written at run start and verified by read-back.
Prereg: evidence/2026-11-05/journey-landing-r105-prereg.md (committed
66f8825b4 BEFORE any seed ran; the safe-commit index clobber struck on that
commit, same class as r90/r94/r95/r97/r98/r99/r104: commit correct, index lied
with the file staged-as-deleted + untracked; repaired via HEAD-blob cacheinfo,
verified `git status` clean + `git diff HEAD` empty).
Panel outputs: goal hidden_files evidence/2026-11-05/landing-r105/ (panel
censuses/system/transcripts + analysis + pilot/panel logs + checkquick log) and
landing-r105-replay883/ (the R105 fix replay corpus).
Driver: scripts/journey-landing-r105-20261105.js (r104 driver verbatim +
R105-DOORSTEP-DRINK-ENTRY fix, see Blank below; seeds 877–886, DAYS=28;
diff-verified against the r104 driver at run start: only header, seeds,
OUTDIR, and the R105 blocks differ).
Analyzer: scripts/analyze-landing-r104-20261105.js (unchanged, DIR passed as
argv → landing-r105). Fights: scripts/analyze-fights89-20261102.js
(unchanged, dir-as-argv). Shape test: scripts/test-landing-r94-shape.js.
Proof test: scripts/test-landing-r105-doorstep-drink-entry.js (new).
Next driver prepared here: scripts/journey-landing-r106-20261105.js (r105
verbatim + seeds 887–896, OUTDIR landing-r106; diff-verified, node --check
clean).

## Infrastructure notes (loud, first)
- **Registration was SLOW, not flap-blocked.** `worktree-register.sh`
  took ~2.5 min inside `git worktree add` (loaded box; siblings' trees
  active). Plain writes worked throughout; no retry needed. No main-tree
  file was edited, committed, or written by this run.
- **Heartbeat held:** registration beat 12:46:08Z, heartbeat loop (10-min
  interval, logged to goal hidden_files
  journey-landing-r105-heartbeat.log) ran for the whole run. Killed at
  closeout (see Closeout note).
- **EPERM flap:** NOT present this run (writes + git + registry all worked).
- **Reaper (pre-flight):** 11/16 active; LOUD lines are other owners'
  dirty trees (journey2-succession, sim-sortie-a, sim-fleerepair-a, etc.)
  — never touched. sim-awayrationfix-b is locked (initializing) and was
  not force-removed.

## Panel verdicts (as run)

- **Q1 SILENT WIN-PLAN ARMS: ARMS-SILENT (the finding).** M-S1: ZERO
  silent-arm events across all 10 seeds at d28 — gearHolds 0, bondTends 0,
  avoidances 0, seekContacts 0, standingContacts 0, veteranGuardHolds 0,
  musterStanddowns 0, trickHolds 0. The win-plan system is party/hunt-only
  in the landing window, now on two consecutive panels (r104 + r105, 20
  seeds). The live arms run hard: d28 planSeeds 16, partyInvites 15,
  partyDepartures 15, partyWaits 50, partyFights 74, holders 18. d14:
  planSeeds>0 on only 2/10 seeds (6 planSeeds, 7 holders — 0.6/seed, below
  r104's 1.3/seed; the d14 uptake number is noisy across fresh bands).
  M-S2: 4 seeds never seed by d28 (878, 879, 884, 886) — no readable
  difference from the seeders in this run's data (all System day 8, pops
  10–12, monster kills 18–22); the difference, if any, is in the plan-
  seeding conditions, not village health. Instrument caveat (r104, carried):
  holders can exceed planSeeds (880: 4 holders / 3 seeds; Marcus:hunt@d0 —
  the fresh-plan sinceDay-0 default), because `winPlanOf` seeds plans on
  read; the instrument reads only the raw map.
- **Q2 R104-GOAROUND AT PANEL SCALE: GOAROUND-HOLDS.** M7-r105 kcal
  (revised: arrived/skips): 3 skips (878 d9, 884 d14, 885 d14), 3 arrivals,
  3/3 = 100% ≥ the 80% bar. All three arrived via first-travelTo — the
  bridge/detour rungs did NOT fire this panel (R86 stepCounts
  first-travelTo:3, walkHomeStops=0, clearOk=0, clearRefused=0), so the
  rungs remain proved only on the r104 replay, not at panel scale. R88
  EAT-ON-ARRIVAL: arrivals 3, ate 3/3. Water: 0 wild water skips, min hyd
  72 — UNTESTED (17th run).
- **Q3 DOORSTEP-OUTINGLIVE REGRESSION: GO.** 279 checks, 2 triggered
  (both 883 water branch — see Blank below), 0 refusals, 0 class-E scholar
  starvation deaths, complete eatRecs on triggered steps. The 2 triggered
  steps drank nothing — that IS the finding, fixed below.
- **Q4 WATER CLAUSE: UNTESTED again** (17th run). 5 wild outing
  iterations, min hydration 72, 0 under 25, 0 wild water skips.
- **M1 ALIVE-D14: 10/10 PASS** (overAt None on all ten seeds; day-28 pops
  9–12; no village lost).
- **M2 SYSTEM CONTACT: 10/10 PASS** (first contact day 8 on all ten seeds).
- **M3 FIGHT-LOG: PASS** — panel 24 hunt fights, 24/24 complete, 1 fatal,
  0 unknown/mixed trigger. Three ZERO-DMG shape notes (not verdict items):
  882 d21 others-killed, 883 d27 others-killed, 886 d14 no-strikes routed
  (0 strikes, 0 others damage — a flee with no combat at all).
- **M5 PEOPLE: PASS.** Wind-down more 8 picks, 0 empty; WD probe GATE-A
  GO, GATE-B GO; betrayal held-offers 0; party invites 9 offered / 9
  spoken / 0 dry / 4 accepted; case labeling 7/7. Two full transcripts
  read (880 day 9 Yara, 883 day 8 Ivy) — both contentful, no fabricated
  shared history (see People check).

## Village assessment (plain words)
Ten villages, all alive at day 28 (pop 9–12, down from 12). The first
fortnight is harsh but survivable: 883 lost 3 people by day 28 (pop 9),
the rest 0–2. Deaths are monsters, sickness, wounds and ambushes — plus
one scholar killed by a stranger (883 d28) and one scholar lost to a
wave-3 monster in a feast draw (880 d27). No starvation deaths on the
panel. Pantries mostly hold (R66 finals 1450–2350 kcal, self-sufficiency
0.82–1.02) except 883, which slides (final 768, 6/22 snaps below 1000).
The System shows up on day 8 everywhere and the villages answer it.
Monster meat moves: the flesh channel opens on 9/10 seeds (878
NO-ARRIVAL; 879 STUCK with 3 at horizon; the rest TAIL-MOVES with
1–7 tests each). Outings work sometimes: 68 attempts, 5 kept, 12 broken —
and on 3 seeds (881, 885, 886) favors exist but the scholar NEVER waits at
dawn, the partner sitting inside the hall while the scholar is told to go
through the door ("Your partner is inside the Haven hall" 11–35 times per
seed). Promised favors mostly break on 1-day windows: 16 NARROW, 4 KEPT,
11 BROKEN, 1 OPEN (R73 NARROW-PATTERN, design input, carried). Contests
fired 21 times, 18 ended, 3 open at horizon, 0 orphan ends.

## People check (SENSE-TESTING LAW — two full transcripts read)
- **880 day 9, Yara (ask_favor, stage 1→3, promised):** Yara wants a
  forage partner; the player commits; she answers with a concrete
  instruction ("The blackberry patch past the treeline, before the dew
  dries. Bring your pack and your knife") and the favor is promised.
  The party invite is refused honestly by the System ("You don't really
  KNOW Yara yet... Trust 16/20"). Map comparison grows the map by 2
  places. The beast-naming thread runs ("Big Loud", "The Loud Bastard",
  "Old Ugly"). Wind-down resolves: "This was good." Real.
- **883 day 8, Ivy (curious, stage 1→3, deflected):** Ivy lost track of
  the days; the player deflects at the start ("change the subject") and
  she loses her train of thought; the talk wanders through the village,
  her journalist instincts ("Old wiring, new world"), her plan to watch
  the fire tonight, a taught skill (Old World Caches — "Huh. I can see
  how that'd keep me alive"), then returns to the unfinished thread
  ("We never finished — what day it is") and ends in confrontation: "I
  don't have to explain myself to you... See who trusts you after."
  Resolution deflected, with a social consequence. Real.
- **Polish notes (carried, not defects):** the subject-switch deflection
  lines repeat verbatim every time ("Forget I said anything. What did you
  want?" ×3 in one conversation; "Sorry — I shouldn't load that on you.
  What's up?"); [menu:more] paging yields THEM: (no line) turns; one
  non-sequitur (returning to the days thread answered with "Huh. I
  wouldn't have guessed that about you").

## BLANK FILLED — the thirsty scholar at the door (seed 883) + R105-DOORSTEP-DRINK-ENTRY fix
**The blank:** seed 883's scholar sat at Haven hyd 0 for 3 days (d26–28)
with 22–25 clean liters in the village and 0 bottles, stores "remote".
The doorstep triggered d26 and d27 (branch=water) and recorded
`filled=true` — but drank nothing: `drinks=0, hyd 0->0, bottles 0->0`.
He died d28, killed by a stranger (correlation with the dehydration is
unproven — hp was 92 at the d28 snapshot; the death is a stranger
killing, not a dehydration death).
**The mechanism (probed, code-read):** `guardEatOnArrival`'s door step
ran only when needEat — the water branch was assumed to need no stores.
A fed scholar (kcal 2272) never entered the hall, so he stood on an
adjacent/outside tile where `Game.fillWater()` silently refuses ("No
water here" — it needs the haven tile or a wild-water tile; the cistern
is reachable only inside). The old code then recorded `filled=true`
unconditionally after the call, so the record lied while nothing was
filled. The game behaves as designed at every step; the gap is the
DRIVER ladder, same class as r104's creek pocket.
**The fix (driver-only, zero src/js):** the door-step gate is now
`(needEat || needDrink)` — a thirsty scholar at home walks inside and
drinks, like a competent player would — and `filled` records only
bottles actually gained (`filledBottles`).
**Proof (before/after, seed 883):** BEFORE (panel corpus): d26 step
`enterResult=not-needed, insideAfter=false, storesAfter=remote`,
`drank=false, hyd 0->0, filled=true`; d28 snapshot hyd 0, kcal 768.
AFTER (fixed-driver replay, OUTDIR landing-r105-replay883): d26 step
walked the last tile (4,3)→(4,4), `enterResult=true, insideAfter=true,
storesAfter=inside`, filled 1 bottle, drank it, hyd 0→50; d28 snapshot
hyd 36, kcal 2040, scholar alive. The d28 stranger death is also absent
in the replay — observed difference only; the RNG stream shifts after
d26, so no causal claim is made. Proof test
scripts/test-landing-r105-doorstep-drink-entry.js: FAIL 4/5 checks on the
before corpus, PASS 5/5 on the after corpus.

## Notable events (not defects)
- **880 d27: a wave-3 monster in the landing window.** The scholar died
  to The Terms of Service (367 HP) via a feast-draw face (pending-face).
  The fight was complete and fairly lost (6 strikes, 292 dmg dealt, 103
  taken). Tuning note, not a bug: the feast draw can face the scholar
  against wave 3 on day 27.
- **886 d14: a no-strikes rout.** 0 strikes, 0 others damage, fight ended
  routed — a flee with no combat at all. Shape note, carried.
- **R70 never-waited at dawn on 3/10 seeds** (881, 885, 886): favors
  exist but the scholar never meets the partner at dawn — the partner
  waits inside the hall while the scholar is told to go through the door.
  Dawn-meeting friction, carried.

## Reachable / fun / winnable
- **Reachable:** yes — all content in the leg fired (System contact
  10/10, contests 21 fired / 18 ended, flesh channel opens 9/10, outings
  complete, win-plans seed in the first fortnight on 6/10 seeds by d28).
- **Fun:** yes — conversations read like people talking (Yara's pantry
  run, Ivy counting days and then standing on her dignity), the
  beast-naming thread is alive across villages, and the villages feel busy
  rather than mechanical.
- **Winnable:** not yet — unchanged. The win-plan system's party/hunt
  arms run hard in the first fortnight, but its gear-check, bond-tending,
  avoidance, and standing-contact arms have now been silent across 20
  seeds on two panels — the levers that would move the early funnel
  toward a geared party never fire in the landing window. That silence is
  now the named question for the next landing run: do those arms' conditions
  ever arise before day 28, or are the stages unreachable that early?

## Metric review
- M-S1 (silent arms): the metric worked as written; ARMS-SILENT is the
  finding, not a metric failure. No revision proposed — but the next
  landing run should ask WHY (conditions vs reachability), a design
  question, not a metric fix.
- M-W1-style d14 uptake (≥1/seed average): missed this run (6 planSeeds
  across 10 seeds vs r104's 13). Uptake varies a lot across fresh bands
  (2/10 seeds at d14 vs 5/10 in r104) — the d14 number is noisy. A future
  run could pre-register a two-run pooled bar rather than judging one
  band alone. No mid-run re-scoring was done; the miss stands.
- M7 revised (arrived/skips): worked as written (3/3). The r104 revision
  is validated — keep judging arrivals, not ladder completion.
- M-S2 (never-seeding seeds): 4 named (878, 879, 884, 886). No readable
  difference found — the difference, if any, is in plan-seeding
  conditions, not village health.

## Telemetry deviation check
Ran `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/landing-split.json --current
'<landing-r105 census glob>' --metrics systemDay,monsterKills`. 2 LOUD
lines, BOTH EXPLAINED as aggregation artifacts (same class as
r94/r95/r96/r97/r98/r99/r104), baseline NOT rolled: (1) systemDay baseline 33
→ current sum 80 over 10 files (per-seed 8, mean 8.0); (2) monsterKills
baseline pooled mean 24 → current sum 231 over 10 files (per-seed mean
23.1, range 18–35). No behavior change is indicated.

## Mid-run standing-context update (recorded, not acted on)
- **XP, ABILITIES + GEAR (Steve 2026-11-05 07:09 CST, landed in MEMORY.md
  mid-run):** if a fighter in full gear and armor appropriate for the tier
  still can't survive, the gear isn't good enough — protection per tier must
  let them survive the fights that tier is meant for. This corrects the
  "gear exonerated" framing: bars met is not survival. Abilities are granted
  by the System as a person gains experience through any path-type skill
  (five tracks: combat, field, social, craft, strange); most actions give
  some XP, more for synergistic ones; skills can be taught and leveled with
  XP; abilities are granted by the System for leveling up or completing
  combats — never taught, never bought. Build queued 2026-11-05: XP coverage
  + synergy bonus + gear protection retune, measured on identical-seed panels
  before/after. Read alongside Q1 above: the gear-arms silence finding is
  about the win-plan gear-check arm never firing, not about gear bars — and
  the queued retune may change what gear means in the landing window before
  r106 runs. No verdict in this run changes; no work in this run touches
  that build.

## Closeout note
- Commit: prereg (66f8825b4) + this note + r105 driver fix/proof + r106
  driver + panel + replay evidence (tooling + evidence only, zero src/js).
  The fix is driver policy, not game code — no [needs-eyes] flag (nothing
  player-facing changed; the ship loop need not fast-track).
- Quick suite: `node scripts/check.js --quick` — 279 passed, 11 failed in
  1473s (landing-r105-checkquick.log; the box ran ~3× slower than r104's
  496s). The 6 are EXACTLY r104's standing set (measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20-fixes); none touches this run's
  files (zero src/js changed; the new files are not on the check list).
  The 5 new ones are LOAD artifacts, re-verified standalone green:
  measurement-cache-flags (0/4 in-suite at 94.4s → 4/4 standalone in 8.6s)
  and four 120s TIMEOUTs (solo-campaign-endings, time-save-crashes,
  trust-observer-neutrality, capable-bot — capable-bot 40/40 standalone
  in 21s). No regression from this run.
- Telemetry: LOUD explained, baseline NOT rolled.
- Rotation 0→1 already written. Lock deleted at closeout after
  read-back of its run_id.
