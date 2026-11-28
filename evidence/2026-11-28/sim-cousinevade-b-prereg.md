# sim-cousinevade-b — PREREG (diagnostic classification of the cousin evade, #2504 program)

**Arm:** sim-cousinevade-b · **Loop B run:** fleshout-loop-b-20261128T0830Z,
axis winnability-chain · **Worktree:** `~/workspace/worktrees/sim-cousinevade-b`
**Frozen:** 2026-11-28 08:58 UTC, BEFORE any judged classification.
**Type:** DIAGNOSTIC ONLY — no new sims, no game-code change, no policy change.
**Corpus (frozen, existing, committed on HELD branches — read-only via
`git show`, never checked out, modified, merged, or rebased):**
- Fleerepair build leg FIELD corpus: `sim-fleerepair-b` tip `7f228e1e5`,
  `evidence/2026-11-28/perseed-fleerepair-b-field-build/` (8 seeds,
  band 112301–112308) — `sim-fleerepair-b.md` build leg.
- Emptybow armed leg FIELD corpus: `sim-emptybow-b` tip `2d205acb0`,
  `evidence/2026-11-28/perseed-emptybow-b-field/` (8 seeds, same band)
  — `sim-emptybow-b.md` armed leg.
- Read-only extracts for analysis live at
  `/tmp/sim-cousinevade-b-corpus/` (extracted via `git archive` from the
  two tips above). Source corpora are NEVER copied into this repo/branch.
  The rejudge baseline corpus (uncommitted, owned by the sibling rejudge
  worker) and any other uncommitted data are NOT used.
- Substrate (from the two evidence files, identical seeds, 150d
  death-aware): `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 SPEARGATE=1 BOWOPEN=1`; `FLEEGUARD`, `FLEEREPAIR3`,
  `DOORFLEE2` OFF; carriers `FIELDCAPDMG` / `RAGEFREE` / `FREESTRIKE`
  asserted OFF. Build leg adds the fleerepair TB/field fix
  (`273c1be43`); armed leg adds the emptybow ammo-awareness policy fix
  (`40f04fe1`) on top of it. Policy competent verbatim in both legs.

**Question (finding #2504, the cousin evade; 2026-11-28 update in
`sim-findings.md`, claimed by this arm):** on fresh band 112301–112308,
27 of 37 launched wave-4+ expedition meetings end in pre-fight
awareness evades (rounds 0, no contact), all with trick unknown —
nearly three-quarters of launched meetings; build leg 23/36, armed leg
19/28. The prior classification arm (sim-evadeclass-b, band
103601–103608) found 3/3 WISE and exonerated the evade on that band —
but that was n=3. This arm runs the same program on n=42: was each
evade WISE (the party sensed a fight it could not win) or a WASTED
LAUNCH? The classification answers that per meeting from what the
party knew at the meeting instant: trick known (per monster kind),
lead HP, party size, party HP. Build on sim-evadeclass-b; do not redo
it — its dimensions, verdict rules, and leave-counter override are
reused frozen below, with the differences named in "Changes vs
evadeclass-b".

## Evade definition (frozen)

A **launched evade meeting** is a `v4encounters` row with
`origin === 'expedition'`, `wave >= 4`, `rounds === 0`, `outcome ===
'evade'` — the fleerepair analyzer's (`scripts/analyze-fleerepair-b.js`
`analyzeFile`/`analyzeDir`, reused verbatim for the population) pool
definition. This is the same population the two source evidence files
count (build pool 36 = fought 13 + evades 23; armed pool 28 = fought 9
+ evades 19).

**Population check (frozen):** a pre-freeze probe of this definition on
the frozen corpora yields **42 launched evade meetings (23 build, 19
armed)**. The classifier MUST reproduce exactly this count or FAIL
LOUDLY (instrument drift) — the population is a fact about the frozen
corpora, not a verdict. All other evade rows in the corpora (none —
every rounds-0 expedition wave-4+ row carries outcome 'evade') are
counted in the species/leg splits for context; there is no unlaunched
evade population in scope here.

