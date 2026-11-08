# sim-binddiag-b — the national Binding / LEAD realm formation behind the full seat

Run: fleshout-loop-b-20261108T0230Z. Worktree: `~/workspace/worktrees/sim-binddiag-b`
(branch sim-binddiag-b). Axis: scale-onramp / winnability chain (converging, NOT
converged). Tracker blank (3) from the 0730Z winnability round: "national Binding
(LEAD realm formation) behind the full seat". Prereg:
evidence/2026-11-08/sim-binddiag-b-prereg.md (commit bad052a83).

## Canon + code read first

- docs/CANON.md, docs/TABLE.md, docs/SCALE.md, docs/COHERENCE-SPINE.md,
  docs/godpath/STEVE-ANSWERS.md. No canon invented.
- Prior decompositions, NOT re-measured: evidence/2026-10-24/sim-fullseat-diag-a.md
  (2115Z: full seat 0/8; binding blockers w5 8/8, w4 6/8, w3 6/8, foodDeeds 6/8;
  national 7/8 ever, 6/8 final) and
  evidence/2026-10-24/sim-standing99-diag-a.md (2215Z: standing-99 pin is the
  defer4 hold, bound solely by living veterans 0/1 on 7/7 pinned seeds; wave-5
  block is defer5 at 199, veterans 0/2, rd5 ready 0 days on 8/8 seeds).

## NAMING CORRECTION (code authority — the task's phrase conflates two beats)

"The Binding" is the **BELONG** road's beat (swear/serve/walk), NOT the LEAD
road's. Citations: `src/js/hierarchy.js:2489` (`belong: 'The Binding'`),
`hierarchy.js:2541` (stageNationalBeat comment), docs/SCALE.md. The LEAD road's
beat is **"The First Court"** (feast/host/cold). This diag covers the whole
national pipeline with SHAPE ATTRIBUTION at every stage, so the LEAD question is
answered by shape — and the answer is unambiguous: **every beat that staged on
this band was LEAD (the First Court); the Binding never fired once.**

## Composition choice (decided before sweeping, documented per brief)

- REUSE `scripts/policies/tableseat-nowait.js` unmodified — leanlinkrescue
  courtship (`LEANLINKRESCUE=1`) + seat legs only (`TABLESEATNOWAIT=1`), no wait
  leg. Same substrate as 2115Z/2215Z. The doorwalk/takeseat frozen-instrument
  baseline leg (national 0/16 by construction) is NOT used as the judge here.
- `fullseat-diag.js` NOT reused: it stores no pipeline trajectory, no link-role
  counts, no beat staging/answer events, and no national-loss events.
- NEW recorder `scripts/policies/binddiag-b.js` (`BINDIAG=1` gate; unset
  delegates byte-identically). PURE-READ: it never calls
  `villageStandingTotal()` during a run (side effects: releases peaks, emits
  hold beats); the gated total is computed from pure reads with the standing.js
  formula and validated against the engine's gated total only AFTER runDays. It
  writes nothing to game state and draws no RNG. Pipeline reads are pure
  computations over `hierarchyState()` links + `Game._linkSeasoned` +
  `state.foreignPolities` (read, never written) + `state.pendingNational` /
  `nationalLive` / `scaleRefused` flags + `scaleRank()`. It does NOT call
  `polityOf()` — LEAD qualification is reproduced directly from the
  seasoned-sub count, BELONG from link trust/arrears/age + the foreign-polity
  size read from state.

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate (both arms): tableseat-nowait. Baseline: tableseat-nowait,
  `BINDIAG` unset. Armed: tableseat-nowait wrapped with binddiag-b
  (`BINDIAG=1`). Own baseline replication (8), NOT another arm's corpus.
