# sim-axearrival-a — the axe arrival, dated and traced (backlog #1587)

Run: oversight-flesh-out-loop, run fleshout-20261031T0415Z,
arm sim-axearrival-a, axis food-economy. Worktree
sim-axearrival-a. DIAG ONLY: measurement, zero src/js
changes, zero policy-default flips, zero edits to any
existing policy file, driver, analyzer, or proof file.
New files only: the recorder driver, the analyzer, the
proof, the prereg + addendum, this evidence file, the
census JSONs, and the corpora below. Sibling worktrees
never touched. Main tree never touched. Nothing is merged
by this worker (the coordinator merges); report status:
commit hashes + proof counts + verdict below. The
coordinator marks backlog item #1587 at closeout — this
worker does NOT edit
hidden_files/sim-findings.md.

## Answer in one paragraph (plain words)

The axe does not arrive between days 15 and 17. It arrives
ON day 15, in the middle of the day, from a dead man. The
stranded villager wakes on day 15 still holding only its
Stone knife, tries its morning tree-cut and is refused for
want of an axe, then during the day's routine takes a
hatchet — along with bark armor, good boots, a fusion
pellet, a hand saw, and snare wire — from the body of
Ethan, who died in an ambush four days earlier. The next
morning the villager holds the hatchet but is too hungry
to swing it; the morning after that, fed, it fells a giant
in one cut, fills its pack — and still sleeps out, because
the felling ate the hours the bridge needed. The "arrival
between days 15 and 17" was never a gap in the game. It
was a gap in the record: the earlier corpus recorded no
inventory per morning, so a day-15 loot looked like a
day-17 mystery.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-30/sim-axearrival-a-prereg.md (commit
c4b577f10), plus evidence/2026-10-30/
sim-axearrival-a-prereg-addendum.md (commit 66b795d02,
written after the pilot and BEFORE any judged leg: the
corpse-take wrap set widened — see Instrument notes; bars
unchanged). Pinned base ae15fd8f1 (worktree HEAD at
prereg writing time; prereg, addendum, instrument, and
corpus commits add tooling/evidence only, so all legs run
on pinned-base game code verbatim — verified by the
proof's tracked-diff guard: src/ + scripts/policies/
diff empty vs ae15fd8f1).

DIAG verdict, judged exactly as written — DIAG-GO iff
(a) the recorder runs COMPLETE for days 7-20 on seed
15215 (morning + evening snaps for every loop-day whose
game day falls in 7..20, every snap carrying a non-null
axe read, recorder errs 0), AND (b) the axe arrival is
identified as a DATED, EVENT-TRACED mechanism (first-axe
day, bracket, taxonomy class not 'unknown', quoted day
line or wrap entry inside the bracket — 'day 17 fell
succeeds' alone is never a mechanism), AND (c) a
determinism re-run reproduces the SAME arrival day AND
mechanism. DIAG-NO-GO otherwise.

## Trajectory under test

The strandfix-morning-b VARIANT leg, not the warmed-only
stack: strandfix(warmed(woodcarry(nighttravel))) with
STRANDFIX=1, WOODWARM=1, POLICY=nighttravel,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, DAYS=30. The axeacq bank ON
leg (warmed only) never acquires on 15215, so the
warmed-only stack cannot answer this question — the
arrival lives on the variant trajectory. A control leg
(STRANDFIX=0, WOODWARM=1, seed 15215) ran for contrast
only; it is NOT judged.

## Instruments

- Recorder driver: scripts/axearrival-trace-a.js (adapted
  from scripts/strandfix-trace-b.js, variant stack
  verbatim, plus axeacq's axeSnap per morning AND per
  evening, full day lines every loop-day, and log-only
  wrappers around lootCorpse / corpseLootAll /
  corpseTakeItem / equip / unequip / alienLootGrant).
  The recorder never calls a state-editing verb and never
  calls getPerson on NPCs (vessel only).
- Analyzer: scripts/analyze-axearrival-a.js (pure reads:
  snap sequence, first-axe scan, bracket, taxonomy
  classification from bracket evidence only).
- Proof: scripts/test-axearrival-a.js (see Proof).

## 1. PILOT GATE — PASS (gate only, never judged)

SEEDS=15215, variant ON, into
sim-axearrival-a-corpus-pilot: file present, recorder
errs 0, window complete, strand nights 7-17 (11),
strandfix attempts 8. Recorder-neutrality comparison for
15215 vs the morning-b variant ON corpus: creek 12 /
still 11 / rescued 1, still days 7-17, warmth acted 8,
strandfix attempts 8 — IDENTICAL on every count. The
recorder additions (evening axe snaps, full day lines,
log-only wrappers) did not perturb the trajectory.

## 2. THE JUDGED LEG — MORNING/EVENING AXE TABLE, DAYS 7-20

Seed 15215, variant ON, vessel gen_gyft62f throughout (no
vessel change, no bearer death — succession is ruled out
by the record itself, not by assumption). Spawn: bare
hands, no hatchet in pool or stash (poolHatchet false).
Evening snaps carry the same axe fields as mornings; the
table below is the analyzer's window output (gameDay =
loopDay on this trajectory).

