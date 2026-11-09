# journey-deepening r121 — adoption of the timed-out r120 run (Lane A)

- Run: `laneA-20261109T0245CST`, leg 2 deepening (days 40–80). This run did NOT
  play a fresh leg: it adopted the held r120 deepening work, per Steve's
  INSPECT HELD WORK commitment (2026-10-27). The r120 run (scheduled Sun
  2026-11-08 17:45 CST, lock `2026-11-09T00:27:22Z`) completed its full panel,
  fix, proof tests and run note, then timed out before committing or landing.
  Its lock was recovered by the r112 scale closeout (~04:20Z), which left the
  work untouched; the worktree `journey-deepening` sat dirty with heartbeat
  2026-11-09T02:14:16Z (7h stale at adoption). No lock file existed at this
  run's start; this run created its own lock `2026-11-09T09:07:13Z`.
- Rotation: read `2`, will write `3` after landing (verified read-back).
  The r120 note's claim of having written `3` did not survive: the file read
  `2` at this run's start (last write 08:56:59Z by the r116 establishment
  landing, 1→2). The r120 advance is treated as void because the run never
  landed; this adoption is what earns the 2→3 advance.
- Held work inspected at adoption (worktree dirty state, all matching the
  r120 run note's description): M `src/js/conversation.js` (secret-response
  fix, +100/-3), M driver + instruments test, ?? secret-response proof test
  (287 lines), ?? run note `evidence/2026-11-08/journey-deepening-r120.md`.
  Branch held 2 commits (`a3da219b2` prereg+driver+analyzer, `879dc1105`
  Amendment 1) on base `f6e09355b` (r115 establishment adoption).

## Adoption verification (all on the held tree, before commit)

- Proof tests re-run GREEN as found: secret-response 35/35, instruments 28/28.
- Commit `e58f5878f` (safe-commit.sh, in-worktree copy): fix + driver +
  instruments + proof test + r120 run note. Safe-commit index clobber struck
  (all 5 files D/MM + ??); repaired via hash-object == HEAD blob check (5/5 OK)
  + `git ls-tree HEAD | git update-index --add --index-info`; `git status`
  empty + `git diff HEAD` empty after.
- Rebase onto explicit master SHA `525046c1c` (re-read in the main tree
  immediately before; master unchanged): 3/3 clean, NO conflicts — the r160
  no-words dedupe fix (also `conversation.js`, landed via 514e4fa6e) and the
  r120 secret fix occupy different regions. Branch tip `b98ac0730`.
- Post-rebase: `git diff master -- src/js/conversation.js` shows the secret
  hunks (24 'secret' mentions); the r160 dedupe code is intact in the rebased
  tree (lines ~2798–2938). Proof tests re-run on the rebased tree: 35/35 +
  28/28 GREEN.

## Gate

- First gate on the rebased tree (`--quick`, 425s): **293 passed, 7 failed**.
  - measurement-proof pair (2): `godpath/test-measurement-proof-update.js`,
    `godpath/test-measurement-workflow.js` — EXPECTED, attributable to the
    fix in kind only: `conversation.js` is a manifest input. The r156
    closeout already OWES a measurement-proof refresh after its own
    `conversation.js` landing; this landing extends that debt, it does not
    create it.
  - Standing (3): `godpath/test-mobile-combat-cadence.js`,
    `godpath/test-occupation-panels.js`, `godpath/test-phone-frame-proof.js`
    — all in the r156 standing list; unchanged in kind.
  - `test-establishment-r20-fixes-20261020.js` (racks-full voice gate daily
    reset) — standing per the r156 adjudication.
  - **`test-rumor-flow.js` — ATTRIBUTABLE, FIXED IN THIS RUN (see below).**
    It was the only failure not in the r156 set (the capable-bot load-timeout
    flake from r156 did not fire this time). Base comparison proved it:
    18/18 on master `conversation.js`, FAIL on the fixed tree.
