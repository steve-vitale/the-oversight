# Journey social life r237 — Lane B (2026-11-18)

## Run

- Lane B occurrence 17:00 CST Nov 18, 2026 (run_id `2026-11-18T22:55:25Z-loop2-leg5`).
- Rotation-b read 5 at run start. This run plays 5 (social life); rotation-b NOT advanced in-run (left at 5 for the adoption closeout).
- Base at registration: `519653e29` (master after the sim-scale-onramp round landed; worktree branch `journey2-5`, ff-merged to master in the worktree, clean at start).
- Leg 5 (social life). Seeds 45733–45736 (fresh band, verified in the prereg), DAYCAP 140, policy journey.
- **ADOPTION:** r236's adoption completed before this run (TRAILTALK `32c62cd76` + evidence `b97a67015` ancestors of master). No held work was found.
- **THIS RUN TIMED OUT before closeout** (3600s occurrence budget): panel + analyzer + run note done; gate NOT run; nothing committed; nothing merged; worktree `journey2-5` holds all work UNCOMMITTED (driver + analyzer + prereg + evidence + this note); lock `playtest-loop-2.lock` left in place (run_id `2026-11-18T22:55:25Z-loop2-leg5`); rotation-b still 5. Adoption must: run the gate solo (`node scripts/check.js --quick`, cache `/tmp/jest-cache-playtest2`), commit via the worktree's own safe-commit.sh, rebase onto current master, ff-merge, release the tree, advance rotation-b 5→6, delete the lock after verifying run_id, run the telemetry check. Heartbeat the tree until the session ends.

## Leg question (carried from r226 + r229 + r231 + r234 + r235 + r236)

Does social life hold up across a full run — invitations sometimes taken,
bonds proposed and answered by character, moots firing, conversations
reading as people, wants surviving across sittings without drying into the
"...lost my train of thought." dead line — and do the r226 F6 fix, the r231
C3d fix, the r234 DRY2 fix, the r235 DRY3 fix, and the r236 TRAILTALK fix
hold in the wild?

## Fix arm: OUTING-SEEK — landed in the driver (tooling only, NO game-code change)

The r236 panel was VACUOUS for trail talk (0 trail-talk lines on all 4
seeds) and r235 exercised it on 1/4 seeds only. Re-traced this run from
the r236 panel JSONs + code: the asks DO happen (~10x panel-wide), outings
DO start (live-run opening "Ready to forage?..." + `dlg:forage_talk`
offered dozens of times), but the pair NEVER LEAVES Haven — every later
press is blocked "Forage together on green ground first" (25x) or
"Accept the forage request first..." (35x), zero departures. Cause: the
social driver only ever takes `agency:` choices and never drives the
favor-action chain — it never walks to green ground, never presses the
joint forage, never unloads. The r62 deepening driver HAS this chain.

Fix (`scripts/journey-social-life-r237-20261118.js`, driver only):
ported the r62 outing chain (`outingAttemptFavor`: readiness → position
adjacent → depart through the menu → travel to stocked green → joint
presses → trail-talk press → travel home → unload) plus three
pilot-proven corrections the port needed:

