# sim-titanghost-a — TITAN GHOST STOP (B1 GO) + MUSTER-HUNGER LEGIBILITY (B2 GO)

- Status: BOTH sub-changes GO. B1 commit 853ed37d8; B1 follow-up
  commit 9d950c50 (campaign-node presence + 6 more fixtures); B2
  commit (this file's final version) — see corpus paths.

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

## B2 — MUSTER-HUNGER LEGIBILITY: VERDICT GO (all 5 bars)

Change (titans.js, on top of B1): hunger say line states "trust −2
per fire per day" on hunger days with allied links charged (as its
own parenthetical, so the before/after line diff is exactly that
clause), and titanMusterUpkeep writes one link.history entry per
charged link per hunger day (kind `muster-hunger`, amount −2,
note naming the hunger). The −2 itself is untouched — same loop,
same guard, same assignment.

Stack (named exactly): trustbleed intervened twin
(scripts/trustbleed-replay-20261101.js UNMODIFIED,
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1 MUSTER=1, MODE=intervene, SEEDS=90111,
DAYS=180). Before run on B1 code, after runs on B1+B2 code
(identical seeds/stack isolate B2). Both twins reproduce the
trustbleed baseline exactly: call sounded day 72, 6 allies,
92 refused attempts, village lost day 107, maxWave 4, national 0,
table 0, won 0, instrument errors 0.

Bars: (1) Hunger-day set identical before vs after (35 days,
73–107) — PASS. (2) History attribution — see instrument note
below; with the corrected snapshot-diff instrument: before 0
entries, after exactly 90 entries (3 per active link per hunger
day, days 73–102; 0 on days 103–107 when all links are broken),
every entry amount −2, none on non-hunger days — PASS. (3) Price
line on every hunger day (35/35) — PASS. (4) NO balance change:
per-link daily trust series BYTE-IDENTICAL before vs after, end
fields identical (village-lost day 107, regional), and say lines
identical except the price clause (306 vs 306 lines) — PASS.
(5) Unit proof scripts/test-titanghost-a.js 21/21 green (13 B1 +
2 follow-up + 6 B2: hunger writes one −2 entry per charged link,
fed day writes none, trust math identical) — PASS. **B2: GO.**

Instrument note (metric review, read this before judging bar 2):
the replay's history stream CANNOT judge bar 2 past ~day 90. It
captures new entries by slicing from the previous snapshot's
length; once a link's history saturates the 40-entry cap, length
stops growing and the slice goes empty — for ALL kinds, before
and after alike (before-run historyNew goes sparse after day 85
even for tribute/tended entries). The replay analyzer therefore
reports bar 2 FAIL on a partial count (53 of 90) that is an
instrument ceiling, not a code gap. The bar was re-judged with a
new snapshot-diff instrument
(scripts/sim-titanghost-b2-snap.js, same policy chain, same
intervention, read-only snapshots): its trust series matches the
replay twins exactly on both runs (proving the instrument change
did not move the game), and it counts all 90 entries. The replay
analyzer's bars 1, 3, 4 and line-identity check all PASS on the
same runs and agree with the snap instrument.

Plain-words reading: the bleed is now legible. Where the player
used to watch trust fall 2 a day with no event attached, the
hunger line now says the price ("trust −2 per fire per day") and
each link's history carries one −2 entry per hungry day — so a
player scrolling back can finally see what the muster cost and
when. Nothing about the cost itself changed: the same village
still breaks on day 103 and dies on day 107. Legibility, not
relief — relief is the trustbleed spec's items 2–4, still open.

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

## B1 follow-up (commit 9d950c50) — campaign-node presence

While classifying `check.js --quick` failures, a real B1 gap
surfaced: campaign nodes in titans.json come in two shapes —
finale's are plain monster ids, the Network's are objects
({id, monster}) — and the first helper only matched string nodes.
A live summoned Network has all nine node monsters standing
(networkSummon spawns every piece, heart included), so live play
was covered by the heart id, but the helper now also counts node
monsters, so any standing node counts as present. Six more
fixtures set stage-2 omens without placing their titan and were
fixed the same way (no assertion changed):
test-cell-action-handoff, test-coalition-body-turns,
test-coalition-scale, test-main67-titan-standdown,
test-network-commit-lock-runtime (Network heart stands in for the
summon's spawns; Finale crew node for its started campaign),
test-table-campaign-isolation-20261015 (crew + opening nodes for
its started campaign). All six pass at base counts after the fix.
Total fixture files touched by B1: 13 (7 + 6).

Quick-check accounting (honest, no rerun claimed): first run on
B1 code before any fixture fix: 273 passed, 17 failed. Second run
after the first 7 fixes: 278 passed, 12 failed. Of those 12, 6
were the B1-caused fixtures fixed in the follow-up (each verified
individually at base counts afterwards) and 6 are pre-existing:
measurement-workflow + measurement-proof-update (retained proofs
already stale at base — the proof-update script throws "Proof
source inputs are not current" with base titans.js too; proof
hashes are never hand-edited, refresh belongs to the maintenance
loop), mobile-combat-cadence, occupation-panels, phone-frame-proof
(stale receipt), establishment-r20 (racks-voice gate). A third
full quick run was not repeated; the ship loop's check is the
confirming run.

## Blanks filled / documented

- FILLED (code): ghost escalation, ghost muster formation, ghost
  upkeep — all three Layer-1 harms stop.
- FILLED (code): muster-hunger legibility — price stated aloud,
  one −2 history entry per charged link per hunger day.
- FILLED (instrument): snapshot-diff twin instrument for history
  attribution under the 40-entry cap (replaces the replay's
  saturating slice for this purpose; replay twins still used for
  timeline identity).
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
- B2 bar 2's instrument changed (see B2 instrument note): the
  prereg named the replay's daily history stream as the judge, but
  that stream saturates at the 40-entry cap and misses entries
  after ~day 90 for all kinds. The BAR (one −2 entry per charged
  link per hunger day) is unchanged; it is judged by the
  snapshot-diff instrument, whose timelines match the replay twins
  exactly. Future arms judging history attribution must use
  snapshot-diff (or raise the cap question with Steve), never the
  replay's slice.
- B2 bar 3's line format: the price clause is its own
  parenthetical after the existing loyalty clause, so the
  before/after say-line diff is exactly the clause — verified
  306 vs 306 lines.
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
- Proof test: scripts/test-titanghost-a.js (13/13 at B1 commit,
  15/15 at follow-up, 21/21 final)
- B2 twins (replay): evidence/2026-11-02/titanghost-b2-before-90111.json,
  titanghost-b2-after-90111.json
- B2 twins (snapshot-diff): evidence/2026-11-02/titanghost-b2-snap-before-90111.json,
  titanghost-b2-snap-after-90111.json
- B2 instruments: scripts/sim-titanghost-b2-snap.js,
  scripts/sim-titanghost-b2-snap-analyze.js,
  scripts/sim-titanghost-b2-analyze.js (replay-based bars 1/3/4)
