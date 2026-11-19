# Journey leg ESTABLISHMENT — r242 pre-registration (2026-11-18, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214/r217/r221/r225/r230/r231/r232/r233/r240/
r241 precedent). Death-aware: stop after 10 consecutive all-dead daily
checks; never tick a dead village to fill the leg.

## Run
Run id `lane-a-20261119T044421Z` (scheduled Wed 2026-11-18 22:45 CST;
lock `2026-11-19T04:44:21Z`). Rotation read `1` (establishment);
write `1→2` at closeout with read-back. Run number r242 (r241 is the
last establishment run, 2026-11-18 13:45 CST). **Base:** local master
`6b47e98b6` (verified = worktree HEAD at registration). Heartbeat loop
running (8-min cadence, detached loop). Pre-flight: main tree CLEAN,
disk 44%. **Stale-lock recovery:** the previous lock
(`lane-a-20261119T012424Z`, created 2026-11-19T01:24:24Z) was 3h19m
old with NO registered tree (no `lane-a-...` entry in
REGISTRY.json) and no live coordinator (ps clean; the r146 adoption
agent had already completed and closed out that run — master
1b27bf524, merged locally, pending ship). Deleted per the 90-minute
fallback + the heartbeat rule, noted here. No push (ship loop owns
pushes).

## Base delta vs r241's panel base `6a97f3a07` (src/js + policies, 7 commits)
- `05921a54d` journey-landing r146: door-guard follow-up
  (competent.js: beastStrikeTarget/move_x2/keep_distance — fight
  dodge + approach steps skip door tiles) + fledBad probe +
  want-bridge pool 6→10 (convo-beats.js, HEED-V fix). **THE base
  change to watch:** the competent POLICY changed (fight movement)
  and the want-bridge pool widened — either could move fight
  deaths/outcomes (scholar-death watch) or Q1b raise rates / Q1
  favorless shape. Adjudicated as base-effect vs band noise, not
  assumed to be the panel.
- `ee4e9d07f` journey-scale r243: raise-accept echo fix
  (bond-initiation.js, linkAcceptLine; proof 61/61). **THE F2 fix
  under re-read:** the r241 F2 echo watch (acceptance echo — the
  engine echoing the player's own acceptance words as the NPC's
  reply; r239 Walt, r233 Paolo, r240 Naoise) is re-read with this
  fix in; expect 0 echoes in the people check. Transcript wording
  only; no sitting-close mechanism touched.
- `a9a4108fe` + `1032897dc` + `83db8255f` sim-partysize4-b:
  PARTYSIZE4 lever — dawn third-companion pick + depart mirror quad
  launch + partyQuads counter bump. Could move party launches in the
  census (r241: zero launches in the telemetry type-count map).
  Adjudicated as base-effect vs band noise.
- `a519253b9` sim-foodgate-instr-a: food-gate instrumentation on
  the field-fight record — engine-side flags only, no behavior change.
- `046ae5859` version-bump stamp only.
- Everything else in range: evidence/scripts-only landings (scale
  r242/r243 analyzer + run notes, crisis r241/r244 run notes,
  succession r233, deepening r237, partysize4-b, fightcap-dmg-a,
  wildavoid-confirm-a, aidleave-b, fleshout evidence rounds).
- **No conversation.js / convo-wants.js change** — the r241 F1
  pre-empted-seed mechanism is untouched; F1 stays proposed-not-
  landed for the conversation build arm. **None of the above touches
  the settled-ledger favorless-ask mechanism, the sitting-close
  machinery, or the freeloader pipeline** (the echo fix touches
  link-accept voice, not the favor mechanism). Q1/Q1b/Q2/Q5 bars
  carry verbatim except the pre-registered revisions below
  (widened LOST trigger, Q5 moot instrument, F5 floor rule).

## Leg question (r241's named next steps, first)

**Q1 FAMILY RE-READ — the favorless-ask mechanism on a fresh band
with the WIDENED LOST trigger + the F5 per-seed floor tie-breaker
+ the Q5 moot-path instrument + the F2 echo re-read.**
1. **WIDENED LOST TRIGGER.** r241's metric review: the LOST-ask
   trigger was scoped to case-thread E1, so a class-C ask that died
   unheard didn't trip it — "the class names the mechanism, the
   surfacing names the harm." This run widens it: ANY favorless ask
   whose kinded ask never surfaces later is a LOST ask (defect
   finding, documented with the full transcript, proposed not
   landed). The class-C shape (Fatima 101602 d14 — seed favor
   present, opener attached nothing, talk request pre-empted the
   follow-up sitting) is the re-read: does it recur, surface, or
   vanish?
