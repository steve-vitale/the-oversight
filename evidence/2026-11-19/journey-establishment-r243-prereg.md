# Journey leg ESTABLISHMENT — r243 pre-registration (2026-11-19, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214/r217/r221/r225/r230/r231/r232/r233/r240/
r241/r242 precedent). Death-aware: stop after 10 consecutive all-dead daily
checks; never tick a dead village to fill the leg.

## Run
Run id `lane-a-20261119T115425Z` (scheduled Thu 2026-11-19 04:45 CST).
Rotation read `1` (establishment, written by the r147 landing closeout
0→1); write `1→2` at closeout with read-back. Run number r243 (r242 is
the last establishment run, 2026-11-19 ~04:44Z). **Base:** local master `e1b6cc7d6` at registration (r147 landing merge
included — see Base delta; verified = worktree HEAD at registration). Heartbeat loop running (8-min cadence,
detached loop). Pre-flight: main tree CLEAN, disk 47%. **Stale-lock
recovery:** this run's opening act was the r147 adoption closeout — the
02:45 CST landing run died before closeout (lock
`2026-11-19T09:04:57Z-playtest-loop-a`, heartbeat last 10:11:11Z, no live
coordinator, no writes <15 min). Its maps-pool fix + proof test were
verified by the adoption run (ALL GREEN on original and rebased tips),
docs/ONTOLOGY.md restored from a flap truncation, evidence committed,
rebased onto master `385f07995`, gated, merged, tree released; rotation
0→1 written by that closeout. Full record: the r147 run note
(`evidence/2026-11-19/journey-landing-r147.md`, adoption addendum).
No push (ship loop owns pushes).

## Base delta vs r242's panel base `6b47e98b6` (src/js + policies)
- `e7bd782ab` journey-social-life r238: wild F6 dry fix at the repay
  opener (fallback structural-exempt) + F5 all-3-blocked fall-through
  in `src/js/conversation.js`; proof RED→GREEN, 45752 re-run 0 dry.
  Behavior-adjacent to Q1/Q2 (dry-line classes) — the dry-line
  watches re-read it.
- `eccc08af2` journey-endgame r246: counter-label fix + peakVet
  re-baseline 8→3 in `src/js/game.js`. The r147 landing panel
  verified the counter-label guard live (3 lines, all guarded noun
  phrases); this run carries the counter-label watch (a prose-clause
  descriptor naming a counter = finding).
- `97e78670d` sim-senseexped-b [GO]: launch-party sense reads the
  live expedition (`src/js/party-wiring.js`). **The base change to
  watch:** r242 recorded zero party launches in the telemetry
  type-count map; if a launch signal appears on this panel it is a
  base-effect to name, not a panel finding alone.
- `d3dcd1acd` journey-deepening r243: F2 titan refusal counts Haven
  blades (`src/js/titans.js`). Titans are later-window content;
  no establishment-window effect expected — reported if it fires.
- `b76d65445` version-bump stamp only.
- `4ea7686ea` journey-landing r147 (merged by this run's adoption
  closeout, just before registration): maps-pool expansion
  (`src/js/conversation.js`, compare_maps nonenew 2→6, shared 3→6);
  proof test ALL GREEN + RED-verified; panel dry lines 0 on r147.
  The Q1 dry-line watch re-reads it on the establishment window.
- Everything else in range: evidence/scripts-only landings
  (partyfunnel-a, freestrike-b, bowopen-a, scale r244, endgame r246
  evidence, deepening r243 analyzer/run note, fleshout evidence
  rounds). **No `convo-wants.js` change, no want-raise-floor change**
  — the r242 F1 floor finding is still with the build arm, unacted
  on in this base; this run reports the spread, does not re-fire.
  **None of the above touches the settled-ledger favorless-ask
  mechanism, the sitting-close machinery, or the freeloader
  pipeline.** Q1/Q1b/Q2/Q5 bars carry verbatim from the r242 prereg
  except the pre-registered revisions below.

## Leg question (r242's named next steps, first)

