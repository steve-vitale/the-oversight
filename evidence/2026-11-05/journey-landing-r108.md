# Journey — Landing r108 (2026-11-05/06, Lane A leg 0)

Run id `laneA-20261106T0019Z`, scheduled Thu 2026-11-05 17:45 CST, started ~00:21Z 2026-11-06.
Leg 0 LANDING. Branch `journey-landing`, base `4c7bf78cc` (master at run start).
Rotation 0→1 written at run start, verified by read-back.

## Prereg (committed 985e29e54, before any seed ran)

Question: adjudicate M-PR1 at pooled scale (r107+r108 sittings), the r107
thread-gate open question (engagement picked, want stayed stage 1, n=1), and
R69 tele/line disagreement with the fixed armor-only regex. Seeds 1013–1022
(fresh band — full-scope grep over ALL dated preregs; only round-number
filenames and timestamps hit). DAYS=28. Policies: competent-player driver,
r107-verbatim except seeds/OUTDIR/R69 regex. Carried bindings: M1 ALIVE-D14,
M2 SYSTEM CONTACT, M3 FIGHT-LOG, M5 PEOPLE, Q3 M7 goaround, Q4 M6 doorstep,
Q5 water. Bars: M-PR1-pooled never-offered <25% of pooled sittings; M-PR1
per-seed ≤1 never-offered sitting on ≥8/10 seeds; M-PR2 promised ≥80% of
picks; M-TG ≥2 picked-but-stage-1 cases sharing a non-null thread; M-R69
tele==lines once the regex is fixed, or the excess explained by away-crafts.
Metric binding applies: a miss is NO-GO, never re-scored mid-run.

**CORRECTION carried in the prereg (r107 tele-cap caveat RETIRED):** r107's note
said the R69 disagreement might be partly caused by the 300-event telemetry
cap and proposed a future run with TELEMETRY_FULL=1. That caveat was wrong for
this driver: `scripts/journey-landing-r108-20261105.js:1665` calls
`loadGame({ seed, fullTelemetry: true })`, and sim-harness.js sets
TELEMETRY_FULL=1 by default in sims — the tele stream was already uncapped in
r106/r107. The cap cannot explain the disagreement. Q2 adjudicated the
remaining explanations directly.

## Infrastructure notes (loud first)

- **Registration took ~7.6 min (single attempt, loaded box).** `git worktree add`
  slow, no EPERM, REG_EXIT:0. Worktree `~/workspace/worktrees/journey-landing`,
  registered ~00:29Z. Heartbeat at registration + 10-min loop (PID 11902).
- **Pre-flight clean.** Main tree clean, disk 24%, `git pull` already up to
  date. Reaper removed nothing; LOUD lines only about other owners' dirty
  trees (never touched). Active trees 5/16 at pre-flight.
- **Safe-commit index clobber struck** on the prereg commit (985e29e54, known
  class): committed file showed staged-as-deleted + untracked after commit.
  Repaired per the recorded recipe (`git update-index --add --cacheinfo` with
  HEAD blob); verified `git status` clean (0 lines), `git diff HEAD` empty.
  Expect it again on the run-note commit; same repair.
- **Rotation-write discrepancy, 5th sighting.** r107's note claimed 0→1 was
  written and verified at closeout, but the file read 0 again at this run's
  start. The closeout write fails silently and intermittently. This run wrote
  1 at run start and verified by read-back; re-verify at closeout.
- **No lock existed at start.** Lock created 00:21:12Z, run_id
  `laneA-20261106T0019Z`. Delete at closeout after read-back of run_id.

## Panel

Pilot: 3 seeds (1013–1015), DAYS=28, exit 0 in ~21s. All 3 alive, systemDay 8,
ask_favor sittings present. Pilot gates passed → expanded to full panel.
Full panel: 10 seeds 1013–1022, DAYS=28, exit 0 in ~67s. 10 census files in
goal hidden_files `evidence/2026-11-05/landing-r108/`. Logs:
`landing-r108-pilot.log`, `landing-r108-panel.log`.
Analysis: `scripts/analyze-landing-r104-20261105.js` → `/tmp/r108-analysis.txt`;
`scripts/analyze-landing-r107-commit-offer.js` → `/tmp/r108-commit-offer.txt`;
`scripts/analyze-fights89-20261102.js` → `/tmp/r108-fights.txt`.

