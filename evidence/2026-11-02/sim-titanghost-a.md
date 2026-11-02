# sim-titanghost-a — TITAN GHOST STOP (B1 GO) + MUSTER-HUNGER LEGIBILITY (B2, in progress)

- Run: fleshout-loop-a-20261102T0250Z (Loop A, axis scale-onramp).
- Worker branch: sim-titanghost-a. Base: master tip 9da23adc5
  (fast-forwarded from the cut base 56a8172f0; the one intervening
  commit is docs-only). Prereg:
  evidence/2026-11-02/sim-titanghost-a-prereg.md (commit c92fe7b8e,
  BEFORE any judged sim). Judged exactly against that header.
- Scope: src/js/titans.js ONLY, plus tests/instruments/evidence.
  Layer 2 (re-placement, kill-gating, slain credit) NOT built — a
  design call for Steve. No gates, stages, deed bars, win prices,
  or #1538 items touched.
- Canon: docs/CANON.md + docs/SCALE.md + docs/SCALE-DISCOVERY.md
  read; NO titan-specific canon doc exists in docs/ — the governing
  source is the src/js/titans.js header plus the heraldkill Layer-1
  spec and the trustbleed delivery spec (items 1–2; item 1 built
  here as B2, item 2 pantry-fed upkeep NOT built).

## B1 — LAYER-1 GHOST STOP: VERDICT GO (all 5 bars)

Change (titans.js, +~30 lines): a `titanMonsterPresent` helper — a
titan is present while its def.monster id, or any
def.campaign.nodes id for campaign titans, still stands in the
world. `titanEscalate` returns early for an absent titan (no pantry
feed, no allied strike). `soundTitanCall` says the nothing-located
line — "There is nothing located to march against — the sky is
quiet. You commit no one into the dark." — and returns null WITHOUT
creating a muster. `titanCommitOwn` refuses with that same line for
an absent titan (slain-first ordering kept: a slain titan still says
"already dead"; a pending commit for an absent titan lapses).

Stack (named exactly): substrate
scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
TABLESEATNOWAIT=1) + fullseat-diag (FULLSEAT=1) + wavegate-diag
(WAVEGATE=1); instrument scripts/sim-titanghost-a-probe.js;
horizon DAYS=180, death-aware. Kill seeds (kill day): 95402 (d169),
95433 (d133), 95438 (d155), 95439 (d147), 95440 (d143). Controls
(Herald alive at end, omen 2): 95423, 95413.

Before/after (identical seeds, same probe script; corpus
evidence/2026-11-02/perseed-titanghost-a/before|after):

| seed | phantom Herald lines post-kill | call | muster blades | upkeep charged |
|---|---|---|---|---|
| 95402 | 2 → 0 | muster(4+3) → null | 7 → 0 | 2040 → 0 kcal |
| 95433 | 4 → 0 | muster(2+1) → null | 3 → 0 | 0 → 0 kcal |
| 95438 | 6 → 0 | muster(0+3) → null | 3 → 0 | 0 → 0 kcal |
| 95439 | 6 → 0 | muster(4+0) → null | 4 → 0 | 0 → 0 kcal |
| 95440 | 8 → 0 | muster(2+1) → null | 3 → 0 | 0 → 0 kcal |
| TOTAL | 26 → 0 | formed 5/5 → 0/5 | — | — |

Bars: (1) phantom 26→0, 0 on every seed — PASS. (2) musters formed
against the absent titan 0/5 (call null, commit null on both taps,
Haven 0 on all 5) — PASS. (3) upkeep charged 0 on all 5 — PASS
(before-upkeep was already 0 on 4 seeds because the pack was empty
at probe time; see metric review — the judged bar is after==0 plus
muster==0, which entails it). (4) Controls BYTE-IDENTICAL before
vs after (call, both commit taps, blades, upkeep: 95423 muster 7+3,
upkeep 390; 95413 muster 6+2, upkeep 0) — PASS. (5) Unit proof
scripts/test-titanghost-a.js 13/13 green (absent escalation/call/
commit incl. pending-lapse; present escalation/call/commit
unchanged) — PASS. **B1: GO.**

