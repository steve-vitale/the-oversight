# sim-axefirst-b — axe-supply-first census on a fresh band: DIAG-GO

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0841Z,
arm sim-axefirst-b, axis food-economy. Worktree sim-axefirst-b.
DIAG ONLY: measurement, zero src/js changes, zero policy-default
flips, zero edits to any existing policy file, driver, analyzer, or
proof file. New files only: the prereg, the recorder + analyzer +
proof, this evidence file, the compare, the census, and the corpora
below. Sibling worktrees never touched; main tree never touched.
Nothing is merged by this worker (the coordinator merges); do NOT
push, bump, or verify live.

## Answer in one paragraph (plain words)

On a fresh band of nineteen seeds plus the strand seed, an axe is
rare, it arrives by only two roads, and it never meets a strand
morning. Two seeds in twenty ever hold a hatchet in thirty days:
one fetches it from its own haven stash on day 1, the other takes
it off a dead villager's body on day 27. The strand seed still has
no axe at all, and the fresh seeds that do get axes never sleep out
by a creek — so no seed in the whole census ever pairs an
axe-holder with a strand morning, and no villager in the census ever
wakes up both holding an axe and standing where a tree could be
felled. The axe-holders all wake at home, where there are no trees
to fell. Supplying the axe first is therefore necessary but not
sufficient: the axe must reach the villager who sleeps out, not just
any villager, and that villager must also wake fed — the food half
of the joint gate still fails everywhere it was measured.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-31/sim-axefirst-b-prereg.md (commit 90748d85).
Pinned base 003a9c2f391edd56f31a0f6f9f1305dfe6380a48 (worktree HEAD
at prereg writing time, after a clean rebase onto master; prereg +
instrument + corpus commits add tooling/evidence only, so all legs
run on pinned-base game code verbatim — verified by the proof's
tracked-diff guard: src/ + scripts/policies/ diff empty vs the
pinned base).

Definitions frozen in the prereg (not re-scored here, §14 binding):
strand morning = morning after a still creek evening (woodcarry
bucket 'creek', rescued false), waking NOT at haven, not game-over,
not in combat. First axe-tier held = first snap showing woodcutTier
'fell' (hatchet is the only fell-tier item in items.json — verified
in data, not assumed). Source classes: spawn / stash fetch /
corpse loot / craft / other (with quoted lines + diffs). First
fell-capable morning = first morning with tier 'fell' AND
cutInfo.canFell true AND a non-null fell target on the wake tile.
Pairing = a strand morning whose morning snap shows tier 'fell';
the answer is the set of (seed, leg, loopDay) triples, empty = NO.

Verdict, judged exactly as written (DIAG verdict — the census COUNTS
are findings, never the verdict):
- DIAG-GO iff (a) pilot census complete, AND (b) first-axe source
  classified on every leg that ever holds an axe, AND (c) the
  pairing question answered yes/no with the searched seed list,
  AND (d) determinism byte-identical, AND (e) strand membership
  re-derived on current master with drift named, AND (f) at least
  one axe-arrival evening sense-read per source class present.
- A pairing set of EMPTY is NOT a DIAG-NO-GO: a complete,
  deterministic NO with the searched seed list is a successful
  answer for a diagnosis.

## Verdict: DIAG-GO

| bar | result |
|-----|--------|
| (a) pilot census complete | PASS: all 16 pilot legs 30 evenings + 29 mornings, errs 0, 0 incomplete mornings, 0 incomplete strand mornings; same for all 24 confirm legs |
| (b) source classified on every axe leg | PASS: 4/4 axe legs classified (2 stash fetch, 2 corpse loot; 0 'other', 0 'craft', 0 'spawn') |
| (c) pairing answered yes/no + seed list | PASS: NO — pairing set empty over all 40 legs, 20 seeds searched (15215 + 15501-15519) |
| (d) determinism | PASS: 15215 ON re-run BYTE-IDENTICAL to the judged pilot file (cmp) |
| (e) strand membership re-derived, drift named | PASS: NO DRIFT — 15215 still guard 7-9, ON 7-16, spawn stash identical to jointgate (see §2) |
| (f) sense-read per source class | PASS: stash-fetch arrival (15505 day 1) + corpse-loot arrival (15509 day 27) read end to end — see §4 |

