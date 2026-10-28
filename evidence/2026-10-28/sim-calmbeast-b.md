# sim-calmbeast-b — the Calm button stops lying about the room

Run: fleshout-loop-b-20261028T0805Z, arm sim-calmbeast-b.
Prereg: evidence/2026-10-28/sim-calmbeast-b-prereg.md (written before any
after-measurement). Verdict: **GO** — all six prereg legs hold.

## 1. What was wrong, in plain words

Calm is an Animal Ken combat action: spend your turn trying to talk a
fight down, and half the time the other side walks away and the fight
ends. But on the action bar the Calm button was always greyed out with
"Nothing here to calm." — even standing next to a live opponent you could
calm. The bar never tells the game who you're facing, and the old check
looked up "nobody" and refused. Tapping the same action while naming the
opponent worked fine all along, so the button lied about the room: the
opponent was there, the button said there wasn't.

## 2. The fix (one option, as pre-registered)

The fight-scanning pattern, borrowed from war_cry.challenge — NOT a
targeting path (no new UI, no picker for a choice that changes nothing:
Calm ends the whole fight whoever is named).

In `src/js/abilityActions.js` only (app.js untouched, narration untouched):
- New helper `_calmableFighter(game)`: scans the live fight's fighters in
  order for the first one passing exactly the old check's own test
  (alive, kind not monster / player / villager). No new eligibility.
- The calm_beast precheck resolves a null target through that scan, so
  the button enables when someone calmable is in the fight and keeps the
  existing "Nothing here to calm." refusal otherwise. A named target
  keeps the old lookup untouched.
- The calm_beast implementation resolves a null target through the same
  scan, so a bar tap actually attempts instead of narrating a refusal
  after the turn is spent. A named target keeps the old lookup.

Why not the targeting path: the bar has no target picker for bar actions
(app.js: "Today all are self/none"), a picker would be a new DOM-only
surface unprovable in the node harness, and Calm's effect ends the whole
fight regardless of who is named — so picking a foe would be theatre,
not a decision.

## 3. Before / after (identical seeds, prereg legs a–d)

Fixture: barwhy's C1 scaffold (player + live hostile), seeds 9981–9988;
guards: monster-only, no-foe. Proof: scripts/test-calmbeast-b.js (run
mode); judgement: scripts/analyze-calmbeast-b.js — PASS.

| Leg | Before | After |
|---|---|---|
| C1 row available (8 seeds) | false × 8, why "Nothing here to calm." | true × 8, why null |
| C1 bar tap, no target (8 seeds) | refuses × 8 ("Nothing here to calm. (Calm)") | attempts × 8: 5 calm-success, 3 calm-failure |
| C1 named-target tap (8 seeds) | attempts × 8 (premise, unchanged) | attempts × 8 (unchanged) |
| Monster-only guard (8 seeds) | disabled × 8, refuses | disabled × 8, refuses (no monster expansion) |
| No-foe guard (8 seeds) | disabled × 8, refuses | disabled × 8, refuses |
| Barwhy 90-row corpus (seeds 9981+9982) | baseline | identical except the 2 intended C1 calm_beast flips disabled→enabled; every other row identical, disabled rows keep their why, enabled rows carry none |

Calm-success vs failure split (5/3) is the action's own 50% coin, not a
gate: both narrations are honest attempts. Note on the scaffold: on a
failed calm the turn is spent and the hostile's reply kills the player,
whose revival ends the fight too — so "fight over" alone does not prove
a calm success; the analyzer judges success from the "then turns and
goes" narration line, not the fight-over flag.

## 4. Pilot band — before vs after (prereg leg e, regression guard)

Competent policy, 100d death-aware cap, seeds 10430–10437, identical
before/after. Corpus: sim-calmbeast-b-band-before.json / -after.json.
Result: **all 8 seeds byte-identical on days, end reason, wave reach,
arc, rank, table, wins, vests, and death-cause counts.** 8/8 completed,
no crash, no hang, no new death-cause category.

| Seed | Before | After |
|---|---|---|
| 10430 | 93d village-lost, wave 3 | identical |
| 10431 | 35d village-lost, wave 2 | identical |
| 10432 | 100d survived, wave 4 | identical |
| 10433 | 100d survived, wave 3 | identical |
| 10434 | 100d survived, wave 3 | identical |
| 10435 | 100d survived, wave 3 | identical |
| 10436 | 100d survived, wave 3 | identical |
| 10437 | 100d survived, wave 2 | identical |

Wall numbers, before = after: wins 0/8, national 0/8, table 0/8, vests 0,
max wave 4, median survival 100d (capped; losses at 93d and 35d).
Deaths total 169, led by monster:combat 63 and monster:villager combat
48 — monster fights, not starvation (player 1, villager 3) or thirst (3).
Expected: policies do not tap the bar, so the fix cannot move the band;
it behaves exactly as a guard.

