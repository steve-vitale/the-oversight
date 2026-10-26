# sim-woundprice-a — wound-closure pricing paper (axis scale-onramp)

Run: fleshout-20261026T1230Z (Mon 2026-10-26). Axis: scale-onramp
(converging). Worker: sim-woundprice-a.
DIAG ONLY, zero src/js changes, NO new rule implemented. This paper
prepares Steve's ruling on met-below-line finishing. It does NOT
implement any finish rule and does NOT re-run the killed
defender-finish rule (defwound Stage 2, NO-GO).

Base commit (this worktree): ac98043a1e0edafb3ccaf802528844427424603c
("sim-food-economy-round-1130-b: coordinator evidence, reminder GO
landed + noelig DIAG-GO landed, merged locally pending ship").
Substrate (shared with defwound): tableseat-nowait —
LEANLINKRESCUE=1 + TABLESEATNOWAIT=1, seat legs only, no wait leg.
Seeds 73671–73678, 180d death-aware horizon (runDays stops on
death/win; 180 is the cap, not a fixed horizon).

Sources re-read for this paper: evidence/2026-10-25/sim-defwound-a.md
(Stage 1 measurement + Stage 2 NO-GO verdict),
evidence/2026-10-25/sim-fieldguard-a.md (survivability companion
verdict), evidence/2026-10-24/sim-fieldfinish-a.md. Canon read
first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law: wave 3 =
day 25 + 4 wave-2 ledger points, kills only). No canon doc covers
defender finishing or wound-closure pricing — the questions in
§5 are therefore Steve's ruling questions, not canon, and no
design is invented here.

Definitions (fixed, same as defwound): defender fight = a
resolveWildMonsterEncounter row with opts.raid. Break line =
0.15 wave>=2, 0.25 wave 1. Below-line survivor EVENT = a defender
fight ending mFlee with the entity below the line at fight end.
MANUFACTURED = the entity started at/above the line and ended
below it (this fight wrote the wound). PRE-WOUNDED (met-below-line)
= the entity started below the line already. Re-meet = a later
resolve row (any context) for the same instance (spawnsrc
_spawnSeq). A re-meet is a phantom meeting when it ends rounds-0
mFlee. Finished = a later resolve row for the same instance
ending vKill.

## PRE-REGISTRATION (binding — judged only against this)

Paper-GO iff ALL of: (a) det-gate passes; (b) corpus complete
8/8, zero recorder errors/overflow; (c) Stage-1 numbers
re-derived on this base, with any deviation vs defwound Stage 1
attributed to base drift with evidence (never silently
accepted); (d) pricing arithmetic explicit (round cost, death
ledger, companion offset needed, residual size); (e) ruling
questions listed; (f) transcript read included. Any leg missing
= paper incomplete — say so plainly, land what exists. Do NOT
implement any finish rule, do NOT touch fieldFights.js/game.js
game code, do NOT re-judge old corpora.

## PAPER VERDICT: PAPER-GO (all six legs pass)

- (a) DETGATE PASS: seed 73671, baseline days=177 gameDays=177
  ts={tsNationalDay:86} vs wrapped-with-recorders-OFF identical
  on all three, diagSurface=false, wrapsInstalled=false,
  postSetupWorld=0.
- (b) CORPUS PASS: 8/8 seeds, all four recorders errs=0 on every
  seed, overflow VALUES 0 on every seed (raftdraft/spawnsrc/
  oldcore overflow={}, defwound overflow={resolveFights:0} — a
  zero counter, not an overflow; the gate tests values, per the
  defwound corpus-gate correction).
- (c) RE-DERIVED on this base — see §1. The numbers moved vs
  defwound Stage 1, and the move is attributed to base drift
  with evidence in §1 (det-gate trajectory itself differs with
  recorders OFF, so the engine moved, not the recorder).
- (d) PRICING explicit — see §2 (round cost), §3 (death ledger
  + companion offset), §4 (residual size).
- (e) RULING QUESTIONS listed — see §5. They are questions,
  not a design.
- (f) TRANSCRIPT read — see §6 (seed 73671, corpusMatch=true).

## 1. STAGE-1 RE-DERIVATION ON THIS BASE (vs defwound Stage 1)

