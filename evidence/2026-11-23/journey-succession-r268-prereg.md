# Journey succession r268 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r268 play or fix. Rotation-b read 7 at run start;
this run writes 4 (endgame next) at closeout and VERIFIES the file
reads 4 afterwards. Run number r268: follows succession r267
(2026-11-22, landed; rotation-b 7→4 was its closeout's job — the
file reads 7 because the endgame/social/crisis closeouts cycled it
back through 4→5→6→7; this run plays the leg the file says, 7, and
writes 4). Base: master `a6cb127cc` at registration. Lock:
playtest-loop-2.lock run_id `journey2-7-20261123T1355Z` (own,
created at run start; no prior lock existed). Worktree:
`~/workspace/worktrees/journey2-7` (registered; heartbeat loop
`journey2-7-hbloop-r268.sh` every 5 min, setsid). Pre-flight: main
tree clean, disk 49%, reaper ran clean (4 LOUD lines, all known
dirty held trees, nothing removed; active 13/16). Registration
took ~8 min (slow `git reset --hard` under sibling load, not a
failure — the worktree verified clean at `a6cb127cc` after).

## Standing state (why this run plays leg 7, and what it carries)

r267 succession (2026-11-22) landed the fill-aware retry in
`topic2Ask` and ended with ONE FAIL, table-pool exhaustion, filed
for this run with the follow-up design:

- **DRY-CENSUS FAIL** — 1 dry hit, other-class (non-mourning):
  seed 34512 d86, Lokman, pick `alive:event:table`, key "They say
  the table's coming. For us. I keep thinking about what we'd even
  bring to it.", returned "...Sorry, lost my train of thought."
  Root cause, verified step by step in the r267 note: the
  `alive:event:table` waiting-phase pool has exactly **2**
  candidates; both were served plain on d71 (ledgering their
  content as first chunks); at d86 Lokman asked the table topic
  for the first time (no ack — `c.t2snap` empty for him), so his
  pick carried no ack, the retry's bare alternate was blocked
  too, and the retry returned the original line unchanged, which
  `sayLine` dried. The retry worked as designed; the pool is too
  small for a third serving across a 70-day post-phase.
- **REL-WIT PASS for the first time in the wild** (1 judged
  serving, 34505 Brayden `opener:wit-saw`, 3 single-fresh draws —
  the floor met exactly). The r266/r267 metric review filed
  post-phase-only staging for r268 to raise the draw count.

This run carries TWO filed items, on separate bars, with separate
variables (see below). The staging change touches only wit-sit
sittings (~5 of ~200 servings); the DRY bar's attribution stays
with the fix, and the proof test (not the panel) carries the fix
verdict.

## Variable 1 (game fix): STAGE-2 PREFIXED RETRY in `topic2Ask`

**The fix (src/js/convoTopics.js, `topic2Ask`, after the r267
stage-1 retry).** When the composed line would block AND no bare
alternate passes, try each alternate again with a fresh PREFIX as
its first chunk: `sayLine` blocks on the first chunk only, so a
fresh prefix lets the content through. Prefixes are honest
delivery, never history claims — the generic thinking preambles
from `convoAckLines()` that claim nothing about the past: 'Good
question.', 'Huh. Let me think about that.', 'You want to know
about that? Okay.', 'Me? Okay.' The retry tries each prefix ×
each alternate (bounded: 4 prefixes × pool size) and takes the
first whose composed line would NOT block, recording the
replacement in `c.said['t2:'+topic]` exactly as stage 1 does. If
NO prefixed alternate passes, the original line returns unchanged
(the last-resort gap, still honest and documented).

Design notes, decided before play:

