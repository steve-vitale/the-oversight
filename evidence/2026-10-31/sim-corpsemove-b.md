# sim-corpsemove-b — who carries the body home: the village does, overnight, by recoverBearer

Run: Loop B fleshout-loop-b-20261031T1430Z, arm sim-corpsemove-b, axis
food-economy. Worktree sim-corpsemove-b. DIAG ONLY: measurement, zero
src/js changes, zero policy-default flips, zero edits to any existing
policy file or existing script. New files only: prereg, driver +
splitter + analyzer + proof, this evidence file, corpora, table.
Nothing is merged by this worker (the coordinator merges); report
status: committed on branch, pending coordinator merge, no ship.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-31/sim-corpsemove-b-prereg.md (commit f603aeb9f).
DIAG-GO iff the 15215 corpse table covers every morning AND evening
from loop-day 15 through loop-day 20 for corpse gen_gyft62f AND the
node change is bracketed to a SINGLE loop-day segment with the
mechanism NAMED and traced to a code path, OR the bracket plus the
excluded mechanisms are named and the residue is stated as an
explicit unknown. A table that merely re-shows "node changed"
without the bracket is NO-GO. Bearer-identity failure on the
bracketing snapshots is NO-GO. And the prereg's own reproduction
clause: a rerun that does not reproduce the 17-18 creek / 19 Haven
readings is a trajectory-divergence failure, reported loudly, NOT
judged.

## Canon

docs/CANON.md read. No canon doc covers corpse recovery itself; the
mechanism is documented in code (src/js/corpses.js header rule
the_village_brings_its_bearer_home, journey-succession r9
2026-10-12) — stated here instead of inventing canon. The standing
rule that bears on the verdict is CANON.md's "no silent actions":
§4 shows the move IS narrated, so there is no silent teleport to
explain — but the carrier is the anonymous village ("they"), not a
named villager, which is the honest limit of the narration.

## Prior evidence read in full before designing anything

sim-toolloss-b.md in full, especially §9 and the gap corpus
(evidence/2026-10-31/sim-toolloss-b-corpus-gap, 15215 ON rerun): the
observation this arm answers — Gabriela Ludwig's corpse reads node
(2,5) on mornings 17-18 and (4,4) on morning 19, items unchanged,
still unlooted, mechanism unidentified, no claim made.

## Verdict: DIAG-NO-GO against the prereg — trajectory-divergence failure, NOT a failed mechanism hunt

The prereg's fresh-corpus condition was NOT met, so no GO is claimed,
per the prereg's own clause and the metric-binding rule (a miss is
NO-GO, never re-scored against a friendlier metric mid-run). What
failed is reproducibility, not identification:

- On THIS tree's base, seed 15215 ON never strands, never dies, and
  never produces Gabriela's corpse at all: Gabriela Ludwig
  (gen_gyft62f) is the bearer on every morning 2-30, all 30 evenings
  end at Haven, and there is no bearer change on any of the 8 pilot
  seeds. The judged trajectory (creek evenings 7-16, death day 17,
  succession to Dakota) does not exist here.
- The divergence is the BASE, not this arm's instrument, proven by
  control: the ORIGINAL toolloss-gap driver, run verbatim on this
  base for 15215, produces the same divergence (Gabriela alive all
  30 days, evening 7 at Haven). This arm's driver reproduces the
  control driver's morning and evening sequences exactly on this
  base (proof checks), so the instrument is exonerated.
- Why the base moved: this branch's lineage does not contain the
  toolloss prereg commit (2f25bd5b is not an ancestor), and its log
  contains the lootabilities merges whose own commit messages
  document seeded-generation re-rolls (gift-pool / pool wire-in
  changes that re-roll starter kits and fixtures). Seeded sims are
  only comparable on the same base; the toolloss trajectory is a
  base-pinned trajectory, and this tree is on a later base.

## The mechanism — NAMED and traced (finding, not a GO claim)

Because the prereg bars judging a diverged rerun, the mechanism
below is reported as a finding grounded in the toolloss gap corpus
(re-analyzed, bearer-first) plus the code trace, NOT as a
prereg-GO verdict. The coordinator can close the backlog item on
this strength, or re-run this arm on a tree pinned to the toolloss
base; this arm does not re-score the miss into a GO.

**The village brings its dead bearer home. Nobody in particular
carries her — the village does it overnight, as a system, one
end-of-day later than the death.**

