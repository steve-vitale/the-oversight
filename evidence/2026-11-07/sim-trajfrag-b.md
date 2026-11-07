# sim-trajfrag-b — trajectory fragility of seed-matched verdicts: DIAG-GO

**Arm:** sim-trajfrag-b (run fleshout-loop-b-20261107T0230Z, Loop B, axis
scale-onramp / winnability chain) · **DIAG only, zero src/js, no
gate/price/deed change.** Policy `scripts/policies/competent-stageally-a.js`
(staged) used verbatim on both legs; the only difference between legs is
the instrument: the perturbed leg draws `Math.random()` exactly once at
day 0, after `setupGame`, before `runDays`.
**Verdict: DIAG-GO** — all 4 studied seeds are classified fragile/stable
with the first diverging event named per flip, and the anchor-diff
candidate is settled by bisect: the mover is the build-smallfixes
pocket_sand flee-order change (3e82c17d1); moot convening and journey
r132 are both excluded.
**Band:** 53001–53008 (deliberate reuse — determinism study on the known
band; see prereg) · **Horizon:** 150d death-aware · **Corpus:**
`evidence/2026-11-07/perseed-trajfrag-b/` (8 files, 0 instrument errors)
· **Prereg:**
`evidence/2026-11-07/sim-trajfrag-b-prereg.md` (committed 874706074
before any judged sim) · **Instrument:**
`scripts/trajfrag-instrument-20261107.js` · **Driver:**
`scripts/trajfrag-driver-20261107.js` · **Analyzer:**
`scripts/trajfrag-analyze-20261107.js` · **Analysis:**
`evidence/2026-11-07/trajfrag-b-analysis.json` · **Proof:**
`scripts/test-trajfrag-20261107.js` 31/31 green.

**The one-line result, plainly:** one extra random draw on day 0 flips
the verdict on 3 of 4 seeds — the same village, the same policy, one
draw apart, and the kill count, the survivors, and whether the village
lives or dies all change. The first thing to diverge is always a
small, early fight: the first wave-1 kill, days 5–8, a different
monster on a different day. 53004 is the exception that proves the
rule: its verdict class holds (lost both ways, kills both ways) while
everything underneath it rewrites — three times the kills, wave 5
unlocked, eighteen more days alive.

## Before / after (identical seeds, 4 + 4, current master d59dabeab)

CLASS = survived/lost · wave-4 kills 0 vs ≥1 · living veterans 0 vs ≥1.

| Seed | Unperturbed (days, end, standing, w4k, vets, maxWave) | Perturbed (days, end, standing, w4k, vets, maxWave) | Class | First diverging event |
|---|---|---|---|---|
| 53002 | 150d survived, 150, 1, 0, w4 | 133d lost, 199, 0, 0, w4 | **FRAGILE** (survived, w4kills) | d8 first kill: anaconda_empress → murkcap (same day, different monster) |
| 53004 | 88d lost, 199, 1, 0, w4 | 106d lost, 265, 3, 0, w5 | **STABLE** (class holds) | d7 first kill: drumbelly_tanuki d7 → murkcap d9 |
| 53006 | 150d survived, 440, 11, 2, w5 | 73d lost, 195, 1, 0, w4 | **FRAGILE** (survived, veterans) | d7 first kill: drumbelly_tanuki d7 → mirrormoth d5 |
| 53008 | 123d lost, 150, 0, 0, w4 | 150d survived, 199, 1, 1, w4 | **FRAGILE** (survived, w4kills, veterans) | d5 first kill: cliffhanger d5 → hummice d6 |

**Flip rate 3/4.** Every seed is classified; every flip has its first
diverging event named (all four are kill-ledger events — the first
wave-1 kill, days 5–8). Daily-row diffs follow within days (53002:
scholar changes d17 — gen_fma00w3 dies of sickness d17 unperturbed,
lives to d52 perturbed; 53004: living 11 vs 12 on d11; 53006: party
2 vs 1 on d8; 53008: living 12 vs 11 on d14). Snapshot-cadence notes:
day 3 has a daily snapshot in the 53002 unperturbed leg only, day 13
in the 53008 unperturbed leg only — the daily hook did not fire those
days in the perturbed leg; reported as cadence, not as the named game
event (see metric review).

### What the flips look like, seed by seed

