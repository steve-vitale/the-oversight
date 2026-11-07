# sim-arena-b — what the arena is, what "a stranger" is: DIAG-GO

**Arm:** sim-arena-b (run fleshout-loop-b-20261107T0230Z, Loop B, axis
scale-onramp / winnability chain) · **DIAG only, zero src/js.** Fixes are
NAMED, not built.
**Verdict: DIAG-GO** — all three prereg conditions met: (a) the arena death
path is traced end-to-end with the firing condition named; (b) "a stranger"
is identified, with a named persona and quoted traces; (c) canon coverage
is stated.
**Base:** master 5a4e3e4b5 · **Prereg:**
`evidence/2026-11-07/sim-arena-b-prereg.md` (written before any judged
work) · **Proof:** `scripts/test-arena-20261107.js` **57/57 green** ·
**Regressions:** `test-tbend-20261106.js` 18/18,
`test-killersurvive-20261106.js` 140/140 · **Replay corpus:**
`evidence/2026-11-07/perseed-arena-b/` (2 files, 0 instrument errors) ·
**Capture wrapper:** `scripts/arena-capture-20261107.js` · **Replay
driver:** `scripts/arena-replay-20261107.js`.

## The one-line answers, plainly

- **The arena is a place AND a fight mode, and it is a contest.** A Blood
  contest (Pit, Gauntlet, Siege) sends the scholar into real turn-based
  fights on the grid — "the grid is the arena" — in waves, with no rest
  between. The scholar's death in one is recorded `fallen: the arena`
  because the death-cause function sees the contest still live when the
  losing fight ends.
- **"A stranger" is a person: one of the twelve alien players.** An alien
  contestant who fights the scholar in the wild, built as a human
  fighter (kind `hostile`, with an alien persona id), named `Stranger`
  until the player has earned the reveal. The village buries the scholar
  as killed "by a stranger" because the village does not know who did it
  — the name is withheld on purpose, not missing by accident.

## The arena, end-to-end (code trace)

**What opens an arena bout.** A Blood contest's fight choice
(`contestChoose`, `d.arena`) calls `_contestArena` (contests.js:4718):
it picks `n` wave-appropriate beasts (`{waves: 1}` Pit, `{waves: 3}`
Gauntlet and Siege — the only three arena specs in the code), sets
`state.arenaContest = {contestId, waves, waveIdx: 0}`, suspends the
contest modal (`arenaSuspended`), and calls `startCombat(beasts[0])`.
The grid becomes the arena; the fight is real and turn-based.

**When it fires / chains.** The bout ends in `tbEnd` (game.js:45879).
At the tail of tbEnd, AFTER the `finally` that nulls `this.tbfight`,
the arena hook runs (game.js:46332–46338): if `state.arenaContest` is
live it clears it and calls `_contestArenaAfter(arc, result)`
(contests.js:4767). On `'won'` with waves left it says "WAVE N. The
gate opens again", re-sets `state.arenaContest`, and calls
`startCombat` for the next wave — **inside the won fight's tbEnd**,
before tbEnd returns (the interleave sim-tbend-a pinned). On `'lost'`
the death is already processed (see below) and it closes the show with
the 📺 death line. On fled/routed it ends the contest as a loss. The
firing condition for an arena death is therefore: a TB fight ends
`'lost'` while `state.arenaContest` is live.

**What `fallen: the arena` records.** The tbEnd loss branch
(game.js:46229) calls `playerDeath(this.tbFightDeathCause(f))`.
`tbFightDeathCause` (game.js:45863) is a label-only function with one
argument deciding every death record (registerDeath, fallen, lineage,
telemetry, death line). Its order: (1) `state.arenaContest` live →
`'the arena'`; (2) `fight.betrayal` → `'betrayal'`; (3) `tableTrial` →
`'the table trial'`; (4) `coalitionArena` → `'the coalition arena'`;
(5) monster-only, no hostile → `'the wild'`; (6) hostile fighter with
`alienPid` → `'a stranger'`; (7) anything else → **`'the arena'`**,
the default fallback. So `fallen: the arena` on a TB-fight death means
either a contest-arena bout was live, or the loss matched no named
branch at all. The two are told apart by the contest state at death —
which the corpus never recorded (see "Named instrument fixes").

