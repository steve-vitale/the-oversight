# sim-bindingtrace-b — trace the BELONG → Binding chain, name the first failing link

Run: fleshout-loop-b-20261110T1030Z. Worktree: `~/workspace/worktrees/sim-bindingtrace-b`
(branch sim-bindingtrace-b). Axis: scale-onramp / winnability chain (converging, NOT
converged). Tracker blank (7) from the 2026-11-10 closeout review: "Binding-never-fires
follow-up". Prereg: evidence/2026-11-10/sim-bindingtrace-b-prereg.md.

## Canon + code read first

- docs/CANON.md, docs/SCALE.md. No canon invented.
- Prior decomposition, NOT re-measured: evidence/2026-11-08/sim-binddiag-b.md
  (band 76401–76408: links 8/8 → subs 8/8 → seasoned 8/8 → LEAD qualifies 5/8 →
  beats staged 4/8, ALL First Court, all day 77 → national held to end 2/8; The
  Binding never fired because the substrate forms ZERO Haven-subordinate links).

## NAMING (code authority — settled by sim-binddiag-b, carried here)

"The Binding" is the **BELONG** road's beat (swear/serve/walk), NOT the LEAD
road's. Citations: `src/js/hierarchy.js:2489` (`belong: 'The Binding'`),
`hierarchy.js:2541` (stageNationalBeat comment), docs/SCALE.md. The LEAD road's
beat is **"The First Court"** (feast/host/cold). This arm traces the BELONG chain
specifically: foreign realm → Haven-subordinate link → good standing → BELONG
qualifies → The Binding stages → resolves.

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate (both arms): tableseat-nowait — leanlinkrescue courtship
  (`LEANLINKRESCUE=1`) + seat legs only (`TABLESEATNOWAIT=1`), no wait leg.
- Baseline: tableseat-nowait, `BINDIAG` + `BINDINGTRACE` unset. Own baseline
  replication (8), NOT another arm's corpus.
- Armed: tableseat-nowait wrapped with `scripts/policies/binddiag-b.js`
  (`BINDIAG=1`) and `scripts/policies/bindingtrace-b.js` (`BINDINGTRACE=1`).
- Seeds (pilot): 81201–81208. Freshness verified at run start (prereg): 0
  seed-uses in every dated prereg, every dated sim .md, seed filenames, and
  `scripts/`; plain-substring hits are float kcal values / pantry amounts in
  old corpora, sampled and classified.
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over). 180d, not
  150d: the substrate's prior evidence justifies it — national day 77, a second
  First Court at day 134, national-loss events at days 88–147 (sim-binddiag-b).
- Primary (DIAG-GO, ALL must hold): (1) 8/8 armed configs produce a full daily
  belong-chain trace with first-days for every chain stage + end snapshot;
  (2) the chain is CLASSIFIED on >= 7/8 seeds with the first failing link named;
  (3) a ranked belong-funnel list; (4) G1 det-gate PASS; (5) G2 recorder
  neutrality PASS; (6) G3 corpus integrity PASS.
- Before-validity bar (per the 2026-11-09 flee-loop finding): national-ever >=
  4/8 on the armed arm, or the arm reports NO-GO on before-validity.
- Proof gates: G1 (both recorders unset, wrapped == unwrapped on one seed);
  G2 (ALL 8 seeds identical on days/gameDays/ts counters/starvation);
  G3 (16/16 rows; armed rows carry full trajectories + first-days + end snapshot
  + classification; engine-gated validation matches on every armed row).

## RESULTS — DIAG-GO (pilot 8+8, seeds 81201–81208, horizon 180d, death-aware)

