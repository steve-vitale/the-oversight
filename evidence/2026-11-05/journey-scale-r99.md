# journey-scale r99 — Lane A, leg 3 SCALE (2026-11-05 midday)

**Run id:** laneA-scale-2026-11-05T0445CST (scheduled 04:45 CST 2026-11-05).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@3f14110d1 at branch creation.
**Pre-register:** evidence/2026-11-05/journey-scale-r99-prereg.md
(committed as ce9506144 before any scored seed ran).
**Change set at closeout:** ZERO src/js. Tooling (morntrace3 policy clone,
driver/analyzer clones, water-refusal instrument; diffs verified) +
evidence + run note. Gating freeze honored; perception law honored (all
instruments read-only; pickers press offered menu items only).
**Fix-gate verdict: no src/ change.** The trace identifies a mechanism
(the dawn fill — see Q1) but the fix is a policy question (competent
never fills at Haven during daily), not a proven mechanic change. Per
clause (a) discipline, a trace alone does not meet the gate. A policy
arm is proposed for r100, not landed here.

## Infrastructure notes (loud, first)
- **EPERM flap: CLEAR at run start.** O_EXCL probe OK (11:41 UTC); no
  flap artifact all run. The 06:36–07:48 UTC flap from r98's morning
  did not recur. Registration took ~6 min (slow `git reset --hard`
  checkout, not a stall — verified live via ps).
- **Heartbeat loop verified by registry read-back** (11:47:44,
  11:58:46, 10-minute loop, alive for the whole run). One stale
  "FAIL: slug 'journey-scale' not registered" line in the shared
  heartbeat log is r98's loop running on after its release, not this
  run's.
- **Safe-commit index clobber struck on the prereg commit**, same class
  as r90/r94/r95/r96/r97/r98: after the correct private-index commit
  (ce9506144, 4 files), the worktree's main index lied (4 files
  staged-as-deleted + untracked). Repaired via HEAD-blob cacheinfo,
  verified: `git status` clean, `git diff HEAD` empty, `git show
  --stat` correct (4 files, 1314 insertions). The commit itself was
  correct.
- Lock discipline held throughout; lock deleted at closeout.
- **Trajectory drift vs r98 (base change, not instrument drift):**
  85501/85502 reproduce r98 EXACTLY (d38/d29); 85503 ends d96 (r98:
  d121, −25d) and 85504 ends d105 (r98: d113, −8d). The base moved
  between r98 and r99 (r104's convo-wants favor-record repay fix
  landed in 3f14110d1); the fix changes want selection at the d90
  sitting, and RNG divergence shifts everything downstream. The
  pilgrimage loop (days 34–56) reproduces EXACTLY (see Q1c) — the
  drift is confined to post-d90 trajectories. The instrument is
  behavior-identical (85501/85502 byte-identical trajectories prove
  it); the game changed, not the instrument.

## Q1 — WALK-OUT WATER (binding; r98's carried micro-question)
**FINDING clause: INCONCLUSIVE on the pre-registered gate — mechanism
identified descriptively, at a finer grain than the clause specified
(the r98 Q1 pattern).** The gate required walk-out days to separate
on ONE candidate across the FIRST-vs-RETRY cut, with the packW gap
matching (0 on all first walk-outs, ≥2 on all retries). The band
holds 10 walk-out days (FIRST 8, RETRY 2 — count met), but the
packW gap does NOT hold on that cut: 6 of 8 first walk-outs leave
WET (packW 3). No candidate separates first from retry. Per §14
metric binding, no re-scoring: the verdict stands INCONCLUSIVE on
the gate. What the trace shows instead:

**The separator is DRY vs WET, not first vs retry — and the refusal
lines separate it perfectly (2/2 dry, 0/8 wet).** Two dry walk-outs
on the band, two different causes:

- **85503 d36 (FIRST, to village_spl_28_58496): cistern dry at dawn.**
  Entry: packW 0, packKg 11.6 (room 12!), cist 4 clean / 40 dirty.
  Three "The cistern is dry" refusals — dawn, midday, dusk (the 3
  upkeep passes). The cistern reads 4 clean at entry AND
  postCompetent, but 0 at every fill attempt: the clean water arrives
  too late. Timeline from the capture: at dawn the scholar drinks
  his last bottle ("Drank clean water", packW 1→0), the fill refuses;
  haulers bring 13L + 11L of creek water during the day — DIRTY
  ("Risky until the hearth boils it"); the hearth boils only at the
  day boundary, never mid-day; Ruth returns "+4 clean" during the
  dusk wait — AFTER the last fill attempt. By entry the cistern holds
  4 clean, untouched, while the scholar walks out with 0 bottles.
  Why dawn is dry: the day-boundary order is hearth-boil THEN
  village-drinks (game.js:32728-29, Steve's 2026-10-08 WATER
  REALITY) — the hearth boils the day's haul (wood-limited, 6L/wood)
  and then ~10 villagers drink ~2L/head, clean first, before the
  scholar wakes. The scholar's dawn fill is the LAST claim on clean
  water.