**How an arena death differs from a TB-fight death in the recorders.**
It doesn't, in the fight rows: an arena bout IS a TB fight, so the
stageally instrument records it like any bout (entry row at startCombat,
outcome at tbEnd). What differs is downstream: the death runs the
contest's `_contestArenaAfter('lost')` branch (📺 death line, Resolve
beat, held-contest count, codex `'died'` knowledge, `activeContest`
cleared, co-taken fates resolved) instead of ending at the burial. The
only other `playerDeath('the arena')` call site in the code is the
legacy `arenaDeath` (ledger.js:1515), which has NO live callers (its own
comment says so) — every live arena death comes through the tbEnd loss
branch.

**The corpus death, re-derived.** Fritz (gen_93bg7ex, 53004 baseline,
d87) won an alien_tick (wave 2, 2 rounds, scholar 75% HP) and then died
in an Audit (wave 4) bout whose tbFight row stayed outcome `None`.
That is the Gauntlet shape — wave 1 won, wave 2 lost, death on the
later wave — and the replay below proves the same shape live with the
contest named. The Audit row's `None` is the PRE-fix tbend clobber,
verified by code archaeology: the corpus anchor (2ff11cbf) predates the
tbend-a instrument fix (1700ea5fc) — `git show 2ff11cbf:...` has no
`TBEND CHAIN` guard — and the pre-fix stageally tbEnd wrapper computed
`isCurrent` at entry and then nulled `_currentTb` unconditionally, so
the alien_tick tbEnd post-block destroyed the chained Audit row's
pointer (its own post-block still wrote `won` + rounds + HP fractions
to the alien_tick row, because `isCurrent` was captured before the
chain ran). The proof test's leg A confirms the current instrument
records the chained bout's row as `'lost'` with `scholarDiedInFight`
true. The corpus `None` is a recorder fossil, not a missing fight.

## The stranger, end-to-end (code trace)

**Who it is.** `apBuildFighter` (alienPlayers.js:417) builds a combat
fighter for an alien-player persona: `kind: 'hostile'` — "NOT a
monster — this is a person" — `alienPid: pid`, `name: apKnowsAlien(pid)
? p.name : 'Stranger'`, human emoji, HP 80 + 10/encounter, an ability
kit, alien tech, `ai: 'adaptive'`. The twelve personas are the alien
contestants (the "twelve strangers" of the opening). Pre-reveal the
fighter is named `Stranger` in the fight, in the feed, and in the codex
(`entry.title = 'stranger'`, `entry.name = 'someone'`) — the name is
gated knowledge ("if you don't know, it doesn't show"), earned by a
reveal, a System feed slip, a 3rd encounter with the same persona, or
spotting Wren at a dead drop.

**How the fight starts.** `apStartEncounter` (alienPlayers.js:480)
places the fighter 3–4 tiles away, says the treeline lines, sets
`state.alienEncounter = {pid}`, and calls `startAlienCombat`
(encounters.js:2710), which builds `this.tbfight` DIRECTLY — it never
calls `Game.startCombat`. That is why the corpus has no fight row for
David's death: the TB-fight instruments wrap `startCombat`/`tbEnd`, so
they see the fight end (tbEnd is shared) but never see it start. No
tbFight row, no rounds, no HP fractions — the fight is invisible to
the fight taxonomy while being fully real in the engine.

**How the death is recorded.** The scholar loses the TB fight →
`tbEnd('lost')` → `tbFightDeathCause`: no arenaContest, no betrayal /
tableTrial / coalition flags, fighters are player + hostile-with-
`alienPid` (plus any villager allies) → `'a stranger'`. The comment on
the branch is explicit: the cause reads `'a stranger'`, NOT `'an
alien'`, so it cannot leak a truth the player has not learned.
`fallen: a stranger` is therefore a real person-kill, not a fallback id
— the fallback for an unclassifiable loss is `'the arena'`, never
`'a stranger'`.