Sweep: `node scripts/test-bindingtrace-b-sweep.js` (exit 0).
Corpus: `evidence/2026-11-10/perseed-bindingtrace-b/` (16/16 rows + summary.json).
G1 det-gate: PASS (seed 81201, BINDIAG+BINDINGTRACE unset: baseline 90/90 days ==
wrapped 90/90 days, ts counters identical — `tsNationalDay 77, tsSeatDay 90
lesser` — no `_binddiag` / `_bindingtrace` surface).
G2 recorder neutrality: PASS (8/8 seeds identical on days/gameDays/ts
counters/starvation — and the death totals match too, 619 = 619).
G3 corpus integrity: PASS (16/16 rows, all days > 0, every armed row carries a
full daily trajectory (binddiag + btrace) + stage first-days + classification +
end snapshot, every baseline row carries a post-run pure-read end snapshot).
Engine-gated validation: PASS (8/8 armed rows: the recorder's computed gated
total equals the engine's `villageStandingTotal()` at run end).
Before-validity: PASS (national-ever 6/8 — the substrate still reaches national
on current master, better than the prior band's 4/8).

### Sweep-compare table (the panel substitute — see panel note below)

| metric | baseline (tableseat-nowait) | armed (+ binddiag-b + bindingtrace-b) |
|---|---|---|
| n | 8 | 8 |
| won | 4 | 4 |
| median days / median gameDays | 90 / 90 | 90 / 90 |
| max days | 108 | 108 |
| national ever / final | 6 / 5 | 6 / 5 |
| global ever | 5 | 5 |
| table invited ever (tableWaiting) | 8 | 8 |
| table entered (tableDone) | 4 | 4 |
| entered FULL | 0 | 0 |
| wave 4 / wave 5 reach | 8 / 1 | 8 / 1 |
| max arc | 4 | 4 |
| starvation deaths total | 0 | 0 |
| seat attempts / taken / failed | 4 / 4 / 0 | 4 / 4 / 0 |
| preview seen / not-ready | 6 / 2 | 6 / 2 |
| table answers | 20 | 20 |
| death total | 619 | 619 (identical breakdown) |

Baseline and armed agree on EVERY aggregate — the recorders are provably
neutral. Death causes (identical both arms): villager combat 258 + villager-vs-
villager combat 104 + expedition 160 + player-the-wild 67 = 589/619 (95%)
combat/expedition/wild; monster 13, arena 3, ambush 3, contest 1, wound 1,
sickness 1, the night 1, the rest single alien-show deaths (Ad Break, Spool,
Focus Group, Moderator, Gavel); starvation 0.

### Per-seed detail (armed arm; baseline identical on every trajectory metric)

| seed | days | end | won | wave | rank max | national day | beats | foreign realm (day/max) | counters | links | first failing link |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 81201 | 90 | over-other | 1 (lesser d90) | 4 | global | 77 | 1 lead d77 | d50 / 5 | 0 | 4 primary | B0 foreign-realm-no-belong-link |
| 81202 | 89 | over-other | 1 (lesser) | 4 | global | 77 | 1 lead d77 | — / 3 | 0 | 3 primary | none no-foreign-realm |
| 81203 | 69 | village-lost | 0 | 4 | regional | — | — | d50 / 4 | 0 | 3 primary | B0 foreign-realm-no-belong-link |
| 81204 | 108 | village-lost | 0 | 5 | global | 77 | 1 lead d77 | d50 / 5 | 0 | 4 primary | B0 foreign-realm-no-belong-link |
| 81205 | 80 | village-lost | 0 | 4 | national | 78 | 1 lead d78 | d71 / 5 | 0 | 4 primary | B0 foreign-realm-no-belong-link |
| 81206 | 92 | over-other | 1 (lesser) | 4 | global | 75 | 1 lead d75 | d71 / 5 | 0 | 3 primary | B0 foreign-realm-no-belong-link |
| 81207 | 97 | over-other | 1 (lesser) | 4 | global | 77+96 | 2 lead d77+d96 | d50 / 5 | 0 | 4 primary | B0 foreign-realm-no-belong-link |
| 81208 | 54 | village-lost | 0 | 4 | regional | — | — | — / 3 | 0 | 3 primary | none no-foreign-realm |

### The belong-chain funnel (the ranked binding-stage list)

| stage | seeds reaching | median first-day | seeds blocked |
|---|---|---|---|
| foreign realm (size ≥ 4) | 6/8 | 50 | 81202, 81208 (max size 3) |
| belong link formed | 0/8 | — | all 8 |
| belong link good-standing | 0/8 | — | all 8 |
| BELONG qualifies | 0/8 | — | all 8 |
| The Binding staged | 0/8 | — | all 8 |
| The Binding answered | 0/8 | — | all 8 |
| national (any road) | 6/8 | 77 | 81203, 81208 |

RANKED (binding = the stage where the most seeds drop out): **the chain fails
at exactly ONE place — B1, Haven becoming a subordinate.** The foreign realm
exists on 6/8 seeds (median day 50 — weeks BEFORE the national beat at day 77),
and national itself arrives on 6/8 seeds, all through LEAD. But zero belong
links form on any seed, so B2–B5 are unreachable by construction. The two
no-realm seeds (81202, 81208) fail one stage earlier (B0), and both die before
or without national anyway.

### First-failing-link counts

- `foreign-realm-no-belong-link`: 6/8 — a foreign 4+-realm exists, Haven never
  becomes its subordinate.
- `no-foreign-realm`: 2/8 — no foreign polity ever reaches size 4 (max 3).

### Shape attribution

- Beats staged: 7, all **lead** (the First Court). Beats answered: 7, all lead.
  Beats died / refused / deferred: 0. `scaleRefused`: 0/8. National lost: 2
  events (81204 day 81, 81207 day 89); 81207 re-staged a second First Court at
  day 96 — the climb restarts, it is not a one-shot (same as binddiag-b).
- BELONG (The Binding): 0 staged, 0 delivered. Covenant: 0. Trade: 0.
  Conquest: 0. LEAD-mask days: 0 — belong never qualified, so there was nothing
  for LEAD to mask; the shape-priority question does not arise on this band.

## WHERE IT FAILS — the mechanism, not just the count

### 1. The counter band never fires (the whole finding)

The ONLY way Haven becomes a subordinate on this substrate is the counter:
leanlinkrescue proposes only `asSubordinate: false`, and a proposal scoring
35–54 stages a counter whose terms are "they'll TAKE Haven"
(`_stageCounter`, hierarchy.js:686). The corpus proves the counter never
stages, three independent ways:

- **Counters staged: 0 on all 8 seeds** (`btrace.counters` empty everywhere).
- **`courtCounters` never incremented on any seed** — leanlinkrescue counts
  every counter it answers, including one staged and answered inside a single
  daily (a counter staged during `competent.daily`'s conversations is answered
  by the same day's courtship pass). Zero answers means zero counters existed,
  not just zero observed at end-of-day samples.
- **Every link that formed is Haven-primary (28/28), 0 via counter**
  (`linkForms`: 28 primary, 0 subordinate, 0 viaCounter).

A one-off probe (NOT part of the corpus — `/tmp/judgelink-probe.js`, same
substrate, seed 81201, 60 days) shows WHY the band is jumped: the three
leanlink proposals score **55, 71, 61 — all direct accepts (≥55)**. The reasons
are the same every time: "Haven is the stronger — they know it" plus the
speaker line. Base 38 + the strength bonus (+up to 15) + the speaker bonus puts
a day-25 proposal at or over the accept line from the first knock. The counter
band (35–54) needs a proposal that is neither strong enough to accept outright
nor weak enough to decline — and on this substrate, by the time a village is
proposed to, it is already past 55. The negotiation that could make Haven a
subordinate is never entered, so the BELONG road's only door stays shut.

### 2. The second link-forming path also cannot make Haven a subordinate

Links form on this band through exactly two paths, and BOTH are Haven-primary
only — proven by a second probe (`/tmp/formlink-probe3.js`, seed 81203, stack
traces on every `_formLink` call):

- **leanlink courtship proposals** (21 on the band): `proposeLink` with
  `asSubordinate: false` → direct accept at score ≥55 (see §1).
- **The ladder National-stage reward** (`_ladderRewardLink`,
  metaProgression.js:637): when the village's five-track ladder reaches stage 3
  ("National standing"), the System grants a link with the best-known unlinked
  village — via `_formLink` DIRECTLY, `asSubordinate: false`, bypassing
  `proposeLink`/`judgeLink` entirely, so no counter is even possible there.
  This is the provenance of 81203's day-16 link (stack:
  `_ladderRewardLink` ← `ladderGrantStageReward` ← `ladderStageBeat`) and, by
  the same deduction (only 3 `proposeLink` calls in 60 days on seed 81201, yet
  4 links by day 46), of 81201's fourth link at day 46.

Note the ladder's stage 3 is POINTS-based (five-track ladder points), not the
scale ladder: a village can be "National" by ladder points on day 16 while
scale-national cannot stage before day 77. The free link is the biggest grant
short of the seat — and it always lands Haven-primary. See the findings note.

### 3. The foreign realm is NOT the binding link

The realm exists in time: on the four day-50 seeds the foreign 4+-realm is in
place **27 days before** the First Court sits (day 77). Had a belong link
existed, the Binding could have staged on those seeds — the rung clock
(regional ≥ 30 days) opens day 76–77 either way. The two no-realm seeds cap at
size 3 (a pair + one): drift seeds pairs (~12%/wk) and growth past a pair needs
engagement (stir), and on those seeds the region never banked enough. So B0
binds only 2/8 seeds; B1 binds 8/8.

### 4. The national clock is structural again

National day is 77 on four of the six national seeds (75 and 78 on the other
two — the 75 is a networkLiveDay one day earlier, the 78 a one-day-later
regional start). Same clock as binddiag-b: first link day 25 → regional day 46
→ national earliest 77. The variance lives in qualification and survival,
never in the date.

### Reachability verdict: full seat NOT REACHED — 0/8, and the BELONG road is never walked

No run took a full seat (enteredFull 0/8 both arms). The lesser seat converts
4/4 invitations into wins. The wave leg binds as before (wave 5 on 1/8 seeds);
the scale leg now has a precise name for its failure: **the BELONG road fails
at B1 because the counter — the only mechanism that makes Haven a subordinate
— never fires on this substrate, and the ladder's free link also lands
Haven-primary.** The Binding is not blocked by trust, by the rung clock, by
exile, or by LEAD-masking. It is blocked upstream of all of those, at the
negotiation that never happens.

## Village assessment (plain words)

These villages all do the same thing from day 25: they walk up to their
neighbors and ask them to kneel, and the neighbors say yes — straight away, no
haggling, because Haven is already the stronger fire and everyone knows it.
Nobody ever answers "we won't bow — but we'll take YOU." That sentence is the
only way Haven ever becomes somebody else's subordinate, and it is never
spoken, on any seed, in any village. Meanwhile, out past the treeline, other
fires ARE binding together — by day 50 most villages live next to a realm of
four or five fires that could have taken Haven in. The realm is there. The
oath is never offered, because Haven never kneels, because nobody ever asked
it to. When the court finally sits on day 77, it is always Haven's own court,
with Haven's own speakers riding in — and the village feeds them from a shared
granary and becomes national the way it always does: by leading, never by
belonging. The full seat stays out of reach on the other leg — the wave-5
fight — but the belonging road was never even tried.

## Sense-testing read (NON-MEASURED replays, seed 81201, armed, narration on)

Three replays (narration shifts trajectories by a day; outcome class matches
the measured run — regional at day 52, national/global by day 80, lesser seat
waiting):

- `evidence/2026-11-10/sim-bindingtrace-b-sense-staging.txt` (78 days — the
  staging window):
  - [d76] ◈ SYSTEM: "Four fires. One head. GOVERNANCE LAYER: online — polity
    tribute routing, the court calendar, famine reserves. You built a realm.
    Try not to lose it the way you found it."
  - [d76] 👑 Speakers from Emberhold, Stonebridge, Thornfield, Ashford ride in
    for the first court — and every one of them is measuring you. FEAST them
    from a shared granary (5,000 kcal, no strings), HOST the court at Haven's
    fire (your speaker's time), or write the law in COLD ink (they'll pay
    more and love you less). Or REFUSE the scale itself — stay a free fire at
    regional, whatever that costs. The System will not offer twice.
  - [d77] 🍲 The shared granary opens: 5,000 kcal for every fire of the realm,
    no strings. Emberhold, Stonebridge, Thornfield, Ashford count it — and
    remember who fed them first. (Trust +10 with each.)
- `evidence/2026-11-10/sim-bindingtrace-b-sense-court.txt` (80 days):
  - [d79] Omar, at the fire, not quite believing it: "Four fires. One head.
    And the head is US. ...Did that just happen? I was pouring cups."
  - [d78] 📡 Haven feasts for the cameras — 5,126 kcal of theater, every fire
    of the realm at the table. (The Watchers beat, answered feast.)
- `evidence/2026-11-10/sim-bindingtrace-b-sense-realm.txt` (52 days — the
  foreign-realm window):
  - [d51] 🌙 Raid — Emberhold came in the night from the southeast. They
    trampled 2 garden plots into mud. Nobody's dead, but the message is
    clear: the ground is theirs too, and they're done asking. (Trust −10.)
  - [d51] Word from Ashford: Yuki holds the fire now. It resolved without you.

Judgment — meaning, coherence, consequences:
- **The court is played, and played well.** The First Court arrives as a
  moment: the System's announcement, the speakers riding in by name, a real
  choice with real costs, the feast answered the next morning with trust
  counted aloud per fire — and then Omar, two days later, still not quite
  believing it. The fiction earns the transition.
- **The BELONG road is silent.** In none of the three retained windows does
  any line announce a foreign binding ("Word comes late, through traders…"
  never appears), and nothing ever says Haven could belong to a foreign realm,
  that a counter offered Haven a subordinate's seat, or that a court is coming
  for the BELONG road. The measurement says the foreign realm reached size 4
  on day 50 — the narration window opens at day 50, so the formation lines (if
  any fired on days 48–49) sit just outside the retained ring, and this read
  cannot claim they never fire. What it CAN claim is the asymmetry: the LEAD
  road gets a SYSTEM announcement, named speakers, and a villager still
  marveling two days later, while the BELONG road gets nothing the village can
  act on — no invitation, no counter, no summons. A player could play all 90
  days and never learn the road exists.
- **One wrinkle, not a defect:** Emberhold — Haven's own subordinate since
  day 25 — raids Haven's gardens on day 51 (trust −10). A subordinate fire
  raiding its primary reads as friction the game never explains: no tribute
  grievance, no demand, no "we're done asking" context beyond the line itself.
  Pre-existing raid texture, not this arm's finding to chase; recorded below.
- Villagers react like people around the court: Diana teaches White Mulberry
  by the fire, Vasyl finds Apex Sense, Yuki heads out for water with Paula
  ("Nobody walks alone today"), the fire retells stories until nobody
  remembers which half is true. The fiction is alive around a measurement the
  census calls "over-other, won 1".

### Balanced panel (§15) — attempted, does NOT ingest this corpus

Attempted: `node scripts/balance-panel.js compare --before
evidence/2026-11-10/perseed-bindingtrace-b/summary.json --after
evidence/2026-11-10/perseed-bindingtrace-b/summary.json`. Result: the command
printed only `review_required`, exit 0, and wrote NO output file or directory —
no compare was performed and no panel was ingested. (Same form as the
2026-11-08 attempt; the 1955Z/2115Z/2215Z runs hit a `TypeError` throw on
per-seed rows; this run's output differs in form but not in substance: still
no ingest.) The sweep-compare tables above are the before/after comparison for
this run, on identical seeds, judged against the pre-registered bar.
(Panel-contract work belongs to the live panel-contract-rulings lane — not
touched.)

### Telemetry deviation check (§10) — LOUD lines investigated, no roll

`node scripts/telemetry-check.js --baseline
.../hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-10/perseed-bindingtrace-b/s*.json' --metrics
national,table,wins,exiled` printed:
- `LOUD: national disappeared: baseline 12 -> current 0 (n=17 files)`
- `LOUD: wins disappeared: baseline 16 -> current 0 (n=17 files)`

Investigated same-run: these are a FIELD-NAME mismatch, not a disappearance.
The check reads per-row `national` / `wins` fields that this corpus does not
carry — the rows carry `nationalEver` (12/16 rows) and `won` (8/16 rows). Same
known failure mode as the balance panel on per-seed rows, and the same class
the tracker records for the 1630Z run (LOUD lines as REGIME artifacts of the
pre-seat measurement corpus vs a WINSEAT baseline). Baseline NOT rolled; no new
investigation. The corpus itself shows national 6/8 ever per arm and wins 4/8
per arm.

### Metric review

- The pre-registered bar worked as written; no mid-run re-scoring. The
  before-validity bar (national-ever ≥ 4/8) proved its worth as a gate: it held
  (6/8), so the zero belong links are a finding about the mechanism, not about
  a dead substrate.
- "Chain classified on ≥7/8" was met at 8/8 — but note the classification
  degrades gracefully by design: every seed classifies, even the two that never
  form a foreign realm. The informative part is not the count but the
  CONCENTRATION: 6/8 seeds share one first failing link (B1). A future arm
  should report the modal failing link, not just the classified count.
- The counter instrumentation has one known blind spot, closed by
  corroboration, not by sampling: a counter staged AND answered inside one
  daily never survives to an end-of-day sample. The `courtCounters` ctx count
  (incremented by the substrate itself whenever it answers a counter) closes
  it — 0 answers on all 8 seeds proves 0 counters existed. Any future arm
  sampling pending offers must carry the same corroborating count or accept
  that same-day resolutions undercount.
- "Median first-day" for national (77) is near-identical on 5 of 6 seeds —
  report the uniformity, don't average it away: it is the finding (the ladder
  is clocked), not noise. Same for the foreign-realm day (50 on 4 of 6).
- The probe scripts (`/tmp/judgelink-probe.js`, `/tmp/formlink-probe3.js`)
  are one-off diagnostics, NOT part of the corpus: they ran outside the
  pre-registered sweep, on single seeds, and are cited here only as mechanism
  corroboration for the counted result (0 counters / 0 subordinate links on
  8/8 seeds). The verdict does not depend on them.

### Findings outside this arm (reported, NOT touched — appended to sim-findings.md)

- The ladder's National-stage link reward bypasses courtship entirely
  (`_ladderRewardLink` → `_formLink` directly, no `proposeLink`, no
  `judgeLink`, no counter possible) and lands Haven-primary by construction —
  while the ladder's "National" (five-track points) can arrive on day 16 and
  scale-national cannot stage before day 77. Two "Nationals" that disagree
  about what National means, and a free link that short-circuits the
  courtship the scale ladder paces. A design question for the scale-onramp
  axis (Steve/coordinator call whether the reward should court, cost, or
  wait for scale-national).
- A subordinate village (Emberhold, linked day 25) raids Haven's gardens on
  day 51 in the sense replay (trust −10, no grievance named). Pre-existing
  raid texture; the mechanism (raid events vs tribute friction) is a
  different system.

### Convergence state

Axis scale-onramp: this arm DIAG-GOs as a measurement (8/8 armed configs with
full belong-chain traces + classifications, G1/G2/G3 all PASS, before-validity
6/8, engine-gated validation 8/8), and the THING measured is now DECOMPOSED
to a single named link: **the BELONG chain fails at B1 — the counter never
fires** (0 counters staged, 0 answered, 0 subordinate links on 8/8 seeds;
proposals score 55/71/61 direct-accept on the probed seed; the ladder's free
link also lands Haven-primary). The foreign realm is NOT the binding link
(6/8 form, median day 50, weeks before the court). LEAD-masking never arises
(belong never qualifies). Full seat remains unreached (0/8), wave 5 is 1/8,
wins come only through the lesser seat. No default flips; no src/js changes;
the recorder is a new default-OFF policy instrument composing binddiag-b.
Tracker blank (7), "Binding-never-fires follow-up", is now answered with the
failing link named; scale-onramp stays converging (NOT converged) — the chain
still binds at wave-4 kills / wave-5 kills / the climb past regional, and the
Binding leg now has a named fix target (the counter band) rather than a named
mystery.
