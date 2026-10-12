# Longsim win-path lever r4 (lever 10: arcs → national → table → win) — 2026-10-12

Follow-up to `sim-winpath-r3.md` (2026-10-12). Its finding: the feast-surge
chain went **armed 12 → granted 4 → used 0** — the buff expired before a
random encounter was found. The r3 blank: **granted→used is luck-gated**.

## The design call

A feast is loud, smoky, and bloody. It is SENSE-MAKING that a big feast
ATTRACTS something — scavengers and predators smell the cookfire. So the
deed's fight now comes to the village instead of depending on a lucky
random encounter: **the cookfire's smoke draws scavengers.**

On a FRESH armed grant (never a refresh — one draw per buff), a
wave-appropriate beast (castMonster — threat-rated, never a horror over a
pointy stick) is left circling the haven's edge as a pending encounter.
The player chooses: **face it** (startCombat, blow-by-blow — the canon
'breach' crisis fires, the party joins, the deed feeds) or **let the watch
drive it off** (no fight, devotion unspent, the buff still live until its
dawn — declining the fight declines the deed, honestly). The draw dies
with the buff — the fire is cold, the beast moves on.

What this does NOT do (Steve's laws hold):
- The bar's definition doesn't weaken: `feastSurgeUsed` still marks ONLY
  on real combat use of the surge. Only the encounter lottery is removed.
- Deed-scoped, not general monster pressure (lever 1's territory):
  armed-devotion feasts ONLY; unarmed feasts draw nothing; one draw per
  buff; a live wanderer is never clobbered; the 'breach' crisis dedupes
  per run (fireCrisis), so the crises bar can't be farmed.
- The fight is real: blow-by-blow via startCombat, veteran variants apply
  (s.feastDraw.veteran read), party joins, death is possible.

Numbers (all in `src/data/feast-surge.json` → `feastDraw`): `chance: 1.0` —
the smoke always carries. Guaranteed but FOUGHT.

## Before/after (identical seeds 1-16 × competent+winseek × 200d)

Baseline: pristine HEAD export (`/tmp/wp-baseline-pristine`, git archive —
the sweep re-reads src/js per seed, so the worktree's mid-run edits would
have contaminated it; killed the first attempt and re-ran clean).

| metric | before (pristine master) | after (r4) |
|---|---|---|
| feast chain | armed 12 → granted 2 → used 1 | armed 14 → granted 2 → used 2 |
| feast draw | — (no machinery) | drawn 2 → faced 2 \| driven-off 0 |
| feastSurgeUsed | 1/30 | 2/30 |
| lesser / full / table / won | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |
| median / max survival | 44d / 202d | 44d / 202d |
| wave≥3 | 9/30 | 8/30 |
| regional / national | 7 / 0 | 7 / 0 |

**The r3 blank is closed.** Before: granted 2 → used 1 (50%, luck-gated —
the one use came from a lucky random encounter). After: granted 2 → used
2 (100%, deterministic — both grants drew a beast, both were faced, both
marked the deed). The draw fires on every grant and the policy now fights
it instead of fleeing it.

**The policy fix (r4b).** The first after-sweep showed drawn 2 → faced 2
but used 0: the winseek policy faced the beast, then its `winseekFight`
"outmatched" assessment fled at 37 HP (hpPct < 0.5) — zero strikes, the
fight lost, the deed never marked. Fix in `scripts/policies/winseek.js`:
while the feast buff is live and UNUSED, skip the outmatched /
wave-filled / already-faced flee checks (the buff is the deed, the ×2+
multiplier is the equalizer the flee math doesn't see). Near-death
(hpPct < 0.3) still flees — dying is worse than missing the deed. Proof
test T9 covers it (48/48 green). Re-ran the after-sweep on identical
seeds: used 2/2.

*(n=30; seed 9 excluded from both sweeps — pre-existing contest-loop
stall on pristine master, documented in r3. The before sweep was 30 runs,
not 32; r3's "armed 12 → granted 4" was from a different seed set.)*

## Reachability verdict

**The lesser seat remains unreached (0/30 before and after).** The r4
lever closed its assigned blank — the feastSurgeUsed granted→used gap is
now deterministic (2/2) — but the lesser-seat bar has other bindings
outside lever-10 territory: wave-3 reach (8/30, lever 2), national scale
(0/30, lever 0 food economy), and survival (median 44d, lever 1). The
feast chain is no longer the binding constraint on the deed; the forest
now comes to the village, and the village fights it.

## The upstream blocks (unchanged from r3, documented not fixed)

1. **Food economy** (lever 0): the village eats ~6k/day; feasts need a
   1.5× buffer the starving village can't spare.
2. **Survival** (lever 1): median ~30-52d; the chain needs ~100d. Combat
   deaths dominate.
3. **Wave-3 fights** (lever 2): the 4/4/3 faced bar needs luck + survival.

## Sense-check (transcript read — SENSE-TESTING LAW)

**PASS**: The draw beat — "The cookfire's smell carried further than the
laughter did — smoke and grease on the night wind. A shadow moving wrong
against the sun is circling the edge of the light. It followed the feast
here. (A scavenger, drawn by the feast. Face it while the feast is in
you — or let the watch drive it off.)" The choice is legible, the fiction
is diegetic. The breach crisis fires honestly ("It got INSIDE. The haven
was supposed to be the safe place — the one place. It isn't."). The fight
marks the deed: "FEASTED ×2.03: the feast was the weapon."

**PASS**: The drive-off beat — "A person, maybe 40s takes up a brand and A
person, maybe 20s, with a farmer's tan follows — they meet it at the edge
of the light with noise and fire. A raccoon with too many fingers, working
at something was never brave. It melts back into the dark. (The watch
drove off the feast's scavenger. The devotion stays armed; the feast's
fire still burns in you.)" Named actors, real action, honest parenthetical.

**FAIL → FIXED (x2, both in the feast's own design space):**
1. The feast guest list rendered four strangers as "A, A, A, A and 7 more"
   — `displayName(vid).split(' ')[0]` on stranger descriptors ("A person,
   maybe 20s") yields "A". Per the knowledge law, strangers ARE
   descriptors — the whole descriptor is the honest short form. Fixed in
   `hostFeast`'s `first()` and `feastPlan`'s guest loop (game.js), and the
   same pattern in `driveOffFeastDraw` (feastBuff.js, with dedupe).
2. The drive-off line read "The a raccoon with too many fingers... was
   never brave" — article clash with the descriptor's own article. Fixed:
   the descriptor is capitalized as the sentence subject, no prepended
   "The".

**NOTED (not fixed — out of lever-10 territory):** the haven fight said
"You're on your own" with 12 villagers present — startCombat's party join
needs villagers within 4 squares with positions; day-1 haven positioning
is a party-system question (lever 3's territory).

## Village assessment (plain words)

*(pending sweep completion)*

## Proof test

`scripts/test-feastdraw-20261012.js`: **48/48 green**.
- Part 1 (mechanic, 32 checks): armed feast → draw (valid wave-appropriate
  cast); face → real fight → `feastSurgeUsed` marked + devotion spent;
  drive-off → pending cleared, devotion unspent, buff live, deed unmarked;
  unarmed feast → no draw; refresh → no second draw; expiry → the draw
  leaves with the fire; live wanderer → never clobbered; a wanderer
  clobbering the pending slot doesn't inherit the draw's veteran flag.
- Part 2 (before/after on identical setup, seed 201, separate processes —
  the harness's in-module eval lets food.js/justice.js clobber a second
  tree's sim-harness exports, so the two sides run isolated): pristine —
  granted, nothing comes (the r3 blank, reproduced); after — a mirrormoth
  circling, pending encounter set, the feast report names the draw.

## Files

- Game: `src/js/feastBuff.js` (drawFeastScavenger / feastDrawPending /
  faceFeastDraw / driveOffFeastDraw, grant hook on fresh grants only,
  expiry + mantle-pass cleanup, veteran flag read), `src/js/game.js`
  (startCombat reads s.feastDraw.veteran; hostFeast reports `draw`;
  feastPlan/hostFeast stranger-descriptor short names), `src/js/ledger.js`
  (mantle pass clears a pending draw), `src/js/app.js` (feast-draw panel
  copy + "Face it" routes through faceFeastDraw + "Let the watch drive it
  off" button) — **[needs-eyes]** (new combat encounter + player choice UI)
- Data: `src/data/feast-surge.json` (`feastDraw.chance: 1.0`, documented)
- Docs: `docs/PROGRESSION.md` (feast-surge §13: the draw), `docs/BALANCING.md`
- Policy: `scripts/policies/winseek.js` (feastDrawRoad — face the draw
  while feasted; the policy is deed-seeking and never drives it off)
- Proof: `scripts/test-feastdraw-20261012.js` (41/41)
- Instrument: `scripts/sweep-winpath.js` (draw counters: drawn/faced/driven-off)
- Diag: `scripts/diag-feastdraw-transcript-20261012.js` (sense-testing transcript)
- Data: `/tmp/wp-winpath-r4-baseline.json`, `/tmp/wp-winpath-r4-after.json`

## Regressions

- Ontology: 84/84 validated, "Release permitted"
- test-table-core-20261011: 31/31 green
- test-deed-gate-20261010: 68/68 green
- test-feastdraw-20261012: 48/48 green
