# sim-genericremainder-b — trace the two failing generic rows, NEW-definition trace

Run: oversight-flesh-out-loop-b, arm sim-genericremainder-b, run
fleshout-loop-b-20261027T1130Z. DIAG/measurement ONLY: ZERO src/js
changes, no default flips, no game-code lever. This arm does NOT
re-judge the raidcallers GO or any earlier ledger verdict — their
verdicts stand in their own evidence. Its verdict is ONLY whether
the two failing generic rows below are traced to a named mechanism
with closing arithmetic, or are explicitly UNEXPLAINED with every
candidate excluded. Judged ONLY against
evidence/2026-10-27/sim-genericremainder-b-prereg.md (written BEFORE
any trace run in this arm).

Ordering note (honest): the analyzer row reproduction (re-printing
the already-published raidcallers values +3,700 / +416) ran before
the prereg file was written; every NEW-definition trace run
(trace-raidcallers-b.js) and all mechanism analysis ran only after
the prereg was written. No verdict, threshold, or GO criterion was
set or changed after any mechanism analysis began — the GO text in
the prereg is verbatim what this evidence is judged against.

## Verdict against the pre-registered GO: PARTIAL (not GO)

GO required BOTH rows traced with closing arithmetic, OR both
explicitly UNEXPLAINED with exclusions documented. One row meets
each half:

- Confirm seed 9970, generic +416 — TRACED. Named mechanism:
  death-day snapshot timing (see below). Mechanism kcal 416 ==
  boundary residual 416, records listed, proof GREEN.
- Pilot seed 9954, generic +3,700 — UNEXPLAINED, with every
  candidate in the prereg's steps 2–3 excluded by evidence and a
  settling next step stated. The row is NOT traced: no mechanism's
  kcal closes it, and the honest lower bound is 300 kcal
  unexplained under ANY snapshot-timing model (3,700 under the
  boundary model).

A single-row trace is a partial verdict, not GO — per the prereg,
verbatim. No verdict was shopped: the 9954 row stays UNEXPLAINED
even though several near-miss candidates were tempting (see
"Near misses, rejected with numbers").

## Rows (verbatim from sim-raidcallers-b.md, reproduced exactly)

- Pilot seed 9954, generic (Foraged food) family-seed row,
  caller-complete boundary residual +3,700 kcal (1.16% of inflow),
  FAIL. Survived to day 100, national rank, wave 4.
- Confirm seed 9970, generic (Foraged food) family-seed row,
  caller-complete boundary residual +416 kcal (2.72% of inflow),
  FAIL. Died day 16 (village-lost), village rank, wave 1 only;
  inflow small (15,285 kcal).

## NEW-definition trace method (as pre-registered)

Generic family = famOf-collapsed "Foraged food": fresh channel
"Foraged food" PLUS dried/smoked variants "Foraged food (dried)"
and "Foraged food (smoked)", in opening, closing, inflows, draws,
sweeps, and transform events alike. A fresh-to-dried transform
inside the family nets to zero except for its recorded loss; a
literal channel-name match would have mistaken every drying event
for a disappearance, so the trace reports the base (fresh) vs
dried split for each row.

OLD → NEW → BOUNDARY bridge, per row (independent recomputation
in scripts/test-genericremainder-b.js, NOT the analyzer's leg
function):

- OLD definition (3-door inflow, pantryDraw-only draws, raw
  closing snapshot): reported as a control; both rows' OLD
  residuals are large (the OLD definition excludes the stockdoor,
  drawSpoiled, direct, and _removePantryKcal doors) and are NOT
  the remainder under investigation.
- NEW definition (OLD + stockdoor inflow, drawSpoiled, direct, ALL
  _removePantryKcal draws, same sweeps and linked transform loss,
  raw closing snapshot).
- BOUNDARY (caller-complete) definition (NEW flows restricted to
  days ≤ 100, closing = raw closing + day-100 stockdoor pushes −
  day-100 meal draws − post-snapshot _removePantryKcal takes dated
  == the closing-snapshot day).

Bridge values (proof asserts each):