| day | morning tier / hatchet | evening tier / hatchet | strandfix morning | evening state |
|-----|------------------------|------------------------|-------------------|---------------|
| 7 | none / no | whittle / no | — (haven departure) | creek, still |
| 8 | whittle / no | whittle / no | pack-ready skip | creek, still |
| 9 | whittle / no | whittle / no | pack-ready skip | creek, still |
| 10 | whittle / no | whittle / no | attempt, tool-gate | creek, still |
| 11 | whittle / no | whittle / no | attempt, tool-gate | creek, still |
| 12 | whittle / no | whittle / no | attempt, kcal-floor | creek, still |
| 13 | whittle / no | whittle / no | attempt, tool-gate | creek, still |
| 14 | whittle / no | whittle / no | attempt, tool-gate | creek, still |
| 15 | whittle / no | FELL / YES | attempt, tool-gate (morning) | creek, still |
| 16 | fell / yes | fell / yes | attempt, kcal-floor | creek, still |
| 17 | fell / yes | fell / yes | attempt, fell +5, pack-ready | creek, still (ticks 23) |
| 18 | fell / yes | fell / yes | — | creek, RESCUED (return) |
| 19 | fell / yes | fell / yes | — | haven |
| 20 | fell / yes | fell / yes | — | haven |

Window completeness: 14/14 evenings in gameDays 7-20
carry a morning snap AND an evening snap, every snap
with a non-null tier + canFell, recorder errs 0. Bar
(a) HOLDS.

## 3. THE ARRIVAL — DAY 15, INTRADAY, CORPSE LOOT (Ethan)

First-axe snap: loopDay 15 / gameDay 15, EVENING.
Bracket: intraday loopDay 15 (morning snap whittle /
no hatchet -> evening snap fell / hatchet, same vessel
gen_gyft62f). Mechanism: LOOT. Evidence inside the
bracket, three independent pieces agreeing:

1. Wrap entry (corpseLootAll, the batch corpse-take
   path in src/js/corpses.js): loopDay 15, gameDay 15,
   args ["corpse_11_d5kxda", function], before
   {hasHatchet: false, tier: whittle, canFell: false}
   -> after {hasHatchet: true, tier: fell,
   toolName: Hatchet, canFell: true}. The corpse id's
   day-11 stamp matches the death record below.
2. Quoted day lines (loopDay 15, in order):
   - "Taken: Hatchet x1, Bark armor x1, Good Boots x1,
     Fusion pellet x1, Hand Saw x1, Snare wire x1."
   - "You take hatchet, bark armor, good boots, fusion
     pellet, hand saw, snare wire from Ethan. Your hands
     know what they did. (+4 trauma)"
   - "The body is stripped. What's left isn't worth
     taking."
3. Death record: {day: 11, kind: person, who:
   ethan_hunt, cause: ambush, player: false} — Ethan
   died day 11; his body was looted four days later, on
   day 15, while the villager was still stranded.

Bar (b) HOLDS: dated (day 15), event-traced (wrap entry
+ quoted lines), taxonomy class loot (not 'unknown'),
and NOT merely "day 17 fell succeeds" — day 17 is two
days downstream of the arrival (see §4).

## 4. THE CHAIN, DAY BY DAY (why day 17 looked like the arrival)

- Day 15 morning: strandfix attempt fires, already-fed
  (234 kcal), cutTree on the adjacent bigtree refuses
  with the engine's own hint line ("Your Stone knife
  can't fell a giant — it takes branches, not trunks.
  You need an axe."), 2 ticks, wood unchanged. The
  villager does NOT hold an axe at any point that
  morning.