2. **F5 FLOOR TIE-BREAKER.** r233 thin seeds 5.8–6.2%, r240 CLOSED
   (thinnest 16.4%), r241 RE-OPENED (thin 6.6% vs fat 22.4%).
   Rule for this run: if the thin<7%-while-fat>15% shape recurs a
   third time in four panels, the floor question goes to the build
   arm as a finding (want-raise is seed-dependent — the thinnest
   villages hear asks roughly a third as often as the fattest);
   if the thinnest seed clears 10%, the floor question closes.
   This run records the spread and applies the rule; no in-run
   fix unless one-line instrument-class.
3. **Q5 MOOT-PATH INSTRUMENT.** First run with mootLines + caseLog
   (r241-owed): path per exile from the pronouncement text, warning
   lines before the exile day, moot/case lines naming the person,
   and the case-thread-held proxy. The freeloader-warning question
   stays open until a freeloader exile actually fires.
4. **F2 ECHO RE-READ** with the r243 echo fix in: expect 0
   acceptance echoes in the people check; a sighting is recorded
   for the conversation build arm with the transcript.

**Q1 — FAVORLESS ASK, FIFTH FRESH-BAND RE-READ.** r231 13/82
(15.9%) → r232 2/77 (2.6%) → r233 1/53 (1.9%) → r240 1/70
(1.4%) → r241 1/55 (1.8%, class C 1/1, never surfaced). Same trace
+ classifier as r232/r233/r240/r241 (read-only probes; classes
A–E verbatim). Thresholds, pre-registered:
- **GO** = favorless rate < 20% AND zero stage-0 wants resolved
  as 'deflected' AND every favorless sit classified (unknown 0).
- **WATCH** = rate 20–32.8% with the residual mechanism
  classified and a dominant mechanism (≥50%) named; or rate < 20%
  but a NEW dominant class appears (mechanism moved, not fixed).
- **NO-GO** = rate ≥ 32.8% (no improvement) OR any stage-0
  want resolved as 'deflected' (the fix does not hold in the wild).
- **LOST asks are reported separately from the rate bar:** each
  LOST ask is a defect finding (documented + proposed, not landed)
  — the rate bar judges the mechanism's frequency, the LOST
  trigger judges the individual harm. One LOST ask on a 1.8%
  panel is a finding, not a panel NO-GO.
- Report-only: favorless rate vs r241's 1/55; per-villager repeat
  counts; needs in the favorless sits; class mix vs r241's C 1/1;
  stage-0-surfaced proxy vs r241's 0/1.

## Q1b — WANT-RAISE, REGRESSION GUARD (r221 Q1, thresholds verbatim)
Per wedge sit, did the NPC raise an ask_favor want at any turn.
- **GO** = panel raise rate ≥10% AND no seed goes a full leg with
  0 raises. **WATCH** = a zero-raise seed whose sits show other
  wants. **NO-GO** = a zero-raise + no-want seed (defect shape).
- **F5 per-seed floor (r233 F5, CLOSED on r240, RE-OPENED on
  r241):** this run applies the tie-breaker rule (see Leg
  question §2): thin<7% while fat>15% recurring a third time in
  four panels sends the floor question to the build arm as a
  finding; thinnest seed ≥10% closes it. r241 per-seed: 6.6%
  (101601), 16.7%, 22.4%, 19.7%, 13.8%; panel 55/353 (15.6%).
Report-only: raise rate by want kind (joint forage_help /
water_haul vs other favors). r241 kinds: forage_help 33,
heal_help 13, sick_help 4, food_share 4, (no-kind) 1; no
water_haul favors.

## Q1c — LOST ASK, WIDENED TRIGGER (r241 metric review)
Replaces the E1-only Q1c line. Among ALL favorless sits, how many
never surface a kinded ask_favor in a later sitting (stage-0-
surfaced proxy, same villager)? Each never-surfaced sit is a LOST
ask — a defect finding, documented with the full transcript and
proposed (not landed) for the build arm. A surfaced ask is a day's
delay, not a defect. The E1 case-thread counts stay as mechanism
detail (which LOST asks were case-thread E1s, with case picks /
total picks, openThread, `dlg:help` pressed Y/N). r241's class-C
sit is LOST under this trigger (Fatima 101602 d14) — the fork
proof must flag it.

