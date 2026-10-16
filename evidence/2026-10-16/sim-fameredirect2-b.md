# FAMEREDIRECT2 pilot — sim-fameredirect2-b (2026-10-16)

Loop B lever-loop run fleshout-loop-b-20261016T1056Z, ARM 3 (claim file:
`hidden_files/lever-claims/fleshout-loop-b-20261016T1056Z.json`). Axis:
food-economy (second non-converged axis; loop A holds scale-onramp per
`fleshout-20261016T1100Z.json`, zero file overlap by claim-file discipline).

## PRE-REGISTRATION (written BEFORE any sweep spend; §§9–12, 14 binding)

- PRIMARY: starvation deaths per 100 villager-days (sp100vd), summed over
  the 16-run suite. GO = armed <= control × 0.6 (relative bar — the killed
  arm's lesson, finding #143: absolute A/A improvement bars don't transfer
  across rate regimes; hungry-days doesn't see duty-trade deaths).
  Calibration anchor: famredirect pilot (2026-10-14) control 0.141 /
  armed 0.161, starvation 15→16, thirst 1→16, hungryDays 30=30.
- GUARDRAILS: thirst deaths <= control + 2 (the killed arm's mechanism, now
  a named guardrail); national >= control − 2; median survival >=
  control − 10d; exiled unchanged (<= control); no NEW death mode
  (armed death-cause keys must be a subset of control's, modulo zero-count
  keys).
- ABANDONED DUTY'S COST (the finding's demand): wood stockpile delta
  (start vs end, armed vs control), report-only — fire/palisade
  consequences named in the village assessment, never a guardrail.
- KILL: primary misses, or any guardrail binds.
- HORIZON: 180d death-aware (dead villages stop, +10d tail max).
- SEEDS: 11/22/33/44/55/66/77/88 × leadfeast/belongfeast, 16 runs/side,
  IDENTICAL seeds both sides. Own paired control on the same substrate.
- SUBSTRATE (coordinator brief): FEASTSCALE_R13=1 both sides, SEATDRIVE=0
  explicit. Stack: withFamineRedirect2(feastscale.leadfeast / belongfeast);
  the FAMREDIRECT2 env gate is the only switch (control = unset).
- INSTRUMENT HONESTY: SMOKE=1 gate before sweep spend (fail loudly if
  policy-less); per-side shape assertion (control: env unset + mechanism
  provably inert — fam2Ledger.redirects === 0 all runs; armed: env set +
  redirect fires in >=1 run across the pilot — else the lever is inert and
  the pilot is a NO-GO for a different reason).
- A miss is NO-GO — never re-scored mid-run. Metric doubts under "metric
  review"; revisions apply to the NEXT run.

## THE LEVER

The killed FAMINEREDIRECT arm (engine-side, `resolveOneAssignment`,
evidence/2026-10-14/sim-famredirect-b.md) redirected wood/water/stone →
food when the pantry held <2 fresh days. It moved labor (374 redirects in
15/16 runs) but traded starvation for thirst: thirst deaths 1→16. Killed.

FAMEREDIRECT2 is its named future, revived POLICY-SIDE ONLY (zero src/js,
`scripts/policies/fameredirect2.js`, gate FAMREDIRECT2=1 default OFF): when
the famine signal fires — `Game.pantryFreshDays() < 2`, the engine's honest
pantry accounting — WOOD+STONE duties in the assignment dict become food
work (forage→garden→fish round-robin), by VILLAGER INITIATIVE (the killed
arm's honest framing: "they check the pantry and choose hunger first" —
that framing was never the problem; water was). WATER duties are NEVER
redirected — the skip loop only matches wood/stone; the whole point of
this arm vs the killed one.

Design calls (Steve can overrule):
- The leader's `assignTask` verb was tried first and REJECTED in the proof
  phase: the obedience lottery refuses exactly when famine strikes (day-10
  fixture villager refused — trust too low), so a leader-order framing
  would be near-inert on the runs that need it. The redirect rewrites the
  assignment dict in upkeep (per day-part, before resolution); the
  wounded-fitness gate and all resolution-time honesty still apply.
- The pantry the villagers can see is Haven's — when the scholar (and the
  village) are off-tile, the redirect holds and counts `blockedAway`,
  never silently.
