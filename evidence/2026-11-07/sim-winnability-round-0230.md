# sim-winnability-round-0230 — Loop B 0230Z coordinator evidence

**Run:** fleshout-loop-b-20261107T0230Z (axis scale-onramp / winnability chain) ·
**Arms:** sim-arena-b + sim-trajfrag-b, both DIAG-GO, both merged locally pending ship ·
**Base at run start:** 5a4e3e4b5 · **Master at closeout:** 0d3c46971

## Arm 1 — sim-arena-b (merged 7ad7e376c, proof 57/57, zero src/js)

DIAG-GO. The arena is a Blood contest (Pit 1 wave, Gauntlet/Siege 3 waves):
`_contestArena` sets `state.arenaContest`, suspends the modal, starts a real
turn-based fight on the grid; `tbEnd`'s tail hook calls `_contestArenaAfter`,
which chains the next wave INSIDE the won fight's `tbEnd`. A TB fight ending
`'lost'` while `state.arenaContest` is live dies via
`playerDeath(tbFightDeathCause(f))` → `'the arena'`. Live proof: 53006 replay
d115, Sari died in contest Gauntlet, waves [buffering, sunback, reunion], won
7 rounds, won 1 round, lost wave 3 to a THREE-Reunion pack in 6 rounds
(monster 95.4% HP left).

'a stranger' is an alien player: `apBuildFighter` makes kind `'hostile'`
with `alienPid`, named `'Stranger'` pre-reveal (one of twelve alien players).
Replay named the killer: Vex Marlowe killed Blanca Cox (53006 baseline d29;
fighter `ap_vex_marlowe`, hostile, name `Stranger`, 100/100 HP). The fight
bypasses `Game.startCombat` (`startAlienCombat` builds `tbfight` directly),
which is why the corpus has no fight row — mechanism, not a gap. Sense-test:
both deaths read as people dying, not bookkeeping; the stranger's
unnamed-ness is deliberate knowledge-gating. Canon: arena covered in
CONTESTS.md; the alien-player system is undescribed in canon (ONTOLOGY.md
only) — a canon gap, filed in the backlog. Regressions: tbend 18/18,
killersurvive 140/140. Replays diverged in days from the corpus as the
prereg's contingency allowed (53004: 85d, 53006: 125d vs corpus 105d); both
channels reproduced with names. Zero `tbFight` rows with outcome `None` in
either replay (fixed instrument).

Named instrument fixes (not built): (1) wrap `Game.startAlienCombat` in the
fight-row recorder so alien fights get tbFight rows; (2) fold the arena
capture into the stageally instrument's scholarDeaths rows (`contestId`,
`arenaWaves`/`arenaWaveIdx`, `alienEncounterPid` at playerDeath time) — the
wrapper is written and proven in this arm; (3) say/sysSay stubbed in sims so
`Game.log` stays empty — the capture wrapper now records its own 200-line
say/sysSay tail.

Wall (arena corpus): national/table/wins 0/0/0 both legs; wave 4 unlocked,
wave 5 not; standing 199. Evidence: evidence/2026-11-07/sim-arena-b.md (+
prereg, corpus perseed-arena-b/, scripts test-arena-20261107.js,
arena-capture-20261107.js, arena-replay-20261107.js).

## Arm 2 — sim-trajfrag-b (merged 0d3c46971, proof 31/31, zero src/js)

DIAG-GO. One extra `Math.random()` draw at day 0 flips the seed-matched
verdict on 3 of 4 seeds (band 53001–53008, deliberate reuse, staged policy,
150d, current master). Every first divergence is the first wave-1 kill,
days 5–8.

