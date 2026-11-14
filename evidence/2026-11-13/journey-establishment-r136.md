# Journey leg ESTABLISHMENT — r136 run note (2026-11-13, Lane A)

## Run
- Run id `playtest-loop-a-20261113T2347Z` (scheduled Fri 2026-11-13
  17:45 CST). Rotation read `1` (establishment); write `1→2` at run
  start (done — file reads 2; deepening next).
- Base: local master `249da4729` (batch ship version bump
  b5ae72cd4-20261113-233744). Pre-flight: main tree clean, disk 41%.
- Pre-flight deviations (LOUD): **write flap ACTIVE at
  registration.** Attempt 1 failed outright (`git worktree add`
  EPERM on `.git/refs/heads/journey-establishment.lock`;
  flap-watch FAIL 23:49–23:50Z). Attempt 2 succeeded after ~284s
  (registry-lock queue behind a sibling reaper). `worktree-reap.sh`
  died at the registry save (EPERM on atomic_write_json) — no trees
  removed, registry consistent with disk, 15 trees listed. `git pull`
  first reported "no such ref was fetched"; explicit `git fetch
  origin master` succeeded immediately after, master already at
  origin/master — transient, no action. Heartbeat loop runs from the
  goal hidden_files dir (10-min cadence, PID 10246).

## Leg question (r85's next blank, taken verbatim)

Yara (seed 997, r85) broke d8 and closed d15 — 7 dawns — because a
betrayal investigation thread occupied the conversation menu,
displacing the favor verbs entirely. The wedge presses ONLY cancel,
so it sat and retried each dawn. Filed as the next blank: "The wedge
needs a thread-exit behavior, or the design question stands: should
the favor menu stay reachable during a betrayal thread?"

## Diagnosis (established BEFORE the panel — staged probe + Yara's committed JSON)

The mechanism is **PAGINATION, not thread-gating** — the favor menu
was reachable all along; the wedge never turned the page:
- Yara's offeredIds (seed-997 JSON, endLog d8–d14) are a paged page-1
  menu: 4 betrayal actions + `menu:more` + `dlg:subject`/`leave`/
  `silence`. The `menu:more` is the tell — page 2 exists.