- Mechanism: `Game.recoverBearer()` in src/js/corpses.js (rule
  the_village_brings_its_bearer_home, journey-succession r9).
  Called from `Game.endDay()` in src/js/game.js ("THE VILLAGE
  BRINGS ITS BEARER HOME" block). Queued by ledger.js playerDeath:
  on the bearer's death it registers the corpse and pushes
  `v.pendingBurials` `{ corpseId, villagerId, name, day }` with day
  = the scholar day at death.
- Firing condition: `recoverBearer` takes pending entries with
  `scholar.day > pending.day` — strictly greater, so the endDay of
  the death day itself does NOT fire. On 15215: death day 17,
  pending day 17, endDay 17 not due, endDay 18 due (18 > 17) — the
  body moves on the night of day 18 into morning 19. That is why
  the corpse sits at the creek for TWO mornings after the death
  (17 and 18), not one: the "one day after" shorthand in the code
  comment counts endDays, and the strict-> comparison costs the
  extra night. The observed readings match the arithmetic exactly.
- Effect (corpses.js:937-938): `c.node = { x: village px, y: hy }`
  (Haven 4,4); `c.mx = 4; c.my = 4` (the fire cell); `c.recovered =
  true`; `c.deathKnown = true`. The observed morning-19 snapshot
  is node (4,4), mx 4, my 4 — the code's constants, not a
  coincidence. The death pack rides home ON the corpse: items
  identical across the bracket (proof check), looted false
  throughout, Stone knife still aboard. Nothing auto-transfers;
  looting stays the successor's per-item act.
- It is the ONLY corpse-node writer in the codebase: a grep for
  corpse node/mx/my assignments finds only corpses.js:937-938.
  There is no separate carrier routine, no succession relocation,
  and no map recentering that writes corpse positions.

## 1. THE BRACKET (prior gap corpus, bearer-first — the GO input that the rerun could not reproduce)

| snapshot | bearer (id, name) | corpse gen_gyft62f node | mx, my | items | looted |
|----------|-------------------|------------------------|--------|-------|--------|
| evening 18 | Dakota Ibarra (gen_eni1m98) | (2,5) creek | 0, 0 | 8 stacks incl. Stone knife | false |
| morning 19 | Dakota Ibarra (gen_eni1m98) | (4,4) Haven | 4, 4 | identical 8 stacks | false |

Segment: evening loop-day 18 -> morning loop-day 19, the overnight
gap. The bracketing snapshots carry bearer id + name and corpse
villagerId, satisfying the bearer-identity rule — the body that
moves is Gabriela's (gen_gyft62f) while the snapshot bearer is her
successor Dakota (gen_eni1m98) on both sides, so this is not another
bearer-change artifact.

## 2. CANDIDATE MECHANISMS — DISCRIMINATED

| candidate | verdict | evidence |
|-----------|---------|----------|
| Body-recovery duty (recoverBearer / pendingBurials) | CONFIRMED as the mechanism | Firing arithmetic (death 17 -> due endDay 18 -> morning 19) matches the readings; node/mx/my constants match the code; verbatim say line in the bracket's gap (see §4); sole corpse-node writer in the codebase |
| Return-home routine / a villager carrying the body by day | EXCLUDED | Day-18 full transcript contains zero body/corpse/carry/grave/Gabriela lines; successor Dakota's day 18 is grove -> meadow -> Haven chased by the Rut King, no corpse line; the move falls in the overnight gap, not in any day segment |
| Corpse relocation at succession | EXCLUDED | Succession morning is day 17; the corpse still reads creek on morning 18. The move is a full day later, on the recoverBearer due-day, not the succession |
| Map-node recentering / global shift | EXCLUDED | Every other corpse keeps its node across mornings 17-18-19 (per-id check; a second day-17 corpse, corpse_17_xrf81g, sits at (4,4) throughout and does not move). Only Gabriela's corpse changes, on exactly one segment |
| Other code paths writing corpse position | EXCLUDED | Code grep: no other c.node / c.mx assignment on a corpse anywhere in src/js |

## 3. PILOT BAND (8 seeds, ON leg, this base) — specificity, not a rate

| seed | bearer changes | corpse moves | note |
|------|---------------|--------------|------|
| 15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337 | 0 on all 8 | 0 on all 8 | No bearer death on any seed, so recoverBearer never fires; non-bearer corpses (villager + monster deaths on every seed) never move |

The band supports the mechanism's specificity: ONLY a dead
bearer's body comes home (pendingBurials is queued only by the
playerDeath ledger path), and ordinary dead villagers stay where
they fell. No confirm band was spent: the confirm trigger (a second
moved bearer corpse with a different offset/narration) could not
fire on a band with no bearer deaths, and per the prereg a confirm
is proposed to the coordinator, not run inside this arm.

## 4. SENSE-TEST (law — read, judged for meaning)

The move IS narrated, in the overnight gap before morning 19
(gap-line index 16, before the DAY 19 DAWN marker at index 46):

