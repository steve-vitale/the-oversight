# Prereg — sim-expignite-b (Loop B, run fleshout-loop-b-20261117T0030Z)

DIAG arm. Findings backlog #2463: "TWO SEEDS NEVER ATTEMPT A LAUNCH AT ALL".
Question: on the medicduty band (102801–102808), seeds 102803 and 102806 recorded
0 `startExpedition` calls in 150 days — no medic-duty involvement, no attempt to
block. The villages look otherwise alive (102803 survived to 150d, wave 5,
standing 275). WHY? Three candidate mechanisms, indistinguishable to the
medicduty recorder (it only sees `startExpedition` calls):
no-EXPEDITION-commit vs commit-but-no-depart vs agency-chance-roll-never-firing.

## Code-read ignition chain (read before building; anchors by function name)

`vbrainOwnsDawn()` (`villager-brain.js`) returns `true` unconditionally. In
`agencyTick` (`villager-agency.js`) the vbrain branch runs first and always
`continue`s, so the legacy chance roll `if (R() < chance)
this.startExpedition(...)` is UNREACHABLE while the brain owns dawn. The
random-agency origin can never fire on master as-is; the corpus check below
must confirm 0 random-agency attempts (medicduty: 0/208, haventarget: 0/198).

The only ignition path when vbrain owns dawn:

1. **Dawn score** — `objPick` → `vbrainScorePick` (`villager-brain.js`).
   Core lottery picks a core kind; extras override in order: win-plan
   holds/launches (`party_launch` EXPEDITION w 5.0, needs a plan in stage
   party/hunt/standing/table AND a companion — else `party_wait` hold) always
   win; then ASSIGN; then DUTY top-score (w >= core pick w); then SOFT
   EXPEDITION (`expeditionCand`: wanderer/explorer only, w 0.55/0.28,
   potential x1.6) ONLY when the core pick is indoor (HAVEN_CHORE/REST/EAT/
   SEEK) AND a deterministic per-villager-per-day hash roll
   (`dawnHashRoll(vid, day, 'exped')`) beats w/2 (~0.14 wanderer, ~0.275
   explorer, ~0.44 explorer+potential). The commit is written by
   `writeCommit`; the log entry carries pick/corePick/override/winPlanAction.
2. **Dawn re-pick is conditional** (`villager-objectives.js` dawn pass):
   a villager re-picks only when their objective is idle/done/returning.
   A mid-errand villager keeps yesterday's objective AND yesterday's commit —
   and `vbrainExecuteDepart` requires commit day === today, so a stale
   EXPEDITION commit never departs.