- The rumor failure, root-caused (not waved): the rumor-offering villager
  (`gen_14ctwov`, seed 0xC10C) opens with a secret at trust 60; the test
  walker only follows `dlg:subject` / `gq:` / `react:` / `goon`, so it broke
  off before reaching `ask:spread_rumor`. The GAME is correct — a real player
  answers the confession and the menu returns to normal (probe with a
  secret-aware walker: rumor offered after 1 secret answered). The walker
  was taught to answer a secret first (`secret:promise`), like a player —
  commit `b8d75fa0f`. The updated walker passes 18/18 on the fixed tree AND
  on base (no secret menu on base, walker identical). This is a test update
  because the design changed on purpose (secret branch owns the menu while a
  confession hangs), per the green-list rule.
- Final gate on the committed tree (fix + walker, 471s): **294 passed,
  6 failed** — exactly the r116 count. The 6 are the pre-existing set only
  (measurement-proof pair, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20). Rumor-flow is green. No new
  attributable failure. Gate logs: `/tmp/r121-gate.log` (first, 293/7),
  `/tmp/r121-gate2.log` (final, 294/6).

## LOUD — infrastructure (standing, unresolved, ship loop / main session owns)

- `git pull --ff-only` FAILED again: local master ahead 202 / behind 156 vs
  origin/master (origin tip `a628aeaf3`, PR #121 OVE-161). Split at
  `d229b58f5` (Nov 8 11:28Z batch ship). Per repo push discipline: NO
  reconciliation (no merge of origin/master, no rebase, no push). All work is
  local-only: worktree branch → local master `--ff-only`. Steve's
  reconciliation direction still awaited (asked Nov 8 ~15:25 CST, do NOT
  re-ping). This run's base lacks the 156 origin commits; the fix touches
  `conversation.js` while the origin work is Cursor OVE/duty/census, so
  overlap risk is low (and the rebase against local master was clean).
- Lane B is live concurrently (`journey2-endgame` registered 08:56Z, same
  master base) — separate lock/rotation/worktree; no interference.

## What lands (r120's verdicts, adopted as-is — no re-judgment)

- Q1 SECRET: FIX LANDED AND PROVEN IN THE WILD. Before-panel 0 openers in 8
  seeds; after-panel 4/4 confessions answered (Yara 96803, Ella 96806, Joel
  96801, Luke 96805 — the last two answered on turn 2 behind a pending
  betrayal invitation, which is human, not a defect). Full record in
  `evidence/2026-11-08/journey-deepening-r120.md`.
- Q2 LADDER: OPENS + MINTS + HOLDS, first Village stage day 14 on all 8 seeds.
- Carried watches (not re-judged): TRUST-PAID-TO-STRANGERS fired again in both
  panels (same deterministic seed 96807 day 9 +9); panel verdicts
  EXPLAINED 7/8 + 1 NEEDS-POLITY-CHECK (96801 seasoned link, standing 0 —
  leg 4 / main session owns standing calibration).
- Reachable / fun / winnable (leg 2): reachable — the confession now fires and
  answers in the wild; fun — the promise reply lands, the literacy offer
  plants a future (thin post-secret follow-up is the next feel gap, not this
  fix); winnable — funnel unchanged 6/8 → 7/8, first-four 4/4 both panels.
  No win price or deed gate touched.

## Metric review (§14)

- The r120 prereg metrics bound THAT run; this adoption adds no new metric
  and re-scores nothing. One instrument gap carried from r120 (recorded, not
  fixed here — a fix would need its own prereg): the analyzer's per-sitting
  UNANSWERED tag checks only the FIRST menu, so confessions answered on turn 2
  behind a pending invitation read as unanswered. The transcripts are the
  evidence; the tag is blunt. A future run that re-uses the r120 analyzer
  should teach it turn-2 answers before judging.
- The r120 run note's "metric review" section does not exist as a headed
  section; its Q1/Q2 verdicts and the analyzer-gap paragraph above serve as
  this run's metric review. No metric proved wrong; the secret-opener count
  (0→4) behaved as pre-registered.

## Landing

- Merge: ff-only onto master SHA re-verified immediately before merge (see
  closeout commit message for the SHA).
- Worktree release: `worktree-release.sh journey-deepening merged`, then
  `git worktree remove --force` + `git branch -d journey-deepening`.
- Rotation 2→3 (verified read-back). Telemetry check for deepening (baseline
  `hidden_files/telemetry-baselines/deepening.json` exists).
- Lock deletion: re-read at delete time, run_id must match
  `2026-11-09T09:07:13Z`.