- Bands: engage <2 fresh days; the landed >4 PRODTHROTTLE covers the other
  end; 2–4 is neutral. No oscillation possible.
- NO SILENT ACTIONS (Steve), but condensed (the killed arm's lesson about
  wall-of-identical-text in collapse): one beat per day names the pantry
  state, the decision, the consequence, AND the water exclusion
  ("Water crews stay on the water").

## PROOF (scripts/test-fameredirect2-20261016.js) — ALL GREEN 31/31

- RED 1 (gate off + famined pantry): wood/stone/water duties unchanged, no
  counters, no beat. Gate off = provably inert.
- RED 3 (gate on + UNFAMINED pantry, 3.0d): no redirect, no counters.
- GREEN 4 (gate on + 1.0d famine): wood → forage (rotation slot 1),
  ledger counted, ONE honest beat naming state/decision/consequence/water
  exclusion; village ledger mirrors ctx counters.
- GREEN 5 (gate on + famine, wood+stone+water+patrol duties): stone →
  garden (rotation advances forage→garden), WATER DUTY UNTOUCHED (the whole
  point of the arm — fixture-proven), patrol untouched, redirects counted ×2.
- GREEN 6: condensed beat — one per day across repeated calls, refires
  next day.
- DET-GATE 7: wrapped policy with gate OFF runs a 15-day trajectory
  byte-identical to the bare base policy on the same seed (leadcourt, seed 44).
- SMOKE 8: 25d live run armed — layer drives (checked=72, no crash,
  endReason=survived).

## PILOT RESULTS (completed 2026-10-16; 16 runs/side, identical seeds, own paired control)

Per-seed: `evidence/2026-10-16/fameredirect2-{control,armed}-perseed/`.
Byte-identical harness verification: leadfeast-s11 re-run on BOTH sides
matches the dead run's JSONs byte-for-byte, so all 19 inherited per-seed
files are reused; the 13 missing runs were filled fresh by this worker.

| metric | control | armed |
|---|---|---|
| starvation deaths (villager) | 0 | 0 |
| thirst deaths (villager) | 0 | 0 |
| sp100vd / tp100vd | 0.0 / 0.0 | 0.0 / 0.0 |
| villager-days | 14462 | 14864 |
| median survival | 121.5d | 126.0d |
| max survival | 180d | 180d |
| national reach | 12/16 | 13/16 |
| table reach | 16/16 | 16/16 |
| wins | 0/16 | 0/16 |
| wave max / arc max | 5 / 4 | 5 / 4 |
| exiled | 0 | 0 |
| fam2 redirects (signals) | 0 (inert ✓) | 94 (wood 94, stone 0) |
| blockedAway (redirect held off-tile) | 0 | 104 |
| hungryDays | 46 | 46 |
| rotFresh kcal | 4,671,484 | 4,674,851 |
| wood stockpile Δ | +9282 | +9189 (diff −93, report-only) |
| dehydration (thirst-adjacent) | 1 | 1 (symmetric) |

Death-cause shares (both sides near-identical): 'combat' ~320,
'villager combat' ~140, 'monster' ~98, expedition ~10, contest ~8,
sickness 2, ambush 4, alien 2, + scattered named-monster kills. Combat is
~3/4 of all deaths. No 'starvation', no 'thirst' in either arm.

Mechanism honesty: the famine signal fired in only 3 of 16 armed runs —
belongfeast-s55 (25 redirects), belongfeast-s66 (45), leadfeast-s33 (24).
In the other 13 the pantry never fell below 2 fresh days (layer checked
hundreds of times per run: `checked` 209–537, no signal — idle, honest).
All 94 redirects moved WOOD duties; stone duties never matched
(stone 0 — REDIRECTABLE saw no stone duties in these seeds).
`blockedAway`=104: the redirect held while the village was off-tile
(expeditions), counted, never silent — per the design call.

