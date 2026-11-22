# sim-searvoice-a — PREREG (frozen)

**Arm:** sim-searvoice-a · **Loop A run:** fleshout-20261122T0215Z, arm 3 of 3
**Axis:** scale-onramp · **Type:** NARRATION FIX (no balance effect; default ON)
**Base master:** `4266e6cce` (Loop B sim-doorflee2-b; worktree
`~/workspace/worktrees/sim-searvoice-a`, rebased from `fc915f94d` —
zero local commits, clean fast-forward, no conflicts)
**Branch:** `sim-searvoice-a`
**Frozen:** 2026-11-22 ~03:20 UTC, before any judged run. No judged run has run.

## 1. The question (from the brief + the 2026-11-21 narration finding)

The forced-arrival fixture (sim-killlootfixture-a,
evidence/2026-11-21/sim-killlootfixture-a.md §2) proved a bundled
kill-loot searcaster reaches a fight and fires (arm 2 shots, ctl 0)
— but the volley reads as a bow: "nocks an arrow", "loosed wide —
the arrow buries itself in the dirt", "lowers the bow", and the
dry-gun line says "the string stays drawn, useless". The same gap
was already filed as finding #2623 (2026-11-20, sim-cellgate-a):
"the opening-volley log lines are bow-generic even for the
searcaster". This arm fixes the narration so a gun reads as a gun
(trigger / discharge / cells spent), keeping the bow lines for bows
exactly as-is. The 2026-11-21 finding and #2623 are the same defect
(one volley block, one fix); #2635 (gun-vanish / holder supply) is a
DIFFERENT issue and is NOT covered by this fix.

## 2. Code-read priors (from code on this base — hypotheses, not conclusions)

- Canon: docs/CANON.md read. **No canon doc covers field-fight
  volley narration.** The searcaster's own data is the anchor:
  `src/data/items.json` — id `searcaster`, name "Searcaster",
  `weapon: { type: 'ranged', range: 8, ammo: 'fusion_cell',
  damageType: 'energy' }`, flavor "A beam of focused starlight. It
  doesn't kill so much as unmake." Nothing in the fix quotes flavor
  text or invents canon; the new lines only name the weapon, the
  trigger, the discharge, and the cell spent.
- Volley block (`src/js/fieldFights.js`, :989–1081, verified
  post-rebase at :1045/:1053/:1071/:1073/:1078 — doorflee2
  `4266e6cce` did not touch these lines; its fieldFights.js changes
  are the ally-3 slot, DMGPIN/DOORFLEE2 gates, and per-round
  snapshots, all outside the volley block): `_rwId` is the equipped
  ranged weapon's item id; `_rdef` its data def; `_w.ammo` its ammo
  id; `_shots = min(ammo, clamp(1+floor(range/speed),1,4))`. The
  CELLGATE hold in the same block already branches on
  `_rwId === 'searcaster'` — this fix follows the block's own
  convention for identifying the gun. No discriminator exists in
  equipment.js (`volleyWeaponOf` classifies by ammo presence only),
  and the searcaster is the only energy gun in data, so the id check
  is the right discriminator. Crossbow (bolts) and sling (stones)
  also get bow lines today — OUT OF SCOPE for this arm; they keep
  the existing lines byte-identical (noted as a leftover in the
  evidence, not chased).
- The five bow lines, verbatim on this base (to be preserved for
  non-searcaster weapons):
  - dry: `... has <name> but no <ammo> — the string stays drawn, useless.`
  - opening: `... sees <m> coming and nocks an arrow — the fight opens at range (<n> shot[s]).`
  - hit: `  loosed — it takes <m> for <d> (<hp> left).`
  - miss: `  loosed wide — the arrow buries itself in the dirt. (spent)`
  - closing: `... lowers the bow — <m> is on them now. (<h>/<n> hit)`
