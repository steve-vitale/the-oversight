# sim-crossvoice-a — PREREG (frozen)

**Arm:** sim-crossvoice-a · **Loop A run:** fleshout-20261122T0815Z, arm 1 of 1
**Axis:** scale-onramp · **Type:** NARRATION FIX (no balance effect; default ON)
**Base master:** `e67224635` (Loop A 0215Z adoption round record;
worktree `~/workspace/worktrees/sim-crossvoice-a`)
**Branch:** `sim-crossvoice-a`
**Frozen:** 2026-11-22 ~09:10 UTC, before any judged run. No judged run has run.
Exploration before freezing (NOT judged): the crossvoice fixture was
probed at seed 7 for all four weapons, armed + dry, to confirm the
setup gates pass and to see whether hit lines are observable — see §2.
The probe is instrument calibration, not a judged run; the bars below
are frozen on what it showed.

## 1. The question (from the brief + the searvoice §5/§6 leftover)

The searvoice arm proved a searcaster volley reads as a gun — but the
volley block's bow lines are still generic for every non-searcaster
ranged weapon: a crossbow also "nocks an arrow" and "lowers the bow",
a sling too (only their *dry* line names the right ammo, via #2593).
Same defect class, different weapons, deliberately left byte-identical
by searvoice's frozen scope. This arm branches the volley lines by
weapon so crossbow lines read as a crossbow (crank / bolt), sling
lines as a sling (whirl / stone), bow lines survive byte-identical
for bows, and searcaster gun lines survive byte-identical.

## 2. Code-read priors + probe results (from code on this base — hypotheses, not conclusions)

- Canon: docs/CANON.md read. **No canon doc covers field-fight
  volley narration.** The weapon data is the anchor:
  `src/data/items.json` — crossbow ("Crank, lock, loose. Less art
  than the bow, more certainty."; range 6, ammo `bolt`, +28), sling
  ("Two cords and a pouch. David's technology, still working.";
  range 4, ammo `stone`, +8), phase_sling ("The pouch phases half a
  second ahead of your hand."; range 5, ammo `stone`, alien tier 2),
  bow (range 5, ammo `arrow`, +22). Nothing in the fix quotes flavor
  text or invents canon; the new lines only name the weapon, its
  mechanism (crank / pouch), and the ammo spent. Full ranged census
  on this base: sling, crude_bow, bow, crossbow, phase_sling,
  starfall_bow, searcaster, apex_bow. The bow branch is the `else`
  for every non-gun, non-crossbow, non-sling weapon — so crude_bow,
  starfall_bow and apex_bow keep the bow lines too, as bows should.
- Volley block (`src/js/fieldFights.js`, :989–1090 on this base):
  `_rwId` is the equipped ranged weapon's item id; `_rdef` its data
  def; `_w.ammo` its ammo id. Searvoice added `_isGun =
  (_rwId === 'searcaster')` at :1007. This arm adds `_isCrossbow =
  (_rwId === 'crossbow')` and `_isSling = (_rwId === 'sling' ||
  _rwId === 'phase_sling')`, following the block's own convention.
  No discriminator exists in equipment.js (`rangedWeaponOf` returns
  the equipped slot; `volleyWeaponOf` classifies by ammo presence
  only), and the id check is the right discriminator for narration.
  The fix branches ONLY the five log lines, inside the existing
  `_shots < 1` (dry) and `else` (firing) branches. No mechanic
  changes: shots, hit chance, damage, ammo spend, and the CELLGATE
  hold are untouched — only `rec.log` strings change. The CELLGATE
  hold line ("holds the Searcaster — …") is already gun-worded and
  is NOT changed.
- The five bow lines, verbatim on this base (to be preserved for
  bows — crude_bow, bow, starfall_bow, apex_bow — and for no other
  weapon after this fix):
  - dry: `... has <name> but no <ammo> — the string stays drawn, useless.`
  - opening: `... sees <m> coming and nocks an arrow — the fight opens at range (<n> shot[s]).`
  - hit: `  loosed — it takes <m> for <d> (<hp> left).`
  - miss: `  loosed wide — the arrow buries itself in the dirt. (spent)`
  - closing: `... lowers the bow — <m> is on them now. (<h>/<n> hit)`
- Frozen new lines (the test asserts these shapes):
  - crossbow dry: `... has <name> but no <ammo> — the crank clicks on nothing.`
  - crossbow opening: `... sees <m> coming and cranks a bolt into place — the fight opens at range (<n> shot[s]).`
  - crossbow hit: `  loosed — the bolt takes <m> for <d> (<hp> left).`
  - crossbow miss: `  loosed wide — the bolt buries itself in the dirt. (spent)`
  - crossbow closing: `... lowers the <name> — <m> is on them now. (<h>/<n> hit)`
  - sling dry: `... has <name> but no <ammo> — the pouch hangs empty.`
  - sling opening: `... sees <m> coming and whirls the <name> — the fight opens at range (<n> shot[s]).`
  - sling hit: `  loosed — the stone takes <m> for <d> (<hp> left).`
  - sling miss: `  loosed wide — the stone skips away into the dirt. (spent)`
  - sling closing: `... lowers the <name> — <m> is on them now. (<h>/<n> hit)`
  where `<name>` is `_rdef.name` ('Crossbow' / 'Sling' / 'Phase sling'
  in practice; the dry line falls back to 'a crossbow' / 'a sling',
  mirroring the old `(_rdef.name || 'a bow')` and searvoice's
  `(_rdef.name || 'a gun')`). "loosed" is kept for crossbow/sling
  hits and misses: the crossbow's own flavor is "Crank, lock,
  loose", and a sling looses its stone — what changes is the ammo
  noun (bolt / stone, never arrow) and the mechanism words.
- **Probe (pre-freeze, NOT judged):** the crossvoice fixture
  (`scripts/crossvoice-fixture-a.js`, seed 7, holder `gen_v5jnyte` +
  2 allies vs the Herald, wave 4) ran armed + dry for all four
  weapons. Setup gates all passed. Armed volleys at seed 7:
  crossbow 3 shots / 3 HITS / 60 dmg; sling 2/2/22; phase_sling
  2/2/50; bow 2/2/36 — **hit lines ARE observed for crossbow,
  sling and phase_sling at the frozen seed**, answering the
  searvoice §5 warning for this arm (no seed sweep was needed:
  the first seed tried observes all three hit lines). No MISS line
  was observed at seed 7 (every shot hit); the miss lines are
  asserted by construction — S1 requires the frozen miss strings
  verbatim in source. Dry legs: all 0 shots (vFlee R11); dry lines
  pre-fix all read "the string stays drawn, useless" even for the
  sling ("has Sling but no stones — the string stays drawn"). The
  probe also confirmed the defect verbatim in the armed legs
  ("nocks an arrow", "lowers the bow" for a crossbow and a sling).
  The probe's armed JSONs did NOT land on disk (host write flap
  refused all three writes, `@@FALLBACK` to stdout; the payloads
  are quoted in the run record); the dry JSONs landed. The judged
  runs regenerate every leg, so no probe file is judged evidence.

## 3. Instrument spec (frozen)

- Scripts: `scripts/crossvoice-fixture-a.js` (new — staged volley
  fixture, mirrors `scripts/test-killlootfixture-a.js` in shape:
  same harness seed-7 load, same holder + 2-ally party, same
  wave-4 Herald door fight, same `fieldFight` call; only the staged
  ranged weapon differs — granted directly to the holder because
  the staged weapon IS the test input, where the searcaster fixture
  stages its gun through the kill-loot path because that path is
  what it tests. The holder carries ONLY the staged weapon + exactly
  N ammo: every other ranged weapon is stripped first — a bow would
  otherwise win the ranged slot over a sling on bonus — and every
  entry the volley block would count as this weapon's ammo (id OR
  material match; a stone-material tool is sling ammo) is stripped
  before exactly N are granted. Allies are untouched: only the lead
  fighter volleys — one 'the fight opens at range' site in
  fieldFights.js — so allies cannot pollute the transcript.) and
  `scripts/test-crossvoice-a.js` (new — the judge).
- The judge runs the crossvoice fixture for crossbow, sling,
  phase_sling and bow (armed + dry + armed rerun each), then the
  killlootfixture-a legs (ctl/arm + reruns) + `--compare`, then
  asserts the crossvoice bars. Fixture outputs for THIS arm go to
  `evidence/2026-11-22/` (crossvoice-a-*.json; the killlootfixture
  refresh overwrites searvoice's 2026-11-22 killlootfixture JSONs
  with identical content except `anchorCommit` — the gun lines are
  untouched by this fix).
- One command judges everything: `node scripts/test-crossvoice-a.js`
  (exit 0 = all bars pass). RED check first: run it BEFORE the fix —
  S1/S2/S3 must FAIL (bow lines still present on crossbow/sling)
  while S4's source half passes and S5/S6 pass — proving the test
  detects the defect.
- Volley-line identification (wording-independent): the opening line
  contains 'the fight opens at range'; the closing line contains
  'is on them now'; shot lines are the two-space-indented lines
  strictly between them; the dry line contains 'but no '. A shot
  line with 'wide' is a miss, without it a hit.

## 4. Definitions (frozen)

- **Volley lines:** the opening line + each shot line + the closing
  line of a leg's `rec.log`, as identified in §3.
- **Bow language:** any of the phrases 'nocks an arrow',
  'the arrow', 'lowers the bow', 'string stays drawn' appearing in
  a transcript.
- **Gun language:** any of 'Searcaster', 'fires', 'cell spent',
  'trigger' appearing in a transcript (a crossbow/sling transcript
  must contain none of these either — the fix must not trade bow
  words for gun words).
- **Crossbow voice:** opening 'cranks a bolt into place', every
  shot line 'the bolt' (miss lines additionally '(spent)', hit
  lines 'takes'), closing 'lowers the Crossbow'.
- **Sling voice:** opening 'whirls the Sling' / 'whirls the Phase
  sling', every shot line 'the stone' (miss lines additionally
  '(spent)', hit lines 'takes'), closing 'lowers the Sling' /
  'lowers the Phase sling'.