| Seed | Unperturbed | Perturbed | Class | First diverging event |
|---|---|---|---|---|
| 53002 | 150d survived, 1 kill, 0 vets | 133d lost, 0 kills, 0 vets | FRAGILE | d8 first kill: anaconda_empress → murkcap |
| 53004 | 88d lost, 1 kill, 0 vets | 106d lost, 3 kills, 0 vets, wave 5 | STABLE (class holds; trajectory rewritten) | d7 first kill: drumbelly d7 → murkcap d9 |
| 53006 | 150d survived, 11 kills, 2 vets, wave 5 | 73d lost, 1 kill, 0 vets | FRAGILE | d7 first kill: drumbelly d7 → mirrormoth d5 |
| 53008 | 123d lost, 0 kills, 0 vets | 150d survived, 1 kill, 1 vet | FRAGILE | d5 first kill: cliffhanger d5 → hummice d6 |

Flip rate 3/4. Bisect (read-only staged re-runs of 53004): 2ff11cbf
CORPUS-LIKE → parent a3f59fe35 CORPUS-LIKE → **3e82c17d1 VERIFY-LIKE** →
2a33c6afc VERIFY-LIKE. Mover: 3e82c17d1 (pocket_sand once-per-fight +
losing-control-first in `competent.js`). Moot convening (e53e86531)
EXCLUDED — divergence predates it. Journey r132 EXCLUDED — touches no
code the stageally driver loads, and predated by the divergence too.

Loop-level flag: current master ≠ corpus. Unperturbed 53006 staged on
current master: 11 kills, standing 440, wave 5, 2 living veterans — the
stageally NO-GO's "the pair never forms" (0/8 seeds, both legs) does NOT
hold on this seed anymore. A confirm re-run on current master is owed
before anyone leans on the NO-GO. Driver fidelity proven: the original
stageally driver on current master reproduces the unperturbed legs
byte-identically. Metric review: first analyzer compared daily rows by
index and misreported a snapshot-cadence artifact on 53002; fixed to a
day-keyed join before the evidence file was written (proof 27→31); CLASS
verdicts unaffected. Proposed next: a trajectory-distance secondary
alongside CLASS, since stable-class 53004 hides a full rewrite.

Wall (trajfrag corpus): wins/national/table 0 both legs; wave-4 unlock 4/4
both; wave-5 unlock 1/4 each — but a DIFFERENT seed (53006 unperturbed,
53004 perturbed); median survival 136.5d → 119.5d. Evidence:
evidence/2026-11-07/sim-trajfrag-b.md (+ prereg, corpus
perseed-trajfrag-b/, analysis trajfrag-b-analysis.json, scripts
test-trajfrag-20261107.js, trajfrag-instrument/driver/analyze-20261107.js).

## Pooled wall (this run's judged corpora)

