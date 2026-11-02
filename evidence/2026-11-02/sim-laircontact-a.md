# sim-laircontact-a — fed-scholar lair-contact cadence audit (Loop A 20261102)

Arm: lair-contact cadence diagnosis, axis scale-onramp, blank (3)
from sim-musterupkeep-a. Coordinator claim
fleshout-loop-a-20261102T1515Z (this arm; sibling Loop B live — NOT
touched; sibling trees NOT touched; no goal hidden_files claim/lock
files touched). Prereg:
evidence/2026-11-02/sim-laircontact-a-prereg.md, written AND
committed (6843925da) BEFORE any judged sim in this arm.
DIAGNOSIS ONLY. Zero src/js changes. Policy/instrument only. Ready
for coordinator merge, pending ship (NOT pushed, NOT bumped, NOT
live-verified — ship loop owns deploys).

## Verdict: DIAG-GO — contact is a wild-contact bump, not a feeding effect

Fed scholars DO reach the herald. On current master, the fed-march
policy produces herald contact on 7 of 8 band seeds, the trivial-touch
control on 7 of 8, the pure-noise control on 8 of 8, against a
baseline of 8 of 8 — against the pre-registered systematic bar
(fed 0 on >= 7/8 band seeds while baseline > 0 on >= 6/8). The bar
fails by a wide margin, in the direction that kills the
feeding-prevents-contact story: the prior arm's "0-contact" was a
two-seed snapshot on old code, and on current code the SAME fed
policy on the SAME seed (97330) produces the exact 12-refusal
pattern the old baseline produced, while the current-master baseline
produces none. The inversion is the finding.

The mechanism, named from attempt-time positions (845/845 rows):
a herald startCombat attempt fires if and only if scholar and
herald share a tile AND a detail cell (mx,my) at monster-turn
time, via the engine's wild-contact bump path (843 rows) — or, in
2 rows, via the harness contest drive on tile-sharing alone. The
scholar's march never initiates contact: no attempt row in the
whole corpus has a policy caller, and camping the lair tile is
neither necessary nor sufficient. What the scholar controls is
being on the lair tile; what the herald controls is wandering
onto the scholar's exact detail cell. Contact cadence is therefore
roaming luck priced by trajectory: every arm perturbs the
trajectory (feeding, one-unit touches, even 8 bare RNG draws all
move co-location days around), and whichever trajectory happens to
put the herald on the scholar's detail cell gets contact. Feeding
does not prevent it, touching the pantry does not prevent it, and
shifting the RNG stream does not prevent it — each is
contact-positive on most band seeds.

## Correction to the prior arm's wording (carried from the prereg)

The musterupkeep evidence says fed scholars "never end a day on
the lair tile". Its own records contradict the sentence: fed
marches ARRIVED at the lair on 26/18 days (old code). This arm
judges the corrected question — why fed lair arrivals never
converted into attempts on old code — and answers it on current
code, where the premise itself no longer holds (fed 97330: 12
attempts). The musterupkeep NO-GO (the pack cannot fund the need)
is untouched; only the contact-cadence mechanism question is
reframed and closed.

## Baseline re-basing (deviation from the prereg, recorded not hidden)

The prereg required the new driver's closecommit runs to reproduce
the musterupkeep closecommit records (97330: call d97, 12 attempts
d110, village-lost d122; 97338: call d113, 6 attempts d118, lost
d122) before judging anything. That check FAILED — because master
moved, not because the instrument is wrong:

- src/js landings between the old anchor (6674df432) and this
  worktree's base include monster commitment (beasts hold ground
  unless their kind carries a flee component), the loot taper, and
  journey r72 (away-commit guard + door position refresh).
- Proof the shift is code, not driver: the OLD musterupkeep driver
  run on current master gives EXACTLY the new driver's result on
  97330 (call d117, gate 3, 0 attempts, village-lost d132) —
  record perseed-musterupkeep-a/mu-closecommit-s97330-rX.json.
- Current-master closecommit baselines: 97330 call d117 gate 3, 0
  attempts, lost d132; 97338 call d82 gate 3, 0 attempts,
  over-other d90. The prereg's decision tree is applied unchanged,
  with "baseline" re-based to these current-master runs (all arms
  compared on identical seeds AND identical code), and the band
  triggered by the split-by-seed Phase-1 result plus the missing
  baseline contrast on the known seeds. No threshold was re-scored
  mid-run; the re-basing is a code-version fact, not a metric change.

## Phase 1 — known seeds on current master (180d, death-aware)