- Day 15 day: routine travel (wetland, then creek) and
  the Ethan loot above. Evening: still stranded on wood
  (pack 1 log, bridge needs 4), warmth fire lit.
- Day 16 morning: hatchet HELD (fell tier) — but morning
  kcal 0, no known food in the wake 3x3, food phase
  skips, wood phase stops at kcal-floor (walk 3 steps,
  no verb). The axe is present and unusable: the gate
  that morning is kcal, not tool. Evening: 0 logs.
- Day 17 morning: already-fed (2368 kcal), one fell
  (0 -> 5 wood, 80 kcal, 96 ticks, pack-ready). Evening:
  still stranded on ticks alone — "No bridge tonight —
  23 ticks left in the day, and a bridge takes 96
  ticks." Day 18: rescued return to haven.
- The morning-b reading ("whittle days 10-15, fell day
  17") is therefore exactly what this record predicts:
  day 15's morning hint line is the LAST whittle morning
  (the loot happens after it), day 16's hatchet is
  invisible to a fell-attempt record (no verb fires),
  and day 17 is the first morning a fell CAN fire — not
  the morning the axe arrived.

## 5. DETERMINISM — BAR (c) HOLDS

Determinism leg (SEEDS=15215, variant ON re-run, into
sim-axearrival-a-corpus-determinism): corpus file
BYTE-IDENTICAL to the judged file (cmp clean). Same
arrival day (15) and same mechanism (loot) by
construction of byte-identity, and re-analyzed
independently (census-determinism: firstAxe loopDay 15,
mechanism loot). Bars (a), (b), (c) all hold.

## VERDICT — DIAG-GO

(a) recorder complete days 7-20, errs 0; (b) arrival
identified as day-15 intraday corpse loot from Ethan
(wrap entry + quoted lines + day-11 death record);
(c) determinism re-run byte-identical, same day +
mechanism. The backlog item's blank is filled: the axe
arrived by looting Ethan's body on day 15. No game
change is proposed, landed, or enabled by this arm — a
GO verdict certifies the DIAGNOSIS, not a fix.

## 6. CONTROL CONTRAST (not judged)

Control leg (STRANDFIX=0, WOODWARM=1, seed 15215):
strand nights 7-16 (10, matching morning-b control ON),
NO axe at any morning/evening snap in 30 days, survived
30 days. The arrival is variant-trajectory-specific: the
control villager returns day 17 without ever holding an
axe, while the variant villager's longer exile (to day
18) includes the day-15 loot. This contrast is reported,
not explained: the corpora do not show why the control
trajectory never meets Ethan's body (the control
villager's day-15 routine differs from the variant's
from the first fed morning on), and this arm does not
guess at it.

## 7. BANK CHECK (report only, never judged, never pooled)

Variant ON stack, DAYS=30, seeds 15003, 15220, 15337 —
all survived 30 days, recorder errs 0, window complete
on all three:

