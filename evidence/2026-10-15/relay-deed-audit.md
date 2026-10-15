# The Voice: current Relay service as its fitting deed — 2026-10-15

The Socialite already had actual Relay officeholding as an alternative deed.
Its class-age fallback still permitted Voice ascension without that work.
This change makes the existing responsibility the required fitting deed for
both player and villager, rather than adding another XP or elapsed-time quota.

## Runtime contract

`godpaths.json` declares `relay_office` as an authored deed. The shared
read-only `godpathDeedStatus` checks the actual current holder and living
canonical person. Appointment day comes from the existing office; an older
live office without a date remains undated, never given invented history.
No extra receipt, telemetry, clock call, RNG or persisted ledger is added.
Removal or transfer revokes eligibility before the ceremony; already recognized
gods retain their earned status. Holding the post as a predecessor never gives
its deed to a successor. Class, four-path kit, payoff and day-80 gates remain.
The Table does not read this gate.

The old duplicate office alternative in godhood.js is removed. Both role gates
now read the same authored condition. The known-class sheet gets its objective
from data. Pending wording also comes from data; Unkillable retains its actual
refusal/next-dawn message instead of imposing that message on other deeds.
Office costs are unchanged: bearer grounding erosion and the claimed labor role;
villager appointment costs time, labor and the candidate-specific political cost.
There is no new combat prerequisite or win-rate target.

## Runtime and actual phone proof

- Actual shared-harness claim, appointment, removal, both Socialite subclasses,
  detached/wrong-person rejection, dead-holder rejection, build/day gates,
  ceremonies/capstone gifts, old recognized gods and real save/load: **24/24**.
  The exact same test on frozen c0d643fc yields **12 pass / 12 fail**.
- Authored data validation **66/66**; known-class renderer **6/6**.
- The old godhood-rework T13 assertion named the office as an alternative.
  It now requires the authored relay_office field instead, preserving path and
  day-80 checks. That explicit design change resolves the initial quick failure;
  the legacy suite is **23/23**, without weakening the required condition.
- On a real 390 x 844 browser, a prepared four-slot/four-ability Showrunner at
  day 85 has an 84-day-old class but an unfulfilled deed and false full gate.
  The actual character sheet displays the authored objective. Pressing the
  game's real **Claim it yourself** button fills the office; reopening the
  sheet displays **Deed fulfilled. Your build and the day still matter.**
  The fixture banner's full gate changes to true. This tests the actual sheet
  and claim, not natural acquisition or a phone ceremony. Runtime tests prove
  both ceremonies. Both screenshots and the fixture are retained. The first
  fixture lacked enough integration slots; it was corrected to four and both
  screenshots were replaced with the corrected run. Owned tab/server closed;
  temporary viewport reset. No deployment or version/SW bump.
- Quick **158/158**; full **930/930**.

## Matched campaign evidence

Current observer/contract, default four mixed policies, Columbus/default region,
150-day ceiling. The 16-seed screen changed three merchant rows/full states.
Other standard rows were identical and the screen had no material metric signal.
It is not a claim that all states or all metrics were equal.

Expand the same per-case caches to 64 seeds per policy: each root reuses the
68 matching screen/proof jobs and runs only missing cases. The baseline's first
screen also reuses the prior actual-demand arm because its content/configuration
identity is exact. All eight balanced observer pairs match full state and
standard row with no warnings/errors; sources stay stable.

| Policy | Wins | Player deaths | Community losses | Sampled player Voice access | Sampled NPC Voice access |
|---|---:|---:|---:|---:|---:|
| capable | 45 -> 45 | 89 -> 88 | 11 -> 11 | 10 -> 8 | 2 -> 0 |
| maker | 20 -> 20 | 62 -> 64 | 19 -> 19 | 7 -> 7 | 3 -> 0 |
| merchant | 26 -> 26 | 62 -> 60 | 18 -> 16 | 14 -> 11 | 4 -> 0 |
| caregiver | 23 -> 25 | 43 -> 43 | 11 -> 11 | 14 -> 11 | 6 -> 1 |

