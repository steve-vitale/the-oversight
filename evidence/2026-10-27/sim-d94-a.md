# sim-d94-a — the 73671 d94 UNMATCHED END (axis scale-onramp)

Run: fleshout loop A, run fleshout-20261027T1215Z, arm 3.
MEASUREMENT/ARCHAEOLOGY ONLY — zero src/js changes, zero game
changes, zero default flips, no lever, no lever proposal. No
[needs-eyes] flag applies (measurement only, no feel/combat/UI
change).

## VERDICT: CLOSED — DIRECT-BUILD ALIEN DUEL

The one unmatched end is a genuine fight outcome with no counted
start, not a counting error. It is the mirror image of the
tbstarts arm's unsettled starts: there, fights were counted as
starts that never began (titan-gate refusals); here, a fight
began through a path that never counts as a start
(`startAlienCombat` builds the fight directly instead of via
`Game.startCombat`), and its `tbEnd` row is the only trace the
tbstarts corpus holds of it. Nothing is missing, nothing is
duplicated, and no headline moves. The proof script
(`scripts/test-d94-a.js`) re-derives every number below from
the corpus files and fails if the d94 end is counted differently
(44 PASS, 0 FAIL).

The tbstarts verdict itself is NOT re-judged here: the 33
titan-gate refusals on 73675 and the 5 settled w4melt melts
stand exactly as sim-tbstarts-a recorded them. This arm
classifies only the single unmatched end, as assigned.

## CLAIM RECOVERED (from the 1121Z evidence, verbatim in substance)

- sim-tbstarts-a, band-wide table: 188 starts / 156 ends —
  143 settled + 12 instant-settled + 33 titan-refused + 0
  elsewhere; 1 unmatched END (73671 d94 'lost' alien-player
  direct-build fight — an unmatched end, not an unsettled
  start).
- sim-scale-onramp-round-1121.md, "Next blanks" item 4:
  "Micro-blank from tbstarts: 73671 d94 unmatched end
  (alien-player direct-build fight) — an unmatched end, not a
  start; worth one classification pass if an arm ever sweeps
  alien direct-build fights, not a lever."
- Side correction in the same round file: "73671's single
  unmatched end in this corpus is a d94 alien direct-build
  fight, identified from tbstarts rows; the d179 fights both
  have start rows here." This arm confirms both halves of
  that correction from the rows (see below).

## CORPUS: PRESENT, NO RESWEEP NEEDED

The tbstarts corpus is present in this worktree's base:
`evidence/2026-10-27/perseed-tbstarts-a/` (16 per-seed rows +
summary.json + sense-73675.txt). The 73671 armed row
(`s73671-armed.json`) carries the full tbstarts recorder
output (starts/ends/dissolves/throws/daily, diag errs 0,
no overflow). No full sweep was re-run to recreate it, per
the assignment: the corpus is not missing, so no sweep was
needed. The only new runs were two NON-MEASURED sense
replays for seed 73671 (wording/presence only, /tmp scripts,
never committed, never entering any count — see the
transcript section). The plain (baseline) row for 73671
carries `tbstarts: null` (recorders off), so there is no
competing plain d94 row; the armed-vs-plain headlines are
already proven EXACT by the tbstarts validator (10/10).

Canon read first, as assigned: docs/CANON.md. No canon doc
covers alien-player duels as a named system — CANON.md's
table has no alien-player entry, and docs/MONSTER-WAVES.md
contains no alien-player entry (checked by grep). The
mechanism below is therefore cited from code comments, not
from invented canon: encounters.js says, of this path, that
it "builds the fight directly instead of via
Game.startCombat," and that alien-player fights "bypassed
startCombat." That is the mechanism, quoted, not inferred.

## THE ROW, IN FULL (73671 armed corpus, tbstarts.ends)

```
day 94, activeStart null, result 'lost',
id fmgpspijo_f53f9n, token 15, postId null,
fighters:
  player  id 'p',  key 'p',         alive false, hp 0
  hostile id 'sarge', key 'ap_sarge', alive true,  hp 80
```

Reading it plainly: on day 94 the player fought a hostile
person-fighter named by the recorder as 'sarge', lost, and
went down (0 HP); Sarge walked away alive at 80 HP. There
is no monster-kind fighter in the row, no wave, no linger,
no tile monster — this is not a wave fight, not a melt
candidate, and not a monster kill in either direction.

## THE JOIN PROOF (why "no start" is the true state, not a gap)

The tbstarts pairing joins starts to ends by fight id, by
recorder token (the same fight object — WeakMap token,
assigned on first sight of the object), and by call index
for fights that end inside their own startCombat call. The
d94 row fails every join for a positive reason, not by
absence of data:

1. NO ID JOIN. No start row on 73671 has preId or postId
   `fmgpspijo_f53f9n`. No start has argument 'sarge'; no
   start's post-call fighters include 'sarge'.
