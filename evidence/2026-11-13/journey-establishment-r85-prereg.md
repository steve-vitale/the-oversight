# Lane A playtest — journey-establishment r85: PRE-REGISTRATION

Written BEFORE any judged sim in this run (2026-11-13, 07:45 CST run).
Rotation read 1 (establishment) at run start; 2 written back at run start
(deepening next). This run takes r84's documented next blank #1, verbatim:
the end-wedge for broken runs. No queue-jump: this IS the rotation leg.

## Leg question
ESTABLISHMENT (days 14–40 window, 42d horizon per r71/r81–r84): r84 proved
the travel-out WORK step (Naran 260 kcal, Colleen 130 kcal) and isolated
the next stall — a BROKEN live forage run stays live in the ledger
(forageRun exists, returned=false) and blocks every later departure
("Finish your current outing before starting another" via
forageFavorCompanions); r84's panel showed the jam plainly (994: commits
d21/d24/d30 formed while Macarena's broken run was live, none could
depart until it cleared, ~15 jam-days). Does a real player close such a
run with the honest end — deliver if haul > 0, else end the outing via
dlg:favor_cancel ("End outing and unload what we have (break unfinished
promise)") — so the run stops being live (returned=true) and later
outings can depart again, without paying the broken-word price twice?

## Canon read
docs/CANON.md manifest read. NO canon doc covers the favor/outing
lifecycle (same as r82/r83/r84); per loop rules this run says so instead
of inventing canon. docs/CONVERSATIONS.md governs the convo surface the
wedge presses. docs/MAP.md governs travel (one map, way home).
Code read before building the wedge:
- src/js/favor-forage.js forageFavorAction(vid,f,ending): the ending
  branch returns ready forage_end when at home (bearer is the player);
  a gone partner (dead/away/roster-gone) blocks forage/deliver but
  NEVER blocks ending at home (r81 fix); only the player's matched
  share banks, the partner's virtual share is named lost, never
  deposited. performForageFavor(vid,f,true) unloads the player's share
  (pack-matched + kitchen-counter), sets returned=true, and calls
  convoFavorRenounce ONLY if the promise is not already kept — for an
  already-broken promise kept='broken' is truthy, so renounce is
  SKIPPED: no second trust penalty. f.state stays 'broken', but live
  (forageRun && !returned) becomes false.
- src/js/convo-wants.js convoFavorActionMenu: dlg:favor_cancel is
  offered exactly when forageFavorAction(vid,favor,true).ready for a
  live forage run. convoFavorRenounce: kept='broken',
  closedReason='renounced', trust -15 via resolveConsequence — the
  price of breaking a word, already paid when the promise rotted.
- src/js/convo-dialogue.js: pressing dlg:favor_cancel on a live forage
  run dispatches to performForageFavor(vid, favor, true).

THE DISTINCTION (pre-registered, this is the whole point): NEVER-cancel
(r83) was about LIVE promises — canceling a promise the player could
still keep breaks a word. Ending a BROKEN run is a different act: the
promise is already broken (kept='broken', trust penalty already
applied when it rotted; renounce is skipped because kept is truthy).
The end press only unloads what the player carries and marks the run
returned. It closes a corpse, it does not break a word. The wedge
checks broken-ness BEFORE pressing cancel, and never presses cancel
on an unbroken run.

## Driver
scripts/journey-establishment-r85-20261113.js — clone of the r84
driver (same competent policy, daily shape, dawn-signal wrap, daily
alive/pantry trace, end census, 2 held convos goon-first gated on
!Game.over, lifecycle instruments, accept wedge with round-robin
sampling, door-walk probe, travel-out wedge) PLUS the END WEDGE (the
one deliberate behavior change, disclosed here).