My base's band (tableseat-nowait substrate, seeds 73671–73678):
wins 1/8, national-ever 7/8, national-final 3/8 (73673, 73675,
73676), table 2/8, entered 1/8, wave-4 6/8, wave-5 0/8, median
survival 174d (days sorted 97/106/116/156/174/175/177/180),
mixed deaths 336, raids 98, raiders 407, pool 1552, pool wave-3+
225. Wall numbers: national 7/8, table entered 1/8, wins 1/8,
wave-4 6/8, wave-5 0/8. The wall stands on this base too — and
wins fell to 1/8, so the scale wall is, if anything, taller
here than on the 1815 band.

Defender fights: 311 total — mFlee 243, vFlee 32, vKill 34,
vDie 2 (defwound: 322 — mFlee 263, vFlee 34, vKill 25, vDie 0).

Below-line wounds from defender fights:
- mFlee-below-line EVENTS: 240 (defwound 260).
- MANUFACTURED: 44 events (18.3% of 240; defwound 56, 21.5%) —
  by wave: w1 29, w2 14, w3 1 (defwound w1 37, w2 15, w3 4).
- PRE-WOUNDED: 196 events (81.7%; defwound 204, 78.5%) — by wave:
  w1 133, w2 57, w3 6 (defwound w1 152, w2 45, w3 7).
- Untagged: 0. Other below-line ends: 0. Defender fights
  STARTING below the line: 196 — every one ends mFlee, none ends
  vKill (same structural fact as defwound).
- Defender vKills (34) all start above the line; the lowest
  vKill start fraction is 0.18 (defwound 0.20).
- Field contrast: mFlee-below-line 467 (defwound 441),
  manufactured 78 (69), pre-wounded 389 (372).

Per-seed manufacture table (defender fights / mFlee-below /
manufactured / pre-wounded / vKill):
73671: 48 / 41 / 11 / 30 / 2. 73672: 19 / 13 / 3 / 10 / 0.
73673: 27 / 19 / 1 / 18 / 3. 73674: 50 / 43 / 6 / 37 / 2.
73675: 61 / 51 / 6 / 45 / 5. 73676: 28 / 19 / 6 / 13 / 6.
73677: 37 / 26 / 3 / 23 / 6. 73678: 41 / 28 / 8 / 20 / 10.
Pre-wounded dominates on every seed, as on defwound's base.

Re-meet (the mill, same shape on the new base):
- Wound EVENTS: 240; DISTINCT survivor entities: 103 (defwound
  260 / 108).
- Re-met at least once: 199/240 events (82.9%; defwound 78.5%).
- TOTAL re-meets: 881 (defwound 877) — and ALL 881 are rounds-0
  mFlee. Not one re-meet is a real fight.
- FINISHED by a later villager fight: 0/240 events (0.000).
  No villager fight, defender or field, ever finishes a
  below-line entity on this band either.
- Manufactured-only: 44 events, 38 re-met (86.4%), 207 total
  re-meets, 0 finished (defwound 56 / 43 / 247 / 0).
  Pre-wounded-only: 196 events, 161 re-met, 674 total re-meets,
  0 finished (defwound 204 / 161 / 630 / 0).
- HP rises between fights: 0 events. Wounds never heal — the
  no-heal finding reproduces on the new base.

Final fates of the 103 distinct survivor entities:
still-present 53 (defwound 87); removed by a PLAYER fight 28
kills + 16 melts (defwound 14 + 6); removed by monsterTurn
departure 6 (defwound 1); vanished 0. The exits are still only
the scholar's fights (44/103) plus departures — villagers
never close the mill on either base.

BASE-DRIFT EVIDENCE (why the numbers moved — not silently
accepted): the det-gate itself proves the engine moved. With
recorders OFF, seed 73671 runs days=177/gameDays=177/
tsNationalDay=86 on this base, vs defwound's det-gate
days=180/gameDays=181/tsNationalDay=77 on its base — same
policy, same seed, different trajectory, recorder uninvolved.
Per-seed control comparison (defwound control → this base):
73671 survived 180d/31 deaths → lost d177/43 deaths; 73672 won
d97/25 → lost d116/32; 73673 won d124/28 → won d97/29; 73674
survived 180d/18 → lost d175/48; 73675 won d135/24 → survived
180d/43; 73676 lost d70/31 → lost d156/64; 73677 lost d143/43
→ lost d174/41; 73678 won d116/34 → lost d106/36. Wins 4/8 →
1/8, deaths 234 → 336, raids 85 → 98, raiders 361 → 407.
The band moved in both directions (one seed survives longer
with twice the deaths), which is what a moved master looks
like, not a recorder artifact. The mill STRUCTURE is stable
across the move (pre-wounded ~80%, 0 finishes, 100% rounds-0
re-meets, 0 HP rises) — so the pricing in §§2–4 does not
depend on the 1815 band reproducing. What does NOT transfer
without re-baselining: any absolute death/win guard applied to
a future arm on current master — a bundled arm must re-run its
own control on current master, never judge against 234/4/8.

