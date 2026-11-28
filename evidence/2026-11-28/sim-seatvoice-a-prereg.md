# sim-seatvoice-a — PREREG (voicing fix, capstone delivery announcement)

**Arm:** sim-seatvoice-a · **Loop A run:** fleshout-20261128T0515Z
(next blank #2 from the 0515Z round record) · **scalecensus §7**
**Type:** VOICING-ONLY fix (zero gating, pricing, or behavior change;
never gate the Table on godhood)
**Frozen:** 2026-11-28 ~07:15 UTC, before any code change or judged sim.
**Branch:** `sim-seatvoice-a` (worktree
`~/workspace/worktrees/sim-seatvoice-a`).
**Base:** master tip `bcf06e019` (verified current at freeze: worktree
HEAD == local master tip).

## §0. The finding, in plain words

On both leg-2 delivery seeds the game tells the player a lie at the
moment two named people walk out of Haven in the tribute. Seed
113302 day 83: "◈ THE TRIBUTE — Avery and DeAndre walk out of Haven
in the table's service, two fighters the galaxy asked for by name.
The village is smaller tonight. The seat is open." Seed 113305 day
140: the same line with Mara and Xavier. But the seat is NOT open on
either seed: the deed gate still fails on scale (national never
reached, 0/8) and the seat stays lesser to day 150. The line is
unconditional in code (`src/js/table.js:218` tribute; `:232` charter
and `:246` embassy say the same). The mercy-window line fired on
both delivery days is the same overclaim class: "◈ THE TABLE —
between now and the seat, the world holds its breath. Nothing out
there can take this from you." — while raids keep taking food after
delivery (15 post-delivery raid lines on 113302, all "Nobody's
dead"). The mercy window holds lives, not food: `tableActive()`
suspends killing pressure from delivery to the seat (code comment
`src/js/table.js:170-171`, sanctity law `docs/TABLE.md` §8), but the
pantry is still raided. Full context:
`evidence/2026-11-28/sim-capstoneready-a-leg2.md` §3; before corpus
`evidence/2026-11-28/perseed-capstoneready-a-leg2-arm/` (exact
delivery lines in `s113302.json` d83 and `s113305.json` d140);
finding `hidden_files/sim-findings.md` line ~2782.

## §1. The fix (frozen wording — voicing only)

Two helpers, added to `src/js/table.js` just before
`ladderDeliverCapstone`, called from all three delivery branches
(tribute / charter / embassy). The triplicated mercy line is fixed
by extraction (one helper, three call sites), not by three edits.

- `_capstoneSeatLine()` — reads the deed gate LIVE at delivery
  time via `this.deedGateReady()` (the full seat's deed half:
  waves 5/5/4/3/2 distinct fought, 3 contests, 3 crises, stage ≥ 2,
  food-thesis deed, national/global scale — `src/js/progression.js:669`).
  Fail-closed: any read error reads as gate-closed (never claim an
  open seat on an unreadable gate).
  - Gate OPEN (`deedGateReady().ok` true): `"The seat is open."`
    — the original line, unchanged.
  - Gate CLOSED: `"The deed is done — the seat still waits on the deeds."`
- `_capstoneMercyLine()` — returns the full line:
  `"◈ THE TABLE — between now and the seat, the world holds its breath. The wild can still take your food — but it cannot take your people."`
  The "world holds its breath" half is kept (it stays true: the
  sanctity window holds from delivery). The overpromising sentence
  is replaced by exactly what the mercy window does and does not
  do: lives safe, food still raided.

Branch edits (mechanical, same shape in all three):
- tribute `:218`: `...The village is smaller tonight. ${this._capstoneSeatLine()}`
- charter `:232`: `...the table has the charter on its ring. ${this._capstoneSeatLine()}`
- embassy `:246`: `...the galaxy ate from it. ${this._capstoneSeatLine()}`
- all three `:219/:233/:247`: `this.say(this._capstoneMercyLine());`

NOT changed: no gate, no price, no threshold, no behavior, no
`deedGateReady()` semantics, no `tableActive()` semantics, no
`tableSeat()` pricing. The Table is never gated on godhood
(`docs/TABLE.md:62`). The delivery still records the capstone and
still opens the mercy window exactly as before.

KNOWN LIMIT (recorded here, not hidden): the seat clause is gated
on the deed half only, as ordered — the full seat additionally
needs ladder peak ≥ 3 (`tableSeat()`, `table.js:118`). A village
with the deed gate met but ladder peak short hears "The seat is
open" while the FULL seat waits on peak; the lesser seat is open
in that state in practice (the deed gate is a superset of the
lesser bars except peak ≥ 1, which a national village has met),
and the seat audit (`fullSeatShortfall`) names a peak shortfall
aloud. If Steve wants the line gated on the full seat instead,
that is a one-line change to the helper.

## §2. Primary metric (BINDING, §14)

Single leg (voicing arm; no ctl/arm pair beyond the leg-2/ seatvoice
pairing on identical seeds). Population: ALL 8 seeds, delivery
policy, 150d death-aware. The before corpus is the leg-2 corpus
(`perseed-capstoneready-a-leg2-arm/`); the after corpus is the new
run (`perseed-seatvoice-a-arm/`). Each per-seed row carries the same
harvest as leg 2 (daily snapshots, fireside + table lines, delivery
attempts).

- **GO bar (1) — closed-gate delivery never overclaims:** on BOTH
  delivery seeds 113302 (d83) and 113305 (d140), re-run with the
  fix, the delivery lines NEVER say "The seat is open" while the
  deed gate is closed. Read from the after corpus: the d83/d140
  tribute line contains "The deed is done — the seat still waits
  on the deeds." and the deed-gate snapshot on the delivery day
  reads `ok: false`.
- **GO bar (2) — open-gate delivery still says it:** staged proof
  (`scripts/test-seatvoice-a.js`, live game, no gate stubbed): a
  delivery staged with the deed gate open DOES say "The seat is
  open." (the frozen open-case wording). The test asserts
  `deedGateReady().ok === true` BEFORE the delivery, so the line
  is proved against a genuinely open gate, not a staged string.
  The same test proves the closed-gate delivery says the honest
  line, and proves the mercy line's exact text on both.
- **GO bar (3) — determinism (no other transcript line changes):**
  diff the before/after corpora per seed (parsed JSON, field by
  field): on the two delivery seeds ONLY the delivery line and the
  mercy line may differ (2 changed lines per delivery seed); on
  the other six seeds ZERO lines differ; snapshots, delivery
  records, end states, and all other table/fireside lines are
  identical. `say()` consumes no RNG, so the voicing change must
  not move any number. One seed (113302) re-run after the pilot
  into a temp OUTDIR must be byte-identical to its pilot file.
- **GO bar (4) — the mercy line no longer overclaims:** in the
  after corpus, the string "Nothing out there can take this from
  you" appears ZERO times on any seed; the d83/d140 mercy line is
  exactly the frozen §1 text. In the proof test the mercy helper
  returns exactly the frozen text.
- **Instrument errors:** 0 on all per-seed files.

**Verdict:** GO when all four bars pass (the lie is gone on both
delivery seeds, the true line still fires when the gate is open,
nothing else in the transcript moved, the mercy line is honest).
NO-GO kind VOICING when (1), (2), or (4) misses (the words are
still wrong); NO-GO kind DETERMINISM when (3) misses (the fix
moved something it must not touch — a voicing change must not
move numbers); NO-GO kind INSTRUMENT when errors > 0. A miss is
NO-GO, never re-scored against a friendlier metric mid-run. Win
rates, national reach, and seat movement are NOT in the GO bar —
this arm changes voice, not balance; judge it on the frozen bars,
not on win rates.

**Staging sniff test (pilot gate):** the proof test
(`scripts/test-seatvoice-a.js`) is GREEN before the pilot, and the
driver `--one 113302` pilot row shows the new delivery + mercy
lines on day 83. If the pilot row shows the old lines, the fix did
not take — stop, do not run the band.

## §3. Secondary metrics (supporting, not binding)

- Charter + embassy branches: the proof test drives the charter
  branch end-to-end (staged chartered trade link + national scale)
  under both gate states; the embassy branch is proved through the
  shared helpers plus the identical call shape (the feast bundle
  never completes on this band, so no embassy delivery fires in
  the corpus — stated, not faked). All three branches' new lines
  are asserted in the test.
- Wall numbers: national / table / wins, wave-4/5 unlocks, median
  survival — reported from the after corpus, expected IDENTICAL to
  leg 2 (national 0/8, wins 0/8, median survival 150d); any move
  is a finding, since a voicing change must move nothing.
- Sense-testing: the delivery-day transcript around d83/d140 on
  both seeds, read in full (fireside + table lines, d−2 to d+3) —
  does the village now hear an honest announcement? Judge meaning,
  not counts.
- Paired-corpus diff (leg 2 vs seatvoice, same seeds): the
  instrument for this leg's before/after. This leg makes NO
  balance claim (no game-code behavior change, no lever), so no
  §15 balanced-panel compare is run — the panel is the instrument
  for balance claims, and the paired diff plus the frozen bars are
  the judge here. Said here rather than fabricating a compare.

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as leg 2, for pairing).
  Dead villages stop simulating (+10d tail max).
- **Seeds: 113301–113308** — the SAME band as leg 2 (identical
  seeds are the point: the leg-2 corpus is the control). Band
  freshness was established for leg 1; re-using the same band for
  the paired leg is the design, not contamination — the two legs
  differ only by the two `say()` strings.
- **Policies:** `competent-capstonedeliver-a` (competent verbatim +
  the tribute delivery verb only, leg-2 prereg §1). **No substrate
  flags.**
- **Instrument:** `scripts/capstoneready2-driver-a.js` unchanged,
  with `OUTDIR=evidence/2026-11-28/perseed-seatvoice-a-arm/`
  (RUN= seatvoice-a). Analyzer `scripts/analyze-seatvoice-a.js`
  (new: before/after corpus diff + the four-bar judge).
- **§15 panel:** NOT RUN — see §3 (no balance claim; the paired
  diff is the instrument).
- **PILOT ONLY.** Confirm 12–16 seeds ONLY if the pilot earns one;
  the coordinator decides from the pilot verdict.

## §5. Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on what villages actually build by day 80+, so
the fixture is the competent run itself: a geared scholar fighting
with a party, never a fresh un-geared solo scholar. The proof test
(`scripts/test-seatvoice-a.js`, GREEN before the pilot) stages a
mid-run village's ledger — two living wave-4 veterans for the
tribute, full deed legs for the open-gate cell — and reads the
lines back through the LIVE `ladderDeliverCapstone()`; the
measurement chain is what's proved, not the ledger itself.

## §6. Pre-pilot substrate checklist (§14b)

1. **Contact:** the overclaiming strings exist in code
   (`table.js:218/219, :232/233, :246/247`, verified by grep
   before this freeze) and fired on both delivery seeds in the
   leg-2 corpus (exact lines in `s113302.json` d83,
   `s113305.json` d140).
2. **Pool sizing:** the addressable pool is the 2 deliverable
   seeds — the GO bar is written against exactly those 2, not
   against "any seed delivers." The other 6 seeds are the
   determinism control (zero lines may differ).
3. **Verb existence:** the engine has the verb
   (`ladderDeliverCapstone`, Haven-panel-wired in app.js); the
   fix touches only its two `say()` strings per branch.
4. **Horizon fit:** 150d contains both delivery days (83, 140)
   with the post-delivery story visible (67 days after the 113302
   delivery; 10 days after 113305 — thin by design, reported as
   such).

## §7. Canon

`docs/CANON.md` (manifest), `docs/TABLE.md` (the full seat: deed
gate + ladder peak ≥ 3 + delivered capstone; sanctity law §8 — the
mercy window holds lives; "the table prices the run, never gates
on godhood" §62), `src/data/ladder-capstones.json` (the three
capstone deeds) read before the run. **No canon doc covers the
delivery announcement's wording** — this arm fixes the words to
match the code's own gate and mercy semantics; the frozen §1
wording is this arm's measurement convention, not a canon claim.

## §8. Metric review (to be written after the pilot — frozen bars judge as written)

- On GO the delivery announcement is honest on both delivery
  seeds, the open-gate line still fires when the gate is open,
  nothing else in the transcript moved, and the next arm is named
  from that proof (the sitting policy + national road remain the
  seat's missing half — decided by the numbers, not by
  preference). On NO-GO the voicing question stays open with the
  failing bar + mechanism diagnosis named.
- Write-flap: probe `git update-ref refs/heads/probe HEAD` before
  every material write; if it fails, stop writing and wait for the
  clear.