## Panel verdicts

- **Q1 M-PR1-pooled: NOT CONFIRMED — r107's driver-probe adjudication stands.**
  r108 never-offered 7/27; pooled with r107 7/33 = 14/60 = 23.3% < 25% bar.
  M-PR1-per-seed: never-offered ≤1 sitting on 10/10 seeds (1013:1, 1014:0,
  1015:1, 1016:0, 1017:0, 1018:1, 1019:1, 1020:1, 1021:1, 1022:1) — PASS.
  M-PR2: picked=20, promised=18 (90%); both 'stated' refusals are the R72
  away-guard line ("Wait — I'm out on the road…") — 1017 d7, 1021 d9. PASS.
  Transcript adjudication of the 7 never-offered sittings (3 read in full):
  1013 d8 Hannah's favor was already withdrawn in the opener ("Never mind the
  food I needed — we got it handled"); 1022 d10 Aruzhan's want never got
  established in a 1-turn sitting crowded by the betrayal-case menu (4 case
  options + vote) and the driver left. The option is offered when the want is
  live and engaged; the misses are a withdrawn want and a probe that leaves
  early — not the game hiding engagement.
- **Q1b M-TG (thread-gate): 0 CASES — stays open, n=1 (r107 only).** All 20
  r108 picks resolved promised (18) or stated (2); zero sittings where
  engagement was picked but the want stayed stage 1. The r107 seed 1010 d12
  case remains the sole instance; no mechanism to name, no verdict.
- **Q2 M-R69: CLOSED as an instrument defect (the regex was the whole story).**
  With the fixed armor-only regex, teleLineDisagree=0/10 seeds — tele
  armor_craft counts equal narration-line counts on every seed (1ok/0fail,
  0ok/1fail, 0ok/4fail, 0ok/2fail, 2ok/0fail all matching). R88 ARMOR-SILENT
  confirms: teleOk=4, lineMissing=0, silentWild=0, silentHaven=0 — no silent
  craft occurred on this panel, so the away-craft explanation was never
  needed either. The disagreement was weapon+ammo failures counted as armor
  failures by the old broad regex. No game-code defect; no code change.
- **Q3 M7 goaround: GOAROUND-HOLDS.** kcal skips=3 complete=3 = 100% ≥ 80%.
  Rung fires: first-travelTo ×3 (bridge/detour/clear did not fire this panel).
- **Q4 M6 doorstep: DOORSTEP-GO.** Checks=281, triggered=3, ate=3, drank=0,
  doorRefused=0. EAT-ON-ARRIVAL: arrivals=3, ate=3.
- **Q5 water: UNTESTED (20th run).** Wild outing iterations=3, hydUnder25=0,
  minHyd=100, waterSkips=0. R84/R85 water both UNTESTED, 0 skips.
- **M1 ALIVE-D14: 10/10 PASS.** No village lost by d14 (none lost at all;
  lowest popEnd 7).
- **M2 SYSTEM CONTACT: 10/10 PASS.** systemDay 8 or 9 on all ten seeds.
- **M3 FIGHT-LOG: PASS.** 22 hunt fights, 22 complete, 1 fatal with a known
  trigger (trap, The Callback w3 — see seed 1019 below),
  fatalWithUnknownOrMixedTrigger=0.
- **M5 PEOPLE: PASS.** WD probe 9/10 surfaced; wind-down more picks 6 with
  0 empty; betrayal 12 offers, 0 held; party invites offered=9 picks=9
  spoken=9 dry=0 accepted=2 (PARTY-GO). R67 case labeling 8/8 match.
- **M-R70 (closed r107, consistency check): 0 genuine defects.** waitDiag
  totals: opps=348, promise-favorId=196 (ALL ledger), live waiting=8,
  has-run=108, kept=32, node-not-home=4. waitSeeds=5/10 (r107: 6/10).
- **R73 WINDOW:** promised=13, askedOnly=20, all 13 NARROW,
  keptInsideNarrow=4. NARROW-PATTERN continues (design input).