**Q1 FAMILY RE-READ — the favorless-ask mechanism on a fresh band
+ the F5 floor watch (finding with the build arm) + the Q5 moot-path
instrument with the same-day fix + the F2 scholar-death watch +
the senseexped launch watch + the counter-label watch.**
1. **Q1 SIXTH FRESH-BAND RE-READ.** r231 13/82 (15.9%) → r232 2/77
   (2.6%) → r233 1/53 (1.9%) → r240 1/70 (1.4%) → r241 1/55 (1.8%,
   class C 1/1, never surfaced) → r242 2/70 (2.9%, E1 2/2,
   stage-0-surfaced 2/2, LOST 0). Same trace + classifier as
   r232–r242 (read-only probes; classes A–E verbatim; widened LOST
   trigger from r242). Thresholds verbatim from the r242 prereg:
   GO = rate <20% AND zero stage-0 wants resolved 'deflected' AND
   every favorless sit classified; NO-GO = rate ≥32.8% OR any
   stage-0 want resolved 'deflected'. LOST asks reported separately
   (each a defect finding, documented + proposed, not landed).
2. **F5 FLOOR WATCH (r242 F1, with the build arm).** r233 thin
   5.8–6.2%, r240 CLOSED (16.4%), r241 RE-OPENED (6.6% vs 22.4%),
   r242 RECURRED a third time in four panels (thin 6.5% vs fat
   34.7%) → finding sent to the build arm. No floor change in this
   base. This run records the spread again (per-seed min/max);
   thin<7% while fat>15% a fourth time is reported as the finding
   still open, not re-fired as a new finding.
3. **Q5 MOOT-PATH INSTRUMENT, SAME-DAY FIX.** r242 answered the
   exile-warning question (5 exiles, all moot; HEARD 3, PRESENT 2,
   UNHEARD 0). Its metric review names the blind spot: same-day
   open+resolve cases are invisible (case_7 on 101703 never seen
   open). This run revises the analyzer: a convening line + a
   pronouncement naming the same people on the same day counts as
   a same-day case (path + verdict from the moot lines, not only
   per-dawn caseLog). A freeloader-path exile with NO warning line
   at all is still a silent-exile finding; an UNHEARD moot exile
   is still a finding. The freeloader-warning (d7) question stays
   open until a freeloader exile fires.
4. **F2 SCHOLAR DEATHS (r242: 6/5, INVESTIGATE).** Same rule:
   ≤2 per 5-seed panel = WATCH (report causes + last-dawn
   locations); ≥3 = investigate the wild-travel risk. r242 causes:
   101704 cascade (three scholars in two days, all "the wild",
   all waking on the home tile — succession handing each new
   scholar a doomed spot) and two "a stranger" kills at map-edge
   tiles. Referred to the wildavoid/flee-repair A/B; this run
   reports the count + causes, adjudicates base-effect vs band
   noise, proposes nothing to land unilaterally. The r242
   scholar-death count (6) is the comparison, not a bar.
5. **SENSEEXPED LAUNCH WATCH.** With the launch-party sense fix
   in, does any party-launch signal appear in the telemetry
   type-count map (r241/r242: zero)? Any launch is named with its
   seed/day/party shape; a launch that kills a wave-4 beast is
   reported as a base-effect, not a panel finding alone.
6. **COUNTER-LABEL WATCH (r246 fix, r147-verified live).** Any
   COUNTER LEARNED line naming the beast by a prose-clause
   descriptor (not a noun phrase) is a finding; noun-phrase
   descriptors are guarded by design (r147 read).
7. **F2 ECHO WATCH (carried).** With the r243 echo fix in (r242
   base), expect 0 acceptance echoes in the people check; a
   sighting is recorded for the conversation build arm with the
   transcript.

## Bars (verbatim from the r242 prereg unless revised below)
- **Q1b WANT-RAISE:** GO = panel raise rate ≥10% AND no seed with
  0 raises. r242: 70/347 (20.2%), per-seed 19/62, 25/72, 12/70,
  9/66, 5/77. Report kinds (forage_help / heal_help / sick_help /
  food_share / water_haul / no-kind).
- **Q2 SITTING CLOSES:** GO = 0 cut sittings (mechanical half:
  engine-ended + 0 beats after last THEM + no closing line; the
  open-question half is a human read). WATCH 1–2 (read in full);
  NO-GO ≥3 or any cut ending on an open question/invitation.
- **Q3 RECAP PARAPHRASE (report-only):** distinct <6 report-only;
  ≥6 a second formulation is owed. Carried canned-line watch
  (pod-dream, recap stitch, slope-reading, walked-in, take-it,
  stew-bowl, pod-dream-open). r242 distinct: 1 of 10 (raw 2).
