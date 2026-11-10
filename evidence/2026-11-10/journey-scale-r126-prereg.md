# journey-scale r126 — PRE-REGISTER (lane A, leg 3 SCALE, alien-fallen fix)

**Run id:** laneA-20261110T0145CST (scheduled 01:45 CST 2026-11-10).
**Run:** `2026-11-10T07:48:36Z-playtest-loop-a` · worktree `journey-scale`.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `a6ed956f5` (fresh worktree; includes the sim-roundcap-b
harness hook + all r125 tooling).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands.**
**DELIVER OVER MEASURE (2026-11-01):** this run BUILDS the fix r125's
census found — it does not re-prove a proven constraint and does NOT
re-run the ladder band as a measurement. The band re-run below is the
fix's before/after proof on identical seeds, not a new measurement.

## Standing context (read before scoring)

- **r125 (2026-11-10, band 97901–97904): survival attribution,
  INCONCLUSIVE.** Arm A (WITH wideduty, r123) 488 lived days, 0/4 alive;
  Arm B (WITHOUT wideduty) 525 days, 1/4 alive — the IMPLICATED bar
  (≥548 AND ≥1 alive) not met, the EXONERATED bar not met. Both arms die
  the same way: combat-led collapse (~90% field-fight deaths). Cause
  stays open; the next attribution step belongs to the combat side.
- **The gap this run fixes (r125 Q2, engine):** the alien kill path
  (`alienPlayers.js` `apPlaygroundKill`, ~2435) calls registerDeath +
  removeVillager but never pushes `v.fallen` — an alien-killed villager
  is in telemetry and NOT in the memorial roll (pilot: Milton, d48;
  Arm B tele-only rows: 97901 ×1, 97904 ×1). Every other death path
  pushes both. Precedent for the fix shape: journey-social r125's
  ambush-murder push (`betrayal.js:1061`, same "registerDeath makes the
  corpse, fallen is pushed per path" contract).
- **Canon:** docs/ALIEN-PLAYERS.md — "The death record says 'a stranger',
  never 'an alien.'" `fallen-memorial.js` renders the fallen cause
  VERBATIM in the Codex memorial, so the fallen row's cause MUST be the
  village's wording: `'a stranger'`. The census already buckets
  `'a stranger'` as alien (`deathcensus-analyze-20261110.js`
  ALIEN_CAUSES) — no analyzer change needed.
- **Second-order surface of the fix (read, not guessed):** `v.fallen`
  is read by three gates — contests.js:433 (recent death ≤3d → contest
  scheduling chance +0.10), safetynets.js:256 (recent death feeds the
  struggling computation → relief offers), safetynets.js:917/1259
  (rally blood-price: a death during a 3-day rally costs unity −1).
  An alien murder now counts in those gates — tiny (alien kills max 1
  per 5 days, only while aliens are active, late game) and fictionally
  coherent (a murder SHOULD draw the show's eye and count as the
  village struggling). Q2 guards the survival effect.
- **Carried, NOT this run's to build:** Baraka unvoiced raise ×6 in 7
  days; Stella's trap-line invitation swallowed by the raise-answer
  template (both reproduced exactly in r125 Q4); guest deaths in the
  village's fallen (Bing — needs its own prereg: is a guest who dies
  fighting beside the village wrongly memorialized, or rightly?);
  the survival-collapse cause (combat side, still open).
- **r125 closeout discrepancy (recovered by this run):** r125's note
  claims "Rotation 3→0 written at closeout. Lock deleted at closeout."
  but the rotation file read **3** and the lock existed when this run
  started — the closeout died after merging (3 commits on master,
  verified) and before the rotation write / lock delete / tree release.
  This run performed the stale-lock recovery (lock run_id
  `2026-11-10T04:43:32Z-playtest-loop-a`, heartbeat 76 min stale, lock
  3h old; work merged at `215c37e65`, tree clean, no writes <15 min),
  released the orphaned `journey-scale` tree as done-merged, and plays
  scale per the rotation file as read. The rotation write is this run's
  own closeout step.

## The fix (one task, one commit)

`src/js/alienPlayers.js` `apPlaygroundKill`: after registerDeath, push
the fallen row in its own inner try/catch (mirrors betrayal.js:1061):
`{ villagerId: victim, day: this.state.scholar.day,
cause: 'a stranger', name: this.fallenName ? this.fallenName(victim) : vname }`.
Inner catch reports via `console.warn` (module convention; no empty
catch in new code). Nothing else changes: the beam path already records
the fallen via `tbVillagerFalls` (cause 'combat'); the guest-death
question is out of scope.

