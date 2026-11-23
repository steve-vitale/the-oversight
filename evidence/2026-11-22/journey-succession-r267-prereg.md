# Journey succession r267 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r267 play or fix. Rotation-b read 7 at run start;
this run writes 4 (endgame next) at closeout and VERIFIES the file
reads 4 afterwards. Run number r267: follows succession r266
(2026-11-22, landed; rotation-b 7→4 was its closeout's job — the
file reads 7 because the endgame/social/crisis closeouts cycled it
back through 4→5→6→7; this run plays the leg the file says, 7, and
writes 4). Base: master `52b71428f` at registration. Lock:
playtest-loop-2.lock run_id `playtest-loop-2-20261122T1700Z` (own,
created at run start; no prior lock existed). Worktree:
`~/workspace/worktrees/journey2-succession` (registered; heartbeat
loop `journey2-succession-hbloop-r267.sh` every 5 min, setsid).
Pre-flight: main tree clean, disk 46%, reaper ran clean (10 LOUD
lines, all known dirty held trees, nothing removed; active 11/16).
Write flap window 9 (opened ~21:37Z, ~80 min) was ACTIVE at run
start — git status exit 128 on `.git/index.lock` EPERM, watcher
polls FLAP through 22:55Z — and CLEARED at ~22:56Z (three
consecutive ALL-OK polls 22:56Z, 23:00Z, 23:01Z); registration,
pull, and heartbeat all succeeded after the clear. Lane A scale
r251 is registering concurrently (live holder of the registry lock
at 23:05–23:06Z; my heartbeat correctly skipped once, then landed).

## Standing state (why this run plays leg 7, and what it carries)

r266 succession (2026-11-22) ended with TWO FAILs on a 24-seed
fresh band, both filed as open findings with no fix in the
worktree:

1. **DRY-CENSUS FAIL** — 2 other-class dry hits, both the pick
   class `alive:event:mourning` (Asep 34426 d94, Ursula 34436 d91).
   The sayTrace pins both exactly: pick `alive:event:mourning`,
   `preSelf=false, preRun=TRUE, structural=false, fellBack=true`,
   returned `"...Sorry, lost my train of thought."` Asep's blocked
   line was the bothVet variant `"We both stood at the treeline.
   Ruby held it. ..."`; Ursula's was the generic `"Vikram always
   took the burnt piece. ..."`. The player asked "How are you
   holding up? About... them." and got a deflection both times.
2. **MOURN-TEMPLATE FAIL** — 1 village-window repeat (Ava d+14
   vs Finn d+9, opener:expect-fire, Hilda, 34443, 5 days apart).

REL-WIT stayed INSUFFICIENT-DATA (0 single-fresh draws; the
witness variant never served on 4 fired sittings). The r266
metric review filed the next staging design (post-phase only, on
seeds with exactly one fresh witnessed death) — NOT built this
run; see Design decision below.

## The mechanism (read before the fix — the gap is in the pick, not the ledger)

The mourning answer is picked as a TEMPLATE and filled after:
`topic2Ask(vid,'lately')` → `t2gen_lately` mourning case returns
`mlines` (templates with `{mname}`) → `t2pick` → `convoPick`
→ `t2fill` bakes the dead's name → `done()` → `sayLine`.
`convoPick`'s run-ledger awareness compares the UNFILLED
template's first chunk against the run ledger (which holds FILLED
lines: `"Since Hilda died..."` vs template `"Since {mname}
died..."` — no match), so the pick cannot see the collision
coming. `sayLine` then blocks the filled line (another villager
recently spoke the identical name-baked line about the same dead)
and serves the dry line. The `ask:lately` path is exempt
(`structuralTurn=true`, r170) — the SAME lately answer through
the alive menu (`alive:event`) is not. That asymmetry is the bug:
one answer, two menu paths, one dries.

## The fix (this run, in-worktree — the variable under test)