**The named stranger (replay, 53006 baseline, d29).** Blanca Cox
(gen_0djky10) died `a stranger`, away from Haven (2,2), in combat.
The capture wrapper names the killer: `alienEncounterPid:
'vex_marlowe'`; the fighter at death was key `ap_vex_marlowe`, kind
`hostile`, `alienPid: 'vex_marlowe'`, name `Stranger`, HP 100/100,
alive. (In the corpus the same villager died d20 to a stranger; the
replay's trajectory drifted to d29, but the channel and the person
reproduced.) The proof test's leg B reproduces the same kill live with
the same persona and asserts every field above.

**Not to be confused with.** "A stranger by the road" (53006 corpus
d57: "🌟 JACKPOT: A stranger by the road knows things. They talk for an
hour. You learn: Mediation, System Theology, Rally.") is a DIFFERENT
stranger system — a road-stranger encounter that teaches — not the
alien-player killer. The word is overloaded in the game; the fallen
cause `a stranger` is specifically the alien-player branch.

## Replay legs (same seeds, same baseline policy, 150d)

Per the prereg's stated contingency, BOTH replay legs diverged from
their corpus trajectories — the band is trajectory-fragile, as
killersurvive blank #5 warned (one-day RNG displacements cascade).
The divergence is reported, not hidden, and the mechanism is judged
from the replay's live captures + the synthetic proof legs, not from
the diverged trajectories.

| Leg | Corpus | Replay (anchor 5a4e3e4b5) |
|---|---|---|
| 53004 baseline | 105d village-lost, standing 199, scaleRank village, unlockedWave 4 | **85d** village-lost, standing 199, village, wave 4. gen_93bg7ex died d48 `the wild` (Algorithm) — the d87 arena death did NOT reproduce; the village died d85, two days early. No arena deaths on this leg. |
| 53006 baseline | 105d village-lost, standing 199, village, wave 4 | **125d** village-lost, standing 199, village, wave 4. gen_76n8yer died d65 `the wild` (Reunion) — the d86 stranger death did NOT reproduce. But BOTH channels reproduced with names: stranger d29 (Blanca / vex_marlowe), arena d115 (Sari / gauntlet). |

**The 53006 replay's arena death, in full (d115).** Contest
`gauntlet`, waves `[buffering, sunback, reunion]`:
- waveIdx 0 — Buffering (wave 3), `won`, 7 rounds, scholar 71% HP,
  3 allies beside the scholar (Shaker, Jamie, Adaeze).
- waveIdx 1 — Sunback (wave 1), `won`, 1 round, scholar 71% HP.
- waveIdx 2 — Reunion (wave 4), `lost`, 6 rounds, scholar −4% HP,
  monster 95.4% HP left, `scholarDiedInFight: true`. The Reunion
  arrived as THREE beasts ("Big Ugly 1/2/3") because it mirrors the
  party: `tactics.packSpawn {mirror: true, max: 3}` (monsters.json),
  count = min(3, partyN) via `tbPackSpawnCount` (partyTactics.js) —
  partyN 4 → 3. Death: sari_wulandari, cause `the arena`,
  `activeContestId: 'gauntlet'`, inCombat true.
- **Zero tbFight rows with outcome `None` in either replay leg** (the
  current instrument records every bout) — against the corpus's Audit
  `None`. The corpus shape is pre-fix.

## Sense-test — read the transcripts

**The arena death reads as a person dying in a place, on camera.**
Replay d115 deathSays: "📺 SYSTEM: 'Oh — OH. Everybody saw that,
right? Shaker just put down Buffering... on CAMERA. That's a veteran
kill, folks. REMEMBER the name.'" / "Another face surfaces — someone
you brought, or someone who brought you. 'You didn't think we'd come
alone?' The dead gather. (Allied monsters +4 damage, 2 turns.)" (×3,
the Reunion's trick firing) / "📖 The Codex turns a page on its own.
Sari Wulandari is dead. You didn't ask. It knew." / "🕯️ Sari
Wulandari is dead — the arena. The village stops. Somebody screams.
Somebody else starts digging." And the Gauntlet's own death line
(proof test, said verbatim by `_contestDeathLine`): "You almost
cleared the Gauntlet. ALMOST is what the Death Reel is for — it will
run the last ten seconds in slow motion, forever." The arc is complete
and coherent: contest, waves, a real fight the scholar nearly won, a
named death on camera, a burial. Nothing about it reads as
bookkeeping. The scholar walked into the Pit's bigger brother with
three friends, beat two beasts, and died to a pack that outnumbered
them three-to-one while barely scratched (95.4% HP left) — the fight
itself is the story, and the record says so.

**The stranger death reads as a person killed by an unnamed person —
and the unnamed-ness is the point.** Replay d29 deathSays: "🕯️ Blanca
Cox is dead — a stranger. The village stops. Somebody screams.
Somebody else starts digging." The encounter intro (proof test, said
verbatim by `apStartEncounter`): "👤 A figure steps out of the
treeline. Human-shaped. But something's wrong." / "They move like
someone who's done this before. Many times. On many worlds." The
codex entry after the encounter (proof test, `apCodexEntry`): title
`stranger`, name `someone`, note "A stranger crossed you out in the
wild. Moved wrong — too smooth, too practiced. You can't place why."
The fiction is consistent: the village buries a scholar killed by
someone it cannot name, and the game refuses to name them to the
player either, because the player hasn't earned the reveal. That is
knowledge-gating working as designed, not a bug — the "bug" reading
would require the game to print a persona name the player has no way
to know. The death reads as a murder by an unknown person, which is
exactly what happened.