- **R66 horizon pantry: 7/10 HUNGRY** (r107: 9/10) but **NOT-HUNGRY by the
  revised gate** — starvationDeaths=0, slideSeeds=0, bandSeeds=6,
  noSlideSeeds=4. FED seeds: 1015 (5430/person), 1021 (2505), 1022 (3842).
- **R62 FLESH: CHANNEL OPENS.** arrivalSeeds=9/10, testSeeds=9, exitSeeds=7,
  stuckSeeds=2, openSeeds=7. Stuck: 1017 (rot=1, 6 at horizon, exit 0),
  1020 (poison=1, 3 at horizon, exit 0). No-arrival: 1018 (14 kills, 0
  tests, 0 exits).
- **Mantle:** one completed pass at latency 1 (1016 Cheyenne d27 sickness →
  Amani d28). The r107 2-day latency owed item is NOT reproduced — latencies
  [1] only, owed 2–4d still open. One scholar death unresolved at horizon:
  1019 Felix died d28 (horizon day), honestly unresolved inside the +4 tail.
- **Win-plan (R104, carried):** planSeeds d14 on 6/10 seeds, d28 on 8/10;
  holders 22→27; partyWaits 32→38; partyFights 43→100; gearHolds=0,
  bondTends=0, all later arms 0. **M-A2 re-confirmed STRUCTURALLY-UNREACHABLE**
  (retired metric, consistency check only): prims=0, no muster, no wave-4
  kills, no table plans on all d28 censuses.
- **Contests:** fired=18, ended=14, openAtHorizon=4, orphanEnds=0. LEDGER GO.
- **Starvation:** 0 deaths, GO. Grief: 0/25 miss, holds.

## Village assessment (plain words)