Reachability verdict: unchanged by design — waves 1–4 reached, wave 5
not reached in this 100d band, Arc III reached on all 8, national /
table / win not reached. That is the known scale wall, not something
this arm moves.

## 5. Village assessment (plain words)

Six villages lived to the 100-day cap; two were wiped out (day 35, day
93). The villages that lived did so on the usual competent diet —
forage, pantry, talk, a few fights — and none got near the wider world:
no national standing, no table, no win in 100 days. Deaths were
overwhelmingly monster fights, so these villages fed themselves but
could not fight their way out — the same wall the loop keeps measuring.

## 6. Sense-check (prereg leg f) — a person acting, not a button firing

Seed 9984, no-target bar tap, full narration:

> "You lower your hands, breathe slow, make yourself small and
> uninteresting. It watches you for a long moment... then turns and
> goes. The fight is over. (Calm — it worked.)"

That reads as a person de-escalating: posture, patience, the other
side deciding. The failure line is equally human — "You try to calm it,
but it's too far gone — hunger or fear has it. It's still coming."
Neither line names a button or a system; the attempt costs the turn and
the hostile answers, so a failed calm is a real risk, not a free try.

## 7. Balanced panel — stated exception

`scripts/balance-panel.js compare` needs panel.json.gz artifacts from
its own multi-policy 150d panel runs over frozen before/after roots; it
cannot ingest the fixture rows or the sweep-compare band JSONs (the
known corpus-ingestion class). No panel artifact is faked. The
comparison attached instead is the pre-registered one: the analyzer
judgement (legs a–d, PASS) plus the identical 8-seed band corpora
above. A future panel re-observation would need frozen before/after
checkouts and is not part of this arm's prereg.

## 8. Held, with reason (not bundled, not claimed)

- **Monsters stay uncalmable.** The implementation refuses kind
  'monster' outright, and every turn-based foe — including wave-1
  animals — carries that kind. Whether a deer or another wave-1 animal
  should be calmable contradicts the data line ("non-predatory animal")
  as the code stands, and changing it would be a design decision about
  which beasts count as calmable, not a bug fix. Held for Steve's call;
  the fix preserves the current refusal exactly (monster-only guard).
- **No canon doc covers ability-action refusals generally** (open
  tracker blank). This arm followed the code truth (abilityActions.js
  precheck/impl tables, app.js bar wiring) and the challenge precedent
  instead of inventing canon.
- **Fled-fighter edge.** The scan does not exclude fled fighters,
  matching the explicit-target path (which also attempts on a fled
  key). Same behaviour class before and after; noted, not "fixed" by
  inventing a new eligibility rule mid-arm.
- **No live verification.** Per loop rules: committed on the branch
  only, no push, no version bump. The batch ship job owns deploys.

## 9. Metric review (for the NEXT run, not this one)

- The C1 scaffold's hostile one-shots the player on a failed calm, so
  fight-over is not a success signal in this fixture (see §3 note).
  Future calm work should judge success from narration, as this arm
  did, or use a gentler scaffold where a failed calm leaves the fight
  standing.
- The barwhy assert mode flags the intended C1 flip; future arms that
  intentionally change availability should use the allowed-flip
  analyzer pattern from the prereg rather than the barwhy assert mode.
- No metric proved wrong this run; no revision proposed.

## 10. Proof method, stated plainly

Node harness via scripts/sim-harness (seed before eval, full src/js
list minus DOM-only files, Game.save never stubbed). app.js is DOM-only
and untouched by this arm, so no bar-render extraction was needed —
the row data comes from the live `activatableAbilities()` and the tap
from the live `activateAbility()` path the bar itself calls.
`node --check` clean on the edited file. `node scripts/check.js --quick`:
274 passed, 13 failed in 2037s (log: sim-calmbeast-b-check-quick.log).
Every one of the 13 was then re-run against the pre-change file (HEAD
version restored, fix file backed up with `cp` and restored with `cp`)
and failed identically on baseline, so none is caused by this arm:
phone-frame proof + 5 measurement-proof tests fail on stale retained
proofs from sibling landings ("Proof source inputs are not current"),
hide-discovery / mobile-combat-cadence / occupation-panels /
establishment-r20 fail on their own assertions, prepared-runner-custody
and proof-text-identity fail on the container EPERM write flap, and
trust-observer-neutrality + capable-bot hit check.js's 120s timeout on
this slow box. The arm's own proof (fixture + analyzer + identical
band) is green, and the restored fix re-passed the analyzer after the
baseline comparison.
