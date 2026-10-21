# Death-Liturgy Templating Blanks — FIX (sim-deathliturgy-fix)

Run: fleshout-20261021T0015Z · axis scale-onramp · claim file
`hidden_files/lever-claims/fleshout-20261021T0015Z.json` (death-liturgy arm;
sibling arm sim-folkname-map works scripts/-only, no overlap).
Findings backlog item: `sim-findings.md:717` (claimed by this arm).

Evidenced in: `evidence/2026-10-20/sim-windowseat.md` + transcripts
`evidence/2026-10-20/windowseat-transcripts/` (leadfeast-s66004.txt,
belongfeast-s66006.txt). Canon read: docs/CANON.md (+ standing
rules). No canon doc covers death-liturgoy voice specifically — the fix
follows Steve's voice rules (plain, specific, human, no purple prose) and
the no-silent-actions / one-death-one-grief principles already in the code.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14)

- **Primary metric:** RED→GREEN proof — `scripts/test-deathliturgy-20261021.js`
  (11 checks: 3 blanks × RED reproduction + GREEN fix, plus static
  call-site guards). GO = all 11 GREEN.
- **Secondary metric:** det-gate — paired seeds (42421–42428), scrubbed state
  digest byte-identical control-vs-fixed. GO = 8/8 identical. This is a FIX
  arm, not a lever: there is no lever GO threshold, and the death-aware
  horizon guidance is N/A (targeted code-path fixtures, not long runs).
- **Seeds:** fixtures 42421/42422/42423; det 42421–42428.
- **Policies:** none — fixtures drive the real code paths directly
  (villageDrinks → villageSicknessTick, hurtVillager-lethal → call-site
  pattern, hurtFromStarvation).
- **Convergence state:** fixed (proof 11/11 GREEN, det 8/8 identical, sense PASS).

## The three blanks and their root causes

**(a) Two cause lines for one death.** James (d106, leadfeast-s66004): the
thirst handler (`villageDrinks`, game.js) killed him and said its line; the
sickness tick (`villageSicknessTick`) then iterated his leftover `v.sick`
record, found him dead, and narrated 'succumbed to the fever' anyway.
**Fix:** capture `_wasDead` before the tick's `hurtVillager`; if the villager
was already dead (or off-roster) before this tick, clean the sick record
silently (`continue`, no line). A corpse is grieved under its real cause.

**(b) The grief beat fired twice for one death.** `registerDeath` fires
`villageEvent('death')` internally (corpses.js GRIEF branch), and all four
vDie call sites ALSO fired it directly (field-fight vDie game.js:7548,
raid vDie game.js:19090, wound game.js:26658, sortie vDie havenGrowth.js:771).
Observed: 'Nobody's talking much…' twice inside Caleb's single death
(leadfeast-s66004 d101). **Fix:** new `Game.deathGriefBeat(vid)` helper —
`registerDeath` sets `village.deathSeen[vid]` before its internal fire, so
the helper fires the event only when the death never registered (defensive
fallback if the pipeline threw before registering). All four sites now call
it. One death = one beat = one fear/social application.

