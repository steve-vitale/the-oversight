# Journey endgame r56 — 199 IS A HOLD, NOT A SCORE + THE ROAD GOT HARSHER (lane B, 2026-10-27)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next).
Pre-registration: evidence/2026-10-27/journey-endgame-r56-prereg.md (written
BEFORE any play). Instrument + evidence only, zero src/js changes.
Merged locally, pending ship.

Rotation note (verified before play, see prereg): r55 endgame merged
as b486bcba3, then social r59 adoption advanced 5 → 6, crisis r54
advanced 6 → 7, succession r52 advanced 7 → 4. Rotation-b reading
4 this run is the correct post-cycle value, not a missed write.

## Leg question (r55's carried items, in order) — answered

1. STANDING-200 CHASE — NOT REACHED, BUT THE MECHANISM IS NOW NAMED.
   No village peaked at 200 or above; no wave-5 unlock; no full seat.
   Two more villages peaked at exactly 199 (88204 control, 88207) —
   the fifth and sixth 199s across r55–r56 (88102, 88105, 88107,
   88204, 88207, plus 88203-class below-bar villages that never
   approached it). The 199 is not a near-miss score: it is the
   t5-1 HOLD bound in standing.js. A village sits at 199 because
   the wave-5 combat-readiness gate (defer5) holds it there until
   it meets the readiness demand — armored 4, armed 6, tricks 3,
   veterans 2. What clears 199 is not one more point of standing;
   it is meeting every readiness bar. Closest this run: 88204
   (control) short on veterans ONLY (1/2 living), and 88203 short
   on veterans only but below-bar at 172 (genuinely short, not
   held). 88207, the other 199, was short on THREE bars at the
   sit (armor, weapons, veterans). The banking problem and the
   standing problem are the same problem now: bank one more
   living veteran (88204-class) and clear the armor/weapons bars
   (88207-class), and the hold releases.
2. TWO RETIREMENTS, APPLIED. Gate-passed-uncommitted: 0 hits again
   (the branch stays in the analyzer, no longer a binding
   question). Daily-slice withdrawal detector: retired — and
   this run recorded ZERO withdrawals of any kind, so there were
   no detector events at all, rescan or otherwise. That is not a
   detector failure; the decline simply never fired on this block.
3. DECLINE-BOILERPLATE WART — NO NEW DATA, STAYS CARRIED. Zero
   withdrawal seeds means the boilerplate-vs-deed mismatch rate
   is undefined this run, not zero. Code read (no change made):
   the "PELLET HUMS / NO FEAST, NO SURGE" line in progression.js
   is a single hardcoded boilerplate string with the state-
   specific want-list (missTxt) appended; there is no unused
   state-specific boilerplate template waiting to be wired. The
   beat itself is reactor-specific (it fires only while the
   fusion reactor is online). Per the prereg's rule — generic by
   design means document, don't silently reword — the wart is
   DOCUMENTED for Steve's call: should the boilerplate name the
   village's actual deed state, or stay as the System's generic
   accusation with the honest want-list after it?
4. CONTROL SURVIVAL WATCH — STREAK BROKEN. r55's control died
   before its voicing window; r56's control (88204) announced
   d90, sat d90 promptly, won relay/dark with 9 alive, and
   voiced (noticed 1, bandCrossings 1). M5 GO. The second-strike
   substrate question does NOT trigger.
5. M3 CONVERSION EDGE, SPREAD WATCH — DOES NOT GENERALIZE. Arm B
   0 kills vs Arm A 0 kills on this block. r55's edge (4 vs 0,
   all on one seed) was one village's road, not an arm effect,
   and on fresh seeds it vanishes entirely: 88207 fought 10
   census fights and killed nothing (4 fled, 4 monster-fled,
   1 talked-around otherEnd, 1 villager died). The NOWALKIN
   lever did not produce kills here; it produced flights.
