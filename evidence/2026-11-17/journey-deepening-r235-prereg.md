# Journey deepening r235 — prereg

- Run: r235, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100 for comparability with r213/r218/r222/r226/r227/r232)
- Run id: playtest-a-20261117T1644Z (lock loop-a-20261117T164401Z)
- Base: master `3d9517838` (journey-establishment r232 closeout)
- Registration note: the first registration attempt (16:46Z) failed
  after 18 min — both `git worktree add` attempts checked out 100%
  then failed at `fatal: Could not reset index file to revision
  'HEAD'` during a host write flap (flap-watch EPERM at write() from
  17:02Z; direct `git update-ref` probes rc=128 at 17:05/17:09/17:14Z).
  The flap cleared with a VM replacement; probe green 17:20:12Z and
  the retry registered in ~6.5 min. Branch `journey-deepening` was
  created by the first attempt and reused. No src change is involved
  in the delay; the panel base is unchanged.
- Base delta vs r232's panel base (b4cdf252d): 60 commits. Src changes
  relevant to titans/muster: the refusal-once-a-day fix (fdf79a680,
  journey-scale r233 — the spoken muster-gate refusal is said once per
  titan per day, outcomes still recorded per refusal; proof 25/25, red
  verified 17/8) and the r232 slain-field reconciliation (a6e2bfb58,
  already in the r232 B arm). Also in the delta: PLANFIX lever
  (sim-planignite-fix-a, env-gated default-OFF), deathcleanup-b
  (winPlan dies with the villager), sim-nondeathplan-b, social-life
  r234 DRY2 fix. No src/js/titans.js change besides the refusal fix
  since r232. The control arm is NOT a replication of r232 (the game
  moved under it); comparisons to r232 numbers are context, never
  replication.
- Policy: competent + MUSTER POLICY (r227 verbatim, driver-only) +
  MARCH STEP (r228 verbatim, driver-only — require walkTo from
  policies/competent-nofallback, never a copy). Single arm: this run
  VERIFIES the already-landed refusal fix in the wild on current
  master. No seek-the-titan pathfinding beyond the march; no outfit;
  no finale/nielsen campaign gates.
- Seeds: 103601–103608 (8 seeds)
- Seed-band freshness check (local_seed_band_freshness): searched all of
  `evidence/` (repo) — 0 hits in *.md for 103601–103608 (full-tree md
  grep); hidden evidence (`hidden_files/evidence/`) 2026-11-17
  filenames: 0 hits; not on the nationalsticky forbidden list.
  REJECTED first choices: 103401–103408 (journey-scale r233, same day,
  Lane B) and 103501–103512 (sim-planignconfirm-b).
- Driver: fork of scripts/journey-deepening-r232-20261117.js (band +
  tag r235, ARM tag REMOVED — single arm) + refusal-hearing instrument
  (wrap Game.say; count the muster-refusal line "You cannot face this
  alone" per titan per day in the per-seed JSON as
  `refusalHeard`) + coalition-gap watch (muster allies+haven totals
  per titan-day). Analyzer: fork of
  scripts/analyze-journey-deepening-r232-20261117.js +
  summarizeRefusalHeard + summarizeCoalitionGap (new; carried
  summaries verbatim). Proof tests: analyzer carried + new cases for
  the two new summarizers; refusal-instrument synthetic test (new).
- Canon read: docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 gate:
  standing >= 100 + readiness bars; observation channel: 2 survived
  encounters → trick). NO canon doc covers titans/muster — mechanism
  grounded in src/js/titans.js + src/data/titans.json (Herald: wave 4,
  minAllies 10, monster "herald"; refusal dedupe via
  state.titans.refusalSaidDay, titans.js:1358-1369).

## Q1 — REFUSAL-ONCE-A-DAY, WILD VERIFICATION (primary, single arm)

Why: scale r233 fixed the refusal spam (r232: 41 refused on 103307
over 10 days; scale arm A: 10 refused on ONE day, seed 103402) with
the once-per-titan-per-day dedupe, but the fix has NEVER been
observed in the wild — the scale panel ran on pre-fix code and the
fix was proven only by its proof test (25/25, red 17/8). A dedupe
that passes synthetic cases can still fail in the wild (wrong day
source, state not saved, a second call path that also says the
line). This panel is the wild verification.

Bound metrics (per seed, panel totals in the analyzer):
- Per (titan, day): spokenRefusals = say-wrap count of the
  muster-refusal line ("You cannot face this alone"); outcomeRefusals
  = outcomes 'refused' with gate 'muster' on that titan-day.
- The log stays honest by design (outcomes recorded per refusal), so
  outcomeRefusals may exceed 1 while spokenRefusals must not.

GO (all three must hold):
- Every titan-day with >= 1 outcome refusal has EXACTLY 1 spoken
  refusal (spoken <= 1 everywhere AND no refusal day is silenced to
  0 — the line must still fire).
- >= 1 titan-day panel-wide has outcomeRefusals >= 2 with spoken ==
  1 (the dedupe actually engages in the wild).
- 0 titan-days with spoken > 1.
A day with spoken > 1 = NO-GO (fix fails in the wild; classify per
§14a: CONCEPT-DEAD if the dedupe logic itself misses a path,
METRIC-BROKEN if the instrument mis-attributes the line).
If NO titan-day has outcomeRefusals >= 2, the dedupe bullet is
UNMEASURED (fix judged by its proof test + the <= 1 bullets); if
there are NO refusals at all panel-wide, Q1 is UNMEASURED.
Watch only (no verdict): campaign-gate refusals — the fix
deliberately leaves that path untouched; count them so a repeat
there is visible.

