# journey-scale r48 — THE DIVERGENCE, PROVEN (2026-10-28, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261028T1103Z. Rotation read 3 → leg 3 SCALE
(days 80–140 + tail); write 3→0 on completion.
**Base:** master@5ddd06a84 at worktree creation (r47 base was a2a2a20f3).
**Pre-register:** `evidence/2026-10-28/journey-scale-r48-prereg.md` (written before
any sim; no src/js change planned — measurement + instrument first, r43–r47
discipline). Zero src/js changed in this run's landed commit. Zero game
behavior changed by this run.
**Driver:** `scripts/journey-scale-r48-20261028.js` (r47 driver, labels/EVIDIR
only — verified: every changed line contains only r47/r48, date, EVIDIR or
mode tokens) plus `scripts/journey-scale-r48-compare.js` (parity compare
repointed at the r47 reference, evidence/2026-10-28/journey-scale-r47).
**Ablation driver (proof, not a game change):** `scripts/journey-scale-r48abl-20261028.js`
(r48 driver, EVIDIR only) run against a temporarily neutered `tbWorldHpFor`
in the worktree; `src/js/game.js` restored byte-clean afterwards
(`git diff --stat -- src/js/` empty, verified). Ablation evidence:
`evidence/2026-10-28/journey-scale-r48abl/` (seed 85001 only).

## Infrastructure (read first)
- No lock at run start; lock created (2026-10-28T11:03:58Z), main tree clean,
  disk 19%, reap: 7/16 active, 3 LOUD dirty trees left untouched
  (sim-partyfinish-a, journey2-social, sim-homebirth-b).
- Registration took ~3 minutes: `git worktree add`'s internal reset ran at
  high CPU for ~2 minutes before completing — slow, not hung; killing it
  would have orphaned the tree. Standing heartbeat loop verified alive AND
  fresh in the registry (first beat 11:07:56Z, loop pid 3154, 9-min
  interval) — checked, not assumed, per the r53 lesson.
- Rotation discrepancy, recorded not resolved (fifth sighting): r47's
  landing note claims it wrote 3→0, yet this run reads 3 — same as r45/r46/r47
  recorded. The file, not the prior run's claim, is the authority; this run
  plays the file as read and writes 3→0 again.
- Base drift since r47 (a2a2a20f3..5ddd06a84, 56 commits, 9 src commits):
  tackle-map beyond-edge generation + building tile first slice; calmbeast
  Calm tap target scan; establishment r51 party self-invite guard;
  eggomen finale-omen regional gate (wave 5 + regional, was national);
  landing r64 case-framing line; barwhy why-visible; caughtlift trust
  booking; divedeep day-roll predictor; w4tbkill phase B world-HP in TB
  fights. None touches table gating, trust math, or hierarchy directly.