| seed | strand | axe by day 20 | mechanism / note |
|------|--------|---------------|------------------|
| 15003 | 0 nights | none in 30 days | no axe at any snap |
| 15220 | 0 nights | none in 30 days | no axe at any snap; evenings inside haven 30/30, so no field-loot opportunity on this stack (axeacq's day-18 loot for 15220 was on the warmed-only stack — different trajectory, not a contradiction) |
| 15337 | 0 nights | YES, day 1 (gameDay 2 evening) | STASH-FETCH (see below) |

15337 stash-fetch, in full: spawn pool stashed
[snare_wire, hatchet, bark_armor], vessel gen_alellhj.
LoopDay 1 evening: hatchet + bark_armor carried, with
the line "You remember the Hatchet at your space in the
haven and fetch it — it rides in your pack now."
LoopDay 2 morning: hatchet + bark_armor EQUIPPED, pool
stashed [snare_wire] — the shrink confirms the fetch.
This is a haven stash-fetch routine, NOT a combat
gearUp equip() call (no equip wrap entry fires) — which
is why the pre-fix classifier called it 'unknown' (see
Instrument notes). Caveat, stated plainly: axeacq-b
found 15337's stashed hatchet never held on the
warmed-only stack at an older base; the fetch fires here
on this base + variant stack. Whether the difference is
base drift, stack, or trajectory is NOT established by
these legs — the check seeds are n=3 report-only, and
this evidence claims no general stash-fetch rate.

## 8. SENSE-TEST (law — day 15 read end to end, judged for meaning)

Day 15 reads as one coherent, person-shaped day. It
opens with the morning refusal (the strandfix attempt's
own hint line), then travel, a Rut King following
("It followed you" twice — presence without a forced
fight), a forage of unknown shoots and berries honestly
marked "Not food until identified", the return to the
creek, and the loot: a Taken list, a named taking from
Ethan at a trauma cost (+4), and the stripped body. The
evening refusal is honest about wood ("the pack holds 1
log, and a bridge needs 4"), and the warmth fire lights
afterwards. PASS on mechanism: the taking is deliberate
and costly, not a counter incrementing. One wrinkle, same
class as axeacq's loot note, not a verdict failure:
nothing in the lines says where Ethan's body was found
or that the villager sought it — the loot appears
mid-routine between a forage and a "Nothing edible"
line. A player understands WHAT happened (took a dead
man's kit at a cost) but not WHY the body was there.
No static or repeated villager routines beyond that
single gap; no teaching lines appear in this transcript.

## 9. WALL NUMBERS (structural window values, not a wall verdict)

30-day pre-seat strand trajectory, same structural
window as the strand arms: national 0, table 0, wins 0
on every leg (no national/table/win content in the
window). Median survival 30 days (ceiling — all seeds
survived the window on every leg; banking selection,
not a survival claim). Wave reach (judged leg, 15215):
no new content reached by a game change (no game change
landed — recorder only).

## Proof

scripts/test-axearrival-a.js: 46/46 checks pass with
--require-corpus, including: static ladder facts
(hatchet is the ONLY fell-tier item in items.json;
stone_knife whittle; no 'hatchet' string in
recipes.json); classifier fixtures (loot, succession,
vessel-change-without-death -> unknown, stash-equip,
equip-without-pool-shrink -> unknown, fell-line-alone
-> unknown, grant, stash-fetch, loopDay-1 spawn->evening
intraday bracket); analyzer fixture (intraday loot
bracket + window completeness + strand nights); corpus
checks (all 5 corpora present, recorder errs 0 on every
file, judged + pilot window complete, determinism
byte-identical for 15215, src/ + scripts/policies/
diff empty vs pinned base ae15fd8f1).

## Instrument notes (disclosed)

1. Pilot wrap gap: the pilot driver wrapped lootCorpse /
   equip / unequip / alienLootGrant only. The pilot's
   day-15 loot lines matched corpses.js corpseLootAll's
   batch path verbatim, and no lootCorpse wrap entry
   fired — because the loot call IS corpseLootAll, not
   lootCorpse. The addendum (pre-judged) widened the wrap
   set with corpseLootAll + corpseTakeItem; the judged
   leg's wrap entry (§3.1) is the payoff. Pilot files
   (narrow wrap set) are never mixed into judged corpora.
2. Post-legs analyzer fix (analysis-only, no corpus or
   driver change): the classifier's loopDay-1 bracket
   treated spawn->evening-loopDay-1 as an overnight and
   therefore never searched the loopDay-1 evening row's
   lines, and it had no stash-fetch class — so 15337
   first classified 'unknown'. The fix treats spawn as
   the loopDay-1 morning state (intraday bracket) and
   adds stash-fetch (fetch line + pool shrink). Re-run
   analyzer output for judged 15215 is UNCHANGED on
   every verdict field (firstAxe, windowComplete,
   strandNights, recorderErrs verified field-by-field
   against the pre-fix census). The fix changes no
   judged number; it only corrects the check-seed
   classification.
3. Recorder coverage limit, stated: loopDay 1 has no
   separate morning snap by driver design (callIdx>1
   gate inherited from the strand drivers); the spawn
   snap is the loopDay-1 morning state, and the fix in
   (2) makes the analyzer honor that. No judged arrival
   sits on loopDay 1, so the limit never touches the
   verdict — but any future arm judging a day-1 arrival
   must state this bracket rule in its prereg.
4. Evening axe snaps carry no pool read (pool reads stay
   on morning + spawn snaps, to keep mid-day wrap
   entries cheap and read-only). Pool shrink for an
   evening arrival is therefore read off the NEXT
   morning's pool, as in §7's 15337 case.
5. After every safe-commit, the known index-clobber
   variant hit (worktree file byte-identical to HEAD but
   staged as changed/deleted) and was repaired via
   cacheinfo from the HEAD blob; every commit's content
   was verified against `git show --stat HEAD` before
   proceeding. The commits are correct; only the main
   index lied (four times on this arm).

## Metric review

- The three DIAG-GO bars bound the run and were met
  without re-scoring: completeness is a snap count, the
  mechanism is a bracket + quoted evidence, and
  determinism is byte-identity. No metric was swapped
  mid-run; the two instrument changes (wrap widening
  pre-judged, analyzer bracket fix post-legs) are
  fidelity fixes, not threshold changes, and the judged
  fields are verified unchanged across the second one.
- The 'unknown' class did its job: it caught the
  classifier's loopDay-1 gap on a check seed instead of
  letting a fell line or a fetch line pass as a named
  mechanism. A future prereg reusing this taxonomy
  should list 'stash-fetch' as a first-class class from
  the start (haven fetch line + pool shrink), alongside
  loot / succession / stash-equip / grant / trade-gift
  / craft.
- The bank-check horizon note: 15003/15220 show no axe
  in 30 days on this stack, but axeacq showed arrivals
  at days 31+ on fresh seeds — a 30-day check cannot
  rule out later arrivals on these seeds, and this
  evidence does not claim it does. The check answers
  only "any axe-by-day-20 channel fires there" (15337:
  yes, stash-fetch day 1; others: no).
- No metric revision is proposed for the window
  definition (gameDays 7-20), the bracket rule, or the
  GO bars: they separated the arrival cleanly (day-15
  loot, day-16 kcal gate, day-17 fell) instead of just
  "axe present by day 17".

## Out-of-scope observations (NOT chased; for the coordinator's backlog)

- [open] 2026-10-31 — food-economy/tool-acquisition —
  HAVEN STASH-FETCH EXISTS ON THIS BASE (this arm,
  check seed 15337): a vessel fetches its stashed hatchet
  (and bark armor) from its haven space on loopDay 1 via
  a routine line, not via equip(). Axeacq-b's "stashed
  hatchet never equipped" finding was on an older base +
  warmed-only stack; whether fetch fires generally, and
  why it fired here, is unmeasured. (evidence: this
  file, §7; bankcheck corpus, 15337 loopDay 1-2.)
- [open] 2026-10-31 — instruments — CORPSE LOOT HAS TWO
  VERBS (this arm): routine corpse-taking goes through
  corpseLootAll (batch), not lootCorpse (search verb).
  Future loot recorders must wrap both, plus
  corpseTakeItem, or they will miss the batch path the
  way the pilot did. (evidence: this file, Instrument
  notes §1.)
- [open] 2026-10-31 — narration — LOOT ENCOUNTER
  UNVOICED (this arm, sense-test): the day-15 loot lines
  name the taking and its cost but never say where the
  body was found or that the villager sought it. Small
  narration gap, not a behavior claim. (evidence: this
  file, §8.)

## Files

- Prereg: evidence/2026-10-30/sim-axearrival-a-prereg.md
  (commit c4b577f10); addendum:
  evidence/2026-10-30/sim-axearrival-a-prereg-addendum.md
  (commit 66b795d02)
- Evidence (this file): evidence/2026-10-30/
  sim-axearrival-a.md
- Recorder: scripts/axearrival-trace-a.js; analyzer:
  scripts/analyze-axearrival-a.js; proof:
  scripts/test-axearrival-a.js (46/46)
- Censuses: evidence/2026-10-30/
  sim-axearrival-a-census.json (judged),
  sim-axearrival-a-census-control.json,
  sim-axearrival-a-census-bankcheck.json,
  sim-axearrival-a-census-determinism.json
- Judged corpus: evidence/2026-10-30/
  sim-axearrival-a-corpus-variant-on (15215)
- Determinism: evidence/2026-10-30/
  sim-axearrival-a-corpus-determinism (15215 re-run,
  byte-identical)
- Control (contrast only): evidence/2026-10-30/
  sim-axearrival-a-corpus-control-on (15215, STRANDFIX=0)
- Bank check: evidence/2026-10-30/
  sim-axearrival-a-corpus-bankcheck (15003, 15220, 15337)
- Pilot (gate-only, never judged): evidence/2026-10-30/
  sim-axearrival-a-corpus-pilot (15215)
