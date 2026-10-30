# sim-vests-b — vest acquisition on competent play (DIAG ONLY)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1130Z.
Axis: food-economy. Arm: sim-vests-b — MEASUREMENT ONLY. Zero src/js
changes, zero policy-default changes, zero default flips. Instruments
and recorders only (scripts/sweep-vests-b.js, scripts/test-vests-b.js,
plus one additive sweep-registry line for the panel column, committed
separately as 9d889b68).
Backlog item: sim-findings #1494 (2026-10-30, loop-B arm sim-wall-b):
vests 0/8 on competent play, 180d death-aware, seeds 9981–9988.
Base pin (HEAD at prereg time): fe1e46f53044453d864b195bb087929d05d993b6.
Branch: sim-vests-b (coordinator merges; worker never pushes/bumps).
Prereg (committed BEFORE any judged leg): evidence/2026-10-30/sim-vests-b-prereg.md
(commit aefeb603). Proof test: scripts/test-vests-b.js, 25/25 green.

## Verdict first (plain words)

Vests are NOT broken, and courting does NOT move them. A vest enters
the world exactly one way in everything measured here: a character is
born wearing one. On the wall's band (9981–9988) nobody was born with
one, so eight villages played 180 days and never saw a vest — that
zero was real, not a bug. On a fresh band (9911–9918) three of eight
casts were dealt a vest at generation, the villagers wore it from day
1, and on two of eight seeds the scholar ended up wearing it too —
under competent play AND under courting play, identically. Courting
moved the scale wall (national 0/8 → 5/8, table invitations 0/8 → 4/8)
and moved nothing about vests. And nothing you do after generation
can earn a vest: monster loot, contest prizes, trader wares and fan
gifts all run through one loot filter that cannot return a vest id
(proven on the live engine, 2,400 forced draws, zero vests). So the
backlog question answers as MIXED with a sharp edge:

- NOT a policy-behavior gap: courting adds no vest, removes no vest.
  Mirrored seeds 9915 and 9916 have byte-identical holder histories
  under both policies; the one differing seed (9912) differs by a
  diverged trajectory (a mid-run joiner arrives wearing a swat vest),
  not by any courtship verb.
- NOT a pure channel-reachability gap either: the generation channel
  fires, villagers wear what they are dealt, and it reaches the
  scholar on 2/8 seeds in both columns.
- The real finding, in one sentence: vest acquisition is
  generation-luck only — deal one at character creation or go without
  for 180 days, because no playable path after generation can grant
  one. Whether that is the intended design is a Steve call (see
  backlog item 3 below); this arm measures it, it does not redesign it.

DIAG-GO: MET on all three pre-registered legs — all 8 seeds completed
in both columns; day-0 census present on every seed in both columns;
the leanlink instrument fired on 8/8 seeds (proposals ≥3 on every
seed, accords answered, national/global beats answered on 5 seeds).
No confirm spend: total ever-held events across both columns are 20
(> 1), the columns differ by 2 holder-events (not exactly 1), and no
seed is missing its day-0 census — the pilot verdict stands per the
prereg's ambiguity rule.

## The two columns (identical seeds 9911–9918, 180d death-aware)

| seed | competent days/end | competent everHeld (sweepMax) | leanlink days/end | leanlink everHeld (sweepMax) |
|------|--------------------|-------------------------------|-------------------|------------------------------|
| 9911 | 180 survived | 0 (0) | 166 village-lost | 0 (0) |
| 9912 | 180 survived | 3 (1) | 139 village-lost | 5 (1) |
| 9913 | 86 village-lost | 0 (0) | 129 village-lost | 0 (0) |
| 9914 | 180 survived | 0 (0) | 180 survived | 0 (0) |
| 9915 | 180 survived | 2 (0) | 180 survived | 2 (0) |
| 9916 | 180 survived | 4 (1) | 180 survived | 4 (1) |
| 9917 | 180 survived | 0 (0) | 180 survived | 0 (0) |
| 9918 | 180 survived | 0 (0) | 159 village-lost | 0 (0) |

