# Journey deepening r232 — prereg

- Run: r232, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100 for comparability with r213/r218/r222/r226/r227)
- Run id: playtest-a-20261117T0920Z (lock playtest-loop-a-2026-11-17T08:47:40Z)
- Base: master b4cdf252d (worktree journey-deepening, registered 08:56Z; registration queued ~8 min on the registry lock — live reaper self-contention, same family as r222/r226/r227. VM replaced 09:16Z mid-run; heartbeat loop relaunched on the fresh VM, manual heartbeat re-landed 09:17:16Z.)
- Base delta vs r227's panel base (2ac3052b0): 61 commits. NO src/js/titans.js or src/js/game.js change in the delta — the titan engine is byte-identical to r227's panel base. Src changes in the delta are unrelated to titans: establishment-r231 favor fix (af1791e90), social-life-r231 C3d fix (db83d5ccd), companion-guard unconditional (2ac1e0566); the reattach / rumortarget / nightcarry levers were all reverted (net src diff 0). Driver/analyzer/evidence-only landings: r227 itself, scale r228 (march policy, driver-only), landing r141, crisis r229, plus sim-arm instruments. The control arm is NOT a replication of r227 (the game moved under it — r228 lesson owned); comparisons to r227 numbers are context, never replication.
- Policy: competent + MUSTER POLICY (r227 verbatim, driver-only) + MARCH STEP (r228 verbatim, driver-only — require walkTo from policies/competent-nofallback, never a copy). Both arms run muster+march; the ONLY difference between arms is the src/js fix (see Q1). No seek-the-titan pathfinding beyond the march; no outfit; no finale/nielsen campaign gates.
- Seeds: 103301–103308 (8 seeds)
- Seed-band freshness check (local_seed_band_freshness): searched all of
  `evidence/` (repo) — 0 hits in *.md for 103301–103108 (full-tree md grep,
  2026-10-13 through 2026-11-17); hidden evidence
  (`hidden_files/evidence/`) filename + content search 2026-11-1x: 0 hits;
  not on the nationalsticky forbidden list. REJECTED first choices:
  102601–102608 (sim-planignite-a), 102701–102708 (sim-stand199-b),
  102801–102808 (sim-medicduty-b), 102901–102908
  (sim-vetreengage-confirm-a), 103001–103008 (sim-expignite-b),
  103101–103108 (sim-nightcarry-a + sim-rumortarget-a, both 2026-11-17),
  103201–103208 (sim-reattach-a + sim-zeroattempt-b).
- Driver: fork of scripts/journey-deepening-r227-20261117.js (band + tag
  r232 + ARM tag + march step graft + titanEnd outcomes/death-tele/
  villageSlain + marchWatch in the per-seed JSON). Analyzer: fork of
  scripts/analyze-journey-deepening-r227-20261117.js +
  summarizeSlainField + summarizeMarch (lagged join, r228 verbatim:
  a fought/slain outcome on a march-arrival day OR the day after, same
  titan, is march-completed). Proof tests: muster carried (12/12),
  analyzer carried + new slain-field/march cases, march-step decision
  rules (new, synthetic stubs), slain-field engine proof (new, commit 2).
- Canon read: docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 gate: standing
  >= 100 + readiness bars; observation channel: 2 survived encounters →
  trick). NO canon doc covers titans/muster — mechanism grounded in
  src/js/titans.js + src/data/titans.json (Herald: wave 4, minAllies 10,
  monster "herald"; omen needs wave >= 4 AND scaleRank regional+,
  0.10/day; no_solo_titans hard-refuses startCombat without a complete
  muster; slain set ONLY by titanResolveFight via titanVictory,
  titans.js:1498; presence is titanMonsterPresent; deaths are the
  registerDeath telemetry record, state.telemetry type 'death' with
  who=monster id, cause 'villager combat' — corpses.js + game.js:20975).

## Q1 — SLAIN-FIELD FIX: DOES THE DAWN RECONCILIATION NOTICE A FIELD-KILLED TITAN? (primary, before/after)

Why: r227 documented the defect and left the fix brief — a villager
field-kill of the Herald (102506, day 98) never sets
state.titans.slain.herald, the omen sits at stage 2, and the muster keeps
charging upkeep for a corpse (lastUpkeep 101). The fix reconciles in
titanDawnTick: for each live titan with omen stage >= 2 and not slain, if
the titan monster is absent from the world (titanMonsterPresent false)
AND a kill is recorded (telemetry death who=monster id, OR
state.villageSlain[monster] >= 1 — both are engine kill records from the
same vKill branch; the OR covers the 300-entry telemetry cap), mark it
slain, say it aloud (name the killer when the corpse names one), release
the committed and clear the muster (upkeep stops), ledgerAdd
'titan:slew:<tid>', recordMoment, and record the outcome distinctly
('slain-field') so the key's gate can tell it apart from a muster slay.
No relic, no viewership bump, no System broadcast — those are the
muster-fight spectacle beats, not a field kill's. The open Steve design
call (should villagers grind titans by attrition at all?) is NOT answered
here — the fix only stops charging upkeep for a corpse.

Arms (identical seeds, identical driver, only src/js differs):
- A (control): master b4cdf252d, no fix. Run FIRST, on the commit-1 tree.
- B (fix): + the titanDawnTick reconciliation (src/js/titans.js) +
  proof test. Run SECOND, after the fix commit.

