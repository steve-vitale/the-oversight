# journey-scale r250 — PRE-REGISTER (lane A, leg 3 SCALE, playtest leg — no lever)

**Run id:** `playtest-20261122T1045Z` (lock run_id, parent-held).
**Run:** scheduled Sun 2026-11-22 04:45 CST (10:45Z).
**Rotation read 3 → leg 3 SCALE.** Closeout (rotation write 3→0, lock
delete, merge, release) is the PARENT's job after this coordinator's
report — do NOT touch the rotation file or the lock file in this run.
**Base:** local master `3d7a25427` at prereg time (journey-deepening r249
gate record; see base delta below).
**Pre-flight:** main tree clean (parent-verified at setup), disk 47%.
Worktree `journey-scale` registered by the parent; heartbeat loop
(pid 42941, 10-min cadence, log /tmp/hbloop-scale.log) alive; manual
heartbeat re-landed after every long step.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run. The muster + march steps are POLICY (the competent
player drives existing game verbs), zero `src/js` change unless the
one blank this run fills needs it — and then only that blank's fix.
**TEST WITH ENCOUNTER GEAR (Steve 2026-11-13):** the policy fights with
the party and gear the competent player has by the leg — the muster/march
steps are that policy, not a fresh-solo fixture.
**DELIVER OVER MEASURE (2026-11-01) + ROOT-CAUSE FIRST (2026-10-16):**
this is a PLAYTEST leg, not a lever round. The sub-cap lever is NOT
re-run (r245 judged it PARTIAL; composition stays a branch). This run
plays the leg on current master and judges reachable/fun/winnable.
**Time-box (stated up front):** hard stop ~13:45Z (3h from run start).
Single arm: 8 fresh seeds × 140d; each sim ~2.5 min, 2 concurrent. The
`--quick` gate runs right after the build commit.

## Standing context (read before scoring)

