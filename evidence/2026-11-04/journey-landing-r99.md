# journey-landing r99 — run note (lane A, leg 0 LANDING)

**Run id:** laneA-20261104T2045Z (scheduled 20:45 CST 2026-11-04). Base
master@38f849146 at branch creation; worktree `journey-landing`. Rotation read 0
→ leg 0 LANDING; 0→1 written at run start and verified by read-back.
Prereg: evidence/2026-11-04/journey-landing-r99-prereg.md (recorded in goal
hidden_files BEFORE any seed ran, then committed verbatim-plus-addendum
20a5a4fd BEFORE the pilot seed — the safe-commit index clobber struck on
that commit, same class as r90/r94/r95/r97/r98: commit correct, index lied
with the file staged-as-deleted + untracked; repaired via HEAD-blob
cacheinfo, verified `git status` clean + `git diff HEAD` empty + hash-object
matches HEAD). Panel outputs: goal hidden_files evidence/2026-11-04/landing-r99
(panel censuses/system/transcripts + analysis + pilot/panel logs + checkquick
log). Driver: scripts/journey-landing-r99-20261104.js (prepared and committed
by r98, used verbatim — fresh seeds 857–866, DAYS=28; diff-verified against
the r98 driver at run start: only header, seeds, OUTDIR differ).
Analyzer: scripts/analyze-landing-r94-20261104.js (unchanged, dir-as-argv).
Fights: scripts/analyze-fights89-20261102.js (unchanged, dir-as-argv).
Shape test: scripts/test-landing-r94-shape.js.
Next driver prepared here: scripts/journey-landing-r100-20261104.js (r99
verbatim + seeds 867–876, OUTDIR landing-r100; diff-verified, node --check
clean). NOTE for the r100 runner: the OUTDIR date is 2026-11-04 — re-point
it if that run lands on another day.

## Infrastructure note (flap, read first)
At run start the container EPERM write flap (2026-11-03/04 class) blocked
every git write: `worktree-register.sh` failed 4 times (packed-refs.new,
worktrees admin-dir, loose-ref .lock writes all EPERM), bulk `cp` failed on
most files, and even `git init` in /tmp failed on a template copy — the
flap was system-wide, not main-repo-specific. Registration succeeded on
retry attempt 5; the standing heartbeat loop held the registry beat
thereafter (verified active in REGISTRY.json). A snapshot copy was started
as a fallback and abandoned incomplete once registration succeeded; no seed
ran from it. No main-tree file was edited, committed, or written by this
run. The prereg's flap note + addendum record this transparently.

## Panel verdicts (as run)

- **Q1 DOORSTEP-OUTINGLIVE BRANCH AT PANEL SCALE: GO — BRANCH EXERCISED.**
  M6 clauses all hold: (a) all 3 triggered doorstep steps carry complete
  eatRecs; (b) 0 class-E scholar starvation deaths (0 starvation deaths
  of any class on the panel); (c) 0 triggered steps ending with
  enterResult===false. AND the fix's new branch fired twice: seed 859 d9
  (scholar kcal 0, liveOuting=true → TRIGGERED, ate 0→2400, enter true)
  and seed 860 d10 (kcal 0, liveOuting=true → TRIGGERED, ate 0→2400,
  enter true). The third triggered step (860 d15, kcal 495,
  liveOuting=false) is the ordinary branch. The 7 outing-live SKIPS on
  the panel (859 ×3, 860 ×2, 861 ×2) all fall on FED scholars
  (kcal 1482–2331, hyd 72–100 — all above the need thresholds), exactly
  as the fix intends: needy + live outing eats, fed + live outing skips.
  Panel doorstep totals: 283 checks, 3 triggered, 3 ate, 0 door refusals
  (skipped: already-inside 66, fed-and-watered 200, not-at-haven 4,
  outing-live 7, in-combat 3). The r98 caveat is CLOSED: the branch is
  now proven at panel scale, not only on the r97 seed-843 replay.