| seed / arm | call (gate) | attempts (days) | day-end co-located | end |
|---|---|---|---|---|
| 97330 closecommit | d117 (3) | 0 | — | village-lost d132 |
| 97330 musterfed | d117 (3) | 12 (d123) | d122 | village-lost d135 |
| 97330 lairsham | d117 (3) | 16 (d119–121) | d119, d120 | village-lost d134 |
| 97330 lairnoise | d117 (3) | 0 | — | village-lost d143 |
| 97338 closecommit | d82 (3) | 0 | — | over-other d90 |
| 97338 musterfed | d82 (3) | 0 | d86 | over-other d92 |
| 97338 lairsham | d82 (3) | 0 | — | over-other d90 |
| 97338 lairnoise | d82 (3) | 12 (d84) | d83, d84 | over-other d90 |

Prereg decision-tree reading: fed 12/0, sham 16/0, noise 0/12 —
every pattern splits by seed. NO mechanism claim from Phase 1.
Band triggered (prereg rule), exactly as the task anticipated
("plus a pilot band if the two seeds cannot settle it").

Determinism (prereg gate): closecommit 97330 r1 == r2 exactly
(minus run label), and all 8 band baselines r1 == their screen
runs exactly (minus run label, screen ran in 4-way parallel
batches). The instrument is trusted; the trajectories are not
stable across code versions, but they are exactly reproducible
within one.

## Screening — 40 seeds, closecommit only (180d)

Seeds 97400–97439 screened (prereg cap 40). 18 called; 10 were
baseline-attempt-positive call seeds. Band = 8 of them
(97405, 97420, 97432, 97433, 97435, 97412, 97418, 97426); spares
97437, 97439 (1 attempt each, not run in treatment arms).
Screening records: perseed-laircontact-a/lc-closecommit-s974*-screen.json.

Screening side observations (not verdicts): wild contact happens
without any muster (97409: 46 attempts, no call, survived 181d;
97406/97411/97438 similar) — contact is a general wild-contact
phenomenon, not muster-specific. Day-end co-location is a weak
proxy in both directions: 97426 has attempts with NO day-end
co-located day, while 97400 (call d68, co-located d68) and 97423
(co-located d77) have co-location with zero attempts.

## Band matrix — 8 seeds x 4 arms, 180d, identical seeds

Attempt counts (attempt-days in brackets; all REFUSED
MUSTER-GATE unless noted FOUGHT):

| seed | call (gate) | closecommit | musterfed | lairsham | lairnoise |
|---|---|---|---|---|---|
| 97405 | d147 (5) | 26 [148,149] | 41 [148,149,152,153] | 26 [148,149] | 123 [148–161, 12 days] |
| 97420 | d60 (5) | 123 [11 days] | 42 [7 days] | 49 [6 days] | 11 [61] |
| 97432 | d89 (8) | 17 [90,91,94] | 59 [6 days] | 6 [96,100] | 58 [8 days] |
| 97433 | d64 (5) | 28 [65,66] | 44 [65,66,67] | 28 [65,66] | 26 [65,84,85] |
| 97435 | d61 (7) | 51 [67–70] | 0 | 0 | 21 [69,70,71] |
| 97412 | d77 (10) | 1 FOUGHT [78] | 1 FOUGHT [78] | 1 FOUGHT [78] | 1 FOUGHT [78] |
| 97418 | d59 (15) | 1 FOUGHT [60] | 1 FOUGHT [60] | 1 FOUGHT [60] | 1 FOUGHT [60] |
| 97426 | d66 (10) | 5 [66 REFUSED x4, 76 FOUGHT] | 4 [66 REFUSED] | 4 [66 REFUSED] | 5 [66 REFUSED x4, 89 FOUGHT] |

Attempt-positive seeds: baseline 8/8, musterfed 7/8, lairsham 7/8,
lairnoise 8/8. Fed-zero rate 1/8 vs the pre-registered >= 7/8
systematic bar: NOT systematic. The single fed-zero seed (97435)
is matched by a sham-zero on the SAME seed while noise stays
positive — a trajectory that avoids co-location in two arms, not
a feeding effect (the sham moves one unit a day; bulk food cannot
explain a sham miss).

Fight-contact robustness (the strongest single fact in the band):
on both gate-met seeds (97412 gate 10, 97418 gate 15), ALL FOUR
arms produce the identical single FOUGHT attempt on the identical
day (d78 / d60). When the gate is met, contact-and-fight is
insensitive to feeding, to pantry touch, and to an RNG-stream
shift. On 97426 (gate 10), baseline and noise reach a FOUGHT
attempt (d76 / d89) while fed and sham stop at d66 refusals —
trajectory timing, not arm membership, decides which day the
bump lands.