> "That night, they bring Gabriela home. Nobody asks you to help
> carry; nobody has to. By morning the grave is dug by the fire,
> and the body is laid out beside it. The filling of it is yours."

So this is NOT a silent teleport: a player reading the overnight
lines learns the body came home, the grave is dug, and the burial
(the filling) is theirs to do. The honest limit: the carrier is
"they" — the village as an anonymous collective, not a named
villager with a name, a walk, or a carrying scene. That matches
the code (recoverBearer names no carrier; it sets the position
and speaks one line). It is also consistent with the death beat
itself ("Somebody screams. Somebody else starts digging.") — the
village grieves and buries collectively, never as one named
carrier. PASS on narration; the anonymous carrier is a texture
note for when burial narration is next touched, not a bug claim
and not built here (diag only).

## 5. INSTRUMENT NOTES (disclosed)

- First instrument run (8 seeds) was BROKEN and is NOT judged: a
  botched edit left an undefined variable in the morning block, so
  daily() threw on day 2 and each seed returned 0 mornings / 1
  evening. Caught by the counts check, fixed (the morning block
  now calls snapAllCorpses + pendingSnap), and the full pilot was
  re-run clean (29 mornings / 30 evenings per seed). The broken
  run's .jsonl was overwritten by the clean run, never split, never
  judged.
- The clean run's .jsonl was split by an idle process into
  per-seed corpus files and then deleted, per the EPERM-flap
  transport rule; no judged corpus was ever staged in /tmp.
- The control run (original gap driver, 15215, this base) wrote
  its file directly and is kept as
  sim-corpsemove-b-control-gap/ — it is the divergence proof.
- safe-commit index clobber (known class): after the prereg
  commit, the committed prereg file showed as a staged deletion
  plus an untracked copy. Repaired with `git update-index --add
  --cacheinfo` from the HEAD blob; `git status` clean after
  repair. The same check runs after the final commit.

## 6. VILLAGE ASSESSMENT (plain words)

Two villages, and the honest thing is to keep them separate. The
village this question came from — the old-base 15215 — is the one
where Gabriela slept rough by the creek for ten nights, died at
dawn on day 17, and lay where she fell for two more mornings while
her successor Dakota carried on at Haven. Then, on the night of
day 18, the village went out and brought her home: by morning 19
her body lay by the fire with the grave already dug, her knife
and everything she carried still on her, waiting for Dakota to
fill the grave or take what the village needs. Nobody in
particular carried her — the village did, the way a village
would, and it said so that night.

The villages on this base are quieter and less instructive: all
eight pilot villages survived the 30 days, nobody holding the
mantle died, and every corpse — villagers and monsters alike —
stayed exactly where it fell. That is not a contradiction; it is
the same rule from the other side. Only the bearer's body comes
home, and when the bearer lives, nothing comes home. The blank
this arm fills is the mechanism's name and address: the body
moves because the village recovers its dead bearer overnight
(recoverBearer, fired from endDay on the first day after the
death day), narrated in one line, with the burial left to the
successor. What this arm could NOT do — because the base moved
under it — is re-prove that bracket on a fresh corpus on current
master. That re-proof is the next blank, and it needs a tree
pinned to the toolloss base or a fresh bearer death on current
master, not another re-run of the same diverged seeds.

## Reachability

No new content reached; no game change landed, so no reachability
change is claimed. Corpse-recovery content (the bring-home line,
grave dug by the fire, burial as the successor's act) is reached
in the prior gap corpus, not in this arm's pilot (no bearer death
to trigger it).

## Wall numbers

NOT OBSERVABLE as reachability on 30-day legs (pre-seat, no field)
— reported, never claimed. Pilot band (8 seeds, this base): wave
reach 1-2 only (maxWave 2 on 6 of 8 seeds, 1 on 2); national 0,
table 0, wins 0 (structurally unreachable in this band, not a wall
measurement); median survival 30 days (ceiling — all 8 survived
the window).

## Proof

