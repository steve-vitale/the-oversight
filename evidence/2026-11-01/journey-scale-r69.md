# journey-scale r69 — Lane A, leg 3 SCALE (2026-11-01)

**Run id:** laneA-scale-2026-11-01T18:45CST (scheduled 18:45 CST 2026-11-01).
Rotation read 3 → leg 3 SCALE; write 3→0 done at run start and verified
by read-back (r68 had already closed 3→0 at its closeout and the file
read 3 again at this run's start, so this run re-plays scale and
re-writes 0 — queue position is scale either way).
**Base:** master@9b310a82c at branch creation.
**Pre-register:** evidence/2026-11-01/journey-scale-r69-prereg.md
(written and committed before any scored seed ran; the Q2 test change
below was committed after the scored quad, under its own fix gate).
**Change set at closeout:** ONE test-file line (capable-bot load seed
9→10 + comment) + tooling (r69 driver/analyzer, labels/seeds/EVIDIR
only) + evidence. ZERO src/js, zero src/data. Gating freeze honored;
perception law honored (all instruments read-only; the gossip picker
only presses an offered menu item, never engine state).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this
  run created it and deletes it at closeout.
- **Pre-flight clean:** main-tree `git status` empty, disk 24%,
  `git pull` already up to date, worktree-reap ran (8/16 active —
  all dirty/held lane-B and build trees, correctly untouched).
- **Heartbeat:** manual heartbeat at registration verified landed
  (00:45Z). The standing loop was started with setsid + nohup this
  time (r68's lesson: a loop inside a reaped exec session dies with
  it) and its first beat is verified in the registry (00:56Z).
- **Safe-commit index clobber struck once**, same class as r66–r68:
  after the correct private-index prereg commit, the worktree's main
  index lied (all 3 files staged-as-deleted + untracked). Repaired
  via HEAD-blob cacheinfo, verified: `git status` clean,
  `git diff HEAD` empty, hash-object matches HEAD. The commit itself
  was correct.

## Verdicts (binding questions, answered)

### 1. SCALE CONTINUITY (report-only + verdicts)
Fresh quad 85031–85034, r68 instrument (labels/seeds/EVIDIR only),
GOSSIP_FIRST=1, DAYCAP 180, death-aware stop. Pilot gate passed on
85031 (no crash, 7 pilgrimages, both transcripts present).

| seed | end | day | pop | pantry | rank | seat | arc | maxWave | pilg |
|---|---|---|---|---|---|---|---|---|---|
| 85031 | ALIVE (day cap) | 181 | 11/11 | 10,313 | regional | none | 3 | 4 | 7 |
| 85032 | ALIVE (day cap) | 181 | 9/9 | 24,956 | regional | lesser | 4 | 4 | 12 |
| 85033 | DEAD | 146 | 0/0 | 0 | regional | lesser | 4 | 4 | 56 |
| 85034 | SCATTERED | 134 | 1/1 | 0 | regional | lesser | 4 | 4 | 4 |

- Regional 4/4; **national 0/4** (r68's band reached national on 2/4
  — band variance on fresh seeds, not a regression claim: no game
  code changed between bands, and the climb machinery still fires:
  courts, covenants, pilgrimages, lesser seats waiting on 3/4).
- Lesser seat 3/4; full seat 0/4; wave 5 reached 0/4. The scale-leg
  shape is unchanged: the lesser seat waits, the full seat stays
  unwon, wave 5 unfought in normal play.
- 85033 is the band's hard-luck climb: 56 pilgrimages, lesser seat,
  arc 4 — then dead by d146. 85032 is the band's strong village:
  alive at cap, pantry 24,956, lesser seat, arc 4, but still
  regional, not national.

