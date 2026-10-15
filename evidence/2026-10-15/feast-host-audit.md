# Host feast nourishment: paid food and measured outcomes

2026-10-15. Runtime `f8e633c5`; validation-fixture follow-up `c0a02d7b`.

## Correctness

The prior intake audit and actual phone play proved that the host consumed
a paid serving but gained no reserve kcal. `hostFeast` now adds their share
of the actual pantry draw, clipped to reserve capacity. Whole-unit spending,
turnout, guest hunger/social effects, reactor cold seats, buffs, once-per-day
guard and 48-tick cost keep their existing rules. A full host gains zero;
an online reactor eats no credited serving. Feed the Multitude retains its
separate ability cost and self-feeding restriction.

The intake proof intentionally replaces its old zero-nourishment expectation
in the same runtime commit. New shared-harness proof: 15 assertions covering
real source/spending conservation, full/near-cap/empty host, whole-unit
overdraw, sick absentees, failed/repeated feasts and online/offline reactors.
Against frozen `ddfbd5d0`, eight pass and seven fail. Current intake: 37/37.

## Matched campaigns — needs eyes

Standard deed-screen driver, identical seeds, four unchanged policies,
150-day ceiling, default public Table readings and no greedy flag. Baseline:
`harvest-intake-after-64.json.gz`, runtime `0eb727a4`. Only game.js changes
among observed source hashes. The runtime, policy and observer tree stays
fixed at the feast implementation throughout both panels. The 64-seed report
records HEAD `c0a02d7b` at completion because the unrelated fixture repair was
committed during the run; its game/policy/observer sources match `f8e633c5`.
The retained source manifests and packager checks verify that identity.

| Policy, 64 seeds each | Wins before → after | Player deaths before → after | Table entries before → after |
| --- | ---: | ---: | ---: |
| capable | 48 → 45 | 76 → 89 | 52 → 52 |
| maker | 21 → 20 | 59 → 62 | 23 → 24 |
| merchant | 27 → 26 | 50 → 62 | 29 → 28 |
| caregiver | 28 → 23 | 44 → 43 | 30 → 27 |

Total wins **124 → 114/256**, player deaths **229 → 256**, warnings **0**.
The smaller 16-seed-per-policy screen was 38 → 31 wins, 50 → 63 deaths.
These are actual rule-change trajectories: state equality is neither expected
nor claimed. Changed reserves change later actions and RNG consumption, so
a correct positive serving does not guarantee improved campaign endings.
This panel records a deterioration; it does not prove equal playstyle odds,
statistical significance, or that noncombat reward balance is finished.
Keep the food correction because it restores a serving already paid for;
do not tune prices, gates or bots to erase the negative result in this batch.

Observed feast nourishment, including guests, changes from 5,668,308.55 to
5,957,770.57 kcal. Campaign lengths and usage also change, so that difference
is not an isolated estimate of calories gained per feast. Combat deaths rise
185 → 207; starvation 17 → 21; dehydration 11 → 17. The artifacts retain
all paired rows and validation JSON lists each win flip for follow-up:
31 previous wins are lost and 21 previous losses become wins. All 64
standard rows repeated between the screen and larger panel match exactly.

## Actual phone play

Prepared food and character, real production controls: Prepare feast → Host
a feast → Light the fire. Twelve diners, nominal cost 4,800; real whole-unit
draw 5,000 kcal. Pantry **20,000 → 15,000**; reserve **1,000 → 1,416.67**
(HUD **1,417/2,400**), matching the 416.67-kcal food/nourishment receipt.
Forty-eight ticks pass. No keepsake was armed, so the existing devotion gate
still refuses the buff. This proves ordinary nourishment independently of
that buff, not natural acquisition or affordability.

See `feast-host-phone.png` and `feast-host-browser.txt`. Reuse the prior
`harvest-intake-phone-fixture.cjs` from the repo root, serve over loopback and
open `.git/harvest-intake-phone.html?debug=1`. Temporary viewport reset,
owned test tab closed and loopback server stopped.

## Validation and retained failures

Final quick **152/152 (38s)**; final full **924/924 (157s)**. Initial full:
922 passed, two failures (random starter Codex breadth and ontology
subprocess). Second full: 923 passed, random ambient distrust in a moot
fixture. No feast test failed. All initial/final logs are retained.

Codex test now explicitly prepares day one below the breadth threshold and
also proves a 15-entry day-one Codex syncs a death (40/40). Moot test isolates
crime heat and separately proves ambient distrust is unhalved (29/29).
Ontology subprocess failures now retain stderr; the original failure's
stderr was unavailable, so its cause is unresolved. Targeted foodpower:
30/30 using Git Bash as documented. An extra invocation without that shell
environment failed to find grep and was corrected. No quarantines or
weakened assertions.

A draft screen invocation with CAPABLE_READ_STAKES=1 was interrupted before
producing an artifact and is excluded. Both retained panels match baseline
flags exactly. Raw/gzip SHA256s, source identities, phone and log hashes are
in `feast-host-validation.json`. Compressed panels are lossless. The broad
roadmap goal remains active; no deploy or service-worker bump.

## Next work

Settle Living Garden coverage using real harvester/eater receipts plus a
snapshot of required living villagers, then measure seven-day access for
player and NPC. An eight-day receipt book alone is not a whole-village deed.
Anonymous personal-work food cannot be assigned to the host or a guessed
producer. Preserve class/payoff/build/day gates and the independent Table.
Nine authored god replacements, class/scale parity and the broader feature
audit remain open. Investigate the paired ending losses before claiming this
food fix improves viability or adding another balance lever.