- Seeds (pilot): 76401–76408. Freshness verified at run start (prereg): 0 hits
  in every dated prereg under `evidence/`, 0 hits in every dated `sim-*.md`,
  0 seed-filename collisions (spurious substrings: `s17640` files are seed
  17640; a hex hash in `scripts/phone-frame-proof.json`). REJECTED band
  recorded: 73701–73708 (named in 2026-10-27 preregs; used by
  `scripts/sweep-deathrow-b.js`). 73641–73648 and 73671–73678 NOT reused.
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- Primary (DIAG-GO, ALL must hold): (1) 8/8 armed configs produce a full daily
  Binding trajectory with first-days for every pipeline stage + end snapshot;
  (2) a ranked binding-STAGE list; (3) shape attribution (which shape staged
  first / delivered national per seed) + national-lost events; (4) G1
  det-gate PASS; (5) G2 recorder neutrality PASS; (6) G3 corpus integrity
  PASS (incl. engine-gated validation).
- Cost bar (diagnostic): starvation totals, median days, baseline vs armed.
- Proof gates: G1 (wrapped == unwrapped on one seed, no `_binddiag` surface);
  G2 (ALL 8 seeds identical on days/gameDays/ts counters/starvation);
  G3 (16/16 rows; armed rows carry trajectory + first-days + end snapshot;
  engine-gated validation matches on every armed row).
- Landing rule: DIAG-GO → instruments + evidence + corpus (new default-OFF
  recorder policy; no game-code change, no default flips).

## Instrument fix between run 1 and run 2 (no bar changed, no re-scoring)

Run 1 (same band, same seeds) DIAG-GO'd on G1/G2/G3 but its `beats` array was
EMPTY and its funnel read `beatStaged 0/8` while national was 4/8 — a
contradiction that named an instrument blind spot, not a game finding: the
substrate answers a staged beat the SAME TICK it stages, so `pendingNational`
never survives to an end-of-day sample (`pendDays=[]` on all 8 seeds). The fix
(`scripts/policies/binddiag-b.js`, committed c93288c86): a `nationalLive`
flip with no open beat records an INFERRED same-day stage+answer beat, with
the shape the engine stamped (`state.nationalShape`), labeled
`inferred: 'same-day'` in the corpus; beats observed pending at a sample take
the existing resolution path instead — never double-counted. Proof test
extended to 19 checks (new: same-day inference on a mock Game) — 19/19 green.
Run 2 re-ran the full sweep on identical seeds and **reproduced run 1's
trajectories exactly** (all 16 configs identical on days/gameDays, identical
aggregates) while populating 5 lead beats. No threshold, seed, or horizon
changed; the funnel's beatStaged stage is now measured as the prereg wrote it.
Run 1's corpus was overwritten by run 2's (same filenames); run 1's verdict
lines are preserved in this file, not in a second corpus.

## RESULTS — DIAG-GO (pilot 8+8, seeds 76401–76408, horizon 180d, death-aware)

Sweep: `node scripts/test-binddiag-b-sweep.js` (exit 0, run 2).
Corpus: `evidence/2026-11-08/perseed-binddiag-b/` (16/16 rows + summary.json).
G1 det-gate: PASS (seed 76401, BINDIAG unset: baseline 90/90 days == wrapped
90/90 days, ts counters identical — `tsNationalDay 77, tsSeatDay 90 lesser` —
no `_binddiag` surface; re-run after the recorder fix, same result).
G2 recorder neutrality: PASS (8/8 seeds identical on days/gameDays/ts
counters/starvation — and the death-cause breakdown is identical too,
726 = 726 with the same counts in every cause).
G3 corpus integrity: PASS (16/16 rows, all days > 0, every armed row carries
a full daily trajectory + stage first-days + end snapshot, every baseline row
carries a post-run pure-read end snapshot).
Engine-gated validation: PASS (8/8 armed rows: the recorder's computed gated
total equals the engine's `villageStandingTotal()` at run end — the pure-read
formula reproduces the engine exactly, including the floor cases).

### Sweep-compare table (the panel substitute — see panel note below)