## Q2 — SITTING CLOSES, STANDING BAR (r217 Q1, thresholds verbatim)
A sitting is CUT only when the full transcript shows NO closing beat
after the final grace beat AND the last THEM line is an open question
/ invitation / promise. The analyzer flags the mechanical half
(engine-ended + 0 beats after last THEM + no closing line); the
open-question half is a human read in the run note.
- **GO** = 0 cut sittings across the panel sittings.
- **WATCH** = 1–2 cut sittings: each read in full in the people
  check. If the last THEM line reads as a natural close, report-only.
  If any reads as a mid-thought cut, that sitting is a defect finding
  and the run fixes the close in the worktree, grounded in the
  transcript, with a proof test.
- **NO-GO** = ≥3 cut sittings, or any cut whose last THEM line is an
  open question/invitation with no resolution.
- Report-only: r214 parting-pool serves in the wild; r224 F4a/F4b/F4c
  dry-line fixes hold in the wild (0 recurrences in their classes);
  r228 C3c/F2 fixes hold in the wild (0 recurrences in their
  classes); r226 F6 dry-opener guard holds in the wild (0 dry
  servings of a ledger-blocked line); C3d recap fix holds in the
  wild (recap names the live want — read on 1–2 sittings).
- **F2 echo watch (r240 F2, fourth sighting sought):** the engine
  echoes the player's own acceptance words as the NPC's reply on
  link/raise accepts (r239 Walt, r233 Paolo, r240 Naoise). With the
  r243 echo fix in, expect 0 sightings in the people check; a
  sighting is recorded for the conversation build arm with the
  transcript. A fix is a dialogue-content change, outside this
  run's panel scope unless the echo breaks a close.

## Q3 — recap paraphrase (report-only, per-sitting presence, r230 revision)
Distinct total < 6 → report-only (no formulation owed).
Distinct total ≥ 6 → the formulation is over-represented and a
second paraphrase formulation is owed.
Carried canned-line watch (same needles as r213): pod-dream closing,
recap stitch verbatim, slope-reading, "Walked in like they'd never
left.", "Take it for what it's worth.", stew-bowl, pod-dream-open.
Report-only. (r241 distinct: paraphrase 2, walked-in 1, take-it 1,
rest 0.)

## Q5 — EXILE WARNING HEARD (r241-owed instrument revision, report-only + defect triggers)
r241: **four moot-path exiles fired** (Ray + Mason d9 on 101602,
Morris + Pavel d24 on 101603), all MET villagers; **no freeloader
exile fired**, so the d7-warning question is STILL unanswered. This
run carries the REVISED instrument (driver: mootLines channel +
per-dawn caseLog; analyzer: per-exile block):
- **Path per exile**, from the pronouncement text (grounded in
  code): moot — `${Name} is exiled. "Take what you can carry and
  go." ...` (betrayal.js resolveCase :2227); freeloader — `It's
  done. "Take what you can carry and go." ...` (game.js
  freeloadVote). A pronouncement line on the exile day matches
  one or the other; neither prefix = path unknown (reported).
- **Warning heard:** exileLines before the exile day (gossip /
  warning / vote lines) + moot/case lines naming the person
  (mootLines) + whether a case naming them as accused was ever
  open (caseLog) + the case-thread-held PROXY (a held sitting on
  a day when such a case was open AND the sit pressed betrayal:*
  picks — the run note confirms from the transcript, since the
  picks may belong to another case).
- **HEARD** = any of (warning lines before) OR (moot/case lines
  naming them) OR (case-thread-held proxy). **UNHEARD** = none.
- **Defect trigger (carried, now path-aware):** a freeloader-path
  exile whose exileLines hold NO warning line at all is a
  silent-exile finding. **UNHEARD moot exile = finding**
  (documented with the full line sequence, proposed not landed).
- Report-only: for every exile on the panel, the day-stamped line
  sequence (gossip → warning → vote → pronouncement) and whether
  the scholar was at Haven on the warning day.
- The design question (should three UNMET villagers be exilable
  before the player has sat with them?) stays with the build arm.
  r241's exiles were all MET; an unmet exile this run is the r233
  shape recurring — reported, not adjudicated here.

