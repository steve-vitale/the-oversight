# sim-stickfiber-b — the stick/fiber supply blank, inventoried and censused (DIAG-GO)

Run: Loop B worker, arm sim-stickfiber-b, axis scale-onramp, next blank
(2) from run fleshout-loop-b-20261031T0249Z. DIAG ONLY: zero src/js,
zero policy-default flips, zero edits to existing policy files. The
deliverable is a landed instrument set + this evidence + a ranked next
arm, not a game change.
Worktree branch: sim-stickfiber-b. Base anchor: a1e3a01a933e (worktree
HEAD; recorded per seed as anchorCommit in the per-seed JSONs).
Pre-registration: evidence/2026-10-31/sim-stickfiber-b-prereg.md
(written BEFORE any judged sims; judged against it below).
Instruments: scripts/ammo-diag-20261031.js (AMMODIAG=1) +
scripts/supply-diag-20261031.js (SUPPLYDIAG=1) +
scripts/stickfiber-diag-20261031.js (STICKFIBERDIAG=1, new: producer
counters + daily scholar-pack stick/fiber snapshot). Sweep:
scripts/stickfiber-sweep-20261031.js. Analyzers:
scripts/stickfiber-analyze-20261031.js (supply-analyzer shape) +
scripts/stickfiber-events-20261031.js (production events).
Inventory script: scripts/stickfiber-inventory-20261031.js.
Proof: scripts/test-stickfiber-20261031.js — 20/20 green (three-way
det-gate: 60d trajectories identical with no instrument, AMMODIAG+
SUPPLYDIAG, and all three; static read-only scan; wrap fixtures
incl. scholar-pack snapshot; real-sweep gate byte-identical re-run).
Corpora: evidence/2026-10-31/perseed-stickfiber-b/baseline/s85101–s85116.json.
No [needs-eyes] (measurement only; nothing player-facing ships).
Panel (§15): NOT APPLICABLE, none fabricated — same rationale as
sim-supply-b / sim-ammo-a Stage 1 (policy-comparison driver; cannot
express this substrate; this arm has no before/after comparison).

## Verdict: DIAG-GO (judged exactly against the prereg)

1. Inventory completeness: all 64 stick/fiber word hits in src/js
   classified (1 pile-write, 4 scholar-inventory, 59 prose-or-name
   each manually reviewed — see inventory table); all 5
   materials-write sites classified; all 52 routine-name definitions
   reviewed; all 14 villager duty tasks reviewed; data checked
   (recipes, items, animals, events, monsters). Zero unexamined
   paths.
2. Census coverage: 16/16 seeds with a complete daily pile series
   (zero pile-null days), zero instrument errors on all three
   instruments, production-event counts reported (pile: zero is a
   complete result, not a missing result).
3. The band verdict answers whether ANY seed ever produces a stick
   or fiber by any path (below), and names what a source routine
   would need as specification only.
4. Sense test done, wall numbers stated honestly.
DIAG-GO.

## The answer, in plain words

Sticks DO exist in this world — in the scholar's pack. They never
exist in the village pile, and no villager ever makes one. Over 16
seeds the scholar's pack gained sticks on 115 daily snapshots
(127 net stick increases band-wide, 0–43 per seed) and fiber on 3
(3 net increases, only on seeds 85102 and 85106). The village pile
gained sticks or fiber on ZERO days of any seed, at any pocket
call, or at any fight moment. The scholar ends some runs still
holding sticks (8 on s85101, 12 on s85104, 2 on s85108) — and still
never donates one: donateMaterial was called zero times band-wide
(the deposit path exists as a player-UI button; the policy scholar
never presses it, and no villager routine calls it at all).

So supply-b's "never produced" verdict needs one precise correction:
never produced INTO THE PILE. The binding block is not "nobody can
find a stick" — the scholar finds them constantly while foraging
trees (40% per tree cell, scholar inventory only). The binding
block is that no villager routine brings sticks or fiber home, and
the one deposit path belongs to the player alone and is never used
in this band. Fiber is scarcer even for the scholar (a 25% deadfall
side-chance, brush clearing, or a hollow-tree cache) — a future
fiber source cannot assume scholar-level abundance either.