2. NO TOKEN JOIN. Token 15 appears in NO start row's
   preToken or postToken on 73671. Tokens are assigned on
   first sight of a fight object: token 14 is the d93
   focus_group start, token 16 is the d102 mirrormoth
   start, so the token-15 object was first seen at tbEnd
   time — it never passed through any startCombat call.
   End tokens on 73671 are contiguous 1..34, so token 15
   is not a renumbering or a dropped row; it sits exactly
   where a d94 fight belongs in sequence.
3. NO CALL-INDEX JOIN. The row's activeStart is null: it
   is NOT an instant settlement (contrast the 4 instant
   settlements on 73671 — d10, d18, d74, d160 — whose end
   rows carry their start's call index). A fight that
   began and ended inside a startCombat call would carry
   that index; this one carries none, because no
   startCombat call ever ran for it.
4. NO START ON THE DAY AT ALL. There is no start row on
   day 94 on 73671 — the neighboring starts are d93
   (focus_group, callIdx 13, settled 'routed') and d102
   (mirrormoth / bright_idea, callIdx 14/15, settled).
   There is no start-day key the end could have shifted
   from, and no seed key it could have shifted to: the
   id appears in no other seed's starts or ends (checked
   across all 8 armed rows), and the summary.json copy
   of the row is the same row, not a second source.
5. THROWS AND DISSOLVES ARE EMPTY. throws [] and
   dissolves [] on 73671: no startCombat call threw
   (a thrown call records no start row), and no
   tbBarrierExit dissolve fired. The daily snapshots
   around d94 (d88–d100) are all fightId null — the fight
   was built and ended inside one day, so no daily
   snapshot could catch it; that is the same shape as
   an instant settlement's invisibility to the daily
   record, via a different path.

## THE MECHANISM (code, not conjecture)

- `src/js/encounters.js`, `G.startAlienCombat(fighter)`:
  builds `this.tbfight = { id: 'f' + Date.now()...,
  fighters, ..., alienFight: true }` directly, then runs
  opening turns (`tbBeginTurn`, `tbAdvance`). The code
  comment on this path reads: "this path builds the fight
  directly instead of via Game.startCombat" and, on the
  telemetry note: "alien-player fights bypassed startCombat,
  so they never emitted the 'combat_start' telemetry monster
  fights emit." A tbstarts recorder that wraps startCombat
  therefore cannot see the start — by construction, not
  by failure — while its tbEnd wrapper still fires when
  the fight ends, producing exactly one unmatched end.
- `src/js/alienPlayers.js`, `apStartEncounter(pid)`:
  calls `startAlienCombat(fighter)` when the encounter
  turns hostile, and records the hunt on success only
  ("a refused start is not a hunt"). 'sarge' is one of
  the COMBAT_PILOTS (alienPlayers.js line 135), with
  service-beam tech ('Sarge\'s service beam') and base
  build HP 80 + 10 per prior encounter
  (`apBuildFighter`). The end row's Sarge at exactly 80
  HP, alive, is consistent with a first-encounter build
  at full health — the fight's loser is the player, and
  Sarge took no recorded damage.
- The hostile kind is the discriminator the tbstarts
  evidence anticipated: "direct-build person-fights carry
  no tbfight.id" was said of the token join, but the
  d94 row DOES carry an id (direct-built fights mint
  their own `f...` id); what it lacks is any startCombat
  call, which is the only thing the 'starts' counter
  counts. The correct restatement of the counter is
  therefore: tbstarts 'starts' = startCombat calls, and
  this fight is outside that counter's domain — not
  missing from it.

## RULED OUT, EACH WITH ITS ROW

- DUPLICATE END. No: end ids and tokens on 73671 are
  unique (34 distinct ids, 34 distinct tokens). The
  neighboring ends are different fights — d93 focus_group
  (token 14, 'routed', focus_group + 4 eyes) and d102
  mirrormoth (token 16, 'won') — different ids, fighters,
  days, and results. A duplicate would share an id or a
  token; this row shares neither with any row.
- DAY/SEED KEY SHIFT. No: no start exists on any nearby
  day with this id/token/fighter (the only d94 starts
  anywhere would be in the start list, and day 94 has
  none); the id is absent from all 7 other seeds' rows.
  A shift would leave the true start row somewhere; there
  is no such row anywhere in the corpus.
- WRAPPER SNAP-TIMING ARTIFACT (the 1121Z
  table-invited class). No: that artifact was a wrapper
  reading a flag at a different point in the daily cycle
  while the underlying record (seat entry) agreed. Here
  the underlying fight is independently real — see the
  replay below, which runs WITHOUT the tbstarts recorder
  and still produces the d94 duel. A recorder-timing
  artifact cannot produce a fight in a recorder-free run.