Wedge order each dawn (after sleep, before the day's policy loop),
when a live forage_help run exists:
1. RECORD pre-state: player node/inside/pos, partner node/pos,
   dayPart, run forageCount/playerKcal/partnerKcal, the
   forageFavorAction status (ending=false) AND the ending status
   (ending=true), trust[vid] before.
2. DELIVER-FIRST (unchanged from r84): if status is forage_deliver
   (at home, haul > 0), sit mode 'work' and press dlg:favor_action
   if offered; record deliveredKcal/kept/returned.
3. NEW — END (only when the run is BROKEN: favor.state === 'broken'
   OR promise.kept === 'broken'; and deliver is NOT offered):
   a. If not at the home node, travel home via offered travelTargets
      (travelHome84, cap 12 hops); record homeHops. If travel home
      fails, record 'end-stranded' and stop (never press cancel away
      from home — ending is not ready there).
   b. Re-read the ending status. If ready with action 'forage_end',
      sit mode 'end' and press dlg:favor_cancel IF OFFERED. End mode
      presses ONLY dlg:favor_cancel; if any other dlg: choice is
      offered instead, the sit ends without pressing and logs
      'end-mode-action-offered-instead'. Record post-trust[vid],
      post-run snapshot (returned, deliveredKcal, player/counter
      kcal), promise state, and the end line.
   c. If ending is NOT ready, record the reason and press nothing.
      Known not-ready shapes: bearer is not the player
      ('end-blocked-not-bearer' — succession; the outing belonged to
      the previous bearer), event/fight block (retry next dawn).
   d. The wedge NEVER presses dlg:favor_cancel on an unbroken run.
      A broken run WITH haul still takes the deliver-first branch
      (step 2), never the end branch — same as r84.
4. Otherwise (live, unbroken) the r84 travel-out work wedge runs
   unchanged (adjacency, travel out, press forage_together on edible
   kcal, travel home, deliver).
5. SAFETY (unchanged): if the wedge moved the player at all and the
   cycle did not complete, it still travels home before returning.
Water live runs keep the r83 sit-work behavior and are logged as
skipped 'water-kind' (unchanged) — PLUS instrumentation: the panel
JSON counts broken-live water runs seen (report-only; a water
end-wedge is a follow-up blank, not this run). Promised (not yet
live) favors keep the r83 door-walk probe unchanged.

PILOT MODE (pilot seed only, disclosed): R85_PILOT_BREAK=1 makes the
travel-out wedge HOLD on the first live forage run — honest inaction:
no travel-out, no forage_together presses — so the run breaks at its
deadline and the end-wedge has something to close. The hold applies
only while that run is live-and-unbroken; once it breaks, the
end-wedge takes over normally. The pilot verifies the end verb, the
trust guard, and the returned/live flip end to end. The panel runs
WITHOUT the flag.

## Pre-registered metrics (BINDING, §14 — a miss is NO-GO, never re-scored)
- PILOT GATE: seed 991 runs first on the final driver with
  R85_PILOT_BREAK=1; completes without crash AND instruments fire
  (dawnCalls/storeLog/commitLog non-empty or explicitly
  method-missing) AND the hold produces a broken live run AND the
  end-wedge closes it (returned=true, live=false) AND trust[vid] is
  identical before vs after the end press. If the pilot forces a
  driver fix, the panel restarts on fresh seeds and the pilot seed is
  NOT scored.
- PANEL (fixed driver from the start): seeds 996–999, 42d horizon,
  death-aware tail (+10d max).
- END BAR (primary): GO = every broken-live forage run that (a) broke
  >= 2 days before the run's end, (b) bearer is the player, (c) the
  ending status was ready on at least one dawn after breaking
  (at-home reachable, no event/fight block), is closed by the wedge
  (returned=true, live=false) within 2 dawns of breaking. NO-GO =
  any such run left live past that window, with each failure
  attributed to a named cause. NO-OPPORTUNITY = zero broken-live
  forage runs occur across the whole panel (not pass, not defect).
- JAM BAR (report-only, r84 comparison): jam-days = dawns on which a
  promised (not yet live) run existed while a broken-live run was
  live — the r84 poison. r84 panel: 994 showed ~15 jam-days
  (Macarena d17–d32). Report r85 jam-days per seed; the wedge's job
  is to hold this near the 1-dawn close lag. No threshold is set
  (report-only), but a jam-day count at r84 scale with the wedge
  running would be a wedge failure to explain, not a pass.
- TRUST GUARD (hard, safety): trust[vid] must be identical
  immediately before vs after EVERY end press. Any drop = a defect
  finding (double penalty for an already-broken word): the wedge
  stops ending for the rest of that seed, the drop is reported LOUD,
  and the END BAR is NO-GO for that seed regardless of closure.
- VILLAGE BAR (r81–r84 carried): alive at d40 on >=3/4 panel seeds.
  Reported per seed; a miss is NO-GO on the village bar only, not
  on the wedge bars.
- PEOPLE CHECK: PASS/FAIL on 2 held convos from one panel seed,
  read in full (meaning, coherence, consequence — not counts).
- FIX GATE: a game change lands ONLY if the wedge proves a game
  defect (a step no honest verb can take, or a dishonest block).
  A driver/policy coverage gap is documented, not patched in
  src/js. DELIVER OVER MEASURE (2026-11-01) applies.
- WATER INSTRUMENT (report-only): count of broken-live water runs
  seen across the panel; if > 0, the water end-wedge becomes the
  next blank.
- SAMPLING: accept sits keep r83/r84 round-robin (2/dawn); the
  panel note reports max sits per villager vs roster size from a
  panel seed. The end-wedge sits only the outing partner.
- DETERMINISM: one panel seed replayed on the final driver must be
  byte-identical JSON (r84 shape).

## Telemetry
After evidence, run scripts/telemetry-check.js against the
establishment baseline with the r85 per-seed JSON glob. LOUD lines
are same-run investigation items before any baseline roll-forward.
Baseline NOT rolled forward on a 4-seed wedge-driver panel unless
the checker is QUIET and the panel is otherwise clean — same
reasoning as r82/r83/r84.

## PILOT-STAGE ADDENDUM (written before the panel run; pilot ran on the
pre-fix driver, forced one GAME fix + two driver corrections, pilot NOT
scored; the panel runs on the fixed driver after a re-run pilot gate)

