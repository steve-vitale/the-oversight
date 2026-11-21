# sim-downedtwice-b — FROZEN prereg (Loop B 0430Z run, arm sim-downedtwice-b)

**Frozen:** 2026-11-21 07:05 UTC, BEFORE any judged sim. Base master
`df40fced1` (branch `sim-downedtwice-b`, worktree
`~/workspace/worktrees/sim-downedtwice-b`, tip `b20328ad9` — the
version-bump commit on `df40fced1` that local master carries; no
`src/` difference from `df40fced1`). Fix arm: finding #2634, a downed
companion struck again and "going down" a second time.

## The defect (finding #2634; sim-pinquaddoor-reprereg-b.md §1/§8)

On the pinned door fight 106705 d144 (audit, wave 4), Lenkina
(visjoin_132, ally slot 2, entered at 16 HP) is hit for 37 (0 left)
— "Lenkina goes down!" — and the next round the monster hits her
again for 42 (0 left) — "Lenkina goes down!" a second time. She then
lies at 0 HP for the rest of the fight without striking (coherent —
down, not dead), but the re-hit at 0 HP with a repeated going-down
line reads wrong. The full transcript and rounds detail were
recovered from the reprereg corpus
(`perseed-pinquaddoor-reprereg-b-armed/...-s106705-....json`,
v4encounters audit d144): R1 ally2Hp 16 → −21, R2 ally2Hp −21 → −63.

## The mechanism (verified against the transcript + rounds detail)

The monster phase in `src/js/fieldFights.js` builds `_liveAllies`
only from allies with HP > 0 (correct), then picks the target with:

```
if (hittingAlly) _hitAllyIdx = _liveAllies.length === 2
  ? (RR() < 0.5 ? 1 : 2) : _liveAllies[0];
```

The two-live pick hardcodes slot numbers 1/2 instead of indexing
`_liveAllies`. On master (two ally slots) the two live allies can
only be slots 1 and 2, so the pick is correct there. On the held
pin branch (three slots: ally, ally2, ally3) the live pair can be
(1,3) or (2,3): in R2 `_liveAllies` was [1,3] (Zhasulan 86 HP,
Xavier 67 HP; Lenkina down at −21), the roll resolved to literal
slot 2, and the monster hit the downed Lenkina. The pick line is the
unique mechanism: it is the only HP-subtraction site for allies
(`_hHp -= ...`, one site), no attack pattern hits all fighters, and
the signature hooks do not touch allies.

The fall block then re-fires on the re-hit, because it keys only on
the post-hit HP:

```
if (_hHp <= 0) { ... rec.log.push(_hName + ' goes down!'); ...
  hurtVillager(_hVid, 30, 'monster', ...) ... }
```