- **Q6 POLICY FORAGING (report-only):** per seed, scholar
  bumpCalls vs wedgeSits vs joint forage_help commits. F4 shape =
  bumpCalls ≤2 AND wedgeSits ≥50. r241 101602 zero-commit shape
  (14 asks, 0 commits) did NOT recur on r242 (min 1 commit).
- **SPOTTER:** panel foodXp['spotter'] total ≥10 AND every panel
  seed contributes >0. r242: 36 total, 5/5.
- **LADDER (report-only under a SPOTTER GO — pace read):** ≥1
  villager reaches 5 XP on ≥4/5 seeds. r242: 3/5 MISS (bench is
  one person per village: Nathan 17 on 101703, Ruby 3, Paraone 1).
- **FASTER-ID:** threshold benefit fires on ≥2/5 seeds. r242: 5/5
  (118 benefit plays in 189 bump calls).
- **END (standing bar):** every broken-live forage run that broke
  ≥2 days before the run's end, bearer is the player, ending
  status ready on ≥1 dawn after breaking, is closed by the wedge
  within 2 dawns of breaking. GO = every opportunity closed
  within 2 dawns. r242: 11/11 GO (best yet).
- **STRANDED (carried watch, RELABELED per r242 metric review):**
  previous-bearer runs in strandedLog with 0 work performed.
  The analyzer label reads "no social sit — wedge working a live
  favor" when mode='work' sits exist that day (r242 101702 d35/d36
  adjudication), not "BAR MISS". r242: 20 dawns, 2 runs, worked 0,
  guard 0, social sits 18/20.
- **TRAVEL / THREAD branches (carried watch):** homeward sits on
  a clearable blockage reach home the same dawn; paged (Yara-shape)
  end opportunities close within 2 dawns. r242: TRAVEL 0/0,
  THREAD 2/2.
- **TRUST GUARD (hard, DROP-ONLY):** trust[vid] must not drop
  across any end press. Any drop = defect finding. r242: 0 drops.
- **JAM (report-only):** jam-days = dawns with a promised run
  while a broken-live run was live. r242: 0.