Adjudication per header (§14): PRIMARY 0.0 <= 0.0×0.6 is TRUE only
vacuously (see METRIC REVIEW — the regime never starves anyone, so the
bar can't discriminate). No guardrail binds: thirst 0<=0+2, national
13>=12−2, median 126>=121.5−10, exiled 0<=0, no new death modes
(armed death-cause keys ⊆ control's). Control provably inert
(redirects=0 all 16 runs); armed provably live (redirects=94, 3 runs).
**PILOT VERDICT: GO-by-letter, primary vacuous → CONFIRM ordered on 8
fresh seeds with the same header** (guardrail/safety evidence is the
confirm's information value; the famine-forcing substrate is a NEXT-run
metric revision).

## CONFIRM PRE-REGISTRATION

Seeds 12/23/34/45/56/67/78/89 (fresh, not in pilot set) ×
leadfeast/belongfeast × control/armed = 32 runs, same substrate
(FEASTSCALE_R13=1, SEATDRIVE=0, 180d death-aware). Same header, same GO =
armed <= control × 0.6 on sp100vd + all guardrails hold. Expected up
front: primary likely vacuous again (the regime doesn't starve); the
confirm's job is guardrail confidence + famine-run evidence.

## CONFIRM RESULTS (completed 2026-10-16; 8 FRESH seeds
12/23/34/45/56/67/78/89 × leadfeast/belongfeast × control/armed = 32 runs)

Per-seed: `evidence/2026-10-16/fameredirect2-confirm-{control,armed}-perseed/`.

| metric | control | armed |
|---|---|---|
| starvation deaths (villager) | 4 | 4 |
| thirst deaths (villager) | 0 | 0 |
| sp100vd / tp100vd | 0.028 / 0.0 | 0.028 / 0.0 |
| villager-days | 14247 | 14247 |
| median survival | 130.0d | 130.0d |
| max survival | 180d | 180d |
| national reach | 11/16 | 11/16 |
| table reach | 15/16 | 15/16 |
| wins | 0/16 | 0/16 |
| wave max / arc max | 5 / 4 | 5 / 4 |
| exiled | 0 | 0 |
| fam2 redirects (signals) | 0 (inert ✓) | 0 — lever idle all 16 runs |
| blockedAway (off-tile famine holds) | 0 | 139 |
| wood stockpile Δ | +13503 | +13503 (diff 0) |
| hungryDays | 48 | 48 |

The famine signal fired ON-TILE zero times across all 16 confirm seeds
(signals=0, redirects=0 both arms — armed trajectories are byte-identical
to control on every pair). It fired OFF-TILE 139× (blockedAway: the
redirect holds and counts, never redirects labor — the design call).

The 4 starvation deaths per side fell in belongfeast-s67 (2) and
leadfeast-s45 (2) — runs with signals=0, blockedAway=0, redirects=0:
the famine signal never fired there at all (pantryFreshDays stayed ≥2;
the deaths happened outside the lever's sensing envelope — away-party
hunger, not Haven's pantry). Control and armed are identical death for
death.

Adjudication: PRIMARY armed 0.028 <= control×0.6 = 0.017 is FALSE.
4 vs 4 starvation deaths; the bar needed ≤2.4. **PRIMARY MISSES → NO-GO.**
Guardrails all hold: thirst 0<=0+2, national 11>=11−2, median 130>=130−10,
exiled 0<=0, no new death modes. Control inert ✓; armed layer ran
(checked>0 every run, 139 off-tile holds counted honestly).
**CONFIRM VERDICT: KILLED at confirm (primary miss; §14, no re-score).**
Metric doubts are recorded below; the lever is deleted per kill protocol,
instruments + evidence kept.

## METRIC REVIEW (§14)

- The primary as pre-registered passed only vacuously. Zero starvation
  deaths in 32/32 runs on the FEASTSCALE_R13=1 feast-policy substrate:
  the regime never starves anyone (hungryDays 46/46 both sides, food
  deaths 0). The calibration anchor from the killed famredirect pilot
  (control 0.141) does NOT transfer — this substrate feeds better.
  The lever fires (94 redirects) but its promised effect — starvation
  reduction — cannot be observed where starvation doesn't happen.
- The guardrails, however, genuinely discriminate: thirst, national,
  survival, exiled, and death-cause-keys all measure the killed arm's
  failure mode and nearby harms. They all pass with margin.
- PROPOSED REVISION (applies to the NEXT run, never this one): test the
  lever on a famine-forcing substrate (feastscale < 1, a pre-famine
  scenario, or the pre-registered famine window) so sp100vd can
  discriminate. On this substrate the honest claim is only
  "mechanism live, zero harm."
- The relative bar (armed <= control × 0.6) stands as the right shape —
  the failure is the zero-rate regime, not the bar. Do not replace it
  with an absolute bar; absolute A/A bars don't transfer (the killed
  arm's lesson, finding #143).

### Confirm addendum (2026-10-16)

- The confirm's 4 starvation deaths per side all fell OUTSIDE the lever's
  operating envelope: two runs (belongfeast-s67, leadfeast-s45) with
  signals=0, blockedAway=0 — the famine signal never fired there
  (pantryFreshDays ≥2 throughout; the deaths are away-party hunger, not
  Haven's pantry). A further 139 famine signals fired off-tile
  (blockedAway), where the lever holds by design and redirects nothing.
  The lever fired on-tile 0 times in the confirm — armed was byte-identical
  to control — so the primary measured 4 deaths the lever cannot by design
  affect. This does NOT overturn the verdict (§14: a miss is NO-GO, never
  re-scored mid-run) — it is recorded as a metric doubt for the next run.
- The combined pilot+confirm evidence: the lever fires honestly on-tile
  when famine strikes at Haven (pilot: 94 redirects, 3 runs, zero harm,
  zero starvation where it fired); it is provably inert otherwise; it
  caused zero thirst, zero new death modes, zero survival loss across
  64 paired runs. The kill is on the pre-registered bar, not on harm.
- PROPOSED REVISION (next run): if the lever is ever revived, the primary
  must be restricted to on-tile famine regimes (a famine-forcing AT-HAVEN
  substrate), or the signal envelope must widen to away-parties
  (a design call for Steve — the current design deliberately limits the
  lever to what villagers can see: Haven's pantry).

## VILLAGE ASSESSMENT (plain words)

Thirty-two villages, ~29k villager-days between them. Nobody starved.
Nobody died of thirst. The thing that kills villagers in this regime is
fighting: combat ~320, villager combat ~140, monster ~98 per 16-run side
— three quarters of all deaths. Expeditions, ambushes, and contests take
a few more. Sickness took 2. The scale wall here is combat mortality,
not food.

In 3 villages the famine signal fired (pantry below 2 fresh days):
belongfeast-s55, belongfeast-s66, leadfeast-s33. The wood crews put down
the wood run and went foraging/gardening instead — 94 duty-shifts total,
by villager initiative, one honest beat per day naming the pantry state,
the decision, the consequence, and the water exclusion ("Water crews
stay on the water"). Nobody starved in those villages either; thirst
didn't move. The water guard held: thirst 0/0, dehydration 1/1 symmetric.

Who thrived: 12–13 of 16 villages per side reached national, all 16
reached the table, Arc 4 / wave 5 unlocked, 2 villages survived the full
180d. Who died and why: fighters died in fights. The wood crews'
initiative bought no measurable lives because hunger never got lethal —
the funnel is the monsters, not the pantry.

The abandoned duty's cost (the finding's demand): wood stockpiles ended
+9k both sides; the redirect abandoned ~93 wood across the 16 armed runs
— invisible against the pile. Fire/palisade pressure did not
materialize in this regime; named here so the next famine-forcing run
checks it.

### Confirm addendum

The confirm's 32 villages told the same story with one new beat: four
villagers starved — two in belongfeast-s67, two in leadfeast-s45 — and
the lever did nothing about it, because it never saw famine there.
Haven's pantry held ≥2 fresh days the whole time those villages died;
the starving were away from Haven, beyond what the villagers' initiative
can see or reach. The lever's envelope is honest (it only moves labor
for the pantry its villagers can see) and that honesty is also its
limit: the deaths this regime produces are expedition hunger, and no
amount of wood-crew redirection at Haven fixes an away-party running
out of food. 139 off-tile famine holds were counted and did nothing —
by design. Nobody died of thirst anywhere (0/32 runs). The combat wall
stands: ~3/4 of all deaths are fights.

## BLANKS FILLED

- FAMEREDIRECT2 policy (revival of the killed famredirect arm, water
  sacred, villager initiative, env-gated default OFF, zero src/js) —
  KILLED at confirm per the pre-registered bar; layer deleted, zero
  trace in src/ or scripts/policies/.
- Instruments: scripts/measure-fameredirect2-20261016.js,
  scripts/adjudicate-fameredirect2-20261016.py,
  scripts/test-fameredirect2-20261016.js (31/31 proof green; INFO-SKIP
  post-kill — it requires the deleted policy; its green is recorded here).
- This evidence file, with metric review and village assessment.
