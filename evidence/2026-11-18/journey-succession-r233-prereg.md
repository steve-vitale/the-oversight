# Journey succession r233 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r233 play or fix. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r233: follows crisis r241 (2026-11-18). Base:
master c4a9ba498 at run start. Lock: playtest-loop-2.lock run_id
2026-11-18T17:55:50Z (own, created at run start; no prior lock present;
main tree clean, disk 51%).

## Standing state (why this run plays leg 7, and what it carries)

r232 succession (2026-11-17) passed every bar except REL-VET, which
recorded FAIL as written (0 veteran-variant servings on 6 opener draws
in both-veteran convos — a roughly 1-in-5 outcome under even draws, not
a broken gate) and left REL-WIT INSUFFICIENT-DATA (0 witnessed deaths
on the panel). Its metric review filed two revisions this run adopts:

- **REL-VET denominator revision (ADOPTED)**: the bar counts opener
  draws in both-veteran convos, not qualifying convos. PASS = >=1
  veteran-variant serving on >=10 opener draws in both-veteran convos
  AND 0 unheld servings; fewer than 10 draws = INSUFFICIENT-DATA on
  the positive arm (the negative arm still binds).
- **WITNESS diagnostic arm (NEW this run)**: if this panel also sees
  0 witnessed deaths, the question becomes whether any death path the
  panel exercises populates witnesses at all. This run answers it with
  (a) a static audit of every registerDeath call site (below) and (b)
  a per-seed corpse-witness census (new driver instrument
  `rec.corpseCensus`: every corpse at end of run with kind, cause,
  witness count and witness names).

r232 also carried: F5 rolling 3-panel window (rolls to r231+r232+r233
this run), multi-name relationship mourning open (not built), proof
refresh rounds 11 + 12 owed (not this run's), KIN mourning unavailable
(no kin signal between villagers — recorded, not built).

## Witness static audit (traced before the panel, not guessed)

`registerDeath(opts)` stores `witnesses: opts.witnesses || []`
(corpses.js:245). Person/villager-death call sites:

**Pass witnesses (non-empty possible):**
- src/js/game.js:40314, 40324, 40370 — combat deaths in tbDamage,
  `witnesses: this.fightWitnesses(t.villagerId)` (living villager
  fighters in the fight + the scholar; corpses.js:130-143).
- src/js/statusEffects.js:407 — combat death,
  `witnesses: self.fightWitnesses(...)`.
- src/js/alienPlayers.js:3212 — alien_beam death, fightWitnesses.
- src/js/betrayal.js:1069 — ambush death, `this.witnesses(6)`.
- src/js/game.js:48481, 48782, 48813 — phoenix-link deaths,
  `witnesses: [this.villagerId]` (the scholar ONLY — no villager can
  ever qualify as witness for these corpses).

**Pass witnesses: [] explicitly:**
- src/js/party-formal.js:581 — split-fight death, `witnesses: []`.

**No witnesses field (default []):**
- src/js/ledger.js:744 — playerDeath (THE BEARER — every scripted
  handoff this panel stages, and every organic scholar death).
- src/js/contests.js:6121 — contest death.
- src/js/game.js:8391 — injuries; :29268 — wound that wouldn't close;
  :33113 — thirst.
- src/js/hierarchy.js:3869 — raid; src/js/villageAgency.js:1296 —
  raid-defense; src/js/villager-agency.js:787 — monster kill (mName
  cause).

**Monster-only sites** (irrelevant to mourning, witnesses populated
but kind is 'monster'): app.js:20159, game.js:47154, 40419, 8194,
21033, havenGrowth.js:936, villager-mapmem.js:219.

Structural prediction: the deaths a succession panel stages are
overwhelmingly bearer deaths via playerDeath (no witnesses) plus
organic villager deaths from injuries/wounds/thirst/raids/monster
kills (no witnesses). The ONLY person-death paths that can put a
villager's id on a corpse are witnessed combat kills (tbDamage /
statusEffects / alien beam) and betrayal ambushes. The witness
variant is therefore reachable only when a villager dies in a fight
another villager was in — rare in a 40+70-day competent-policy
window, which is the r232 zero, explained, not a defect in the
variant gate. The census measures the actual rate; if it is 0 again,
the finding stands as a supply fact (filed, not fixed by inventing
witnesses for deaths nobody saw).

## Questions (r233)

(1) REL-BOND (binding, carried): PASS = (a) >=1 bond-variant serving
    where relMap shows close (v>=20 or depth>=1), AND (b) 0 servings
    where NOT close.
