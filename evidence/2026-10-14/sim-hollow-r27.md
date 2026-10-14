# HOLLOW UNLOCK + 48h chains — wave-5 census extension (scale-onramp r27, ARM 3 diagnostic instrument, 2026-10-14)

ARM 3 of the scale-onramp multi-arm run. INSTRUMENT ONLY — no game-code changes
(new scripts + lib extensions only). Closes two named blanks from
sim-findings.md: #134 (HOLLOW UNLOCK — the r26 census was scholar-centric and
couldn't explain s88's village-lost-with-living-scholar) and #90 (48h-CHAIN
METRIC — the same-day multi-death metric misses d91→d92→d93 and d75→d76 chains).

## Pre-registered header (docs/MEASUREMENT.md §§9–12, 14)

- **Primary metric**: (a) post-unlock villager-death census rows on wave-5
  unlockers — each row: day, who, cause, category, days-post-unlock, mantle
  at death — with ≥90% of post-unlock villager deaths attributed to a named
  category (no silent `other:` absorption); (b) a coherent causal story for
  the hollow pattern vs the combat-death pattern, stated in numbers.
- **GO threshold (diagnostic)**: ≥90% attribution AND the named causal story
  on the 8-seed suite. A NAMED finding is the GO.
- **Horizon**: 180d death-aware (same as r26 so the two censuses are
  comparable). Why: wave-5 unlocks land ~d57–116; post-unlock survival is the
  window. Death-aware, never fixed 200d.
- **Seeds**: 11/22/33/44/55/66/77/88 (standard set).
- **Policy**: leadfeast (leadcourt + FEASTSCALE_R13=1) — the policy that
  maximizes wave-5 unlocks.
