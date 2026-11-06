# sim-congtrace-a — the 1-round solo Congregation kill, seed 53006 day 149: DIAG-GO

**Arm:** sim-congtrace-a (run fleshout-20261106T1515Z, Loop A, axis
scale-onramp / winnability chain) · **Diag + probe, instrument-only,
zero src/js, no gate/price/deed change.** Policy
`scripts/policies/competent-stageally-a.js` used verbatim.
**Verdict: DIAG-GO** — the d149 kill is reproduced AND its damage
account is complete: the Congregation entered at 20 HP and died to one
ordinary 56-damage scholar strike in round 1. The account closes
(56 ≥ 20, monster at 0 HP) with no unexplained remainder.
**Seed:** 53006 only (deliberate reuse of the stageally-confirm band —
a deterministic reproduction, not a fresh band, not a band claim) ·
**Horizon:** 150d death-aware · **Corpus:**
`evidence/2026-11-06/perseed-congtrace-a/` (1 file, anchor 360af49ed)
· **Confirm corpus:**
`evidence/2026-11-06/perseed-stageally-confirm-b/stageally-s53006-stageally-confirm-staged.json`
(anchor 2ff11cbf) · **Prereg:**
`evidence/2026-11-06/sim-congtrace-a-prereg.md` (committed 84c6739f7
before any judged sim; rebased — see Proof and commits) · **Proof:**
`scripts/test-congtrace-20261106.js` 36/36 green · **Analyzer:**
`scripts/congtrace-analyze-20261106.js` (analysis
`/tmp/congtrace-analysis.json`, working copy; this file is the record).

**The one-line result, plainly:** the monster was not killed in one
round because the scholar hit impossibly hard — it was born crippled.
The Congregation wandered the map for 74 days at 20 hit points out of a
supposed 900–1100, because the wanderer spawn hands the spawner a bare
`{id, veteran}` object and the spawner only looks up the monster's real
numbers when it is given a plain name. One ordinary strike for 56
damage ended it. The fightinterior-b shape guess was wrong in the
mechanism and right in the shape: a deeply wounded entry — but wounded
at birth, not ground down in the field.

## The damage account (the d149 fight, trace seq 6)

| | |
|---|---|
| Day / monster / wave | 149 / Congregation / 4 |
| Scholar | gen_y8hmuwz (after succession), solo — 0 allies, 0 party |
| Entry HP | **20 / 20** (entryFrac 1.0 — full health, at 20) |
| Rounds | 1 |
| Damage to the monster | **56, all scholar, round 1, one hit** (srcLabel `you` — the ordinary `tbPlayerStrike` damage call, game.js:37106) |
| Damage from the monster | 0 — it never acted |
| Scholar HP at end | 76.4% (76.39/100 — the scholar entered the fight at 76.4%; the fight cost nothing) |
| Allies / abilities / tricks | 0 / 0 / 0 — no ally damage, no ability verb, no heresy |
| Ending | `kill` (tbEnd `won`, kill in `waveKillLog` AND `killsLive` — the `recordWaveKill` path, not the pyrrhic bypass) |
| Account closes? | **Yes: 56 ≥ 20, monster at 0 HP, shortfall −36** |

The 56 is an ordinary strike, not a one-shot build: fightinterior-b
measured a median 53–79 scholar damage per fight, and 56 is one swing
of that. The mystery was never the strike. It was the 20.

## The reproduction (determinism)

| | Corpus (2ff11cbf) | Fresh legs (this arm) |
|---|---|---|
| Days / end | 150 / survived | 150 / survived (proof leg ×2 + judged leg) |
| Standing | 175 | 175 |
| Wave-4 kills | d89 Strike (Olivia Bennett), d149 Congregation (gen_y8hmuwz) | identical, both legs |
| Succession days | 21, 89, 96, 103, 115, 129, 138 | identical |
| Scholar deaths | 7, same days/causes | identical |
| d149 fight row | seq 16, 1 round, won, solo, scholar 76.4% | identical (traceSeq 6, ending `kill`) |
| Instrument errors | 0 | 0 |

