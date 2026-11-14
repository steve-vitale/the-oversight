# Journey leg ESTABLISHMENT — r136 pre-registration (2026-11-13, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135 precedent).
Death-aware: stop after 10 consecutive all-dead daily checks; never tick a
dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261113T2347Z` (scheduled Fri 2026-11-13 17:45 CST).
Rotation read `1` (establishment); write `1→2` at run start (done — file
reads 2; deepening next). **Base:** local master `249da4729` (batch ship
version bump b5ae72cd4-20261113-233744).
Pre-flight deviations (LOUD):
- **Write flap ACTIVE at registration.** Attempt 1 failed outright:
  `git worktree add` EPERM writing
  `.git/refs/heads/journey-establishment.lock` (flap-watch FAIL
  23:49–23:50Z, probes A/B/E). Attempt 2 succeeded after ~284s
  (registry-lock queue behind a sibling reaper). Worktree verified
  on disk, branch `journey-establishment`, heartbeat landed
  23:58:12Z; heartbeat loop runs from the goal hidden_files dir
  (10-min cadence, PID 10246 at run start).
- **Reap hit the flap too:** `worktree-reap.sh` died at the registry
  save (PermissionError EPERM on atomic_write_json) — no worktrees
  removed, registry still consistent with disk, 15 trees listed
  (cap 16, registration fit). No repair attempted; hygiene only.
- `git pull` first reported "no such ref was fetched"; explicit
  `git fetch origin master` succeeded immediately after and master
  was already at origin/master `249da4729` — transient, no action.
- Main tree clean; disk 41%.

## Leg question (named by r85's metric review + next blank — this run takes it verbatim)

**Q1 (primary — THE END-WEDGE PAGING GAP).** r85: the end-wedge closed
4/5 broken-live forage runs within 2 dawns. Yara (seed 997) broke d8
and closed d15 — 7 dawns — because a betrayal investigation thread
occupied the conversation menu for 7 dawns (offeredIds were
`betrayal:site/witnesses/investigate/moot:case_2`, then `case_4`, +
generic only), displacing the favor verbs entirely. The wedge presses
ONLY cancel, so it sat and retried each dawn. Filed as the next blank:
"The wedge needs a thread-exit behavior, or the design question
stands: should the favor menu stay reachable during a betrayal thread?"

## Diagnosis (established BEFORE the panel — staged probe + Yara's committed JSON, not panel data)

The mechanism is **PAGINATION, not thread-gating** — the favor menu
was reachable all along; the wedge never turned the page:
- Yara's offeredIds (seed-997 JSON, endLog d8–d14) are a paged page-1
  menu: 4 betrayal actions + `menu:more` + `dlg:subject`/`leave`/
  `silence`. The `menu:more` is the tell — page 2 exists.
- Staged probe (`/tmp/r136-threadprobe.js`, seed 385: broken live
  forage run with ending ready + open betrayal case known to the
  player, same staging as the r85 proof test + `openCase`): page 1
  reproduces Yara byte-for-byte in shape
  (`betrayal:site/witnesses/investigate/moot:case_1`, `menu:more`,
  navigation). Thread IS `'want'`, want `repay`, stage 0 — the favor
  branch DID fire; `convoMenuPage` paginates (betrayal rank 0 first,
  `dlg:favor_cancel` default rank 4 last). `convoNextMenu` page 2:
  `betrayal:letlie:case_1`, `dlg:forage_talk`,
  `dlg:favor_requirements`, **`dlg:favor_cancel`** — the verb is one
  tap away. Control (no case): cancel on page 1 — why the other 4
  r85 closes worked.
- Pressing a betrayal action does NOT free page 1 and is the WRONG
  move: `betrayal:moot` calls the moot (trial: true, case stays open,
  menu unchanged except moot consumed); `betrayal:site` examines the
  site (siteExamined: true, case stays open). A wedge that pressed
  case actions would take real village actions (calling a trial!) to
  solve a menu problem. The honest player move is `menu:more` —
  the player's own verb, one tap, no case consequences.
- No game defect is proven by the probe: the verb IS offered, one
  page down. The r85 metric review's design question dissolves —
  no thread-exit behavior is needed and no re-scope is needed.
  **Fix shape (driver-only, no src/js):** the wedge's `sit()` pages
  via `Game.convoNextMenu(vid)` when its target verb is not on the
  current page, before giving up. Same for every mode with a target
  verb (end `dlg:favor_cancel`, work `dlg:favor_action`, accept
  `dlg:commit`) — the deliver branch has the same exposure when a
  case is open. No behavior change when the verb is on page 1 (the
  common case). Record `pagesTurned` + `menuPages` in sit recs and
  endLog; if the verb is absent after all pages, record all-pages
  offeredIds.

## Q1 bars (binding, §14 — no mid-run re-scoring)
Driver: `scripts/journey-establishment-r136-20261113.js` (r85 driver
clone + paging sit + thread-branch instrumentation; the driver itself
is otherwise unchanged). Analyzer:
`scripts/analyze-journey-establishment-r136-20261113.js` (r85
analyzer clone + THREAD BRANCH + Q2 counters + spotter guard).
- **END BAR (primary, r85 shape):** GO = every broken-live forage
  run that (a) broke ≥ 2 days before the run's end, (b) bearer is the
  player, (c) the ending status was ready on at least one dawn after
  breaking, is closed by the wedge (returned=true, live=false)
  within 2 dawns of breaking. NO-GO = any such run left live past
  that window, with each failure attributed to a named cause.
  NO-OPPORTUNITY = zero broken-live forage runs across the panel
  (not pass, not defect).
- **THREAD BRANCH (new):** among broken-live runs whose end-sit
  page 1 lacks cancel because the menu paged (menuPages > 1 with
  betrayal/agency prepends), GO = all close within 2 dawns of
  breaking via the paging wedge. NO-OPPORTUNITY = zero such runs
  on the panel — then the proof test carries the mechanism (staged
  Yara reproduction) and the panel only re-proves the END BAR with
  the new driver. A NO-OPPORTUNITY here is honest, not a failure.
- **TRUST GUARD (hard, DROP-ONLY, carried):** trust[vid] must not
  drop across any end press. Any drop = defect finding, wedge stops
  ending for the rest of that seed, END BAR NO-GO for that seed.
- **JAM BAR (report-only):** jam-days = dawns on which a promised
  (not yet live) run existed while a broken-live run was live.
  r84 panel: ~15 on seed 994 alone; r85 panel: 0. Report per seed.
- **VILLAGE BAR (r85 carried):** alive at d40 on ≥3/4 panel seeds.
- **PEOPLE CHECK:** PASS/FAIL on 2 held convos from one panel seed,
  read in full (meaning, coherence, consequence — not counts).
- **FIX GATE:** a game change lands ONLY if the wedge proves a game
  defect (a step no honest verb can take, or a dishonest block).
  The probe proves none — the panel is expected to land driver-only.
  If the panel overturns the probe (e.g. cancel unreachable on ALL
  pages in the wild), that is named in the run note as a game defect
  with the panel evidence, and the fix gate governs.
- **WATER INSTRUMENT (report-only):** count of broken-live water
  runs seen across the panel (r85: 0).

## Q2 (report-only — canned-line variety watch, r135 standing watch)
Count verbatim repeats of the r135 standing-watch lines across the
panel's AFTER transcripts: taken-kin pod-dream closing (r135: 4×),
recap stitch "X — Still on Y" (5×), slope-reading lesson (4×),
"Walked in like they'd never left." (5×), "Take it for what it's
worth." gossip closer (3×). No fix in this run (scope is the wedge);
counts feed the next run's question.

## Q3 (carried guard — spotter blank, r131/r133/r134/r135)
`foodXp['spotter']` total on the panel (r135: 0). Report-only; the
spotter blank (a villager can stare at the wild all day and learn
nothing) stands as the next diagnostic after the wedge.

## Seeds, policy, horizon
Pilot: **2701** with `R136_PILOT_BREAK=1` (forced break, same
honest-inaction hold as r85). Panel: **2702–2705**, 42d horizon.
Policy: competent (r85 driver shape — no withDelegate/HUNTSTAFF
flags; verified in the driver). Death-aware tail +10d.
Proof test: `scripts/test-journey-establishment-r136-threadpage.js`
(staged Yara reproduction: cancel absent page 1 / present page 2
after convoNextMenu / press closes run + trust no-drop; control:
no case → cancel page 1; moot-press does NOT free page 1; det-gate:
r136 driver twice, 5d seed 2701, byte-identical outputs).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 2701–2705 is FRESH.** Word-boundary grep
  `(^|[^0-9])270[1-5]([^0-9]|$)` over `evidence/**/*.md` and
  `scripts/`: hits are all non-seed usages (source line numbers
  `:2704`, commit-hash tail `a30cd2704`, `2701 kcal` counts,
  `2702` table counts). No prereg, forbidden list, contaminated
  list, screen, or extension band names 2701–2705 as seeds.
  5-digit tails (62701/92701) are different bands, not uses.
- Contaminated bands NOT reused for new questions (r135 list
  carried): 1502, 1504, 1603, 1604, 17101–17112, 1142–1151,
  1801–1804, 1901–1916, 2001–2010, 2101–2116, 2201–2216, 2301–2316,
  2401–2416, 100001–100008, 1200–1209, 2501–2516, 2601–2616
  (matched reuse only, r133/r134/r135 — NOT reused here).

## Canon
docs/CANON.md + docs/CONVERSATIONS.md read at run start.
CONVERSATIONS.md structural contract: "Menus keep the exact offered
labels through rerenders and pagination" — paging is the
established mechanism, and the wedge uses the player's own
`menu:more` verb. No canon doc covers the favor/outing lifecycle
(same as r82–r85); per loop rules this run says so instead of
inventing canon. No src/js change is expected; the fix is
driver-side. ENCOUNTER-GEAR RULE (Steve 2026-11-13): the journey
driver plays the live village state (real gear/progression,
competent policy), not a staged solo-scholar fixture — same as
r135; the proof test stages a broken run + case for the mechanism
only, not a combat fixture.

## Context arriving mid-run (not this run's scope)
Steve RULED 2026-11-13 18:00 CST on the medicine holder-less lever
(put to him by the main session): ALL FOUR levers — (a) scholar
fetches medicine, (b) traveling healer visits, (c) any villager can
search for medicine once taught, (d) level-ups offer healing
abilities with more incentive. Build brief:
goal hidden_files/medicine-holderless-levers-brief-2026-11-13.md
(not yet on disk at prereg time). This run does NOT take that
build — it belongs to a dedicated arm — but the panel's
wound-fever/healer numbers are relevant context and are reported.

## Pilot gate
Pilot seed 2701 runs first on the final driver with
`R136_PILOT_BREAK=1`; completes without crash AND instruments fire
AND the hold produces a broken live run AND the paging wedge closes
it (returned=true, live=false) AND no trust drop. The paging path
itself (pagesTurned ≥ 1) fires in the wild only when a case is open
during an end sit — if the pilot closes without paging, the gate
still passes on closure and the proof test carries the paging
mechanism (recorded honestly, not claimed as wild). If the pilot
forces a driver fix, the panel restarts on fresh seeds and the
pilot seed is NOT scored.

## Telemetry
Live baseline is the r132 BEFORE panel (competent + withDelegate +
HUNTSTAFF=2, seeds 2401–2416); r133/r134/r135 did NOT roll forward.
This run's panel is the r85 driver regime on the fresh band
2702–2705 — guardrails should stay quiet; any LOUD line is
adjudicated as band noise vs real bug BEFORE rolling the baseline
forward. Metrics: guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths (r135's set). Baseline
NOT rolled forward on a 4-seed wedge-driver panel unless the
checker is QUIET and the panel is otherwise clean (r85 call).

## Measurement-proof refresh (owed)
Still owed since r129 (rounds 11 + 12 now: r192 + applystatus +
r135 + r193 all changed src/js since b10's panel). This run lands
driver-only (no src/js) — no new refresh obligation from r136;
if none exists at closeout, report it as still owed with the
reason, do not silently deepen the debt.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