- 9970: OLD (not judged) → NEW +416 → BOUNDARY +416. No
  day-100 adjustments apply (the seed died day 16); the NEW and
  BOUNDARY residuals coincide because there are no post-horizon
  flows and no post-snapshot caller takes.
- 9954: NEW +5,719 → BOUNDARY +3,700, via stock100 +3,400 −
  meal100 −5,419 − cc100 0 = −2,019. The boundary adjustment
  removes 2,019 of the 5,719; the remaining 3,700 is the row.

## Row 1 (9970): TRACED — death-day snapshot timing

Mechanism, in plain words: the village died on day 16, and the
closing snapshot for that day was taken in the middle of the
death day — after the day's first foraging arrival, before the
rest of the day's flows settled. The ledger counts the FULL
death day's flows. The flows after the snapshot moment net to
−416, so the snapshot sits 416 above what the full-day flows
predict. The boundary definition has a day-100 adjustment (stock
pushes, meal draws, post-snapshot caller takes) but NO death-day
adjustment — so for a seed that dies early, the post-snapshot
death-day flows leak into the residual. This is the known
"closing snapshot vs day-100 draws" artifact class, in its
death-day form — NOT a new mechanism, and NOT re-attributed to
any other artifact.

Arithmetic (all figures from the committed confirm corpus,
seed 9970, family Foraged food):

- Opening stock: 0. Day-15 snapshot: 0 (channels empty).
  Cumulative family flows through day 15: 0. Day-16 flows net 0.
  Day-16 closing snapshot: 416 (a single stack, 1 stack).
- Day-16 flows in detail: inflows +416 (seq 32) and +643
  (seq 36); stockdoor pushes +200 +200 +200 (seq 65–67);
  meal draws −416 (player, 1u × 416), −143, −200, −500
  (villager-home), −400 (villager-away). Total draws −1,659.
  Net: 416 + 643 + 600 − 1,659 = 0.
- Pre-snapshot day-16 flows = snapshot total − opening −
  cumulative-through-15 = 416 − 0 − 0 = +416.
  Post-snapshot day-16 flows = day-16 net − pre-snapshot
  = 0 − 416 = −416.
- Residual = −(post-snapshot net) = +416 = the boundary
  residual, exactly (within 0 kcal, inside the ±1 bar).

Stack identity pins the split: the day-16 snapshot's single
416 stack (spoil horizon 3 = spoilDay 19 − day 16) IS the seq-32
inflow stack, and the player draw on day 16 takes exactly that
stack (1u × 416, spoilDay 19). The other day-16 arrivals
(643 + 600 = 1,243) are exactly consumed by the villager draws
(143 + 200 + 500 + 400 = 1,243) — so the snapshot moment is
consistent under either reading (after the first inflow only,
or after all day-16 flows except the player night meal); the
post-snapshot total is −416 under both, and the mechanism
total does not depend on which reading is right.

Corroboration — the mechanism predicts ALL FOUR death-day seeds
on the two bands (proof asserts each):

- 9951 (died day 26): snapshot 427 (single stack = first day-26
  inflow, seq 42, 427 kcal; player draw takes exactly that
  stack), cumulative through day 25 = 0, death-day net 0 →
  post-snapshot −427 → residual +427 (a PASS row at 0.88%,
  same mechanism, smaller size).
- 9953 (died day 90): snapshot 0, cumulative 0, death-day net 0
  (inflow 345, villager-away draw 345, NO player draw) →
  post-snapshot 0 → residual 0.
- 9962 (died day 33): snapshot 0, death-day net 0 (inflow 1,357,
  stockdoor 400, villager draws 1,757, NO player draw) →
  residual 0.
- 9970 (died day 16): as above → residual +416.

The pattern is clean: a death-day residual appears exactly
when the death day's post-snapshot flows net nonzero, and its
size is exactly that net. The two zero seeds have no player
night-meal draw on the death day; the two nonzero seeds do.
This is a boundary-definition gap (no death-day adjustment),
not a game bug: the village's food did not appear from
nowhere — the snapshot simply caught it mid-day.

## Row 2 (9954): UNEXPLAINED — with exclusions and a hard bound

Decomposition (proof asserts each figure):