### 2. CAPABLE-BOT SECTION 7 FIX GATE: GATE MET — re-seed lands
Diagnosis (single-file run, before any change): 39 passed, 1 failed —
"real capable player combat earns the food deed at first use", with
uses = 4 entries ALL `{fighting: true, before: true, after: true,
earned: true, source: 'v:hannah_kim'}`. A villager's blow banked the
feast deed during the feast-draw fight in upkeep, before the test's
drive phase recorded anything — so no player-first entry could exist.
This is NOT a game defect: SEATBLOW-OPEN (Steve 2026-10-17, in
feastBuff.js) says the deed is banked by whoever's blow lands first,
scholar or villager. The section 7 assertion tests the narrower,
legitimate thing — that the PLAYER's combat can earn the deed — so
it needs a fixture trajectory where the player lands first. That is
exactly why this file was already re-seeded twice (7→8→9, documented
in its own comment); the r67 dedupe fix shifted the RNG stream and
broke seed 9 the same way.
Fix (gate clauses a–c all met): load seed 9→10, comment updated to
record the chain. NO assertion changed. Proof: the real file runs
**40 passed, 0 failed**, including the strict player-first deed
assertion. The r67 adjudication (deed mechanism intact, fixture
sensitivity) is confirmed, not assumed: the mechanism banks the deed
on first blow by design, and the fixture now proves the player path.
If a future change shifts the stream again, re-seed again — never
loosen the assertion (green-list rule).

### 3. PEOPLE CHECK (sense law — all 8 transcripts read in full)
8 of 8 fully real. No fabricated shared history, no static menus, no
filler loops. One template echo, named below — not a repeat class.
- **85031 d90 Luke (seek_taken):** grief asked plainly, commit lands
  ("Even asking is more than the silence"), want 1→3. Real.
- **85031 d120 Luke (seek_taken, re-planted d107):** same want, new
  instance — the opener re-serves because the want re-planted, not
  because a line repeated in-sitting. Accept → ridge walk outing
  ("Nothing much there — but they talk the whole way"). Real, though
  the outing line itself is thin prose.
- **85032 d120 Salvador (seek_taken):** short and coherent (Ernesto
  gone, dreams of humming pods), commit lands, want 1→3. Real.
- **85032 d90 Felipe (curious):** the band's best teaching beat —
  Death Cap taught by leaf, stem, smell; two real places offered
  (ridge view, old trapline). The two place lines share the template
  tail "I'll show you on the map sometime. It's real." — the gossip
  analyzer flags this as 1 NEAR pair, but the content differs (two
  distinct places); it is a template echo, not repeated content.
- **85033 d120 Tom (ask_favor, trust 29):** hungry villager asks for
  food plainly, commit lands. Real; low trust does not block asking.
- **85033 d90 Carlo (curious):** first-memory exchange — "Mexico
  City... Or I invented it. First memories are half real and half
  the story you needed." Real, and the band's best single line.
- **85034 d120 Brian (ask_favor):** invitation ACCEPTED, then Brian
  sinks back down — "Maybe not today. The fire's got me." An
  accept-then-abort beat: not a filler loop, but the abort reason is
  vague and the player keeps nothing for the accept. Named as an
  observation, not a defect — one instance does not make a class.
- **85034 d90 Barbara (grief + gossip):** the band's only gossip
  sitting (1 pick). A 5-beat gossip chain (walk-out, Elena out,
  Elena back, Luis out), zero repeats, zero fallback lines. Real.
- Gossip reachability, stated plainly: the forcing picker pressed
  gossip in only 1 of 8 sittings — ask:gossip was never offered in
  the other 7 menus (same class as r68: forcing cannot conjure an
  offer). When gossip IS reached, it serves varied real news.

### 4. DUTY REACHABILITY + WSPLIT CONTINUITY (counts, report-only)
Quad totals: villager-days 2,466; knower-days 1,169; armed knowers
1,168 (real 1,021, both 147, stick-only 0); weaponless-knower days 1;
eligible days 0; attempts (Cd advances) 0; unexplained non-attempts 0;
stick-blocked days 0.