| metric | baseline (tableseat-nowait) | armed (+ binddiag-b) |
|---|---|---|
| n | 8 | 8 |
| won | 2 | 2 |
| median days / median gameDays | 100 / 100 | 100 / 100 |
| max days | 151 | 151 |
| national ever / final | 4 / 2 | 4 / 2 |
| global ever | 4 | 4 |
| table invited ever (tableWaiting) | 4 | 4 |
| table entered (tableDone) | 2 | 2 |
| entered FULL | 0 | 0 |
| wave 4 / wave 5 reach | 8 / 2 | 8 / 2 |
| max arc | 4 | 4 |
| starvation deaths total | 1 | 1 |
| seat attempts / taken / failed | 2 / 2 / 0 | 2 / 2 / 0 |
| preview seen / not-ready | 2 / 0 | 2 / 0 |
| table answers | 10 | 10 |
| death total | 726 | 726 (identical breakdown) |

Baseline and armed agree on EVERY aggregate — the recorder is provably
neutral. Death causes (identical both arms): villager combat 261 +
villager-vs-villager combat 147 + expedition 187 + player-the-wild 71 = 666/726
(92%) combat/expedition/wild; starvation 1; monster 25, arena 12, wound 9,
sickness 1, rest small.

### Per-seed detail (armed arm; baseline identical on every trajectory metric)

| seed | days | end | won | seat | wave | rank final/max | first: link/sub/seasoned/leadQ/nat | beats | natLost | end standing gated/raw/hold, rd4v/rd5v |
|---|---|---|---|---|---|---|---|---|---|---|
| 76401 | 90 | over-other | 1 | lesser, Feared, day 90 | 4 | global/global | 25/25/55/71/77 | 1 lead d77 | — | 199/347 defer5, 0/0 |
| 76402 | 72 | village-lost | 0 | lesser priced, not taken | 4 | regional/regional | 25/25/55/57/— | — | — | 199/210 defer5, 1/0 |
| 76403 | 58 | village-lost | 0 | none | 4 | regional/regional | 25/25/55/—/— | — | — | 150/150 none, 1/0 |
| 76404 | 88 | village-lost | 0 | none | 4 | regional/regional | 28/28/58/—/— | — | — | 175/175 none, 1/0 |
| 76405 | 151 | village-lost | 0 | none | 5 | regional/global | 25/25/55/57/77 | 1 lead d77 | d147 | 300/300 released, 0/0 |
| 76406 | 135 | over-other | 1 | lesser, day 135 | 4 | global/global | 25/25/55/71/77 | 2 lead d77+d134 | d88 | 199/477 defer5, 2/1 |
| 76407 | 101 | village-lost | 0 | lesser priced, not taken | 4 | regional/regional | 25/25/56/—/— | — | — | 199/295 defer5, 0/0 |
| 76408 | 100 | village-lost | 0 | none | 5 | regional/global | 25/25/55/58/77 | 1 lead d77 | d92 | 375/375 released, 0/0 |

### The pipeline funnel (the ranked binding-stage list)

| stage | seeds reaching | median first-day | seeds blocked |
|---|---|---|---|
| links formed | 8/8 | 25 | — |
| subs formed (Haven-primary) | 8/8 | 25 | — |
| ≥1 sub seasoned | 8/8 | 55 | — |
| LEAD polity qualifies (≥3 seasoned subs) | 5/8 | 58 | 76403, 76404, 76407 |
| any polity qualifies | 5/8 | 58 | (identical to LEAD — no other shape ever qualifies) |
| beat staged | 4/8 | 77 | 76402 (qualified d57, died d72) |
| national (First Court answered) | 4/8 | 77 | — |
| national held to end | 2/8 | — | 76405 (lost d147), 76408 (lost d92); 76406 lost d88, re-won d134 |

RANKED (binding = the stage where the most seeds drop out, then the largest
delay): **1. LEAD qualification (3/8 blocked) — 2. national persistence (3
loss events on 3/4 national seeds; only 2/8 hold it to the end) — 3. the
rung-clock wait (1/8 killed outright, 4/4 nationals delayed 6–20 days) —
4. links / subs / first seasoning (0/8 blocked — never the binding stage).**

### Shape attribution

- Beats staged: 5, all **lead** (the First Court). Beats answered: 5, all lead.
  Beats died / refused / deferred: 0. `scaleRefused`: 0/8.