**Pre-freeze field-presence probe (facts, not verdicts):** on all 42
evades — `mHpStartRec` present 42/42, `vHpLeft` (lead HP) present
42/42, embedded gate present 42/42, `alliesN` = 2 on 42/42 (meeting
party 3), `trickBefore` false 42/42, `trickAfter` false 42/42,
`mHpStart` null 42/42 (by recorder design). No verdict value was
computed before this freeze.

## Classification fields (frozen, per meeting)

| Field | Source in the corpus |
| --- | --- |
| leg / seed / day / vid / mid (species) / wave | encounter row |
| launchDay / launchTarget / launchPartySize / launchPartyKillers / launchPartyArmed | joined launch (see Launch join below) |
| targetMatch | mid == launchTarget (false when no launch joins) |
| meetingPartySize | `alliesN + 1` (vid + sensed allies at the meeting) |
| gate.sensedSize / gate.partySize / gate.allArmed / gate.allArmored / gate.planStage / gate.planTarget | embedded gate snapshot on the encounter row (staleness caveat from evadeclass-b carries: the snapshot is the last gate call for that vid, not necessarily this monster's gate — the launch row, not the snapshot, decides targetMatch) |
| trickBefore / trickAfter | encounter row (`Game.villageKnowsTrick(mid)` before/after the meeting) |
| trickKnownByLaunch (corpus-visible, per monster kind) | TRUE iff any `v4gates` row (same seed, same mid, day ≤ launchDay, trickKnown true) OR any `v4encounters` row (same seed, same mid, day < launchDay, trickAfter true) exists. Absence means "no corpus record shows it known by launch" — the village could have learned it through an unrecorded channel (e.g. Haven tales); that caveat is carried, never papered over |
| trickKnownByMeeting (corpus-visible, per monster kind) | same lookup with the meeting day in place of the launch day (day < meeting day) — whether the village knew this kind's trick when the party actually met it |
| monster HP at meeting | `mHpStartRec` — CONTACTREC's `rec.mHpStart` on the row. `mHpStart` itself is null by recorder design for no-contact rows; `mHpStartRec` IS carried for evades (wave-4-band values) and is the HP field for this classification |
| lead HP at meeting | `vHpLeft` on the encounter row (the lead fighter's HP at the meeting instant) |
| party HP at meeting | **NOT in the corpus beyond the lead.** Allies' HP is recorded nowhere on the encounter, gate, depart, or seed row. Recorded per meeting as "lead HP only; party HP not in corpus" — never invented, never summed from a guess. The gate's `allArmed` / `allArmored` booleans are the only party-readiness proxy, and are reported as such |
| log line | encounter row `log[0]` (the player-visible line) |
| origin | encounter row (`expedition` expected) |
| leaveCounter | mid == 'suburb' — the ONLY leave-counter species in this tree: the Suburb's trick is 'Leave. Navigation is victory' (`src/js/game.js:36377`, "You cannot kill a suburb") and `fieldFights.js:283` returns `{type:'leave', why:'suburb-leave'}` for it; no other species carries a leave-type trick |

**Launch join (frozen — differs from evadeclass-b, see below):** among
`v4departs` rows with `result === 'launch'` in the same seed, take the
LATEST launch with `launch.day <= meeting.day` and `meeting.day -
launch.day <= 21` whose party ([holder vid] + `party`) contains the
meeting vid OR any meeting allyVid; ties on day take the first in file
order. If none joins, launch fields are null and targetMatch is false —
the meeting is still classified (the verdict does not depend on the
launch except for the WASTED targetMatch condition); the join miss is
reported, not patched. The evadeclass-b join required
`launch.target == mid`; that filter is DROPPED here because on this
band launches routinely target a different monster than the one met
(the pre-freeze probe under the old rule left 5 meetings joinless
against launches whose targets were buffering / influencer / eulogy /
eater) — the launch the party is out on is the latest in-window one,
and whether the met monster was its target is exactly what
targetMatch records.

**Distance / terrain (frozen gap, finding #2512 re-verified on this
corpus):** the corpus carries NO distance or terrain field on any
encounter, gate, or depart row — verified pre-freeze by inspecting the
full key sets of `v4encounters`, `v4gates`, and `v4departs` (no
coordinate, distance, or terrain key; `v4seeds` carries plan-node
coordinates only, not meeting locations). No verdict rule below
depends on distance/terrain. Its absence is recorded per meeting as
"n/a (not in corpus)" and documented in the evidence as a recorder gap
— it blocks only the "could the party have closed distance"
sub-question, which no verdict depends on. A verdict is never decided
on distance/terrain grounds, and no distance/terrain value is invented.

## Damage-potential constants (frozen FORM — values computed by the classifier at run time)

- `D_BEST` = max `mDealt` over launched FOUGHT meetings (expedition-
  origin wave-4+ rows with `rounds >= 1`, no-contact excluded) in the
  corpus, both legs pooled.
- `D_TYP` = median `mDealt` over launched fought meetings with `mDealt >
  0`, both legs pooled. The zeros are round-1 flees (the finding #2500
  shape), not damage attempts; the median conditions on the party
  actually fighting, so it is the typical damage of a fighting meeting.
- Per-leg values are reported as a robustness check. Verdicts must be
  invariant across the pooled and per-leg scopes; if they are not, the
  invariance failure is reported and the affected meeting is UNDECIDED
  with that reason.

Rationale for the single-meeting standard: the question is whether THIS
meeting could have been a kill. Damage persists across meetings in
principle (the Eater was wounded to 21 HP by earlier fights on the
allycap band), but the corpus's launched parties essentially never chip
in practice, and every round spent chipping is paid in monster damage
(wave-4 band 35–95/round, pierce 0.2–0.5, canon
`docs/MONSTER-WAVES.md`) against villager-scale HP. A meeting that
cannot kill is a meeting spent taking damage for chip.

## Verdict rules (frozen — reused verbatim from evadeclass-b)

- **WISE** iff `mHpStartRec != null` AND `mHpStartRec > D_BEST`. No
  launched party in this corpus ever dealt that much damage in one
  meeting, so the meeting could not have ended in a kill — and the
  party's own record shows most launched fought meetings end in 0
  damage. The party correctly sensed an unwinnable fight. Trick is
  reported but never decisive alone: a known trick changes HOW a fight
  is won, not whether the HP is reachable.
- **WASTED** iff `mHpStartRec != null` AND `mHpStartRec <= D_TYP` AND
  `targetMatch`. The monster sat at or below the typical damage a
  launched party deals when it actually fights, AND it was the very
  thing the party launched to kill — walking away spent the launch on a
  fight it could plausibly have finished in one meeting.
- **UNDECIDED** otherwise, with the exact reason recorded per meeting:
  HP in (`D_TYP`, `D_BEST`] ("between typical and best — depends on this
  party's own damage, unrecorded"); HP null ("no HP field in corpus");
  HP ≤ `D_TYP` but NOT targetMatch ("finishable non-target — the launch
  is not spent; a missed finish, not a wasted launch"); pooled/per-leg
  scope disagreement; or any other field the verdict needed being absent.
  UNDECIDED with a stated reason IS a classification. UNCLASSIFIED —
  the completeness failure — means a meeting in scope with NO table row
  or NO verdict, and is a bar fail (see C1).
- **Leave-counter special case (frozen):** if `leaveCounter` (Suburb),
  the evade is **WISE by definition regardless of HP** — the canon trick
  for that species IS to leave. This is the only species override.

## Decision rule (frozen — thresholds set BEFORE any classification)

The classification names the next lever by the frozen shares below.
Shares are of the 42 classified evades; WISE share and WASTED share are
computed on the pooled verdicts.

- **Lever A — DAMAGE (the B2 damage question):** if the WISE share is
  ≥ 60% (X = 60), the next lever is raising launched-party damage per
  meeting against wave-4 HP (party damage / gear / ability lever — the
  concrete arm is the B2 follow-up: launched parties deal tens of
  damage per meeting against 850–1500 HP monsters). The evade rule is
  exonerated and is NOT the next lever. A WASTED minority in this
  branch is reported as a secondary finding for the backlog, not the
  next lever.
- **Lever B — ENGAGEMENT (the awareness-evade gate):** if the WISE
  share is < 60% AND the WASTED share is ≥ 25% (Y = 25), the next lever
  is gating the pre-fight awareness evade on winnability: a party that
  senses a monster at or below its demonstrated finishable HP engages
  instead of evading (gate the evade decision on the same D_TYP
  standard, with the leave-counter species exempt by canon). The
  concrete arm is an awareness-gate change in the encounter/sense path,
  not a damage change.
- **Neither branch:** if the WISE share is < 60% and the WASTED share
  is < 25%, NO lever is named — the split is mixed and the next step is
  a deeper diagnostic (e.g. the middle-band UNDECIDED population), not
  a lever. The run still GOes on classification (see C-bars) and reports
  NO-LEVER explicitly.
- Precedence is frozen as written: A is checked first; B fires only
  when A does not. Thresholds X=60 and Y=25 are structural (a clear
  majority for exoneration; a material quarter for a wasted-launch
  program), not fitted to any verdict — no verdict value was computed
  before this freeze.

## GO bars (instrument validity — frozen)

- **C0 population:** the classifier reproduces the frozen population
  exactly — 42 launched evades (23 build, 19 armed). Any drift is FAIL
  LOUDLY (instrument drift), exit 2.
- **C1 completeness:** EVERY launched evade meeting in scope appears in
  the classification table with all frozen fields and a
  wise/wasted/undecided verdict with a reason; ZERO UNCLASSIFIED (no
  row or no verdict). Any omission is NO-GO.
- **C2 splits:** the species split (Suburb/leave-counter vs other) and
  the leg split (build vs armed) are reported, for launched evades and
  (for context) for the fought meetings' damage constants.
- **C3 sense-test:** at least one evade's fight-log line is quoted.
- **C4 proof:** `scripts/test-cousinevade-b.js` green BEFORE the evidence
  is written (verdict fixtures for WISE / WASTED / UNDECIDED branches
  incl. the leave-counter override and the null-HP case, the launch-join
  rule incl. the mismatched-target case, + a corpus-population check).
- **C5 instrument:** if a field a VERDICT RULE requires is missing for
  any meeting — `mHpStartRec` null on a launched evade, or the launch
  join failing to match where the verdict needs it — that meeting is
  UNDECIDED with the exact missing field named, the instrument section
  names the missing recorder field, and the run is **NO-GO on
  instrument**: the gap is documented, fields are never invented and
  knowledge the corpus cannot show is never guessed. (Pre-freeze probe:
  `mHpStartRec`, `vHpLeft`, gate all present 42/42, so C5 is expected
  to pass; the join may miss and is reported, not a verdict blocker.)
- **C6 decision:** the frozen decision rule is applied as written and
  the named next lever (A, B, or explicitly NO-LEVER) is reported.
  Judge strictly against this prereg; a miss is NO-GO, never re-scored.

## Method (frozen)

1. Classifier `scripts/classify-cousinevade-b.js`: imports the fleerepair
   analyzer's `analyzeDir` (population + pool verbatim — the analyzer
   file is copied byte-identical from `sim-fleerepair-b` tip `7f228e1e5`
   into `scripts/analyze-fleerepair-b.js`; it is byte-identical on
   `sim-emptybow-b` tip `2d205acb0`, sha256
   `38315e8eb35124e365d2117bc29f24f65946ce7c7fef7b6ae9ffb4a949028077`),
   computes `D_BEST` / `D_TYP` from launched fought meetings, applies
   the frozen verdict rules and the frozen launch join, emits the
   classification table (JSON + printed table). Defaults read the
   `/tmp/sim-cousinevade-b-corpus/` extracts; corpus dirs are argv
   overridable. The output JSON records per-file sha256 provenance.
2. Proof `scripts/test-cousinevade-b.js`: unit fixtures for the verdict
   function + the launch-join rule + a corpus-population check (42: 23
   build, 19 armed). Green before the evidence is written.
3. Evidence `evidence/2026-11-28/sim-cousinevade-b.md`: the table, wise
   vs wasted split, species split, leg split, verdicts with reasons,
   the named next lever from the frozen decision rule, village
   assessment in plain words, metric review, wall numbers carried from
   the two source evidence files (no new sims; labeled as carried, not
   re-measured — national/table/wins, wave 4–5 unlocks, median survival
   per leg). Telemetry deviation check run and reported.
4. Findings disposition is reported to the coordinator (who owns
   `sim-findings.md`); this arm does NOT edit it. #2504 stays claimed
   by this arm until the coordinator marks it fixed.

## Metric review (pre-run)

- The verdict rules deliberately use the corpus's OWN launched-party
  damage as the standard, not the canon DPS anchor (mid build ~64
  dmg/round, godhood ~220/round, `docs/MONSTER-WAVES.md`) — those are
  player builds, and the evading parties are villagers whose observed
  record is far weaker. Using the anchor would overstate what these
  parties could do and manufacture WASTED verdicts.
- `D_TYP` conditions on mDealt > 0 on purpose: the zero-deal meetings
  are the #2500 flee shape, and including them would set the typical
  damage to 0 and make WASTED unreachable by construction. The
  conditioning is stated here so the judge can see it was a frozen
  choice, not a fitted one.
- The population is 42 — fourteen times the evadeclass-b n=3, but still
  one band (112301–112308) under one substrate. A 42-row classification
  settles what THESE evades were on THIS band; it does not settle the
  evade question corpus-wide. The evidence must say that plainly and
  not generalize beyond the band.
- The leave-counter override may fire (3 Suburb evades in the
  population: 2 build, 1 armed). It stays in the rules; if it fires it
  is a real WISE, not a free pass — the canon trick for that species IS
  to leave.
- The launch join changed vs evadeclass-b (target filter dropped, latest
  in-window launch wins). The change is frozen here with its reason
  (launches on this band routinely target a different monster than the
  one met); the join outcome (how many meetings join, how many are
  target matches) is measured and reported, not assumed.
- Party HP beyond the lead is unrecorded in this corpus — the
  classification carries lead HP (`vHpLeft`) and the gate's
  allArmed/allArmored as the party-state fields. If a future band needs
  true party HP, the recorder must stamp allies' HP on the encounter row.
- The 199-standing stall and the F2 winnable flee (s112308 d146) are
  visible in the source evidence but are NOT this arm's questions; they
  are not re-judged here.

## Changes vs evadeclass-b (so the judge can see what moved)

1. Corpus: allycap band 103601–103608 (n=3) → fleerepair build + emptybow
   armed legs, band 112301–112308 (n=42). Population definition: the
   partysize analyzer's departed-join → the fleerepair analyzer's
   expedition-origin pool (the definition the source evidence files
   count).
2. Launch join: target-equality filter dropped; latest in-window launch
   wins; targetMatch recorded separately. (Old rule left 5 meetings
   joinless on this band.)
3. New frozen fields: lead HP (`vHpLeft`), party HP (lead-only, gap
   named), `trickKnownByMeeting` alongside `trickKnownByLaunch`.
4. New frozen decision rule (X=60 wise → DAMAGE lever A; Y=25 wasted
   with wise <60 → ENGAGEMENT lever B; else NO-LEVER).
5. `UNCLASSIFIED` defined explicitly (no row / no verdict); UNDECIDED
   with a reason is a classification.
