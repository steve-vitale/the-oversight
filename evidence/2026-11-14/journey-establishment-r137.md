# Journey leg ESTABLISHMENT — r137 run note (2026-11-14, Lane A)

## Run
- Run id `playtest-loop-a-20261114T064342Z` (scheduled Sat 2026-11-14
  00:45 CST). Rotation read `1` (establishment); write `1→2` at run
  start (done — file reads 2; deepening next).
- Base: local master `63c051206` (journey-landing r131: HEED fix).
  Pre-flight: main tree clean, disk 39%.
- Pre-flight deviations (LOUD): **reaper skipped** (registry lock
  held by another reaper run, consecutive skips: 2 — no cleanup;
  known lock self-contention, AGENTS.md 2026-11-12, fix owed, not
  this run's). **Registration took ~16 min** (queued behind the
  flesh-out loop's sim-transplant13-a registration; each
  `git reset --hard` ran ~7 min on a loaded box). No flap:
  flap-watch ALL-OK through the window. Heartbeat landed 07:00:16Z;
  heartbeat loop runs from the worktrees dir (10-min cadence, PID
  51667 at run start).

## Leg question (r136's next blank, taken verbatim)

When a fallen tree (or rubble / washed-out gap) blocks the path home,
`travelHome84` tries one hop, fails, and the wedge gives up for the
dawn — Pablo sat 6 dawns at the map edge, Hiroshi 4. The player HAS
the honest verb ("Clear the fallen tree" — cut it, +2 wood). The
wedge needs blockage-clearing (or routing around) on its homeward
path — the same wedge the end-wedge and the travel-out wedge share.

## Diagnosis (established BEFORE the panel — code reading, not panel data)

Two game verbs already exist; the wedge used neither:
- `Game.walkHome(maxSteps)` (game.js:11875) — the compass's way home
  as an action: one tile at a time, longer axis first, then the
  other, then a perpendicular sidestep; stops honestly with
  `blocked` {kind, blockType, x, y} named.
- `Game.clearBlockage(x, y)` (game.js:12290) — clear by work, costs
  a day-part: fallen_tree → cut (+2 wood, 60 kcal); rubble → clear
  (+1–3 stone, 40 kcal); washed_out → bridge if wood ≥ 4, else
  scramble (80 kcal). A creek is NOT clearable by hand.
- No game defect is proven by the reading: the verbs exist and are
  offered. The fix is driver-only.

## The fix (driver-only, no src/js)

`travelHome84` is now walkHome-first with clear-and-retry: call
`Game.walkHome(12)`; if not reached and `blocked.blockType` is
clearable (fallen_tree / rubble / washed_out), call
`Game.clearBlockage(blocked.x, blocked.y)`, record the clear, and
retry `walkHome`; cap 3 clears per call. Creek block → stop
honestly, record `blocked`, no clear attempt. Sidestep success is
already inside walkHome. `clears` + `walks` + `blocked` recorded on
the homeHops recs and endLog. No behavior change on an open path.
- Proof test `scripts/test-journey-establishment-r137-clearhome.js`:
  **37/37 green** (staged Pablo A1–A8: walkHome stops on the tree,
  clear frees it, retry reaches home, ending ready, +2 wood; full
  close B0–B4 incl. trust no-drop; open-path control C1–C2; creek
  D1–D4 incl. clear refusal; rubble/washed-out shapes E0–E5 incl.
  bridge spending 4 wood; source F1–F6 + fail-control F7–F8: the
  r136 driver has no walkHome/clearBlockage; det-gate G3–G5: r137
  driver twice, 5d seed 2801, byte-identical JSON + convo txt).

## Pilot (seed 2801, R137_PILOT_BREAK=1, NOT scored)

Gate PASSED: completes without crash (endDay 43) AND instruments
fire AND the hold produces a broken live run (Vamsi held d10–11,
broke, closed d12 same-dawn) AND no trust drop. Second broken run
(Kulap d32→d32) also closed same-dawn. END BAR 2/2 on the pilot.
Travel branch 0/0 on the pilot (both end sits were already at home
— no walk needed) — the clearing mechanism is carried by the proof
test, as the prereg allowed. Village alive (10/10, wave 4, pantry
66,466). Minor observation (pre-existing driver artifact, not a
gate issue): the daily trace records the same day number twice
when sleep() doesn't advance the day (d10 ×2, d13 ×2) — the r85–
r136 loop shares it; harmless to the bars (opportunities key on
first-seen day).

