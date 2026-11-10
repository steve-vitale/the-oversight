# sim-meleefirst-b — prereg: melee-first / ranged-fallback slot rule (SPEAR-IN-RANGED-SLOT fallback)

- Arm: sim-meleefirst-b (Loop B, BUILD arm, run fleshout-loop-b-20261110T0626Z)
- Branch: sim-meleefirst-b; base anchor `a5d615880` (worktree `~/workspace/worktrees/sim-meleefirst-b`)
- Lever from: sim-findings.md SPEAR-IN-RANGED-SLOT update + evidence/2026-11-10/sim-spearvolley-b.md
  ("Metric review" fallback, named not built) and its prereg's metric-review sentence.

## Grounding (pre-existing evidence, no new computation yet)

- The one-line "spears are melee" fix was built, proven (volley 30/30 by
  construction) and measured net-negative in the wild (pooled wave-4 kills
  46 → 34, −26%) and REVERTED (sim-spearvolley-b.md). Mechanism (E4):
  machete+spear fighters lost ~38% damage when the spear left the ranged
  slot — `wb` 33 → 18 — because the spear used to contribute half its
  bonus through the ranged slot.
- The fallback named in that file's metric review: a spear takes the MELEE
  slot when the fighter carries a real ranged weapon (bow/sling/crossbow —
  volley restored, wb 26 for bow+spear), and the RANGED slot otherwise
  (the old fold-in preserved: machete+spear-no-bow keeps wb 33, spear-only
  keeps wb 15 and the contact finish's kind-'spear' path).
- Data source of truth: every spear in `src/data/items.json` carries
  `weapon.type: 'melee'` with `range: 2` (hunting_spear 30,
  fire_hardened_spear 15, shard_spear 25, starfall_lance 80,
  godslayer_spear 85 — the last already carries explicit `slot: 'melee'`).
  Real ranged weapons carry `weapon.type: 'ranged'` (crude_bow 18, bow 22,
  crossbow 28, sling 8, starfall_bow 50, apex_bow 95 — the last explicit
  `slot: 'ranged'`).
- Canon note: no canon doc covers equipment slots (docs/CANON.md manifest
  lists none for equipment/gear). Stated, not invented. The data's
  `weapon.type` field is the source of truth used here.

## The fix (to be implemented AFTER this prereg commits)

`src/js/equipment.js` ONLY — the slot rule becomes fighter-contextual,
in the one place that decides slots from inventory:

1. New helpers: `isFallbackSpear(def)` — a melee-type weapon with
   `range > 1` (exactly the 5 spears/lance in current data); and
   `carriesRealRanged(ids, itemDefs)` — the fighter's inventory holds a
   weapon whose `weapon.type` is `'ranged'`.
2. `equipScore(itemId, slot, personality, itemDefs, opts)`: optional 5th
   param. When `opts.meleeFirstSpears` is true, a fallback spear scores
   as MELEE (not ranged); otherwise classification is exactly as today.
   No other weapon's scoring changes; the signature stays backward
   compatible (all existing callers pass 4 args).
3. `autoEquip(v, itemDefs)`: computes `hasRealRanged` from the fighter's
   own inventory once and passes `{ meleeFirstSpears: hasRealRanged }`
   into the weapon-slot scoring. Effect: bow+spear → melee spear +
   ranged bow (volley restored); machete+spear+bow → melee machete +
   ranged bow (spear unequipped, wb 33 → 26, volley gained — the ONLY
   shape that loses fold-in damage); machete+spear-no-bow → melee
   machete + ranged spear (wb 33 preserved); spear-only → ranged spear
   (wb 15, contact-finish kind-'spear' path preserved).
4. `migrateEquipment(person)`: same rule for legacy `eq.weapon` saves —
   a migrating fallback spear goes to melee when the person carries a
   real ranged weapon (in `person.items`), else ranged as today. The
   inline range/name test is replaced by the shared helpers.
5. `isRangedWeapon(def)` and `slotForItem(def)` are UNCHANGED
   (context-free): UI, villager-build, contests, and the competent
   policy's slot reads keep today's behavior. Known gap, recorded not
   fixed: a player MANUALLY equipping a spear through the UI still gets
   the ranged slot (game.js:13510 `slotForItem` path); auto-equip
   (what sims, gear-up, and field fights use) is the fixed path. The
   manual-equip path is a separate arm if Steve wants it.
6. Nothing else: no volley formula change, no `wb` fold-in change
   (`(melee+ranged)/2` stays), no `mBreak` change, no rounds-cap change,
   no contact-finish change, no gate / price / deed / readyDemand /
   win-price change.

## Seed-band freshness (skill: local_seed_band_freshness)

- Pilot band: **99561–99568**. Search scope: all `evidence/*/sim-*-prereg.md`
  (698 files) + all `evidence/**/*.md` + evidence filenames. Result: ZERO
  hits for any of 99561–99568 in any scope. FRESH.
- Confirm band (only if pilot GO): **99581–99588**. Same scope: zero hits
  in preregs and filenames; the single `*.md` hit for `9958[1-8]` is
  evidence/2026-10-28/sim-scale-onramp-round-1528.md:197, which contains
  the git SHA fragment `d0199585e` — a commit hash, not a seed reservation.
  Recorded here so the next worker does not re-flag it. FRESH.
- Known used, NOT reused: 99641–99648 and 99661–99668 (spearvolley),
  99591–99598 (volleysoft), 99651–99658 (2026-11-05).
- Note: the first full-tree `grep -r evidence/` probe was killed mid-run
  (recursive grep over the JSON corpora is minutes-slow); the freshness
  verdict rests on the complete `*.md` + prereg + filename searches
  above, which are the scopes the skill names (preregs, forbidden /
  contaminated lists, screens, extension bands).

## Primary metric (binds this run, §14)

**Constructed (E1 + E4, spearvolley recipes).** A fighter meets a wave-4
beast at FULL HP through the real `Game.fieldFight` on seeded streams
(same harness as scripts/test-vetfinish-b.js, seed 87104 family, 30
streams per beast, 1 from-start ally):

- E1 (volley restored): crude bow + 4 arrows + hunting spear. Beasts:
  herald (700 HP) and audit (1200 HP). GO: volley fires
  (`rec.volley` non-null with `shots > 0`) on ≥ 27/30 streams per beast,
  AND median volley damage > 0 per beast, AND slots read melee spear /
  ranged bow on ≥ 27/30 per beast.
- E4 (damage preserved): machete + hunting spear, NO bow, same beasts.
  GO: median total damage ≥ 0.90 × the spearvolley E4 baseline per beast
  (Herald 232.5, Audit 157.5 — i.e. ≥ 209.3 / ≥ 141.8). The fallback
  predicts NO loss on this shape (same code path as baseline), so the
  0.90 bar is slack for stream noise, not for a real loss.
- E5 (measurement only, no threshold): machete + hunting spear + crude
  bow + 4 arrows — the one shape that trades fold-in for volley. Report
  median total damage and volley rate per beast; it is the confined-loss
  shape and its numbers explain the wild leg either way.
- Before baseline: the same proof test run against the unfixed code
  (git stash) before judging the fixed code. Expected before: E1 volley
  0/30 per beast (spearvolley re-measured 0/30), E4 medians ≈ 232.5 /
  157.5 (the spearvolley E4 numbers, re-measured).

GO (constructed): E1 passes AND E4 passes. Either fails → NO-GO.

## Wild leg (guard + wall numbers, PILOT, 8 seeds before/after)

- Band: **99561–99568** (fresh, see above). Policy: competent, verbatim
  (scripts/policies/competent.js). Horizon: 150d, death-aware.
- Legs: before-leg on the unfixed code (this branch base) via the FS
  driver (scripts/finishersize-driver-20261106.js, OUTDIR
  evidence/2026-11-10/perseed-meleefirst-b, RUN meleefirst-before);
  after-leg (RUN meleefirst-after) on the fixed code, identical seeds.
  Analyzer: scripts/spearvolley-analyze-20261110.js (reused unchanged).
- Reported per leg (wave ≥ 4 field rows, analyzer population):
  volley-carrying rows and volley rate (wave-4+ AND all-waves — the
  all-waves rate is the powered comparison per the spearvolley metric
  review); field wave-4 kills; wave-4 kills all channels; below-break
  meetings / kills; field-fighter deaths; scholar deaths; starvation
  deaths; veterans banked (peak + end); wave-4/5 unlocks; wave-5 kills;
  standing; rank; median survival.
- **Wild guard (binds the GO, from the spearvolley metric review):**
  wave-4 kills, all channels, armed ≥ before-leg count on the pilot
  band. A fall below the before-leg count is a NO-GO even if the
  constructed primary passes — the guard this run's predecessor lacked
  as a binding number.
- **Volley restoration guard:** volley-carrying rows (wave-4+) armed ≥
  before-leg count, and all-waves volley rate armed ≥ before-leg rate.
  (The spearvolley wild volley rate was composition-dominated at 8
  seeds; the all-waves rate is the powered comparison.)
- Cost bar (binds the GO): starvation deaths (teleDeaths cause exactly
  `'starvation'`) after ≤ before + 2, counted BOTH (a) across all
  teleDeaths and (b) among scholar deaths; AND median survival after
  ≥ 0.8 × before median. A cost-bar breach is a NO-GO even if the
  primary passes.
- Confirm leg: the second band (99581–99588, fresh, see above)
  before/after, 8 seeds, runs ONLY on pilot GO (constructed GO + wild
  guard + cost bar all pass). A pilot NO-GO ends the run: revert the
  game-code change and land the measurement only.

## No-regression proof (binds the landing)

- scripts/test-meleefirst-b.js (new): unit leg — `autoEquip` on
  bow+spear (melee spear, ranged bow), machete+spear (melee machete,
  ranged spear), spear-only (ranged spear), machete+spear+bow (melee
  machete, ranged bow, spear unequipped), bow-only, sling+spear (melee
  spear, ranged sling), crossbow+spear; all 25 weapons classify per
  their `weapon.type` under both contexts (with/without a real ranged
  weapon carried); explicit-slot overrides respected
  (godslayer_spear → melee, apex_bow → ranged); armor slots unaffected;
  `migrateEquipment` leg (spear migrates to melee with a bow in items,
  to ranged without). Engine leg — E1/E4/E5 above, plus spear-only and
  bow-only controls.
- scripts/test-spearxbow-20261031.js: NOT updated in this arm. Its
  corpus is anchored on the 2026-10-31 src commit and already runs
  25/27 on current master for a pre-existing stale-anchor reason
  (spearvolley finding SPEARXBOW-CORPUS-STALE, still open). This arm
  changes the slot rule only when a real ranged weapon is ALSO carried;
  the spearxbow fixture's SPEAR tier (spear-only shapes) is unaffected
  by the fallback by construction — the proof test above pins that. If
  test-spearxbow moves vs its current 25/27 on this branch, that is a
  same-run investigation item, not a silent pass.
- `node scripts/check.js --quick` after the change; the green list stays
  green. test-gearup-spear-slot-20261012.js (green-listed) is expected
  to pass unchanged (fire-hardened spear routes to melee via slotForItem
  — unchanged — and equippedWeapon reads melee first, bonus still 15).

## Balanced panel (§15) and telemetry

- scripts/balance-panel.js runs its own full panel and takes no corpus
  input — it cannot compare a single-leg verification on identical seeds
  (same precedent as grind-a, finishersize-a, adopt-a, vetfinish-b,
  spearvolley-b). No compare .md is fabricated; the pre-registered
  comparison is the identical-seed FS corpus + the constructed rates.
- Telemetry deviation check (scripts/telemetry-check.js, baseline
  .../telemetry-baselines/scale-wall.json, metrics national,table,wins,
  exiled) is attempted on the per-seed corpus; the recorder-corpus
  refusal recorded by grind-a/finishersize-a/vetfinish-b/spearvolley-b
  is the expected outcome and is recorded as the result, not worked
  around.

## Guards (all hold)

- No readyDemand, win-price, deed-gate, or gate change of any kind.
- No rounds-cap change (MAX_ROUNDS = 15 untouched), no armor-ignoring
  hits, no mBreak change, no volley formula change, no wb fold-in change.
- Wall numbers reported every leg (national / table / wins, wave 4–5
  unlocks, median survival).

## Metric review (to fill in the evidence)

- (to fill: E1 verdict, E4 verdict, E5 numbers, wild-guard verdict,
  volley-restoration verdict, cost-bar verdict, confirm-leg decision)
- If the primary passes but the wild leg is flat: the fix is
  engine-proven and field-unmeasurable at this band scale — the finding
  closes as fixed-by-construction, not as a lever failure.
- If the net wild effect is negative: the fallback itself is the wrong
  shape; the metric review names the next candidate (e.g. spear
  contributes to BOTH slots, or a dedicated spear-throw opening) — not
  built here.
