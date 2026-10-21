# Terminal campaign coverage

Use `scripts/campaign-terminal-audit.js` for fixed cases that were still alive
at an observation cap. A bot's `survived` row is not a completed campaign.
An actual ending requires the engine's `Game.over`; retain win/death/loss and
the harness stop separately. Watchdog recovery is explicit, never success.

```powershell
$env:Path='C:/Program Files/Git/usr/bin;'+$env:Path
$env:ComSpec='C:/Program Files/Git/bin/bash.exe'
node scripts/campaign-terminal-audit.js --root . --seeds 10001,10003,10004,10008 --policy caregiver --caps 150,600 --par 4 --out evidence/<date>/<fresh-prefix>
```

Every child owns one seeded shared harness. The default four diagnostic seeds
were selected before continuation from the Haven study, not for favorable
endings. The runner repeats each cap with its passive trace on and off. It
retains full states, outcome rows, all23 balanced metrics, NPC exposure, gear,
warnings and actual ending fields. It counts a driver calling the internal
turn-settlement helper directly separately from legal player verbs.

The trace observes canonical whole-Game state, cycle-safe policy context and
actual RNG/clock draws before/after each policy hook. It delegates every draw
unchanged and never draws a probe inside a campaign. Policy randomness is a
separate stream. The short campaign's final state must equal the longer
campaign's first continued boundary, and every preceding trace must match.
Already-terminal short cases must retain the same final ending/state.
This proves rerun prefixes; it does not restore private closures from a save.

The plan binds sources, observer, contract, tools, flags, Node and jobs.
Interrupted runs reuse fingerprinted compressed cases only under identical
inputs. A completed report refuses overwrite. Changing caps/source/controller
requires a new prefix. Preserve plans and compressed results in shared Git;
case-cache directories are local recovery aids. The retained resume test
copies a real cache into an interrupted-run shape and proves unchanged reuse
and changed-cap rejection; it is not an independent set of campaigns.

Known boundary limit: the old harness's final villager snapshot initializes
agency state. The cap3→6 pilot therefore fails exact end-state equivalence,
even though its policy/RNG prefix matches. The production150 cadence in this
study passes without normalization. Do not remove state differences just to
declare another cadence equivalent; fix or investigate the caller instead.

The harness now ends partial combat turns through `tbPlayerWait`, the same
public action as the phone. It no longer writes moves/acted and directly calls
`tbAfterPlayerAction`. Those paths can differ for ability hooks. The paired
64-case methodology study changes only the harness: identical complete Game
hashes and all23 vectors in this screen, plus an exercised rare fallback case.
The standard balance comparator correctly rejects different harness revisions.
Future Game balance studies must rerun BOTH roots using this current harness;
do not present the methodology study as a Game-only balance improvement.

Natural browser saves need persistent storage and independent capture-on/off
replay. Sample a coherent completed decision boundary, not any nested save.
An end-of-night announcement may save before core overnight settlement. The
retained day266/part4 sample is an interruption fixture, not a normal Continue
sample. Day267/part3 is the coherent replacement. Never clamp its clock or
replay metabolism to make a test pass. Atomic overnight save handling is the
next bounded hardening task. The existing three wall-clock pacing exclusions
are named in the capture proof; no other Game differences are ignored.

Read `evidence/2026-10-20/caregiver-terminal-audit-r1.md` for actual outcomes,
failed pilots, source identities, natural mobile scope and outstanding risks.
These four cases cannot establish population win rate, garden-build viability,
full natural Table UI completion or all-combat/physical-device clearance.