- **No before/after**: measurement only — per-run nondeterminism (r25/#113)
  makes identical-seed before/after unmeasurable for this question.
- **det-gate on the seed set** (this run, before census reads): 5/8 IDENTICAL
  (44/55/66/77/88), 3/8 DIVERGED (11: day 41, 22: day 65, 33: day 56).
  Per-run nondeterminism persists post-detfix on fight-heavy seeds — census
  SHAPES are stable across invocations, exact days/unlock binaries flip.
- **Convergence report**: diagnostic — census delivered, blanks closed.
  converging.

## Instrument

- `scripts/w5census-lib.js` EXTENDED (r26 functions untouched — r26 proof
  test re-run GREEN, pins hold): `buildVillagerRows` (one row per non-player
  villager/'person' death at day ≥ unlock, with the mantle-holder at death
  attached; reconciliation pins rows == post-unlock villager-death tally),
  `aggregateVillagerRows`, `classifyPersonFight` (tbEnd-snapshot →
  alien-duel/uprising/betrayal/other-person), `findCombatChains48`
  (maximal runs of COMBAT scholar deaths with gaps ≤ 2 days — non-combat
  rows neither start nor extend), `buildVillageProfile` (day-keyed
  roster/pantry/trust-band/standing curve → unlock anchors + last-30d window).
- `scripts/sweep-w5census-r27-20261014.js` — the sweep driver. r26 core plus:
  (1) read-only `Game.tbEnd` wrap snapshotting the LIVE tbfight object
  (uprising/betrayal/aggressor flags, alienPid fighters) before call-through
  — the only determinable source for the person-fight subtype split; (2)
  daily village curve (roster, pantry kcal, trust mean/min + low/mid/high
  bands, standing, keyed by game-day); (3) hollow-filtered `Game.say` capture
  (bounded 800, read-only) for sense-testing. `opts.wraps 'all'|'none'` is
  the instrument-honesty control.
- `scripts/test-hollow-instrument-20261014.js` — proof test. PART A (pure,
  14 checks with real RED phases: naive exact-match taxonomy RED, unfiltered
  villager rows RED, same-day metric missing d91→d92→d93 RED, alienPid-less
  classification RED). PART B (live, s55 180d): 0 instrument exceptions,
  scholar + villager rows reconciled, every row ≥ unlock day, person-fight
  rows carry subtypes, and wraps:'all' vs wraps:'none' BYTE-IDENTICAL on
  123 per-day state hashes — the wraps are read-only. **22/22 GREEN.**
- Mid-run instrument bug caught and fixed: the first sweep stored only the
  first 160 say lines (early-game chatter, days 1–42) — the collapse
  transcripts live in the tail. Driver now stores the full bounded capture;
  sweep re-run.

Raw data: `evidence/2026-10-14/w5census-r27.json` (19 scholar rows + 21
villager rows, all reconciled, 0 instrument errors, 0 `other:` leaks).

## RESULTS

Sweep: **4/8 unlockers** (s22 d57/227, s44 d58/202, s55 d116/202, s88 d68/277;
s33 flipped off this invocation — the documented noise floor). 19 scholar
rows + 21 villager rows, all reconciled.

**GO threshold: MET.** 21/21 villager rows attributed (100% ≥ 90%): combat 14
(66.7%), wound 3 (14.3%), disease 3 (14.3%), contest 1 (4.8%). Zero `other:`
leaks. Causal story below, in numbers.

### The hollow vs the combat bleed, in numbers

| | s88 (hollow) | s22 (long bleed) | s44 (fast bleed) | s55 (bleed) |
|---|---|---|---|---|
| unlock / standing | d68 / 277 | d57 / 227 | d58 / 202 | d116 / 202 |
| scholar deaths post-unlock | 1 (combat) | 7 (5c/1contest/1starv) | 8 (7c/1starv) | 3 (all combat) |
| villager deaths post-unlock | 6 (3c/1wound/2disease) | 3 (2wound/1disease) | 9 (8c/1contest) | 3 (all combat) |
| roster unlock → end | 8 → 4 | 9 → 6 | 8 → 7 | 6 → 1 |
| pantry unlock → end | 17,644 → **0** | 46,370 → 27,710 | 29,027 → ~0 (d111) | 21,680 → 11,641 |
| trust mean unlock → end | 46.8 → 49.3 | 44.8 → 53.7 | 46.4 → 55.6 | 51 → 50.6 |
| end | village-lost d88, scholar alive | village-lost d127 | village-lost d115 | village-lost d125 |

The hollow pattern: the roster does NOT bleed out through the mantle — it
dies AROUND a living scholar while the PANTRY hits zero. s88's pantry went
17,644 → 0 and the transcript shows the honest engine path (game.js:27125):
"⚠ Haven's pantry is empty. Day 1 of hunger." → Day 2 → Day 3 → "Haven
couldn't hold... people started walking — in different directions. The
scattering, again." Village-lost d88 with Somchai Prasert alive and holding
the mantle. The combat-bleed pattern: scholars die in named fights (Network
Note, Editor, Eater, Spoiler, Rerun, Paparazzo, Buffering, Redactor, Grief
Counselor, Night Court) AND villagers die in the field ('monster' cause —
8/9 on s44, 3/3 on s55), the roster bleeds, and the pantry may or may not
collapse (s22's stayed fat at 27k — its villagers died of wounds and
disease, not hunger).

s44 is BOTH: 17 combat deaths bled roster + mantle d58–d103, then the
pantry collapsed d111–d115 and the scattering finished it. The hollow is the
terminal state; the combat bleed is one road there.

### The hollow's proximate engine (new, measured)

s88's transcript, d85–d86: "🌙 Night. The lingering **The Cancellation**
gorges at the treeline — 1,258 kcal gone from the stores. Drive it off, or
call for help." then "— 2,813 kcal gone from the stores." A wave-5 Producer
EATING THE PANTRY — 4,071 kcal over two nights, directly driving pantry→0 →
3 hungry days → scattering. Wave 5 doesn't just kill scholars; it eats the
village's food. The fiction ("waves 4-5 are the System's response to your
standing") is lethal at the pantry level, not just the combat level. →
sim-findings entry.

### 48h combat-succession chains (#90)

The metric fires on live data: 2/4 unlocker runs had 48h chains this
invocation — s44 d90 (depth 2: gen_kerhcl + ivy_wang, both to The Spoiler
w5, SAME DAY — the old metric would catch this one too) and s55 d119→d121
(depth 2: Paparazzo w2 → Rerun w5 — the old same-day metric MISSES this).
Max depth 2 this invocation; the prior invocation's depth-3 (s33 d126→d128,
all w5 fights) shows the metric's range. The r26 12d chains still fire
(s22 depth-5 d79→d107, s44 depth-4 d90→d100). Both metrics now reported;
48h is the honest succession-feed metric.

### Person-fight subtype splits (#133 stays OPEN)

The tbEnd instrument fired 0 captures on the 8-seed suite — no
uprisings, betrayals, or alien-duels on these trajectories. The split
machinery (`classifyPersonFight`) is proof-tested on fixtures (alienPid →
alien-duel wins over flags; uprising+betrayal → uprising; betrayal-only →
betrayal; plain hostile → other-person) but has NO live coverage. The
engine still emits no tele distinguishing these paths — #133 stays open.
→ sim-findings entry.

## The census, in plain words

Wave-5 unlockers die two ways. The LOUD way: scholars and villagers die in
named fights — 14 of 21 villager deaths are combat ('monster'), the scholar
rows pair to Network Note, Editor, Eater, Spoiler, Rerun, Paparazzo,
Buffering, Redactor, Grief Counselor, Night Court. Successors walk into the
same feed: 48h chains on 2/4 unlockers, 12d chains on 3/4. The QUIET way
(the hollow): the pantry empties — on s88 because a wave-5 Cancellation
lingered at the treeline and ate 4,071 kcal of stores in two nights — and
after 3 hungry days the village scatters with a living scholar holding the
mantle. s88's last vote, d88: "The bins are echoing. We vote half rations —
three days, everyone, no exceptions — or the hunters go out hungry and
bring back more than hunger." Too late: Day 3 of hunger. The village is
gone. The scholar is alive.

## Village assessment

