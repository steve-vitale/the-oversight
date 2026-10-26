# sim-racksvoice-gate-b — racks-full voice gate variants (game-code arm)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T0630Z,
axis food-economy, arm sim-racksvoice-gate-b.
Worktree: `~/workspace/worktrees/sim-racksvoice-gate-b`, branch sim-racksvoice-gate-b.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any sim in this run was executed. The RESULTS section
at the end is appended after the sweeps complete and is judged ONLY
against the header.

## Canon read first

- `docs/CANON.md` (manifest), then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; blind penalties teach once)
  and `docs/CONVERSATIONS.md` (dialogue sense bar: real
  back-and-forth, no repeats, context-aware openings — the bar
  racks-full lines are judged against).
- No canon doc covers a racks-full voice cooldown or a
  village-level first-complaint rule — stated, not invented.
  Variants B, C, and B+C below are DESIGNS to measure, not canon.
  The winning variant, if any, becomes a measured design change,
  not a canon claim.

## Background (quoted, NOT re-judged here)

- evidence/2026-10-26/sim-racksvoice-b.md (DIAG-GO census):
  the governing gate is per-cook-per-day voice
  (src/js/game.js cook branch, `this._racksFullVoice[vid] !== day`),
  with no reset; recurrence is MANY cooks each complaining on
  their own cook-days, not one repeating cook. The sense failure
  is frozen-pile repetition: the kcal figure is always true but
  repeats unchanged for days on racks-bound stretches (9755:
  16,256 on all 4 lines; 9752: 17,033 x 11 days). The measure
  stays truthful every resolution; only the voice is gated
  (FOODVOICE2 pattern). Voice fires only when racksFull AND
  eligible surplus exists.
- Census numbers this run is anchored to (cap1, leadfeast, pd0,
  dg1, 100d, seeds 9750-9757): band racksFull total 265; plain
  708; say 1380. Per seed racksFull: 9750: 33, 9751: 4,
  9752: 37, 9753: 64, 9754: 0, 9755: 4, 9756: 17, 9757: 106.
  Distinct complaint days: 9757: 55, 9753: 51. Distinct kcal
  figures: 9757: 29, 9752: 12, 9755: 1, 9756: 17 (every figure
  moved). 9757 plain frames: 221.
- No src/js/game.js change and no scripts/policies change
  between the census commit (4f0bc3335) and this run's head
  (verified: `git log 4f0bc3335..HEAD -- src/js/game.js` and
  `-- scripts/policies/` both empty), so the baseline sweep
  below is expected to reproduce the census exactly. Any drift
  is named, not forced.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

### The variants (all touch the SAME gate, run SEQUENTIALLY)

All variants change VOICE only: the fullness computation
(preservedKcal vs rackCap) still runs every resolution, the
racksFull + eligible-surplus condition is unchanged, and a
silenced complaint becomes the plain frame (exactly what the
2nd/3rd resolution of a cook-day already produces) — no cook
line is deleted, say totals are unchanged, only
complaint -> plain conversion happens. The kept kcal figure
is always Math.round(preservedKcal), the same figure the
current line prints.

- BASELINE (env unset): current per-cook-per-day gate.
- B (village-level first complaint, env RACKSVOICE_GATE=B):
  only the FIRST racks-full complaint each day speaks;
  later cooks that day get the plain frame. State:
  `this._racksFullVoiceDay` = last day any cook's racks-full
  voice spoke. Speak iff day != last spoken day.
  Census expectation: 9757 106 -> 55 (one per racks-bound
  day), 9753 64 -> 51; daily signal kept; frozen-number
  repeats across days untouched.
- C (change-only voice, env RACKSVOICE_GATE=C): a complaint
  speaks only when the kept kcal figure moved since the last
  spoken complaint, village-wide. State:
  `this._racksFullVoiceKcal` = last spoken rounded kcal.
  Threshold: ANY-AMOUNT (moved != last spoken figure).
  Chosen because the census's frozen repeats are exact
  repeats, and any-amount is the most faithful test of
  "the number moved"; a kcal threshold would silence
  genuinely changed piles and is NOT tested here.
  Census expectation: 9757 106 -> ~29 distinct figures,
  9752 37 -> ~12, 9755 4 -> 1, 9756 untouched at 17.
  Scope is village-wide (not per-cook) because the line
  reports the village pile: two cooks quoting the same
  figure on the same day (9757 d44 Miguel + Grace both
  20,187) is the duplicate the census flagged, and a
  per-cook rule would let both speak it.
