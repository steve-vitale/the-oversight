# sim-companionguard-b — PREREG (binding)

Run: fleshout-loop-b-20261117T0030Z (Loop B), axis winnability chain, arm
sim-companionguard-b — BUILD: the companion call clobbers a live
expedition (findings backlog #2462). Branch `sim-companionguard-b`
(worktree `~/workspace/worktrees/sim-companionguard-b`). Base: master
`302640180cbbac8300f31f5d4fa8f5431bf7a437` at arm start (this worktree's
HEAD; it carries the sim-medicduty-b instrument commits on top of
master — the arm builds on that instrument, it does not re-measure
it). Binding prereg: THIS file — frozen before any judged sim. The
guard, instrument (driver, analyzer, proof test) and judged sims are
built AFTER this commit; no judged numbers exist yet.

## The question, in plain words

When a villager launches a party, the leader's call drags a companion
along — but if that companion is already out on an expedition of their
own, the companion call silently erases their trip: the legs they
walked and the food they found vanish, and no return ever fires. On
band 102801–102808 that happened 12 times. The fix: a companion call
skips a villager who is already out — they keep their trip, and the
party goes with whoever is available.

## Prior art (read first)

- `evidence/2026-11-16/sim-medicduty-b.md` §Overwritten trips + §Pool —
  the finding this arm builds: 12 landed calls replaced a live record
  (2 distinguishable orphans: Tanya day 56, 1 leg, 806 kcal of finds
  lost; Norman day 66, 1 leg, 873 kcal lost; 10 same-part replacements
  where the companion call lands in the same part the villager launched
  their own trip, so the two launches share a sinceDay/sincePart key and
  the single return is attributed to the first launch).
- `evidence/2026-11-16/sim-medicduty-b-prereg.md` + driver
  (`scripts/medicduty-driver-20261116.js`), analyzer
  (`scripts/analyze-medicduty-b.js`), proof
  (`scripts/test-medicduty-b.js`) — the instrument this arm EXTENDS
  (reuse, don't rebuild). The overwrite taxonomy (overwrote capture,
  overwritten trip status) is taken verbatim from there.
- `docs/CANON.md` (read first). CANON GAP: no canon doc covers
  expedition departure guards or the companion-launch rule (recorded,
  not invented); `docs/PARTY.md` covers party dynamics only.
- Findings backlog line 2462 (marked `claimed` for this arm).

## Code path read (from the code before this prereg, not assumed)

- `src/js/villager-agency.js` `startExpedition(vid, hx, hy, announce,
  opts)` is the ONLY writer of the live expedition record
  (`st.exped[vid] = {...}`, line ~523; the only `exped[vid] =`
  assignment in `src/js/`). It has no already-out guard: it assigns
  unconditionally, after the medic-duty / gear-up / heal-check / sick /
  range gates.
- The agency tick (`villager-agency.js` ~371) guarantees the DIRECT
  callee is not already out: a villager with a live `a.exped[rid]`
  record takes the `expeditionLeg` / `expeditionReturn` branch and
  `continue`s before any departure logic runs. So a startExpedition
  call for an already-out villager can only arrive as a COMPANION
  call, from a different villager's launch.
- `src/js/win-plan.js` `findCompanion` already excludes on-expedition
  villagers (`a.exped[cid]` → skip), and `launchParty` already
  re-checks the companion after the call (`if (a2 &&
  !a2.exped[cid]) return false;` — a failed companion leaves the
  inviter out solo and advances no stage). The winPlanDepart path is
  already safe; it needs no change.
- The clobbering path is the dawn-brain mirror,
  `src/js/villager-brain.js` `vbrainExecuteDepart`: the companion comes
  from the dawn commit (`c.companion`, picked at dawn), and the mirror
  calls `startExpedition(c.companion, ...)` with NO already-out check
  and NO post-call verification — `launched = [c.companion]` is set
  unconditionally and the companion's plan is advanced to `hunt` even
  when the companion never left (the code's own comment names this
  mirror gap as out of scope for the vetreengage arm; this arm closes
  it for the guard case, see Design decision 2). All 198 landed
  launches on the medicduty band were `vbrain-party_launch`, zero
  `winplan-party_launch` — consistent with the mirror being the live
  path.

## Design decision 1 — the guard (frozen)

In `startExpedition`, env-gated on `COMPANIONGUARD=1` (node sims
only; in the browser `process` is undefined, so the lever is off —
same pattern as `vetreengageOn()` in win-plan.js):

- When a live expedition record already exists for `vid`
  (`st.exped[vid]`), return early BEFORE gear-up / heal-check, so a
  skipped companion burns no gear or care on a trip that never
  launches. Increment the village counter
  `village.companionGuardSkips` (mirrors the `medicDutyBlocked`
  counter) so the instrument can cross-check skips.
- The guard fires for any startExpedition call on an already-out
  villager; by the tick guarantee above that is a companion call in
  practice. It does not distinguish inviter from companion — it does
  not need to, because the inviter is checked not-out upstream
  (tick / mirror `a.exped[vid]` check).
- ON GO the env gate is REMOVED and the guard ships unconditional
  (the guard becomes the behavior, not a lever). On NO-GO the guard
  is reverted fully (net `src/` diff 0), evidence-only.

## Design decision 2 — the mirror's plan record must stay honest (frozen)

In `vbrainExecuteDepart`, after the companion call, verify the
companion's expedition actually started before recording them in
`launched`: `launched` lists only villagers whose expedition record
exists after the call, and the companion's plan (`cplan`) is advanced
to `hunt` only when the companion actually launched. The inviter's
plan still advances to `hunt` with the honest party (possibly solo).
This is part of the guard, not a separate lever: without it every
skipped companion would be recorded in `plan.party` as if they went,
and the party system would believe it has a companion it does not
have. The pre-existing mirror gap for sick/hurt-blocked companions
is closed by the same check (same code path, same lie, same fix);
no other behavior changes.

## Design decision 3 — the unchosen alternative (frozen, not built)

Wait for the companion's return before launching (hold the party
until the companion is back) is NOT built. The coordinator's call
under Steve's "figure it out yourself" grant: skip, don't wait.
Recorded here and in the evidence file's metric review as the
unchosen option, not built.

