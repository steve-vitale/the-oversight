# Journey endgame r51 — FIGHT-CAUSAL DEATH ATTRIBUTION + WAVE-4 EXIT CANON + ENCOUNTER SUPPLY (lane B, 2026-10-25)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next).
Pre-registration: evidence/2026-10-25/journey-endgame-r51-prereg.md (written
BEFORE any play). Instrument + probe-local read-only wrappers; no src/js
changes. Merged locally, pending ship.

## Rebase addendum (sibling landing mid-run)

While this run was in flight, a sibling loop landed 3 commits on master
(belltoad chorus fix + postflee rest threshold, both [needs-eyes]).
Per the run body's rebase rule, the branch was rebased onto the new
master INSIDE the worktree (clean, no conflicts — this run's commit
touches only new files), the instrument was re-proved (DET GREEN +
FID GREEN, identical mini values), and the full 7-seed sweep was
RE-RUN on the rebased base so the committed evidence describes the
merged tree, not the pre-landing base. Verdicts reproduced exactly
(M1 GO, M2 NO-GO 1/3, M2b GO 5/5, M3 GO 1v0, M3b NO-GO, M4 NO-GO,
M5 GO, M6 GO, REG GO). Two control-only diffs on the new base, both
outside the scored waves metrics: 88064's relay final pick changed
from final:merge to final:voice, and the control now ends with 1
living veteran (was 0); M9's blocked-arrival tally moved 94 → 93
(noise-level). The check-quick log below is also from the rebased
tree.

## Leg question (r50's three named next steps, in order)

1. WHO dies IN wave-4 fights (fight-causal, not day-window)?
2. Which wave-4 exits are designed wins, and which are flights?
3. Why do unlocked villages go unmet (encounter supply)?

## Pre-registered bindings (§14 — a miss is NO-GO, never re-scored)

- M1 GUARD: >=5/7 reach the window or a voiced non-table path.
- M2 CENSUS COMPLETE: every committed wave-4 fight carries a primary
  outcome, AND >=2/3 Arm A waves seeds record >=1 committed fight.
- M2b ATTRIBUTION: every dieFlag fight classified causal-vs-daywindow;
  >=1 dieFlag fight (if any) carries >=1 NAMED fight-causal death.
  NO-DATA if no dieFlag fights exist.
- M3 CONVERSION: Arm B total wave-4+ kills > Arm A total.
- M3b LIVING VETERAN: >=1/6 waves seeds ends with >=1 living veteran.
- M4 WAVE-5/FULL: >=1/6 waves seeds unlocks wave 5 or the full seat.
- M5 VOICING CANONICAL: 88064 control crossings >= 1 AND noticed >= 1.
- M6 GUARD NAMED (deferred scope): every sat waves seed with deferDays
  >= 1 records a named window-end guard (not 'unknown').
- M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
- M8 EXIT CANON: every mFlee census fight matched to its monster's
  codex counter text.
- M9 SUPPLY: every wave-4 arrival that does not become a fight recorded
  with its cause line, or the code rule cited.
- REG: r35 auditNamed on sat seeds with nonzero w4/w5; r37 satPenalty
  present + voiced-line match on sat seeds.

## RESULTS (7/7 seeds)

| seed | plan | ann | sat | seat | path/branch | won | census fights | kills | living vets | uw |
|------|------|-----|-----|------|-------------|-----|---------------|-------|-------------|----|
| 88061 | waves | — | — | — | — | no (village-lost d82) | 0 | 0 | 0 | 3 |
| 88062 | waves | d111 | d125 | lesser | beloved/light | yes | 0 (see blind spot) | 0 | 0 | 4 |
| 88063 | waves | — | — | — | — | no (survived, no window) | 1: vDie | 0 | 0 | 4 |
| 88064 | forcedrift | d90 | d90 | lesser | relay/dark | yes | 0 (control) | 0 | 0 | 4 |
| 88065 | wavesnw | — | — | — | — | no (village-lost d55) | 0 | 0 | 0 | 3 |
| 88066 | wavesnw | — | — | — | — | no (survived, no window) | 8: mFlee2 vFlee6 | 0 | 0 | 4 |
| 88067 | wavesnw | d90 | d96 | lesser | witness/light | yes | 6: vDie4 vKill1 otherEnd1 | 1 | 0 | 4 |