**Proof (before/after, same test):**
`scripts/test-alien-fallen-20261110.js` — drives apPlaygroundKill on a
live harness game (seed 97904) and asserts: kill returns true, victim
leaves the roster dead-marked, telemetry cause 'alien', exactly one
fallen row with cause 'a stranger' / kill day / a name, fallen grew by
exactly one, memorialRoll() shows it once with cause 'a stranger',
second kill same day refused by the 5-day cooldown with no second row.
BEFORE the fix: 7 passed, 4 failed (no fallen row, memorial empty).
AFTER the fix: 15 passed, 0 failed.

## The band (fix proof on identical seeds)

- **Driver:** `scripts/journey-scale-r126-20261110.js` (r125 driver cloned,
  labels/EVIDIR only) + r125 instruments (ladder, traderoad,
  deathcensus — require, not copy) + r126 analyzer clone.
- **Seeds: MATCHED PANEL 97901–97904** — the r112/r113/r122/r123/r125
  ladder band. **NOT a fresh band.**
- **Seed-band freshness check (skill: local_seed_band_freshness):**
  prereg search for `97901` across `evidence/` names exactly 5 preregs —
  `evidence/2026-11-09/journey-scale-r112-prereg.md`,
  `.../r113-prereg.md`, `.../r122-prereg.md`, `.../r123-prereg.md`,
  `evidence/2026-11-10/journey-scale-r125-prereg.md` — all naming it
  as the matched ladder band; no other prereg, forbidden list, or
  contaminated list names it (full-tree filename grep launched as
  proc_097c5014810b; prereg half complete at prereg-write time, the
  remainder confirmatory — no forbidden list has ever named this band).
  **Reuse release:** this prereg's matched-panel statement — the band is
  reused as the before/after panel for the alien-fallen fix, compared
  against r123's published Arm A (WITH wideduty), following r125's
  identical reuse for its Arm B and the DELIVER OVER MEASURE rule
  (before/after on identical seeds). This is a matched-panel reuse,
  not a fresh-band claim.
  **Freshness check — COMPLETED:** full-tree grep finished
  (18.7 min): `97901–97904` appears only in the ladder-band preregs /
  run notes listed above + this prereg; the 5 files in evidence/2026-11-01/
  containing the words "forbidden"/"contaminated" name no seed in this
  band. Telemetry baseline `scale.json` exists.
- **Horizon:** DAYCAP=180 loop-days, death-aware stop (leg window
  d80–d140, +10d tail max on a dead village — MEASUREMENT.md §10).
- **Pilot:** seed 97904 first (r125's pilot seed — it carried the alien
  kill + the guest death). Pilot gates: crash, census errors > 0,
  0 census rows, reconciliation residual != 0, teleOnly > 0, or 0
  studies by d60 → STOP and diagnose (INCOMPLETE, not a verdict).

## Questions (binding)

- **Q1 FIX PROOF (primary):** tele-only rows == 0 on the band, and
  every telemetry 'alien' death has a matching fallen row with cause
  'a stranger'. **GO: teleOnly == 0 AND fallen 'a stranger' rows ==
  tele 'alien' rows.** A tele-only row from ANY other gap also fails
  Q1 — it would be a finding, never re-scored.
- **Q2 SURVIVAL GUARDRAIL (not the primary):** band lived days within
  noise of Arm A (WITH wideduty, 488 days, 0/4 alive). **GO: lived
  days ≥ 440 (488 − 10%) AND no new crash class.** The fix is
  bookkeeping + three tiny recent-death gates; a >10% survival move
  is a real regression signal — investigate before landing, do not
  re-score.
- **Q3 MECHANISM:** cures / fever deaths / wound deaths / field-fight
  deaths, this band vs Arm A — the fix must not move the mechanism
  split (it touches no cure, sickness, or combat code).
- **Q4 PEOPLE CHECK:** read the band's d90/d120 transcripts in full
  (r125 Q4 protocol); senseless count 0 for clean. Note whether the
  two carried defects (Baraka unvoiced raise, Stella trap-line) still
  fire — carried, not this run's to build.
- **Q5 CENSUS:** plain-words village assessment per seed; books close
  on all four seeds; unattributed 0.

## Telemetry + checks

- `telemetry-check.js` vs `scale.json` baseline, metrics
  fightsTotal, fightsByWave.4, maxGameDay (same as r125). LOUD lines
  are same-run investigation items.
- `node scripts/check.js --quick` after the src change (mandatory —
  r125 skipped it as tooling-only; this run touches src/js).
  `node scripts/check.js` (full) before merge.

## Metric review

(To fill at closeout — metrics held, or the revision proposed for the
next run. A miss is a miss; never re-score.)