## Verdicts (binding — none re-scored)
- **SCALE-PARITY-R48: DIVERGED on 85001, FULL PARITY on 85003 — and the
  85001 divergence is PROVEN, not just pinned.**
  - 85003: every compared file IDENTICAL to r47 after stripping
    (census scalars, trust JSON deep-compare, capture, beats, moments,
    want, gov, trust, trustevents, trustset, hungerwatch, wantwatch,
    betray, transcripts d90 + d120). Day 181, 7/7 alive, pantry 46,089,
    rank global, national 142, global 143, lesser seat, arc 4, maxWave 3,
    pilgrimages 8, firstCourt 141, pool 32,822 — all unchanged. The
    finale-omen regional gate voices NOTHING new here (it needs wave 5;
    this seed has w5 0), the self-invite guard fires no differently
    (betray files identical), and beyond-edge generation moves nothing
    on this trajectory.
  - 85001: diverged. Census: day 117→111, pop 6/6→0/0, pantry 0→0,
    leaguePool 0→965, covenant end trusts 37/32/32→24/19/14, everything
    else (rank regional, national 99, global 104, lesser seat, arc 4,
    maxWave 4, pilgrimages 5, firstCourt 98) unchanged. Beats, moments,
    want, betray, transcript d90 IDENTICAL; capture, gov, trust,
    trustevents, trustset, hungerwatch, wantwatch differ from day 106–107
    onward.
  - **The pin:** the first capture difference is at capture line 10885,
    day 106 dusk, in the Reunion TB fight ("You're on your own" / RERUN
    overtime). r48 inserts one extra telegraph line before the
    crowd-shaped line — "Another face surfaces — someone you brought,
    or someone who brought you. 'You didn't think we'd come alone?' The
    dead gather. (Allied monsters +4 damage, 2 turns.)" — and the fight's
    numbers shift by one (Armor absorbs 46→45, Your Move hits 49→48).
    Everything before that line is identical; the first hungerwatch
    difference is the next day (d107 pantry 5,400→3,920); the first
    trustset behavior difference is the d107 leader-death crisis
    (r47: d108, r48: d107). The Reunion is wave 4 (monsters.json), so
    it is inside w4tbkill phase B's wave-4+ gate — the only TB-fight
    change in the drift that can touch this fight.
  - **The proof (ablation):** with `tbWorldHpFor` forced to return null
    and nothing else changed, seed 85001 re-runs to EXACTLY r47: day 117,
    pop 6/6, pantry 0, arena bearer deaths on the r47 days
    (23/65/84/100/101/106/107/108/109/109/110/110/110), Sanne's death
    back to "a wound that wouldn't close", and the capture
    byte-identical to r47's (12,043 lines, zero differing lines). The
    divergence is therefore the world-HP rule itself, not a cascade
    coincidence: a wave-4 world monster entering its TB fight at world
    HP instead of a fresh roll changes that fight's rolls, and the
    shifted RNG stream moves everything after it by about a day.
  - Per the prereg, the remaining r43 seeds (85002, 85004) are SKIPPED:
    one seed in full parity and one seed with a proven mechanism already
    answer the question. r48 IS the new scale reference on this base
    for 85001's trajectory; 85003's reference is unchanged (identical).
- **ARENA-CHAIN WATCH: ANSWERED — same count, worse tail.**
  - 85001: 13 bearer arena deaths on BOTH bases — the count does not
    move — but the tail does. r47: ...grace d110, wanjiru d110, app
    d110, then the village lives on with 6 people to a day-117 hunger
    scattering. r48: ...grace d110, app d111, wanjiru d111, then "No one
    is left to pick up the Codex. The village dies out — quietly, the
    way villages do." The one-day shift from the d106 fight is enough
    to exhaust the roster: the chain that bent in r47 breaks the village
    in r48. This is a cascade consequence of a real mechanism change
    (world HP), not a new arena mechanism — and it is the sharpest
    evidence yet that the arena chain's tail is fragile to single-day
    shifts. Sanne's death cause flips with the same shift (r47: "a wound
    that wouldn't close" d107; r48: "monster" d107).
  - 85003: 6 bearer arena deaths, identical days and bearers to r47
    (d36, d59, d93, d109, d164 Raj, d179 Thabo); the village survives
    all of them to day 181, 7/7 alive. No chain effect on this seed.
- **TABLE-APPROACH SENSE: ANSWERED — the wait is still voiced, and priced.**
  - 85001: lesser seat, arc 4, wait=true, announced=true through the
    final day (wantwatch d111 detail w1 17 / w2 9 / w3 5 / w4 3 / w5 0,
    contests 10, crises 4, rank regional, stage 3, foodDeeds true) —
    identical to r47 until the run ends six days earlier. The village
    dies waiting, with the seat named and priced, not silently stalled.
  - 85003: lesser seat, arc 4, wait=true, announced=true; want lines
    IDENTICAL to r47, including "The table is being set — a lesser seat,
    priced for what you built. They are watching to see who comes to
    it." and the fireside gossip "The table's set. The ring of pale
    light — it's just sitting there. Waiting on them." No seat-taker
    choice is exercised in-window on either seed: neither seed sits,
    both wait at the lesser seat. The full seat is still unreached on
    this band (w5 0 on both seeds).
