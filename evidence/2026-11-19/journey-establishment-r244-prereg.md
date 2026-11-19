# Journey leg ESTABLISHMENT — r244 pre-registration (2026-11-19, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214/r217/r221/r225/r230/r231/r232/r233/r240/
r241/r242/r243 precedent). Death-aware: stop after 10 consecutive all-dead daily
checks; never tick a dead village to fill the leg.

## Run
Run id `lane-a-20261119T204500Z` (scheduled Thu 2026-11-19 14:45 CST).
Rotation read `1` (establishment; r243 merged but never advanced the
rotation — this run's closeout writes 1→2 with read-back). Run number r244
(r243 is the last establishment run, 2026-11-19 ~11:54Z). **Base:** local master
`68b1f6370` at registration. Heartbeat loop running (9-min cadence,
detached loop, PID 26960). Pre-flight: main tree CLEAN (one stray untracked
152-byte sibling check log moved aside to goal hidden_files, preserved),
disk 50%. **Stale-lock recovery:** none — no lock file existed at run start.
Worktree registration took 504s (registry-lock pile-up; reap took 469s the
same way). No push (ship loop owns pushes).

## Base delta vs r243's panel base `e1b6cc7d6` (src/js)
- `cf17e4dd6` journey-landing r148: moderator-mute guard
  (`src/js/conversation.js`, +12) + link-accept rotation by pool index
  (`src/js/bond-initiation.js`, +29, `LINK_ACCEPT_ROTATION`). **The base
  change to watch:** link-accept rotation changes which pool line is
  served when the first-unledgered pick would repeat the last served
  line for that `how` — behavior-adjacent to Q1/Q5 link-accept lines.
  The r243 link-accept proof (61/61) is re-run on this base, plus the
  r148 rotation proof (3/3). The moderator-mute guard is conversation
  machinery; any dry-line change it causes is read by the Q1/Q2 watches.
- `26772ac93` journey-endgame r249: doubled-'The' fix in a villager
  scream + waiting-outing note (`src/js/game.js`, 2 lines). Narration
  only; no establishment-window effect expected.
- `ef1c81094` sim-bowcraft-a: BOWCRAFT fix for finding #2597 — serve
  ranged-less villagers + seed bow knowledge from seeing
  (`src/js/villager-build.js`, +78). **Env-gated** (`BOWCRAFT=1`, node
  sims only; unset = the old behavior, byte-identical). This driver does
  NOT set it — no panel effect by construction.
- `baba35e87` journey-deepening r244: F8 confide-line secret gate
  (`src/js/favor-outing.js`, 2 lines). Conversation-adjacent (secret
  gating on confide lines); any Q1/Q2 movement is read by the watches.
- `17bb496df` version-bump stamp only.
- Everything else in range: evidence/scripts-only landings
  (launchfunnel-b, dmgshape-b, partysurvive-b, slingstone-a,
  fusioncell-a, arrowsupply-a, bowsource-a, scale r245, succession
  r248, deepening r244, endgame r249, social r239, winnability
  rounds). **No `convo-wants.js` change, no want-raise-floor change**
  — the r242 F1 floor finding is still with the build arm, unacted
  on in this base (r243 CLOSED the floor question on its band;
  this run reports the spread, does not re-fire). **None of the
  above touches the settled-ledger favorless-ask mechanism, the
  sitting-close machinery, or the freeloader pipeline** except the
  r148 link-accept rotation (watched, proofed). Q1/Q1b/Q2/Q5 bars
  carry verbatim from the r243 prereg except the pre-registered
  revisions below.

## Leg question (r243's named next steps, first)

**Q1 FAMILY RE-READ — the favorless-ask mechanism on a fresh band
+ the r243 metric-review analyzer fixes (END + STRANDED denominators)
+ the F2 scholar-death watch, third panel + the counter-label watch
RE-SCOPED to COUNTER LEARNED say lines + the senseexped launch watch
+ the wave-4 / standing watch.**
1. **Q1 SEVENTH FRESH-BAND RE-READ.** r231 13/82 (15.9%) → r232 2/77
   (2.6%) → r233 1/53 (1.9%) → r240 1/70 (1.4%) → r241 1/55 (1.8%,
   class C 1/1, never surfaced) → r242 2/70 (2.9%, E1 2/2,
   stage-0-surfaced 2/2, LOST 0) → r243 2/53 (3.8%, E1 2/2,
   stage-0-surfaced 2/2, LOST 0). Same trace + classifier as
   r232–r243 (read-only probes; classes A–E verbatim; widened LOST
   trigger from r242). Thresholds verbatim from the r243 prereg:
   GO = rate <20% AND zero stage-0 wants resolved 'deflected' AND
   every favorless sit classified; NO-GO = rate ≥32.8% OR any
   stage-0 want resolved 'deflected'. LOST asks reported separately
   (each a defect finding, documented + proposed, not landed).
2. **ANALYZER DENOMINATOR FIXES (r243 metric review §1–2).** The
   r244 analyzer counts END opportunities qualifying-only (the
   denominator excludes excluded-tail, never-ready / condition-(c)-
   unmet, and bearer-changed runs — the r243 print 11/12 read 11/11
   true) and prints STRANDED social sits against DISTINCT stranded
   days with the entry count alongside (r243 printed 11/13; true
   11/11 days, 13 entries). Fork-proven on the r243 corpus BEFORE
   the panel (see Instrument proof): every old-bar number reproduces
   exactly; only the two fixed denominators move.
3. **F2 SCHOLAR DEATHS (r242: 6/5, r243: 3/5 — third panel).** Same
   rule: ≤2 per 5-seed panel = WATCH (report causes + last-dawn
   locations); ≥3 = investigate. r243 causes: Maricela d8 (the
   wild), Rosa d30 (the night), Jorge d37 (the night) — all three
   last dawn at (4,4), atHaven=true, insideHaven=false, the same
   home-tile shape as r242, now with the "the night" label. The
   finding stands as a named open item for the goals arm (succession
   handover leaves the new scholar outside the node, exposed before
   they can act); this run reports the count + causes, adjudicates
   base-effect vs band noise, proposes nothing to land unilaterally.
4. **COUNTER-LABEL WATCH, RE-SCOPED (r243 metric review §6).** The
   r243 watch was NO-OPPORTUNITY on sitting transcripts (0 counter
   mentions in 5 convo files, tele counter_discovered 14–21/seed).
   This run judges the r246 label where counter prose actually
   appears: the driver captures every COUNTER LEARNED say line
   (`counterLines`, read-only scan of the already-captured say
   lines) and the analyzer checks the label. Finding = a label that
   is a raw prose-clause descriptor: contains ", " or " — " or runs
   longer than 45 chars (the guarded 'something' and real names
   have none of these; the known bad shape is "the creek went
   still, and your arm-hairs stood up"). A prose-clause label is a
   defect finding (documented + proposed); guarded/proper-name
   labels are reported as counts.
5. **SENSEEXPED LAUNCH WATCH.** With the launch-party sense fix
   in, does any party-launch signal appear in the telemetry
   type-count map (r241/r242/r243: zero)? Any launch is named with
   its seed/day/party shape; a launch that kills a wave-4 beast is
   reported as a base-effect, not a panel finding alone.
6. **WAVE-4 / STANDING WATCH.** r242: 3/5 wave 4, standing to 160.
   r243: 0/5, standing to 70 — adjudicated band noise (nothing in
   the r243 base delta touched the wave-kill chain). This run
   reports wave reached + standing per seed; a matched-band A/B is
   still owed before any claim about the wave-4 door. The r148
   link-accept rotation and the r244 F8 confide gate are the only
   base changes near the social chain; neither touches the
   wave-kill chain.
7. **F2 ECHO WATCH (carried).** With the r243 echo fix in (r242
   base), expect 0 acceptance echoes in the people check; a
   sighting is recorded for the conversation build arm with the
   transcript.

## Bars (verbatim from the r243 prereg unless revised below)
- **Q1b WANT-RAISE:** GO = panel raise rate ≥10% AND no seed with
  0 raises. r243: 53/332 (16.0%), per-seed 14/68, 14/55, 8/78, 9/71,
  8/60. Report kinds (forage_help / heal_help / sick_help /
  food_share / water_haul / no-kind).
- **Q2 SITTING CLOSES:** GO = 0 cut sittings (mechanical half:
  engine-ended + 0 beats after last THEM + no closing line; the
  open-question half is a human read). WATCH 1–2 (read in full);
  NO-GO ≥3 or any cut ending on an open question/invitation.
- **Q3 RECAP PARAPHRASE (report-only):** distinct <6 report-only;
  ≥6 a second formulation is owed. Carried canned-line watch
  (pod-dream, recap stitch, slope-reading, walked-in, take-it,
  stew-bowl, pod-dream-open). r243 distinct: 0 of 10 (raw 0).
- **Q6 POLICY FORAGING (report-only):** per seed, scholar
  bumpCalls vs wedgeSits vs joint forage_help commits. F4 shape =
  bumpCalls ≤2 AND wedgeSits ≥50. r243 per-seed: 16/76/3, 34/64/5,
  38/79/1, 50/81/4, 19/66/4. No F4 shape (min bumpCalls 16).
- **SPOTTER:** panel foodXp['spotter'] total ≥10 AND every panel
  seed contributes >0. r243: 45 total, 5/5.
- **LADDER (report-only under a SPOTTER GO — pace read):** ≥1
  villager reaches 5 XP on ≥4/5 seeds. r243: 4/5 PASS (per-seed
  8/10/4/18/5).
- **FASTER-ID:** threshold benefit fires on ≥2/5 seeds. r243: 5/5
  (112 benefit plays in 157 bump calls).
- **END (standing bar, REVISED denominator):** every broken-live
  forage run that broke ≥2 days before the run's end, bearer is the
  player, ending status ready on ≥1 dawn after breaking, is closed
  by the wedge within 2 dawns of breaking. GO = every QUALIFYING
  opportunity closed within 2 dawns (excluded-tail, never-ready,
  and bearer-changed runs are not opportunities and do not enter
  the denominator). r243: 11/11 qualifying (printed 11/12 under
  the old counting).
- **STRANDED (carried watch, REVISED print):** previous-bearer runs
  in strandedLog with 0 work performed. Social sits are printed
  against DISTINCT stranded days with the entry count alongside.
  r243: 13 entries / 11 distinct days, 1 run, worked 0, guard 0,
  social sits 11/11 days, misses 0.
- **TRAVEL / THREAD branches (carried watch):** homeward sits on
  a clearable blockage reach home the same dawn; paged (Yara-shape)
  end opportunities close within 2 dawns. r243: TRAVEL 0/0,
  THREAD 1/1.
- **TRUST GUARD (hard, DROP-ONLY):** trust[vid] must not drop
  across any end press. Any drop = defect finding. r243: 0 drops.
- **JAM (report-only):** jam-days = dawns with a promised run
  while a broken-live run was live. r243: 0.
- **VILLAGE:** alive at d40 on ≥3/5 panel seeds. r243: 5/5.
- **PEOPLE CHECK:** PASS/FAIL on 2 held convos from one panel
  seed, read in full (meaning, coherence, consequence — not
  counts). The r241 dry beat ("The moment passes without landing.
  Not yet.") is watched: a third serving is recorded for the
  conversation build arm.
- **WATER INSTRUMENT (report-only):** broken-live water runs seen
  across the panel.
- **ROSTER-RECONCILIATION WATCH:** 0 unaccounted on all panel
  seeds, departures logged and matched by id, the how named per
  departure. r243: 0 unaccounted.
- **CODEX (report-only):** plants per seed. r243: 131 total.
- **SCHOLAR-DEATH STANDING METRIC:** see leg question §3.

## Q4 — census (plain words)
Five villages played (pilot + 4-seed panel): who lived, who died,
what they knew, what was missing — in plain words. Census records
per-villager `spotterXp`; village knowledge is measured by
codexPlantsEnd + per-villager spotter XP. Report party launches
and wave-4 kills per seed, standing totals at end per seed (r243:
0/25/70/20/25; wave 4 tracks standing 100, t4=100 — re-check the
split on the fresh band), and the scholar's last-dawn location for
every scholar death. A full telemetry type-count map is recorded
at end (read-only) so a launch/kill signal can be named if
telemetry records it.

## Seeds, policy, horizon
Pilot: **101901**. Panel: **101902–101905**, 42d horizon. Policy:
competent (r85/r136/r137/r138/r139/r210/r213/r217/r221/r225/r230/
r231/r232/r233/r240/r241/r242/r243 driver shape — no withDelegate/
HUNTSTAFF flags). Death-aware tail +10d. Driver clone is verbatim
r243 except run number / seed band / output names + header comment
+ the counterLines instrument (read-only capture of COUNTER LEARNED
say lines). The analyzer is the r243 analyzer verbatim except run
number / file names / the Q1 + Q1b + Q1c + Q3 + Q5 comparison lines
(now vs r243) + the END + STRANDED denominator fixes + the counter
watch. Proof tests re-run in this worktree to confirm the
mechanisms still hold on the new base: r240 walkHome 27/27, r231
settled-help 19/19, r230 stage0-help 13/13, r225 stage0-cant
18/18, r214 mood-goodbye 10/10, r139 spotter 35/35, r221
want-raise 7/7, r137 clearhome 37/37, r146 want-bridge, r243
link-accept 61/61, r148 link-accept rotation 3/3 (new base-delta
guard), r147 maps-pools. New proof test only if a defect is found.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 101901–101905 is FRESH.** Full-scope search performed
  2026-11-19 ~21:00Z before this prereg: filesystem grep over
  `evidence/*/journey-*-prereg.md` (all dates) for `10190[1-5]`:
  zero hits. Filesystem grep over `evidence/*/sim-*-prereg.md`
  (all dates): zero hits. Filesystem grep over ALL `*prereg.md`
  under `evidence/`: zero hits. Evidence filenames for `10190`:
  zero hits. Goal hidden_files names for `10190`: zero hits.
  `git log --all --oneline --grep=10190`: zero hits.
  `git log --oneline --grep=101901`: zero hits. The 1019xx range
  is named in no earlier prereg, forbidden list, contaminated list,
  screen, or extension band checked. (One attempt at the full
  `git log --all --grep` hung on index-lock contention and was
  killed; the bounded re-run above completed with zero hits.)
- Rejected bands (carried): 100901–100903, 100601–100605,
  100701–100705, 6301–6305, 6401–6405, 6501–6505, 101501–101505
  (retired-ambiguous, r241).
- Contaminated bands NOT reused (r243 list carried, plus r243):
  101201–101205 (matched-band release SPENT after r232 — forbidden
  again for any other question), 101301–101305 (r233, just used),
  101401–101405 (r240, just used), 101601–101605 (r241, just used),
  101701–101705 (r242, just used), 101801–101805 (r243, just used),
  1502, 1504, 1603, 1604,
  17101–17112, 1142–1151, 1801–1804, 1901–1916, 2001–2010,
  2101–2116, 2201–2216, 2301–2316, 2401–2416, 100001–100008,
  1200–1209, 2501–2516, 2601–2616, 2701–2705, 2801–2805,
  2901–2905, 3001–3005, 3101–3105, 3201–3205, 5001–5005 (r139),
  5101–5105, 5201–5205, 5301–5305, 5401–5405, 5501–5505 (r210),
  5601–5605, 5701–5705, 5801–5805, 5901–5905, 6001–6005,
  6101–6105, 6201–6205 (r213 rejections), 100501–100505
  (r213/r214), 100801–100805 (r217), 101001–101005 (r221),
  101101–101105 (r225).

## Instrument proof (before the panel)
- Analyzer fork proven on the r243 corpus BEFORE the panel
  (r243 JSONs + convo txts copied to
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/r244-analyzer-proof/`,
  renamed to r244 names; logs `r243-baseline.log` + `r244-fork.log`
  in the same dir — NOT /tmp, which a sibling cleanup wipes):
  the re-run r243 baseline reproduces the committed r243 analyzer
  log exactly (diff clean modulo per-seed lines), and the r244 fork
  reproduces every old-bar number exactly — Q1 2/53 E1 2/2,
  stage-0-surfaced 2/2, LOST 0; Q1b 53/332 (16.0%), per-seed 14/68,
  14/55, 8/78, 9/71, 8/60, F5 shape absent (thin 10.3%); SPOTTER 45,
  5/5; LADDER 4/5; FASTER-ID 5/5 (112/157); END 11/11 (was 11/12
  printed — the denominator fix); VILLAGE 5/5; Q2 0/10 CUT; Q3
  distinct 0; Q6 per-seed numbers exact (101801: 16/76/3; 101802:
  34/64/5; 101803: 38/79/1; 101804: 50/81/4; 101805: 19/66/4);
  scholar deaths 3; STRANDED 13 entries / 11 distinct days,
  social 11/11 (was 11/13 printed — the denominator fix). The
  fork changes no scorer logic for the old bars.
- NEW lines on the old corpus (expected, not a fork break):
  COUNTER LABEL WATCH — 0 COUNTER LEARNED lines (the r243 JSONs
  carry no `counterLines` field; the instrument is unfired on the
  old corpus, proven structurally by the driver's dayLines scan
  and exercised by any panel seed with a counter discovery).
- The pilot seed exercises the instruments directly: standing
  totals present at end, `scholarDawns` recorded per dawn,
  teleTypeCounts present, mootLines + caseLog present in the JSON.
  (Scholar-location-at-death fires only on a scholar death; if
  the pilot has none, the instrument is proven structurally by
  the per-dawn records, and the death-reading is exercised by any
  panel seed with a scholar death.)

## Canon
docs/CANON.md read at run start. docs/CONVERSATIONS.md is the Q1/Q2
area (energy budget + natural ending signal; "Tell me more." depth;
no-repeat ledger; recap reframes are grammar, not content).
KNOWLEDGE.md laws binding the spotter question: "Human skills ≠
alien abilities" (spotter is earthly knowledge — practice earns it,
never a System slot); "identification happens BACK AT CAMP". **No
canon doc covers the favorless-ask mechanism, want-raise rates, or
seed selection rules** — said here instead of inventing canon.
ENCOUNTER-GEAR RULE (Steve 2026-11-13): the journey driver plays
the live village state (real gear/progression, competent policy),
not a staged solo-scholar fixture — same as r137–r243; proof tests
stage for the mechanism only, not a combat fixture.

## Context arriving mid-run (not this run's scope)
Standing design questions unchanged: gating recalibration proposal,
answercourt cost, richer layered medicine design (holder-less
levers, build-medicduty-h), wave-4 kill A/B + companion-guard A/B
(sim lane), family 7 UNMEASURED. **Landing r145 F1/F2 are NOT this
run's scope** (door-skip lives in the competent policy, not the
game — this run only measures its panel effect). This run does NOT
take any of those builds. The panel's wound-fever/healer numbers
are reported as context only. **Q1c precedence and the Q5
unmet-exile policy are design questions for the conversation build
arm** — this run measures them, documents them, and proposes
nothing to land unilaterally. The r240 walkHome axis-step
oscillation residual stays with the build arm (watch item). The
r242 F1 want-raise floor finding stays with the build arm (this
run reports the spread; the finding is not re-fired). The F2
scholar-death finding (home-tile succession exposure) stays with
the goals arm as a named open item. The counter-label fix's live
behavior is carried by its r147 proof test AND this run's re-scoped
watch, not by sitting transcripts.

## Pilot gate
Pilot seed runs first on the final driver; completes without crash
AND (≥1 people-check sitting is held OR game over before the check
with the skip note written — r240 metric-review revision) AND its
transcript is written AND the spotter instruments fire (≥1
bumpPlantFamiliarity wrap record AND ≥1 villager forage resolution
observed) AND the sittingCloses record is present in the JSON
(beatsAfterLastThem counted) AND wedgeSits carry pick wantIds on
VERBAL sits (nonverbal sits carry wantId null by design — the
nonverbal marker is the `nv:*` picks, NOT openThread — r242
metric-review revision) AND ≥1 wedge social sit carries the Q1
trace fields (fromSeed / seedFavorId / need / ledgerFavor recorded
at sit start) AND the rosterDepartures instrument is present in
the JSON (array, possibly empty) AND the r240 instruments are
present (standingEnd non-null, scholarDawns recorded per dawn,
teleTypeCounts present) AND the Q5 instruments are present
(mootLines array + caseLog array in the JSON) AND the Q5 exileLines
regex extension is present in the driver source (grep for "pull
weight"). If the pilot forces a driver or fix change, the panel
restarts on fresh seeds and the pilot seed is NOT scored — EXCEPT
that a driver change after the pilot on a FRESH band voids the band
only if the change is game behavior (instrument-only changes keep
the band, recorded in the run note); any src/js change forces a
fresh-band restart.

## Telemetry
Live baseline is the r132 BEFORE panel; r133–r139/r210/r213/r214/
r217/r221/r225/r230/r231/r232/r233/r240/r241/r242/r243 did NOT roll
forward. This run's panel is the r243 driver regime on a fresh
band — guardrails should stay quiet; any LOUD line is adjudicated
as band noise vs real bug BEFORE rolling the baseline forward.
Metrics: guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths (r135's set). The r243
checker hit the known schema mismatch (the driver never emits
`guardrails.*` fields, so the checker reads missing paths as 0) —
expected again, not a finding. NOTE: this run changes src/js only
if Q1/Q2/Q5 or the END BAR warrant a fix; a guardrail move on a
no-src-change run cannot be caused by this run's code — any LOUD
line gets adjudicated as band noise vs a pre-existing drift, and
the baseline is NOT rolled on a mismatch.