All 256 cases preserve earned tier-3+ weapon/armor access. Contest/show counts
stay 63/64, 63/64, 64/64 and 63/64 respectively; craft/trade remains zero.
These are access, not a complete feature-value or peaceful-campaign measure.
Fourteen full campaign states change. Voice access is sampled run presence,
not a census of every ascension or a count of unique people across runs.
All 23 metrics and exploratory intervals are retained, separately by policy.
The comparison is **review_required**: caregiver wins +2/64 trigger neutral
change_watch (paired exploratory interval 0 to 0.078125). More wins are not an
automatic improvement. Maker's extra deaths and reduced Voice access still
matter even where a configured practical warning is not triggered.
No holdout tuning or equivalence claim is made from this one confirmation set.

Eight independent deed-observed replays (merchant seeds 2, 5, 7 and control 42,
both roots) match their saved standard rows/full hashes, without warnings.
The changed runs lose the former class-age Voice ascension; the control is
unchanged. A focused service probe replays seed 7 on both roots and again
matches both exact saved rows and full hashes, exposing actual office calls
and public availability rather than guessing from a zero counter.

## Discovered dependency: a dead holder blocks the next person

Both seed-7 roots claim the Relay on day 47, as the original Healer bearer
`gen_z7f1x9s`. Canonical deathSeen and the memorial roll record that holder's
death on day 112. A new bearer, `boris_kowalski`, is a Socialite by day 117;
the office still names the deceased predecessor. switchboardAvailable stays
false, so the ordinary policy cannot claim the job for the actual new person.
The old class-age bypass hid this blockage; the new honest gate exposes it.
Do not describe this as merely bot nonuse, borrow the predecessor's duty or
restore the class timer to work around it.

Decision: retain the fitting current-role condition, then repair **office
lifetime** as a separate change and matched experiment against this deed-only
candidate. Both live player and NPC death must vacate their post; old loaded
dead-holder saves must recover; living holders and actual death refusals must
retain it. A successor must explicitly claim or accept the responsibility.
Natural access and per-playstyle effects must be measured again afterward.
The eight other fitting-deed replacements and broader parity/scale work remain
open. Garden's feeding interpretation does not block this independent work.

## Reproduce

```text
node scripts/godpath/test-relay-deed.js
node scripts/godpath/validate.js
node scripts/godpath/test-deed-hint.js
node scripts/balance-panel.js --root <baseline> --n 16 --out <before> --par 4
node scripts/balance-panel.js --root <candidate> --n 16 --out <after> --par 4
node scripts/balance-panel.js --root <baseline> --n 64 --out <before> --par 6
node scripts/balance-panel.js --root <candidate> --n 64 --out <after> --par 6
node scripts/balance-panel.js compare --before <before>/panel.json.gz --after <after>/panel.json.gz --out <comparison>
node scripts/godpath/probe-relay-service.js --root <root> --panel <saved-panel.json.gz> --policy merchant --seed 7 --out <probe.json>
```

Pin the exact source/flags/Node/contract/observer from the panels. Frozen base:
c0d643fca7186c67d1c5eed602465f46f78008e7. The source bundle retains exact old/new
runtime, data, test and probe bytes. Preserve these deed-only panels when
measuring the office repair; do not combine both changes into an unexplained
single lever. Full observer controls, traces, service probes, logs, screenshots
and artifact hashes are retained beside this note.

## Evidence packaging correction before publication

The final retained-job digest check caught a UTF-8 text file read through the
Windows default code page during bundle assembly. The authoritative cache and
raw panels were valid. The control/trace/probe bundles were rebuilt from explicit
UTF-8 originals, preserving their text as well as numbers. All retained control
result digests are checked again before push. This corrects packaging only;
no simulation or gameplay result was rerun or silently relabeled.
