# sim-axefirst-b-r1430 — PREREG (binding; committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T1430Z,
arm sim-axefirst-b (lever run), axis food-economy, tracker blank 3
(run 1047Z). Worktree sim-axefirst-b. Pinned base:
47162b801a9763ed92a54bcbd633ec56b9fb049d (worktree HEAD at
prereg writing time; this file is the only file in its commit, so
all judged legs run on pinned-base code plus exactly the lever +
instrument files named below, and the proof's tracked-diff guard
enforces that shape).

## Filename note (read first — this run does NOT overwrite a record)

evidence/2026-10-31/sim-axefirst-b.md and
sim-axefirst-b-prereg.md already hold the 0841Z run's DIAG census
(40 legs, DIAG-GO — read in full below). This 1430Z run is a
DIFFERENT assignment (a lever design, not a census) that the task
brief names sim-axefirst-b. Overwriting those files would destroy
the 0841Z record, so this run's files carry the -r1430 suffix
throughout: this prereg, evidence sim-axefirst-b-r1430.md,
corpora sim-axefirst-b-r1430-corpus-*, census
sim-axefirst-b-r1430-census-*.json, instruments
scripts/axefirst-r1430-trace-b.js,
scripts/analyze-axefirst-r1430-b.js,
scripts/test-axefirst-r1430-b.js,
scripts/axefirst-r1430-split-b.js, policy
scripts/policies/axefirst-diag.js. The coordinator renames or
merges as it sees fit; nothing here touches the 0841Z files, and
no 0841Z instrument file is edited (the r1430 driver/analyzer are
copies under new names, modified for the lever).

## Prior evidence read in full before designing anything

- evidence/2026-10-30/sim-axeacq-b.md (DIAG-GO: hatchet is the
  only fell-tier item, not craftable, not scavengeable, never
  granted; 0/26 vessels axe-tier by day 7; only arrivals are
  corpse loot and succession; hatchet appears nowhere in
  regions.json).
- evidence/2026-10-30/sim-axearrival-a.md (day-15 corpse loot
  from Ethan via corpseLootAll, on the strandfix-variant stack
  only).
- evidence/2026-10-31/sim-stashfetch-a.md (ordinary daily
  routine: once a day at home, take the best weapon/armor at
  your own haven space if it beats worn; fires on every stack
  incl. plain competent; the fetch moves only what the vessel
  already OWNS).
- evidence/2026-10-31/sim-jointgate-b.md (DIAG-GO: on the census
  stack the only axe-holding seed 15337 never strands while the
  only stranding seed 15215 never holds an axe; joint =
  needs-wood strand mornings only; FED = morning kcal >= 80;
  AXE = tier 'fell'; roomy projection with UNVALIDATED 40
  routine allowance, reused for comparability only).
- evidence/2026-10-31/sim-tickfell-a.md (0 axe-tier snaps on any
  recorded morning of either tickfell leg; FED+AXE+ROOMY never
  co-occur; 7 wood-short ON strand mornings fail tool 7/7 and
  kcal-floor 7/7).
