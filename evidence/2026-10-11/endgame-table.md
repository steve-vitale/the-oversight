# Endgame table — evidence (2026-10-11)

The integrated galactic-table endgame: 7 paths × light/dark branches = 14 endings,
all fully implemented and proof-tested. Worktree `endgame-table`, merged locally,
pending ship. **Never push/bump — the ship loop owns that.**

## What was built

**Core (`src/js/table.js`)** — the table PRICES the run, never gates on godhood.
Entry reads the real leadership vector (force/diplomacy, showmanship, System stance,
humanity's shape, moral ledger incl. food truth shared/hoarded), wave deeds,
integration stage, coalition scale, audience, knowledge. Seat pricing: full =
`deedGateReady()` (national+, all wave bars); lesser = reachable bar (waves faced
4/4/3, 2+ contests, 2+ crises, regional+, stage≥2, food-thesis deeds — seed 99 came
within 1 fight + 1 crisis of it); none = the table withdraws aloud, never silently.
Failure RESOLVES the story (downgrade to a weakened earned path), never deletes the
run. Trial-by-combat is the single opt-in existential risk (real `startCombat('finale')`,
`tableTrialResume` hook, mantle passes on death).

**Seven paths** (`src/js/table-<path>.js`), each a distinct played challenge with a
televised show component in its genre, each with light/dark branches read from
EXISTING behavior (moral ledger, switchboard routed/delayed/edited/skimmed counts,
foodShared/foodHoarded, promises kept/broken) — never a menu choice:

| Path | Challenge | Light | Dark |
|---|---|---|---|
| Feared | calibrate terror vs villager-horror | protective terror (oathbound/shieldbearer) | domination (red harvest/exemplum) |
| Indispensable | clause-by-clause treaty drafting | mutual need | gilded cage |
| Beloved | live variety finale, villagers as cast | genuine love | manufactured adoration |
| Witness | trial; villagers testify in YOUR words | just trial (precedent) | show trial (blood/gavel) |
| Assimilated | long-con placement haggling | Trojan horse | true believer |
| Defiant | reverse auction (tribute→relay's person→de-integration) | priced freedom | scorched earth |
| Relay | playable switchboard cockpit (probe/reroute/deepen/commune) | humanize the System | System-ize yourself |

**Relay office (`src/js/relay-ext.js`)** — extends comms.js: the Bearer may claim the
relay at regional (honest price: Haven loses your hands; wires erode grounding
−1/day via `relayTick`). 9 comm-field abilities (shared: deep-listen, faithful-carry,
relay-sight; light: translate, sanctuary, advocate; dark: rewrite, skim, omnipresence),
unlocked THROUGH USE (communes, bond, routed counts), dark use erodes grounding.
`relayTableLink()` lets the verbs run during the table's relay challenge.

**Grounding/humanity (0–100)** — tiers grounded/fraying/estranged/hollow; food
conversions weaken ×1/0.9/0.75/0.6 via `feastedMult()` (telegraphed in `feastedLine`);
restored by human verbs (shared meals, comforted grief, kept favor obligations,
teaching). Live villager reaction beats on tier crossings; at hollow the village
grieves you while alive.

**NPC ascension + epilogues** — villagers can ascend (multiple stack bargaining power);
facilitation (teach/relay/shield) is chosen play with architect's credit; passive
players get honestly outshone. Failure downgrades; every ending televised in genre.

## Proof tests (all green, multi-seed where RNG is involved)

- test-table-core: 31/31 (seat pricing, branch axis, grounding, runner, downgrades)
- test-table-feared: 27/27 · test-table-indispensable: 21/21 · test-table-beloved: 22/22
- test-table-witness: 18/18 · test-table-assimilated: 13/13
- test-table-defiant: 18/18 · test-table-relay: 39/39 ×3 seeds
- Updated to the real contract: test-ledger (93 pass; 2 pre-existing mantle failures —
  see gaps), test-meta-progression (55 pass; 2 pre-existing wave failures — see gaps)

## Levers before/after

| Lever | Before | After |
|---|---|---|
| Table scene | single-choice stub in ledger.js (frame + 2 options) | 7-path priced challenge in table.js; stub deleted |
| Meta achievements | wraps bound to stub methods | direct `metaNoteTable`/`metaNoteTableChoice` calls; +`mt-f-relay` (46 total) |
| Switchboard | office appoints NPCs | Bearer may claim it (relay-ext); verbs live on the panel |
| Grounding | didn't exist | 0–100, tiers, feastedMult hook, villager beats |
| Food conversions | flat | weakened by grounding tier (dark relay becomes what forgot food) |

No parallel state: everything reads/writes the existing vector, ledger, pantry,
integration, switchboard, and favor systems.

## Reachability

Steve's law: reachable by competent non-god play. The lesser seat (4/4/3 waves,
2 contests, 2 crises, regional, stage≥2, food-thesis deeds) is the reachable bar —
the journey-endgame evidence showed 0/8 seeds × 180 days reached the OLD full-seat
bar; the lesser seat is calibrated so seed 99's arc comes within 1 fight + 1 crisis.
**Gap filed for the playtest loop:** verify with long sims that competent play
actually lands the lesser seat ~day 100–130, and retune the bars if not. The table
does not assume godhood builds; if a run can't even reach lesser, the table
withdraws aloud and the run continues (Arc IV re-fires the invitation).

## Sense findings (transcript reads)

- Defiant light: "PRICE TWO — THE RELAY'S PERSON... You look at {name} — the one the
  village trusts most — and the price has a face." The named person lands.
- Defiant stall: "The walk STALLED at the door... said aloud, in front of everyone."
  Failure is narrated, never silent.
- Relay commune arc: the System asks "EXPLAIN EATING." → "INEFFICIENT. ...REPEAT THAT
  LAST PART. THE *TASTE* PART." The relationship arc reads on the page.
- Relay dark final: "You stay inside. Forever... The village grieves you while you're
  alive, and you feel their grief the way weather feels rain."
- Witness: villagers testify about YOUR leadership ("sworn:" lines); the record can
  convict you (dark branch).
- Fixed during build: double ability announcements at the relay door (silent grants);
  `abilMods` floor on positive gains only; rock-bottom fallback when assimilated def
  is absent; beat text renders in modal `prompt` (proofs assert on `tc().prompt`).

## Gaps filed (pre-existing, not caused by this build)

1. **test-aid-comms (68/71):** 3 failures in switchboard appointment trust mechanics
   ("weakest-forager cost names resentment", "resentment lands as a timed mood mod",
   "trust toward them drops") — comms.js territory, deterministic at seed 777010,
   untouched by this build. Needs its owner's eyes.
2. **test-ledger mantle section (2 failures):** "you-are-not-her beat" and "keepsake
   left with the corpse" — playerDeath behavior drifted from test expectations
   (bonded keepsakes now buried, never on the corpse per the 2026-10-09 death-pack
   canon); previously masked because the old table section threw first.
3. **test-meta-progression (2 failures):** "unlockedWave -> 4" and "mw-3 and mw-4
   unlocked" — wave-achievement logic; confirmed failing at the pre-table commit
   c8191409, pre-existing.
4. **Reachability sims** (above): long-run verification that the lesser seat lands
   ~day 100–130 for competent play.

## Incidents

- **Shared-index corruption (2026-10-11 ~17:25 UTC):** after a successful private-index
  commit, the worktree's shared index held staged deletions of all 21 table files
  (worktree files intact, HEAD correct). Recovered with `git read-tree HEAD`
  (index-only resync) after verifying every staged path was mine. No work lost.
  Lesson: after EVERY safe-commit.sh, run `git read-tree HEAD` + `git status` before
  trusting the tree; the "index behind" quirk can present as deletions.
- **safe-commit.sh arg order:** `--force-delete` goes BEFORE the message
  (`safe-commit.sh --force-delete "msg" -- paths`); the usage comment says otherwise.
  The mass-deletion guard (>50 lines in src/) correctly refused the ledger stub
  removal once — intentional deletions need the flag, and the refusal is the guard
  working as designed.
- **Pipe masks failure:** `safe-commit.sh ... | tail -2 && next` hid the guard's
  refusal (tail exits 0). Never gate a chain on a piped commit's exit.

## Commits (local master, pending ship)

1. `c8191409` — docs/TABLE.md design contract
2. `6ce35b7c` — table.js core (pricing, registry, branches, grounding, runner, epilogues)
3. `97ea96cd` — core proof 31/31
4. `f8e64eed` — Feared path + proof 27/27
5. `bb8b4991` — Indispensable + Beloved + proofs
6. `d875a40b` — Witness + Assimilated + proofs
7. `7483778a` — Defiant + Relay paths, relay-ext office, app.js UI + proofs
8. `afbc3b09` — ledger stub removal, meta rewire, ledger test update
9. `ce045a4d` — meta/core test contract updates