Ten villages, ten first months. All ten survive the month — the first panel
in a while with no village lost — though one (1016) thins to seven people
after five deaths, and the scholar dies on two seeds. Everyone meets the
System by day 8 or 9. The villages hunt hard — 11 to 36 monster kills each,
244 in total — and feed themselves only barely: seven of ten end the month
hungry, under 2,000 kcal per person, but nobody starves (zero starvation
deaths, the best landing panel on that count in a while). Three villages end
fed, one of them fat at 5,430 per person. People ask each other for help and
mostly get it: 20 of 27 sittings offered the promise, 18 of 20 picks became
real promises, and the two refusals were honest ("I'm out on the road — find
me when I'm back"). Parties form: two of nine invitations accepted. Monster
meat moves: nine villages taste it, seven get it into the pantry. The
villages are alive, social, and hungry — the same hungry as always, two seeds
less than the last run, and this time the hunger doesn't kill anyone.

Pops end 10, 9, 10, 7, 9, 11, 9, 8, 11, 12 (seeds 1013–1022). Spawns: Lisa,
Joshua, Adrian, Cheyenne, Barbara, Seymour, Felix, Easton, Stella, Victor.
Monster kills per seed: 25, 20, 29, 11, 23, 14, 31, 32, 23, 36.
Self-sufficiency 0.815–0.991.
**Seed 1016 thins to 7:** Leo d4 (monster), Guadalupe d14 / Theo d14
(monster), Alejandra d21 (wound), Cheyenne d27 (sickness — the scholar;
mantle to Amani d28, latency 1). Pantry 9,906 at d28, 1,415/person.
**Seed 1019 scholar dies on the horizon:** Felix (the spawn) is killed d28
by The Callback, a wave-3 monster, in a trap-triggered fight out on the
trapline — five strikes, 152 damage dealt, the beast at 148/300 when the
final blow lands. The mantle is honestly unresolved at the horizon; the
village stands at 9.

## People check (transcripts read in full)

- **1017 d7 Thembi (10 turns): Real.** Thembi wants pantry-run help ("I
  still haven't found anyone. Any chance?"), the player commits, she refuses
  honestly — away on the road ("Find me when I'm back, and we'll set it
  then."). A betrayal invitation surfaces mid-conversation (ambush case),
  the player declines ("Not this time." / "Fair enough. Rain check."). The
  conversation has a want, an engagement, a deflection, and an ending that
  owes a return. Polish notes (carried, minor): the post-refusal "go on"
  beat ("Come see what I found. You won't believe it.") is a generic lure
  that doesn't connect to the pantry thread.
- **1013 d8 Hannah (5 turns): Real, and the want is already over.** Hannah
  opens by withdrawing the favor herself ("Never mind the food I needed —
  we got it handled. Thanks anyway.") — there is nothing to commit to, so
  commit is never offered, correctly. The driver leaves after one turn.
  Beast-naming follows (The Bailiff / Old Gavel / Judge Hoot). Polish note:
  the generic closing ("This matters. What we just said — it matters.") lands
  oddly after a one-turn never-mind.
- **1022 d10 Aruzhan (6 turns): Real, crowded out.** Aruzhan opens with a
  confidence (a photo of someone left behind) and the ambush case; the menu
  carries four case options plus a vote, the want sits at stage 0 behind it
  all, and the driver leaves after one turn. Engagement never surfaces
  because the want never got established — a probe that leaves early, not
  the game hiding the option.

## Blank filled / documented

- **M-PR1 adjudicated at pooled scale** (see verdicts): engagement is not the
  bottleneck — the option is offered when the want is live and engaged; the
  misses are a withdrawn want and early-leaving probes. No game-code defect;
  no code change.
- **R69 closed as an instrument defect** (see verdicts): the broad fail regex
  counted weapon+ammo failures as armor failures; with the armor-only regex
  tele==lines on 10/10 seeds. No game-code defect; no code change. The
  tele-cap caveat from r107 is retired (the harness already ran full
  telemetry); the away-craft explanation was never needed (0 silent crafts).
- **Thread-gate stays open (n=1):** zero picked-but-stage-1 cases on this
  panel; the r107 seed 1010 d12 case remains the sole instance.
- **No other blank filled this run.** Water still untested (20 runs); the
  mantle 2-day latency (r107 seed 1009) stays an owed item; scholar-eats-first
  and the M-A2 design question stay Steve's calls; flesh stuck seeds (1017
  rot, 1020 poison) and the 1018 no-arrival are channel friction on one seed
  each, not defects to chase without more evidence.

## Notable events

- 1016 thins to pop 7 (above); 1019 scholar dies d28 to a wave-3 Callback.
- Zero starvation deaths on the panel (r107: 4).
- Party invitations accepted 2/9 (r107: 5/6) — the rate swings panel to panel;
  the mechanism (offered→spoken→accepted) works.
- Flesh channel: 7/10 seeds get monster meat into the pantry (r107: 7/10).

## Reachable / fun / winnable

- **Reachable: yes.** System contact 10/10, contests 18 fired, flesh channel
  opens 9/10, outings complete, win-plans seed 6/10 by d14.
- **Fun: yes.** Transcripts read like people; Thembi's honest refusal, the
  betrayal case that holds under a decline, beast-naming with real votes.
  The villages are hungry, which is the game's thesis, not a bug in the fun.
- **Winnable: not yet — unchanged.** Win-plan later arms proved structurally
  unreachable before d28 (r106 M-A2, re-confirmed); the early funnel moves on
  party/hunt arms alone. No wave-4 kills, no muster, no table plans on any
  d28 census.

## Metric review

- **M-PR1-pooled worked — closed the question.** The pooled bar (14/60 =
  23.3% vs 25%) plus the per-seed bar (≤1 on 10/10) and the transcript reads
  converge: engagement is not the bottleneck. Keep both bars for the next
  run as regression lines; the question is closed unless a live case appears.
- **M-PR2 worked.** 90% promise rate with both refusals explained by the
  away-guard. Keep.
- **M-TG returned 0 cases — the metric is fine, the phenomenon is rare.**
  Keep it as a watch: it only needs one more instance to become a mechanism.
- **M-R69 worked — closed the question.** The fixed regex made tele==lines
  on 10/10 seeds. Retire the metric; the armor-counting question is settled.
  The prereg's tele-cap correction stands: never re-propose a TELEMETRY_FULL
  run for this driver — it already runs full.
- **M7/M6 carried, both GO.** Keep as regression lines.
- **M-A2 retired, re-confirmed only.** The structural-unreachability finding
  stands; the metric stays retired.

## Regression + telemetry

- Shape test (r94): PASS. Goaround regression (r104 replay corpus): PASS.
  Class-F test (r106): PASS. R69 regex proof test: PASS on the r108 driver.
- `node scripts/check.js --quick`: run 1: **281 passed, 9 failed in 969s**;
  re-run (full output saved to /tmp/r108-checkquick-full.log): **276 passed,
  14 failed in 1745s**. The re-run's 14 = the standing 6 (measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20-fixes) + 7 per-test 120s TIMEOUTS
  (exit null: solo-campaign-endings, time-save-crashes,
  trust-observer-neutrality, synergy-stall, throttlefeast, capable-bot,
  table-endings) + test-measurement-cache-flags. Adjudication: the 7 timeouts
  are load flake — the box ran two check.js suites concurrently plus sibling
  sims (load ~8); the same tests passed in run 1, several at the 120s edge.
  Cache-flags failed in the re-run's concurrent run but PASSES standalone
  4/4 on BOTH the worktree and master (re-run twice) — shared-cache state
  under concurrency, not a regression. This run's branch touches only
  evidence + driver scripts (the quick-list total stayed 290 in every run),
  so no failure is attributable to it. The standing 6 are unchanged from
  r106/r107. (Run 1's full failure list was lost to `tail -15` truncation;
  the re-run's full list is the record.)
- **Telemetry deviation check:** ran `node scripts/telemetry-check.js
  --baseline .../telemetry-baselines/landing-split.json --current
  '<landing-r108 census glob>' --metrics systemDay,monsterKills`. 2 LOUD
  lines, BOTH EXPLAINED as aggregation artifacts (same class as
  r94/r95/r96/r97/r98/r99/r104/r105/r106/r107), baseline NOT rolled:
  (1) systemDay baseline 33 → current sum 82 over 10 files (per-seed 8–9,
  mean 8.2; baseline is a 4-seed-run sum); (2) monsterKills baseline pooled
  mean 24 → current sum 244 over 10 files (per-seed mean 24.4, range 11–36;
  r107 was 20.5, range 13–32). No behavior change is indicated.

## Next run (r109 driver prepared)

`scripts/journey-landing-r109-20261105.js`: r108 driver verbatim except seeds
1023–1032 (fresh band — verified: word-boundary grep over all dated preregs
returns no seed naming; the only "1023"/"1024" hits are round-number
filenames), OUTDIR landing-r109, header. Diff-verify: only header/seeds/OUTDIR
differ. `node --check` clean on the driver.

## Closeout note

- **Rebase:** clean, both picks applied, no sequencer stop. Rebased onto
  master `a7dfc4a45` (master had advanced past 4c7bf78cc with journey-endgame
  r140/r143 landings including src/js Fixes B/C + gorge fix; zero file
  overlap with this branch — evidence + driver only). New SHAs: prereg
  ca9bbb720, run note b85762f9d, closeout (this commit).
- **Proof re-run on the rebased branch (all PASS):** shape (r94), goaround
  (r104 replay corpus), class-F (r106), R69 regex (r108 driver).
- **check.js --quick:** run 1: 281 passed, 9 failed in 969s; re-run: 276
  passed, 14 failed in 1745s = standing 6 + 7 load timeouts + cache-flags
  (adjudicated: load/state flake; passes standalone 4/4 on master and
  worktree). No regression attributable to this branch (evidence + driver
  only; quick-list total 290 in every run). See the Regression section.
- **Telemetry:** 2 LOUD lines, both explained as aggregation artifacts,
  baseline NOT rolled.
- **Index clobber struck on all THREE safe-commits** (prereg 985e29e54, run
  note 13a45cc91, closeout): committed files showed staged-as-deleted +
  untracked after commit. Repaired each time via HEAD-blob
  `update-index --add --cacheinfo`; verified status clean + diff HEAD empty.
- **Rotation re-verified at closeout: reads `1`** (the 0→1 write stuck this
  run). Rotation-write discrepancy remains unexplained (5th sighting).
- Lock (`laneA-20261106T0019Z`, created 00:21:12Z) and heartbeat loop are
  removed at closeout after the merge, once run_id is read back; see
  `~/memory/2026-11-05.md` for the closeout record.
