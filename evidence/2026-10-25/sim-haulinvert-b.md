# sim-haulinvert-b — the haulcount predicate, inverted

Run: oversight-flesh-out-loop-b-20261025T1752Z, arm sim-haulinvert-b,
axis food-economy. Worktree: `~/workspace/worktrees/sim-haulinvert-b`,
branch sim-haulinvert-b.

Status: PRE-REGISTERED — the GO thresholds H1–H6 below were fixed
before any sweep in this run. This arm proves the INSTRUMENT ONLY.
It does NOT re-judge leg2decide, rotdecide-govern, rotragged,
rotcompanion, or any rot verdict, and it does NOT judge any rot
verdict on the pilot seeds (the pilot is the same 8 fresh seeds as
sim-haulcount-b, re-run under the inverted predicate).

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; blind penalties teach once).
- The exclusion list below is measured from the code, not guessed:
  EVERY stockPantry/depositPantryPieces call site was read
  (2026-10-25, this run), and each name is justified from its
  call site in the derivation table. The counting definitions of
  sim-haulcount-b (evidence/2026-10-25/sim-haulcount-b.md) are
  adopted unchanged for the current-predicate side of this
  comparison.

## Background (quoted from the prior arm, NOT re-judged here)

sim-haulcount-b built the haul/preserve action-count recorder and
proved it on the pilot (seeds 9400–9407 x pd0/pd1, leadfeast/dg1,
100d death-aware). Its "metric review" proposed the next revision:
invert the rule — count every pantry deposit as a haul EXCEPT the
known non-haul names — because "a census rots: any future
stockPantry caller with a new haul name will silently miss the
predicate until a trace shows it", while "the non-haul set is
smaller and more stable than the haul set". This arm is that
revision, judged ONLY on the comparison below.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

- Instrument: scripts/sweep-haulinvert-b.js (new, derived verbatim
  from scripts/sweep-haulcount-b.js — the prior instrument — plus
  inverted-predicate counting; declared deltas in the sweep header)
  + scripts/compare-haulinvert-b.js (new, field-by-field comparison
  of the new corpus against the prior corpus) + the unchanged
  game.js HAULCOUNT TAP (cook-duty smoke racks; already in this
  branch from sim-haulcount-b — this arm adds NO game-code lines).
- Comparison: the IDENTICAL pilot — seeds 9400–9407 x {pd0, pd1} x
  leadfeast/dg1, 100d death-aware horizons (dead villages stop,
  +10d tail max), FEASTSCALE_R13=1, SEATDRIVE=0 — re-run under the
  inverted predicate, compared field-by-field against
  evidence/2026-10-25/haulcount-b-corpus/ (anchor 7a6d873a).
  Preserve columns are controls: scholar preserve columns are
  policy-dependent (0 under leadfeast per haulcount-b — the policy
  never preserves), so villager columns are always read alongside.
- Balanced panel (§15): inapplicable — instrument demonstration,
  not a before/after lever landing; no verdict is re-judged, so
  there is no before/after comparison to panel.

### The inversion rule

invHaulActions/invHaulKcal = every pantry deposit (rounded kcal >
0) in the instrument's deposit universe — stockPantry calls +
depositPantryPieces calls — EXCEPT:

- stockPantry deposits whose name (defaulting to 'Foraged food'
  when falsy, mirroring stockPantry itself) is in the exclusion
  list below (exact names, plus two prefixes);
- depositPantryPieces deposits into a NON-home village (transfers
  to another village's fire — exile amends, tribute grain — counted
  separately as foreign, never as hauls);
- depositPantryPieces deposits into the home village whose src name
  starts with 'Tribute ' (tribute grain — counted separately as
  home-excluded, never as hauls).

Every other deposit counts — including haul names the census
predicate missed or has not met yet (custom haulLabels, future
callers). Disjoint buckets, so the arithmetic closes on every
file: pantryDepositActions = invHaulActions +
invStockExcludedActions + invPiecesHomeExcludedActions +
invPiecesForeignActions (same for kcal).

### Exclusion list — derived from EVERY call site (read 2026-10-25)

Stock names EXCLUDED (exact match):

- 'Weregild' — betrayal.js justice payment: the accused's own
  stores move to the pantry (a payment/transfer, not food brought
  from the world). Two call sites, same name.
- "Hoarder's interest" — buildarounds.js overnight interest: minted
  kcal on stored bins, not food anyone carried in.
- 'System-replicated stew', 'System-replicated (enthusiastic)
  meal' — game.js System gifts (minted meals, not hauls).