- BELONG (The Binding): 0 staged, 0 delivered. Covenant: 0. Trade: 0.
  Conquest: 0. The substrate forms ZERO peer or Haven-subordinate links all
  run (belong max 0, covenant seasoned max 0, trade seasoned max 0 on every
  seed) — national comes ONLY through LEAD on this substrate, and the
  counter-flip worry in the prereg (counters landing Haven-subordinate) does
  not materialize here: all links are Haven-primary subs, capped at 3.
- The Binding is therefore NOT what blocks the full seat on this band: the
  BELONG road is simply never walked. The LEAD road is the whole story.

### The rung clock: national day is 77 on all four national seeds

`networkLiveDay` is 46 on every seed (first link day 25 + the Regional Dawn's
21-day bond = day 46), so the one-rung-per-season gate
(`_checkNational`: regional ≥ 30 days old) opens on day 76, and the First
Court sits the morning after — **day 77, identical on 76401, 76405, 76406,
76408**, although their polities qualified on days 57, 57, 71, 58. The ladder
is clocked off the day-25 courtship start: link 25 → regional 46 → national
earliest 77. Variance lives in qualification and survival, never in the date.
Seed 76402 is the clock's victim: qualified day 57, died of hunger day 72 —
five days before the gate would have opened. The other three non-qualifiers
never got the chance to wait: they died unqualified.

### Why the three non-qualifiers never qualify: trust, not age

- 76403 (died d58): 3 subs, ages 31–33 (old enough) but trust 37/38 on two —
  2–3 points short of the 40 bar at death. Tends: 0 (final pantry 7,500 kcal;
  rescue-tends need pantry > 20,000 — too poor to tend).
- 76404 (died d88): 2 subs left (lost one), trust 33 on the other — 7 short.
  Seasoned subs peaked at 2 (days 61–71), then fell to 1. Tends: 0 (final
  pantry 5,745).
- 76407 (died d101): 3 subs, trust 32/36/48 — the third is 1 day short of
  season (age 29) and the other two 4–8 short on trust. Seasoned subs peaked
  at 2 (day 81), then 0 (day 91) — trust decayed below 40 on both. Tends: 4,
  not enough.
Seasoning fails on TRUST in all three cases, never on age — and it fails in
two faces: too poor to tend (76403/76404, 0 tends) or tends not lifting
enough (76402: 5 tends, 76407: 4 tends, trust still 32–38 at the end).

### Why national is lost: a trust dip un-seasons a link, not a death

All three national losses show the same signature in the trajectory: subs
stay 3, seasoned subs drop 3 → 2 the day before/of the loss, and
`nationalLive` clears the next sample — a seasoned link's trust fell below
40, the polity dropped under 3 seasoned subs, `_havenPolity()` went null,
and the rank died aloud with it (the live-state rule, `hierarchy.js:2428`).
No link died in any of the three losses; no sub was lost. 76406 re-seasoned
and re-staged a second First Court at day 134 (the only second beat in the
corpus) — the climb restarts, it is not a one-shot. But 76405 (standing
released 300, wave 5) and 76408 (standing released 375, wave 5) both end
regional: **a village can be wave-5-ready and regional at once.**

### How the Binding step interacts with the veterans lock (empirical confirmation)

The code-level answer in the prereg holds on the measured seeds: the two legs
move independently, and neither implies the other.
- 76401 / 76406 sit national while gated at defer5 199 (veterans lock binding
  the wave leg: rd5 veterans 0/2 and 1/2) — the Binding delivered, the wave
  leg still bound.
- 76405 / 76408 released standing entirely (gated 300 / 375, peak 5, wave 5
  unlocked and fought) while LOSING national — the wave leg cleared, the
  Binding leg failed.
- The one-way dependency runs as coded: standing's diplomacy reads the realm
  (`_linkRegionalPlus`), so the Binding is upstream of the standing raw sum —
  diplomacy 102 appears only once the LEAD realm exists — and the veterans
  lock then holds that sum at 99/199. The full seat needs both legs; on this
  band the Binding leg fails on 4/8 seeds (3 never qualify + 1 clock-killed)
  and the wave leg fails on all 8 (0 full seats: w5 fought 0 distinct on the
  6 non-wave-5 seeds, and the 2 wave-5 seeds never sat full).