| seed | villager-days | knower-days | weaponless-knower | eligible | attempts |
|---|---|---|---|---|---|
| 85031 | 894 | 517 | 0 | 0 | 0 |
| 85032 | 661 | 330 | 0 | 0 | 0 |
| 85033 | 531 | 139 | 0 | 0 | 0 |
| 85034 | 380 | 183 | 1 | 0 | 0 |

- Weapon-craft lines 0/4 seeds; deadfall-duty lines 0/4 seeds — the
  NINTH consecutive 0/4 for both duties (r61–r69).
- The band's single weaponless-knower day (85034, knows
  hunting_spear) was NOT eligible for a different reason than usual:
  materials-blocked (branch 0/1, vine 0/1, stone 1/1; cooldown
  clear). So the duty's eligible population stays structurally ~0,
  now with a second blocking cause documented alongside the
  armed-gate: even the rare weaponless knower can lack the pile.

## BARRIER PIN (standing instrument)
10 guard-working entries across the band (85031: 4, 85032: 3,
85033: 2, 85034: 1) — all sleep attempts refused mid-fight
(inCombat true, tbfight live, not over). The pin stands in its r55
form; it does not overturn.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: unchanged in kind — the climb's machinery fires on all
  four seeds (regional everywhere, courts, covenants, pilgrimages,
  lesser seats on 3/4), but national on 0/4 this band shows the
  ladder's upper rungs still swing hard on seed luck. The self-craft
  duty's non-firing is now a nine-band structural fact, with two
  documented blockers (armed-gate, materials). Gossip, when reached,
  serves varied real news — but reaching it still depends on the
  menu offering it (1 of 8 sittings here).
- FUN: unchanged in kind — the best writing is small and human
  (Carlo on first memories; Felipe teaching Death Cap; Barbara's
  gossip roundup). The betrayal-accept path shows a new shade this
  band (Brian's accept-then-abort) alongside a played outing (Luke).
- WINNABLE: not shown, again. The lesser seat waits on 3/4; the full
  seat stays unwon (wave 5 reached 0 everywhere). National on 0/4
  this band is a step back from r68's 2/4 on the ladder, not on the
  seat — band variance, but the direction to watch next run.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts), plus the fusion/ability columns (reads, not scores), plus
  the r61 end-state class, the weapon-craft-line and deadfall-duty
  line counts, and the gossip-exposure counts (ask:gossip picks,
  THEM lines per transcript, sittings) from the r69 analyzer (r68
  analyzer, labels/seeds only). Note for future runs: the analyzer's
  "gossipThem" counts ALL THEM lines in a transcript, not
  gossip-thread lines only — read it as transcript size, and use
  the gossip analyzer's pair counts for repeat verdicts.
- No metric was re-scored mid-run. The pilot gate passed as written
  (85031 clean, 7 pilgrimages, both transcripts present). The Q2 fix
  gate fired as written: diagnosis first, re-seed only, strict
  assertion untouched, full file green before landing.
- Carried, still unre-tested: Olivia post-accept aphorism loop as an
  Olivia instance; r65 bank-trace finding; r63 mantle-pass proof;
  r58 Irving-displacement, subject-menu, Boris nod-loop; r56
  chooseAbility-unguarded note. NEW carried observation (not a
  defect): Brian-style accept-then-abort (1 instance, r69).

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-census.json --current
'evidence/2026-11-01/journey-scale-r69/journey-scale-r69-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ one LOUD line, investigated same-run, EXPLAINED:
- `census.pantryKcal newly appeared: baseline 0 -> current 35269
  (n=4 files)`: identical in kind to r62's–r68's verdict. The
  baseline is the old-base quad's SUMS (all villages dead/scattered,
  empty pantries). The r69 quad's pantry is 85031's 10,313 +
  85032's 24,956 (the other two seeds hold 0). A surviving village
  holding a pantry is not a defect. Pilgrimages did NOT trip LOUD
  this band (79 vs baseline 69). The baseline is NOT rolled on this
  run's numbers (r68's decision stands).