- **53002 — the kill that never comes.** Unperturbed, the seed's only
  wave-4 kill is a companion Strike on d149 by Nadia Khoury — who dies
  the same day to a Reunion ("The Big Beast"). Perturbed, there is no
  kill at all, the founder gen_fma00w3 lives 35 days longer (d52, the
  wild, instead of d17, sickness), and the village still dies, d133
  instead of surviving to 150d. Same founder, same village, one draw:
  the difference between a last-day kill and none.
- **53004 — stable class, rewritten trajectory.** Both legs lose with a
  kill and no veterans, but the perturbed leg kills THREE wave-4
  monsters (Congregation d68 companion, Suburb d84 scholar, Editor d92
  companion) against one (Algorithm d64 companion), unlocks wave 5,
  and lives 18 days longer (106d vs 88d). A seed can hold its verdict
  class while the game underneath it becomes a different story. The
  class metric is coarse by design — see metric review.
- **53006 — the collapse.** Unperturbed, this is the richest village
  on the band: 11 wave-4 kills (7 by companions), standing 440, wave 5
  unlocked, 2 living veterans at the horizon. Perturbed, the village
  dies on d73 in a pile-up: five scholar deaths on d72–73 (Lena, then
  Adaeze, Sari, Wanjiru, Prisca), one wave-4 kill, no veterans. The
  first divergence is day 7 — a mirrormoth instead of a drumbelly —
  and by day 73 the village is gone. The whole winnability chain on
  this seed (pair, veterans, wave 5) exists in one draw and not the
  other.
- **53008 — the flip that runs the other way.** Unperturbed, 0 kills,
  dead d123. Perturbed, a companion Suburb kill on d144, a living
  veteran, survived to 150d. The displacement can also SAVE a village.

## The anchor-diff bisect (the 53004 divergence, explained)

The killersurvive-a verify leg found staged 53004 diverged between
anchors 2ff11cbf (corpus: Eulogy d78, killer d90, 150d survived) and
2298a6069 (Eulogy d79, killer d82, 84d lost). Bisect with read-only
staged re-runs of 53004 (stageally driver at each anchor, OUTDIR /tmp,
never committed on those anchors):

| Anchor | Result | Classification |
|---|---|---|
| 2ff11cbf (corpus anchor) | Eulogy d78 by gen_16cjvkx, killer d90, 150d survived, standing 155 | CORPUS-LIKE (setup validation — reproduces the corpus exactly) |
| a3f59fe35 (parent of the mover) | Eulogy d78, killer d90, 150d survived, standing 155 | CORPUS-LIKE |
| **3e82c17d1** | Eulogy d79, killer d82, 84d lost, standing 155 | **VERIFY-LIKE — the mover** |
| 2a33c6afc | Eulogy d79, killer d82, 84d lost, standing 155 | VERIFY-LIKE |
| 2298a6069 (verify leg, killersurvive-a) | Eulogy d79, killer d82, 84d lost, standing 155 | VERIFY-LIKE (already known) |

**The mover is 3e82c17d1** ("build-smallfixes: preregs + pocket_sand
flee-order fix + raid-cooldown ship"). Inside that commit, the mover
for 53004 is the `competent.js` fight change: pocket_sand becomes
once-per-fight and a held losing-window control is pressed BEFORE the
35% flee check (losing-control-first) — fighters now throw sand
instead of fleeing on losing turns, changing turn sequences and RNG
consumption in every losing fight from the first one onward. The
commit's other two changes (raid-cooldown gate removed in `game.js`,
`nationalFirstDay` stamp unconditional in `hierarchy.js`) are
national-gated, and 53004 never leaves village rank — excluded for
this seed on the code's own terms.

**Both named candidates are EXCLUDED:**
- **Moot-gate convening (e53e86531, `betrayal.js`):** the divergence
  already exists at 3e82c17d1, which predates the moot commit.
  Excluded.
- **Journey r132 crisis change (f1a070306, b13016733):** f1a070306 is
  evidence-only; b13016733 touches scripts + evidence only, a separate
  driver never loaded by the stageally driver — neither touches any
  code the stageally driver loads — and the divergence predates both
  commits anyway. Excluded.

## Current master is not the corpus (read this before re-using the band)