Proof: scripts/test-axefirst-b.js — 197/197 checks pass (25 unit
cases for the classifier / fell-capable boundaries / strand
extraction + corpus checks on all 40 legs + determinism
byte-identity + tracked-diff guard). §15 panel: attempted with the
recorder rows and refused — see §6; the judged comparison is
guard-vs-ON legs on identical seeds through the standalone census
analyzer (sim-axefirst-b-compare.md), never labeled a panel result.

## Canon

docs/CANON.md read, then docs/TIME-ECONOMY.md. Fell cost verified in
code (game.js cutTree: 96 ticks + 80 kcal; storage.js woodcutTier /
cutInfo: only tier 'fell' fells). Axe-tier inventory verified in
data: items.json carries exactly four woodcut tags (stone_knife
'whittle', hatchet 'fell', machete 'brush', hand_saw 'prune'), so
the hatchet is the game's only axe-tier weapon. No hatchet entry
exists in recipes.json (checked): the 'craft' class has no known
recipe behind it. No canon doc covers an axe-supply-first design —
stated here instead of inventing canon.

## Prior evidence read in full before designing anything

sim-jointgate-b.md (+ prereg, 2026-10-31), sim-stashfetch-a.md (+
prereg), sim-axearrival-a.md (2026-10-30), sim-axeacq-b.md (+ prereg,
2026-10-30), sim-food-economy-round-0741-b.md (coordinator). This
arm does NOT re-judge any prior corpus: fresh census on current
master only. Prior numbers are context for comparison, never the
verdict.

## Instruments (new, this arm)

- scripts/axefirst-trace-b.js — recorder driver copied from
  scripts/jointgate-trace-b.js (same warmed stack, same evening/
  morning record shape) with READ-ONLY additions and NO behavior
  change: per-evening hatchet lines + take lines for source
  classification. Env gates asserted FATAL.
- scripts/analyze-axefirst-b.js — pure reads: per-leg first-axe
  day + source classification + first fell-capable morning +
  strand census (jointgate method) + pairing set + drift table.
  Multi-dir merge (guard and ON legs live in separate dirs because
  file names collide) added before the judged confirm legs; the
  recorder itself is byte-identical to its committed version.
- scripts/test-axefirst-b.js — proof (see Verdict).
- Instrument commits: prereg 90748d85, instruments e9452203,
  reader-only patch 8b9c6ac2. Note for the coordinator:
  safe-commit.sh hit the known index clobber on all three commits
  in this arm (commits correct, main index showed staged deletions
  with byte-identical worktree files); repaired each time via
  `git update-index --add --cacheinfo` from HEAD blobs and verified
  `git status --short` empty + `git diff HEAD` empty before
  continuing. The commits themselves were never in doubt (blob
  hashes match worktree files).

## 1. THE CENSUS (40 legs: 20 seeds x guard + ON, 30 days each)

All 40 legs survived 30 days (endReason survived). Recorder errs 0
on every leg; every morning carries tier + inventory + stash.

### First axe-tier held, by seed (both legs agree on every seed)

| seed | first-axe evening | first-axe morning | source | axe held (mornings) | fell-capable morning |
|------|-------------------|-------------------|--------|---------------------|----------------------|
| 15505 | 1 | 2 | stash fetch | 2-21 (20 mornings) | NEVER |
| 15509 | 27 | 28 | corpse loot | 28-30 (3 mornings) | NEVER |
| 15215 + 17 others | never | never | — | — | NEVER |

In full: an axe-tier tool is held in 30 days on only 2 of 20 seeds
(15505, 15509), on both legs each — 4 axe legs out of 40. The other
18 seeds hold whittle/none throughout. No seed holds an axe at
spawn (spawn class 0/4); no seed crafts one (craft class 0/4, as
expected with no recipe); no arrival fell into 'other' (0/4) —
both observed routes are narrated by name in the record.

### Strand mornings and the pairing answer

