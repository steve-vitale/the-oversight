# Journey succession r279 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r279 play or fix. Rotation-b read 7 at run start;
this run writes 4 (endgame next) at closeout and VERIFIES the file
reads 4 afterwards. Run number r279: follows succession r268
(2026-11-23, landed; rotation-b 7→4 was its closeout's job — the
file reads 7 because the endgame/crisis closeouts cycled it back
through 4→5→6→7; this run plays the leg the file says, 7, and
writes 4). Base: master `bf7444a49` at registration. Lock:
playtest-loop-2.lock run_id `playtest-loop-2-2026-11-24T06:02:12Z`
(own, created at run start; no prior lock existed — the main tree
showed one untracked sibling file at first check, committed by the
sibling before the re-check, tree clean at registration).
Worktree: `~/workspace/worktrees/journey2-7` (registered; heartbeat
loop `journey2-7-hbloop-r279.sh` every 5 min, setsid). Pre-flight:
main tree clean, disk 49%, reaper ran clean (13/16 active, all LOUD
lines known dirty held trees, nothing removed). Registration took
~6.5 min (slow `git reset --hard` under sibling load, not a
failure — the worktree verified clean at `bf7444a49` after).

## Standing state (why this run plays leg 7, and what it carries)

r268 succession (2026-11-23) landed the stage-2 prefixed retry in
`topic2Ask` (table-pool exhaustion fix, proven by its proof test)
and ended with REL-WIT INSUFFICIENT-DATA: WIT-SIT v3 staging
(post-phase-only, single-fresh-only) bought draw purity at the cost
of draw count — 1 sitting (r267's v2: 5), 1 single-fresh draw
(r267: 3), 0 servings (r267: 1) — and the one draw it bought was
unservable from the start: the sitting was NONVERBAL (speaker
Yanina speaks only Spanish, no shared words with the scholar), so
no witness-variant mourning line could be served in it. The r268
note filed TWO instrument items for this run, on the staging
design (not the game): (a) filter for a shared language — a
nonverbal sitting cannot serve the variant; (b) record skip
reasons — silent returns hide whether supply was spent by the
multi-fresh gate or by scan timing. Its metric review adds the
v2-vs-v3 call: r267's v2 outperformed v3 on every count that
matters.

This run carries ONE filed item, the staging redesign, as its
single variable. There is NO game-code change planned: the stage-2
fix is landed and wild-confirmed (DRY CENSUS 0 on r268), and the
open game questions (topic2Beat follow-up gap, mourning total-pool
exhaustion) are filed to promote ONLY if this panel shows a wild
hit. The panel DOES carry all the binding bars below, so any
regression in the landed fix surfaces here.

## Variable (instrument): WIT-SIT v4 — v2 coverage + language filter + skip ledger

**The staging change (driver only, no game code).** Four changes
to `tryWitSit` in the r279 driver fork (from the r268 driver):

1. **Restore the phase-A pre-death scan** (v2 behavior, removed
   in v3). Sittings stage in both phase A and phase B again.
   Rationale, decided before play: v3's post-phase-only removed
   coverage on an unproven purity claim, and r267's v2 (5
   sittings, 3 single-fresh draws, 1 serving) outperformed v3
   (1 sitting, 1 draw, 0 servings) on every count that matters.
   The REL-WIT arm judges post-death sittings, but pre-phase
   sittings are the same instrument on the same variant — the
   analyzer counts them in the same draws.
2. **Remove the single-fresh-only gate** (v2 behavior). Multi-
   fresh windows stage again. Rationale: same — v3 collapsed
   total sittings 5→1. Single-fresh draws are still counted
   separately by the analyzer for the REL-WIT 3-draw floor; a
   multi-fresh sitting is a draw on the variant in a multi-name
   window (counted in the MULTI-NAME descriptive), not a wasted
   sitting.
3. **Language filter (new).** A witness may sit only if the
   scholar shares a language with them: `Game.commLevel(id).level
   !== 'none'` ('full' or 'partial' — words exist, the variant
   can be served; 'none' is a nonverbal sitting, gestures only).
   The speaker picker tries unused living witnesses in order and
   takes the FIRST with a shared language; if the first witness
   is nonverbal but a later one shares a language, the later one
   sits. If NO unused living witness shares a language, the death
   gets a skip record (see 4) and is NOT exhausted — a later scan
   day may still stage it (language exposure can change), and the
   record stands as a day-0 observation.
