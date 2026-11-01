# Away supplies and recovery

Review candidate; not release clearance. NPC travel food is carried food, not
access to the Haven pantry from anywhere. DIRECTIVES.md's physical-pantry rule
and delegated build-packet #816 govern this boundary.

`packAtPantry(vid)` requires a current resident, no active away assignment, the
actual Haven node and the inside of its hall. `packKcal` may allocate a real
ration there; away it returns actual remaining carried food, including across
calendar dawns. A missing remote pack is empty. Returning with leftovers does
not throw them away. `packMeal` can make the existing floor-only refill only
with actual pantry access, paying actual items; away it can only spend carried
food. No remote top-up, duplicate meal, free healing or theft refund.

Both startExpedition and objDepart request the existing ration before setting
away/moving. This does not guarantee a fully provisioned multi-day trip: the
existing ration range, personal production, risk decisions and actual access
still matter. Outside-the-hall departures without sufficient carried supplies
remain an opportunity/AI question to measure, not a cleared viability claim.
Do not restore remote supply to make the mortality score look better. A future
resupply/return/aid mechanism must have real travel, food and capacity costs.

Post-flee rest uses `state.village.postFleeRest`, keyed by the actual person and
calendar day. Fresh-process Continue retains it; next day expires it; a new run
does not inherit another village's marker. It changes NPC re-encounter intent,
not HP, location, player commands or resource costs. Existing raid/aid/arena
exceptions and the incoming25%-HP threshold remain; that number is a tuning
choice, not newly specified by Steve.

Run `node scripts/godpath/test-away-supply-boundary.js`: actual finite meals,
unchanged remote pantry, next remote dawn, leftovers, real paid hall refill,
fresh-process committed Continue (rest and ration), expiry, both real departure
routes and new-run isolation. Twelve prepared shared-runtime contrasts. The
incoming live implementation fails the remote-food/fresh-process controls;
raw failed pilots are retained. Native prepared rest/lesson/Continue and the
normal16-stage phone replay use actual current response bytes at both sizes.
They do not prove a naturally encountered full expedition or physical devices.

Measure against the exact pre-repair combined tree with the same current
controller/observer, then separately compare the full reconciliation to public
772c. Do not confuse those comparisons: the latter contains many earlier
private fixes. All29 domains, actual end versus cap, NPC identity/exclusion,
earned usable gear and warnings stay visible. Food allocation changes RNG and
opportunities; an individual later combat death cannot be blamed on hunger
from a paired seed alone. See dated reconcile-supply reports and survival lever
register. No64-holdout or all-region/job/strict-pacifist claim is made.