(2) REL-VET (binding, REVISED denominator): PASS = (a) >=1
    veteran-variant serving on >=10 opener draws in both-veteran
    convos, AND (b) 0 servings where either is not a veteran. Fewer
    than 10 opener draws in both-veteran convos = INSUFFICIENT-DATA
    on arm (a); the negative arm still binds. Opener draws counted
    from the transcript scan: opener-shape servings in convos whose
    rel snapshot shows bothVet.
(3) REL-WIT (binding, carried): PASS = (a) >=1 witnessed serving
    AND (b) 0 servings where not witnessed. If no witnessed death
    occurs, (a) is INSUFFICIENT-DATA — and the WITNESS-CENSUS
    diagnostic (Q13) answers WHY.
(4) MOURN-TEMPLATE (binding, carried): 0 same-speaker same-shape
    firings for different dead AND 0 different-speaker same-shape
    same-dead firings within 5 days. 19 shapes.
(5) MOURN-EXHAUST (binding, carried): 0 servings of the exhausted
    line in a mourning sitting.
(6) MANTLE-FINE (binding, carried, gap-subtraction): 0
    flippedImmediate=false outside VILLAGE-OVER, 0 fineLatency>=2,
    0 unexplained fineLatency==1, 0 day-skips.
(7) DRY CENSUS (binding, carried): 0 dry hits of any class.
(8) WILD CHECK (binding, carried): 0 regressions on F4a/F4b/F4c/F5/F6/
    C3c/F2/C3d and the carried landed-fix surfaces.
(9) C3d WILD HOLD (binding, carried): 0 C3d-class erasures.
(10) F5 WILD EXERCISE (binding, rolling 3-panel window r231+r232+
    r233): the settled-favor branch fires >=1x across the window
    (r230 fired 2x, r231 vacuous, r232 vacuous) AND 0 F5-class dry
    hits. Targeted harness (r225 proof test) re-run on this base.
(11) CONTROLS (binding, smoke bar S_fixed from r230): smoke 33998
    at-death snapshot = d6 Grace 11/1/43 + machinery (pick rank 1,
    funeral INCALL true, selfReq 0 on every seed). If the smoke
    snapshot moves, it is base drift since r230, recorded as such and
    the bar re-baselines by measurement, not adoption.
(12) Descriptive: CAP-NC bonded-by-deadline among eligible;
    denominator < 3 stays INSUFFICIENT-DATA. HABIT-COLLISION: 0
    same-seed same-habit servings. Per-kind relationship-variant
    serving counts; witness-populated corpse count; both-veteran convo
    count and opener-draw count.
(13) WITNESS-CENSUS (diagnostic, NEW): per-seed corpse census —
    person corpses total, person corpses with witnessN>0, their
    causes, and whether any bearer corpse carried witnesses. A 0
    witnessed-corpse panel + the static audit above = the supply
    answer for REL-WIT; a witnessed corpse with no witness-variant
    serving on its mourning convos = a gate/engagement question for
    the next run.

## Panel

- Driver: scripts/journey-succession-r233-20261118.js (r232 driver,
  rename only, PLUS the corpse-witness census instrument in
  finish(): `rec.corpseCensus` snapshots every corpse at end of run
  — villagerId, name, kind, cause, witnessN, witnessNames. Read-only;
  zero src/js changes).
- Analyzer: scripts/analyze-journey-succession-r233-20261118.js
  (r232 analyzer, rename only, PLUS the REL-VET revised denominator
  and the WITNESS-CENSUS panel section reading rec.corpseCensus).
- Panel runner: scripts/run-journey-succession-r233-panel.sh (r232
  runner, rename only).
- Proof test: the r232 relationship-mourning proof test
  (scripts/test-journey-succession-r232-relationship-mourning-20261117.js)
  is the standing guard for the REL-MOURN fix; re-run on this base.
  No new src/js change is planned this run, so no new proof test.
- Seeds: FRESH BAND 34351–34354 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34351 alone to verify the driver runs
  clean on this base; then the remaining 3 seeds sequentially, then
  smoke. The panel runner is launched with nohup so it survives the
  coordinator's execution limit.

## Seed-band freshness (local_seed_band_freshness)

- Word-boundary grep for 34351/34352/34353/34354 over
  evidence/**/*.md: 0 hits each. Same grep over the goal
  hidden_files .md files: 0 hits each. (Comparison: 34341–34344 =
  r232 panel; 34331–34334 = r231; 34321–34324 = r230; 34311–34314 =
  r229; 34301–34304 = r224; 34291–34294 = r218; 34281–34284 = r209;
  34271–34274 = r202; 34261–34264 = r197; 34251–34254 = r193;
  34241–34244 = r187; 34231–34234 = r183; 34221–34224 = r181;
  34211–34218 = r177; 34201–34208 = r169; 34011–34018 = r169; 33998 =
  standing smoke control.)