- **M1 GUARD: GO 7/7** — 4 announced; 88061/88065 resolve via honest
  death (village-lost); 88063/88066 via a voiced non-table path: the
  TABLE WITHDRAWAL beat (see below — the analyzer's clause is named
  reactor-honesty, but the mechanism is withdrawal, and the note
  corrects the name here rather than repeating it).
- **M2 CENSUS: NO-GO on the second clause, GO on coverage.** Every one
  of the 15 committed fights carries a primary outcome (coverage 100%,
  censusErrors 0) — but only 1/3 Arm A seeds recorded a fight (88063).
  The deeper finding (below): the census class itself undercovers —
  88062 fought 5 wave-4s the census never saw. Not re-scored.
- **M2b ATTRIBUTION: GO 5/5.** Every dieFlag fight carries a NAMED
  fight-causal death (see below). The instrument works.
- **M3 CONVERSION: GO 1 vs 0.** Arm B's first kill of the r46–r51
  streak: Sam Wilson put down the Influencer on d84 (88067, 9 turns).
  Thin (1 vs 0) and stated as thin — but it is the binding metric as
  written, and the kill is real, named, and dated.
- **M3b LIVING VETERAN: NO-GO 0/6.** Sam Wilson killed the Influencer
  and died the same day to a Reunion — the kill exists, the veteran
  does not. The bar needs LIVING veterans.
- **M4 WAVE-5/FULL: NO-GO 0/6.** Wave 5 still locked everywhere; the
  full seat still unoffered. The veteran bar (0 of 2) is the blocker
  on 88067; armor/weapons/veterans on 88062.
- **M5 VOICING CANONICAL: GO 1/1** — 88064: bandCrossings 1, noticed 1,
  relay/dark merge final resolved.
- **M6 GUARD NAMED: GO 2/2** — deferred sat waves end on hp (88062)
  and not-ready (88067).
- **M7 PEOPLE: GO** — 3 beats sense-read in full (below), 0 senseless
  flags.
- **M8 EXIT CANON: GO** — both mFlee fights matched to codex slain
  stages (below); the six vFlee fights are classified in the note too.
- **M9 SUPPLY: GO (mechanism named).** 94 boundary blocks recorded;
  12 true wave-4 blocks (rawName-verified); the code rule is cited
  below. The lookback artifact (one 'Big Thing' line misattributed to
  Herald) is disclosed, not hidden.
- **REG r35: GO 3/3. REG r37: GO 3/3.**
- **PRIMARY: NO-GO** (M2 clause, M3b, M4). **ALL: NO-GO.**

## THE HEADLINE: THE CENSUS WAS BLIND TO DAILY-ROUND FIGHTS