So the same fall settles twice: the "goes down!" line repeats AND
the flat-30 fall wound (`hurtVillager`) is applied a second time,
against the design intent recorded at the wound-carryover site
("A downed ally is excluded: their fall already settled as the
flat 30 during the fight").

## The fix (scope — two edits, one file, `src/js/fieldFights.js`)

1. **Pick fix (targeting):** the two-live pick indexes `_liveAllies`
   instead of hardcoding slot numbers — `_liveAllies[Math.floor(RR()
   * _liveAllies.length)]` for 2+ live allies, `_liveAllies[0]` for
   one (no extra RNG draw). On master this is behavior-identical
   for identical draws (length 2: `floor(RR()*2)` picks index 0 iff
   `RR() < 0.5`, exactly the old 1/2 split; length 1: unchanged, no
   draw consumed). It closes the defect class for the three-slot
   form when the held pin branch lands.
2. **Fall guard (narration + settlement):** capture whether the hit
   target was live before this blow (`_hWasLive = _hHp > 0`) and
   gate the fall block on the transition (`_hWasLive && _hHp <= 0`),
   so "goes down!" and the flat-30 fall settlement fire exactly once
   per fall, even if a re-hit ever lands through another path.

No new systems; no behavior change beyond the downed-targeting /
narration rows. Do NOT touch `villager-brain.js` / `win-plan.js`
(#2605 stays BLOCKED). Do NOT touch the held `sim-pinquaddoor-b`
branch. CONFLICT NOTE: both edits touch lines the held pin branch
also modified (its pick line and its `ally3In` line inside the fall
block) — a rebase of the pin branch onto the fixed master will
conflict there; the coordinator resolves it, keeping the fixed form.

## What each half proves

- (a) Targeting: on master the pick is already correct for the
  two-slot case — the proof test proves it at fight level (no
  downed ally ever re-hit across seeded fights) and proves the
  pick invariant at unit level (the pick always resolves to a
  member of `_liveAllies`, across all live-set shapes including
  [1,3] and [2,3] — RED on current code, GREEN on fixed code).
- (b) Narration: "goes down!" fires only on the transition to 0 —
  the proof test shows the fall block is transition-gated (RED on
  current code, GREEN on fixed code); at fight level on master the
  repeat is unreachable through targeting, so the guard is
  defense-in-depth for the double settlement.

## Primary metric (BINDING, §14) — GO requires ALL of

- (M1) **Proof test** `scripts/test-downedtwice-b.js`: all sections
  green on the fixed tip — pick invariant (all live-set shapes ×
  RR draws), fight-level no-repeat (no ally "goes down!" twice in
  one fight, no hit line on an ally at ≤ 0 HP at round start,
  across seeded fights), fall-guard transition check. The test is
  RED on the pre-fix code (pick invariant fails on [1,3]/[2,3];
  fall block unguarded) and GREEN after.
- (M2) **Staged proof:** a geared party vs a wave-4 monster
  (fixture per the encounter-gear rule: geared scholar + party, not
  a fresh solo scholar) enters a field fight, one ally goes down,
  and the transcript reads true — the downed ally is never struck
  again, "goes down!" appears exactly once for that ally.
- (M3) **Guardrail, 8-seed fresh band, control vs armed on
  identical seeds** (driver `scripts/sweep-downedtwice-b.js`,
  competent policy verbatim, 150d death-aware):
  - (B1) **Downed re-hits:** 0 on the armed leg (and 0 on the
    control leg — the defect is unreachable on master; any
    nonzero count on either leg is investigated, not waved).
  - (B2) **No outcome change:** deaths, wins, wave-4/5 unlocks,
    median survival within noise of control. Expected: per-seed
    trajectories byte-identical (the pick consumes the same RNG
    draws; the fall guard never fires on master) — any divergence
    is a same-run investigation item, not a pass.
  - (B3) **Balanced-panel compare** attached: expect
    `review_required`, no `regression_signal`.
- (M4) **Deliverable:** evidence file with the frozen-bar table, a
  sense-test transcript read (the fixed fight quoted), wall
  numbers, and the panel compare attached; corpora under
  `evidence/2026-11-21/perseed-downedtwice-b-control/` and
  `...-armed/`.

A miss on any of M1–M3 is NO-GO, never re-scored against a friendlier
metric. If the metric proves wrong, write it under "metric review"
and propose the revision for the NEXT run.

## Secondary (REPORTED, not binding)

- (S1) Wall numbers every run: wins / national / table, wave-4/5
  unlocks, median survival, deaths.
- (S2) "Goes down!" counts per leg (total lines, repeats per ally
  per fight).

## Base + substrate (verified, not assumed)

- Base: master `df40fced1` at arm start; branch tip `b20328ad9`
  (version bump only; `git show` lists docs/ONTOLOGY.md,
  index.html, src/js/build.js, sw.js, version.json — no game-code
  change). Worktree clean at arm start.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38...` (first 12: `1884c8852d38`) — verified on this
  tip, identical to the reprereg band.
- Substrate flags (both legs — flags whose code is on master):
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1`. `ALLYSLOT3` is NOT set: the ally3 slot code is
  not on master (it lives only in the held pin branch); setting
  the flag would be a no-op. `LAUNCHSURVIVE` has no `src/js`
  reader on this tip and is not set.
- Horizon: 150d, death-aware (dead villages stop, +10d tail max).
  Why 150d: wave 4 needs standing ≥ 100, reached ~day 60–100 on
  this band family; villages die before 150d on ~half the seeds,
  so a fixed 200d would simulate corpses. Same horizon as the
  reprereg band — the legs are comparable.
- Seeds: **106801–106808, 8 FRESH seeds.** Freshness verified
  2026-11-21 ~07:05 UTC before freezing, per the seed-band skill
  — scope: every dated prereg under `evidence/`
  (`evidence/*/sim-*-prereg.md`), dated sim notes
  (`evidence/2026-11-*/sim-*.md`), corpus filenames under
  `evidence/`, corpus JSON `"seed":` cites (precise
  `"seed": 10680[1-8]` grep over the committed tree), `scripts/` +
  `docs/`. Result: FRESH. The only hits were false positives,
  each checked with context: (a) loose-pattern `10680[1-8]`
  matches inside pantry-kcal values (`pantryFreshBefore` /
  `pantryFreshAfter` 106807 in a 2026-10-16 crumbdefault census
  JSON) and a float substring (`82.10680824484697` in a
  2026-10-17 feastvoice JSON); the precise `"seed": 10680[1-8]`
  grep over all of `evidence/` is empty; (b) no prereg, dated
  sim note, corpus filename, script, or doc cites any of the 8
  seeds with digit boundaries; (c) no forbidden/contaminated list
  names the band.
- Policies: competent verbatim only.
- **Control re-run required:** the control leg runs on the CURRENT
  pre-fix code in this worktree — no prior corpus is the judged
  control. Legs run 8 seeds each; per-seed files persist across
  kills; resume, never re-run completed seeds.
- **Legs chunked at 8 seeds per call** (one call per leg; the
  reprereg's 16-seed single process was SIGTERMed — 8 seeds per
  call stays inside the window).

## Expectation (not a bar)

The armed leg should be trajectory-identical to control (the fix
is inert on master by construction: same RNG draws, unreachable
guard). The observable proof of the fix is the proof test (M1) +
the staged fight (M2), not a sim delta. If the legs diverge
anywhere, that is a finding, not noise — investigate before
judging.
