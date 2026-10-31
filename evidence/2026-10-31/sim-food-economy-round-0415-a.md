# Loop A round fleshout-20261031T0415Z — food-economy: axe arrival + selective trim (2 DIAG-GO arms, merged locally pending ship)

Run: oversight-flesh-out-loop, run fleshout-20261031T0415Z, axis food-economy.
Coordinator claim: hidden_files/lever-claims/fleshout-20261031T0415Z.json
(arms sim-axearrival-a, sim-selecttrim-a). Sibling Loop B live on
scale-onramp at run start (claim fleshout-loop-b-20261031T0342Z:
partyvolley / stickfiber / mustercall, NOT touched) — so per the
convergence-directed rule this run took the topmost unclaimed axis,
food-economy, instead of scale-onramp. B landed all three of its arms
into master during this run (master 1701e30b4 → ae15fd8f1) and closed
its round (coordinator evidence 8b5bf5cb7) before this closeout; its
tracker entry confirms food-economy untouched by B this round.

Shared substrate (both arms, from the prior strand rounds): POLICY=
nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, DAYS=30, strand seed 15215 (guard + ON
legs). Both arms DIAG ONLY: zero src/js changes, zero policy-default
flips, zero edits to existing policy files. New files only: one
default-OFF gated policy prototype (selecttrim-diag.js) and
recorder/analyzer/proof instruments.

## Arm 1 — sim-axearrival-a: backlog #1587 ANSWERED, DIAG-GO

Question: the villager's woodcut tier rises from whittle (Stone knife,
days 10–15 hint lines) to fell-capable (day 17 fell succeeds) with no
recorded arrival mechanism between strand days 15 and 17.

Answer, in plain words: the axe does not arrive "between days 15 and
17." It arrives on day 15, mid-day, from a dead man. The stranded
villager wakes day 15 still holding only its Stone knife, is refused
at its morning tree-cut for want of an axe, then during the day's
routine loots a hatchet — with bark armor, good boots, a fusion
pellet, a hand saw, and snare wire — from the body of Ethan, who died
in an ambush on day 11. Day 16 the villager holds the hatchet but is
too hungry to swing it (kcal floor, no verb); day 17, fed, it fells a
giant (+5 wood, pack-ready) and still sleeps out on ticks alone
(23 < 96), returning day 18. The "gap" was in the record, not the
game: earlier corpora recorded no per-morning inventory, so a day-15
loot looked like a day-17 mystery.

Evidence: intraday loopDay 15 / gameDay 15 bracket — morning snap
whittle, no hatchet → evening snap fell-tier Hatchet, same vessel
throughout (gen_gyft62f, no bearer death, so succession is ruled out
by the record itself). Wrap entry `corpseLootAll` on corpse_11_d5kxda
(day-11 stamp matches Ethan's death record), before {whittle, no
hatchet} → after {fell, Hatchet}. Quoted lines: "Taken: Hatchet x1,
Bark armor x1, Good Boots x1, Fusion pellet x1, Hand Saw x1, Snare
wire x1." / "You take hatchet, bark armor, good boots, fusion pellet,
hand saw, snare wire from Ethan. Your hands know what they did.
(+4 trauma)" / "The body is stripped." Morning/evening table days
7–20 complete (14/14 window evenings), whittle/no-hatchet every
morning through day 15 morning, fell/hatchet from day 15 evening on.

Pre-registered bars, judged exactly as written: (a) recorder complete
days 7–20, errs 0 — HOLD; (b) arrival identified as a dated,
event-traced mechanism — HOLD; (c) determinism re-run byte-identical,
same arrival day + mechanism — HOLD. Verdict DIAG-GO.

