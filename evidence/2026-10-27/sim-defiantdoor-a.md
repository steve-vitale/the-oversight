# sim-defiantdoor-a — the DEFIANT-door walk on the tableseat-nowait substrate (axis scale-onramp)

Run: fleshout-20261027T1315Z. Worktree: `~/workspace/worktrees/sim-defiantdoor-a`
(branch sim-defiantdoor-a). Zero `src/js` changes — policy-side only, default-OFF
instrument only, no default flips.
NEVER edited: `scripts/policies/tableseat-nowait.js`,
`scripts/policies/tablepaths-nowait.js`, `scripts/policies/leanlinkrescue.js`,
`scripts/policies/tablepaths-witness.js`, or any `src/js` file.

## Canon read first

- docs/CANON.md, docs/TABLE.md (the Defiant section), docs/MEASUREMENT.md
  §§9–12, 14–15. Seat contract: lesser seat priced without national;
  indispensable is FULL-only; defiant is lesser+ with ledger defiance >= 4
  (`src/js/table-defiant.js` prereq, minSeat lesser); branches are
  ledger-earned, never a menu choice — this arm never overrides
  `tableBranch`. The Defiant walk, per TABLE.md: a reverse auction against
  yourself — tribute shipments (food, the pantry feels it), the relay's
  person (a named villager goes to the relay), de-integration (lose
  integration stages, abilities go dark). Light = priced freedom (pay and
  walk clean); dark = scorched earth. Failure = can't pay → the walk stalls
  at the door → downgrade to Assimilated or Witness. No canon invented.
- Prior runs read before designing: evidence/2026-10-24/sim-tablepaths-witness-a.md
  (witness seatings there carried earned snapshots showing defiant earned at
  7/7/5 on its three seated seeds — defiant is earned on this substrate, not
  hypothetical) and the coordinator's brief (doors walked at the lesser seat
  so far: feared, assimilated, relay, witness, beloved; defiant the one
  remaining lesser door NEVER walked; the 2115Z rotation ASSIGNED defiant but
  only assimilated/relay seatings actually happened on that band — assignment
  is not a walk). This arm closes that gap.

## OPTION -> PATH MAPPING (from code, NOT guessed)

- `src/js/table.js` `tableOfferPaths()`: the paths-phase modal offers ONLY
  earned paths, as options `{ id: 'path:' + p.id }`. Unearned paths are priced
  in the prompt text but are NOT options — a driver can never take an
  unearned door.
- Lesser-seat offered order (registration order, indispensable excluded by
  its full-seat floor): feared → beloved → witness → assimilated →
  defiant → relay.
- `chooseTableOption(id)` routes `path:<id>` in phase `paths` to
  `tableStartPath(id)`; this arm's override touches ONLY the paths phase.
  Every other phase answers the FIRST option, exactly like the baseline.
  Defiant prereq (from its `table-defiant.js` path definition): ledger
  defiance >= 4, minSeat lesser.

## PRE-REGISTRATION (binding — written BEFORE sweeping, in sim-defiantdoor-a-prereg.md, judged against it, never re-scored)

- Arm: `scripts/policies/tablepaths-defiant.js` = tableseat-nowait wrapped
  with a paths-phase answer override ONLY. `TABLEDEFIANT=1` gate; gate OFF
  delegates to tableseat-nowait daily exactly.
- Baseline: tableseat-nowait (`TABLESEATNOWAIT=1`, leanlinkrescue courtship
  shared exactly), identical seeds, same instrument. OWN baseline
  replication, never another arm's corpus.