- **VILLAGE:** alive at d40 on ≥3/5 panel seeds. r242: 5/5.
- **PEOPLE CHECK:** PASS/FAIL on 2 held convos from one panel
  seed, read in full (meaning, coherence, consequence — not
  counts). The r241 dry beat ("The moment passes without landing.
  Not yet.") is watched: a third serving is recorded for the
  conversation build arm.
- **WATER INSTRUMENT (report-only):** broken-live water runs seen
  across the panel.
- **ROSTER-RECONCILIATION WATCH:** 0 unaccounted on all panel
  seeds, departures logged and matched by id, the how named per
  departure. r242: 0 unaccounted.
- **CODEX (report-only):** plants per seed. r242: 152 total.
- **SCHOLAR-DEATH STANDING METRIC:** see leg question §4.

## Q4 — census (plain words)
Five villages played (pilot + 4-seed panel): who lived, who died,
what they knew, what was missing — in plain words. Census records
per-villager `spotterXp`; village knowledge is measured by
codexPlantsEnd + per-villager spotter XP. Report party launches
and wave-4 kills per seed, standing totals at end per seed (r242:
160/0/100/135/0; wave 4 tracks standing 100, t4=100 — re-check the
split on the fresh band), and the scholar's last-dawn location for
every scholar death. A full telemetry type-count map is recorded
at end (read-only) so a launch/kill signal can be named if
telemetry records it.

## Seeds, policy, horizon
Pilot: **101801**. Panel: **101802–101805**, 42d horizon. Policy:
competent (r85/r136/r137/r138/r139/r210/r213/r217/r221/r225/r230/
r231/r232/r233/r240/r241/r242 driver shape — no withDelegate/
HUNTSTAFF flags). Death-aware tail +10d. Driver clone is verbatim
r242 except run number / seed band / output names + header comment
+ the pilot-gate marker revision (nv:* picks are the nonverbal
marker, not openThread — r242 metric review). The analyzer is the
r242 analyzer verbatim except run number / file names / the Q1 +
Q1b + Q1c + Q3 + Q5 comparison lines (now vs r242) + the Q5
same-day instrument + the STRANDED relabel + the F5 floor min/max
line. Proof tests re-run in this worktree to confirm the
mechanisms still hold on the new base: r240 walkHome 27/27, r231
settled-help 19/19, r230 stage0-help 13/13, r225 stage0-cant
18/18, r214 mood-goodbye 10/10, r139 spotter 35/35, r221
want-raise 7/7, r137 clearhome 37/37, r146 want-bridge, r243
link-accept 61/61, r147 maps-pools (new base-delta guard). New
proof test only if a defect is found.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 101801–101805 is FRESH.** Full-scope search performed
  2026-11-19 ~11:15Z before this prereg: filesystem grep over
  `evidence/` preregs (`*prereg.md`, all dates) for `10180[1-5]`:
  zero hits. Filesystem grep over goal hidden_files evidence
  filenames + repo evidence filenames for `10180[1-5]`: zero hits.
  `git log --all --grep=10180`: zero hits. The 1018xx range is
  named in no earlier prereg, forbidden list, contaminated list,
  screen, or extension band checked (old Nov-10 preregs mentioning
  "forbidden/contaminated" name no 1018 range). The earlier
  `git grep -w` over the whole tree hung on index-lock contention
  on the hot tree (killed, not completed) — the prereg-scope grep
  above is the completed check; a full-tree re-grep is owed only
  if a later search finds a naming this check missed, and the
  correction would go in as a correction commit naming the source.
- Rejected bands (carried): 100901–100903, 100601–100605,
  100701–100705, 6301–6305, 6401–6405, 6501–6505, 101501–101505
  (retired-ambiguous, r241).
- Contaminated bands NOT reused (r242 list carried, plus r242):
  101201–101205 (matched-band release SPENT after r232 — forbidden
  again for any other question), 101301–101305 (r233, just used),
  101401–101405 (r240, just used), 101601–101605 (r241, just used),
  101701–101705 (r242, just used), 1502, 1504, 1603, 1604,
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
- Analyzer fork proven on the r242 corpus BEFORE the panel
  (r242 JSONs + convo txts copied to /tmp/r243-analyzer-proof,
  renamed to r243 names): every scored number reproduces r242
  exactly — Q1 2/70 E1 2/2, stage-0-surfaced 2/2, LOST 0; Q1b
  70/347 (20.2%), per-seed 19/62, 25/72, 12/70, 9/66, 5/77, F5
  shape RECURS; SPOTTER 36, 5/5; LADDER 3/5; FASTER-ID 5/5
  (118/189); END 11/11; VILLAGE 5/5; Q2 0/10 CUT; Q3 distinct 1;
  Q6 per-seed numbers exact (101701: 66/69/5; 101702: 36/97/3;
  101703: 29/73/3; 101704: 45/73/3; 101705: 13/78/1); scholar
  deaths 6. The fork changes no scorer logic for the old bars.
- NEW lines on the old corpus (expected, not a fork break):
  Q5 same-day instrument — case_7 (101703, Priya/Yuki/Wanjiru)
  must now read as a same-day open+resolve case (moot convening
  + pronouncement same day) instead of invisible; the HEARD 3 /
  PRESENT 2 / UNHEARD 0 verdicts must be unchanged. STRANDED
  relabel — 101702 d35/d36 must read "no social sit — wedge
  working a live favor", not "BAR MISS".
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
not a staged solo-scholar fixture — same as r137–r242; proof tests
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
run reports the spread; the finding is not re-fired).

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
r217/r221/r225/r230/r231/r232/r233/r240/r241/r242 did NOT roll
forward. This run's panel is the r242 driver regime on a fresh
band — guardrails should stay quiet; any LOUD line is adjudicated
as band noise vs real bug BEFORE rolling the baseline forward.
Metrics: guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths (r135's set). The r242
checker hit the known schema mismatch (the driver never emits
`guardrails.*` fields, so the checker reads missing paths as 0) —
expected again, not a finding. NOTE: this run changes src/js only
if Q1/Q2/Q5 or the END BAR warrant a fix; a guardrail move on a
no-src-change run cannot be caused by this run's code — any LOUD
line gets adjudicated as band noise vs a pre-existing drift, and
the baseline is NOT rolled on a mismatch.
