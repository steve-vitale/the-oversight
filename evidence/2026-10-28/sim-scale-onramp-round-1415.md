# sim-scale-onramp-round-1415 — coordinator record (run fleshout-20261028T1415Z)

Axis: scale-onramp (blocking axis, converging). MEASUREMENT ONLY — zero
src/js changes, zero default flips, no [needs-eyes]. Gating freeze honored
throughout (freeze intent clarified 2026-10-28 09:14 CDT: stability while
villager rationality is the work, not a ban on reachability fixes — and
these arms fix nothing, they measure).

## Plain words first

The village meets wave 4 and still almost never kills it — but the picture
moved in one narrow way, and the demand side now has a number. On the same
8 seeds where the 0416Z census found 0 wave-4 kills, this run finds 2 —
both won the hard way, by the scholar's party grinding a lingering beast
down over 3–4 turn-based fights, dying in the lost attempts first. The
cornered-party hold that landed at 1315Z did NOT cause those kills: under
this policy the village never answers a lingerer with a sortie at all, so
the mechanism sits dormant, and re-running the census over partyfinish's
own driver-OFF control reproduces the new numbers exactly. The 0→2 move is
base drift between the old census base and current master, not partyfinish.

The demand census answers Steve's wave-4 demand (parties + fully outfitted
gear) with a blunt number: only 2 of 50 wave-4 fights (4%) met the demand.
Every field fight was a lone villager. 21 of 24 turn-based fights were the
scholar alone. The village owns ~6 armed fighters but never sends two of
them together to meet a beast — and its own muster beat says why: the
village judges the beast "beyond us" and outlasts it instead. The party
never forms because the village judges it cannot win. That judgment, not
meeting rates or spawn counts, is the demand gap.

## Arms (both DIAG-GO, both landed, merged locally pending ship)

Shared band + substrate: seeds 75101–75108, scripts/policies/tableseat-nowait.js
verbatim, LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware. Both arms'
wall numbers agree exactly (national ever 7/8, final 6/8; table invited 4/8,
entered 3/8; wins 3/8, all lesser, full seat 0/8; wave-4 reach 6/8, wave-5 0/8;
median survival 146d; deaths 286; starvation 1 on 75108).

### Arm 1 — sim-w4convert-postparty (re-census; prereg 03e7d96b8, evidence f9bfbc3f8)

Verbatim re-run of the 0416Z w4convert census on current master. Det-gate
PASS (75101: 132/132 days, tsNationalDay 77, no diag surface, no wraps).
Census complete 8/8, unclassified 0, vanished 0, substrate gate PASS
(courtship combined 110, 8/8 active). Cross-check vs partyfinish CONTROL
PASS 8/8 on all fields.

| measure | postparty (new) | 0416Z | delta |
|---|---|---|---|
| universe / faced / engaged | 44 / 21 / 21 | 51 / 31 / 29 | −7 / −10 / −8 |
| KILLED | 2 | 0 | +2 → CHANGED |
| field kills | 0 | 0 | 0 |
| raid kills (drafted-only) | 0 (9) | 0 (12) | 0 |
| TB kills / TB wins | 2 / 2 | 0 / 0 | +2 / +2 |
| never-met / met-no-kill | 23 / 19 | 20 / 31 | +3 / −12 |

Channels faced/engaged/killed: field 11/11/0 (was 16/16/0); raid 16/2/0
(was 22/4/0); TB 14/14/2 (was 18/18/0). Field outcomes: vFlee 16+2 raid,
vDie 8. TB: lost 22, won 2. All 23 never-met instances still present at end.

The two kills (scholar-led TB-party kills, `player-fight-kill`): 75102 seq 21
Reunion, spawned d145 (1200 HP), fought 4× on d172 (lost, lost, lost, won
round 7 at −24 HP); 75108 seq 32 Suburb, spawned d91 (1300 HP), 1 field
fight (villager died), TB lost d94, lost d95, won round 6 (−27) with
villager ally ruth_goldstein standing (party member only, not killer, per
the attribution rule).

Attribution (pre-registered split, before judging): NOT partyfinish. Zero
sortie caller rows in the new corpus (resolve 1030, other 201, aid 41);
tableseat-nowait contains no sortie call and the engine default for
unanswered lingerers is 'endure', so the cornered-party mechanism is
dormant by construction. Clincher: the same census over partyfinish's
CONTROL corpus (mechanism present, driver OFF) reproduces the new census
exactly — 44/21/21/2, same two instances on the same days. No single change
in the bcf137c40→37aa0a4fb range is assigned the move.