everHeld = distinct (holder, vest) pairs ever seen in pack or equipped
(stashed and generation pools reported separately, never folded in).
sweepMax = scholar pack/equipped maximum, itemId-aware (the
sweep-definition count, corrected for the blind spot below).
Column totals: competent everHeld 9, scholar-held seeds 2/8,
vest-seeds 3/8; leanlink everHeld 11, scholar-held seeds 2/8,
vest-seeds 3/8. Generation pools seen: competent 3, leanlink 4
(the 4th is the mid-run joiner on leanlink 9912).

## Per-seed vest census (the evidence for the verdict)

Day 0 = the census taken after setup, before the first policy daily.
"equipped" means the vest is WORN, not just carried. No stashed vest
and no armory-pile vest was ever observed on any of the 24 runs
(16 pilot + 8 wall-check): a dealt vest is always chosen among the
villager's 5 (armor scores protection x 5 in choosePersonalFive) and
never deposited to the armory in these runs.

- 9911, 9913, 9914, 9917, 9918 (both columns): nothing, ever. No
  generation pool hit, no held vest, no vest tele event, all 180 (or
  fewer) days. Five seeds of pure absence in both columns.
- 9912 competent: Lena Ruiz is dealt a military vest at generation
  (pool day 1, pack + equipped day 1) and wears it; the scholar is
  seen wearing it (equipped) on day 116. No vest tele event fires on
  this run — the transfer mechanism between Lena and the scholar is
  NOT named by the data (no loot_taken, no gift record in the
  census), and this file does not invent one. By day 180 the vest is
  gone from the census entirely (endHeld empty).
- 9912 leanlink: the same Lena military vest, day 1, both locations.
  Then a diverged trajectory: Naran Tumen first appears on day 123
  already holding a swat vest (pack + equipped); a loot_taken tele
  for swat_vest fires day 133; the scholar is seen wearing the swat
  vest (equipped) day 134 and still wears it at the village's loss
  on day 139. The day-133 → day-134 bracket is CONSISTENT WITH
  corpse-looting, not proof of it (the loot_taken tele carries no
  who/to fields — corpses.js). Naran's vest has no fullPool trace in
  the census: he is a mid-run joiner, and joiner generation is the
  census's known visibility gap (see limitations).
- 9915 (both columns, identical): Grace Obi is dealt a swat vest at
  generation and wears it (pack + equipped) from day 1 to day 180,
  both columns, unchanged. The scholar never holds it. This is the
  cleanest single case in the corpus: a vest that exists, is worn,
  and never reaches the scholar — and the stock sweep would report
  this seed as 0 vests, because it only looks at the scholar.
- 9916 (both columns, identical chain, different day): Jovan Milic
  is dealt a military vest day 1 (pack); Aisha Marquez holds it
  (pack + equipped) from day 2; the scholar wears it (equipped) on
  day 100 (competent) / day 33 (leanlink). Competent run: two
  loot_taken teles for military_vest fire days 113 and 119, after
  the scholar's day-100 wearing; by day 180 the vest is gone from
  the census. Aisha's day-2 holding has no fullPool trace and no
  tele — like Naran, the mechanism is unnamed (transfer without
  tele, or independent joiner generation — the census cannot
  distinguish; see limitations). The chain itself, though, is
  identical under both policies: generation → villager → scholar,
  with only the day shifting.

## The wall band, re-run through the full census (instrument check)

Because the fresh band contradicted the wall's zero, the exact wall
band was re-run through the new census (competent, 180d, seeds
9981–9988; corpus sim-vests-b-corpus-wallcheck-competent.json).
Result: 0 vests on all 8 seeds — pools 0, held 0, stashed 0, armory 0,
tele 0 — AND days/wave/end/deaths reproduce the wall rows exactly on
all 8 seeds (9981: 180 survived wave 3; 9982: 180 survived wave 4;
9983: 39 village-lost wave 2; 9984: 173 village-lost wave 3; 9985:
180 survived wave 4; 9986: 109 village-lost wave 4; 9987: 180 survived
wave 3; 9988: 180 survived wave 4; death total 339, same distribution
as sim-wall-b: monster:combat 152, monster:villager combat 85, the
wild 35, wounds 13, expedition 13, sickness 12). Two conclusions
follow, and they must be held together: (1) the wall's 0/8 was REAL
absence on that band — the itemId-aware, all-holder census also
reads zero, so no instrument hid a vest there; (2) the wall's zero
does not generalize — it is an 8-seed generation draw (0/8 casts
dealt) against 3/8 on the fresh band. A single band's zero was never
evidence of a broken channel.

