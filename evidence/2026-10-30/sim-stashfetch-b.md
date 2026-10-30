# sim-stashfetch-b — the vessel fetches their own stashed hatchet

Run: oversight-flesh-out-loop-b, arm sim-stashfetch-b, axis food-economy
(daytime-wood). Worktree sim-stashfetch-b. Game-code arm: ONE new method
+ ONE call site. Main tree never touched. Sibling trees never touched.
Nothing appended to sim-findings.md (coordinator owns the backlog).

## Prereg (binding, committed BEFORE any judged leg)

evidence/2026-10-30/sim-stashfetch-b-prereg.md (commit 8ba5bf94).
Primary metric: hatchequip recorder re-run on acceptance seeds
16103/16106/16110 — stashed hatchet leaves the spawn vessel's stash AND
enters the scholar kit while the spawn vessel lives (before its first
wholesale kit-change morning: 16103 d16, 16106 d18, 16110 d9).
GO iff EQUIPPED on >= 2/3 seeds, OR FETCHED on >= 2/3 with the cost bar
holding. Cost bar (recorder band 16101–16116 vs hatchequip baseline):
village-lost <= baseline+1 (baseline 1/16) AND median daysAlive >= 0.8x
baseline median (baseline 60, capped). Horizon 60d, death-aware.
Substrate identical to hatchequip guard leg (nighttravel + woodcarry,
WOODWARM=0, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1).
Pilot 16101–16108, confirm 16109–16116. Balanced panel (§15) as the
supporting cost-bar instrument, never the judge.

## Verdict — GO (3/3 EQUIPPED, cost bar holds)

The fix: `Game.vesselStashFetch()` (src/js/villager-build.js), called
from `villagerBuildDay()` (the endDay daily tick, sleep path — so it
runs in live play and in sims with no policy change). Once a day, at
haven (`playerAtHaven()` — a fetch from "their space in haven" while
away would be a teleport), the vessel fetches their own best stashed
WEAPON into the pack when it beats what they wield in its slot (empty
counts as beaten). Own stash only, weapons only, at most one fetch per
day, narrated via Game.say + a `vessel_stash_fetch` tele record.
Equipping stays on the normal path (policy gearUp in sims, player UI
in live play): the fix OFFERS the choice, it does not force the wield.
Nothing granted, nothing generated: the hatchet must already be the
vessel's own stashed property. villagerGearUp's gates, acquire sites,
spawn pools, drop tables, vest, courtship, and warmth code are all
untouched (proven by proof-test Part A).

## Before/after numbers (identical seeds, recorder band 16101–16116, 60d)

| seed | spawn stashed hatchet | BEFORE: stash lost? / kit? | AFTER: stash lost / first kit / first equipped | verdict |
|------|----------------------|---------------------------|-----------------------------------------------|---------|
| 16103 | YES | never / never | day 2 / day 2 / day 2 | EQUIPPED |
| 16106 | YES | never / never | day 2 / day 2 / day 2 | EQUIPPED |
| 16110 | YES | never / never | day 2 / day 2 / day 2 | EQUIPPED |