6. TRANSCRIPT-HEADER WART — FIXED. Transcripts now say
   "journey-endgame r56" (verified by grep on the emitted
   files), not r52.
7. TELEMETRY BASELINE PROPOSAL — CARRIED, NOT ROLLED (see
   Metric review 6).

## Pre-registered bindings (§14 — a miss is NO-GO, never re-scored)

- M1 GUARD: GO 7/7 — 4 announced (88202, 88203, 88204, 88207) +
  3 honest-death (88201, 88205, 88206).
- M2 CENSUS: NO-GO — coverage 100% (every census fight carries a
  primary outcome), but only 1/3 Arm A seeds recorded a fight
  (88203, 2 talkDown; 88201 and 88202 zero-fight). The miss is
  opportunity, not instrumentation: the fights never opened.
- M2b ATTRIBUTION: GO — 1 dieFlag fight, classified, NAMED:
  88207 d111 reunion, Maeve Traore (registerDeath, the arena).
- M2c ENGINE COVERAGE: GO 6/6 — fights == opens on every waves
  seed, censusErrors 0 everywhere, policy-only opens 0.
- M2d COMMIT-GATE NAMED: GO 5/5 — never-observed ×4, gate:hp ×1
  (88207 d79 algorithm, hp 0.246); retired class 0, branch kept.
- M3 CONVERSION: NO-GO 0 vs 0 — neither arm killed anything.
- M3b LIVING VETERAN (prereg replication bar >=2): NO-GO 0/6 —
  spread (>=1) also 0/6 on waves seeds. r55's solve does NOT
  replicate: no waves seed banks even one living veteran. (The
  control banks 1, but the control is not a waves seed.)
- M4 WAVE-5/FULL: NO-GO 0/6 — no wave-5 unlock, no full seat.
  Closest: 88204 + 88207 at standing 199, held by defer5.
- M5 VOICING CANONICAL: GO 1/1 — 88204 crossed + voiced.
- M6 GUARD NAMED: GO 1/1 — 88203 deferred 1 day, guard hp.
- M7 PEOPLE: GO — 2 finals sense-read in full (below),
  0 senseless flags.
- M8 EXIT CANON: GO 4/4 — all mFlee fights matched to codex
  counter text (algorithm, eater, influencer, reunion).
- M9 SUPPLY: GO by code rule — 66 boundary blocks across 7
  seeds, every one the same contention line ("The <monster>
  stops at the boundary — pacing, unwilling. Something else
  is already here. It's still out there."). Same rule as
  r51–r55 (ONE MONSTER PER TILE + Haven safe law).
- M10 FULL-SEAT GAP: GO 2/2 — 88203 [w4:2/3, w5:0/2],
  88207 [w3:3/4, w5:0/2]. Control's gap is w5-only (not counted
  in the waves-only verdict, reported here).
- M11 STANDING PEAK (new): GO — peaks reported 6/6 waves seeds:
  99, 172, 172, 0, 70, 199. At-199: 1 (waves) + control 199.
  At-200+: 0.
- REG: r35 auditNamed GO 3/3; r37 satPenalty GO 3/3.
- PRIMARY: NO-GO | ALL: NO-GO (M2 + M3 + M3b + M4 only; every
  other binding GO).

## RESULTS (7/7 seeds)

| seed | plan | ann | sat | seat | path/branch | won | census fights | kills | living vets | uw | peak |
|------|------|-----|-----|------|-------------|-----|---------------|-------|-------------|----|------|
| 88201 | waves | — | — | — | — | no (village-lost, 1 alive) | 0 | 0 | 0 | 3 | 99 |
| 88202 | waves | d90 | — | — | — | no (village-lost, 4 alive) | 0 | 0 | 0 | 4 | 172 |
| 88203 | waves | d107 | d108 | lesser | feared/light | yes (8 alive) | 2 talkDown | 0 | 0 | 4 | 172 |
| 88204 | forcedrift (control) | d90 | d90 | lesser | relay/dark | yes (9 alive) | 2 vKill | 2 | 1 | 4 | 199 |
| 88205 | wavesnw | — | — | — | — | no (village-lost, 5 alive) | 0 | 0 | 0 | 3 | 0 |
| 88206 | wavesnw | — | — | — | — | no (village-lost, 0 alive) | 0 | 0 | 0 | 3 | 70 |
| 88207 | wavesnw | d114 | d114 | lesser | beloved/light | yes (1 alive) | 10: 4 vFlee, 1 otherEnd, 4 mFlee, 1 vDie | 0 | 0 | 4 | 199 |