- evidence/2026-10-31/sim-axefirst-b.md (0841Z DIAG census, 40
  legs, DIAG-GO — the closest prior work, and the reason this
  file is suffixed): on a fresh band of 19 seeds + 15215, only
  2/20 seeds hold an axe in 30 days (15505 stash fetch day 1;
  15509 corpse loot day 27); pairing set EMPTY over all 40
  legs; fell-capable mornings NEVER on all 40 legs (axe-holders
  wake at haven, where the detail grid holds no tree/bigtree);
  hatchet NOT inherited at succession (15505: leaves with the
  dead vessel). Its §5 PROPOSES a spawn-stash hatchet (widen
  characterGen pools so the strand-road vessel's stash can
  hold a hatchet) with a measurement plan (15215 holds from
  morning 2 + ≥1 strand morning fell-capable). THIS RUN
  DIFFERS FROM THAT PROPOSAL, deliberately: a dealt stash
  hatchet is zero play cost (the proposal's own words) — it
  is granted, not earned, and the 1430Z brief requires an
  EARNABLY reachable route a villager can actually walk
  (craft, scavenge, trade, loot, or stash). This run builds
  the SCAVENGE route and measures it against the same joint
  bar; the 0841Z stash proposal remains the fallback if this
  route fails, and is not re-litigated here.
- Lootabilities Arm 6, landed master b10f3eb7f (merge
  19b3e1ae0): villagerWeaponCraftDay() in
  src/js/villager-build.js — a WEAPONLESS villager at home
  who personally knows a weapon recipe (own record, seeded
  only by their own hands holding the finished weapon) and
  can reach the materials crafts up the spear/bow ladder
  (hunting_spear, fire_hardened_spear, bow, crude_bow) at
  the player's craft odds. THE HATCHET IS NOT ON THAT
  LADDER. This arm does NOT duplicate it: no edit to
  villager-build.js, no second self-craft system, no ladder
  change. Arm6 also cannot change this arm's outcome: on
  the current base the vessel is not weaponless (day-1
  stash-fetch delivers their own stone_knife — see probe
  note below), and Arm6's ladder contains no fell-tier
  item, so a vessel axe cannot come from Arm6 on any leg.
  Both control and lever legs run on the Arm6-inclusive
  base, so any Arm6 effect is common to both legs and
  cancels in the comparison. Stated explicitly, as tasked.

## Design: AXEFIRST — ruin-run axe supply (data + policy, one system)

The blank, in one line: the vessel's own stash-fetch works,
but the vessel's own stash holds no axe on the strand seed,
and no living-bot channel delivers one before day 7. The
design supplies the axe through the ONE pre-existing
earnable channel that can reach the vessel at haven
before day 7 without reading another villager's state:
the vessel walks to a ruin they can see, and searches it,
paying the engine's own search costs, until a hatchet is
in their own pack or the ruin is picked clean.

Part (a) — DATA, one system (ruin loot data, nothing else):
add one hatchet entry to every region's people.scavenge
pool in src/data/regions.json, in the exact shape of the
gear entries already there (id 'hatchet', name 'Hatchet',
kcal 0, kg 0.7, a plain text line). Rationale, grounded
not invented: ruins already yield household weapons —
machete, crowbar, hunting spear, chef's knife, kitchen
knife are all in region pools today (verified by pool
scan: hatchet in 0/20 pools, those weapons present) — and
lootabilities Arm 3 already blessed this pattern ("one
pry-bar in the legacy pool, so even a region with no
scavenge layer of its own can yield a weapon from a
ruin"). A hatchet is a household tool; a house that can
hide a machete can hide a hatchet. NO src/js change of
any kind. NO other data file. The in-code SCAVENGED
fallback copy is deliberately NOT touched: it serves
harnesses that load no regions.json, and the judged
harness loads regions.json, so the fallback is inert for
every judged leg and editing it would only widen the
diff for no effect.

Part (b) — POLICY PROTOTYPE, one new file only
(scripts/policies/axefirst-diag.js, env-gated AXEFIRST=1/0):
a wrapper over the warmed strand stack. On gameDays 2-6
inclusive, if the vessel starts the day at haven and
holds no axe-tier tool (own woodcutTier only — own
state), the vessel makes ONE deliberate ruin run that
day, then the base daily runs as usual:
- Find the nearest ruin: engine-offered travelTargets
  first (tile type 'ruin' among offered targets); if none
  offered, scan the visible 9x9 board via tileAt for type
  'ruin' (the board the player sees — same class as
  stoneRun's rubble scan, NOT a roster, NOT a loot queue,
  NOT another villager's state). Nearest by Manhattan
  distance.
- Hop-walk there with competent's walkTo pattern (one
  travelTo per hop, no force, bounded). If travel refuses
  and the vessel never arrives, record 'unreached' and
  stop (no teleport, no force).
- Search loop, all guards from the vessel's OWN state:
  Game.doAction('forage', {}) — the engine's own ruin
  search (64 ticks + 100 kcal per search, loot in queue
  order, "Picked clean" when exhausted). Stop on: hatchet
  in own pack/equipped (own inventory scan) OR 12 searches
  OR 2 consecutive searches that add nothing to own pack
  (covers picked-clean and too-heavy without ever reading
  the hidden loot queue) OR ticksLeft < 64 OR kcal < 300
  OR Game.over OR in combat. The tick/kcal guards are
  load-bearing: a pre-prereg probe showed an 8th search
  crossing the day boundary (dayTicks reset, overnight
  burn to 0 kcal) — the loop must never spend the day
  boundary or the vessel's food floor.
- Walk back to the day's start tile (recorded at wrapper
  start — own position, not a haven lookup). If the
  return walk refuses, record 'away' and let the base
  daily + nighttravel evening step bring the vessel home
  as usual.
- Record every run in a store (day, ruin coords,
  searches, found yes/no + day, return status, unreached
  reason). The wrapper never calls a state-editing verb
  except travelTo and doAction('forage') — the two verbs
  a player walking to a ruin and searching it would use.
  It never reads another villager's gear, knowledge,
  materials, or position, never reads a loot queue, never
  builds a list of who holds what. Perception-law clean
  by construction: own tier, own pack, own position, own
  kcal/ticks, the visible board, engine-offered steps.

Why NOT the alternatives (decided here, not re-litigated
mid-run):
- Spawn-stash widening (0841Z §5 proposal) is NOT built
  here: it is the fallback, and it grants rather than
  earns (zero play cost by its own description). If this
  run's earned route fails, the coordinator still has
  that proposal, measured and priced, to fall back on.
- Stone-axe completion is NOT the vehicle: the stone_axe
  recipe exists (stone 1 + wood 1 + vine 2) but has NO item
  def in items.json (so craft() would make a nameless
  non-item woodcutTier ignores), is UNLEARNABLE (the
  vessel's codex starts with stone_knife/cloth/water_filter
  only — verified by probe), and its own L3 text forbids
  the needed tier ("It will not fell an oak"). Giving it
  fell tier would contradict its own canon text; giving
  it a lesser tier would not satisfy canFell on bigtree.
  Documented as a separate blank for the coordinator
  (dead recipe + unlearnable + tier contradiction), not
  built here.
- Trade/gift from a hatchet holder (e.g. Petra Novak, who
  holds a hatchet at spawn on 15215 — verified by probe)
  is NOT the vehicle: no player verb trades items with a
  villager (conversation trade is knowledge-for-knowledge),
  and building one is a new system, not a lever. The
  ownership code blesses deliberate gifts/trades/discards,
  but no such verb exists to prototype against.
- Arm6 extension is NOT the vehicle: the ladder's
  knowledge rule (seeded only by one's own hands holding
  the finished weapon) is circular for a hatchet nobody
  holds, and the task forbids duplicating the ladder.

## Pre-prereg mechanism probes (disclosed; NOT judged legs)

Before this prereg, on UNCHANGED pools, seed 15215:
(1) the guaranteed ruin sits at world (5,4), adjacent to
haven (4,4), offered in travelTargets at d=1; hop-walk
arrives; each doAction('forage') search costs exactly 64
ticks + 100 kcal and takes loot in queue order (15215's
queue on unchanged pools: leather_jacket, machete,
trail_rations_pouch, futures_ledger, can_corn x3,
can_soup x2 — 9 items); the 8th search crossed the day
boundary, which is why the policy carries tick/kcal
guards. (2) Spawn composition HAS drifted since
jointgate/0841Z on this base: the vessel's person stash
now reads [hollow_bone_charm, stone_knife, work_gloves]
(vs [multitool, hunting_spear, work_gloves] on the older
bases), and the vessel's person record is Petra-adjacent
only in the roster sense — Petra Novak still holds a
hatchet at spawn on this base (roster probe). The pilot
re-derives spawn + strand on the edited tree; no spawn
or strand number from an older base is quoted as current.
The probes prove travel + search mechanics and current
spawn shape only; they prove nothing about hatchet draws
(the pool had no hatchet) and no judged number comes
from them.

## Frozen stack (all substrate gates asserted FATAL)

POLICY=nighttravel, WOODCARRY=1, WOODWARM=1,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, STRANDFIX must NOT be 1, PRESSB must NOT
be 1, DAYS=30, AXEFIRST=1 (lever) / 0 (control).
Death-aware: runDays stops at Game.over; dead villages
stop simulating (+10d tail max, moot — the engine stops
the run). The stack is jointgate's ON stack (warmed),
not the guard stack: the ON strand is the long one
(10 nights on 15215 on older bases; re-derived here).

## Seeds

- PILOT: 15215, control + lever (2 legs). Pilot gate:
  recorder complete on both legs (spawn + every morning
  + every evening snap, errs 0) AND determinism leg
  (lever 15215 re-run) byte-identical to the judged
  lever file. Strand presence is a FINDING, not a pilot
  gate: if 15215 no longer strands on this tree, the
  pilot still passes on completeness + determinism and
  the confirm band decides the joint question.
- CONFIRM: bank 15003, 15009, 15091, 15211, 15220, 15221,
  15337, 15376, 15439 (9) + fresh band 16401-16407 (7),
  each control + lever = 32 legs. Fresh band verified
  unused by the prior arms' method before this prereg
  (no 16401-16407 literal in evidence/2026-10-30 or
  2026-10-31 *.md files; no corpus directory name
  containing them; the band does not overlap 0841Z's
  15501-15519 or jointgate's bank).
- PRIMARY DENOMINATOR: the 16 confirm seeds only
  (pilot 15215 reported alongside, never pooled).
- Determinism: lever 15215 re-run byte-identical (pilot
  gate, above). No determinism claim is made for other
  seeds.

## Metrics (binding, §14 — a miss is NO-GO, never re-scored)

Definitions (jointgate's, reused verbatim):
- Strand morning = morning after a still creek evening
  (woodcarry bucket 'creek' + rescued false), waking NOT
  at haven, not game-over, not in combat.
- Needs-wood strand morning = strand morning with
  morningWood < 4. Pack-ready mornings (wood >= 4) are
  NOT in the joint denominator.
- FED = morning kcal >= 80. AXE = woodcutTier tier
  'fell' (cutInfo.canFell must agree; disagreement is a
  recorder error). ROOMY = morningTicksLeft - walkSteps
  - 96 - 40 >= 96 (jointgate's projection, 40 routine
  allowance UNVALIDATED — reused for comparability only).

Primary metric — axe-tier-held by day 7: share of
confirm seeds (n=16) on which the vessel holds an
axe-tier tool (tier 'fell' on any morning/evening snap,
or hatchet itemId in scholar pack/equipped) at any
point with gameDay <= 7. Lever vs control, identical
seeds, same edited data (control isolates the policy:
the data change alone cannot deliver a hatchet before
day 7 unless the base routine searches ruins, which
the control legs test directly — control legs carry
the same edited pools).

GO threshold — GO iff ALL hold:
  (a) primary lever >= 8/16 (50%) AND control <= 2/16;
  (b) JOINT: on every seed that strands on control legs
      (≥1 still creek evening) AND has ≥1 needs-wood
      strand morning on control, the lever leg holds
      axe-tier on ≥1 of ITS needs-wood strand mornings.
      If a stranding seed's lever leg has zero needs-wood
      strand mornings because the strand dissolved
      (zero still evenings on lever), that seed is
      reported MOOT-DISSOLVED (not a pass, not a fail)
      and the dissolution is flagged as a trajectory-
      perturbation finding; GO then requires (a) +
      guardrails + at least one non-moot joint PASS
      elsewhere, or, if 15215 itself dissolved, GO is
      withheld pending a re-read (the joint proof
      cannot be exercised on a dissolved strand).
      If NO seed strands on control legs at all,
      verdict is DIAG-NO-STRAND (the lever's joint
      proof cannot be exercised on this tree) — neither
      GO nor lever-NO-GO.
  (c) GUARDRAILS: (i) no lever leg ends game-over
      before day 30 where its control survived to 30
      (vessel death or game-over only — background
      deaths excluded, tickfell addendum rule);
      (ii) strand length (total still count) on lever
      <= control for every stranding seed (no
      lengthening); (iii) median daysAlive lever >=
      control across confirm legs.
  Otherwise NO-GO (including a lever that clears (a)
  but fails (b) — that is jointgate vacuity, named as
  such, not a partial pass).

Secondary (reported, never judged): axe source on every
lever find (ruin-search line + pack gain + day, or
other — any non-ruin source is classified, never
assumed); fed/roomy co-occurrence on lever strand
mornings (does the axe arrive on mornings where a
fell could actually fire?); ruin-run cost (searches,
kcal, ticks, days spent); strand census per leg
(creek/still/rescued); wave reach; wall numbers
(national/table/wins — structurally 0 on a 30d
pre-seat stack, reported not claimed).

## Transport (mandatory infra pattern)

Game-loaded processes NEVER write files. The driver
prints one JSON line per seed to stdout (summaries to
stderr); the caller redirects stdout to a .jsonl file
in evidence/ in a FOREGROUND exec (stderr to a .log
file); an idle splitter process
(scripts/axefirst-r1430-split-b.js, same retry shape as
scripts/split-jsonl-b.js) splits the .jsonl into
per-seed files and verifies each parses; the .jsonl is
DELETED after a successful split. Never a backgrounded
pipe. Never staged corpora in /tmp.

## Panel (§15)

NON-APPLICABLE, declared explicitly (jointgate's
standing): scripts/balance-panel.js runs sweep-compare
registry policies on 150-day horizons with its own
scorecard; it cannot express the nighttravel+woodcarry+
woodwarm strand stack, the 30-day creek-evening census,
or an env-gated single-mechanism probe, and a 150-day
win/vest panel would measure a different question on a
different substrate. The comparison here is control-vs-
lever legs on identical seeds through the census
analyzer, and is never labeled a panel comparison.
(The 0841Z arm attempted the panel path and recorded a
verbatim refusal; this arm does not re-attempt a refused
path — the non-applicability declaration above is the
standing, and the standalone compare file is the
attached comparison.)

## Sense-test (law)

Read end to end: one lever leg's ruin-run day (the
first find day, or day 2 if no find) + one lever
strand morning if any exists. Judge meaning,
coherence, relevance, consequences — never just counts.

## Metric review (placeholder — completed in evidence)

To be completed in evidence/2026-10-31/sim-axefirst-b-r1430.md
after the legs: whether the metrics bound the run, what
doubts arose, and what revisions are proposed for the
NEXT run (never applied to this one).