## Q6 — POLICY FORAGING (r233 F4 named question, report-only)
r241: no F4-shape seed (thinnest forager 12 bumps with 64 sits).
Same read-only analyzer line: per seed, scholar bumpCalls vs
wedgeSits vs joint forage_help commits. A seed with bumpCalls
≤ 2 AND wedgeSits ≥ 50 is the F4 shape, recorded; a seed with
bumpCalls ≥ 10 on the same sits answers "no, the policy does
forage when sits are available". **Watch:** the r241 101602
zero-commit shape (14 asks raised, 0 joint favors committed, in
84 sits) — if it recurs, it is a sim-lane question. The mechanism
(why the policy picks sits over solo forage) is a sim-lane
question if the F4 shape repeats on ≥3/5 seeds.

## Carried bars (r213/r214/r217/r221/r225/r230/r231/r232/r233/r240/r241 shape, re-verified on the new master)
- **SPOTTER BAR:** panel foodXp['spotter'] total ≥ 10 AND every
  panel seed contributes > 0.
- **LADDER BAR (report-only under a SPOTTER GO — r210 metric review:
  pace read):** ≥1 villager reaches 5 XP (skill 1) on ≥3/4 panel
  seeds; report foraging-volume context if it misses.
- **FASTER-ID BAR:** threshold benefit fires on ≥2/4 seeds.
- **END BAR (standing bar):** every broken-live forage run that
  (a) broke ≥ 2 days before the run's end, (b) bearer is the
  player, (c) the ending status was ready on at least one dawn
  after breaking, is closed by the wedge within 2 dawns of
  breaking. Bearer-change excuse stands. **GO** = every
  opportunity closed within 2 dawns. **MISS** = any opportunity
  open past 2 dawns — mechanism named, fixed with a proof test if
  the cause is in the walkHome/travelHome84 area; otherwise
  documented for the build arm. r241: 7/7 GO on the fresh band —
  the r240 walkHome fix is proven in the wild; this run re-reads
  the bar as a standing regression guard, not a fix re-read.
  The r240 residual (walkHome still steps back onto a tile already
  on its path when that step is a homeward axis step — the
  (4,2)→(5,2)→(4,2) oscillation) is a watch item: a walk with NO
  clearable refusal that burns steps bouncing is a finding,
  documented with the geometry, not fixed in this run unless the
  fix is a one-line guard with a proof test.
- **STRANDED BAR (carried watch):** previous-bearer runs recorded
  in strandedLog with 0 work performed on them. NO-OPPORTUNITY = zero.
- **TRAVEL BRANCH (carried watch):** homeward sits hitting a
  clearable blockage reach home the same dawn. NO-OPPORTUNITY = zero.
- **THREAD BRANCH (carried watch):** paged (Yara-shape) end
  opportunities closed within 2 dawns.
- **TRUST GUARD (hard, DROP-ONLY):** trust[vid] must not drop
  across any end press. Any drop = defect finding, wedge stops
  ending for the rest of that seed, END BAR NO-GO for that seed.
- **JAM BAR (report-only):** jam-days = dawns on which a promised
  (not yet live) run existed while a broken-live run was live.
- **VILLAGE BAR:** alive at d40 on ≥3/4 panel seeds.
- **PEOPLE CHECK:** PASS/FAIL on 2 held convos from one panel seed,
  read in full (meaning, coherence, consequence — not counts).
  The r241 dry beat ("The moment passes without landing. Not yet."
  after "I'm listening." — second run in a row) is watched: a
  third serving is recorded for the conversation build arm.
- **WATER INSTRUMENT (report-only):** count of broken-live water
  runs seen across the panel.