- Pilot seeds: 74101–74108. Freshness verified before sweeping: grep of
  evidence/2026-10-27/*.md and per-seed corpus filenames found NO collision
  for 74101–74108 (73671–73678 heavily reused today, 73661–73668 collided
  with pantrystarve corpora — both avoided).
- Confirm seeds (fresh, separate, never blended with pilot): 74111–74122.
  Checked against evidence/2026-10-27/*.md before sweeping — no hits.
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- ANSWER RULE (pre-registered, deterministic, implemented exactly as
  written): at a paths-phase offer (all options `path:*`): (1) if 'defiant'
  is offered, take it (rule 'defiant'); (2) else take the first offered
  door that is NOT 'feared', in engine order (rule 'fallback-non-feared');
  (3) else (only feared offered) take feared (rule 'fallback-feared'; that
  seating is flagged fallback-Feared and does NOT count toward GO). A door
  never offered is NEVER taken. Downgrade, conscript, demand-price,
  challenge beats and finals all take the first option, exactly like the
  baseline, so the delta is ONLY the door choice. Branches stay
  ledger-earned. The offer (offered ids + earned snapshot + why-strings)
  is recorded per seating.
- Primary: defiant entered. GO requires BOTH: (a) defiant entered on >= 1
  seating (fallback-Feared seatings excluded — they walk feared, so they
  cannot count by construction), AND (b) the deciding cost bar from
  sim-scalemetric: starvation armed total <= baseline total + 2 AND
  arm-only starvation <= 2 AND median days armed >= 0.8x baseline median.
- If the defiant door is never OFFERED on the band (defiance < 4
  everywhere), that is a NO-GO with the mechanism named — do not force it,
  do not re-score. If the band produces 0 seatings at all, the verdict is
  PILOT-INCONCLUSIVE (not a defiant kill, not a GO).
- Secondary (reported, not judged): entered/won per door, national
  ever/final, wave-4/5 reach, deaths, prices paid on defiant walks.
- Proof gates (defined BEFORE sweeping):
  - G1 det-gate: TABLEDEFIANT unset, TABLESEATNOWAIT=1: seed 74101, armed
    policy days == tableseat-nowait days, no dp counters.
  - G2 leak gate: for every pilot/confirm seed where NEITHER arm entered
    the table, days and gameDays must be identical — the door assignment
    changes NOTHING except the door answered.
  - G3 corpus integrity: every config produced a row, no zero-day rows.
- GO → policy file lands as its own commit, default-OFF only, NO default
  flips (GO means GO CANDIDATE as an instrument, not competent play),
  with [needs-eyes] — a new door walk is feel-adjacent. NO-GO → DELETE
  the policy file, land instruments + evidence only.

## RESULTS — GO (pilot 8+8 AND confirm 12+12, reported separately, never blended)

Sweep: `node scripts/test-tablepaths-defiant-sweep.js` (exit 0, both bands).
Corpus: `evidence/2026-10-27/perseed-defiantdoor-a/` (pilot: 16/16 rows +
summary.json) and `evidence/2026-10-27/perseed-defiantdoor-confirm-a/`
(confirm: 24/24 rows + summary.json), per-config incremental writes via the
chunked writer subprocess.
G1 det-gate: PASS (seed 74101, TABLEDEFIANT unset: baseline 121/121 days ==
armed 121/121 days, dp counters empty).
Proof test: `node scripts/test-tablepaths-defiant.js` — ALL PASS
(defiant-offered pick, defiant-absent fallback, only-feared pick + flag,
downgrade first-option, gate-off no dp counters; the real delegation proof
is the G1 det-gate, not the bare-mock unit case).

### Pilot sweep-compare table (seeds 74101–74108)

| metric | baseline (tableseat-nowait) | armed (tablepaths-defiant) |
|---|---|---|
| n | 8 | 8 |
| won | 3 | 3 |
| median days / median gameDays | 121 / 121 | 121 / 121 |
| max days | 180 | 180 |
| national ever / final | 6 / 5 | 6 / 5 |
| table invited ever (tableWaiting) | 4 | 4 |
| table entered — total | 3 | 3 |
| entered per path — PRIMARY | feared 3 | defiant 2, beloved 1 |
| won per path | feared 3 | defiant 2, beloved 1 |
| defiant entered / won — GO CHECK | 0 / 0 | 2 / 2 |
| fallback uses | — | fallback-non-feared 1, fallback-feared 0 |
| wave 4 / wave 5 reach | 5 / 0 | 5 / 0 |
| max arc | 4 | 4 |
| starvation deaths total | 3 | 3 |
| arm-only starvation | — | 0 |
| seat attempts / taken / failed | 3 / 3 / 0 | 3 / 3 / 0 |
| preview seen / not-ready | 4 / 1 | 4 / 1 |
| table answers | 15 | 17 (defiant has 4 beats vs feared 3: +1 per defiant seating × 2) |
| death totals | 239 | 239 (identical per-cause map) |

Verdict against the pre-registered bar: **GO (pilot)**.
- Primary (a): defiant entered 2 ≥ 1 — PASS. Fallback-Feared seatings
  excluded: there were none (0), so no exclusion was needed.
- Cost 1: starvation armed 3 ≤ baseline 3 + 2 — PASS.
- Cost 2: arm-only starvation 0 ≤ 2 — PASS.
- Cost 3: median days armed 121 ≥ 0.8 × 121 (= 96.8) — PASS.
- G2 non-seated leak gate: PASS (5 comparable seeds — days and gameDays
  identical both arms). G2 pre-national subset: PASS (2 seeds).
- G3 corpus integrity: PASS (16/16 rows, all days > 0, counters present).

### Confirm sweep-compare table (seeds 74111–74122, same substrate, same rules)

| metric | baseline (tableseat-nowait) | armed (tablepaths-defiant) |
|---|---|---|
| n | 12 | 12 |
| won | 7 | 7 |
| median days / median gameDays | 125 / 125 | 125 / 125 |
| max days | 175 | 175 |
| national ever / final | 11 / 9 | 11 / 9 |
| table invited ever (tableWaiting) | 7 | 7 |
| table entered — total | 7 | 7 |
| entered per path — PRIMARY | feared 7 | defiant 7 |
| won per path | feared 7 | defiant 7 |
| defiant entered / won — GO CHECK | 0 / 0 | 7 / 7 |
| fallback uses | — | fallback-non-feared 0, fallback-feared 0 |
| wave 4 / wave 5 reach | 5 / 0 | 5 / 0 |
| max arc | 4 | 4 |
| starvation deaths total | 1 | 1 |
| arm-only starvation | — | 0 |
| seat attempts / taken / failed | 7 / 7 / 0 | 7 / 7 / 0 |
| preview seen / not-ready | 8 / 1 | 8 / 1 |
| table answers | 35 | 42 (defiant 4 beats vs feared 3: +1 per seating × 7) |
| death totals | 356 | 356 (identical per-cause map) |

Verdict against the same pre-registered bar: **GO (confirm)**.
- Primary (a): defiant entered 7 ≥ 1 — PASS.
- Cost 1: starvation armed 1 ≤ baseline 1 + 2 — PASS.
- Cost 2: arm-only starvation 0 ≤ 2 — PASS.
- Cost 3: median days armed 125 ≥ 0.8 × 125 (= 100) — PASS.
- G2 non-seated leak gate: PASS (5 comparable seeds). G2 pre-national
  subset: PASS (1 seed). G3 corpus integrity: PASS (24/24 rows).

### Per-seed detail — pilot (what actually happened)

- Defiant-seated + won, paired identically except the door: 74104 (seat
  day 96, lesser; baseline feared/light, armed defiant/light via the
  `defiant` rule — defiance 9, "Defiance 9 on the record. The 'no' is
  earned."; meters dignity 3, paid 9; beat 4); 74107 (seat day 108, lesser;
  baseline feared/light, armed defiant/light — defiance 6; meters dignity
  3, paid 9; beat 4). All defiant walks light-branch.
- Fallback exercised, honestly: 74106 (seat day 91, lesser) — defiant NOT
  earned (defiance 3: "The table doesn't believe your 'no' yet (defiance 3,
  needs 4)"), so the rule fell back to the first non-Feared door offered,
  beloved (viewership 49, fan favor 43), and won light. The fallback is
  not hypothetical: a one-point defiance miss converts into a Beloved win
  instead of a forced door. This is the exact miss case the pre-registration
  demanded be reported as mechanism, not hidden.
- The full lesser menu was offered on both defiant seatings, in engine
  order: feared, beloved, witness, assimilated, defiant, relay
  (indispensable correctly absent — full-seat floor). The earned snapshots
  prove defiant was earned, not forced: witness earned on both too
  (4 and 5 exposures), beloved earned on both, relay stage-3 on both.
- Fallback-feared never exercised (0 seatings offered only Feared) — that
  rule arm is still untested on a live seating, only in the unit proof test.
- No other pilot seed seated: 74101 died day 121 (village-lost, wave 4,
  arc 3, both arms); 74102/74105 survived to 180 at arc 3 with no table
  (Arc IV gates the table); 74103 saw tableWaiting but never entered
  (invitation without seating, identical both arms — a substrate fact, not
  a door-rule effect) and died day 138; 74108 died day 68 (village-lost,
  wave 2, arc 3, both arms).
- Paired rows are IDENTICAL on every pilot seed except the door walked:
  same days, same end reasons, same death totals per seed
  (45/36/36/16/24/23/31/28), same seat days, same preview counts.
- Death-cause shares are identical between arms (239 deaths each):
  villager combat 93, villager villager-combat 53, player arena 45,
  villager expedition 14, villager monster 9, villager sickness 10,
  starvation 3 (74102 villager 1 + 74107 player 1 + 74108 villager 1 — same
  both arms), plus singles. The door rule adds no death anywhere.
- Wave 5: 0/8 both arms — untouched by this arm. Wave 4: 5/8 both arms.
  National reach itself is unchanged by the door rule (6/8 ever, 5/8
  final, both arms) — the door moves WHICH ending the seat converts to,
  not scale.

### Per-seed detail — confirm (what actually happened)

- Defiant-seated + won, all 7 seatings, all light-branch, all meters
  dignity 3 / paid 9, beat 4: 74115 (seat day 90, defiance 7; menu without
  witness — feared, beloved, assimilated, defiant, relay); 74116 (seat day
  93, defiance 7; menu without witness); 74117 (seat day 131, defiance 8;
  full menu); 74118 (seat day 122, defiance 8; full menu); 74120 (seat day
  125, defiance 8; full menu); 74121 (seat day 136, defiance 9; menu
  without witness); 74122 (seat day 170, defiance 13; menu without
  witness). No fallback was needed on the confirm band — defiant was
  offered on every seating, and the rule took it every time.
- Paired rows are IDENTICAL on every confirm seed except the door walked:
  same days, same end reasons, same death totals per seed
  (30/36/50/49/18/22/26/28/26/18/26/27). Death-cause shares identical
  between arms (356 deaths each), starvation 1 each (74119 player 1).
- Non-seated confirm seeds: 74111 died day 153, 74112 day 88, 74113 day 175,
  74114 day 114, 74119 day 118 — all village-lost, arc 3, no table in
  either arm. The door rule creates no invitations: where the village
  never sits, both arms end identically.
- Wave 5: 0/12 both arms. Wave 4: 5/12 both arms. National ever 11/12,
  final 9/12, both arms — the confirm band is stronger on scale than the
  pilot band, and the door rule still moves only the ending, not scale.

### Prices paid on defiant walks (secondary, reported)

- Census meters on every defiant walk, pilot + confirm: dignity 3,
  paid 9 — the maximum-paid light walk (all prices paid, none dodged).
  First-option beat answers explain it: the tribute beat's first option
  is the full harvest (20,000 kcal), the relay-person beat's first option
  names the village's most-trusted villager, and the de-integration beat's
  first option pays it. Paid 9 = 3 + 3 + 3 across the three price beats
  (the fourth beat is the final choice).
- Named price, pilot sense seed 74104: Guadalupe, named for the relay
  ("They nod — they've known since the price list slid across. The relay
  gets its hands. The village loses its steadiest."). The census rows do
  not carry the relay-taken name (the full table state as exposed by
  `tableState()` ends at meters/branch/abils), so names are reported only
  where the sense transcript names them — no name is claimed for any
  other walk.

### Village assessment (plain words)

The village that sits down can now walk out. On these seeds the
leanlinkrescue village climbs, gets invited, and the old rule walked it
through the Feared door every time. Give the same village a rule that
answers "defiant" when the 'no' is earned, and nine of the ten invitations
across both bands turn into priced walk-aways — the village that said no
often enough gets to say it in public, pay for it in full, and leave
poorer, whole, and free — and wins, light-branch, all nine times, with no
extra starvation, no shorter life, and not one death moved. The tenth
invitation is the honest miss that proves the rule does not force a door:
the village one defiance point short of the bar could not walk Defiant,
so it walked Beloved instead and still won — the rule degrades gracefully
instead of forging an unearned 'no'. What the door does NOT do: it does not
create invitations, move scale, or open wave 5 — those walls stand exactly
where they stood. With defiant walked, all six lesser doors have now been
walked on this substrate (feared, assimilated, relay, witness, beloved,
defiant); only indispensable, which needs the full seat, remains unwalked
— and that one is a scale problem, not a door problem.

### Sense-testing read (NON-MEASURED replay, seed 74104, armed, narration on)

File: `evidence/2026-10-27/sim-defiantdoor-a-sense.txt` (259 lines; seat
day 96 and defiant/light match the measured run — narration did not
diverge the timing).
Judgment — meaning, coherence, consequences:
- The walk reads as a real refusal with real prices, not as
  menu-clicking. Day 95: "The table is being set — a lesser seat, priced
  for what you built." Day 96: the audit reads the REAL run back ("A
  lesser seat — global standing, waves 1–3 faced (14/9/4), 10 contests
  survived, 2 crises weathered. The table does not rise. It prices."),
  sanctity voiced ("EVERYONE. SIT. WATCH. The teeth and the weather can
  WAIT"), and the war-path bars honestly show wave 4/5 unmet ("blood your
  fighters (0 of 1 veterans)", "armor the village (2 of 4 fighters
  armored)"). The door grants read as the walk's instruments: Empty Hands
  ("You came with nothing to take"), Long Road ("Once, the walk covers a
  price you cannot pay"), Paid in Full, Door Ajar ("Others can follow
  where you walk. The walk is a road, not a door.").
- The prices land as people and things, in order: the full harvest ("A
  full harvest. The ships load heavy. Haven's shelves echo."), the
  relay's person ("You name Guadalupe. They nod — they've known since
  the price list slid across. The relay gets its hands. The village loses
  its steadiest. Some prices you pay forever, in installments of
  grief."), de-integration ("You let it take the overlay. The HUD dies
  first — then the warmth, then the quiet voice that helped.
  De-integration: the world gets bigger and colder and *yours* again, all
  at once."), and the name price ("You pay it — the name, spelled right,
  in the eternal record. Small price. Walking out, you realize: they'll
  remember the name. They'll never own it. That was the whole trick.").
- The final resolves and plants at once: "Walk away." → "Humanity walks
  — poorer, whole, free. The cameras follow for years: the long shot of
  small figures leaving the light... The door stays ajar. Guadalupe walks
  with the relay now — the price, named and paid." The epilogue names
  the bearer (Varvara Tarasenko "walks out of the light alone, which is
  how she walked in — and keeps walking, because she paid every price and
  said no twice") and — the known non-hosts thread, by design — leaves
  the stasis kids unasked-for ("in rows of humming glass, the little ones
  are still napping... You never asked. Not once."). That is the defiant
  ending's honest cost, not a gap in the walk: the walk leaves, it does
  not bring the Taken home.
- Villagers act like people around the table: the day before the seat,
  Quinn teaches Bracken Fiddlehead by the fire, Guadalupe fetches water,
  Ella checks a full pantry and turns to the wood run instead — the
  village does ordinary, sensible things right up to the invitation,
  and the seat interrupts them rather than replacing them.
- Repeated/generic notes, same class as the witness arm: after the win
  line, the ring continues with routine same-day lines (fish assignments
  for Miguel, Ella, Quinn) — routine activity resumes immediately inside
  the finale day, slightly undercutting finality. Documented, not a
  defect in the door walk. No repeated or generic lines inside the walk
  itself — each price beat is voiced distinctly, with a named person on
  the relay price.

### Balanced panel (§15) — attempted, does NOT ingest this corpus

Attempted: `node scripts/balance-panel.js compare --before
evidence/2026-10-27/perseed-defiantdoor-a/summary.json --after <same>
--out /tmp/panel-defiantdoor-test`. Result: the compare threw the SAME
`TypeError: Cannot read properties of undefined (reading 'days')` in
`scripts/lib/balance-scorecard.js` `comparePanels` (balance-panel.js:279)
as in 1955Z, 2115Z, and the witness arm, and wrote no output. Why,
exactly: panel `compare` requires panel-driver output (panel.json.gz with
observer digests, contract digests, per-policy panel records), not
per-seed sweep rows. The sweep-compare tables above are the before/after
comparison for this run, on identical seeds, judged against the
pre-registered bar. Not chased — the panel-contract lane owns that fix.

### Metric review

- The pre-registered bar worked as written; no mid-run re-scoring. The
  per-path primary (defiant entered, not entered total) was the right
  call: entered total is 3 vs 3 (pilot) and 7 vs 7 (confirm) and says
  nothing — entered per path is the whole result.
- The fallback accounting worked as designed: fallback-non-feared
  exercised (1, pilot) and reported separately from defiant entered;
  fallback-feared (0, both bands) reported, not hidden. The
  fallback-feared rule remains live-untested — a future band where only
  Feared is offered would test it, but this run does not claim it.
- "Median days" as a cost bar was non-binding here (121 vs 121 pilot,
  125 vs 125 confirm — paired rows identical, so the bar passes by
  construction for a door-only arm). The witness arm's note stands:
  median-among-non-winners would be a cleaner cost metric for stronger
  future arms.
- The offer + earned-snapshot recording (the witness arm's "metric note
  for the NEXT seat arm") proved its worth here: the 74106 miss (defiance
  3, needs 4) is exactly the case where the menu distinguishes "door
  locked" from "door hidden" — and the confirm band's menus without
  witness (74115/74116/74121/74122) show the same recording catching
  ordinary menu variation.
- New note for the NEXT seat arm: the census `tableState()` record ends
  at meters/branch/abils and does not carry the relay-taken name, so
  price names can only be reported from sense transcripts. If a future
  arm needs per-walk price names in the census, the instrument — not the
  game — needs a wider capture.
- Confirm-band strength note: confirm national ever 11/12 vs pilot 6/8
  and seatings 7/12 vs 3/8 — band-to-band variation is large, which is
  why the pre-registration forbids judging against another run's band.
  Both bands were judged only against their own fresh baselines.

### Findings outside this arm (reported, NOT touched)

- Defiant IS earned and winnable on the leanlinkrescue substrate (9/9
  defiant seatings won, light-branch, across pilot + confirm) — the last
  unwalked lesser door is now walked. All six lesser doors have been
  walked on this substrate.
- Fallback-non-feared converts a one-point defiance miss into a Beloved
  win (74106) — the fallback rule is load-bearing, not decorative.
- Post-finale routine chatter resumes immediately (same note as
  1955Z/2115Z/witness).
- Balance-panel ingestion gap persists (same throw as 1955Z/2115Z/witness)
  — live panel-contract lane's item, not touched.
- 74103-class invitation without seating: a village can see tableWaiting
  yet never enter in either arm — worth a look by a future seat-leg arm,
  not chased here.
- Wave 5: 0/20 across both bands — the scale wall stands; a door arm
  cannot move it.

### Convergence state

Axis scale-onramp: this arm GOES as a GO CANDIDATE instrument (door
diversity complete for the lesser seat: defiant entered 2/3 pilot
seatings and 7/7 confirm seatings, won 9/9, at zero measured cost). The
scale wall itself is untouched by the door rule (national ever/final,
wave 4/5 identical both arms in both bands) — the directive stands until
the tracker records this axis converged on measured evidence.
Next blanks, in order: (1) full-seat reachability (still untested — all
seats here lesser; indispensable unwalked because the full seat is a
scale problem); (2) the fallback-feared rule on a live only-Feared
seating; (3) the 74103 invitation-without-seating case.
