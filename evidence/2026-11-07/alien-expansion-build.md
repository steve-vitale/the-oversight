# Alien expansion build — evidence (2026-11-07)

Steve approved 2026-11-07 16:55 CST: roster 8 → 12; alien players are
meddlers, not contestants ("more like adversarial villagers. Monsters
with intelligence and personality, characters."); the twelve must range
across real personalities (meddling, benign, neutral, dutiful
executioner, raging psychopath, spoiled child). Build worker:
build-alien-expand worktree. No push, no version bump, no live check
(per task).

## What changed

### Data — `src/data/alienPlayers.json` (8 → 12)
Four new personas, following the existing entry schema exactly
(backstory, motivation, voice, disposition, signature, abilityKit,
alienTech, combatLines onHit/onHurt/onWinning/onLosing/unhinged,
intro/escalation/defeat/victory/taunt lines, wealth, experience,
combat flag), plus the new `meddlerMoves` array (2 moves each:
`{id, name, lean, line}` — lean is the contest winMod delta):

| Persona | Disposition | Species | Wealth | Exp. | Combat | Meddler moves |
|---|---|---|---|---|---|---|
| Quill, the Adjuster | meddling | Burlap | comfortable | veteran | yes | Re-file the scorecards (−0.06); Correct a scoring error (+0.04) |
| Kess, Warden of the Ledger | dutiful | Meridian | comfortable | veteran | yes | Serve a warrant (−0.05); Read the rules aloud (+0.04) |
| Howl, the Unmade | raging | Unmade | broke | veteran | yes | Scream at the judges (−0.08); Scream at your opponent (+0.06) |
| Bibi, Heir to the Ninth Dynasty | spoiled | Vexari | rich | rookie | yes | Buy the judges (−0.08); Bored, throws a gift (+0.06) |

- Signature lines (Steve's brief, verbatim) are each persona's
  `introLines[0]` and also appear in their `unhinged` combat lines.
- Bibi's rivalry with Vex Marlowe (Third Dynasty vs Ninth Dynasty) is
  named in backstory, motivation, and rivalry.
- All 6-ability kits use real pool ids only (verified against
  `src/data/abilities.json`); all alien tech is new ids (no collisions
  with the stasis-field scan or the beam path).
- The old eight personas have NO `meddlerMoves` — they were not forced
  into a move set they were never written with.

### Code — `src/js/alienPlayers.js` (data first, minimal wiring)
- `apMeddlerMoves(pid)` accessor (data → code, same pattern as
  `apAbilityKit`/`apAlienTech`); added to the `provides:` list.
- `apContestInterference`: meddler pass, verdict-only, after the
  sadistic rig and only if no rig fired (one interference per contest),
  max 1 meddle per 5 days (`ap.lastMeddleDay`), needs encounters ≥ 1,
  dead personas meddle nothing, never fires on the forPlayer
  killing-blow path (that path is the lifeline's alone). Draws use the
  contest-seeded `_apContestDraw`, never `Math.random`. Lines are
  knowledge-gated ("Someone in the judging booth" pre-reveal).
- New dispositions handled explicitly everywhere the code keys off
  disposition — nothing falls through silently:
  - `apDispositionWeight` / `apActivationWeight`: explicit weights for
    all seven (encounter 4/4.5/1.5/4/3/4.5/3; activation 3/2/1/3/2/3/2).
    Original-three numbers unchanged.
  - `apPlaygroundAction`: explicit branches — Quill raids (re-files),
    Kess kills-by-warrant / confiscates, Howl kills erratically (never
    burns/raids), Bibi raids by hired hands or watches, bored.
  - `apPersonaPackage`: explicit branches — Quill forged letter +
    100 kcal re-filed snacks; Kess warrant notice (no gift, honest
    copy); Howl smashed box + scream (nothing usable); Bibi 400 kcal
    + wacky curio via `apWackyGift`/`apGrantItem`.
  - `apFactionAligned`: explicit cross-pair rules for the new four
    (meddling works briefly with almost anyone; dutiful with anyone
    procedural; raging with almost no one; spoiled buys alignment).
    Unlisted pairs are never aligned — stated, not defaulted.
  - `apBuildFighter`: Bibi −10 HP (sloppy fighter), Howl +10 HP
    (fights wild); Quill/Kess at par.
  - `apApplyWealthStance`: enrage line for Bibi (rich); retreat lines
    for Howl (broke), Quill, Kess — no generic fallback for the new four.
  - `apMaybeBeamAttack`: named beams for all four (Quill's ledger beam,
    Kess's warrant beam, Howl's raw beam, Bibi's daddy-bought beam).
    All four field beams via the existing `apHasBeam` rule (combat, not
    Old Tam).
  - Deliberately untouched (explicit single-disposition filters, not
    fall-throughs): sadistic-only rigging/gossip/due-rival, benevolent-
    only lifeline/bond/dead drops, neutral-only boredom, sadistic beam
    bonus, `apIsArsonist` (Sable/Vex only), group-encounter roll
    (disposition-free), group banter (explicit generic fallback).
- Header + rules updated: seven dispositions, meddlers-not-contestants
  framing, `(meddling)` and `(dispositions)` rules.

### Docs
- `docs/ALIEN-PLAYERS.md`: rewritten framing for 12 meddlers / 7
  dispositions; roster table, disposition list, encounter weights,
  playground behaviors, contest meddler moves, package branches, beam
  names, HP tweaks; Q1/Q3 marked answered 2026-11-07, Q2 stays open.
  Every previously verified code-grounded claim kept.
- `docs/godpath/STEVE-ANSWERS.md`: new top entry dated 2026-11-07 with
  Steve's words verbatim (12-meddlers ruling, spectrum ruling,
  "Yes proceed with those aliens" approval 16:55 CST).
- `docs/OPEN-QUESTIONS.md`: Q1 and Q3 deleted (answered, per the
  file's format rule). Q2 ("stranger" overload) STAYS — default stands,
  both keep the word. Q4 untouched. Numbers not renumbered.
- `docs/CANON.md`: changelog line for the expansion.
- `docs/ONTOLOGY.md`: regenerated by `scripts/validate-ontology.js`
  (sanctioned validator output — new description, the 3 new provides,
  the 2 new rules). Required for the ontology to stay green.

### Proof — `scripts/test-alien-expansion-20261107.js`
Shared kit only (`scripts/godpath/lib.js`); no copied eval boilerplate,
no hardcoded absolute paths; writes nothing into the repo. Added to
`scripts/green-list.txt` (full check runs it; not `quick`-tagged).

## Proof results

`node scripts/test-alien-expansion-20261107.js` → **214 passed,
0 failed** (seed 20261107):

- 12 personas load; dispositions 3 sadistic / 3 neutral / 2 benevolent /
  1 meddling / 1 dutiful / 1 raging / 1 spoiled; ids unique.
- Every entry schema-complete (all fields above present and non-empty;
  combat personas: 6 real abilities, 0–2 tech pieces, all 5 combat-line
  keys ≥ 2 lines; Wren exempt as non-combat).
- Each new persona: exact disposition/wealth/combat/experience, signature
  line as `introLines[0]` and in `unhinged` lines; Bibi rivalry names
  Vex Marlowe / Third Dynasty in backstory, motivation, rivalry.
- Each new persona has ≥ 2 meddler moves, each `{id, name, lean, line}`
  with lean in [−0.1, 0.1]; old eight have none.
- Grep-assert: `contests.js` and `contestEngine.js` contain no
  `apBuildFighter` and no `alienPid`; `contests.js` still calls
  `apContestInterference` (the meddle path).
- Live (harness): `apPersonas()` = 12; weight helpers return the
  documented numbers for all seven dispositions (+ defaults);
  `apMeddlerMoves` returns 2 per new persona, [] for Vex.
- Live fighters: hostile persons, pre-reveal name "Stranger",
  progressive kit starts at 3, HP 80 Quill / 80 Kess / 90 Howl / 70 Bibi.
- Live encounter weighting (3000 rolls, readiness 105, wave 2): every
  new persona picked (Quill 20, Kess 20, Howl 23, Bibi 22); no invalid
  picks. (Setup note: `apEncounterEligible` is wrapped by the readiness
  gate — score ≥ 100 needs 2 allies + day 30+ + System integration;
  the first probe failed on this before the setup was corrected.)
- Live meddling: each new persona's moves fire through
  `apContestInterference` within 40 contests; the note carries its own
  move line, `winMod` equals the move's lean exactly, the note stays
  anonymous pre-reveal, no death-save; never fires on the forPlayer
  path (20 tries each); a dead Quill never meddles (40 tries); the Vex
  sadistic rig still fires (no regression).
- Live disposition paths: Quill+Howl can align; Howl never aligns with
  Bibi/Sarge; playground actions and persona packages run without
  throwing for all four.

## Gate

`node scripts/check.js --quick` in this worktree only — see
`alien-expansion-gate.log` (this directory). Two runs (the first found
one real failure, fixed below; the second is the final state):

- Run 1: **281 passed, 9 failed** (990s).
- Run 2 (final): **282 passed, 8 failed** (1051s).

The 8 remaining failures are all pre-existing on this base or
environmental — none is caused by this build. Triage (proven against a
pristine HEAD extract in /tmp, since removed):

- `test-measurement-proof-update.js` + `test-measurement-workflow.js`
  — PRE-EXISTING. The balance manifest hashes all of `src/`; the
  retained panel was already 10 files stale at HEAD (food.js, game.js,
  party.js, villager-build.js, sweep-compare.js, 5 policy files). This
  build adds only its own 2 files to the list. A refresh needs a fresh
  REAL observer-neutral panel (`scripts/balance-proof-update.js`) —
  not fabricated here.
- `test-phone-frame-proof.js` — PRE-EXISTING. The retained phone proof
  was already 75 files stale at HEAD; this build adds only its own 2
  files. A refresh needs real browser receipts (MOBILE-PLAYTEST.md) —
  not fabricated here.
- `test-mobile-combat-cadence.js` — PRE-EXISTING. Fails identically
  (13 passed, 2 failed, same assertions) on the pristine HEAD extract.
- `test-occupation-panels.js` — PRE-EXISTING. Fails identically
  (0 passed, 1 failed) on the pristine HEAD extract.
- `test-establishment-r20-fixes-20261020.js` — PRE-EXISTING by
  deduction: it diffs `src/js/game.js` (current vs an old ref) and
  asserts on racks-full voice gating; `game.js` is untouched by this
  build, so its outcome cannot differ from HEAD.
- `test-capable-bot-20261014.js`, `test-table-endings-20261014.js` —
  ENVIRONMENTAL (120s gate timeouts under 4-parallel load). Both pass
  standalone in this worktree: capable-bot 42 passed / 0 failed (~82s),
  table-endings 61 passed / 0 failed (~98s). `test-trust-observer-
  neutrality.js` did the same in run 1 (timeout in gate, 6/6 standalone
  in ~87s) and passed in run 2.

The one failure this build DID cause, found by run 1 and fixed:
`test-foodpower-20261014.js` — the ontology validator requires a
`(code:)` citation on every header rule; the two new rules in
`alienPlayers.js` lacked one. Fixed by adding the citations; the
validator regenerated `docs/ONTOLOGY.md` (description + the 3 new
provides + the 2 new rules — included in the commit). After the fix:
`validate-ontology.js` green (134 systems), foodpower 30/30, proof
test still 214/214.

## Open questions / follow-ups

- Phone-feel check outstanding: new characters/voices are feel/design
  work — commit carries `[needs-eyes]` for Steve's eyes on his phone.
- Group banter (`apGroupBanter`) has no bespoke lines for the new four
  yet — they fall to the explicit generic team-up fallback. A Bibi
  team-up line ("Daddy bought me backup dancers!") is an easy later
  addition, not needed for this build.
- The meddle leans (±0.04–0.08) are small by design (one interference
  per contest, 5-day cooldown); if play shows them invisible, the
  lever is the per-move `lean` in the data, not the code.
- `docs/ONTOLOGY.md` still describes the system in its own words; the
  canon doc (ALIEN-PLAYERS.md) is now the roster authority. No
  contradiction found, but ONTOLOGY.md was not re-audited here.