## Why no post-generation channel can grant a vest (code + engine)

- Generation CAN deal vests, two ways. (a) game.js genItemCandidates:
  pool is class != food, lootTier <= 2, origin != alien — both vest
  defs qualify (items.json: military_vest and swat_vest, class
  clothing, no origin, no lootTier so 1). (b) lifeseed.js
  genPersonalPool take('clothing', 1): class match only, no
  lootTier/origin gate — a vest can be the one clothing pick.
  choosePersonalFive then scores armor at protection x 5, so a
  dealt vest is almost always kept among the 5.
- Alien loot CANNOT return vests. game.js rollAlienLoot filters the
  pool to (origin == 'alien' OR id in rewardEconomy.extraItems[tier])
  AND lootTier == tier. Neither vest has origin 'alien'; neither is
  in extraItems tiers 3/4 (reward-economy.json lists only cloaks,
  coats, plates, boots, suits and weapons there). The same filter
  gates monster-kill loot, contest prizes (contests.js _cxItemPrize),
  trader wares (betrayal.js visitorWares, rewardSource 'trade') and
  fan gifts (alienPlayers.js apWackyGift). Proof: scripts/test-vests-b.js
  F2 calls the live rollAlienLoot with chance forced to 1, tiers 1–4,
  reward sources null/contest/trade, 200 draws each (2,400 draws
  total): zero vests returned, and every return satisfies the
  alien-or-extra pool rule.
- What the tele stream shows: across 24 runs, the ONLY vest tele
  events are loot_taken (corpse looting of a generated vest: 2 on
  competent 9916, 1 on leanlink 9912). Zero loot_dropped vest grants,
  zero broadcast_item_prize vest grants. Vests circulate (wearing,
  corpse loot, unnamed transfers) and sink (see blanks); they are
  never granted mid-run.

## The sweep/panel blind spot (instrument finding, NOT the wall's cause)

scripts/sweep-compare.js stdSnapshot counts vests only from the
scholar's pack/equipped, reading entry `.id`. Inventory entries are
stored under `.itemId` (game.js alienLootGrant, marketDeliveryEntry,
capstone grant) and equipped slots store `{itemId, name, ...}`
(equipment.js lines 376, 393, 415, 443 — never `.id`). Proof:
test-vests-b.js F3 plants itemId-form vests (scholar pack, villager
pack/stash/pool) — scan() finds all of them in the right locations
while stdSnapshot on the same state reads 0. Consequence, measured
in the panels below: the balanced panel inherits this read and
reports vests 0 on all 16 panel cases, including seeds where this
census shows the scholar wearing a vest. The blind spot is real and
should be fixed (backlog item 2) — but it did NOT cause the wall's
zero, as the wall-band re-run above proves. Do not cite the blind
spot as the explanation for sim-wall-b.

## Four-realm + seat-gate state (blocking gate named from code)

Competent, all 8 fresh seeds: rank village, 0 active links,
seat 'none'. deedGateReady() blocking components on every seed:
scale=false (rank village, not national/global) AND waves=false
(w5 = 0 on all 8; full seat needs waves 5/5/4/3/2 distinct fought;
lesser seat needs regional+ rank, which is also missing). Contests,
crises, stage (3, so stageOk true) and usually foodDeeds pass — the
wall on competent play is scale + wave-5, exactly as sim-wall-b
found. Leanlink: rank regional-or-better on 8/8 (national 5/8:
9912, 9913, 9914, 9917, 9918; regional 9911, 9915, 9916), 3 active
links at end on every seed, table invited 4/8 (9911, 9913, 9916,
9918 — all lesser seats at end), entered 0/8, won 0/8. Where leanlink
seeds end with seat 'none' despite national rank (9914, 9917),
deedGateReady still reports waves=false (w4 = 0 on 9914; w3 = 1 on
9917) — the lesser seat's wave bars (4/4/3 faced) are the blocker
there, not scale. End-of-run realms dissolve visibly: leanlink 9912
reached global at max but ends regional with nationalLive false
(the village was lost at day 139); leanlink 9916 ends regional with
its three links at trust 0/0/28 — a fraying realm, still standing at
the census moment, honestly reported as active links, not hidden.