Bound metrics (per seed, panel totals in the analyzer):
- Opportunities: a titan that died in the field — telemetry death
  (who=monster id) with the monster absent from the world census at end,
  on a seed where the omen reached stage 2. Counted on BOTH arms from the
  per-seed JSON (titanDeathTele + monsterWatch + titanEnd).
- Reconciliations (B only): slain[tid] set + outcomes record
  'slain-field' + muster cleared (musters[tid] null) + no upkeep charged
  after the kill day (lastUpkeep <= kill day).
- False reconciliations (B only): slain set while the titan monster is
  present in the world at end, or a muster stood down (cleared) while its
  titan lives — either is a defect in the fix, not a win.
- Defect reproduction (A): opportunities on A left unreconciled — slain
  unset at end with the muster still charging upkeep after the kill day.

GO (all three must hold):
- >= 1 opportunity on B, and EVERY opportunity on B reconciled
  (slain + 'slain-field' + muster cleared + upkeep stops).
- 0 false reconciliations on B.
- The defect reproduces on A (>= 1 opportunity left unreconciled).
A miss on the first or third bullet with opportunities present = NO-GO
(classify per §14a: CONCEPT-DEAD if B fails to reconcile a real
opportunity; METRIC-BROKEN if the bar was unachievable — see below).
0 opportunities panel-wide = UNMEASURED, not NO-GO: the fix is then
judged by its proof test + code review, and the arm returns with a pool
note. (§14b pool sizing: r227 saw 1 field kill in 8 seeds and villagers
mauling Heralds to 1–2 HP on 3/8 — the pool is thin by construction, and
the march may shrink it further by fighting the titan first.)

## Q2 — MARCH vs FULL-STRENGTH TITAN (secondary, diagnostic, both arms combined)

Why: r228's named next question — the scale march win was nearly free
(Herald at 1/700 HP, mauled for months by villagers). Deepening is where
titans arrive fresh. This run measures, on all 16 arm-seeds, whether a
marched muster engages and kills a full-strength Herald.

Bound metrics: for each titan fight that starts from a ready muster
(march-completed join: fight on a march-arrival day OR the day after,
same titan), Herald HP at fight start (titanHpFirst from monsterWatch)
and outcome (slain/fled, blades lost). Interesting if >= 1 fight engages
a Herald at >= 50% HP (350/700) — report the outcome either way. No
GO/NO-GO on the fix rides on this; it answers r228's question. Also
carried (r227 metric-review owed): ready→fight latency — days from
muster-ready to first titan fight, per seed.

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
  (hold(...) then continue INSIDE the if — the r227 bare-continue bug
  must not recur); never marches without a ready muster, never outfits
  allies, never touches finale/nielsen campaign gates.
- No seek-the-titan pathfinding beyond the march. If a muster completes
  but no fight fires by day 100, that is a recorded finding (march gap),
  not a policy failure to hide.

## Q3 — PEOPLE CHECK

Read 1–2 full transcripts from convo days 45/60/80 in full (SENSE-TESTING
LAW): does the NPC want something, do options engage/deflect it, do
endings resolve/plant/owe? Note verbatim lines. Also read the
muster/march/fight voice in full on at least one seed (r228 owed d90/d120
transcripts + raise talks — the deepening driver's CONVO_DAYS are
45/60/80; raise talks read from the raise-debug rows).

## Q4 — CENSUS + REACHABLE / FUN / WINNABLE

Census in plain words (who lived, who died, what they knew, what was
missing). Judge reachable / fun / winnable for deepening. Carried:
w4stuck1 (bar >= 6/8 reproduces the r226 thin spot; r227: 4/8, bar stays),
trick pipeline (taughtRate null rule, learnedRate), w4fights / w4kills,
banked veterans, w5 unlocked/faced/killed.

## Substrate checklist (§14b, before the pilot)

1. Contact: field kills of titans occur (r227: 102506, 1/8 seeds;
   villagers maul Heralds to 1–2 HP on 3/8). Titan presence + death tele
   both observable in the per-seed JSON (monsterWatch + titanEnd +
   titanDeathTele instrument).
2. Pool sizing: thin by construction — see Q1 UNMEASURED clause. The bar
   is >= 1 opportunity, not a rate.
3. Verb existence: the fix needs no new verb — it runs in titanDawnTick,
   an existing dawn hook; say / recordMoment / ledgerAdd /
   titanRecordOutcome / titanReleaseCommitted all exist.
4. Horizon fit: DAYCAP 100 — r227's field kill happened day 98; the
   window contains the phenomenon (barely). A kill on the last day with
   no dawn after it is recorded as "opportunity, no dawn left" (not a
   miss).

## Watches (no verdicts unless the bar trips)

- Scholar deaths (standing metric, r138 rule as corrected by r222's metric
  review): compare against r227 (23 total, 11 wild), NOT the
  establishment ≤2/panel bar.
- Survival vs r227 (7/8 survived, 100d).
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
  'evidence/2026-11-17/journey-deepening-r232-*-seed*.json'`. Known LOUD
  schema mismatch (driver emits no guardrails.*) — baseline NOT rolled on
  that line alone; any NEW loud line is a same-run investigation item.

## Metric review (filled at closeout)

- (to be filled)