- **Instrument errors:** any exception or failed assertion inside
  the fixture's or this script's own wraps/checks (0 required).

## 5. Seed band

- No band. This arm judges transcript assertions on the staged
  fixture (seed 7, same as killlootfixture-a). No new seeds are
  spent; no band-freshness check is owed. Seed 7 was confirmed by
  the pre-freeze probe to observe crossbow, sling and phase_sling
  hit lines (3/2/2 hits) — no sweep was needed.

## 6. Frozen bars (judge: scripts/test-crossvoice-a.js)

| # | Bar | Threshold |
|---|---|---|
| S1 | **Crossbow/sling voice** — armed legs for crossbow, sling, phase_sling: opening carries the frozen weapon marker ('cranks a bolt into place' / 'whirls the Sling' / 'whirls the Phase sling'), every shot line carries the ammo noun ('the bolt' / 'the stone'; hit lines 'takes', miss lines '(spent)'), closing carries the frozen marker ('lowers the Crossbow' / 'lowers the Sling' / 'lowers the Phase sling'); shot-line count === `rec.volley.shots`; a hit line is OBSERVED for each weapon (`volley.hits >= 1`); the frozen miss string exists verbatim in source (miss lines unobserved at seed 7 — asserted by construction) | all must hold |
| S2 | **No bow language, no gun language** — the WHOLE transcript (armed + dry) of crossbow, sling and phase_sling contains none of 'nocks an arrow', 'the arrow', 'lowers the bow', 'string stays drawn', and none of 'Searcaster', 'fires', 'cell spent', 'trigger' | must hold |
| S3 | **Dry lines honest, weapon words** — each dry leg's dry line names the right ammo ('no crossbow bolts' / 'no stones' / 'no arrows') AND the weapon tail ('the crank clicks on nothing' / 'the pouch hangs empty' / 'the string stays drawn, useless'); `volley.shots === 0` on every dry leg; crossbow/sling/phase_sling dry transcripts contain no 'string stays drawn' anywhere | all must hold |
| S4 | **Bow lines preserved, source-level AND in use (REVISED per the searvoice §5 metric review — source presence alone is no longer sufficient once another weapon branches off)** — `src/js/fieldFights.js` still contains the four original bow strings verbatim ('nocks an arrow', 'loosed — it takes', 'loosed wide — the arrow buries itself in the dirt. (spent)', 'lowers the bow') AND the bow armed leg still opens 'nocks an arrow' and closes 'lowers the bow', its shot lines are the old bow lines byte-identical, and its dry leg still says 'string stays drawn' | all must hold |
| S5 | **Fixture still GO** — the killlootfixture-a `--compare` on the refreshed legs exits 0 (its bars 1–6 as frozen in the killlootfixture-a prereg: arrival, volley, determinism, neutrality, instrument) | must hold |
| S6 | **Determinism** — armed rerun JSONs match the primary legs on judged fields AND on the volley-line slices, all four weapons | both must hold |

