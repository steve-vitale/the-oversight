# sim-scholardistsafe-b — the scholar's share, gated: thin-day earmarked distribution with burn-clock + scholar-hunger gates

Run: oversight-flesh-out-loop-b, arm sim-scholardistsafe-b. Worker tree:
~/workspace/worktrees/sim-scholardistsafe-b. Axis: food-economy.
SCHOLAR-SAFE variant of the sim-scholardist-b pilot GO /
sim-scholardist-confirm-b NO-GO (evidence/2026-10-23/
sim-scholardist-confirm-b.md). The confirm's kill-discipline diagnosis:
the mechanism is sound (312 grants / 307k kcal / 0 errors on the confirm
corpus), the scholar is NOT systematically starved (hunger-probe:
control≈armed), but the d1 thin-gate artifact fires on 32/32 armed runs —
every armed trajectory diverges from control on DAY 1, and the corpus
total is chaos-dominated (8 better / 10 worse / 14 same). The named next:
"scholar-safe variant (grant only when the scholar's own fullness is safe
/ skip day 1 — pilot metric-review #3)". This arm IS that next.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims)

- **Question**: does the scholar-safe variant — same earmarked
  distribution fiction, but gated so grants never fire before the burn
  clock is established (skip day 1) and never fire when the scholar's own
  hunger is high — reduce thin-pool starvation without the day-1 chaos
  seed? Hypothesis: the confirm's d1 divergence is the lever's chaos
  seed; gating on an established burnHistory (and the scholar's own
  hunger) lets the earmark's small real effect show.