**One recurring wrinkle, already flagged by killersurvive:** the grave
line names the successor mid-eulogy ("At the grave, Brian, Jamie,
Shaker and 5 more speak for David — 'Blanca trusted them...'"). It
reads as the village moving on to the next scholar before the burial
is cold. Slightly off, not broken; not this arm's business.

## Canon coverage (prereg (c))

- **The arena: COVERED.** docs/CONTESTS.md describes Blood contests
  (pit/gauntlet/siege), the arena as a place ("released into an arena",
  "The arena floor is sand and old bone"), the grid as the arena,
  multi-wave bouts with no rest, death on the table, and the aftermath
  as content. CANON.md's manifest lists CONTESTS.md. The engine
  matches the doc: real tactical fights, waves, no rest, televised
  death. No canon gap here.
- **The stranger / alien players: UNDESCRIBED in canon.** No canon
  design doc covers the alien-player system. It is documented only in
  docs/ONTOLOGY.md (the `alienPlayers` entry: they are HUMANS not
  monsters, exclusive pool, knowledge-gated identity, twelve personas,
  woven into contests/codex/gossip) and in code comments. CANON.md's
  manifest does not list it. That is a canon gap, not a code gap — the
  system is implemented and coherent, but Steve's design for it lives
  nowhere a builder is told to read first. (This is a documentation
  blank for the loop to file, not a build task for this arm.)

## Named instrument fixes (DIAG: named, NOT built — zero src/js)

1. **Alien fights are invisible to the fight taxonomy.** `startAlienCombat`
   bypasses `Game.startCombat`, so no tbFight row exists for any
   alien-player fight: no rounds, no HP fractions, no outcome, no
   `scholarDiedInFight` — the killersurvive census could only say "no
   fight row". The precise fix: in the stageally instrument (or a
   shared fight-row recorder), wrap `Game.startAlienCombat` the way
   `startCombat` is wrapped — open a tbFight row at fight start with
   the hostile fighter (mid null, kind `hostile`, `alienPid`
   recorded), and let the existing tbEnd wrapper close it (it already
   fires for alien fights; it only needs a current row to write to).
   One wrapper, same fields as monster fights.
