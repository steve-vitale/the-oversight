# sim-tablepaths-witness-a — the WITNESS-door walk on the tableseat-nowait substrate (axis scale-onramp)

Run: fleshout-20261024T2215Z, ARM 2 (next blank #2). Worktree: `~/workspace/worktrees/sim-tablepaths-witness-a`
(branch sim-tablepaths-witness-a). Sibling lanes NOT touched: convergence tracker,
lever-claims, sim-findings.md, loop-B food-economy arms, gap-w4-narr, panel-contract-rulings.
Zero `src/js` changes — policy-side only, default-OFF instrument only, no default flips.
NEVER edited: `scripts/policies/tableseat-nowait.js`, `scripts/policies/tablepaths-nowait.js`,
`scripts/policies/leanlinkrescue.js`.

## Canon read first

- docs/CANON.md, docs/TABLE.md, docs/MONSTER-WAVES.md (present, wave law), docs/MEASUREMENT.md §§9–12, 14–15.
  Seat contract: lesser seat priced without national; indispensable is FULL-only; witness is
  lesser+ (exposed ≥ 3, ledger threshold beats); branches are ledger-earned, never a menu choice —
  this arm never overrides `tableBranch`. The witness trial plays on moot/lie-detection mechanics:
  charges from the vector, the defense calls YOUR villagers, sampled by personality, testifying in
  their own words; light = just trial, dark = show trial. No canon invented.
- Prior runs read before designing: evidence/2026-10-24/sim-tablepaths-a.md (path diversity proven;
  lesser menu offered feared, beloved, witness, assimilated, defiant, relay on BOTH seated seeds;
  witness earned at 4 exposures on 73642 and 3 on 73648 — contradicting the old 2026-10-20 note)
  and evidence/2026-10-24/sim-tableseat-round-1955.md (all 1955Z seats were Feared via first-option
  answering). The 2115Z fullseat round used the same 73641–73648 band and never walked witness.
  This arm is the witness walk that backlog fact now makes live.

## OPTION -> PATH MAPPING (from code, NOT guessed — as in sim-tablepaths-a)

- `src/js/table.js` `tableOfferPaths()`: the paths-phase modal offers ONLY earned paths, as options
  `{ id: 'path:' + p.id }`. Unearned paths are priced in the prompt text but are NOT options — a
  driver can never take an unearned door.
- Lesser-seat offered order (registration order, indispensable excluded by its full-seat floor):
  feared → beloved → witness → assimilated → defiant → relay.
- `chooseTableOption(id)` routes `path:<id>` in phase `paths` to `tableStartPath(id)`; this arm's
  override touches ONLY the paths phase. Every other phase answers the FIRST option, exactly like
  the baseline. Witness prereq (from its `table-witness.js` path definition): exposed ≥ 3.

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Arm: `scripts/policies/tablepaths-witness.js` = tableseat-nowait wrapped with a paths-phase
  answer override ONLY. `TABLEWITNESS=1` gate; gate OFF delegates to tableseat-nowait daily exactly.
- Baseline: tableseat-nowait (`TABLESEATNOWAIT=1`, leanlinkrescue courtship shared exactly),
  identical seeds, same instrument. OWN baseline replication (8) + armed (8) = 16 configs.
  No reuse of any other arm's corpus.
- Seeds (pilot): 73671–73678. Freshness verified before sweeping: no filenames for this band
  anywhere under evidence/2026-10-24 including perseed-* dirs, and no hits in
  evidence/2026-10-24/*.md. NOT reused: 73641–73648 (2115Z/tablepaths-a band), 73601–73608
  (1955Z band), or any sibling arm's band.
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- ANSWER RULE (pre-registered, deterministic, implemented exactly as written):
  at a paths-phase offer (all options `path:*`): (1) if 'witness' is offered, take it
  (rule 'witness'); (2) else take the first offered door that is NOT 'feared', in engine order
  (rule 'fallback-non-feared'); (3) else (only feared offered) take feared (rule
  'fallback-feared'; that seating is flagged fallback-Feared and does NOT count toward the
  witness GO). A door never offered is NEVER taken. Downgrade, conscript, demand-price,
  challenge beats and finals all take the first option, exactly like the baseline, so the delta
  is ONLY the door choice. Branches stay ledger-earned. The offer (offered ids + earned snapshot
  + why-strings) is recorded per seating for the NO-GO report.
- Primary: witness entered. GO requires BOTH: (a) witness entered on >= 1 seating
  (fallback-Feared seatings excluded — they walk feared, so they cannot count by construction),
  AND (b) the deciding cost bar from sim-scalemetric: starvation armed total <= control total + 2
  AND arm-only starvation <= 2 AND median days armed >= 0.8x control median.
- If the band produces 0 seatings, the verdict is PILOT-INCONCLUSIVE (not a witness kill, not a
  GO) — reported as such, NOT re-scored on another band mid-run.
- Secondary (reported, not judged): entered/won by door, fallback uses, national ever/final,
  wave reach, median days, starvation by cause, seat attempts/taken/kind/day.
- Proof gates (defined BEFORE sweeping):
  - G1 det-gate: TABLEWITNESS unset, TABLESEATNOWAIT=1: seed 73671, armed-policy days ==
    tableseat-nowait days, no wp counters. Policy loads and delegates identically when no table
    invitation is pending.
  - G2 witness-assignment leak gate: for every pilot seed where NEITHER arm entered the table,
    days and gameDays must be identical — the witness assignment changes NOTHING except the door
    answered. Any divergence on a non-seated seed is a leak and NO-GO. (Pre-national subset —
    seeds where neither arm ever reached national — reported separately.)
  - G3 corpus integrity: 16/16 rows, days > 0, counters present.
- GO → policy file lands as its own commit, default-OFF only, NO default flips (GO means
  GO CANDIDATE as an instrument, not competent play). If it GOes, lean toward [needs-eyes] —
  a new door walk is feel-adjacent. NO-GO → DELETE the policy file, land instruments + evidence
  only. PILOT-INCONCLUSIVE → policy file kept or deleted per coordinator call; evidence judges it
  inconclusive either way (this worker does not re-score it).
- Balanced panel (§15): attempt `scripts/balance-panel.js` compare on the corpus; if it throws
  (known 1955Z/2115Z failure on per-seed rows), record exactly why + sweep-compare tables as the
  §15 comparison. Do NOT chase the panel-contract lane.
- Sense-testing law: one NON-MEASURED narration-on replay read of a witness-seated (or fallback)
  seed — judge meaning/coherence/consequences, never numbers: does the witness ending read as
  witnessing, and does routine chatter resume after the finale (the known post-finale-chatter note)?

## RESULTS — GO (pilot 8+8, seeds 73671–73678, horizon 180d, death-aware)

Sweep: `node scripts/test-tablepaths-witness-sweep.js` (exit 0).
Corpus: `evidence/2026-10-24/perseed-tablepaths-witness-a/` (16/16 rows + summary.json,
per-config incremental writes via the chunked writer subprocess).
G1 det-gate: PASS (seed 73671, TABLEWITNESS unset: baseline 93/93 days ==
armed 93/93 days, wp counters empty).
G2 non-seated leak gate: PASS (4 comparable seeds — 73671, 73674, 73675, 73676 —
days and gameDays identical both arms; the witness assignment changed nothing except the
door answered). G2 pre-national subset: n/a (every seed reached national in some arm —
in fact all 8 reached national ever in both arms, so the subset is empty, not failed).
G3 corpus integrity: PASS (16/16 rows, all days > 0, counters present).
Proof test: `node scripts/test-tablepaths-witness.js` — ALL PASS (witness-offered pick,
fallback-non-feared pick, only-feared pick + flag, downgrade first-option, gate-off no
wp counters; the real delegation proof is the G1 det-gate, not the bare-mock unit case).

### Sweep-compare table (the panel substitute — see panel note below)

| metric | baseline (tableseat-nowait) | armed (tablepaths-witness) |
|---|---|---|
| n | 8 | 8 |
| won | 4 | 4 |
| median days / median gameDays | 150 / 150 | 150 / 150 |
| max days | 180 | 180 |
| national ever / final | 8 / 7 | 8 / 7 |
| table invited ever (tableWaiting) | 5 | 5 |
| table entered — total | 4 | 4 |
| entered per path — PRIMARY | feared 4 | witness 3, beloved 1 |
| won per path | feared 4 | witness 3, beloved 1 |
| witness entered / won — GO CHECK | 0 / 0 | 3 / 3 |
| fallback uses | — | fallback-non-feared 1, fallback-feared 0 |
| wave 4 / wave 5 reach | 5 / 0 | 5 / 0 |
| max arc | 4 | 4 |
| starvation deaths total | 3 | 3 |
| arm-only starvation | — | 0 |
| seat attempts / taken / failed | 4 / 4 / 0 | 4 / 4 / 0 |
| preview seen / not-ready | 17 / 7 | 17 / 7 |
| table answers | 20 | 20 |
| death totals | 261 | 261 (identical per-cause map) |

Verdict against the pre-registered bar: **GO**.
- Primary (a): witness entered 3 ≥ 1 — PASS. Fallback-Feared seatings excluded: there were
  none (0), so no exclusion was needed; the 4th seating was a fallback-non-feared Beloved win.
- Cost 1: starvation armed 3 ≤ baseline 3 + 2 — PASS.
- Cost 2: arm-only starvation 0 ≤ 2 — PASS.
- Cost 3: median days armed 150 ≥ 0.8 × 150 (= 120) — PASS.
GO means GO CANDIDATE as an instrument, default-OFF only — NOT competent play.
No default flips. The policy file lands as its own commit, with [needs-eyes] (a new door
walk is feel-adjacent, per the pre-registered lean).

### Per-seed detail (what actually happened)

- Witness-seated + won, paired identically except the door: 73672 (seat day 106, lesser;
  baseline feared/light, armed witness/light via the `witness` rule — 3 exposures on the
  record, "The docket is real"); 73673 (seat day 134, lesser; baseline feared/light, armed
  witness/light — 6 exposures); 73677 (seat day 98, lesser; baseline feared/light, armed
  witness/light — 3 exposures). All three witness walks are light-branch.
- Fallback exercised, honestly: 73678 (seat day 150, lesser) — witness NOT earned (1 exposure:
  "You didn't keep the list (1 exposures on record — the trial needs 3)"), so the rule fell
  back to the first non-Feared door offered, beloved (viewership 25, fan favor 76), and won
  light. The fallback is not hypothetical anymore: it converts a witness-miss into a Beloved win.
- Fallback-feared never exercised (0 seatings offered only Feared) — that rule arm is still
  untested on a live seating, only in the unit proof test.
- The full lesser menu was offered on all three witness seatings, in engine order:
  feared, beloved, witness, assimilated, defiant, relay (indispensable correctly absent —
  full-seat floor). The earned snapshots prove witness was earned, not forced: beloved earned
  on all three too (viewership 52/40/38, fan favor 22/39/33), defiant 7/7/5, relay stage-3.
- No other seed seated: 73671 died day 93 (village-lost, wave 4, arc 3, both arms);
  73674/73675 survived to 180 at arc 3 with no table (Arc IV gates the table, as in 1955Z/2115Z);
  73676 reached national, saw tableWaiting, but never previewed a seat in either arm
  (no preview counters at all — the invitation arrived but no seat leg ever fired a preview;
  identical both arms, so it is a substrate fact, not a witness-rule effect) and died day 174
  (village-lost, decayed to regional).
- Paired rows are IDENTICAL on every seed except the door walked: same days, same end reasons,
  same death totals per seed (37/43/34/23/22/40/20/42), same seat days, same preview counts.
- Death-cause shares are identical between arms (261 deaths each): villager combat 106,
  villager villager-combat 71, player arena 38, villager expedition 16, villager monster 11,
  starvation 3 (73672 villager 1 + 73675 villager 1 + 73678 villager 1 — same both arms),
  sickness 3, ambush 3, plus singles. The door rule adds no death anywhere.
- Wave 5: 0/8 both arms — untouched by this arm. Wave 4: 5/8 both arms.
  National reach itself is unchanged by the door rule (8/8 ever, 7/8 final, both arms) — the
  door moves WHICH ending the seat converts to, not scale. This band is stronger on scale than
  the 2115Z band (national ever 8/8 vs 7/8, seatings 4/8 vs 2/8) but the wave-5 wall stands.

### Village assessment (plain words)

The village that sits down can now win by bearing witness. On these seeds the leanlinkrescue
village climbs, gets invited, and the old rule walked it through the Feared door every time.
Give the same village a rule that answers "witness" when the docket is real, and three of the
four invitations turn into trials of the judges — the village that kept the list gets to read
it aloud, in public, with its own ledger in evidence beside theirs — and wins, light-branch,
all three times, with no extra starvation, no shorter life, and not one death moved. The fourth
invitation is the honest miss that proves the fallback works: the village that kept only one
exposure could not walk the witness door, so it walked Beloved instead and still won — the
rule degrades gracefully instead of forcing a door or falling back to terror. What the door
does NOT do: it does not create invitations, move scale, or open wave 5 — those walls stand
exactly where they stood.

### Sense-testing read (NON-MEASURED replay, seed 73672, armed, narration on)

File: `evidence/2026-10-24/sim-tablepaths-witness-a-sense.txt` (265 lines; seat day 106
and witness/light match the measured run — narration did not diverge the timing).
Judgment — meaning, coherence, consequences:
- The witness walk reads as witnessing, not as a reskinned negotiation. Day 106: the audit
  reads the REAL run back ("a lesser seat — global standing, waves 1–3 faced (17/10/6), with
  1 wave-4 fought, 12 contests survived, 3 crises weathered"), the war-path bars honestly show
  wave 4/5 unmet, sanctity voiced ("EVERYONE. SIT. WATCH."). The door grants read as the
  trial's instruments: Docket ("The list is complete and paginated"), Subpoena, Clean Hands
  ("You submit your own ledger as evidence too"), Precedent.
- The beats follow the canon trial shape: "You didn't come to negotiate. You came with a list.
  Every bribe, every buried plot, every 'rounding error' — including theirs. The judges are
  about to be judged." The first-option answers (the baseline's beat/final rule, unchanged
  here) play sensibly for a light walk: read the charges cold ("no heat, no adjectives. The
  charges land harder for it. One of the judges flickers"), let the defense's witnesses speak
  ("The courtroom respects nothing the way it respects a prosecutor who doesn't flinch at
  their own witnesses"), refuse the private settlement ("In public, or not at all. The
  precedent is set — the galaxy's court has a new first page, and your name is on it").
- The final resolves and plants at once: "Read the charges" → "Justice, at last, with an
  audience... Your own ledger sits in evidence beside theirs. That's why it worked." The
  epilogue names the bearer (Aroha Ngata walks out of the light alone, "with every charge read
  aloud and answered, the ledger closed and clean") and — the known non-hosts thread, by
  design — leaves the stasis kids unasked-for ("in rows of humming glass, the little ones are
  still napping. You never asked. Not once."). That is the witness ending's honest cost, not
  a gap in the walk: the trial closes the ledger, it does not bring the Taken home.
- Post-finale chatter note, same class as 1955Z/2115Z: after the win line, the ring continues
  with same-day butchering/loot lines ("The body is stripped. What's left isn't worth taking.")
  — routine activity resumes immediately inside the finale day, slightly undercutting finality.
  Documented, not a defect in the door walk.

### Balanced panel (§15) — attempted, does NOT ingest this corpus

Attempted: `node scripts/balance-panel.js compare --before
evidence/2026-10-24/perseed-tablepaths-witness-a/summary.json --after <same>
--out evidence/2026-10-24/panel-tablepaths-witness-a`. Result: the compare threw the SAME
`TypeError: Cannot read properties of undefined (reading 'days')` in
`scripts/lib/balance-scorecard.js` `comparePanels` (balance-panel.js:279) as in 1955Z and
2115Z, and wrote no output. Why, exactly: panel `compare` requires panel-driver output
(panel.json.gz with observer digests, contract digests, per-policy panel records), not
per-seed sweep rows. The sweep-compare tables above are the before/after comparison for this
run, on identical seeds, judged against the pre-registered bar. Not chased — the
panel-contract lane owns that fix.

### Metric review

- The pre-registered bar worked as written; no mid-run re-scoring. The per-path primary
  (witness entered, not entered total) was the right call: entered total is 4 vs 4 and says
  nothing — entered per path is the whole result.
- The fallback accounting worked as designed: fallback-non-feared exercised (1) and reported
  separately from witness entered; fallback-feared (0) reported, not hidden. The fallback-feared
  rule remains live-untested — a future band where only Feared is offered would test it, but
  this run does not claim it.
- "Median days" as a cost bar was non-binding here (150 vs 150 — winners end at 98/106/134/150
  but the median seed survives to 150 both arms). The 1955Z note stands: median-among-non-winners
  would be a cleaner cost metric for stronger future arms.
- G2's non-seated formulation (stronger than the pre-national subset in 2115Z) held on all 4
  non-seated seeds and is the right leak gate for door-only arms: it catches any wrapper effect
  on seeds where the door never fires.
- New metric note for the NEXT seat arm: record the OFFERED menu + earned snapshot on every
  seating (this arm's `wpOffers`), not just the walked path — the 73678 miss (1 exposure) is
  exactly the case where the menu distinguishes "door locked" from "door hidden."

### Findings outside this arm (reported, NOT touched)

- Witness IS earned and winnable on the leanlinkrescue substrate (3/3 witness seatings won,
  light-branch) — the 2026-10-20 "never earned" note is now doubly contradicted (2115Z proved
  earned; this arm proves won).
- Fallback-non-feared converts a witness-miss into a Beloved win (73678) — the fallback rule
  from sim-tablepaths-a is load-bearing, not decorative.
- Post-finale routine chatter resumes immediately (same note as 1955Z/2115Z).
- Balance-panel ingestion gap persists (same throw as 1955Z/2115Z) — live panel-contract
  lane's item, not touched.
- 73676-class invitation without preview: a village can see tableWaiting yet never get a
  preview in either arm — worth a look by a future seat-leg arm, not chased here.

### Convergence state

Axis scale-onramp: this arm GOES as a GO CANDIDATE instrument (door diversity extended:
witness entered 3/3 seatings offered it and won 3/3, at zero measured cost). The scale wall
itself is untouched by the door rule (national ever/final, wave 4/5 identical both arms) —
the directive stands until the tracker records this axis converged on measured evidence.
Next blanks, in order: (1) full-seat reachability (still untested — all seats here lesser);
(2) the fallback-feared rule on a live only-Feared seating; (3) the 73676 invitation-without-
preview case.