- **SCHOLAR-DEATH STANDING METRIC (r221 metric review, r138 rule):**
  scholar deaths ≤2 per 5-seed panel = WATCH (at bar, report
  causes); ≥3 = investigate the wild-travel risk. r231 sat at 3,
  r232 at 4, r233 at 2, r240 at 2, r241 at 2 (Salvador d8, Anjali
  d36 — both woke AWAY from Haven). The companion-guard A/B
  escalation already triggered on r232 (sim lane's job). This run
  keeps the watch + the location instrument (`scholarDawns`) and
  reports causes. NOTE: wildavoid + fleerepair + the competent-
  policy door-skip (a85627205) + the r146 door-guard follow-up
  (05921a54d) all landed since r233 — a scholar-death move in
  EITHER direction is adjudicated as base-effect vs band noise,
  not as a panel finding alone.
- **ROSTER-RECONCILIATION WATCH (r225 anomaly, recurred r230,
  answered r231/r232/r233/r240/r241):** 0 unaccounted on all five
  r241 seeds with departures logged and matched by id, AND the how
  named per departure (removalLog). The instrument stays in the
  driver; the open question is whether a departure is narrated to
  the player (Q5 answers it for exiles when the instrument can
  tell the path).

## Q4 — census (plain words)
Five villages played (pilot + 4-seed panel): who lived, who died,
what they knew, what was missing — in plain words. Census records
per-villager `spotterXp`; village knowledge is measured by
codexPlantsEnd + per-villager spotter XP. Also report party
launches and wave-4 kills per seed (PARTYSIZE4 is now live, so
launches here may be base behavior — the r241 census recorded zero
launches; any launch this run is a base-effect to name, not a
panel finding alone). Standing totals at end per seed (r241:
wave 4 tracks standing 100, t4=100 — re-check the split on the
fresh band) and the scholar's last-dawn location for every
scholar death. A full telemetry type-count map is recorded at end
(read-only) so a launch/kill signal can be named if telemetry
records it.

## Seeds, policy, horizon
Pilot: **101701**. Panel: **101702–101705**, 42d horizon. Policy:
competent (r85/r136/r137/r138/r139/r210/r213/r217/r221/r225/r230/
r231/r232/r233/r240/r241 driver shape — no withDelegate/HUNTSTAFF
flags; NOTE the competent policy itself changed since r241: the
landing-r146 door-guard follow-up, see Base delta). Death-aware
tail +10d. Driver clone is verbatim r241 except run number / seed
band / output names + header comment + the Q5 instrument revision
(mootLines + caseLog). The analyzer is the r241 analyzer verbatim
except run number / file names / the Q1 + Q1b + Q1c + Q3 + Q5
comparison lines (now vs r241) + the widened LOST trigger + the
Q5 per-exile block + the F5 floor min/max line.
Proof tests: the r240 walkHome proof test
(`scripts/test-journey-establishment-r240-walkhome-firstblock.js`,
27/27), the r231 settled-help proof test (19/19), the r230
stage0-help proof test (13/13), the r225 stage0-cant proof test
(18/18), the r214 mood-goodbye proof test (10/10), the r139
spotter proof test (35/35), and the r221 want-raise proof test
(7/7) are re-run in this worktree to confirm the mechanisms
still hold on the new base; new proof test only if a defect is
found. The r137 clearhome test (37/37) is re-run as the
walkHome-adjacent regression guard. The r146 want-bridge proof
test (44/44 per the landing commit — the pool 6→10 change) and
the r243 link-accept proof test (61/61) are re-run as the
base-delta regression guards for the two behavior-adjacent
changes in range.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 101701–101705 is FRESH.** Full-scope search performed
  2026-11-19 ~04:50Z before this prereg: `git grep -w` over
  committed `evidence/**/*.md` + `scripts/*.js` for each of
  101701–101705: zero hits. Filesystem grep over
  `evidence/*/sim-*-prereg.md` + `evidence/*/journey-*-prereg.md`:
  no file names the band. Filesystem grep over
  `evidence/2026-11-1*/` for 101701: zero hits.
- Rejected bands (carried): 100901–100903, 100601–100605,
  100701–100705, 6301–6305, 6401–6405, 6501–6505, 101501–101505
  (retired-ambiguous, r241).
- Contaminated bands NOT reused (r241 list carried, plus r241):
  101201–101205 (matched-band release SPENT after r232 — forbidden
  again for any other question), 101301–101305 (r233, just used),
  101401–101405 (r240, just used), 101601–101605 (r241, just used),
  1502, 1504, 1603, 1604, 17101–17112, 1142–1151, 1801–1804,
  1901–1916, 2001–2010, 2101–2116, 2201–2216, 2301–2316, 2401–2416,
  100001–100008, 1200–1209, 2501–2516, 2601–2616, 2701–2705,
  2801–2805, 2901–2905, 3001–3005, 3101–3105, 3201–3205, 5001–5005
  (r139), 5101–5105, 5201–5205, 5301–5305, 5401–5405, 5501–5505
  (r210), 5601–5605, 5701–5705, 5801–5805, 5901–5905, 6001–6005,
  6101–6105, 6201–6205 (r213 rejections), 100501–100505
  (r213/r214), 100801–100805 (r217), 101001–101005 (r221),
  101101–101105 (r225).

## Instrument proof (before the panel)
- Analyzer fork proven on the r241 corpus BEFORE the panel
  (r241 JSONs + convo txts copied to /tmp/r242-analyzer-proof,
  renamed to r242 names): every scored number reproduces r241
  exactly — Q1 1/55 C 1/1, stage-0-deflected 0, stage-0-surfaced
  0/1; Q1b 55/353 (15.6%), per-seed 6.6/16.7/22.4/19.7/13.8, F5
  shape RECURS; SPOTTER 43, 5/5; LADDER 5/5; FASTER-ID 5/5
  (80/126); END 7/7; VILLAGE 5/5; Q2 0/10 CUT; Q3 distinct 2;
  Q6 per-seed numbers exact (101601: 43/78/2; 101602: 27/84/0;
  101603: 31/72/5; 101604: 12/64/4; 101605: 13/76/4); scholar
  deaths 2. The fork changes no scorer logic for the old bars.
- NEW lines on the old corpus (expected, not a fork break):
  LOST = 1 (Fatima 101602 d14, class C — the widened trigger
  flags r241's known class-C sit); Q5 = 4 exiles, all path=moot,
  HEARD 0, UNHEARD-instrument-absent 4 (mootLines/caseLog ABSENT
  on the pre-r242 corpus — NOT silence evidence; the run note
  must not quote those UNHEARD counts as findings).
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
not a staged solo-scholar fixture — same as r137/r138/r139/r210/
r213/r217/r221/r225/r230/r231/r232/r233/r240/r241; proof tests stage for
the mechanism only, not a combat fixture.

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
oscillation residual stays with the build arm (watch item above).

## Pilot gate
Pilot seed runs first on the final driver; completes without crash
AND (≥1 people-check sitting is held OR game over before the check
with the skip note written — r240 metric-review revision) AND its
transcript is written AND the spotter instruments fire (≥1
bumpPlantFamiliarity wrap record AND ≥1 villager forage resolution
observed) AND the sittingCloses record is present in the JSON
(beatsAfterLastThem counted) AND wedgeSits carry pick wantIds on
VERBAL sits (nonverbal sits carry wantId null by design —
openThread nonverbal; r241 metric-review revision) AND ≥1 wedge
social sit carries the Q1 trace fields (fromSeed / seedFavorId /
need / ledgerFavor recorded at sit start) AND the rosterDepartures
instrument is present in the JSON (array, possibly empty) AND the
r240 instruments are present (standingEnd non-null, scholarDawns
recorded per dawn, teleTypeCounts present) AND the Q5 instruments
are present (mootLines array + caseLog array in the JSON) AND the
Q5 exileLines regex extension is present in the driver source
(grep for "pull weight"). If the pilot forces a driver or fix
change, the panel restarts on fresh seeds and the pilot seed is
NOT scored — EXCEPT that a driver change after the pilot on a
FRESH band voids the band only if the change is game behavior
(instrument-only changes keep the band, recorded in the run note);
any src/js change forces a fresh-band restart.

## Telemetry
Live baseline is the r132 BEFORE panel; r133–r139/r210/r213/r214/
r217/r221/r225/r230/r231/r232/r233/r240/r241 did NOT roll forward.
This run's panel is the r241 driver regime on a fresh band —
guardrails should stay quiet; any LOUD line is adjudicated as band
noise vs real bug BEFORE rolling the baseline forward. Metrics:
guardrails.deaths, guardrails.popAlive, guardrails.pantryKcal,
c3.starvationDeaths (r135's set). The r241 checker hit the known
schema mismatch (the driver never emits `guardrails.*` fields, so
the checker reads missing paths as 0) — expected again, not a
finding. NOTE: this run changes src/js only if Q1/Q2/Q5 or the END
BAR warrant a fix; a guardrail move on a no-src-change run cannot
be caused by this run's code — any LOUD line gets adjudicated as
band noise vs a pre-existing drift, and the baseline is NOT rolled
on a mismatch.