scripts/test-corpsemove-b.js: 27/28 checks pass. The single FAIL
is the prereg-defined REPRODUCTION-GATE (my corpus does not
reproduce the 15215 creek/creek/Haven readings) — the expected
divergence failure, recorded rather than hidden; every other
check passes, including instrument equivalence with the control
driver, the control driver's own divergence, the bracket
(node/items/looted/bearer on both snapshots), the narration line
before dawn with an empty day-18 body-line scan, other-corpse
stability, the full code trace (recoverBearer definition,
node/mx/my constants, say line, recovered + deathKnown flags,
day > pending-day condition, endDay caller, pendingBurials
queue), the pilot census (0 bearer changes, 0 corpse moves on
8 seeds), and the tracked-diff guard (src/ + scripts/policies/
unchanged since the prereg commit's parent).

## Metric review

- The bracket metric behaved as preregistered on the prior corpus
  (single overnight segment, bearer-first snapshots, named
  mechanism with file/function/caller/condition) and the
  reproduction gate behaved as preregistered too — it caught a
  real base move instead of letting a diverged rerun be judged
  as if it were the same trajectory. No re-scoring occurred: the
  NO-GO stands even though the mechanism is named, because the
  prereg's fresh-corpus condition is the GO bar and it was not
  met.
- Reporting refinement for the next strand prereg: pin the GAME
  BASE in the prereg (commit hash of the tree the observation came
  from) and require a base-equality check BEFORE the judged leg —
  seed equality is not trajectory equality across bases, and a
  seeded sim's comparability dies with the base that generated it.
  The control-driver step (run the prior instrument verbatim on
  the new base first) should be standard: it separates instrument
  bugs from base moves in one run.
- No metric revision is proposed for the GO bar itself: bracket +
  traced mechanism + bearer identity separated the candidates
  cleanly wherever the corpus existed.
- §15 panel: not applicable, as declared in the prereg — zero
  game-root changes, so there is no before/after game delta for
  scripts/balance-panel.js to compare. The before/after here is
  morning vs evening snapshots on the same legs, and it is never
  labeled a panel comparison.

## 7. OUT-OF-SCOPE FINDINGS (NOT chased; for the coordinator's backlog)

- [answered-by-trace, coordinator to mark — prereg NO-GO on the
  fresh corpus, see Verdict] 2026-10-31 — food-economy / corpses
  — CORPSE NODE MOVES CREEK -> HAVEN (sim-toolloss-b §9, this
  arm): the mechanism is Game.recoverBearer() (src/js/corpses.js,
  fired from Game.endDay(), queued via village.pendingBurials in
  ledger.js playerDeath, due on the first endDay where scholar
  day > death day). On 15215: death day 17, due endDay 18, body
  at Haven by morning 19, narrated that night ("That night, they
  bring Gabriela home..."), items unchanged, unlooted. Excluded:
  daytime carrying (day-18 transcript has no body line),
  succession relocation (corpse still creek morning 18),
  recentering (all other corpses stable), any other node writer
  (none in src/js). Caveat: the fresh-corpus re-proof failed on
  this tree's later base (15215 no longer strands or dies), so
  the bracket rests on the toolloss gap corpus + code trace; a
  re-proof needs a toolloss-base-pinned tree or a fresh bearer
  death on current master. (evidence: this file; prior gap
  corpus + this arm's pilot/control corpora; table JSON.)
- [open] 2026-10-31 — food-economy / corpses — RECOVERY CARRIER
  IS ANONYMOUS (this arm, texture note): recoverBearer names no
  carrier — "they" bring the body home. Consistent with the
  collective grief beat, but no villager is ever seen carrying.
  Worth a look when burial narration is next touched; not a bug
  claim.
- [open] 2026-10-31 — measurement / bases — SEEDED TRAJECTORIES
  ARE BASE-PINNED (this arm, method note): the toolloss 15215
  trajectory does not reproduce on this tree's later base (the
  original driver diverges identically), because intervening
  merges re-rolled seeded generation. Future preregs should pin
  the base commit and check base equality before the judged leg.

## Files

- Prereg: evidence/2026-10-31/sim-corpsemove-b-prereg.md (commit
  f603aeb9f)
- Evidence (this file): evidence/2026-10-31/sim-corpsemove-b.md
- Drivers: scripts/corpsemove-trace-b.js (stdout emitter, adapted
  verbatim from scripts/toolloss-gap-b.js with READ-ONLY corpse
  additions); splitter: scripts/split-corpsemove-b.js; analyzer:
  scripts/analyze-corpsemove-b.js; proof:
  scripts/test-corpsemove-b.js (27/28; single FAIL is the
  prereg-defined reproduction gate)
- Judged-attempt corpora: evidence/2026-10-31/sim-corpsemove-b-corpus-on
  (8 seeds, this base — no bearer deaths, no corpse moves)
- Control corpus: evidence/2026-10-31/sim-corpsemove-b-control-gap
  (original gap driver, 15215, this base — diverges identically)
- Prior corpus re-analyzed: evidence/2026-10-31/sim-toolloss-b-corpus-gap
  (15215 ON rerun — the bracket source)
- Per-morning/evening table: evidence/2026-10-31/sim-corpsemove-b-table.json
- Run log: evidence/2026-10-31/sim-corpsemove-b.stderr.log