The proof ran the stageally driver twice to /tmp (byte-identical
outputs); the judged congtrace driver leg to the evidence corpus
matches the corpus on every headline above. Seed 53006 is
deterministic on current master — the killersurvive-a exact match on
anchor 2298a6069 now extends to this tip (360af49ed).

## Root cause: the wanderer spawns its monster at 20 HP

The probe (`/tmp/congtrace-probe-20261106.js`, working copy; output
`/tmp/congtrace-probe-out.json`) logged every Congregation world spawn
on the seed:

- **Day 75: a Congregation spawns at hp 20 / maxHp 20** (opts
  `{mx: 5, my: 1}`). It then drifts tile to tile for 74 days, still
  20/20 on every daily scan (days 76–149), never fought — zero
  Congregation field fights in either corpus. On day 149 the scholar
  meets it; `startCombat('congregation')` lifts the world entity at its
  current HP (`tbWorldHpFor`, game.js:34270 — the sim-w4tbkill-a phase B
  rule that prior damage carries into the fight) and the fighter enters
  at 20/20. One strike ends it.
- **Day 150: a second Congregation spawns at 900/900** — the normal
  value, from `maintainWorldMonsters` (game.js:20412), which passes the
  full monster def.

The two spawns differ in what they hand `spawnWorldMonster`
(game.js:20271):

```js
const full = (typeof mdef === 'string')
  ? ((this.data.monsters || []).find(m => m.id === id) || {})
  : (mdef || {});
const baseHp = (full.hp && full.hp[0]) || 20;
```

The def is looked up **only when `mdef` is a string**. The
wanderer-contact spawn (game.js:24384) passes a bare object:

```js
this.spawnWorldMonster({ id: this.wanderer.monsterId, veteran: this.wanderer.veteran }, px, py, { mx, my });
```

`full` is that object itself — no `hp` field — so `baseHp` falls back
to 20, and the world monster is born at hp 20 / maxHp 20. The spawn
opts `{mx, my}` with no `beamPhase` match the wanderer call exactly
and rule out the trap spawn (which passes `beamPhase: 'grounded'`) and
the tile-entry spawn (which passes the full def, so 900). The debug
button (app.js:20012) shares the shape but is manual-only, not a sim
path.

**Same bug class, other callers** (same shape, not all proven live):
the trap spawn (game.js:23565, `{id: trap.monsterId}` + no hp — for
its intended glasswing darter, 20 HP is roughly in-range, so the trap
path is accidentally harmless for its own species and wrong in
general), the finale-campaign spawns (finale-campaign.js:73, 359,
`{id}` + `{titan: true}` — titans may build their own fighters, not
proven here). The fled-monster recovery (game.js:12817) is safe: it
passes `hp`/`maxHp` explicitly. `maintainWorldMonsters` and the
tile-entry spawn are safe: they pass the full def or a string.

**The fix, named not built** (DIAG-only arm, zero src/js): resolve the
def for object-form `mdef` in `spawnWorldMonster` — look the def up by
`id` whenever `full.hp` is missing — or pass the full def at the
wanderer call site (game.js:24384). One of those two, one line-ish.
Either fix also heals the trap and finale callers. Filed in the
findings backlog.

## What it is NOT

- **Not a one-shot ability or trick.** No ability verb, no heresy
  (heresy is 25 damage via `tbDamage`, and the only hit is a plain
  strike), no ally damage. The Congregation's signature liturgy never
  ran — the beast died before its first turn.
- **Not a wounded entry from field grind.** The fightinterior-b shape
  (51005 d66 Reunion entered at 123 HP after repeated fights) does not
  apply here: zero Congregation field fights exist in either corpus,
  and the probe's field-fight log is empty for this species. The
  wounding happened at spawn, 74 days before the fight.
- **Not a pyrrhic kill.** The kill is in both `waveKillLog` and
  `killsLive` (`via: player`, scholarChannel true) — the
  `recordWaveKill` path. The scholar lived (alive at the horizon,
  health 100, at Haven).
- **Not a veteran.** `veteran: false` on the world monster and the
  fighter — no +50% HP hardening, which would have made it 1350+
  anyway.
