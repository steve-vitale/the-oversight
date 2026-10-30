# sim-sicktele-b — SICKNESS DEATH-TELE GAP, answered (Loop B, 2026-10-30)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1332Z, arm sim-sicktele-b.
Parent: loop-B arm sim-starveplenty-b (run fleshout-loop-b-20261030T1030Z),
evidence/2026-10-30/sim-starveplenty-b.md observation 1; sim-findings #1514.
Related, NOT re-litigated: sim-sicktick-b (landed bab13342b) — the sickness
tick step-up is illness replacement.

Base pin (HEAD at prereg commit): 1e885d62b (prereg commit; parent base
0794a8846). Branch: sim-sicktele-b (worktree ~/workspace/worktrees/sim-sicktele-b).
Prereg (committed BEFORE any judged sweep): evidence/2026-10-30/sim-sicktele-b-prereg.md
(commit 1e885d62b). Zero src/js changes, zero policy-default changes.

## Verdict: DIAG-NO-GO on the pre-registered header — with the mechanism found

Read this verdict carefully, because the two halves point different ways
and both are true:

- THE QUESTION IS ANSWERED: yes, tele death lists undercount deaths vs
  living-count deltas, by a NAMED mechanism (below). On seed 9983 the
  tele list misses 2 of 7 villager deaths (28.6% of villager deaths on
  that seed). The parent's elif observation was a real death, not a
  departure and not a sickness death.
- THE HEADER BAR IS MISSED: prereg clause (d) required the elif-class
  gap to be reproduced OR refuted on a fresh seed. The 8-seed pilot
  contains ZERO elif-class gaps (0 of 81 exits), and the refutation
  branch as written required elif to classify as a non-death exit,
  which it does not — elif is a genuine contest death. So clause (d)
  fails as written, and per §14 the run is DIAG-NO-GO, not re-scored
  into a GO. Clauses (a), (b), (c) all pass. The NO-GO is about the
  bar's calibration for a rare event, not about whether the gap exists.
  The gap exists; the pilot proves it is rare in blind fresh bands,
  not that it is absent. Metric review (below) proposes the
  contest-enriched band the next run should use instead.

## Plain-words answer first