Strand mornings: 12 total, ALL on 15215 — guard 3 (still evenings
7, 8, 9, all pack-ready), ON 9 (still evenings 7-16, 7 needs-wood).
The 19 fresh seeds produce ZERO strand mornings on either leg
(still evenings 0/38 fresh legs; rescued creek evenings exist on
none of the fresh legs either — the creek/bridge path is simply not
exercised there, unlike jointgate's confirm bank which at least
showed rescued evenings).

PAIRING ANSWER: NO. The pairing set is empty over all 40 legs:
no strand morning on any leg shows tier 'fell'. The searched seed
list is 15215 + 15501-15519 (20 seeds, guard + ON each).

### First fell-capable morning: NEVER, on all 40 legs

This is the sharper finding, and it is NOT just the pairing result
restated. Even the two axe-holding seeds never wake fell-capable:

- 15505 holds the hatchet mornings 2-21, but wakes at haven every
  one of those mornings, and the haven tile's detail grid holds no
  tree/bigtree — fell target null on all 20 mornings. Morning 22
  brings a successor (wanjiru_kamau) holding a machete (brush tier):
  the hatchet leaves with the dead vessel; it is not inherited.
- 15509 holds the hatchet mornings 28-30, all at haven, target null
  on all three.

So on this stack, axe-holding and fell-capable waking never co-occur
at all — not merely never on strand mornings. A fell-capable morning
needs BOTH the axe AND an away-from-haven wake tile with trees. The
strand mornings supply the second half (jointgate: a bigtree stands
2-3 steps away on every 15215 strand morning); what they lack is the
first half. The two halves live on disjoint seeds, as jointgate
found — and this fresh band extends that shape: axe seeds don't
strand, the strand seed has no axe, AND axe seeds don't even wake
near trees.

## 2. DRIFT WATCH — strand membership re-derived on current master

15215, re-derived here (never quoted from a prior bank as current):

- Guard still evenings [7, 8, 9] — IDENTICAL to jointgate guard.
- ON still evenings [7, 8, 9, 10, 11, 12, 13, 14, 15, 16] —
  IDENTICAL to jointgate ON.
- Spawn stash, both legs, IDENTICAL to jointgate:
  [multitool, hunting_spear, work_gloves]; inventory
  [buskers_harmonica, Trail mix x2, Dried meat x2]; equipped
  [trail_compass, search_locket, whetstone, carpenters_square];
  tier 'none'. No axe-tier weapon in stash, inventory, or equipped.
- Strand mornings: guard 3, ON 9 — IDENTICAL to jointgate.
- 15215 axe result: never in 30 days, both legs — IDENTICAL to
  jointgate.

DRIFT VERDICT: none. The strand, the stash, and the never-axe result
reproduce number-for-number on the new base (003a9c2f3). The
fresh-band result is therefore a genuine extension, not a base
artifact: the axe/strand non-overlap holds on 20 newly searched
seeds, not just on jointgate's bank.

## 3. THE TWO SUPPLY ROUTES, IN DETAIL

### Stash fetch — 15505, day 1 (both legs, identical)

Spawn stash [hand_saw, hatchet, canvas_pants]. Day-1 fetch lines,
quoted verbatim (both legs): "You remember the Hatchet at your
space in the haven and fetch it — it rides in your pack now."
First-axe evening loopDay 1, first-axe morning loopDay 2, held
mornings 2-21 by vessel gen_juo3a4w. This is the stashfetch-a
routine firing on a stash that actually contains a hatchet — the
positive control jointgate used (15337) reproduced on a fresh seed.
Cost in play: nothing — the vessel already owned the hatchet; the
routine only moves it from stash to pack. Timing: before any
strand window on this stack (strand mornings start day 7 at the
earliest here), so this route CAN in principle supply a strand
morning — on a seed that strands. 15505 does not strand.

### Corpse loot — 15509, day 27 (both legs, identical)