GO = S1–S6 all pass. GO means: a crossbow volley now reads as a
crossbow, a sling volley as a sling, a dry crossbow/sling reads its
own mechanism honestly, the bow lines survive untouched for bows
(in source AND in use), the searcaster fixture still passes, and
the run is deterministic. NO-GO = any bar fails; a miss is NO-GO,
never re-scored against a friendlier metric mid-run (§14). The
change is narration-only and default ON: no env gate. If a reviewer
path treats narration as balance, the evidence says why it stays
ungated (no mechanic changes — shots, hit chance, damage, ammo
spend identical; an env gate would ship the crossbow still "nocking
arrows" by default, defeating the fix).

## 7. Run plan (frozen)

- **Pre-flight (NOT judged, done):** `node
  scripts/test-killlootbundle-a.js` (12/12) and `node
  scripts/analyze-killlootbundle-a.js --selftest` (17/17) on the
  base. Green.
- **RED run (NOT judged, proves the instrument):**
  `node scripts/test-crossvoice-a.js` before the fix — expect
  S1/S2/S3 fail, S4 source half pass / usage half pass (bows still
  use the lines pre-fix), S5/S6 pass.
- **Judged run:** apply the fix, then `node
  scripts/test-crossvoice-a.js` — expect all bars pass, exit 0.
- **Sense-test (judged reading, not a count):** read the crossbow,
  sling, phase_sling and bow transcripts aloud in the evidence —
  each volley must read as its own weapon firing, the rest of each
  fight unchanged (same holder, same allies, same monster, same
  outcome shape as the probe legs).
- **Post-commit re-run:** after committing the fix, re-run `node
  scripts/test-crossvoice-a.js` once so the JSONs carry the fix
  commit as `anchorCommit`; assertions must be identical.
- **Gate:** `node scripts/check.js --quick` after the change
  (load permitting — see searvoice §4 for the load-starved
  precedent; record honestly if it cannot complete).
- **Canon:** no canon doc covers volley narration — said here
  rather than inventing canon.

## 8. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
