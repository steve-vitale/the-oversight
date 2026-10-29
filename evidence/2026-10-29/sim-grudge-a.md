# sim-grudge-a — DELIBERATE-RETURNS (GRUDGE LOTTERY): AUDIT + DESIGN, BUILD BLOCKED ON FILE OWNERSHIP

Worker: gaps-grudge. Status: AUDIT COMPLETE, DESIGN SPECIFIED,
BUILD NOT STARTED — stopped per the assignment's hard rule (below).
No src/js change, no judged sim run, no pilot, no confirm, no
merge, no push, no bump, no live verification. This file is the
deliverable: the lottery audit the arm was assigned, a complete
build-ready design, and a draft preregistration for the arm that
builds once the ownership block clears. Nothing in here is a
judged result and nothing here may be quoted as a pilot outcome.

## The stop, plainly

The grudge want must compete in the objective lottery. That
lottery is `objPick` in `src/js/villager-objectives.js` — the
HUNT candidate is pushed at one line (see "Integration point")
and the EAT/REST pre-gates that shape the funnel sit in the
same function. The assignment forbids touching that file
(fixall-map's file) and orders: "If your design needs those
files, STOP and report to me instead of editing them."

This design needs that file. There is no honest alternative
inside the rules, and the audit below proves it rather than
asserting it:

- `npcGoal` (game.js) is a static generated goal, not a
  post-fight want, and no goal value maps to a HUNT weight in
  `objPick` — the dormant-goal mapping biases VISIT / CHORE /
  SEEK / EXPLORE / HAUL only. Writing a fight outcome into a
  goal would change nothing in the lottery.
- `npcTemper` is read in `objPick` but never used by its
  lottery weights (a dead read in that function) — so no
  temper change outside the file can move a HUNT pick.
- `npcMaxDist` / `npcRangeProfile` (villager-agency.js, not
  forbidden) feed the candidate GATES, and the gating freeze
  forbids retuning them anyway; the homebody maxD-0 case
  stays un-offerable by design, not by a weight.
- `villagerNeedTrack` / `villagerWantsKnowledge` live in
  villager-build.js — also forbidden — and neither maps to
  HUNT in any case.
- Monkey-patching `objPick` from a new module would evade
  the ownership rule instead of obeying it, hide the change
  from the file's owner, and break the moment fixall-map
  edits the function. Not done, not recommended.

What the coordinator needs to decide (one line each, for the
record): either (a) release `villager-objectives.js` to this
arm for the single lottery-weight change specified below,
with fixall-map reviewing, or (b) hand this design to the
fixall-map owner to build inside their lane, or (c) hold
the arm until the map lane lands. Until one of those is
ruled, the correct state is: audit + design + draft prereg
committed, game code untouched.

## Audit 1 — where HUNT competes (code, not impression)

File: `src/js/villager-objectives.js`, function `objPick`
(dawn + idle-at-haven picks). Order of decisions:

1. Pre-lottery returns, HUNT never competes on these picks:
   - LEAVE if goal is 'escape'.
   - REST if energy < 35.
   - EAT if hunger > 55 AND pantry > 500 kcal. This is the
     ONLY EAT path in `objPick` — EAT is not a lottery
     candidate at all.
   - HAUL if a fresh unrevealed-flesh kill is remembered
     (dawn-after-kill rule).
   - SEEK if the villager wants knowledge (sheet, or build
     with a coin flip) and a teacher is found.
2. The lottery (only picks that reach it): candidates and
   weights at the time of the funnel band —
   - FORAGE: only if pantry < 4000, or hunger > 50, or the
     'feed' goal with pantry < 6000; weight 1.5–4 (+1.5 feed).
   - WATER: only if village waterDays < 2; weight
     3.5 + (2 − waterDays) × 2.5, floored at 7 when
     waterDays < 1 — i.e. up to 8.5 on a dry cistern.
   - TRAPS 1.6 (knowledge-gated), HAUL ~1–5.5 (corpse value
     + knowledge bonus), HUNT exactly 2.0 (fixed, no
     character input), VISIT ~1.2–2.0 + goal biases,
     EXPLORE 1.2–2 (wanderer/explorer only, coin-gated),
     SEEK = goal bias (record/understand/answers only),
     HAVEN_CHORE always present: 1.4, or 3.0 for homebodies,
     + goal biases.
   - Draw: one weighted draw over the candidate weights.
3. Candidate gates (`objHuntCandidate`, same file, NOT to be
   retuned — gating freeze): memory fresh (age ≤ 3 days),
   armed, 1 ≤ distance ≤ maxD, not sheltering, not
   post-flee resting. A homebody (maxD 0) can never pass;
   that is a real person with range 0, not a bug to tune.

## Audit 2 — what the funnel's 22 "offered" picks really were

The funnel taxonomy calls a pick "offered" when the
post-pick recompute of `objHuntCandidate` is non-null
(test-funnel-a.js S2: `p.candidate && p.candidate.mid ===
mid`). That recompute does NOT prove the pick reached the
lottery. Re-read against Audit 1, the 22 picks in the 9
LOTTERY-LOST triples split as:

- 8 × EAT — PRE-GATE, not lottery losses. By construction
  these villagers had hunger > 55 and the pantry held
  > 500 kcal. No lottery weight, grudge or otherwise, can
  ever win those picks, because the lottery never ran.
  Calling them lottery losses overstates the lottery's
  addressable band by more than a third.
- 14 × true lottery losses — WATER 7, FORAGE 2,
  HAVEN_CHORE 3, VISIT 2. WATER and FORAGE are themselves
  need-gated by construction: WATER only enters when the
  village cistern holds < 2 days' supply; FORAGE only
  when the pantry is < 4000 kcal or the villager is
  hungry (> 50). So every one of the 22 losing picks was
  made under a genuine need signal — none of them is a
  "mild need beating a weak want" case. The funnel's
  plain-words line "dinner beat revenge, 22 to 0" is true
  as a count and misleading as a mechanism: the honest
  split is 8 pre-gate hunger picks + 14 lottery losses,
  of which 9 (WATER 7 + FORAGE 2) were need-candidate
  wins, and only 5 (HAVEN_CHORE 3 + VISIT 2) were
  low-stakes hall/social picks beating HUNT.

The need state the assignment asked for, answered from the
code paths (the funnel recorder captured no need fields,
so no corpus row can answer it directly — this is a
measurement gap for the building arm's recorder, see
"Recorder gap"): EAT losers were genuinely hungry
(> 55 by gate construction); WATER losers were in a
village with < 2 days of water; FORAGE losers were in a
village short of food or themselves hungry. Mild-need
lottery losses in the band are at most the 5 chore/visit
picks — and even those ran against a fixed HUNT weight
of 2.0 next to a homebody chore weight of 3.0.

## Audit 3 — fixture probe: the lottery is not weak in a vacuum

New probe (no game code): scripts/test-grudge-audit.js,
GRUDGE-AUDIT PASS. One seeded villager (gen_anixv6h,
wanderer, goal 'understand', armed, maxD 3) with a fresh
influencer memory at (5,4), haven (4,4); 300 `objPick`
draws per condition, candidate held throughout, needs
unmutated by repeated draws (hunger/energy identical
before and after). Setup state itself explains the old
fixture: a fresh village's cistern holds 20L against a
~24L/day drain — waterDays 0.83 at setup, so WATER
dominates by default.

- A MILD (hunger 30, cistern filled, pantry 47,250):
  HUNT 76/300 (25.3%) — EXPLORE 26, SEEK 82 (the
  'understand' goal's 2.0 SEEK bias), HAVEN_CHORE 71,
  VISIT 45. No WATER, no FORAGE (no need signal, so
  neither candidate entered). For a villager without the
  SEEK bias and without the wanderer EXPLORE gate, the
  same 2.0 weight against CHORE 1.4 + VISIT ~1.2–2.0
  would be roughly 35–45% — the 2.0 weight is not a
  whisper when needs are quiet; it is a whisper only
  next to a dry cistern.
- B DRY (hunger 30, cistern emptied, waterDays 0):
  HUNT 37/300 (12.3%) — WATER 163 (54%), matching the
  funnel sense fixture's 11% (HUNT 22/200, WATER 90/200)
  under its own dry cistern. The 11% figure is a
  dry-cistern figure, not a universal offer rate.
- C HUNGRY (hunger 80, pantry 47,250): EAT 50/50 —
  deterministic pre-gate proof. With pantry ≤ 500 the
  probe asserts EAT never appears (pre-gate-only
  reading); the branch taken here was the > 500 one.

Conclusion of the audit: the binding break is correctly
named (the lottery), but its mechanism is need-dominance
plus a flat HUNT weight, not a broken lottery. A grudge
lever must therefore do exactly two things and no more:
(a) raise HUNT's weight when the grudge is strong AND
needs are mild, so it wins the chore/visit mornings;
(b) leave genuine-need mornings alone — dry-cistern
WATER picks and pre-gate EAT/REST picks must keep
winning, or the fix manufactures irrational villagers.

## Design — the character-driven grudge want (build-ready)

Integration point (the ONLY game-code change proposed):
`src/js/villager-objectives.js`, `objPick`, the HUNT
candidate push — today:

    if (huntSite) cands.push({ kind: 'HUNT', w: 2.0, site: huntSite });

becomes a weight computed from the villager's own
fight memory and character — no new candidate, no new
gate, no gate retune, no roster or list feed anywhere
(perception law: the input is the villager's own
monsterSightings entry, written when THEY fought; the
candidate function already enforces that only the
knower is offered). Nothing else in `objPick` changes:
pre-gates, WATER/FORAGE weights, chore/visit weights,
departure gates, and the 3-day freshness gate are all
untouched.

Grudge weight (preregistered formula — see draft prereg;
the building arm must not re-tune it mid-run):

    huntW = 2.0 + recencyBonus + temperBonus, capped at 5.0,
    then zeroed-bonus if frightened (below).

- Recency (age = current day − memory day; candidate
  already guarantees 0–3): age 0 → +1.5; age 1 → +1.0;
  age 2 → +0.5; age 3 → +0.0. Recency shapes the want;
  it does not extend freshness — a day-4 memory is
  still unofferable.
- Temperament (`npcTemper`, vocabulary in
  src/data/characterGen.json temperaments: steady, bold,
  cautious, warm, prickly, restless, dry, gentle, intense,
  withdrawn; any other value → +0.0):
  bold / prickly / intense → +1.5; steady / restless /
  warm / dry → +0.5; cautious / gentle / withdrawn →
  +0.0. Temperament is who they are, not a grudge meter
  — it bends the want, it never creates one.
- Frightened (needs.fear at pick time): fear > 60 →
  both bonuses are 0 (huntW = 2.0). A terrified
  survivor does not go back to settle a score; the
  want waits for a calmer morning.
- Cap 5.0. Worked examples (mild-need mornings, total
  competitor weight ~3–6): a bold villager on the fight
  day (2.0 + 1.5 + 1.5 = 5.0, capped) wins roughly
  half its offered picks — sometimes, never always
  (Steve's invitations ruling, applied to hunts). A
  cautious villager on day 3 (2.0 + 0 + 0 = 2.0) is
  unchanged from today. A dry-cistern morning (WATER
  7–8.5 + chore + visit ≈ 10+) still beats even a
  capped 5.0 grudge most draws — thirst dominates, as
  it must. A hungry morning never reaches the lottery
  at all — EAT pre-gate unchanged, as it must.

What this design deliberately does NOT do (so the
building arm does not smuggle it in):

- No pre-gate bypass: a grudge never jumps the REST/EAT
  queues, never beats a dry cistern by weight alone,
  never offers a homebody a hunt (candidate null).
- No damage scaling: the sighting store carries only
  [mid, tx, ty, day, part] — damage dealt is not in the
  memory, so no "wounded-beast grudge" variant is
  buildable from this store without a schema change;
  not proposed.
- No departure or arrival fix: a converted pick still
  faces departure lag (pick d135 → depart d137 in the
  band's one attempt), same-day supersession, and the
  91% empty-tile arrival rate. This arm moves picks,
  not meetings — the draft prereg's meetings leg is
  therefore the honest stretch (see "Honest warning").
- No narration change in this arm (the picked-but-
  never-left beat and the silent empty arrival stay
  documented blanks for the ghost/narration arm).

Recorder gap (for the building arm's instruments, not
a game change): the funnel recorder captured candidate
+ gates but no need state. The building arm's pick
recorder must add, per pick: hunger, energy, fear,
pantryKcalLive, waterDays, and a pre-gate flag (did
the pick return before the lottery, and by which
gate). Without that, the next funnel cannot tell a
pre-gate EAT from a lottery loss — the exact
distinction this audit had to reconstruct from code.

## Draft preregistration (UNJUDGED — for the building arm)

The following is ready to be committed verbatim as the
building arm's prereg BEFORE its pilot. It is NOT in
effect now: no judged run has been made under it, and
this arm will not run one. If the building arm changes
any line, it must re-freeze and re-commit before its
first judged row; a miss under it is NO-GO, never
re-scored.

- Substrate: tableseat-nowait, 180d death-aware, as in
  returns-a / funnel-a.
- Pilot band: seeds 75101–75108 (8 seeds). Confirm band
  if pilot GO: seeds 75101–75116 (16 seeds). Control =
  identical-seed paired tables on the pre-change code
  (MEASUREMENT.md §15 substitute; balance-panel has no
  census-ingest mode — no panel artifact to be faked).
- Game change (frozen): the grudge weight formula above
  and nothing else in `objPick`; no gate, weight, or
  pre-gate change anywhere else. Proof tests before
  pilot: (i) weight-table fixture (temper × age × fear
  grid, exact values); (ii) lottery-draw before/after
  under mild vs dry conditions (mild HUNT share up,
  dry WATER share essentially unchanged); (iii)
  `node scripts/check.js --quick` green (with the
  --cacheDirectory rule from the assignment).
- PRIMARY (pilot GO requires ALL): deliberate wave-4
  HUNT picks > 0 AND deliberate meetings > 0 on the
  pilot band. "Deliberate" = the returns-a definition
  (pre-meeting HUNT travel record for that beast +
  prior fight memory), counted by the returns/funnel
  recorders, not inferred from outcomes.
- COST BARS (pilot GO requires ALL): starvation deaths
  ≤ control + 2 on band totals; zero need-override
  deaths attributable to the change (a HUNT departure
  on a morning the villager was pre-gate hungry/thirsty
  — impossible by construction, verified from the
  pick recorder's need fields); wall not worse than
  control on wins and on national-ever.
- DIAGNOSTIC (reported, not deciding): HUNT take rate
  over candidate-present picks, split pre-gate vs
  lottery (the split this audit establishes); HUNT
  picks by temper/age cell; departure and arrival
  outcomes of converted picks (lag days, empty-tile
  share).
- Honest warning, recorded before any run so it cannot
  be re-scored away: at the returns-a 91% empty-tile
  arrival rate, converting picks to departures does not
  convert departures to meetings — even perfect pick
  conversion on 8 seeds may yield 0 deliberate meetings
  by arrival luck alone. If the pilot moves picks
  clearly but meetings stay 0, the verdict under this
  prereg is still NO-GO on the primary, and the correct
  next step is the empty-tile arrival arm (perception-
  lawful tracks/sound/following design, DIAG first),
  not a bigger grudge weight. The coordinator may
  choose, BEFORE committing this prereg, to split the
  primary (picks leg vs meetings leg) — that is a
  coordinator call to make in the open, not a
  mid-run revision.

## Second-ranked item: NOT taken

The assignment ranks empty-tile arrival diag second,
"only if the lottery kills fast." The lottery did not
kill fast — it stopped on file ownership before any
build. Starting the arrival diag now would be a second
workstream opened after a stop condition, and its
design (tracks/sound/following) deserves its own
prereg and its own arm. It is left untouched for the
coordinator to assign; nothing in this file pre-empts
it, and the arrival numbers it would start from are
returns-a's (297/326 true drops, 91%; wave-4 1/1).

## What was NOT done (so the coordinator is not misled)

- No `src/js` diff on this branch from this arm (verify
  with git status / git diff before merging the
  evidence + probe below).
- No pilot, no confirm, no wall numbers, no take-rate
  claim beyond the fixture probe above (which is a
  single-villager, single-memory audit fixture, not a
  sim band — its percentages describe the lottery
  under stated conditions, not the village).
- No funnel re-run (forbidden by the assignment; the
  funnel corpus was read, not reproduced).
- No sim-w4dpr2 recovery (Loop A's next run owns it;
  its partial corpus was not read and not run).
- No change to any forbidden file, no change to any
  other worker's tree or branch, no merge, no push,
  no version bump, no live check.

## Files in this delivery (worktree gaps-grudge)

- scripts/test-grudge-audit.js — audit probe
  (GRUDGE-AUDIT PASS: mild HUNT 76/300, dry HUNT
  37/300, hungry EAT 50/50; node --check clean).
- evidence/2026-10-29/sim-grudge-a.md — this file
  (audit + design + draft prereg).

## Commits

- Branch tip and hashes are in the worker's report to
  the coordinator (this file + the audit probe commit
  together); the tip at report time is the authority.
