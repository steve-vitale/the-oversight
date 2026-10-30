# sim-axeacq-b — axe acquisition on the banked-bot trajectory: the answer to backlog #1510

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1130Z,
arm sim-axeacq-b, axis food-economy. Worktree sim-axeacq-b.
DIAG ONLY: measurement, zero src/js changes, zero
policy-default changes, zero default flips, no behavior probe
built, run, or judged. Sibling trees never touched. Main tree
never touched.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-30/sim-axeacq-b-prereg.md (commit 345ed2e61),
plus evidence/2026-10-30/sim-axeacq-b-prereg-addendum.md
(commit a6b6f0914, instrument v2, before confirm). Pinned base
082cfa19e088fa82ef4df3c38d0c85277d2ddda7 (worktree HEAD at
prereg time). Tracked diff guard: `git diff` of src/ and
scripts/policies/ between pinned base and final tree is EMPTY
(0 lines) — every leg ran on pinned-base game code verbatim,
plus measurement scripts only. No balanced-panel compare .md:
single-state census (DIAG), no before/after pair, no game-root
delta — the same standing as the walktree prereg. Column (b)
equivalence counts are a re-derivation check, not a panel
compare, and are labeled as such.

Primary question (backlog #1510): is axe acquisition broken,
unbuilt, or simply later than day 7? DIAG-GO bar: every seed
classified ACQUIRED (day+source) or BLOCKED (named gate), zero
unclassified; recorder errors zero; determinism holds; column
(b) equivalence holds; a sense-read is written. All five hold
— DIAG-GO.

## Engine facts (code reads, verified before any judged leg)

- Axe-tier = woodcut tier 'fell' (storage.js TIER_RANK: none 0,
  whittle 1, brush 2, prune 3, fell 4). cutInfo('bigtree')
  .canFell is true iff the vessel's best carried tier
  (inventory + equipped, via Game.woodcutTier()) ranks fell.
- The ONLY fell-tier item in src/data/items.json is the
  Hatchet (class weapon, melee +15, tool.woodcut 'fell',
  findable true, no lootTier so it defaults to 1, no origin
  so it is not alien). The ladder: stone_knife whittle,
  machete brush, hand_saw prune, hatchet fell — nothing else
  carries a woodcut tag.
- NOT CRAFTABLE: 'hatchet' appears nowhere in
  src/data/recipes.json (full recursive scan, zero hits).
- NOT SCAVENGEABLE: the ruin loot pool is regionScavenge()
  (regions.json people.scavenge, fallback game.js SCAVENGED =
  canned food + rare medicine only); 'hatchet' appears nowhere
  in regions.json.
- NOT A CONTEST GRANT: grantWeapon values found are
  hunting_spear and stone_knife only.
- SPAWN, CORRECTED BY MEASUREMENT (see below): the vessel's
  opening gamble is an 8-item fullPool; the vessel carries 5
  and stashes 3. A hatchet CAN be in the pool (and is, 5/26
  across both corpora, always stashed), but is NEVER carried
  at spawn (0/26). The prereg's 'spawn lottery' framing
  therefore has three rungs: in the pool? carried? stashed?
- Channels that exist in code: individual ownership (a
  villager's stashed items are theirs; no village armory, no
  borrowing); corpse loot (a killer loots the body — the item
  moves to the killer's pack, narrated 'You take ... from
  <name>' + 'The body is stripped'); deliberate give/trade;
  gearUp acquisition order (own carried -> own stashed ->
  communal armory, game.js:7415, combat gearing). A
  villager-held hatchet is NOT vessel-usable: ownership
  blocks borrowing, so the census carrier is the VESSEL.
- No canon doc covers axe/tool acquisition (CANON.md,
  BALANCING.md, TIME-ECONOMY.md, DESIGN.md read; BALANCING.md
  prices axe work, it does not say who holds an axe). Stated,
  not invented.

## Column (a): fresh-seed census (16 seeds, guard leg, 60d cap)

Substrate verbatim from walktree (nighttravel + woodcarry,
WOODWARM=0, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1). Fresh band 16101–16116, verified unused
before the prereg (no 1610x/1611x literal in
evidence/2026-10-28/29/30 *.md files, no corpus directory
name containing them; the one 1610 hit anywhere is a 16:10
timestamp filename, not a seed). Pilot 16101–16108, confirm
16109–16116 on pilot GO. Death-aware: runDays stops at
Game.over, so dead runs end at death with no tail (the +10d
tail cap is moot — the engine, not the driver, stops the
run). 15/16 survived the full 60d; 1 village-lost (16103, d50).

### Per-seed axe census

| seed | vessel (spawn) | spawn tool | pool hatchet | first axe | source | carrier |
|------|---------------|------------|--------------|-----------|--------|---------|
| 16101 | hunting_guide | bare hands | no | — | BLOCKED, survived 60d | — |
| 16102 | mushroom_grower | bare hands | no | — | BLOCKED, survived 60d | — |
| 16103 | pottery_instructor | bare hands | YES, stashed | — | BLOCKED, died d50 | — |
| 16104 | paramedic | bare hands | no | — | BLOCKED, survived 60d | — |
| 16105 | journalist | bare hands | YES, stashed | day 42 | loot (Nina's body) | vessel |
| 16106 | glazier | bare hands | YES, stashed | — | BLOCKED, survived 60d | — |
| 16107 | paramedic | bare hands | no | — | BLOCKED, survived 60d | — |
| 16108 | dentist | bare hands | no | day 50 | succession (owen_smith died d50, successor ruby_callaghan arrived hatchet-equipped) | vessel (successor) |
| 16109 | interpreter | bare hands | no | — | BLOCKED, survived 60d | — |
| 16110 | hvac_tech | bare hands | YES, stashed | — | BLOCKED, survived 60d | — |
| 16111 | librarian | bare hands | no | day 31 | loot (Theo's body) | vessel |
| 16112 | sailor | bare hands | no | — | BLOCKED, survived 60d | — |
| 16113 | chimney_sweep | bare hands | no | — | BLOCKED, survived 60d | — |
| 16114 | physical_therapist | bare hands | no | — | BLOCKED, survived 60d | — |
| 16115 | mortician | bare hands | no | — | BLOCKED, survived 60d | — |
| 16116 | trail_crew | bare hands | no | — | BLOCKED, survived 60d | — |

Counts: ACQUIRED 3/16 (loot 2, succession 1), BLOCKED 13/16
(12 survived-without, 1 died-before). Spawn-carried hatchet
0/16. Pool hatchet 4/16, all stashed, none carried. First-axe
days (non-spawn): 31, 42, 50 — median 42. Zero unclassified.
Zero recorder errors. Zero tier/canFell mismatches.

### The stashed hatchet that never gets picked up

On all 4 pool-hatchet seeds, the vessel NEVER held a hatchet
on any morning (0 hatchet mornings for 16103, 16106, 16110;
16105's hatchet mornings start at day 42 from loot, and its
own stashed hatchet never appears as a second hatchet). The
two blocked pool-hatchet vessels with short lives are the
sharpest form: 16103's vessel lived days 2–15 with the
hatchet stashed and never equipped it, then died; 16106's
vessel lived days 2–17 the same way. Stash-equip DOES fire
in this corpus — 16101 equipped its stashed stone_knife on
morning 5, from an empty weapon slot — but it never fires
for a hatchet on any of the 4 pool-hatchet seeds. The
mechanism question (why the hatchet loses the equip choice
when the stone_knife wins it) is NOT answered here — it is
a backlog item below, not a guessed mechanism. What is
measured: the stash is not an axe pipeline on this
trajectory; it is a place hatchets sit until their owner
dies.

### Loot and succession are the only arrivals

- LOOT (2): 16105 day 42 ('You take bow, hatchet, ... from
  Nina. Your hands know what they did. (+4 trauma)' — Nina
  died day 11, ambush); 16111 day 31 ('You take hatchet,
  chef's knife, ... from Theo. ... (+2 trauma)'). Both
  vessels are the original vessel (succession counts 0),
  both loot lines are corpse-loot-as-action, both hatchets
  stay held afterwards (16105: 19 hatchet mornings;
  16111: 30, equipped from the next morning on).
- SUCCESSION (1): 16108 day 50 — the vessel owen_smith died
  ('the wild'), and the successor ruby_callaghan arrived
  with a hatchet already EQUIPPED (morning-50 eq holds it).
  16108 is the corpus's succession chain in miniature: 5
  vessel changes in 60 days, 5 player deaths.
- NOTHING ELSE FIRED: no craft (impossible — no recipe), no
  scavenge (impossible — no pool entry), no grant, no
  trade/gift, no stash-equip of a hatchet, in 16 seeds x
  60 days. The living bot's own effort never produces an
  axe on this trajectory; axes arrive only when someone
  dies — a stranger whose body is stripped, or the bot
  itself, replaced by someone who already holds one.

## Column (b): walktree bank re-derivation (10 seeds, 30d)

Bank 15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337,
15376, 15439, BOTH legs, v2 driver. EQUIVALENCE BAR HOLDS
EXACTLY: guard creek 15 / still 4 / rescued 11, warmth 0/0;
ON creek 21 / still 11 / rescued 10, warmth acted 6 /
log-spent 4 — per-seed counts identical to walktree's
fresh-leg baselines, and the ON stranded-morning table
reproduces walktree's 11 mornings row for row (same seeds,
loopDays, wake tiles/cells, kcal, wood). The recorder is
proven behavior-neutral, so every axe number below is
measured on the true trajectory, not a perturbed one.

### Axe-tier presence at stranded mornings: 0/15

| leg | stranded mornings | with axe (canFell true) |
|-----|-------------------|-------------------------|
| guard | 4 (15009 d13; 15215 d7 haven, d8, d9) | 0 |
| ON | 11 (15009 d13; 15215 d7–d16) | 0 |

Every stranded morning reads exactly as walktree found it:
bare hands on the haven morning, Stone knife (whittle) on
every field morning from day 8 on — the bot equipped its
stashed stone_knife before day 8, and never anything better.
The axe gate is closed on 100% of the stranded mornings on
both legs, on fresh numbers, not quoted ones.

### Bank acquisitions (outside the strand window)

- Guard leg: 15215 acquired day 27 via succession (vessel
  gen_gyft62f died d27 'the wild', successor gen_qk44g5s
  arrived axe-tier); 15220 acquired day 18 via loot ('You
  take alien carapace, hatchet, hand saw from them. ... (+2
  trauma)'). ON leg: 15220 acquired day 18 via the same loot
  line (the loot event is trajectory-robust across legs);
  15215 never acquired on the ON leg (warmth changed its
  death pattern — the guard leg's day-27 succession does not
  occur). Bank pool hatchet: 1/10 (15337, stashed, never
  held — BLOCKED, survived 30d). Bank spawn-carried hatchet:
  0/10.
- By day 7 (the walktree trigger): 0/10 bank vessels held an
  axe on either leg, and 0/16 fresh vessels held one at
  spawn. Combined: 0/26 vessels axe-tier by day 7.

## Verdict — the named answer to backlog #1510

**LATER-THAN-DAY-7 — and for the living bot, effectively
UNBUILT.** Axes do arrive on this trajectory, but never by
day 7, never by the bot's own effort, and only rarely at
all:

- By day 7: 0/26 vessels axe-tier (16 fresh + 10 bank).
- In 60 days (fresh): 3/16 acquire, median first-axe day 42
  (days 31, 42, 50); 13/16 never acquire, including 3 of the
  4 vessels who owned a stashed hatchet all along.
- Channels that fired: corpse loot (3/26 across both
  corpora: 16105, 16111, 15220) and succession (2/26: 16108,
  15215-guard). Channels that never fired: craft (no recipe
  exists), scavenge (no pool entry exists), grant (no hatchet
  grant exists), trade/gift, and stash-equip of a hatchet
  (0/5 pool-hatchet vessels ever held one).
- NOT 'broken': no acquisition attempt fails visibly — there
  is no refused craft, no lost loot, no misrouted grant in
  any line. NOT 'intended' in the ruled sense either: no
  canon doc and no code comment states that axe-less-ness
  is the designed state. It is the emergent consequence of
  unbuilt living-bot channels plus a carry-5 lottery that
  never puts the hatchet in hand at spawn.

The design answer to walktree's open question (c): on this
trajectory as currently built, the bot is NOT supposed to
hold an axe by day 7 — nothing in the build delivers one by
then, and the strand is axe-less by construction, not by
bad luck. If the walk-to-tree middle needs an axe by day 7,
that needs a build (a craft, a spawn change, a stash-equip
change, or a ruling) — not a tuning, and not another
measurement of these mornings. The axe gate stays closed
until one of those exists.

## Sense-test (law — read end to end, judged for meaning)

Sample: 16111, days 29–32, around the day-31 loot acquisition
(same vessel throughout, no deaths — the clean loot case).

- The days read as one coherent life: day 29 donates
  blackberries (+3575 kcal, Trust +9), gives fishing and
  cooking orders, absorbs Leonard's pushback ('Sure. Your
  call. For now.'); day 30 strips two bodies in sequence
  (Caleb, then Theo) and the narration marks each taking
  ('Your hands know what they did. (+2 trauma)') — the
  taking is not free, and it is not silent; day 31 the
  hatchet is EQUIPPED, not just carried, and stays equipped
  through day 32 while the village routine (garden orders,
  Leonard's 'Why are YOU giving orders?') goes on around it.
  A tool taken from the dead enters the working kit the
  next morning. That is a person using what the world gave
  them, not a counter incrementing.
- The wrinkle, stated not chased: the loot lines give no
  stated need ('you need a weapon' never appears) — the bot
  strips bodies as a matter of course, and 'The body is
  stripped. What's left isn't worth taking.' repeats
  verbatim per body. The trauma cost keeps it from reading
  as looting-as-vacuum, but the motive is unvoiced.
- PASS, with that wrinkle noted: nothing in the sample
  reads robotic, static, or repeated in a way that breaks
  the story — the villager forages, orders, donates,
  argues, loots the dead at a cost, and wields what it took.

## Wall numbers

Column (a) 16-seed corpus: national 0/16, table 0/16, wins
0/16; wave reach: max wave unlocked 2 (5 seeds) / 3 (11
seeds), never 4+; median survival 60 loop-days (capped —
15/16 survived the full cap, 1 village-lost d50); all 16
scaleRank 'village' at end state. Column (b) bank (both
legs): national 0/10, table 0/10, wins 0/10; max wave
unlocked 2 on all 10; median survival 30 (capped, 10/10
survived). The wall is untouched by this arm, as expected
for a DIAG census: no lever was played, so no wall movement
is claimed.

## Proof

- scripts/test-axeacq-b.js: FULL run 37/37 GREEN (Part A
  static ladder/recipe/region facts; Part B synthetic
  analyzer legs incl. loot-taken + succession; Part C live
  spawn-kit replay, 2 seeds; Part D determinism — re-run
  corpora for 16101/16102 BYTE-IDENTICAL to the pilot;
  Part E census-file assertions: 16 seeds classified, 0
  unclassified, 0 recorder errors; bank guard stranded 4,
  bank ON stranded 11, all stranded rows carrying axe
  reads). Fixtures-stage run before judged legs: 24/24.
- Determinism gate: holds (byte-identical, not just equal
  after stripping — no volatile fields were found to strip).
- Instruments: scripts/axeacq-trace-b.js (recorder driver),
  scripts/analyze-axeacq-b.js (analyzer),
  scripts/test-axeacq-b.js (proof). Commits: prereg
  345ed2e61, instruments 7be0f0d9c, instrument v2 +
  addendum a6b6f0914. Branch tip at evidence writing:
  a6b6f0914 plus the evidence commit to follow.
- After every safe-commit, the known index-clobber variant
  hit (worktree file byte-identical to HEAD but staged as
  changed/deleted) and was repaired via cacheinfo from the
  HEAD blob; every commit's content was verified against
  `git show --stat HEAD` before proceeding. The commits are
  correct; only the main index lied, three times.

## Metric review

- Primary metric (per-seed first axe day + source +
  carrier; stranded-morning axe presence) bound the run and
  was met: 16/16 + 10/10 + 10/10 seeds classified, 0
  unclassified, 0 recorder errors, determinism held,
  equivalence held. No re-scoring occurred.
- One metric doubt, recorded for the NEXT run, not applied
  to this one: the prereg's source taxonomy lacked
  'succession' and its loot patterns lacked the Taken/from
  form; both were added by the v2 addendum BEFORE confirm
  (instrument fidelity, not a threshold change), and the
  v1 pilot was re-run rather than patched in place. If a
  future census reuses this taxonomy, 'succession' and
  Taken/from loot are now first-class sources from the
  start.
- Horizon note: the 60d cap was the right call — the
  latest first-axe day is 50, inside the cap, and 15/16
  seeds survived it, so the cap did not censor the
  acquisition window. A 30d-only census would have caught
  NONE of the 3 fresh acquisitions (31/42/50 are all past
  30); the only sub-30 arrivals anywhere are the bank's
  day-18 loot and day-27 succession. Future axe censuses
  need 60d or longer, not 30d.

## Backlog items (for the coordinator to append — worker must not touch the goal hidden_files)

- [open] 2026-10-30 — food-economy/daytime-wood — STASHED
  HATCHET NEVER EQUIPPED (sim-axeacq-b): 0/5 vessels who
  owned a stashed hatchet ever held one (fresh 16103/16106/
  16110 + bank 15337 + 16105's own stash unused while its
  looted hatchet was wielded), although stash-equip fires
  for a stone_knife (16101, morning 5, empty weapon slot)
  and a looted hatchet is equipped the next morning (16111).
  Why the hatchet loses the equip choice is unmeasured —
  gearUp's own-carried -> own-stashed order (game.js:7415)
  exists in code but never surfaces a hatchet here. Needs a
  mechanism read before any stash-equip build is designed.
- [open] 2026-10-30 — food-economy/daytime-wood — AXE
  ARRIVES ONLY THROUGH DEATH (sim-axeacq-b): across 26
  vessels, the only axe arrivals are corpse loot (3) and
  succession (2); no living-bot channel fired in 16x60d +
  10x30d x2 legs. If an axe by day 7 is ever wanted on this
  trajectory, it needs a build (craft, spawn, stash-equip,
  or ruling) — named here so the walktree middle is not
  re-measured against the same closed gate.
- [open] 2026-10-30 — food-economy/daytime-wood — LOOT
  MOTIVE UNVOICED (sim-axeacq-b sense-read): corpse-loot
  lines carry a trauma cost but no stated need; the bot
  strips bodies as a matter of course. Small narration gap,
  not a behavior claim.

## Corpora (all inside this worktree, never /tmp)

- evidence/2026-10-30/sim-axeacq-b-corpus/ (16 fresh seeds,
  pilot + confirm merged) + evidence/2026-10-30/
  sim-axeacq-b-census.json
- evidence/2026-10-30/sim-axeacq-b-corpus-pilot/ +
  sim-axeacq-b-census-pilot.json (v2 pilot; v1 superseded
  and deleted before the v2 re-run)
- evidence/2026-10-30/sim-axeacq-b-corpus-confirm/ (confirm 8)
- evidence/2026-10-30/sim-axeacq-b-corpus-determinism/
  (16101, 16102 re-runs, byte-identical)
- evidence/2026-10-30/sim-axeacq-b-corpus-bank-guard/ +
  sim-axeacq-b-census-bank-guard.json +
  sim-axeacq-b-census-walktree-bank-guard.json
- evidence/2026-10-30/sim-axeacq-b-corpus-bank-on/ +
  sim-axeacq-b-census-bank-on.json +
  sim-axeacq-b-census-walktree-bank-on.json
