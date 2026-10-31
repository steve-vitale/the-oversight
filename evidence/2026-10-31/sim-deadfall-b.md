# sim-deadfall-b — the villager deadfall duty prototype, measured (GO)

Run: Loop B worker, arm sim-deadfall-b, axis scale-onramp, backlog
#1594, run fleshout-loop-b-20261031T0436Z. PROTOTYPE + MEASURE.
Worktree branch: sim-deadfall-b. Base anchor: b2518ece2 (worktree
HEAD; recorded per seed as anchorCommit in the per-seed JSONs).
Pre-registration: evidence/2026-10-31/sim-deadfall-b-prereg.md
(written BEFORE any judged sims; judged against it below).
Prototype: src/js/game.js (delegateTasks 'deadfall' + competence
'deadfall' + resolveOneAssignment 'deadfall' branch, stone-duty
shape, no axe gate) + src/js/perceive.js (Haven stash line lists
stick) + scripts/policies/deadfall-b.js (DEADFALL_B=1 staffing
layer, pile-stick < 6, WANT 2, max 3 attempts/day — the cap added
after the first pilot run, see §Pilot fix).
Sweep: scripts/deadfall-sweep-20261031.js. Analyzer:
scripts/deadfall-analyze-20261031.js. Transcript probes:
scripts/deadfall-transcript-20261031.js + /tmp/deadfall-probe-v2.js
(probe scripts in /tmp are not committed; their outputs are quoted
below). Proof: scripts/test-deadfall-b.js — 28/28 GREEN (fixture
duty production + ledger + return line, staffing fixtures incl.
the attempt cap, live 60d sweep gates off/on + byte-identical
re-run). No [needs-eyes] (measurement + prototype for coordinator
landing call; nothing player-facing ships from this run alone).
Panel (§15): compare .md attached as
evidence/2026-10-31/deadfall-b-panel-compare.md — see §Panel.

## Verdict: GO (judged exactly against the prereg)

Pilot (85101-85108, baseline vs prototype, identical seeds):
1. Pile sticks > 0 on 8/8 pilot seeds, deadfallHauls > 0 on 8/8
   (bar: >= 6/8). PASS.
2. Bow craft attempts 26, craft successes 13 in the pilot
   (bar: >= 1 attempt/success). PASS.
3. Stone-duty output NOT regressed: prototype median stone max
   649 vs baseline median 510 (127% of baseline; bar: >= 50%),
   stone-positive on 8/8 seeds in both arms. PASS. (Stone
   consumed by successful arrow/bolt crafts, 1 per batch, is a
   success effect inside these numbers, not a hidden deduction.)
4. No new narration spam (transcript probes, seed 85101, 60d,
   prototype on — see §Sense test): duty return lines max 4/day
   (bar: <= 4/day), assign lines max 2/day, deadfall-attributed
   refusals max 3/day total and max 1 per villager per day (no
   refusal loop). PASS — on the corrected probe; the first probe
   miscounted and is reported honestly below, not hidden.
GO. Confirm (85109-85116) below extends the pilot; the pilot
alone already passes all four legs.

## The answer, in plain words

The village finally has someone whose job is bringing sticks
home. Give two villagers the deadfall job and the pile stops
being a place sticks never are: every pilot seed has sticks by
day 2–5, and the bow fighters stop being ornamental. In the
pilot, 26 bow craft attempts ran where the baseline had zero —
13 of them made real arrows and bolts — and on seed 85103 a
villager named Maya Singh walked into a fight carrying 4 arrows
and fired all four (3 hits, 48 damage) before fleeing. The bow
still doesn't win the fight on its own — she fled — but the
weapon works now, which is the exact gap this arm was asked to
close: the source, not the whole fight. The stone pile is fine
(median stone max actually rose, 510 -> 649); the village did
not pay for sticks with stone. And the duty talks like a duty:
one return line per haul, in the stone line's voice, never a
spam burst, never a refusal loop.

## Canon note (no invention)

No canon doc covers a villager stick/fiber source duty (CANON.md
read; the manifest's table has no such doc). The prototype
copies code precedent, not invented canon: the stone duty's
shape, gatherFallen's no-tool deadfall precedent (so no axe
gate), and clearBrush's brush-yields-fiber precedent. The
perceive.js stash-line fix closes stickfiber-b's metric-review
trap (pile sticks would otherwise be invisible at Haven).

## Pilot numbers (judged pilot; baseline vs prototype, 8 seeds)

