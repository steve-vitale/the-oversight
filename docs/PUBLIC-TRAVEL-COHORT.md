# Public grid travel experiment

The ordinary capable/maker/merchant/caregiver policies remain the historical
macro-travel controls. The explicitly registered grid-capable/grid-maker/
grid-merchant/grid-caregiver profiles use the same brains with physical
approaches for policy travel requests. Do not silently promote these profiles
or use their results to calibrate garden numbers before shared review.

`scripts/policies/public-travel.js` scopes the controller through a WeakMap for
the duration of a selected policy call. It does not replace a Game method or
change a runtime/data file. Competent travel callers and maker knowledge trips
use its travel entry point; outside the declared scope it forwards the original
arguments and return value to Game.travelTo. Existing profiles therefore retain
their native policy decisions and RNG; prove that with real repeated campaigns.

Inside a grid profile, an intended destination is approached one cardinal node
at a time. The controller finds a reachable grid rim with the matching native
edgeExit, calls beginPathWalk, executes each real pathStep, then uses tryNodeExit
and the same completed travel checkpoint as the phone. Haven departures walk
to a real door approach and call exitBuilding; tents use exitTent. No coordinates,
resources, RNG outcomes or clock increments are assigned by the controller.
Corners follow edgeExit's actual axis rule. The authored boundary remains free.

Combat, pending encounters, active contests, changed state/body/run/scene or an
unexpected landing stop travel. A scene interruption retires further travel
requests for that policy call. The current native pathStep completes its own
response before the controller can stop the next command. No force-crossing is
passed, even if an old macro caller supplied a force flag. Refused blockages,
unaffordable walks, unreachable rims and door failures are retained explicitly.
The parent brain still chooses roadwork or routing; this is not an omniscient
world path optimizer. Eighteen cardinal hops bound an individual request.

The physical profiles also respond to a human-combat terrain standoff: after
two nonmoving, nonstriking blocked turns, attempt a reachable native barrier
retreat. This is a policy decision through ordinary move/Wait/barrier verbs,
with authored escape consequences. It does not end the fight by fiat, edit
fighters or let sealed fights escape. Original profiles retain their existing
human-combat policy. This exception is explicit because physical approaches
exposed a naturally occurring standoff the macro policies rarely reached.

This covers the selected policies' explicit node-travel callers. Authored engine
transports, combat exits, special scenes, and the rest of the simulator are not
declared equivalent to all human play. Passing this experiment does not establish
pacifist, garden, NPC cultivation or broad mobile usability viability.

Repeat the screening panel with all eight actual policy IDs and the current
observer/contract. Use sixteen matched seeds per profile; four physical profiles
are paired with their four macro controls explicitly by seed in
scripts/summarize-public-travel.js. Never rewrite row policy IDs to get through
the ordinary same-policy comparator. Retain all23 metrics, unknown denominators,
source/configuration identities, real on/off controls and original outcomes.
More wins cannot cancel mortality/community/resource/progression/gear warnings.

```
node scripts/balance-panel.js run --root . --out <fresh-case-directory> --policies capable,grid-capable,maker,grid-maker,merchant,grid-merchant,caregiver,grid-caregiver --days 150 --n 16 --par 4
node scripts/summarize-public-travel.js <fresh-case-directory>/panel.json.gz <fresh-output-prefix>
node scripts/garden-longplay-audit.js --root . --policies grid-capable,grid-maker,grid-merchant,grid-caregiver --days 600 --par 2 --out evidence/<date>/<fresh-prefix>
```

Do not change policy/runtime inputs while a panel runs. A changed source digest
invalidates its cases; preserve the partial attempt and start a fresh prefix.
The existing case caches and fingerprints support an interrupted unchanged run.
Retain completed panels in evidence before refreshing balance-proof.json through
balance-proof-update.js. This maintenance proof is not profile adoption.

Run long coverage through native endings, distinguishing caps and harness
recovery, with the shared garden-longplay-audit runner's explicit grid policy
list and 600-iteration horizon. Its garden census is additional coverage, not a
gardening treatment. The two extended seeds per arm are not holdout confirmation.
Travel diagnostics contain cumulative entered-request and landed-step counters
plus the most recent256 request receipts; olderReceiptsDropped explicitly counts
omitted older detail. Repeated calls suppressed after a scope interruption are
not separately counted in revision1; do not infer their frequency as zero. Zero
calls never prove a missing feature without examining opportunity and availability.

Before accepting the experiment, reproduce a native committed approach/outward
Dpad crossing with trusted touch at390x736/844, inspect screenshots, immediate
saved bytes and fresh-context Continue. The shared-kit test separately compares
the controller with those same native verbs, including full Game hash and RNG
continuation. Browser emulation is not a physical-device or final release proof.
