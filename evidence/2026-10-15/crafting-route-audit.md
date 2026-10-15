# Crafting: usable outputs and knowledge access

Follow-up to Steve's playstyle/gear audit. Local branch `codex/resume-claude`;
no release, version bump or remote push. Broader roadmap goal remains active.

## Findings and fixes

1. **Crafted arrows and bolts could not fire.** `craft()` makes a real
   `itemId` stack, while `ammoCount`/`spendAmmo` accepted only `material`.
   The bow/crossbow reported no ammunition despite a successful batch of five.
   Both readers now use the same material-or-item identity. Explicit material
   wins; spent ID-only stacks disappear. Existing saves need no migration.
   The fix also makes ID-only fusion cells usable by a weapon that asks for
   them; it does not change ammunition prices, yield, damage or range.
2. **The Pack printed success after failure.** Its craft handler always set
   “✓ Crafted.” after failed rolls or missing materials. It now sets that
   receipt only for an actual successful craft; failure narration remains.
3. **Knowledge remains the larger natural bottleneck.** Ordinary policies
   repeatedly attempted arrows without a successful craft. See measurements
   below. Repairing ammunition does not establish a balanced maker career.

Steve's direct 2026-10-03 statements in `docs/DECISIONS.md` describe crafting
as survival supplies and knowledge discovery, and “It's a knowledge game,
not a crafter.” The adjacent “Gear comes from achievements/monsters” sentence
is a design summary, not a direct quote. Later basic gear recipes are real
and remain supported. The preceding audit's proposed advanced recipe ladder
was an Agent recommendation, not a settled requirement from Steve. The
roadmap now says to improve real supplies and earned reward access first.

Reasoning: a larger recipe ladder could distinguish makers, but would also
add grind and could hide existing broken outputs. Fixing those outputs and
measuring access is justified now; adding magical material production is not.

## Reproducible screen

Current observer, standard `sweep-compare` driver, same policy bytes and
16 seed list, 150 days, four child processes. Frozen baseline
`.git/gear-proof-after`; frozen fix `.git/craft-proof-after`. The only source
hash difference between matrix arms is `src/js/game.js` (ammunition identity).
The later Pack receipt edit is UI-only and is excluded by the harness;
its browser proof and suite checks are separate. Each raw JSON retains all
source hashes; `sourceHead` alone does not describe uncommitted frozen files.

Commands:

```text
node scripts/gear-usage-audit.js --label craft-before-16 --n 16 --days 150 --par 4 --policies capable,maker --root .git/gear-proof-after
node scripts/gear-usage-audit.js --label craft-after-16 --n 16 --days 150 --par 4 --policies capable,maker --root .git/craft-proof-after
```

| Policy | Table wins before → after | Seats | Bearer deaths | Observer/policy errors |
|---|---:|---:|---:|---:|
| capable | 12 → 13 / 16 | 15 → 16 | 17 → 17 | 0 → 0 |
| maker | 7 → 7 / 16 | 9 → 9 | 11 → 11 | 0 → 0 |

This is a bug/reachability screen, **not evidence of a win-rate increase**.
Any small balance claim still needs at least 64 matched seeds. Existing
ID-only ammunition can change trajectories even where no arrows are crafted.

After arm: runs with recipe known / runs sampled with its materials ready:

| Recipe | capable | maker |
|---|---:|---:|
| arrow | 0 / 0 | 1 / 1 |
| bolt | 2 / 0 | 1 / 1 |
| bow | 4 / 0 | 6 / 0 |
| crossbow | 6 / 0 | 5 / 0 |
| bark armor | 16 / 2 | 16 / 1 |
| hide armor | 0 / 0 | 0 / 0 |
| water filter | 16 / 0 | 16 / 0 |
| snare | 16 / 12 | 16 / 10 |

“Known” includes L1 blind knowledge; neither policy reached arrow L2.
Samples include succession and represent run access, not one person's
learning rate. Brief material availability between samples can be missed.
The maker deliberately requires L2 for its own equipment crafts; these rows
do not show that a human cannot make an L1 attempt.

Actual attempts/successes after: capable arrows 661/0, stone knives 14/13,
snares 68/58, bark armor 2/1; maker arrows 619/0, knives 13/12, snares 72/68,
bark armor 1/1. Failure reasons are not individually classified. Knowledge,
materials and bot choices must be investigated before raising craft rates.
The observer now records per-recipe attempts/successes and sampled knowledge
and materials without calling lazy discovery helpers.

Raw evidence: `gear-usage-craft-before-16.{json,md}` and
`gear-usage-craft-after-16.{json,md}` in this directory.

## Proof and playtest

- `test-crafted-ammo-20261015.js`: same 22 assertions against the frozen
  baseline give 10 pass / 12 fail; fixed runtime gives 22 pass / 0 fail.
  It pays actual materials through public `craft`, equips each weapon, starts
  a real fight and calls Strike; checks target damage, round spending,
  exhaustion, old ID stacks and unrelated inventory preservation.
- `test-gear-usage-audit-20261015.js`: 10 assertions, including actual recipe
  counters and a 100-day observer-on/off full gameplay state hash comparison.
- Prepared browser fixture on a fresh local origin, 390×844 viewport: click
  real Pack Make buttons, Equip, then Strike. Five crafted arrows become
  four and the action is spent. See `crafted-arrow-phone.png`.
- Second UI probe: after consuming both bow material sets, Make reports
  “Need 1 wood (have 0)” with no “Crafted” receipt. See
  `craft-missing-materials-phone.png`.
- Fixtures provide knowledge/materials and target placement. They prove the
  playable action chain, not organic acquisition frequency. Initial debug
  refresh and fixture timer errors were corrected by loading `?debug=1` and
  preparing a run before observation. Tests were repeated on a clean origin
  to avoid local service-worker cache ambiguity. Temporary servers stopped,
  test tab closed, viewport restored.

One full-suite run hit a legacy T5 clock race: its hand-built state lacked
`startedAt`, so asking `saveKey` and saving across a millisecond boundary
produced different expected/actual keys. The fixture now pins the timestamp;
all persistence assertions are retained. No save runtime change was needed.

## Remaining work

- Audit real recipe-learning sources and public material gathering, especially
  arrows/bolts, bow staves, charcoal and hide. The bot's repeated unknown
  arrow calls are not a working livelihood.
- Establish a deliberate maker/knowledge career's route to earned advanced
  rewards without requiring monster progression or a material grind.
- Probe preservation, pemmican, storage, communal gear and peer/party systems
  through actual public actions. Zero sweep calls are coverage gaps.
- Audit named special ammunition (e.g. Heartseeker Arrows) separately: this
  patch does not implement descriptive bonus text or alias every ammo name.
- Desktop Pack interaction was unreliable in the large viewport during this
  prepared fixture; the phone route worked. Reproduce with an ordinary run
  before classifying it as a game defect or claiming desktop coverage.

Final verification counts are recorded in `crafting-route-validation.json`.