## THE HEADLINE: 199 IS A HOLD, NOT A SCORE

The sit-time unlock records say it exactly:

- 88207: standing 199, holdKind defer5, rd5short [armor,
  weapons, veterans]. Raw score 258 — the village HAD the
  numbers; the readiness gate held it at t5-1. Its own war-path
  audit says the same thing honestly ("wave-5 bar reads: armor
  the village (0 of 4 fighters armored); put weapons in hands
  (1 of 6 armed); blood your fighters (0 of 2 veterans)").
- 88204: standing 199, holdKind defer5, rd5short [veterans]
  only. One more living veteran clears its hold (if the other
  bars stay met).
- 88203: standing 172, holdKind below-bar, rd5short
  [veterans]. Not held — genuinely short of 200, and still
  veterans-short on readiness.

Next run's chase question is therefore sharper: not "can any
village bank one more standing point" but "can any village
clear every readiness bar at the sit" — and the veterans bar
is the binding one on two of the three sat villages.

## THE SECOND HEADLINE: THE ROAD GOT HARSHER

4 of 7 villages died (88201, 88202, 88205, 88206) — against
r55's 2 of 7. Four of six waves seeds never sat (two never
announced, one announced then died, one extinct). Deaths are
named, not statistical: 88201 bled out across 69 days
(starvation, wounds that wouldn't close, alien, thirst, arena);
88206 lost all 14 (arena ×4, alien, combat, dehydration,
sickness, expedition). The two villages that sat did so on
thin margins: 88207 won with ONE villager alive; 88203 won
with 8 after 12 deaths. The endgame road on this block is not
"hard but fair" — it is a filter that kills most villages
before the table, and the ones that pass arrive depleted.
Whether that harshness is the intended price of the road or a
substrate problem is a Steve-call question, not a lever to
tune silently: the substrate is unchanged from r55, only the
seeds are fresh.

## THE THIRD HEADLINE: ESCAPE VARIETY RETURNS

r55's outcome variety collapsed to talk-or-kill (vFlee 0,
mFlee 0, otherEnd 0). r56's 88207 alone restores all three:
4 villager flights, 4 monster flights, 1 otherEnd, 1
villager death, 0 kills across 10 fights — a village that
survived its road by NOT killing. The mFlee fights all match
their monsters' codex counter text (M8 GO). The road's fights
are not kill-or-talk; on a fighting seed they are mostly
flights, and the village still sat and won.

## WHO DIES IN WAVE-4 FIGHTS (M2b)

- 88207 d111 reunion (vDie): **Maeve Traore** (registerDeath,
  the arena) — NAMED. The analyzer classifies this death
  against the reunion fight window; the death record itself
  says "the arena," and this note reports both, not just the
  fight label.
- Non-census arena deaths run through the block as usual
  (88201's Elena Petrova d69, 88203's Eduarda Nogueira +
  Fawzia Linjawi d19, 88206's four arena deaths) — the arena
  remains the background lethal system beside the road.

## ENCOUNTER SUPPLY (M9 — contention, again)

66 boundary blocks across 7 seeds, every one the same line
(see bindings). 88207 alone accounts for 23 — the fighting
seed is also the most-blocked seed: arrivals queue at the
boundary while the village fights the ones already inside.
88205, the quietest seed, has 2 blocks and 0 fights: sometimes
they simply don't arrive before the run ends (r55's 88101
counter-case, repeated).