**Fill-aware retry in `topic2Ask` (src/js/convoTopics.js).**
After the pick + fill (+ change-ack prepend), if the composed
line `convoWouldBlock`s, try the other candidates from the same
pool: fill each, take the first whose composed line would NOT
block, and record the replacement in `c.said['t2:'+topic]` so the
per-villager dedupe sees the line actually served. If NO
candidate passes, return the original line unchanged (current
behavior — may dry; the last-resort pool-exhaustion gap, honest
and documented, not papered over). Scope: the retry lives in
`topic2Ask` only (the opener — the filed finding). `topic2Beat`
follow-ups share the template-vs-filled gap; no wild dry hit is
filed for them, so they stay untouched this run (filed below).
NOT built: the `structuralTurn=true` exemption for `alive:event`
— it would trade dry deflections for verbatim repeats and fight
the MOURN-TEMPLATE bar (one answer serving the same line twice
is the bar's exact target); the retry fixes the dry WITHOUT
serving a repeat, which is the correct shape. The fix is generic
across topics (it only engages when a filled line would block),
but mourning is the driver: every other topic's lines carry no
fill variable in the first chunk, so the retry almost never
engages for them.

## Design decision: staging stays WIT-SIT v2 (r266 instrument, unchanged)

The r266 metric review filed post-phase-only staging for the
next REL-WIT panel. This run does NOT build it: the DRY fix is
the variable under test, and changing the staging instrument in
the same run would confound the before/after (r266 = before,
r267 = after, same instrument, fresh band). The post-phase-only
design stays filed for r268. Consequence, stated before play:
REL-WIT will very likely return INSUFFICIENT-DATA again (0
single-fresh draws is the standing shape); that is a
re-measurement, not a failure of this run.

## Proof test (binding evidence for the fix — the panel is wild confirmation)

New `scripts/test-journey-succession-r267-mourning-dry.js`
(modeled on r170's collision test + r232's staged-death staging):

- **collision**: stage a fresh named person corpse (stranger
  speaker: pool = the 5 generic templates only); poison the run
  ledger with 4 of the 5 filled generics (all but 'burnt-piece');
  pre-populate `c.said['t2:lately']` with the clean template so
  `convoPick` must draw a poisoned one; drive
  `alive:event:mourning` once via `convoTurn`. FIXED: the served
  line IS the clean 'burnt-piece' line, no dry line anywhere in
  the transcript. UNFIXED: the dry line (RED — the pick drew
  poisoned, `sayLine` blocked, no retry). The staging forces the
  retry path deterministically (no RNG luck in the verdict).
- **control**: same staging, NO poisoning, no pre-population.
  All serve honestly, none dry — the fix must not change any
  unblocked path.
- **all-blocked** (descriptive): poison ALL 5 filled generics.
  The retry finds nothing; the line dries exactly as on base
  (behavior unchanged — the last-resort gap is documented, not
  claimed fixed). Asserts no crash and no wrong-dead line served.

The test runs BEFORE the fix (expect RED on collision) and AFTER
(the fix must turn it GREEN). The panel's DRY census is wild
confirmation only: r266's rate was 2 dry in 150 mourning
servings, so a 0 on this panel could also be luck — the proof
test, not the panel, carries the fix verdict. The panel DOES
carry: MOURN-TEMPLATE (the retry must not increase repeats —
it picks a DIFFERENT template when the first is blocked, so
repeats should stay flat or drop vs r266's 1), and regression
across all carried bars.

## Bars (binding, §14 — carried from r266 unless noted)

- DRY CENSUS (binding, THE fix bar): 0 dry hits of any class
  on the fresh band. (Proof test carries the fix verdict; see
  above for why the panel alone is weak evidence.)
- MOURN-TEMPLATE (binding, carried, AMENDED r263): 0
  same-speaker same-shape firings for different dead AND 0
  different-speaker same-shape same-dead firings within 5 days,
  EXCEPT pairs that are the two sittings of one double-staged
  death (same deadId, consecutive days, different speakers).
  The retry must not increase repeats vs r266 (1).
- SUPPLY (binding, the screen's question): witnessed person
  corpses across the 24 fresh seeds. SUPPLY-PRESENT if ≥1;
  SUPPLY-ZERO if 0. Rate reported either way, with the
  cause×witness breakdown judged against the corrected map
  (combat inside a bearer-present tbfight OR ambush with a
  bystander within 6 tiles; `hurtVillager` still passes none).
- MONSTER-WITNESS (binding, instrument check): monster corpses
  with witnesses ≥90% panel-wide (r266: 875/875 = 100%). Below
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
  FAIL LOUDLY. (Expected outcome, stated before play:
  INSUFFICIENT-DATA — see Design decision.)
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
  F6/C3c/F2/C3d and the carried landed-fix surfaces. (This run
  the fix touches `topic2Ask` — every topic — so the wild check
  also covers non-mourning lately answers and other topics'
  openers serving honestly.)
- C3d WILD HOLD (binding, carried): 0 C3d-class erasures.
- F5 WILD EXERCISE (DESCRIPTIVE): firings reported per panel +
  the rolling window (r233+r245+r248+r254+r258+r263+r266 —
  r266's window, advanced one panel); binding proof is the r225
  harness (22/22), re-run on this base.
- CONTROLS (binding, smoke bar S_fixed from r230, as
  re-baselined by r266's measurement): smoke 33998 at-death
  snapshot matches r266's smoke run — handoff d6 Heinrich →
  Grace, relPost bonds 33, relD14 45, relEnd 47, mourning
  servings 0, NPC-NPC bonds 12, selfId grace_obi + machinery
  (pick rank 1, funeral INCALL true, selfReq 0 on every seed).
  If the smoke snapshot moves, it is base drift since r266,
  recorded as such and the bar re-baselines by measurement, not
  adoption.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA.
- POSITIVE CONTROL (descriptive, not binding): seed 34403
  (replay, known supply on the r262 trajectory). If it yields a
  witnessed person corpse, the screen instrument is validated
  end-to-end. If it yields 0, that is replay divergence (proven
  r262), NOT instrument failure — MONSTER-WITNESS above is the
  binding instrument check.

## Panel

- Driver: scripts/journey-succession-r267-20261122.js (r266
  driver, rename-only fork; EVID 2026-11-22). Analyzer:
  scripts/analyze-journey-succession-r267-20261122.js (r266
  analyzer, same rename-only fork). Runner:
  scripts/run-journey-succession-r267-panel.sh (r266 runner,
  renames + seeds). WIT-SIT v2 unchanged (cap 4, second sitting
  next day, different living witness, sitSeq 1|2, MOURN-TEMPLATE
  double-stage exemption in the analyzer).
- Proof test: scripts/test-journey-succession-r267-mourning-dry.js
  (new; runs RED before the fix, GREEN after — verified in-run).
  The five carried proofs re-run on this base (WILD CHECK):
  r262 escalator-cap, r254 multiwit, r232 relationship-mourning,
  r225 F5 harness (22/22), r258 selfwit. The pilot seed is the
  instrument test: its stdout.json must show the driver running
  clean on this base before the panel expands.
- Seeds: FRESH BAND 34494–34517 (24 seeds; EARLY_KILL_DAY=40,
  POST_DAYS=70) + positive control 34403 (same config, replay) +
  smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34494 alone; then 34495–34517
  sequentially, then 34403, then smoke. The panel runner is
  launched with nohup so it survives the coordinator's execution
  limit.

## Seed-band freshness (local_seed_band_freshness)

- Word-boundary grep for each of 34494–34517 over
  evidence/*/journey-*-prereg.md and evidence/*/sim-*-prereg.md:
  0 seed-uses. The only hits in the range are `game.js:` line
  references, not seeds: 34501 (game.js:34501,
  sim-gauntlet-pack-b-prereg.md), 34505 (game.js:34505,
  journey-deepening-r245-prereg.md), 34512 (game.js:34512-34528,
  sim-grindfinish-b / sim-tbretreat-b preregs).
- COLLISION avoided: 34456 is named in
  evidence/2026-11-12/sim-optb-l4-a-prereg.md and
  evidence/2026-11-12/sim-optb-rederive-a-prereg.md (`@34456+`
  range start) — the first-choice band 34446–34469 was abandoned
  for it. The 34470–34493 candidate showed only line-reference
  false positives (34487 game.js:34487, 34490 game.js ~34490);
  the band moved to 34494–34517 anyway to clear the optb range
  entirely.
- Comparison: 34422–34445 = r266 fresh band (SUPPLY-PRESENT 5);
  34411–34416 = r263 fresh band (SUPPLY-ZERO); 34403 =
  r258/r262 known-supply seed (positive control here, replay);
  34362/34371–34374 = r248 panel; 33998 = standing smoke control.
- Band 34494–34517 is FRESH.

## What would count as interesting

- Proof test GREEN after the fix (collision serves the clean
  template, control unchanged) — the fix verdict.
- DRY CENSUS 0 on the fresh band with a serving count near
  r266's 150 (wild confirmation; a 0 at a much lower serving
  count is weaker).
- MOURN-TEMPLATE 0 repeats (the retry picking a different
  template should suppress the r266 shape); a repeat count ABOVE
  r266's 1 would indict the retry (investigate, do not re-score).
- A dry hit on any NON-mourning topic (the retry is generic —
  a dry elsewhere means the retry missed a path).
- A dry hit on a mourning FOLLOW-UP (topic2Beat gap, filed —
  would promote the follow-up fix to next run's build).
- ≥1 witnessed person corpse on a FRESH seed (SUPPLY-PRESENT);
  a witnessed corpse whose cause is NOT combat/ambush (the
  corrected map would be wrong again — a third witness path).
- A witness-variant serving on a staged sitting (REL-WIT moves
  from INSUFFICIENT-DATA to PASS — the first ever wild witness
  serving).
- 3+ single-fresh draws with 0 witness servings (the pick, not
  the sitting, is the wall — strengthens the r268 staging case).
- A MOURN-TEMPLATE exemption firing (a double-stage pair sharing
  a shape — the amendment's first use, audited in the run note).
- A relationship variant served WITHOUT the relationship (a
  fabrication). FAIL LOUDLY.
- Any MANTLE-FINE miss on the fresh band (regression).
- Smoke snapshot move vs r266 (base drift since r266).
- CAP-NC denominator >= 3 again (r266's first in several runs).

## Telemetry

node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/succession.json
--current 'evidence/2026-11-22/journey-succession-r267-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
Prereg rule (r89/r91/r248/r258/r262/r266 precedent): a forced-chain
panel must NOT roll the unforced baseline forward — LOUD lines
from forced deaths are regime, not drift, unless investigation
shows a real bug. Per-file means are the comparison (the tool's
sum-vs-mean mismatch is unresolved since r229).

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree after the panel. Standing pre-existing failure
families (r266: measurement-proof staleness pair, phone-frame
stale receipt, deed-attainment 120s timeouts, occupation-panels
load flake; flap/load artifacts during flap windows) are the
baseline; any NEW failure is a stop-and-explain item. The gate
may go to adoption if the occurrence times out (r239/r256/r260/
r262/r263/r266 precedent) — the proof re-runs + panel are the
in-run bar.

## Metric review (carried)

- REL-WIT: post-phase-only staging on single-fresh seeds stays
  FILED for r268 (this run holds WIT-SIT v2 deliberately — see
  Design decision). The 3-draw floor stands.
- MOURN-TEMPLATE double-stage-pair exemption: still untested in
  the wild (0 double-stage pairs sharing a shape); the 34426
  Ella pair (r266) did not share one. Stands.
- F5 WILD EXERCISE stays DESCRIPTIVE; rolling window advances
  one panel (r233+r245+r248+r254+r258+r263+r266).
- Proof refresh rounds 11 + 12 remain owed (measurement-proof
  track, carried since r192/r194/r195).
- Scout-role ping-pong / driver re-ask pestering: carried,
  unchanged (observed again in the r266 Dmitri transcript).
- Multi-name relationship mourning stays open (not built). KIN
  mourning stays unavailable (no kin signal). Day-skip watch:
  twenty-eighth straight panel watch, 0 skips. BOWCRAFT bisect
  for the 34362 drift stays open (not this run's). Outing-chain
  re-tune stays open (conversion 12.9%, r260).
- **Filed (instrument):** the 40-entry corpse-census cap can
  hide witnessed corpses (r266: Sari, 34435). The census verdict
  undercounts when a seed's corpse list overflows; the witSit
  live scan is the backstop. The analyzer's WITNESS-CENSUS count
  should be read as a lower bound.
- **Filed (diagnostic):** the witness-population map is corrected
  (r266) — ambush is a second witness path (bystander within 6
  tiles). The `hurtVillager` fix proposal stays filed for Steve,
  NOT built (a game change to grief/gossip/murder gating, needs
  his call).
- **Filed (this run):** `topic2Beat` follow-ups share the
  template-vs-filled gap — a mourning follow-up whose filled
  line is run-blocked would dry the same way. No wild hit filed;
  fix only if the panel shows one.
- **Filed (this run):** total pool exhaustion (all mourning
  templates run-blocked) still dries — the retry's last resort is
  the original line, unchanged. A larger single-name pool or a
  last-resort structural serve would close it; neither is built
  here.