- NEW residual +5,719 sits ENTIRELY in the fresh sub-ledger
  (fresh +5,719; dried exactly 0). Dried: closing dried 34,872,
  transform post 91,475 + dried inflow 0 − dried draws 56,603 −
  dried sweeps 0 = 34,872. Zero unlinked transform events.
- Fresh: closing 12,490; inflows 318,089 (inflow-door 35,889 +
  stockdoor 282,200); draws 186,648 (meal fresh 177,258 + direct
  fresh 7,848 + raid fresh 1,542); sweeps 28,536; transform pre
  96,134. Predicted fresh closing 6,771; actual 12,490;
  difference +5,719.
- All-family check (same NEW definition, every family on the
  seed): Blackberry 0, Fish catch +20, Garden harvest 0,
  Muscadine Grapes 0, Purslane +30, System-replicated stew 0,
  Winner's share −600 (exactly its day-101 pantryAdd inflow,
  post-horizon — the ledger's post-horizon behavior working as
  designed), Foraged food +5,719. The residual is
  family-specific, NOT a systematic snapshot/clock failure:
  day == vDay on every meal/stockdoor record, and every other
  family closes.

Known artifacts checked FIRST (prereg step 2), each excluded:

- (a) Closing snapshot vs day-100 draws: day-100 meal draws
  5,419 (other-context 3,200 + player 2,219), day-100 stockdoor
  pushes 3,400, day-100 inflow 100, post-snapshot caller takes
  dated == day 100: 0 (no raid records day 100). The boundary
  adjustment already accounts for stock100 − meal100 (−2,019);
  the remaining 3,700 is AFTER that adjustment, so it is not
  the day-100 meal/stock artifact.