Baseline (staffing off; duty code present but unassigned):
- Deadfall hauls 0, pile sticks 0 on every day of every seed,
  pile fiber 0 — reproducing stickfiber-b's "never into the
  pile" verdict on this anchor (its scholar-pack sticks are a
  different, unmeasured channel here; the pile verdict is what
  the arm judges).
- Bow pocket calls 20, all material-blocked (7 stick-only, 13
  stick+fiber); craft attempts 0, successes 0.
- Stone: median max 510, positive 8/8 (per-seed max 116–848).
- Fights 6 (ranged 3), volley shots 0, volley damage 0.
- Wall: national 5/8, table 7/8, wins 7/8, wave 4 5/8, wave 5 0/8,
  median survival 113d, max 139d.

Prototype (staffing on):
- Deadfall hauls 1,737 (per seed 8–706), sticks 2,516, fiber 894;
  pile sticks > 0 on 8/8 seeds (first positive day 2–5; max
  7–1,007), pile fiber > 0 on 8/8 seeds.
- Bow pocket calls 29: craft attempts 26 (13 successes, 13
  failed blind rolls), 1 craft-not-attempted-other, 2
  material-blocked (1 stick+fiber, 1 stick+stone+fiber — the
  last two are calls landing on a transiently empty pile, not a
  source failure: the pile refills the same day).
- End census: arrows carried 6, ammoCraft entries 8 (all at L2 —
  a blind success teaches, so repeat crafters are at 85%).
- Fights 11 (ranged 3), volley: 1 fight with shots, 4 shots,
  48 damage (Maya Singh, s85103 d41 — see §Sense test).
- Stone: median max 649, positive 8/8 (per-seed max 30–1,578).
- Wall: national 7/8, table 5/8, wins 5/8, wave 4 5/8, wave 5 0/8,
  median survival 95d, max 202d. Wall movement is trajectory
  noise on 8 seeds (the staffing layer's assign attempts draw
  RNG through the engine's social paths, so trajectories diverge
  from baseline seed-by-seed); this arm claims NO wall effect,
  only the supply effect, which is uniform across seeds.
- Instrument errors 0/0/0 on both arms.

## Pilot fix, reported not hidden (staffing attempt cap)

The FIRST pilot run (same seeds, pre-cap layer) also passed
legs 1–3 (hauls 518, craft attempts 14, stone median 349 vs
510 = 68%), but its transcript probe exposed a staffing-layer
defect: the layer walked the WHOLE free roster every day until
2 accepted, producing ~10 refusal attempts on low-trust days
(probe of s85102 day 1: 10 refusals + 1 accept). The layer was
fixed (max 3 attempts/day — a leader asks a few people, not
everybody), the proof extended (attempt-cap fixture, 28/28),
and the pilot RE-RUN as the judged pilot above. The first
pilot's numbers are exploratory only and are NOT judged data.
The baseline re-run with the fixed layer reproduced the first
baseline exactly on every analyzer aggregate (bow calls 20 all
blocked, wall 5/7/7, stone median 510, per-seed stone maxes
identical) — the layer change is inert when off, as designed.

## The lead effect (why some seeds overproduce)

On some seeds the pile grows far past the staffing cap (s85104:
1,007 sticks; s85103: 321). The cap gates NEW assignments only;
once a villager becomes the deadfall domain LEAD (a contender
challenge yielded or aged out — the game's own lead mechanic,
game.js taskLeads), that lead resolves deadfall EVERY part
without an assignment, like a fish or water lead. The s85102
probe (pre-cap layer, 30d) showed exactly this: taskLeads
deadfall = ruby_callaghan, 105 hauls in 30 days. Overproduction
is therefore parity with stone (baseline stone maxes reach 848
by the same dynamics), not a deadfall-specific defect — but it
is a real tuning note for the landing decision: a deadfall lead
working every part will stockpile hundreds of sticks unless a
lead-level cap is ever wanted. No cap is proposed here; the
arm's bar was production, and production is ample. Recorded
under §Blanks, not hidden.

## Sense test (SENSE-TESTING LAW)