- **Not the designed world-HP wounding.** The other wave-4 fights on
  this leg entered wounded through the designed mechanism — Eulogy
  675/900, Strike 750/1000, Eater 712/950, Reunion 1135/1200 and
  1136/1200 — field-worn beasts carried into the fight at their
  current HP, exactly as sim-w4tbkill-a phase B intends. The
  Congregation's 20/20 is the same lift applied to a spawn bug: full
  health, at a max HP the species was never supposed to have.

## Wall numbers (fresh leg — identical to the corpus)

150d survived, standing 175, wave-4 kills 2, wave-4 unlocks 6/6 fights
traced, wins 0, national 0, table 0, wave-5 unlocks/faced/kills 0,
readiness-5-ready days 0 (endReadyVets 1), median survival n/a
(single seed). The d149 kill is the leg's only post-first-blood kill
and it is now explained — it does not move the funnel: it is a
20-HP spawn, not a kill the village earned against a 900-HP beast.

## Sense-test read

The d149 kill has **no captured fight lines at all** — no rally line,
no death line, no `veteran kill` announcement, no line naming the
Congregation anywhere in the captured transcript. The day's captured
lines are the Dead Phone ritual (days 148–150, identical each day) and
a bond-deepening line. A wave-4 kill — the leg's only post-first-blood
kill — passes without a single line naming the beast. In the captured
transcript it reads as nothing happening, which is, accidentally, the
honest fiction for this kill: a walking chapel with 20 hit points
folding to one swing is not a battle worth narrating. Caveat: the
say-wrap captures only lines matching the death/rally patterns, so a
kill line in another shape would not be captured — but the engine
records (waveKillLog + killsLive + tbEnd `won`) are the truth, and the
transcript's silence is the sense finding, not a missing record.

**Recorder edge, found live:** the d149 trace has `verbs: []` and
`turns: []` even though the scholar struck — the killing blow landed
inside `tbPlayerStrike`, which calls `tbEnd('won')`, which closes the
trace, all before the verb wrapper's post-call push runs, so the push
finds `t._trace` null and drops the verb row. The hit log is
authoritative (`tbDamage` is the choke point and it recorded the hit
with round, actor, source, damage, HP after), so the damage account
still closes — but any first-strike kill loses its verb row. Next
recorder should push the verb record before calling the original, or
snapshot the open trace at `tbEnd`. Filed for the recorder's next run,
not this arm's verdict.

## Metric review

Pre-registered metrics bind this run (prereg 299379f67). Primary:
DIAG-GO iff the d149 kill is reproduced AND its damage account is
complete (entry HP + per-round damage by source summing to the kill),
OR non-reproduction proven with a determinism comparison AND the
nearest equivalent wave-4 kill traced. **Branch 1 met:** reproduced
on two independent legs (proof stageally-driver legs + judged
congtrace-driver leg, all matching the corpus headline-for-headline)
and the account closes (entry 20, one 56-damage scholar strike,
monster 0 HP). No metric was swapped, re-cut, or re-thresholded.
Guards: trajectory comparison identical (kill ledger, succession
days, scholar deaths); no new death mode (instrument records only).
- The prereg's expectation ("either a deeply wounded entry or a
  non-strike damage source") is answered on the first branch, with a
  refinement the prereg did not foresee: the entry was wounded *at
  spawn* (maxHp 20), not ground down — the `fights` array's silence
  on prior Congregation fights is explained, not a gap: there were no
  prior fights, because there was nothing to grind.