88062 fought 5 wave-4s (audit: "with 5 wave-4 fought") and the census
recorded ZERO. Its transcript shows the fights plainly: a Suburb fight
ended by Walk In ("You walk in open-handed, talking... They stand
down"), a Reunion fight ended by barrier flight ("You crash through
to a new area... You fled the fight by leaving the area"). The cause,
found by code reading (not guessing):

- `scripts/policies/capable.js` — `capable.daily` ends with
  `finishLiveFight(Game, ctx)`, which loops a live fight to completion
  calling the raw `capableFight` function DIRECTLY.
- The census wraps the LAYERED `policy.fight` (diag > armory >
  vetcommit > capable). `finishLiveFight` bypasses every layer —
  vetcommit's commit flags are never set there, and the census wrapper
  never runs.
- Fights that start during the daily round (a forage trip, the walk
  home, a hunt's return — the comment on `finishLiveFight` says exactly
  this) and finish inside daily are invisible to the census. The
  driveFights-driven fights (upkeep patrols, wait-tick fights) ARE
  seen; the daily-round fights are NOT.

Consequences, stated plainly:

1. The r46–r51 census distributions describe DRIVEFIGHTS-DRIVEN
   committed fights only — a subset of wave-4 fights, not all of
   them. Every "0 kills" claim from those runs survives only because
   kills are cross-checked against the engine-level `waveKillLog`
   (complete: 88062's is empty, so no kill was missed there) — but
   every fight-outcome distribution from r50/r51 is partial.
2. M2's "committed" class is itself the blind spot's boundary:
   daily-round fights are uncommitted-BY-CONSTRUCTION (vetcommit
   never sees them), so M2's first clause holds for its defined
   class while the class undercovers the leg's real question. The
   run does not re-score this away: M2 stays NO-GO on its second
   clause, and the class coverage is the finding.
3. The fast-fight tally (built this run for single-call resolutions)
   caught NOTHING (fastW4 0 everywhere) — correctly, as it turns
   out: the missing fights are not single-call fights, they are
   daily-round fights on a different driver. The tally stays in the
   instrument as a guard for a different blind spot, not as the fix
   for this one.
4. r52's instrument work, named: move the census to the ENGINE level
   (wrap `Game.startCombat` for opens + `Game.tbEnd`/over-transitions
   for closes) so the driver no longer matters — or wrap the daily
   boundary (record fights that open and close inside one daily).
   Until then, no census number from this instrument may be quoted
   as "all wave-4 fights."
5. A second, smaller gap in the same family (recorded, not chased
   this run): 88062 shows vetFights=3 (vetcommit counted 3 wave-4
   turns) against census n=0. Vetcommit detects wave-4 by DATA lookup
   (`beastWaveOf` on monsterId); the census detects by fighter
   `mdef.wave`. Where those differ (arena fighters, variant defs),
   the census misses turns vetcommit counts. r52 should detect wave
   by data lookup in the census too.

## THE TABLE DID COME — AND WITHDREW (M1's real mechanism)

88063 and 88066 did not go unvisited. Their transcripts carry the
table's WITHDRAWAL beat (ledger.js `tableScene`, the no-seat path):

> "◈ THE TABLE — the ring of pale light flickers at the edge of the
> sky... and does not come. ... WE PRICED THE RUN. NO HUNGER ON THE
> RECORD — THE PELLET HUMS WHERE THE FIRE SHOULD BE. NO FEAST, NO
> SURGE, NOTHING HERE WE CAN PRICE. ... The mantle may pass to
> hungrier hands; the table will still be here."

The pellet is the FUSION REACTOR ("You will never be hungry again.
One reactor per world: yours. It does not come out.") — and the
reactor is a ceiling as well as a floor: feasts refuse their buff
("the reactor is a ceiling as well as a floor"), so the village can
never produce the food-thesis deeds (feast/surge) the lesser seat
requires. The table prices that as "no hunger on the record" and
leaves. 88063's withdrawal also wants "a regional standing";
88066's also wants "wave-3 monsters faced" — but both name the
food-thesis deeds first, and both name the pellet as the cause.

Two consequences:

1. "The table never came" is WRONG for the unannounced survivors —
   it came, priced, and withdrew. The run's earlier phrasing (and
   r50's "unmet" framing) is corrected here: unannounced ≠ unvisited.
2. The probe's announce detector MISSED these visits (announceDay
   null on both seeds): the withdrawal beat fires without setting
   the announced flag the probe reads (or announce-and-withdraw
   collapse inside one daily). r52's instrument work adds a
   withdrawal detector (match the withdrawal line in capture) so
   M1 counts visits, not just announcements.

The design question this leaves for Steve's call shelf (not a fix
proposed here): a reactor bearer can never earn the food-thesis
deeds, so the reactor is table-poison for the lesser seat — the
game itself suggests the remedy ("the mantle may pass to hungrier
hands"), but a player who took the reactor early may not know they
have closed the table until the withdrawal beat tells them, days
later. Whether that is fair price or a trap is Steve's call.

## WHO DIES IN WAVE-4 FIGHTS (M2b — the attribution answer)

All 5 dieFlag fights carry a named fight-causal death — matched by
tbfight OBJECT identity (the death wrapper records the live fight at
call time), not by day:

- 88063 d178 eulogy: Addison Rosenberg — registerDeath, 'the arena'.
- 88067 d84 reunion: Esther Fisher — 'the arena'.
- 88067 d84 reunion+reunion: Sam Wilson — 'the arena'.
- 88067 d85 reunion×3: Ximena Morales — 'the arena'.
- 88067 d85 reunion: Elijah Scott — 'the arena'.

The surprise inside the answer: **every fight-causal death in a
wave-4 census fight carries cause 'the arena'.** These are arena
fights — contest combat against wave-4 monsters — not field fights.
The villagers died IN those fights (identity match, not day-window),
in arena combat. r50's caveat ("vDie means died on the fight's day")
is now replaced, for census fights, with "died while this fight
object was live, in the arena."

Two wrapper mechanics proven on the way:

- Combat deaths ride BOTH channels: 88063 d123 Hassan and Nina each
  appear once via `tbVillagerFalls` (cause 'combat') and once via
  `registerDeath` (cause 'combat'), same fight, same day. The census
  dedupes by villager id per fight — one death, not two.
- `registerDeath`'s return contract holds: success returns the corpse
  object, the double-death guard returns null — the wrapper records
  only real registrations (0 wrap errors on all 7 seeds).

## THE FIRST KILL (M3 — and why the veteran bar still stands)

88067 d84, 9 turns: the party killed the Influencer (census vKill,
killFlag true). `waveKillLog`: one entry, killer Sam Wilson, day 84.
Sam Wilson died the same day in a Reunion fight (causal, arena).
The audit voices it veiled — "On day 84, Sam put down The Ugly Thing"
(the epithet, not the true name: knowledge-gating on the war-path
line, noted not filed). So the streak breaks at the kill but not at
the veteran: **the bar needs living veterans, and this run's only
killer died hours after his kill.** That is the veteran problem in
one day: kills are now possible on the fight-don't-talk arm; keeping
killers alive through the reunion days after is the next wall.

## HOW WAVE-4 FIGHTS END (the r51 distribution — partial class, see above)

15 committed driveFights-driven fights: **vDie 5, mFlee 2, vFlee 6,
vKill 1, otherEnd 1.** Read with the blind-spot caveat: this is the
distribution for driveFights-driven fights, not for all wave-4
fights.

- **mFlee (2, both 88066):** Reunion d126 (4 turns) and Algorithm d127
  (6 turns), both "It got away." Codex counters: Reunion — novelty
  ("do something you've never done"); Algorithm — unpredictability
  ("be unpredictable... lose on purpose"). Neither fight shows a
  counter being played — the monsters left, the party watched.
- **vFlee (6, all 88066):** Suburb ×2, Influencer, Algorithm ×2,
  Eater — every one with gotAway=true (party fled AND monster left).
  The Suburb pair are DESIGNED WINS, not breaks: the transcript
  shows the deliberate walk-out — "You walk past the last streetlight
  and don't look back. Behind you, the suburb exhales — a whole zip
  code sighing. (ESCAPED. Routed, no loot, no mortgage.)" The
  census's vFlee bucket conflates designed escapes (suburb LEAVE)
  with party breaks; r52 should split vFlee by the escape line
  (ESCAPED / BARRIER CROSSED vs bare fled flag). The other four
  vFlee fights read as genuine breaks (no escape line in the sampled
  slices — the influencer/algorithm/eater fights end with the party
  leaving, not with a counter played).
- **vDie (5):** all arena deaths, all named above. Bravery's price is
  visible and now attributable.
- **Damage reality (88066 suburb slice):** companion hits land at
  4–48 vs 1300–1500 HP pools across 5 rounds. A kill needs ~20 such
  rounds — which is why the killable wave-4s (Influencer 850–1050)
  kill in 9 turns with a strong party, and why the conceptual
  wave-4s (suburb/strike, unkillable by design) must not be judged
  on kills at all.

## ENCOUNTER SUPPLY (M9 — the mechanism, named)

The boundary rule, from `src/js/game.js:12044` (ONE MONSTER PER TILE,
break-it travel r7): when you cross a boundary, a following monster
(`mdef.follows`) chases you — but NOT onto a tile that already holds
a monster, and NOT onto a safe tile (Haven). It holds at the
boundary, still on your trail, and tries again next crossing. "Something
else is already here" is tile occupancy, not a queue or a cap.

- 94 boundary blocks recorded across 7 seeds; 12 are TRUE wave-4
  blocks (rawName-verified: Reunion 88062 ×1, 88063 ×2, 88066 ×1,
  88067 ×1; Algorithm 88064 ×1, 88066 ×2; Herald 88066 ×1, 88067 ×1;
  Eater 88066 ×2).
- The other 82 blocks are wave ≤3 monsters (Hushpuppy, Dustboar,
  Ugly Beast, Big Big, Callback...) — the slot is almost always
  occupied by a lesser monster first.
- Wave-4 supply is NOT the problem: wave-4s arrive and follow (they
  get blocked, and they also get through — 88066 fought 8, 88067
  fought 6). r50's 88056 "unlocked but unmet" is now explained as:
  the wave-4 arrived, was held at boundaries repeatedly (occupied
  tiles / Haven safe law), and never got a free tile during its
  window. Contention, not scarcity.
- Disclosure: the 6-line lookback can misattribute when the boundary
  line itself names a lesser monster but a wave-4 name appeared in
  the prior 6 lines (one 'Big Thing' line counted as Herald in the
  raw tally). The 12-count above uses rawName (the boundary line
  itself) only; the 94-count is the raw tally.

## VILLAGE ASSESSMENT (plain words)

- **88061 — village-lost d82.** Starved: pantry 0 at the end,
  starvation deaths d8/d67, arena and wound deaths between. One
  person left. Never unlocked wave 4, never saw the table.
- **88062 — 5 alive, won beloved/light.** The small village that
  fought 5 wave-4s the census couldn't see, sat on the hp guard
  (bearer low), won by naming the unfilmed villages and the dead.
  "You spend it all — the love, the light, the finale slot — on
  people the cameras never found."
- **88063 — 2 alive, survived, no seat.** The long village (178
  days): fought one census fight (eulogy, lost Addison Rosenberg in
  the arena), priced and WITHDRAWN — standing 120, best seat none.
  The table came and left on the food-thesis deeds (see above).
- **88064 — 8 alive, won relay/dark (control).** The dark control
  fires clean again: pods opened like a barracks, the village quiet,
  merge final ("No champion, no voice — just us... The food
  conversions fade"), outshone by Sierra Kamara.
- **88065 — village-lost d55.** Starved early (pantry 0, starvation
  d7/d54), never unlocked wave 4.
- **88066 — 7 alive, survived, no seat.** The fighting village
  that never sat: 8 census fights, 0 kills, standing 199 (one short
  of the 200 the full-seat road wants), food shared 354 — the most
  generous village of the run, priced and WITHDRAWN (the reactor
  pellet voids its feast/surge deeds — see above). Armor without a
  seat, and the seat's absence is priced, not silent.
- **88067 — 8 alive, won witness/light.** The village that killed
  and bled in two days (d84–85: one influencer killed, four villagers
  lost in reunion arena fights), then sat and read the charges.
  Sam Wilson's kill and death are the same day's story.
- Who leads: the bearer, always — no succession this run. Who is
  miserable: the starved villages (88061, 88065) and the bled one
  (88067's reunion days). What is missing: living veterans (0/6
  again); a census that sees daily-round fights; and — for reactor
  bearers — any path back to the food-thesis deeds (the withdrawal
  beat names the problem but the run offers no remedy short of the
  mantle passing).

## PEOPLE CHECK (SENSE-TESTING LAW — full reads)

1. **The witness final (88067, full window).** The audit prices
   honestly ("3 wave-4 fought, 11 contests survived, 3 crises
   weathered... 0 weeks kept waiting, 1 of Haven lost meanwhile.
   Every door's standing −3"), names Sam's kill and the veteran bars
   (0 of 1, 0 of 2) even at zero. The trial beats cohere (prosecutor
   with a reserve, let them speak, refuse the quiet, read the
   charges, judges flinch). The Architect beat (Grace Obi ascended
   through relay doors) and the Oversight coda land. PASS.
2. **The dark merge (88064, full window).** The pods offer ("children
   adapt SO fast... You were already thinking it"), Sierra's and
   Vivian's witness beats (brother/mother in the row, "will remember
   the exact shape of your hand"), the village's silence, "The System
   is delighted. That's the worst part." The merge completes ("The
   food conversions fade (you don't eat anymore...)") and the
   outshone beat (Sierra Kamara acted while you watched) is honest.
   PASS.
3. **The beloved final (88062, full window).** "Silas tells the truth
   — the unproduced kind. The audience weeps in eleven dimensions."
   "You spend it all... on people the cameras never found. You name
   the unfilmed villages. You name the dead." Final "Speak for the
   quiet ones" resolves. PASS.
- 0 senseless flags. No fabricated shared history in the read
  passages. Wart (observation, not filed): the audit's war-path line
  veils the influencer kill as "The Ugly Thing" — knowledge-gating by
  design, but a reader comparing audit to census must know the veil
  exists.

## BLANKS

- FILLED (instrument): fight-causal death attribution — 5/5 dieFlag
  fights carry named deaths by tbfight identity; both death channels
  recorded + deduped; 0 wrap errors.
- FILLED (probe bug, found live): the arrival-name bug — the original
  recorder scanned only lines BEFORE the boundary line, but the
  monster's name is IN the boundary line itself; every pre-fix
  arrival read monster=null. Fixed (line itself + 6 prior lines +
  rawName); the 88061/88065 files were re-run on fixed code.
- FILLED (mechanism, code-read): the boundary rule (ONE MONSTER PER
  TILE + Haven safe law) — supply is contention, not scarcity.
- DOCUMENTED (instrument gap, r52's work): the daily-round blind
  spot — `finishLiveFight` bypasses `policy.fight`, so the census
  misses daily-round fights (88062: 5 facings, 0 census fights).
  Fix: engine-level census (startCombat/tbEnd hooks) or a daily
  boundary record. Until then, quote census numbers only for the
  driveFights-driven class.
- DOCUMENTED (instrument gap, r52's work): split vFlee by escape
  line (designed ESCAPED/BARRIER exits vs party breaks) — the suburb
  pair proves the bucket conflates them.
- DOCUMENTED (instrument gap, r52's work): withdrawal detector —
  the probe's announce flag misses table visits that end in
  withdrawal (88063/88066: announceDay null, withdrawal beat
  present). Match the withdrawal line in capture and count visits,
  not just announcements; rename the analyzer's reactor-honesty
  clause to withdrawal.
- DOCUMENTED (road question, carried): keeping killers alive — the
  veteran bar now fails on survival (Sam Wilson), not on killing.
  And the unannounced survivors (88063 d178, 88066 standing 199):
  why does the table not come to villages that endure?

## Metric review (§14)

1. **M1's restatement held, with a correction** — 7/7 with
   honest-death used twice (88061, 88065) and the withdrawal beat
   used twice (88063, 88066). The analyzer's clause is NAMED
   reactor-honesty (it matches /PELLET HUMS/), but the mechanism it
   caught is the table's withdrawal beat — the note corrects the
   name here. Note for the next run: rename the clause to
   withdrawal, print the matched line, and add a withdrawal
   detector so visits are counted even when announceDay stays
   null. Keep with those fixes.
2. **M2's second clause is the honest failure again** (1/3 Arm A) —
   and this run diagnoses WHY instead of just counting it: the class
   undercovers. Do not re-score coverage as road coverage, and do
   not quote r50/r51 distributions as all-fights distributions.
3. **M2b's GO is the run's instrument win** — but its content
   reframes the question: the causal deaths are arena deaths. The
   next run's M2b should also record the fight's CONTEXT (arena vs
   field) as a first-class field, not just the cause string.
4. **M3's 1-vs-0 is GO as written and thin as stated** — one kill
   does not prove the variant converts; it proves conversion is
   possible on this arm. Next run keeps M3 as written.
5. **M3b/M4 stay binding and unmet** — 0/6 on both, sixth straight
   run at zero living veterans (r46–r51), now with a kill on the
   board and the killer dead. The streak's story changed: from
   "nothing dies" to "the killer dies."
6. **Telemetry deviation check:** tool reports LOUD on both metrics
   (see below). VERDICT: EXPLAINED (guard-ended windows, penalties
   0–11), baseline NOT rolled. Tool quirk noted: the baseline's
   satPenalty.penalty=91 reads as baseline 0 (dotted key not
   resolved); the current 18 = sum of tier+losses+penalty fields
   (14+4), not penalties alone.
7. **Balanced panel (§15):** no panel comparison applies — zero
   src/js changes, no lever moved on the default path (NOWALKIN
   default off, census + wrappers are read-only instrumentation).
   The comparison is r50→r51 via identical substrate plus
   attribution, and Arm A→Arm B on one variable. The DET proof
   (wrapped == pure, byte-identical) is the default-off evidence.

## Regressions / checks

- PILOT (88061 Arm A + 88065 Arm B, 180d sweep mode): BOTH
  village-lost pre-window, zero census fights — pilot gate FAILED
  on its terms. Pilot extension (88062 + 88066, still pilot scale,
  not the sweep): 88062 won beloved, 88066 recorded 8 census fights
  — gate satisfied, sweep justified. The extension is recorded here
  as a pilot extension, not a gate violation: the gate forbids
  burning the 7-seed sweep on nulls, and no sweep ran until a pilot
  seed recorded a fight.
- DET (instrument-on twice, 2x120d, seed 88061, final probe code):
  GREEN byte-identical.
- FID (env unset: wrapped == pure capable+deedhunt, mini
  gameDays/won/alive/pantry): GREEN byte-identical (106d, won true,
  alive 8, pantry 13345 both sides).
- Existing suites: check.js --quick — DONE 279 passed, 8 failed in
  710s (log evidence/2026-10-25/journey-endgame-r51-check-quick.log).
  The 8 failures are exactly r50's standing set, all pre-existing:
  hide-discovery, measurement-comparison, measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, parity-20261014. No new regressions; the run
  changed no src/js.

## Telemetry deviation check (2026-10-25)

- Tool verdict: LOUD on both metrics (7 files, 2 metrics).
  - maxTier: baseline 16 -> current 2 (−87%).
  - satPenalty: baseline 0 (tool parse quirk, see metric review)
    -> current 18 (sum of tier+losses+penalty fields).
- Per-seed reading: maxTier max 2 (88062), penalties 0–11
  (88062: 11, 88067: 3, 88064: 0) — the same guard-ended population
  as r48/r49/r50, NOT long-deferral sits. VERDICT: EXPLAINED;
  baseline NOT rolled.

## Evidence

- evidence/2026-10-25/journey-endgame-r51.md (this note)
- evidence/2026-10-25/journey-endgame-r51-prereg.md
- evidence/2026-10-25/perseed-endgame-r51/endgame-r51-{88061..88067}.json
- evidence/2026-10-25/perseed-endgame-r51/endgame-r51-{88061..88067}-transcript.txt
- evidence/2026-10-25/journey-endgame-r51-check-quick.log
- scripts/probe-endgame-r51-20261025.js
- scripts/analyze-endgame-r51-20261025.js
- scripts/policies/capable.js (unchanged — NOWALKIN_W4 rule from r50,
  env-gated, default off; no src/js changes this run)