Probe v1 (60d, s85101, pre-separation count) reported 147
'deadfall'-mentioning lines, max 5/day, and 77 refusal lines —
which looked like a leg-4 question. It was a probe defect, not
a duty defect: it counted assign lines, return lines, and lead
mentions together, and counted refusals from EVERY task (the
base policy assigns many tasks; refusals are normal engine
behavior). Probe v2 separates them on the same seed (deterministic
re-run reproduces the pilot's s85101 trajectory):
- Return lines: 135 over 53 days, max 4/day — one per day-part
  at most, exactly the stone cadence. Days at 4 are lead days
  (a lead working every part), not bursts.
- Assign lines: 5 total, max 2/day.
- Deadfall-attributed refusals (wrapped assignTask, task =
  'deadfall' only): 28 over 60 days, max 3/day, max 1 per
  villager per day — the same 3 low-trust villagers refusing on
  early days until trust builds, then silence. No loop.
- Dry-fight lines: none in the 60d probe window (no dry-fight
  line fired), so the probe cannot re-quote the old "string
  stays drawn, useless" line — but the pilot's fight record
  supplies the closing scene instead:

The closing scene (s85103 d41, from the corpus, not a quote
from the probe): Maya Singh, crude bow, walks into an
expedition-monster fight carrying 4 arrows — crafted from
duty pile sticks, stone, and fiber — and fires a 4-shot volley
(3 hits, 48 damage, quiver empty) before fleeing. The game
never pretended the volley happened before; now it happens,
with the ammo accounting to prove it (pile at fight time:
148 sticks / 52 fiber / 286 stone). She still flees — the
duty fixes supply, not courage or fight outcomes, and the
evidence does not claim otherwise. The other two ranged
fights in the pilot stayed dry for the OLD reason (never
called / never departed — the pocket-call design ranked
second in stickfiber-b, still open, see §Blanks).

## Panel (§15)

The panel driver was run before/after on registry policy
'capable', pilot seeds 85101-85108, 150d (panels in
/tmp/panel-deadfall-b-{base,proto}/; compare .md attached as
evidence/2026-10-31/deadfall-b-panel-compare.md). The compare
tool itself reports decision: invalid — "Policy/harness changed:
scripts/policies/deadfall-b.js" — because the panel manifest
covers scripts/policies/, so ADDING the staffing file trips its
validity gate even though no registry policy uses it. The
underlying rows tell the real story: all 8 per-seed panel
entries (row + stateHash + observer outputs) are IDENTICAL
between the two panels, and both panels' neutrality proofs
match. That is exactly the prereg's predicted outcome: under
registry policies the duty is inert (never assigned), so the
panel shows no material signal — and the panel CANNOT express
this arm's staffing effect, which is why the judged comparison
is the paired identical-seed sweep above. No panel effect is
claimed; the invalid compare .md is attached as-is, with this
explanation, rather than laundered into a pass.

## What the village looked like, in plain words

A village where two people walk the treeline for fallen wood
and come home with sticks in their arms, where the pile by the
stash grows from zero to a working stock in the first week,
where the bow fighter's craft attempts stop dying at the
recipe check and start rolling — half of them failing blind,
half teaching their crafter to 85% — and where, on one seed,
a bow actually sang in a fight. The stone pile kept growing
alongside, unbothered. The wall did not move — national, table,
and wins wobbled within seed noise, wave 5 stayed at zero —
because sticks were never the wall; they were a missing rung,
and the rung is now in place. What still stands between this
village and a bow that wins fights is the call that reaches
fighters who never depart, which was always the second-ranked
job.

## Blanks (out of scope for this arm; coordinator owns the backlog)

- POCKET-CALL DESIGN (stickfiber-b rank 2, still open): most
  ranged fights in the pilot are still never-called (wild
  encounters, no departure) — the duty fills the pile, but the
  call that reaches never-departing fighters is a separate arm.
- VOLLEY-AS-WIN: the one pilot volley (4 shots, 48 dmg) ends in
  vFlee. Whether bow volleys change fight outcomes at scale is
  unmeasured (1 volley fight is a proof of function, not of
  effect) — a future arm's question, not this one's verdict.
- LEAD-LEVEL OVERPRODUCTION: a deadfall domain lead stocks
  hundreds of sticks (s85104: 1,007). Parity with stone; a
  lead-level cap is a tuning question for the landing decision,
  not a pilot failure.
- SCHOLAR-PACK CHANNEL: the scholar still finds sticks while
  foraging (stickfiber-b: 127 net increases) and still never
  donates one. The duty makes that channel redundant for the
  village, but the scholar-deposit gap itself is unchanged and
  unmeasured here.

## Metric review (for the NEXT run, never a re-score of this one)

1. Leg 4's "deadfall duty lines" must be defined as RETURN lines
   (🍂 gathers deadfall) in the prereg, not as any line
   mentioning deadfall: the v1 probe's combined count (max 5)
   mixed assign lines, return lines, and lead mentions, and its
   refusal count mixed all tasks. The v2 separation (returns max
   4, deadfall refusals max 1/villager/day) is the measure the
   prereg intended; future arms should pre-register the line
   classes separately.
2. The pile-stick staffing cap (6) gates new assignments only;
   leads bypass it. A future arm measuring "pile size under the
   duty" should pre-register lead vs staffed hauls separately —
   this arm's haul totals mix both, which is why per-seed hauls
   range 8–706.
3. Trajectory divergence from the staffing layer is large
   (assign attempts draw RNG through social paths): seed-by-seed
   wall comparisons on 8 seeds are noise, and this arm rightly
   claims no wall effect. A future arm wanting a wall claim
   needs the confirm band at minimum and should pre-register a
   wall tolerance, not eyeball it.
4. Bow craft "success" at L1 is a 35% blind roll, so craft
   attempts (26) overstate reliable supply; attempts + successes
   (13) + L2 entries (8) together are the honest triple. Future
   arms should pre-register all three.

## Confirm (85109-85116) + full band (16 seeds)

Confirm judged on the same four legs at band scale (prereg):
leg 1 >= 12/16 seeds pile-stick-positive with hauls; leg 2 >= 1
attempt/success band-wide; leg 3 same stone tolerance at band
scale; leg 4 probe stands (confirm changed no narration code).

Full band, baseline (staffing off):
- Hauls 0, pile sticks 0 / fiber 0 on all 16 seeds — and the
  band reproduces stickfiber-b EXACTLY on the new anchor:
  bow calls 36, all material-blocked (15 stick-only, 21
  stick+fiber); craft attempts 0; fights 30 (evade 3, vFlee 20,
  vDie 7 — the identical outcome split); wall national 8/16,
  table 12/16, wins 11/16, wave 4 9/16, wave 5 0/16, median
  survival 111d, max 139d. The baseline is therefore not just a
  control — it is a successful independent reproduction of the
  prior arm's census.
- Stone median max 285, positive 16/16.

Full band, prototype (staffing on):
- Hauls 2,561, sticks 3,700, fiber 1,309; pile sticks > 0 on
  16/16 seeds (bar: >= 12/16). PASS.
- Bow calls 38: craft attempts 35 (17 successes, 18 failed
  blind rolls), 1 craft-not-attempted-other, 2
  material-blocked on transiently empty piles. PASS.
- Stone median max 293 vs baseline 285 (103%; bar: >= 50%),
  positive 16/16. PASS.
- Volley: still exactly the 1 pilot fight (Maya Singh, s85103
  d41, 4 shots / 48 dmg); no second volley in the confirm. The
  duty's effect is supply, proven; its effect on fight outcomes
  remains a 1-fight observation, not a claim.
- End census: arrows carried 6, ammoCraft entries 11 (all L2).
- Wall: national 12/16, table 11/16, wins 11/16, wave 4 10/16,
  wave 5 0/16, median survival 95d, max 202d. No wall effect is
  claimed: with trajectory divergence this large (prototype
  fights 14 vs baseline 30 — the fight count itself moves with
  the trajectories), 16 seeds cannot separate a supply effect
  on the wall from noise, and the prereg claims none.
- Instrument errors 0/0/0 on both arms, both bands.

GO holds at band scale. The prototype is committed on this
branch for the coordinator's landing call; it ships to master
only on that call.

## Files

- Pre-registration: evidence/2026-10-31/sim-deadfall-b-prereg.md
- Evidence: evidence/2026-10-31/sim-deadfall-b.md (this file)
- Panel compare: evidence/2026-10-31/deadfall-b-panel-compare.md
- Prototype: src/js/game.js (deadfall duty), src/js/perceive.js
  (stash stick line), scripts/policies/deadfall-b.js (staffing)
- Sweep: scripts/deadfall-sweep-20261031.js
- Analyzer: scripts/deadfall-analyze-20261031.js
- Transcript probe: scripts/deadfall-transcript-20261031.js
  (v1); probe v2 script lives in /tmp (not committed)
- Proof: scripts/test-deadfall-b.js (28/28 GREEN)
- Corpora: evidence/2026-10-31/perseed-deadfall-b/baseline/
  s85101–s85116.json; evidence/2026-10-31/perseed-deadfall-b/
  prototype/ s85101–s85116.json
- Reused, unmodified: scripts/ammo-diag-20261031.js,
  scripts/supply-diag-20261031.js,
  scripts/stickfiber-diag-20261031.js