- B+C combined (env RACKSVOICE_GATE=BC): one voice per day,
  only when the number moved. Speak iff (no voice yet
  today) AND (figure != last spoken figure). The most
  faithful rule on the evidence, but MEASURED, not assumed:
  NAMED RISK — it silences a genuinely changed pile when
  the figure moves between same-day complaints after a
  voice already spoke that day. Tested explicitly: from
  the BASELINE detail arrays, count days carrying two or
  more DISTINCT kcal figures (same-day movement); every
  such day is a day B+C silences a moved figure on.

### Instrument

- scripts/say-capture.js unchanged (proven neutral in the
  census: cap0 vs cap1 numerics identical 8/8). SAYCAP=1000.
- New sweep scripts/sweep-racksvoice-gate-b.js: same
  loadGame-per-seed pattern as sweep-racksvoice-b.js, with
  RACKSVOICE_GATE passed through env; SWEEP_CENSUS=1 stdout
  mode (flap-proof: the long-running sweep process never
  writes files; a short-lived splitter persists per-seed
  JSONs from stdout). Corpus dir (new, never mixed into
  the census corpus):
  evidence/2026-10-26/sim-racksvoice-gate-b-corpus/ — inside
  this worktree, NEVER /tmp as the sole copy.
- New analyzer scripts/analyze-racksvoice-gate-b.js: per-seed
  per-variant table, GO evaluation against the bars below,
  B+C risk count, plain-line re-read.
- New proof test scripts/test-racksvoice-gate-b.js: parser
  checks + corpus assertions (numerics identity,
  structural invariants, GO bars). Run AFTER the sweeps.

### Substrate, seeds, horizon (identical on all configs)

- Policy leadfeast, DEPOSITGATE=1, FEASTSCALE_R13=1,
  SEATDRIVE=0, PLENTYDEPRI=0 (pd0 only), 100d death-aware
  horizon (dead villages stop, +10d tail max). All asserted
  FATAL by the driver.
- Pilot: census band 9750-9757 (8 seeds) per variant:
  baseline + B + C + BC = 32 configs, run SEQUENTIALLY
  (variants share one gate; no concurrent sweeps).
- Winner's confirm: fresh band 9760-9775 (16 seeds),
  baseline + winner only, identical seeds. No confirm spend
  on any variant that fails its pilot bar.
- File names:
  racksvoice-gate-b-<base|B|C|BC>-pd0-dg1-leadfeast-s<seed>.json
  (confirm files add `-confirm` before the seed).

### GO thresholds (binding — judge ONLY against these)

COMMON GUARD (every variant, pilot + confirm): numerics
IDENTICAL to baseline on every seed (daysAlive, batches,
resolutions, deaths, rank, national, waveReach) — voice is
narration, never game state. Any numeric delta = that
variant NO-GO (voice leaked into state). Worked ==
resolutions on every cell. Any cell failing = NO-GO.

- B GO iff ALL: (i) 9757 complaints <= 60 (expect 55);
  (ii) band total <= 212 (>= 20% below census 265);
  (iii) voice days == baseline distinct complaint days on
  8/8 seeds (daily signal kept: one per racks-bound day).
- C GO iff ALL: (i) band total <= 150; (ii) 9756 == 17
  exactly (a tracking village, where every figure moved,
  must be untouched); (iii) kept sequence carries ZERO
  consecutive equal-figure complaints on 8/8 seeds
  (frozen-repeat elimination, verified from detail arrays).
- B+C GO iff ALL: (i) band total <= 120; (ii) 9757 <= 35;
  (iii) 9756 == 17; (iv) same-day-moved silencing count
  == 0 (no baseline day with >= 2 distinct figures is
  silenced into losing a moved figure — the named risk
  realized in data fails B+C outright).
- A miss is NO-GO, never re-scored against a friendlier
  metric mid-run. Metric doubts go under "Metric review".

