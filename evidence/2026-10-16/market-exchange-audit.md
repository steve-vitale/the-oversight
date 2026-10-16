# Market God: a real noncombat exchange, with measured access costs

2026-10-16. Base `636698cb0e32a21ce1ee39517b944f1094bd7f76`.
Retain the personal paid-goods outcome as the fifth authored god deed.
Five proxies remain. The named Miser cohorts retain community/death warnings;
this is not a balance-improvement or complete playstyle-viability claim.

## What qualifies, and why

Trade food value for **delivered tools, gear or alien goods**. The actual
buyer and a living resident seller each earn their own first receipt. Real
cart purchases, resident sales and river barter call the shared commerce
recorder after payment/delivery. Receipt fields distinguish quoted price,
actual physical pack calories, redeemed tab and communal payment. Preserved
food value is not physical calories; whole-unit overpayment is retained.
An earned tab qualifies when redeemed for goods, not when merely issued.

Quotes, opening a shop, free grants, purchases of more food, news, unknown
goods, failed delivery and stale dead/self-trading stock do not qualify.
The delivered object must really be in the buyer's inventory. The first
receipt is immutable, saves normally and follows its person through the
mantle. Payment/delivery completed before a time-cost death belongs to the
original buyer; it cannot be borrowed by the successor. Old counters and
missing save history are never backfilled. Existing active gods stay.

This replaces only Market's synergy/class-held-for10-days proxy. Complete
class, payoff, four-path kit and day80 remain. Both Hoarder and Dealer can
perform the public exchange without a combat requirement or a specific
Dealer spell. There is no new price, XP, kit-order or gear-tier quota.

Design tradeoff, needs-eyes: pure passive hoarding no longer substitutes for
actually using stores to obtain something. The stockpile can fund the deal;
Haggle can change its quote. A different wealth threshold would still be a
counter proxy and could reward waiting or repeated trivial transfers. The
chosen outcome realizes the Market fantasy through an existing useful
decision, while leaving Dinner, build access and survival costs real. The
declared strategies' failures to purchase goods remain a policy/opportunity
question rather than a reason to grant a deed automatically.

## Frozen source and measurement

Two211-entry Game/policy/harness manifests are in
market-exchange-sources.json.gz. Runtime changes are only betrayal.js's
commerce receipts, game.js's river completion caller and miser.god.deed.
The seven raw measurement/comparator files are bundled unchanged. Validation
overlays are outside the Game manifest and common to both arms.

Each arm has16-seed screens and disjoint10001–10064 holdouts at150 driver
iterations. Four standard policies and two separately named
merchant-hoarder/merchant-dealer profiles remain separate.984 worker results
are retained:656 new and328 exact-source standard baseline workers reused
from the published Ward final panels. Their original report/jobs byte hashes
and provenance are in market-exchange-baseline-reuse.json. The final standard
screen resumes68 source-keyed cached workers; these are not additional worlds.
Every policy/cohort has a standard observer-off first-seed control.

All320 standard raw rows and all23 per-case metric structures are exactly
unchanged. Standard Market God exposure remains zero; generic policies alone
could not measure this access gate's cost. The separate declared profiles do.

The following counts apply to **each** named profile, reported separately in
the raw scorecards. They are strongly correlated: both profiles have equal
full hashes on all16 screen seeds in each arm,63/64 baseline holdout seeds
and64/64 candidate holdout seeds. Do not pool them as independent worlds or
claim naturally distinct Dealer play from their names.

| Cohort, per named profile | Wins | Table entries | Player deaths | Community losses | Runs with Market God |
| --- | ---: | ---: | ---: | ---: | ---: |
|16-seed screen, before→after|6→6|6→6|11→10|2→3|2→1|
|64-seed holdout, before→after|24→24|24→24|49→53|23→25|5→2|

Both named scorecards remain review_required for communityLost
regression_watch. Player-death and specific Market-access directions also
remain visible even where the shared review threshold is not crossed.
All23 metrics, denominators, unknowns and earned gear sources are retained;
unchanged wins cannot cancel those costs. Nor would lower wins alone prove
a regression. These mixed policies do not establish pacifist viability.

## Actual outcomes and investigation

Every changed raw row, metric structure, build identity and observed Market
God case is replayed against both sources. First/last additional changed-hash
cases per policy/cohort provide bounded controls. The complete changed-hash
indices retain112 cases:16/36 standard screen/holdout and14/46 named
screen/holdout.28 selected pairs yield56 exact source-bound replays; two
additional diagnostic observer-off runs match. Every replay asserts its raw
row, **whole balanced observation** and full gameplay hash. No new ledger is
stripped.84 unreplayed hash differences remain unclassified, not assumed to
be metadata-only or equivalent outcomes. This is the documented scalable
selection rule, not exhaustive full-state diagnosis of every new receipt.

Selected source-bound findings (the counterpart profile is correlated):

- Named screen4 buys a hand saw on64 for600 quoted/630 physical kcal.
  Its Hoarder class forms75; actual full-build ascension moves85→80.
  The old run survives the horizon; the candidate loses its community138.
  Earlier godhood is not automatically a survival improvement. The different
  ceremony/power trajectory can change later random histories; no immediate
  new food price or payment rule is introduced.