- Band 34351–34354 is FRESH. The smoke seed 33998 is a re-run of the
  standing control, not a fresh reservation.

## Bars (binding, §14)

- REL-BOND (binding, carried): PASS — >=1 bond-variant serving
  where close AND 0 servings where not close.
- REL-VET (binding, REVISED): PASS — >=1 both-veteran serving on
  >=10 opener draws in both-veteran convos AND 0 servings where
  either is not a veteran; fewer than 10 opener draws =
  INSUFFICIENT-DATA on arm (a).
- REL-WIT (binding, carried): PASS — >=1 witnessed serving AND 0
  servings where not witnessed; no witnessed death =
  INSUFFICIENT-DATA on arm (a).
- MOURN-TEMPLATE (binding, carried): PASS — 0 same-speaker
  same-shape firings for different dead AND 0 different-speaker
  same-shape same-dead firings within 5 days (19 shapes).
- MOURN-EXHAUST (binding, carried): PASS — 0 exhausted-line servings
  in a mourning sitting.
- MANTLE-FINE (binding, carried, gap-subtraction): PASS — 0
  flippedImmediate=false rows outside VILLAGE-OVER, 0
  fineLatency>=2 (gap-adjusted), 0 unexplained fineLatency==1,
  0 day-skips.
- DRY CENSUS (binding, carried): 0 dry hits of any class.
- WILD CHECK (binding, carried): 0 regressions on F4a/F4b/F4c/F5/F6/
  C3c/F2/C3d and the carried landed-fix surfaces.
- C3d WILD HOLD (binding, carried): 0 C3d-class erasures.
- F5 WILD EXERCISE (binding, rolling window r231+r232+r233):
  settled-favor branch fires >=1x across the window AND 0 F5-class
  dry hits. Targeted harness (r225 proof test) green on this base.
- CONTROLS (binding, smoke bar S_fixed): smoke 33998 at-death
  snapshot = d6 Grace 11/1/43 + MANTLE-FINE clean + pick rank 1,
  funeral INCALL true, selfReq 0 on every seed.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA. bondedEver
  reported descriptively.
- DAY-SKIP WATCH (metric review, not a bar): record day-skips; any
  non-zero count re-opens the build question.

## What would count as interesting

- A relationship variant served WITHOUT the relationship (a
  fabrication). FAIL LOUDLY.
- A bond variant never firing despite close bonds per seed.
- A witness variant firing with witnesses=[] (instrument bug).
- A witnessed corpse on the census whose mourning convos never drew
  a witness opener (engagement question, not a gate failure).
- Zero witnessed corpses on the census AND zero witnessed deaths
  (the supply answer for REL-WIT — finding, filed).
- A veteran serving on >=10 opener draws with 0 holdings (the gate
  fires but the pool never lands it — engagement question).
- A MOURN-TEMPLATE repeat through the 19 shapes.
- A DRY hit on ask:lately (emission-block cost, realized).
- A C3d-class erasure / F5-class dry hit / stale-favor resume /
  narration-quote opener (carried-fix regressions).
- Any MANTLE-FINE miss on the fresh band (regression).
- A live-want recap serving (positive evidence the C3d fix
  engages).
- Smoke snapshot move vs S_fixed (base drift since r230).
- CAP-NC denominator >= 3 for the first time in several runs.

## Metric review (carried)

- r229's telemetry baseline was NOT rolled (means-vs-sum mismatch
  documented in their run notes). This run runs telemetry-check
  against the succession baseline and reports LOUD lines; it does
  NOT roll the baseline forward until the mismatch is resolved.
- REL-VET revised this run to the opener-draw denominator (r232
  proposal, adopted): the positive arm binds only at >=10 opener
  draws in both-veteran convos.
- F5 WILD EXERCISE rolling 3-panel window rolls to r231+r232+r233
  this run.
- DRY CENSUS amendment stands (any dry hit fails).
- MANTLE-FINE stays the gap-subtraction revision (r230); no further
  revision proposed.
- C3d wild hold: the fix's live-want path never engaged on r230,
  r231, or r232 (no recap while a live want was open). The bar stays.
- CAP-NC: no revision — the denominator stays starved by design.
- Day-skip watch: eighteenth straight panel watch.
- Proof refresh rounds 11 + 12 remain owed (not this run's).
- KIN mourning: NOT in this run's scope — no signal exists.
- Multi-name relationship mourning (bond variant for losing two at
  once): open, not built.