- **PEOPLE-SENSE: GO (read in full, not assumed from byte-identity).**
  - 85001 day-90 talk, read whole: Daniyar the paramedic, gentle,
    trust 25, want curious (stage 1). "Did you sleep? I kept hearing
    things out past the treeline." → yes-answer engages ("So it's not
    just me. Good. That's... good to know. Bad, but good.") → goon draws
    out shift-sleeping detail + Almaty origin ("My body learned it
    before my head agreed. Almaty, Kazakhstan never taught me that. The
    treeline did.") → leave closes cleanly ("Thanks for listening. I
    mean that."). An NPC with a real worry, an answer that engages it,
    an ending that resolves. No fabricated shared history, no filler loop.
    (Byte-identical to r47's transcript — and read anyway, per prereg.)

## The leg, in plain words
- **85001 — the village that died out in the arena, six days sooner.**
  Same lesser seat, same arc 4 as r47 — but the story ends at day 111,
  not day 117, and it ends differently. A wave-4 monster, the Reunion,
  walks into its fight already hurt from the world instead of fresh,
  the fight rolls one notch differently, and from there every death
  lands about a day earlier. Thirteen bearers still fall in the arena,
  the same thirteen — but this time the last of them, Wanjiru, falls
  with nobody left behind her to pick up the Codex. In r47 the village
  survived that same cluster and then starved; here it simply runs out
  of people. The hunger scattering is gone because the people are gone
  first.
- **85003 — the village that climbed to global and still waits, unchanged.**
  Byte for byte the same story as r47: seven of seven alive at day 181,
  a pantry of 46,089 kcal, eight pilgrimages, first court day 141,
  national day 142, global day 143, lesser seat waiting, arc 4. The
  base moved under it and nothing in this village noticed.
- **What did NOT change:** the leg's seat outcome. Both seeds still end
  at the lesser seat, arc 4. The full seat is still unreached on this
  band — and the binding constraints are unchanged in kind: the arena
  chain's fragile tail on 85001 (now proven mechanism-driven) and the
  wave bars themselves (85003: w4 0, w5 0).

## Telemetry deviation check (step 14 — NOT rolled, eighth confirmation)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current 'evidence/2026-10-28/journey-scale-r48/journey-scale-r48-trust-*.json'
--metrics markerCounts.firstCourt,markerCounts.watchers,tableTele,fightsTotal,fightsByWave.4,maxGameDay`
→ 5 LOUD lines, all "disappeared: baseline N → current 0 (n=2 files)" — the
same vacuous shape mismatch as r42–r47 (the journey trust JSONs do not
carry those fields at all; tableTele, the sixth metric, stayed quiet in
all eight runs). Verdict: NOT a real deviation. NOT rolled. Eighth
confirmation: the telemetry step for journey runs needs an owner to either
seed a journey-shaped baseline deliberately or drop the step for journey
runs and say so plainly. Rolling it would launder a shape mismatch into a
number.

## Tests
- `node --check` clean on all three new scripts (r48 driver + r48 compare
  + r48abl driver).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  **282 passed, 8 failed in 1154s** (290 scripts; r47 was 279/8 in 847s
  over 287 — the +3 scripts are base additions since r47, not this run's
  files: the r48 evidence dir holds only seeds 85001/85003, so check.js
  did not execute the journey drivers). Classification, done rather than
  assumed (each suspect re-run alone with `--only` after the full run):
  - 6 of the 8 fail identically alone and are the r47 landing set minus
    hide-discovery: the two measurement-* scripts (proof freshness /
    collector-contract coverage), mobile-combat-cadence,
    occupation-panels, phone-frame-proof (proof-hash freshness),
    establishment-r20 (racks-full voice gate). This run changed zero
    src/js, zero test files, and zero data files — all pre-existing.
  - hide-discovery, a full-run failure in r47, PASSES in this full run
    and alone (1 passed, 0 failed) — resolved on this base, not by
    this run (this run touched no assets or code it covers).
  - foodpower-20261014 (ontology validator) fails in the full run but
    PASSES alone (1 passed, 0 failed in 4s) — a full-run-only artifact,
    not a regression from this run.
  - test-sw-audio-cache-20261012 fails alone AND in the full run, but
    with `EPERM: operation not permitted, copyfile '.../sw.js' ->
    '/tmp/oversight-offline-*/sw.js'` — the container EPERM flap (see
    Infrastructure addendum), not a code failure; its offline-JSON PASS
    lines print before the copyfile kill. In r47 this same test passed
    alone; the flap flips it run to run.
  - Net: zero regressions from this run. Check-run byproduct:
    `docs/ONTOLOGY.md` was regenerated by the suite (see Infrastructure
    addendum for its revert and the EPERM flap that complicated it).

## Metric review
- SCALE-PARITY-R48 did its job in the strongest form yet: the prereg's
  stripping rules kept the comparison honest, the first-divergence pin
  (day-106 Reunion fight, one extra telegraph line) separated mechanism
  from cascade — and the ablation closed it: disabling one function
  restores r47 byte-for-byte. A parity instrument that can be ablated
  to proof is worth more than one that can only point.
- ARENA-CHAIN's verdict rule held: names/days, not vibes, decided it —
  13 vs 13 with a flipped tail is a different verdict than 13 vs 9, and
  the note says so instead of calling it "more arena deaths".
- TABLE-APPROACH's verdict rule held: want lines quoted, not summarized
  from scalars — the lesser-seat wait is voiced identically on the
  parity seed and through the final day on the diverged seed.
- The telemetry step is now eight runs deep in the same shape mismatch.
  It is no longer informative to re-report it as a finding; it is a
  standing process debt, owned by whoever owns telemetry baselines.
- Compare-instrument artifact, recorded for the next run: trustset stack
  traces carry source line numbers (titans.js 288→291 from the eggomen
  gate change), so the compare flags same-mechanism lines as diffs.
  The r48 verdict does not depend on those lines — the behavioral pin
  is the capture fight line and the ablation — but a future compare
  should strip `file:line` from stacks or the artifact will cry wolf
  on every base with a line shift.

## Infrastructure addendum — EPERM flap at closeout (read before landing)
- After the check run, `docs/ONTOLOGY.md` showed as modified (the suite's
  regeneration byproduct, same class as r46's). The revert
  (`git checkout -- docs/ONTOLOGY.md`) failed with the container EPERM
  flap: `unable to write file docs/ONTOLOGY.md` + `index.lock write
  error: Operation not permitted` — 9 consecutive attempts over ~10
  minutes, then 12 more `cp` attempts from the pristine main-tree copy,
  then `git checkout-index -f` — all EPERM. The flap spread from the
  worktree `.git` dir to worktree file writes generally (a probe
  `os.open`+write in the worktree root also EPERMs), while registry
  heartbeats kept landing and the main tree stayed clean.
- SELF-INFLICTED, RECOVERABLE: during the flap, a `git show
  HEAD:docs/ONTOLOGY.md > docs/ONTOLOGY.md` redirect truncated the
  worktree copy to 0 bytes (the shell truncates before git writes, and
  the write then EPERMs). NOTHING IS LOST: the file is tracked, the
  main-tree copy is pristine (310,939 bytes, 2026-10-28 05:24), and the
  worktree index still points at the HEAD blob. Recovery is a single
  copy once writes clear:
  `cp ~/workspace/the-scattering/docs/ONTOLOGY.md docs/ONTOLOGY.md`
  then verify `git status --short docs/ONTOLOGY.md` is empty. DO NOT
  commit, merge, or release until that status line is empty — a commit
  with the truncated file would corrupt a tracked doc, and a
  safe-commit needs the same `.git` writes the flap is blocking.
- If the flap has not cleared by landing time, the branch, evidence,
  and drivers stay in the worktree (registered, heartbeated) and this
  run reports LOUDLY with the recovery command above — never manual
  ref surgery, never a commit through the flap.
- RESOLVED 11:49Z without a data write: `cp` to /tmp also EPERMs by
  then, but directory operations do NOT flap — `mv` of the 0-byte
  tmp file succeeded, and `rm` + `ln` of the pristine main-tree copy
  restored the worktree file (same inode 2640892, 310,939 bytes,
  `git hash-object` == `git rev-parse HEAD:docs/ONTOLOGY.md` =
  8cafd691ac714ee81a28935e6a301115780de54f). The worktree copy now
  shares an inode with the main-tree copy; nothing in this run
  modifies ONTOLOGY.md afterwards, and worktree removal at closeout
  drops the extra name with the main-tree copy untouched. Lesson for
  the next flap: when write(2) EPERMs, `rm`+`ln` (or `mv`) from a
  known-good copy restores a tracked file without any data write —
  and `git status` itself degrades under the flap (its index-refresh
  lock write fails, so it can print nothing at all — an empty status
  during a flap proves nothing; hash-object vs HEAD blob is the check).
- Same flap class as Lane B social r63 today (its worktree ONTOLOGY.md
  was also truncated to 0 bytes by EPERM during check-quick) — this is
  now a twice-in-one-day pattern, not a one-off: check-quick's
  ONTOLOGY regeneration + a write flap = a truncated tracked doc.
  Whoever owns the flap should also consider why check-quick rewrites
  ONTOLOGY.md at all on a measurement-only run.

## LANDING STATUS — BLOCKED, NOT LANDED (EPERM flap, 12:05Z)
- **NOT merged, NOT committed, rotation NOT advanced (still 3), lock
  deleted, heartbeat loop stopped at closeout.** The substantive work
  is complete and the branch is fully prepared; only the landing is
  blocked. Main tree verified clean; branch `journey-scale` still at
  base 5ddd06a84 with all r48 work uncommitted in the worktree.
- **Base moved during this run:** master advanced 5ddd06a84 →
  a55b293ca (sim-fullseat-stage-a: TABLE.md full-seat stage >= 3 → >= 2
  correction, docs only, zero src/js) while this run was blocked. The
  recovery must therefore REBASE `journey-scale` onto the new master
  before merging (per the loop's step 8), then verify the commit
  contents with `git show --stat` — the branch carries zero src/js,
  so no behavior re-proof is needed, only the content check.
- **Recovery (for the next run or a successor — do this first, before
  playing anything):** when shell writes clear (probe: `python3 -c
  "open('/tmp/probe.tmp','w').write('x')"` must succeed),
  1. `cd ~/workspace/worktrees/journey-scale`
  2. Verify ONTOLOGY.md: `git hash-object docs/ONTOLOGY.md` must equal
     `git rev-parse HEAD:docs/ONTOLOGY.md`
     (8cafd691ac714ee81a28935e6a301115780de54f); if it does not,
     restore it with `rm docs/ONTOLOGY.md && ln
     ~/workspace/the-scattering/docs/ONTOLOGY.md docs/ONTOLOGY.md`
     (the rm+ln route bypasses the write flap) and re-verify.
  3. `bash scripts/safe-commit.sh "journey scale r48: parity vs r47 +
     w4tbkill ablation proof (measurement only, zero src/js)" --
     evidence/2026-10-28/journey-scale-r48-prereg.md
     evidence/2026-10-28/journey-scale-r48.md
     scripts/journey-scale-r48-20261028.js
     scripts/journey-scale-r48-compare.js
     scripts/journey-scale-r48abl-20261028.js
     evidence/2026-10-28/journey-scale-r48/*
     evidence/2026-10-28/journey-scale-r48abl/*`
     (safe-commit.sh does NOT accept directory paths — the globs
     above must expand to files; verify with `git show --stat HEAD`.)
  4. Back in the main tree (read-only for merge):
     `git merge --ff-only journey-scale`, then
     `bash scripts/worktree-release.sh journey-scale merged`,
     `git worktree remove --force ~/workspace/worktrees/journey-scale
     && git branch -d journey-scale`, then
     `bash scripts/worktree-reap.sh`, verify main tree clean.
  5. Write rotation 3→0 to
     `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-rotation-a.txt`.
     No version bump, no push
     — the batch ship loop owns bumps, pushes, and live verification.
     Report "merged locally, pending ship" when done.
- **Why the next run will hit this first:** the `journey-scale` slug
  is still registered and the tree is dirty (uncommitted r48 work), so
  the reaper will not touch it and a fresh `worktree-register.sh
  journey-scale` will refuse the duplicate slug. That refusal is the
  tripwire — read this note and run the recovery above instead of
  registering a new slug or deleting the tree. Deleting the tree
  before committing would destroy the uncommitted r48 evidence.
- **What is NOT blocked:** every finding in this note stands on
  evidence already written in the worktree (r48 + r48abl evidence dirs,
  prereg, drivers, compare script). Nothing in the verdicts depends
  on the commit landing.
