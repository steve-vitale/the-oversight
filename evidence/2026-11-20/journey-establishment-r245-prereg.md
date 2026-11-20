# Journey leg ESTABLISHMENT — r245 pre-registration (2026-11-20, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214/r217/r221/r225/r230/r231/r232/r233/r240/
r241/r242/r243/r244 precedent). Death-aware: stop after 10 consecutive
all-dead daily checks; never tick a dead village to fill the leg.

## Run
Run id `playtest-20261120T1145Z` (scheduled Fri 2026-11-20 05:45 CST).
**QUEUE JUMP — rotation read `0` (landing), this run plays leg 1
(establishment).** Why: the landing worktree `journey-landing` is held
by the timed-out r149 run — its adoption agent (eebcc3cc) finished
~11:55Z BLOCKED by the write flap, having verified read-only but
merged/released nothing, so the tree still holds r149's uncommitted
work and cannot take a fresh landing run until the adoption resumes
and closes out. And recent commits touched systems the establishment
leg exercises (the queue-jump clause): scale r246's convo-wants
react wind-down fix, succession r254's mourning witness variant,
and the BOWCRAFT turn-on — all conversation/villager systems the
establishment sittings and census read. Run number r245 (r244 is
the last establishment run, 2026-11-19). **Base:** local master
`683c9a6e5` at registration. Heartbeat loop running (9-min cadence,
detached loop). Pre-flight: main tree CLEAN, disk 49%.
`git pull` reports "no such ref was fetched" but `git fetch origin
master` succeeds and origin/master is an ancestor of local HEAD
(20 commits ahead locally, all loop landings + the batch-ship
version bump) — nothing to merge; proceeding on local master.
**Write flap:** a new window started ~11:46Z (watchdog A/B/E/G/H/I
EPERM; my own git-ref probe fails EPERM at 11:58Z while plain file
writes pass). Registration deferred until the git-ref probe passes;
lock created 11:49:13Z (run_id playtest-20261120T1145Z) before the
flap's git-write failures were confirmed. No push (ship loop owns
pushes). **Rotation handling at closeout:** read the rotation file
then — if it reads `1` (the r149 adoption resumed and advanced
0→1), write `1→2` with read-back; if it still reads `0`, leave it
(the adoption will write 0→1 when it resumes; the next Lane A run
then replays establishment — a benign duplicate, noted here).

## Base delta vs r244's panel base `68b1f6370` (src/js)
`git diff --stat 68b1f6370..683c9a6e5 -- src/js/` — 7 files, +204/−24:
- `convo-wants.js` +16 — **scale r246 react wind-down fix**
  (`db6f4d7ce`): `dlg:react` retires from want menus at
  `reactDryCount >= 2`. **The base change to watch:** after live
  play, no verbatim-repeat react loop, no dead-react sitting on
  the panel. r246's proof was a staged repay sitting; this panel
  is the live-play re-read. Watch via the sitting `picks` arrays
  (see leg question §7).
- `convoTopics.js` +21 — **succession r254 mourning witness
  variant** (`aea63f6b5`): the mourning pool serves witness lines
  when the speaker saw the latest fresh dead fall. **Watch:** a
  mourning sitting should name the witnessed dead. Proof test
  4 cases GREEN. Watch is a post-hoc grep over the held convo
  txts (see leg question §8); no driver change.