### Reachability verdict: full seat NOT REACHED — 0/8, and the Binding leg is half the reason

No run took a full seat (enteredFull 0/8 both arms). The Binding leg clears
on only 4/8 seeds and holds to the end on only 2/8 — the scale leg is not a
free square on this band, it is a second wall beside the veterans lock. The
lesser seat, by contrast, converts 2/2 invitations into wins (76401 day 90,
76406 day 135, both Feared). The gap between lesser and full is the wave-4/5
unlock chain (already decomposed: the veterans lock) PLUS a realm that must
be built, waited on, and held — three of eight villages never build it, one
more starves five days before its court, and three of the four that build it
watch it come apart on a trust dip.

### Village assessment (plain words)

These villages all do the same first thing: on day 25 they start courting,
and by day 55 one of the three bonds has ripened. That part never fails. What
fails is the slow part — keeping three villages' trust above the line that
makes a realm. Three villages watch their bonds sit at 32, 37, 38 — a few
points short, for weeks — too poor to send grain or sending it and watching
it not be enough, and then they die still regional. One village does
everything right, has its three fires kneeling by day 57, and starves to
death five days before the court would have sat — the season, not the
village, said no. The four that sit down at the First Court all sit on the
same morning, day 77, because the ladder only lets you climb one rung a
season and every village started climbing the same day. And then the realm
turns out to be something you have to keep holding: on three of the four,
one bond cools a few points, the realm quietly stops being a realm, and the
village slides back to regional without a battle — one of them climbs back
and sits again, the other two end the run regional with wave-5 monsters
already dead behind them. The full seat is not one wall. It is two: a fight
you have to be ready for, and a realm you have to keep.

### Sense-testing read (NON-MEASURED replay, seed 76402, armed, narration on)

File: `evidence/2026-11-08/sim-binddiag-b-sense.txt` (240-line ring, days
70–73; outcome class matches the measured run exactly — village-lost day
72/73, max wave 4, regional, no table — narration did not diverge the
shape).
Judgment — meaning, coherence, consequences:
- The village dies of hunger on day 73 — the third hungry day — five days
  after qualifying for the LEAD realm (day 57) and four days before the rung
  gate would have opened (day 77). The death is honest and coherent: three
  lingerers gorge 1,000–1,750 kcal a night from the stores, the pantry
  empties, Yesenia stands up by the fire and names the hunger ("The bins are
  echoing and nobody's saying it"), the village debates half-rations vs a
  hard hunt vs a rally, and then people walk in different directions.
- **The stall is SILENT on the Binding.** Nothing in days 70–73 ever says
  the realm is waiting, that three fires are bound, that a court is coming
  on day 77, or that the village is five days from national. The one
  standings line ("Haven sits 1st of 4. Haven leads.") is about the contest
  standings, not the realm. Contrast: the wave-5 hold IS voiced on day 73
  with exact counts — "The fifth draft stays in the wings — armor the
  village (1 of 4 fighters armored); put weapons in hands (2 of 6 armed);
  blood your fighters (0 of 2 veterans)" — the veterans lock is named aloud
  while the Binding clock is never mentioned. A village hears what it lacks
  for the war and nothing about the realm it has already earned.
- Villagers react like people inside the dying: Yesenia fishes, teaches
  Yarrow, gets pulled onto Hot Take and comes home with fans; the wedding
  ring is held and the shaking eases; a trader's cart waits and moves on.
  The fiction is alive around a death the measurement calls "village-lost".
- One wrinkle, not a defect: the Herald's "muster 10 allied blades (you
  have 0)" refusal stamps ~15 times across days 71–73, and "You wait. The
  light changes. Nothing asks anything of you." repeats through the idle
  hours — the same lines, not progressing beats. Pre-existing narration
  texture, not this arm's finding to chase; recorded in sim-findings.md.
- Note: the sense header reads `tableWaiting=true, tableDone=false` — the
  lesser seat was priced and waiting when the village died, and the measured
  run agrees (76402 endSnap seat 'lesser'). The village starved with a seat
  on offer and no time to sit in it.