## Panel verdicts (seeds 2802–2805, fixed driver, 42d horizon)

Analyzer: `scripts/analyze-journey-establishment-r137-20261114.js`.
- **END BAR: GO (9/9 closed within 2 dawns).** 2802: NO-OPPORTUNITY
  (0 broken-live runs). 2803: 3/3 (James d9→d9 PAGED, Nino d14→d14,
  Ethan d24→d24). 2804: 3/3 (Marisol d8→d8, Catalina d22→d22 PAGED,
  Ivy d26→d26). 2805: 3/3 (Boris d20→d22 — end-not-ready on an open
  event d20–21, then closed d22, inside the window; Therese d28→d28
  PAGED, Lucas d37→d37). The r136 NO-GO (9/11, both misses the
  fallen-tree travel gap) is closed: no stranded failure anywhere
  on this panel.
- **TRAVEL BRANCH: NO-OPPORTUNITY (0/0).** 0/40 homeward sits hit a
  clearable blockage or cleared one. The new travelHome84 shape IS
  exercised in the wild — walks recorded with full paths (7-step
  walks from (1,0), 6-step from (2,0), one combat-interrupted walk
  on 2802 d13) — but every path was open, so no clear ever fired.
  Per the prereg, the mechanism is carried by the proof test
  (staged Pablo, 37/37), not claimed as wild. The travel gap as a
  failure mode is gone from the panel; whether a clear fires in the
  wild is a matter of blockage placement on the homeward path, and
  this band's paths were open.
- **THREAD BRANCH (carried watch): 3/3 paged closed; 3/11 end sits
  paged.** The r136 paging fix keeps working in the wild (James,
  Catalina, Therese — three Yara shapes this panel vs one in r136).
- **TRUST GUARD: PASS.** 0 trust drops on any end press across the
  panel (and pilot).
- **JAM BAR (report-only): 0 jam-days** across the panel (r84: ~15
  on seed 994 alone; r85/r136: 0). The poison stays held.
- **VILLAGE BAR: PASS.** 4/4 seeds alive at d40 (9/10/9/11 alive;
  endDay 43 on all; waves 3/4/3/3; pantries 23.9k/49.6k/35.1k/
  4.7k — 2805 is the thin-pantry seed again).
- **WATER INSTRUMENT (report-only): 0 broken-live water runs**
  across the panel — the water end-wedge does NOT become the next
  blank.
- **DETERMINISM:** the proof test's det-gate ran the r137 driver
  twice on 5d seed 2801: byte-identical JSON + convo txt.