3. **Agency tick gates** (`villager-agency.js` `agencyTick`, runs after
   `npcNodeTravel` each day-part, 4 ticks/day) before the depart call:
   dead / engaged / already out / profile gate (bypassed for today's
   `party_launch` commit) / node not at Haven / night / indoor objective
   (bypassed for today's EXPEDITION commit) / `npcTrigger`
   `expedition_launch` (village danger belief >= 4, `npc-triggers.js`).
   Then `winPlanHavenTick`, then `vbrainExecuteDepart` when vbrain owns dawn.
4. **Depart** — `vbrainExecuteDepart`: commit day must be today;
   `gear_hold`/`veteran_guard`/`party_wait` return `hold`; kind !=
   EXPEDITION returns `normal`; `party_launch` calls directed
   `startExpedition` for inviter + companion(s); otherwise plain
   `startExpedition`. A blocked plain launch still returns `launch`
   (the startExpedition wrap records landed=false).
5. **Launch gates** — `startExpedition`: medic-duty (undirected only),
   heal check (hurt <70 without medicine/healer), sick, range-0
   (`villager-agency.js` / `game.js` `villagerHealCheck`).

## Taxonomy (frozen — the analyzer classifies every villager-day at home)

Denominator: villager-days where the villager is alive, at Haven, not away,
not already out on an expedition. Each such day lands in exactly one class:

- **A — NO-DAWN-SCORE**: no `vbrainScorePick` call that day.
  A-mid-errand (objective still live at dawn, no re-pick), A-away, A-other.
- **B — NO-EXPEDITION-CANDIDATE**: scored, no EXPEDITION candidate offered.
  B-plan-no-companion (plan stage party/hunt/standing/table, no companion
  → `party_wait`), B-profile (no plan, not wanderer/explorer),
  B-trigger (danger belief >= 4), B-sick, B-range (maxDist < 1),
  B-night (scored at night — expeditionCand refuses), B-noplan (no plan
  and profile gate is the only bar — same as B-profile; kept separate
  only if the rows show it).
- **C — CANDIDATE-LOST**: EXPEDITION candidate offered, not picked.
  C-core-outdoor (soft expedition: core pick not indoor, hash never
  consulted), C-hash (indoor core, hash roll failed), C-duty (DUTY
  top-score overrode), C-assign (ASSIGN overrode). A `party_launch`
  candidate cannot lose (it always overrides) — if one ever does, that
  is a C-winplan row and a code-read failure to explain, not a silent bin.
- **D — COMMIT-NO-DEPART**: EXPEDITION commit held at some tick, but
  `vbrainExecuteDepart` never called that day. Subtype = first failing
  agency-tick gate, in code order: D-dead, D-engaged, D-already-out,
  D-profile, D-node, D-night, D-indoor, D-trigger.
- **E — DEPART-BLOCKED**: depart called, `startExpedition` blocked
  (medic-duty / hurt-no-care / sick / range-0, medicduty derivation).
- **F — LAUNCHED**: depart called, expedition landed.

Unknown bucket: any villager-day that fits none of the above, any launch
whose origin/block reason fails re-derivation, any depart call whose
return contradicts the post-call expedition record. Unknown must be 0.

## Method

- Band **103001–103008** (8 seeds), competent verbatim (sha256
  `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c` —
  verified by `sha256sum scripts/policies/competent.js` on this tree,
  2026-11-17), horizon **150d death-aware** (dead villages stop; +10d tail max).
- Two legs, zero src/js change: OFF = master as-is, recorder off
  (trajectory reference); ON = master as-is + recorder wraps only.
  Instrument: `scripts/expignite-driver-20261116.js` (new, extends the
  medicduty recorder: same launch/return/death rows, PLUS score rows
  from a `vbrainScorePick` wrap, depart rows from a
  `vbrainExecuteDepart` wrap, per-tick gate snapshots for EXPEDITION
  commit holders from an `agencyTick` wrap, and a part-0 daily census).
  Analyzer: `scripts/analyze-expignite-b.js` (re-derives origin,
  block reason, candidate-offered, first-failing-gate, and the per-day
  class from the raw rows; D3).
- No balanced panel: DIAG, no game change.
- Proof: `scripts/test-expignite-b.js` — static checks + D1
  determinism + D2 neutrality + D3 re-derivation (synthetic + live).

## Seed-band freshness (per the seed-band freshness skill)

- Searched: every `evidence/*/sim-*-prereg.md` for the exact 6-digit
  seeds 103001–103008 (individual alternation, so a range spelling
  would also match); every `evidence/**/*.md` for the same seeds;
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/*.md`
  for the same seeds. No forbidden/contaminated band list names them
  (no such list file exists in the goal hidden_files; the only
  "band"-matching file there is a herald-band pilot prereg).
- Result: **0 hits. Band 103001–103008 is fresh.**
- Near-misses recorded so the next worker does not repeat them:
  `10301–10308` (5-digit, sim-sickstale-b prereg 2026-10-30) and the
  raidday100 checked-list round number `10300` are numerically different
  bands, not this one.

## Canon

- Read `docs/CANON.md` first, then `docs/PARTY.md` (party dynamics only).
- **CANON GAP (recorded, not invented): no canon doc covers expedition
  candidate picking** — who the dawn brain picks as a launch candidate,
  the soft-expedition hash gate, or the commit/depart split. The chain
  above is grounded only in `src/js/villager-brain.js`,
  `src/js/villager-agency.js`, `src/js/villager-objectives.js`, and
  `src/js/npc-triggers.js` as read 2026-11-17.

## GO bars (bind the run — a miss is NO-GO, never re-scored)

1. All 8 seeds produce valid corpora, **0 instrument errors**, **unknown 0**
   (per-day classes + launch re-derivations + depart returns).
2. Proof green: `scripts/test-expignite-b.js` — static checks + D1
   determinism + D2 neutrality + D3 re-derivation.
3. The zero-attempt mechanism is classified on the band: if >= 2
   zero-attempt seeds occur, EACH is classified (dominant class +
   per-day class counts); if 0 occur, the ignition path is classified
   on all attempted seeds with commit/attempt rows. Either way the
   question is answered, not unknown.
4. Wall numbers on both legs (national by standing AND by scaleRank,
   table, wins, wave 4/5 unlocked, median survival, deaths).

## Metric review notes (for the evidence file, not a re-score)

- The medicduty instrument could not see commits; this arm's per-day
  class is the unit that answers #2463. If the zero-attempt seeds are
  dominated by B/C (never committed), the fix space is the dawn scorer
  (candidate offer / hash gate / core-pick mix); if by D, the fix space
  is the agency-tick gates or the stale-commit rule; if by E, it is
  the launch gates (already measured: 10 blocks on medicduty).
- The soft-expedition hash roll is one Bernoulli per villager-day, so
  a village with 0 wanderers/explorers and 0 plan holders can NEVER
  launch by the soft path — the census must report the per-seed
  wanderer/explorer count, or a zero-attempt seed will look mysterious
  when it is structural.
