# sim-jointgate-b — the joint fed+axe+roomy gate on strand mornings: DIAG-GO

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0741Z,
arm sim-jointgate-b, axis food-economy. Worktree sim-jointgate-b.
DIAG ONLY: measurement, zero src/js changes, zero policy-default
flips, zero edits to any existing policy file, driver, analyzer, or
proof file. New files only: the prereg, the recorder + analyzer +
proof, this evidence file, the censuses, and the corpora below.
Sibling worktrees never touched; main tree never touched. Nothing is
merged by this worker (the coordinator merges); do NOT push, bump, or
verify live.

## Answer in one paragraph (plain words)

The stash-fetch routine is not missing on the strand road — it fires
on day 1 on seed 15215, exactly as it does on 15337. What it fetches
there is a hunting spear and work gloves, because that is what this
villager owns: their own stash holds no axe at all. So the villager
walks the whole strand with a Stone knife, wakes hungry on every
wood-short morning, and — on the mornings when they do have hours to
spare — still cannot fell the big tree standing two steps away,
because a knife is not an axe. The joint gate (fed AND axe AND roomy
hours, together) never holds on any strand morning on this stack, and
the reason is now dated and owned: the axe side fails at the spawn
stash, not at the fetch routine, and the food side fails at the wake
pool, not at the evening meal. The variant road's day-15 corpse-loot
axe never happens here — on this stack no axe is held at all in 30
days — and the strand itself does not generalize: on the other nine
bank seeds there is no stranded creek morning to judge at all.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-31/sim-jointgate-b-prereg.md (commit 44d45367f).
Pinned base f239efe48e55d937f8da0fb71d8f558d19b32cdd (worktree HEAD
at prereg writing time; prereg + instrument + corpus commits add
tooling/evidence only, so all legs run on pinned-base game code
verbatim — verified by the proof's tracked-diff guard: src/ +
scripts/policies/ diff empty vs the pinned base).