## 2. PRICE OF THE CLOSURE, PART 1 — ROUND COST

Restated from defwound Stage 2 (on defwound's base, with its
1815 control band — NOT re-measured here; the rule was not
re-run): the directed first-divergence check passed 8/8 — every
seed's first control manufactured fight converts to a vKill in
the armed run in exactly one more round each time (control
rounds 3/4/5/4/6/6/4/3 → armed 4/5/6/5/8/7/5/4). The finish
costs ONE extra round per manufactured fight, no more, on that
base. The divergence set is first-manufactured-fight-per-seed
only (n=8, mean control rounds 4.375) — it is not the full
manufactured population.

Recomputed on MY base from the Stage-1 corpus (the recorder
supports it: resolve rows carry rounds + the manufactured
flag; the distribution below restricts to mFlee below-line
ends, matching analyzeDefwound's event definition — an early
cut of this script counted the manufactured flag on all raid
rows including vKills, n=78, and was corrected to n=44 before
any number below was used):
- Manufactured defender fights (n=44) rounds: 1:6, 2:12, 3:9,
  4:10, 5:4, 6:1, 7:1, 9:1. Median 3, mean 3.16, range 1–9.
- If the +1-round finding transfers, the narrow finish adds
  exactly 44 extra rounds band-wide (one per manufactured
  fight), a mean +31.7% lengthening per manufactured fight
  (1/3.16). Per-seed manufactured counts: 73671:11, 73672:3,
  73673:1, 73674:6, 73675:6, 73676:6, 73677:3, 73678:8.
- Caution, stated plainly: +1 round is a Stage-2 empirical
  finding on the old base, not a law. This paper prices it
  against my base's fight lengths; it does not re-prove it.
  My base's manufactured fights run shorter on average (mean
  3.16 across all manufactured fights, vs 4.375 for the old
  base's first-per-seed set — different populations, so the
  comparison is indicative, not a drift claim). If anything,
  the round price is proportionally HIGHER on short fights: a
  1-round fight that becomes 2 rounds doubles in length.
- The met-below-line fights cost zero rounds today (all 196
  pre-wounded defender rows on my base are rounds-0) — a
  met-finish rule would ADD rounds where today there are none,
  not extend existing fights. That is a different price shape
  from the narrow finish, and it is unmeasured (see §5).

## 3. PRICE OF THE CLOSURE, PART 2 — DEATH LEDGER + COMPANION OFFSET

Restated from defwound Stage 2 (old base, 1815 control — NOT
re-run, NOT re-judged): mixed death-tele total control 234 →
armed 316 (+82, +35%); cost guard ≤257 (control +10%). Wins
4/8 → 3/8; guard ≥4/8. BOTH cost guards failed while both
mechanism bars passed (events 260 → 105, −60%, bar ≤182;
kills 25 → 65; re-meets 877 → 351). Deaths rose on ALL 8 seeds
(+16/+7/+22/+12/+8/+1/+8/+8) — systematic cost, not seed noise.
Other Stage-2 diagnostics, restated for the ledger: defender
vDie 0 → 3, median survival 135d → 96d, national-ever 7/8 →
5/8, wave-4 6/8 → 5/8, wave-5 0/8 both, starvation 5 → 6.
Kind-filtered villager deaths armed = 58, but the Stage-1
corpus predates the deathList field, so no same-band control
exists — that 58 must NOT be compared with deathcensus's 27
(a different band), and it plays no part in the arithmetic
below, which uses the brief's mixed-total guard throughout.

THE ARITHMETIC (on the Stage-2 numbers):
- Death gap: 316 − 257 = 59. A survivability companion must
  save AT LEAST 59 deaths from the armed trajectory (59 of the
  82 excess deaths, 72% of the excess) for the finish rule to
  pass its death guard — assuming the companion's effect adds
  to the armed trajectory. Additivity is an ASSUMPTION, flagged:
  once the rule lands, trajectories diverge, and a companion
  measured on an unarmed band does not transfer 1:1.