Per weapon, unchanged from supply-b and reproduced exactly: bows
and crossbows are stick-blocked (36/36 bow pocket calls
material-blocked: 15 stick-only, 21 stick+fiber; 0 craft attempts,
0 arrows/bolts ever produced or carried); slings are call-blocked
only (stones pile 15–848, pocketing works when called, 9/11 took
stones in supply-b's band-wide calls). Fixing the call alone still
leaves every bow dry; fixing the source alone still leaves every
never-departing fighter uncalled. The ranking in §Ranked next arm
orders the source first because it is the strictly prior block for
bows: with zero pile sticks, no call design can produce one arrow
or bolt.

## Pilot + confirm (judged band)

An earlier pilot+confirm pair was run and then DISCARDED as judged
data, honestly recorded here: its producer counters wrapped
addMaterial only, and the scholar's main forage paths push to
scholar.inventory directly (game.js sweep: stick per tree cell,
fiber per deadfall), bypassing addMaterial — so that pair reported
zero scholar gains on a blind instrument. The instrument was fixed
(scanDay now snapshots scholar-pack stick/fiber totals), the proof
re-run green (20/20, up from 19/19 with the added fixture check),
and the FULL band re-run as the judged band. The judged pilot
(85101–85108) reproduces the discarded pilot exactly (6 fights,
0/0/0 errors) — the fix is read-only, as the det-gate proves — and
passes the prereg gate (100% pile coverage, zero errors, fights
> 0), so the confirm ran. Judged band total: 16 seeds, 30 fights.

## Band numbers (judged band; identical to supply-b)

- Wave-4 field fights: 30 (evade 3, vFlee 20, vDie 7, vKill 0,
  drive-offs 0). Ranged: 14, volley shots 0, volley damage 0.
  Per weapon: crossbow 3, sling 7, crude_bow 4.
- Pile at fight time, all 14 ranged fights: stick 0, fiber 0,
  stone 168–465. Daily pile trajectory, per seed (16/16): stick
  ever>0 NEVER, max 0, 0 days positive; fiber ever>0 NEVER, max 0,
  0 days positive; stone max 15–848; branch max 0–85.
  Pile-null days: 0 on every seed.
- Production events, pile: daily pile increases in stick/fiber 0;
  pocket-call pile increases in stick/fiber 0; wrapped-producer
  deltas (donateStick/donateFiber/inviteBundle/craftArrow/
  craftBolt) 0; end-of-run pile stick 0 / fiber 0 on all 16 seeds.
- Production events, scholar pack (net daily increases; a lower
  bound on gross gains, since same-day gain-and-spend is invisible
  to daily snapshots): stick 127 increases over 115 snapshot
  events, fiber 3 over 3 events. Per seed, net stick: s85101 43,
  s85102 5, s85103 21, s85104 12, s85105 2, s85106 7, s85107 6,
  s85108 3, s85109 0, s85110 8, s85111 15, s85112 0, s85113 0,
  s85114 3, s85115 2, s85116 0. Net fiber: s85102 1, s85106 2, all
  other seeds 0. End-of-run scholar pack: sticks on s85101 (8),
  s85104 (12), s85108 (2); fiber 0 everywhere at end.
- Pocket calls band-wide: 102 total. Bow calls 36, all
  material-blocked (stick 36, fiber 21). Craft attempts 0, craft
  successes 0. Sling calls 11 (same band shape as supply-b).
- End-of-run census, summed over 16 seeds (roster villagers only;
  scholar excluded by the supply instrument): packs carry arrow 0,
  bolt 0, stone 10; own stashes hold arrow 0, bolt 0, stone 1;
  village ammoCraft entries 0.
- Fight identity vs supply-b: per-seed fight identity (day, vid,
  monster, outcome) matches supply-b's corpus on all 16 seeds
  despite the anchor moving 7a2974684 -> a1e3a01a9, so every
  number above reproduces supply-b exactly. The prereg did not
  claim this reproduction; the comparison was run and it held.

## Code inventory (complete — search method + classification)

Method (scripts/stickfiber-inventory-20261031.js, run before the
evidence table was written): (a) `\bstick\b|\bfiber\b` over src/js
= 64 hits; (b) pile-material write sites = 5 lines (4 producing,
1 zero-init); (c) routine-name definitions (gather/forage/fell/
chop/collect/harvest/loot/donate/craft/trade) = 52 definitions,
all read; (d) villager duty tasks in resolveOneAssignment = 14
tasks, all read; (e) data: recipes.json inputs/outputs, items.json
defs, animals.json / events.json / monsters.json reward hits.

### (1) Paths that CAN put stick/fiber in the village pile

| # | Routine | Trigger / conditions | Tool / skill gates | Fires on band? |
|---|---------|----------------------|--------------------|----------------|
| P1 | betrayal.js inviteReward, 'bundle' kind (line 638) | Invitation reward roll picks 'bundle' (1 of 4 kinds: cache/bundle/knowledge/item), during an invitation outing the scholar takes | None (narrative gift: a villager "has been stockpiling") | NO — inviteBundle counter 0/16 seeds; pile fiber never > 0. Also NOTE: this is the ONLY pile-fiber writer in the codebase, and it writes fiber only, never sticks. |
| P2 | storage.js donateMaterial (line 378, dynamic mat) | Scholar (player) presses the pack-UI Stash button / stash-give control, while at Haven stores access, not mid-fight, holding the material | Holds the material in scholar inventory; Haven access gate | NO — donateStick/donateFiber counters 0/16 seeds. Player-UI only (app.js callers); no policy, no villager routine calls it. |
| P3 | storage.js inflow wrap, npcBatchTurn (line 1347, dynamic mat) | Open village, 6% per batch, giver = random roster villager | None (trust-level gate only: village 'open') | FIRES, but structurally CANNOT yield stick/fiber: the roll is branch 35% / wood 20% / bark 30% / vine 10% / hide 5%. Measured: branches 37–85 per seed; stick/fiber 0. This is the closest thing to a "villagers bring stuff home" routine, and it excludes both arrow materials by construction. |
| P4 | game.js 'stone' duty (line 6938) | Villager assigned the stone task | Occupation multiplier only (mason/stonecutter/builder best) | FIRES (stones 15–848) — but writes stone only. Listed because it is the template a stick/fiber duty would copy, not because it produces either material. |

No other pile-write site exists. The zero-init (storage.js:252)
sets missing materials to 0; it produces nothing. Pile deductions
(takeMaterial line 425, closed-village skim line 1369) can only
remove what is already there. There is NO branch->stick or
wood->stick conversion anywhere, and NO recipe makes stick or
fiber (recipes.json: 21 recipes consume stick and/or fiber as
inputs — including arrow, bolt, snare, cloth, decoy_rattle — and
zero recipes output them).

### (2) Paths that put stick/fiber in the SCHOLAR's pack (never the pile)

| Routine | Trigger / conditions | Tool / skill gates | Fires on band? |
|---------|----------------------|--------------------|----------------|
| game.js area-sweep forage: stick per tree/bigtree cell, 40% (line 26807) | Scholar forages a patch containing trees | None for the stick itself (forage action) | YES — the main scholar stick source (127 net increases). |
| game.js area-sweep forage: fiber per deadfall tree, 25% (lines 26697–26698) | Scholar forages a treeless tree cell (deadfall) | None | YES, rarely (part of the 3 net fiber increases). |
| game.js sweep deadfall narration (lines 26860/26871) | Same sweep | — | Narration only: "branches" + "bark fiber" (bark is a DIFFERENT material, not fiber). |
| storage.js clearBrush (lines 1302–1303): +1 wood, +1–2 fiber | Scholar clears brush on a tile | Tool note in text (brush tool implied by the action) | Scholar-side only; counted via addMaterial wrapper — 0 addFiber deltas band-wide means the policy scholar never cleared brush in this band (or never with fiber gain). Either way, nothing reaches the pile. |
| carexplore.js hollow-tree cache (line 527): +2 fiber | Scholar deep-examines a hollow tree, 30% loot roll | Deep-examine (knowledge-gated examination) | Scholar-side only; addFiber counter 0 band-wide. |
| storage.js cache dig-up / take-from-cache (lines 1041, 1135) | Scholar digs up their own buried cache / takes from a cache | Must already own the material (buried by the scholar) | Moves the scholar's own material, produces nothing new. |
| game.js scholar forage deadfall branch/bark lines (lines 26692–26698) | Same sweep as above | None | Branch + bark, not stick/fiber — listed to close the "deadfall" confusion: deadfall gives branches, never sticks. |

### (3) Paths checked and found NOT to produce stick/fiber

- Villager duties (resolveOneAssignment, 14 tasks: hunt, forage,
  garden, fish, wood, stone, water, scout, patrol, cook, tend,
  teach, mend, rest): forage yields pantry kcal + plant knowledge
  only; wood yields village woodpile logs (vv.wood, a separate
  pile from stash materials — whittle draws from it); stone yields
  pile stone; hunt yields meat/kcal; none writes pile stick/fiber
  or a villager pack material. There is NO stick duty, NO fiber
  duty, NO brush duty for villagers.
- Scholar woodcutting: pruneBranches (saw/axe tier) yields scholar
  branch; gatherFallen (NO tool needed — "slow, honest, always
  available") yields scholar branch + bark. Neither yields sticks,
  and both are scholar-only. TOOL-GATE NOTE (from the 0117Z
  strandfix gate): felling needs an axe-class tool, but deadfall
  gathering needs none — a future stick routine modeled on
  gatherFallen, not on felling, needs no axe gate at all.
- Scholar craft (game.js craft): scholar-only, consumes scholar
  inventory materials, knowledge-gated (L1 blind 35% / L2+ 85%);
  makes items (including arrows/bolts) into the SCHOLAR's pack,
  never into a villager's pack or the pile. craftArrow/craftBolt
  counters 0 band-wide (policy scholar crafts stone_knife, not
  arrows).
- Villager craft: the ONLY villager craft path is
  villagerPocketAmmo's one arrow/bolt attempt per departure
  (game.js:7544), which CONSUMES pile stick/stone/fiber and never
  produces the materials. No villagerCraft/npcCraft path exists.
- Loot: rollAlienLoot returns alien-origin items by loot tier
  (tiers 1–4 curios/tools/relics/apex), never materials;
  villagerKillLoot puts the item in the killer's pack; lootCorpse
  yields corpse items (sinew cord is an ITEM with a "Strong fiber"
  note, not the fiber material); contest prizes are alien items.
  No loot table outputs stick or fiber.
- Trade: trader routines exchange scholar items/kcal and polity
  knowledge/favor; betrayal trade paths (traderSell/SellStock/Pay)
  move items, never pile materials — except P1 above, which is an
  invitation reward, not a trade.
- Events/data: events.json and monsters.json contain no stick/
  fiber reward; animals.json 'stick' is a hunt METHOD name (rat
  snake: pin with a forked stick), not a material; items.json has
  a fiber material def (findable: false) and no stick item def at
  top level — stick/fiber appear in data only as recipe inputs.
- Gearing/whittle: villagers whittle a sharpened_stick WEAPON from
  the village woodpile (game.js:7505) — a different item from
  recipe sticks; it does not feed arrow/bolt recipes.
- The 59 prose-or-name hits break down as: narration/dialogue
  and teaching text (dowsing forked stick, snare trigger stick,
  rattlesnake pinning, dry-fight "stick you hold wrong" line),
  code comments, item/weapon names (sharpened_stick, sinew cord),
  display defs (fiber sprite, MAT_PLURAL list, stash zero-init),
  and the narration lines of paths already counted above (bundle
  line, deadfall lines, clearBrush amount line). None is an
  unexamined producer. One display gap found in passing: the
  Haven stash perception line (perceive.js:116) lists only
  branch/wood/stone/fiber — stick is not even named there, so a
  future pile stick would be invisible to that line until it is
  updated.

### (4) Villager packs ("fighter's pack" half of the question)

No villager routine writes a stick/fiber material entry into a
villager's pack. Villager packs gain: starting gear, stash weapons/
tools via gear-up, alien loot items via kills, and ammo via
villagerPocketAmmo (own stashed ammo, pile stones, or one crafted
batch). Own stashes (person.stashed) hold items from starting
distribution, never materials. End-of-run: roster packs + stashes
hold 0 arrows/bolts, 0 stick/fiber material entries (the supply
instrument counts ammo ids only, but no path above writes material
entries to packs either, and pile stick/fiber stayed 0 throughout
— there was nothing to pocket). The scholar is the ONLY character
in the band who ever holds a stick or fiber, and only in their own
pack.

## Sense test (SENSE-TESTING LAW)

Three stretches, read as scenes, not counts:

1. The dry-fight line (supply-b, still true this band — same 14
   fights): "Xavier has Sling but no arrows — the string stays
   drawn, useless." Honest about the empty weapon, wrong label
   for slings (supply-b's nit, unchanged). The scene that follows
   never pretends a volley happened. The gap reads as a real
   absence: the game names the missing ammo out loud, and nothing
   in the village answers it.
2. The stone duty line, the template that has no stick sibling:
   "🪨 ${first} pries ${stone} stone loose from the creek bed.
   The building pile grows." / "🪵 ${first} hauls back ${wood}
   wood. The pile grows." Villagers DO haul named materials home
   with named lines — stone and wood only. A villager coming home
   with sticks would sound exactly like this, and no such line
   exists anywhere in the duty code. The absence is structural,
   not a tuning miss: the duty roster has no slot for it.
3. The scholar's own forage line: "A sturdy stick (crafting
   material)." — into the scholar's pack, with no deposit beat,
   no "by the stash" line, no villager noticing. And the inflow
   line that IS the village bringing things home: "${first} left
   ${n} branches by the stash. No announcement. That's how it
   works here." The village's one home-bringing routine brings
   branches; the scholar's stick never becomes "left by the
   stash." The scholar can stand next to a pile of 848 stones,
   holding 12 sticks, and the game offers no routine that joins
   them. That reads as a real gap, not a zero count: two working
   systems (scholar gathering, village pile) with no bridge
   between them, and no villager-side gathering at all.

## Wall numbers (honest)

National 8/16, table reached 12/16, wins 11/16, wave 4 unlocked 9/16,
wave 5 unlocked 0/16, median survival 111 days, max 139 days.
Same caveats as supply-b: table/win flags are the policy stack's
fullseat-diag substrate flags, not a claim that the table is
winnable in ordinary play; wave 5 stays 0/16 either way. Arc
II/III/IV reach, four-realm formation, trap acquisition by source,
counter discovery/counter-kill rates, and young-link succession
survival are NOT instrumented in this substrate and are NOT
reported — inventing them would be fabrication. Death-cause
shares beyond fight outcomes (vDie 7/30 fights) are not claimed:
the deaths rows are a sampler, not a census.

## What the village looked like, in plain words

A village where the leader comes home from the trees with sticks
in their own bag, where the stone pile by the door grows to eight
hundred, where branches arrive by the armful — and where no
villager has ever been asked to bring a stick home, so the arrow
recipe might as well not exist. The bow fighters carry beautiful,
useless weapons; the game says so out loud; the sling fighters
stand next to their ammo and still walk out empty because nobody
hands them one. The new precision this arm adds: the sticks are
not mythical. They are in the leader's bag, twelve of them on one
seed, at the end of the run — and there is still no road from that
bag to the pile, and no villager walking that road from the trees.

## Perception law (Steve 2026-10-28)

No roster/list-fed fix is proposed. The ranked arms below are
routines and sensed contact only: a villager going out, gathering
in a place, and returning with material — the way the stone duty
and the inflow wrap already work.

## Ranked next arm (specification only, no game change)

1. SOURCE-ROUTINE DESIGN (first): a villager stick/fiber duty +
   deposit, modeled on the stone duty. Shape: a 'gather' duty
   variant (deadfall/brush, NOT felling — gatherFallen proves
   deadfall needs no tool, so the axe gate does not apply; a
   trunk-felling variant would need axe tier and is NOT the
   recommended shape) that returns 1–2 sticks (deadfall) and/or
   1–2 fiber (brush stripping, the clearBrush analogue) into the
   communal pile with a named return line like the stone/wood
   lines, plus adding stick/fiber to the inflow wrap's roll as a
   secondary trickle OR keeping the wrap as-is for comparison.
   Pre-registered bar for that arm (suggested, not this arm's
   verdict): pile stick > 0 on >= 50% of seeds AND >= 1 bow pocket
   call reaching a craft attempt. This is first because it is the
   strictly prior block: no call design can produce an arrow
   while pile sticks are zero.
2. POCKET-CALL DESIGN (second, already specified by ammo-a's
   follow-up): a sensed home contact that reaches never-departing
   fighters (ammo-a's dawn top-up was killed on trajectory
   divergence, not on principle; any retry needs the
   divergence-proof measurement ammo-a's metric review calls
   for). This arm does not re-specify it — it only ranks it
   behind the source, because a call fix without a source leaves
   bows exactly as dry as they are now.
3. NOT recommended: a scholar-deposit nudge (teaching the policy
   scholar to donate). It would move the scholar's 0–43 sticks
   into the pile on some seeds, but it fixes the player's bag,
   not the village's supply — villagers would still never bring
   a stick home, and the fix would vanish the moment the scholar
   stops foraging. The village needs its own routine.

## Metric review (for the NEXT run, never a re-score of this one)

1. The prereg's producer-counter design missed a whole class of
   production: direct scholar.inventory.push calls bypass
   addMaterial. The fix (daily scholar-pack snapshot) caught 127
   net stick increases the counters missed. Future diag arms
   should snapshot the relevant inventory directly, not only wrap
   the named mutator — any "zero production" claim needs a
   state-level check, not just a call-level check.
2. Scholar-pack totals here are NET daily increases, a lower
   bound on gross scholar production: same-day gain-and-spend
   (craft, donate, drop) is invisible to daily snapshots. The
   pile verdict does not depend on this (pile snapshots + pocket
   deltas + craft counters are all zero, and no craft ever ran
   to spend a hidden transient), but a future arm quoting scholar
   gross production should instrument spend events too.
3. The discarded pre-fix pilot+confirm pair is reported above
   rather than hidden: its pile numbers were identical to the
   judged band (read-only instrument change), but its scholar
   numbers were blind, so it is not judged data. Future runs
   should treat an instrument fix the same way: re-run, don't
   patch the old corpus.
4. The perceive.js stash line omits stick entirely (branch/wood/
   stone/fiber only). A future source arm must update that line
   or its own sticks will be invisible at Haven — a measurement
   trap, not a game verdict, but worth one line in that arm's
   prereg.

## Files

- Pre-registration: evidence/2026-10-31/sim-stickfiber-b-prereg.md
- Evidence: evidence/2026-10-31/sim-stickfiber-b.md (this file)
- Instrument: scripts/stickfiber-diag-20261031.js (STICKFIBERDIAG=1)
- Sweep: scripts/stickfiber-sweep-20261031.js
- Analyzers: scripts/stickfiber-analyze-20261031.js,
  scripts/stickfiber-events-20261031.js
- Inventory: scripts/stickfiber-inventory-20261031.js
- Proof: scripts/test-stickfiber-20261031.js (20/20 GREEN)
- Corpora: evidence/2026-10-31/perseed-stickfiber-b/baseline/s85101–s85116.json
- Reused, unmodified: scripts/ammo-diag-20261031.js,
  scripts/supply-diag-20261031.js