Contrast legs (report-only, never judged): control (STRANDFIX=0, seed
15215) strands nights 7–16 (10) with NO axe at any snap in 30 days —
the arrival is variant-trajectory-specific. Bank check (variant
stack): 15003 no axe in 30 days; 15220 no axe in 30 days (evenings
inside haven 30/30, no field-loot opportunity on this stack; differs
from axeacq's warmed-only day-18 loot on a different trajectory, not
a contradiction); 15337 stash-fetch on day 1 ("You remember the
Hatchet at your space in the haven and fetch it"), spawn pool
[snare_wire, hatchet, bark_armor] → day-2 morning pool [snare_wire],
hatchet equipped day 2. That 15337 fetch routine (not an equip() call)
is a NEW channel observation, appended to the backlog as an open item
— axeacq's "never held" for 15337 was on an older base + warmed-only
stack, and this arm does not establish why the fetch fired here.

Recorder neutrality: pilot vs morning-b variant ON for 15215
identical on every count (creek 12 / still 11 / rescued 1, still days
7–17, warmth acted 8, strandfix attempts 8). Sense-test day 15 PASS:
coherent person-shaped day (morning refusal, Rut King following,
honest unknown-food forage, named costly taking, honest wood-short
refusal, warmth fire). One wrinkle, not a verdict failure: no line
says where Ethan's body was found or that the villager sought it.

Commits (rebased onto master, merged): prereg 1f5300994, instruments
837149da4, prereg addendum fea6ebf5d, pilot corpus 89feff43b, evidence
+ corpora 9bbb5926b. Proof scripts/test-axearrival-a.js 46/46 with
--require-corpus, re-run green on the rebased tree. Evidence:
evidence/2026-10-30/sim-axearrival-a.md (+ prereg, prereg-addendum,
censuses, corpora). Backlog #1587 marked answered at closeout.

## Arm 2 — sim-selecttrim-a: backlog #1588 ANSWERED (mechanism), DIAG-GO

Question: can a trim skip expensive routine beats while KEEPING the
within-tile walk from the west corner to the east muscadine patch —
the walk that makes the next morning's press fire — given that the
whole-day hold refuted itself (press suppressed 0 attempts on both
legs via a frozen west-corner micro-position)? And can it exist as a
wrapper over competent.daily, which runs monolithically?

Implementation answer: WRAPPER, not a gated variant. competent.daily
is monolithic (nighttravel.daily calls it whole), but competent.js
exports its beats (module.exports, competent.js:3282 —
forageTripSeedFirst, sortHaul, competentEat, recovering, needTrip).
The trim wrapper (scripts/policies/selecttrim-diag.js, SELECTTRIM-
gated, default OFF, in the strandfix slot inside woodcarry/woodwarm)
assembles a trimmed day — forageTripSeedFirst + sortHaul +
competentEat, then nightStep — with zero edits to competent.js.

Spy finding — what the "walk" actually is: there is no microMove walk
in the policy — competent.daily never calls microMove or writes
mx/my. The west→east move is forageTripSeedFirst's out-and-back node
trip (travel out, forage 16 ticks, walkHome back), landing at (8,0)
because the return approaches from the east (d9) or north (d10). Skip
forageTrip and the landing and the press die — that is the hold arm's
0-press mechanism, now traced to the exact beat. Strand-day routine
is already nearly minimal (guard d9: 19 = forage 16 + talk 1 +
askAbout 2; d10: 18; d11: 17), so a walk-preserving trim can save at
most 1–3 social ticks on early strand days.

Pre-registered bars, judged exactly as written, with one coordinator
adjudication disclosed below: (a) trim mechanism exists in wrapper
form, walk preserved on both legs — HOLD: evening landings match
control on all 8 trim days (guard d9/d10 (8,0), d11 (0,0); ON
d9/d10/d13/d14 (8,0), d12 (0,0)); every pressable strand morning
presses. (b) following-morning press attempts preserved, strictly
above the hold arm's 0 — HOLD: guard trim 1 (d10 E540) vs control 1
(d10 E450); ON trim 2 (d10 E720, d14 E900) vs control 4. ON has fewer
only because the strand ends by bearer death day 15 — the d18/d22
presses never arise, a strand-length effect, not suppression.
(c) ticks saved reported per leg — HOLD: guard 3/1/1 (d9/d10/d11),
ON 3/1/9/17/1 (d9/d10/d12/d13/d14). Day-7 49-tick hole NOT MOVED on
either leg (no trim fires day 7, haven wake, as preregistered).
Guard day-10 hole narrowed 3 → 2 short (418 vs 416 needed), not
cleared — and the arithmetic now shows why it cannot clear on this
design: 384 + 17 + 16 = 417 floor, still 1 short. Conversion NOT
required and NOT achieved (0 conversions; one gate-shift, below).
Verdict DIAG-GO.

Coordinator adjudication (disclosed, not a re-judgment): the worker's
prereg operationalized (a) as next-morning wake-cell match. Two rows
mismatch on that proxy, both by succession (bearer died overnight:
guard d11→d12, ON d14→d15), while the walk itself matches 8/8 and
every pressable morning presses. Bar (a) as briefed was "preserves
the within-tile walk," so (a) is judged on the walk itself and the
verdict stands DIAG-GO. Under a strict-proxy reading the label would
be NO-GO with the mechanism facts unchanged; that reading is recorded
here, not substituted silently.

Costs, reported honestly (not verdict-flipping, per prereg):
- Guard d11 rescue lost on KCAL, not ticks (40 vs 60, 20-kcal margin;
  trim d11 decision ticks 112 ≥ 96). Chain: skipped talk is a FOOD
  event (spy: talkTo moves kcal −60 → 0, exactly the forage debt),
  and skipping talk shifts the RNG stream (press yields 5→6 grapes
  guard, E540→E720 ON). Appended to the backlog as an open item:
  talk-as-food-event + trim knowledge loss (Ethan's Flashbulb Moth
  counter never learned on trim d9).
- Bearer deaths forward on both legs: guard none → day 12, ON day 23
  → day 15 (same bearer, "the wild"; mechanism not isolated —
  night-encounter lottery on the shifted stream is the candidate).
  Both trim strands end by succession, not rescue.
- ON d10 newly ticks-short (221 → 94): the 3 saved ticks on d9
  coincide with d10's morning flipping 256 → 384 waits-alignment
  (sleep/upkeep mechanism not isolated; appended to the backlog).
- Wave reach falls: guard 3 → 2, ON 2 → 1. Sense-test PASSES: trim
  days read as people (travel, encounters, foraging, fireside
  fragments, honest refusals), unlike the hold arm's 2-line absences
  — except the skipped talk also skips knowledge (above).

Commits (rebased onto master incl. axearrival, merged): prereg
eb5045aca, results e80fae3c0. Proof scripts/test-selecttrim-a.js
89/89, re-run green on the rebased tree and on the final merged
master content. Evidence: evidence/2026-10-31/sim-selecttrim-a.md
(+ prereg, census + compare, corpora). Backlog #1588 marked answered
(mechanism) at closeout.

## Village assessment (plain words)

The village in this run is one stranded villager at a creek, not a
village at scale. It wakes on the wrong side of the water, without
enough food or wood to build the bridge home, and it stays out night
after night while the village presumably eats without it. Two things
about that exile are now clearer than they were yesterday. First, the
villager is not helpless about tools: when a dead man's hatchet is
lying in its path, it takes it, feels bad about taking it, and the
next fed morning it can finally cut wood — the tool gate is a story
about death and loot, not about a missing recipe. Second, there is
almost nothing left to trim from its days: its routine is already
nearly minimal, a skipped chat saves a couple of ticks and costs a
meal's worth of energy plus something it would have learned, and the
walk home each evening depends entirely on the daily foraging trip —
stop the trip and the villager never even arrives where the morning's
food is. Nobody thrived here and nobody died of the strand itself on
the measured legs; the deaths that moved forward did so on the
shifted chance of the night, which is the honest price of changing
anything about a routine day. What is still missing is not a better
trim: it is a way for a fed villager with an axe to turn a morning
into wood without spending the whole day-part, and a way for the
village to notice a villager who has been out for ten nights.

## Wall numbers

No observable wall band this run (single-seed strand mechanism arms,
30-day pre-seat substrate): national / table / wins NOT OBSERVABLE
(0 by construction on these corpora). Latest observable band remains
Loop B 0342Z: national 8/16, table 12/16, wins 11/16, wave 4 9/16,
wave 5 0/16, median survival 106.5d, max 139d. Overall wall UNCHANGED:
full seat 0, wave 5 reached 0 stands. Strand census on 15215
unchanged in shape: guard strand 3 nights, ON strand 10 nights
(control legs), before any trim/arrival effect.

## Metric review (mandatory, §14)

- Axearrival: bars held as written. Post-pilot prereg addendum
  widened the corpse-take wraps (routine loot goes through
  corpseLootAll, not lootCorpse) BEFORE any judged leg; bars
  unchanged. Disclosed, not a re-score.
- Selecttrim: proxy adjudication above (walk itself vs wake-cell
  proxy). The strict-proxy reading is recorded, not substituted.
  Neither arm re-judges any earlier corpus.
- PREVENTION-COUNTS DECISION (adopted by this run, before any leg,
  for FUTURE arms only): for any future strand-fix conversion arm,
  a both-evening counts as converted if the variant leg PREVENTS it
  (the evening is not still on a loop-day that is still on the
  same-WOODWARM control leg), as well as if it is rescued same-day.
  This decision is NOT applied to the 0117Z strandfix corpus, which
  stays NO-GO exactly as written. A future arm must restate this bar
  in its own prereg before its first judged leg.
- No metric proved wrong by these arms beyond the selecttrim proxy
  note above; no other revision proposed.

## Panel (§15)

The official panel driver cannot express the strand stack (paired
guard/ON legs on one seed with instrument variants), as in the prior
strand rounds. Paired compares are attached, never presented as an
official panel run: selecttrim census + compare
(evidence/2026-10-31/sim-selecttrim-a-census.json and compare in the
arm evidence); axearrival censuses (variant/control/bankcheck/
determinism) in evidence/2026-10-30/.

## Telemetry deviation check (§10)

`node scripts/telemetry-check.js --baseline hidden_files/
telemetry-baselines/scale-wall.json --current 'evidence/2026-10-30/
sim-axearrival-a-corpus-variant-on/*.json' --metrics
national,table,wins,exiled` → 3 LOUD lines (national baseline 12 →
current 0, table 16 → 0, wins 16 → 0; n=1 file); exiled clean (no
line). INVESTIGATED as the known regime artifact: a 30-day pre-seat
single-seed strand corpus carries no scale wins by construction,
against a WINSEAT baseline. Baseline NOT rolled. Same class as the
prior strand rounds' LOUD lines; no new investigation warranted.

## Backlog

Marked at closeout in hidden_files/sim-findings.md: #1587 answered
(axearrival), #1588 answered-mechanism (selecttrim). New open items
appended: (1) 15337 stash-fetch channel fires on this stack, reason
unestablished; (2) talk is a food event (−60 kcal) and skipping it
loses knowledge — trim designs must price talk; (3) ON d10
waits-alignment flip (256 → 384) after 3 saved ticks, mechanism not
isolated. Steve-call items untouched (competent courtship drive;
generation-dealt vs earnable vests; warmth default; #1538 muster
routing). The 0117Z next-blanks list now reads: prevention-counts
decided (above, future arms only); axe/tool gate answered for
15215 (corpse loot day 15; stash-fetch day 1 on 15337 — mechanism
open); selective trim measured (wrapper exists, saves ≤3 ticks
early, cannot clear day-10 hole, costs kcal + knowledge + deaths
forward) — a strand-fix design must now reckon with a near-minimal
routine, not with a trimmable one.

## Infrastructure

- First axearrival worker failed on a transport error (sqlx pool
  timeout) before doing any work; worktree verified clean at base
  and a replacement dispatched (same brief). No work lost.
- Master moved 3 times under the run (B 0342Z landing, journey r82,
  journey-establishment r66); all arm branches rebased clean, proofs
  re-run green after every rebase. The second merge initially
  refused --ff-only only because axearrival had just merged ahead
  of selecttrim's base; selecttrim rebased onto the axearrival-
  inclusive master, proof re-run 89/89, then merged clean.
- Coordinator worktree registration was interrupted by a service
  restart mid-checkout (partial dir with evidence/ only, branch
  created, registry entry missing). Partial dir verified to hold
  only committed checkout copies, removed, branch deleted, and the
  registration re-run cleanly (coord-0415-a at 230f0fb6c).
- Safe-commit index clobber hit both workers' commits (and the
  selecttrim worker's twice); all commits verified correct via
  git show --stat / blob match, indices repaired via HEAD-blob
  cacheinfo. Coordinator evidence commit verified the same way.
- check.js --quick NOT re-run (zero src/js, zero policy-default
  flips; arm proofs green on merged master content; sibling loops
  live). No push, no version bump, no live verification — ship loop
  owns deploys. Worktrees released as merged, branches deleted:
  sim-axearrival-a, sim-selecttrim-a, coord-0415-a. Main tree clean
  at closeout.

food-economy stays converging (NOT converged): the strand is now
fully priced on four gates (food AND wood jointly, ticks, warmth as
a log tax) plus a tool gate with a named arrival (day-15 corpse loot)
and a measured trim ceiling (≤3 early ticks, day-10 hole
unclearable, kcal + knowledge + death costs) — but no strand fix
has landed and no food-economy default flipped. scale-onramp
untouched (sibling Loop B lane).