The unperturbed legs on current master (d59dabeab) differ from BOTH
the corpus (2ff11cbf) and the verify legs (2298a6069) — because landed
levers between those anchors changed the game: armor retune K=20→6
(5c5481852), wanderer-spawn 20-HP fix (18359d824), bond-initiation
(1cee861d9 + tunings), practice-moves-competence (2b9b0371e), tbend
arena fix (1700ea5fc), flee-repair (f4dafd387), sticky table offer
(3b00c7a4b). The sharpest case is 53006 staged: corpus 2 kills /
standing 175 / maxWave 4 / 1 veteran → current master 11 kills /
standing 440 / maxWave 5 / 2 living veterans. The stageally NO-GO's
"the pair never forms" (0/8 seeds, both legs) does NOT hold on
current master for this seed — a living pair and a wave-5 unlock are
in the unperturbed leg. That is a loop-level flag, not this arm's
verdict: this arm measures fragility WITHIN current master, and its
reference legs are the fresh unperturbed runs, not the corpus.

**Driver fidelity is proven, not assumed:** the original stageally
driver re-run on current master reproduces my driver's unperturbed
legs exactly — waveKillLog, daily rows, scholarDeaths, fights,
tbFights byte-identical on both pilot seeds (53004: 88d/lost/199/1
kill; 53006: 150d/survived/440/11 kills). The movement is in the
game, not in my driver.

## Wall numbers

| | National | Table | Wins | Wave-4 unlock | Wave-5 unlock | Median survival |
|---|---|---|---|---|---|---|
| Unperturbed (4 seeds) | 0 | 0 | 0 | 4/4 | 1/4 (53006) | 136.5d |
| Perturbed (4 seeds) | 0 | 0 | 0 | 4/4 | 1/4 (53004) | 119.5d |

No wins, no national, no table on either leg. Wave 4 unlocks
everywhere; wave 5 unlocks on one seed per leg — but a DIFFERENT seed
(53006 unperturbed, 53004 perturbed). Median survival falls 17 days
under the displacement, but that is a 4-seed wiggle, not a lever
effect — the displacement is not a lever.

## Reachability verdict

Wave 4 is reachable on every seed of the band on current master; wave
5 unlocked on 53006 unperturbed (11 kills, 2 living veterans) and on
53004 perturbed (3 kills) — the door opens, but whether it opens on a
given seed is a coin flip on one random draw. No win, no national, no
table anywhere in this corpus. The winnability chain's binding link
remains what the confirm found — living veterans overlapping in time —
and this arm adds that the link's presence on a seed is itself
fragile: the pair exists on 53006 unperturbed and is gone on 53006
perturbed.

## Village assessment (plain words)

Four villages, one random draw apart, and you would not recognize
them as the same places. One village's whole future — eleven kills, a
pair of living veterans, the fifth wave — vanishes because the first
thing it killed on day 7 was a moth instead of a drumbelly. Another
village dies on day 73 in a pile-up of funerals while its twin lives
to the horizon with eleven kills. A third village's verdict holds
steady — lost, one kill, no veterans — while underneath, the kill
count triples and the fifth wave opens. The game is not rolling dice
on top of a stable story. The story IS the dice: the first small
fight decides which village you get, and everything after — who
lives, who kills, whether the village stands — follows from it. Any
verdict drawn from one seed, or from one draw of a seed, is a verdict
about that draw, not about the lever. The loops already knew this in
practice (paired identical-seed comparisons); this arm puts the number
on it: 3 in 4 seeds flip on a single draw.

## Sense-test read

- **The d73 pile-up (53006 perturbed).** Five burials in two days,
  each with the full rite: "The village stops. Somebody screams.
  Somebody else starts digging." / "What Adaeze kept close goes into
  the ground with them — keepsakes are buried, never taken from the
  body." The repetition reads as a catastrophe, not a bug — the ritual
  repeating because the deaths repeat. Coherent.
- **The grave-speaker line, again.** At Lena's grave: "Sari, Wanjiru
  speak for Adaeze"; at Adaeze's grave: "Wanjiru speaks for Sari."
  The speakers advocate for the NEXT bearer at the dead scholar's
  grave — the same pattern killersurvive-a flagged at Olivia's grave
  ("speak for Larry"). It recurs on this band's fresh legs, so it is a
  standing fiction wrinkle, not a one-seed quirk. Filed in the
  findings section below.
