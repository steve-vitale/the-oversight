# sim-stashfetch-a — the 15337 stash-fetch trigger, isolated (backlog #1597)

Run: oversight-flesh-out-loop, run fleshout-20261031T0537Z,
arm sim-stashfetch-a, axis food-economy. Worktree
sim-stashfetch-a. DIAG ONLY: measurement, zero src/js
changes, zero policy-default flips, zero edits to any
existing policy file, driver, analyzer, or proof file.
New files only: the recorder driver, the analyzer, the
proof, the prereg, this evidence file, the census JSONs,
and the corpora below. Sibling worktrees never touched.
Main tree never touched. Nothing is merged by this worker
(the coordinator merges); report status: commit hashes +
proof counts + verdict below. The coordinator marks
backlog item #1597 at closeout — this worker does NOT
edit hidden_files/sim-findings.md.

## Answer in one paragraph (plain words)

The fetch on seed 15337 is not a quirk of that seed and
not a product of the variant stack. It is the game's
ordinary daily routine doing exactly what it was built
to do: once a day, when the player-character is home,
they pick up the best weapon and the best armor sitting
at their own space in the haven — if it beats what they
already wear — and put it in their pack. On 15337 that
happened to be a hatchet and bark armor on day 1,
because those were the weapon and armor the character
had left at their space when the game began. Turn off
the variant pieces one at a time, or drop the variant
stack entirely for the plain village policy, and the
fetch still fires on day 1, because no variant piece
controls it. What turns it off is the routine's own
rules: after day 1 there is nothing left worth fetching
(the day's fetch is spent, the hatchet is already worn),
and things that are neither weapons nor armor — the
snare wire, the hand saw — stay sitting at the space
forever. The older "never held" finding is explained
too: it was measured before this routine existed in the
game at all.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-31/sim-stashfetch-a-prereg.md (commit
ae16dea4b0), instrument (commit 3d2c5243), plus one
pilot analyzer fix (commit 50484ac7, AFTER the pilot
and BEFORE any judged leg — see Instrument notes).
Pinned base f44ec6957 (worktree HEAD at prereg writing
time; prereg, instrument, and corpus commits add
tooling/evidence only, so all legs run on pinned-base
game code verbatim — verified by the proof's
tracked-diff guard: src/ + scripts/policies/ diff empty
vs f44ec6957).

DIAG verdict, judged exactly as written — DIAG-GO iff
(a) recorder complete on every leg (spawn +
loopDay-1-evening + loopDay-2-morning snaps, errs 0,
fetch indicator valid on every seed/cell), AND
(b) TRIGGER ISOLATED: either a stack cell turns the
15337 day-1 weapon fetch OFF, OR all cells fire AND the
firing call's pre-state probe verifies every code gate
true AND at least one gate-failing negative control on
the same stack shows NO fetch, AND (c) determinism
re-run byte-identical, AND (d) the live gate probe
passes (direct fetch -> hatchet, same-day re-call ->
null, direct armor fetch -> bark armor, re-call ->
null). The GO refinement (stack-cell OFF *or*
gate-state OFF) is justified in the prereg before any
sim: the fetch routines read no policy flag, so their
on/off conditions are state gates, not stack cells.

## Trajectory under test

The axearrival variant stack, ablated: nighttravel base
+ woodcarry + woodwarm + strandfix wrappers, with
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1 held fixed (the fetch routines read none
of them — code-read, see below). Horizon DAYS=5,
death-aware (runDays stops at Game.over): the target is
a day-1 event, day 2 confirms equip + pool shrink, days
3-5 prove no re-fetch.

## Instruments

- Recorder driver: scripts/stashfetch-trace-a.js
  (adapted from scripts/axearrival-trace-a.js, same snap
  shape + write transport, plus log-only wrappers around
  vesselStashFetch / vesselArmorFetch that capture the
  PRE-CALL gate state, and a log-only Game.tele wrapper
  for the vessel_stash_fetch / vessel_armor_fetch
  events). The recorder never calls a state-editing
  verb and never calls getPerson on NPCs (vessel only).
- Analyzer: scripts/analyze-stashfetch-a.js (pure reads:
  five-channel fetch indicator per seed per kind —
  wrapper result, tele event, fetch line, evening inv
  gain, next-morning pool shrink; any channel
  disagreement -> INVALID).
- Proof: scripts/test-stashfetch-a.js (see Proof).

## 1. PILOT GATE — PASS (gate only, never judged)

SEEDS=15337 + fresh band 15501-15507, stack V, into
sim-stashfetch-a-corpus-pilot: 8/8 files present,
recorder errs 0, spawn + day-1-evening + day-2-morning
snaps complete on all 8. One analyzer bug surfaced in
the pilot (both fetches fire day 1, so the raw evening
gain and pool shrink name weapon AND armor — the
unfiltered channels classified all 8 INVALID) and was
fixed pre-judged by kind-filtering gained/shrunk (see
Instrument notes). After the fix: 8/8 weapon FETCH,
8/8 armor FETCH, 0 INVALID. Pilot files are NEVER
mixed into judged corpora.

## 2. THE CODE GATES (read from src/js/villager-build.js)

`vesselStashFetch()` (weapon) fires only when ALL hold:
game not over; scholar state exists; no fetch yet today
(`_stashFetchDay != day`); vessel id exists; vessel at
haven (`playerAtHaven()` — map distance from the home
center <= 1 tile, NOT the inside-building flag; see §6);
vessel person exists and is alive; stash non-empty;
some stashed item is a weapon (`class == 'weapon'`)
for a melee/ranged slot, not already carried/equipped,
whose bonus BEATS the bonus worn in that slot (empty
slot = 0). `vesselArmorFetch()` mirrors this for armor
(own day flag `_armorFetchDay`, gain > 0 over the worn
piece). The routines read NO policy flag and NO env
var, and `villagerBuildDay()` is called unconditionally
from endDay — so the code-read prediction before any
ablation leg was: the fetch fires on every stack. The
ablation below tests that prediction, not the reverse.

## 3. THE ABLATION — 15337, FIVE CELLS, ALL FIRE

| cell | stack | day-1 weapon | day-1 armor | errs |
|------|-------|--------------|-------------|------|
| V | nighttravel WC1 WW1 SF1 (axearrival verbatim) | FETCH hatchet | FETCH bark_armor | 0 |
| A | nighttravel WC1 WW1 SF0 (strandfix off) | FETCH hatchet | FETCH bark_armor | 0 |
| B | nighttravel WC1 WW0 SF1 (woodwarm off) | FETCH hatchet | FETCH bark_armor | 0 |
| C | nighttravel WC1 WW0 SF0 (both off) | FETCH hatchet | FETCH bark_armor | 0 |
| P | competent, NO wrappers (WC0 WW0 SF0) | FETCH hatchet | FETCH bark_armor | 0 |

Every cell: recorder complete, indicator valid on all
five channels, spawn stash [snare_wire, hatchet,
bark_armor] in every cell (the same spawn, so the
ablation is a pure stack comparison). No variant-stack
component is necessary for the fetch — STRANDFIX,
WOODWARM, and the whole nighttravel/woodcarry substrate
are all excluded as triggers. Cell P is the sharpest
exclusion: the plain village policy, with no variant
wrapper at all, fetches on day 1 exactly like the
variant stack.

## 4. THE FIRING CALL'S PRE-STATE (probe, 15337 day 1)

Weapon-fetch call, cell V (identical in cell P):
over=false, scholar day=1, `_stashFetchDay` unset
(null), atHaven=true, person alive=true, stash
[snare_wire, hatchet, bark_armor], wielded melee empty
(bonus 0 < hatchet 15), inv [search_locket]. Every code
gate true on the firing call. Armor-fetch call, same
day, immediately after: stash [snare_wire, bark_armor]
(hatchet already moved), inv [search_locket, hatchet],
`_armorFetchDay` unset — the armor routine's own flag,
not the weapon flag, so both fetches land on day 1.
Result: {item: hatchet, slot: melee} and {item:
bark_armor, slot: torso}; tele events vessel_stash_fetch
/ vessel_armor_fetch; both fetch lines narrated.

## 5. THE OFF STATES (same seed, same routine, no fetch)

The on/off demonstration the verdict requires, all
inside the judged corpora (not hypotheticals):

- DAY-FLAG + ALREADY-CARRIED + NO-BEATING-WEAPON
  (15337, cells V and P, days 2-5): every later call
  returns null with dayFlag=1, stash=[snare_wire],
  wielded melee=hatchet. Same routine, same seed: fires
  day 1, never again. The day-1 fetch consumes all
  three off-conditions at once.
- CLASS GATE (all 20 pilot+confirm seeds): the third
  stashed item — neither weapon nor armor — NEVER
  fetches. Day-2 stashes: snare_wire (4 seeds),
  binoculars (2), anchors_locket (2), hiking_backpack
  (2), and one each of merchants_seals, field_sutures,
  hand_saw, memory_seed_vault, multitool, fishing_line,
  decoy_rattle, grandfathers_knife, lighter, nowhere_idol.
  The hand_saw case is the cleanest: a stashed cutting
  tool with a woodcut tag (prune) is still not a weapon
  by class, so the weapon routine skips it — and it is
  not armor either, so the armor routine skips it too.
- The atHaven-false branch was NOT exercised (see §6):
  no leg put the vessel more than 1 tile from home at
  an endDay, so that gate is verified on its true side
  (day-1 firing calls) + code-read only. The verdict
  does not rest on it: three independent off-states
  above already satisfy bar (b)(ii).

## 6. GENERALITY — 20/20 ON THE VARIANT STACK, 9 WEAPONS

Pilot + confirm (15501-15519, stack V, DAYS=5):
20/20 weapon FETCH, 20/20 armor FETCH, 0 INVALID,
recorder errs 0, complete 20/20. Weapons fetched:
hatchet (2 seeds), sling (3), fire_hardened_spear (3),
crude_bow (4), crowbar (3), crossbow (1),
hunting_spear (1), sharpened_stick (1), stone_knife
(2). Armors fetched: bark_armor, conquerors_plate,
good_boots, work_gloves (4), canvas_pants, denim_jacket
(2), rain_poncho, investigators_coat, flannel_shirt
(2), padded_cloth, rain_shell, leather_jacket. 15337 is
not special: it is one instance of a routine that fires
whenever a vessel spawns with a stashed weapon and
armor — which, on these seeds, is every time (see
Out-of-scope observations). The older axeacq contrast
is base drift, not stack: axeacq's pinned base
082cfa19e (2026-10-30 11:21 UTC) predates the
stashfetch landing 21efcdcb2 (2026-10-30 14:28 UTC),
so the routine did not exist when axeacq measured
"never held"; axearrival's base ae15fd8f1 includes it,
and this base f44ec6957 includes it too.

## 7. SENSE-TEST (law — day 1 read end to end, judged for meaning)

Day 1 reads as a person coming home to their own things.
The vessel starts the day with only a search locket in
hand; the evening lines say, in plain words, that they
remember the hatchet and the bark armor at their space
in the haven and fetch them, and the pack now carries
both. Day 2's policy gearUp equips both ("Equipped
Hatchet (melee)" pattern from stashfetch-b; this arm's
day-2 evening snaps show hatchet + bark_armor equipped
on 15337). PASS on mechanism: the taking is from the
vessel's OWN stash, narrated, with nothing granted or
generated — the snare wire stays behind because it is
not gear the routine fetches, which is the honest
version of the same rule. One wrinkle, same class as
axearrival's loot note: the fetch lines never say the
vessel chose between the hatchet and anything else —
the routine picks the best bonus silently and narrates
only the pick. A player understands WHAT was fetched
but not that a comparison happened. Small narration
gap, not a behavior claim.