- **r249 scale (landed 2026-11-21 as 59339acbb):** Q1 PLAYTEST PANEL
  VERDICT QUIET — national 0/8, lesser seat priced 8/8, full seat 0/8,
  wave-4 kills 25, wave-5 faced 1/8, standing-199 stall 4/8 seeds /
  113d, survival 6/8, lived-days mean 127.1. Blocker taxonomy:
  FORMATION-FEW 4, FORMATION-LATE 1, COLLAPSE 2, SNAP 1. The wave-4
  fight slide continues (231 → 168 → 101 → 62 across r246–r249) while
  kills hold (27/31/23/25) — fewer ENCOUNTERS, not weaker fighting;
  a WATCH item for this run. Blanks filled: owed-walk fix
  (betrayal.js — a fever-vetoed accepted walk is owed and re-offered)
  + march route-around (driver policy — COMPETENT_ROUTE_AROUND=1 for
  the march walk only; r249's 103927 sat 28 days blocked at (4,4)).
  **Note:** r249's run note was never committed to the repo — it lives
  only at goal hidden_files/evidence/2026-11-21/journey-scale-r249.md.
  This run's note is committed in the worktree per the task.
- **r248 scale:** QUIET — national 0/8, lesser 8/8, full 0/8, w4 kills
  23, w5 faced 2/8, stall 4/8 / 52d, survival 5/8. Blank filled:
  raise-opener variety by lore-how (bond-initiation.js).
- **r247 scale:** QUIET — national 1/8, lesser 8/8, full 1/8 (first
  on the control policy since r244, via the TRADE road, seed 103892),
  w4 kills 31, w5 faced 1/8, stall 4/8 / 192d, survival 6/8. First
  field wave-5 kill on the scale leg (103894, d120). Blank filled:
  settled-help names the favor.
- **r246 scale:** QUIET — national 0/8, lesser 8/8, full 0/8, w4 kills
  27, w5 faced 2/8, stall 1/8 (15d). Blank filled: want-menu react
  wind-down (convo-wants.js).
- **Deepening r249 (landed 2026-11-22 as efd5f4273):** Q1 growth-line
  GO 14/14; FIRST wave-5 kill in the deepening series (105073, party
  of 5, 1 death) vs the solo scholar facing 4× and killing nothing
  (105071); PLANWAKE ignites on 8/8 seeds but departures are only
  pairs/solos (trios=0, quads=0) — the launch question is now party
  SIZE, not ignition; march-flee returned (2 fled at full 700 HP with
  10–11 blades) while arrived-no-fight is fixed (held={} panel-wide);
  coalition-reach worst in series (reached10=1, stuck79=7; 105076 sat
  at 9 blades 44 days); closing-line duplication 6th sighting (2/3 in
  the read sample). Hands the scale leg three things — see below.

## Base delta vs r246's base `0d925556a` (src/js, 17 files, +2020/−163)

Live behavior changes (from `git log 0d925556a..3d7a25427 -- src/js`):
- establishment r265 (`52bbec5e6`): **PLANWAKE** — win-plan ignites on
  establishment [needs-eyes]; BEARER-END + DEPARTCOUNT.
- searvoice-a (`b5fb12e10`): searcaster volley reads as a gun, not a
  bow [needs-eyes].
- scale r249 (`59339acbb`): owed-walk fix (betrayal.js) [needs-eyes];
  march route-around is driver policy, not src.
- profilegate-b (`84e57fcc3`): scoped profile-gate relaxation for
  wave-4+ plan holders (GO) [needs-eyes].
- departbeat-b (`e5c8b4633`): ordinary wave-4+ departure beat,
  default-ON.
- crisis r262/r263 + landing r152: stuck-key flee counter (monster+
  day), sitting-favor settled-closer gate, namebeast opens the
  just-told beast, settled re-ask names the favor.
- downedtwice-b (`f11b30882`): downed ally re-targeted fix.
- reseedbeat-b (`9145db1ef`): expired-plan re-seed launch beat.
- succession r262: M12 escalator cap fix, staged witness sitting.
- doorflee2-b (`4266e6cce`): leader-survival-only hold.
- hypofloor-b (`4681e740f`): hypo floor, env-gated OFF (no live change).
- Reverted levers (instrument + evidence only, game code back to base):
  M1RANGE, SHAPE2, M2STEP2/DEPMAT substrate, LEADSIDE, fiberfetch,
  evade, ammo, tier4access, tier4gate, holdersupply. Net-zero arms:
  crossvoice-a (narration), d3refreeze-b, launchstate-b, killloot16-a.
- Largest diffs: win-plan.js +607 (PLANWAKE), game.js +438 (substrate
  re-lands + reverts), fieldFights.js +424 (downedtwice, doorflee2,
  hypofloor substrate), contests.js ±110, conversation.js +86,
  convo-dialogue.js +82, villager-agency.js +79, villager-brain.js +69,
  bond-initiation.js +69 (raise-opener variety).

## Deepening r249 handoffs (the three things this run must answer)

1. **Standing-199 reconciliation — RESOLVED IN CODE, NAMED HERE.**
   Deepening r249's daily trace showed 0 days at exactly 199 while its
   end deed snapshot still showed 199 on 2 seeds (105076, 105078).
   Root cause, read in `src/js/standing.js`: the two measures call
   DIFFERENT functions. The daily trace reads `villageStanding()` —
   the raw live total (war + diplomacy + plenty). The deed snapshot
   reads `villageStandingTotal()` — the GATED number the wave gate
   reads, which holds at t5−1 = 199 while the plenty cap binds or the
   combat-readiness deferral binds (veterans 2 / armored 4 / armed 6 /
   tricks 3 for wave 5), and ratchets monotonically once released.
   Verified on the deepening corpus: 105076 deedLog 199 on d70/85/100
   while the trace on those SAME days reads 322/245/270; 105078 deed
   199 on d100 vs trace 215; 105071/105073 agree exactly on every deed
   day. Both measures are correct readings of different functions, and
   the stall is real: the gated total parks at 199 while raw standing
   moves through and past it. **The scale leg's stall finding uses
   phantomDays5 ONLY** (vetbar shadow5 > r5 days — the readiness gate
   holding the village at the t5−1 cap, the same gate seen from the
   vetbar side). The scale corpus carries no daily standing trace and
   no deedLog standingTotal, so it cannot reproduce the deepening
   discrepancy — and it does not need to: the discrepancy is resolved
   in code, not in data.
2. **Party-size launch question.** Deepening's first wave-5 kill came
   from a party of 5 while win-plan departures were only pairs/solos
   (trios=0, quads=0). This run reports wave-5 fight party sizes and
   win-plan departure sizes on the scale leg (Q2).
3. **March-flee watch.** March-flee returned in deepening (2 fled at
   full HP) while arrived-no-fight was fixed. This run watches march
   outcomes on the scale leg (Q3).

## Seed-band freshness

- **Band: FRESH 106259–106266. Probe seed: 106267 (fresh, reserved;
  run as an unscored extra only if time allows — the scale analyzer
  scores the 8 panel seeds).**
- **Collision (recorded so the next worker does not repeat it):**
  first choice 106001–106008 is TAKEN — the sim-rage-setup-a pilot
  band (2026-11-18), named in evidence/2026-11-18/sim-rage-setup-a-
  prereg.md:204-205 and reused in sim-freestrike-b / sim-ragepreempt-b
  preregs plus scripts/analyze-ragepreempt-b.js and
  scripts/test-ragepreempt-b.js. The r250 driver/analyzer/test were
  first forked onto that band and have been re-pointed to 106259–
  106266; the "FRESH 106001-106008" claim in the forked header was
  wrong and is corrected here and in the files. Do not reuse 106001–
  106008.
- Searched (freshness subagent, read-only): all dated preregs
  (evidence/*/journey-*-prereg.md + evidence/*/sim-*-prereg.md, every
  date dir) whole-word; evidence/**/*.md generally; scripts/**/*.js;
  docs/; goal hidden_files/**/*.md — **0 hits** for any of
  106259–106267. The 106xxx region is densely used up to 106258
  (named ranges run essentially continuously 106001–106258); the next
  clean gap is 106259–106300, so 106259–106267 is the first full
  9-block above 106009. (Scope note: giant JSON corpora not grepped —
  data files, not seed namings; the prereg/script evidence above
  establishes the collision independently.)
- **Collision record (do not reuse):** 103801–103808 and 103811–103818
  reserved (r242); 103821–103828 and 103831–103838 spent (r239);
  103841–103848 spent (r242); 103851–103858 spent (r243); 103861–
  103868 spent (r244); 103871–103878 spent (r245); 103881–103888 spent
  (r246); 103891–103898 spent (r247); 103901–103908 spent
  (launchparty band, Nov 18); 103911–103918 spent (r248); 103921–
  103928 spent (r249); 106001–106008 spent (sim-rage-setup-a pilot,
  Nov 18).

## Pre-registered questions

- **Q1 — THE PLAYTEST QUESTION (decides the leg verdict).** Can a
  competent village reach national standing / the table approach in
  days 80–140 on current master, and what blocks it? Single arm: the
  r244/r245/r246/r247/r248/r249 control policy verbatim (below), 8
  fresh seeds 106259–106266, DAYCAP 140.
  Binding metrics (§14): national reached /8, table offered (lesser
  seat priced) /8, full seat /8, wave-4 kills (killAttr w4total),
  wave-5 faced (seeds with fightsByWave['5'] > 0), standing-199 stall
  (**phantomDays5** — days the readiness gate holds the village at
  the t5−1 cap; the stall finding rests on this measure ONLY, per the
  reconciliation above), survival to 140d.
  **Interesting iff** ≥3/8 national, OR a new blocker class (outside
  the r245-observed set {TRUST-LOW, NATIONAL, SNAP, FORMATION-FEW,
  FORMATION-LATE, COLLAPSE, RUNG, UNKNOWN}), OR a fixable defect in the
  table-approach path. Else QUIET — the wall stands as measured
  and the finding is the blocker taxonomy.
- **Q1 stall split, ADOPTED REVISION (r249 metric review, §14).**
  The seed-level peak split (`maxR5 > 0` — a veteran who lived at ANY
  point counts the seed ready for ALL its stalled days) is INVALID as
  written: r249's per-day re-read found ready 0d / not-ready 113d
  where the seed-level split said 113d ready / 0d not-ready. This run
  splits stalled days by the day's own living-veteran count (r5 ≥ 2
  vs r5 < 2 on the stalled day itself), implemented in the analyzer
  (`stallReadyDays` / `stallNotReadyDays` from the vetbar daily rows;
  proof test cases (67b)/(68)). The seed-level line is still printed,
  labeled as the invalid peak-based reading, for continuity. The
  as-written stall total stays the binding Q1 metric; neither split
  is binding, so neither re-scores Q1.