Sense (75106, most-faced seed, d79–d146): first faced-not-killed instance
seq 42 Eulogy (900 HP, still present at 890 HP): d104 villager met it twice
(dealt 10, took 78, fled; dealt 0, took 45, fled), d111 catalina_reyes met
it (dealt 0, took 81, fled) — 10 damage dealt vs 204 taken across 3
meetings. Coherent with the d79 muster beat ("beyond us… We outlast it")
and d86–88 gorge-endurance beats: the village judges the beast undentable
and outlasts it; the sortie choice the game names nightly is never taken
by this policy. Villagers otherwise act like people (pantry-aware work
choices, Valeria teaching unasked, shared meals, Chantal's French-only
barrier). Minor robotic notes: Fatima's belonging line repeats verbatim
(d80/d86); the Contract Quill reflection line fires nearly daily.

Evidence: evidence/2026-10-28/sim-w4convert-postparty.md (+ prereg),
corpus evidence/2026-10-28/perseed-w4convert-postparty/ (8 rows +
summary.json + analysis.json), instruments scripts/test-w4convert-postparty*.js.

### Arm 2 — sim-wave4demand-a (demand census; prereg fcc338d0a, evidence 05a8e2cd6)

New policy-side recorder on the same band/substrate. Det-gate PASS twice
(75101: 132/132 days, tsNationalDay 77, no diag surface, no wraps).
Complete 8/8 rows, all 9 recorders errs 0, no overflow. Reconciliation:
field rows 27 = 27; TB starts 26 = 26; unmatched TB ends 0; UNCLASSIFIED 0.
Parity vs partyfinish CONTROL EXACT (8 seeds × 9 fields + wave-4 defwound /
nonworldkill / spawn checks). Cornered dormancy PASS (0 cornered wave-4
fights — mechanism present, dormant on this substrate, as pre-registered).

DEMAND-MET (pre-registered strict rule: party n≥2 + every participant armed
+ armored-count ≥1 + veteran present + village tricks ≥3):

| channel | n | party | full arming | armored ≥1 | veteran | tricks ≥3 | DEMAND-MET |
|---|---|---|---|---|---|---|---|
| field | 24 | 0.00 | 1.00 | 0.46 | 0.00 | 1.00 | 0.00 |
| raid | 2 | 0.00 | 1.00 | 1.00 | 0.00 | 1.00 | 0.00 |
| TB | 24 | 0.13 | 1.00 | 0.75 | 0.17 | 1.00 | 0.08 |
| ALL | 50 | 0.06 | 1.00 | 0.62 | 0.08 | 1.00 | 0.04 |

Demand-met vs not-met outcomes: field met — (none), not-met vDie 8 /
vFlee 16; raid met — (none), not-met vFlee 2; TB met lost 2, not-met lost 20 /
won 2.

In plain words: field fights are all lone villagers (24 field + 2 raid,
zero second fighters by named allies, engine allies, or fought-party
diagnostic alike; all armed, ~half armored P≥10, zero veterans ever; 318
damage over 27 rows, 13 zero-damage). TB fights are 21/24 scholar-solo.
The only 2 demand-met fights both lost (both Audits: 75102 d166 party-of-3
with veteran Jesse Cortez; 75103 d117 party-of-2 with veteran). The only 2
wins both FAILED the demand (75102 d172 solo scholar Olivia Bennett vs
Reunion; 75108 d95 2-party Ines Duarte + Ruth Goldstein, no veteran, vs
Suburb) — counts of 2 and 2, not a law, but they rule out "meet the demand
and you win." Both winning killers are dead by run end (both in fallen
lists). Village readiness at fight starts (gate demand 3/5/3/1): armored
2.88, armed 6.00, tricks 20.42 (saturated by wave 1–2 counters — the tricks
leg discriminates nothing at wave 4), veterans 0.12. Only 6/51 fight rows
start while the village is ready by its own gate. Raid: 16 tolled-not-fought
events (14 seqs, lower bound on drafted) vs 2 fought. Sense (75106,
d79–d146): the village's own muster beat says the Eulogy is "beyond us…
We outlast it" — people-like retreat judgment, and also the demand gap
itself: the party never forms because the village judges it cannot win.
No robotic behavior flagged in the demand window.

Evidence: evidence/2026-10-28/sim-wave4demand-a.md (+ prereg),
corpus evidence/2026-10-28/perseed-wave4demand-a/ (8 rows + summary.json +
analysis.json), instruments scripts/policies/wave4demand-diag.js,
scripts/test-wave4demand*.js.