- **Priya's beast (53004 unperturbed, d80).** "Something still paces
  the treeline beyond the walls — The Loud Beast — waiting for a dead
  Priya." The monster waited for the bearer and the walls ended the
  argument. Coherent and on-theme: the beast outlives its target.
- **The SHUTDOWN flood (53006 unperturbed, d147).** Seven identical
  "SHUTDOWN — the picket line holds" lines in one day. Known log
  noise (same class as the pilot's flood notes), not a fiction break.
- **53002's last-day kill.** Nadia Khoury kills the Strike on d149
  and dies the same day to a Reunion. The ledger says the village's
  only wave-4 kill and its killer's death share a day; the transcript
  carries no burial lines for her in the captured window (deathSays
  cap) — the fiction of that day is under-recorded, not incoherent.

## Metric review

- Pre-registered metrics bind this run (prereg 874706074). Primary:
  flip rate on CLASS (survived/lost, w4 kills 0 vs ≥1, living
  veterans 0 vs ≥1). DIAG-GO bar: ≥3 of 4 seeds classified WITH the
  first diverging event named per flip, AND the anchor-diff candidate
  confirmed/excluded. Met: 4/4 classified, 3 flips each with its first
  event named, both named candidates excluded and the true mover
  (3e82c17d1) named. No metric was swapped, re-cut, or
  re-thresholded.
- **Analyzer fix, recorded honestly:** the first analyzer version
  compared daily rows BY INDEX. On 53002 it named a 'day' field
  mismatch at index 2 as the first divergence — a snapshot-cadence
  artifact (the perturbed leg has no day-3 snapshot), not a game
  event. Fixed to a day-keyed join (last row per day; snapshot
  presence reported separately as a cadence note) BEFORE the evidence
  file was written; proof grew 27 → 31 with fixtures for the
  missing-day and duplicate-final-day cases. CLASS verdicts were
  unaffected (they never used daily rows except the last row's
  veterans). The corrected first divergences are all kill-ledger
  events, days 5–8.
- **The prereg's "53006 exact" expectation was overtaken.** It
  described the 2298a6069 verify leg; landed levers between that
  anchor and current master moved the unperturbed legs before any
  judged run started. The judged comparison (perturbed vs
  unperturbed on the SAME master) is unaffected, but the expectation
  is corrected here, not hidden: on current master 53006 staged is
  150d/440/11 kills/wave 5, not the corpus's 150d/175/2 kills/wave 4.
- **The CLASS metric is coarse by design, and 53004 shows the cost:**
  stable-class hides a trajectory rewrite (1 → 3 kills, wave 5
  unlocked, +18 days). For the NEXT run, propose reporting a
  trajectory-distance secondary alongside CLASS (survival-day delta,
  kill-count delta, standing delta) so stable-class seeds are not
  read as identical. Not re-scored here.
- **Displacement scope:** one extra draw on the GAME RNG stream only;
  the policy stream (`__policyRandom`) is untouched. "Stable" means
  stable under THIS displacement, not under all RNG shifts. A
  two-draw or mid-run displacement could flip 53004 too — untested,
  not claimed.
- Balanced panel (§15): INAPPLICABLE — no game-code change (DIAG,
  zero src/js), no armed-vs-baseline policy pair; the comparison is
  unperturbed vs perturbed on the SAME policy. The panel runs its own
  full panel and takes no corpus input. No compare `.md` is
  fabricated. Same outcome as the confirm, killersurvive-a, and
  congtrace-a arms.
- Telemetry: `node scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-07/perseed-trajfrag-b/*.json' --metrics
  national,table,wins,exiled` REFUSED — "refusing recorder-corpus
  input: all 8 --current rows carry top-level anchorCommit". Same as
  every prior killer-chain arm. The wall numbers in this file are the
  instrument's own.

## What this arm does NOT claim

- Not a lever verdict: nothing is tuned; the displacement is an
  instrument, not a change to the game. There is no GO/NO-GO on any
  game change here.
- Not a fresh-band result: all verdicts are about determinism on the
  known band 53001–53008, deliberately reused.
- Not a win: 0 wins either leg; no national, no table.
- Not a claim that 53004 is robust: it is stable under ONE extra draw
  at day 0. A different displacement could flip it.
- Not a claim that the pocket_sand change is wrong: 3e82c17d1 moved
  the trajectory, which is what a fight change SHOULD do. The bisect
  names the mover; whether the new fight behavior is better is the
  stayrecover/fight-interior arms' question, not this one.

## Next blanks (for the loop, not this arm)

1. **The 53006 pair on current master** — the stageally NO-GO's "the
   pair never forms" does not hold on this seed anymore (living pair,
   wave-5 unlock, 11 kills, all on current master). The confirm's
   verdict needs a re-run on current master before anyone leans on it
   — a loop call, not this arm's.