Pilot seed 991 (R85_PILOT_BREAK=1) completed endDay 43, alive 10/10,
wave 4, pantry 50,583 — but the end-wedge closed NOTHING: 33 end
attempts, 0 ended, 0 favorCancels. Diagnosis (pilot JSON
journey-establishment-r85-seed991.json):
- Brian's run departed once (favor_forage_depart x1), held unworked by
  the pilot-break hold, broke on schedule (state 'broken', promiseKept
  'broken', 0 haul). The hold never engaged as a live-unbroken wedge
  entry (pilotBreakVid null — the run broke before the first live dawn,
  the r84 window finding again: departure consumes its dawn, due =
  meet+1, so the work window was ~0 dawns on this seed).
- The ending status WAS ready on 26 dawns (forage_end, "Unload what
  you have and end this outing") — but the sit reported
  'end-cancel-not-offered' every time: offeredIds were generic only
  (dlg:help, dlg:cant, teach, dlg:subject, leave, silence). 7 further
  dawns were 'end-not-ready: Finish the current event...' (event
  blocks, legitimate — retry next dawn).
- ROOT CAUSE (game defect, FIX GATE MET): buildMenu's favor-menu gate
  (src/js/conversation.js) admits state 'promised' and live WATER runs
  only — no live-FORAGE clause. A broken live forage run therefore
  never gets the favor menu, so dlg:favor_cancel (and forage_deliver
  after a break) is conversationally unreachable, although the engine
  side is complete (ending branch ready; performForageFavor unloads +
  returns the run — the proof test's direct press closes it). The water
  clause proves the pattern; the forage clause is simply missing. The
  run stays live forever and blocks every later departure — the exact
  r84 poison, now with its cause named.
- FIX (src/js, one line, this run): add the live-forage clause to the
  gate, mirroring water: (favor.forageRun && !favor.forageRun.returned).
  The menu builder (convoFavorActionMenu) still decides WHICH verbs to
  offer by readiness, so no verb appears before its time; returned runs
  still get no cancel (the builder checks !returned). Proof test
  scripts/test-journey-establishment-r85-endmenu.js: 14/14 PASS after
  the fix (11/14 before: the 3 menu-offer checks failed pre-fix, the
  direct-press close + trust checks passed — the defect is menu-only).
  This is a player-facing feel/content fix (a promise-ending verb
  becomes reachable), so the commit carries [needs-eyes].
- DRIVER CORRECTION 1 (test setup, not the game): the proof test's
  first run showed the ending status NOT ready — the ending branch
  shares the adjacency check, and the test had not placed the partner
  next to the player. Fixed in the test (placeAdjacent: same node,
  same tile, same side of the door). The DRIVER already recovers
  adjacency (travelHome84 + partner travels with the player; the
  pilot's endStatus was ready 26/26 non-event dawns), so the driver
  needed no setup change — but the end-wedge now ALSO runs
  ensureAdjacent84 when the ending status names a door/adjacency
  block (same recovery the work wedge uses), in case a panel seed
  door-splits the pair.
- DRIVER CORRECTION 2 (trust guard, measurement not game): the guard
  was tightened mid-pilot to "identical before vs after", but the
  probe shows ending a talked conversation grants +1 trust (talk
  reward: endConvo after >=1 turn moves trust 10->11; startConvo
  alone and endConvo with no turn do not). A clean end therefore
  reads pre+1, not identical. The guard reverts to DROP-ONLY
  (post < pre trips it) — the prereg's intent was always "no second
  penalty", and the +1 is conversation behavior, not a penalty. The
  pilot's 26 end sits never tripped it (no turn was ever pressed).
- PILOT GATE (re-run): seed 991 on the FIXED driver with
  R85_PILOT_BREAK=1 must show the hold producing a broken live run
  AND the end-wedge closing it (returned=true, live=false) AND no
  trust drop. If it forces a further driver fix, the panel restarts
  on fresh seeds and the pilot seed stays NOT scored.
- PANEL (fixed driver, from the start): seeds 996–999, 42d horizon.
  Bars unchanged (END / JAM / TRUST GUARD / VILLAGE / PEOPLE CHECK /
  FIX GATE), except the TRUST GUARD now reads DROP-ONLY per this
  addendum, and END attempts that hit a door/adjacency block now
  retry through ensureAdjacent84 before counting as not-ready.
