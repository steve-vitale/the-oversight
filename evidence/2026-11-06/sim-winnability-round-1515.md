# sim-winnability-round-1515 — Loop A coordinator evidence (baseline9 DIAG-GO + congtrace DIAG-GO)

**Run:** fleshout-20261106T1515Z, Loop A, axis scale-onramp / winnability chain ·
**Arms:** sim-baseline9-a (DIAG-GO) + sim-congtrace-a (DIAG-GO) · **Merged locally,
pending ship** (ship loop owns push/bump/live verification). Master at closeout
f18a88a65. No gate/price/deed/readyDemand change in either arm. No new seed
band consumed (committed corpus + deterministic reproduction on 53001–53008).

**The one-line result, plainly:** both of the tracker's open winnability
blanks are now closed with answers, and one of them is a bug. The baseline
killed 9 wave-4 monsters to the staged leg's 3 because it won more of the
fights it entered — not because it had a private road to kills — and the
famous 1-round solo Congregation kill, the confirm's only post-first-blood
kill on the armed leg, was a monster born at 20 HP by a spawn bug. The
armed leg's post-first-blood count on this band is effectively **0 genuine
kills, not 1**: the funnel is one kill thinner than the confirm reported.

## Arm 1 — sim-baseline9-a: why baseline killed 9 (DIAG-GO)

- **Commits (on master):** d1cecbb72 (prereg), 18b2d4d9a (analyzer + proof),
  371486eae (evidence). **Proof:** `scripts/test-baseline9-20261106.js` 23/23
  green on the rebased tip and on merged master. **Corpus:** the committed
  stageally-confirm corpus `evidence/2026-11-06/perseed-stageally-confirm-b/`
  (16 files, anchor 2ff11cbf) — no fresh sims, no new seeds.
- **Answer:** the 6-kill gap decomposes as scholar-TB +3, companion-TB +2,
  wild-field +1. Both baseline companion kills happened with the scholar
  standing in the fight, alive, while the companion landed the last blow —
  the exact shape the staged policy is built to produce — and the armed leg
  had more of those fights (27 ally-present vs 15) and converted none. The
  wild kill came from a field fight; the armed leg had more field fights
  too (26 vs 20) and converted none. The baseline won 8/34 TB fights vs
  3/37 staged. Pooled n=16 is 11 vs 11, so band draw flips the sign — but
  within this band the direction is systematic (baseline ahead on 5 seeds,
  armed on 0). Rally cost is ruled out by fightinterior-b's fresh-band
  recorder (round-1 scholar damage 0 in 59/59 fights); this corpus's proxy
  is uninformative (27 calls over-match to 30 rows, comparison cell n=2).
- **Corrections to the confirm record:** (1) `scholarChannel=false` only
  means the killer isn't the scholar — both companion kills had the scholar
  alive in the winning fight (HP 0.31, 0.36). The confirm's "scholar NOT in
  the fight" gloss is wrong. (2) "Field fights killed 0 wave-4 monsters"
  is wrong as stated — the wild kill (53002 d143 Influencer) IS a field
  `vKill`; field fights killed 1 on the baseline leg, 0 armed.
- **New edges (backlog):** both companion kills are same-day grind finishes
  (2–4 prior fights, wound trails 0.667→0.138→0 and 0.705→0.26→0, costing 2
  and 5 scholar deaths) — whether grinding a wounded beast at that price is
  the intended road to wave-4 kills is a design question. A 159-round rout
  (53001 d41 Congregation, both legs, scholar HP 1.0 at end, monster ~0.59)
  neither side can finish. The veteran-kill announcement fires for
  companion kills (2/2) and lower-wave kills but misses scholar wave-4
  kills (0/8 observable).