Existing-test fixtures (design changed on purpose — see repo
green-list rule): seven tests set stage-2 omens without placing
the titan, which the old call/commit accepted and B1 correctly
refuses. Their fixtures now place the titan they call against
(NO assertion changed): test-titan-standdown-20261019,
test-titan-class (spawn before §e's call, removed before §f's
no-Herald-standing check), test-blitz-titan (plus a tile grid on
its stub map, which titanSelfActions' placement repair reads),
test-coalition-recruitment-20261015 (finale + herald placed),
test-mantle-coalition-20261015, test-coalition-presentation-20261015,
test-build-muster-roster-20261101. All seven pass after the fix
(standdown 19/19, titan-class 32/32, recruitment 24/24, mantle
14/14, presentation 22/22, muster-roster PASS, blitz 56/56 — the
same counts as on base). Full `check.js --quick` on B1 code before
the fixture fixes: 273 passed, 17 failed; the titan-area failures
among them were these seven fixtures (the rest, e.g. a racks-voice
gate check, touch code B1 cannot reach — a full re-run after the
fixture fixes is owed and will be reported in the final evidence).

Panel (§15, guardrail context, never verdict): base vs B1 panels,
policy `competent`, seeds 95423,95413, days 180 — compare decision
`review_required` SOLELY for n=2 insufficiency; every one of the 23
contract metrics has paired delta 0 (wins 0/0, national 0/0, deaths
identical, all luck percentiles identical). Files:
sim-titanghost-a-panel-base.json.gz,
sim-titanghost-a-panel-b1.json.gz,
sim-titanghost-a-panel-compare.md.

Secondary consequence (not a verdict driver, reported honestly):
stopping the ghost changes two kill seeds' fates — 95433
(village-lost d152 → survived 181d) and 95439 (village-lost d174 →
survived 181d) — because the phantom trust strikes (−5 each) no
longer bleed their links. The ghost was not just lying; on those
seeds it was killing villages. Other kill seeds' end states are
unchanged (95402 survived 181 regional w4; 95438 survived 181
regional w4; 95440 survived 181 regional w5).

## B2 — MUSTER-HUNGER LEGIBILITY (in progress at this writing)

Change (titans.js, on top of B1): hunger say line states "trust −2
per fire per day" on hunger days with allied links charged, and
titanMusterUpkeep writes one link.history entry per charged link
per hunger day (kind `muster-hunger`, amount −2). The −2 itself is
untouched. Stack: trustbleed intervened twin
(scripts/trustbleed-replay-20261101.js UNMODIFIED,
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1 MUSTER=1, MODE=intervene, SEEDS=90111,
DAYS=180). Results to be appended; verdict pending.

## Village assessment (plain words)

Before this fix, a village that did the impossible — killed the
Herald in the field — was punished for it in secret: the dead
Herald kept eating from its stores and cutting its alliances'
trust every five days, and the player could still sound a call and
send their own people marching against nothing, paying upkeep for
a fight that could never start. After the fix, the game tells the
truth: the call answers "there is nothing located to march
against," no blades march, no upkeep is charged, and the night
stops blaming a corpse. What the fix does NOT do is repair the
road: the Herald is still dead-but-not-slain, its omen still
frozen at stage 2, and the Table's key still cannot count it.
That repair is Layer 2 and waits on Steve's ruling — the player
now at least stops being billed for a closed road.

## Reachability verdict

- Titan road after a field kill: still bricked as a road (Layer 2
  open), but no longer actively harmful (Layer 1 closed). The call,
  commit, escalation, and upkeep paths are all honest about an
  absent titan.
- Titan road with a live titan: unchanged — controls and panel
  show byte-identical behavior.
- Waves 1–5 / Arc / regional→national / table / win: not moved by
  this arm's judged metrics. Kill-band probe end fields: rank
  regional 4/5 + global 1/5 (95439), wave-4 5/5, wave-5 1/5 (95440),
  median survival 181d, max 181d (after runs; before runs: median
  181d, max 181d, with 95433 lost d152 and 95439 lost d174 — see
  secondary consequence above). Won / national / table under the
  loop's analyzer definitions are NOT measured by this probe (its
  state.table.entered / state.won reads differ from the heraldkill
  analyzer's) and are not claimed here either way; the heraldkill
  corpus before-picture stands (won 0/5, national 2/5, table 2/5
  on the kill band). Death-cause shares are not in the probe
  instrument; panel deaths on controls are identical before/after.

## Blanks filled / documented

- FILLED (code): ghost escalation, ghost muster formation, ghost
  upkeep — all three Layer-1 harms stop.
- DOCUMENTED (not fixed, out of scope): Layer 2 — the field-killed
  Herald's frozen omen, missing slain credit, and the still-offered
  call/commit buttons in titanSelfActions (they now refuse honestly
  instead of billing, but the road itself stays closed until Steve
  rules on re-placement vs kill-gating vs slain credit).
- DOCUMENTED: the hunger-legibility work continues as B2 below.

## Metric review

- B1 bar 3's parenthetical ("before: >0 wherever a muster formed")
  proved inaccurate: before-upkeep was 0 on 4/5 kill seeds because
  the scholar's pack was empty at probe time (need 3000–7000 kcal,
  pack 0), and 2040 on 95402 (pack-capped). The bar as judged was
  after==0 on all 5 plus muster==0 (which entails zero upkeep for
  any pack state) — that reading is the one the GO rests on, and
  the parenthetical should be dropped for the next run. No other
  bar moved.
- B2 bars unchanged (see prereg).
- Panel status `review_required` on 2 cases is a sample-size label,
  not a signal: all 23 paired deltas are exactly 0.

## Corpus paths

- Prereg: evidence/2026-11-02/sim-titanghost-a-prereg.md
- Probe + analyzer: scripts/sim-titanghost-a-probe.js,
  scripts/sim-titanghost-a-analyze.js
- Probe corpus: evidence/2026-11-02/perseed-titanghost-a/before/
  (7 JSONs), .../after/ (7 JSONs)
- Panel: evidence/2026-11-02/sim-titanghost-a-panel-base.json.gz,
  sim-titanghost-a-panel-b1.json.gz,
  sim-titanghost-a-panel-compare.md
- Proof test: scripts/test-titanghost-a.js (13/13 at B1 commit)