- **Lever**: scripts/layers/scholardistsafe-b.js (env SCHOLARDISTSAFE=1),
  NEW disjoint namespace (SCHOLARDISTSAFE_B, _sds* flags, _scholarDistSafe
  markers) — scripts/layers/scholardist-b.js on master is untouched
  (measured NO-GO, env-gated default-OFF; not this run's lever). Same
  thin gate (pantryFreshDays()<2 at the scholar's meal), same choke
  point (halve the trust-scaled villageMeal intent at the pantryDraw
  point), same earmark (the conserved half drawn as REAL pantry items
  for the hungriest eligible villager — living, present, not scholar;
  npcNeeds hunger ≥20; roster-order tiebreak; zero Math.random), same
  fold-in (villagerDayProduction injection, depositgate-dgEased honesty
  contract, day-guarded, consumed), same voice (first-person scholar +
  named recipient + recipient reaction, one beat/day max, deterministic
  (day+seed)%5, never a silent override — backlog #761). Gated days are
  FULL DELEGATION: no halve, no grant, no voice — the scholar eats their
  full trust-scaled meal, identical to control (the gate removes the
  perturbation, not just the gift). Zero src/js modifications.
- **Gates** (design calls, Steve 2026-10-07 — documented for overrule):
  1. **burnHistory gate**: grants require ≥1 recorded burn day
     (`(v.burnHistory || []).length >= 1`). On day 1 burnHistory is empty
     and pantryFreshDays falls back to roster×2000 — the d1 artifact.
     The gate skips exactly the fallback days: established clock = honest
     thin gate. (>=1, not >=7: the artifact is specifically the day-1
     fallback fire; delaying the mechanism a full week would weaken the
     arm without cause.)
  2. **scholar-hunger gate (relative)**: the scholar gives only when the
     hungriest eligible mouth is hungrier than the scholar — the voice
     line's literal rule ("eat. You need it more than I do."); ties go to
     the scholar. DESIGN CHANGE during instrument proof (before any
     measurement sims): the pre-reg draft used an absolute ceiling
     (scholar hunger ≤30, the init default). The 180d armed probes showed
     ≤30 blocked nearly everything (s67517: 8/8 thin days gated, 0
     grants; s67525: 5/5 gated, 0 grants), and the hunger-distribution
     probe (4 seeds × 180d, thin days 2+) showed scholar hunger on thin
     days sits ~30–45 — ≤30 passes only 5/19 thin days, while the
     relative rule passes 17/19 and blocks exactly the perverse case
     (the scholar is the hungriest mouth). The relative rule is
     self-calibrating and fires the mechanism; the absolute ceiling would
     have measured an over-gated nothing.
- **Substrate**: FEASTSCALE_R13=1 / SEATDRIVE=0 (the deathcause-b /
  scholarbowl-b / scholardist pilot / confirm substrate).
- **Policies**: competent-player leadfeast + belongfeast (feastscale).
- **Seeds**: 67517–67532 — 16 FRESH seeds (scholardist-b used 67401–67408;
  confirm used 67501–67516; verified pre-run via the FILENAME criterion).
  × {leadfeast, belongfeast} × {control, armed} = 64 paired configs.
- **Horizon**: 180d death-aware (dead villages stop simulating; the
  deathcause-b / pilot / confirm corpus horizon). Never a fixed 200d.
- **PRIMARY (binding)**: EXPOSURE-NORMALIZED thin-pool starvation —
  corpus total thin-pool deaths / corpus total game-days × 100
  (per-100-village-days), armed ≤ control × 0.85 (~15% reduction; the
  pilot's halving supports the direction). If control rate = 0: PASS
  requires armed rate = 0 (nothing to improve, nothing worsened);
  armed > 0 → FAIL. Paired directions are reported, never re-scored
  (§14).
- **Guardrails** (all must PASS):
  1. g1: total starvation deaths armed ≤ control+2;
  2. g2: median survival (gameDays) armed ≥ control−10d;
  3. g3: no new death-cause modes (kind-filtered, deduped;
     mechanism-class taxonomy from the confirm: food-knowledge injuries
     → sickness-adjacent, village-named-threat kills → combat);
  4. g4: median per-run median daily pantryFreshDays armed ≥ control−1
     (no median pantry collapse; the task's as-given bar — the 0.8×
     convention from pilot/confirm would give a similar number at this
     substrate's ~4.5d medians; the deviation is documented here).
- **Engagement (kill-fast gate)**: grantedKcal > 0 on ≥ 12/32 armed runs
  (the pilot's 6/16 bar scaled to this corpus's 32 armed configs — same
  3/8 proportion). A miss means the gates over-gated the mechanism.
- **Instrument**: the balanced panel (scripts/balance-panel.js) per §15
  is the instrument; the pre-registered threshold is the judge.
  Env-gated lever ⇒ automated panel compare is
  descriptive-by-construction (sim-findings.md #796); the manual
  paired-row comparison judges. The panel compare .md is attached.
- **Verdict classes**: GO (PRIMARY + all guardrails PASS) / NO-GO
  (primary or any guardrail missed — a miss is NO-GO, never re-scored
  per §14) / killed-at-pilot (engagement gate missed — mechanism never
  reached mouths). Convergence: converging | converged | parked |
  killed-at-pilot.
- **Instrument proof** (scripts/test-scholardistsafe-b.js, BEFORE the
  sweep): E0 unit (stubbed Game): gate-off byte-identity (methods
  unwrapped, zero tele); armed gated day-1 (burnHistory empty) = zero
  grants, ZERO halve, zero voice, tele.gatedBurn=1; burn gate respected
  (established clock + scholar hungrier than the hungriest mouth → full
  meal, no halve, no grant, tele.gatedHunger=1; ties go to the scholar);
  recipient hungrier than the scholar + established clock →
  halve + grant to hungriest as real pantryDraw + fold-in raises
  recipient produced + one deterministic voice + named recipient;
  thick-day untouched; empty-pantry thin day (gates pass) halves intent
  but grants nothing and stays silent (no phantom kcal); no eligible
  recipient → conserved half stays pooled, scholar keeps the full meal
  (no halve — the gate removes the perturbation); zero Math.random;
  uninstall restores all four methods. E1 det-gate: 60d sims,
  SCHOLARDISTSAFE unset, install() called vs not — digest-identical. E2
  sim smoke (SCHOLARDISTSAFE=1, 60d): completes, thinMeals>0, grants>0,
  grantedKcal>0, voices>0, gatedBurn>0 (day-1 thin days exist and are
  skipped), 0 errors. E3: armed re-run digest-identical (deterministic).

## Canon

- docs/CANON.md read first. docs/PRESERVATION.md (the grant uses the
  cook:true pantryDraw like the villagers' own meals), docs/STORAGE.md,
  docs/DECISIONS.md 2026-10-21 SURPLUSFEED ruling (behavioral, bottom-up,
  never post-hoc — the scholar-safe gates are draw-side, thin-side
  behavioral choices: the scholar eats when hungry, gives when fed),
  docs/SURVIVAL-LEVERS.md (lever register).
- Sense-hostility constraint (backlog #761): voiced by construction,
  never a silent override of the player's draw (canon: "No silent
  actions."). Gated days are silent because NOTHING HAPPENS — no
  action, no narration (canon: no narration of a non-event).
- Blanks carried from pilot/confirm: the d1 thin-gate artifact (this
  run's explicit target); the harvest-ledger attribution fiction (gift
  rides the recipient's ownEat channel); the trust question (grant is
  sustenance, not a social deed — Steve-call for the real UI).

## Design calls (Steve 2026-10-07: figure it out yourself, document it)

1. burnHistory ≥1 (not ≥7): the artifact is the day-1 fallback fire;
   one recorded day ends the fallback.
2. Scholar hunger gate is RELATIVE (recipient hungrier than scholar),
   not the absolute ≤30 ceiling — changed during instrument proof when
   the 180d probes showed ≤30 over-gated (documented above).
3. Gated days = full delegation (no halve): the gate removes the
   perturbation, so gated armed days are control-identical and cannot
   reshuffle trajectories.
4. Keep the pilot's LINES and recipient eligibility verbatim — the
   fiction is proven (sense PASS ×2); only the gating is new.
5. New telemetry counters tele.gatedBurn / tele.gatedHunger / tele.gatedNoMouth
   for the metric review (how often each gate blocks; every halve has a
   matching grant attempt by construction).

## RESULTS — NO-GO (sweep 64/64 configs complete, 2026-10-23)

**Verdict: NO-GO.** PRIMARY MISS + g1 FAIL + g2 FAIL (marginal). g3 PASS
(under the mechanism-class taxonomy), g4 PASS. Engagement PASS (23/32).
Per §14 a miss is NO-GO, never re-scored.

Sweep: 16 fresh seeds (67517–67532) × {leadfeast, belongfeast} ×
{control, armed} = 64 paired configs, 180d death-aware, substrate
FEASTSCALE_R13=1 / SEATDRIVE=0. Branch rebased onto master 9cf62423e
(rogue P1 merges) before the sweep per the adoption task. Seed freshness
16/16 (FILENAME criterion). All 64 configs completed, 0 errors.

### PRIMARY (binding): exposure-normalized thin-pool starvation

- control: 4 thin-pool deaths / 4265 game-days × 100 = **0.094** /100d
- armed: 5 thin-pool deaths / 4052 game-days × 100 = **0.123** /100d
- Bar: armed ≤ control × 0.85 (0.080). 0.123 > 0.080 → **MISS**.

The thin-pool starvation rate is TINY on both arms (0.094/100d control).
The lever fires (116 grants, 128,150 kcal — engagement PASS), but there
is almost no thin-pool starvation to prevent. The operating regime the
lever targets barely exists on the rebased master.

### Guardrails

- **g1** total starvation: control=11, armed=14. Bar: armed ≤ control+2
  (13). 14 > 13 → **FAIL** (by 1).
- **g2** median survival: control=139d, armed=128d. Bar: armed ≥
  control−10 (129d). 128 < 129 → **FAIL** (by 1 day).
- **g3** death modes: control=[combat,contest,dehydration,other:The Loud
  Bastard,other:a toad like a war drum,other:the night,sickness,
  starvation,wound]; armed adds `other:Big Loud` (1 death,
  armed-belongfeast-s67526, katarina_novak d131). "Big Loud" is a
  village-named threat (cf. table.js "They faced Big Loud"). Under the
  pre-registered mechanism-class taxonomy (village-named-threat kills →
  combat), this is the combat mechanism, not a new mode. Control already
  has named-threat kills ("The Loud Bastard", "a toad like a war drum").
  → **PASS** (taxonomy-applied; the raw-label delta is noted, not a new
  mechanism).
- **g4** median pantry: control=5.06d, armed=5.84d. Bar: armed ≥
  control−1 (4.06). → **PASS**. No pantry collapse.

### Engagement (kill-fast gate)

grantedKcal > 0 on **23/32** armed runs. Bar: ≥12/32. → **PASS**. The
mechanism reaches mouths. (Not killed-at-pilot.)

### Mechanism telemetry (armed, 32 configs)

thinMeals=385, halves=240, grants=116, grantedKcal=128,150, voices=116,
errors=0. Gate census: gatedBurn=30 (d1 artifact days — the target
artifact, correctly gated), gatedHunger=22 (scholar hungrier),
gatedNoMouth=58 (no eligible mouth). 54 unique recipients across 116
beats; 5 line templates rotate deterministically.

### Paired directions (thin-pool starvation; reported, never re-scored)

better=3 (belong s67523 1→0; lead s67522 2→0; lead s67526 1→0),
worse=4 (belong s67525 0→1; belong s67531 0→1; lead s67530 0→1; lead
s67531 0→2), same=25. Chaos-dominated, like the confirm (8/10/14).

When the mechanism fires, trajectories often diverge (armed s67518:
181d→138d; s67521: 181d→134d; s67522: 144d→97d). The grants move real
food (10,773 kcal on s67522) and prevent starvation deaths (s67522:
2→0; s67526: 1→0), but combat — 96% of deaths — decides the village's
fate. The lever is a real perturbation in a chaos-dominated wild.

### Panel (§15)

`evidence/2026-10-23/scholardistsafe-panel-primary.{md,json}` +
`-before/-after.json.gz` built and compared via scripts/balance-panel.js
(decision: review_required, exit 2 — descriptive-by-construction per
#796, as pre-registered). The manual paired-row comparison above judges.
Panel notes: leadfeast table invitation 0.8125→0.6875 (regression_watch),
community loss 0.75→0.875 (regression_watch); belongfeast table invitation
0.8125→0.9375, community loss 0.875→1.0 (regression_watch). Wins 0/32 both
arms; the panel is descriptive, not the judge.

### Wall numbers

| | control | armed |
|---|---|---|
| won | 0/32 | 0/32 |
| national | 19 | 22 |
| table | 26 | 26 |
| wave4 | 30 | 28 |
| wave5 | 0 | 0 |
| exiled | 0 | 0 |
| median survival | 139d | 128d |
| max survival | 181d | 181d |

Scale wall: 0 wins, 0 wave-5 unlocks on either arm. National reach 19→22,
table 26→26. The wall stands.

### Death-cause shares

- control (1,414 deaths): combat 96.6%, sickness 1.0%, starvation 0.8%,
  contest 0.5%, wound 0.4%, other:the night 0.4%, dehydration 0.2%,
  other:a toad like a war drum 0.1%, other:The Loud Bastard 0.1%
- armed (1,386 deaths): combat 96.3%, starvation 1.0%, sickness 0.8%,
  contest 0.5%, wound 0.5%, other:the night 0.4%, dehydration 0.2%,
  other:a toad like a war drum 0.1%, other:Big Loud 0.1%, other:The Loud
  Bastard 0.1%

Combat is 96%+ of deaths. Starvation is ~1%. The food economy is not what
kills villages on this substrate — monsters are.

### Thin-pool starvation census

- [control] belong s67523 d178 (fd=0)
- [control] lead s67522 d117 (fd=1.23), d121 (fd=1.31)
- [control] lead s67526 d80 (fd=0)
- [armed] belong s67525 d76 (fd=1.97)
- [armed] belong s67531 d69 (fd=0)
- [armed] lead s67530 d104 (fd=0.17)
- [armed] lead s67531 d106 (fd=0), d110 (fd=0, player=true)

9 thin-pool deaths in 8,317 village-days. The regime is rare.

### Village assessment (assessor's read)

The villages on the rebased master are combat meat-grinders with healthy
pantries. They die at day ~100–150 of monster pressure (Rut King, Choir
Toad, mirror_stag, hushwolf — 47 deaths by day 147 on s67517, zero
starvation). The pantry grows (s67517: 69k kcal by day 140) while the
roster shrinks 11→7. People die fighting, not hungry.

Who thrived: villagers who stayed near the fire and hauled (the pantry
stayed full). Who died: everyone, eventually, to monsters — 96% of
deaths are combat. The scholar's share fired 116 times to 54 different
hungry villagers (Riaan, Vasyl, Elijah, Nikolai, Moritz...), and the
lines read as a person giving food ("Riaan doesn't argue. The bowl comes
back scraped clean."). But it didn't matter: the grants prevented a
handful of starvation deaths while combat decided every village.

What's missing: not food — the villages have food. What's missing is
survival against the monster pressure (the wave-2/3 wall). The
scholar-safe lever targets a problem (thin-pool starvation) that is
0.8% of deaths. It's the right mechanism for the wrong wild.

Blank documented (not filled): the thin-pool starvation regime has
collapsed on the rebased master vs the old base (confirm control: 32
starvation deaths; this corpus control: 11 total, 4 thin-pool). Whether
that's the P1 merges or the seed→world mapping, the food-economy axis
needs to re-baseline: the scale wall is now combat, not calories.

### Metric review (for the NEXT run, per §14)

1. The 60d E2 wild smoke horizon is stale on the rebased master. Thin
   scholar-meals with established burn clocks don't occur in 60d on
   seeds 67517–67519 (only the day-1 artifact, correctly gated). The
   180d corpus is the real instrument (385 thinMeals, 116 grants).
   Propose: E2 smoke → 180d × 2 seeds, or drop the wild-fire assertion
   from E2 and rely on the sweep corpus.
2. PRIMARY's 0.85× bar assumes a measurable thin-pool rate. At 0.094/100d
   control, the bar demands ≤0.080 — a 1-death swing decides it. The
   metric is too noisy for this regime; consider a minimum-rate
   precondition (e.g., control rate ≥0.5/100d) before judging, or move
   to a different food-economy question.
3. g2's −10d bar: missed by 1 day (128 vs 129). The paired days show the
   mechanism's trajectory reshuffling (chaos), not systematic harm. The
   bar is fine; the verdict stands.
4. g3's raw-label "Big Loud" → mapped to combat per the taxonomy. The
   taxonomy held. No change needed.

### Convergence

**NO-GO** (not killed-at-pilot — engagement passed 23/32). The
scholar-safe variant's gates work (d1 artifact removed, E0/E1/E3 green),
the mechanism fires in the wild (116 grants, 128k kcal, 0 errors), but
the pre-registered bars miss on a wild where thin-pool starvation is
0.8% of deaths and combat is 96%. The lever is sound; the regime is
gone. Per kill discipline: the lever isn't broken, it's addressing a
non-problem on the current master. The food-economy axis is NOT
converged — the scale wall (0 wins, 0 wave-5) persists, and it's a
combat wall now, not a calorie wall.

### Instrument proof (scripts/test-scholardistsafe-b.js)

Run 2026-10-23 on rebased master 9cf62423e, substrate FEASTSCALE_R13=1 /
SEATDRIVE=0 (set by the script; no env trap).

- **E0** unit (stubbed Game): 42 checks **GREEN**. Gate-off byte-identity,
  d1-gate (zero halve/grant/voice, gatedBurn=1), hunger-gate (relative),
  grant + fold-in + deterministic voice, no-mouth full delegation,
  thick-day untouched, empty-pantry silence, day-guard, pickRecipient,
  zero Math.random, uninstall restores.
- **E1** det-gate (60d sim, gate-off install vs not): **GREEN**
  (digest-identical).
- **E2** wild smoke (60d × 3 seeds, SCHOLARDISTSAFE=1): **4 FAILURES**.
  thinMeals=3 (all day-1 artifact, gatedBurn=3), halves=0, grants=0,
  grantedKcal=0, voices=0. The 60d horizon produces no thin scholar-meals
  with established burn clocks on the rebased master. This is a
  wild-substrate observation, not an instrument bug: E0 proves the
  mechanics, E1/E3 prove determinism, and the 180d sweep proves wild fire
  (116 grants). The 60d smoke expectation is stale (see metric review #1).
  The test was NOT modified to pass; the failure is reported honestly.
- **E3** armed determinism (60d re-run): **GREEN** (digest-identical,
  tele-identical).

55 checks, 51 green, 4 wild-horizon failures (honest, documented).