- 'System aid cache', 'SYNTHETIC SUSTENANCE BRICKS' — safetynets.js
  quest-reward supply drops (a variable name taking exactly these
  two values; System gifts from the sky, not hauls).
- 'Trial feast' — game.js System trial feast (gift, not haul).
- 'Refunded trade goods' — game.js trade refund (food returning to
  the bins, a re-deposit, not a haul).
- 'Meal leftovers' — game.js CAPDRAW2 excess (drawn food going back
  in the bins, a re-deposit, not a haul).
- 'Restitution' — justice.js payment (internal transfer, not a haul).
- 'Ration returned' — safetynets.js rationing (the player's own meal
  going back in the bins, a re-deposit, not a haul).

Stock prefixes EXCLUDED (prefix match):

- 'Aid from ' — safetynets.js resolveAidInbound food deliveries:
  another village's stores arriving (a transfer, not a haul).
- 'Remedy stores from ' — safetynets.js aid medicine leftovers:
  another village's stores arriving (a transfer, not a haul).

Stock names COUNTED as hauls (every other name — the inversion):

- The whole census predicate (Foraged food, Game meat, Garden
  harvest, Fish catch, Expedition haul, Aid crew haul, Snared meat,
  Pit meat (X), Hauled meat, Emergency hunt meat): aid-crew haul
  stays a haul — aid-hands crews WORK three days in the village
  ("three days' work in your bins"), producing food by work, not
  transferring another village's stores.
- Names the census missed, now caught by construction:
  'Expedition meat' (villager-agency.js expeditionReturn: the
  killer's butchered known-safe meat coming home — a real haul the
  census never listed); 'Buried cache' (betrayal.js inviteReward:
  a villager digs up their own pre-Scattering bundle and puts it in
  the pantry — a find brought in, consistent with home-pantry
  donations counting as hauls); 'Genesis fruit' (game.js haven
  genesis crop yield to the pantry — a harvest, like Garden
  harvest); any custom haulLabel (villager-objectives.js haul
  return via ho.haulName, default 'Hauled meat', custom label from
  villager-mapmem.js haulLabel — the census's stated residual gap,
  closed by the inversion).

Pieces names: pieces src names are ITEM names (plant/food names),
not deposit-kind names, so no item-name exclusion applies. The
only pieces exclusions are structural: non-home village (foreign)
and 'Tribute ' prefix (home-excluded). Home-pantry donations
(game.js donateToPantry) and homecomings (game.js returnToVillage)
both count as hauls, exactly as the census predicate counted them.

Scope note, stated not hidden: the inversion applies within the
instrument's deposit universe (stockPantry + depositPantryPieces).
Direct pantry pushes that bypass both wrappers (e.g. 0-kcal
unknown-flesh items pushed straight into vv.pantry) are outside
both predicates equally and carry no kcal, so they cannot move
either haul total.

### GO thresholds (judge this run ONLY against these; no re-scoring)

- H1 (superset): on EVERY one of the 16 new per-seed files,
  invHaulActions >= haulActions AND invHaulKcal >= haulKcal. The
  inversion counts every census haul by construction (no census
  name is excluded), so any violation is an implementation bug.
- H2 (every disagreement named): every newly-counted haul name —
  inv minus current, by name from the traces — is explained by a
  trace, and every excluded name is justified by a call site in
  the derivation table above. No unexplained newly-counted name,
  no unexplained excluded name.
- H3 (traces recompute exactly): on ALL traced files, recomputing
  both predicates plus the excluded and foreign buckets from the
  stored events reproduces the per-seed totals exactly (requires
  stored events complete, i.e. eventsStored < cap).
- H4 (zero behavior change, reproduction): every non-anchor field
  of every new per-seed file equals the same seed/side file in the
  prior corpus (src/ is unchanged since the prior pilot tip, so the
  deterministic harness must reproduce the prior files exactly
  apart from anchorCommit and the new inv fields). Preserve columns
  are read as controls alongside the villager columns.
- H5 (zero game-code change): the diff touches NO src/js file at
  all — sweep, comparison script, test, corpus, and evidence only.
  If a game-code touch proves necessary, the arm is NO-GO until the
  coordinator rules — nothing smuggled in.
- H6 (determinism leg): one seed re-run byte-compares — a trace
  re-run's per-seed file is byte-identical to the pilot's.

## RESULTS (filled after the sweep — see below)

## Metric review (filled after the results, §14)

## Diff review

## Proof

## Scope compliance