4. **Skip ledger (new).** When a witnessed death in the 0–1 day
   window gets no sitting, push a `!fired` record with a reason,
   once per death per reason:
   - `no-living-witness` (existing, first attempt only — the
     r262 record);
   - `no-shared-language` (new — living witnesses exist, none
     shares a language with the scholar);
   - `cap` (new — the 4-sittings/seed cap blocked a candidate
     death; the cap check moves AFTER the candidate filter so a
     blocked candidate is visible).
   Already-staged-twice deaths are NOT recorded as skips (a third
   sitting is out of scope by design, not a missed opportunity).
   The analyzer tallies `!fired` records by reason instead of
   lumping them under no-living-witness.
   **Post-hoc unscanned list (new, driver `finish()`):** witnessed
   non-lineage person corpses in the end-of-run census with NO
   witSit record at all (fired or !fired) are listed in
   `rec.witUnscanned` with dayDied — the scan-timing miss
   measure the r268 filing asked for. A lower bound (the corpse
   list is capped at 40); deaths on the final panel day may be
   unscanned because no scan ran after them, and the dayDied
   field lets the analyzer say so.

Cap stays 4/seed; double-staging per death stays (different
witness, next-day second sitting); the 0–1 day freshness window
stays; the analyzer's WIT-SIT descriptive, MOURN-TEMPLATE
double-stage exemption, and REL bars are unchanged except the
skip-reason tally and the unscanned descriptive.

## Expected outcome, stated before play

- Sittings should return to ~r267 levels (5 on 24 fresh seeds)
  with servable draws: every fired sitting's speaker shares a
  language with the scholar (0 nonverbal-despite-filter sittings
  — the analyzer flags any fired sitting whose transcript has
  zero spoken NPC lines).
- Single-fresh draws ≥3 (the REL-WIT floor) is hoped, not
  assumed: with v2 coverage restored the draw count should
  recover, and the language filter should stop the instrument
  spending its one draw on a nonverbal speaker.
- If single-fresh draws come in below 3 again, REL-WIT returns
  INSUFFICIENT-DATA and the staging design gets revisited next
  run — the instrument, not the game, is still the wall.
- Skip ledger should account for the supply: every witnessed
  person corpse either stages, or appears with a reason
  (no-living-witness / no-shared-language / cap), or appears in
  the unscanned list with a dayDied that explains it. A
  witnessed corpse with NO record and NO explanation is a
  staging-design miss, filed for the next run.

## Proof test

None new: this run changes no game code, so there is no fix to
prove. The carried proofs re-run on this base (WILD CHECK):
r262 escalator-cap, r254 multiwit, r232 relationship-mourning,
r225 F5 harness (22/22), r258 selfwit, r267 mourning-dry, r268
table-dry (the stage-2 fix must stay green). The pilot seed is
the instrument test: its stdout.json must show the driver running
clean on this base (no `wit-sit threw` anomaly, witSit records
carrying reasons) before the panel expands.

## Bars (binding, §14 — carried from r268 unless noted)

- DRY CENSUS (binding): 0 dry hits of any class on the fresh
  band. (Stage 2 is landed; a dry hit on a non-mourning topic
  where stage 2 should have engaged would indict the fix —
  investigate, do not re-score. A dry hit on a mourning
  FOLLOW-UP would promote the filed topic2Beat fix.)
- MOURN-TEMPLATE (binding, carried, AMENDED r263): 0
  same-speaker same-shape firings for different dead AND 0
  different-speaker same-shape same-dead firings within 5 days,
  EXCEPT pairs that are the two sittings of one double-staged
  death (same deadId, consecutive days, different speakers).