- The prefix REPLACES the change-ack when one is present (a
  re-ask whose ack chunk is itself blocked): the preamble claims
  nothing about the past, so it is honest for first-time askers
  and re-asks alike. The change-ack variants are NOT used as
  stage-2 prefixes — all three claim a prior ask ("You asked me
  that before…"), which would be false history for a first-time
  asker like Lokman, and cycling them through `t2pick` would
  consume the change-ack cycle for a marginal gain (the generic
  preamble unblocks the same way). The r267 observation (Riley
  serving with the third ack variant) is consistent with this:
  the unblocking works through ANY fresh first chunk, and the
  generic preamble is the honest one for every asker.
- **MOURNING CARVE-OUT.** Stage 2 does NOT engage when the
  lately event is mourning (`t2LatelyEvent(vid).kind ===
  'mourning'`, a pure read). Reason: a preamble-prefixed re-serve
  of a name-parameterized mourning template still matches the
  same MOURN-TEMPLATE shape — the analyzer matches content
  regardless of a leading prefix chunk — so stage 2 on mourning
  would trade a DRY fail for a MOURN-TEMPLATE fail (different
  speaker, same shape, same dead, within 5 days). For mourning,
  total exhaustion stays a dry — the filed last-resort gap,
  unchanged from r267. The carve-out is checked in the proof
  test (mourning all-blocked still dries).
- Stage 2 is generic across non-mourning topics (same shape as
  stage 1): any 2-candidate pool exhausting inside the 48-entry
  run-ledger window gets a third serving instead of a deflection.

## Variable 2 (instrument): WIT-SIT v3 — post-phase-only, single-fresh-only staging

**The staging change (driver only, no game code).** Two changes
to `tryWitSit` in the r268 driver fork (from the r267 driver):

1. **Post-phase only:** the phase-A pre-death `tryWitSit` call
   is removed. Sittings stage only in the post-death loop (phase
   B). (r262 added the pre-death scan because a phase-A witnessed
   death was stale by the post-death scan; v3 trades that coverage
   for draw purity — the REL-WIT arm judges post-death sittings,
   and pre-phase sittings spent cap on deaths the successor never
   mourns in the post-phase window.)
2. **Single-fresh only:** `tryWitSit` stages only when
   `freshPersonN === 1` — exactly one fresh person death in the
   0–3 day window. Multi-fresh windows (2+) no longer stage.

Purpose: raise single-fresh draws for REL-WIT (r267: 3, the floor
met exactly; 2 of 5 sittings were multi-fresh). Stated before
play: total sittings will very likely FALL below r267's 5 — that
is the trade, draw quality over quantity. If single-fresh draws
come in below 3, REL-WIT returns INSUFFICIENT-DATA again and the
staging design (not the game) gets revisited next run. Cap stays
4/seed; double-staging per death stays; the analyzer's WIT-SIT
descriptive and MOURN-TEMPLATE double-stage exemption are
unchanged (the analyzer fork is rename-only plus a v3 label).

## Proof test (binding evidence for the fix — the panel is wild confirmation)

New `scripts/test-journey-succession-r268-table-dry.js`
(modeled on r267's proof test; same harness, same staging
helpers):

- **table-exhaustion**: stage the table waiting event
  (`Game.progState().tableWaiting = true`, the debug-scenarios
  staging) with no corpses/grief, so `t2LatelyEvent` returns
  `{kind:'table', phase:'waiting'}` and `t2gen_lately` returns
  the 2-line waiting pool; poison the run ledger with BOTH
  filled lines (no fill variables — template == filled). Drive
  `[alive:event:table]` once via `convoTurn`. `convoPick`'s
  run-ledger awareness is a preference, not a hard filter, so
  the pick still returns a blocked line and the retry must
  engage. FIXED: the served line is a preamble-prefixed alternate
  (one of the two table lines, led by one of the four generic
  preambles), no dry line anywhere in the transcript. UNFIXED:
  the dry line (RED — the pick drew blocked, stage 1 found
  nothing, no stage 2). The staging forces the stage-2 path
  deterministically (any pick is blocked; any bare alternate is
  blocked).
- **control**: same staging, NO poisoning. The pick serves
  honestly (one of the two table lines, plain), none dry — the
  fix must not change any unblocked path.
- **mourning-all-blocked** (descriptive, the carve-out check):
  r267 staging (fresh named corpse, stranger speaker, 5 generic
  templates), poison ALL 5 filled generics, drive
  `[alive:event:mourning]`. The line dries exactly as on base —
  stage 2 must NOT engage for mourning. Asserts no crash and no
  wrong-dead line served. (Same expectation as r267's
  all-blocked; the carve-out preserves it.)

The test runs BEFORE the fix (expect RED on table-exhaustion)
and AFTER (the fix must turn it GREEN). The panel's DRY census
is wild confirmation only: r267's rate was 1 dry in ~200+
servings, so a 0 on this panel could also be luck — the proof
test, not the panel, carries the fix verdict. The panel DOES
carry: MOURN-TEMPLATE (stage 2 must not increase repeats — the
carve-out keeps mourning out of it entirely), REL-WIT draws
(the v3 staging variable), and regression across all carried
bars.

## Bars (binding, §14 — carried from r267 unless noted)

- DRY CENSUS (binding, THE fix bar): 0 dry hits of any class
  on the fresh band. (Proof test carries the fix verdict; see
  above for why the panel alone is weak evidence.)
- MOURN-TEMPLATE (binding, carried, AMENDED r263): 0
  same-speaker same-shape firings for different dead AND 0
  different-speaker same-shape same-dead firings within 5 days,
  EXCEPT pairs that are the two sittings of one double-staged
  death (same deadId, consecutive days, different speakers).
  Stage 2 must not increase repeats vs r267 (0) — the mourning
  carve-out is the mechanism; a repeat ABOVE r267's 0 would
  indict the carve-out (investigate, do not re-score).
- SUPPLY (binding, the screen's question): witnessed person
  corpses across the 24 fresh seeds. SUPPLY-PRESENT if ≥1;
  SUPPLY-ZERO if 0. Rate reported either way, with the
  cause×witness breakdown judged against the corrected map
  (combat inside a bearer-present tbfight OR ambush with a
  bystander within 6 tiles; `hurtVillager` still passes none).
  The census count stays a lower bound (r267: ambush deaths
  undercounted systematically; the wit-sit live scan stays the
  backstop).
- MONSTER-WITNESS (binding, instrument check): monster corpses
  with witnesses ≥90% panel-wide (r267: 868/868 = 100%). Below
  that, the census reader is broken and the screen is invalid.
- STAGE (binding, carried, conditional on supply): ≥1 staged
  wit-sit fires on a supplied seed with a living witness
  speaker, inside the fresh window. (v3: post-phase only,
  single-fresh only.)
- REL-WIT (binding, carried, conditional): PASS = ≥1 judged
  witness-variant serving with rel.witnessed true AND 0 servings
  where not witnessed, on staged sittings, naming the latest
  dead. Fewer than 3 single-fresh draws (fired &&
  freshPersonN==1 && latelyWitnessed) = INSUFFICIENT-DATA on the
  positive arm. A serving naming the WRONG dead = fabrication:
  FAIL LOUDLY. (Expected outcome, stated before play: the v3
  staging should raise the single-fresh fraction; the draw COUNT
  may fall if total sittings fall — INSUFFICIENT-DATA on count
  is a staging result, not a game failure.)
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
  the rolling window (r233+r245+r248+r254+r258+r263+r266+r267 —
  r267's window, advanced one panel); binding proof is the r225
  harness (22/22), re-run on this base.
- CONTROLS (binding, smoke bar S_fixed from r230, as
  re-baselined by r267's measurement): smoke 33998 at-death
  snapshot matches r267's smoke run — handoff d6 Heinrich →
  Grace, relPost bonds 33, relD14 45, relEnd 47, mourning
  servings 0, NPC-NPC bonds 12, selfId grace_obi + machinery
  (pick rank 1, funeral INCALL true, selfReq 0 on every seed).
  If the smoke snapshot moves, it is base drift since r267,
  recorded as such and the bar re-baselines by measurement, not
  adoption. (Note: the v3 staging removes the pre-death scan —
  the smoke seed's phase-A trajectory could shift if a pre-death
  sitting used to fire on it. r267's smoke had 0 mourning
  servings and the pre-phase scan fires only on witnessed deaths;
  a smoke move is investigated as staging-vs-drift, not assumed.)
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA.
- POSITIVE CONTROL (descriptive, not binding): seed 34403
  (replay, known supply on the r262 trajectory). If it yields a
  witnessed person corpse, the screen instrument is validated
  end-to-end. If it yields 0, that is replay divergence (proven
  r262), NOT instrument failure — MONSTER-WITNESS above is the
  binding instrument check.

## Panel

- Driver: scripts/journey-succession-r268-20261123.js (r267
  driver + WIT-SIT v3: post-phase-only, single-fresh-only).
  Analyzer: scripts/analyze-journey-succession-r268-20261123.js
  (r267 analyzer, rename-only fork + v3 label). Runner:
  scripts/run-journey-succession-r268-panel.sh (r267 runner,
  renames + seeds).
- Proof test: scripts/test-journey-succession-r268-table-dry.js
  (new; runs RED before the fix, GREEN after — verified in-run).
  The five carried proofs re-run on this base (WILD CHECK):
  r262 escalator-cap, r254 multiwit, r232 relationship-mourning,
  r225 F5 harness (22/22), r258 selfwit, PLUS the r267 mourning-dry
  proof (the stage-1 fix must stay green under stage 2). The
  pilot seed is the instrument test: its stdout.json must show
  the driver running clean on this base before the panel expands.
- Seeds: FRESH BAND 34518–34541 (24 seeds; EARLY_KILL_DAY=40,
  POST_DAYS=70) + positive control 34403 (same config, replay) +
  smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34518 alone; then 34519–34541
  sequentially, then 34403, then smoke. The panel runner is
  launched with nohup so it survives the coordinator's execution
  limit.

## Seed-band freshness (local_seed_band_freshness)

- Word-boundary grep for each of 34518–34541 over
  evidence/*/journey-*-prereg.md and evidence/*/sim-*-prereg.md:
  0 seed-uses. No hits at all in the range (checked
  2026-11-23 in-worktree; the grep covered all prereg files).
- Comparison: 34494–34517 = r267 fresh band (1 dry, table-pool
  exhaustion); 34422–34445 = r266 fresh band; 34411–34416 =
  r263 fresh band; 34403 = r258/r262 known-supply seed
  (positive control here, replay); 34362/34371–34374 = r248
  panel; 33998 = standing smoke control.
- Band 34518–34541 is FRESH.

## What would count as interesting

- Proof test GREEN after the fix (table-exhaustion serves a
  preamble-prefixed alternate, control unchanged, mourning
  all-blocked still dries) — the fix verdict.
- DRY CENSUS 0 on the fresh band with a serving count near
  r267's ~200 (wild confirmation; a 0 at a much lower serving
  count is weaker).
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
- A witness-variant serving on a staged sitting (REL-WIT holds
  again); single-fresh draws ≥3 with the v3 staging (the
  instrument working as designed); single-fresh draws <3 with
  total sittings <5 (the v3 trade, stated before play).
- A MOURN-TEMPLATE exemption firing (a double-stage pair sharing
  a shape — the amendment's first use, audited in the run note).
- A relationship variant served WITHOUT the relationship (a
  fabrication). FAIL LOUDLY.
- Any MANTLE-FINE miss on the fresh band (regression).
- Smoke snapshot move vs r267 (base drift since r267, or the v3
  staging removing a pre-death sitting — investigate, do not
  assume).
- CAP-NC denominator >= 3 again.

## Telemetry

node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/succession.json
--current 'evidence/2026-11-23/journey-succession-r268-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
Prereg rule (r89/r91/r248/r258/r262/r266/r267 precedent): a forced-chain
panel must NOT roll the unforced baseline forward — LOUD lines
from forced deaths are regime, not drift, unless investigation
shows a real bug. Per-file means are the comparison (the tool's
sum-vs-mean mismatch is unresolved since r229).

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree after the panel. Standing pre-existing failure
families (r267: measurement-proof staleness pair, phone-frame
stale receipt, deed-attainment 120s timeouts, occupation-panels
load flake; flap/load artifacts during flap windows) are the
baseline; any NEW failure is a stop-and-explain item. The gate
may go to adoption if the occurrence times out (r239/r256/r260/
r262/r263/r266/r267 precedent) — the proof re-runs + panel are the
in-run bar.

## Metric review (carried)

- REL-WIT: v3 staging (post-phase-only, single-fresh-only) is
  THIS run's instrument change — the r266/r267 filing, built
  now. The 3-draw floor stands.
- MOURN-TEMPLATE double-stage-pair exemption: still untested in
  the wild (0 double-stage pairs sharing a shape). Stands.
- F5 WILD EXERCISE stays DESCRIPTIVE; rolling window advances
  one panel (r233+r245+r248+r254+r258+r263+r266+r267).
- Proof refresh rounds 11 + 12 remain owed (measurement-proof
  track, carried since r192/r194/r195).
- Scout-role ping-pong / driver re-ask pestering: carried,
  unchanged.
- Multi-name relationship mourning stays open (not built). KIN
  mourning stays unavailable (no kin signal). Day-skip watch:
  twenty-ninth straight panel watch, 0 skips. BOWCRAFT bisect
  for the 34362 drift stays open (not this run's). Outing-chain
  re-tune stays open (conversion 12.9%, r260).
- **Filed (instrument):** the 40-entry corpse-census cap can
  hide witnessed corpses (r266: Sari, 34435); the census also
  undercounts ambush-witnessed deaths systematically (r267).
  The census verdict stays a lower bound; the wit-sit live scan
  stays the backstop.
- **Filed (diagnostic):** the witness-population map is corrected
  (r266) — ambush is a second witness path (bystander within 6
  tiles). The `hurtVillager` fix proposal stays filed for Steve,
  NOT built (a game change to grief/gossip/murder gating, needs
  his call).
- **Filed (this run):** `topic2Beat` follow-ups share the
  template-vs-filled gap — a mourning follow-up whose filled
  line is run-blocked would dry the same way. No wild hit filed;
  fix only if the panel shows one.
- **Filed (this run):** mourning total pool exhaustion still
  dries by design (the stage-2 carve-out) — a larger
  single-name pool or a last-resort structural serve would close
  it; neither is built here.