## Wall numbers (this corpus)

Competent (9911–9918): national 0/8, table invited 0/8, table entered
0/8, wins 0/8, wave 4 unlocks 6/8, wave 5 unlocks 0/8, Arc 3 on 8/8,
Arc 4 on 0/8, rank village 8/8, median survival 180 AT CAP (7/8
reached the cap; sweep upper-median convention), max 180,
village-lost 1/8 (day 86), deaths 318.
Leanlink (9911–9918): national 5/8, table invited 4/8, table entered
0/8, wins 0/8, wave 4 unlocks 6/8, wave 5 unlocks 0/8, Arc 3 on 8/8,
Arc 4 on 4/8, median survival 180 by the sweep convention (honest
median of the 8 day-counts is 173; 4/8 reached the cap), max 180,
village-lost 4/8 (days 129, 139, 159, 166), deaths 317. Note the
tradeoff on this band: courting buys national/table reach and costs
survival (lost 4/8 vs competent 1/8; tribute and proposal costs
plus trajectory divergence — not a vest effect, reported here
because the same corpus shows it).
Death-cause shares (both columns dominated by monster combat, as in
sim-wall-b): competent — monster:combat 134, monster:villager combat
95, player:the wild 29, monster:expedition 17, villager:monster 12;
leanlink — monster:combat 115, monster:villager combat 87,
player:the wild 41, villager:monster 20, monster:expedition 16.
Starvation is absent from the top causes in both columns, as in the
wall snapshot.

## Balanced panel (§15)