Evening loopDay 26: tier 'none', bare hands. Evening loopDay 27:
"Taken: Denim Jacket x1, Hatchet x1, Phase blade x1, Gravity well
x1." / "You take denim jacket, hatchet, phase blade, gravity well
from Nargiz. Your hands know what they did. (+14 trauma)" /
"The body is stripped. What's left isn't worth taking."
First-axe evening loopDay 27, first-axe morning loopDay 28, held
mornings 28-30. The hatchet arrives as one item in a dead
villager's whole gear set, on the day the village digs its first
grave. Cost in play: a villager's death + 14 trauma + the social
weight of stripping a body at the fire. Timing: day 27 — far too
late for any day-7-to-16 strand window, and contingent on a death
the design cannot schedule. This route cannot be the axe-supply
plan for a fell fix; it is a windfall, not a supply line.

## 4. SENSE-TEST (law — read end to end)

Two arrival evenings, one per source class present (the prereg's
minimum; both classes present in this census, so both read):

- 15505 day 1 (stash fetch): a haven evening that reads as a person
  settling in — barter stirring, villagers lingering over the fire,
  the fetch lines for hatchet + canvas pants from the vessel's own
  space, journal entries, tending the sick (Marelize, cool cloth and
  bitter tea), a fire confrontation about lying over food, names
  learned one by one, then eating 1400 kcal. Morning 2: 2400 kcal,
  at haven, hatchet held. PASS on meaning: the fetch is narrated as
  remembering one's own gear, exactly as stashfetch canon describes,
  and the morning after is a fed haven morning — the axe arrives
  without any story strain.