Definitions frozen in the prereg (not re-scored here, §14 binding):
strand morning = morning after a still creek evening (woodcarry
bucket 'creek', rescued false), waking NOT at haven, not game-over,
not in combat. FED = morning kcal >= 80 (the fell's engine cost).
AXE = woodcutTier tier 'fell' (cutInfo.canFell must agree; any
disagreement is a recorder error). ROOMY = morningTicksLeft -
walkSteps - 96 - 40 >= 96 (tickfell projection; the 40 is the
UNVALIDATED routine allowance, reused for comparability — see Metric
review). JOINT = needsWood (wood < 4) AND fed AND axe AND roomy.
Pack-ready mornings (wood >= 4) are NOT joint and NOT in the joint
denominator; no-target mornings carry roomy null, never false.

Verdict, judged exactly as written (DIAG verdict — the joint COUNT
is a finding, never the verdict):
- DIAG-GO iff (a) pilot recorder complete, AND (b) determinism
  byte-identical, AND (c) confirm complete, AND (d) the 15215
  stash-fetch reconciliation is DETERMINATE, AND (e) at least one
  strand-morning transcript sense-read.
- A joint count of ZERO is NOT a DIAG-NO-GO: for a diagnosis, a
  complete, deterministic zero with named failing gates is a
  successful answer.

## Verdict: DIAG-GO

| bar | result |
|-----|--------|
| (a) pilot recorder complete | PASS: both 15215 legs, errs 0, 30 evenings + 29 mornings each, every strand morning carries tool + cutInfo + inventory + stash + kcal + ticks + pack, 0 incomplete, 0 tier/canFell disagreements |
| (b) determinism | PASS: 15215 ON re-run BYTE-IDENTICAL to the judged pilot file (cmp) |
| (c) confirm complete | PASS: 18/18 legs, errs 0, 30 evenings + 29 mornings each, 0 incomplete (0 strand mornings exist to be incomplete — see §3) |
| (d) 15215 reconciliation DETERMINATE | PASS: spawn stash named, day-1 fetch named with lines, first-axe result named ('never in 30 days', both legs) — see §2 |
| (e) strand-morning sense-read | PASS: still evenings L10 + L14 read end to end — see §4 |

Proof: scripts/test-jointgate-b.js — 177/177 checks pass (joint
boundaries, fell-target BFS cases, corpus completeness, errs 0,
tier/canFell agreement, determinism byte-identity, tracked-diff
guard). §15 panel: not applicable, as declared in the prereg
(balance-panel cannot express this stack/census; guard-vs-ON legs on
identical seeds through the census analyzer, never labeled a panel
comparison).

## Canon

docs/CANON.md read, then docs/TIME-ECONOMY.md. Fell cost verified in
code (game.js cutTree: 96 ticks + 80 kcal; storage.js woodcutTier /
cutInfo: only tier 'fell' fells; hatchet tool.woodcut 'fell',
stone_knife 'whittle', hunting_spear carries no woodcut tag). No
canon doc covers the joint gate itself or the strand-fix blank —
stated here instead of inventing canon.

## Prior evidence read in full before designing anything

sim-tickfell-a.md (+ prereg, 2026-10-31), sim-stashfetch-a.md (+
prereg, 2026-10-31), sim-axearrival-a.md (2026-10-30),
sim-waitsalign-a.md (2026-10-31), sim-strandfix-morning-b.md
(2026-10-30). This arm does NOT re-judge the tickfell corpus: fresh
census on current master only. Tickfell numbers below are context
for comparison, never the verdict.

## Instruments (new, this arm)

- scripts/jointgate-trace-b.js — recorder driver adapted from
  scripts/kcalshort-trace-b.js (same warmed stack, same evening/
  morning record shape, plus: spawn snap, per-morning tool +
  cutInfo + fell-target BFS + full inventory/equipped + stash ids
  + vessel id, per-evening tool/inventory/stash snap for the
  intraday bracket, fetch say-lines). Read-only: no verb calls, no
  state writes, no RNG draws. Env gates asserted FATAL.
- scripts/jointgate-pure-b.js — pure fellTarget + jointEval, shared
  by driver and proof (no env reads on require).
- scripts/analyze-jointgate-b.js — pure reads: strand extraction
  (lackingline method), joint census per leg, per-gate fail table,
  pack-ready / no-target splits, stash-fetch reconciliation.
- scripts/test-jointgate-b.js — proof (see Verdict).
- Instrument commit 095b38b7e7e; corpora + censuses commit 06f466bfb.
  Note for the coordinator: safe-commit.sh hit the known index
  clobber on all three commits in this arm (commits correct, main
  index showed staged deletions with byte-identical worktree files);
  repaired each time via `git update-index --add --cacheinfo` from
  HEAD blobs and verified `git status --short` empty + `git diff
  HEAD` empty before continuing. The commits themselves were never
  in doubt (blob hashes match worktree files).

## 1. THE PILOT CENSUS (seed 15215, fresh, current master)

Recorder neutrality holds exactly: the pilot's strand sets match
the tickfell control shape with zero drift — guard still 7-9,
rescued 10; ON still 7-16, rescued none. Guard warmth acted 0,
ON warmth acted 6 (the ON fires that eat the bridge logs, as in
warmfuel/tickfell). All legs survived 30 days (endReason survived).

### Guard leg (WOODWARM=0): 3 strand mornings, all pack-ready

| morning | wood | kcal | tool | ticksLeft | projected | joint |
|---------|------|------|------|-----------|-----------|-------|
| L8 | 4 | 44 | whittle / Stone knife | 256 | 117 | N/A (pack-ready) |
| L9 | 4 | 0 | whittle / Stone knife | 128 | -11 | N/A (pack-ready) |
| L10 | 4 | 0 | whittle / Stone knife | 128 | -10 | N/A (pack-ready) |

Guard joint denominator is 0: the guard strand strands on
ticks/kcal, never on wood, so there is nothing for a fell to fix
there even with an axe. The guard mornings are reported, not
counted — counting them as joint failures would misread a strand
that needs no fell.

### ON leg (WOODWARM=1): 9 strand mornings, 7 needs-wood, 0 joint

| morning | wood | kcal | tool | target | walk | ticksLeft | projected | fed | roomy | joint |
|---------|------|------|------|--------|------|-----------|-----------|-----|-------|-------|
| L8 | 4 | 44 | whittle / Stone knife | bigtree (4,0) | 3 | 256 | 117 | no | yes | N/A (pack-ready) |
| L9 | 4 | 0 | whittle / Stone knife | bigtree (4,0) | 3 | 128 | -11 | no | no | N/A (pack-ready) |
| L10 | 3 | 0 | whittle / Stone knife | bigtree (5,0) | 2 | 256 | 118 | no | yes | NO |
| L11 | 3 | 31 | whittle / Stone knife | bigtree (5,0) | 2 | 128 | -10 | no | no | NO |
| L12 | 2 | 0 | whittle / Stone knife | bigtree (4,0) | 3 | 256 | 117 | no | yes | NO |
| L13 | 1 | 0 | whittle / Stone knife | bigtree (4,0) | 3 | 128 | -11 | no | no | NO |
| L14 | 0 | 0 | whittle / Stone knife | bigtree (5,0) | 2 | 256 | 118 | no | yes | NO |
| L15 | 0 | 52 | whittle / Stone knife | bigtree (5,0) | 2 | 128 | -10 | no | no | NO |
| L16 | 0 | 0 | whittle / Stone knife | bigtree (4,0) | 3 | 128 | -11 | no | no | NO |

Primary metric (15215): J = 0, D = 7 needs-wood strand mornings.
Per-gate fails over D: tool 7/7, kcal-floor 7/7 (morning kcal
0, 31, 0, 0, 0, 52, 0 vs 80), ticks 4/7 (tight mornings L11, L13,
L15, L16 project -10/-11; roomy mornings L10, L12, L14 project
117-118). No-target mornings: 0 — a fellable bigtree stands in
reach (2-3 steps) on every strand morning. Tier/canFell agreement:
7/7 (whittle => canFell false, on the record, not assumed).
Morning ticks left alternate 256/128 exactly as waitsalign predicts
(sleep refused / interrupted late vs sleep ran); the roomy gate
discriminates 3/4, as in tickfell — it is starved, not vacuous.

The pilot reproduces tickfell's joint finding number-for-number on
a new base (f239efe48): 0 joint, tool 7/7, kcal 7/7, ticks 4/7,
same mornings, same kcal values, same projected values. That
replication IS the fresh census — it was not inherited.

## 2. THE RECONCILIATION — stashfetch vs tickfell, on this stack

This is the bar (d) answer, in dated order. All three prior findings
hold simultaneously; none contradicts the others once the seed's
own stash is named.

### (a) The spawn stash holds no axe-tier weapon

15215 spawn (both legs, identical): stash [multitool, hunting_spear,
work_gloves]; inventory [buskers_harmonica, Trail mix x2, Dried meat
x2] (the food entries carry no itemId in the snap — see Metric
review; the tool record is authoritative because woodcutTier reads
inventory + equipped directly from the engine); equipped [trail
compass, search locket, whetstone, carpenters_square]; tier 'none',
bare hands. No hatchet in stash, inventory, or equipped. A fetch
routine cannot fetch what the vessel does not own.

### (b) The day-1 fetch FIRES on 15215 — and fetches a spear + gloves

Fetch lines, day 1, both legs, quoted verbatim:
- "You remember the Hunting spear at your space in the haven and
  fetch it — it rides in your pack now."
- "You remember the Work Gloves at your space in the haven and
  fetch it — it rides in your pack now."
LoopDay-2 morning confirms: stash [multitool] (spear + gloves gone),
_fetchDay flags both 1, spear equipped in the ranged slot, gloves
in the hands slot. So stashfetch-a's "ordinary daily routine" is
present and working on the strand stack — it is simply not an axe
routine. The hunting_spear carries no woodcut tag, so the woodcut
tier stays 'none' after the fetch. The 15337 day-1 hatchet fetch and
the 15215 day-1 spear fetch are the same routine firing on different
spawn stashes, not different mechanisms.

### (c) The Stone knife arrives day 7, intraday — and it is not an axe

Morning tier 'none' on loopDays 2-7, evening tier 'whittle' from
loopDay 7: the knife arrives during the day-7 departure day
(morning none -> evening whittle, same vessel gen_gyft62f). From
loopDay 8 onward every strand morning holds the Stone knife
(whittle). The knife explains tickfell's "whittle from L8" snap and
closes the strandfix-morning gap for this stack: the tool sequence
is none (days 1-6) -> whittle (days 7-30) -> never fell.

### (d) No axe is held at all in 30 days on this stack

First-axe morning: null, both legs. First-axe evening: null, both
legs. Evening tier 'whittle' through loopDay 16, then 'none' from
loopDay 17 (the successor gen_eni1m98 wakes at haven with bare
hands — the vessel change tickfell recorded as the day-17 death,
now dated in the morning sequence: strand mornings L8-16 all
gen_gyft62f, L17 morning at haven under the successor). The
axearrival day-15 corpse-loot axe belongs to the strandfix-variant
stack and does NOT occur on this stack: on the census stack the
villager never loots an axe, never crafts one, never fetches one,
in 30 days. Any future arm that needs an axe on this road must
supply the axe first — by spawn, by loot the census stack actually
takes, or by a different road — before any fell gate can matter.

### The reconciliation, in one line

Stashfetch explains the TOOL the villager holds (spear day 1, knife
day 7) and tickfell explains the GATE the villager fails (no axe,
no food, half the time no hours); the apparent tension — "a routine
fetches the best weapon day 1, yet no axe ever" — dissolves once
the spawn stash is read: the best weapon this villager owns is a
spear, and a spear does not fell trees.

## 3. THE CONFIRM BAND — the strand does not generalize

Bank band 15003, 15009, 15091, 15211, 15220, 15221, 15337, 15376,
15439 (9 seeds) x guard + ON = 18 legs, 30 days each, all survived.
Result: ZERO strand mornings on all 18 legs (still evenings 0/18;
rescued creek evenings exist — 15003: 26, 15091: 29, 15211: 5 + 30,
15337: 29, 15376: 20 + 29, 15439: 4 — so the creek/bridge path IS
exercised, it just never strands). Warmth acted 0 on all 18 legs
(no still evening to warm). Guard and ON legs agree exactly per
seed (same wcRecords, same rescued evenings).

What the confirm band does and does not show:
- It does NOT show the joint gate failing more broadly — with D = 0
  there is no joint denominator outside 15215. The joint question,
  on this stack, is 15215-bound. Any claim of the form "joint never
  holds" must carry the qualifier "on the one seed that strands."
- It DOES show the recorder is not blind to axes: on 15337 the
  recorder finds first-axe evening loopDay 1 and first-axe morning
  loopDay 2 on both legs — the hatchet fetched day 1, held from
  morning 2, exactly as stashfetch-a measured. A recorder that
  missed axes would miss that one too; it does not.
- Axe holding on this stack is rare overall: an axe-tier tool is
  held in 30 days on only 1 of the 10 seeds run (15337; pilot +
  confirm). The other 9 seeds hold whittle/none throughout. That is
  a census observation about axe acquisition on the census stack,
  not a verdict about axes in the game at large (other stacks and
  longer horizons may differ).

## 4. SENSE-TEST (law — read end to end)

Still evening L10 (ON leg, full day lines, judged corpus): the
villager travels to the wetland, catches fire-gossip fragments
("Fatima telling Yara about Tao... barely the same story now"),
works a Purslane patch clean (240 kcal), travels to the creek,
catches more fragments, eats the Purslane (240 kcal), and is
refused honestly: "No bridge tonight — the pack holds 3 logs, and
a bridge needs 4." Then a failed-work line ("Nothing. Your arms
ache... -70 kcal, 48 ticks of work, gone either way"). Next morning
L11: 31 kcal, 3 logs, Stone knife, 128 ticks left, bigtree at
(5,0) two steps away. PASS on meaning: this reads as a person
living a day — foraging, listening, eating, ending where the walk
took them, with an honest refusal and an honest failed effort.
Still evening L14 reads the same way, with growth in it: Green
Thumb deepens to L2, the System grants Lucky Rock, Purslane eaten,
refused on 0 logs; next morning L15 wakes at 52 kcal — the best-fed
wood-short morning in the strand, still 28 kcal short of swinging
anything.

The joint-gate failure itself is invisible in-story, as tickfell
noted and this census re-confirms: no line on any strand morning
names the nearby bigtree or the missing axe. The villager's want —
a tree in reach, no axe to fell it — is nowhere in the day's text.
That invisibility is a property of check-first design (no fell is
attempted, so no narration is owed under no-silent-actions), not a
claim that the story says it. It matters for any future fix: a fix
that only changes numbers still leaves the want unspoken, and a
player watching this villager would never learn WHY the mornings
fail. Whether a want line belongs here is a design call — flagged,
not built (DIAG scope).

## Village assessment (plain words)

The village is the same working village the strand arms have always
seen, on a new base with no drift: it survives 30 days on all 20
legs run (pilot 2 + confirm 18), its scholar sleeps out by the creek
for 3 nights with the fire off and 10 nights with it on, and the
fire-on road ends the same way it always has — the stranded
villager's line ends on day 17 and a successor wakes at haven. The
pack tells the story in one line: 4 logs, then 3, 2, 1, 0, as the
warmth fires eat the bridge a log at a time (the haven pile holds
33-35 logs all the while — the wood is home, the villager is not),
while the villager carries a Stone knife past bigtrees it cannot
fell and wakes with 0 kcal on five of the seven wood-short
mornings. What the village is missing is not a smarter fell gate —
it is an axe in the villager's own stash at spawn, and morning food
that survives the night. Until those arrive on this stack, every
field-wood fix measured here is gated on tools and food the
villager does not hold. The one seed that does hold an axe (15337)
never strands, so the game, on this stack, never puts an axe-holder
in the position where a morning fell would matter — that
non-overlap (axe seeds don't strand, the strand seed has no axe)
is the shape of the blank, stated plainly for the next arm.

## Reachability

No new content reached; no game change landed, so no reachability
change is claimed. Creek/bridge content reached on all pilot legs
(guard 4 creek / 1 rescued, ON 10 / 0) and on confirm legs as
rescued creek evenings (see §3). Wave reach: pilot 15215 wave 1 on
both legs; confirm bank wave 2 on 7 of 9 seeds per leg, wave 3 on
15439, wave 1 on 15221. Waves 4-5 in 0/20 legs in this 30-day window
(same window as the prior strand arms; the strand seed's climb
stalls at the creek, not at a wave gate, on these legs).

## Wall numbers

NOT OBSERVABLE as reachability on a 30-day pre-seat census — reported,
never claimed. Observed counts on all 20 legs, all seeds alive at day
30 (daysAlive 30, endReason survived; the ON vessel change day 17 is
a succession, not a village loss): national 0, table 0, wins 0
(structurally unreachable in this band, not a wall measurement);
median survival 30 days (ceiling — all legs survived the window).

## Metric review

- The ROUTINE_ALLOWANCE (40) remains UNVALIDATED: no fell ever
  fired under it on this stack either, so no projection error was
  ever measured. Its arithmetic is proven (unit boundary tests:
  232 passes, 231 fails); its accuracy as a routine forecast is not.
  A future arm that actually fells must audit it before trusting
  the gate. Do not cite 40 as a validated routine forecast.
- The joint denominator (needs-wood strand mornings only) behaved
  as designed: the guard leg's 3 pack-ready mornings are excluded
  from D, and the confirm band's D = 0 is reported as "no
  denominator", not as "0% joint". A reader who wants joint over ALL
  strand mornings can recompute it from the reported pack-ready
  counts (pilot: 0 joint of 12 strand mornings, 5 of them
  pack-ready). The denominator choice was frozen in the prereg and
  was not re-scored mid-run.
- Fed uses MORNING kcal, as preregistered. The evening meal does
  not survive the night in this record: L10's evening eats 240 kcal
  and L11 wakes at 31; L14's evening eats 240 and L15 wakes at 52.
  Morning kcal is a wake pool drained by the previous day's routine
  and the overnight burn, not the evening meal carried over. A
  future arm that wants fed mornings must change the morning (eat
  at wake, forage before felling), not the evening.
- Snap limitation, disclosed: inventory entries for food (Trail mix,
  Dried meat) carry no itemId in the snap, so census invIds lists
  contain nulls for them. This does not touch the tool record:
  woodcutTier reads inventory + equipped directly from the engine,
  and every strand morning's tier/canFell pair agrees. The nulls
  are a display artifact of the snap's id mapping, not missing
  tools.
- The both-legs-identical early trajectory (guard vs ON mornings
  L2-L7 identical, same spawn, same fetch, same knife arrival)
  confirms the warmth wrapper perturbs nothing before the strand:
  the guard/ON comparison on identical seeds is a clean warmth
  contrast, and the strand divergence after L7 is warmth's doing
  (6 fires on ON, 0 on guard), not recorder noise.

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-31 — food-economy/tool — AXE SEEDS DON'T STRAND,
  STRAND SEED HAS NO AXE (this arm): on the census stack, the only
  seed holding an axe-tier tool in 30 days (15337, hatchet fetched
  day 1) never strands at the creek, while the only seed that
  strands (15215) never holds an axe. A morning-fell fix on this
  stack therefore has no seed on which it can fire — the fix's
  precondition and the strand's occurrence do not overlap. (evidence:
  this file; judged jointgate corpora, 15215 + 9-seed bank.)
- [open] 2026-10-31 — food-economy/narration — STRAND-MORNING WANT
  STAYS INVISIBLE (this arm, re-confirming tickfell): strand
  mornings with a fellable bigtree 2-3 steps away and no axe
  produce no line naming the tree or the want. Whether a want line
  belongs here is a design call. (evidence: this file §4; judged
  pilot-ON corpus, still evenings L10/L14.)
- [open] 2026-10-31 — food-economy — MORNING KCAL COLLAPSES
  OVERNIGHT (this arm): strand mornings wake at 0-52 kcal after
  evenings that ate 240 kcal (L10 -> L11: 31; L14 -> L15: 52). Fed
  mornings need a morning-side change (eat/forage at wake), not a
  bigger evening meal. (evidence: this file §1/§4; judged
  pilot-ON corpus.)
- This worker does NOT edit hidden_files/sim-findings.md — the
  coordinator marks backlog items at closeout.