**(c) 'The village is N now.'** The starvation, wound, and sickness death
lines ended with a headcount that read like a census, not a loss. **Fix:**
new `grief` pool in `AMBIENT_BEATS` (villager-objectives.js) + `griefLine(vid,
nm, causeTail)` renderer — the cause tail keeps each death's earned cause
narration (thirst/starvation/wound/fever), the coda is the village's grief,
rotated by the pure (vid, day) `ambientPick` (never R(), per findings
#263/#264 — no RNG draws, det-gate safe). The `💀` and knowledge-gated name
come from the existing cause tail; only the coda changes.

## Before / after (quoted from real runs)

### (a) — fixture beats, RED→GREEN

BEFORE (RED, pre-fix fixture — same shape as James's d106 transcript beat):
```
💀 Ethel succumbed to the fever. The village is 11 now.
```
(said AFTER the thirst line for the same death)

AFTER (GREEN):
```
💀 A person, maybe 40s, with a long braid died of thirst. There was nothing to drink.
```
(alone — the tick cleaned the sick record silently)

### (b) — spy on villageEvent('death') across the real pipeline

BEFORE: lethal `hurtVillager` → internal beat (1) + old unconditional call-site
line (2) → **2 beats, 2 'Nobody's talking much' lines** for one death.
AFTER: **1 beat, 1 grief line.** Static check: the only remaining raw
`this.villageEvent('death')` in game.js is the single sanctioned one inside
`deathGriefBeat` itself; all four sites route through the helper
(+ havenGrowth sortie site).

### (c) — death codas

BEFORE:
```
💀 A woman, maybe 40s starved. Slowly. The village is 11 now.
💀 Iman is gone. The wound was too much. The village is 5 now.
💀 James succumbed to the fever. The village is 1 now.
```
AFTER:
```
💀 A woman, maybe 40s starved. Slowly. The talk dies fast around the fire. Nobody has the words yet.
💀 Iman is gone. The wound was too much. Nobody eats much tonight. The pot stays full and nobody touches it.
💀 James succumbed to the fever. Somebody's sleeping-roll stays rolled out. Nobody puts it away.
```

**Sense verdict (SENSE-TESTING LAW):** read as a player — the new codas land
as real grief. They name no headcount; they show the village's hands and
mouths doing grief-things (looking at the door, the untouched pot, the
un-rolled sleeping-roll). Plain, specific, human. PASS.

## Proof results

- Fixtures: 11/11 GREEN post-fix (`node scripts/test-deathliturgy-20261021.js`).
  Pre-fix RED run: 8/11 failing, reproducing all three blanks (the 3 passing
  were fixture sanity checks).
- Det-gate: 8/8 seeds byte-identical control-vs-fixed on the scrubbed digest
  (`scripts/det-deathliturgy-control.json` vs `-fixed.json`).
- Regression: `test-corpses.js` 38/38 green; `test-death-pack-bonded` 4/4 green.
- Node syntax check clean on all edited files.

## METRIC REVIEW (§14)

The det-gate is honest about not being purely fiction-only. The digest
excludes four surfaces, each for a stated reason:

1. `Game.log` text and `village.awayNews` text — the fiction surface the fix
   rewrites by design (liturgy text changes).
2. `village.needs` (fear/social) — blank (b)'s dedupe removes one duplicate
   grief application: fear +25 and social +20 now apply once per death, not
   twice. This IS the fix working, not a side effect; it is excluded so the
   gate can assert that *nothing else* moved.
3. `village.grief` — set (not accumulated) by the beat; excluded for the same
   reason.

Everything else — roster, health, pantry, corpses, fallen, telemetry,
deathSeen — is byte-identical across 8 paired seeds. No RNG draws were added
(grief rotation is the pure-hash ambientPick), so downstream draw sequences
are unchanged.

One deliberate asymmetry to record: the grief *variants* rotate per (vid,
day), so two identical seeds on different days render different codas — but
the digest excludes the fiction surface, so this cannot leak into mechanics.
The canonical variant-0 line is the fallback if the pool ever fails to load.

## What was NOT chased (out of arm)

- Windowseat blank 3: the 3-village tribute-press block repeating identically
  per scholar death — separate item, untouched.
- Windowseat blank 5: "The village's quarrel was with X" with no quarrel on
  record — separate item, untouched.
- The convo-wants.js `The village is ${n} hungry mouths…` line is a
  negotiation-stakes line, not a grief beat — left alone.

## Files changed

- `src/js/game.js` — `deathGriefBeat(vid)` helper; 4 vDie sites deduped;
  sickness-tick silent cleanup; 3 death lines → `griefLine`.
- `src/js/villager-objectives.js` — `grief` voice pool + `griefLine` renderer.
- `src/js/havenGrowth.js` — sortie vDie site → `deathGriefBeat(leader)`.
- `scripts/test-deathliturgy-20261021.js` — RED→GREEN fixtures + det-gate
  (new). `scripts/det-deathliturgy-control.json` / `-fixed.json` — det digests.