## 8. WALL NUMBERS (structural window values, not a wall verdict)

5-day pre-seat trajectory, 26 legs (pilot 8 + cells 5 +
determinism 1 + confirm 12), all survived the window:
national 0, table 0, wins 0 on every leg (no
national/table/win content in the window). No wall
verdict is claimed from a 5-day window.

## VERDICT — DIAG-GO

(a) recorder complete on every leg (26/26, errs 0,
indicators valid); (b) TRIGGER ISOLATED via prereg
branch (ii): all five 15337 cells fire, every code gate
verified true on the firing calls, and three
independent gate-failing off-states recorded (day-flag,
already-carried/no-beating-weapon, class gate);
(c) determinism re-run byte-identical to cell V (and
the pilot's 15337 leg byte-identical to cell V);
(d) live gate probe passes (direct weapon fetch ->
hatchet, same-day re-call -> null, direct armor fetch
-> bark armor, re-call -> null). The backlog item's
blank is filled: the trigger is the ungated daily
vesselStashFetch / vesselArmorFetch routines + a spawn
stash holding a beating weapon/armor, with no variant
component involved. No game change is proposed, landed,
or enabled by this arm — a GO verdict certifies the
DIAGNOSIS, not a fix.

## Proof

scripts/test-stashfetch-a.js: 93/93 checks pass with
--require-corpus, including: static ladder facts
(hatchet the ONLY fell-tier item, +15, woodcut fell;
bark_armor protection 10; every fetch gate string
present; no env read inside either fetch routine);
analyzer fixtures (all-five-channels -> FETCH,
no-channel -> NOFETCH, missing tele -> INVALID,
missing day-2 morning -> INVALID); live gate probe
D1-D14 on a fresh 15337 load; corpus checks (pilot
8/8 complete, errs 0, 15337 FETCH/FETCH; all five
cells complete, errs 0, valid indicators, spawn stash
matches the axearrival record; determinism
byte-identical; confirm 12/12 complete, errs 0, 0
INVALID; src/ + scripts/policies/ diff empty vs
pinned base f44ec6957).

## Instrument notes (disclosed)

1. Pilot analyzer fix (post-pilot, pre-judged): the
   gained/shrunk channels were not kind-filtered, so
   every pilot seed classified multi-item INVALID
   (both fetches fire day 1). The fix filters gained/
   shrunk to the indicator's kind. Corpora unchanged
   (pure re-read); pilot gate re-verified after the
   fix (8/8 FETCH/FETCH). Pilot files (fixed analyzer
   output) are never mixed into judged corpora.
2. After three safe-commits, the known index-clobber
   variant hit (worktree file byte-identical to HEAD
   but the main index staged a deletion or the pre-fix
   blob) and was repaired via cacheinfo from the HEAD
   blob (hash-object verified equal first); every
   commit's content was verified against `git show
   --stat HEAD` before proceeding. The commits are
   correct; only the main index lied (three times).
3. Write flap (2026-10-31 ~06:05-06:12 UTC): all git
   and node writes failed EPERM for ~7 minutes (3
   safe-commit attempts, manual git read-tree, node
   fixture writes, even shell redirection in a scratch
   repo). The flap-response skill's probe loop
   (`git update-ref refs/heads/probe HEAD`, 45s
   spacing) failed 7 times, then cleared on attempt 8;
   no work was forced through the flap and no ref was
   hand-edited. Prereg + instrument commits landed
   after clearance. If a later run hits the same flap,
   probe first, wait, and never route around it.
4. Evening axe snaps carry no pool read (pool reads
   stay on morning + spawn snaps, matching axearrival).
   Pool shrink for a day-1 arrival is read off the
   day-2 morning pool. No judged arrival sits anywhere
   else, so the rule never touches the verdict.
5. Tele channel availability: Game.tele exists in the
   harness (runDays wraps it, chaining the recorder's
   wrapper), so all five indicator channels fired on
   every judged leg. Had tele been absent, the
   indicator would have needed a prereg amendment
   before judged legs; it was not.

## Metric review

- The four DIAG-GO bars bound the run and were met
  without re-scoring: completeness is a snap count,
  the trigger is a cell table + probe pre-states +
  recorded off-states, determinism is byte-identity,
  and the probe is direct routine invocation. The one
  refinement (stack-cell OFF *or* gate-state OFF) was
  written in the prereg BEFORE any sim with its
  justification (the routines read no policy flag), so
  it is a pre-registered branch, not a mid-run
  re-score. The pilot analyzer fix is a fidelity fix
  (channel definition), not a threshold change: the
  five-channel rule is unchanged, and the fix makes the
  channels measure what the prereg says they measure.
- The 'INVALID' class did its job: it caught the
  analyzer's kind-mixing on the pilot instead of
  letting a two-item gain pass as a one-item fetch.
  A future prereg reusing this indicator should state
  the kind filter explicitly from the start.
- The 5-day horizon proved sufficient for a day-1
  routine (fetch + equip + 3 no-refetch days), and the
  26-leg / 20-seed generality band was cheap (~3s per
  5-day leg). A longer horizon would not have changed
  any verdict field: the routines carry no state
  beyond the per-day flags and the stash itself.
- No metric revision is proposed for the indicator,
  the horizon, or the GO bars.

## Out-of-scope observations (NOT chased; for the coordinator's backlog)

- [open] 2026-10-31 — instruments — AT-HAVEN-FALSE
  BRANCH UNEXERCISED (this arm): playerAtHaven() is a
  map-proximity gate (<= 1 tile from home center), not
  the inside-building flag — the plain-competent cell's
  vessel spent days 3-5 outside the building but still
  on the haven tile, so atHaven stayed true. No leg
  observed a fetch call with atHaven false; a future
  arm wanting that branch needs a vessel genuinely away
  from home at an endDay. (evidence: this file, §5-§6;
  cell-P corpus.)
- [open] 2026-10-31 — spawn — STASH SHAPE PATTERN
  (this arm, observation only, NOT a generator claim):
  all 23 seeds examined here (3 axearrival bankcheck +
  20 pilot/confirm) spawned with exactly one stashed
  weapon + one stashed armor + one other item. If the
  pool generator guarantees that shape, a "no stashed
  weapon" spawn may not exist to serve as a negative
  control — the class gate (third item stays) and the
  day-flag gate are the available off-states instead.
  (evidence: this file, §5-§6; pilot + confirm
  censuses.)
- [open] 2026-10-31 — narration — FETCH COMPARISON
  UNVOICED (this arm, sense-test): the fetch lines
  narrate the pick but not the comparison (best bonus
  wins silently). Small narration gap, not a behavior
  claim. (evidence: this file, §7.)

## Files

- Prereg: evidence/2026-10-31/sim-stashfetch-a-prereg.md
  (commit ae16dea4b0)
- Evidence (this file): evidence/2026-10-31/
  sim-stashfetch-a.md
- Recorder: scripts/stashfetch-trace-a.js; analyzer:
  scripts/analyze-stashfetch-a.js; proof:
  scripts/test-stashfetch-a.js (93/93 with
  --require-corpus; 34/34 without)
- Instrument: commit 3d2c5243; analyzer pilot fix:
  commit 50484ac7
- Pilot (gate-only, never judged): evidence/2026-10-31/
  sim-stashfetch-a-corpus-pilot (15337, 15501-15507)
  + sim-stashfetch-a-census-pilot.json
- Judged cells: evidence/2026-10-31/
  sim-stashfetch-a-corpus-cell-V (15337),
  sim-stashfetch-a-corpus-cell-A,
  sim-stashfetch-a-corpus-cell-B,
  sim-stashfetch-a-corpus-cell-C,
  sim-stashfetch-a-corpus-cell-P + censuses
  sim-stashfetch-a-census-cell-*.json
- Determinism: evidence/2026-10-31/
  sim-stashfetch-a-corpus-cell-V-determinism (15337
  re-run, byte-identical to cell V)
- Confirm (generality): evidence/2026-10-31/
  sim-stashfetch-a-corpus-confirm (15508-15519) +
  sim-stashfetch-a-census-confirm.json