- **85504 d34 (FIRST, to village_2): pack full at dawn.** Entry:
  packW 0, packKg 23.1 of 24 (room 0), cist 21 clean. Two "Your pack
  is full — water is heavy" refusals at dawn. The pack holds two 9kg
  Cattail stacks (90× Cattail, 10,800 kcal each) hauled the previous
  day (d33: packKg 4.6 → 22.8 during competent.daily, dForage=1);
  the pack sheds to 6.9kg during d34's daily (room 0→17) — but the
  fill attempts already failed at dawn, and the scholar walks out
  with 0 bottles. Cistern 21 clean, sitting there, unfillable for
  want of 1kg of room.

**The policy gap, precisely:** competent's only fill attempts are
the 3 upkeep passes (dawn/midday/dusk, before the courtship walk).
competent.daily NEVER fills at Haven — its drinkSafe calls sit
inside the thirst-home block, which is gated on NOT being at Haven
(`!Game.playerAtHaven()`). So on a walk-out day the scholar never
tries to fill after the entry snapshot, even when clean water is
sitting in the cistern (d36: 4L from Ruth's return) or the pack has
room (d34: 17kg by postCompetent). The game offers the verb
(fillWater at Haven whenever clean is available); the bot doesn't
ask at the right time. That is a policy (bot) gap, not a game bug:
the cistern economy (boil-then-drink order, haulers bring dirty,
hearth boils at the day boundary) is Steve's designed WATER REALITY.

**Consequence chain (descriptive):** a dry walk-out starts the
thirst-walk reset loop — 85503 d36 → 14 resets (d37–d51), 85504
d34 → 14 resets (d35–d48); a wet walk-out studies and completes
(all 8 wet walk-outs: studies d28/d31/d34/d52/d56 and the d27/d29
early ones). The dry walk-out IS the loop's first cause; the retry
holds because the scholar spent the intervening days AT Haven,
filling on days when clean water was available (85503 d54–55:
cist 22–23, packW 3; 85504 d48–49: cist 31, packW 2).

## Q1b — RAIN CATCH (report-only; r98's unexplained instance)
**EXPLAINED — no rain-water mechanism needed.** The r98 instance
(85501 d28 packW 3→6) is the **storm event**: "You set out every
pot and skin — the storm fills them. (+3 clean water.)"
(game.js:26744, addWater(3, 'clean', 'storm')) — the line sits in
the 85501 capture in the d28 window. 85503 d28 (+1 net on a dry
forest_floor tile) is the same storm (+3, minus 2 drinks). The
scholar never holds rain_dancer on this band (abilities:
iron_stomach/lucky_rock/beard_moss on 85503), so the rain_dancer
path cannot fire. All other overnight gains (23 across the band)
are ordinary morning fills at Haven or a creek tile. The storm
explains every dry-tile gain; rain itself is incidental.

## Q1c — MOVER + DRAIN REGRESSION (report-only; r97/r98 checks rerun)
**Reproduces EXACTLY on the band — no instrument drift.**
- Resets: 85503 14 COMPETENT + 85504 14 COMPETENT = 28, same
  segments, same days as r97/r98. Held nights 25/19, same as r98.
- Loop nights (28: 85503 d37–d50 + 85504 d35–d48): packW 0, dry
  tile, 0 drinks → drain 50–64 ≈ sleep burn, every night.
- Retry nights (2: 85503 d56, 85504 d50): packW 3→2 / 2→1 + 1
  morning drink → drain 14 both, same tiles.
- The drain separator (pack water / tile water) stands; the burn
  model holds for no-drink nights. One outside-±10 case is timing
  noise as r98 noted (not re-scored).

## Q2 — CENSUS CONTINUITY (report-only; r93–r98 metric unchanged)

| seed | end | day | pop | pantry | rank | seat | arc | seasoned peers (final) | shape |
|---|---|---|---|---|---|---|---|---|---|
| 85501 | over (pantry 0) | 38 | 3/3 | 0 | village | none | 3 | 0 (lead 38/13d) | early hunger |
| 85502 | over (pantry 0) | 29 | 6/6 | 0 | village | none | 3 | 0 (lead 20/4d) | early hunger |
| 85503 | over (pantry 0) | 96 | 4/4 | 0 | regional | lesser waiting | 4 | 1 (lead 62/71d; covenants 22/29/23, trades 30/27) | trust-blocked |
| 85504 | over (pantry 0) | 105 | 0/0 | 0 | regional | lesser waiting | 4 | 2 (covenants 68/53d, 44/37d; lead 39/80d — 1 short) | trust-blocked |

National staged 0/4, courtNational answers 0/4 — same as r96/r97/r98.
The two long-lived villages again die with a lesser seat waiting
(arc 4). 85504 now banks TWO seasoned covenants (r98: one) but
still no third — and its lead link sits at trust 39, one short of
the 40 bar, 80 days old. No dissolution timeline exists on this
band either.

## Q3 — PEOPLE CHECK (sense law; corpus rule as r96/r97/r98)
Corpus: d90 on 85503 and 85504 only (85501/85502 died before day 90;
no day substitution, per prereg). **2 of 2 fully real.**

- **85503 d90 Maximiliano (Chef, anxious, trust 51, ask_favor
  stage 1):** "I hate to ask this, but I'm feverish, a cut gone hot
  and angry. Can you do anything?" A real want — a sick man asking
  for help with an infected cut. The player commits ("I'll come back
  to help."), he answers with plain gratitude ("You don't know what
  that means to me. Thank you."), and the favor stands committed
  (stage 3) — a real debt, not a closed loop. REAL, short.
- **85504 d90 Muteti (street artist, restless, trust 26, curious
  stage 0, grief thread):** "We gave them a good burial. Doesn't
  feel like enough, does it?" — grief grounded in the village's real
  dead (85504's pop falls 6/6 → 0/0 by d105). Comfort lands ("I'll
  get there. Just needed a minute where I didn't have to be fine."),
  then the want surfaces as a real question: "When's the last time
  you really laughed?" The close ("Sorry. I need a minute.") owes
  nothing and fakes nothing. REAL.

## Village assessment (plain words)
Four villages, same shape as this morning with the water now named.
Two never get out of the first month: pantries run to zero and the
flag falls while people are still standing. The two that live past
day 90 both reach the region, both court their neighbours properly
— pilgrimages walked and studied, covenants sworn — and both die
with a lesser seat still waiting for them. Neither reaches a nation:
one holds a single seasoned bond, the other holds two, and the rest
sit just short of the line. The pilgrims, for their part, walk out
thirsty for a reason this run can now name: the scholar tries to
fill his bottles at dawn, after the village has already drunk the
night's boiled water, or with a pack still full of yesterday's
cattails — and by the time clean water arrives, or room opens up,
he's already on the road with empty bottles. He walks home to drink,
fourteen mornings in a row, while the same scholar with bottles in
the pack drinks at dawn and walks on.

## Reachable / Fun / Winnable (leg verdict)
- **REACHABLE — PARTLY, unchanged from r96/r97/r98.** Regional on
  2/4 seeds; national staged 0/4. The covenant road opens in play,
  but the season to hold a third seasoned peer is not reached on
  these seeds — trust-blocked, not unreachable.
- **FUN — YES, with the same honest caveat.** Conversations are
  genuinely good (Muteti's burial grief and "when did you last
  laugh?"; Maximiliano's feverish cut, committed and owed). The dull
  spot is the early-death band: two villages end before the leg's
  window (day 80) even opens.
- **WINNABLE — NOT YET.** No national, no global, no full seat on
  any seed; the lesser seat waits on 2/4 while the villages die.
  Behind this wall still sits the wave-4 kill wall from the
  November 3 picture; this run faced no wave-5 content and claims
  no kill.

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale.json --current
'evidence/2026-11-05/journey-scale-r99/journey-scale-r99-trust-*.json'
--metrics nationalLive,scaleRank` → "quiet (4 files, 2 metrics, no
large deviations)". Same caveat as r93–r98: that baseline is an old
aggregate shape, so "quiet" means "no large deviation on these two
metrics", not a clean bill. Baseline NOT rolled forward.

## Tests
- Pilot gate (pre-registered): seed 85503 ran first; pilgrimage
  trips present (50 postrace rows, studies + a stale drop) and all
  nine morntrace3 fields populate on every row (288 rows, 0 null
  packKg, 0 null cist). Gate PASSED — full quad ran.
- Quad determinism: seeds 85501/85502 end days 38/29 reproduce r98
  exactly (instrument behavior-identical); 85503/85504 end days
  96/105 vs r98's 121/113 (base change, see Infrastructure).
- `node scripts/check.js --quick` (on the branch code,
  `--cacheDirectory=/tmp/jest-cache-playtest`): **280 passed, 10
  failed in 1437s.** The 6 are r98's same pre-existing failures
  (same files: godpath/test-measurement-proof-update,
  test-measurement-workflow, test-mobile-combat-cadence,
  test-occupation-panels, test-phone-frame-proof,
  test-establishment-r20-fixes-20261020). The 4 NEW failures vs r98
  are all load-attributed, all verified passing standalone: 3 are
  120s timeouts with zero assertion failures
  (test-solo-campaign-endings, test-trust-observer-neutrality,
  test-synergy-stall — the box ran at load 22 with two sibling
  check.js processes concurrent) and test-measurement-cache-flags
  (exit 1 under load, 4/4 standalone). Standalone re-runs, all
  green: cache-flags 4/4, trust-observer-neutrality 6/6,
  synergy-stall exit 0 in 19s, solo-campaign-endings 15/15 in 35s.
  No failure touches this run's files: zero src/js touched, and the
  new driver/analyzer/policy-clone are never executed by check.js.
  Full log: evidence/2026-11-05/journey-scale-r99-checkquick.log.

## Metric review
- **Q1's FINDING clause failed on the cut, and the failure is
  instructive (same lesson as r98):** the first-vs-retry framing was
  the wrong cut again. The band's first walk-outs mostly leave WET
  (6 of 8, packW 3) — the early pilgrimages (d27–d33) leave when the
  cistern is still healthy. The dry walk-outs (d34/d36) are first
  attempts, but so are the wet ones. Proposed revision for r100:
  gate on DRY-vs-WET walk-outs (packW 0 at postCourt vs ≥2),
  regardless of attempt number: the refusal lines (cistern-dry OR
  pack-full) should fire on all dry walk-out days and none of the
  wet ones. On this band that cut separates 2/2 dry vs 0/8 wet —
  testable on the same band. No re-scoring was done in this run: the
  verdict stands as INCONCLUSIVE on the pre-registered gate, with
  the mechanism reported descriptively.
- **Instrument limitation (packTop):** raw forage stacks carry no
  itemId, so the two 9kg items on 85504 d34 read as `?:9,?:9` — the
  capture names them (90× Cattail). r100's instrument should fall
  back to the item NAME when itemId is absent.
- Q1b's metric is new for this run (overnight-gain tabulation) and
  behaves as designed; Q1c's metric is unchanged from r98 and
  reproduces exactly; Q2's metric is unchanged from r93–r98; Q3's
  corpus rule held (d90 exists for 2 seeds; no day substitution).
- No pre-registered metric was re-scored mid-run.

## Harness
scripts/journey-scale-r99-20261105.js (r98 lineage: only labels/seeds/
EVIDIR + the morntrace3 output line + the water-refusal instrument
changed; diff vs r98 verified: labels + one output line + waterWatch).
Analyzer: scripts/analyze-journey-scale-r99-20261105.js (r98 scans
carried + Q1 walk-out classifier + Q1b gain check + Q1 gate check;
regex verified against fabricated morntrace3/postrace rows before the
pilot — the fabricated run caught a real classifier bug: RETRY was
keyed on trip START before the walk-out day, which misclassified a
walk-out as a retry of its own in-progress trip; fixed to trip END
before the walk-out day before any seed ran). Policy clone:
scripts/policies/scalecourt-nogate-morntrace3.js (r98 clone + five
logging-only fields; diff vs r98 verified: comments + fields only, no
behavior line). Pilot seed 85503 x DAYCAP=180 ran ~102s; full quad ran
~67s. Per-seed evidence: evidence/2026-11-05/journey-scale-r99/
(per-seed files, transcripts, analysis). Prereg + this note in repo
evidence/2026-11-05/.

## Blanks: filled or documented
- FILLED (documented, mechanism traced — no game change, fix gate not
  met): the walk-out water question — the dawn fill fails two ways
  (cistern dry at dawn: village drinks the boiled clean before the
  scholar wakes, hearth boils only at the day boundary, haulers
  bring dirty; pack full at dawn: yesterday's 9kg forage hauls),
  and competent.daily never fills at Haven (drinkSafe gated behind
  the not-at-Haven thirst walk). The retry holds because the scholar
  refills on intervening Haven days.
- FILLED (documented): the rain-catch instance — the storm event
  (+3 clean water), not rain_dancer, not a mystery.
- DOCUMENTED (no instance this run): national staging — 0/4, with
  the trust-short shape named per seed (85504's lead link 1 trust
  short at 80 days old).
- CARRIED (next micro-question + policy arm for r100): competent
  tops up bottles at Haven during daily before a pilgrimage
  walk-out (unload-then-fill ordering) — policy arm to be proven on
  the same band with the revised DRY-vs-WET gate; and the packTop
  name fallback for raw stacks.