## Wall (this run's judged corpora, 16 configs, same band)

National ever 7/8, final 6/8; table invited 4/8, entered 3/8; wins 3/8 (all
lesser, full seat 0/8); wave-4 reach 6/8, wave-5 0/8; median survival 146d;
deaths 286 (combat-family 231, 80.8%; arena 43, 15.0%; sickness 5); starvation
1. The scale wall is narrower (wave-4 reach 5→6 on this band's history, a TB
kill path now exists) but still standing: no full seat, no wave 5, and the
only kills come through scholar attrition, not village parties.

## Metric review

- Wave4demand prereg's "expected 121" courtship combined was the w4damage-era
  number; the partyfinish control's own combined is 110, matched exactly.
  Recorded as a correction, not a re-score — the substrate gate passed on
  the control's own number.
- Tricks-bar saturation: the wave-4 tricks leg (≥3) is met by wave 1–2
  learning on every fight; a wave-appropriate revision belongs in the NEXT
  run's prereg, not retroactively applied here.
- Balance panel has no census-ingest mode (errors without --out; builds from
  live roots), so paired before/after tables are the §15 substitute, as in
  0416Z. Panel compare not run as an instrument; the comparison tables in
  both arm evidences are the judged record.
- Telemetry deviation check on both corpora: 3 LOUD lines each (national
  12→0, table −75% 16→4, wins 16→0) — the known WINSEAT-regime + field-shape
  artifact class (per-seed rows carry nationalEver/entered/won, not
  top-level national/wins paths). Baseline NOT rolled, no new investigation.
  Actuals: nationalEver 7/8, entered 3/8, wins 3/8.

## Infrastructure

- Master moved 3 times under the run (sibling journey/spandraw instruments;
  sibling loop-B liveness game-code change to src/js/abilityActions.js;
  sibling loop-B 1430Z coordinator record). ff-only merge refused twice
  (correctly); both branches rebased clean in their own worktrees (wave4demand
  three times), proofs green after every rebase (w4convert-postparty analyzer
  mechanical PASS; wave4demand analyzer DIAG-GO, parity exact). Arm corpora
  were generated on the pre-liveness base; the arms contribute zero src/js,
  so the base move changes no judged row — disclosed, not hidden. A future
  re-run on the liveness base would be a new measurement, not a re-judgment
  of these corpora.
- Safe-commit index clobber hit all worker commits (repaired via cacheinfo,
  commits verified correct). Analyzer timestamp churn (analysis.json
  `generated` field) handled by restore-after-proof; verdict bytes identical.
- Worktree registration slow (~8 min for both, restat-bound) but clean; no
  EPERM flap blocked this run. Sibling playtest trees (journey-establishment,
  journey2-succession, journey-deepening, journey2-endgame) left alone.
- MEMORY.md updates arrived mid-run from outside (freeze intent clarified
  09:14 CDT; travel–scale coherence 09:40 CDT; builder-voice reporting) —
  noted, not acted on. Travel–scale coherence is a queue item for a future
  run, not this axis.

## Next blanks, in order

1. A PARTYFINISH=1 band on wave-4-facing seeds: wave-4 conversion under the
   partyfinish driver is still unmeasured — this run proves the mechanism
   dormant under tableseat-nowait, not that the driver fails. Own prereg.
2. Field-party formation on meeting (0/26 parties despite ~6 armed fighters
   village-wide): an NPC-intelligence question — why no second villager ever
   joins a meeting — not a spawn-rate lever.
3. Veteran survival/conversion: veterans are 0.12 mean at fight starts, both
   winning killers dead by run end; the wave-4/5 veteran bars cannot fill on
   this shape. Killer survivorship, not kill opportunity, is the binding leg.
4. TB attrition shape design look (steve-call candidate): both kills took
   3–4 TB fights with the scholar dying in same-day lost attempts before the
   winning party finished the beast — intended conversion path or attrition
   loophole?
5. Tricks-bar revision (metric review item above) in the next demand prereg.
6. Demand-met Audit losses (n=2, question not finding): whether Audits
   specifically punish parties needs a bigger party-fight sample — which
   needs blank 1 or 2 first.

## Run bookkeeping

Claim fleshout-20261028T1415Z deleted; lock deleted. Both worker branches
merged (f9bfbc3f8, 05a8e2cd6), trees released done-merged, branches deleted.
Main tree clean at closeout. Merged locally, pending ship. No push, no bump,
no live verification (ship-loop line).
