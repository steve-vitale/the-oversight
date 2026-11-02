# sim-fightoutcome-recorder — standing fight-outcome recorder (Loop A 20261102)

Arm: fight-outcome recorder, axis scale-onramp, blank #2 from
sim-laircontact-a (carried as #2 in sim-heralddepart-a: "a
standing recorder, not per-arm driver code, so future arms get
outcomes without re-instrumenting"). Prereg:
evidence/2026-11-02/sim-fightoutcome-recorder-prereg.md, written
AND committed (5853f8863) BEFORE any judged sim in this arm.
TOOLING ONLY. Zero src/js game-code changes. Ready for
coordinator merge, pending ship (NOT pushed, NOT bumped, NOT
live-verified — ship loop owns deploys).

## Verdict: RECORDER GO — all three prereg legs pass on current master

- GO leg 1 (completeness): 163/163 FOUGHT + BYPASS starts
  carry exactly one outcome row; 678/678 field-fight records
  carry a resolved engine outcome; the single titan
  'slain' record joins exactly one TB fight row (same day,
  same titan, normalized matching). Zero missing, zero
  duplicates, zero unresolved TB fights, zero unresolved
  field fights. Analyzer problems: 0.
- GO leg 2 (no false outcomes): zero outcome rows without a
  matching fight start; zero duplicate outcome rows for one
  fight. The stray-tbEnd guard counted 0 stray calls in the
  corpus (its synthetic case is in the proof test).
- GO leg 3 (sense): the 97418 d60 herald fight was read
  end-to-end (head + tail of its 300-line kept transcript,
  86 middle lines honestly counted as dropped). The row
  says what the transcript says: 15 allies joined ("15
  allies join you on the field", gate 15), the bearer
  survived at 81/100, the Herald fell ("The Herald falls."),
  three allies died (Maya Fischer, Peter Calhoun, Rosa
  Nair — the transcript shows Rosa falling to The Naming),
  and the titan record resolves the same day to 'slain'
  (blades 15, result won). A recorder that counts fights
  but mislabels slays would fail here; this one matches.
- Determinism gate: 97418 closecommit r1 == r2 on the
  outcome rows (attempts, tbFights, fieldFights, kills,
  titanOutcomesEnd, unresolved) — the recorder is read-only
  and does not perturb trajectories.
- Corpus floor: met (1 titan TB fight, 678 field fights).
- Proof test: scripts/test-fightoutcome-a.js, 40/40 green
  (normalization taxonomy, fake-Game install smoke test
  including bypass / instant-fight / stray-tbEnd cases,
  analyzer join cases over synthetic per-seed JSON).

## What was built (adapted, not reinvented)

- `scripts/fightoutcome-recorder.js` — the standing module.
  install(Game, t) with read-only, zero-RNG-draw,
  call-through wrappers adapting the tbOutcomes pattern
  from scripts/killdisc-instrument-20261021.js (fightId ->
  result at tbEnd, 'dissolved' via tbBarrierExit) and
  scripts/herald-instrument-20261030.js (startCombat
  census, FOUGHT/REFUSED classification, titan muster proxy
  by pure state reads, never titanMusterReady). Extensions
  over those two instruments, each forced by a live pilot
  finding below:
  - fightSeq persisted join keys (tbfight.id contains
    Date.now(), so persisting it breaks r1 == r2).
  - Fighter snapshots at fight end (who fought, who died,
    monster hp/alive, bearer hp) + per-fight say transcript
    (head 150 + tail 150, middle drops counted).
  - Field fights (all mids, engine taxonomy), wave kills
    (wave >= 4 + titan mids), and the game-side
    state.titans.outcomes records (read, never written).
  - Bypass starts (see finding 1), instant fights (see
    finding 2), stray-tbEnd guard (see finding 3).
  - Normalization is presentation only: engineResult
    carries the raw tbEnd string ('won'/'lost'/'fled'/
    'routed'/'calmed'/'betrayal_*') or 'dissolved' or
    'unresolved'; normalized maps it to slain / fled /
    dissolved / party-death / other, with the raw string
    always alongside. GO was judged on the raw capture.
- `scripts/fightoutcome-driver-20261102.js` — thin driver
  running the closecommit stack (titanroute + musterclose
  + mustergap over lead-fullseat, the laircontact /
  heralddepart stack) and writing per-seed JSON carrying
  the outcome rows. The driver backfills a titan row's
  linked outcome record from the engine's end snapshot
  when the live hook missed it (see finding 4) — same
  titan, same end day, normalized matching, exactly one
  match required; the analyzer re-validates every link.
- `scripts/fightoutcome-analyze-20261102.js` — join/audit
  analyzer over per-seed JSON only (no re-simulation).
  Attempt rows, outcome rows, field rows, and the raw
  titan outcomes array are separate fields, so the join
  is a real check, not the recorder grading itself.
- `scripts/test-fightoutcome-a.js` — proof test, 40/40.

## Pilot corpus (8 seeds, closecommit, 180d death-aware)

| seed | call | TB starts (FOUGHT / BYPASS) | TB rows | field | titan outcome | end |
|---|---|---|---|---|---|---|
| 97330 | 114 | 21 (21 / 0) | 21 | 88 | — | village-lost 136 |
| 97338 | 82 | 11 (11 / 0) | 11 | 109 | — | over-other 90 |
| 97400 | 68 | 26 (26 / 0) | 26 | 86 | — | village-lost 88 |
| 97418 | 59 | 24 (24 / 0) | 24 | 59 | herald slain d60 | over-other 90 |
| 97420 | 60 | 25 (23 / 2) | 25 | 126 | refused only | village-lost 115 |
| 97426 | 66 | 20 (20 / 0) | 20 | 83 | refused only | over-other 90 |
| 97433 | 64 | 16 (16 / 0) | 16 | 62 | refused only | over-other 90 |
| 97435 | 61 | 20 (20 / 0) | 20 | 65 | — | village-lost 87 |
| TOTAL | | 163 | 163 | 678 | 1 slain | |

No REFUSED row is counted as a fight: refusals are
attempts that never started (the muster-gate re-fire
pattern from laircontact-a is visible in the raw titan
outcomes arrays — e.g. 97420 carries dozens of d61–d73
'refused' records — and none of them produces an outcome
row, correctly).

## Findings the pilot forced (each fixed in the recorder, not re-scored)

1. Bypass starts are real fights, not false outcomes.
   First pilot pass showed tbEnd rows with no start row
   (97418 d51/d54/d59 'routed', 97420 d61/d63 'lost',
   97433 d49 'routed'). Cause, named from engine code:
   several paths build tbfight directly instead of via
   startCombat — alien fights (encounters.js), uprisings
   (justice.js), betrayals (party.js), each file saying so
   in its own comment. Fix: the recorder registers a
   fight at first sight (tbBeginTurn, else tbEnd /
   tbBarrierExit) with cls 'BYPASS' and the fight's own
   flags. Genuine bypass fights in the final corpus:
   97420 d61/d63, both alienFight=true, both lost /
   party-death (alien fighters carry no monster id, so
   mid is honestly null and the fighter snapshot names
   the opponent kind — not missing data).
2. Instant fights: a fight can start AND end inside one
   synchronous startCombat call in node ("It comes
   apart — no one in reach, no one chasing. The fight
   ends; they melt back into the wilds."). The first
   pass misread these as a BYPASS row plus a spurious
   REFUSED row for one fight (97418 union_rep d51,
   nevermore d54, murkcap d59 — the REFUSED row's own
   sayDuring proves the fight happened: "THE UNION REP!
   You're on your own." ... "It comes apart"). Fix:
   the startCombat after-hook upgrades a BYPASS row
   registered during the call to FOUGHT instead of
   pushing a second row — including the
   turn-inside-startCombat case (the engine's
   startCombat calls tbBeginTurn synchronously during
   setup, so the turn wrapper claims the fight before
   the after-hook runs). Final corpus: all three read
   as single FOUGHT rows -> routed / fled, matching
   their transcripts.
3. Stray tbEnd calls end no fight. tbEnd guards on
   !f || f.over, but the recorder recorded a row for
   every call — including calls with no live fight,
   which read as orphan outcomes with null fields.
   Fix: the wrapper records a row only when a live,
   non-over fight exists at entry; otherwise it bumps
   tbEndNoop (0 in this corpus) and records nothing.
4. The titan link is normally backfilled, not live.
   titans.js wraps tbEnd lazily and resolves the
   'fought' record to 'slain'/'fled' AFTER the original
   tbEnd returns, outside the recorder's after-hook
   regardless of install order — so the tbFight row's
   titanOutcome field is normally filled by the
   driver's end-snapshot backfill
   (titanOutcomeSource 'end-snapshot'), validated by
   the analyzer's independent join. The header note
   that prescribed install-after-setup for this link
   was corrected: install order does not achieve it.
   Corollary, recorded for the next arm: the 'fought'
   record resolves IN PLACE (titanResolveOutcome
   mutates the record), so the end snapshot holds one
   record per titan fight, not two — the analyzer's
   count invariant is fought+slain+fled == titan TB
   fights, and a fought-only count misreads every
   resolved fight as missing (this bit the first
   analysis pass before the fix).

## Wall numbers (substrate, not a reach claim)

Pilot corpus (8 seeds): national 1, table 6, won 4,
wave 4 unlocks 8/8, wave 5 unlocks 1/8 (97418),
median survival 90d (range 87–136). These flags are
reported per the task and per the prior arms' warning
they stay non-specific (table=1 on village-lost seeds
97400/97435; won=1 at over-other endings on
contact-free runs) — the SPECIFIC herald-chain signal
in this corpus is the single titan record: herald
slain d60 on 97418 (gate 15, 15 blades, result won).
The recorder alone does NOT make the herald chain
reachable end-to-end; it enables that claim for a
later run. What that later run still needs: a corpus
in which the chain is judged from outcome rows (not
flags) across a re-screened band on current code —
calls, fights, slays, and the onward scale steps
(regional -> national -> table) with their own
outcome records — plus the departure-telegraph
design question from heralddepart-a, which this
recorder does not answer.

## Sense-testing (transcript judged for meaning)

- The 97418 titan fight reads as a coalition victory
  with a price: 15 allies join, the Herald's Naming
  kills Rosa Nair outright ("The Herald's The Naming
  hits Rosa Nair for 117. / Rosa Nair falls."), two
  more allies are dead at fight end, the bearer walks
  away at 81/100, and "The Herald falls." The row
  (won / slain, monster 0/700, bearer alive, 3 dead
  allies) matches the transcript exactly — including
  the uncomfortable part: the victory cost three
  named people, and the row does not hide them.
- The instant fights read as what they are: brief,
  routed meetings ("It comes apart — no one in
  reach"), not defeats and not slays. Normalized
  'fled' is the honest label; 'lost' would have lied
  about a party death that never happened (bearer
  100/100 at end in all three).
- The herald field fights (97420 d77/d84/d90, 97426
  d78/d79/d87) read as villagers fleeing a wandering
  giant they cannot kill: vFlee with the herald's HP
  falling 515 -> 467 -> 457 across the days, and two
  villager deaths (vDie) where flight failed. This
  matches heralddepart-a's "villagers fight the
  wandering herald and wound it, and it keeps
  walking" — now with outcome rows instead of a
  prose note.
- The refusal re-fire is still audible in the raw
  records (dozens of identical 'refused' entries) but
  no longer inflates fight counts: refusals produce
  no outcome rows by construction.

## Balanced panel (method note, not a gap hidden)

No panel compare .md is attached, for the stated
prereg reason: scripts/balance-panel.js runs its own
policy registry over its own seeds with its own
observer — it cannot ingest fightoutcome driver
records, and its policies do not include the
closecommit stack, so a panel run would not express
this arm's comparison at all. This arm changes no
game code, so no before/after panel applies. The
comparison this arm actually makes — 163 starts
joined to 163 outcome rows with byte-identical
determinism on the re-run seed — is the instrument
the prereg named. Same position as laircontact-a and
heralddepart-a.

## Metric review (for the NEXT run, not this verdict)

- The prereg's leg-1c wording ("titan 'slain'/'fled'
  records join to exactly one TB fight row") holds as
  written; the analyzer's auxiliary fought-count check
  was corrected to engine semantics (in-place
  resolution — see finding 4). Future preregs should
  state the in-place rule explicitly so the count
  invariant is never written as fought-only again.
- The prereg's leg-2 wording ("zero outcome rows
  without a matching fight start") holds, with the
  start class now explicitly FOUGHT or BYPASS: a
  future prereg should list bypass starts (alien /
  uprising / betrayal / instant) as legitimate starts
  so they are not mistaken for vanishings — the same
  lesson heralddepart-a recorded for fight-entry
  removals.
- Transcript capture caps at head 150 + tail 150 per
  fight (97418's titan fight dropped 86 middle lines).
  The ending — the part a slay judgment needs — is
  always in the tail. A future arm that needs full
  transcripts for long fights should raise the cap
  for titan fights only, not for every fight: per-seed
  JSONs already total 3.3 MB for 8 seeds, mostly
  transcripts.
- Alien-fight rows carry mid null (no monster id
  exists for an alien player). Consumers that group
  by mid must treat null-mid + alienFight rows as
  their own class, not as missing data.
- Band re-basing, restated: this pilot's seeds were
  chosen from the prior arms' calling seeds, and on
  current code all 8 still call (call days 59–114) —
  but only 97418 produces a titan fight. A future
  reach-claim run must re-screen for fight-positive
  seeds on its own code version, not inherit this
  band's fight days.

## Per-seed records (all under evidence/2026-11-02/)

- perseed-fightoutcome-a/fo-closecommit-s<seed>-r1.json
  (8 pilot runs) + fo-closecommit-s97418-r2.json
  (determinism repeat, outcome rows byte-identical
  to r1 per the analyzer)
- perseed-fightoutcome-a/analysis.json (analyzer
  output: totals, legs, wall, determinism, per-seed
  rows)

## Files committed (this arm)

- scripts/fightoutcome-recorder.js — standing recorder
- scripts/fightoutcome-driver-20261102.js — pilot driver
- scripts/fightoutcome-analyze-20261102.js — join/audit
  analyzer
- scripts/test-fightoutcome-a.js — proof test, 40/40
- evidence/2026-11-02/sim-fightoutcome-recorder-prereg.md
- evidence/2026-11-02/sim-fightoutcome-recorder.md (this file)
- evidence/2026-11-02/perseed-fightoutcome-a/*.json
  (8 r1 + 1 r2 records + analysis.json)

## Index-clobber notes (infrastructure, recorded not hidden)

The safe-commit index-clobber class from AGENTS.md hit
all three tooling commits in this run (bogus staged
deletions, and once a staged revert of the just-made
commit). Each commit itself was verified correct via
`git show --stat` + `git show HEAD:<file>` before
repair with `git update-index --add --cacheinfo
"100644,<blob-from-HEAD>,<path>"` per file; the
worktree was verified clean after every repair. No
commit content was lost; the coordinator should still
re-verify HEAD file lists at merge time.

## Next blanks, in order (for the coordinator, NOT edited into the backlog by this worker)

- [open] 2026-11-02 — fight-outcome recorder — standing recorder landed (this arm); future arms should require scripts/fightoutcome-recorder.js instead of re-instrumenting tbOutcomes, and judge herald reach from outcome rows, not won/table flags (run fleshout-20261102T1715Z, evidence/2026-11-02/sim-fightoutcome-recorder.md).
- [open] 2026-11-02 — herald chain reach — re-screen a fight-positive band on current code and judge the herald chain end-to-end from outcome rows (calls, fights, slays, onward scale steps); needs the departure-telegraph design question from heralddepart-a answered first if the muster can still lose its titan to seven unseen turns (run fleshout-20261102T1715Z, evidence/2026-11-02/sim-fightoutcome-recorder.md).
- [open] 2026-11-02 — instant-fight narration — fights that start and end inside one synchronous startCombat call ("It comes apart") are now recorded as single FOUGHT rows; whether their fiction should read as one meeting rather than a routed non-event is a feel question for a later arm (run fleshout-20261102T1715Z, evidence/2026-11-02/sim-fightoutcome-recorder.md).

## Village assessment (plain words)

The village's fights finally have endings on paper. Before
this run, a fight that began could only be counted as
begun — whether the beast fell, whether anyone came
home, whether the giant the village mustered for actually
died, all of it was guesswork from flags that also fire
when nothing happened. Now every fight carries its ending:
the beast slain, the party fled, the meeting that came
apart before it began, the villager who did not get up.
On the seed where the village gathered its fifteen blades
and met the Herald, the paper says what the fire circle
would say — the giant fell, and three named people fell
with it, and the scholar walked home hurt but alive.
That is what the next run needs to judge whether the
chain holds: not a flag that says "won", but a row that
says who fought, who died, and what fell.

## Convergence state

converging (axis scale-onramp: the outcome-recording
blank is closed — future arms can now judge herald
reach from outcomes; the reach claim itself and the
departure-telegraph design question remain open).