- The proof's live legs are the determinism legs (stageally driver to
  /tmp, 2× 150d, byte-identical); the judged leg is the recorder leg
  (congtrace driver to the evidence corpus). Both are reported above;
  the judged leg is not double-counted as proof.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js`: INAPPLICABLE (no armed leg — same as
  killersurvive-a; the panel runs its own full panel and takes no
  corpus input, so no compare `.md` is fabricated).
- `scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-06/perseed-congtrace-a/*.json' --metrics
  national,table,wins,exiled`: **REFUSED** — "refusing recorder-corpus
  input: all 1 --current rows carry top-level anchorCommit, so they are
  sweep recorder rows, not runs." Recorded as the result, same as every
  prior killer-chain arm. No telemetry deviation check was possible on
  this corpus; the wall numbers above are the instrument's own. No
  baseline roll-forward.

## What this arm does NOT claim

- Not a lever: no policy was built, no pilot was spent, no
  gate/price/deed change is proposed. The fix is named, not built.
- Not a kill of the stageally NO-GO: the confirm verdict stands as
  measured on its band. This arm explains its one unexplained kill.
- Not a win: 0 wins; no wave-5 anything on this seed.
- Not a claim that every wanderer spawn is 20 HP: proven live for this
  Congregation (spawn d75 at 20/20, fought d149 at 20/20). The code
  shape (`{id}` object + `|| 20` fallback) applies to every bare-{id}
  caller, but only the wanderer path is proven on a live leg; the trap
  and finale callers are the same shape, not the same proof.
- Not a claim about the 159-round Congregation rout (53001, backlog):
  a different seed, a different shape (a fight neither side can
  finish), untouched here.
- The proof legs and the probe are not evidence; only the judged
  congtrace leg above is.

## Next blanks (for the loop, not this arm)

1. **The spawn fix** — resolve the def for object-form `mdef` in
   `spawnWorldMonster` (or pass the full def at the wanderer call
   site). Then re-run seed 53006: the d149 Congregation should enter
   at 900–1100 and the 1-round kill should vanish. That re-run is the
   fix's proof, not this arm's.
2. **How many kills in the corpus are 20-HP spawns?** Every
   wanderer-cast wave-4/5 monster on every band spawned at 20 HP
   until fixed — past kill counts (including the confirm's 3 armed
   kills and the pilot's) may include spawn-crippled beasts. A census
   over the per-seed corpora (entry HP < 100 on wave-4+ traces) would
   size the contamination. The d89 Strike kill on this seed entered at
   750/1000 — genuine, not crippled — but other bands are unexamined.
3. **Recorder verb loss on first-strike kills** — push the verb record
   before the original call, or snapshot at `tbEnd` (see Sense-test
   read).

## Proof and commits

- Proof `scripts/test-congtrace-20261106.js`: 36/36 green on this
  worktree before the judged leg (fixture damage accounts: wounded
  entry closes, one-shot closes, incomplete account must NOT close,
  monster-side damage separated, heresy trick bucket; determinism
  fixtures; live legs to /tmp: 2× 150d stageally-driver runs on 53006,
  byte-identical, corpus headlines reproduced).
- Prereg committed 84c6739f7 before any judged sim. Driver + analyzer
  + proof committed c649bc745. The safe-commit index clobber hit on
  both commits (files shown staged-as-deleted after correct commits);
  repaired with HEAD-blob cacheinfo each time, verified `git status`
  empty + `git diff HEAD` empty + hash-object matches.
- Judged corpus: `evidence/2026-11-06/perseed-congtrace-a/` (1 file,
  0 instrument errors). Analyzer output saved at
  `/tmp/congtrace-analysis.json` (working copy; this file is the
  record). Probe script + output at `/tmp/congtrace-probe-20261106.js`
  and `/tmp/congtrace-probe-out.json` (working copies, not committed).
- Rebase note: master moved during the run (sim-baseline9-a landed as
  371486eae), so the branch was rebased onto 371486eae before merging;
  the proof was re-run green on the new base (36/36) after the rebase,
  and the two commit-hash references above were updated to the rebased
  hashes. The corpus file's recorded `anchorCommit` (360af49ed) is the
  pre-rebase driver commit, as run — it is a historical record of the
  judged leg, not the rebased hash.

## Convergence

**scale-onramp / winnability chain: converging, NOT converged.** The
stageally-confirm blank (4) is now closed with a root cause, not an
inference: the 1-round solo Congregation kill was a spawn bug — a
wanderer-cast beast born at 20 HP — and the damage account proves it
with no remainder. The funnel is unchanged by the explanation (the
kill was never evidence the village could kill a wave-4 beast), and
the next question the explanation opens is how many recorded wave-4
kills across the corpora are the same 20-HP spawn. The fix is named
and one line-ish; the re-run after the fix is the next proof.
