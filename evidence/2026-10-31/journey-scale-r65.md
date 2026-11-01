# journey-scale r65 — Lane A, leg 3 SCALE (2026-10-31/11-01)

**Run id:** oversight-playtest-loop-20261101T0045Z (scheduled 23:45 CDT 2026-10-31; lock created 04:56:54Z).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
Note on the repeated leg: r61–r64 recorded a "still reads 3" anomaly,
but THIS run's read is explained, not anomalous: HEAD is fa2c896d5
journey-deepening r78 (committed 04:51:05Z) and the rotation file's
mtime is 04:52:41Z — the deepening closeout's 2→3 write, 96 seconds
after its merge commit. The 3 this run reads is fresh and
queue-correct. The write is verified by reading the file back at
closeout.
**Base:** master@fa2c896d5 at branch creation. **Zero src/js changed
by this run at closeout** — measurement plus one driver, one instrument
driver, one analyzer (labels/EVIDIR only), and evidence.
**Pre-register:** evidence/2026-10-31/journey-scale-r65-prereg.md
(written and committed before any seed ran).
**Gating freeze honored; TACKLE ALL not claimed; perception law honored**
(no list-fed work; drivers read only engine-exposed state, as before).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this run
  created it and deletes it at closeout.
- **Worktree registration hit the intermittent .git-write EPERM flap**
  (same class as the 2026-10-23 lesson, scoped to
  ~/workspace/the-scattering/.git/): first register failed on checkout
  writes, second failed with "could not write to
  '.git/worktrees/journey-scale-r65/locked': Operation not permitted".
  The branch journey-scale-r65 already existed in refs at fa2c896d5
  (verified via git rev-parse); no ref surgery was attempted.
  Registration succeeded on the 12th register-every-attempt try at
  05:24:28Z (11 fast failures on the same locked-write EPERM in
  between). A sibling lane-B tree, journey2-crisis-r91, registered
  successfully during the same window, confirming the flap is
  intermittent per-call, not a hard outage. First-attempt evidence
  that bulk checkout passes and only metadata writes flap: the very
  first attempt checked out all 65,944 files, then failed resetting
  the index.
- **Heartbeat:** manual heartbeat at registration verified landed
  (05:24:47Z) plus a 10-minute background heartbeat loop for the whole
  run (registry read-back showed age 7.8 min mid-run; never stale past
  the 15-minute threshold).
- **Safe-commit index clobber struck on the prereg commit**, same
  class as r56–r64: after a correct private-index commit, the
  worktree's main index showed all four committed files
  staged-as-deleted plus untracked. Repaired via HEAD-blob cacheinfo
  (`git update-index --add --cacheinfo`), then verified: `git
  status` empty, `git diff HEAD` empty, hash-object matches HEAD.
  The commit itself was correct (291c5297).
- **Detached-loop log writes did not land:** two nohup background
  retry loops advanced (sleep children observed) but their log files
  stayed 0 bytes while foreground writes landed. Loop progress was
  verified through runtime-tracked sessions instead, not the files.
  Recorded as an observation, not a theory.

## Verdicts (binding questions, answered)

### 1. QUAD-PARITY-R65: PARITY PASSES — all four seeds byte-identical to r64
Range since r64's final base (cc67af1b7..HEAD, src/js + src/data) is
exactly ONE file — betrayal.js (+12, 785cef89c journey-social r78:
the NO-SHARED-WORDS gate, case-interrogation menu options withheld in
a nonverbal conversation with no interpreter). No generation, loot,
wave, table, pellet, or hierarchy code changed.

