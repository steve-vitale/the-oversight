# Journey — succession r230 (Lane B leg 7, 2026-11-17)

## Prereg (binding)
- **Leg question:** does the gap-subtraction MANTLE-FINE revision pass on a
  fresh band, does the r231 C3d fix hold in the wild on the succession
  leg, and does the F5 branch finally fire in the wild (third panel
  attempt)?
- **Fix arm:** NONE in src/js — C3d already landed via journey-social-life
  r231 (db83d5ccd, proof 35/35). This run is instrument-only: the r230
  analyzer clone with the gap-subtraction revision + F5/C3d wild checks
  + F5 proof-test re-run on this base.
- **Metric revision:** MANTLE-FINE fineLatency is now GAP-SUBTRACTED
  (first roll with the new bearer, minus unrecorded-transition days).
  Corpus proof before the panel: the r230 analyzer over the r229
  corpora reclassifies ONLY 34314 d41 (UNEXPLAINED-1 →
  SAMPLING-or-CLEAN, gapDays=1); over the r224 corpora it changes
  NOTHING (19 rows, 0 changed). Guard passed exactly as shadow-proven.
- **Seeds:** fresh band 34321–34324 (verified 0 hits in any prereg/
  evidence .md or goal .md), smoke 33998. EARLY_KILL_DAY=40,
  POST_DAYS=70 (smoke 5/25).
- **Bars:** MANTLE-FINE (revised), DRY CENSUS (any-hit-fails), WILD
  CHECK (F4a/F4b/F4c/F5/F6/C3c/F2/C3d), C3d WILD HOLD (0 erasures),
  F5 WILD EXERCISE (branch fires ≥1× AND 0 F5-class dry hits;
  zero-fire = finding), CONTROLS (smoke S_fixed d7 Ashanti 10/2/33).

## Panel (all 5 seeds exit 0, analyzer exit 0)
- **MANTLE-FINE: PASS.** 11 deaths observed, 0 flippedImmediate=false,
  0 fineLatency>=2, 0 unexplained-1, 0 day-skips. All gapDays=0 on
  this panel — no missing-roll row appeared, so the revision was
  validated by the corpus proof, not exercised by a gap row in the
  wild. All 11 flips synchronous, pick rank 1, funeral INCALL true
  on all 5 seeds.
- **DRY CENSUS: PASS — 0 dry hits across the panel (0 honest
  fallbacks, 0 null-return silences).** Second fully-clean dry census
  in a row on the leg.