- SUPPLY (binding, the screen's question): witnessed person
  corpses across the 24 fresh seeds. SUPPLY-PRESENT if ≥1;
  SUPPLY-ZERO if 0. Rate reported either way, with the
  cause×witness breakdown judged against the corrected map
  (combat inside a bearer-present tbfight OR ambush with a
  bystander within 6 tiles; `hurtVillager` still passes none).
  The census count stays a lower bound (40-entry cap; the
  wit-sit live scan stays the backstop).
- MONSTER-WITNESS (binding, instrument check): monster corpses
  with witnesses ≥90% panel-wide (r268: 883/883 = 100%). Below
  that, the census reader is broken and the screen is invalid.
- STAGE (binding, carried, conditional on supply): ≥1 staged
  wit-sit fires on a supplied seed with a living witness
  speaker, inside the fresh window.
- REL-WIT (binding, carried, conditional): PASS = ≥1 judged
  witness-variant serving with rel.witnessed true AND 0 servings
  where not witnessed, on staged sittings, naming the latest
  dead. Fewer than 3 single-fresh draws (fired &&
  freshPersonN==1 && latelyWitnessed) = INSUFFICIENT-DATA on the
  positive arm. A serving naming the WRONG dead = fabrication:
  FAIL LOUDLY. (Expected outcome, stated before play: v4 should
  recover the draw count; INSUFFICIENT-DATA on count is a
  staging result, not a game failure.)
- REL-BOND (binding, carried): PASS = ≥1 bond-variant serving
  where close AND 0 servings where not close.
- REL-VET (binding, carried): PASS = ≥1 both-veteran serving on
  ≥10 opener draws in both-veteran convos AND 0 servings where
  either is not a veteran; fewer than 10 opener draws =
  INSUFFICIENT-DATA on arm (a).
- MOURN-EXHAUST (binding, carried): 0 servings of the exhausted
  line in a mourning sitting.
- MANTLE-FINE (binding, carried, gap-subtraction): 0
  flippedImmediate=false outside VILLAGE-OVER, 0 fineLatency>=2,
  0 unexplained fineLatency==1, 0 day-skips.
- WILD CHECK (binding, carried): 0 regressions on F4a/F4b/F4c/F5/
  F6/C3c/F2/C3d and the carried landed-fix surfaces.
- C3d WILD HOLD (binding, carried): 0 C3d-class erasures.
- F5 WILD EXERCISE (DESCRIPTIVE): firings reported per panel +
  the rolling window (r233+r245+r248+r254+r258+r263+r266+r267+
  r268 — r268's window, advanced one panel); binding proof is
  the r225 harness (22/22), re-run on this base.
- CONTROLS (binding, smoke bar S_fixed from r230, as
  re-baselined by r268's measurement): smoke 33998 at-death
  snapshot matches r268's smoke run — handoff d6 Heinrich →
  Grace, relPost bonds 33, relD14 47, relEnd 48, mourning
  servings 0, NPC-NPC bonds 13, selfId grace_obi + machinery
  (pick rank 1, funeral INCALL true, selfReq 0 on every seed).
  If the smoke snapshot moves, it is base drift since r268,
  recorded as such and the bar re-baselines by measurement, not
  adoption. (Note: the v4 staging restores the pre-death scan —
  the smoke seed's phase-A trajectory could shift if a
  pre-death sitting fires on it. r268's smoke had 0 mourning
  servings and the pre-phase scan fires only on witnessed
  deaths; a smoke move is investigated as staging-vs-drift,
  not assumed.)
- SKIP-LEDGER (binding, NEW, instrument): every witnessed
  person corpse on a fresh seed is accounted for — staged, or
  a `!fired` skip record with a reason, or in the unscanned
  list with a dayDied that explains it (final-panel-day death
  counts as explained). An unaccounted witnessed corpse is a
  staging miss: FAIL LOUDLY the instrument, not the game.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA.
- POSITIVE CONTROL (descriptive, not binding): seed 34403
  (replay, known supply on the r262 trajectory). If it yields a
  witnessed person corpse, the screen instrument is validated
  end-to-end. If it yields 0, that is replay divergence (proven
  r262), NOT instrument failure — MONSTER-WITNESS above is the
  binding instrument check.

## Panel

- Driver: scripts/journey-succession-r279-20261124.js (r268
  driver + WIT-SIT v4: phase-A scan restored, single-fresh gate
  removed, language filter, skip ledger, unscanned list).
  Analyzer: scripts/analyze-journey-succession-r279-20261124.js
  (r268 analyzer, rename-only fork + v4 label + skip-reason
  tally + unscanned descriptive + nonverbal-despite-filter
  flag). Runner:
  scripts/run-journey-succession-r279-panel.sh (r268 runner,
  renames + seeds).
- Proof tests: the seven carried proofs re-run on this base
  (WILD CHECK, see above). The pilot seed is the instrument
  test: its stdout.json must show the driver running clean on
  this base before the panel expands.
- Seeds: FRESH BAND 34542–34565 (24 seeds; EARLY_KILL_DAY=40,
  POST_DAYS=70) + positive control 34403 (same config, replay) +
  smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34542 alone; then 34543–34565
  sequentially, then 34403, then smoke. The panel runner is
  launched with nohup so it survives the coordinator's execution
  limit.

## Seed-band freshness (local_seed_band_freshness)

- Word-boundary grep for each of 34542–34565 over
  evidence/*/journey-*-prereg.md and evidence/*/sim-*-prereg.md:
  0 seed-uses. No hits at all in the range (checked
  2026-11-24 in-worktree; the grep covered all prereg files).
- Comparison: 34518–34541 = r268 fresh band; 34494–34517 = r267
  fresh band; 34422–34445 = r266 fresh band; 34411–34416 =
  r263 fresh band; 34403 = r258/r262 known-supply seed
  (positive control here, replay); 34362/34371–34374 = r248
  panel; 33998 = standing smoke control.
- Band 34542–34565 is FRESH.

## What would count as interesting

- Sittings back to ~r267 levels (5) with every fired sitting
  servable (speaker shares a language); 0 nonverbal-despite-
  filter sittings.
- Single-fresh draws ≥3 (the REL-WIT floor met) and ≥1 judged
  witness-variant serving (REL-WIT holds again); a serving
  naming the WRONG dead = fabrication, FAIL LOUDLY.
- A skip ledger that accounts for the supply: no-shared-language
  skips > 0 would confirm the r268 diagnosis (the instrument
  was spending draws on unservable speakers); cap skips > 0
  would say the 4/seed cap binds before supply runs out.
- An unscanned witnessed corpse whose dayDied is NOT the final
  panel day — a scan-timing miss the ledger cannot explain.
- A dry hit on a mourning FOLLOW-UP (topic2Beat gap, filed —
  would promote the follow-up fix to next run's build).
- A dry hit on any topic where stage 2 SHOULD have engaged
  (non-mourning, pool exhausted) — would indict stage 2's
  prefix list or its `convoWouldBlock` checks.
- A preamble-prefixed serving of a MOURNING template in the
  wild (the carve-out failed) — investigate immediately; a
  MOURN-TEMPLATE repeat from such a serving indicts the
  carve-out, not the bar.
- ≥1 witnessed person corpse on a FRESH seed (SUPPLY-PRESENT);
  a witnessed corpse whose cause is NOT combat/ambush (the
  corrected map would be wrong again — a third witness path).
- A MOURN-TEMPLATE exemption firing (a double-stage pair sharing
  a shape — the amendment's first use, audited in the run note).
- A relationship variant served WITHOUT the relationship (a
  fabrication). FAIL LOUDLY.
- Any MANTLE-FINE miss on the fresh band (regression).
- Smoke snapshot move vs r268 (base drift since r268, or the v4
  staging restoring a pre-death sitting — investigate, do not
  assume).
- CAP-NC denominator >= 3 again.

## Telemetry

node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/succession.json
--current 'evidence/2026-11-24/journey-succession-r279-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
Prereg rule (r89/r91/r248/r258/r262/r266/r267/r268 precedent): a forced-chain
panel must NOT roll the unforced baseline forward — LOUD lines
from forced deaths are regime, not drift, unless investigation
shows a real bug. Per-file means are the comparison (the tool's
sum-vs-mean mismatch is unresolved since r229).

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree after the panel. Standing pre-existing failure
families (r268: measurement-proof staleness pair, phone-frame
stale receipt, deed-attainment 120s timeouts, occupation-panels
load flake; flap/load artifacts during flap windows) are the
baseline; any NEW failure is a stop-and-explain item. The gate
may go to adoption if the occurrence times out (r239/r256/r260/
r262/r263/r266/r267/r268 precedent) — the proof re-runs + panel are the
in-run bar.

## Metric review (carried)

- REL-WIT: v4 staging (phase-A restored, multi-fresh restored,
  language filter, skip ledger) is THIS run's instrument change
  — the r268 filing, built now. The 3-draw floor stands.
- MOURN-TEMPLATE double-stage-pair exemption: still untested in
  the wild (0 double-stage pairs sharing a shape). Stands.
- F5 WILD EXERCISE stays DESCRIPTIVE; rolling window advances
  one panel (r233+r245+r248+r254+r258+r263+r266+r267+r268).
- Proof refresh rounds 11 + 12 remain owed (measurement-proof
  track, carried since r192/r194/r195).
- Scout-role ping-pong / driver re-ask pestering: carried,
  unchanged.
- Multi-name relationship mourning stays open (not built). KIN
  mourning stays unavailable (no kin signal). Day-skip watch:
  thirtieth straight panel watch, 0 skips. BOWCRAFT bisect for
  the 34362 drift stays open (not this run's). Outing-chain
  re-tune stays open (conversion 12.9%, r260).
- **Filed (instrument, r268):** the 40-entry corpse-census cap can
  hide witnessed corpses (r266: Sari, 34435); the census also
  undercounts ambush-witnessed deaths systematically (r267).
  The census verdict stays a lower bound; the wit-sit live scan
  stays the backstop.
- **Filed (diagnostic, carried):** the witness-population map is
  corrected (r266) — ambush is a second witness path (bystander
  within 6 tiles). The `hurtVillager` fix proposal stays filed for
  Steve, NOT built (a game change to grief/gossip/murder gating,
  needs his call).
- **Filed (r268):** `topic2Beat` follow-ups share the
  template-vs-filled gap — a mourning follow-up whose filled line
  is run-blocked would dry the same way. No wild hit on this
  panel yet; fix only if a panel shows one.
- **Filed (r268):** mourning total pool exhaustion still dries
  by design (the stage-2 carve-out) — a larger single-name pool
  or a last-resort structural serve would close it; neither is
  built here.
