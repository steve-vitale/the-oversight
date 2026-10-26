# sim-scale-onramp-round-1230 — coordinator evidence (axis scale-onramp)

Run: fleshout-20261026T1230Z (Mon 2026-10-26 ~07:30 CDT onward).
Axis: scale-onramp (converging). Loop B live on food-economy for the
whole run (1130Z claim, reminder-b + noelig-lean-b; B's coordinator
evidence landed mid-run as ac98043a1) — NOT touched. Playtest loop
live on journey-scale — NOT touched. This run worked scale-onramp,
taking the 1146Z run's named next blanks in order: (6) wave-3 bar
re-derivation on the current base, (2) wound-closure pricing paper,
(4) defender-fight narration boilerplate + wait-line repetition
(sense arm). Blanks (1) choice-price ruling and (3) melt ruling are
steve-calls — skipped, not re-measured. Blank (5) (transient hunt
needs more seeds / first-night stressor) not taken this run.

## PRE-REGISTRATION (binding — judged only against this)

- Question: on the current base, what blocks the table after the
  surge deed, what does closing the wound mill cost, and what does
  the player actually hear from defender fights and waiting?
- Substrates: w3rederive — anchor (tableseat-nowait) vs hunt
  (feastdraw-driveoff-clean) columns, seeds 73901–73908, 180d
  death-aware; woundprice — tableseat-nowait, seeds 73671–73678,
  180d death-aware; defnarr — tableseat-nowait, seeds 73671–73678,
  180d death-aware. Worktree base for all three arms: ac98043a1.
  Every arm's claim below carries that base qualifier.
- GO bars: per-arm pre-registrations in the arm evidence files
  (w3rederive DIAG-GO legs, woundprice paper-GO legs, defnarr
  sense-GO legs). This round is DIAG + paper + sense only: zero
  src/js landed by design, no lever moved, no game-code change
  proposed in this round. A miss on any arm leg = that arm's
  verdict flips, never re-scored mid-run.
- Primary metric: the wall (national / table / wins, wave-4/5
  reach, median survival) on each arm's own judged corpus.
- Metric review: see the section at the end. No metric was
  re-scored mid-run. Woundprice Stage-2 numbers are RESTATED from
  defwound Stage 2 (the rule is KILLED; it was not re-run).
  Defnarr's measured-stream zero wait lines is a method finding
  (sweeps silence Game.say), not a missed leg — the arm proved a
  faithful harvest method and used it.

## Arm 1 — sim-woundprice-a (4e6b4fdfc, proof: defwound-diag 25/25
## + analyzer exit 0, post-rebase and on merged master): PAPER-GO

