# journey-landing r129 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon d28)

**Run id:** playtest-loop-a-20261113T0744Z (scheduled Fri 2026-11-13 01:45 CST, started 07:44Z).
Rotation read 0 → leg 0 LANDING; write 0→1 at run start (verified by read-back).
**Base:** local master `f7352f946` (sim-gap-round-0515 evidence landed since r128's base bff8b86b6).
`git pull --ff-only` in main tree: already up to date. Main tree clean at start; disk 40%.
**Lock:** created 07:44:52Z, run_id `2026-11-13T07:44:52Z`. Heartbeat loop
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/hbloop-r129.sh`
(every 10 min, outside /tmp per the r128 infra note) after registration.
Worktree `~/workspace/worktrees/journey-landing` (branch `journey-landing`) registered
via `scripts/worktree-register.sh`. **Delete lock at closeout, even on failure.**
**Numbering note:** Lane A leg counters are per-leg; the last landing run was r128, so this run is r129.

## Seed bands — DELIBERATE REUSE (defect bands, sanctioned)

**Panel seeds 1142–1151 (the r121 band, 9th run).** The pocket defect was
observed live on the fresh band, and the panel's carried bindings are judged
on this band by every landing run since r121. Reuse is sanctioned here by
r128's run note, which names the terrain pocket "a separate defect for r129"
— this run IS that owning run (landing leg owns the scholar-turns watch).
**Freshness check (local_seed_band_freshness skill, this run, before any
scored seed):** grepped `evidence/*/journey-landing-r1*-prereg.md` for
`1142–1151` — named in r121–r128 preregs; for `1200–1209` — named only in
the r128 prereg (its fresh band). No forbidden-band list names either band
(checked `evidence/` for band lists: sim-cattailband-b, sim-trajband-b,
sim-freshband-b, sim-bandfreeze-b preregs — none names 1142–1151 or
1200–1209). Reservation explicitly released for this run's named remainder.
Recorded here per the skill.

**Design — BEFORE/AFTER on matched seeds (§15, §9):** both drivers run the
SAME seeds 1142–1151, DAYS=28. BEFORE = r128 AFTER driver verbatim except
OUTDIR/header + the freeze point named by the probe (see Q1 freeze note).
AFTER = the same driver verbatim except OUTDIR/header, loading the FIXED
code. No other delta between the drivers. The probe (seed 1209, DAYS=28)
runs BEFORE any fix, on the base, to identify the pocket's entry mechanism
and blocking cells.
Analyzers: scripts/analyze-landing-r118-outingchain.js;
scripts/analyze-landing-r126-presshop.js;
scripts/analyze-landing-r125-personal-bridge.js;
scripts/analyze-landing-r126-bridge-pools.js;
scripts/analyze-landing-r104-20261105.js (DIR via argv);
scripts/analyze-landing-r112-practice.js (DIR via argv);
scripts/analyze-landing-r117-huntpractice.js;
scripts/analyze-landing-r117-zerodmg-v2.js;
scripts/analyze-landing-r120-scholar-turns.js;
scripts/analyze-landing-r107-commit-offer.js (WITH the r122 settled-favor
exclusion); scripts/analyze-landing-r127-topic-dwell.js;
scripts/analyze-landing-r128-move-refusals.js (r128, unchanged);
scripts/analyze-landing-r129-pocket.js (NEW — Q1, pocket grid + stuck TURNS).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or
gate change in this run. **Perception law (2026-10-28) stands** — all
instruments read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** Q1 is the fix for r128's named
remainder (the terrain pocket). A game-code fix is in scope where the
instrument shows a defect the policy cannot fix alone — the pocket is a
world/fight-movement defect, not a policy choice (no policy can walk out
of a sealed cell).

## Canon

docs/CANON.md read at run start. No canon doc covers fight-grid pathing
pockets — that is a movement robustness gap, not a designed system; the
fix changes no canon rule (MAP.md §2 covers the 9x9 detail grid and
beyond-edge travel; MONSTER-WAVES.md covers the statickite fought; the
fix touches neither waves nor loot). The dialogue fixes (Q3) touch
docs/CONVERSATIONS.md territory only in the sense of line content — no
dialogue-system rule changes.

## Q1 (PRIMARY) — THE TERRAIN POCKET: scholar sealed at (8,0), seed 1209 d13

**Basis (r128 run note, read pre-panel):** the 1209 d13 statickite fight
ended won (12 strikes, hpEnd 85), but the scholar spent 4 turns trying all
8 monster-adjacent tiles from (8,0) — every one refused "No path there."
`findPath` (BFS avoiding blocked cells, `game.js:14663`) returns null from
(8,0) to every tile. The close fix records it honestly
(closeStuckTurns=4, closed=0); the pocket itself is unresolved. The
scholar was ALREADY at (8,0) at fight start (census `scholarMx: 8,
scholarMy: 0`; `startCombat` takes the scholar's current mx,my — it does
not reposition). The monster was placed near (4,4) by `freeSpotNear`.
`microMove` (world steps) checks ONLY the destination cell's `blocks` —
it never checks whether the destination has an exit — so a world step can
enter a sealed cell, and `tbPlayerMove` (fight steps) routes through
`findPath`, which cannot leave the tile at all.

**Hypotheses (probe decides, in this order):**
- H1 TILE-BOUNDARY TRAP: the scholar crossed into (8,0) from the
  neighboring tile east (edge crossing places the scholar at (8,y) with no
  exit check), and (7,0)/(8,1)/(7,1) are all blocked terrain (grove trees,
  ruin walls, creek water) on this tile's deterministic detail grid.
- H2 SHOVE: an earlier fight's knockback/shove placed the scholar on
  (8,0) (Redactor shove is "interior tiles only" per MONSTER-WAVES.md —
  so a shove onto an edge tile would itself be a defect).
- H3 HALL: the fight is inside Haven and (8,0) is a hall `wall` cell — the
  scholar standing ON a wall cell would be a placement bug
  (hall layout rows 0/8 and cols 0/8 are all wall).
- H4 POCKET-FORMED-LATER: the detail grid changed between entry and fight
  (genDetail is deterministic per (px,py) via detailSeed — the probe's
  grid dump tests this by re-deriving the grid at fight time).

**Probe (driver-only, BEFORE any fix — seed 1209, DAYS=28, r128 AFTER
driver + pocket instrument):**
- At fight start (`startCombat` wrap): dump `map.px/py`, tile type,
  `insideHaven`, the full 9x9 detail grid (cell strings), scholar
  (mx,my), monster (mx,my) per fighter. Stored on the FIGHTS entry as
  `pocketGrid`.
- Scholar position trace: wrap `microMove` + the tile-crossing step to log
  (day, mx,my, px,py, from→to) into a per-seed array; dumped for seed
  1209. The trace shows the exact step that put the scholar on (8,0).
- On any `tbPlayerMove` "No path there." refusal: dump the grid once per
  fight (guard by fight identity) if not already dumped at fight start.
- The probe also re-verifies the r128 finding: 1209 d13, 4 close turns,
  32 attempts, all from (8,0), 0 moved.

**Fix (decided by the probe; the shape is pre-registered, the site is not):**
- If H1: the fix keeps the scholar out of sealed cells at the crossing
  (world movement) or gives the fight an exit — the minimal honest fix
  that a real player also benefits from. A fix that only teaches the
  sim policy to avoid the corner does NOT count: a real player walking
  there is stranded the same way.
- If H2: the fix is in the shove/knockback placement (never land a
  fighter on a sealed cell / never shove onto an edge tile).
- If H3: the fix is in fight-start placement (never start a fight with
  the scholar on a blocking cell).
- If H4: the fix is in whatever mutates the grid.
- Out of scope, noted for r130: `move_x2` (`competent.js:2563`) and the
  directional-flee walk (`:3544`, env-gated OFF) — carried from r127/r128.

**Proof tests (NEW, one per fix site, stub Game/fight, separate processes,
modeled on r127/r128):** `scripts/test-journey-landing-r129-pocket.js`
(the pocket shape: scholar in a sealed cell; the fix's behavior — entry
refused / placement nudged / exit allowed — asserted; the old behavior
asserted as the failing control). MUST FAIL on unfixed code and be ALL
GREEN after.

**Pre-registered metrics (binding):**
- M-Q1a (probe): the probe reproduces the 1209 d13 pocket AND names the
  entry mechanism + the blocking cells (grid dump on file). If the pocket
  does not reproduce on this base, record the non-reproduction under
  metric review and judge Q1 on the fresh-band scan only if a live pocket
  appears there — do not re-score Q1 on a vacuous panel (r127/r128
  lesson).
- M-Q1b (fix): on the AFTER corpus, ZERO fights with a living scholar,
  ≥3 turns of 0 successful moves (the pocket shape — stuck TURNS, not raw
  attempts; r128 lesson). The standing reproduction case is seed 1209 d13:
  on AFTER its scholar must move (posMoved ≥1) or the fight must start
  with the scholar NOT in a sealed cell. If the shape persists on AFTER,
  the fix is NO-GO — do not re-score.
- M-Q1c (proof): all proof tests ALL GREEN post-fix AND FAIL on unfixed code.
- **Q1 freeze note:** if the fix is in `src/js` (game code), the BEFORE
  freeze is the base `src/js` (no frozen policy file needed — the policy
  is identical on both sides). If the fix is in the policy, freeze
  `scripts/policies/competent-r128.js` (byte copy of base
  `competent.js`) as the BEFORE policy. The probe's verdict picks the
  freeze; the choice is recorded here at fix time, before the panel.

## Q2 — PRACTICE (carried)

movedCells d1→d28, attributed, seedsWithMove, skill0→pos, practiceReps.
Hunt reps 0 watch (r117 hunt-assignment policy question carries —
twelfth panel running).
**Bar:** GO if movedCells ≥ 50 with 10/10 seeds moving (r121: 97, r122:
103, r123: 95, r124: 95, r125: 96, r126: 100, r127: 97, r128: 98).

## Q3 — DIALOGUE DEFECTS (r128 M5 D1–D3, small content fixes)

- D1: `[alive:thread:personal]` label reads "We never finished —
  themselves." — a dangling pronoun, garbled in the player-facing menu
  (1142 d6). Find the label code, fix the pronoun, proof test.
- D2: `warn_you` has exactly one warning line, repeated VERBATIM at turn
  5 and turn 19 ("I don't know what's moving out there, but something
  is. Keep your eyes up past the treeline.") — the want has no second
  beat (1150 d6). Add a second line (data), proof: the pool holds ≥2
  lines and a sitting never repeats the same line.
- D3: ask:village "How are the injured doing?" is answered with
  leadership tension ("Honestly? there's tension about who's in charge.")
  — the answer belongs to the live tension event, not the question asked
  (1150 d6). Investigate the routing; fix if small, else document.
Each fix gets a proof test (FAIL on unfixed / ALL GREEN after) + a
transcript re-read on AFTER. If a defect's fix proves bigger than a small
content change, document and carry — do not expand scope mid-run.

## Q4 — M-PR1 INVESTIGATION (analysis-only)

r128: M-PR1 MISSED on its base — 1149 has two never-offered sittings
(d13, d15) vs the ≤1 bar; before/after identical, a base property. Read
the 1149 sittings from the r128 AFTER corpus (`landing-r128-after`) and
identify why no offer fires. Report the cause; fix only if trivial and
provable in this run, else carry with the cause named.

## Carried bindings (judged fresh on the post-fix AFTER corpus)

- **M1 ALIVE-D14:** 10/10 villages alive at d28.
- **M2 SYSTEM CONTACT:** 10/10 (systemDay d8–d9).
- **M3 FIGHT-LOG:** 0 unknown/mixed trigger.
- **M5 PEOPLE:** PASS (sense-read below — read full transcripts).
- **Zero-DMG invariant:** 0 violations.
- **Miriam line:** 0 "That's settled".
- **R66 HUNGRY:** report hungry share + starvation deaths (r128: 5/10, 0 deaths).
- **R73 narrow windows:** report NARROW / kept-inside-narrow.
- **Mantle latency:** report max (r128: 1 day, non-vacuous).
- **1130-d6 amnesia shape:** 0 recurrences.
- **Scholar-turns watch:** verb totals; no living 0-strike ≥3-move fight.
- **Deflect-fallback repetition:** worst sitting count (r128: 0 flags on AFTER).
- **6394 flat fall-through:** 0 occurrences.
- **Kill-mean trend:** report per-seed mean (r128: 21.7).
- **Poison re-test:** count live re-tests (r128: 0).
- **Scholar-eats-first:** held design question, not changed.
- **Q6 M7 GOAROUND:** R84 prompt arrival ≥80% = GOAROUND-HOLDS; R85 complete == skips = RESCUE-GO.
- **Personal bridge (r125 fix):** 0 repeats in a sitting on the AFTER corpus.
- **Small bridge (r127 fix):** 0 repeats in a sitting on the AFTER corpus
  (regression check on the r127 fix).
- **Q1 r126 (combat-interrupted evening chain):** presshop farUnreached stays 0 on AFTER (regression check on the r126 fix).
- **M-PR1:** per-seed never-offered ≤1 (r128: MISSED on 1149 — see Q4).

## Seeds, pilot, shape

- Panel: seeds 1142–1151 (deliberate reuse — see above), DAYS=28, OUTDIR
  landing-r129-before (BEFORE driver, frozen point per Q1) and
  landing-r129-after (AFTER driver, fixed code), both under goal
  hidden_files evidence/2026-11-13/.
- Probe: seed 1209 only, DAYS=28, OUTDIR landing-r129-probe, r128 AFTER
  driver + pocket instrument. Runs BEFORE any fix.
- Fresh-band scan: seeds 1200–1209, DAYS=28, OUTDIR
  landing-r129-scan-after (AFTER code only, pocket-shape watch) — only if
  the probe needs a second live pocket, or as the AFTER pocket watch.
- PILOT FIRST: 3 seeds (1142, 1146, 1150 — includes the Q1
  defect-adjacent seeds), BEFORE driver, before expanding. The pilot
  validates (a) seeds run; (b) the practice snapshots present in census
  JSON; (c) the outingchain analyzer runs on the pilot corpus; (d) the
  invariant test passes; (e) ≥1 forage_help favor observed; (f) ≥1
  evening together attempt on a far node (d≥4); (g) the probe reproduces
  the 1209 pocket WITH its grid dump (the probe's point, not the defect).
  If the pilot shows 0 favors, document and still run the panel only if
  the carried bindings need the panel — the pilot decides; do not burn a
  full run on a dead question.
- Shape: the r118 outingchain analyzer runs on BOTH corpora as-is. The
  r126 presshop analyzer compares the two corpora for the outing shape
  (r126-fix regression check). The invariant test re-runs on the AFTER
  panel corpus as the after-proof. Q1 is measured by the pocket analyzer
  + the scholar-turns analyzer + the 1209 fight-log read. The Q2
  topic-dwell analyzer runs on BEFORE first, then AFTER (small-bridge
  regression check).

## Metric review (filled at closeout, never mid-run)

- (to be filled)
