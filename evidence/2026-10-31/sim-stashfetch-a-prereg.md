# sim-stashfetch-a — PREREG (binding; committed BEFORE any judged leg)

Run: oversight-flesh-out-loop, run fleshout-20261031T0537Z,
arm sim-stashfetch-a, axis food-economy. Worktree
sim-stashfetch-a. Backlog #1597: isolate the 15337
STASH-FETCH TRIGGER (axearrival §7: on the variant stack,
seed 15337 fetches a stashed hatchet on day 1 — "You
remember the Hatchet at your space in the haven and fetch
it" — spawn pool stashed [snare_wire, hatchet, bark_armor]
-> day-2 pool [snare_wire], hatchet equipped day 2; a fetch
routine, not an equip() call).

DIAG ONLY: measurement, zero src/js changes, zero
policy-default flips, zero edits to any existing policy
file, driver, analyzer, or proof file. New files only:
scripts/stashfetch-trace-a.js (recorder driver),
scripts/analyze-stashfetch-a.js (analyzer),
scripts/test-stashfetch-a.js (proof, including the live
gate probe), this prereg, the evidence file, the census
JSONs, and the corpora below. No new policy file is
needed (the driver composes existing policies only).
Sibling worktrees never touched. Main tree never touched.
Nothing is merged by this worker (the coordinator merges);
report status: commit hashes + proof counts + verdict.

## Background facts (read before judging; not assumptions)

- The fetch routine EXISTS on this base: src/js/
  villager-build.js `vesselStashFetch()` (weapon fetch)
  and `vesselArmorFetch()` (armor fetch), called from
  `villagerBuildDay()`, itself called unconditionally
  from endDay (src/js/game.js, PARITY tick). Landed by
  sim-stashfetch-b (2026-10-30), proven on the guard
  substrate (nighttravel + woodcarry, WOODWARM=0):
  acceptance seeds 16103/16106/16110 fetch day 1,
  equipped day 2.
- The older axeacq finding ("stashed hatchet never held")
  ran on pinned base 082cfa19e (2026-10-30 11:21 UTC),
  which PREDATES the stashfetch landing 21efcdcb2
  (2026-10-30 14:28 UTC): the fetch routine did not exist
  on axeacq's base. Base drift, not stack, explains that
  contrast. Verified by git ancestry check before prereg.
- The axearrival bankcheck ran on base ae15fd8f1 (which
  INCLUDES the fetch routine) on the VARIANT stack
  (strandfix(warmed(woodcarry(nighttravel))), STRANDFIX=1,
  WOODWARM=1, WOODCARRY=1, POLICY=nighttravel,
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
  DEPOSITGATE=1, DAYS=30). Its 15337 record (reproduced
  in §"Reproduction target" below) is the target.
- What is NOT established: whether any variant-stack
  component (STRANDFIX, WOODWARM, or the nighttravel /
  woodcarry substrate) is necessary for the 15337 fetch,
  or whether the fetch fires on any stack because it is
  ungated daily code. This arm isolates exactly that.

## Reproduction target (axearrival bankcheck, seed 15337)

Vessel gen_alellhj. Spawn: fullPool [trail_compass,
home_key, seed_packet, buskers_harmonica, search_locket,
snare_wire, hatchet, bark_armor], stashed [snare_wire,
hatchet, bark_armor], scholar inv [search_locket],
equipped [trail_compass, home_key, seed_packet,
buskers_harmonica], tier none. LoopDay 1 evening: inv
[search_locket, hatchet, bark_armor], fetch line for the
Hatchet. LoopDay 2 morning: pool stashed [snare_wire],
hatchet + bark_armor equipped by day-2 evening. Note:
15003 and 15220 on the same stack also fetched day 1
(stashed machete + an armor piece each) — the fetch is
not hatchet-specific in the bankcheck record; this arm
tests whether it is stack-specific.

## Code gates under test (read from villager-build.js)

`vesselStashFetch()` returns null unless ALL hold:
(1) game not over; (2) scholar state exists; (3) no
fetch yet today (`_stashFetchDay != day`); (4) vessel id
exists; (5) vessel at haven (`playerAtHaven()`, default
true if the method is absent); (6) vessel person exists
and is alive; (7) vessel stash non-empty; (8) some
stashed item is a weapon (`class == 'weapon'` with a
weapon def) whose slot is melee/ranged, which is not
already carried/equipped, and whose bonus BEATS the bonus
currently equipped in that slot (empty slot = 0).
`vesselArmorFetch()` mirrors this for armor (own day
flag `_armorFetchDay`, gain > 0 over the worn piece in
its slot). No policy flag, env var, or wrapper appears
anywhere in either routine. The ablation tests whether
that code-read (ungated) matches behavior.