- **s88** (unlock d68, standing 277 — highest measured): the hollow. Rosa
  Mendez died d84 to The Redactor (w3); Somchai took the mantle and survived.
  The village died around them: 6 villager deaths (wound, monster×3, disease×2),
  roster 8→4, pantry 17.6k→0, then the scattering. Who thrived: nobody — the
  village walked. What was missing: any defense against a pantry-eating
  wave-5 monster, and any way to recover from 3 hungry days. The d88 half-
  rations vote reads as people deciding, too late.
- **s44** (unlock d58, standing 202): the fast bleed + hollow finish. 8
  scholars (7 combat incl. a d90 same-day double to The Spoiler w5, 1
  starvation), 9 villagers (8 'monster', 1 contest). Pantry nearly collapsed
  mid-run (29k→1.4k), recovered, then collapsed for good d111–d115 with rival
  raids carrying off the dregs (380 + 1,583 kcal). Who thrived: nobody.
  What was missing: everything the r26 census already named — no brake on
  the succession feed.
- **s22** (unlock d57, standing 227): the long bleed. 7 scholars over 70
  post-unlock days (Network Note×2, Editor, Eater, Focus Group, contest,
  starvation), 3 villagers (2 wounds, 1 disease). Pantry stayed fat
  (46k→27k); trust ROSE (44.8→53.7). The village fought well, ate well, and
  bled out through the mantle anyway. Final scholar died of STARVATION at
  d127 with 27k in the pantry — the distribution blank, again.
- **s55** (unlock d116, standing 202): the bleed. 3 scholars (Paparazzo,
  Rerun, Buffering) + 3 villagers ('monster' ×3, all d117–d118), roster
  6→1, 48h chain d119→d121. One villager left at the end.
- **s11/s33/s66/s77**: no unlock — the familiar pre-wall attrition.

## Sense-test verdict (SENSE-TESTING LAW)

Read the d80–88 (s88) and d95–115 (s44) transcripts in full. They read as
people: Rosa's death ("The village stops. Somebody screams. Somebody else
starts digging."), Cole to the successor ("You're not Rosa. No heat in it.
Just fact. You'll have to earn this face."), the System's mantle-transfer
beat noticing its own lie ("We hardly noticed. (That is a lie. We
noticed.)"), the Codex recording "Rosa Mendez, 84 days", Deshawn's aid
arriving with voice, the d88 half-rations vote, Yavdokha's death beat
("The village is 7 now"), Emberhold/Stonebridge/Red Table pressing tributes
down "while the chair is empty". The Redactor's signature mechanic fires
honestly on s44 d113 ("nothing left loud enough to redact. It is STARVING...
it starves — and goes") — the scholar played quiet turns and won the
mechanic, then died to a Redactor anyway. Robotic flags (out of this arm's
instrument scope, → sim-findings): the care-package beat "You find a small
bundle tucked where you'll find it. No one saw it left there." verbatim ×3;
the daily hold-item beat ("Your gifts are not mastered — but they are
lived-in...") identical every day; "You walk back into Haven... The village
is glad to see you." daily; The Strike's SHUTDOWN beat ×16 identical.

## Instrument findings (tooling)

1. Say-capture lesson: store the FULL bounded capture, not a head slice —
   the first 160 lines are early-game chatter (days 1–42); the collapse
   lives in the tail. Caught mid-run, fixed, sweep re-run.
2. `Game.say` wrappers are read-only-safe: proof test B8 (wraps all vs none
   byte-identical on 123 day hashes) + det-gate green on 5/8 seeds.
3. The tbEnd person-fight capture is the right seam for #133's split — but
   it needs a trajectory where person-fights fire. None on this suite.

## Noise floor (r25/#113, confirmed again)

Sweep 1 → sweep 2, identical seeds/policy/days/code: unlock rate 5/8 → 4/8
(s33 unlocked d111 then didn't); s88's days flipped (d66/d70 → d68/d88)
while the SHAPE reproduced exactly (highest standing, 1 post-unlock scholar
death, village-lost with the scholar alive, pantry→0). det-gate on this
run's seed set: 5/8 identical, 3/8 diverged (11/22/33). Census shapes are
stable; binaries and exact days flip.

## Blanks filled / documented

- **#134 HOLLOW UNLOCK — FILLED.** 21/21 villager rows attributed; the
  hollow-vs-combat story named in numbers; proximate engine found (wave-5
  pantry-gorging → 3 hungry days → scattering, game.js:27125).
- **#90 48h-CHAIN METRIC — FILLED.** `findCombatChains48` built, proof-tested
  with RED phases, fires on live data (2 runs, max depth 2; depth-3 on the
  prior invocation).
- #133 person-fight tele question: still OPEN (no live coverage); instrument
  ready.

## Metric review

Pre-registered GO (≥90% attribution + named causal story): MET on both —
100% attribution, story stated in numbers above. No re-scoring, no revision
proposed. The diagnostic verdict: post-unlock villages die two measurable
ways — the combat succession feed (scholars AND villagers, 48h-chained) and
the hollow (pantry→0 → scattering, wave-5 pantry predation as one proximate
engine). Both end village-lost; neither reaches the table (table 0/4
unlockers this invocation — r26's 42% table-reach did not reproduce).