- **Q2 — BLOCKER TAXONOMY (measurement, NOT a gate) + wave-5/party
  sizes (descriptive):** per seed, the blocker class for the 3rd
  seasoned link on the closest road (FORMATION-LATE / TRUST-LOW /
  SNAP / COLLAPSE / FORMATION-FEW / NATIONAL / RUNG / UNKNOWN), from
  the analyzer's carried section. Wave-5 in the scale window:
  faced/killed per seed, party sizes on wave-5 fights; does the
  party-of-5 kill shape recur; win-plan departure sizes (pairs vs
  trios vs quads vs 5+).
- **Q3 — REGRESSION GUARDS (fail the run):** r134 spoken-raise (0
  not-offered-spoken, ≥1 properly answered), vetbar 0 disagreements,
  trap-line 0 defect sittings, betrayal-sibling 0 defects, nod-loop 0
  breaches, lived-days per-seed mean within ±25% of the control **123**
  (r233's 8-seed mean), lesser seat priced ≥4/8. March-flee watch
  (deepening handoff 3): march fights fled at full HP counted; the
  wave-4 fight slide watch (231 → 168 → 101 → 62 across r246–r249):
  if this band doesn't recover toward ~100, the next run asks whether
  spawn/engagement changed on master. Coalition-reach (9-blade shape)
  reported descriptively.
- **Q4 — PEOPLE CHECK:** read 2–3 full transcripts from convo days
  90/110/130 in full, PLUS the nonverbal sittings AND all raise talks.
  Judge sense, not counts. Quote one specific transcript moment in the
  run note. Watch: closing-line duplication (6 sightings so far —
  count up), tell-me-more echo, searcaster-volley narration,
  departbeat, warn_you heed.
- **Q5 — CENSUS + spotter d90 + W5-INSTANCE.** Carried: w4
  fights/kills, banked veterans (2+), w5 unlocked/faced/killed,
  tribute states, survival. The wave-5 door question: did any village
  FACE the door (not just fight roaming wave-5 beasts)?
- **Q6 — DIALOGUE WATCH (carried):** the r249-recorded flat spots —
  the NV 3-nod cycle (My ×3; Somchai/Tariq walk-then-nod), the "come
  see what I found" payoff shrug (orphaned), orphaned invitations in
  raise talks (4/24), the r239 "tell me more" echo (returned in r249:
  2 hits), closing-line duplication ABSENT within sittings on the
  scale leg (0/17) but 3/17 transcripts with NO closing line at all.
  A dialogue-content fix belongs to this run only if it is a blank
  this run finds.

## Policy (frozen)

CONTROL (single arm): `scalecourt-traderoad-r113-linkraise-sit` + muster
ON + march ON (r244/r245/r246/r247/r248/r249 control verbatim) +
`MUSTER_HOLD=sitting` + `STAGE_CAPSTONE=off` + ANSWERMAIL off. Sortie
INERT. SIT false.
**Policy change vs r249 (the one control change, recorded here): the
march now routes around blockages** — COMPETENT_ROUTE_AROUND=1 for the
march walk only, restored after (r249's fix, taking effect this run;
r249's panel was measured WITHOUT it). No other policy change. No gate,
threshold, price, or bar changed — the march is policy, the competent
player driving existing game verbs.
DAYCAP=140, death-aware stop (+10d tail max). Seeds FRESH 106259–106266.
Pilot: seeds 106259–106261 first. Pilot gates: driver clean, no census
errors > 0, census rows present, reconciliation residual 0, teleOnly 0,
trustset rows by d60, national-gate rows present, vetbar rows by d60 —
else STOP and diagnose (INCOMPLETE, not a verdict).
**Panel note (disclosed deviation from §9 pilot economy):** the full
8-seed panel runs even if the pilot shows nothing interesting. Master
moved since r249 (deepening r249 + crossvoice + killrate + hypofloor
landings), the leg's blocker taxonomy needs 8 seeds, the standing-199
reconciliation is a live question, and the panel costs ~20 min. The
pilot's interestingness gates nothing except the instrument gates
above.

## Fix scope (pre-registered — the build is not scope creep)

- Driver (`scripts/journey-scale-r250-20261122.js`, cloned from r249):
  seeds 106259–106266, corpus tags r250, EVIDIR 2026-11-22, single arm
  B only. March route-around carried (r249 fix, now live). No other
  behavior change from the r249 control.
- Analyzer (`scripts/analyze-journey-scale-r250-20261122.js`): cloned
  from r249; single-arm (arm B only); PLAYTEST panel verdict carried
  (Q1 rule above). Q2/Q3/Q4/Q5 carried verbatim (paths r250). **Per-day
  stall split adopted** (see Q1 above); seed-level split retained,
  labeled invalid.
- Proof test (`scripts/test-journey-scale-r250-analyzer-20261122.js`):
  cloned from r249's; panel cases carried (single-arm playtest verdict
  INTERESTING / QUIET / INCOMPLETE shapes). New cases (67b)/(68) for
  the per-day split. **145 passed, 0 failed, run BEFORE the panel.**
- **One blank:** this run fills exactly one blank it finds (missing
  content / dead end / unfireable beat / senseless dialogue), with a
  proof test, or documents precisely why it cannot be fixed. No other
  `src/js` change. No lever, no gate change, no tuning.

## Metric review (carried)

- Q1's interesting-bar (≥3/8 national) is set against the r249
  control prior (0/8) and the r247 control prior (1/8): a single flip
  is noise; three is a movement.
- The lived-days control stays **123** (r233's 8-seed mean).
- The standing-199 stall metric is carried from r249: phantomDays5
  (vetbar shadow5 > readiness5 days) is the instrument's own record
  of the hold, read as stall days per seed — PLUS the per-day r5 split
  adopted above (the seed-level peak split is retired as invalid).
  The stall finding rests on phantomDays5 ONLY (see reconciliation).
- The vetbar duplicate-day quirk (r247: every seed records some days
  twice; stall total overcounts by ~1 day band-wide) is carried as a
  known instrument quirk; the metric is judged as written.
- Q2 is deliberately gate-free: the taxonomy is the finding.
- The wave-4 fight slide (231 → 168 → 101 → 62) is the carried watch
  item (r249 metric review): if r250's band doesn't recover toward
  ~100, the next run should ask whether spawn/engagement changed on
  master, not just record the slide.