Two single-policy panels built (balance-panel.js, seeds 9911–9918,
days 180): sim-vests-b-panel-competent and sim-vests-b-panel-leanlink
(panel.json.gz committed; cases/ caches deleted, never committed).
Both valid: sourcesStable true, neutrality match true on the proof
seed, 0 warnings. Panel rows reproduce the census rows EXACTLY on
days, wave, rank, national, table, entered and won for all 16 cases.
Panel vests read 0 on all 16 cases — the inherited sweep blind spot
(see above), not a contradiction of the census: the panel's vest
field cannot see itemId-form holdings.
Panel COMPARE: produced and attached (sim-vests-b-panel-compare.md),
decision "invalid" — errors "Unmatched policies / Unmatched flags /
Unmatched cases". This is structural, not a data failure: the compare
tool expects before/after panels with IDENTICAL policy sets (a code
change under the same policies), while this pair differs BY DESIGN
(competent vs leanlink are the two arms). Comparing a panel to
itself to force a valid decision would be a fabricated artifact
(the wall pattern's warning, applied here). The judge for this pair
is the prereg census + thresholds, and the two valid single panels
are the §15 instrument artifacts. The leanlink registry line that
made the leanlink panel possible is instrument-only (commit
9d889b68, additive; leanlink itself stays default-OFF behind
LEANLINK=1).

## Telemetry deviation check (same-run investigation)

Baseline: hidden_files/telemetry-baselines/scale-wall.json (WINSEAT
regime: full win-side win stack, WINPURSUIT=1, SEATDRIVE=1).
Competent corpus: 3 LOUD lines (national 12 → 0, table 16 → 0,
wins 16 → 0, n=8). Leanlink corpus: 2 LOUD lines (table 16 → 4,
wins 16 → 0); national NOT loud (5/8 vs baseline 12/16 — inside the
check's tolerance). Exiled clean on both. INVESTIGATED SAME-RUN:
the competent LOUD lines are the KNOWN REGIME ARTIFACT already
investigated in sim-wall-b, not a regression — competent play does
not pursue the table, so national/table/wins at zero are the
expected competent reading. Leanlink's table/wins LOUD lines are the
same artifact in milder form (courting without win-pursuit substrate
reaches invitations but no sittings or wins). Baseline NOT rolled.
Logs: sim-vests-b-telemetry-competent.log,
sim-vests-b-telemetry-leanlink.log.

## Village assessment (plain words — SENSE-TESTING LAW)

Sampled villagers around vesting and courting, from the census
timelines (not from counters alone):

- Lena Ruiz (9912) is dealt a military vest and wears it from day 1
  in both columns. Nothing about her timeline reads robotic: she
  starts armored, keeps the armor, and the armor outlives its first
  wearer (the scholar wears it on day 116 competent). What is
  missing is the middle of that story — no tele, no gift record,
  no named mechanism carries the vest from Lena to the scholar —
  and this file leaves that gap open rather than narrating a
  transfer it cannot see.
- Grace Obi (9915) is the control case for "acting like a person":
  dealt a swat vest, wears it every day for 180 days, both columns,
  never gives it up, never loses it, never does anything with it
  that a vest wouldn't do. She just has a vest. The robotic thing
  here is not Grace — it is the old metric, which would have
  reported her 180 days of wearing a swat vest as zero vests.
- Jovan Milic → Aisha Marquez → scholar (9916) reads as village
  life: gear changes hands early (day 1 → day 2), reaches the
  scholar mid-run (day 100 / day 33), then leaves the census
  (loot_taken twice, then gone). The churn is human; the unnamed
  day-2 step is the census's honesty limit, stated in the
  limitations.
- Courting (leanlink) reads as played beats, not counters: proposals
  (3 on seven seeds, 9 on 9911), accords answered, national/global
  beats answered, links with real trust (77/43/45 on 9912 at end;
  0/0/28 on 9916's fraying realm). No vest timeline moves because
  of a courtship beat on any seed — the two systems do not touch
  in these runs, which is itself the sense answer to the task's
  question: courting villagers act like people courting; vesting
  villagers act like people who happen to own a vest.
- Robotic / static / repeated flags in villager behavior: NONE found
  in the sampled timelines. The one robotic artifact found is the
  instrument (the sweep/panel vest counter), not a villager.

What thrived: knowledge and scale under courting (national 5/8,
lesser seats 4/8, Arc 4 on 4/8 leanlink seeds); vest circulation
where generation dealt one (scholar wearing on 2/8 seeds both
columns). What was missing: any post-generation vest source (none
exists in code); any vest presence on 5/8 fresh seeds and 8/8 wall
seeds (generation simply did not deal one); a named sink for vests
that leave the census (see blanks).

## Determinism + neutrality gates (proof, not claims)

- Determinism: seed 9912 re-run full 180d in both columns; per-seed
  JSONs byte-identical to the judged corpus files (competent and
  leanlink). Logs: sim-vests-b-det-competent.log,
  sim-vests-b-det-leanlink.log (scratch per-seed files deleted after
  the diff; the diff result is recorded here).
- Instrument neutrality: driver competent 40d seed 9912 vs stock
  sweep-compare competent 40d seed 9912 — days 40, wave 2, rank
  village, national 0, deaths identical
  (monster:villager combat 7, monster:combat 1, villager:monster 1).
  The census reads do not move the game. (The sweep's own vests=0
  on that 40d run is expected: the scholar holds no vest at day 40;
  Lena's vest is villager-held, which the sweep never counts.)
- Index-clobber (known shared-tree hazard, hit twice this run):
  after each safe-commit, the main index showed staged deletions of
  files byte-identical to HEAD (first commit) and a stale pre-change
  blob (registry commit). Repaired both times via
  `git update-index --cacheinfo` from the HEAD blob; verified
  `git status` clean of staged changes and worktree hashes equal to
  HEAD blobs. Both commits verified correct in HEAD before proceeding.

## Limitations (stated, not hidden)

1. First-seen days are census granularity (daily, before the day's
   verbs), not event times. A vest that arrives and leaves between
   two censuses would be missed; nothing in the tele stream suggests
   such churn for vests, but the census cannot rule it out.
2. Transfer mechanisms are named only where a tele brackets the
   change (leanlink 9912 day 133 → 134). Unbracketed changes
   (competent 9912 Lena → scholar; 9916 Jovan → Aisha) are reported
   as holder timelines, never as proven transfers.
3. Joiner generation is a pool-visibility gap: the census records
   fullPool only for roster villagers at census time, so a mid-run
   joiner's gear can appear without a pool trace (Naran d123,
   Aisha d2). A joiner-gear recorder would be needed to distinguish
   transfer from independent generation in those two cases.
4. The census reads the village stash armor pile (state.village.
   stash.armor) directly; it never calls stashState(), which would
   initialize it. A vest deposited and withdrawn between censuses
   would be missed the same way as limitation 1.
5. Panel compare "invalid" is a tool-scope limit (see panel section),
   not a data disagreement: the two panels agree with the census on
   every field the panel can see.

## Metric review

- The ever-held definition (distinct holder-vest pairs in pack or
  equipped, stashed/pools separate) proved right: it separates the
  three things the old metric conflated (villager-held, scholar-held,
  merely dealt). It should be kept for any future vest work.
- The sweep-definition secondary metric (scholar max, itemId-aware)
  proved necessary: it shows the scholar-held subset (2/8 seeds both
  columns) without letting the stock sweep's `.id` read silently
  zero it. Proposal for the NEXT run: fix stdSnapshot to read
  itemId || id (one-line instrument fix, backlog item 2) and
  re-issue the wall numbers with the corrected read — the wall-band
  conclusion (0/8) would not change, but future bands would be
  measured honestly.
- The panel compare as a judge for policy pairs proved wrong for
  this tool (it requires identical policy sets). Proposal for the
  NEXT run: do not force a policy-pair panel compare; use valid
  single-policy panels + the identical-seed census as the §15 pair,
  as done here.
- No metric was re-scored mid-run. The DIAG-GO legs, the decision
  rule and the ambiguity rule were applied exactly as pre-registered.

## Blanks filled or documented

- FILLED (instrument): scripts/sweep-vests-b.js — an all-holder,
  itemId-aware vest census (scholar + villagers + stash + armory +
  generation pools + vest tele events), with determinism and
  neutrality gates. scripts/test-vests-b.js — 25/25 proof (data
  filters, live loot-roll exclusion, census-vs-sweep blind spot,
  read-only idempotence, leanlink gate).
- DOCUMENTED (not fixed — DIAG scope, no game changes):
  1. Vest sink on holder death unobserved (see backlog item 1).
  2. Sweep/panel vest counter blind spot (see backlog item 2).
  3. No post-generation earnable vest path (see backlog item 3).
  4. Joiner-generation pool visibility gap (see backlog item 4).
  5. Leanlink survival tradeoff on this band (see backlog item 5).

## Evidence files (all under evidence/2026-10-30/ in this worktree)

- sim-vests-b-prereg.md (committed before any judged leg)
- sim-vests-b.md (this file)
- sim-vests-b-corpus-competent.json + sim-vests-b-corpus-competent/seed-*.json (8)
- sim-vests-b-corpus-leanlink.json + sim-vests-b-corpus-leanlink/seed-*.json (8)
- sim-vests-b-corpus-wallcheck-competent.json + sim-vests-b-corpus-wallcheck-competent/seed-*.json (8)
- sim-vests-b-sweep-competent.log, sim-vests-b-sweep-leanlink.log, sim-vests-b-sweep-wallcheck.log
- sim-vests-b-det-competent.log, sim-vests-b-det-leanlink.log
- sim-vests-b-neutral-driver.json, sim-vests-b-neutral-driver/seed-9912.json, sim-vests-b-neutral-sweep.json
- sim-vests-b-panel-competent/panel.json.gz, sim-vests-b-panel-leanlink/panel.json.gz (+ logs)
- sim-vests-b-panel-compare.md, sim-vests-b-panel-compare.json
- sim-vests-b-telemetry-competent.log, sim-vests-b-telemetry-leanlink.log