- 15509 day 27 (corpse loot): a hard evening that reads as a
  village absorbing a death — foraging a grove clean (530 kcal),
  the news that Nargiz killed the Paparazzo alone and died for it,
  the Codex turning its own page ("Nargiz is dead. You didn't ask.
  It knew."), the first-grave crisis, the System's own shock
  ("Was that supposed to happen?"), then the taking with its
  trauma price and the stripped-body line, then a counter learned
  from the dead fight. PASS on meaning: the loot is not a free
  item drop — it is priced in grief, trauma, and a village ritual,
  and the narration never pretends otherwise.

What the sense-read adds to the census: both routes are honestly
narrated and both are real in-story events, not recorder artifacts.
The gap is distributional, not narrational — the honest routes
exist, they just don't converge on the villager who needs the axe
where the trees are.

## 5. AXE-SUPPLY-FIRST DESIGN PROPOSAL (proposal only, no game change)

### Recommended route: spawn-stash hatchet (the day-1 fetch route)

The census prices the alternatives, and only one route delivers an
axe before a strand window without a death:

- SPAWN-STASH HATCHET (recommended): the vessel's spawn stash
  contains a hatchet; the existing day-1 fetch routine moves it to
  the pack (proven on 15505: evening 1 / morning 2, both legs, zero
  play cost, narrated honestly). What would have to change in game
  code: the spawn-stash pools in src/data/characterGen.json (data,
  not engine code) — widen the pool that deals the strand-road
  vessel's stash so a hatchet can land there, OR add a targeted
  starting-gear rule for vessels whose road includes the creek /
  bridge path. The change is a data-pool change plus a census
  re-run; no new routine, no new narration, no new system. What it
  costs in play: one stash slot and an axe from day 1 — which must
  be measured against the dinner test (does an early axe trivialize
  survival? No on its face: felling costs 96 ticks + 80 kcal per
  tree and converts time + food into wood, not into food; but the
  re-run must confirm wood income doesn't collapse the early game).
- CORPSE LOOT (rejected as the plan): proven on 15509 but day 27,
  death-contingent, trauma-priced, and unplannable. It stays as a
  windfall route, never the supply line.
- CRAFT (rejected for now): no recipe exists in recipes.json, so
  this route would need a new recipe + materials + teaching path —
  the biggest build of the three, for a tool the game already
  distributes by stash. Revisit only if spawn pools are ruled out
  for design reasons (e.g. Steve rules that starting gear must stay
  as dealt).
- TRADE / GIFT / MONSTER LOOT (unobserved): no arrival on this
  census used them (0/4 legs). They are not proposed until some
  census shows one firing.

### Necessary but not sufficient — the proposal's second half

Supplying the axe alone does NOT create a fell-capable morning on
this stack: both observed axe-holders wake at haven, where no
fell target exists. The proposal therefore has two halves, and the
first without the second proves nothing:

1. Axe in the strand-road vessel's stash (this proposal), AND
2. That vessel sleeping out where trees stand — which the strand
   itself provides on 15215 (bigtree 2-3 steps away on every strand
   morning, jointgate) — PLUS the morning-food half, which this
   census does not solve: jointgate showed fed failing 7/7 on
   15215 ON needs-wood strand mornings, and nothing here changes
   that. A fell fix built on this proposal must pre-register fed
   mornings (morning-side food mechanism, per the 0741Z next blank)
   alongside axe supply, or it will move the failure from the tool
   gate to the kcal gate and claim a win it didn't earn.

### Measurement plan for the proposal (for the arm that builds it)

Re-run THIS census (same substrate, same seeds, same analyzer) with
the spawn-pool change in place. GO for the supply half: 15215 holds
a hatchet from morning 2 on both legs AND at least one 15215 strand
morning shows tier 'fell' with a fell target (fell-capable at wake).
The fed half is judged separately, never folded into the supply GO.
If the spawn-pool change also moves axe rates on the 19 fresh seeds
(15505-class day-1 fetches appearing elsewhere), report the new
rate — a supply change that floods every seed with axes is a
different design decision from one that supplies the strand road.

## Village assessment (plain words)

The village on this band is a working village that survives its
month on every leg — forty legs, forty survivals, no village lost,
waves climbed to 2 almost everywhere and 3 on one seed. But its
tool story is thin: eighteen of twenty villages never touch an axe
in a month, and the two that do get theirs in opposite ways — one
by owning one from the start, one by stripping a dead friend. The
village that sleeps out by the creek, the one whose mornings the
strand arms have followed for days, carries a stone knife past
bigtrees it cannot fell and wakes hungry; the villages with axes
sleep at home where there is nothing to fell. What the village is
missing is not a better axe — the hatchet exists, the fetch works,
the loot works — it is the meeting of the axe with the morning that
needs it. Until a hatchet rides in the pack of the villager who
wakes out by the trees, every morning-fell fix is gated on a
meeting that never happens on this stack.

## Reachability

No new content reached; no game change landed, so no reachability
change is claimed. Wave reach (maxWaveUnlocked, 40 legs): wave 1 on
15215 (both legs), 15505 (both), 15511 (both); wave 3 on 15507
(both); wave 2 on the other 15 seeds (both legs). Waves 4-5 in 0/40
legs in this 30-day window (same window as the prior strand arms;
the strand seed's climb stalls at the creek, not at a wave gate,
on these legs). Creek/bridge content reached on 15215 only (10
creek evenings ON, 4 guard); the fresh band exercises no creek
evenings at all.

## Wall numbers

NOT OBSERVABLE as reachability on a 30-day pre-seat census —
reported, never claimed. Observed counts on all 40 legs, all seeds
alive at day 30 (daysAlive 30, endReason survived): national 0,
table 0, wins 0 (structurally unreachable in this band, not a wall
measurement); median survival 30 days (ceiling — all legs survived
the window).

## 6. §15 panel — refusal recorded verbatim

As the prereg required, the panel's compare path was attempted with
the recorder rows (pilot census JSON as both before and after).
The panel refused them. Verbatim:

- stdout: `invalid`, exit code 2.
- Report (sim-axefirst-b-panel-compare.md, attempt output):
  "Decision: invalid — Not a balanced panel (missing
  options/rows/sources/validity); per-seed sweep corpora are compared
  via the sweep-corpus path. Invalid comparisons must be repaired
  before interpretation."
- Report JSON decision field: `"decision": "invalid"`, errors:
  `["Not a balanced panel (missing options/rows/sources/validity);
  per-seed sweep corpora are compared via the sweep-corpus path"]`.

No panel result is fabricated from this refusal. The judged
comparison is the standalone census analyzer's guard-vs-ON
comparison, attached as sim-axefirst-b-compare.md, and it is never
labeled a panel result. (The attempt's output files were removed
from evidence/ after capturing the refusal verbatim above; the
standalone compare file is the attached comparison.)

## Metric review

- The source classifier's 'craft' class went unused (0/4 legs),
  consistent with the prereg's note that no hatchet recipe exists
  in recipes.json. No 'craft' arrival appeared to test the
  full-lines-quoted rule against — the rule stands untested, not
  validated.
- The 'other' class went unused (0/4 legs): both observed routes
  fired their named line patterns on the first attempt. 'Other'
  remains a documentation device for future censuses, not a result
  here.
- The 'spawn' class went unused (0/4 legs): 15505's hatchet sat in
  the spawn STASH, not the spawn inventory/equipped — so the
  arrival correctly classed as 'stash fetch', not 'spawn'. The
  spawn-vs-stash distinction in the classifier behaved as designed.
- First-axe EVENING vs MORNING dating behaved: 15505 eve 1 / morn 2
  and 15509 eve 27 / morn 28, exactly the intraday-bracket shape the
  prereg anticipated. No arrival was dated a day late by snap
  choice.
- Fell-capable mornings behaved as a definition, not a trap: haven
  mornings correctly yield target null (not evaluable as fellable),
  and the held-but-never-fell-capable flag correctly separates
  "holds an axe" from "can fell at wake". A reader who wants
  "holds an axe" alone can read firstAxeMorning; the stricter
  fell-capable count is the one that matters for a fell fix, and it
  is 0/40.
- Guard-vs-ON acquisition agreement (identical first-axe day and
  source on both legs of both axe seeds) confirms warmth perturbs
  nothing about axe supply: the acquisition contrast is clean, and
  the strand divergence after day 7 on 15215 is warmth's doing, not
  recorder noise.
- Strand membership is re-derived per leg from that leg's own
  woodcarry records, never from a prior bank's strand list. The
  fresh band's zero strand mornings are reported as "no
  denominator", not as "0% pairing" — the pairing denominator is
  the 12 strand mornings that exist, all on 15215.
- No metric was re-scored mid-run. The pairing NO, the never
  fell-capable count, and the 2-of-20 axe rate are findings under
  the frozen definitions, not verdict changes.

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-31 — food-economy/tool — AXE-HOLDERS NEVER WAKE
  FELL-CAPABLE (this arm): on all 40 legs, zero fell-capable
  mornings — even the 4 axe legs wake at haven, where the detail
  grid holds no tree/bigtree. Axe supply alone cannot create a
  fell-capable morning; the axe must meet an away-from-haven wake
  tile with trees. (evidence: this file §1; judged axefirst
  corpora, 15505 + 15509.)
- [open] 2026-10-31 — food-economy/tool — HATCHET NOT INHERITED AT
  SUCCESSION (this arm): on 15505, the hatchet leaves with the dead
  vessel (mornings 2-21 fell, morning 22 successor with machete).
  A supplied axe is lost at succession unless the successor's gear
  or the death-pack route carries it. (evidence: this file §1/§3;
  judged 15505 pilot corpora.)
- [open] 2026-10-31 — food-economy/tool — CORPSE-LOOT AXE IS DAY-27
  WINDFALL, NOT SUPPLY (this arm): the only non-stash route
  observed arrives day 27 via a villager death (15509, Nargiz).
  Any design that leans on corpse loot for early axes is leaning
  on a death it cannot schedule. (evidence: this file §3;
  judged 15509 confirm corpora.)
- This worker does NOT edit hidden_files/sim-findings.md — the
  coordinator marks backlog items at closeout.

## Infrastructure

- Leg runtimes: pilot guard 82s (8 legs), pilot ON 90s (8 legs),
  confirm guard 122s (12 legs), confirm ON 171s (12 legs). No
  EPERM lock failure hit this arm's git writes or evidence writes
  (the coordinator's registration flap preceded this worker; this
  worker's own commits and corpus writes all succeeded on first
  attempt).
- safe-commit index clobber hit all three instrument/prereg
  commits (commits correct; index showed staged deletions with
  byte-identical worktree files); repaired each time via
  `git update-index --add --cacheinfo` from HEAD blobs, verified
  status empty + diff HEAD empty before continuing.
- check.js --quick NOT re-run (zero src/js, zero policy-default
  flips; arm proof green on the rebased branch, same disclosure as
  prior DIAG arms).
- Worktree contains only committed work plus the judged corpora /
  census / evidence / compare files below, to be committed now;
  no uncommitted leftovers will remain at handoff.