- **Q2 WATER CLAUSE: UNTESTED again** (0 wild water skips; 7 wild outing
  iterations, min hydration 73, 0 under 25). Standing since r87 — now
  fourteen runs deep.
- **M1 ALIVE-D14: 10/10 PASS** (day-14 pops: 857:11, 858:11, 859:12,
  860:12, 861:12, 862:12, 863:12, 864:10, 865:10, 866:11; overAt None on
  all ten seeds).
- **M2 SYSTEM CONTACT: 10/10 PASS** (first contact day 8 on all ten seeds).
- **M3 FIGHT-LOG: PASS** — panel 24 hunt fights, 24/24 complete, 4 fatal,
  0 unknown/mixed trigger. The fatals are clean losses: 862 d28 (Erin's
  successor at 27 HP meets a wave-3 Callback, dies without landing a
  blow), 862 d30 (wave-3 Redactor, 3 strikes for 63 dmg before falling),
  863 d18 (wave-2 Paparazzo), 864 d29 (wave-1 Bright Bastard). One
  ZERO-DMG shape note (not a verdict item): 859 d28 and 861 d27
  no-strikes routed fights, 863 d18 others-killed — the scholar struck
  0 blows while allies killed or the fight routed; the wild-ally shape,
  recorded here, not a defect claim.
- **M5 PEOPLE: PASS.** Wind-down more 10 picks, 0 empty; WD probe GATE-A
  GO, GATE-B GO; betrayal held-offers 0; party invites 10 offered / 10
  spoken / 0 dry / 5 accepted; case labeling 6/6. Two full transcripts
  read (859 day 10 Olivia, 860 day 11 Oliver) — both contentful, no
  fabricated shared history (see People check).
- **M6 DOORSTEP: GO** (see Q1 — clauses hold AND the branch fired twice).
- **M7 GUARD v3: kcal PASS, water UNTESTED.** Kcal skips 4 → arrivals 4,
  rescue ladder 4/4 complete, eat-on-arrival 4/4 ate (857 d11: 608→2309;
  858 d13: 1000→2400; 858 d15: 689→2339; 860 d5: 680→2380; all from
  outside the hall, enter=true), 0 refusals, 0 guarded skip-day
  starvations. Water skips 0 (see Q2).
- **M8 SHAPE: PASS** on pilot corpus and on all 10 panel censuses
  (water arrivals 0, kcal arrivals 0–2 per seed).
- **M9 STAY-GREEN: PASS, full.** Death liturgy exact (griefMiss 0/31;
  every panel death REGISTERED; succession latencies [1, 0]); theft 0
  all seeds; plenty-voice 7–55 all seeds; starvation clause PASSES
  (0 starvation deaths); self-sufficiency clause PASSES on all ten
  (range 0.733–0.994, floor 0.70) — r98's narrow 854 miss (0.695) does
  not recur. The R66 gate reads NOT-HUNGRY (0 slide seeds, 5 band,
  5 no-slide): thin pantries alone are a watch, not a famine.
- **M10 DAWN-DOOR, LIVE-ONLY (binding): PASS.** 484 panel opps,
  waitDiagMissing 0. Live promises 93 (waiting 4, has-run 89);
  ledger rows 376 (the r89/r94 counting artifact, reported separately,
  never counted as door blocks). 4 waited live opps, all 4 departed
  (857 Nikolai d10, 859 Inas d8, 861 Tashi d13, 866 Tiernan d9);
  sidestep attempts 9, ok 7, readyAfter 2; 0 unexplained door blocks;
  0 "Finish your current outing" refusals. Caveat (probe reach, not a
  game block): on 5 seeds (858, 862, 863, 864, 865) no favor ever waited
  at dawn — the probe could not reach the partner (hall-door adjacency
  stall, same class as r98's 848 but up from 1 seed to 5; see Instrument
  watches). Seed 860's favors ran via teleports without dawn waits, a
  different shape from the stall.

## Village assessment (plain words)