- **Q2 CANNED LINES (report-only):** pod-dream=0, recap-stitch=0,
  slope-reading=1, walked-in=0, take-it=0, stew-bowl=0 across the
  panel's 5 convo files (pilot + panel, 10 convos) vs r136's
  0/1/0/0/0/1. Rates down; the recap stitch still appears in
  paraphrase ("Still on that question.", "that's still where we
  are") — the watch needle (' — Still on ') is narrow and misses
  it. No variety fix in this run.
- **Q3 SPOTTER GUARD: foodXp['spotter'] total = 0** (r135/r136: 0).
  The spotter blank stands: a villager can stare at the wild all
  day and learn nothing.

## Village assessment (panel 2802–2805 + pilot 2801, plain words)

Five villages ran the full 42 days; all five survived to day 43
and none lost the village. 49 people alive at the end (9–11 per
village). Wave 4 reached on 2/5 seeds, wave 3 on the other 3 — the
leg's horizon pushes past wave 1 into the wave-3/4 fights, as a
competent player's establishment should. Pantries are fat by day
42 on most seeds (2801: ~66k) but thin on one (2805: ~4.7k — the
same thinnest-seed shape r135/r136 saw). Deaths 175 across the
five (31–46 per village), overwhelmingly fighting (142 villager
combat + 7 combat + 15 expedition + 2 monster) — dying fighting,
not hungry: **zero starvation deaths anywhere**. Two sickness
deaths in 175 (the player Manuel d9 on 2802, one other); one death
by "a wound that wouldn't close"; one by "a stranger" (Tyler, the
second bearer on 2802, d13); one contest, one betrayal, one Gavel.
Favor outings work: 11 broken-live runs seen across pilot + panel,
all 11 closed within 2 dawns (9 panel + 2 pilot). No living
healer at end on any of the five seeds (end-state census) — the
medicine supply context for the holder-less build: 2 sickness
deaths + 1 wound death with no healer alive at the end anywhere.
The binding pressure in this window is still who learns what and
who gets home, not food.

## People check (seed 2803 convos, read in full — PASS)

**Greta (bartender):** opens on an unfinished grief conversation
with Deborah — "we never finished talking about grief" — and notes
the player is "wearing Deborah's shoes now", succession visible in
dialogue. Asks a real question ("What scares you most about what's
happening? The real answer."), remembers the player's origin
(Columbus, Ohio) and mirrors it with her own ("Me? Columbus,
Ohio. I still dream in its weather — rain on a tin roof"). Ends
with a real closer ("Talking helps. Then it hurts. Then it helps
again."). One mechanical beat: the recap stitch in paraphrase
("Still on that question.").
**Mabel (dentist):** opens on the same unfinished grief ("We still
owe grief a proper ending, too"), picks up Deborah's share of the
work ("Someone should, and it might as well be me"), accepts an
invitation with character ("...Fine. This had better be worth
it."), ends naturally. The stage-direction beats ("Something eases
in their shoulders") read slightly mechanical but land as people.
YOU lines truncated mid-sentence are the known driver artifact
(80-char label slice), not a game defect.

## Verdicts
- **Reachable: YES.** The end verb is reachable in the wild (9/9
  within 2 dawns, 3 paged), and the homeward walk now uses the
  game's own compass walk with the honest clear verb staged and
  proven.
- **Fun: YES.** Conversations read like people — grief carries
  across succession, villagers remember what you told them. The
  recurring template lines are the next variety candidates, not
  this run's scope.
- **Winnable: YES for the leg.** All 5 villages survive to day 43
  with wave 4 reached on 2/5. The winnability chain beyond the leg
  (wave-4 kills → veterans → wave 5) is still the open hunt,
  unchanged by this driver-only fix.

## Metric review
- The END BAR is GO as pre-registered (9/9) and stands. The r136
  metric-review proposal (a) — excuse bearer-changed runs — was
  adopted as this run's pre-registered bar; it was never needed on
  this panel (no end-log entry named a previous bearer), but the
  same shape appeared in a NEW place (see Next blank): a LIVE
  (non-broken) run whose bearer changed. The bar's scope (broken-
  live only) is correct for the END BAR; the new blank is a wedge-
  coverage question, not a bar miss.
- The pilot forced no driver fix, so the panel ran on the first
  driver and the pilot seed stays NOT scored per the prereg.
- The travel branch's NO-OPPORTUNITY is honest: 40 homeward sits,
  0 clearable blocks. The proof test carries the mechanism. A
  future panel on a band whose homeward paths actually cross
  blockages would be the wild proof; this run does not claim it.
- Telemetry: the checker's LOUD lines are the known schema mismatch
  (see Telemetry below), not real deviations — the run changed no
  src/js and no game economy, so a guardrail move could not be
  caused by r137's change by construction.

## Telemetry
`telemetry-check.js` vs the r132 baseline, panel seeds 2802–2805:
- Prereg metrics (`guardrails.deaths,guardrails.popAlive,
  guardrails.pantryKcal,c3.starvationDeaths`): LOUD "disappeared"
  (baseline 604/178/1210411 → current 0) — the r85/r136/r137 driver
  never emits `guardrails.*` fields, so the checker reads missing
  paths as 0. Schema mismatch, not a finding (same as r136).
- Adjudication by per-file means (baseline 16 files, panel 4):
  deaths 32.25/file vs 37.75 (−15%); alive 9.75 vs 11.1 (−12%);
  pantry 28,318 vs 75,651 (−63%, over the checker's 0.6 swing bar —
  within-panel spread is 10×, 4.7k–49.6k on n=4, and r136's panel
  read −55% on the same shape with the same thinnest seed; band
  noise). Starvation deaths 0 on both sides, counted directly from
  the deaths arrays. **Verdict: QUIET after adjudication.**
  Baseline NOT rolled forward (4-seed wedge-driver panel, same call
  as r85/r135/r136).

## Gate
`node scripts/check.js --quick` — **331 passed, 9 failed in 1369s**
(`journey-establishment-r137-gate.log`). Vs r136's 335/5 in 711s —
the longer wall time and extra failures are the loaded box (a
sibling gate, sim-rageprecheck-b's check.js --quick, ran at the same
time; registration also fought for the registry lock). The 9:
- `test-measurement-proof-update.js` + `test-measurement-workflow.js`
  (exit 1) — the measurement-proof staleness pair, pre-existing
  since r133; refresh rounds 11 + 12 (now 14) still owed.
- `test-phone-frame-proof.js` (exit 1) — stale receipts,
  pre-existing.
- `test-measurement-cache-flags.js` (exit 1, 70.3s) — the documented
  load artifact (AGENTS.md 2026-11-12: scores track box load);
  re-ran standalone **4/4**, exit 0.
- 5× exact-120s TIMEOUTs (exit null, no assertion failed) — the
  load-artifact class: living-garden, one-person-army,
  occupation-panels, trust-observer-neutrality, synergy-stall. All
  re-ran standalone green: living-garden **8/8**, one-person-army
  **7/7**, occupation-panels **25/25**, trust-observer-neutrality
  **6/6**, synergy-stall exit 0.
- None of the 9 is attributable to r137: this run changed NO src/js
  at all (driver/analyzer/proof-test/evidence only), so the game
  inputs are byte-identical to master `63c051206`.
**Gate: GO after adjudication, zero attributable to r137.**

## Next blank (filed for the next run)

**A previous-bearer LIVE run strands the wedge.** Seed 2802:
Ingrid's forage run was committed d12 by Tyler (the second bearer
after Manuel died d9 of sickness); Tyler died d13 "a stranger";
the run stayed live to the end (`live: true`, promiseKept
'released') with the ending permanently not-ready for the successor
("That outing belonged to the previous bearer. It is not your
promise."). The end-wedge only fires on state 'broken', so it never
tried to close it — and the wedge's live-branch early return meant
every dawn d14–d35 walked home for a run that can never be worked
(18× 'unworked: previous bearer', 3-step walks each dawn) and never
sat for a new favor: 0 commits after d12, Xavier's d10 ask never
got a commit sit, 0 door probes. The wedge froze its own social
play for three weeks on one dead run. Driver work, not a proven
game defect (the game may allow new favors while it is live — the
wedge never tried): the wedge should recognize the previous-bearer
status and stop working the run (sit for new favors instead, or
record it abandoned-unworkable). Open design question for Steve:
should the game release a dead bearer's outing on succession, or
should it linger in the successor's ledger forever?

## Landing
- Commit (worktree, via safe-commit.sh): `a754b02de` — 24 files
  (driver, analyzer, proof test, prereg, run note, 5 seed JSONs,
  5 convo txts, pilot/panel/gate logs, 6 standalone re-run logs).
  No src/js touched; no `[needs-eyes]` (driver-only, no
  player-facing change).
- Safe-commit index clobber struck (all 24 files staged-as-deleted
  in the main index; commit itself correct, 42127 insertions);
  repaired with the `git ls-tree -r HEAD | git update-index --add
  --index-info` pipe, verified: status empty, diff HEAD empty,
  hashes match.
- Master moved during the run (63c051206 → `e3a5a9053`,
  sim-rageprecheck-b Stage 2). Branch rebased cleanly onto
  e3a5a9053; rebased tip `b48fa97f1`. Proof test re-run post-rebase:
  **37/37**.
- Merge: `git merge --ff-only journey-establishment` in the main
  tree; on success master HEAD = `b48fa97f1`. Merged locally,
  pending ship (ship loop owns bump/push/live verification).
  (This section filled by the addendum commit on the same branch,
  merged ff-only right after.)