Elif did not die of sickness. She died in a contest — on camera, in
front of the village — and the game said so out loud ("Elif is gone.
The village will say the name for a long time."), but the death was
never written into any of the game's death records: no death tele, no
corpse, no fallen entry. The same happened to Marcus Webb nine days
earlier on the same seed. The reason is a single choke point:
contest deaths for ordinary villagers go through `_cxKillContestant`
(src/js/contests.js), which removes the villager from the roster and
marks the record dead, but never calls `registerDeath` — the one
function that fires the death tele, makes the corpse, and writes the
fallen entry. Every other death path in the game goes through
registerDeath; the contest path for villagers simply doesn't. (The
scholar's own contest deaths DO register, through playerDeath — which
is why the pilot's contest teles are all player:true.)

Why the parent trace looked like a sickness death: Elif was already
dead (contest-killed earlier on day 32) when the day's sickness tick
ran. The tick still walks its sick list, which still held her stale
record, so it dealt her a 3-point sickness hit (health 52 -> 49, on a
corpse's health entry) and then silently deleted the record because
she was no longer on the roster. The sicktick recorder reads
`vpOf(vid).dead` as its `died` flag, and that flag was already true
from the contest removal — so the row reads "sickness, died = true"
for a woman who died in a contest hours earlier. The sickness tick
did not kill her, and the tele list did not miss a sickness death.
It missed two contest deaths.

## The mechanism, with the firing records

Code path (read before judging; the wrappers confirm it):
- `registerDeath` (src/js/corpses.js) is THE death hook: it fires
  `tele('death', ...)`, builds the corpse, notifies party/codex,
  seeds death gossip, and (via hurtVillager's lethal branch) pairs
  with a fallen entry. A grep of src/js/contests.js finds ZERO
  registerDeath calls anywhere in the contest system.
- `_cxKillContestant(pid, contestId)` (src/js/contests.js ~6049) is
  the choke point for EVERY villager contest death (the watch path
  in `_contestDie`, the multi-take path in `_contestResolveOthers`,
  the duel partner). It calls `removeVillager(pid, 'killed')` (which
  sets the shared record's dead flag and drops the roster id), filters
  the roster directly, ledgers `state.contestDeathsById[contestId]`,
  and fires the blood-on-air crisis + highlight-package favor. It
  never calls registerDeath. The `_contestDie` comment even says
  "the village buries them" — but no burial, corpse, or fallen entry
  is ever created.
- The two gap events on 9983, from the wrapper records:
  - marcus_webb, day 23: removeVillager how 'killed', caller
    `_cxKillContestant`, rosterAfter false, dead flags true; zero
    registerDeath, zero tele; not in fallen, not in corpses, not in
    exiles. Said day 23: "Marcus is gone. The village will say the
    name for a long time."
  - elif_demir, day 32: removeVillager how 'killed', caller
    `_cxKillContestant`, rosterAfter false, dead flags true; zero
    registerDeath, zero tele; not in fallen, not in corpses, not in
    exiles. Said day 32: "Elif is gone. The village will say the
    name for a long time." The day-32 sickness hurt row (52 -> 49,
    onRoster false, dead flags true) is the post-mortem tick above.
- Contrast, same seed: the 5 other villager exits all have a tele
  (sickness x3, the wild x1, starvation x1), a registerDeath, a
  fallen entry, and a corpse. The gap is specific to the contest
  path, not a general tele unreliability: across all 9 traces, every
  registerDeath fired exactly one tele (trace teles == harness teles
  on every seed), and no REGISTER-NO-TELE case exists anywhere.

## Leg 1 — REPRODUCTION, seed 9983 (fidelity gate: PASS)

Same trajectory as the parent traces exactly: 39 days, village-lost,
the same 14 tele deaths (harness deaths identical to the
starveplenty trace, item for item). The instrument did not perturb
the run. Classification: 7 roster exits, 7 named (coverage 1.0),
7 delta-deaths, 2 gaps (gap rate 2/7 = 28.6% of villager deaths).
Both gaps are REMOVAL-NO-REGISTER via _cxKillContestant (above).
No phantom lethal hurts (no lethal hurt row without a tele and
without a roster exit).

## Leg 2 — PILOT, seeds 10201-10208, competent, 180d death-aware

No confirm was spent: prereg allows confirm only if the pilot shows
>= 1 elif-class gap or coverage < 90%; the pilot shows neither, so
the pilot band IS the judged band.

| seed | days | end | exits | named | delta-deaths | gaps |
|------|------|-----|-------|-------|--------------|------|
| 10201 | 153 | village-lost | 12 | 12 | 12 | 0 |
| 10202 | 180 | survived | 2 | 2 | 2 | 0 |
| 10203 | 180 | survived | 3 | 3 | 3 | 0 |
| 10204 | 180 | survived | 16 | 16 | 16 | 0 |
| 10205 | 65 | village-lost | 8 | 8 | 8 | 0 |
| 10206 | 177 | village-lost | 14 | 14 | 14 | 0 |
| 10207 | 180 | survived | 15 | 15 | 15 | 0 |
| 10208 | 180 | survived | 11 | 11 | 11 | 0 |
| POOLED | | | 81 | 81 | 81 | 0 |

Pooled with 9983: 88 exits, 88 named (coverage 1.0), 88 delta-deaths,
2 gaps (2.3% of delta-deaths pooled; 28.6% on the one seed where
contest deaths occurred). Zero UNEXPLAINED-DELTA anywhere: every
roster exit in all 9 traces has a named wrapper record. The pilot's
contest teles (cause 'contest'/'the arena', 10204/10206/10207/10208)
are ALL player:true — scholar contest deaths via playerDeath ->
registerDeath. No villager-watch contest death occurred in the
pilot band at all, which is why the gap did not reproduce there:
the event is rare in blind fresh bands (0 in ~1,300 simulated days
vs 2 in 9983's 39 days — see metric review on that tension).

## Village assessment (what the villages looked like)

9983's village (from the parent trace + this trace): a small,
struggling village that scattered on day 39 with 7 living members
after losing 7 people — 3 to sickness, 1 to the wild, 1 to
starvation, and 2 to contests that the records never counted. The
two uncounted dead are not a footnote: on a 7-death seed they are
nearly a third of all villager deaths, and the village's own story
remembers them ("the village will say the name") while its books
do not. A death census built on teles alone would report this
village's contest deaths as zero and its total villager deaths as
5 instead of 7.

Pilot villages: 5 of 8 survived to the 180d cap; 3 were village-lost
(153, 65, 177 days). Villager tele deaths are dominated by 'the
wild' (scholar successions and field deaths) with sickness,
starvation, arena, and stranger deaths behind. Nothing in the pilot
reads robotic: exits all trace to named causes with matching
narrative (the contest/arena scholar deaths arrive via playerDeath
with full registration; sickness/starvation deaths arrive via
hurtVillager with corpse + fallen). The blank is narrow and
specific: the villager contest-death record, not death reporting
in general.

## Sense test (SENSE-TESTING LAW — read the transcripts)

For both gap events the village's STORY registers the loss and its
BOOKS do not — that split is the finding:
- Story side (present): the on-camera line ("Elif is gone. The
  village will say the name for a long time."), +12/+8 scholar
  trauma, a leadership fracture shift, contest-death gossip
  (`_cxGossip('died', ...)`), the blood-on-air crisis, the
  contest's death ledger (`contestDeathsById`, read back on the
  participate/refuse screen as honest stakes), and the highlight
  package. A player watching would know Elif and Marcus died, and
  why.
- Book side (absent): no corpse to find, loot, or bury; no fallen
  entry for the village's dead list; no death tele for any census
  or cause-of-death analysis; no deathSeen mark. The comment in
  _contestDie ("the village buries them") describes a burial that
  never happens in code.
So the gap is reporting/record-only in the sense that the story
never lies about the death — but it is NOT harmless: any system
that reads corpses, fallen, deathSeen, or teles (censuses, grief
dialogue triggers keyed on corpses, the death record) silently
misses contest deaths. The village grieves out loud and keeps no
grave. That is the blank to fill.

## Blanks filled / documented (builder, not critic)

FILLED (instrument): the cross-check itself — scripts/trace-sicktele-b.js
+ scripts/analyze-sicktele-b.js classify every roster exit into a
named bucket from wrapper records, and split the sicktick recorder's
collapsed `died` flag into healthAfter / getPerson.dead / vpOf.dead /
roster membership. The sicktick recorder's day-32 elif row is now
explained, not just observed: it is a post-mortem tick on a
contest-killed villager, and any future reader of that trace should
not cite it as a sickness death.
DOCUMENTED, NOT LANDED (fix proposal, needs a pre-registered
follow-up — this arm's prereg explicitly excludes landing a src/js
fix): call `registerDeath` for villager contest deaths in
`_cxKillContestant` (the choke point — one call site covers the
watch, multi-take, and duel paths), BEFORE the removeVillager call
as every other death path does, so the tele, corpse, fallen entry,
and deathSeen all land. Open design questions for that follow-up
(not decided here): where the corpse should sit (the contest
happened on camera, not on a field tile — the node argument needs
a deliberate choice, not a default), and whether the grief/gossip
double-fires with the existing _cxGossip('died') + blood-on-air
crisis (dedupe check required). Do NOT land this by editing
contests.js in this arm.
DOCUMENTED, NOT CHASED (second wrinkle, same traces): the sickness
tick hurts stale sick records of villagers already off the roster
(elif's day-32 row). removeVillager does not delete `v.sick[vid]`,
and villageSicknessTick iterates `v.sick` keys without a roster
check. Harmless today (the tick then silently deletes the record),
but it writes damage rows against corpses and would corrupt any
future per-cause attribution that trusts hurt rows. Candidate
follow-up: delete the sick record in removeVillager, or skip
off-roster ids in the tick. Not landed here.

## Convergence state

converging (diag, not a lever). #1514 is ANSWERED as far as
measurement goes: the mechanism is named, the parent observation
is reclassified (contest deaths, not a sickness tele gap), and the
fix is specified but not landed. Coordinator: #1514 can move from
open to answered-with-fix-proposal on this evidence; the remaining
work is a pre-registered follow-up arm that lands the
_cxKillContestant registerDeath call (with the corpse-node and
gossip-dedupe questions settled) and re-runs this cross-check as
its proof. No lever lands from this arm (DIAG ONLY by prereg).

## Proof

scripts/test-sicktele-b.js: 22/22 GREEN — 9983 fidelity (39d,
village-lost, harness deaths identical to the parent trace);
elif + marcus REMOVAL-NO-REGISTER via _cxKillContestant; no
register/tele for either; neither in fallen/corpses; "is gone"
lines day 23/day 32; post-mortem tick row 52->49 off-roster;
pilot pooled 81 exits / 81 named / 0 gaps; zero src/js diff vs
HEAD (diag-only guard). No concurrent jest was run; this proof is
a node script, not a jest suite.

## Files

- Prereg: evidence/2026-10-30/sim-sicktele-b-prereg.md
- Trace instrument: scripts/trace-sicktele-b.js
- Census analyzer: scripts/analyze-sicktele-b.js
- Proof: scripts/test-sicktele-b.js
- Traces: evidence/2026-10-30/sim-sicktele-b-trace-9983.json,
  sim-sicktele-b-trace-10201.json ... -10208.json (9 files)
- Pilot analysis: evidence/2026-10-30/sim-sicktele-b-pilot-analysis.json
- Evidence: evidence/2026-10-30/sim-sicktele-b.md (this file)

## Metric review (§14 — required section)

- Pre-registered metrics bind this run; no re-scoring occurred.
  Clause (d) is reported as MISSED, not reinterpreted: the pilot
  has 0 fresh elif-class gaps, and elif does not classify as a
  non-death exit, so neither the reproduction nor the refutation
  branch holds. The verdict is DIAG-NO-GO on that clause even
  though the mechanism is definitively named — the bar, not the
  finding, failed.
- Metric issue 1 (rare-event bars need enriched bands, not blind
  bands): a blind 8-seed pilot cannot reproduce an event that
  occurs 0 times in ~1,300 pilot days. Proposed revision for the
  NEXT run: pre-screen a contest-enriched band (seeds known to
  contain a villager-watch contest death, e.g. by a cheap
  registerDeath-absent removal scan) and judge reproduction on
  that band; report blind-band rates separately. Do not apply
  retroactively to this run's verdict.
- Metric issue 2 (rate tension, unresolved): 9983 shows 2 contest
  deaths in 39 days; the pilot shows 0 in ~1,300 days. Either
  contest deaths cluster in struggling/small villages (9983 was
  scattering by day 39), or 9983 is an outlier draw, or the pilot
  band's villages rarely reach the contest states that kill
  villagers. This run does not adjudicate between those; the next
  run's enriched band should stratify by village outcome.
- Metric issue 3 (the 'died' flag conflation, fixed by this arm's
  instrument): any recorder that collapses vpOf.dead into a single
  `died` flag will mislabel post-mortem ticks and removal marks
  as deaths by the tick's cause. Future sickness/death recorders
  must split healthAfter, getPerson.dead, vpOf.dead, and roster
  membership (as trace-sicktele-b.js does) or they will recreate
  #1514's confusion.
- Metric issue 4 (exit dating): an exit is dated to the next
  villageEats entry snapshot, so a removal late on day D and a
  removal early on day D+1 can share an exit day. The analyzer
  matches removals within [lastSeenDay, exitDay] to absorb this;
  no exit in this run needed the fallback (every exit had a
  same-window removal or tele).
- No metric revision is applied to this run's numbers. All
  revisions above are proposals for the NEXT run.
