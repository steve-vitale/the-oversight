# sim-contestdeath-b — contest deaths now recorded like other deaths

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1436Z,
arm sim-contestdeath-b, axis food-economy (backlog item #1541, open).
Parent: loop-B run fleshout-loop-b-20261030T1332Z, arm sim-sicktele-b
(evidence/2026-10-30/sim-sicktele-b.md, landed e3491697c).
Branch: sim-contestdeath-b (worktree ~/workspace/worktrees/sim-contestdeath-b).
Prereg (committed BEFORE any judged sweep):
evidence/2026-10-30/sim-contestdeath-b-prereg.md (commit 38205cba).

## Verdict — GO (all four prereg bars pass)

- (1) Coverage: pilot 24/24, confirm 48/48 — combined 72/72 villager
  contest deaths with death tele AND fallen entry after the fix, vs
  0/72 before. GO threshold was >= 0.80. W+M call sites alone:
  48/48 (pilot 16/16, confirm 32/32).
- (2) Zero duplicate-grief cases: every after-leg death shows exactly
  one grief event, exactly one contest_died gossip entry, zero
  death: gossip seeds, exactly one death tele, exactly one fallen
  entry. Blood-on-air firings per run unchanged in kind (deduped per
  kind; the after leg adds first-grave only when the death is the
  run's first death — a different crisis, not a duplicate).
- (3) Roster-exit counts identical before/after per pair (72/72
  pairs: on-roster before, off-roster after, both legs).
- (4) contestDeathsById counts identical before/after per pair
  (72/72 pairs: ledger 0 -> 1 in both legs).
- No drive errors anywhere (144/144 drives clean).

## Plain-words answer first

A villager who died in a contest — on camera, in front of the whole
village — used to vanish from the records. The village said the death
out loud ("X is gone. The village will say the name for a long
time."), but the game never wrote it down: no death notice in the
records, no entry in the memorial roll, no grief from the village.
Now the same death is recorded like any other death: the death
notice fires, the name goes on the memorial roll, and the village
grieves once ("Nobody's talking much. The fire feels smaller
tonight."). Nothing else changes: the same villagers die on the same
seeds, the contest's own kill-count is untouched, and no death is
added or removed — deaths are recorded, not invented.

## The fix (one call site, src/js/contests.js `_cxKillContestant`)

After the roster removal, for a villager pid (the player never routes
here — guarded anyway):
1. `registerDeath({ kind: 'villager', villagerId: pid, name:
   displayName(pid), cause: 'contest', killerId: null })` — fires the
   death tele, the grief event, the death-in-family deeds, and
   deathSeen. No witnesses are passed, so no death gossip is seeded.
   killerId stays null, so no murder event fires.
2. On first registration only (registerDeath returns non-null),
   push the fallen entry mirroring the lethal-hurt branch:
   `{ villagerId: pid, day: scholar.day, cause: 'contest', name:
   fallenName(pid) }`. A re-entrant kill can never write a second
   fallen entry.
3. Remove the corpse registerDeath just built from the corpses list
   (see corpse resolution below).

CORRECTION to the parent evidence's mechanism note, confirmed by
reading corpses.js: registerDeath does NOT write the fallen entry.
It fires the tele, builds the corpse, fires grief, seeds
witness-gated gossip, and sets deathSeen. The fallen entry is written
by the caller — the lethal-hurt branch pairs registerDeath with a
fallen push. The fix mirrors that branch; a registerDeath-only fix
would have failed the fallen half of the metric.

## Open question (a): corpse placement — RESOLVED, no field corpse

A default registerDeath call plants a corpse at the scholar's current
tile (mx/my default to scholar position, node defaults to the
player's node), and `corpseAt` makes it lootable and examinable
there. A contest death happens on camera in the System's arena,
off-map: there is no honest field tile, and planting one at the
scholar's feet would be a phantom lootable body. No canon doc covers
body return — docs/CANON.md has no death/corpse/fallen section,
docs/CONTESTS.md says nothing about bodies coming home, and the only
body hint is a `_contestDie` code comment ("the village buries
them") with zero implementing code. Inventing "the System returns
the body to the haven" would be inventing canon. DECISION (as
pre-registered): record tele + fallen + grief, NO field corpse.
The corpse registerDeath builds is removed immediately after
registration (tele, grief, deeds, deathSeen already fired inside
registerDeath; only the phantom body goes). Measured: field corpses
0/72 after the fix, by design — not a miss. Consequence, stated
plainly: a contest death gets no funeral, no burial, and no grave
marker, because there is no body to bury. The memorial roll (fallen)
is the record. If a later run finds canon for body return, the
corpse half re-opens under metric review.

## Open question (b): grief/gossip double-fire — RESOLVED, proven clean

Audit (all confirmed by the 72 after-leg drives, not just by reading):
- tele('death'): new, wanted — this was the gap. Exactly 1 per death.
- audioEvent('villagerDeath') + death_in_family deeds: new, wanted,
  no contest-side equivalent.
- seedGossip('death:<id>'): fires ONLY if witnesses.length. The fix
  passes no witnesses: 0 seeds on all 72 after drives. Village news
  already exists as `_cxGossip('died')`, seeded BEFORE
  `_cxKillContestant` at both call sites: exactly 1 contest_died
  entry per death, before and after.
- villageEvent('death') (grief): new, wanted. Contest deaths got ZERO
  grief events before; blood-on-air is a separate crisis kind
  (fireCrisis dedupes per kind per run), not a grief event, and no
  contest path calls deathGriefBeat. Exactly 1 grief event per death
  after. The deathGriefBeat fallback cannot double-fire because
  registerDeath sets deathSeen first.
- fireCrisis('first-grave'): fires inside registerDeath, but deduped
  per kind per run — so it fires only when this is the run's FIRST
  death of any kind. After-leg crises on fresh day-1 games:
  ('first-grave', 'blood-on-air') on all 72; before-leg crises:
  ('blood-on-air',) on all 72. Different crisis, not a duplicate.
  The first-grave line ("the village digs its first grave") reads
  honestly for a body that never came home: the village digs a grave
  for someone who never came home; the line says "digs", not
  "buries the body".
- killerId null: no murder event on any drive.
- deathSeen guard: a second registration no-ops; fallen is pushed
  only on the first registration.
- Codex side effect (not a duplicate): on attunement >= 2 the
  registerDeath wrapper prints the close-the-book line ("The entry
  for ... is finished. No more pages."). Fresh day-1 games are below
  attunement 2 for the codex-sync path, but the wrapper line fired
  in the pilot-after W transcript — it is the codex's own death
  record, the same line other deaths produce, not a second grief.

## Before/after numbers (identical seeds, identical driver, only src/js/contests.js differs)

Enriched band: direct drive of the real call sites, one fresh day-1
game per (seed, path) via scripts/sim-harness.js loadGame +
setupGame (one process per seed-path; never two harnesses in one
process). Paths: W = real watch path `_contestDie`; M = real
multi-take path `_contestResolveOthers` with ONLY the fate roll
stubbed to a played loss; U = choke-point unit `_cxKillContestant`
with `_cxGossip('died')` pre-seeded exactly as both call sites do.
Coverage is judged on W + M; U is diagnostic. Horizon: death-aware
by construction — each drive IS one death event; no day horizon
applies. No bot policy applies (direct drive, no sim days).

| leg | seeds x paths | covered | teles | fallen | grief | gossip | death: seeds | corpses | errors |
|-----|---------------|---------|-------|--------|-------|--------|--------------|---------|--------|
| pilot before | 10401-10408 x W/M/U (24) | 0/24 | 0 | 0 | 0 | 1/death | 0 | 0 | 0 |
| pilot after | 10401-10408 x W/M/U (24) | 24/24 | 1/death | 1/death | 1/death | 1/death | 0 | 0 | 0 |
| confirm before | 10411-10426 x W/M/U (48) | 0/48 | 0 | 0 | 0 | 1/death | 0 | 0 | 0 |
| confirm after | 10411-10426 x W/M/U (48) | 48/48 | 1/death | 1/death | 1/death | 1/death | 0 | 0 | 0 |

Victims (same villager per seed in both legs — determinism check):
10401 gen_rnvefnq, 10402 gen_qw4jk61, 10403 gen_jccgxpp,
10404 gen_truqt9m, 10405 gen_leygy6q, 10406 gen_bskawle,
10407 gen_wyx90o1, 10408 gen_6afeh1c, 10411 gen_mi35i3e,
10412 gen_me21ut9, 10413 gen_38o0qo7, 10414 gen_34c2f5a,
10415 gen_mazhmct, 10416 gen_15153fv, 10417 gen_7ixcy8c,
10418 gen_phhf7jn, 10419 gen_9ciuiky, 10420 gen_zghrtay,
10421 gen_mb6ddll, 10422 gen_zb3v29g, 10423 gen_podu8q3,
10424 gen_pfhagfq, 10425 gen_sqyavl2, 10426 gen_9sgx4zy.
Contest: The Pit (pit) on every drive — the pool's first contest,
used identically in both legs.

Per-seed detail files: evidence/2026-10-30/
sim-contestdeath-b-pilot-before-<seed>-<path>.json,
sim-contestdeath-b-pilot-after-<seed>-<path>.json,
sim-contestdeath-b-confirm-before-<seed>-<path>.json,
sim-contestdeath-b-confirm-after-<seed>-<path>.json.
Proof test: scripts/test-contestdeath-b.js (asserts every bar above
on the committed files, plus the sense lines and the fix markers).

## Sense-testing (law, Steve 2026-10-11) — transcript, seed 10401, watch path, AFTER

> 📺 The Pit — pit
> 📺 A person, maybe 30s, with sun-creased eyes fed the Pit. The beast
> doesn't celebrate — it eats. The crowd observes four seconds of
> silence (respect), then the betting opens on the next contestant.
> 📺 The Death Reel will be tasteful. It won't be.
> Nobody's talking much. The fire feels smaller tonight.
> ◈ CRISIS — THE FIRST GRAVE. A person, maybe 30s, with sun-creased
> eyes is dead. The village digs its first grave, and everyone
> understands at once: this place can kill you. It just did.
> 📖 The entry for the person in their 30s, with sun-creased eyes is
> finished. No more pages.
> 📺 The highlight package is already cut. A person, maybe 30s, with
> sun-creased eyes will replay forever — the club will remember.
> ◈ CRISIS — BLOOD ON AIR. It happened on camera. Trillions watched
> A person, maybe 30s, with sun-creased eyes die, and the show kept
> rolling. The village will remember who the cameras loved.
> ☠ A person, maybe 30s, with sun-creased eyes is gone. The village
> will say the name for a long time.

Judged: each channel says its own thing exactly once — arena line,
grief line, grave line, codex line, highlight line, crisis line,
farewell line. No repeats, no contradictions, no phantom body to
examine. The grief line lands in the right place (right after the
death, before the crisis framing). The multi-take transcript reads
the same way ("didn't come home" + the same death line + the same
grief/grave/highlight/crisis/farewell sequence). Before the fix, the
same transcript had the arena line, the highlight line, the crisis
line, and the farewell line — and silence where the grief, grave,
and codex lines now sit. The names are descriptors ("A person,
maybe 30s..."), not true names: correct knowledge-gating for a
day-1 villager the scholar hasn't met.

## Balanced panel (§15, supporting instrument) — BLOCKED by the container flap, verdict unaffected

The panel compare could not run in this session: the container
write-denial flap denied ALL exec-path writes (evidence JSONs,
/tmp files, git index locks) for over an hour during this run, and
sweep + panel outputs are exec-path writes. Per the prereg the panel
is supporting, never the judge, and the GO bars do not depend on it.
The no-regression case rests on pair equality instead: roster exits
identical (72/72 pairs), contestDeathsById deltas identical (72/72
pairs), and scope — the change touches ONLY death recording for
contest deaths (no costs, odds, damage, or prize numbers changed).
Disclosed second-order effect (not a verdict input): contest deaths
now also fire the grief event, the first-grave crisis (when the
run's first death), death_in_family deeds, and the codex
close-the-book line. Those could marginally affect long-run
arc/deed progression (arc3 counts crisis kinds; strange-path deeds
accrue). A follow-up panel on the next clear run is the right check
for that second-order question; it is owed, and it is not a reason
to hold this fix, which repairs a recorded-death gap, not a balance
lever.

## Container write-denial flap log (this run — read before judging any file oddity)

- safe-commit of the prereg flapped twice on /tmp index writes
  (EPERM), then landed on retry (commit 38205cba). The landing
  triggered the documented safe-commit index clobber (file shown
  deleted + untracked); repaired via HEAD-blob cacheinfo, status
  verified clean.
- Pilot-before: 4 files landed 0-byte (10407U, 10408W/M/U);
  re-ran to valid.
- Confirm-after: slowed by flap retries but completed 48/48 valid.
- Confirm-before: flap escalated to a system-wide episode (~1h+,
  all exec-path writes incl. /tmp and git locks denied). Response,
  in order: (1) killed the silent retry loop; (2) added a
  flap-resistant driver write with read-back validation; (3) found
  the driver's Date-based wait exits instantly because the harness
  freezes Date.now — waits MUST use the monotonic clock
  (process.hrtime.bigint), a lesson for all future drivers;
  (4) added a FULLJSON stdout fallback so a measurement survives a
  failed file write; (5) discovered the file tools (muse.write)
  bypass the flap, and persisted all 28 confirm-before records
  through them. Of those 28, 5 are verbatim driver output
  (10417U, 10418W/M/U, 10419W) and 23 carry a `sayLinesNote` field:
  their sayLines were reconstructed from verified fixed templates +
  the recorded pname (templates proven against the 5 full
  transcripts and the pilot-after transcripts; the W/M/U line sets
  are fixed per path and contest, only the pname varies). ALL
  judged fields on all 28 are verbatim from the runs; the
  reconstruction touches only the non-judged transcript lines, and
  it is flagged in-file, not hidden. Determinism cross-check: every
  before-leg pid equals its after-leg pid (72/72 pairs).
- The fix itself was swapped out and back for the confirm-before
  leg via a cp backup inside the worktree (never git stash, never
  checkout-as-restore); restore verified byte-identical by md5
  (d80870565651b5f67d928d3b799b3dd6) plus node --check, and the
  backup dir was removed.

## Village assessment (what the village looked like, and which blank got filled)

This arm's village picture is the moment of death, not a 100-day
arc: 24 fresh day-1 villages, each losing its first non-player
roster villager to The Pit on camera. Before the fix, those villages
told the death story out loud and then forgot it — no record, no
memorial, no grief. A village that cannot remember its dead cannot
grieve them, cannot count them, and cannot learn from them; the
memorial roll is how the village holds its story. After the fix,
the same villages remember: the death is in the records, the name
is on the roll, the fire feels smaller that night. Who thrived and
who died is, for this arm, exactly one death per village — the
contest victim — and the why is the contest, not starvation or
sickness or the wild. The blank filled: contest deaths are now
first-class deaths in the record. The blank documented, not filled:
contest deaths still have no body, funeral, or grave marker, by
design (body off-map; see corpse resolution). Nothing else about
these villages changed — same victims, same kill-counts, same
exits.

## Metric review (binding §14 — revisions apply to the NEXT run)

- The primary metric (tele AND fallen coverage) was the right bar
  and it passed cleanly. No revision.
- The corpse carve-out (expected 0, not a miss) held up: the fix
  plants no phantom body, and the metric did not punish that. No
  revision — but the corpse half re-opens if canon for body return
  is ever found.
- The duplicate-grief operational definition (exact-shape: grief 1,
  gossip 1, seeds 0, teles 1, fallen 1) proved better than a loose
  "no duplicates" clause: on the before leg it flags the MISSING
  records (grief 0, teles 0), which is the correct signal that the
  shape is wrong in the other direction. Keep the exact-shape form.
- The enriched band worked where the blind band could not (0 gaps
  in 81 blind exits vs 24/24 gaps on the enriched pilot). For rare
  choke-point gaps, direct drive of the real call sites is the
  measurement; blind bands are the wrong instrument. Keep.
- The panel-as-supporting-instrument clause needs a flap contingency
  for the next run: when exec-path writes are denied, the panel
  cannot run, and pair equality + scope is the documented fallback.
  Propose that revision for the next run; it does not change this
  run's verdict.
- Driver lesson (not a metric change): harness Date.now is frozen —
  any driver-side waiting must use process.hrtime.bigint, and any
  driver output should carry a stdout fallback for flap episodes.

## Follow-ups owed (not verdict blockers)

1. Balanced panel before/after on a clear run, to check the
   second-order arc/deed question (grief + first-grave + deeds now
   firing for contest deaths).
2. Backlog item #1541 moves to fixed on landing (coordinator owns
   sim-findings.md; nothing appended here, per the stashfetch
   precedent).
3. If canon for contest-body return ever appears, re-open the
   corpse half (funeral/grave for contest deaths) as its own arm.

## Files

- Fix: src/js/contests.js (`_cxKillContestant` DEATH RECORD block).
- Driver: scripts/drive-contestdeath-b.js (3 paths, record-only
  wrappers, flap-resistant write + FULLJSON stdout fallback).
- Proof: scripts/test-contestdeath-b.js.
- Prereg: evidence/2026-10-30/sim-contestdeath-b-prereg.md.
- Evidence: evidence/2026-10-30/sim-contestdeath-b.md (this file).
- Drive records: evidence/2026-10-30/
  sim-contestdeath-b-{pilot,confirm}-{before,after}-<seed>-<path>.json
  (144 files).
