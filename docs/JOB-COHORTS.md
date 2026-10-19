# Real occupation cohorts: implementation contract

Fixture refresh2026-10-19: the integrated Muse pit-knowledge field adds only
knowsPit:false to each of the six people in seed2022's original roster.
The same actual offered nurse gen_xr1wda3 at index1 is selected. Preserve the
full-record assertion with hash05a4b17a4f3fc7c7f629d2867e7fb924483ce5c6e9e75bebdd4f8ae8702a2bfd.
No seed, offer order or selection rule changes. See
evidence/2026-10-19/release-canonical-occupation-differences-r1.json and
release-canonical-occupation-proof-r2.log. Historical seed-bank hashes below
remain evidence for their original frozen roots, not the current roster.

Status: shared setup, sweep driver, panel CLI, exclusions, scorecards and
feature census are wired and proved. First named campaign screens are
terminal and retained. This does not certify job balance or small effects. Read
MEASUREMENT-PLAN.md and SIMULATING.md first.

The current app offers four cards from `genRoster(origin)`, filtering with
`candidate !== false`. Two additional generated people are NPCs. The default
comparison driver still picks the first roster entry. The separate old sweep-buff
script's FORCE_OCC changes generation; that flag does not select an actual
offered character in the balanced driver.

## Selection and evidence

Use the explicit `--occupation <id>` option in the balanced driver. Validate IDs
against the loaded occupation catalog; an unknown ID is a configuration error.
Generate the roster exactly once through the shared setup path. From the
actual four offered cards, select the first matching occupation in offer
order. Do not alter occupation pools, skills, backgrounds, gear, knowledge or
the cast, and do not reroll a missing offer. Explicit roster ID and occupation
selection must be mutually exclusive. Without the option, preserve the current
first-card setup and its complete trajectories.

After normal newGame/depart, retain the actual starting bearer ID, occupation
ID, offered IDs/jobs, selected offer index, origin, actual landing region and
selection specification. Verify the active bearer's occupation against their
canonical person record. This describes the initial bearer; succession does
not turn every later bearer into that profession.

If no offered card matches, retain an `occupation_not_offered` exclusion with
the offered cards and the seed. Do not run a different bearer, call the policy,
record a loss, or convert unavailable metrics to zero. An NPC-only match remains
excluded. Such cases prove offer availability, not observer neutrality during
a campaign that never ran.

## Panel and comparison contract

Keep complete attempted-case coverage: every requested policy/seed must appear
exactly once as a played row or an explicit exclusion. Keep played rows in the
existing metric format; store exclusions separately. Duplicate keys across
either collection and unaccounted attempts invalidate the panel. Do not relax
the existing completeness check without adding this stronger accounting.

Compare campaign metrics only for matched played cases in both roots. Report
attempted, played, excluded and paired counts by policy, plus exclusion reasons
and changes in offer availability. A changed exclusion pattern requires review;
it cannot disappear into the win denominator. Require matching occupation,
origin, region, seed bank, controller/harness and observer configuration.
Unmatched cases and insufficient pairs stay visible. Confirmation size means
at least64 eligible matched campaigns, not64 requested seeds or roster draws.
All23 existing metrics, unknowns and exploratory-interval limits still apply.

Offer availability can correlate with other cast differences. Matched game
changes within one occupation cohort are useful; comparisons between different
occupations drawn on different seed subsets do not isolate a causal job effect.
Keep that distinction in job/subclass claims.

## Repeatable seed banks

The first bank was declared before outcomes: seeds2001–2256, Columbus, Ohio,
against immutable sources2af and16fb. The512 generated rosters match completely
between roots, including full-record hashes. Seven named occupations each have
17–25 eligible seeds; other seeds are explicit absent-offer exclusions. See
evidence/2026-10-17/job-cohorts-r1-rosters.json.gz for the full availability
table and offered-card receipts. This is roster evidence, not campaign proof.

Use all eligible seeds in a declared bank, or declare a fixed first16 rule
before running outcomes. Keep every attempted seed and exclusion. Extend to a
new predeclared independent bank for64-pair confirmation; do not search for
favorable outcomes. Add named origin/region cohorts for the feature under test,
using validated playable region IDs and the same selection rules. The actual
landing region must be retained; a hometown alone does not establish it.

## Wiring and acceptance

The implemented CLI uses the shared setup path, not a policy-side relabel:

```powershell
node scripts/balance-panel.js --root . --policies caregiver --occupation er_nurse --region sa_amazon --origin "Columbus, Ohio" --seeds 2001,2002,2008 --proof-seeds 2001,2002,2008 --days 150 --out .balance-nurse-amazon-new
```

Choose fresh output/cache paths. Here2008 offers a nurse;2002 offers one only
as an NPC;2001 has no offered nurse. A proof-seed list must cover at least one
played case per played policy; excluded selection determinism is separate
from campaign observer neutrality. A fully excluded panel retains its receipts
and reports zero played pairs, unknown metrics and no feature/NPC exposure.
It cannot refresh the real campaign maintenance proof.

`panel.exclusions[].row.selection` retains missing-offer receipts; played
`row.selection` retains actual initial bearer/job and landing region. The
first-bearing occupation does not constrain later successors. Comparisons
show attempted/played/excluded/paired counts, changed availability and changed
rosters. Feature census denominators use only played campaigns.

Acceptance requirements (implemented; retained campaign evidence below):

1. Shared setup selects actual cards and exposes explicit selection/exclusion
   receipts. Sweep driver and panel CLI pass and retain the option.
2. Source manifests and cache identities include the selector and its inputs.
   Old default panels remain historical; the current observer/controller/
   harness must run against both game roots. Refresh the retained neutral proof
   and balance-proof.json when those inputs change.
3. Scorecards, feature census and output summaries use played denominators and
   retain attempted/excluded coverage. Excluded cases have no feature usage or
   NPC exposure; they cannot count as unused or failed features.
4. Shared-kit tests use real generated offers, including an offered match,
   NPC-only match and absent offer; prove one generation call, real starting
   occupation, no policy execution for exclusions and unchanged default setup.
   Deliberate selector/exclusion/cache faults must fail those assertions.
5. Retain fresh default compatibility, seven-profile observer neutrality and
   named-cohort campaign panels. Check all23 metrics, quick/full suites and
   actual setup wiring before publishing the workflow to Muse.

The counter-material64-seed holdouts completed before this revision and remain
historical under their original observer. Current default compatibility uses
the new observer against both old/new setup:14 states, outcomes and all23
metric vectors match exactly. Fresh seven-profile14-case campaign neutrality
is registered in balance-proof.json, including balance-cohorts.js in observer
fingerprints. The metric IDs/definitions remain unchanged; the optional
occupation receipt/accounting contract is enforced by that shared module.
Eleven deliberate source faults and real shared-harness/CLI/cache proofs pass.
Every sampled proof must pass and match its actual case and proof kind; one
passing campaign cannot conceal a failed or mistyped selection proof.

First named screens use16 actual offers plus two missing-job controls, with
current tooling on both2af/16fb game roots: maker/carpenter in eu_temperate and
caregiver/er_nurse in sa_amazon. Their cohort lists were retained before
campaign outcomes. All32 matched states and metric vectors are exact. See
dated occupation-cohorts-r3 evidence for final results. R2 is historical.
Do not edit an observer while its panels are live; keep old roots/reports
under their original identities.64 eligible matched job campaigns remain
necessary for small job-effect claims.
