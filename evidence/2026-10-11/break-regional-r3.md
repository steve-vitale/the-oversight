# Break-it regional r3 — 2026-10-11

**Verdict: BROKE + FIXED (4 catches).** Merged to local master as `253274c6` ("merged locally, pending ship" — ship loop owns pushes).

Worker ran hostile attacks on regional & hierarchy (`src/js/hierarchy.js`), canon-first (docs/CANON.md, docs/SCALE.md, evidence/2026-10-10/break-regional.md, winrate-iter4-scale.md). Proof: `scripts/test-break-regional-r3-20261011.js` 38/38 × 3 seeds (11, 222, 3333).

## Catches (all fixed)

**1. EXPLOIT — Founding Council 'pool' minted 6,000+ kcal from thin air** (hierarchy.js:1972)
The national beat's 'pool' choice poured 2,000 kcal/fire into `leaguePoolKcal` with nobody's pantry moving — drawable famine food from a granary never filled. Same bug class as run-2's thin-air tribute and the covenant-pour fixes. Fix: Haven's pantry debited at the league rate + each fire's own `pantryKcal` debited; only actuals poured; shortfalls said aloud + trust −2. Proof §A/A2: pool +8,000 exactly (2,000×4); a thin fire pours 500/2,000 with the gap said aloud.

**2. EXPLOIT + HONESTY — concession halved the wrong fire's share; counter terms ignored** (hierarchy.js:2322 `_leaguePoolRate`, :2339 covenantTick)
The concede copy says "X's pool share halves for four weeks" but the engine halved *Haven's* share. Counter-accepted "every fire pours 2,500" poured 2,000 (hardcoded member loop, first-link rate for Haven). The `_leaguePoolWeek` guard keyed on the ticking link's `poolLive`, so a post-founding join ticking first skipped the whole league's pour. Fix: league rate = max bond rate; Haven pours full rate; the conceded *member* pours half; league-wide weekly guard. Proof §B/B2: Haven −2,000 full while conceded member −1,000; counter terms pour 2,500 everywhere.

**3. HONESTY/CANON — Binding 'walk' never refused the scale** (hierarchy.js:1903, :1029, :1050)
docs/SCALE.md: WALK from the Binding refuses the scale *with it*, permanently, "no punishment beyond the relationship's own logic." Engine broke the link as a 'gambit' (−30 opinion, "broke faith") and never set `scaleRefused` — a clean walk could re-court and hit national next season; the beat's own copy ("The door is not shut forever") lied about permanence (the `answerNationalChoice` comment even claimed the walk "refuses the scale"). Fix: new 'walked' parting (−10 opinion, clean copy) + `refuseTheScale()`; staging copy now names the permanence. Proof §C: opinion 50→40, `scaleRefused` true with shape 'belong', `_checkNational` stages nothing after.

**4. CONSISTENCY — renegotiation beat bypassed the trust choke** (hierarchy.js:1326, :1341)
`answerRenegotiation` wrote `link.trust` directly, skipping `_trustGain`'s mourning choke and `lastKeptDay` stamping. Fix: all three answers routed through `_trustGain` (numbers unchanged — young links never mourn). Proof §D: +8 lands, `lastKeptDay` stamped, mourning blocks (0).

## Held (attacked, resisted)
- renegotiate/bidForPrimacy weekly table gate (tribute-to-500-floor is the designed, trust-priced climb)
- succession-crisis farming (deaths are the pacing; mirror beat fires once per speaker death)
- re-link trust farming; sweeten loops (1,500/attempt, one-shot); demand honor proportionality
- guest meals (once/day, face-to-face, full-belly guard, real food from their pantry)
- dead code sweep: all 60 `provides` have real callers (`polityNews`/`worldFeed` fire from `hierarchyDaily`); `pendingRenegotiation` cleared by `breakLink` (no stuck state)
- raid spoils minting (fiction-blessed plunder)
- trade tariff minting (run-2's documented "trade creates value" judgment call — left as-is per canon rule, but it IS the same thin-air shape; flagged for Steve below)

## Regressions (on landed tip)
- test-break-regional-r3-20261011: 38/38 (seed 11; worker ran ×3 seeds: 11, 222, 3333)
- test-hierarchy-break-20261010: 35/35
- test-break-regional-20261010: 20/20
- test-scale-break-r4-20261010: ALL PASS
- test-bal-scale-ladder-20261010: 54/54 (3 seeds)
- validate-ontology: 63/63 (worker)
- national-shapes: 3 wave-5-gate failures — PRE-EXISTING, confirmed identical on pristine HEAD checkout (worker verified), not caused by this run.

## Unresolved / for Steve
1. **Trade tariff still mints** (1,000 kcal/route/week from nothing; 400 upkeep is real). Prior round deliberately left it as "trade creates value" fiction. Inconsistent with the thin-air fixes — Steve's call whether it stays.
2. **BELONG 'walk' now permanently refuses the scale** — canon (SCALE.md), but harsh; worth a playtest eye when the Binding is next reached. No [needs-eyes] flagged (no feel/UI change this run).

## Landing
- Registered tree `break-regional-r3` (registry, cap 1/6), merged `253274c6` to master via fetch + `git merge --ff-only` (exit 0, no sibling movement mid-run), tests re-verified on the tip, tree released (`merged`) and removed, branch deleted, reaper sweep clean, main tree `git status --short` empty.
- Did NOT bump, push, or verify live. Ship loop owns that.