- RECORDER GAP / LOST START. No: diag errs 0 on all
  three recorders for 73671, no overflow, throws empty.
  A lost start would still leave its fight object seen
  at tbEnd with a token that also appears in a start row
  (every other end's token does, except the instant
  ones, which carry their call index instead). Token 15
  does neither — the only row in the band with that
  property, and the only row whose fighter kind is
  'hostile'.
- INSTANT SETTLEMENT MISREAD. No: instant settlements
  carry activeStart = their start's callIdx; this row's
  activeStart is null, and there is no start call on
  day 94 for it to be inside of.
- MELT FIGHT. No: melts follow lost TB fights against
  wave-4 monsters with linger history. This row has no
  monster, no wave, no lingerSince, and Sarge is alive
  (a melt needs a dead-or-gone monster to melt from).

## SENSE-TESTING READ — THE d94 DUEL (plain words)

Two NON-MEASURED replays (seed 73671, tableseat-nowait
policy, narration on, NO tbstarts recorder installed —
recorder-independence is the point) were run to day 100
solely to read the fight's wording. Replay text never
enters any count above; the counts are the corpus rows.
The replay's fight-start days match the corpus starts
(d90 cliffhanger, d93 focus_group, d94 stranger duel),
so the replay is on the census thread for this window.

Day 94, in the replay: after a freezing dawn and a
morning's foraging, a figure steps out of the treeline —
"Human-shaped. But something's wrong. They move like
someone who's done this before. Many times. On many
worlds. Their eyes track you like a targeting system.
That's not human." The game never names him in the
fight: the intro line is "⚔ STRANGER! You're on your
own." — no villager is within 4 squares to join, so the
player faces him alone. (That is the face-to-face rule
doing its work: pre-reveal, a descriptor and dread, not
a name. The corpus recorder names him 'sarge' from the
fighter object; the player in-fiction meets a stranger.
Both are true, at different layers.)

The fight itself is a slow beating, not a brawl: the
stranger closes in, patient and unhurried, plants his
feet every third turn for a heavy strike, and the ground
erupts for 7 damage a time. The player-character in the
replay (the bot policy) holds still and watches, round
after round — which is why the corpus row shows Sarge
untouched at 80 HP. Around round 42 the stranger raises
a beam weapon — "The air tastes like copper" — the
player's resistant gear flares, catches one piece of it,
and it is not enough: 69 beam damage, and "You go down."
The gamblers go quiet. The Codex turns a page on its own:
Landon Hayes is dead, and the mantle passes to Brunhilde
Han — the village's story continues under a new face,
which is exactly what the corpus shows next (d102 fights
with the player at full health again, and the run
surviving to the 180d cap).

Sense judgment: the d94 end reads as a real, legible,
costly event — a solo duel against an alien veteran that
the player loses, with a death and a succession in its
wake — not as a bookkeeping phantom. The fiction never
hides it: the stranger's approach, the heavy-strike
telegraphs, the beam, and the mantle transfer are all
spoken in the open. The only silence is the counter's:
a census that counts startCombat calls cannot see a
fight that never called startCombat. That is a
definition boundary in the instrument, not a hole in
the story. The one honest gap it exposes is a recorder
one (see "Carried note" below), not a game one.

## HEADLINE TOUCH — NONE, WITH NUMBERS

- W4MELT MELT SETTLEMENTS: untouched. All 5 melt fights
  are SETTLED starts with their own tbEnd rows, and the
  73671 melt (reunion d167, start callIdx 28, end token
  30, 'lost') is verified settled in the proof script.
  The d94 end is not a melt fight (no monster, Sarge
  alive) and shares no id, token, day, or fighter with
  any melt row. Melt settlement count stays 5.
- WAVE-4 KILL COUNTS: untouched. Band wave-4 kills stay
  2 (73671 congregation d121 — start callIdx 20, end
  token 22, 'won', verified settled in the proof — and
  73677 influencer d113). The d94 end is a player loss
  with the hostile alive: it adds zero kills and removes
  zero kills. It is also not a wave fight at all (kind
  'hostile', wave null by the encounters.js telemetry
  note), so it never entered any wave-kill ledger.
- HEADLINE START/END TOTALS IF RECLASSIFIED: the only
  honest restatement is a definitional one, and it
  changes no headline. tbstarts 'starts' = startCombat
  calls: 33 on 73671, 188 band-wide — all accounted for
  (73671: 29 settled + 4 instant; band: 143 + 12 +
  33 refusals). Fights actually begun = startCombat-begun
  + direct-build: 33 + 1 = 34 on 73671; 155 + 1 = 156
  band-wide — which equals the tbEnd total exactly, both
  ways. So the corpus closes in both directions once the
  one direct-build fight is named: every begun fight has
  exactly one end, and every end has exactly one begun
  fight. No headline field (wins, national, table,
  wave reach, median survival, deaths) derives from
  start counts, and armed == plain is already EXACT on
  every shared field — reclassification moves no headline
  number by even one.