- Win gap: 3/8 → ≥4/8 = at least 1 win must be recovered.
  A companion that saves deaths but flips no seed to a win
  still fails the win guard.
- Both gaps must close together. Saving 59 deaths while still
  losing the win is still NO-GO under the Stage-2 bars.

WHAT FIELDGUARD MEASURED (its own band, 0644Z base — a
different band and a different base from defwound; cross-band
arithmetic is indicative, never a proof):
- Kind-filtered villager deaths 27 → 20 (−7). Field villager
  deaths 12 → 6 (−6). One-round <15% field deaths 6 → 0.
  Guard withdrawals 12. Wins 4/8 → 5/8 (+1 win).
- Mixed death total 261 → 272 (+11) — on its own band, the
  guard did NOT reduce the mixed total at all; the rise is
  monster + scholar deaths on diverged trajectories.
- Coverage of the gap: 7 villager deaths saved is 7/59 = 12%
  of the death gap. On the metric the Stage-2 guard actually
  uses (mixed total), fieldguard saved nothing (it rose).
  The win direction is right (+1), but on a different band at
  n=8, and fieldguard itself was KILLED on its own median leg
  (wins-excluded median 158d < 180d) — so it cannot land as-is
  either; any companion built from it needs a revised cost leg
  first (its own metric-review note).
- Mechanism mismatch, the deeper problem: fieldguard covers
  FIELD entry by nearly-dead villagers and explicitly excludes
  raids. The Stage-2 cascade deaths are not field-entry deaths
  — defenders now die at the wall (vDie 0 → 3), and dead
  phantoms free raid slots that refill with healthy monsters,
  so later raids are fought against real teeth. A field-entry
  guard does not touch that cascade. A companion would need
  to be ~8× fieldguard's villager-death effect, or operate on
  the raid cascade itself, to plausibly close 59 deaths.
- VERDICT ON THE COMPANION QUESTION: on measured numbers, NO
  — fieldguard as measured does not plausibly cover the gap.
  The only honest proof would be a bundled run (finish +
  companion) with its own pre-registered guards on current
  master. That is a future arm's job, not this paper's, and
  this paper does not recommend bundling on hope: the gap is
  59 deaths and the only measured companion covers ~7.

## 4. THE MET-BELOW-LINE RESIDUAL AS THE ALTERNATIVE TARGET

Size on MY base (the current-base residual population):
- Pre-wounded defender events: 196 (81.7% of the 240
  below-line events) — by wave w1 133, w2 57, w3 6.
- Defender fights STARTING below the line: 196, all ending
  mFlee, all rounds-0 (the metRounds histogram is 196×0).
- Pre-wounded re-meets: 674, all rounds-0, 0 finished;
  161/196 events re-met at least once.
- For scale: on defwound's old base, the armed residual after
  the narrow finish was 105 events / 351 re-meets — the
  population the narrow rule deliberately leaves alone. On my
  base the analogous untouched population is LARGER (196
  events / 674 re-meets), because the narrow rule touches only
  the 44 manufactured events (18.3%) and leaves the 82%.
- Field feed: field pre-wounded events 389 on my base
  (defwound 372) — the residual is fed from the field as well
  as from earlier defender fights, so a defender-only met rule
  still leaves field-manufactured entities echoing in the field.
- Why the residual is the bigger target AND the harder one:
  bigger because it is 4.5× the manufactured population
  (196 vs 44 events; 674 vs 207 re-meets); harder because
  these entities were NOT wounded by the defender meeting
  them — finishing them is a mercy-kill rule for a crippled
  stranger, not the completion of the defender's own fight,
  and it converts 674 zero-round phantoms into real fights
  with real round costs, real defender risk, and real kill
  rewards. The narrow rule's +1-round price (§2) does not
  price this at all: met fights today cost 0 rounds, and
  their finished cost is unknown.

## 5. RULING QUESTIONS FOR STEVE (questions, not a design)

1. Should defenders finish a monster they MEET already crippled
   (met-below-line), not just one they drop below the line
   during the fight? That is a separate rule from the killed
   narrow finish, at ~4.5× its event scale on this base.
2. If met-finishing exists, what does a villager kill pay?
   Loot/ledger scale: does a met-finish count as a full vKill
   for the wave ledger, deeds, trust, corpse and loot — the
   way the narrow Stage-2 finish used the existing vKill path
   with all rewards following automatically — or as a lesser
   "mercy" outcome with reduced or no ledger credit? The
   answer changes the scale by 196 events, not 44.