2. **Death records don't name the contest or the stranger.** The
   corpus records no `activeContest`/`arenaContest`/`alienEncounter`
   at death, so the census had to infer the contest from the wave
   sequence and could not name the stranger at all. The precise fix:
   fold the capture in `scripts/arena-capture-20261107.js` into the
   stageally instrument's scholarDeaths rows — add `contestId`,
   `arenaWaves`, `arenaWaveIdx`, and `alienEncounterPid` fields, read
   at playerDeath time (pre-mantle). The wrapper is written and proven
   in this arm (it is what named Vex Marlowe and the Gauntlet); it
   needs only to be adopted into the stageally instrument, not
   re-derived.
3. **Say/sysSay are stubbed in sims, so death transcripts lose the
   📺 lines and encounter intros.** The harness stubs `say`/`sysSay`
   to no-ops unless `opts.narration`, so `Game.log` stays empty and a
   log-tail read finds nothing — the two replay legs in this arm
   recorded empty `logTail`s for exactly this reason. The capture
   wrapper now records its own 200-line say/sysSay tail (added in this
   arm, proven by the proof test's quote assertions); the replay legs
   ran the version before that fix. Future replay drivers should use
   the updated wrapper (or `opts.narration: true` / `captureSysSay`)
   when transcripts are evidence.

## What this arm does NOT claim

- Not a fix: zero src/js. The three fixes above are named, not built.
- Not a re-verdict on stageally/killersurvive: the census stands; this
  arm explains two of its residual channels (arena 1/7, stranger 1/7
  dead killers on the baseline leg).
- Not a contest-balance claim: no win/rate numbers are judged here.
- Not a claim that the corpus deaths reproduced: they did NOT (both
  legs diverged — 85d and 125d vs corpus 105d). What reproduced are
  the CHANNELS, with names attached, on the same seeds.
- Not a claim about the road stranger: the d57 teaching stranger is a
  different system; see above.

## Wall numbers (replay legs — per-seed, no panel)

National / table / wins: **0 / 0 / 0** on both legs (scaleRank
`village`, standing 199 both legs — the same standing the corpus
reached, on different days). Wave 4 unlocked, wave 5 not
(`unlockedWave: 4` both legs). Median survival: NOT a panel — the legs
are single seeds: 85d (53004) and 125d (53006); corpus 105d both.
Balanced panel (§15): INAPPLICABLE — no armed leg exists in this arm
(DIAG only, no before/after pair); no compare `.md` is fabricated.
Telemetry: `scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-07/perseed-arena-b/*.json' --metrics
national,table,wins,exiled` REFUSED — "refusing recorder-corpus
input: all 2 --current rows carry top-level anchorCommit". Same as the
prior arms. The wall numbers in this file are the instrument's own.

## Metric review

- Pre-registered DIAG-GO (a)(b)(c) binds this run. **All three met:**
  (a) the arena death path is traced end-to-end (open: `_contestArena`
  → chain: tbEnd hook → `_contestArenaAfter` → close: tbEnd loss
  branch → `tbFightDeathCause` → `playerDeath`) with the firing
  condition named (TB fight ends `'lost'` while `state.arenaContest`
  is live); (b) `a stranger` is identified as an alien-player persona,
  with a named killer (Vex Marlowe, 53006 replay d29) and quoted
  traces (treeline intro, codex note, burial line, proof-test
  fighter record); (c) canon coverage is stated (arena covered in
  CONTESTS.md; stranger system undescribed in canon, ONTOLOGY.md only).
  No metric was swapped, re-cut, or re-thresholded.
- **The prereg's divergence contingency was invoked as written:** both
  replay legs diverged, so the mechanism is judged from the live
  captures + synthetic proof legs, not from re-deriving a diverged
  trajectory. The divergence itself is a finding (see below), not a
  metric failure: the prereg said exactly this would be reported, not
  hidden.
- **A test assertion of mine was wrong and is corrected here, not
  hidden:** my first version asserted the Reunion "pack grew by death
  time (summoned allies present)" — i.e. that the 3-beast pack was
  summoned mid-fight. It failed (1 reunion at death, solo scholar),
  and the failure taught the real mechanism: the pack is set AT SPAWN
  by the party mirror (`tbPackSpawnCount`, `packSpawn {mirror: true,
  max: 3}`), not summoned. The test now brings a party (as the replay
  did) and asserts the 3-beast mirror pack — 57/57. The "Another face
  surfaces" line is the Reunion's trick firing, not a summon; the
  evidence above says so.
- **The capture wrapper changed mid-run, honestly:** the replay legs
  ran the version whose `logTail` reads `Game.log` — which is empty in
  sims because the harness stubs say/sysSay. The wrapper was then
  fixed to record its own say/sysSay tail; the proof test proves the
  fixed version (all quote assertions pass). The replay JSONs keep
  their empty `logTail`s; the quotes in this file come from the
  proof test (verbatim engine lines) and the replay `deathSays`
  (driver say-wrap), never from a reconstructed log.
- `atHaven`/`mapX,mapY` in scholarDeaths are the location at death;
  (4,4) is the haven tile. A death with inCombat True at (4,4) is a
  fight AT Haven, and the arena death at (4,4) is a contest bout
  fought on the home grid, not a "died at home in bed" death — the
  arena is wherever the grid is.

## Findings for the backlog (coordinator appends — do not edit sim-findings.md here)

- The alien-player / stranger system has no canon design doc: implemented
  and coherent, documented only in ONTOLOGY.md + code comments. Canon
  gap (arena is covered in CONTESTS.md; the stranger is not).
- The 53001–53008 band is trajectory-fragile across anchors: the
  killersurvive verify leg already saw staged 53004 diverge, and this
  arm's replays diverged on BOTH legs (53004: 85d vs corpus 105d;
  53006: 125d vs 105d, same standing 199, same endReason). The band
  re-uses are still valid for channel work, but exact-day claims on it
  do not survive a rebase — cite channels, not days.