### Winner selection (pre-registered tiebreak)

- If B+C GOes -> B+C wins (most faithful rule).
- Else if C GOes -> C wins.
- Else if B GOes -> B wins.
- Else NO variant lands: zero src/js changes in the final
  commit (scripts + evidence + corpus only).
- At most ONE variant lands. Killed variants leave NO TRACE
  in the final commit: the final game.js contains only the
  winner's logic (default ON, with an env off-switch
  RACKSVOICE_GATE=0 restoring baseline for regression
  testing, FOODVOICE2_GATE pattern) — or nothing at all.

### Plain-line re-read (mandatory before any "quieter" claim)

- Report plain counts per seed per variant. Silenced
  complaints become plain frames, so plain counts RISE by
  exactly the silenced count and say totals are unchanged.
  LIMIT (stated, not worked around): plain subtypes cannot
  be split from text alone — every plain line is the
  byte-identical frame (2nd/3rd resolutions, racks-full
  without eligible surplus, non-full days with nothing to
  smoke, and now newly-silenced complaints). Quieting
  complaints while plain frames stay high is only half a
  fix; say so if that is what the numbers show.

### Balanced panel (§15)

- scripts/balance-panel.js is a before/after panel RUNNER
  (spawns its own child sims under its own observer with
  --before/--after panel files); it cannot ingest recorder
  corpora. Running a panel would be a different experiment
  under a different observer, not a comparison of this
  corpus. So no panel compare is attached and none is
  faked; the §15-equivalent instrument is the identical-seed
  baseline-vs-variant paired table (same observer, same
  seeds, only the gate env differs), judged by the GO bars
  above. This is the same stance the census took.

### Sense-testing, wall numbers, villager behaviour

- SENSE-TESTING LAW: quote at least 1 kept racks-full line
  verbatim with day/seed/cook/kcal from the WINNER's corpus
  (or the baseline if nothing lands), plus 1 silenced case
  described from detail arrays (day/seed/cooks/figure), and
  judge meaning: does the kept voice still track the
  village, and does the silenced case deserve silence?
- WALL NUMBERS on the pilot corpus: national / table /
  wins, wave 1-5 reach, median survival. NOTE: table = win
  flag, and SEATDRIVE=0 makes the table unreachable by
  construction — table 0 here is a construction fact, not
  a scale-wall finding.
- VILLAGER-BEHAVIOUR SAMPLE: which cooks speak under the
  winner vs baseline (does one cook now dominate the daily
  voice? does the first-complaint rule systematically favor
  the early-duty cook?), and whether worked lines still
  interleave with complaints on the same seed.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- See the "Metric review" subsection under RESULTS below.

### Scope

- Game change (only if a variant wins): src/js/game.js cook
  branch gate only. New files: scripts/sweep-racksvoice-gate-b.js,
  scripts/analyze-racksvoice-gate-b.js,
  scripts/test-racksvoice-gate-b.js,
  evidence/2026-10-26/sim-racksvoice-gate-b-corpus/ (per-seed
  files), evidence/2026-10-26/sim-racksvoice-gate-b.md (this
  file). No push, no version bump, no live verification —
  committed on branch sim-racksvoice-gate-b, pending
  coordinator merge.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY against the header)

### Pilot outcome (written before confirm runs)

CONFIRM CRITERION (pre-registered here, before any confirm sim runs):
the winner (B, per the tiebreak below) confirms iff, on fresh band
9760-9775 (16 seeds, baseline + B, identical seeds): (a) numerics
identical baseline-vs-B on 16/16 seeds; (b) B voice-days ==
baseline distinct complaint days on 16/16 seeds (daily signal
kept); (c) B band total <= 80% of baseline band total. Failing
any of these, B does NOT land despite the pilot GO.

### Pilot corpus

Pilot (census band 9750-9757, 100d, leadfeast/pd0/dg1, 32 configs):
band totals base 265, B 185, C 113, BC 101. Say totals unchanged on
every seed (pilot say total 1350 all variants); plain rises by exactly
the silenced count (base plain 709 -> B 789, +80 = 265-185).
Numerics-identity guard: 0 failures on all variants (voice never
leaked into state); worked == resolutions on every cell.
- B: 9757 106 -> 55 (<= 60), band 185 (<= 212), voice-days ==
  baseline distinct complaint days on 8/8 seeds -> GO.