## Seed-band freshness check (recorded before any judged sim)

- Band: **103021–103028** (8 seeds).
- Scope: every dated prereg under `evidence/` matching
  `evidence/*/sim-*-prereg.md` (945 files), every `*.md` under
  `evidence/`, and the goal files
  `hidden_files/sim-findings.md` + `hidden_files/convergence-tracker.md`.
- Result: **0 hits** for 103021–103028 in all three scopes; no
  `1030xx` band is named in any prereg at all. (The full recursive
  `hidden_files/` grep was abandoned as too slow over the whole tree;
  the two named goal files were checked directly.) Coordinator also
  verified fresh (0 hits in `evidence/*/sim-*-prereg.md`).
- Verdict: band is FRESH.

## Policy, horizon, seeds (frozen)

- Policy: competent verbatim — `scripts/policies/competent.js`,
  sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
  (verified by `sha256sum` on this tree before this prereg; do not
  trust the brief blindly — verified).
- Horizon: 150d death-aware (dead villages stop simulating, +10d tail
  max). Seeds: 103021–103028, 8 seeds, identical seeds both legs.
- Legs: CONTROL (guard off — `COMPANIONGUARD` unset, tree at the
  guard commit) vs ARMED (guard on — `COMPANIONGUARD=1`, same tree).
  Both legs run the same recorder (the medicduty recorder, extended
  with the guard-skip capture); the recorder is the instrument, the
  guard is the lever.
- Balanced panel per `docs/MEASUREMENT.md` §15
  (`scripts/balance-panel.js`): base panel built on the prereg commit
  (no guard code) with `--n 16 --days 150`, lever panel built on the
  guard tip with `COMPANIONGUARD=1`, `compare` run, the compare `.md`
  attached to the evidence file. The panel is the instrument; the
  pre-registered bars below are the judge.

## GO bars (binding — a miss is NO-GO, never re-scored)

1. **Orphan trips 0 on the armed leg.** Unit: landed
   `startExpedition` calls with a non-null `overwrote` capture (a
   live record replaced mid-flight). Armed leg must be 0; the control
   leg's count on identical seeds is reported beside it.
2. **Party launches hold.** Unit: distinct inviter departures — the
   first landed DIRECTED call per (day, part, tx, ty, duration)
   group (the inviter's call; companion calls share the group's
   target). Armed total ≥ control total − 2. Rationale for the unit:
   the guard must not ground parties — a skipped companion is not a
   grounded launch, because the companion is already out on their own
   trip and the inviter still goes. The per-call landed-launch count
   is reported descriptively beside it, with the predicted direction
   recorded here in advance: armed per-call landed ≈ control
   per-call landed − (control overwrites), because each skipped
   companion call writes one fewer record while the companion's own
   trip survives. That predicted drop is the mechanism, not a cost,
   and does not re-score bar 2.
3. **Cost bar.** Starvation deaths (driver `deaths` rows whose
   `cause` or `kind` matches /starv/i) armed ≤ control + 2 AND
   median survival armed ≥ 0.8 × control median survival.
4. **Proof green.** `node scripts/test-companionguard-b.js`:
   static checks + unit tests (already-out villager skipped by a
   companion-style directed call, with their trip record intact
   including the same-part case; not-out villager taken; guard OFF
   overwrites exactly as before) + D1 determinism (recorder ON
   twice, identical full corpus) + D2 neutrality on the instrument
   (recorder ON vs OFF, same guard state, identical daily trajectory
   signatures + wall fields).
5. **Wall numbers both legs.** National by standing (≥200) AND by
   scaleRank, table, wins, wave 4/5 unlocked, median survival,
   deaths, wave-4 kills — reported for control and armed.

## Instrument notes (proof-phase, before any judged sim)

- Landing identity: the recorder must distinguish a GUARD SKIP
  from a landing. A skipped call leaves the OLD expedition record in
  place, so "record exists after the call" is not landing. The
  driver captures the pre-call record OBJECT (reference, not clone)
  and defines landed as: post-call record exists AND is a different
  object than the pre-call record. A guard skip yields
  `guardSkipped=true`, `blockReason='companion-guard'`, `landed=false`.
  The analyzer re-derives this from the raw rows (D3).
- RNG divergence note: the guard returns before startExpedition's
  `R()` draws (dist / direction / duration), so the armed leg's RNG
  stream diverges from the control leg's at the first skip. Control
  vs armed are therefore two draws from nearby distributions, not
  paired trajectories — the bars are read on totals, and the
  balanced panel is the cross-check. This is inherent to measuring a
  game change; it is not an instrument defect.
- The `overwrote` capture is kept verbatim from the medicduty
  recorder (clone before the call); on the armed leg it should be
  non-null only on skipped rows (the record that was KEPT), never on
  landed rows.

## Metric review (placeholder — filled in the evidence file, never a re-score)

- Whether the party-launch unit for bar 2 was the right unit, and
  whether the −2 bar is satisfiable given RNG divergence after the
  first skip.
- Whether "wait for return" (the unchosen alternative) should be
  revisited if skips turn out to cost parties.
- Whether the same-part key collision (10 of 12 on the medicduty
  band) needs a per-call trip id in the instrument, now that the
  guard removes the collision at the source.
