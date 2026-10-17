# sim-foodvoice-b — verification run (2026-10-17)

**Axis:** food-economy narration blanks (#437, #438, #439)
**Verdict:** ALREADY LANDED — duplicate assignment, no new code written, zero trace committed.
**Worker:** sim-foodvoice-b / run_id `fleshout-loop-b-20261017T0432Z`

## What happened

My brief asked me to fix three filed narration blanks on food beats: #437 (static
feast opener), #438 (bowl beat asserting private eating), #439 (byte-identical spoil
mutter wall). On reading the tree I found all three already fixed and landed on
`master` by the sibling loop (sim-prosefix-b — commits `9351f1c6`, `34ac59f2`,
`79cfff05`, all `[needs-eyes]`). My branch `sim-foodvoice-b` was already at master
with zero diff, so any fix work would have been pure duplication. Per the
never-duplicate coordination rule I did not touch code: I re-ran the landed proof
suite against the current master to verify the fixes hold, and closed the three
findings entries.

## The landed fixes (read in code, all on master)

- **#437** — `src/js/game.js` `feastEmotionBit(day, spent, have, quality)` (called
  from `hostFeast`). Register chosen from honest state, pure reads, zero RNG:
  grief → mourning register; quality 0 → quiet thin-table register;
  pantry-days-after-feast ≥ 20 → the original line **verbatim** (harvest);
  < 5 → lean register (winter-shaded); else the comfortable register. Named
  facts (host, menu, kcal) are voiced by the caller, untouched.
- **#438** — `src/js/villager-objectives.js` AMBIENT_BEATS `eat` variant 3: the
  old private-eating assertion is gone. The beat now names today's company
  (ateWith vid from the meal memory / fellow hall-eaters, via displayName so
  strangers stay descriptors — knowledge gating untouched); the solo fallback
  is honest quiet ("eats by the fire, slow, watching the flames") instead of
  claiming a private bowl.
- **#439** — `src/js/food.js` `spoilVoiceLine(names)` with per-run ledger
  `v._spoilVoice`: FIRST full voicing per run keeps the smoke-rack teaching
  verbatim (the preservation-ladder teaching moment at the moment of loss is
  kept); repeats are condensed (thrown-out list only, no mutter); once the
  player knows `preserve`, three short mutters rotate deterministically by
  counter. `_beatCast` draw counts preserved on both paths (det-gate safe).

## Verification on current master (my run)

Ran `node scripts/test-prosefix-20261017.js`:

- **PART 0 RED characterization:** 4/4 PASS (pre-fix blanks confirmed absent pre-fix).
- **PART A fixtures:** 25/25 PASS — 5 distinct feast registers incl. harvest
  verbatim line, grieving register fires on grief, lean names the cost,
  determinism (no RNG draws); spoil first/full → condensed → condensed,
  3-mutter deterministic rotation; bowl sharing names company knowledge-gated,
  honest solo fallback.
- **PART B real-sim:** with `FEASTSCALE_R13=1` — **GREEN, 0 failures**.
  Registers observed in the wild: `[harvest, grieving, comfort]`;
  spoil forms `[full-teach, condensed]`; eat-sharing lines observed.
  NOTE for the record: running the suite *without* `FEASTSCALE_R13=1` fails
  `B: feasts fired in the sim` — the feast policy layer is opt-in gated
  (scripts/policies/feastscale.js:50), so no feast beats fire at all. Not a
  regression; the suite expects the policy env, matching the landing evidence.

## Before / after examples (from the landed sense transcripts)

**#437 feast opener — before:** every feast, 180x byte-identical —
"Somebody laughs so hard they cry. For one evening, nobody is surviving —
they're just together."
**After (sense-leadfeast-s252, same village):**
- [d21] grieving: "…Angela, Nandi eat until the fire burns low. The laughter
  stays low — somebody's seat is empty, and everybody sees it. For one
  evening, grief sits at the fire with them instead of standing over them."
- [d29]/[d53]/[d67] harvest: "…Somebody laughs so hard they cry. For one
  evening, nobody is surviving — they're just together." (original line kept)

**#438 bowl beat — before:** "X has their bowl and their own thoughts. Neither
one is being shared." 89x, asserting private eating.
**After (fixtures):** "🍲 Mara eats with Xavier — bowls side by side, talk
low." / solo: "🍲 Mara eats by the fire, slow, watching the flames."

**#439 spoil mutter — before:** the full "Should've smoked that…" mutter 989x
byte-identical.
**After (sense-belongfeast-s363):**
- [d10] The village threw out spoiled stores: Foraged food. Rafael mutters:
  "Should've smoked that. Fresh stuff keeps a day or two on the shelf — the
  smoke rack is right there." (pantry)
- [d11] The village threw out spoiled stores: Expedition haul. (pantry)
  — teaching delivered once, repeats condensed.

## Sense reads (verdict: PASS)

All three beats read as people, state-honest, non-robotic. The grieving
feast (d21) lands the register shift — a village that just buried someone does
not laugh the harvest line. The bowl beat no longer contradicts the communal
meal the mechanics enforce. The spoil voicing keeps its teaching power on the
first loss and stops nagging afterward. No purple prose; the voice register
matches the established one.

## Guardrails

- det-gate 16/16 byte-identical trajectories per the landing evidence; voice
  only, no kcal/economy effects, no decision-feeding state.
- Worktree `sim-foodvoice-b`: clean, zero uncommitted changes, no commits made
  (nothing to land). sim-findings.md entries #437/#438/#439 marked
  `[fixed 2026-10-17]` in the goal hidden_files.

## Metric review

- Pre-registered PRIMARY (sense PASS + designed variation fires) — MET. The
  sense pass criterion from my brief is satisfied against the landed code, not
  new code — recorded here so the loop's rotation doesn't re-assign the blank.
- No gameplay-behavior change: voice only. No new metrics needed.

## Village assessment

This run produced no new village data (no sims beyond the proof suite — the
work was already done). The blank was a documentation lag, not a code gap:
the three findings stayed `[open]` in sim-findings.md after landing, which is
what mis-routed this assignment. The coordinator should note the pattern —
marking findings `fixed` at landing time is what prevents the duplicate
briefing.