- C: band 113 (<= 150), consecutive-equal-free on 8/8, BUT 9756
  19 != 17 -> NO-GO. C speaks MORE than baseline on the tracking
  seed: a village-wide change-only state re-speaks figures the
  per-cook gate had already silenced for that cook-day.
- B+C: band 101 (<= 120), 9757 25 (<= 35), 9756 == 17, BUT
  same-day-moved silencing events 6 (must be 0) -> NO-GO.
  The named risk is real in data: 10 baseline days carry 2+
  distinct figures on one day.
Tiebreak: B+C fails, C fails, B GOes -> B WINS. C and B+C leave
no code here (only B's gate, default ON, RACKSVOICE_GATE=0
restores baseline).

### Confirm corpus (fresh band 9760-9775, 16 seeds, baseline + B)

Band totals base-confirm 509, B-confirm 404. Say totals unchanged
(1998 both); plain 803 -> 908 (+105 = 509-404, exact).
- (a) numerics identical baseline-vs-B on 16/16 seeds (all
  compared fields: daysAlive, batches, resolutions, deaths,
  national, table, win, waveReach, rank) -> PASS.
- (b) B voice-days == baseline distinct complaint days on 16/16
  seeds -> PASS (daily signal kept on every fresh seed).
- (c) 404 <= 80% of 509 (= 407.2) -> PASS, with 3 complaints of
  headroom. This is a THIN pass: the confirm gain (20.6%) is
  smaller than the pilot gain (30.2%), because fresh seeds carry
  more single-cook racks-bound days where B changes nothing
  (e.g. 9765, 9766, 9769-9774 identical under B).
CONFIRM VERDICT: B CONFIRMED and LANDS (default ON, variant B only).

### Sense-testing (SENSE-TESTING LAW)

Kept voice (winner B, seed 9760, day 39, cook Kwame, 20,191 kcal —
reconstructed from the corpus detail row + the game.js line
template, which the proof test's T1 fixture matches byte-for-byte
in form): "Kwame cooked for the haven — meals stretched. The racks
are already full (20,191 kcal kept — more than the haven can eat
before it turns), so Kwame left the fresh pile for tonight's dinner
instead of smoking it onto the rot pile." The kept voice still
tracks the village: one true report per racks-bound day, figure
unchanged from baseline.
Silenced case (seed 9757, day 44): baseline has Miguel AND Grace
both quoting 20,187 kcal; B keeps Miguel and silences Grace's
byte-identical quote. That silence is deserved. The honest limit:
day 45 keeps Miguel 20,187 and silences Kealan 19,729 — a genuinely
moved figure lost because it was not first that day. B trades
moved-figure fidelity for one-voice-per-day; that trade is the
reason B+C was designed, and B+C failed its own risk bar, so the
trade stands as measured, not hidden.
Cook dominance under B: on seed 9757 ALL 55 kept voices are
Miguel's (baseline: Miguel 55, Grace 36, Kealan 14, Hryts 1).
The first-complaint rule systematically favors the earliest-duty
cook each day. Acceptable here because the line reports the
village pile, not a personal grievance — but other cooks' voices
do disappear from racks-full days, and that is a real (if small)
voice-diversity cost. Worked lines still interleave: seed 9760
under B, worked by cook Vikram 7, Kwame 21, Nikolai 40, while
racks-full voices are Kwame 7 + Nikolai 25.
Plain-line re-read: quieting complaints while plain frames stay
high is only half a fix, and the numbers say exactly that —
confirm plain 908 still dwarfs racks-full 404. B removes the
duplicate complaint; it does NOT fix frozen numbers across days
(9757 kept figures still repeat across days: 22 distinct figures
over 55 kept voices) and does NOT reduce plain-frame volume.
The frozen-pile repetition across days remains an open blank.
Wall numbers (pilot base): national 6/8, table/wins 0/8
(SEATDRIVE=0 makes the table unreachable by construction — a
construction fact, not a scale-wall finding), median survival
100d (capped), waves 2-4, wave 5 0/8. Confirm base: national
16/16, table/wins 0/16, median 100d, waves 2-4, wave 5 0/16.