2. **Trajectory distance as a reported secondary** — see metric
   review. The next fragility or confirm run should carry it.
3. **Which sub-change in 3e82c17d1 moves 53004** — the commit bundles
   pocket_sand once-per-fight + losing-control-first (the likely
   mover) with two national-gated raid changes (excluded for this
   seed). If the loop ever needs the split, it is one hybrid-tree
   test, not a re-bisect.
4. **The grave-speaker line** — speakers advocate for the next bearer
   at the dead scholar's grave (three sightings now: Olivia d96,
   Lena/Adaeze d72–73). Small fiction wrinkle, filed below.

## Findings for the backlog

- The grave-speaker line names the successor at the dead scholar's
  grave ("speak for Adaeze" at Lena's grave, "speak for Sari" at
  Adaeze's grave, 53006 perturbed d72–73) — third sighting after
  Olivia's grave (killersurvive-a); the village moves on to the next
  scholar mid-eulogy.
- A living pair and a wave-5 unlock now exist on 53006 staged on
  current master (11 wave-4 kills, standing 440) — the stageally
  NO-GO does not reproduce on current master for this seed; the
  confirm is owed a re-run.
- The SHUTDOWN line floods 7× in one day (53006 unperturbed d147) —
  known log-noise class, same as the pilot's flood notes.

## Proof and commits

- Proof `scripts/test-trajfrag-20261107.js`: 31/31 green on this
  worktree (displacement stream checks + CLASS taxonomy + first-
  divergence fixtures incl. day-keyed join + live determinism legs:
  unperturbed re-run byte-identical, perturbed leg records its draw,
  analyzer smoke green). The proof caught one real bug (the index
  join, fixed before the evidence file was written).
- Prereg committed 874706074 before any judged sim. Instrument +
  driver + analyzer + proof committed d59dabeab. Day-keyed fix
  committed d10ff8fb8. This evidence file + corpus (8 files) +
  analysis JSON committed with this file.
- The safe-commit index clobber hit on all three commits in this arm
  (files shown staged-as-deleted or reverted after correct commits);
  repaired with HEAD-blob cacheinfo each time, verified `git status`
  empty + `git diff HEAD` empty + hash-object matches.
- Bisect legs live in /tmp/trajfrag-bisect/ (2ff11cbf, a3f59fe35,
  3e82c17d1, 2a33c6afc — never committed on those anchors; the
  worktree is back on branch sim-trajfrag-b). Driver-fidelity
  cross-check in /tmp/trajfrag-xcheck/ (original stageally driver on
  current master, byte-identical ledgers).
- Infrastructure note: one heartbeat attempt blocked on the registry
  flock (siblings hold it under load 18+) and was killed before it
  ran anything — no work lost; the coordinator owns heartbeats and
  this worker did not retry it.
- Worktree contains only committed work at closeout (plus the judged
  corpus, committed here); branch ready to merge. No push, no version
  bump, no live verification (coordinator owns the merge).

## Convergence

**scale-onramp: converging, NOT converged.** The 53004 divergence is
now explained, not just observed: a fight-policy change
(pocket_sand once-per-fight + losing-control-first, 3e82c17d1) moved
the trajectory one day, and the village followed. The fragility
number is 3 in 4 seeds flipping on a single random draw — seed-
matched verdicts on this band are draw-fragile, and the one stable
seed still rewrites its whole trajectory underneath a held class.
No lever in this arm moves those numbers; the next decision is the
loop's (confirm re-run on current master, trajectory-distance
secondary). The pair remains unformed on 3 of 4 perturbed legs and
on 3 of 4 unperturbed legs — but it forms on 53006 unperturbed, and
that is new.