1. **gday missing** (pilot #1): the extracted range omitted r62's `gday()`
   helper — every dawn call errored (`gday is not defined`, recorded in
   `outingArmErrors`, 0 outings). Added the helper; pilot #2 clean.
2. **Continue live runs** (pilot #2): the conversational driver sometimes
   starts an outing itself (generic fallback picks `dlg:favor_action`)
   and never walks it out; the r62-shaped dawn arm skipped live runs, so
   a live run sat at Haven while new starts were refused ("Finish your
   current outing..."). Added `outingContinueFavor` (drives a live run:
   forage → talk → deliver) and a continue-first pass in `outingDawnArm`.
3. **Green-ground-first is not a positioning failure** (pilot #2): a live
   run at Haven with an empty haul reports not-ready with that reason —
   the pair is already together; the move is to travel OUT, not to
   re-position. The continue path now enters the forage loop directly on
   that reason.
4. **Walk home in hops** (pilot #3): `travelTo` only offers d<=3 targets
   and the direct path can cross a creek — the chain wandered to (6,3),
   (6,0), (0,0) and the trip home returned null / `blocked:creek`.
   Added `armTravelHome` (hop toward Haven via the nearest-to-home
   travel target, trying the next route when one is blocked) + a
   home-range candidate filter (forage only within Manhattan 3 of Haven).
   Hop v1 returned on the first failed hop; v2 retries other routes.
   Pilot #4 (Zinhle) still stranded on a creek-ringed pocket
   (hops-exhausted / no-closer-target) — filed as a remainder, not fixed.
5. **Per-day try caps**: this harness calls upkeep 3x/day, so the r62
   lifetime cap of 3 was consumed by one dawn's retries. Caps are now
   keyed per favor per day (start + continue), max 3/day each.

**OUTING-SEEK PROOF (pilot, seed 45733, final code): GO.** Two full
end-to-end outings: David d52 (continued) — 675 kcal delivered
(315 player + 360 partner), promise kept; Zoltan d55 (start) — 450 kcal
(225 + 225), promise kept. Trail talk fired on both with distinct lines.
(The Zinhle run on the same seed delivered 135 kcal late on d27 with
the promise already broken — the creek-pocket remainder, not the arm.)

## Panel

- **2/4 villages survived (45733 d142, 45734 d140); 45735 village-lost
  d94, 45736 village-lost d138 (scattered, 1 alive, 5 hungry days).**
  519 conversations, 532 transcripts read by the analyzer.
- **OUTING CHAIN (new): 33 attempts, 6 delivered-promise-kept, 1
  delivered-not-kept (Zinhle d27, late), 14 trail-talk presses,
  2,990 kcal delivered panel-wide (1260 + 0 + 520 + 1210).** By seed:
  45733: 17 attempts / 2 kept / 10 talks; 45734: 0 attempts (no outing
  ever started — 0 trail talks); 45735: 13 attempts / 1 kept / 1 talk;
  45736: 3 attempts / 3 kept / 3 talks.
- **TRAIL WILD HOLD — GO (first non-vacuous panel):** per-seed max
  recurrence 3 / 0 / 1 / 2 (bar ≤4); distinct trail-talk lines
  panel-wide 8 (bar ≥6). The 6-line pool works as designed: the opener
  ("Two pairs of eyes, twice the ground...") fires once per outing and
  repeats only across outings (pool resets per outing); 8 distinct
  lines seen, max 3x on any seed. r235: 12x on one seed from the old
  2-line cycle; r236: vacuous.
- **F6 WILD HOLD — GO: 0 dry servings panel-wide.** Third consecutive
  clean panel (r235: 0, r236: 0, r237: 0). Verified by grep over all
  four per-seed JSONs (the dry-line text appears nowhere).
- **M1 GO** — plots 3 (all early, d6–10 area), arms 3, grievance-linked
  3/3 by the reasons bar (binding judge). Springs 3 (escaped 1, killed
  1, hurt 1), 0 expired plots. Vendetta max 1.
- **M2 rate 0.3** proposals per village-day (154 proposals / 514 lived
  days; r236 0.283, r235 0.31 — watch only, no bar).
- **M3 GO (sometimes-taken)** — lure accept 400 / decline 383; party
  accept 26 / decline 28; bond accept 10 / decline 10.
- **M4 (human-read):** 519 transcripts, 152 nearDupFlags. The printed
  candidates are the same families as r234/r235/r236: the Haven-door
  positioning instruction (many paraphrase variants), repeated live-want
  re-asks (pantry run / creek water run) plus the teach-lesson
  same-opening template, plus "We're going in circles — ..." prefixed
  repeats of the same instruction. Verdict: instructional repeats +
  template families, not conversational parroting. The M4 split
  proposal (instructional vs conversational) stands.
- **M5 REPORT-ONLY** — 3/4 past d100. **Moots 7** (0+3+1+3).
- **M6 GO** (re-aligned gate definition) — no naming-beat line emitted
  beyond radius-1 of Haven; debates alive (149 kicked, 145 settled).
  Strict-definition away total 51 = the known metric/gate discrepancy,
  does not fail M6 (prereg).
- **M7 HOLDS** — NARR-DUP verbatimRepeats 0. **M9 HOLDS** — recap cap
  fires (326 presses, 0 after cap). **M10 HOLDS** — no NARR coach line
  repeats verbatim in one sitting. **FACE HOLDS** — no accuseFace
  repeats.
- **M11 GO** — recap-empty flags 0/152. **M12 informational** —
  door-req flags 101/152 (19.46%); M12-native HOLDS (threeTimes 64,
  max 1 per sitting, 0 sittings 2+, exits 72).
- **M8 SETTLED** — 2 links formed via driver settle, no BLOCKED
  re-raise.
- **B5:** 15 funerals — **10 full / 5 partial / 0 none** (r236: 10/4/1;
  r235: 12/4/1). Funeral feasts honest (1,500–7,500 kcal mended).
- **B6 GO** — 494 want-resolutions, deflected-from-stage-0 = 0.
- **CONFESS:** 25 total, 11 confessed, 5 already-confessed, 6
  deflected, 3 attacked, 0 double-confession sittings.
- **BOND ANSWERED** — 154 villager-initiated proposals (86 link, 68
  person; 51 accepted, 10 refused, 67 staged, 26 expired). Person
  accepted 27. End bonds per seed: 56 / 76 / 79 / 73.
- **F1/F3 watches:** not printed by this analyzer run (no F1/F3
  section in the analysis log) — NOT measured this run; carry the
  watch, do not claim a value.
- **F5 WILD CHECK — NOT COUNTED this run.** The three r225 variant
  texts were not re-located before closeout (the analyzer carries no
  settled-favor counter — the r236 caveat stands) and no count is
  claimed. The targeted harness stays owed; the sixth-thin-panel
  question is UNMEASURED, not 0.
- **DRY3 site-1 wild hold — PROVEN again:** the expedition ask ("What
  did you see out there?") was asked 6x on 45735 and the DRY3 fallback
  line ("Saw things with too many joints…") fired 1x with 0 dry lines.
- **DROPPED-THREAD: 0 drops** (532 conversations). **RE-OFFER max 12**
  (same watch level as r236).
- **SCATTERING: 1/4** (45736 d138, 5 hungry days, 1 alive).

## People check (full transcripts read)

- **Olivia (45736, D-talk-request, theft confrontation)** reads like a
  person cornered and then honest: deflects ("Ha. So you figured it
  out. Yeah, I took 2× Stick. What are you going to do about it?"),
  then answers a real question about regret — "I regret the ordinary
  days I rushed through. All those Melbourne, Australia mornings I
  spent annoyed at small things. I'd pay anything for one annoyed
  morning now." — and ends warmly ("Good talk. I feel like I know you
  a little better now."). Coherent arc, characterful voice. Sour note:
  the driver asks "Wait — what were we talking about?" three times in
  a row and gets the escalating resume prefixes ("Still on your
  regrets." / "Like I said — we're still on your regrets." / "We're
  going in circles — still on your regrets.") — the resume machinery
  works, but three identical re-asks in one sitting reads as the
  driver pestering, not the NPC repeating. Filed, not fixed here.
- **Zinhle trail talk (45733, joint outings d23–26)** — the new pool
  reads like trail talk, not a loop: haul-aware lines ("Between us we
  are carrying 270 kcal. Onward — there is more green ahead.", "Good
  weight in the packs — 270 kcal between us.") alternate with plain
  flavor ("The pantry is counting on us. Eyes on the ground, ears
  open.", "You walk well together. Zinhle keeps pace without a word
  wasted.") and the opener returns only after the pool is exhausted.
  The joint-press lines are honest too ("Zinhle holds up their share.
  'Look at that — 3× Dandelion for me, 3× Dandelion for you.'").
- **Adaeze (45736, grief resume)** — "We never finished talking about
  grief — we wandered off it. 'It's quiet at the hollow. Adaeze
  doesn't say much. Sometimes that's the whole point.'" The dropped-
  thread resume names the thread and the place honestly.

## Census

- 45733: Zinhle survives d142, 10 alive; 2 successions
  (Robin→Marco→Zinhle); 2 village fallen; 20 feasts, 0 moots.
- 45734: Hassan survives d140; 5 successions
  (Andres→Ashanti→Jolie→Salvatore→Lena→Hassan); 20 feasts, 3 moots.
- 45735: Sigrun's village lost d94 (scattered); 8 successions
  (Gloria→Sofia→Hector→Wanjiru→Kavya→Adrian→Aki→Ermek→Sigrun);
  14 feasts, 1 moot.
- 45736: David's village lost d138 (scattered, 1 alive); 8
  successions (Adrian→Diana→Sean→Kōwhai→Olivia→Owen→Aki→Noah→
  Gianna→David); 19 feasts, 3 moots.
- Scholar deaths (mantle passes): 23 panel-wide (2/5/8/8). No village
  won or ended.

## Telemetry

NOT run in-run (no time before the occurrence budget ended). Adoption
must run `telemetry-check.js` vs the social baseline before rolling
anything. r236 noted QUIET with the baseline NOT rolled (stale-era l3.*
keys the driver never emits — do not roll over schema drift without
adjudication).

## Gate

NOT run in-run (the ~29 min gate does not fit the remaining occurrence
budget after the four pilot iterations). Adoption must run it solo on
the branch tip: `node scripts/check.js --quick` with
`--cacheDirectory=/tmp/jest-cache-playtest2`. Expect the standing set
(r236: measurement-proof staleness pair, stale phone-frame receipt,
ladder-bundle ambient-raid control, measurement-cache-flags 0/4 load
artifact, 7× 120s timeouts under load — standalone re-run any timeout
before attributing). The r237 change is driver/tooling only (no src/js
change), so no measurement-proof refresh is owed by this run.

## Metric review

- **TRAIL bar:** MET for the first time (max recurrence 3, distinct 8).
  The bar as written (≤4 per seed) is now PROVEN reachable — but note
  it measures across-outing repeats, which the design allows (pool
  resets per outing). A future bar could count within-outing repeats
  only; the current bar stands as written.
- **F6 bar (0 dry panel-wide) is MET for the third time** (r226: 21 →
  r231: 4 → r234: 4 → r235: 0 → r236: 0 → r237: 0). The per-site patch
  program is holding; the sayLine choke-point question stays closed
  ("sites were the whole story") unless a new site appears.
- **M4 split:** the near-dup count (152) is still dominated by
  instructional lines (Haven-door cluster + live-want re-asks + teach
  templates + creek-water re-asks). The split proposal stands for the
  next run.
- **F5:** NOT COUNTED this run (variant texts not re-located; analyzer
  has no counter). The targeted harness stays owed; the next run must
  either locate the r225 variants or build the harness — a seventh
  "thin" claim without a count is not a measurement.
- **OUTING-SEEK bar:** the binary pilot bar (≥1 full outing) was MET
  twice over (David d52, Zoltan d55). The panel adds: 6 kept out of 33
  attempts — the attempt-to-kept conversion (18%) is the next
  measurement, not this run's bar. The Zinhle creek-pocket strand
  (hops-exhausted / no-closer-target) is the known failure mode.

## Verdicts

- **Reachable:** yes — invitations, bonds, moots, funerals,
  confessions, joint outings, and the full want arc all fire across a
  full run; outings now complete end-to-end in the wild.
- **Fun:** mostly — villages read like people, wants survive across
  sittings, the dry line is silent for the third panel in a row, trail
  talk is varied and haul-aware, but the instructional repeats
  (Haven-door, accept-first, creek re-asks) still nag and one
  creek-ringed pocket strands an outing for days.
- **Winnable:** not judged on this leg.

## Remainders

- F5 targeted harness (owed since r231 — unmeasured this run, not 0).
- Zinhle creek-pocket strand (hops-exhausted / no-closer-target):
  an outing can get geographically stuck when the return route is
  creek-blocked on every nearer target; the hop rules may need lateral
  (non-closer) moves or the game may genuinely strand it — needs a
  design look, not a driver tweak.
- M4 split (instructional vs conversational) — proposal for next run.
- Olivia triple "what were we talking about?" — driver re-ask
  pestering in one sitting (resume prefixes work; the driver asks
  three times). Minor, filed.
- repay.engageBeat broken/open pools (same class as F6, unobserved);
  all-3-blocked F5 residual (r226).
- Proof refresh round 21 (measurement-proof pair fails on any src/js
  change until refreshed) — NOT owed by this run (no src/js change).

## Adoption closeout (2026-11-19 ~00:40Z, adoption worker)

- **Claims re-verified from the files, not re-run:** outing attempts 33 / kept 6 / trail-talk presses 14 / delivered kcal 2,990 (incl. the late Zinhle 135) — recounted from the per-seed JSONs; TRAIL distinct lines 8 panel-wide, max recurrence 3/0/1/2 per seed — recounted; F6 dry-line grep 0 on all four JSONs; M6 GO (re-aligned) + M11 0/152 in the analysis log.
- **Gate (adoption, solo, branch tip): `node scripts/check.js --quick`
  — 339 passed, 5 failed in 1073s, 0 attributable. Log:
  `evidence/2026-11-18/journey-social-life-r237-gate-adopt.log`.**
  The 5: measurement-proof staleness pair (standing, pre-existing —
  no src/js change this run; refresh is round 21, not owed here);
  phone-frame stale receipt (standing, pre-existing); living-garden +
  one-person-army deed-attainment 120s timeouts — BOTH re-run solo
  and PASS (exit 0), proven load artifacts. **Notably absent vs r236:
  the ladder-bundle control PASSED (79/79 solo, incl. the "200
  monster turns WITHOUT delivery fire the ambient raid" control) — the
  ladderbase-cause-a fix holds on this base; the cache-flags test also
  passed this run.**
- **Telemetry (adoption):** `telemetry-check.js` vs
  `telemetry-baselines/social.json` — LOUD on all five l3.* metrics
  (baseline → current 0). Adjudicated as the KNOWN stale-era schema
  drift (r231/r234/r235/r236 precedent): neither the r236 nor the r237
  JSONs contain any `l3.*` key; the driver emits `bondEnd.bonds` /
  `social.moots` instead. Continuity under the current schema: bonds
  284 (r237) vs 333 (r236), moots 7 vs 9 — same order, no collapse.
  **Baseline NOT rolled.**
- **Remainders — still owed, filed in the run note above:** F5
  targeted harness (owed since r231; seventh thin panel if counted
  again — UNMEASURED, not 0); Zinhle creek-pocket strand (design
  look, not a driver tweak); M4 split proposal; Olivia triple
  re-ask; repay.engageBeat pools; all-3-blocked F5 residual (r226).
  None built or filed elsewhere by this adoption — they stay owed for
  the next run.
- **Infra note:** the first adoption gate run was killed at ~18 min by
  a VM replacement (service restart, SIGTERM; /tmp wiped with its
  log). Re-ran cleanly after the reboot; the gate log was kept in the
  goal hidden_files and copied into evidence. First heartbeat blocked
  ~7.5 min on REGISTRY.lock held by the Lane A scale registration —
  landed once the register finished; re-heartbeated through the run.

## Adoption handoff (read first)

Worktree `journey2-5` (branch `journey2-5`, base `519653e29`), ALL
UNCOMMITTED: prereg + driver + analyzer + per-seed JSONs 45733–45736
+ pilot/panel/analysis logs + this note (evidence/2026-11-18/).
Nothing is stashed. Steps: (1) heartbeat the tree; (2) gate solo
(`node scripts/check.js --quick`, cache /tmp/jest-cache-playtest2,
expect the standing set — re-run timeouts standalone before
attributing); (3) telemetry check vs the social baseline; (4) commit
via the worktree's own `scripts/safe-commit.sh` (watch for the index
clobber — repair via `git ls-tree -r HEAD` + update-index, verify by
hash-object); (5) rebase onto current master, re-run the r237 proof
(driver is deterministic — the panel should reproduce); (6) ff-only
merge in the main tree; (7) release the tree + remove worktree/branch;
(8) rotation-b 5→6 with read-back; (9) delete
`playtest-loop-2.lock` after verifying run_id
`2026-11-18T22:55:25Z-loop2-leg5`. The gate is the only unproven
step; the driver change touches no src/js, so the gate should show
only the standing set.