## VILLAGE ASSESSMENT (plain words)

- **88201 — 1 alive, village-lost.** The bled-out village: 11
  deaths (ambush, starvation ×3, sickness, wounds ×2, alien
  ×2, thirst, arena), never announced, never fought a wave-4
  fight, standing peaked at 99. It died of everything at once.
- **88202 — 4 alive, village-lost after announcing.** The
  announced-then-lost village: reached d90, waited (greedy
  1 wait), never sat, 11 deaths (starvation ×3, alien ×3,
  sickness ×2, expedition, thirst, monster). The table was
  coming; the village wasn't there to meet it.
- **88203 — 8 alive, won feared/light.** The patient village:
  announced d107, sat d108 on the hp guard after a 1-day
  deferral, 2 talked-down fights, 0 kills, standing 172. Two
  villagers ascended (Jovan Milic, Diana Osei) — "2 ascensions
  from one village... Nobody has ever seen that before."
- **88204 — 9 alive, won relay/dark (control).** The control
  that lived: announced and sat d90 promptly, 2 engine kills,
  1 living veteran, standing 199 held by defer5 on veterans
  alone. The closest village to clearing the wave-5 hold, and
  it isn't even on the waves road.
- **88205 — 5 alive, village-lost.** The quiet village: 7
  deaths (starvation ×2, sickness ×3, combat, arena-adjacent),
  0 fights, standing peaked at 0 — it never even registered
  on the standing board before dying.
- **88206 — 0 alive, village-lost.** The extinct village: 14
  deaths, every cause in the book, 0 fights, standing 70. The
  road never met it; the world did.
- **88207 — 1 alive, won beloved/light.** The last-person
  village: 10 census fights, 0 kills, sat the day it
  announced on the roster guard, standing 199 held by defer5
  on three bars. One survivor sat the table and won it by
  naming the dead.
- Who leads: the bearer, always — no succession this run.
  Who is miserable: 88206's nobody and 88201's 1 survivor.
  What is missing: a full seat (closest gap: w5-only on the
  control, w5 + one more bar on both sat waves villages); a
  wave-5 unlock (closest: defer5 on veterans alone, 88204);
  a living veteran on any waves seed (0/6); a kill on any
  waves seed (0/6); a withdrawal to measure (0/7).

## PEOPLE CHECK (SENSE-TESTING LAW — full reads)