- DEATHS: the d94 loss is already inside the run's story
  (the corpus run continues to 180d survived with a new
  scholar; the replay's mantle transfer is the fiction
  of that same loss). No death total is re-derived here
  from the end row, and none needs to be: the end row
  was always processed by tbEnd in both arms, recorder
  or not.

## BLANKS FILLED OR DOCUMENTED

- FILLED (answered, with rows): what the 73671 d94
  unmatched end IS — a direct-build alien duel
  (startAlienCombat, Sarge, 'lost'), a genuine fight
  outcome whose start path bypasses startCombat. The
  1121Z round file's side correction is confirmed in
  both halves: the d94 end is the alien direct-build
  fight, and the d179 fights both have start rows
  (belltoad callIdx 31 → token 33 'won'; suburb
  callIdx 32 → token 34 'lost').
- FILLED (closure arithmetic): band fights-begun 156 ==
  band ends 156 once the direct-build fight is counted
  as begun; 73671: 34 == 34. The tbstarts band table's
  188/156 gap is now fully decomposed: 33 titan-gate
  refusals (fights counted as starts that never began)
  + 1 direct-build duel (a fight begun that was never
  counted as a start) + 155 startCombat-begun fights
  that all settled.
- DOCUMENTED, NOT A GAME GAP (carried note for future
  recorder arms, not a lever, not a fix proposed here):
  any future corpus that wants "fights begun" as a
  single number must count startAlienCombat alongside
  startCombat, or must label its counter
  "startCombat calls" and say so. The tbstarts counter
  is the latter; its evidence already says so implicitly
  (starts = startCombat calls). No game change follows
  from this note — the duel works as built, and its
  tbEnd row already records its outcome.

## NEXT STEP IF UNSETTLED — NOT APPLICABLE (CLOSED)

No missing row, no missing field: the classification rests
on five independent corpus facts (id, token, activeStart,
fighter kinds, day) plus a code comment stating the bypass
and a recorder-free replay reproducing the fight. There
is no single targeted run that could overturn it, because
there is nothing left to settle — a run that re-swept the
band with a startAlienCombat recorder would only add a
start row for this fight and confirm the same fight. If a
future arm ever wants that row for completeness, the
targeted run is: seed 73671, tableseat-nowait, a
startAlienCombat wrapper recording fighter pid/day, one
seed, to day 100 — expected result: exactly one row, day
94, pid 'sarge', joining to end id fmgpspijo_f53f9n.
That run is confirmation, not settlement, and is not
needed for this blank.

## INFRASTRUCTURE NOTES

- Corpus: evidence/2026-10-27/perseed-tbstarts-a/
  (committed by sim-tbstarts-a; reused here, not
  re-created, not modified). Validator re-run for
  reference: scripts/test-tbstarts-a.js 10 PASS, 0 FAIL
  (read-only over the same corpus; this arm's proof is
  the new scripts/test-d94-a.js, 44 PASS, 0 FAIL).
- Sense replays: /tmp scripts only (d94-sense.js,
  d94-sense2.js), seed 73671 to day 100, tableseat-nowait,
  narration on, no tbstarts recorder. First replay: 3
  fight-start lines in window d88+ (d90, d93, d94).
  Second replay: full d93–95 narration dump; d94 duel
  lines quoted above (stranger approach, heavy strikes
  for 7, round-42 beam for 69, "You go down," mantle
  transfer Landon Hayes → Brunhilde Han). Replay text
  is wording/presence only and enters no count.
- No jest run: zero src/js changed, zero test files
  changed; the two proof scripts are pure node over
  corpus files (no harness in test-d94-a.js) or
  narration-only replays. check.js --quick was not
  re-run for the same reason (no game code touched;
  same precedent as the 1121Z DIAG arms).
- Worktree: ~/workspace/worktrees/sim-d94-a, branch
  sim-d94-a. This arm's commit adds exactly two files:
  evidence/2026-10-27/sim-d94-a.md (this file) and
  scripts/test-d94-a.js. No corpus file modified, no
  other worktree touched, main tree untouched.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

This arm carried no lever and no GO threshold to re-score:
its assignment was classification of one named row, judged
by whether the rows settle it. They do — definitively, on
five independent fields plus code and replay — so the
verdict is CLOSED, not a near-miss rounded up. No metric
was revised mid-run. The balanced panel (§15) was not run:
this is a single-row corpus archaeology over recorder
rows, the same standing exception the tbstarts arm
carried (panel cannot ingest per-seed recorder corpora);
the comparison of record is the proof script's
re-derivation plus the tbstarts validator's 10/10.
