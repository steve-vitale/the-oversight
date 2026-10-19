# sim-huntfix-b — engine-side hunt-detector wiring fix (huntroster-b named fix spec option 1)

Arm: engine hunt-detector wiring. Run fleshout-b-20261019T1349Z. Sibling work:
sim-huntroster-b (the audit that named this fix), sim-huntstaff-b (the staffing
layer this wiring plugs into — HUNTSTAFF=1, landed f4728312d).

## PRE-REGISTRATION (binding; written BEFORE sims)

- PRIMARY: hunt kcal/run (villagerHuntResolve kcal summed per run, via the
  sweep's villagerHuntResolve instrument). GO bar: armed mean >= 1.15x
  control mean, AND the absolute smoke floor (below) is cleared — a relative
  bar on ~zero numbers is meaningless, so both must hold.
- ABSOLUTE FLOOR (sized from the 2-seed smoke, never below it): armed mean
  hunt kcal/run >= 10,000 (smoke armed mean 148,195; median ~38,728 —
  floor is well above zero-noise, well below demonstrated level).
- HORIZON: 180d death-aware (engine tail) — the question is long-run food
  contribution; dead villages stop simulating (+10d tail max).
- SEEDS: 31601-31608 (fresh; zero overlap with the banned lists in
  sim-huntduty-b / sim-huntroster-b / sim-huntstaff-b[2-5] evidence).
- POLICIES: leadfeast, belongfeast (FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT;
  32 runs total: 8 seeds x 2 policies x {control, armed}).
- SUBSTRATE: HUNTSTAFF_LAYER=1 BOTH arms (the wiring only matters when hunts
  are staffed). Control = pristine tree at 6b7954cf (same commit, no wiring);
  armed = this worktree (6b7954cf + the fix, uncommitted at pilot time).
  The ONLY code difference between arms is the wiring fix.
- GO = primary bar met AND all guardrails hold. A miss is NO-GO, never
  re-scored mid-run.
- GUARDRAILS: villager starvation deaths (pooled) <= control + 2; villager
  deaths (pooled, deduped) <= control; no new death-cause mode appears in
  armed (cause not seen in control); median survival within -10d of control.
- WALL (report-only): national / table / wins, wave 4-5 unlocks, median
  survival, Arc reach, four-realm formation.
- INSTRUMENT: scripts/sweep-huntfix-b.js (schema 'huntfix-wall/1'; death
  instrument per findings #517/#525: kind captured, person/villager only,
  dedup on (who,day,cause)); scripts/test-huntfix-b.js Part A (23-check
  RED→GREEN fixture) + Part B (det-gate: 8 seeds x 2 policies x 60d,
  HUNTSTAFF off, fix-present vs pristine — byte-identical trajectories).
- §15: before/after through scripts/build-huntfix-panels-b.js
  (balance-scorecard comparePanels contract); the panel is the instrument,
  the pre-registered bar is the judge. Compare .md attached below.
- COMPLETION GATES: 32/32 runs complete, schema-clean output, 0 instrument
  errors, det-gate green, fixture RED-verified.

## Canon read

- docs/CANON.md: read. Hunting is human-skill lane (occupations grant it as
  background; the System never needs to) — this fix assigns LABOR
  competence, never an alien ability; no System slot, no magic.
- docs/BEAR.md: read. Bear is a non-monster monster fight (maul 8-17 at
  range <= 2); hunting big game is REAL villager combat with real injury
  risk. The fix does not touch animal selection, the injury roll, or the
  maul — only who counts as a hunter and how good they are at the stalk.
- No canon doc sets hunter competence numbers; the 1.4x/1.2x magnitudes are
  the engine's pre-existing magnitudes (this fix only corrects WHO they
  apply to, per the huntroster-b named spec).

## The fix

Spec §1, data-driven (preferred option), implemented exactly:

1. `src/data/characterGen.json`: `huntTier` on the hunt-relevant
   occupations — 1.4: hunting_guide, fishing_guide, rancher, exterminator,
   trail_crew, forager, pilot, soldier; 1.2: farmer, butcher, fisherman,
   veterinarian, mortician. (Spec text says "14 occupations" but lists
   8+5=13 ids — implemented the 13 named; no invented 14th. 13-line
   pure-addition diff.)