Wins 0, national 0, table 0 everywhere; wave-5 unlocks on 2 of 8 trajfrag
legs (different seeds per leg) and 0 on the arena legs; living wave-4
killers at end: 2 on 53006 unperturbed, 1 on 53008 perturbed, 0 elsewhere.
No village banks two living wave-4 killers and sits — except 53006
unperturbed, which has the pair and the wave-5 unlock but no seat (the
seat was never the question this run asked).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-07/perseed-trajfrag-b/*.json' --metrics
national,table,wins,exiled`: REFUSED — "refusing recorder-corpus input:
all 8 --current rows carry top-level anchorCommit". Same refusal on the
arena corpus (worker-run). No LOUD lines, baseline NOT rolled. Balanced
panel (§15) inapplicable — both arms DIAG, zero src/js, no Game-root
change, no armed-vs-baseline policy pair; no compare `.md` fabricated.

## Re-point queue reconciliation (body queue vs tracker)

The body's re-point queue items resolve against the tracker as of this
run: (1) arm-2 toggle run — CLOSED (toggle-confirm family closed 0630Z:
gearoff GO, trickoff GO, sigoff NO-GO); (2) flee-repair build — the
flee repair itself was built as policy and confirmed GO by Loop A Nov 4;
the game-code port is flagged STEVE CALL on scope in the tracker
(0030Z/0130Z/2130Z/0130Z-Nov7) and was NOT built here; rage re-press was
closed NO-GO by 2130Z ragerepress-b; (3) standing accumulation on
gear-ready seeds — answered by the veterans-lock decomposition
(standaccum-b diplomacy-absent, standaccum3-b flat-20 fixed, vetprod-b
4/4 tie, standing99 defer4 lock). This run therefore worked the
tracker's topmost unclaimed blanks instead: 53004 trajectory fragility
(5) and arena/"a stranger" (6) from the 0130Z/0059Z next-blanks lists.
Loop A held (1)–(4) (finishersize, durablepair, killersurvive,
practicemove) the whole run — NOT touched.

## Sibling context

Loop A live on its 0221Z claim the whole run (NOT touched). It landed
mid-run: practicemove-a 94e30daef, durablepair-a 06b2ecb42,
killersurvive-b 3f9f793f8 + 1fb702088 + 093e134fc, journey-scale r106
7000f5684. Master moved 5a4e3e4b5 → 093e134fc under the trajfrag arm;
trajfrag rebased onto the explicit SHA 093e134fc (clean, 4/4 picks, no
quirk), proof re-run 31/31 on the rebased tip, merged ff-only as
0d3c46971. Arena merged ff-only directly (master unmoved at the time)
as 7ad7e376c; proof 57/57 re-verified on merged master. Finishersize-a
still live at closeout (heartbeat 04:11:34Z). Main session's
build-brain-p1 and playtest loop 2's journey2-succession-r151 also
active — not touched.

## Infrastructure

- Service restart interrupted the arena worktree registration mid-way:
  trajfrag registered, arena branch existed with no worktree/registry
  entry. Verified state, deleted the orphan branch (at master, 0 commits
  ahead), re-registered clean. No work lost.
- Safe-commit index clobber hit the arena worker commit once + all 4
  trajfrag worker commits — repaired via HEAD-blob cacheinfo each time,
  hashes verified byte-identical first; commits always correct. No
  clobber on the coordinator evidence commit.
- One trajfrag heartbeat attempt blocked on the registry flock under
  load and was killed before running anything — no work lost.
- Git operations slow under sibling load throughout (registrations
  ~2–3 min, releases ~15 min, `git status` multi-minute). No EPERM
  flap this run.
- check.js --quick NOT re-run: zero src/js in both arms, zero green-list
  files; standing 283/7 profile just recorded by sibling landings on
  this master line (journey-crisis r150 gate 283/7).

## Findings appended (6)

Alien-player canon gap; Gauntlet party-mirrored Reunion pack; band
53001–53008 trajectory-fragile across anchors (cite channels, not
days); stageally NO-GO not reproducing on current master for 53006
(confirm re-run owed); grave-speaker line third sighting; SHUTDOWN 7×
flood (log noise). See hidden_files/sim-findings.md tail.

## Convergence

**scale-onramp: converging, NOT converged.** The 53004 divergence is
now explained (a fight-policy change moved the trajectory one day, and
the village followed), the arena and the stranger are named (a Blood
contest's Gauntlet waves; an alien player, Vex Marlowe), and the
fragility number is 3 in 4 seeds flipping on a single random draw — but
no lever in this run moves the wall: wins are still 0 everywhere, the
full seat is still unreached, and no village banks two living wave-4
killers and sits (53006 unperturbed holds the pair without a seat).
Next blanks, in order: (1) stageally confirm re-run on current master
(53006 pair — the NO-GO may not survive it); (2) trajectory-distance
secondary alongside CLASS on the next fragility/confirm run; (3)
FINISHER-SIZE build — Loop A live, do not duplicate; (4) durable-pair
re-judge landed NO-GO by Loop A 0221Z — next step is a loop call;
(5) killer-survivorship NEXT-FIGHT SURVIVAL lever (named by Loop A's
killersurvive-b); (6) alien-player canon gap; (7) Gauntlet Reunion pack
as second-fight killer; (8) measurement neutrality proof refresh #1353
(Oct 29 stale); (9) capable-bot food-deed failure #1830 (owner: likely
stayrecover); (10) balance levers — Steve call; flee-repair port —
Steve call; pellet-bearer lock (#1819) — Steve call. food-economy stays
converging (NOT converged): untouched by this run. Claim deleted; lock
deleted.
