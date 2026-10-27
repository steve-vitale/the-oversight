# journey-scale r45 — THE INSTRUMENT NOW COUNTS EVERY WALK (2026-10-27, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261027T1445Z. Rotation read 3 → leg 3 SCALE
(days 80–140 + tail); write 3→0 on completion.
**Base:** master@60e260dc0 at run start (journey crisis r57).
**Pre-register:** `evidence/2026-10-27/journey-scale-r45-prereg.md` (written before
any sim; no src/js change planned — measurement + instrument first, r43/r44
discipline). Zero src/js changed in this run. Zero game behavior changed.
**Arms (driver-only + analysis-only):**
1. **SCALEGATE-PARITY** — pilot 85001 on the new base (scalegate src/js change
   since r44), r44 driver labels/EVIDIR only.
2. **BETRAY-INSTRUMENT** — new driver `scripts/journey-scale-r45-20261027.js`:
   record EVERY betrayal:accept + armed/ordinary split (r44's open item).
3. **TRUST-HOLD** — analysis-only answer to r44's seasoned-bar question:
   what lifts a covenant to trust 40 and HOLDS it through a leader death?

## Infrastructure (read first — the run survived a restart, twice over)
- No lock at run start; lock created, main tree clean, disk 30%, reap: 13/16
  active, 4 LOUD dirty trees left untouched (sim-finalloss-a,
  sim-raidday100-general-b, sim-fallbackfeared-a, sim-fullseatfixture-a).
- Registration took ~7 min (2.7 GB checkout); the register script's own output
  was silent until the end, but the worktree path + registry entry verified
  before any work. Standing heartbeat loop restarted after a service restart
  killed the first loop (registry heartbeat 14:55:52 → loop re-established,
  fresh at every later check, e.g. 15:16:33). A second service restart killed
  the first pilot sim mid-run (day-90 transcript written, no seed outputs);
  the pilot was re-run cleanly from scratch — no partial evidence was kept or
  blended. Lesson re-confirmed: a sim killed mid-run leaves a transcript
  fragment behind; always re-run from a clean EVIDIR, never resume into one.
- Rotation discrepancy, recorded not resolved: r44's note claims it wrote
  3→0, yet this run read 3. Either a later lane-A run re-set it or r44's
  write did not persist. This run plays the file as read and writes 3→0
  again; the file, not r44's claim, is the authority.
- New standing context noted mid-run (MEMORY.md ruling 6, 2026-10-27): the
  table should NOT be a forgone conclusion — reaching the end should take
  skill most of the time. Context for this run's reachability verdict, not a
  scored item: this run measures, it does not re-tune the table.

## Verdicts (binding — none re-scored)
- **SCALEGATE-PARITY: GO.** Pilot 85001 on the scalegate base is identical to
  r44's 85001: capture 0 diff lines, trust txt 0, trustevents 0, transcripts
  d90 + d120 byte-identical, and every census scalar identical (day 181,
  over false, pop 2/2, pantry 0, global, nationalDay 88, globalDay 89, lesser
  seat, proposedLead 1, proposedPeer 4, pilgrimages 4, arc 4, maxWave 4).
  The earlier "census equal: False" from a naive whole-object compare is
  explained, not a divergence: the trust JSONs embed trustSetLog stacks, and
  the stacks name the driver file (r44 vs r45pilot) — strip the driver path
  and every watch array compares identical. The scalegate change (full-seat
  gate only) moves nothing for a lesser-seat village, as predicted — but now
  that is CHECKED, not assumed. Per the prereg, the full 4-seed batch is
  SKIPPED: four identical seeds would have added nothing.
- **BETRAY-INSTRUMENT: GO.** On seed 85003 the new betray file shows exactly
  2 accepts for Joshua — d90 armed=ordinary, d120 armed=ordinary — where
  r43's file showed 1. The armed split is a true read, not a silent default:
  zero rows read armed=unknown, so the predicate executed and found no armed
  plot on either accept, matching r44's zero-sprung-plots finding. The
  instrument does not move the game: 85003 capture is byte-identical to
  r43's (0 diff lines), transcripts d90/d120 byte-identical, and the 85001
  control run under the new driver is capture-identical to the pilot with
  0 accepts (as in r44). The driver change is: (a) a per-convo accept list
  with armed captured BEFORE the accept pick is played (after convoTurn the
  pending invite is consumed, so post-hoc reads would always say ordinary);
  (b) every accept recorded (daily snapshots stay keyed by first-registered
  subject); (c) transcript fallback of one armed=unknown accept if the
  pick-time capture ever misses — never triggered in this run.
- **TRUST-HOLD: ANSWERED (second branch of the prereg rule: no existing
  lever holds it through the observed burst — plus the smallest named gap).**
  See below.
- **PEOPLE-SENSE: GO.** Two talks read in full this run, both people talking:
  pilot 85001 d90 (Irving, solitude as a scarce resource — "Scarcer than
  food, some days", honest engagement, ending lands "Alright. Back to it.");
  r45 85003 d120 (Joshua, grief for taken kin and dreams of pods, a promise
  to ask the System, a trap-line walk turned back at fresh big tracks —
  "We go back now. Quietly." — closing "Talking helps. Then it hurts. Then
  it helps again. It's a cycle."). The d120 walk reads plainly ordinary,
  which is what the instrument now records. No fabricated shared history, no
  filler loop, no lure disguised as a walk.

## Trust-hold answer (r44's seasoned-bar question, analysis-only)
The numbers, from hierarchy.js + r43's 85003 trust-set log (not from theory):
- A Haven-speaker death shakes EVERY covenant link at once: covenantCrisis
  costs -10 immediately (direct assignment, hierarchy.js:3344), and the
  concede answer pays +8 through _trustGain (hierarchy.js:3382). Net per
  death, even with a perfect answer: **-2**. There is no mourning window on
  the covenant path (unlike primary links: -8 + 7 days gagged) — the +8
  lands at once, which is why r44's "concessions do not hold" is exactly -2
  per death, not zero.
- To survive ONE death AT the bar, a link needs pre-death trust **≥42**
  (42-10+8=40). To survive the observed burst — four Haven-speaker deaths in
  12 days (d167, 170, 176, 179, each shaking all three covenants) — a link
  needs **≥48** at burst start, ignoring rebuild. Ashford peaked at 37: it
  never reached the bar, let alone with buffer. Stonebridge (peak 40) and
  Thornfield (peak 42) only brushed it.
- Rebuild between deaths is ~+1/week per covenantTick (hierarchy.js:3101,
  only while the pool is not live) plus sporadic +1 teaching deeds
  (recordDeed). That is ~1–2/week against deaths arriving every 3–6 days in
  a burst. The arithmetic cannot hold: the burst, not the concede size, is
  the binding constraint.
- The named gap: covenant links have NO repeatable tending verb. tendLink
  (+8/week, 1,500 kcal) is LEAD-road only — it refuses peer links ("There
  is no bond of ours to tend there"). A covenant link's only rebuild is the
  weekly +1 tick and deeds. Candidate directions for a later run (NOT changes
  here, NOT Steve rulings): a covenant tending verb at tendLink's price;
  a bigger leader-death concede; or enabling the existing experimental
  SUCCPOLITY gate (env-gated, default OFF — it reads inherited standing for
  14 days, which MASKS the dip rather than holding trust, and must not be
  sold as a hold). Also worth naming: the burst itself is four Haven-speaker
  deaths in 12 days — why the scale village's speaker dies that often is a
  separate question from the trust math, and the trust math is settled
  regardless of the answer.
- No doc covers covenant tending (CANON.md lists no hierarchy doc; the code
  + r43 evidence are the source). No canon invented.

## The leg, in plain words (seed 85001 pilot + 85003 validation)
- **85001 — the village of two, living on the network.** Ends day 181 with 2
  living people, global rank, a lesser seat waiting, arc 4 — unchanged from
  r43/r44, including the empty home pantry (0) carried by the league pool.
- **85003 — the thin-but-living eight.** Ends day 181 with 8/8 alive,
  regional rank, a lesser seat waiting, arc 4 — unchanged from r43, now with
  its two Joshua walks honestly counted instead of one.
- The other r43 villages (85002's priced-out tragedy, 85004's comfortable
  nine) are carried forward unchanged — the pilot + control prove the base
  move did not touch them, and the prereg forbade burning the batch.

## Reachable / fun / winnable (leg 3 — carried from r44, pilot-confirmed)
- **Reachable:** YES for the approach — the pilot re-proves a lesser seat
  in-window, voiced. The full seat is NOT reached (standing gap now enforced
  by scalegate, unchanged outcome on this band).
- **Fun:** YES — the pilot's and validation's talks are the leg's best
  register, and the r43 tragedies/triumphs stand behind them unchanged.
- **Winnable:** YES for the approach, NOT YET for the full seat — the binding
  constraints are now named precisely: the price itself (85002), seasoned
  trust (85003, Ashford 3 short at peak and 11 short of burst-proof), and
  now the burst arithmetic above, not evaporation bugs.

## Telemetry deviation check (step 14 — NOT rolled, fourth confirmation)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current 'evidence/2026-10-27/journey-scale-r45/journey-scale-r45-trust-*.json'
--metrics markerCounts.firstCourt,markerCounts.watchers,tableTele,fightsTotal,fightsByWave.4,maxGameDay`
→ 5 LOUD lines, all "disappeared: baseline N → current 0 (n=2 files)" — the
same vacuous shape mismatch as r42, r43, and r44 (the journey trust JSONs do
not carry those fields at all; tableTele, the sixth metric, stayed quiet in
all four runs). Verdict: NOT a real deviation. NOT rolled. This is now the
fourth run confirming the gap: the telemetry step for journey runs needs an
owner to either seed a journey-shaped baseline deliberately (contract area)
or drop the step for journey runs and say so plainly. Rolling it would
launder a shape mismatch into a number.

## Tests
- `node --check` clean on both new drivers (r45 driver + r45 pilot driver).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  **270 passed, 17 failed in 3600s** (r44: 278 passed, 9 failed in 722s — the
  slowdown is sibling load: three sibling check.js runs overlapped this one).
  Classification, done rather than assumed:
  - 7 TIMEOUTs (exit null, 120s cap): comfort-arc, solo-campaign-endings,
    trust-observer-neutrality, synergy-stall, capable-bot, table-endings,
    succession-grief. Spot-checked alone: test-synergy-stall runs ~280s to
    completion with no assertion-failure line — it exceeds check.js's 120s
    per-script cap even unloaded, so the TIMEOUT is a cap artifact, not a
    regression.
  - 10 exit-1 failures, all re-run ALONE and failing identically (so not
    concurrency phantoms): hide-discovery (counter butchering), the four
    measurement-* scripts (proof freshness / collector-contract coverage),
    mobile-combat-cadence, occupation-panels, phone-frame-proof (proof-hash
    freshness), parity-20261014 (gear), establishment-r20 (the racks-full
    voice-gate case r44 already named). All are areas the base moved in since
    r44 (scalegate, ship bumps, sibling merges) — and this run changed zero
    src/js, zero test files, and zero data files, and added no file to the
    check list (same 287-script total as r44). Verdict: all 17 pre-existing
    on base or cap artifacts; **zero regressions from this run**.
  - One earlier check attempt died with the service restart's session
    teardown (log held only the header); it was discarded and the run above
    is the one that counts.

## Metric review
- SCALEGATE-PARITY as designed did its job: a src/js change since r44 made
  the pilot a real check instead of a formality, and parity held — the
  pilot-first rule saved a full batch twice over (frozen leg + clean gate).
- The naive whole-object census compare is a footgun worth naming: trust
  JSONs embed driver-path stacks, so "census equal: False" on a whole-object
  compare means nothing until stacks are stripped. Future parity checks
  should compare scalars + stripped watch arrays, as done here.
- BETRAY-INSTRUMENT's fallback (armed=unknown) never fired — good, but it
  means the fallback itself is untested. If a future accept path bypasses
  the turn loop, the first unknown row is the signal to investigate, not to
  re-score as ordinary.

## LANDING STATUS — CORRECTION (the section above was written before the run timed out and is NOT true of the 2026-10-27T1445Z run)
The 1445Z run did NOT merge: it hit the 7200s cron timeout during resolution,
leaving this evidence uncommitted in the journey-scale worktree, rotation
still at 3, and the lock present. The correction and the landing below are
from the follow-on landing pass (run oversight-playtest-loop-20261027T1745Z,
same leg, same rotation read 3), which adopted the stale tree rather than
starting a fresh run: at adoption the journey-scale heartbeat was 47 min
stale, its heartbeat loop was gone, and no playtest lock existed.

## LANDING PASS (2026-10-27T1745Z — adoption + rebase + pilot re-check)
- Worktree branch journey-scale was at a70555396, an ancestor of master, with
  only the r45 evidence/drivers untracked (no committed work of its own), so
  the branch fast-forwarded cleanly to master 61f326408 in the worktree,
  untracked files preserved, backup of the r45 evidence dir taken first to the
  goal hidden_files dir (verified identical before the re-run).
- Base drift between the r45 base and master 61f326408: 17 commits, exactly
  ONE touching src/js — version bump 3cc2c0e63, whose src/js diff is only the
  BUILD_VERSION stamp in build.js (game logic byte-identical). Everything else
  is evidence/scripts.
- Post-rebase pilot re-check: SEEDS=85001 with the r45 driver, re-run into the
  r45 evidence dir (backed up first; deterministic sim, see backup note
  above). Result: byte-identical to the pre-rebase r45 85001 across all 28
  files (diff -r exit 0). The rebase moved nothing in the leg.
- Telemetry re-run (this pass, same command as r45): the same 5 LOUD lines
  (firstCourt, watchers, fightsTotal, fightsByWave.4, maxGameDay all
  "disappeared: baseline N -> current 0"), same verdict as r45 — a shape
  mismatch (journey trust JSONs do not carry those fields), NOT a deviation.
  Baseline NOT rolled, fifth confirmation counting r42–r45.
- node --check clean on both r45 drivers. check --quick (logged run, 522s):
  278 passed, 9 failed, 287 scripts total — the same total and the same
  failure set r45 classified as pre-existing (hide-discovery counter
  butchering; measurement-comparison / proof-update / workflow; mobile-
  combat-cadence; occupation-panels; phone-frame-proof; parity-20261014 gear;
  establishment-r20 racks-full voice gate). This pass changed zero src/js,
  zero test files, and zero data files, and added no file to the check list,
  so the 9 are pre-existing on the base, not regressions from this pass.
  (An earlier tail-only quick run gave the same 278/9 in 583s; the logged
  run above is the one that counts.) Full log: goal hidden_files
  check-quick-scale-r45-landing-20261027.log.
- No src/js changed in either the 1445Z run or this landing pass. No canon
  invented: CANON.md lists no hierarchy/covenant-tending doc, as r45 noted.
- After this pass: commit via safe-commit in the worktree, merge --ff-only in
  the main tree, release + remove the worktree, rotation 3→0, lock deleted.
  Merged locally, pending ship. No version bump, no push — the batch ship loop
  owns bumps, pushes, and live verification. Heartbeat loop stopped after
  release.