- (b) Day-101 sweeps / post-horizon flows: post-horizon family
  net 0 (no family flows dated > 100; the single day-101
  inflow is Winner's share 600, a different family, and it
  correctly appears as that family's −600, not here).
- (c) Direct pantry consumption bypassing pantryDraw: direct
  family draws 24,201 (player-take 20,401 + green_whisper
  cultivate 3,800), all with item sums == totalKcal and zero
  retMismatch. No direct path is double-counted with a meal
  draw (the direct capture's wrapped methods are disjoint
  from the meal wrapper by construction, and no duplicate
  mealSeq group is a double-record — see below).
- (d) Alien raids / Light Fingers lifts: ZERO alien-raid direct
  records fired on this seed (apPlaygroundRaid wrapped, never
  fired with a decrease); Light Fingers lifts would appear as
  useAbility direct records — none for this family. Alien
  raids are unrecorded outflows in general, but with zero
  records here they cannot explain a positive residual
  anyway (an unrecorded outflow would require an even larger
  unrecorded inflow to net +5,719).

Other candidates checked (prereg step 3), each excluded:

- Stockdoor give-vs-kcal: give 282,249 vs kcal 282,200, gap
  +49 (not 5,719). Zero-kcal stockdoor records are documented
  no-stores (cap refusal / sub-unit remainder carry, return
  value authoritative) — 124 records, give sum 8,564, kcal 0
  by design, not hidden inflow.
- Transforms: all 89 linked events in-family (before Foraged
  food → after Foraged food (dried); 81 cook-racks + 8
  cook-racks-split, split portions exact: pre = converted
  units only, remainder stays fresh). Loss == pre − post on
  every event (0 mismatches). mergeHarvestShares blends only
  share fractions, never kcal. stockSurplus is
  conservation-exact (200-kcal units, merge-gated, return =
  actual pantry gain; remainder carry < 200 kcal by design).
- Sweeps: violations zero (no fresh stack removed, no spoiled
  stack kept); family spoiledKcal is 0 in every snapshot, so
  the sweep total (28,536) exactly proxies fresh→spoiled
  transitions (spoiled starts 0, ends 0).
- Meal draws: taken-vs-items gaps (21 records, +7,500) are
  EXACTLY the cooking bonus (sum of units ×
  (effectiveKcal − kcalEach) = 7,500) — taken is intake, not
  pantry decrease, so the items-based ledger is correct and
  the gap is not an undercount. No overcounted draws (zero
  records with taken < items sum). Duplicate mealSeq groups:
  5 two-stage draws (different items, legitimate top-ups)
  plus the mealSeq-null group (26 'other'-context draws —
  see next). No double-recorded draw.
- 'Other'-context draws (26 records, family 28,630): NOT
  feast-preview phantoms — every 'other' want is < 1500
  (max 1,496) while the feast cost floor is max(1500,
  400 × (n+1)) ≥ 1500, so no feastPlan copy-draw and no
  hostFeast draw fired on this seed (consistent with the
  nofeast gates). The 'other' draws are real: the day-99/100
  treeline gorge lines match them exactly (day 99: 1,471;
  day 100: 1,030 / 800 / 1,400 — "lingering Big-Eyes gorges
  at the treeline — 1,471 kcal gone from the stores", etc.),
  and the remaining 'other' draws fit commonsRaid (500–1500
  want) / raidPillage / tribute-deal shapes. The copy-draw
  trap in the instrument is real (game.js feastPlan draws on
  a pantry copy and the meal wrapper records every
  pantryDraw unconditionally) but it did NOT fire here — a
  warning for future arms, not this row's mechanism.
- Inflow honesty filters: zero excluded family inflows (no
  stock ≤ 0, no pantryAdd-unadded). No deposit/pantryAdd
  records for this family at all (all 121 inflow-door records
  are door 'stock').
- Item-sum integrity: direct totalKcal == items sum on every
  record; raid totalKcal == items sum on every record; raid
  retMismatch 0; direct retMismatch 0.
- Clocks: day == vDay on all 1,024 meal records with both
  fields and all 705 stockdoor records — no branch/scholar
  day divergence.
- Opening: 0 for this family (starting pantry has no Foraged
  food); closing snapshot channels contain no 'unnamed' or
  unexpected family channel.

Hard bound (why "unexplained" is not "timing"): the NEW
residual equals −(post-snapshot day-100 flows) plus any
unrecorded pre-snapshot net. Post-snapshot day-100 flows are
a subset of the recorded day-100 flows (inflow 100 +
stockdoor 3,400 − draws 5,419 = −1,919), so the most negative
post-snapshot net possible is −5,419 (all draws post,
nothing else post). 5,719 > 5,419, so at least
5,719 − 5,419 = 300 kcal is unaccounted under ANY
snapshot-timing model. Under the boundary model (stockdoor
and meals post-snapshot, inflow pre-snapshot), the
unaccounted amount is exactly the boundary residual, 3,700.
Either way the row does not close on timing alone: there is
a missing fresh inflow (or an overcounted fresh outflow) of
≥300 kcal somewhere before the day-100 snapshot, and no
recorded door contains it.

## Near misses, rejected with numbers (not hidden)

- "It's the feast preview copy-draw": rejected — no 'other'
  draw has want ≥ 1500 (feast cost floor); max want 1,496.
  The trap exists in the instrument but did not fire here.
- "It's the taken-vs-items gap (7,500)": rejected — wrong
  direction and wrong explanation: the gap is exactly the
  cooking bonus (intake vs pantry decrease), and an
  undercounted draw would make the true residual LARGER,
  not smaller.
- "It's the stockdoor remainder carry": rejected — carry is
  < 200 kcal by design (v._surplusRemainder), and the
  give−kcal gap is 49.
- "It's alien raids / Light Fingers": rejected — zero records
  on this seed (wrapped, never fired); and unrecorded
  outflows push the required unrecorded inflow UP, not down.
- "It's the day-100 snapshot moment": rejected as a complete
  explanation — it can explain at most 5,419 of the 5,719
  (all day-100 draws post-snapshot), leaving ≥300. It
  remains a partial contributor of unknown size (the
  boundary model attributes 2,019 to it).
- "It's the Winner's share day-101 inflow": rejected — that
  inflow is a different family (alien rations) and appears
  exactly as that family's −600, not here.

## Sense transcript (SENSE-TESTING LAW — reported, not judged)

- 9954, day 99–100: the treeline gorge lines name the
  mechanism behind the 'other' draws, with amounts that match
  the ledger exactly ("lingering Big-Eyes gorges at the
  treeline — 1,471 kcal gone from the stores", day 99;
  "lingering The Big Thing gorges — 1,030 kcal", "lingering
  The Influencer gorges — 800 kcal", "lingering Big-Eyes
  gorges — 1,400 kcal", day 100). The villagers' stores are
  being eaten by named lingering monsters at night, the game
  says so, and the numbers agree with the draw records.
  Nothing robotic; the repetition (gorge lines) is the
  mechanism's honest nightly shape, not a dialogue loop.
- 9954 smoke-rack lines (days 85–93): "Owen cooked for the
  haven — meals stretched. Owen worked the smoke racks too —
  2 batches preserved (~3589 kcal, keeps for weeks)." The
  preserved batches match the driedEvents transform records
  in kind (cook-racks, Owen). Coherent with the ledger's
  transform totals.
- 9970: the captured treeline lines run day 1–16 ("The Rut
  King stops at the treeline — pacing, unwilling", "Three
  shapes at the treeline — dog-shaped silences, circling"
  on day 16). No smoke-rack lines (0) — the village died
  before smoke-rack play began, which fits a 16-day village
  that never got its racks going. Nothing in the captured
  lines contradicts the ledger; the corpus's say recorders
  cover treeline/smoke lines only, so tribute/demand
  narration is not in this corpus (same recorder-scope fact
  as raidcallers).

## Proof (scripts/test-genericremainder-b.js)

GREEN, 31 checks, run from the worktree root:
`node scripts/test-genericremainder-b.js` — independent
recomputation (not the analyzer) reproduces the analyzer's
caller-complete generic rows (9954 +3,700 boundary / +5,719
NEW; 9970 +416 both), the OLD → NEW → BOUNDARY bridges, the
9970 death-day mechanism (pre16 +416, post16 −416, mechanism
== residual within 0 kcal), the 9951/9953/9962 corroboration,
and every exclusion above as an assertion (post-horizon 0,
cc100 0, unlinked 0, ret mismatches 0, stockdoor gap 49,
other-want max 1,496 < 1,500, taken-bonus gap 0, alien-raid
records 0, day-100 draws 5,419, lower bound 300).
No jest (the proof is node, not jest). No [needs-eyes]: this
lands a measurement, not a player-visible change. No game-code
change: zero src/js files touched; files in this arm: prereg,
evidence, and the proof script only.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered GO did its job in both directions: it
  forced the 9970 trace to close arithmetically (not by
  narrative — the stack identity + the forced post-snapshot
  arithmetic leave no room for a story), and it prevented
  the 9954 row from being claimed on any near miss (each
  candidate's kcal was checked, not its plausibility). The
  ±1 kcal closure bar was met exactly (0 kcal gap) on 9970
  and was not relaxed for 9954.
- Definition lesson, new in this arm: the boundary definition
  has a day-100 adjustment but NO death-day adjustment. For
  any seed that dies early, the closing snapshot is a
  mid-death-day snapshot and the residual is exactly the
  post-snapshot death-day net. Proposed for the NEXT run,
  not this one: the boundary definition should either
  exclude post-snapshot death-day flows (mirroring the
  day-100 adjustment, with the snapshot moment identified
  from stack identity or from a snapshot-order record) or
  report death-day rows separately from survived rows, so a
  death-day remainder is never mistaken for a missing door.
  This proposal changes no verdict here.
- Instrument lesson 1 (loud, for future arms): the meal
  wrapper records EVERY pantryDraw call, including
  feastPlan's copy-pantry preview draw (game.js feastPlan:
  "run the same best-fit draw on a COPY of the pantry —
  identical sorting, so what you see is what the fire
  gets"). On a band where feasts fire, every feastPlan call
  would inject a phantom draw into the ledger. The copy-draw
  did NOT fire on this corpus (nofeast gates; all 'other'
  wants < 1500), but any future arm on a feast-live band
  must filter copy-pantry draws (e.g., by checking whether
  the drawn-from pantry object is the village pantry) before
  judging a generic row.
- Instrument lesson 2: the 'other' context is not a residual
  bin — on this seed it is treeline gorges, commons raids,
  raid pillage, and tribute deals, all real, all narrated
  (gorge lines match draw amounts exactly). A future arm
  that treats 'other' as suspect by default will chase its
  own tail.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists
  — this arm changes no lever and no game code, so there is
  no before/after to panel. The det-gate equivalent is the
  independent recomputation matching the analyzer on both
  rows. Not forced, not faked.

## Reachability + wall numbers (reported, not re-judged)

Not re-judged here (raidcallers reported: pilot
national-or-better 6/8, confirm 9/12, table 0/20, wins 0/20).
The two traced seeds: 9954 reached wave 4, national rank,
survived 100 days; 9970 reached wave 1, village rank, died
day 16 (starvation + arena). No new reachability claim is
made by this arm.

## Village assessment (plain words)

Two villages, two endings. The 16-day village (9970) never
got going: its pantry held nothing but foraged food and fish
at the end, no smoke racks, no dried stores — a village
eating day to day, losing people to the arena, until
starvation took it on day 16. Its books are small enough to
audit by hand, and they audit clean once you notice the
snapshot was taken mid-day: the last foraging arrival (416
kcal) was still sitting in the pantry when the snapshot
was taken, and the night's meals took it after. Nothing
appeared from nowhere; the day just hadn't finished when
the books closed. The 100-day village (9954) is the
opposite: a big, working pantry economy (318,089 kcal of
foraged food moved through it, 96,134 kcal smoked onto the
racks, tributes and treeline gorges and all) whose books
balance everywhere except one corner — 5,719 kcal of fresh
foraged food that the records cannot place, at least 300 of
which no snapshot-timing story can cover. That corner is
now fenced with numbers instead of fog: every door checked,
every near miss priced, and the next instrument named
below. What knowledge/capabilities were missing: nothing
the ledger can see on 9970 (its story is complete); on 9954,
one fresh-channel inflow (or overcounted outflow) of
≥300 kcal, mechanism unknown. Blanks filled: (1) the
9970 row is closed, with a mechanism that also predicts the
other three death-day seeds; (2) the 9954 row is fenced
(fresh-only, ≥300 hard bound, 3,700 boundary value, full
exclusion list); (3) the feast-preview copy-draw trap is
documented for future feast-live bands. Documented, not
fixed: no game-code change was made (DIAG only).

## Next arm (fix, wider trace, or close)

- 9970 row: CLOSE. The mechanism is proved, it predicts
  all four death-day seeds, and the boundary-definition
  gap (no death-day adjustment) is recorded under "metric
  review" for the next run's prereg — no further trace
  needed on this row.
- 9954 row: WIDER TRACE (not a fix — no game change is
  justified on an unidentified mechanism). The settling
  step, in order: (1) a per-stack identity trace for the
  fresh channel on 9954 (record pantry stack identities
  across the day-100 snapshot boundary, so pre- vs
  post-snapshot day-100 flows are known, not bounded —
  this collapses the 300–5,719 range to a point); (2) if
  the point value is still nonzero, a fresh-channel inflow
  instrument that wraps every remaining pantry writer on a
  same-seed replay (candidates: any pantry push outside
  stockPantry/depositPantryPieces/pantryAdd/stockSurplus —
  the 9954 corpus shows none for this family, so the replay
  must prove the writer exists before it is named);
  (3) only then a named mechanism with closing arithmetic.
  Do NOT re-attribute the row to feast previews, alien
  raids, stockdoor carry, or cooking bonus — all four are
  excluded above with numbers, and re-opening them without
  new evidence would be re-scoring, not tracing.

## Convergence line

partial — the generic-remainder blank is half-closed: the
confirm row (9970) is traced to a named mechanism with
closing arithmetic and a four-seed prediction record; the
pilot row (9954) is fenced as UNEXPLAINED with a hard
≥300 kcal lower bound, a 3,700 kcal boundary value, and a
complete exclusion list. The next arm is a wider trace on
9954 only (per-stack identity across the day-100 boundary),
not a re-trace of 9970.

## Verdict (judged against the pre-registered bar, not re-scored): PARTIAL

9970 traced (death-day snapshot timing, 416 == 416);
9954 unexplained (fresh +5,719 NEW / +3,700 boundary,
≥300 under any timing model, all candidates excluded).
One row traced, one row fenced — the arm delivers a partial
verdict and a named next arm, not a GO.