## The engagement rule (845 rows, no exceptions)

- Every r1 attempt row (845/845) has scholar tile == herald tile
  at attempt time.
- 843 wild-contact rows ALSO have scholar detail cell == herald
  detail cell (mx,my) at attempt time. The 2 exceptions are
  harness contest-drive rows (97432 baseline d94: scholar
  (4,4)/(4,4), herald (4,4)/(8,0), pendingEncounter true) —
  tile-sharing without detail-sharing, resolved by the harness,
  not by a bump.
- No attempt row in the corpus has a policy caller. The scholar's
  march, the call, and the muster never initiate contact; the
  herald's monster-turn movement onto the scholar's exact detail
  cell does.
- Raw attempt counts inflate: one bump day re-fires up to 12
  times (same line, same positions). The honest units are
  attempt-DAYS and attempt-positive seeds, not raw counts — the
  band verdict uses those units.

## Q3 — does day-matched trust hold as the sturdier primary?

Verdict: HOLDS as the primary ANCHOR, with the decomposition
carried alongside — band-scoped, with the known-seed failure
stated plainly.

- (a) Computability: call day is IDENTICAL across all four arms
  on every band seed (147/60/89/64/61/77/59/66), so the anchor
  (baseline first post-call attempt day) is well-defined for all
  8 seeds x 4 arms. On the two known seeds on current master it
  FAILS outright — no arm has a contact day, so neither the
  contact-day anchor nor a day-matched comparison exists there.
  That failure extends the prior arm's fragility finding across
  code versions: the contact-day anchor does not survive a
  landing, let alone a policy change.
- (b) Decomposition (window = (call, anchor], hunger = -2 x
  hungry dawns, strike = -5 x strikes naming the village,
  residual = remainder; link trust from daily rows):
  - Short windows (6 of 8 seeds): all arms agree EXACTLY (e.g.
    97405: -2.0 mean everywhere, hunger -2, resid 0). On 97420
    and 97433 the fed arm saves exactly +2.0 mean by feeding the
    first dawn (0 hungry days vs baseline 1; resid 0) — a clean,
    fully-decomposed feeding effect on trust, independent of
    contact.
  - Long window (97435, 6 days): baseline meanDelta -3.67
    (hunger -12, resid +13/+3/+9 — trust GAINS from other events
    offsetting hunger); fed meanDelta +5.67 (hunger -2, resid
    +13/+1/+9) — fed feeds 5 of 6 dawns, saving +10 of hunger,
    yet has 0 attempts. Trust and contact are independent
    outcomes of the trajectory. Sham on 97435 carries a -5
    Stonebridge strike; noise carries large negative residuals.
  - Contamination note (97418): a -10/-20 residual on two links
    at call+1, IDENTICAL in all arms — a same-trajectory
    call+1 event, not arm-caused, not investigated here.
- Wording fixed by the prereg rule: day-matched trust stays the
  primary anchor (always defined where a baseline contact
  exists; contact day is not), but on long windows it is NOT a
  clean causal estimate without the decomposition — future upkeep
  work must report hunger / strike / residual separately, never
  just the mean. The prereg's "strike exceeds hunger-saved"
  trigger does not fire for the fed comparison on any band seed
  (fed hunger-saved +2/+2/+10 dominates); it fires only for sham
  on 97435 (strike -5, hunger-saved 0).

## Reachability verdict

Reachable on current master, in this corpus: the call sounds
(18/40 screened seeds), musters form (gates 3–15 at call),
scholars camp the lair, wild-contact bumps fire, MUSTER-GATE
refusals fire (gate < 10), and FOUGHT starts fire (gate >= 10:
97412, 97418, 97426). NOT established here: any herald slay or
flee outcome — this driver does not record fight outcomes
(tbOutcomes were instrumented but not written to the per-seed
output), so no FOUGHT seed is claimed as a slay. The driver's
won/table/national flags are NOT cited as reach: won=1 at
"over-other" d90 occurs on contact-free seeds too (97401, 97402,
97403, 97407, 97408, ...), and table=1 occurs on village-lost
seeds — those flags track something broader than the herald
chain (see metric review). No new national/table/win evidence
attributable to the herald chain; the scale wall picture is
unchanged by this diagnosis arm (it was never its question).

## Sense-testing (transcript judged for meaning)