## Stacks under test

Variant stack V = nighttravel base + woodcarry + woodwarm
+ strandfix wrappers, WOODCARRY=1, WOODWARM=1,
STRANDFIX=1 (the axearrival stack verbatim).
Ablation cells on seed 15337 (2x2, WOODCARRY=1 and
POLICY=nighttravel held fixed, matching axearrival):
- V (SF1, WW1): reproduction cell.
- A (SF0, WW1): strandfix off.
- B (SF1, WW0): woodwarm off.
- C (SF0, WW0): both off.
Plain cell P on seed 15337: POLICY=competent, NO
wrappers at all (WOODCARRY=0, WOODWARM=0, STRANDFIX=0).
DEPOSITGATE=1, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0 are held fixed in every leg (the fetch
routines read none of them; see code gates above).
STRANDFIX=1 with POLICY=competent is FATAL in the
driver (untested composition, never run).

## Recorder (what is captured, per loop-day, DAYS=5)

Adapted from scripts/axearrival-trace-a.js (same snap
shape, same write transport with in-worktree staging),
plus the fetch probe below. All additions are READ-ONLY
except the policy chain's own verbs (which are the
trajectory, not the recorder):

- SPAWN snap (pre-loop-day-1): scholar inv/equipped,
  woodcut tier + canFell, vessel id, person fullPool +
  stashed lists (vessel only, via getPerson).
- MORNING snap (post-sleep, pre-daily, loop-days 2+):
  same axe fields + pool lists.