- Screen1234's old Hoarder ascends80 without buying any goods. Candidate
  never buys goods and has no Market ascension. It makes one later food sale,
  which is not a redeemed goods exchange. Community loss moves137→117.
  The original combat death/succession92 does not occur in the candidate;
  do not force a death or lend the old person's accomplishment.
- Holdout10023/10028 lose their old proxy-based Market ascensions88/99
  and change from horizon survival to community loss150/119. Their candidate
  player combat deaths rise0→2 each.10023's actual hand-saw purchase131
  belongs to a later person; it does not backfill the old prospective god.
  10028 sells once and never purchases goods.
- Holdout10039 never trades in either arm. Its old proxy ascension80 is
  absent; community loss moves120→108. A later NPC Garden ascension is a
  separate event. This is changed access, not a broken goods caller.
- Natural positive holdouts10001 and10021 buy hand saws on72/68 for
  500/600 quoted and540/650 physical kcal. Their actual Market ascensions
  remain80/117. Both survive the horizon without a Table win. The screen4
  and holdout cases prove natural Hoarder access; they do not prove natural
  Dealer or NPC seller ascension. NPC seller ceremony has prepared real-call
  proof below; broader agency/opportunity remains open.

market-exchange-diagnosis.json.gz retains the actor lineage, first receipts,
actual trades, deaths, god events and outcomes. Preserve the warnings and
investigate useful commerce opportunities next. Do not reduce enemy/Table
difficulty, waive the outcome, reorder kits or adopt the blocked introductory
choice experiment to recover a target number of gods or wins.

## Caller, suite and native proof

One shared-harness Market test passes36 assertions, including real payer/
seller transactions, direct and tab funding, Haggle, preservation, negatives,
load, succession and ordinary player/NPC ceremonies with prepared full builds.
The current test on the original Game passes18/fails18; earlier31/34-check
drafts are retained separately. Existing trade progression passes22/22.
Final quick194/194, full966/966, godpath data66/66 and ontology111 systems
pass. Static commerce wiring has the same pre-existing uncalled recentTrauma
helper on both roots; the new recorder has four actual completion callers.
It is not reported as an entirely zero-unwired commerce module.

The first full run passed965/failed1 in the old drifter-grab pantry assertion.
That script used a partial unseeded eval loader; standalone current/baseline
both passed. It now uses **one shared complete harness with seed7**, preserving
all11 original assertions. Both frozen Game arms and an independent rebuilt
root pass11/11. No runtime village rule, assertion, quarantine or win target
changed. The original full failure and before/current standalone evidence
remain. The final full run uses the current36-check test and shared fixture.

An independent archive reconstruction overlays the exact raw collector,
passes36+11 checks and reproduces the entire merchant-hoarder4 standard
child result, including balanced observation and full hash. It is additional
verification, not another independent balance sample.

Configured phone390×844, **prepared access**: Hudson has a supplied day85
Hoarder kit,5000kcal of finished beans,35HP,2400 bank and a stocked cart.
The supplied kit exceeds this starter's earned slots (native sheet4/1);
the phone proof does not establish natural ability acquisition or ascension.
Normal Continue opens the actual expedition. Native Buy spends2000 physical
kcal/four bean units and8 ticks, delivers a tier3 Nanite swarm and earns
the personal receipt. Pack food becomes3000; bank stays2400. Native Pack Use
consumes the item and heals35→85 outside combat. The ordinary You sheet
shows the known Hoarder class's fulfilled deed. Explicit save/load first
erases the live book and sets health1, then restores the real receipt/85HP;
normal title Continue preserves the consumed item and3000 food. AX captures
and final screenshots are retained. Initial fixture's nonexistent debugRefresh
call was removed; the final proof uses native Continue, not that helper.

The Nanite item's existing text promises healing over3 turns, while the
generic handler applies50 immediately. No timing repair is smuggled into
this measurement. Also, resident hawker food payment is consumed from the
buyer without modeled seller food inventory, despite the pockets-food
narration. Seller deed credit records sale participation, not income,
nourishment or pantry standing. Both gaps are logged in ROADMAP Known issues.
T3 care tools are useful but do not count as T3 weapon/armor in the23-metric
gear guardrail. Prepared access is not a natural frequency or economic-value
claim; actual ordinary delivery/use is proved.

## Reproduce and continue

```powershell
node evidence/2026-10-16/market-exchange-verify.cjs
node evidence/2026-10-16/market-exchange-reconstruct.cjs after .git/market-exchange-review
node .git/market-exchange-review/scripts/godpath/test-market-deed.js
node .git/market-exchange-review/scripts/test-drifter-grab-20261006.js
node scripts/balance-panel.js --root .git/market-exchange-review --policies merchant-hoarder,merchant-dealer --n 16 --days 150 --par 4 --out .git/market-exchange-review-panel
```

Rebuild before/after and use the same current observer for new comparisons.
Dated compare/probe/replay/diagnosis tooling retains historical identities;
new source/collector/policy revisions require a new evidence prefix. Do not
overwrite these published artifacts. check.js automatically runs caller and
measurement maintenance tests; Windows PATH/ComSpec setup is in SIMULATING.

Continue five fitting deeds, scale effects and named trade opportunity/
survival investigation. Garden's seven-day definition, early reactor/food-use
question, broad NPC economic parity and natural Finale/Network completion
remain open. No master merge, deployment, SW or version bump is part of this
unit. Publish on codex/resume-claude for Muse with the needs-eyes design cost.