1. **The beloved final (88207, full window, 38 lines).** The
   audit prices honestly (lesser seat, waves 1–3 faced 16/7/3,
   6 wave-4 fought, 11 contests, 4 crises) AND names the unmet
   bars in the same breath (wave-4: armor 0/3, weapons 1/5,
   veterans 0/1; wave-5: armor 0/4, weapons 1/6, veterans 0/2)
   — the JSON's rd5short, spoken aloud. The beloved beats
   build (the audience chanting in a language without words;
   "the cast is your village") and resolve ("You spend it all
   — the love, the light, the finale slot — on people the
   cameras never found. You name the unfilmed villages. You
   name the dead."). Observation, not a flag: the final never
   says only one villager is left alive, so "the village
   endures" lands as the village's story enduring rather
   than its headcount — and naming the dead fits a
   one-survivor village almost too well. PASS.
2. **The feared final (88203, full window, 152 lines).** The
   audit names both bars honestly (lesser, 17/11/6, 2 wave-4
   fought, 13 contests, 5 crises; wave-5 bar: veterans 0/2
   only — exactly the JSON's rd5short). The feared beats
   build (footage unasked, restraint as the frightening
   thing) and resolve ("Show mercy" — mercy from a predator,
   terror pledged as a shield over every village). The
   architect/pantheon beats name the two ascensions (Jovan
   Milic, Diana Osei) with the village's credit kept
   ("The galaxy will remember the god's name. The village
   will remember who built the door."). The window's village
   life is people-like: gossip that mutates ("Half of it's
   true anymore. You're not sure which half."), Diana's
   audience anxiety, Enzo tasting Ugly Beast flesh ("It's
   food... You know it in your gut. Literally."), and the
   pantry-full behavior working as designed after the
   surplusfeed removal (shelves full → "leaves the harvest
   standing and turns to the stone pile instead"; "the
   shelves are full, so 241 kcal is eaten at the fire
   instead"). PASS.
- 0 senseless flags. Warts carried: (a) "Your pack is full"
  repeats across day parts in the 88203 window (mild spam,
  not senseless); (b) "You wait. The light changes. Nothing
  asks anything of you." ×3 — the wait verb's narration,
  honest but thin; (c) decline boilerplate vs deed state
  (above, no new data).

## BLANKS

- FILLED (instrument): transcript header r52 → r56; M11
  standing-peak table (peaks now machine-reported per seed);
  M3b verdict now matches its prereg replication bar (>=2,
  not the analyzer's old >=1).
- FILLED (finding, not a fix): 199's mechanism — defer5 hold
  with named short bars, from the sit-time unlock records.
  The chase question is reworded for the next run (see
  Metric review 1).
- DOCUMENTED (open, carried): decline boilerplate vs deed
  state — no state-specific template exists to wire; the
  question is Steve's (generic accusation + honest want-list,
  or state-aware boilerplate?).
- DOCUMENTED (open, new): the road's harshness on fresh seeds
  (4/7 village-lost, 0 kills, 0 living veterans on waves
  seeds). Substrate unchanged from r55; whether the filter
  is the intended price is Steve's call, not a silent tune.
- DOCUMENTED (open, new): 88205's standing peak reads 0 in
  the diag (no unlock snapshot was recorded for this village
  before it died). Not claimed as a bug — the village died
  early with 0 fights and no window — but the M11 table's 0
  reads as missing data unless the note says why, so it is
  said here.

## Metric review (§14)

1. **THE CHASE QUESTION IS REWORDED (not re-scored).** r55's
   question — "can any village bank one more standing point"
   — assumed 199 was a score one point short. The sit-time
   records prove it is a hold bound (t5-1, defer5). The
   bindings above are judged as written (M4 NO-GO stands);
   the NEXT run's prereg asks the corrected question: "can
   any village clear every readiness bar at the sit" — with
   the veterans bar named as the binding one on two of three
   sat villages.
2. **PILOT-GATE DEVIATION, owned plainly.** The revised pilot
   gate (any leg-question signal: census fight OR withdrawal
   OR full-seat gap movement) FIRED on the pilot: the control
   sat and won at standing 199 (gap movement), recorded 2
   census kills, and voiced. Expansion to the full sweep was
   justified on those signals, not on the waves seeds (both
   pilot waves seeds died). The pilot's waves-seed deaths
   were themselves the harshness signal the sweep confirmed.
3. **M2's NO-GO is opportunity, not instrumentation.** The
   census covered 100% of the fights that opened; four waves
   seeds opened zero. The instrument cannot census fights
   that never happen, and the note does not pretend otherwise.
4. **M3's NO-GO reframes r55's edge.** r55: Arm B 4 vs Arm A 0
   (one seed). r56: 0 vs 0 (seven seeds). The edge is not an
   arm effect on this evidence; it is a seed effect. The
   NOWALKIN lever's next-run question is whether it produces
   kills on ANY fresh block, not whether it beats Arm A —
   on a block where nobody kills, the comparison is empty.
5. **M3b's NO-GO is a replication failure, stated plainly.**
   r55 banked 2 living veterans on 88107; r56 banks 0 on all
   six waves seeds (control: 1, excluded from the waves
   verdict). The banking problem is NOT solved in general;
   it was solved once.
6. **Telemetry deviation check:** tool reports LOUD on both
   metrics — VERDICT: EXPLAINED, baseline NOT rolled (see
   below). Same verdict class as r48–r55, cleaner numbers:
   this run's sits are prompt/hp/roster-guarded with penalty
   0 and maxTier 0, while the baseline describes long-
   deferral sits (r37). NEXT-RUN PROPOSAL (carried, not a
   mid-run re-score): re-seed the baseline from a
   same-regime guard-ended corpus and record the regime in
   the file, as the baseline's own note directs.
7. **Balanced panel (§15):** no panel comparison applies —
   zero src/js changes, no lever moved on the default path
   (NOWALKIN default off; census + gate snapshot are
   read-only instrumentation; DET green on the final probe
   code proves read-only). The comparison is r55→r56 via
   identical substrate, and Arm A→Arm B on one variable.

## Regressions / checks

- PILOT (88201 Arm A + 88205 Arm B + 88204 control, 180d sweep
  mode): gate FIRED (control sat + standing 199 + 2 census
  kills + voicing) — expansion justified and owned in Metric
  review 2. Pilot waves seeds both village-lost.
- SMOKE (88201, 120d): pipeline ran, village-lost at 120d
  (1 alive) — consistent with the 180d outcome, not a
  pipeline failure.
- DET (instrument-on twice, 2x120d, seed 88201, final probe
  code): GREEN byte-identical.
- FID (env unset: wrapped == pure capable+deedhunt, mini
  gameDays/won/alive/pantry): GREEN byte-identical (57d,
  won false, alive 1, pantry 0 both sides — the 88201 village
  collapses early with or without instrumentation).
- ANALYZER: exit 1 = verdicts (PRIMARY NO-GO | ALL NO-GO),
  not a crash; verdicts identical on re-run.
- CHECK-QUICK (adoption completion, post-rebase, 2026-10-27):
  278 passed, 9 failed in 474s — IDENTICAL script list to
  r55's standing profile (hide-discovery, measurement
  comparison/proof-update/workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, parity-20261014 gear
  spear+jacket, establishment-r20-fixes racks-full next-day
  voice). This run changed zero src/js, so the 9 are
  pre-existing on current master, not a regression from this
  commit; check.js does not execute this run's probe/analyzer
  scripts. (The r56 run itself died during its own check-quick
  run at 10:55 UTC with only a truncated log; this result is
  the adoption run's post-rebase re-run, not the dead run's.)

## Telemetry deviation check (2026-10-27)

- Tool verdict: LOUD on satPenalty.penalty and maxTier (7
  files, 2 metrics).
  - satPenalty.penalty: baseline 91 -> current 0 (every sat
    seed penalty 0; non-sat seeds carry no penalty).
  - maxTier: baseline 16 -> current 0 (no greedy tier
    escalation on any seed this run).
- Per-seed reading: the same guard-ended population as
  r48–r55, taken further — prompt sits (88204, 88207) and a
  1-day hp-guard deferral (88203) carry no penalty by
  construction (tier 0, losses 0). VERDICT: EXPLAINED;
  baseline NOT rolled.

## Evidence

- evidence/2026-10-27/journey-endgame-r56.md (this note)
- evidence/2026-10-27/journey-endgame-r56-prereg.md
- evidence/2026-10-27/perseed-endgame-r56/endgame-r56-{88201..88207}.json
- evidence/2026-10-27/perseed-endgame-r56/endgame-r56-{88201..88207}-transcript.txt
- journey-endgame-r56-sweep.log (in goal hidden_files; NOT
  committed to the repo: sweep stdout is per-run bookkeeping)
- journey-endgame-r56-analyzer.txt (in goal hidden_files; NOT
  committed: analyzer stdout is per-run bookkeeping)
- journey-endgame-r56-checkquick.log (in goal hidden_files;
  NOT committed: check logs are per-run bookkeeping)
- scripts/probe-endgame-r56-20261027.js
- scripts/analyze-endgame-r56-20261027.js
- scripts/policies/capable.js (unchanged — NOWALKIN_W4 rule from r50,
  env-gated, default off; no src/js changes this run)