- The call-day fiction is strong: named answers and refusals
  ("Stonebridge answers! Lena Frost and Lena Ali will march"),
  the Haven commit line with names ("Fanny marches with the
  muster. Not loaned. Not asked-for. Ours."), and the coalition
  count spoken honestly ("counts 5 blades ... it needs 10").
  A player watching the call understands exactly what was asked,
  who answered, and what is short.
- The refusal fiction stutters: the same line fires 12 times in
  one day ("does not notice you the way prey notices a hunter.
  It notices you the way weather notices a field. ... (you have
  4). This is not courage. This is arithmetic.") — one bump
  meeting narrated as twelve identical meetings. The count is
  honest as an engine log and dishonest as fiction; attempt-days
  are the story unit, raw counts are not.
- The refusal line undercounts (closedecay's open item, still
  open): "you have 4" on 97405 where the judged gate is 5 (4
  allies + 1 Haven blade) — the line counts allies only.
- Fed packing on a march reads as provisioning, not as presence:
  97338 fed d86 "Packed: 3 Foraged food, 8 Foraged food. (3.1
  Mcal, 1.9 kg)" beside a scholar camped on the lair tile, with
  no line saying the scholar went home — the remote-packing
  instrument limit from musterupkeep, still audible. The next
  dawn's strike line ("THE HERALD struck Emberhold in the night")
  is the only voice the stand's cost gets.

## Per-seed records (all under evidence/2026-11-02/)

- perseed-laircontact-a/lc-closecommit-s97330-r1.json,
  lc-closecommit-s97330-r2.json (determinism pair),
  lc-closecommit-s97338-r1.json (Phase 1 baselines)
- perseed-laircontact-a/lc-{musterfed,lairsham,lairnoise}-s97330-r1.json,
  lc-{musterfed,lairsham,lairnoise}-s97338-r1.json (Phase 1 arms)
- perseed-laircontact-a/lc-closecommit-s974*-screen.json (40
  screening runs, 97400–97439)
- perseed-laircontact-a/lc-{closecommit,musterfed,lairsham,lairnoise}-s974{05,20,32,33,35,12,18,26}-r1.json
  (32 band runs)
- perseed-musterupkeep-a/mu-closecommit-s97330-rX.json
  (old-driver-on-current-master cross-check; lives in the prior
  arm's dir by provenance, committed with this arm)

## Files committed (this arm)

- scripts/policies/lairsham.js — trivial-touch control (1 unit/day)
- scripts/policies/lairnoise.js — pure-noise control (8 draws/day)
- scripts/laircontact-driver-20261102.js — daily lair-contact
  trace driver (tiles, herald tile, distances, march + guard,
  scholar/pack/pantry, gate, links, FULL attempt rows)
- scripts/sweep-laircontact-a.js — band runner + comparison table
- scripts/test-laircontact-a.js — proof test, 65/65 green
- evidence/2026-11-02/sim-laircontact-a-prereg.md (pre-sim prereg)
- evidence/2026-11-02/sim-laircontact-a.md (this file)
- evidence/2026-11-02/perseed-laircontact-a/*.json (81 records)
- evidence/2026-11-02/perseed-musterupkeep-a/mu-closecommit-s97330-rX.json

## Balanced panel (method note, not a gap hidden)

No panel compare .md is attached, for a stated reason, not an
omission: scripts/balance-panel.js runs its OWN policy registry
(capable/risk-aware/socialite/winseek) over its own seeds with its
own observer — it cannot ingest laircontact driver records, and
its policies do not include the closecommit stack, the titanroute
march, or any of this arm's legs, so a panel run would not
express this arm's comparison at all. The comparison this arm
actually makes — four policy arms on identical seeds with
byte-identical determinism (r1 == r2, r1 == screen across
parallel batches) — is the instrument the prereg named, and the
proof test pins it. Same position as the prior diag arms, which
attached no panel compares either. If a future arm changes game
code, the panel applies to that change; it does not apply to this
diagnosis.

## Metric review (for the NEXT run, not this verdict)

- Day-end co-location is neither necessary nor sufficient for
  contact (97426 attempts with none; 97400 / fed-97338 /
  97423 co-location with none). Attempt rows (engagement-time
  positions) are the measure; day-end tiles are a weak proxy.
  Next drivers must record DETAIL coords (mx,my) in the daily
  trace — this driver recorded tiles only, and the detail-cell
  rule was recovered from attempt rows alone.
- Raw attempt counts inflate (up to 12 identical re-fires per
  bump day). Judge contact by attempt-days and attempt-positive
  seeds, never by raw counts. The closedecay open item
  ("12-attempts-on-one-day count") is now explained (one bump
  event re-fired per monster-turn check) but the fiction still
  stutters — a narration-dedup line is a real blank, not a
  metric artifact.
- The contact-day anchor is fragile across code versions, not
  just across policy arms: the known seeds' contact days vanished
  when master moved (monster commitment et al.). Future arms
  must re-establish their baseline on the CURRENT code before
  judging, and must never carry a contact day across a landing.
- Driver won/table/national flags are non-specific: won=1 at
  over-other d90 on contact-free seeds, table=1 on village-lost
  seeds. Never cite them as reach without fight-outcome records.
  Next driver must write tbOutcomes (slain/fled) into the
  per-seed output.
- Herald world-list departure without a fight is unexplained:
  the herald leaves worldMonsters the day after a co-location
  day with no attempts (97400 d69+, fed-97338 d87+) and the day
  after refused attempts (noise-97338 d85+), with no departure
  line — while on other seeds it stays for weeks after refusals
  (97405 through d161). The departure rule is the next
  mechanism question; it decides whether a missed bump day is
  "herald left" or "herald never arrived".
- Band selection caveat: the 8-seed band is selected on
  baseline-attempt-positive (10 found in 40 screened). Band
  rates ("7/8") are rates OF baseline-attempt-positive seeds,
  never population rates. The population rate of
  baseline-attempt-positive call seeds in this screen is 10/18
  calls, 10/40 seeds — quote it that way.
- The prereg's band bar assumed the fed arm would be the
  outlier; in fact sham matched fed exactly (7/8, same zero
  seed) and noise beat both (8/8). A future control design
  should not assume the treatment is the most fragile arm.

## Instrument observations (not verdicts)

- The scholar's day-end tile oscillates Haven (4,4) <-> lair on
  guard-block days in BASELINE too (97330: watered-false /
  healthy-false blocks on d122–123, d125–126, d128–129, d131) —
  the "oscillation" the musterupkeep evidence attributed to the
  fed trajectory is ordinary guardrail behavior, present without
  any pantry leg. Fed packing does not cause it; thirst and
  wounds do.
- Pack weight never binds in this corpus: fed pack kg stays well
  under carry capacity on arrival days (e.g. 97330 fed d122:
  3.75 kg vs 20 cap; 97338 fed d86: 2.9 kg vs 24 cap) — the
  weight sub-mechanism of the food/drain hypothesis is dead on
  these records, independent of the verdict.
- The herald roams the whole board, including the Haven tile
  (97432 d94: herald at (4,4) while the scholar is home) — the
  lair is a rumor the scholar camps, not a cage the herald
  stays in.

## Next blanks, in order

1. Herald world-list departure audit (NEXT ARM, named): why
   does the herald leave worldMonsters the day after a
   co-location day without a fight (97400, fed-97338) and the
   day after refused attempts (noise-97338), while staying for
   weeks after refusals elsewhere (97405)? Instrument: daily
   trace WITH detail coords (scholar mx/my + herald mx/my) +
   monster-turn bump conditions + titan outcome records, so a
   missed bump day can be classified as "herald left" vs
   "herald never arrived" vs "detail cells differed".
2. Fight-outcome recorder: write tbOutcomes (slain/fled) into
   per-seed outputs, so FOUGHT seeds (97412, 97418, 97426) can
   say whether the herald fell — required before any
   "herald chain reachable end-to-end" claim.
3. Refusal narration dedup (fiction blank, not a metric):
   one bump day should read as one meeting, not twelve
   identical lines — game-code change, Steve-call territory
   only if it touches feel; otherwise a later arm's job.
4. Carried, unchanged: stores-draw upkeep (Steve-call); the
   refusal line's allies-only undercount; 97338 end-state
   national-flag artifact (now joined by the d90 over-other
   won=1 pattern — same audit family, still NOT a reach).

## Village assessment (plain words)

The village sends its scholar to camp on the herald's lair, and
there she waits. She cannot make the herald come to her: she can
only be there, night after night, while the herald wanders the
countryside — sometimes stepping onto her exact patch of ground,
sometimes passing a tile away, sometimes leaving the country
altogether without a word. When it does step onto her, the
meeting happens at once, twelve times over in the telling, and
the coalition is counted and found short — or, when the village
has gathered enough blades, the fight begins. Feeding the march
does not change whether the herald comes; touching the pantry
does not; even scrambling the luck of the world does not, not
reliably. The meeting is the herald's walk, not the village's
errand. What the village CAN control is being there with enough
blades when the walk arrives — and on the two seeds where it had
them, the fight began the same day in every version of the story,
fed or unfed, touched or untouched. The village is not failing
to reach the herald. It is waiting for a wandering giant to
notice it, and the wait is the mechanic.