| seed | r64 | r65 | capture diff |
|---|---|---|---|
| 85001 | SCATTERED d28, 3/3, pantry 0, none arc3, deaths 19, maxWave 2, pilg 0, fusion F, green_whisper/green_thumb/lucky_rock | IDENTICAL | 0 lines |
| 85002 | ALIVE d181, 8/8, pantry 92,669, none arc3, deaths 13, maxWave 2, pilg 34, fusion T, green_whisper/scream_cheese | IDENTICAL | 0 lines |
| 85003 | DEAD d154, 0/0, pantry 0, lesser arc4 waiting+announced, deaths 51, maxWave 4, pilg 56, fusion T, beast_calm/echo_location | IDENTICAL | 0 lines |
| 85004 | DEAD d169, 0/0, pantry 0, lesser arc4 waiting+announced, deaths 73, maxWave 4, pilg 5, fusion F, beast_calm | IDENTICAL | 0 lines |

The nonverbal gate moved nothing on this leg's policy path: no capture
line differs on any seed, and none of the six people-check transcripts
is a nonverbal conversation (all show full menus). r64's twoblow
divergence on 85003 reproduces exactly (DEAD d154, same scalars) —
the divergence is stable, and the gate change adds no further movement.
**Descriptive quad count, r65:** ALIVE 1/4, SCATTERED 1/4, DEAD 2/4;
lesser seat 2/4; full seat 0/4; wave 5 reached 0/4 — identical to r64.
**Weapon-craft lines: 0 on all four seeds. Deadfall-duty lines: 0
on all four seeds** — the fifth consecutive 0/4 for both duties on
this leg's policy path (r61–r65). Barrier-dump line counts: 85001: 0,
85002: 0, 85003: 1, 85004: 2 (identical to r64). No new guard-break
signal; the pin stands in its r55 form.

### 2. DUTY-GATE (why weapon-craft + deadfall never fire): BOTH CLASSIFIED
**Purity: PASSED.** Duty driver vs r65 driver on quad seeds
85001–85004: 0-line capture diffs on all four, identical census
scalars. The instrument (daily weaponCraft map, weaponCraftCd map,
assignments map, roster, player-at-Haven; all reads) does not move
the sim.
**Deadfall: POLICY.** The assignments map never contains a 'deadfall'
entry on any own-seed row of any seed (28/180/153/168 daily rows;
see the driver wart below — files are cumulative, analysis sliced
per seed). The engine
executes the duty (loop-B sim-deadfall-b proof, landed 2026-10-31),
but the competent/scalecourt staffing on this path never assigns the
task — only the loop-B deadfall-b staffing layer staffs it, and this
run does not import that cross-lane package. The duty is unstaffed,
not broken.
**Weapon-craft: PRECONDITION.** The duty runs daily (villagerBuildDay
calls villagerWeaponCraftDay unconditionally — no policy gates it),
and knowledge is NOT the blocker: every seed ends with 6 villagers at
L1 in a ladder recipe. But weaponCraftCd — the last-attempt-day map,
set the moment a villager passes the gates and a recipe is picked —
is EMPTY on every row of every seed: zero attempts ever, not zero
successes. The attempt gates after knowledge are: at home (not away,
not dead), weaponless (no weapon in either hand or pack, after
autoEquip), and materials reachable (own carried pack + camp pile)
for branch+stone+vine (hunting spear), branch+wood (fire-hardened
spear), branch+vine (crude bow), or wood+2 vine (bow).
The at-Haven witness gate is NOT the explanation: the player is at
Haven on most own-seed duty rows (85001: 28/28, 85002: 141/180,
85003: 138/153, 85004: 140/168), yet zero attempts. Mechanism hypothesis, flagged as
inference (the instrument records knowledge and attempts, not
weaponless-ness per villager per day): the knowledge rule seeds L1
from a finished ladder weapon the villager wears, carries, or keeps
in their own stash — so most knowers are armed by the same fact that
taught them, and autoEquip arms pack-carriers before the weaponless
check. The eligible set (a weaponless knower with branch/vine/wood/
stone in hand or pile) is structurally tiny. The armor-craft contrast
proves the tick itself is alive: sewed-armor lines fire on the same
daily tick (85002: 7, 85003: 1, 85004: 5; 85001: 0 in its 28-day
window). Next instrument, if pursued: a daily weaponless-knower count
to split the armed-knower hypothesis from the materials hypothesis.
No fix landing follows from Q2 alone (prereg rule).
**Driver wart, found during analysis (does not touch the findings):**
playSeed resets capture, seatWatch, hungerWatch, and tableWatch per
seed but the new dutyWatch was NOT added to that reset block — so
each seed's duty file contains all prior seeds' rows appended
(85002's file holds 28+180 rows, 85003's 28+180+153, 85004's
28+180+153+168). The analysis above slices each file to its own
seed's rows (rows after the previous file's length); every finding
was re-verified on those slices — wcd empty everywhere, deadfall
empty everywhere, 6 knowers per seed, at-Haven fractions as stated.
A next run reusing this instrument should add dutyWatch to the reset
block; the wart is recorded here rather than silently fixed mid-run,
since the prereg binds the instrument as run.