- `villager-build.js` +94 — **BOWCRAFT turn-on** (`d56fbe819`):
  env gate removed — the bow-craft duty is always on in live play
  (pilot BUILD-GO + confirm GO on two fresh bands; proof 59/59 +
  58/58; finding #2597 FIXED). **The base change to watch:**
  bows get crafted in live play on this leg's window. Watch via
  the telemetry type-count map (see leg question §9). Plus
  `eaf530d6a` sim-bowknow-a BOWKNOW mentoring (a bow-knower at
  home teaches spear-holders; proof 19/19) and `6c4b75925` /
  `0fd416c5d` sim-searsupply-a (lever reverted; instrument +
  evidence only — no panel effect).
- `game.js` +21 — r244's own counter-label comma-clause fix
  (`9fb55be89`, already verified by the r244 re-panel: 0 real
  comma-clause labels) + endgame r249 doubled-'The' fix
  (carried in r244's watch; narration only).
- `finale-campaign.js` +14, `titans.js` +60 — crisis r253
  (`eb12c1471`: march refusal once-per-day + antler-thrash
  'The The' fix) and sim-bowknow/searsupply instruments. No
  establishment-window effect expected; any movement is read
  by the watches.
- `build.js` — version stamp only.
- Everything else in range: evidence/scripts-only landings
  (deepening r245 growth-line fix, endgame r255 adoption,
  winnability rounds 0315/0515/0530, scale r246 adoption,
  succession r254). **None of the above touches the
  settled-ledger favorless-ask mechanism, the sitting-close
  machinery, or the freeloader pipeline** except the r246 react
  retirement (watched, §7) and the r254 mourning variant
  (watched, §8). Q1/Q1b/Q2/Q5 bars carry verbatim from the
  r244 prereg except the pre-registered revisions below.

## Leg question (r244's named next steps, first)

**Q1 FAMILY RE-READ — the favorless-ask mechanism on a fresh band
+ the r244 metric-review counter revision (comma-only) + the
em-dash descriptor watch + the F2 scholar-death watch, fourth
panel + the senseexped launch watch + the wave-4 / standing watch
+ the r246 react wind-down live re-read + the r254 mourning
witness watch + the BOWCRAFT turn-on watch.**
1. **Q1 EIGHTH FRESH-BAND RE-READ.** r231 13/82 (15.9%) → r232
   2/77 (2.6%) → r233 1/53 (1.9%) → r240 1/70 (1.4%) → r241 1/55
   (1.8%, class C 1/1, never surfaced) → r242 2/70 (2.9%, E1 2/2,
   stage-0-surfaced 2/2, LOST 0) → r243 2/53 (3.8%, E1 2/2,
   stage-0-surfaced 2/2, LOST 0) → r244 3/61 (4.9%, E1 2 + C 1,
   stage-0-surfaced 1/3, LOST 2) pre-fix / 0/60 (LOST 0)
   re-panel. Same trace + classifier as r232–r244 (read-only
   probes; classes A–E verbatim; widened LOST trigger from
   r242). Thresholds verbatim from the r243 prereg: GO = rate
   <20% AND zero stage-0 wants resolved 'deflected' AND every
   favorless sit classified; NO-GO = rate ≥32.8% OR any stage-0
   want resolved 'deflected'. LOST asks reported separately
   (each a defect finding, documented + proposed, not landed).
2. **COUNTER RULE REVISED TO COMMA-ONLY (r244 metric review).**
   The r244 rule flagged `", "` OR `" — "` OR length >45; the
   length clause fired false positives on long noun phrases
   (speedbump_turtle 48 chars, nevermore 46, white_noise_heron
   re-panel). This run's defect finding = a label containing
   `", "` only — the mechanism-grounded comma class. The
   length clause is dropped; the em-dash clause is split out
   as its own watch (see §3), not a defect finding.
3. **EM-DASH DESCRIPTOR WATCH (r244 open item, report-only).**
   Count COUNTER LEARNED labels containing `" — "` (e.g.
   voice_mimic_radio "crying in the dark — a voice you almost
   recognize"), named per seed/day/def. A sighting is a watch
   item for the counter-label build arm (same fix shape as the
   comma class), not a defect finding this run.
4. **F2 SCHOLAR DEATHS (r242: 6/5, r243: 3/5, r244: 4/5 pre-fix
   + 2/5 re-panel — fourth panel).** Same rule: ≤2 per 5-seed
   panel = WATCH (report causes + last-dawn locations); ≥3 =
   investigate. r244 causes: Vivian d23 (contest), Aria d28
   (the wild), Greta d38 (the night), Hattie d23 (contest) —
   the contest-death variant (two original scholars dead in a
   day-23 contest) and the Domingo counterexample (last dawn
   inside the haven, died in the wild the same day). The
   finding stands as a named open item for the goals arm; this
   run reports the count + causes, adjudicates base-effect vs
   band noise, proposes nothing to land unilaterally.
5. **SENSEEXPED LAUNCH WATCH.** With the launch-party sense fix
   in, does any party-launch signal appear in the telemetry
   type-count map (r241/r242/r243/r244: zero on all four
   panels)? Any launch is named with its seed/day/party shape;
   a launch that kills a wave-4 beast is reported as a
   base-effect, not a panel finding alone.
6. **WAVE-4 / STANDING WATCH.** r242: 3/5 wave 4, standing to
   160. r243: 0/5, standing to 70. r244: 0/5 pre-fix (standing
   to 50), 2/5 re-panel (standing 120/100) — first wave-4 on
   this leg since r242. This run reports wave reached +
   standing per seed; a matched-band A/B is still owed before
   any claim about the wave-4 door.
7. **REACT WIND-DOWN LIVE RE-READ (r246 fix, first live
   panel).** The fix retires `dlg:react` from want menus at
   `reactDryCount >= 2`; a landed beat resets the count, so new
   content re-opens react. Watch: per sitting, the max run of
   consecutive `dlg:react` picks — the analyzer prints the
   per-seed max and lists sittings with a run ≥3 as REACT-WATCH
   candidates. A run ≥3 is a finding ONLY if the sitting's
   transcript shows the dead-react pool cycling verbatim with
   no landed beat between the reacts (adjudicated in the run
   note from the held transcript; a middle react that landed
   content resets the count and is legitimate). No
   verbatim-repeat react loop and no dead-react sitting expected
   on the panel.
8. **MOURNING WITNESS WATCH (r254 variant, first live panel,
   report-only).** Post-hoc grep over the held convo txts: any
   mourning sitting where the speaker witnessed the latest
   fresh dead fall — does the served line name the witnessed
   dead? Named per seed/day/speaker; a sitting that serves a
   generic mourning line where a witness line was due is a
   watch item for the succession arm, not a defect finding
   this run (the mechanism proof is the r254 4-case test).
9. **BOWCRAFT TURN-ON WATCH (d56fbe819, first live panel,
   report-only).** The duty is always on now. Watch: telemetry
   type-count keys matching /bow/i per seed (plus ammo_craft /
   armor_craft / craft totals for scale). If no bow key fires
   on any seed, that is a substrate note (the duty stages but
   the panel window never reaches it), not a defect — the
   BOWKNOW mentoring proof (19/19) is the mechanism check.
10. **F2 ECHO WATCH (carried).** With the r243 echo fix in,
    expect 0 acceptance echoes in the people check; a sighting
    is recorded for the conversation build arm with the
    transcript.

## Bars (verbatim from the r244 prereg unless revised below)
- **Q1b WANT-RAISE:** GO = panel raise rate ≥10% AND no seed with
  0 raises. r244: 61/346 (17.6%) pre-fix, 60/335 (17.9%)
  re-panel. Report kinds (forage_help / heal_help / sick_help /
  food_share / water_haul / no-kind).
- **Q2 SITTING CLOSES:** GO = 0 cut sittings (mechanical half:
  engine-ended + 0 beats after last THEM + no closing line; the
  open-question half is a human read). WATCH 1–2 (read in full);
  NO-GO ≥3 or any cut ending on an open question/invitation.
- **Q3 RECAP PARAPHRASE (report-only):** distinct <6 report-only;
  ≥6 a second formulation is owed. Carried canned-line watch
  (pod-dream, recap stitch, slope-reading, walked-in, take-it,
  stew-bowl, pod-dream-open). r244 distinct: 1/10 pre-fix, 0
  re-panel (report-only).
- **Q6 POLICY FORAGING (report-only):** per seed, scholar
  bumpCalls vs wedgeSits vs joint forage_help commits. F4 shape =
  bumpCalls ≤2 AND wedgeSits ≥50. r244 per-seed: 33/95/4,
  19/70/4, 45/96/2, 70/70/5, 23/68/4 pre-fix. No F4 shape.
- **SPOTTER:** panel foodXp['spotter'] total ≥10 AND every panel
  seed contributes >0. r244: 48, 5/5 GO pre-fix; 64, 5/5 re-panel.
- **LADDER (report-only under a SPOTTER GO — pace read):** ≥1
  villager reaches 5 XP on ≥4/5 seeds. r244: 4/5 both panels.
- **FASTER-ID:** threshold benefit fires on ≥2/5 seeds. r244: 5/5
  (105/190) pre-fix; 5/5 (239/288) re-panel.
- **END (standing bar, qualifying-only denominator):** every
  broken-live forage run that broke ≥2 days before the run's end,
  bearer is the player, ending status ready on ≥1 dawn after
  breaking, is closed by the wedge within 2 dawns of breaking.
  GO = every QUALIFYING opportunity closed within 2 dawns.
  r244: 8/8 GO pre-fix; 13/13 GO re-panel.
- **STRANDED (carried watch):** previous-bearer runs in
  strandedLog with 0 work performed. Social sits printed against
  DISTINCT stranded days with the entry count alongside. r244:
  0 (no-opportunity) pre-fix; 0 re-panel.
- **TRAVEL / THREAD branches (carried watch):** homeward sits on
  a clearable blockage reach home the same dawn; paged (Yara-shape)
  end opportunities close within 2 dawns. r244: TRAVEL 0/0,
  THREAD 1/1 pre-fix.
- **TRUST GUARD (hard, DROP-ONLY):** trust[vid] must not drop
  across any end press. Any drop = defect finding. r244: 0 drops.
- **JAM (report-only):** jam-days = dawns with a promised run
  while a broken-live run was live. r244: 0.
- **VILLAGE:** alive at d40 on ≥3/5 panel seeds. r244: 5/5 both.
- **PEOPLE CHECK:** PASS/FAIL on 2 held convos from one panel
  seed, read in full (meaning, coherence, consequence — not
  counts). The r241 dry beat ("The moment passes without landing.
  Not yet.") is watched: a further serving is recorded for the
  conversation build arm.
- **WATER INSTRUMENT (report-only):** broken-live water runs seen
  across the panel.
- **ROSTER-RECONCILIATION WATCH:** 0 unaccounted on all panel
  seeds, departures logged and matched by id, the how named per
  departure. r244: 0 unaccounted.
- **CODEX (report-only):** plants per seed. r244: 152 pre-fix,
  120 re-panel.
- **SCHOLAR-DEATH STANDING METRIC:** see leg question §4.
- **COUNTER (REVISED):** defect finding = a COUNTER LEARNED label
  containing `", "` (comma class only). Report the comma count,
  the em-dash count (§3 watch), and the total lines per seed.
  r244 pre-fix: 111 lines, 5 real comma-clause; re-panel: 90
  lines, 0 comma-clause (1 length-only flag under the old rule).
- **REACT (NEW WATCH):** per leg question §7 — max consecutive
  `dlg:react` picks per sitting; run ≥3 listed as a REACT-WATCH
  candidate, adjudicated against the transcript in the run note
  (finding only if the dead-react pool cycles verbatim with no
  landed beat between).
- **BOWCRAFT (NEW WATCH):** per leg question §9 — /bow/i
  telemetry keys per seed; none = substrate note.

## Q4 — census (plain words)
Five villages played (pilot + 4-seed panel): who lived, who died,
what they knew, what was missing — in plain words. Census records
per-villager `spotterXp`; village knowledge is measured by
codexPlantsEnd + per-villager spotter XP. Report party launches
and wave-4 kills per seed, standing totals at end per seed, and
the scholar's last-dawn location for every scholar death. A full
telemetry type-count map is recorded at end (read-only) so a
launch/kill signal can be named if telemetry records it.

## Seeds, policy, horizon
Pilot: **101951**. Panel: **101951–101955**, 42d horizon. Policy:
competent (r85/r136/r137/r138/r139/r210/r213/r217/r221/r225/r230/
r231/r232/r233/r240/r241/r242/r243/r244 driver shape — no
withDelegate/HUNTSTAFF flags). Death-aware tail +10d. Driver clone
is verbatim r244 except run number / seed band / output names +
header comment. The analyzer is the r244 analyzer verbatim except
run number / file names / the Q1 + Q1b + Q1c + Q3 + Q5 comparison
lines (now vs r244) + the counter revision (comma-only defect
finding; em-dash watch line added) + the REACT watch + the
BOWCRAFT watch. Proof tests re-run in this worktree to confirm
the mechanisms still hold on the new base: r240 walkHome 27/27,
r231 settled-help 19/19, r230 stage0-help 13/13, r225 stage0-cant
18/18, r214 mood-goodbye 10/10, r139 spotter 35/35, r221
want-raise 7/7, r137 clearhome 37/37, r146 want-bridge, r243
link-accept 61/61, r148 link-accept rotation 3/3, r147 maps-pools,
r244 counter-label 19/19, r246 react wind-down 10/10, r254
mourning witness 4 cases. New proof test only if a defect is found.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 101951–101955 is FRESH.** Full-scope search performed
  2026-11-20 ~12:00Z before this prereg: filesystem grep over
  `evidence/*/journey-*-prereg.md` (goal hidden_files, all dates)
  for `10195[1-5]`: zero hits. Filesystem grep over
  `evidence/*/journey-*-prereg.md` (repo, all dates): zero hits.
  Filesystem grep over `evidence/*/sim-*-prereg.md` (both trees,
  covered by the `*prereg.md` glob): zero hits. Evidence
  filenames for `10195[1-5]`: zero hits. `git log --oneline
  --grep=101951`, `--grep=10195`: zero hits. The 10195x range is
  named in no earlier prereg, forbidden list, contaminated list,
  screen, or extension band checked. (Backup candidate
  108101–108105 also checked clean the same way, same scope —
  held in reserve, not used.)
- Rejected bands (carried from r244): 100901–100903,
  100601–100605, 100701–100705, 6301–6305, 6401–6405, 6501–6505,
  101501–101505 (retired-ambiguous, r241).
- Contaminated bands NOT reused (r244 list carried, plus r244):
  101201–101205, 101301–101305, 101401–101405, 101601–101605
  (r241), 101701–101705 (r242), 101801–101805 (r243),
  101901–101905 (r244), 108001–108005 (r244 re-panel), 1502,
  1504, 1603, 1604, 17101–17112, 1142–1151, 1801–1804, 1901–1916,
  2001–2010, 2101–2116, 2201–2216, 2301–2316, 2401–2416,
  100001–100008, 1200–1209, 2501–2516, 2601–2616, 2701–2705,
  2801–2805, 2901–2905, 3001–3005, 3101–3105, 3201–3205,
  5001–5005 (r139), 5101–5105, 5201–5205, 5301–5305, 5401–5405,
  5501–5505 (r210), 5601–5605, 5701–5705, 5801–5805, 5901–5905,
  6001–6005, 6101–6105, 6201–6205 (r213 rejections),
  100501–100505 (r213/r214), 100801–100805 (r217),
  101001–101005 (r221), 101101–101105 (r225), 102001–102008,
  102101, 102201, 102301, 103001, 103101, 103201, 104001, 104101.

## Instrument proof (before the panel)
- Analyzer fork proven on the r244 corpus BEFORE the panel
  (r244 JSONs + convo txts copied to
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/r245-analyzer-proof/`,
  renamed to r245 names; logs `r244-baseline.log` +
  `r245-fork.log` in the same dir — NOT /tmp, which a sibling
  cleanup wipes): the re-run r244 baseline reproduces the
  committed r244 analyzer log exactly (diff clean modulo
  per-seed lines), and the r245 fork reproduces every old-bar
  number exactly — Q1 3/61 E1 2 + C 1, stage-0-surfaced 1/3,
  LOST 2; Q1b 61/346 (17.6%); SPOTTER 48, 5/5; LADDER 4/5;
  FASTER-ID 5/5 (105/190); END 8/8; VILLAGE 5/5; Q2 0/10 CUT;
  Q3 distinct 1; Q6 per-seed numbers exact; scholar deaths 4;
  STRANDED 0. The fork changes no scorer logic for the old bars.
- NEW lines on the old corpus (expected, not a fork break):
  COUNTER comma-only count (pre-fix corpus: 5 comma-clause
  labels; the 2 length-only flags drop out) + EM-DASH watch
  line + REACT watch line + BOWCRAFT watch line. The counter
  instrument is proven structurally by the driver's dayLines
  scan and exercised by any panel seed with a counter discovery.
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
not a staged solo-scholar fixture — same as r137–r244; proof tests
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
the goals arm as a named open item. The Q1 E1 residual (2 LOST
pre-fix r244, 0 re-panel) stays with the conversation build arm.
The senseexped launch silence (4 panels) stays with the sim lane.

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
r217/r221/r225/r230/r231/r232/r233/r240/r241/r242/r243/r244 did NOT
roll forward. This run's panel is the r244 driver regime on a fresh
band — guardrails should stay quiet; any LOUD line is adjudicated
as band noise vs real bug BEFORE rolling the baseline forward.
Metrics: guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths (r135's set). The r244
checker hit the known schema mismatch (the driver never emits
`guardrails.*` fields, so the checker reads missing paths as 0) —
expected again, not a finding. NOTE: this run changes src/js only
if Q1/Q2/Q5 or the END BAR warrant a fix; a guardrail move on a
no-src-change run cannot be caused by this run's code — any LOUD
line gets adjudicated as band noise vs a pre-existing drift, and
the baseline is NOT rolled on a mismatch.
