# Lane A playtest — journey-establishment r85: RUN NOTE

Leg: establishment (days 14–40 window, 42d horizon). Rotation read 1 at run
start; 2 written back at run start (deepening next). Base: master 4c4df500e
(r192 evidence commit). Run: fleshout Lane A 07:45 CST 2026-11-13 (r85).
This run took r84's documented next blank #1, verbatim: the end-wedge for
broken runs. Prereg: `evidence/2026-11-13/journey-establishment-r85-prereg.md`
(including the pilot-stage addendum).

## The question, in plain words

A favor to go foraging together can break — the partner doesn't show, the
promise rots — and the broken outing stays "live" in the books forever. While
it is live, nobody can start another outing ("finish your current outing
first"), so one broken trip jams every later departure for ~15 days (r84).
Can a real player close such a broken run with the honest ending — unload what
they carry and end the outing — so the books clear and later outings can go
again, without being charged twice for the already-broken promise?

## What the pilot proved (seed 991, NOT scored)

The end-wedge closed nothing: 33 end attempts, 0 ended. The ending was ready
on 26 dawns ("Unload what you have and end this outing") but the sit reported
`end-cancel-not-offered` every time — the offered menu was generic only.
ROOT CAUSE (game defect, FIX GATE MET): the conversation menu's favor gate
(`src/js/conversation.js`, buildMenu) admits state 'promised' and live WATER
runs only — no live-FORAGE clause. A broken live forage run therefore never
gets the favor menu, so "End outing" (dlg:favor_cancel) is conversationally
unreachable, although the engine side is complete (ending branch ready;
performForageFavor unloads + returns the run — the proof test's direct press
closes it). The water clause proves the pattern; the forage clause is simply
missing. The run stays live forever and blocks every later departure — the
exact r84 poison, now with its cause named.

## The fix (one line, [needs-eyes] — a promise-ending verb becomes reachable)

`src/js/conversation.js`: add the live-forage clause to the favor-menu gate,
mirroring water: `(c.want?.favor?.forageRun && !c.want.favor.forageRun.returned)`.
The menu builder still decides WHICH verbs to offer by readiness, so no verb
appears before its time; returned runs still get no cancel (the builder checks
!returned). Proof test `scripts/test-journey-establishment-r85-endmenu.js`:
**14/14 PASS after the fix (11/14 before: the 3 menu-offer checks failed
pre-fix, the direct-press close + trust checks passed — the defect is
menu-only)**. Re-run by the adoption coordinator on the final driver: 14/14.

## Panel verdicts (seeds 996–999, fixed driver, 42d horizon)

Analyzer: `scripts/analyze-journey-establishment-r85-20261113.js`
(run by the adoption coordinator on the panel JSONs).

- **END BAR: NO-GO (4/5 closed within 2 dawns).** Annelie d8→d8, Elena
  d21→d21, Victor d5→d5, Easton d6→d6 — all closed the same dawn they broke.
  Yara (seed 997) broke d8 and closed d15 — 7 dawns, past the 2-dawn window.
  Named cause (verified in the seed-997 JSON, not asserted): a betrayal
  investigation thread occupied the conversation menu for 7 dawns
  (offeredIds were `betrayal:site/witnesses/investigate/moot:case_2`, then
  `case_4`, + generic only), displacing the favor verbs entirely. The wedge
  presses ONLY cancel, so it sat and retried each dawn; the first dawn the
  thread cleared (d15) cancel was offered, pressed, and the run closed
  (returned=true, trust 91→91, no drop). The fix itself worked in the wild —
  the d15 close went through the fixed menu. The miss is a WEDGE-coverage
  gap, not a defect in the fix: the end-wedge has no behavior for an active
  non-favor thread (work through it, or step out and re-sit). Filed as the
  next blank (see below). Per §14 the bar is NO-GO as pre-registered; it is
  not re-scored.
- **TRUST GUARD: PASS.** 0 trust drops on any end press across the panel
  (Yara's trust rose 49→91 across the sits from normal talk; the d15 close
  itself moved it 91→91). The guard reads DROP-ONLY per the pilot addendum
  (ending a talked conversation grants +1 trust from the talk itself).
- **JAM BAR (report-only): 0 jam-days across the panel** (r84 panel: ~15 on
  seed 994 alone). The poison is held: broken runs now close the dawn they
  break, so no promised run ever waits behind one.
- **VILLAGE BAR: PASS.** 4/4 panel seeds alive at d40 (8/9/11/10 alive;
  endDay 43/43/42/43; waves 4/3/4/3; pantries 62k/53k/81k/38k kcal).
- **WATER INSTRUMENT (report-only): 0 broken-live water runs** across the
  panel — the water end-wedge does NOT become the next blank.
- **PEOPLE CHECK: PASS** (adoption coordinator's own read of the 2 held
  convos from panel seed 997 + 2 from seed 998, in full). Elena resumes a
  grief thread from 4 days back, the party gets named ("APEX SNACKS" —
  System-suggested joke name vs Miriam's "The Kept Promise"), the name
  sticks and the Codex records it. Miriam's plant lesson resumes, trap-line
  walk, "I don't want to be alone with my head right now" — vulnerable,
  coherent. Dwayne deflects a hard question ("Have you ever hurt someone?")
  and the subject drops cleanly; gossip about Zoe. Victor rates sunsets
  (tonight a seven, yesterday a nine) and takes the Point party role from
  Owen. No filler loops, no fabricated shared history, no verbatim repeats.
  One mild roughness: Elena's `[alive:want:curious]` "Ask me anything" is
  answered with "...Sorry, lost my train of thought" — a non-sequitur the
  conversation recovers from; not a defect.
- **DETERMINISM: PASS.** Adoption coordinator replayed panel seed 996 on the
  final driver: byte-identical JSON (45s run).
- **TELEMETRY: QUIET.** `telemetry-check.js` vs the establishment baseline,
  5 files (pilot + panel), metrics national/table/wins: no large deviations.
  Baseline NOT rolled (4-seed wedge panel).

## Reachable / fun / winnable (establishment leg)

- Reachable: yes — the end verb is now reachable in the wild (5 closes on
  the panel, 4 same-dawn). Before this fix it was unreachable for every
  broken forage run, on every seed.
- Fun: the conversation still reads like people (see People Check); the fix
  removes a silent dead end, it adds no new chore.
- Winnable: not judged by this leg — no village reached the win chain in
  42 days, as expected for the establishment window.

## Metric review

- The END BAR's 2-dawn window does not accommodate multi-dawn conversation
  threads. When a betrayal thread occupies the menu, no favor verb can be
  pressed at all — a real player would have to work through or exit the
  thread first, which the wedge does not do. Next run: either give the
  end-wedge a thread-exit behavior, or re-scope the END BAR to exclude dawns
  where a non-favor thread occupies the menu. The bar stays as written for
  this run (NO-GO, Yara).
- The TRUST GUARD correction from the pilot addendum stands (DROP-ONLY; the
  +1 is conversation behavior, not a penalty).
- Pilot seed 991 is NOT scored (prereg): Brian closed d11, Colleen d23
  (both PASS on the fixed driver), Denny excused (ending never ready —
  event blocks all 7 dawns).

## Next blank (filed in sim-findings.md by the adoption coordinator)

Betrayal thread displaces the favor menu: while a betrayal investigation
thread is up, the favor verbs (including End outing) are not offered, so a
broken run cannot close until the thread clears (Yara: 7 dawns). The wedge
needs a thread-exit behavior, or the design question stands: should the
favor menu stay reachable during a betrayal thread?

## Gate

Adoption gate (coordinator 05223aca, 2026-11-13): rebased onto master
`46cdc89cb` (after the r135 landing; fix `469ddf87c`), proof test 14/14
on the rebased tip, `check.js --quick` **335 passed, 5 failed in 609s**
(`journey-establishment-r85-gate-adopt.log`) — the identical 5 as the
r135 gate: measurement-proof staleness pair (pre-existing; refresh
rounds 11+12 owed), phone-frame stale receipt (pre-existing), and the
two exact-120s timeouts (living-garden, one-person-army), both re-run
standalone on this tip and green — living-garden **8/8**, one-person-army
**7/7**. **Gate: GO after adjudication, zero attributable to the
conversation.js fix.** Merge: ff-only to master (see below).
