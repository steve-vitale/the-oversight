# sim-winnability-round-0420 — Loop B 0420Z coordinator evidence (axis winnability chain — 3 arms LANDED, merged locally pending ship)

Run: fleshout-loop-b-20261107T0420Z (Loop B). Axis: scale-onramp /
winnability chain. Lock + claim written at run start; Loop A LIVE on its
0221Z claim the whole run (finishersize + durablepair + killersurvive-b +
practicemove, NOT touched — its finishersize-a tree stayed active at
closeout and a new sim-nextfight-a tree appeared mid-run). The body's
re-point queue resolves against the tracker: (1) arm-2 toggle — CLOSED
(toggle-confirm family closed 0630Z); (2) flee-repair build — game-code
port is STEVE CALL, not built here; (3) standing accumulation — answered
by the veterans-lock decomposition. This run therefore worked the
tracker's topmost unclaimed blanks from the 0230Z list: (1) stageally
confirm re-run on current master, with (2) trajectory-distance secondary
folded in; (6) alien-player canon gap; (7) Gauntlet Reunion pack as
second-fight killer. Blanks (3) FINISHER-SIZE, (4) durable-pair re-judge,
(5) killer-survivorship NEXT-FIGHT SURVIVAL held by Loop A's live claim
— NOT duplicated.

## Arm 1 sim-stageally-confirm2-b — GO (merged 85e26f498)

Re-run of the stageally confirm on current master, SAME band 53001–53008
(DELIBERATELY REUSED — a re-run, not a fresh band; reuse record in the
prereg), SAME frozen policy
(`scripts/policies/competent-stageally-a.js`, unmodified), SAME
instrument/driver/analyzer, SAME prereg bar as confirm-b. Proof
`scripts/test-stageally-20261106.js` 45/45 green before the judged run;
new `scripts/test-stageally-trajdist-20261107.js` 5/5. Commits:
prereg + trajdist 74059c4d → rebased 718bccd1d; evidence bdafc033 →
d523b733b; corpus 936ffea1 → 85e26f498. Evidence:
`evidence/2026-11-07/sim-stageally-confirm2-b.md`; prereg
`evidence/2026-11-07/sim-stageally-confirm2-b-prereg.md`; corpus
`evidence/2026-11-07/perseed-stageally-confirm2-b/` (16 files, 0
instrument errors).

**Verdict: GO by the frozen bar, on BOTH routes.** Living-pair seeds
armed 2/8 (bar ≥ 1): 53006 pair snapshot day 89, 42 pair days, max 3
simultaneous veterans; 53007 pair day 141, 11 pair days. Post-first-blood
wave-4 kills armed 14 (bar ≥ 3; baseline 8). Guard holds: median survival
114.5d vs 96d (+18.5d). THIN checks clear first: rally fires 60/60 (T1
≥ 8); ally presence 85.7% of wave-4+ TB fights (T2 ≥ 40%, 70 fights).
Wave-4+ kills 13 → 20 (wave-4-only 13 → 15; wave-5 kills 0 → 5, all on
53006); TB survival 23.0% → 37.1% — the first reversal of the confirm-b
shape (armed used to lose more fights); party-days ≥2 30 → 328; invites
52, accepted 26 (50%). 53006 staged reproduces the trajfrag unperturbed
leg EXACTLY (150d, standing 440, 11 kills, wave 5, 2 living veterans) —
deterministic on this master.

**The confirm-b NO-GO does not survive current master — but the GO is
master-sensitive.** New trajectory-distance secondary: 53006 staged moved
D=13.65 between masters while its baseline moved D=0.133; 53007 staged
8.74 vs baseline 4.42. Neither clean prereg reading holds — the flip is
master movement amplified through a fragile staged trajectory. The GO is
real on this master with no change to the lever; the same band NO-GOed
one master ago. Read it as "the lever works on this master on this band"
— and the next master may say otherwise again.

**Caveats, plainly:** first-killer survival still below the 19d bar
(armed median 10.5d vs baseline 22d — the pair formed through production
speed, not longevity); 0 wins / no table / no seat (53006 held two living
veterans 42 days and never sat); 53004 and 53008 went backwards armed
(3→1, 4→0). Pooled n=24 (pilot + confirm + re-run): kills 24 → 31, pair
seeds 0 → 3, wave-5 unlocks 0 → 2, ready-5 days 0 → 60, median 104 → 110.
Sense-test: rally lines read as a person taking charge; accept lines
still repeat verbatim across people/seeds (third sighting); the "veteran
kill" announcement still fires for non-wave-4 kills (third sighting).

## Arm 2 sim-gauntlet-pack-b — Q1 DIAG-GO / Q2 DIAG-NO-GO / Q3 DIAG-GO (merged f17e1bbf5)

