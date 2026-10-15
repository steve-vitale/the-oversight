# Ascension deed audit — 2026-10-15

Codex godpath lane; Muse retains regions, nomad and regional systems.

## Confirmed repair

The Socialite already declares `deedAlt: relay_office`. Its actual NPC
holder was omitted from `villagerGodhoodCloseness`, despite using the same
class/kit/payoff/day model. A shared office-holder predicate now serves both
roles. The player read uses `Scattering.Game` explicitly. The previous
ambient `Game` reference **worked in the live harness**; it was not a proven
player failure. No new office, reward, XP, ten-day timer or gate relaxation
was added. Holding somebody else's office grants nothing.

`test-relay-deed.js` prepares a four-magic Socialite kit at day 85 and calls
the real `claimRelay`, `appointSwitchboard`, `removeSwitchboard`, and
ascension checks. A new class has no class-age fallback or synergy. The
initial proof was 10 passing / 2 failing before the fix, then 12/12; the
expanded proof is 14/14, including Showrunner and Demagogue, refusal before
networking, wrong-holder exclusion, removal, missing payoff, insufficient
kit, day 79 and both actual ceremonies/capstone gifts. These are prepared
runtime proofs, not natural ascensions or a full campaign playtest.

## Current baseline

Frozen game/policy source: `7751d906c19fddfdb3d8cab1fd3b04f6b64e37d9`,
archived into `.git/deed-before-source` before runtime edits. Standard
`sweep-compare` driver, 64 matched seeds per policy, 150 driver days,
Columbus/eastern woodlands, one seeded harness per child process. The
non-hunting livelihood bots still defend Haven and face unavoidable fights;
they are not pacifist runs.

| Policy | Table wins | Seated | Median game day | Campaigns with player ascension | Player ascension among runs ending after day 100 | Campaigns with NPC ascension | Player deaths |
|---|---:|---:|---:|---:|---:|---:|---:|
| capable | 41/64 | 55/64 | 90 | 27/64 | 4/9 | 15/64 | 93 |
| maker | 18/64 | 25/64 | 116 | 34/64 | 24/47 | 38/64 | 64 |
| merchant | 10/64 | 22/64 | 123.5 | 37/64 | 25/44 | 41/64 | 43 |
| caregiver | 21/64 | 30/64 | 123.5 | 31/64 | 24/50 | 40/64 | 49 |

Player ascension means any bearer in the campaign, not necessarily its
starting person. Player deaths likewise include succession. Fast day-90
wins are excluded from the >100-day denominator; do not treat this selected
survivor group as an unbiased ascension-rate target. Steve made the targets
flexible. These measurements supersede the historical pre-recovery baseline
for this exact source/driver/policy panel, not every old sim configuration.

Daily class samples observed 14/20 subclasses across the panel, 12/20 in
capable alone. They are observed coverage, not an exhaustive event census:
a class acquired and lost between samples can be missed. No sampled
Juggernaut, Warden, Phantom, Undying, Hoarder or Dealer. In particular,
**neither Miser subclass formed in any merchant run**. Eight gods had
actual ascension telemetry; Undying Ward and Market God had none. This does
not prove these paths cannot work for a human; it identifies a progression
and bot-coverage gap to investigate, not a reason to delete them.

## Deed provenance: do not replace one proxy with another

The existing XP event stream is useful for activity coverage, but does not
prove all ten fitting god deeds:

- `gardening` credits sowing and tending even when nothing was harvested.
  Player `harvestGarden` does not itself credit that event. Only 18/256 runs
  had credited gardening anywhere in the village; Living Garden ascended in
  135/256 campaigns, 130 of those without that credit. This is **not proof
  of zero harvest or food given**. It proves the placeholder and XP counter
  cannot establish the proposed village-feeding deed. Inspect real harvest,
  contribution, consumption and actor attribution instead.
- `fight_won` does not establish solo participation or an above-weight foe.
  The Apex example requires the fight's actual participants, starting power
  and outcome, including off-screen villager fights.
- The XP table has no trade deed. `tradesDone` counts completed transactions
  in the scholar store, but is not an NPC-parity or canonical-person deed
  ledger. Do not assume merchant gear success means the Miser class forms.
- `healing` XP is not a saved-life receipt. Lifeline and Ember Heart already
  have real successful-outcome hooks in foreground and field combat; reuse
  those actual results where relevant, with actor identity and food costs.
- The Relay office is an actual named responsibility with existing costs;
  its current holder is a meaningful existing alternative, now shared.

The full replacement of synergy/class-age proxies with ten authored fitting
deeds remains **open**. Preserve old recognized gods, record new real
outcomes without inventing save history, keep the deed with the person who
earned it across bearer succession, and expose a known class's objective.
Measure both subclasses and peaceful routes; do not ship ten generic XP
quotas or call holding a class an accomplished deed.

## Reproduction and observer limits

```
node scripts/godpath/deed-screen.js --root .git/deed-before-source --n 64 --par 6 --out evidence/2026-10-15/deed-before-64.json
node scripts/godpath/deed-screen.js --n 64 --par 6 --out evidence/2026-10-15/deed-after-64.json
node scripts/godpath/test-deed-observer.js
node scripts/godpath/test-relay-deed.js
```

The observer wraps real successful `creditDeed` returns and telemetry,
keeps canonical person IDs, samples existing class records without invoking
lazy state helpers, and hashes gameplay **before** end-of-run diagnostics.
`test-deed-observer` compares observer on/off in separate full 150-day seeded
games: identical gameplay hash and standard driver row/pacing counts, with
real bearer and NPC work observed. Four checks pass. The state hash excludes
only three existing wall-clock pacing fields, not arbitrary state.

Per-person activity can include time before/after that person became the
bearer. Do not relabel it player-only work. Gate diagnostics are final-state
snapshots for observed people; they are not peak readiness or a complete
history of blockers. No policy changes or fabricated XP/gear in these
natural screens. No new phone interaction was needed for this predicate
repair; the prepared proof uses the public office actions and actual gates.

Raw JSON is retained losslessly as gzip to avoid ~35 MB of pretty-printed
text per arm. Decompress to inspect it; the observer itself writes JSON.
Each report pins source, driver, policy and observer hashes. Compact
comparison/validation receipts are in `deed-validation.json`.

## Matched repair result

All **256/256** matched gameplay hashes are identical before/after the Relay
parity repair. The standard driver rows (including pacing), actual ascension
events and complete observer records also match in all 256 pairs. The only
substantive recorded source change is `src/js/godhood.js`; the frozen Git
archive has LF while local sweep-compare/livelihood sources contain CRLF.
Those two byte-hash differences were verified to be line endings only, and
are retained explicitly in the receipt. This is a tested route repair with
no measured campaign outcome change in these policies; they did not isolate
a fresh Socialite office-holder blocked solely by the missing NPC
alternative. The prepared action proof supplies that positive case. It is
not evidence that office-based ascension is naturally used well.

Validation: quick **140/140**, full **912/912** (209 seconds), expanded Relay
proof **14/14**, observer proof **4/4**. No quarantine or weakened assertion.
The full suite used the Git-for-Windows shell setup from SIMULATING.md.

Next Codex work: outcome-based deed records shared by actual people, then
measure the full ten replacements. Also investigate the merchant-to-Miser
progression gap and the six unsampled subclasses; neither commercial gear
access nor a ready-made kit proves those class routes are healthy.