- The Reunion mirrors the party (packSpawn mirror, max 3): a Gauntlet
  wave-3 Reunion against a 4-person party is THREE wave-4 beasts at
  1200–1400 HP each. A wave-4 killer's second fight can therefore be a
  3× wave-4 pack — the party that helps you win waves 1–2 is also what
  triples wave 3. Worth one look before the next arm re-uses Gauntlet
  as a killer-survival lever (the lever is precise: party size is the
  pack size).
- The grave-speaker line names the successor at the dead scholar's
  grave (replay d29/d115, same shape as killersurvive d96) — reads as
  the village moving on mid-eulogy; slightly off, not broken.

## Proof and commits

- Proof `scripts/test-arena-20261107.js`: **57/57 green** on this
  worktree (leg C taxonomy 8/8, leg A Gauntlet chain death, leg B
  stranger kill; regressions tbend 18/18, killersurvive 140/140).
  The proof caught one real error of mine (the pack-summon
  misreading, corrected to the party-mirror rule before the evidence
  file was written).
- Prereg committed before any judged work. Capture wrapper + replay
  driver + proof test + this evidence file + the replay corpus
  (`evidence/2026-11-07/perseed-arena-b/`, 2 files, 0 instrument
  errors) committed with this file.
- Worktree contains only committed work at closeout; branch ready to
  merge. No push, no version bump, no live verification (coordinator
  owns the merge).

## Convergence

**scale-onramp: converging, NOT converged.** Killersurvive blank #6
(the arena and the stranger) is now closed: both residual death
channels are named mechanisms, not mysteries — a Gauntlet death is a
contest death with waves and a death line, and a stranger death is a
murder by a named alien player the village cannot name. Neither is a
recorder artifact (the corpus Audit `None` was, and it is explained
as the pre-fix clobber). What remains is the instrument work named
above (alien fights into the fight taxonomy; contest/stranger ids onto
death records) and the canon blank (no design doc for the alien
players). The winnability chain itself is untouched by this arm: 0
wins, 0 national, 0 table on both replay legs, and the Gauntlet's
party-mirrored Reunion pack is a live reason killers keep dying in
their second fight.