DIAG only, zero src/js. Prereg committed first (ca126298e → 938cb251c);
evidence + proof + driver + corpus e7d3202df → f17e1bbf5. Evidence:
`evidence/2026-11-07/sim-gauntlet-pack-b.md`; prereg
`evidence/2026-11-07/sim-gauntlet-pack-b-prereg.md`; corpus
`evidence/2026-11-07/perseed-gauntlet-pack-b/` (8 replay + 3 sweep
JSONs, 0 instrument errors). Proof
`scripts/test-gauntlet-pack-20261107.js` 46/46 green; regressions arena
57/57, tbend 18/18, killersurvive 140/140. Sweep driver
`scripts/gauntlet-sweep-20261107.js` (84 Gauntlet chains total across
replays + 3 sweeps; 13 wave-3 deaths).

**Q1 DIAG-GO: the wave-3 pack IS party-mirrored — but the mirror lives in
the Reunion def (`packSpawn {mirror:true, max:3}`), not the Gauntlet.**
The Gauntlet draws 3 beasts at random from the unlocked pool
(`_contestArena`, contests.js:4717; Gauntlet phase `{waves:3}`, :3040).
Live proof: identical wave list, 3 Reunions with a party vs 1 solo. Live
pools measured: 58 at wave 4, 64 for the wave-3 hot pool (not JSON 59/69
— Herald excluded by the titans.js pool wrapper). P(Reunion)/draw ≈
1.6–1.7%.

**Q2 DIAG-NO-GO (claim falsified, per the prereg's own falsification
clause; the measurement is complete): the wave-3 pack is NOT
systematically the killer's second fight.** 0/4 replay Gauntlet deaths
were wave-4 killers — including Sari herself (she was a veteran with a
wave-3 kill, not a wave-4 killer). Sweep deaths spread 7/7/5 across
waves 1/2/3 (primary sweep, 32 chains, partyN 4); only 1 of 5 wave-3
deaths was a Reunion pack. What IS systematic: the Reunion kills wherever
drawn — 6/6 fought draws fatal, on waves 1, 2 and 3 alike.

**Q3 DIAG-GO:** deciding observation held exactly as pre-registered (3
partied vs 1 solo, same list).

**Named fix (NOT built — needs a design call):** if Steve wants the
Reunion pack blunted in the arena, the lever is the monster def / spawn
path (cap the mirror for arena fights, or exclude pack-spawners from the
wave-3 hot pool) — the mirror is Steve's party-aware law, so it is a
design call, not a bug fix. No Gauntlet change follows from Q2.

**Caveats:** sweep v1 ran at partyN 5 and v2 at partyN 3 (staging bugs,
documented in the evidence and driver); only v3 (partyN 4) + replays are
primary. The staged sweep scholar is fresh (100 HP, no gear), so sweeps
overstate real-Gauntlet lethality — the replay legs (real scholars/gear)
are the counterweight and agree on the shape.

## Arm 3 sim-alienplayer-canon-b — DOCS-GO (merged 06b93e063)

Docs only, zero src/js. Commit 06b93e063 (5 files, +559/−1). New canon
doc `docs/ALIEN-PLAYERS.md`; manifest row + changelog in `docs/CANON.md`;
pointer section in `docs/CONTESTS.md`; Q1–Q3 in `docs/OPEN-QUESTIONS.md`.
Evidence + 28-row trace table:
`evidence/2026-11-07/sim-alienplayer-canon-b.md` (every canon claim
mapped to code file + function or evidence section; the trace table is
the proof — prose needs no test file). Wall numbers N/A (docs-only arm).

**The brief was wrong on one fact — corrected, not repeated: the roster
is EIGHT personas, not twelve.** `src/data/alienPlayers.json` (the only
persona source, loaded as `this.data.alienPlayers`) holds 8 entries — 7
combat + Wren (non-combat). "Twelve" appears nowhere in code, data, or
canon docs. The canon doc states eight, flags the correction prominently,
and asks Steve (Q1) whether eight is intended or four were never
built/cut. The sim-findings.md entry that said "twelve" is corrected to
eight in this run's closeout. Open questions for Steve: Q1 roster size (8
vs 12); Q2 the overloaded word "stranger" (road teacher vs alien killer
— default keep both); Q3 alien players as contest opponents vs
meddling-only (verified by grep: no contest code builds an alien
fighter; default meddling-only).

## Wall (pooled judged corpora, this run)

Stageally-confirm2 (16 configs): wins 0, national 0, table 0; wave-5
kills 5 armed (all 53006); readiness-5-ready days 42 armed (53006) + 11
(53007); median survival 96d → 114.5d. Gauntlet replays (8 legs): wins
0/8, national 0/8, table 0/8; wave 4 unlocked 7/8, wave 5 0/8; wave-4
kills 13, wave-5 kills 0; readiness-5-ready 0 legs (veterans 0–1 vs
demand 2, binding); median survival 96d. No village banks two living
wave-4 killers and sits — except 53006 staged, which holds the pair and
the wave-5 unlock for 42 days and still never sits (see next blanks).