Ten villages, all alive at day 14, all contacted by the System on day 8.
What they look like at the day-28 horizon:

- **857 (Tom's village, 12→10):** the meat village. Leo's wound d6, Rafael
  killed by a Grief Counselor d21. Hungry at horizon (951/person) but
  never starved; the panel's fullest meat channel (11 tests, all safe,
  7 pantry exits, 36 kills). The guard brought Tom home hungry d11 and
  fed him (608→2309); his broken outing with Nikolai ended cleanly d12
  by the live-run pass (0-kcal unload, promise-missed line).
- **858 (Jude's village, 12→11):** the steady village. One death (Akram,
  monster d15). Hungry (611/person), 25 kills, 2 meat tests, no pantry
  exit yet. The guard fired twice (d13, d15) and fed Jude both times.
  The probe never reached a dawn wait here (hall-door stall), so its
  joint outings never got their window.
- **859 (Landon's village, 12→12):** the unbroken village — no deaths at
  all. Hungry (666/person), 13 kills, 2 tests, 2 exits. The doorstep
  village of this panel: Landon ate at the doorstep on day 9 at kcal 0
  while an outing was still live — the fix branch firing in the wild.
  Inas's outing departed d8 but broke on patch exhaustion; Olivia's
  promise (d10) never departed by its d12 deadline (see Blank).
- **860 (Moshe's village, 12→9):** the village that changed leaders.
  Moshe was killed by a stranger d22, Kavya took the mantle d23. FED
  (2342/person), 23 kills, a poison test (Choir Toad is NOT food) plus
  two safe reveals but no pantry exit (stuck — see watches). Both
  doorstep branches fired here (d10 live-outing, d15 ordinary), and
  Onni's haul delivered and kept (1040 kcal) — one of the panel's two
  kept outings.
- **861 (Sidney's village, 12→11):** the contest village. One death
  (Ruth, monster d17). Hungry (1010/person), 20 kills, 3 meat tests
  (all by Fatima, all safe), no exit. Four contests won (Windfall,
  Lottery, Long Odds, Drop). Tashi's outing departed d13 and broke on
  patch exhaustion.
- **862 (Erin's village, 12→10):** the hard village. Five villager
  deaths including two tail deaths past the pantry horizon (wild d28,
  monster d29, wild d30) and two fatal wave-3 fights. Hungry
  (940/person), 21 kills, 2 tests, no exit (stuck). The probe never
  waited at dawn here.
- **863 (Karl's village, 12→8):** the sick village. Karl died in the
  wild d18, Thabo took the mantle the same day; then a sickness cluster
  (d20, d23, d28) on top of a wound d19. FED (2274/person) — food was
  not this village's problem. The probe never waited at dawn here.
- **864 (Anthony's village, 12→10):** the ambush village. A monster d9,
  an ambush d14, Sofia to a monster d28, a wild tail death d29. Hungry
  (776/person), 20 kills. The Bright Bastard fight d29 is a clean loss.
  The probe never waited at dawn here.
- **865 (Eli's village, 12→8):** the violent fortnight. A monster d8,
  Priya ambushed d11, a Bulldozer d14, Ruby to The Focus Group d25.
  Hungry (1083/person), 29 kills. The probe never waited at dawn here.
- **866 (Shanice's village, 12→7):** the thinning village. Five deaths —
  an ambush d10, a wound d17, a sickness cluster d17/d23/d24 — yet FED
  at horizon (2509/person). Tiernan's outing departed d9 and KEPT —
  the panel's second kept outing, delivered on the day the village was
  already thinning.

What they know: every village knows the System by day 8, knows monster
meat is being tested (10/10 seeds ran tests; 5 reached a pantry exit),
knows the naming debate (beast names voted around fires). What is
missing: on 7/10 seeds, food that reaches the per-person line — and on
860/862, safe meat that never became a dinner.

## People check (full transcripts read)

- **859 day 10, Olivia (probe sitting, want=ask_favor, resolution=
  promised):** a real ask with a reason and a place ("Pantry's thin and
  getting thinner. Forage with me tomorrow? I know the north treeline
  by the fallen oak."), committed ("I'll come back to help") and
  recorded as a promise ("forage with Olivia tomorrow to rebuild the
  pantry"). Then the case thread lands ("There's still the matter of
  the ambush of Ingrid. Nobody's settled it.") with the full
  site/witness/bribery menu, and a beast-naming thread with real votes
  (Big Big, Big-Eyes, Loud-Eyes, The Ugly Stare). Ends planted ("First
  light. The pantry's counting on us."). No fabricated shared history.
- **860 day 11, Oliver (probe sitting, want=curious, resolution=
  unestablished):** an invitation ("Walk my trap line with me? Extra
  hands, extra eyes."), declined, and the decline is acknowledged
  ("Fair enough. Rain check.") — a deflect with a reason, not a wall.
  Then the case thread (ambush of Onni, framing matches case_2), a beast
  sighting passed on ("Two knobs on glass-still water, watching."),
  and naming votes (The Big Beast, The Loud Beast, Big-Eyes, The Ugly
  Beast, Loud-Eyes). Ends resolved ("I'm going to go stare at something
  else now."). No fabricated shared history.

## Blank filled or documented

**FILLED (game behavior, no code change needed — the fix was already in
the driver): the doorstep-outinglive branch is now proven at panel
scale.** Two needy scholars with live outings ate at the doorstep
(859 d9, 860 d10, both 0→2400, enter true), and seven fed scholars with
live outings correctly skipped. The r98 "unexercised" caveat is closed;
do not cite the branch as unproven anymore.
**Documented, not fixed: a promised favor can lapse without a departure.**
Olivia's d10 promise (859) never departed by its d12 deadline and is
recorded honestly as BROKEN NO-DEPART, but no dawn wait ever happened
for it — the promise dies quietly in the ledger. Whether the villager
reacts in play (a line, a trust beat) is unproven from this corpus; the
ledger is honest, the player experience of the lapse is the open
question. Worth one probe pass on a future run: promise a favor, then
watch the deadline day for any narration.
**Documented, not fixed: the probe hall-door stall widened.** Five seeds
never waited at dawn this run (r98: one seed). The reasons are all
probe-approach failures ("partner inside the hall, go through the
door" / "move next to your partner, same side of the door") — the game
never blocked a live promise, so M10 still passes, but the probe's dawn
window is unreachable on half the panel. If it widens further, the
joint-outing measure itself degrades; a probe-side approach fix (not a
game change) is the candidate.

## Reachable / fun / winnable (leg 0)

- Reachable: yes for contact (d8 every seed), food, talk, favors, and
  outings — all 4 waited seeds departed, the rescue ladder fired 4/4,
  the doorstep step fired 3/3 when it reached a needy scholar (twice
  with a live outing). The unreached part is probe-side: on 5 seeds no
  favor ever waited at dawn (hall-door stall), so those villages'
  joint outings never got their dawn window.
- Fun: the fortnight reads like people surviving together — asks with
  reasons and places, a trap-line invitation declined gracefully, naming
  debates, grief that registers, villages that change leaders and carry
  on. The unfun residue is honest and unchanged: outings that walk out
  together and find nothing (patch exhaustion, 10 together-blocks on
  "0 kcal" panel-wide), and villages that end hungry on a slow bleed
  without ever starving (7/10 by the per-person line).
- Winnable: leg 0 unchanged in difficulty; no gate or balance change.
  Ten villages hand establishment a living, System-contacted village
  with kills banked and (on 10/10) meat knowledge started. Two scholar
  deaths (860, 863) are the game's difficulty, not a trap — no scholar
  starved, no scholar died to a door.

## Instrument watches (documented, not defects)

- **Armor tele/line disagree, 8/10 panel seeds** (r99 analyzer R69
  teleLineDisagree=8). Same class as r69/r95/r96/r97/r98 — neither series
  should be cited for armor craft counts until the units are reconciled.
  Armor itself is fine (wearers present, bark/hide flowing).
- **Horizon pantry thin on 7/10 panel seeds** (857, 858, 859, 861, 862,
  864, 865 by the <2000/person line). The analyzer flags it PATTERN
  ("collapse recurs — lever work candidate"). No recorded pantry snap
  hits 0 on any seed; the R66 min=0 figures are SCHOLAR-kcal minima
  (a scholar at 0 kcal at a snap — the doorstep cases), not pantry
  zeros. The R66 gate itself reads NOT-HUNGRY.
- **Flesh channel:** 7/10 arrival seeds, 10/10 test seeds, 5 exit seeds,
  2 stuck seeds (860, 862: safe meat known at horizon, no pantry exit),
  5 open seeds — CHANNEL OPENS, with the stuck pair as the watch (exit
  may need a cook/dinner step the horizon cut off).
- **Deaths13 vs mantle counts disagree:** deaths13 lists 5 playerDeath
  entries across 4 seeds (860 d22, 862 d28 + d30, 863 d18, 864 d29) while
  mantle-logged scholar deaths = 2 (860, 863); the 862/864 deaths fall
  on/after the d28 horizon edge (tail days) and produced no mantle
  entry, and succession shows unresolvedAtHorizon=2. Grief registration
  holds (griefMiss 0/31, mislabels 0), so this is an instrument-definition
  question, not a death-recording defect.
- **Contests open at horizon 4** (fired 26, ended 22, orphanEnds 0) —
  in-progress shows at the d28 horizon, not orphans.
- **No creek-tile evening-home block this run** (0 "hop home failed"
  lines in either log) — the r97/r98 watch does not recur here.

## Metric review

- M9's self-sufficiency clause passes on all ten seeds this run
  (0.733–0.994); r98's narrow 854 miss does not recur. No threshold
  changed (gating freeze stands).
- M6 reporting convention from r97/r98 kept and now strengthened: the
  branch-exercise caveat is retired — a triggered step with
  liveOuting=true and a needy scholar eating is now observed twice,
  and fed+live skips are observed seven times, so the fix's both arms
  are panel-proven.
- No thresholds changed this run. The fizzle convention from r96 (flag
  only on thread exhaustion) was kept; the verdict rests on the two full
  reads plus the wind-down/probe gates, all green.

## Telemetry deviation check

Ran `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/landing-split.json --current
'<landing-r99 census glob>' --metrics systemDay,monsterKills`. 2 LOUD
lines, BOTH EXPLAINED as aggregation artifacts (same class as r94/r95/
r96/r97/r98), baseline NOT rolled: (1) systemDay baseline 33 → current
sum 80 over 10 files (per-seed 8, mean 8.0); (2) monsterKills baseline
pooled mean 24 → current sum 217 over 10 files (per-seed mean 21.7,
range 13–36). No behavior change is indicated.

## Closeout note

- Commit: prereg (already committed 20a5a4fd) + this note + r100 driver
  (tooling/policy only, zero src/js).
- Quick suite: `node scripts/check.js --quick` — 284 passed, 6 failed in 703s
  (landing-r99-checkquick.log). The 6 are EXACTLY r98's standing set
  (measurement-proof-update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, establishment-r20-fixes); r98's
  timeout extras (trust-observer-neutrality, capable-bot, table-endings)
  ran slow (93s/87s/69s) but passed this time, and measurement-cache-flags
  stays gone. None is attributable to this run: this run changed zero
  src/js and zero existing tests, and no failing test references any
  r99/r100 file (verified by grep) — all 6 are the same proof-freshness
  class as r98's standing set. Reported here, not fixed — other lanes'
  proof-freshness maintenance, not this leg's findings.
- Merged locally, pending ship (no version tag; ship job owns it).
- Heartbeat: standing loop (600s) held the registry beat through the
  run; beats verified in the registry.
  The run's own lock held throughout.