- **Citation staleness (mine, not the arm's):** the baseline9 evidence file
  cites its prereg as 307b9d66d — that is the pre-rebase commit (still an
  object, dangling); the on-master prereg commit is d1cecbb72, same message
  and content. No re-run needed; the record stands with this note.

## Arm 2 — sim-congtrace-a: the 1-round solo Congregation kill (DIAG-GO)

- **Commits (on master):** 84c6739f7 (prereg), c649bc745 (driver + analyzer +
  proof), 25bd32c49 (evidence + corpus), f18a88a65 (rebased-tip check).
  **Proof:** `scripts/test-congtrace-20261106.js` 36/36 green. **Corpus:**
  `evidence/2026-11-06/perseed-congtrace-a/` (1 file, anchor 360af49ed).
  Seed 53006 staged re-run twice to /tmp (byte-identical) + judged leg —
  every headline reproduces the confirm corpus exactly (150d survived,
  standing 175, kills d89 Strike + d149 Congregation, same succession days,
  same scholar deaths). Seed 53006 is deterministic on current master.
- **Answer:** the Congregation entered at **20 HP out of a supposed
  900–1100** and died to one ordinary 56-damage scholar strike in round 1.
  No ability, no trick, no ally; the beast never acted; the scholar took 0
  damage (she entered at 76.4% and ended there). The fightinterior-b shape
  guess (wounded entry) was right in shape, wrong in mechanism — wounded at
  birth, not ground down in the field.
- **Root cause (a spawn bug, fix NAMED not built):** the wanderer-contact
  spawn (`src/js/game.js:24384`) hands `spawnWorldMonster` a bare
  `{id, veteran}` object, but the spawner only looks up the monster's real
  numbers when given a plain name — so it falls back to the `|| 20`
  default and the beast is born at 20/20. Proved live: the Congregation
  spawned day 75 at 20/20, drifted unfought for 74 days (zero Congregation
  field fights in either corpus), and was lifted into the d149 fight at its
  current HP by the designed world-HP rule. A second Congregation spawned
  day 150 at the normal 900/900. The same shape hits the trap spawn
  (`game.js:23565`, accidentally harmless for its glasswing darter, wrong
  in general) and the finale-campaign spawns (unproven for titans). The d89
  Strike kill on this seed entered at 750/1000 — genuine, not crippled.
- **Sense test:** the d149 kill has no captured fight lines at all — no
  rally, death, or veteran-kill line naming the beast. A wave-4 kill
  passing without a line is, accidentally, the honest fiction for a 20-HP
  beast folding to one swing.
- **Follow-up (backlog):** census past corpora for wave-4+ traces with
  entry HP < 100 — recorded wave-4 kills may include other 20-HP spawns.
  Recorder edge: a first-strike kill loses its verb row (tbEnd closes the
  trace before the verb wrapper's post-call push); the hit log stays
  authoritative.

## Wall (this run's judged corpora)

Wins 0, national 0, table 0 everywhere (diagnostic corpora, not wall
corpora); wave-5 kills 0; no seed banks two living wave-4 killers and
sits. With the d149 kill reclassified as a spawn artifact, the confirm
band's armed post-first-blood count is 0 genuine — the funnel's second
killer never arrived on this band at all. The binding constraint is
unchanged in shape (wave-4 kills + killer survival) but the kill count
itself is now suspect wherever a wanderer-cast monster is involved.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-06/perseed-stageally-confirm-b/*.json' --metrics
national,table,wins,exiled` — REFUSED (recorder corpus, all 16 rows carry
top-level anchorCommit). Same refusal on `perseed-congtrace-a/*.json`
(1 row). No LOUD lines; baseline NOT rolled. Balanced panel (§15)
INAPPLICABLE for both arms (no armed leg — no compare .md fabricated).

## Metric review

Both arms are DIAG arms judged against pre-registered rules committed
before any judged work (baseline9 prereg d1cecbb72; congtrace prereg
84c6739f7). No metric was swapped, re-cut, or re-thresholded after the
run. The congtrace arm's DIAG-GO rests on a reproduction + a damage
account that closes with no remainder (56 ≥ 20), not on a fresh-band
claim. The baseline9 arm's DIAG-GO rests on a complete 12-kill census
with matched fight rows. The confirm's NO-GO stands; this run explains
it, it does not re-score it.

## Infrastructure

- **EPERM write flap (this run, ~15:53–16:21Z):** worktree registration
  failed twice — first after ~7 min (`git worktree add` unable to write
  files, "fatal: Could not reset index file to revision 'HEAD'"), then
  on the fallback (branch existed; `could not write to
  '.git/worktrees/sim-baseline9-a/locked'`). A single probe success at
  16:09:31Z was a blip, not a clear — the flap returned within minutes.
  Sustained-clear gating (6 consecutive O_EXCL probes over ~60s) caught
  the real clear at ~16:21Z; registration then completed clean for both
  trees (~9 min for the two 80k-file checkouts). Lesson recorded: a
  single-success probe trigger is a blip detector for a 6-minute
  checkout — gate long writes on a sustained streak. Probe leftovers
  cleaned (the O_EXCL probe that creates but fails the write leaves a
  0-byte file — the known Nov 5 probe-design bug; `__flap_probe_c__.tmp`
  removed from the main tree, main tree verified clean).
- **Master moved twice under the run:** Loop B landed fightinterior-b
  (304ced6cf) during registration, then tableoffer-b (99813ea70) between
  the two registrations — baseline9-a based on 304ced6cf, congtrace-a on
  99813ea70; both rebased clean, proofs re-run green after every rebase
  (baseline9 23/23, congtrace 36/36).
- **Safe-commit index clobber** hit all 7 arm commits; repaired each
  time with HEAD-blob cacheinfo, verified clean. No clobber on this
  coordinator commit (verified below).
- Loop B is live on its 1630Z round (sim-partydamage-b +
  sim-pyrrhic-b) — NOT touched. Its trees were active at closeout.

## Convergence

**scale-onramp: converging, NOT converged.** Tracker blanks (3) why
baseline killed 9 and (4) the 1-round Congregation kill are now CLOSED
with answers; the fight interior (Loop B, live) and first-killer
survival (killersurvive-a) frame the same wall from the other sides.
Wins are still 0 everywhere, wave-5 kills still 0, and no seed banks
two living wave-4 killers and sits — and the one post-first-blood kill
on this band turned out to be a spawn artifact. **food-economy:
converging, NOT converged** (untouched; sibling loop's axis). Steve's
2026-11-06 10:22 CST self-improvement-drive diagnosis (tracker's new
section) is the next Loop A axis direction: the drive controls when the
second fight happens, the fight controls whether the killer lives
through it.

## Next blanks, in order

1. Party-damage-per-round lever pilot — Loop B sim-partydamage-b, LIVE.
2. Pyrrhic-kill instrumentation — Loop B sim-pyrrhic-b, LIVE.
3. **Wanderer-spawn fix build** — the 20-HP bug (fix named in
   sim-congtrace-a.md): resolve the def by id in `spawnWorldMonster`
   when `full.hp` is missing, or pass the full def at the wanderer call
   site. A build arm, not a diag.
4. Corpus census for wave-4+ traces with entry HP < 100 — how many
   recorded wave-4 kills are 20-HP spawns.
5. Grind-economics design question — same-day re-fighting of a wounded
   beast at 2–5 scholar deaths per kill: intended road, and is the price
   legible to the player? (steve-call if it needs a ruling.)
6. 159-round rout stall (53001 d41 Congregation) — what stalls a fight
   neither side can finish.
7. 53004 trajectory fragility (killersurvive-a) — the band is
   trajectory-fragile, not just seed-fragile.
8. What the arena and "a stranger" are (killersurvive-a).
9. Balance levers (survival time / damage per strike / entry HP) —
   Steve call.
10. Flee-repair game-code port — Steve call.
11. Pellet-bearer lock (finding #1819) — Steve call.

## Village assessment (plain words)

A village that finally kills a fourth-wave monster mostly does it by
wearing the same wounded beast down across a day, paying for it in
dead scholars — and the one clean solo kill on the band was a beast
born broken, twenty hit points pretending to be a thousand. The
company showed up, the rally fired, the party formed — and the village
still killed less than it did alone, because the fights themselves
don't convert. The next blank is not company and not a single fight's
arithmetic: it is whether villagers ever go looking for the second
fight, which is Steve's self-improvement question, and whether the
party can deal damage together, which Loop B is piloting now.