All three acceptance seeds: fetch narration on day 1 ("You remember
the Hatchet at your space in the haven and fetch it — it rides in your
pack now."), "Equipped Hatchet (melee)." on day 2, woodcut tier
none->fell / canFell false->true from day 2 (16110 mornings), then
real Hatchet strikes in fights (16103: tiger 25, eel 35, wolf 54;
16106: tanuki 31/25, wolf 25/27). The 0/4 of hatchequip is now 3/3 on
the acceptance set, plus the fourth baseline case (16105) also fetches
day 2 — and keeps the day-42 Nina-loot story intact as a second,
later hatchet (day-44 loot lines unchanged in kind).

Band cost bar: village-lost 1/16 before AND 1/16 after (after: 16103,
day 37 vs baseline day 50 — a game-code change shifts the RNG stream,
so single-seed days move; the COUNT is the bar and it holds); median
daysAlive 60 before and after; wrapErrors 0. Wave reach unchanged
(max wave 3 both legs, never 4+). The wall is untouched by this arm,
as expected: a hatchet is a woodcut/fight tool, not a scale lever.

## Balanced panel (§15, supporting instrument)

- Before: evidence/2026-10-30/sim-stashfetch-b-panel-before/panel.json.gz
  (16 cases, sources stable, neutrality match).
- After: evidence/2026-10-30/sim-stashfetch-b-panel-after/panel.json.gz
  (16 cases). cases/ caches deleted before commit, never committed.
- Compare: evidence/2026-10-30/sim-stashfetch-b-panel-compare.md —
  decision review_required, with NO regression_signal on any metric.
  Notable moves, all no_material_signal unless noted: first bearer
  survives through day 30, 0.4375 -> 0.6875 (+0.25); player deaths per
  run 1.5625 -> 1.4375; village deaths per run 15.31 -> 14.63;
  community loss flat 0.0625; food/hydration/HP/hunger flat. One watch
  item, investigated not hidden: earned player tier-3+ weapon/armor
  access 0.5625 -> 0.5, status regression_watch (interval -0.25 to
  +0.125, includes 0). No seed-level evidence of the fetch displacing
  a tier-3+ pickup; the plausible cause is trajectory shift from the
  game-code change on a 16-seed screen, and the hatchet itself is not a
  tier-3+ item. Flagged for the next run; per §15 it does not override
  the prereg GO. Panel substrate is the standard competent substrate,
  not the nighttravel recorder substrate — stated, not hidden.

## Sense-test (law — read, judged for meaning)

16103, days 1–8: day 1 the vessel remembers the hatchet at their space
and fetches it; day 2 it is in hand; day 8 it strikes a tiger for 25
and an eel for 35. That reads as a person: the axe they owned since
spawn is finally in their hand because the game finally asked, and the
fights that follow use it by name. The absurdity hatchequip named — a
person forgetting they own an axe for 60 days — is gone on all three
acceptance seeds. The narration is first-person and plain, matching
the game's voice; the equip itself goes through the normal "Equipped
Hatchet (melee)." line, not a special case. PASS.

## Village assessment (plain words)

The village looks the same from the outside — same survival counts,
same wave ceiling — but the people in it stop being absurd about one
small thing: a vessel who owns an axe now picks it up on the second
morning instead of never. The woodcut tier flips to 'fell' on day 2,
so big trees become cuttable weeks before the old loot-or-succession
paths delivered a hatchet (day 31–50). Nothing else in the village
moves: no new items appear, no one else's gear is touched, the pantry
and hunger numbers sit flat. The blank filled is exactly the one
hatchequip named, and no other blank was chased mid-run.

## Blanks filled / documented

- FILLED (landed here): vessel stash-fetch equip step — the named
  next fix from sim-hatchequip-b.
- DOCUMENTED (not chased): armor fetch from the vessel's own stash is
  still missing (this fix is weapons only by prereg; the swat_vest
  sitting next to the hatchet in 16103's stash still never moves).
  The human-player UI path for stash browsing is unchanged — the daily
  fetch covers the sim-measured gap, and the pack UI question stays
  open for the coordinator/Steve.
- DOCUMENTED (watch, not verdict): panel tier-3+ access dip
  (0.5625 -> 0.5, regression_watch, interval includes 0) — see panel
  section; re-check on the next panel, do not tune against it now.

## Wall numbers

Recorder band (60d, 16 seeds): wins 0/16, village-lost 1/16, median
survival 60d (capped), max wave 3, never 4+. National / table reach
were not re-read in this driver (endState records won/villageLost
only); the panel on the same band reads table win 0, national 0,
community loss 1/16. Same wall as hatchequip: this arm fills a
tool-access blank, it does not move the scale on-ramp.

## Proof

- scripts/test-stashfetch-b.js: 32/32 GREEN (Part A static wiring:
  method exists, called from villagerBuildDay, gearUp gate untouched,
  exactly two acquire=true sites; Part B live harness, one loadGame,
  9 fixture cases: unarmed fetch, best-of-stash, spear-blocks,
  stick-allows, away-blocks, one-per-day, no-duplicate,
  object-form entries, no-grant; Part C corpus: 3/3 EQUIPPED + both
  cost-bar assertions).
- Determinism: seed 16103 re-run after the fix reproduces the
  after-corpus file byte-identically (same code -> same trace).
- Recorder reuse: scripts/hatchequip-trace-b.js ran UNCHANGED
  (OUTDIR override only); corpus:
  evidence/2026-10-30/sim-stashfetch-b-corpus/ (16 seeds).
- Analyzer: scripts/analyze-stashfetch-b.js (acceptance verdicts +
  cost bar, before vs after).
- Pre-prereg gate probe: scripts/probe-stashfetch-haven.js (vessel at
  haven at 20/20 sleeps on 16103; also surfaced the vessel-change
  reading that shaped the acceptance windows).
- check.js --quick: 284 passed, 6 failed on the fix tree (re-run with
  full output, 473s). Attribution, completed before commit:
  (a) 2 failures were caused by this arm mechanically — the retained
  measurement proof's source digest no longer matched after ANY src
  change (test-measurement-proof-update, test-measurement-workflow).
  Remedy per repo rule: refreshed with
  `node scripts/balance-proof-update.js
  evidence/2026-10-30/sim-stashfetch-b-panel-after/panel.json.gz`
  (real neutral panel on current sources; precedent commits do the
  same). Both tests now pass 9/9. The refreshed pointer is committed
  here (scripts/balance-proof.json).
  (b) The other 4 failures reproduce IDENTICALLY with this arm's
  changes stashed (base tree): test-mobile-combat-cadence (2),
  test-occupation-panels (1), test-phone-frame-proof (3, stale phone
  receipt), test-establishment-r20-fixes-20261020 (1, racks-voice
  gate). Pre-existing, unrelated to villager-build/gear/stash; left
  for their owners, not silently waived.
  Net after attribution: check.js --quick stands at 286 passed, 4
  failed (all 4 pre-existing); this arm introduces zero new failures.
- Note for the coordinator: check.js --quick itself regenerated
  docs/ONTOLOGY.md from the new provides line (validate-ontology);
  that one-line doc update is committed here as part of this arm.
  Separately, the run surfaced the safe-commit index-clobber class
  again (prereg staged-as-deleted while byte-identical to HEAD);
  repaired with update-index --cacheinfo and verified before commit.

## Metric review

- Primary metric bound the run and was met with no re-scoring: 3/3
  EQUIPPED beats the >= 2/3 bar outright, so the FETCHED-or fallback
  was never invoked. The cost bar held on both legs (counts, not
  trajectories — a game-code arm shifts RNG streams, and 16103's
  village-lost day moving 50 -> 37 while the count stays 1/16 is the
  expected signature of that shift, not a regression).
- One metric doubt for the NEXT run, not applied to this one: the
  recorder's morning snapshots follow the spawn vessel's person record
  but the CURRENT vessel's scholar kit, so the acceptance window
  (gameDay < kitChangeDay) is the honest read for spawn-vessel cases
  but cannot judge a successor's own stashed hatchet — successors get
  their stash moved by mantleBecome anyway, so the gap is narrow, but
  a future recorder should snapshot getPerson(current villagerId)
  alongside the spawn vessel (hatchequip's own recorded limitation).
- Panel note for the next run: on a game-code arm, per-seed
  trajectories diverge by construction; the panel's paired deltas
  should be read as distribution shifts (as here), never as
  trajectory diffs.