- Staged probe (`/tmp/r136-threadprobe.js`, seed 385: broken live
  forage run with ending ready + open betrayal case known to the
  player): page 1 reproduces Yara byte-for-byte in shape. Thread IS
  `'want'`, want `repay`, stage 0 — the favor branch DID fire;
  `convoMenuPage` paginates (betrayal rank 0 first,
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
  solve a menu problem.
- No game defect is proven: the verb IS offered, one page down. The
  r85 design question dissolves — no thread-exit behavior is needed
  and no re-scope is needed.

## The fix (driver-only, no src/js)

The r136 driver's `sit()` pages via `Game.convoNextMenu(vid)` when
its target verb is not on the current page, before giving up — for
every mode with a target verb (end `dlg:favor_cancel`, work
`dlg:favor_action`, accept `dlg:commit`). No case action is ever
pressed to clear a menu. `pagesTurned` + `menuPages` recorded on
sit recs and endLog; if the verb is absent after all pages,
offeredIds carries every page's ids.
- Proof test `scripts/test-journey-establishment-r136-threadpage.js`:
  **27/27 green** (staged Yara A1–A5, page-then-press close B1–B4,
  control C1, moot/site do-not-free D1–D3/E1–E3, driver source
  F1–F4, det-gate G3–G5: r136 driver twice, 5d seed 2701,
  byte-identical JSON + convo txt). Fail-control: the r85 driver
  contains 0 occurrences of `convoNextMenu`/`pagesTurned` — F1–F3
  fail on it by construction.

## Pilot (seed 2701, R136_PILOT_BREAK=1, NOT scored)

The first pilot run PASSED its gate (hold → broken live run → wedge
closed it same-dawn, 0 trust drops) but forced TWO driver fixes, so
per the prereg the panel runs on the fixed driver and the pilot stays
NOT scored:
1. **Paging pathology:** the first paging implementation re-swept
   every turn of every sit — accept-mode sits paged up to 66× in one
   sit (menu:more always present while menuPages > 1, and
   convoNextMenu wraps, so the sweep cycled pages). Fix: sweep ONCE
   per sit, stop when back at the starting page, and accept mode
   pages only when the commit is actually its target (an ask_favor
   joint want). After the fix: max pagesTurned 0 across all 69 pilot
   sits (no case was open during any sit on this seed — correct).
2. **Analyzer misread:** the r85 `opportunities()` grouped by vid
   only, so pilot Raul's TWO broken runs (d6 and d23) collapsed into
   one opportunity read as a 2-dawn-window FAIL. Fix: an opportunity
   closes when its run ends; the next broken entry for the same vid
   opens a new one; the thread-branch page check is scoped to the
   run's own days.
- Re-run pilot on the fixed driver: END BAR 3/3 (Raul d6→d6,
  Nompumelelo d15→d15, Owen d27→d27, all same-dawn), 0 trust drops,
  0 jam-days, village alive (10/10, wave 4, pantry 38,089). Thread
  branch 0/0 on the pilot (no paged end sits) — the mechanism is
  carried by the proof test, as the prereg allowed.

## Panel verdicts (seeds 2702–2705, fixed driver, 42d horizon)

Analyzer: `scripts/analyze-journey-establishment-r136-20261113.js`
(run by the coordinator on the panel JSONs).
- **END BAR: NO-GO (9/11 closed within 2 dawns).** 2702: 3/3
  (Angela d5→d5, Erin d14→d14, Rodrigue d29→d29). 2703: 1/1
  (Elif d10→d10, PAGED — see thread branch). 2705: 4/4 (Tariq d8→d8,
  Luis d17→d18, Nathan d27→d27, Luis d34→d34 — the second Luis run
  is a separate opportunity per the fixed grouping). 2704: 1/3 —
  Jasper d5→d6 PASS; **Pablo d16 FAIL** and **Hiroshi d36 FAIL**,
  both attributed below. Per §14 the bar is NO-GO as pre-registered;
  it is not re-scored.
  - **Pablo (broke d16, closed d22 via deliver):** 6×
    `end-stranded` d16–d21 — `travelHome84` failed every hop toward
    home with `res: "fallen_tree"`. The player sat at the map edge
    (8,0) behind a fallen tree for 6 dawns. d22 the player reached
    home and the run DELIVERED (120 kcal from Pablo into the pantry;
    the run had haul all along — playerKcal 90, partnerKcal 120 —
    so deliver-first, not the end press, closed it). The fallen tree
    HAS an honest player verb — "Clear the fallen tree" (cut it,
    +2 wood; game.js:12285/12309) — the wedge's travel-home just
    never uses it: one failed hop and it gives up for the dawn. This
    is a WEDGE-coverage gap (travel-home pathing around/clearing
    blockages), NOT a game defect. Filed as the next blank (below).
    No lasting jam: the run closed, 0 jam-days on the seed.
  - **Hiroshi (broke d36, never closed by d43):** 4× `end-stranded`
    d36–d39 (same fallen-tree block), then the bearer Simone DIED
    d39 of sickness (player death) and the run's ending went
    permanently not-ready for the successor — `end-not-ready: That
    outing belonged to the previous bearer. It is not your promise.`
    (×2) + event blocks (×2). Condition (b) of the END BAR (bearer
    is the player) fails from d39 on — the run is OUT OF SCOPE for
    the bar, not a wedge failure — but the analyzer's excuse logic
    only excuses runs whose EVERY attempt was a not-ready
    bearer/event block, and the stranded entries are not not-ready
    entries, so it counts as FAIL. Compound cause: the travel gap
    (d36–39) + succession scope boundary (d39–43). Had travel worked
    d36–38, the run would have closed before Simone died.
- **THREAD BRANCH: GO (1/1).** Elif (seed 2703) broke d10 and closed
  d10 — pagesTurned 2, menuPages 3 — the Yara shape in the wild,
  closed same-dawn via paging. 1/26 end sits paged across the panel.
  The fix works in the wild, not just staged.
- **TRUST GUARD: PASS.** 0 trust drops on any end press across the
  panel (and pilot).
- **JAM BAR (report-only): 0 jam-days** across the panel (r84: ~15
  on seed 994 alone; r85: 0). The poison stays held.
- **VILLAGE BAR: PASS.** 4/4 seeds alive at d40 (12/7/9/11 alive;
  endDay 43/43/43/43; waves 4/3/3/4; pantries 13k/15.7k/27.9k/80.4k).
- **WATER INSTRUMENT (report-only): 0 broken-live water runs**
  across the panel — the water end-wedge does NOT become the next
  blank.
- **DETERMINISM:** the proof test's det-gate ran the r136 driver
  twice on 5d seed 2701: byte-identical JSON + convo txt.
- **Q2 CANNED LINES (report-only):** pod-dream=0, recap-stitch=1,
  slope-reading=0, walked-in=0, take-it=0 across the 5 convo files
  (pilot + panel, 10 convos) vs r135's 4/5/4/5/3 across 16 files
  (32 convos). Rates down but denominators differ; no variety fix in
  this run. NEW watch item (see People check): the stew-bowl line
  ("Someone saved me the last of the stew once... I think about that
  bowl more than I think about the monsters.") recurs VERBATIM —
  Gerald r135 → Stan r136.
- **Q3 SPOTTER GUARD: foodXp['spotter'] total = 0** (r135: 0). The
  spotter blank stands: a villager can stare at the wild all day and
  learn nothing.

## Village assessment (panel 2702–2705, plain words)

Four villages ran the full 42 days; all four survived to day 43 and
none lost the village. 42 people alive at the end (9–12 per village;
thinnest seed 2704: 9 alive). Wave 4 reached on 2/4 seeds, wave 3 on
the other 2 — the leg's horizon pushes past wave 1 into the wave-3/4
fights, as a competent player's establishment should. Pantries are
fat by day 42 on most seeds (2705: ~80k kcal) but thin on one (2702:
~13k — the same thinnest-seed shape r135 saw on 2605). Deaths 156
across the panel (34–44 per village), overwhelmingly fighting (133
villager combat + 30 combat + 23 expedition + 3 ambush + 1 monster)
— dying fighting, not hungry: **zero starvation deaths anywhere**.
Two sickness deaths in 197 deaths across pilot + panel (Simone d39
on 2704 — the player, whose death stranded Hiroshi's run — and one
other). One death by "a wound that wouldn't close", one by "The
Focus Group". Favor outings work: 14 broken-live runs seen across
pilot + panel, 12 closed within 2 dawns; the two misses are both the
fallen-tree travel gap on one seed, not the outing system. The
binding pressure in this window is still who learns what and who
gets home, not food.

## People check (seed 2703 convos, read in full — PASS)

**Addison (trail crew lead):** opens on the day-count — a callback
to something the player said ("You said you count the days") — then
teaches Wild Ginger, deflects an invitation with character ("I work
alone. Nothing personal. ...It's a little personal."), ends
naturally. One mechanical beat: "Still on that personal stuff." —
the recap stitch (the panel's 1 counted instance).
**Stan (exterminator):** strong. Opens with a real question (the
kindest thing someone's done), the player's answer is remembered and
reflected ("Quiet generosity. It's holding this whole thing
together."). BUT the stew-bowl line is verbatim Gerald's from r135
("Someone saved me the last of the stew once. Didn't say anything,
just put the bowl down and walked off. I think about that bowl more
than I think about the monsters.") — same line, different villagers,
two runs running. New variety-watch item. "Between us — Still on the
big questions." is the recap stitch again. Ends "Good talk."
YOU lines truncated mid-sentence are the known driver artifact
(80-char label slice), not a game defect.

## Verdicts
- **Reachable: YES.** The end verb is reachable in the wild even
  with a case open (Elif, paged, same-dawn). Before the paging fix
  it took 7 dawns; now 1 tap.
- **Fun: YES.** Conversations read like people; the wedge no longer
  stalls a week on a menu page. The recurring template lines
  (recap stitch, stew-bowl) are the next variety candidates, not
  this run's scope.
- **Winnable: YES for the leg.** All 4 villages survive to day 43
  with wave 4 reached on 2/4. The winnability chain beyond the leg
  (wave-4 kills → veterans → wave 5) is still the open hunt,
  unchanged by this driver-only fix.

## Metric review
- The END BAR is NO-GO as pre-registered (9/11) and stands. The two
  misses share one cause — travel-home pathing that gives up on a
  fallen tree — plus a scope boundary the bar doesn't model
  (succession: the bearer dies mid-window and the ending is
  permanently not-ready for the successor). Proposals for the NEXT
  run, not re-scores of this one: (a) excuse runs whose bearer
  changes mid-window (check `forageRun.bearer !== current
  villagerId`) instead of counting them as failures; (b) scope the
  2-dawn window from the first at-home-ready dawn, or give the wedge
  blockage-clearing/routing first — the travel gap is the next blank
  either way.
- The pilot forced two tooling fixes (paging pathology, analyzer
  vid-grouping). Both are fixed in the committed driver/analyzer and
  the pilot was re-run clean on the fixed driver; the pilot seed
  stays NOT scored per the prereg. The analyzer's grouping fix also
  corrects the r85 analyzer's latent shape (a villager with two
  broken runs in one seed would have misread there too).
- Telemetry: the checker's LOUD lines are schema/size artifacts (see
  Telemetry below), not real deviations — the run changed no src/js
  and no game economy, so a guardrail move could not be caused by
  r136's change by construction.

## Telemetry
`telemetry-check.js` vs the r132 baseline, two runs:
- Prereg metrics (`guardrails.deaths,guardrails.popAlive,
  guardrails.pantryKcal,c3.starvationDeaths`): LOUD "disappeared"
  (baseline 604/178/1210411 → current 0) — the r85/r136 driver
  never emits `guardrails.*` fields (the r135 driver did), so the
  checker reads missing paths as 0. Schema mismatch, not a finding.
- Mapped metrics (`deaths,aliveEnd,pantryKcalEnd`): LOUD "newly
  appeared" (baseline 0 → current 197/52/175109) — the mirror image:
  the baseline has no such keys. Also a schema mismatch.
- Adjudication by per-file means (the honest comparison — the
  baseline is 16 files, the panel is 4): deaths 39.0/file vs 37.75
  (+3%); alive 10.5 vs 11.1 (−6%); pantry 34,255 vs 75,651 (−55%,
  under the checker's 0.6 swing bar; within-panel spread is 6×
  13k–80k on n=4, and r135's panel had the same 13k thinnest seed —
  band noise). Starvation deaths 0 on both sides, counted directly
  from the deaths arrays. **Verdict: QUIET after adjudication.**
  Baseline NOT rolled forward (4-seed wedge-driver panel, same call
  as r85/r135).

## Gate
`node scripts/check.js --quick` — **335 passed, 5 failed in 711s**
(`journey-establishment-r136-gate.log`). The identical 5 as the r135
and r85 adoption gates (335/5 both):
- `test-measurement-proof-update.js` + `test-measurement-workflow.js`
  (exit 1) — the measurement-proof staleness pair, pre-existing since
  r133; refresh rounds 11 + 12 still owed (see prereg).
- `test-phone-frame-proof.js` (exit 1) — stale receipts, pre-existing.
- `test-living-garden-deed-attainment.js` + 
  `test-one-person-army-deed-attainment.js` (exact-120s TIMEOUTs, exit
  null, no assertion failed) — the documented load-artifact class;
  both re-run standalone on this tip (see below).
- NOTABLY ABSENT vs r135's original gate: `test-measurement-cache-
  flags.js` PASSED this run (r135: 0/4 at the 30s cap; the load
  artifact, AGENTS.md 2026-11-12), and `test-capable-bot-20261014.js`
  passed in 76s.
- None of the 5 is attributable to r136: this run changed NO src/js
  at all (driver/analyzer/proof-test/evidence only), so the game
  inputs are byte-identical to master `249da4729`.
- Standalone re-runs on this tip: living-garden **8/8** in ~127s
  (`journey-establishment-r136-livinggarden-rerun.log`, exit 0);
  one-person-army **7/7** (`journey-establishment-r136-
  onepersonarmy-rerun.log`, exit 0). Both timeouts are the load
  artifact, green standalone — same pattern as r135/r85.
**Gate: GO after adjudication, zero attributable to r136.**

## Next blank (filed for the next run)

**Travel-home wedge doesn't clear blockages.** When a fallen tree
(or rubble / washed-out gap) blocks the path home, `travelHome84`
tries one hop, fails, and the wedge gives up for the dawn — Pablo
sat 6 dawns at the map edge, Hiroshi 4. The player HAS the honest
verb ("Clear the fallen tree" — cut it, +2 wood). The wedge needs
blockage-clearing (or routing around) on its homeward path — the
same wedge the end-wedge and the travel-out wedge share. Driver
work, not a game defect. Design note: game.js:11911 already reasons
about a second homeward axis — the wedge should use it.

## Landing
- Commit (worktree, via safe-commit.sh): `9a0219854` — 18 files
  (driver, analyzer, proof test, prereg, run note, 5 seed JSONs,
  5 convo txts, gate log, 2 standalone re-run logs). No src/js
  touched; no `[needs-eyes]` (driver-only, no player-facing change).
- Safe-commit index clobber struck (all 18 files staged-as-deleted
  in the main index; commit itself correct, 40391 insertions);
  repaired with `git read-tree HEAD` + verified status empty +
  diff HEAD empty.
- Master moved during the run (249da4729 → `5f83ca93d`, reaper
  flock guard). Branch rebased cleanly onto 5f83ca93d; rebased tip
  `c9528209a`. Proof test re-run post-rebase: **27/27**.
- Merge: `git merge --ff-only journey-establishment` in the main
  tree; on success master HEAD = `c9528209a`. Merged locally,
  pending ship (ship loop owns bump/push/live verification).