- EVENING snap (post-daily): inv/equipped/tier/canFell
  (no pool read, matching axearrival's evening rule;
  pool shrink is read off the NEXT morning's pool).
- FULL DAY LINES for every loop-day (uniform).
- FETCH-PROBE WRAPPERS (log-only, behavior-preserving,
  return values and exceptions preserved exactly)
  around `Game.vesselStashFetch` and
  `Game.vesselArmorFetch`: each call records loop-day,
  game day, and the PRE-CALL gate state (over,
  scholar day, day flag, villagerId, atHaven,
  person alive, stash ids, equipped melee/ranged ids +
  bonuses, inv ids) plus the result and the POST-CALL
  stash/inv/day-flag. A wrapper never calls a
  state-editing verb itself; the engine's own endDay
  call is what fires inside it.
- TELE WRAPPER (log-only) around `Game.tele` capturing
  `vessel_stash_fetch` / `vessel_armor_fetch` events.
- Recorder errs counted (snap failures, wrap failures);
  any throw inside a recorder read is caught, counted,
  and never thrown into the engine.

## Primary metric (fetch indicator, per seed per cell)

DAY-1 WEAPON-FETCH = true iff ALL FIVE channels agree
on a day-1 fetch of the same item:
(1) a vesselStashFetch wrapper call on loopDay 1 with a
non-null result naming that item; (2) a matching
vessel_stash_fetch tele event; (3) a day-1 fetch line
naming that item; (4) the item present in the loopDay 1
evening scholar inv and absent at spawn; (5) the item
absent from the loopDay 2 morning stashed list (pool
shrink). Any channel disagreement makes the indicator
INVALID for that seed/cell (reported, never papered
over). DAY-1 ARMOR-FETCH is defined identically with
vesselArmorFetch / vessel_armor_fetch. A fetch is
classified FETCH only on a valid true indicator;
NOFETCH on a valid false indicator (no wrapper result,
no tele, no line, no evening gain, no shrink).

## Horizon, seeds, policies (pre-registered)

- HORIZON: DAYS=5, death-aware (runDays stops at
  Game.over). Why 5: the target event is a day-1 event;
  5 days covers the fetch (day 1), the next-morning
  equip + pool-shrink confirmation (day 2), and three
  further days proving no re-fetch (the day-flag gate).
  A 30-day horizon would add nothing: the fetch
  routines carry no state beyond the per-day flags and
  the stash itself, both observed by day 5.
- PILOT (gate only, never judged): 8 seeds on stack V,
  DAYS=5: 15337 + fresh band 15501-15507. Freshness:
  no `"seed": 1550x/1551x` record and no s155xx corpus
  file anywhere in evidence/ (checked with rg before
  prereg; the only substring hits were longer numbers).
  Gate: every pilot file present, recorder errs 0,
  spawn + loopDay-1-evening + loopDay-2-morning snaps
  present on every seed. Pilot files are NEVER mixed
  into judged corpora.
- JUDGED LEGS (in order): ablation cells V, A, B, C on
  seed 15337 (DAYS=5); plain cell P on seed 15337
  (DAYS=5); determinism re-run of cell V on seed 15337
  (DAYS=5, byte-identical corpus check vs cell V).
- CONFIRM (generality, run only if the pilot gate
  passes): 12 fresh seeds on stack V, DAYS=5:
  15508-15519. For each seed: spawn stashed weapons /
  armors (by items.json def class) vs day-1 fetch
  indicator. Confirm is a measurement, not a second
  verdict: it feeds the generality claim (pilot +
  confirm = 20 variant-stack seeds).
- POLICIES: POLICY=nighttravel for V/A/B/C + pilot +
  confirm; POLICY=competent for P only. No policy file
  is created or edited; the driver composes existing
  wrappers only.

## Pre-registered verdict (judge exactly this)

GO refinement, stated BEFORE any sim and justified
here: the parent task's GO ("a trigger condition that
turns the fetch on/off across an ablation on the same
seed — fires in A, not in B") assumes the trigger is
a stack component. The code-read above shows the
candidate trigger is NOT a stack component: the fetch
is ungated daily code whose on/off conditions are
STATE gates (at haven, stash holds a beating weapon,
no fetch yet today). Demanding a stack cell that turns
it off would force NO-GO even when the trigger is
fully isolated. The refinement keeps the on/off
requirement but lets the B state be a gate-failing
state, not necessarily a stack cell:

DIAG-GO iff ALL FOUR hold:
(a) recorder complete on every leg: spawn +
loopDay-1-evening + loopDay-2-morning snaps present,
recorder errs 0, fetch indicator valid (all five
channels agree) on every seed/cell;
(b) TRIGGER ISOLATED: either (i) some ablation cell
turns the 15337 day-1 weapon fetch OFF (component
named), OR (ii) all cells fire AND the firing call's
pre-state probe verifies every code gate true on
15337 day 1 (at haven, person alive, stash holds the
hatchet, wielded melee bonus < 15, day flag unset,
not over) AND at least one gate-failing negative
control on the same stack shows NO fetch (a pilot /
confirm seed whose spawn stash holds no beating
weapon, with its own probe state recorded);
(c) determinism re-run of cell V reproduces the SAME
day-1 fetch indicator AND the corpus file is
byte-identical to cell V;
(d) the live gate probe in the proof passes: on a
fresh 15337 load, spawn-state gates verified, a direct
vesselStashFetch() call fetches the hatchet, a second
same-day call returns null (day-flag gate), and a
direct vesselArmorFetch() call fetches the bark armor
(armor routine verified separately, not conflated).

DIAG-NO-GO otherwise — including any channel
disagreement, any unverified gate, a determinism
mismatch, or a fetch that fires with a gate recorded
false. The generality claim (other seeds / other
items) is reported from pilot + confirm, never from
15337 alone, and a generality miss (e.g. a stashed
weapon that does not fetch with all gates true) is a
NO-GO under (b), not a footnote.

## What is NOT judged here

- No wall numbers are claimed: this is a 5-day
  pre-seat trajectory. National/table/wins are the
  window's structural values (0), not a wall verdict.
- No game change is proposed, landed, or enabled by
  this arm. A GO verdict certifies the DIAGNOSIS (the
  trigger is isolated), not a fix.
- The sibling stashfetch-b / armorfetch-b results are
  background, not evidence: this arm's verdict rests
  only on its own legs + probe.
- Balanced panel (§15): not applicable — single-state
  DIAG census, no before/after game-root pair (same
  standing as axeacq / axearrival). No compare .md.

## Canon note (stated, not invented)

No canon doc covers stash-fetch acquisition: CANON.md
lists no acquisition rule (the same finding as axeacq-b
and axearrival-a). The stashfetch-b evidence file is a
measurement record, not canon, and is cited as such.
Engine facts used here (fetch gates, woodcut ladder,
hatchet fell tag) come from src/js/villager-build.js
and src/data/items.json and are re-checked by the
proof's static part on this base.

## Pinned base

Worktree HEAD at prereg writing time: f44ec6957
(journey succession r83). Prereg, instrument, and
corpus commits add tooling/evidence only, so all legs
run on pinned-base game code verbatim — verified by
the proof's tracked-diff guard: src/ + scripts/policies/
diff empty vs f44ec6957.