### 3. PEOPLE CHECK (sense law — all 6 Q1 quad transcripts read in full)
5 of 6 fully real, 1 partial blemish (deterministic recurrence of the
r64 blemish, same seed, same NPC, same lines — not a new break class).
No fabricated shared history, no static menus.
- **85002 d90 Luis (favor, sickness):** identical to r64 — need owns
  the opener, commits ("I'll come back to help"), stage 2→3, ends
  resolved ("Thank you. Whatever you can do — thank you").
- **85002 d120 Luis (dream question):** identical to r64 — answer
  lands ("Then it's not gone. Not really"), goon thins friendliness.
  Stage 1→2.
- **85003 d90 Olivia (betrayal, the diverged seed):** the invitation is
  TAKEN ("All right. Let's go"), which is exactly the rationality
  item — but the post-accept exchange is the same aphorism loop as
  r64: three "Tell me more" prompts yield three stoic one-liners
  ("The will to live isn't poetic. It's stubborn", "One more day.
  That's the goal", "I've stopped asking why") plus two (listen)/nod
  beats, with no new thread, no resolution, no plant, no owe.
  Opening real, tail filler. Deterministic: byte-identical lines to
  r64, so this is a content gap in the post-accept path, not noise.
- **85003 d120 Dale (water-haul favor):** identical to r64 — need owns
  the opener ("We're down to 5 liters of clean water. Haul the creek
  with me at dawn? Two buckets each"), commit → "Dawn, then."
  Stage 1→3. Concrete, consequence-promising. Real.
- **85004 d90 Rowan (alone-time question):** identical to r64 —
  answer engages ("Solitude's a resource too. Scarcer than food,
  some days"), goon pulls back half a step. Stage 1→2.
- **85004 d120 Regina (old-life skill question):** identical to
  r64 — patience answer lands ("You're an asset"), goon gives
  crossing-guard people-reading — occupation-grounded, specific.
  Stage 1→2.
No recurrence in this sample of the Dale gossip tail, Irving
displacement, Thabo withdrawal-only talk, or the Boris nod-loop (none
arose). The nonverbal gate surfaces nowhere in dialogue here.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: unchanged in kind — the climb's machinery fires (courts,
  covenants, pilgrimages, national/global voicing, lesser seats
  waiting on 2/4 quad seeds), but neither new duty fires once on this
  leg's policy path for the fifth run running, and Q2 now names why:
  deadfall is never staffed here, and weapon-craft never attempts —
  knowledge without a weapon in hand is the rare case, not the rule.
  The bank that prices the run still depends on a monster arriving on
  a feast night — an opportunity the player cannot schedule.
- FUN: unchanged in kind — the table voicing and the seed loop's
  memory are still the leg's best writing. The thin spot is the same
  Olivia post-accept loop, now proven deterministic rather than a
  one-off — a content gap worth a fix, not a break.
- WINNABLE: not shown, again. The lesser seat waits on 2/4 quad
  seeds; the full seat stays unwon (wave 5 reached 0 everywhere).
  Parity passing on all four seeds means single-seed winnability
  claims on this leg are still worthless; only bands speak — and this
  band says the same thing r64's did.

## TABLE-APPROACH (standing, report-only)
Quad, end state: 85001 seat none arc3; 85002 seat none arc3;
85003 seat lesser arc4 waiting+announced (then wiped d154);
85004 seat lesser arc4 waiting+announced (then wiped d169).
Full seat 0 everywhere; wave 5 reached 0 everywhere.

## BARRIER PIN (standing instrument)
Barrier-dump line counts per Q1 seed: 85001: 0, 85002: 0, 85003: 1,
85004: 2 (identical to r64). No new guard-break signal. The pin stands
in its r55 form; it does not overturn.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts), plus the fusion/ability columns (reads, not scores),
  plus the r61 end-state class (ALIVE / SCATTERED / DEAD) and the
  weapon-craft-line and deadfall-duty-line counts.
- No metric was re-scored mid-run. The prereg's pilot gate is the
  r62 revised gate (crash/empty capture, not pilgrimages); it did
  not fire (85001 ran clean, capture 246,475 bytes — byte-identical
  size to r64's pilot). The prereg's parity verdict rule fired as
  written: scalars reported vs r64 first, and with zero differences
  no first-divergence audit was triggered.
- The prereg's duty purity gate fired as written: 0-line capture
  diffs + identical scalars on all four seeds before any duty was
  scored.
- r64's bank-trace finding STANDS (not re-tested; the bank instrument
  was not re-run). r63's mantle-pass proof STANDS (not re-tested;
  the pellet story is closed). r58's Irving-displacement answer
  STANDS unre-tested (no Irving transcript arose). r58's subject-menu
  correction STANDS unre-tested (no subject-first arm here). r58's
  Boris nod-loop stands UNRE-TESTED (no Boris transcript arose).
  r56's chooseAbility-unguarded note stands (no duplicate ability id
  in any control seed's abilitiesHeld — all lists distinct). r52's
  barrier pin stands in its r55 form (see above).

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline .../scale-census.json
--current 'evidence/2026-10-31/journey-scale-r65/journey-scale-r65-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ one LOUD line: `census.pantryKcal newly appeared: baseline 0 ->
current 92669 (n=4 files)`, exit 0. **Verdict: EXPLAINED, not a
bug.** Identical in kind to r62's/r63's/r64's verdict: the baseline is
the old-base quad's SUMS (day 579, popAlive 1, pantry 0, maxWave
16, pilgrimages 69 — the r60/r61 lineage where all four villages
ended dead/scattered with empty pantries). The r65 quad sums are
day 532, popAlive 11, pantry 92,669, maxWave 12, pilgrimages 95 — the
pantry is 85002's alone (identical to r64's 85002; the other three
seeds hold 0). A cap-surviving village holding a pantry is not a
telemetry or game defect. The baseline is NOT rolled on this run's
numbers (prereg decision stands).

## Tests
- `node --check` clean on the r65 driver, the duty driver, and the
  analyzer (at creation).
- Duty instrument purity: 0-line capture diffs vs the r65 driver on
  all four quad seeds, identical census scalars (see Q2).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  **284 passed, 6 failed in 495s** (290 scripts) on the first run; a
  second full run capturing the complete failure list gave the same
  **284 passed, 6 failed in 564s**. The 6 are EXACTLY r64's 6
  pre-existing assertion-failure scripts, same names:
  godpath/test-measurement-proof-update.js,
  godpath/test-measurement-workflow.js,
  godpath/test-mobile-combat-cadence.js,
  godpath/test-occupation-panels.js,
  godpath/test-phone-frame-proof.js, and
  test-establishment-r20-fixes-20261020.js (the racks-full "next day
  voices once more" gate assertion, seen in the first run's tail).
  r64's 7th failure, test-measurement-cache-flags.js, PASSED on both
  r65 runs — confirming r64's classification of it as a
  concurrent-load flake (it passed solo 4/4 in r63). The two r63
  timeout flakes that passed in r64 also passed here
  (test-trust-observer-neutrality.js, test-synergy-stall.js — both
  appear only in the slowest list, under the cap). No quick-list test
  imports this run's scripts, and this run's change set is drivers +
  analyzers + evidence with ZERO src/js, so it cannot have caused any
  of the 6.
- Suite side effect, checked not assumed: `git status` after both
  suite runs shows only this run's three evidence paths untracked —
  no stray docs/ONTOLOGY.md modification this run, nothing to discard.
Verdict: zero regressions attributable to this run.

## Landing (filled at closeout)
Master at worktree creation: fa2c896d5. At closeout master had moved
to 3d0958360 (19 commits: lane-B coordinator evidence, journey
crisis r90, and one src change — sim-contactfinish-a CONTACT-FINISH
rule, fieldFights.js +107, wave>=3 volley-break block, plus a batch
ship version stamp in build.js). The branch was rebased cleanly onto
3d0958360 (no conflicts, no stop-at-pick quirk this time), and proofs
were re-run after the rebase as the body requires: node --check clean
on all three scripts, and a FULL quad re-run on the rebased base into
a scratch evid dir (not committed; its comparison numbers are the
record below).
**Rebase re-run result — 3/4 identical, 1 seed moved by the new base:**
85001, 85002, 85004 give 0-line capture diffs and identical census
scalars on the new base. 85003 DIVERGES (13,114 capture diff lines):
committed (measurement base) DEAD d154, 0/0, deaths 51, pilg 56,
beast_calm/echo_location vs rebased DEAD d125, 5/5, deaths 48, pilg
41, beast_calm/lucky_rock/live_broadcast — same lesser arc4 waiting
seat, different fate.
**First-divergence audit (85003):** captures are identical through
line 5075. First divergence at line 5076: a door-defense against The
Callback — measurement base: "4 driven off" (no kill); new base: "1
put down, 3 driven off" plus the SYSTEM veteran-kill announcement
("Olivia just put down The Callback... on CAMERA. That's a veteran
kill") and a Codex page ("The Callback is dead"). Downstream: Ye-na
bound up 40→55 vs 45→60 HP, a different basket-setter, a different
outing (Olivia/Ye-na forage vs Henrik bundle), a fireside Callback
story beat only on the new base, and later "Olivia killed the
Callback alone" vs "Olivia stared down the Callback and it backed
off". Hungerwatch first differs at d52, wantwatch at d56 — a mid-run
fight divergence cascading. No volley/contact-finish line appears in
either player capture, so the rule firing itself is inferred, not
directly observed — stated as inference, not proof. What is proven:
the divergence is real game behavior from the landed contact-finish
change, not a driver bug (the range holds nothing else that could
move a field fight: build.js stamp + fieldFights.js only) and not
measurement noise (3/4 seeds byte-identical). The Callback kill is a
wave-3+ field-fight outcome change, consistent with the rule's
wave>=3 scope.
**Scope of this finding:** it does NOT re-score Q1. Q1 parity (r65 vs
r64, measurement base) PASSED as preregistered. The rebase re-run is
the body's post-rebase proof check, and its verdict is: the
contact-finish rule's scale-leg footprint on this band is 1/4 seeds
moved, seat outcomes unchanged (lesser 2/4 on both bases), full seat
still 0/4, wave 5 still 0/4. Q2's duty classification was measured on
the measurement base and was not re-run on the new base.
Merged locally via `git merge --ff-only journey-scale-r65` → master
(verified: master tip equals the branch tip after merge), pending
ship (no bump, no push, no live verify — ship loop owns those).
Branch commits: 153fa55d7 (prereg + driver, rebased from 291c5297),
3048d2cb5 (quad + duty-trace + evidence, rebased from c3fc4ae8).
This landing-section commit follows on the same branch and is merged
by a second fast-forward.
Worktree released + branch deleted at closeout; final main-tree
status clean. Rotation file written 3→0 at closeout and verified by
reading it back. Playtest lock deleted at closeout.