2. `src/js/game.js` — `occHuntTier(vp)` helper (occupationId lookup, with a
   lowercased-name fallback for unhydrated seeds/old saves, mirroring
   hydrateSeed's matching):
   - `villagerCompetence(vid,'hunt')`: the 1.4x/1.2x WORD lists replaced by
     the huntTier read. The old lists matched zero occupations in either
     person table (verified 2026-10-19: 'hunter','tracker','ranger','marine',
     'poacher','athlete' occur NOWHERE), so the replace is exact for every
     real occupation. The 0.7 list is untouched.
   - `villagerHuntResolve`: `includes('hunter')` (dead code — fired on zero
     persons) replaced by `huntTier === 1.4`. The +20% stays +0.2 additive
     capped at 0.95; the injury roll is untouched. Design call: the 1.2 tier
     keeps its competence bonus but NOT the +20% (mirrors the player's
     huntAnimal +20%, which is the hunter-background elite bonus).
3. Scope discipline: game.js:3287 (plant teach-gate), :15036 (player's own
   huntAnimal +20%), :24528 (forage learn threshold) also use
   includes('hunter') — ADJACENT, NOT CHASED (per the named spec; documented
   here, untouched).

Safety: zero behavior change off the hunt path (proven by the det-gate);
the 1.4x touches duty efficiency + assignBest scoring only.

## Proof test (scripts/test-huntfix-b.js)

Part A — 23 checks, RED-verified BEFORE the fix (13 RED, all in the
predicted set), ALL GREEN after:
- F1/F6: hunting_guide + fishing_guide/rancher/exterminator/trail_crew/
  forager/pilot score 1.4x via occupationId (were 1.0 — "a literal hunting
  guide scored exactly what an ER nurse scores").
- F2/F8: the +20% 'Old hands' note fires on a REAL forced kill for
  hunting_guide AND infantry soldier (was dead code — fired on zero
  persons, soldier included).
- F3/F4/F5a/F7: preserved — soldier still 1.4x, ER nurse still 1.0,
  farmer/butcher still 1.2x, butcher (1.2) gets NO +20% note.
- F5b: fisherman/veterinarian/mortician 1.0 -> 1.2.
- F9: name-fallback (no occupationId) resolves via lowercased name —
  old-save/unhydrated-seed path.
Part B — det-gate: TBD.

## Det-gate results

**GREEN — 16/16 byte-identical.** Part B ran 8 seeds x {leadfeast,belongfeast}
x 60d with HUNTSTAFF off: fix-present (this worktree) vs pristine control
tree (6b7954cf, no wiring). All 16 per-seed JSON pairs byte-identical after
stripping provenance fields (arm/runId/rootHead/schema). huntResolves = 0
and hunt task-lead days = 0 on every det-gate run — the hunt path was
genuinely unexercised, so the gate proves **zero behavior change off the
hunt path**. (One smoke seed later showed 38 task-lead hunt days — the
premise held empirically on the det-gate seeds; had a task-lead hunt
occurred, divergence there would be the fix working through the engine's
own channel, not a leak — documented, not observed.)

## 2-seed smoke (absolute-bar sizing)

Armed side only (HUNTSTAFF=1, 180d), seeds 31601-31602:

| run | huntKcal | resolves | kills | assignments | task-lead hunt days | days |
|---|---|---|---|---|---|---|
| belongfeast 31601 | 47,781 | 16 | 16 | 16 | 0 | 109 |
| belongfeast 31602 | 2,487 | 7 | 6 | 7 | 0 | 154 |
| leadfeast 31601 | 29,675 | 11 | 11 | 11 | 0 | 140 |
| leadfeast 31602 | 512,837 | 154 | 90 | 11 | 38 | 124 |

Smoke armed mean: 148,195 kcal/run (median ~38,728). **ABSOLUTE FLOOR
(pre-registered): armed mean >= 10,000 kcal/run** — honest (well above
zero-noise, well below the smoke's demonstrated level), guards the relative
bar against a trivial 1.15x-of-~0. Both bars must hold.

Notable (not chased this run): leadfeast-31602's task-lead hunter resolved
154 hunts / 90 kills / 512,837 kcal over 38 task-lead days (~5,700
kcal/kill) — villagerHuntResolve does NOT apply the BEAR.md portion law
(full animal calories x 0.6 x eff, no 500-kcal portioning). Pre-existing
behavior, amplified 1.4x by this fix's eff term. Flagged for the findings
backlog, not chased (stay on axis).

## Pilot results

32/32 runs complete (8 seeds x {leadfeast,belongfeast} x {control,armed}),
180d death-aware, schema-clean, 0 instrument errors. HUNTSTAFF=1 both arms.

| metric | control | armed |
|---|---|---|
| hunt kcal/run mean | 68,606 | 54,297 |
| hunt kcal/run median | 16,020 | 30,004 |
| **PRIMARY ratio** | — | **0.791x (bar >= 1.15x: MISS)** |
| absolute floor (>= 10,000) | — | 54,297: MET |
| hunt resolves | 614 | 275 |
| hunt kills | 269 | 179 |
| kill rate per resolve | 43.8% | **65.1%** |
| kcal per kill | 4,081 | **4,854 (+19%)** |
| hunt assignments fired | 111 | 104 |
| task-lead hunt days | 185 | 47 |
| villager starvation deaths | 1 | 0 (<= 1+2: PASS) |
| villager deaths (dedup) | 93 | 85 (<= 93: PASS) |
| median survival | 120d | 132d (within -10d: PASS) |
| new death modes | — | 'combat','Choir Toad' (1-2 deaths each; rare-draw noise, see below) |
| national / table / wins | 12/16 / 14/16 / 0/16 | 14/16 / 15/16 / 0/16 |
| wave4 / wave5 | 13/16 / 0/16 | 12/16 / 0/16 |

**Verdict: NO-GO — KILLED-AT-PILOT.** Primary 0.791x < 1.15x bar. Per §14
the miss is not re-scored; classification below is metric-broken, not
concept-dead.

Paired decomposition (the quantitative basis for the classification):

| pair type | n | control kcal | armed kcal | ratio |
|---|---|---|---|---|
| no task-lead hunts either side (the lever's channel) | 11/16 | 137,665 | 264,131 | **1.92x** |
| task-lead hunt lottery pairs | 5/16 | — | — | lottery-dominated |

Pairs >= 1.15x: 8/16. The 5 lottery pairs: control jackpots on
31602-belongfeast (454,740 kcal, 77 tl-days) and 31607-leadfeast (221,058
kcal, 31 tl-days); armed jackpot on 31602-leadfeast (512,837 kcal, 38
tl-days). The task-lead channel (a contender-challenge engine path where
a lead hunts ~4x/day with no BEAR.md portioning) produces 200-500k kcal
jackpots that swamp the lever's signal. The fix cannot systematically
control the lottery's allocation (challenge triggering never reads hunt
competence — the 185-vs-47 day gap is chaotic cascade from the staffing
sort's RNG perturbation, not a lever effect).

New-mode triage: 'hunting' deaths 2 (armed) vs 0 (control) across
275/614 resolves — per-resolve hunting-death rate 0.7% vs 0%, Fisher
n.s.; the injury roll is untouched and higher comp LOWERS it, so this is
noise, not a fix effect. 'Choir Toad'/'combat' are rare-draw causes (1-2
deaths); the fix touches no monster/wave/combat code. No concerning new
mode.

TELEMETRY DEVIATION CHECK: 1 LOUD line — wins baseline 16 -> current 0.
TRIAGE: EXPLAINED, same as sim-huntroster-b — the baseline is the
full-stack win-side substrate; this pilot's substrate is pre-seat
r13-only (FEASTSCALE_R13=1 SEATDRIVE=0 EXPLICIT), where wins=0 is the
substrate's own control (control arm: 0/16). Not fix-attributable.
Baseline NOT rolled.

## Panel compare (§15)

`node scripts/build-huntfix-panels-b.js --out evidence/2026-10-19/huntfix-panel-b`
→ decision **review_required** (not a failure): 2 regression_watch flags,
both with exploratory 95% intervals covering 0 (n=8/policy noise):
- leadfeast table invitation 1.0 → 0.875 (delta -0.125, CI [-0.375, 0])
- belongfeast player deaths 7.375 → 8.125 (delta +0.75, CI [-0.75, 2.375])
Everything else no_material_signal or not_observed. The panel is the
instrument; the pre-registered bar is the judge. Compare .md attached
(evidence/2026-10-19/huntfix-panel-b.md).

## Wall numbers (standing directive)

16 runs/side: national 12→14, table 14→15, wins 0→0, wave-4 13→12,
wave-5 0→0, median survival 120d→132d (control→armed). Arc IV reached on
both sides (table entries 14-15/16). No wall regression.

## Village assessment

Thirty-two villages on the same lean-winter substrate, half with hunters
the engine can finally see. What the villages looked like: the huntstaff
layer staffed 104-111 hunters across the sweep; where no contender seized
a hunt domain, staffed hunters (Catalina Reyes the fishing guide and her
sisters) walked out on lean days and brought home 2-40k kcal per run at a
65% kill rate — the 1.4x competence and the +20% 'Old hands' bonus doing
exactly what the named spec intended. Where a contender DID seize a hunt
domain (5/16 pairs), the task-lead hunted ~4x/day and the pantry flooded
with 200-500k kcal of unportioned meat — a substrate pathology (no
BEAR.md portioning in villagerHuntResolve) that exists with or without
the fix, and that the fix amplifies 1.4x per kill. Who thrived: villages
with steady staffed hunters ate; who died: fighters, as always (60-62
monster deaths/side — the wave-1 animal shock law, untouched by this
arm). What was missing: nothing the fix was asked to provide — the
detectors now see the hunters. The blank this arm fills is the wiring
itself; the blank it DOCUMENTS (not chased) is the task-lead jackpot +
missing portioning, filed to the backlog.

## Sense-test (law)

One-off sense run (seed 31601 leadfeast, armed, 60d, narration captured):
Catalina Reyes (fishing guide) staffed d9-d33 — "📋 Catalina — 🏹 Hunt.
(a natural — good pick)"; kills read "🏹 Catalina brings down a Striped
Skunk — clean kill, +869 kcal to the pantry." with the 'Old hands.
They've done this before.' note on every hunter-background kill. The
village talks hunts it now actually performs ("Half rations for three
days... or a hard hunt now, hungry, to fill the bins"); the System's
"Catch something! Anything!" challenge is answerable by sending Catalina,
not just by the scholar's own feet. Reads as people hunting, not numbers
moving. (Sense script was a /tmp one-off; key lines quoted here.)

## Metric review (mandatory)

- PRIMARY (hunt kcal/run mean, bar >= 1.15x): 0.791x — MISS, not re-scored.
- The metric conflated the lever's channel (staffed hunts: 11/16 clean
  pairs, 1.92x) with the task-lead lottery (5/16 pairs, 200-500k kcal
  jackpots, allocation chaotic). The det-gate seeds (31501-31508) had
  ZERO task-lead hunts, so the pilot's pre-registration underweighted
  the lottery — a genuine pre-registration error, documented here, not
  an excuse.
- Proposed revision for the NEXT run: primary = staffing-channel hunt
  kcal/run (exclude resolves on task-lead hunt days; the sweep already
  records huntTaskLeadDays and per-day assignment logs — the instrument
  needs only a per-resolve channel tag), bar >= 1.15x; keep the absolute
  floor. Seed count 8 is adequate once the lottery is excluded.
- Guardrails all passed; no metric was re-scored mid-run; the panel
  watches are noise (CIs cover 0).
- Kill classification (Steve's teaching): **metric-broken, not
  concept-dead**. The wiring repair is provably correct (23/23 fixtures),
  safe (det-gate 16/16, guardrails pass), and effective on its channel
  (+92%). Per the task's kill protocol + §14, the lever is KILLED-AT-PILOT
  (layer deleted zero-trace below); the CONCEPT is preserved as a claimed
  findings-backlog item for the next run with the revised metric.

## Findings for sim-findings.md

- [claimed] 2026-10-19 — hunt-detector wiring fix (huntroster-b named spec
  option 1) — PROVEN correct + safe (23/23 RED→GREEN fixtures; 16/16
  det-gate; guardrails pass; staffing-channel +92%), KILLED-AT-PILOT on a
  confounded primary (task-lead lottery swamped the mean 0.79x < 1.15x).
  Next run: re-apply the 63-line diff (documented in this evidence file),
  primary = staffing-channel hunt kcal/run >= 1.15x (run
  fleshout-b-20261019T1349Z).
- [open] 2026-10-19 — villagerHuntResolve bypasses the BEAR.md portion law
  — task-lead hunters resolving ~4x/day produce 200-500k kcal jackpots
  (full animal calories x 0.6 x eff, no 500-kcal portioning). Substrate
  pathology, exists with/without the wiring fix (run
  fleshout-b-20261019T1349Z). Needs Steve's design call before any work
  (steve-call): should villager butchering portion like the player's?
- [open] 2026-10-19 — huntroster spec count slip — the named fix spec says
  "14 hunt-relevant occupations" but lists 13 ids (8 x 1.4 + 5 x 1.2)
  (run fleshout-b-20261019T1349Z).

## Verdict

**KILLED-AT-PILOT** (metric-broken, not concept-dead). Layer deleted
zero-trace per kill protocol; instruments + evidence kept and committed.