- **F5 WILD EXERCISE: NOT VACUOUS — FIRST WILD FIRE SINCE r224.**
  The settled-favor branch fired 2× via alive:want ask_favor, with
  2 DISTINCT variants: 34321 d+45 Aria "Honestly? It's done.
  Finished. Thank you for checking — it means something that you
  did." and 34321 d+53 Aria "No, really — it's handled. Thanks for
  asking, though." The dlg:help settled acknowledgment ("It's
  already handled. Thank you for asking.", convo-dialogue.js:547)
  fired 2× more, once per sitting (spends the choice; honest
  repeat across sittings). The third r225 variant ("It's taken care
  of, I swear…") never fired in the wild. 0 F5-class dry hits.
  Targeted harness (r225 proof test) re-run on this base: 22/22.
- **C3d WILD HOLD: PASS — 0 erasures.** 57 recap questions asked
  across the panel; only 2 served the recap-empty pool, both
  Aria's (34321 d+45 "Small talk, that's all. Nothing worth
  repeating." and d+53 "We were just talking. Nothing important."),
  both adjudicated HONEST on the Onni/Ruth line: no live want had
  been surfaced yet at recap time (the ask_favor pick comes after
  the recap in both sittings), no open favor, no unanswered
  question — the pool was the honest fallback. The fix's live-want
  path (convoRecapLiveLine) was never triggered on this panel: no
  recap fired while a live want was open. The hold is "0 erasures",
  not a positive live-want serving.
- **F6 WILD HOLD: PASS.** 0 dry on the stage-0 opener sites
  (covered by the 0-hit DRY census).
- **C3c WILD HOLD: PASS.** 3 favor-naming resume openers; all name
  the LIVE favor: Hoani d+54 "that water haul" (0 liters, re-asked
  in the same sitting: "The cistern's nearly dry — 0 liters left.
  I need someone to haul water with me at first light."); Ellie
  d+3 "that foraging help" (the sitting IS the live pantry-run
  ask, carried from the dead Sanjay); Felix d+64 "wanting to prove
  they're useful" (live want, quoted verbatim). 0 stale labels.
- **F2 WILD HOLD: PASS.** 0 narration quotes in resume-opener
  memory quotes. All quoted beats are pure speech ('I checked the
  cistern three times hoping I misread it. 0 liters.' / 'Give me
  the hard job. Please. I need the hard job.' / 'I know the ridge
  above the creek — come with me and we'll…'). Seam (not a
  failure): Hoani d+54's opener carries an embedded newline that
  splits one NPC turn across two transcript lines.
- **CAP-NC: INSUFFICIENT-DATA** — bonded-by-deadline 1/1 eligible
  seeds (34322 Meera, newcomer arrived d+47, bonded by d+61);
  denominator <3. bondedEver 1/1 probe-opened seeds. OPP:
  unbonded talk-requests 1 (Gaspar d48); FIRST-bearer bonds on
  undriven days 2; NPC-NPC new bonds 24; newcomer arrivals 3;
  selfReqDayEntries 0 (r133 purge holds).
- **CONTROLS: DRIFT — smoke snapshot MOVED, re-baselined by
  measurement (per prereg).** Smoke 33998 now reads d6
  Heinrich→Grace, alive 11, fallen 1, newTrust 43 (was S_fixed d7
  Ashanti 10/2/33). The mantle machinery is intact on the smoke
  (flip synchronous, pick rank 1, funeral INCALL true; Grace is
  the trust-top pick, trust 43). The drift is a one-day phase-A
  difference: after 5 days of competent play the game sits on day
  6, not day 7 — a day-boundary crossing moved under the landings
  since r229's base (candidates: the r231 C3d fix and the
  establishment r231 settled-ledger fix, both in convo flow and
  RNG consumption, plus the zeroattempt villageSlainN read fix;
  no bisect run — the control exists to detect drift, and it did).
  New S_fixed for the next run: **d6 Grace 11/1/43**. No src/js
  change was made this run, so nothing here is attributable to
  r230.
- **Day-skips: 0** — fifteenth straight panel at zero.

## Village assessment (plain words)
- **34321 — Fiona hands the mantle to Elena on day 40** (trust 71,
  11 alive, 1 fallen) — and then NOTHING. No further deaths in 70
  days: ended day 111 with 10 alive, pantry 11,103, 55 bonds. The
  quiet village, again: one bearer, one death, a village that just
  keeps eating. Aria (trust 100) is the voice of this village.
- **34322 — Sanjay hands the mantle to Emmett on day 41** (trust 59,
  10 alive, 2 fallen). Three more deaths (Emmett→Catalina d51 the
  arena, Catalina→Cameron d74 the wild, Cameron→Ellie d84 the
  arena) and the village still stood at day 111: 9 alive, pantry
  4,986, 63 bonds. The hardest chain on the panel — four bearers —
  and the thinnest pantry at horizon. Meera the newcomer bonded to
  the bearer by deadline.
- **34323 — Ethel hands the mantle to Maureen on day 41** (trust 58,
  11 alive, 1 fallen). Two more deaths (Maureen→Rowan d89 the
  wild, Rowan→Alfredo d95 the wild) and the village held: 9 alive,
  pantry 10,046, 49 bonds at day 110.
- **34324 — Austin hands the mantle to Gilberto on day 41** (trust
  58, 11 alive, 1 fallen). One more death (Gilberto→Catalina d49
  the wild); ended day 111 with 9 alive, pantry 8,790, 59 bonds.
- **33998 smoke — Heinrich to Grace on day 6** (trust 43, 11 alive,
  1 fallen). Short window; ended day 31 with 11 alive, pantry
  22,223.
- No village won, none ended. The mantle itself never failed: every
  death passed it on the same day, to a living successor, with the
  funeral beat firing every time. Water, not food, is the pressure
  again: the water-haul favor (0 liters) is live on two villages.

## People check (10 full transcripts)
Conversations read like people talking, not menus. Aria (34321,
trust 92–100) takes the Scout role from Axel ("Roles. Not ranks —
promises."), carries a live creek-water favor with concrete
requirements ("I checked the cistern three times hoping I misread
it. 8 liters. We walk together and each carry two liters back."),
and grieves the dead by name. Meera (34322 d+64, trust 91, the
bonded newcomer) confesses she has been skimming extra food ("I'm
ashamed and I can't stop."), asks for a secret to be kept, and
asks who the bearer doesn't trust. Felix (34324 d+64, trust 97)
resumes a 10-day-old thread about proving himself useful ("Give me
the hard job. Please. I need the hard job."), teaches Okra and
Water Lily, and vouches for Hoani ("I'd trust Hoani with my
pack."). Ashanti (33998 d+14, trust 94) answers what she did for
fun before the end, grieves Heinrich, and takes Scout from Ruby.
Ruby (33998 d+7, trust 91) teaches Elderberry ("And I've been
walking past it for weeks."). Ellie (34322 d+3, trust 90) carries
a pantry-run favor from the dead Sanjay ("I asked Sanjay about the
pantry run — Sanjay's gone. Still need hands."). Hoani (34324
d+54, trust 94) resumes the water haul at 0 liters and drops the
ask aloud when refused ("Forget I asked. I'll figure it out.").
Watch item (second straight panel): the mourning lines are still
templated per dead person — "I keep expecting to see X at the
fire. Stupid." fires 5×, "The fire feels smaller without X" 2×,
"I keep turning over the last thing X said to me…" 4×. Same
words, only the name changes. Honest, but shared verbatim.

## Fixes landed this run
- NONE in src/js. Instrument-only: the r230 analyzer clone with the
  MANTLE-FINE gap-subtraction revision (+ corpus proof), the r230
  driver/runner clones, and the prereg. No game code changed.

## Telemetry
`telemetry-check.js` vs succession baseline, per-seed tele files:
**quiet** (5 files, 5 metrics, no large deviations). Note: the
checker's --current glob must be the `*-tele-*.json` files — the
stdout.json records hold the metrics under `tele`, which the
checker does not read (first invocation against stdout.json read
all zeros; re-run against tele files is quiet). **Baseline NOT
rolled.**

## Gate
`node scripts/check.js --quick` (evidence/2026-11-17/journey-
succession-r230-gate.log): **333 passed, 7 failed in 1126s, 0
attributable.** The 7: 3 exact-120s timeouts (living-garden,
one-person-army, trust-observer-neutrality — box-load class, same
as r229; the sibling deathcleanup gate ran concurrently);
measurement-proof-update + measurement-workflow (standing staleness
pair); phone-frame-proof 3/3 (standing stale receipt);
ladder-bundle 78/1 (standing "200 monster turns" control failure).
All 7 are in r229's standing failure set (r229: 329/11). This run
is instrument-only (no src/js changes), so attribution to the run
is impossible in principle; no standalone re-runs were done this
run (time — the gate took 18.8 min under sibling load).

## Metric review
- **MANTLE-FINE gap-subtraction (r230 bar): the revision holds.**
  Corpus proof exact (only the known artifact row moves; r224
  corpora untouched) and the fresh panel passes with all gapDays=0
  — the revision was not exercised by a gap row in the wild this
  panel, so it stays the binding metric with the corpus proof as
  its guard. No further revision proposed: the instrument now
  handles both known artifact shapes (0-day sleep, missing roll).
- **F5 vacuous twice → FIRED.** The branch fired in the wild for
  the first time since r224 (2 alive:want firings, 2 distinct
  variants). The vacuous watch closes; the third variant ("It's
  taken care of, I swear…") is the one never seen wild — a
  curiosity, not a bar. The harness (r225 proof test, 22/22 on
  this base) stays the standing proof.
- **C3d wild hold:** 0 erasures on the succession leg; the fix's
  live-want path never engaged (no recap while a live want was
  open). The bar stays; a future panel with a live-want recap
  would give the positive evidence this one could not.
- **DRY CENSUS any-hit-fails:** working as intended — second
  fully-clean census; the bar stays.
- **CAP-NC:** no revision — the denominator stays starved by
  design (1/1 this panel).
- **Day-skip watch:** fifteenth straight panel at zero.
- **Smoke bar re-baselined by measurement:** S_fixed is now d6
  Grace 11/1/43 (drift since r229, recorded above).
- **Grief templates:** confirmed a second panel — carried as a
  watch item for a future build (personalized mourning lines), not
  a fix item for this loop.
- Proof refresh rounds 11 + 12 remain owed (not this run's).

## Reachable / fun / winnable
- **Reachable:** yes — the mantle passes on every death, the
  funeral beat fires, successors keep living their lives (bonds,
  favors, grief, roles, teaching). The leg's content is all
  reachable in ordinary play.
- **Fun:** yes — the late sittings are the best conversations on
  the panel (confessions, role promises with real stakes, favors
  carried past a death). The grief templates are the one moment
  the game sounds like a machine wearing different names.
- **Winnable:** not judged here — no village won on this leg, and
  succession measures the handoff chain, not the win. The chain
  itself holds: 11 deaths, 11 clean passes.

## Run bookkeeping
- Base master b4cdf252d; tooling commit 9ed2f39f9 (prereg + driver/
  analyzer/runner clones + MANTLE-FINE revision + corpus proof +
  panel evidence); run-note commit d797c0560.
- Registration took ~9.5 min (08:56→09:05Z). Heartbeat loop (5-min
  cadence) started 09:07Z; no gaps.
- Index clobber struck on both safe-commits (8th + 9th sightings) —
  repaired via the ls-tree pipe both times; commits verified
  correct, status empty after (plus a mode-only hbloop entry on the
  first, chmod 644 to match the committed 100644 house norm).
- Rotation-b: 7 → 4. Lock: deleted at closeout.
- Merge: ff-only d797c0560 (base current at merge, no rebase needed;
  gate 333/7, 0 attributable). Tree released, branch deleted,
  rotation-b 7 → 4, lock deleted.