The wound-closure pricing paper, for Steve's met-below-line ruling.
Stage 1 re-derived on ac98043a (defwound Stage 1 in brackets):
defender fights 311 [322] — mFlee 243, vFlee 32, vKill 34, vDie 2.
mFlee-below-line events 240 [260]: MANUFACTURED 44 [56] (w1 29,
w2 14, w3 1) and PRE-WOUNDED 196 [204] (w1 133, w2 57, w3 6).
Re-meets 881 [877], ALL rounds-0, 0 finished. Field fights on the
same band: below-line 467, manufactured 78, pre-wounded 389.
Fates of 103 entities: still-present 53, player-kill 28,
player-melt 16, departure 6.
Base-drift evidence (not silent acceptance): the det-gate
trajectory itself moved with recorders OFF (177d / tsNationalDay 86
here vs 180d / 77 on defwound's base); per-seed fates moved both
ways (73672 won d97 -> lost d116; 73676 lost d70 -> lost d156).
The mill's structure is stable across the move, so the pricing
stands; a future arm must re-baseline on current master, never
judge against 234/4/8.

Pricing (the paper's core):
- Round cost: defwound Stage 2 (old base, restated, NOT re-run)
  +1 round per manufactured fight, 8/8 first-divergence fights.
  Recomputed on this base: manufactured fights (n=44) run
  median 3 rounds, mean 3.16 — +44 rounds band-wide, +31.7% mean
  per manufactured fight. (One analyzer bug found and fixed
  mid-run: the first cut counted the manufactured flag on vKill
  rows, n=78; corrected to mFlee below-line ends, n=44,
  reconciled exactly.)
- Death ledger (Stage 2, restated): mixed deaths 234 -> 316 (+35%)
  vs guard <=257; wins 4/8 -> 3/8 vs guard >=4/8. A companion
  must save >=59 deaths (72% of the 82 excess) AND recover >=1
  win, assuming additivity (flagged as an assumption).
- Companion coverage: NO, on measured numbers. Fieldguard
  (different band/base) saved 7 kind-filtered villager deaths
  (27 -> 20) while its mixed total ROSE 261 -> 272 — 7/59 = 12%
  of the gap, on the wrong metric, and it covers field entry
  while the Stage-2 cascade is raid deaths (vDie 0 -> 3, refilled
  raid slots). Fieldguard was also killed on its own median leg,
  so it cannot land as-is. Only a bundled run with its own
  guards could prove otherwise.
- Met-below-line residual (this base): 196 defender events
  (81.7% of the mill), 674 re-meets, all rounds-0, 0 finished —
  4.5x the manufactured set. A met-finish rule converts
  zero-round phantoms into real fights at unknown cost; the
  narrow rule's +1-round price does not price it.

Sense read (73671): a d17 hushwolf manufacture (1.00 -> 0.12,
2 rounds) never re-meets and is still present at run end; a
nightcourt met chain echoes 5x at rounds-0 (d34–d79, 0.11 -> 0.02)
then exits only via a player-fight melt (d129), under the
repeated line "stared down the Nightcourt and it backed off —
0 rounds, not a scratch on them."

Ruling questions for Steve (paper §5, questions not a design):
met-finish scope (meet-crippled vs drop-only); loot/ledger scale
for met-kills (full vKill vs lesser mercy outcome); raid-only vs
field too (field pre-wounded 389 dwarfs defender 196);
acceptable finish blood price; whether surviving-core
near-immortality is intended; the shrug narration; and which
death mechanism any bundled companion must cover.

Wall (this base): national-ever 7/8, table entered 1/8, wins 1/8,
wave-4 6/8, wave-5 0/8, median 174d, mixed deaths 336.

## Arm 2 — sim-w3rederive-a (d91d67d4b, proof 87/0 post-rebase and
## on merged master): DIAG-GO

Wave-3 bar re-derived on the arm's own base, never copied.
Det-gates PASS on both columns (pilot 73901, plain vs wrapped:
29/29 days, 11/11 deaths). Corpus complete: 16 rows, zero
recorder errors/overflow. Proof recomputes the bar definition on
all 16 rows.

Blocker classification on this base, hunt column, actuals:
- w3-blocked-ALONE: NONE.
- surge-blocked-ALONE: 73902, 73904, 73906, 73907, 73908.
- both: 73903 (w3 2/3, surge unmet; all other lesser bars met).
- neither: 73901 (other bars unmet — died day 29), 73905
  (seated, lesser day 133).
Re-derived collapsed set (anchor-seated + hunt-unseated):
73902, 73903, 73904, 73907, 73908 — 73906 is unseated in BOTH
columns, so it is not collapsed.

The "2-seed blocker" claim does NOT survive in its hunttable
form: 73904 meets w3 (4/3, bar day 82) and is surge-blocked
ALONE; 73903 is both-blocked on actuals. The second-blocker
phenomenon survives only as a COUNTERFACTUAL: with the surge held
met, hunt 73903 would still be seatless on w3 alone (w1 18, w2 10,
contests 20, crises 3, rank regional, stage 3, sentiment day 13).
Control comparison: 16/16 rows reproduce the wave3bar corpus
EXACTLY (days, won, wave, arc, ranks, table, deaths, starvation,
every first-day bar, finalSeatDetail, w3FirstDay). The drift
between wave3bar's base (2ae24d41) and this base is NIL on this
band — the re-derivation confirms rather than overturns wave3bar,
and no wave3bar/hunttable number was re-judged or copied.

Sense read (own corpus, hunt 73903): the day-90 table beat names
the missing bars; the day-96 pellet beat ("NO FEAST, NO SURGE")
still argues with the feast record (8 grants, 8 draws driven off).
Half-earned wall, confirmed, not new.

Wall — anchor: national-ever 7/8, national-final 6/8, table 6/8,
wins 6/8 (lesser only), wave-4 4/8, wave-5 0/8, Arc IV 6/8,
median 138d, deaths 223, starvation 5. Hunt: national-ever 7/8,
national-final 5/8, table 1/8, wins 1/8, wave-4 5/8, wave-5 0/8,
Arc IV 1/8, median 180d, deaths 240, starvation 5.

## Arm 3 — sim-defnarr-a (ace66ac1b, selftest 9/9 post-rebase and
## on merged master): sense-GO

Defender-fight narration is BOILERPLATE and, for its dominant
line, MISLEADING BY OMISSION; wait narration is a SINGLE LINE
repeated 3,442 times — honest but empty. No narration code
touched; the proposal section is a proposal only.

Defender census (tableseat-nowait, 73671–73678, 180d): 311
fights -> 297 recorded lines, 14 dropped (4.5%, queue-full at
fight time). Outcomes: mFlee 243, vFlee 32, vKill 34, vDie 2.
Templates collapse to 8 shapes (7 sentence skeletons):
- 190 (64.0%): "{NAME} stared down {MONSTER} and it backed off
  — {N} rounds, not a scratch on them. It's still out there,
  somewhere." — top-template share 64.0%.
- 43 (14.5%) stood down / bloodied but breathing; 32 (10.8%)
  killed (+loot); 29 (9.8%) mauled; 2 villager-killed; 1
  came-for-and-missed.
The decisive fact: ALL 190 stared-down lines are rounds-0,
pre-wounded, 0 damage taken — not one is a real fight;
150/190 end with the monster below 5% HP. The line is literally
true about the villager (no scratch on them) but never states
the monster's condition, so a dying animal met for the 8th time
reads exactly like a healthy one backing off. Most-repeated
verbatim line (x4): "Elena stared down the Highbeam Deer…";
top instance: 73675 gallowdeer seq 9 — mauled Elena on d19, then
stare-downs at 1% HP on d38/48/66/74/81/96/104.
Delivery thinning (mechanism, not counted): queue capped at 8,
only the first 5 spoken per return — the census counts lines
written, an upper bound on lines heard.
Observed, not root-caused: the same instance appears under
different display names in the news (e.g. "the Static" d66/d74
-> "the Loud Beast" d81+ for one instance), so an individual
animal cannot be followed by name.

Wait census: located in code — out-of-combat "You wait. The
light changes. Nothing asks anything of you." and in-combat "You
hold still, watching." (heckler answer-back variant never fired:
0 calls). Measured stream: ZERO wait lines by harness design
(standard sweeps silence Game.say) — no wait line was counted
from it. Faithful harvest (recording-only say,
trajectory-equivalent): 105,612 say-calls; out-wait 3,442 (3.3%),
in-wait 95 (kept 84 after dedup), heckler 0; driver wait actions
3,540 vs 3,442 lines = 98 suppressed exactly per the code's
fight/pending rule. Narration-live replay DIVERGES and is labeled
replay-only: seed 73671 gives 157d vs measured 177d (456
out-wait calls on the wrong trajectory) — the old "narration
shifts trajectories" warning, confirmed, not assumed. Future
sense replays must use the recording-only-say method proven here.
(One mid-run bug found and fixed before any verdict: the first
wait-transcript writer computed dedup over the wait-only stream,
falsely marking nearly every wait line deduped; fixed to
full-stream dedup — corrected: 0 deduped out-wait lines, 11
deduped in-wait lines, reconciling exactly with the census.)

Transcripts read end-to-end: defender 73671 (48 fights) and
73675 (61 fights), plus wait 73671 (512 identical lines). The
10th identical line teaches nothing the 1st did not: defender
news becomes noise with occasional kills in it; the wait line
stays honest (suppression works) but carries zero information
after the first reading. What should vary: wound/persistence
facts ("already bleeding," "again") and the wait line's day-part
slot only — the outcome vocabulary and the "still out there" /
"nothing asks anything of you" assurances must stay stable,
since they are the signal.

MASTER-DRIFT ALERT (carried, not fixed here): this tree's band no
longer matches the 1815/defwound control: won 1/8 (was 4/8),
deaths 332 (was 234), median days 174 (was 135), raids 98 (was
85). The drift is in the tree, not the tap — the det-gate
baseline itself (no recorders) gives 177d / tsNationalDay 86 on
73671 vs defwound's 180d / 77. ANY later arm citing the 1815 band
as control is citing a stale control; a re-baseline is needed.
(Woundprice independently reports the same drift on its band.)

## Wall (judge future arms against these corpora)

Wave-5: 0 everywhere, on every arm's corpus. Wins come only
through the anchor/courtship + seat instruments (w3rederive
anchor 6/8 lesser wins); the hunt column wins 1/8. Full seat:
0/8 everywhere. The table collapse is now: surge alone on five
hunt seeds, both-blocked on one (73903, counterfactual-only
w3), and no w3-alone seed on this base. The wound mill is
priced but unruling'd: finishing the manufactured set costs
+1 round/fight and failed its death guards; finishing the
4.5x-larger met set is unpriced and awaits Steve's ruling.
Narration hides the mill: the dominant defender line reports a
phantom meeting as a standoff, and the wait line reports
nothing twice.

## Village assessment (plain words)

The villages in these sims reach national standing and, when the
courtship drive runs clean, sit at the lesser table — but none
reaches the full seat, and none births wave 5. The day-to-day
village is haunted by crippled animals it cannot finish: the
same dying beast walks into raid after raid, each time "backing
off" in the news without a scratch on anyone, because the fight
ends before the first blow. Villagers thrive when the feast
drive lands and starve or stall when it does not; the one
village that lost its surge deed lost its table without ever
being told what it missed. Waiting, the player's quietest
action, says the same sentence thousands of times — honest, but
it teaches nothing after the first night. Nothing here is
broken in a way that stops play; the blanks are a priced wound
mill awaiting a ruling, a wave-3 bar that is no longer the
blocker it was reported as, and news that repeats instead of
informing.

## Blanks filled or documented

- FILLED (measured, landed as record): 1146Z blank (6) wave-3
  bar re-derivation — w3-alone = none on this base; the
  second-blocker claim is counterfactual-only (73903).
- FILLED (paper, landed as record): 1146Z blank (2) wound-closure
  pricing paper — round cost, death ledger, companion offset,
  met residual, and ruling questions for Steve.
- FILLED (sense, landed as record): 1146Z blank (4) defender
  narration boilerplate + wait-line repetition — censuses,
  transcripts, proposal only.
- DOCUMENTED (not chased mid-run): the 1815 control band is stale
  (defnarr + woundprice independent sightings); the day-96
  pellet beat contradicts the feast record; same-instance display
  names change across days; wait-line narration-live replay
  diverges and must use recording-only-say; thin-feast-refresh
  and the other 1146Z-carried items remain open in the findings
  backlog.
- NOT TAKEN (steve-calls, untouched): (1) choice-price ruling,
  (3) melt ruling. NOT TAKEN: (5) transient hunt (needs more
  seeds / first-night stressor).

## Telemetry deviation check

Ran: node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-26/perseed-sim-w3rederive-a/s*.json' --metrics
national,table,wins,exiled. Result: 2 LOUD lines (national 12
-> 0, wins 16 -> 0; n=17 files incl. summary.json). Verdict:
both are the KNOWN ingestion-shape artifact class (recorder rows
carry nationalEver/won, not top-level national/wins — same class
as the 1040Z/1146Z runs). Actuals on this corpus: anchor
national-ever 7/8, wins 6/8; hunt national-ever 7/8, wins 1/8.
Baseline NOT rolled. No new investigation: the checker cannot
ingest recorder corpora, and the paired identical-seed tables in
the arm evidence are the comparison of record.

## Balanced panel

NOT attached: balance-panel compare cannot ingest recorder
corpora (the known ingestion failure, fifth sighting in the
backlog). Paired identical-seed tables are the comparison of
record for all three arms, as in the 1035Z/1040Z/1146Z rounds.

## Metric review

Pre-registered headers judged as written; nothing re-scored.
Woundprice Stage-2 numbers are restated, not re-run, because the
rule is KILLED — re-running it would violate the kill. Defnarr's
measured-stream zero wait lines is a method finding, not a leg
failure: the arm proved trajectory-faithful recording-only-say
and harvested from it. W3rederive's 16/16 exact reproduction of
the wave3bar corpus is a confirmation, not a re-judgment: the
corpus was re-swept on the arm's own base, not carried across
the rebase (per the carried-corpus re-sweep rule). For the NEXT
run: pre-register the re-baselined control band before judging
anything against 1815 tables; and pre-register ONE deciding
metric for any future voice/narration arm (raw counts and
voice-days cannot both be bars for a one-voice-per-day design —
see backlog item 1089).

## Infrastructure

- No EPERM flap blocked this run (only flock waits on sibling
  contention during worktree registration, minutes each).
- Safe-commit index clobber hit ALL THREE worker commits —
  repaired via HEAD-blob cacheinfo each time, commits verified
  correct, worktrees clean before merge.
- ff-only merge sequencing: after the first merge advanced
  master, the remaining two branches were re-rebased onto the
  new master with proofs re-run (w3rederive 87/0, defnarr 9/9)
  before their merges — no conflicts, zero file overlap.
- Master moved several times under the run from sibling lanes
  (B 1130Z coordinator evidence, B substrate arm, B 1237Z round,
  journey r43/r51, journey succession) — all rebases clean.
- check.js --quick NOT re-run: zero src/js landed; arm proofs
  green on merged master; the standing 279/8 profile was last
  re-attributed by loop B's 1035Z run.

scale-onramp stays converging (NOT converged): the wave-3
blocker is settled to a counterfactual, the wound mill is priced
but unruling'd, narration is censused but unchanged, wins still
come only through default-OFF courtship + seat instruments, only
through the lesser seat, the full seat is still unreached, and
wave 5 still has zero births. The directive stands until the
tracker records this axis converged on measured evidence.
food-economy stays converging (untouched; sibling loop B).
Rotation left at 3 (convergence work does not cycle it).
Claim deleted; lock deleted. Evidence: this file (coordinator)
+ sim-woundprice-a.md + perseed-sim-woundprice-a/ (4e6b4fdfc)
+ sim-w3rederive-a.md + perseed-sim-w3rederive-a/ (d91d67d4b)
+ sim-defnarr-a.md + perseed-sim-defnarr-a/ + perseed-sim-defnarr-a-wait/
+ perseed-sim-defnarr-a-tapoff/ (ace66ac1b). Merged locally,
pending ship.