3. Which fights count: raid defenders only, or field fights
   too? Field pre-wounded events (389) dwarf defender
   pre-wounded events (196) — a field met-finish is a much
   larger rule than a defender one.
4. What may a finish cost the village? The narrow finish cost
   +1 round per fight and still failed its death guards
   (defender vDie 0 → 3, deaths +35%). Is that blood price
   acceptable in principle, or must any finish be cheap or
   free to the defender? If the price is unacceptable, the
   met question is moot until a cheap finish exists.
5. Is the surviving-core near-immortality intended? On the old
   base 87/108 wounded entities were still standing at run
   end; on this base 53/103, with the scholar's fights as the
   only villager-adjacent exit. Is the mill a bug to fix, or a
   population the village is meant to live alongside?
6. Narration: is the repeated "0 rounds, not a scratch on
   them" shrug acceptable for a crippled repeat visitor, or
   should the village notice — and name — an animal it has
   stared down five times? (See §6.)
7. If a companion is ever bundled with a finish, which death
   mechanism must it cover — field entry (fieldguard's lane)
   or the raid cascade (the Stage-2 cost lane)? The two are
   different companions, and fieldguard covers only the first.

No design is proposed for any of these. A future arm needs
Steve's ruling on at least (1), (2), and (4) before it touches
a met-finish rule.

## 6. SENSE-TESTING (transcript, seed 73671, this base)

Transcript tap (corpusMatch=true — the lines below are from
the exact Stage-1 run, not a narration replay; full 48-row
defender transcript in evidence/2026-10-26/
sim-woundprice-a-sense.txt).

The manufacture that did NOT echo (counterpoint to the mill):
- d17 [raid] defender vs hushwolf, rounds=2, 1.00 → 0.12,
  mFlee, manufactured (44 dealt, 33 taken). This entity never
  appears in another resolve row on this trajectory, and is
  still present at run end. Not every wound mills — on this
  base, 6 of 44 manufactured events never re-meet.

The met chain that DID echo (the mill, in miniature):
- Nightcourt, seq 12: d34 rounds=0, 0.11 → 0.11; d46 rounds=0,
  0.02 → 0.02; d57, d69, d79, all rounds=0 at 0.02 — five
  identical non-fights across 45 days, then removed by a
  PLAYER fight (melt, d129, tbEnd:routed). The only exit is
  the scholar, exactly as on defwound's base.
- The awayNews line for every echo is the same boilerplate:
  "stared down the Nightcourt and it backed off — 0 rounds,
  not a scratch on them. It's still out there, somewhere."
  (Other echoes in the same transcript: "Brunhilde stared
  down the Cliffhanger and it backed off — 0 rounds, not a
  scratch on them. It's still out there, somewhere.")
Judged as a story: the village tells the same sentence about
a 1-HP animal five times in six weeks, and the sentence is
wrong in the interesting direction — "not a scratch on them"
describes the defender, while the animal is at 2% health and
has been for a month. A met-finish would end this animal's
story with a kill line; a narrow finish would never touch it,
because no defender dropped it. The sense read supports the
paper's central distinction: the residual, not the
manufactured set, is where the village's story stalls.

## VILLAGE ASSESSMENT (plain words)

These villages are bloodier than defwound's — only one wins,
and the death count is a third higher — but the wound story
is the same story. The wall still mostly stares: four out of
five defender fights that end with a wounded monster started
against a monster that was already wounded, and every one of
those ends before a single blow with the same line. The
village is not being attacked by an army; it is being visited
by the same crippled animals it already beat, which never
heal, never leave, and never get finished — except when the
scholar walks out and does it personally. Finishing what the
wall itself drops would touch less than a fifth of that mill
and, on the old base's measurement, cost the village 59 more
deaths than its own guard allows. The bigger mill — the
animals met already crippled — is the question this paper
hands to Steve, with its size priced (196 defender events,
674 phantom re-meets on this base) and its price shape named
(zero rounds today, unknown cost if finished). Nothing here
is a lever moved: no rule landed, no code changed, the wall
numbers on this base are national 7/8, table entered 1/8,
wins 1/8, wave-4 6/8, wave-5 0/8.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

- No metric was re-scored mid-run. The paper was judged
  exactly against its six paper-GO legs.
- Cross-band arithmetic (§3) is labeled indicative wherever
  it appears: fieldguard's band (0644Z) and defwound's band
  (1815) are different bands on different bases, and neither
  is this base. The 59-death gap is exact on the Stage-2
  numbers; the "covers ~12%" figure divides a cross-band
  measurement by it and must be read as an order-of-magnitude
  plausibility check, not a proof. The proof shape is named
  (a bundled run with its own pre-registered guards).
- The defwound --summary gate was NOT run as this paper's
  gate: its label and control band belong to defwound's run.
  This paper's gate is scripts/test-woundprice-analyze.js
  (value-based overflow gates, neutrality computed against
  the 1815 band and reported as DEVIATED with the drift
  evidence in §1, never hidden).
- One script bug found and fixed during this run (disclosed,
  not hidden): the first cut of test-woundprice-analyze.js
  counted the manufactured flag on all raid rows including
  vKills (n=78); the corrected cut restricts to mFlee
  below-line ends (n=44), matching analyzeDefwound's event
  definition. No corpus row was re-run or patched — only the
  analyzer — and the corrected distribution reconciles exactly
  (histogram sums to 44, per-seed counts sum to 44).
- Balanced panel (§15): NOT run as a compare, deliberately —
  the panel cannot ingest per-seed recorder corpora (the known
  ingestion failure class, now in its tenth sighting across
  runs). The sweep-compare tables on identical seeds are the
  comparison of record. This is a DIAG paper, not a
  before/after lever comparison, so no panel pair exists.
- Neutrality vs the 1815 band is DEVIATED (§1) — reported,
  attributed to base drift with the det-gate evidence, never
  presented as recorder non-neutrality. The recorder's own
  neutrality on THIS base is proven by the det-gate (leg a).

## INSTRUMENT NOTES

- New: scripts/test-woundprice-analyze.js (pure corpus
  analyzer: Stage-1 re-derivation via analyzeDefwound,
  manufactured rounds distribution, met residual sizing,
  neutrality vs 1815, value-based corpus gates; exit 1 on gate
  failure). Proof: node --check clean; analyzer gates pass
  (8/8 rows, errs 0, overflow values 0); defwound analyzer
  unit proof scripts/test-defwound-diag.js 25/25 on this base.
- Reused VERBATIM (never edited): scripts/policies/
  defwound-diag.js, scripts/test-defwound-diag-sweep.js
  (--detgate/--one/--transcript modes), raftdraft-diag,
  spawnsrc-diag, oldcore-diag, tableseat-nowait, sim-harness.
- Corpus: evidence/2026-10-26/perseed-sim-woundprice-a/ (8
  per-seed JSONs + woundprice-analysis.json, in the worktree
  evidence dir — never /tmp). Sense file:
  evidence/2026-10-26/sim-woundprice-a-sense.txt (transcript
  tap, corpusMatch=true).
- What the recorder cannot see (stated, not hidden — same as
  defwound): player (tb) fights have no resolve rows — their
  endings reach this analysis only as oldcore removal kinds
  (kill/melt); trick-dismissal mFlees are not distinguished
  from break-line mFlees in resolve rows (bounded: wave-3+
  defender manufactured events are only 1 on this base).
- DIAG ONLY: zero src/js changes (git diff for src/ is empty),
  zero default flips, zero combat-code changes. No
  [needs-eyes] flag: measurement only.

## NEXT BLANKS, IN ORDER (for the coordinator, not this run)

1. Steve's ruling on §5 (met-finish scope, loot/ledger scale,
   fight scope, acceptable finish cost) — the paper is written
   so the ruling can be given without re-measuring the residual.
2. If ruled IN: a met-finish arm with its own pre-registered
   guards on CURRENT master (own control re-run — never judge
   against 234/4/8), pricing its round cost from zero, not
   from +1.
3. If a companion is ever bundled with any finish: it must
   cover the raid cascade, not just field entry, and its
   guards must be pre-registered against the bundled
   trajectory — fieldguard's numbers do not transfer.
4. Defender-fight narration repetition (the "0 rounds, not a
   scratch" shrug) — a narration blank, not a mechanics blank,
   carried from defwound.

scale-onramp stays converging (NOT converged): this paper
moves no lever, lands no rule, and reports the wall on the
current base as national 7/8, table entered 1/8, wins 1/8,
wave-4 6/8, wave-5 0/8. The standing directive stands.
food-economy untouched (sibling loop B).
Convergence state: converging.