## Tests
- `node --check` clean on the r69 driver and analyzer at creation,
  and on the edited capable-bot file before its proof run.
- Capable-bot proof: pre-change 39 passed / 1 failed (section 7
  player-first deed assertion, uses all `v:hannah_kim`); post-change
  (seed 10) **40 passed, 0 failed** — full file, all sections.
- R69 analyzer proof-by-use: it reproduces the r68 analyzer's wsplit
  shape on the fresh band (totals cross-foot: knower-days 1,169 =
  real 1,021 + both 147 + weaponless 1) and its gossip counts match
  the transcripts by hand-count (picks 1 total, all on 85034 d90).
- Gossip analyzer (r67, reused unchanged): 0 fallback pairs across
  8 transcripts; 1 NEAR pair (Felipe map-template tail, distinct
  places — template echo, not content repeat). It still flags
  exactly the r66 Henrique pair when run on r66's transcripts (r67's
  validation, not re-run here — the analyzer is byte-unchanged).
- `node scripts/check.js --quick
  --cacheDirectory=/tmp/jest-cache-playtest`: **284 passed, 6 failed
  in 565s** (log at evidence/2026-11-01/journey-scale-r69/checkquick.log).
  The 6 are IDENTICAL to r68's 6 pre-existing assertion failures
  (same names, same fast exits: godpath/test-measurement-proof-update,
  godpath/test-measurement-workflow,
  godpath/test-mobile-combat-cadence,
  godpath/test-occupation-panels,
  godpath/test-phone-frame-proof, and
  test-establishment-r20-fixes-20261020.js with the same racks-full
  "next day voices once more" gate assertion). The 7th failure from
  r68 — capable-bot section 7 — is GONE: capable-bot passes in-suite
  this run (97s, under the 120s cap), which is this run's Q2 fix
  doing its job. r68's 3 timeouts all passed too (trust-observer-neutrality
  51s, table-endings 61s, capable-bot 97s — all in the slowest list
  but green). No quick-list test imports this run's new scripts, and
  this run's change set is one test-file line + drivers/analyzers +
  evidence with ZERO src/js, so it cannot have caused any of the 6.
- Suite side effect, checked not assumed: `git status` after the
  suite run shows only this run's evidence paths untracked (run note
  + r69 dir) plus the intended capable-bot modification — no stray
  modifications, nothing to discard.

## Landing (filled at closeout)
Master at worktree creation: 9b310a82c. At closeout master had
moved to 33d1a2089 (1 commit: Loop B 2330Z round evidence — ZERO
src/js + src/data in the range, verified by diff). The branch was
rebased cleanly onto 33d1a2089 (2/2 picks; the documented
stop-at-pick quirk struck at the 2nd pick — pick in both done and
todo lists, worktree clean, pick unapplied — and recovered with
`git rebase --continue`, which sailed through). Proofs were re-run
after the rebase as the body requires: node --check clean on driver
+ analyzer + capable-bot file, capable-bot 40 passed / 0 failed,
r69 analyzer totals byte-identical on all four seeds, gossip
analyzer TOTAL unchanged (1 NEAR template pair, 0 fallback pairs).
NO quad re-run after the rebase: the rebase range holds zero game
code, so the measured quad stands unchanged on the new base.
Merged locally via `git merge --ff-only journey-scale` → master
(verified: master tip equals the branch tip after merge), pending
ship (no bump, no push, no live verify — ship loop owns those).
Branch commits: 56cc7e162 (prereg + instruments), 104035376
(quad + analyses + run note + capable-bot re-seed), plus this
landing section as the final branch commit, merged by a single
fast-forward below.
Worktree released + branch deleted at closeout; final main-tree
status clean. Rotation file written 3→0 at run start and verified
by reading it back. Playtest lock deleted at closeout. Heartbeat
loop stopped at closeout.