### Balanced panel (§15) — attempted, does NOT ingest this corpus

Attempted: `node scripts/balance-panel.js compare --before
evidence/2026-11-08/perseed-binddiag-b/summary.json --after
evidence/2026-11-08/perseed-binddiag-b/summary.json --out
/tmp/panel-binddiag-b-attempt`. Result: the command printed only
`review_required`, exit 0, and wrote NO output file or directory — no
compare was performed and no panel was ingested. (The 1955Z/2115Z/2215Z
runs hit a `TypeError` throw on per-seed rows; this run's output differs in
form but not in substance: still no ingest.) The sweep-compare tables above
are the before/after comparison for this run, on identical seeds, judged
against the pre-registered bar. (Panel-contract work belongs to the live
panel-contract-rulings lane — not touched.)

### Metric review

- The pre-registered bar worked as written; no mid-run re-scoring. G2 as
  specified here (ALL seeds identical, not just pre-national) is the right
  strength for a daily recorder: it fired 58–180 times per run and leaked
  nowhere — and the identical death-cause breakdown (726 = 726) corroborates
  it independently of the ts counters.
- "Median days" as a cost bar is uninformative for a pure-read arm (100 vs
  100 by construction); the informative neutrality proof is the per-seed
  identity (G2) plus the identical death breakdown. Future diag arms should
  judge on G2 identity, not on median days.
- One metric gap, FOUND and FIXED in-run (not re-scored): end-of-day
  sampling cannot observe a beat that stages and is answered inside one day.
  The fix — inferring same-day stage+answer from the `nationalLive`
  transition + the engine-stamped `nationalShape`, labeled
  `inferred: 'same-day'` in the corpus — is the only honest way to measure
  `beatStaged` on an answering substrate, and run 2's exact reproduction of
  run 1's trajectories proves the fix is measurement-only. Any future arm
  sampling pending beats must either sample pre/post daily (like this fix's
  inference) or accept that `beatStaged` undercounts by every same-day
  answer. The observed-pending path is preserved for beats that survive to
  a sample.
- "Median first-day" for national (77) is identical on all 4 seeds — report
  the uniformity, don't average it away: it is the finding (the ladder is
  clocked), not noise.
- "Days qualified-but-waiting" (leadQ day → national day, 6–20 days per
  seed) is the Binding wait in numbers; the sense read shows it is never
  voiced. Keep reporting both halves.

### Findings outside this arm (reported, NOT touched — appended to sim-findings.md)

- The Binding wait is never voiced (see sense read): a qualified village
  hears nothing about the coming court, while the wave-5 hold is named aloud
  with exact counts. A player-facing gap, not a measurement gap.
- The Herald refusal line ("muster 10 allied blades (you have 0)") stamps
  ~15 times in two days in the 76402 sense ring; idle filler ("You wait. The
  light changes.") repeats through idle hours. Pre-existing narration texture.
- The one-rung-per-season clock makes national day 77 structural on this
  substrate (first link day 25 → regional day 46 → national earliest 77).
  Any arm that wants national earlier must move the courtship start or the
  rung ages, not the polity bars.

### Convergence state

Axis scale-onramp: this arm DIAG-GOs as a measurement (8/8 armed configs
with full trajectories + stage first-days + shape attribution + national-loss
events, G1/G2/G3 all PASS, engine-gated validation 8/8, run-2 exact
reproduction of run 1), and the THING measured is now DECOMPOSED, not just
observed: the Binding leg's funnel is links 8/8 → subs 8/8 → seasoned 8/8 →
LEAD qualifies 5/8 → beats staged 4/8 (all First Court, all day 77) →
national held to end 2/8, with the binding stages the LEAD qualification
(trust, not age) and national persistence (trust dips un-season links). The
veterans lock is confirmed as a PARALLEL leg, not the Binding's shadow: the
two move independently on the same seeds. Full seat remains unreached (0/8),
wave 5 is 2/8, wins come only through the lesser seat. No default flips; no
src/js changes; the recorder is a new default-OFF policy instrument.