## Q2 — COALITION CHOKE (secondary, diagnostic, r232 metric-review owed)

Why: r232's binding wall is the 10-blade coalition bar, not the
observation stall: three seeds sat at 7/8/9 blades for weeks
(103302: 7, 22 days; 103303: 9, 32 days; 103307: 8, 42 days) while
the three that fought all reached exactly 10. The w4stuck1 bar
(>= 6/8) missed again at 4/8 and now measures a different wall than
the one that binds.

Bound metrics: per seed, max blades (allies + haven) reached while
a titan is present; days spent at 7–9 blades with titan present;
days from first call to ready; re-call count after a routed muster.
Interesting if >= 1 seed sits 1 short (9 blades) >= 14 days, or
>= 1 seed reaches 10 only via re-call. This run MEASURES the
distribution and PROPOSES the re-pointed bar (seeds reaching 10
blades) for the next run; no bar is set in advance on a distribution
never measured. The old w4stuck1 bar is measured alongside for
continuity (r232: 4/8).

## Policy safety rules (part of the prereg, not tunable mid-run)

- Muster (r227 verbatim): call ONCE per link-count change (refusals cost
  trust −8 per call, never sound daily); council once per located omen;
  one commit cycle per muster; titanCommitOwn two-tap in one daily tick.
- Titan carve-out in policy.fight applies ONLY when the fight holds a
  titan monster id AND Game.titanMusterReady(mid) is true; the mid-fight
  hpPct < 0.35 flee and the stalemate flee stay as-is.
- March (r228 verbatim): fires ONLY for a located (stage >= 2), present,
  unslain titan with a READY muster; sanctity holds (over / tbfight /
  pendingEncounter / tableActive / sleeping) use the braced pattern
  (hold(...) then continue INSIDE the if); never marches without a ready
  muster, never outfits allies, never touches finale/nielsen campaign gates.
- No seek-the-titan pathfinding beyond the march. If a muster completes
  but no fight fires by day 100, that is a recorded finding (march gap),
  not a policy failure to hide.

## Q3 — PEOPLE CHECK

Read 1–2 full transcripts from convo days 45/60/80 in full (SENSE-TESTING
LAW): does the NPC want something, do options engage/deflect it, do
endings resolve/plant/owe? Note verbatim lines. Also read the
muster/march/fight voice in full on at least one seed (the refusal
line itself is Q1's instrument — read it in the wild, not just the
count).

## Q4 — CENSUS + REACHABLE / FUN / WINNABLE

Census in plain words (who lived, who died, what they knew, what was
missing). Judge reachable / fun / winnable for deepening. Carried:
w4stuck1 (old bar, continuity only), trick pipeline (taughtRate null
rule, learnedRate), w4fights / w4kills — NOTE scale-r233 metric
review: the analyzer "wave-4 kills" line counts FIGHTS (ladder
fightsByWave['4']); relabel it "wave-4 fights" and add a band kill
total from kAttr — the verdicts don't change, but the number stops
overstating. Banked veterans, w5 unlocked/faced/killed. Slain-field
carried as a watch (r232: 0 opportunities in 16 seeds; the fix is
judged by its proof test).

## Secondary blank investigation (no src change unless small + safe)

tableActive distinction (scale r233 owed next): the muster step's
sanctity gate cannot tell a live table sequence from the mercy
window — 103405 held 'tableActive' on 78 muster rows over 74 days
with the titan PRESENT, after delivering the feast embassy d62, and
could never muster again. Investigate the gate in code, document the
design; land a fix ONLY if it fits in this run's remaining time with
a proof test + panel re-check. Otherwise it stays owed with the
evidence cited.

## Substrate checklist (§14b, before the pilot)

1. Contact: refusals occur on the deepening band (r232: 41 on 103307,
   31 on 103308; scale arm A: 10 in one day on 103402). The
   say-wrap instrument counts the spoken line; outcomes count the
   refusals. Both observable in the per-seed JSON.
2. Pool sizing: the dedupe bullet needs >= 1 multi-refusal titan-day;
   r232/scale bands produced them on 3+ seeds each, so the pool is
   not thin by construction (unlike slain-field).
3. Verb existence: the fix needs no new verb — the dedupe lives in
   titanWrapCombat, an existing wrapper; the instrument wraps
   Game.say, an existing driver-side wrap pattern.
4. Horizon fit: DAYCAP 100 — r232's refusal days span the whole
   window; the phenomenon is inside the horizon.

## Watches (no verdicts unless the bar trips)

- Scholar deaths (standing metric, r138 rule as corrected by r222's metric
  review): compare against r232 (17 total, 13 wild), NOT the
  establishment ≤2/panel bar.
- Survival vs r232 (8/8 survived, 100d).
- Ladder stage at d80; regional links seasoned by d80.
- Wave-3 wild Reunion: fights + outcomes (arena cap landed; wild untouched).
- Herald gorge: transcript lines where the titan eats from the stores
  (r223: 800–1,200 kcal/night) — counted only if the analyzer scan finds
  them; no verdict.

## Gate / telemetry

- `node scripts/check.js --quick` in the worktree (cache
  /tmp/jest-cache-playtest); 0 attributable failures = GO.
- Telemetry: `node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/deepening.json --current
  'evidence/2026-11-17/journey-deepening-r235-*-seed*.json'`. Known LOUD
  schema mismatch (driver emits no guardrails.*) — baseline NOT rolled on
  that line alone; any NEW loud line is a same-run investigation item.

## Metric review (filled at closeout)

- (to be filled)