- The fix branches ONLY on `_rwId === 'searcaster'`, inside the
  existing `_shots < 1` (dry) and `else` (firing) branches. No
  mechanic changes: shots, hit chance, damage, ammo spend, and the
  CELLGATE hold are untouched — only `rec.log` strings change. The
  CELLGATE hold line ("holds the Searcaster — ... the cells are saved
  for harder prey") is already gun-worded and is NOT changed.
- Frozen new gun lines (the test asserts these shapes):
  - dry: `... has <name> but no <ammo> — the trigger clicks on nothing.`
  - opening: `... sees <m> coming and raises the <name> — the fight opens at range (<n> shot[s]).`
  - hit: `  the <name> fires — it takes <m> for <d> (<hp> left).`
  - miss: `  fires wide — the discharge scorches the dirt beside <m>. (cell spent)`
  - closing: `... lowers the <name> — <m> is on them now. (<h>/<n> hit)`
  where `<name>` is `(_rdef.name || 'Searcaster')` (data name; 'Searcaster'
  in practice). The dry line falls back to `(_rdef.name || 'a gun')`,
  mirroring the old `(_rdef.name || 'a bow')`.

## 3. Instrument spec (frozen)

- Script: `scripts/test-searvoice-a.js` (new). It runs the
  forced-arrival fixture (`scripts/test-killlootfixture-a.js`) both
  legs (+ determinism reruns) with the full pilot substrate env
  (`VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`,
  arm leg adds `KILLBUNDLE=1`), then runs the fixture's `--compare`,
  then asserts the searvoice bars on the transcripts.
- Fixture outputs for THIS arm go to `evidence/2026-11-22/` (not
  the prior arm's `evidence/2026-11-21/` — its judged JSONs must not
  be overwritten). One-line, default-identical change to
  `scripts/test-killlootfixture-a.js`: `EVIDENCE_DIR` reads
  `KILLLOOTFIXTURE_EVIDENCE_DIR` when set, else the old
  `evidence/2026-11-21` path. No judged behavior changes.
- One command judges everything: `node scripts/test-searvoice-a.js`
  (exit 0 = all bars pass). RED check first: run it BEFORE the fix —
  S1/S2/S3 must FAIL (bow lines still present) while S5 passes
  (mechanics unchanged) — proving the test detects the defect.
- Volley-line identification (wording-independent): the opening line
  contains 'the fight opens at range'; shot lines start with two
  spaces and contain 'loosed' or 'fires'; the closing line contains
  'is on them now'.

## 4. Definitions (frozen)

- **Volley lines:** the opening line + each shot line + the closing
  line of a leg's `rec.log`, as identified in §3.
- **Bow language:** any of the phrases 'nocks an arrow',
  'the arrow', 'lowers the bow', 'string stays drawn' appearing in a
  transcript.
- **Gun language:** the arm opening contains 'raises the Searcaster';
  each arm shot line contains 'fires' (miss lines additionally
  '(cell spent)'); the arm closing contains 'lowers the Searcaster';
  the ctl dry line contains 'no fusion cells' AND 'trigger'.
- **Instrument errors:** any exception or failed assertion inside
  the fixture's or this script's own wraps/checks (0 required).

## 5. Seed band

- No band. This arm judges transcript assertions on the staged
  fixture (seed 7, same as killlootfixture-a). No new seeds are
  spent; no band-freshness check is owed.

## 6. Frozen bars (judge: scripts/test-searvoice-a.js)

| # | Bar | Threshold |
|---|---|---|
| S1 | **Arm gun voice** — arm volley lines carry gun language: opening 'raises the Searcaster', every shot line 'fires' (miss lines '(cell spent)'), closing 'lowers the Searcaster'; shot-line count === `rec.volley.shots` (2) | all must hold |
| S2 | **Arm no bow language** — the WHOLE arm transcript contains none of 'nocks an arrow', 'the arrow', 'lowers the bow', 'string stays drawn' | must hold |
| S3 | **Ctl honest dry-gun line** — ctl transcript contains 'no fusion cells' AND 'trigger'; ctl transcript contains no 'string stays drawn'; `ctl.volley.shots === 0` | all must hold |
| S4 | **Bow lines preserved (source-level)** — `src/js/fieldFights.js` still contains the four original bow strings verbatim: 'nocks an arrow', 'loosed — it takes', 'loosed wide — the arrow buries itself in the dirt. (spent)', 'lowers the bow' | all must hold |
| S5 | **Fixture still GO** — the fixture's `--compare` on the refreshed legs exits 0 (its bars 1–6 as frozen in the killlootfixture-a prereg: arrival, volley, determinism, neutrality, instrument) | must hold |
| S6 | **Determinism** — arm/ctl rerun JSONs match the primary legs on judged fields AND on the volley-line slices | both must hold |

GO = S1–S6 all pass. GO means: a searcaster volley now reads as a
gun firing and a dry searcaster reads as a gun with no cells, the bow
lines survive untouched for bows, and the fixture that proved the
bundle fires still passes. NO-GO = any bar fails; a miss is NO-GO,
never re-scored against a friendlier metric mid-run (§14). The
change is narration-only and default ON: no env gate. If a reviewer
path treats narration as balance, the evidence says why it stays
ungated (no mechanic changes — shots, hit chance, damage, ammo
spend identical; an env gate would ship the gun still "nocking
arrows" by default, defeating the fix).

## 7. Run plan (frozen)

- **Pre-flight (NOT judged):** `node
  scripts/test-killlootbundle-a.js` (expect 12/12) and `node
  scripts/analyze-killlootbundle-a.js --selftest` (expect 17/17) on
  the rebased base. Proceed on green.
- **RED run (NOT judged, proves the instrument):**
  `node scripts/test-searvoice-a.js` before the fix — expect S1/S2/S3
  fail, S5 pass.
- **Judged run:** apply the fix, then `node
  scripts/test-searvoice-a.js` — expect all bars pass, exit 0.
- **Sense-test (judged reading, not a count):** read both
  transcripts aloud in the evidence — the volley must read as a gun
  firing, the rest of the fight unchanged (compare against the
  killlootfixture-a transcripts: same holder, same allies, same
  monster, same outcome shape).
- **Post-commit re-run:** after committing the fix, re-run `node
  scripts/test-searvoice-a.js` once so the JSONs carry the fix
  commit as `anchorCommit`; assertions must be identical.
- **Gate:** `node scripts/check.js --quick` after the change.
- **Canon:** no canon doc covers volley narration — said here
  rather than inventing canon.

## 8. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