## Telemetry deviation check

REFUSED on the stageally-confirm2 corpus (recorder-corpus input, same
refusal as every prior killer-chain arm) — no LOUD lines, baseline NOT
rolled, no compare `.md` fabricated. Balance-panel `--help` refuses
(`--out <panel-directory> required`) and takes no corpus input — same
honest refusal as the confirm-b prereg recorded.

## Infrastructure

- Worktree registration took ~12 min (3 trees, slow git ops under
  sibling load); releases ~5 min. No EPERM flap this run.
- Master moved once under the run (journey-landing r112, dc9d70871, run
  notes only, zero overlap with any arm); both sim branches rebased onto
  the explicit master SHA read immediately before rebasing (stageally
  onto 06b93e063 clean 3/3; gauntlet onto dc9d70871 clean 2/2), proofs
  green after every rebase and on every merged tip (stageally 45/45 +
  5/5; gauntlet 46/46).
- Safe-commit index clobber hit on all three stageally commits, both
  gauntlet commits, and the canon worker's commit — repaired via
  HEAD-blob cacheinfo each time, blobs verified matching HEAD first;
  commits always correct. `safe-commit.sh` does not accept directory
  paths — the stageally corpus commit needed the expanded 16-file list.
- check.js --quick NOT re-run: zero src/js in all three arms, zero
  green-list files; standing profile just recorded by journey-landing
  r112 on this master line (281/9 and 283/7, 7 failures adjudicated
  pre-existing on base). The canon worker's check.js attempt was killed
  at ~11 min with zero output under box load ~22 — recorded honestly in
  its evidence file, not a failure.
- Loop A live the whole run (0221Z claim; finishersize-a active at
  closeout, new sim-nextfight-a tree appeared mid-run) — NOT touched.
  Sibling context: build-brain-p1 still active (main session).

## Findings appended / corrected (sim-findings.md)

- Alien-player canon-gap entry corrected: "twelve" → eight (8 personas,
  7 combat + Wren), marked [fixed] by sim-alienplayer-canon-b (06b93e063).
- Gauntlet pack entry marked [fixed] with the Q2 correction: the pack is
  the Reunion's mirror, not the killer's second fight (Q1 GO / Q2 NO-GO /
  Q3 GO, f17e1bbf5).
- Stageally NO-GO entry marked [fixed]: re-run GO by both routes on
  current master (85e26f498), master-sensitive attribution.
- New open: rout ends a Gauntlet as a loss (5–19% of chains); party
  re-drafts every wave from post-fight positions; scholar HP rises
  between Gauntlet waves (+12–24%, mechanism unmeasured); sweep chain-20
  instant-chain anomaly (1/32); "veteran kill" hype line fires for a
  wave-3 kill; "veteran kill" announcement fires for non-wave-4 kills
  (third sighting, stageally-confirm2-b); trust-too-low refusal floods
  transcripts (stageally-confirm2-b).

## Axis state

scale-onramp stays converging (NOT converged): the stageally GO is real
on current master and the first lever to bank a living pair on two seeds
— but it is master-sensitive (the same band NO-GOed one master ago with
no change to the lever), first-killer survival still misses the 19d bar,
and no village has banked two living wave-4 killers and sat. The full
seat is still unreached; wins are still 0 on every judged corpus. Next
blanks, in order: (1) the sit step on 53006 — pair held 42 days, wave 5
unlocked, no seat; what blocks sitting once the pair is banked? (2)
stageally stability — re-check the GO on the next master, or find the
mechanism-level answer for why staged trajectories amplify master
movement; (3) Reunion draw/mirror as the arena lethality lever — Steve
call (cap the mirror for arena fights, or exclude pack-spawners from
the wave-3 hot pool); (4) first-killer survival — pairs form through
production speed, not longevity (median 10.5d vs 19d bar); (5) "veteran
kill" hype line fires for non-wave-4 kills (third sighting) + accept
lines repeat verbatim (third sighting) — narration pool work; (6)
FINISHER-SIZE build — Loop A live, do not duplicate; (7) durable-pair
re-judge — Loop A 0221Z landed NO-GO on the durable bar, next step is a
loop call; (8) killer-survivorship NEXT-FIGHT SURVIVAL lever — Loop A
live (sim-nextfight-a), do not duplicate; (9) measurement neutrality
proof refresh #1353 (Oct 29 stale); (10) capable-bot food-deed failure
#1830 (owner: likely stayrecover); (11) balance levers — Steve call;
flee-repair port — Steve call; pellet-bearer lock (#1819) — Steve call.
food-economy stays converging (NOT converged): untouched by this run.
Claim deleted; lock deleted.

Evidence: evidence/2026-11-07/sim-winnability-round-0420.md (this file;
stageally-confirm2 85e26f498; gauntlet-pack f17e1bbf5; alienplayer-canon
06b93e063). All three arms merged locally, pending ship.