### Metric review (§14 — revisions apply to the NEXT run)

- The pilot GO bars were fair to B and fatal to C/B+C as
  designed; no re-scoring was done. C's 9756 overshoot (19 vs 17)
  is a finding about village-wide change-only state, not a bar
  problem — a future change-only variant would need a per-cook
  memory to avoid re-speaking, and that is a new design, not a
  metric revision.
- The confirm bar (c) at 80% passed thinly (79.4%). A future
  voice-gate arm should pre-register an absolute floor (e.g.
  band total AND per-seed worst case) alongside the ratio, since
  a ratio bar passes on bands where most seeds are unchanged.
- The analyzer's "simulation-vs-actual" lines for C/BC (3 and 2
  mismatches) describe the analyzer's own simulation of those
  variants, not corpus errors; they do not touch the B verdict
  (B simulation mismatches: 0).

### Adoption note (coordinator run fleshout-loop-b-20261026T0935Z)

The 0630Z run died after the sweeps with this arm uncommitted
(stale lock 06:57Z, racksvoice heartbeat 08:49Z, no live
processes; old claim retired to .DEAD). This adoption run
verified the corpus with the proof test (274 PASS / 0 FAIL),
completed this RESULTS section from the corpus files (no
re-sweeps; all numbers above are read from the landed corpus
and analyzer outputs, cross-checked in the adoption run),
committed the arm, rebased it onto current master, re-ran the
proof on the rebased tree, and merged it. Final code check on
the winner: env unset 9757 racksFull 55 / 9753 51 (B active),
env RACKSVOICE_GATE=0 9757 106 / 9753 64 (baseline restored);
check.js --quick verification is in the post-rebase section below
(this adoption note was first drafted with the worker's dot-count
of 7 F; the verified counts below supersede it).

### Post-rebase verification (adoption run, on master cc3c5cd9c)

- Proof test on the rebased tree: 274 PASS / 0 FAIL (same as
  pre-rebase).
- Fresh paired runs on the rebased tree (seeds 9757, 9753, same
  sweep, SWEEP_CENSUS stdout): default mode == explicit
  RACKSVOICE_GATE=B exactly (JSONs identical ignoring the ms
  timing field): 9757 racksFull 68 / say 425 / deaths 1, 9753
  racksFull 49 / say 350 / deaths 2. The default is B, not the
  old gate. NOTE: these differ from the old-base corpus
  (9757 B 55 / say 370 / deaths 3) because the sibling
  fishfallback arm changed the shared policy module
  (scripts/policies/competent.js assignAnother) between the
  tree base and current master — a substrate shift, not a gate
  change. The arm's GO verdict rests on its identical-seed
  paired corpus on one base, which the proof test re-verifies;
  fresh runs on a new base are not a re-verdict.
- check.js --quick, rebased tree WITH the arm: 279 passed,
  8 failed (490s). check.js --quick, current master WITHOUT
  the arm: 279 passed, 8 failed (278s) — identical counts.
  The 8 failures on master (no arm) are: test-hide-discovery,
  test-measurement-comparison, test-measurement-proof-update,
  test-measurement-workflow, test-mobile-combat-cadence,
  test-occupation-panels, test-phone-frame-proof,
  test-parity-20261014 — none touches racks voice, cooking,
  or preservation, and the rebased tree's run ended on the
  same failing categories (occupation panels, phone-frame
  proof, parity gear). Conclusion: the 8 failures are
  pre-existing on current master; the arm adds none. A second
  tree rerun saving its full log was LOST to a /tmp wipe
  mid-run (the sibling-cleanup class; /tmp was found empty,
  session tracking reset) and was NOT repeated: identical
  counts plus matching tail categories plus unrelated
  failure domains already settle attribution, and a third
  run would only re-confirm the same 8.
- The worker's pre-rebase check-quick.log dot-count of 7 F
  is NOT used as evidence anywhere in this verdict: that log
  carries no failing-script names, and both post-rebase runs
  (with and without the arm) show 8.
